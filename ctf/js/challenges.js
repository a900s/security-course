(function () {
  "use strict";
  window.CHALLENGES = [
    {
      code: "C01", slug: "c01", nm: "預設帳號", en: "FLAG{default-admin}",
      goal: "找出還開著預設帳號的後台",
      scenario: "示範用的管理頁有三個帳號。其中一個是出廠就有、而且沒有改過的。",
      example: "預設帳號通常名字就叫 admin，密碼也是文件上的那組。",
      phase1: {
        type: "choose",
        label: "哪一個是該被關掉的預設帳號？",
        options: [
          "admin / admin（出廠帳號，從未改過）",
          "老師用自己的帳號，而且開了第二因素",
          "只能從校內網路連線的唯讀報表帳號"
        ],
        answer: 0,
        wrong: "這個帳號不是出廠預設，或已經有額外保護。",
        leak: "FLAG{default-admin}。出廠帳號還能登入，等於把門牌和鑰匙一起留在門上。"
      },
      success: "先把預設帳號找出來，再把它關掉。",
      codefix: {
        lang: "管理頁", bad: 1,
        lines: [
          "# accounts",
          "admin: admin   # factory default, enabled",
          "mfa = off"
        ],
        fixes: [
          ["停用出廠帳號，改用具名帳號並開啟第二因素", true],
          ["把密碼從 admin 改成 admin123", false],
          ["把登入頁的標題改掉", false]
        ]
      }
    },
    {
      code: "C02", slug: "c02", nm: "公開的備份", en: "FLAG{open-backup}",
      goal: "指出不該被外人直接下載的檔案",
      scenario: "網站目錄裡有三個路徑。其中一個是資料庫備份，而且沒有權限檢查。",
      example: "備份檔不該放在網站可以列出來的地方。",
      phase1: {
        type: "choose",
        label: "哪一個路徑不該公開？",
        options: [
          "/backup/db.sql",
          "/about",
          "/css/site.css"
        ],
        answer: 0,
        wrong: "這是一般頁面或樣式，不是祕密。",
        leak: "FLAG{open-backup}。備份被放在網站根目錄，任何人猜到網址就能下載。"
      },
      success: "備份要移出網站目錄。",
      codefix: {
        lang: "部署", bad: 1,
        lines: [
          "# web root",
          "copy db.sql /var/www/html/backup/",
          "chmod 644 /var/www/html/backup/db.sql"
        ],
        fixes: [
          ["把備份移到網站讀不到的位置，並限制只有管理員能取", true],
          ["把檔名改成 db.sql.bak", false],
          ["在首頁加一行請勿下載", false]
        ]
      }
    },
    {
      code: "C03", slug: "c03", nm: "錯誤頁洩密", en: "FLAG{stack-trace}",
      goal: "指出哪一種錯誤頁把內部資訊交出去",
      scenario: "程式收到壞資料時會失敗。三種錯誤頁，只有一種把內部細節印給使用者。",
      example: "使用者只需要知道失敗了。細節應該進紀錄。",
      phase1: {
        type: "choose",
        label: "哪一種回應不該出現？",
        options: [
          "畫面上印出程式路徑、SQL 片段和堆疊",
          "畫面上只寫系統忙碌，請稍後再試",
          "同一時間把細節寫進只有管理員能看的紀錄"
        ],
        answer: 0,
        wrong: "這是一般化訊息，或是寫進紀錄，都是要留下的作法。",
        leak: "FLAG{stack-trace}。完整錯誤等於把內部構造交出去。"
      },
      success: "頁面只留一般訊息，細節進紀錄。",
      codefix: {
        lang: "錯誤處理", bad: 1,
        lines: [
          "try:",
          "    handle(request)",
          "except Exception as e: return str(e)"
        ],
        fixes: [
          ["except Exception: log(e); return '系統忙碌，請稍後再試'", true],
          ["except Exception as e: return traceback.format_exc()", false],
          ["except Exception as e: return e.sql", false]
        ]
      }
    },
    {
      code: "C04", slug: "c04", nm: "工作階段餅乾", en: "FLAG{cookie-flags}",
      goal: "挑出會被腳本讀走、也會在明文連線送出的餅乾",
      scenario: "登入後伺服器設了一個工作階段餅乾。三組屬性，只有一組太寬。",
      example: "HttpOnly 讓網頁腳本讀不到；Secure 讓它不走明文。",
      phase1: {
        type: "choose",
        label: "哪一組餅乾屬性有問題？",
        options: [
          "沒有 HttpOnly、也沒有 Secure",
          "HttpOnly 且 Secure",
          "HttpOnly、Secure，而且過期時間很短"
        ],
        answer: 0,
        wrong: "這組已經限制腳本和明文連線。",
        leak: "FLAG{cookie-flags}。腳本讀得到、明文也帶得走的工作階段，等於把登入狀態露在外面。"
      },
      success: "補上 HttpOnly 和 Secure。",
      codefix: {
        lang: "工作階段", bad: 1,
        lines: [
          "Set-Cookie: sid=demo",
          "# flags: (none)",
          "Max-Age=2592000"
        ],
        fixes: [
          ["Set-Cookie: sid=demo; HttpOnly; Secure; Max-Age=3600", true],
          ["Set-Cookie: sid=demo; Max-Age=2592000", false],
          ["document.cookie = sid", false]
        ]
      }
    },
    {
      code: "C05", slug: "c05", nm: "目錄列表", en: "FLAG{listing}",
      goal: "指出把整個資料夾內容列出來的回應",
      scenario: "有人開啟 /files/。三種伺服器回應，其中一種把目錄裡每個檔名都印出來。",
      example: "列目錄會把沒有連結的檔案也露出來。",
      phase1: {
        type: "choose",
        label: "哪一種回應有問題？",
        options: [
          "回傳檔名清單，包含 salary.xlsx",
          "回傳 403，不列出內容",
          "回傳固定的說明頁，沒有檔名"
        ],
        answer: 0,
        wrong: "拒絕列出，或只給固定說明，都是比較安全的回應。",
        leak: "FLAG{listing}。目錄列表把不該被看到的檔名一起交出來了。"
      },
      success: "關掉列表，敏感檔移走。",
      codefix: {
        lang: "網站目錄", bad: 1,
        lines: [
          "location /files {",
          "  autoindex on;",
          "}"
        ],
        fixes: [
          ["autoindex off，並把敏感檔移出這個目錄", true],
          ["autoindex on; # 但加上請勿下載", false],
          ["把網址改成 /files-hidden", false]
        ]
      }
    },
    {
      code: "C06", slug: "c06", nm: "寫死的權杖", en: "FLAG{hardcoded}",
      goal: "從三段前端程式裡找出不該出現在瀏覽器的祕密",
      scenario: "瀏覽器看得到的程式，使用者也看得完整。祕密不該寫在那裡。",
      example: "真正的權杖應該留在伺服器。",
      phase1: {
        type: "choose",
        label: "哪一段不該出現在前端？",
        options: [
          "const API_TOKEN = 'school-demo-token'",
          "const THEME = 'dark'",
          "const PAGE_SIZE = 20"
        ],
        answer: 0,
        wrong: "這是畫面設定或每頁筆數，不是祕密。",
        leak: "FLAG{hardcoded}。寫在前端的權杖，每個開過這個頁面的人都拿得到。"
      },
      success: "權杖改由伺服器保管，前端不要內嵌。",
      codefix: {
        lang: "前端", bad: 1,
        lines: [
          "// app.js 會被瀏覽器下載",
          "const API_TOKEN = 'school-demo-token';",
          "fetch('/api', { headers: { Authorization: API_TOKEN } });"
        ],
        fixes: [
          ["改由伺服器代理這個請求，瀏覽器不再持有權杖", true],
          ["把權杖改成更長的字串，仍寫在前端", false],
          ["用 base64 把同一組權杖編碼後寫在前端", false]
        ]
      }
    },
    {
      code: "C07", slug: "c07", nm: "人人可讀的祕密檔", en: "FLAG{mode-777}",
      goal: "挑出權限太開的檔案",
      scenario: "三個檔案權限。有一個讓系統上所有帳號都能讀到祕密。",
      example: "權限數字越大、越開放，不是越安全。",
      phase1: {
        type: "choose",
        label: "哪一個權限有問題？",
        options: [
          "密鑰檔是 777，所有人都可讀寫",
          "密鑰檔是 600，只有擁有者可讀寫",
          "設定檔是 640，群組可讀、其他人不可讀"
        ],
        answer: 0,
        wrong: "600 和 640 都沒有對所有人開放。",
        leak: "FLAG{mode-777}。所有人都能讀寫的密鑰檔，等於沒有權限。"
      },
      success: "改成只有需要的帳號可讀。",
      codefix: {
        lang: "檔案權限", bad: 1,
        lines: [
          "# secret.key",
          "mode 777",
          "owner app"
        ],
        fixes: [
          ["chmod 600 secret.key", true],
          ["chmod 666 secret.key", false],
          ["chmod 777 secret.key  # 方便除錯", false]
        ]
      }
    },
    {
      code: "C08", slug: "c08", nm: "不會結束的工作階段", en: "FLAG{long-session}",
      goal: "挑出離開後仍然有效太久的登入",
      scenario: "三組工作階段設定。一組在瀏覽器關掉後還能用非常久。",
      example: "共用電腦上，上一位使用者的登入不該留下來。",
      phase1: {
        type: "choose",
        label: "哪一組有問題？",
        options: [
          "關閉瀏覽器後，工作階段仍然 30 天有效",
          "關閉瀏覽器就失效",
          "閒置 15 分鐘就失效"
        ],
        answer: 0,
        wrong: "關掉就失效，或閒置就失效，都是要留下的作法。",
        leak: "FLAG{long-session}。工作階段活太久，下一個人可以接著用。"
      },
      success: "縮短效期，離開就失效。",
      codefix: {
        lang: "工作階段", bad: 1,
        lines: [
          "# session",
          "expire = 30d",
          "invalidate_on_close = false"
        ],
        fixes: [
          ["expire = 8h; invalidate_on_close = true; idle = 15m", true],
          ["expire = 365d", false],
          ["invalidate_on_close = false", false]
        ]
      }
    },
  ];
})();
