/* Kali Top 20 學習進度（原創）：每個技術章節加上「已讀／已複習」勾選，
   存在 localStorage。學生以 Google 登入後整頁截圖繳交，純前端、不上傳任何資料。 */
(function () {
  "use strict";
  var KEY = "kali_top20_progress_v1";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { name: "", items: {} }; } catch (e) { return { name: "", items: {} }; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var st = load();

  // 找出 20 個技術章節（標題以「數字.」開頭）
  var heads = Array.prototype.filter.call(document.querySelectorAll("h2"), function (h) {
    return /^\d+\.\s/.test(h.textContent.trim());
  });
  window.KALI_ITEMS = heads.map(function (h) {
    var n = parseInt(h.textContent, 10);
    return { id: String(n), title: h.textContent.trim() };
  });

  heads.forEach(function (h) {
    var id = String(parseInt(h.textContent, 10));
    var rec = st.items[id] || {};
    var bar = document.createElement("div");
    bar.className = "progbar";
    bar.innerHTML =
      '<label><input type="checkbox" data-k="read"' + (rec.read ? " checked" : "") + '> 已讀</label>' +
      '<label><input type="checkbox" data-k="reviewed"' + (rec.reviewed ? " checked" : "") + '> 已複習</label>';
    h.insertAdjacentElement("afterend", bar);
    bar.querySelectorAll("input").forEach(function (cb) {
      cb.onchange = function () {
        var r = st.items[id] || {};
        r[cb.getAttribute("data-k")] = cb.checked;
        r.ts = new Date().toISOString();
        st.items[id] = r; save(st); summary();
      };
    });
  });

  // 頂部進度面板
  var panel = document.createElement("div");
  panel.className = "progpanel";
  panel.innerHTML =
    '<b>📒 我的學習進度</b> <span id="progSum"></span>' +
    '<div class="row"><button id="clrBtn" class="ghost">清除本機進度</button></div>' +
    '<div class="hint">勾選每一章的「已讀／已複習」。登入上方 Google 帳號後，畫面會一起顯示姓名與進度，請整頁截圖繳交給老師。進度只存在本機瀏覽器。</div>';
  var h1 = document.querySelector("h1");
  h1.insertAdjacentElement("afterend", panel);

  function summary() {
    var r = 0, v = 0;
    Object.keys(st.items).forEach(function (k) { if (st.items[k].read) r++; if (st.items[k].reviewed) v++; });
    document.getElementById("progSum").textContent = "已讀 " + r + "/20 · 已複習 " + v + "/20";
    if (window.StudentAuth) window.StudentAuth.setStatus("Kali 教材進度：已讀 " + r + "/20 · 已複習 " + v + "/20");
  }
  summary();

  document.getElementById("clrBtn").onclick = function () {
    if (!confirm("確定清除本機的學習進度？")) return;
    localStorage.removeItem(KEY); location.reload();
  };
})();
