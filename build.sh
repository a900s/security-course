#!/usr/bin/env bash
# 一鍵重建三套教材的題庫與頁面（需 python3；Kali 需 pip install markdown）
set -euo pipefail
cd "$(dirname "$0")"
python3 _quizzes/build_quizzes.py     # 表單題庫 quizzes.json／*.md（第 1–10 題凍結驗證）
python3 kali-top20/build.py           # Kali README.md → index.html（隨堂複習插槽）
python3 _quizzes/build_review.py      # 驗證 20 題、產生各模組 js/review-data.js、加 ?v= 雜湊
rm -rf _quizzes/__pycache__
