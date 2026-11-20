# 사용: PYTHONUTF8=1 python scripts/build_hub.py
# 루트 index.html(첫 화면)을 A형 표준으로 다시 만든다.
#  - 주제 목록 CATS 는 기존 파일의 리터럴을 그대로 옮긴다 (check_pages.js 와 regression.yml 이 이 형식을 읽는다)
#  - ANIM: 주제별로 레슨 화면(anim/lesson.jsx)으로 바뀐 장 수 — 주제를 변환할 때마다 다시 돌린다
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "index.html").read_text(encoding="utf-8")
cats = re.search(r"(const CATS = \[[\s\S]*?\n    \];)", src).group(1)
anim = {}
for d in sorted(ROOT.iterdir()):
    if not d.is_dir() or d.name.startswith('.'): continue
    n = sum(1 for f in d.glob("part*/*.html") if "anim/lesson.jsx" in f.read_text(encoding="utf-8"))
    if n: anim[d.name] = n

PAGE = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>개발자 학습 노트</title>
  <meta name="description" content="개발 지식을 그림으로 따라가며 배우는 학습 노트">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><text y='14' font-size='14'>📓</text></svg>" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="./anim/platform.css">
</head>
<body class="pf">
  <!-- 첫 화면 — scripts/build_hub.py 가 만든다. 화면 코드는 ./anim/home.js, 색·부품은 ./anim/platform.css -->
  <header class="pf-nav"><div class="in">
    <a class="pf-logo" href="./index.html"><span>개발자 학습 노트</span></a>
    <nav class="pf-links" id="links"></nav><span class="sp"></span>
  </div></header>
  <div class="pf-home">
    <section class="pf-hero">
      <h1>개발 지식을 그림으로 따라가며 배운다</h1>
      <p>개념 하나를 한 화면씩. 요청이 오가고 숫자가 바뀌는 모습을 보며 왜 그렇게 되는지 익힌다.</p>
      <div class="pf-stats" id="stats"></div>
      <a class="pf-card pf-cont" id="cont" href="#">
        <span class="pf-art" id="contArt"></span>
        <div class="t"><div class="k" id="contK">이어서 보기</div><h3 id="contT"></h3></div>
        <span class="pf-btn primary">계속하기</span>
      </a>
    </section>
    <div class="pf-filters" id="filters"></div>
    <div id="cats"></div>
  </div>
  <script>
    // 주제 목록: [폴더, 이름, 한 줄 설명, Part 수, 장 수]  (check_pages.js 가 이 형식을 읽는다)
    {cats}
    // 레슨 화면(애니메이션)으로 바뀐 장 수 — scripts/build_hub.py 가 채운다
    const ANIM = {anim};
  </script>
  <script src="./anim/icons.js"></script>
  <script src="./anim/home.js"></script>
</body>
</html>
"""
(ROOT / "index.html").write_text(PAGE.replace("{cats}", cats.strip()).replace("{anim}", json.dumps(anim)), encoding="utf-8", newline="\n")
print("ok", anim)
