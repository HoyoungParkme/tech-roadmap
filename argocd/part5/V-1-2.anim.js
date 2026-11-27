/* V-1-2 Canary vs Blue-Green · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * canary 파드 수는 trafficRouting 이 있을 때의 규칙(canary = ceil(weight × 8 / 100), stable 8 그대로)을
 * argo-rollouts utils/replicaset/canary.go 에서 옮겨 계산했다: 5% → 1, 25% → 2, 50% → 4, 100% → 8.
 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, person, cross, check, clock, terminal, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KC = { S: INFO, C: ACC, B: INFO, G: GOOD, X: BAD };
  function pod(cx, cy, kind, o) { o = o || {}; const z = o.z || 22, s = o.s ?? 1;
    if (!kind) { el('rect', { x: cx - z / 2, y: cy - z / 2, width: z, height: z, rx: 5, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }); return; }
    if (s <= 0) return; const g = R.G(cx, cy, s, o.op); el('rect', { x: -z / 2, y: -z / 2, width: z, height: z, rx: 5, fill: KC[kind] }, g); }
  // 사용자 20명 줄: 새 버전을 보는 사람 수만큼 색이 바뀐다 (골고루 흩어지게)
  function users(x, y, n, nNew, col, o) { o = o || {};
    for (let i = 0; i < n; i++) { const isNew = (i * 7) % n < nNew, cx = x + (i % (o.cols || n)) * (o.gap || 19), cy = y + Math.floor(i / (o.cols || n)) * 24;
      el('circle', { cx, cy: cy - 6, r: 5, fill: isNew ? col : (o.old || INFO), opacity: o.op ?? 1 });
      el('path', { d: `M${cx - 7},${cy + 8} Q${cx - 7},${cy} ${cx},${cy} Q${cx + 7},${cy} ${cx + 7},${cy + 8} Z`, fill: isNew ? col : (o.old || INFO), opacity: o.op ?? 1 }); } }
  const cPods = (w) => Math.ceil(w * 8 / 100);   // trafficRouting 이 있을 때 canary 파드 수 (replicas 8)
  function ladder(x, y, rows, cur, o) { o = o || {}; const rh = o.rh || 38, w = o.w || 236;
    tx(x, y - 12, 'canary.steps', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
    rows.forEach((r, i) => { const yy = y + i * rh, done = i < cur, on = i === cur, cy = yy + rh / 2 - 2, oc = o.onCol || ACC;
      if (on) el('rect', { x: x - 6, y: yy, width: w, height: rh - 5, rx: 7, fill: o.onBg || ACCBG, stroke: oc, 'stroke-width': 1.5 });
      mono(x + 22, cy + 5, '- ' + r, { 'font-size': 14.5, fill: on ? oc : done ? MUT : INK, 'font-weight': on ? 700 : 500 });
      if (done) check(x + 8, cy, 6); else el('circle', { cx: x + 8, cy, r: 4.5, fill: on ? oc : GRID }); }); }
  const dim = (x, y, w, h) => el('rect', { x, y, width: w, height: h, fill: PANEL, opacity: 0.68 });

  // =========== 1. 두 전략의 갈림길 ===========
  function laneC(t, u, pct, o) { o = o || {}; const y = 96;
    zone(24, 40, 912, 156, null);
    lbl(84, 76, 'Canary', 1, { fill: ACC, 'font-size': 17 });
    users(160, y, 20, Math.round(pct / 5), ACC);
    mono(160, y + 40, `새 버전을 보는 사용자 ${Math.round(pct)}%`, { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
    for (let i = 0; i < 8; i++) pod(600 + i * 30, 86, 'S');
    const cn = cPods(pct); for (let i = 0; i < 8; i++) pod(600 + i * 30, 120, i < cn ? 'C' : null);
    mono(600 - 14, 160, `파드 8 + canary ${cn}`, { 'font-size': 14, 'font-weight': 700 }); }
  function laneB(t, u, active, ready, o) { o = o || {}; const y = 262;
    zone(24, 210, 912, 170, null);
    lbl(98, 246, 'Blue-Green', 1, { fill: GOOD, 'font-size': 17 });
    users(160, y + 6, 20, active === 'green' ? 20 : 0, GOOD);
    mono(160, y + 46, active === 'green' ? '모두 green(v2)' : '모두 blue(v1)', { 'font-size': 14.5, 'font-weight': 700, fill: active === 'green' ? GOOD : INFO });
    for (let i = 0; i < 8; i++) pod(600 + i * 30, 252, 'B');
    for (let i = 0; i < 8; i++) pod(600 + i * 30, 290, ready ? 'G' : null, { s: o.popG ? o.popG(i) : 1 });
    // 스위치: blue 줄 또는 green 줄을 가리킨다
    const a = o.sw != null ? o.sw : active === 'green' ? 1 : 0, sy = lerp(252, 290, a);
    el('circle', { cx: 556, cy: 271, r: 6, fill: INK }); el('line', { x1: 556, y1: 271, x2: 584, y2: sy, stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    mono(600 - 14, 330, ready ? '파드 8 + 8 = 2배' : '파드 8', { 'font-size': 14, 'font-weight': 700, fill: ready ? WARN : INK }); }
  const zone = R.zone;
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || b;
    if (k === 0) { // RollingUpdate: 새 버전이 곧바로 퍼진다
      lbl(480, 64, '기본 RollingUpdate', 1, { 'font-size': 17 });
      const n = Math.round(lerp(0, 20, E(u, 0.2, 1.6)));
      users(290, 140, 20, n, ACC, { gap: 20 });
      mono(480, 196, `새 버전을 보는 사용자 ${n * 5}%`, { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC });
      if (u > 1.7) { [2, 9, 15].forEach((i, j) => cross(290 + i * 20, 112, 7, pop(u, 1.7 + j * 0.15))); }
      clock(400, 290, 26, E(u, 2.0, 2.9), WARN);
      tx(440, 286, '되돌리려면 이미지를 바꿔 다시 롤아웃', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(440 + 140, 312, '수 분 걸린다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    const pc = tween(p.canary && p.canary.newPct, b.canary.newPct, u), bg = b.bluegreen;
    laneC(t, u, pc);
    const swA = p.bluegreen && p.bluegreen.active !== bg.active ? (bg.active === 'green' ? E(u, 0.6, 1.2) : 1 - E(u, 0.6, 1.2)) : null;
    laneB(t, u, swA == null ? bg.active : swA > 0.5 ? 'green' : 'blue', bg.greenReady, { sw: swA, popG: k === 2 ? (i) => pop(u, 0.3 + i * 0.08) : null });
    if (b.focus === 'canary') dim(24, 210, 912, 170);
    if (b.focus === 'bluegreen') dim(24, 40, 912, 156);
    if (k === 3) { pill(800, 160, '다운타임 0', GOOD, pop(u, 1.4), { fs: 14 }); pill(800, 330, '다운타임 0', GOOD, pop(u, 1.6), { fs: 14 }); }
    if (k === 4) { dim(560, 40, 376, 340);
      [['점진 검증', 'Canary', ACC], ['즉시 전환 · 롤백', 'Blue-Green', GOOD], ['리소스가 빠듯하다', 'Canary', ACC]].forEach(([a, s2, col], i) => { const y = 110 + i * 92, s = pop(u, 0.3 + i * 0.4);
        card(748, y, 340, 60, { rx: 12, stroke: col, sw: 2, s });
        tx(600, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
        tx(898, y + 6, s2, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.4) }); }); }
    if (k === 5) banner(480, 203, '점진적으로 검증할까, 통째로 갈아탈까', pop(u, 0.4)); }

  // =========== 2. Canary ===========
  const ST2 = ['setWeight: 5', 'pause: {duration: 2m}', 'setWeight: 25', 'pause: {}', 'setWeight: 50', 'pause: {duration: 5m}', 'setWeight: 100'];
  function s2(t, c) { const { k, u } = c, b = c.beat.canary, p = (c.prev && c.prev.canary) || b;
    const cur = [-1, -1, -1, 0, 3, 7, 4, 3][k];
    ladder(36, 72, ST2, cur, { onCol: k === 4 || k === 7 ? WARN : ACC, onBg: k === 4 || k === 7 ? WARNBG : ACCBG });
    let w = tween(p.newPct, b.newPct, u);
    if (k === 5) w = u < 0.9 ? lerp(25, 50, E(u, 0.2, 0.8)) : lerp(50, 100, E(u, 1.2, 2.0));
    if (k === 7) w = lerp(25, 0, E(u, 1.0, 1.8));
    // 파드: stable 8 그대로, canary 는 비율만큼
    const X0 = 336;
    tx(X0, 74, 'stable (v1)', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
    for (let i = 0; i < 8; i++) pod(X0 + 12 + i * 30, 100, 'S', { s: k === 0 ? pop(u, 0.2 + i * 0.08) : 1 });
    tx(X0, 146, k >= 1 ? 'canary (acme/web:v2)' : 'canary', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: k === 0 ? fade(u, 1.2) : 1 });
    const cn = k === 5 ? cPods(u < 0.9 ? 50 : u < 1.6 ? 50 : 100) : k === 7 ? (u < 1.8 ? 2 : 0) : cPods(b.newPct);
    for (let i = 0; i < 8; i++) pod(X0 + 12 + i * 30, 172, i < cn ? 'C' : null, { s: k === 2 ? pop(u, 0.6) : 1 });
    mono(X0 + 260, 176, `+${cn}`, { 'font-size': 16, 'font-weight': 800, fill: ACC });
    if (k === 0) sub(X0 + 120, 214, '정상 규모 8개만 두 벌 띄우지 않는다', fade(u, 1.4), { 'font-weight': 700, fill: INK });
    // 경로: 사용자 → (nginx) → 두 Service
    const showRoute = k >= 2;
    if (showRoute) { const ux = 680;
      card(ux + 140, 74, 150, 34, { text: 'web-stable', fs: 14, mono: true, stroke: INFO, color: INFO, s: k === 2 ? pop(u, 0.3) : 1 });
      card(ux + 140, 160, 150, 34, { text: 'web-canary', fs: 14, mono: true, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 0.5) : 1 });
      if (k >= 3) { card(ux + 10, 117, 92, 34, { text: 'nginx', fs: 14, mono: true, s: k === 3 ? pop(u, 0.3) : 1 });
        grow(ux + 56, 110, ux + 64, 82, 1, GRID, { plain: true }); grow(ux + 56, 124, ux + 64, 152, 1, GRID, { plain: true });
        mono(ux + 10, 162, `weight ${Math.round(w)}`, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC }); } }
    // 사용자 20명
    if (k >= 2) { tx(336, 262, '사용자 20명 중 새 버전을 보는 사람', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      users(348, 300, 20, Math.round(w / 5), k === 7 && u > 1.0 ? BAD : ACC, { gap: 28 });
      mono(920, 340, Math.round(w) + '%', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); }
    if (k === 1) { pill(520, 270, 'image: acme/web:v2', ACC, pop(u, 0.3), { mono: true, fs: 14 }); sub(520, 310, '아직 트래픽 0%', fade(u, 1.0)); }
    if (k === 6) { const y0 = 72 + 2 * 38, y1 = 72 + 7 * 38 - 8;
      el('path', { d: `M276,${y0} H288 V${y0 + (y1 - y0) * E(u, 0.3, 1.2)}`, fill: 'none', stroke: INFO, 'stroke-width': 3 });
      pill(310, 40, 'analysis: success-rate · startingStep 2', INFO, pop(u, 0.9), { mono: true, fs: 13.5 }); }
    if (k === 7 && u > 1.8) pill(640, 380, '영향받은 사용자 = 25% 구간만', BAD, pop(u, 1.9), { fs: 14 }); }

  // =========== 3. Blue-Green ===========
  const ACT = [250, 132], PRE = [250, 300], BL = [520, 132], GR = [520, 300];
  function env(cx, cy, name, kind, n, o) { o = o || {};
    el('rect', { x: cx - 130, y: cy - 52, width: 260, height: 104, rx: 12, fill: o.fill || SOFT, stroke: KC[kind], 'stroke-width': 2, 'stroke-dasharray': n ? null : '6 5', opacity: o.op ?? 1 });
    tx(cx - 116, cy - 30, name, { 'font-size': 14.5, 'font-weight': 800, fill: KC[kind], opacity: o.op ?? 1 });
    for (let i = 0; i < 8; i++) pod(cx - 98 + (i % 8) * 28, cy + 8, i < n ? kind : null, { s: o.popN ? o.popN(i) : 1, op: o.op }); }
  function s3(t, c) { const { k, u } = c, bgd = c.beat.bluegreen, pb = (c.prev && c.prev.bluegreen) || bgd;
    let a = bgd.active === 'green' ? 1 : 0;
    if (pb.active !== bgd.active) a = bgd.active === 'green' ? E(u, 0.8, 1.4) : 1 - E(u, 0.8, 1.6);
    const greenN = bgd.greenReady ? 8 : 0, blueOp = k === 5 && u > 2.2 ? 0.35 : 1;
    env(BL[0], BL[1], 'blue · v1', 'B', 8, { op: blueOp });
    env(GR[0], GR[1], 'green · v2', 'G', greenN, { popN: k === 1 ? (i) => pop(u, 0.2 + i * 0.08) : null });
    // 서비스와 셀렉터 화살표
    person(70, ACT[1], '사용자');
    el('line', { x1: 100, y1: ACT[1], x2: ACT[0] - 70, y2: ACT[1], stroke: GRID, 'stroke-width': 2.2 });
    const ay = lerp(BL[1], GR[1], a);
    grow(ACT[0] + 70, ACT[1], BL[0] - 136, ay, 1, a > 0.5 ? GOOD : INFO);
    if (greenN) { person(70, PRE[1], 'QA', {}); el('line', { x1: 100, y1: PRE[1], x2: PRE[0] - 70, y2: PRE[1], stroke: GRID, 'stroke-width': 2.2 });
      grow(PRE[0] + 70, PRE[1], GR[0] - 136, GR[1], k === 1 ? E(u, 1.0, 1.6) : 1, GOOD, { dash: '6 4' }); }
    for (let i = 0; i < 10; i++) dot([[100, ACT[1]], [ACT[0] + 70, ACT[1]], [BL[0] - 136, ay]], (t * 0.45 + i / 10) % 1, a > 0.5 ? GOOD : INFO, 4.5);
    card(ACT[0], ACT[1], 140, 40, { text: 'web-active', fs: 14.5, mono: true });
    card(PRE[0], PRE[1], 140, 40, { text: 'web-preview', fs: 14.5, mono: true, stroke: greenN ? GOOD : GRID, color: greenN ? GOOD : MUT });
    // 오른쪽 기둥
    const RX = 800;
    if (k <= 1) { tx(RX, 120, '돌고 있는 파드', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 });
      mono(RX, 160, greenN ? '8 + 8' : '8', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: greenN ? WARN : INK });
      if (greenN) tx(RX, 196, '전환 기간 리소스 2배', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: WARN, opacity: k === 1 ? fade(u, 1.6) : 1 });
      if (k === 1) sub(RX, 300, 'QA는 preview로 green을 먼저 본다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      if (k === 0) sub(RX, 300, 'green은 아직 없다', fade(u, 0.6)); }
    if (k === 2) { lock(RX - 80, 140, true, WARN, pop(u, 0.3)); mono(RX - 56, 147, 'autoPromotionEnabled: false', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
      tx(RX, 210, 'promote 전에는 전환하지 않는다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) }); }
    if (k === 3) { [['prePromotionAnalysis', 'smoke-test', '전환 전'], ['postPromotionAnalysis', 'success-rate', '전환 후']].forEach(([n, tpl, when], i) => { const y = 110 + i * 110, s = pop(u, 0.3 + i * 0.7);
        card(RX, y, 250, 76, { rx: 10, stroke: GOOD, sw: 2, s });
        mono(RX, y - 12, n, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.4 + i * 0.7) });
        tx(RX, y + 16, `${when} · ${tpl}`, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.7) }); }); }
    if (k === 4) { clock(RX, 150, 34, E(u, 1.4, 2.9) * 0.4, INFO);
      mono(RX, 214, 'scaleDownDelaySeconds: 300', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(RX, 244, 'blue는 5분 더 살아 있다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); }
    if (k === 5) { ['green 기동', '사전 분석', 'promote 승인', '셀렉터 전환', '이상 시 blue로', 'blue 축소'].forEach((s, i) => { const y = 64 + i * 52, on = u > 0.3 + i * 0.35;
        card(RX, y, 220, 40, { rx: 20, stroke: on ? GOOD : GRID, fill: on ? GOODBG : PANEL, sw: 1.8 });
        mono(RX - 96, y + 5, String(i + 1), { 'font-size': 15, 'font-weight': 800, fill: on ? GOOD : MUT });
        tx(RX - 76, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: on ? INK : MUT }); }); }
    if (k === 6) terminal(660, 250, 290, 110, ['$ kubectl argo rollouts', '    promote web-bluegreen', '$ kubectl argo rollouts', '    undo web-bluegreen'], lerp(0, 4, E(u, 0.2, 1.6)), { fs: 13.5, lh: 18 });
    if (k === 6) tx(805, 120, 'blue 리비전으로 되돌림', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) }); }

  // =========== 4. 다섯 축 비교 ===========
  const AX = ['트래픽 전환', '롤백', '리소스', '폭발 반경', '검증'], CX = 440, BX = 740, RY = (i) => 104 + i * 58;
  function stair(x, y, steps, col, u) { // 작은 계단: 0 → 100
    const pts = steps.reduce((a, v, i) => a.concat([[x + i * 24, y - v * 0.36], [x + (i + 1) * 24, y - v * 0.36]]), [[x, y]]);
    const n = Math.max(2, Math.ceil(pts.length * clamp(u))); el('polyline', { points: pts.slice(0, n).map((q) => q.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.6 }); }
  function cell(i, side, u) { const x = side ? BX : CX, y = RY(i), col = side ? GOOD : ACC;
    if (i === 0) { stair(x - 110, y + 16, side ? [0, 100, 100, 100] : [5, 25, 50, 100], col, u); tx(x + 10, y + 5, side ? '즉시 (스위치)' : '점진 5→100%', { 'font-size': 14.5, 'font-weight': 700 }); }
    if (i === 1) { tx(x - 110, y + 5, side ? '셀렉터 복귀' : 'weight → 0', { 'font-size': 14.5, class: 'mono', 'font-weight': 700, fill: col }); tx(x + 30, y + 5, side ? '즉시' : '빠름', { 'font-size': 14.5, 'font-weight': 700 }); }
    if (i === 2) { const n = side ? 16 : 10; for (let j = 0; j < n; j++) pod(x - 104 + j * 13, y, j < 8 ? (side ? 'B' : 'S') : (side ? 'G' : 'C'), { z: 10, s: pop(u, j * 0.04) });
      mono(x + 116, y + 5, side ? '8 + 8' : '8 + 2', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' }); }
    if (i === 3) { users(x - 104, y + 2, 10, side ? 10 : 1, side ? GOOD : ACC, { gap: 14 }); tx(x + 46, y + 5, side ? '전체 일괄' : '소수', { 'font-size': 14.5, 'font-weight': 700 }); }
    if (i === 4) tx(x - 110, y + 5, side ? '전환 전 preview' : '실사용자 트래픽', { 'font-size': 14.5, 'font-weight': 700, fill: col }); }
  function s4(t, c) { const { k, u } = c;
    const filled = [0, 2, 4, 5, 5, 5, 5][k], prevF = [0, 0, 2, 4, 5, 5, 5][k];
    const hiC = k === 4 || k === 6, hiB = k === 5 || k === 6;
    if (hiC) el('rect', { x: CX - 135, y: 40, width: 270, height: 336, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.2) });
    if (hiB) el('rect', { x: BX - 135, y: 40, width: 270, height: 336, rx: 12, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, k === 6 ? 0.4 : 0.2) });
    lbl(CX, 64, 'Canary', 1, { fill: ACC, 'font-size': 17 }); lbl(BX, 64, 'Blue-Green', 1, { fill: GOOD, 'font-size': 17 });
    AX.forEach((a, i) => { const y = RY(i);
      tx(46, y + 5, a, { 'font-size': 16, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2 + i * 0.2) : 1 });
      el('line', { x1: 40, y1: y + 29, x2: 900, y2: y + 29, stroke: GRID, 'stroke-width': 1 });
      if (i < filled) { const old = i < prevF, st = 0.3 + (i - prevF) * 0.7, uu = old ? 1 : seg(u, st, st + 0.8);
        if (uu > 0) { cell(i, 0, uu); cell(i, 1, old ? 1 : seg(u, st + 0.3, st + 1.1)); } } });
    const note = { 4: '리소스가 빠듯하거나 소수만 먼저 노출하고 싶을 때', 5: '부분 노출 없이 한 번에, 롤백은 초 단위로 (금융 · 결제)', 6: 'preview로 미리 보고 AnalysisRun으로 자동 중단하기는 둘 다' }[k];
    if (note) tx(480, 404, note, { 'font-size': 15.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) }); }

  // =========== 5. 실무 함정 ===========
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { // 세션 고정 / 헤더 분할
      lbl(480, 46, k === 0 ? '세션 고정(sticky)이 켜진 LB' : 'canary-by-header: X-Canary', 1, { 'font-size': 16, class: k ? 'mono' : null });
      for (let i = 0; i < 8; i++) pod(600 + (i % 4) * 34, 130 + Math.floor(i / 4) * 34, 'S');
      pod(600, 290, 'C'); pod(634, 290, 'C');
      tx(580, 100, 'stable', { 'font-size': 14, fill: INFO, 'font-weight': 700 }); tx(580, 260, 'canary', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      for (let i = 0; i < 6; i++) { const y = 90 + i * 48, tag = k === 1 && i < 2, stuck = k === 0 && i >= 3;
        person(90, y + 8, null, { s: 0.6, stroke: stuck ? WARN : INK });
        if (tag) pill(150, y, 'X-Canary', ACC, pop(u, 0.3 + i * 0.2), { fs: 13.5, mono: true });
        const toC = k === 1 ? tag : stuck, ty = toC ? 290 : 130 + (i % 2) * 34;
        dot([[110, y + 4], [275, 210], [385, 210], [toC ? 600 : 600 + (i % 4) * 34, ty]], (t * 0.4 + i / 6) % 1, toC ? (k ? ACC : WARN) : INFO, 5); }
      card(330, 210, 110, 44, { text: k ? 'nginx' : 'LB', fs: 15, mono: true });
      if (k === 0) { tx(800, 200, '의도: 5%', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
        tx(800, 232, '실제: 묶인 세션 만큼', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
        sub(800, 260, '같은 사용자가 계속', fade(u, 1.8), { 'text-anchor': 'start' }); sub(800, 280, 'canary에 갇힌다', fade(u, 1.8), { 'text-anchor': 'start' }); }
      else { tx(800, 200, '헤더가 있으면 canary', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); sub(800, 228, '누가 받을지 미리 정해진다', fade(u, 1.4), { 'text-anchor': 'start' }); }
      return; }
    if (k === 2) { const d = lerp(300, 60, E(u, 0.4, 1.8)), x0 = 140, W = 640, X = (s) => x0 + W * s / 300;
      lbl(480, 52, 'scaleDownDelaySeconds', 1, { class: 'mono', 'font-size': 16 });
      el('line', { x1: x0, y1: 160, x2: x0 + W, y2: 160, stroke: GRID, 'stroke-width': 2 });
      mono(x0, 190, '0s 전환', { 'font-size': 14, fill: MUT });
      el('rect', { x: x0, y: 130, width: X(d) - x0, height: 26, rx: 6, fill: INFO, opacity: 0.85 });
      mono(X(d) + 8, 149, `blue 유지 ${Math.round(d)}s`, { 'font-size': 15, 'font-weight': 800, fill: INFO });
      [['비용 (blue 8개를 켜 둔 시간)', WARN], ['즉시 롤백이 가능한 시간', GOOD]].forEach(([n, col], i) => { const y = 250 + i * 60;
        tx(x0, y, n, { 'font-size': 15, 'font-weight': 700 }); R.hbar(x0 + 290, y - 16, 320, d, 300, { col, text: Math.round(d) + 's' }); });
      sub(480, 390, '둘은 함께 줄어든다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3 || k === 4) { // DB 스키마 공유
      const DBX = 640;
      R.dbIcon(DBX, 120, 'users 테이블', {});
      if (k === 3) { pod(250, 90, 'S', { z: 30 }); pod(250, 170, 'C', { z: 30 });
        tx(290, 96, 'v1', { 'font-size': 15, 'font-weight': 800, fill: INFO }); tx(290, 176, 'v2', { 'font-size': 15, 'font-weight': 800, fill: ACC });
        grow(330, 90, 586, 110, 1, GRID); grow(330, 170, 586, 130, 1, GRID);
        const ren = E(u, 0.4, 1.0);
        R.cells(500, 230, [ren > 0.5 ? 'full_name' : 'name', 'email'], { w: 130, h: 40, fs: 14.5, style: (i) => (i === 0 ? { stroke: ren > 0.5 ? ACC : INK, color: ren > 0.5 ? ACC : INK } : {}) });
        sub(630, 300, 'v2가 컬럼 이름을 바꿨다', fade(u, 0.8));
        if (u > 1.5) { mono(250, 240, "SELECT name …", { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); cross(250, 280, 14, pop(u, 1.8));
          tx(250, 330, 'blue/stable(v1)로 롤백하면 깨진다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); }
        return; }
      [['릴리스 N · expand', ['name', 'full_name'], '컬럼 추가 + 백필'], ['릴리스 N+1 · contract', ['full_name'], 'v1이 사라진 뒤 지운다']].forEach(([h, cols, note], i) => { const y = 230 + i * 92, st = 0.3 + i * 1.0;
        tx(70, y + 26, h, { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, st) });
        R.cells(330, y, cols, { w: 128, h: 40, fs: 14.5, style: (j) => ({ s: pop(u, st + 0.2 + j * 0.2), stroke: cols[j] === 'full_name' ? ACC : INK, color: cols[j] === 'full_name' ? ACC : INK }) });
        sub(780, y + 26, note, fade(u, st + 0.5), { 'font-weight': 700, fill: INK }); });
      check(250, 120, 14, pop(u, 2.2)); tx(250, 160, '어느 시점에도 v1 · v2가 함께 돈다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) }); return; }
    if (k === 5) { // 미러링
      person(80, 200, '사용자');
      [[110, 200, 210, 200], [330, 200, 540, 130], [330, 200, 540, 290]].forEach(([a, b, c2, d], i) => el('line', { x1: a, y1: b, x2: c2, y2: d, stroke: GRID, 'stroke-width': 2.2, 'stroke-dasharray': i === 2 ? '6 4' : null }));
      pod(560, 130, 'S', { z: 34 }); pod(560, 290, 'C', { z: 34 });
      tx(600, 136, 'stable · 응답을 돌려준다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO }); tx(600, 296, 'canary · 응답은 버린다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      for (let i = 0; i < 5; i++) { const ph = (t * 0.35 + i / 5) % 1;
        dot([[110, 200], [330, 200], [540, 130]], ph, INFO, 5); dot([[330, 200], [540, 290]], ph > 0.45 ? (ph - 0.45) / 0.55 : 0, ACC, 4.5);
        dot([[540, 130], [330, 200], [110, 200]], (ph + 0.5) % 1, INK, 4); }
      card(270, 200, 120, 44, { text: 'Istio', fs: 15, mono: true });
      sub(430, 278, '복제본', fade(u, 0.6), { fill: ACC, 'font-weight': 700 });
      pill(480, 390, '쓰기 요청이 복제되면 DB에 두 번 쓴다 · 막아야 한다', BAD, pop(u, 1.8), { fs: 13.5 }); return; }
    lbl(480, 80, '이 배포를 정말 되돌릴 수 있는가', fade(u, 0.1), { 'font-size': 22 });
    [['세션', '고정 때문에 비율이 틀어지지 않나'], ['리소스', 'blue + green 두 벌이 들어가나'], ['DB', '스키마가 v1 과도 맞나'], ['미러링', '복제 요청이 쓰기를 하지 않나']].forEach(([a, b], i) => { const y = 150 + i * 58, s = pop(u, 0.4 + i * 0.35);
      card(480, y, 560, 46, { rx: 23, stroke: WARN, sw: 2, s });
      tx(230, y + 6, a, { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5 + i * 0.35) });
      tx(330, y + 6, b, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.35) }); }); }

  const quiz = [
    { q: 'Canary와 Blue-Green을 가르는 선택 기준으로 맞는 것은 무엇인가?',
      o: ['다운타임이 필요한가 아닌가', '점진적으로 검증할지, 한 번에 전환하고 즉시 되돌릴지', 'Rollout CRD를 쓰는가 Deployment를 쓰는가'], a: 1,
      why: '둘 다 다운타임 0이고 같은 Rollout CRD로 쓴다. 차이는 전환 방식이라, 검증이 중요하면 Canary, 즉시 전환·롤백이 중요하면 Blue-Green이다.' },
    { q: 'replicas 8인 Canary Rollout이 trafficRouting과 함께 setWeight 25 단계에 있다. 떠 있는 파드는 몇 개인가?',
      o: ['stable 8 + canary 2 = 10개', 'stable 6 + canary 2 = 8개', 'stable 8 + canary 8 = 16개'], a: 0,
      why: '라우터가 있으면 stable은 8개 그대로 두고 canary를 25% 만큼(올림해서 2개) 더 띄운다. 그래서 Canary는 리소스를 조금만 더 쓴다.' },
    { q: 'Blue-Green에서 previewService의 역할은 무엇인가?',
      o: ['blue를 줄이는 시간을 정한다', '실사용자 트래픽의 5%를 green으로 보낸다', '실사용자 노출 없이 green을 미리 확인하는 통로가 된다'], a: 2,
      why: 'activeService는 실사용자, previewService는 green만 가리킨다. QA와 prePromotionAnalysis가 preview로 green을 본 뒤 promote 한다.' },
    { q: '리소스 축에서 두 전략을 비교하면 어떻게 되는가?',
      o: ['Canary는 비율만큼만 더 띄우고, Blue-Green은 전환 동안 두 벌이 떠 2배가 든다', '둘 다 같은 양이 든다', 'Blue-Green이 더 적게 든다'], a: 0,
      why: 'Blue-Green은 green을 blue와 같은 8개로 미리 띄우므로 전환 기간에 16개가 돈다. Canary는 25% 단계에서 2개만 더한다.' },
    { q: 'v2가 컬럼 이름을 바꾼 상태에서 v1으로 롤백하면 무슨 일이 생기는가?',
      o: ['Rollouts가 스키마도 함께 되돌린다', 'v1이 옛 컬럼을 찾지 못해 깨진다', '아무 문제가 없다'], a: 1,
      why: '구·신 버전은 같은 DB를 쓴다. 그래서 컬럼은 먼저 더하고(expand), 구버전이 사라진 다음 릴리스에서 지운다(contract).' },
  ];

  const summary = [
    'Canary는 새 버전에 5%, 25%, 50%, 100% 순서로 트래픽을 늘리며 실사용자로 검증한다.',
    'Blue-Green은 green을 8개 그대로 띄워 두었다가 activeService 셀렉터 하나로 한 번에 넘긴다.',
    'Canary는 리소스를 조금 더 쓰고 소수만 노출되며, Blue-Green은 2배를 쓰는 대신 전환이 즉시다.',
    '어느 전략이든 DB 컬럼은 expand로 더하고 다음 릴리스에서 contract로 지워야 롤백이 된다.',
  ];
  const review = [
    { q: '결제 서비스라 두 버전이 동시에 응답하면 안 되고, 노드에는 여유가 넉넉하다. 고를 전략은?',
      o: ['Canary 5%부터 시작', 'Blue-Green에 autoPromotionEnabled: false와 preview 검증', 'RollingUpdate 그대로'], a: 1,
      why: 'Canary는 단계 동안 두 버전이 함께 응답한다. 한 번에 넘기고 즉시 되돌려야 하고 2배 리소스를 감당할 수 있으면 Blue-Green이 맞다.' },
    { q: 'Canary를 5%로 두었는데 특정 고객만 계속 새 버전을 보고 비율이 맞지 않는다. 먼저 볼 것은?',
      o: ['LB의 세션 고정 설정', 'scaleDownDelaySeconds', 'revisionHistoryLimit'], a: 0,
      why: '세션이 파드에 묶이면 무작위 분할이 깨진다. 세션을 외부 저장소로 빼거나 canary-by-header처럼 누가 받을지 명시한다.' },
    { q: 'Blue-Green 비용을 줄이려고 scaleDownDelaySeconds를 300에서 60으로 줄였다. 함께 줄어드는 것은?',
      o: ['green의 파드 수', 'previewService로 확인할 수 있는 시간', '전환 뒤 blue로 바로 되돌릴 수 있는 시간'], a: 2,
      why: 'blue 파드가 남아 있는 동안에만 새로 띄우지 않고 되돌릴 수 있다. 비용과 롤백 여유는 함께 움직인다.' },
  ];

  R.page({ title: 'Canary vs Blue-Green', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
