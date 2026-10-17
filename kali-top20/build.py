#!/usr/bin/env python3
"""把 README.md 轉成 index.html（同一份內容、兩種格式）。
需要：pip install markdown
用法：python3 build.py"""
import pathlib, markdown

here = pathlib.Path(__file__).parent
md = (here / "README.md").read_text(encoding="utf-8")
body = markdown.markdown(md, extensions=["tables", "toc", "sane_lists"])
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
<footer>自製教學教材 · 僅供合法授權環境之防禦教育使用 · 由 build.py 自 README.md 產生</footer>
</main></body></html>
"""
(here / "index.html").write_text(html, encoding="utf-8")
print("index.html 已產生")
