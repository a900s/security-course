# 資安課程自製教材（Security Course Materials）

本專案是**自行撰寫**的資安課堂教材，供校園資訊管理／資安相關課程使用。
所有說明文字、程式碼與題目皆為原創，可自由上傳到你自己的 GitHub / GitHub Pages，
無需擔心第三方版權問題。

> 對應課程方向：網站威脅模式與分析 · OWASP Top 10 · SQL Injection 防禦 · Kali 攻防概念

---

## 專案內容

| 目錄 | 說明 | 開啟方式 |
|---|---|---|
| [`owasp-top10/`](owasp-top10/) | OWASP Top 10 **兩階段教學關卡**（重現弱點 → 讀程式碼 → 選修法 → 驗證）。含 A05 的 SQL / 指令 / XSS 三小關，共 12 關。每關頁末附隨堂複習（共 20 題），關卡地圖下方有總複習。純前端安全模擬。學生以 Google 登入後整頁截圖佐證；`teacher.html` 教師專區（與 SQL/Kali 同一組密碼雜湊）可匯入多份檔案並查看本機即時進度。 | 開啟 `owasp-top10/index.html` |
| [`sql-injection-lab/`](sql-injection-lab/) | SQL Injection **原理、六種攻擊型態、各語言防禦程式碼、多層防禦、互動沙盒**，每段附隨堂複習（共 20 題）＋「總複習」分頁。教師區以 SHA-256 雜湊驗證密碼（前端不存明碼），並列出 20 題標準答案與表單題號。 | 開啟 `sql-injection-lab/index.html` |
| [`kali-top20/`](kali-top20/) | **Kali Linux 最重要的 20 種破解手法與防治**：每項含用途、原理、跡象、防治。附倫理與法律聲明。每章末附 1 題隨堂複習（共 20 題），文末有總複習；學生以 Google 登入後整頁截圖佐證；`teacher.html` 教師區（與 SQL Lab 同一組密碼雜湊）可匯入多份檔案看完成度總覽。 | 閱讀 `kali-top20/README.md`，或開啟 `kali-top20/index.html` |

根目錄的 [`index.html`](index.html) 是三套教材的導覽入口。

---

## 學生登入、截圖佐證與學習內容驗證

三套學生頁面（`owasp-top10/`、`kali-top20/`、`sql-injection-lab/`）已改為：

- **移除「匯出 JSON」**與以匯入 JSON 為前提的文字；學生改以**整頁截圖**作為學習佐證。
- **Google 登入**：每頁頂端有 Google Identity Services 登入按鈕。登入後會以
  「`✅ 已登入：王小明 · student@…`」橫幅顯示姓名（email 以小字呈現），旁邊同時顯示
  學習進度／測驗分數，方便一次截圖同時帶到「身分＋狀態」。純前端，不上傳任何資料。
- **學習內容驗證（20 題）**：「📝 學習內容驗證（20 題）」按鈕連到各自的 Google 表單測驗
  （4 選 1、自動計分）。表單第 1–10 題為原本題目（凍結不改），第 11–20 題為新增題。
  題目內容見 [`_quizzes/`](_quizzes/)（`owasp-quiz.md` / `kali-quiz.md` / `sql-quiz.md`
  與機器可讀的 `quizzes.json`，由 `_quizzes/build_quizzes.py` 產生）。

### 共用設定檔（含待填 PLACEHOLDER）

| 檔案 | 用途 | 需替換的字串 |
|---|---|---|
| [`js/google-auth-config.js`](js/google-auth-config.js) | Google 登入用戶端 ID | `REPLACE_ME.apps.googleusercontent.com` |
| [`js/forms-config.js`](js/forms-config.js) | 三份學習內容驗證表單網址 | `OWASP_FORM_URL_REPLACE_ME`、`KALI_FORM_URL_REPLACE_ME`、`SQL_FORM_URL_REPLACE_ME` |

三個頁面都以相對路徑載入上述根目錄設定檔與共用的
[`js/student-auth.js`](js/student-auth.js)，並以同一組 `.gsi` / `.formcta` 樣式維持一致外觀。
Kali 頁由 `kali-top20/build.py` 產生。

### 隨堂複習／總複習（三套共用、同一格式）

- 每套教材 **20 題**，題庫是 `_quizzes/<owasp|kali|sql>-review20.json`（依頁面順序；`section`＝頁面題號、
  `formQ`＝Google 表單題號）。表單第 1–10 題與原題逐字相同，第 11–20 題＝題庫中 `source: "new"` 的 10 題。
- 共用程式：[`js/review-core.js`](js/review-core.js)（頁內隨堂複習卡：點一次即顯示對錯並鎖定，
  紀錄存本機 localStorage v3＝題目指紋＋選項穩定 id）、[`js/final-review.js`](js/final-review.js)
  （總複習：隨機 10 題／全部 20 題，每次打亂題序與選項）、[`js/review-teacher.js`](js/review-teacher.js)
  （教師區 20 題答案表，標出表單題號）、[`css/review.css`](css/review.css)。
