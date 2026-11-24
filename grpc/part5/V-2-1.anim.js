/* V-2-1 Load Balancing — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   요청 수 [30,0,0] · [10,10,10] · [0,30,0], 재시도 3번은 python grpcio 1.85 로 백엔드 3대와
   "연결마다 백엔드를 고르는" TCP 프록시(L4 흉내)를 띄워 RPC 30번을 보내 센 실제 값이다.
   CPU 90%/5%, Pod IP 10.1.4.11~13 은 페이지의 예시값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, clock, meters, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  const PODS = [['Pod-A', 90], ['Pod-B', 210], ['Pod-C', 330]];
  const PX = 740;
  // 백엔드 3대 + 받은 요청 수 막대
  function pods(cnt, u, o) { o = o || {}; const max = o.max || 30;
    PODS.forEach(([n, y], i) => { const v = cnt[i], idle = o.idle && v === 0;
      server(PX, y, null, { s: 0.62, lamp: idle ? OFF : v > 0 ? (o.hot && i === 0 ? BAD : GOOD) : OFF, stroke: idle ? OFF : INK });
      tx(PX - 78, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: idle ? MUT : INK, 'text-anchor': 'end' });
      if (o.count !== false) { el('rect', { x: PX + 48, y: y - 9, width: 90, height: 18, rx: 4, fill: SOFT });
        el('rect', { x: PX + 48, y: y - 9, width: Math.max(2, 90 * v / max), height: 18, rx: 4, fill: o.hot && i === 0 ? BAD : ACC });
        mono(PX + 146, y + 5, String(Math.round(v)), { 'font-size': 14.5, 'font-weight': 700 }); } }); }
  const tweenArr = (a, b, u) => b.map((v, i) => tween(a ? a[i] : 0, v, u));
  function client(x, y, s) { person(x, y, null, { s: s ?? 1 }); lbl(x, y + 50, '클라이언트', s ?? 1, { 'font-size': 14 }); }

  // ───────── 1. L4 의 함정
  function s1(t, c) { const { k, u } = c;
    if (k === 3) { // REST 와 gRPC 를 같은 L4 프록시 뒤에서
      [['REST 식: 요청마다 새 연결', 30, [10, 10, 10], 0], ['gRPC: 연결 1개를 계속 씀', 1, [30, 0, 0], 1]].forEach(([n, conns, cnt, i]) => { const x0 = 30 + i * 470, a = 0.2 + i * 1.0;
        zone(x0, 40, 430, 330, n, { fill: SOFT, op: fade(u, a) });
        for (let j = 0; j < Math.min(conns, 9); j++) { const ty = [110, 210, 310][j % 3]; el('line', { x1: x0 + 60, y1: 210, x2: x0 + 300, y2: ty, stroke: i ? BAD : ACC, 'stroke-width': i ? 8 : 1.6, opacity: fade(u, a + 0.2 + j * 0.05) * (i ? 0.6 : 1) }); }
        person(x0 + 40, 210, null, { s: 0.8, op: fade(u, a) });
        cnt.forEach((v, j) => { const y = [110, 210, 310][j], g = E(u, a + 0.4, a + 1.0);
          card(x0 + 340, y, 70, 40, { rx: 8, text: ['A', 'B', 'C'][j], fs: 15, op: fade(u, a + 0.2), stroke: v ? INK : OFF });
          mono(x0 + 390, y + 5, String(Math.round(v * g)), { 'font-size': 16, 'font-weight': 800, fill: v ? INK : MUT, opacity: fade(u, a + 0.4) }); });
        mono(x0 + 215, 355, `연결 ${conns}개 → [${cnt.join(', ')}]`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: i ? BAD : GOOD, opacity: fade(u, a + 0.9) }); });
      sub(480, 400, 'RPC 30번 · 파이썬 grpcio 와 연결 단위 프록시로 센 실제 값', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 5) { tx(60, 90, 'L4 LB 가 나누는 단위', { 'font-size': 16, 'font-weight': 700 }); tx(60, 250, 'gRPC 가 나누고 싶은 단위', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      el('rect', { x: 60, y: 110, width: 840 * E(u, 0.2, 0.9), height: 40, rx: 8, fill: BAD, opacity: 0.8 }); mono(80, 136, 'TCP 연결 1개', { 'font-size': 15, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.7) });
      for (let i = 0; i < 24; i++) { const a = fade(u, 1.1 + i * 0.04); el('rect', { x: 60 + i * 35, y: 270, width: 28, height: 40, rx: 5, fill: ACC, opacity: a }); }
      mono(60, 336, 'RPC 하나하나', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) });
      pill(480, 385, '단위가 어긋나면 장비를 늘려도 그대로다', BAD, pop(u, 2.2)); return; }
    if (k === 6) { client(90, 210);
      [['(A) 클라이언트가 나눈다', 'client-side LB · round_robin', 120], ['(B) L7 프록시가 나눈다', 'Envoy · 서비스메시', 300]].forEach(([a, b, y], i) => {
        el('path', { d: `M130,210 C250,210 260,${y} 380,${y}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 0.3 + i * 0.6, 0.9 + i * 0.6)) });
        card(620, y, 460, 80, { rx: 12, stroke: ACC, s: pop(u, 0.8 + i * 0.6) }); tx(410, y - 6, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.6) }); tx(410, y + 20, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9 + i * 0.6) }); });
      return; }
    // 기본 그림: 클라이언트 → VIP(L4) → Pod 3대
    client(80, 210);
    card(380, 210, 170, 70, { rx: 10, text: 'L4 LB\nbackend.svc (VIP)', fs: 14.5, stroke: k === 4 ? BAD : INK, s: k === 0 ? pop(u, 0.3) : 1 });
    PODS.forEach(([n, y], i) => el('line', { x1: 466, y1: 210, x2: PX - 50, y2: y, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 5', opacity: k === 0 ? fade(u, 0.8 + i * 0.2) : 1 }));
    if (k === 0) { pods([0, 0, 0], u, { count: false }); sub(380, 290, '새 연결이 올 때만 백엔드를 하나 고른다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    const pipeU = k === 1 ? E(u, 0.2, 0.9) : 1;
    el('line', { x1: 120, y1: 210, x2: lerp(120, 294, pipeU), y2: 210, stroke: BAD, 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.35 });
    if (pipeU >= 1) el('line', { x1: 466, y1: 210, x2: PX - 50, y2: 90, stroke: BAD, 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.35 });
    if (k >= 1) for (let i = 0; i < 5; i++) dot([[120, 210], [294, 210], [466, 210], [PX - 50, 90]], ((t * 0.45 + i / 5) % 1), BAD, 5);
    if (k === 1) { ['1', '3', '5', '7'].forEach((s, i) => mono(150 + i * 36, 186, s, { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.2) }));
      tx(205, 160, 'HTTP/2 스트림 id', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      pods([lerp(0, 30, E(u, 1.0, 2.4)), 0, 0], u); sub(380, 300, '연결 하나에 RPC 를 계속 싣는다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { pods([30, 0, 0], u, { idle: true });
      card(200, 340, 300, 50, { rx: 8, fill: SOFT, stroke: GRID, s: pop(u, 0.3) }); mono(70, 346, '주소 목록: [ VIP 1개 ]', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(PX - 10, 400, 'Pod-B · Pod-C 미사용', { 'font-size': 15, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); return; }
    // k4: CPU
    pods([30, 0, 0], u, { hot: true, count: false });
    [90, 5, 5].forEach((v, i) => { const y = PODS[i][1], g = tween(0, v, u); el('rect', { x: PX + 48, y: y - 9, width: 90, height: 18, rx: 4, fill: SOFT });
      el('rect', { x: PX + 48, y: y - 9, width: 90 * g / 100, height: 18, rx: 4, fill: v > 50 ? BAD : GOOD }); mono(PX + 146, y + 5, Math.round(g) + '%', { 'font-size': 14.5, 'font-weight': 700, fill: v > 50 ? BAD : INK }); });
    tx(PX + 92, 60, 'CPU', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' });
    pill(380, 360, '"스케일 아웃 했는데 왜 안 나눠지죠?"', BAD, pop(u, 1.6)); sub(380, 400, 'CPU 수치는 페이지 예시', fade(u, 1.9)); }

  // ───────── 2. round_robin
  function chan(u, sub3, o) { o = o || {}; client(70, 210); card(270, 210, 150, 120, { rx: 12, stroke: ACC, sw: 2.2 }); mono(270, 165, 'ClientConn', { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
    mono(270, 196, o.policy || '', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: o.policy === 'pick_first' ? BAD : INK });
    PODS.forEach(([n, y], i) => { const on = sub3[i]; el('line', { x1: 346, y1: 210, x2: PX - 50, y2: y, stroke: on ? ACC : GRID, 'stroke-width': on ? 3 : 1.5, 'stroke-dasharray': on ? null : '5 5' });
      if (on) mono(470, lerp(210, y, 0.35) - 6, 'sub' + (i + 1), { 'font-size': 13.5, fill: ACC, opacity: o.subOp ?? 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { snippet(60, 70, ['{', '  "loadBalancingConfig": [', '    { "round_robin": {} }', '  ]', '}'], { w: 380, fs: 16, op: fade(u, 0.2) });
      card(720, 110, 300, 60, { rx: 10, text: 'resolver: 주소 3개', fs: 15, stroke: INFO, s: pop(u, 0.9) });
      grow(450, 160, 560, 250, seg(u, 1.2, 1.6), MUT); grow(720, 140, 720, 220, seg(u, 1.3, 1.7), MUT);
      card(720, 270, 300, 70, { rx: 12, stroke: ACC, fill: ACCBG, text: 'LB 정책 결정', fs: 16, color: ACC, s: pop(u, 1.8) }); return; }
    if (k === 1 || k === 2 || k === 7) { const rr = k !== 2;
      if (k === 7) { [['pick_first', [1, 0, 0], [30, 0, 0], 40], ['round_robin', [1, 1, 1], [10, 10, 10], 500]].forEach(([n, on, cnt, x0], i) => { const a = 0.2 + i * 0.8;
          zone(x0, 50, 420, 300, n, { fill: SOFT, op: fade(u, a) });
          on.forEach((v, j) => { const y = 120 + j * 80; el('line', { x1: x0 + 80, y1: 200, x2: x0 + 270, y2: y, stroke: v ? ACC : GRID, 'stroke-width': v ? 3 : 1.5, 'stroke-dasharray': v ? null : '5 5', opacity: fade(u, a + 0.2) });
            card(x0 + 310, y, 70, 40, { rx: 8, text: ['A', 'B', 'C'][j], fs: 15, op: fade(u, a + 0.3), stroke: v ? INK : OFF }); mono(x0 + 360, y + 5, String(cnt[j]), { 'font-size': 16, 'font-weight': 800, opacity: fade(u, a + 0.5) }); });
          person(x0 + 50, 200, null, { s: 0.75, op: fade(u, a) }); });
        tx(250, 390, '게이트웨이 하나 뒤라면 충분', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); tx(710, 390, '백엔드를 직접 알 때 표준', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
      chan(u, rr ? [1, 1, 1] : [1, 0, 0], { policy: rr ? 'round_robin' : 'pick_first' });
      const route = (j) => [[346, 210], [PX - 50, PODS[j][1]]];
      for (let i = 0; i < 6; i++) { const j = rr ? i % 3 : 0; dot(route(j), seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3), rr ? ACC : BAD, 6); }
      const cnt = rr ? [10, 10, 10] : [30, 0, 0]; pods(tweenArr(k === 2 ? [10, 10, 10] : [0, 0, 0], cnt, u), u, { idle: !rr });
      mono(PX + 30, 400, `RPC 30번 → [${cnt.join(', ')}]`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: rr ? GOOD : BAD, opacity: fade(u, 1.9) });
      sub(270, 330, rr ? '서브채널을 요청마다 돌아가며' : '설정이 없으면 첫 주소 하나만', fade(u, 1.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { snippet(60, 70, ['"methodConfig": [{', '  "name": [{"service": "user.v1.UserService"}],', '  "timeout": "5s",'], { fs: 15, op: fade(u, 0.2) });
      clock(720, 250, 70, E(u, 0.6, 2.4) * 0.6, WARN, '5s 안에 끝나야 한다'); card(300, 280, 380, 60, { rx: 10, text: 'UserService 의 모든 메서드에 적용', fs: 15, s: pop(u, 1.2) }); return; }
    if (k === 4) { tx(60, 70, 'retryPolicy  maxAttempts 3 · UNAVAILABLE', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      const xs = [100, 380, 660]; xs.forEach((x, i) => { const a = 0.3 + i * 0.6;
        card(x + 90, 170, 180, 56, { rx: 8, text: `시도 ${i + 1}`, fs: 16, stroke: BAD, s: pop(u, a) }); mono(x + 90, 222, 'UNAVAILABLE', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, a + 0.2) });
        if (i < 2) { grow(x + 182, 170, x + 278, 170, seg(u, a + 0.3, a + 0.6), MUT); mono(x + 230, 150, i ? '≤0.2s' : '≤0.1s', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a + 0.4) }); } });
      card(480, 310, 560, 70, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 2.1) });
      tx(480, 305, '서버가 받은 시도 3번 = 첫 시도 1 + 재시도 2', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(480, 330, '파이썬 grpcio 로 늘 UNAVAILABLE 을 돌려주는 서버를 세어 본 값', fade(u, 2.3), { 'font-size': 13.5 }); return; }
    if (k === 5) { snippet(60, 80, ['conn, _ := grpc.NewClient(', '    "dns:///backend.svc.cluster.local:50051",', '    grpc.WithDefaultServiceConfig(cfg),', '    grpc.WithTransportCredentials(insecure.NewCredentials()),', ')'], { fs: 15.5, op: fade(u, 0.2) });
      el('rect', { x: 112, y: 116, width: 80, height: 24, rx: 5, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, 0.9) });
      el('rect', { x: 112, y: 140, width: 322, height: 24, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.4) });
      pill(300, 300, 'dns:/// → 주소 여러 개', INFO, pop(u, 1.1), { fs: 15 }); pill(660, 300, 'cfg → round_robin', ACC, pop(u, 1.6), { fs: 15 }); return; }
    [['①', 'scheme', '주소 목록을 연다'], ['②', 'round_robin', '목록을 요청마다 돈다'], ['③', '코드 그대로', '설정만 바뀐다']].forEach(([n, a, b], i) => { const x = 180 + i * 300, s = pop(u, 0.2 + i * 0.5);
      card(x, 200, 250, 150, { rx: 14, stroke: ACC, s }); tx(x, 160, n, { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.5) });
      mono(x, 205, a, { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.5) }); tx(x, 240, b, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.5) }); }); }

  // ───────── 3. Name Resolver
  const IPS = ['10.1.4.11', '10.1.4.12', '10.1.4.13'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(170, 120, 260, 56, { rx: 10, text: 'dns:/// resolver', mono: true, fs: 16, stroke: INFO, s: pop(u, 0.2) });
      fly(300, 120, 640, 120, seg(u, 0.6, 1.3), 'A? backend-headless…', { mono: true, fill: INFO });
      card(760, 120, 230, 56, { rx: 10, text: 'k8s DNS', fs: 16, s: pop(u, 0.4) });
      IPS.forEach((ip, i) => { const y = 220 + i * 50; card(760, y, 200, 40, { rx: 8, text: ip, mono: true, fs: 15, stroke: ACC, s: pop(u, 1.4 + i * 0.25) }); });
      tx(480, 320, 'headless service (clusterIP: None)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(480, 346, '는 Pod IP 를 전부 A 레코드로 준다 (IP 는 예시)', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 1) { snippet(60, 120, ['const cfg = `{"loadBalancingConfig":[{"round_robin":{}}]}`'], { fs: 16, op: fade(u, 0.2) });
      grow(480, 190, 480, 250, seg(u, 0.9, 1.3), ACC); pill(480, 290, 'dial 할 때 한 번 넘긴다', ACC, pop(u, 1.4), { fs: 15 }); return; }
    if (k === 2) { const A = 'dns:///backend-headless.default.svc.cluster.local:50051', cw = 9.6, x0 = 60, X = (n) => x0 + n * cw;
      mono(x0, 150, A, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      [[0, 3, 'scheme', INFO, 0.5, 186], [7, A.length, 'endpoint', ACC, 1.3, 186]].forEach(([a, b, d, col, t0, y]) => { el('line', { x1: X(a), y1: 162, x2: X(a) + (X(b) - X(a)) * E(u, t0, t0 + 0.4), y2: 162, stroke: col, 'stroke-width': 3 });
        tx((X(a) + X(b)) / 2, y, d, { 'font-size': 15, fill: col, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, t0 + 0.2) }); });
      el('path', { d: `M${X(6)},164 l-6,10 h12 z`, fill: MUT, opacity: fade(u, 0.9) }); tx(X(6), 230, 'authority (비어 있음)', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      pill(480, 300, 'dns:/// 가 A/AAAA 레코드를 전부 목록으로', ACC, pop(u, 2.0), { fs: 15 }); return; }
    if (k === 3 || k === 4) { const n = k === 4 ? (u < 1.2 ? 3 : u < 2.0 ? 4 : 3) : 3, list = k === 4 && u >= 1.2 && u < 2.0 ? IPS.concat(['10.1.4.14']) : k === 4 && u >= 2.0 ? IPS.slice(1).concat(['10.1.4.14']) : IPS;
      card(170, 210, 230, 150, { rx: 12, stroke: ACC, sw: 2.2, s: k === 3 ? pop(u, 0.2) : 1 }); mono(170, 160, 'ClientConn', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
      if (k === 3) { ['service config', 'credentials'].forEach((s, i) => pill(170, 205 + i * 40, s, INK, pop(u, 0.6 + i * 0.4), { fs: 13.5 })); sub(170, 320, '준비 끝', fade(u, 1.6), { 'font-size': 14 }); return; }
      list.forEach((ip, i) => { const y = 70 + i * 80, isNew = ip === '10.1.4.14';
        el('line', { x1: 286, y1: 210, x2: 640, y2: y, stroke: isNew ? GOOD : ACC, 'stroke-width': 2.5 }); card(740, y, 190, 44, { rx: 8, text: ip, mono: true, fs: 15, stroke: isNew ? GOOD : INK, s: isNew && u < 1.6 ? pop(u, 1.2) : 1 }); });
      if (u >= 2.0) { mono(740, 400, '10.1.4.11 사라짐 → 서브채널 제거', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) }); }
      else if (u >= 1.2) mono(740, 400, 'Pod 추가 → 서브채널 자동 추가', { 'font-size': 14.5, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700 });
      mono(170, 214, `서브채널 ${list.length}개`, { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700 }); return; }
    if (k === 5 || k === 6) { card(170, 210, 220, 70, { rx: 12, text: 'xds:///user-service', mono: true, fs: 14.5, stroke: ACC });
      card(760, 110, 260, 70, { rx: 12, stroke: INFO, fill: C.INFOBG, text: 'xDS 컨트롤 플레인', fs: 16, color: INFO, s: k === 5 ? pop(u, 0.2) : 1 });
      if (k === 5) { ['endpoint 목록', '라우팅 규칙', 'LB 정책'].forEach((s, i) => fly(700, 130, 240, 200, seg(u, 0.6 + i * 0.5, 1.3 + i * 0.5), s, { fill: INFO }));
        ['endpoint 목록', '라우팅 규칙', 'LB 정책'].forEach((s, i) => pill(170, 290 + i * 40, s, INFO, pop(u, 1.3 + i * 0.5), { fs: 14 })); return; }
      card(480, 330, 420, 76, { rx: 10, fill: SOFT, stroke: GRID, s: pop(u, 0.3) });
      mono(290, 322, 'GRPC_XDS_BOOTSTRAP=/etc/xds/bootstrap.json', { 'font-size': 14, opacity: fade(u, 0.4) }); mono(290, 348, 'import _ "google.golang.org/grpc/xds"', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.8) });
      el('path', { d: 'M480,290 C480,200 600,110 628,110', fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': 400, 'stroke-dashoffset': 400 * (1 - E(u, 1.2, 1.9)), 'marker-end': u > 1.9 ? 'url(#ra-ah)' : null });
      sub(760, 170, 'Envoy 와 같은 xDS API', fade(u, 2.0), { 'font-size': 14 }); return; }
    const rows = [['dns:///host:port', 'DNS A/AAAA 조회', '정적 목록'], ['xds:///service', 'xDS 컨트롤 플레인', '동적'], ['passthrough:///addr', '해석 없이 그대로', '주소 1개'], ['unix:///path', '유닉스 소켓', '로컬']];
    rows.forEach(([a, b, d], i) => { const y = 90 + i * 70, s = fade(u, 0.2 + i * 0.4);
      el('rect', { x: 60, y: y - 26, width: 840, height: 52, rx: 8, fill: i === 2 ? C.WARNBG : PANEL, stroke: GRID, opacity: s });
      mono(80, y + 6, a, { 'font-size': 16, 'font-weight': 700, fill: i === 2 ? WARN : ACC, opacity: s }); tx(420, y + 6, b, { 'font-size': 15, opacity: s }); tx(880, y + 6, d, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: s }); }); }

  // ───────── 4. Envoy
  const EX = 420;
  function envoy(on) { card(EX, 210, 160, 110, { rx: 14, stroke: ACC, fill: ACCBG, sw: 2.5 }); mono(EX, 206, 'Envoy', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); mono(EX, 230, 'L7', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1 || k === 4 || k === 6) { client(70, 210); envoy();
      el('line', { x1: 110, y1: 210, x2: EX - 80, y2: 210, stroke: GRID, 'stroke-width': 12, 'stroke-linecap': 'round' });
      PODS.forEach(([n, y], i) => el('line', { x1: EX + 80, y1: 210, x2: PX - 50, y2: y, stroke: k === 6 ? ACC : GRID, 'stroke-width': k === 6 ? 4 : 2 }));
      if (k === 0) { const ids = [1, 3, 5, 7], to = [0, 1, 2, 0];
        ids.forEach((id, i) => { const a = 0.2 + i * 0.5; fly(110, 210, EX - 80, 210, seg(u, a, a + 0.4), 'stream ' + id, { mono: true });
          fly(EX + 80, 210, PX - 20, PODS[to[i]][1], seg(u, a + 0.4, a + 0.9), String(id), { mono: true }); });
        pods(tweenArr([0, 0, 0], [2, 1, 1], u), u, { max: 4 }); sub(EX, 300, '연결 하나 위의 스트림을 낱개로 나눈다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      if (k === 1) { pods([0, 0, 0], u, { count: false }); card(EX - 80, 140, 160, 40, { rx: 8, text: '0.0.0.0:8080', mono: true, fs: 14.5, stroke: ACC, s: pop(u, 0.4) });
        grow(EX - 80, 162, EX - 80, 196, seg(u, 0.7, 1.0), ACC); sub(240, 300, '클라이언트는 백엔드가 아니라 이 주소로 붙는다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
      if (k === 4) { pods([0, 1, 0], u, { count: false });
        fly(EX + 80, 210, PX - 60, 90, seg(u, 0.2, 0.8), 'GetUser', { mono: true }); if (u > 0.8) { cross(PX - 110, 110, 11, pop(u, 0.8)); mono(PX - 90, 60, 'unavailable', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) }); }
        fly(EX + 80, 210, PX - 60, 210, seg(u, 1.2, 1.8), '재시도', { fill: GOOD }); if (u > 1.8) check(PX - 110, 240, 11, pop(u, 1.8));
        card(EX, 360, 420, 56, { rx: 10, text: 'num_retries 3 → 첫 시도 + 최대 3번', fs: 15, stroke: ACC, s: pop(u, 2.0) }); return; }
      // k6: cluster
      pods([0, 0, 0], u, { count: false }); card(610, 380, 340, 50, { rx: 10, text: 'user_backends · ROUND_ROBIN', mono: true, fs: 14.5, stroke: ACC, s: pop(u, 0.3) });
      PODS.forEach(([n, y], i) => mono(560, lerp(210, y, 0.45) - 8, 'h2', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.2) }));
      sub(EX, 300, '업스트림도 HTTP/2 (http2_protocol_options)', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 2) { tx(480, 70, 'http_connection_manager', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono' });
      [['AUTO (기본)', 'HTTP/1.1 · HTTP/2 둘 다 알아듣는다', MUT], ['HTTP2', 'gRPC 전용 리스너라 고정', ACC]].forEach(([a, b, col], i) => { const y = 150 + i * 90;
        card(480, y, 640, 66, { rx: 12, stroke: col, s: pop(u, 0.3 + i * 0.6) }); mono(200, y + 6, 'codec_type: ' + a, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.6) });
        tx(780, y + 6, b, { 'font-size': 14.5, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.6) }); });
      pill(480, 360, '빠지면 안 되는 쪽은 업스트림의 HTTP/2 설정', WARN, pop(u, 1.9)); return; }
    if (k === 3) { mono(60, 90, ':path  /user.v1.UserService/GetUser', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.2) });
      el('rect', { x: 128, y: 70, width: 222, height: 28, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.8) });
      card(300, 220, 420, 60, { rx: 10, text: 'match: { prefix: "/user.v1.UserService/" }', mono: true, fs: 14.5, s: pop(u, 0.9) });
      grow(512, 220, 600, 220, seg(u, 1.4, 1.8), ACC); card(740, 220, 240, 60, { rx: 10, text: 'cluster: user_backends', mono: true, fs: 14.5, stroke: ACC, s: pop(u, 1.8) });
      sub(480, 320, 'gRPC 경로는 /패키지.서비스/메서드 라 prefix 로 그대로 고른다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 5) { const ch = [['listener :8080', INK], ['http_connection_manager', INK], ['router', ACC], ['upstream', MUT]];
      ch.forEach(([s, col], i) => { const x = 130 + i * 235; card(x, 210, 210, 64, { rx: 12, text: s, mono: true, fs: 14.5, stroke: col, color: col, s: pop(u, 0.2 + i * 0.4) });
        if (i) grow(x - 235 + 106, 210, x - 108, 210, seg(u, 0.3 + i * 0.4, 0.6 + i * 0.4), MUT); });
      sub(480, 300, 'http_filters 의 마지막은 언제나 router', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 7) { card(170, 210, 250, 60, { rx: 10, text: 'backend.default.svc', mono: true, fs: 15, s: pop(u, 0.2) }); mono(170, 170, 'STRICT_DNS', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      IPS.forEach((ip, i) => { const y = 110 + i * 100; grow(296, 210, 560, y, seg(u, 0.7 + i * 0.3, 1.1 + i * 0.3), ACC); card(680, y, 220, 46, { rx: 8, text: ip + ':50051', mono: true, fs: 14.5, stroke: ACC, s: pop(u, 1.0 + i * 0.3) }); });
      sub(480, 400, 'DNS 가 준 IP 수만큼 업스트림 호스트가 생긴다 (IP 는 예시)', fade(u, 2.1), { 'font-size': 14 }); return; }
    // k8: 서비스메시
    card(480, 60, 300, 56, { rx: 12, stroke: INFO, fill: C.INFOBG, text: '컨트롤 플레인 (Istio 등)', fs: 15, color: INFO, s: pop(u, 0.2) });
    [['app', 170], ['user', 480], ['order', 790]].forEach(([n, x], i) => { const a = pop(u, 0.4 + i * 0.25);
      zone(x - 120, 180, 240, 150, 'Pod', { fill: SOFT, op: fade(u, 0.4 + i * 0.25) }); card(x - 45, 270, 90, 60, { rx: 8, text: n, fs: 14.5, s: a }); card(x + 55, 270, 90, 60, { rx: 8, text: 'Envoy', fs: 14, stroke: ACC, color: ACC, s: a });
      grow(480 + (x - 480) * 0.3, 90, x + 55, 236, seg(u, 1.1 + i * 0.25, 1.5 + i * 0.25), INFO, { dash: '6 5' }); });
    ['재시도', '타임아웃', 'mTLS', '트레이싱'].forEach((s, i) => pill(210 + i * 180, 380, s, ACC, pop(u, 1.9 + i * 0.12), { fs: 14 })); }

  // ───────── 5. 한 장 정리
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(480, 90, 'gRPC 는 요청 단위로 나눠야 한다', { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2, 0.6) });
      [['연결 단위 (L4)', [30, 0, 0], BAD], ['요청 단위', [10, 10, 10], GOOD]].forEach(([n, cnt, col], i) => { const y = 180 + i * 100;
        tx(60, y + 30, n, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, 0.8 + i * 0.5) });
        cnt.forEach((v, j) => { const g = E(u, 0.9 + i * 0.5, 1.5 + i * 0.5); el('rect', { x: 300 + j * 200, y: y + 10, width: Math.max(3, 160 * v / 30 * g), height: 34, rx: 5, fill: col, opacity: 0.8 });
          mono(300 + j * 200, y + 66, ['A', 'B', 'C'][j] + ' ' + v, { 'font-size': 14.5, opacity: fade(u, 1.2 + i * 0.5) }); }); }); return; }
    if (k === 1 || k === 2) { const A = k === 1;
      card(480, 150, 760, 120, { rx: 14, stroke: ACC, s: pop(u, 0.2) });
      tx(130, 125, A ? '(A) client-side LB' : '(B) proxy / mesh LB', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      mono(130, 165, A ? 'dns:/// + round_robin (headless service)' : 'Envoy 사이드카 + ROUND_ROBIN + 재시도·mTLS', { 'font-size': 16, opacity: fade(u, 0.5) });
      [[A ? '추가 인프라 없음' : 'LB 를 코드 밖에서 제어', GOOD], [A ? '클라가 백엔드를 알아야 하고 언어마다 구현' : '프록시 홉 1개 · 운영 복잡도', WARN]].forEach(([s, col], i) => {
        card(480, 280 + i * 60, 600, 46, { rx: 23, text: (i ? '− ' : '+ ') + s, fs: 15.5, stroke: col, color: col, s: pop(u, 1.0 + i * 0.5) }); }); return; }
    if (k === 3) { const rows = [['pick_first 기본값', '설정 안 하면 첫 주소만', '[30, 0, 0]'], ['주소 1개 (VIP · 옛 Dial)', 'round_robin 을 켜도 1개뿐', '[0, 30, 0]'], ['ClusterIP 뒤 gRPC', 'headless service 로 바꾼다', '쏠림']];
      rows.forEach(([a, b, v], i) => { const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.5);
        card(480, y, 800, 80, { rx: 12, stroke: BAD, s }); tx(110, y - 6, a, { 'font-size': 17, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3 + i * 0.5) }); tx(110, y + 20, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.5) });
        mono(860, y + 6, v, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: BAD, opacity: fade(u, 0.5 + i * 0.5) }); });
      sub(480, 400, '[ ] 는 파이썬 grpcio 로 RPC 30번을 보낸 결과', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    const rows = [['내부 · 소규모', 'round_robin + dns:///'], ['여러 언어 · 조직 단위', '서비스메시 (Envoy 사이드카)'], ['대규모 · 동적', 'xDS 컨트롤 플레인으로 통일'], ['게이트웨이 하나 뒤', 'pick_first 로 충분']];
    rows.forEach(([a, b], i) => { const y = 80 + i * 80, s = fade(u, 0.2 + i * 0.45);
      el('rect', { x: 60, y: y - 28, width: 840, height: 60, rx: 10, fill: i % 2 ? SOFT : PANEL, stroke: GRID, opacity: s });
      tx(84, y + 8, a, { 'font-size': 16, 'font-weight': 700, opacity: s }); grow(360, y + 2, 430, y + 2, seg(u, 0.3 + i * 0.45, 0.6 + i * 0.45), ACC);
      mono(450, y + 8, b, { 'font-size': 15.5, fill: ACC, 'font-weight': 700, opacity: s }); }); }

  const quiz = [
    { q: 'L4 LB 뒤에 Pod 3대를 두었는데 gRPC 요청이 한 대로만 가는 까닭은 무엇인가?',
      o: ['L4는 연결마다 백엔드를 고르는데 gRPC는 HTTP/2 연결 하나에 RPC를 계속 싣기 때문', 'Pod-B, C의 포트가 막혀 있기 때문', 'gRPC는 첫 번째 Pod만 지원하기 때문'], a: 0,
      why: '같은 L4 흉내 프록시 뒤에서 채널 1개로 RPC 30번을 보내면 [30, 0, 0], 요청마다 새 연결이면 [10, 10, 10]이었다.' },
    { q: '주소 3개를 알 때 service config 없이 RPC 30번을 보내면 어떻게 나뉘는가?',
      o: ['[10, 10, 10]', '[30, 0, 0]', '무작위로 나뉜다'], a: 1,
      why: '기본 정책은 pick_first라 살아 있는 첫 주소 하나만 쓴다. loadBalancingConfig에 round_robin을 넣어야 [10, 10, 10]이 된다.' },
    { q: 'k8s에서 dns:/// resolver가 Pod IP를 모두 받으려면 무엇이 필요한가?',
      o: ['ClusterIP 서비스', 'NodePort 서비스', 'headless service (clusterIP: None)'], a: 2,
      why: 'ClusterIP 이름은 VIP 하나만 돌려준다. headless service는 Pod IP를 전부 A 레코드로 내줘 서브채널이 Pod 수만큼 생긴다.' },
    { q: 'Envoy가 연결 하나로 들어온 gRPC 요청을 여러 백엔드에 나눌 수 있는 까닭은 무엇인가?',
      o: ['TCP 연결을 백엔드 수만큼 복제해서', 'HTTP/2를 이해해 스트림(RPC)을 낱개로 떼어 보내서', '클라이언트가 Envoy에 백엔드 목록을 보내서'], a: 1,
      why: 'L7 프록시는 stream 1·3·5·7을 하나씩 읽어 cluster의 ROUND_ROBIN으로 다른 업스트림에 보낸다.' },
    { q: 'round_robin을 켰는데도 요청이 [0, 30, 0]처럼 한 곳으로만 간다. 원인은 무엇인가?',
      o: ['round_robin이 고장 났다', '백엔드가 너무 빠르다', '주소 목록에 VIP 1개뿐이다'], a: 2,
      why: '나눌 대상이 1개면 정책이 무엇이든 1개로 간다. 파이썬으로 VIP 하나에 round_robin을 걸어도 [0, 30, 0]이었다.' },
  ];

  const summary = [
    'L4 LB는 연결마다 백엔드를 골라서, 연결 하나를 오래 쓰는 gRPC는 한 Pod에 몰린다.',
    '기본 정책은 pick_first라서 주소를 여러 개 알아도 첫 주소만 쓴다.',
    'headless service와 dns:///로 Pod IP를 모두 받고 round_robin을 켜면 RPC 30번이 10번씩 나뉜다.',
    'Envoy 같은 L7 프록시는 스트림을 낱개로 나누고, 재시도와 mTLS도 코드 밖에서 맡는다.',
  ];
  const review = [
    { q: 'Pod를 3대에서 6대로 늘렸는데 CPU가 여전히 한 대만 높다. 클라이언트 설정에서 먼저 볼 것은?',
      o: ['service config에 round_robin이 있는지와 주소가 headless 이름인지', 'keepalive 시간이 짧은지', '메시지 크기 한도가 충분한지'], a: 0,
      why: 'pick_first 이거나 주소가 VIP 1개면 Pod를 늘려도 나눌 대상이 늘지 않는다. 정책과 주소 목록이 함께 맞아야 분산된다.' },
    { q: 'retryPolicy에 maxAttempts 3을 넣었다. 서버가 계속 UNAVAILABLE이면 서버에는 요청이 몇 번 닿는가?',
      o: ['2번', '3번', '4번'], a: 1,
      why: 'maxAttempts는 첫 시도를 포함한 횟수다. 파이썬으로 늘 UNAVAILABLE을 내는 서버를 세어 보니 3번이었다.' },
    { q: 'Go, Java, Python 서비스가 섞여 있고 재시도·mTLS를 한 곳에서 맞추고 싶다. 알맞은 방식은?',
      o: ['언어마다 round_robin을 직접 구현한다', 'L4 LB를 하나 더 둔다', 'Envoy 사이드카를 쓰는 서비스메시로 LB를 코드 밖에 둔다'], a: 2,
      why: '클라이언트 LB는 언어별 라이브러리에 정책이 흩어진다. 사이드카는 언어와 상관없이 같은 설정을 xDS로 받는다.' },
  ];

  R.page({ title: '요청 분산 (Load Balancing)', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
