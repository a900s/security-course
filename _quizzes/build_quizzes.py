#!/usr/bin/env python3
"""學習內容驗證題庫（原創）— 單一資料來源，產生 *.md 與 quizzes.json。
用法：python3 build_quizzes.py
每題欄位：icon 圖示、q 題目、options 四選項(A-D)、answer 正解索引(0起)、exp 解析。
每題 1 分，每份 20 題（第 1–10 題凍結於此檔；第 11–20 題取自 <id>-review20.json 的 source=new 題）。內容為自行撰寫，概念/防禦導向，非逐步攻擊教學。"""
import json, pathlib, hashlib

HERE = pathlib.Path(__file__).parent

QUIZZES = {
 "owasp": {
  "id": "owasp",
  "title": "OWASP Top 10 學習內容驗證",
  "desc": "共 20 題，每題 4 選 1、1 分，滿分 20 分。驗證對 OWASP Top 10 各類別概念與防禦的理解。",
  "file": "owasp-quiz.md",
  "questions": [
   ("🔓", "【A01 存取控制失效】學生把網址的 ?id=1001 改成 ?id=1002 就看到別人的成績。最根本的修正是？",
    ["把 id 改成較長的亂數就好", "在前端把網址列隱藏起來", "伺服器端每次都檢查「目前登入者是否有權讀取這筆資料」", "要求使用者換更長的密碼"],
    2, "隱藏或打亂 id 只是增加猜測難度；真正的防線是伺服器端逐筆授權檢查（物件層級授權）。"),
   ("🔐", "【A04 加密機制失效】網站要儲存使用者密碼，下列哪種做法最適當？",
    ["用 bcrypt / Argon2 等加鹽、刻意放慢的密碼雜湊", "用 Base64 編碼後存起來", "用 MD5 雜湊一次就好", "以明碼存放但資料庫設密碼"],
    0, "Base64 不是加密；MD5 太快且易破。密碼應使用加鹽、計算成本高的專用雜湊。"),
   ("💉", "【A05 注入】要從根本防止 SQL Injection，最主要的技術是？",
    ["把錯誤訊息藏起來", "限制輸入長度到 10 字", "把網站改成 HTTPS", "參數化查詢（Prepared Statement），讓資料與指令分離"],
    3, "參數化查詢讓資料庫先固定語句結構，使用者輸入只當資料帶入，無法改變語意。"),
   ("📐", "【A06 不安全設計】「不安全設計」強調的重點是？",
    ["只要程式沒有 bug 就安全", "在設計階段就以威脅建模等方式納入安全需求", "等上線後再用防火牆補強即可", "把功能做得越多越安全"],
    1, "A06（不安全設計）指的是設計本身缺乏安全考量；威脅建模、安全需求應在開發早期就導入。"),
   ("⚙️", "【A02 安全設定錯誤】下列何者是常見的『安全設定錯誤』？",
    ["保留管理後台的預設帳號密碼並對外開放", "關閉不必要的服務與預設帳號", "定期套用安全更新", "移除詳細的對外錯誤訊息"],
    0, "沿用預設帳密、開放不必要介面都是典型設定錯誤；其餘三者反而是正確作法。"),
   ("📦", "【A03 軟體供應鏈失效】對於使用的第三方套件／函式庫，較好的做法是？",
    ["只要能動就永遠不要更新", "越多套件越好", "建立清單並持續追蹤已知漏洞、即時更新", "直接複製不明來源的程式碼"],
    2, "要掌握相依元件清單（SBOM）、追蹤 CVE 並及時更新有漏洞的版本。"),
   ("🧑‍💻", "【A07 認證失效】為了降低帳號被暴力破解或憑證填充的風險，最有效的措施是？",
    ["允許無限次密碼嘗試", "把密碼長度上限設為 4", "把登入頁藏在隱密網址", "導入多因素驗證（MFA）並限制登入嘗試次數"],
    3, "MFA 加上登入次數限制／鎖定，可大幅降低猜測與自動化攻擊的成功率。"),
   ("🧩", "【A08 軟體或資料完整性失效】自動更新或 CI/CD 流程中，確保『完整性』的做法是？",
    ["直接執行任何來源的更新檔", "驗證數位簽章與來源，使用可信的相依與管線", "關閉所有日誌加快速度", "把金鑰寫死在前端程式"],
    1, "供應鏈與更新須驗證簽章與來源，避免被植入惡意程式（即 A08 的核心風險）。"),
   ("📝", "【A09 安全記錄與警示失效】缺乏足夠的日誌與監控，最直接的後果是？",
    ["網站會變慢", "使用者體驗變好", "入侵發生後難以偵測、告警與事後調查", "密碼自動變強"],
    2, "沒有日誌與告警，攻擊往往無聲無息、事後也難追查；應記錄並監控關鍵事件。"),
   ("🛰️", "【A01 存取控制失效（SSRF）】伺服器端請求偽造（SSRF）常見的防禦是？",
    ["對出站請求的目標位址做白名單與網路隔離", "允許伺服器存取任意內部網址", "把所有輸入都轉成大寫", "停用 HTTPS"],
    0, "應限制伺服器可存取的目的地（白名單）、隔離內網並封鎖對中繼資料端點的存取。"),
  ],
 },
 "kali": {
  "id": "kali",
  "title": "Kali 20 種手法與防治 學習內容驗證",
  "desc": "共 20 題，每題 4 選 1、1 分，滿分 20 分。以概念、跡象與防治為主，非逐步攻擊教學。",
  "file": "kali-quiz.md",
  "questions": [
   ("🔍", "【偵察】Nmap 這類連接埠掃描工具，在防禦上我方最該做的是？",
    ["把所有連接埠都對外開放", "只開放必要服務並以防火牆、IDS 監看異常掃描", "關閉所有日誌", "相信內網一定安全"],
    1, "縮小攻擊面（最小化開放埠）並監看掃描跡象，是面對偵察的基本防禦。"),
   ("🔑", "【線上暴力破解】對 SSH / RDP 等服務的帳密暴力破解，有效的防治是？",
    ["停用帳號鎖定", "把密碼縮短方便記憶", "把服務改用非加密連線", "強密碼＋MFA＋限制嘗試次數／來源 IP"],
    3, "強認證、MFA、速率限制與鎖定可大幅削弱線上猜測攻擊。"),
   ("🧮", "【離線密碼破解】John/Hashcat 針對外洩的雜湊做離線破解，最有效的防治是？",
    ["使用加鹽、計算成本高的雜湊（bcrypt/Argon2）並防止雜湊外洩", "用快速且無鹽的雜湊", "把密碼存成明碼", "縮短密碼長度"],
    0, "加鹽、慢雜湊讓離線破解成本大增；同時要避免雜湊被竊。"),
   ("📶", "【Wi‑Fi 破解】針對家用／校園無線網路，較安全的設定是？",
    ["使用 WEP 加密", "完全不設密碼", "採用 WPA2/WPA3＋夠長的隨機金鑰，並停用 WPS", "把 SSID 設成常見字串"],
    2, "WEP 已不安全；WPA2/WPA3＋強金鑰、關閉 WPS 才能抵擋常見無線破解。"),
   ("🕵️", "【封包嗅探】在共享網路上用 Wireshark 竊聽流量，最根本的防治是？",
    ["全程使用 TLS/HTTPS 等加密傳輸", "一律使用明碼協定", "把網速調慢", "停用交換器"],
    0, "端到端加密讓即使被攔截也讀不到內容，是對抗嗅探的核心。"),
   ("🔀", "【中間人 / ARP 欺騙】偵測與防治 ARP 欺騙式中間人攻擊，較有效的是？",
    ["讓所有裝置共用同一 VLAN 無隔離", "關閉交換器日誌", "改用 HTTP", "使用動態 ARP 檢測、連接埠安全與加密連線"],
    3, "交換器的 DAI／Port Security 搭配加密傳輸，可偵測並降低 ARP 欺騙影響。"),
   ("🧰", "【漏洞利用框架】面對 Metasploit 這類利用框架，組織最根本的防治是？",
    ["永不更新系統", "落實修補管理、關閉未用服務並強化縱深防禦", "停用防毒", "共用管理員帳號"],
    1, "多數利用針對已知漏洞，及時修補＋最小化服務＋EDR 是關鍵防線。"),
   ("💉", "【自動化注入】SQLmap 能自動化利用 SQL 注入，對應的防治核心是？",
    ["在前端做輸入長度限制即可", "只靠 WAF", "後端採參數化查詢並最小權限資料庫帳號", "把錯誤訊息完整回傳"],
    2, "自動化工具一樣擋不住參數化查詢；最小權限可降低被利用後的衝擊。"),
   ("📁", "【目錄列舉】Gobuster 等工具列舉隱藏目錄／檔案，防治上應？",
    ["把備份檔與管理頁放在可猜到的路徑", "開放目錄瀏覽", "停用存取日誌", "移除敏感檔、正確設定權限並監看大量 404"],
    3, "別依賴『路徑保密』；要移除敏感檔、設定存取控制並監看列舉跡象。"),
   ("🎣", "【社交工程 / 釣魚】對抗釣魚攻擊，最關鍵的防治組合是？",
    ["使用者教育＋郵件過濾＋MFA 與網域驗證（SPF/DKIM/DMARC）", "完全依賴技術、不做教育", "把所有附件自動開啟", "停用垃圾郵件過濾"],
    0, "釣魚利用『人』，需教育、郵件防護、MFA 與寄件網域驗證多管齊下。"),
  ],
 },
 "sql": {
  "id": "sql",
  "title": "SQL Injection 學習內容驗證",
  "desc": "共 20 題，每題 4 選 1、1 分，滿分 20 分。涵蓋注入型態、參數化查詢、佔位符、白名單、最小權限與記錄告警等防禦。",
  "file": "sql-quiz.md",
  "questions": [
   ("💥", "SQL Injection 最根本的成因是？",
    ["資料庫軟體版本太舊，本身就有漏洞", "網站沒有使用 HTTPS 加密傳輸資料", "程式沒有把『使用者資料』和『SQL 指令』分開", "前端沒有用 JavaScript 檢查輸入格式"],
    2, "不可信輸入被直接拼進 SQL 字串時，資料就可能被當成語法執行。"),
   ("🛡️", "防禦 SQL Injection 最主要、最根本的做法是？",
    ["在前端用 JavaScript 過濾單引號", "把資料庫錯誤訊息隱藏起來", "對輸入的特殊字元做 HTML 編碼", "參數化查詢（Prepared Statement）"],
    3, "參數化查詢讓資料庫先編譯語句結構，輸入只當參數帶入，無法改變語意。"),
   ("➕", "輸入 1' OR '1'='1 為何危險？因為它讓 WHERE 條件變成？",
    ["永遠為假", "永遠為真", "語法錯誤", "只比對第一筆"],
    1, "'1'='1' 恆真，OR 之後整個條件恆成立，等於取消了過濾。"),
   ("🔗", "UNION-based 注入主要利用哪個關鍵字把額外資料併進結果？",
    ["UNION", "JOIN", "GROUP BY", "HAVING"],
    0, "UNION 可將另一個 SELECT 的結果合併回來，前提是欄位數與型別相容。"),
   ("⏱️", "Time-based Blind Injection 用來判斷條件是否成立的訊號是？",
    ["頁面內容是否出現差異", "資料庫回傳的錯誤訊息", "HTTP 回應的狀態碼", "回應所花的時間（延遲）"],
    3, "讓資料庫在條件成立時延遲回應，用時間差當作 0/1 訊號。"),
   ("📋", "為什麼 ORDER BY 後的『欄位名稱』不能只靠參數化查詢防護？",
    ["排序欄位用參數綁定會讓查詢效能大幅下降", "欄位名稱來自下拉選單，使用者無法自行竄改", "欄位名稱是 SQL 結構的一部分，不是可綁定的資料值", "綁定的欄位名稱會被資料庫自動跳脫成安全值"],
    2, "參數綁定只處理『值』；識別字（欄位、表名、排序方向）屬結構，需用白名單。"),
   ("✅", "處理 ORDER BY 欄位時，建議採用哪種作法？",
    ["用黑名單過濾 SELECT、DROP 等關鍵字", "用固定的允許清單（whitelist）比對", "用跳脫函式處理欄位名稱中的引號", "把欄位名稱當作參數綁定進查詢"],
    1, "只接受預先定義好的合法欄位名，其餘一律拒絕。"),
   ("🔑", "資料庫帳號應遵循哪一項原則，以降低漏洞被利用後的衝擊？",
    ["最小權限（Least Privilege）", "預設允許（Default Allow）", "失效開放（Fail Open）", "共用帳號（Shared Account）"],
    0, "應用帳號只給必要權限，就算被注入，可破壞的範圍也有限。"),
   ("🧱", "WAF（Web 應用防火牆）在防禦 SQL Injection 時的正確定位是？",
    ["可以完全取代安全程式設計", "額外的防護層，不能取代參數化查詢", "只能防 XSS，對 SQL Injection 無效", "能自動修正程式中有漏洞的 SQL 語句"],
    1, "WAF 能擋掉部分已知樣式，但容易被繞過，不能當唯一防線。"),
   ("📝", "把資料庫的完整錯誤訊息直接回傳給使用者，主要風險是？",
    ["只影響開發者除錯，對資安沒有實際影響", "會讓資料庫連線數暴增，造成服務中斷", "攻擊者可藉此直接取得伺服器管理員權限", "可能洩漏資料表結構、SQL 片段等資訊，協助攻擊者"],
    3, "詳細錯誤等於替攻擊者畫地圖；應回傳一般化訊息，細節只進日誌。"),
  ],
 },
}

