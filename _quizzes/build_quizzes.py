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
  "desc": "共 20 題，每題 4 選 1、5 分，滿分 100 分。驗證對 OWASP Top 10 各類別概念與防禦的理解。",
  "points": 5,
  "file": "owasp-quiz.md",
  "questions": [
   ("🔓", "【A01 存取控制失效】學生把網址的 ?id=1001 改成 ?id=1002 就看到別人的成績。最根本的修正是？",
    ["把 id 改成較長的亂數就好", "改用 POST 傳送 id，讓網址列看不到參數", "伺服器端每次都檢查「目前登入者是否有權讀取這筆資料」", "確認使用者已登入，未登入就導回登入頁"],
    2, "隱藏或打亂 id 只是增加猜測難度；真正的防線是伺服器端逐筆授權檢查（物件層級授權）。"),
   ("🔐", "【A04 加密機制失效】網站要儲存使用者密碼，下列哪種做法最適當？",
    ["用 bcrypt / Argon2 等加鹽、刻意放慢的密碼雜湊", "用 Base64 編碼後存起來", "用 MD5 雜湊一次就好", "以明碼存放但資料庫設密碼"],
    0, "Base64 不是加密；MD5 太快且易破。密碼應使用加鹽、計算成本高的專用雜湊。"),
   ("💉", "【A05 注入】要從根本防止 SQL Injection，最主要的技術是？",
    ["把錯誤訊息藏起來", "限制輸入長度到 10 字", "把網站改成 HTTPS", "參數化查詢（Prepared Statement），讓資料與指令分離"],
    3, "參數化查詢讓資料庫先固定語句結構，使用者輸入只當資料帶入，無法改變語意。"),
   ("📐", "【A06 不安全設計】「不安全設計」強調的重點是？",
    ["只要程式沒有 bug 就安全", "在設計階段就以威脅建模等方式納入安全需求", "等上線後再用防火牆補強即可", "上線前做一次弱點掃描與滲透測試就足夠"],
    1, "A06（不安全設計）指的是設計本身缺乏安全考量；威脅建模、安全需求應在開發早期就導入。"),
   ("⚙️", "【A02 安全設定錯誤】下列何者是常見的『安全設定錯誤』？",
    ["保留管理後台的預設帳號密碼並對外開放", "關閉不必要的服務與預設帳號", "定期套用安全更新", "移除詳細的對外錯誤訊息"],
    0, "沿用預設帳密、開放不必要介面都是典型設定錯誤；其餘三者反而是正確作法。"),
   ("📦", "【A03 軟體供應鏈失效】對於使用的第三方套件／函式庫，較好的做法是？",
    ["鎖定目前版本，只要功能正常就不需更新", "只選下載量大的熱門套件，就不必追蹤漏洞", "建立清單並持續追蹤已知漏洞、即時更新", "把套件原始碼複製進專案，就不受上游漏洞影響"],
    2, "要掌握相依元件清單（SBOM）、追蹤 CVE 並及時更新有漏洞的版本。"),
   ("🧑‍💻", "【A07 認證失效】為了降低帳號被暴力破解或憑證填充的風險，最有效的措施是？",
    ["強制使用者每 30 天更換一次密碼", "全站改用 HTTPS 加密登入時的傳輸", "把登入頁藏在隱密網址", "導入多因素驗證（MFA）並限制登入嘗試次數"],
    3, "MFA 加上登入次數限制／鎖定，可大幅降低猜測與自動化攻擊的成功率。"),
   ("🧩", "【A08 軟體或資料完整性失效】自動更新或 CI/CD 流程中，確保『完整性』的做法是？",
    ["更新伺服器使用 HTTPS，就不必再驗證檔案", "驗證數位簽章與來源，使用可信的相依與管線", "比對更新檔的檔案大小與版本號是否正確", "建置時自動從公開套件庫抓取最新版本"],
    1, "供應鏈與更新須驗證簽章與來源，避免被植入惡意程式（即 A08 的核心風險）。"),
   ("📝", "【A09 安全記錄與警示失效】缺乏足夠的日誌與監控，最直接的後果是？",
    ["網站更容易遭受 SQL 注入等攻擊", "資料庫備份會失效，資料無法還原", "入侵發生後難以偵測、告警與事後調查", "防火牆因缺少紀錄而無法阻擋攻擊"],
    2, "沒有日誌與告警，攻擊往往無聲無息、事後也難追查；應記錄並監控關鍵事件。"),
   ("🛰️", "【A01 存取控制失效（SSRF）】伺服器端請求偽造（SSRF）常見的防禦是？",
    ["對出站請求的目標位址做白名單與網路隔離", "只在前端驗證使用者輸入的網址格式", "只要擋掉含 localhost 字串的網址就足夠", "伺服器改用 HTTPS 發送對外請求"],
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
    ["把服務改到非標準連接埠，讓掃描找不到", "只開放必要服務並以防火牆、IDS 監看異常掃描", "設定主機不回應 ping，掃描就無法發現", "只在邊界防火牆擋外部掃描，內網不必管"],
    1, "縮小攻擊面（最小化開放埠）並監看掃描跡象，是面對偵察的基本防禦。"),
   ("🔑", "【線上暴力破解】對 SSH / RDP 等服務的帳密暴力破解，有效的防治是？",
    ["把 SSH 改到非標準連接埠就足夠", "只要密碼夠複雜，就不需要其他措施", "隱藏登入失敗訊息，讓攻擊者無從判斷", "強密碼＋MFA＋限制嘗試次數／來源 IP"],
    3, "強認證、MFA、速率限制與鎖定可大幅削弱線上猜測攻擊。"),
   ("🧮", "【離線密碼破解】John/Hashcat 針對外洩的雜湊做離線破解，最有效的防治是？",
    ["使用加鹽、計算成本高的雜湊（bcrypt/Argon2）並防止雜湊外洩", "改用 SHA-256 雜湊一次，速度快又安全", "用 AES 加密密碼，金鑰存在同一台伺服器", "把雜湊值再用 Base64 編碼後儲存"],
    0, "加鹽、慢雜湊讓離線破解成本大增；同時要避免雜湊被竊。"),
   ("📶", "【Wi‑Fi 破解】針對家用／校園無線網路，較安全的設定是？",
    ["使用 WEP 加密", "隱藏 SSID 並啟用 MAC 位址過濾即可", "採用 WPA2/WPA3＋夠長的隨機金鑰，並停用 WPS", "使用 WPA2 但沿用預設密碼並保留 WPS"],
    2, "WEP 已不安全；WPA2/WPA3＋強金鑰、關閉 WPS 才能抵擋常見無線破解。"),
   ("🕵️", "【封包嗅探】在共享網路上用 Wireshark 竊聽流量，最根本的防治是？",
    ["全程使用 TLS/HTTPS 等加密傳輸", "把集線器換成交換器，就無法被竊聽", "隱藏 Wi‑Fi 名稱，讓攻擊者找不到網路", "每台電腦安裝防毒軟體，防止流量被攔截"],
    0, "端到端加密讓即使被攔截也讀不到內容，是對抗嗅探的核心。"),
   ("🔀", "【中間人 / ARP 欺騙】偵測與防治 ARP 欺騙式中間人攻擊，較有效的是？",
    ["定期重新開機，清除電腦的 ARP 快取", "改用固定 IP 位址，不再使用 DHCP", "無線網路改用 WPA3 加密即可", "使用動態 ARP 檢測、連接埠安全與加密連線"],
    3, "交換器的 DAI／Port Security 搭配加密傳輸，可偵測並降低 ARP 欺騙影響。"),
   ("🧰", "【漏洞利用框架】面對 Metasploit 這類利用框架，組織最根本的防治是？",
    ["封鎖 Metasploit 官網下載，讓攻擊者拿不到", "落實修補管理、關閉未用服務並強化縱深防禦", "只依賴防毒軟體病毒碼偵測攻擊工具", "把伺服器放在 NAT 後面，外部就打不到"],
    1, "多數利用針對已知漏洞，及時修補＋最小化服務＋EDR 是關鍵防線。"),
   ("💉", "【自動化注入】SQLmap 能自動化利用 SQL 注入，對應的防治核心是？",
    ["在前端做輸入長度限制即可", "只靠 WAF", "後端採參數化查詢並最小權限資料庫帳號", "隱藏錯誤訊息，讓 SQLmap 無法判斷"],
    2, "自動化工具一樣擋不住參數化查詢；最小權限可降低被利用後的衝擊。"),
   ("📁", "【目錄列舉】Gobuster 等工具列舉隱藏目錄／檔案，防治上應？",
    ["把管理頁改成冷僻名稱，靠路徑保密", "在 robots.txt 列出敏感目錄禁止索引", "對不存在的路徑一律回傳 200 與首頁", "移除敏感檔、正確設定權限並監看大量 404"],
    3, "別依賴『路徑保密』；要移除敏感檔、設定存取控制並監看列舉跡象。"),
   ("🎣", "【社交工程 / 釣魚】對抗釣魚攻擊，最關鍵的防治組合是？",
    ["使用者教育＋郵件過濾＋MFA 與網域驗證（SPF/DKIM/DMARC）", "部署郵件過濾系統即可，不需教育訓練", "教使用者看到 HTTPS 鎖頭就可放心點", "全面封鎖外部附件，其餘流程照舊"],
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
        lines.append(f"## 第 {i} 題　{icon}（{qz.get('points', 1)} 分）")
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
    pts = qz.get("points", 1)
    lines.append(f"**配分**：共 {n} 題，每題 {pts} 分，滿分 {n * pts} 分。")
    return "\n".join(lines) + "\n"

def build_json():
    out = {"generatedBy": "build_quizzes.py", "quizzes": []}
    for key, qz in QUIZZES.items():
        pts = qz.get("points", 1)
        qobj = {"id": qz["id"], "title": qz["title"], "description": qz["desc"],
                "pointsPerQuestion": pts, "totalPoints": len(qz["questions"]) * pts, "questions": []}
        for i, (icon, q, opts, ans, exp) in enumerate(qz["questions"], 1):
            qobj["questions"].append({
                "number": i, "icon": icon, "question": q,
                "options": {LETTERS[j]: opts[j] for j in range(4)},
                "correctIndex": ans, "correctLetter": LETTERS[ans],
                "points": pts, "explanation": exp,
            })
        out["quizzes"].append(qobj)
    return out

# 三份表單第 1–10 題以指紋凍結（第 11–20 題取自 <id>-review20.json 的 source=new 題）。
# 基準：OWASP 第 1–10 題【】標籤改為 2025 版編號；三份表單第 1–10 題玩笑式／明顯錯誤的錯誤選項皆改為合理迷思（2026-10 修訂，表單需同步修改）；
# 正解字母須維持下列順序。日後若再修改第 1–10 題，須同步改 Google 表單後再更新此處指紋。
FROZEN = {
 "owasp": ("e105b5d0164a4d3eebc12e3b1846bc4e885190f11b8640bc1337698f71640071", "CADBACDBCA"),
 "kali":  ("ecb5f3af1019dca3624ea0d1497814c34c7ef3e8fb6b7125b7af644cf5164399", "BDACADBCDA"),
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
