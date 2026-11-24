/* IV-1-1 Classic Cluster — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 노드 3대(rabbit1/2/3)와 그 위에 사는 큐를 그린다. 숫자는 페이지 코드의 출력 예와 caption 에서만 가져온다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    server, person, cross, check, clock, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 노드: RA.server 위에 상태를 얹는다. o.down 빨강 + X, o.pause 회색 + 정지
  function node(x, y, name, o) { o = o || {};
    const stroke = o.down ? BAD : o.pause ? OFF : o.stroke || INK;
    server(x, y, null, { lamp: o.down ? BAD : o.pause ? OFF : o.lamp || GOOD, stroke, op: o.op, s: o.s });
    tx(x, y + 64, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono', fill: o.down ? BAD : o.pause ? MUT : INK, opacity: o.op ?? 1 });
    if (o.down) cross(x, y, 26, o.downS ?? 1);
    if (o.pause) { const s = o.pauseS ?? 1; el('rect', { x: x - 13, y: y - 16, width: 9, height: 32, rx: 2, fill: WARN, opacity: s }); el('rect', { x: x + 4, y: y - 16, width: 9, height: 32, rx: 2, fill: WARN, opacity: s }); } }
  // 큐: 왼쪽에서 들어와 오른쪽으로 나가는 관. n 개 메시지 칸. o.ghost 면 이름만 있는 빈 관
  function queue(cx, cy, name, n, o) { o = o || {}; const w = o.w || 150, h = 34, x0 = cx - w / 2, op = o.op ?? 1;
    el('rect', { x: x0, y: cy - h / 2, width: w, height: h, rx: 8, fill: o.ghost ? 'none' : o.down ? SOFT : PANEL, stroke: o.ghost ? OFF : o.down ? OFF : o.stroke || ACC, 'stroke-width': 2, 'stroke-dasharray': o.ghost ? '6 5' : null, opacity: op });
    for (let i = 0; i < Math.round(n); i++) { const kind = o.kinds ? o.kinds[i] : 'p', hollow = kind === 't';
      el('rect', { x: x0 + w - 22 - i * 19, y: cy - 11, width: 14, height: 22, rx: 3, fill: hollow ? PANEL : o.down ? OFF : o.col || ACC, stroke: hollow ? (o.tcol || WARN) : 'none', 'stroke-width': 2, 'stroke-dasharray': hollow ? '3 2' : null, opacity: op * (o.cellOp ? o.cellOp(i) : 1) }); }
    if (name) mono(cx, cy + h / 2 + 19, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: o.ghost ? MUT : o.down ? MUT : INK, opacity: op }); }
  // 클러스터 경계 (x0 ~ x1 노드 둘레), u 만큼 오른쪽으로 자람
  function boundary(x0, x1, y0, y1, label, op) { if (op <= 0) return;
    el('rect', { x: x0, y: y0, width: Math.max(0, x1 - x0), height: y1 - y0, rx: 18, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '8 6', opacity: op });
    if (label) tx(x0 + 14, y0 + 20, label, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: op }); }

  // ---------- 1. 클러스터 형성 ----------
  const NX = [180, 480, 780], NY = 110;
  function cookie(x, y, s) { if (s <= 0) return; const g = R.G(x, y, s);
    el('circle', { cx: 0, cy: 0, r: 15, fill: WARNBG, stroke: WARN, 'stroke-width': 2.2 }, g);
    [[-5, -4], [5, -2], [-1, 6]].forEach(([a, b]) => el('circle', { cx: a, cy: b, r: 2.4, fill: WARN }, g)); }
  function s1(t, c) { const { k, u } = c;
    const joined = [true, k >= 2, k >= 3];
    // 노드 사이 선 (합류 전에는 점선)
    [[0, 1], [1, 2]].forEach(([a, b]) => el('line', { x1: NX[a] + 60, y1: NY, x2: NX[b] - 60, y2: NY, stroke: joined[b] ? ACC : GRID, 'stroke-width': joined[b] ? 2.5 : 2, 'stroke-dasharray': joined[b] ? null : '5 6' }));
    // 클러스터 경계: rabbit1 에서 시작해 합류한 노드까지
    const reach = k < 2 ? NX[0] : k === 2 ? lerp(NX[0], NX[1], E(u, 1.6, 2.4)) : k === 3 ? lerp(NX[1], NX[2], E(u, 1.6, 2.4)) : NX[2];
    boundary(NX[0] - 100, reach + 100, NY - 74, NY + 96, '클러스터 rabbit@rabbit1', k >= 2 ? 1 : 0.5);
    NX.forEach((x, i) => node(x, NY, 'rabbit' + (i + 1), { lamp: joined[i] ? GOOD : OFF }));
    // running_nodes 계수
    const runs = [1, 1, 2, 3, 3], rn = tween(k > 0 ? runs[k - 1] : null, runs[k], u);
    mono(910, 408, 'running_nodes', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'end' });
    mono(920, 410, String(Math.round(rn)), { 'font-size': 22, 'font-weight': 800, fill: ACC });
    if (k === 0) { // 전제 세 가지
      [['같은 .erlang.cookie', '노드 인증 토큰'], ['호스트명 resolve', 'DNS / hosts'], ['포트 4369 · 25672 · 5672', 'epmd · 노드 간 · AMQP']].forEach(([a, b], i) => {
        const s = pop(u, 0.3 + i * 0.5); card(140 + i * 235, 300, 220, 62, { rx: 10, stroke: WARN, sw: 2, s });
        tx(140 + i * 235, 296, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) });
        tx(140 + i * 235, 318, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); });
      note(30, 395, '하나라도 어긋나면 join이 거부된다', fade(u, 2.0), { fill: WARN }); return; }
    if (k === 1) { cookie(NX[0], NY - 92, pop(u, 0.1)); mono(NX[0] + 26, NY - 86, '.erlang.cookie', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      [1, 2].forEach((j) => { const v = E(u, 0.5 + (j - 1) * 0.4, 1.6 + (j - 1) * 0.4); if (v > 0 && v < 1) cookie(lerp(NX[0], NX[j], v), NY - 92 - Math.sin(v * Math.PI) * 30, 1); if (v >= 1) cookie(NX[j], NY - 92, 1);
        pill(NX[j], 236, 'chmod 400', WARN, pop(u, 1.8 + (j - 1) * 0.3), { mono: true, fs: 13.5 }); });
      note(30, 300, '세 노드가 같은 cookie를 갖게 됐다', fade(u, 2.2)); note(30, 330, '아직 합류 전이라 각자 따로 돈다', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 2 || k === 3) { const j = k - 1, cmds = ['stop_app', 'reset', 'join_cluster', 'start_app'];
      cmds.forEach((s, i) => { const on = seg(u, 0.2 + i * 0.35, 0.5 + i * 0.35);
        card(150 + i * 170, 300, 150, 36, { rx: 18, text: s, fs: 14, mono: true, fw: 700, stroke: on > 0 ? (i === 1 ? BAD : ACC) : GRID, color: on > 0 ? (i === 1 ? BAD : ACC) : MUT, fill: on >= 1 ? (i === 1 ? BADBG : ACCBG) : PANEL });
        if (i < 3) grow(225 + i * 170, 300, 245 + i * 170, 300, seg(u, 0.5 + i * 0.35, 0.6 + i * 0.35), MUT); });
      note(75, 260, `rabbit${j + 1}에서 실행`, 1, { 'font-size': 14, fill: MUT });
      sub(150 + 170, 342, '로컬 상태 지움', fade(u, 0.9), { fill: BAD });
      if (k === 3) note(30, 395, '노드 수는 홀수(3 또는 5)로 맞춘다', fade(u, 2.2)); return; }
    // k4: 메타데이터는 전 노드 복제, 큐 메시지는 아님
    const meta = ['exchanges', 'bindings', 'vhosts', 'users', 'policies'];
    NX.forEach((x, i) => meta.forEach((m, r) => { const s = i === 0 ? 1 : seg(u, 0.3 + r * 0.18 + (i - 1) * 0.15, 0.6 + r * 0.18 + (i - 1) * 0.15);
      el('rect', { x: x - 68 + r * 28, y: 214, width: 24, height: 24, rx: 4, fill: GOOD, opacity: 0.2 + 0.7 * s }); }));
    tx(NX[0] - 76, 231, '메타데이터', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end' });
    NX.forEach((x, i) => { if (i > 0) check(x + 80, 226, 9, pop(u, 1.4 + i * 0.2)); });
    note(30, 290, 'exchange · binding · vhost · user · policy가 세 노드에 같다', fade(u, 1.0), { fill: GOOD });
    queue(NX[0], 340, 'orders.queue', 4, { op: fade(u, 1.6) });
    [1, 2].forEach((j) => { queue(NX[j], 340, null, 0, { ghost: true, op: fade(u, 1.8) }); cross(NX[j], 340, 12, pop(u, 2.0)); });
    sub(NX[1] + 150, 392, '큐 메시지는 공유되지 않는다', fade(u, 2.1), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); }

  // ---------- 2. 큐는 한 노드에만 산다 ----------
  const QX = [280, 540, 800];
  function s2(t, c) { const { k, u } = c;
    QX.forEach((x, i) => node(x, 90, 'rabbit' + (i + 1), {}));
    const has = [true, k >= 2, k >= 2];
    const names = ['orders.queue', 'payments.queue', 'emails.queue'];
    // 선언: 클라이언트 → rabbit1 → 큐가 생김
    person(70, 100, '클라이언트', {});
    if (k === 0) { dot([[100, 100], [QX[0] - 60, 100]], seg(u, 0.2, 0.9), ACC, 7);
      pill(175, 40, 'declare queue', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); }
    const grow0 = k === 0 ? E(u, 0.9, 1.7) : 1;
    queue(QX[0], 224, names[0], 0, { op: grow0, w: 150 * Math.max(0.05, grow0) });
    [1, 2].forEach((j) => { if (has[j]) queue(QX[j], 224, names[j], 0, { op: k === 2 ? fade(u, 1.2 + j * 0.3) : 1 });
      else queue(QX[j], 224, 'orders.queue', 0, { ghost: true, op: k === 0 ? fade(u, 1.8) : 1 }); });
    if (k === 0) { sub(QX[1] + 130, 290, '이름만 안다 (메타데이터)', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 4) { // 한계: 큐 하나의 데이터는 한 노드
      queue(QX[0], 224, null, 5, { op: 1, cellOp: (i) => fade(u, 0.2 + i * 0.12) });
      [1, 2].forEach((j) => { queue(QX[j], 300, null, 0, { ghost: true, op: fade(u, 0.9) }); mono(QX[j], 336, 'orders 사본 없음', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.1) }); cross(QX[j], 300, 12, pop(u, 1.3)); });
      note(30, 395, 'classic queue는 메시지를 복제하지 않는다 → 해법은 IV-1-2 Quorum', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 3) { // 분산: 세 큐에 동시에 흘러든다
      QX.forEach((x, i) => { for (let m = 0; m < 3; m++) dot([[x - 125, 224], [x - 78, 224]], ((t * 0.7 + m / 3 + i * 0.11) % 1), ACC, 5); });
      queue(QX[1], 224, null, 3, {}); queue(QX[2], 224, null, 3, {}); queue(QX[0], 224, null, 3, {});
      card(480, 340, 420, 56, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 0.6) });
      tx(480, 346, '처리량은 노드 수만큼 · 가용성은 그대로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) }); return; }
    // k1, k2: list_queues 출력 표
    const rows = k === 1 ? [] : [['orders.queue', 'rabbit@rabbit1', 0], ['payments.queue', 'rabbit@rabbit2', 1], ['emails.queue', 'rabbit@rabbit3', 2]];
    const x0 = 230, y0 = 312;
    mono(x0 - 10, y0 - 12, '$ rabbitmqctl list_queues name node messages', { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 0.2) : 1 });
    [['name', 0], ['node', 190], ['messages', 380]].forEach(([h, dx]) => mono(x0 + dx, y0 + 14, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: k === 1 ? fade(u, 0.8) : 1 }));
    if (k === 1) { el('rect', { x: x0 + 180, y: y0, width: 150, height: 22, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.4) });
      note(x0 + 340, y0 + 50, '← 이 칸이 호스팅 노드', fade(u, 1.6), { fill: ACC }); return; }
    rows.forEach(([n, nd, i], r) => { const s = seg(u, 0.2 + r * 0.35, 0.5 + r * 0.35), y = y0 + 40 + r * 24;
      mono(x0, y, n, { 'font-size': 14, opacity: s }); mono(x0 + 190, y, nd, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: s }); mono(x0 + 380, y, '0', { 'font-size': 14, opacity: s });
      if (s >= 1) el('rect', { x: QX[i] - 79, y: 203, width: 158, height: 42, rx: 11, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: 0.6 }); }); }

  // ---------- 3. 프록시 ----------
  const PN = { r2: [400, 150], r1: [660, 150], r3: [880, 150] }, CL = [70, 160], LB = [220, 150];
  function s3(t, c) { const { k, u } = c;
    node(PN.r2[0], PN.r2[1], 'rabbit2', { lamp: k === 0 || k === 1 || k === 5 ? ACC : GOOD });
    node(PN.r1[0], PN.r1[1], 'rabbit1', {}); node(PN.r3[0], PN.r3[1], 'rabbit3', {});
    queue(PN.r1[0], 268, 'orders.queue', 4, { w: 140 });
    person(CL[0], CL[1], '클라이언트', {});
    const direct = [[CL[0] + 30, CL[1]], [PN.r2[0] - 58, PN.r2[1]]], hop = [[PN.r2[0] + 58, PN.r2[1]], [PN.r1[0] - 58, PN.r1[1]]];
    if (k <= 2) { el('line', { x1: direct[0][0], y1: direct[0][1], x2: direct[1][0], y2: direct[1][1], stroke: GRID, 'stroke-width': 2.5 });
      el('line', { x1: hop[0][0], y1: hop[0][1], x2: hop[1][0], y2: hop[1][1], stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
      sub((hop[0][0] + hop[1][0]) / 2, PN.r1[1] - 16, '내부 홉 (25672)', 1, { fill: WARN, 'font-weight': 700 }); }
    if (k === 0) { dot(direct.concat(hop, [[PN.r1[0], 250]]), seg(u, 0.2, 1.4), ACC, 7);
      dot([[PN.r1[0], 250], [PN.r1[0] - 58, PN.r1[1]], [PN.r2[0] + 58, PN.r2[1]], [CL[0] + 30, CL[1]]], seg(u, 1.5, 2.5), INK, 7);
      pill(CL[0] + 160, 60, 'get queue=orders.queue', ACC, pop(u, 0.1), { mono: true, fs: 13.5 });
      note(30, 395, '클라이언트는 큐가 rabbit1에 있는지 몰라도 된다', fade(u, 2.2)); return; }
    if (k === 1) { const y = 350;
      mono(40, y + 34, '$ rabbitmqctl list_connections name node peer_host', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.1) });
      mono(40, y, '127.0.0.1:51xxx', { 'font-size': 14.5, opacity: fade(u, 0.5) });
      mono(220, y, 'rabbit@rabbit2', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) }); mono(380, y, '10.0.0.9', { 'font-size': 14.5, opacity: fade(u, 0.8) });
      el('rect', { x: 212, y: y - 18, width: 140, height: 26, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.0) });
      grow(282, y - 22, PN.r2[0] - 10, PN.r2[1] + 76, E(u, 1.0, 1.6), ACC);
      note(540, y, '연결 node ≠ 큐 node', fade(u, 1.8), { 'font-size': 17, fill: WARN, 'font-weight': 800 }); return; }
    if (k === 2) { const parts = ['amqp://user:pass@', 'rabbit1', ',', 'rabbit2', ',', 'rabbit3', '/%2f'], cw = 16 * 0.6;
      let n = 0; const at = {}; parts.forEach((p) => { if (/rabbit\d/.test(p)) at[p] = 60 + (n + p.length / 2) * cw; n += p.length; });
      R.spans(60, 360, parts.map((p) => [p, /rabbit/.test(p) ? { fill: INFO, 'font-weight': 800 } : { fill: MUT }]), { 'font-size': 16, opacity: fade(u, 0.1) });
      const order = ['rabbit1', 'rabbit2', 'rabbit3'], pick = Math.min(2, Math.floor(E(u, 0.6, 2.2) * 3));
      order.forEach((n, i) => { const on = i <= pick && u > 0.6; mono(at[n], 386, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: on ? INFO : OFF, 'text-anchor': 'middle' }); });
      note(560, 360, '앞에서부터 차례로 시도', fade(u, 0.8), { fill: INFO });
      note(560, 392, '접속만 바뀐다 · 큐 데이터는 그대로', fade(u, 2.0), { fill: MUT }); return; }
    // k3~: HAProxy 로 연결 분산
    card(LB[0], LB[1], 140, 78, { rx: 10, stroke: INFO, sw: 2.5, fill: INFOBG, s: k === 3 ? pop(u, 0.1) : 1 });
    tx(LB[0], LB[1] - 12, 'HAProxy', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO });
    mono(LB[0], LB[1] + 10, '*:5672 tcp', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK }); mono(LB[0], LB[1] + 28, 'roundrobin', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK });
    el('line', { x1: CL[0] + 30, y1: CL[1], x2: LB[0] - 70, y2: LB[1], stroke: GRID, 'stroke-width': 2.5 });
    const tgt = [PN.r1, PN.r2, PN.r3], path = (p) => [[LB[0] + 70, LB[1]], [LB[0] + 110, 60], [p[0] - 30, 60], [p[0], PN.r1[1] - 42]];
    tgt.forEach((p) => el('polyline', { points: path(p).map((q) => q.join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    if (k === 3) { const names = ['rabbit1', 'rabbit2', 'rabbit3'], cnt = [0, 0, 0];   // 실행 결과: 6연결 → 2·2·2 (rr 재현)
      for (let i = 0; i < 6; i++) { const v = seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3); dot([[CL[0] + 30, CL[1]]].concat(path(tgt[i % 3])), v, ACC, 6); if (v >= 1) cnt[i % 3]++; }
      tgt.forEach((p, i) => { const pos = [PN.r1, PN.r2, PN.r3][i]; card(pos[0], 266 + (i === 0 ? 60 : 0), 92, 30, { rx: 15, text: `연결 ${cnt[i]}`, fs: 14, mono: true, fw: 700, stroke: ACC, color: ACC, op: cnt[i] ? 1 : 0.35 }); });
      note(30, 395, 'AMQP는 오래 가는 연결이라 연결 개수로 고르게 퍼진다', fade(u, 2.2)); return; }
    if (k === 4) { tgt.forEach((p, i) => { const pv = ((t * 0.6 + i * 0.2) % 1); dot(path(p), pv, INFO, 5); check(p[0] + 70, p[1] - 40, 10, pop(u, 0.5 + i * 0.35)); });
      mono(LB[0], 262, 'tcp-check', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      note(30, 360, '죽은 노드는 자동으로 빠진다', fade(u, 1.6), { fill: GOOD });
      note(30, 392, '노드는 살아 있는데 그 큐만 죽은 경우는 못 본다', fade(u, 2.2), { fill: WARN }); return; }
    // k5: 직결 vs 경유
    note(60, 300, '호스팅 노드 직결', fade(u, 0.2), { fill: GOOD }); mono(330, 300, '내부 홉 0', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
    note(60, 340, '다른 노드 경유 (프록시)', fade(u, 0.9), { fill: WARN }); mono(330, 340, '내부 홉 1', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0) });
    dot([[LB[0] + 70, LB[1]], [LB[0] + 110, 60], [PN.r1[0] - 30, 60], [PN.r1[0], PN.r1[1] - 42]], ((t * 0.5) % 1), GOOD, 6);
    dot([[LB[0] + 70, LB[1]], [LB[0] + 110, 60], [PN.r2[0] - 30, 60], [PN.r2[0], PN.r2[1] - 42], [PN.r2[0], PN.r2[1]], [PN.r1[0] - 58, PN.r1[1]]], ((t * 0.5 + 0.5) % 1), WARN, 6);
    note(30, 395, '핫한 큐는 호스팅 노드에 직접 붙여 홉을 줄인다', fade(u, 1.8)); }

  // ---------- 4. 노드 장애 ----------
  const FX = [200, 480, 760];
  function s4(t, c) { const { k, u } = c;
    const down = k <= 2 || k === 4, back = k === 3;
    const kinds = ['p', 't', 'p', 'p', 't'];   // 영속(p) · 비영속(t) 섞인 orders.queue (예시)
    FX.forEach((x, i) => node(x, 90, 'rabbit' + (i + 1), i === 0 ? { down, downS: k === 0 ? pop(u, 0.3) : 1, lamp: back ? WARN : null } : {}));
    const names = ['orders.queue', 'payments.queue', 'emails.queue'];
    FX.forEach((x, i) => { if (i === 0) {
        if (back) queue(x, 224, names[0], 5, { kinds, cellOp: (j) => kinds[j] === 't' ? 1 - E(u, 1.2, 2.0) : fade(u, 0.3 + j * 0.15) });
        else queue(x, 224, names[0], 5, { kinds, down: down && (k > 0 || u > 0.5), cellOp: (j) => (k === 4 ? 1 : 1) });
      } else queue(x, 224, names[i], 3, {}); });
    if (k === 0) { mono(FX[0], 300, 'stop_app', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      note(330, 330, 'rabbit2 · rabbit3의 큐는 그대로 돈다', fade(u, 1.4), { fill: GOOD });
      note(330, 362, 'orders.queue만 접근 불가', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 1) { const y = 340;
      mono(40, y - 30, '$ rabbitmqctl cluster_status', { 'font-size': 14, fill: MUT });
      mono(40, y, 'Running Nodes:', { 'font-size': 15, 'font-weight': 700 });
      ['rabbit@rabbit1', 'rabbit@rabbit2', 'rabbit@rabbit3'].forEach((n, i) => { const x = 190 + i * 170;
        mono(x, y, n, { 'font-size': 15, fill: i === 0 ? BAD : GOOD, 'font-weight': 700, opacity: i === 0 ? 1 - 0.6 * E(u, 0.6, 1.2) : 1 });
        if (i === 0) el('line', { x1: x, y1: y - 5, x2: x + tw(n, 15) * E(u, 0.6, 1.2), y2: y - 5, stroke: BAD, 'stroke-width': 2.5 }); });
      const rn = tween(3, 2, u); mono(760, y + 44, `running ${Math.round(rn)} / 3`, { 'font-size': 17, 'font-weight': 800, fill: WARN });
      note(40, y + 44, '큐 목록은 그대로 보인다 (메타데이터)', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 2) { const y0 = 316, rows = [['orders.queue', 'rabbit@rabbit1', 'down', BAD], ['payments.queue', 'rabbit@rabbit2', 'running', GOOD], ['emails.queue', 'rabbit@rabbit3', 'running', GOOD]];
      mono(40, y0, 'name', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(230, y0, 'node', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(420, y0, 'state', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      rows.forEach(([a, b, st, col], r) => { const y = y0 + 26 + r * 24, op = fade(u, 0.2 + r * 0.3);
        mono(40, y, a, { 'font-size': 14, opacity: op }); mono(230, y, b, { 'font-size': 14, opacity: op }); mono(420, y, st, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: op }); });
      // 발행 시도: orders 로 가는 점은 튕긴다
      const v = seg(u, 1.0, 1.8); dot([[FX[0] + 130, 300], [FX[0] + 88, 226]], v, ACC, 6); if (u > 1.8) cross(FX[0] + 92, 226, 10, pop(u, 1.8));
      [1, 2].forEach((j) => dot([[FX[j] + 100, 330], [FX[j], 250]], seg(u, 1.0 + j * 0.2, 1.8 + j * 0.2), ACC, 6));
      note(600, 360, '장애 범위 = 큐 단위', fade(u, 2.2), { fill: BAD, 'font-size': 17, 'font-weight': 800 }); return; }
    if (k === 3) { mono(FX[0], 300, 'start_app', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      el('rect', { x: 330, y: 312, width: 16, height: 22, rx: 3, fill: ACC }); note(356, 329, 'durable 큐 + persistent 메시지 → 디스크에서 복구', fade(u, 0.6), { fill: GOOD });
      el('rect', { x: 330, y: 352, width: 16, height: 22, rx: 3, fill: PANEL, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '3 2' }); note(356, 369, '비영속(transient) 메시지 → 유실', fade(u, 1.4), { fill: BAD });
      note(356, 404, '다운 동안의 중단 시간은 되돌릴 수 없다', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); tx(40, 404, '칸 구성은 예시', { 'font-size': 13.5, fill: MUT }); return; }
    // k4: 원인과 해법
    card(250, 340, 380, 72, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 0.2) });
    tx(250, 334, '원인: 큐 데이터가 한 노드에만 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
    tx(250, 358, 'classic queue · 사본 1개', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) });
    card(700, 340, 400, 72, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 1.0) });
    tx(700, 334, '해법: x-queue-type: quorum', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, class: 'mono', opacity: fade(u, 1.1) });
    tx(700, 358, 'Raft로 다수 노드에 복제 (IV-1-2)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) });
    grow(445, 340, 495, 340, E(u, 0.8, 1.1), MUT); }

  // ---------- 5. 파티션 처리 ----------
  const SN = [[170, 120, 'rabbit1'], [420, 120, 'rabbit3'], [770, 120, 'rabbit2']];
  function zig(x, y0, y1, u) { if (u <= 0) return; const pts = []; for (let y = y0, i = 0; y <= lerp(y0, y1, u); y += 14, i++) pts.push(`${x + (i % 2 ? 9 : -9)},${y}`);
    el('polyline', { points: pts.join(' '), fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-linejoin': 'round' }); }
  function s5(t, c) { const { k, u } = c;
    const split = k <= 1 || k === 5, paused = k === 1 || k === 5;
    el('line', { x1: SN[0][0] + 60, y1: 120, x2: SN[1][0] - 60, y2: 120, stroke: ACC, 'stroke-width': 2.5 });
    el('line', { x1: SN[1][0] + 60, y1: 120, x2: SN[2][0] - 60, y2: 120, stroke: split ? GRID : ACC, 'stroke-width': 2.5, 'stroke-dasharray': split ? '5 6' : null });
    SN.forEach(([x, y, n], i) => node(x, y, n, i === 2 && paused ? { pause: true, pauseS: k === 1 ? pop(u, 1.0) : 1 } : {}));
    if (split) zig(600, 60, 190, k === 0 ? E(u, 0.3, 1.0) : 1);
    if (k === 0) { // 설정 없음: 양쪽이 따로 받는다
      const a = Math.floor(E(u, 1.0, 2.4) * 4), b = Math.floor(E(u, 1.2, 2.4) * 3);
      queue(295, 270, 'orders (다수파 쪽)', a, { w: 150 }); queue(770, 270, 'orders (소수파 쪽)', b, { w: 150, col: WARN, stroke: WARN });
      note(30, 395, '설정이 없으면(ignore) 양쪽이 각자 받는다 → split-brain', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 1 || k === 5) { boundary(80, 520, 40, 210, '다수파 2/3 · 계속 서비스', fade(u, k === 1 ? 1.4 : 0));
      sub(770, 220, '소수파 1/3 · 스스로 정지', 1, { fill: WARN, 'font-weight': 700, 'font-size': 14.5, opacity: k === 1 ? fade(u, 1.2) : 1 }); }
    if (k === 1) { [['ignore', '감지만'], ['autoheal', '연결 많은 쪽 생존'], ['pause_minority', '소수파 정지']].forEach(([a, b], i) => { const on = i === 2, s = pop(u, 0.1 + i * 0.25);
        card(170 + i * 300, 300, 270, 58, { rx: 12, stroke: on ? ACC : GRID, sw: on ? 3 : 1.6, fill: on ? ACCBG : PANEL, s });
        mono(170 + i * 300, 298, a, { 'font-size': 15.5, 'font-weight': 800, fill: on ? ACC : INK, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.25) });
        tx(170 + i * 300, 319, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.25) }); });
      note(30, 395, '가용성을 조금 내주고 일관성을 지킨다 (RabbitMQ 4.2까지)', fade(u, 2.0)); return; }
    if (k === 2) { const lines = ['peer_discovery_backend = classic_config', 'classic_config.nodes.1 = rabbit@rabbit1', 'classic_config.nodes.2 = rabbit@rabbit2', 'classic_config.nodes.3 = rabbit@rabbit3'];
      lines.forEach((s, i) => mono(60, 270 + i * 30, s, { 'font-size': 15, fill: i === 0 ? INFO : INK, 'font-weight': i === 0 ? 700 : 500, opacity: fade(u, 0.2 + i * 0.3) }));
      [[0, 2], [1, 2], [0, 1]].forEach(([a, b], i) => { const v = E(u, 1.3 + i * 0.3, 2.0 + i * 0.3); if (v <= 0) return;
        const p = SN[a], q = SN[b]; el('path', { d: `M${p[0]},${p[1] - 44} Q${(p[0] + q[0]) / 2},${-10 + i * 12} ${q[0]},${q[1] - 44}`, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': `${v * 900} 900`, opacity: 0.8 }); });
      note(620, 300, '기동하면 서로를 찾아', fade(u, 1.6), { fill: INFO }); note(620, 330, '클러스터를 다시 만든다', fade(u, 1.8), { fill: INFO }); return; }
    if (k === 3) { // net_ticktime: 노드 사이 heartbeat
      [[0, 1], [1, 2]].forEach(([a, b], i) => { for (let m = 0; m < 2; m++) dot([[SN[a][0] + 60, 128], [SN[b][0] - 60, 128]], ((t * 0.5 + m / 2 + i * 0.25) % 1), INFO, 5); });
      clock(160, 310, 42, E(u, 0.2, 2.4), INFO); mono(160, 378, 'net_ticktime = 60', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      note(260, 296, '짧게: 빨리 감지 · GC 멈춤도 장애로 오인', fade(u, 0.8), { fill: WARN });
      note(260, 330, '길게: 오탐은 줄지만 감지가 늦다', fade(u, 1.4), { fill: MUT });
      note(260, 364, '기본값 60초에서 크게 낮추지 않는다', fade(u, 2.0)); return; }
    if (k === 4) { // default_queue_type = quorum → 새 큐가 세 노드에 복제
      queue(SN[0][0], 270, 'orders (리더)', 3, { w: 130 });
      [1, 2].forEach((j) => { const v = E(u, 0.6 + (j - 1) * 0.4, 1.5 + (j - 1) * 0.4); if (v > 0 && v < 1) dot([[SN[0][0], 270], [SN[j][0], 270]], v, ACC, 7);
        queue(SN[j][0], 270, 'orders (복제본)', 3, { w: 130, op: fade(u, 1.4 + (j - 1) * 0.4) }); });
      mono(40, 360, 'default_queue_type = quorum', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
      note(40, 395, '큐 타입은 policy로 못 바꾼다 · 새 큐의 기본값을 바꾼다', fade(u, 2.0), { fill: MUT }); return; }
    // k5: 체크리스트
    const items = ['노드 수는 홀수 (3 또는 5)', 'pause_minority (4.2까지)', '모든 노드 같은 .erlang.cookie', '4369 / 25672 / 5672 개방', '핵심 큐는 quorum 타입', 'LB + 다중 호스트 연결'];
    items.forEach((s, i) => { const x = i < 3 ? 70 : 500, y = 280 + (i % 3) * 42; check(x, y - 5, 9, pop(u, 0.2 + i * 0.3)); tx(x + 22, y, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.25 + i * 0.3) }); }); }

  // 장면마다 확인 문제 하나 (a 는 0부터)
  const quiz = [
    { q: 'rabbit2를 rabbit1 클러스터에 붙일 때 서로를 인증하는 수단은 무엇인가?',
      o: ['세 노드가 같은 .erlang.cookie 파일', 'AMQP 사용자 이름과 비밀번호', 'HAProxy의 tcp-check'], a: 0,
      why: 'Erlang cookie가 노드 간 인증 토큰이다. 세 노드의 cookie가 다르면 join_cluster가 거부된다.' },
    { q: 'rabbit1에 접속해 orders.queue를 선언했다. rabbit2와 rabbit3가 갖는 것은 무엇인가?',
      o: ['orders.queue 메시지의 복제본', '아무것도 없다', '큐 이름 같은 메타데이터뿐'], a: 2,
      why: 'classic queue는 선언한 노드 한 곳에만 메시지를 둔다. 다른 노드는 메타데이터로 큐가 있다는 것만 안다.' },
    { q: 'rabbit2에 연결해 rabbit1 소유 큐를 꺼낼 때 생기는 일은 무엇인가?',
      o: ['rabbit1 소유 큐라서 연결이 거부된다', 'rabbit2가 rabbit1로 요청을 전달해 내부 홉이 한 번 더 생긴다', '큐가 rabbit2로 옮겨 와 그 뒤로는 홉이 없다'], a: 1,
      why: '접속 노드가 호스팅 노드로 프록시한다. 클라이언트는 위치를 몰라도 되지만 노드 간 네트워크를 한 번 더 탄다.' },
    { q: 'rabbit1이 다운됐을 때 멈추는 것은 무엇인가?',
      o: ['클러스터 전체', '세 노드의 모든 큐', 'rabbit1이 호스팅하던 orders.queue'], a: 2,
      why: '장애 범위는 큐 단위로 갈린다. payments.queue와 emails.queue는 다른 노드에 있어 그대로 돈다.' },
    { q: '3노드 클러스터가 2|1로 갈라졌을 때 pause_minority가 하는 일은 무엇인가?',
      o: ['1노드 쪽이 스스로 멈춘다', '양쪽 모두 계속 서비스한다', '클라이언트 연결이 많은 쪽만 남긴다'], a: 0,
      why: '소수파(1/3)가 멈추고 다수파(2/3)가 서비스를 잇는다. 연결 수로 승자를 고르는 것은 autoheal이다.' },
  ];

  const summary = [
    '같은 cookie를 가진 노드를 join_cluster로 묶으면 메타데이터만 전 노드가 공유한다.',
    'classic queue의 메시지는 선언한 노드 한 곳에만 있고, 다른 노드는 프록시로 대신 다녀온다.',
    '그 노드가 죽으면 그 큐만 멈추고, 비영속 메시지는 노드와 함께 사라진다.',
    '파티션에는 홀수 노드와 pause_minority로 대비하고, 큐의 HA는 quorum 큐가 맡는다.',
  ];
  const review = [
    { q: 'HAProxy 헬스체크는 세 노드 모두 통과인데 orders.queue에서만 소비가 실패한다. 먼저 볼 것은?',
      o: ['HAProxy의 balance 설정', '클라이언트 연결 문자열의 호스트 순서', 'list_queues name node state로 orders.queue의 호스팅 노드 상태'], a: 2,
      why: 'tcp-check는 노드가 살아 있는지만 본다. 큐가 사는 노드와 그 큐의 state를 봐야 큐 단위 장애가 보인다.' },
    { q: '큐 3개를 노드 3대에 나눠 선언했더니 처리량은 늘었다. 그런데 한 노드가 죽자 그 큐가 멈췄다. 맞는 해석은?',
      o: ['노드 수가 짝수가 아니어서 그렇다', '분산은 확장이고, 큐 하나의 복제는 따로 quorum으로 해야 한다', 'pause_minority가 그 큐를 멈췄다'], a: 1,
      why: '큐를 나눠 두면 부하는 퍼지지만 각 큐의 데이터는 여전히 한 노드에 있다. 데이터 이중화는 quorum 큐가 한다.' },
    { q: '4노드 클러스터가 2|2로 갈라졌다. pause_minority라면 어떻게 되나?',
      o: ['양쪽 모두 절반이라 둘 다 멈춘다', '왼쪽 그룹만 남는다', '양쪽 모두 계속 서비스한다'], a: 0,
      why: '절반 이하인 쪽이 소수파로 멈추므로 2|2면 둘 다 멈춘다. 그래서 노드 수를 홀수로 맞춘다.' },
  ];

  R.page({ title: 'RabbitMQ 클래식 클러스터', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