LETTERS = ["A", "B", "C", "D"]

def build_md(qz):
    lines = []
    lines.append(f"# {qz['title']}")
    lines.append("")
    lines.append(f"> {qz['desc']}")
    lines.append(">")
    lines.append("> 本題庫為自行撰寫之原創教學內容，以概念理解與防禦為主。正解以 **(正解)** 標註。")
    lines.append("")
    for i, (icon, q, opts, ans, exp) in enumerate(qz["questions"], 1):
        lines.append(f"## 第 {i} 題　{icon}（1 分）")
        lines.append("")
        lines.append(f"{q}")
        lines.append("")
        for j, opt in enumerate(opts):
            mark = "　**(正解)**" if j == ans else ""
            lines.append(f"- {LETTERS[j]}. {opt}{mark}")
        lines.append("")
        lines.append(f"> **解析**：{exp}")
        lines.append(f">")
        lines.append(f"> 建議圖示主題：{icon}")
        lines.append("")
    lines.append("---")
    lines.append("")
    n = len(qz["questions"])
    lines.append(f"**配分**：共 {n} 題，每題 1 分，滿分 {n} 分。")
    return "\n".join(lines) + "\n"

def build_json():
    out = {"generatedBy": "build_quizzes.py", "pointsPerQuestion": 1, "quizzes": []}
    for key, qz in QUIZZES.items():
        qobj = {"id": qz["id"], "title": qz["title"], "description": qz["desc"],
                "totalPoints": len(qz["questions"]), "questions": []}
        for i, (icon, q, opts, ans, exp) in enumerate(qz["questions"], 1):
            qobj["questions"].append({
                "number": i, "icon": icon, "question": q,
                "options": {LETTERS[j]: opts[j] for j in range(4)},
                "correctIndex": ans, "correctLetter": LETTERS[ans],
                "points": 1, "explanation": exp,
            })
        out["quizzes"].append(qobj)
    return out

