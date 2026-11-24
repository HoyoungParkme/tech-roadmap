/* I-2-1 when 식 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그리는 것: 값이 갈래를 따라 흘러 한 가지에서 멈추는 모습(when 의 갈래), 수직선 위 범위, 타입별 통,
 * 위에서부터 조건을 하나씩 묻는 사다리, sealed 계층의 닫힌 울타리.
 * 입력값(나이 5·25·80, 점수 92·78·55, n 7·42·1000, Success(42))은 페이지 데이터에서 나온다.
 * 3단계의 잔액 -500 · 500 · 2,000,000 · 50,000 은 갈래를 보이려고 고른 예시값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, G, terminal, bump } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const tok = (cx, cy, s, sc, col, o) => pill(cx, cy, s, col || INFO, sc, { mono: true, fs: 14, fill: (o && o.fill) || PANEL });

  // 갈래 묶음: 왼쪽 입구(x0,y0)에서 가지 rows[i] = [조건, 결과] 로 갈라진다. hot = 걸린 가지
  function branches(x0, y0, rows, o) { o = o || {}; const by = (i) => o.top + i * o.gap, bx = o.bx || x0 + 150;
    rows.forEach(([cnd, out], i) => { const y = by(i), on = o.hot === i, sh = o.sh ? o.sh(i) : 1; if (sh <= 0) return;
      el('path', { d: `M${x0},${y0} C${x0 + 60},${y0} ${bx - 70},${y} ${bx - 4},${y}`, fill: 'none', stroke: on ? ACC : GRID, 'stroke-width': on ? 3 : 2, opacity: sh });
      card(bx + 80, y, 160, 40, { rx: 8, text: cnd, mono: true, fs: 14.5, stroke: on ? ACC : (o.cndCol && o.cndCol(i)) || INK, fill: on ? ACCBG : PANEL, s: sh });
      if (out != null) { grow(bx + 162, y, bx + 222, y, sh, on ? ACC : OFF);
        mono(bx + 232, y + 5, out, { 'font-size': 15, 'font-weight': 700, fill: on ? ACC : MUT, opacity: sh }); } });
    return { by, bx }; }
  // 흐르는 점: 입구 → 가지 i 의 조건 상자
  const flowTo = (x0, y0, b, i, u, col) => dot([[x0 - 90, y0], [x0, y0], [b.bx - 4, b.by(i)], [b.bx + 160, b.by(i)]], u, col || ACC, 8);

  // =========================================================
  // 1. Java switch — 같은 값만, 그리고 새어 나간다
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const SL = [['case "view"', '"보기"'], ['case "edit"', '"편집"'], ['default', '"?"']];
      zone(330, 40, 300, 300, 'switch (mode)', { stroke: INK, sw: 2, color: INK, fill: SOFT });
      SL.forEach(([s, r], i) => { const y = 110 + i * 82; card(430, y, 160, 46, { rx: 8, text: s, mono: true, fs: 15, stroke: i === 2 ? WARN : INK, s: pop(u, 0.1 + i * 0.1) });
        mono(540, y + 5, r, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) }); });
      [['"view"', 0, GOOD], ['"edit"', 1, GOOD], ['"VIEW"', 2, BAD]].forEach(([s, j, col], i) => { const a = 0.5 + i * 0.6, p = E(u, a, a + 0.5), y = 110 + j * 82;
        if (p <= 0) return; const x = lerp(150, 300, p); tok(x, lerp(110 + i * 82, y, p), s, 1, col);
        if (p >= 1) { if (col === GOOD) check(800, y, 10, pop(u, a + 0.5)); } });
      sub(780, 280, '"VIEW" ≠ "view" · default로 빠진다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      sub(780, 320, '"같은 값인가"만 물을 수 있다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { card(480, 170, 220, 120, { rx: 14, text: 'switch', mono: true, fs: 20, stroke: INK, fill: SOFT, s: pop(u, 0.1) });
      [['count > 10', '범위 조건 없음', 80], ['x is User', '옛 switch는 타입 검사 없음', 170], ['val r = switch…', '문이라 값이 안 나온다', 260]].forEach(([s, why, y], i) => { const a = 0.3 + i * 0.5, p = E(u, a, a + 0.4), back = E(u, a + 0.4, a + 0.7);
        if (p > 0) tok(lerp(120, 300, p) - back * 60, y, s, 1, p >= 1 ? BAD : INK);
        if (p >= 1) { cross(355, y - 22, 8, pop(u, a + 0.4)); tx(620, y + 5, why, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, a + 0.5) }); } });
      banner(480, 360, '결국 if / else 사다리로 밀려난다', pop(u, 2.1)); return; }
    // k2: fall-through
    const BL = [['case 1:', 'doA();', 90], ['case 2:', 'doB();', 230]];
    BL.forEach(([cs, call, y], i) => { card(330, y, 280, 90, { rx: 12, stroke: INK, s: pop(u, 0.1 + i * 0.15) });
      const lit = (i === 0 && u > 0.9) || (i === 1 && u > 1.8); if (lit) el('rect', { x: 196, y: y - 44, width: 268, height: 88, rx: 10, fill: i ? BADBG : ACCBG, opacity: 0.8 });
      mono(210, y - 14, cs, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(230, y + 20, call, { 'font-size': 16, 'font-weight': lit ? 800 : 400, fill: lit ? (i ? BAD : ACC) : INK, opacity: fade(u, 0.2) }); });
    el('line', { x1: 210, y1: 158, x2: 450, y2: 158, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 6', opacity: fade(u, 0.4) });
    tx(480, 164, '// break 빠뜨림', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.4) });
    tok(330, 30, 'n = 1', pop(u, 0.2), ACC);
    dot([[330, 46], [330, 90], [330, 230], [330, 300]], seg(u, 0.5, 2.0), ACC, 9);
    card(760, 160, 260, 90, { rx: 12, text: 'n = 1인데\ndoA, doB 둘 다 실행', fs: 16, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.1) }); }

  // =========================================================
  // 2. when 기본 — 가지 하나에서 끝나고 값이 나온다
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const X0 = 200, Y0 = 200, rows = [['"view" ->', '"보기"'], ['"edit" ->', '"편집"'], ['else ->', '"?"']];
      mono(60, 150, 'when (mode)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      const b = branches(X0, Y0, rows, { top: 90, gap: 90, hot: u > 1.2 ? 0 : -1, sh: (i) => E(u, 0.1 + i * 0.15, 0.5 + i * 0.15) });
      tok(110, 200, '"view"', pop(u, 0.5), ACC); flowTo(X0, Y0, b, 0, seg(u, 0.6, 1.2));
      card(820, 300, 200, 56, { rx: 10, stroke: GOOD, s: pop(u, 1.8) }); mono(740, 306, 'val label', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      fly(b.bx + 260, 90, 860, 300, seg(u, 1.6, 2.2), '"보기"', { mono: true, stay: true });
      sub(480, 395, 'break 없이 끝나고 결과가 label에 담긴다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const X0 = 200, Y0 = 200, rows = [['"view", "preview"', '"읽기 그룹"'], ['"edit", "draft"', '"쓰기 그룹"'], ['else', '"기타"']];
      mono(60, 150, 'when (mode)', { 'font-size': 16, 'font-weight': 800 });
      const hot = u > 2.0 ? 1 : u > 1.1 ? 0 : -1;
      const b = branches(X0, Y0, rows, { top: 90, gap: 100, hot, bx: 330, sh: (i) => pop(u, 0.1 + i * 0.15) });
      tok(110, 200, u < 1.3 ? '"preview"' : '"draft"', 1, ACC);
      flowTo(X0, Y0, b, 0, seg(u, 0.4, 1.1)); flowTo(X0, Y0, b, 1, seg(u, 1.4, 2.0));
      sub(410, 395, '콤마로 묶은 값은 같은 가지로 간다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const L = [['1 ->', 'doA()', 120], ['2 ->', 'doB()', 260]];
      mono(60, 60, 'when (n)', { 'font-size': 16, 'font-weight': 800 });
      L.forEach(([a, b2, y], i) => { const lit = (i === 0 && u > 0.8 && u < 1.6) || (i === 1 && u > 1.9);
        card(400, y, 340, 90, { rx: 12, stroke: lit ? ACC : INK, fill: lit ? ACCBG : PANEL, s: pop(u, 0.1 + i * 0.15) });
        mono(260, y + 6, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(340, y + 6, b2, { 'font-size': 16, 'font-weight': 700, fill: lit ? ACC : INK, opacity: fade(u, 0.2) }); });
      el('line', { x1: 230, y1: 190, x2: 570, y2: 190, stroke: INK, 'stroke-width': 4, opacity: fade(u, 0.3) });
      tok(150, 120, 'n = 1', pop(u, 0.3), ACC); dot([[190, 120], [400, 120], [800, 120]], seg(u, 0.5, 1.5), ACC, 9);
      tok(150, 260, 'n = 2', pop(u, 1.4), ACC); dot([[190, 260], [400, 260], [800, 260]], seg(u, 1.6, 2.5), ACC, 9);
      mono(840, 126, 'doA()만', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); mono(840, 266, 'doB()만', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.5) });
      sub(400, 380, '가지 사이에 새어 나갈 길이 없다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3: when 은 식 — 값이 들어갈 자리 세 곳
    card(200, 200, 200, 110, { rx: 16, text: 'when (mode)\n{ … }', mono: true, fs: 17, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.1) });
    [['val label = ', 90], ['return ', 200], ['println( … )', 310]].forEach(([s, y], i) => { const a = 0.5 + i * 0.45;
      grow(302, 200, 540, y, E(u, a, a + 0.4), ACC); card(700, y, 300, 56, { rx: 12, stroke: INK, s: pop(u, a + 0.3) });
      mono(570, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, a + 0.3) });
      fly(302, 200, 790, y, seg(u, a + 0.4, a + 0.9), '"보기"', { mono: true, stay: true }); });
    sub(200, 300, '문이 아니라 값', fade(u, 2.0), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }

  // =========================================================
  // 3. in · is · 인자 없는 when
  // =========================================================
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const X = (v) => 80 + v * 8.4, Y = 210;
      el('line', { x1: X(0), y1: Y, x2: X(96), y2: Y, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.1) });
      [0, 13, 18, 65, 95].forEach((v) => { el('line', { x1: X(v), y1: Y - 6, x2: X(v), y2: Y + 6, stroke: INK, 'stroke-width': 2 }); mono(X(v), Y + 26, v === 95 ? '…' : String(v), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
      [[0, 12, 'in 0..12', '"어린이"', INFO], [13, 17, 'in 13..17', '"청소년"', WARN], [18, 64, 'in 18..64', '"성인"', GOOD], [65, 95, 'else', '"노인"', MUT]].forEach(([a, b, lab, out, col], i) => { const p = E(u, 0.2 + i * 0.25, 0.6 + i * 0.25);
        el('rect', { x: X(a), y: Y - 34, width: (X(b + 1) - X(a) - 3) * p, height: 22, rx: 5, fill: col, opacity: 0.25 });
        const mx = i === 1 ? X(15) : (X(a) + X(b + 1)) / 2, dy = i === 1 ? 50 : 0;
        mono(mx, Y + 56 + dy, lab, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: p }); mono(mx, Y + 80 + dy, out, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: p }); });
      [5, 25, 80].forEach((v, i) => { const a = 1.3 + i * 0.4, p = E(u, a, a + 0.4); if (p <= 0) return;
        const y = lerp(40, Y - 38, p); el('path', { d: `M${X(v)},${y} l-8,-14 h16 z`, fill: ACC }); mono(X(v), y - 22, 'age ' + v, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); });
      sub(480, 390, '가지마다 값 하나가 아니라 범위를 받는다', fade(u, 2.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const BIN = [['is Int', '"정수 5"', '5'], ['is String', '"문자열 길이 3"', '"abc"'], ['is List<*>', '"리스트 크기 2"', 'listOf(1,2)']];
      mono(40, 50, 'fun describe(x: Any) = when (x)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.1) });
      BIN.forEach(([ty, out, inp], i) => { const x = 170 + i * 310, a = 0.4 + i * 0.5, p = E(u, a, a + 0.5);
        el('path', { d: `M${x - 100},150 L${x - 80},290 H${x + 80} L${x + 100},150`, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.2) });
        mono(x, 175, ty, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.2) });
        if (p > 0) tok(x, lerp(90, 228, p), inp, 1, ACC);
        if (p >= 1) mono(x, 330, out, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, a + 0.5) }); });
      card(480, 385, 470, 40, { rx: 10, text: '가지 안에서 x는 그 타입 · x.length, x.size를 바로 쓴다', fs: 14, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 2.2) }); return; }
    // k2: 인자 없는 when — 위에서부터 처음 참인 줄
    const RW = [['balance < 0', '"잔액 부족"'], ['balance < 1_000', '"주의"'], ['balance >= 1_000_000', '"VIP"'], ['else', '"정상"']];
    mono(40, 44, 'val msg = when {', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.1) });
    RW.forEach(([cnd, out], i) => { const y = 90 + i * 68; card(260, y, 300, 50, { rx: 10, text: cnd, mono: true, fs: 15, stroke: INK, s: pop(u, 0.1 + i * 0.1) }); mono(440, y + 5, '-> ' + out, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) }); });
    const EX = [['-500', 0], ['500', 1], ['2,000,000', 2], ['50,000', 3]];
    tx(780, 60, '잔액 예시', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
    EX.forEach(([v, j], i) => { const a = 0.6 + i * 0.45, y = 90 + j * 68;
      dot([[110, 66], [110, y]], seg(u, a, a + 0.3), ACC, 7);
      if (u > a + 0.3) { el('line', { x1: 580, y1: y, x2: 680, y2: y, stroke: ACC, 'stroke-width': 2, opacity: fade(u, a + 0.3) }); mono(700, y + 5, v, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, a + 0.3) }); } });
    sub(480, 380, '위에서부터 묻고 처음 참인 가지에서 멈춘다', fade(u, 2.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 4. when 은 식 — 값을 돌려준다
  // =========================================================
  const LAD = [['score >= 90', '"A"'], ['score >= 80', '"B"'], ['score >= 70', '"C"'], ['score >= 60', '"D"'], ['else', '"F"']];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 40, 'fun grade(score: Int) = when {', { 'font-size': 15, 'font-weight': 800 });
      LAD.forEach(([cnd, out], i) => { const y = 80 + i * 58; card(250, y, 240, 44, { rx: 10, text: cnd, mono: true, fs: 15, stroke: INK, s: pop(u, 0.05 + i * 0.08) }); mono(390, y + 5, '-> ' + out, { 'font-size': 15, 'font-weight': 700, fill: MUT }); });
      [[92, 0, '"A"'], [78, 2, '"C"'], [55, 4, '"F"']].forEach(([v, j, out], i) => { const x = 600 + i * 130, a = 0.4 + i * 0.6, p = seg(u, a, a + 0.5);
        tok(x, 50, 'grade(' + v + ')', pop(u, a - 0.2), ACC);
        dot([[x, 70], [x, 80 + j * 58]], p, ACC, 8);
        for (let r = 0; r < j; r++) if (p > (r + 1) / (j + 1)) cross(x, 80 + r * 58, 7, 1);
        if (p >= 1) mono(x, 80 + j * 58 + 7, out, { 'font-size': 22, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); });
      sub(480, 395, '처음 참이 되는 가지의 값이 곧 반환값', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const X0 = 200, Y0 = 200, rows = [['"KR" ->', 'price * 0.10'], ['"US" ->', 'price * 0.07'], ['else ->', '0.0']];
      mono(40, 150, 'when (region)', { 'font-size': 16, 'font-weight': 800 });
      const b = branches(X0, Y0, rows, { top: 90, gap: 90, hot: u > 1.0 ? 0 : -1, bx: 300, sh: (i) => pop(u, 0.1 + i * 0.1) });
      tok(110, 250, '"KR"', pop(u, 0.3), ACC); flowTo(X0, Y0, b, 0, seg(u, 0.4, 1.0));
      if (u > 1.4) { padlock(690, 330, true, GOOD, pop(u, 1.4)); card(810, 330, 200, 52, { rx: 10, stroke: GOOD, s: pop(u, 1.4) }); mono(730, 336, 'val tax', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4) }); }
      fly(680, 90, 860, 330, seg(u, 1.6, 2.2), 'price * 0.10', { mono: true, stay: true });
      sub(330, 395, '결과를 한 번에 받으니 var가 필요 없다', fade(u, 2.3), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 2) { const L = [['n = 7', '한 자리'], ['n = 42', '두 자리'], ['n = 1000', '큰 수']];
      card(260, 200, 380, 160, { rx: 14, stroke: ACC, fill: ACCBG, s: pop(u, 0.1) });
      mono(100, 150, 'println(when (n) {', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      ['in 0..9 -> "한 자리"', 'in 10..99 -> "두 자리"', 'else -> "큰 수"'].forEach((s, i) => mono(120, 185 + i * 28, s, { 'font-size': 15, opacity: fade(u, 0.3) }));
      mono(100, 270, '})', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      const shown = clamp((u - 0.6) / 0.6, 0, 3);
      terminal(560, 90, 360, 220, L.map(([n, o]) => ['> ' + o + '   (' + n + ')', 'var(--term)']), shown, { title: 'console' });
      sub(480, 370, '중간 변수 없이 인자 자리에 그대로 들어간다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3: Java 의 임시 변수 vs Kotlin 의 식 하나
    tx(250, 46, 'Java switch', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.1) });
    tx(720, 46, 'Kotlin when', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
    el('line', { x1: 480, y1: 30, x2: 480, y2: 330, stroke: GRID, 'stroke-width': 2 });
    card(250, 90, 200, 44, { rx: 10, text: 'String result;', mono: true, fs: 15, stroke: WARN, s: pop(u, 0.2) });
    ['A', 'B', 'C', 'D', 'F'].forEach((g, i) => { const y = 150 + i * 36, a = 0.4 + i * 0.12;
      mono(80, y + 5, `result = "${g}";`, { 'font-size': 14.5, opacity: fade(u, a) }); grow(232, y, 300, 114, E(u, a, a + 0.3), WARN, { sw: 1.6 }); });
    mono(330, 230, '대입 5번', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.1) });
    card(720, 160, 400, 60, { rx: 12, text: 'fun grade(score) = when { … }', mono: true, fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.3) });
    mono(720, 240, '식 1개 · 결과 타입도 한 번에 확인', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
    banner(480, 375, '분기 = 값 계산', pop(u, 2.2)); }
  function padlock(cx, cy, locked, col, s) { const g = G(cx, cy, s ?? 1), c = col || INK;
    el('path', { d: locked ? 'M-8,-3 V-11 A8,8 0 0 1 8,-11 V-3' : 'M-8,-3 V-18 A8,8 0 0 1 8,-18 V-13', fill: 'none', stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    el('rect', { x: -12, y: -4, width: 24, height: 19, rx: 4, fill: PANEL, stroke: c, 'stroke-width': 2.6 }, g); el('circle', { cx: 0, cy: 5, r: 2.6, fill: c }, g); }

  // =========================================================
  // 5. sealed + when — 닫힌 집합과 망라 검사
  // =========================================================
  const SUBS = [['Success(data)', GOOD], ['Failure(error)', BAD], ['Loading', INFO]];
  function fence(cx, cy, w, h, n, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2;
    el('rect', { x, y, width: w, height: h, rx: 16, fill: SOFT, stroke: INK, 'stroke-width': 3, opacity: o.op ?? 1 });
    mono(x + 16, y + 26, 'sealed class Result', { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1 });
    const items = SUBS.concat(o.extra ? [['Retrying', WARN]] : []);
    items.forEach(([s, col], i) => card(x + 30 + (w - 60) / items.length * (i + 0.5), cy + 14, (w - 60) / items.length - 14, 46, { rx: 10, text: s, mono: true, fs: 14, stroke: col, color: col, s: o.sh ? o.sh(i) : 1 })); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { fence(330, 170, 520, 150, 3, { sh: (i) => pop(u, 0.3 + i * 0.3), op: fade(u, 0.1) });
      const p = E(u, 1.3, 1.9), back = E(u, 1.9, 2.2); if (p > 0) card(lerp(840, 720, p) + back * 40, 170, 220, 40, { rx: 20, text: 'class Retrying : Result', mono: true, fs: 13.5, fw: 700, stroke: p >= 1 ? BAD : INK, color: p >= 1 ? BAD : INK });
      if (u > 1.9) cross(600, 128, 9, pop(u, 1.9));
      sub(330, 300, '같은 모듈 · 같은 패키지 밖에서는 못 늘린다', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 });
      card(330, 370, 300, 44, { rx: 12, text: '가짓수 3개로 확정', fs: 16, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.3) }); return; }
    const X0 = 230, Y0 = 210, miss = k === 2, rows = [['is Success', '"✓ 42"'], ['is Failure', '"✗ e"'], ['Loading', miss ? null : '"..."']];
    if (k === 1 || k === 2) { mono(40, 160, 'when (r)', { 'font-size': 16, 'font-weight': 800 });
      const b = branches(X0, Y0, rows, { top: 100, gap: 100, bx: 330, sh: (i) => (miss && i === 2 ? 0 : pop(u, 0.1 + i * 0.1)) });
      if (miss) { el('rect', { x: 330, y: 280, width: 160, height: 40, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); tx(410, 306, '가지 없음', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); }
      [['Success(42)', 0], ['Failure("e")', 1], ['Loading', 2]].forEach(([s, j], i) => { const a = 0.4 + i * 0.6;
        if (u > a && u < a + 0.6) tok(110, 210, s, 1, ACC);
        if (!(miss && j === 2)) flowTo(X0, Y0, b, j, seg(u, a + 0.1, a + 0.6)); else dot([[X0 - 90, Y0], [X0, Y0], [300, 300]], seg(u, a + 0.1, a + 0.5), BAD, 8); });
      if (!miss) { el('line', { x1: 690, y1: 360, x2: 820, y2: 360, stroke: OFF, 'stroke-width': 2 }); mono(700, 380, 'else 필요 없음', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); }
      else pill(700, 380, "'when' expression must be exhaustive", BAD, pop(u, 1.8), { mono: true, fs: 13.5 }); return; }
    if (k === 3) { fence(480, 90, 760, 120, 4, { extra: true, sh: (i) => (i === 3 ? pop(u, 0.3) : 1) });
      const W = [['render()', 170], ['log()', 480], ['badge()', 790]], red = u > 0.9 && u < 2.0;
      W.forEach(([n, x], i) => { const fix = u > 2.0 + i * 0.15; card(x, 270, 240, 90, { rx: 12, stroke: red || (u > 0.9 && !fix) ? BAD : fix ? GOOD : INK, fill: red || (u > 0.9 && !fix) ? BADBG : fix ? GOODBG : PANEL, s: 1 + bump(u, 0.9 + i * 0.15) });
        mono(x, 260, 'when (r) · ' + n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
        mono(x, 290, fix ? '+ Retrying 가지' : u > 0.9 ? '가지 빠짐' : '3가지 처리', { 'font-size': 14, 'text-anchor': 'middle', fill: fix ? GOOD : u > 0.9 ? BAD : MUT }); });
      sub(480, 360, 'when 이름은 예시 · 고칠 곳을 컴파일러가 모두 보여 준다', fade(u, 1.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    // k4: when 하나로 모인다
    card(480, 210, 160, 90, { rx: 45, text: 'when', mono: true, fs: 24, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.1) });
    [['값 비교', 200, 80], ['in 범위', 760, 80], ['is 타입', 150, 220], ['임의 조건', 810, 220], ['망라 검사', 480, 360]].forEach(([s, x, y], i) => { const a = 0.4 + i * 0.3, p = E(u, a, a + 0.6);
      pill(lerp(x, lerp(x, 480, 0.35), p), lerp(y, lerp(y, 210, 0.35), p), s, i === 4 ? GOOD : INK, pop(u, a), { fs: 15 });
      grow(lerp(x, 480, 0.52), lerp(y, 210, 0.52), lerp(x, 480, 0.78), lerp(y, 210, 0.78), E(u, a + 0.3, a + 0.7), ACC); }); }

  const quiz = [
    { q: 'break를 빠뜨린 Java switch에 n = 1이 들어가면 어떻게 되는가?',
      o: ['case 1만 실행된다', 'case 1과 그 아래 case 2까지 실행된다', '컴파일 에러가 난다'], a: 1,
      why: '옛 switch는 break가 없으면 다음 case로 흘러내린다. 그래서 doA와 doB가 함께 실행된다.' },
    { q: 'when에서 "view", "preview" -> "읽기 그룹" 처럼 콤마로 묶으면 무슨 뜻인가?',
      o: ['두 값 중 하나만 오면 이 가지로 간다', '두 값이 모두 와야 이 가지로 간다', '첫 값은 이 가지, 둘째 값은 다음 가지로 간다'], a: 0,
      why: '콤마로 나열한 값은 같은 가지를 공유한다. mode가 "preview"여도 "읽기 그룹"이 나온다.' },
    { q: 'when (age)에서 age = 25일 때 결과는 무엇인가? (in 0..12, in 13..17, in 18..64, else 순)',
      o: ['"청소년"', '"노인"', '"성인"'], a: 2,
      why: '25는 18..64 범위에 들어간다. when은 위에서부터 보고 처음 맞는 가지의 값을 쓴다.' },
    { q: 'grade(78)의 결과는 무엇인가? (90 이상 A, 80 이상 B, 70 이상 C, 60 이상 D, 그 밖 F)',
      o: ['"C"', '"B"', '"D"'], a: 0,
      why: '78은 90, 80 조건에서 거짓이고 70 이상에서 처음 참이 된다. 그 가지의 "C"가 반환값이다.' },
    { q: 'sealed class Result의 세 하위 타입을 when에서 모두 다루면 else 가지는 어떻게 되는가?',
      o: ['그래도 반드시 적어야 한다', '적지 않아도 컴파일된다', 'Loading 대신 적어야 한다'], a: 1,
      why: '컴파일러가 하위 타입이 셋뿐인 걸 알고 모두 처리됐는지 확인한다. 빠진 게 없으면 else가 필요 없다.' },
  ];
  const summary = [
    '옛 Java switch는 같은 값만 비교하고, break를 빠뜨리면 아래 case로 흘러내린다.',
    'when은 가지 하나만 실행하고 끝나며, 콤마로 여러 값을 한 가지에 묶는다.',
    'in으로 범위, is로 타입, 인자 없는 when으로 임의 조건을 위에서부터 묻는다.',
    'when은 값을 돌려주는 식이라 val에 바로 담고, sealed와 쓰면 빠진 가지가 빌드에서 걸린다.',
  ];
  const review = [
    { q: '주문 상태에 Refunded를 새로 추가했다. 상태를 다루는 when 여러 곳을 빠짐없이 고치려면 무엇이 가장 믿을 만한가?',
      o: ['상태를 String으로 두고 else 가지를 둔다', '상태를 sealed class로 두고 when에 else를 쓰지 않는다', '코드 검색으로 when을 찾아 고친다'], a: 1,
      why: 'sealed 계층에 else 없는 when이면 새 하위 타입이 생길 때 처리 안 한 when이 모두 컴파일 에러로 드러난다. else가 있으면 조용히 그 가지로 빠진다.' },
    { q: 'when { balance < 1_000 -> "주의"; balance < 0 -> "잔액 부족"; else -> "정상" }에 -500을 넣었다. 결과는 무엇인가?',
      o: ['"잔액 부족"', '"정상"', '"주의"'], a: 2,
      why: 'when은 위에서부터 처음 참인 가지에서 멈춘다. -500은 첫 줄 balance < 1_000에서 이미 참이라 "주의"가 나온다.' },
    { q: 'Java에서 var result를 두고 case마다 result = …를 적던 코드를 Kotlin으로 옮긴다. 가장 알맞은 모양은 무엇인가?',
      o: ['val result = when (x) { … }', 'var result를 두고 when 가지마다 대입한다', 'if / else if 사다리로 바꾼다'], a: 0,
      why: 'when은 식이라 결과를 바로 val에 담는다. 대입이 한 번으로 줄고 나중에 덮어쓸 여지도 없어진다.' },
  ];

  R.page({ title: 'when의 갈래', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
