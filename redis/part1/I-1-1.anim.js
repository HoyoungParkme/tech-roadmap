/* I-1-1 DB만 쓸 때의 부하 — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, redisBox, person, crowd, cross, check, clock, meters } = R;
  const { INK, MUT, OFF, GRID, ACC, BAD, GOOD, WARN } = C;
  const B = R.BEAT;

  // 공통 자리: 손님 · 서버 · DB, 아래에 계기판
  const P = { cx: 110, sx: 420, dx: 790, y: 180, ry: 72 };
  const toDB = [[P.cx + 30, P.y], [P.sx - 58, P.y], [P.sx + 58, P.y], [P.dx - 46, P.y]];
  const back = toDB.slice().reverse();
  function base(o) { o = o || {};
    el('line', { x1: P.cx + 30, y1: P.y, x2: P.sx - 58, y2: P.y, stroke: GRID, 'stroke-width': 2.5 });
    el('line', { x1: P.sx + 58, y1: P.y, x2: P.dx - 46, y2: P.y, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': o.dbIdle ? '5 6' : null });
    server(P.sx, P.y, 'FastAPI 서버', { lamp: o.lamp });
    dbIcon(P.dx, P.y, 'PostgreSQL', { stroke: o.dbHot ? BAD : INK }); }
  // 계기판: 이 beat 의 rps/dbLoad/latency 를 앞 beat 값에서 이어서
  function gauges(c, y) { const b = c.beat, p = c.prev || {};
    const rps = tween(p.rps, b.rps, c.u), cpu = tween(p.dbLoad, b.dbLoad, c.u), lat = tween(p.latency, b.latency, c.u);
    meters(150, y || 316, 660, [
      { name: '초당 요청 (RPS)', val: Math.round(rps).toLocaleString('en-US') },
      { name: 'DB CPU', val: Math.round(cpu) + '%', bar: cpu, hot: cpu >= 90 },
      { name: 'p95 응답', val: lat < 10 && lat > 0 ? lat.toFixed(lat < 2 ? 1 : 0) + 'ms' : Math.round(lat) + 'ms', hot: lat >= 1000, good: b.latency <= 5 && b.latency > 0 },
    ]); }

  // 1. 평온한 DB
  function s1(t, c) { const { k, u } = c;
    base({ lamp: k >= 1 ? ACC : OFF, dbIdle: k === 0 });
    person(P.cx, P.y, '독자 한 명', {});
    pill(P.sx, P.y - 78, 'GET /post/{post_id}', ACC, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5 });
    if (k === 1) { dot(toDB, seg(u, 0.2, 1.6), ACC, 7); fly(P.sx + 60, P.y - 30, P.dx - 20, P.y - 30, seg(u, 0.9, 2.1), 'SELECT … WHERE id=42', { mono: true }); }
    if (k === 2) { dot(back, seg(u, 0.2, 1.8), INK, 7); fly(P.sx - 40, P.y - 30, P.cx + 10, P.y - 30, seg(u, 1.0, 2.2), '{"title": …}', { fill: INK, mono: true }); }
    if (k >= 2) sub(P.dx, P.y + 92, '왕복 약 50ms', k === 2 ? fade(u, 1.6) : 1, { 'font-weight': 700, fill: INK });
    if (k === 3) banner(480, 268, '기준선 · RPS 1 · DB CPU 5% · 50ms', pop(u, 0.3));
    gauges(c); }

  // 2. 같은 쿼리 1000번
  function stream(u, n, col) { for (let i = 0; i < n; i++) dot(toDB, ((u * 0.9 + i / n) % 1), col || ACC, 5); }
  function s2(t, c) { const { k, u } = c;
    base({ lamp: BAD, dbHot: c.beat.dbLoad >= 75 });
    crowd(P.cx, P.y, k === 0 ? lerp(1, 24, E(u, 0.1, 1.4)) : 24, '1000명 / 초');
    stream(t, k === 0 ? Math.round(lerp(1, 14, E(u, 0.2, 1.4))) : 14);
    pill(P.sx, P.y - 78, 'post/42 × 1000 / 초', BAD, k === 0 ? pop(u, 0.5) : 1, { mono: true, fs: 13.5 });
    if (k >= 1) { const steps = ['페이지 읽기', '행 파싱', 'TCP 전송'], hot = Math.floor(t * 2.5) % 3;
      steps.forEach((s, i) => card(P.dx, 48 + i * 34, 128, 28, { rx: 8, text: s, fs: 13.5, stroke: i === hot ? BAD : GRID, color: i === hot ? BAD : INK, sw: 1.8, s: k === 1 ? pop(u, 0.2 + i * 0.2) : 1 }));
      mono(P.dx + 76, 85, '×1000', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: k === 1 ? fade(u, 1) : 1 }); }
    if (k >= 2) { const q = k === 2 ? Math.floor(lerp(0, 6, E(u, 0.2, 1.6))) : 6;
      for (let i = 0; i < q; i++) el('circle', { cx: P.sx - 74 - i * 13, cy: P.y + 26, r: 5, fill: WARN });
      if (q) sub(P.sx - 110, P.y + 50, '커넥션 기다리는 중', 1, { fill: WARN, 'font-weight': 700 }); }
    if (k === 3) banner(480, 268, '250ms × 1000명 = 초당 250초를 기다린다', pop(u, 0.3));
    gauges(c); }

  // 3. 커넥션 풀 고갈
  function s3(t, c) { const { k, u } = c;
    base({ lamp: BAD, dbHot: true });
    crowd(P.cx, P.y, 24, '1000명 / 초');
    const x0 = 560, cw = 30;
    tx(x0, 64, '커넥션 풀 (한 칸 = 10개)', { 'font-size': 13, fill: MUT, 'font-weight': 600 });
    mono(x0 + 10 * (cw + 4) - 4, 64, '100 / 100', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
    for (let i = 0; i < 10; i++) { const on = k > 0 || i < lerp(7, 10, E(u, 0.2, 1.2));
      el('rect', { x: x0 + i * (cw + 4), y: 74, width: cw, height: 24, rx: 4, fill: on ? BAD : 'var(--panel)', stroke: on ? 'none' : GRID, 'stroke-width': 1.5, opacity: on ? 0.85 : 1 }); }
    if (k === 1) tx(x0 + 170, 120, '전부 /post/42 가 잡고 있다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
    const q = 7; for (let i = 0; i < q; i++) el('circle', { cx: P.sx - 74 - i * 13, cy: P.y + 26, r: 5, fill: BAD, opacity: 0.85 });
    sub(P.sx - 112, P.y + 50, '대기 200건 넘게', 1, { fill: BAD, 'font-weight': 700 });
    if (k === 2) { [['/product/list', '50 → 2000ms'], ['/search', '80 → 3000ms'], ['/user/profile', 'timeout']].forEach(([n, ms], i) => {
        const y = 42 + i * 34, s = pop(u, 0.2 + i * 0.35); pill(150, y, n, BAD, s, { mono: true, fs: 13 }); mono(240, y + 5, ms, { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.35) }); }); }
    if (k === 3) { [['커넥션 수 늘리기', '메모리·전환 비용'], ['DB 키우기', '비용 5배'], ['읽기 복제본', '일관성 문제']].forEach(([a, b], i) => {
        const cx = 210 + i * 270, s = pop(u, 0.2 + i * 0.35); card(cx, 300, 230, 64, { rx: 10, text: a + '\n' + b, fs: 14.5, stroke: WARN, color: INK, s }); });
      tx(480, 362, '세 가지 모두 원인은 그대로 남는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); return; }
    if (k === 4) { banner(480, 268, '원인 = 같은 결과를 매번 다시 계산한다', pop(u, 0.3)); }
    gauges(c); }

  // 4. 캐시 한 줄
  function s4(t, c) { const { k, u } = c, R0 = [P.sx + 150, P.ry];
    base({ lamp: k >= 2 ? GOOD : BAD, dbHot: c.beat.dbLoad >= 70, dbIdle: k === 2 || k === 5 });
    crowd(P.cx, P.y, 24, '1000명 / 초');
    const appear = k === 0 ? pop(u, 0.3) : 1;
    el('line', { x1: P.sx + 30, y1: P.y - 40, x2: R0[0] - 30, y2: R0[1] + 22, stroke: ACC, 'stroke-width': 2.5, opacity: appear });
    redisBox(R0[0], R0[1], { sub: '메모리 위 키-값', s: appear });
    const toR = [[P.sx + 30, P.y - 40], [R0[0] - 30, R0[1] + 22]], fromR = toR.slice().reverse().concat([[P.sx - 58, P.y], [P.cx + 30, P.y]]);
    if (k === 1) { dot(toR, seg(u, 0.2, 1.0), ACC, 7); pill(R0[0] + 120, R0[1], 'GET post:42', ACC, pop(u, 0.8), { mono: true, fs: 13.5 }); sub(R0[0], R0[1] + 50, '왕복 0.2ms', fade(u, 1.2)); }
    if (k === 2 || k === 5) { for (let i = 0; i < 10; i++) dot(fromR, ((t * 0.8 + i / 10) % 1), ACC, 5);
      pill(R0[0] + 120, R0[1], 'hit 999 / 1000', GOOD, k === 2 ? pop(u, 0.4) : 1, { fs: 13.5 }); }
    if (k === 3) { dot(toR, seg(u, 0.1, 0.6), ACC, 7); pill(R0[0] + 120, R0[1], 'miss', WARN, pop(u, 0.5), { mono: true });
      dot(toDB.slice(1), seg(u, 0.9, 1.7), INK, 7); dot(back.slice(0, 3), seg(u, 1.8, 2.6), INK, 7); sub(P.dx, P.y + 92, '1초에 1건쯤만', fade(u, 1.2), { 'font-weight': 700, fill: INK }); }
    if (k === 4) { fly(P.sx + 30, P.y - 40, R0[0], R0[1], seg(u, 0.2, 1.2), 'post:42', { mono: true });
      clock(R0[0] + 110, R0[1], 20, 1 - E(u, 1.2, 2.8) * 0.15, WARN, 'TTL 60s'); }
    if (k === 5) banner(480, 268, '같은 서버로 DB CPU 75% → 8%, p95 250ms → 5ms', pop(u, 0.3));
    gauges(c); }

  // 5. 효과 정리
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const x0 = 300, max = 600, rows = [['p95 응답', 1800, 5, 'ms'], ['DB CPU', 95, 8, '%'], ['처리 가능 RPS', 200, 10000, '']];
      tx(x0, 46, 'DB만', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); el('rect', { x: x0 + 40, y: 36, width: 14, height: 11, rx: 2, fill: OFF });
      tx(x0 + 80, 46, 'DB + Redis', { 'font-size': 13.5, fill: ACC, 'font-weight': 600 }); el('rect', { x: x0 + 158, y: 36, width: 14, height: 11, rx: 2, fill: ACC });
      rows.forEach(([name, a, b, unit], i) => { const y = 92 + i * 100, top = Math.max(a, b), g = E(u, 0.2 + i * 0.35, 1.4 + i * 0.35);
        tx(40, y + 14, name, { 'font-size': 16, 'font-weight': 700 });
        el('rect', { x: x0, y: y - 8, width: Math.max(3, max * a / top * g), height: 20, rx: 4, fill: OFF });
        el('rect', { x: x0, y: y + 18, width: Math.max(3, max * b / top * g), height: 20, rx: 4, fill: ACC });
        const fmt = (v) => v.toLocaleString('en-US') + unit, op = fade(u, 1.2 + i * 0.35);
        mono(Math.min(x0 + max * a / top + 8, x0 + max - 4), y + 8, fmt(a), { 'font-size': 14, 'text-anchor': a >= top ? 'end' : 'start', fill: a >= top ? 'var(--panel)' : INK, opacity: op });
        mono(Math.min(x0 + max * b / top + 8, x0 + max - 4), y + 34, fmt(b), { 'font-size': 14, 'font-weight': 700, 'text-anchor': b >= top ? 'end' : 'start', fill: b >= top ? 'var(--panel)' : ACC, opacity: op }); });
      tx(480, 400, '서버·DB 사양은 그대로, 코드 몇 줄만 바뀌었다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k === 1) { tx(480, 52, '캐시가 잘 듣는 데이터', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['같은 키를 반복해서 읽는다', '인기 글, 상품 상세'], ['값이 잘 안 바뀐다', '분 단위로 바뀌어도 OK'], ['조금 늦은 값을 허용한다', '60초 전 조회수는 괜찮다']].forEach(([a, b], i) => {
        const y = 110 + i * 74, s = pop(u, 0.2 + i * 0.3); card(400, y, 420, 58, { rx: 10, stroke: GOOD, sw: 2, s }); check(222, y, 11, s);
        tx(250, y - 3, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); tx(250, y + 19, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      card(790, 184, 230, 92, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.4) }); cross(700, 170, 10, pop(u, 1.4));
      tx(722, 175, '실시간 잔고', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(722, 198, '1원이라도 틀리면 안 된다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) });
      tx(480, 370, '세 조건 중 하나라도 빠지면 효과가 크게 줄어든다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k === 2) { tx(480, 52, '캐시가 만든 새 숙제', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['hit / miss 흐름', 'I-1-2'], ['TTL · 만료', 'III-1-1'], ['메모리가 차면 무엇을 지우나', 'III-1-2'], ['만료 순간 요청 폭주', 'V-1-1']].forEach(([a, ch], i) => {
        const y = 110 + i * 64, s = pop(u, 0.2 + i * 0.3); card(440, y, 460, 50, { rx: 25, stroke: WARN, sw: 2, s });
        tx(240, y + 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); mono(650, y + 6, ch, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.3) }); });
      return; }
    tx(480, 150, '같은 답을 두 번 계산하지 마라', { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, opacity: fade(u, 0.2, 0.8) });
    tx(480, 200, '캐시는 이 원칙을 강제하는 도구다', { 'text-anchor': 'middle', 'font-size': 17, fill: MUT, opacity: fade(u, 0.9) });
    [['1800ms → 5ms', 'p95'], ['95% → 8%', 'DB CPU'], ['200 → 10,000', 'RPS 한계']].forEach(([a, b], i) => { const s = pop(u, 1.2 + i * 0.25);
      card(250 + i * 230, 290, 200, 70, { rx: 10, stroke: ACC, sw: 2, s }); mono(250 + i * 230, 290, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3 + i * 0.25) });
      tx(250 + i * 230, 312, b, { 'text-anchor': 'middle', 'font-size': 13, fill: MUT, opacity: fade(u, 1.3 + i * 0.25) }); }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '캐시 없이 /post/42 요청이 1,000번 오면, DB에는 SELECT가 몇 번 가나?',
      o: ['1번 — 같은 글이니까 한 번이면 된다', '1,000번 — 요청마다 한 번씩', '0번 — 서버가 기억해 둔다'], a: 1,
      why: '캐시가 없으면 요청 1건이 DB 왕복 1번이다. 이 1:1 관계가 트래픽이 늘 때 그대로 부하가 된다.' },
    { q: '같은 글을 1,000명이 볼 때, DB가 하는 일 중 낭비인 것은?',
      o: ['첫 요청의 SELECT 계산', '나머지 999번의 똑같은 계산', '응답을 돌려보내는 일'], a: 1,
      why: '결과가 늘 같은 한 줄인데 DB는 매번 페이지를 읽고 행을 해석해 다시 만든다. 첫 번째만 필요하다.' },
    { q: '인기 글 하나 때문에 상품 목록 페이지까지 느려지는 이유는?',
      o: ['상품 목록 코드에 버그가 있어서', '같은 DB의 커넥션 풀을 인기 글 요청이 다 잡고 있어서', '네트워크 대역폭이 모자라서'], a: 1,
      why: '커넥션 풀은 같은 DB를 쓰는 모든 기능이 나눠 쓴다. 한 곳이 다 차지하면 다른 기능은 줄을 서야 한다.' },
    { q: '캐시를 넣은 뒤, Redis에 아직 없는 첫 요청(miss)은 어떻게 되나?',
      o: ['Redis가 빈 값을 돌려준다', 'DB에서 읽고, 그 결과를 Redis에 60초 동안 넣어 둔다', '에러를 내고 다시 시도하게 한다'], a: 1,
      why: 'cache-aside 방식이다. 없을 때만 DB에 가고 결과를 TTL과 함께 저장하므로, 그다음 요청부터는 Redis가 답한다.' },
    { q: '다음 중 캐시에 넣기 가장 위험한 데이터는?',
      o: ['인기 글 본문', '상품 상세 설명', '실시간 계좌 잔고'], a: 2,
      why: '캐시는 조금 늦은 값을 보여 줄 수 있다. 1원이라도 틀리면 안 되는 잔고는 캐시가 맞지 않는다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '캐시가 없으면 요청 한 번에 DB 조회도 한 번이다. 요청이 늘면 DB 일도 똑같이 는다.',
    '인기 글처럼 결과가 늘 같은데 매번 다시 계산하면, 첫 번째를 뺀 나머지는 전부 낭비다.',
    '한 기능이 DB 커넥션을 다 잡으면, 같은 DB를 쓰는 다른 화면까지 같이 느려진다.',
    '결과를 Redis에 60초만 넣어 둬도 초당 1,000건에서 DB CPU가 95%에서 8%로 내려간다.',
  ];
  const review = [
    { q: '인기 글 하나에 요청이 몰리자 상품 목록까지 느려졌다. 가장 먼저 손댈 곳은?',
      o: ['상품 목록 페이지의 코드', '인기 글 조회 결과를 Redis에 잠깐 넣어 두기', 'DB 커넥션 풀 크기를 무작정 늘리기'], a: 1,
      why: '원인은 같은 SELECT가 반복되며 커넥션을 다 잡은 것이다. 반복을 없애면 커넥션이 비고 상품 목록도 다시 빨라진다.' },
    { q: '캐시를 붙였는데 DB CPU가 거의 그대로다. 먼저 의심할 것은?',
      o: ['요청마다 캐시 키가 달라 hit가 거의 안 난다', 'Redis가 너무 빨라서 DB가 쉬지 못한다', '응답 크기가 너무 작다'], a: 0,
      why: '캐시는 같은 키를 다시 읽을 때만 효과가 있다. 키에 시각이나 세션 값이 섞이면 모든 요청이 miss가 되어 DB로 간다.' },
    { q: '세 가지 중 캐시 효과가 가장 큰 데이터는?',
      o: ['초당 수백 번 읽히고 하루 한 번 바뀌는 글 본문', '읽을 때마다 값이 달라지는 재고 수량', '한 번 쓰고 다시 읽지 않는 접속 로그'], a: 0,
      why: '많이 읽히고 드물게 바뀔수록 같은 답을 재사용하는 횟수가 늘어난다. 자주 바뀌거나 다시 읽지 않는 값은 캐시해도 얻는 게 적다.' },
  ];

  R.page({ title: '트래픽 부하 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
