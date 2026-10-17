/* 由 _quizzes/build_review.py 自 _quizzes/sql-review20.json 產生，請勿手改 */
window.REVIEW_DATA = {
"module": "sql",
"title": "SQL Injection",
"storageKey": "sql_lab_review_v3",
"stale": [],
"total": 20,
"questions": [
{
"n": 1,
"formQ": 1,
"orig": true,
"icon": "💥",
"topic": "",
"stem": "SQL Injection 最根本的成因是？",
"question": "SQL Injection 最根本的成因是？",
"options": [
{
"l": "A",
"t": "資料庫軟體版本太舊，本身就有漏洞",
"id": "e6d60799"
},
{
"l": "B",
"t": "網站沒有使用 HTTPS 加密傳輸資料",
"id": "3db1a075"
},
{
"l": "C",
"t": "程式沒有把『使用者資料』和『SQL 指令』分開",
"id": "cd44504f"
},
{
"l": "D",
"t": "前端沒有用 JavaScript 檢查輸入格式",
"id": "a9543b46"
}
],
"correct": 2,
"exp": "不可信輸入被直接拼進 SQL 字串時，資料就可能被當成語法執行。",
"qv": "ac46a779f2",
"tab": "learn"
},
{
"n": 2,
"formQ": 11,
"orig": false,
"icon": "🧩",
"topic": "注入發生在哪一層",
"stem": "依注入流程「輸入 → 應用程式 → 組出 SQL → 解析器 → 資料庫」，SQL Injection 的弱點主要發生在哪裡？",
"question": "【注入發生在哪一層】依注入流程「輸入 → 應用程式 → 組出 SQL → 解析器 → 資料庫」，SQL Injection 的弱點主要發生在哪裡？",
"options": [
{
"l": "A",
"t": "應用程式把輸入組成 SQL、交給資料庫執行的那一步（應用程式與資料庫互動處）",
"id": "66c1c02e"
},
{
"l": "B",
"t": "使用者在瀏覽器輸入資料的那一步",
"id": "a69bb76f"
},
{
"l": "C",
"t": "資料庫把資料寫入硬碟的那一步",
"id": "219b2f8d"
},
{
"l": "D",
"t": "網路傳送封包的那一步",
"id": "4b45f9b8"
}
],
"correct": 0,
"exp": "問題出在應用程式和資料庫互動時把輸入拼進語法；所以要在應用程式端用參數化修補，加密傳輸或更換資料庫都無法解決。",
"qv": "3452eddd49",
"tab": "learn"
},
{
"n": 3,
"formQ": 12,
"orig": false,
"icon": "🎯",
"topic": "核心原則",
"stem": "本實驗室所有防禦技巧，共同要實現的原則是？",
"question": "【核心原則】本實驗室所有防禦技巧，共同要實現的原則是？",
"options": [
{
"l": "A",
"t": "只要把輸入長度限制得夠短，就不會被注入",
"id": "8c617611"
},
{
"l": "B",
"t": "把所有輸入先轉成大寫再組 SQL",
"id": "c0b9fd98"
},
{
"l": "C",
"t": "只要網站使用 HTTPS，資料庫就安全",
"id": "13334da1"
},
{
"l": "D",
"t": "不可信的輸入一律當「資料」，絕不讓它變成 SQL 語法",
"id": "22dd8d31"
}
],
"correct": 3,
"exp": "資料歸資料、指令歸指令；長度限制、大小寫轉換、HTTPS 都無法阻止輸入改變 SQL 語意。",
"qv": "20d5fb485a",
"tab": "learn"
},
{
"n": 4,
"formQ": 13,
"orig": false,
"icon": "🚪",
"topic": "登入繞過",
"stem": "在登入帳號欄輸入 admin' -- 可能繞過驗證，其中 -- 的作用是？",
"question": "【登入繞過】在登入帳號欄輸入 admin' -- 可能繞過驗證，其中 -- 的作用是？",
"options": [
{
"l": "A",
"t": "結束目前的 SQL 陳述式，接著執行下一個查詢",
"id": "7274b0c6"
},
{
"l": "B",
"t": "讓資料庫延遲回應數秒",
"id": "55f11df2"
},
{
"l": "C",
"t": "把查詢後段（包含密碼比對）變成註解而不執行",
"id": "45fc0252"
},
{
"l": "D",
"t": "把兩個查詢的結果合併在一起",
"id": "a44c4f75"
}
],
"correct": 2,
"exp": "單引號先閉合帳號字串，-- 讓後面的 AND password = … 變成註解；改用參數化查詢後，這串輸入只會被當成一個奇怪的帳號名稱。",
"qv": "75f1015af7",
"tab": "types"
},
{
"n": 5,
"formQ": 3,
"orig": true,
"icon": "➕",
"topic": "",
"stem": "輸入 1' OR '1'='1 為何危險？因為它讓 WHERE 條件變成？",
"question": "輸入 1' OR '1'='1 為何危險？因為它讓 WHERE 條件變成？",
"options": [
{
"l": "A",
"t": "永遠為假",
"id": "82f71412"
},
{
"l": "B",
"t": "永遠為真",
"id": "e7aa9c74"
},
{
"l": "C",
"t": "語法錯誤",
"id": "67a836a8"
},
{
"l": "D",
"t": "只比對第一筆",
"id": "94f12530"
}
],
"correct": 1,
"exp": "'1'='1' 恆真，OR 之後整個條件恆成立，等於取消了過濾。",
"qv": "8f2c451050",
"tab": "types"
},
{
"n": 6,
"formQ": 4,
"orig": true,
"icon": "🔗",
"topic": "",
"stem": "UNION-based 注入主要利用哪個關鍵字把額外資料併進結果？",
"question": "UNION-based 注入主要利用哪個關鍵字把額外資料併進結果？",
"options": [
{
"l": "A",
"t": "UNION",
"id": "2f16d5dc"
},
{
"l": "B",
"t": "JOIN",
"id": "a9e153ee"
},
{
"l": "C",
"t": "GROUP BY",
"id": "1c8f124f"
},
{
"l": "D",
"t": "HAVING",
"id": "5b52b416"
}
],
"correct": 0,
"exp": "UNION 可將另一個 SELECT 的結果合併回來，前提是欄位數與型別相容。",
"qv": "50cd2d4277",
"tab": "types"
},
{
"n": 7,
"formQ": 14,
"orig": false,
"icon": "🔦",
"topic": "布林盲注",
"stem": "頁面不會顯示查詢資料，但「條件成立」與「不成立」時的回應內容不同，攻擊者據此逐位推測資料。這種手法稱為？",
"question": "【布林盲注】頁面不會顯示查詢資料，但「條件成立」與「不成立」時的回應內容不同，攻擊者據此逐位推測資料。這種手法稱為？",
"options": [
{
"l": "A",
"t": "UNION-based 注入",
"id": "c0a27bff"
},
{
"l": "B",
"t": "時間盲注（Time-based Blind）",
"id": "ebb24b3a"
},
{
"l": "C",
"t": "布林盲注（Boolean-based Blind）",
"id": "4560eb31"
},
{
"l": "D",
"t": "錯誤訊息型注入（Error-based）",
"id": "6a370f2a"
}
],
"correct": 2,
"exp": "布林盲注靠真／假造成的回應差異推測資料，時間盲注則看延遲；兩者的根本防禦都是參數化查詢。",
"qv": "85ed6d84a8",
"tab": "types"
},
{
"n": 8,
"formQ": 5,
"orig": true,
"icon": "⏱️",
"topic": "",
"stem": "Time-based Blind Injection 用來判斷條件是否成立的訊號是？",
"question": "Time-based Blind Injection 用來判斷條件是否成立的訊號是？",
"options": [
{
"l": "A",
"t": "頁面內容是否出現差異",
"id": "e8a6a94e"
},
{
"l": "B",
"t": "資料庫回傳的錯誤訊息",
"id": "323ce0ee"
},
{
"l": "C",
"t": "HTTP 回應的狀態碼",
"id": "e37a5682"
},
{
"l": "D",
"t": "回應所花的時間（延遲）",
"id": "8fc1e2d3"
}
],
"correct": 3,
"exp": "讓資料庫在條件成立時延遲回應，用時間差當作 0/1 訊號。",
"qv": "6693026ec8",
"tab": "types"
},
{
"n": 9,
"formQ": 15,
"orig": false,
"icon": "🚧",
"topic": "WAF 的角色",
"stem": "沙盒的 WAF 情境中，變形後的輸入仍能通過過濾，這說明了什麼？",
"question": "【WAF 的角色】沙盒的 WAF 情境中，變形後的輸入仍能通過過濾，這說明了什麼？",
"options": [
{
"l": "A",
"t": "WAF 以樣式比對攔截，可被大小寫、編碼、註解拆字等變形繞過，只能當輔助防線",
"id": "15de0725"
},
{
"l": "B",
"t": "只要 WAF 規則寫得夠多，就能完全取代參數化查詢",
"id": "8d9f7f77"
},
{
"l": "C",
"t": "裝了 WAF 之後，就不需要記錄與告警",
"id": "d7d6d024"
},
{
"l": "D",
"t": "WAF 被繞過，代表參數化查詢也一定失效",
"id": "418e8d6f"
}
],
"correct": 0,
"exp": "WAF 能擋掉部分已知樣式，但比對規則總有漏網之魚；真正的防線仍是安全的程式寫法，WAF 是額外的一層。",
"qv": "7add0c0c6e",
"tab": "types"
},
{
"n": 10,
"formQ": 16,
"orig": false,
"icon": "🔢",
"topic": "ID 參數／型別檢查",
"stem": "網址 ?id=15 會被帶入 WHERE id = … 的查詢，最適當的防禦組合是？",
"question": "【ID 參數／型別檢查】網址 ?id=15 會被帶入 WHERE id = … 的查詢，最適當的防禦組合是？",
"options": [
{
"l": "A",
"t": "只在前端用 JavaScript 檢查是不是數字",
"id": "c3f1d70f"
},
{
"l": "B",
"t": "伺服器端驗證 id 必須是整數，並以參數化查詢帶入",
"id": "0813620f"
},
{
"l": "C",
"t": "把 id 用 Base64 編碼後再傳送",
"id": "00aabd27"
},
{
"l": "D",
"t": "把 id 用單引號包起來後再拼進 SQL",
"id": "27b61406"
}
],
"correct": 1,
"exp": "前端檢查可被略過、編碼不是防護、加引號仍是拼接；伺服器端型別驗證擋掉不合理的輸入，參數化確保它不會改變語意。",
"qv": "465b208c95",
"tab": "types"
},
{
"n": 11,
"formQ": 17,
"orig": false,
"icon": "🧪",
"topic": "沙盒：安全模式",
"stem": "把沙盒切到「安全（參數化查詢）」後，再輸入 ' OR '1'='1，結果會是？",
"question": "【沙盒：安全模式】把沙盒切到「安全（參數化查詢）」後，再輸入 ' OR '1'='1，結果會是？",
"options": [
{
"l": "A",
"t": "仍會登入成功，因為條件恆真",
"id": "25c933a4"
},
{
"l": "B",
"t": "資料庫回傳語法錯誤，並列出資料表名稱",
"id": "10ad5976"
},
{
"l": "C",
"t": "整串輸入被當成一個參數值比對，查無符合",
"id": "e8b786ff"
},
{
"l": "D",
"t": "輸入中的單引號會先被自動刪除，再照常執行",
"id": "88ef0132"
}
],
"correct": 2,
"exp": "參數化查詢下 SQL 結構已固定，payload 只是一段普通字串；它不是靠刪除或跳脫字元，而是根本不讓輸入進入語法。",
"qv": "3fd05a445a",
"tab": "sandbox"
},
{
"n": 12,
"formQ": 18,
"orig": false,
"icon": "🧵",
"topic": "字串拼接的後果",
"stem": "程式寫成 \"... WHERE name = '\" + username + \"'\"，若輸入含有單引號與 SQL 關鍵字，最可能發生什麼事？",
"question": "【字串拼接的後果】程式寫成 \"... WHERE name = '\" + username + \"'\"，若輸入含有單引號與 SQL 關鍵字，最可能發生什麼事？",
"options": [
{
"l": "A",
"t": "輸入會閉合原本的字串，改變查詢的語意與條件",
"id": "88d922e4"
},
{
"l": "B",
"t": "資料庫會自動辨識並忽略惡意的部分",
"id": "278f0d1f"
},
{
"l": "C",
"t": "只會讓這次查詢變慢，結果不受影響",
"id": "2c097f8a"
},
{
"l": "D",
"t": "只影響畫面顯示，不會影響資料庫",
"id": "a228ecbd"
}
],
"correct": 0,
"exp": "拼接後資料庫分不清哪段是值、哪段是語法，輸入就能改寫 WHERE 條件；這正是參數化查詢要解決的問題。",
"qv": "5c3168ba7a",
"tab": "defense"
},
{
"n": 13,
"formQ": 2,
"orig": true,
"icon": "🛡️",
"topic": "",
"stem": "防禦 SQL Injection 最主要、最根本的做法是？",
"question": "防禦 SQL Injection 最主要、最根本的做法是？",
"options": [
{
"l": "A",
"t": "在前端用 JavaScript 過濾單引號",
"id": "df00f6f3"
},
{
"l": "B",
"t": "把資料庫錯誤訊息隱藏起來",
"id": "faaab046"
},
{
"l": "C",
"t": "對輸入的特殊字元做 HTML 編碼",
"id": "12569558"
},
{
"l": "D",
"t": "參數化查詢（Prepared Statement）",
"id": "bd707ce3"
}
],
"correct": 3,
"exp": "參數化查詢讓資料庫先編譯語句結構，輸入只當參數帶入，無法改變語意。",
"qv": "3a068052cd",
"tab": "defense"
},
{
"n": 14,
"formQ": 19,
"orig": false,
"icon": "🧷",
"topic": "佔位符",
"stem": "Python sqlite3 的 ?、psycopg 的 %s、PHP PDO 的 :u，這些佔位符的共同作用是？",
"question": "【佔位符】Python sqlite3 的 ?、psycopg 的 %s、PHP PDO 的 :u，這些佔位符的共同作用是？",
"options": [
{
"l": "A",
"t": "送出前先把輸入加密",
"id": "1939668e"
},
{
"l": "B",
"t": "先固定 SQL 結構，輸入再以參數值綁定，不會被當成語法",
"id": "2cda26c5"
},
{
"l": "C",
"t": "自動把輸入裡的單引號刪掉",
"id": "4cefcb32"
},
{
"l": "D",
"t": "讓字串拼接 SQL 的速度更快",
"id": "f64986e0"
}
],
"correct": 1,
"exp": "佔位符的值交給驅動程式綁定；注意 psycopg 的 %s 要當成 execute 的第二個參數傳入，自己用 Python 的 % 格式化字串仍是拼接，不安全。",
"qv": "a49e3010e7",
"tab": "defense"
},
{
"n": 15,
"formQ": 6,
"orig": true,
"icon": "📋",
"topic": "",
"stem": "為什麼 ORDER BY 後的『欄位名稱』不能只靠參數化查詢防護？",
"question": "為什麼 ORDER BY 後的『欄位名稱』不能只靠參數化查詢防護？",
"options": [
{
"l": "A",
"t": "排序欄位用參數綁定會讓查詢效能大幅下降",
"id": "c66be9b1"
},
{
"l": "B",
"t": "欄位名稱來自下拉選單，使用者無法自行竄改",
"id": "89d3f57f"
},
{
"l": "C",
"t": "欄位名稱是 SQL 結構的一部分，不是可綁定的資料值",
"id": "2533b903"
},
{
"l": "D",
"t": "綁定的欄位名稱會被資料庫自動跳脫成安全值",
"id": "5d064b67"
}
],
"correct": 2,
"exp": "參數綁定只處理『值』；識別字（欄位、表名、排序方向）屬結構，需用白名單。",
"qv": "f8c67eb8f2",
"tab": "defense"
},
{
"n": 16,
"formQ": 7,
"orig": true,
"icon": "✅",
"topic": "",
"stem": "處理 ORDER BY 欄位時，建議採用哪種作法？",
"question": "處理 ORDER BY 欄位時，建議採用哪種作法？",
"options": [
{
"l": "A",
"t": "用黑名單過濾 SELECT、DROP 等關鍵字",
"id": "8b66d4c2"
},
{
"l": "B",
"t": "用固定的允許清單（whitelist）比對",
"id": "b6a3793e"
},
{
"l": "C",
"t": "用跳脫函式處理欄位名稱中的引號",
"id": "f5e552c8"
},
{
"l": "D",
"t": "把欄位名稱當作參數綁定進查詢",
"id": "c8f4aac6"
}
],
"correct": 1,
"exp": "只接受預先定義好的合法欄位名，其餘一律拒絕。",
"qv": "a73c8013cb",
"tab": "defense"
},
{
"n": 17,
"formQ": 8,
"orig": true,
"icon": "🔑",
"topic": "",
"stem": "資料庫帳號應遵循哪一項原則，以降低漏洞被利用後的衝擊？",
"question": "資料庫帳號應遵循哪一項原則，以降低漏洞被利用後的衝擊？",
"options": [
{
"l": "A",
"t": "最小權限（Least Privilege）",
"id": "9a741d4d"
},
{
"l": "B",
"t": "預設允許（Default Allow）",
"id": "cc0ace19"
},
{
"l": "C",
"t": "失效開放（Fail Open）",
"id": "2c5127db"
},
{
"l": "D",
"t": "共用帳號（Shared Account）",
"id": "df60a36d"
}
],
"correct": 0,
"exp": "應用帳號只給必要權限，就算被注入，可破壞的範圍也有限。",
"qv": "c92f19dc99",
"tab": "layers"
},
{
"n": 18,
"formQ": 10,
"orig": true,
"icon": "📝",
"topic": "",
"stem": "把資料庫的完整錯誤訊息直接回傳給使用者，主要風險是？",
"question": "把資料庫的完整錯誤訊息直接回傳給使用者，主要風險是？",
"options": [
{
"l": "A",
"t": "只影響開發者除錯，對資安沒有實際影響",
"id": "990b59f0"
},
{
"l": "B",
"t": "會讓資料庫連線數暴增，造成服務中斷",
"id": "12266734"
},
{
"l": "C",
"t": "攻擊者可藉此直接取得伺服器管理員權限",
"id": "eb92a760"
},
{
"l": "D",
"t": "可能洩漏資料表結構、SQL 片段等資訊，協助攻擊者",
"id": "b1231f2c"
}
],
"correct": 3,
"exp": "詳細錯誤等於替攻擊者畫地圖；應回傳一般化訊息，細節只進日誌。",
"qv": "66d30bb12f",
"tab": "layers"
},
{
"n": 19,
"formQ": 20,
"orig": false,
"icon": "📜",
"topic": "記錄與告警",
"stem": "縱深防禦中的「記錄與告警」，對 SQL Injection 最主要的貢獻是？",
"question": "【記錄與告警】縱深防禦中的「記錄與告警」，對 SQL Injection 最主要的貢獻是？",
"options": [
{
"l": "A",
"t": "讓程式自動修補注入漏洞",
"id": "4b1744f2"
},
{
"l": "B",
"t": "取代參數化查詢，成為第一道防線",
"id": "a33d09a9"
},
{
"l": "C",
"t": "讓攻擊者看不到錯誤訊息",
"id": "878831c3"
},
{
"l": "D",
"t": "及早發現可疑的注入嘗試，並在事後追查影響範圍",
"id": "311fd710"
}
],
"correct": 3,
"exp": "日誌和告警不會擋下攻擊，但能讓異常被看見、被追查；隱藏錯誤訊息屬於「錯誤處理」那一層。",
"qv": "2e7c8c5b95",
"tab": "layers"
},
{
"n": 20,
"formQ": 9,
"orig": true,
"icon": "🧱",
"topic": "",
"stem": "WAF（Web 應用防火牆）在防禦 SQL Injection 時的正確定位是？",
"question": "WAF（Web 應用防火牆）在防禦 SQL Injection 時的正確定位是？",
"options": [
{
"l": "A",
"t": "可以完全取代安全程式設計",
"id": "6ba4d5f0"
},
{
"l": "B",
"t": "額外的防護層，不能取代參數化查詢",
"id": "6666cbe7"
},
{
"l": "C",
"t": "只能防 XSS，對 SQL Injection 無效",
"id": "bd981f4d"
},
{
"l": "D",
"t": "能自動修正程式中有漏洞的 SQL 語句",
"id": "2425c2f7"
}
],
"correct": 1,
"exp": "WAF 能擋掉部分已知樣式，但容易被繞過，不能當唯一防線。",
"qv": "a75ab294e5",
"tab": "layers"
}
]
};
