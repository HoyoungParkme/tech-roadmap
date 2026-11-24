/* I-1-1 val vs var — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그리는 것: 변수 칸과 자물쇠(val 잠김 / var 열림), 두 스레드가 같은 balance 를 고치는 시간선,
 * copy 로 이어지는 새 인스턴스, List 와 MutableList 가 내보이는 함수 목록.
 * 잔액 값(1,000 → 800 / 1,500 / 1,300)은 페이지 코드의 -200, +500 에서 나온다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, G, cells, bump } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, p) => s.slice(0, Math.round(s.length * clamp(p)));
  const won = (v) => Math.round(v).toLocaleString('en-US');

  // 자물쇠: 잠김이면 고리가 몸통에 꽂히고, 열림이면 고리가 들린다
  function padlock(cx, cy, locked, col, s) { const g = G(cx, cy, s ?? 1), c = col || INK;
    el('path', { d: locked ? 'M-8,-3 V-11 A8,8 0 0 1 8,-11 V-3' : 'M-8,-3 V-18 A8,8 0 0 1 8,-18 V-13', fill: 'none', stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    el('rect', { x: -12, y: -4, width: 24, height: 19, rx: 4, fill: PANEL, stroke: c, 'stroke-width': 2.6 }, g);
    el('circle', { cx: 0, cy: 5, r: 2.6, fill: c }, g); return g; }
  // 객체 상자: 머리(클래스 이름) + 프로퍼티 줄 [이름, 값, 잠김?, 색?]
  function obj(cx, cy, w, title, rows, o) { o = o || {}; const rh = 40, h = 38 + rows.length * rh, x = cx - w / 2, y = cy - h / 2, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, opacity: op, 'stroke-dasharray': o.dash });
    el('rect', { x, y, width: w, height: 32, rx: 10, fill: o.head || SOFT, opacity: op }); el('line', { x1: x, y1: y + 32, x2: x + w, y2: y + 32, stroke: o.stroke || INK, 'stroke-width': 1.5, opacity: op });
    mono(cx, y + 22, title, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.titleCol || INK, opacity: op });
    rows.forEach(([n, v, lk, col], i) => { const yy = y + 38 + i * rh + rh / 2 - 2, cc = col || (lk ? GOOD : WARN);
      if (lk != null && op > 0.5) padlock(x + 22, yy + 1, lk, cc, 0.8);
      mono(x + (lk != null ? 42 : 14), yy + 5, n, { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op });
      if (v != null) mono(x + w - 14, yy + 5, v, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: o.valCol || cc, opacity: op }); });
    return { x, y, w, h }; }

  // =========================================================
  // 1. 변수 칸 — val 은 잠기고 var 는 열린다
  // =========================================================
  const ROWS = [['val name: String', '"Hoyoung"', true], ['val age: Int', '30', true], ['var count: Int', '0', false], ['val city', '"Seoul"', true, 'String'], ['var score', '0', false, 'Int']];
  const RY = (i) => 60 + i * 62;
  function row(i, o) { o = o || {}; const [name, v, locked] = ROWS[i], y = RY(i), s = o.s ?? 1; if (s <= 0.01) return;
    padlock(58, y, o.open ? false : locked, locked ? GOOD : WARN, s * (1 + (o.bump || 0)));
    mono(88, y + 6, name, { 'font-size': 16, 'font-weight': 700, fill: locked ? INK : WARN, opacity: Math.min(1, s) });
    mono(266, y + 6, '=', { 'font-size': 16, fill: MUT, opacity: Math.min(1, s) });
    card(380, y, 180, 42, { rx: 8, text: o.val ?? v, mono: true, fs: 16, stroke: locked ? INK : WARN, fill: locked ? PANEL : WARNBG, color: INK, s: Math.min(1, s) }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [0, 1].forEach((i) => { const a = 0.6 + i * 0.45, land = a + 0.6, y = RY(i);
        row(i, { s: pop(u, 0.15 + i * 0.25), val: u > land ? null : '', open: u < land, bump: bump(u, land) });
        fly(600, y, 380, y, seg(u, a, land), ROWS[i][1], { mono: true }); });
      card(720, 270, 330, 58, { rx: 12, text: '한 번 대입하면 칸이 잠긴다', fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.9) });
      sub(720, 330, '잠금은 컴파일러가 건다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { row(0); row(1); row(2, { s: pop(u, 0.2) });
      [0, 1, 2].forEach((i) => { const a = 0.8 + i * 0.4, p = E(u, a, a + 0.5), y = RY(i), ok = !ROWS[i][2];
        if (p <= 0) return; const x = lerp(720, ok ? 470 : 545, p);
        if (!(ok && p >= 1)) card(x, y, 96, 32, { rx: 16, text: '다시 대입', fs: 14, fw: 700, stroke: p >= 1 ? (ok ? GOOD : BAD) : MUT, color: p >= 1 ? (ok ? GOOD : BAD) : INK });
        if (p >= 1) { if (ok) check(620, y, 11, pop(u, a + 0.5)); else cross(620, y, 9, pop(u, a + 0.5)); } });
      card(480, 300, 420, 50, { rx: 12, text: 'var 칸만 재할당이 열려 있다', fs: 16, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 2.2) }); return; }
    if (k === 2) { [0, 1, 2].forEach((i) => row(i)); row(3, { s: pop(u, 0.2) }); row(4, { s: pop(u, 0.45) });
      sub(580, 228, '우변으로 추론', fade(u, 0.8), { 'font-size': 14, 'font-weight': 700, fill: INFO });
      [3, 4].forEach((i, j) => { const a = 0.9 + j * 0.45, p = seg(u, a, a + 0.6), y = RY(i);
        if (p < 1) fly(380, y, 580, y, p, ROWS[i][3], { mono: true, fill: INFO }); else pill(580, y, ROWS[i][3], INFO, 1, { mono: true, fs: 15 }); });
      card(790, 130, 270, 76, { rx: 12, text: '타입은 생략해도\n잠금은 val · var가 정한다', fs: 15, stroke: INK, s: pop(u, 2.0) }); return; }
    if (k === 3) { tx(250, 48, 'Java', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, opacity: fade(u, 0.1) });
      tx(700, 48, 'Kotlin', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      el('line', { x1: 480, y1: 30, x2: 480, y2: lerp(30, 300, E(u, 0.1, 0.8)), stroke: GRID, 'stroke-width': 2 });
      tx(40, 128, '잠금', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) }); tx(40, 228, '열림', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      const ja = fade(u, 0.3), ka = fade(u, 1.3);
      padlock(118, 122, true, GOOD, pop(u, 0.3)); spans(144, 128, [['final ', { fill: WARN, 'font-weight': 800 }], ['String name', {}]], { 'font-size': 16, 'font-weight': 700, opacity: ja });
      el('line', { x1: 144, y1: 138, x2: 144 + 54 * E(u, 0.9, 1.3), y2: 138, stroke: WARN, 'stroke-width': 3 });
      sub(172, 166, '한 단어를 더 써야 잠긴다', fade(u, 1.0), { fill: WARN, 'font-weight': 700 });
      padlock(118, 222, false, WARN, pop(u, 0.6)); mono(144, 228, 'String city', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) });
      sub(208, 266, '아무것도 안 붙이면 열린다', fade(u, 1.0), { fill: WARN, 'font-weight': 700 });
      padlock(598, 122, true, GOOD, pop(u, 1.3)); mono(624, 128, 'val name', { 'font-size': 16, 'font-weight': 700, opacity: ka });
      padlock(598, 222, false, WARN, pop(u, 1.6)); mono(624, 228, 'var city', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(700, 266, 'val도 var도 세 글자다', fade(u, 2.0), { fill: INK, 'font-weight': 700 });
      banner(480, 350, 'Kotlin에서는 잠그는 데 드는 글자가 따로 없다', pop(u, 2.3)); return; }
    // k4: 기본값 = val
    [0, 1, 2].forEach((i) => row(i, { bump: bump(u, 0.3 + i * 0.3) }));
    const nL = Math.round(lerp(0, 2, E(u, 0.4, 1.0))), nO = u > 1.0 ? 1 : 0;
    card(770, 92, 190, 64, { rx: 12, stroke: GOOD, fill: GOODBG, s: pop(u, 0.3) }); tx(700, 100, '잠긴 칸', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.4) });
    mono(840, 104, String(nL), { 'font-size': 26, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.4) });
    card(770, 176, 190, 64, { rx: 12, stroke: WARN, fill: WARNBG, s: pop(u, 0.9) }); tx(700, 184, '열린 칸', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
    mono(840, 188, String(nO), { 'font-size': 26, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.0) });
    banner(480, 320, '출발은 val · 재할당이 꼭 필요할 때만 var', pop(u, 1.6)); }

  // =========================================================
  // 2. var 의 함정 — 같은 balance 를 두 스레드가 고친다
  // =========================================================
  const TL = { A: 200, B: 304, x0: 160 };
  const EVA = [[230, '읽기 1,000'], [390, '계산 800'], [550, '쓰기 800']], EVB = [[310, '읽기 1,000'], [470, '계산 1,500'], [710, '쓰기 1,500']];
  function lanes(o) { o = o || {};
    [['Thread A', TL.A, INFO], ['Thread B', TL.B, WARN]].forEach(([n, y, col], i) => { const op = i === 1 ? (o.bOp ?? 1) : 1;
      tx(40, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
      el('line', { x1: TL.x0, y1: y, x2: 920, y2: y, stroke: GRID, 'stroke-width': 2, opacity: op }); });
    tx(920, 362, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); grow(TL.x0, 348, 920, 348, 1, OFF, { sw: 1.5 }); }
  function ev(x, y, s, col, sc, o) { o = o || {}; card(x, y, 124, 44, { rx: 10, text: s, fs: 15, fw: 700, stroke: col, color: o.strike ? OFF : INK, fill: o.fill || PANEL, s: sc });
    if (o.strike && sc >= 1) el('line', { x1: x - 52, y1: y, x2: x + 52, y2: y, stroke: BAD, 'stroke-width': 3 }); }
  function acct(cx, cy, val, o) { o = o || {}; return obj(cx, cy, 280, 'a: Account', [['var balance', val, false]], o); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const s = pop(u, 0.2); if (s > 0.05) acct(560, 150, '1,000');
      [['fun pay()', 80], ['fun refund()', 150], ['다른 파일', 220]].forEach(([n, y], i) => { const a = 0.7 + i * 0.3;
        pill(150, y, n, INK, pop(u, a), { mono: i < 2, fs: 14 }); grow(225, y, 410, 164, E(u, a + 0.2, a + 0.7), WARN, { sw: 2 }); });
      card(560, 300, 380, 50, { rx: 12, text: 'var 프로퍼티는 누구나 고칠 수 있다', fs: 16, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 1.9) }); return; }
    if (k === 1) { acct(600, 120, '1,000');
      padlock(78, 120, true, GOOD, pop(u, 0.2)); card(160, 120, 110, 44, { rx: 10, text: 'val a', mono: true, fs: 16, stroke: GOOD, s: pop(u, 0.2) });
      grow(216, 120, 458, 120, E(u, 0.4, 1.0), GOOD);
      [['Thread A', 270, INFO], ['Thread B', 350, WARN]].forEach(([n, y, col], i) => { const a = 1.0 + i * 0.3;
        pill(110, y, n, col, pop(u, a), { fs: 15 }); grow(170, y - 8, 560, 168, E(u, a + 0.2, a + 0.8), col, { dash: '6 5' }); });
      card(700, 300, 380, 70, { rx: 12, text: '참조 a는 잠겼지만\n안의 balance는 열려 있다', fs: 15, stroke: INK, s: pop(u, 2.0) }); return; }
    if (k === 4) { acct(480, 64, '???', { valCol: BAD });
      [['1,300', '순서대로 실행', GOOD], ['1,500', 'A의 쓰기가 덮임', BAD], ['800', 'B의 쓰기가 덮임', BAD]].forEach(([v, d, col], i) => { const x = 180 + i * 300, s = pop(u, 0.3 + i * 0.4);
        card(x, 210, 240, 120, { rx: 14, stroke: col, fill: i ? BADBG : GOODBG, sw: 2.4, s });
        mono(x, 210, v, { 'font-size': 32, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.4) });
        tx(x, 246, d, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
      banner(480, 350, '실행할 때마다 답이 달라진다 · race condition', pop(u, 1.9)); return; }
    // k2·k3: 시간선
    const p = c.prev || {}, cur = c.beat.cells[c.beat.cells.length - 1].value, before = p.cells ? p.cells[p.cells.length - 1].value : '1,000';
    const num = (s) => +String(s).replace(/,/g, ''), wt = k === 2 ? 1.5 : 1.5, v = lerp(num(before), num(cur), E(u, wt, wt + 0.5));
    acct(480, 64, won(v), { valCol: WARN });
    lanes({ bOp: k === 2 ? 0.35 : 1 });
    EVA.forEach(([x, s], i) => ev(x, TL.A, s, INFO, k === 2 ? pop(u, 0.3 + i * 0.6) : 1, { strike: k === 3 && i === 2 && u > 2.0 }));
    if (k === 2) { el('line', { x1: EVA[0][0], y1: TL.A - 24, x2: EVA[0][0], y2: 100, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.4) });
      grow(EVA[2][0], TL.A - 24, EVA[2][0] - 40, 104, E(u, 1.5, 2.0), INFO);
      sub(480, 400, '대입 한 줄 = 읽기 · 계산 · 쓰기 세 동작', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    EVB.forEach(([x, s], i) => ev(x, TL.B, s, WARN, pop(u, 0.3 + i * 0.6)));
    el('line', { x1: EVB[0][0], y1: TL.B - 24, x2: EVB[0][0], y2: 100, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.4) });
    grow(EVB[2][0], TL.B - 24, 600, 104, E(u, 1.5, 2.0), BAD);
    sub(480, 400, 'B는 A가 쓰기 전에 1,000을 읽었다 · A의 800이 덮인다', fade(u, 2.1), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // =========================================================
  // 3. val 의 안전 — 재할당은 빌드에서 막히고, 변화는 새 인스턴스
  // =========================================================
  const inst = (cx, cy, name, v, o) => obj(cx, cy, 220, name, [['val balance', v, true]], o);
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const sw = E(u, 1.0, 1.4), g = obj(330, 150, 400, 'data class Account', [['', null, null]], { dash: '7 5', stroke: ACC, titleCol: ACC });
      const y = 167, lk = u > 1.4;
      padlock(g.x + 26, y + 1, lk, lk ? GOOD : WARN, 0.9 * (1 + bump(u, 1.4)));
      mono(g.x + 50, y + 6, (u < 1.0 ? 'var' : 'val') + ' balance: Int', { 'font-size': 16, 'font-weight': 700, fill: u < 1.0 ? WARN : INK, opacity: fade(u, 0.2) });
      if (u > 0.7 && u < 1.2) el('line', { x1: g.x + 48, y1: y, x2: g.x + 48 + 30 * E(u, 0.7, 0.95), y2: y, stroke: BAD, 'stroke-width': 3, opacity: 1 - sw });
      card(750, 150, 280, 70, { rx: 12, text: '값은 생성자에서\n한 번만 정해진다', fs: 15, stroke: GOOD, color: INK, s: pop(u, 1.7) });
      sub(330, 280, '세터(setter)가 만들어지지 않는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { obj(200, 150, 260, 'data class Account', [['val balance: Int', null, true]], { dash: '7 5', stroke: ACC, titleCol: ACC, op: 0.75 });
      pill(470, 92, 'Account(balance = 1_000)', ACC, pop(u, 0.3), { mono: true, fs: 14 }); grow(340, 150, 600, 150, E(u, 0.5, 1.1), ACC);
      if (u > 1.0) inst(730, 150, 'a1', '1,000', { op: fade(u, 1.0, 0.3) });
      sub(730, 240, '끝날 때까지 1,000 그대로', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 2) { inst(200, 110, 'a1', '1,000');
      const p = E(u, 0.2, 0.8); if (p > 0) card(lerp(620, 420, p), 110, 190, 36, { rx: 18, text: 'a1.balance = 800', mono: true, fs: 14, fw: 700, stroke: p >= 1 ? BAD : INK, color: p >= 1 ? BAD : INK });
      if (u > 0.8) cross(540, 110, 10, pop(u, 0.8));
      const ST = [[150, '소스 코드'], [480, '컴파일'], [810, '실행']];
      ST.forEach(([x, n], i) => card(x, 290, 170, 56, { rx: 12, text: n, fs: 16, stroke: i === 1 && u > 1.7 ? BAD : i === 2 && u > 1.7 ? OFF : INK, color: i === 2 && u > 1.7 ? OFF : INK, fill: i === 1 && u > 1.7 ? BADBG : PANEL, s: pop(u, 0.9 + i * 0.15) }));
      grow(236, 290, 394, 290, E(u, 1.1, 1.4), MUT); grow(566, 290, 724, 290, E(u, 1.1, 1.4), OFF, { dash: '5 5' });
      dot([[236, 290], [400, 290]], seg(u, 1.3, 1.75), BAD, 8);
      pill(480, 360, 'Val cannot be reassigned', BAD, pop(u, 1.8), { mono: true, fs: 14 });
      sub(810, 340, '여기까지 오지 않는다', fade(u, 2.2), { 'font-size': 14, fill: MUT, 'font-weight': 700 }); return; }
    if (k === 3) { const X = [150, 480, 810];
      [['a1', '1,000'], ['a2', '800'], ['a3', '1,300']].forEach(([n, v], i) => { if (i === 0 || u > 0.9 + (i - 1) * 0.7) inst(X[i], 200, n, v, { op: i ? fade(u, 0.9 + (i - 1) * 0.7, 0.3) : 1 }); });
      [['copy(balance - 200)', 0.4], ['copy(balance + 500)', 1.1]].forEach(([s, a], i) => { grow(X[i] + 112, 200, X[i + 1] - 112, 200, E(u, a, a + 0.5), ACC);
        mono((X[i] + X[i + 1]) / 2, 128, s, { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, a) }); });
      sub(150, 290, 'a1은 1,000 그대로', fade(u, 2.1), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      sub(645, 340, '변화 = 새 인스턴스 · 이전 값은 남는다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4: 두 스레드가 각자 자기 결과를 받는다
    inst(480, 80, 'a1 (공유)', '1,000');
    [['Thread A', 180, INFO, 'a1.copy(-200)', '800'], ['Thread B', 780, WARN, 'a1.copy(+500)', '1,500']].forEach(([n, x, col, op, v], i) => { const a = 0.3 + i * 0.4;
      pill(x, 170, n, col, pop(u, a), { fs: 15 }); grow(x < 480 ? 370 : 590, 96, x, 152, E(u, a, a + 0.4), col, { dash: '5 5' });
      mono(x, 220, op, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, a + 0.4) });
      if (u > a + 0.8) obj(x, 290, 200, '새 Account', [['val balance', v, true]], { op: fade(u, a + 0.8, 0.3) }); });
    grow(480, 300, 480, 128, E(u, 1.7, 2.1), BAD, { dash: '4 5' }); if (u > 2.1) cross(480, 200, 10, pop(u, 2.1));
    sub(480, 330, '덮어쓸 공유 칸이 없다', fade(u, 2.3), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // =========================================================
  // 4. 컬렉션 — List 는 add 가 없고 MutableList 는 있다
  // =========================================================
  const LIST_FN = ['get(i)', 'size', 'contains(x)', 'map { }'], MUT_FN = ['add(x)', 'remove(x)', 'set(i, x)'];
  function fnPanel(x, y, title, mut, o) { o = o || {}; const n = LIST_FN.length + MUT_FN.length, h = 46 + n * 30, op = o.op ?? 1;
    el('rect', { x, y, width: 230, height: h, rx: 12, fill: PANEL, stroke: mut ? WARN : GRID, 'stroke-width': 2, opacity: op });
    mono(x + 14, y + 26, title, { 'font-size': 15, 'font-weight': 800, fill: mut ? WARN : INK, opacity: op });
    LIST_FN.forEach((f, i) => mono(x + 22, y + 58 + i * 30, f, { 'font-size': 15, fill: INK, opacity: op * (o.sh ? o.sh(i) : 1) }));
    MUT_FN.forEach((f, i) => { const yy = y + 58 + (LIST_FN.length + i) * 30, s = o.sh ? o.sh(LIST_FN.length + i) : 1;
      mono(x + 22, yy, f, { 'font-size': 15, 'font-weight': mut ? 700 : 400, fill: mut ? WARN : OFF, opacity: op * s });
      if (!mut && s > 0) el('line', { x1: x + 18, y1: yy - 5, x2: x + 26 + tw(f, 15), y2: yy - 5, stroke: OFF, 'stroke-width': 2, opacity: op * s }); }); }
  function listRow(x, y, name, type, vals, o) { o = o || {};
    padlock(x - 18, y + 22, true, GOOD, o.ls ?? 1);
    mono(x + 4, y - 10, name, { 'font-size': 15, 'font-weight': 700, opacity: o.op ?? 1 }); mono(x + 4 + tw(name, 15) + 12, y - 10, type, { 'font-size': 14, fill: o.typeCol || INFO, 'font-weight': 700, opacity: o.op ?? 1 });
    cells(x + 10, y, vals, { w: 52, h: 44, style: o.style }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { listRow(90, 110, 'val nums', 'List<Int>', [1, 2, 3], { style: (i) => ({ s: pop(u, 0.2 + i * 0.15) }) });
      fnPanel(680, 40, 'List<Int>', false, { sh: (i) => fade(u, 0.8 + i * 0.1) });
      el('line', { x1: 290, y1: 96, x2: 290, y2: 168, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: fade(u, 1.5) });
      const p = E(u, 1.5, 2.0); if (p > 0) card(lerp(560, 360, p), 132, 120, 34, { rx: 17, text: 'nums.add(4)', mono: true, fs: 14, fw: 700, stroke: p >= 1 ? BAD : INK, color: p >= 1 ? BAD : INK });
      if (u > 2.0) cross(440, 92, 9, pop(u, 2.0));
      pill(240, 240, 'Unresolved reference: add', BAD, pop(u, 2.2), { mono: true, fs: 14 });
      sub(240, 290, 'List 타입에는 add가 없다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { listRow(90, 70, 'val nums', 'List<Int>', [1, 2, 3], { op: 0.6 });
      const s4c = E(u, 0.8, 1.4);
      listRow(90, 200, 'val xs', 'MutableList<Int>', [1, 2, 3, s4c > 0 ? 4 : null], { typeCol: WARN, style: (i) => (i === 3 ? { s: s4c > 0 ? pop(u, 0.8) : 0.001, stroke: WARN, fill: WARNBG } : { s: pop(u, 0.2 + i * 0.12) }) });
      el('rect', { x: 92, y: 197, width: 240, height: 54, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.5) });
      padlock(352, 222, false, WARN, pop(u, 1.5));
      sub(220, 300, '변수 xs는 잠김 · 원소는 열림', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      fnPanel(680, 40, 'MutableList<Int>', true, { sh: (i) => (i < LIST_FN.length ? 1 : fade(u, 0.4 + (i - LIST_FN.length) * 0.2)) }); return; }
    if (k === 2) { zone(330, 70, 330, 250, 'fun sum(xs: List<Int>)', { fill: SOFT, stroke: INFO, sw: 2, color: INFO });
      [['nums', '[1, 2, 3]', 130, '6'], ['xs', '[1, 2, 3, 4]', 260, '10']].forEach(([n, v, y, r], i) => { const a = 0.2 + i * 0.5;
        pill(150, y, n + ' ' + v, i ? WARN : INK, pop(u, a), { mono: true, fs: 14 });
        dot([[235 + i * 18, y], [340, 200]], seg(u, a + 0.3, a + 0.8), i ? WARN : INFO, 7);
        grow(660, 200, 790, y, E(u, 1.6 + i * 0.2, 2.0 + i * 0.2), GOOD);
        mono(830, y + 9, r, { 'font-size': 26, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9 + i * 0.2) }); });
      spans(360, 150, [['xs.sum()', { 'font-weight': 700 }], ['   ✓ 읽기', { fill: GOOD, 'font-weight': 700 }]], { 'font-size': 15, opacity: fade(u, 1.0) });
      spans(360, 210, [['xs.add(5)', { fill: OFF }], ['  ✗ 없음', { fill: BAD, 'font-weight': 700 }]], { 'font-size': 15, opacity: fade(u, 1.3) });
      sub(495, 290, '받는 쪽이 List면 고칠 길이 없다', fade(u, 1.5), { 'font-size': 14, fill: INK, 'font-weight': 700 });
      sub(830, 330, 'sum 결과', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { const IX = 80, OX = 640, Y = 170;
      listRow(IX, Y, 'val nums', 'List<Int>', [1, 2, 3]);
      card(480, Y + 22, 150, 56, { rx: 12, text: '{ it * 2 }', mono: true, fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      const outV = [2, 4, 6];
      mono(OX + 4, Y - 10, 'val doubled', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      cells(OX + 10, Y, outV.map((v, i) => (u > 0.9 + i * 0.4 + 0.6 ? v : null)), { w: 52, h: 44, style: (i) => ({ stroke: u > 1.5 + i * 0.4 ? ACC : GRID }) });
      [1, 2, 3].forEach((v, i) => { const a = 0.5 + i * 0.4, x0 = IX + 36 + i * 58;
        fly(x0, Y + 22, 410, Y + 22, seg(u, a, a + 0.4), String(v), { mono: true, fill: INFO });
        fly(550, Y + 22, OX + 36 + i * 58, Y + 22, seg(u, a + 0.4, a + 0.8), String(outV[i]), { mono: true }); });
      sub(170, 270, 'nums는 [1, 2, 3] 그대로', fade(u, 2.1), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      sub(740, 270, '새 List<Int>', fade(u, 2.1), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    // k4: 공개 지점
    zone(30, 40, 430, 330, '겉만 List', { stroke: BAD, sw: 2, color: BAD, fill: BADBG });
    zone(500, 40, 430, 330, '밖에는 toList() 사본', { stroke: GOOD, sw: 2, color: GOOD, fill: GOODBG });
    const L1 = E(u, 0.9, 1.3) > 0, L2 = E(u, 1.7, 2.1) > 0;
    mono(60, 100, 'val ys: List<Int>', { 'font-size': 15, 'font-weight': 700 }); mono(60, 124, '  = mutableListOf(1, 2, 3)', { 'font-size': 14, fill: MUT });
    cells(70, 150, [1, 2, 3, L1 ? 4 : null], { w: 52, h: 44, style: (i) => (i === 3 ? { stroke: BAD, fill: BADBG, s: L1 ? pop(u, 0.9) : 0.001 } : {}) });
    pill(250, 270, '(ys as MutableList).add(4)', BAD, pop(u, 0.4), { mono: true, fs: 13.5 }); grow(250, 252, 250, 200, E(u, 0.6, 0.9), BAD);
    sub(245, 330, '같은 객체라 원본이 바뀐다', fade(u, 1.3), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    mono(530, 100, '내부: users', { 'font-size': 15, 'font-weight': 700 }); cells(540, 112, [1, 2, 3], { w: 44, h: 38 });
    mono(740, 100, 'all() 사본', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
    cells(750, 112, [1, 2, 3, L2 ? 4 : null], { w: 40, h: 38, style: (i) => (i === 3 ? { stroke: WARN, s: L2 ? pop(u, 1.7) : 0.001 } : { s: pop(u, 0.3 + i * 0.1) }) });
    pill(715, 260, '(all() as MutableList).add(4)', WARN, pop(u, 1.2), { mono: true, fs: 13.5 }); grow(800, 242, 800, 160, E(u, 1.4, 1.7), WARN);
    sub(715, 330, '사본만 바뀌고 내부는 그대로', fade(u, 2.1), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }

  // =========================================================
  // 5. 실무 기본값 — val · List · copy
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const hit = u > 1.6;
      padlock(380, 110, false, WARN, pop(u, 0.2)); mono(404, 116, 'var name', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      card(600, 110, 120, 42, { rx: 8, text: hit ? '?' : '"A"', mono: true, fs: 16, stroke: WARN, fill: WARNBG, s: pop(u, 0.3) * (1 + bump(u, 1.6)) });
      padlock(380, 210, false, WARN, pop(u, 0.4)); mono(404, 216, 'var users', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) });
      card(640, 210, 200, 42, { rx: 8, text: 'MutableList 그대로 공개', fs: 14, stroke: WARN, fill: WARNBG, s: pop(u, 0.5) });
      [['rename()', 60], ['다른 함수', 160], ['다른 스레드', 260]].forEach(([n, y], i) => { const a = 0.8 + i * 0.25;
        pill(110, y, n, INK, pop(u, a), { fs: 14, mono: i === 0 }); grow(175, y, 535, i === 0 ? 110 : 120, E(u, a + 0.1, a + 0.6), BAD, { sw: 2 }); });
      card(480, 340, 420, 50, { rx: 12, text: '언제 누가 바꿨는지 추적할 길이 없다', fs: 16, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.0) }); return; }
    if (k === 1) {
      obj(480, 170, 360, 'data class User', [['val id: Long', null, true], ['val name: String', null, true], ['val email: String', null, true]], { op: fade(u, 0.1, 0.3) });
      [0, 1, 2].forEach((i) => { if (u > 0.5 + i * 0.3) check(700, 140 + i * 40, 9, pop(u, 0.5 + i * 0.3)); });
      sub(480, 300, '세터가 없다 · 만든 뒤로 절대 안 바뀐다', fade(u, 1.6), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      sub(480, 334, '그래서 여러 곳에 그대로 넘겨도 안전하다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { zone(260, 60, 420, 260, 'class UserRepository', { stroke: INK, sw: 2, color: INK, fill: SOFT });
      mono(290, 116, 'private val users', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      cells(300, 132, ['u1', 'u2', u > 0.9 ? 'u3' : null], { w: 60, h: 44, style: (i) => ({ stroke: WARN, fill: i === 2 ? WARNBG : PANEL, s: i === 2 ? (u > 0.9 ? pop(u, 0.9) : 0.001) : pop(u, 0.2 + i * 0.1) }) });
      pill(130, 154, 'add(user)', INK, pop(u, 0.4), { mono: true, fs: 14 }); grow(190, 154, 296, 154, E(u, 0.5, 0.9), MUT);
      mono(290, 236, 'fun all(): List<User>', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      mono(290, 262, '  = users.toList()', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) });
      grow(680, 220, 750, 220, E(u, 1.5, 1.9), GOOD);
      cells(752, 198, ['u1', 'u2', 'u3'], { w: 52, h: 44, style: (i) => ({ stroke: GOOD, s: pop(u, 1.8 + i * 0.1) }) });
      sub(830, 268, '밖에서는 읽기만', fade(u, 2.2), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 3) { obj(210, 180, 300, 'val u1: User', [['id', '1', true], ['name', '"Hoyoung"', true], ['email', '"a@b.c"', true]]);
      const on = u > 0.5;
      if (on) obj(750, 180, 320, 'val u2: User', [['id', '1', true], ['name', '"Hoyoung Park"', true, ACC], ['email', '"a@b.c"', true]], { op: fade(u, 0.5, 0.3) });
      [0, 2].forEach((i, j) => grow(364, 160 + i * 40, 586, 160 + i * 40, E(u, 0.9 + j * 0.3, 1.4 + j * 0.3), MUT, { dash: '5 5' }));
      pill(480, 200, 'copy(name = …)', ACC, pop(u, 1.4), { mono: true, fs: 14 });
      sub(210, 300, 'u1은 "Hoyoung" 그대로', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      sub(750, 300, '바뀐 곳은 name 하나', fade(u, 2.2), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    // k4: 체크리스트
    const L = [['val 기본', '재할당이 필요한지 먼저 묻는다', true], ['List 기본', 'MutableList는 예외로 둔다', true], ['data class + copy', '변화를 새 인스턴스로 적는다', true], ['var 남용', '디버깅과 동시성 문제의 뿌리', false]];
    L.forEach(([a, b, ok], i) => { const y = 70 + i * 76, s = pop(u, 0.2 + i * 0.4);
      card(480, y, 600, 62, { rx: 12, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, sw: 2, s });
      if (ok) check(214, y, 11, s); else cross(214, y, 9, s);
      tx(246, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: ok ? INK : BAD, opacity: fade(u, 0.3 + i * 0.4) });
      tx(760, y + 6, b, { 'font-size': 15, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'val로 선언한 변수에 값을 다시 대입하면 어떻게 되는가?',
      o: ['실행 중에 예외가 난다', '경고만 뜨고 새 값이 들어간다', '컴파일 에러로 빌드가 멈춘다'], a: 2,
      why: 'val 칸은 컴파일러가 잠근다. 재할당은 실행하기 전에 "Val cannot be reassigned"로 막힌다.' },
    { q: 'balance 1,000에 Thread A가 200을 빼고 Thread B가 500을 더한다. 나올 수 없는 최종값은 무엇인가?',
      o: ['1,000', '1,300', '1,500'], a: 0,
      why: '순서대로면 1,300, 한쪽 쓰기가 덮이면 800이나 1,500이다. 두 스레드가 모두 쓰므로 1,000이 남는 경우는 없다.' },
    { q: 'val balance를 그대로 둔 채 잔액 800을 나타내는 방법은 무엇인가?',
      o: ['a1.copy(balance = 800)으로 새 인스턴스를 만든다', 'a1.balance = 800으로 덮어쓴다', 'a1을 지우고 같은 이름으로 다시 선언한다'], a: 0,
      why: 'val 프로퍼티는 다시 대입할 수 없다. copy가 balance만 바꾼 새 Account를 돌려주고 a1은 1,000으로 남는다.' },
    { q: 'val xs = mutableListOf(1, 2, 3) 다음에 xs.add(4)를 부르면 어떻게 되는가?',
      o: ['val이라 컴파일 에러가 난다', 'xs가 [1, 2, 3, 4]가 된다', '새 리스트가 생기고 xs는 [1, 2, 3]이다'], a: 1,
      why: 'val은 변수 xs를 다른 리스트로 바꾸지 못하게 할 뿐이다. 원소 추가는 MutableList 타입이 열어 둔다.' },
    { q: '클래스 안의 사용자 목록을 밖에 내줄 때 알맞은 모양은 무엇인가?',
      o: ['var users: MutableList를 그대로 공개한다', 'val users: MutableList를 그대로 공개한다', 'private val users를 두고 all()에서 toList() 사본을 준다'], a: 2,
      why: '가변 목록은 클래스 안에 가두고 밖에는 읽기 전용 사본만 준다. 그러면 바깥 코드가 내부 목록을 바꿀 길이 없다.' },
  ];

  const summary = [
    'val로 선언한 칸은 다시 대입할 수 없고, 컴파일러가 빌드 단계에서 막는다.',
    '두 스레드가 var balance를 함께 고치면 결과가 1,300, 800, 1,500 중 무엇일지 모른다.',
    '값을 바꾸는 대신 copy로 새 인스턴스를 만들면 원래 객체는 그대로 남는다.',
    'val은 변수만 잠근다. 원소까지 막으려면 List 타입으로 받고 밖에는 사본을 준다.',
  ];
  const review = [
    { q: 'val로 선언한 설정 목록이 실행 중에 바뀌어 있었다. 먼저 의심할 것은 무엇인가?',
      o: ['컴파일러가 val 잠금을 놓쳤다', '목록이 MutableList라 어딘가에서 add를 불렀다', 'val 변수가 다른 리스트로 재할당됐다'], a: 1,
      why: 'val 변수의 재할당은 컴파일에서 막힌다. 원소가 바뀌었다면 가변 컬렉션 타입이 열려 있던 것이다.' },
    { q: '잔액이 가끔 틀린다. Account의 var balance를 두 스레드가 고친다. 고치는 방향으로 알맞은 것은 무엇인가?',
      o: ['balance를 val로 두고 변화는 copy로 새 Account를 만든다', '두 스레드의 실행 순서가 매번 같기를 기대한다', '테스트를 여러 번 돌려 틀린 값이 안 나오는지 본다'], a: 0,
      why: '공유된 가변 칸이 있으니 읽기와 쓰기가 끼어든다. val로 바꾸면 덮어쓸 칸이 사라지고 변화는 새 인스턴스로 드러난다.' },
    { q: 'fun report(items: List<Int>)에 MutableList를 넘겼다. 함수 안에서 할 수 있는 일은 무엇인가?',
      o: ['items.add(0)으로 호출자의 목록을 늘린다', 'items에 다른 리스트를 다시 대입한다', 'items.map { it * 2 }로 새 리스트를 만든다'], a: 2,
      why: 'List 타입에는 add가 없고 매개변수는 다시 대입할 수 없다. 읽기와 새 리스트 만들기만 된다.' },
  ];

  R.page({ title: 'val과 var의 칸', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
