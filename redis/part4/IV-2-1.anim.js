/* IV-2-1 Stream 깊이 — XADD · XREAD · Consumer Group · XACK · XCLAIM (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, pill, grow, fly, dot, cross, check, clock, terminal, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const T = (x, y, s, a) => tx(x, y, s, Object.assign({ 'font-size': 15 }, a || {}));
  const line = (x1, y1, x2, y2, col, o) => { o = o || {}; el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); };
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  // ID 를 밀리초(검정) + -시퀀스(초록)으로
  function idSpan(x, y, id, o) { o = o || {}; const [ms, sq] = String(id).split('-');
    return spans(x, y, [[ms, { fill: o.dim ? OFF : INK, 'font-weight': 700 }], ['-' + sq, { fill: o.dim ? OFF : (o.seqCol || ACC), 'font-weight': 800 }]], { 'font-size': o.fs || 14.5, 'text-anchor': o.anchor || 'middle', opacity: o.op ?? 1 }); }
  // 엔트리 카드: ID + 필드 줄
  function entry(cx, cy, e, o) { o = o || {}; const f = Object.entries(e.fields || {}), w = o.w || 200, h = 34 + f.length * 20;
    card(cx, cy, w, h, { rx: 8, stroke: o.stroke || ACC, sw: o.sw || 2, fill: o.fill || PANEL, s: o.s, op: o.op, dash: o.dash });
    if ((o.op ?? 1) < 0.02 || (o.s ?? 1) < 0.02) return;
    const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    const ms = R.el('text', { x: 0, y: -h / 2 + 22, 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono', style: 'white-space:pre' }, g);
    const [a, b] = e.id.split('-'); [[a, INK], ['-' + b, o.seqCol || ACC]].forEach(([s, col]) => { const ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan'); ts.setAttribute('fill', col); ts.setAttribute('font-weight', 700); ts.textContent = s; ms.appendChild(ts); });
    f.forEach(([k, v], i) => mono(0, -h / 2 + 44 + i * 20, k + ': ' + v, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g)); }
  function cmd(s, u, a, b) { const n = Math.round(s.length * E(u, a ?? 0.1, b ?? 0.8)); mono(40, 40, s.slice(0, n), { 'font-size': 16, 'font-weight': 700, fill: INK });
    if (n < s.length) el('rect', { x: 40 + tw(s.slice(0, n), 16) + 2, y: 26, width: 9, height: 18, fill: ACC }); }
  const reply = (x, y, s, op, col) => mono(x, y, s, { 'font-size': 15, 'font-weight': 700, fill: col || ACC, opacity: op });

  // ───────── 1. XADD ─────────
  function s1(t, c) { const { k, u } = c, rec = c.beat.viz.recent;
    if (k === 0) { cmd('XADD orders * type new order_id 42', u);
      entry(lerp(800, 300, E(u, 0.9, 1.5)), 190, rec[0], { op: fade(u, 0.9, 0.3) });
      grow(222, 50, 290, 150, E(u, 1.4, 1.8), ACC); mono(212, 66, '*', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      reply(40, 300, '"1715000000-0"', fade(u, 1.8)); T(40, 330, 'Redis 가 만든 ID 가 그대로 돌아온다', { fill: MUT, 'font-size': 14.5, opacity: fade(u, 2.0) });
      T(270, 252, '밀리초', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); T(352, 252, '시퀀스', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 2.3) });
      return; }
    if (k === 1) { cmd('XADD orders * x 1   (같은 1ms 안에 3번)', u, 0.1, 0.6);
      rec.forEach((e, i) => { const a = 0.6 + i * 0.5; entry(170 + i * 220, 180, e, { s: pop(u, a) });
        if (u > a + 0.3) { el('rect', { x: 170 + i * 220 + 32, y: 160, width: 24, height: 20, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2 }); } });
      ['0', '1', '2'].forEach((s, i) => mono(170 + i * 220 + 44, 262, s, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9 + i * 0.5) }));
      T(480, 320, '밀리초는 같고, 시퀀스가 0 → 1 → 2 로 오른다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
      return; }
    if (k === 2) { cmd('XADD orders 1715000002-0 x 1', u, 0.1, 0.6);
      entry(200, 170, rec[0], { stroke: GRID }); sub(200, 228, '지금 맨 끝', 1);
      entry(lerp(700, 470, E(u, 0.7, 1.2)), 170, rec[1], { op: fade(u, 0.7, 0.3) });
      if (u > 1.2) check(590, 152, 10, pop(u, 1.2));
      const bad = fade(u, 1.5);
      mono(40, 300, '> XADD orders 1715000001-0 x 1', { 'font-size': 15, fill: INK, opacity: bad });
      mono(40, 330, '(error) ERR The ID specified in XADD is equal or smaller', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
      mono(40, 352, '        than the target stream top item', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
      if (u > 1.9) cross(760, 320, 12, pop(u, 1.9));
      return; }
    if (k === 3) { // MAXLEN / MINID
      const old = 14, cut = Math.round(lerp(0, 5, E(u, 0.6, 1.6)));
      mono(40, 40, "XADD orders MAXLEN ~ 10000 * x 1", { 'font-size': 16, 'font-weight': 700 });
      for (let i = 0; i < old; i++) { const x = 60 + i * 30, gone = i < cut, dy = gone ? E(u, 0.6 + i * 0.2, 1.1 + i * 0.2) * 70 : 0;
        el('rect', { x, y: 150 + dy, width: 24, height: 44, rx: 4, fill: gone ? OFF : ACCBG, stroke: gone ? OFF : ACC, 'stroke-width': 1.5, opacity: gone ? 1 - seg(u, 1.0 + i * 0.2, 1.6 + i * 0.2) * 0.8 : 1 }); }
      rec.forEach((e, i) => { const cx = 520 + i * 140; card(cx, 172, 130, 44, { rx: 6, stroke: ACC, s: pop(u, 0.3 + i * 0.15) }); idSpan(cx, 178, e.id, { fs: 13.5, op: fade(u, 0.4 + i * 0.15) }); });
      el('line', { x1: 60 + 5 * 30 - 4, y1: 120, x2: 60 + 5 * 30 - 4, y2: 220, stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
      mono(60 + 5 * 30 + 4, 120, 'maxlen=10000', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      T(60, 300, '~ (기본) 근사: 노드 단위로 잘라 빠르다', { 'font-size': 15, opacity: fade(u, 1.8) });
      T(60, 330, 'approximate=False: 정확히 맞춰 느리다', { 'font-size': 15, opacity: fade(u, 2.0) });
      mono(60, 370, 'minid="1715000000-0" → 그보다 작은 ID 전부 제거', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 2.3) });
      return; }
    if (k === 4) { mono(40, 40, 'XADD events * type click user_id 42 page /home ts 1715000000', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.1) });
      const e = rec[0], rows = Object.entries(e.fields), x0 = 300, s = pop(u, 0.3);
      card(480, 220, 380, 50 + rows.length * 44, { rx: 10, stroke: ACC, s });
      idSpan(480, 132, e.id, { fs: 16, op: fade(u, 0.4) });
      rows.forEach(([k2, v], i) => { const y = 170 + i * 44, a = fade(u, 0.6 + i * 0.3);
        el('rect', { x: x0 + 20, y: y - 18, width: 340, height: 36, rx: 6, fill: SOFT, opacity: a });
        mono(x0 + 36, y + 5, k2, { 'font-size': 15, 'font-weight': 700, opacity: a }); mono(x0 + 344, y + 5, v, { 'font-size': 15, 'text-anchor': 'end', fill: ACC, opacity: a }); });
      T(720, 220, '필드 4개', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); T(720, 246, '= 엔트리 1건', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) });
      T(40, 390, 'Hash 처럼 field-value 쌍, 스키마는 없다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) });
      return; }
    // k5: XRANGE / XREVRANGE / XLEN
    rec.forEach((e, i) => entry(200 + i * 280, 180, e, { w: 240, s: pop(u, 0.1 + i * 0.12) }));
    const fw = E(u, 0.6, 1.4), bw = E(u, 1.5, 2.2);
    grow(90, 270, lerp(90, 880, 1), 270, fw, INFO); mono(90, 296, 'XRANGE orders - +   오래된 순', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.6) });
    grow(880, 330, 90, 330, bw, WARN); mono(880, 356, 'XREVRANGE orders + -   최신 순', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.5) });
    reply(800, 70, 'XLEN orders → 3', fade(u, 2.3), INK);
  }

  // ───────── 2. XREAD 단일 consumer ─────────
  const CX = (i) => 150 + i * 70, CY = 110;
  function tape10(name, y, n, o) { o = o || {}; mono(130, y + 5, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
    for (let i = 0; i < n; i++) { el('rect', { x: CX(i), y: y - 20, width: 62, height: 40, rx: 5, fill: o.hot && o.hot(i) ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 1.8, opacity: o.op ? o.op(i) : 1 });
      mono(CX(i) + 31, y + 5, 'e' + (i + 1), { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, opacity: o.op ? o.op(i) : 1 }); } }
  const caret = (x, y, col, label, op) => { el('path', { d: `M${x - 8},${y + 12} L${x + 8},${y + 12} L${x},${y} Z`, fill: col, opacity: op ?? 1 }); if (label) mono(x, y + 32, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: op ?? 1 }); };
  function wbox(cx, cy, name, val, note, o) { o = o || {}; card(cx, cy, o.w || 240, 84, { rx: 12, stroke: o.col || INFO, sw: 2, s: o.s });
    T(cx - (o.w || 240) / 2 + 16, cy - 12, name, { 'font-size': 16, 'font-weight': 800, fill: o.col || INFO, opacity: o.s ?? 1 });
    mono(cx + (o.w || 240) / 2 - 16, cy - 12, val, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: o.s ?? 1 });
    if (note) T(cx - (o.w || 240) / 2 + 16, cy + 22, note, { 'font-size': 13.5, fill: MUT, opacity: o.s ?? 1 }); }
  function s2(t, c) { const { k, u } = c, v = c.beat.viz, p = (c.prev && c.prev.viz) || v, msgs = Math.round(tween(p.messages, v.messages, u));
    if (k === 0) { cmd('XREAD COUNT 10 STREAMS events 0', u, 0.1, 0.5); tape10('events', CY, 10);
      caret(CX(0) - 4, CY + 26, INFO, '"0"', 1);
      for (let i = 0; i < 10; i++) dot([[CX(i) + 31, CY + 20], [480, 290]], seg(u, 0.6 + i * 0.12, 1.1 + i * 0.12), INFO, 5);
      wbox(480, 330, 'W1', Math.round(lerp(0, 10, E(u, 0.6, 2.0))) + '건', v.rate);
      return; }
    if (k === 1) { cmd('XREAD COUNT 10 BLOCK 5000 STREAMS events $', u, 0.1, 0.6); tape10('events', CY, 10, { op: () => 0.45 });
      caret(CX(10) + 4, CY + 26, WARN, '"$"', fade(u, 0.5));
      clock(780, 300, 30, E(u, 0.8, 2.4), WARN, 'block 5000ms');
      wbox(400, 330, 'W1', u > 2.4 ? '(nil)' : '…', v.rate, { col: WARN });
      T(CX(0), 190, '과거 10건은 안 본다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.7) });
      return; }
    if (k === 2) { cmd('XREAD BLOCK 0 STREAMS events $   (while True)', u, 0.1, 0.6); tape10('events', CY, 10, { op: (i) => (i < 9 ? 0.45 : fade(u, 1.0)) , hot: (i) => i === 9 });
      const wake = u > 1.4; dot([[CX(9) + 31, CY + 20], [480, 290]], seg(u, 1.1, 1.6), ACC, 7);
      wbox(480, 330, 'W1', wake ? '깨어남' : '대기 ∞', v.rate, { col: wake ? GOOD : WARN });
      T(760, 330, '폴링 없음', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) { tape10('events', CY, 10); const pos = Math.min(9, Math.floor(lerp(0, 10, E(u, 0.3, 2.3))));
      caret(CX(pos) + 31, CY + 26, INFO, null, 1);
      for (let i = 0; i <= pos; i++) check(CX(i) + 31, CY - 34, 7);
      card(480, 270, 360, 50, { rx: 10, stroke: INFO, sw: 2, fill: INFOBG });
      mono(480, 276, 'last_id = e' + (pos + 1) + ' 의 ID', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: INFO });
      T(480, 340, '다음 호출은 그 다음부터 → 중복 없음', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.0) });
      T(480, 372, '커서는 클라이언트 메모리에 있다 — 죽으면 잊는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, opacity: fade(u, 2.0) });
      return; }
    if (k === 4) { cmd('XREAD BLOCK 0 STREAMS orders payments $ $', u, 0.1, 0.6);
      tape10('orders', 110, 6, { op: (i) => (i < 5 ? 0.5 : fade(u, 0.9)), hot: (i) => i === 5 }); tape10('payments', 180, 6, { op: (i) => (i < 5 ? 0.5 : fade(u, 1.3)), hot: (i) => i === 5 });
      dot([[CX(5) + 31, 130], [700, 300]], seg(u, 1.0, 1.6), ACC, 6); dot([[CX(5) + 31, 200], [700, 300]], seg(u, 1.4, 2.0), ACC, 6);
      wbox(700, 330, 'W1', msgs + '건', v.rate);
      T(40, 300, '응답에 스트림 이름이 같이 온다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
      return; }
    // k5: 워커 3명 = 3배 중복
    tape10('events', CY, 5, { hot: (i) => i === 4 });
    ['W1', 'W2', 'W3'].forEach((w, i) => { const cx = 200 + i * 280;
      wbox(cx, 320, w, '5건', i === 0 ? v.rate : '같은 5건', { w: 220, col: i ? BAD : INFO, s: pop(u, 0.2 + i * 0.25) });
      for (let j = 0; j < 5; j++) dot([[CX(j) + 31, CY + 20], [cx, 278]], seg(u, 0.7 + j * 0.15, 1.3 + j * 0.15), i ? BAD : INFO, 4.5); });
    pill(480, 210, '분담이 아니라 복제 → 처리 3배 중복', BAD, pop(u, 1.9), { fs: 15 });
  }

  // ───────── 3. Consumer Group ─────────
  const WX = [230, 480, 730];
  function cons(c, o) { o = o || {}; const v = c.beat.viz.consumers, p = ((c.prev && c.prev.viz.consumers) || v);
    v.forEach((w, i) => { const q = p[i], idle = w.processed === 0 && w.pending === 0 && !(o.live && o.live(i)), s = o.pop ? o.pop(i) : 1;
      const pr = tween(q.processed, w.processed, c.u), pe = tween(q.pending, w.pending, c.u);
      card(WX[i], 330, 210, 96, { rx: 12, stroke: idle ? GRID : INFO, sw: 2, dash: idle ? '6 5' : null, s });
      T(WX[i] - 90, 306, w.name, { 'font-size': 17, 'font-weight': 800, fill: idle ? OFF : INFO, opacity: s });
      mono(WX[i] + 90, 306, 'PEL ' + Math.round(pe), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: pe > 0.5 ? WARN : MUT, opacity: s });
      T(WX[i] - 90, 340, '처리', { 'font-size': 13.5, fill: MUT, opacity: s }); mono(WX[i] + 90, 340, fmt(pr), { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', opacity: s });
      const pc = Math.min(10, Math.round(pe)); for (let j = 0; j < pc; j++) el('rect', { x: WX[i] - 90 + j * 18, y: 356, width: 14, height: 10, rx: 2, fill: o.redLast && j === pc - 1 ? BAD : WARN, opacity: s }); }); }
  function grp(pos, o) { o = o || {}; card(110, 210, 150, 56, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2, s: o.s });
    mono(110, 206, 'workers', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: o.s ?? 1 }); sub(110, 226, 'group (서버)', o.s ?? 1);
    const x = CX(0) - 4 + pos * 70; el('path', { d: `M185,200 Q${(185 + x) / 2},150 ${x},${CY + 30}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: o.s ?? 1 });
    caret(x, CY + 24, ACC, null, o.s ?? 1); }
  function s3(t, c) { const { k, u } = c;
    if (k === 1) { // MKSTREAM
      const ok = u > 1.5;
      mono(40, 40, 'XGROUP CREATE events workers 0', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(40, 68, "(error) ERR The XGROUP subcommand requires the key to exist", { 'font-size': 14, fill: BAD, opacity: fade(u, 0.5) });
      mono(40, 108, 'XGROUP CREATE events workers 0 MKSTREAM', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.1) });
      mono(40, 136, 'OK', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(130, 215, 'events', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: ok ? INK : OFF });
      el('rect', { x: 150, y: 190, width: 690, height: 50, rx: 8, fill: ok ? SOFT : 'none', stroke: ok ? ACC : OFF, 'stroke-width': 2, 'stroke-dasharray': ok ? null : '6 6' });
      T(495, 220, ok ? '빈 스트림 · XLEN 0 · group workers 붙음' : '키가 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: ok ? ACC : MUT, 'font-weight': 700 });
      if (!ok) cross(870, 215, 11, pop(u, 0.5));
      mono(40, 300, 'r.xgroup_create("events", "workers", id="0", mkstream=True)', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 2.0) });
      return; }
    const v = c.beat.viz;
    if (k === 0) { tape10('events', CY, 10); grp(0, { s: pop(u, 0.3) });
      mono(300, 40, 'XGROUP CREATE events workers 0', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      T(300, 200, '읽은 위치를 서버가 기억한다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      cons(c, { pop: (i) => fade(u, 1.4 + i * 0.2) }); return; }
    if (k === 2) { tape10('events', CY, 10, { hot: (i) => u > 0.6 + i * 0.1 }); grp(lerp(0, 10, E(u, 0.6, 1.8)));
      mono(300, 40, 'XREADGROUP GROUP workers W1 COUNT 10 STREAMS events >', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.1) });
      for (let i = 0; i < 10; i++) dot([[CX(i) + 31, CY + 20], [WX[0], 282]], seg(u, 0.6 + i * 0.1, 1.2 + i * 0.1), WARN, 5);
      cons(c, { live: (i) => i === 0 }); return; }
    tape10('events', CY, 10, { hot: () => true }); grp(10);
    if (k === 3) { el('path', { d: `M${CX(0)},${CY - 30} V${CY - 38} H${CX(9) + 62} V${CY - 30}`, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      mono(CX(5), CY - 46, 'COUNT 10', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      clock(900, 210, 26, E(u, 0.9, 2.4), WARN, 'BLOCK 5000');
      cons(c, { live: (i) => i === 0 }); return; }
    if (k === 4) { cons(c, { live: (i) => i === 0, redLast: true });
      pill(WX[0] + 30, 240, 'XACK events workers <id> × 9', GOOD, pop(u, 0.4), { mono: true, fs: 13.5 });
      if (u > 1.4) { cross(WX[0] + 130, 361, 7, pop(u, 1.4)); T(WX[0] + 145, 400, '예외 1건 → ack 안 함', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); }
      return; }
    if (k === 5) { // "0" 으로 내 PEL 부터
      cons(c, { live: (i) => i === 0, redLast: true });
      const s0 = u < 1.0;
      if (u < 0.9) cross(WX[0] + 80, 300, 10, pop(u, 0.2));
      pill(WX[0] + 140, 240, s0 ? '재시작' : 'STREAMS events 0', s0 ? WARN : INFO, 1, { mono: !s0, fs: 13.5 });
      if (u > 1.0) { mono(WX[1] + 20, 210, '→ 내 PEL 1건만 다시 온다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.1) }); check(WX[0] + 75, 361, 7, pop(u, 1.6)); }
      if (u > 1.9) mono(WX[1] + 20, 240, '빈 응답 → 이제 ">" 로', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
      return; }
    if (k === 6) { cons(c, { pop: (i) => (i === 0 ? 1 : pop(u, 0.2 + i * 0.3)), live: () => true });
      for (let j = 0; j < 9; j++) dot([[CX(j) + 31, CY + 20], [WX[j % 3], 282]], ((t * 0.6 + j / 9) % 1), INFO, 4.5);
      mono(480, 200, 'python worker.py W2 &  /  W3 &', { 'text-anchor': 'middle', 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.5) });
      return; }
    // k7: 먼저 요청한 순 + 다른 group
    cons(c, { live: () => true });
    [0, 1, 2, 0].forEach((w, j) => { const a = 0.3 + j * 0.45; dot([[CX(j) + 31, CY + 20], [WX[w], 282]], seg(u, a, a + 0.45), INFO, 7);
      if (u > a + 0.45) mono(WX[w] - 60 + (j === 3 ? 30 : 0), 270, 'e' + (j + 1), { 'font-size': 14, 'font-weight': 700, fill: INFO }); });
    card(890, 210, 120, 56, { rx: 10, stroke: WARN, fill: WARNBG, sw: 2, s: pop(u, 1.9) });
    mono(890, 206, 'analytics', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); sub(890, 226, '같은 e1~e4 도', fade(u, 2.0));
  }

  // ───────── 4. XACK · PEL ─────────
  const PT = { x: 500, w: 430 };
  function pelTable(rows, o) { o = o || {}; const { x, w } = PT, y0 = o.y || 70;
    el('rect', { x, y: y0, width: w, height: 40 + Math.max(1, rows.length) * 40, rx: 10, fill: PANEL, stroke: o.stroke || WARN, 'stroke-width': 2 });
    T(x + 14, y0 + 24, o.title || 'PEL (workers)', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    rows.forEach((r, i) => { const y = y0 + 40 + i * 40, op = r.op ?? 1;
      if (r.hot) el('rect', { x: x + 6, y: y + 2, width: w - 12, height: 36, rx: 6, fill: r.hot, opacity: op });
      mono(x + 18, y + 25, r.id, { 'font-size': 14.5, 'font-weight': 700, fill: r.gone ? OFF : INK, opacity: op, 'text-decoration': r.gone ? 'line-through' : null });
      if (r.who) mono(x + w - 18, y + 25, r.who, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: r.whoCol || INFO, opacity: op }); }); }
  function worker(cx, cy, name, state, col) { card(cx, cy, 170, 70, { rx: 12, stroke: col || INFO, sw: 2 });
    T(cx - 70, cy - 6, name, { 'font-size': 16, 'font-weight': 800, fill: col || INFO }); T(cx - 70, cy + 20, state, { 'font-size': 14, fill: col || MUT }); }
  function s4(t, c) { const { k, u } = c, ID = '1715000000-0';
    if (k <= 2) { const entryOp = 1;
      card(140, 110, 180, 50, { rx: 8, stroke: ACC, op: entryOp }); idSpan(140, 116, ID, { fs: 14 });
      sub(140, 154, 'events 의 엔트리', 1);
      if (k === 0) { dot([[230, 110], [300, 260]], seg(u, 0.2, 0.8), WARN, 7);
        const spin = (t * 4) % (Math.PI * 2); worker(300, 270, 'W1', u > 1.2 ? 'handle(data) …' : 'XREADGROUP', INFO);
        if (u > 1.2) el('circle', { cx: 360, cy: 264, r: 9, fill: 'none', stroke: INFO, 'stroke-width': 3, 'stroke-dasharray': '14 40', transform: `rotate(${spin * 57} 360 264)` });
        pelTable([{ id: ID, who: 'W1', hot: WARNBG, op: fade(u, 0.6) }]);
        T(PT.x, 200, '받는 순간 이미 PEL 에 있다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.9) });
        return; }
      if (k === 1) { const gone = u > 1.0; worker(300, 270, 'W1', gone ? '완료' : 'handle 성공', GOOD);
        pill(300, 350, 'XACK events workers ' + ID, GOOD, pop(u, 0.3), { mono: true, fs: 13.5 });
        pelTable(gone ? [{ id: ID, who: 'W1', gone: true, op: 1 - seg(u, 1.4, 2.0) }] : [{ id: ID, who: 'W1', hot: WARNBG }]);
        if (u > 2.0) T(PT.x + 20, 135, '(비었다)', { 'font-size': 14.5, fill: MUT });
        return; }
      // k2 예외
      worker(300, 270, 'W1', '예외 발생', BAD); cross(380, 250, 9, pop(u, 0.3));
      pill(300, 350, 'XACK 없음', BAD, pop(u, 0.7), { fs: 14 });
      const pul = 0.5 + 0.5 * Math.sin(t * 5);
      pelTable([{ id: ID, who: 'W1', hot: WARNBG, op: 1 }], { stroke: u > 1.0 ? WARN : WARN });
      el('rect', { x: PT.x - 4, y: 66, width: PT.w + 8, height: 88, rx: 12, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: u > 1.0 ? pul * 0.6 : 0 });
      T(PT.x, 200, '그대로 남아 재시도를 기다린다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
      return; }
    if (k === 3) { // XPENDING 요약
      mono(40, 40, 'XPENDING events workers', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      card(250, 200, 380, 200, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 0.3) });
      mono(90, 140, 'pending', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5) }); mono(410, 140, String(Math.round(lerp(0, 5, E(u, 0.5, 1.2)))), { 'font-size': 22, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 0.5) });
      mono(90, 190, 'min', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) }); idSpan(410, 190, '1715000000-0', { anchor: 'end', op: fade(u, 0.8) });
      mono(90, 230, 'max', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) }); idSpan(410, 230, '1715000100-0', { anchor: 'end', op: fade(u, 1.0) });
      mono(90, 274, 'consumers', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) });
      [['W1', 2], ['W2', 3]].forEach(([w, n], i) => { const y = 150 + i * 90, bw = E(u, 1.4 + i * 0.3, 2.2 + i * 0.3) * n * 70;
        T(530, y + 6, w, { 'font-size': 17, 'font-weight': 800, fill: INFO });
        el('rect', { x: 580, y: y - 14, width: bw, height: 28, rx: 5, fill: WARN, opacity: 0.85 });
        mono(590 + n * 70, y + 6, n + '건', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0 + i * 0.3) }); });
      T(530, 360, '계속 늘면 실패 중이거나 워커가 죽었다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.4) });
      return; }
    if (k === 4) { // XPENDING RANGE 상세
      mono(40, 40, 'XPENDING events workers - + 5', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      const cols = [['id', 60], ['consumer', 300], ['idle time', 470], ['deliveries', 680]], hi = Math.floor(seg(u, 0.6, 2.4) * 3.999);
      cols.forEach(([h, x], i) => { const on = u > 0.6 && i === hi + 1; if (on) el('rect', { x: x - 10, y: 70, width: i === 3 ? 230 : 190, height: 290, rx: 8, fill: WARNBG });
        T(x, 96, h, { 'font-size': 15, 'font-weight': 800, fill: on ? WARN : MUT }); });
      const ids = ['1715000000-0', '…', '…', '…', '1715000100-0'], who = ['W1', 'W1', 'W2', 'W2', 'W2'], idle = [0.95, 0.8, 0.6, 0.45, 0.2], dl = [0.3, 0.3, 0.9, 0.3, 0.3];
      ids.forEach((id, i) => { const y = 136 + i * 44, a = fade(u, 0.2 + i * 0.08);
        mono(60, y, id, { 'font-size': 14.5, fill: INK, 'font-weight': 700, opacity: a }); mono(300, y, who[i], { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: a });
        el('rect', { x: 470, y: y - 13, width: 170 * idle[i], height: 16, rx: 3, fill: OFF, opacity: a });
        el('rect', { x: 680, y: y - 13, width: 190 * dl[i], height: 16, rx: 3, fill: i === 2 ? BAD : OFF, opacity: a }); });
      T(680, 390, '배달 횟수만 큰 줄 → 독약 메시지 의심', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) });
      sub(470, 390, '누가 · 얼마나 · 몇 번', fade(u, 1.0), { 'text-anchor': 'start' });
      return; }
    if (k === 5) { // crash → 다른 consumer 가 회수
      worker(170, 140, 'W1', u > 0.5 ? 'crash' : '처리 중', u > 0.5 ? BAD : INFO); if (u > 0.5) cross(230, 120, 10, pop(u, 0.5));
      worker(170, 320, 'W2', '살아 있음', GOOD);
      const moved = u > 1.8;
      pelTable([{ id: ID, who: moved ? 'W2' : 'W1', whoCol: moved ? GOOD : BAD, hot: moved ? GOODBG : WARNBG }], { y: 160 });
      T(PT.x, 290, '메시지는 PEL 에 남아 있다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
      grow(255, 320, PT.x - 6, 220, E(u, 1.2, 1.8), GOOD);
      mono(PT.x, 340, 'XREADGROUP … 0  또는  XCLAIM', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) });
      return; }
    // k6: 멱등성
    T(40, 46, 'at-least-once: 같은 메시지가 두 번 올 수 있다', { 'font-size': 17, 'font-weight': 800 });
    ['1번째 배달', '2번째 배달'].forEach((s, i) => { const y = 140 + i * 110, a = 0.3 + i * 0.9;
      fly(60, y, 330, y, seg(u, a, a + 0.5), 'order_id 42', { stay: true, mono: true, fill: i ? WARN : ACC }); sub(120, y + 36, s, fade(u, a));
      if (u > a + 0.5) { grow(400, y, 540, y, E(u, a + 0.5, a + 0.8), i ? WARN : GOOD);
        T(560, y + 6, i ? '이미 처리됨 → 건너뜀' : '처리 + 기록', { 'font-size': 16, 'font-weight': 700, fill: i ? WARN : GOOD, opacity: fade(u, a + 0.7) }); } });
    card(480, 370, 420, 50, { rx: 10, stroke: INFO, fill: INFOBG, s: pop(u, 0.9) });
    mono(480, 376, '처리한 order_id 집합 { 42 }', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
  }

  // ───────── 5. XCLAIM / reaper ─────────
  const ROWS = [0, 1, 2];
  function claimRows(c, o) { o = o || {}; const x = 340, w = 560;
    T(x, 62, o.title || 'PEL · consumername=W1', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    ROWS.forEach((i) => { const y = 92 + i * 56, own = o.owner ? o.owner(i) : 'W1', ownCol = own === 'W1' ? BAD : own === 'reaper' ? INFO : GOOD, op = o.op ? o.op(i) : 1;
      el('rect', { x, y: y - 22, width: w, height: 44, rx: 8, fill: o.hot && o.hot(i) ? WARNBG : PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      mono(x + 16, y + 6, 'msg ' + (i + 1), { 'font-size': 15, 'font-weight': 700, opacity: op });
      const iw = (o.idle ? o.idle(i) : 0.8) * 260; el('rect', { x: x + 110, y: y - 7, width: iw, height: 14, rx: 3, fill: OFF, opacity: op });
      mono(x + w - 16, y + 6, own, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: ownCol, opacity: op }); });
    if (o.thr) { const tx0 = x + 110 + 260 * o.thr[0]; el('line', { x1: tx0, y1: 70, x2: tx0, y2: 250, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: o.thr[2] ?? 1 });
      mono(tx0, 266, o.thr[1], { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: o.thr[2] ?? 1 }); } }
  function deadW1(u) { worker(150, 120, 'W1', 'crashed', BAD); cross(210, 100, 10, 1); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { deadW1(u); claimRows(c, { op: (i) => fade(u, 0.5 + i * 0.25), hot: () => u > 1.4 });
      mono(40, 330, 'r.xpending_range("events", "workers", "-", "+",', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      mono(40, 356, '                  count=100, consumername="W1")', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.3) });
      T(560, 400, 'W1 이 붙든 3건', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      return; }
    if (k === 1) { deadW1(u); const g = E(u, 0.3, 1.4);
      claimRows(c, { idle: (i) => lerp(0.2, [0.9, 0.8, 0.7][i], g), thr: [0.5, '30s', fade(u, 0.2)], hot: () => u > 1.5 });
      el('rect', { x: 340, y: 286, width: 560, height: 40, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '5 5', opacity: fade(u, 1.7) });
      T(356, 312, '방금 배달된 것 (idle < 30s) → 제외', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      mono(40, 380, 'if p["time_since_delivered"] > 30000:', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 2.1) });
      return; }
    if (k === 2) { deadW1(u); worker(150, 300, 'W2', 'claiming', GOOD);
      claimRows(c, { owner: (i) => (u > 0.8 + i * 0.35 ? 'W2' : 'W1'), idle: (i) => (u > 0.8 + i * 0.35 ? 0.04 : [0.9, 0.8, 0.7][i]), thr: [0.5, 'min_idle 30s'] });
      grow(235, 300, 336, 150, E(u, 0.3, 0.8), GOOD);
      card(150, 390 - 10, 170, 40, { rx: 10, stroke: OFF, dash: '5 5', text: '다른 워커도 claim', fs: 13.5, color: MUT, op: fade(u, 1.8) });
      if (u > 2.1) { cross(250, 380, 9, pop(u, 2.1)); T(272, 386, 'idle 이 0 으로 리셋돼 실패', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 3) { mono(40, 50, 'XAUTOCLAIM events workers W2 30000 0 COUNT 10', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.1) });
      T(40, 88, 'Redis 6.2+ · 조회와 claim 을 한 번에', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3) });
      [['next_cursor', '다음 시작 ID', INFO], ['claimed', '가져온 3건', GOOD], ['deleted', '이미 지워진 ID', MUT]].forEach(([a, b, col], i) => {
        const x = 180 + i * 300, s = pop(u, 0.7 + i * 0.4); card(x, 200, 250, 96, { rx: 12, stroke: col, sw: 2, s });
        mono(x, 192, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.8 + i * 0.4) });
        T(x, 222, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9 + i * 0.4) }); });
      mono(40, 320, '# XPENDING + XCLAIM 을 합친 것', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
      return; }
    if (k === 4 || k === 5) { const rp = k === 4 ? pop(u, 0.3) : 1;
      card(150, 140, 170, 90, { rx: 14, stroke: INFO, sw: 2.5, fill: INFOBG, s: rp }); T(84, 136, 'reaper', { 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: rp }); sub(150, 166, 'consumer 이름', rp);
      const ang = (t * 1.6) % (Math.PI * 2); el('path', { d: 'M150,215 m-34,0 a34,22 0 1 0 68,0 a34,22 0 1 0 -68,0', fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: rp });
      el('circle', { cx: 150 + Math.cos(ang) * 34, cy: 215 + Math.sin(ang) * 22, r: 5, fill: INFO, opacity: rp });
      mono(150, 268, 'sleep(30)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: rp });
      // PEL 구간: 커서로 나눠 훑기
      const segs = 4, sx = 330, sw = 140, curP = k === 4 ? 0 : Math.min(segs, Math.floor(lerp(0, segs + 0.99, E(u, 0.3, 2.3))));
      T(sx, 92, 'PEL 전체', { 'font-size': 14, 'font-weight': 700, fill: WARN });
      for (let i = 0; i < segs; i++) { const done = k === 5 && i < curP; el('rect', { x: sx + i * sw, y: 110, width: sw - 8, height: 50, rx: 6, fill: done ? INFOBG : PANEL, stroke: done ? INFO : GRID, 'stroke-width': 1.8 });
        mono(sx + i * sw + (sw - 8) / 2, 141, 'COUNT 범위', { 'text-anchor': 'middle', 'font-size': 13.5, fill: done ? INFO : MUT }); }
      const cpos = k === 4 ? sx : curP >= segs ? sx : sx + curP * sw;
      caret(cpos, 166, INFO, k === 5 && curP >= segs ? 'cursor "0" → break' : curP === 0 ? 'cursor "0"' : 'cursor →', 1);
      mono(sx, 260, k === 4 ? 'start_id="0" 부터' : 'min_idle_time=60000 (1분)', { 'font-size': 15, 'font-weight': 700, fill: k === 4 ? INFO : WARN, opacity: fade(u, 0.6) });
      if (k === 5) T(sx, 300, '돌려받은 커서로 이어 읽고, "0" 이 오면 한 바퀴 끝', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
      return; }
    // k6: 처리 + XACK → PEL 비움
    card(150, 140, 170, 70, { rx: 14, stroke: INFO, sw: 2.5, fill: INFOBG }); T(84, 136, 'reaper', { 'font-size': 18, 'font-weight': 800, fill: INFO }); sub(150, 160, 'handle → XACK', 1);
    claimRows(c, { owner: () => 'reaper', idle: () => 0.04, op: (i) => 1 - seg(u, 0.6 + i * 0.4, 1.0 + i * 0.4), title: 'PEL' });
    ROWS.forEach((i) => { if (u > 0.5 + i * 0.4 && u < 1.1 + i * 0.4) check(320, 92 + i * 56, 9, 1); });
    mono(880, 62, 'PEL ' + (3 - Math.min(3, Math.floor(seg(u, 0.6, 2.0) * 3.01))), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: WARN });
    // heartbeat
    const hb = []; for (let x = 340; x <= 900; x += 4) { const p = ((x - 340 + t * 120) % 140); hb.push(`${x},${360 - (p > 60 && p < 70 ? 26 : p > 70 && p < 76 ? -12 : 0)}`); }
    el('polyline', { points: hb.join(' '), fill: 'none', stroke: GOOD, 'stroke-width': 2.2, opacity: fade(u, 1.8) });
    T(340, 404, '워커 heartbeat 를 보고, 끊긴 워커가 생기면 reaper 가 돈다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
  }

  R.page({ title: 'Stream 엔트리와 Consumer Group', scenes: [s1, s2, s3, s4, s5] });
})();
