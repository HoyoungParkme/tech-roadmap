/* V-1-2 카오스 엔지니어링 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 실험 순환(정상 상태→가설→주입→관찰→학습), 파드와 PDB 바닥선, 피해 반경(셀렉터), 분 단위 Game Day 타임라인, 6주 분기 원.
 * 숫자는 페이지 데이터와 코드(chaos_principles.md, chaos_monkey_concept.yaml, chaos_mesh.yaml, gameday_runbook.md, chaos_program.md)에서만 읽는다.
 * orders 파드 3개는 그림용 예시다(코드는 minAvailable 2 와 "3개 이상일 때만 죽인다" 만 정한다). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, clock, meters, axes, line, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function head(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 17, 'font-weight': 800, opacity: op ?? 1 }, a || {})); }
  // 파드: 둥근 네모 + 이름. o.dead 면 빨간 X, o.ghost 면 점선
  function pod(cx, cy, name, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.02) return;
    const col = o.dead ? BAD : o.col || INK;
    card(cx, cy, o.w || 92, 52, { rx: 10, stroke: col, sw: 2.4, s, fill: o.fill, dash: o.ghost ? '6 5' : null, op: o.op });
    tx(cx, cy + 6, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: o.dead ? BAD : o.ghost ? MUT : INK, opacity: (o.op ?? 1) * Math.min(1, s) });
    if (o.dead) cross(cx, cy, 16, o.deadS ?? 1); }
  function bolt(cx, cy, s, col) { const g = R.G(cx, cy, s); el('path', { d: 'M4,-26 L-12,4 L0,4 L-6,26 L14,-6 L2,-6 Z', fill: col || WARN, stroke: INK, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g); }

  // ---------- 1. 가설을 실험으로 ----------
  const LOOP = ['정상 상태', '가설', '주입', '관찰', '학습'];
  function loopStrip(k, u) { LOOP.forEach((s, i) => { const x = 130 + i * 175, on = i === k, done = i < k;
    card(x, 38, 132, 34, { rx: 17, stroke: on ? ACC : done ? GOOD : GRID, sw: on ? 2.6 : 1.6, fill: on ? 'var(--newbg)' : PANEL, text: s, fs: 15, fw: on ? 800 : 600, color: on ? ACC : done ? GOOD : MUT, s: on ? 1 + R.bump(u, 0.1) : 1 });
    if (i < 4) grow(x + 70, 38, x + 104, 38, 1, OFF); }); }
  const T = { user: [90, 230], ord: [340, 230], gw: [640, 230], q: [340, 360] };
  function topo(o) { o = o || {};
    person(T.user[0], T.user[1], '고객', {});
    server(T.ord[0], T.ord[1], 'orders', { lamp: o.ordLamp || GOOD });
    card(T.gw[0], T.gw[1], 170, 66, { rx: 12, stroke: o.gwCol || INK, sw: 2.5, text: '결제 게이트웨이', fs: 15.5, fw: 800, color: o.gwCol || INK });
    el('line', { x1: T.user[0] + 30, y1: T.user[1], x2: T.ord[0] - 60, y2: T.ord[1], stroke: GRID, 'stroke-width': 2.5 });
    el('line', { x1: T.ord[0] + 60, y1: T.ord[1], x2: T.gw[0] - 88, y2: T.gw[1], stroke: GRID, 'stroke-width': 2.5 }); }
  function s1(t, c) { const { k, u } = c;
    loopStrip(k, u);
    if (k === 0) {
      meters(90, 90, 780, [{ name: '주문 성공률', val: '99.5%', good: true }, { name: 'P95 응답', val: '250ms', good: true }, { name: 'DLQ 메시지', val: '0', good: true }].map((m, i) => (u > 0.3 + i * 0.3 ? m : Object.assign({}, m, { val: '' }))), { h: 80 });
      const ax = axes(110, 210, 620, 140, { x: [0, 60], y: [98, 100], yt: [98, 99.5, 100], xl: '분 (모양 예시)', yl: '' });
      el('rect', { x: ax.X(0), y: ax.Y(99.7), width: ax.X(60) - ax.X(0), height: ax.Y(99.3) - ax.Y(99.7), fill: GOODBG, opacity: fade(u, 1.2) });
      const pts = []; for (let i = 0; i <= 60; i++) pts.push([i, 99.5 + 0.12 * Math.sin(i * 0.9) * Math.cos(i * 0.37)]);
      line(ax, pts, E(u, 1.2, 2.3), GOOD, { sw: 2.4 });
      tx(760, 270, '평소를 숫자로', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
      tx(760, 296, '못 박아야', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
      tx(760, 322, '깨진 것을 안다', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { topo();
      card(480, 112, 600, 56, { rx: 12, stroke: ACC, sw: 2.5, fill: 'var(--newbg)', s: pop(u, 0.3) });
      tx(480, 118, '"결제 게이트웨이가 죽어도 주문은 PENDING으로 큐잉된다"', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      card(T.q[0], T.q[1], 190, 46, { rx: 8, stroke: ACC, sw: 2, dash: '6 5', text: 'PENDING 큐', fs: 15, fw: 700, color: ACC, s: pop(u, 1.2) });
      grow(T.ord[0], T.ord[1] + 70, T.q[0], T.q[1] - 26, E(u, 1.4, 1.9), ACC, { dash: '6 5' });
      tx(560, 360, '반증할 수 있는 문장이어야 한다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { topo({ gwCol: WARN });
      bolt(T.gw[0] + 90, T.gw[1] - 50, pop(u, 0.3), WARN);
      mono(T.gw[0], T.gw[1] + 62, 'timeout 100%', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.5) });
      for (let i = 0; i < 4; i++) dot([[T.ord[0] + 60, T.ord[1]], [T.gw[0] - 88, T.gw[1]]], ((t * 0.6 + i / 4) % 1) * 0.95, WARN, 5);
      ['네트워크 지연', '프로세스 kill', '디스크 full', '인증서 만료', 'region failover'].forEach((s, i) => pill(140 + i * 170, 112, s, i === 0 ? WARN : MUT, pop(u, 1.0 + i * 0.2), { fs: 14 }));
      tx(480, 370, '실제로 겪는 장애만 골라 재현한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { topo({ gwCol: BAD, ordLamp: BAD });
      card(T.q[0], T.q[1], 190, 46, { rx: 8, stroke: OFF, sw: 2, dash: '6 5', text: 'PENDING 큐', fs: 15, fw: 700, color: OFF });
      cross(T.q[0] + 110, T.q[1], 12, pop(u, 0.3));
      for (let i = 0; i < 7; i++) dot([[T.ord[0] - 60, T.ord[1] + 10], [T.user[0] + 30, T.user[1] + 10]], seg(u, 0.4 + i * 0.18, 1.0 + i * 0.18), BAD, 6);
      mono(200, 196, '5XX', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      // DLQ 통이 넘친다
      const bx = 640, by = 330, lv = E(u, 0.6, 1.8);
      el('path', { d: `M${bx - 70},${by - 40} L${bx - 70},${by + 40} L${bx + 70},${by + 40} L${bx + 70},${by - 40}`, fill: 'none', stroke: BAD, 'stroke-width': 3 });
      el('rect', { x: bx - 66, y: by + 36 - 76 * lv, width: 132, height: 76 * lv, fill: BAD, opacity: 0.35 });
      tx(bx, by + 64, 'DLQ', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD });
      for (let i = 0; i < 5; i++) { const f = seg(u, 1.6 + i * 0.15, 2.4 + i * 0.15); if (f > 0 && f < 1) el('circle', { cx: bx + 76 + f * 30, cy: by - 40 + f * f * 70, r: 5, fill: BAD }); }
      tx(820, 120, '가설이 깨졌다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      tx(820, 148, '= 발견', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k4: 피해 반경을 좁혀 반복
    const cx = 270, cy = 250;
    [['확대', 150, OFF], ['운영 1%', 105, WARN], ['staging', 60, GOOD]].forEach(([s, r, col], i) => { const g = E(u, 0.2 + i * 0.35, 0.8 + i * 0.35);
      el('circle', { cx, cy, r: r * g, fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-dasharray': i === 0 ? '8 6' : null });
      tx(cx + (i === 2 ? 0 : 0), cy - r + (i === 2 ? 70 : 24), s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.35) }); });
    tx(520, 350, '안에서부터 바깥으로 넓힌다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
    head(520, 150, '이번 실험에서 배운 것', fade(u, 1.4));
    [['서킷브레이커가 없다', BAD], ['큐 백프레셔를 설계하지 않았다', BAD], ['자동 중단 조건을 먼저 정한다', GOOD]].forEach(([s, col], i) => {
      const y = 196 + i * 44; (col === BAD ? cross : check)(534, y - 6, 9, pop(u, 1.6 + i * 0.25)); tx(556, y, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.25) }); }); }

  // ---------- 2. Chaos Monkey ----------
  const PODX = [330, 450, 570];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) {
      const days = ['월', '화', '수', '목', '금', '토', '일'], x0 = 100, y0 = 90, cw = 54, rh = 26;
      days.forEach((d, i) => tx(x0 + i * cw + cw / 2, y0 - 12, d, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: i > 4 ? OFF : INK }));
      for (let h = 0; h < 10; h++) { if (h % 2 === 0) mono(x0 - 10, y0 + h * rh + 18, String(8 + h) + '시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
        days.forEach((_, i) => { const on = i < 5 && h >= 1 && h < 9, f = seg(u, 0.2 + i * 0.12, 0.6 + i * 0.12);
          el('rect', { x: x0 + i * cw + 2, y: y0 + h * rh + 2, width: cw - 4, height: rh - 4, rx: 3, fill: on ? ACC : SOFT, opacity: on ? 0.25 + 0.55 * f : 1 }); }); }
      tx(x0 + 2.5 * cw, y0 + 10 * rh + 28, '평일 9-17시에만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      [['사람이 깨어 있을 때만', '평일 업무 시간'], ['같은 서비스는 한 번에 하나', '동시 종료 금지'], ['제외 목록 허용', '등록된 서비스는 뺀다'], ['하루 한 대', '무작위로 고른다']].forEach(([a, d], i) => {
        const y = 110 + i * 70, s = pop(u, 1.0 + i * 0.3); card(700, y, 330, 56, { rx: 10, stroke: GOOD, sw: 2, s });
        tx(552, y - 2, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.1 + i * 0.3) }); tx(552, y + 19, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1 + i * 0.3) }); }); return; }
    // 파드 3개 + PDB 바닥선
    const floorY = 320;
    zone(250, 128, 400, 222, 'deployment orders (예시 3개)', { stroke: GRID });
    if (k === 1) {
      const ev1 = E(u, 0.5, 1.2);
      PODX.forEach((x, i) => pod(x, 210 + (i === 0 ? ev1 * 120 : 0), 'orders', { s: 1, op: i === 0 ? 1 - ev1 * 0.6 : 1, ghost: i === 0 && ev1 > 0.5 }));
      el('line', { x1: 260, y1: floorY - 40, x2: 640, y2: floorY - 40, stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '10 6', opacity: fade(u, 0.2) });
      mono(645, floorY - 34, 'minAvailable: 2', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      tx(110, 150, 'drain', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      grow(140, 170, PODX[0] - 50, 200, E(u, 0.3, 0.6), INFO);
      grow(140, 190, PODX[1] - 50, 216, E(u, 1.4, 1.8), INFO);
      if (u > 1.8) { lock(PODX[1], 96, true, WARN, pop(u, 1.8)); tx(PODX[1] + 26, 102, 'eviction 거절: 2개 아래로 못 간다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN }); }
      tx(480, 392, 'kubectl delete는 PDB를 거치지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 2) {
      PODX.forEach((x) => pod(x, 210, 'orders'));
      clock(130, 140, 46, E(u, 0.2, 1.4) * (10.5 / 12), ACC, '10:30');
      mono(780, 150, '"30 10 * * 1-5"', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      ['분 30', '시 10', '월~금'].forEach((s, i) => pill(700 + i * 80, 196, s, MUT, pop(u, 1.0 + i * 0.2), { fs: 13.5 }));
      tx(780, 262, 'chaos-killer CronJob', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(480, 392, '자동화하지 않으면 결국 안 하게 된다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3) {
      const pick = u < 1.0 ? Math.floor(u * 9) % 3 : 1, gone = E(u, 1.3, 1.7);
      PODX.forEach((x, i) => pod(x, 210, 'orders', { dead: i === 1 && u > 1.3, deadS: pop(u, 1.3), col: i === pick && u < 1.3 ? ACC : INK, op: i === 1 ? 1 - gone * 0.5 : 1 }));
      mono(450, 106, u < 1.0 ? 'shuf -n 1 …' : 'ready 3 > 2 → delete', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
      pod(PODX[1], 300, 'orders', { s: pop(u, 1.9), col: GOOD, fill: 'var(--goodbg)' }); mono(PODX[1] + 60, 305, '새 파드', { 'font-size': 14, fill: GOOD, opacity: fade(u, 2.0) });
      // P95 잠깐 +30ms
      const ax = axes(720, 160, 200, 130, { x: [0, 10], y: [200, 300], yt: [200, 250, 300], yl: 'P95 ms' });
      line(ax, [[0, 250], [3, 250], [4, 280], [6, 280], [7, 250], [10, 250]], E(u, 1.4, 2.6), WARN, { sw: 2.6 });
      mono(ax.X(5), ax.Y(280) - 10, '+30ms', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) }); return; }
    // k4: PDB 없는 서비스
    PODX.forEach((x) => pod(x, 210, 'orders'));
    el('line', { x1: 260, y1: floorY - 40, x2: 640, y2: floorY - 40, stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '10 6' }); check(620, 300, 10, 1);
    zone(690, 140, 240, 210, 'PDB 없는 서비스', { stroke: BAD, dash: '6 5' });
    [740, 810, 880].forEach((x, i) => pod(x, 210, 'svc', { w: 60, dead: u > 0.6 + i * 0.4, deadS: pop(u, 0.6 + i * 0.4) }));
    tx(810, 300, 'drain + kill이 겹치면', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    tx(810, 324, '한꺼번에 0개', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
    pill(480, 395, 'PDB 누락 목록 → 과제로', ACC, pop(u, 2.1), { fs: 15 }); }

  // ---------- 3. chaos-mesh ----------
  function crd(kind, rows, o) { o = o || {}; el('rect', { x: 40, y: 60, width: 330, height: 300, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(58, 90, 'kind: ' + kind, { 'font-size': 16, 'font-weight': 800, fill: INFO });
    rows.forEach(([kk, v, hot], i) => { const y = 132 + i * 40, op = o.u == null ? 1 : fade(o.u, 0.2 + i * 0.2);
      if (hot) el('rect', { x: 50, y: y - 22, width: 310, height: 32, rx: 6, fill: ACCBG, opacity: op });
      mono(62, y, kk, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: op }); mono(62 + tw(kk, 15) + 10, y, v, { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : INK, opacity: op }); }); }
  function nsMap(o) { o = o || {};
    zone(420, 70, 240, 250, 'ns: payments', { stroke: GRID });
    zone(690, 70, 240, 250, 'ns: shop', { stroke: GRID });
    [0, 1].forEach((i) => pod(540, 140 + i * 80, 'payments', { w: 120, col: o.payCol, dead: o.payDead === i }));
    [0, 1].forEach((i) => pod(810, 140 + i * 80, 'orders', { w: 120, col: o.ordCol, dead: o.ordDead === i, deadS: o.deadS })); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      crd('NetworkChaos', [['name:', 'payments-latency-exp'], ['action:', 'delay', true], ['mode:', 'all']], { u });
      ['delay', 'loss', 'corrupt', 'partition'].forEach((s, i) => pill(520 + (i % 2) * 190, 150 + Math.floor(i / 2) * 64, s, i === 0 ? ACC : MUT, pop(u, 0.8 + i * 0.2), { mono: true, fs: 15, fill: i === 0 ? 'var(--newbg)' : null }));
      tx(615, 300, 'kubectl apply로 시작', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(615, 328, 'delete로 즉시 되돌린다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { nsMap({ payCol: u > 1.2 ? ACC : INK });
      const r = E(u, 0.6, 1.4); el('ellipse', { cx: 540, cy: 180, rx: 104 * r, ry: 112 * r, fill: ACCBG, opacity: 0.4, stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '8 5' });
      mono(150, 160, 'selector:', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      mono(170, 190, 'namespaces: [payments]', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      mono(170, 220, 'app: payments', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      tx(540, 360, '이 원이 피해 반경이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      tx(810, 360, 'shop은 건드리지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 2) {
      pod(200, 180, 'payments', { w: 130, col: WARN });
      card(720, 180, 190, 60, { rx: 10, stroke: INK, sw: 2.4, text: 'stripe-gateway', mono: true, fs: 15, fw: 700 });
      el('line', { x1: 265, y1: 180, x2: 625, y2: 180, stroke: GRID, 'stroke-width': 3 });
      for (let i = 0; i < 3; i++) dot([[265, 180], [625, 180]], ((t * 0.18 + i / 3) % 1), WARN, 6);
      mono(445, 162, '+2s', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.3) });
      // 5분 타이머 막대
      const f = E(u, 0.5, 2.0); el('rect', { x: 160, y: 270, width: 600, height: 18, rx: 9, fill: SOFT }); el('rect', { x: 160, y: 270, width: 600 * f, height: 18, rx: 9, fill: WARN, opacity: 0.8 });
      mono(160, 260, 'duration: "5m"', { 'font-size': 15, 'font-weight': 700, fill: WARN }); if (f > 0.98) { tx(780, 285, '자동 종료', { 'font-size': 15, 'font-weight': 800, fill: GOOD }); }
      pill(460, 350, '실제: Istio retry/timeout으로 부분 회복, 일부 5XX', BAD, pop(u, 2.1), { fs: 14 }); return; }
    if (k === 3) { nsMap({ ordDead: u > 1.0 ? 0 : -1, deadS: pop(u, 1.0), ordCol: INK });
      crd('PodChaos', [['action:', 'pod-kill', true], ['mode:', 'one', true], ['cron:', '"@every 10m"']]);
      tx(810, 360, 'mode one → 한 번에 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); return; }
    if (k === 4) {
      crd('StressChaos', [['app:', 'orders'], ['cpu load:', '90', true], ['duration:', '"3m"', true]]);
      const cpu = 90 * E(u, 0.3, 1.2); tx(430, 110, 'CPU', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      el('rect', { x: 430, y: 124, width: 460, height: 26, rx: 6, fill: SOFT }); el('rect', { x: 430, y: 124, width: 460 * cpu / 100, height: 26, rx: 6, fill: BAD, opacity: 0.8 });
      mono(430 + 460 * cpu / 100 - 8, 143, Math.round(cpu) + '%', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: PANEL });
      tx(430, 210, 'P95', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const p = lerp(0.45, 0.78, E(u, 1.0, 2.0)); el('rect', { x: 430, y: 224, width: 460, height: 26, rx: 6, fill: SOFT }); el('rect', { x: 430, y: 224, width: 460 * p, height: 26, rx: 6, fill: WARN, opacity: 0.8 });
      el('line', { x1: 430 + 460 * 0.88, y1: 214, x2: 430 + 460 * 0.88, y2: 262, stroke: BAD, 'stroke-width': 3 }); tx(430 + 460 * 0.88, 282, 'SLO 임계', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD });
      tx(660, 340, '올랐지만 선 안쪽 · HPA 임계 재검토', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k5: 세 겹 종료 조건
    [['duration 도달', 'clock'], ['지표 확인 실패', 'chart'], ['사람이 수동 중단', 'hand']].forEach(([s, ic], i) => { const y = 110 + i * 100, sc = pop(u, 0.2 + i * 0.35);
      card(230, y, 300, 70, { rx: 12, stroke: INK, sw: 2.2, s: sc });
      if (ic === 'clock') clock(125, y, 20, E(u, 0.3, 1.0), WARN); else if (ic === 'chart') { el('polyline', { points: `110,${y + 12} 120,${y + 2} 130,${y + 8} 142,${y - 14}`, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: sc }); } else { el('rect', { x: 110, y: y - 14, width: 30, height: 28, rx: 5, fill: BAD, opacity: sc }); }
      tx(160, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) });
      grow(385, y, 600, 210, E(u, 1.0 + i * 0.25, 1.5 + i * 0.25), MUT); });
    card(720, 210, 200, 80, { rx: 14, stroke: GOOD, sw: 3, fill: 'var(--goodbg)', text: '실험 종료', fs: 19, fw: 800, color: GOOD, s: pop(u, 1.9) });
    tx(720, 290, '어느 쪽으로든 끈다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }

  // ---------- 4. Game Day ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) {
      card(220, 120, 300, 110, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.2) });
      mono(220, 108, '2026-06-15 (월)', { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      mono(220, 142, '11:00 — 12:00 KST', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(220, 230, '시나리오: AZ-a 네트워크 단절', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
      const P = [['SRE', 2, ACC], ['orders 팀', 2, INK], ['payments 팀', 1, INK], ['매니저', 1, MUT]]; let n = 0;
      P.forEach(([name, cnt, col], gi) => { for (let j = 0; j < cnt; j++, n++) person(500 + n * 68, 140, null, { s: pop(u, 0.9 + n * 0.15), stroke: col });
        const mid = 500 + (n - cnt / 2 - 0.5) * 68; tx(mid, 200, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.2 + gi * 0.15) }); });
      tx(670, 270, '6명 · 미리 알리고 모인다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) });
      tx(480, 360, '기습 훈련은 신뢰를 깎는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 1) {
      [['30초 안에 장애 감지', 'Route53 health check'], ['다른 AZ가 트래픽 흡수', 'multi-AZ'], ['5분 안에 P95 회복', '목표 시간'], ['SLO 99.9% 유지', '가용성']].forEach(([a, d], i) => {
        const x = 130 + i * 233, s = pop(u, 0.2 + i * 0.35); card(x, 190, 210, 150, { rx: 12, stroke: INK, sw: 2.2, s });
        tx(x, 150, String(i + 1), { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 0.3 + i * 0.35) });
        tx(x, 200, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.35) });
        tx(x, 228, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) });
        pill(x, 300, '검증 대기', MUT, pop(u, 1.8 + i * 0.1), { fs: 13.5 }); });
      tx(480, 60, '한 문장에 하나씩 · 어디서 틀렸는지 짚을 수 있게', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) {
      const XI = (i) => 110 + i * 148, y = 210, TL = [[0, '주입', 'SRE-A'], [1, '대시보드', 'SRE-B'], [2, '알람 확인', '모두'], [5, 'runbook', 'on-call'], [30, '종료', 'SRE-A'], [35, '회고', '모두']];
      el('line', { x1: XI(0), y1: y, x2: XI(0) + (XI(5) - XI(0)) * E(u, 0.1, 1.6), y2: y, stroke: INK, 'stroke-width': 3 });
      TL.forEach(([m, s, who], i) => { const at = 0.1 + (i / 5) * 1.5, op = fade(u, at, 0.2), up = i % 2 === 0, X = () => XI(i);
        el('circle', { cx: X(m), cy: y, r: 7 * pop(u, at), fill: i === 0 ? WARN : ACC });
        mono(X(m), up ? y - 70 : y + 46, '11:' + String(m).padStart(2, '0'), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: op });
        tx(X(m), up ? y - 48 : y + 68, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: op });
        tx(X(m), up ? y - 26 : y + 90, who, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); });
      tx(480, 370, '담당이 빈 칸이 실제 사고의 공백이 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 3) {
      [['주문 성공률', '90% 아래면 중단', 0.35], ['DLQ 메시지', '10,000 넘으면 중단', 0.25], ['CS 인입', '폭증하면 중단', 0.2]].forEach(([n, d, v], i) => {
        const y = 100 + i * 95, f = E(u, 0.3 + i * 0.3, 1.2 + i * 0.3);
        tx(80, y, n, { 'font-size': 16, 'font-weight': 800 }); tx(80, y + 24, d, { 'font-size': 14, fill: BAD, 'font-weight': 600 });
        el('rect', { x: 320, y: y - 16, width: 420, height: 24, rx: 6, fill: SOFT });
        el('rect', { x: 320, y: y - 16, width: 420 * v * f, height: 24, rx: 6, fill: GOOD, opacity: 0.75 });
        el('line', { x1: 320 + 420 * 0.8, y1: y - 24, x2: 320 + 420 * 0.8, y2: y + 16, stroke: BAD, 'stroke-width': 3 });
        tx(760, y + 2, '미도달', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3 + i * 0.3) }); });
      tx(530, 90 - 30, '빨간 선 = kill switch', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(480, 390, '중단 기준은 훈련 전에 숫자로 합의한다 (막대 길이는 모양만 보인 예시)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k4: 12분 vs 목표 5분 + 액션 아이템
    const X = (m) => 120 + m * 40;
    tx(60, 70, 'failover 걸린 시간', { 'font-size': 16, 'font-weight': 800 });
    for (let m = 0; m <= 12; m += 2) mono(X(m), 150, m + '분', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    el('rect', { x: X(0), y: 92, width: (X(12) - X(0)) * E(u, 0.2, 1.3), height: 32, rx: 6, fill: BAD, opacity: 0.8 });
    el('line', { x1: X(5), y1: 82, x2: X(5), y2: 134, stroke: GOOD, 'stroke-width': 3.5 }); mono(X(5), 76, '목표 5분', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
    mono(X(12) + 12, 114, '12분', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
    [['cert rotation 자동화 없음', 'cert-manager 도입', 'SRE-A · 7/1'], ['Slack 알람 채널 잘못 설정', 'Alertmanager routes 수정', 'SRE-B · 6/20']].forEach(([f, a, who], i) => {
      const y = 220 + i * 80; cross(76, y, 9, pop(u, 1.4 + i * 0.3)); tx(96, y + 5, f, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.3) });
      grow(400, y, 470, y, E(u, 1.7 + i * 0.3, 2.0 + i * 0.3), ACC);
      card(640, y, 300, 52, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.9 + i * 0.3) });
      tx(505, y - 2, a, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0 + i * 0.3) }); mono(505, y + 18, who, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0 + i * 0.3) }); });
    tx(820, 160, '✓ Route53 · ✓ multi-AZ', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }

  // ---------- 5. 분기 사이클 ----------
  const WK = [['1주', '회고 · 새 가설'], ['2-3주', 'staging 실험'], ['4주', '운영 1%'], ['5주', 'Game Day'], ['6주', '자동화 보강']];
  function cbState(cx, cy, cur, u) { const S = [['닫힘', GOOD], ['열림', BAD], ['반열림', WARN]];
    S.forEach(([s, col], i) => { const x = cx + (i - 1) * 120, on = s === cur;
      el('circle', { cx: x, cy, r: 36, fill: on ? col : PANEL, stroke: col, 'stroke-width': 3, opacity: on ? 0.9 : 1 });
      tx(x, cy + 6, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: on ? PANEL : col }); });
    grow(cx - 82, cy - 18, cx - 40, cy - 18, 1, MUT); grow(cx + 38, cy - 18, cx + 80, cy - 18, 1, MUT); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) {
      const cx = 300, cy = 220, r = 140, A = (i) => -Math.PI / 2 + (i / 6) * 2 * Math.PI, wk = [1, 2, 1, 1, 1];
      let w0 = 0; WK.forEach(([w, s], i) => { const a0 = A(w0), a1 = A(w0 + wk[i]) - 0.06, g = E(u, 0.2 + i * 0.35, 0.6 + i * 0.35), a1g = lerp(a0, a1, g);
        if (g > 0) el('path', { d: `M${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${a1g - a0 > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a1g)},${cy + r * Math.sin(a1g)}`, fill: 'none', stroke: i === 3 ? WARN : ACC, 'stroke-width': 22, opacity: 0.85 });
        const am = A(w0 + wk[i] / 2), lx = cx + (r + 46) * Math.cos(am), ly = cy + (r + 40) * Math.sin(am);
        mono(lx, ly - 4, w, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': Math.cos(am) > 0.2 ? 'start' : Math.cos(am) < -0.2 ? 'end' : 'middle', opacity: fade(u, 0.4 + i * 0.35) });
        tx(lx, ly + 16, s, { 'font-size': 14, 'text-anchor': Math.cos(am) > 0.2 ? 'start' : Math.cos(am) < -0.2 ? 'end' : 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.35) });
        w0 += wk[i]; });
      tx(cx, cy - 4, '6주', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800 }); tx(cx, cy + 24, '한 바퀴', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT });
      tx(640, 200, '분기마다 다시 돈다', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 2.0) });
      tx(640, 230, '일정이 없으면 늘 다음 분기로 밀린다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 1) {
      [['가용성', '사용자에게 안 보인다'], ['MTTR', '5분 안에 자동 회복'], ['페일오버', '우회 경로가 동작'], ['격리', '두 의존성이 죽어도 부분 기능']].forEach(([a, d], i) => {
        const x = 130 + i * 233, on = i === 2, s = pop(u, 0.2 + i * 0.3);
        card(x, 150, 210, 110, { rx: 12, stroke: on && u > 1.4 ? ACC : INK, sw: on && u > 1.4 ? 3 : 2, s, fill: on && u > 1.4 ? 'var(--newbg)' : PANEL });
        tx(x, 140, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
        tx(x, 170, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      card(480, 300, 640, 60, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 1.6) });
      tx(480, 306, '이번 분기: payments 5초 지연 때 서킷브레이커가 동작한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      tx(480, 370, '가설은 지난 분기의 미해결 발견에서 뽑는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 2) {
      server(110, 150, 'orders', { lamp: GOOD });
      card(560, 110, 170, 60, { rx: 12, stroke: BAD, sw: 2.4, text: 'payments +5s', fs: 15, fw: 800, color: BAD, mono: true });
      card(560, 210, 170, 56, { rx: 12, stroke: GOOD, sw: 2.4, text: '캐시 fallback', fs: 15, fw: 800, color: GOOD, fill: 'var(--goodbg)', s: pop(u, 1.4) });
      el('line', { x1: 170, y1: 130, x2: 470, y2: 110, stroke: u > 1.2 ? OFF : GRID, 'stroke-width': 2.5, 'stroke-dasharray': u > 1.2 ? '6 6' : null });
      grow(170, 170, 470, 210, E(u, 1.4, 1.9), GOOD);
      cbState(480, 330, u < 1.2 ? '닫힘' : '열림', u);
      tx(480, 390, '서킷 열림 · fallback · SLO 유지', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
      tx(760, 150, '트래픽 2배', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(760, 176, '+ payments 지연', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) }); return; }
    if (k === 3) {
      [['사고 빈도', '↓', GOOD], ['MTTR', '↓', GOOD], ['SLO 안정성', '유지', GOOD], ['온콜 부담', '↓', GOOD]].forEach(([n, v, col], i) => {
        const x = 130 + i * 233, s = pop(u, 0.2 + i * 0.35); card(x, 190, 210, 160, { rx: 12, stroke: col, sw: 2.2, s });
        tx(x, 150, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) });
        tx(x, 220, v, { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.35) }); });
      tx(480, 330, '경영진이 읽을 수 있는 숫자로 값어치를 말한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(480, 360, '자다가 깨는 횟수도 하나의 지표다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k4: 위험 관리 4원칙 + 다음 분기
    [['kill switch를 늘 건다', '자동 중단 지표'], ['반경을 점진적으로 넓힌다', 'staging → 1% → 확대'], ['사용자 영향 지표로 즉시 abort', ''], ['Game Day는 발표 + 매니저 승인', '']].forEach(([a, d], i) => {
      const y = 90 + i * 64; check(80, y - 6, 10, pop(u, 0.2 + i * 0.3)); tx(102, y, a, { 'font-size': 16.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) });
      if (d) tx(102, y + 22, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
    const g = E(u, 1.5, 2.3); if (g > 0) { const pts = []; for (let i = 0; i <= 40; i++) { const a = Math.PI / 2 + i / 40 * g * 1.7 * Math.PI; pts.push(`${720 + 130 * Math.cos(a)},${220 + 90 * Math.sin(a)}`); }
      el('polyline', { points: pts.join(' '), fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '8 6' }); }
    tx(720, 350, '학습이 자동화로 남아야 강해진다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) });
    pill(720, 220, '다음 분기: DB failover', ACC, pop(u, 1.8), { fs: 15 }); }

  const quiz = [
    { q: '카오스 실험에서 장애를 주입하기 전에 가장 먼저 하는 일은 무엇인가?',
      o: ['평소 상태를 성공률·P95 같은 숫자로 적는다', '가장 큰 장애부터 운영에 주입한다', '서킷브레이커를 먼저 단다'], a: 0,
      why: '주문 성공률 99.5%, P95 250ms, DLQ 0처럼 기준선이 있어야 무엇이 깨졌는지 말할 수 있다.' },
    { q: 'PodDisruptionBudget minAvailable 2가 막아 주는 것은 무엇인가?',
      o: ['kubectl delete로 직접 지우는 것', 'drain 같은 eviction이 파드를 2개 아래로 내리는 것', '파드가 스스로 죽는 것'], a: 1,
      why: 'PDB는 eviction API를 거치는 자발적 중단에만 걸린다. 그래서 chaos-killer 스크립트는 ready 수를 직접 확인한다.' },
    { q: 'chaos-mesh 실험에서 피해 반경을 정하는 필드는 무엇인가?',
      o: ['action', 'selector', 'duration'], a: 1,
      why: 'namespaces와 labelSelectors가 대상 파드를 고른다. 이 줄을 넓게 쓰면 실험이 장애가 된다.' },
    { q: 'Game Day에서 failover가 12분 걸렸다(목표 5분). 이 발견의 다음 순서는 무엇인가?',
      o: ['담당자와 기한이 붙은 과제로 옮긴다', '다음 Game Day를 취소한다', '목표를 12분으로 바꾼다'], a: 0,
      why: 'cert-manager 도입(SRE-A, 7/1)처럼 발견을 액션 아이템으로 바꾸는 것이 Game Day의 산출물이다.' },
    { q: '분기 사이클의 6주차에 하는 일은 무엇인가?',
      o: ['운영 1% 트래픽 실험', 'Game Day', '발견 사항을 자동화로 보강'], a: 2,
      why: '1주 회고, 2-3주 staging, 4주 운영 1%, 5주 Game Day, 6주 자동화 보강 순서로 돈다.' },
  ];

  const summary = [
    '카오스 실험은 평소 상태를 숫자로 적고, 반증 가능한 가설을 세운 뒤 장애를 주입한다.',
    '가설이 깨지면 발견이다. 결제 다운 실험에서 서킷브레이커 부재가 드러났다.',
    'kubectl delete는 PDB를 거치지 않는다. 남은 파드 수 확인과 PDB를 함께 건다.',
    'chaos-mesh는 selector로 피해 반경을, duration으로 자동 종료를 YAML에 적는다.',
  ];
  const review = [
    { q: '운영에서 처음 카오스 실험을 하려 한다. 가장 먼저 확인할 것은?',
      o: ['SLO와 모니터링으로 평소 상태를 잴 수 있는가', '실험할 장애 종류가 몇 개인가', '모든 서비스에 Chaos Monkey가 깔렸는가'], a: 0,
      why: '기준선 없이 주입하면 무엇이 깨졌는지 모른다. 그래서 실험은 SLO와 모니터링이 갖춰진 뒤에 시작한다.' },
    { q: 'chaos-mesh로 payments에 2초 지연을 주고 퇴근했다. 실험이 계속 돌까 걱정된다. 무엇을 확인해야 하나?',
      o: ['selector의 namespaces', 'duration 필드', 'mode 값'], a: 1,
      why: 'duration "5m"이 있으면 5분 뒤 알아서 끝난다. 지표 확인 실패나 수동 중단은 그 위에 더하는 안전장치다.' },
    { q: 'Game Day 도중 주문 성공률이 88%로 떨어졌다. 이 챕터의 runbook대로라면?',
      o: ['회고 시간까지 지켜본다', '즉시 중단한다', 'on-call에게 넘기고 계속한다'], a: 1,
      why: '주문 성공률 90% 미만은 kill switch 조건이다. 훈련 전에 합의한 숫자라 논쟁 없이 멈춘다.' },
  ];

  R.page({ title: '카오스 실험 카드', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
