/* III-1-1 Chroma란 — 설치에서 첫 검색까지 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 터미널 · 패키지가 풀린 부품(SQLite·onnxruntime·HNSW·MiniLM) · client 와 세 백엔드 · Collection 선반 ·
 *       텍스트가 384차원 벡터가 되어 공간에 놓이는 모습 · 질의 점에서 뻗는 거리 · 응답 JSON.
 * 숫자는 chromadb 1.5.9 를 실제로 돌린 값이다(같은 문서 4건, 질의 "퍼피 교육법", 기본 임베딩 all-MiniLM-L6-v2).
 *   거리(제곱 L2): d1 0.372, d3 0.798, d2 0.843, d4 0.997 · d1 코사인 0.814 · 벡터 앞 5칸은 실제 값.
 *   점의 방향은 그림용(PCA 방향을 벌려 놓음)이고, 질의에서 점까지의 길이만 실제 거리에 비례한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, dbIcon, server, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const DOCS = [
    { id: 'd1', t: '강아지 훈련 방법', cat: 'dog', d: 0.372, a: 60, v: [-0.067, 0.091, -0.002, -0.053, -0.047] },
    { id: 'd2', t: '고양이 건강 관리', cat: 'cat', d: 0.843, a: 4, v: [-0.069, 0.081, 0.05, -0.015, -0.041] },
    { id: 'd3', t: '반려동물 영양 가이드', cat: 'general', d: 0.798, a: 32, v: [-0.053, 0.128, 0.049, -0.065, 0.001] },
    { id: 'd4', t: '수족관 물고기 키우기', cat: 'fish', d: 0.997, a: -18, v: [0.014, 0.072, 0.085, 0.003, -0.002] },
  ];
  const QV = [-0.061, 0.053, -0.021, -0.042, -0.083];
  const RANK = ['d1', 'd3', 'd2'];
  const byId = (id) => DOCS.find((d) => d.id === id);

  // ---------- 공통 부품 ----------
  // 벡터 공간 판: 질의 자리(qx,qy)에서 각 문서까지 길이 = 거리 × SC
  const SC = 260;
  function spot(o, d) { const r = d.d * SC, a = (d.a * Math.PI) / 180; return [o.qx + r * Math.cos(a), o.qy + r * Math.sin(a)]; }
  function spaceBox(o, title, op) { el('rect', { x: o.x, y: o.y, width: o.w, height: o.h, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op ?? 1 });
    for (let i = 1; i < 4; i++) el('line', { x1: o.x + (o.w * i) / 4, y1: o.y + 30, x2: o.x + (o.w * i) / 4, y2: o.y + o.h - 8, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '2 6', opacity: op ?? 1 });
    tx(o.x + 14, o.y + 22, title || '벡터 공간 (384차원을 평면에 그림)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op ?? 1 }); }
  function docPt(o, d, s, col, lab) { if (s <= 0.02) return; const [x, y] = spot(o, d);
    el('circle', { cx: x, cy: y, r: 9 * s, fill: col || ACC, stroke: PANEL, 'stroke-width': 2 });
    if (lab !== false) { const ly = d.id === 'd1' ? y + 18 : y; mono(x + 14, ly - 4, d.id, { 'font-size': 15, 'font-weight': 800, fill: col || ACC, opacity: clamp(s) });
      tx(x + 14, ly + 15, d.t, { 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); } }
  function star(x, y, r, col, s) { if (s <= 0.02) return; const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = (i % 2 ? r * 0.45 : r) * s; p.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
    el('polygon', { points: p.map((q) => q.join(',')).join(' '), fill: col || WARN, stroke: PANEL, 'stroke-width': 1.5 }); }
  // 384차원 벡터 띠: 앞 5칸 실제 값 + … + 384
  function vecStrip(x, y, v, op, o) { o = o || {}; const w = 60, h = 26;
    v.forEach((val, i) => { const a = clamp(Math.abs(val) / 0.13), s = clamp(op * 6 - i); if (s <= 0) return;
      el('rect', { x: x + i * (w + 3), y, width: w, height: h, rx: 4, fill: val < 0 ? INFOBG : ACCBG, stroke: val < 0 ? INFO : ACC, 'stroke-width': 1.2, opacity: s });
      el('rect', { x: x + i * (w + 3), y: y + h - 4, width: w * a, height: 4, rx: 2, fill: val < 0 ? INFO : ACC, opacity: s });
      mono(x + i * (w + 3) + w / 2, y + 17, val.toFixed(3), { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s }); });
    mono(x + v.length * (w + 3) + 6, y + 18, o.tail || '… ×384', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: clamp(op * 6 - v.length) }); }
  // HNSW 작은 그림: 층 3개, 위로 갈수록 점이 적다
  function hnsw(cx, cy, s, op) { const g = R.G(cx, cy, s ?? 1, op ?? 1);
    const L = [[-30, [-40, 30]], [0, [-55, -15, 20, 50]], [30, [-60, -35, -10, 15, 40, 62]]];
    L.forEach(([y, xs], li) => { el('ellipse', { cx: 0, cy: y, rx: 74, ry: 11, fill: 'none', stroke: GRID, 'stroke-width': 1.3 }, g);
      xs.forEach((x, i) => { if (i) el('line', { x1: xs[i - 1], y1: y, x2: x, y2: y, stroke: MUT, 'stroke-width': 1.3 }, g); el('circle', { cx: x, cy: y, r: 4, fill: li === 0 ? ACC : INK }, g); }); });
    el('line', { x1: -40, y1: -30, x2: -55, y2: 0, stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, g); el('line', { x1: -55, y1: 0, x2: -60, y2: 30, stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, g); return g; }
  // 칩(onnxruntime 같은 실행 부품)
  function chip(cx, cy, name, s, col) { const g = card(cx, cy, 96, 64, { rx: 8, stroke: col || INK, sw: 2.2, s }); if (!(s > 0.02)) return;
    for (let i = -2; i <= 2; i++) { el('line', { x1: i * 16, y1: -32, x2: i * 16, y2: -40, stroke: col || INK, 'stroke-width': 2 }, g); el('line', { x1: i * 16, y1: 32, x2: i * 16, y2: 40, stroke: col || INK, 'stroke-width': 2 }, g); }
    tx(0, 6, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' }, g); return g; }
  // 응답 JSON 상자: rows = [[text, color, on]], on 은 0→1 보이기
  function json(x, y, w, rows, o) { o = o || {}; const lh = o.lh || 24, h = rows.length * lh + 26;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    if (o.title) tx(x + 14, y - 10, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    rows.forEach(([s, col, on], i) => { const op = on ?? 1; if (op <= 0.02) return; mono(x + 16, y + 30 + i * lh, s, { 'font-size': o.fs || 14.5, fill: col || INK, opacity: op, 'font-weight': col && col !== MUT ? 700 : 400 }); }); }
  // 파이썬 프로세스 상자
  function proc(x, y, w, h, name, op) { el('rect', { x, y, width: w, height: h, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 6', opacity: op ?? 1 });
    tx(x + 16, y + 24, name, { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: op ?? 1 }); }

  // ---------- 1. 설치 ----------
  const T1 = [
    ['>>> import chromadb', null], ['ModuleNotFoundError: No module named \'chromadb\'', 'var(--bad)'],
    ['$ pip install chromadb', null], ['Successfully installed chromadb-1.5.9 …', 'var(--good)'],
    ['$ python -c "import chromadb; print(chromadb.__version__)"', null], ['1.5.9', 'var(--good)'],
  ];
  function s1(t, c) { const { k, u } = c;
    const shown = k === 0 ? 2 * E(u, 0.2, 1.4) : k === 1 ? 2 + 2 * E(u, 0.2, 1.6) : k === 2 ? 4 + 2 * E(u, 0.2, 1.4) : 6;
    terminal(40, 18, 740, 168, T1, Math.max(0.01, shown), { title: 'terminal', fs: 14.5 });
    if (k === 0) { card(480, 300, 300, 90, { rx: 12, stroke: GRID, dash: '7 6', text: 'site-packages\nchromadb 없음', fs: 15, color: MUT, s: pop(u, 1.4) }); cross(640, 270, 12, pop(u, 1.8)); return; }
    // 패키지 상자 → 부품 4개로 풀림
    const split = k >= 3 ? (k === 3 ? E(u, 0.3, 1.3) : 1) : 0;
    if (k === 1 || k === 2) { const drop = k === 1 ? E(u, 1.0, 2.0) : 1;
      card(480, lerp(200, 300, drop), 230, 80, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'chromadb', fs: 18, mono: true, color: ACC, s: k === 1 ? pop(u, 0.9) : 1 });
      if (k === 2) { mono(480, 372, 'chromadb.__version__ = 1.5.9', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.5) }); check(300, 300, 14, pop(u, 1.7)); }
      return; }
    const P4 = [[150, 'SQLite'], [370, 'onnxruntime'], [590, 'HNSW'], [810, 'MiniLM-L6']], at = (i) => (k === 3 ? 0.9 + i * 0.35 : 0);
    const by = 300;
    P4.forEach(([x, name], i) => { const s = k === 3 ? pop(u, at(i)) : 1, cx = lerp(480, x, split);
      if (i === 0) dbIcon(cx, by - 8, null, { s });
      if (i === 1) chip(cx, by - 8, 'ONNX', s, INFO);
      if (i === 2) hnsw(cx, by - 8, s, 1);
      if (i === 3) { card(cx, by - 8, 150, 60, { rx: 8, stroke: ACC, dash: '6 5', s, fill: ACCBG }); if (s > 0.5) { for (let j = 0; j < 8; j++) el('rect', { x: cx - 62 + j * 16, y: by - 22, width: 12, height: 28, rx: 2, fill: ACC, opacity: 0.25 + 0.09 * j }); } }
      lbl(cx, by + 56, name, k === 3 ? fade(u, at(i) + 0.3) : 1, { class: 'mono' }); });
    sub(150, by + 78, '문서·메타데이터', k === 3 ? fade(u, 1.4) : 1); sub(370, by + 78, '모델 추론 런타임', k === 3 ? fade(u, 1.7) : 1);
    sub(590, by + 78, '근사 최근접 인덱스', k === 3 ? fade(u, 2.0) : 1); sub(810, by + 78, '384차원 · 첫 사용 때 79MB', k === 3 ? fade(u, 2.3) : 1, { fill: ACC, 'font-weight': 700 });
    if (k === 4) { // 한 프로세스 안에 다 들어 있다
      const g = E(u, 0.2, 1.0); el('rect', { x: 50, y: 212, width: 860 * g, height: 196, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': '8 6' });
      tx(66, 234, 'python 프로세스 하나 = 임베디드 모드', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.9) });
      server(870, 90, null, { s: 0.6 * pop(u, 1.4), op: 0.6 }); cross(870, 90, 30, pop(u, 1.8));
      tx(870, 160, '서버 없음', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); } }

  // ---------- 2. Client ----------
  const BK = [['Client()', 'RAM', 'in-memory'], ['PersistentClient(path)', '디스크', './chroma_db'], ['HttpClient(host, port)', '서버', 'localhost:8000']];
  function s2(t, c) { const { k, u } = c;
    proc(30, 30, 420, 360, 'python 프로세스 (RAM)');
    card(130, 100, 150, 44, { rx: 8, stroke: INFO, fill: INFOBG, text: 'chromadb', fs: 15, mono: true, color: INFO, s: k === 0 ? pop(u, 0.3) : 1 });
    sub(130, 140, 'import 된 모듈', k === 0 ? fade(u, 0.6) : 1);
    const up = k >= 1;
    if (!up) { card(300, 230, 170, 70, { rx: 12, stroke: GRID, dash: '6 5', text: 'client = ?', fs: 16, mono: true, color: MUT, s: pop(u, 1.0) }); sub(300, 290, '아직 객체가 없다', fade(u, 1.4)); return; }
    const cs = k === 1 ? pop(u, 0.5) : 1;
    grow(170, 124, 262, 196, k === 1 ? E(u, 0.2, 0.6) : 1, INK);
    card(300, 230, 170, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.6, text: 'client', fs: 18, mono: true, color: ACC, s: cs });
    if (k === 1) { mono(300, 300, 'chromadb.Client()', { 'font-size': 15, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.0) }); sub(300, 330, '프로세스가 끝나면 함께 사라진다', fade(u, 1.6), { fill: BAD }); return; }
    // 오른쪽: 세 백엔드
    if (k === 2) { const cur = Math.min(2, Math.floor(u / 0.85));
      BK.forEach(([fn, where, arg], i) => { const y = 92 + i * 116, s = pop(u, 0.1 + i * 0.85), on = i === cur;
        if (i === 0) { card(600, y, 150, 58, { rx: 8, stroke: on ? ACC : GRID, s, fill: on ? ACCBG : PANEL }); if (s > 0.5) for (let j = 0; j < 6; j++) el('rect', { x: 542 + j * 20, y: y - 14, width: 14, height: 28, rx: 2, fill: on ? ACC : OFF, opacity: 0.6 }); }
        if (i === 1) dbIcon(600, y + 4, null, { s: s * 0.75, stroke: on ? ACC : INK });
        if (i === 2) server(600, y + 2, null, { s: s * 0.62, stroke: on ? ACC : INK, lamp: on ? ACC : OFF });
        mono(690, y - 4, fn, { 'font-size': 14.5, 'font-weight': 700, fill: on ? ACC : INK, opacity: fade(u, 0.2 + i * 0.85) });
        tx(690, y + 18, where + ' · ' + arg, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.85) }); });
      const ty = 92 + cur * 116; el('path', { d: `M385,230 C450,230 470,${ty} 515,${ty}`, fill: 'none', stroke: ACC, 'stroke-width': 2.6, 'stroke-dasharray': '7 5' });
      sub(300, 300, '바뀌는 것은 만드는 한 줄', fade(u, 0.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { // heartbeat: 심전도 선이 자란다
      const x0 = 520, y0 = 200, w = 380, g = E(u, 0.2, 1.6), pts = [];
      for (let i = 0; i <= 60 * g; i++) { const x = x0 + (w * i) / 60, ph = i % 20; pts.push([x, y0 - (ph === 8 ? 52 : ph === 9 ? -26 : ph === 10 ? 14 : 0)]); }
      if (pts.length > 1) el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-linejoin': 'round' });
      grow(385, 230, 510, 210, E(u, 0.1, 0.4), GOOD, { plain: true });
      mono(520, 290, 'client.heartbeat()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(520, 322, '→ 1795485268977879400', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      sub(710, 352, '나노초 단위 시각 · 실행할 때마다 다르다', fade(u, 2.0)); return; }
    // k4: list_collections() → [] , 빈 선반
    const sh = E(u, 0.2, 1.0);
    for (let i = 0; i < 3; i++) el('line', { x1: 560, y1: 130 + i * 80, x2: 560 + 320 * sh, y2: 130 + i * 80, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
    el('line', { x1: 560, y1: 60, x2: 560, y2: 290, stroke: INK, 'stroke-width': 4, opacity: sh }); el('line', { x1: 880, y1: 60, x2: 880, y2: 290, stroke: INK, 'stroke-width': 4, opacity: sh });
    mono(720, 340, 'client.list_collections()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    mono(720, 372, '→ []', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) });
    sub(720, 100, 'Collection 0개', fade(u, 1.9), { 'font-weight': 700 }); }

  // ---------- 3. Collection ----------
  function shelf(cx, cy, s, cnt, o) { o = o || {}; if (s <= 0.02) return; const g = R.G(cx, cy, s);
    el('rect', { x: -170, y: -110, width: 340, height: 220, rx: 14, fill: PANEL, stroke: ACC, 'stroke-width': 2.6 }, g);
    tx(-152, -82, 'Collection "docs"', { 'font-size': 16, 'font-weight': 800, fill: ACC, class: 'mono' }, g);
    [['임베딩 함수', 'all-MiniLM-L6-v2'], ['HNSW 인덱스', 'space=l2 · M=16'], ['SQLite 행', `${cnt} 건`]].forEach(([a, b], i) => { const y = -46 + i * 52;
      el('rect', { x: -152, y: y - 20, width: 304, height: 42, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.3 }, g);
      tx(-140, y + 6, a, { 'font-size': 14.5, 'font-weight': 700 }, g); mono(140, y + 6, b, { 'font-size': 14, fill: i === 2 && o.hotCount ? ACC : MUT, 'text-anchor': 'end', 'font-weight': 700 }, g); });
    return g; }
  function s3(t, c) { const { k, u } = c;
    card(110, 70, 140, 52, { rx: 10, stroke: ACC, fill: ACCBG, text: 'client', fs: 17, mono: true, color: ACC });
    if (k === 0) { card(560, 210, 340, 220, { rx: 14, stroke: GRID, dash: '8 6', text: 'Collection 없음', fs: 16, color: MUT, s: pop(u, 0.5) });
      mono(110, 128, 'client = chromadb.Client()', { 'font-size': 14.5, opacity: fade(u, 1.0) }); sub(560, 360, '선반은 client를 거쳐서만 만든다', fade(u, 1.6)); return; }
    if (k === 1) { grow(180, 80, 380, 150, E(u, 0.1, 0.6), ACC); mono(40, 200, 'get_or_create_collection("docs")', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.3) });
      shelf(560, 220, pop(u, 0.6), 0); sub(560, 370, '없어서 새로 만들었다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { // 세 메서드 × 두 상황 표
      const X0 = 270, cw = 230, rows = [['create_collection', ['만든다', 1], ['에러', 0]], ['get_collection', ['에러', 0], ['가져온다', 1]], ['get_or_create_collection', ['만든다', 1], ['가져온다', 1]]];
      tx(X0 + cw / 2, 86, '"docs" 가 없을 때', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.1) });
      tx(X0 + cw * 1.5, 86, '이미 있을 때', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.1) });
      rows.forEach(([fn, a, b], i) => { const y = 130 + i * 70, at = 0.3 + i * 0.55, hi = i === 2;
        mono(X0 - 14, y + 5, fn, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: hi ? ACC : INK, opacity: fade(u, at) });
        [a, b].forEach(([w, ok], j) => { const s = pop(u, at + 0.15 + j * 0.15), cx = X0 + cw * j + cw / 2;
          card(cx, y, cw - 14, 52, { rx: 8, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, sw: hi ? 2.6 : 1.6, s, text: w, fs: 15, color: ok ? GOOD : BAD }); }); });
      mono(X0 + cw, 362, 'InternalError: Collection [docs] already exists', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
      mono(X0 + cw, 386, 'NotFoundError: Collection [nope] does not exist', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.3) }); return; }
    shelf(560, 220, 1, 0, { hotCount: k === 3 });
    if (k === 3) { mono(110, 170, 'collection.name', { 'font-size': 14.5, opacity: fade(u, 0.3) }); mono(110, 196, '→ "docs"', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) });
      mono(110, 250, 'collection.count()', { 'font-size': 14.5, opacity: fade(u, 1.1) }); mono(110, 290, '0', { 'font-size': 34, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      sub(560, 370, '선반은 있지만 비어 있다', fade(u, 1.9), { 'font-weight': 700, fill: INK }); return; }
    // k4: 기본 임베딩 함수가 텍스트를 384칸으로
    el('rect', { x: 404, y: 150, width: 312, height: 48, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 3.5, opacity: fade(u, 0.2) });
    card(560, 380, 520, 44, { rx: 10, stroke: WARN, fill: WARNBG, text: '영어 데이터로 학습 · 한국어가 많으면 다국어 모델을 넣는다', fs: 14.5, color: INK, s: pop(u, 1.6) });
    mono(20, 222, '"강아지 훈련 방법"', { 'font-size': 14.5, opacity: fade(u, 0.5) });
    grow(170, 240, 170, 286, E(u, 0.7, 1.0), ACC);
    vecStrip(20, 296, DOCS[0].v.slice(0, 3), E(u, 1.0, 1.6), { tail: '… 384' }); }

  // ---------- 4. add ----------
  const SP4 = { x: 500, y: 26, w: 440, h: 370, qx: 540, qy: 150 };
  function argTable(k, u, o) { const X = [40, 240, 320], hdr = ['documents', 'ids', 'metadatas'], y0 = 60;
    hdr.forEach((h, i) => { mono(X[i], y0, h, { 'font-size': 15, 'font-weight': 800, fill: i === 0 ? ACC : i === 1 ? INFO : WARN, opacity: o.hdr }); });
    el('line', { x1: 30, y1: y0 + 12, x2: 470, y2: y0 + 12, stroke: GRID, 'stroke-width': 2, opacity: o.hdr });
    DOCS.forEach((d, i) => { const y = y0 + 48 + i * 52, s = o.doc(i), m = o.meta(i);
      if (s > 0.02) card(X[0] + 88, y - 5, 180, 36, { rx: 6, stroke: ACC, sw: 1.6, text: d.t, fs: 14, color: INK, s });
      if (m > 0.02) { mono(X[1], y, `"${d.id}"`, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: m }); pill(X[2] + 70, y - 5, d.cat, WARN, m, { fs: 13.5, mono: true }); } }); }
  function s4(t, c) { const { k, u } = c;
    const hdr = k === 0 ? fade(u, 0.2) : 1;
    argTable(k, u, { hdr, doc: (i) => (k === 0 ? 0 : k === 1 ? pop(u, 0.3 + i * 0.4) : 1), meta: (i) => (k <= 1 ? 0 : k === 2 ? fade(u, 0.3 + i * 0.35) : 1) });
    if (k === 0) { sub(250, 120, '원본 텍스트', fade(u, 0.6), { fill: ACC }); sub(250, 150, '고유한 문자열 id', fade(u, 1.0), { fill: INFO }); sub(250, 180, '필터에 쓸 부가 정보 (선택)', fade(u, 1.4), { fill: WARN });
      spaceBox(SP4, null, fade(u, 1.8)); sub(SP4.x + SP4.w / 2, 220, '아직 아무 점도 없다', fade(u, 2.0)); return; }
    spaceBox(SP4);
    if (k === 1) { sub(250, 330, '벡터가 아니라 문장 그대로 넣는다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { sub(250, 330, 'id는 문서마다 하나, 겹치면 안 된다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    // k3: 문장마다 벡터 → 공간의 점
    DOCS.forEach((d, i) => { const at = 0.2 + i * 0.5, f = k === 3 ? E(u, at, at + 0.5) : 1, [px, py] = spot(SP4, d);
      if (k === 3 && f > 0 && f < 1) { const y = 108 + i * 52 - 5; dot([[220, y], [px, py]], f, ACC, 6); }
      docPt(SP4, d, k === 3 ? pop(u, at + 0.45) : 1); });
    if (k === 3) { vecStrip(30, 340, DOCS[Math.min(3, Math.floor(clamp((u - 0.2) / 0.5, 0, 3.99)))].v, E(u, 0.2, 0.8));
      mono(30, 390, 'embedding_function(documents) → 384차원 × 4', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) }); return; }
    // k4: HNSW 이웃 선 + count
    const g = E(u, 0.2, 1.2); [['d1', 'd3'], ['d3', 'd2'], ['d2', 'd4'], ['d1', 'd2']].forEach(([a, b], i) => { const p = spot(SP4, byId(a)), q = spot(SP4, byId(b)), f = clamp(g * 4 - i);
      if (f > 0) el('line', { x1: p[0], y1: p[1], x2: lerp(p[0], q[0], f), y2: lerp(p[1], q[1], f), stroke: MUT, 'stroke-width': 1.6, 'stroke-dasharray': '4 4' }); });
    mono(30, 350, 'collection.count()', { 'font-size': 15, opacity: fade(u, 0.8) });
    mono(220, 352, '→ 4', { 'font-size': 26, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
    sub(SP4.x + SP4.w / 2, SP4.y + SP4.h - 16, '점선 = HNSW 이웃 연결', fade(u, 1.6)); }

  // ---------- 5. query ----------
  const SP5 = { x: 20, y: 26, w: 470, h: 370, qx: 70, qy: 150 };
  function s5(t, c) { const { k, u } = c, res = c.beat.results || [];
    if (k === 4) return s5cos(c);
    spaceBox(SP5);
    DOCS.forEach((d) => { const rk = RANK.indexOf(d.id), out = rk < 0 && k >= 1; docPt(SP5, d, 1, out ? OFF : rk === 0 && k >= 3 ? GOOD : ACC); });
    // 질의 점이 날아와 앉는다
    const qf = k === 0 ? E(u, 0.6, 1.4) : 1;
    if (k === 0) { card(250, 380, 210, 34, { rx: 17, stroke: WARN, fill: WARNBG, text: '"퍼피 교육법"', fs: 14.5, s: pop(u, 0.2) }); }
    star(lerp(250, SP5.qx, qf), lerp(380, SP5.qy, qf), 14, WARN, k === 0 ? pop(u, 0.5) : 1);
    if (qf > 0.95) { mono(SP5.qx - 4, SP5.qy - 22, 'q', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' }); }
    if (k === 0) { mono(520, 120, 'query_texts=["퍼피 교육법"]', { 'font-size': 15, opacity: fade(u, 0.3) }); mono(520, 150, 'n_results=3', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      sub(700, 210, '검색어도 같은 함수로 384차원이 된다', fade(u, 1.6), { 'font-weight': 700, fill: INK });
      vecStrip(520, 240, QV, E(u, 1.8, 2.5), { tail: '…' }); return; }
    // 거리 선
    RANK.forEach((id, i) => { const d = byId(id), [x, y] = spot(SP5, d), f = k === 1 ? E(u, 0.2 + i * 0.4, 0.7 + i * 0.4) : 1;
      if (f > 0) el('line', { x1: SP5.qx, y1: SP5.qy, x2: lerp(SP5.qx, x, f), y2: lerp(SP5.qy, y, f), stroke: i === 0 ? GOOD : ACC, 'stroke-width': i === 0 ? 3 : 2, opacity: 0.85 });
      if (f >= 1) { const mx = (SP5.qx + x) / 2, my = (SP5.qy + y) / 2; card(mx, my, 54, 26, { rx: 6, fill: PANEL, stroke: i === 0 ? GOOD : GRID, sw: 1.4, text: d.d.toFixed(2), fs: 13.5, mono: true, color: i === 0 ? GOOD : INK }); } });
    if (k === 1) { const p = spot(SP5, DOCS[3]); cross(p[0], p[1], 10, pop(u, 1.8)); }
    // 응답 JSON
    const ids = '"ids":       [["d1", "d3", "d2"]]', docs = ['"documents": [["강아지 훈련 방법",', '               "반려동물 영양 가이드",', '               "고양이 건강 관리"]]'];
    const dist = '"distances": [[0.37, 0.80, 0.84]]', meta = '"metadatas": [[{"category": "dog"}, …]]';
    const on = (kk, at) => (k > kk ? 1 : k === kk ? fade(u, at) : 0);
    json(510, 60, 430, [['{', MUT], [ids, INFO, on(1, 1.6)], [docs[0], ACC, on(2, 0.3)], [docs[1], ACC, on(2, 0.6)], [docs[2], ACC, on(2, 0.9)], [dist, GOOD, on(3, 0.3)], [meta, WARN, on(3, 0.9)], ['}', MUT]], { title: 'collection.query(...) 응답', fs: 14 });
    if (k === 2) sub(725, 300, 'FAISS는 id만 준다 · Chroma는 원문까지', fade(u, 1.4), { 'font-weight': 700, fill: INK });
    if (k === 3) { RANK.forEach((id, i) => { const d = byId(id); R.hbar(600, 290 + i * 34, 220, d.d, 1, { col: i === 0 ? GOOD : ACC, text: d.id + ' ' + d.d.toFixed(2), u: E(u, 1.2, 2.0), h: 18 }); });
      sub(560, 300, '거리', fade(u, 1.2), { 'font-weight': 700 }); } }
  // k4: 거리 0.37 = 2 − 2·cos
  function s5cos(c) { const { u } = c, ox = 230, oy = 300, r = 200, th = Math.acos(0.814), g = E(u, 0.2, 1.0);
    el('path', { d: `M${ox + r},${oy} A${r},${r} 0 0 0 ${ox + r * Math.cos(-1.2)},${oy + r * Math.sin(-1.2)}`, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
    const qa = -0.25, da = qa - th, qx = ox + r * Math.cos(qa), qy = oy + r * Math.sin(qa), dx = ox + r * Math.cos(da), dy = oy + r * Math.sin(da);
    el('line', { x1: ox, y1: oy, x2: lerp(ox, qx, g), y2: lerp(oy, qy, g), stroke: WARN, 'stroke-width': 3.2 });
    el('line', { x1: ox, y1: oy, x2: lerp(ox, dx, g), y2: lerp(oy, dy, g), stroke: GOOD, 'stroke-width': 3.2 });
    el('circle', { cx: ox, cy: oy, r: 5, fill: INK }); mono(ox - 10, oy + 22, '0', { 'font-size': 14, fill: MUT });
    if (g > 0.95) { star(qx, qy, 12, WARN, 1); el('circle', { cx: dx, cy: dy, r: 9, fill: GOOD });
      mono(qx + 16, qy + 6, 'q', { 'font-size': 16, 'font-weight': 800, fill: WARN }); mono(dx + 14, dy - 4, 'd1', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); }
    const a1 = fade(u, 1.0); el('path', { d: `M${ox + 60 * Math.cos(qa)},${oy + 60 * Math.sin(qa)} A60,60 0 0 0 ${ox + 60 * Math.cos(da)},${oy + 60 * Math.sin(da)}`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: a1 });
    mono(ox + 72 * Math.cos(qa - th / 2) + 4, oy + 72 * Math.sin(qa - th / 2) + 4, 'cos = 0.814', { 'font-size': 14.5, 'font-weight': 700, opacity: a1 });
    const ch = E(u, 1.3, 1.9); el('line', { x1: qx, y1: qy, x2: lerp(qx, dx, ch), y2: lerp(qy, dy, ch), stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
    tx(130, 60, '길이 1인 두 벡터', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
    const rx = 560; tx(rx, 110, '기본 space = l2', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.5) });
    tx(rx, 146, '빨간 선 길이를 제곱한 값이 distance', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
    mono(rx, 200, '‖q − d1‖² = 2 − 2·cos', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.8) });
    mono(rx, 240, '        = 2 − 2 × 0.814', { 'font-size': 18, opacity: fade(u, 2.1) });
    mono(rx, 280, '        = 0.372', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.4) });
    sub(rx + 160, 330, '코사인이 클수록 거리는 작다', fade(u, 2.5), { 'font-weight': 700, fill: INK }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'pip install chromadb 직후, 기본 임베딩 모델 all-MiniLM-L6-v2는 어디에 있는가?',
      o: ['패키지 안에 이미 들어 있다', '처음 임베딩할 때 79MB 파일을 내려받는다', '별도 서버를 띄워야 쓸 수 있다'], a: 1,
      why: 'pip로는 SQLite·onnxruntime·HNSW 같은 실행 부품만 깔린다. 모델 파일(79MB)은 처음 문서를 임베딩할 때 캐시 폴더로 받는다.' },
    { q: 'chromadb.Client()를 PersistentClient(path)로 바꾸면 그다음 코드는 어떻게 되는가?',
      o: ['add·query를 모두 다시 써야 한다', '그대로 둔다. 데이터가 디스크에 남는 것만 달라진다', 'heartbeat를 먼저 불러야 한다'], a: 1,
      why: '세 클라이언트는 같은 API를 쓴다. 바뀌는 것은 데이터가 머무는 곳(RAM, 디스크, 서버)뿐이다.' },
    { q: '스크립트를 여러 번 다시 돌려도 에러가 나지 않게 Collection을 얻는 메서드는 무엇인가?',
      o: ['create_collection', 'get_collection', 'get_or_create_collection'], a: 2,
      why: 'create는 이미 있으면 "already exists", get은 없으면 "does not exist" 에러를 낸다. get_or_create는 두 경우 모두 통과한다.' },
    { q: 'collection.add(documents=[...], ids=[...])를 부르면 벡터는 누가 만드는가?',
      o: ['Collection의 임베딩 함수가 자동으로 만든다', '사용자가 embeddings 인자로 꼭 넘겨야 한다', 'query를 부를 때 처음 만든다'], a: 0,
      why: 'add 안에서 임베딩 함수가 문장 4개를 384차원 벡터 4개로 바꾸고, HNSW와 SQLite에 나눠 저장한다.' },
    { q: '"퍼피 교육법" 질의 결과 distances가 [[0.37, 0.80, 0.84]] 였다. 이 숫자에 대한 설명으로 맞는 것은 무엇인가?',
      o: ['클수록 비슷하다는 유사도 점수다', '작을수록 가깝다는 제곱 L2 거리다', '0~1 사이로 잘린 확률이다'], a: 1,
      why: '기본 공간 l2에서 distances는 제곱 거리다. 길이 1 벡터라 2 − 2×코사인과 같아서, 코사인 0.814인 d1이 0.37로 가장 가깝다.' },
  ];

  const summary = [
    'pip install chromadb 한 줄이면 SQLite, onnxruntime, HNSW가 깔리고 기본 모델은 첫 임베딩 때 받는다.',
    'Client, PersistentClient, HttpClient는 데이터가 머무는 곳만 다르고 쓰는 API는 같다.',
    'get_or_create_collection은 있으면 가져오고 없으면 만들어서 여러 번 돌려도 안전하다.',
    'add에 문장만 넣으면 384차원 벡터가 되고, query는 원문과 거리, 메타데이터를 함께 돌려준다.',
  ];
  const review = [
    { q: '한국어 문서 수천 건을 기본 설정 Chroma에 넣었더니 검색 순위가 어색했다. 먼저 손볼 것은 무엇인가?',
      o: ['n_results를 크게 늘린다', 'embedding_function에 다국어 임베딩 모델을 넣는다', 'Client를 PersistentClient로 바꾼다'], a: 1,
      why: '기본 모델 all-MiniLM-L6-v2는 영어 데이터로 학습했다. 순위는 벡터가 정하므로 모델을 바꿔야 하고, 저장 방식은 순위와 무관하다.' },
    { q: '노트북에서 add 한 문서가 커널을 다시 켜자 count() 0이 되었다. 원인으로 가장 그럴듯한 것은 무엇인가?',
      o: ['chromadb.Client()로 만든 인메모리 클라이언트였다', 'get_or_create_collection이 기존 선반을 지웠다', 'HNSW 인덱스가 아직 다 안 만들어졌다'], a: 0,
      why: 'Client()는 프로세스 RAM 에만 데이터를 둔다. 커널이 끝나면 함께 사라지므로 남기려면 PersistentClient(path)를 쓴다.' },
    { q: 'query 응답에서 d1 0.37, d3 0.80이 나왔다. 같은 질의를 코사인 유사도로 다시 적으면 d1은 어느 쪽인가?',
      o: ['0.37보다 작은 값', '알 수 없다', '0.814로 d3보다 크다'], a: 2,
      why: '길이 1 벡터에서 제곱 L2 거리는 2 − 2×코사인이다. 거리가 가장 작은 d1이 코사인은 가장 크고, 실제 값은 0.814다.' },
  ];

  R.page({ title: 'Chroma 첫 검색 — 텍스트가 점이 되기까지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
