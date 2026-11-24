/* V-2-1 단위 테스트(xUnit) — 장면 6개 (../../anim/engine.js 규칙을 따른다)
   xUnit·Moq 패키지는 이 컴퓨터에 없어 테스트를 직접 돌리지 않았다. 그림의 값은 페이지 코드에서 바로 따라 나오는 것만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, cells,
    server, cross, check, zone, terminal, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  // 테스트 탐색기: rows = [[이름, 'pass'|'fail'|'warn'|'none', 보임]]
  function explorer(x, y, w, rows, o) { o = o || {}; const rh = 32, h = 40 + Math.max(1, rows.length) * rh;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 12, y + 24, o.title || '테스트 탐색기', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (!rows.length) mono(x + 14, y + 58, '발견된 테스트 0개', { 'font-size': 14, fill: OFF });
    rows.forEach(([n, st, op], i) => { const yy = y + 40 + i * rh + rh / 2, col = st === 'pass' ? GOOD : st === 'fail' ? BAD : st === 'warn' ? WARN : OFF, a = op ?? 1;
      el('circle', { cx: x + 20, cy: yy, r: 7, fill: col, opacity: a }); mono(x + 36, yy + 5, n, { 'font-size': 14, opacity: a, fill: st === 'fail' ? BAD : INK }); });
    return h; }
  function band(x, y, w, tag, kr, col, line, f) { el('rect', { x, y, width: w, height: 58, rx: 10, fill: f > 0 ? PANEL : 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': f > 0 ? null : '6 4' });
    el('rect', { x, y, width: 112, height: 58, rx: 10, fill: col, opacity: f > 0 ? 0.9 : 0.25 });
    tx(x + 56, y + 26, tag, { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); tx(x + 56, y + 46, kr, { 'font-size': 13.5, fill: PANEL, 'text-anchor': 'middle' });
    if (f > 0) mono(x + 128, y + 35, typed(line, f), { 'font-size': 15, 'font-weight': 600 });
    else mono(x + 128, y + 35, '— 아직 없음', { 'font-size': 14.5, fill: OFF }); }
  function valBox(cx, cy, head, v, col, s) { card(cx, cy, 120, 74, { rx: 10, stroke: col, sw: 2.2, s });
    tx(cx, cy - 16, head, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); mono(cx, cy + 20, v, { 'font-size': 22, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); }
  function msgBox(x, y, title, lines, col, op) { const w = Math.max(tw(title, 13.5), ...lines.map((l) => tw(l, 14))) + 30;
    el('rect', { x, y, width: w, height: 30 + lines.length * 22, rx: 8, fill: col === BAD ? BADBG : SOFT, stroke: col, 'stroke-width': 1.6, opacity: op });
    tx(x + 12, y + 20, title, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op });
    lines.forEach((l, i) => mono(x + 14, y + 42 + i * 22, l, { 'font-size': 14, opacity: op })); return w; }

  // ---------- 1. [Fact] 와 AAA ----------
  const AAA = [['Arrange', '준비', ACC, 'var calc = new Calculator();'], ['Act', '실행', INFO, 'var result = calc.Add(2, 3);'], ['Assert', '검증', GOOD, 'Assert.Equal(5, result);']];
  function s1(t, c) { const { k, u } = c;
    mono(30, 44, 'public class CalculatorTests', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k >= 1 && k < 5) { mono(30, 74, typed('[Fact] Add_TwoNumbers_ReturnsSum()', k === 1 ? E(u, 0.2, 1.0) : 1), { 'font-size': 16, 'font-weight': 800, fill: ACC });
      AAA.forEach(([tag, kr, col, line], i) => band(30, 96 + i * 72, 530, tag, kr, col, line, k >= i + 2 ? (k === i + 2 ? E(u, 0.3, 1.2) : 1) : 0)); }
    const pass = k >= 4, rows = k === 0 ? [] : [['Add_TwoNumbers_ReturnsSum', k === 1 ? 'warn' : pass ? 'pass' : 'none', k === 1 ? fade(u, 1.0) : 1]];
    explorer(600, 34, 340, rows);
    if (k === 0) { sub(770, 140, '[Fact] 가 없으면 xUnit 이 찾을 것이 없다', fade(u, 1.0)); return; }
    if (k === 1) { pill(770, 140, 'Assert 가 없어 초록불이 떠도 가짜 통과', WARN, pop(u, 1.6), { fill: WARNBG, fs: 14 }); return; }
    if (k >= 2 && k < 5) { card(700, 250, 150, 56, { rx: 10, text: 'calc', mono: true, fs: 16, fw: 800, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 1.0) : 1 });
      sub(700, 296, 'Calculator', k === 2 ? fade(u, 1.2) : 1); }
    if (k >= 3 && k < 5) { if (k === 3) { dot([[560, 200], [640, 230], [690, 250]], seg(u, 0.6, 1.2), INFO, 8); fly(720, 250, 880, 250, seg(u, 1.3, 2.0), 'Add(2, 3)', { fill: INFO, mono: true }); }
      valBox(880, 250, 'result', '5', INFO, k === 3 ? pop(u, 2.0) : 1); if (k === 3) sub(780, 330, '아직 아무도 result 를 보지 않았다', fade(u, 2.2)); }
    if (k === 4) { valBox(660, 370, '기대값', '5', GOOD, pop(u, 0.8)); mono(760, 378, '==', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      valBox(860, 370, '실제값', '5', GOOD, pop(u, 1.0)); check(760, 330, 12, pop(u, 1.5)); return; }
    if (k === 5) { const parts = [['Add', '메서드', ACC], ['TwoNumbers', '상황', INFO], ['ReturnsSum', '기대 결과', GOOD]];
      let x = 60; parts.forEach(([p, h, col], i) => { const w = tw(p, 20) + 30, s = pop(u, 0.3 + i * 0.4);
        card(x + w / 2, 160, w, 52, { rx: 10, text: p, mono: true, fs: 20, fw: 800, stroke: col, color: col, s }); tx(x + w / 2, 210, h, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) });
        if (i < 2) mono(x + w + 14, 167, '_', { 'font-size': 20, fill: MUT, 'text-anchor': 'middle', opacity: s }); x += w + 28; });
      msgBox(60, 270, '실패 목록만 읽어도 무엇이 깨졌는지 안다', ['✗ Add_TwoNumbers_ReturnsSum'], BAD, fade(u, 1.8)); } }

  // ---------- 2. [Theory] + [InlineData] ----------
  const CASES = [[2, true], [7, false], [0, true], [-4, true]];
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) { tx(40, 46, '[Theory]', { 'font-size': 16, 'font-weight': 800, fill: ACC, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
      tx(60, 86, 'n', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC }); tx(160, 86, 'expected', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: INFO });
      const n = k === 0 ? 1 : 4;
      CASES.slice(0, n).forEach(([a, b], i) => { const s = k === 0 ? pop(u, 0.5) : k === 1 && i > 0 ? pop(u, 0.2 + i * 0.35) : 1, y = 116 + i * 44, run = k === 3 && seg(u, 0.3 + i * 0.5, 0.7 + i * 0.5) > 0;
        card(145, y, 230, 36, { rx: 8, stroke: run ? ACC : GRID, sw: run ? 2.5 : 1.5, s });
        mono(60, y + 5, String(a), { 'font-size': 15, 'font-weight': 700, opacity: s }); mono(160, y + 5, String(b), { 'font-size': 15, 'font-weight': 700, opacity: s });
        tx(276, y + 5, '[InlineData]', { 'font-size': 13.5, fill: MUT, class: 'mono', opacity: s * 0.8 }); });
      const cnt = k === 1 ? Math.round(tween(1, 4, u, 1.4)) : n;
      explorer(660, 34, 280, CASES.slice(0, cnt).map(([a, b], i) => [`IsEven(${a}) = ${b}`, k === 3 ? (u > 0.7 + i * 0.5 ? 'pass' : 'none') : k >= 2 ? 'pass' : k === 0 ? 'pass' : 'none', 1]), { title: `테스트 ${cnt}개` });
      if (k === 1) sub(480, 330, '케이스 한 줄 = 독립 테스트 하나, 경계값 0·음수도 같은 표에', fade(u, 1.8), { 'font-size': 15 });
      if (k >= 2) { card(440, 330, 330, 44, { rx: 10, text: '(int n, bool expected)', mono: true, fs: 15.5, fw: 700, s: k === 2 ? pop(u, 0.3) : 1 });
        const g = k === 2 ? E(u, 0.7, 1.4) : 1; grow(64, 290, 330, 312, g, ACC); grow(190, 290, 440, 312, g, INFO); }
      if (k === 3) { mono(440, 390, 'Assert.Equal(expected, Number.IsEven(n))', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.2) });
        sub(800, 300, '본문 한 벌이 케이스마다 다시 돈다', fade(u, 2.3)); }
      return; }
    // k4, k5: 런타임 값은 MemberData 로
    card(220, 90, 300, 50, { rx: 10, text: '[InlineData( 상수만 )]', mono: true, fs: 15, fw: 700, stroke: INK });
    const bx = k === 4 ? 520 - 60 * Math.sin(Math.PI * seg(u, 0.3, 1.1)) : 520;
    if (k === 4) { card(bx, 90, 190, 44, { rx: 9, text: 'new User("Ann")', mono: true, fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 0.2) }); cross(380, 60, 11, pop(u, 1.0));
      tx(220, 150, '컴파일 타임 상수가 아니라 넣을 수 없다', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) }); }
    const pu = k === 4 ? E(u, 1.5, 2.2) : 1;
    zone(440, 190, 480, 110, 'public static IEnumerable<object[]> Cases', { fill: SOFT, op: pu });
    if (pu > 0.5) mono(460, 260, 'new object[] { new User("Ann"), true }', { 'font-size': 14.5, 'font-weight': 700, opacity: pu });
    if (k === 4) { grow(520, 116, 600, 186, pu, ACC); return; }
    card(220, 245, 300, 46, { rx: 10, text: '[MemberData(nameof(Cases))]', mono: true, fs: 14.5, fw: 700, stroke: ACC, color: ACC, s: pop(u, 0.3) });
    grow(440, 245, 372, 245, E(u, 0.6, 1.1), ACC);
    grow(220, 270, 220, 330, E(u, 1.1, 1.5), ACC);
    explorer(80, 336, 300, [['Complex(User u, bool ok)', 'pass', fade(u, 1.6)]], { title: '원소 하나 = 테스트 하나' }); }

  // ---------- 3. 목적별 Assert ----------
  function verdict(ex, ac, ok, f, label) { mono(480, 48, label, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(f, 0.1) });
    valBox(330, 140, '기대값', ex, ok ? GOOD : BAD, pop(f, 0.4)); valBox(630, 140, '실제값', ac, ok ? GOOD : BAD, pop(f, 0.7));
    mono(480, 148, ok ? '==' : '≠', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ok ? GOOD : BAD, opacity: fade(f, 1.0) });
    (ok ? check : cross)(480, 214, 14, pop(f, 1.3)); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { verdict('5', '5', true, u, 'Assert.Equal(5, 2 + 3)'); msgBox(250, 270, '실패하면 두 값이 그대로 남는다', ['Expected: 5', 'Actual:   (실제 값)'], MUT, fade(u, 1.8)); return; }
    if (k === 1) { mono(480, 48, 'Assert.True("abc".StartsWith("a"))', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      valBox(480, 130, '조건식', 'true', GOOD, pop(u, 0.4));
      tx(480, 210, 'n 이 5 인데 3 을 기대했다면, 실패 메시지는', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      msgBox(110, 240, 'Assert.Equal(3, n)', ['Expected: 3', 'Actual:   5'], GOOD, fade(u, 1.4)); check(330, 286, 11, pop(u, 1.6));
      msgBox(560, 240, 'Assert.True(n == 3)', ['Expected: True', 'Actual:   False'], WARN, fade(u, 1.8)); tx(560, 344, '5 라는 값은 어디에도 없다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { mono(480, 48, 'string? name = null;   Assert.Null(name);', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      card(480, 150, 200, 70, { rx: 10, stroke: INFO, sw: 2.2, dash: '6 4', s: pop(u, 0.4) }); tx(480, 132, 'name', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', class: 'mono' });
      mono(480, 166, 'null', { 'font-size': 22, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); check(620, 150, 13, pop(u, 1.3));
      sub(480, 260, 'NotNull 로 먼저 막아 두면 뒤 Assert 가 NullReference 로 엉뚱하게 터지지 않는다', fade(u, 1.7), { 'font-size': 15 }); return; }
    if (k === 3) { mono(480, 48, 'var nums = new[] { 1, 2, 3 };', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      cells(380, 90, [1, 2, 3], { w: 60, h: 50, gap: 10, index: true, style: (i) => ({ stroke: i === 1 && u > 0.8 ? GOOD : INK, fill: i === 1 && u > 0.8 ? GOODBG : PANEL, s: pop(u, 0.2 + i * 0.15) }) });
      mono(250, 230, 'Assert.Contains(2, nums)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) }); check(470, 225, 10, pop(u, 1.1));
      mono(560, 230, 'Assert.Equal(3, nums.Length)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); check(820, 225, 10, pop(u, 1.7));
      sub(480, 300, '개수까지 봐야 원소가 중복으로 늘어난 회귀를 잡는다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 4) { mono(40, 60, 'Assert.Throws<DivideByZeroException>(() => calc.Divide(1, 0))', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      el('path', { d: 'M560,120 L540,150 L556,150 L536,184', fill: 'none', stroke: BAD, 'stroke-width': 4, 'stroke-linejoin': 'round', opacity: fade(u, 0.5) });
      fly(330, 150, 520, 150, seg(u, 0.4, 1.1), 'Divide(1, 0)', { fill: INFO, mono: true });
      card(720, 150, 260, 50, { rx: 25, text: '잡았다 → 통과', fs: 15, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.2) });
      mono(40, 260, 'try { calc.Divide(1, 0); } catch { }', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      card(720, 256, 260, 50, { rx: 25, text: '예외가 안 나도 통과', fs: 15, fw: 800, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.9) }); cross(870, 256, 10, pop(u, 2.1));
      sub(480, 350, '예외를 검증할 때는 Assert.Throws 로 감싼다', fade(u, 2.2), { 'font-size': 15 }); return; }
    verdict('5', '4', false, u, 'Assert.Equal(5, calc.Add(2, 2))');
    msgBox(250, 270, '실패 리포트', ['Expected: 5', 'Actual:   4'], BAD, fade(u, 1.7)); explorer(620, 270, 300, [['AssertKinds', 'fail', fade(u, 1.9)]]); }

  // ---------- 4. 생성자 · Dispose · 격리 ----------
  const LX = 210, SEG = [['생성자', ACC, 150], ['테스트', INFO, 200], ['Dispose', MUT, 130]];
  function laneRow(y, name, f, cnt, o) { o = o || {}; tx(30, y + 6, name, { 'font-size': 15, 'font-weight': 800, class: 'mono' }); let x = LX;
    SEG.forEach(([s, col, w], i) => { const g = clamp(f * 3 - i); if (g > 0) { el('rect', { x, y: y - 16, width: w * g, height: 32, rx: 8, fill: col, opacity: 0.85 });
      if (g > 0.6) tx(x + w / 2, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }); } x += w + 8; });
    if (cnt != null) { dbIcon(800, y - 2, null, { s: 0.42, stroke: o.bad ? BAD : INFO }); mono(840, y + 6, cnt, { 'font-size': 15, 'font-weight': 800, fill: o.bad ? BAD : INFO }); } }
  function s4(t, c) { const { k, u } = c;
    card(250, 56, 420, 60, { rx: 12, stroke: INK, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(60, 50, 'RepositoryTests : IDisposable', { 'font-size': 15, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.4) : 1 });
    mono(60, 74, '_db (인스턴스 필드)', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { sub(250, 150, 'xUnit 에는 [SetUp]·[TearDown] 이 없다', fade(u, 1.3), { 'font-size': 15 }); sub(250, 176, '생성자와 Dispose 를 그대로 쓴다', fade(u, 1.7)); return; }
    if (k === 1) { laneRow(200, 'Test_A', E(u, 0.3, 0.8) / 3, '0건'); sub(400, 260, 'new InMemoryDb() — 테스트마다 다시 실행된다', fade(u, 1.2), { 'font-size': 15 }); return; }
    if (k === 2) { laneRow(200, 'Test_A', 1 / 3 + 0.001, '0건'); const g = E(u, 0.4, 1.0); el('rect', { x: LX + 316, y: 184, width: 130 * g, height: 32, rx: 8, fill: MUT, opacity: 0.85 });
      if (g > 0.6) tx(LX + 381, 205, 'Dispose', { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' });
      sub(400, 260, '실패해도 Dispose 는 불린다 → _db.Clear()', fade(u, 1.3), { 'font-size': 15 }); return; }
    if (k === 3) { const f = E(u, 0.2, 2.2); laneRow(200, 'Test_A', f, f < 0.4 ? '0건' : f < 0.75 ? '1건' : '0건');
      sub(400, 260, '[Fact] 하나 = 생성자 → 테스트 → Dispose 한 바퀴', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 4) { laneRow(170, 'Test_A', 1, '1건'); const f = E(u, 0.3, 2.0); laneRow(250, 'Test_B', f, f < 0.4 ? '0건' : '1건');
      if (u > 2.0) { check(900, 170, 10, 1); check(900, 250, 10, pop(u, 2.0)); }
      sub(400, 320, '인스턴스가 매번 새것이라 Count 는 늘 1', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 5) { laneRow(170, 'Test_A', 1); laneRow(250, 'Test_B', 1);
      card(800, 120, 210, 40, { rx: 9, text: 'static _shared', mono: true, fs: 15, fw: 700, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      const n = u < 1.0 ? 1 : 2; mono(800, 210, '쌓인 행: ' + n, { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      if (u > 1.2) { cross(900, 250, 10, pop(u, 1.2)); tx(800, 300, 'Test_B: 1 을 기대했는데 2', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
      sub(400, 360, '단독으로는 통과, 전체 실행에서만 깨진다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // k6: IClassFixture — 클래스당 한 번
    card(720, 56, 260, 56, { rx: 10, text: 'DbFixture  (1회 생성)', fs: 15, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3) });
    laneRow(200, 'Test_A', 1); laneRow(280, 'Test_B', 1);
    grow(680, 86, 300, 180, E(u, 0.9, 1.4), GOOD); grow(720, 86, 330, 260, E(u, 1.2, 1.7), GOOD);
    sub(480, 360, 'IClassFixture<DbFixture> — 비싼 자원만 나눠 쓴다', fade(u, 1.9), { 'font-size': 15 }); }

  // ---------- 5. Moq 로 의존 격리 ----------
  const SV = [330, 200];
  function s5(t, c) { const { k, u } = c;
    if (k === 6) { // 모킹 범위
      [['모킹한다', ['SMTP 발송', 'DB 저장소', '외부 API'], GOOD, 230], ['모킹하지 않는다', ['값 객체', '순수 함수', '계산 로직'], BAD, 640]].forEach(([h, rows, col, cx], j) => {
        card(cx, 60, 260, 42, { rx: 10, text: h, fs: 16, fw: 800, stroke: col, color: col, fill: j ? BADBG : GOODBG, s: pop(u, 0.2 + j * 0.4) });
        rows.forEach((r, i) => pill(cx, 120 + i * 50, r, j ? MUT : INK, pop(u, 0.5 + j * 0.4 + i * 0.15), { fs: 14.5 })); });
      tx(480, 320, '값 객체까지 모킹하면 구현을 조금만 바꿔도 테스트가 줄줄이 깨진다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      for (let i = 0; i < 5; i++) cross(330 + i * 75, 370, 9, pop(u, 1.9 + i * 0.1)); return; }
    card(SV[0], SV[1], 240, 70, { rx: 12, stroke: INK, sw: 2.4, text: 'SignupService', mono: true, fs: 16, fw: 800 });
    const real = k <= 2 || k === 0, mk = k >= 1;
    // 실제 의존: SMTP 서버로 가는 흔들리는 선
    server(830, 110, 'SMTP 서버', { op: k >= 3 ? 0.35 : 1, lamp: k <= 2 ? BAD : OFF });
    if (real) { const pts = []; for (let i = 0; i <= 12; i++) pts.push(`${lerp(450, 770, i / 12)},${lerp(200, 110, i / 12) + (i % 2 ? -8 : 8)}`);
      el('polyline', { points: pts.join(' '), fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: k === 0 ? fade(u, 0.3) : k <= 2 ? 0.7 : 0 });
      if (k === 0) { tx(610, 200, '진짜 네트워크', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); pill(330, 330, '느리고, 네트워크가 죽으면 빨간불', BAD, pop(u, 1.5), { fill: BADBG }); return; } }
    if (k >= 3) cross(770, 130, 12, k === 3 ? pop(u, 1.0) : 1);
    // 가짜: Mock<IEmailSender>
    const mx = k >= 3 ? lerp(700, 560, k === 3 ? E(u, 0.3, 1.0) : 1) : 700, my = k >= 3 ? lerp(320, 200, k === 3 ? E(u, 0.3, 1.0) : 1) : 320;
    card(mx, my, 230, 56, { rx: 12, stroke: WARN, sw: 2.4, dash: '6 4', fill: WARNBG, text: k >= 3 ? 'email.Object' : 'Mock<IEmailSender>', mono: true, fs: 15, fw: 800, color: WARN, s: k === 1 ? pop(u, 0.3) : 1 });
    if (k >= 3) grow(450, 200, 442, 200, 1, WARN, { plain: true });
    if (k === 1) { mono(700, 380, 'Setup 없음 → Send(…) 는 false', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { card(330, 330, 420, 48, { rx: 10, text: 'Send(아무 문자열, 아무 문자열) → true', fs: 15, fw: 700, stroke: WARN, color: INK, s: pop(u, 0.4) });
      grow(540, 330, 580, 330, E(u, 0.9, 1.3), WARN); sub(330, 384, 'It.IsAny<string>() = 인자는 무엇이든', fade(u, 1.5)); return; }
    if (k === 3) { sub(330, 300, 'new SignupService(email.Object)', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); sub(330, 326, '진짜인지 가짜인지 모른다', fade(u, 1.6)); return; }
    // 호출 기록
    const logN = k === 4 ? (u > 1.2 ? 1 : 0) : 1;
    zone(560, 270, 380, 110, '호출 기록 (Moq)', { fill: SOFT });
    if (logN) mono(580, 324, 'Send("ann@test.com", …)', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 4 ? fade(u, 1.2) : 1 });
    if (k === 4) { mono(SV[0], 300, 'svc.Register("ann@test.com")', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      dot([[450, 190], [560, 190]], seg(u, 0.3, 0.9), ACC, 8); dot([[560, 210], [450, 210]], seg(u, 0.9, 1.4), GOOD, 8);
      tx(500, 250, 'true', { 'font-size': 15, 'font-weight': 800, fill: GOOD, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 1.2) }); return; }
    mono(40, 300, 'email.Verify(x => x.Send("ann@test.com", …),', { 'font-size': 14.5, 'font-weight': 700 }); mono(60, 326, 'Times.Once);', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
    mono(750, 360, '1회 = Once', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); check(860, 354, 10, pop(u, 1.0));
    sub(330, 380, '두 번 불렸다면 그 자리에서 실패한다', fade(u, 1.6)); }

  // ---------- 6. dotnet test · 커버리지 · TDD ----------
  const CMD = ['$ dotnet new xunit -n MyApp.Tests', '$ cd MyApp.Tests', '$ dotnet add reference ../MyApp/MyApp.csproj', '$ dotnet add package Moq'];
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 50, 620, 150, CMD, E(u, 0.1, 2.2) * 4, { title: 'terminal' }); sub(350, 250, '테스트는 대상과 다른 프로젝트에 둔다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { [['MyApp/', 0, '대상 코드'], ['Calculator.cs', 1], ['MyApp.Tests/', 0, '테스트'], ['CalculatorTests.cs', 1], ['NumberTests.cs', 1]].forEach(([n, d, note], i) => {
        const y = 70 + i * 46, s = fade(u, 0.2 + i * 0.25); mono(80 + d * 36, y, (d ? '└ ' : '▸ ') + n, { 'font-size': 16, 'font-weight': d ? 500 : 800, fill: i >= 2 ? ACC : INK, opacity: s });
        if (note) tx(420, y, note, { 'font-size': 14.5, fill: MUT, opacity: s }); });
      el('path', { d: 'M70,162 C30,140 30,90 70,74', fill: 'none', stroke: ACC, 'stroke-width': 2, 'marker-end': 'url(#ra-ahb)', opacity: fade(u, 1.5) });
      sub(560, 330, '<이름>.Tests 와 *Tests.cs 관례', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 2) { terminal(40, 50, 620, 110, ['$ dotnet test', ['  Passed!  - Failed: 0, Passed: 12, Skipped: 0', '#4ade80']], u > 1.6 ? 2 : E(u, 0.1, 0.6), { title: 'terminal' });
      const g = E(u, 0.6, 1.6); el('rect', { x: 40, y: 200, width: 620, height: 16, rx: 8, fill: SOFT }); el('rect', { x: 40, y: 200, width: 620 * g, height: 16, rx: 8, fill: GOOD });
      tx(680, 213, '(예시 숫자)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); sub(350, 270, '몇 초 안에 끝나야 자주 돌린다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3) { const L = ['int Add(int a, int b)', '{', '    return a + b;', '}'];
      [['테스트 A — Assert 있음', GOOD, 60], ['테스트 B — Assert 없음', BAD, 500]].forEach(([h, col, x], j) => {
        tx(x, 60, h, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + j * 0.3) });
        L.forEach((l, i) => { const lit = seg(u, 0.6 + i * 0.25, 0.9 + i * 0.25); el('rect', { x, y: 82 + i * 30, width: 8, height: 24, fill: GOOD, opacity: lit });
          mono(x + 18, 100 + i * 30, l, { 'font-size': 14.5 }); });
        mono(x, 240, '커버리지: 4줄 모두 지나감', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
        (j ? cross : check)(x + 20, 280, 11, pop(u, 2.1)); tx(x + 40, 286, j ? '검증한 것은 없다' : '결과를 검증했다', { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 2.1) }); });
      return; }
    if (k === 4) { const cx = 480, cy = 200, r = 120, hot = Math.floor(t * 1.2) % 3;
      [['Red', '실패하는 테스트 먼저', BAD], ['Green', '통과할 최소 코드', GOOD], ['Refactor', '정리', INFO]].forEach(([n, d, col], i) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / 3, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a), s = pop(u, 0.2 + i * 0.4);
        el('circle', { cx: x, cy: y, r: 44 * s, fill: i === hot ? col : PANEL, stroke: col, 'stroke-width': 3 });
        tx(x, y + 6, n, { 'font-size': 16, 'font-weight': 800, fill: i === hot ? PANEL : col, 'text-anchor': 'middle', opacity: s });
        tx(x + (i === 0 ? 0 : i === 1 ? 70 : -70), y + (i === 0 ? -56 : 66), d, { 'font-size': 14.5, fill: MUT, 'text-anchor': i === 0 ? 'middle' : i === 1 ? 'start' : 'end', opacity: fade(u, 0.5 + i * 0.4) }); });
      return; }
    [['독립', '순서·상태 공유 없음'], ['빠름', '실제 DB·API 대신 모킹'], ['명확', '이름과 AAA로 의도가 읽힘']].forEach(([a, b], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3);
      card(x, 120, 270, 96, { rx: 12, stroke: GOOD, sw: 2, s }); tx(x, 112, a, { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: s }); tx(x, 142, b, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    card(480, 290, 460, 56, { rx: 28, stroke: ACC, fill: ACCBG, sw: 2, text: '다음 장 V-2-2 · 종합 REST API 미니 서비스', fs: 15.5, fw: 800, color: ACC, s: pop(u, 1.4) }); }

  const quiz = [
    { q: 'Assert가 하나도 없는 [Fact] 테스트를 실행하면 어떻게 되는가?',
      o: ['통과로 표시되지만 아무것도 검증하지 않는다', '실패로 표시된다', 'xUnit이 테스트로 찾지 못한다'], a: 0,
      why: '예외만 안 나면 초록불이 뜬다. Arrange, Act 뒤에 Assert가 있어야 진짜로 무엇인가를 검증한다.' },
    { q: '[InlineData]를 네 줄 붙인 [Theory] 하나는 테스트 몇 개로 집계되는가?',
      o: ['1개', '케이스 중 실패한 것만', '4개'], a: 2,
      why: 'InlineData 한 줄이 독립 테스트 하나다. 본문은 한 벌이고 2, 7, 0, -4가 차례로 들어가 각각 판정된다.' },
    { q: 'n이 5인데 3을 기대했을 때, 실패 메시지에 5가 남는 Assert는 무엇인가?',
      o: ['Assert.Equal(3, n)', 'Assert.True(n == 3)', '둘 다 남긴다'], a: 0,
      why: 'Assert.Equal은 기대값과 실제값을 함께 적는다. Assert.True는 조건식의 참과 거짓만 알려 줘서 5가 사라진다.' },
    { q: 'static 필드에 행을 쌓는 테스트 클래스에서 생기는 일은 무엇인가?',
      o: ['테스트마다 새 인스턴스라 아무 문제 없다', '단독으로는 통과하고 전체 실행에서만 깨질 수 있다', 'Dispose가 static 필드도 지워 준다'], a: 1,
      why: '인스턴스 필드는 매번 새로 만들어지지만 static은 인스턴스와 무관하게 남는다. 그래서 앞 테스트의 흔적이 뒤 테스트를 깨뜨린다.' },
    { q: 'email.Verify(x => x.Send("ann@test.com", …), Times.Once)가 확인하는 것은 무엇인가?',
      o: ['Send가 true를 돌려줬는지', 'SMTP 서버가 살아 있는지', 'Send가 그 주소로 정확히 한 번 불렸는지'], a: 2,
      why: 'Verify는 반환값이 아니라 호출 기록을 본다. 두 번 불렸다면 Times.Once에서 실패해 중복 발송을 잡는다.' },
    { q: '커버리지 숫자가 높은데도 믿을 수 없는 경우는 무엇인가?',
      o: ['코드를 지나가기만 하고 Assert가 없는 테스트가 많을 때', '테스트가 몇 초 안에 끝날 때', '테스트 프로젝트를 따로 뒀을 때'], a: 0,
      why: '커버리지는 지나간 줄만 센다. Assert 있는 테스트와 없는 테스트가 같은 4줄을 덮어도 검증한 쪽은 하나뿐이다.' },
  ];

  const summary = [
    '[Fact] 하나는 Arrange, Act, Assert 세 구획으로 읽히고 Assert가 없으면 가짜 통과다.',
    '[Theory]에 InlineData를 붙이면 본문 한 벌이 케이스 수만큼 독립 테스트로 돈다.',
    'xUnit은 테스트마다 클래스를 새로 만들어 생성자와 Dispose로 상태를 격리한다.',
    '외부 의존은 Moq로 바꿔 끼우고 Verify로 호출을 확인하되 값 객체까지 모킹하지 않는다.',
  ];
  const review = [
    { q: '테스트를 하나씩 돌리면 모두 통과하는데 dotnet test로 전체를 돌리면 가끔 깨진다. 먼저 의심할 것은?',
      o: ['테스트 클래스의 static 필드에 쌓이는 상태', 'Assert.Equal의 인자 순서', 'InlineData의 경계값'], a: 0,
      why: '인스턴스는 테스트마다 새로 만들어지지만 static은 남는다. 실행 순서에 따라 앞 테스트의 흔적이 보이면 이런 증상이 난다.' },
    { q: '회원가입 테스트가 네트워크 상태에 따라 통과와 실패를 오간다. 가장 알맞은 처방은?',
      o: ['재시도 횟수를 늘린다', 'IEmailSender를 Mock으로 바꿔 주입하고 Verify로 호출만 확인한다', '테스트에서 Assert를 뺀다'], a: 1,
      why: '진짜 SMTP를 부르면 단위 테스트가 아니다. 인터페이스로 받는 설계라 email.Object를 넣으면 빠르고 결정적인 테스트가 된다.' },
    { q: 'Assert.True(result == 5)가 실패했는데 리포트에 실제 값이 없어 원인을 못 찾았다. 어떻게 고치는가?',
      o: ['Assert.Equal(5, result)로 바꾼다', 'try/catch로 감싸 로그를 찍는다', '[Theory]로 바꾼다'], a: 0,
      why: '구체적인 Assert를 쓰면 기대값과 실제값이 리포트에 함께 남는다. try/catch는 실패를 숨길 수 있어 오히려 위험하다.' },
  ];

  R.page({ title: 'xUnit — 테스트가 도는 모습', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
