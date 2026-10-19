# Hermes 任務：建立 Firebase 學習進度資料庫（Firestore）

> 執行帳號：**a900s@lgm.kh.edu.tw**（Hermes 本機登入的帳號）
> 交辦人：myzopoda hong（由 Grok Bot 整理，2026-10-19）
> 完成後請在同一個雲端資料夾寫回 `HERMES_回報_YYYYMMDD.md`（格式見文末）。

## 0. 背景（先讀）

- 網站：<https://a900s.github.io/security-course/>（GitHub：a900s/security-course，三個模組 OWASP／Kali／SQL）。
- 現況：學生用 Google 登入（Google Identity Services），進度存在**瀏覽器本機**（依登入 email 分開）。
- 程式已經寫好「選用的雲端同步」：`js/cloud-sync.js`、`js/cloud-teacher.js`、`firestore.rules`。
  **只要 `js/firebase-config.js` 還是空的，網站就完全照舊**，不會載入 Firebase。
- 你的工作：建立 Firebase 專案 → 開 Google 登入 → 建 Firestore → 貼規則 → 加教師名單 → 填 `js/firebase-config.js` → 測試。
- 資料位置：Firestore `progress/{email 小寫}`，欄位 `owasp{review,solved,levelProgress}`、`kali{review}`、`sql{review}`、`name`、`email`、`updatedAt`。

### 失敗保護（已內建，供你理解，不需要設定）
- Firebase SDK 是**非同步動態載入**，不會擋住頁面。
- SDK 載入、Firebase 登入、第一次讀取各最多等 **5 秒**，寫入最多 10 秒。
- 任何失敗（被擋、離線、逾時、權限錯誤、設定錯）都**安靜退回本機 localStorage**：作答、總複習、重置、登出全部照常，只在右上登入列顯示小字「⚠️ 未同步」，30 秒後或恢復連線時自動重試。
- 所以設定錯了也不會讓學生無法使用；但請照第 7 節測試確認真的有「☁️ 已同步」。

## 1. 重要決定：專案歸屬與 OAuth 用戶端（已由使用者確認）

- **Firebase 專案必須由 a900s@lgm.kh.edu.tw 建立並擁有**：建立一個**新的** Firebase 專案。
  **不要**把 Firebase 加到 myzopoda@gmail.com 名下的 GCP 專案 `security-course-auth`。
- 網站目前用的 Google 登入用戶端 ID（在 myzopoda 的 `security-course-auth` 專案裡）：
  `786059338381-5kl9mqq7tr7429snku3j1qnaahlnb6f9.apps.googleusercontent.com`
- 為什麼這件事重要：網站用 `signInWithCredential(GoogleAuthProvider.credential(idToken))` 把 GIS 拿到的 ID token 直接交給 Firebase Auth（學生不必登入兩次）。
  Firebase 只接受「**受眾（aud）是本專案的 OAuth 用戶端**，或是**列在 Google 提供者『外部專案用戶端 ID 白名單』裡**」的 ID token，否則會回 `auth/invalid-credential`（畫面顯示「未同步」）。

兩種做法：

| | **A（建議）**：白名單現有用戶端 ID | B：在 a900s 專案新建 Web OAuth 用戶端 |
|---|---|---|
| 要做的事 | Firebase Auth → Google 提供者 → 把上面那個 client ID 加進白名單 | 新建 OAuth 同意畫面＋Web 用戶端、設定授權來源、**發布**同意畫面，改 `js/google-auth-config.js` |
| 網站登入流程 | 完全不變 | 換 client ID，學生第一次會看到新的授權畫面 |
| 同意畫面 | 沿用已發布（實際運作中）且有隱私權／服務條款頁的設定 | 要重新設定、發布；可能再出現「未經驗證的應用程式」警告 |
| 風險 | 依賴 myzopoda 的 `security-course-auth` 繼續存在 | 全部在 a900s 名下，無外部依賴 |

**建議採用 A**：改動最少（只加一個白名單），學生登入體驗不變，已發布的同意畫面與隱私權／條款頁都能沿用；Firebase 資料與規則仍完全在 a900s 名下。
B 留作備案：如果以後 `security-course-auth` 要移除或交回，再改用 B（見第 8 節）。

## 2. 建立 Firebase 專案（a900s）

1. 用 a900s@lgm.kh.edu.tw 開 <https://console.firebase.google.com/> → 「建立專案」。
2. 專案名稱建議：`security-course-progress`（專案 ID 會自動產生，記下來）。
3. Google Analytics：**不需要**，關閉。
4. 方案：免費的 Spark 即可（不需要綁帳單）。
5. 若學校 Workspace 不允許建立專案（出現組織政策錯誤），**停下來**，把錯誤截圖與訊息寫進回報檔，請使用者處理；不要改用其他帳號建立。

## 3. 新增網頁應用程式，取得設定

1. 專案總覽 → 「</>」新增網頁應用程式，暱稱 `security-course-web`；**不要**勾 Firebase Hosting。
2. 複製 `firebaseConfig` 內的 `apiKey`、`authDomain`、`projectId`、`appId`（這些是**公開資訊，不是密碼**，可以寫進程式與回報檔）。

## 4. 開啟 Authentication 的 Google 提供者

1. Authentication → 開始使用 → 登入方式 → **Google** → 啟用。
2. 「專案的公開名稱」填 `資安教材`；支援電子郵件選 a900s@lgm.kh.edu.tw。
3. 展開「**將外部專案的用戶端 ID 加入許可清單**」（Allowlist client IDs from external projects / Web SDK configuration），加入：
   `786059338381-5kl9mqq7tr7429snku3j1qnaahlnb6f9.apps.googleusercontent.com` → 儲存。
