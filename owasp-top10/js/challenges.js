/* OWASP Top 10 教學關卡資料 — 全部為原創撰寫的教學情境與模擬資料。
   設計理念：每一關兩階段 ——（1）在瀏覽器內的安全模擬中「重現」弱點，
   （2）閱讀示意用的脆弱程式碼，指出問題行並挑出正確修法後重新驗證。
   所有資料皆為假資料，不連線任何真實系統、不執行任何真實指令。 */
(function () {
  "use strict";

  // phase1 的三種互動型態：
  //   input  — 輸入字串，命中 test(value) 即重現弱點
  //   choose — 從 options 中點選，索引等於 answer 即正確
  //   action — 單一按鈕，點擊即示範該弱點（說明其成因）
  window.CHALLENGES = [
    {
      code: "A01", slug: "a01", nm: "Broken Access Control", en: "存取控制失效",
      goal: "改掉查詢編號，讀出別人（管理員）的私密資料",
      scenario: "這是一個「會員資料卡」頁面。登入後它用網址上的 account 編號去撈資料，而你的編號是 <b>1007</b>。問題是：後端只看編號、不檢查這張卡是不是你本人的。",
      example: "試著把編號改成別人的，例如管理員 <code>1000</code>。因為伺服器沒有驗證「這筆資料屬不屬於你」，就會把不是你的資料也交出來（這類問題稱為 IDOR / 越權存取）。",
      phase1: {
        type: "input", label: "account 編號", placeholder: "1007",
        chips: ["1007", "1000", "1001"],
        test: function (v) { return v.trim() === "1000"; },
        onFail: function (v) {
          if (/^\d+$/.test(v.trim()) && v.trim() !== "1007") return { note: "查無此編號，或這不是會暴露秘密的帳號，再想想誰的權限最高。" };
          return { note: "這是你自己的資料卡，沒什麼特別。換一個別人的編號試試。" };
        },
        leak: "⚠ 伺服器直接回傳了管理員（account 1000）的私密欄位：<br>姓名：系統管理員　內部備註：擁有後台最高權限　緊急聯絡：0912-000-000"
      },
      success: "你靠著竄改編號，讀到了不屬於你的管理員資料——這就是越權存取。",
      codefix: {
        lang: "Node.js / Express", bad: 2,
        lines: [
          "app.get('/api/profile', (req, res) => {",
          "  const id = req.query.account;",
          "  const row = db.getProfileById(id);          // 只用網址編號撈資料",
          "  res.json(row);",
          "});"
        ],
        fixes: [
          ["const row = db.getProfileById(req.session.userId);  // 以登入者身分為準，不信任網址", true],
          ["const id = encodeURIComponent(req.query.account);    // 把編號做 URL 編碼", false],
          ["if (!id) return res.status(400).end();               // 只檢查編號有沒有填", false]
        ]
      }
    },

    {
      code: "A02", slug: "a02", nm: "Security Misconfiguration", en: "安全設定錯誤",
      goal: "找到被放上線的設定／除錯端點，撈出外洩的資料庫密碼",
      scenario: "這台伺服器上線時忘了關掉除錯模式，而且把設定檔放在可被瀏覽的目錄下。試著輸入一個「不該對外開放」的路徑看看。",
      example: "常被誤放上線的檔案或端點，例如 <code>.env</code>、<code>config.php</code>、<code>/debug</code>、<code>/actuator/env</code>。猜一個試試。",
      phase1: {
        type: "input", label: "請求路徑", placeholder: "/",
        chips: ["/about", "/.env", "/debug"],
        test: function (v) { return /\.env|config|debug|actuator|phpinfo/i.test(v); },
        onFail: function () { return { note: "這個路徑只是普通頁面，沒有敏感資料。想想設定檔或除錯端點通常叫什麼。" }; },
        leak: "⚠ 這個端點把整份環境設定都印出來了：<br>DB_HOST=10.0.3.12　DB_USER=app　<b>DB_PASSWORD=S3cr3t-Prod-2024</b>　APP_DEBUG=true"
      },
      success: "你找到了被誤放上線的設定端點，直接讀到正式資料庫密碼——這就是安全設定錯誤。",
      codefix: {
        lang: "設定 / 部署", bad: 1,
        lines: [
          "# app.config",
          "APP_DEBUG = true                 # 正式環境仍開著除錯模式",
          "SERVE_DOTENV = true              # 允許直接提供 .env 等檔案"
        ],
        fixes: [
          ["APP_DEBUG = false  # 正式環境關閉除錯，敏感路徑改用伺服器規則擋掉並移出網站根目錄", true],
          ["APP_DEBUG = true   # 保留除錯但把密碼改長一點", false],
          ["# 在除錯頁面前面加一個簡單密碼就好", false]
        ]
      }
    },

    {
      code: "A03", slug: "a03", nm: "Software Supply Chain Failures", en: "軟體供應鏈失效",
      goal: "從相依套件清單裡挑出被動手腳的那一個",
      scenario: "你的專案要安裝一批相依套件。其中有一個是「名字看起來很像、但其實是仿冒」的惡意套件（typosquatting）。看看你能不能挑出來。",
      example: "注意名稱是不是把常見套件改了一兩個字、版本號是不是很奇怪、或來源不是官方 registry。",
      phase1: {
        type: "choose",
        label: "點選你認為被動過手腳的套件：",
        options: [
          "express@4.19.2  （來源：官方 npm registry）",
          "lodahs@9.9.9  （來源：http://packages.unknown-mirror.cc）",
          "axios@1.7.2  （來源：官方 npm registry）"
        ],
        answer: 1,
        leak: "⚠ 正是這個：<code>lodahs</code> 是 <code>lodash</code> 的仿冒名（typosquat），版本號灌水、來源指向非官方鏡像，安裝腳本會在背景外送環境變數。"
      },
      success: "你認出了仿冒的相依套件——這就是軟體供應鏈攻擊的常見入口。",
      codefix: {
        lang: "套件管理", bad: 1,
        lines: [
          "// package.json",
          "\"lodahs\": \"*\"                      // 名稱打錯、版本不鎖、來源不明",
          "// 安裝時不檢查 lockfile 與完整性雜湊"
        ],
        fixes: [
          ["\"lodash\": \"4.17.21\"  // 用正確名稱、鎖定版本，並以 lockfile + 完整性雜湊(SRI/整合校驗)驗證來源", true],
          ["\"lodahs\": \"latest\"   // 固定抓最新版就好", false],
          ["// 安裝後自己掃一次病毒即可", false]
        ]
      }
    },

    {
      code: "A04", slug: "a04", nm: "Cryptographic Failures", en: "加密機制失效",
      goal: "把外洩資料表裡管理員的弱雜湊還原成明文密碼",
      scenario: "一份外洩的 users 資料表被你拿到了。裡面的密碼是用沒有加鹽的 MD5 存的。管理員的雜湊是 <code>e10adc3949ba59abbe56e057f20f883e</code>。",
      example: "沒加鹽的 MD5 很容易用「彩虹表」反查。下面幾個是最常見的爛密碼，它們的 MD5 早就被公開收錄了。猜猜管理員用了哪一個。",
      phase1: {
        type: "input", label: "還原出的明文密碼", placeholder: "輸入你猜的明文",
        chips: ["password", "123456", "qwerty"],
        test: function (v) { return v.trim() === "123456"; },
        onFail: function () { return { note: "這個明文的 MD5 不等於管理員那串，換一個最常見的試試。" }; },
        leak: "⚠ 命中！<code>MD5('123456') = e10adc3949ba59abbe56e057f20f883e</code>。管理員的明文密碼就是 <b>123456</b>。"
      },
      success: "你用公開彩虹表反查，就還原出管理員的明文密碼——沒加鹽的 MD5 等於沒保護。",
      codefix: {
        lang: "Python", bad: 1,
        lines: [
          "import hashlib",
          "pw_hash = hashlib.md5(password.encode()).hexdigest()   # MD5、無鹽",
          "db.save(user, pw_hash)"
        ],
        fixes: [
          ["pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())  # 改用含鹽、慢雜湊 bcrypt/argon2", true],
          ["pw_hash = hashlib.sha256(password.encode()).hexdigest()      # 換成 SHA-256 就安全", false],
          ["pw_hash = hashlib.md5((password + 'xyz').encode()).hexdigest()  # 加一段固定字串當鹽", false]
        ]
      }
    },

    {
      code: "A05·1", slug: "a05-sqli", nm: "SQL Injection", en: "注入攻擊：SQL",
      goal: "用注入讓一次只該查一筆的查詢吐出整張表",
      scenario: "這是一個「依會員編號查資料」的小工具，它把你輸入的編號<b>原封不動</b>拼進 SQL 字串再執行。",
      example: "在欄位裡輸入 <code>1' OR '1'='1</code>。意思是「編號等於 1，<b>或</b> 1=1」；因為 1=1 永遠成立，WHERE 條件整個失效，資料庫就把整張表都交出來。",
      phase1: {
        type: "sqli", label: "會員編號", placeholder: "1",
        chips: ["1' OR '1'='1", "1' OR 1=1 --", "2"],
        test: function (v) { return /'/.test(v) && (/\bor\b[\s\S]*=/i.test(v) || /--|#/.test(v)); }
      },
      success: "永遠成立的條件讓 WHERE 失效，整張會員表都被撈出來了。",
      codefix: {
        lang: "PHP + SQL", bad: 1,
        lines: [
          "$id  = $_GET['id'];",
          "$sql = \"SELECT name, phone FROM members WHERE id = '\" . $id . \"'\";  // 直接字串拼接",
          "$rows = $db->query($sql);"
        ],
        fixes: [
          ["$stmt = $db->prepare('SELECT name, phone FROM members WHERE id = ?'); $stmt->execute([$id]);  // 參數化查詢", true],
          ["$sql = \"... WHERE id = '\" . addslashes($id) . \"'\";  // 用 addslashes 跳脫引號", false],
          ["$id = htmlspecialchars($id);  // 對輸入做 HTML 編碼", false]
        ]
      }
    },

    {
      code: "A05·2", slug: "a05-cmdi", nm: "Command Injection", en: "注入攻擊：指令",
      goal: "在連線測試工具裡夾帶一個指令，讀出不該讀的檔案",
      scenario: "這是一個「連線測試」工具，後端會用你輸入的主機名稱去組一行系統指令：<code>ping -c1 &lt;你的輸入&gt;</code>，然後丟給 shell 執行。",
      example: "用分號、管線或 <code>&&</code> 串第二個指令，例如 <code>127.0.0.1; cat /etc/passwd</code>。因為輸入被直接塞進 shell 指令字串，分號後面那段也會一起被執行。",
      phase1: {
        type: "input", label: "主機名稱", placeholder: "127.0.0.1",
        chips: ["127.0.0.1", "127.0.0.1; cat /etc/passwd", "localhost && id"],
        test: function (v) { return /[;&|`]|\$\(/.test(v); },
        onFail: function () { return { note: "這只是一般的 ping，沒有夾帶額外指令。試著用 ; 或 && 串第二個指令。" }; },
        leak: "⚠ 分號後的指令也被執行了：<br><code>root:x:0:0:root:/root:/bin/bash</code><br><code>app:x:1001:1001::/home/app:/bin/sh</code>"
      },
      success: "你把額外指令夾進主機名稱，讓系統讀出了設定檔——這就是指令注入。",
      codefix: {
        lang: "Node.js", bad: 1,
        lines: [
          "const host = req.query.host;",
          "exec('ping -c1 ' + host, (e, out) => res.send(out));   // 把輸入塞進 shell 字串",
          ""
        ],
        fixes: [
          ["if(!/^[a-z0-9.-]+$/i.test(host)) return res.status(400).end(); execFile('ping',['-c1',host],cb);  // 白名單字元 + 參數陣列，不經 shell", true],
          ["exec('ping -c1 ' + host.replace(';',''), cb);  // 把分號拿掉就好", false],
          ["exec('ping -c1 \"' + host + '\"', cb);          // 幫輸入加上雙引號", false]
        ]
      }
    },

    {
      code: "A05·3", slug: "a05-xss", nm: "Reflected XSS", en: "注入攻擊：XSS",
      goal: "讓搜尋頁把你輸入的內容當成程式碼，彈出一個視窗",
      scenario: "這個搜尋頁會把你的關鍵字<b>原樣顯示</b>在「您搜尋了：…」後面，而且沒有做任何輸出編碼。",
      example: "輸入 <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> 或 <code>&lt;img src=x onerror=alert(1)&gt;</code>。因為輸入被直接當 HTML 塞進頁面，瀏覽器會把它當成程式碼執行（模擬彈窗）。",
      phase1: {
        type: "input", label: "搜尋關鍵字", placeholder: "輸入關鍵字",
        chips: ["<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "你好"],
        test: function (v) { return /<script|onerror\s*=|onload\s*=|<img/i.test(v); },
        onFail: function (v) { return { note: "您搜尋了：「" + v + "」——只是普通文字，沒有被當成程式碼。" }; },
        leak: "⚠ [模擬彈窗] alert(1) 被觸發了！你的輸入被瀏覽器當成 HTML/JS 執行。"
      },
      success: "沒有做輸出編碼，你的字串就被當成程式碼執行——這就是反射型 XSS。",
      codefix: {
        lang: "JavaScript (前端)", bad: 1,
        lines: [
          "const q = new URLSearchParams(location.search).get('q');",
          "box.innerHTML = '您搜尋了：' + q;     // 直接塞進 innerHTML",
          ""
        ],
        fixes: [
          ["box.textContent = '您搜尋了：' + q;   // 用 textContent（或對輸出做 HTML 編碼）讓內容只當文字", true],
          ["box.innerHTML = '您搜尋了：' + q.trim();   // 先把前後空白去掉", false],
          ["box.innerHTML = '您搜尋了：' + q.replace('<script>','');   // 把 <script> 字樣濾掉", false]
        ]
      }
    },

    {
      code: "A06", slug: "a06", nm: "Insecure Design", en: "不安全設計",
      goal: "利用可被猜到的「安全問題」接管別人的帳號",
      scenario: "這個網站的「忘記密碼」流程，是靠回答一題安全問題：<b>你的生日是哪一天？</b>。偏偏目標使用者的生日在他公開的個人頁上就看得到。",
      example: "目標的公開頁面寫著「生日快樂！1998-05-20 🎂」。把這個日期填進去，就能直接重設他的密碼——問題不在你輸入了什麼，而在這個流程本身設計就不安全。",
      phase1: {
        type: "input", label: "請回答安全問題：你的生日（YYYY-MM-DD）", placeholder: "YYYY-MM-DD",
        chips: ["1998-05-20", "2000-01-01"],
        test: function (v) { return v.trim() === "1998-05-20"; },
        onFail: function () { return { note: "生日不對。提示：看看目標的公開個人頁。" }; },
        leak: "⚠ 驗證通過，密碼重設連結已發給你——你用公開資訊就接管了別人的帳號。"
      },
      success: "靠一個查得到的生日就能重設密碼，問題出在流程設計本身——這是不安全設計。",
      codefix: {
        lang: "帳號復原流程", bad: 1,
        lines: [
          "// 忘記密碼流程",
          "if (answer === user.birthday) allowPasswordReset();   // 用可被猜到的靜態問題當唯一關卡",
          ""
        ],
        fixes: [
          ["sendResetLinkToVerifiedEmail(user); enforceRateLimit();   // 改用寄到已驗證信箱的一次性連結，並限流", true],
          ["if (answer === user.birthday && answer.length === 10) ...  // 多檢查一下格式長度", false],
          ["// 再多問一題：你的寵物名字是什麼", false]
        ]
      }
    },

    {
      code: "A07", slug: "a07", nm: "Authentication Failures", en: "認證失效",
      goal: "在沒有鎖定機制的登入頁猜中管理員的弱密碼",
      scenario: "這個登入頁沒有失敗鎖定、沒有驗證碼、也沒有限流，而管理員用的又是常見弱密碼。你可以一直猜。",
      example: "試幾個最常見的密碼，例如 <code>admin</code>、<code>admin123</code>、<code>password</code>。因為系統不限制嘗試次數，暴力猜測幾乎沒有成本。",
      phase1: {
        type: "input", label: "管理員密碼", placeholder: "輸入密碼嘗試登入",
        chips: ["admin", "password", "admin123"],
        test: function (v) { return v.trim() === "admin123"; },
        onFail: function () { return { note: "登入失敗——但系統沒有鎖定你，可以繼續猜。" }; },
        leak: "⚠ 登入成功！管理員密碼是 <b>admin123</b>。整個過程沒有任何次數限制或警示。"
      },
      success: "沒有鎖定與限流，弱密碼被你猜中——這就是認證機制失效。",
      codefix: {
        lang: "登入後端", bad: 2,
        lines: [
          "function login(user, pw) {",
          "  if (check(user, pw)) return issueSession(user);",
          "  return 'wrong';                 // 失敗就只回錯誤，不計次、不鎖定",
          "}"
        ],
        fixes: [
          ["recordFail(user); if (fails(user) > 5) lockFor(user, '15m'); // 計算失敗次數並鎖定，再搭配強密碼政策與 MFA", true],
          ["return 'wrong, try again later';   // 把錯誤訊息講得客氣一點", false],
          ["sleep(100); return 'wrong';        // 每次失敗固定延遲 100ms", false]
        ]
      }
    },

    {
      code: "A08", slug: "a08", nm: "Software or Data Integrity Failures", en: "軟體或資料完整性失效",
      goal: "示範自動更新器會安裝沒有驗證簽章的更新檔",
      scenario: "這個應用內建自動更新器，會從更新伺服器下載 <code>update.zip</code> 然後直接安裝，<b>完全沒有驗證數位簽章或雜湊</b>。假設攻擊者已能攔截下載內容。",
      example: "按下按鈕，模擬把下載中的更新檔換成被植入後門的版本。因為更新器不檢查簽章，被竄改的檔也會照裝不誤。",
      phase1: {
        type: "action", label: "推送一個被竄改的更新檔", button: "模擬：替換並安裝 update.zip",
        leak: "⚠ 更新器沒有驗證簽章，直接安裝了被竄改的 update.zip（內含後門）。攻擊者的程式碼已在你的應用中執行。"
      },
      success: "更新器不驗證完整性，被換過的更新檔照裝——這就是軟體／資料完整性失效。",
      codefix: {
        lang: "更新器", bad: 1,
        lines: [
          "const pkg = download(UPDATE_URL);",
          "install(pkg);                      // 下載完直接安裝，不驗證來源與完整性",
          ""
        ],
        fixes: [
          ["if (!verifySignature(pkg, publisherPublicKey)) throw Error('bad signature'); install(pkg);  // 先以發行者公鑰驗簽再安裝", true],
          ["if (pkg.size > 0) install(pkg);    // 確認檔案不是空的就好", false],
          ["if (UPDATE_URL.startsWith('https')) install(pkg);  // 只要是 https 下載就信任", false]
        ]
      }
    },

    {
      code: "A09", slug: "a09", nm: "Security Logging and Alerting Failures", en: "安全記錄與警示失效",
      goal: "示範大量登入失敗後，系統卻沒有任何記錄或告警",
      scenario: "有人正在對後台帳號做密碼噴灑（password spraying）。問題是：這套系統根本沒有記錄登入失敗，也沒有任何告警。",
      example: "按下按鈕模擬 100 次登入失敗，看看伺服器日誌——你會發現一片空白，沒人會知道正在被攻擊。",
      phase1: {
        type: "action", label: "模擬攻擊", button: "對後台連續嘗試 100 次登入失敗",
        leak: "⚠ 已模擬 100 次登入失敗。伺服器日誌：<code>（空）</code>，告警：<code>無</code>。攻擊完全無聲無息，事後也無從調查。"
      },
      success: "大量失敗卻毫無記錄與告警，攻擊無聲無息——這就是記錄與警示失效。",
      codefix: {
        lang: "登入後端", bad: 2,
        lines: [
          "function login(user, pw) {",
          "  if (check(user, pw)) return ok();",
          "  return fail();                    // 失敗了什麼都不記、也不通知",
          "}"
        ],
        fixes: [
          ["logger.warn('login_fail', {user, ip, ts}); alertIfSpike(ip); return fail();  // 記錄失敗事件，異常暴增時告警", true],
          ["console.log('fail'); return fail();   // 印一行到終端機就好", false],
          ["return fail();  // 交給前端自己記錄", false]
        ]
      }
    },

    {
      code: "A10", slug: "a10", nm: "Mishandling of Exceptional Conditions", en: "例外處理不當",
      goal: "送出壞資料讓程式崩潰，把含有機密的錯誤堆疊噴回畫面",
      scenario: "這是一個「轉帳金額」欄位，後端預期收到數字。但它沒有做輸入驗證，遇到不合法的值就讓例外往上拋，並把完整錯誤堆疊直接回傳給使用者。",
      example: "在金額欄位填進非數字，例如 <code>abc</code> 或 <code>'; DROP</code>。程式會崩潰，並把含有資料庫連線字串等機密的錯誤堆疊一併吐出來。",
      phase1: {
        type: "input", label: "轉帳金額", placeholder: "輸入金額",
        chips: ["abc", "'; DROP", "100"],
        test: function (v) { return v.trim() !== "" && !/^\d+(\.\d+)?$/.test(v.trim()); },
        onFail: function () { return { note: "這是合法的數字，程式正常處理，不會崩潰。試試看非數字的值。" }; },
        leak: "⚠ 未處理的例外把完整堆疊噴回來了：<br><code>NumberFormatException at TransferService.java:42</code><br><code>DB_URL=jdbc:mysql://10.0.3.12/bank?user=app&password=S3cr3t</code>"
      },
      success: "壞輸入讓程式崩潰、把含機密的堆疊吐回畫面——這就是例外處理不當。",
      codefix: {
        lang: "Java", bad: 1,
        lines: [
          "int amount = Integer.parseInt(req.get(\"amount\"));  // 不驗證、也不接例外",
          "// ...若拋出例外，框架把完整堆疊回傳給使用者",
          ""
        ],
        fixes: [
          ["if(!amount.matches(\"\\\\d+\")) return badRequest(); try{...}catch(Exception e){log(e); return genericError();}  // 先驗證輸入，再攔例外只回一般訊息", true],
          ["int amount = Integer.parseInt(req.get(\"amount\").trim());  // 先去掉空白再轉", false],
          ["// 在畫面上把錯誤字體改小一點", false]
        ]
      }
    }
  ];
})();
