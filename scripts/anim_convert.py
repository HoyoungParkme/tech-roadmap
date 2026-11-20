# 사용: python scripts/anim_convert.py <topic>/partN/<id>.html [...]
# 챕터 페이지에 애니메이션 틀(C안)을 붙인다. 이미 붙어 있으면 건너뛴다.
#  - </head> 앞: ../../anim/anim.css, ../../anim/engine.js, ./<id>.anim.js
#  - 본 babel 스크립트 앞: ../../anim/stage.jsx
#  - 본문 그리드(LiveDataPane + CodeViewer) → <HybridBody step={step} stepIdx={stepIdx} />
#  - 쓰지 않게 된 LiveDataPane 함수는 지운다 (그 안에서만 쓰던 부품은 각 페이지 작업에서 정리)
import pathlib, re, sys

GRID = re.compile(r'\n( *)<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">\n *<LiveDataPane [^\n]*/>\n *<CodeViewer code=\{step\.code\} stepIdx=\{stepIdx\} total=\{STEPS\.length\} />\n *</div>')

def drop_function(src, name):
    i = src.find(f"\n    function {name}(")
    if i < 0: return src
    j = src.find("\n    }\n", i)
    return src[:i] + src[j + 6:]

for f in sys.argv[1:]:
    p = pathlib.Path(f); s = p.read_text(encoding="utf-8"); pid = p.stem   # 줄끝은 git(autocrlf)이 맞춘다
    if "anim/stage.jsx" in s: print("skip", f); continue
    head = (f'  <link rel="stylesheet" href="../../anim/anim.css">\n'
            f'  <script src="../../anim/engine.js"></script>\n'
            f'  <script src="./{pid}.anim.js"></script>\n</head>')
    assert s.count("</head>") == 1; s = s.replace("</head>", head)
    tag = '  <script type="text/babel">'
    assert s.count(tag) == 1, f
    s = s.replace(tag, '  <script type="text/babel" data-presets="env,react" src="../../anim/stage.jsx"></script>\n' + tag)
    s, n = GRID.subn(lambda m: f"\n{m.group(1)}<HybridBody step={{step}} stepIdx={{stepIdx}} />", s)
    assert n == 1, f"그리드를 못 찾음: {f}"
    s = drop_function(s, "LiveDataPane")
    p.write_text(s, encoding="utf-8", newline="\n")
    print("ok", f)
