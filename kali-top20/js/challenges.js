(function () {
  "use strict";
  window.CHALLENGES = [
    {
      code: "K01", slug: "k01", nm: "連接埠掃描", en: "偵察跡象",
      goal: "從紀錄裡指出掃描，而不是正常連線",
      scenario: "防火牆紀錄裡有幾筆連線。其中一筆在很短時間內探測了大量連接埠。",
      example: "正常使用者只連他要用的服務。掃描會在短時間打很多不同連接埠。",
      phase1: {
        type: "choose",
        label: "哪一筆比較像連接埠掃描？",
        options: [
          "同一個來源在 2 秒內連向 80、443、22、3389、8080",
          "同事的電腦只連公司網站的 443",
          "印表機每小時回報一次狀態"
        ],
        answer: 0,
        wrong: "這看起來像一般業務連線。找短時間打很多連接埠的那筆。",
        leak: "這就是掃描跡象：單一來源短時間探測大量連接埠。防禦是縮小開放面，並讓 IDS 告警。"
      },
      success: "你認出了掃描跡象，接下來把不該開的門關掉。",
      codefix: {
        lang: "防火牆", bad: 1,
        lines: [
          "# inbound",
          "allow any any",
          "log scan off"
        ],
        fixes: [
          ["只開放必要連接埠，其餘拒絕，並對短時間大量探針對告警", true],
          ["把 SSH 改到 2222，其餘連接埠仍全部開放", false],
          ["只丟掉 ping，TCP 連接埠維持全開", false]
        ]
      }
    },
    {
      code: "K02", slug: "k02", nm: "線上猜密碼", en: "登入失敗",
      goal: "指出哪一種登入紀錄代表有人在大量嘗試",
      scenario: "同一台伺服器的登入紀錄裡，有正常登入，也有異常失敗。",
      example: "大量失敗、而且來自同一個來源，才像自動化嘗試。",
      phase1: {
        type: "choose",
        label: "哪一筆應該觸發鎖定或限流？",
        options: [
          "同一 IP 在一分鐘內對 SSH 失敗 40 次",
          "使用者打錯一次密碼後就登入成功",
          "排程每天凌晨用金鑰連線備份"
        ],
        answer: 0,
        wrong: "這是正常或低次數的登入。找短時間大量失敗的那筆。",
        leak: "大量失敗代表線上猜密碼。防治是 MFA、限流，以及不要把管理服務直接露出去。"
      },
      success: "你抓住了失敗次數這個訊號。",
      codefix: {
        lang: "登入政策", bad: 1,
        lines: [
          "# sshd",
          "PasswordAuthentication yes",
          "MaxAuthTries 999"
        ],
        fixes: [
          ["啟用金鑰或 MFA，並把連續失敗次數限制得很低", true],
          ["把連接埠改掉，失敗次數維持不限", false],
          ["失敗時不回應，但次數不限制", false]
        ]
      }
    },
    {
      code: "K03", slug: "k03", nm: "離線還原雜湊", en: "密碼儲存",
      goal: "挑出哪一種密碼儲存擋得住離線比對",
      scenario: "一份假的密碼欄被拿來上課。有的是加鹽慢雜湊，有的是沒加鹽的快雜湊。",
      example: "離線比對怕的是又快又能事前算好的雜湊。",
      phase1: {
        type: "choose",
        label: "哪一種儲存比較扛得住離線比對？",
        options: [
          "每位使用者各自加鹽的 bcrypt / Argon2",
          "全站共用的 MD5，而且沒有加鹽",
          "把密碼 Base64 之後存起來"
        ],
        answer: 0,
        wrong: "這個仍然算得很快，或根本不是雜湊。",
        leak: "慢雜湊加上每個使用者自己的鹽，會讓離線逐一比對變得很貴。也要避免雜湊檔被拿走。"
      },
      success: "儲存方式本身就是這一關的防治。",
      codefix: {
        lang: "密碼欄", bad: 1,
        lines: [
          "import hashlib",
          "pw = hashlib.md5(password.encode()).hexdigest()",
          "save(user, pw)"
        ],
        fixes: [
          ["pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())", true],
          ["pw = hashlib.sha256(password.encode()).hexdigest()", false],
          ["pw = base64.b64encode(password.encode())", false]
        ]
      }
    },
    {
      code: "K04", slug: "k04", nm: "無線網路", en: "加密與 WPS",
      goal: "挑出比較安全的無線設定",
      scenario: "教室要設定一台示範用的無線基地台，有三組設定可以選。",
      example: "隱藏名稱擋不住已經在聽的人。WEP 和預設密碼、WPS 都是已知的弱點。",
      phase1: {
        type: "choose",
        label: "哪一組設定比較合適？",
        options: [
          "WPA2 或 WPA3，加上夠長的隨機金鑰，並關閉 WPS",
          "WEP，因為設定步驟比較短",
          "WPA2 但沿用機器預設密碼，並留下 WPS"
        ],
        answer: 0,
        wrong: "這組仍然用舊加密、預設密碼或 WPS。",
        leak: "夠長的隨機金鑰加上停用 WPS，才是這一關要留下的設定。"
      },
      success: "無線安全主要在加密與金鑰，不在把名稱藏起來。",
      codefix: {
        lang: "無線基地台", bad: 1,
        lines: [
          "ssid=classroom",
          "encryption=WEP",
          "wps=on"
        ],
        fixes: [
          ["encryption=WPA3; psk=隨機長金鑰; wps=off", true],
          ["ssid=hidden; encryption=WEP", false],
          ["encryption=WPA2; psk=admin123; wps=on", false]
        ]
      }
    },
    {
      code: "K05", slug: "k05", nm: "流量被竊聽", en: "加密傳輸",
      goal: "挑出就算封包被看到也讀不到內容的作法",
      scenario: "共用網路上，封包可能被旁人看到。問題是內容有沒有加密。",
      example: "換成交換器只能增加難度，不能保護內容。",
      phase1: {
        type: "choose",
        label: "哪一種作法才是根本防治？",
        options: [
          "全程使用 TLS / HTTPS",
          "把集線器換成交換器就好",
          "把無線網路名稱藏起來"
        ],
        answer: 0,
        wrong: "這只能讓竊聽變難一點，內容仍可能是明文。",
        leak: "加密之後，就算封包被看到，也讀不到內容。"
      },
      success: "這一關的修法是讓傳輸加密，而不是把網路藏起來。",
      codefix: {
        lang: "網站", bad: 1,
        lines: [
          "# app server",
          "listen 80",
          "redirect_https = false"
        ],
        fixes: [
          ["listen 443; redirect all cleartext to HTTPS", true],
          ["listen 80; hide the server banner", false],
          ["listen 8080; leave HTTP as-is", false]
        ]
      }
    },
    {
      code: "K06", slug: "k06", nm: "ARP 欺騙", en: "中間人跡象",
      goal: "指出哪一種交換器功能對得上這種欺騙",
      scenario: "有人在區域網路裡回應不屬於自己的位址，想插進別人的連線中間。",
      example: "光靠重新開機或改固定 IP，擋不住下一輪欺騙。",
      phase1: {
        type: "choose",
        label: "哪一組控制比較有效？",
        options: [
          "動態 ARP 檢測、連接埠安全，再加上加密連線",
          "每週重新開機，清掉 ARP 快取",
          "改用固定 IP，就不再用 DHCP"
        ],
        answer: 0,
        wrong: "這清得掉暫存，但擋不住下一次欺騙。",
        leak: "交換器要能判斷這個回應是不是該由這台機器發出，連線本身也要加密。"
      },
      success: "防治在交換器與加密，不在把 IP 寫死。",
      codefix: {
        lang: "交換器", bad: 1,
        lines: [
          "# access port",
          "port-security off",
          "dai off"
        ],
        fixes: [
          ["開啟 port-security 與動態 ARP 檢測，並強制加密連線", true],
          ["改成固定 IP，其餘設定不動", false],
          ["只把無線加密改成 WPA3", false]
        ]
      }
    },
    {
      code: "K07", slug: "k07", nm: "已知漏洞利用", en: "修補",
      goal: "挑出面對現成利用框架時最根本的作法",
      scenario: "課堂在講：很多入侵用的是已經公開的漏洞，不是全新的手法。",
      example: "把下載網站關掉，擋不住已經拿到工具的人。",
      phase1: {
        type: "choose",
        label: "組織最該先做的是？",
        options: [
          "修補、關掉沒用的服務，並加上偵測",
          "封鎖工具的官方網站",
          "只靠防毒軟體的病毒碼"
        ],
        answer: 0,
        wrong: "工具拿不拿得到，不是漏洞還在不在。",
        leak: "已知漏洞要靠修補和縮小攻擊面。偵測是下一層，不是唯一一層。"
      },
      success: "修補比封鎖下載網站有用。",
      codefix: {
        lang: "系統", bad: 1,
        lines: [
          "# patch policy",
          "auto_update = off",
          "unused_service = running"
        ],
        fixes: [
          ["按時修補，並關掉不需要的服務", true],
          ["封鎖工具官網，服務維持現狀", false],
          ["只更新防毒病毒碼", false]
        ]
      }
    },
    {
      code: "K08", slug: "k08", nm: "自動化注入工具", en: "參數化",
      goal: "挑出自動化注入也繞不過去的作法",
      scenario: "工具可以自動嘗試很多注入寫法。它仍然是在對同一個程式下的漏洞動手。",
      example: "把錯誤訊息藏起來，只是讓工具少一點提示。",
      phase1: {
        type: "choose",
        label: "核心防治是？",
        options: [
          "後端參數化查詢，資料庫帳號只給必要權限",
          "只在網頁上限制輸入長度",
          "只靠 WAF"
        ],
        answer: 0,
        wrong: "長度限制和 WAF 都擋不住所有寫法。",
        leak: "參數化讓輸入變不成語法；權限縮小被打中之後的傷害。"
      },
      success: "工具再自動，也過不了結構已經固定的查詢。",
      codefix: {
        lang: "查詢", bad: 1,
        lines: [
          "name = form['q']",
          "sql = \"SELECT * FROM t WHERE name = '\" + name + \"'\"",
          "db.query(sql)"
        ],
        fixes: [
          ["db.query('SELECT * FROM t WHERE name = ?', [name])", true],
          ["if len(name) < 10: db.query(sql)", false],
          ["hide_errors(); db.query(sql)", false]
        ]
      }
    },
    {
      code: "K09", slug: "k09", nm: "請求被改寫", en: "伺服器端檢查",
      goal: "挑出開發者該記住的事",
      scenario: "瀏覽器送出的請求，在到達伺服器前可以被攔截和修改。前端檢查擋不住這件事。",
      example: "鎖頭只代表傳輸加密，不代表參數沒有被改。",
      phase1: {
        type: "choose",
        label: "這提醒開發者什麼？",
        options: [
          "權限、價格、身分都要在伺服器再檢查一次",
          "前端驗證過就不必在伺服器重做",
          "看到 HTTPS 就可以信任所有參數"
        ],
        answer: 0,
        wrong: "前端和加密傳輸都不會代替伺服器自己的檢查。",
        leak: "任何從用戶端來的值都要在伺服器再驗證一次。"
      },
      success: "這一關修的是「只在瀏覽器裡檢查」。",
      codefix: {
        lang: "結帳", bad: 1,
        lines: [
          "price = request.json['price']",
          "charge(price)",
          "# 前端已檢查過價格"
        ],
        fixes: [
          ["price = catalog[sku]; charge(price)  # 價格以伺服器上的目錄為準", true],
          ["if request.is_secure: charge(price)", false],
          ["if request.headers['X-Checked']: charge(price)", false]
        ]
      }
    },
    {
      code: "K10", slug: "k10", nm: "已知危險檔", en: "版本與殘留檔",
      goal: "挑出降低被掃出舊檔案的作法",
      scenario: "掃描會拿一份已知的危險路徑和過時版本來比對網站。",
      example: "把管理頁改名，只是讓這份清單暫時對不上。",
      phase1: {
        type: "choose",
        label: "比較好的作法是？",
        options: [
          "移除不該在線上的檔案，並保持系統與元件更新",
          "把管理路徑改成猜不到的名字",
          "在首頁寫上請勿掃描"
        ],
        answer: 0,
        wrong: "改名和公告都不會讓過時版本變安全。",
        leak: "拿掉殘留檔、更新元件，掃描才掃不到那些已知問題。"
      },
      success: "防治是更新與清理，不是把路徑藏起來。",
      codefix: {
        lang: "網站", bad: 1,
        lines: [
          "# deploy",
          "copy backup.sql /var/www/html/",
          "version = 2019-unpatched"
        ],
        fixes: [
          ["不要把備份放進網站目錄，並套用安全更新", true],
          ["把 backup.sql 改名成 data.txt", false],
          ["在 robots.txt 禁止列出備份", false]
        ]
      }
    },
    {
      code: "K11", slug: "k11", nm: "目錄列舉", en: "不要靠路徑保密",
      goal: "挑出面對隱藏路徑被猜到時該做的事",
      scenario: "有人在試 /admin、/backup、/.git 這類路徑。有些路徑只是碰巧沒有連結。",
      example: "路徑沒有被連結到，不代表不能被猜到。",
      phase1: {
        type: "choose",
        label: "防治上應該？",
        options: [
          "移除敏感檔、設好權限，並留意大量 404",
          "把管理頁改成冷僻名稱",
          "在 robots.txt 列出敏感目錄叫別人不要看"
        ],
        answer: 0,
        wrong: "冷僻名稱和 robots.txt 都會把位置講出來或只是拖延。",
        leak: "敏感檔不該放在那裡；權限要拒絕；大量找不到的請求要被看見。"
      },
      success: "不要把安全寄託在別人不知道網址。",
      codefix: {
        lang: "網站", bad: 1,
        lines: [
          "location /backup {",
          "  autoindex on;",
          "  # 目錄裡放著資料庫備份"
        ],
        fixes: [
          ["刪掉這個目錄，或至少拒絕外部讀取並關閉列表", true],
          ["autoindex off，檔案仍放在原處且權限開放", false],
          ["把路徑改成 /backups-2020", false]
        ]
      }
    },
    {
      code: "K12", slug: "k12", nm: "名稱解析欺騙", en: "關掉不需要的廣播",
      goal: "挑出減少這類冒充回應的作法",
      scenario: "區域網路裡，電腦會廣播詢問某個名字是誰。旁人可以搶先回答。",
      example: "這是在騙取後續的認證，不是單純的網頁問題。",
      phase1: {
        type: "choose",
        label: "最直接的防治是？",
        options: [
          "在不需要的網段關掉 LLMNR / NetBIOS 名稱解析，並改用正式 DNS",
          "把所有電腦的本機管理員密碼設成同一個",
          "只把 Wi-Fi 名稱藏起來"
        ],
        answer: 0,
        wrong: "共用本機密碼和隱藏名稱都對不上這個問題。",
        leak: "不廣播求助，就沒有人能搶答。正式 DNS 才是該問的地方。"
      },
      success: "關掉不需要的名稱廣播。",
      codefix: {
        lang: "名稱解析", bad: 1,
        lines: [
          "# client",
          "LLMNR = on",
          "NBT-NS = on"
        ],
        fixes: [
          ["LLMNR = off; NBT-NS = off; 只使用內部 DNS", true],
          ["local_admin_password = same-on-all-pcs", false],
          ["ssid_hidden = true", false]
        ]
      }
    },
    {
      code: "K13", slug: "k13", nm: "相同的本機管理員密碼", en: "橫向移動",
      goal: "挑出為什麼每台電腦用同一組本機管理員密碼很危險",
      scenario: "一台電腦的本機管理員密碼被拿到之後，攻擊者會拿去試其他電腦。",
      example: "如果每台都一樣，一台失守就等於全部失守。",
      phase1: {
        type: "choose",
        label: "為什麼這很危險？",
        options: [
          "同一組密碼可以登入其他電腦，危害會橫向擴散",
          "因為密碼比較好記，所以比較安全",
          "因為防火牆會自動擋下第二台"
        ],
        answer: 0,
        wrong: "好記和防火牆都不是這一關的重點。",
        leak: "每台電腦的本機管理員密碼必須不同，或改用集中、可輪替的管理方式。"
      },
      success: "一台失守不該變成全部失守。",
      codefix: {
        lang: "本機管理員", bad: 1,
        lines: [
          "# image",
          "local_admin = Administrator",
          "password = Winter2024!  # 所有電腦同一組"
        ],
        fixes: [
          ["每台使用不同的本機管理員密碼，或改用可輪替的集中管理", true],
          ["把同一組密碼改得更長，但每台仍然相同", false],
          ["把帳號改名，密碼維持不變", false]
        ]
      }
    },
    {
      code: "K14", slug: "k14", nm: "記憶體裡的登入憑證", en: "減少明文祕密",
      goal: "挑出降低憑證被從記憶體抽走的作法",
      scenario: "有些工具會在已經登入的機器上，從記憶體裡找出仍可用的憑證。",
      example: "這假設攻擊者已經在那台電腦上。防治是讓記憶體裡少留可用的祕密。",
      phase1: {
        type: "choose",
        label: "哪一項比較恰當？",
        options: [
          "啟用憑證保護、減少高權限登入留在一般電腦上，並盡快偵測異常程序",
          "把防毒關掉，以免它鎖到管理工具",
          "所有人用同一組網域管理員在日常電腦登入"
        ],
        answer: 0,
        wrong: "關掉防護或日常使用最高權限，都會讓這件事更容易。",
        leak: "高權限帳號不要長期留在一般電腦上，並保護記憶體裡的憑證。"
      },
      success: "減少祕密留在記憶體的時間與範圍。",
      codefix: {
        lang: "登入", bad: 1,
        lines: [
          "# helpdesk pc",
          "domain_admin_logs_in = daily",
          "credential_guard = off"
        ],
        fixes: [
          ["限制高權限帳號登入一般電腦，並開啟憑證保護", true],
          ["domain_admin_logs_in = daily; antivirus = off", false],
          ["shared_admin = true", false]
        ]
      }
    },
    {
      code: "K15", slug: "k15", nm: "釣魚", en: "人與郵件",
      goal: "挑出對抗釣魚要一起做的事",
      scenario: "一封看起來像學校的信，附件和連結都讓人想點。單一措施很容易被繞過。",
      example: "看到鎖頭不代表寄件者是真的。",
      phase1: {
        type: "choose",
        label: "最關鍵的組合是？",
        options: [
          "使用者教育、郵件過濾、MFA，以及 SPF/DKIM/DMARC",
          "只靠郵件過濾",
          "教使用者看到 HTTPS 就可以點"
        ],
        answer: 0,
        wrong: "過濾或鎖頭都只是其中一塊。",
        leak: "人、郵件、第二因素和寄件網域驗證要一起用。"
      },
      success: "不要把判斷寄件者的責任只放在鎖頭上。",
      codefix: {
        lang: "郵件", bad: 1,
        lines: [
          "# mail",
          "spf = none",
          "dmarc = none"
        ],
        fixes: [
          ["設定 SPF、DKIM、DMARC，並加上過濾、教育與 MFA", true],
          ["只啟用垃圾信過濾", false],
          ["教使用者看到鎖頭就點連結", false]
        ]
      }
    },
    {
      code: "K16", slug: "k16", nm: "DNS 欺騙", en: "解析要能驗證",
      goal: "挑出降低假的網址回答造成的影響",
      scenario: "如果回答「這個名字是哪一台」的人可以被冒充，使用者就會連到錯的地方。",
      example: "只換一台解析器，卻不驗證回答，仍然信錯的人。",
      phase1: {
        type: "choose",
        label: "比較好的組合是？",
        options: [
          "使用有驗證的 DNS，並讓重要服務再靠憑證確認身分",
          "把 DNS 快取時間設成 0 就好",
          "只在瀏覽器書籤裡寫 IP"
        ],
        answer: 0,
        wrong: "縮短快取或改用 IP，都沒有驗證回答是誰給的。",
        leak: "解析結果要能被驗證，網站還要用憑證確認自己是誰。"
      },
      success: "不要只相信下一個回答你的人。",
      codefix: {
        lang: "DNS", bad: 1,
        lines: [
          "# resolver",
          "dnssec = off",
          "tls_verify = off"
        ],
        fixes: [
          ["啟用 DNSSEC 或等價驗證，並檢查伺服器憑證", true],
          ["ttl = 0", false],
          ["bookmark = http://10.0.0.5", false]
        ]
      }
    },
    {
      code: "K17", slug: "k17", nm: "密碼噴灑", en: "不要用常見密碼",
      goal: "挑出面對「每個帳號只試一兩個常見密碼」的作法",
      scenario: "這種嘗試不會在同一個帳號上失敗很多次，所以只靠鎖定帳號會漏掉。",
      example: "它打的是「很多人用同一組爛密碼」。",
      phase1: {
        type: "choose",
        label: "防治上應該？",
        options: [
          "禁止常見密碼、加上 MFA，並留意很多帳號各失敗一兩次的來源",
          "只把單一帳號的失敗鎖定門檻調高",
          "強制每 30 天換一次密碼，內容不限制"
        ],
        answer: 0,
        wrong: "把鎖定調高會更晚發現；定期更換也不會阻止大家換成同一個季節密碼。",
        leak: "常見密碼要被拒絕，第二因素要在，異常的少數失敗也要被看見。"
      },
      success: "看的是很多帳號的輕微失敗，不是單一帳號的大量失敗。",
      codefix: {
        lang: "密碼政策", bad: 1,
        lines: [
          "# directory",
          "common_passwords = allowed",
          "mfa = off"
        ],
        fixes: [
          ["拒絕常見密碼，並要求 MFA", true],
          ["lockout = 100 failures", false],
          ["expire every 30 days; no content rules", false]
        ]
      }
    },
    {
      code: "K18", slug: "k18", nm: "把人踢下線", en: "無線管理幀",
      goal: "挑出降低假的斷線封包造成的影響",
      scenario: "無線網路上，假的斷線要求會讓裝置重新連線。重新連線的過程不該洩漏可被拿去比對的祕密。",
      example: "隱藏網路名稱對這種封包沒有幫助。",
      phase1: {
        type: "choose",
        label: "對應的防治是？",
        options: [
          "使用有保護管理幀的新式無線加密，並監控異常的大量斷線",
          "改用 WEP",
          "把 SSID 藏起來"
        ],
        answer: 0,
        wrong: "WEP 和隱藏名稱都不會保護管理幀。",
        leak: "新式加密可以保護管理幀，異常的大量斷線也該被看見。"
      },
      success: "不要為了收集連線過程而把網路降級。",
      codefix: {
        lang: "無線", bad: 1,
        lines: [
          "# wlan",
          "pmf = disabled",
          "encryption = WPA2-only-legacy"
        ],
        fixes: [
          ["啟用管理幀保護，並監控大量斷線", true],
          ["encryption = WEP", false],
          ["ssid_hidden = true", false]
        ]
      }
    },
    {
      code: "K19", slug: "k19", nm: "殘留帳密與外送", en: "不要把祕密留在檔案裡",
      goal: "挑出減少設定檔和圖片裡夾帶祕密的作法",
      scenario: "腳本、設定檔、甚至看似普通的檔案裡，都可能留下帳號密碼，也可能被拿去外送。",
      example: "加密檔名不會讓內容裡的密碼消失。",
      phase1: {
        type: "choose",
        label: "比較好的防治是？",
        options: [
          "祕密放在專用的保管處、掃描儲存庫，並監控異常外送",
          "把密碼寫在圖片的檔名裡",
          "把設定檔改成 .bak 就不會被看到"
        ],
        answer: 0,
        wrong: "改名和寫進檔名都仍然把祕密留在檔案裡。",
        leak: "帳密不要寫進程式和圖片；外送要被看見。"
      },
      success: "這一關是清理殘留祕密，不是把檔案藏好。",
      codefix: {
        lang: "儲存庫", bad: 1,
        lines: [
          "# deploy script",
          "password = 'Winter2024!'",
          "# 直接寫在腳本裡"
        ],
        fixes: [
          ["改從祕密保管處讀取，並掃描儲存庫裡的殘留帳密", true],
          ["把這一行移到 readme.txt", false],
          ["password = base64('Winter2024!')", false]
        ]
      }
    },
    {
      code: "K20", slug: "k20", nm: "權限提升", en: "最小權限",
      goal: "挑出降低一般帳號變成最高權限的風險",
      scenario: "一般使用者的程序如果跑得和系統管理員一樣高，被濫用時就直接是最高權限。",
      example: "防毒不能代替「這個程序根本不該有這麼高的權限」。",
      phase1: {
        type: "choose",
        label: "最核心的原則是？",
        options: [
          "最小權限：日常工作不用最高權限，並修補會被拿來提權的漏洞",
          "所有人加入系統管理員群組，以免權限不夠",
          "只把防毒更新打開"
        ],
        answer: 0,
        wrong: "給更高權限或只更新防毒，都沒有縮小權限。",
        leak: "日常帳號保持低權限，提權漏洞要修。"
      },
      success: "權限少，才沒有東西可被提升。",
      codefix: {
        lang: "帳號", bad: 1,
        lines: [
          "# workstation",
          "user_groups = Administrators",
          "auto_update = off"
        ],
        fixes: [
          ["user_groups = Users; 按時修補", true],
          ["user_groups = Administrators; antivirus = on", false],
          ["auto_update = off", false]
        ]
      }
    },
  ];
})();
