/* V-1-1 equals·hashCode 계약 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 해시 값은 Java 규칙(String.hashCode, Objects.hash = Arrays.hashCode, HashMap.hash = h ^ h>>>16, 버킷 = hash & 15)을
 * python 으로 같은 계산을 해 얻었다: "kim".hashCode() = 106191, Objects.hash("kim", 30) = 3292912 → 버킷 2,
 * Objects.hash("kim", 31) = 3292913 → 버킷 3, "Aa"·"BB" 의 hashCode 는 둘 다 2112.
 * 기본(정체성) hashCode 와 주소는 실행마다 다르므로 그림에 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const H30 = 3292912, H31 = 3292913;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // 힙 객체: 머리띠(클래스 이름) + 필드 줄. o.addr 주소(예시), o.stroke 테두리
  function obj(cx, cy, cls, rows, o) { o = o || {}; const w = o.w || 170, h = 34 + rows.length * 26, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 9, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 2.2 }, g);
    el('path', { d: `M${-w / 2},${-h / 2 + 30} H${w / 2}`, stroke: col, 'stroke-width': 1.5 }, g);
    tx(0, -h / 2 + 21, cls, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }, g);
    rows.forEach((r, i) => { const [s, c] = Array.isArray(r) ? r : [r, null]; mono(-w / 2 + 14, -h / 2 + 52 + i * 26, s, { 'font-size': 14.5, fill: c || INK }, g); });
    if (o.addr) mono(w / 2, -h / 2 - 8, o.addr, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g);
    return { w, h }; }
  // 스택 칸: 변수 이름 + 참조 점
  function slot(x, y, name, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y: y - 20, width: 150, height: 40, rx: 7, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    mono(x + 14, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: op });
    if (o.val) mono(x + 124, y + 5, o.val, { 'font-size': 13.5, fill: o.valCol || MUT, 'text-anchor': 'end', opacity: op });
    if (o.ref) el('circle', { cx: x + 136, cy: y, r: 5.5, fill: o.refCol || INFO, opacity: op }); }
  // 해시 표 16칸 (HashMap 기본 크기). nodes: { 버킷: [글자, 색] }
  const BX = 40, BW = 52, BG = 4;
  const bx = (i) => BX + i * (BW + BG) + BW / 2;
  function table(y, o) { o = o || {};
    for (let i = 0; i < 16; i++) { const hot = o.hot && o.hot[i];
      el('rect', { x: bx(i) - BW / 2, y, width: BW, height: 38, rx: 5, fill: hot ? (hot === 'bad' ? BADBG : hot === 'good' ? GOODBG : ACCBG) : PANEL, stroke: hot ? (hot === 'bad' ? BAD : hot === 'good' ? GOOD : ACC) : GRID, 'stroke-width': hot ? 2.6 : 1.5, opacity: o.op ?? 1 });
      mono(bx(i), y + 24, String(i), { 'font-size': 13.5, fill: hot ? INK : MUT, 'text-anchor': 'middle', 'font-weight': hot ? 800 : 400, opacity: o.op ?? 1 }); }
    if (o.title) tx(BX, y - 12, o.title, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 }); }
  // 버킷 아래에 매달린 노드
  function node(i, y, text, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return;
    el('line', { x1: bx(i), y1: y - 30, x2: bx(i), y2: y - 14, stroke: o.stroke || ACC, 'stroke-width': 2, opacity: o.op ?? 1 });
    card(bx(i), y, o.w || 92, 28, { rx: 6, text, fs: 13.5, mono: true, stroke: o.stroke || ACC, fill: o.fill || PANEL, color: o.color || INK, s, op: o.op, dash: o.dash }); }

  // =========================================================
  // 1. 기본 equals 는 "같은 객체?" 만 본다 — 스택 · 힙 · 메서드 영역
  // =========================================================
  function frame1(op) {
    zone(24, 24, 210, 372, '스택 · main()', { op });
    zone(256, 166, 680, 230, '힙 (new 로 만든 객체)', { op });
    zone(520, 24, 416, 128, '메서드 영역 (클래스 정보)', { op, fill: INFOBG, color: INFO }); }
  // 자라는 곡선 화살표 (u 0→1)
  function curve(x1, y1, qx, qy, x2, y2, u, col, o) { if (u <= 0) return; o = o || {};
    const p = el('path', { d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.4, pathLength: 100, 'stroke-dasharray': u < 1 ? `${u * 100} 100` : null, 'marker-end': u >= 1 ? 'url(#ra-ah)' : null }); return p; }
  function s1(t, c) { const { k, u } = c;
    frame1(1);
    // 클래스 정보: Object → Point (상속)
    const pS = k === 0 ? pop(u, 0.2) : 1;
    const pg = R.G(830, 94, pS);
    el('rect', { x: -96, y: -38, width: 192, height: 76, rx: 9, fill: PANEL, stroke: k === 0 ? ACC : INK, 'stroke-width': k === 0 ? 2.8 : 2 }, pg);
    tx(0, -16, 'class Point', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }, pg);
    mono(0, 6, 'final int x, y', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }, pg);
    mono(0, 27, k >= 1 ? 'equals·hashCode 상속' : '재정의 없음', { 'font-size': 13.5, 'text-anchor': 'middle', fill: k >= 1 ? WARN : MUT }, pg);
    if (k >= 1) { const oS = k === 1 ? pop(u, 0.2) : 1;
      card(610, 94, 170, 76, { rx: 9, stroke: k === 4 ? BAD : INK, sw: k === 4 ? 2.8 : 2, s: oS, fill: SOFT });
      if (oS > 0.5) { tx(610, 76, 'class Object', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
        mono(610, 98, 'equals: this == obj', { 'font-size': 13.5, 'text-anchor': 'middle', fill: k === 4 ? BAD : INK });
        mono(610, 120, 'hashCode: 정체성', { 'font-size': 13.5, 'text-anchor': 'middle', fill: k === 5 ? WARN : INK }); }
      grow(697, 94, 732, 94, k === 1 ? seg(u, 0.6, 1.2) : 1, MUT); }
    if (k === 1) R.fly(610, 150, 830, 150, seg(u, 1.2, 2.4), 'equals · hashCode', { fill: WARN, mono: true });
    // 스택 변수와 힙 객체
    const made = k >= 2, s2_ = k === 2 ? pop(u, 0.2) : 1, s3_ = k === 2 ? pop(u, 0.9) : 1;
    slot(54, 150, 'p1', { ref: made && s2_ > 0.5, val: k === 3 ? '@1a2b' : null, valCol: BAD });
    slot(54, 270, 'p2', { ref: made && s3_ > 0.5, val: k === 3 ? '@3c4d' : null, valCol: BAD });
    if (!made) { sub(129, 330, '아직 참조 없음', 1); return; }
    obj(400, 262, 'Point', ['x = 1', 'y = 2'], { addr: '@1a2b (예시)', s: s2_, stroke: k === 3 ? BAD : INK });
    obj(720, 262, 'Point', ['x = 1', 'y = 2'], { addr: '@3c4d (예시)', s: s3_, stroke: k === 3 ? BAD : INK });
    grow(196, 150, 312, 244, k === 2 ? seg(u, 0.4, 1.0) : 1, INFO, { sw: 2.4 });
    curve(196, 270, 420, 380, 632, 284, k === 2 ? seg(u, 1.1, 1.9) : 1, INFO);
    if (k === 2) sub(580, 380, '값은 같아도 new 를 두 번 하면 객체도 둘', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
    if (k === 3) { pill(740, 376, 'p1 == p2  →  false', BAD, pop(u, 0.9), { mono: true, fs: 15, fill: PANEL });
      sub(740, 342, '화살표가 가리키는 곳(참조)만 비교한다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); }
    if (k === 4) { dot([[400, 218], [400, 160], [610, 133]], seg(u, 0.2, 1.3), BAD, 7);
      pill(740, 378, 'p1.equals(p2)  →  false', BAD, pop(u, 1.4), { mono: true, fs: 15, fill: PANEL });
      sub(740, 342, '물려받은 equals 의 본문이 this == obj 다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }
    if (k === 5) { pill(400, 334, 'hashCode 예: 1163157884', WARN, fade(u, 0.3), { mono: true, fs: 13.5, fill: PANEL });
      pill(720, 334, 'hashCode 예: 1956725890', WARN, fade(u, 1.0), { mono: true, fs: 13.5, fill: PANEL });
      sub(580, 386, '값은 같은데 수가 다르다 → 해시 컬렉션이 같은 값으로 못 본다', fade(u, 1.7), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); } }

  // =========================================================
  // 2. 계약 — equals ⇒ hashCode, 그리고 equals 5원칙
  // =========================================================
  function rule(i, title, expr, s, draw) { const cx = 100 + i * 190, cy = 340; if (s <= 0) return;
    card(cx, cy, 176, 112, { rx: 10, stroke: GOOD, sw: 2, s });
    if (s < 0.6) return;
    tx(cx, cy - 36, title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD });
    draw(cx, cy + 4);
    mono(cx, cy + 46, expr, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK }); }
  const nd = (x, y, s) => { el('circle', { cx: x, cy: y, r: 11, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(x, y + 5, s, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 }); };
  function s2(t, c) { const { k, u } = c;
    const a = k === 0 ? pop(u, 0.2) : 1, b = k === 0 ? pop(u, 0.6) : 1;
    obj(106, 76, 'User a', ['name = "kim"', 'age  = 30'], { w: 176, s: a });
    obj(106, 196, 'User b', ['name = "kim"', 'age  = 30'], { w: 176, s: b });
    if (k === 0) sub(106, 262, '값이 같은 두 객체', fade(u, 1.0), { 'font-size': 14.5, fill: INK });
    // 정방향: equals true ⇒ hashCode 같음
    if (k >= 1) { const g = k === 1 ? u : 3;
      mono(212, 82, 'hashCode() = ' + fmt(tween(0, H30, g - 0.2, 1.2)), { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
      mono(212, 202, 'hashCode() = ' + fmt(tween(0, H30, g - 0.4, 1.2)), { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
      card(700, 66, 470, 52, { rx: 10, stroke: GOOD, sw: 2.4, fill: GOODBG, s: k === 1 ? pop(u, 1.2) : 1 });
      if (k > 1 || u > 1.5) { mono(486, 72, 'a.equals(b)', { 'font-size': 15, 'font-weight': 700 });
        tx(616, 72, '반드시 ⇒', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
        mono(700, 72, '같은 hashCode', { 'font-size': 15, 'font-weight': 700 }); }
      tx(466, 30, '정방향 (필수)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: k === 1 ? fade(u, 1.2) : 1 }); }
    // 역방향: 같은 hashCode 라도 equals 는 다를 수 있다 ("Aa" · "BB" = 2112)
    if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1;
      tx(466, 140, '역방향 (필수 아님) · 해시 충돌', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: s });
      card(560, 186, 160, 52, { rx: 9, stroke: WARN, sw: 2, s, text: '"Aa"\nhash 2112', fs: 14, mono: true });
      card(760, 186, 160, 52, { rx: 9, stroke: WARN, sw: 2, s: k === 2 ? pop(u, 0.6) : 1, text: '"BB"\nhash 2112', fs: 14, mono: true });
      if (k > 2 || u > 1.2) { mono(660, 238, '"Aa".equals("BB") → false', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.2) : 1 }); }
      grow(642, 186, 678, 186, k === 2 ? seg(u, 0.8, 1.2) : 1, WARN, { plain: true }); }
    // 5원칙 카드
    const rs = (i, at) => (k < at ? 0 : k === at ? pop(u, 0.2 + (i % 2) * 0.7) : 1);
    rule(0, '반사성', 'x.equals(x)', rs(0, 3), (x, y) => { nd(x - 20, y, 'x'); el('path', { d: `M${x - 10},${y - 7} C${x + 30},${y - 34} ${x + 34},${y + 30} ${x - 9},${y + 8}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'marker-end': 'url(#ra-ah)' }); });
    rule(1, '대칭성', 'x→y 이면 y→x', rs(1, 3), (x, y) => { nd(x - 44, y, 'x'); nd(x + 44, y, 'y');
      el('path', { d: `M${x - 32},${y - 6} Q${x},${y - 22} ${x + 32},${y - 6}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'marker-end': 'url(#ra-ah)' });
      el('path', { d: `M${x + 32},${y + 6} Q${x},${y + 22} ${x - 32},${y + 6}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'marker-end': 'url(#ra-ah)' }); });
    rule(2, '추이성', 'x=y, y=z ⇒ x=z', rs(2, 4), (x, y) => { nd(x - 50, y + 10, 'x'); nd(x, y - 14, 'y'); nd(x + 50, y + 10, 'z');
      grow(x - 40, y + 4, x - 12, y - 10, 1, GOOD); grow(x + 12, y - 10, x + 40, y + 4, 1, GOOD); grow(x - 38, y + 14, x + 37, y + 14, 1, GOOD, { dash: '4 4' }); });
    rule(3, '일관성', '몇 번 불러도 같다', rs(3, 4), (x, y) => { [-46, 0, 46].forEach((d) => mono(x + d, y + 5, 'true', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 })); });
    rule(4, 'null-아님', 'x.equals(null)', rs(4, 5), (x, y) => { nd(x - 40, y, 'x'); mono(x + 38, y + 5, 'null', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      grow(x - 28, y, x + 14, y, 1, MUT, { plain: true }); mono(x - 6, y - 12, 'false', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 }); });
    if (k === 5) tx(480, 276, '다섯 가지를 모두 지켜야 컬렉션이 예측대로 움직인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); }

  // =========================================================
  // 3. HashMap — hashCode 로 버킷을 고르고, 그 안에서만 equals
  // =========================================================
  const TY = 196;   // 버킷 줄 위치
  function keyCard(x, label, addr, o) { o = o || {}; obj(x, 74, label, ['"kim", 30'], { w: 150, addr, stroke: o.stroke, s: o.s ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    const X = k >= 4;   // 재정의 X 세계
    const putB = X ? 7 : 2, probeB = X ? 13 : 2;
    table(TY, { title: X ? 'HashMap 버킷 16칸 · 정체성 해시 기준 (번호는 예시)' : 'HashMap 버킷 16칸 · hash & 15 로 칸을 고른다',
      hot: k === 4 && u > 1.5 ? { 13: 'bad' } : k === 3 && u > 1.3 ? { 2: 'good' } : k === 5 ? { 7: 'bad', 13: 'bad' } : null });
    // 저장된 노드
    if (k === 0) { keyCard(140, 'key', '@1a2b (예시)', { s: pop(u, 0.2) });
      mono(300, 64, 'hashCode() = 3,292,912', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(300, 88, '(h ^ h>>>16) & 15 = 2', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      dot([[140, 108], [140, 150], [bx(2), 150], [bx(2), TY]], seg(u, 1.2, 2.0), ACC, 7);
      node(2, 276, 'kim,30 → 회원A', { w: 140, s: pop(u, 2.0) }); return; }
    node(putB, 276, 'kim,30 → 회원A', { w: 140, stroke: k === 5 ? BAD : X ? INK : ACC });
    if (k === 5) node(probeB, 276, 'kim,30', { w: 92, stroke: BAD, s: pop(u, 0.9) });
    // 조회 키 probe
    const pS = k === 1 ? pop(u, 0.2) : 1;
    if (k < 5) keyCard(140, 'probe', '@5e6f (예시)', { s: pS, stroke: k === 3 ? GOOD : k === 4 ? BAD : INK });
    if (k === 1) { mono(300, 64, 'map.get(probe)', { 'font-size': 15, fill: INK, 'font-weight': 700, opacity: fade(u, 0.8) });
      sub(352, 92, '값은 같고 주소는 다른 새 객체', fade(u, 1.2), { 'font-size': 14.5, fill: MUT, 'text-anchor': 'start' }); return; }
    if (k === 2) { const s1_ = pop(u, 0.3), s2_ = pop(u, 1.3);
      pill(330, 70, '① hashCode → 버킷 번호', INFO, s1_, { fs: 14.5, fill: PANEL });
      pill(330, 112, '② 그 버킷 안에서만 equals', ACC, s2_, { fs: 14.5, fill: PANEL });
      dot([[140, 108], [140, 150], [bx(2), 150], [bx(2), TY]], seg(u, 0.5, 1.3), INFO, 7);
      el('rect', { x: bx(2) - 76, y: 256, width: 152, height: 40, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '5 4', opacity: fade(u, 1.6) });
      sub(560, 360, '①에서 다른 칸으로 가면 ②의 equals 는 아예 실행되지 않는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3) { mono(300, 64, 'hashCode() = 3,292,912', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 });
      mono(300, 88, '→ 버킷 2 (put 과 같은 칸)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.4) });
      dot([[140, 108], [140, 150], [bx(2), 150], [bx(2), TY]], seg(u, 0.4, 1.2), GOOD, 7);
      if (u > 1.3) { check(bx(2) + 86, 276, 10, pop(u, 1.3)); mono(bx(2) + 104, 282, 'equals → true', { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
      pill(560, 360, 'get(probe) = "회원A"', GOOD, pop(u, 1.9), { mono: true, fs: 15, fill: PANEL }); return; }
    if (k === 4) { mono(300, 64, 'hashCode() = 예: 1956725890', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
      mono(300, 88, '→ 버킷 13 (put 은 7)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.4) });
      dot([[140, 108], [140, 150], [bx(13), 150], [bx(13), TY]], seg(u, 0.4, 1.4), BAD, 7);
      if (u > 1.5) sub(bx(13), 270, '빈 칸', fade(u, 1.5), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
      pill(560, 360, 'get(probe) = null', BAD, pop(u, 2.0), { mono: true, fs: 15, fill: PANEL }); return; }
    // k === 5 : HashSet 중복
    mono(300, 64, 'set.add(kim,30) × 2', { 'font-size': 15, fill: INK, 'font-weight': 700 });
    mono(300, 88, '정체성 해시가 달라 다른 칸', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) });
    pill(560, 360, 'set.size() = 2  (원한 값 1)', BAD, pop(u, 1.6), { mono: true, fs: 15, fill: PANEL }); }

  // =========================================================
  // 4. 올바른 구현 — 같은 필드가 equals 와 Objects.hash 로
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    const dim = k === 5 ? 0.12 : 1;
    // User 객체와 기준 필드
    const g = R.G(0, 0, 1, dim);
    el('rect', { x: 40, y: 120, width: 210, height: 170, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
    el('path', { d: 'M40,152 H250', stroke: INK, 'stroke-width': 1.5 }, g);
    tx(145, 142, 'final class User', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }, g);
    const fS = k === 0 ? pop(u, 0.3) : 1, fS2 = k === 0 ? pop(u, 0.7) : 1;
    [['name', 190, fS], ['age', 246, fS2]].forEach(([n, y, s]) => {
      card(125, y, 140, 38, { rx: 19, text: n, fs: 15, mono: true, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s, p: g });
      if (k >= 1 && k < 5) lock(222, y + 2, true, INK, 0.75 * (k === 1 ? pop(u, 0.4 + (y > 200 ? 0.4 : 0)) : 1));
    });
    if (k < 2) { const zs = k === 0 ? fade(u, 1.0) : 1;
      zone(330, 66, 600, 120, 'equals(Object o) 가 비교할 필드', { op: zs, fill: 'none', stroke: INFO, dash: '6 5', color: INFO });
      zone(330, 236, 600, 120, 'hashCode() 가 섞을 필드', { op: zs, fill: 'none', stroke: ACC, dash: '6 5', color: ACC });
      const gu = k === 0 ? seg(u, 1.4, 2.4) : 1;
      grow(196, 190, 520, 130, gu, INFO); grow(196, 246, 520, 296, gu, ACC);
      tx(630, 136, 'name, age', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO, opacity: gu >= 1 ? 1 : 0 });
      tx(630, 306, 'name, age', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC, opacity: gu >= 1 ? 1 : 0 }); }
    if (k === 0) tx(145, 320, '무엇으로 같다고 볼지 먼저 정한다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
    if (k === 1) tx(145, 320, 'final · 넣은 뒤 바뀌지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INK, 'font-weight': 700, opacity: fade(u, 1.2) });
    // record 한 줄 (나머지는 감춘다)
    if (k === 5) { card(480, 150, 520, 56, { rx: 10, text: 'record UserRecord(String name, int age) {}', fs: 16, mono: true, fw: 800, stroke: GOOD, sw: 2.8, fill: GOODBG, s: pop(u, 0.2) });
      ['equals', 'hashCode', 'toString', '생성자·접근자'].forEach((s, i) => { const x = 210 + i * 180;
        grow(480, 180, x, 254, seg(u, 0.7 + i * 0.25, 1.1 + i * 0.25), GOOD, { plain: true });
        pill(x, 270, s, GOOD, pop(u, 1.0 + i * 0.25), { mono: i < 3, fs: 14.5, fill: PANEL }); });
      tx(480, 340, '컴파일러가 모든 필드로 함께 만든다 · 필드를 빠뜨릴 수 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.1) }); return; }
    // equals 관문: this == o → getClass → 필드 비교
    if (k >= 2) { const gs = (i) => (k === 2 ? pop(u, 0.2 + i * 0.5) : 1);
      tx(320, 62, 'equals(Object o)', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: dim });
      [['this == o ?', 400], ['getClass 같나?', 590], ['필드 비교', 790]].forEach(([s, x], i) => card(x, 106, i === 2 ? 210 : 160, 46, { rx: 8, text: s, fs: 14.5, mono: i < 2, stroke: i === 2 && k >= 3 ? GOOD : INFO, sw: 2.2, s: gs(i), op: dim }));
      if (gs(1) > 0.9) { grow(480, 106, 508, 106, 1, MUT); }
      if (gs(2) > 0.9) { grow(670, 106, 684, 106, 1, MUT); }
      if (k === 2) { tx(400, 152, '예 → true', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) });
        tx(590, 152, '아니오 → false', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
        dot([[330, 106], [790, 106]], seg(u, 1.6, 2.6), INFO, 6); }
      if (k >= 3) { const s3_ = k === 3 ? u : 3;
        dot([[200, 190], [300, 160], [700, 130]], k === 3 ? seg(u, 0.2, 1.0) : 0, ACC, 6);
        dot([[200, 246], [300, 170], [700, 140]], k === 3 ? seg(u, 0.6, 1.4) : 0, ACC, 6);
        mono(690, 160, 'age == u.age', { 'font-size': 14, fill: INK, opacity: dim * fade(s3_, 1.0) });
        mono(690, 182, 'Objects.equals(name, u.name)', { 'font-size': 14, fill: INK, opacity: dim * fade(s3_, 1.4) });
        if (k === 3) sub(790, 210, 'name 이 null 이어도 NPE 없이 비교', fade(u, 1.9), { 'font-size': 14, fill: MUT }); } }
    // hashCode: 같은 필드를 Objects.hash 로
    if (k >= 4) { const hs = k === 4 ? pop(u, 0.2) : 1;
      tx(320, 252, 'hashCode()', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: dim });
      card(560, 300, 300, 50, { rx: 9, text: 'Objects.hash(name, age)', fs: 15, mono: true, stroke: ACC, sw: 2.4, s: hs, op: dim });
      if (k === 4) { dot([[200, 190], [320, 290], [410, 300]], seg(u, 0.5, 1.2), ACC, 6); dot([[200, 246], [320, 310], [410, 300]], seg(u, 0.8, 1.5), ACC, 6); }
      const v = k === 4 ? seg(u, 1.5, 2.4) : 1;
      grow(710, 300, 760, 300, v, ACC, { op: dim });
      mono(770, 306, fmt(H30 * v), { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: dim * (v > 0 ? 1 : 0) });
      if (k === 4) mono(560, 350, '31·(31·1 + 106191) + 30', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      if (k === 4) tx(560, 392, 'equals 가 본 필드 = hash 에 넣은 필드', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); }
  }

  // =========================================================
  // 5. 실무 실패 3종
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) {
      const hot = {}; if (k === 0) { hot[7] = 'bad'; hot[13] = 'bad'; } else { hot[2] = k === 2 ? 'bad' : 'acc'; if (k === 2) hot[3] = 'bad'; }
      table(70, { title: k === 0 ? '① hashCode 누락 · HashSet 버킷 (번호는 예시)' : '② 가변 필드 · HashSet 버킷', hot });
      if (k === 0) { node(7, 150, 'kim,30', { stroke: BAD, s: pop(u, 0.3) }); node(13, 150, 'kim,30', { stroke: BAD, s: pop(u, 0.9) });
        pill(480, 250, 'set.size() = 2  (원한 값 1)', BAD, pop(u, 1.5), { mono: true, fs: 16, fill: PANEL });
        tx(480, 310, '예외도 경고도 없이 중복이 쌓인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.0) }); return; }
      const age = k === 2 ? Math.round(tween(30, 31, u - 0.2, 0.6)) : 30, h = age === 31 ? H31 : H30;
      obj(160, 300, 'User u (가변)', ['name = "kim"', ['age  = ' + age, k === 2 ? BAD : INK]], { w: 190, s: k === 1 ? pop(u, 0.2) : 1 });
      mono(290, 296, 'hashCode() = ' + fmt(h), { 'font-size': 15, fill: k === 2 ? BAD : ACC, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.7) : 1 });
      mono(290, 322, '→ 버킷 ' + (h === H31 ? 3 : 2), { 'font-size': 15, fill: k === 2 ? BAD : ACC, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.9) : 1 });
      if (k === 1) { dot([[160, 250], [160, 120], [bx(2), 120], [bx(2), 108]], seg(u, 1.0, 1.8), ACC, 7); node(2, 150, 's 안의 u', { s: pop(u, 1.8), w: 100 }); return; }
      node(2, 150, '유령 u', { stroke: BAD, w: 100, dash: '5 4', color: BAD });
      pill(330, 230, 'u.setAge(31)', WARN, pop(u, 0.2), { mono: true, fs: 14.5, fill: PANEL });
      dot([[160, 250], [190, 120], [bx(3), 120], [bx(3), 108]], seg(u, 1.0, 1.8), BAD, 7);
      if (u > 1.8) sub(bx(3) + 20, 190, '빈 칸', 1, { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
      pill(700, 300, 's.contains(u) = false', BAD, pop(u, 2.0), { mono: true, fs: 15, fill: PANEL }); return; }
    if (k === 3) { tx(480, 46, '③ instanceof 로 느슨하게 비교하면', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INK });
      obj(250, 200, 'Point a', ['x = 1', 'y = 2'], { w: 190, s: pop(u, 0.2) });
      obj(710, 200, 'ColorPoint b', ['x = 1', 'y = 2', 'color = RED'], { w: 210, s: pop(u, 0.5) });
      const p1 = seg(u, 0.8, 1.5), p2 = seg(u, 1.5, 2.2);
      grow(350, 160, 600, 160, p1, GOOD, { sw: 2.6 }); if (p1 >= 1) mono(475, 148, 'a.equals(b) = true', { 'font-size': 14.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 });
      grow(600, 240, 350, 240, p2, BAD, { sw: 2.6 }); if (p2 >= 1) mono(475, 266, 'b.equals(a) = false', { 'font-size': 14.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
      tx(480, 350, '방향에 따라 답이 다르면 컬렉션이 어느 쪽을 쓸지 몰라 뒤엉킨다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
    // k === 4: 예방
    tx(480, 46, 'record User2(String name, int age) {}', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: GOOD, opacity: fade(u, 0.1) });
    [['hashCode 누락', 'equals 와 함께 자동 생성'], ['가변 필드로 hash', '필드가 final · 바뀌지 않는다'], ['대칭성 붕괴', 'record 는 상속할 수 없다 (final)']].forEach(([a, b], i) => {
      const y = 120 + i * 84, s = pop(u, 0.4 + i * 0.4), turn = u > 1.0 + i * 0.4;
      card(480, y, 640, 64, { rx: 10, stroke: turn ? GOOD : BAD, sw: 2.2, s });
      if (s < 0.6) return; (turn ? check : cross)(200, y, 11, 1);
      tx(232, y + 6, a, { 'font-size': 16, 'font-weight': 700, fill: turn ? MUT : BAD, 'text-decoration': turn ? 'line-through' : null });
      tx(440, y + 6, b, { 'font-size': 15, fill: turn ? GOOD : MUT, 'font-weight': 700, opacity: turn ? 1 : 0.4 }); });
    tx(480, 390, '세 사고 모두 컴파일·테스트를 통과하다 운영에서 조용히 터진다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'equals를 재정의하지 않은 Point(1,2) 두 개를 p1.equals(p2)로 비교하면 결과는 무엇인가?',
      o: ['true, 좌표가 같으니까', 'false, 기본 equals는 this == obj라서', '컴파일 오류가 난다'], a: 1,
      why: 'Object에서 물려받은 equals의 본문은 this == obj다. new를 두 번 했으니 참조가 달라 false다.' },
    { q: 'equals와 hashCode 계약에서 반드시 지켜야 하는 방향은 무엇인가?',
      o: ['hashCode가 같으면 equals도 true여야 한다', 'equals가 true면 hashCode도 같아야 한다', '두 방향 모두 반드시 성립해야 한다'], a: 1,
      why: '정방향만 필수다. "Aa"와 "BB"처럼 hashCode가 2112로 같아도 equals는 false일 수 있다(해시 충돌 허용).' },
    { q: 'equals만 재정의한 User로 map.get(probe)를 하면 null이 나오는 까닭은 무엇인가?',
      o: ['probe의 정체성 해시가 달라 엉뚱한 버킷을 뒤지기 때문', 'equals가 false를 돌려주기 때문', 'HashMap이 키를 복사해 두기 때문'], a: 0,
      why: 'HashMap은 hashCode로 버킷을 먼저 고른다. 다른 칸으로 가면 그 안에 후보가 없어 equals는 실행조차 되지 않는다.' },
    { q: 'Objects.hash에 넘길 필드로 맞는 것은 무엇인가?',
      o: ['equals에서 비교한 것과 똑같은 필드', 'equals에서 쓰지 않은 나머지 필드', '아무 필드 하나면 충분하다'], a: 0,
      why: 'equals가 같다고 본 두 객체는 hashCode도 같아야 하므로 같은 필드 집합을 써야 한다. User라면 name, age 두 개다.' },
    { q: 'HashSet에 넣은 u의 age를 30에서 31로 바꾸면 s.contains(u)는 어떻게 되는가?',
      o: ['true, 같은 객체이니까', 'false, 새 hashCode가 다른 버킷을 가리켜서', 'ConcurrentModificationException이 난다'], a: 1,
      why: 'u는 3,292,912로 정한 버킷 2에 그대로 있는데, 새 hashCode 3,292,913은 버킷 3을 가리킨다. 그래서 자기 자신도 못 찾는다.' },
  ];
  const summary = [
    '재정의하지 않은 equals는 참조만 비교해서 값이 같은 두 객체도 false가 된다.',
    'equals가 true인 두 객체는 hashCode도 같아야 하고, 그 반대는 지키지 않아도 된다.',
    'HashMap은 hashCode로 버킷을 고른 다음 그 칸 안에서만 equals로 확인한다.',
    '해시 키는 불변으로 두고 equals와 Objects.hash에 같은 필드를 쓰거나 record를 쓴다.',
  ];
  const review = [
    { q: 'HashSet<User>에 같은 회원이 두 번 들어가 집계가 틀렸다. 먼저 확인할 것은 무엇인가?',
      o: ['User가 hashCode도 같은 필드로 재정의했는지', 'HashSet의 초기 크기가 충분한지', 'User 생성자가 public인지'], a: 0,
      why: 'equals만 고치면 두 객체가 서로 다른 버킷에 들어가 size()가 2가 된다. hashCode를 equals와 같은 필드로 맞추면 1이 된다.' },
    { q: 'Map<User, String>에 넣은 뒤 user.setName()을 불렀더니 map.get(user)가 null이다. 가장 알맞은 고침은 무엇인가?',
      o: ['get을 두 번 불러 본다', 'User를 불변(record 또는 final 필드)으로 바꾼다', 'equals에서 name 비교를 뺀다'], a: 1,
      why: '해시에 쓰인 필드가 바뀌면 새 hashCode가 다른 칸을 가리킨다. 키가 바뀌지 않게 만드는 것이 근본 해결이다.' },
    { q: '두 String의 hashCode가 2112로 같았다. 이때 맞는 말은 무엇인가?',
      o: ['계약 위반이라 둘 중 하나를 고쳐야 한다', 'equals도 반드시 true다', '충돌일 수 있고, HashMap은 equals로 다시 가른다'], a: 2,
      why: '"Aa"와 "BB"가 그 예다. 같은 칸에 모여도 버킷 안에서 equals가 최종 판정을 하므로 문제가 없다.' },
  ];

  R.page({ title: '참조 · 버킷 · 계약', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
