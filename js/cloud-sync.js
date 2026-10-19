/* 選用的雲端進度同步（Firebase Auth + Firestore，三套教材共用，原創）。
   ・js/firebase-config.js 未填 → CloudSync.configured() 為 false，什麼都不做、不載入 SDK，網站照舊只用本機進度。
   ・已填 → 學生用 Google 登入（GIS）後，沿用同一個 ID token：
       signInWithCredential(auth, GoogleAuthProvider.credential(idToken))，不必再登入一次。
     文件：progress/{email 小寫} = { owasp:{review, solved, levelProgress}, kali:{review}, sql:{review}, name, email, updatedAt }
   ・登入時：雲端與本機合併（作答取聯集；同一題兩邊都有時取時間較新者，沒有時間就以雲端為準；OWASP 關卡取聯集），
     寫回本機並重畫，再把合併結果寫回雲端。之後每次作答變動 1.5 秒後寫一次（debounce）。
   ・重置我的進度：本機與雲端（本教材欄位）一起清除；若當下離線，下次同步時以本機（已清空）為準，不會被雲端舊資料蓋回。
   ・離線／錯誤：進度照樣存在本機，登入列顯示「⚠️ 未同步」，恢復連線或下次變動時自動重試。
   ・教師頁（沒有學生登入列 #gsiArea）只用來登入與讀取全部學生進度（CloudSync.listAll，需在 teachers 名單）。 */
