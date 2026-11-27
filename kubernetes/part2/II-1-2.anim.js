/* II-1-2 롤링 업데이트와 롤백 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * Pod·ReplicaSet·카운터는 각 beat 의 pods / rsRows / counter 데이터에서 읽는다.
 * 라운드 그림의 (v1, v2) 개수는 Deployment 컨트롤러 계산(rolling.go)을 파이썬으로 옮겨 돌린 결과다
 * (replicas 5, maxSurge 2, maxUnavailable 0 / 비교용 maxUnavailable 2). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, terminal, meters, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const LY = { v1: 166, v2: 256 }, PX = (i) => 254 + i * 78;
  const laneOf = (v) => (v.startsWith('v1') ? 'v1' : 'v2');
  // Pod 칩: v1 파랑, v2 청록, 종료 중 빨강 점선, 장애 v2 빨강
  function chip(cx, cy, v, ready, o) { o = o || {}; const term = v.endsWith('term'), fail = v.endsWith('fail'), base = laneOf(v);
    const col = term || fail ? BAD : base === 'v1' ? INFO : ACC, bg = fail ? BADBG : term ? PANEL : ready ? (base === 'v1' ? INFOBG : ACCBG) : PANEL;
    const g = card(cx, cy, 66, 50, { rx: 9, stroke: col, fill: bg, sw: 2.2, dash: term || !ready ? '5 4' : null, s: o.s, op: (o.op ?? 1) * (term ? 0.7 : 1) });
    mono(0, 2, base, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    if (fail) tx(0, 20, '5xx', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD }, g);
    else if (term) tx(0, 20, '종료 중', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD }, g);
    else if (!ready) tx(0, 20, '준비 중', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g);
    return g; }
  // ReplicaSet 줄 머리
  function rsHead(lane, row, prow, u, o) { o = o || {}; const y = LY[lane], dim = row.active === false, col = dim ? MUT : lane === 'v1' ? INFO : ACC;
    const d = tween(prow ? prow.desired : null, row.desired, u);
    const g = card(116, y, 178, 76, { rx: 10, stroke: col, fill: dim ? SOFT : PANEL, sw: 2.2, dash: dim ? '6 4' : null, s: o.s });
    tx(-76, -12, 'RS · ' + row.image, { 'font-size': 15, 'font-weight': 800, fill: col }, g);
    mono(-76, 8, row.name, { 'font-size': 13.5, fill: MUT }, g);
    mono(-76, 28, dim ? 'replicas 0 · 보관' : 'desired ' + Math.round(d), { 'font-size': 14, 'font-weight': 700, fill: dim ? MUT : INK }, g); }
  // 두 줄(v1/v2)에 Pod 를 늘어놓는다. ready 는 rsRows 의 READY 만큼 앞에서부터
  function lanes(c, o) { o = o || {}; const b = c.beat, p = c.prev || {}, rows = b.rsRows || [];
    rows.forEach((r, i) => { const lane = i === 0 ? 'v1' : 'v2', pr = (p.rsRows || [])[i]; rsHead(lane, r, pr, c.u, { s: o.headPop && o.headPop[lane] ? o.headPop[lane] : 1 }); });
    const byLane = { v1: [], v2: [] }; (b.pods || []).forEach((q) => byLane[laneOf(q.v)].push(q.v));
    ['v1', 'v2'].forEach((lane, li) => { const r = rows[li], rd = r ? r.ready : 0; let live = 0;
      byLane[lane].forEach((v, i) => { const term = v.endsWith('term'); const ready = o.ready ? o.ready(lane, i) : (!term && live < rd); if (!term) live++;
        chip(PX(i), LY[lane], v, ready, { s: o.pop ? o.pop(lane, i) : 1 }); }); }); }
  // 계기판: 이 beat 의 counter 를 앞 beat 값에서 이어서
  function gauges(c, o) { o = o || {}; const b = c.beat.counter, p = (c.prev && c.prev.counter) || {}, u = c.u;
    const f = (k) => Math.round(tween(p[k], b[k], u));
    meters(30, 334, 790, [{ name: 'DESIRED', val: String(f('desired')) }, { name: 'Pod 수', val: String(f('current')), hot: f('current') > 7 },
      { name: 'UP-TO-DATE', val: String(f('upToDate')), good: b.upToDate === b.desired }, { name: 'AVAILABLE', val: String(f('available')), hot: !o.calm && f('available') < 5, good: f('available') >= 5 }], { h: 66 }); }
  // 오른쪽 세로 막대: Pod 수와 상한 7 · 하한 5
  function capacity(c, op) { op = op ?? 1; if (op <= 0) return; const b = c.beat, p = c.prev || {}, x = 872, y0 = 300, U = 21;
    const tot = tween(p.pods ? p.pods.length : null, b.pods.length, c.u), av = tween(p.counter ? p.counter.available : null, b.counter.available, c.u);
    el('rect', { x, y: y0 - 8 * U, width: 40, height: 8 * U, rx: 6, fill: SOFT, opacity: op });
    el('rect', { x, y: y0 - tot * U, width: 40, height: tot * U, rx: 4, fill: OFF, opacity: op });
    el('rect', { x, y: y0 - Math.min(av, tot) * U, width: 40, height: Math.min(av, tot) * U, rx: 4, fill: ACC, opacity: op * 0.85 });
    [[7, BAD, '최대 7'], [5, GOOD, '최저 5']].forEach(([v, col, s]) => { el('line', { x1: x - 8, y1: y0 - v * U, x2: x + 48, y2: y0 - v * U, stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: op });
      tx(x - 12, y0 - v * U + 5, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: op }); });
    tx(x + 20, y0 + 22, 'Pod 수', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700, opacity: op }); }
  // 라운드 띠: (v1, v2) 개수를 막대로 나란히, at 번째를 강조
  function rounds(x, y, seq, at, u, o) { o = o || {}; const W = 34, H = 11;
    seq.forEach(([a, bb], i) => { const s = clamp(u * seq.length * 1.2 - i); if (s <= 0) return; const cx = x + i * (W + 16), on = i === at;
      for (let j = 0; j < a; j++) el('rect', { x: cx, y: y - (j + 1) * H, width: W, height: H - 2, rx: 2, fill: o.aCol || INFO, opacity: s * (on ? 1 : 0.45) });
      for (let j = 0; j < bb; j++) el('rect', { x: cx, y: y - (a + j + 1) * H, width: W, height: H - 2, rx: 2, fill: o.bCol || ACC, opacity: s * (on ? 1 : 0.45) });
      mono(cx + W / 2, y + 17, `${a}·${bb}`, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': on ? 800 : 500, fill: on ? INK : MUT, opacity: s });
      if (on) el('rect', { x: cx - 5, y: y - 7 * H - 6, width: W + 10, height: 7 * H + 32, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2.2 }); });
    el('line', { x1: x - 6, y1: y - 7 * H, x2: x + seq.length * (W + 16) - 10, y2: y - 7 * H, stroke: BAD, 'stroke-dasharray': '4 4', 'stroke-width': 1.5 }); }
  const ROLL = [[5, 0], [5, 2], [3, 2], [3, 4], [1, 4], [1, 5], [0, 5]];   // maxSurge 2 · maxUnavailable 0 (모의 실험)

  // ---------- 1. v1 안정 상태 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { pill(200, 52, 'spec.replicas 5', ACC, pop(u, 0.2), { mono: true, fs: 15 });
      tx(400, 40, 'revisionHistoryLimit 10 · 옛 ReplicaSet 보관 칸', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8) });
      for (let i = 0; i < 10; i++) el('rect', { x: 400 + i * 40, y: 52, width: 32, height: 26, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', opacity: fade(u, 0.9 + i * 0.08) }); }
    if (k >= 1) lanes(c, { headPop: { v1: k === 1 ? pop(u, 0.3) : 1 }, pop: (l, i) => (k === 2 ? pop(u, 0.3 + i * 0.25) : 1) });
    if (k === 1) pill(420, 166, 'selector app=web', INFO, pop(u, 0.9), { mono: true, fs: 14 });
    if (k === 3) { for (let i = 0; i < 5; i++) { const x = PX(i); grow(x, 70, x, 136, E(u, 0.2 + i * 0.15, 0.6 + i * 0.15), GOOD); }
      mono(PX(0) - 30, 56, 'GET /healthz → 200', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); }
    if (k === 4) { mono(254, 52, 'maxSurge 2       → 최대 5 + 2 = 7', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      mono(254, 82, 'maxUnavailable 0 → 최저 5 − 0 = 5', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
      mono(660, 82, 'minReadySeconds 5', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); }
    capacity(c, k === 4 ? fade(u, 0.4) : 0);
    gauges(c, { calm: true }); }

  // ---------- 2. v2 배포 시작 ----------
  const MU2 = [5, 5, 3, 3, 7, 4, 4, 5], MU0 = [5, 5, 7, 5, 5, 7, 5, 5, 6, 5];   // 모의 실험의 available 흐름
  function s2(t, c) { const { k, u } = c;
    if (k === 4) { // 비교: maxUnavailable 2 vs 0
      [[MU2, 'maxUnavailable 2', BAD, 40], [MU0, 'maxUnavailable 0', GOOD, 500]].forEach(([seq, name, col, x0], i) => {
        const ax = axes(x0 + 40, 60, 370, 230, { x: [0, 9], y: [0, 7], yt: [0, 3, 5, 7], grid: true, yl: 'available' });
        line(ax, seq.map((v, j) => [j, v]), E(u, 0.2 + i * 0.5, 1.6 + i * 0.5), col, { sw: 3 });
        tx(x0 + 225, 330, name, { 'font-size': 15.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle' });
        const lo = Math.min(...seq); mono(x0 + 225, 358, `최저 available ${lo}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, 1.8 + i * 0.3) }); });
      tx(480, 404, '같은 v1 → v2 교체, 컨트롤러 계산 단계마다의 available', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      return; }
    lanes(c, { headPop: { v2: k === 1 ? pop(u, 0.3) : 1 }, pop: (l, i) => (k === 2 && l === 'v2' ? pop(u, 0.4 + i * 0.3) : 1) });
    if (k === 0) { mono(254, 56, 'image: myapp:v1', { 'font-size': 17, 'font-weight': 700, fill: MUT, 'text-decoration': fade(u, 0.6) > 0.5 ? 'line-through' : null });
      fly(420, 50, 560, 50, seg(u, 0.7, 1.4), 'myapp:v2', { stay: true, mono: true });
      mono(254, 92, 'change-cause: "release v2 (feat: search)"', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 1) tx(560, 256, 'v2 Pod 0개 · 아직 아무것도 안 바뀜', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
    if (k === 2) { banner(450, 60, 'v1은 그대로, v2를 먼저 2개 더 · 5 → 7', pop(u, 1.2)); }
    if (k === 3) terminal(254, 14, 560, 108, ['$ kubectl rollout status deployment/web', ['2 out of 5 new replicas have been updated...', 'var(--term)'], ['Scaled up replica set web-v2 to 2', 'var(--term)']], E(u, 0.1, 1.2) * 3, { title: 'bash' });
    capacity(c);
    gauges(c); }

  // ---------- 3. v1 2개 종료 ----------
  function s3(t, c) { const { k, u } = c;
    lanes(c, { ready: k === 0 ? (l, i) => (l === 'v1' ? true : u > 0.5 + i * 0.4) : null });
    if (k === 0) { [0, 1].forEach((i) => check(PX(i) + 30, LY.v2 - 30, 9, pop(u, 0.6 + i * 0.4))); sub(560, 300, 'readiness 통과 → 트래픽 받기 시작', fade(u, 1.4), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); }
    if (k === 1) { [0, 1].forEach((i) => cross(PX(i) + 30, LY.v1 - 30, 8, pop(u, 0.4 + i * 0.3))); banner(500, 60, 'Pod 7개 − desired 5 = v1 2개 내림', pop(u, 1.0)); }
    if (k === 2) { // 종료 시계: 0 ~ 30초
      const x0 = 254, w = 560, X = (s) => x0 + (s / 30) * w, y = 50, now = lerp(0, 30, E(u, 0.2, 2.4));
      el('rect', { x: x0, y: y - 12, width: X(10) - x0, height: 24, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5 });
      el('rect', { x: X(10), y: y - 12, width: X(30) - X(10), height: 24, rx: 4, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      tx(X(5), y + 5, 'preStop sleep 10', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
      tx(X(20), y + 5, 'SIGTERM → 앱이 스스로 정리', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle' });
      [0, 10, 30].forEach((s) => mono(X(s), y + 32, s + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      el('line', { x1: X(now), y1: y - 20, x2: X(now), y2: y + 18, stroke: BAD, 'stroke-width': 3 });
      tx(X(30), y + 52, 'terminationGracePeriodSeconds 30 · 넘기면 SIGKILL', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
    if (k === 3) { const ips = ['10.1.0.7', '10.1.0.8', '10.1.0.9', '10.1.1.4', '10.1.1.5'];
      tx(254, 34, 'Service web의 Endpoints', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ips.forEach((ip, i) => pill(300 + i * 108, 66, ip, ACC, pop(u, 0.2 + i * 0.15), { mono: true, fs: 13.5 }));
      sub(560, 104, '종료 중인 v1 2개는 목록에서 먼저 빠진다 · v1 3 + v2 2', fade(u, 1.3), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    capacity(c);
    gauges(c); }

  // ---------- 4. 라운드 진행 ----------
  function s4(t, c) { const { k, u } = c;
    lanes(c, { pop: (l, i) => (k === 3 && l === 'v2' && i === 4 ? pop(u, 0.4) : 1) });
    if (k === 0 || k === 3 || k === 4) { const at = k === 3 ? 5 : 4;
      rounds(280, 110, ROLL, at, k === 0 ? E(u, 0.1, 1.6) : 1);
      tx(640, 44, 'v1·v2 개수 (파랑 v1, 청록 v2)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      if (k === 0) mono(640, 72, '4 out of 5 new', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      if (k === 3) mono(640, 72, '1 old replicas are', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9) });
      if (k === 3) mono(640, 92, 'pending termination', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9) });
      if (k === 4) { const x = 280 + 5 * 50 - 13; el('rect', { x, y: 34, width: 7, height: 26, fill: WARN, opacity: pop(u, 0.3) }); el('rect', { x: x + 11, y: 34, width: 7, height: 26, fill: WARN, opacity: pop(u, 0.3) });
        mono(640, 72, 'rollout pause → 지표 확인', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
        mono(640, 94, 'rollout resume → 이어서', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) }); } }
    if (k === 1) { mono(254, 60, 'RS v1  1', { 'font-size': 22, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.2) });
      mono(420, 60, '+  RS v2  4', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      mono(620, 60, '=  5', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, 1.0) });
      sub(530, 100, 'Deployment는 두 ReplicaSet의 replicas 숫자만 옮긴다', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 600 }); }
    if (k === 2) { const cols = [['READY', '5/5', GOOD, '지금 잘 도는 수'], ['UP-TO-DATE', '4', ACC, 'v2 template인 수'], ['AVAILABLE', '5', GOOD, '트래픽 받는 수']];
      cols.forEach(([h, v, col, d], i) => { const x = 300 + i * 190, s = pop(u, 0.2 + i * 0.4);
        tx(x, 36, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: s });
        mono(x, 70, v, { 'font-size': 24, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
        tx(x, 98, d, { 'font-size': 13.5, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); }); }
    capacity(c);
    gauges(c); }

  // ---------- 5. 완료 ----------
  function s5(t, c) { const { k, u } = c;
    lanes(c);
    if (k === 0) banner(500, 62, 'deployment "web" successfully rolled out', pop(u, 0.4));
    if (k === 1) { const s = pop(u, 0.5); card(560, 166, 250, 66, { rx: 8, stroke: MUT, dash: '6 4', fill: SOFT, s });
      tx(450, 160, 'template myapp:v1 보관', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 0.7) });
      tx(450, 184, 'Pod 없음 · 롤백하면 다시 늘린다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9) }); }
    if (k === 2) { [['REVISION', 'CHANGE-CAUSE', MUT], ['1', 'initial v1 deploy', INFO], ['2', 'release v2 (feat: search)', ACC]].forEach(([r, cc, col], i) => {
        mono(270, 34 + i * 26, r, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.3) }); mono(380, 34 + i * 26, cc, { 'font-size': 14.5, fill: col, opacity: fade(u, 0.2 + i * 0.3) }); });
      pill(760, 60, '--revision=2 → Image myapp:v2', ACC, pop(u, 1.4), { mono: true, fs: 13.5 }); }
    if (k === 3) { ['Pod image 5개 모두 myapp:v2', '5xx rate < 0.1%', 'p99 latency 평소 수준'].forEach((s, i) => { const y = 36 + i * 30;
        check(290, y - 5, 9, pop(u, 0.3 + i * 0.4)); tx(312, y, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); }); }
    capacity(c);
    gauges(c); }

  // ---------- 6. 롤백 ----------
  function s6(t, c) { const { k, u } = c;
    lanes(c, { pop: (l, i) => (k === 2 && l === 'v1' ? pop(u, 0.3 + i * 0.2) : 1) });
    if (k === 0) { terminal(254, 22, 420, 92, ['[ERROR] TypeError ... at search()', ['[ERROR] readiness probe failed: HTTP 500', 'var(--term)']], E(u, 0.1, 1.2) * 2, { title: 'kubectl logs' });
      pill(780, 66, 'HighErrorRate 5xx > 1% · 3m', BAD, pop(u, 1.4), { fs: 13.5 }); }
    if (k === 1) { terminal(254, 22, 420, 92, ['$ kubectl rollout undo deployment/web', ['deployment.apps/web rolled back', 'var(--term)']], E(u, 0.1, 1.0) * 2, { title: 'bash' });
      fly(720, 56, 720, 160, seg(u, 1.0, 1.9), 'template = v1', { fill: INFO, mono: true }); }
    if (k === 2) { rounds(280, 110, ROLL, 4, E(u, 0.1, 1.4), { aCol: BAD, bCol: INFO });
      tx(640, 44, 'v2·v1 개수 (빨강 v2, 파랑 v1)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      mono(640, 72, '4 out of 5 new', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.5) }); }
    if (k === 3) banner(500, 62, 'v1 5개로 복귀 · 이번엔 v2가 보관된다', pop(u, 0.3));
    if (k === 4) { [['2', 'release v2 (feat: search)', ACC], ['3', 'initial v1 deploy', INFO]].forEach(([r, cc, col], i) => {
        mono(270, 44 + i * 30, r, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.5) }); mono(310, 44 + i * 30, cc, { 'font-size': 15, fill: col, opacity: fade(u, 0.2 + i * 0.5) }); });
      mono(620, 44, '1  initial v1 deploy', { 'font-size': 15, fill: MUT, 'text-decoration': 'line-through', opacity: fade(u, 1.0) });
      grow(610, 52, 520, 70, E(u, 1.3, 1.9), INFO);
      tx(620, 100, '1번 내용이 3번으로 옮겨 간다', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); }
    if (k === 5) { tx(254, 36, 'revisionHistoryLimit 10 칸', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 10; i++) { const full = i < 2, s = pop(u, 0.2 + i * 0.06);
        card(272 + i * 46, 72, 38, 30, { rx: 5, stroke: full ? (i === 0 ? INFO : ACC) : GRID, fill: full ? (i === 0 ? INFOBG : ACCBG) : 'none', dash: full ? null : '4 3', text: full ? (i === 0 ? 'v1' : 'v2') : '', fs: 13.5, mono: true, s }); }
      pill(800, 72, 'undo --to-revision=N', INFO, pop(u, 1.2), { mono: true, fs: 13.5 }); }
    capacity(c);
    gauges(c); }

  const quiz = [
    { q: 'replicas 5, maxSurge 2, maxUnavailable 0일 때 배포 중 Pod 수의 상한과 available의 하한은 무엇인가?',
      o: ['상한 5, 하한 3', '상한 7, 하한 5', '상한 7, 하한 3'], a: 1,
      why: '상한은 5 + maxSurge 2 = 7, 하한은 5 − maxUnavailable 0 = 5다. 이 두 줄 사이에서만 교체가 일어난다.' },
    { q: 'image를 v2로 바꿔 apply한 직후 v1 Pod는 어떻게 되는가?',
      o: ['곧바로 5개 모두 종료된다', '그대로 두고 새 ReplicaSet이 v2 Pod를 2개 먼저 띄운다', 'v1 ReplicaSet의 template이 v2로 바뀐다'], a: 1,
      why: 'Deployment는 v2용 ReplicaSet을 하나 더 세우고 maxSurge 2만큼 먼저 띄운다. 그래서 Pod 수가 5에서 7이 된다.' },
    { q: 'maxUnavailable 0에서 v1 Pod를 2개 내릴 수 있게 되는 시점은 언제인가?',
      o: ['v2 Pod 2개가 Ready를 통과해 available이 7이 되었을 때', 'v2 Pod가 생성되는 순간', 'preStop이 끝났을 때'], a: 0,
      why: '하한 5를 지켜야 하므로 v2 2개가 Ready가 되어 available 7이 된 뒤에야 7 − 5 = 2개를 내린다.' },
    { q: 'kubectl get deploy에서 READY 5/5 · UP-TO-DATE 4가 뜻하는 것은 무엇인가?',
      o: ['5개 중 4개가 고장 났다', '5개 모두 돌고 있고 그중 4개가 새 template(v2)이다', '배포가 끝나 4개만 남았다'], a: 1,
      why: 'READY는 지금 도는 수, UP-TO-DATE는 새 template으로 만든 수다. UP-TO-DATE가 5가 되어야 배포가 끝난다.' },
    { q: '배포가 끝난 뒤 v1 ReplicaSet은 어떤 상태로 남는가?',
      o: ['replicas 0으로 template만 보관된다', '삭제된다', 'replicas 5로 대기한다'], a: 0,
      why: 'Pod는 없지만 template을 가진 ReplicaSet이 남아 rollback 때 다시 늘린다. 보관 수는 revisionHistoryLimit 10이 정한다.' },
    { q: 'kubectl rollout undo를 하면 rollout history는 어떻게 바뀌는가?',
      o: ['revision 2가 지워지고 1로 돌아간다', '바뀌지 않는다', 'v1 template이 revision 3으로 새로 기록되고 1번은 목록에서 빠진다'], a: 2,
      why: '되돌리기도 새 배포다. v1 template이 revision 3을 받고 CHANGE-CAUSE도 initial v1 deploy가 따라온다.' },
  ];

  const summary = [
    'image 한 줄을 바꾸면 Deployment가 새 ReplicaSet을 만들고 두 ReplicaSet의 개수를 조금씩 옮긴다.',
    'maxSurge 2는 Pod를 7개까지 허용하고 maxUnavailable 0은 available을 5 아래로 내리지 않는다.',
    '종료되는 Pod는 Endpoints에서 먼저 빠지고 preStop 10초 뒤 SIGTERM을 받는다.',
    '옛 ReplicaSet을 replicas 0으로 남겨 두므로 rollout undo는 같은 규칙으로 바로 되돌린다.',
  ];
  const review = [
    { q: '배포 중 잠깐 응답 실패가 났다. 설정을 보니 maxUnavailable 2, readinessProbe 없음이었다. 먼저 의심할 것은?',
      o: ['maxSurge가 너무 커서 Pod가 넘쳤다', 'v2가 실제로 준비되기 전에 v1이 내려가고 트래픽이 들어갔다', 'revisionHistoryLimit이 작아서'], a: 1,
      why: 'maxUnavailable 2면 v2가 Ready 되기 전에도 v1을 2개 내린다. readinessProbe가 없으면 준비 안 된 Pod도 곧바로 Ready로 잡힌다.' },
    { q: 'rollout status가 "1 old replicas are pending termination..." 에서 오래 멈췄다. 먼저 볼 것은?',
      o: ['종료 중인 v1 Pod가 preStop이나 SIGTERM 처리에서 늦게 끝나는지', 'v2 이미지가 빌드됐는지', 'maxSurge를 0으로 바꿀지'], a: 0,
      why: '새 Pod는 다 떴고 옛 Pod 하나가 남은 상태다. 종료 절차는 grace period 30초까지 기다린 뒤 강제 종료된다.' },
    { q: 'v2 배포 뒤 오류가 늘어 rollout undo를 쳤다. 다음 중 맞는 설명은?',
      o: ['v1 이미지를 다시 빌드한 뒤 교체한다', 'v2 Pod를 모두 즉시 지우고 v1을 5개 띄운다', '보관된 v1 ReplicaSet을 maxSurge·maxUnavailable 규칙대로 다시 늘린다'], a: 2,
      why: '롤백도 롤링 업데이트다. v1을 2개씩 먼저 띄우고 Ready를 못 하던 v2부터 줄여 available 하한을 지킨다.' },
  ];

  R.page({ title: '두 ReplicaSet 사이의 교대', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
