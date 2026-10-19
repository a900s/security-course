/* SQL Injection 教學關卡。情境沿用原本實驗室的六種型態，改成跟 OWASP 一樣的兩階段關卡。
   全部是瀏覽器內的假資料模擬，不連線真實資料庫。 */
(function () {
  "use strict";
  function hit(v) { return /'/.test(v) && (/\bor\b/i.test(v) || /--|#/.test(v)); }
  window.CHALLENGES = [
    {
      code: "S01", slug: "cause", nm: "資料與指令沒分開", en: "注入成因",
      goal: "讓查詢條件永遠成立，一次看到整張表",
      scenario: "會員搜尋把你打的名字直接拼進 SQL：WHERE name = '你的輸入'。資料庫分不出哪些字是名字、哪些字是語法。",
      example: "輸入 ' OR '1'='1。意思是「名字等於空，或 1=1」。1=1 永遠成立，過濾就失效了。",
      phase1: {
        type: "input", label: "會員名字", placeholder: "王小明",
        chips: ["王小明", "' OR '1'='1", "1' OR 1=1 --"],
        test: function (v) { return hit(v); },
        onFail: function () { return { note: "這只是在找一個名字。試著讓 WHERE 條件永遠成立。" }; },
        leak: "⚠ 回傳整張會員表：1 王小明、2 陳大華、3 林美玲、1000 系統管理員。條件已被改成永遠成立。"
      },
      success: "永遠成立的條件讓過濾失效，不該一次看到的資料都被交出來了。",
      codefix: {
        lang: "PHP + SQL", bad: 1,
        lines: [
          "$name = $_GET['name'];",
          "$sql = \"SELECT id, name FROM members WHERE name = '\" . $name . \"'\";",
          "$rows = $db->query($sql);"
        ],
        fixes: [
          ["$stmt = $db->prepare('SELECT id, name FROM members WHERE name = ?'); $stmt->execute([$name]);", true],
          ["$sql = \"... WHERE name = '\" . addslashes($name) . \"'\";", false],
          ["$name = htmlspecialchars($name);", false]
        ]
      }
    },
    {
      code: "S02", slug: "login", nm: "登入繞過", en: "Login Bypass",
      goal: "讓登入查詢不再核對密碼",
      scenario: "登入把帳號直接拼進 WHERE username = '輸入' AND password = '...'。註解可以砍掉後面的密碼比對。",
      example: "帳號欄輸入 admin' --。-- 後面的密碼條件變成註解，查詢只剩「找 admin」。",
      phase1: {
        type: "input", label: "帳號", placeholder: "student",
        chips: ["student", "admin' --", "' OR '1'='1"],
        test: function (v) { return /admin'\s*--/i.test(v) || hit(v); },
        onFail: function () { return { note: "這是正常帳號，密碼比對還在。試著把後面的條件變成註解，或讓條件永遠成立。" }; },
        leak: "⚠ 模擬登入成功，而且沒有核對密碼。查詢被改成只找 admin，或條件永遠為真。"
      },
      success: "密碼比對被拿掉或變成永遠成立，這就是登入繞過。",
      codefix: {
        lang: "SQL", bad: 1,
        lines: [
          "user = request.form['username']",
          "sql = \"SELECT id FROM users WHERE username = '\" + user + \"' AND password = '\" + pw + \"'\"",
          "row = db.query(sql)"
        ],
        fixes: [
          ["sql = 'SELECT id FROM users WHERE username = ? AND password_hash = ?'; row = db.query(sql, [user, hashed])", true],
          ["user = user.replace(\"'\", \"\")", false],
          ["sql = sql.upper()", false]
        ]
      }
    },
    {
      code: "S03", slug: "union", nm: "UNION 合併查詢", en: "UNION-based",
      goal: "把另一張表的欄位併進原本的查詢結果",
      scenario: "商品搜尋只該回傳名稱。查詢是字串拼接，所以可以再接一段 UNION SELECT，把別張表的欄位一起送回來。",
      example: "輸入 ' UNION SELECT username, password FROM users --。欄位數要和原本的查詢對得上，這是教學用的假結果。",
      phase1: {
        type: "input", label: "商品名稱", placeholder: "筆電",
        chips: ["筆電", "' UNION SELECT username, password FROM users --"],
        test: function (v) { return /union/i.test(v) && /select/i.test(v); },
        onFail: function () { return { note: "這只查到商品。試著用 UNION 再接一段 SELECT。" }; },
        leak: "⚠ 結果多了不該出現的欄位（假資料）：admin / 模擬雜湊、wang / 模擬雜湊。"
      },
      success: "UNION 把另一張表的欄位併進來了。參數化查詢會讓這整段只被當成商品名稱。",
      codefix: {
        lang: "SQL", bad: 1,
        lines: [
          "name = request.args['q']",
          "sql = \"SELECT id, name FROM products WHERE name = '\" + name + \"'\"",
          "return db.query(sql)"
        ],
        fixes: [
          ["sql = 'SELECT id, name FROM products WHERE name = ?'; return db.query(sql, [name])", true],
          ["if 'UNION' in name.upper(): name = ''", false],
          ["sql = sql.replace('SELECT', '')", false]
        ]
      }
    },
    {
      code: "S04", slug: "blind", nm: "布林盲注", en: "Boolean Blind",
      goal: "比較「條件成立」和「不成立」時，頁面回應是否不同",
      scenario: "這個頁面不直接印出資料，但條件成立時說「有這筆」，不成立時說「沒有」。回應不同，就能當 0 和 1 的訊號。",
      example: "分別試 ' AND 1=1 -- 與 ' AND 1=2 --。1=1 永遠真、1=2 永遠假。若兩次回應不一樣，就代表看得到條件結果。",
      phase1: {
        type: "input", label: "查詢條件", placeholder: "1",
        chips: ["' AND 1=1 --", "' AND 1=2 --"],
        test: function (v) { return /1\s*=\s*1/.test(v) || /1\s*=\s*2/.test(v); },
        onFail: function () { return { note: "試著送一個永遠為真、和一個永遠為假的條件，比較回應。" }; },
        leak: "⚠ 1=1 時頁面說「有這筆資料」，1=2 時說「查無資料」。回應不同就是訊號，可以逐位推測。"
      },
      success: "頁面把條件真假洩漏成兩種回應。修掉之後，兩種輸入都只會得到同一種「查無」結果。",
      codefix: {
        lang: "SQL", bad: 1,
        lines: [
          "id = request.args['id']",
          "sql = \"SELECT 1 FROM items WHERE id = '\" + id + \"'\"",
          "return '有這筆' if db.query(sql) else '沒有'"
        ],
        fixes: [
          ["sql = 'SELECT 1 FROM items WHERE id = ?'; return '有這筆' if db.query(sql, [id]) else '沒有'", true],
          ["return '有這筆'   # 兩種情況都回同一句，但查詢仍是拼接", false],
          ["id = id.replace('AND', '')", false]
        ]
      }
    },
    {
      code: "S05", slug: "time", nm: "時間盲注", en: "Time-based",
      goal: "看出「條件成立時故意延遲」也被當成訊號",
      scenario: "連頁面內容都沒有差異時，仍可能用資料庫延遲來傳 0 和 1。本關只做示意，不會真的等待。",
      example: "輸入含 SLEEP 的教學字串。看到「被標成延遲」就代表條件成立時，時間本身變成了訊號。",
      phase1: {
        type: "input", label: "測試輸入", placeholder: "1",
        chips: ["1", "' AND SLEEP(3) --"],
        test: function (v) { return /sleep\s*\(/i.test(v); },
        onFail: function () { return { note: "這次沒有延遲訊號。試一個會讓資料庫在條件成立時等待的寫法（只是示意）。" }; },
        leak: "⚠ （示意，沒有真的等待）回應被標成延遲了數秒，代表條件成立。時間差就是 0/1 訊號。"
      },
      success: "延遲被拿來當訊號。參數化之後，SLEEP 只是一段普通文字，不會被執行。",
      codefix: {
        lang: "SQL", bad: 1,
        lines: [
          "q = request.args['q']",
          "sql = \"SELECT name FROM products WHERE name = '\" + q + \"'\"",
          "return db.query(sql)"
        ],
        fixes: [
          ["sql = 'SELECT name FROM products WHERE name = ?'; return db.query(sql, [q])", true],
          ["time.sleep(0)  # 把延遲拿掉就安全", false],
          ["q = q.lower()", false]
        ]
      }
    },
    {
      code: "S06", slug: "id", nm: "ID 參數", en: "型別檢查",
      goal: "讓原本只查一個整數編號的條件被放寬",
      scenario: "網址 ?id=15 會被拼進 WHERE id = 15。如果程式沒有先確認它是整數，後面就可以再接別的條件。",
      example: "15 只會查到一筆。試 15 OR 1=1，條件就不再只比對這個編號。",
      phase1: {
        type: "input", label: "id", placeholder: "15",
        chips: ["15", "15 OR 1=1"],
        test: function (v) { return /\bor\b/i.test(v) || /'/.test(v); },
        onFail: function () { return { note: "這是正常編號，只回一筆。試著讓條件不再只比對這個整數。" }; },
        leak: "⚠ 編號沒被檢查成整數，條件被放寬，多筆資料被一起回傳。"
      },
      success: "id 必須在伺服器端確認是整數，再用參數帶進去。",
      codefix: {
        lang: "Python", bad: 1,
        lines: [
          "id = request.args['id']",
          "sql = 'SELECT * FROM users WHERE id = ' + id",
          "return db.query(sql)"
        ],
        fixes: [
          ["id = int(request.args['id']); sql = 'SELECT * FROM users WHERE id = ?'; return db.query(sql, [id])", true],
          ["sql = 'SELECT * FROM users WHERE id = ' + id.strip()", false],
          ["if len(id) < 8: return db.query(sql)", false]
        ]
      }
    },
    {
      code: "S07", slug: "orderby", nm: "ORDER BY 白名單", en: "識別字不是值",
      goal: "送一個不在允許清單裡的排序欄位",
      scenario: "排序欄位是 SQL 的結構（識別字），不能用參數綁定。若直接拼接，欄位名本身就能改寫查詢。",
      example: "name、email、created_at 是合法欄位。試 (SELECT 1)，它不在白名單裡。",
      phase1: {
        type: "input", label: "排序欄位", placeholder: "name",
        chips: ["name", "email", "(SELECT 1)"],
        test: function (v) { return ["name", "email", "created_at"].indexOf(String(v).trim()) < 0 && String(v).trim() !== ""; },
        onFail: function () { return { note: "這是合法欄位，排序正常。試一個不在白名單裡的輸入。" }; },
        leak: "⚠ 欄位名被直接拼進 ORDER BY，查詢結構被改掉。"
      },
      success: "識別字要用固定的允許清單，不能靠參數化，也不能靠黑名單刪關鍵字。",
      codefix: {
        lang: "JavaScript", bad: 1,
        lines: [
          "const sortBy = req.query.sort;",
          "const sql = `SELECT * FROM users ORDER BY ${sortBy}`;",
          "return db.query(sql);"
        ],
        fixes: [
          ["const ALLOWED = ['name', 'email', 'created_at']; if (!ALLOWED.includes(sortBy)) throw new Error('bad sort'); const sql = `SELECT * FROM users ORDER BY ${sortBy}`;", true],
          ["const sql = 'SELECT * FROM users ORDER BY ?'; return db.query(sql, [sortBy]);", false],
          ["const sql = `SELECT * FROM users ORDER BY ${sortBy.replace('SELECT', '')}`;", false]
        ]
      }
    },
    {
      code: "S08", slug: "param", nm: "參數化查詢", en: "資料與結構分開",
      goal: "再用一次拼接漏洞，然後改成佔位符",
      scenario: "程式寫成 WHERE name = '\" + username + \"'。單引號可以提前結束字串，後面的字就變成語法。",
      example: "輸入 ' OR '1'='1。修法不是刪掉單引號，而是讓 SQL 結構先固定，輸入只當參數。",
      phase1: {
        type: "input", label: "username", placeholder: "wang",
        chips: ["wang", "' OR '1'='1"],
        test: function (v) { return hit(v); },
        onFail: function () { return { note: "這次輸入還被當成一個名字。試著用引號改變條件。" }; },
        leak: "⚠ 引號提前結束了字串，後面的 OR 變成了條件，查詢語意被改掉。"
      },
      success: "?、%s、:u 都是佔位符：語句先固定，輸入再綁定，不會變成語法。",
      codefix: {
        lang: "多種語言", bad: 1,
        lines: [
          "username = form['username']",
          "sql = \"SELECT id FROM users WHERE name = '\" + username + \"'\"",
          "db.query(sql)"
        ],
        fixes: [
          ["db.query('SELECT id FROM users WHERE name = ?', [username])  # ? / %s / :u 都是先固定結構再綁值", true],
          ["db.query(sql.replace(\"'\", \"''\"))", false],
          ["db.query(html.escape(sql))", false]
        ]
      }
    },
    {
      code: "S09", slug: "waf", nm: "WAF 不是唯一防線", en: "可被變形繞過",
      goal: "看一個明顯樣式被攔截，再用變形通過簡易規則",
      scenario: "這台示意用的 WAF 會擋掉 OR 1=1、UNION SELECT、SLEEP(。規則寫死的樣式擋不住拆開或換寫法的輸入。",
      example: "先試 ' OR 1=1 --，會被攔截。再試 '+OR+'1'='1 或 UN/**/ION SELECT，關鍵字被拆開，簡易規則沒認出來。",
      phase1: {
        type: "input", label: "測試輸入", placeholder: "",
        chips: ["' OR 1=1 --", "UNION SELECT", "'+OR+'1'='1", "UN/**/ION SELECT"],
        test: function (v) {
          var blocked = /or\s+1\s*=\s*1|union\s+select|sleep\s*\(/i.test(v);
          var tricky = /\/\*|'\s*\+/.test(v);
          return tricky && !blocked;
        },
        onFail: function (v) {
          if (/or\s+1\s*=\s*1|union\s+select|sleep\s*\(/i.test(v)) return { note: "WAF 攔截了這個明顯樣式。試著用註解或串接把關鍵字拆開。" };
          return { note: "還沒繞過。試一個不像標準關鍵字、但仍改寫語意的輸入。" };
        },
        leak: "⚠ 變形後的輸入沒被簡易 WAF 攔下，查詢語意仍被改寫。WAF 只能當輔助，不能取代參數化查詢。"
      },
      success: "規則擋得住教材上的樣式，擋不住變形。真正的修法仍是參數化查詢。",
      codefix: {
        lang: "防禦分層", bad: 1,
        lines: [
          "user = request.form['user']",
          "if waf.allow(user): db.query(\"SELECT * FROM users WHERE name = '\" + user + \"'\")",
          ""
        ],
        fixes: [
          ["db.query('SELECT * FROM users WHERE name = ?', [user])  # WAF 可留作額外告警，但不能當唯一防線", true],
          ["waf.add_rule('block quotes')", false],
          ["user = user.upper()", false]
        ]
      }
    },
    {
      code: "S10", slug: "layers", nm: "縱深防禦", en: "最小權限與記錄",
      goal: "挑出真正算多層、而不是只靠單一措施的作法",
      scenario: "參數化是核心。就算查詢被寫對了，資料庫帳號權限太大、錯誤訊息太詳細、沒有紀錄，被打中時的傷害還是很大。",
      example: "比較三組作法：只加 WAF、把錯誤藏起來、以及參數化加上最小權限、一般化錯誤和記錄告警。",
      phase1: {
        type: "choose",
        label: "哪一組才算縱深防禦？",
        options: [
          "只加一台 WAF，程式維持字串拼接",
          "參數化查詢，加上最小權限、一般化錯誤與記錄告警",
          "把資料庫錯誤訊息藏起來就夠了"
        ],
        answer: 1,
        wrong: "單一措施擋不住，也無法在事後知道發生了什麼。",
        leak: "⚠ 參數化讓輸入變不成語法；最小權限縮小傷害；一般化錯誤不把結構洩漏出去；紀錄用來事後追查。"
      },
      success: "核心修補加上權限、錯誤處理和紀錄，才是這一關要留下的作法。",
      codefix: {
        lang: "資料庫帳號", bad: 1,
        lines: [
          "# app database account",
          "GRANT ALL ON *.* TO 'app'@'%'   # 應用程式用的帳號擁有全部權限",
          "ON ERROR SHOW FULL MESSAGE TO USER"
        ],
        fixes: [
          ["GRANT SELECT, INSERT ON appdb.users TO 'app'@'app-host'  # 只給必要權限；錯誤只寫日誌，頁面顯示一般訊息", true],
          ["GRANT ALL ON *.* TO 'app'@'%' IDENTIFIED BY 'longer-password'", false],
          ["ON ERROR SHOW NOTHING  # 只把錯誤藏起來，帳號權限不變", false]
        ]
      }
    }
  ];
})();
