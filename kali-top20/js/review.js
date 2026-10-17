/* Kali Top 20 隨堂複習（原創）：閱讀時每題點選一次答案，立即顯示對錯與解說，之後鎖定。
   純前端；作答結果記在本機 localStorage（重新整理後仍顯示），不上傳任何資料。
   v3：每筆紀錄存「題目指紋 qv ＋ 所選選項的穩定 id」，不再存選項索引；
       載入時若題目或選項已改版（指紋不符／找不到該選項）就丟棄該筆，讓學生重新作答一次，
       避免舊版紀錄套到新題目上而顯示錯誤的對錯。v1／v2 舊紀錄無法驗證，一律清除。 */
(function () {
  "use strict";
  var KEY = "kali_top20_review_v3";
  var STALE = ["kali_top20_review_v1", "kali_top20_review_v2"];
  try { STALE.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
  var st = {};
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  if (typeof st !== "object" || st === null || Array.isArray(st)) st = {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var boxes = Array.prototype.slice.call(document.querySelectorAll("section.review"));
  var total = boxes.length;
  function isOk(b) { return !!b && b.getAttribute("data-ok") === "1"; }
  function letter(b) { return b ? (b.getAttribute("data-l") || (b.querySelector(".rv-l") || {}).textContent || "?") : "?"; }

  function reveal(box, picked) {
    var btns = Array.prototype.slice.call(box.querySelectorAll(".rv-opt"));
    var right = null;
    btns.forEach(function (b) {
      b.disabled = true;
      b.setAttribute("aria-disabled", "true");
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

  function summary() {
    var done = 0, right = 0;
    boxes.forEach(function (b) { var r = st[b.getAttribute("data-q")]; if (r) { done++; if (r.ok) right++; } });
    var txt = "🧠 隨堂複習：答對 " + right + "/" + total + "（已作答 " + done + "/" + total + "）";
    if (window.StudentAuth) window.StudentAuth.setStatus(txt);
  }

  var dirty = false;
  boxes.forEach(function (box) {
    var q = box.getAttribute("data-q"), qv = box.getAttribute("data-qv");
    var btns = Array.prototype.slice.call(box.querySelectorAll(".rv-opt"));
    var r = st[q];
    if (r) {
      var picked = null;
      if (r && typeof r === "object" && r.qv === qv && typeof r.id === "string")
        btns.forEach(function (b) { if (b.getAttribute("data-id") === r.id) picked = b; });
      if (picked) { r.ok = isOk(picked); reveal(box, picked); return; }   // 以頁面上的正解為準
      delete st[q]; dirty = true;   // 題目已改版或格式不符：丟棄，讓學生重新作答
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        if (st[q] || b.disabled) return;
        st[q] = { qv: qv, id: b.getAttribute("data-id"), ok: isOk(b), t: Date.now() };
        save(); reveal(box, b); summary();
      });
    });
  });
  if (dirty) save();
  summary();
  // StudentAuth 可能稍後才 render，登入後再補一次狀態
  document.addEventListener("DOMContentLoaded", summary);
})();
