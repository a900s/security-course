/* 隨堂複習（三套教材共用，原創）：頁面上的 <div class="review-slot" data-q="n"></div> 會被換成第 n 題的複習卡。
   點選一次答案 → 立即顯示對錯與解說，之後鎖定。題庫來自各模組 js/review-data.js（window.REVIEW_DATA）。
   作答紀錄只存在本機 localStorage（REVIEW_DATA.storageKey），不上傳任何資料。
   v3 紀錄格式：{ "<題號>": { qv: 題目指紋, id: 所選選項的穩定 id, ok, t } }；
   題目或選項改版（指紋不符／找不到該選項）就丟棄該筆，讓學生重新作答，避免舊紀錄套到新題目上。
   動態產生的頁面（如 OWASP 關卡）可在插入插槽後呼叫 ReviewCore.mount(容器)。
   作答紀錄分帳號：實際鍵＝StudentAuth.key(storageKey)（已登入→依 email 分開；未登入→匿名＝原鍵）。
   收到 "studentauth:change"（登入／換帳號／登出／重置）就重新載入該帳號的紀錄並重畫所有題卡與登入列。
   登入列狀態：「🧠 隨堂複習：答對 x/20（已作答 y/20）」；若頁面定義 window.reviewStatusPrefix()，會接在它後面。 */
