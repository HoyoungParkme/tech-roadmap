/* IV-1-1 auto·구조적 바인딩 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 출력값(1, 25, "…?", "…!", 7 Ada, 102030, 100, apple: 3, 4)은 코드 블록을 zig c++ -std=c++20 으로 돌려 확인했다.
 * 주소 0x1000 · 0x2000 은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cells, cross, check, lock, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 이름표 (변수 이름) — 판 위에 붙는 작은 꼬리표
  function tag(cx, cy, s, col, sc, op) { return pill(cx, cy, s, col || INK, sc, { mono: true, fs: 14, fill: PANEL, op }); }

  // ---------- 1. auto 기본 추론 ----------
  const ROWS = [
    ['auto n  = 42;', 'int'],
    ['auto pi = 3.14;', 'double'],
    ['auto s  = std::string("hi");', 'std::string'],
    ['auto it = v.begin();', 'vector<int>::iterator'],
    ['auto square = [](int a){…};', '(이름 없는 타입)'],
    ['auto x;', '?'],
  ];
  const SHOW = [1, 3, 4, 5, 6];
  function s1(t, c) { const { k, u } = c;
    zone(20, 18, 548, 344, '초기화식  →  컴파일러가 정한 타입');
    const n = SHOW[k], p = k ? SHOW[k - 1] : 0;
    for (let i = 0; i < n; i++) { const y = 70 + i * 50, fresh = i >= p, a = fresh ? 0.2 + (i - p) * 0.55 : -9, bad = i === 5;
      mono(38, y + 5, ROWS[i][0], { 'font-size': 15, fill: bad ? BAD : INK, opacity: fresh ? fade(u, a, 0.3) : 1 });
      const g = fresh ? E(u, a + 0.3, a + 0.8) : 1;
      grow(300, y, 340, y, g, bad ? BAD : MUT);
      if (g >= 1) { if (bad) { pill(448, y, '추론 불가', BAD, pop(u, a + 0.8), { fs: 14 }); cross(530, y, 9, pop(u, a + 0.9)); }
        else pill(452, y, ROWS[i][1], i >= 3 ? ACC : INK, fresh ? pop(u, a + 0.8) : 1, { mono: true, fs: 14, fill: i >= 3 ? ACCBG : PANEL }); } }
    // 오른쪽: 이번 줄 자세히
    zone(588, 18, 352, 344, '이 줄을 자세히');
    if (k === 0) { card(660, 150, 76, 50, { rx: 8, text: '42', fs: 22, mono: true, fw: 800, s: pop(u, 0.2) });
      sub(660, 196, '정수 리터럴', fade(u, 0.4));
      grow(702, 150, 770, 150, E(u, 0.6, 1.1), ACC);
      card(850, 150, 120, 56, { rx: 8, stroke: ACC, sw: 2.5, s: pop(u, 1.1) });
      mono(850, 145, 'n', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) });
      mono(850, 166, 'int', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
      note(612, 262, '타입은 컴파일할 때 정해진다', fade(u, 1.8)); note(612, 290, '실행 중에 따지는 비용은 0', fade(u, 2.1), { fill: MUT }); }
    if (k === 1) { [['3.14', 'double', 96], ['std::string("hi")', 'std::string', 232]].forEach(([a, b, y], i) => { const d = 0.2 + i * 0.7;
        card(690, y, tw(a, 15) + 26, 42, { rx: 8, text: a, fs: 15, mono: true, s: pop(u, d) });
        grow(690, y + 24, 690, y + 52, E(u, d + 0.3, d + 0.6), ACC);
        pill(690, y + 70, b, ACC, pop(u, d + 0.6), { mono: true, fs: 14, fill: ACCBG }); });
      note(812, 160, '우변의 타입이', fade(u, 1.8)); note(812, 186, '곧 변수의 타입', fade(u, 2.0), { fill: ACC }); }
    if (k === 2) { cells(640, 92, [1, 2, 3], { w: 52, h: 42, index: true, style: (i) => (i === 0 ? { stroke: ACC, fill: ACCBG } : {}) });
      mono(640, 80, 'v', { 'font-size': 15, 'font-weight': 700 });
      const dy = lerp(-30, 0, E(u, 0.3, 0.9));
      grow(666, 60 + dy, 666, 88, fade(u, 0.3), ACC); mono(676, 66 + dy, 'it', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      mono(612, 196, 'std::vector<int>::iterator', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0), 'text-decoration': u > 1.6 ? 'line-through' : null });
      pill(700, 236, 'auto', ACC, pop(u, 1.7), { mono: true, fs: 15, fill: ACCBG }); sub(790, 241, '한 단어로', fade(u, 1.9), { 'text-anchor': 'start' });
      mono(612, 300, '*it  →  1', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.2) }); }
    if (k === 3) { card(764, 120, 300, 92, { rx: 10, dash: '6 5', stroke: ACC, sw: 2.2, s: pop(u, 0.2) });
      mono(764, 106, '[](int a){ return a*a; }', { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 0.4) });
      tx(764, 140, '타입 이름: 컴파일러만 안다', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) });
      fly(640, 230, 760, 230, seg(u, 1.1, 1.9), 'square(5)', { mono: true, stay: true });
      grow(830, 230, 870, 230, E(u, 1.9, 2.2), MUT); mono(880, 236, '25', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 2.2) });
      note(612, 300, '사람이 적을 수 없어 auto로만 받는다', fade(u, 2.3), { 'font-size': 14 }); }
    if (k === 4) { card(700, 130, 150, 50, { rx: 8, text: 'auto x;', fs: 17, mono: true, stroke: BAD, s: pop(u, 0.2) });
      card(840, 130, 70, 50, { rx: 8, text: '= ?', fs: 17, mono: true, dash: '5 4', stroke: BAD, color: BAD, s: pop(u, 0.5) });
      note(612, 205, '볼 초기화식이 없다', fade(u, 0.8), { fill: BAD }); note(612, 232, '그래서 컴파일 에러', fade(u, 1.0), { fill: BAD });
      card(764, 300, 300, 58, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.5) });
      tx(764, 296, '기본 추론은 참조·const를 벗긴', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(764, 318, '값(복사본)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.7) }); }
    if (k === 0) banner(480, 392, '타입은 컴파일 시점에 확정된다', pop(u, 2.3));
    if (k === 4) banner(480, 392, 'auto = 초기화식의 타입을 컴파일러가 대신 적는다', pop(u, 2.3)); }

  // ---------- 2. auto · auto& · const auto& ----------
  const STR = '아주 긴 문자열 ...';
  function strObj(cx, cy, val, o) { o = o || {}; const w = 260, h = 58;
    card(cx, cy, w, h, { rx: 8, stroke: o.stroke || INK, sw: 2.4, fill: o.fill || PANEL, s: o.s, op: o.op });
    if ((o.s ?? 1) > 0.5) mono(cx - w / 2 + 16, cy + 6, val, { 'font-size': 16, 'font-weight': 600, opacity: o.op ?? 1 });
    if (o.addr) mono(cx, cy + h / 2 + 22, o.addr, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); }
  const BX = 280, XX = 720, OY = 200;
  function s2(t, c) { const { k, u } = c;
    // 원본 big
    const bigVal = STR + (k > 4 || (k === 4 && u > 1.9) ? '?' : '');
    strObj(BX, OY, bigVal, { s: k === 0 ? pop(u, 0.2) : 1, stroke: k >= 2 ? ACC : INK, addr: '주소 0x1000 (예시)' });
    tag(BX - 90, OY - 62, 'big', INK, k === 0 ? pop(u, 0.6) : 1);
    if (k === 0) { note(BX - 130, 320, 'std::string 하나. 글자가 길수록', fade(u, 1.0)); note(BX - 130, 346, '통째로 복사하는 값이 비싸다', fade(u, 1.2), { fill: WARN }); }
    // auto x = big → 새 상자
    if (k >= 1) { const g = k === 1 ? E(u, 0.5, 1.9) : 1, n = Math.round(STR.length * g), xv = STR.slice(0, n) + (k > 4 || (k === 4 && u > 1.2) ? '!' : '');
      strObj(XX, OY, xv, { s: k === 1 ? pop(u, 0.2) : 1, addr: '주소 0x2000 (예시)', fill: SOFT });
      tag(XX - 90, OY - 62, 'x', INK, k === 1 ? pop(u, 0.3) : 1);
      if (k === 1) { for (let i = 0; i < 4; i++) dot([[BX + 132, OY], [XX - 132, OY]], seg(u, 0.5 + i * 0.3, 1.0 + i * 0.3), WARN, 5);
        pill(500, OY - 40, '글자 전부 복사', WARN, pop(u, 0.4), { fs: 13.5 }); pill(XX, OY + 76, 'auto → 별개 상자', WARN, pop(u, 2.0), { fs: 14 }); } }
    // auto& r → 같은 상자에 이름 하나 더
    if (k >= 2) { const yy = k === 2 ? lerp(40, OY - 62, E(u, 0.3, 1.2)) : OY - 62;
      tag(BX, yy, 'r', ACC, 1, k === 2 ? fade(u, 0.2) : 1);
      if (k === 2) { grow(BX, OY - 48, BX, OY - 30, E(u, 1.2, 1.5), ACC); pill(BX, OY + 76, 'auto& → 같은 주소, 복사 0', ACC, pop(u, 1.6), { fs: 14 }); } }
    if (k >= 3) { const yy = k === 3 ? lerp(40, OY - 62, E(u, 0.3, 1.2)) : OY - 62;
      tag(BX + 90, yy, 'cr', INFO, 1, k === 3 ? fade(u, 0.2) : 1); lock(BX + 126, yy - 1, true, INFO, 0.7);
      if (k === 3) pill(BX, OY + 76, 'const auto& → 읽기만, 복사 0', INFO, pop(u, 1.5), { fs: 14 }); }
    // 수정
    if (k === 4) { fly(XX + 80, 60, XX + 120, OY, seg(u, 0.3, 1.2), 'x += "!"', { mono: true, fill: WARN });
      fly(BX + 20, 40, BX + 20, 92, seg(u, 0.9, 1.5), 'r += "?"', { mono: true });
      dot([[BX, OY - 48], [BX + 110, OY]], seg(u, 1.5, 1.9), ACC, 7);
      note(BX - 130, 320, '"?"는 원본 big에 남는다', fade(u, 2.0), { fill: ACC }); note(XX - 130, 320, '"!"는 복사본에만', fade(u, 1.4), { fill: WARN }); }
    if (k === 5) { const back = u > 1.3; fly(BX + 90, 50, back ? BX + 90 : BX + 90, back ? 50 : OY - 80, back ? 0 : seg(u, 0.3, 1.3), 'cr += "x"', { mono: true, fill: INFO, stay: true });
      if (back) { card(BX + 90, 60, 120, 30, { rx: 15, text: 'cr += "x"', fs: 13.5, mono: true, fill: BADBG, stroke: BAD, color: BAD }); cross(BX + 170, 60, 9, pop(u, 1.3)); }
      banner(480, 340, '빌드할 때 걸린다 · 컴파일 에러', pop(u, 1.6)); }
    if (k === 6) { terminal(250, 300, 460, 108, ['$ ./a.exe', [STR + '?', null], [STR + '!', null]], lerp(1, 3, E(u, 0.3, 1.6)), { title: 'big · x 출력' });
      mono(724, 360, '← big', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(724, 382, '← x', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.7) }); } }

  // ---------- 3. 구조적 바인딩 ----------
  // 원본 객체: 칸마다 이름(.first 등)과 값
  function obj(x, y, type, keys, vals, o) { o = o || {}; const w = o.w || 96;
    tx(x, y - 34, type, { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: o.op ?? 1 });
    keys.forEach((kk, i) => { const cx = x + i * (w + 8) + w / 2, s = o.s ? o.s(i) : 1;
      mono(cx, y - 8, kk, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: (o.op ?? 1) * clamp(s * 2) });
      card(cx, y + 24, w, 46, { rx: 6, text: String(vals[i]), fs: 16, mono: true, stroke: o.hot === i ? ACC : INK, sw: o.hot === i ? 3 : 2, fill: o.hot === i ? ACCBG : PANEL, s }); });
    return (i) => x + i * (w + 8) + w / 2; }
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { // 정리: 세 가지 대상
      const rows = [['pair', ['.first', '.second'], [7, '"Ada"'], ['id', 'name']], ['array', ['[0]', '[1]', '[2]'], [10, 20, 30], ['a', 'b', 'c']], ['struct', ['.x', '.y'], [100, 4], ['px', 'py']]];
      rows.forEach(([nm, ks, vs, ns], r) => { const y = 64 + r * 112, d = 0.2 + r * 0.5;
        tx(40, y + 30, nm, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, d) });
        const X = obj(130, y, '', ks, vs, { w: 80, s: () => pop(u, d) });
        ns.forEach((nn, i) => tag(620 + i * 100, y + 24, nn, ACC, pop(u, d + 0.4 + i * 0.1)));
        grow(450, y + 24, 560, y + 24, E(u, d + 0.2, d + 0.5), ACC); });
      banner(480, 398, '이름 개수 = 원소 개수 · 인덱스 대신 이름', pop(u, 2.0)); return; }
    if (k <= 1) { const X = obj(90, 150, 'std::pair<int, std::string> p', ['.first', '.second'], [7, '"Ada"'], { w: 120, s: () => (k === 0 ? pop(u, 0.2) : 1) });
      if (k === 0) { note(90, 290, '.first / .second는 순서만 알려 준다', fade(u, 1.0)); note(90, 318, '무엇이 id이고 무엇이 이름인지는 모른다', fade(u, 1.4), { fill: MUT }); return; }
      pill(480, 60, 'auto [id, name] = p;', ACC, pop(u, 0.2), { mono: true, fs: 15, fill: ACCBG });
      [['id', '7'], ['name', '"Ada"']].forEach(([nm, v], i) => { const ty = 150 + i * 96, d = 0.6 + i * 0.5;
        fly(X(i), 174, 700, ty + 24, seg(u, d, d + 0.8), v, { mono: true, fill: INK });
        if (u > d + 0.8) { card(700, ty + 24, 120, 46, { rx: 6, text: v, fs: 16, mono: true, stroke: ACC, sw: 2.4 }); tag(700, ty - 12, nm, ACC, pop(u, d + 0.8)); } });
      sub(700, 360, '값은 복사본에 붙는다 (auto)', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2) { const X = obj(90, 150, 'std::array<int, 3> arr', ['[0]', '[1]', '[2]'], [10, 20, 30], { s: (i) => pop(u, 0.2 + i * 0.12) });
      pill(480, 60, 'auto [a, b, c] = arr;', ACC, pop(u, 0.5), { mono: true, fs: 15, fill: ACCBG });
      ['a', 'b', 'c'].forEach((nm, i) => { const d = 0.9 + i * 0.35; fly(X(i), 174, 640 + i * 100, 300, seg(u, d, d + 0.6), String((i + 1) * 10), { mono: true, fill: INK });
        if (u > d + 0.6) { card(640 + i * 100, 300, 84, 44, { rx: 6, text: String((i + 1) * 10), fs: 16, mono: true, stroke: ACC, sw: 2.4 }); tag(640 + i * 100, 262, nm, ACC, pop(u, d + 0.6)); } });
      mono(90, 330, 'a b c 출력 → 102030', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    // k 3, 4: Point 를 참조로 분해 — 이름이 원본 칸에 바로 붙는다
    const xv = k === 4 ? Math.round(tween(3, 100, u)) : 3;
    const X = obj(250, 190, '', ['.x', '.y'], [xv, 4], { w: 120, s: () => (k === 3 ? pop(u, 0.2) : 1), hot: k === 4 ? 0 : null });
    mono(90, 220, 'Point pt', { 'font-size': 15, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.2) : 1 });
    pill(480, 60, 'auto& [px, py] = pt;', ACC, k === 3 ? pop(u, 0.4) : 1, { mono: true, fs: 15, fill: ACCBG });
    ['px', 'py'].forEach((nm, i) => { const yy = k === 3 ? lerp(70, 140, E(u, 0.8 + i * 0.3, 1.4 + i * 0.3)) : 140;
      if (k > 3 || u > 0.8 + i * 0.3) { tag(X(i), yy, nm, ACC, 1); } });
    if (k === 3) { note(560, 210, '복사본을 만들지 않고', fade(u, 1.9)); note(560, 236, 'pt의 멤버에 이름만 붙인다', fade(u, 2.1), { fill: ACC }); }
    if (k === 4) { fly(250, 70, X(0), 200, seg(u, 0.1, 0.6), 'px = 100', { mono: true });
      terminal(560, 260, 330, 96, ['$ ./a.exe', '100'], lerp(1, 2, E(u, 1.4, 2.0)), { title: 'pt.x 출력' });
      note(250, 300, 'px를 바꾸니 pt.x가 바뀌었다', fade(u, 1.6), { fill: ACC }); } }

  // ---------- 4. map 순회 ----------
  const NODES = [{ x: 300, y: 92 }, { x: 160, y: 210 }, { x: 440, y: 210 }];   // banana(뿌리) · apple · cherry
  const ORDER = [1, 0, 2];   // 키 순서로 도는 차례: apple → banana → cherry
  const KEYS = ['banana', 'apple', 'cherry'];
  function node(i, v, o) { o = o || {}; const { x, y } = NODES[i], s = o.s ?? 1;
    card(x - 26, y, 104, 44, { rx: 6, text: '"' + KEYS[i] + '"', fs: 14, mono: true, fill: SOFT, stroke: o.hot ? ACC : INK, sw: o.hot ? 3 : 2, s });
    card(x + 52, y, 52, 44, { rx: 6, text: String(v), fs: 17, mono: true, fw: 800, stroke: o.hot ? ACC : INK, sw: o.hot ? 3 : 2, fill: o.hot ? ACCBG : PANEL, color: o.vcol, s }); }
  function tree(vals, o) { o = o || {};
    [1, 2].forEach((i) => el('line', { x1: NODES[0].x, y1: NODES[0].y + 22, x2: NODES[i].x, y2: NODES[i].y - 22, stroke: GRID, 'stroke-width': 2.5, opacity: o.s ?? 1 }));
    [0, 1, 2].forEach((i) => node(i, vals[i], { s: o.s, hot: o.hot === i, vcol: o.vcol && o.vcol(i) })); }
  // u 안에서 apple → banana → cherry 를 차례로 들른다: 지금 들른 순번(0~2, 시작 전 -1)
  const visitAt = (u, a, d) => (u < a ? -1 : Math.min(2, Math.floor((u - a) / d)));
  function cursor(u, a, d) { const v = visitAt(u, a, d); if (v < 0 || u > a + d * 3) return v; const n = NODES[ORDER[v]];
    el('circle', { cx: n.x - 90, cy: n.y, r: 7, fill: ACC }); return v; }
  function s4(t, c) { const { k, u } = c, ent = c.beat.entries, pe = (c.prev && c.prev.entries) || ent;
    const byNode = (e) => [+e[1].v, +e[0].v, +e[2].v];
    if (k === 5) { tx(40, 44, '같은 세 항목을 도는 세 방식', { 'font-size': 17, 'font-weight': 800 });
      [['const auto& [k, v]', '읽기', 0, ACC], ['auto& [k, v]', '수정', 0, GOOD], ['auto [k, v]', '피한다', 3, BAD]].forEach(([code, what, n, col], i) => { const y = 100 + i * 92, d = 0.2 + i * 0.45;
        mono(40, y + 14, 'for (' + code + ' : m)', { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, d) });
        tx(40, y + 40, what, { 'font-size': 14, fill: MUT, opacity: fade(u, d) });
        hbar(470, y, 300, n, 3, { h: 22, col: col, u: E(u, d + 0.2, d + 0.9), text: `pair 복사 ${n}번` }); });
      tx(480, 400, '[k, v] 앞의 & 하나가 복사 여부를 가른다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    let vals = byNode(ent), vcol = null, hot = null;
    if (k === 2) { const v = visitAt(u, 0.3, 0.7), old = byNode(pe);
      vals = [0, 1, 2].map((ni) => { const order = ORDER.indexOf(ni); return v > order || (v === order && u > 0.3 + order * 0.7 + 0.35) ? vals[ni] : old[ni]; });
      vcol = (ni) => (ORDER.indexOf(ni) <= v ? GOOD : null); }
    if (k === 3) hot = 1;
    tree(vals, { s: k === 0 ? pop(u, 0.2) : 1, vcol, hot });
    if (k === 0) { const s = fade(u, 0.9);
      el('rect', { x: 92, y: 290, width: 460, height: 76, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: s });
      mono(112, 320, 'pair<const string, int>', { 'font-size': 15, 'font-weight': 700, opacity: s });
      tx(112, 348, '키는 const라 못 바꾸고, 값은 바꿀 수 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      lock(NODES[1].x - 26, NODES[1].y - 40, true, MUT, 0.7 * fade(u, 1.5));
      note(600, 130, '원소 하나 = 키·값 한 쌍', fade(u, 1.8)); note(600, 160, '키 순서로 하나씩 나온다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 1 || k === 2 || k === 4) { const v = cursor(u, 0.3, 0.7);
      if (k === 1 && v >= 0) [0, 1, 2].slice(0, v + 1).forEach((o) => { const n = NODES[ORDER[o]]; mono(n.x + 86, n.y + 5, '◂ [name, qty]', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }); });
      if (k === 2 && v >= 0) pill(300, 300, 'qty += 1  (원본 값이 오른다)', GOOD, pop(u, 0.4), { fs: 14 });
      if (k === 4) { mono(40, 300, 'for (auto [k, v] : stock)', { 'font-size': 15, 'font-weight': 700, fill: BAD });
        for (let o = 0; o <= v; o++) { const n = NODES[ORDER[o]], st = 0.3 + o * 0.7;
          fly(n.x, n.y + 30, 120 + o * 130, 356, seg(u, st + 0.05, st + 0.6), KEYS[ORDER[o]] + ' 복사', { fill: BAD, stay: true }); }
        pill(760, 356, `pair 복사 ${v + 1 > 0 ? v + 1 : 0}번`, BAD, pop(u, 0.4), { fs: 15 }); } }
    // 오른쪽 출력 창
    if (k === 1 || k === 3) {
      if (k === 1) terminal(600, 40, 330, 150, ['$ ./a.exe', 'apple: 3', 'banana: 5', 'cherry: 2'], 1 + Math.max(0, visitAt(u, 0.3, 0.7) + 1));
      else { terminal(600, 40, 330, 150, ['$ ./a.exe', 'stock["apple"]', '4'], lerp(1, 3, E(u, 0.4, 1.4)));
        note(600, 230, '루프가 끝나도 4가 남았다', fade(u, 1.6), { fill: ACC }); note(600, 258, '사본이 아니라 원본을 고쳤다', fade(u, 1.9), { fill: MUT }); } }
    if (k === 1) { note(600, 236, '& 덕분에 pair 복사 0번', fade(u, 2.4), { fill: ACC }); }
    if (k === 2) { note(600, 120, 'auto& [name, qty]', fade(u, 0.2), { class: 'mono' }); note(600, 150, 'qty는 map 안 값의 별칭', fade(u, 0.5), { fill: MUT });
      mono(600, 210, 'apple 3→4 · banana 5→6', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.3) });
      mono(600, 234, 'cherry 2→3', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.4) }); }
    if (k === 4) { note(600, 120, '반복마다 키와 값을 통째로 복사', fade(u, 0.5), { fill: BAD }); note(600, 150, '복사본을 고쳐도 원본은 그대로', fade(u, 1.2), { fill: MUT }); } }

  // ---------- 5. 실무 함정 ----------
  const PIT = ['① 조용한 복사', '② 루프 & 누락', '③ vector<bool> 프록시', '④ 안 보이는 타입'];
  function pits(k, u) { PIT.forEach((s, i) => pill(122 + i * 238, 34, s, i === k ? BAD : i < k ? MUT : GRID, i === k ? pop(u, 0.1) : 1, { fs: 14, fill: i === k ? BADBG : PANEL, color: i === k ? BAD : i < k ? MUT : OFF })); }
  function strip(x, y, n, filled, col, o) { o = o || {}; for (let i = 0; i < n; i++) el('rect', { x: x + i * 20, y, width: 17, height: 26, rx: 3, fill: i < filled ? col : PANEL, stroke: i < filled ? 'none' : GRID, 'stroke-width': 1.2, opacity: i < filled ? 0.85 : 1 }); }
  function s5(t, c) { const { k, u } = c; pits(k, u);
    if (k === 0) { const X0 = 150;
      mono(X0 - 110, 167, 'bigVec', { 'font-size': 15, 'font-weight': 800 }); strip(X0, 148, 36, 36, INK);
      sub(X0 + 360, 196, 'int 1000개 (한 칸 ≈ 28개)', 1, { 'font-size': 13.5 });
      // ref: 위에서 화살표 하나
      tag(X0 + 60, 86, 'ref', ACC, pop(u, 0.3)); grow(X0 + 60, 101, X0 + 60, 144, E(u, 0.5, 0.9), ACC);
      mono(X0 + 100, 92, 'const auto& ref = bigVec;   복사 0', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) });
      // copy: 아래에 칸이 하나씩 채워진다
      const g = E(u, 1.0, 2.4); mono(X0 - 110, 271, 'copy', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9) });
      strip(X0, 252, 36, Math.round(36 * g), WARN);
      mono(X0, 316, `auto copy = bigVec;   복사한 원소 ${Math.round(1000 * g)}개`, { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(480, 380, '에러 없이 지나가서 더 오래 남는 성능 문제다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 1) { [['for (auto [k, v] : stock)', BAD, 3], ['for (const auto& [k, v] : stock)', ACC, 0]].forEach(([code, col, n], r) => { const y = 120 + r * 130, d = 0.2 + r * 1.1;
        mono(60, y, code, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, d) });
        ['apple', 'banana', 'cherry'].forEach((kk, i) => { const x = 110 + i * 150, st = d + 0.2 + i * 0.25;
          card(x, y + 46, 120, 36, { rx: 6, text: kk, fs: 14, mono: true, s: pop(u, st) });
          if (n) fly(x, y + 46, 580 + i * 60, y + 46, seg(u, st + 0.2, st + 0.7), '복사', { fill: BAD, stay: true });
          });
        mono(780, y + 52, n ? '복사 3번' : '복사 0번', { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, d + 0.9) }); });
      tx(480, 400, '반복 횟수만큼 복사가 곱해진다 (stock 3항목 기준)', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 2) { // 비트 묶음 + 프록시
      tx(60, 92, 'vector<bool> flags{true, false} — 실제로는 비트로 압축', { 'font-size': 15, 'font-weight': 700 });
      const bits = ['1', '0', '', '', '', '', '', ''];
      cells(60, 108, bits, { w: 34, h: 36, gap: 3, fs: 15, style: (i) => (i < 2 ? { stroke: INK } : { stroke: GRID, fill: SOFT }) });
      // flags[0] → 프록시
      card(220, 240, 260, 64, { rx: 8, stroke: BAD, sw: 2.4, fill: BADBG, s: pop(u, 0.4) });
      mono(220, 234, 'vector<bool>::reference', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) });
      tx(220, 256, '어느 비트인지 가리키는 대리 객체', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
      grow(160, 206, 77, 148, E(u, 0.7, 1.1), BAD);
      mono(60, 316, 'auto b = flags[0];', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      // bool b → 진짜 bool
      card(700, 240, 140, 64, { rx: 8, stroke: GOOD, sw: 2.4, fill: GOODBG, text: 'true', fs: 18, mono: true, s: pop(u, 1.2) });
      mono(620, 316, 'bool b = flags[0];', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.3) });
      tx(700, 196, '값을 꺼내 따로 담는다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      tx(480, 372, 'auto는 bool이 아니라 이 대리 객체를 잡는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      tx(480, 398, '벡터가 사라진 뒤에도 b를 쓰면 매달린다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k 3: 안 보이는 타입
    card(260, 160, 360, 64, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.2) }); mono(260, 166, 'auto r = doSomething();', { 'text-anchor': 'middle', 'font-size': 16, opacity: fade(u, 0.3) });
    card(260, 232, 120, 40, { rx: 20, dash: '5 4', stroke: WARN, text: '타입 = ?', fs: 15, color: WARN, s: pop(u, 0.7) });
    card(700, 160, 360, 64, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.0) }); mono(700, 166, 'Order r = doSomething();', { 'text-anchor': 'middle', 'font-size': 16, opacity: fade(u, 1.1) });
    card(700, 232, 120, 40, { rx: 20, stroke: GOOD, text: 'Order', fs: 15, mono: true, color: GOOD, s: pop(u, 1.4) });
    [['타입이 길거나 적을 수 없다', 'auto'], ['복사가 걱정된다', 'const auto& · auto&'], ['결과 타입이 이해에 중요하다', '타입을 적는다']].forEach(([a, b], i) => { const y = 312 + i * 32, d = 1.7 + i * 0.25;
      tx(250, y, a, { 'font-size': 14.5, 'font-weight': 600, opacity: fade(u, d) }); grow(470, y - 5, 520, y - 5, E(u, d, d + 0.3), MUT); mono(536, y, b, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, d + 0.2) }); }); }

  const quiz = [
    { q: 'auto n = 42; 에서 n의 타입이 정해지는 때는 언제인가?',
      o: ['프로그램이 실행되어 42를 대입할 때', '컴파일할 때, 초기화식 42를 보고', '처음 n을 출력할 때'], a: 1,
      why: 'auto는 컴파일러가 초기화식의 타입을 대신 적어 넣는 것이다. 42는 int이므로 n은 컴파일 시점에 int로 정해지고 실행 비용은 없다.' },
    { q: 'std::string big이 있을 때 big을 복사하지 않고 읽기만 하는 선언은 무엇인가?',
      o: ['const auto& cr = big;', 'auto x = big;', 'auto x = std::move(big);'], a: 0,
      why: 'auto는 참조를 벗겨 새 상자를 만든다. const auto&는 같은 주소를 가리키면서 수정까지 막으므로 읽기 전용의 기본값이다.' },
    { q: 'auto& [px, py] = pt; 다음 px = 100; 을 하면 pt.x는 어떻게 되는가?',
      o: ['3 그대로다', '컴파일 에러가 난다', '100이 된다'], a: 2,
      why: 'auto&로 분해하면 px는 pt.x 자체에 붙은 이름이다. 그래서 px에 쓴 100이 pt.x에 그대로 남고 출력도 100이다.' },
    { q: 'stock 세 항목을 for (auto [k, v] : stock)로 돌면 pair 복사는 몇 번 일어나는가?',
      o: ['0번', '1번', '3번'], a: 2,
      why: '&가 없으면 반복할 때마다 키와 값을 통째로 복사한다. 세 항목이면 세 번이고, const auto&로 받으면 0번이 된다.' },
    { q: 'std::vector<bool>에서 auto b = flags[0]; 이 문제가 되는 이유는 무엇인가?',
      o: ['b가 bool이 아니라 원본 비트를 가리키는 대리 객체가 되어서', 'b가 int로 추론되어서', 'flags 전체가 복사되어서'], a: 0,
      why: 'vector<bool>은 비트로 압축해 담아서 []가 reference 대리 객체를 돌려준다. 원본이 사라진 뒤 b를 쓰면 매달린다. bool b로 받으면 값이 따로 담긴다.' },
  ];

  const summary = [
    'auto는 초기화식을 보고 컴파일할 때 타입을 정한다. 실행 비용은 없다.',
    '기본 추론은 참조와 const를 벗긴 값이라 auto x = big; 은 big을 통째로 복사한다.',
    '구조적 바인딩은 pair, array, struct를 이름 붙인 변수로 한 줄에 풀어낸다.',
    '읽기만 하면 const auto&, 고치려면 auto&, 따로 쓸 사본이 필요할 때만 auto를 쓴다.',
  ];
  const review = [
    { q: 'map을 for (auto [k, v] : m)로 돌며 v += 1을 했는데 루프 뒤 값이 그대로다. 먼저 의심할 것은?',
      o: ['map이 키 순서로 정렬되어 있어서', '&가 없어 v가 복사본이라서', 'v가 const로 추론되어서'], a: 1,
      why: '&가 없으면 반복마다 pair가 복사되고 v는 그 복사본에 붙은 이름이다. auto& [k, v]로 받아야 map 안의 값이 바뀐다.' },
    { q: '큰 벡터를 함수 안에서 auto data = cache.items; 로 받은 뒤 읽기만 한다. 고칠 점은?',
      o: ['auto를 std::vector<int>로 바꾼다', 'auto&& data로 바꿔 이동시킨다', 'const auto& data = cache.items; 로 바꾼다'], a: 2,
      why: '타입을 적어도 값으로 받으면 똑같이 전체 복사다. 읽기만 하므로 const auto&로 받으면 복사 없이 같은 벡터를 본다.' },
    { q: 'const auto& [name, qty] : stock으로 돌며 qty += 1을 넣었더니 빌드가 안 된다. 왜인가?',
      o: ['const 참조로 받은 값은 수정할 수 없어서', '구조적 바인딩은 map에 쓸 수 없어서', 'qty가 복사본이라서'], a: 0,
      why: 'const auto&는 복사도 막고 수정도 막는다. 값을 그 자리에서 올리려면 const를 뺀 auto& [name, qty]로 받는다.' },
  ];

  R.page({ title: 'auto 추론과 구조적 바인딩', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
