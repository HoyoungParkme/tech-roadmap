/* II-1-4 Headers Exchange — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── RabbitMQ 그림 부품 ──
  function exch(cx, cy, name, type, o) { o = o || {}; const w = o.w || 150, h = o.h || 62, c = 18, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: `M${-w / 2 + c},${-h / 2} H${w / 2 - c} L${w / 2},0 L${w / 2 - c},${h / 2} H${-w / 2 + c} L${-w / 2},0 Z`, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    tx(0, type ? -4 : 5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' }, g);
    if (type) tx(0, 17, type, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: ACC }, g);
    return g; }
  function queue(x, y, name, n, o) { o = o || {}; const cap = o.cap || 5, cw = 22, gap = 4, w = cap * (cw + gap) + gap, h = 30, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    for (let i = 0; i < cap; i++) { const f = clamp(n - i); if (f <= 0) break;
      el('rect', { x: x + w - (i + 1) * (cw + gap), y: y + 5, width: cw * f, height: h - 10, rx: 3, fill: o.mcol || ACC, opacity: op }); }
    if (name) tx(x, y - 9, name, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: o.ncol || INK, opacity: op });
    return w; }
  function env(cx, cy, col) { const g = R.G(cx, cy, 1, 1);
    el('rect', { x: -13, y: -9, width: 26, height: 18, rx: 3, fill: col || ACC }, g);
    el('path', { d: 'M-13,-9 L0,2 L13,-9', fill: 'none', stroke: PANEL, 'stroke-width': 1.8 }, g); }
  function at(route, u) { const segs = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1])), tot = segs.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const k = segs[i] ? d / segs[i] : 0; return [lerp(route[i][0], route[i + 1][0], k), lerp(route[i][1], route[i + 1][1], k)]; }
  function send(route, u, col) { if (u <= 0 || u >= 1) return; const [x, y] = at(route, E(u, 0, 1)); env(x, y, col); }
  const app = (cx, cy, name, o) => card(cx, cy, (o && o.w) || 104, (o && o.h) || 46, Object.assign({ rx: 10, text: name, fs: 15, fw: 700 }, o || {}));

  // ── headers 매칭 (RabbitMQ 규칙: x-match 없으면 all, x- 로 시작하는 키는 all/any 판정에서 뺀다, 값은 타입까지 같아야 한다) ──
  function hmatch(bind, msg) { const mode = bind['x-match'] || 'all', ks = Object.keys(bind).filter((q) => q !== 'x-match' && !q.startsWith('x-'));
    const hit = (q) => Object.prototype.hasOwnProperty.call(msg, q) && typeof msg[q] === typeof bind[q] && msg[q] === bind[q];
    return mode === 'all' ? ks.every(hit) : ks.some(hit); }
  const TYPE = (v) => (typeof v === 'number' ? 'Integer' : typeof v === 'boolean' ? 'Boolean' : 'String');
  const show = (v, q) => (typeof v === 'string' && q ? `"${v}"` : String(v));

  // 헤더 맵 카드: rows [{k, v, hit}] (hit: true=초록, false=흐림, null=판정 전)
  function mapCard(cx, cy, title, rows, o) { o = o || {}; const w = o.w || 210, rh = 28, h = 36 + rows.length * rh + 8, x = cx - w / 2, y = cy - h / 2, s = o.s ?? 1;
    const g = R.G(cx, cy, s, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash }, g);
    tx(-w / 2 + 12, -h / 2 + 22, title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT }, g);
    rows.forEach((r, i) => { const yy = -h / 2 + 36 + i * rh, reveal = o.reveal == null ? 1 : clamp(o.reveal * rows.length - i);
      if (reveal <= 0) return; const col = r.hit === true ? GOOD : r.hit === false ? OFF : INK, isX = r.k === 'x-match';
      if (r.hit === true) el('rect', { x: -w / 2 + 6, y: yy, width: w - 12, height: rh - 4, rx: 5, fill: 'var(--goodbg)', opacity: reveal }, g);
      if (isX) el('rect', { x: -w / 2 + 6, y: yy, width: w - 12, height: rh - 4, rx: 5, fill: ACCBG, opacity: reveal }, g);
      mono(-w / 2 + 14, yy + 18, r.k, { 'font-size': 14, 'font-weight': 700, fill: isX ? ACC : col, opacity: reveal }, g);
      mono(-w / 2 + (o.kw || 96), yy + 18, show(r.v, o.quote), { 'font-size': 14, fill: isX ? ACC : col, 'font-weight': isX ? 800 : 400, opacity: reveal }, g);
      if (o.types) mono(w / 2 - 12, yy + 18, TYPE(r.v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: reveal }, g); });
    return { x, y, w, h }; }
  // 바인딩 카드 (조건 맵 + AND/OR 표시 + 결과)
  function bindCard(cx, cy, b, o) { o = o || {}; const rows = [{ k: 'x-match', v: b.xMatch }].concat(b.args.map((a) => ({ k: a.k, v: a.v, hit: o.judge ? a.hit : null })));
    const m = mapCard(cx, cy, b.queue + ' 바인딩', rows, Object.assign({ w: 214, kw: 92, stroke: o.judge ? (b.matched ? GOOD : b.matched === false ? BAD : INK) : INK, sw: o.judge && b.matched != null ? 2.6 : 2 }, o));
    pill(cx + 107 - 30, cy - m.h / 2 + 2, b.xMatch === 'all' ? 'AND' : 'OR', b.xMatch === 'all' ? ACC : INFO, o.s ?? 1, { fs: 13.5 });
    return m; }

  // 공통 자리
  const H = { mx: 122, ex: 340, ey: 210, bx: 568, qx: 740 };

  // 1. 타입만 headers 로: routing key 를 버린다
  function s1(t, c) { const { k, u } = c;
    app(84, 210, 'HeadersExchange.java', { w: 150, fs: 13.5 });
    const cu = k === 0 ? E(u, 0.3, 1.2) : 1; el('rect', { x: 160, y: 197, width: 120 * cu, height: 26, rx: 13, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    if (k === 0) { if (u > 1.0) el('line', { x1: 168, y1: 210, x2: 168 + 104 * E(u, 1.0, 1.7), y2: 210, stroke: ACC, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
      sub(220, 182, 'connection · channel', fade(u, 1.6), { 'font-weight': 700, fill: INK });
      sub(560, 214, '연결 절차는 direct·topic·fanout 과 같다', fade(u, 1.8), { 'font-size': 15 }); return; }
    el('line', { x1: 168, y1: 210, x2: 272, y2: 210, stroke: ACC, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    if (k === 1) { exch(400, 210, 'app.headers', 'headers', { s: pop(u, 0.2) });
      const ru = E(u, 0.8, 1.6); pill(620, 120, 'routing_key', OFF, 1, { mono: true, fs: 14, color: OFF }); if (ru > 0) el('line', { x1: 560, y1: 120, x2: 560 + 122 * ru, y2: 120, stroke: BAD, 'stroke-width': 3 });
      sub(620, 156, '읽지 않는다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
      mapCard(720, 286, '메시지 헤더 맵 · 매칭 기준', [{ k: 'format', v: '…' }, { k: 'type', v: '…' }], { s: pop(u, 1.6), stroke: ACC, tcol: ACC, w: 240 });
      return; }
    // 2: 축이 여럿이면 문자열 한 줄보다 맵이 자연스럽다
    const axes = ['format', 'type', 'region', 'priority'];
    tx(560, 56, 'topic 이라면', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    mono(560, 92, axes.join('.'), { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
    sub(560, 118, '순서·개수가 고정된 문자열 하나', fade(u, 0.6));
    mapCard(560, 270, 'headers 라면 · 축마다 한 칸', axes.map((a) => ({ k: a, v: '…' })), { s: pop(u, 1.0), stroke: ACC, tcol: ACC, w: 250, reveal: E(u, 1.0, 2.0) });
    card(850, 270, 160, 70, { rx: 10, stroke: WARN, sw: 2, text: '단순 문자열\n라우팅은 topic', fs: 14, s: pop(u, 2.0) }); }

  // 2. x-match=all (AND)
  const ALL = { 'x-match': 'all', format: 'pdf', type: 'report' };
  const ALL_T = [{ format: 'pdf', type: 'report' }, { format: 'pdf', type: 'report', size: 'big' }, { format: 'pdf' }, { format: 'png', type: 'report' }];
  function table(rows, bind, u, x0) {   // 메시지 헤더 → 판정 (실제 규칙으로 계산)
    tx(x0, 50, '메시지 헤더', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(x0 + 520, 50, '판정', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    rows.forEach((m, i) => { const y = 92 + i * 66, a = fade(u, 0.2 + i * 0.35), ok = hmatch(bind, m);
      el('line', { x1: x0 - 10, y1: y + 30, x2: x0 + 600, y2: y + 30, stroke: GRID, 'stroke-width': 1, opacity: a });
      let x = x0; Object.entries(m).forEach(([kk, v]) => { const hit = Object.prototype.hasOwnProperty.call(bind, kk) && bind[kk] === v, s = `${kk}:${v}`, w = tw(s, 14) + 22;
        card(x + w / 2, y, w, 30, { rx: 15, text: s, fs: 14, mono: true, stroke: hit ? GOOD : kk in bind ? BAD : GRID, color: hit ? GOOD : kk in bind ? BAD : MUT, op: a, sw: 1.8 }); x += w + 8; });
      const sc = pop(u, 0.5 + i * 0.35); if (ok) check(x0 + 520, y, 11, sc); else cross(x0 + 520, y, 9, sc); }); }
  function s2(t, c) { const { k, u } = c, b = c.beat.bindings[0];
    if (k === 3) { mapCard(130, 210, 'x-match=all', [{ k: 'format', v: 'pdf' }, { k: 'type', v: 'report' }], { w: 200, kw: 84, stroke: ACC, tcol: ACC });
      sub(130, 290, '둘 다 맞아야 통과', 1, { 'font-weight': 700, fill: INK });
      table(ALL_T, ALL, u, 290); sub(610, 372, '조건에 없는 size 는 보지 않는다', fade(u, 2.0), { 'font-size': 14 }); return; }
    exch(H.ex, H.ey, 'app.headers', 'headers');
    queue(H.qx, 195, 'q.pdf.report', 0, { s: 1, op: k === 0 ? fade(u, 0.2) : 1, dash: k < 2 ? '6 5' : null, col: k < 2 ? MUT : INK });
    if (k === 0) { sub(H.qx + 67, 250, '바인딩이 없으면 아무것도 안 온다', fade(u, 1.0)); sub(H.bx, 214, '(바인딩 없음)', fade(u, 0.8), { 'font-size': 15 }); return; }
    const rv = k === 1 ? E(u, 0.3, 1.8) : 1;
    bindCard(H.bx, H.ey, b, { reveal: rv, s: k === 1 ? pop(u, 0.2) : 1 });
    if (k >= 2) { const gu = k === 2 ? E(u, 0.2, 1.0) : 1;
      el('line', { x1: H.ex + 75, y1: H.ey, x2: lerp(H.ex + 75, H.bx - 107, gu), y2: H.ey, stroke: ACC, 'stroke-width': 2.4 });
      if (gu >= 1) el('line', { x1: H.bx + 107, y1: H.ey, x2: lerp(H.bx + 107, H.qx, E(u, 1.0, 1.5)), y2: H.ey, stroke: ACC, 'stroke-width': 2.4 });
      pill(H.ex + 10, 118, 'routing key ""', OFF, k === 2 ? pop(u, 1.4) : 1, { mono: true, fs: 13.5, color: MUT }); if (k === 2 ? u > 1.8 : true) el('line', { x1: H.ex - 60, y1: 118, x2: H.ex + 80, y2: 118, stroke: BAD, 'stroke-width': 2.5 });
      pill(H.bx, 324, 'queueBind(q, ex, "", binding)', INK, k === 2 ? pop(u, 2.0) : 1, { mono: true, fs: 13.5 }); }
    if (k === 1) sub(H.bx, 300, 'x-match 를 빼면 all 로 본다', fade(u, 2.0), { fill: ACC, 'font-weight': 700 }); }

  // 3. x-match=any (OR) + 비문자열 값
  const ANY = { 'x-match': 'any', format: 'pdf', type: 'log' };
  const ANY_T = [{ format: 'pdf', type: 'report' }, { format: 'png', type: 'log' }, { format: 'png', type: 'report' }];
  const URG = { 'x-match': 'any', priority: 9, urgent: true };
  function s3(t, c) { const { k, u } = c, bs = c.beat.bindings;
    if (k === 3) { mapCard(130, 210, 'x-match=any', [{ k: 'format', v: 'pdf' }, { k: 'type', v: 'log' }], { w: 200, kw: 84, stroke: INFO, tcol: INFO });
      sub(130, 290, '하나만 맞아도 통과', 1, { 'font-weight': 700, fill: INK });
      table(ANY_T, ANY, u, 290); sub(610, 316, '조건을 늘릴수록 통과 범위가 넓어진다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 2) { // 값의 타입까지 비교: "9"(String) 와 9(Integer) 는 다르다
      mapCard(170, 150, 'q.urgent 바인딩 (any)', [{ k: 'priority', v: 9 }, { k: 'urgent', v: true }], { w: 270, kw: 104, types: true, stroke: INFO, tcol: INFO, s: pop(u, 0.2) });
      [[{ priority: '9' }, 'priority: "9"', 'String'], [{ priority: 9 }, 'priority: 9', 'Integer'], [{ urgent: true }, 'urgent: true', 'Boolean']].forEach(([m, s, ty], i) => { const y = 110 + i * 84, a = fade(u, 0.7 + i * 0.4), ok = hmatch(URG, m);
        card(560, y, 230, 50, { rx: 10, stroke: ok ? GOOD : BAD, sw: 2, op: a }); mono(460, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: a }); mono(670, y + 5, ty, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: a });
        const sc = pop(u, 0.9 + i * 0.4); if (ok) check(710, y, 11, sc); else cross(710, y, 9, sc); });
      sub(170, 262, '메시지 헤더를 이 바인딩에 대 보면', fade(u, 0.6));
      card(170, 340, 280, 50, { rx: 10, stroke: WARN, sw: 2, text: '숫자를 문자열로 보내면\n조용히 어긋난다', fs: 14, s: pop(u, 2.0) }); return; }
    exch(H.ex, H.ey, 'app.headers', 'headers');
    const two = k >= 1 ? bs : bs.concat([{ queue: 'q.pdf.or.log', xMatch: 'any', args: [{ k: 'format', v: 'pdf' }, { k: 'type', v: 'log' }] }]);
    two.slice(0, 2).forEach((b, i) => { const y = [120, 300][i], isNew = i === 1, bound = !isNew || k >= 1;
      const s = isNew && k === 0 ? pop(u, 0.2) : 1;
      bindCard(H.bx, y, b, { s, reveal: isNew && k === 0 ? E(u, 0.4, 1.6) : 1, dash: bound ? null : '6 5' });
      queue(H.qx, y - 15, b.queue, 0, { op: s, dash: bound ? null : '6 5', col: bound ? INK : MUT });
      if (bound) { const gu = isNew && k === 1 ? E(u, 0.3, 1.3) : 1; el('line', { x1: H.ex + 75, y1: H.ey, x2: lerp(H.ex + 75, H.bx - 107, gu), y2: lerp(H.ey, y, gu), stroke: i ? INFO : ACC, 'stroke-width': 2.4 });
        el('line', { x1: H.bx + 107, y1: y, x2: lerp(H.bx + 107, H.qx, gu), y2: y, stroke: i ? INFO : ACC, 'stroke-width': 2.4 }); } });
    if (k === 0) sub(H.ex, 300, 'all → any 한 단어 차이', fade(u, 1.6), { fill: INFO, 'font-weight': 700 });
    if (k === 1) pill(300, 384, `바인딩 ${u > 1.3 ? 2 : 1}개 · 큐마다 x-match 가 다르다`, INFO, 1, { fs: 13.5 }); }

  // 4. headers 를 실어 발행 → 판정 → 두 큐로 복사
  function s4(t, c) { const { k, u } = c, b = c.beat, MX = 124;
    exch(H.ex, H.ey, 'app.headers', 'headers');
    b.bindings.forEach((bb, i) => { const y = [120, 300][i];
      bindCard(H.bx, y, bb, { judge: k === 3 && u > 1.0 });
      queue(H.qx, y - 15, bb.queue, k === 3 && b.routed.includes(bb.queue) ? E(u, 2.0, 2.5) : 0, { col: k === 3 && bb.matched ? GOOD : INK });
      el('line', { x1: H.ex + 75, y1: H.ey, x2: H.bx - 107, y2: y, stroke: k === 3 && bb.matched && u > 1.0 ? GOOD : MUT, 'stroke-width': 2.2 });
      el('line', { x1: H.bx + 107, y1: y, x2: H.qx, y2: y, stroke: k === 3 && bb.matched && u > 1.0 ? GOOD : MUT, 'stroke-width': 2.2 }); });
    // 메시지: routing_key · properties.headers · body 세 칸
    const hdr = b.headers.map((h) => ({ k: h.k, v: h.v, hit: k === 3 && u > 1.0 ? (h.hit ? true : false) : null }));
    const mv = k === 3 ? E(u, 0.2, 0.9) : 0, my = 210, mxx = lerp(MX, MX, mv);
    const op = 1 - 0.0 * mv;
    if (k >= 1) { pill(mxx, 52, 'routing_key = ""', OFF, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5, color: MUT }); sub(mxx, 82, '읽지 않음', k === 1 ? fade(u, 0.6) : 1, { fill: MUT }); }
    const hy = k === 2 ? lerp(my, 210, E(u, 0.2, 1.0)) : my;
    mapCard(mxx, hy, k >= 2 ? 'properties.headers' : 'headers = { … }', hdr, { w: 210, kw: 92, stroke: k >= 2 ? ACC : INK, tcol: k >= 2 ? ACC : MUT, reveal: k === 0 ? E(u, 0.3, 1.6) : 1, op });
    if (k === 0) sub(mxx, 300, 'priority 는 어느 조건에도 없다', fade(u, 1.8), { fill: INK, 'font-weight': 700 });
    if (k >= 1) { card(mxx, 342, 210, 50, { rx: 10, stroke: GRID, sw: 1.6, dash: '5 4', text: 'body {"doc_id": 42}', fs: 14, mono: true, color: MUT, s: k === 1 ? pop(u, 0.8) : 1 });
      sub(mxx, 386, '라우팅에 쓰이지 않는다', k === 1 ? fade(u, 1.2) : 1); }
    if (k === 2) pill(mxx, 112, 'delivery_mode=2 · persistent', INK, pop(u, 1.2), { fs: 13.5 });
    if (k === 3) { send([[MX + 105, 210], [H.ex - 75, H.ey]], seg(u, 0.2, 0.9), ACC);
      b.bindings.forEach((bb, i) => { if (bb.matched) send([[H.bx + 107, [120, 300][i]], [H.qx + 110, [120, 300][i]]], seg(u, 1.4, 2.1), GOOD); });
      pill(H.qx + 60, 210, `두 큐 모두 매칭 → ${b.routed.length}벌`, GOOD, pop(u, 2.2), { fs: 13.5 }); } }

  // 5. CLI 로 검증, topic 과 고르는 기준
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 4) { tx(480, 46, '무엇을 고르나', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['topic', 'routing key 문자열 · 단어 계층', '빠르고 관용적 · 기본 선택', ACC], ['headers', '헤더 맵을 값 타입까지 비교', '유연하지만 바인딩마다 맵 비교', INFO]].forEach(([a, b2, c2, col], i) => { const x = 260 + i * 440, s = pop(u, 0.2 + i * 0.4);
        card(x, 180, 380, 150, { rx: 14, stroke: col, sw: 2.4, s }); mono(x, 140, a, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.3 + i * 0.4) });
        tx(x, 184, b2, { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); tx(x, 214, c2, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); });
      banner(480, 330, '다속성·비문자열 조건이 분명할 때만 headers', pop(u, 1.6)); return; }
    const L = [
      '$ADMIN declare exchange name=app.headers type=headers', '$ADMIN declare queue name=q.pdf.report', '$ADMIN declare queue name=q.pdf.or.log',
      '$ADMIN declare binding … arguments=\'{"x-match":"all",…}\'', '$ADMIN declare binding … arguments=\'{"x-match":"any",…}\'',
      '$ADMIN publish exchange=app.headers routing_key=""', '  properties=\'{"headers":{"format":"png","type":"log"}}\'',
      ['$ADMIN get queue=q.pdf.report → 0건', 'var(--bad)'], ['$ADMIN get queue=q.pdf.or.log → 1건', 'var(--good)']];
    const shown = [3, 5, 7, 9][k], prevShown = [0, 3, 5, 7][k];
    terminal(14, 24, 560, 250, L, lerp(prevShown, shown, E(u, 0.2, 1.6)), { title: 'verify.sh', lh: 22, fs: 13.5 });
    // 오른쪽: 큐 두 개와 결과
    const res = k === 3 ? (n) => n : () => 0;
    const bnd = b.bindings, judged = k === 3;
    [['q.pdf.report', 'all', 'pdf · report'], ['q.pdf.or.log', 'any', 'pdf · log']].forEach(([q, xm, cond], i) => { const y = 80 + i * 130, bb = bnd[i];
      queue(800 - 67, y, q, judged ? (i === 1 ? E(u, 1.6, 2.1) : 0) : 0, { col: judged ? (bb.matched ? GOOD : BAD) : INK, op: k === 0 ? fade(u, 0.8 + i * 0.3) : 1 });
      if (k >= 1) mono(733, y + 54, `${xm}: ${cond}`, { 'font-size': 14, fill: xm === 'all' ? ACC : INFO, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.8 + i * 0.4) : 1 });
      if (judged) { const n = i === 1 ? 1 : 0; mono(880, y + 21, `${n}건`, { 'font-size': 16, 'font-weight': 800, fill: n ? GOOD : BAD, opacity: fade(u, 2.0) }); } });
    if (k >= 2) { const hd = b.headers.map((h) => ({ k: h.k, v: h.v, hit: judged ? h.hit : null }));
      mapCard(300, 344, 'headers (이번 메시지)', hd, { w: 290, kw: 100, stroke: ACC, tcol: ACC, s: k === 2 ? pop(u, 1.2) : 1 }); }
    if (k === 2) sub(780, 360, 'pdf · report 와 값이 다르다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 3) { pill(780, 350, 'all: format X · type X → 실패', BAD, pop(u, 1.0), { fs: 13.5 }); pill(780, 390, 'any: type=log 일치 → 통과', GOOD, pop(u, 1.4), { fs: 13.5 }); } }

  const quiz = [
    { q: 'headers exchange가 라우팅을 정할 때 보는 것은 무엇인가?',
      o: ['routing key 문자열', '메시지 본문(body)', '메시지 properties의 headers 맵'], a: 2,
      why: 'headers 타입은 routing key를 읽지 않는다. 바인딩 조건과 properties.headers를 비교해 큐를 고른다.' },
    { q: 'x-match=all로 {format:pdf, type:report}를 건 큐에 {format:pdf}만 있는 메시지가 오면 결과는 무엇인가?',
      o: ['type이 없어서 탈락한다', 'format이 맞아서 통과한다', '빠진 헤더는 무시하고 통과한다'], a: 0,
      why: 'all은 조건에 적힌 헤더가 모두 값까지 같아야 한다. 조건 밖의 여분 헤더는 상관없지만 조건 헤더가 빠지면 실패다.' },
    { q: 'priority=9(Integer)를 조건으로 건 바인딩에 헤더 priority="9"(문자열)가 오면 결과는 무엇인가?',
      o: ['숫자로 바꿔서 맞춘다', '타입이 달라 맞지 않는다', '에러를 내고 발행이 실패한다'], a: 1,
      why: '헤더 값은 타입까지 비교한다. 프로듀서가 숫자를 문자열로 보내면 에러 없이 조건이 어긋난다.' },
    { q: '{format:pdf, type:report, priority:high}를 발행했을 때 이 메시지가 들어가는 큐는 무엇인가? (all: pdf·report, any: pdf·log)',
      o: ['q.pdf.report 하나', 'q.pdf.or.log 하나', 'q.pdf.report와 q.pdf.or.log 둘 다'], a: 2,
      why: 'all 큐는 두 조건이 모두 맞고, any 큐는 format=pdf 하나로 충분하다. priority는 어느 조건에도 없어 판정에 안 쓰인다.' },
    { q: 'headers exchange를 기본 선택으로 쓰지 않는 이유는 무엇인가?',
      o: ['숫자 값을 다룰 수 없어서', '바인딩마다 맵을 비교해 topic보다 느리고, 대부분은 문자열 key로 충분해서', '큐를 두 개까지만 묶을 수 있어서'], a: 1,
      why: 'headers는 유연하지만 비용이 든다. 여러 속성과 비문자열 조건이 꼭 필요할 때만 고른다.' },
  ];

  const summary = [
    'Headers exchange는 routing key를 읽지 않고 메시지 헤더 맵으로 큐를 고른다.',
    'x-match=all은 조건 헤더가 모두 같아야 하고 any는 하나만 같아도 통과한다.',
    '값은 타입까지 비교하므로 숫자 9와 문자열 "9"는 다른 값이다.',
    '맵 비교라 topic보다 느려서 다속성·비문자열 조건이 꼭 필요할 때만 쓴다.',
  ];
  const review = [
    { q: 'headers 라우팅을 붙였는데 메시지가 어느 큐에도 안 들어간다. 프로듀서 코드에서 먼저 볼 곳은 무엇인가?',
      o: ['헤더 값을 properties.headers가 아니라 body에 넣었는지', 'routing_key를 빈 문자열로 두었는지', 'delivery_mode를 2로 두었는지'], a: 0,
      why: '판정은 properties.headers로만 한다. body에 넣은 값은 라우팅에 쓰이지 않는다.' },
    { q: '{format:png, type:log}를 보냈더니 all 큐는 0건, any 큐는 1건이었다. 이 결과에 대한 설명으로 맞는 것은 무엇인가?',
      o: ['all 큐 바인딩이 잘못 만들어졌다', 'any 큐는 type=log 하나가 맞아 통과했고 all 큐는 둘 다 어긋났다', 'png 헤더를 브로커가 지웠다'], a: 1,
      why: '같은 규칙이라도 메시지 값에 따라 결과가 갈린다. all은 format과 type이 모두 맞아야 하고 any는 하나면 된다.' },
    { q: '우선순위 9인 메시지만 따로 모으려 q.urgent에 priority=9 조건을 걸었는데 아무것도 안 온다. 먼저 의심할 것은 무엇인가?',
      o: ['x-match를 all로 바꿔야 한다', '큐를 durable로 선언하지 않았다', '프로듀서가 priority를 문자열 "9"로 보내고 있다'], a: 2,
      why: '헤더 값은 타입까지 같아야 맞는다. 정수 9 조건에 문자열 "9"가 오면 조용히 어긋난다.' },
  ];

  R.page({ title: 'Headers 매칭판', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
