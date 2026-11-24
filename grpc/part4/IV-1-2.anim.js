/* IV-1-2 Deadline / Timeout — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 홉별 남은 시간 막대는 beat 의 chain[{name, remaining, status, note}] 를 읽는다.
 * 실측(grpcio 1.85, A→B→C 각 홉 80ms 소비): 남은 시간 302 → 221 → 139ms, 전파를 끊으면 C 의 남은 시간이 사실상 무한.
 * 와이어의 grpc-timeout 은 Python 클라이언트가 "300m", grpc-js 가 "290m"(이름 해석에 쓴 시간을 뺀 값)을 보냈다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, person, server, dbIcon, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const COL = { set: ACC, ok: GOOD, warn: WARN, exceeded: BAD, idle: OFF };

  // ---------- 남은 시간 막대: 0~300ms 축, 모든 막대가 같은 마감선(300ms)에서 끝난다 ----------
  const AX0 = 250, PX = 1.8, X = (ms) => AX0 + ms * PX, DL = X(300);
  const RY = (i) => 70 + i * 54;
  function budget(c, o) { o = o || {}; const ch = c.beat.chain || [], pv = (c.prev && c.prev.chain) || [];
    // 축
    el('line', { x1: AX0, y1: 300, x2: DL + 40, y2: 300, stroke: GRID, 'stroke-width': 2 });
    [0, 100, 200, 300].forEach((v) => { el('line', { x1: X(v), y1: 300, x2: X(v), y2: 306, stroke: MUT }); mono(X(v), 324, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    el('line', { x1: DL, y1: 34, x2: DL, y2: 300, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
    tx(DL, 26, 'deadline = T0 + 300ms', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' });
    ch.forEach((n, i) => { const y = RY(i), p = pv.find((q) => q.name === n.name), inf = /무한|per-hop|누적/.test(n.note || '');
      const s = p ? 1 : pop(c.u, 0.2 + i * 0.2); if (s <= 0) return;
      const rem = tween(p ? p.remaining : n.remaining, n.remaining, c.u), col = COL[n.status] || INK;
      tx(40, y + 5, n.name, { 'font-size': 15, 'font-weight': 800, opacity: s });
      if (n.status === 'idle') { el('rect', { x: X(300 - rem), y: y - 13, width: Math.max(2, (DL - X(300 - rem))), height: 26, rx: 5, fill: 'none', stroke: OFF, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', opacity: s });
        tx(X(300 - rem) + 10, y + 5, n.note, { 'font-size': 13.5, fill: MUT, opacity: s }); return; }
      const x0 = X(300 - rem), x1 = inf ? 930 : DL;
      el('rect', { x: Math.min(x0, x1), y: y - 13, width: Math.abs(x1 - x0) * s, height: 26, rx: 5, fill: col, opacity: 0.85 });
      if (inf) mono(918, y + 6, '∞', { 'font-size': 20, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end' });
      if (rem < 0) mono(DL + 8, y - 18, `${Math.round(rem)}ms`, { 'font-size': 14, 'font-weight': 800, fill: BAD });
      else if (!inf && DL - x0 > 70) mono(x0 + 8, y + 5, `${Math.round(rem)}ms`, { 'font-size': 14, 'font-weight': 800, fill: PANEL });
      else if (!inf) mono(x0 - 8, y + 5, `${Math.round(rem)}ms`, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'end' });
      if (!o.quiet) tx(132, y + 5, n.note, { 'font-size': 13.5, fill: MUT }); }); }

  // ---------- 1. Timeout 이 아니라 Deadline ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { // 홉마다 5초를 새로 잰다
      const x0 = 140, S = 48;   // 1s = 48px
      el('line', { x1: x0, y1: 280, x2: x0 + 15 * S + 20, y2: 280, stroke: GRID, 'stroke-width': 2 });
      [0, 5, 10, 15].forEach((v) => mono(x0 + v * S, 304, v + 's', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }));
      [['Client → A', '5s 타이머'], ['A → B', '다시 5s'], ['B → C', '다시 5s']].forEach(([a, b], i) => { const g = k === 0 ? E(u, 0.2 + i * 0.7, 0.8 + i * 0.7) : 1, y = 110 + i * 58;
        tx(30, y + 5, a, { 'font-size': 15, 'font-weight': 800, opacity: g > 0 ? 1 : 0.3 });
        el('rect', { x: x0 + i * 5 * S, y: y - 14, width: 5 * S * g, height: 28, rx: 5, fill: i === 2 && k === 1 ? BAD : WARN, opacity: 0.85 });
        if (g > 0.5) tx(x0 + i * 5 * S + 12, y + 5, b, { 'font-size': 14, 'font-weight': 700, fill: PANEL }); });
      if (k === 1) { el('line', { x1: x0 + 5 * S, y1: 70, x2: x0 + 5 * S, y2: 280, stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
        tx(x0 + 5 * S, 60, '클라이언트 기대 5s', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
        el('line', { x1: x0 + 15 * S, y1: 70, x2: x0 + 15 * S, y2: 280, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
        tx(x0 + 15 * S, 60, '최악 15s', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
        note(480, 370, '상대 시간만으로는 요청 전체의 상한을 정할 수 없다', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD }); }
      else note(480, 370, '홉마다 "지금부터 5초"를 새로 잰다', fade(u, 2.2), { 'text-anchor': 'middle' });
      return; }
    budget(c, { quiet: k >= 3 });
    if (k === 2) { note(560, 370, '마감 시각 하나를 공유 · 남은 시간만 줄어든다', fade(u, 1.4), { 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 3) { ['300m', '220m', '140m'].forEach((h, i) => { const s = pop(u, 0.4 + i * 0.4); if (s > 0) pill(150, RY(i) + 27, 'grpc-timeout: ' + h, ACC, s, { mono: true, fs: 13.5, fill: PANEL }); });
      note(560, 370, '헤더에는 남은 시간을 싣고, 홉마다 다시 계산한다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { card(280, 200, 330, 92, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.3) });
      mono(130, 188, 'context.WithTimeout(', { 'font-size': 15, opacity: fade(u, 0.5) }); mono(130, 214, '  bg, 300*time.Millisecond)', { 'font-size': 15, opacity: fade(u, 0.6) });
      grow(450, 200, 600, 200, E(u, 1.0, 1.5), ACC);
      card(730, 200, 220, 60, { rx: 10, text: 'T0 + 300ms', fs: 18, mono: true, fw: 800, stroke: INK, s: pop(u, 1.5) });
      note(480, 370, '상대 시간으로 적어도 결과는 절대 시각이다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { terminal(140, 160, 520, 130, ['> deadline, ok := ctx.Deadline()', ['deadline = T0 + 300ms', 'var(--term)'], ['ok       = true', 'var(--term)']], E(u, 0.3, 1.8) * 3, { title: 'ctx 들여다보기' });
      note(700, 220, '마감 시각과', fade(u, 2.0)); note(700, 246, '설정 여부를 그대로 꺼낸다', fade(u, 2.1)); return; }
    // k6 — ctx 를 다음 홉으로
    const s = pop(u, 0.2); card(150, 200, 150, 64, { rx: 10, stroke: ACC, sw: 2.4, s }); tx(150, 196, 'ctx', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s }); sub(150, 220, '마감이 박혀 있다', s);
    fly(230, 200, 640, 200, seg(u, 0.6, 1.8), 'ctx (T0+300ms)', { mono: true, stay: true });
    note(480, 370, '그대로 넘기기만 하면 마감이 따라간다 · 홉마다 재설정 없음', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  // ---------- 2. 클라이언트 — 마감 설정 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { person(110, 200, 'Client', {}); server(760, 190, 'Server A', {});
      grow(160, 200, 690, 200, E(u, 0.3, 1.2), MUT, { plain: true, sw: 5 });
      mono(420, 180, 'grpc.NewClient(...)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      clock(420, 290, 32, 0, WARN, '');
      mono(420, 300, '∞', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.4) });
      note(420, 370, '아직 마감이 없다 · 이대로 부르면 무한정 기다린다', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD }); return; }
    budget(c, { quiet: true });
    if (k === 1) { pill(560, 370, 'defer cancel()  // 타이머 회수', GOOD, pop(u, 1.2), { mono: true, fs: 14 }); sub(560, 404, '빼먹으면 타이머가 샌다', fade(u, 1.8)); return; }
    if (k === 2) { card(560, 375, 420, 50, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.4) });
      mono(370, 381, 'WithDeadline(ctx, 12:00:05.000)', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) }); return; }
    if (k === 3) { const s = pop(u, 0.2); if (s > 0) { card(560, 372, 420, 56, { rx: 6, stroke: ACC, sw: 2, s });
        tx(370, 364, 'HEADERS  :path /order.v1.OrderService/CreateOrder', { 'font-size': 13.5, class: 'mono', opacity: s });
        tx(370, 386, 'grpc-timeout: 300m', { 'font-size': 14, class: 'mono', 'font-weight': 800, fill: ACC, opacity: s }); }
      dot([[132, RY(0) + 20], [132, RY(1)]], seg(u, 0.6, 1.4), ACC, 7); return; }
    if (k === 4) { card(560, 372, 420, 52, { rx: 10, stroke: BAD, sw: 2.4, s: pop(u, 1.0) });
      mono(370, 378, 'st.Code() == codes.DeadlineExceeded (4)', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); return; }
    if (k === 5) { terminal(350, 340, 430, 74, ['> 마감 초과 — 다운스트림이 느리다'], E(u, 0.3, 1.2), { title: 'log' });
      sub(160, 380, '느리다는 신호', fade(u, 1.4), { 'font-weight': 700, fill: WARN }); return; }
    pill(560, 372, 'resp.OrderId = "ord-1001"', GOOD, pop(u, 0.5), { mono: true, fs: 14.5 });
    sub(560, 405, '설정 → 전송 → 초과 감지, 세 단계가 전부다', fade(u, 1.4)); }

  // ---------- 3. 전파 — A → B → C ----------
  function s3(t, c) { const { k, u } = c; budget(c);
    const ch = c.beat.chain;
    const hop = (i, s) => { if (i + 1 >= ch.length) return; grow(30, RY(i) + 12, 30, RY(i + 1) - 12, s, ACC); };
    if (k === 0) { pill(560, 370, 'handler(ctx, req) · ctx 에 마감이 이미 있다', ACC, pop(u, 0.8), { fs: 14 }); return; }
    if (k === 1) { hop(1, E(u, 0.3, 0.9)); pill(560, 370, 's.inventory.CheckStock(ctx, …)', GOOD, pop(u, 1.0), { mono: true, fs: 14 }); return; }
    if (k === 2) { hop(1, 1); fly(DL + 20, RY(2), 560, 370, seg(u, 0.6, 1.6), 'return nil, err  // 4 그대로', { mono: true, fill: WARN, stay: true }); return; }
    if (k === 3) { cross(30, (RY(1) + RY(2)) / 2, 11, pop(u, 0.3));
      card(560, 372, 440, 52, { rx: 10, stroke: BAD, sw: 2, dash: '6 5', s: pop(u, 0.8) });
      mono(360, 378, 'CheckStock(context.Background(), …)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 4) { hop(1, 1); terminal(380, 340, 360, 74, ['> time.Until(dl)', ['15ms', 'var(--term)']], E(u, 0.4, 1.6) * 2, { title: 'Server B' }); return; }
    if (k === 5) { hop(1, 1); card(560, 372, 440, 52, { rx: 10, stroke: BAD, sw: 2.4, s: pop(u, 0.5) });
      mono(360, 378, 'remaining < 20ms → DeadlineExceeded', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.7) });
      sub(560, 410, '어차피 못 끝낼 호출은 시작하지 않는다', fade(u, 1.4)); return; }
    if (k === 6) { hop(1, 1); hop(2, E(u, 0.2, 0.8)); pill(560, 372, 'OrderId: "ord-1001"', GOOD, pop(u, 1.4), { mono: true, fs: 14.5 }); return; }
    ['300m', '220m', '140m', '70m'].forEach((h, i) => { const s = pop(u, 0.3 + i * 0.35); if (s > 0 && i < ch.length) pill(DL + 70, RY(i), h, ACC, s, { mono: true, fs: 14, fill: PANEL }); });
    tx(DL + 70, 280, 'grpc-timeout', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    note(560, 372, '실측(Python, 홉마다 80ms): 302 → 221 → 139ms', fade(u, 1.8), { 'text-anchor': 'middle', class: 'mono', 'font-size': 14.5 }); }

  // ---------- 4. 서버 C — 취소 감지 ----------
  function warehouses(n, scanned, cut, o) { o = o || {}; const x0 = 250, w = 64;
    tx(40, 372, 'for warehouse', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < n; i++) { const done = i < scanned, dead = cut != null && i >= cut;
      card(x0 + i * (w + 8) + w / 2, 368, w, 40, { rx: 6, text: dead ? '건너뜀' : done ? '✓' : '창고', fs: 13.5, fw: 700, stroke: dead ? GRID : done ? GOOD : INK, color: dead ? OFF : done ? GOOD : INK, op: dead ? 0.6 : 1 }); }
    if (cut != null) { const x = x0 + cut * (w + 8) - 4; el('line', { x1: x, y1: 340, x2: x, y2: 400, stroke: BAD, 'stroke-width': 3 }); mono(x, 414, 'ctx.Done()', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); } }
  function s4(t, c) { const { k, u } = c; budget(c, { quiet: true });
    if (k === 0) { pill(560, 370, 'Server C 도 같은 마감을 본다 · 남은 70ms', ACC, pop(u, 0.6), { fs: 14 }); return; }
    if (k === 1) { card(560, 372, 420, 52, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.4) });
      mono(370, 378, 'if err := ctx.Err(); err != nil {', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) }); sub(560, 410, '시작 전에 이미 초과면 아무 일도 하지 않는다', fade(u, 1.4)); return; }
    if (k === 2) { const sc = Math.floor(E(u, 0.2, 1.6) * 3); warehouses(8, sc, u > 1.7 ? 3 : null); return; }
    if (k === 3) {
      card(560, 372, 300, 60, { rx: 10, stroke: BAD, sw: 2.4, fill: PANEL, s: pop(u, 0.6) });
      mono(430, 368, 'FromContextError(err)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(430, 392, '→ codes.DeadlineExceeded (4)', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) }); return; }
    if (k === 4 || k === 5) { dbIcon(860, 370, null, { s: 0.6, stroke: k === 5 ? BAD : INK });
      const f = k === 4 ? E(u, 0.2, 2.4) * 0.7 : 0.7; el('rect', { x: 250, y: 356, width: 520, height: 24, rx: 5, fill: SOFT, stroke: GRID });
      el('rect', { x: 250, y: 356, width: 520 * f, height: 24, rx: 5, fill: k === 5 ? BAD : INFO, opacity: 0.8 });
      mono(260, 373, 's.db.CountStock(ctx, warehouse, id)', { 'font-size': 14, fill: PANEL, 'font-weight': 700 });
      if (k === 5) { cross(250 + 520 * 0.7, 368, 12, pop(u, 0.3)); mono(510, 410, 'driver: context deadline exceeded → codes.DeadlineExceeded', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); }
      return; }
    // k6 — 왜 중요한가: 실측
    terminal(40, 336, 880, 80, ['> 클라이언트: DEADLINE_EXCEEDED (4) · 317ms 에 떠남', ['  C: 하던 일을 끝낸 뒤에야 ctx.is_active() == False 를 봤다', 'var(--term)']], E(u, 0.3, 1.8) * 2, { title: '실측 · Python 체인, C 가 0.3s 걸리는 경우', lh: 24 }); }

  // ---------- 5. 정리 + Python ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { budget(c, { quiet: true });
      ['① 엣지에서 마감을 한 번 정한다', '② 모든 홉이 받은 ctx 를 그대로 넘긴다', '③ 각 서버가 취소를 감지해 멈춘다'].forEach((s, i) => { const y = 352 + i * 24, o = fade(u, 0.4 + i * 0.5);
        check(258, y - 5, 7, o); tx(274, y, s, { 'font-size': 15, 'font-weight': 700, opacity: o }); }); return; }
    if (k === 1) { const x0 = 220, S = 1.0;
      tx(40, 90, 'deadline', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); tx(40, 190, 'per-hop T', { 'font-size': 16, 'font-weight': 800, fill: BAD });
      el('rect', { x: x0, y: 72, width: 300 * S * E(u, 0.2, 0.8), height: 30, rx: 5, fill: GOOD, opacity: 0.85 }); mono(x0 + 310, 93, '300ms 하나', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      for (let i = 0; i < 3; i++) { const g = E(u, 0.6 + i * 0.5, 1.0 + i * 0.5); el('rect', { x: x0 + i * 230, y: 172, width: 224 * g, height: 30, rx: 5, fill: BAD, opacity: 0.6 + 0.1 * i }); if (g > 0.6) tx(x0 + i * 230 + 12, 193, `홉 ${i + 1} · T`, { 'font-size': 14, 'font-weight': 700, fill: PANEL }); }
      mono(x0 + 690, 225, 'N홉 × T', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      note(480, 320, '홉이 늘수록 per-hop 예산은 불어나고 deadline 은 그대로다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { card(330, 180, 520, 170, { rx: 12, stroke: GRID, sw: 1.5, fill: SOFT, s: pop(u, 0.2) });
      ['stub.CreateOrder(', '    CreateOrderRequest(item_id="sku-42"),', '    timeout=0.3,   # 300ms'].forEach((l, i) => mono(90, 150 + i * 30, l, { 'font-size': 15.5, fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 800 : 400, opacity: fade(u, 0.4 + i * 0.3) }));
      grow(600, 210, 680, 210, E(u, 1.4, 1.8), ACC);
      card(790, 210, 200, 60, { rx: 10, text: 'grpc-timeout: 300m', fs: 14.5, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.8) });
      sub(790, 262, '실측 헤더 값 그대로', fade(u, 2.2)); return; }
    if (k === 3) { terminal(90, 90, 780, 150, ['>>> stub.CreateOrder(req, timeout=0.3)', ['grpc.RpcError: DEADLINE_EXCEEDED', '#f87171'], ['e.code().value  = (4, "deadline exceeded")', 'var(--term)'], ['e.details()     = "Deadline Exceeded"', 'var(--term)']], E(u, 0.3, 2.0) * 4, { title: 'Python 클라이언트 · 실측' });
      note(480, 300, 'Go 의 codes.DeadlineExceeded 와 같은 4 로 분기한다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 4 || k === 5) { const lines = k === 4 ? ['>>> context.time_remaining()   # 서버마다', ['A: 0.302   B: 0.221   C: 0.139', 'var(--term)'], ['< 0.02 이면 context.abort(DEADLINE_EXCEEDED)', 'var(--term)']]
        : ['>>> stub.CheckStock(req, timeout=context.time_remaining())', ['전파함    → C 남은 0.139s', 'var(--term)'], ['timeout 빼먹음 → C 남은 시간 무한 (마감 끊김)', '#f87171']];
      terminal(90, 90, 780, 130, lines, E(u, 0.3, 2.0) * 3, { title: k === 4 ? '남은 예산 · 실측' : '마감 이어 붙이기 · 실측' });
      note(480, 280, k === 4 ? 'Go 의 ctx.Deadline() 자리에 time_remaining()' : 'Python 은 남은 시간을 손으로 timeout= 에 넘긴다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    budget(c, { quiet: true }); banner(560, 372, '엣지에서 한 번 → 전 홉 전파 → 취소 감지', pop(u, 0.4)); }

  const quiz = [
    { q: 'Client가 마감을 T0+300ms로 잡고 A가 80ms를 썼다. B가 받는 남은 시간은 얼마인가?',
      o: ['300ms', '약 220ms', '약 380ms'], a: 1,
      why: '마감 시각 하나를 공유하므로 남은 시간만 줄어든다. 실측에서도 302ms에서 221ms로 줄었다.' },
    { q: 'context.WithTimeout을 쓴 뒤 defer cancel()을 빼먹으면 생기는 일은 무엇인가?',
      o: ['마감이 서버로 전송되지 않는다', '호출이 즉시 Canceled로 실패한다', '타이머 자원이 회수되지 않고 샌다'], a: 2,
      why: 'cancel은 타이머와 context 자원을 돌려주는 함수다. 부르지 않으면 마감이 될 때까지 자원이 남는다.' },
    { q: '서버 A가 B를 부를 때 context.Background()를 넘기면 B의 마감은 어떻게 되나?',
      o: ['마감이 사라져 B가 무한정 돌 수 있다', 'A와 같은 마감을 그대로 받는다', 'B가 300ms 마감을 새로 받는다'], a: 0,
      why: '새 Background에는 마감이 없다. 실측에서도 전파를 끊자 C의 남은 시간이 사실상 무한이 됐다.' },
    { q: '마감이 지난 뒤 서버가 ctx.Done()을 확인하지 않고 일을 계속하면 무엇이 문제인가?',
      o: ['클라이언트가 응답을 두 번 받는다', '이미 떠난 클라이언트를 위해 DB와 CPU를 태운다', '마감이 자동으로 늘어난다'], a: 1,
      why: '클라이언트는 이미 DeadlineExceeded를 받고 떠났다. 남은 작업은 아무도 쓰지 않는 결과를 만든다.' },
    { q: 'Python 서버가 다음 홉에 마감을 이어 주려면 무엇을 넘기나?',
      o: ['timeout=0.3을 다시 넘긴다', '아무것도 안 넘겨도 자동으로 이어진다', 'timeout=context.time_remaining()을 넘긴다'], a: 2,
      why: 'Python은 남은 시간을 손으로 timeout에 넣어야 마감이 이어진다. 빼먹으면 다음 홉의 마감이 끊긴다.' },
  ];

  const summary = [
    '홉마다 timeout을 새로 재면 세 홉에 5초씩 최악 15초가 걸린다.',
    'deadline은 절대 시각 하나라 홉을 지날수록 남은 시간만 줄어든다. 실측 302, 221, 139ms였다.',
    '받은 ctx를 그대로 넘겨야 마감이 이어진다. Background()를 새로 만들면 끊긴다.',
    '서버는 ctx.Err()나 ctx.Done()으로 초과를 알아채고 남은 일을 버린다.',
  ];
  const review = [
    { q: '사용자 요청 마감은 1초인데 맨 끝 서비스 로그에 3초짜리 쿼리가 자주 찍힌다. 먼저 의심할 것은?',
      o: ['중간 서버가 새 context.Background()로 다음 홉을 부른다', '클라이언트가 grpc-timeout을 너무 짧게 보낸다', 'DeadlineExceeded 코드 번호가 서버마다 다르다'], a: 0,
      why: '마감이 끊기면 하위 서비스는 상위가 포기한 뒤에도 계속 돈다. 받은 ctx를 그대로 넘기면 끝 서비스도 같은 마감을 본다.' },
    { q: 'B에 남은 시간이 15ms인데 C 호출은 보통 80ms가 걸린다. B가 할 일은?',
      o: ['C를 부르고 응답을 끝까지 기다린다', 'C를 부르지 않고 바로 DeadlineExceeded를 돌려준다', '마감을 300ms로 다시 늘려서 부른다'], a: 1,
      why: '어차피 마감 안에 못 끝낼 호출은 시작하지 않는 편이 낫다. 페이지 코드는 20ms 미만이면 미리 포기한다.' },
    { q: '세 홉에 각각 5초 timeout을 걸었더니 사용자 응답이 15초까지 늘어졌다. 어떻게 바꾸나?',
      o: ['각 홉 timeout을 10초로 늘린다', '재시도 횟수를 늘린다', '엣지에서 마감 하나를 정하고 ctx로 전파한다'], a: 2,
      why: 'per-hop timeout은 홉 수만큼 예산이 쌓인다. 마감 시각 하나를 공유하면 전체가 그 안에서 끝난다.' },
  ];

  R.page({ title: '마감 시각 전파', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
