/* 原創教學題，供 CTF 關卡頁末練習。 */
window.REVIEW_DATA = {
"module": "ctf",
"title": "CTF 教學關卡",
"storageKey": "ctf_course_review_v1",
"stale": [],
"total": 8,
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
}
]
};
