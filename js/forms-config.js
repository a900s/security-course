/* 學習內容驗證（Google 表單測驗）連結設定（共用）。
   三套教材的「📝 學習內容驗證（10 題）」按鈕都讀取這裡的網址。
   表單建立後，把下面三個 REPLACE_ME 換成實際的表單填寫網址即可。 */
window.OWASP_FORM_URL = "OWASP_FORM_URL_REPLACE_ME";
window.KALI_FORM_URL  = "KALI_FORM_URL_REPLACE_ME";
window.SQL_FORM_URL   = "SQL_FORM_URL_REPLACE_ME";

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
