/* I-1-1 Kubernetes란 무엇인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // 컨테이너 상자: 골이 진 화물 상자 + 이름 (cyan=원래, green=다시 만든 것, amber=HPA 증설분)
  const TINT = { cyan: [ACC, ACCBG], green: [GOOD, GOODBG], amber: [WARN, WARNBG], gray: [OFF, PANEL], bad: [BAD, BADBG] };
  function ctr(cx, cy, id, col, o) { o = o || {}; const [st, bg] = TINT[col] || TINT.cyan, w = o.w || 66, h = o.h || 36, g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 4, fill: o.ghost ? PANEL : bg, stroke: st, 'stroke-width': 2, 'stroke-dasharray': o.ghost ? '5 4' : null }, g);
    [-0.3, 0.3].forEach((f) => el('line', { x1: f * w, y1: -h / 2 + 4, x2: f * w, y2: -h / 2 + 9, stroke: st, 'stroke-width': 1.5, opacity: 0.6 }, g));
    if (id) tx(0, 5, id, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: o.ghost ? MUT : INK }, g);
    return g; }
  // 노드(서버 한 대): 이름표 + 칸 자리 + 아래 CPU 막대
  function node(x, y, w, h, name, o) { o = o || {}; const down = o.down;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: down ? SOFT : PANEL, stroke: down ? BAD : o.hot ? BAD : GRID, 'stroke-width': down || o.hot ? 2.5 : 2, 'stroke-dasharray': down ? '7 5' : null });
    tx(x + 14, y + 24, name, { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: down ? BAD : INK });
    if (down) mono(x + w - 14, y + 24, 'NotReady', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' });
    if (o.cpu != null) { const bw = w - 28, by = y + h - 22, v = clamp(o.cpu / 100);
      el('rect', { x: x + 14, y: by, width: bw, height: 8, rx: 4, fill: SOFT });
      el('rect', { x: x + 14, y: by, width: Math.max(2, bw * v), height: 8, rx: 4, fill: o.cpu >= 85 ? BAD : ACC });
      tx(x + 14, by - 7, o.cpuLabel || 'CPU 사용', { 'font-size': 13.5, fill: MUT }); mono(x + w - 14, by - 7, Math.round(o.cpu) + '%', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: o.cpu >= 85 ? BAD : INK }); } }
  // 노드 안 칸 좌표 (cols 열)
  function slot(x, y, w, i, cols) { const cw = (w - 20) / cols; return [x + 10 + cw * (i % cols) + cw / 2, y + 62 + Math.floor(i / cols) * 46]; }
  const NX = [30, 345, 660], NW = 270;

  // 1. 컨테이너 1개
  function s1(t, c) { const { k, u } = c;
    // 노트북
    el('rect', { x: 70, y: 110, width: 300, height: 180, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    el('path', { d: 'M40,300 H400 L384,318 H56 Z', fill: SOFT, stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
    lbl(220, 346, '내 노트북');
    const drop = k === 0 ? E(u, 0.3, 1.2) : 1;
    if (k < 3) ctr(220, lerp(40, 200, drop), 'app-1', 'cyan', { w: 90, h: 46, op: k === 0 ? fade(u, 0.2) : 1 });
    const L = ['$ docker run -d --name app-1 myapp:v1', ['a1b2c3d4e5f6…', 'var(--term)'], '$ docker ps', ['CONTAINER ID   IMAGE     STATUS  NAMES', 'var(--term)'], ['a1b2c3d4e5f6   myapp:v1  Up 2s   app-1', 'var(--term)']];
    const shown = k === 0 ? lerp(0, 2, E(u, 0.2, 1.6)) : k === 1 ? lerp(2, 5, E(u, 0.2, 1.8)) : 5;
    terminal(450, 40, 480, 170, L, shown, { title: 'bash · 예시 출력' });
    if (k === 1) { el('rect', { x: 700, y: 176, width: 70, height: 24, rx: 4, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.8) }); }
    if (k >= 2) [['어디서 도나?', '내 노트북'], ['죽으면?', 'docker start app-1'], ['새 버전은?', 'stop && run']].forEach(([q, a], i) => {
      const y = 250 + i * 50, s = k === 2 ? pop(u, 0.2 + i * 0.4) : 1;
      card(560, y, 210, 38, { rx: 19, text: q, fs: 14.5, stroke: GRID, s, op: k === 3 ? 0.35 : 1 });
      mono(680, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: (k === 2 ? fade(u, 0.5 + i * 0.4) : 1) * (k === 3 ? 0.35 : 1) }); });
    if (k === 3) { for (let i = 0; i < 8; i++) { const a = E(u, 0.2 + i * 0.12, 0.7 + i * 0.12), cx = 130 + (i % 4) * 60, cy = 165 + Math.floor(i / 4) * 52;
        ctr(lerp(220, cx, a), lerp(200, cy, a), 'app-' + (i + 1), i === 0 ? 'cyan' : 'bad', { w: 54, h: 34, s: i === 0 ? 1 : a }); }
      banner(560, 390, '박스 8개부터는 사람 손이 모자란다', pop(u, 1.6)); } }

  // 2. 손으로 8개
  function s2(t, c) { const { k, u, beat } = c, n1 = beat.nodes[0].boxes;
    if (k === 3) { // 8 → 80 → 800
      [[8, 8, 26, 170], [80, 16, 11, 420], [800, 40, 5.5, 700]].forEach(([n, cols, sz, x0], j) => { const a = E(u, 0.2 + j * 0.5, 1.0 + j * 0.5), m = Math.round(n * a);
        for (let i = 0; i < m; i++) el('rect', { x: x0 - (cols * sz) / 2 + (i % cols) * sz, y: 120 + Math.floor(i / cols) * sz, width: sz - (sz > 6 ? 3 : 1), height: sz - (sz > 6 ? 3 : 1), rx: sz > 6 ? 2 : 0.5, fill: j === 0 ? ACC : j === 1 ? WARN : BAD });
        mono(x0, 100, n + '개', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2 + j * 0.5) }); });
      [[282], [520]].forEach(([x], j) => grow(x, 175, x + 46, 175, E(u, 0.8 + j * 0.5, 1.2 + j * 0.5), MUT));
      banner(480, 360, '필요한 것 = 자동 분류 · 재배치 · 스케일', pop(u, 1.9)); return; }
    person(70, 80, '운영자');
    const nOn = k === 0 ? Math.round(lerp(0, 4, E(u, 0.2, 2.2))) : 8, cnt = Math.min(n1.length, nOn);
    NX.forEach((x, i) => node(x, 170, NW, 230, 'node-' + (i + 1), { cpu: i === 0 ? tween(c.prev && c.prev.nodes[0].boxes.length * 12, cnt * 12, u) : 5, hot: i === 0 && cnt >= 8 }));
    n1.slice(0, cnt).forEach((b, i) => { const [sx, sy] = slot(NX[0], 170, NW, i, 4), from = k === 0 ? 0.2 + i * 0.5 : 0.2 + (i - 4) * 0.5, a = (k === 0 || (k === 1 && i >= 4)) ? E(u, from, from + 0.5) : 1;
      if (a <= 0) return; const bad = k === 2 && b.id === 'app-3';
      ctr(lerp(95, sx, a), lerp(80, sy, a), b.id, bad ? 'bad' : 'cyan', { w: 56, h: 34 });
      if (bad) { cross(sx + 22, sy - 16, 7, pop(u, 0.4)); } });
    if (k <= 1) mono(130, 60, 'docker run -d --name app-' + Math.max(1, cnt) + ' myapp:v1', { 'font-size': 14, fill: MUT });
    if (k === 1) { tx(NX[0] + NW / 2, 158, '8개가 전부 node-1에', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      [1, 2].forEach((i) => tx(NX[i] + NW / 2, 290, '비어 있음', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) })); }
    if (k === 2) { const Q = ['app-3 죽음 감지?', '한 서버 몰림?', '16개로 증설?', '무중단 배포?', '서버 장애 이동?'];
      Q.forEach((q, i) => { const s = pop(u, 0.3 + i * 0.3); card(190 + i * 155, 110, 146, 40, { rx: 8, text: 'Q' + (i + 1) + ' ' + q, fs: 13.5, stroke: WARN, s }); });
      [1, 2].forEach((i) => tx(NX[i] + NW / 2, 290, '비어 있음', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT })); } }

  // 3. replicas: 8 선언 → 스케줄러가 3-3-2
  function s3(t, c) { const { k, u, beat } = c, placed = k === 3;
    snippet(20, 20, ['kind: Deployment', 'replicas: 8', k >= 1 ? 'labels: {app: myapp}' : '', k >= 2 ? 'cpu: 100m' : ''].filter(Boolean), { fs: 14.5, w: 230 });
    const free = [60, 70, 40];
    NX.forEach((x, i) => node(x, 180, NW, 220, 'node-' + (i + 1), { cpu: k >= 2 ? free[i] : null, cpuLabel: '여유 CPU (예시)' }));
    const dest = []; beat.nodes.forEach((nd, ni) => nd.boxes.forEach((b, j) => dest.push([ni, j])));
    for (let i = 0; i < 8; i++) { const qx = 330 + i * 76, qy = 66;
      if (!placed) { const s = k === 0 ? pop(u, 0.3 + i * 0.12) : 1; ctr(qx, qy, 'Pod ' + (i + 1), 'cyan', { ghost: true, w: 66, h: 36, s });
        if (k >= 1) { pill(qx, qy + 34, 'app', ACC, k === 1 ? pop(u, 0.4 + i * 0.1) : 1, { fs: 13.5 }); } continue; }
      const [ni, j] = dest[i], [sx, sy] = slot(NX[ni], 180, NW, j, 3), a = E(u, 0.3 + i * 0.22, 0.9 + i * 0.22);
      dot([[qx, qy], [lerp(qx, sx, 0.5), 140], [sx, sy]], seg(u, 0.1 + i * 0.22, 0.4 + i * 0.22), ACC, 5);
      if (a > 0) ctr(lerp(qx, sx, a), lerp(qy, sy, a), 'app-' + (i + 1), 'cyan', { ghost: a < 1, w: 66, h: 36 }); else ctr(qx, qy, 'Pod ' + (i + 1), 'cyan', { ghost: true, w: 66, h: 36 }); }
    if (k === 0) mono(620, 130, 'Pending · 아직 노드 없음', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    if (k === 1) { grow(250, 80, 290, 80, E(u, 0.2, 0.6), ACC); mono(620, 140, 'selector app=myapp ↔ template 라벨', { 'font-size': 14.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 2) mono(620, 140, '스케줄러가 볼 값: requests cpu 100m', { 'font-size': 14.5, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    if (placed) { [3, 3, 2].forEach((n, i) => mono(NX[i] + NW - 14, 204, n + ' pods', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 2.2) })); } }

  // 4. Self-healing: 노드 장애 → 축출 → 다시 8개
  function s4(t, c) { const { k, u, beat } = c;
    // 위: 시간 줄 (기본값 기준)
    const T = [[0, '0초', '다운'], [50, '50초', 'NotReady'], [350, '350초', '축출'], [365, '약 6분', '8개']], X = (v) => v <= 50 ? 70 + v / 50 * 130 : v <= 350 ? 200 + (v - 50) / 300 * 280 : 480 + (v - 350) / 15 * 150;
    el('line', { x1: X(0), y1: 52, x2: X(365), y2: 52, stroke: GRID, 'stroke-width': 4, 'stroke-linecap': 'round' });
    const tNow = k === 0 ? lerp(0, 50, E(u, 0.3, 1.6)) : k === 1 ? lerp(50, 350, E(u, 0.2, 1.6)) : k === 2 ? lerp(350, 360, E(u, 0.2, 1.6)) : 365;
    el('line', { x1: X(0), y1: 52, x2: X(tNow), y2: 52, stroke: WARN, 'stroke-width': 4, 'stroke-linecap': 'round' });
    T.forEach(([v, a, b], i) => { if (tNow < v - 0.5) return; el('circle', { cx: X(v), cy: 52, r: 6, fill: i === 3 ? GOOD : WARN });
      if (i < 3) mono(X(v), 34, a, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      tx(X(v), 80, b, { 'font-size': 14, 'font-weight': 700, 'text-anchor': i === 3 ? 'end' : 'middle', fill: i === 3 ? GOOD : INK }); });
    if (tNow >= 364) mono(X(365), 34, '약 6분', { 'font-size': 13.5, 'text-anchor': 'end', fill: GOOD, 'font-weight': 700 });
    // 오른쪽 위: 선언 vs 현재
    const prevN = c.prev ? (k === 1 ? 5 : k === 2 ? 5 : 5) : 8, cur = k === 0 ? tween(8, 5, u) : k === 3 ? tween(5, 8, u) : k === 2 ? lerp(5, 8, E(u, 0.6, 2.4)) : 5;
    card(780, 60, 270, 74, { rx: 12, stroke: k === 3 ? GOOD : WARN, sw: 2 });
    tx(668, 50, '선언 (spec)', { 'font-size': 13.5, fill: MUT }); mono(668, 80, '8', { 'font-size': 26, 'font-weight': 800 });
    tx(790, 50, '쓸 수 있는 Pod', { 'font-size': 13.5, fill: MUT }); mono(790, 80, String(Math.round(cur)), { 'font-size': 26, 'font-weight': 800, fill: Math.round(cur) < 8 ? BAD : GOOD });
    if (k === 1) mono(880, 80, '-3', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1) });
    if (k === 3) check(890, 68, 11, pop(u, 1.4));
    // 아래: 노드 3대
    const before = [[0, 1, 2], [3, 4, 5], [6, 7]];
    NX.forEach((x, i) => node(x, 165, NW, 235, 'node-' + (i + 1), { down: i === 1 && (k > 0 || u > 0.4) }));
    before.forEach((ids, ni) => ids.forEach((id, j) => { const [sx, sy] = slot(NX[ni], 165, NW, j, 3);
      if (ni === 1) { if (k >= 2) return; const lost = k === 0 ? fade(u, 0.6) : 1;
        ctr(sx, sy, 'app-' + (id + 1), lost > 0.5 ? 'gray' : 'cyan', { w: 66, h: 36, op: k === 1 ? 1 - E(u, 1.8, 2.6) * 0.7 : 1 });
        return; }
      ctr(sx, sy, 'app-' + (id + 1), 'cyan', { w: 66, h: 36 }); }));
    if (k === 0) cross(NX[1] + NW / 2, 300, 22, pop(u, 0.3));
    if (k >= 2) [[0, 3, 'app-9'], [0, 4, 'app-10'], [2, 2, 'app-11']].forEach(([ni, j, id], i) => { const [sx, sy] = slot(NX[ni], 165, NW, j, 3), a = k === 2 ? E(u, 0.4 + i * 0.5, 1.2 + i * 0.5) : 1;
      if (k === 2) dot([[780, 100], [sx, sy]], seg(u, 0.2 + i * 0.5, 0.8 + i * 0.5), GOOD, 6);
      if (a > 0) ctr(sx, sy, id, 'green', { w: 66, h: 36, s: k === 2 ? pop(u, 0.8 + i * 0.5) : 1 });
      if (a > 0 && k === 2) mono(sx, sy + 32, 'Creating', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1 + i * 0.5) }); });
    if (k === 1) { mono(NX[1] + NW / 2, 262, 'Terminating × 3', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      sub(NX[1] + NW / 2, 380, '기본 toleration 300초 뒤 축출', fade(u, 1.0), { 'font-weight': 700, fill: BAD }); } }

  // 5. HPA
  function s5(t, c) { const { k, u, beat } = c, prev = c.prev || beat;
    const cnt = (b) => b.nodes.reduce((a, nd) => a + nd.boxes.length, 0);
    // 왼쪽 위: min ~ max 범위 막대
    const RX = (v) => 60 + (v - 3) / 27 * 330;
    tx(40, 30, 'HPA → Deployment myapp', { 'font-size': 15, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.2) : 1 });
    el('rect', { x: RX(3), y: 56, width: (RX(30) - RX(3)) * (k === 0 ? E(u, 0.4, 1.4) : 1), height: 12, rx: 6, fill: SOFT, stroke: GRID });
    [[3, 'min 3'], [30, 'max 30']].forEach(([v, s], i) => mono(RX(v), 92, s, { 'font-size': 13.5, 'text-anchor': i ? 'end' : 'start', fill: MUT, opacity: k === 0 ? fade(u, 1.2) : 1 }));
    let rep = k === 0 ? 8 : k === 1 ? 8 : k === 2 ? (u < 1.3 ? lerp(8, 12, E(u, 0.3, 1.1)) : lerp(12, 16, E(u, 1.5, 2.3))) : k === 3 ? 16 : lerp(16, 3, E(u, 0.8, 2.2));
    el('circle', { cx: RX(rep), cy: 62, r: 10, fill: ACC, opacity: k === 0 ? fade(u, 1.4) : 1 });
    mono(RX(rep) + 16, 67, String(Math.round(rep)), { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 1.4) : 1 });
    // 오른쪽 위: CPU 게이지 (requests 대비, 0~150%)
    if (k >= 1 || u > 1.6) { const GX = 490, GW = 420, V = (v) => GX + v / 150 * GW, cpu = k === 2 ? (u < 1.3 ? 120 : u < 2.3 ? lerp(120, 106, E(u, 1.3, 1.5)) : lerp(106, 80, E(u, 2.3, 2.9))) : tween(prev.cpu, beat.cpu, u), op = k === 0 ? fade(u, 1.6) : 1;
      tx(GX, 30, '평균 CPU (requests 대비)', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: op });
      el('rect', { x: GX, y: 50, width: GW, height: 22, rx: 5, fill: SOFT, opacity: op });
      el('rect', { x: GX, y: 50, width: Math.max(2, V(cpu) - GX), height: 22, rx: 5, fill: cpu > 88 ? BAD : cpu < 40 ? INFO : ACC, opacity: op });
      el('line', { x1: V(80), y1: 42, x2: V(80), y2: 80, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: op });
      mono(V(80), 98, '목표 80', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: op });
      mono(Math.min(V(cpu) + 8, GX + GW - 40), 66, Math.round(cpu) + '%', { 'font-size': 15, 'font-weight': 800, fill: cpu > 88 ? PANEL : INK, 'text-anchor': cpu > 88 ? 'end' : 'start', opacity: op, x: cpu > 88 ? V(cpu) - 8 : V(cpu) + 8 }); }
    // 계산식
    const F = k === 2 ? (u < 1.3 ? 'ceil(8 × 120/80) = 12' : 'ceil(12 × 106/80) = 16') : k === 4 ? 'ceil(16 × 15/80) = 3' : k === 1 ? '120% > 목표 80%' : null;
    if (F) pill(480, 132, F, k === 4 ? INFO : BAD, k === 2 ? pop(u, u < 1.3 ? 0.2 : 1.3) : pop(u, 0.4), { mono: true, fs: 15 });
    if (k === 4) sub(480, 162, '줄일 때는 5분 지켜본 뒤', fade(u, 1.4), { 'font-weight': 700 });
    // 아래: 노드와 Pod
    const nodesNow = k === 2 || k === 3 ? beat.nodes : k === 4 ? prev.nodes : beat.nodes;
    NX.forEach((x, i) => node(x, 178, NW, 222, 'node-' + (i + 1)));
    let shownAmber = k === 2 ? Math.round(rep) - 8 : 8, ai = 0;
    nodesNow.forEach((nd, ni) => nd.boxes.forEach((b, j) => { const [sx, sy] = slot(NX[ni], 178, NW, j, 3);
      if (b.color === 'amber') { ai++; if (k === 2 && ai > shownAmber) return;
        if (k === 3) dot([[480, 150], [sx, sy]], seg(u, 0.1 + ai * 0.2, 0.5 + ai * 0.2), WARN, 6); }
      let op = 1; if (k === 4) { const keep = beat.nodes[ni].boxes.some((x) => x.id === b.id); if (!keep) op = 1 - E(u, 0.8 + (j % 3) * 0.2, 1.8 + (j % 3) * 0.2); if (op <= 0.02) return; }
      ctr(sx, sy, b.id, b.color, { w: 66, h: 36, op, s: k === 2 && b.color === 'amber' && ai === shownAmber ? pop(u, u < 1.3 ? 0.4 : 1.6) : 1 }); }));
    if (k === 3) nodesNow.forEach((nd, ni) => mono(NX[ni] + NW - 14, 202, nd.boxes.length + ' pods', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: WARN, opacity: fade(u, 2) }));
    if (k === 3) sub(480, 162, 'HPA는 개수만, 자리는 스케줄러가', fade(u, 0.3), { 'font-weight': 700 }); }

  const quiz = [
    { q: '컨테이너가 1개일 때 docker run만으로 충분한 이유는 무엇인가?',
      o: ['어디서 도는지·복구·배포가 명령 한 줄로 머릿속에 다 들어오기 때문이다', 'docker가 죽은 컨테이너를 알아서 다른 서버로 옮겨 주기 때문이다', '컨테이너 1개는 CPU를 쓰지 않기 때문이다'], a: 0,
      why: '하나뿐이면 docker ps 한 번으로 상태가 보이고 docker start로 되살린다. 문제는 8개, 80개로 늘 때 생긴다.' },
    { q: '컨테이너 8개를 손으로 docker run 하자 생긴 일로 페이지에 나온 것은 무엇인가?',
      o: ['8개가 세 노드에 자동으로 나뉘었다', '어디 둘지 정해 주는 이가 없어 8개가 전부 node-1에 몰렸다', 'app-3이 죽자 곧바로 다시 떴다'], a: 1,
      why: '사람이 일일이 정하지 않으면 한 서버에 몰린다. 장애 감지·증설·무중단 배포도 명령 한 줄로는 답이 안 나온다.' },
    { q: 'replicas: 8 Deployment를 apply했을 때 각 Pod를 어느 노드에 둘지 정하는 것은 무엇인가?',
      o: ['YAML에 적은 nodeName', 'kubectl이 순서대로 돌려 가며', '스케줄러가 requests와 노드 여유를 보고'], a: 2,
      why: '사람은 "8개"와 requests(cpu 100m)만 적는다. 스케줄러가 노드 여유를 보고 3·3·2로 나눴다.' },
    { q: '노드 하나가 꺼졌을 때 기본값 그대로라면 Pod가 다른 노드에 다시 서기까지 대략 얼마나 걸리나?',
      o: ['약 5초', '약 6분', '사람이 지울 때까지 계속'], a: 1,
      why: '노드 컨트롤러가 약 50초 뒤 NotReady를 붙이고, 기본 toleration 300초가 지나야 Pod가 축출된다. 그 뒤 ReplicaSet이 새 Pod를 만든다.' },
    { q: '현재 8개, 평균 CPU 120%, 목표 80%일 때 HPA가 계산하는 replica 수는 무엇인가?',
      o: ['9', '16', '12'], a: 2,
      why: 'ceil(8 × 120/80) = ceil(12) = 12다. 다시 재서 106%면 ceil(12 × 106/80) = 16이 된다.' },
  ];

  const summary = [
    '컨테이너 하나는 docker run 한 줄로 충분하지만 8개만 돼도 배치와 감시를 사람이 감당하지 못한다.',
    'Deployment에는 원하는 개수만 적고, 어느 노드에 둘지는 스케줄러가 requests와 여유를 보고 정한다.',
    '노드가 죽으면 기본값으로 약 6분 뒤 ReplicaSet이 모자란 Pod를 다른 노드에 다시 만든다.',
    'HPA는 ceil(현재 개수 × 현재값/목표값)으로 개수를 바꾸고, 줄일 때는 5분을 지켜본 뒤 움직인다.',
  ];
  const review = [
    { q: '16개로 늘린 뒤 CPU가 80% 근처로 내려오자 HPA가 더 늘리지 않는다. 이유는 무엇인가?',
      o: ['ceil(16 × 80/80) = 16이라 지금 개수 그대로가 답이다', 'maxReplicas 30에 이미 닿았다', '스케줄러가 더 둘 노드가 없다고 막았다'], a: 0,
      why: '현재값이 목표와 같으면 비율이 1이라 계산 결과가 지금 개수와 같다. 30은 아직 멀었고 배치는 HPA가 막는 일이 아니다.' },
    { q: '노드 한 대를 끄고 1분 뒤 보니 Pod가 아직 8개로 세어지고 새 Pod도 없다. 어떻게 봐야 하나?',
      o: ['self-healing이 고장 났으니 Deployment를 다시 만든다', '정상이다. 축출 대기 300초가 지나야 ReplicaSet이 새 Pod를 만든다', 'HPA가 꺼져 있어서 그렇다'], a: 1,
      why: 'NotReady 판정 뒤에도 기본 toleration 300초 동안 Pod는 그 노드에 묶여 있다. 그 뒤 축출되면 ReplicaSet이 모자란 수를 채운다.' },
    { q: 'HPA가 replica를 8에서 16으로 늘렸다. 늘어난 8개를 세 노드에 나누는 것은 누구인가?',
      o: ['HPA가 노드마다 직접 넣는다', '운영자가 nodeName을 적어 준다', '스케줄러가 Step 3과 같은 방식으로 정한다'], a: 2,
      why: 'HPA는 Deployment의 replicas 값만 바꾼다. 새 Pod를 어느 노드에 둘지는 처음 배치 때처럼 스케줄러가 정한다.' },
  ];

  R.page({ title: '노드 3대와 컨테이너 배치', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
