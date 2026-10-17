/* 教師區：20 題標準答案表（三套教材共用，原創）。教師密碼解鎖後呼叫 ReviewTeacher.render(容器)。
   每列：頁面題號、Google 表單題號（★＝原本第 1–10 題；第 11–20 題為新增）、題目（與表單逐字相同）、正解字母＋內容、解析。 */
(function () {
  "use strict";
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function render(host) {
    var D = window.REVIEW_DATA;
    if (typeof host === "string") host = document.getElementById(host);
    if (!host || !D) return;
    var dist = { A: 0, B: 0, C: 0, D: 0 }, fkey = [];
    D.questions.forEach(function (q) { dist[q.options[q.correct].l]++; fkey[q.formQ - 1] = q.options[q.correct].l; });
    var rows = D.questions.map(function (q) {
      var c = q.options[q.correct];
      return '<tr><td class="ra-n">' + q.n + '</td><td class="ra-f">' + (q.orig ? '★ ' : '') + '表單 ' + q.formQ + '</td>' +
        '<td>' + q.icon + ' ' + esc(q.question) + '</td>' +
        '<td class="ra-a"><b>' + c.l + '</b>. ' + esc(c.t) + '</td><td class="ra-e">' + esc(q.exp) + '</td></tr>';
    }).join("");
    host.innerHTML =
      '<div class="ra-wrap"><h2>📝 20 題標準答案（隨堂複習＝總複習＝Google 表單）</h2>' +
      '<p class="ra-note">題號為頁面上的隨堂複習順序；「表單 n」為 Google 表單題號，★ 為表單原本的第 1–10 題，其餘為表單第 11–20 題。' +
      '正解分布：A ' + dist.A + '、B ' + dist.B + '、C ' + dist.C + '、D ' + dist.D + '。表單依題號的正解：<code>' + fkey.join("") + '</code></p>' +
      '<div class="ra-scroll"><table class="ra-tbl"><thead><tr><th>題號</th><th>表單</th><th>題目</th><th>正解</th><th>解析</th></tr></thead><tbody>' +
      rows + '</tbody></table></div></div>';
  }
  window.ReviewTeacher = { render: render };
})();
