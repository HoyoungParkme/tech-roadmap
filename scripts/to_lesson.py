# 사용: PYTHONUTF8=1 python scripts/to_lesson.py <topic>/partN/<id>.html [...]
# 애니메이션 틀(anim/stage.jsx)을 쓰는 챕터 페이지를 A형 레슨 화면(anim/lesson.jsx)으로 바꾼다.
#  - <head>: ../../anim/platform.css, window.LESSON(주제·이전/다음 장·정리 문장)
#  - stage.jsx 다음에 ../../anim/lesson.jsx
#  - 페이지의 App 은 <LessonApp /> 한 줄이 된다 (머리·단계 막대·버튼은 lesson.jsx 가 그린다)
# 이전/다음 장과 제목은 주제 페이지(<topic>/index.html)의 SECTIONS 에서 읽는다. 이미 바뀐 페이지는 건너뛴다.
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

def sections(topic):
    src = (ROOT / topic / "index.html").read_text(encoding="utf-8")
    m = re.search(r"window\.TOPIC = (\{[\s\S]*?\});\n", src)   # 이미 A형 주제 페이지로 바뀐 경우
    if m:
        t = json.loads(m.group(1))
        return t["name"], [{"id": it["id"], "title": it["title"], "file": it["file"].lstrip("./")} for s in t["sections"] for it in s["items"]]
    name = re.search(r"const TOPIC_NAME\s*=\s*['\"](.+?)['\"]", src).group(1)
    items = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"],\s*title:\s*(['\"])(.*?)\2,\s*file:\s*['\"]\./([^'\"]+)['\"]", src)
    return name, [{"id": i, "title": t, "file": f} for i, _, t, f in items]

def text_of(jsx):
    t = re.sub(r"<[^>]+>", " ", jsx); t = re.sub(r"\{[^{}]*\}", " ", t)
    return re.sub(r"\s+", " ", t).strip()

for arg in sys.argv[1:]:
    p = (ROOT / arg).resolve(); rel = p.relative_to(ROOT).as_posix(); topic = rel.split("/")[0]; pid = p.stem
    s = p.read_text(encoding="utf-8")
    if "anim/lesson.jsx" in s: print("skip", rel); continue
    assert "anim/stage.jsx" in s, "애니메이션 틀이 없는 페이지: " + rel
    name, items = sections(topic)
    idx = next(k for k, it in enumerate(items) if it["id"] == pid)
    here = items[idx]["file"]; depth = here.count("/")
    up = "../" * depth
    link = lambda it: {"id": it["id"], "title": it["title"], "href": up + it["file"]} if it else None
    a = s.index("\n    function App() {"); b = min(x for x in [s.find("\n    const root", a), s.find("\n    ReactDOM.createRoot", a)] if x > 0)
    app = s[a:b]
    h1 = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", app); sub = re.search(r"</h1>\s*<p[^>]*>([\s\S]*?)</p>", app)
    wrap = re.search(r"\{isLast && \(([\s\S]*?)\n\s*\)\}", app)
    wrap_t = text_of(wrap.group(1)) if wrap else ""
    wrap_t = re.sub(r"^[✅\s]*핵심 정리\s*", "", wrap_t).strip()
    meta = {"topic": topic, "topicName": name, "topicHref": up + "index.html", "id": pid, "title": items[idx]["title"],
            "sub": text_of(sub.group(1)) if sub else "", "path": here,
            "prev": link(items[idx - 1] if idx > 0 else None), "next": link(items[idx + 1] if idx + 1 < len(items) else None),
            "wrap": wrap_t}
    s = s[:a] + "\n    function App() { return <LessonApp />; }   // 화면은 ../../anim/lesson.jsx (A형 레슨)\n" + s[b:]
    css = '  <link rel="stylesheet" href="../../anim/anim.css">'
    assert css in s; s = s.replace(css, css + '\n  <link rel="stylesheet" href="../../anim/platform.css">', 1)
    anim = f'  <script src="./{pid}.anim.js"></script>'
    assert anim in s
    s = s.replace(anim, anim + "\n  <script>window.LESSON = " + json.dumps(meta, ensure_ascii=False) + ";</script>", 1)
    st = '<script type="text/babel" data-presets="env,react" src="../../anim/stage.jsx"></script>'
    assert st in s; s = s.replace(st, st + '\n  <script type="text/babel" data-presets="env,react" src="../../anim/lesson.jsx"></script>', 1)
    p.write_text(s, encoding="utf-8", newline="\n")
    print("ok", rel, "| next:", meta["next"] and meta["next"]["id"], "| wrap:", (wrap_t[:40] + "…") if wrap_t else "-")
