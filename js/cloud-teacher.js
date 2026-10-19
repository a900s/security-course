/* 教師區：雲端學生進度總表（選用，三套教材共用，原創）。
   只有在 js/firebase-config.js 已設定時才會出現；放在教師密碼解鎖後的 <div id="cloudTeacher"></div>。
   教師需用 Google 登入，且 email 已列在 Firestore 的 teachers/{email} 名單（見 firestore.rules）。
   表格：email、姓名、三教材隨堂複習已作答／答對、OWASP 關卡數、最後更新；可匯出 CSV（UTF-8 BOM，Excel 可直接開）。
   注意：分數由學生端瀏覽器回報，僅供學習歷程參考，正式成績仍以 Google 表單為準。 */
(function () {
  "use strict";
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cnt(m) {
    var r = (m && m.review) || {}, done = 0, ok = 0;
    Object.keys(r).forEach(function (k) { done++; if (r[k] && r[k].ok) ok++; });
    return { done: done, ok: ok };
  }
  function when(t) {
    try { var d = t && t.toDate ? t.toDate() : (t ? new Date(t) : null); return d && !isNaN(d) ? d.toLocaleString("zh-TW", { hour12: false }) : ""; }
    catch (e) { return ""; }
  }
  function toRow(x) {
    var o = cnt(x.owasp), k = cnt(x.kali), s = cnt(x.sql);
    var lv = x.owasp && Array.isArray(x.owasp.solved) ? x.owasp.solved.length : 0;
    return [x.email || x.id, x.name || "", o.done, o.ok, lv, k.done, k.ok, s.done, s.ok, when(x.updatedAt)];
  }
  var HEAD = ["email", "姓名", "OWASP 已作答/20", "OWASP 答對", "OWASP 關卡/12", "Kali 已作答/20", "Kali 答對", "SQL 已作答/20", "SQL 答對", "最後更新"];
  function csv(rows) {
    return "\ufeff" + [HEAD].concat(rows).map(function (r) {
      return r.map(function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(",");
    }).join("\r\n");
  }

  function mount(host) {
    if (!host || !(window.CloudSync && window.CloudSync.configured())) return; // 未設定雲端：不顯示任何東西
    var SA = window.StudentAuth, rows = [];
    host.className = (host.className + " progpanel").trim();
    function render(msg) {
      var u = SA && SA.getUser();
      var h = '<b>☁️ 雲端學生進度（Firestore）</b> ';
      if (!u) {
        h += '<span class="hint">請用已列入教師名單的 Google 帳號登入</span><div id="ctBtn" style="margin-top:8px"></div>';
        host.innerHTML = h;
        if (SA && SA.mountButton) SA.mountButton(document.getElementById("ctBtn"));
        return;
      }
      h += '<span class="hint">以 ' + esc(u.email) + ' 登入</span> ' +
        '<button type="button" data-ct="load">重新整理</button> <button type="button" data-ct="csv"' + (rows.length ? "" : " disabled") + '>匯出 CSV</button> ' +
        '<button type="button" class="ghost" data-ct="out">登出</button>' +
        '<div class="hint" data-ct="msg" style="margin:6px 0">' + esc(msg || "") + '</div>';
      if (rows.length) {
        h += '<div style="overflow:auto"><table class="tgrid ct-table"><thead><tr>' + HEAD.map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") +
          '</tr></thead><tbody>' + rows.map(function (r) { return "<tr>" + r.map(function (v) { return "<td>" + esc(v) + "</td>"; }).join("") + "</tr>"; }).join("") +
          '</tbody></table></div><p class="hint">分數由學生端回報，僅供學習歷程參考；正式成績以 Google 表單為準。</p>';
      }
      host.innerHTML = h;
      host.querySelector('[data-ct="load"]').onclick = load;
      host.querySelector('[data-ct="out"]').onclick = function () { SA.signOut(); };
      host.querySelector('[data-ct="csv"]').onclick = function () {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv(rows)], { type: "text/csv;charset=utf-8" }));
        a.download = "學生雲端進度_" + new Date().toISOString().slice(0, 10) + ".csv";
        document.body.appendChild(a); a.click(); a.remove();
      };
    }
    function load() {
      render("讀取中…");
      window.CloudSync.listAll().then(function (list) {
        rows = list.map(toRow).sort(function (a, b) { return String(a[0]).localeCompare(String(b[0])); });
        render("共 " + rows.length + " 位學生");
      }).catch(function (e) { rows = []; render("⚠️ " + ((e && e.message) || "讀取失敗")); });
    }
    window.addEventListener("studentauth:change", function () { rows = []; if (SA.getUser()) load(); else render(); });
    if (SA && SA.getUser()) load(); else render();
  }
  window.CloudTeacher = { mount: mount, _csv: csv, _row: toRow };
  function auto() { mount(document.getElementById("cloudTeacher")); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
