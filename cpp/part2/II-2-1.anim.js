/* II-2-1 const — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 메모리 칸과 그 칸에 닿는 이름(접근 경로)마다 자물쇠를 단다. 출력 줄과 컴파일 에러 문구는 페이지 코드를 zig c++(clang)로 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, pill, banner, fly, dot, zone, cross, check, lock, terminal, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const mx = (x1 + x2) / 2;
    el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, pathLength: 100,
      'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash, opacity: o.op ?? 1, 'marker-end': u >= 1 && !o.plain ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const term = (lines, shown, o) => terminal(610, 306, 326, 108, lines, shown, Object.assign({ title: '출력' }, o || {}));
  // 메모리 칸: 이름은 위, 값은 가운데
  function mem(cx, cy, name, val, o) { o = o || {};
    card(cx, cy, o.w || 110, 54, { rx: 8, text: String(val), fs: 22, mono: true, stroke: o.stroke || INK, sw: 2.5, fill: o.fill, s: o.s ?? 1 });
    if (name) mono(cx, cy - 36, name, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: o.s ?? 1 }); }
  // 이름표 (접근 경로): 왼쪽 위 기준. 자물쇠가 잠겼으면 읽기 전용
  function handle(x, y, decl, locked, o) { o = o || {}; const w = o.w || tw(decl, 15) + 70;
    card(x + w / 2, y, w, 42, { rx: 21, stroke: locked ? INFO : INK, fill: locked ? INFOBG : PANEL, sw: 2, s: o.s, op: o.op });
    mono(x + 18, y + 5, decl, { 'font-size': 15, 'font-weight': 700, opacity: (o.s ?? 1) * (o.op ?? 1) });
    lock(x + w - 24, y + 2, locked, locked ? INFO : MUT, (o.s ?? 1) * 0.9); return x + w; }
  // 튕겨 나가는 쓰기 시도: a→b 로 가다 f=0.6 지점에서 되돌아온다
  function bounce(ax, ay, bx, by, u, text) { if (u <= 0 || u >= 1) return; const f = u < 0.6 ? u / 0.6 : 1 - (u - 0.6) / 0.4 * 0.5;
    card(lerp(ax, bx, f * 0.85), lerp(ay, by, f * 0.85), tw(text, 14) + 22, 28, { rx: 14, fill: BAD, stroke: 'none', text, fs: 14, mono: true, color: PANEL }); }

  // ---------- 1. const 변수와 const 참조 ----------
  function s1(t, c) { const { k, u } = c, MX = 640, MY = 100, XX = 640, XY = 250;
    // max
    handle(60, MY, 'const int max', true, { s: k === 0 ? pop(u, 0.2) : 1 });
    arrow(310, MY, MX - 60, MY, k === 0 ? E(u, 0.6, 1.1) : 1, INFO, { plain: true });
    mem(MX, MY, 'max', 100, { s: k === 0 ? pop(u, 0.9) : 1, stroke: INFO });
    lock(MX + 72, MY - 6, true, INFO, k === 0 ? pop(u, 1.4) : 1);
    if (k === 0) note(400, 160, '이 이름으로 쓰는 길이 닫혔다', fade(u, 1.8), { fill: INFO });
    if (k === 1) { for (let i = 0; i < 3; i++) dot([[MX + 56, MY], [800, MY], [800, 340]], seg(u, 0.3 + i * 0.25, 1.3 + i * 0.25), GOOD, 6);
      check(820, MY, 10, pop(u, 0.4)); note(840, MY + 5, '읽기', fade(u, 0.4), { fill: GOOD }); }
    if (k === 2) { bounce(330, MY + 40, MX, MY + 10, seg(u, 0.2, 1.4), 'max = 200');
      cross(MX - 70, MY + 30, 12, pop(u, 1.0));
      card(480, 190, 600, 46, { rx: 10, stroke: BAD, fill: BADBG, text: "error: cannot assign to variable 'max' with const-qualified type", fs: 14, mono: true, s: pop(u, 1.3) });
      sub(480, 236, '실행 파일이 만들어지기 전에 멈춘다', fade(u, 1.8), { 'font-size': 15, fill: INK }); }
    // x 와 r
    if (k >= 3) { const s3 = k === 3;
      handle(60, XY - 34, 'int x', false, { s: s3 ? pop(u, 0.2) : 1, w: 210 });
      handle(60, XY + 34, 'const int& r', true, { s: s3 ? pop(u, 0.9) : 1, w: 210 });
      const xv = k === 4 ? Math.round(tween(10, 20, seg(u, 1.0, 1.8), 0.6)) : 10;
      arrow(270, XY - 34, XX - 60, XY - 8, s3 ? E(u, 0.4, 0.9) : 1, INK, { plain: true });
      arrow(270, XY + 34, XX - 60, XY + 8, s3 ? E(u, 1.1, 1.6) : 1, INFO, { plain: true, dash: '6 5' });
      mem(XX, XY, 'x · 칸 하나', xv, { s: s3 ? pop(u, 0.3) : 1, stroke: k === 4 && u > 1 && u < 2 ? ACC : INK });
      if (s3) note(720, XY + 6, '복사 없음 · r은 같은 칸의 다른 이름', fade(u, 1.8), { fill: INFO });
      if (k === 4) { bounce(270, XY + 34, XX - 60, XY + 8, seg(u, 0.1, 0.9), 'r = 20'); cross(470, XY + 40, 11, pop(u, 0.6));
        fly(270, XY - 34, XX - 70, XY - 10, seg(u, 0.9, 1.5), 'x = 20', { mono: true, fill: ACC });
        note(720, XY + 6, 'r로 읽으면 20', fade(u, 2.0), { fill: GOOD }); } }
    const lines = ['100', '10', '20'], shown = k === 0 ? 0 : k === 1 ? E(u, 1.0, 1.6) : k === 2 ? 1 : k === 3 ? 1 + E(u, 2.0, 2.5) : 2 + E(u, 2.1, 2.6);
    if (k >= 1) term(lines, shown); }

  // ---------- 2. 포인터와 const: * 를 경계로 ----------
  const AX2 = 760, AY2 = 120, BY2 = 260;
  const PV = [{ y: 78, name: 'p1', parts: [['const int', INFO], ['* ', INK], ['p1', INK]], tLock: true, pLock: false },
    { y: 178, name: 'p2', parts: [['int', INK], ['* ', INK], ['const', WARN], [' p2', INK]], tLock: false, pLock: true },
    { y: 278, name: 'p3', parts: [['const int', INFO], ['* ', INK], ['const', WARN], [' p3', INK]], tLock: true, pLock: true }];
  function pslot(v, s, aim, o) { o = o || {}; const x = 40, w = 330;
    card(x + w / 2, v.y, w, 46, { rx: 8, stroke: v.pLock ? WARN : INK, fill: v.pLock ? WARNBG : PANEL, sw: 2, s });
    spans(x + 14, v.y + 6, v.parts.map(([str, col]) => [str, { fill: col, 'font-weight': 700 }]), { 'font-size': 16, opacity: s });
    if (v.pLock) lock(x + w - 52, v.y + 2, true, WARN, s * 0.85);
    el('circle', { cx: x + w - 18, cy: v.y, r: 6, fill: ACC, opacity: s });
    const ty = aim === 'b' ? BY2 : AY2; arrow(x + w - 18, v.y, AX2 - 62, ty + (o.dy || 0), o.u ?? 1, v.tLock ? INFO : ACC, { dash: v.tLock ? '6 5' : null, op: o.op ?? 1 });
    if (v.tLock && (o.u ?? 1) >= 1) lock(AX2 - 84, ty + (o.dy || 0) - 14, true, INFO, 0.75 * s); }
  function s2(t, c) { const { k, u } = c;
    const av = k >= 2 && !(k === 2 && u < 1.0) ? (k === 2 ? Math.round(tween(1, 5, seg(u, 1.0, 1.6), 0.5)) : 5) : 1;
    mem(AX2, AY2, 'a', av, { s: k === 0 ? pop(u, 0.2) : 1, stroke: k === 2 && u > 1 && u < 2 ? ACC : INK });
    mem(AX2, BY2, 'b', 2, { s: k === 0 ? pop(u, 0.4) : 1 });
    if (k === 0) { lock(100, 170, true, INFO, pop(u, 1.0)); tx(130, 176, '* 왼쪽 const → 가리키는 값이 잠긴다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
      lock(100, 240, true, WARN, pop(u, 1.6)); tx(130, 246, '* 오른쪽 const → 포인터가 잠긴다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      sub(480, 380, 'const를 기준으로 오른쪽에서 왼쪽으로 읽는다', fade(u, 2.1), { 'font-size': 15, fill: INK }); return; }
    // p1: 처음엔 a, k1 끝에 b 로
    const p1toB = k === 1 ? u > 1.7 : true, p1mv = k === 1 ? E(u, 1.6, 2.2) : 1;
    pslot(PV[0], k === 1 ? pop(u, 0.2) : 1, p1toB ? 'b' : 'a', { dy: 0, u: k === 1 ? (u < 1.6 ? E(u, 0.3, 0.8) : p1mv) : 1 });
    if (k === 1) { bounce(370, PV[0].y, AX2 - 60, AY2, seg(u, 0.6, 1.5), '*p1 = 5'); cross(560, 100, 11, pop(u, 1.1));
      tx(480, 345, u < 1.6 ? '*p1 = 5  값 쓰기는 막힌다' : 'p1 = &b  다른 곳을 가리키는 건 된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: u < 1.6 ? BAD : GOOD }); }
    if (k >= 2) pslot(PV[1], k === 2 ? pop(u, 0.2) : 1, 'a', { dy: 10, u: k === 2 ? E(u, 0.3, 0.8) : 1 });
    if (k === 2) { fly(370, PV[1].y, AX2 - 60, AY2 + 10, seg(u, 0.6, 1.1), '*p2 = 5', { mono: true, fill: ACC });
      bounce(200, PV[1].y + 30, 200, BY2, seg(u, 1.5, 2.5), 'p2 = &b'); cross(300, 226, 10, pop(u, 2.0));
      tx(480, 345, '값은 바뀌고 a = 5, 가리키는 곳은 못 바꾼다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.2) }); }
    if (k >= 3) pslot(PV[2], k === 3 ? pop(u, 0.2) : 1, 'a', { dy: 22, u: k === 3 ? E(u, 0.3, 0.8) : 1 });
    if (k === 3) { bounce(370, PV[2].y, AX2 - 60, AY2 + 22, seg(u, 0.6, 1.5), '*p3 = 5'); cross(570, 180, 10, pop(u, 1.2));
      tx(480, 345, '값도 포인터도 잠겼다 · 남은 건 읽기', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) }); }
    if (k === 4) { for (let i = 0; i < 3; i++) dot([[AX2 + 56, AY2], [880, AY2], [880, 320]], seg(u, 0.3 + i * 0.25, 1.3 + i * 0.25), GOOD, 6);
      term(['5'], E(u, 1.2, 1.7)); } }

  // ---------- 3. const 멤버 함수와 mutable ----------
  const OX = 600, OY = 150;
  function basket(items, reads, o) { o = o || {};
    zone(OX - 200, OY - 100, 400, 210, 'Basket 객체', { fill: PANEL, stroke: INK, sw: 2 });
    tx(OX - 180, OY - 34, 'items_', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: o.itemsLocked ? INFO : INK });
    for (let i = 0; i < 4; i++) card(OX - 30 + i * 52, OY - 40, 46, 40, { rx: 5, text: items[i] != null ? String(items[i]) : '', fs: 15, mono: true, stroke: items[i] != null ? INK : GRID });
    if (o.itemsLocked) lock(OX + 186, OY - 42, true, INFO, o.itemsLocked);
    tx(OX - 180, OY + 46, 'reads_', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    pill(OX - 50, OY + 40, 'mutable', WARN, o.mut ?? 1, { fs: 13.5 });
    card(OX + 110, OY + 40, 70, 40, { rx: 5, text: String(reads), fs: 18, mono: true, stroke: o.readsHot ? WARN : INK, sw: o.readsHot ? 3 : 2 }); }
  function door(x, y, sig, col, s, o) { o = o || {}; card(x, y, tw(sig, 14.5) + 30, 38, { rx: 8, text: sig, fs: 14.5, mono: true, stroke: col, sw: 2, s, fill: o.fill }); }
  function s3(t, c) { const { k, u } = c;
    const items = k === 5 ? [u > 0.6 ? 10 : null, u > 1.1 ? 20 : null] : [];
    const reads = k === 3 ? Math.round(tween(0, 1, seg(u, 1.0, 1.6), 0.4)) : k === 4 ? 1 : k === 5 ? (u > 2.0 ? 1 : 0) : 0;
    basket(items, reads, { itemsLocked: k === 2 || k === 3 ? (k === 2 ? pop(u, 0.9) : 1) : 0, mut: k === 0 ? pop(u, 1.2) : 1, readsHot: k === 3 && u > 1 });
    if (k === 0) { note(40, 330, 'items_는 진짜 상태 · reads_는 조회 횟수', fade(u, 1.5)); return; }
    if (k === 1) { door(160, 90, 'void add(int x)', INK, pop(u, 0.2)); fly(250, 90, OX - 30, OY - 40, seg(u, 0.8, 1.7), 'x', { mono: true, fill: ACC });
      note(40, 330, '상태를 바꾸므로 const를 붙일 수 없다', fade(u, 1.8)); return; }
    if (k === 2 || k === 3) { door(170, 210, 'int size() const', INFO, k === 2 ? pop(u, 0.2) : 1, { fill: INFOBG });
      mono(40, 300, 'this : const Basket*', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: k === 2 ? fade(u, 0.6) : 1 });
      if (k === 2) { for (let i = 0; i < 2; i++) dot([[OX - 30, OY - 40], [260, 210]], seg(u, 1.2 + i * 0.3, 2.0 + i * 0.3), GOOD, 6);
        note(40, 340, '읽기는 되고 items_ 수정은 컴파일이 막는다', fade(u, 1.8)); }
      else { fly(260, 210, OX + 110, OY + 40, seg(u, 0.3, 1.0), 'reads_++', { mono: true, fill: WARN });
        note(40, 340, 'const 함수 안이지만 mutable이라 바뀐다', fade(u, 1.6), { fill: WARN }); }
      return; }
    if (k === 4) { zone(24, 220, 300, 186, 'print(const Basket& b)', { fill: INFOBG, stroke: INFO, sw: 2 });
      door(174, 290, 'b.size()', GOOD, pop(u, 0.3)); check(290, 290, 10, pop(u, 0.6));
      door(174, 350, 'b.add(1)', BAD, pop(u, 0.9)); cross(290, 350, 10, pop(u, 1.2));
      card(620, 340, 560, 54, { rx: 10, stroke: BAD, fill: BADBG, text: "error: 'this' argument to member function 'add'\nhas type 'const Basket', but function is not marked const", fs: 13.5, mono: true, s: pop(u, 1.5) });
      return; }
    // k5: main
    [['bk.add(10);', 0.2], ['bk.add(20);', 0.7], ['print(bk);', 1.3]].forEach(([s, d], i) => mono(40, 90 + i * 44, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, d) }));
    if (u > 1.3) arrow(150, 178, OX - 200, OY + 40, E(u, 1.4, 1.9), INFO, { dash: '6 5' });
    term(['2'], E(u, 2.1, 2.5)); note(40, 360, 'print 안에서는 읽기 전용 창구로 좁혀진다', fade(u, 1.9), { fill: INFO }); }

  // ---------- 4. 함수 경계의 const 참조 ----------
  const NAME = [...'Ada Lovelace'], SX = 380, SY = 70;
  function strCells(x, y, o) { o = o || {}; const n = o.n ?? 12;
    NAME.forEach((ch, i) => { const on = i < n; card(x + i * 34 + 15, y + 19, 30, 38, { rx: 4, text: on ? ch : '', fs: 15, mono: true, stroke: on ? (o.col || INK) : GRID, sw: 1.8, fill: o.fill }); }); }
  function s4(t, c) { const { k, u } = c;
    zone(SX - 20, SY - 40, 450, 100, k >= 2 ? 'User u의 name_' : '원본 문자열', { fill: SOFT });
    strCells(SX, SY);
    if (k === 0) { zone(24, 190, 330, 130, 'lenSlow(std::string s)', { fill: BADBG, stroke: BAD, sw: 2, op: fade(u, 0.1) });
      strCells(SX, 224, { n: Math.floor(E(u, 0.6, 2.0) * 12.99), col: BAD });
      el('line', { x1: 354, y1: 250, x2: SX - 8, y2: 250, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      mono(44, 270, `s : 새 문자열 · ${Math.floor(E(u, 0.6, 2.0) * 12.99)}글자 복사`, { 'font-size': 15, 'font-weight': 700, fill: BAD });
      note(40, 380, '호출할 때마다 다시 베낀다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 1) { zone(24, 190, 330, 130, 'lenFast(const std::string& s)', { fill: INFOBG, stroke: INFO, sw: 2 });
      arrow(300, 255, SX + 180, SY + 42, E(u, 0.4, 1.1), INFO, { dash: '6 5' }); lock(320, 230, true, INFO, pop(u, 1.0));
      mono(44, 270, 's : 원본을 보는 이름 · 0글자 복사', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      bounce(330, 340, SX + 100, SY + 42, seg(u, 1.4, 2.4), 's[0] = …'); return; }
    // k2~4: User 와 name()
    zone(24, 30, 310, 110, 'main', { fill: SOFT }); mono(44, 92, 'User u("Ada Lovelace")', { 'font-size': 15, 'font-weight': 700 });
    if (k >= 2) { door2(170, 200, 'const std::string& name() const', k === 2 ? pop(u, 0.2) : 1);
      arrow(330, 200, SX + 200, SY + 42, k === 2 ? E(u, 0.6, 1.2) : 1, INFO, { dash: '6 5' }); lock(355, 178, true, INFO, k === 2 ? pop(u, 1.2) : 1); }
    if (k === 2) { bounce(170, 230, SX + 120, SY + 42, seg(u, 1.4, 2.4), 'u.name()[0] = …'); note(40, 300, '참조로 보여 주되 고칠 수는 없다', fade(u, 1.6), { fill: INFO }); }
    if (k === 3) { for (let i = 0; i < 3; i++) dot([[SX + 200, SY + 40], [SX + 200, 280], [700, 330]], seg(u, 0.3 + i * 0.25, 1.3 + i * 0.25), GOOD, 6);
      term(['Ada Lovelace'], E(u, 1.3, 1.9)); note(40, 300, '출력까지 복사 0번', fade(u, 1.8), { fill: GOOD }); }
    if (k === 4) { zone(24, 250, 330, 90, 'lenFast(const std::string& s)', { fill: INFOBG, stroke: INFO, sw: 2 });
      arrow(320, 300, SX + 260, SY + 42, E(u, 0.4, 1.0), INFO, { dash: '6 5' });
      NAME.forEach((_, i) => { if (u > 1.0 + i * 0.07) mono(SX + i * 34 + 15, SY + 60, String(i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      term(['Ada Lovelace', '12'], 1 + E(u, 2.0, 2.4)); note(40, 380, 'const 참조끼리 이어져 복사 없이 길이 12', fade(u, 2.2), { fill: GOOD }); } }
  function door2(cx, cy, sig, s) { card(cx, cy, tw(sig, 14) + 26, 40, { rx: 8, text: sig, fs: 14, mono: true, stroke: INFO, fill: INFOBG, sw: 2, s }); }

  // ---------- 5. const 를 무너뜨리는 네 가지 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(240, 52, 'bad1(std::string s)', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: BAD, 'text-anchor': 'middle' });
      tx(720, 52, 'fix1(const std::string& s)', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: GOOD, 'text-anchor': 'middle' });
      card(480, 120, 160, 48, { rx: 8, text: '원본 문자열', fs: 15, stroke: INK });
      const n = Math.floor(E(u, 0.3, 2.0) * 3.99);
      for (let i = 0; i < n; i++) { card(160 + i * 40, 230 - i * 14, 150, 44, { rx: 8, text: `사본 ${i + 1}`, fs: 15, stroke: BAD, fill: BADBG }); }
      arrow(400, 130, 230, 200, E(u, 0.3, 0.8), BAD, { dash: '5 4' });
      mono(240, 330, `호출 ${n}번 → 사본 ${n}개`, { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      for (let i = 0; i < n; i++) arrow(700 + i * 30, 230, 560, 130, 1, GOOD, { dash: '6 5', sw: 2 });
      mono(720, 330, `호출 ${n}번 → 사본 0개`, { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); return; }
    if (k === 1) { zone(60, 40, 400, 330, 'const Box& 로 받았을 때', { fill: INFOBG, stroke: INFO, sw: 2 });
      const fixed = u > 1.4;
      door(260, 140, fixed ? 'int size() const' : 'int size()', fixed ? GOOD : BAD, 1, { fill: PANEL });
      if (!fixed) { cross(400, 140, 11, pop(u, 0.5)); note(90, 220, 'const 객체에서는 부를 수 없다', fade(u, 0.6), { fill: BAD }); }
      else { check(410, 140, 11, pop(u, 1.5)); note(90, 220, 'const를 붙이면 창구가 열린다', fade(u, 1.5), { fill: GOOD }); }
      card(700, 140, 200, 70, { rx: 10, text: 'Box\nn_ = 0', fs: 16, mono: true, stroke: INK });
      if (fixed) for (let i = 0; i < 2; i++) dot([[600, 140], [370, 140]], seg(u, 1.7 + i * 0.3, 2.4 + i * 0.3), GOOD, 6);
      sub(260, 300, '읽기만 하는 함수에 const가 빠지면', 1, { 'font-size': 14.5 }); sub(260, 324, '그 타입을 쓰는 const 경로가 모두 막힌다', 1, { 'font-size': 14.5 }); return; }
    if (k === 2) { const open = seg(u, 0.6, 1.2);
      mem(480, 150, 'const int c', 10, { stroke: INFO, w: 130 }); lock(570, 144, open < 0.5, open < 0.5 ? INFO : BAD, 1);
      pill(480, 70, 'const_cast<int&>(c) = 5', BAD, pop(u, 0.2), { mono: true, fs: 15 });
      if (u > 1.2) { card(480, 270, 620, 74, { rx: 12, stroke: BAD, fill: BADBG, sw: 2.5, text: '미정의 동작 (UB)\n어떤 결과가 나올지 표준이 보장하지 않는다', fs: 16, s: pop(u, 1.3) }); }
      sub(480, 370, 'const_cast는 낡은 API에 넘길 때 벗기기만 하고 쓰지 않는다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    // k3: p 와 q
    const av = Math.round(tween(1, 5, seg(u, 1.6, 2.2), 0.4));
    mem(760, 120, 'a', av, { stroke: u > 1.6 && u < 2.4 ? ACC : INK }); mem(760, 260, 'b', 2);
    const pTo = E(u, 0.4, 1.0);
    pslot({ y: 110, parts: [['const int', INFO], ['* ', INK], ['p', INK]], tLock: true, pLock: false }, 1, pTo > 0.5 ? 'b' : 'a', { u: 1 });
    pslot({ y: 260, parts: [['int', INK], ['* ', INK], ['const', WARN], [' q', INK]], tLock: false, pLock: true }, 1, 'a', { dy: 12, u: 1 });
    mono(40, 175, 'p = &b;  ✓   *p = 5  ✕', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
    mono(40, 325, '*q = 5;  ✓   q = &b  ✕', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
    fly(370, 260, 698, 122, seg(u, 1.2, 1.7), '*q = 5', { mono: true, fill: ACC });
    sub(480, 400, '위치를 바꾸면 잠기는 대상이 뒤집힌다', fade(u, 2.2), { 'font-size': 15, fill: INK }); }

  const quiz = [
    { q: 'const int& r = x; 뒤에 x = 20; 을 하면 r로 읽은 값은 무엇인가?',
      o: ['10, r은 만들 때 값을 복사해 두었다', '20, r은 같은 칸을 보는 읽기 전용 이름이다', '컴파일 에러가 난다'], a: 1,
      why: 'const 참조는 복사하지 않고 x의 칸을 가리킨다. r로 쓰는 길만 막혔을 뿐이라 x로 바꾼 20이 r로도 보인다.' },
    { q: 'int* const p2 = &a; 에서 허용되는 것은 무엇인가?',
      o: ['*p2 = 5; 로 a의 값을 바꾸기', 'p2 = &b; 로 다른 곳 가리키기', '둘 다 막힌다'], a: 0,
      why: 'const가 * 오른쪽에 있어 포인터 자신이 잠겼다. 가리키는 값은 잠기지 않아 a가 5가 된다.' },
    { q: 'print(const Basket& b) 안에서 b.add(1)이 막히는 이유는 무엇인가?',
      o: ['add가 private이라서', 'b가 복사본이라서', 'add에 const가 없어 const 객체에서 부를 수 없어서'], a: 2,
      why: 'const 참조로 받은 객체에는 const 멤버 함수만 부를 수 있다. size() const는 되고 add는 컴파일 에러다.' },
    { q: 'lenFast(u.name())에서 문자열 "Ada Lovelace" 가 복사되는 횟수는?',
      o: ['0번', '1번', '2번'], a: 0,
      why: 'name()은 const 참조를 돌려주고 lenFast는 const 참조로 받는다. 같은 칸을 이어 보기만 해서 복사 없이 12를 얻는다.' },
    { q: 'const int c = 10; 을 const_cast<int&>(c) = 5; 로 바꾸면 어떻게 되나?',
      o: ['c가 안전하게 5가 된다', '미정의 동작이라 결과를 보장할 수 없다', '컴파일 에러가 난다'], a: 1,
      why: '컴파일은 통과하지만 진짜 const 객체를 고치는 것은 미정의 동작이다. const_cast는 벗기기만 하고 쓰지 않을 때만 쓴다.' },
  ];

  const summary = [
    'const는 값을 얼리기보다 그 이름으로 쓰는 길을 컴파일 단계에서 막는다.',
    '포인터는 * 왼쪽 const가 가리키는 값을, 오른쪽 const가 포인터 자신을 잠근다.',
    '읽기만 하는 멤버 함수에 const를 붙여야 const 참조로 받은 객체에서도 부를 수 있다.',
    '큰 객체는 const T& 로 받고 돌려주면 복사 없이 읽기 전용으로 이어진다.',
  ];
  const review = [
    { q: 'void show(const Report& r) 안에서 r.title()을 불렀더니 컴파일 에러가 났다. title()은 멤버를 읽기만 한다. 고칠 곳은?',
      o: ['title() 뒤에 const를 붙인다', 'show의 인자를 Report r로 바꾼다', 'const_cast로 r의 const를 벗긴다'], a: 0,
      why: 'const 참조로 받은 객체에는 const 멤버 함수만 열린다. 값으로 받으면 복사가 생기고 const_cast는 문제를 숨길 뿐이다.' },
    { q: '설정값 배열을 가리키며 위치는 옮겨 다니되 값은 절대 고치지 않을 포인터가 필요하다. 알맞은 선언은?',
      o: ['int* const p', 'const int* p', 'int* p'], a: 1,
      why: '* 왼쪽 const는 가리키는 값을 잠그고 포인터는 움직이게 둔다. int* const는 정반대로 위치가 고정된다.' },
    { q: '로그 함수 log(std::string msg)가 초당 수만 번 불려 느리다. 메시지는 읽기만 한다. 가장 먼저 할 일은?',
      o: ['msg를 std::string& 로 바꾼다', 'msg를 const std::string& 로 바꾼다', 'msg 앞에 mutable을 붙인다'], a: 1,
      why: '값 전달은 호출마다 문자열을 베낀다. const 참조는 복사를 없애고 함수가 원본을 고치지 못하게도 막는다.' },
  ];

  R.page({ title: '메모리 들여다보기 · const', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
