/* 原創教學題，供 CTF 關卡頁末練習。每關一題，共 20 題。 */
window.REVIEW_DATA = {
"module": "ctf",
"title": "CTF 教學關卡",
"storageKey": "ctf_course_review_v1",
"stale": [],
"total": 20,
"questions": [
{
"n": 1,
"formQ": 1,
"orig": true,
"icon": "🚩",
"topic": "原始碼",
"slug": "c01",
"stem": "畫面上看不到的 HTML 註解，要去哪裡找？",
"question": "畫面上看不到的 HTML 註解，要去哪裡找？",
"options": [
{
"l": "A",
"t": "只看彩色標題",
"id": "8c0dcaac"
},
{
"l": "B",
"t": "用瀏覽器的「檢視網頁原始碼」",
"id": "7db3ffcf"
},
{
"l": "C",
"t": "把網址多加一個斜線",
"id": "f7ab47a5"
}
],
"correct": 1,
"exp": "註解不會畫在畫面上，但會留在原始碼裡。",
"qv": "aa7b1af34b"
},
{
"n": 2,
"formQ": 2,
"orig": true,
"icon": "🎨",
"topic": "樣式表",
"slug": "c02",
"stem": "文字被樣式藏起來時，較直接的看法是？",
"question": "文字被樣式藏起來時，較直接的看法是？",
"options": [
{
"l": "A",
"t": "只重新整理頁面",
"id": "4bc80634"
},
{
"l": "B",
"t": "打開這頁連結的 CSS 檔",
"id": "da103701"
},
{
"l": "C",
"t": "看網址列的圖示",
"id": "a7e486a9"
}
],
"correct": 1,
"exp": "樣式表決定外觀，旗幟可以寫在 CSS 裡而不是本文。",
"qv": "1724e99c7d"
},
{
"n": 3,
"formQ": 3,
"orig": true,
"icon": "🖥️",
"topic": "主控台",
"slug": "c03",
"stem": "開發者工具的 Console 通常用來？",
"question": "開發者工具的 Console 通常用來？",
"options": [
{
"l": "A",
"t": "看網頁執行時印出的訊息",
"id": "e998b1fa"
},
{
"l": "B",
"t": "改別人的密碼",
"id": "74770a2c"
},
{
"l": "C",
"t": "下載整台伺服器",
"id": "cda61d93"
}
],
"correct": 0,
"exp": "主控台訊息給開發的人看，預設不會出現在版面上。",
"qv": "997c4621f9"
},
{
"n": 4,
"formQ": 4,
"orig": true,
"icon": "🍪",
"topic": "Cookie",
"slug": "c04",
"stem": "旗幟放在 cookie 時，應該去哪裡看？",
"question": "旗幟放在 cookie 時，應該去哪裡看？",
"options": [
{
"l": "A",
"t": "開發者工具的應用程式 → Cookie",
"id": "f9ea9b23"
},
{
"l": "B",
"t": "網址列最前面",
"id": "c74ae198"
},
{
"l": "C",
"t": "電腦桌面",
"id": "ad1fda9d"
}
],
"correct": 0,
"exp": "Cookie 存在這台瀏覽器裡，要用開發者工具才看得到內容。",
"qv": "6b29c3c75a"
},
{
"n": 5,
"formQ": 5,
"orig": true,
"icon": "🔤",
"topic": "編碼",
"slug": "c05",
"stem": "Base64 是什麼？",
"question": "Base64 是什麼？",
"options": [
{
"l": "A",
"t": "把資料編成文字的方式，解碼後才是原文，它不是加密",
"id": "7bdd674d"
},
{
"l": "B",
"t": "一種無法還原的雜湊",
"id": "0e475cc6"
},
{
"l": "C",
"t": "登入密碼本身",
"id": "d7adc2ae"
}
],
"correct": 0,
"exp": "編碼可以還原。把它當成密碼或雜湊，會解不回來或用錯工具。",
"qv": "01717ecc2a"
},
{
"n": 6,
"formQ": 6,
"orig": true,
"icon": "📄",
"topic": "隱藏路徑",
"slug": "c06",
"stem": "robots.txt 在這一關扮演什麼角色？",
"question": "robots.txt 在這一關扮演什麼角色？",
"options": [
{
"l": "A",
"t": "公開寫出一條沒有放進選單的路徑",
"id": "5bef6f28"
},
{
"l": "B",
"t": "存放使用者密碼",
"id": "ebae95e4"
},
{
"l": "C",
"t": "用來登入",
"id": "dcc9153b"
}
],
"correct": 0,
"exp": "路徑清單是公開檔。沒有連結，不代表檔案不存在。",
"qv": "e983544401"
},
{
"n": 7,
"formQ": 7,
"orig": true,
"icon": "💾",
"topic": "本機儲存",
"slug": "c07",
"stem": "localStorage 的資料放在哪裡？",
"question": "localStorage 的資料放在哪裡？",
"options": [
{
"l": "A",
"t": "這台瀏覽器裡、這個網站名下",
"id": "ad454456"
},
{
"l": "B",
"t": "老師的雲端硬碟",
"id": "070eecc2"
},
{
"l": "C",
"t": "網址列",
"id": "9d8e6ada"
}
],
"correct": 0,
"exp": "同一台電腦、同一個網站才讀得到，別台裝置沒有這份值。",
"qv": "ccbb5f5b11"
},
{
"n": 8,
"formQ": 8,
"orig": true,
"icon": "🧩",
"topic": "拼起來",
"slug": "c08",
"stem": "旗幟被拆成三段時，要怎麼送出？",
"question": "旗幟被拆成三段時，要怎麼送出？",
"options": [
{
"l": "A",
"t": "只送第一段",
"id": "0a4e2277"
},
{
"l": "B",
"t": "依 p1、p2、p3 接成一整段 FLAG{...}",
"id": "e806336d"
},
{
"l": "C",
"t": "三段各算一關",
"id": "f28cc733"
}
],
"correct": 1,
"exp": "核對的是接好的完整旗幟。",
"qv": "cd7409d555"
},
{
"n": 9,
"formQ": 9,
"orig": true,
"icon": "🏷️",
"topic": "分頁標題",
"slug": "c09",
"stem": "網頁標題通常顯示在哪裡？",
"question": "網頁標題通常顯示在哪裡？",
"options": [
{
"l": "A",
"t": "瀏覽器分頁",
"id": "a0df1a2f"
},
{
"l": "B",
"t": "查詢字串的結尾",
"id": "2d3230fe"
},
{
"l": "C",
"t": "印表機佇列",
"id": "26db9735"
}
],
"correct": 0,
"exp": "標題來自 title，預設出現在分頁，不一定出現在正文。",
"qv": "e472b309fe"
},
{
"n": 10,
"formQ": 10,
"orig": true,
"icon": "🔖",
"topic": "中繼資料",
"slug": "c10",
"stem": "meta description 要去哪裡找？",
"question": "meta description 要去哪裡找？",
"options": [
{
"l": "A",
"t": "頁面正文的第一段",
"id": "ff7913d3"
},
{
"l": "B",
"t": "檢視原始碼裡的 meta",
"id": "84c0193c"
},
{
"l": "C",
"t": "Cookie 清單",
"id": "25143a1d"
}
],
"correct": 1,
"exp": "中繼資料寫在標頭，預設不會當成文章印出來。",
"qv": "7423affba2"
},
{
"n": 11,
"formQ": 11,
"orig": true,
"icon": "🔢",
"topic": "十六進位",
"slug": "c11",
"stem": "把旗幟寫成十六進位時，要怎麼還原？",
"question": "把旗幟寫成十六進位時，要怎麼還原？",
"options": [
{
"l": "A",
"t": "兩個位數一組轉回字元",
"id": "230ad42c"
},
{
"l": "B",
"t": "把它當成雜湊去碰撞",
"id": "a352490e"
},
{
"l": "C",
"t": "只取前兩個字",
"id": "02034bf6"
}
],
"correct": 0,
"exp": "十六進位是寫法，可以轉回原來的文字。",
"qv": "f7cb856454"
},
{
"n": 12,
"formQ": 12,
"orig": true,
"icon": "🔁",
"topic": "倒過來",
"slug": "c12",
"stem": "整段字序被對調時，要怎麼送出？",
"question": "整段字序被對調時，要怎麼送出？",
"options": [
{
"l": "A",
"t": "只送最後四個字",
"id": "511c7999"
},
{
"l": "B",
"t": "從尾端讀回開頭再送出",
"id": "41389a70"
},
{
"l": "C",
"t": "照畫面順序直接送",
"id": "12359bff"
}
],
"correct": 1,
"exp": "倒回來之後才是完整旗幟。",
"qv": "cf10466b7b"
},
{
"n": 13,
"formQ": 13,
"orig": true,
"icon": "🔤",
"topic": "字母移位",
"slug": "c13",
"stem": "ROT13 在做什麼？",
"question": "ROT13 在做什麼？",
"options": [
{
"l": "A",
"t": "把英文字母移 13 位，再移一次回到原文",
"id": "e70b7cb1"
},
{
"l": "B",
"t": "一種單向雜湊",
"id": "a7450211"
},
{
"l": "C",
"t": "把檔案壓成一半",
"id": "f31afb27"
}
],
"correct": 0,
"exp": "它只移位，不是加密，也不是雜湊。",
"qv": "105ae6fb05"
},
{
"n": 14,
"formQ": 14,
"orig": true,
"icon": "🙈",
"topic": "隱藏欄位",
"slug": "c14",
"stem": "type 為 hidden 的輸入欄，要怎麼看到值？",
"question": "type 為 hidden 的輸入欄，要怎麼看到值？",
"options": [
{
"l": "A",
"t": "它不會存在頁面上",
"id": "ab0a41f4"
},
{
"l": "B",
"t": "用檢查元素讀 value",
"id": "3e2d2a19"
},
{
"l": "C",
"t": "看網址列",
"id": "cf49f500"
}
],
"correct": 1,
"exp": "隱藏欄位不畫出來，元素仍在頁面裡。",
"qv": "f4563a0a50"
},
{
"n": 15,
"formQ": 15,
"orig": true,
"icon": "🖼️",
"topic": "替代文字",
"slug": "c15",
"stem": "圖片的 alt 是什麼？",
"question": "圖片的 alt 是什麼？",
"options": [
{
"l": "A",
"t": "畫在圖中央的字",
"id": "4152c33a"
},
{
"l": "B",
"t": "圖片標籤上的替代文字",
"id": "5d56e6a7"
},
{
"l": "C",
"t": "伺服器的密碼",
"id": "4dfb7064"
}
],
"correct": 1,
"exp": "alt 在標籤裡，圖本身可以是空白的。",
"qv": "e3b554bcc5"
},
{
"n": 16,
"formQ": 16,
"orig": true,
"icon": "{}",
"topic": "JSON",
"slug": "c16",
"stem": "線索是 JSON 檔時，旗幟通常在哪？",
"question": "線索是 JSON 檔時，旗幟通常在哪？",
"options": [
{
"l": "A",
"t": "某個鍵的值",
"id": "d54f880c"
},
{
"l": "B",
"t": "檔名的副檔名",
"id": "17c27cf8"
},
{
"l": "C",
"t": "瀏覽器的標題",
"id": "70f9ff05"
}
],
"correct": 0,
"exp": "打開檔案，讀對應的值。",
"qv": "b498282538"
},
{
"n": 17,
"formQ": 17,
"orig": true,
"icon": "📐",
"topic": "向量圖",
"slug": "c17",
"stem": "SVG 裡的註解會怎樣？",
"question": "SVG 裡的註解會怎樣？",
"options": [
{
"l": "A",
"t": "一定畫成圖形",
"id": "c01ad9e0"
},
{
"l": "B",
"t": "留在原始碼，不會畫出來",
"id": "b19f6e57"
},
{
"l": "C",
"t": "寫進 Cookie",
"id": "4febc75e"
}
],
"correct": 1,
"exp": "SVG 是文字格式，註解跟 HTML 註解一樣不會被畫出來。",
"qv": "6f8cc06a5e"
},
{
"n": 18,
"formQ": 18,
"orig": true,
"icon": "📄",
"topic": "說明檔",
"slug": "c18",
"stem": "humans.txt 沒有放進選單時，代表什麼？",
"question": "humans.txt 沒有放進選單時，代表什麼？",
"options": [
{
"l": "A",
"t": "檔案一定不存在",
"id": "d2d8d5c2"
},
{
"l": "B",
"t": "知道檔名仍可以打開",
"id": "05f54335"
},
{
"l": "C",
"t": "只能用電子郵件取得",
"id": "71eea456"
}
],
"correct": 1,
"exp": "沒有連結不代表檔案不存在。",
"qv": "0f8c648a5e"
},
{
"n": 19,
"formQ": 19,
"orig": true,
"icon": "🚫",
"topic": "無腳本",
"slug": "c19",
"stem": "noscript 裡的文字，在腳本有執行時會怎樣？",
"question": "noscript 裡的文字，在腳本有執行時會怎樣？",
"options": [
{
"l": "A",
"t": "不會畫在畫面上，但原始碼還在",
"id": "eb0e27b1"
},
{
"l": "B",
"t": "自動變成標題",
"id": "09f50bb9"
},
{
"l": "C",
"t": "寫進 localStorage",
"id": "39fb9ecd"
}
],
"correct": 0,
"exp": "一般瀏覽看不到，檢視原始碼仍找得到。",
"qv": "eedf5f276b"
},
{
"n": 20,
"formQ": 20,
"orig": true,
"icon": "🗂️",
"topic": "工作階段",
"slug": "c20",
"stem": "sessionStorage 和 localStorage 的差別，這一關要看的是？",
"question": "sessionStorage 和 localStorage 的差別，這一關要看的是？",
"options": [
{
"l": "A",
"t": "兩者都在雲端硬碟",
"id": "1402298b"
},
{
"l": "B",
"t": "工作階段儲存是另一欄，關掉分頁後通常會清掉",
"id": "7e65c428"
},
{
"l": "C",
"t": "兩者一定內容相同",
"id": "2e46bcbc"
}
],
"correct": 1,
"exp": "要打開 Session Storage，不是 Local Storage。",
"qv": "bc894441c5"
}
]
};
