/* I-2-2 error · slice · map — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: (결과, error) 두 칸 반환과 감싼 에러 사슬, sentinel 값의 같은 주소, 인터페이스 값 두 칸,
 *       slice 헤더(ptr · len · cap)와 밑배열 공유·append 재할당, map 버킷, defer 스택.
 * len/cap/출력은 slice_sim(gc growslice 흉내)로 확인한 값이다. cap 은 명세가 아니라 gc 구현 값이라 "예시" 로 적는다.
 * map 버킷 위치와 range 순서는 실행마다 달라지므로 "예시" 로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  function nope(x, y, s, sc) { if (sc <= 0) return; const w = tw(s, 14) + 26; card(x, y, w, 30, { rx: 15, text: s, fs: 14, stroke: MUT, color: MUT, s: sc, mono: true });
    el('line', { x1: x - w / 2 + 8, y1: y, x2: x - w / 2 + 8 + (w - 16) * clamp(sc), y2: y, stroke: BAD, 'stroke-width': 2.5 }); }
  // 반환값 두 칸 (결과 | error)
  function ret2(x, y, a, b, o) { o = o || {}; const op = o.op ?? 1, bad = o.bad;
    card(x + 70, y, 140, 38, { rx: 6, text: a, fs: 14, mono: true, stroke: bad ? GRID : GOOD, fill: bad ? PANEL : GOODBG, color: bad ? MUT : INK, op });
    card(x + 146 + 100, y, 200, 38, { rx: 6, text: b, fs: 14, mono: true, stroke: bad ? BAD : GRID, fill: bad ? BADBG : PANEL, color: bad ? BAD : MUT, op }); }
  // 인터페이스 값 두 칸
  function ival(x, y, ty, v, o) { o = o || {}; const w1 = o.w1 || 170, w2 = o.w2 || 90, op = o.op ?? 1, col = o.col || ACC;
    if (o.head) { tx(x + w1 / 2, y - 8, '타입', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); tx(x + w1 + 4 + w2 / 2, y - 8, '값', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
    card(x + w1 / 2, y + 19, w1, 38, { rx: 6, text: ty, fs: 14, mono: true, stroke: col, color: col, op });
    card(x + w1 + 4 + w2 / 2, y + 19, w2, 38, { rx: 6, text: v, fs: 14, mono: true, stroke: GRID, color: INK, op }); }

  // ---------- 1. error 는 값 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(300, 110, 360, 110, { rx: 12, stroke: ACC, s: pop(u, 0.2) }); mono(136, 86, 'type error interface', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      card(300, 130, 200, 34, { rx: 17, text: 'Error() string', fs: 15, mono: true, stroke: ACC, dash: '5 4', color: ACC, s: pop(u, 0.6) });
      note(120, 220, '이 메서드 하나면 어떤 타입이든 error', fade(u, 1.1));
      ['try', 'catch', 'throw'].forEach((s, i) => nope(640 + i * 100, 110, s, pop(u, 1.4 + i * 0.2)));
      note(600, 180, 'Go 에는 문법 자체가 없다', fade(u, 2.0), { fill: MUT, 'font-weight': 500 });
      banner(480, 320, '에러 = 함수가 돌려주는 평범한 값', pop(u, 2.3)); return; }
    if (k === 1) { card(160, 70, 260, 48, { rx: 10, text: 'divide(a, b) (int, error)', fs: 15, mono: true, stroke: INK, s: pop(u, 0.2) });
      tx(440, 60, 'int', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.4) }); tx(626, 60, 'error', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(390, 135, '10, 2', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.6) }); ret2(410, 130, '5', 'nil', { op: fade(u, 0.8) });
      mono(390, 195, '10, 0', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.4) }); ret2(410, 190, '0', '"divide by zero"', { op: fade(u, 1.6), bad: true });
      sub(240, 262, '입력 10, 2 는 예시', fade(u, 1.0), { 'font-size': 13.5 });
      note(410, 280, '실패할 수 있다는 사실이 반환 타입에 보인다', fade(u, 2.2)); return; }
    if (k === 2) { const y = 110; mono(40, 70, 'result, err := divide(10, 0)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      ret2(40, y, '0', '"divide by zero"', { op: fade(u, 0.3), bad: true });
      el('path', { d: `M560,${y - 30} L630,${y} L560,${y + 30} L490,${y} Z`, fill: PANEL, stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 0.8) });
      mono(560, y + 5, 'err != nil', { 'font-size': 13.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      grow(446, y, 488, y, E(u, 0.7, 0.9), MUT);
      grow(630, y, 700, y, E(u, 1.2, 1.5), BAD); mono(664, y - 10, '참', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.3) });
      terminal(704, 76, 236, 70, ['… 실패: divide by zero'], u > 1.5 ? 1 : 0, { title: 'log', fs: 13.5 });
      sub(820, 172, 'log 는 앞에 날짜·시각을 붙인다', fade(u, 1.8), { 'font-size': 13.5 });
      mono(40, 240, 'fmt.Println("결과:", result)', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); el('line', { x1: 36, y1: 235, x2: 36 + 270 * E(u, 2.0, 2.3), y2: 235, stroke: BAD, 'stroke-width': 2.4 });
      note(40, 300, '여기까지 오지 않는다 — return 으로 이미 빠져나갔다', fade(u, 2.3), { fill: MUT, 'font-weight': 500 });
      note(40, 360, 'err 를 안 보면 0 을 정상값으로 착각한다', fade(u, 2.5), { fill: WARN }); return; }
    // k 3: 감싸기
    mono(40, 56, 'fmt.Errorf("user lookup failed: %w", err)', { 'font-size': 15, 'font-weight': 800 });
    const g = E(u, 0.3, 1.0);
    card(260, 170, 440 * (0.6 + 0.4 * g), 120, { rx: 12, stroke: ACC, fill: ACCBG, op: fade(u, 0.2) });
    mono(54, 134, 'user lookup failed: ', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
    card(300, 186, 220, 44, { rx: 8, text: 'not found', fs: 14.5, mono: true, stroke: BAD, fill: PANEL, color: BAD, s: pop(u, 0.2) });
    sub(300, 250, '안쪽 에러 (예시)', fade(u, 0.6), { 'font-size': 13.5 });
    mono(520, 300, 'errors.Unwrap → 안쪽이 그대로 나온다', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.3), 'text-anchor': 'middle' });
    mono(54, 340, 'err.Error() = "user lookup failed: not found"', { 'font-size': 14, opacity: fade(u, 1.6) });
    card(760, 170, 280, 70, { rx: 10, stroke: MUT, dash: '5 4', op: fade(u, 1.9) });
    mono(632, 164, '%v 로 감싸면', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.9) }); mono(632, 190, '글자만 남고 안쪽은 사라진다', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.1) });
    sub(760, 270, 'errors.Is / As 가 안쪽을 못 찾는다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 2. sentinel · struct 에러 ----------
  const OBJ = [[700, 90, 'not found'], [700, 170, 'forbidden']];
  function sentinels(op) { [['ErrNotFound', 90], ['ErrForbidden', 170]].forEach(([n, y], i) => {
    card(150, y, 210, 40, { rx: 8, text: n, fs: 15, mono: true, stroke: INK, op });
    grow(256, y, 606, OBJ[i][1], op, MUT);
    card(OBJ[i][0], OBJ[i][1], 180, 46, { rx: 10, text: `"${OBJ[i][2]}"`, fs: 14.5, mono: true, stroke: BAD, fill: BADBG, color: BAD, op }); });
    tx(610, 56, 'errors.New 로 만든 에러 값', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); }
  function vbox(x, y, vals, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: 270, height: 112, rx: 10, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2.2, opacity: op });
    mono(x + 12, y + 24, 'ValidationError', { 'font-size': 15, 'font-weight': 800, opacity: op, fill: o.col || INK });
    [['Field', vals[0]], ['Msg', vals[1]]].forEach(([f, v], i) => { mono(x + 14, y + 58 + i * 32, f, { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: op });
      if (v) mono(x + 256, y + 58 + i * 32, v, { 'font-size': 14.5, 'text-anchor': 'end', opacity: op }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { sentinels(k === 0 ? fade(u, 0.3) : 1);
      if (k === 0) { note(40, 280, '패키지 변수 하나 = 에러 종류 하나', fade(u, 1.2)); note(40, 310, '이름은 Err 로 시작한다', fade(u, 1.6), { 'font-weight': 500, fill: MUT }); return; }
      card(150, 270, 210, 40, { rx: 8, text: 'err', fs: 15, mono: true, stroke: WARN, color: WARN, s: k === 1 ? pop(u, 0.3) : 1 });
      mono(40, 236, 'findUser(0)', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.2) : 1 });
      const a = k === 1 ? E(u, 0.8, 1.6) : 1; el('path', { d: 'M256,270 C420,270 520,120 606,96', fill: 'none', stroke: WARN, 'stroke-width': 2.6, 'stroke-dasharray': `${a * 520} 520` });
      if (k === 1) { note(40, 360, '새로 만들지 않고 같은 값을 돌려준다', fade(u, 1.8), { fill: WARN }); return; }
      pill(480, 330, 'errors.Is(err, ErrNotFound) → true', GOOD, pop(u, 0.4), { mono: true, fs: 14.5 });
      pill(820, 330, 'w.WriteHeader(404)', INFO, pop(u, 1.2), { mono: true, fs: 14 });
      nope(480, 390, 'err.Error() == "not found"', pop(u, 1.8)); sub(780, 395, '메시지가 바뀌면 깨진다', fade(u, 2.0), { 'font-size': 14, fill: BAD }); return; }
    if (k === 3 || k === 4) { vbox(60, 80, [null, null], {});
      card(680, 136, 300, 110, { rx: 12, stroke: ACC, op: 1 }); mono(544, 112, 'error', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      card(680, 150, 180, 34, { rx: 17, text: 'Error() string', fs: 14.5, mono: true, stroke: ACC, dash: '5 4', color: ACC });
      if (k === 3) { link(330, 136, 530, 136, E(u, 0.6, 1.2), MUT, true); cross(430, 136, 11, pop(u, 1.3)); note(60, 250, '필드에 정보를 담았지만 아직 error 는 아니다', fade(u, 1.6)); return; }
      card(196, 236, 270, 40, { rx: 20, text: 'func (v *ValidationError) Error()', fs: 13.5, mono: true, stroke: INFO, fill: INFOBG, color: INFO, s: pop(u, 0.3) });
      link(330, 136, 530, 136, E(u, 0.9, 1.4), GOOD, false); check(430, 116, 10, pop(u, 1.5));
      mono(60, 320, '*ValidationError → error', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) });
      mono(60, 356, 'ValidationError (값) → 아님', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) });
      sub(700, 300, '포인터 receiver 메서드는 *T 에만 붙는다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 5) { mono(40, 48, 'errors.As(err, &verr)', { 'font-size': 16, 'font-weight': 800 });
      card(300, 170, 500, 170, { rx: 12, stroke: ACC, fill: ACCBG, op: fade(u, 0.1) }); mono(64, 112, 'save user: …   (감싼 에러 · 예시)', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.2) });
      vbox(170, 128, ['"email"', '"형식 오류"'], { col: u > 1.2 ? GOOD : INK });
      el('rect', { x: 60, y: 120, width: 18, height: 18, rx: 3, fill: 'none', stroke: INFO, 'stroke-width': 2 });
      const sc = E(u, 0.4, 1.2); el('rect', { x: lerp(56, 164, sc), y: lerp(100, 122, sc), width: lerp(488, 282, sc), height: lerp(140, 124, sc), rx: 12, fill: 'none', stroke: INFO, 'stroke-width': 2.6, 'stroke-dasharray': '7 5' });
      tx(600, 110, '사슬을 바깥부터 훑는다', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.5) });
      card(740, 190, 180, 40, { rx: 8, text: 'verr', fs: 15, mono: true, stroke: GOOD, fill: u > 1.5 ? GOODBG : PANEL, color: GOOD, op: fade(u, 0.3) });
      grow(440, 184, 646, 190, E(u, 1.3, 1.7), GOOD);
      terminal(470, 300, 470, 72, ['… 필드 email 가 잘못됨: 형식 오류'], u > 2.0 ? 1 : 0, { title: 'log', fs: 14 });
      sub(250, 360, 'Is 는 같은 값, As 는 같은 타입을 찾는다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k 6: 포인터 nil 함정
    mono(40, 50, 'var v *ValidationError   // nil', { 'font-size': 15, 'font-weight': 700 });
    mono(40, 78, 'return v                  // error 로 돌려줌', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
    tx(40, 132, 'err', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.6) }); ival(100, 112, '*ValidationError', 'nil', { head: true, op: fade(u, 0.6), col: WARN });
    pill(560, 131, 'err != nil → true', BAD, pop(u, 1.2), { mono: true, fs: 15 });
    tx(40, 222, 'nil', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 1.6) }); ival(100, 202, 'nil', 'nil', { op: fade(u, 1.6), col: GOOD });
    pill(560, 221, 'return nil 일 때만 == nil', GOOD, pop(u, 1.9), { fs: 15 });
    note(40, 320, '타입 칸이 차 있으면 값 칸이 nil 이어도 nil 이 아니다', fade(u, 2.2), { fill: WARN });
    note(40, 354, '실패가 없으면 포인터 변수 말고 nil 을 그대로 돌려준다', fade(u, 2.5), { 'font-weight': 500 }); }
  function link(x1, y1, x2, y2, u, col, dashed) { grow(x1, y1, x2, y2, u, col, { sw: 2.4, dash: dashed ? '6 5' : null, plain: dashed }); }

  // ---------- 3. slice ----------
  const CW = 46, CG = 4;
  function hdr(x, y, name, p, ln, cp, o) { o = o || {}; const op = o.op ?? 1;
    mono(x, y - 8, name, { 'font-size': 15, 'font-weight': 800, opacity: op });
    [['ptr', p], ['len', ln], ['cap', cp]].forEach(([f, v], i) => { const cx = x + i * 66 + 31;
      card(cx, y + 22, 62, 42, { rx: 6, stroke: o.col || INK, op, fill: PANEL });
      tx(cx, y + 13, f, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op });
      if (f === 'ptr') { if (v === 'nil') mono(cx, y + 35, 'nil', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: op }); else el('circle', { cx, cy: y + 30, r: 5, fill: o.col || ACC, opacity: op }); }
      else mono(cx, y + 35, String(v), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: op }); });
    return { px: x + 31, py: y + 30 }; }
  function arr(x, y, vals, o) { o = o || {}; const n = o.cap ?? vals.length;
    for (let i = 0; i < n; i++) { const v = vals[i], live = i < (o.len ?? vals.length), s = o.s ? o.s(i) : 1;
      if (s <= 0) continue;
      card(x + i * (CW + CG) + CW / 2, y + 20, CW, 40, { rx: 4, text: v == null ? '' : String(v), fs: String(v).length > 2 ? 13.5 : 15, mono: true, fw: 700,
        stroke: o.hot === i ? WARN : live ? (o.col || ACC) : GRID, fill: o.hot === i ? WARNBG : live ? PANEL : SOFT, color: o.dim ? MUT : INK, op: (o.op ?? 1), s, dash: live ? null : '4 3' }); } }
  const pto = (h, x, y, col, u) => { const f = u ?? 1; if (f <= 0) return; el('path', { d: `M${h.px},${h.py} C${h.px + 60},${h.py} ${x - 60},${y} ${lerp(h.px, x, f)},${lerp(h.py, y, f)}`, fill: 'none', stroke: col || ACC, 'stroke-width': 2.2, 'marker-end': f > 0.98 ? (col === WARN ? 'url(#ra-ah)' : 'url(#ra-ahb)') : null }); };
  const A12 = [1, 999, 3, 4, 5, 6, 7, 0, 0, 0, 0, 0], A12o = [1, 2, 3, 4, 5, 6, 7, 0, 0, 0, 0, 0];
  function s3(t, c) { const { k, u } = c, AX = 300;
    if (k === 0) { const ha = hdr(40, 60, 'a := []int{1, 2, 3}', '●', 3, 3, { op: fade(u, 0.2) }); arr(AX, 70, [1, 2, 3], { s: (i) => pop(u, 0.4 + i * 0.1) }); pto(ha, AX - 4, 90, ACC, E(u, 0.6, 1.0));
      const hb = hdr(40, 170, 'b := make([]int, 5)', '●', 5, 5, { op: fade(u, 0.9) }); arr(AX, 180, [0, 0, 0, 0, 0], { s: (i) => pop(u, 1.0 + i * 0.08) }); pto(hb, AX - 4, 200, ACC, E(u, 1.2, 1.5));
      const hc = hdr(40, 280, 'c := make([]int, 0, 100)', '●', 0, 100, { op: fade(u, 1.5) }); arr(AX, 290, [], { cap: 10, len: 0, s: (i) => pop(u, 1.6 + i * 0.05) }); pto(hc, AX - 4, 310, ACC, E(u, 1.8, 2.1));
      mono(AX + 10 * (CW + CG) + 6, 316, '… 100칸', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) });
      sub(480, 400, 'slice 값 = 헤더 3칸. 함수에 넘겨도 이 3칸만 복사된다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 1) { const ph = u < 1.0 ? 0 : u < 1.8 ? 1 : 2;
      const ln = u < 0.8 ? 3 : u < 1.6 ? 4 : u < 2.4 ? 7 : 12, cp = u < 0.8 ? 3 : u < 1.6 ? 6 : 12;
      const ha = hdr(40, 110, 'a', '●', ln, cp, {});
      // 배열 세 벌: cap 3 → 6 → 12
      tx(AX, 24, 'cap 3', { 'font-size': 13.5, fill: MUT, class: 'mono' }); arr(AX, 30, [1, 2, 3], { dim: u > 0.8, col: u > 0.8 ? GRID : ACC });
      if (u > 0.5) { tx(AX, 104, 'cap 6', { 'font-size': 13.5, fill: MUT, class: 'mono' }); arr(AX, 110, [1, 2, 3, u > 0.7 ? 4 : null, null, null], { cap: 6, len: u > 0.7 ? 4 : 3, dim: u > 1.6, col: u > 1.6 ? GRID : ACC, s: (i) => pop(u, 0.5 + i * 0.03, 0.3) }); }
      if (u > 1.3) { tx(AX, 184, 'cap 12', { 'font-size': 13.5, fill: MUT, class: 'mono' });
        const v = A12o.map((x, i) => (i < 4 ? x : i < 7 ? (u > 1.5 ? x : null) : (u > 2.2 ? 0 : null)));
        arr(AX, 190, v, { cap: 12, len: u > 2.2 ? 12 : u > 1.5 ? 7 : 4, s: (i) => pop(u, 1.3 + i * 0.02, 0.3) }); }
      const target = u < 0.8 ? 50 : u < 1.6 ? 130 : 210; pto(ha, AX - 4, target, ACC);
      [['append(a, 4)', 0.6, '새 배열 + 복사'], ['append(a, 5, 6, 7)', 1.4, '또 새 배열 + 복사'], ['append(a, b...)', 2.1, '자리가 있어 제자리']].forEach(([s, a, w], i) => {
        mono(40, 290 + i * 34, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); tx(260, 290 + i * 34, w, { 'font-size': 14, fill: i < 2 ? WARN : GOOD, 'font-weight': 700, opacity: fade(u, a + 0.2) }); });
      sub(720, 330, 'cap 값은 gc 구현 기준 예시', fade(u, 1.0), { 'font-size': 13.5 });
      sub(720, 360, '버려진 배열은 GC 가 치운다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k 2~4: a 는 len 12 cap 12
    const ha = hdr(40, 60, 'a', '●', 12, 12, {}); const wrote = k > 2 || u > 1.4;
    arr(AX, 70, wrote ? A12 : A12o, { hot: k === 2 && wrote ? 1 : null }); pto(ha, AX - 4, 90, ACC);
    for (let i = 0; i < 12; i++) mono(AX + i * (CW + CG) + CW / 2, 128, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    if (k === 2) { const hs = hdr(40, 200, 'sub := a[1:3]', '●', 2, 11, { op: fade(u, 0.2), col: WARN });
      pto(hs, AX + CW + CG + CW / 2, 112, WARN, E(u, 0.4, 0.9));
      el('rect', { x: AX + CW + CG - 4, y: 64, width: 2 * CW + CG + 8, height: 52, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2.6, opacity: fade(u, 0.9) });
      mono(AX + 110, 300, 'sub[0] = 999', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
      pill(AX + 420, 300, 'a[1] → 999', BAD, pop(u, 1.9), { mono: true, fs: 15 });
      sub(480, 380, '복사가 아니다 — 같은 배열을 다른 헤더로 본다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 3) { const hd = hdr(40, 210, 'dst', '●', 12, 12, { op: fade(u, 0.2), col: GOOD });
      arr(AX, 220, A12.map((v, i) => (u > 0.6 + i * 0.07 ? v : null)), { cap: 12, len: 12, col: GOOD }); pto(hd, AX - 4, 240, GOOD, E(u, 0.3, 0.6));
      for (let i = 0; i < 3; i++) dot([[AX + 25 + i * 150, 112], [AX + 25 + i * 150, 218]], seg(u, 0.6 + i * 0.25, 1.2 + i * 0.25), GOOD, 5);
      mono(40, 330, 'n := copy(dst, a)  // n = 12', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      note(40, 380, '배열이 따로라 dst 를 고쳐도 a 는 그대로', fade(u, 2.2), { fill: GOOD }); return; }
    // k 4: for range
    const i = Math.min(11, Math.floor(E(u, 0.2, 2.4) * 12));
    el('rect', { x: AX + i * (CW + CG) - 3, y: 66, width: CW + 6, height: 48, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 3 });
    card(AX + 140, 220, 110, 50, { rx: 8, stroke: INFO, fill: INFOBG }); mono(AX + 96, 226, 'i', { 'font-size': 15, fill: INFO, 'font-weight': 700 }); mono(AX + 176, 228, String(i), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end' });
    card(AX + 280, 220, 110, 50, { rx: 8, stroke: INFO, dash: '5 4' }); mono(AX + 236, 226, 'v', { 'font-size': 15, fill: INFO, 'font-weight': 700 }); mono(AX + 316, 228, String(A12[i]), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end' });
    sub(AX + 280, 266, 'v 는 복사본', 1, { 'font-size': 13.5 });
    const lines = A12.slice(0, i + 1).map((v, j) => `a[${j}] = ${v}`);
    terminal(40, 170, 220, 210, lines, lines.length, { fs: 13.5, lh: 20 });
    note(AX, 340, 'v 를 고쳐도 a 는 안 바뀐다 — 고치려면 a[i] = …', fade(u, 2.2)); return; }
  function s3x(t, c) { if (c.k !== 5) return s3(t, c); const { u } = c, AX = 300;
    const done = u > 1.2;
    const hz = hdr(40, 80, 'var z []int', done ? '●' : 'nil', done ? 1 : 0, done ? 1 : 0, {});
    mono(40, 190, 'z = append(z, 1)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5) });
    if (done) { arr(AX, 90, [1], { s: () => pop(u, 1.2) }); pto(hz, AX - 4, 110, ACC, E(u, 1.3, 1.6)); }
    mono(AX, 70, done ? 'z == nil → false' : 'z == nil → true', { 'font-size': 15, fill: done ? GOOD : WARN, 'font-weight': 700 });
    note(40, 260, 'nil slice 에도 append 가 배열을 만들어 준다', fade(u, 1.8));
    note(40, 292, 'len(z) 도 nil 일 때 0 — panic 이 없다', fade(u, 2.1), { 'font-weight': 500 });
    sub(720, 260, 'cap 1 은 gc 구현 기준 예시', fade(u, 1.6), { 'font-size': 13.5 });
    sub(480, 380, 'JSON 으로 내보내면 nil slice 는 null, 빈 slice 는 []', fade(u, 2.4), { 'font-size': 14.5 }); }

  // ---------- 4. map ----------
  const BK = { x: 560, y: 70, n: 4, slots: 3, sw: 112, sh: 40 };
  const where = { alice: [1, 0], bob: [3, 0], carol: [0, 0], dave: 1 };   // 예시 배치
  function buckets(content, o) { o = o || {};
    tx(BK.x, 52, '버킷 (배치는 예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    for (let b = 0; b < BK.n; b++) { const y = BK.y + b * 64;
      mono(BK.x - 12, y + 26, String(b), { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      for (let s = 0; s < BK.slots; s++) { const it = content.find((e) => e.b === b && e.s === s), x = BK.x + s * (BK.sw + 6);
        card(x + BK.sw / 2, y + 20, BK.sw, BK.sh, { rx: 6, text: it ? `${it.k}: ${it.v}` : '', fs: 13.5, mono: true, stroke: it ? (it.col || ACC) : GRID, fill: it && it.hot ? (it.hotbg || WARNBG) : PANEL, color: it && it.gone ? MUT : INK, op: it && it.op != null ? it.op : 1 }); } }
    if (o.hb != null) el('rect', { x: BK.x - 6, y: BK.y + o.hb * 64 - 6, width: BK.slots * (BK.sw + 6) + 6, height: BK.sh + 12, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.6, opacity: o.hbop ?? 1 }); }
  function hashBox(op) { card(400, 200, 110, 50, { rx: 25, text: 'hash()', fs: 15, mono: true, stroke: INFO, color: INFO, op }); }
  function lenBadge(n, x, y) { mono(x ?? 40, y ?? 380, `len(scores) = ${n}`, { 'font-size': 16, 'font-weight': 800, fill: ACC }); }
  function s4(t, c) { const { k, u } = c;
    const e = (key, v, o) => Object.assign({ k: key, v, b: where[key][0], s: where[key][1] }, o || {});
    if (k === 0) { hashBox(fade(u, 0.3));
      [['alice', 90, 0.5], ['bob', 85, 1.2]].forEach(([kk, v, a], i) => { pill(150, 150 + i * 60, `"${kk}": ${v}`, INK, pop(u, a - 0.3), { mono: true, fs: 14 });
        dot([[220, 150 + i * 60], [345, 200], [455, 200], [BK.x, BK.y + where[kk][0] * 64 + 20]], seg(u, a, a + 0.6), INFO, 6); });
      buckets([u > 1.1 ? e('alice', 90, {}) : null, u > 1.8 ? e('bob', 85, {}) : null].filter(Boolean));
      mono(40, 70, 'scores := map[string]int{…}', { 'font-size': 15, 'font-weight': 800 });
      if (u > 1.9) lenBadge(2);
      sub(240, 330, 'empty := make(map[string]int) 는 len 0 으로 시작', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 1) { hashBox(1);
      pill(150, 150, 'scores["carol"] = 77', ACC, pop(u, 0.2), { mono: true, fs: 14 }); dot([[240, 150], [345, 200], [455, 200], [BK.x, BK.y + 20]], seg(u, 0.4, 1.0), INFO, 6);
      pill(150, 230, 'scores["alice"] = 95', WARN, pop(u, 1.2), { mono: true, fs: 14 }); dot([[240, 230], [345, 200], [455, 200], [BK.x, BK.y + 64 + 20]], seg(u, 1.4, 1.9), INFO, 6);
      buckets([e('alice', u > 1.9 ? 95 : 90, { hot: u > 1.9 }), e('bob', 85), u > 1.0 ? e('carol', 77, { hot: u < 1.8, hotbg: ACCBG }) : null].filter(Boolean));
      lenBadge(u > 1.0 ? 3 : 2);
      sub(240, 320, '없으면 추가, 있으면 덮어쓴다 — 문법이 같다', fade(u, 2.2), { 'font-size': 14 }); return; }
    const base = [e('alice', 95), e('bob', 85, k === 3 && u > 1.2 ? { op: 1 - E(u, 1.2, 1.8) } : {}), e('carol', 77)].filter((x) => !(k >= 4 && x.k === 'bob'));
    if (k === 2) { hashBox(1); pill(150, 150, 'v, ok := scores["dave"]', INK, pop(u, 0.2), { mono: true, fs: 14 });
      dot([[260, 150], [345, 200], [455, 200], [BK.x, BK.y + 64 + 20]], seg(u, 0.4, 1.0), INFO, 6);
      buckets(base, { hb: 1, hbop: fade(u, 1.0) }); if (u > 1.3) cross(BK.x + BK.sw + 10, BK.y + 64 + 4, 9, pop(u, 1.3));
      mono(40, 260, 'ok = false', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) }); mono(40, 292, 'v  = 0   (int 의 zero value)', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
      terminal(40, 316, 300, 64, ['dave 없음'], u > 2.1 ? 1 : 0, { fs: 14 });
      lenBadge(3, 560, 360); return; }
    if (k === 3) { pill(150, 150, 'delete(scores, "bob")', BAD, pop(u, 0.2), { mono: true, fs: 14 });
      buckets(base, { hb: 3, hbop: fade(u, 0.6) }); if (u > 1.8) cross(BK.x + BK.sw / 2, BK.y + 3 * 64 + 20, 10, pop(u, 1.8));
      lenBadge(u > 1.6 ? 2 : 3, 40, 260); sub(200, 320, '없는 키를 지워도 아무 일도 없다', fade(u, 2.2), { 'font-size': 14 }); return; }
    buckets(base);
    if (k === 4) { mono(40, 70, 'for name, score := range scores', { 'font-size': 15, 'font-weight': 800 });
      terminal(40, 100, 230, 90, ['alice: 95', 'carol: 77'], u > 0.8 ? 2 : u > 0.5 ? 1 : 0, { title: '1회 (예시)', fs: 14 });
      terminal(290, 100, 230, 90, ['carol: 77', 'alice: 95'], u > 1.6 ? 2 : u > 1.3 ? 1 : 0, { title: '2회 (예시)', fs: 14 });
      note(40, 250, '순서는 명세가 정하지 않는다', fade(u, 1.9), { fill: WARN }); note(40, 280, '런타임이 일부러 섞는다', fade(u, 2.2), { 'font-weight': 500 }); return; }
    // k 5~6: keys slice
    mono(40, 70, 'keys := make([]string, 0, len(scores))', { 'font-size': 14.5, 'font-weight': 800 });
    const sorted = k === 6 && u > 0.8, ks = sorted ? ['alice', 'carol'] : ['carol', 'alice'];
    const n = k === 5 ? (u < 0.9 ? 0 : u < 1.5 ? 1 : 2) : 2;
    tx(40, 120, `keys  len ${n} · cap 2`, { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    [0, 1].forEach((i) => card(100 + i * 130, 160, 120, 44, { rx: 6, text: i < n ? `"${ks[i]}"` : '', fs: 14.5, mono: true, stroke: i < n ? (sorted ? GOOD : ACC) : GRID, dash: i < n ? null : '4 3' }));
    if (k === 5) { sub(165, 216, '모은 순서는 예시 · 아직 무작위', fade(u, 1.8), { 'font-size': 13.5 }); note(40, 280, 'cap 을 미리 잡아 append 재할당이 없다', fade(u, 2.2)); return; }
    mono(40, 250, 'sort.Strings(keys)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
    terminal(40, 270, 300, 90, ['alice: 95', 'carol: 77'], u > 1.4 ? 2 : u > 1.2 ? 1 : 0, { title: '출력 — 항상 이 순서', fs: 14 });
    sub(720, 380, '정렬한 키로 조회하면 출력이 매번 같다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 5. 실전: error 흐름 + defer ----------
  const FR = { x: 30, y: 40, w: 560, h: 340 };
  function frame(o) { el('rect', { x: FR.x, y: FR.y, width: FR.w, height: FR.h, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    mono(FR.x + 14, FR.y + 26, 'func loadUsers(ctx, db) (map[int]*User, error)', { 'font-size': 14, 'font-weight': 800 });
    // defer 스택
    tx(860, 56, 'defer 스택', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    el('path', { d: 'M790,70 V210 H930 V70', fill: 'none', stroke: MUT, 'stroke-width': 2.4 }); }
  function exitDoor(i, label, msg, op) { const y = 100 + i * 70;
    el('rect', { x: FR.x + FR.w - 8, y: y - 18, width: 16, height: 36, rx: 3, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: op });
    tx(FR.x + FR.w - 16, y - 24, label, { 'font-size': 14, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: op }); if (msg) mono(690, y + 5, msg, { 'font-size': 13.5, fill: BAD, opacity: op, 'text-anchor': 'middle' }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) { frame();
      const deferIn = k === 1 ? E(u, 0.4, 1.2) : k > 1 ? 1 : 0, run = k === 3 ? E(u, 1.6, 2.2) : 0;
      if (deferIn > 0) { card(860, lerp(30, 186, deferIn) - run * 60, 120, 34, { rx: 6, text: 'rows.Close()', fs: 13.5, mono: true, stroke: run > 0.5 ? GOOD : INFO, fill: run > 0.5 ? GOODBG : INFOBG, color: run > 0.5 ? GOOD : INFO }); }
      mono(60, 100, 'rows, err := db.QueryContext(…)', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
      exitDoor(0, 'err → return', k === 0 ? 'query users: …' : null, k === 0 ? fade(u, 0.8) : 0.6);
      if (k === 0) { grow(330, 100, FR.x + FR.w - 12, 100, E(u, 0.6, 1.1), BAD); sub(690, 140, '%w 로 감싸 원본을 남긴다', fade(u, 1.4), { 'font-size': 13.5 });
        note(60, 200, 'ctx 를 넘기면 취소될 때 쿼리도 멈춘다', fade(u, 1.8), { 'font-weight': 500 }); return; }
      mono(60, 140, 'defer rows.Close()', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: k === 1 ? fade(u, 0.2) : 1 });
      if (k === 1) { note(60, 220, '닫기를 지금 예약 — 어느 return 으로 나가든 실행된다', fade(u, 1.5)); note(60, 250, 'panic 으로 끝나도 실행된다', fade(u, 1.9), { 'font-weight': 500 }); return; }
      mono(60, 180, 'for rows.Next() { Scan → users[u.ID] = &u }', { 'font-size': 14.5, 'font-weight': 700 });
      exitDoor(1, 'Scan 실패 → return', null, 0.6);
      const R2 = [['1', '"Alice"'], ['42', '"Bob"']], got = k === 2 ? (u < 1.0 ? 0 : u < 1.7 ? 1 : 2) : 2;
      tx(60, 236, 'users (행은 예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      R2.forEach(([id, nm], i) => { if (i < got) card(130 + i * 170, 270, 150, 38, { rx: 6, text: `${id}: ${nm}`, fs: 14, mono: true, stroke: ACC, s: k === 2 ? pop(u, 1.0 + i * 0.7, 0.4) : 1 }); });
      if (k === 2) { for (let i = 0; i < 2; i++) dot([[80, 196], [130 + i * 170, 252]], seg(u, 0.4 + i * 0.7, 1.0 + i * 0.7), ACC, 6); return; }
      mono(60, 336, 'if err := rows.Err(); err != nil', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      exitDoor(2, 'iterate 실패 → return', null, 0.6);
      pill(450, 400, 'return users, nil', GOOD, pop(u, 1.0), { mono: true, fs: 14.5 });
      tx(860, 250, u > 1.6 ? '함수가 끝나며 실행' : '', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700 });
      sub(760, 330, '실패 경로 3곳 모두 defer 가 닫는다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 4) { mono(40, 60, 'users, err := loadUsers(ctx, db)', { 'font-size': 16, 'font-weight': 800 });
      ret2(40, 110, 'nil', 'err (감싼 사슬)', { op: fade(u, 0.3), bad: true });
      card(620, 190, 560, 110, { rx: 12, stroke: ACC, fill: ACCBG, op: fade(u, 0.6) }); mono(360, 168, 'query users: ', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) });
      card(640, 210, 300, 44, { rx: 8, text: '원본 DB 에러', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 0.9) });
      terminal(40, 280, 600, 70, ['… 불러오기 실패: query users: <원본 DB 에러>'], u > 1.6 ? 1 : 0, { title: 'log  %v', fs: 14 });
      sub(480, 390, '%v 로 찍으면 사슬 전체가 한 줄로 나온다 · 실패 상황은 예시', fade(u, 2.1), { 'font-size': 14 }); return; }
    // k 5: 콤마-OK
    mono(40, 60, 'if u, ok := users[42]; ok {', { 'font-size': 16, 'font-weight': 800 });
    [['1', '"Alice"'], ['42', '"Bob"']].forEach(([id, nm], i) => card(160 + i * 190, 140, 170, 44, { rx: 6, text: `${id}: ${nm}`, fs: 14.5, mono: true, stroke: i ? GOOD : ACC, fill: i && u > 0.9 ? GOODBG : PANEL }));
    tx(60, 104, 'users', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' }); sub(255, 196, '내용은 예시', 1, { 'font-size': 13.5 });
    el('rect', { x: 256, y: 112, width: 188, height: 56, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.6, opacity: fade(u, 0.6) });
    ival(560, 120, 'ok', 'true', { w1: 70, w2: 90, op: fade(u, 1.0), col: GOOD });
    terminal(40, 240, 420, 70, ['찾음: Bob'], u > 1.6 ? 1 : 0, { fs: 14 });
    sub(700, 270, '42 가 없었다면 else 로 "42 번 없음"', fade(u, 2.0), { 'font-size': 14 });
    [['error', BAD], ['slice', ACC], ['map', INFO], ['defer', GOOD]].forEach(([s, col], i) => pill(240 + i * 160, 370, s, col, pop(u, 2.2 + i * 0.1), { fs: 15, mono: true })); }

  const quiz = [
    { q: 'result, err := divide(10, 0) 다음에 err를 검사하지 않고 result를 쓰면 무엇이 문제인가?',
      o: ['프로그램이 바로 panic 한다', 'result가 nil이라 컴파일이 안 된다', '실패해서 돌아온 0을 정상값으로 쓰게 된다'], a: 2,
      why: '실패 경로는 0과 "divide by zero"를 함께 돌려준다. err를 보지 않으면 0이 정답처럼 흘러간다.' },
    { q: 'errors.Is(err, ErrNotFound)가 err.Error() == "not found" 보다 나은 이유는 무엇인가?',
      o: ['같은 에러 값을 비교하고 %w로 감싼 안쪽까지 찾아서', '문자열 비교보다 항상 빨라서', 'ErrNotFound 메시지를 자동으로 번역해서'], a: 0,
      why: 'sentinel은 패키지 변수 하나를 돌려주므로 같은 값인지로 알아본다. 메시지가 바뀌어도, 한 겹 감싸도 Is는 찾는다.' },
    { q: 'a = [1 2 3 4 5 6 7 0 0 0 0 0]에서 sub := a[1:3]; sub[0] = 999를 하면 a[1]은 무엇인가?',
      o: ['2', '999', '0'], a: 1,
      why: '슬라이싱은 같은 밑배열을 가리키는 새 헤더를 만들 뿐이다. sub[0]은 a[1]과 같은 칸이다.' },
    { q: 'scores에 없는 "dave" 를 v, ok := scores["dave"]로 읽으면 무엇이 나오나?',
      o: ['v = 0, ok = false', 'panic', 'v = nil, ok = true'], a: 0,
      why: '없는 키를 읽어도 panic이 아니라 zero value가 나온다. 그래서 ok로 없는 것과 0이 저장된 것을 구분한다.' },
    { q: 'loadUsers에서 defer rows.Close()를 쿼리 에러 검사 바로 뒤에 두는 이유는 무엇인가?',
      o: ['rows.Close()가 쿼리를 빠르게 만들어서', 'rows가 유효해진 직후 예약해 두면 어느 return으로 나가도 닫혀서', 'defer는 함수 맨 앞에만 쓸 수 있어서'], a: 1,
      why: '쿼리가 성공해 rows가 생긴 순간 닫기를 예약하면 Scan 실패, rows.Err 실패, 정상 return 모두에서 실행된다.' },
  ];

  const summary = [
    'Go 함수는 실패를 (결과, error) 두 번째 칸으로 돌려주고, 호출한 쪽이 if err != nil로 거른다.',
    '%w로 감싸면 원본이 사슬에 남아 errors.Is와 errors.As가 안쪽까지 찾는다.',
    'slice는 ptr, len, cap 헤더라 a[1:3]은 같은 배열을 고치고, cap을 넘는 append는 새 배열로 옮긴다.',
    'map은 없는 키에 zero value를 주므로 콤마-OK로 확인하고, 순서가 필요하면 키를 정렬한다.',
  ];
  const review = [
    { q: '검증 함수가 실패가 없을 때 var v *ValidationError를 그대로 return 했더니 호출 측 err != nil이 늘 참이다. 원인은?',
      o: ['인터페이스 값의 타입 칸에 *ValidationError가 들어 있어서', 'ValidationError에 Error() 메서드가 없어서', 'errors.As를 쓰지 않아서'], a: 0,
      why: 'error 인터페이스 값은 타입과 값 두 칸이다. 값이 nil 포인터여도 타입 칸이 차 있으면 nil이 아니므로 성공은 return nil로 돌려준다.' },
    { q: '큰 로그 파일을 읽어 앞 10바이트만 slice로 잘라 전역 변수에 담았더니 메모리가 줄지 않는다. 먼저 의심할 것은?',
      o: ['map 버킷이 지워지지 않았다', '작은 slice가 큰 밑배열을 계속 가리킨다', 'append가 cap을 두 배로 늘렸다'], a: 1,
      why: '슬라이싱은 같은 배열을 공유하므로 배열 전체가 GC되지 않는다. copy로 작은 배열에 옮겨 두면 원본을 놓아줄 수 있다.' },
    { q: 'API 응답에서 사용자 목록 순서가 요청할 때마다 바뀐다. 코드는 map을 range로 돌며 결과 slice에 append한다. 고칠 방법은?',
      o: ['map 대신 sync.Map을 쓴다', 'range를 두 번 돌린다', '키를 slice로 모아 정렬한 뒤 그 순서로 조회한다'], a: 2,
      why: 'map 순회 순서는 정해져 있지 않다. 키를 뽑아 sort.Strings 같은 정렬을 하고 그 순서로 꺼내면 출력이 매번 같다.' },
  ];

  R.page({ title: 'error · slice · map', scenes: [s1, s2, s3x, s4, s5], quiz, summary, review });
})();