- 改題目後執行 **`./build.sh`**：重建 `quizzes.json`／`*-quiz.md`、Kali 頁面，驗證（20 題、表單第 1–10 題未變、
  正解 A–D 各 5 題）、產生各模組 `js/review-data.js`，並為 CSS/JS 加上內容雜湊 `?v=` 防止舊快取。

### 設定 Google 登入（OAuth Web Client ID）

1. 到 Google Cloud Console → 「API 和服務」→「憑證」→ 建立「OAuth 2.0 用戶端 ID」，
   應用程式類型選 **網頁應用程式（Web）**。
2. 在「**已授權的 JavaScript 來源**」加入：`https://a900s.github.io`
   （本機測試可另外加入 `http://localhost:8080`）。本專案用 GIS，不需填重新導向 URI。
3. 複製產生的用戶端 ID（形如 `xxxxxx.apps.googleusercontent.com`），
   貼到 `js/google-auth-config.js` 的 `window.GOOGLE_CLIENT_ID`。

### 填入表單網址

建立三份 Google 表單測驗後，把各自的「填寫網址」分別填入 `js/forms-config.js`
的 `OWASP_FORM_URL` / `KALI_FORM_URL` / `SQL_FORM_URL`。未填妥前，按鈕會停用並提示。

> 備註：`teacher.html` 教師頁暫時維持原狀；學生端已改以截圖佐證，匯入功能可擇期再調整。

---

## 授權建議

- **說明文件**（Markdown、教學文字）：建議採用 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
  （姓名標示—非商業性）。
- **教學用程式碼**（HTML / CSS / JS）：建議採用 [MIT License](https://opensource.org/licenses/MIT)。
- 詳見 [`LICENSE`](LICENSE)。

本專案**不包含、也不複製**任何第三方受著作權保護的原始碼或說明文字。
OWASP Top 10、工具名稱等為業界通用名詞／分類，屬事實性資訊。

---

## 本地預覽

```bash
# 任選一種方式：
# 1) 直接用瀏覽器開啟各子目錄的 index.html
# 2) 用簡易 HTTP 伺服器（建議，避免部分瀏覽器對 file:// 的限制）
cd security-course
python3 -m http.server 8080
# 然後打開 http://localhost:8080/
```

---

## 部署到 GitHub Pages

1. 在你的 GitHub 帳號建立一個新的空儲存庫（例如 `security-course`）。
2. 把本資料夾推上去：

```bash
cd security-course
git init
git add .
git commit -m "Initial: self-authored security course materials"
git branch -M main
git remote add origin https://github.com/<你的帳號>/security-course.git
git push -u origin main
```

3. 到儲存庫 **Settings → Pages**，Source 選 `Deploy from a branch`，Branch 選 `main` / `/ (root)`。
4. 幾分鐘後即可用 `https://<你的帳號>.github.io/security-course/` 存取。

> 若儲存庫名稱是 `<帳號>.github.io`，則會直接掛在根網域。

---

## 重要注意事項

### 教師密碼（SQL Lab）

`sql-injection-lab/js/app.js` 以 SHA-256 雜湊比對教師密碼，前端不存明碼：

```js
var TEACHER_PASSWORD_HASH = "…";  // echo -n "你的密碼" | sha256sum
```

更換密碼時，產生新雜湊後覆寫 `TEACHER_PASSWORD_HASH`。**提醒**：雜湊仍可能被離線暴力嘗試；
正式需要真正保密時，應改由後端驗證。

### 倫理與法律

所有教材皆為**授權環境內的教學／防禦學習**用途。
請勿對未授權系統進行掃描、入侵或攻擊。詳見 `kali-top20/README.md` 開頭的聲明。

### 與既有線上示範的關係

本專案在概念上參考了課堂常見的「OWASP Top 10 兩階段關卡」與「SQL Injection 互動實驗室」教學架構，
但**文字、程式碼、題目、樣式皆為從頭自行撰寫**，並非複製既有儲存庫的檔案。

---

## 目錄結構

```
security-course/
├── README.md
├── LICENSE
├── index.html                 # 導覽入口
├── owasp-top10/
│   ├── index.html
│   ├── css/style.css
│   ├── teacher.html
│   └── js/{challenges.js,engine.js,teacher.js}
├── sql-injection-lab/
│   ├── index.html
│   ├── css/style.css
│   └── js/{app.js,quiz.js}
└── kali-top20/
    ├── README.md
    ├── index.html             # 由 build.py 自 README.md 產生
    ├── teacher.html           # 教師區：匯入學生進度 JSON 看完成度
    ├── js/{progress.js,teacher.js}
    ├── build.py
    └── css/style.css
```
