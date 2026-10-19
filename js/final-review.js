/* 總複習（三套教材共用，原創）：從同一份 20 題題庫（window.REVIEW_DATA）抽「隨機 10 題」或「全部 20 題」，
   每次開始都重新洗題序與選項順序，逐題作答、立即回饋，最後顯示得分與逐題解析。
   不需手動填姓名：已用 Google 登入時，結果卡會帶出登入姓名，方便截圖。成績不上傳、不存檔。
   用法：頁面放 <div id="finalReview"></div>，或在動態頁面呼叫 FinalReview.mount(元素)。 */
(function () {
  "use strict";
  var D = window.REVIEW_DATA;
  if (!D) return;
  var TOTAL = D.questions.length;
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var L = "ABCD";

  function mount(host) {
    if (!host || host.getAttribute("data-fr")) return;
    host.setAttribute("data-fr", "1");
    var S = null;
    function setup() {
      host.innerHTML =
        '<div class="fr-card"><div class="fr-head"><span class="fr-ico">🧠</span><div><h2>總複習</h2>' +
        '<p class="fr-sub">' + esc(D.title) + '：從本頁 ' + TOTAL + ' 題隨堂複習題庫出題，每次題序與選項都會重新打亂。</p></div></div>' +
        '<div class="fr-modes" role="radiogroup" aria-label="題數">' +
        '<label><input type="radio" name="frCount" value="10" checked> 隨機 10 題</label>' +
        '<label><input type="radio" name="frCount" value="' + TOTAL + '"> 全部 ' + TOTAL + ' 題</label></div>' +
        '<button type="button" class="fr-btn" data-act="start">開始總複習 →</button>' +
        '<p class="fr-note">用 Google 登入後，結果畫面會顯示你的姓名，可直接截圖繳交。</p></div>';
      host.querySelector('[data-act="start"]').onclick = start;
    }
    function start() {
      var r = host.querySelector('input[name="frCount"]:checked');
      var n = r ? +r.value : 10;
      var qs = shuffle(D.questions.slice()).slice(0, n).map(function (q) {
        var opts = shuffle(q.options.map(function (o, i) { return { t: o.t, ok: i === q.correct }; }));
        return { q: q, opts: opts };
      });
      S = { qs: qs, i: 0, right: 0, log: [] };
      render();
    }
    function render() {
      var it = S.qs[S.i], q = it.q;
      var pct = Math.round(S.i / S.qs.length * 100);
      host.innerHTML =
        '<div class="fr-card"><div class="fr-prog"><div style="width:' + pct + '%"></div></div>' +
        '<div class="fr-meta">第 ' + (S.i + 1) + ' / ' + S.qs.length + ' 題 · 目前答對 ' + S.right + '</div>' +
        '<div class="fr-qh"><span class="fr-ico">' + q.icon + '</span>' + (q.topic ? '<span class="rv-topic">' + esc(q.topic) + '</span>' : '') + '</div>' +
        '<p class="fr-q">' + esc(q.stem) + '</p><ol class="rv-opts">' +
        it.opts.map(function (o, i) {
          return '<li><button type="button" class="rv-opt" data-i="' + i + '"><span class="rv-l">' + L[i] + '</span><span class="rv-t">' + esc(o.t) + '</span></button></li>';
        }).join("") + '</ol><div class="fr-fb"></div></div>';
      Array.prototype.forEach.call(host.querySelectorAll(".rv-opt"), function (b) {
        b.onclick = function () { answer(+b.getAttribute("data-i")); };
      });
    }
    function answer(ci) {
      var it = S.qs[S.i], btns = host.querySelectorAll(".rv-opt");
      if (btns[0].disabled) return;
      var ri = 0;
      it.opts.forEach(function (o, i) { if (o.ok) ri = i; });
      var ok = ci === ri;
      if (ok) S.right++;
      S.log.push({ q: it.q, pick: it.opts[ci].t, ans: it.opts[ri].t, pl: L[ci], al: L[ri], ok: ok });
      Array.prototype.forEach.call(btns, function (b, i) {
        b.disabled = true;
        if (i === ri) b.classList.add("rv-correct");
        if (i === ci && !ok) b.classList.add("rv-wrong");
      });
      var last = S.i + 1 >= S.qs.length;
      host.querySelector(".fr-fb").innerHTML =
        '<p class="rv-exp">' + (ok ? '<b class="rv-res ok">✅ 答對了！</b> ' : '<b class="rv-res ng">❌ 你選 ' + L[ci] + '，正確答案是 ' + L[ri] + '。</b> ') +
        '💡 ' + esc(it.q.exp) + '</p><button type="button" class="fr-btn" data-act="next">' + (last ? '看結果' : '下一題 →') + '</button>';
      host.querySelector('[data-act="next"]').onclick = function () { S.i++; if (S.i < S.qs.length) render(); else result(); };
    }
    function result() {
      var u = window.StudentAuth && window.StudentAuth.getUser && window.StudentAuth.getUser();
      var n = S.qs.length, pct = Math.round(S.right / n * 100);
      var who = u ? '<b>' + esc(u.name || "（未提供姓名）") + '</b>' + (u.email ? ' <span class="fr-mail">· ' + esc(u.email) + '</span>' : '')
        : '<span class="fr-warn">尚未登入 Google（截圖前請先在上方登入，畫面才會顯示姓名）</span>';
      var rows = S.log.map(function (a, i) {
        return '<li class="' + (a.ok ? "ok" : "ng") + '"><b>' + (i + 1) + '. ' + a.q.icon + ' ' + esc(a.q.stem) + '</b><br>' +
          (a.ok ? '✅ ' + esc(a.ans) : '❌ 你選：' + esc(a.pick) + '<br>✔ 正解：' + esc(a.ans)) +
          '<div class="fr-exp">💡 ' + esc(a.q.exp) + '</div></li>';
      }).join("");
      host.innerHTML =
        '<div class="fr-card fr-result"><h2>🎯 總複習結果</h2><p class="fr-who">' + who + '</p>' +
        '<p class="fr-score">' + esc(D.title) + ' 總複習：答對 <b>' + S.right + ' / ' + n + '</b>（' + pct + ' 分）</p>' +
        '<p class="fr-time">完成時間：' + esc(new Date().toLocaleString("zh-TW", { hour12: false })) + '</p>' +
        '<div class="fr-row"><button type="button" class="fr-btn" data-act="again">再做一次</button></div>' +
        '<h3>📋 逐題解析</h3><ol class="fr-log">' + rows + '</ol></div>';
      host.querySelector('[data-act="again"]').onclick = setup;
      host.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setup();
    // 換帳號／登出／重置：結果卡上的姓名會過時，回到開始畫面重新作答
    window.addEventListener("studentauth:change", function (ev) { if (ev.detail && ev.detail.reason === "cloud") return; if (document.body.contains(host)) setup(); });
  }

  window.FinalReview = { mount: mount };
  function auto() { mount(document.getElementById("finalReview")); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
