/* I-1-2 null safety — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그리는 것: 타입이라는 상자(String 은 값 칸 하나, String? 는 값 칸 + null 칸), 컴파일 → 실행 관문,
 * ?. 사슬을 따라가다 null 에서 멈추는 점, ?: 갈림길, let 블록을 건너뛰는 길, !! 가 관문을 건너뛰는 다리.
 * 이름 값("Hoyoung", "Seoul")은 페이지 코드에서 나온다. 5단계의 nickname = null 사용자는 설명용 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, G, bump } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 터지는 별 (NPE)
  function burst(cx, cy, r, s, text) { if (s <= 0.01) return; const g = G(cx, cy, s), pts = [];
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, rr = i % 2 ? r * 0.62 : r; pts.push(`${Math.cos(a) * rr},${Math.sin(a) * rr}`); }
    el('polygon', { points: pts.join(' '), fill: BADBG, stroke: BAD, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    if (text) tx(0, 6, text, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD }, g); }
  // 값 알약 / null 알약
  const val = (cx, cy, s, sc, o) => pill(cx, cy, s, (o && o.col) || ACC, sc, { mono: true, fs: 15, fill: (o && o.fill) || ACCBG });
  const nul = (cx, cy, sc, o) => pill(cx, cy, 'null', (o && o.col) || MUT, sc, { mono: true, fs: 15, fill: SOFT });
  // 타입 상자: String 은 한 칸, String? 는 값 칸 + null 칸
  function tbox(cx, cy, name, nullable, o) { o = o || {}; const w = nullable ? 300 : 200, h = 110, x = cx - w / 2, y = cy - h / 2, col = o.col || (nullable ? WARN : GOOD), op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 14, fill: PANEL, stroke: col, 'stroke-width': 2.6, opacity: op });
    mono(x + 14, y - 10, name, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: op });
    if (nullable) { el('line', { x1: x + 196, y1: y + 10, x2: x + 196, y2: y + h - 10, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: op });
      tx(x + 98, y + h - 12, '값 칸', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); tx(x + 248, y + h - 12, 'null 칸', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
    else tx(cx, y + h - 12, '값 칸만 있다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op });
    return { x, y, w, h, vx: nullable ? x + 98 : cx, nx: x + 248, my: cy - 8 }; }

  // =========================================================
  // 1. Java — 모든 참조가 null 일 수 있다
  // =========================================================
  function stages(y, u0, o) { o = o || {}; const ST = [[150, '소스 코드'], [480, '컴파일'], [810, '실행']];
    ST.forEach(([x, n], i) => o.hide !== i && card(x, y, 170, 56, { rx: 12, text: n, fs: 16, stroke: (o.col && o.col[i]) || INK, color: (o.col && o.col[i]) || INK, s: o.hide === i ? 0.001 : pop(o.u, u0 + i * 0.15) }));
    grow(236, y, 394, y, E(o.u, u0 + 0.2, u0 + 0.5), MUT); grow(566, y, 724, y, E(o.u, u0 + 0.2, u0 + 0.5), MUT); }
  function nest(u, miss, a0) { const L = ['if (user != null)', 'if (user.getProfile() != null)', 'if (…getName() != null)'];
    L.forEach((s, i) => { const x = 120 + i * 40, y = 70 + i * 52, w = 620 - i * 80, h = 250 - i * 90, gap = miss === i, p = E(u, a0 + i * 0.4, a0 + i * 0.4 + 0.5);
      if (p <= 0) return;
      el('rect', { x, y, width: w * p, height: h, rx: 12, fill: gap ? 'none' : (i % 2 ? SOFT : PANEL), stroke: gap ? BAD : INK, 'stroke-width': 2, 'stroke-dasharray': gap ? '7 6' : null });
      mono(x + 14, y + 26, gap ? '// 검사 빠뜨림' : s, { 'font-size': 15, 'font-weight': 700, fill: gap ? BAD : INK, opacity: fade(u, a0 + i * 0.4 + 0.3) }); });
    return { ix: 200 + 2 * 40, iy: 70 + 2 * 52 + 70 }; }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const b = tbox(300, 190, 'User user', false, { col: INK });
      el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 2.6 });
      const cyc = Math.floor(seg(u, 0.4, 2.4) * 4) % 2, p = seg(u, 0.4, 2.4) * 4 % 1;
      if (u > 0.4) { const y = lerp(60, b.my, E(p, 0, 0.6)); if (cyc) nul(300, y, 1); else val(300, y, 'User 객체', 1, { col: INFO, fill: INFOBG }); }
      pill(660, 150, 'User 객체도 들어온다', INFO, pop(u, 0.6), { fs: 14 }); pill(660, 210, 'null도 들어온다', MUT, pop(u, 1.4), { fs: 14 });
      sub(660, 280, '타입만 보고는 어느 쪽인지 모른다', fade(u, 2.0), { 'font-size': 15, fill: WARN, 'font-weight': 700 });
      mono(300, 330, 'user.getName()  ← ?', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 1) { pill(150, 90, 'greet(null)', BAD, pop(u, 0.2), { mono: true, fs: 15 });
      stages(200, 0.3, { u, col: [INK, u > 1.3 ? GOOD : INK, u > 2.0 ? BAD : INK], hide: u > 2.0 ? 2 : -1 });
      dot([[150, 200], [480, 200]], seg(u, 0.7, 1.3), BAD, 8); dot([[480, 200], [810, 200]], seg(u, 1.4, 1.95), BAD, 8);
      if (u > 1.3) check(480, 140, 12, pop(u, 1.3)); sub(480, 270, '통과 · 아무 경고 없음', fade(u, 1.4), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      burst(810, 200, 64, pop(u, 2.0), 'NPE');
      sub(810, 296, 'NullPointerException', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 2) { const n = nest(u, -1, 0.2);
      mono(n.ix, n.iy, 'return …getName()', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      card(830, 180, 170, 90, { rx: 12, text: '검사 3겹\n본문 1줄', fs: 17, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 2.0) }); return; }
    if (k === 3) { const n = nest(u, 1, 0.1);
      dot([[760, 30], [300, 150], [590, 226]], seg(u, 1.2, 1.9), BAD, 8);
      burst(590, 226, 42, pop(u, 1.9), 'NPE');
      mono(140, 362, 'return "(unknown)"', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) });
      card(830, 180, 190, 90, { rx: 12, text: '컴파일러는\n빠진 줄을 모른다', fs: 16, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.2) }); return; }
    // k4: 코드 전체에 흩어진 위험 지점
    for (let r = 0; r < 9; r++) { const w = 220 + ((r * 137) % 300), y = 50 + r * 34;
      el('rect', { x: 60, y, width: w * E(u, 0.1 + r * 0.05, 0.6 + r * 0.05), height: 12, rx: 6, fill: GRID });
      if (r % 3 !== 1) el('circle', { cx: 60 + w * 0.7, cy: y + 6, r: 8, fill: BAD, opacity: fade(u, 0.8 + r * 0.1) }); }
    [['String name', 90], ['User user', 170], ['List items', 250]].forEach(([n, y], i) => { const a = 1.2 + i * 0.3;
      card(780, y, 230, 52, { rx: 10, stroke: WARN, fill: WARNBG, s: pop(u, a) });
      mono(690, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); tx(880, y + 6, '?', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, a) }); });
    sub(780, 330, '모든 참조가 보장 없음', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // =========================================================
  // 2. String 과 String? — 다른 타입
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const b = tbox(320, 200, 'String', false, { op: fade(u, 0.1) });
      mono(320, 80, 'val name: String = "Hoyoung"', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      const p = E(u, 0.6, 1.4); if (p > 0) val(320, lerp(100, b.my, p), '"Hoyoung"', 1);
      card(720, 200, 260, 70, { rx: 12, text: '여기엔 언제나\n값이 들어 있다', fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.8) }); return; }
    if (k === 1) { const b = tbox(320, 200, 'String', false); val(320, b.my, '"Hoyoung"', 1);
      const p = E(u, 0.3, 1.0), back = E(u, 1.0, 1.5);
      if (p > 0) nul(lerp(700, 470, p) + back * 120, b.my - 50 + back * -20, 1, { col: BAD });
      if (u > 1.0) cross(450, b.my - 50, 10, pop(u, 1.0));
      pill(480, 330, 'Null can not be a value of a non-null type String', BAD, pop(u, 1.6), { mono: true, fs: 13.5 });
      sub(480, 380, '실행 전, 빌드에서 막힌다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const a = tbox(190, 190, 'String', false); val(190, a.my, '"Hoyoung"', 1);
      const b = tbox(640, 190, 'String?', true, { op: fade(u, 0.2) });
      if (u > 0.9) nul(b.nx, lerp(80, b.my, E(u, 0.9, 1.5)), 1, { col: WARN });
      mono(640, 80, 'val nickname: String? = null', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      spans(330, 330, [['String?', { fill: WARN, 'font-weight': 800 }], [' = ', { fill: MUT }], ['String', { fill: GOOD, 'font-weight': 800 }], [' 값 또는 ', { fill: MUT }], ['null', { 'font-weight': 800 }]], { 'font-size': 18, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { // 함수 시그니처 = 문
      card(250, 90, 360, 44, { rx: 10, text: 'fun greet(user: String)', mono: true, fs: 15, stroke: GOOD, s: pop(u, 0.2) });
      el('rect', { x: 236, y: 150, width: 28, height: 150, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
      const p1 = seg(u, 0.5, 1.3); if (p1 > 0 && p1 < 1) val(lerp(80, 400, p1), 190, '"Ann"', 1);
      const p2 = E(u, 1.0, 1.5); if (p2 > 0) { nul(lerp(80, 190, p2), 260, 1, { col: BAD }); if (p2 >= 1) cross(160, 228, 8, 1); }
      sub(250, 340, 'null은 들어올 수 없다', fade(u, 1.5), { 'font-size': 15, fill: GOOD, 'font-weight': 700 });
      card(710, 90, 380, 44, { rx: 10, text: 'fun maybeName(): String?', mono: true, fs: 15, stroke: WARN, s: pop(u, 1.2) });
      el('rect', { x: 696, y: 150, width: 28, height: 150, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.3) });
      const q = seg(u, 1.5, 2.6) * 2; if (u > 1.5 && u < 2.6) { const f = q % 1; if (q < 1) val(lerp(710, 900, f), 190, '값', 1, { col: WARN, fill: WARNBG }); else nul(lerp(710, 900, f), 260, 1, { col: WARN }); }
      sub(760, 340, '호출한 쪽이 null을 처리해야 한다', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 });
      mono(480, 395, '"Ann"은 예시 값', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); return; }
    if (k === 4) { const b = tbox(250, 190, 'String?', true); nul(b.nx, b.my, 1, { col: WARN });
      const a = tbox(760, 190, 'String', false);
      grow(410, 190, 650, 190, E(u, 0.4, 1.2), BAD); if (u > 1.2) cross(530, 190, 12, pop(u, 1.2));
      mono(530, 160, 'val n: String = maybeName()', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) });
      card(480, 330, 520, 54, { rx: 12, text: 'null 칸을 먼저 처리해야 String이 된다', fs: 16, stroke: INK, s: pop(u, 1.7) }); return; }
    // k5: 스마트 캐스트
    const b = tbox(190, 190, 's: String?', true, { op: 1 });
    nul(b.nx, b.my, 1, { col: WARN });
    card(470, 190, 150, 62, { rx: 12, text: 's != null ?', mono: true, fs: 15, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.3) });
    grow(345, 190, 392, 190, E(u, 0.3, 0.6), MUT);
    grow(548, 170, 640, 110, E(u, 0.8, 1.2), GOOD); grow(548, 210, 640, 290, E(u, 0.8, 1.2), MUT);
    if (u > 1.1) { const g = tbox(780, 110, 'if 안: String', false, { op: fade(u, 1.1, 0.3) }); mono(780, g.my + 6, 's.length', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    card(780, 300, 200, 50, { rx: 12, text: 'else → 0', mono: true, fs: 16, stroke: MUT, s: pop(u, 1.4) });
    sub(480, 395, '검사한 뒤에는 컴파일러가 String으로 본다 · 스마트 캐스트', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 3. ?. — null 이면 거기서 멈추고 null
  // =========================================================
  const NX = [110, 330, 550, 770], NY = 200;
  const NODES = [['u', 'User?'], ['profile', 'Profile?'], ['address', 'Address?'], ['city', 'String']];
  function chain(o) { o = o || {};
    NODES.forEach(([n, ty], i) => { const nul = ty.endsWith('?'), dim = o.dim != null && i > o.dim;
      card(NX[i], NY, 150, 66, { rx: 12, stroke: dim ? OFF : nul ? WARN : GOOD, fill: dim ? SOFT : PANEL, sw: 2.4, s: o.s ? o.s(i) : 1 });
      mono(NX[i], NY - 4, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: dim ? OFF : INK, opacity: o.s ? Math.min(1, o.s(i)) : 1 });
      mono(NX[i], NY + 20, ty, { 'font-size': 14, 'text-anchor': 'middle', fill: dim ? OFF : nul ? WARN : GOOD, opacity: o.s ? Math.min(1, o.s(i)) : 1 });
      if (i < 3) { mono((NX[i] + NX[i + 1]) / 2, NY - 14, '?.', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: dim || (o.dim != null && i >= o.dim) ? OFF : ACC, opacity: o.s ? Math.min(1, o.s(i + 1)) : 1 });
        el('line', { x1: NX[i] + 75, y1: NY, x2: NX[i + 1] - 75, y2: NY, stroke: o.dim != null && i >= o.dim ? OFF : ACC, 'stroke-width': 2.4, 'stroke-dasharray': o.dim != null && i >= o.dim ? '5 5' : null, opacity: o.s ? Math.min(1, o.s(i + 1)) : 1 }); } }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const D = [['Address', [['city: String', false]]], ['Profile', [['address: Address?', true]]], ['User', [['name: String', false], ['profile: Profile?', true]]]];
      D.forEach(([n, f], i) => { const x = 50 + i * 300, s = fade(u, 0.2 + i * 0.4);
        el('rect', { x, y: 110, width: 260, height: 50 + f.length * 40, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: s });
        mono(x + 14, 140, 'data class ' + n, { 'font-size': 15, 'font-weight': 800, opacity: s });
        f.forEach(([s2, q], j) => { mono(x + 20, 178 + j * 40, s2, { 'font-size': 15, 'font-weight': 700, fill: q ? WARN : INK, opacity: s });
          if (q && u > 1.4 + i * 0.2) el('circle', { cx: x + 244, cy: 173 + j * 40, r: 9, fill: WARN, opacity: fade(u, 1.4 + i * 0.2) }); }); });
      sub(480, 330, '물음표가 붙은 곳만 비어 있을 수 있다', fade(u, 2.1), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 1) { chain({ s: (i) => (i === 0 ? pop(u, 0.2) : 0.001), dim: 0 });
      const p = E(u, 0.7, 1.2); if (p > 0) card(lerp(520, 260, p), 110, 110, 36, { rx: 18, text: 'u.name', mono: true, fs: 15, fw: 700, stroke: p >= 1 ? BAD : INK, color: p >= 1 ? BAD : INK });
      if (u > 1.2) cross(330, 110, 9, pop(u, 1.2));
      pill(260, 300, 'u?.name  은 된다', GOOD, pop(u, 1.8), { mono: true, fs: 15 });
      sub(640, 300, '값이 들어 있어도 타입이 User?면 점(.)만으로는 못 쓴다', fade(u, 1.5), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { chain({ s: (i) => pop(u, 0.1 + i * 0.15) });
      dot([[NX[0], NY + 46], [NX[3], NY + 46]], seg(u, 0.7, 1.9), ACC, 8);
      if (u > 1.9) val(NX[3], 300, '"Seoul"', pop(u, 1.9));
      val(NX[0], 300, '"Hoyoung"', pop(u, 1.0)); mono(NX[0], 345, 'u?.name', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      mono(NX[3], 345, 'u?.profile?.address?.city', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) });
      sub(480, 90, '결과 타입은 String?', fade(u, 2.3), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 3) { chain({ dim: 0 });
      nul(NX[0], NY - 70, pop(u, 0.2)); mono(NX[0] + 60, NY - 64, 'u2 = null', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.2) });
      dot([[NX[0], NY + 46], [NX[0] + 70, NY + 46]], seg(u, 0.6, 1.1), MUT, 8);
      if (u > 1.1) { el('line', { x1: NX[0] + 90, y1: NY - 30, x2: NX[0] + 90, y2: NY + 30, stroke: INK, 'stroke-width': 4 }); }
      nul(NX[0], 310, pop(u, 1.3), { col: GOOD }); mono(NX[0], 352, 'u2?.name', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) });
      card(640, 330, 340, 54, { rx: 12, text: '호출을 건너뛰고 결과만 null', fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.8) }); return; }
    // k4: if 사다리가 한 줄로
    const L = ['if (user != null) {', '  if (user.profile != null) {', '    if (….address != null) {', '      return ….city', '} } }'];
    const f = E(u, 1.0, 1.8);
    const gone = 1 - E(u, 1.0, 1.3); if (gone > 0) L.forEach((s, i) => { const y = lerp(70 + i * 40, 150, f); mono(120, y, s, { 'font-size': 15, fill: INK, opacity: gone * fade(u, 0.1 + i * 0.12) }); });
    if (f > 0.6) { mono(120, 150, 'user?.profile?.address?.city', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); }
    if (gone > 0) mono(560, 150, '5줄', { 'font-size': 22, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.4) * gone });
    card(760, 150, 220, 70, { rx: 12, text: '어디서든 null이면\n식 전체가 null', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.0) });
    sub(480, 340, '검사를 빠뜨릴 자리가 사라진다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 4. ?: — null 이면 오른쪽
  // =========================================================
  // 갈림길: 왼쪽 식 결과가 들어와 null 이면 아래(오른쪽 식), 아니면 위로 그대로
  function fork(x, y, right, u, a, isNull, o) { o = o || {};
    card(x, y, 64, 52, { rx: 26, text: '?:', mono: true, fs: 20, stroke: INFO, color: INFO, fill: INFOBG });
    el('line', { x1: x + 32, y1: y, x2: x + 220, y2: y, stroke: GOOD, 'stroke-width': 2.4 }); el('path', { d: `M${x},${y + 26} V${y + 70} H${x + 220}`, fill: 'none', stroke: WARN, 'stroke-width': 2.4 });
    pill(x + 130, y + 70, right, WARN, 1, { mono: true, fs: 14 });
    const p = seg(u, a, a + 0.6); if (p > 0 && p < 1) { if (isNull) nul(lerp(x - 200, x - 40, p), y, 1); }
    const q = seg(u, a + 0.6, a + 1.2); if (q > 0 && isNull) val(x + 300, y, o.out || right, pop(u, a + 0.9), { col: GOOD, fill: GOODBG }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['u?.name', '"Guest"', 110], ['u?.score', '0', 270]].forEach(([l, r, y], i) => { const a = 0.2 + i * 0.6;
        mono(40, y + 5, l, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
        if (u > a) fork(300, y, r, u, a, true); });
      sub(780, 390, '오른쪽을 지나면 non-null 값만 남는다', fade(u, 2.1), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    const body = (title, a) => { zone(250, 40, 460, 330, title, { stroke: INK, sw: 2, color: INK, fill: SOFT }); };
    if (k === 1 || k === 2) { const thr = k === 2, ttl = thr ? 'fun chargeCard(userId: Long?)' : 'fun process(user: User?)';
      body(ttl);
      card(480, 120, 300, 50, { rx: 10, text: thr ? 'userId ?: throw …' : 'user?.id ?: return', mono: true, fs: 15, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.2) });
      card(480, 290, 300, 50, { rx: 10, text: thr ? 'return charge(uid)' : 'println("processing $id")', mono: true, fs: 15, stroke: GOOD, s: pop(u, 0.4) });
      grow(480, 146, 480, 262, E(u, 0.5, 0.9), GOOD); mono(500, 210, thr ? 'uid: Long' : 'id: 값 있음', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
      dot([[480, 60], [480, 120], [480, 290]], seg(u, 0.8, 1.6), GOOD, 8);
      dot([[420, 60], [420, 120], [330, 120], [130, 120]], seg(u, 1.4, 2.2), MUT, 8);
      if (thr) burst(110, 200, 50, pop(u, 2.0), '예외'); else { el('rect', { x: 70, y: 90, width: 60, height: 80, rx: 6, fill: PANEL, stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.0) }); tx(100, 196, '종료', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
      sub(130, 280, thr ? 'IllegalArgumentException' : 'null이면 여기서 return', fade(u, 2.2), { 'font-size': 14, fill: thr ? BAD : WARN, 'font-weight': 700 }); return; }
    // k3: 오른쪽에 올 수 있는 세 가지
    card(200, 200, 160, 70, { rx: 14, text: 'x ?: ___', mono: true, fs: 20, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.2) });
    [['기본값', '"Guest"', 90, GOOD], ['조기 종료', 'return', 200, WARN], ['예외', 'throw …', 310, BAD]].forEach(([n, s, y, col], i) => { const a = 0.6 + i * 0.4;
      grow(282, 200, 560, y, E(u, a, a + 0.4), col); card(680, y, 240, 62, { rx: 12, stroke: col, s: pop(u, a + 0.3) });
      mono(610, y + 6, s, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, a + 0.3) }); tx(790, y + 6, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, a + 0.3) }); });
    sub(200, 290, 'if (x == null) 블록이 필요 없다', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 5. let 과 !!
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 200, 320, 140, { rx: 14, stroke: ACC, fill: u > 0.9 && u < 1.7 ? ACCBG : PANEL, sw: 2.4, s: pop(u, 0.1) });
      mono(340, 150, 'user?.let {', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      mono(360, 196, 'println(it.name)', { 'font-size': 15, opacity: fade(u, 0.2) }); mono(360, 226, 'log.info(…)', { 'font-size': 15, opacity: fade(u, 0.2) });
      dot([[80, 200], [330, 200], [630, 200], [880, 200]], seg(u, 0.4, 1.6), ACC, 8); pill(80, 160, 'User', ACC, pop(u, 0.3), { fs: 14 });
      mono(480, 120, 'it: User (non-null)', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      el('path', { d: 'M80,320 C200,390 760,390 880,320', fill: 'none', stroke: OFF, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 1.6) });
      dot([[80, 320], [300, 372], [660, 372], [880, 320]], seg(u, 1.7, 2.6), MUT, 8); nul(80, 290, pop(u, 1.6));
      sub(480, 395, 'null이면 블록을 통째로 건너뛴다', fade(u, 2.0), { 'font-size': 15, fill: MUT, 'font-weight': 700 }); return; }
    if (k === 1) { const SV = [['user?.nickname', 110], ['?: user?.name', 200], ['?: "Guest"', 290]];
      SV.forEach(([s, y], i) => { card(330, y, 270, 56, { rx: 12, text: s, mono: true, fs: 15, stroke: i === 2 ? GOOD : WARN, fill: i === 2 ? GOODBG : PANEL, s: pop(u, 0.2 + i * 0.2) }); if (i < 2) grow(330, y + 28, 330, y + 62, E(u, 0.4 + i * 0.2, 0.7 + i * 0.2), MUT); });
      tx(620, 60, '예시 사용자 두 명', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.6) });
      // 예시 1: nickname 없음 → name
      dot([[180, 110], [180, 200], [465, 200], [620, 200]], seg(u, 0.8, 1.6), ACC, 8);
      card(760, 160, 260, 56, { rx: 12, text: 'nickname=null, name="Hoyoung"', fs: 13.5, mono: true, stroke: GRID, s: pop(u, 0.7) });
      if (u > 1.6) val(760, 214, '"Hoyoung"', pop(u, 1.6));
      // 예시 2: user = null → "Guest"
      dot([[160, 110], [160, 290], [465, 290], [620, 300]], seg(u, 1.6, 2.4), MUT, 8);
      card(760, 300, 260, 44, { rx: 12, text: 'user = null', fs: 14, mono: true, stroke: GRID, s: pop(u, 1.5) });
      if (u > 2.4) val(760, 350, '"Guest"', pop(u, 2.4), { col: GOOD, fill: GOODBG }); return; }
    if (k === 2) { zone(430, 50, 490, 320, 'fun handle(req: Request)', { stroke: GOOD, sw: 2, color: GOOD, fill: GOODBG });
      el('rect', { x: 416, y: 140, width: 28, height: 140, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      mono(430, 312, 'requireNotNull', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      pill(150, 130, 'req.userId: Long?', WARN, pop(u, 0.3), { mono: true, fs: 14 });
      dot([[150, 170], [400, 180], [560, 180]], seg(u, 0.7, 1.4), GOOD, 8);
      if (u > 1.4) mono(580, 186, 'val userId: Long', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      sub(680, 240, '안쪽 코드는 null을 생각하지 않는다', fade(u, 1.7), { 'font-size': 14, fill: INK, 'font-weight': 700 });
      const p = seg(u, 1.4, 2.0); if (p > 0) { if (p < 1) nul(lerp(150, 380, p), 250, 1, { col: BAD }); else burst(250, 260, 46, pop(u, 2.0), '예외'); }
      sub(220, 330, 'IllegalArgumentException("userId 필요")', fade(u, 2.2), { 'font-size': 13.5, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { stages(140, 0.1, { u, col: [INK, OFF, u > 1.8 ? BAD : INK], hide: u > 1.8 ? 2 : -1 });
      pill(150, 60, 'user!!.name', BAD, pop(u, 0.3), { mono: true, fs: 15 });
      el('path', { d: `M236,120 C330,${lerp(120, 40, E(u, 0.6, 1.1))} 630,${lerp(120, 40, E(u, 0.6, 1.1))} 724,120`, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: fade(u, 0.6) });
      sub(480, 34, '컴파일러 검사를 건너뛴다', fade(u, 1.0), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      burst(810, 140, 58, pop(u, 1.8), 'NPE');
      card(480, 320, 420, 70, { rx: 14, text: 'PR 리뷰: "다른 방법 없나요?"', fs: 16, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 2.2) }); return; }
    // k4: 도구 상자
    const T = [['?.', '건너뛰고 null', GOOD], ['?:', '기본값 · return · throw', GOOD], ['?.let { }', 'null 아니면 블록', GOOD], ['requireNotNull', '경계에서 검증', GOOD], ['!!', '최후 수단 · NPE', BAD]];
    T.forEach(([a, b, col], i) => { const y = 54 + i * 62, s = pop(u, 0.2 + i * 0.3);
      card(480, y, 560, 50, { rx: 12, stroke: col, fill: col === BAD ? BADBG : PANEL, sw: 2, s });
      mono(230, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.3) });
      tx(740, y + 6, b, { 'font-size': 15, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.3) }); });
    banner(480, 380, 'null 가능성은 검사 대신 타입에 적는다', pop(u, 2.0)); }

  const quiz = [
    { q: 'Java에서 greet(null)이 운영 중에야 터지는 이유는 무엇인가?',
      o: ['User 타입에 null이 들어올 수 있는지 컴파일러가 구분하지 못해서', 'JVM이 null을 지원하지 않아서', 'greet 함수에 버그가 있어서'], a: 0,
      why: 'Java의 User 타입은 값과 null을 모두 받는다. 그래서 컴파일은 통과하고 실행 중에 NullPointerException이 난다.' },
    { q: 'val c: String = null은 어떻게 되는가?',
      o: ['실행 중 NPE가 난다', 'c에 빈 문자열이 들어간다', '컴파일 에러가 난다'], a: 2,
      why: 'String 타입에는 null 칸이 없다. null을 받으려면 String?로 선언해야 하고, 아니면 빌드에서 막힌다.' },
    { q: 'u2가 null일 때 u2?.name의 결과는 무엇인가?',
      o: ['NullPointerException', 'null', '빈 문자열 ""'], a: 1,
      why: '?.는 왼쪽이 null이면 호출을 건너뛰고 식 전체를 null로 만든다. 예외는 나지 않는다.' },
    { q: 'val id = user?.id ?: return 다음 줄에서 id는 어떤 값인가?',
      o: ['null일 수도 있는 값', '언제나 0', 'null이 아닌 값'], a: 2,
      why: 'null이면 그 자리에서 함수가 끝난다. 그래서 다음 줄에 닿았다면 id에는 값이 들어 있다.' },
    { q: 'user!!.name에서 user가 null이면 어떻게 되는가?',
      o: ['그 자리에서 NPE가 난다', 'null이 돌아온다', '"Guest"가 돌아온다'], a: 0,
      why: '!!는 컴파일러의 null 검사를 건너뛰겠다는 표시다. null이면 Java 시절처럼 NPE가 난다.' },
  ];
  const summary = [
    'Java 타입은 null이 들어올지 알려 주지 않아서 NPE가 실행 중에야 터진다.',
    'Kotlin은 String과 String?를 다른 타입으로 두고 null 대입을 컴파일에서 막는다.',
    '?.는 null이면 호출을 건너뛰고, ?:는 그 자리에 기본값이나 return, throw를 둔다.',
    'if로 null을 검사하면 그 안에서는 String으로 쓴다. !!는 검사를 버리는 최후 수단이다.',
  ];
  const review = [
    { q: '외부 API가 주는 userId가 가끔 비어 온다. 처리 함수 안쪽 코드를 단순하게 두려면 먼저 무엇을 하는가?',
      o: ['함수 곳곳에 userId!!를 붙인다', '진입점에서 requireNotNull로 한 번 검증한다', 'userId를 String으로 바꿔 받는다'], a: 1,
      why: '경계에서 한 번 검증하면 그 아래는 null이 아닌 값만 다룬다. !!는 문제를 실행 시점 NPE로 미룰 뿐이다.' },
    { q: 'user?.profile?.address?.city가 null을 돌려줬다. 알 수 있는 것은 무엇인가?',
      o: ['사슬 어딘가가 null이었다', 'city 문자열이 비어 있었다', 'NPE가 났다가 복구됐다'], a: 0,
      why: '?. 사슬은 처음 만난 null에서 멈추고 식 전체를 null로 만든다. user, profile, address 중 하나가 비었다는 뜻이다.' },
    { q: 'fun len(s: String?) 안에서 s.length를 쓰려 했더니 컴파일 에러가 났다. 알맞은 고침은 무엇인가?',
      o: ['s!!.length로 바꿔 에러를 없앤다', '매개변수 타입을 Any로 바꾼다', 'if (s != null) 안에서 s.length를 쓴다'], a: 2,
      why: 'null 검사를 하면 그 안에서 s는 String으로 스마트 캐스트된다. !!는 컴파일은 되지만 null이면 NPE가 난다.' },
  ];

  R.page({ title: 'null이 지나가는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
