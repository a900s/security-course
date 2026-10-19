/* SQL Injection 教學實驗室 — 應用邏輯（原創）。
   純前端：互動沙盒只在瀏覽器內「模擬」注入行為的教學示意，
   不連線任何真實資料庫，也不對任何外部系統送出請求。 */
(function () {
  "use strict";

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- 分頁導覽 ---------- */
  window.showSection = function (id, btn) {
    document.querySelectorAll(".section").forEach(function (s) { s.classList.remove("active"); });
    document.getElementById(id).classList.add("active");
    document.querySelectorAll("nav button").forEach(function (b) { b.classList.remove("active"); });
    if (btn) btn.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- 互動沙盒 ---------- */
  var mode = "vuln";
  var SCENARIOS = {
    login: {
      title: "登入繞過（Login Bypass）",
      payloads: ["' OR '1'='1", "' OR 1=1 --", "admin' --"],
      note: "把輸入塞進登入查詢的 WHERE，可能讓條件恆真或把密碼比對註解掉。"
    },
    union: {
      title: "UNION 合併查詢",
      payloads: ["' UNION SELECT NULL --", "' UNION SELECT username, password FROM users --"],
      note: "用 UNION 把另一張表的欄位併進結果；實際需欄位數與型別相容。"
    },
    bool: {
      title: "布林盲注（Boolean Blind）",
      payloads: ["' AND 1=1 --", "' AND 1=2 --"],
      note: "看不到資料時，用條件成立/不成立造成的回應差異逐位推測。"
    },
    time: {
      title: "時間盲注（Time-based Blind）",
      payloads: ["' AND SLEEP(3) --", "' OR SLEEP(3) --"],
      note: "用資料庫延遲當訊號。本平台只做動畫示意，不會真的延遲。"
    },
    orderby: {
      title: "ORDER BY 排序注入",
      payloads: ["name", "email", "created_at", "(SELECT 1)"],
      note: "ORDER BY 接的是欄位名（識別字），必須用白名單，不能靠參數綁定。"
    },
    waf: {
      title: "WAF 過濾示意",
      payloads: ["' OR 1=1 --", "UNION SELECT", "SLEEP(3)"],
      note: "WAF 會攔下部分可疑樣式，但可被變形繞過，不能取代安全程式設計。"
    }
  };

  function tokenize(input) {
    if (!input.trim()) return "<span class='note'>尚未輸入內容。</span>";
    var parts = input.match(/('[^']*'|"[^"]*"|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bSLEEP\b|\bFROM\b|--|#|=|\S+)/gi) || [];
    return parts.map(function (t) {
      var cls = "";
      if (/^(OR|AND|UNION|SELECT|SLEEP|FROM)$/i.test(t)) cls = "kw";
      else if (/^['"].*['"]$/.test(t)) cls = "str";
      else if (/^(--|#)$/.test(t)) cls = "cmt";
      else if (/^=$/.test(t)) cls = "op";
      return "<span class='tok " + cls + "'>" + esc(t) + "</span>";
    }).join("");
  }

  window.setMode = function (m) {
    mode = m;
    document.getElementById("mVuln").classList.toggle("selected", m === "vuln");
    document.getElementById("mSecure").classList.toggle("selected", m === "secure");
    runSim();
  };

  window.changeScenario = function () {
    var key = document.getElementById("scenario").value, s = SCENARIOS[key];
    var box = document.getElementById("payloads"); box.innerHTML = "";
    s.payloads.forEach(function (p) {
      var el = document.createElement("span"); el.className = "payload"; el.textContent = p;
      el.onclick = function () { document.getElementById("sqlInput").value = p; };
      box.appendChild(el);
    });
    document.getElementById("analysis").innerHTML = "<div class='result info'>" + esc(s.note) + "</div>";
    document.getElementById("sqlResult").innerHTML = "<div class='note'>尚未執行。</div>";
    document.getElementById("dbResult").innerHTML = "<div class='note'>尚未執行。</div>";
    document.getElementById("tokens").innerHTML = "<span class='note'>尚未分析。</span>";
    document.getElementById("serverLog").textContent = "尚未產生 Log。";
  };

  var FAKE = [["1", "admin", "***"], ["2", "wang", "***"], ["3", "lin", "***"]];
  function tableHTML(rows, cols) {
    var h = "<table><thead><tr>" + cols.map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
    rows.forEach(function (r) { h += "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; });
    return h + "</tbody></table>";
  }

  window.runSim = function () {
    var key = document.getElementById("scenario").value;
    var input = document.getElementById("sqlInput").value.trim();
    var sqlR = document.getElementById("sqlResult"), dbR = document.getElementById("dbResult"),
      ana = document.getElementById("analysis"), log = document.getElementById("serverLog");
    document.getElementById("tokens").innerHTML = tokenize(input);
    if (!input) { sqlR.innerHTML = "<div class='result info'>請先輸入測試內容。</div>"; return; }
    var low = input.toLowerCase();

    if (mode === "secure") {
      sqlR.innerHTML = "<div class='result ok'>🛡️ 安全模式：輸入被當成『參數值』帶入，SQL 結構不被改變。</div>" +
        "<pre>SELECT * FROM users WHERE username = ?\n-- 參數 = [\"" + esc(input) + "\"]</pre>";
      dbR.innerHTML = "<div class='note'>查無符合，注入字串只被當成一般字串比對。</div>";
      ana.innerHTML = "<div class='result ok'>此模式下，前述攻擊字串都失效——這正是參數化查詢的效果。</div>";
      log.textContent = "[INFO] login attempt user=\"" + input + "\" result=denied (treated as data)";
      return;
    }

    // 有漏洞模式（字串拼接的教學示意）
    var hit = false, title = SCENARIOS[key].title, res = "", dbrows = "";
    if (key === "login" && (low.indexOf("' or '1'='1") >= 0 || low.indexOf("' or 1=1") >= 0 || low.indexOf("admin' --") >= 0)) {
      hit = true;
      res = "<pre>SELECT * FROM users\nWHERE username = '" + esc(input) + "' AND password = '...'</pre>";
      dbrows = tableHTML(FAKE, ["id", "username", "password"]);
    } else if (key === "union" && low.indexOf("union") >= 0 && low.indexOf("select") >= 0) {
      hit = true;
      res = "<pre>SELECT id, name FROM products\nWHERE name = '" + esc(input) + "'</pre>";
      dbrows = tableHTML([["admin", "(模擬外洩的雜湊)"], ["wang", "(模擬外洩的雜湊)"]], ["username", "password"]);
    } else if (key === "bool") {
      if (low.indexOf("1=1") >= 0) { hit = true; res = "<div class='result ok'>條件為 TRUE：頁面回應『正常』。</div>"; }
      else if (low.indexOf("1=2") >= 0) { hit = true; res = "<div class='result fail'>條件為 FALSE：頁面回應『不同』。</div>"; }
    } else if (key === "time" && low.indexOf("sleep") >= 0) {
      hit = true; res = "<div class='result fail'>（示意）回應延遲了數秒 → 代表條件成立，可據此逐位推測。</div>";
    } else if (key === "orderby") {
      var allow = ["name", "email", "created_at"];
      if (allow.indexOf(input) >= 0) { res = "<div class='result ok'>合法欄位『" + esc(input) + "』，排序正常。</div>"; }
      else { hit = true; res = "<div class='result fail'>非白名單欄位『" + esc(input) + "』被直接拼進 ORDER BY → 可被用來探測/注入。</div>"; }
    } else if (key === "waf") {
      if (/or\s+1=1|union\s+select|sleep\s*\(/i.test(input)) { res = "<div class='result info'>🚧 WAF 攔截：偵測到可疑樣式並封鎖此請求。</div>"; }
      else { hit = true; res = "<div class='result fail'>這個變形繞過了簡易 WAF 規則 → 證明 WAF 不是唯一防線。</div>"; }
    }

    if (!res) res = "<div class='result info'>目前輸入未觸發本情境的教學條件，試試上方建議 payload。</div>";
    sqlR.innerHTML = "<div class='note'>情境：" + esc(title) + "</div>" + res;
    dbR.innerHTML = dbrows || "<div class='note'>（本情境以回應差異/延遲示意，無資料表輸出。）</div>";
    ana.innerHTML = hit
      ? "<div class='result fail'>⚠ 模擬顯示此輸入可能改變查詢語意。換到『安全模式』再試一次，觀察差異。</div>"
      : "<div class='result info'>" + esc(SCENARIOS[key].note) + "</div>";
    log.textContent = (hit ? "[WARN] " : "[INFO] ") + "scenario=" + key + " input=\"" + input + "\"" + (hit ? " suspected_injection=true" : "");
  };

  /* ---------- 隨堂複習／總複習 ----------
     由共用的 ../js/review-core.js 與 ../js/final-review.js 處理（題庫：js/review-data.js，
     由 _quizzes/build_review.py 自 _quizzes/sql-review20.json 產生）。 */

  /* ---------- 初始化 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    changeScenario();
  });
})();