4. Authentication → 設定 → **已授權網域** → 新增 `a900s.github.io`（保留預設的 localhost 等）。

## 5. 建立 Firestore 並貼上規則

1. Firestore Database → 建立資料庫 → Standard 版本、**正式版模式（production mode）**。
2. 位置選 **asia-east1（台灣）**（建立後不能改）。
3. 「規則」分頁：把 repo 的 `firestore.rules` **整份**貼上 → 發布。
   規則重點：只有已驗證 email 的 Google 登入者能讀寫 `progress/{自己的 email 小寫}`；`teachers/{email}` 名單內的教師可讀全部；欄位型別與大小粗略檢查；其他一律拒絕。

## 6. 新增教師名單

Firestore → 資料 → 新增集合 `teachers`：
- 文件 ID：`a900s@lgm.kh.edu.tw`（**全部小寫**），欄位 `name`（字串）＝`a900s`。
- 若使用者要用其他教師帳號查看，也照樣新增（文件 ID 一律是小寫 email）。名單只能在主控台維護，網頁不能改。

## 7. 填入 `js/firebase-config.js` 並發布

1. 取得 repo：`git clone https://github.com/a900s/security-course.git`（a900s 帳號有權限）。
2. 編輯 `js/firebase-config.js`，把第 3 步的四個值填入 `apiKey`、`authDomain`、`projectId`、`appId`（`FIREBASE_SDK_VERSION` 不要動）。
3. 執行 `./build.sh`（需 python3 與 `pip install markdown`），確認全部 ✓（會更新 `?v=` 快取參數）。
4. commit（訊息例：「啟用 Firestore 雲端進度同步」）→ push 到 main，等 1–2 分鐘 GitHub Pages 更新。
   若你無法 push，就把四個值寫進回報檔，由 Grok Bot 代為更新。
5. （選用）Google Cloud Console → API 和服務 → 憑證 → Firebase 自動建立的 Browser key → 應用程式限制「HTTP 參照網址」加 `https://a900s.github.io/*`。

## 8. 測試清單（請逐項打勾寫進回報）

用一般瀏覽器（建議無痕視窗，先 Ctrl+F5）：
- [ ] 開 Kali 頁，用一個學生測試帳號登入 → 右上出現「☁️ 已同步」。
- [ ] 作答 2 題 → 幾秒後 Firestore 出現 `progress/<該 email 小寫>`，`kali.review` 有 2 筆、`updatedAt` 有值。
- [ ] 換另一台電腦／另一個瀏覽器用同帳號登入 → 同樣顯示 2 題已作答。
- [ ] OWASP 完成第 1 關 → 文件出現 `owasp.solved`。
- [ ] 按「重置我的進度」→ 確認 → 本頁進度歸零，Firestore 該教材的 `review` 變成空的，其他教材不受影響。
- [ ] 登出 → 右上不再顯示雲端狀態。
- [ ] 另一個學生帳號看不到第一個學生的資料（規則會擋；可用 Firestore 規則模擬器測 `get /progress/別人的email` 應拒絕）。
- [ ] 教師頁（`owasp-top10/teacher.html` 或 `kali-top20/teacher.html`，或 SQL 頁「教師區」）→ 輸入教師密碼解鎖 → 「☁️ 雲端學生進度」→ 用 a900s 登入 → 看到學生總表 → 「匯出 CSV」用 Excel 開中文正常。
- [ ] 非教師帳號在教師頁登入 → 顯示「此帳號不在 teachers 教師名單」。
- [ ] 失敗保護：開發者工具 → Network → 封鎖 `www.gstatic.com`（Block request domain）後重新整理 → 頁面照常可作答，右上顯示「⚠️ 未同步」，主控台沒有紅色錯誤。

若顯示「⚠️ 未同步（雲端拒絕存取）」：多半是規則沒發布或 email 未驗證；若是 `auth/invalid-credential`（開發者工具主控台可見）：多半是第 4 步白名單沒加或 client ID 打錯。

### 備案 B（只有決定不依賴 security-course-auth 時才做）
1. 在同一個 Firebase 專案對應的 GCP 專案：API 和服務 → OAuth 同意畫面（外部、應用程式名稱「資安教材」，隱私權 `https://a900s.github.io/security-course/privacy.html`、條款 `https://a900s.github.io/security-course/terms.html`）→ **發布**。
2. 憑證 → 建立 OAuth 用戶端 ID → 網頁應用程式 → 已授權的 JavaScript 來源 `https://a900s.github.io`。
3. 把新 client ID 填進 `js/google-auth-config.js` 的 `window.GOOGLE_CLIENT_ID`，`./build.sh`、push。
4. 同一專案的 client 不必加白名單；但仍要完成第 8 節測試。

## 9. 回報（寫回同一個雲端資料夾）

檔名：`HERMES_回報_YYYYMMDD.md`，內容：
- Firebase 專案名稱、專案 ID、擁有者（應為 a900s@lgm.kh.edu.tw）
- 採用 A 或 B；白名單是否已加入
- Firestore 位置、規則是否已發布（可貼發布時間）
- teachers 名單（email 列表）
- `firebase-config.js` 四個值（公開資訊）與 commit 連結；或「無法 push，請 Grok Bot 代填」
- 第 8 節測試結果（逐項打勾，失敗項附截圖或錯誤訊息）
- 遇到的問題／需要使用者決定的事項

**不要做的事**：不要把專案加到 myzopoda 的 security-course-auth；不要把規則改成 `allow read, write: if true`；不要在任何文件寫入密碼或私密金鑰（Firebase web config 不算私密）。
