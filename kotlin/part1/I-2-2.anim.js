/* I-2-2 data class — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그리는 것: Java 클래스 한 장이 칸마다 채워지는 모습, data 한 단어에서 펼쳐지는 생성 멤버,
 * 힙의 두 객체와 == / === 비교, hashCode 로 HashSet 칸을 찾는 모습, copy 로 생기는 새 객체 칸.
 * 해시값(Money(1000,"KRW") = 105704 → 16칸 중 9번, Money(2000,"KRW") = 136704 → 2번,
 * User(1,"Hoyoung","h@d.co") = -1323184226)은 JVM 의 String.hashCode 와 data class 생성 규칙(result*31 + 필드)으로 계산한 값이다.
 * 실행해 본 값이 아니다. 객체 주소 #1·#2, 4단계의 잔액 1,000, 5단계의 주문 상태, Java 버그 장면의 identity 해시는 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, G, cells, terminal, bump } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 객체 칸: 머리(이름) + 필드 줄 [이름, 값, 색?]
  function obj(cx, cy, w, title, rows, o) { o = o || {}; const rh = 34, h = 40 + rows.length * rh, x = cx - w / 2, y = cy - h / 2, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, opacity: op, 'stroke-dasharray': o.dash });
    el('rect', { x, y, width: w, height: 32, rx: 10, fill: o.head || SOFT, opacity: op }); el('line', { x1: x, y1: y + 32, x2: x + w, y2: y + 32, stroke: o.stroke || INK, 'stroke-width': 1.5, opacity: op });
    mono(cx, y + 22, title, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.titleCol || INK, opacity: op });
    rows.forEach(([n, v, col], i) => { const yy = y + 36 + i * rh + rh / 2 + 5, rop = op * (o.rowOp ? o.rowOp(i) : 1);
      if (o.hiRow === i) el('rect', { x: x + 4, y: yy - 21, width: w - 8, height: rh - 4, rx: 6, fill: ACCBG, opacity: rop });
      mono(x + 14, yy, n, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: rop });
      if (v != null) mono(x + w - 14, yy, v, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: col || INK, opacity: rop }); });
    return { x, y, w, h, ry: (i) => y + 36 + i * rh + rh / 2 }; }

  // =========================================================
  // 1. Java POJO — 같은 정보를 여섯 번
  // =========================================================
  const SEC = [['필드', 3], ['생성자', 1], ['getter', 3], ['equals', 20], ['hashCode', 10], ['toString', 10]];
  const SY = (() => { const ys = []; let y = 40; SEC.forEach(([, n]) => { ys.push(y); y += Math.max(26, n * 5.4) + 8; }); return ys; })();
  function pojo(nFill, u, a0, o) { o = o || {};
    el('rect', { x: 60, y: 28, width: 380, height: 352, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    SEC.forEach(([n, lines], i) => { const y = SY[i], h = Math.max(26, lines * 5.4), on = i < nFill, fresh = on && i >= (o.from ?? 0), p = fresh ? E(u, a0 + (i - (o.from ?? 0)) * 0.3, a0 + (i - (o.from ?? 0)) * 0.3 + 0.4) : on ? 1 : 0;
      el('rect', { x: 76, y, width: 348, height: h, rx: 5, fill: 'none', stroke: on ? 'none' : GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' });
      if (p > 0) el('rect', { x: 76, y, width: 348 * p, height: h, rx: 5, fill: o.mark && o.mark(i) ? o.mark(i) : i >= 3 ? WARNBG : SOFT });
      tx(90, y + Math.min(h, 26) / 2 + 6, n, { 'font-size': 14, 'font-weight': 700, fill: on ? INK : OFF });
      mono(410, y + Math.min(h, 26) / 2 + 6, lines + '줄', { 'font-size': 14, 'text-anchor': 'end', fill: on ? MUT : OFF }); }); }
  function counters(nm, ln, u, o) { o = o || {};
    card(740, 110, 300, 80, { rx: 12, stroke: WARN, fill: WARNBG });
    tx(610, 104, '"name"을 적은 횟수', { 'font-size': 15, 'font-weight': 700 }); mono(860, 120, nm + '번', { 'font-size': 30, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
    card(740, 220, 300, 80, { rx: 12, stroke: INK });
    tx(610, 214, '클래스 길이', { 'font-size': 15, 'font-weight': 700 }); mono(860, 230, '약 ' + ln + '줄', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'end' }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { pojo(1, u, 0.3); counters(1, 3, u); sub(740, 320, '여기까지는 Kotlin과 비슷하다', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { pojo(3, u, 0.3, { from: 1 }); counters(Math.round(lerp(1, 3, E(u, 0.4, 1.2))), Math.round(lerp(3, 7, E(u, 0.4, 1.2))), u);
      sub(740, 320, '필드 · 생성자 · getter', fade(u, 1.5), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 2) { pojo(6, u, 0.3, { from: 3 }); counters(Math.round(lerp(3, 6, E(u, 0.4, 1.5))), Math.round(lerp(7, 47, E(u, 0.4, 1.5))), u);
      sub(740, 320, '세 메서드가 같은 필드를 또 나열한다', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    // k3: 필드 하나 추가 → 6곳
    pojo(6, u, 0, { mark: (i) => (u > 0.6 + i * 0.2 ? (i === 4 && u > 1.8 ? BADBG : GOODBG) : null) });
    pill(560, 46, '+ val phone', ACC, pop(u, 0.2), { mono: true, fs: 15 });
    SEC.forEach(([, n], i) => { const y = SY[i] + Math.min(Math.max(26, n * 5.4), 26) / 2, a = 0.6 + i * 0.2; grow(560, 66, 448, y, E(u, a, a + 0.3), i === 4 ? BAD : ACC, { sw: 1.8 });
      if (u > a + 0.3) { if (i === 4 && u > 1.8) cross(470 + 0, y, 7, pop(u, 1.8)); } });
    card(760, 210, 300, 90, { rx: 12, text: 'hashCode만 깜빡하면\nHashSet · Map 오동작', fs: 16, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.0) });
    sub(760, 300, '6곳을 손으로 맞춰야 한다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 2. data class — 한 단어로 생성되는 것
  // =========================================================
  const U = [['id', '1'], ['name', '"Hoyoung"'], ['email', '"h@d.co"']];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { spans(70, 70, [['data ', { fill: ACC, 'font-weight': 800 }], ['class User(val id: Long, val name: String, val email: String)', { 'font-weight': 700 }]], { 'font-size': 15.5, opacity: fade(u, 0.1) });
      el('rect', { x: 64, y: 50, width: 46, height: 28, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.5) });
      const M = [['equals()', '값 비교'], ['hashCode()', 'equals와 짝'], ['toString()', '읽기 좋은 출력'], ['copy()', '일부만 바꾼 새 객체'], ['component1~3()', '분해 선언']];
      M.forEach(([m, d], i) => { const x = 110 + i * 185, a = 0.7 + i * 0.25;
        grow(87, 80, x, 196, E(u, a, a + 0.4), ACC, { sw: 1.8 });
        card(x, 220, 170, 50, { rx: 10, text: m, mono: true, fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, a + 0.3) });
        tx(x, 270, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a + 0.4) }); });
      sub(480, 340, 'val 매개변수가 곧 프로퍼티와 getter · 나머지는 컴파일러가 만든다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { obj(200, 170, 260, 'val u: User', U);
      grow(340, 170, 430, 170, E(u, 0.4, 0.8), MUT); pill(380, 136, 'println(u)', INK, pop(u, 0.3), { mono: true, fs: 14 });
      terminal(440, 110, 490, 120, [['User(id=1, name=Hoyoung, email=h@d.co)', 'var(--term)']], clamp((u - 0.8) / 0.9) * 1, { title: 'console', fs: 14.5 });
      sub(680, 280, '클래스 이름 + 프로퍼티 이름=값', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { obj(220, 170, 260, 'u  (객체 #1)', U); obj(740, 170, 260, 'u2 (객체 #2)', U, { op: fade(u, 0.2) });
      U.forEach((_, i) => { const y = 170 - 51 + 36 + i * 34 + 17, a = 0.6 + i * 0.35; el('line', { x1: 350, y1: y, x2: lerp(350, 610, E(u, a, a + 0.3)), y2: y, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); if (u > a + 0.3) check(480, y, 8, pop(u, a + 0.3)); });
      card(480, 330, 300, 56, { rx: 12, text: 'u == u2  →  true', mono: true, fs: 18, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.9) });
      sub(480, 395, '참조가 달라도 내용이 같으면 같다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { [['u', 140], ['u2', 330]].forEach(([n, y], i) => { const a = 0.2 + i * 0.5;
        pill(110, y - 70, n, INK, pop(u, a), { mono: true, fs: 15 }); });
      mono(160, 36, 'hashCode()', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.1) });
      [['u', 70], ['u2', 260]].forEach(([n, y], i) => { const a = 0.3 + i * 0.5; mono(160, y + 6, '-1323184226', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, a + 0.2) }); });
      const X0 = 420; for (let b = 0; b < 16; b++) el('rect', { x: X0 + b * 32, y: 150, width: 28, height: 60, rx: 4, fill: b === 15 && u > 1.0 ? ACCBG : PANEL, stroke: b === 15 && u > 1.0 ? ACC : GRID, 'stroke-width': 1.5, opacity: fade(u, 0.2) });
      mono(X0 + 15 * 32 + 14, 232, '15', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) }); mono(X0, 232, '0', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) });
      tx(X0, 136, 'HashSet 칸 16개', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.2) });
      dot([[290, 64], [X0 + 15 * 32 + 14, 160]], seg(u, 0.5, 1.0), ACC, 8); dot([[290, 254], [X0 + 15 * 32 + 14, 200]], seg(u, 1.0, 1.5), ACC, 8);
      if (u > 1.6) check(X0 + 15 * 32 + 14, 266, 9, pop(u, 1.6));
      card(640, 330, 380, 56, { rx: 12, text: 'setOf(u, u2).size  →  1', mono: true, fs: 17, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.9) });
      sub(200, 380, '같은 해시 → 같은 칸 → equals로 중복 확인', fade(u, 2.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); return; }
    // k4: 분해 선언
    const g = obj(220, 190, 260, 'val u: User', U);
    mono(560, 70, 'val (id, name, _) = u', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
    [['id', '1', 0, 'component1()'], ['name', '"Hoyoung"', 1, 'component2()']].forEach(([n, v, i], j) => { const a = 0.5 + j * 0.5, y = g.ry(i);
      fly(330, y, 650, 150 + j * 80, seg(u, a, a + 0.6), v, { mono: true, stay: true });
      mono(560, 156 + j * 80, n + ' =', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, a + 0.5) });
      mono(820, 156 + j * 80, n === 'id' ? 'component1()' : 'component2()', { 'font-size': 14, fill: MUT, opacity: fade(u, a + 0.6) }); });
    mono(560, 316, '_', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'end', fill: OFF, opacity: fade(u, 1.6) });
    sub(700, 316, 'email은 받지 않는다', fade(u, 1.7), { 'font-size': 15, fill: MUT, 'font-weight': 700 }); }

  // =========================================================
  // 3. == 와 === · hashCode 일관성
  // =========================================================
  const MON = { m1: ['1_000', '"KRW"'], m2: ['1_000', '"KRW"'], m3: ['2_000', '"KRW"'] };
  const HX = { m1: 170, m2: 480, m3: 790 };
  function heap(o) { o = o || {}; ['m1', 'm2', 'm3'].forEach((n, i) => { const x = HX[n], s = o.sh ? o.sh(i) : 1; if (s <= 0) return;
      mono(x, 56, 'val ' + n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s });
      el('line', { x1: x, y1: 64, x2: x, y2: 64 + 40 * s, stroke: MUT, 'stroke-width': 2, 'marker-end': s >= 1 ? 'url(#ra-ah)' : null });
      obj(x, 166, 220, '객체 #' + (i + 1), [['amount', MON[n][0]], ['currency', MON[n][1]]], { op: s, stroke: n === 'm3' ? WARN : INK }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { heap({ sh: (i) => fade(u, 0.3 + i * 0.5, 0.4) });
      sub(325, 270, 'm1과 m2는 값이 같고 객체는 따로다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 360, '#1 · #2 · #3은 서로 다른 객체라는 표시 (예시)', fade(u, 2.2), { 'font-size': 13.5, fill: MUT }); return; }
    if (k === 1) { heap({ sh: () => 1 });
      const L = [['m1 == m2', 'true', '값 비교 (equals)', GOOD], ['m1 === m2', 'false', '같은 객체인가', BAD], ['m1 == m3', 'false', '값이 다르다', BAD]];
      L.forEach(([e, r, why, col], i) => { const y = 290 + i * 40, a = 0.4 + i * 0.6;
        mono(80, y, e, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, a) }); mono(300, y, r, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, a + 0.2) });
        tx(400, y, why, { 'font-size': 15, fill: MUT, opacity: fade(u, a + 0.2) }); });
      if (u > 0.4 && u < 1.0) { [0, 1].forEach((r) => el('rect', { x: HX.m1 - 100, y: 160 + r * 34 - 16, width: 410, height: 28, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 2 })); }
      if (u > 1.0 && u < 1.6) el('path', { d: `M${HX.m1},96 Q325,130 ${HX.m2},96`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); return; }
    const X0 = 200, buck = (b) => X0 + b * 36 + 16;
    for (let b = 0; b < 16; b++) { el('rect', { x: X0 + b * 36, y: 250, width: 32, height: 64, rx: 4, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); if (b % 3 === 0 || b === 9 || b === 15) mono(buck(b), 334, String(b), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    tx(X0, 238, 'hashSetOf(m1)의 칸 16개', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    el('rect', { x: X0 + 9 * 36 + 3, y: 262, width: 26, height: 40, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); mono(buck(9), 287, 'm1', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC });
    if (k === 2) { mono(110, 60, 'm1.hashCode()', { 'font-size': 15, 'font-weight': 700 }); mono(370, 60, '105704  → 9번 칸', { 'font-size': 16, 'font-weight': 800, fill: INFO });
      mono(110, 130, 'm2.hashCode()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) }); mono(370, 130, '105704  → 9번 칸', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.7) });
      dot([[300, 140], [buck(9), 250]], seg(u, 0.9, 1.5), ACC, 8);
      if (u > 1.5) check(buck(9) + 30, 230, 9, pop(u, 1.5));
      card(780, 120, 260, 54, { rx: 12, text: 'm2 in pool  →  true', mono: true, fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.8) });
      sub(480, 390, '같은 값 → 같은 해시 → 같은 칸에서 equals로 찾는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3: equals 만 고치고 hashCode 는 그대로인 Java 클래스
    tx(110, 50, 'Java: equals만 override, hashCode는 객체마다 다른 값 (예시)', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.1) });
    mono(110, 100, 'm2.hashCode()', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(370, 100, '다른 값 → 3번 칸', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
    dot([[300, 110], [buck(3), 250]], seg(u, 0.8, 1.4), BAD, 8);
    if (u > 1.4) cross(buck(3) + 30, 205, 9, pop(u, 1.4));
    card(780, 150, 280, 54, { rx: 12, text: 'm2 in pool  →  false', mono: true, fs: 16, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.7) });
    sub(480, 390, 'data class는 equals와 hashCode를 같은 필드로 함께 만든다', fade(u, 2.2), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }

  // =========================================================
  // 4. copy — 원본은 그대로, 바뀐 칸만 새로
  // =========================================================
  const UC = [['id', '1'], ['name', '"Hoyoung"'], ['email', '"h@d.co"'], ['role', '"USER"']];
  const with_ = (i, v) => UC.map((r, j) => (j === i ? [r[0], v, ACC] : r));
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { obj(300, 200, 300, 'val u: User', UC, { rowOp: (i) => fade(u, 0.2 + i * 0.25) });
      sub(560, 268, 'role은 기본값 "USER"', fade(u, 1.3), { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'start' });
      card(740, 150, 300, 70, { rx: 12, text: '모든 프로퍼티가 val\n바꾸지 않고 새로 만든다', fs: 15, stroke: GOOD, color: INK, s: pop(u, 1.8) }); return; }
    if (k === 1 || k === 2) { const src = obj(160, 200, 250, 'val u', UC);
      const A = [['renamed', 1, '"Hoyoung Park"', 120], ['admin', 3, '"ADMIN"', 300]];
      A.forEach(([n, fi, v, cy], j) => { const a = k === 1 ? 0.4 + j * 0.9 : 0, show = k === 1 ? fade(u, a, 0.3) : 1; if (show <= 0) return;
        const g = obj(690, cy, 290, 'val ' + n, with_(fi, v), { op: show, hiRow: fi });
        if (k === 1) { [0, 1, 2, 3].forEach((r) => { if (r !== fi) el('line', { x1: 286, y1: src.ry(r), x2: lerp(286, 544, E(u, a + 0.2, a + 0.6)), y2: g.ry(r), stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }); });
          pill(420, cy - 72 + 30, `copy(${UC[fi][0]} = ${v})`, ACC, pop(u, a), { mono: true, fs: 13.5 }); } });
      if (k === 2) { terminal(100, 300, 330, 100, [['> Hoyoung        (u.name)', 'var(--term)'], ['> Hoyoung Park   (renamed.name)', 'var(--term)']], clamp((u - 0.3) / 0.6, 0, 2), { title: 'console', fs: 13.5, lh: 22 });
        el('rect', { x: 37, y: src.ry(1) - 15, width: 246, height: 30, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.6) });
        sub(160, 90, 'u는 그대로', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }
      return; }
    if (k === 3) { const V = [1000, 1100, 1200];
      V.forEach((v, i) => { const x = 160 + i * 320, a = i * 0.8; if (i && u < a) return;
        obj(x, 180, 220, 'Account', [['balance', v.toLocaleString('en-US'), i ? ACC : INK]], { op: i ? fade(u, a, 0.3) : 1 }); });
      [0, 1].forEach((i) => { const a = 0.3 + i * 0.8; grow(270 + i * 320, 180, 370 + i * 320, 180, E(u, a, a + 0.4), ACC); mono(320 + i * 320, 150, 'deposit(+100)', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, a) }); });
      mono(480, 290, 'account.copy(balance = account.balance + amount)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(480, 340, '이전 상태 → 다음 상태가 한 줄 · 1,000에서 시작한 값은 예시', fade(u, 2.2), { 'font-size': 14, fill: MUT, 'font-weight': 700 }); return; }
    // k4: JS spread 오타 vs copy 오타
    zone(30, 40, 430, 330, 'JavaScript spread', { stroke: WARN, sw: 2, color: WARN, fill: WARNBG });
    zone(500, 40, 430, 330, 'Kotlin copy', { stroke: GOOD, sw: 2, color: GOOD, fill: GOODBG });
    mono(60, 100, '{ ...state, nmae: "B" }', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
    obj(245, 230, 300, '결과 객체', [['name', '"Hoyoung"'], ['nmae', '"B"', WARN]], { op: fade(u, 0.6, 0.3) });
    sub(245, 330, '오타가 새 키로 조용히 들어간다', fade(u, 1.0), { 'font-size': 15, fill: WARN, 'font-weight': 700 });
    mono(530, 100, 'u.copy(nmae = "B")', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.3) });
    stamp(715, 200, u);
    sub(715, 330, '빌드에서 바로 걸린다', fade(u, 2.2), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }
  function stamp(x, y, u) { card(x, y, 380, 70, { rx: 12, text: 'Cannot find a parameter\nwith this name: nmae', mono: true, fs: 14, stroke: BAD, color: BAD, fill: PANEL, s: pop(u, 1.6) }); }

  // =========================================================
  // 5. 실무 — 분해 선언, 그리고 쓰지 말아야 할 곳
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 60, 'for ((k, v) in mapOf(1 to "A", 2 to "B"))', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.1) });
      [['1', '"A"'], ['2', '"B"']].forEach(([a, b], i) => { const y = 140 + i * 100, a0 = 0.3 + i * 0.7;
        card(170, y, 160, 50, { rx: 10, text: a + ' to ' + b, mono: true, fs: 15, stroke: INK, s: pop(u, a0) });
        fly(200, y, 420, y - 20, seg(u, a0 + 0.2, a0 + 0.6), 'k = ' + a, { mono: true, stay: true });
        fly(200, y, 420, y + 20, seg(u, a0 + 0.3, a0 + 0.7), 'v = ' + b, { mono: true, stay: true, fill: INFO }); });
      terminal(560, 110, 330, 150, [['> 1=A', 'var(--term)'], ['> 2=B', 'var(--term)']], clamp((u - 1.0) / 0.6, 0, 2), { title: 'console' });
      sub(480, 360, 'Map.Entry에도 component1 · component2가 있다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { obj(200, 150, 250, 'Pair<Long, Long>', [['first', '0'], ['second', '1']], { op: fade(u, 0.2), stroke: OFF });
      sub(200, 250, 'first가 시작? 끝?', fade(u, 0.6), { 'font-size': 15, fill: MUT, 'font-weight': 700 });
      const g = obj(560, 150, 260, 'TimeRange', [['start', '0'], ['end', '1']], { op: fade(u, 0.9), stroke: ACC, titleCol: ACC });
      mono(560, 300, 'val (s, e) = parseRange("…")', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      fly(690, g.ry(0), 850, 120, seg(u, 1.5, 2.0), 's = 0', { mono: true, stay: true }); fly(690, g.ry(1), 850, 180, seg(u, 1.7, 2.2), 'e = 1', { mono: true, stay: true });
      sub(560, 360, '이름이 남아서 받는 쪽도 읽기 쉽다', fade(u, 2.3), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 2) { [['주문 A', '"결제 전"'], ['주문 B', '"결제 완료"']].forEach(([n, st], i) => { const x = 220 + i * 300;
        obj(x, 150, 240, n, [['id', '7'], ['상태', st, i ? GOOD : WARN]], { op: fade(u, 0.2 + i * 0.3) }); });
      mono(370, 270, 'data class Order(val id: Long)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      el('rect', { x: 106, y: 128, width: 528, height: 30, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.2) });
      card(370, 330, 360, 52, { rx: 12, text: 'A == B  →  true', mono: true, fs: 18, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.6) });
      card(800, 200, 220, 110, { rx: 12, text: 'equals는\n생성자 프로퍼티만\n비교한다', fs: 15, stroke: INK, s: pop(u, 2.0) });
      sub(800, 290, 'id 7 · 상태 값은 예시', fade(u, 2.3), { 'font-size': 13.5, fill: MUT }); return; }
    // k3: 고르는 규칙
    zone(60, 150, 380, 220, 'data class', { stroke: GOOD, sw: 2.5, color: GOOD, fill: GOODBG });
    zone(520, 150, 380, 220, '일반 class', { stroke: INK, sw: 2.5, color: INK, fill: SOFT });
    [['DTO · 값 객체', 250, 210, 0], ['API 응답 모델', 250, 290, 1], ['동작 위주 도메인 객체', 710, 210, 2], ['상속 계층 → sealed와 조합', 710, 290, 3]].forEach(([s, x, y, i]) => { const a = 0.3 + i * 0.45, p = E(u, a, a + 0.5);
      card(x, y, 320, 46, { rx: 23, text: s, fs: 15, stroke: i < 2 ? GOOD : INK, color: i < 2 ? GOOD : INK, fill: PANEL, s: pop(u, a) }); });
    sub(480, 400, '데이터를 담으면 data class · 동작을 담으면 일반 class', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'Java User 클래스에 필드 phone을 추가할 때 hashCode만 고치지 않으면 무슨 일이 생기는가?',
      o: ['컴파일 에러가 난다', 'equals와 hashCode가 어긋나 HashSet · Map이 잘못 동작한다', '아무 문제도 생기지 않는다'], a: 1,
      why: '필드는 생성자, getter, equals, hashCode, toString까지 여섯 곳에 나온다. 한 곳이라도 빠지면 컴파일은 되지만 컬렉션 동작이 어긋난다.' },
    { q: 'data class User(1, "Hoyoung", "h@d.co")를 println하면 무엇이 찍히는가?',
      o: ['User@1b6d3586 같은 주소', '{"id":1,"name":"Hoyoung"}', 'User(id=1, name=Hoyoung, email=h@d.co)'], a: 2,
      why: 'data class의 toString은 클래스 이름과 프로퍼티 이름=값을 차례로 적는다.' },
    { q: '값이 같은 data class 객체 m1, m2에서 m1 === m2는 무엇인가?',
      o: ['false', 'true', '컴파일 에러'], a: 0,
      why: '===는 같은 객체인지를 본다. m1과 m2는 따로 만든 객체라 false이고, 값을 보는 ==는 true다.' },
    { q: 'val renamed = u.copy(name = "Hoyoung Park") 뒤에 u.name은 무엇인가?',
      o: ['"Hoyoung Park"', '"Hoyoung"', 'null'], a: 1,
      why: 'copy는 name만 바꾼 새 객체를 돌려준다. 원본 u는 그대로 "Hoyoung"이다.' },
    { q: 'class Order(val id: Long)에 data를 붙이면 결제 상태가 다른 두 주문(id 같음)은 어떻게 되는가?',
      o: ['상태가 달라 서로 다르다고 본다', '컴파일 에러가 난다', '같은 주문으로 본다'], a: 2,
      why: 'data class의 equals는 생성자 프로퍼티만 비교한다. id만 있으니 상태가 달라도 같다고 판단한다.' },
  ];
  const summary = [
    'Java DTO는 필드를 하나 늘릴 때마다 생성자부터 toString까지 여섯 곳을 고쳐야 한다.',
    'data를 붙이면 비교, 해시, 출력, 복사, 분해에 쓰는 메서드를 컴파일러가 만든다.',
    '==는 값을 비교하고 ===는 같은 객체인지 본다. 같은 값은 같은 해시라 HashSet에서 찾힌다.',
    'copy는 원본을 두고 바뀐 칸만 새로 만든다. 동작이 중심인 객체에는 data를 붙이지 않는다.',
  ];
  const review = [
    { q: 'HashSet<Money>에 넣은 값을 같은 금액의 새 객체로 찾으니 false가 나왔다. Money는 일반 class다. 먼저 의심할 것은 무엇인가?',
      o: ['equals와 hashCode가 값 기준으로 만들어지지 않았다', 'HashSet 크기가 너무 작다', '금액이 Int라서 비교가 안 된다'], a: 0,
      why: '일반 class는 객체마다 다른 hashCode를 쓰므로 값이 같아도 다른 칸을 찾는다. data class로 두면 두 메서드가 같은 필드로 함께 생긴다.' },
    { q: '화면 상태 UiState(val loading: Boolean, val items: List<Item>)에서 loading만 끄고 싶다. 알맞은 코드는 무엇인가?',
      o: ['state.loading = false', 'state.copy(loading = false)', 'UiState(false, emptyList())'], a: 1,
      why: 'val 프로퍼티라 대입은 막힌다. copy는 loading만 바꾸고 items는 그대로 옮긴 새 상태를 만든다.' },
    { q: '사용자를 Set에 모아 중복을 없애려 한다. User는 data class이고 프로퍼티는 id, name, lastLogin이다. 같은 사람이 두 번 들어간 이유는 무엇인가?',
      o: ['data class는 Set에 넣을 수 없다', 'id가 Long이라 해시가 매번 바뀐다', 'lastLogin 값이 달라 equals가 false가 됐다'], a: 2,
      why: 'data class의 equals는 생성자 프로퍼티를 모두 비교한다. 접속 시각처럼 바뀌는 값이 섞이면 같은 사람도 다른 값으로 본다.' },
  ];

  R.page({ title: 'data class가 만드는 칸', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
