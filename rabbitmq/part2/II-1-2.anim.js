/* II-1-2 Topic Exchange — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── RabbitMQ 그림 부품 ──
  function exch(cx, cy, name, type, o) { o = o || {}; const w = o.w || 150, h = o.h || 62, c = 18, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: `M${-w / 2 + c},${-h / 2} H${w / 2 - c} L${w / 2},0 L${w / 2 - c},${h / 2} H${-w / 2 + c} L${-w / 2},0 Z`, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    tx(0, type ? -4 : 5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' }, g);
    if (type) tx(0, 17, type, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: ACC }, g);
    return g; }
  function queue(x, y, n, o) { o = o || {}; const cap = o.cap || 4, cw = 22, gap = 4, w = cap * (cw + gap) + gap, h = 30, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    for (let i = 0; i < cap; i++) { const f = clamp(n - i); if (f <= 0) break;
      el('rect', { x: x + w - (i + 1) * (cw + gap), y: y + 5, width: cw * f, height: h - 10, rx: 3, fill: o.mcol || ACC, opacity: op }); }
    return w; }
  function env(cx, cy, col, label) { const g = R.G(cx, cy, 1, 1);
    el('rect', { x: -13, y: -9, width: 26, height: 18, rx: 3, fill: col || ACC }, g);
    el('path', { d: 'M-13,-9 L0,2 L13,-9', fill: 'none', stroke: PANEL, 'stroke-width': 1.8 }, g);
    if (label) mono(18, 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: col || ACC }, g); }
  function at(route, u) { const segs = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1])), tot = segs.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const k = segs[i] ? d / segs[i] : 0; return [lerp(route[i][0], route[i + 1][0], k), lerp(route[i][1], route[i + 1][1], k)]; }
  function send(route, u, col, label) { if (u <= 0 || u >= 1) return; const [x, y] = at(route, E(u, 0, 1)); env(x, y, col, label); }
  const app = (cx, cy, name, o) => card(cx, cy, (o && o.w) || 100, 46, Object.assign({ rx: 10, text: name, fs: 15, fw: 700 }, o || {}));

  // ── Topic 매칭 (RabbitMQ 규칙: 점으로 단어를 나누고 * = 정확히 한 단어, # = 0개 이상) ──
  // 맞으면 패턴 단어마다 [시작 칸, 칸 수] 를 돌려주고, 안 맞으면 null
  function assign(P, K) {
    function m(pi, ki) { if (pi === P.length) return ki === K.length ? [] : null; const p = P[pi];
      if (p === '#') { for (let n = 0; ki + n <= K.length; n++) { const r = m(pi + 1, ki + n); if (r) return [[ki, n]].concat(r); } return null; }
      if (ki >= K.length) return null;
      if (p === '*' || p === K[ki]) { const r = m(pi + 1, ki + 1); if (r) return [[ki, 1]].concat(r); }
      return null; }
    return m(0, 0); }
  const match = (p, k) => assign(p.split('.'), k.split('.')) !== null;

  // ── 단어 칸 판 ──
  const X0 = 150, CW = 92, BUS = 676, TQ = 712;
  const colX = (j) => X0 + CW * j;
  function tile(x0, x1, y, word, o) { o = o || {}; const w = Math.max(24, x1 - x0), cx = x0 + w / 2;
    card(cx, y, w, 34, { rx: 6, stroke: o.stroke || INK, fill: o.fill || PANEL, sw: o.sw || 2, dash: o.dash, text: word, fs: 15, fw: 700, mono: true, color: o.color || INK, s: o.s, op: o.op }); }
  // routing key 칸 (위쪽 줄)
  function keyTiles(key, y, o) { o = o || {}; key.split('.').forEach((w, j) => tile(colX(j) + 4, colX(j + 1) - 4, y, w, { stroke: ACC, fill: ACCBG, color: ACC, s: o.s ? o.s(j) : 1, op: o.op })); }
  // 패턴 한 줄: judge(0~1) 만큼 왼쪽 칸부터 판정이 드러난다
  function patRow(y, name, pat, key, o) { o = o || {}; const P = pat.split('.'), K = key.split('.'), sp = assign(P, K), ok = sp !== null, op = o.op ?? 1, jv = o.judge;
    mono(22, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: op });
    let spans = sp; if (!ok) { spans = []; let j = 0; P.forEach((p) => { const len = p === '#' ? Math.max(1, K.length - j) : 1; spans.push([j, len]); j += len; }); }
    // 안 맞는 첫 칸 (빨강): 단어가 다르거나, 단어 수가 어긋난 자리
    let bad = -1; if (!ok) { for (let i = 0; i < P.length; i++) { if (P[i] === '#') break; if (i >= K.length || (P[i] !== '*' && P[i] !== K[i])) { bad = i; break; } } }
    const gap = !ok && bad < 0 && !P.includes('#') && P.length < K.length;   // 단어가 모자라 빈 칸이 남는 경우
    P.forEach((p, i) => { const [s, n] = spans[i], judged = jv != null && jv * 3 > s;
      const wild = p === '*' || p === '#', x0 = n ? colX(s) + 4 : colX(s) - 15, x1 = n ? colX(s + n) - 4 : colX(s) + 15;
      let st = { stroke: wild ? (p === '#' ? INFO : ACC) : INK, fill: wild ? (p === '#' ? 'var(--infobg)' : ACCBG) : PANEL, color: wild ? (p === '#' ? INFO : ACC) : INK, dash: o.dash ? '5 4' : null, op };
      if (judged && ok) st = Object.assign(st, { stroke: GOOD, sw: 2.5 });
      if (judged && !ok) st = i === bad ? Object.assign(st, { stroke: BAD, fill: 'var(--badbg)', color: BAD, sw: 2.5 }) : Object.assign(st, { op: op * 0.45 });
      tile(x0, x1, y, p, Object.assign(st, { s: typeof o.s === 'function' ? o.s(i) : (o.s ?? 1) })); });
    // 단어 수가 모자라면 빈 자리를 빨갛게
    if (gap && jv != null && jv * 3 > P.length) {
      el('rect', { x: colX(P.length) + 4, y: y - 17, width: CW - 8, height: 34, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      sub(colX(P.length) + CW / 2, y + 5, '빈 자리', 1, { fill: BAD, 'font-weight': 700 }); }
    if (jv != null && jv >= 1) { const sc = o.markS ?? 1; if (ok) check(468, y, 10, sc); else cross(468, y, 8, sc); }
    return ok; }
  // 줄 오른쪽: exchange 버스 → 큐
  function rowQueue(y, n, o) { o = o || {}; const op = o.op ?? 1;
    el('line', { x1: 496, y1: y, x2: BUS, y2: y, stroke: GRID, 'stroke-width': 1.6, 'stroke-dasharray': '3 4', opacity: op });
    el('line', { x1: BUS, y1: y, x2: TQ, y2: y, stroke: o.hit ? GOOD : MUT, 'stroke-width': 2.2, opacity: op });
    queue(TQ, y - 15, n, { op, col: o.hit ? GOOD : INK }); }
  const rowY = (i, n) => (n >= 5 ? 142 + i * 52 : 156 + i * 64);
  // 위쪽 줄: Producer · routing key 칸 · exchange, 그리고 버스
  function top(name, key, o) { o = o || {};
    app(62, 56, o.prod || 'Producer', { w: o.pw || 100 });
    el('line', { x1: 112, y1: 56, x2: 478, y2: 56, stroke: GRID, 'stroke-width': 2.5 });
    if (key && o.key !== false) keyTiles(key, 56, { s: o.ks, op: o.kop });
    exch(570, 56, name, 'topic', { w: 172, s: o.es });
    if (o.bus) el('line', { x1: BUS, y1: 88, x2: BUS, y2: o.bus, stroke: MUT, 'stroke-width': 2.2 }); }
  // 판정·전달 장면 공통: rows [{q,p}], 상태별로 그린다
  function boardRows(rows, key, o) { o = o || {}; const n = rows.length;
    rows.forEach((r, i) => { const y = rowY(i, n), ok = match(r.p, key);
      patRow(y, r.q, r.p, key, { dash: o.dash, judge: o.judge != null ? o.judge(i) : null, op: o.op ? o.op(i) : 1, s: o.s ? o.s(i) : null, markS: o.markS });
      if (o.tubes) rowQueue(y, o.fill ? o.fill(i, ok) : 0, { hit: o.hitShow && ok, op: o.tubes(i) }); }); }
  function publish(key, rows, u, a) { const n = rows.length;   // 봉투가 exchange 를 지나 맞는 줄의 큐로 간다
    send([[112, 30], [500, 30]], seg(u, a, a + 0.7), ACC, key);
    rows.forEach((r, i) => { if (!match(r.p, key)) return; const y = rowY(i, n); send([[BUS, 88], [BUS, y], [TQ + 90, y]], seg(u, a + 0.8, a + 1.6), GOOD, null); }); }

  // 1. 점으로 나뉜 계층형 routing key
  function s1(t, c) { const { k, u } = c, b = c.beat, key = b.routingKey, rows = b.bindings.filter((x) => x.pattern !== '—').map((x) => ({ q: x.queue, p: x.pattern }));
    if (k === 0) { app(62, 56, 'Producer');
      const gu = E(u, 0.2, 1.2); el('rect', { x: 112, y: 43, width: 360 * gu, height: 26, rx: 13, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      if (u > 1.0) el('line', { x1: 120, y1: 56, x2: 120 + 344 * E(u, 1.0, 1.8), y2: 56, stroke: ACC, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
      sub(290, 92, 'connection 위 channel 하나 · localhost:5672', fade(u, 1.6), { 'font-weight': 700, fill: INK });
      // 보낼 key 가 점에서 쪼개진다
      const sp = E(u, 1.6, 2.5); key.split('.').forEach((w, j) => { const x = lerp(330 + (j - 1) * 70, colX(j) + CW / 2, sp);
        tile(x - 40, x + 40, 230, w, { stroke: ACC, fill: ACCBG, color: ACC });
        sub(x, 270, ['종목', '통화', '거래소'][j], sp, { 'font-size': 14 }); });
      sub(330, 190, `routing key "${key}"`, fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    top('market.topic', key, { es: k === 1 ? pop(u, 0.2) : 1, key: k >= 2, bus: k >= 3 ? rowY(rows.length - 1, rows.length) : null });
    zone(8, 100, 640, 312, k >= 3 ? '바인딩 (binding key = 패턴)' : '');
    if (k === 1) { [['*', '정확히 한 단어', ACC], ['#', '0개 이상 단어', INFO]].forEach(([w, s, col], i) => { const y = 180 + i * 80, sc = pop(u, 0.8 + i * 0.4);
        tile(150, 220, y, w, { stroke: col, color: col, fill: i ? 'var(--infobg)' : ACCBG, s: sc }); tx(240, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) }); });
      sub(330, 350, '점(.)이 단어 경계, 특수 문자는 * 와 # 둘뿐', fade(u, 1.8), { 'font-size': 15 }); return; }
    boardRows(rows, key, { dash: k === 2, s: k === 2 ? (i) => pop(u, 0.2 + i * 0.3) : null, judge: k >= 3 ? () => (k === 3 ? E(u, 0.8, 2.0) : 1) : null,
      tubes: k >= 3 ? (i) => (k === 3 ? E(u, 0.2 + i * 0.2, 0.6 + i * 0.2) : 1) : null, fill: (i, ok) => (k === 4 && ok ? E(u, 2.0, 2.5) : 0), hitShow: k === 4 });
    if (k === 2) sub(560, 382, 'bind 전 · 패턴만 정해 둠', fade(u, 1.4));
    if (k === 4) { publish(key, rows, u, 0.2); banner(330, 392, '한 번 발행 → 패턴이 맞는 큐 2개', pop(u, 2.2)); } }

  // 2. * = 정확히 한 단어
  function s2(t, c) { const { k, u } = c, b = c.beat, key = b.routingKey, rows = b.bindings.filter((x) => x.pattern !== '—').map((x) => ({ q: x.queue, p: x.pattern }));
    top('market.topic', key, { es: k === 0 ? pop(u, 0.2) : 1, key: k >= 1, bus: k >= 2 ? rowY(rows.length - 1, rows.length) : null });
    zone(8, 100, 640, 312, '바인딩 패턴');
    if (k === 0) { sub(330, 250, '바인딩된 큐 없음', fade(u, 0.8), { 'font-size': 15 }); return; }
    const judge = k === 1 ? () => E(u, 1.0, 2.0) : k === 2 ? (i) => (i === 3 ? E(u, 0.9, 1.9) : 1) : k === 3 ? (i) => E(u, 0.3 + i * 0.25, 1.1 + i * 0.25) : () => 1;
    boardRows(rows, key, { s: (i) => (k === 1 ? pop(u, 0.2 + i * 0.25) : k === 2 && i === 3 ? pop(u, 0.2) : 1), judge,
      tubes: k >= 2 ? (i) => (k === 2 ? E(u, 1.4 + i * 0.15, 1.8 + i * 0.15) : 1) : null, fill: (i, ok) => (k === 3 && ok ? E(u, 2.1, 2.5) : k === 4 && ok ? 1 : 0), hitShow: k >= 3 });
    if (k === 1) rows.forEach((r, i) => mono(498, rowY(i, rows.length) + 5, '3단어', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }));
    if (k === 2) pill(560, 382, 'bind 된 큐 3 → 4 · 에러는 없다', WARN, pop(u, 1.8), { fs: 13.5 });
    if (k === 3) send([[112, 30], [500, 30]], seg(u, 0.1, 0.6), ACC, key);
    if (k === 3) rows.forEach((r, i) => { if (match(r.p, key)) send([[BUS, 88], [BUS, rowY(i, rows.length)], [TQ + 90, rowY(i, rows.length)]], seg(u, 1.4, 2.1), GOOD, null); });
    if (k === 4) banner(330, 392, `매칭 ${rows.filter((r) => match(r.p, key)).length} / 전체 ${rows.length} · stock.* 는 2단어라 탈락`, pop(u, 0.4)); }

  // 3. # = 0개 이상 단어
  const KEYS3 = ['stock', 'stock.usd', 'stock.usd.nyse'], PATS3 = ['stock.*', 'stock.#', '*.usd.*', '#.nyse'];
  function s3(t, c) { const { k, u } = c, b = c.beat, key = b.routingKey, rows = b.bindings.filter((x) => x.pattern !== '—').map((x) => ({ q: x.queue, p: x.pattern }));
    if (k === 4) { // * 와 # 비교표: 키 길이를 바꿔 가며 직접 판정
      tx(480, 40, '키의 단어 수를 바꿔 보면', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      KEYS3.forEach((kk, j) => mono(380 + j * 170, 86, kk, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }));
      PATS3.forEach((p, i) => { const y = 132 + i * 52; mono(170, y + 5, p, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: p.includes('#') ? INFO : INK });
        el('line', { x1: 80, y1: y + 26, x2: 880, y2: y + 26, stroke: GRID, 'stroke-width': 1 });
        KEYS3.forEach((kk, j) => { const s = pop(u, 0.2 + i * 0.25 + j * 0.1), x = 380 + j * 170; if (match(p, kk)) check(x, y, 11, s); else cross(x, y, 9, s); }); });
      card(480, 368, 560, 44, { rx: 10, stroke: WARN, sw: 2, text: '단독 # 은 모든 메시지 · 감사용이 아니면 일반 큐에 걸지 않는다', fs: 14, s: pop(u, 1.8) }); return; }
    top('market.topic', key, { es: k === 0 ? pop(u, 0.2) : 1, key: k >= 1, bus: k >= 2 ? rowY(rows.length - 1, rows.length) : null });
    zone(8, 100, 640, 312, '바인딩 패턴');
    if (k === 0) { sub(330, 250, '# 패턴 아직 없음', fade(u, 0.8), { 'font-size': 15 }); return; }
    const judge = k === 1 ? null : k === 2 ? () => E(u, 0.8, 1.8) : () => 1;
    boardRows(rows, key, { dash: k === 1, s: k === 1 ? (i) => pop(u, 0.2 + i * 0.22) : null, judge,
      tubes: k >= 2 ? (i) => (k === 2 ? E(u, 0.2 + i * 0.15, 0.6 + i * 0.15) : 1) : null, fill: (i, ok) => (k === 3 && ok ? E(u, 2.0, 2.5) : 0), hitShow: k === 3 });
    if (k === 1) sub(560, 392, '# 칸은 남은 단어를 통째로 덮는다', fade(u, 1.5), { fill: INFO, 'font-weight': 700 });
    if (k === 2) { const n = Math.round(lerp(0, 5, E(u, 0.2, 1.0))); pill(560, 392, `라우팅 후보 ${n}개`, ACC, 1, { fs: 13.5 }); }
    if (k === 3) { publish(key, rows, u, 0.2); pill(560, 392, '큐 4개 수신 · q.eur 만 제외', GOOD, pop(u, 2.2), { fs: 13.5 }); } }

  // 4. 로그 계층 logs.<level>.<service>
  function s4(t, c) { const { k, u } = c, b = c.beat, key = b.routingKey;
    const rows = [['q.errors', 'logs.error.*'], ['q.auth', 'logs.*.auth'], ['q.archive', 'logs.#'], ['q.all-errors', '*.error.*'], ['q.info', 'logs.info.*']].map(([q, p]) => ({ q, p }));
    if (k === 0) { top('logs.topic', null, { prod: 'App', pw: 84, es: pop(u, 0.2) });
      zone(8, 100, 640, 312, 'routing key 규칙');
      ['logs', '<level>', '<service>'].forEach((w, j) => tile(colX(j) + 4, colX(j + 1) - 4, 150, w, { stroke: INK, s: pop(u, 0.4 + j * 0.15) }));
      ['logs.error.auth', 'logs.info.payment', 'logs.warn.order'].forEach((kk, i) => { const y = 228 + i * 54, s = fade(u, 1.0 + i * 0.3);
        kk.split('.').forEach((w, j) => tile(colX(j) + 4, colX(j + 1) - 4, y, w, { stroke: ACC, fill: ACCBG, color: ACC, op: s })); });
      sub(560, 236, '규칙이 먼저,', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(560, 260, '패턴은 그다음', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    top('logs.topic', key, { prod: 'App', pw: 84, key: k >= 2 && k < 4, bus: rowY(4, 5) });
    zone(8, 100, 640, 312, '관점별 구독');
    if (k === 1) { rows.forEach((r, i) => { const y = rowY(i, 5), s = E(u, 0.2 + i * 0.2, 0.6 + i * 0.2); mono(22, y + 5, r.q, { 'font-size': 15, 'font-weight': 700, opacity: s }); sub(290, y + 5, '— 바인딩 없음 —', s); rowQueue(y, 0, { op: s }); });
      send([[112, 30], [500, 30]], seg(u, 1.4, 2.0), BAD, key); const du = seg(u, 2.0, 2.6); if (du > 0) { env(570, lerp(90, 130, du), BAD, null); }
      pill(330, 392, '지금 발행하면 맞는 바인딩이 없어 전부 버려진다', BAD, pop(u, 2.2), { fs: 13.5 }); return; }
    const k4 = k === 4, key2 = 'logs.warn.order';
    boardRows(rows, k4 ? key2 : key, { s: k === 2 ? (i) => pop(u, 0.2 + i * 0.2) : null, judge: k === 2 ? () => E(u, 1.3, 2.3) : () => 1,
      tubes: () => 1, fill: (i, ok) => (k === 3 && ok ? E(u, 2.0, 2.5) : (k4 && match(rows[i].p, key) ? 1 : 0) + (k4 && ok ? E(u, 1.9, 2.4) : 0)), hitShow: k >= 3 });
    if (k4) keyTiles(key2, 56, { s: (j) => pop(u, 0.2 + j * 0.1) });
    if (k === 3) { publish(key, rows, u, 0.2); pill(330, 392, '한 건 → 에러팀 · 인증팀 · 아카이브 · 크로스필터', GOOD, pop(u, 2.2), { fs: 13.5 }); }
    if (k4) { publish(key2, rows, u, 0.6); pill(330, 392, '새 서비스(order)의 로그도 logs.# 로 자동 수집', INFO, pop(u, 2.2), { fs: 13.5 }); } }

  // 5. 이벤트 계층 domain.region.action
  function s5(t, c) { const { k, u } = c, b = c.beat, key = b.routingKey;
    const rows = [['q.order-svc', 'order.#'], ['q.eu-region', '*.eu.*'], ['q.new-orders', 'order.*.created'], ['q.audit', '#.created']].map(([q, p]) => ({ q, p }));
    if (k === 0) { tx(480, 46, '계층 설계 원칙', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['자주 거르는 축을 앞으로', 'domain > region > action'], ['계층은 3~4단어로 얕게', '패턴이 읽히는 깊이'], ['주문ID 는 key 에 넣지 않는다', 'payload 에 둔다'], ['신규 구독자는 bind 만', '프로듀서는 그대로']].forEach(([a, s2], i) => {
        const x = 250 + (i % 2) * 460, y = 130 + Math.floor(i / 2) * 130, sc = pop(u, 0.2 + i * 0.3);
        card(x - 20, y, 400, 96, { rx: 12, stroke: i === 2 ? WARN : ACC, sw: 2, s: sc });
        tx(x - 20, y - 8, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
        mono(x - 20, y + 22, s2, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      return; }
    if (k === 4) { // key 조립: 세 값이 점으로 이어지고, 주문ID 는 본문으로
      tx(60, 60, 'routing_key = f"{domain}.{region}.{action}"', { 'font-size': 16, class: 'mono', 'font-weight': 700 });
      [['domain', 'order'], ['region', 'eu'], ['action', 'created']].forEach(([n, w], j) => { const sx = 140 + j * 200, ex = colX(j) + CW / 2 + 140, x = lerp(sx, ex, E(u, 0.6, 1.5)), y = lerp(130, 210, E(u, 0.6, 1.5));
        sub(sx, 112, n, 1, { 'font-size': 14 }); tile(x - 42, x + 42, y, w, { stroke: ACC, fill: ACCBG, color: ACC });
        if (j < 2) mono(ex + 46, 218, '.', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) }); });
      card(720, 300, 300, 120, { rx: 12, stroke: INK, sw: 2, s: pop(u, 1.4) });
      sub(720, 262, 'body (JSON)', fade(u, 1.5), { 'font-weight': 700 });
      mono(600, 298, '"order_id": "A-1042"', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
      mono(600, 326, '"total": 88', { 'font-size': 15, opacity: fade(u, 1.7) });
      sub(300, 300, '고카디널리티 값은 key 가 아니라 body 로', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(300, 326, 'content_type = application/json', fade(u, 2.2), { 'font-size': 14 }); return; }
    top('events.topic', key, { prod: 'Service', pw: 100, es: k === 1 ? pop(u, 0.2) : 1, key: k >= 2, bus: k >= 3 ? rowY(3, 4) : null });
    zone(8, 100, 640, 312, '관점별 구독');
    if (k === 1) { sub(330, 250, '구독자 0개 · 다음은 패턴', fade(u, 0.8), { 'font-size': 15 }); return; }
    boardRows(rows, key, { dash: k === 2, s: k === 2 ? (i) => pop(u, 0.2 + i * 0.3) : null, judge: k >= 3 ? () => (k === 3 ? E(u, 1.0, 2.0) : 1) : null,
      tubes: k >= 3 ? (i) => (k === 3 ? E(u, 0.2 + i * 0.2, 0.6 + i * 0.2) : 1) : null, fill: (i, ok) => (k === 5 && ok ? E(u, 2.0, 2.5) : 0), hitShow: k === 5 });
    if (k === 2) sub(560, 392, '네 패턴이 서로 겹친다', fade(u, 1.4));
    if (k === 3) { const n = Math.round(lerp(0, 4, E(u, 0.2, 1.0))); pill(560, 392, `라우팅 후보 ${n}개`, ACC, 1, { fs: 13.5 }); }
    if (k === 5) { publish(key, rows, u, 0.2); pill(330, 392, 'order.eu.created 한 건 → 네 관점이 모두 받는다', GOOD, pop(u, 2.2), { fs: 13.5 }); } }

  const quiz = [
    { q: 'routing key stock.usd.nyse를 Topic exchange는 어떻게 보는가?',
      o: ['한 덩어리 문자열로 보고 그대로 비교한다', '점으로 나뉜 단어 3개로 보고 단어 단위로 비교한다', '첫 단어만 보고 나머지는 무시한다'], a: 1,
      why: 'Topic은 점을 단어 경계로 본다. 그래서 binding key의 * 와 # 가 단어 자리를 대신할 수 있다.' },
    { q: 'stock.* 패턴으로 바인딩한 큐가 stock.usd.nyse 메시지를 받지 못하는 이유는 무엇인가?',
      o: ['* 는 정확히 한 단어라 stock.* 는 2단어 키만 맞는다', '* 는 첫 단어에만 쓸 수 있어서', 'bind 할 때 에러가 나서 바인딩이 없어서'], a: 0,
      why: '단어 수가 3개인 키에 2단어 패턴은 맞지 않는다. bind 자체는 성공하므로 에러 없이 조용히 놓친다.' },
    { q: 'routing key가 stock 한 단어일 때 stock.# 바인딩이 내는 결과는 무엇인가?',
      o: ['맞지 않는다, 뒤에 단어가 하나는 있어야 한다', '바인딩이 무시된다', '맞는다, # 는 0개 단어도 허용한다'], a: 2,
      why: '# 는 0개 이상 단어와 맞는다. 그래서 stock.# 는 stock, stock.usd, stock.usd.nyse를 모두 받는다.' },
    { q: 'logs.error.auth 한 건을 발행했을 때 q.info(logs.info.*)가 받지 못하는 이유는 무엇인가?',
      o: ['q.info가 bind를 하지 않았다', '두 번째 단어가 error와 info로 다르다', 'logs.# 가 먼저 가져가서'], a: 1,
      why: 'logs.info.* 는 두 번째 단어가 info여야 한다. 나머지 네 큐는 패턴이 맞아 각각 한 벌씩 받는다.' },
    { q: '주문ID를 routing key에 넣지 말라는 이유는 무엇인가?',
      o: ['값 종류가 너무 많아 패턴으로 거를 수 없고 계층만 어지러워진다', 'routing key에는 숫자를 쓸 수 없다', '주문ID가 있으면 # 가 동작하지 않는다'], a: 0,
      why: '라우팅 축은 거를 값이어야 한다. 주문마다 다른 값은 payload에 두고 key는 domain.region.action처럼 얕게 둔다.' },
  ];

  const summary = [
    'Topic exchange는 routing key를 점으로 나뉜 단어로 보고 패턴으로 맞춘다.',
    '* 는 정확히 한 단어라서 단어 수가 다르면 bind가 성공해도 메시지를 놓친다.',
    '# 는 0개 이상 단어와 맞으므로 stock.# 는 stock 한 단어 키까지 받는다.',
    '자주 거르는 축을 앞 단어에 두면 새 구독자는 패턴 bind 한 줄로 합류한다.',
  ];
  const review = [
    { q: 'stock.* 로 바인딩한 큐에 stock.usd.nyse 메시지가 하나도 안 온다. 에러 로그도 없다. 먼저 고칠 것은 무엇인가?',
      o: ['패턴을 stock.# 나 stock.*.* 로 바꾼다', 'exchange를 direct로 다시 만든다', '큐를 지우고 같은 이름으로 다시 만든다'], a: 0,
      why: '* 는 한 단어만 대신하므로 3단어 키와 단어 수가 어긋난다. 길이가 자유로우면 #, 3단어로 고정이면 stock.*.* 가 맞다.' },
    { q: '새로 생긴 payment 서비스 로그를 아카이브 팀이 따로 설정 없이 받고 있다. 가능한 이유는 무엇인가?',
      o: ['프로듀서가 아카이브 큐 이름을 알고 직접 보낸다', '아카이브 큐가 logs.# 로 바인딩돼 있다', 'Topic exchange가 모르는 key를 모든 큐에 뿌린다'], a: 1,
      why: 'logs.# 는 logs로 시작하는 모든 키를 받는다. 서비스가 늘어도 바인딩을 더할 필요가 없다.' },
    { q: '유럽 리전 정산 팀이 모든 도메인의 eu 이벤트만 받고 싶다. key가 domain.region.action일 때 걸 패턴은 무엇인가?',
      o: ['eu.#', '#.eu', '*.eu.*'], a: 2,
      why: 'region은 가운데 단어라 앞뒤를 * 로 비운다. eu.# 는 첫 단어가 eu여야 하고 #.eu는 마지막 단어가 eu여야 해서 맞지 않는다.' },
  ];

  R.page({ title: 'Topic 패턴 매칭판', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
