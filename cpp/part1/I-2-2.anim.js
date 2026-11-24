/* I-2-2 namespace·헤더 관리 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal, snippet, G } = R;
  const { INK, MUT, OFF, GRID, PANEL, SOFT, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 지역 도우미 ──────────────────────────────────────────
  // 이름표: 전역·namespace 방 안에 놓이는 이름
  function plate(cx, cy, name, from, o) { o = o || {}; const w = o.w || 170, g = G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('rect', { x: -w / 2, y: -24, width: w, height: 48, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    tx(0, from ? -2 : 6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono', fill: col }, g);
    if (from) tx(0, 17, from, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // 파일 아이콘
  function doc(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK, w = o.w || 120, h = o.h || 64;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: `M${w / 2 - 14},${-h / 2} V${-h / 2 + 14} H${w / 2}`, fill: 'none', stroke: c, 'stroke-width': 1.6 }, g);
    tx(0, o.line ? -6 : 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: c }, g);
    if (o.line) tx(0, 16, o.line, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g); return g; }
  function room(x, y, w, h, title, o) { o = o || {}; zone(x, y, w, h, null, { fill: o.fill || SOFT, stroke: o.stroke || GRID, sw: o.sw || 2, dash: o.dash, op: o.op });
    if (title) mono(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 800, fill: o.color || MUT, opacity: o.op ?? 1 }); }

  // ── 1. 같은 이름의 충돌 ───────────────────────────────────
  function s1(t, c) { const { k, u } = c;
    room(260, 60, 660, 210, '전역 이름 공간 (단 하나)', { fill: SOFT });
    doc(110, 120, '<cmath>', { s: k === 0 ? pop(u, 0.2) : 1 });
    const stdX = k === 3 ? lerp(470, 470, 1) : 470;
    // 표준 log 이름표: k3 에서 우리 log 가 위에 덮인다
    const cover = k === 3 ? E(u, 0.6, 1.4) : 0;
    if (k === 0) fly(150, 120, stdX, 150, seg(u, 0.6, 1.4), 'log()', { mono: true, stay: false });
    if (k > 0 || u > 1.4) plate(stdX, 150, 'log(double)', '<cmath> 의 표준 log', { col: k >= 1 ? BAD : INK, op: 1 - cover * 0.9 });
    if (k >= 1) plate(lerp(720, stdX + 14, cover), lerp(150, 158, cover), 'log(double)', '우리 코드', { col: BAD, fill: k === 3 && cover > 0.5 ? WARNBG : PANEL, s: k === 1 ? pop(u, 0.3) : 1 });
    if (k === 1) tx(590, 236, '같은 방에 같은 이름이 둘', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
    if (k === 2) { mono(590, 330, 'log(2.0)', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, opacity: fade(u, 0.1) });
      [[470, 0.3], [720, 0.5]].forEach(([x, a]) => el('line', { x1: 590, y1: 306, x2: x, y2: 178, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, a) }));
      mono(590, 260, '?', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) * (1 - seg(u, 1.5, 1.8)) });
      dot([[590, 306], [720, 178]], seg(u, 1.6, 2.1), WARN, 8); mono(800, 330, '→ 1.0', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.2) }); }
    if (k === 3) { tx(470, 236, '표준 log 자리를 우리 log 가 덮었다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      const P = c.beat.cPrefix || []; P.forEach((p, i) => pill(130, 310 + i * 44, p.code, MUT, pop(u, 1.8 + i * 0.3), { mono: true, fs: 14 }));
      tx(40, 290, 'C 시절 회피법: 접두사', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.7) }); }
    if (k >= 2) terminal(560, 290 + (k === 2 ? 60 : 0), 360, k === 2 ? 62 : 122, k === 2 ? ['log(2.0)=1.000000'] : ['$ ./a.out', 'log(2.0)=1.000000', 'std::log(2.0)=1.000000', '(원래 0.693147 이어야 한다)'],
      k === 2 ? (u > 2.3 ? 1 : 0) : 1 + seg(u, 0.4, 0.8) + seg(u, 0.9, 1.3) + seg(u, 1.5, 1.9), { title: k === 3 ? '출력 · zig c++ (clang)' : null, lh: 20 }); }

  // ── 2. namespace — 이름을 방에 가둔다 ─────────────────────────
  function s2(t, c) { const { k, u } = c, rooms = c.beat.rooms || [], ours = rooms[0] || { members: [] }, std = rooms[1] || { members: [] };
    room(40, 56, 880, 250, '전역', { fill: PANEL, stroke: GRID });
    const open = k === 0 ? E(u, 0.3, 1.0) : 1;
    room(70, 96, 380, 190, 'namespace ourApp', { fill: ACCBG, stroke: ACC, sw: 2.4, dash: k < 2 ? '7 5' : null, color: ACC, op: open });
    room(510, 96, 380, 190, 'namespace std', { fill: INFOBG, stroke: INFO, sw: 2.4, color: INFO });
    std.members.forEach((m, i) => plate(590 + (i % 2) * 190, 158 + Math.floor(i / 2) * 64, m, null, { w: 150, col: INFO }));
    ours.members.forEach((m, i) => { const fresh = (k === 1 && i === 0) || (k === 2 && i > 0), s = fresh ? pop(u, 0.3 + i * 0.3) : 1;
      plate(150 + (i % 2) * 190, 158 + Math.floor(i / 2) * 64, m, null, { w: 150, col: ACC, s }); });
    if (k === 1) mono(260, 280 - 4, '진짜 이름: ourApp::log', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
    if (k === 2) mono(436, 280, '}', { 'font-size': 34, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2), 'text-anchor': 'end' });
    if (k >= 3) { const call = (s, x, a, target, col, res) => { mono(x, 350, s, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, a) });
        dot([[x, 330], [x, 300], target], seg(u, a + 0.3, a + 0.9), col, 8); mono(x, 384, res, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, a + 1.0) }); };
      call('ourApp::log(2.0)', 230, k === 3 ? 0.2 : 0, [150, 182], ACC, '→ 1.0');
      if (k === 4) { call('std::log(2.0)', 700, 0.4, [590, 182], INFO, '→ 0.693147'); tx(480, 410, '철자가 같아도 방이 다르면 다른 이름', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) }); } }
    if (k < 3) snippet(40, 322, [['namespace ourApp {'], ['namespace ourApp {', '    double log(double x) { return x * 0.5; }'], ['    double log(double x) { ... }', '}   // 방의 끝']][k], { fs: 14 }); }

  // ── 3. using · 중첩 · 익명 namespace ─────────────────────────
  function s3(t, c) { const { k, u } = c;
    room(40, 56, 600, 300, 'impl.cpp', { fill: PANEL, stroke: INK, sw: 2.4, color: INK });
    room(690, 56, 230, 300, 'other.cpp', { fill: PANEL, stroke: INK, sw: 2.4, color: INK });
    // 익명 namespace
    room(70, 96, 250, 96, 'namespace { }', { fill: SOFT, stroke: MUT, dash: '6 4', s: 1, op: k === 0 ? fade(u, 0.2) : 1 });
    plate(195, 152, 'secretHelper()', null, { w: 190, s: k === 0 ? pop(u, 0.4) : 1 });
    if (k === 0) { dot([[805, 152], [648, 152]], seg(u, 1.0, 1.6), BAD, 8); cross(648, 152, 12, pop(u, 1.6));
      mono(805, 130, 'secretHelper()', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(805, 196, '파일 밖에선 안 보인다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(195, 222, 'static 전역을 대신하는 방법', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); }
    // 중첩 namespace
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1;
      room(350, 96, 270, 150, 'company', { fill: INFOBG, stroke: INFO, color: INFO, op: s });
      room(370, 134, 230, 96, 'net', { fill: PANEL, stroke: INFO, color: INFO, op: k === 1 ? fade(u, 0.6) : 1 });
      plate(485, 190, 'connect()', null, { w: 150, col: INFO, s: k === 1 ? pop(u, 0.9) : 1 });
      if (k === 1) mono(485, 270, 'company::net::connect', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) }); }
    // run() 블록과 using 선언
    if (k >= 2) { const hot = 1; room(70, 262, 550, 82, 'void run() { … }', { fill: WARNBG, stroke: WARN, color: WARN, op: k === 2 ? fade(u, 0.2) : 1 });
      mono(90, 318, 'using company::net::connect;', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.6) : 1 });
      el('path', { d: 'M420,300 C460,280 480,260 485,216', fill: 'none', stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: k === 2 ? fade(u, 1.0) : 1, 'marker-end': 'url(#ra-ah)' });
      if (k === 2) tx(330, 380, 'using 의 효과는 이 블록 안에서 끝난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) }); }
    if (k === 3) { ['connect();', 'secretHelper();'].forEach((s, i) => { const x = 420 + i * 0; mono(470, 296 + i * 24, s, { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2 + i * 0.4) }); });
      terminal(700, 180, 210, 90, ['connect', 'helper=42'], seg(u, 0.8, 1.2) + seg(u, 1.3, 1.7), { lh: 22 });
      pill(480, 390, '헤더에 using namespace 는 금지: include 한 모든 파일이 오염된다', BAD, pop(u, 1.9), { fs: 14 }); } }

  // ── 4. 헤더와 구현 분리 — 빌드 흐름 ───────────────────────────
  function s4(t, c) { const { k, u } = c, H = [480, 92], IM = [190, 200], MA = [770, 200], IO = [190, 316], MO = [770, 316], EX = [480, 372];
    const hl = k === 0 ? 'int add(int, int);' : 'add · class Calc';
    doc(H[0], H[1], 'header.h', { w: 220, h: 70, line: hl, stroke: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
    tx(H[0] + 126, H[1] + 6, '선언 = 약속', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.9) : 1 });
    if (k === 0) tx(H[0], H[1] + 80, '본체가 없어 이것만으로는 실행 코드가 생기지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) });
    if (k === 1) tx(H[0], H[1] + 58, 'void plus(int n);  본체 없이 선언만', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
    if (k >= 2) { doc(IM[0], IM[1], 'impl.cpp', { w: 200, h: 64, line: k === 2 ? 'add 정의' : 'add · Calc::plus 정의', s: k === 2 ? pop(u, 0.2) : 1 });
      grow(H[0] - 110, H[1] + 20, IM[0] + 60, IM[1] - 34, k === 2 ? seg(u, 0.5, 1.0) : 1, MUT, { dash: '5 4' });
      grow(IM[0], IM[1] + 34, IO[0], IO[1] - 26, k === 2 ? seg(u, 1.1, 1.5) : 1, INK);
      card(IO[0], IO[1], 200, 50, { rx: 8, text: k === 2 ? 'impl.o   add ✓' : 'impl.o   add ✓ plus ✓', fs: 14.5, mono: true, fw: 700, stroke: GOOD, s: k === 2 ? pop(u, 1.5) : 1 }); }
    if (k >= 4) { doc(MA[0], MA[1], 'main.cpp', { w: 200, h: 64, line: 'add(2, 3)', s: k === 4 ? pop(u, 0.2) : 1 });
      grow(H[0] + 110, H[1] + 20, MA[0] - 60, MA[1] - 34, k === 4 ? seg(u, 0.5, 1.0) : 1, MUT, { dash: '5 4' });
      grow(MA[0], MA[1] + 34, MO[0], MO[1] - 26, k === 4 ? seg(u, 1.1, 1.5) : 1, INK);
      card(MO[0], MO[1], 200, 50, { rx: 8, text: 'main.o   add ?', fs: 14.5, mono: true, fw: 700, stroke: k === 5 && u > 1.2 ? GOOD : WARN, s: k === 4 ? pop(u, 1.5) : 1 });
      if (k === 4) tx(MA[0], MO[1] + 48, '본체를 모른 채 컴파일 끝', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 2 || k === 3) tx(IM[0], IO[1] + 48, k === 2 ? '정의는 여기 한 곳' : '구현만 바뀌면 impl.cpp 만 다시', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
    if (k === 5) { grow(MO[0] - 100, MO[1], IO[0] + 100, IO[1], seg(u, 0.3, 1.1), ACC); pill(480, MO[1] - 22, '링커가 add 를 찾아 잇는다', ACC, pop(u, 0.8), { fs: 14 });
      card(EX[0], EX[1], 160, 44, { rx: 8, text: 'a.exe  → 5', fs: 16, mono: true, fw: 800, stroke: GOOD, fill: GOODBG, s: pop(u, 1.5) });
      tx(EX[0] + 100, EX[1] + 30, '', {});
      mono(40, 412, 'main.cpp 만 링크하면: undefined symbol: add(int, int)', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.1) }); } }

  // ── 5. 중복 포함 방지 ───────────────────────────────────────
  function blockRow(x, y, w, text, o) { o = o || {}; el('rect', { x, y, width: w, height: 40, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    mono(x + 12, y + 26, text, { 'font-size': 14, 'font-weight': o.fw || 600, fill: o.col || INK, opacity: o.op ?? 1, 'text-decoration': o.strike ? 'line-through' : null }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 4) { // 왼쪽: include 그래프
      tx(40, 74, 'include 그래프', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      doc(110, 130, 'a.cpp', { w: 110, h: 50 }); doc(320, 130, 'util.h', { w: 110, h: 50, stroke: ACC });
      grow(166, 130, 262, 130, k === 0 ? seg(u, 0.2, 0.6) : 1, ACC);
      if (k >= 1) { doc(110, 250, 'net.h', { w: 110, h: 50, s: k === 1 ? pop(u, 0.2) : 1 }); grow(110, 156, 110, 222, k === 1 ? seg(u, 0.4, 0.8) : 1, MUT); }
      if (k >= 2) el('path', { d: 'M166,246 C230,240 300,210 318,160', fill: 'none', stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: k === 2 ? fade(u, 0.2) : 1, 'marker-end': 'url(#ra-ah)' });
      if (k >= 2) tx(250, 236, '두 번째 길', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
      // 매크로 표
      tx(40, 320, '정의된 매크로', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      pill(110, 352, 'UTIL_H', k === 0 && u < 0.9 ? OFF : GOOD, k === 0 ? pop(u, 0.9) : 1, { mono: true, fs: 14 });
      // 오른쪽: a.cpp 가 펼쳐진 모습
      tx(470, 74, '전처리 뒤 a.cpp', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: 460, y: 84, width: 460, height: 318, rx: 10, fill: SOFT });
      blockRow(476, 98, 428, '#ifndef UTIL_H  → 통과', { col: GOOD, op: k === 0 ? fade(u, 0.4) : 1 });
      blockRow(476, 144, 428, 'struct Point { int x, y; };', { stroke: k === 1 ? WARN : ACC, sw: 2.2, fw: 800, op: k === 0 ? fade(u, 1.1) : 1 });
      if (k === 1) { blockRow(476, 192, 428, 'struct Point { int x, y; };', { stroke: BAD, dash: '6 4', col: BAD, op: fade(u, 0.6) });
        mono(904, 236 + 16, "error: redefinition of 'Point'", { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
        tx(690, 290, 'guard 가 없다면 두 번 펼쳐진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }
      if (k >= 2) { blockRow(476, 192, 428, k >= 3 ? '#pragma once / #ifndef → 건너뜀' : '#ifndef UTIL_H  → 이미 정의', { col: MUT, fill: SOFT, stroke: OFF, dash: '6 4', op: k === 2 ? fade(u, 0.4) : 1 });
        if (k === 2) dot([[166, 246], [318, 160]], seg(u, 0.5, 1.2), WARN, 7);
        if (k === 2) tx(690, 270, '#endif 까지 통째로 건너뛴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) }); }
      if (k === 3) { pill(220, 300 - 10, '#pragma once', INFO, pop(u, 0.4), { mono: true, fs: 15 }); tx(220, 400 - 70 + 4, '한 줄로 같은 일', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) }); }
      if (k === 4) { blockRow(476, 240, 428, 'struct Socket { Point addr; };', { stroke: ACC, op: fade(u, 0.3) });
        el('path', { d: 'M620,248 C600,220 600,200 610,186', fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.9), 'marker-end': 'url(#ra-ahb)' });
        tx(690, 320, 'Point 는 한 번만 펼쳐도 모두가 쓴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); }
      return; }
    // k5: inline — 두 번역 단위가 같은 정의를 볼 때
    doc(480, 92, 'sq.h', { w: 260, h: 64, line: 'int square(int x) { … }', stroke: ACC });
    [[220, 'u1.cpp'], [740, 'u2.cpp']].forEach(([x, n], i) => { doc(x, 200, n, { w: 140, h: 50, s: pop(u, 0.2 + i * 0.2) }); grow(480 + (i ? 120 : -120), 124, x, 172, seg(u, 0.4 + i * 0.2, 0.8 + i * 0.2), MUT, { dash: '5 4' });
      card(x, 276, 190, 42, { rx: 8, text: 'square 정의 1개', fs: 14.5, mono: true, fw: 700, s: pop(u, 0.8 + i * 0.2) }); });
    const bad = u < 1.6;
    card(480, 346, 300, 52, { rx: 10, stroke: bad ? BAD : GOOD, fill: bad ? BADBG : GOODBG, sw: 2.4, s: pop(u, 1.1) });
    mono(480, 352, bad ? 'duplicate symbol: square(int)' : 'inline → 하나로 취급 → 9 16', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: bad ? BAD : GOOD, opacity: fade(u, 1.2) });
    grow(285, 290, 340, 330, seg(u, 1.0, 1.3), MUT); grow(675, 290, 620, 330, seg(u, 1.0, 1.3), MUT);
    if (!bad) pill(480, 36, 'inline int square(int x)', GOOD, pop(u, 1.6), { mono: true, fs: 14 });
    tx(80, 400, bad ? 'inline 없이 링크' : 'inline 을 붙여 링크', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }

  // ── 6. 실무 실패 사례 ────────────────────────────────────────
  function s6(t, c) { const { k, u } = c, A = [250, 150], B = [710, 150];
    if (k <= 3) { doc(A[0], A[1], 'A.h', { w: 140, h: 70, stroke: k >= 1 ? ACC : INK, line: k >= 1 ? 'class B;' : '#pragma once' });
      if (k >= 1) doc(B[0], B[1], 'B.h', { w: 140, h: 70, line: k >= 3 ? 'class A;' : '#include "A.h"', s: k === 1 ? pop(u, 0.2) : 1 });
      if (k === 0) { pill(A[0], A[1] - 62, '#pragma once', GOOD, pop(u, 0.4), { mono: true, fs: 14 }); check(A[0] + 90, A[1] - 62, 9, pop(u, 0.8));
        tx(480, 280, '새 헤더의 첫 줄부터 guard', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.0) });
        tx(480, 310, '두 번 펼쳐져 생기는 재정의 에러를 통째로 막는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) }); return; }
      // 고리: A.h → B.h → A.h
      const cutAB = k === 1 ? seg(u, 1.4, 1.8) : 1, cutBA = k >= 3 ? (k === 3 ? seg(u, 0.6, 1.0) : 1) : 0;
      el('path', { d: `M${A[0] + 70},${A[1] - 20} C420,90 540,90 ${B[0] - 70},${B[1] - 20}`, fill: 'none', stroke: cutAB > 0.5 ? OFF : BAD, 'stroke-width': 2.6, 'stroke-dasharray': cutAB > 0.5 ? '4 6' : null, 'marker-end': cutAB > 0.5 ? null : 'url(#ra-ahr)' });
      el('path', { d: `M${B[0] - 70},${B[1] + 20} C540,210 420,210 ${A[0] + 70},${A[1] + 20}`, fill: 'none', stroke: cutBA > 0.5 ? OFF : BAD, 'stroke-width': 2.6, 'stroke-dasharray': cutBA > 0.5 ? '4 6' : null, 'marker-end': cutBA > 0.5 ? null : 'url(#ra-ahr)' });
      if (k === 1) { mono(480, 82, '#include "B.h"', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: 1 - cutAB });
        terminal(300, 246, 360, 62, ["error: unknown type name 'A'"], u > 0.6 ? 1 : 0, { lh: 20 });
        tx(480, 336, '서로를 먼저 펼치려다 한쪽 타입이 아직 없다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
        cross(480, 102, 11, pop(u, 1.5)); tx(480, 380, 'include 대신 class B;  로 끊는다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); }
      if (k === 2) { card(A[0], 300, 220, 90, { rx: 10, stroke: INK, sw: 2.2, s: pop(u, 0.2) }); mono(A[0], 284, 'class A', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
        mono(A[0], 312, 'B* partner;', { 'text-anchor': 'middle', 'font-size': 15, fill: ACC, opacity: fade(u, 0.4) });
        mono(A[0] + 130, 312, 'sizeof(A) = 8', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
        tx(480, 380, '포인터 크기는 B 의 정의 없이도 안다 (64비트 실행 결과)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
        mono(B[0], 300, 'B b;  라면 B 의 정의가 필요', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
      if (k === 3) { tx(480, 160, '고리가 없다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.1) });
        doc(480, 320, 'a.cpp', { w: 120, h: 50, s: pop(u, 1.3) }); grow(440, 296, A[0] + 30, A[1] + 36, seg(u, 1.5, 1.9), MUT); grow(520, 296, B[0] - 30, B[1] + 36, seg(u, 1.6, 2.0), MUT);
        tx(480, 380, '멤버를 실제로 쓰는 .cpp 에서만 두 헤더를 include', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); }
      return; }
    const P = c.beat.pitfalls || [], short = ['헤더에 using namespace', 'guard 없음', '순환 포함', '헤더에 함수 정의'];
    P.slice(0, 4).forEach((p, i) => { const cx = 250 + (i % 2) * 460, cy = 112 + Math.floor(i / 2) * 150, s = pop(u, 0.2 + i * 0.3), op = fade(u, 0.3 + i * 0.3);
      card(cx, cy, 420, 128, { rx: 12, stroke: GRID, sw: 1.6, s });
      tx(cx - 192, cy - 36, (i + 1) + '. ' + short[i], { 'font-size': 16, 'font-weight': 800, opacity: op });
      const one = (s) => s.split('\n').pop();
      cross(cx - 182, cy - 4, 7, op); mono(cx - 166, cy + 1, one(p.bad), { 'font-size': 13.5, fill: BAD, opacity: op });
      check(cx - 182, cy + 28, 7, op); mono(cx - 166, cy + 33, one(p.fix), { 'font-size': 13.5, fill: GOOD, opacity: op }); });
    tx(480, 400, '헤더는 약속만, 정의는 한 곳에, 이름은 방에', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: '우리 코드가 전역에 log(double)을 정의하고 <cmath> 도 포함했다. 이 장의 실행에서 std::log(2.0)은 무엇을 돌려줬는가?',
      o: ['0.693147', '1.0', '컴파일 에러로 실행되지 않았다'], a: 1,
      why: '전역 이름 공간이 하나뿐이라 우리 log가 표준 log 자리를 덮었다. 에러 없이 결과만 0.693 대신 1.0으로 틀렸다.' },
    { q: 'namespace ourApp { double log(double); } 안의 log의 진짜 이름은 무엇인가?',
      o: ['log', 'ourApp::log', 'std::log'], a: 1,
      why: '방 안에서 정의한 이름은 방 이름으로 정규화된다. 그래서 std::log와 섞이지 않고 각각 1.0, 0.693147을 돌려준다.' },
    { q: '익명 namespace 안에 둔 secretHelper를 다른 .cpp에서 부를 수 있는가?',
      o: ['부를 수 없다', 'using을 쓰면 부를 수 있다', 'extern을 붙이면 부를 수 있다'], a: 0,
      why: '익명 namespace의 이름은 외부 링크가 없어 그 파일 안에서만 보인다. C의 static 전역을 대신하는 방법이다.' },
    { q: 'main.cpp가 header.h의 선언만 보고 add(2, 3)을 부를 때, add의 본체를 연결하는 것은 누구인가?',
      o: ['전처리기', '컴파일러', '링커'], a: 2,
      why: 'main.o에는 add가 미해결로 남고, 링커가 impl.o의 정의와 잇는다. main.cpp만 링크하면 undefined symbol 에러가 난다.' },
    { q: 'util.h가 a.cpp와 net.h 두 길로 들어올 때 include guard가 하는 일은 무엇인가?',
      o: ['두 번째 포함을 에러로 만든다', '두 번째 포함의 본문을 통째로 건너뛴다', 'struct Point를 inline으로 바꾼다'], a: 1,
      why: '첫 포함에서 UTIL_H를 정의해 두면 두 번째는 #ifndef에서 걸려 #endif까지 건너뛴다. 그래서 redefinition 에러가 나지 않는다.' },
    { q: 'A.h의 class A가 B를 B* 로만 쓴다면 #include "B.h" 대신 무엇이면 충분한가?',
      o: ['전방 선언 class B;', 'using namespace B;', '#pragma once 하나 더'], a: 0,
      why: '포인터 크기는 B의 정의 없이도 정해진다(sizeof(A) = 8). 전방 선언으로 바꾸면 A.h와 B.h의 고리도 끊긴다.' },
  ];

  const summary = [
    '전역 이름 공간은 하나뿐이라 같은 이름이 겹치면 이번 실행처럼 표준 log마저 1.0을 돌려준다.',
    'namespace로 감싸면 이름이 ourApp::log가 되어 std::log와 섞이지 않는다.',
    '헤더에는 선언만 두고 정의는 .cpp 한 곳에 둔다. 둘은 링커가 잇는다.',
    'guard나 #pragma once로 중복 펼침을 막고, 포인터만 쓰면 전방 선언으로 include를 줄인다.',
  ];
  const review = [
    { q: '헤더에 int square(int x) { return x * x; }를 넣고 두 .cpp에서 include 했더니 링크 에러가 났다. 가장 간단한 해결은 무엇인가?',
      o: ['헤더에 #pragma once를 추가한다', '함수 앞에 inline을 붙인다', 'using namespace std; 를 추가한다'], a: 1,
      why: 'guard는 한 번역 단위 안의 중복만 막는다. 두 .cpp가 각각 정의를 가지면 duplicate symbol이고, inline을 붙이면 하나로 취급된다.' },
    { q: '팀원이 공용 헤더에 using namespace std; 를 넣은 뒤, 그 헤더를 쓰는 먼 파일에서 갑자기 이름 충돌이 났다. 고칠 방향은 무엇인가?',
      o: ['헤더에서 지우고 .cpp의 좁은 범위에서 필요한 이름만 using 한다', '충돌한 파일마다 #undef를 넣는다', '모든 함수를 익명 namespace에 넣는다'], a: 0,
      why: '헤더의 using 지시문은 include 하는 모든 파일로 퍼진다. using은 함수 블록처럼 효과가 끝나는 좁은 범위에만 둔다.' },
    { q: 'A.h와 B.h가 서로를 include 하자 unknown type name 에러가 났다. 두 클래스가 서로를 포인터로만 가리킨다면 먼저 할 일은 무엇인가?',
      o: ['두 헤더를 하나로 합친다', 'include를 지우고 class A; / class B; 전방 선언으로 바꾼다', '#ifndef guard를 하나 더 감싼다'], a: 1,
      why: '포인터 멤버는 상대 타입의 정의 없이도 크기가 정해진다. 전방 선언으로 고리를 끊고, 멤버를 실제로 쓰는 .cpp 에서만 include 한다.' },
  ];

  R.page({ title: '이름의 방과 헤더 빌드 흐름', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
