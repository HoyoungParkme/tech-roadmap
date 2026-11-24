/* II-1-1 클래스·생성자·static — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 설계도(class), 힙 객체, 스택 변수와 참조 화살표, 메서드영역의 static 칸, 호출 스택 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, lock, terminal, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 메모리 영역 판 (Heap / Stack / Method Area)
  function area(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || SOFT, stroke: o.stroke || 'none', 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (title) tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 700, fill: o.col || MUT, opacity: o.op ?? 1 }); }
  // 힙 객체: 머리(타입) + 필드 줄. rows: [[이름, 값, {hot, vcol, col}]]
  function obj(x, y, w, head, rows, o) { o = o || {}; const rh = o.rh || 30, h = 38 + rows.length * rh, op = o.op ?? 1, s = o.s ?? 1, st0 = o.stroke || ACC;
    const g = el('g', { opacity: op, transform: s !== 1 ? `translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-x - w / 2} ${-y - h / 2})` : null });
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: st0, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: x, y1: y + 32, x2: x + w, y2: y + 32, stroke: st0, 'stroke-width': 1.4 }, g);
    tx(x + 12, y + 22, head, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: st0 }, g);
    if (o.addr) mono(x + w - 10, y + 22, o.addr, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g);
    rows.forEach(([n, v, rs], i) => { rs = rs || {}; const cy = y + 35 + i * rh + rh / 2;
      if (rs.hot) el('rect', { x: x + 4, y: cy - rh / 2 + 2, width: w - 8, height: rh - 4, rx: 5, fill: rs.hot === true ? WARNBG : rs.hot }, g);
      mono(x + 12, cy + 5, n, { 'font-size': 14.5, fill: rs.col || INK }, g);
      if (v != null) mono(x + w - 12, cy + 5, String(v), { 'font-size': 14.5, 'font-weight': 700, fill: rs.vcol || INK, 'text-anchor': 'end' }, g); });
    return { x, y, w, h, cy: (i) => y + 35 + i * rh + rh / 2 }; }
  // 스택 변수 칸: 이름 + 상자. val '•' 이면 참조 점
  function slot(x, y, name, val, o) { o = o || {}; const w = o.w || 64, op = o.op ?? 1;
    tx(x - 10, y + 5, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono', fill: o.col || INK, opacity: op });
    el('rect', { x, y: y - 16, width: w, height: 32, rx: 6, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    if (val === '•') el('circle', { cx: x + w / 2, cy: y, r: 5.5, fill: o.dotCol || ACC, opacity: op });
    else if (val != null) mono(x + w / 2, y + 5, val, { 'font-size': 14, 'text-anchor': 'middle', fill: o.vcol || INK, opacity: op });
    return { cx: x + w / 2, x1: x + w, y }; }
  // 참조 화살표: 곡선이 u 만큼 자란다
  function ref(x1, y1, x2, y2, u, o) { o = o || {}; if (u <= 0) return; const col = o.col || ACC;
    const mk = col === BAD ? 'url(#ra-ahr)' : col === ACC ? 'url(#ra-ahb)' : 'url(#ra-ah)';
    const mx = (x1 + x2) / 2 + (o.bx || 0), my = (y1 + y2) / 2 + (o.by || 0);
    el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 2.4, pathLength: 1,
      'stroke-dasharray': u >= 1 ? o.dash : `${clamp(u)} 1`, 'marker-end': u > 0.98 ? mk : null, opacity: o.op ?? 1 }); }
  // 왼쪽 정렬 코드 칩
  function chip(x, y, s, o) { o = o || {}; const fs = o.fs || 14, w = o.w || tw(s, fs) + 22, op = o.op ?? 1;
    el('rect', { x, y: y - 15, width: w, height: 30, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 11, y + 5, s, { 'font-size': fs, fill: o.col || INK, 'font-weight': o.fw || 600, opacity: op, 'text-decoration': o.strike ? 'line-through' : null });
    return { x, y, w, x1: x + w }; }
  // 순서 띠: ① 필드 초기값 → ② 생성자 본문
  function order(x, y, on, vals) { const items = [['①', '필드 초기값', vals[0]], ['②', '생성자 본문', vals[1]]];
    items.forEach(([n, s, v], i) => { const cx = x + i * 230, live = on > i, col = live ? (i ? GOOD : WARN) : OFF;
      card(cx + 100, y, 200, 46, { rx: 10, stroke: col, sw: live ? 2.2 : 1.5, fill: live ? (i ? GOODBG : WARNBG) : PANEL });
      tx(cx + 14, y + 6, n + ' ' + s, { 'font-size': 15, 'font-weight': 700, fill: live ? INK : MUT });
      if (v != null && live) mono(cx + 188, y + 6, v, { 'font-size': 15, 'font-weight': 800, fill: i ? GOOD : WARN, 'text-anchor': 'end' });
      if (i === 0) grow(cx + 204, y, cx + 226, y, on > 1 ? 1 : 0, MUT); }); }

  // ---------- 1. 설계도와 인스턴스 ----------
  const BP = { x: 40, y: 50, w: 300 };
  function blueprint(k, u) {
    el('rect', { x: BP.x, y: BP.y, width: BP.w, height: 250, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '7 5' });
    tx(BP.x + 14, BP.y + 26, 'class Player', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
    tx(BP.x + BP.w - 12, BP.y + 26, '설계도', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 });
    el('line', { x1: BP.x, y1: BP.y + 40, x2: BP.x + BP.w, y2: BP.y + 40, stroke: GRID, 'stroke-width': 1.5 });
    const f = k === 0 ? [fade(u, 0.3), fade(u, 0.9)] : [1, 1];
    chip(BP.x + 14, BP.y + 66, 'String name;', { op: f[0], stroke: k === 0 ? ACC : GRID });
    chip(BP.x + 14, BP.y + 102, 'int hp;', { op: f[1], stroke: k === 0 ? ACC : GRID });
    if (k >= 1) chip(BP.x + 14, BP.y + 144, 'Player(String, int)', { op: k === 1 ? fade(u, 0.2) : 1, stroke: k === 1 ? ACC : GRID });
    if (k >= 2) chip(BP.x + 14, BP.y + 216, 'void attack()', { op: k === 2 ? fade(u, 0.2) : 1, stroke: k === 2 ? ACC : GRID }); }
  function s1(t, c) { const { k, u } = c;
    area(400, 30, 530, 300, 'Heap', { col: ACC });
    area(40, 318, 300, 94, 'main() 스택', {});
    blueprint(k, u);
    if (k === 0) sub(BP.x + 150, BP.y + 236, '필드는 자리만 있고 값은 없다', fade(u, 1.4), { 'font-size': 14 });
    if (k === 1) { // this.name = name
      const a = chip(BP.x + 14, BP.y + 184, '매개변수 name', { op: fade(u, 0.6), stroke: INFO, col: INFO, fs: 13.5 });
      grow(a.x1 + 4, BP.y + 184, a.x1 + 34, BP.y + 184, seg(u, 1.0, 1.5), ACC);
      chip(a.x1 + 40, BP.y + 184, 'this.name', { op: fade(u, 1.4), stroke: ACC, col: ACC, fs: 13.5 }); }
    if (k <= 2) sub(665, 190, k === 2 ? '설계도뿐 — 힙에는 아직 객체가 없다' : '아직 비어 있다', k === 2 ? fade(u, 0.8) : 1, { 'font-size': 15 });
    const ins = (c.beat.blueprint && c.beat.blueprint.instances) || [];
    const P = [{ x: 440, sx: 110 }, { x: 700, sx: 250 }];
    ins.forEach((it, i) => { const born = (k === 3 && i === 0) || (k === 4 && i === 1), gu = born ? E(u, 0.2, 1.2) : 1;
      // 설계도에서 힙으로 찍혀 나온다
      const x = lerp(BP.x + 40, P[i].x, born ? gu : 1), y = lerp(BP.y + 60, 90, born ? gu : 1);
      let hp = it.hp; if (i === 0 && k >= 5) hp = Math.round(tween(100, 50, u));
      const o = obj(x, y, 200, 'Player', [['name', it.name], ['hp', hp, { hot: i === 0 && k === 5 && u > 0.3, vcol: i === 0 && k >= 5 ? WARN : INK }]],
        { addr: it.addr, op: born ? clamp(gu * 1.6) : 1 });
      const sl = slot(P[i].sx, 372, it.ref, '•', { op: born ? fade(u, 1.2) : 1 });
      ref(sl.cx, sl.y, P[i].x + 100, 90 + o.h, born ? seg(u, 1.4, 2.2) : 1, { by: 30 });
      if (i === 1 && k === 5) { check(P[i].x + 220, 150, 9, pop(u, 1.5)); tx(P[i].x + 100, 76, 'p2.hp는 80 그대로', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) }); }
      if (i === 0 && k === 5) tx(P[i].x + 100, 76, 'p1.hp = 50', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', fill: WARN, opacity: fade(u, 0.4) }); });
    if (k >= 3 && k <= 4) sub(775, 318, '@0x1A 같은 주소는 설명용 예시다', k === 3 ? fade(u, 2) : 1);
    if (k === 4) tx(775, 290, '틀은 하나, 객체는 둘 — 필드도 각자', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }

  // ---------- 2. 생성자 체이닝과 초기화 순서 ----------
  // 호출 스택 프레임 (아래에서 위로 쌓인다)
  function frame(x, y, w, sig, locals, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: 62, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    mono(x + 12, y + 22, sig, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: op });
    mono(x + 12, y + 48, locals, { 'font-size': 13.5, fill: MUT, opacity: op }); }
  function s2(t, c) { const { k, u } = c, FX = 40, FW = 360, Y0 = 250, Y1 = 170;
    area(30, 30, 390, 300, '호출 스택', {});
    area(450, 30, 480, 210, 'Heap', { col: ACC });
    const on = k === 0 ? (u > 0.6 ? 1 : 0) : k === 1 ? 1 : 2;
    if (k === 0) { chip(470, 90, 'int hp = 1;', { stroke: WARN, fs: 15, op: fade(u, 0.2) }); tx(612, 95, '← 선언부 초기값', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) });
      sub(690, 150, '생성자 본문보다 먼저 들어간다', fade(u, 1.2), { 'font-size': 15 }); sub(225, 180, '아직 생성자 호출 전', 1, { 'font-size': 15 }); }
    if (k === 1 || k === 2 || k === 3) {
      frame(FX, Y0, FW, 'Player(String name)', 'name = "전사"', { op: k === 1 ? fade(u, 0.2) : 1, stroke: k === 3 ? MUT : INK });
      chip(FX + 190, Y0 + 44, 'this(name, 100)', { fs: 13.5, stroke: k === 1 ? ACC : GRID, col: k === 1 ? ACC : INK, op: k === 1 ? fade(u, 0.7) : 1 });
      if (k === 1) { el('rect', { x: FX, y: Y1, width: FW, height: 62, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.2) });
        tx(FX + 275, Y0 - 16, '첫 줄에서 위임', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1) }); grow(FX + 260, Y0 + 30, FX + 260, Y1 + 64, seg(u, 1.3, 2.0), ACC); }
      if (k >= 2) { frame(FX, Y1, FW, 'Player(String name, int hp)', 'name = "전사"  hp = 100', { op: k === 2 ? fade(u, 0.2) : 1, stroke: k === 3 ? MUT : GOOD, fill: GOODBG });
        tx(FX + FW - 10, Y1 - 10, '★ 대입은 여기 한 곳', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 0.9) : 1 }); }
      if (k === 3) { check(FX + FW - 24, Y1 + 30, 9, pop(u, 2.0)); check(FX + FW - 24, Y0 + 30, 9, pop(u, 2.3)); }
      if (k === 1) sub(225, 110, '진입은 간편 생성자', fade(u, 0.4), { 'font-size': 15 }); }
    if (k === 2) { chip(470, 90, 'this.name = name;', { fs: 14.5, stroke: GOOD, op: fade(u, 0.8) }); chip(470, 130, 'this.hp = hp;', { fs: 14.5, stroke: GOOD, op: fade(u, 1.1) });
      sub(690, 190, '②의 값이 ①을 덮는다', fade(u, 1.6), { 'font-size': 15 }); }
    // 힙 객체 a, b
    if (k >= 3 && k <= 4) { const hpA = k === 3 ? (u < 1.2 ? 1 : Math.round(tween(1, 100, u - 1.1))) : 100;
      obj(475, 75, 200, 'Player', [['name', '"전사"'], ['hp', hpA, { hot: k === 3 && u > 0.4, vcol: hpA === 1 ? WARN : GOOD }]], { op: k === 3 ? fade(u, 0.3) : 1 });
      if (k === 3) tx(575, 198, u < 1.2 ? '① hp = 1' : '② hp = 100', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', fill: u < 1.2 ? WARN : GOOD, opacity: fade(u, 0.4) });
      else sub(575, 200, 'a.hp == 100', 1, { class: 'mono', 'font-size': 14.5 }); }
    if (k === 4) { frame(FX, Y0, FW, 'Player(String name, int hp)', 'name = "마법사"  hp = 80', { op: fade(u, 0.2), stroke: GOOD, fill: GOODBG });
      sub(225, 200, '위임 없이 곧장 대입 지점으로', fade(u, 0.5), { 'font-size': 15 });
      const hpB = u < 1.1 ? 1 : Math.round(tween(1, 80, u - 1.0));
      obj(705, 75, 200, 'Player', [['name', '"마법사"'], ['hp', hpB, { hot: u > 0.4, vcol: hpB === 1 ? WARN : GOOD }]], { op: fade(u, 0.4) });
      tx(805, 198, u < 1.1 ? '① hp = 1' : '② hp = 80', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', fill: u < 1.1 ? WARN : GOOD, opacity: fade(u, 0.5) }); }
    if (k === 5) { frame(FX, Y0 - 40, FW, 'Player(String name)', '', { stroke: BAD });
      chip(FX + 14, Y0 + 6, '(다른 문장);', { fs: 13.5, op: fade(u, 0.2) });
      chip(FX + 150, Y0 + 6, 'this(name, 100);', { fs: 13.5, stroke: BAD, col: BAD, op: fade(u, 0.5) });
      cross(FX + 340, Y0 + 6, 10, pop(u, 0.9));
      chip(460, 120, 'error: call to this must be first statement', { fs: 13.5, stroke: BAD, col: BAD, op: fade(u, 1.2), w: 450 });
      sub(690, 168, 'javac 메시지 (Java 24까지의 규칙)', fade(u, 1.6), { 'font-size': 14 }); }
    order(470, 290, on, [k >= 3 ? '1' : '1', k === 4 ? '80' : k >= 3 ? '100' : null]);
    tx(470, 345 + 30, k >= 2 ? '어느 생성자로 들어와도 ①이 먼저, ②가 최종값' : '초기화 순서', { 'font-size': 15, 'font-weight': 700, fill: k >= 2 ? INK : MUT, opacity: k === 2 ? fade(u, 1.8) : 1 }); }

  // ---------- 3. static: 클래스에 하나 ----------
  const MA = { x: 30, y: 30, w: 430, h: 240 };
  function s3(t, c) { const { k, u } = c, sv = c.beat.staticView || {}, shared = sv.shared || {};
    area(MA.x, MA.y, MA.w, MA.h, 'Method Area', { col: WARN });
    area(490, 30, 440, 240, 'Heap', { col: ACC });
    const loaded = k >= 1, lu = k === 1 ? seg(u, 0.2, 1.0) : 1;
    // Player.class 판
    el('rect', { x: 50, y: 66, width: 390, height: 190, rx: 10, fill: PANEL, stroke: loaded ? WARN : GRID, 'stroke-width': 2, 'stroke-dasharray': loaded && lu >= 1 ? null : '6 5' });
    tx(66, 92, 'Player.class', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: loaded ? WARN : MUT });
    if (k === 1) fly(120, 400, 140, 88, lu, 'Player.class 로딩', { fill: WARN, mono: true });
    // static count 칸 (하나)
    let v = shared.value; if (k === 4) { const n = Math.min(3, Math.floor(seg(u, 0.5, 2.4) * 3 + 0.0001)); v = n; }
    const vs = typeof v === 'number' ? String(v) : '—';
    el('rect', { x: 66, y: 108, width: 230, height: 42, rx: 8, fill: k >= 4 ? WARNBG : PANEL, stroke: WARN, 'stroke-width': 2.5 });
    mono(80, 135, 'static int count', { 'font-size': 15, 'font-weight': 700 });
    mono(284, 136, vs, { 'font-size': 20, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
    if (k === 0) { tx(310, 135, '← 클래스에 1개', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
      tx(710, 150, 'String name은 객체마다 하나씩', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(710, 180, '아직 new를 한 번도 하지 않았다', fade(u, 1.4), { 'font-size': 14 }); }
    if (k >= 1) chip(66, 176, 'static { count = 0; … }', { fs: 13.5, stroke: k === 1 ? WARN : GRID, op: k === 1 ? fade(u, 0.9) : 1 });
    if (k >= 2) chip(66, 214, 'Player(String) { … count++; }', { fs: 13.5, stroke: k === 2 ? ACC : GRID, op: k === 2 ? fade(u, 0.2) : 1 });
    if (k === 2) { ref(240, 200, 230, 152, seg(u, 0.8, 1.6), { by: 0, bx: 40, dash: '5 4' }); sub(710, 150, '올리는 대상은 늘 그 하나', fade(u, 1.4), { 'font-size': 15 }); sub(710, 180, '아직 호출 전 — count는 0', fade(u, 1.8), { 'font-size': 14 }); }
    if (k >= 3) { chip(310, 176, 'getCount()', { fs: 13.5, stroke: k === 3 ? ACC : GRID, op: k === 3 ? fade(u, 0.2) : 1 }); }
    if (k === 3) { pill(700, 150, 'Player.getCount()', ACC, pop(u, 0.6), { mono: true });
      grow(620, 152, 400, 178, seg(u, 1.0, 1.7), ACC); tx(700, 340, '객체 없이 클래스 이름으로 부른다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); sub(700, 368, 'static 메서드에는 this가 없다', fade(u, 1.9), { 'font-size': 14 }); }
    // 인스턴스 셋
    const ins = sv.instances || [];
    const XS = [510, 650, 790];
    if (k >= 4) ['"전사"', '"마법사"', '"궁수"'].forEach((nm, i) => { const born = k === 4 ? seg(u, 0.3 + i * 0.65, 0.7 + i * 0.65) : 1;
      if (born <= 0) return;
      obj(XS[i], 80, 128, 'p' + (i + 1), [['name', null], [nm, null]], { op: born, rh: 28 });
      if (k === 4) dot([[XS[i] + 20, 110], [300, 130]], seg(u, 0.55 + i * 0.65, 1.05 + i * 0.65), WARN, 7);
      if (k === 5) { ref(XS[i] + 64, 80, 298, 122, seg(u, 0.3 + i * 0.2, 1.0 + i * 0.2), { col: MUT, by: -40, op: 0.7 }); mono(XS[i] + 64, 232, 'count = 3', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.2) }); } });
    // 콘솔
    const out = []; if (k >= 1) out.push('Player 클래스 로딩됨'); if (k === 5) out.push('3');
    terminal(MA.x, 290, 430, 120, out, k === 1 ? 1 * fade(u, 1.2) : k === 5 ? 1 + seg(u, 1.6, 2.2) : out.length, { title: 'console' });
    if (k === 1) tx(700, 350, 'static 블록은 로딩할 때 딱 한 번', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    if (k === 4) tx(700, 350, '세 객체가 한 칸을 세 번 올렸다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) });
    if (k === 5) tx(700, 350, 'Player.getCount() → 3', { 'font-size': 16, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.6) }); }

  // ---------- 4. 메모리 지도 ----------
  function s4(t, c) { const { k, u } = c;
    area(20, 30, 200, 260, 'Stack', {});
    area(240, 30, 400, 260, 'Heap', { col: ACC });
    area(660, 30, 280, 260, 'Method Area', { col: WARN });
    // 메서드영역: 클래스 정보 + static
    card(800, 110, 250, 70, { rx: 8, stroke: GRID, text: 'Player.class\n필드 목록 · 메서드 코드', fs: 14, fw: 600 });
    const hot = k === 3 || k === 5;
    el('rect', { x: 680, y: 175, width: 240, height: 44, rx: 8, fill: hot ? WARNBG : PANEL, stroke: WARN, 'stroke-width': 2.5 });
    mono(694, 203, 'static int count', { 'font-size': 15, 'font-weight': 700 }); mono(906, 204, '2', { 'font-size': 20, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
    if (k >= 5) { lock(800, 252, true, WARN); tx(824, 258, '로딩 내내 상주', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: k === 5 ? fade(u, 0.4) : 1 }); }
    // 힙 객체
    const gone = k >= 5, nul = k >= 4;
    const hp1 = k === 1 ? Math.round(tween(100, 50, u)) : k >= 1 ? 50 : 100;
    const p1op = gone ? 1 - E(u, 0.2, 1.4) : 1;
    if (p1op > 0.02) { const o1 = obj(370, 56, 210, 'Player', [['name', '"전사"'], ['hp', hp1, { hot: k === 1 && u > 0.2 }]],
        { addr: '@0x1A', op: p1op, dash: nul ? '6 5' : null, stroke: nul ? MUT : ACC });
      if (nul) tx(475, 162, gone ? 'GC가 회수' : 'GC 회수 대상', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: k === 4 ? fade(u, 1.3) : p1op }); }
    obj(370, 176, 210, 'Player', [['name', '"마법사"'], ['hp', 80, { hot: k === 2 && u > 1.3 }]], { addr: '@0x2B' });
    // 스택 변수
    const a = slot(110, 105, 'p1', nul ? 'null' : '•', { vcol: BAD, stroke: k === 4 ? BAD : INK });
    const b = slot(110, 225, 'p2', '•');
    if (!nul) ref(a.cx, a.y, 368, 90, 1, { by: -10 });
    if (k === 4) ref(a.cx, a.y, 368, 90, 1 - E(u, 0.2, 1.0), { by: -10, col: BAD });
    ref(b.cx, b.y, 368, 210, 1, { by: 10 });
    // 아래 줄: 콘솔과 표현식
    const lines = k === 2 ? ['50', '80'] : k === 3 ? ['2', '2', '2'] : [];
    terminal(20, 304, 330, 108, lines, k === 2 ? 2 * seg(u, 0.3, 1.8) : k === 3 ? 3 * seg(u, 1.5, 2.5) : 0, { title: 'console' });
    if (k === 2) { tx(500, 340, 'p1.hp → 50', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: WARN, opacity: fade(u, 0.5) }); tx(500, 372, 'p2.hp → 80', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: GOOD, opacity: fade(u, 1.2) }); }
    if (k === 3) ['Player.count', 'p1.count', 'p2.count'].forEach((s, i) => { const x = 420 + i * 175;
      pill(x, 352, s, i ? MUT : WARN, pop(u, 0.2 + i * 0.3), { mono: true, fs: 13.5 }); ref(x, 336, 760 + i * 30, 222, seg(u, 0.6 + i * 0.3, 1.3 + i * 0.3), { col: i ? MUT : WARN, by: -10 }); });
    if (k === 0) { tx(620, 360, 'new 한 번에 힙 한 자리', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); sub(620, 388, '클래스 정보는 메서드영역에 한 벌 · 주소는 예시', fade(u, 1.6)); }
    if (k === 1) tx(620, 360, 'p1 객체의 hp 칸만 바뀐다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    if (k === 4) tx(640, 360, '아무도 가리키지 않으면 회수된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
    if (k === 5) { tx(640, 350, '인스턴스는 회수돼도 static은 남는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(640, 378, 'static이 큰 객체를 물고 있으면 그 객체도 회수되지 않는다', fade(u, 1.8), { 'font-size': 14 }); } }

  // ---------- 5. 실무 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { // ① static 가변 상태
      area(30, 30, 330, 170, 'Method Area', { col: WARN });
      chip(50, 90, 'static List<Item> items', { fs: 14.5, stroke: k === 0 ? BAD : GRID, col: k === 0 ? BAD : MUT, strike: k === 1 });
      area(390, 30, 540, 170, 'Heap', { col: ACC });
      const n = k === 0 ? Math.round(lerp(0, 2, seg(u, 0.6, 1.6))) : 2;
      tx(420, 80, 'ArrayList (하나)', { 'font-size': 15, 'font-weight': 700, fill: ACC, class: 'mono' });
      R.cells(420, 100, ['A 담음', n > 1 ? 'A 담음' : '', '', ''].map((s, i) => (i < n ? s : '')), { w: 96, h: 40, fs: 13.5, mono: false, style: (i) => i < n ? { stroke: BAD, fill: BADBG } : { stroke: GRID } });
      ref(270, 90, 418, 120, 1, { by: -20, op: k === 1 ? 0.35 : 1 });
      if (k === 0) { person(120, 300, '테스트 A'); person(330, 300, '테스트 B');
        fly(150, 270, 470, 120, seg(u, 0.4, 1.4), '+ item', { fill: BAD });
        grow(360, 272, 560, 160, seg(u, 1.6, 2.3), BAD); tx(560, 300, 'B가 시작부터 A의 값을 본다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
        sub(560, 330, '여러 스레드가 함께 고치면 경쟁 조건도 생긴다', fade(u, 2.3), { 'font-size': 14 }); }
      if (k === 1) { chip(50, 140, 'static final int MAX_HP = 100', { fs: 14, stroke: GOOD, col: GOOD, op: fade(u, 0.2) }); lock(335, 140, true, GOOD, pop(u, 0.5));
        sub(195, 180, '변하지 않으니 공유해도 안전', fade(u, 0.8), { 'font-size': 14 });
        [0, 1].forEach((i) => { const x = 420 + i * 260, y = 250, s = pop(u, 1.0 + i * 0.4);
          obj(x, y, 230, 'Cart (' + (i ? 'B' : 'A') + ' 의 것)', [['items', '[ … ]']], { op: s, stroke: GOOD });
 });
        tx(560, 380, '가변 상태는 인스턴스 필드로 — 각자 자기 목록', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) }); }
      return; }
    if (k <= 3) { // ② static 메서드엔 this 가 없다
      area(30, 30, 380, 250, 'static void hello(…)', { col: k === 2 ? BAD : GOOD });
      el('rect', { x: 50, y: 70, width: 150, height: 40, rx: 8, fill: PANEL, stroke: k === 2 ? BAD : GRID, 'stroke-width': 2 });
      mono(66, 96, 'this', { 'font-size': 15, 'font-weight': 700, fill: k === 2 ? BAD : MUT }); mono(186, 96, k === 2 ? '없음' : '—', { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
      if (k === 2) cross(176, 90, 9, pop(u, 0.3));
      area(470, 30, 460, 250, 'Heap', { col: ACC });
      const o1 = obj(500, 80, 190, 'Player', [['name', '"전사"']]), o2 = obj(720, 80, 190, 'Player', [['name', '"마법사"']]);
      if (k === 2) { chip(50, 150, 'println(name);', { fs: 14.5, stroke: BAD, col: BAD, op: fade(u, 0.5) });
        [o1, o2].forEach((o, i) => { ref(190, 150, o.x + 95, o.y + o.h + 4, seg(u, 0.9 + i * 0.3, 1.6 + i * 0.3), { col: BAD, by: 80, dash: '6 5' });
          tx(o.x + 95, o.y + o.h + 52, '?', { 'font-size': 28, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.2) }); });
        chip(50, 320, 'error: non-static variable name cannot be referenced from a static context', { fs: 13.5, stroke: BAD, col: BAD, op: fade(u, 2.0), w: 860 });
        sub(220, 220, '어느 객체의 name 인가?', fade(u, 1.4), { 'font-size': 15, fill: BAD }); }
      if (k === 3) { chip(50, 150, 'hello(Player p)', { fs: 14.5, stroke: GOOD, col: GOOD, op: fade(u, 0.2) }); chip(50, 196, 'println(p.name);', { fs: 14.5, op: fade(u, 0.5) });
        slot(250, 150, 'p', '•', { op: fade(u, 0.6) }); ref(282, 150, o1.x, o1.cy(0), seg(u, 0.9, 1.7), { by: -20 });
        tx(595, 230, '"전사" 를 읽는다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); check(680, 225, 9, pop(u, 1.8));
        tx(480, 340, '대상을 인자로 받으면 static에서도 읽을 수 있다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
      return; }
    // ③ 초기화 순서
    area(30, 30, 420, 230, 'Player.java', {});
    chip(50, 90, 'int hp = 1;', { fs: 15, stroke: WARN });
    chip(50, 150, 'Player() { this.hp = 100; }', { fs: 15, stroke: k === 5 ? GOOD : GRID, op: k === 5 ? 1 : 0.55 });
    area(490, 30, 440, 230, 'Heap', { col: ACC });
    const hp = k === 4 ? 1 : (u < 0.6 ? 1 : Math.round(tween(1, 100, u - 0.5)));
    obj(560, 90, 280, 'Player', [['hp', hp, { hot: true, vcol: hp === 1 ? WARN : GOOD }]], { op: k === 4 ? fade(u, 0.2) : 1 });
    if (k === 4) { grow(200, 90, 556, 140, seg(u, 0.5, 1.3), WARN); sub(700, 200, '여기까지만 보면 hp는 1', fade(u, 1.5), { 'font-size': 15 }); }
    if (k === 5) { grow(330, 150, 556, 150, seg(u, 0.2, 0.8), GOOD); tx(700, 210, '버그가 아니라 정해진 순서', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    order(50, 320, k === 4 ? 1 : 2, ['1', '100']); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'Player p1, p2를 new로 만든 뒤 p1.hp = 50을 하면 p2.hp는 무엇인가?',
      o: ['50, 같은 설계도에서 나왔으니 함께 바뀐다', '80, 객체마다 hp 칸이 따로 있다', '0, 값이 초기화된다'], a: 1,
      why: 'new는 힙에 객체를 하나씩 따로 만든다. p1의 hp 칸만 50이 되고 p2의 hp 칸은 80 그대로다.' },
    { q: 'new Player("전사")로 만든 객체의 hp가 100이 되는 까닭은 무엇인가?',
      o: ['필드 선언 int hp = 1이 마지막에 적용되기 때문이다', '간편 생성자가 this(name, 100)으로 위임하고 그 생성자 본문이 hp를 덮기 때문이다', 'JVM이 int의 기본값으로 100을 넣기 때문이다'], a: 1,
      why: '필드 초기값 1이 먼저 들어가고, 위임받은 Player(String, int) 본문이 this.hp = 100으로 덮는다.' },
    { q: 'new Player를 세 번 한 뒤 Player.getCount()가 3을 돌려주는 이유는 무엇인가?',
      o: ['count가 static이라 클래스에 한 칸뿐이고 세 생성자가 그 칸을 올렸기 때문이다', '세 객체가 각자 count를 갖고 마지막 객체의 값을 읽기 때문이다', 'static 블록이 객체마다 한 번씩 실행되기 때문이다'], a: 0,
      why: 'static 필드는 클래스에 하나만 있다. 생성자의 count++ 세 번이 모두 그 한 칸에 쌓인다.' },
    { q: 'p1 = null을 한 뒤 메모리에서 일어나는 일은 무엇인가?',
      o: ['static count도 0으로 돌아간다', 'p2 객체까지 함께 회수된다', '@0x1A 객체는 GC 회수 대상이 되고 static count는 그대로 남는다'], a: 2,
      why: '힙 객체의 수명은 참조가 정한다. 메서드영역의 count는 클래스가 로딩돼 있는 동안 남는다.' },
    { q: 'static void hello() 안에서 println(name)이 컴파일되지 않는 이유는 무엇인가?',
      o: ['name이 private이기 때문이다', 'static 메서드에는 this가 없어 어느 객체의 name인지 정할 수 없기 때문이다', 'println이 static 메서드라서 그렇다'], a: 1,
      why: 'static 메서드는 특정 인스턴스에 매여 있지 않다. hello(Player p)처럼 대상을 인자로 받아야 한다.' },
  ];

  const summary = [
    '클래스는 설계도일 뿐이고 값은 new가 힙에 만든 객체마다 따로 담긴다.',
    '생성자가 여럿이면 this(...)로 한 생성자에 모아 대입은 한 곳에서만 한다.',
    '필드 초기값이 먼저 들어가고 생성자 본문이 그 값을 덮는다.',
    'static 필드는 메서드영역에 클래스당 하나라 모든 객체가 같은 칸을 본다.',
  ];
  const review = [
    { q: '테스트를 하나씩 돌리면 통과하는데 한꺼번에 돌리면 장바구니 개수가 어긋난다. 먼저 의심할 것은?',
      o: ['생성자 체이닝 순서', '장바구니 목록이 static 필드에 들어 있는지', 'this를 빠뜨린 대입문'], a: 1,
      why: 'static 가변 목록은 모든 테스트가 같은 한 칸을 쓴다. 앞 테스트가 담은 값이 뒤 테스트로 샌다.' },
    { q: 'int hp = 1로 선언하고 생성자에서 this.hp = 100을 했다. new 직후 hp를 출력하면?',
      o: ['100', '1', '101'], a: 0,
      why: '필드 초기값 1이 먼저 들어가고 생성자 본문이 100으로 덮는다. 최종값은 생성자가 정한다.' },
    { q: 'Player 객체 3개가 만들어졌고 그중 하나를 null로 끊었다. Player.count와 남은 객체의 수는?',
      o: ['count는 2, 객체는 2개', 'count는 3, 객체는 3개 모두 영구 보존', 'count는 3, 회수될 수 있는 객체는 1개'], a: 2,
      why: 'count는 메서드영역에 남아 3을 유지한다. 참조가 끊긴 객체 하나만 GC가 회수할 수 있다.' },
  ];

  R.page({ title: 'Player 객체와 메모리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
