/* III-1-1 LINQ — 쿼리·메서드 구문 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 페이지 코드와 dotnet 10 실행 결과(같은 products 5건)에서 가져왔다:
 *   전자 3건·재고 13 / 가구 2건·재고 15, 길이순 9·10·11자, Where 람다 호출 0→5→15→20,
 *   Any 는 2건만 보고 멈춤(Count()>0 은 5건), Sum(Price*Stock) = 13250 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, dbIcon, lock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // products 5건 (코드 L5–11)
  const P = [['노트북', '전자', 1200, 5], ['마우스', '전자', 25, 0], ['책상', '가구', 300, 12], ['의자', '가구', 150, 3], ['모니터', '전자', 400, 8]];
  const catCol = (c) => (c === '전자' ? INFO : WARN), catBg = (c) => (c === '전자' ? INFOBG : WARNBG);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 상품 한 줄 카드: 이름 + 분류 칩 + 가격
  function prod(cx, cy, i, o) { o = o || {}; const [n, cat, price] = P[i], w = o.w || 200, s = o.s ?? 1, op = o.op ?? 1;
    if (s <= 0 || op <= 0) return;
    card(cx, cy, w, 34, { rx: 7, s, op, stroke: o.stroke || GRID, sw: o.sw || 1.8, fill: o.fill });
    tx(cx - w / 2 + 12, cy + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: op * clamp(s), fill: o.color || INK });
    card(cx - w / 2 + 92, cy, 44, 22, { rx: 11, text: cat, fs: 13.5, fw: 700, stroke: 'none', fill: catBg(cat), color: catCol(cat), op: op * clamp(s) });
    mono(cx + w / 2 - 12, cy + 5, String(price), { 'font-size': 14, 'text-anchor': 'end', opacity: op * clamp(s), fill: o.color || INK }); }
  // 문자열 칩 (투영 결과)
  const str = (cx, cy, s, o) => { o = o || {}; card(cx, cy, o.w || tw(s, 14) + 30, 32, { rx: 16, text: s, fs: 14, fw: 700, stroke: o.stroke || ACC, color: o.color || ACC, fill: o.fill || ACCBG, s: o.s, op: o.op, mono: o.mono }); };

  // ---------- 1. 두 구문 ----------
  const TX = 205, TY = (i) => 128 + i * 44;
  function table(k, u, o) { o = o || {};
    zone(40, 62, 330, 300, 'products : List<Product>', { fill: SOFT });
    P.forEach((_, i) => prod(TX, TY(i), i, { w: 290, s: o.fill ? pop(u, 0.2 + i * 0.25) : 1, op: o.op ? o.op(i) : 1, stroke: o.hot ? o.hot(i) : GRID, sw: o.hot && o.hot(i) !== GRID ? 2.6 : 1.8 })); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      card(250, 92, 380, 46, { rx: 10, text: 'record Product(Name, Category, Price, Stock)', fs: 14.5, mono: true, s: pop(u, 0.2), stroke: INK });
      sub(250, 136, '질의 대상 한 줄의 모양', fade(u, 0.6));
      card(250, 262, 230, 56, { rx: 10, text: 'IEnumerable<T>', fs: 16, mono: true, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.8) });
      const ms = ['.Where', '.Select', '.OrderBy', '.GroupBy', '.First', '.Any'];
      ms.forEach((m, i) => { const cx = 560, cy = 150 + i * 46, s = pop(u, 1.3 + i * 0.15);
        grow(366, 262, cx - 58, cy, E(u, 1.2 + i * 0.15, 1.6 + i * 0.15), GRID, { plain: true, sw: 1.6 });
        pill(cx, cy, m, ACC, s, { mono: true, fs: 14.5, fill: PANEL }); });
      note(660, 250, 'using System.Linq가', fade(u, 2.2), { fill: ACC }); note(660, 276, '열어 주는 확장 메서드', fade(u, 2.2), { fill: ACC });
      return; }
    table(k, u, { fill: k === 1,
      op: (i) => (k >= 2 && P[i][1] === '가구' ? (k === 2 ? 1 - 0.7 * E(u, 0.9, 1.6) : 0.3) : k >= 4 ? 0.55 : 1),
      hot: (i) => (k >= 2 && k <= 3 && P[i][1] === '전자' ? ACC : GRID) });
    if (k === 1) { note(420, 150, '전자', fade(u, 1.6), { fill: INFO, 'font-size': 18, 'font-weight': 800 }); mono(470, 150, '3건', { 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      note(420, 190, '가구', fade(u, 1.9), { fill: WARN, 'font-size': 18, 'font-weight': 800 }); mono(470, 190, '2건', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.9) });
      note(420, 250, '모든 질의의 출발점', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 2 || k === 3) {
      // 거름망: 표 오른쪽 세로 막대
      el('rect', { x: 384, y: 100, width: 12, height: 240, rx: 6, fill: ACC, opacity: k === 2 ? fade(u, 0.2) : 1 });
      if (k === 2) pill(620, 80, '.Where(p => p.Category == "전자")', ACC, pop(u, 0.3), { mono: true, fs: 14, fill: PANEL });
      P.forEach((p, i) => { if (p[1] === '가구') { cross(392, TY(i), 9, k === 2 ? pop(u, 1.0 + i * 0.1) : 1); } });
      const keep = [0, 1, 4];
      keep.forEach((i, j) => { const ty = 150 + j * 56;
        if (k === 2) { grow(398, TY(i), 470, ty, E(u, 1.2 + j * 0.2, 1.8 + j * 0.2), ACC); prod(600, ty, i, { w: 230, s: pop(u, 1.6 + j * 0.2), stroke: ACC }); }
        else { prod(600, ty, i, { w: 230, op: 1 - E(u, 0.4, 1.2) * 0.65, stroke: ACC });
          fly(600, ty, 830, ty, seg(u, 0.6 + j * 0.25, 1.4 + j * 0.25), P[i][0], { fill: ACC });
          if (u > 1.4 + j * 0.25) str(830, ty, P[i][0], { w: 100 }); } });
      if (k === 2) note(470, 340, 'for · if를 한 줄도 쓰지 않았다', fade(u, 2.2), { fill: MUT });
      if (k === 3) { pill(720, 80, '.Select(p => p.Name)', ACC, pop(u, 0.2), { mono: true, fs: 14, fill: PANEL });
        note(560, 340, 'Product → string  (투영)', fade(u, 1.8), { fill: ACC, 'font-size': 16 }); }
      return; }
    // k 4~5: 두 구문 나란히
    const code = (x, y, title, lines, show, col) => { zone(x, y, 400, 120, title, { fill: PANEL, stroke: col, sw: 2 });
      lines.forEach((l, i) => { const f = clamp(show - i); if (f <= 0) return; mono(x + 18, y + 52 + i * 24, l.slice(0, Math.round(l.length * f)), { 'font-size': 14 }); }); };
    const mth = ['products', '  .Where(p => p.Category == "전자")', '  .Select(p => p.Name)'];
    const qry = ['from p in products', 'where p.Category == "전자"', 'select p.Name'];
    code(400, 40, '메서드 구문', mth, 3, ACC);
    code(400, 186, '쿼리 구문', qry, k === 4 ? E(u, 0.3, 2.0) * 3 : 3, INFO);
    if (k === 4) { note(400, 345, 'SQL을 닮았지만 하는 일은 같다', fade(u, 2.2), { fill: MUT }); return; }
    grow(810, 100, 870, 170, E(u, 0.2, 0.8), ACC); grow(810, 246, 870, 200, E(u, 0.2, 0.8), INFO);
    card(880, 186, 120, 64, { rx: 10, text: '같은\n메서드 호출', fs: 14, s: pop(u, 0.8), stroke: INK });
    ['노트북', '마우스', '모니터'].forEach((n, i) => str(470 + i * 120, 365, n, { w: 100, s: pop(u, 1.4 + i * 0.2) }));
    note(820, 370, '성능 차이 없음', fade(u, 2.1), { fill: GOOD, 'font-weight': 800 }); }

  // ---------- 2. 파이프라인 ----------
  const COL = [95, 335, 575, 825], GATE = [215, 455, 700], RY = (i) => 120 + i * 50;
  const LONG = ['노트북 · ₩1200', '마우스 · ₩25', '책상 · ₩300', '의자 · ₩150', '모니터 · ₩400'];
  function gates(on, names) { names.forEach((g, i) => { const x = GATE[i], o = on[i]; if (!g) return;
      el('line', { x1: x, y1: 92, x2: x, y2: 360, stroke: o ? ACC : GRID, 'stroke-width': o ? 4 : 2.5, 'stroke-dasharray': o ? null : '6 6' });
      pill(x, 66, g, o ? ACC : MUT, 1, { mono: true, fs: 13.5, fill: PANEL }); }); }
  function s2(t, c) { const { k, u } = c;
    const good = ['Where(전자)', 'Select(요약)', 'OrderBy(길이)'];
    if (k === 4) { // 거꾸로 둔 순서
      gates([true, true, false], ['Select(요약)', 'Where(Ok)', '']);
      P.forEach((p, i) => { prod(COL[0], RY(i), i, { w: 170 });
        const t0 = 0.2 + i * 0.22; fly(COL[0] + 60, RY(i), COL[1], RY(i), seg(u, t0, t0 + 0.5), '변환', { fill: WARN });
        if (u > t0 + 0.5) str(COL[1], RY(i), LONG[i], { w: 170, stroke: WARN, color: INK, fill: WARNBG, s: pop(u, t0 + 0.5) }); });
      const n = Math.min(5, Math.floor(E(u, 0.2, 1.4) * 5 + 0.0001));
      mono(COL[1], 380, `Expensive 호출 ${n}번`, { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      [0, 1, 4].forEach((i, j) => { if (u > 1.6) str(COL[2], RY(j) + 25, LONG[i], { w: 170, s: pop(u, 1.6 + j * 0.15) }); });
      [2, 3].forEach((i) => cross(COL[1] + 100, RY(i), 10, pop(u, 1.9)));
      note(COL[2] - 80, 380, '2건은 변환해 놓고 버린다', fade(u, 2.1), { fill: BAD });
      note(700, 300, 'Where 먼저면 3번', fade(u, 2.3), { fill: GOOD }); return; }
    gates([k >= 1, k >= 2, k === 5], good);
    // 원본 열
    P.forEach((p, i) => prod(COL[0], RY(i), i, { w: 170, s: k === 0 ? pop(u, 0.2 + i * 0.2) : 1, op: k >= 1 && p[1] === '가구' ? 0.35 : 1 }));
    if (k === 0) { note(300, 390, '입구에 5건. 아직 어느 단계도 지나지 않았다', fade(u, 1.6), { fill: MUT }); return; }
    // Where 통과 3건
    const kept = [0, 1, 4];
    kept.forEach((i, j) => { const y = RY(j) + 25;
      if (k === 1) { fly(COL[0] + 110, RY(i), COL[1], y, seg(u, 0.3 + j * 0.3, 1.1 + j * 0.3), P[i][0], { fill: ACC }); if (u > 1.1 + j * 0.3) prod(COL[1], y, i, { w: 170, stroke: ACC }); }
      else prod(COL[1], y, i, { w: 170, stroke: ACC, op: k === 5 ? 0.5 : 1 }); });
    if (k === 1) { [2, 3].forEach((i) => cross(COL[0] + 100, RY(i), 10, pop(u, 1.6)));
      mono(COL[1], 385, `${Math.round(lerp(5, 3, E(u, 1.0, 2.0)))}건`, { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); return; }
    // Select 결과
    const sel = [0, 1, 4];
    sel.forEach((i, j) => { const y = RY(j) + 25;
      if (k === 2) { fly(COL[1] + 110, y, COL[2], y, seg(u, 0.3 + j * 0.35, 1.0 + j * 0.35), '→ 문자열', { fill: ACC }); if (u > 1.0 + j * 0.35) str(COL[2], y, LONG[i], { w: 170, s: pop(u, 1.0 + j * 0.35) }); }
      else str(COL[2], y, LONG[i], { w: 170, op: k === 5 ? 0.5 : 1 }); });
    if (k === 2) { mono(COL[2], 385, `변환 ${Math.min(3, Math.floor(E(u, 0.3, 1.8) * 3 + 0.001))}번`, { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); return; }
    if (k === 3) { [0, 1, 2].forEach((j) => card(COL[3], RY(j) + 25, 170, 32, { rx: 16, dash: '5 5', stroke: GRID, text: '?', fs: 15, color: MUT, s: pop(u, 0.3 + j * 0.15) }));
      R.clock(COL[3], 300, 22, E(u, 0.6, 2.6) * 0.3, INFO);
      note(COL[3] - 90, 360, '연결만 했다 · 계산 0번', fade(u, 1.2), { fill: INFO }); return; }
    // k5: foreach 가 끌어당긴다
    pill(COL[3], 330, 'foreach', INK, pop(u, 0.1), { mono: true, fs: 15 });
    for (let j = 0; j < 3; j++) dot([[COL[1] + 85, RY(j) + 25], [COL[2] - 85, RY(j) + 25], [COL[2] + 85, RY(j) + 25], [COL[3] - 85, 175]], seg(u, 0.2 + j * 0.25, 1.1 + j * 0.25), ACC, 6);
    const order = [[1, 9], [4, 10], [0, 11]];
    order.forEach(([i, len], j) => { const y = RY(j) + 25, s = pop(u, 1.4 + j * 0.3);
      str(COL[3], y, LONG[i], { w: 170, s, fill: GOODBG, stroke: GOOD, color: INK }); mono(COL[3] + 96, y + 5, `${len}자`, { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.5 + j * 0.3) }); });
    note(COL[2] - 70, 385, '열거하는 순간 파이프라인 전체가 돈다', fade(u, 2.2), { fill: GOOD }); }

  // ---------- 3. 지연 실행 ----------
  const LINES = ['var nums = new List<int> {1,2,3,4};', 'var q = nums.Where(n => n > 2);', 'nums.Add(99);', 'foreach (var n in q) …', 'q.Count();  foreach (q) …', 'var fixedList = q.ToList();'];
  const EVAL = [0, 0, 0, 5, 15, 20];   // dotnet 10 실측: Where 람다 누적 호출 수
  function s3(t, c) { const { k, u } = c;
    // 왼쪽: 코드 줄
    LINES.forEach((l, i) => { if (i > k) return; const y = 66 + i * 54, on = i === k;
      card(210, y, 360, 40, { rx: 8, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.5, fill: on ? ACCBG : PANEL, s: on ? pop(u, 0.1) : 1 });
      mono(42, y + 5, l, { 'font-size': 13.5, fill: on ? INK : MUT });
      const ran = i === 0 || i >= 3; tx(404, y + 5, ran ? '실행' : '정의만', { 'font-size': 13.5, 'font-weight': 700, fill: ran ? GOOD : WARN, 'text-anchor': 'end', opacity: on ? fade(u, 0.6) : 1 }); });
    // 오른쪽 위: nums 칸
    const nx = 470, cw = 56, vals = k >= 2 ? [1, 2, 3, 4, 99] : [1, 2, 3, 4];
    tx(nx, 58, 'nums', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    vals.forEach((v, i) => { const s = k === 0 ? pop(u, 0.3 + i * 0.2) : k === 2 && i === 4 ? pop(u, 0.4) : 1;
      card(nx + 28 + i * (cw + 6), 92, cw, 42, { rx: 6, text: String(v), fs: 16, mono: true, stroke: i === 4 ? ACC : INK, color: i === 4 ? ACC : INK, s }); });
    // 계산 횟수 계기
    const ev = tween(k > 0 ? EVAL[k - 1] : 0, EVAL[k], u, 1.6);
    card(840, 92, 160, 70, { rx: 10, stroke: k >= 3 ? ACC : GRID, sw: 2 });
    tx(772, 74, 'Where 람다 호출', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    mono(840, 112, String(Math.round(ev)), { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', fill: k >= 3 ? ACC : MUT });
    if (k === 0) { note(470, 190, '컬렉션 생성은 바로 실행된다', fade(u, 1.4), { fill: MUT }); return; }
    // q 질의 카드: 결과가 아니라 "할 일" + nums 를 가리키는 화살표
    card(620, 210, 250, 54, { rx: 10, text: 'q : 질의 (할 일만 담김)', fs: 14.5, stroke: WARN, fill: WARNBG, s: k === 1 ? pop(u, 0.3) : 1 });
    grow(620, 183, 620, 116, k === 1 ? E(u, 0.8, 1.4) : 1, k === 2 ? ACC : MUT, { dash: '6 5' });
    if (k === 1) { note(470, 300, '값을 복사하지 않고 nums를 가리킨다', fade(u, 1.6), { fill: WARN }); return; }
    if (k === 2) { note(470, 300, 'q는 99가 들어간 nums를 그대로 본다', fade(u, 1.0), { fill: ACC }); return; }
    // 열거: 칸을 훑으며 > 2 인 것만 결과로
    const scans = k === 3 ? 1 : k === 4 ? 2 : 1, out = [3, 4, 99];
    const scanU = k === 5 ? E(u, 0.2, 1.4) : E(u, 0.2, 2.2);
    const pos = (scanU * scans * 5) % 5, which = Math.min(scans - 1, Math.floor(scanU * scans * 5 / 5 - 1e-9));
    if (scanU < 1) el('rect', { x: nx + 2 + Math.floor(pos) * (cw + 6), y: 68, width: cw + 4, height: 48, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 3 });
    tx(470, 300, k === 5 ? 'fixedList  (지금 계산해 고정)' : '열거 결과', { 'font-size': 14.5, 'font-weight': 700, fill: k === 5 ? GOOD : MUT });
    out.forEach((v, i) => { const s = k === 3 ? pop(u, 0.5 + [2, 3, 4][i] * 0.36) : k === 5 ? pop(u, 0.4 + i * 0.25) : 1;
      card(nx + 28 + i * (cw + 6), 340, cw, 42, { rx: 6, text: String(v), fs: 16, mono: true, stroke: k === 5 ? GOOD : ACC, fill: k === 5 ? GOODBG : PANEL, color: INK, s }); });
    if (k === 4) { mono(690, 345, 'Count() = 3', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      mono(690, 372, '그리고 또 한 바퀴', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.6) });
      tx(840, 155, '+10', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 5) { lock(690, 360, true, GOOD, pop(u, 1.2)); mono(720, 366, 'fixedList.Count → +0', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); } }

  // ---------- 4. 주요 연산자 ----------
  const OX = (i) => 110 + i * 185, OY = 82;
  function prow(o) { o = o || {}; P.forEach((p, i) => { const x = OX(i), hot = o.hot && o.hot(i), op = o.op ? o.op(i) : 1;
      card(x, OY, 160, 62, { rx: 9, stroke: hot || GRID, sw: hot ? 3 : 1.6, fill: hot === BAD ? BADBG : hot === GOOD ? GOODBG : PANEL, op });
      tx(x - 66, OY - 6, p[0], { 'font-size': 15, 'font-weight': 700, opacity: op });
      card(x + 48, OY - 11, 44, 22, { rx: 11, text: p[1], fs: 13.5, fw: 700, stroke: 'none', fill: catBg(p[1]), color: catCol(p[1]), op });
      mono(x - 66, OY + 20, `₩${p[2]} · 재고 ${p[3]}`, { 'font-size': 13.5, fill: MUT, opacity: op }); }); }
  function cursor(i, col) { el('path', { d: `M${OX(i) - 9},${OY - 52} L${OX(i) + 9},${OY - 52} L${OX(i)},${OY - 38} Z`, fill: col || INK }); }
  function scanTo(u, a, b, n) { return Math.min(n - 1, Math.floor(E(u, a, b) * n * 0.999)); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { prow({ op: (i) => (k === 0 ? 1 - 0.55 * E(u, 0.4 + i * 0.2, 1.0 + i * 0.2) : 0.45) });
      [['전자', 300, INFO, INFOBG, [0, 1, 4], 13], ['가구', 680, WARN, WARNBG, [2, 3], 15]].forEach(([g, bx, col, bg, mem, stock]) => {
        el('path', { d: `M${bx - 150},210 L${bx - 130},350 L${bx + 130},350 L${bx + 150},210`, fill: bg, stroke: col, 'stroke-width': 2.5 });
        tx(bx, 200, `Key = "${g}"`, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', class: 'mono' });
        mem.forEach((i, j) => { const tx0 = bx - 80 + j * 80, ty0 = 300;
          if (k === 0) fly(OX(i), OY, tx0, ty0, seg(u, 0.4 + i * 0.2, 1.2 + i * 0.2), P[i][0], { fill: col, stay: true });
          else card(tx0, ty0, 70, 30, { rx: 15, text: P[i][0], fs: 13.5, fill: col, stroke: 'none', color: PANEL });
          if (k === 1) mono(tx0, 270, `+${P[i][3]}`, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + j * 0.3) }); });
        if (k === 1) { const n = Math.round(tween(0, mem.length, u)), st = Math.round(tween(0, stock, u, 1.8));
          banner(bx, 390, `Count ${n} · 재고 합 ${st}`, pop(u, 0.2)); } });
      if (k === 0) note(380, 395, '결과 하나하나가 Key와 항목 묶음', fade(u, 2.0), { fill: MUT });
      return; }
    if (k === 2) { const at = 0; prow({ hot: (i) => (i === at && u > 0.9 ? GOOD : null) }); cursor(0, ACC);
      mono(60, 170, 'products.First(p => p.Price > 100)', { 'font-size': 16, 'font-weight': 700 });
      note(60, 215, '첫 항목 노트북(1200)에서 바로 끝', fade(u, 1.0), { fill: GOOD });
      card(480, 300, 420, 70, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.6) });
      note(290, 296, '맞는 항목이 하나도 없으면?', fade(u, 1.7)); mono(290, 322, 'InvalidOperationException', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { const i = scanTo(u, 0.2, 1.3, 5); prow({ op: (j) => (j <= i ? 0.5 : 1) }); if (u < 1.4) cursor(i, MUT);
      mono(60, 170, 'FirstOrDefault(p => p.Price > 9999)', { 'font-size': 15, 'font-weight': 700 });
      card(560, 162, 90, 34, { rx: 17, text: 'null', fs: 16, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.4) });
      note(620, 168, '5건 다 봤지만 예외 없이 기본값', fade(u, 1.5), { fill: GOOD, 'font-size': 14.5 });
      mono(60, 250, 'Single(p => p.Category == "전자")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      [0, 1, 4].forEach((j, n) => pill(OX(j), 300, '맞음 ' + (n + 1), BAD, pop(u, 1.8 + n * 0.15), { fs: 13.5 }));
      banner(480, 370, '3건이라 예외: Sequence contains more than one matching element', pop(u, 2.3)); return; }
    if (k === 4) { const ai = scanTo(u, 0.2, 0.9, 2), ci = scanTo(u, 0.2, 2.0, 5);
      prow({ hot: (i) => (i === 1 && u > 0.9 ? GOOD : null) });
      const row = (y, name, upto, total, col, fin) => { mono(OX(0) - 27, y - 26, name, { 'font-size': 15, 'font-weight': 700 });
        for (let i = 0; i < 5; i++) { const on = i <= upto; card(OX(i), y, 54, 30, { rx: 6, stroke: on ? col : GRID, fill: on ? (col === GOOD ? GOODBG : WARNBG) : PANEL, sw: 1.8, text: on ? '확인' : '', fs: 13.5, color: col }); }
        mono(OX(4) + 60, y + 6, `${upto + 1}건`, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fin }); };
      row(210, 'Any(Stock == 0)', ai, 2, GOOD, fade(u, 1.0));
      row(300, 'Count(...) > 0', ci, 5, WARN, fade(u, 2.1));
      note(60, 370, 'Any는 첫 매치(마우스, 재고 0)에서 멈춘다. Count는 끝까지 센다', fade(u, 2.2), { fill: INK }); return; }
    // k5: Sum(Price * Stock)
    prow({ op: () => 0.45 });
    const vals = P.map((p) => p[2] * p[3]), mx = 6000;
    P.forEach((p, i) => { const y = 160 + i * 38; tx(60, y + 14, p[0], { 'font-size': 15, 'font-weight': 700 });
      mono(150, y + 14, `${p[2]} × ${p[3]}`, { 'font-size': 13.5, fill: MUT });
      hbar(270, y, 420, vals[i], mx, { u: E(u, 0.2 + i * 0.2, 0.9 + i * 0.2), col: ACC, text: vals[i].toLocaleString('en-US') }); });
    const tot = Math.round(tween(0, 13250, u, 2.0));
    card(840, 260, 160, 70, { rx: 10, stroke: ACC, sw: 2.5, s: pop(u, 1.0) });
    tx(840, 245, 'Sum', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 });
    mono(840, 278, tot.toLocaleString('en-US'), { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); }

  // ---------- 5. IEnumerable vs IQueryable ----------
  function worlds(o) { o = o || {};
    zone(24, 40, 470, 360, '앱 메모리 (C#)', { fill: SOFT });
    zone(540, 40, 396, 360, 'DB 서버', { fill: SOFT });
    dbIcon(840, 140, 'Orders', { stroke: o.hot ? BAD : INK }); }
  function tree(u, o) { o = o || {}; const N = [[250, 92, 'OrderByDescending', INFO], [250, 162, 'Where', INFO], [140, 232, 'db.Orders', INK], [340, 232, '>', ACC], [280, 302, 'o.Total', ACC], [400, 302, '100', ACC], [400, 162, 'o.Date', INFO]];
    const E2 = [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [0, 6]];
    E2.forEach(([a, b], i) => { const g = o.all ? 1 : E(u, 0.2 + i * 0.25, 0.6 + i * 0.25); if (g <= 0) return;
      el('line', { x1: N[a][0], y1: N[a][1] + 16, x2: lerp(N[a][0], N[b][0], g), y2: lerp(N[a][1] + 16, N[b][1] - 16, g), stroke: GRID, 'stroke-width': 2.2 }); });
    N.forEach(([x, y, s, col], i) => { const sc = o.all ? 1 : pop(u, i === 0 ? 0.1 : 0.2 + (E2.findIndex((e) => e[1] === i)) * 0.25 + 0.35);
      card(x, y, tw(s, 14) + 26, 32, { rx: 8, text: s, fs: 14, mono: true, stroke: col, color: col, fill: PANEL, s: sc, op: o.op }); }); }
  function rows(u, n, a, b, to, col, drop) { for (let i = 0; i < n; i++) { const t0 = a + (i / n) * (b - a); dot([[790, 160], [520, 200 + (i % 5) * 18], [to, 220 + (i % 7) * 16]], seg(u, t0, t0 + 0.7), col, 4.5); } }
  function s5(t, c) { const { k, u } = c;
    worlds({ hot: k === 3 || k === 4 });
    if (k === 0) { card(240, 200, 280, 60, { rx: 10, text: 'IQueryable<Order> q', fs: 16, mono: true, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.3) });
      grow(382, 200, 780, 150, E(u, 1.0, 1.8), MUT, { dash: '6 6' });
      note(560, 250, '아직 SQL이 나가지 않았다', fade(u, 1.9), { fill: MUT });
      note(60, 300, 'List처럼 보여도 실행 장소는 DB 쪽', fade(u, 2.2), { fill: INFO }); return; }
    if (k === 1) { tree(u); note(60, 380, '람다를 실행하지 않고 표현식 트리로 쌓아 둔다', fade(u, 2.2), { fill: INFO }); return; }
    if (k === 2) tree(u, { all: true, op: 1 - 0.6 * E(u, 0.2, 0.8) });
    if (k === 2) { card(270, 360, 430, 40, { rx: 8, text: 'SELECT … WHERE Total > 100 ORDER BY Date DESC', fs: 13.5, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 0.6) });
      fly(270, 360, 780, 220, seg(u, 1.0, 1.7), 'SQL 한 번', { fill: GOOD });
      rows(u, 4, 1.7, 2.2, 300, GOOD); note(580, 330, 'DB가 조건에 맞는 행만 보낸다', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 3) { card(270, 360, 360, 40, { rx: 8, text: 'SELECT * FROM Orders   -- 조건 없음', fs: 13.5, mono: true, stroke: BAD, fill: BADBG, s: pop(u, 0.2) });
      rows(u, 24, 0.5, 1.8, 300, BAD);
      if (u > 1.9) { for (let i = 0; i < 24; i++) el('circle', { cx: 120 + (i % 12) * 26, cy: 120 + Math.floor(i / 12) * 26, r: 7, fill: i % 4 === 0 ? GOOD : OFF }); }
      note(60, 200, '전부 올린 뒤 메모리에서 Where', fade(u, 2.1), { fill: BAD }); return; }
    // k4: N+1 쿼리 로그 / k5: Include
    const log = (i, s, col, sc) => mono(50, 90 + i * 26, s, { 'font-size': 13.5, fill: col, opacity: sc });
    if (k === 4) { log(0, '1  SELECT * FROM Orders', INK, fade(u, 0.2));
      const n = Math.floor(E(u, 0.4, 2.0) * 9);
      for (let i = 0; i < n; i++) { log(i + 1, `${i + 2}  SELECT * FROM Customers WHERE Id = …`, BAD, 1); dot([[780, 160], [480, 100 + i * 26]], seg(u, 0.4 + i * 0.18, 0.7 + i * 0.18), BAD, 5); }
      card(720, 320, 300, 64, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s: pop(u, 1.8) });
      mono(720, 315, '행 1000개면 1 + 1000', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(720, 340, '지연 로딩이 켜진 경우', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    log(0, 'SELECT o.*, c.*', GOOD, 1); log(1, '  FROM Orders o', GOOD, fade(u, 0.3)); log(2, '  JOIN Customers c ON …', GOOD, fade(u, 0.6));
    fly(200, 140, 780, 160, seg(u, 0.8, 1.5), 'JOIN 한 번', { fill: GOOD });
    const q = Math.round(tween(1001, 1, u, 1.4));
    card(720, 320, 300, 64, { rx: 10, stroke: GOOD, sw: 2.5, fill: GOODBG, s: pop(u, 0.3) });
    mono(720, 328, `쿼리 ${q}번`, { 'font-size': 22, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
    note(50, 250, '.Include(o => o.Customer)로 함께 가져온다', fade(u, 1.6), { fill: GOOD }); }

  // ---------- 6. 체크리스트 ----------
  const PIT = [['① 다중 열거', 'ToList로 한 번 고정'], ['② Single 남용', 'FirstOrDefault + null 검사'], ['③ N+1', 'Include로 함께 로드'], ['④ 전체 로드', 'Skip / Take 페이징'], ['⑤ null 항목', 'Where로 먼저 거르기']];
  function s6(t, c) { const { k, u } = c;
    PIT.forEach(([a, b], i) => { if (i > Math.min(k, 4)) return; const y = 60 + i * 66, on = i === k, s = on ? pop(u, 0.1) : 1;
      card(190, y, 320, 54, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.5, fill: on ? ACCBG : PANEL, s });
      tx(48, y - 4, a, { 'font-size': 15, 'font-weight': 800, fill: on ? ACC : INK }); tx(48, y + 18, b, { 'font-size': 13.5, fill: MUT });
      check(320, y, 9, on ? pop(u, 1.8) : 1); });
    const X = 400;
    if (k === 0) { card(530, 110, 170, 46, { rx: 10, text: 'query', fs: 15, mono: true, stroke: WARN, fill: WARNBG });
      grow(620, 110, 680, 110, E(u, 0.4, 0.9), ACC); pill(735, 110, 'ToList()', ACC, pop(u, 0.9), { mono: true });
      [3, 4, 99].forEach((v, i) => card(560 + i * 62, 230, 56, 42, { rx: 6, text: String(v), fs: 16, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 1.2 + i * 0.15) }));
      lock(770, 232, true, GOOD, pop(u, 1.7)); note(X + 120, 320, '여러 번 써도 다시 계산하지 않는다', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 1) { ['u1', 'u2', 'u3'].forEach((s, i) => card(520 + i * 90, 110, 76, 40, { rx: 8, text: s, fs: 15, mono: true, op: 1 - 0.5 * E(u, 0.4 + i * 0.3, 0.7 + i * 0.3) }));
      mono(X + 120, 180, 'FirstOrDefault(u => u.Id == id)', { 'font-size': 14.5, opacity: fade(u, 0.3) });
      card(560, 240, 90, 36, { rx: 18, text: 'null', fs: 16, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.4) });
      grow(610, 240, 690, 240, E(u, 1.6, 2.0), MUT); pill(760, 240, 'NotFound()', GOOD, pop(u, 2.0), { mono: true }); return; }
    if (k === 2) { dbIcon(520, 150, 'Orders', { s: 0.7 }); dbIcon(660, 150, 'Customer', { s: 0.7 }); dbIcon(800, 150, 'Items', { s: 0.7 });
      [520, 660, 800].forEach((x, i) => grow(x, 196, 660, 270, E(u, 0.5 + i * 0.2, 1.1 + i * 0.2), GOOD));
      card(660, 300, 260, 46, { rx: 10, text: '쿼리 1번 (JOIN)', fs: 15, stroke: GOOD, fill: GOODBG, color: GOOD, s: pop(u, 1.5) }); return; }
    if (k === 3) { tx(X + 120, 100, '예: pageIndex = 2', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.2) });
      for (let p = 0; p < 6; p++) { const on = p === 2, x = 520 + p * 66; card(x, 170, 58, 80, { rx: 6, stroke: on ? ACC : GRID, sw: on ? 3 : 1.5, fill: on ? ACCBG : PANEL, s: pop(u, 0.2 + p * 0.1) });
        mono(x, 176, `${p * 20}~`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: on ? ACC : MUT }); }
      mono(X + 120, 260, 'OrderBy(Id).Skip(40).Take(20)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      note(X + 120, 300, '정렬이 있어야 페이지가 흔들리지 않는다', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 4) { const v = ['Kim', 'null', 'Lee'];
      v.forEach((s, i) => { const bad = s === 'null'; card(540 + i * 100, 120, 80, 40, { rx: 8, text: s, fs: 15, mono: true, stroke: bad ? BAD : INK, color: bad ? BAD : INK, op: bad ? 1 - 0.8 * E(u, 0.8, 1.4) : 1 }); });
      cross(640, 120, 12, pop(u, 0.8)); mono(X + 120, 200, '.Where(p => p is not null)', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      mono(X + 120, 228, '.Select(p => p.Name)', { 'font-size': 14.5, opacity: fade(u, 1.2) });
      ['"Kim"', '"Lee"'].forEach((s, i) => card(590 + i * 120, 290, 90, 36, { rx: 18, text: s, fs: 15, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 1.6 + i * 0.2) })); return; }
    // k5: 두 질문
    [['언제 실행되나', '열거하는 순간 · ①'], ['어디서 도나', '메모리 또는 SQL · ③ ④']].forEach(([a, b], i) => { const y = 140 + i * 130;
      card(690, y, 400, 100, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.3 + i * 0.5) });
      tx(690, y - 8, a, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4 + i * 0.5) });
      tx(690, y + 24, b, { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); }); }

  const quiz = [
    { q: '메서드 구문과 쿼리 구문으로 같은 질의를 쓰면 무엇이 다른가?',
      o: ['컴파일러가 같은 메서드 호출로 바꾸므로 결과도 성능도 같다', '쿼리 구문이 SQL처럼 DB에서 돌아 더 빠르다', '메서드 구문은 List 에만, 쿼리 구문은 배열에만 쓸 수 있다'], a: 0,
      why: '쿼리 구문은 컴파일 때 .Where(...).Select(...) 호출로 번역된다. 둘 다 노트북·마우스·모니터를 내고 성능 차이가 없다.' },
    { q: 'Select를 Where 앞에 두면 5건짜리 products에서 변환 함수는 몇 번 불리나?',
      o: ['3번', '2번', '5번'], a: 2,
      why: 'Select가 먼저면 버릴 가구 2건까지 5건 모두 변환한다. Where를 먼저 두면 3번으로 줄어든다.' },
    { q: 'q = nums.Where(n => n > 2)를 만든 뒤 nums.Add(99)를 하고 foreach 하면 무엇이 나오나?',
      o: ['3 4 99', '3 4', '아무것도 나오지 않는다'], a: 0,
      why: '질의는 정의할 때 계산하지 않고 열거하는 순간 nums를 다시 읽는다. 그래서 뒤에 넣은 99도 결과에 들어간다.' },
    { q: '재고가 0인 상품이 있는지만 알고 싶을 때 Count(...) > 0보다 Any(...)가 나은 이유는 무엇인가?',
      o: ['Any는 첫 매치에서 멈춘다', 'Any는 결과를 캐시한다', 'Count는 예외를 던질 수 있다'], a: 0,
      why: '예제에서 Any는 두 번째 마우스에서 멈춰 2건만 봤고, Count는 5건을 끝까지 셌다.' },
    { q: 'EF Core에서 db.Orders.ToList().Where(o => o.Total > 100)의 문제는 무엇인가?',
      o: ['Where가 SQL로 번역되어 두 번 실행된다', 'Orders 전체를 메모리로 가져온 뒤 거른다', 'ToList 때문에 결과 순서가 바뀐다'], a: 1,
      why: 'ToList에서 IQueryable이 IEnumerable로 바뀌어 WHERE 없는 SELECT * 가 나간다. 필터는 ToList 앞에 둬야 DB가 처리한다.' },
    { q: 'LINQ 체크리스트를 꿰는 두 질문은 무엇인가?',
      o: ['몇 줄로 쓰나, 어떤 구문을 쓰나', '어떤 타입을 돌려주나, 몇 번 정렬하나', '언제 실행되나, 어디서 도나'], a: 2,
      why: '다중 열거는 실행 시점의 문제이고, N+1·전체 로드는 메모리와 SQL 중 어디서 도는지의 문제다.' },
  ];

  const summary = [
    'LINQ는 조건만 적고 순회는 맡긴다. 메서드 구문과 쿼리 구문은 같은 코드로 컴파일된다.',
    '연산자는 차례로 이어지는 파이프라인이라 Where를 먼저 두면 뒤 단계가 다룰 양이 준다.',
    '질의는 열거할 때 돈다. 다시 열거하면 다시 계산하므로 여러 번 쓸 결과는 ToList로 고정한다.',
    'IQueryable은 SQL로 번역되어 DB에서 돈다. ToList를 일찍 부르면 테이블 전체를 메모리로 가져온다.',
  ];
  const review = [
    { q: '주문 목록 API가 느려 로그를 보니 같은 SELECT가 요청마다 두 번씩 나간다. 먼저 의심할 것은?',
      o: ['같은 IQueryable을 Count()하고 다시 foreach 했다', 'Where와 Select의 순서가 바뀌었다', '쿼리 구문을 메서드 구문으로 바꿨다'], a: 0,
      why: 'Count()도 열거라서 질의가 한 번 돌고, foreach에서 또 돈다. 결과를 ToList로 한 번 고정하면 SQL도 한 번만 나간다.' },
    { q: '상품 5건에서 비싼 변환을 하는 질의가 있다. 결과는 같은데 변환 횟수를 줄이려면?',
      o: ['OrderBy를 맨 앞에 둔다', 'Where로 먼저 걸러 변환 대상을 줄인다', 'Select를 두 번 나눠 쓴다'], a: 1,
      why: '파이프라인은 앞 단계 결과만 뒤로 넘긴다. Where를 앞에 두면 변환이 5번에서 3번으로 준다.' },
    { q: '사용자 한 명을 Id로 찾는 코드에서 가끔 예외가 난다. 가장 안전한 고침은?',
      o: ['Single로 바꿔 정확히 하나를 요구한다', 'First를 그대로 두고 try로 감싼다', 'FirstOrDefault로 받고 null이면 NotFound를 돌려준다'], a: 2,
      why: 'First는 0건이면 예외를 던진다. FirstOrDefault는 null을 돌려주므로 없음을 코드로 처리할 수 있다.' },
  ];

  R.page({ title: 'LINQ 파이프라인', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
