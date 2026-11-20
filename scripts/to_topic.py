# 사용: PYTHONUTF8=1 python scripts/to_topic.py [<topic> ...]   (인자가 없으면 SECTIONS 를 가진 모든 주제)
# 주제 페이지(<topic>/index.html)를 A형 학습 경로 페이지로 다시 만든다.
#  - 예전 페이지에서 TOPIC_ID · TOPIC_NAME · SECTIONS 를 읽고, 설명·분류는 루트 index.html 의 CATS 에서 가져온다.
#  - 장마다 anim: 그 장 파일이 레슨 화면(anim/lesson.jsx)이면 true
#  - 화면은 ../anim/topic.js, 색·부품은 ../anim/platform.css
# 다시 돌려도 된다: 이미 바뀐 페이지는 그 안의 TOPIC 설정을 다시 읽어 새로 쓴다.
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

def cats():
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    out = {}
    blocks = re.findall(r"\{\s*num:\s*'[^']*',\s*name:\s*'([^']*)',\s*items:\s*\[([\s\S]*?)\]\s*\}", src)
    for ci, (cname, body) in enumerate(blocks):
        for tid, name, desc, parts, ch in re.findall(r"\['([a-z0-9-]+)','([^']*)','([^']*)',(\d+),(\d+)\]", body):
            out[tid] = {"cat": ci, "catName": cname, "name": name, "desc": desc}
    return out

def read_old(src):
    m = re.search(r"window\.TOPIC = (\{[\s\S]*?\});\n", src)
    if m: return json.loads(m.group(1))
    tid = re.search(r"const TOPIC_ID\s*=\s*['\"]([^'\"]+)['\"]", src).group(1)
    name = re.search(r"const TOPIC_NAME\s*=\s*['\"](.+?)['\"]", src).group(1)
    body = re.search(r"const SECTIONS = \[([\s\S]*?)\n    \];", src).group(1)
    secs = []
    for part, label, items in re.findall(r"\{\s*part:\s*['\"]([^'\"]*)['\"],\s*label:\s*(?:['\"](.*?)['\"])\s*,\s*items:\s*\[([\s\S]*?)\]\s*\}", body):
        its = [{"id": i, "title": t, "file": "./" + f} for i, _, t, f in re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"],\s*title:\s*(['\"])(.*?)\2,\s*file:\s*['\"]\./([^'\"]+)['\"]", items)]
        secs.append({"part": part, "label": label, "items": its})
    return {"id": tid, "name": name, "sections": secs}

PAGE = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{name} — 개발자 학습 노트</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><text y='14' font-size='14'>📓</text></svg>" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="../anim/platform.css">
</head>
<body class="pf pf-white">
  <!-- 주제 페이지(학습 경로) — scripts/to_topic.py 가 만든다. 화면 코드는 ../anim/topic.js -->
  <header class="pf-nav"><div class="in">
    <a class="pf-logo" href="../index.html"><span>개발자 학습 노트</span></a>
    <nav class="pf-links" id="links"></nav><span class="sp"></span>
  </div></header>
  <div class="pf-topic">
    <aside class="pf-card pf-info" id="info"></aside>
    <div id="path"></div>
  </div>
  <button class="pf-cm-btn" id="cmBtn" aria-label="댓글 패널 열기">💬 댓글</button>
  <div class="pf-cm" id="cm" role="complementary" aria-label="댓글 패널"><div class="hd"><span>💬 댓글 / 질문</span><button id="cmClose" aria-label="댓글 패널 닫기">✕</button></div><div class="bd" id="cmBody"></div></div>
  <script>
    window.TOPIC = {topic};
  </script>
  <script src="../anim/icons.js"></script>
  <script src="../anim/topic.js"></script>
</body>
</html>
"""

C = cats()
targets = sys.argv[1:] or sorted(d.name for d in ROOT.iterdir() if (d / "index.html").exists() and d.name not in ("anim", "mindmap") and (
    "const SECTIONS = [" in (d / "index.html").read_text(encoding="utf-8") or "window.TOPIC = " in (d / "index.html").read_text(encoding="utf-8")))
for t in targets:
    p = ROOT / t / "index.html"; src = p.read_text(encoding="utf-8")
    old = read_old(src); meta = C.get(old["id"], {"cat": 1, "catName": "", "name": old["name"], "desc": ""})
    for s in old["sections"]:
        for it in s["items"]:
            f = ROOT / t / it["file"]
            it["anim"] = f.exists() and "anim/lesson.jsx" in f.read_text(encoding="utf-8")
    topic = {"id": old["id"], "name": old["name"], "desc": meta["desc"], "cat": meta["cat"], "catName": meta["catName"], "sections": old["sections"]}
    p.write_text(PAGE.replace("{name}", old["name"]).replace("{topic}", json.dumps(topic, ensure_ascii=False)), encoding="utf-8", newline="\n")
    print("ok", t, sum(len(s["items"]) for s in old["sections"]), "장 · 애니", sum(it["anim"] for s in old["sections"] for it in s["items"]))
