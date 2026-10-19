# 自動測試（開發用，不影響網站）

```bash
cd tests && npm i puppeteer-core@23 firebase@12 @firebase/rules-unit-testing@5 firebase-tools@15   # 第一次
node test.js          # 本機進度依帳號分開：A/B 帳號切換、登出、重置（三模組）
node test-cloud.js    # 雲端同步（以假 Firebase SDK 模擬）：合併、debounce、重置、離線、教師總表、gstatic/Firestore 被擋或逾時時頁面仍完整可用
cp ../firestore.rules ../firebase.json . && npx firebase emulators:exec --only firestore --project demo-sc "node rules-test.mjs"   # Firestore 規則（需 Java）
```
測試腳本預設 repo 在 `/workspace/security-course`、Chrome 在 `/usr/bin/google-chrome`，換環境請改檔頭路徑。
