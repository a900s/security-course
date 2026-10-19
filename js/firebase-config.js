/* 選用：Firebase Firestore 雲端進度同步設定（由 Hermes 建立 Firebase 專案後填入）。
   ・全部留空（預設）＝不啟用雲端：網站完全照舊，只用本機 localStorage（依登入 email 分開），也不會載入 Firebase SDK。
   ・填入後：學生用 Google 登入時會沿用同一個 ID token 登入 Firebase Auth（不必登入兩次），
     進度存到 Firestore 的 progress/{email 小寫}，換電腦也能接續。
   ・這份 Web 設定（apiKey 等）本來就是公開資訊、不是密碼；真正的存取控制在 firestore.rules。
   取得方式：Firebase 主控台 → 專案設定 → 一般 → 你的應用程式（網頁）→ SDK 設定 → 「設定」。 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDgxH1j-z73GiZi4DiIBuQIl14uBKR4Gsk",
  authDomain: "security-course-progress.firebaseapp.com",
  projectId: "security-course-progress",
  appId: "1:965650655219:web:35ee6cb115d0c08da99486"
  // storageBucket、messagingSenderId 不需要；有也可以照貼
};
/* Firebase JS SDK 版本（固定版本，從 gstatic CDN 以 ES module 動態載入；升級前請先測試） */
window.FIREBASE_SDK_VERSION = "13.0.0";
