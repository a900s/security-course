#!/usr/bin/env python3
"""把 README.md 轉成 index.html（同一份內容、兩種格式）。
需要：pip install markdown
用法：python3 build.py"""
import pathlib, markdown

here = pathlib.Path(__file__).parent
md = (here / "README.md").read_text(encoding="utf-8")
body = markdown.markdown(md, extensions=["tables", "toc", "sane_lists"])
# Google 表單回報卡片：放在 h1 之後（學習進度面板由 progress.js 插在 h1 正後方）
FORM_CTA = '''<aside class="formcta"><div class="formcta-txt"><b>📮 Google 表單回報</b><span>除了匯出 JSON，也可以把已讀／已複習的章節填進 Google 表單回報給老師（另開新分頁）。</span></div><a class="formcta-btn" href="https://docs.google.com/forms/d/e/1FAIpQLScBsGy90SkZhNRVR6pcGr04NRZg2f0EVy8kI8c0JJ_cBqWZeA/viewform" target="_blank" rel="noopener">📝 填寫學習進度表單 ↗</a></aside>'''
body = body.replace("</h1>", "</h1>\n" + FORM_CTA, 1)
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
<footer>自製教學教材 · 僅供合法授權環境之防禦教育使用 · 由 build.py 自 README.md 產生 · <a href="teacher.html">👨‍🏫 教師區（學習進度）</a></footer>
</main>
<script src="js/progress.js"></script>
</body></html>
"""
(here / "index.html").write_text(html, encoding="utf-8")
print("index.html 已產生")
