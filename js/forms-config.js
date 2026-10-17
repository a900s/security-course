/* 學習內容驗證（Google 表單測驗）連結設定（共用）。
   三套教材的「📝 學習內容驗證（20 題）」按鈕都讀取這裡的網址。 */
window.OWASP_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeYJxWyyHsc2PQSUW7gZrn1GXCwDkYl6XrO44NiM8t0-G6xuA/viewform";
window.KALI_FORM_URL  = "https://docs.google.com/forms/d/e/1FAIpQLSfhZOqGQ09dhOrgMP-8wNz1-3WXi2ii-lPRDI63lx5EqHbubw/viewform";
window.SQL_FORM_URL   = "https://docs.google.com/forms/d/e/1FAIpQLSeGC7T4YPnqbn_NPfJydzHlNSQ6NdQbqZFt6V8kV1h0fqCZBQ/viewform";

(function () {
  "use strict";
  function wire() {
    var map = { owasp: window.OWASP_FORM_URL, kali: window.KALI_FORM_URL, sql: window.SQL_FORM_URL };
    var els = document.querySelectorAll("[data-quiz-form]");
    Array.prototype.forEach.call(els, function (a) {
      var url = map[a.getAttribute("data-quiz-form")] || "";
      if (url && !/REPLACE_ME/.test(url)) {
        a.href = url; a.removeAttribute("aria-disabled"); a.removeAttribute("title");
      } else {
        a.href = "#"; a.setAttribute("aria-disabled", "true");
        a.title = "學習內容驗證表單連結尚未設定（REPLACE_ME）";
        a.addEventListener("click", function (e) {
          e.preventDefault();
          alert("學習內容驗證表單連結尚未設定，請老師於 js/forms-config.js 填入後再試。");
        });
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
