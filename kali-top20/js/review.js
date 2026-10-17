/* Kali Top 20 隨堂複習（原創）：閱讀時每題點選一次答案，立即顯示對錯與解說，之後鎖定。
   純前端；作答結果記在本機 localStorage（重新整理後仍顯示），不上傳任何資料。 */
(function () {
  "use strict";
  // v2：鍵 = 章節編號 1–20（每章 1 題）。v1：鍵 = 表單題號 1–10（第 9 題在第 11 章、第 10 題在第 15 章）
  var KEY = "kali_top20_review_v2", OLD_KEY = "kali_top20_review_v1";
  var V1_TO_SEC = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 11, 10: 15 };
  var st = {};
  try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  if (typeof st !== "object" || st === null || Array.isArray(st)) st = {};
  // 舊資料遷移：同一題、選項順序不變，故選擇索引可直接沿用；格式不符者忽略
  try {
    var old = JSON.parse(localStorage.getItem(OLD_KEY));
    if (old && typeof old === "object") {
      Object.keys(V1_TO_SEC).forEach(function (k) {
        var r = old[k], sec = String(V1_TO_SEC[k]);
        if (r && typeof r.i === "number" && r.i >= 0 && r.i < 4 && !st[sec]) st[sec] = { i: r.i, ok: !!r.ok };
      });
      localStorage.removeItem(OLD_KEY);
      localStorage.setItem(KEY, JSON.stringify(st));
    }
  } catch (e) {}
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
    boxes.forEach(function (b) { var r = st[b.getAttribute("data-q")]; if (r && typeof r.i === "number") { done++; if (r.ok) right++; } });
    var txt = "🧠 隨堂複習：答對 " + right + "/" + total + "（已作答 " + done + "/" + total + "）";
    if (window.StudentAuth) window.StudentAuth.setStatus(txt);
  }

  boxes.forEach(function (box) {
    var q = box.getAttribute("data-q");
    var btns = box.querySelectorAll(".rv-opt");
    if (st[q] && typeof st[q].i === "number" && st[q].i >= 0 && st[q].i < btns.length) {
      st[q].ok = btns[st[q].i].getAttribute("data-ok") === "1";   // 以頁面上的正解為準
      reveal(box, st[q].i); return;
    }
    if (st[q]) delete st[q];   // 格式不符的舊資料直接忽略
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
