#!/usr/bin/env python3
"""三套教材共用：隨堂複習／總複習題庫建置與驗證（原創）。
讀 _quizzes/<module>-review20.json（頁面順序 20 題；section＝頁面題號，formQ＝Google 表單題號），
  1) 驗證：剛好 20 題、每題 4 選 1；表單第 1–20 題與 quizzes.json 逐字相同（第 1–10 題由 build_quizzes.py 凍結）；
           正解 A–D 各 5 題、不連續 3 題同字母。
  2) 產生 <module 目錄>/js/review-data.js（window.REVIEW_DATA），供 /js/review-core.js、/js/final-review.js、
     /js/review-teacher.js 使用。題目指紋 qv 與選項 id 的算法與 Kali v3 相同，學生既有作答紀錄不會失效。
  3) 為各模組 index.html／teacher.html 的本地 CSS/JS 加上內容雜湊 ?v=（cache-busting）。
用法：python3 _quizzes/build_review.py（請先跑 build_quizzes.py；Kali 另需先跑 kali-top20/build.py，見 /build.sh）"""
import json, pathlib, hashlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
Q = ROOT / "_quizzes"
L = "ABCD"
MODULES = {
 "owasp": {"dir": "owasp-top10", "title": "OWASP Top 10", "key": "owasp_top10_review_v3", "stale": []},
 "kali":  {"dir": "kali-top20", "title": "Kali Linux 20 種破解手法與防治", "key": "kali_top20_review_v3",
           "stale": ["kali_top20_review_v1", "kali_top20_review_v2"]},
 "sql":   {"dir": "sql-injection-lab", "title": "SQL Injection", "key": "sql_lab_review_v3", "stale": []},
}

def fp(*parts, n=10):
    """穩定指紋（與 Kali v3 相同）：題目／選項文字改變時就會不同"""
    return hashlib.sha256("\u241f".join(parts).encode("utf-8")).hexdigest()[:n]

def die(m): raise SystemExit("✗ " + m)

FORMS = {z["id"]: z for z in json.loads((Q / "quizzes.json").read_text(encoding="utf-8"))["quizzes"]}

def build(mod, cfg):
    rv = json.loads((Q / f"{mod}-review20.json").read_text(encoding="utf-8"))["questions"]
    if len(rv) != 20 or [q["section"] for q in rv] != list(range(1, 21)):
        die(f"{mod}: 須剛好 20 題且 section 依序為 1–20")
    form = {q["number"]: q for q in FORMS[mod]["questions"]}
    if sorted(form) != list(range(1, 21)): die(f"{mod}: quizzes.json 表單須為 20 題")
    if sorted(q["formQ"] for q in rv) != list(range(1, 21)): die(f"{mod}: formQ 須涵蓋 1–20 各一次")
    out = []
    for q in rv:
        n = q["section"]
        if list(q["options"]) != list(L) or not 0 <= q["correctIndex"] < 4: die(f"{mod} 第 {n} 題格式錯誤")
        texts = [q["options"][k] for k in L]
        if len(set(texts)) != 4: die(f"{mod} 第 {n} 題選項重複")
        if (q["source"] == "form") != (q["formQ"] <= 10): die(f"{mod} 第 {n} 題 source 與 formQ 不符")
        f = form[q["formQ"]]
        for k in ("question", "options", "correctIndex", "explanation", "icon"):
            if f[k] != q[k]: die(f"{mod} 第 {n} 題（表單第 {q['formQ']} 題）欄位 {k} 與 quizzes.json 不一致")
        m = re.match(r"^【([^】]*)】\s*", q["question"])
        correct = texts[q["correctIndex"]]
        item = {"n": n, "formQ": q["formQ"], "orig": q["formQ"] <= 10, "icon": q["icon"],
                "topic": q.get("topicLabel") or (m.group(1) if m else ""), "stem": q["question"][m.end():] if m else q["question"],
                "question": q["question"], "options": [{"l": L[i], "t": t, "id": fp(t, n=8)} for i, t in enumerate(texts)],
                "correct": q["correctIndex"], "exp": q["explanation"], "qv": fp(q["question"], *texts, correct)}
        for k in ("slug", "tab"):
            if k in q: item[k] = q[k]
        out.append(item)
    key = "".join(L[q["correctIndex"]] for q in rv)
    if any(key.count(c) != 5 for c in L): die(f"{mod}: 正解分布須 A–D 各 5 題，目前 {key}")
    if re.search(r"(.)\1\1", key): die(f"{mod}: 不可連續 3 題同一個正解字母（{key}）")
    data = {"module": mod, "title": cfg["title"], "storageKey": cfg["key"], "stale": cfg["stale"], "total": 20, "questions": out}
    js = ("/* 由 _quizzes/build_review.py 自 _quizzes/%s-review20.json 產生，請勿手改 */\nwindow.REVIEW_DATA = %s;\n"
          % (mod, json.dumps(data, ensure_ascii=False, indent=0)))
    (ROOT / cfg["dir"] / "js" / "review-data.js").write_text(js, encoding="utf-8")
    fkey = "".join(L[form[i]["correctIndex"]] for i in range(1, 21))
    print(f"✓ {mod}: 頁面正解 {key}｜表單正解 {fkey}")

ASSET = re.compile(r'((?:href|src)=")((?:\.\./)*[\w./-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')
def bust(html_path):
    base = html_path.parent
    def rep(m):
        f = (base / m.group(2)).resolve()
        if not f.exists(): die(f"{html_path.name} 引用的 {m.group(2)} 不存在")
        return f"{m.group(1)}{m.group(2)}?v={fp(f.read_text(encoding='utf-8'), n=8)}{m.group(3)}"
    s = html_path.read_text(encoding="utf-8")
    t = ASSET.sub(rep, s)
    if t != s: html_path.write_text(t, encoding="utf-8")

if __name__ == "__main__":
    for mod, cfg in MODULES.items():
        build(mod, cfg)
    for mod, cfg in MODULES.items():
        for name in ("index.html", "teacher.html"):
            p = ROOT / cfg["dir"] / name
            if p.exists(): bust(p)
    print("✓ cache-busting ?v= 已更新")
