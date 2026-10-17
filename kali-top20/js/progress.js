/* Kali Top 20 學習進度（原創）：每個技術章節加上「已讀／已複習」勾選，
   存在 localStorage，可匯出 JSON 交給老師彙整。純前端、不上傳任何資料。 */
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
    '<div class="row"><input id="stuName" placeholder="姓名（例如：資二甲 12 王小明）">' +
    '<button id="expBtn">⬇ 匯出進度 JSON</button><button id="clrBtn" class="ghost">清除</button></div>' +
    '<div class="hint">勾選每一章的「已讀／已複習」，完成後匯出 JSON 交給老師。進度只存在本機瀏覽器。</div>';
  var h1 = document.querySelector("h1");
  h1.insertAdjacentElement("afterend", panel);
  var nameEl = document.getElementById("stuName");
  nameEl.value = st.name || "";
  nameEl.oninput = function () { st.name = nameEl.value; save(st); };

  function summary() {
    var r = 0, v = 0;
    Object.keys(st.items).forEach(function (k) { if (st.items[k].read) r++; if (st.items[k].reviewed) v++; });
    document.getElementById("progSum").textContent = "已讀 " + r + "/20 · 已複習 " + v + "/20";
  }
  summary();

  document.getElementById("expBtn").onclick = function () {
    if (!st.name.trim()) { alert("請先填寫姓名再匯出。"); nameEl.focus(); return; }
    var out = { type: "kali-top20-progress", version: 1, name: st.name.trim(), exportedAt: new Date().toISOString(), items: st.items };
    var blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kali-progress-" + st.name.trim().replace(/[\\/:*?"<>|\s]+/g, "_") + ".json";
    document.body.appendChild(a); a.click(); a.remove();
  };
  document.getElementById("clrBtn").onclick = function () {
    if (!confirm("確定清除本機的學習進度？")) return;
    localStorage.removeItem(KEY); location.reload();
  };
})();
