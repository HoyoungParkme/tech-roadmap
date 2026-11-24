/* I-1-1 변수·타입·문자열 포매팅 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품: 이름표 · 힙 객체 ----------
  // 이름표(변수): 끝이 뾰족한 꼬리표. 돌려주는 값의 x1 이 화살표 시작점
  function tag(x, y, name, o) { o = o || {}; const col = o.col || ACC, w = Math.max(58, tw(name, 16) + 36), g = R.G(x, y, o.s ?? 1, o.op);
    el('path', { d: `M${-w / 2 + 14},-17 H${w / 2} V17 H${-w / 2 + 14} L${-w / 2},0 Z`, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: -w / 2 + 13, cy: 0, r: 3.5, fill: PANEL, stroke: col, 'stroke-width': 1.6 }, g);
    mono(7, 6, name, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    return { x0: x - w / 2, x1: x + w / 2, y }; }
  // 힙 객체: 머리(타입 · id) + 값 칸들. x,y = 첫 칸 왼쪽 위
  function obj(x, y, vals, o) { o = o || {}; const w = o.w || 50, gap = 6, n = Math.max(vals.length, o.min || 1), W = n * (w + gap) - gap + 24, op = o.op ?? 1;
    el('rect', { x: x - 12, y: y - 32, width: W, height: 86, rx: 10, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    if (o.head) mono(x - 2, y - 11, o.head, { 'font-size': 13.5, fill: MUT, opacity: op });
    cells(x, y, vals, { w, h: 40, fs: o.fs || 16, style: (i) => (o.cell ? o.cell(i) : { op }) });
    return { x0: x - 12, x1: x - 12 + W, y0: y - 32, y1: y + 54, cy: y + 20 }; }
  // 참조 수 배지
  function rc(x, y, n, s) { pill(x, y, `참조 수 ${n}`, INFO, s ?? 1, { fs: 13.5 }); }
  const outLine = (x, y, code, out, op, col) => { mono(x, y, code, { 'font-size': 15, fill: MUT, opacity: op }); mono(x + tw(code, 15) + 18, y, out, { 'font-size': 15, 'font-weight': 800, fill: col || INK, opacity: op }); };

  // =========================================================
  // 1. 이름표 모델 — a, b 가 같은 리스트를 가리킨다
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    zone(30, 40, 220, 300, '이름 (변수)'); zone(280, 40, 650, 300, '객체 (힙 메모리)');
    const A = { x: 420, y: 112 }, vals = k >= 2 ? [1, 2, 3] : [1, 2];
    const oa = obj(A.x, A.y, vals, { head: 'list · id …a0', min: 3, cell: (i) => ({ s: k === 0 ? pop(u, 0.2 + i * 0.25) : i === 2 && k === 2 ? pop(u, 1.0) : 1, stroke: i === 2 && k === 2 ? ACC : INK, sw: i === 2 && k === 2 ? 3 : 2 }) });
    if (k === 2) fly(760, A.y + 20, A.x + 2 * 56 + 25, A.y + 20, seg(u, 0.2, 1.0), '3', { mono: true });
    const ta = tag(95, 132, 'a', { s: k === 0 ? pop(u, 0.8) : 1 });
    grow(ta.x1 + 4, 132, oa.x0 - 4, 132, k === 0 ? E(u, 1.1, 1.8) : 1, ACC);
    const refs = k === 0 ? 1 : k === 1 ? Math.round(tween(1, 2, u)) : 2;
    rc(oa.x1 + 70, A.y - 20, refs, k === 0 ? pop(u, 1.8) : 1);
    if (k >= 1) { const bx = k === 1 ? lerp(40, 95, E(u, 0.2, 0.9)) : 95, tb = tag(bx, 222, 'b', { col: INFO, fill: INFOBG });
      grow(tb.x1 + 4, 222, oa.x0 - 4, 150, k === 1 ? E(u, 1.0, 1.7) : 1, INFO); }
    if (k === 1) { obj(A.x, 236, [1, 2], { head: '새 리스트?', min: 3, dash: '6 5', col: OFF, op: fade(u, 1.8) * 0.8 }); if (u > 2.1) R.cross(A.x + 95, 256, 22, pop(u, 2.1));
      sub(A.x + 300, 262, '복사본은 생기지 않는다', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
    if (k === 2) { dot([[ta.x1, 132], [oa.x0, 132]], seg(u, 1.4, 2.0), ACC, 6); dot([[150, 222], [oa.x0, 150]], seg(u, 1.4, 2.0), INFO, 6);
      outLine(320, 250, 'print(a)', '[1, 2, 3]', fade(u, 1.8), ACC); outLine(320, 284, 'print(b)', '[1, 2, 3]', fade(u, 2.1), INFO);
      sub(780, 268, '같은 객체를 본다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { mono(60, 178, 'id(a) = …a0', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.2) }); mono(60, 268, 'id(b) = …a0', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.5) });
      card(470, 255, 300, 44, { rx: 10, text: 'a is b   →  True   (같은 id)', fs: 15, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.0) });
      card(470, 310, 300, 44, { rx: 10, text: 'a == b   →  True   (같은 값)', fs: 15, mono: true, stroke: INK, s: pop(u, 1.5) });
      sub(790, 282, 'id 값은 실행마다 다르다', fade(u, 2.1)); }
    if (k === 4) { const tc = tag(95, 300, 'c', { col: WARN, fill: WARNBG, s: pop(u, 0.2) });
      const cv = u > 1.9 ? [1, 2, 3, 99] : [1, 2, 3];
      const oc = obj(A.x, 262, cv, { head: 'list · id …e8', min: 4, col: WARN, cell: (i) => ({ s: i < 3 ? pop(u, 0.5 + i * 0.25) : pop(u, 1.9), stroke: i === 3 ? WARN : INK }) });
      grow(tc.x1 + 4, 300, oc.x0 - 4, 300, E(u, 1.2, 1.7), WARN);
      for (let i = 0; i < 3; i++) fly(A.x + i * 56 + 25, A.y + 62, A.x + i * 56 + 25, 282, seg(u, 0.3 + i * 0.25, 0.9 + i * 0.25), String(i + 1), { mono: true, fill: OFF, color: INK });
      mono(oc.x1 + 18, 290, 'a is c  →  False', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); }
    if (k <= 1) mono(300, 395, k === 0 ? 'a = [1, 2]' : 'b = a', { 'font-size': 16, 'font-weight': 700, fill: INK, opacity: fade(u, 0.2) });
    if (k === 4) mono(300, 395, 'c = a.copy()   c.append(99)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) }); }

  // =========================================================
  // 2. 기본 타입 — type · int 자릿수 · isinstance · 불변/가변
  // =========================================================
  function typeBox(cx, cy, w, name, o) { o = o || {}; card(cx, cy, w, 40, { rx: 8, text: name, fs: 16, mono: true, stroke: o.col || INK, color: o.col || INK, fill: o.fill, sw: o.sw || 2, s: o.s, op: o.op }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const items = [['42', "<class 'int'>"], ['3.14', "<class 'float'>"], ['"hi"', "<class 'str'>"], ['None', "<class 'NoneType'>"]];
      tx(480, 60, 'type(값) 은 그 객체의 클래스를 돌려준다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.1) });
      items.forEach(([v, cls], i) => { const cx = 140 + i * 225, s = pop(u, 0.3 + i * 0.4);
        card(cx, 160, 150, 70, { rx: 12, text: v, fs: 22, mono: true, stroke: INK, s });
        grow(cx, 200, cx, 252, E(u, 0.6 + i * 0.4, 1.0 + i * 0.4), MUT);
        pill(cx, 280, cls, ACC, pop(u, 0.9 + i * 0.4), { mono: true, fs: 14 }); });
      sub(785, 330, 'None 은 프로그램 전체에 하나뿐인 객체', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const N = '1606938044258990275541962092341162602522202993782792835301376';
      tx(60, 70, 'C 의 64비트 정수 (int64) 최댓값', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.1) });
      mono(60, 104, '9223372036854775807', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.2) });
      hbar(60, 118, 560, 19 * E(u, 0.3, 0.9), 61, { col: OFF, text: '19자리', label: u > 0.6 });
      tx(60, 200, '파이썬 2 ** 200', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      const shown = Math.round(N.length * E(u, 1.0, 2.2));
      mono(60, 236, N.slice(0, Math.min(31, shown)), { 'font-size': 18, 'font-weight': 700, fill: ACC });
      if (shown > 31 || u > 2.2) mono(60, 264, N.slice(31, Math.max(31, shown)), { 'font-size': 18, 'font-weight': 700, fill: ACC });
      hbar(60, 284, 560, N.length * E(u, 1.0, 2.2), 61, { col: ACC, text: '61자리', label: u > 1.8 });
      card(800, 210, 220, 70, { rx: 12, text: '자릿수 제한 없음\n오버플로가 없다', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 2.3) });
      sub(480, 370, '대신 자릿수가 커질수록 계산이 느려진다', fade(u, 2.4)); return; }
    // k2, k3: 클래스 나무
    const P = { obj: [480, 70], int: [300, 170], float: [480, 170], str: [660, 170], bool: [300, 270] };
    const hiInt = k === 2 ? E(u, 1.0, 1.4) : 1;
    if (k === 2 || k === 3) {
      [['int', 'obj'], ['float', 'obj'], ['str', 'obj'], ['bool', 'int']].forEach(([a, b]) => el('line', { x1: P[a][0], y1: P[a][1] - 20, x2: P[b][0], y2: P[b][1] + 20, stroke: GRID, 'stroke-width': 2.5 }));
      typeBox(P.obj[0], P.obj[1], 110, 'object', { col: MUT });
      typeBox(P.float[0], P.float[1], 110, 'float', { col: k === 2 && u > 2.0 ? ACC : INK, fill: k === 2 && u > 2.0 ? ACCBG : null });
      typeBox(P.str[0], P.str[1], 110, 'str');
      typeBox(P.int[0], P.int[1], 110, 'int', { col: ACC, fill: hiInt > 0.5 ? ACCBG : null, sw: 2.5 });
      typeBox(P.bool[0], P.bool[1], 110, 'bool', { col: k === 3 ? WARN : INK, fill: k === 3 ? WARNBG : null, s: k === 2 ? pop(u, 0.3) : 1 });
      sub(P.bool[0] + 120, P.bool[1] + 5, 'int 의 하위 클래스', k === 2 ? fade(u, 0.6) : 1, { 'text-anchor': 'start', fill: WARN, 'font-weight': 700 }); }
    if (k === 2) { const y = lerp(40, P.int[1] - 4, E(u, 0.4, 1.0)); if (u > 0.4) card(170, y, 66, 34, { rx: 17, text: 'x=10', fs: 14, mono: true, stroke: INFO, color: INFO, fill: INFOBG });
      mono(620, 280, 'isinstance(x, int)', { 'font-size': 15, opacity: fade(u, 1.2) }); mono(820, 280, '→ True', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      mono(620, 318, 'isinstance(x, (int, float))', { 'font-size': 15, opacity: fade(u, 1.9) }); mono(880, 318, '→ True', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
      sub(480, 395, '튜플로 주면 "이 중 아무거나"를 허용한다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) { const y = lerp(380, P.bool[1] + 40, E(u, 0.2, 0.7)); card(150, y, 76, 34, { rx: 17, text: 'True', fs: 15, mono: true, stroke: WARN, color: WARN, fill: WARNBG });
      // bool → int 로 위로 올라가는 경로
      dot([[P.bool[0], P.bool[1] - 20], [P.int[0], P.int[1] + 20]], seg(u, 0.8, 1.3), WARN, 7);
      mono(560, 290, 'isinstance(True, int)', { 'font-size': 15, opacity: fade(u, 1.0) }); mono(780, 290, '→ True', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
      mono(560, 328, 'type(True) is int', { 'font-size': 15, opacity: fade(u, 1.7) }); mono(780, 328, '→ False', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      sub(480, 395, '"정수만" 받으려면 type(x) is int 로 막는다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4: 불변 vs 가변
    zone(30, 40, 430, 330, '불변 (immutable)', { stroke: INFO, fill: INFOBG }); zone(500, 40, 430, 330, '가변 (mutable)', { stroke: WARN, fill: WARNBG });
    mono(60, 100, 's = "abc"', { 'font-size': 16, 'font-weight': 700 });
    cells(70, 120, ['a', 'b', 'c'], { w: 54, h: 46, index: true, style: (i) => ({ stroke: i === 0 && u > 1.3 ? BAD : INK, sw: i === 0 && u > 1.3 ? 3 : 2 }) });
    if (u < 1.3) fly(300, 80, 97, 143, seg(u, 0.3, 1.3), '"z"', { mono: true, fill: BAD }); else card(lerp(97, 300, E(u, 1.3, 1.8)), lerp(143, 90, E(u, 1.3, 1.8)), 50, 28, { rx: 14, text: '"z"', fs: 13.5, mono: true, fill: BAD, stroke: 'none', color: PANEL, op: 1 - fade(u, 1.8) });
    mono(260, 155, 'TypeError', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
    mono(530, 100, 'lst = [1, 2, 3]', { 'font-size': 16, 'font-weight': 700 });
    cells(540, 120, [u > 1.3 ? 99 : 1, 2, 3], { w: 54, h: 46, index: true, style: (i) => ({ stroke: i === 0 && u > 1.3 ? GOOD : INK, sw: i === 0 && u > 1.3 ? 3 : 2, s: i === 0 && u > 1.3 ? pop(u, 1.3) : 1 }) });
    fly(800, 80, 567, 143, seg(u, 0.3, 1.3), '99', { mono: true, fill: GOOD });
    mono(730, 155, '[99, 2, 3]', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
    [['int', 'float', 'bool'], ['str', 'tuple', 'None']].forEach((row, r) => row.forEach((n, i) => pill(100 + i * 120, 250 + r * 50, n, INFO, pop(u, 1.8 + (r * 3 + i) * 0.08), { mono: true, fs: 15 })));
    ['list', 'dict', 'set'].forEach((n, i) => pill(580 + i * 120, 250, n, WARN, pop(u, 1.8 + i * 0.1), { mono: true, fs: 15 }));
    sub(715, 320, '공유 버그는 여기서만 생긴다', fade(u, 2.3), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }

  // =========================================================
  // 3. f-string — 포맷 스펙이 글자 칸을 어떻게 채우나
  // =========================================================
  // 글자 칸 한 줄: 공백은 점으로
  function charRow(x, y, s, o) { o = o || {}; const w = o.w || 34; [...s].forEach((ch, i) => { const st = o.style ? o.style(i, ch) : {}; if ((st.s ?? 1) <= 0) return;
      card(x + i * (w + 3) + w / 2, y, w, 40, { rx: 5, text: ch === ' ' ? '·' : ch, fs: 18, mono: true, stroke: st.stroke || (ch === ' ' ? GRID : INK), color: st.color || (ch === ' ' ? OFF : INK), fill: st.fill, sw: st.sw || 1.8, s: st.s }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const V = [['price', '1234.5678', 'float', ACC, ACCBG], ['name', "'kim'", 'str', INFO, INFOBG], ['qty', '7', 'int', WARN, WARNBG]];
      V.forEach(([n, v, ty, col, bg], i) => { const y = 90 + i * 90, tg = tag(110, y, n, { col, fill: bg, s: pop(u, 0.2 + i * 0.35) });
        grow(tg.x1 + 4, y, 318, y, E(u, 0.5 + i * 0.35, 0.9 + i * 0.35), col);
        card(420, y, 190, 50, { rx: 10, text: v, fs: 18, mono: true, stroke: col, s: pop(u, 0.8 + i * 0.35) }); mono(530, y + 6, ty, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0 + i * 0.35) }); });
      card(770, 180, 290, 64, { rx: 12, text: 'f"{price} {name} {qty}"', fs: 16, mono: true, stroke: INK, s: pop(u, 1.9) });
      sub(770, 236, '{} 안에 이름·식을 그대로 쓴다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { mono(60, 70, 'price = 1234.5678', { 'font-size': 16, 'font-weight': 700 });
      charRow(60, 120, '1234.5678', { style: (i) => ({ stroke: i >= 7 ? (u > 0.6 ? BAD : INK) : INK, color: i >= 7 && u > 0.6 ? BAD : INK }) });
      if (u > 0.6) { el('line', { x1: 60 + 7 * 37 - 2, y1: 92, x2: 60 + 7 * 37 - 2, y2: 148, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }); sub(60 + 8 * 37, 172, '반올림해서 자름', fade(u, 0.7), { fill: BAD, 'font-weight': 700 }); }
      mono(450, 128, '{price:.2f}', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      charRow(60, 220, '1234.57', { style: (i) => ({ s: pop(u, 1.0 + i * 0.07), stroke: i >= 5 ? ACC : INK }) });
      mono(450, 228, '→ 1234.57', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      charRow(60, 320, '1,234.57', { style: (i) => ({ s: i === 1 ? pop(u, 2.0) : pop(u, 1.6 + i * 0.03), stroke: i === 1 ? ACC : INK, fill: i === 1 ? ACCBG : null, sw: i === 1 ? 3 : 1.8 }) });
      mono(450, 328, '{price:,.2f}  → 1,234.57', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
      [[',', '천 단위 콤마'], ['.2', '소수 2자리'], ['f', '고정소수점']].forEach(([a, b], i) => { const y = 90 + i * 56;
        card(800, y, 190, 42, { rx: 8, s: pop(u, 0.4 + i * 0.3) }); mono(722, y + 6, a, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5 + i * 0.3) }); tx(760, y + 6, b, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.3) }); });
      return; }
    if (k === 2) { const rows = [['{name:>8}', '     kim', '오른쪽'], ['{name:<8}', 'kim     ', '왼쪽'], ['{name:^8}', '  kim   ', '가운데'], ['{qty:08d}', '00000007', '0 채움']];
      tx(400, 52, '폭 8칸', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
      rows.forEach(([sp, out, nm], r) => { const y = 95 + r * 78, st = 0.2 + r * 0.5;
        mono(40, y + 6, sp, { 'font-size': 17, 'font-weight': 700, fill: r === 3 ? WARN : INFO, opacity: fade(u, st) });
        charRow(250, y, out, { style: (i, ch) => ({ s: seg(u, st + 0.05 * i, st + 0.05 * i + 0.25) > 0 ? 1 : 0, stroke: ch === ' ' ? GRID : r === 3 && i < 7 ? WARN : INK, color: r === 3 && i < 7 ? WARN : null }) });
        tx(570, y + 6, nm, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, st + 0.4) }); });
      card(800, 190, 240, 110, { rx: 12, text: '스펙 읽는 순서\n[정렬][0][폭]\n[.정밀도][타입]', fs: 15, stroke: INK, s: pop(u, 2.3) }); return; }
    if (k === 3) { tx(60, 70, '{x=} 이름과 값을 함께', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      mono(60, 110, 'f"{price=}"', { 'font-size': 17, fill: MUT, opacity: fade(u, 0.2) });
      charRow(60, 160, 'price=1234.5678', { w: 30, style: (i) => ({ s: pop(u, 0.4 + i * 0.05), stroke: i < 6 ? ACC : INK, fill: i < 6 ? ACCBG : null, color: i < 6 ? ACC : INK }) });
      tx(60, 240, '{x!r} repr — 따옴표까지', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.3) });
      mono(60, 280, 'f"{name}"', { 'font-size': 17, fill: MUT, opacity: fade(u, 1.4) }); charRow(250, 274, 'kim', { style: (i) => ({ s: pop(u, 1.5 + i * 0.08) }) });
      mono(60, 340, 'f"{name!r}"', { 'font-size': 17, fill: MUT, opacity: fade(u, 1.8) }); charRow(250, 334, "'kim'", { style: (i) => ({ s: pop(u, 1.9 + i * 0.08), stroke: i === 0 || i === 4 ? INFO : INK, color: i === 0 || i === 4 ? INFO : INK, fill: i === 0 || i === 4 ? INFOBG : null }) });
      card(780, 300, 250, 70, { rx: 12, text: '빈 문자열·공백도\n눈에 보인다', fs: 15, stroke: INFO, color: INFO, s: pop(u, 2.3) });
      pill(780, 160, '3.8+', MUT, pop(u, 1.0), { fs: 14, mono: true }); return; }
    if (k === 4) { const chain = [['0.1234', INK], ['× 100', MUT], ['12.34', INK], ['.1 자리', MUT], ['12.3', INK], ['+ %', MUT], ['12.3%', ACC]];
      mono(480, 80, 'ratio = 0.1234      f"{ratio:.1%}"', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      chain.forEach(([s, col], i) => { const x = 90 + i * 130, st = 0.3 + i * 0.3; if (i % 2) { grow(x - 50, 210, x + 50, 210, E(u, st, st + 0.3), MUT); tx(x, 192, s, { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, st) }); }
        else card(x, 210, i === 6 ? 110 : 96, 52, { rx: 10, text: s, fs: 19, mono: true, stroke: col, color: col, fill: i === 6 ? ACCBG : null, s: pop(u, st) }); });
      sub(480, 320, '100 을 직접 곱하지 말고 % 타입을 쓴다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: 레거시 세 방식 → 같은 결과
    const ways = [['f"{price:.2f}"', 'f-string', ACC], ['"{:.2f}".format(price)', 'str.format()', MUT], ['"%.2f" % price', '% 포매팅', MUT]];
    ways.forEach(([code, nm, col], i) => { const y = 100 + i * 90, st = 0.2 + i * 0.4;
      card(250, y, 360, 54, { rx: 10, text: code, fs: 17, mono: true, stroke: col, color: col === MUT ? INK : col, fill: i === 0 ? ACCBG : null, sw: i === 0 ? 3 : 1.8, s: pop(u, st) });
      tx(250, y + 45, nm, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, st + 0.2) });
      grow(440, y, 600, y, E(u, st + 0.4, st + 0.8), col === MUT ? OFF : ACC);
      mono(620, y + 7, '1234.57', { 'font-size': 20, 'font-weight': 800, fill: col === MUT ? INK : ACC, opacity: fade(u, st + 0.8) }); });
    pill(840, 100, '새 코드', ACC, pop(u, 2.2), { fs: 15 }); pill(840, 235, '옛 코드에서 읽기만', MUT, pop(u, 2.4), { fs: 14 }); }

  // =========================================================
  // 4. str 은 불변 — 메서드는 새 객체, 슬라이싱, join
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { zone(30, 40, 190, 330, '이름'); zone(250, 40, 680, 330, '객체');
      const o1 = obj(290, 105, [...'  Python  '].map((ch) => (ch === ' ' ? '·' : ch)), { w: 36, fs: 17, head: 'str · 원본', op: u > 2.2 ? 1 - 0.55 * fade(u, 2.2) : 1, cell: (i) => ({ stroke: i < 2 || i > 7 ? GRID : INK, color: i < 2 || i > 7 ? OFF : INK, op: u > 2.2 ? 1 - 0.55 * fade(u, 2.2) : 1 }) });
      const o2 = u > 0.7 ? obj(290 + 2 * 42, 255, [...'Python'], { w: 36, fs: 17, head: 'str · 새 객체', col: ACC, cell: (i) => ({ s: pop(u, 0.8 + i * 0.07), stroke: ACC }) }) : null;
      for (let i = 2; i < 8; i++) fly(290 + i * 42 + 18, 125, 290 + i * 42 + 18, 275, seg(u, 0.5 + (i - 2) * 0.05, 1.0 + (i - 2) * 0.05), [...'  Python  '][i], { mono: true, fill: OFF, color: INK });
      mono(780, 130, 's.strip()', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      const toNew = u > 1.7, ty = 130, ts = tag(115, ty, 's', {});
      const ex = toNew ? lerp(o1.x0, o2.x0, E(u, 1.7, 2.3)) : o1.x0, ey = toNew ? lerp(ty, 275, E(u, 1.7, 2.3)) : ty;
      grow(ts.x1 + 4, ty, ex - 4, ey, 1, ACC);
      if (u > 1.7) mono(560, 395, 's = s.strip()   # 재대입해야 반영', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7), 'text-anchor': 'middle' });
      else mono(560, 395, 's.strip() 만 하면 s 는 그대로', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0), 'text-anchor': 'middle' });
      if (u > 2.3) sub(700, 210, '아무도 안 가리키면 회수된다', fade(u, 2.3), { 'text-anchor': 'start', fill: MUT }); return; }
    if (k === 1) { const rows = [['"a,b,c".split(",")', "['a', 'b', 'c']", 'list'], ['"Py".upper()', "'PY'", 'str'], ['"hello".replace("l", "L")', "'heLLo'", 'str'], ['"py".startswith("p")', 'True', 'bool']];
      tx(70, 58, '원본 → 메서드 → 돌려받은 새 값', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      rows.forEach(([code, out, ty], i) => { const y = 105 + i * 76, st = 0.2 + i * 0.5;
        card(250, y, 380, 50, { rx: 10, text: code, fs: 16, mono: true, stroke: INK, s: pop(u, st) });
        grow(445, y, 560, y, E(u, st + 0.2, st + 0.5), ACC);
        card(680, y, 210, 50, { rx: 10, text: out, fs: 17, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, st + 0.4) });
        mono(800, y + 6, ty, { 'font-size': 14, fill: MUT, opacity: fade(u, st + 0.5) }); });
      sub(480, 405, '"hello" 는 그대로 남는다 · 결과를 안 받으면 사라진다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2 || k === 3) { const W = 'PYTHON', x0 = 230, w = 64, cx = (i) => x0 + i * (w + 6) + w / 2;
      mono(60, 70, 'w = "PYTHON"', { 'font-size': 17, 'font-weight': 700 });
      [...W].forEach((ch, i) => { const on = k === 2 ? (u > 1.0 && i < 3) || (u > 0.3 && u < 1.0 && (i === 0 || i === 5)) : false;
        card(cx(i), 150, w, 54, { rx: 8, text: ch, fs: 24, mono: true, stroke: on ? ACC : INK, fill: on ? ACCBG : null, color: on ? ACC : INK, sw: on ? 3 : 2 });
        mono(cx(i), 110, String(i), { 'font-size': 15, 'text-anchor': 'middle', fill: MUT }); mono(cx(i), 200, String(i - 6), { 'font-size': 15, 'text-anchor': 'middle', fill: OFF }); });
      if (k === 2) { mono(60, 155, 'w[0] · w[-1]', { 'font-size': 15, fill: INFO, opacity: fade(u, 0.3) * (1 - fade(u, 1.0)) });
        const bx = x0 - 4, bw = 3 * (w + 6) - 2;
        el('path', { d: `M${bx},235 v12 h${bw * E(u, 1.0, 1.6)} v-12`, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 1.0) });
        el('line', { x1: x0 + 3 * (w + 6) - 3, y1: 118, x2: x0 + 3 * (w + 6) - 3, y2: 185, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.5) });
        sub(x0 + 3 * (w + 6) - 3, 272, 'stop=3 은 안 들어간다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
        mono(60, 330, 'w[0:3]', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 1.0) }); charRow(200, 322, "'PYT'", { style: (i) => ({ s: pop(u, 1.8 + i * 0.08), stroke: ACC }) });
        sub(700, 330, '범위를 넘어도 예외 없이 잘린다', fade(u, 2.3), { 'font-size': 15 }); return; }
      // k3: step
      [0, 2, 4].forEach((i, j) => { const s = seg(u, 0.3 + j * 0.3, 0.6 + j * 0.3); if (s > 0) { el('circle', { cx: cx(i), cy: 150, r: 34, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: s }); }
        if (j > 0) { const a = cx(i - 2), b = cx(i); el('path', { d: `M${a},118 Q${(a + b) / 2},${78} ${lerp(a, b, s)},${lerp(118, 108, s)}`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: s > 0 ? 1 : 0 }); } });
      mono(60, 300, 'w[::2]', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.3) }); charRow(200, 292, "'PTO'", { style: (i) => ({ s: pop(u, 1.0 + i * 0.08), stroke: ACC }) });
      mono(60, 370, 'w[::-1]', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 1.5) }); charRow(200, 362, "'NOHTYP'", { style: (i) => ({ s: pop(u, 1.7 + i * 0.08), stroke: WARN }) });
      sub(700, 368, '뒤집기 관용구', fade(u, 2.3), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    // k4: += 와 join (CPython 3.12, 100,000번 이어 붙이기 측정)
    tx(60, 58, '"ab" 를 100,000번 이어 붙이는 시간 (이 PC, Python 3.12 측정)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const rows = [['"".join(parts)', 5.1, ACC], ['result += w', 12.8, WARN], ['+= (다른 이름이 같은 문자열을 잡을 때)', 313.6, BAD]];
    rows.forEach(([n, v, col], i) => { const y = 95 + i * 72; tx(60, y, n, { 'font-size': 15, 'font-weight': 700, fill: col === ACC ? ACC : INK, opacity: fade(u, 0.2 + i * 0.4) });
      hbar(60, y + 12, 540, v, 313.6, { col, u: E(u, 0.3 + i * 0.4, 1.1 + i * 0.4), text: v.toFixed(1) + 'ms', label: u > 0.6 + i * 0.4 }); });
    card(825, 150, 200, 120, { rx: 12, text: '+= 는 원칙상\n매번 새 문자열\nO(n²)', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.8) });
    snippet(60, 312, ['joined = "-".join(["a", "b", "c", "d"])   # "a-b-c-d"'], { op: fade(u, 2.0) });
    sub(825, 235, 'CPython 최적화는 보장 안 됨', fade(u, 2.3), { fill: BAD, 'font-weight': 700 }); }

  // =========================================================
  // 5. 실무 함정 — 가변 기본값 · is None · float
  // =========================================================
  function fnObj(x, y, name, defVal, o) { o = o || {}; card(x, y, 200, 92, { rx: 12, stroke: o.col || INK, s: o.s });
    if ((o.s ?? 1) > 0.5) { mono(x - 86, y - 18, 'function ' + name, { 'font-size': 15, 'font-weight': 800 }); mono(x - 86, y + 18, '__defaults__', { 'font-size': 14, fill: MUT }); mono(x + 88, y + 18, defVal, { 'font-size': 14, 'font-weight': 700, fill: o.col || INK, 'text-anchor': 'end' }); } }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { zone(30, 40, 270, 330, '정의 시점 (def 실행)'); zone(330, 40, 600, 330, '호출 시점');
      fnObj(165, 130, 'bad', '(box,)', { s: k === 0 ? pop(u, 0.3) : 1 });
      const vals = k === 0 ? [] : u > 1.6 ? [1, 2] : u > 0.6 ? [1] : [];
      const ob = obj(105, 262, vals, { head: 'list · 1개뿐', min: 2, col: k === 1 ? BAD : INK, cell: (i) => ({ s: k === 1 ? pop(u, i === 0 ? 0.6 : 1.6) : 1, stroke: BAD }) });
      if (k === 0) { grow(165, 178, 165, 228, E(u, 0.9, 1.4), INK); sub(165, 390, 'box=[] 는 여기서 딱 한 번 만들어진다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
        mono(400, 130, 'bad(1)', { 'font-size': 17, fill: OFF, opacity: fade(u, 2.0) }); mono(400, 250, 'bad(2)', { 'font-size': 17, fill: OFF, opacity: fade(u, 2.0) }); sub(620, 200, '아직 호출 전', fade(u, 2.2), { 'font-size': 15 }); return; }
      grow(165, 178, 165, 228, 1, INK);
      [['bad(1)', '[1]', 0.2], ['bad(2)', '[1, 2]', 1.2]].forEach(([call, out, st], i) => { const y = 130 + i * 120;
        card(470, y, 150, 50, { rx: 10, text: call, fs: 17, mono: true, stroke: INK, s: pop(u, st) });
        el('path', { d: `M395,${y} C340,${y} 320,${280} ${ob.x1 + 4},282`, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, st + 0.2) });
        mono(570, y + 6, '→ ' + out, { 'font-size': 18, 'font-weight': 800, fill: i ? BAD : INK, opacity: fade(u, st + 0.5) }); });
      sub(760, 260, '[2] 를 기대했지만 누적', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { zone(30, 40, 270, 330, '정의 시점'); zone(330, 40, 600, 330, '호출할 때마다 새 리스트');
      fnObj(165, 130, 'good', '(None,)', { col: GOOD, s: pop(u, 0.2) });
      mono(60, 250, 'if box is None:', { 'font-size': 15, opacity: fade(u, 0.5) }); mono(80, 278, 'box = []', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
      [['good(1)', 1, 0.7], ['good(2)', 2, 1.4]].forEach(([call, v, st], i) => { const y = 120 + i * 150;
        card(430, y, 140, 46, { rx: 10, text: call, fs: 16, mono: true, s: pop(u, st) });
        grow(505, y, 560, y, E(u, st + 0.2, st + 0.5), GOOD);
        obj(600, y - 20, [v], { head: `list · 새 객체 ${i + 1}`, col: GOOD, cell: () => ({ s: pop(u, st + 0.4), stroke: GOOD }) }); });
      mono(780, 370, '[1] [2]', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { zone(30, 40, 430, 330, 'None 은 하나뿐'); zone(490, 40, 440, 330, '== 는 __eq__ 가 정한다');
      card(340, 200, 120, 60, { rx: 12, text: 'None', fs: 20, mono: true, stroke: INK, s: pop(u, 0.2) });
      ['x', 'y', 'box'].forEach((n, i) => { const y = 110 + i * 90, tg = tag(110, y, n, { s: pop(u, 0.4 + i * 0.25), col: INFO, fill: INFOBG }); grow(tg.x1 + 4, y, 276, 200 + (i - 1) * 16, E(u, 0.6 + i * 0.25, 1.0 + i * 0.25), INFO); });
      mono(60, 395, 'x is None  →  True (id 비교)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      snippet(515, 80, ['class W:', '    def __eq__(self, o):', '        return True'], { op: fade(u, 1.2) });
      mono(515, 260, 'W() == None', { 'font-size': 16, opacity: fade(u, 1.7) }); mono(720, 260, '→ True', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      mono(515, 300, 'W() is None', { 'font-size': 16, opacity: fade(u, 2.1) }); mono(720, 300, '→ False', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) });
      sub(710, 345, '값 비교는 속일 수 있고, 정체성은 못 속인다', fade(u, 2.4), { 'font-size': 14 }); return; }
    // k4: float — 실제로 저장되는 값
    tx(60, 54, '메모리에 실제로 저장된 값 (Decimal(x) 로 확인)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const rows = [['0.1', '0.1000000000000000055511…'], ['0.2', '0.2000000000000000111022…'], ['0.1 + 0.2', '0.3000000000000000444089…'], ['0.3', '0.2999999999999999888977…']];
    rows.forEach(([a, b], i) => { const y = 92 + i * 40, st = 0.2 + i * 0.3; mono(60, y, a, { 'font-size': 16, 'font-weight': 700, fill: i === 2 ? BAD : i === 3 ? INFO : INK, opacity: fade(u, st) });
      mono(200, y, b, { 'font-size': 16, fill: i === 2 ? BAD : i === 3 ? INFO : INK, opacity: fade(u, st + 0.1) }); });
    // 0.3 근처 확대 수직선
    const L = 120, Rr = 720, Y = 280, m = (v) => lerp(L, Rr, (v + 1) / 2); // v: 0.3 기준 ×1e-16
    el('line', { x1: L, y1: Y, x2: lerp(L, Rr, E(u, 1.2, 1.6)), y2: Y, stroke: MUT, 'stroke-width': 2 });
    if (u > 1.6) { el('line', { x1: m(-0.111), y1: Y - 16, x2: m(-0.111), y2: Y + 16, stroke: INFO, 'stroke-width': 3 }); el('line', { x1: m(0.444), y1: Y - 16, x2: m(0.444), y2: Y + 16, stroke: BAD, 'stroke-width': 3 });
      mono(m(-0.111), Y + 38, '0.3', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 }); mono(m(0.444), Y + 38, '0.1+0.2', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
      el('path', { d: `M${m(-0.111)},${Y - 24} h${(m(0.444) - m(-0.111)) * E(u, 1.7, 2.1)}`, stroke: WARN, 'stroke-width': 2, fill: 'none' }); mono((m(-0.111) + m(0.444)) / 2, Y - 32, '차이 5.55e-17', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    [['0.1 + 0.2 == 0.3', 'False', BAD], ['math.isclose(…)', 'True', GOOD], ['Decimal("0.1")+Decimal("0.2")', '0.3', GOOD]].forEach(([a, b, col], i) => { const y = 150 + i * 70;
      card(870, y, 150, 56, { rx: 10, stroke: col, s: pop(u, 2.0 + i * 0.2) }); });
    [['== 0.3', 'False', BAD], ['isclose', 'True', GOOD], ['Decimal', '0.3', GOOD]].forEach(([a, b, col], i) => { const y = 150 + i * 70;
      tx(870, y - 4, a, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1 + i * 0.2) }); mono(870, y + 18, b, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 2.1 + i * 0.2) }); }); }

  const quiz = [
    { q: 'a = [1, 2] 다음에 b = a를 실행하면 메모리에는 리스트 객체가 몇 개 있는가?',
      o: ['2개, b가 a의 값을 복사한다', '1개, 이름표 a와 b가 같은 객체를 가리킨다', '0개, b가 가리킬 객체를 아직 만들지 않았다'], a: 1,
      why: 'b = a는 이름표를 하나 더 붙일 뿐이다. 그래서 b.append(3) 뒤에 print(a)도 [1, 2, 3]이 나온다.' },
    { q: 'isinstance(True, int)의 결과와 그 이유로 맞는 것은 무엇인가?',
      o: ['False, True는 bool이라 int와 다른 타입이다', 'True, bool이 int의 하위 클래스라서 통과한다', 'TypeError, 서로 다른 타입은 비교할 수 없다'], a: 1,
      why: 'isinstance는 상속 관계까지 인정한다. 정수만 받으려면 type(x) is int처럼 정확한 타입을 따로 본다.' },
    { q: "name = \"kim\" 일 때 f\"[{name:>8}]\"의 출력은 무엇인가?",
      o: ['[kim     ]', '[  kim   ]', '[     kim]'], a: 2,
      why: '> 는 오른쪽 정렬, 8은 폭이다. 빈 다섯 칸이 왼쪽에 채워져 [     kim]이 된다.' },
    { q: 's = "  Python  " 에서 s.strip()만 호출하고 끝내면 s는 어떻게 되는가?',
      o: ['"  Python  " 그대로다', '"Python" 으로 바뀐다', 'None이 된다'], a: 0,
      why: 'str은 불변이라 strip()은 새 문자열을 돌려줄 뿐이다. s = s.strip()으로 다시 대입해야 반영된다.' },
    { q: 'def bad(x, box=[])에서 bad(1), bad(2)를 차례로 부르면 두 번째 결과는 무엇인가?',
      o: ['[1, 2]', '[2]', '[]'], a: 0,
      why: '기본값 리스트는 def가 실행될 때 한 번만 만들어져 함수 객체에 붙어 있다. 두 호출이 같은 리스트에 append 한다.' },
  ];

  const summary = [
    '파이썬 변수는 객체에 붙인 이름표라서 b = a는 복사가 아니라 같은 객체를 함께 가리키게 한다.',
    '공유 때문에 생기는 버그는 list, dict, set 같은 가변 객체에서만 생기고 str, int, tuple은 안전하다.',
    '같은 객체인지는 is, 값이 같은지는 == 로 본다. None 비교는 언제나 is None이다.',
    'f-string은 콜론 뒤 스펙으로 자리수, 콤마, 폭, 퍼센트를 한 번에 정한다.',
  ];
  const review = [
    { q: '함수에 넘긴 리스트를 함수 안에서 정렬했더니 호출한 쪽 리스트까지 순서가 바뀌었다. 먼저 의심할 것은?',
      o: ['함수 안의 이름과 바깥 이름이 같은 리스트 객체를 가리킨다', '정렬 함수가 전역 변수를 몰래 고쳤다', 'f-string이 리스트를 문자열로 바꿨다'], a: 0,
      why: '인자 전달도 이름표를 붙이는 일이라 같은 객체를 공유한다. 가변 객체를 따로 쓰려면 .copy()로 새 객체를 만든다.' },
    { q: '로그 함수 def log(msg, lines=[])가 호출될 때마다 이전 메시지까지 함께 찍는다. 고치는 방법은?',
      o: ['lines를 전역 변수로 옮긴다', '기본값을 None으로 두고 함수 안에서 lines = []를 만든다', '호출할 때마다 lines.clear()를 부르게 한다'], a: 1,
      why: '기본값 []는 def 시점에 한 번만 만들어져 모든 호출이 공유한다. None 기본값 패턴은 호출마다 새 리스트를 만든다.' },
    { q: '합계 0.1 + 0.2를 if total == 0.3: 으로 검사했더니 통과하지 못했다. 맞는 처방은?',
      o: ['== 대신 is로 비교한다', 'f"{total:.2f}" 문자열끼리 비교한다', 'math.isclose(total, 0.3)로 비교한다'], a: 2,
      why: '0.1 + 0.2는 실제로 0.30000000000000004로 저장된다. 근사 비교는 isclose가, 돈처럼 정확해야 하는 계산은 Decimal("0.1")이 맡는다.' },
  ];

  R.page({ title: '이름표와 객체', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
