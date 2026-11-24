/* V-1-1 프로젝트 구조·poetry — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인(python 3.12): 루트에서 import myapp → 평면 레이아웃은 ./myapp 을 찾고, src 레이아웃은 ModuleNotFoundError.
 * ^0.27 = >=0.27,<0.28 (0.27.2 포함, 0.28.0 제외). httpx 0.27.2 하나를 더하면 lock 에 8개 패키지가 적힌다(3.12, pip 해결 결과). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── 작은 그림 부품 ──
  function folder(x, y, col, s) { const g = R.G(x, y, s ?? 1);
    el('path', { d: 'M-9,-6 L-3,-6 L-1,-3 L9,-3 L9,7 L-9,7 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g); return g; }
  function fileIc(x, y, col, s) { const g = R.G(x, y, s ?? 1);
    el('path', { d: 'M-7,-9 L3,-9 L7,-5 L7,9 L-7,9 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M3,-9 L3,-5 L7,-5', fill: 'none', stroke: col || INK, 'stroke-width': 1.4 }, g); return g; }
  function star(x, y, r, col, s) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push([x + Math.cos(a) * rr * (s ?? 1), y + Math.sin(a) * rr * (s ?? 1)]); }
    el('polygon', { points: pts.map((p) => p.join(',')).join(' '), fill: col || WARN }); }
  // 한 줄을 타이핑하듯 (p 0→1)
  const typed = (s, p) => s.slice(0, Math.round(s.length * clamp(p)));
  // 진행 표시: 장면 5의 ①~④
  function tracker(k, labels) { labels.forEach((s, i) => { const x = 120 + i * 240, on = i === k, done = i < k;
    card(x, 30, 218, 34, { rx: 17, text: s, fs: 14, fw: 700, stroke: on ? BAD : done ? GOOD : GRID, color: on ? BAD : done ? GOOD : MUT, fill: on ? C.BADBG : PANEL, sw: on ? 2.4 : 1.5 }); }); }

  // ═════════ 1. 표준 레이아웃 ═════════
  const TREE = [
    { d: 0, n: 'myapp/', kind: 'root', k: 0, note: '프로젝트 루트' },
    { d: 1, n: 'src/', kind: 'dir', k: 1 },
    { d: 2, n: 'myapp/', kind: 'pkg', k: 1, note: '실제 패키지' },
    { d: 3, n: '__init__.py', kind: 'file', k: 2, note: '패키지 표시' },
    { d: 3, n: 'main.py', kind: 'file', k: 2, note: '진입점 모듈' },
    { d: 1, n: 'tests/', kind: 'dir', k: 3 },
    { d: 2, n: 'test_main.py', kind: 'file', k: 3, note: '설치본을 import' },
    { d: 1, n: 'pyproject.toml', kind: 'key', k: 4, note: '메타·의존성·빌드' },
    { d: 1, n: 'poetry.lock', kind: 'key', k: 4, note: '정확한 버전' },
    { d: 1, n: 'README.md', kind: 'file', k: 5 },
    { d: 1, n: '.gitignore', kind: 'file', k: 5, note: '.venv/ 등 제외' },
    { d: 1, n: '.venv/', kind: 'gone', k: 5, note: '커밋 안 함' },
  ];
  const TX = (d) => 46 + d * 30, TY = (i) => 48 + i * 29.5;
  function tree(k, u) {
    TREE.forEach((r, i) => { if (r.k > k) return; const now = r.k === k, x = TX(r.d), y = TY(i);
      const g = now ? E(u, 0.2 + (i % 3) * 0.25, 0.8 + (i % 3) * 0.25) : 1;
      if (r.d > 0) { let pi = i - 1; while (TREE[pi].d >= r.d) pi--; const px = TX(TREE[pi].d) + 2, py = TY(pi) + 9;
        el('line', { x1: px, y1: py, x2: px, y2: lerp(py, y, g), stroke: GRID, 'stroke-width': 1.8 });
        if (g > 0.95) el('line', { x1: px, y1: y, x2: x - 12, y2: y, stroke: GRID, 'stroke-width': 1.8 }); }
      if (g < 0.95) return; const s = now ? pop(u, 0.5 + (i % 3) * 0.25) : 1;
      const col = r.kind === 'key' ? WARN : r.kind === 'pkg' || r.kind === 'root' ? INFO : r.kind === 'gone' ? OFF : INK;
      (r.kind === 'file' || r.kind === 'key' ? fileIc : folder)(x, y - 4, col, s);
      if (r.kind === 'key') star(x + 15, y - 12, 6, WARN, s);
      mono(x + 16, y + 1, r.n, { 'font-size': 15, 'font-weight': r.kind === 'file' || r.kind === 'gone' ? 500 : 700, fill: col, opacity: s, 'text-decoration': r.kind === 'gone' ? 'line-through' : null });
      if (r.note) tx(260, y + 1, r.note, { 'font-size': 13.5, fill: r.kind === 'gone' ? BAD : r.kind === 'key' ? WARN : MUT, opacity: now ? fade(u, 1.0 + (i % 3) * 0.2) : 1 }); });
    if (k >= 1) { const a = k === 1 ? E(u, 0.9, 1.6) : 1;   // src/ 격리 구역
      el('rect', { x: 60, y: TY(1) - 17, width: 360, height: (k >= 2 ? TY(4) : TY(2)) - TY(1) + 32, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: a });
      tx(412, TY(1) + 1, '임포트 격리', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: a }); } }
  // 오른쪽: import myapp 이 sys.path 를 차례로 뒤지는 모습
  function sysPath(k, u) { const x = 520, w = 410;
    tx(x, 50, 'import myapp 은 sys.path 를 위에서부터 찾는다', { 'font-size': 15, 'font-weight': 700 });
    const rows = [["''", '현재 폴더 = 프로젝트 루트'], ['…\\Lib', '표준 라이브러리'], ['site-packages', '설치된 패키지']];
    rows.forEach(([a, b], i) => { const y = 78 + i * 52, s = k === 0 ? pop(u, 0.4 + i * 0.3) : 1;
      card(x + w / 2, y + 20, w, 42, { rx: 8, stroke: GRID, sw: 1.5, s });
      mono(x + 14, y + 26, a, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: s }); tx(x + 160, y + 26, b, { 'font-size': 14, fill: MUT, opacity: s }); });
    const probe = (p) => { const y = lerp(98, 202, clamp(p)); if (p > 0 && p < 1) pill(x + w - 66, y, 'import myapp', ACC, 1, { mono: true, fs: 13.5 }); };
    if (k === 1) { probe(seg(u, 0.3, 2.0)); if (u > 0.8) cross(x + w - 24, 98, 9); if (u > 2.0) cross(x + w - 24, 202, 9);
      if (u > 0.8) sub(x + 205, 135, '루트에는 src/ 뿐, myapp/ 이 없다', fade(u, 0.8), { fill: BAD, 'font-weight': 700 }); }
    if (k === 1 || k === 2) { const op = k === 1 ? fade(u, 2.1) : 1;
      card(x + w / 2, 262, w, 40, { rx: 8, fill: C.BADBG, stroke: BAD, sw: 1.8, op });
      mono(x + 14, 267, "ModuleNotFoundError: No module named 'myapp'", { 'font-size': 13.5, fill: BAD, opacity: op });
      tx(x + w / 2, 306, '설치하기 전에는 import 되지 않는다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
    if (k === 2) tx(x + w / 2, 340, '__init__.py 가 있어 src/myapp 은 패키지로 인식된다', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 600, opacity: fade(u, 1.2) });
    if (k === 3) { fly(x + 90, 290, x + 300, 202, seg(u, 0.4, 1.4), 'myapp', { mono: true, stay: true, fill: GOOD });
      card(x + 90, 290, 150, 34, { rx: 17, text: 'poetry install', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.1) });
      if (u > 1.4) check(x + w - 24, 202, 10, pop(u, 1.4));
      const a = E(u, 1.6, 2.4); el('path', { d: `M ${x - 70} ${TY(6) - 4} C ${x - 30} ${TY(6) - 4}, ${x - 40} 202, ${lerp(x - 40, x - 4, a)} 202`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: a });
      tx(x + w / 2, 350, '테스트도 배포와 같은 설치본을 쓴다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); } }
  function gitBox(k, u) { const x = 520, w = 410;
    zone(x, 40, w, 250, 'git 저장소에 들어가는 것', { stroke: GRID, fill: SOFT });
    const inn = [['pyproject.toml', 4], ['poetry.lock', 4], ['README.md', 5], ['.gitignore', 5]];
    inn.forEach(([n, kk], i) => { if (kk > k) return; const now = kk === k, y = 92 + i * 44, p = now ? seg(u, 0.3 + (i % 2) * 0.4, 1.2 + (i % 2) * 0.4) : 1;
      const xx = lerp(x - 140, x + 30, E(p, 0, 1)); fileIc(xx, y - 4, kk === 4 ? WARN : INK, p > 0 ? 1 : 0); if (p > 0) mono(xx + 16, y + 1, n, { 'font-size': 15, 'font-weight': 700, fill: kk === 4 ? WARN : INK });
      if (p >= 1 && kk === 4) tx(x + w - 16, y + 1, '커밋 필수', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end' }); });
    if (k === 5) { [['.venv/', 0.6], ['__pycache__/', 1.0]].forEach(([n, a], i) => { const y = 340 + i * 36, b = seg(u, a, a + 0.8), xx = x + 60 + Math.sin(b * Math.PI) * 50;
        folder(xx, y - 4, OFF); mono(xx + 16, y + 1, n, { 'font-size': 15, fill: MUT, 'text-decoration': 'line-through' }); if (b >= 1) cross(xx + 150, y - 3, 8); });
      tx(x + 250, 358, '사람마다 다르다', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(x + 250, 380, '재현성은 lock 이 맡는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); } }
  function compare(u) {
    const col = (x, title, rows, lines, okCol, note, a) => {
      tx(x, 40, title, { 'font-size': 17, 'font-weight': 800, fill: okCol, opacity: fade(u, a) });
      rows.forEach(([d, n, isDir], i) => { const y = 74 + i * 28, xx = x + 6 + d * 26; (isDir ? folder : fileIc)(xx, y - 4, d === 0 ? INFO : INK, pop(u, a + 0.1 + i * 0.12)); mono(xx + 16, y + 1, n, { 'font-size': 14.5, 'font-weight': isDir ? 700 : 500, opacity: fade(u, a + 0.1 + i * 0.12) }); });
      terminal(x, 172, 420, 132, lines, lerp(0, lines.length, E(u, a + 0.4, a + 1.4)), { fs: 13.5, lh: 21 });
      tx(x + 210, 336, note[0], { 'font-size': 15, 'font-weight': 700, fill: okCol, 'text-anchor': 'middle', opacity: fade(u, a + 1.5) });
      tx(x + 210, 360, note[1], { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a + 1.6) }); };
    col(30, '평면 레이아웃 (피한다)', [[0, 'myapp/', true], [1, 'myapp/', true], [2, '__init__.py'], [1, 'tests/', true]],
      ['$ python -c "import myapp"', ["sys.path[0] = ''  (현재 폴더)", 'var(--term)'], ['imported from .\\myapp\\__init__.py', '#fbbf24']], BAD, ['설치 안 한 코드가 우연히 import 된다', '로컬 통과, 배포에서 ModuleNotFoundError'], 0.1);
    col(510, 'src 레이아웃 (표준)', [[0, 'myapp/', true], [1, 'src/', true], [2, 'myapp/', true], [1, 'tests/', true]],
      ['$ python -c "import myapp"', ["sys.path[0] = ''  (현재 폴더)", 'var(--term)'], ["ModuleNotFoundError: No module", '#f87171'], ["named 'myapp'", '#f87171']], GOOD, ['설치해야만 import 된다', '로컬과 배포가 같은 조건'], 0.6);
    el('line', { x1: 480, y1: 30, x2: 480, y2: 390, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' });
    tx(480, 408, 'python 3.12 로 두 폴더에서 직접 실행한 결과', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 6) return compare(u);
    tree(k, u);
    if (k <= 3) sysPath(k, u); else gitBox(k, u); }

  // ═════════ 2. pyproject.toml ═════════
  const TOML = [
    { k: 0, h: '[tool.poetry]', tone: INFO },
    { k: 0, s: 'name = "myapp"' }, { k: 0, s: 'version = "0.1.0"', hot: 0 },
    { k: 1, s: 'packages = [{ from = "src" }]', hot: 1 },
    { k: 2, h: '[tool.poetry.dependencies]', tone: INFO, gap: 1 },
    { k: 2, s: 'python = "^3.11"' }, { k: 2, s: 'httpx = "^0.27"', hot: 2 },
    { k: 3, h: '[tool.poetry.group.dev.dependencies]', tone: WARN, gap: 1 },
    { k: 3, s: 'pytest = "^8.0"   ruff = "^0.5"' },
    { k: 3, h: '[tool.poetry.scripts]', tone: INFO },
    { k: 3, s: 'myapp = "myapp.main:main"', hot: 3 },
    { k: 4, h: '[build-system]', tone: GOOD, gap: 1 },
    { k: 4, s: 'requires = ["poetry-core"]', hot: 4 },
  ];
  function tomlDoc(k, u) { const x = 30, y = 30, w = 450;
    el('rect', { x, y, width: w, height: 352, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    el('rect', { x, y, width: w, height: 30, rx: 10, fill: SOFT }); mono(x + 14, y + 20, 'pyproject.toml', { 'font-size': 14.5, 'font-weight': 700 });
    let yy = y + 52, n = 0;
    TOML.forEach((r) => { if (r.k > k) return; if (r.gap) yy += 8; const now = r.k === k, p = now ? seg(u, 0.2 + n * 0.25, 0.9 + n * 0.25) : 1; if (now) n++;
      if (r.hot === k) el('rect', { x: x + 6, y: yy - 15, width: w - 12, height: 21, rx: 5, fill: ACCBG, opacity: now ? fade(u, 0.3) : 1 });
      mono(x + 16, yy, typed(r.h || r.s, p), { 'font-size': 14, 'font-weight': r.h ? 800 : 500, fill: r.h ? r.tone : INK }); yy += 21.5; }); }
  // 대체되는 옛 파일 셋
  function oldFiles(k, u) { const L = [['setup.py', 1, 580], ['requirements.txt', 2, 700], ['setup.cfg', 3, 870]];
    tx(530, 340, '흩어져 있던 옛 파일', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    L.forEach(([n, kk, x], i) => { const y = 380, gone = k >= kk, now = kk === k;
      if (now) { fly(x, y, 300, 220, seg(u, 1.6, 2.5), n, { mono: true, fill: OFF, color: INK }); }
      const op = gone ? (now ? 1 - 0.6 * fade(u, 1.6, 0.6) : 0.4) : 1;
      fileIc(x - 44, y - 3, INK, 1); mono(x - 30, y + 2, n, { 'font-size': 14, opacity: op, 'text-decoration': gone && (!now || u > 1.8) ? 'line-through' : null }); }); }
  function s2(t, c) { const { k, u } = c;
    tomlDoc(k, u); oldFiles(k, u);
    const x = 520;
    if (k === 0) { mono(700, 92, '0 . 1 . 0', { 'font-size': 40, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      [['major', '깨지는 변경', 610], ['minor', '기능 추가', 700], ['patch', '버그 수정', 790]].forEach(([a, b, cx], i) => { const s = pop(u, 0.8 + i * 0.35);
        grow(cx, 108, cx, 146, E(u, 0.7 + i * 0.35, 1.1 + i * 0.35), GRID, { plain: true });
        card(cx, 172, 84, 50, { rx: 8, text: a + '\n' + b, fs: 13.5, stroke: i === 0 ? BAD : i === 1 ? INFO : GOOD, s }); });
      tx(700, 244, 'SemVer: 호환성 약속을 숫자로 적는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 1) { const a = E(u, 0.4, 1.2);
      el('path', { d: `M 400 133 C 470 133, 520 133, ${lerp(400, 600, a)} 133`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: a });
      folder(630, 129, INFO, pop(u, 1.1)); mono(646, 134, 'src/myapp/', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.1) });
      tx(x + 20, 190, 'Step 1 의 src 레이아웃을 설정에 잇는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(x + 20, 216, '이름이 같으면 poetry 가 src/ 에서 찾아 주지만', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      tx(x + 20, 238, '적어 두면 빌드에 담길 위치가 분명해진다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 2) { const Y = 150, L0 = 620, L1 = 820, g = E(u, 0.2, 1.0);
      el('line', { x1: 540, y1: Y, x2: lerp(540, 920, g), y2: Y, stroke: MUT, 'stroke-width': 2 });
      const band = E(u, 0.9, 1.6); el('rect', { x: L0, y: Y - 26, width: (L1 - L0) * band, height: 40, rx: 6, fill: C.GOODBG, opacity: 0.9 });
      el('line', { x1: L0, y1: Y - 30, x2: L0, y2: Y + 12, stroke: GOOD, 'stroke-width': 2.4, opacity: band }); el('line', { x1: L1, y1: Y - 30, x2: L1, y2: Y + 12, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '4 3', opacity: band });
      mono(L0, Y - 38, '>=0.27', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: band }); mono(L1, Y - 38, '<0.28', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: band });
      [['0.27.0', L0 + 14, GOOD, 1.5], ['0.27.2', 720, GOOD, 1.8], ['0.28.0', L1, BAD, 2.1]].forEach(([v, cx, col, a2]) => { const s = pop(u, a2);
        el('circle', { cx, cy: Y, r: 7 * s, fill: col }); mono(cx, Y + 36, v, { 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: fade(u, a2) }); });
      tx(x + 20, 252, '^0.27 은 범위다. 정확한 버전은 lock 이 정한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 3) { pill(580, 92, '$ myapp', INK, pop(u, 0.3), { mono: true });
      grow(626, 92, 700, 92, E(u, 0.6, 1.2), ACC); card(800, 92, 196, 36, { rx: 8, text: 'myapp.main:main()', mono: true, fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 1.1) });
      tx(x + 20, 140, '설치하면 콘솔 명령이 함수에 연결된다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.3) });
      zone(x + 10, 170, 390, 92, 'dev 그룹 (개발 전용)', { stroke: WARN, fill: C.WARNBG, color: WARN, op: fade(u, 1.3) });
      pill(600, 230, 'pytest', WARN, pop(u, 1.6), { mono: true }); pill(700, 230, 'ruff', WARN, pop(u, 1.8), { mono: true });
      tx(890, 236, '배포에서 뺀다', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }
    if (k === 4) { const st = [['pyproject.toml', '읽기만 한다'], ['poetry-core', '백엔드 설치'], ['빌드', 'wheel 만들기']];
      tx(x + 20, 52, 'pip 이 [build-system] 을 읽고 시작한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      st.forEach(([a, b], i) => { const cy = 100 + i * 70, s = pop(u, 0.5 + i * 0.4); card(640, cy, 220, 50, { rx: 10, text: a + '\n' + b, fs: 14, stroke: GOOD, s });
        if (i < 2) grow(640, cy + 26, 640, cy + 44, E(u, 0.8 + i * 0.4, 1.1 + i * 0.4), GOOD); });
      card(850, 170, 140, 70, { rx: 10, stroke: BAD, sw: 1.8, fill: C.BADBG, s: pop(u, 1.8) });
      mono(850, 162, 'setup.py', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      tx(850, 186, '실행해야 읽힌다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); cross(850, 120, 10, pop(u, 2.1)); } }

  // ═════════ 3. poetry 흐름 ═════════
  const CMDS = [['$ poetry new --src myapp', 0], ['$ poetry add httpx', 1], ['Resolving dependencies...', 2], ['Writing lock file', 3],
    ['$ poetry add --group dev pytest ruff', 4], ['$ poetry install', 5], ['$ poetry run pytest', 6], ['$ poetry run myapp', 6]];
  function lockTable(k, u) { const x = 610, y = 34, w = 320;
    el('rect', { x, y, width: w, height: 236, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2 });
    mono(x + 14, y + 22, 'poetry.lock', { 'font-size': 15, 'font-weight': 800, fill: WARN });
    if (k >= 3) tx(x + w - 12, y + 22, '버전은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (k === 0) { tx(x + w / 2, y + 120, '(비어 있음)', { 'font-size': 15, fill: OFF, 'text-anchor': 'middle' }); return; }
    const rows = [['httpx', k >= 3 ? '0.27.2' : k === 2 ? '0.27.2 (계산됨)' : '(아직 없음)', 1], ['anyio', '4.4.0', 3], ['certifi', '2024.7.4', 3], ['그 밖 5개', 'httpcore · idna …', 3], ['pytest', 'dev', 4], ['ruff', 'dev', 4]];
    let i = 0; rows.forEach(([a, b, kk]) => { if (kk > k) return; const yy = y + 50 + i * 30, now = kk === k, p = now ? seg(u, 0.4 + i * 0.25, 1.0 + i * 0.25) : 1; i++;
      if (p <= 0) return; const dev = b === 'dev';
      el('rect', { x: x + 8, y: yy - 16, width: (w - 16) * p, height: 24, rx: 5, fill: dev ? C.WARNBG : SOFT });
      if (p >= 1) { mono(x + 18, yy + 1, a, { 'font-size': 14.5, 'font-weight': 700, fill: a.startsWith('그') ? MUT : INK }); mono(x + w - 18, yy + 1, b, { 'font-size': 14, 'text-anchor': 'end', fill: dev ? WARN : b.startsWith('(') ? OFF : GOOD, 'font-weight': 700 }); } });
    if (k === 3) tx(x + w / 2, y + 226, 'httpx 하나가 8개 패키지로 고정된다', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); }
  function pyCard(k, u) { const x = 30, y = 34, w = 250;
    el('rect', { x, y, width: w, height: 168, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2 });
    mono(x + 14, y + 22, 'pyproject.toml', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    if (k === 0) { tx(x + w / 2, y + 90, '(의존성 없음)', { 'font-size': 15, fill: OFF, 'text-anchor': 'middle' }); return; }
    const rows = [['httpx = "^0.27"', 1], ['[dev]', 4], ['pytest = "^8.0"', 4], ['ruff = "^0.5"', 4]];
    rows.forEach(([s, kk], i) => { if (kk > k) return; const yy = y + 54 + i * 24, p = kk === k ? seg(u, 0.3 + i * 0.2, 1.0 + i * 0.2) : 1;
      mono(x + 16, yy, typed(s, p), { 'font-size': 14.5, 'font-weight': s.startsWith('[') ? 800 : 600, fill: kk === 4 ? WARN : INK }); });
    if (k >= 1) sub(x + w / 2, y + 156, '범위 = 허용치', 1, { 'font-weight': 700 }); }
  function s3(t, c) { const { k, u } = c;
    pyCard(k, u); lockTable(k, u);
    const shown = CMDS.filter(([, kk]) => kk < k).length + CMDS.filter(([, kk]) => kk === k).length * E(u, 0.1, 1.0);
    terminal(30, 292, 900, 118, CMDS.map(([s]) => s.startsWith('$') ? s : [s, '#fbbf24']), shown, { fs: 14, lh: 21 });
    const mx = 445;
    if (k === 1) { fly(150, 300, 150, 90, seg(u, 0.3, 1.0), 'poetry add', { mono: true }); grow(290, 90, 600, 84, E(u, 1.2, 1.9), MUT, { dash: '5 5' }); }
    if (k === 2) { const ax = 330, aw = 230, X = (v) => ax + (v / 2) * aw;
      tx(mx, 52, '범위 안의 후보에서 고른다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
      el('line', { x1: ax, y1: 90, x2: ax + aw, y2: 90, stroke: MUT, 'stroke-width': 2 });
      ['0.27.0', '0.27.1', '0.27.2'].forEach((v, i) => { const s = pop(u, 0.3 + i * 0.2), pick = i === 2 && u > 1.2;
        el('circle', { cx: X(i), cy: 90, r: (pick ? 9 : 6) * s, fill: pick ? GOOD : OFF }); mono(X(i), 116, v, { 'font-size': 13.5, 'text-anchor': 'middle', fill: pick ? GOOD : MUT, 'font-weight': pick ? 700 : 400, opacity: s }); });
      const deps = ['httpcore', 'anyio', 'idna', 'certifi', 'sniffio', 'h11'];
      deps.forEach((d, i) => { const x2 = 345 + (i % 3) * 100, y2 = 186 + Math.floor(i / 3) * 34, g = E(u, 1.3 + i * 0.12, 1.8 + i * 0.12);
        grow(X(2), 100, lerp(X(2), x2, 0.85), lerp(100, y2 - 14, 0.85), g, GRID, { plain: true, sw: 1.6 });
        if (g > 0.9) pill(x2, y2, d, INK, 1, { mono: true, fs: 13.5 }); });
      tx(mx, 260, '하위 의존성까지 함께 푼다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k === 3) { for (let i = 0; i < 6; i++) dot([[300, 120], [mx, 120 + (i % 3) * 30], [600, 100 + i * 22]], seg(u, 0.2 + i * 0.15, 1.2 + i * 0.15), WARN, 5);
      tx(mx, 230, '정확한 버전 + 해시', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) });
      tx(mx, 254, '= 설치될 버전의 사진', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) }); }
    if (k === 4) { tx(mx, 150, '런타임과 섞이지 않게', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.8) });
      tx(mx, 174, '그룹 이름표를 달고 lock 에도 기록', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) }); }
    if (k === 5) { const who = [['동료 PC', 360], ['CI 서버', 530]];
      who.forEach(([n, cx], i) => { if (i === 0) person(cx, 100, null, { s: pop(u, 0.2) }); else server(cx, 92, null, { s: 0.7 * pop(u, 0.4), lamp: GOOD });
        tx(cx, 160, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
        dot([[600, 150], [cx + 20, 150], [cx, 190]], seg(u, 0.6 + i * 0.3, 1.6 + i * 0.3), WARN, 6);
        if (u > 1.6 + i * 0.3) pill(cx, 214, 'httpx 0.27.2', GOOD, pop(u, 1.6 + i * 0.3), { mono: true, fs: 13.5 }); });
      tx(mx, 262, '누가 설치해도 같은 버전', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.2) }); }
    if (k === 6) { zone(320, 60, 250, 170, '프로젝트 .venv', { stroke: GOOD, fill: C.GOODBG, color: GOOD, op: fade(u, 0.2) });
      ['python 3.12', 'httpx', 'pytest'].forEach((s, i) => pill(445, 108 + i * 38, s, GOOD, pop(u, 0.4 + i * 0.2), { mono: true, fs: 13.5 }));
      card(445, 262, 230, 30, { rx: 8, text: '시스템 python 은 그대로', fs: 13.5, stroke: GRID, color: MUT, op: fade(u, 1.4) });
      dot([[445, 300], [445, 236], [445, 200]], seg(u, 1.0, 1.8), ACC, 6); } }

  // ═════════ 4. 그룹 분리 · 진입점 ═════════
  function bucket(x, title, col, items, k, u, newAt) { zone(x, 196, 400, 120, title, { stroke: col, fill: col === GOOD ? C.GOODBG : C.WARNBG, color: col });
    items.forEach(([s, kk], i) => { if (kk > k) return; const now = kk === k, cx = x + 70 + i * 110, p = now ? seg(u, newAt + i * 0.3, newAt + 0.8 + i * 0.3) : 1;
      if (p <= 0) return; pill(cx, lerp(150, 262, E(p, 0, 1)), s, col, 1, { mono: true }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 4) { const rows = [['$ python src/myapp/main.py', '"__main__"', true], ['>>> import myapp.main', '"myapp.main"', false]];
      tx(480, 46, 'if __name__ == "__main__": main()', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.1) });
      rows.forEach(([cmd, nm, run], i) => { const y = 110 + i * 130, a = 0.4 + i * 0.7;
        terminal(40, y - 6, 340, 64, [cmd], fade(u, a) > 0 ? 1 : 0, { fs: 14 });
        grow(390, y + 25, 470, y + 25, E(u, a + 0.2, a + 0.6), MUT);
        card(580, y + 25, 200, 44, { rx: 8, stroke: INFO, s: pop(u, a + 0.5) }); mono(500, y + 30, '__name__ = ' + nm, { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, a + 0.6) });
        grow(690, y + 25, 760, y + 25, E(u, a + 0.7, a + 1.0), run ? GOOD : MUT);
        card(850, y + 25, 150, 44, { rx: 8, text: run ? 'main() 실행' : '실행 안 함', fs: 15, stroke: run ? GOOD : OFF, color: run ? GOOD : MUT, s: pop(u, a + 1.0) }); });
      tx(480, 400, '임포트만 했는데 프로그램이 돌아 버리는 사고를 막는다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    // 위: 콘솔 명령 → 함수 연결
    card(480, 62, 220, 40, { rx: 8, text: 'src/myapp/main.py', mono: true, fs: 15, stroke: INFO, color: INFO, s: k === 0 ? pop(u, 0.2) : 1 });
    pill(120, 62, '$ myapp', INK, 1, { mono: true, fs: 15 });
    const done = k >= 3, a = k === 3 ? E(u, 0.3, 1.2) : done ? 1 : 0;
    el('line', { x1: 168, y1: 62, x2: 368, y2: 62, stroke: done ? ACC : OFF, 'stroke-width': 2.4, 'stroke-dasharray': done ? null : '6 5' });
    if (done) el('line', { x1: 168, y1: 62, x2: lerp(168, 368, a), y2: 62, stroke: ACC, 'stroke-width': 3 });
    mono(268, 48, done ? 'myapp.main:main' : '(아직 함수 없음)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: done ? ACC : MUT, 'font-weight': 700 });
    if (k >= 2) { card(780, 62, 220, 40, { rx: 8, text: 'fetch_title(url)', mono: true, fs: 15, s: k === 2 ? pop(u, 0.2) : 1 }); }
    if (k >= 3) card(780, 122, 220, 40, { rx: 8, text: 'main()', mono: true, fs: 15, stroke: ACC, color: ACC, s: k === 3 ? pop(u, 0.2) : 1 });
    bucket(40, 'main (런타임, 배포에 포함)', GOOD, [['httpx', 1]], k, u, 0.4);
    bucket(520, 'dev (개발 전용, 배포 제외)', WARN, [['pytest', 3], ['ruff', 3]], k, u, 1.2);
    if (k === 1) tx(240, 180, 'import 하면 main 그룹', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    if (k === 2) { const g = E(u, 0.6, 1.4); el('path', { d: `M 690 82 C 560 180, 300 200, ${lerp(690, 172, g)} ${lerp(82, 252, g)}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: g });
      mono(400, 168, 'httpx.get(url)', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) }); }
    if (k === 3) { [['poetry install', 'main + dev 전부', 'dev', 1.3], ['poetry install --only main', 'main 만 (배포 이미지)', 'main', 1.7]].forEach(([a, b, w, at], i) => { const y = 352 + i * 36;
        mono(60, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, at) }); tx(390, y + 5, b, { 'font-size': 14.5, fill: w === 'main' ? GOOD : INK, opacity: fade(u, at) }); }); } }

  // ═════════ 5. 실무 함정 4종 ═════════
  const PIT = ['① lock 미커밋', '② 전역 설치', '③ 평면 레이아웃', '④ dev 미분리'];
  function s5(t, c) { const { k, u } = c; tracker(k, PIT);
    if (k === 0) { card(170, 120, 230, 70, { rx: 8, stroke: BAD, sw: 2, fill: C.BADBG, s: pop(u, 0.2) });
      mono(70, 112, '# .gitignore', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) }); mono(70, 136, 'poetry.lock', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      tx(170, 186, 'lock 없이 범위만 공유된다', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.6) });
      [['내 PC (예전에 설치)', 'anyio 4.4.0', GOOD, 480], ['CI (오늘 설치)', 'anyio 4.16.0', BAD, 760]].forEach(([n, v, col, cx], i) => { const a = 0.6 + i * 0.6;
        if (i === 0) person(cx, 120, null, { s: pop(u, a) }); else server(cx, 116, null, { s: 0.7 * pop(u, a), lamp: BAD });
        tx(cx, 186, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, a) });
        pill(cx, 222, v, col, pop(u, a + 0.4), { mono: true }); });
      tx(620, 280, '같은 ^0.27 범위인데 설치한 날에 따라 다른 버전이 깔린다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(480, 360, 'git add poetry.lock  →  팀·CI 모두 같은 버전', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, class: 'mono', opacity: fade(u, 2.2) }); return; }
    if (k === 1) { zone(40, 70, 400, 260, '시스템 python (나쁨)', { stroke: BAD, fill: C.BADBG, color: BAD, op: fade(u, 0.1) });
      pill(240, 120, 'sudo pip install httpx', BAD, pop(u, 0.3), { mono: true, fs: 13.5 });
      ['프로젝트 A', '프로젝트 B'].forEach((n, i) => { const cx = 140 + i * 200; card(cx, 270, 150, 40, { rx: 8, text: n, fs: 14.5, stroke: INK, s: pop(u, 0.6 + i * 0.2) });
        grow(cx, 250, 240, 180, E(u, 0.9 + i * 0.2, 1.4 + i * 0.2), BAD, { plain: true }); });
      card(240, 180, 170, 36, { rx: 8, text: 'httpx 한 벌을 공유', fs: 14, stroke: BAD, color: BAD, s: pop(u, 0.8) });
      zone(520, 70, 400, 260, '프로젝트별 .venv (좋음)', { stroke: GOOD, fill: C.GOODBG, color: GOOD, op: fade(u, 1.2) });
      ['A/.venv', 'B/.venv'].forEach((n, i) => { const cx = 620 + i * 200; card(cx, 190, 160, 110, { rx: 10, stroke: GOOD, s: pop(u, 1.4 + i * 0.2) });
        mono(cx, 160, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.5 + i * 0.2) });
        pill(cx, 205, 'httpx', GOOD, pop(u, 1.7 + i * 0.2), { mono: true }); });
      mono(720, 300, 'poetry add httpx', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) });
      tx(480, 380, '버전이 부딪히지 않고, 지워도 다른 프로젝트가 멀쩡하다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 2) { [['로컬에서 pytest', "sys.path[0] = '' 가 ./myapp 을 찾는다", '통과', GOOD, 0.2], ['배포 서버', '설치본에 없는 모듈은 못 찾는다', "ModuleNotFoundError", BAD, 1.0]].forEach(([n, why, res, col, a], i) => {
        const x = 40 + i * 460; zone(x, 70, 420, 230, n, { stroke: col, fill: col === GOOD ? C.GOODBG : C.BADBG, color: col, op: fade(u, a) });
        if (i === 0) person(x + 80, 170, null, { s: pop(u, a + 0.2) }); else server(x + 80, 166, null, { s: 0.7 * pop(u, a + 0.2), lamp: BAD });
        tx(x + 140, 160, why, { 'font-size': 14, opacity: fade(u, a + 0.4) });
        pill(x + 210, 240, res, col, pop(u, a + 0.7), { mono: true, fs: 14 }); });
      tx(480, 350, '로컬에서만 통과하니 가장 늦게, 배포에서야 발견된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      mono(480, 384, './main.py  →  ./src/myapp/main.py', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k === 3: 배포 이미지에 무엇이 들어가나
    [['poetry add pytest  (main 에 섞임)', [['httpx', GOOD], ['pytest', BAD], ['ruff', BAD]], BAD, 0.2], ['poetry install --only main', [['httpx', GOOD]], GOOD, 1.1]].forEach(([cmd, pk, col, a], i) => {
      const x = 40 + i * 460; mono(x + 210, 90, cmd, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, a) });
      el('rect', { x: x + 40, y: 110, width: 340, height: 160, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2.4, opacity: fade(u, a) });
      tx(x + 60, 136, '배포 이미지', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, a) });
      pk.forEach(([p, pc], j) => { const s = seg(u, a + 0.3 + j * 0.25, a + 0.9 + j * 0.25); if (s <= 0) return; pill(x + 110 + j * 110, lerp(110, 200, E(s, 0, 1)), p, pc, 1, { mono: true }); });
      if (i === 0) tx(x + 210, 250, '쓰지도 않는 도구까지 실린다', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); });
    tx(480, 330, 'dev 그룹으로 나누면 이미지가 가볍고 공격 표면도 준다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    tx(480, 362, '네 가지 습관: lock 커밋 · 프로젝트별 venv · src 레이아웃 · dev 분리', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'src 레이아웃에서 설치 없이 프로젝트 루트에서 import myapp을 하면 어떻게 되는가?',
      o: ['루트의 src/myapp을 찾아 정상으로 import 된다', 'ModuleNotFoundError가 난다', 'pytest를 쓸 때만 import 된다'], a: 1,
      why: '루트에는 src/만 있어 sys.path의 현재 폴더에서 myapp을 찾지 못한다. 설치해야만 import 되므로 배포와 같은 조건이 된다.' },
    { q: 'pyproject.toml의 httpx = "^0.27"이 허용하는 버전은 무엇인가?',
      o: ['0.27 이상 0.28 미만', '0.27 이상의 모든 버전', '정확히 0.27.0 하나'], a: 0,
      why: '^0.27은 >=0.27,<0.28이다. 0.27.2는 들어가고 0.28.0은 빠진다.' },
    { q: 'poetry.lock이 맡는 일은 무엇인가?',
      o: ['허용할 버전 범위를 사람이 적어 두는 곳', '가상환경 폴더를 대신하는 압축 파일', '하위 의존성까지 정확한 버전과 해시를 고정하는 기록'], a: 2,
      why: 'pyproject는 범위만 적고, lock은 해결된 버전 집합 전체를 적는다. httpx 하나를 더해도 8개 패키지가 lock에 들어간다.' },
    { q: '배포 이미지에 pytest·ruff를 빼고 런타임 의존성만 설치하는 명령은 무엇인가?',
      o: ['poetry install --only main', 'poetry add --group dev', 'pip install -r requirements.txt'], a: 0,
      why: 'dev 그룹으로 나눠 둔 도구는 --only main 설치에서 빠진다. 이미지가 가벼워진다.' },
    { q: 'poetry.lock을 .gitignore에 넣으면 생기는 일은 무엇인가?',
      o: ['설치가 더 빨라진다', '설치한 시점마다 다른 버전이 깔릴 수 있다', 'pyproject.toml도 함께 무시된다'], a: 1,
      why: 'lock이 없으면 범위 안에서 그날의 최신 버전이 골라진다. 같은 ^0.27에서도 anyio가 4.4.0과 4.16.0으로 갈릴 수 있다.' },
  ];

  const summary = [
    '코드를 src/ 아래에 두면 설치한 패키지로만 import 되어 로컬과 배포가 같은 조건이 된다.',
    'pyproject.toml 한 파일에 메타, 의존성 범위, 빌드 백엔드를 선언한다.',
    'poetry.lock은 하위 패키지까지 정확한 버전으로 적는다. 그래서 반드시 커밋한다.',
    '개발 도구는 dev 그룹에 넣고, 배포에서는 poetry install --only main으로 뺀다.',
  ];
  const review = [
    { q: '동료 PC에서는 통과하는 테스트가 CI에서만 anyio 버전 차이로 깨졌다. 먼저 확인할 것은?',
      o: ['poetry.lock이 저장소에 커밋돼 있는지', 'pytest를 최신으로 올렸는지', 'README에 설치 방법이 적혀 있는지'], a: 0,
      why: 'lock이 없으면 각자 설치한 날의 버전이 깔린다. lock을 커밋하면 CI도 같은 버전을 설치한다.' },
    { q: '로컬에서는 pytest가 통과하는데 배포 서버에서 ModuleNotFoundError가 난다. 가장 먼저 의심할 구조는?',
      o: ['dev 그룹을 따로 나눈 설정', '코드를 루트에 둔 평면 레이아웃', 'poetry.lock을 커밋한 것'], a: 1,
      why: '평면 레이아웃에서는 현재 폴더가 sys.path에 있어 설치하지 않은 코드가 우연히 import 된다. src 레이아웃이면 로컬에서도 같은 오류가 먼저 보인다.' },
    { q: '배포 이미지에 pytest와 ruff까지 들어가 무겁다. 어떻게 고치나?',
      o: ['pyproject.toml에서 python 범위를 좁힌다', 'poetry.lock을 지우고 다시 만든다', '두 도구를 dev 그룹으로 옮기고 --only main으로 설치한다'], a: 2,
      why: 'import 하지 않는 개발 도구는 dev 그룹에 둔다. 배포는 main 그룹만 깔면 된다.' },
  ];

  R.page({ title: '프로젝트 구조·poetry', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
