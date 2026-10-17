#!/usr/bin/env python3
"""把 README.md 轉成 index.html（同一份內容、兩種格式）。
需要：pip install markdown
用法：python3 build.py"""
import pathlib, markdown, json, html as H, re

here = pathlib.Path(__file__).parent
md = (here / "README.md").read_text(encoding="utf-8")
body = markdown.markdown(md, extensions=["tables", "toc", "sane_lists"])
# Google 表單測驗卡片：放在 h1 之後（本頁為閱讀教材，不再有勾選式進度）
FORM_CTA = '''<aside class="formcta"><div class="formcta-txt"><b>📝 學習內容驗證（10 題）</b><span>讀完教材後，請作答這份 10 題選擇題測驗（自動計分），檢核學習成效。</span></div><a class="formcta-btn" data-quiz-form="kali" href="#" target="_blank" rel="noopener">📝 開始學習內容驗證 ↗</a></aside>'''
GSI_AREA = '<div id="gsiArea" class="gsi"></div>'
body = body.replace("</h1>", "</h1>\n" + GSI_AREA + "\n" + FORM_CTA, 1)

# ── 隨堂複習：把 _quizzes/quizzes.json 的 Kali 10 題插在對應章節末 ──
QUIZ = next(q for q in json.loads((here.parent / "_quizzes" / "quizzes.json").read_text(encoding="utf-8"))["quizzes"] if q["id"] == "kali")
# 題號 → 對應章節編號（1–20）
Q2SEC = {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 11, 10: 15}

def review_block(q):
    letters = list(q["options"].keys())
    texts = [q["options"][k] for k in letters]
    correct = texts[q["correctIndex"]]
    order = list(range(len(texts)))   # 與 quizzes.json／Google 表單相同順序（題庫已平均分配正解位置）
    stem = re.sub(r"^【[^】]*】", "", q["question"]).strip()
    opts = []
    for i, oi in enumerate(order):
        t = texts[oi]
        ok = "1" if t == correct else "0"
        opts.append(f'<li><button type="button" class="rv-opt" data-ok="{ok}"><span class="rv-l">{"ABCD"[i]}</span><span class="rv-t">{H.escape(t)}</span></button></li>')
    return (f'<section class="review" data-q="{q["number"]}" aria-label="隨堂複習第 {q["number"]} 題">'
            f'<div class="rv-head"><span class="rv-ico">{q["icon"]}</span><b>🧠 隨堂複習 {q["number"]}/10</b><span class="rv-tip">點選一次答案，立即看對錯</span></div>'
            f'<p class="rv-q">{H.escape(stem)}</p><ol class="rv-opts">{"".join(opts)}</ol>'
            f'<p class="rv-exp" hidden>💡 {H.escape(q["explanation"])}</p></section>')

blocks = {}
for q in QUIZ["questions"]:
    blocks.setdefault(Q2SEC[q["number"]], []).append(review_block(q))
parts = re.split(r'(?=<h2[ >])', body)
out = []
for part in parts:
    m = re.match(r'<h2[^>]*>(\d+)\.\s', part)
    if m and int(m.group(1)) in blocks:
        part = part.rstrip() + "\n" + "\n".join(blocks[int(m.group(1))]) + "\n"
    out.append(part)
body = "".join(out)
assert body.count('class="review"') == len(QUIZ["questions"]), "隨堂複習題插入數量不符"
html = f"""<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kali Linux 最重要的 20 種破解手法與防治</title>
<meta name="description" content="自製資安防禦教材：20 種常見攻擊手法的原理、跡象與防治。僅供授權環境教學。">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="css/style.css">
</head>
<body><main class="wrap">
{body}
<footer>自製教學教材 · 僅供合法授權環境之防禦教育使用 · 由 build.py 自 README.md 產生 · <a href="teacher.html">👨‍🏫 教師區</a></footer>
</main>
<script src="https://accounts.google.com/gsi/client" async></script>\n<script src="../js/google-auth-config.js"></script>\n<script src="../js/forms-config.js"></script>\n<script src="../js/student-auth.js"></script>\n<script src="js/review.js"></script>
</body></html>
"""
(here / "index.html").write_text(html, encoding="utf-8")
print("index.html 已產生")
