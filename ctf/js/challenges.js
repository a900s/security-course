/* CTF 闖關：畫面上不放旗幟。每一關只記錄核對用的雜湊，原文藏在該關線索裡。 */
window.CHALLENGES = [
  {
    slug: "c01", code: "C01", nm: "原始碼", en: "Web",
    goal: "打開線索頁，用瀏覽器的「檢視原始碼」找出藏在註解裡的旗幟",
    scenario: "有些說明不會畫在畫面上，只留在網頁原始碼的註解。這是入門 CTF 最常見的一種藏法。",
    example: "在線索頁按右鍵選「檢視網頁原始碼」，或按 Ctrl+U。找 HTML 註解 <b>&lt;!-- ... --&gt;</b>。",
    success: "註解不會顯示成網頁內容，但會留在原始碼裡。",
    phase1: { type: "flag", clue: "clue/source.html", expect: "7c3ad9b67e285e6a2dd104bf8ca5571d6b2295f1fb9b84b607ca31c8e1562475" }
  },
  {
    slug: "c02", code: "C02", nm: "樣式表", en: "Web",
    goal: "旗幟不在網頁本文，而在這頁連結的 CSS 檔裡",
    scenario: "畫面上看起來是空白的說明頁。真正的字寫在樣式表，瀏覽器拿去決定外觀，預設不會當成文章印出來。",
    example: "打開線索頁之後，再打開它連結的 <b>style.css</b>（開發者工具的「來源」或網址列把檔名換掉）。",
    success: "樣式表也是網頁的一部分，只是通常不直接顯示成內文。",
    phase1: { type: "flag", clue: "clue/poster.html", expect: "d3a85b781abe908677e9701036d6e78e1792b1fc2ae578c89e6341b1f54ad23e" }
  },
  {
    slug: "c03", code: "C03", nm: "主控台", en: "Web",
    goal: "打開開發者工具的主控台，讀出頁面執行時印出的旗幟",
    scenario: "程式除錯時會把訊息印到主控台。這些字不會出現在網頁版面上。",
    example: "打開線索頁，按 F12，切到 <b>Console</b>。若已經開過，重新整理一次。",
    success: "主控台訊息給開發的人看，訪客看版面時不會看見。",
    phase1: { type: "flag", clue: "clue/console.html", expect: "ac931a430a0e7dd032299e28ce7270cb116d8acf59aa285657e858a63da1cdde" }
  },
  {
    slug: "c04", code: "C04", nm: "Cookie", en: "Web",
    goal: "這一關會在瀏覽器種下一枚 cookie，旗幟在那枚 cookie 的值裡",
    scenario: "網站常用 cookie 記住這台瀏覽器。入門題有時把要找的字放在 cookie，而不是放在畫面上。",
    example: "先打開線索頁，再按 F12 → <b>應用程式（Application）</b> → Cookie，看這個網站底下的項目。",
    success: "Cookie 存在瀏覽器裡，要用開發者工具才看得到名稱與內容。",
    phase1: { type: "flag", clue: "clue/cookie.html", expect: "58dc914a326631310dc5b58f4e48428772bcec069ade8dad72b7435753a314a2" }
  },
  {
    slug: "c05", code: "C05", nm: "編碼", en: "Crypto",
    goal: "下面這段不是旗幟本身，把它從 Base64 解回原文再送出",
    scenario: "Base64 只是把資料編成可閱讀的文字，任何人都能解回來。它不是加密，也不是密碼。",
    example: "用瀏覽器主控台的 <b>atob(\"...\")</b>，或任何 Base64 解碼。解出來的整段（含 FLAG 與大括號）才是要送出的旗幟。",
    success: "編碼可以還原成原文；雜湊與加密則不是這一關在做的事。",
    phase1: { type: "flag", cipher: "RkxBR3tiYXNlNjQtaXMtbm90LWVuY3J5cHRpb259", expect: "c4100dc7b66894bfc30668a813559ef4b4016109b30619d51aca2f7aa6a23511" }
  },
  {
    slug: "c06", code: "C06", nm: "隱藏路徑", en: "Web",
    goal: "線索檔列出一條沒有放進選單的路徑，打開那個檔案",
    scenario: "robots.txt 用來告訴自動程式哪些路徑不要去抓。檔案本身是公開的，裡面有時會寫出站上沒有連結的路徑。",
    example: "打開線索（robots.txt），看 Disallow 那幾行。用你現在這個網站的位址接上路徑：課程站用 <b>/security-course/ctf/private/note.txt</b>，本機預覽用 <b>/ctf/private/note.txt</b>。",
    success: "沒有連結不代表檔案不存在。公開的路徑清單也會把名稱露出來。",
    phase1: { type: "flag", clue: "robots.txt", expect: "bd0fcee9db72a45ded7a8447486a109245f71aaddaeb72226c540ce129034c11" }
  },
  {
    slug: "c07", code: "C07", nm: "本機儲存", en: "Web",
    goal: "旗幟寫進這個網站的 localStorage，不在畫面上",
    scenario: "localStorage 讓網站把字串留在這台瀏覽器、這個網址名下。重新整理還在，但別台電腦沒有。",
    example: "打開線索頁，按 F12 → 應用程式 → <b>本地儲存空間（Local Storage）</b>，選目前這個網站，讀出對應的鍵。",
    success: "存在瀏覽器裡的值，不會自動變成網頁上的文字。",
    phase1: { type: "flag", clue: "clue/storage.html", expect: "4f092c0cfc46777d2780a0ca49ba0f5ec16a82aa22ae31c36339a09f6f5cbb87" }
  },
  {
    slug: "c08", code: "C08", nm: "拼起來", en: "Web",
    goal: "旗幟拆成三段，藏在同一個元素的三個屬性裡，依序接成一整段再送出",
    scenario: "有的題目不把完整旗幟放在同一個地方，要自己把片段接起來。",
    example: "打開線索頁，對那一塊用「檢查元素」。依 <b>data-p1</b>、<b>data-p2</b>、<b>data-p3</b> 的順序接成一個 FLAG{...}。",
    success: "三段接成同一面旗幟之後才算找到。",
    phase1: { type: "flag", clue: "clue/split.html", expect: "924d16bc110d64e981e0bdabbcc0e36f3fc152808a9a544a278cabff40bc83c9" }
  },
  {
    slug: "c09", code: "C09", nm: "分頁標題", en: "Web",
    goal: "旗幟寫在線索頁的標題，不在內文裡",
    scenario: "瀏覽器分頁上的文字來自網頁的 title，不一定會再出現在頁面正文。",
    example: "打開線索頁，看分頁標籤。或檢視原始碼裡的 <b>&lt;title&gt;</b>。",
    success: "標題是網頁的一部分，只是通常顯示在分頁而不是文章裡。",
    phase1: { type: "flag", clue: "clue/title.html", expect: "0f2b7bc7473b64e8978a55f45943b91996c91f09fb1dda1552d96d95e52bf558" }
  },
  {
    slug: "c10", code: "C10", nm: "中繼資料", en: "Web",
    goal: "旗幟放在 meta 的 description，頁面上沒有這段字",
    scenario: "meta 給瀏覽器或搜尋用，預設不會當成文章印出來。",
    example: "打開線索頁，檢視原始碼，找 <b>meta name=\"description\"</b>。",
    success: "中繼資料在原始碼裡，不在你看到的段落裡。",
    phase1: { type: "flag", clue: "clue/meta.html", expect: "b8fdfa87f43a1ac4b4c6699ecc6fa0b21b70f7e5c376c57b14eeb072049dcfb8" }
  },
  {
    slug: "c11", code: "C11", nm: "十六進位", en: "Crypto",
    goal: "下面這段是旗幟的十六進位，兩位數一組還原成文字再送出",
    scenario: "十六進位只是另一種寫法，每個位元組寫成兩個 0–9、a–f。它不是加密。",
    example: "從 46 4c 開始，每兩個十六進位數字轉成一個字元。轉完的整段才是旗幟。",
    success: "還原之後就是一般文字。編碼可以轉回去，不像雜湊那樣單向。",
    phase1: { type: "flag", cipher: "464c41477b6865782d6469676974737d", expect: "b6d2b0c9f09261d70a61092afe64ffe75a0d9e91bda517355a658cfb1f5d728f" }
  },
  {
    slug: "c12", code: "C12", nm: "倒過來", en: "Crypto",
    goal: "下面這段整串是反著寫的，倒回來再送出",
    scenario: "有的題目只把字序對調。從最後一個字往前讀，就回到原來的旗幟。",
    example: "把整段（含大括號）從尾端讀到開頭。",
    success: "倒過來之後，開頭會是 FLAG{。",
    phase1: { type: "flag", cipher: "}sdrawkcab-daer{GALF", expect: "a50ada668ecfb8ecc93efb7e87fabdd5ea790123792ab626c80ad1b9f7b06469" }
  },
  {
    slug: "c13", code: "C13", nm: "字母移位", en: "Crypto",
    goal: "每個英文字母往後數 13 個還原，數字與大括號維持不變",
    scenario: "ROT13 只把 A–Z、a–z 各移 13 位。再移一次就回到原文。它不是密碼學意義上的加密。",
    example: "A 變成 N、N 變回 A。大括號和數字不要動。還原後的整段才送出。",
    success: "移位可以還原。把它當成真正的加密，會用錯工具。",
    phase1: { type: "flag", cipher: "SYNT{ebg13-fcva}", expect: "af48fdec1fe0cec50ddf53d1c3645ea4611b4fd21727b8bb8c51975fb722b166" }
  },
  {
    slug: "c14", code: "C14", nm: "隱藏欄位", en: "Web",
    goal: "旗幟在一個不會畫出來的輸入欄裡",
    scenario: "表單可以用 hidden 欄位帶值。瀏覽器不顯示它，但元素仍在頁面裡。",
    example: "打開線索頁，用「檢查元素」找 <b>type=\"hidden\"</b> 的 input，讀它的 value。",
    success: "沒畫出來不代表頁面上沒有這個值。",
    phase1: { type: "flag", clue: "clue/hidden.html", expect: "85da2cf389efd47070563a83756b408737996e99643718853cf3ce1de25d21fc" }
  },
  {
    slug: "c15", code: "C15", nm: "替代文字", en: "Web",
    goal: "旗幟寫在圖片的 alt，不寫在圖上",
    scenario: "圖片載入失敗或給讀屏軟體時，會用 alt 那段文字。畫面上的圖本身可以是空白的。",
    example: "打開線索頁，檢查那張圖，讀 <b>alt</b>。",
    success: "替代文字在標籤裡，不一定畫在圖片上。",
    phase1: { type: "flag", clue: "clue/alt.html", expect: "5ed16974daf4f632aa1283d6507ed968553b5f132a3bb928d6cdc93d3aeee4e9" }
  },
  {
    slug: "c16", code: "C16", nm: "JSON 檔", en: "Web",
    goal: "線索是一份 JSON，旗幟在其中一個鍵的值",
    scenario: "不是每個線索都是網頁。有的就是一個資料檔，瀏覽器會把內容直接顯示出來。",
    example: "打開線索檔，讀 <b>note</b> 的值。",
    success: "資料檔裡的字串就是這一關要送出的旗幟。",
    phase1: { type: "flag", clue: "clue/note.json", expect: "3bdb4e27f4f9870e79134567cf73a11a7c34974c07ea1bc34a4c85cf0e8a7948" }
  },
  {
    slug: "c17", code: "C17", nm: "向量圖", en: "Web",
    goal: "旗幟寫在 SVG 檔的註解裡，不在畫出來的文字上",
    scenario: "SVG 是文字格式的圖。註解不會被畫成圖形。",
    example: "打開線索檔，檢視原始碼，找 <b>&lt;!-- ... --&gt;</b>。畫面上的「線索」兩個字不是旗幟。",
    success: "圖檔若是文字格式，原始碼裡一樣可以藏註解。",
    phase1: { type: "flag", clue: "clue/mark.svg", expect: "58f7a0aa5954e72beb7abd872fbf95469aaa7b5b52dd7b90b6adec1caf868c2f" }
  },
  {
    slug: "c18", code: "C18", nm: "說明檔", en: "Web",
    goal: "有一份沒有放進選單的 humans.txt，旗幟在檔案裡",
    scenario: "有的網站會放 humans.txt 介紹維護的人。沒有連結時，知道檔名仍可以打開。",
    example: "用你現在這個網站的位址接上 <b>humans.txt</b>。課程站是 /security-course/ctf/humans.txt，本機預覽是 /ctf/humans.txt。",
    success: "檔名本身就是線索。沒有連結，不代表檔案不存在。",
    phase1: { type: "flag", clue: "humans.txt", expect: "87372af4a38b98033c385515a84a38b2858e300e02ac4201cc91c313cb196475" }
  },
  {
    slug: "c19", code: "C19", nm: "無腳本區塊", en: "Web",
    goal: "旗幟放在 noscript 裡，腳本有在跑時不會畫出來",
    scenario: "noscript 是給沒有執行 JavaScript 時顯示的內容。一般瀏覽看不到，原始碼裡還在。",
    example: "打開線索頁，檢視原始碼，找 <b>&lt;noscript&gt;</b>。",
    success: "畫面上沒出現，不代表原始碼沒有這段。",
    phase1: { type: "flag", clue: "clue/plain.html", expect: "2fe1ed6a3586b4815c7d3dd819065e1ad1d47ec63f71389ad2ef66b05236f968" }
  },
  {
    slug: "c20", code: "C20", nm: "工作階段", en: "Web",
    goal: "旗幟寫進 sessionStorage，不在 localStorage，也不在畫面上",
    scenario: "sessionStorage 跟 localStorage 都在這台瀏覽器，但工作階段儲存通常在關掉這個分頁後就清掉。",
    example: "打開線索頁，按 F12 → 應用程式 → <b>工作階段儲存空間（Session Storage）</b>，選目前這個網站。",
    success: "要看對儲存空間。放在工作階段裡的值，不會出現在本地儲存那一欄。",
    phase1: { type: "flag", clue: "clue/session.html", expect: "abd248d5d2716f0a4b608907c4cdf61f95e6ef55f3daa3133e90bc8898c5ab05" }
  }
];
