/* V-1-2 테스트(pytest) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인(python 3.12, pytest 9.0.2): test_calc 2 passed, add 가 4를 돌려주면 "E  assert 4 == 5",
 * parametrize id test_is_even[2-True]…[-4-True], fixture 순서 setup→teardown→setup→teardown(실패해도 teardown 실행),
 * scope="module" 이면 setup 1번이고 셋째 테스트가 n=2 를 본다, 전역 cache 는 단독 1 passed / 함께 1 failed "assert {'k': 1} == {}". */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, cross, check, terminal, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const typed = (s, p) => s.slice(0, Math.round(s.length * clamp(p)));
  // 이름표 → 객체 (파이썬 변수 = 객체를 가리키는 이름)
  function nameTag(x, y, name, o) { o = o || {}; const w = tw(name, 15) + 22;
    card(x + w / 2, y, w, 30, { rx: 6, text: name, mono: true, fs: 15, fw: 700, stroke: o.col || INFO, color: o.col || INFO, fill: o.fill, s: o.s, op: o.op }); return x + w; }
  function obj(cx, cy, v, o) { o = o || {}; const r = o.r || 22; const g = R.G(cx, cy, o.s ?? 1, o.op);
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': 2.2 }, g);
    tx(0, 5.5, v, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, class: 'mono', fill: o.col || INK }, g); }
  function tracker(k, labels, x0) { labels.forEach((s, i) => { const x = (x0 || 120) + i * 240, on = i === k, done = i < k;
    card(x, 30, 218, 34, { rx: 17, text: s, fs: 14, fw: 700, stroke: on ? BAD : done ? GOOD : GRID, color: on ? BAD : done ? GOOD : MUT, fill: on ? C.BADBG : PANEL, sw: on ? 2.4 : 1.5 }); }); }

  // ═════════ 1. 순수 assert + AAA ═════════
  function aaa(k, u) { const x = 30, w = 430;
    const head = k >= 1, a = k === 1 ? fade(u, 1.4) : 1;
    el('rect', { x, y: 40, width: w, height: 330, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 16, 68, head ? 'def test_add_two_positives():' : 'def test_…():', { 'font-size': 14.5, 'font-weight': 700, fill: head ? INFO : OFF, opacity: head ? a : 1 });
    const bands = [['Arrange 준비', 2], ['Act 실행', 3], ['Assert 검증', 4]];
    bands.forEach(([n, kk], i) => { const y = 90 + i * 92, on = k >= kk, now = k === kk;
      el('rect', { x: x + 12, y, width: w - 24, height: 82, rx: 8, fill: on ? (i === 2 ? C.GOODBG : ACCBG) : SOFT, opacity: now ? 0.3 + 0.7 * fade(u, 0.1) : 1 });
      tx(x + 26, y + 22, n, { 'font-size': 14, 'font-weight': 700, fill: on ? (i === 2 ? GOOD : ACC) : OFF }); });
    // Arrange: a, b 이름표가 2, 3 을 가리킨다
    if (k >= 2) { const p = k === 2 ? u : 3;
      [['a', '2', 0.3], ['b', '3', 0.8]].forEach(([n, v, at], i) => { const y = 148, xx = x + 40 + i * 190;
        const end = nameTag(xx, y, n, { s: pop(p, at) }); grow(end + 2, y, end + 48, y, E(p, at + 0.3, at + 0.7), MUT); obj(end + 74, y, v, { s: pop(p, at + 0.6) }); }); }
    if (k >= 3) { const p = k === 3 ? u : 3, y = 240;
      mono(x + 40, y + 5, 'result = add(a, b)', { 'font-size': 14.5, opacity: fade(p, 0.2) });
      const end = nameTag(x + 230, y, 'result', { s: pop(p, 0.8) }); grow(end + 2, y, end + 44, y, E(p, 1.1, 1.5), MUT); obj(end + 70, y, '5', { s: pop(p, 1.4), col: ACC }); }
    if (k >= 4) { const p = k === 4 ? u : 3, y = 332;
      mono(x + 40, y + 5, 'assert result == 5', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(p, 0.2) });
      pill(x + 340, y, 'PASSED', GOOD, pop(p, 0.9), { fs: 14 }); } }
  function s1(t, c) { const { k, u } = c;
    aaa(k, u); const x = 500;
    if (k === 0) { card(715, 200, 190, 80, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 0.2) }); mono(715, 206, 'add(a, b)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      [['2', 140], ['3', 260]].forEach(([v, y], i) => { const p = seg(u, 0.6 + i * 0.2, 1.4 + i * 0.2), ty = i ? 228 : 172; obj(lerp(530, 585, E(p, 0, 1)), lerp(y, ty, E(p, 0, 1)), v); if (p >= 1) grow(608, ty, 618, ty, 1, MUT, { plain: true }); });
      const q = seg(u, 1.6, 2.3); if (q > 0) obj(lerp(810, 880, E(q, 0, 1)), 200, '5', { col: ACC });
      tx(715, 300, '테스트가 지켜 줄 평범한 함수', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 1) { tx(x, 60, 'pytest 가 이름으로 고른다', { 'font-size': 15, 'font-weight': 700 });
      const L = [['calc.py', false, 0], ['test_calc.py', true, 0], ['def add', false, 1], ['def test_add_two_positives', true, 1]];
      L.forEach(([n, ok, d], i) => { const y = 104 + i * 48, s = pop(u, 0.3 + i * 0.3);
        card(x + 24 * d + 160, y, 300, 36, { rx: 8, stroke: ok ? GOOD : GRID, sw: ok ? 2 : 1.5, fill: ok ? C.GOODBG : PANEL, s });
        mono(x + 24 * d + 22, y + 5, n, { 'font-size': 14.5, 'font-weight': ok ? 700 : 400, fill: ok ? INK : MUT, opacity: s });
        (ok ? check : cross)(x + 24 * d + 290, y, 9, pop(u, 0.6 + i * 0.3)); });
      tx(x, 320, '파일 test_*.py, 함수 test_* 만 수집된다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      tx(x, 346, '이름이 어긋나면 "0개 수집"이 된다', { 'font-size': 14, fill: WARN, opacity: fade(u, 2.1) }); }
    if (k === 2) { tx(x, 100, '이름표 a, b 가 정수 2, 3 을 가리킨다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(x, 128, '검증에 쓸 재료만 만든다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) }); }
    if (k === 3) { tx(x, 190, '대상 함수를 딱 한 번 부른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      for (let i = 0; i < 2; i++) dot([[x + 20 + i * 60, 160], [x + 150, 240], [380, 240]], seg(u, 0.4 + i * 0.2, 1.4 + i * 0.2), ACC, 6); }
    if (k === 4) { tx(x, 70, 'add 가 4를 돌려줬다면', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      terminal(x, 88, 430, 132, ['>       assert result == 5', ['E       assert 4 == 5', '#f87171'], ['FAILED test_bug.py::test_add_two_positives', '#f87171']], lerp(0, 3, E(u, 1.2, 2.2)), { fs: 13.5, lh: 22 });
      tx(x, 250, '좌변과 우변의 실제 값을 풀어 보여 준다', { 'font-size': 14.5, opacity: fade(u, 2.2) });
      tx(x, 276, 'self.assertEqual 없이 assert 한 줄', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.4) }); }
    if (k === 5) { card(715, 160, 420, 110, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 0.2) });
      mono(525, 140, 'def test_add_negative():', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      mono(545, 170, typed('assert add(-1, -1) == -2', seg(u, 0.5, 1.3)), { 'font-size': 14.5 });
      obj(560, 240, '-1', { s: pop(u, 1.3) }); obj(620, 240, '-1', { s: pop(u, 1.4) }); grow(650, 240, 700, 240, E(u, 1.5, 1.8), MUT); obj(730, 240, '-2', { s: pop(u, 1.8), col: ACC });
      pill(830, 240, 'PASSED', GOOD, pop(u, 2.1), { fs: 14 });
      tx(x, 320, '짧은 케이스는 한 줄로 합쳐도 3박자는 같다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 6) { const L = ['$ pytest -v test_calc.py', ['test_calc.py::test_add_two_positives PASSED [ 50%]', '#4ade80'], ['test_calc.py::test_add_negative PASSED     [100%]', '#4ade80'], ['====== 2 passed ======', '#4ade80']];
      terminal(x - 10, 70, 450, 150, L, lerp(0, 4, E(u, 0.2, 1.6)), { fs: 13.5, lh: 24 });
      tx(x, 252, '-v: 테스트마다 한 줄씩 PASSED / FAILED', { 'font-size': 14.5, opacity: fade(u, 1.8) });
      tx(x, 278, '-k add: 이름으로 골라 돌리기', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); } }

  // ═════════ 2. fixture ═════════
  function fixtureCard(k, u) { const x = 30, y = 36, w = 430, h = 170;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.2, opacity: k === 0 ? fade(u, 0.2) : 1 });
    mono(x + 14, y + 22, '@pytest.fixture', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.3) : 1 });
    mono(x + 14, y + 44, 'def sample_db():', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: k === 0 ? fade(u, 0.5) : 1 });
    const half = x + w / 2;
    tx(x + 16, y + 74, 'setup (yield 앞)', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD });
    tx(half + 14, y + 74, 'teardown (yield 뒤)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    if (k >= 1) { const p = k === 1 ? seg(u, 0.2, 1.2) : 1; mono(x + 16, y + 102, typed('db = TmpDB()', p), { 'font-size': 14 }); mono(x + 16, y + 126, typed('db.seed(["a","b"])', p), { 'font-size': 14 }); }
    if (k >= 2) { const g = k === 2 ? E(u, 0.2, 0.9) : 1; el('line', { x1: half, y1: y + 58, x2: half, y2: lerp(y + 58, y + h - 8, g), stroke: ACC, 'stroke-width': 3 });
      mono(half, y + h + 20, 'yield db', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: g }); }
    if (k >= 3) mono(half + 16, y + 102, typed('db.close()', k === 3 ? seg(u, 0.2, 0.8) : 1), { 'font-size': 14 }); }
  // 시간축: blocks [[이름, 길이, 색, 글]] 을 u 만큼 그려 나감
  function timeline(y, blocks, p, title) { let x = 40; const unit = 880 / blocks.reduce((a, b) => a + b[1], 0);
    tx(40, y - 14, title, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const tot = blocks.length; blocks.forEach(([n, len, col, note], i) => { const s = clamp(p * tot - i); if (s > 0) {
        const w = len * unit - 4; el('rect', { x, y, width: w * E(s, 0, 1), height: 44, rx: 6, fill: col === GOOD ? C.GOODBG : col === BAD ? C.BADBG : col === INFO ? C.INFOBG : SOFT, stroke: col, 'stroke-width': 1.8 });
        if (s >= 1) { tx(x + w / 2, y + (note ? 19 : 27), n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col }); if (note) mono(x + w / 2, y + 37, note, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK }); } }
      x += len * unit; }); }
  function s2(t, c) { const { k, u } = c;
    fixtureCard(k, u);
    if (k >= 1 && k <= 4) { const s = k === 1 ? pop(u, 0.9) : 1; dbIcon(560, 110, 'TmpDB', { s });
      cells(640, 88, k === 4 ? ['a', 'b'] : ['a', 'b'], { w: 48, h: 40, style: (i) => ({ s: k === 1 ? pop(u, 1.3 + i * 0.25) : 1 }) }); }
    if (k === 0) { tx(560, 90, '준비 담당 함수', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(560, 116, '함수 이름이 곧 fixture 이름', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.1) }); }
    if (k === 2) { const p = seg(u, 0.9, 1.9); card(700, 300, 300, 70, { rx: 10, stroke: INFO, s: pop(u, 0.7) });
      mono(700, 290, 'test_…(sample_db)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) });
      fly(560, 150, 700, 318, p, 'db', { mono: true, stay: true });
      tx(245, 300, '여기서 테스트로 넘어가고', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(245, 326, '테스트가 끝나면 이어서 돈다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 3) { timeline(290, [['setup', 1, GOOD], ['test_fail', 1.4, BAD, 'assert False'], ['teardown', 1.2, INFO, 'db.close()']], E(u, 0.4, 2.0), '테스트가 실패해도 정리는 돈다 (실행 확인)');
      if (u > 2.1) check(880, 312, 10, pop(u, 2.1)); }
    if (k === 4) { card(480, 300, 420, 76, { rx: 10, stroke: INFO, s: pop(u, 0.2) });
      mono(290, 292, 'def test_query(', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(425, 292, 'sample_db', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) }); mono(506, 292, '):', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(310, 318, 'assert sample_db.count() == 2', { 'font-size': 14.5, opacity: fade(u, 1.4) }); pill(800, 318, 'PASSED', GOOD, pop(u, 1.9), { fs: 13.5 });
      const g = E(u, 0.7, 1.4); el('path', { d: `M 160 85 C 160 200, 480 200, ${lerp(160, 485, g)} ${lerp(85, 276, g)}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: g });
      tx(250, 250, '같은 이름 = 자동 주입', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); }
    if (k === 5) { timeline(268, [['setup', 1, GOOD], ['test_insert', 1.6, INFO, 'a b c → 3'], ['teardown', 1.1, MUT], ['setup', 1, GOOD], ['test_query', 1.6, INFO, 'a b → 2'], ['teardown', 1.1, MUT]], E(u, 0.2, 2.2), 'scope="function" (기본): 테스트마다 새 db');
      tx(480, 362, 'test_insert 가 넣은 c 는 test_query 에 남지 않는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.3) }); }
    if (k === 6) { mono(560, 80, '@pytest.fixture(scope="module")', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      tx(560, 110, '무거운 준비를 한 번만', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4) });
      timeline(268, [['setup', 1, GOOD], ['test_a', 1.2, INFO, 'n: 0 → 1'], ['test_b', 1.2, INFO, 'n: 1 → 2'], ['test_c', 1.2, WARN, 'n = 2 를 봄'], ['teardown', 1, MUT]], E(u, 0.3, 2.0), 'scope="module": 모듈에 한 번 (실행 확인)');
      tx(480, 362, '준비는 1번으로 줄지만 앞 테스트의 상태가 새어 든다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.2) }); } }

  // ═════════ 3. parametrize ═════════
  const CASES = [['2', 'True', 2], ['3', 'False', 2], ['0', 'True', 3, '경계값'], ['-4', 'True', 3, '음수']];
  function table(k, u) { const x = 40, y = 110, cw = [110, 130];
    el('rect', { x, y, width: 240, height: 36, rx: 6, fill: SOFT });
    const hp = k === 1 ? fade(u, 1.0) : 1;
    mono(x + 16, y + 24, 'n', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: hp }); mono(x + cw[0] + 16, y + 24, 'expected', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: hp });
    let i = 0; CASES.forEach(([n, e, kk, tag]) => { if (kk > k) return; const now = kk === k, p = now ? seg(u, 0.3 + (i % 2) * 0.5, 0.9 + (i % 2) * 0.5) : 1, yy = y + 46 + i * 42; i++;
      el('rect', { x, y: yy, width: 240 * p, height: 36, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      if (p >= 1) { mono(x + 16, yy + 24, n, { 'font-size': 15, 'font-weight': 700 }); mono(x + cw[0] + 16, yy + 24, e, { 'font-size': 15, fill: e === 'True' ? GOOD : BAD, 'font-weight': 700 });
        if (tag) tx(x + 250, yy + 24, tag, { 'font-size': 14, 'font-weight': 700, fill: WARN }); } });
    return i; }
  function s3(t, c) { const { k, u } = c, x = 520;
    if (k === 0) { card(480, 180, 260, 90, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 0.2) }); mono(480, 172, 'is_even(n)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(480, 200, 'n % 2 == 0', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
      [['2', 'True', GOOD], ['3', 'False', BAD], ['-4', 'True', GOOD]].forEach(([a, b, col], i) => { const p = seg(u, 0.8 + i * 0.5, 1.4 + i * 0.5), y = 120 + i * 60;
        if (p > 0 && p < 1) obj(lerp(160, 330, E(p, 0, 1)), lerp(y, 180, E(p, 0, 1)), a);
        if (p >= 1) { mono(700, y + 5, a + ' → ' + b, { 'font-size': 15, 'font-weight': 700, fill: col }); } });
      tx(480, 330, '입력만 바뀌고 로직은 같다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); return; }
    mono(40, 64, '@pytest.mark.parametrize("n, expected", [', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: k === 1 ? fade(u, 0.2) : 1 });
    if (k === 1) { [[279, 60], [337, 170]].forEach(([sx, tx2], i) => grow(sx, 72, tx2, 108, E(u, 0.8 + i * 0.3, 1.3 + i * 0.3), ACC));
      tx(x + 120, 200, '이름 순서 = 튜플 값 순서', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(x + 120, 226, '어긋나면 조용히 틀린다', { 'font-size': 14.5, fill: WARN, opacity: fade(u, 1.8) }); }
    const n = table(k, u);
    if (k === 2 || k === 3) { const shown = k === 2 ? 2 : 4;
      for (let i = 0; i < shown; i++) { const [a, b] = CASES[i], now = (k === 2 && i < 2) || (k === 3 && i >= 2), s = now ? pop(u, 1.0 + (i % 2) * 0.4) : 1;
        card(720, 140 + i * 56, 300, 40, { rx: 8, text: `test_is_even[${a}-${b}]`, mono: true, fs: 14.5, stroke: INFO, color: INFO, s }); }
      tx(720, 384, `행 ${shown}개 = 테스트 ${shown}개`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) }); }
    if (k === 4) { card(720, 200, 330, 80, { rx: 10, stroke: ACC, sw: 2.5, s: pop(u, 0.2) });
      mono(570, 190, 'def test_is_even(n, expected):', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      mono(590, 216, 'assert is_even(n) == expected', { 'font-size': 14, opacity: fade(u, 0.3) });
      for (let i = 0; i < 4; i++) dot([[285, 176 + i * 42], [450, 176 + i * 42], [555, 200]], seg(u, 0.6 + i * 0.35, 1.4 + i * 0.35), ACC, 6);
      const runs = Math.min(4, Math.max(0, Math.floor((u - 1.4) / 0.35) + 1));
      mono(720, 290, `본문 1벌 · 실행 ${runs}번`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      tx(720, 330, '고칠 곳은 한 군데뿐', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 5) { const L = ['$ pytest -v test_num.py'].concat(CASES.map(([a, b]) => [`test_is_even[${a}-${b}]`.padEnd(23) + ' PASSED', '#4ade80'])).concat([['====== 4 passed ======', '#4ade80']]);
      terminal(400, 100, 520, 180, L, lerp(0, L.length, E(u, 0.2, 1.8)), { fs: 14, lh: 22 });
      tx(660, 316, '케이스 이름에 입력값이 찍힌다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(660, 342, '하나가 깨져도 나머지는 따로 계속 돈다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); } }

  // ═════════ 4. raises · monkeypatch · mock ═════════
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(480, 70, 'with pytest.raises(ValueError, match="음수"):', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.2) });
      el('path', { d: 'M 560 140 L 560 300 Q 680 340 800 300 L 800 140', fill: C.WARNBG, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.4) });
      tx(680, 128, '이 안에서 나야 통과', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.6) });
      card(220, 220, 240, 50, { rx: 10, text: 'parse_age("-1")', mono: true, fs: 16, stroke: INK, s: pop(u, 0.5) });
      const p = seg(u, 1.0, 2.0); if (p > 0) card(lerp(350, 680, E(p, 0, 1)), lerp(220, 260, E(p, 0, 1)), 150, 34, { rx: 17, text: 'ValueError', mono: true, fs: 14, fill: BAD, stroke: 'none', color: PANEL });
      if (u > 2.0) pill(680, 360, 'PASSED', GOOD, pop(u, 2.0), { fs: 14 });
      tx(220, 300, '예외가 안 나면 FAILED', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { zone(40, 90, 380, 220, 'service 모듈', { stroke: INK, fill: SOFT, color: INK });
      card(230, 150, 220, 40, { rx: 8, text: 'finish_job()', mono: true, fs: 15, s: pop(u, 0.2) });
      const end = nameTag(100, 240, 'notify', { col: INK });
      grow(230, 172, 160, 222, E(u, 1.0, 1.4), MUT);
      card(640, 240, 220, 60, { rx: 10, stroke: ACC, sw: 2.4, s: pop(u, 0.4) }); mono(640, 236, 'spy = MagicMock()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      const g = E(u, 0.6, 1.0); el('line', { x1: end + 2, y1: 240, x2: lerp(end + 2, 528, g), y2: 240, stroke: ACC, 'stroke-width': 2.5, 'marker-end': g > 0.98 ? 'url(#ra-ahb)' : null });
      const n = u > 1.5 ? 1 : 0; mono(640, 262, 'call_count = ' + n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: n ? GOOD : MUT, opacity: fade(u, 0.6) });
      dot([[230, 172], [160, 222], [end, 240], [528, 240]], seg(u, 1.0, 1.6), ACC, 6);
      mono(640, 340, 'spy.assert_called_once()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); check(800, 336, 10, pop(u, 2.1));
      tx(480, 396, '값뿐 아니라 "몇 번 불렸나"까지 검증한다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k 1~4: service.http_get 이름표가 진짜 → 가짜로 옮겨 간다
    zone(40, 120, 300, 150, 'service 모듈', { stroke: INK, fill: SOFT, color: INK });
    const end = nameTag(60, 200, 'http_get', { col: INK });
    card(640, 110, 250, 64, { rx: 10, stroke: BAD, sw: 2, fill: C.BADBG });
    mono(640, 104, 'requests.get(URL)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD }); tx(640, 128, '느림 · 네트워크 · flaky', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD });
    if (k >= 2) { card(640, 300, 290, 64, { rx: 10, stroke: GOOD, sw: 2, fill: C.GOODBG, s: k === 2 ? pop(u, 0.3) : 1 });
      mono(640, 294, 'fake_get(url)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: k === 2 ? fade(u, 0.4) : 1 });
      mono(640, 318, '{"status": 200, "body": "OK"}', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.6) : 1 }); }
    const sw = k === 3 ? E(u, 0.6, 1.6) : k >= 4 ? 1 : 0, ty = lerp(120, 290, sw), tx2 = lerp(512, 492, sw);
    el('path', { d: `M ${end + 2} 200 C ${end + 80} 200, ${tx2 - 80} ${ty}, ${tx2} ${ty}`, fill: 'none', stroke: sw > 0.5 ? GOOD : BAD, 'stroke-width': 2.6, 'marker-end': 'url(#ra-ah)' });
    if (k === 1) { pill(190, 330, 'monkeypatch', ACC, pop(u, 0.5), { mono: true }); tx(190, 370, '인자 이름만 적으면 주입', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      for (let i = 0; i < 3; i++) dot([[end, 200], [512, 120]], ((u * 0.5 + i / 3) % 1), BAD, 5);
      tx(640, 200, '진짜 네트워크를 탄다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.2) }); }
    if (k === 2) tx(640, 380, '항상 같은 응답 = 결정적', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) });
    if (k === 3) { mono(190, 330, 'monkeypatch.setattr(', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(190, 352, 'service, "http_get", fake_get)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(190, 392, '테스트가 끝나면 원래대로 되돌린다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); cross(800, 80, 9, pop(u, 1.6)); }
    if (k === 4) { card(190, 70, 260, 40, { rx: 8, text: 'fetch_status("http://x")', mono: true, fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      dot([[190, 92], [190, 180], [end, 200], [492, 290]], seg(u, 0.4, 1.4), ACC, 7);
      cross(640, 60, 9, 1); tx(760, 64, '네트워크 없음', { 'font-size': 14, fill: MUT, opacity: 1 });
      pill(190, 330, 'result == "OK"', GOOD, pop(u, 1.6), { mono: true }); check(300, 330, 10, pop(u, 1.9));
      tx(190, 380, '우리 로직은 진짜로, 경계만 가짜로', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); } }

  // ═════════ 5. 커버리지 · 함정 4종 ═════════
  const PIT = ['① 상태 공유', '② 외부 API', '③ 과한 모킹', '④ assert 없음'];
  function dictBox(cx, cy, v, col, s) { card(cx, cy, 120, 44, { rx: 8, text: v, mono: true, fs: 15, stroke: col || INK, color: col || INK, s }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(40, 52, 'pytest --cov=service', { 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.1) });
      tx(920, 52, '숫자는 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const N = 33; for (let i = 0; i < N; i++) { const miss = i >= 25 && i <= 28, s = clamp(E(u, 0.2, 1.6) * N - i), x = 60 + (i % 11) * 78, y = 90 + Math.floor(i / 11) * 54;
        if (s <= 0) continue; el('rect', { x, y, width: 66, height: 40, rx: 6, fill: miss ? C.BADBG : C.GOODBG, stroke: miss ? BAD : GOOD, 'stroke-width': 1.6, opacity: s }); }
      mono(480, 290, 'service.py   88%   Missing: 42-45', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      tx(480, 334, '초록 = 테스트 중에 실행된 줄, 검증된 줄이 아니다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) });
      tx(480, 362, 'assert 가 없어도 칸은 초록이 된다. 안 닿은 곳을 찾는 데 쓴다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); return; }
    tracker(k - 1, PIT);
    if (k === 1) { zone(40, 70, 420, 250, '모듈 전역 cache = {}', { stroke: BAD, fill: C.BADBG, color: BAD });
      const v = u > 1.0 ? "{'k': 1}" : '{}'; dictBox(250, 160, v, BAD, 1);
      card(140, 260, 150, 40, { rx: 8, text: 'test_write', mono: true, fs: 14.5, s: pop(u, 0.2) }); card(360, 260, 150, 40, { rx: 8, text: 'test_read', mono: true, fs: 14.5, s: pop(u, 0.4) });
      dot([[140, 240], [230, 182]], seg(u, 0.4, 1.0), ACC, 6); dot([[250, 182], [360, 240]], seg(u, 1.3, 1.9), BAD, 6);
      terminal(500, 70, 420, 120, ['$ pytest test_order.py::test_read', ['1 passed', '#4ade80'], '$ pytest test_order.py'], lerp(0, 3, E(u, 0.3, 1.4)), { fs: 13.5, lh: 21 });
      terminal(500, 200, 420, 100, [["E  assert {'k': 1} == {}", '#f87171'], ['1 failed, 1 passed', '#f87171']], lerp(0, 2, E(u, 1.6, 2.3)), { fs: 13.5, lh: 21 });
      tx(480, 370, '혼자 돌리면 통과, 함께 돌리면 실패: 순서에 기댄 테스트', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.4) }); }
    if (k === 2) { card(240, 100, 260, 44, { rx: 8, text: '@pytest.fixture  def cache()', mono: true, fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
      ['test_write', 'test_read'].forEach((n, i) => { const cx = 120 + i * 240; card(cx, 290, 150, 40, { rx: 8, text: n, mono: true, fs: 14.5, s: pop(u, 0.4 + i * 0.2) });
        grow(240, 122, cx, 180, E(u, 0.6 + i * 0.3, 1.1 + i * 0.3), GOOD); dictBox(cx, 210, i === 0 && u > 1.8 ? "{'k': 1}" : '{}', GOOD, pop(u, 1.0 + i * 0.3)); });
      tx(240, 360, '테스트마다 새 딕셔너리', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
      zone(560, 80, 360, 230, '② 외부 API 도 같은 원리', { stroke: GRID, fill: SOFT, op: fade(u, 1.2) });
      mono(740, 170, 'requests.get(REAL_URL)', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 1.4) });
      mono(740, 214, 'monkeypatch → fake_get', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(740, 262, '오프라인 · 결정적', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) }); }
    if (k === 3) { [['write → read', 0.2], ['read → write', 0.8]].forEach(([n, a], i) => { const y = 110 + i * 90;
        mono(60, y + 5, '순서 ' + n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); pill(330, y, 'test_read PASSED', GOOD, pop(u, a + 0.4), { fs: 13.5 }); });
      tx(230, 300, '인자로 받은 cache 는 이 테스트만의 것', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) });
      zone(560, 80, 360, 230, '③ 과한 모킹', { stroke: WARN, fill: C.WARNBG, color: WARN, op: fade(u, 1.2) });
      mono(740, 150, 'mock 이 정답을 그대로 반환', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      card(740, 200, 160, 36, { rx: 8, text: '우리 로직', fs: 14, stroke: OFF, color: OFF, dash: '5 4', op: fade(u, 1.6) }); cross(830, 200, 8, pop(u, 1.8));
      tx(740, 262, '가짜끼리 통과, 보증 0', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(740, 288, '경계만 가짜로 바꾼다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 4) { const bad = u > 0.8;
      card(480, 90, 360, 40, { rx: 8, text: 'service.run()  →  "error" 를 돌려준다면?', fs: 14.5, stroke: WARN, color: WARN, s: pop(u, 0.2) });
      [['def test_run():', 'service.run()   # 끝', 'PASSED', GOOD, '아무것도 확인 안 함'], ['def test_run_returns_ok():', 'assert service.run() == "ok"', 'FAILED', BAD, '버그를 잡는다']].forEach(([a, b, r, col, note], i) => {
        const x = 50 + i * 450, at = 0.6 + i * 0.6; el('rect', { x, y: 150, width: 410, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, at) });
        mono(x + 16, 182, a, { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, at) }); mono(x + 36, 210, b, { 'font-size': 14.5, opacity: fade(u, at) });
        if (bad) pill(x + 90, 262, r, col, pop(u, at + 0.7), { fs: 14 }); tx(x + 160, 268, note, { 'font-size': 14, fill: MUT, opacity: fade(u, at + 0.9) }); });
      tx(480, 350, '왼쪽 초록은 거짓 안심이다. 결과를 반드시 assert 한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      tx(480, 380, '독립 · 빠름 · 명확', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 800, opacity: fade(u, 2.4) }); } }

  const quiz = [
    { q: 'pytest가 테스트로 수집하는 함수는 무엇인가?',
      o: ['test_로 시작하는 파일 안의 test_로 시작하는 함수', '@test 데코레이터가 붙은 모든 함수', 'assert가 들어 있는 모든 함수'], a: 0,
      why: '파일은 test_*.py, 함수는 test_*여야 자동으로 수집된다. 이름이 어긋나면 0개가 수집된다.' },
    { q: 'fixture에서 yield 뒤에 둔 db.close()는 언제 실행되는가?',
      o: ['fixture를 선언하는 순간', '테스트가 성공했을 때만', '테스트가 끝난 뒤, 실패했어도'], a: 2,
      why: 'yield 앞이 준비, 뒤가 정리다. 실패한 테스트 뒤에도 정리 코드가 돈다는 것을 실행으로 확인했다.' },
    { q: 'parametrize 표에 (2, True), (3, False), (0, True), (-4, True) 네 줄을 적으면 리포트에는 테스트가 몇 개 나오는가?',
      o: ['1개, 본문이 하나라서', '4개, 행마다 따로', '8개, 값이 두 개씩이라서'], a: 1,
      why: '행 하나가 테스트 하나다. test_is_even[2-True]처럼 입력값이 이름에 찍혀 4개가 따로 보고된다.' },
    { q: 'monkeypatch.setattr(service, "http_get", fake_get)이 하는 일은 무엇인가?',
      o: ['service 모듈의 http_get 이름표가 fake_get을 가리키게 바꾼다', 'fake_get을 네트워크로 보낸다', 'http_get 함수 코드를 영구히 고친다'], a: 0,
      why: '모듈 속성 이름이 가리키는 대상만 바꾼다. 테스트가 끝나면 원래 함수로 되돌린다.' },
    { q: '혼자 돌리면 통과하고 전체로 돌리면 깨지는 테스트의 흔한 원인은 무엇인가?',
      o: ['assert를 너무 많이 썼다', 'parametrize를 썼다', '모듈 전역 상태를 여러 테스트가 함께 바꾼다'], a: 2,
      why: '전역 cache를 test_write가 바꾸면 test_read가 assert {\'k\': 1} == {}로 깨진다. fixture로 매번 새 상태를 준다.' },
  ];

  const summary = [
    'pytest는 test_ 이름 규칙으로 테스트를 모으고, 순수 assert 하나로 실제 값을 보여 준다.',
    'fixture는 yield 앞에서 준비하고 뒤에서 정리한다. 테스트가 실패해도 정리는 돈다.',
    'parametrize 표의 행 하나가 테스트 하나가 되어, 경계값까지 표로 관리한다.',
    '네트워크 같은 경계만 monkeypatch로 바꾸고, 결과는 반드시 assert로 확인한다.',
  ];
  const review = [
    { q: 'CI에서 외부 API가 잠깐 죽은 날마다 테스트가 빨갛게 된다. 먼저 손볼 곳은?',
      o: ['재시도 횟수를 늘린다', 'API 호출 함수를 monkeypatch로 가짜 응답으로 바꾼다', '커버리지 목표를 낮춘다'], a: 1,
      why: '통제할 수 없는 네트워크가 결과를 흔든다. 경계를 가짜로 바꾸면 우리 로직만 결정적으로 검증된다.' },
    { q: 'scope="module" fixture로 바꿨더니 셋째 테스트가 앞 테스트의 값(n=2)을 보고 깨졌다. 맞는 해석은?',
      o: ['준비가 한 번만 되어 상태를 함께 쓰게 됐다', 'pytest 버그다', 'yield 뒤 정리 코드가 테스트마다 돌아서다'], a: 0,
      why: 'module 범위는 모듈에 한 번만 준비한다. 빠르지만 상태가 새므로 격리가 필요하면 기본 function 범위를 쓴다.' },
    { q: '커버리지 100%인데 버그가 그대로 배포됐다. 가장 먼저 의심할 것은?',
      o: ['테스트 수가 너무 많다', 'parametrize 행이 많다', '실행만 하고 결과를 assert 하지 않는 테스트'], a: 2,
      why: '커버리지는 실행된 줄을 셀 뿐이다. assert가 없으면 예외만 안 나도 통과한다.' },
  ];

  R.page({ title: '테스트(pytest)', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
