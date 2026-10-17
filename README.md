# 資安課程自製教材（Security Course Materials）

本專案是**自行撰寫**的資安課堂教材，供校園資訊管理／資安相關課程使用。
所有說明文字、程式碼與題目皆為原創，可自由上傳到你自己的 GitHub / GitHub Pages，
無需擔心第三方版權問題。

> 對應課程方向：網站威脅模式與分析 · OWASP Top 10 · SQL Injection 防禦 · Kali 攻防概念

---

## 專案內容

| 目錄 | 說明 | 開啟方式 |
|---|---|---|
| [`owasp-top10/`](owasp-top10/) | OWASP Top 10 **兩階段教學關卡**（重現弱點 → 讀程式碼 → 選修法 → 驗證）。含 A05 的 SQL / 指令 / XSS 三小關，共 12 關。純前端安全模擬。 | 開啟 `owasp-top10/index.html` |
| [`sql-injection-lab/`](sql-injection-lab/) | SQL Injection **原理、六種攻擊型態、各語言防禦程式碼、多層防禦、互動沙盒、18 題隨堂測驗**。教師解答區的密碼為可設定佔位值。 | 開啟 `sql-injection-lab/index.html` |
| [`kali-top20/`](kali-top20/) | **Kali Linux 最重要的 20 種破解手法與防治**：每項含用途、原理、跡象、防治。附倫理與法律聲明。 | 閱讀 `kali-top20/README.md`，或開啟 `kali-top20/index.html` |

根目錄的 [`index.html`](index.html) 是三套教材的導覽入口。

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

`sql-injection-lab/js/app.js` 最上方有：

```js
var TEACHER_PASSWORD = "CHANGE_ME_教師密碼請自行修改";
```

請改成你自己的值。**提醒**：任何寫在前端的密碼都能被學生從原始碼看到；
正式需要保密時，應改由後端驗證，切勿在前端寫死真實密碼。

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
│   └── js/{challenges.js,engine.js}
├── sql-injection-lab/
│   ├── index.html
│   ├── css/style.css
│   └── js/{app.js,quiz.js}
└── kali-top20/
    ├── README.md
    ├── index.html             # 由 build.py 自 README.md 產生
    ├── build.py
    └── css/style.css
```
