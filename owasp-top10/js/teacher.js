/* OWASP Top 10 教師區（原創）：SHA-256 雜湊解鎖（與 SQL Lab / Kali 相同），
   匯入學生進度 JSON、顯示完成總覽與作答細節；並可查看本瀏覽器即時進度。 */
(function () {
  "use strict";
  var TEACHER_PASSWORD_HASH = "2962e8f9635e056b78825f80970517907447ce4e6c7537d553c24b446d1c3c70";
  var LEVELS = (window.CHALLENGES || []).map(function (c) {
    return { code: c.code, slug: c.slug, nm: c.nm, en: c.en };
  });
  var students = {};

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function sha256Hex(s) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
      return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
    });
  }
  function fmtTime(iso) {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleString("zh-TW", { hour12: false }); } catch (e) { return iso; }
  }

  document.getElementById("unlockBtn").onclick = function () {
    var msg = document.getElementById("lockMsg");
    sha256Hex(document.getElementById("pw").value).then(function (h) {
      if (h === TEACHER_PASSWORD_HASH) {
        document.getElementById("lock").hidden = true;
        document.getElementById("panel").hidden = false;
        if (window.ReviewTeacher) window.ReviewTeacher.render("answerTable");   // 20 題標準答案（含表單題號）
        renderLive();
        render();
      } else msg.textContent = "✗ 密碼錯誤。";
    }).catch(function () {
      msg.textContent = "✗ 瀏覽器不支援 Web Crypto（請用 https 或 localhost 開啟）。";
    });
  };

  document.getElementById("files").onchange = function (e) {
    var files = Array.from(e.target.files), log = [];
    Promise.all(files.map(function (f) {
      return f.text().then(function (t) {
        try {
          var d = JSON.parse(t);
          if (d.type !== "owasp-top10-progress" || !d.name || typeof d.challenges !== "object") throw 0;
          var prev = students[d.name];
          if (!prev || (d.exportedAt || "") >= (prev.exportedAt || "")) students[d.name] = d;
          log.push("✓ " + f.name);
        } catch (x) { log.push("✗ " + f.name + "（格式不符）"); }
      });
    })).then(function () {
      document.getElementById("importLog").textContent = log.join("\n");
      e.target.value = "";
      render();
    });
  };
  document.getElementById("clearBtn").onclick = function () { students = {}; render(); };

  function solvedOf(d) {
    var n = 0;
    LEVELS.forEach(function (lv) {
      var c = (d.challenges || {})[lv.slug] || {};
      if (c.solved || c.reVerified || c.phase === "verified") n++;
    });
    return n;
  }

  function render() {
    var names = Object.keys(students).sort();
    var head = "<tr><th>學生</th><th>完成</th><th>匯出時間</th>" +
      LEVELS.map(function (lv) { return "<th title='" + esc(lv.code + " " + lv.nm) + "'>" + esc(lv.code) + "</th>"; }).join("") + "</tr>";
    var col = new Array(LEVELS.length).fill(0);
    var rows = names.map(function (n) {
      var d = students[n], done = solvedOf(d), cells = "";
      LEVELS.forEach(function (lv, i) {
        var c = (d.challenges || {})[lv.slug] || {};
        var ok = !!(c.solved || c.reVerified || c.phase === "verified");
        var mid = c.phase === "fixed" || c.fixedAt;
        var found = c.phase === "found" || c.foundAt;
        if (ok) col[i]++;
        var cls = ok ? "c2" : mid ? "c1" : found ? "c1" : "c0";
        var mark = ok ? "✔✔" : mid ? "🔧" : found ? "▶" : "·";
        cells += "<td class='" + cls + "' title='" + esc(statusTip(c)) + "'>" + mark + "</td>";
      });
      return "<tr><td><button class='linkish' data-n='" + esc(n) + "'>" + esc(n) + "</button></td>" +
        "<td>" + done + "/" + LEVELS.length + "</td><td>" + esc(fmtTime(d.exportedAt)) + "</td>" + cells + "</tr>";
    }).join("");
    var foot = names.length
      ? "<tr><th colspan='3'>各關完成人數</th>" + col.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr>"
      : "";
    document.getElementById("overview").innerHTML = names.length
      ? "<table class='tgrid'>" + head + rows + foot + "</table>"
      : "<p class='hint'>尚未匯入任何進度檔。</p>";
    var allDone = names.filter(function (n) { return solvedOf(students[n]) === LEVELS.length; }).length;
    document.getElementById("stats").textContent = names.length
      ? ("共 " + names.length + " 位學生 · 全數通關 " + allDone + " 位")
      : "";
    document.getElementById("legend").textContent =
      "圖例：✔✔ 已驗證通關　🔧 已選修法　▶ 已重現弱點　· 未開始　｜ 點學生姓名看詳細作答";
    Array.prototype.forEach.call(document.querySelectorAll(".linkish"), function (btn) {
      btn.onclick = function () { showDetail(btn.getAttribute("data-n")); };
    });
  }

  function statusTip(c) {
    if (!c || !c.phase) return "未開始";
    var parts = ["階段：" + c.phase];
    if (c.payload) parts.push("payload: " + c.payload);
    if (c.chosenFix) parts.push("修法: " + c.chosenFix.slice(0, 60));
    if (c.verifiedAt) parts.push("驗證: " + c.verifiedAt);
    return parts.join(" | ");
  }

  function showDetail(name) {
    var d = students[name]; if (!d) return;
    var box = document.getElementById("detail");
    var blocks = LEVELS.map(function (lv) {
      var c = (d.challenges || {})[lv.slug] || {};
      return "<div class='dcard'><h3>" + esc(lv.code) + " " + esc(lv.nm) + " <small>" + esc(lv.en) + "</small></h3>" +
        "<table><tbody>" +
        row("狀態", c.solved || c.reVerified ? "✓ 已通關" : (c.phase || "未開始")) +
        row("重現時間", fmtTime(c.foundAt)) +
        row("使用的 payload / 選擇", c.payload || "—") +
        row("點出的問題行", c.badLine != null ? ("第 " + c.badLine + " 行") : "—") +
        row("錯誤行嘗試", (c.wrongLines || []).length ? c.wrongLines.join(", ") : "—") +
        row("選擇的修法", c.chosenFix || "—") +
        row("錯誤修法嘗試", (c.wrongFixes || []).length ? c.wrongFixes.map(function (x) { return "· " + x; }).join("<br>") : "—") +
        row("修法時間", fmtTime(c.fixedAt)) +
        row("再驗證", c.reVerified ? ("✓ " + fmtTime(c.verifiedAt)) : "尚未") +
        "</tbody></table></div>";
    }).join("");
    box.innerHTML = "<h2>📋 " + esc(name) + " 的作答細節</h2>" +
      "<p class='hint'>匯出時間：" + esc(fmtTime(d.exportedAt)) + " · 完成 " + solvedOf(d) + "/" + LEVELS.length + "</p>" + blocks;
    box.scrollIntoView({ behavior: "smooth" });
  }
  function row(k, v) { return "<tr><th>" + esc(k) + "</th><td>" + v + "</td></tr>"; }

  /* 本瀏覽器即時進度 */
  function renderLive() {
    var solved = [];
    try { solved = JSON.parse(localStorage.getItem("owasp_lab_solved") || localStorage.getItem("owasp_course_solved_v1") || "[]"); } catch (e) {}
    // 正確 key
    try { solved = JSON.parse(localStorage.getItem("owasp_course_solved_v1") || "[]"); } catch (e) { solved = []; }
    var detail = {};
    try { detail = JSON.parse(localStorage.getItem("owasp_course_progress_v1") || "{}"); } catch (e) {}
    var name = detail.name || "（未填姓名）";
    var ch = detail.challenges || {};
    var n = Array.isArray(solved) ? solved.length : 0;
    var cells = LEVELS.map(function (lv, i) {
      var c = ch[lv.slug] || {};
      var ok = !!(c.solved || c.reVerified) || (Array.isArray(solved) && solved.indexOf(i) >= 0);
      return "<td class='" + (ok ? "c2" : c.foundAt ? "c1" : "c0") + "' title='" + esc(statusTip(c)) + "'>" +
        (ok ? "✔✔" : c.fixedAt ? "🔧" : c.foundAt ? "▶" : "·") + "</td>";
    }).join("");
    document.getElementById("live").innerHTML =
      "<div class='progpanel'><b>🖥️ 本瀏覽器即時進度</b> — " + esc(name) +
      " · 已完成 " + n + "/" + LEVELS.length +
      "<div style='overflow:auto;margin-top:8px'><table class='tgrid'><tr>" +
      LEVELS.map(function (lv) { return "<th>" + esc(lv.code) + "</th>"; }).join("") +
      "</tr><tr>" + cells + "</tr></table></div>" +
      "<button type='button' class='ghost' id='liveDetail'>看本機詳細作答</button></div>";
    document.getElementById("liveDetail").onclick = function () {
      students["【本機】" + name] = {
        type: "owasp-top10-progress", name: "【本機】" + name,
        exportedAt: new Date().toISOString(), challenges: ch
      };
      // 補齊 solved
      LEVELS.forEach(function (lv, i) {
        if (Array.isArray(solved) && solved.indexOf(i) >= 0) {
          ch[lv.slug] = ch[lv.slug] || { code: lv.code, slug: lv.slug };
          ch[lv.slug].solved = true; ch[lv.slug].reVerified = true;
        }
      });
      showDetail("【本機】" + name);
    };
  }
})();
