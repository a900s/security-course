/* Kali Top 20 隨堂複習（原創）：閱讀時每題點選一次答案，立即顯示對錯與解說，之後鎖定。
   純前端；作答結果記在本機 localStorage（重新整理後仍顯示），不上傳任何資料。 */
(function () {
  "use strict";
  var KEY = "kali_top20_review_v1";
  var st = {};
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var boxes = Array.prototype.slice.call(document.querySelectorAll("section.review"));
  var total = boxes.length;

  function reveal(box, picked) {
    var btns = box.querySelectorAll(".rv-opt");
    Array.prototype.forEach.call(btns, function (b, i) {
      b.disabled = true;
      if (b.getAttribute("data-ok") === "1") b.classList.add("rv-correct");
      if (i === picked && b.getAttribute("data-ok") !== "1") b.classList.add("rv-wrong");
      if (i === picked) b.classList.add("rv-picked");
    });
    var ok = btns[picked] && btns[picked].getAttribute("data-ok") === "1";
    box.classList.add(ok ? "rv-done-ok" : "rv-done-ng");
    var exp = box.querySelector(".rv-exp");
    exp.hidden = false;
    exp.insertAdjacentHTML("afterbegin", ok ? '<b class="rv-res ok">✅ 答對了！</b> ' : '<b class="rv-res ng">❌ 答錯了，正確答案已標示。</b> ');
  }

  function summary() {
    var done = 0, right = 0;
    boxes.forEach(function (b) { var r = st[b.getAttribute("data-q")]; if (r) { done++; if (r.ok) right++; } });
    var txt = "🧠 隨堂複習：答對 " + right + "/" + total + "（已作答 " + done + "/" + total + "）";
    if (window.StudentAuth) window.StudentAuth.setStatus(txt);
  }

  boxes.forEach(function (box) {
    var q = box.getAttribute("data-q");
    var btns = box.querySelectorAll(".rv-opt");
    if (st[q] && typeof st[q].i === "number") { reveal(box, st[q].i); return; }
    Array.prototype.forEach.call(btns, function (b, i) {
      b.addEventListener("click", function () {
        if (st[q]) return;
        st[q] = { i: i, ok: b.getAttribute("data-ok") === "1" };
        save(); reveal(box, i); summary();
      });
    });
  });
  summary();
  // StudentAuth 可能稍後才 render，登入後再補一次狀態
  document.addEventListener("DOMContentLoaded", summary);
})();
