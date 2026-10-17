/* OWASP Top 10 教學關卡引擎 — 原創撰寫。
   採單頁式（hash 路由）：#/ 為關卡地圖，#/<slug> 為單一關卡。
   進度存在 localStorage，完成一關才解鎖下一關。純前端、無任何後端。 */
(function () {
  "use strict";
  var KEY = "owasp_course_solved_v1";
  var L = window.CHALLENGES;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function getSolved() {
    try { var c = localStorage.getItem(KEY); return new Set(c ? JSON.parse(c) : []); }
    catch (e) { return new Set(); }
  }
  function addSolved(i) { var s = getSolved(); s.add(i); try { localStorage.setItem(KEY, JSON.stringify(Array.from(s))); } catch (e) {} }
  /* 詳細學習紀錄（供教師區）：各階段時間、payload、選的修法、再驗證狀態 */
  var DKEY = "owasp_course_progress_v1";
  function loadP() { try { return JSON.parse(localStorage.getItem(DKEY)) || { name: "", challenges: {} }; } catch (e) { return { name: "", challenges: {} }; } }
  function saveP(p) { try { localStorage.setItem(DKEY, JSON.stringify(p)); } catch (e) {} }
  var CUR = null;
  function rec(fn) {
    if (!CUR) return;
    var p = loadP(), c = p.challenges[CUR.slug] || { code: CUR.code, slug: CUR.slug, nm: CUR.nm, en: CUR.en };
    fn(c); c.updatedAt = new Date().toISOString();
    p.challenges[CUR.slug] = c; saveP(p);
  }
  function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem(DKEY); } catch (e) {} }
  function isUnlocked(i) { return i <= 0 ? true : getSolved().has(i - 1); }

  function progress() {
    var n = getSolved().size, t = L.length;
    var a = document.getElementById("pnum"); if (a) a.textContent = n;
    var b = document.getElementById("ptot"); if (b) b.textContent = t;
    var f = document.getElementById("pfill"); if (f) f.style.width = (t ? n / t * 100 : 0) + "%";
    // 同步頂端 Google 登入列的進度文字與地圖上的「我的學習進度」（每次進度變動都要更新）
    var sum = document.getElementById("studSum");
    if (sum) sum.textContent = "已完成 " + n + "/" + t + " 關" + (window.ReviewCore ? " · " + window.ReviewCore.statusText() : "");
    // 登入列：關卡進度 n/12 ＋ 隨堂複習 x/20（由共用 ReviewCore 組合，見 window.reviewStatusPrefix）
    if (window.ReviewCore) window.ReviewCore.refresh();
    else if (window.StudentAuth) window.StudentAuth.setStatus(statusPrefix());
  }

  function statusPrefix() { return "OWASP Top 10 進度：已完成 " + getSolved().size + "/" + L.length + " 關"; }
  window.reviewStatusPrefix = statusPrefix;

  /* 隨堂複習：每關頁末 1–2 題（題庫 js/review-data.js 的 slug 對應關卡），由共用 ../js/review-core.js 產生題卡 */
  function reviewFor(slug) {
    var R = window.REVIEW_DATA;
    if (!R || !window.ReviewCore) return "";
    var qs = R.questions.filter(function (q) { return q.slug === slug; });
    if (!qs.length) return "";
    return '<div class="lvreview"><div class="maphead"><h2>🧠 本關隨堂複習</h2><div class="hint">點選一次答案，立即看對錯；共 ' + R.total + ' 題分布在 12 個關卡</div></div>' +
      qs.map(function (q) { return window.ReviewCore.slot(q.n); }).join("") + '</div>';
  }

  var app = document.getElementById("app");

  /* ---------- 關卡地圖 ---------- */
  function renderMap() {
    CUR = null;
    var solved = getSolved();
    var cells = L.map(function (lv, i) {
      var unlocked = isUnlocked(i), done = solved.has(i);
      var st = done ? "solved" : (unlocked ? "open" : "locked");
      var stat = done ? "✓" : (unlocked ? "▶" : "🔒");
      var pill = done ? "已修復" : (unlocked ? "可開始" : "未解鎖");
      var inner =
        '<span class="stat">' + stat + '</span>' +
        '<span class="code">' + esc(lv.code) + '</span>' +
        '<span class="nm">' + esc(lv.nm) + '</span>' +
        '<span class="en">' + esc(lv.en) + '</span>' +
        '<span class="goal">' + esc(lv.goal) + '</span>' +
        '<span class="pill">' + pill + '</span>';
      if (unlocked) return '<a class="cell ' + st + '" href="#/' + lv.slug + '">' + inner + '</a>';
      return '<div class="cell ' + st + '">' + inner + '</div>';
    }).join("");
    var final = solved.size >= L.length
      ? '<div class="final"><h2>★ 十大類別全數完成</h2><p>你已親手重現並修復 OWASP Top 10 的每一種弱點。更完整的原理與程式碼修法，請回到課堂教材。</p></div>'
      : "";
    app.innerHTML =
      '<section class="hero">' +
      '<div class="eyebrow">重現弱點 · 讀程式碼 · 動手修</div>' +
      '<h1>OWASP Top 10 漏洞實作</h1>' +
      '<p>每一關都是兩階段：先在安全模擬中<b>重現弱點</b>，再閱讀示意用的<b>脆弱程式碼</b>、點出問題行、挑出正確修法，並用<b>同一招</b>驗證攻擊已失效。A05 注入分為 SQL、指令、XSS 三小關。</p>' +
      '<div class="warn">⚠ 全部為教學用<b>安全模擬</b>：使用假資料、不連線任何真實系統、不執行任何真實指令或腳本。僅限在你自己或已獲授權的環境中學習，請勿對未授權的系統進行測試。</div>' +
      '</section>' +
      '<div class="studbar" id="studbar">' +
        '<b>📒 我的學習進度</b> <span id="studSum"></span>' +
        '<div class="hint">登入上方 Google 帳號後，畫面會一起顯示你的姓名與進度，請整頁截圖繳交給老師。進度只存在本機瀏覽器。</div>' +
      '</div>' +
      '<aside class="formcta"><div class="formcta-txt"><b>📝 學習內容驗證（20 題）</b><span>完成關卡、各關隨堂複習與下方總複習後，請作答這份 20 題選擇題測驗（自動計分），檢核學習成效。</span></div><a class="formcta-btn" data-quiz-form="owasp" href="#" target="_blank" rel="noopener">📝 開始學習內容驗證 ↗</a></aside>' +
      '<div class="maphead"><h2>關卡</h2><div class="hint">完成一關後自動解鎖下一關</div></div>' +
      '<div class="grid">' + cells + '</div>' + final +
      '<section class="final-review" aria-label="總複習"><div id="finalReview"></div></section>';
    progress();
    if (window.FinalReview) window.FinalReview.mount(document.getElementById("finalReview"));
  }

  /* ---------- 兩階段：程式碼修復 ---------- */
  function fmtline(ln) {
    var m = ln.match(/^([\s\S]*?)(\s*(?:\/\/|#)[\s\S]*)$/);
    if (/^\s*(\/\/|#)/.test(ln)) return '<span class="cmt">' + esc(ln) + '</span>';
    if (m) return '<span>' + esc(m[1]) + '</span><span class="cmt">' + esc(m[2]) + '</span>';
    return '<span>' + esc(ln) + '</span>';
  }
  function renderCodeFix(host, cf, onDone) {
    var h = '<div class="q">🔍 這是本關後端<b>有漏洞的程式碼</b>（' + esc(cf.lang) + '）。先<b>點出造成漏洞的那一行</b>：</div>';
    h += '<div class="codebox" id="codebox"></div>';
    h += '<div id="pick" hidden></div><div class="fb" id="fb" style="display:none"></div>';
    host.innerHTML = h; host.hidden = false;
    var box = document.getElementById("codebox"), pick = document.getElementById("pick"),
      fb = document.getElementById("fb"), lineDone = false;
    cf.lines.forEach(function (ln, i) {
      if (ln === "") return;
      var row = document.createElement("div");
      row.className = "ln";
      row.innerHTML = '<span class="lno">' + (i + 1) + '</span>' + fmtline(ln);
      row.onclick = function () {
        if (lineDone) return;
        if (i === cf.bad) {
          lineDone = true; row.classList.add("bad");
          fb.style.display = ""; fb.className = "fb ok";
          fb.textContent = "✓ 沒錯，問題就在這一行。接著挑出正確的修法。";
          rec(function (c) { c.badLine = i + 1; c.badLineAt = new Date().toISOString(); });
          showPick();
        } else {
          row.classList.add("miss");
          setTimeout(function () { row.classList.remove("miss"); }, 500);
          fb.style.display = ""; fb.className = "fb no";
          fb.textContent = "✗ 這一行沒問題，再找找。";
          rec(function (c) { c.wrongLines = (c.wrongLines || []).concat([i + 1]); });
        }
      };
      box.appendChild(row);
    });
    function showPick() {
      var order = cf.fixes.map(function (f) { return { t: f[0], ok: !!f[1] }; });
      for (var k = order.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1)), tmp = order[k]; order[k] = order[j]; order[j] = tmp;
      }
      pick.innerHTML = '<div class="q">🔧 該怎麼改才真正安全？點一個：</div>';
      order.forEach(function (o) {
        var card = document.createElement("div");
        card.className = "fixcard";
        card.innerHTML = fmtline(o.t);
        card.onclick = function () {
          if (pick.classList.contains("done")) return;
          if (o.ok) {
            pick.classList.add("done"); card.classList.add("ok");
            fb.className = "fb ok"; fb.textContent = "✓ 正確，正在套用這個修法…";
            rec(function (c) { c.chosenFix = o.t; c.fixCorrect = true; c.fixedAt = new Date().toISOString(); c.phase = "fixed"; });
            setTimeout(function () { host.hidden = true; onDone(); }, 600);
          } else {
            card.classList.add("wrong");
            fb.className = "fb no"; fb.textContent = "✗ 這個改法擋不住這種攻擊，再想想。";
            rec(function (c) { c.wrongFixes = (c.wrongFixes || []).concat([o.t]); });
          }
        };
        pick.appendChild(card);
      });
      pick.hidden = false;
    }
  }

  /* ---------- 單一關卡 ---------- */
  function renderLevel(idx) {
    var lv = L[idx]; CUR = lv;
    if (!isUnlocked(idx)) { location.hash = "#/"; return; }
    var next = L[idx + 1];
    var html =
      '<div class="lvhead"><div class="lc">' + esc(lv.code) + '</div>' +
      '<div><div class="lt">' + esc(lv.nm) + '</div><div class="le">' + esc(lv.en) + '</div></div></div>' +
      '<div class="card"><span class="lab">情境</span><p>' + lv.scenario + '</p></div>' +
      '<div class="card"><span class="lab">💡 怎麼下手</span><p>' + lv.example + '</p></div>' +
      '<div class="card"><span class="lab">任務（兩階段：重現 → 修復）</span>' +
      '<p><b>① 重現：</b>' + esc(lv.goal) + '。<br><b>② 修復：</b>讀下方漏洞程式碼、點出問題行、挑出正確修法套用，再用同一招驗證它已失效。</p></div>' +
      '<div class="phases"><div class="phase active" id="ph1"><b>STEP 1</b>重現弱點</div>' +
      '<div class="phase" id="ph2"><b>STEP 2</b>修復並驗證</div></div>' +
      '<div class="sandbox" id="sandbox"></div>' +
      '<div class="fixwrap" id="fixwrap" hidden></div>' +
      '<div class="stepmsg" id="step"></div>' +
      '<div class="success" id="success"><h3>✓ 完成：弱點已修復</h3>' +
      '<div class="donebadge">✓ 已完成這一關：' + esc(lv.en) + '</div>' +
      '<p>' + esc(lv.success) + '</p>' +
      (next ? '<p style="margin-top:4px">已解鎖下一關 <b>' + esc(next.code) + ' ' + esc(next.nm) + '</b></p>' : '<p style="margin-top:4px">這是最後一關，你已完成全部！</p>') +
      '<div class="pagenav"><a class="btn sec" href="#/">← 回關卡地圖</a><span class="sp"></span>' +
      (next ? '<a class="btn" href="#/' + next.slug + '">下一關 ' + esc(next.code) + ' →</a>' : '') +
      '</div></div>' + reviewFor(lv.slug);
    app.innerHTML = html;
    if (window.ReviewCore) window.ReviewCore.mount(app);
    progress();
    buildSandbox(lv, idx);
  }

  var state = {};
  function toPhase2(lv, idx, foundMsg, payload) {
    document.getElementById("ph1").className = "phase done";
    document.getElementById("ph2").className = "phase active";
    var step = document.getElementById("step");
    step.innerHTML = "✓ <b>重現成功！</b>" + foundMsg + " 現在到下方漏洞程式碼點出問題行、挑出修法。";
    rec(function (c) { c.foundAt = c.foundAt || new Date().toISOString(); if (payload != null) c.payload = String(payload); c.phase = "found"; });
    renderCodeFix(document.getElementById("fixwrap"), lv.codefix, function () {
      applyFix(lv, idx);
    });
  }
  function applyFix(lv, idx) {
    state.fixed = true;
    var m = document.getElementById("mode");
    if (m) { m.className = "modebar safe"; m.textContent = "目前程式：已套用修復（安全）"; }
    var step = document.getElementById("step");
    step.innerHTML = "✓ 修法已套用。<b>用同一招再試一次</b>，確認攻擊已經失效。";
    var fixBtn = document.getElementById("fixBtn"); if (fixBtn) fixBtn.hidden = true;
  }
  function verified(lv, idx) {
    document.getElementById("ph2").className = "phase done";
    addSolved(idx); progress();
    rec(function (c) { c.solved = true; c.reVerified = true; c.verifiedAt = new Date().toISOString(); c.phase = "verified"; });
    var s = document.getElementById("success"); s.classList.add("show");
    s.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function buildSandbox(lv, idx) {
    state = { found: false, fixed: false, verified: false };
    var p = lv.phase1, sb = document.getElementById("sandbox");
    var needMode = (lv.slug === "a05-sqli");

    if (p.type === "action") {
      sb.innerHTML = '<div class="app-title">' + esc(p.label) + '</div>' +
        '<div class="btnrow"><button class="btn" id="go">' + esc(p.button) + '</button></div>' +
        '<div id="out"></div>';
      document.getElementById("go").onclick = function () {
        document.getElementById("out").innerHTML = '<div class="leak">' + p.leak + '</div>';
        if (!state.found) { state.found = true; toPhase2(lv, idx, lv.success.split("——")[0], "[action]"); }
        else if (state.fixed && !state.verified) {} // action 類別重現即算，不重複驗證
      };
      // action 類別：修復後不需再操作，直接在套用修法後驗證
      state._actionAfterFix = function () { verified(lv, idx); };
      return;
    }

    if (p.type === "choose") {
      var opts = p.options.map(function (o, i) {
        return '<div class="chip" data-i="' + i + '" style="display:block;margin-top:8px">' + esc(o) + '</div>';
      }).join("");
      sb.innerHTML = '<div class="app-title">' + esc(p.label) + '</div>' + opts + '<div id="out"></div>';
      Array.prototype.forEach.call(sb.querySelectorAll('.chip'), function (el) {
        el.onclick = function () {
          var i = +el.getAttribute("data-i");
          if (i === p.answer) {
            document.getElementById("out").innerHTML = '<div class="leak">' + p.leak + '</div>';
            if (!state.found) { state.found = true; toPhase2(lv, idx, "你挑對了。", p.options[i]); }
          } else {
            document.getElementById("out").innerHTML = '<div class="note">這個看起來是正常的套件，再看看哪個名稱／來源／版本最可疑。</div>';
          }
        };
      });
      state._actionAfterFix = function () { verified(lv, idx); };
      return;
    }

    // input 類（含 sqli）
    var chips = (p.chips || []).map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join("");
    sb.innerHTML =
      '<div class="app-title">🧪 安全模擬</div>' +
      (needMode ? '<div class="modebar vuln" id="mode">目前程式：字串拼接（有漏洞）</div>' : '') +
      '<label class="fld">' + esc(p.label) + '</label>' +
      '<input id="inp" type="text" placeholder="' + esc(p.placeholder || "") + '" autocomplete="off" spellcheck="false">' +
      (chips ? '<div class="chips">' + chips + '</div>' : '') +
      (needMode ? '<div style="margin-top:10px">系統組出的查詢指令：</div><div class="sqlbar" id="sql"></div>' : '') +
      '<div class="btnrow"><button class="btn" id="go">執行</button>' +
      '<button class="btn fix" id="fixBtn" hidden>🔧 套用修復</button></div>' +
      '<div id="out"></div>';
    var inp = document.getElementById("inp"), out = document.getElementById("out");
    Array.prototype.forEach.call(sb.querySelectorAll('.chip'), function (el) {
      el.onclick = function () { inp.value = el.textContent; inp.focus(); if (needMode) renderSql(); };
    });

    var USERS = [["1", "王小明", "0912-111-111"], ["2", "陳大華", "0922-222-222"],
      ["3", "林美玲", "0933-333-333"], ["1000", "系統管理員", "0912-000-000"]];
    function renderSql() {
      var el = document.getElementById("sql"); if (!el) return;
      if (!state.fixed) el.innerHTML = "SELECT name, phone FROM members WHERE id = '<b>" + esc(inp.value) + "</b>';";
      else el.innerHTML = "SELECT name, phone FROM members WHERE id = <b>?</b>;　<span style='color:var(--muted)'>／ 參數 = [\"" + esc(inp.value) + "\"]</span>";
    }
    function sqliTable() {
      var h = "<table class='tbl'><thead><tr><th>ID</th><th>姓名</th><th>電話</th></tr></thead><tbody>";
      USERS.forEach(function (r) { h += "<tr><td>" + r[0] + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>"; });
      return h + "</tbody></table>";
    }
    if (needMode) renderSql();
    inp.oninput = function () { if (needMode) renderSql(); };

    document.getElementById("go").onclick = function () {
      var v = inp.value;
      if (needMode) renderSql();
      if (!state.fixed) {
        // 漏洞仍在：命中即重現
        if (p.test(v)) {
          if (lv.slug === "a05-sqli") {
            out.innerHTML = "<div class='leak'>⚠ 回傳 " + USERS.length + " 筆（整張表）</div>" + sqliTable();
          } else {
            out.innerHTML = "<div class='leak'>" + p.leak + "</div>";
          }
          if (!state.found) { state.found = true; toPhase2(lv, idx, lv.success.split("——")[0], v); }
        } else {
          var r = p.onFail ? p.onFail(v) : { note: "沒有觸發弱點，再試試。" };
          out.innerHTML = "<div class='note'>" + esc(r.note) + "</div>";
        }
      } else {
        // 已修復：同一招應失效
        if (p.test(v)) {
          out.innerHTML = "<div class='note'>✓ 攻擊已失效：輸入只被當成資料處理，再也取不到不該取的東西了。</div>";
          if (!state.verified) { state.verified = true; verified(lv, idx); }
        } else {
          out.innerHTML = "<div class='note'>這是正常輸入，系統正常回應。把剛才的攻擊字串再貼一次來驗證。</div>";
        }
      }
    };
  }

  // 攔截「套用修復」按鈕：在 phase2 選對修法後，engine 會呼叫 applyFix，
  // 而 input 類需要使用者再操作一次來驗證；action/choose 類直接驗證。
  var _origApply = applyFix;
  applyFix = function (lv, idx) {
    _origApply(lv, idx);
    // 顯示修復按鈕狀態
    if (lv.phase1.type === "action" || lv.phase1.type === "choose") {
      var step = document.getElementById("step");
      step.innerHTML = "✓ 修法已套用，這個弱點不再成立。";
      if (state._actionAfterFix) setTimeout(state._actionAfterFix, 400);
    }
  };

  /* ---------- 路由 ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    if (!h) { renderMap(); window.scrollTo(0, 0); return; }
    var idx = L.findIndex(function (l) { return l.slug === h; });
    if (idx < 0) { location.hash = "#/"; return; }
    renderLevel(idx); window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  var rb = document.getElementById("resetBtn");
  if (rb) rb.onclick = function () { reset(); location.hash = "#/"; route(); };

  route();
})();
