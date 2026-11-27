/* V-1-1 Argo Rollouts — Progressive Delivery · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 파드 수는 argo-rollouts utils/replicaset/canary.go 규칙을 python 으로 재현해 얻은 값이다
 *   (trafficRouting 없음: replicas 10 → setWeight 10/30/60 이면 canary 1/3/6, replicas 3 · setWeight 10 → canary 1 + stable 3,
 *    trafficRouting 있음: canary = ceil(weight × replicas / 100), stable 은 10개 그대로)
 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, person, cross, check, clock, terminal, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KC = { S: INFO, C: ACC, X: BAD };
  // 파드 한 칸: kind 'S'(stable v2.3) 'C'(canary v2.4) 'X'(문제 있는 v2.4) 없으면 빈 자리
  function pod(cx, cy, kind, o) { o = o || {}; const z = o.z || 24, s = o.s ?? 1;
    if (!kind) { el('rect', { x: cx - z / 2, y: cy - z / 2, width: z, height: z, rx: 5, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: o.op ?? 1 }); return; }
    if (s <= 0) return; const g = R.G(cx, cy, s, o.op);
    el('rect', { x: -z / 2, y: -z / 2, width: z, height: z, rx: 5, fill: KC[kind] }, g); }
  function legend(x, y, items) { let xx = x;
    items.forEach(([k, s]) => { pod(xx + 8, y - 5, k, { z: 16 }); tx(xx + 22, y, s, { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); xx += 34 + tw(s, 13.5); }); }
  // 트래픽 막대: 왼쪽 stable, 오른쪽 canary
  function split(x, y, w, wc, o) { o = o || {}; const h = 22, cw = w * clamp(wc / 100);
    el('rect', { x, y, width: w, height: h, rx: 6, fill: INFO, opacity: 0.8 });
    if (cw > 0.5) el('rect', { x: x + w - cw, y, width: cw, height: h, rx: 6, fill: o.bad ? BAD : ACC });
    mono(x, y + h + 19, 'stable ' + Math.round(100 - wc) + '%', { 'font-size': 14.5, fill: INFO, 'font-weight': 700 });
    mono(x + w, y + h + 19, 'canary ' + Math.round(wc) + '%', { 'font-size': 14.5, fill: o.bad ? BAD : ACC, 'font-weight': 700, 'text-anchor': 'end' }); }
  // canary.steps 목록. cur 보다 앞은 끝남(✓), cur 은 지금 단계
  function ladder(x, y, rows, cur, o) { o = o || {}; const rh = o.rh || 38, w = o.w || 250;
    tx(x, y - 12, o.title || 'canary.steps', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
    rows.forEach((r, i) => { const yy = y + i * rh, done = i < cur, on = i === cur, cy = yy + rh / 2 - 2;
      if (on) el('rect', { x: x - 6, y: yy, width: w, height: rh - 5, rx: 7, fill: o.onBg || ACCBG, stroke: o.onCol || ACC, 'stroke-width': 1.5 });
      mono(x + 22, cy + 5, '- ' + r, { 'font-size': 14.5, fill: on ? (o.onCol || ACC) : done ? MUT : INK, 'font-weight': on ? 700 : 500 });
      if (done) check(x + 8, cy, 6); else el('circle', { cx: x + 8, cy, r: 4.5, fill: on ? (o.onCol || ACC) : GRID }); }); }
  // 사람(사용자) → 경로 둘로 갈라지는 점들. wc% 만큼 canary 경로
  function stream(t, rs, rc, wc, o) { o = o || {}; const n = o.n || 20, nc = Math.round(n * wc / 100);
    for (let i = 0; i < n; i++) { const toC = (i * 7) % n < nc, ph = (t * (o.sp || 0.42) + i / n) % 1;
      dot(toC ? rc : rs, ph, toC ? (o.bad ? BAD : ACC) : INFO, 4.5); } }
  // basic canary(라우터 없음) replicas 10 의 파드 수 — canary.go 재현값
  const BASIC10 = { 0: [0, 10], 10: [1, 9], 30: [3, 7], 60: [6, 4], 100: [10, 0] };

  // =========== 1. 왜 Progressive Delivery ===========
  const U1 = [62, 190], SV1 = [205, 190];
  const PX = (i) => 360 + (i % 5) * 44, PY = (i) => (i < 5 ? 148 : 232);
  function base1(kinds, o) { o = o || {};
    person(U1[0], U1[1], '사용자', { stroke: o.hurt ? BAD : INK });
    el('line', { x1: U1[0] + 30, y1: U1[1], x2: SV1[0] - 52, y2: SV1[1], stroke: GRID, 'stroke-width': 2.5 });
    [148, 232].forEach((y) => el('polyline', { points: `${SV1[0] + 52},${SV1[1]} 320,${y} ${PX(4) + 14},${y}`, fill: 'none', stroke: GRID, 'stroke-width': 2 }));
    if (!o.noCard) card(SV1[0], SV1[1], 104, 42, { text: 'Service', fs: 15, mono: true });
    kinds.forEach((k, i) => pod(PX(i), PY(i), k, { z: 28 }));
    tx(PX(0) - 14, 112, 'replicas 10', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, class: 'mono' }); }
  function flow1(t, kinds, o) { o = o || {};
    for (let i = 0; i < 20; i++) { const p = (i * 3) % 10, ph = (t * 0.4 + i / 20) % 1, k = kinds[p];
      dot([[U1[0] + 30, U1[1]], [SV1[0] + 52, SV1[1]], [320, PY(p)], [PX(p), PY(p)]], ph, KC[k] || OFF, 4.5); } }
  function s1(t, c) { const { k, u } = c;
    let kinds = Array(10).fill('S');
    if (k === 1) kinds = kinds.map((x, i) => (i < 5 && u > 0.3 + i * 0.28 ? 'C' : 'S'));
    if (k === 2) kinds = kinds.map((x, i) => (i < 5 || u > 0.3 + (i - 5) * 0.28 ? 'C' : 'S'));
    if (k === 3) kinds = kinds.map((x, i) => (u > 0.2 + i * 0.08 ? 'X' : 'C'));
    if (k === 4) kinds = kinds.map((x, i) => (i < 3 ? 'C' : 'S'));
    const dim = k === 5;
    if (!dim) { base1(kinds, { hurt: k === 3, noCard: true }); flow1(t, kinds); card(SV1[0], SV1[1], 104, 42, { text: 'Service', fs: 15, mono: true }); legend(320, 290, [['S', 'v2.3 (stable)'], ['C', 'v2.4 (새 버전)']]); }
    else { kinds = Array(10).fill('S'); base1(kinds); el('rect', { x: 20, y: 100, width: 560, height: 200, fill: PANEL, opacity: 0.7 }); }
    const X0 = 620;
    if (k === 0) {
      [['maxSurge 25%', '최대 13개', 705], ['maxUnavailable 25%', '최소 8개 가용', 870]].forEach(([a, b, cx], i) => { const s = pop(u, 0.3 + i * 0.4);
        card(cx, 150, 160, 84, { s, stroke: INK });
        mono(cx, 138, a, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.4) });
        tx(cx, 170, b, { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.4) }); });
      tx(780, 240, '정하는 것은 교체 속도뿐', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) });
      pill(780, 290, '새 버전에 몇 %?', MUT, pop(u, 1.9), { fs: 14 }); cross(850, 290, 9, pop(u, 2.2)); return; }
    if (k === 1) {
      tx(780, 140, '바뀐 파드 5 / 10', { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 800, class: 'mono', opacity: fade(u, 0.6) });
      tx(780, 172, '= 새 버전 트래픽 50%', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      sub(780, 198, '의도한 값이 아니라 우연히 정해진다', fade(u, 1.8));
      pill(760, 262, '"새 버전 10%만"', MUT, pop(u, 2.1), { fs: 14 }); cross(850, 262, 9, pop(u, 2.3)); return; }
    if (k === 2) { const f = lerp(0.5, 1, E(u, 0.3, 2.0)), x0 = 650, w = 260;
      tx(x0, 118, '롤아웃 진행', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: x0, y: 130, width: w, height: 18, rx: 9, fill: SOFT });
      el('rect', { x: x0, y: 130, width: w * f, height: 18, rx: 9, fill: ACC });
      mono(x0 + w, 118, Math.round(f * 100) + '%', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'end' });
      [0.25, 0.5, 0.75].forEach((p, i) => { const xx = x0 + w * p; el('line', { x1: xx, y1: 160, x2: xx, y2: 188, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 3' }); cross(xx, 202, 7, pop(u, 1.0 + i * 0.3)); });
      tx(780, 250, '멈춰서 볼 지점이 없다', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { const r = lerp(20, 92, E(u, 0.4, 1.8));
      el('circle', { cx: 780, cy: 170, r, fill: BADBG, stroke: BAD, 'stroke-width': 2.5 });
      tx(780, 166, '사용자 100%', { 'font-size': 18, 'text-anchor': 'middle', 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      sub(780, 190, '가 이미 v2.4를 본다', fade(u, 1.2));
      tx(780, 300, '알아챘을 때는 피해가 끝난 뒤', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { const ax = axes(650, 80, 250, 150, { x: [0, 4], y: [0, 100], yt: [0, 30, 100], xl: '단계' });
      const pts = [[0, 0], [0.4, 0], [0.4, 10], [1, 10], [1, 30], [2, 30]];
      line(ax, pts, E(u, 0.2, 1.4), ACC, { sw: 3 });
      line(ax, [[2, 30], [2, 60], [3, 60], [3, 100], [4, 100]], fade(u, 1.4), OFF, { dash: '5 5', sw: 2 });
      if (u > 1.4) { el('circle', { cx: ax.X(2), cy: ax.Y(30), r: 8 * pop(u, 1.4), fill: WARN }); }
      pill(ax.X(2), ax.Y(30) - 30, 'pause · 지표 확인', WARN, pop(u, 1.6), { fs: 13.5 });
      tx(780, 300, '영향 범위 = 사용자 30%', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); return; }
    // k5: Argo Rollouts 도구 상자
    lbl(780, 70, 'Argo Rollouts가 주는 것', fade(u, 0.1), { 'font-size': 17 });
    [['Rollout CRD', 'Deployment 대신'], ['canary · blueGreen', '전략'], ['setWeight · pause', '트래픽 단계'], ['AnalysisTemplate', '지표로 판정'], ['trafficRouting', 'Ingress · Mesh로 분할']].forEach(([a, b], i) => {
      const y = 116 + i * 56, s = pop(u, 0.3 + i * 0.3);
      card(780, y, 300, 46, { rx: 23, stroke: ACC, sw: 2, s });
      mono(650, y + 5, a, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4 + i * 0.3) });
      tx(912, y + 5, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.3) }); });
    tx(250, 330, '지금: 한 번에 전체 교체', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: MUT }); }

  // =========== 2. Rollout CRD ===========
  const YL = 52, YX = 36, LH = 40;
  function yamlLine(i, s, o) { o = o || {}; mono(YX + 18 + (o.ind || 0) * 18, YL + 44 + i * LH, s, { 'font-size': 15, fill: o.col || INK, 'font-weight': o.fw || 500, opacity: o.op ?? 1, 'text-decoration': o.strike ? 'line-through' : null }); }
  function s2(t, c) { const { k, u } = c;
    el('rect', { x: YX, y: YL, width: 400, height: 330, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(YX + 16, YL + 20, 'rollout.yaml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    // 0~1줄: apiVersion · kind (k0 에서 바뀐다)
    const morph = k === 0 ? seg(u, 0.6, 1.3) : 1;
    if (morph < 1) { yamlLine(0, 'apiVersion: apps/v1', { op: 1 - morph * 0.6 }); yamlLine(1, 'kind: Deployment', { op: 1 - morph * 0.6 });
      el('line', { x1: YX + 18, y1: YL + 40, x2: YX + 18 + 180 * morph, y2: YL + 40, stroke: BAD, 'stroke-width': 2 }); el('line', { x1: YX + 18, y1: YL + 80, x2: YX + 18 + 150 * morph, y2: YL + 80, stroke: BAD, 'stroke-width': 2 }); }
    else { const hot = k === 0; yamlLine(0, 'apiVersion: argoproj.io/v1alpha1', { col: hot ? ACC : INK, fw: hot ? 700 : 500, op: hot ? fade(u, 1.3) : 1 }); yamlLine(1, 'kind: Rollout', { col: hot ? ACC : INK, fw: hot ? 700 : 500, op: hot ? fade(u, 1.5) : 1 }); }
    const hl = (i, kk) => (k === kk ? { col: ACC, fw: 700, op: fade(u, 0.2) } : {});
    if (k >= 1) { yamlLine(2, 'replicas: 10', hl(2, 1)); yamlLine(3, 'revisionHistoryLimit: 5', hl(3, 1)); }
    if (k >= 2 && k !== 5) { yamlLine(4, 'template:  # Deployment와 같다', hl(4, 2)); }
    if (k >= 3 && k !== 5) yamlLine(5, 'image: acme/web:v2.4.0', Object.assign({ ind: 1 }, hl(5, 3)));
    if (k >= 4) yamlLine(6, 'strategy: { canary: { steps } }', hl(6, 4));
    if (k === 5) { yamlLine(4, 'template: …', { strike: true, col: MUT, op: 1 - fade(u, 0.3) * 0.5 }); yamlLine(5, 'workloadRef: Deployment/web', { col: ACC, fw: 700, op: fade(u, 0.7) }); }
    const RX = 690;
    if (k === 0) { card(560, 170, 150, 54, { text: 'Deployment', fs: 16, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      grow(640, 170, 728, 170, E(u, 0.8, 1.4), ACC);
      card(810, 170, 150, 54, { text: 'Rollout', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.4) });
      mono(690, 250, 'apps/v1  →  argoproj.io/v1alpha1', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      sub(690, 280, '워크로드 종류가 바뀐다', fade(u, 2.0)); return; }
    if (k === 1 || k === 2) {
      for (let i = 0; i < 10; i++) pod(510 + (i % 5) * 38, 120 + Math.floor(i / 5) * 40, 'S', { s: k === 1 ? pop(u, 0.2 + i * 0.07) : 1, z: 28 });
      tx(586, 190, 'replicas 10', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, class: 'mono' });
      for (let i = 4; i >= 0; i--) { const s = k === 1 ? fade(u, 1.0 + (4 - i) * 0.2) : 1;
        card(830 + i * 8, 110 + i * 10, 140, 40, { rx: 8, stroke: GRID, fill: PANEL, op: s, text: i === 0 ? '이전 RS' : '', fs: 14, color: MUT }); }
      tx(860, 210, '롤백용 5개 보관', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 1 ? fade(u, 2.0) : 1 });
      if (k === 2) { card(560, 300, 150, 50, { text: 'Deployment', fs: 15, stroke: INFO, color: INFO, dash: '5 4' });
        card(830, 300, 150, 50, { text: 'Rollout', fs: 15, stroke: ACC, color: ACC, fill: ACCBG });
        R.fly(560, 342, 830, 342, seg(u, 0.4, 1.8), 'template', { stay: true, mono: true });
        sub(695, 384, '파드 스펙을 고치지 않고 옮긴다', fade(u, 2.0)); }
      return; }
    if (k === 3 || k === 4) { const on = k === 4 ? 1 : 0, nOld = 10 - on;
      card(600, 90, 170, 44, { rx: 8, text: 'RS  v2.3', fs: 15, mono: true, stroke: INFO, color: INFO });
      card(830, 90, 170, 44, { rx: 8, text: 'RS  v2.4.0', fs: 15, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: k === 3 ? pop(u, 1.4) : 1 });
      for (let i = 0; i < 10; i++) pod(540 + (i % 5) * 30, 150 + Math.floor(i / 5) * 32, i < nOld ? 'S' : null, { z: 22 });
      for (let i = 0; i < 10; i++) pod(770 + (i % 5) * 30, 150 + Math.floor(i / 5) * 32, i < on ? 'C' : null, { z: 22, s: k === 4 ? pop(u, 0.6) : 1 });
      mono(600, 232, nOld + ' 개', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO });
      mono(830, 232, on + ' 개', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC });
      if (k === 3) { R.fly(300, YL + 40 + 5 * LH, 830, 90, seg(u, 0.3, 1.3), 'v2.4.0', { mono: true });
        tx(715, 300, '태그가 바뀌면 새 ReplicaSet이 생긴다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.7) });
        sub(715, 326, '= 롤아웃 시작 신호', fade(u, 2.0)); }
      else { pill(715, 300, 'setWeight: 10  →  10개 중 1개', ACC, pop(u, 0.9), { mono: true, fs: 14 });
        pill(715, 350, 'pause: {}  승인 대기', WARN, pop(u, 1.6), { mono: true, fs: 14 }); }
      return; }
    if (k === 5) { card(590, 150, 160, 56, { text: 'Rollout web', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.3) });
      card(850, 150, 170, 56, { text: 'Deployment web', fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.6) });
      grow(670, 150, 764, 150, E(u, 0.9, 1.5), ACC, { dash: '6 4' });
      sub(717, 132, 'template 참조', fade(u, 1.4), { fill: ACC, 'font-weight': 700 });
      tx(715, 260, '파드 스펙은 Deployment에 한 벌만', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(715, 286, '관리는 Rollout이 넘겨받는다', fade(u, 2.1)); return; }
    // k6: 같은 라벨 파드 두 벌
    card(715, 76, 130, 40, { text: 'Service web', fs: 14.5, mono: true });
    const gS = [], gR = [];
    for (let i = 0; i < 10; i++) { gS.push([520 + (i % 5) * 30, 190 + Math.floor(i / 5) * 32]); gR.push([780 + (i % 5) * 30, 190 + Math.floor(i / 5) * 32]); }
    [[580, 'Deployment web', INFO, gS, 'S'], [840, 'Rollout web', ACC, gR, 'C']].forEach(([cx, name, col, g, kd], j) => {
      tx(cx, 268, name, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + j * 0.4) });
      g.forEach(([x, y], i) => pod(x, y, kd, { z: 22, s: pop(u, 0.3 + j * 0.4 + i * 0.03) }));
      el('line', { x1: 715, y1: 96, x2: cx, y2: 150, stroke: GRID, 'stroke-width': 2 }); });
    for (let i = 0; i < 12; i++) { const ph = (t * 0.45 + i / 12) % 1, toR = i % 2, tg = (toR ? gR : gS)[(i * 3) % 10];
      dot([[715, 96], [toR ? 840 : 580, 150], tg], u > 0.9 ? ph : 0, toR ? ACC : INFO, 4.5); }
    tx(715, 300, '파드 20개 · Service는 양쪽으로 보낸다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    sub(715, 326, 'canary 비율이 의미를 잃는다', fade(u, 2.0)); }

  // =========== 3. Canary steps ===========
  const STEPS3 = ['setWeight: 10', 'pause: {duration: 5m}', 'setWeight: 30', 'pause: {}', 'setWeight: 60', 'pause: {duration: 10m}', 'setWeight: 100'];
  const U3 = [350, 190], SS = [478, 120], SC = [478, 262], PX3 = 568, PG3 = 33;
  function pods3(cS, cC, o) { o = o || {};
    for (let i = 0; i < 10; i++) { pod(PX3 + i * PG3, SS[1], i < cS ? 'S' : null, { z: 24 }); pod(PX3 + i * PG3, SC[1], i < cC ? (o.bad ? 'X' : 'C') : null, { z: 24, s: o.popC ? o.popC(i) : 1 }); } }
  function base3(t, w, o) { o = o || {};
    person(U3[0], U3[1], '사용자');
    [SS, SC].forEach((p) => el('line', { x1: U3[0] + 28, y1: U3[1], x2: p[0] - 58, y2: p[1], stroke: GRID, 'stroke-width': 2.2 }));
    const [cC, cS] = BASIC10[o.pw ?? w] || [0, 10]; pods3(cS, cC, o);
    if (o.flow !== false) stream(t, [[U3[0] + 28, U3[1]], [SS[0] - 58, SS[1]], [SS[0] + 58, SS[1]], [PX3 + 4 * PG3, SS[1]]], [[U3[0] + 28, U3[1]], [SC[0] - 58, SC[1]], [SC[0] + 58, SC[1]], [PX3 + 2 * PG3, SC[1]]], w, { sp: 0.4 });
    card(SS[0], SS[1], 116, 38, { text: 'web-stable', fs: 14, mono: true, stroke: INFO, color: INFO, s: o.svc ?? 1 });
    card(SC[0], SC[1], 116, 38, { text: 'web-canary', fs: 14, mono: true, stroke: ACC, color: ACC, s: o.svc ?? 1 }); }
  function s3(t, c) { const { k, u } = c, b = c.beat.phase, p = (c.prev && c.prev.phase) || b;
    const cur = [-1, 1, 3, 7, 4, 3, 0][k];
    ladder(40, 74, STEPS3, cur, { onCol: k === 2 || k === 5 ? WARN : ACC, onBg: k === 2 || k === 5 ? WARNBG : ACCBG });
    if (k === 6) { // 반올림: 오른쪽은 두 경우 비교
      [[150, 10, 9, 1, '10%'], [280, 3, 3, 1, '25%']].forEach(([y, n, sN, cN, pct], j) => { const s0 = 0.3 + j * 0.9;
        mono(360, y - 34, `replicas ${n} · setWeight 10`, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, s0) });
        for (let i = 0; i < sN; i++) pod(372 + i * 32, y, 'S', { s: pop(u, s0 + 0.1 + i * 0.04) });
        for (let i = 0; i < cN; i++) pod(372 + (sN + i) * 32 + 10, y, 'C', { s: pop(u, s0 + 0.5) });
        mono(372 + (sN + cN) * 32 + 30, y + 6, `canary ${cN} / ${sN + cN} = ${pct}`, { 'font-size': 15, 'font-weight': 800, fill: j ? BAD : ACC, opacity: fade(u, s0 + 0.6) }); });
      sub(620, 352, '파드 수로 나누면 1개 단위로만 움직인다 (기본 maxSurge 25%)', fade(u, 2.1)); return; }
    const w = k === 3 ? lerp(30, 100, E(u, 0.3, 1.8)) : tween(p.weight, b.weight, u);
    const pw = k === 3 ? (u < 0.9 ? 30 : u < 1.4 ? 60 : 100) : b.weight;
    base3(t, w, { pw, svc: k === 0 ? pop(u, 0.3) : 1, popC: k === 1 ? (i) => pop(u, 0.5) : null });
    if (k === 0) sub(620, 205, '두 경로를 먼저 나눈다', fade(u, 1.0), { 'font-weight': 700, fill: INK });
    if (k === 1) { clock(300, 124, 15, E(u, 0.5, 2.6), WARN); }
    if (k === 2 || k === 5) { pill(620, 205, 'promote 할 때까지 멈춤 · ∞', WARN, pop(u, 0.6), { fs: 14 }); }
    if (k === 3 && u > 1.9) { tx(SC[0] + 300, SC[1] + 46, 'v2.4가 새 stable', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); }
    if (k === 4) { terminal(340, 300, 600, 112, ['$ kubectl argo rollouts get rollout web --watch', '$ kubectl argo rollouts promote web', ['# 남은 단계를 건너뛸 때: promote web --full', 'var(--off)']], lerp(0, 3, E(u, 0.2, 2.2)), { fs: 14, lh: 22 }); return; }
    split(360, 318, 540, w);
    if (k === 5) { pill(500, 398, '멈춘 채 D+1 · D+2 · D+3', WARN, pop(u, 1.0), { fs: 13.5 }); pill(770, 398, '알림 + 승인 담당자', GOOD, pop(u, 1.8), { fs: 13.5 }); } }

  // =========== 4. trafficRouting ===========
  const U4 = [56, 200], IG = [190, 200], CI = [200, 330], S4 = [455, 128], C4 = [455, 286], PX4 = 596, PG4 = 31;
  function s4(t, c) { const { k, u } = c;
    const istio = k === 5, none = k === 0 || k === 6, w = istio ? 60 : k === 6 ? 9.1 : k === 0 ? 0 : 10;
    person(U4[0], U4[1], '사용자');
    const ciOn = !none && !istio, ciY = k === 1 ? lerp(IG[1] + 50, CI[1], E(u, 0.3, 1.2)) : CI[1];
    // 라우터와 서비스 상자: 흐르는 점 위에 그린다
    const boxes = () => {
      if (istio) { card(IG[0] + 20, 200, 200, 56, { text: 'VirtualService\nweb-vsvc', fs: 14.5, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.3) }); }
      else card(IG[0], IG[1], 140, 44, { text: 'web-ingress', fs: 14.5, mono: true });
      if (ciOn) card(CI[0], ciY, 236, 44, { text: 'web-web-ingress-canary', fs: 13.5, mono: true, stroke: ACC, color: ACC, fill: ACCBG, op: k === 1 ? fade(u, 0.2) : 1 });
      card(S4[0], S4[1], 118, 38, { text: 'web-stable', fs: 14, mono: true, stroke: INFO, color: INFO });
      card(C4[0], C4[1], 118, 38, { text: 'web-canary', fs: 14, mono: true, stroke: ACC, color: ACC }); };
    const ox = istio ? IG[0] + 120 : IG[0] + 70;
    el('line', { x1: U4[0] + 28, y1: U4[1], x2: IG[0] - 70, y2: IG[1], stroke: GRID, 'stroke-width': 2.2 });
    el('line', { x1: ox, y1: IG[1], x2: S4[0] - 59, y2: S4[1], stroke: GRID, 'stroke-width': 2.2 });
    const cFrom = ciOn ? [CI[0] + 118, CI[1]] : [ox, IG[1]];
    el('line', { x1: cFrom[0], y1: cFrom[1], x2: C4[0] - 59, y2: C4[1], stroke: none ? OFF : GRID, 'stroke-width': 2.2, 'stroke-dasharray': none ? '5 5' : null });
    // 파드: 라우터가 있으면 stable 10개 그대로 + canary ceil(w×10/100)
    const cN = k === 6 ? 1 : Math.ceil(w * 10 / 100), sN = 10;
    for (let i = 0; i < 10; i++) { pod(PX4 + i * PG4, S4[1], i < sN ? 'S' : null, { z: 23 }); pod(PX4 + i * PG4, C4[1], i < cN ? 'C' : null, { z: 23, s: k === 1 ? pop(u, 1.3) : 1 }); }
    // 흐름
    if (k !== 0) { const rS = [[U4[0] + 28, U4[1]], [ox, IG[1]], [S4[0] - 59, S4[1]], [S4[0] + 59, S4[1]]];
      const rC = ciOn ? [[U4[0] + 28, U4[1]], [IG[0] - 70, IG[1]], [CI[0] - 118, CI[1]], [CI[0] + 118, CI[1]], [C4[0] - 59, C4[1]], [C4[0] + 59, C4[1]]] : [[U4[0] + 28, U4[1]], [ox, IG[1]], [C4[0] - 59, C4[1]], [C4[0] + 59, C4[1]]];
      if (k !== 1 || u > 1.3) stream(t, rS, rC, w, { sp: 0.38 }); }
    else stream(t, [[U4[0] + 28, U4[1]], [ox, IG[1]], [S4[0] - 59, S4[1]], [S4[0] + 59, S4[1]]], [[0, 0], [0, 0]], 0, { sp: 0.38 });
    boxes();
    // beat 별
    if (k === 0) { tx(C4[0] - 130, 250, '?', { 'font-size': 26, 'font-weight': 800, fill: OFF });
      sub(PX4 + 140, C4[1] + 44, '라우터가 없으면 정확한 %는 없다', fade(u, 0.8), { 'font-weight': 700, fill: WARN }); return; }
    if (k === 1 || k === 2) { mono(CI[0], CI[1] + 44, 'canary-weight: "10"', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 1.4) : 1 });
      if (k === 1) sub(CI[0], CI[1] - 40, 'Rollouts가 복제해 만든다', fade(u, 1.2), { 'font-weight': 700 }); }
    if (k === 2) { const chips = [['setWeight 10', ACC], ['pause 5m', MUT], ['setWeight 60', INK], ['pause {}', MUT], ['setWeight 100', INK]];
      let xx = 330; chips.forEach(([s, col], i) => { const wv = tw(s, 13.5) + 24; pill(xx + wv / 2, 40, s, col, pop(u, 0.2 + i * 0.15), { fs: 13.5, mono: true }); xx += wv + 12; });
      R.fly(386, 40, CI[0], CI[1] + 40, seg(u, 1.1, 2.0), '10', { mono: true });
      sub(PX4 + 140, 210, '단계마다 Rollouts가 이 값을 다시 쓴다', fade(u, 1.9), { 'font-weight': 700, fill: INK }); }
    if (k === 3 || k === 4) { const isC = k === 4, y = isC ? C4[1] + 40 : S4[1] + 40;
      pill(S4[0], y, isC ? 'app=web · hash=canary' : 'app=web · hash=stable', isC ? ACC : INFO, pop(u, 0.4), { mono: true, fs: 13.5 });
      sub(PX4 + 140, 210, 'selector에 해시 라벨을 Rollouts가 덧붙인다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); }
    if (istio) { mono(S4[0], S4[1] - 30, 'weight 40', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.9) });
      mono(C4[0], C4[1] + 42, 'weight 60', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) });
      sub(IG[0] + 20, 260, 'routes: [primary]', fade(u, 1.4), { class: 'mono' }); }
    if (k === 6) { const x0 = 130, wv = 300;
      [['원한 비율', 5, ACC], ['파드로 근사', 100 / 11, BAD]].forEach(([n, v, col], i) => { const y = 352 + i * 30;
        tx(x0 - 10, y + 14, n, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700 });
        R.hbar(x0, y, wv, v * E(u, 0.3 + i * 0.5, 1.2 + i * 0.5), 20, { col, text: i ? 'canary 1 / 11 = 9.1%' : 'setWeight 5' }); });
      sub(770, 372, 'trafficRouting을 빼면 5%를 만들 수 없다', fade(u, 1.9), { 'font-weight': 700, fill: BAD }); } }

  // =========== 5. AnalysisTemplate 로 자동 판정 ===========
  const PASS = [0.982, 0.986, 0.979, 0.988, 0.984], FAIL = [0.935, 0.921, 0.928];   // 그림용 예시 측정값
  const CH5 = ['setWeight: 20', 'pause: 2m', 'analysis', 'setWeight: 60', 'setWeight: 100'];
  function chips5(cur, o) { o = o || {}; let xx = 70;
    CH5.forEach((s, i) => { const wv = tw(s, 14) + 26, cx = xx + wv / 2, done = i < cur, on = i === cur, col = on ? (o.bad ? BAD : ACC) : done ? MUT : INK;
      card(cx, 310, wv, 32, { rx: 16, text: s, fs: 14, mono: true, stroke: col, color: col, fill: on ? (o.bad ? BADBG : ACCBG) : PANEL, sw: on ? 2.2 : 1.6 });
      if (i < CH5.length - 1) grow(xx + wv + 2, 310, xx + wv + 20, 310, 1, GRID, { plain: true });
      xx += wv + 22; }); }
  function s5(t, c) { const { k, u } = c;
    const thr = k === 7 ? lerp(0.95, 0.999, E(u, 0.2, 1.0)) : 0.95;
    // 위 왼쪽: 템플릿
    card(170, 74, 270, 62, { rx: 10, stroke: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.3) : 1 });
    tx(170, 68, 'AnalysisTemplate', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.5) : 1 });
    mono(170, 92, 'args: service-name', { 'font-size': 14, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.9) : 1 });
    if (k === 0) { R.fly(170, 200, 170, 96, seg(u, 1.3, 2.2), 'web-canary', { mono: true }); sub(170, 150, 'Rollout이 값을 넣는다', fade(u, 1.8)); }
    // 오른쪽: 측정 그래프
    if (k >= 1) { const ax = axes(420, 46, 470, 190, { x: [0.5, 5.5], y: [0.9, 1.0], xt: [1, 2, 3, 4, 5], yt: [0.9, 1.0], xl: '측정 (1분 간격 · 5회)', yl: '성공률' });
      if (k >= 2) { const yy = ax.Y(thr), g = k === 2 ? E(u, 0.2, 1.0) : 1;
        el('line', { x1: 420, y1: yy, x2: 420 + 470 * g, y2: yy, stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '7 5' });
        mono(892, yy - 8, (k === 7 ? (u > 1.0 ? '0.999' : thr.toFixed(3)) : '0.95'), { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, fill: WARN, opacity: g }); }
      if (k === 1) for (let i = 1; i <= 5; i++) { const s = pop(u, 0.3 + i * 0.3); el('circle', { cx: ax.X(i), cy: ax.Y(0.9) - 8, r: 5 * s, fill: OFF }); }
      if (k === 5 || k === 7) PASS.forEach((v, i) => { const s = pop(u, 0.3 + i * 0.28), bad = k === 7 && u > 1.0;
        if (k === 7 && i > 2) return; el('circle', { cx: ax.X(i + 1), cy: ax.Y(v), r: 7 * s, fill: bad ? BAD : GOOD }); });
      if (k === 6) FAIL.forEach((v, i) => { const s = pop(u, 0.3 + i * 0.35); el('circle', { cx: ax.X(i + 1), cy: ax.Y(v), r: 7 * s, fill: BAD }); });
      if (k >= 5) sub(560, 276, '점은 그림용 예시값', 1); }
    // 왼쪽 가운데: failureLimit 칸 / PromQL 분수
    if (k === 2 || k === 6 || k === 7) { const fails = k === 2 ? 0 : k === 6 ? Math.floor(clamp((u - 0.3) / 0.35 + 1, 0, 3)) : (u > 1.0 ? Math.floor(clamp((u - 1.0) / 0.3 + 1, 0, 3)) : 0);
      tx(60, 168, 'failureLimit: 2', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      [0, 1, 2].forEach((i) => { const on = i < fails, x = 70 + i * 62;
        card(x + 20, 205, 50, 36, { rx: 7, text: String(i + 1), mono: true, fs: 15, stroke: i === 2 ? BAD : WARN, fill: on ? (i === 2 ? BADBG : WARNBG) : PANEL, color: i === 2 ? BAD : WARN, dash: on ? null : '4 3' }); });
      sub(155, 246, k === 2 ? '세 번째 실패에서 Failed' : fails >= 3 ? '3회 > 2 → Failed' : '실패 누적 중', k === 2 ? fade(u, 1.2) : 1, { 'font-weight': 700, fill: fails >= 3 ? BAD : MUT }); }
    if (k === 3) { const s = fade(u, 0.3);
      mono(170, 175, 'status!~"5.." 요청', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: s });
      el('line', { x1: 60, y1: 190, x2: 60 + 220 * E(u, 0.7, 1.3), y2: 190, stroke: INK, 'stroke-width': 2.2 });
      mono(170, 215, '전체 요청', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.1) });
      tx(170, 252, '= 성공률 (2분 rate)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) }); }
    // 아래: steps 와 트래픽
    if (k >= 4) { const cur = k === 4 ? (u < 1.4 ? 1 : 2) : k === 5 ? (u < 2.2 ? 2 : 3) : 2;
      chips5(cur, { bad: (k === 6 || k === 7) && u > 1.6 });
      if (k === 4) clock(278, 266, 14, E(u, 0.2, 1.4), WARN);
      let w = 20; if (k === 5) w = lerp(20, 60, E(u, 2.2, 2.8)); if ((k === 6 && u > 1.6) || (k === 7 && u > 2.0)) w = lerp(20, 0, E(u, k === 6 ? 1.6 : 2.0, k === 6 ? 2.3 : 2.6));
      split(70, 348, 820, w, { bad: k >= 6 });
      if (k === 5 && u > 2.2) check(397, 276, 9, pop(u, 2.2));
      if (k === 6 && u > 1.6) banner(655, 150, 'Degraded → stable로 즉시 복귀', pop(u, 1.6));
      if (k === 7 && u > 2.0) banner(655, 150, '정상 배포인데 롤백', pop(u, 2.0)); } }

  const quiz = [
    { q: 'RollingUpdate의 maxSurge · maxUnavailable이 정하는 것은 무엇인가?',
      o: ['새 버전으로 보낼 트래픽 비율', '파드를 몇 개씩 바꿀지, 곧 교체 속도', '문제가 생기면 멈출 지점'], a: 1,
      why: '두 값은 교체 중 더 띄우거나 줄일 파드 수다. replicas 10이면 최대 13개, 최소 8개 가용으로 속도만 정하고 트래픽 %는 정하지 못한다.' },
    { q: '기존 Deployment를 그대로 둔 채 같은 라벨의 Rollout을 만들면 무슨 일이 생기는가?',
      o: ['Rollout이 Deployment 파드를 넘겨받아 10개만 남는다', '쿠버네티스가 Rollout 생성을 거부한다', '파드가 두 벌 떠 Service가 양쪽으로 트래픽을 보낸다'], a: 2,
      why: 'Rollout은 기존 Deployment 파드를 건드리지 않는다. 파드가 20개가 되어 canary 비율이 흐려지므로 Deployment를 0으로 줄이거나 workloadRef로 넘겨받는다.' },
    { q: 'canary.steps에서 pause: {}와 pause: { duration: 5m }의 차이는 무엇인가?',
      o: ['pause: {}는 promote 할 때까지 멈추고, duration은 시간이 지나면 넘어간다', '둘 다 5분 뒤 자동으로 넘어간다', 'pause: {}는 단계를 건너뛰고, duration은 멈춘다'], a: 0,
      why: 'pause: {}는 사람이 promote 할 때까지 무한히 기다린다. 그래서 알림과 승인 담당자를 정해 두지 않으면 30%에서 며칠씩 멈춘 채 남는다.' },
    { q: 'trafficRouting 없이 replicas 10, setWeight 5를 주면 canary가 받는 트래픽은 어떻게 되는가?',
      o: ['라우터 없이도 정확히 5%가 된다', '파드 개수로 근사되어 canary 1 / 11 = 약 9%가 된다', 'canary 파드가 뜨지 않아 0%가 된다'], a: 1,
      why: '라우터가 없으면 비율은 파드 수로만 맞춘다. 파드 1개 단위로 움직이므로 5% 같은 값은 만들 수 없고, 정확한 %는 nginx·Istio 같은 라우터가 만든다.' },
    { q: 'failureLimit: 2인 분석에서 Rollout이 자동 롤백되는 때는 언제인가?',
      o: ['측정이 처음 한 번 실패했을 때', '실패가 정확히 2회가 되었을 때', '실패가 2회를 넘어 세 번째 실패가 나왔을 때'], a: 2,
      why: 'failureLimit은 허용하는 실패 횟수다. 실패가 그 값을 넘는 순간 AnalysisRun이 Failed가 되고 Rollout은 Degraded로 트래픽을 stable에 되돌린다.' },
  ];

  const summary = [
    '기본 Deployment는 파드 교체 속도만 정할 수 있어서, 문제가 있으면 사용자 전체가 새 버전을 본다.',
    'Rollout은 파드 스펙을 그대로 쓰고 strategy만 더한다. 기존 Deployment는 0으로 줄여 둔다.',
    'setWeight와 pause로 10%, 30%, 60%, 100% 순서로 올리고, pause: {}는 promote를 기다린다.',
    '정확한 비율은 trafficRouting 라우터가 만들고, AnalysisTemplate이 실패 한도를 넘으면 stable로 되돌린다.',
  ];
  const review = [
    { q: 'replicas 3인 서비스에 setWeight 10을 주고 trafficRouting 없이 배포했더니 canary가 생각보다 많은 요청을 받았다. 먼저 의심할 것은?',
      o: ['파드 수로 비율을 맞추느라 canary 1 / 4 = 25%가 되었다', 'Prometheus 쿼리가 잘못되었다', 'pause: {}가 빠졌다'], a: 0,
      why: '라우터가 없으면 Rollouts는 파드 개수로 비율을 근사한다. replicas가 작을수록 1개 단위 오차가 커지므로 trafficRouting을 붙이거나 replicas를 늘린다.' },
    { q: '배포가 30%에서 사흘째 멈춰 있다. 매니페스트에서 가장 먼저 볼 곳은?',
      o: ['image 태그', 'setWeight: 30 뒤의 pause: {}와 그 승인 담당자', 'revisionHistoryLimit'], a: 1,
      why: 'pause: {}는 promote 전까지 끝나지 않는다. 승인할 사람과 알림을 정해 두거나, 지표로 판정하는 analysis 단계로 바꾼다.' },
    { q: '자동 분석을 붙였더니 정상 배포까지 매번 롤백된다. 가장 그럴듯한 원인은?',
      o: ['trafficRouting이 nginx라서', 'revisionHistoryLimit이 5라서', 'successCondition을 0.999처럼 평소 값보다 빡빡하게 잡았다'], a: 2,
      why: '기준이 평소 성공률보다 높으면 멀쩡한 측정도 실패로 쌓여 failureLimit을 넘는다. 처음엔 0.95처럼 관대하게 두고 데이터를 보며 조인다.' },
  ];

  R.page({ title: 'Argo Rollouts 점진 배포', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
