#!/usr/bin/env python3
"""把 README.md 轉成 index.html（同一份內容、兩種格式）。
需要：pip install markdown
用法：python3 build.py"""
import pathlib, markdown, json, re

here = pathlib.Path(__file__).parent
md = (here / "README.md").read_text(encoding="utf-8")
# Python-Markdown 的巢狀清單需 4 格縮排；README 用 2 格，這裡轉成 4 格以免子清單被攤平
md = re.sub(r"(?m)^  (?=[-*+] |\d+\. )", "    ", md)
body = markdown.markdown(md, extensions=["tables", "toc", "sane_lists"])
# Google 表單測驗卡片：放在 h1 之後（本頁為閱讀教材，不再有勾選式進度）
FORM_CTA = '''<aside class="formcta"><div class="formcta-txt"><b>📝 學習內容驗證（20 題）</b><span>讀完教材、完成各章隨堂複習與文末總複習後，請作答這份 20 題選擇題測驗（自動計分），檢核學習成效。</span></div><a class="formcta-btn" data-quiz-form="kali" href="#" target="_blank" rel="noopener">📝 開始學習內容驗證 ↗</a></aside>'''
GSI_AREA = '<div id="gsiArea" class="gsi"></div>'
body = body.replace("</h1>", "</h1>\n" + GSI_AREA + "\n" + FORM_CTA, 1)

# ── 隨堂複習：_quizzes/kali-review20.json，20 個手法章節末各 1 題 ──
# 這裡只在每章末放插槽 <div class="review-slot" data-q="n">；題卡由共用的 ../js/review-core.js 依 js/review-data.js 產生。
# 題庫驗證（20 題、表單第 1–10 題凍結、第 11–20 題與 quizzes.json 一致、正解分布）與 review-data.js 產生、
# CSS/JS 的 ?v= 雜湊，都由 ../_quizzes/build_review.py 負責（一鍵：../build.sh）。
QDIR = here.parent / "_quizzes"
REVIEW = json.loads((QDIR / "kali-review20.json").read_text(encoding="utf-8"))["questions"]
N_SEC = 20
if sorted(q["section"] for q in REVIEW) != list(range(1, N_SEC + 1)):
    raise SystemExit(f"隨堂複習須剛好 {N_SEC} 題且每章 1 題")
QUIZ = {"questions": REVIEW}

def review_block(q):
    return f'<div class="review-slot" data-q="{q["section"]}"></div>'

blocks = {}
for q in QUIZ["questions"]:
    blocks.setdefault(q["section"], []).append(review_block(q))
parts = re.split(r'(?=<h2[ >])', body)
out = []
for part in parts:
    m = re.match(r'<h2[^>]*>(\d+)\.\s', part)
    if m and int(m.group(1)) in blocks:
        part = part.rstrip() + "\n" + "\n".join(blocks[int(m.group(1))]) + "\n"
    out.append(part)
body = "".join(out)
if body.count('class="review-slot"') != N_SEC or sorted(n for n in blocks if n) != list(range(1, N_SEC + 1)):
    raise SystemExit("隨堂複習題插入數量不符（有章節標題找不到？）")
for n in range(1, N_SEC + 1):
    if not re.search(rf'<h2[^>]*>{n}\.\s', body):
        raise SystemExit(f"找不到第 {n} 章標題")
FINAL = """<section class="final-review" id="final" aria-label="總複習">
<h2>🧠 總複習</h2>
<div id="finalReview"></div>
</section>"""

def asset(rel):
    """?v= 內容雜湊由 ../_quizzes/build_review.py 統一加上"""
    return rel
html = f"""<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kali Linux 最重要的 20 種破解手法與防治</title>
<meta name="description" content="自製資安防禦教材：20 種常見攻擊手法的原理、跡象與防治。僅供授權環境教學。">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{asset('css/style.css')}">
<link rel="stylesheet" href="{asset('../css/review.css')}">
</head>
<body><main class="wrap">
{body}
{FINAL}
<footer>自製教學教材 · 僅供合法授權環境之防禦教育使用 · 由 build.py 自 README.md 產生 · <a href="teacher.html">👨‍🏫 教師區</a></footer>
</main>
<script src="https://accounts.google.com/gsi/client" async></script>\n<script src="{asset('../js/google-auth-config.js')}"></script>\n<script src="{asset('../js/forms-config.js')}"></script>\n<script src="{asset('../js/student-auth.js')}"></script>\n<script src="{asset('js/review-data.js')}"></script>\n<script src="{asset('../js/review-core.js')}"></script>\n<script src="{asset('../js/final-review.js')}"></script>
</body></html>
"""
(here / "index.html").write_text(html, encoding="utf-8")
print("index.html 已產生")
