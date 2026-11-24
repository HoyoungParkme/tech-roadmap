/* IV-2-2 Subscription (WebSocket) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * graphql-ws 프레임 순서(connection_init → connection_ack → subscribe → next → complete), 채널별 전달,
 * dispose 뒤 수신 중단, 소켓 하나에 구독 여러 개, 인증 거절 close 코드 4403 은 graphql-ws 6 · ws 8 · graphql-subscriptions 3 으로
 * 로컬에서 직접 돌린 결과다. retryStrategy 곡선은 코드의 min(t × 50, 2000) 을 그대로 그린 것이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, server, person, browser, cross, check, lock, clock, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 시퀀스 그림: 클라이언트(왼쪽)와 서버(오른쪽) 세로선 사이 프레임 화살표
  function lanes(o) { o = o || {}; const L = o.L || 220, Rr = o.R || 740;
    person(L, 60, null, { s: 0.8 }); tx(L, 112, o.ln || '클라이언트', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
    server(Rr, 60, null, { s: 0.6 }); tx(Rr, 112, o.rn || '서버', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
    [L, Rr].forEach((x) => el('line', { x1: x, y1: 124, x2: x, y2: 410, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' })); return [L, Rr]; }
  function frame(L, Rr, y, toServer, s, col, a) { if (a <= 0) return; const [x1, x2] = toServer ? [L, Rr] : [Rr, L];
    grow(x1, y, lerp(x1, x2, 1), y, a, col || INK); mono((L + Rr) / 2, y - 8, s, { 'font-size': 14.5, 'font-weight': 700, fill: col || INK, 'text-anchor': 'middle', opacity: clamp(a * 2) }); }

  // ---------- 1. graphql-ws 서버 ----------
  function stack(n, o) { o = o || {}; const L = [['HTTP 서버 (express + http)', MUT], ['ws · WebSocket 전송', INFO], ['graphql-ws · 프로토콜', ACC], ['Apollo / schema · 실행', GOOD]];
    L.forEach(([s, col], i) => { if (i >= n) return; const y = 340 - i * 62, sc = o.pop ? o.pop(i) : 1;
      card(300, y, 400, 50, { rx: 10, stroke: col, sw: 2.5, fill: PANEL, s: sc }); tx(300, y + 5, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: clamp(sc) }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { stack(4, { pop: (i) => pop(u, 0.2 + i * 0.4) });
      [['createServer', 'http'], ['WebSocketServer', 'ws'], ['useServer', 'graphql-ws/use/ws'], ['ApolloServer', '@apollo/server']].forEach(([a, b], i) => {
        mono(560, 346 - i * 62, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); mono(560, 366 - i * 62, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); });
      note(100, 60, '세 조각이 층을 이룬다: 전송 · 프로토콜 · 실행', fade(u, 2.0), {}); return; }
    if (k === 1) { card(300, 220, 360, 240, { rx: 14, stroke: INK, sw: 3, s: pop(u, 0.1) }); tx(140, 126, 'httpServer = createServer(app)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.3) });
      card(300, 240, 240, 110, { rx: 10, stroke: MUT, sw: 2, s: pop(u, 0.6) }); tx(300, 246, 'express app', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.7) });
      card(720, 120, 200, 56, { rx: 10, text: 'schema', fs: 17, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.0) });
      grow(720, 148, 720, 250, E(u, 1.4, 1.8), GOOD); grow(620, 120, 480, 180, E(u, 1.4, 1.8), GOOD);
      card(720, 290, 200, 60, { rx: 10, stroke: INFO, sw: 2, dash: '6 4', op: fade(u, 1.8) }); tx(720, 296, 'ws 자리 (다음)', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INFO, opacity: fade(u, 1.9) });
      note(100, 390, 'app.listen 대신 핸들을 쥐어야 WebSocket을 같은 포트에 얹는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { server(760, 210, ':4000', {}); el('rect', { x: 680, y: 140, width: 20, height: 140, rx: 4, fill: INK });
      grow(140, 170, 676, 180, E(u, 0.2, 1.0), MUT); pill(330, 140, 'POST /graphql', MUT, pop(u, 0.2), { mono: true, fs: 14 });
      grow(140, 260, 676, 240, E(u, 0.9, 1.7), INFO); dot([[140, 260], [676, 240]], seg(u, 0.9, 1.7), INFO, 7); pill(330, 300, 'GET /graphql · Upgrade: websocket', INFO, pop(u, 0.9), { mono: true, fs: 13.5 });
      pill(470, 360, '101 Switching Protocols', INFO, pop(u, 1.8), { mono: true, fs: 14 });
      note(40, 60, '같은 포트 · 같은 경로 /graphql로 두 종류가 들어온다', fade(u, 2.2), {}); return; }
    if (k === 3) { const [L, Rr] = lanes({});
      frame(L, Rr, 170, true, 'connection_init { authorization }', INFO, seg(u, 0.2, 0.9));
      card(Rr, 225, 220, 40, { rx: 8, text: 'verify(token) → ctx.user', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.0) });
      frame(L, Rr, 290, false, 'connection_ack', GOOD, seg(u, 1.4, 2.0));
      note(40, 380, '헤더가 아니라 connectionParams로 연결 때 한 번 인증 · 실행 결과', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4 || k === 5) { server(160, 210, 'Apollo', {});
      tx(300, 70, k === 4 ? '진행 중인 HTTP 요청' : '열린 subscription', { 'font-size': 15, 'font-weight': 700 });
      [0, 1, 2].forEach((i) => { const y = 120 + i * 70, w = 400;
        el('rect', { x: 300, y, width: w, height: 30, rx: 6, fill: SOFT });
        if (k === 4) { const f = clamp(0.4 + i * 0.15 + E(u, 0.3, 1.8) * 0.6); el('rect', { x: 300, y, width: w * f, height: 30, rx: 6, fill: f >= 1 ? GOOD : INFO }); if (f >= 1) check(720, y + 15, 9, 1); }
        else { const cut = u > 0.8 + i * 0.3; el('rect', { x: 300, y, width: cut ? w * 0.6 : w * clamp(0.3 + u * 0.3), height: 30, rx: 6, fill: cut ? OFF : ACC }); if (cut) mono(720, y + 21, 'complete', { 'font-size': 14, fill: MUT }); } });
      if (k === 4) { fly(900, 360, 720, 360, seg(u, 1.2, 1.8), '새 요청', { fill: MUT }); if (u > 1.8) cross(640, 360, 10, 1);
        note(300, 400, 'drain: 받은 요청은 끝까지, 새 요청은 받지 않는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      pill(560, 360, 'serverCleanup.dispose()', ACC, pop(u, 0.5), { mono: true, fs: 14 });
      pill(820, 360, 'apollo.start()', GOOD, pop(u, 2.0), { mono: true, fs: 14 }); return; }
    // k6: 한 포트
    server(700, 200, ':4000 /graphql', { lamp: GOOD });
    person(120, 120, null, { s: 0.8 }); person(120, 300, null, { s: 0.8 });
    grow(150, 120, 630, 180, E(u, 0.2, 0.8), MUT); mono(350, 128, 'POST query · mutation', { 'font-size': 14.5, opacity: fade(u, 0.5) });
    grow(150, 300, 630, 225, E(u, 0.6, 1.2), INFO); mono(350, 296, 'ws:// subscription', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.9) });
    card(700, 360, 290, 44, { rx: 8, text: 'subscriptions-transport-ws', fs: 14, mono: true, stroke: OFF, color: MUT, op: fade(u, 1.5) }); el('line', { x1: 560, y1: 360, x2: 840, y2: 360, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.8) });
    tx(700, 406, '옛 프로토콜 · 쓰지 않는다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) }); }

  // ---------- 2. subscription 정의와 사용 ----------
  const SUBS = [['A', 'r1', 120], ['B', 'r1', 220], ['B', 'r2', 320]];
  function hub(o) { o = o || {}; card(480, 220, 220, 260, { rx: 14, stroke: ACC, sw: 2.5, fill: o.fill || PANEL }); tx(480, 116, o.name || 'PubSub (인메모리)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
    ['MSG_ADDED:r1', 'MSG_ADDED:r2'].forEach((ch, i) => { card(480, 170 + i * 110, 190, 40, { rx: 8, text: ch, fs: 14, mono: true, stroke: o.hot === i ? ACC : GRID, color: o.hot === i ? ACC : INK, op: o.chOp ?? 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { [['type Query', MUT], ['type Mutation', MUT], ['type Subscription', ACC]].forEach(([n, col], i) => card(170 + i * 310, 90, 260, 50, { rx: 10, text: n, fs: 16, mono: true, stroke: col, color: col, s: pop(u, 0.2 + i * 0.3) }));
      card(790, 230, 300, 120, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 1.1) });
      mono(652, 210, 'messageAdded(', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) }); mono(672, 236, 'roomId: ID!', { 'font-size': 15, opacity: fade(u, 1.4) }); mono(652, 262, '): Message!', { 'font-size': 15, opacity: fade(u, 1.5) });
      grow(790, 116, 790, 168, E(u, 1.0, 1.3), ACC);
      card(260, 260, 380, 80, { rx: 10, stroke: INK, sw: 2, s: pop(u, 1.8) }); mono(90, 254, 'type Message { id text sender }', { 'font-size': 14.5, opacity: fade(u, 1.9) }); mono(90, 280, '← Query 쪽과 같은 타입을 쓴다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { card(480, 220, 420, 320, { rx: 16, stroke: INK, sw: 2, dash: '8 6', op: fade(u, 0.1) }); tx(290, 84, 'Node 프로세스 1개', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      hub({ chOp: fade(u, 0.6) }); server(820, 220, '다른 프로세스', { s: 0.7, op: fade(u, 1.4) });
      grow(700, 220, 760, 220, E(u, 1.6, 2.0), BAD); if (u > 2.0) cross(730, 190, 10, 1);
      note(40, 400, '구독과 발행이 같은 프로세스에 있을 때만 만난다', fade(u, 2.2), {}); return; }
    hub({ hot: k === 4 ? 0 : -1 });
    SUBS.forEach(([n, room, y], i) => { const x = 110; const show = k >= 5 ? 1 : k === 2 ? (i === 0 ? pop(u, 0.2) : 1) : 1;
      card(x, y, 150, 44, { rx: 22, text: `${n} · ${room}`, fs: 15, stroke: INFO, color: INFO, s: show });
      const tgt = room === 'r1' ? 170 : 280; el('line', { x1: x + 75, y1: y, x2: 385, y2: tgt, stroke: room === 'r1' ? INFO : MUT, 'stroke-width': 2, opacity: k === 2 && i === 0 ? fade(u, 0.6) : 0.7, 'stroke-dasharray': '4 4' }); });
    if (k === 2) { pill(480, 380, 'subscribe → asyncIterableIterator', ACC, pop(u, 1.0), { mono: true, fs: 14 }); note(620, 70, '반복자가 곧 이벤트 스트림', fade(u, 1.6), { fill: ACC }); return; }
    if (k === 3) { card(800, 130, 260, 80, { rx: 10, stroke: MUT, sw: 2, s: pop(u, 0.2) }); mono(684, 120, 'payload', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(684, 146, '{ id, text, sender }', { 'font-size': 14 });
      grow(800, 172, 800, 240, E(u, 0.8, 1.2), ACC); pill(800, 264, 'resolve: (payload) => payload', ACC, pop(u, 1.1), { mono: true, fs: 13.5 });
      card(800, 350, 260, 60, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.7) }); mono(684, 356, '{ messageAdded: {…} }', { 'font-size': 14, fill: GOOD }); return; }
    if (k === 4) { card(830, 110, 220, 44, { rx: 8, text: 'sendMessage(r1)', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.1) });
      dot([[720, 110], [575, 170]], seg(u, 0.3, 0.8), WARN, 7); dot([[720, 110], [575, 280]], seg(u, 1.6, 2.0), WARN, 7);
      card(830, 200, 220, 44, { rx: 8, text: 'sendMessage(r2)', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.4) });
      [0, 1].forEach((i) => dot([[385, 170], [185, SUBS[i][2]]], seg(u, 0.8, 1.4), ACC, 7)); dot([[385, 280], [185, 320]], seg(u, 2.0, 2.5), ACC, 7);
      if (u > 1.4) { mono(200, 102, 'id 1', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); mono(200, 202, 'id 1', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
      if (u > 2.5) mono(200, 302, 'id 2', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      note(600, 400, '채널 이름이 같아야 전달된다 · 실행 결과', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 5) { // 소켓 2개, 구독 3개
      el('rect', { x: 30, y: 80, width: 200, height: 70, rx: 35, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: fade(u, 0.3) });
      el('rect', { x: 30, y: 190, width: 200, height: 160, rx: 40, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: fade(u, 0.6) });
      tx(250, 120, '소켓 1', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) }); tx(250, 270, '소켓 2 · 구독 2개', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.7) });
      note(600, 400, '서버의 열린 소켓 2개 · 구독 3개', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k6: A 가 dispose 한 뒤 id 3 은 B 만
    if (u > 0.3) { cross(110, 120, 14, pop(u, 0.3)); mono(40, 168, 'dispose() → complete', { 'font-size': 14, fill: MUT }); }
    card(830, 110, 240, 44, { rx: 8, text: 'sendMessage(r1) · id 3', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.8) });
    dot([[710, 110], [575, 170]], seg(u, 1.0, 1.4), WARN, 7); dot([[385, 170], [185, 220]], seg(u, 1.4, 1.9), ACC, 7);
    if (u > 1.9) mono(200, 202, 'id 3', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    card(760, 330, 330, 80, { rx: 10, stroke: GRID, sw: 1.5, op: fade(u, 2.0) }); mono(610, 324, 'A: [1, complete]', { 'font-size': 14, opacity: fade(u, 2.1) }); mono(610, 348, 'B: r1 [1, 3] · r2 [2]', { 'font-size': 14, opacity: fade(u, 2.1) }); }

  // ---------- 3. Redis PubSub ----------
  const NODES = [['Node A', 150], ['Node B', 480], ['Node C', 810]];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const ax = axes(120, 80, 520, 260, { x: [0, 60], y: [0, 2400], xt: [0, 20, 40, 60], yt: [0, 1000, 2000], xl: '재시도 횟수 t', yl: '대기 ms', grid: true });
      const pts = []; for (let i = 0; i <= 60; i += 2) pts.push([i, Math.min(i * 50, 2000)]); line(ax, pts, E(u, 0.3, 1.8), ACC);
      mono(700, 140, 'retryStrategy: (t) =>', { 'font-size': 14.5, opacity: fade(u, 0.2) }); mono(720, 166, 'Math.min(t * 50, 2000)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.2) });
      note(700, 220, 't = 40부터 2초로 고정', fade(u, 1.9), { fill: ACC, 'font-size': 14.5 }); note(700, 250, 'host: redis · port: 6379', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 1) { card(480, 220, 160, 80, { rx: 12, stroke: BAD, sw: 3, fill: BADBG }); tx(480, 226, 'Redis', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD });
      server(150, 220, 'Node', {});
      [[150, 'publisher', WARN], [290, 'subscriber', INFO]].forEach(([y, n, col], i) => { grow(210, y - 10 + i * 0, 400, 205 + i * 30, E(u, 0.3 + i * 0.5, 0.8 + i * 0.5), col, { plain: true }); pill(300, y - 30 + i * 40, n, col, pop(u, 0.4 + i * 0.5), { fs: 14 }); });
      lock(370, 300, true, INFO, pop(u, 1.4)); note(560, 330, 'subscribe 상태의 연결은 publish를 못 한다', fade(u, 1.6), { fill: INFO, 'font-size': 14.5 });
      note(560, 360, '그래서 연결을 둘로 나눈다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 2) { card(480, 110, 620, 90, { rx: 10, stroke: INK, sw: 2 }); mono(190, 100, 'subscribe: () => pubsub.asyncIterableIterator(ch)', { 'font-size': 14.5 }); mono(190, 128, 'sendMessage: await pubsub.publish(ch, msg)', { 'font-size': 14.5 });
      tx(480, 186, 'resolver 코드는 그대로', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      const sw = E(u, 0.6, 1.8);
      card(lerp(480, 230, sw), 290, 230, 60, { rx: 10, text: 'PubSub (메모리)', fs: 15, stroke: OFF, color: MUT, op: 1 - sw * 0.7 });
      card(lerp(780, 480, sw), 290, 230, 60, { rx: 10, text: 'RedisPubSub', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, op: 0.3 + sw * 0.7 });
      grow(480, 156, 480, 256, E(u, 1.8, 2.2), ACC); return; }
    if (k === 3 || k === 5) { // 노드 간 fan-out
      card(480, 210, 150, 64, { rx: 12, stroke: BAD, sw: 3, fill: BADBG }); tx(480, 216, 'Redis', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD });
      NODES.forEach(([n, x], i) => { server(x, 90, n, { s: 0.6 }); });
      const sub2 = k === 5 ? [true, false, false] : [true, true, false];
      if (k === 3) { pill(810, 170, 'publish MSG_ADDED:r1', WARN, pop(u, 0.1), { mono: true, fs: 13.5 }); dot([[810, 130], [560, 200]], seg(u, 0.3, 0.9), WARN, 8);
        grow(810, 130, 556, 196, E(u, 0.3, 0.9), WARN, { plain: true });
        [0, 1].forEach((i) => { grow(420, 196, NODES[i][1] + (i ? 0 : 30), 136, E(u, 0.9, 1.5), ACC, { plain: true }); dot([[420, 200], [NODES[i][1], 130]], seg(u, 0.9, 1.5), ACC, 8);
          for (let j = 0; j < 4; j++) { const px = NODES[i][1] - 60 + j * 40; person(px, 330, null, { s: 0.5 }); dot([[NODES[i][1], 130], [px, 300]], seg(u, 1.5 + j * 0.1, 2.0 + j * 0.1), ACC, 5); } });
        note(600, 400, '한 곳의 publish가 모든 노드의 구독자에게', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      // k5: 채널 = 방. r1 을 구독한 노드만 깨어난다
      [['r1', 0], ['r2', 1], ['r9', 2]].forEach(([r, i]) => mono(NODES[i][1], 160, 'MSG_ADDED:' + r, { 'font-size': 14, 'text-anchor': 'middle', fill: i === 0 ? ACC : MUT, opacity: fade(u, 0.2) }));
      dot([[480, 180], [NODES[0][1], 130]], seg(u, 0.6, 1.2), ACC, 8);
      [1, 2].forEach((i) => tx(NODES[i][1], 290, '조용', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }));
      card(480, 340, 560, 60, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 1.6) }); mono(220, 346, 'payload가 크면 { id }만 보내고 클라가 query로', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 1.7) }); return; }
    // k4: 대안 비교
    tx(40, 50, 'Redis pub/sub', { 'font-size': 16, 'font-weight': 800, fill: BAD });
    person(120, 130, null, { s: 0.6, op: 0.4 }); tx(120, 176, '잠깐 끊긴 구독자', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    fly(420, 120, 160, 120, seg(u, 0.2, 0.9), 'msg', { fill: BAD }); if (u > 0.9) { cross(200, 120, 10, 1); mono(240, 100, '놓친 메시지는 사라진다', { 'font-size': 14, fill: BAD }); }
    tx(40, 240, 'Kafka 기반 PubSub', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
    for (let i = 0; i < 8; i++) card(80 + i * 56, 290, 48, 36, { rx: 5, text: String(i), fs: 14, mono: true, stroke: i < 5 ? ACC : GRID, color: i < 5 ? ACC : MUT, s: pop(u, 1.1 + i * 0.06) });
    mono(80, 340, 'offset으로 다시 읽기 (replay)', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.7) });
    [['NATS', '가벼움'], ['MQTT', 'IoT']].forEach(([a, b], i) => { card(720, 280 + i * 70, 200, 52, { rx: 10, stroke: GRID, sw: 2, s: pop(u, 1.9 + i * 0.2) });
      tx(720, 277 + i * 70, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0 + i * 0.2) }); tx(720, 296 + i * 70, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0 + i * 0.2) }); }); }

  // ---------- 4. SSE ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { server(800, 120, '/graphql/stream', {}); person(120, 120, null, { s: 0.8 });
      grow(150, 110, 730, 110, E(u, 0.1, 0.5), MUT); mono(440, 98, 'GET (평범한 HTTP)', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      pill(440, 160, 'Content-Type: text/event-stream', INFO, pop(u, 0.6), { mono: true, fs: 13.5 });
      ['event: next', 'data: {"data":{"messageAdded":…}}', '', 'event: next', 'data: {…}'].forEach((s, i) => { if (!s) return; mono(200, 230 + i * 30, s, { 'font-size': 14.5, fill: i % 3 === 0 ? INFO : INK, opacity: fade(u, 1.0 + i * 0.25) }); });
      el('rect', { x: 180, y: 206, width: 560, height: 160, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.5 });
      note(180, 400, '응답 하나를 끝내지 않고 조각을 계속 흘려보낸다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { [['graphql-ws', 'createClient({ url: "ws://…" })', 80], ['graphql-sse', 'createClient({ url: "/graphql/stream" })', 240]].forEach(([n, a, y], i) => {
        card(480, y + 40, 860, 110, { rx: 10, stroke: i ? INFO : ACC, sw: 2, s: pop(u, 0.2 + i * 0.6) }); tx(70, y + 10, n, { 'font-size': 15, 'font-weight': 800, fill: i ? INFO : ACC, opacity: fade(u, 0.3 + i * 0.6) });
        mono(70, y + 38, a, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.6) });
        mono(70, y + 66, 'client.subscribe({ query }, { next, error, complete })', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.6) }); });
      el('rect', { x: 62, y: 128, width: 520, height: 26, rx: 5, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.8) });
      el('rect', { x: 62, y: 288, width: 520, height: 26, rx: 5, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.8) }); note(600, 200, '같은 모양', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 2) { [['WebSocket', 'wss://', 110, true], ['SSE', 'https://', 290, false]].forEach(([n, p, y, two], i) => { const op = fade(u, 0.2 + i * 0.8);
        tx(40, y + 5, n, { 'font-size': 17, 'font-weight': 800, opacity: op }); mono(40, y + 30, p, { 'font-size': 14.5, fill: MUT, opacity: op });
        person(230, y, null, { s: 0.6, op }); server(780, y, null, { s: 0.5, op });
        dot([[740, y - 8], [260, y - 8]], ((u * 0.8 + i * 0.3) % 1), ACC, 6); grow(740, y - 8, 260, y - 8, op, ACC, { plain: true });
        if (two) { dot([[260, y + 10], [740, y + 10]], ((u * 0.8 + 0.5) % 1), INFO, 6); grow(260, y + 10, 740, y + 10, op, INFO, { plain: true }); }
        else { card(500, y + 40, 200, 34, { rx: 8, text: '프록시 · CDN 통과 쉬움', fs: 13.5, stroke: GOOD, color: GOOD, s: pop(u, 1.4) }); } });
      note(40, 400, 'SSE는 서버에서 클라이언트로 한 방향뿐이다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { tx(40, 60, '연결이 끊기면', { 'font-size': 16, 'font-weight': 800 });
      [['EventSource (SSE)', '브라우저 표준에 재연결이 들어 있다', GOOD, 140], ['WebSocket API', '재연결 없음 · graphql-ws의 retryAttempts (기본 5)', WARN, 280]].forEach(([n, b, col, y], i) => {
        el('line', { x1: 300, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 3 });
        el('line', { x1: 300, y1: y, x2: 300 + 220 * E(u, 0.2, 0.8), y2: y, stroke: col, 'stroke-width': 5 });
        if (u > 0.8) cross(530, y, 10, 1);
        el('line', { x1: 560, y1: y, x2: 560 + 300 * E(u, 1.2 + i * 0.3, 2.0 + i * 0.3), y2: y, stroke: col, 'stroke-width': 5, 'stroke-dasharray': i ? '8 5' : null });
        tx(40, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: col }); tx(300, y + 34, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3 + i * 0.3) }); });
      return; }
    if (k === 4) { const items = [['채팅', 'ws'], ['알림', 'sse'], ['협업 에디터', 'ws'], ['주가', 'sse'], ['로그 스트림', 'sse']];
      card(250, 300, 300, 160, { rx: 14, stroke: ACC, sw: 2.5 }); tx(250, 246, 'WebSocket · 양방향', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
      card(710, 300, 300, 160, { rx: 14, stroke: INFO, sw: 2.5 }); tx(710, 246, 'SSE · 단방향', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO });
      const slot = { ws: 0, sse: 0 };
      items.forEach(([n, d], i) => { const j = slot[d]++, a = seg(u, 0.2 + i * 0.35, 0.8 + i * 0.35), tx0 = 120 + i * 180, ty0 = 80;
        const bx = d === 'ws' ? 250 : 710, by = 285 + j * 42; card(lerp(tx0, bx, E(a, 0, 1)), lerp(ty0, by, E(a, 0, 1)), 130, 34, { rx: 17, text: n, fs: 14.5, stroke: d === 'ws' ? ACC : INFO, color: d === 'ws' ? ACC : INFO }); });
      note(480, 410, '클라이언트도 보낼 게 있는가, 한 가지만 묻는다', fade(u, 2.3), { 'text-anchor': 'middle', 'font-size': 14.5 }); return; }
    // k5: 세 문
    server(720, 210, null, {}); card(720, 340, 160, 40, { rx: 8, text: 'schema 하나', fs: 14.5, stroke: GOOD, color: GOOD, s: pop(u, 1.8) });
    [['POST · GET  /graphql', MUT, 110], ['ws://…/graphql', ACC, 210], ['/graphql/stream (SSE)', INFO, 310]].forEach(([s, col, y], i) => {
      card(250, y, 290, 50, { rx: 10, text: s, fs: 14.5, mono: true, stroke: col, color: col, s: pop(u, 0.2 + i * 0.4) }); grow(396, y, 660, 210 + (i - 1) * 20, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), col); });
    note(40, 400, '프록시가 WebSocket을 막아도 SSE로 서비스가 산다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 5. Scaling ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { server(150, 200, '노드 1대', {}); tx(300, 70, '연결 하나 = 파일 디스크립터 하나', { 'font-size': 15, 'font-weight': 700 });
      const n = Math.round(200 * E(u, 0.2, 2.0)); for (let i = 0; i < 200; i++) { const x = 300 + (i % 25) * 24, y = 100 + Math.floor(i / 25) * 26;
        el('rect', { x, y, width: 18, height: 18, rx: 3, fill: i < n ? (i > 170 ? WARN : INFO) : SOFT }); }
      mono(300, 330, '부하 테스트 목표: 노드당 10k+ 동접', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      note(300, 370, 'OS의 FD 한도 · nginx/ALB keepalive 한도를 먼저 본다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { pill(120, 210, 'publish 1번', WARN, pop(u, 0.1), { fs: 15 });
      for (let i = 0; i < 40; i++) { const a = (i / 39 - 0.5) * 2.4, x = 500 + Math.cos(a) * 340, y = 210 + Math.sin(a) * 180;
        grow(190, 210, x, y, E(u, 0.4 + i * 0.02, 0.9 + i * 0.02), GRID, { plain: true }); el('circle', { cx: x, cy: y, r: 6, fill: ACC, opacity: fade(u, 0.8 + i * 0.02) }); }
      card(560, 210, 300, 70, { rx: 10, stroke: WARN, sw: 2, fill: PANEL, s: pop(u, 1.8) }); tx(560, 206, '전송 = 구독자 수 × payload', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(560, 228, '채널 쪼개기 · reference만 보내기', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { const y = 200, x0 = 80, x1 = 880, exp = 520;
      el('line', { x1: x0, y1: y, x2: x0 + (x1 - x0) * E(u, 0.2, 1.6), y2: y, stroke: INFO, 'stroke-width': 8, 'stroke-linecap': 'round' });
      if (u > 1.0) el('line', { x1: exp, y1: y, x2: Math.min(x0 + (x1 - x0) * E(u, 0.2, 1.6), x1), y2: y, stroke: BAD, 'stroke-width': 8 });
      pill(x0 + 60, y - 50, '연결 · 토큰 검증 OK', GOOD, pop(u, 0.2), { fs: 14 }); el('line', { x1: exp, y1: y - 40, x2: exp, y2: y + 40, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) });
      tx(exp, y - 52, '토큰 만료', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      tx(700, y + 44, '연결은 아직 살아 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      [['주기적 재검증', GOOD], ['만료 시 끊고 다시 연결', INFO], ['메시지마다 field-level auth', WARN]].forEach(([s, col], i) => pill(170 + i * 300, 340, s, col, pop(u, 1.9 + i * 0.2), { fs: 14 })); return; }
    if (k === 3) { server(800, 200, null, { s: 0.7 }); person(120, 200, '느린 구독자', { s: 0.8 });
      const q = Math.round(12 * E(u, 0.2, 2.0)); for (let i = 0; i < q; i++) el('rect', { x: 680 - i * 38, y: 186, width: 32, height: 28, rx: 4, fill: i > 8 ? BAD : WARN });
      el('line', { x1: 680 - 9 * 38 + 34, y1: 160, x2: 680 - 9 * 38 + 34, y2: 240, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); mono(680 - 9 * 38 + 34, 150, 'bufferedAmount 한도', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle' });
      [['최근 N 개만 유지', WARN], ['강제 close', BAD]].forEach(([s, col], i) => pill(330 + i * 260, 320, s, col, pop(u, 2.0 + i * 0.2), { fs: 14 }));
      note(40, 400, '정책을 안 정하면 서버 메모리가 대신 쌓는다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 4) { [['활성 연결 수', 'gauge'], ['채널별 발행 rate', 'counter'], ['publish → deliver p99', 'histogram']].forEach(([a, b], i) => {
        card(170 + i * 310, 110, 280, 90, { rx: 10, stroke: GRID, sw: 2, s: pop(u, 0.2 + i * 0.3) }); tx(50 + i * 310, 104, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); mono(50 + i * 310, 130, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      tx(40, 250, 'close 코드로 끊긴 이유 나누기', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      [['1000', '정상 종료', GOOD], ['1001', '떠남', MUT], ['1006', '비정상 끊김', BAD], ['4403', '인증 거절 (graphql-ws)', WARN]].forEach(([cd, s, col], i) => {
        card(150 + i * 220, 310, 200, 64, { rx: 10, stroke: col, sw: 2, s: pop(u, 1.2 + i * 0.25) }); mono(150 + i * 220, 306, cd, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 1.3 + i * 0.25) });
        tx(150 + i * 220, 328, s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3 + i * 0.25) }); });
      note(40, 405, '4403은 잘못된 토큰으로 연결해 직접 받은 코드다', fade(u, 2.3), { fill: MUT, 'font-size': 14 }); return; }
    // k5: 게이트웨이 분리
    card(480, 70, 200, 50, { rx: 10, text: 'LB', fs: 17, stroke: INK, sw: 2.5 });
    [['HTTP 노드', MUT, 240, 'query · mutation'], ['subscription 노드', ACC, 720, '연결·메모리에 맞춤']].forEach(([n, col, x, s], i) => { grow(480, 96, x, 180, E(u, 0.3 + i * 0.3, 0.7 + i * 0.3), col);
      [0, 1, 2].forEach((j) => server(x - 100 + j * 100, 240, null, { s: 0.45 * pop(u, 0.6 + i * 0.4 + j * 0.1), stroke: col, lamp: col }));
      tx(x, 320, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.3) }); tx(x, 344, s, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.1 + i * 0.3) }); });
    pill(480, 395, '다음 · V-1-1 인증/인가', INFO, pop(u, 2.1), { fs: 14 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'graphql-ws 서버가 사용자 인증 정보를 받는 자리는 어디인가?',
      o: ['연결할 때 보내는 connectionParams', 'subscription 쿼리의 변수', '메시지마다 붙는 HTTP 헤더'], a: 0,
      why: 'connection_init 프레임에 실린 connectionParams를 context에서 읽어 연결 때 한 번 검증한다. WebSocket 메시지에는 HTTP 헤더가 따로 없다.' },
    { q: '방 r1을 구독한 A와 B 가운데 A가 dispose한 뒤 r1에 메시지가 발행되면 누가 받는가?',
      o: ['A와 B 모두', 'B만', '아무도 받지 않는다'], a: 1,
      why: 'dispose는 그 구독에 complete를 보내 끊는다. 직접 돌려 보니 세 번째 메시지는 B만 받았다.' },
    { q: '인메모리 PubSub을 그대로 두고 노드를 3대로 늘리면 어떤 일이 생기는가?',
      o: ['모든 노드의 구독자가 메시지를 받는다', 'Redis가 자동으로 연결된다', '발행한 노드에 붙은 구독자만 메시지를 받는다'], a: 2,
      why: '인메모리 PubSub은 한 프로세스 안에서만 발행과 구독을 잇는다. 노드 사이를 건너려면 RedisPubSub 같은 외부 버스가 필요하다.' },
    { q: '알림만 받는 화면에서 WebSocket 대신 SSE를 고르는 이유로 맞는 것은 무엇인가?',
      o: ['SSE가 양방향이라서', 'HTTP 그대로라 프록시를 잘 통과해서', 'SSE는 바이너리 프레임을 보낼 수 있어서'], a: 1,
      why: 'SSE는 text/event-stream 응답을 끊지 않고 흘려보내는 평범한 HTTP다. 서버에서 클라이언트로 한 방향뿐이라 받기만 하는 화면에 맞는다.' },
    { q: '토큰이 만료된 뒤에도 WebSocket 연결이 살아 메시지를 받는다. 이 문제를 다루는 정책은 무엇인가?',
      o: ['주기적 재검증이나 만료 때 연결 끊기', 'payload에 id만 실어 보내기', '채널 이름에 roomId 넣기'], a: 0,
      why: 'WebSocket은 연결할 때 한 번만 인증한다. 만료를 따라가려면 재검증하거나 끊고 다시 연결하게 해야 한다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    'subscription은 WebSocket 위 graphql-ws 프로토콜로 오고, 인증은 연결할 때 connectionParams로 한다.',
    'subscribe가 채널의 AsyncIterator를 돌려주고, 같은 채널에 publish하면 구독자에게 next가 간다.',
    '인메모리 PubSub은 한 프로세스 안에서만 전달된다. 노드를 늘리면 Redis 같은 버스가 필요하다.',
    '운영 전에 연결 수, fan-out, 토큰 만료, 느린 구독자를 어떻게 다룰지 정해 둔다.',
  ];
  const review = [
    { q: '배포 뒤 일부 사용자만 채팅 메시지를 못 받는다. 서버는 3대이고 PubSub은 new PubSub()이다. 먼저 의심할 것은?',
      o: ['graphql-ws 버전 차이', '발행 노드와 구독 노드가 달라 메시지가 못 건너간다', '클라이언트가 dispose를 너무 일찍 부른다'], a: 1,
      why: '인메모리 PubSub은 프로세스 밖으로 나가지 않는다. sendMessage를 처리한 노드에 붙은 사람만 받는다.' },
    { q: '사내 프록시가 WebSocket 업그레이드를 막는 고객사가 있다. 실시간 알림을 지키려면?',
      o: ['/graphql/stream에 SSE를 함께 열어 둔다', 'subscription을 mutation 폴링으로 바꾼다', 'retryAttempts를 크게 늘린다'], a: 0,
      why: 'SSE는 평범한 HTTP 응답이라 프록시를 통과한다. 재시도를 늘려도 막힌 업그레이드는 통과하지 못한다.' },
    { q: 'close 코드 분포에서 4403이 갑자기 늘었다. 먼저 볼 곳은?',
      o: ['Redis 연결의 retryStrategy', '느린 구독자의 bufferedAmount', 'connectionParams 토큰과 인증 로직'], a: 2,
      why: 'graphql-ws는 연결 인증을 거절하면 4403 Forbidden으로 닫는다. 잘못된 토큰으로 직접 연결해 받은 코드도 4403이었다.' },
  ];
  R.page({ title: 'Subscription — 서버가 밀어 주는 이벤트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
