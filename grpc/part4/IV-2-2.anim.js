/* IV-2-2 Cancellation & Circuit Breaking — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실측(날것 HTTP/2 서버로 받아 봄): grpc-js 의 cancel() 과 마감 초과, Python 의 timeout 초과 모두 RST_STREAM error_code 8 (CANCEL) 을 보냈다.
 * grpc-js 클라이언트가 받은 상태: CANCELLED(1) "Cancelled on client", DEADLINE_EXCEEDED(4). 서버 핸들러는 cancelled 이벤트로 감지해 루프를 멈췄다.
 * 회로 차단기(gobreaker)·Envoy 설정값은 페이지 코드의 값이다. 회로 동작 그림은 그 설정을 그린 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, person, server, dbIcon, terminal, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 작업 덩어리 줄: done 개 처리, cut 위치에서 끊김(이후 회색), 사이마다 select 확인 지점(마름모)
  function chunks(x0, y, n, done, cut, o) { o = o || {}; const w = o.w || 46, g = 18;
    for (let i = 0; i < n; i++) { const x = x0 + i * (w + g), dead = cut != null && i >= cut, ok = i < done;
      card(x + w / 2, y, w, 40, { rx: 6, text: dead ? '' : ok ? '✓' : String(i), fs: 14, fw: 800, mono: true, stroke: dead ? GRID : ok ? GOOD : INK, color: ok ? GOOD : INK, fill: dead ? SOFT : PANEL, op: dead ? 0.5 : 1 });
      if (i < n - 1) { const dx = x + w + g / 2; el('path', { d: `M${dx},${y - 7} L${dx + 6},${y} L${dx},${y + 7} L${dx - 6},${y} Z`, fill: cut === i + 1 ? BAD : WARN }); } }
    if (cut != null) { const x = x0 + cut * (w + g) - g / 2; el('line', { x1: x, y1: y - 36, x2: x, y2: y + 36, stroke: BAD, 'stroke-width': 3 }); } }

  // ---------- 1. 취소란 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const T = [['cancel()', '코드가 직접'], ['deadline 만료', 'WithTimeout'], ['연결 끊김', '탭 닫기 · 네트워크']];
      T.forEach(([a, b], i) => { const y = 90 + i * 110, s = pop(u, 0.2 + i * 0.35); card(160, y, 220, 70, { rx: 10, stroke: INK, sw: 2, s });
        tx(160, y - 4, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: s, class: i === 0 ? 'mono' : null }); sub(160, y + 20, b, s);
        grow(272, y, 560, 200, E(u, 0.8 + i * 0.3, 1.5 + i * 0.3), BAD); });
      card(680, 200, 220, 80, { rx: 40, stroke: BAD, sw: 3, fill: BADBG, s: pop(u, 1.9) });
      tx(680, 208, 'ctx 취소', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
      sub(680, 280, '세 경로 모두 결과는 하나', fade(u, 2.2)); return; }
    if (k === 1) { person(90, 200, 'Client', {}); server(820, 190, 'Server', {});
      el('line', { x1: 130, y1: 200, x2: 750, y2: 200, stroke: GRID, 'stroke-width': 6 });
      mono(440, 180, 'stream 1', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      const f = E(u, 0.3, 1.4); if (f > 0) { const x = lerp(160, 540, f); card(x + 60, 240, 260, 64, { rx: 6, stroke: BAD, sw: 2.4, fill: BADBG });
        tx(x - 60, 234, 'RST_STREAM', { 'font-size': 15, 'font-weight': 800, fill: BAD }); mono(x - 60, 258, 'error_code 8 (CANCEL)', { 'font-size': 14, fill: BAD }); }
      el('rect', { x: 700, y: 300, width: 200, height: 40, rx: 20, fill: E(u, 1.5, 1.9) > 0.5 ? BADBG : SOFT, stroke: E(u, 1.5, 1.9) > 0.5 ? BAD : INK, 'stroke-width': 2 });
      mono(800, 326, E(u, 1.5, 1.9) > 0.5 ? 'ctx.Done() 닫힘' : 'ctx.Done()', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: E(u, 1.5, 1.9) > 0.5 ? BAD : INK });
      sub(440, 390, '실측: cancel() · 마감 초과 모두 RST_STREAM 코드 8 이 나갔다', fade(u, 2.0)); return; }
    if (k === 2) { person(90, 200, '떠난 클라이언트', { op: 0.35 });
      server(480, 170, 'Server', { lamp: BAD });
      [['CPU', '계속 사용 중'], ['DB 커넥션', '계속 점유 중']].forEach(([a, b], i) => { const s = pop(u, 0.4 + i * 0.4); card(760, 110 + i * 80, 260, 62, { rx: 10, stroke: BAD, sw: 2.2, s });
        tx(650, 104 + i * 80, a, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: s }); tx(650, 128 + i * 80, b, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: s }); });
      for (let i = 0; i < 6; i++) dot([[480, 230], [480, 320], [800, 320]], ((t * 0.6 + i / 6) % 1), WARN, 5);
      note(480, 380, '아무도 기다리지 않는 결과를 만드는 유령 작업', fade(u, 1.2), { 'text-anchor': 'middle', fill: BAD }); return; }
    const done = k === 3 ? Math.floor(E(u, 0.3, 2.2) * 4) : k === 5 ? 3 + Math.floor(E(u, 0.3, 1.2) * 2) : 3;
    if (k <= 5) { tx(60, 90, 'func longWork(ctx) — 1000번 반복을 작게 쪼갠다', { 'font-size': 16, 'font-weight': 800 });
      chunks(60, 180, 12, done, k === 4 ? (u > 0.8 ? 3 : null) : null);
      tx(60, 240, '◆ = select { case <-ctx.Done(): … default: doOneChunk(i) }', { 'font-size': 14, class: 'mono', fill: WARN });
      if (k === 4) { pill(560, 320, 'return status.FromContextError(ctx.Err()).Err()', BAD, pop(u, 1.0), { mono: true, fs: 13.5 }); sub(560, 360, '남은 반복은 버리고 즉시 반환', fade(u, 1.6)); }
      if (k === 5) note(60, 320, '취소가 없으면 default 로 한 덩어리씩 · 그래서 자주 확인할 수 있다', fade(u, 1.4), { fill: GOOD });
      return; }
    [['context.Canceled', 'codes.Canceled', '1'], ['context.DeadlineExceeded', 'codes.DeadlineExceeded', '4']].forEach(([a, b, n], i) => { const y = 140 + i * 120;
      card(220, y, 300, 60, { rx: 10, text: a, fs: 15, mono: true, fw: 700, stroke: INK, s: pop(u, 0.2 + i * 0.5) });
      grow(372, y, 520, y, E(u, 0.6 + i * 0.5, 1.0 + i * 0.5), BAD);
      card(690, y, 320, 60, { rx: 10, stroke: BAD, sw: 2.4, s: pop(u, 1.0 + i * 0.5) });
      mono(560, y + 6, b, { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1 + i * 0.5) }); mono(830, y + 6, n, { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.1 + i * 0.5) }); });
    sub(480, 380, 'status.FromContextError 가 이 짝을 맞춰 준다', fade(u, 2.0)); }

  // ---------- 2. 클라이언트 — 명시적 취소 ----------
  function race(c, o) { const { k, u } = c; o = o || {};
    person(70, 200, 'firstOf', {});
    card(200, 200, 110, 48, { rx: 10, text: 'ctx', fs: 18, mono: true, fw: 800, stroke: ACC, color: ACC });
    [['tokyo', 'stream 1', 130], ['osaka', 'stream 3', 270]].forEach(([n, s, y], i) => {
      server(840, y, n, { s: 0.7, stroke: o.cut && i === 1 ? GRID : INK });
      el('path', { d: `M255,200 C380,200 420,${y} 520,${y} L780,${y}`, fill: 'none', stroke: o.cut && i === 1 ? BAD : GRID, 'stroke-width': 3, 'stroke-dasharray': o.cut && i === 1 ? '7 6' : null });
      mono(560, y - 12, s, { 'font-size': 13.5, fill: MUT }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { card(300, 200, 150, 60, { rx: 10, text: 'ctx', fs: 20, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.3) });
      card(600, 200, 170, 60, { rx: 10, text: 'cancel()', fs: 18, mono: true, fw: 800, stroke: BAD, color: BAD, s: pop(u, 0.7) });
      el('line', { x1: 375, y1: 200, x2: 515, y2: 200, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '2 6', opacity: fade(u, 1.0) });
      mono(450, 120, 'ctx, cancel := context.WithCancel(bg)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      pill(450, 300, 'defer cancel()  // 나갈 때 반드시 정리', GOOD, pop(u, 1.6), { mono: true, fs: 14 }); return; }
    race(c, { cut: k === 2 });
    if (k === 1) { [130, 270].forEach((y, i) => dot([[255, 200], [400, (200 + y) / 2], [520, y], [780, y]], seg(u, 0.3 + i * 0.1, 1.8 + i * 0.1), ACC, 7));
      note(70, 380, '같은 ctx 로 두 replica 에 동시에 · 한 커넥션 위 두 스트림', fade(u, 1.6)); return; }
    if (k === 2) { dot([[780, 130], [520, 130], [255, 200]], seg(u, 0.1, 0.8), GOOD, 7);
      pill(560, 70, '첫 응답 채택', GOOD, pop(u, 0.6), { fs: 14 });
      const f = E(u, 1.0, 1.8); if (f > 0) { const x = lerp(300, 700, f); card(x, 310, 200, 36, { rx: 6, text: 'RST_STREAM (stream 3)', fs: 13.5, mono: true, fw: 800, stroke: BAD, color: BAD, fill: BADBG }); }
      pill(700, 370, 'osaka 호출 → codes.Canceled', BAD, pop(u, 2.0), { mono: true, fs: 13.5 }); return; }
    if (k === 3) { clock(640, 200, 38, E(u, 0.3, 2.4), WARN, ''); mono(640, 340, 'WithTimeout 2s', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      tx(300, 330, '시간이 대신', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); tx(300, 356, 'cancel() 을 누른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      return; }
    if (k === 4) { [['codes.Canceled (1)', '"Cancelled on client"', '내가 포기했다'], ['codes.DeadlineExceeded (4)', '"Deadline exceeded after 0.303s"', '시간이 다 됐다']].forEach(([a, b, d], i) => { const y = 330 + i * 0;
        const x = 290 + i * 400, s = pop(u, 0.3 + i * 0.5); card(x, 360, 380, 96, { rx: 10, stroke: i ? WARN : BAD, sw: 2.2, s, fill: PANEL });
        mono(x - 172, 338, a, { 'font-size': 15, 'font-weight': 800, fill: i ? WARN : BAD, opacity: s }); mono(x - 172, 364, b, { 'font-size': 13.5, opacity: s }); tx(x - 172, 392, d, { 'font-size': 14, fill: MUT, opacity: s }); });
      tx(70, 300, 'status.Code(err) 로 원인을 가른다 · 실측 메시지 (grpc-js)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) }); return; }
    terminal(200, 310, 500, 90, ['$ go vet ./...', ['lostcancel: cancel 함수를 부르지 않은 경로가 있다', '#fbbf24']], E(u, 0.3, 1.6) * 2, { title: 'go vet' });
    note(560, 70, 'cancel() 을 안 부르면 타이머와 context 가 남는다', fade(u, 0.2), { 'text-anchor': 'middle', fill: BAD }); }

  // ---------- 3. 서버 — 감지하고 전파 ----------
  const NODES = [['Client', 90, 70], ['Query 핸들러', 330, 70], ['db.QueryContext', 220, 330], ['rank.Score', 560, 330]];
  function tree(dead, o) { o = o || {};
    grow(150, 70, 255, 70, 1, MUT); grow(330, 98, 240, 300, 1, MUT); grow(370, 98, 540, 300, 1, o.bg ? BAD : MUT, { dash: o.bg ? '6 5' : null });
    NODES.forEach(([n, x, y], i) => { const d = dead[i], s = d > 0 ? d : 0;
      card(x, y, i === 0 ? 120 : 190, 52, { rx: 10, text: n, fs: 14.5, mono: i > 1, fw: 800, stroke: s > 0.5 ? BAD : INK, color: s > 0.5 ? BAD : INK, fill: s > 0.5 ? BADBG : PANEL });
      if (s > 0.5) tx(x, y + 44, 'Canceled', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }); }
  function pages(x0, y0, done, cut) { for (let i = 0; i < 50; i++) { const x = x0 + (i % 10) * 26, y = y0 + Math.floor(i / 10) * 26, d = cut != null && i >= cut;
      el('rect', { x, y, width: 22, height: 22, rx: 3, fill: i < done ? GOOD : d ? SOFT : PANEL, stroke: d ? GRID : i < done ? GOOD : INK, 'stroke-width': 1.2, opacity: i < done ? 0.8 : 1 }); }
    tx(x0, y0 - 12, '50페이지 스캔 · 칸마다 select', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  function s3(t, c) { const { k, u } = c;
    const dead = [[0, 0, 0, 0], [0, 0, 0, 0], [1, E(u, 0.4, 0.8), 0, 0], [1, 1, E(u, 0.4, 0.8), 0], [1, 1, 1, E(u, 0.4, 0.8)], [E(u, 0.2, 0.4), E(u, 0.6, 0.8), E(u, 1.0, 1.2), E(u, 1.4, 1.6)]][k];
    tree(dead, { bg: false });
    if (k === 0) { dot([[150, 70], [235, 70]], seg(u, 0.3, 1.0), ACC, 7); note(560, 70, 'ctx 는 클라이언트 취소와 직결', fade(u, 1.0)); return; }
    if (k === 1 || k === 2) { const done = k === 1 ? Math.floor(E(u, 0.2, 2.4) * 18) : 18; pages(640, 160, done, k === 2 && u > 0.7 ? 18 : null);
      if (k === 2) note(640, 330, '취소 → 남은 페이지 버리고 즉시 반환', fade(u, 1.0), { fill: BAD }); return; }
    if (k === 3) { dbIcon(220, 230, null, { s: 0.5, stroke: BAD }); note(600, 150, '같은 ctx 를 넘겼을 뿐인데', fade(u, 0.6)); note(600, 178, '드라이버가 실행 중인 쿼리를 끊는다', fade(u, 0.9), { fill: BAD }); return; }
    if (k === 4) { note(600, 150, 'rank.Score(ctx, …) · 받은 ctx 그대로', fade(u, 0.6), { class: 'mono' });
      card(760, 250, 330, 60, { rx: 10, stroke: BAD, sw: 1.8, dash: '6 5', s: pop(u, 1.2) });
      mono(610, 246, 'rank.Score(context.Background())', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.3) }); tx(610, 268, '→ 사슬이 끊겨 하위는 계속 돈다', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.4) }); return; }
    banner(700, 180, 'cancel 한 번이 트리 전체를 멈춘다', pop(u, 1.6)); }

  // ---------- 4. 회로 차단 ----------
  const ST = { CLOSED: [200, 110, GOOD, '통과 · 실패를 센다'], OPEN: [520, 110, BAD, '호출 없이 즉시 실패'], HALF_OPEN: [360, 300, WARN, '시험 요청만 흘린다'] };
  function machine(cur, u, o) { o = o || {};
    [['CLOSED', 'OPEN', '연속 실패 5'], ['OPEN', 'HALF_OPEN', 'Timeout 15s 후'], ['HALF_OPEN', 'CLOSED', '시험 성공']].forEach(([a, b, l], i) => { const [x1, y1] = ST[a], [x2, y2] = ST[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      el('line', { x1: lerp(x1, x2, 0.28), y1: lerp(y1, y2, 0.28), x2: lerp(x1, x2, 0.72), y2: lerp(y1, y2, 0.72), stroke: GRID, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: o.op ?? 1 });
      tx(mx + (i === 0 ? 0 : i === 1 ? 70 : -70), my + (i === 0 ? -16 : 0), l, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); });
    Object.entries(ST).forEach(([n, [x, y, col, d]], i) => { const on = n === cur, s = o.pop ? pop(u, 0.2 + i * 0.35) : 1;
      card(x, y, 170, 62, { rx: 31, stroke: on ? col : GRID, sw: on ? 3 : 1.6, fill: on ? PANEL : SOFT, s });
      tx(x, y - 2, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? col : MUT, opacity: s }); tx(x, y + 18, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); }); }
  function fails(c, x, y) { const b = c.beat.breaker, p = (c.prev && c.prev.breaker) || b, f = tween(p.fails, b.fails, c.u);
    tx(x, y - 16, `연속 실패 ${Math.round(f)} / 5`, { 'font-size': 14, 'font-weight': 800 });
    for (let i = 0; i < 5; i++) el('rect', { x: x + i * 34, y, width: 28, height: 28, rx: 5, fill: i < f - 0.5 ? BAD : SOFT, stroke: GRID }); }
  function s4(t, c) { const { k, u } = c, st = c.beat.breaker.state;
    if (k === 0) { machine(st, u, { pop: true }); return; }
    machine(st, u, { op: 0.9 }); fails(c, 720, 60);
    if (k === 1) { ['Name: "ranker"', 'MaxRequests: 3   // HALF_OPEN 시험 수', 'Interval: 10s    // 카운트 리셋', 'Timeout: 15s     // OPEN 유지'].forEach((l, i) => mono(650, 150 + i * 30, l, { 'font-size': 14, fill: i === 3 ? BAD : INK, 'font-weight': i === 3 ? 800 : 400, opacity: fade(u, 0.2 + i * 0.3) })); return; }
    if (k === 2) { mono(650, 180, 'ReadyToTrip: c.ConsecutiveFailures >= 5', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) }); note(650, 220, '하나만 더 실패하면 열린다', fade(u, 1.2), { fill: WARN }); return; }
    if (k === 3) { card(760, 280, 300, 80, { rx: 10, stroke: INK, sw: 2.4 }); mono(630, 276, 'cb.Execute(func() {', { 'font-size': 14 }); mono(630, 300, '  invoker(ctx, …) })', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      dot([[640, 200], [760, 280], [920, 280]], seg(u, 0.3, 1.6), ACC, 7); note(650, 360, '성공·실패는 여기서만 센다', fade(u, 1.6)); return; }
    if (k === 4) { // OPEN: 즉시 되돌림
      dot([[640, 240], [760, 240], [700, 300]], seg(u, 0.2, 1.0), BAD, 7); dot([[640, 240], [760, 240], [700, 300]], seg(u, 1.0, 1.8), BAD, 7);
      pill(760, 330, 'gobreaker.ErrOpenState', BAD, pop(u, 0.8), { mono: true, fs: 14 }); cross(880, 240, 12, pop(u, 0.6)); sub(760, 370, 'invoker 를 부르지도 않는다', fade(u, 1.4)); return; }
    if (k === 5) { mono(640, 200, 'grpc.NewClient("ranker:50051",', { 'font-size': 14 }); mono(640, 226, '  WithUnaryInterceptor(', { 'font-size': 14 }); mono(640, 252, '    breakerInterceptor(cb)))', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      for (let i = 0; i < 4; i++) dot([[620, 320 + i * 0], [930, 320]], ((t * 0.5 + i / 4) % 1), BAD, 5);
      note(640, 360, '이 커넥션의 모든 unary 호출이 회로를 지난다', fade(u, 1.0)); return; }
    // k6 효과: 5번 실패 후 15초 즉시 에러 (예시 타임라인)
    const x0 = 620, y = 280; tx(x0, 230, 'ranker 가 죽었을 때 (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 5; i++) { const s = pop(u, 0.2 + i * 0.15); card(x0 + 14 + i * 26, y, 22, 32, { rx: 4, fill: BAD, stroke: 'none', s }); }
    const g = E(u, 1.2, 2.2); el('rect', { x: x0 + 140, y: y - 16, width: 170 * g, height: 32, rx: 5, fill: BADBG, stroke: BAD, 'stroke-dasharray': '5 4' });
    tx(x0 + 225, y + 5, '15s 즉시 에러', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    sub(x0 + 150, y + 52, '실제 호출 5번 · 스레드·커넥션 보존', fade(u, 2.0)); }

  // ---------- 5. Envoy ----------
  const HOSTS = ['ranker-1', 'ranker-2', 'ranker-3', 'ranker-4'];
  function cluster(o) { o = o || {};
    zone(40, 40, 300, 340, 'cluster: ranker · ROUND_ROBIN', { fill: SOFT, stroke: GRID, sw: 1.5 });
    HOSTS.forEach((h, i) => { const y = 100 + i * 70, ej = o.ej === i, sick = o.sick === i;
      card(190, y, 240, 52, { rx: 10, stroke: ej ? GRID : sick ? BAD : INK, sw: sick ? 2.6 : 2, fill: ej ? SOFT : PANEL, op: ej ? 0.55 : 1 });
      mono(90, y + 5, h, { 'font-size': 15, 'font-weight': 800, fill: ej ? OFF : sick ? BAD : INK });
      if (ej) tx(290, y + 5, '축출 30s', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); });
    tx(54, 370, 'connect_timeout 1s', { 'font-size': 13.5, class: 'mono', fill: MUT }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { cluster(); person(560, 210, 'Envoy 앞 클라이언트', {});
      HOSTS.forEach((h, i) => dot([[520, 210], [330, 100 + i * 70]], seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3), ACC, 6));
      note(600, 330, '방어선은 이 클러스터 위에 얹는다', fade(u, 1.8)); return; }
    if (k === 1) { cluster(); const L = [['max_connections', 100, 100], ['max_pending_requests', 50, 50], ['max_requests', 100, 100], ['max_retries', 3, 3]];
      L.forEach(([n, v, m], i) => { const y = 80 + i * 70, f = E(u, 0.2 + i * 0.25, 1.0 + i * 0.25);
        mono(400, y, n, { 'font-size': 14.5, 'font-weight': 700 }); el('rect', { x: 400, y: y + 12, width: 380, height: 20, rx: 4, fill: SOFT, stroke: GRID });
        el('rect', { x: 400, y: y + 12, width: 380 * f, height: 20, rx: 4, fill: i === 1 ? BAD : WARN, opacity: 0.8 }); mono(800, y + 28, String(v), { 'font-size': 15, 'font-weight': 800 }); });
      fly(940, 180, 820, 150, seg(u, 1.8, 2.5), '51번째 대기', { fill: BAD }); return; }
    if (k === 2) { const ej = u > 1.8; cluster({ sick: ej ? null : 2, ej: ej ? 2 : null });
      for (let i = 0; i < 5; i++) { const s = pop(u, 0.2 + i * 0.25); card(420 + i * 54, 240, 46, 34, { rx: 6, text: '5xx', fs: 13.5, fw: 800, mono: true, stroke: BAD, color: BAD, s }); }
      tx(420, 200, 'consecutive_5xx: 5 · interval 10s', { 'font-size': 14.5, class: 'mono', 'font-weight': 700 });
      note(420, 320, '최대 50%(넷 중 둘)까지만 뺀다 · 전멸 방지', fade(u, 2.0)); sub(420, 348, '축출 시간 = 30s × 연속 축출 횟수', fade(u, 2.3), { 'text-anchor': 'start' }); return; }
    if (k === 3) { cluster({ sick: 2 });
      card(560, 130, 300, 64, { rx: 6, stroke: INK, sw: 2, s: pop(u, 0.2) }); mono(424, 126, ':status: 200', { 'font-size': 14, opacity: fade(u, 0.3) }); mono(424, 150, 'grpc-status: 14', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) });
      grow(712, 130, 790, 130, E(u, 0.8, 1.2), BAD);
      card(860, 130, 110, 64, { rx: 10, text: '503', fs: 24, mono: true, fw: 800, stroke: BAD, color: BAD, s: pop(u, 1.2) });
      card(640, 280, 460, 70, { rx: 10, stroke: GRID, sw: 1.6, dash: '6 5', s: pop(u, 1.8) });
      mono(424, 276, 'split_external_local_origin_errors', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.9) }); tx(424, 300, '연결 실패·타임아웃은 따로 센다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { [['circuit_breakers', '클러스터 전체가 너무 바쁘다', '동시성 상한 초과분 즉시 실패', WARN], ['outlier_detection', '특정 인스턴스가 병들었다', '그 host 만 LB 에서 뺀다', BAD]].forEach(([a, b, d, col], i) => {
        const x = 250 + i * 460, s = pop(u, 0.3 + i * 0.6); card(x, 200, 400, 180, { rx: 14, stroke: col, sw: 2.4, s });
        mono(x, 150, a, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); tx(x, 200, b, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); tx(x, 236, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
      note(480, 360, '보는 대상이 달라 서로 겹치지 않는다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { [['ranker 서비스', 120, INK], ['Envoy · 커넥션·인스턴스 레벨', 200, INFO], ['gobreaker · 프로세스 안 fail fast', 280, BAD]].forEach(([n, r, col], i) => { const s = E(u, 0.2 + (2 - i) * 0.4, 0.8 + (2 - i) * 0.4);
        el('ellipse', { cx: 480, cy: 210, rx: (r + 60) * s, ry: r * 0.62 * s, fill: i === 0 ? PANEL : 'none', stroke: col, 'stroke-width': 2.6 });
        if (s > 0.8) tx(480, 210 - r * 0.62 + (i === 0 ? 68 : 24), n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); });
      return; }
    [['취소', '낭비를 막는다', '받은 ctx 전달 · deadline', ACC], ['회로 차단', '장애를 격리한다', 'gobreaker + Envoy', BAD]].forEach(([a, b, d, col], i) => { const x = 270 + i * 420, s = pop(u, 0.3 + i * 0.5);
      card(x, 190, 360, 170, { rx: 14, stroke: col, sw: 2.6, s }); tx(x, 150, a, { 'font-size': 22, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
      tx(x, 194, b, { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); tx(x, 228, d, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    note(480, 350, '다음: V-1-1 grpc-gateway — REST/JSON 브릿지', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); }

  const quiz = [
    { q: '클라이언트가 cancel()을 부르면 서버로 가는 HTTP/2 프레임은 무엇인가?',
      o: ['GOAWAY', 'RST_STREAM', 'DATA에 빈 메시지'], a: 1,
      why: '그 스트림 하나만 끊는 RST_STREAM이 간다. 실측에서 error_code는 8(CANCEL)이었고 서버의 ctx.Done()이 닫혔다.' },
    { q: 'tokyo와 osaka에 같은 ctx로 던진 뒤 tokyo가 먼저 답했다. cancel()을 부르면 osaka 호출은 어떻게 되나?',
      o: ['codes.Canceled로 끝난다', '응답을 끝까지 받아 버린다', 'codes.DeadlineExceeded로 끝난다'], a: 0,
      why: '같은 ctx를 쓰므로 cancel() 한 번에 남은 호출이 끊긴다. 내가 포기한 것이라 코드는 Canceled(1)다.' },
    { q: '서버 핸들러가 rank.Score를 부를 때 context.Background()를 넘기면 무엇이 문제인가?',
      o: ['rank.Score가 컴파일되지 않는다', '응답이 두 번 온다', '상위가 취소돼도 rank.Score는 계속 돈다'], a: 2,
      why: '새 Background는 클라이언트 취소와 이어져 있지 않다. 받은 ctx를 그대로 넘겨야 사슬 끝까지 멈춘다.' },
    { q: '회로가 OPEN일 때 cb.Execute는 무엇을 하는가?',
      o: ['invoker를 부르지 않고 ErrOpenState를 바로 돌려준다', '15초 동안 요청을 줄 세워 둔다', '다른 replica로 요청을 돌린다'], a: 0,
      why: 'OPEN의 가치는 호출하지 않는 데 있다. 죽은 ranker를 두드리지 않아 스레드와 커넥션이 남는다.' },
    { q: 'Envoy outlier_detection이 gRPC 응답의 5xx를 세는 방식은 무엇인가?',
      o: ['HTTP :status 200만 보므로 gRPC 실패는 못 센다', 'grpc-message 문구를 읽는다', 'grpc-status를 HTTP 코드로 바꿔 센다'], a: 2,
      why: 'gRPC는 :status 200 위에 결과를 싣기 때문에 Envoy가 grpc-status를 HTTP 코드로 바꿔 판단한다. UNAVAILABLE은 503이다.' },
  ];

  const summary = [
    '클라이언트가 떠난 뒤에도 서버가 일을 계속하면 CPU와 DB 커넥션만 쓴다.',
    'cancel(), 마감 초과, 연결 끊김은 모두 RST_STREAM으로 가서 서버의 ctx.Done()을 닫는다.',
    '서버는 받은 ctx를 DB와 하위 호출에 그대로 넘겨야 취소가 끝까지 닿는다.',
    '하위 서비스가 계속 실패하면 회로를 열어 즉시 실패시키고, Envoy로 병든 host를 뺀다.',
  ];
  const review = [
    { q: '사용자가 검색 창을 닫았는데 랭킹 서비스 CPU가 그대로 높다. 먼저 볼 곳은?',
      o: ['랭킹 서비스의 회로 차단 임계값', '검색 핸들러가 rank.Score에 받은 ctx를 넘기는지', 'Envoy의 max_connections 값'], a: 1,
      why: '취소가 랭킹까지 닿지 않는 것이다. 중간에서 Background()로 갈아치우면 상위 취소가 하위에 전달되지 않는다.' },
    { q: 'ranker가 죽자 검색 서버 스레드가 전부 ranker 응답을 기다리며 묶였다. 코드에서 붙일 것은?',
      o: ['gobreaker 인터셉터로 연속 실패 시 회로를 연다', 'retryPolicy의 maxAttempts를 늘린다', 'ctx 대신 Background()를 쓴다'], a: 0,
      why: '연속 실패 5번 뒤 회로가 열리면 15초 동안 호출 없이 바로 실패한다. 재시도를 늘리면 오히려 더 묶인다.' },
    { q: 'ranker 네 대 중 한 대만 계속 UNAVAILABLE을 낸다. Envoy에서 쓸 설정은?',
      o: ['circuit_breakers의 max_requests를 낮춘다', 'connect_timeout을 늘린다', 'outlier_detection으로 그 host를 잠시 뺀다'], a: 2,
      why: '한 인스턴스만 병든 경우는 outlier_detection의 몫이다. circuit_breakers는 클러스터 전체의 동시성 상한을 본다.' },
  ];

  R.page({ title: '취소 · 회로 차단', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