# 三份表單第 1–10 題以指紋凍結（第 11–20 題取自 <id>-review20.json 的 source=new 題）。
# 基準：OWASP 第 1–10 題【】標籤改為 2025 版編號、SQL 第 1–10 題錯誤選項改為合理迷思（2026-10 修訂，表單需同步修改）；
# 正解字母須維持下列順序。日後若再修改第 1–10 題，須同步改 Google 表單後再更新此處指紋。
FROZEN = {
 "owasp": ("efe7f3cc15b05c859a905dad5476cbcdd50e5078027f5fb5356807e8f6c6cabb", "CADBACDBCA"),
 "kali":  ("71cb3084efe13e99c8eaf34a874a08907c100be1acb49ae1e92dfe6ea40e28ee", "BDACADBCDA"),
 "sql":   ("17a0ac17df7d8c2fc1d40170f3bdfe0b0192bdb0aac6dd4fbeb8e977ab189a22", "CDBADCBABD"),
}

def extend(key):
    """表單第 11–20 題：取自 <key>-review20.json 中 source=new 的題目（依 formQ 排序）"""
    qs = QUIZZES[key]["questions"]
    fp, ans = FROZEN[key]
    got = hashlib.sha256(json.dumps(qs[:10], ensure_ascii=False).encode()).hexdigest()
    if len(qs) != 10 or got != fp or "".join(LETTERS[q[3]] for q in qs) != ans:
        raise SystemExit(f"{key} 表單第 1–10 題被改動了（與已上線表單不一致），請還原")
    rv = json.loads((HERE / f"{key}-review20.json").read_text(encoding="utf-8"))["questions"]
    new = sorted((q for q in rv if q["source"] == "new"), key=lambda q: q["formQ"])
    if [q["formQ"] for q in new] != list(range(11, 21)):
        raise SystemExit(f"{key}-review20.json 的新題 formQ 必須剛好是 11–20")
    for q in new:
        qs.append((q["icon"], q["question"], [q["options"][k] for k in LETTERS], q["correctIndex"], q["explanation"]))

def main():
    for k in QUIZZES: extend(k)
    for key, qz in QUIZZES.items():
        n = len(qz["questions"])
        want = 20
        assert n == want, f"{key} 題數 {n} != {want}"
        fkey = "".join(LETTERS[q[3]] for q in qz["questions"])
        if any(fkey.count(c) != 5 for c in LETTERS):
            raise SystemExit(f"{key} 表單 20 題正解須 A–D 各 5 題，目前 {fkey}")
        (HERE / qz["file"]).write_text(build_md(qz), encoding="utf-8")
        print("寫出", qz["file"])
    (HERE / "quizzes.json").write_text(
        json.dumps(build_json(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("寫出 quizzes.json")

if __name__ == "__main__":
    main()