(function () {
  "use strict";
  var D = window.REVIEW_DATA;
  if (!D) return;
  var BASE = D.storageKey, TOTAL = D.questions.length;
  function curKey() { return window.StudentAuth && window.StudentAuth.key ? window.StudentAuth.key(BASE) : BASE; }
  var KEY = curKey();
  var BY = {};
  D.questions.forEach(function (q) { BY[String(q.n)] = q; });
  try { (D.stale || []).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
  var st = {};
  function load() {
    KEY = curKey();
    try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
    if (typeof st !== "object" || st === null || Array.isArray(st)) st = {};
    prune();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} saved(); }
  function saved() { try { window.dispatchEvent(new Event("progress:saved")); } catch (e) {} } // 通知選用的雲端同步

  // 先清掉已改版／格式不符的紀錄（不必等插槽出現在畫面上）
  function prune() {
    var dirty = false;
    Object.keys(st).forEach(function (k) {
      var r = st[k], q = BY[k], ok = false;
      if (q && r && typeof r === "object" && r.qv === q.qv && typeof r.id === "string")
        q.options.forEach(function (o, i) { if (o.id === r.id) { ok = true; r.ok = (i === q.correct); } });
      if (!ok) { delete st[k]; dirty = true; }
    });
    if (dirty) save();
  }
  load();

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isOk(b) { return !!b && b.getAttribute("data-ok") === "1"; }
  function letter(b) { return b ? (b.getAttribute("data-l") || "?") : "?"; }

  function cardHTML(q) {
    var opts = q.options.map(function (o, i) {
      return '<li><button type="button" class="rv-opt" data-ok="' + (i === q.correct ? 1 : 0) + '" data-id="' + o.id +
        '" data-l="' + o.l + '"><span class="rv-l">' + o.l + '</span><span class="rv-t">' + esc(o.t) + '</span></button></li>';
    }).join("");
    return '<section class="review" data-q="' + q.n + '" data-qv="' + q.qv + '" aria-label="隨堂複習第 ' + q.n + ' 題">' +
      '<div class="rv-head"><span class="rv-ico">' + q.icon + '</span><b>🧠 隨堂複習 ' + q.n + '/' + TOTAL + '</b>' +
      (q.topic ? '<span class="rv-topic">' + esc(q.topic) + '</span>' : '') +
      '<span class="rv-tip">點選一次答案，立即看對錯</span></div>' +
      '<p class="rv-q">' + esc(q.stem) + '</p><ol class="rv-opts">' + opts + '</ol>' +
      '<p class="rv-exp" hidden>💡 ' + esc(q.exp) + '</p></section>';
  }

  function reveal(box, picked) {
    var btns = Array.prototype.slice.call(box.querySelectorAll(".rv-opt")), right = null;
    btns.forEach(function (b) {
      b.disabled = true; b.setAttribute("aria-disabled", "true");
      if (isOk(b)) { b.classList.add("rv-correct"); right = b; }
      if (b === picked) { b.classList.add("rv-picked"); b.setAttribute("aria-pressed", "true"); if (!isOk(b)) b.classList.add("rv-wrong"); }
    });
    var ok = isOk(picked);
    box.classList.add(ok ? "rv-done-ok" : "rv-done-ng");
    var exp = box.querySelector(".rv-exp");
    exp.hidden = false;
    var old = exp.querySelector(".rv-res"); if (old) old.remove();
    exp.insertAdjacentHTML("afterbegin", ok
      ? '<b class="rv-res ok">✅ 答對了！（你選 ' + letter(picked) + '）</b> '
      : '<b class="rv-res ng">❌ 答錯了：你選 ' + letter(picked) + '，正確答案是 ' + letter(right) + '。</b> ');
  }

  function counts() {
    var done = 0, right = 0;
    Object.keys(st).forEach(function (k) { if (BY[k]) { done++; if (st[k].ok) right++; } });
    return { done: done, right: right, total: TOTAL };
  }
  function statusText() {
    var c = counts();
    return "🧠 隨堂複習：答對 " + c.right + "/" + c.total + "（已作答 " + c.done + "/" + c.total + "）";
  }
  function refresh() {
    var pre = typeof window.reviewStatusPrefix === "function" ? window.reviewStatusPrefix() : "";
    if (window.StudentAuth) window.StudentAuth.setStatus((pre ? pre + " · " : "") + statusText());
  }

  function bind(box) {
    if (box.getAttribute("data-bound")) return;
    box.setAttribute("data-bound", "1");
    var q = box.getAttribute("data-q"), qv = box.getAttribute("data-qv");
    var btns = Array.prototype.slice.call(box.querySelectorAll(".rv-opt"));
    var r = st[q];
    if (r && r.qv === qv) {
      var picked = null;
      btns.forEach(function (b) { if (b.getAttribute("data-id") === r.id) picked = b; });
      if (picked) { r.ok = isOk(picked); reveal(box, picked); return; }
    }
    if (r) { delete st[q]; save(); }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        if (st[q] || b.disabled) return;
        if (KEY !== curKey()) load(); // 保險：帳號已變但尚未重畫時，先切到正確的帳號空間
        st[q] = { qv: qv, id: b.getAttribute("data-id"), ok: isOk(b), t: Date.now() };
        save(); reveal(box, b); refresh();
      });
    });
  }

  function mount(root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll(".review-slot[data-q]"), function (slot) {
      var q = BY[slot.getAttribute("data-q")];
      if (!q) return;
      slot.outerHTML = cardHTML(q);
    });
    Array.prototype.forEach.call(root.querySelectorAll("section.review[data-q]"), bind);
    refresh();
  }

  /* 換帳號／登出／重置：重新載入紀錄，把每張題卡換成全新未作答的版本再依新紀錄還原 */
  function reload() {
    load();
    Array.prototype.forEach.call(document.querySelectorAll("section.review[data-q]"), function (box) {
      var q = BY[box.getAttribute("data-q")];
      if (q) box.outerHTML = cardHTML(q);
    });
    Array.prototype.forEach.call(document.querySelectorAll("section.review[data-q]"), bind);
    refresh();
  }
  window.addEventListener("studentauth:change", reload);

  window.ReviewCore = { reload: reload, storageKey: function () { return KEY; }, data: D, mount: mount, refresh: refresh, statusText: statusText, counts: counts,
    slot: function (n) { return '<div class="review-slot" data-q="' + n + '"></div>'; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { mount(document); });
  else mount(document);
  // StudentAuth 可能稍後才 render，登入後再補一次狀態
  window.addEventListener("load", refresh);
})();
