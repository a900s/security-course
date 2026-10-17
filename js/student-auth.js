/* 學生 Google 登入（Google Identity Services）— 三套教材共用模組。
   目的：讓學生在頁面上用 Google 登入後，畫面頂端顯示姓名（與 email），
   並在旁邊顯示學習進度／測驗分數，方便「截圖」繳交作為學習佐證。
   需求：在 js/google-auth-config.js 設定 window.GOOGLE_CLIENT_ID。
   說明：純前端；僅在瀏覽器端解碼 ID Token 的顯示欄位（name/email/picture）
         用於畫面呈現，不會把任何資料上傳到伺服器。 */
(function () {
  "use strict";
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function decodeJwt(t) {
    try {
      var p = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(decodeURIComponent(escape(atob(p))));
    } catch (e) { return null; }
  }

  var statusHtml = "";

  function render() {
    var area = document.getElementById("gsiArea");
    if (!area) return;
    var u = window.StudentAuth._user;
    if (u) {
      area.className = "gsi gsi-in";
      area.innerHTML =
        '<div class="gsi-id"><span class="gsi-ok">✅ 已登入：</span>' +
        '<b class="gsi-name">' + esc(u.name || "（未提供姓名）") + '</b>' +
        (u.email ? ' <span class="gsi-mail">· ' + esc(u.email) + '</span>' : '') +
        '</div>' +
        '<div class="gsi-status" id="gsiStatus">' + statusHtml + '</div>' +
        '<button type="button" class="gsi-out" id="gsiOut">登出</button>';
      var out = document.getElementById("gsiOut");
      if (out) out.onclick = function () { window.StudentAuth.signOut(); };
    } else {
      area.className = "gsi gsi-signedout";
      area.innerHTML =
        '<div class="gsi-txt"><b>🔐 用 Google 登入後截圖佐證</b>' +
        '<span>登入後畫面會顯示你的姓名與學習進度／分數，請整頁截圖繳交給老師。</span></div>' +
        '<div id="gsiBtn" class="gsi-btn-host"></div>' +
        '<div class="gsi-hint" id="gsiHint"></div>';
      mountButton();
    }
  }

  function mountButton() {
    var host = document.getElementById("gsiBtn");
    if (!host) return;
    var cid = window.GOOGLE_CLIENT_ID || "";
    if (!cid || /REPLACE_ME/.test(cid)) {
      host.innerHTML = '<div class="gsi-warn">⚠ 尚未設定 Google Client ID（js/google-auth-config.js），登入按鈕暫時停用。</div>';
      return;
    }
    if (!(window.google && window.google.accounts && window.google.accounts.id)) {
      setTimeout(mountButton, 400); // 等 GIS 腳本載入
      return;
    }
    window.google.accounts.id.initialize({ client_id: cid, callback: onCredential });
    window.google.accounts.id.renderButton(host, {
      theme: "filled_blue", size: "large", text: "signin_with", shape: "pill", locale: "zh-TW"
    });
  }

  function onCredential(resp) {
    var p = decodeJwt(resp.credential);
    if (!p) return;
    window.StudentAuth._user = { name: p.name, email: p.email, picture: p.picture };
    try { sessionStorage.setItem("gsi_user", JSON.stringify(window.StudentAuth._user)); } catch (e) {}
    render();
  }

  window.StudentAuth = {
    _user: null,
    getUser: function () { return this._user; },
    setStatus: function (html) {
      statusHtml = html || "";
      var s = document.getElementById("gsiStatus");
      if (s) s.innerHTML = statusHtml;
    },
    signOut: function () {
      this._user = null;
      try { sessionStorage.removeItem("gsi_user"); } catch (e) {}
      if (window.google && window.google.accounts && window.google.accounts.id)
        window.google.accounts.id.disableAutoSelect();
      render();
    },
    init: function () {
      try { var s = sessionStorage.getItem("gsi_user"); if (s) this._user = JSON.parse(s); } catch (e) {}
      render();
    }
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", function () { window.StudentAuth.init(); });
  else window.StudentAuth.init();
})();
