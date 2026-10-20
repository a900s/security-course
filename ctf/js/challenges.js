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
  }
];
