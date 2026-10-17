/* Kali Top 20 教師區（原創）：以 SHA-256 雜湊比對解鎖（與 SQL Lab 相同），
   匯入一或多份學生匯出的 JSON，顯示完成度總覽。全部在瀏覽器內處理。 */
(function () {
  "use strict";
  // 與 sql-injection-lab/js/app.js 相同的雜湊。更換：echo -n "新密碼" | sha256sum
  var TEACHER_PASSWORD_HASH = "2962e8f9635e056b78825f80970517907447ce4e6c7537d553c24b446d1c3c70";
  var TITLES = ["Nmap","Hydra/Medusa","John/Hashcat","Aircrack-ng","Wireshark","Ettercap/Bettercap","Metasploit","SQLmap","Burp Suite","Nikto","Gobuster/dirb","Responder","CrackMapExec","憑證擷取","社交工程","DNS 欺騙","密碼噴灑","Wifite","隱寫術/憑證收集","權限提升"];
  var students = {};

  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function sha256Hex(s) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
      return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
    });
  }

  document.getElementById("unlockBtn").onclick = function () {
    var msg = document.getElementById("lockMsg");
    sha256Hex(document.getElementById("pw").value).then(function (h) {
      if (h === TEACHER_PASSWORD_HASH) {
        document.getElementById("lock").hidden = true;
        document.getElementById("panel").hidden = false;
      } else msg.textContent = "✗ 密碼錯誤。";
    }).catch(function () { msg.textContent = "✗ 瀏覽器不支援 Web Crypto（請用 https 或 localhost 開啟）。"; });
  };

  document.getElementById("files").onchange = function (e) {
    var files = Array.from(e.target.files), log = [];
    Promise.all(files.map(function (f) {
      return f.text().then(function (t) {
        try {
          var d = JSON.parse(t);
          if (d.type !== "kali-top20-progress" || !d.name || typeof d.items !== "object") throw 0;
          var prev = students[d.name];
          if (!prev || (d.exportedAt || "") >= (prev.exportedAt || "")) students[d.name] = d;
          log.push("✓ " + f.name);
        } catch (x) { log.push("✗ " + f.name + "（格式不符）"); }
      });
    })).then(function () {
      document.getElementById("importLog").textContent = log.join("\n");
      e.target.value = ""; render();
    });
  };
  document.getElementById("clearBtn").onclick = function () { students = {}; render(); };

  function render() {
    var names = Object.keys(students).sort();
    var head = "<tr><th>學生</th><th>已讀</th><th>已複習</th><th>匯出時間</th>" +
      TITLES.map(function (t, i) { return "<th title='" + esc(t) + "'>" + (i + 1) + "</th>"; }).join("") + "</tr>";
    var colR = new Array(20).fill(0);
    var rows = names.map(function (n) {
      var d = students[n], r = 0, v = 0, cells = "";
      for (var i = 1; i <= 20; i++) {
        var it = d.items[String(i)] || {};
        if (it.read) { r++; colR[i - 1]++; }
        if (it.reviewed) v++;
        cells += "<td class='" + (it.reviewed ? "c2" : it.read ? "c1" : "c0") + "'>" + (it.reviewed ? "✔✔" : it.read ? "✔" : "·") + "</td>";
      }
      var t = d.exportedAt ? new Date(d.exportedAt).toLocaleString("zh-TW", { hour12: false }) : "—";
      return "<tr><td>" + esc(n) + "</td><td>" + r + "/20</td><td>" + v + "/20</td><td>" + esc(t) + "</td>" + cells + "</tr>";
    }).join("");
    var foot = names.length ? "<tr><th colspan='4'>各章已讀人數</th>" + colR.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr>" : "";
    document.getElementById("overview").innerHTML = names.length
      ? "<table>" + head + rows + foot + "</table>"
      : "<p class='hint'>尚未匯入任何進度檔。</p>";
    var total = names.length, done = names.filter(function (n) {
      var it = students[n].items, c = 0; for (var i = 1; i <= 20; i++) if ((it[String(i)] || {}).read) c++; return c === 20;
    }).length;
    document.getElementById("stats").textContent = total ? ("共 " + total + " 位學生 · 全部讀完 " + done + " 位") : "";
    document.getElementById("legend").innerHTML = TITLES.map(function (t, i) { return (i + 1) + ". " + esc(t); }).join("　");
  }
  render();
})();