(function () {
  "use strict";
  var C = window.FIREBASE_CONFIG || {};
  var V = window.FIREBASE_SDK_VERSION || "13.0.0";
  var BASE = (window.FIREBASE_SDK_BASE || "https://www.gstatic.com/firebasejs/") + V + "/";
  function configured() {
    return !!(C && C.apiKey && C.projectId && C.appId && !/REPLACE|填入|YOUR_/i.test(C.apiKey + C.projectId + C.appId));
  }
  var API = { configured: configured };
  window.CloudSync = API;
  if (!configured()) return; // ← 未設定：到此為止，完全不影響網站

  /* 各教材在本機的鍵（基底鍵，實際鍵經 StudentAuth.key() 依帳號分開）與雲端欄位對應 */
  var MODS = {
    owasp: { review: "owasp_top10_review_v3", solved: "owasp_course_solved_v1", levelProgress: "owasp_course_progress_v1" },
    kali: { review: "kali_top20_review_v3" },
    sql: { review: "sql_lab_review_v3" }
  };
  var DEF = { review: function () { return {}; }, solved: function () { return []; }, levelProgress: function () { return { name: "", challenges: {} }; } };
  var DEBOUNCE = API.DEBOUNCE_MS = 1500;
  /* 失敗保護：SDK 載入、Firebase 登入、第一次讀取各最多等 5 秒，寫入最多 10 秒；任何失敗都只會顯示「未同步」，
     頁面一律照本機（localStorage）運作，30 秒後或恢復連線時再重試。SDK 是動態 import，不會擋住頁面載入。 */
  var T_STEP = API.STEP_TIMEOUT_MS = window.CLOUD_SYNC_TIMEOUT_MS || 5000, TIMEOUT = 10000;
  var SA = function () { return window.StudentAuth; };
  function lower(e) { return String(e == null ? "" : e).trim().toLowerCase(); }
  function mod() { var m = window.REVIEW_DATA && window.REVIEW_DATA.module; return MODS[m] ? m : ""; }
  function progressMode() { return !!(mod() && document.getElementById("gsiArea")); }

  /* ---------- SDK（動態 import，只在已設定時才載入） ---------- */
  var fbP = null;
  function sdk() {
    if (!fbP) fbP = timeout(Promise.all([import(BASE + "firebase-app.js"), import(BASE + "firebase-auth.js"), import(BASE + "firebase-firestore.js")])
      .then(function (m) {
        var app = (m[0].getApps && m[0].getApps().length) ? m[0].getApps()[0] : m[0].initializeApp(C);
        return { A: m[1], F: m[2], auth: m[1].getAuth(app), db: m[2].getFirestore(app) };
      }), T_STEP);
    fbP.catch(function () { fbP = null; }); // 載入失敗（離線）下次再試
    return fbP;
  }
  function timeout(p, ms) {
    return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, ms); })]);
  }
  /* 確保 Firebase Auth 登入的是同一個 email；已持久化的登入可直接用，否則用 GIS 的 ID token 換 */
  function ensureAuth(fb, email) { return timeout(ensureAuth0(fb, email), T_STEP); }
  function ensureAuth0(fb, email) {
    return (fb.auth.authStateReady ? fb.auth.authStateReady() : Promise.resolve()).then(function () {
      var cu = fb.auth.currentUser;
      if (cu && lower(cu.email) === email) return cu;
      var t = SA() && SA().getIdToken();
      if (!t) { var e = new Error("need-signin"); e.code = "need-signin"; throw e; }
      return fb.A.signInWithCredential(fb.auth, fb.A.GoogleAuthProvider.credential(t)).then(function (r) {
        if (lower(r.user.email) !== email) throw new Error("email-mismatch");
        return r.user;
      });
    });
  }

  /* ---------- 本機讀寫 ---------- */
  function jget(k) { try { var v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } }
  function readLocal(m) {
    var o = {};
    Object.keys(MODS[m]).forEach(function (f) { var v = jget(SA().key(MODS[m][f])); o[f] = v == null ? DEF[f]() : v; });
    return JSON.parse(JSON.stringify(o)); // 去掉 undefined，Firestore 不收
  }
  function writeLocal(m, o) {
    Object.keys(MODS[m]).forEach(function (f) { try { localStorage.setItem(SA().key(MODS[m][f]), JSON.stringify(o[f] == null ? DEF[f]() : o[f])); } catch (e) {} });
  }

  /* ---------- 合併規則 ---------- */
  function newer(a, b, ta, tb) { // a=本機, b=雲端；兩邊都有時間取較新，否則以雲端為準
    if (a == null) return b; if (b == null) return a;
    return (isFinite(ta) && isFinite(tb) && ta > tb) ? a : b;
  }
  function tnum(x) { return typeof x === "number" ? x : (x ? Date.parse(x) : NaN); }
  function merge(m, local, cloud) {
    var out = {};
    Object.keys(MODS[m]).forEach(function (f) {
      var a = local[f], b = cloud[f];
      if (f === "review") {
        var r = {}; a = a || {}; b = b || {};
        Object.keys(a).concat(Object.keys(b)).forEach(function (k) {
          r[k] = newer(a[k], b[k], a[k] && tnum(a[k].t), b[k] && tnum(b[k].t));
        });
        out[f] = r;
      } else if (f === "solved") {
        var s = {}; (Array.isArray(a) ? a : []).concat(Array.isArray(b) ? b : []).forEach(function (i) { if (typeof i === "number") s[i] = 1; });
        out[f] = Object.keys(s).map(Number).sort(function (x, y) { return x - y; });
      } else if (f === "levelProgress") {
        a = a || {}; b = b || {};
        var ca = a.challenges || {}, cb = b.challenges || {}, c = {};
        Object.keys(ca).concat(Object.keys(cb)).forEach(function (k) {
          c[k] = newer(ca[k], cb[k], ca[k] && tnum(ca[k].updatedAt), cb[k] && tnum(cb[k].updatedAt));
        });
        out[f] = { name: b.name || a.name || "", challenges: c };
      }
    });
    return JSON.parse(JSON.stringify(out));
  }
  API._merge = merge; // 供測試

  /* 重置後尚未成功寫到雲端：記號存在本機，下次同步以本機為準 */
  function lwKey(email, m) { return "cloud_localwins::" + m + "::" + email; }

  /* ---------- 登入列狀態 ---------- */
  var lastState = "";
  function status(st, msg) {
    lastState = st; API.state = st;
    var h = st === "ok" ? "☁️ 已同步" : st === "busy" ? "☁️ 同步中…"
      : "⚠️ 未同步" + (msg ? "（" + msg + "）" : "");
    if (SA() && SA().setCloud) SA().setCloud('<span title="雲端進度（Firebase）">' + h + "</span>");
  }
  function errMsg(e) {
    var c = (e && (e.code || e.message)) || "";
    if (/need-signin/.test(c)) return "請登出再登入一次以同步";
    if (/permission/.test(c)) return "雲端拒絕存取";
    return "離線或連線失敗，進度先存在本機";
  }

  /* ---------- 同步流程 ---------- */
  var gen = 0, dirty = false, tmr = null, retry = null, mergedFor = ""; // mergedFor：已和雲端合併過的帳號（合併前絕不覆寫雲端）
  function curEmail() { var u = SA() && SA().getUser(); return u ? lower(u.email) : ""; }
  function docRef(fb, email) { return fb.F.doc(fb.db, "progress", email); }

  function syncIn() {
    if (!progressMode()) return Promise.resolve();
    var email = curEmail(), m = mod();
    if (!email) return Promise.resolve();
    var my = ++gen;
    status("busy");
    return sdk().then(function (fb) {
      return ensureAuth(fb, email).then(function () { return timeout(fb.F.getDoc(docRef(fb, email)), T_STEP); });
    }).then(function (snap) {
      if (my !== gen || curEmail() !== email) return;
      var data = snap.exists() ? (snap.data() || {}) : {};
      var local = readLocal(m), merged;
      if (localStorage.getItem(lwKey(email, m))) merged = local;
      else merged = merge(m, local, data[m] || {});
      var changed = JSON.stringify(merged) !== JSON.stringify(local);
      if (changed) { writeLocal(m, merged); SA().notify("cloud"); }
      mergedFor = email;
      dirty = true;
      return flush();
    }).catch(function (e) { if (my === gen) { dirty = true; status("err", errMsg(e)); scheduleRetry(); } });
  }

  function flush() {
    clearTimeout(tmr); tmr = null;
    if (!progressMode()) return Promise.resolve();
    var email = curEmail(), m = mod(), u = SA().getUser();
    if (!email || !dirty) return Promise.resolve();
    if (mergedFor !== email) return syncIn(); // 尚未和雲端合併（例如登入時離線）→ 先合併再寫
    var my = gen;
    dirty = false;
    status("busy");
    return sdk().then(function (fb) {
      return ensureAuth(fb, email).then(function () {
        var data = { name: String(u.name || ""), email: email, updatedAt: fb.F.serverTimestamp() };
        data[m] = readLocal(m);
        return timeout(fb.F.setDoc(docRef(fb, email), data, { mergeFields: [m, "name", "email", "updatedAt"] }), TIMEOUT);
      });
    }).then(function () {
      try { localStorage.removeItem(lwKey(email, m)); } catch (e) {}
      if (my === gen && curEmail() === email && !dirty) status("ok");
    }).catch(function (e) {
      if (curEmail() === email) { dirty = true; status("err", errMsg(e)); scheduleRetry(); }
    });
  }
  function schedule() {
    if (!progressMode() || !curEmail()) return;
    dirty = true;
    if (lastState !== "err") status("busy");
    clearTimeout(tmr); tmr = setTimeout(flush, DEBOUNCE);
  }
  function scheduleRetry() { clearTimeout(retry); retry = setTimeout(function () { if (dirty) flush(); }, 30000); }

  window.addEventListener("progress:saved", schedule);
  window.addEventListener("online", function () { if (curEmail() && progressMode()) (mergedFor === curEmail() ? flush() : syncIn()); });
  window.addEventListener("studentauth:change", function (ev) {
    var r = ev.detail && ev.detail.reason;
    if (r === "cloud") return;
    if (r === "signin" || r === "switch") { dirty = false; mergedFor = ""; clearTimeout(tmr); syncIn(); return; }
    if (r === "reset") {
      var email = curEmail();
      if (email && progressMode()) { try { localStorage.setItem(lwKey(email, mod()), "1"); } catch (e) {} dirty = true; flush(); }
      return;
    }
    if (r === "signout") {
      gen++; dirty = false; mergedFor = ""; clearTimeout(tmr); clearTimeout(retry); lastState = "";
      if (fbP) fbP.then(function (fb) { return fb.A.signOut(fb.auth); }).catch(function () {});
    }
  });

  /* ---------- 教師：讀取全部學生進度（需 teachers/{email} 名單，規則見 firestore.rules） ---------- */
  API.listAll = function () {
    var email = curEmail();
    if (!email) return Promise.reject(Object.assign(new Error("請先用 Google 登入"), { code: "need-signin" }));
    return sdk().then(function (fb) {
      return ensureAuth(fb, email).then(function () {
        return timeout(fb.F.getDoc(fb.F.doc(fb.db, "teachers", email)), TIMEOUT);
      }).then(function (t) {
        if (!t.exists()) throw Object.assign(new Error("此帳號不在 teachers 教師名單"), { code: "not-teacher" });
        return timeout(fb.F.getDocs(fb.F.collection(fb.db, "progress")), TIMEOUT);
      }).then(function (qs) {
        var rows = [];
        qs.forEach(function (d) { var x = d.data() || {}; x.id = d.id; rows.push(x); });
        return rows;
      });
    });
  };
  API.syncNow = function () { return syncIn(); };

  function start() { if (curEmail() && progressMode()) syncIn(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
