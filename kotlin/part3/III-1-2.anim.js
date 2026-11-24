/* III-1-2 async와 await — 병렬 처리 · 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(fun|val|var|suspend|return|if|else|for|while|in|try|catch|finally|class|private|import|throw|null|true|false|object|when)$/;
  function ktok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  function code(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, op = o.op ?? 1;
    const w = o.w || Math.max(...lines.map((s) => R.tw(s, fs))) + 36, h = lines.length * lh + 18;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': o.stroke ? 2 : 1.5, opacity: op });
    lines.forEach((s, i) => { const base = y + 12 + fs + i * lh, dim = o.dim && o.dim.includes(i);
      if (o.hi && o.hi.includes(i)) el('rect', { x: x + 6, y: base - fs - 2, width: w - 12, height: lh, rx: 4, fill: o.hiCol || ACCBG, opacity: op });
      R.spans(x + 16, base, ktok(s), { 'font-size': fs, opacity: op * (dim ? 0.35 : 1) }); });
    return { w, h, lh, row: (i) => y + 12 + fs + i * lh }; }
  function coro(cx, cy, name, st, o) { o = o || {};
    const col = { run: ACC, pause: INFO, done: GOOD, cancel: BAD, wait: WARN }[st] || ACC, fill = { run: ACCBG, pause: PANEL, done: GOODBG, cancel: BADBG, wait: WARNBG }[st] || ACCBG;
    const w = o.w || R.tw(name, 14) + 30, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -16, width: w, height: 32, rx: 16, fill, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': st === 'pause' ? '5 4' : null }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, class: 'mono' }, g); return g; }
  // 간트 차트: 시간축 [0, max] ms 를 x0 ~ x0+w 에. 줄마다 이름 + 계획(점선) + 지난 구간(채움)
  function gantt(o) { const { x0, w, max, rows, y0, gap } = o, X = (v) => x0 + (clamp(v, 0, max) / max) * w, ay = y0 + rows * gap - gap / 2 + 6;
    el('line', { x1: x0, y1: ay, x2: x0 + w, y2: ay, stroke: MUT, 'stroke-width': 1.5 });
    (o.ticks || []).forEach((v) => { el('line', { x1: X(v), y1: ay, x2: X(v), y2: ay + 6, stroke: MUT }); mono(X(v), ay + 24, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    return { X, Y: (i) => y0 + i * gap, ay }; }
  function track(G, i, name, a, b, now, st, o) { o = o || {}; const y = G.Y(i), col = { run: ACC, c2: INFO, c3: GOOD, err: BAD, cancel: OFF, wait: WARN }[st] || ACC;
    if (name) mono(G.X(0) - 12, y + 5, name, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: o.nameCol || INK });
    if (o.plan !== false) el('rect', { x: G.X(a), y: y - 12, width: Math.max(1, G.X(b) - G.X(a)), height: 24, rx: 5, fill: 'none', stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', opacity: o.op ?? 1 });
    const e = Math.min(now, b); if (e > a) el('rect', { x: G.X(a), y: y - 12, width: G.X(e) - G.X(a), height: 24, rx: 5, fill: col, opacity: 0.6 * (o.op ?? 1) }); }
  function playhead(G, now, top, label) { const x = G.X(now); el('line', { x1: x, y1: top, x2: x, y2: G.ay, stroke: INK, 'stroke-width': 1.3, 'stroke-dasharray': '3 3' });
    if (label) mono(x, top - 8, Math.round(now) + 'ms', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' }); }
  const NAMES = ['fetchUser', 'fetchOrder', 'fetchPayment'], COLS = ['run', 'c2', 'c3'];

  // ---------- 1. 순차 호출 — 한 잔 받고 다음 잔 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 3) { // 의존성이 있으면 순차가 맞다
      const G = gantt({ x0: 300, w: 500, max: 200, rows: 2, y0: 120, gap: 80 });
      const now = lerp(0, 200, E(u, 0.2, 2.2));
      track(G, 0, 'fetchUser', 0, 100, now, 'run'); track(G, 1, 'fetchOrderForUser', 100, 200, now, 'c2');
      if (now > 100) { fly(G.X(100), G.Y(0), G.X(100) + 30, G.Y(1), seg(u, 1.1, 1.6), 'user', { mono: true, stay: true, fill: ACC }); }
      tx(G.X(100) + 70, G.Y(0) + 46, 'user 가 있어야 시작할 수 있다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      banner(480, 330, '의존성이 있으면 순차가 정답', pop(u, 2.0)); return; }
    const G = gantt({ x0: 200, w: 640, max: 300, rows: 3, y0: 96, gap: 64, ticks: [0, 100, 200, 300] });
    const now = k === 0 ? lerp(0, 100, E(u, 0.2, 2.2)) : k === 1 ? lerp(100, 300, E(u, 0.2, 2.4)) : 300;
    NAMES.forEach((n, i) => track(G, i, n, i * 100, i * 100 + 100, now, COLS[i], { op: k === 0 && i > 0 ? 0.45 : 1 }));
    playhead(G, now, 56, true);
    if (k === 0) tx(G.X(150), G.Y(1) + 5, '아직 시작 못 함', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8) });
    if (k === 1) [1, 2].forEach((i) => { if (now >= i * 100) grow(G.X(i * 100), G.Y(i - 1) + 12, G.X(i * 100), G.Y(i) - 12, seg(now, i * 100, i * 100 + 12), INK, { sw: 1.8 }); });
    if (k === 2) { // 세 값이 Triple 로 묶이고, 의존성이 없었으니 100ms 면 충분했다
      [1, 2].forEach((i) => { el('rect', { x: G.X(0), y: G.Y(i) - 12, width: G.X(100) - G.X(0), height: 24, rx: 5, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) });
        grow(G.X(i * 100) - 4, G.Y(i), G.X(100) + 6, G.Y(i), seg(u, 1.2 + i * 0.2, 1.8 + i * 0.2), GOOD, { sw: 2 }); });
      el('path', { d: `M${G.X(100)},${G.ay + 36} v8 H${G.X(300)} v-8`, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.8) });
      tx(G.X(200), G.ay + 66, '200ms 는 기다리기만 했다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      card(100, 370, 170, 36, { rx: 8, stroke: INK, text: 'Triple(…)', fs: 15, mono: true, s: pop(u, 0.4) }); } }

  // ---------- 2. async — 주문서 세 장을 한꺼번에 ----------
  function s2(t, c) { const { k, u } = c;
    const zg = k === 0 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: 36, y: 40, width: 500 * zg, height: 300, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: 0.5 + 0.5 * zg });
    mono(56, 70, 'coroutineScope {', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.8) : 1 });
    const n = [0, 1, 3, 3][k], pn = k ? [0, 1, 3, 3][k - 1] : 0, cnt = tween(pn, n, c.u);
    tx(740, 58, '실행 중 코루틴', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700 });
    mono(740, 104, Math.round(cnt) + '개', { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 800, fill: n ? ACC : MUT });
    if (k === 0) { tx(286, 200, '자식 코루틴을 담을 경계', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(286, 228, '아직 시작된 작업은 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) }); return; }
    const vars = ['userDef', 'orderDef', 'paymentDef'], types = ['Deferred<User>', 'Deferred<Order>', 'Deferred<Payment>'];
    for (let i = 0; i < 3; i++) { if (k === 1 && i > 0) break;
      const y = 160 + i * 66, born = k === 1 || (k === 2 && i > 0), s = born ? pop(u, 0.2 + (k === 2 ? (i - 1) * 0.4 : 0)) : 1;
      if (s <= 0) continue;
      coro(150, y, 'async { ' + NAMES[i] + ' }', 'run', { s, w: 210 });
      // 돌고 있다는 표시: 막대가 계속 차오른다
      const run = ((t * 0.35 + i * 0.2) % 1);
      el('rect', { x: 270, y: y - 6, width: 120, height: 12, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.2, opacity: s });
      el('rect', { x: 270, y: y - 6, width: 120 * run, height: 12, rx: 6, fill: COLS[i] === 'run' ? ACC : COLS[i] === 'c2' ? INFO : GOOD, opacity: 0.7 * s });
      // 번호표(Deferred) 가 오른쪽 변수 칸으로
      const fu = born ? seg(u, 0.6 + (k === 2 ? (i - 1) * 0.4 : 0), 1.4 + (k === 2 ? (i - 1) * 0.4 : 0)) : 1;
      const tx0 = lerp(400, 740, E(fu, 0, 1));
      if (fu > 0) { card(tx0, y + 50 - 50, 190, 34, { rx: 6, stroke: INFO, fill: INFOBG, text: types[i], fs: 13.5, mono: true });
        if (fu >= 1) mono(630, y + 5, vars[i], { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end' }); }
      if (k === 3) { lock(860, y, true, MUT, pop(u, 0.3 + i * 0.25)); mono(890, y + 6, '?', { 'font-size': 18, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.4 + i * 0.25) }); } }
    if (k === 2) tx(286, 380, '기다리는 줄이 없어 셋이 같이 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
    if (k === 3) { tx(740, 380, 'await 을 부르기 전엔 값을 꺼낼 수 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
      tx(286, 380, '진행 중 3개 · 받은 값 0개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); } }

  // ---------- 3. await — 합이 아니라 최댓값 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 3) { // 순차 합 vs 병렬 최댓값
      const x0 = 260, W = 600, sc = W / 300;
      [['순차 (합)', 300, BAD, '100 + 100 + 100 = 300ms'], ['병렬 (최댓값)', 100, GOOD, 'max(100, 100, 100) = 100ms']].forEach(([n, v, col, f], i) => { const y = 110 + i * 110, g = E(u, 0.2 + i * 0.5, 1.2 + i * 0.5);
        tx(x0 - 16, y + 6, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
        el('rect', { x: x0, y: y - 16, width: v * sc * g, height: 32, rx: 6, fill: col, opacity: 0.7 });
        if (i === 0) [1, 2].forEach((j) => el('line', { x1: x0 + j * 100 * sc, y1: y - 16, x2: x0 + j * 100 * sc, y2: y + 16, stroke: PANEL, 'stroke-width': 3, opacity: g > j / 3 ? 1 : 0 }));
        mono(x0, y + 44, f, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.8 + i * 0.5) }); });
      banner(480, 352, '300ms → 100ms · 3배 빠르다', pop(u, 2.0)); return; }
    const G = gantt({ x0: 230, w: 600, max: 300, rows: 4, y0: 92, gap: 58, ticks: [0, 100, 200, 300] });
    const seq = k === 4, now = k === 0 ? lerp(0, 8, E(u, 0.2, 1.5)) : k === 1 ? lerp(8, 100, E(u, 0.2, 1.8)) : k === 2 ? 100 : lerp(0, 300, E(u, 0.2, 2.4));
    NAMES.forEach((n, i) => track(G, i, n, seq ? i * 100 : 0, seq ? i * 100 + 100 : 100, now, COLS[i], { op: k === 0 ? fade(u, 0.2 + i * 0.25) : 1 }));
    // 넷째 줄: loadAll 본문 코루틴이 무엇을 하는지
    const by = G.Y(3); mono(G.X(0) - 12, by + 5, '본문', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: MUT });
    if (!seq) { el('rect', { x: G.X(0), y: by - 12, width: Math.max(1, G.X(Math.min(now, 100)) - G.X(0)), height: 24, rx: 5, fill: PANEL, stroke: INFO, 'stroke-width': 1.6, 'stroke-dasharray': '4 3', opacity: k >= 1 ? 1 : 0 });
      if (k >= 1) mono(G.X(0) + 10, by + 5, 'userDef.await() 일시중단', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      // 받은 값
      const got = [k >= 1 && now >= 99, k >= 2, k >= 2];
      ['user', 'order', 'payment'].forEach((v, i) => { const s = k === 1 && i === 0 ? pop(u, 1.9) : k === 2 && i > 0 ? pop(u, 0.2 + (i - 1) * 0.15) : got[i] ? 1 : 0;
        if (s > 0) pill(G.X(100) + 50 + i * 100, by, v, GOOD, s, { mono: true, fs: 13.5 }); });
      if (k === 2) { tx(G.X(100) + 150, 352, '이미 끝나 있어 기다림 없이 바로', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
        card(800, by + 0, 140, 32, { rx: 8, text: 'Triple', fs: 14.5, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 1.4) }); }
    } else { mono(G.X(0) + 10, by + 5, 'async { … }.await() 를 한 줄에', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 });
      [1, 2].forEach((i) => { if (now >= i * 100) grow(G.X(i * 100), G.Y(i - 1) + 12, G.X(i * 100), G.Y(i) - 12, seg(now, i * 100, i * 100 + 12), BAD, { sw: 1.8 }); }); }
    playhead(G, now, 60, true); }

  // ---------- 4. 예외 전파 — 하나가 깨지면 전부 취소 ----------
  function s4(t, c) { const { k, u } = c;
    const G = gantt({ x0: 230, w: 560, max: 100, rows: 3, y0: 120, gap: 62, ticks: [0, 40, 100] });
    const sup = k === 5, now = k === 0 ? lerp(0, 15, E(u, 0.2, 1.6)) : k === 1 ? lerp(15, 30, E(u, 0.2, 1.6)) : k === 2 ? lerp(30, 40, E(u, 0.1, 0.6)) : sup ? lerp(40, 100, E(u, 0.4, 2.2)) : 40;
    // 위: 부모 스코프
    const scopeNm = sup ? 'supervisorScope' : 'coroutineScope', hot = !sup && k >= 2 && (k > 2 || u > 0.7);
    card(G.X(40), 52, 210, 36, { rx: 18, text: scopeNm, fs: 15, mono: true, stroke: hot ? BAD : ACC, fill: hot ? BADBG : ACCBG, color: hot ? BAD : ACC });
    const vis = [true, k >= 1, k >= 2];
    NAMES.forEach((n, i) => { if (!vis[i]) return; const end = i === 1 ? 40 : 100;
      const cut = !sup && k >= 2 && i !== 1 && (k > 2 || u > 1.3);
      track(G, i, n, 0, end, cut ? Math.min(now, 40) : now, i === 1 ? 'err' : COLS[i], { op: k === 2 && i === 2 ? fade(u, 0.1) : 1 });
      if (cut) { cross(G.X(40) + 14, G.Y(i), 10, pop(u, k === 2 ? 1.3 : 0)); mono(G.X(40) + 34, G.Y(i) + 5, '취소', { 'font-size': 14, 'font-weight': 800, fill: BAD }); }
      if (sup && i !== 1 && now >= 99) check(G.X(100) + 20, G.Y(i), 10, pop(u, 2.2)); });
    if (k === 1) { const s = pop(u, 0.6); pill(G.X(40), G.Y(1) - 30, '40ms 에 throw', BAD, s, { fs: 13.5 }); }
    if (k >= 2 && now >= 39.9) { // 폭발
      const b = k === 2 ? pop(u, 0.6) : 1; const g = R.G(G.X(40), G.Y(1), b);
      for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4; el('line', { x1: Math.cos(a) * 10, y1: Math.sin(a) * 10, x2: Math.cos(a) * 20, y2: Math.sin(a) * 20, stroke: BAD, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); }
      mono(G.X(40) + 30, G.Y(1) + 5, 'IOException', { 'font-size': 14, 'font-weight': 800, fill: BAD }); }
    if (k === 2) { dot([[G.X(40), G.Y(1) - 14], [G.X(40), 70]], seg(u, 0.7, 1.1), BAD, 7);
      [0, 2].forEach((i) => dot([[G.X(40) - 30, 70], [G.X(40) - 30, G.Y(i)]], seg(u, 1.1, 1.4), BAD, 6));
      tx(G.X(70), 58, '예외가 위로, 취소가 아래로', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); }
    playhead(G, now, 96, false);
    if (k === 3 || k === 4) { // 아래: 본문과 호출부
      const L = k === 3 ? ['val user    = userDef.await()     // 여기서 멈춘 채 취소', 'val order   = orderDef.await()', 'val payment = paymentDef.await()'] : ['try { val r = loadAll(1) }', 'catch (e: IOException) { log.error(…) }'];
      const cd = code(120, 322, L, { fs: 13.5, w: 520, dim: k === 3 ? [1, 2] : [], hi: k === 4 ? [1] : [0], hiCol: k === 4 ? GOODBG : BADBG });
      if (k === 3) fly(G.X(40), 70, 820, 360, seg(u, 0.6, 1.6), 'IOException', { stay: true, fill: BAD, mono: true });
      if (k === 3) tx(820, 400, 'coroutineScope 가 다시 던진다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      if (k === 4) { fly(820, 330, 660, cd.row(1) - 5, seg(u, 0.3, 1.2), 'IOException', { stay: false, fill: BAD, mono: true }); check(680, cd.row(1) - 5, 12, pop(u, 1.3));
        tx(820, 370, '호출부 한 곳에서 잡는다', { 'text-anchor': 'middle', 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) }); } }
    if (sup) tx(480, 360, '형제는 끝까지 돌고, 실패는 orderDef.await() 에서만 드러난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); }

  // ---------- 5. awaitAll · supervisorScope ----------
  function mini(x, y, title, fail, mode, u, t0) { // mode: 'all'(전부 취소) | 'sup'(실패만 null)
    tx(x, y, title, { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: mode === 'all' ? BAD : GOOD });
    for (let i = 0; i < 4; i++) { const yy = y + 24 + i * 36, g = E(u, t0, t0 + 1.2), bad = i === 1, w = 180;
      const len = bad ? Math.min(g, 0.45) : mode === 'all' ? Math.min(g, 0.45) : g;
      el('rect', { x, y: yy, width: w, height: 22, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1.4 });
      el('rect', { x, y: yy, width: w * len, height: 22, rx: 4, fill: bad ? BAD : mode === 'all' && g > 0.45 ? OFF : COLS[i % 3] === 'c2' ? INFO : ACC, opacity: 0.65 });
      mono(x - 8, yy + 16, 'item ' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 3) { mini(130, 70, 'coroutineScope', 1, 'all', u, 0.2); mini(600, 70, 'supervisorScope', 1, 'sup', u, 0.2);
      tx(220, 260, '하나 실패 → 전체 취소 + 예외', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
      tx(690, 260, '실패한 것만 따로, 형제는 계속', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      banner(480, 340, '차이는 자식 실패를 부모로 올리는가 하나', pop(u, 2.0)); return; }
    if (k === 4) { // 요구사항 → 스코프
      [['전부 성공해야 의미가 있다', 'coroutineScope', BAD, '예: 결제 화면에 필요한 세 값'], ['되는 만큼 많이 모으면 된다', 'supervisorScope + try/catch', GOOD, '예: 사용자 목록 미리보기']].forEach(([q, a, col, ex], i) => {
        const y = 110 + i * 130, s = pop(u, 0.2 + i * 0.6);
        card(230, y, 300, 56, { rx: 12, stroke: INK, text: q, fs: 16, s });
        grow(384, y, 520, y, seg(u, 0.5 + i * 0.6, 0.9 + i * 0.6), col);
        card(700, y, 330, 52, { rx: 26, stroke: col, fill: col === BAD ? BADBG : GOODBG, text: a, fs: 15, mono: true, color: col, s: pop(u, 0.9 + i * 0.6) });
        sub(700, y + 46, ex + ' (예시)', fade(u, 1.1 + i * 0.6)); });
      return; }
    // k 0~2: ids → async × 4 → awaitAll → 결과 목록
    const sup = k >= 1, x0 = 60;
    if (sup) { const zg = k === 1 ? E(u, 0.2, 0.9) : 1; el('rect', { x: 180, y: 40, width: 470 * zg, height: 330, rx: 14, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': '7 5' });
      mono(196, 64, 'supervisorScope {', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: k === 1 ? fade(u, 0.8) : 1 }); }
    mono(x0 + 28, 92, 'ids', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT });
    for (let i = 0; i < 4; i++) { const y = 120 + i * 58, fail = k === 2 && i === 1;
      R.cells(x0, y - 20, [i + 1], { w: 56, h: 40 });
      const s = k === 0 ? seg(u, 0.2 + i * 0.1, 0.6 + i * 0.1) : 1;
      grow(x0 + 60, y, 214, y, s, MUT, { sw: 1.6 });
      coro(290, y, 'async', fail ? 'cancel' : 'run', { w: 100, op: s > 0.9 ? 1 : 0 });
      const g = k === 0 ? E(u, 0.8, 1.8) : k === 2 ? E(u, 0.2, 1.4) : 1, len = fail ? Math.min(g, 0.5) : g;
      el('rect', { x: 350, y: y - 9, width: 150, height: 18, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1.3, opacity: s });
      el('rect', { x: 350, y: y - 9, width: 150 * len, height: 18, rx: 4, fill: fail ? BAD : i % 2 ? INFO : ACC, opacity: 0.65 });
      if (fail) { cross(520, y, 9, pop(u, 0.9)); mono(540, y + 5, 'catch', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) }); }
      // 결과 칸
      const done = k === 0 ? fade(u, 2.0) : k === 2 ? fade(u, 1.5) : 1, val = fail ? 'null' : 'User' + (i + 1);
      card(800, y, 110, 40, { rx: 6, text: val, fs: 14.5, mono: true, stroke: fail ? BAD : GOOD, fill: fail ? BADBG : GOODBG, color: fail ? BAD : INK, op: done }); }
    grow(660, 207, 735, 207, k === 0 ? seg(u, 1.8, 2.1) : 1, GOOD);
    mono(698, 196, 'awaitAll()', { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
    mono(800, 92, sup ? 'List<User?>' : 'List<User>', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: sup && k === 1 ? WARN : INK });
    if (k === 0) tx(350, 380, 'ids.map 이 id 마다 async 를 띄우고 모두 같이 돈다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
    if (k === 2) tx(800, 380, '성공 3 · 실패 1', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: '서로 의존성이 없는 100ms 짜리 suspend 호출 세 개를 순서대로 부르면 모두 얼마나 걸리는가?',
      o: ['100ms', '300ms', '150ms'], a: 1,
      why: 'suspend 호출도 한 줄씩 결과를 받은 뒤 다음 줄로 간다. 그래서 100 + 100 + 100 = 300ms다.' },
    { q: 'async { fetchUser(userId) }가 바로 돌려주는 것은 무엇인가?',
      o: ['작업이 끝났다는 Boolean', 'User 값', '나중에 User가 될 약속인 Deferred<User>'], a: 2,
      why: 'async는 코루틴을 시작만 하고 번호표 같은 Deferred를 준다. 값은 await을 불러야 꺼낼 수 있다.' },
    { q: '다음 중 다시 300ms가 걸리는 코드는 무엇인가?',
      o: ['줄마다 async { … }.await()를 붙여 쓴다', 'async 셋을 먼저 띄우고 await 셋을 나중에 부른다', 'awaitAll로 세 Deferred를 기다린다'], a: 0,
      why: '같은 줄에서 await 하면 그 결과가 올 때까지 다음 async가 시작되지 않아 순차와 같아진다.' },
    { q: 'coroutineScope 안에서 orderDef가 40ms에 IOException을 던지면 userDef와 paymentDef는 어떻게 되나?',
      o: ['끝까지 돌고 값을 돌려준다', '40ms에 함께 취소된다', 'await을 부를 때까지 아무 영향이 없다'], a: 1,
      why: '자식의 예외가 부모 스코프로 올라가 스코프가 취소되고, 그 취소가 형제에게 내려간다. 예외는 호출부에서 한 번 잡는다.' },
    { q: '사용자 4명을 불러오다 1명이 실패해도 나머지 3명은 보여 주고 싶다. 알맞은 조합은?',
      o: ['supervisorScope와 async 안의 try/catch', 'coroutineScope와 awaitAll만', 'runBlocking으로 하나씩'], a: 0,
      why: 'supervisorScope에서는 자식 실패가 형제로 번지지 않는다. 실패를 null로 바꾸면 결과는 List<User?> 로 [User1, null, User3, User4]처럼 모인다.' },
  ];

  const summary = [
    '독립된 100ms 호출 세 개를 차례로 부르면 300ms가 걸리고 그중 200ms는 기다리기만 한다.',
    'async는 코루틴을 바로 시작하고 Deferred를 준다. 값은 await으로 꺼낸다.',
    '셋을 먼저 띄우고 나중에 await 하면 합이 아닌 최댓값인 100ms에 끝난다.',
    'coroutineScope는 자식 하나가 실패하면 모두 취소하고, supervisorScope는 형제를 살린다.',
  ];
  const review = [
    { q: '대시보드가 API 네 개를 순서대로 불러 400ms가 걸린다. 네 호출은 서로 결과를 쓰지 않는다. 먼저 할 일은?',
      o: ['await을 async 바로 뒤에 붙인다', '넷을 async로 먼저 띄우고 나중에 await 한다', 'API마다 runBlocking을 쓴다'], a: 1,
      why: '의존성이 없으면 동시에 시작할 수 있다. 다 같이 돌면 가장 느린 호출 하나만큼만 걸린다.' },
    { q: '결제 화면에 user·order·payment가 모두 있어야 하는데 order가 실패했다. 어떤 동작이 맞는가?',
      o: ['payment 만이라도 화면에 그린다', 'order를 null로 두고 계속 진행한다', 'coroutineScope가 나머지를 취소하고 호출부가 예외를 한 번 잡는다'], a: 2,
      why: '전부 있어야 의미가 있는 작업이라 하나가 실패하면 나머지 일은 낭비다. coroutineScope가 형제를 취소하고 예외를 호출부로 올려 준다.' },
    { q: 'supervisorScope로 바꿨는데 async 안에서 예외를 잡지 않고 awaitAll()을 불렀다. 실패가 하나 있으면 어떻게 되나?',
      o: ['awaitAll이 그 예외를 던져 목록을 받지 못한다', '실패한 자리는 자동으로 null이 된다', '실패한 항목만 빠진 목록이 나온다'], a: 0,
      why: 'supervisorScope는 형제 취소를 막을 뿐 예외를 값으로 바꿔 주지 않는다. 실패를 null로 바꾸려면 async 안에서 try/catch가 필요하다.' },
  ];

  R.page({ title: '실행 타임라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
