/* V-1-1 헤더·분할 컴파일·Makefile — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인: zig cc(clang)로 main.c·util.c 를 따로 -c 한 뒤 링크 → ./app 출력 sum=7, sizeof(Point)=8.
 * 가드를 뺀 util.h 를 두 번 include 하면 Point 에서만 "typedef redefinition" 에러가 난다.
 * 헤더에 add 본문을 두고 두 .c 가 include 하면 링크에서 "duplicate symbol: add". */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, spans, zone, sub, lbl, pill, banner, grow, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 소스 파일 한 장: 접힌 귀퉁이 + 머리(이름·역할) + 코드 줄. rows: [{ s, y?, op?, band?, col?, strike? }]
  function page(x, y, w, h, name, role, rows, o) { o = o || {}; const op = o.op ?? 1, f = 16, g = el('g', { opacity: op });
    el('path', { d: `M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash }, g);
    el('path', { d: `M${x + w - f},${y} V${y + f} H${x + w}`, fill: SOFT, stroke: o.stroke || INK, 'stroke-width': 1.5 }, g);
    mono(x + 14, y + 23, name, { 'font-size': 15.5, 'font-weight': 800, fill: o.stroke && o.stroke !== INK ? o.stroke : INK }, g);
    if (role) tx(x + w - 24, y + 23, role, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 }, g);
    el('line', { x1: x, y1: y + 34, x2: x + w, y2: y + 34, stroke: GRID, 'stroke-width': 1.5 }, g);
    const lh = o.lh || 22, fs = o.fs || 14;
    rows.forEach((r, i) => { if (!r || r.op === 0) return; const yy = r.y ?? y + 56 + i * lh, rop = r.op ?? 1;
      if (r.band) el('rect', { x: x + 6, y: yy - fs + 1, width: w - 12, height: fs + 8, rx: 4, fill: r.band, opacity: rop }, g);
      const s = r.cut != null ? r.s.slice(0, Math.round(r.s.length * clamp(r.cut))) : r.s;
      mono(x + 16, yy, s, { 'font-size': fs, fill: r.col || INK, opacity: rop, 'text-decoration': r.strike ? 'line-through' : null, 'font-weight': r.bold ? 700 : null }, g); });
    return g; }
  // 오브젝트 파일(.o): 심볼 칸. syms: [{ n, st:'def'|'hole'|'fill', op? }]
  function obj(x, y, w, name, syms, o) { o = o || {}; const rh = 34, h = 44 + syms.length * rh, op = o.op ?? 1, s = o.s ?? 1;
    const g = el('g', { opacity: op, transform: `translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-x - w / 2} ${-y - h / 2})` });
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || SOFT, stroke: o.stroke || INK, 'stroke-width': o.sw || 2.2 }, g);
    mono(x + 14, y + 26, name, { 'font-size': 16, 'font-weight': 800, fill: o.stroke && o.stroke !== INK ? o.stroke : INK }, g);
    if (o.tag) tx(x + w - 12, y + 26, o.tag, { 'font-size': 13.5, 'font-weight': 700, fill: o.tagCol || MUT, 'text-anchor': 'end' }, g);
    syms.forEach((m, i) => { const yy = y + 40 + i * rh, mop = m.op ?? 1;
      const hole = m.st === 'hole', fill = m.st === 'fill';
      el('rect', { x: x + 10, y: yy, width: w - 20, height: rh - 6, rx: 6, fill: hole ? PANEL : fill ? ACCBG : PANEL, stroke: hole ? BAD : fill ? ACC : GRID, 'stroke-width': hole ? 2 : 1.5, 'stroke-dasharray': hole ? '5 4' : null, opacity: mop }, g);
      mono(x + 22, yy + 19, m.n, { 'font-size': 14.5, 'font-weight': 700, fill: hole ? BAD : INK, opacity: mop }, g);
      tx(x + w - 22, yy + 19, hole ? '빈칸 (주소 ?)' : fill ? (m.from || '채워짐') : '정의', { 'font-size': 13.5, 'text-anchor': 'end', fill: hole ? BAD : fill ? ACC : MUT, 'font-weight': 600, opacity: mop }, g); });
    return { h, row: (i) => y + 40 + i * rh + 14 }; }
  // 길이 비율 u 만큼 자라는 꺾은선 (끝에 화살촉)
  function path(pts, u, col, o) { o = o || {}; if (u <= 0) return; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot; const out = [pts[0]];
    for (let i = 0; i < L.length; i++) { if (d >= L[i]) { out.push(pts[i + 1]); d -= L[i]; } else { const k = d / L[i]; out.push([lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]); break; } }
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round',
      'marker-end': u >= 0.98 && !o.plain ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const ok = (x, y, s, op) => { if (op <= 0) return; check(x, y - 5, 7, op); tx(x + 14, y, s, { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: op }); };
  const typed = (u, a, b) => clamp((u - a) / (b - a));

  // ---------- 1. 분할 컴파일 ----------
  function s1(t, c) { const { k, u } = c;
    // util.h · util.c · main.c 세 장
    page(24, 30, 290, 112, 'util.h', '선언', [{ s: 'int add(int, int);', band: k === 1 ? INFOBG : null }, { s: 'int sub(int, int);' }]);
    const cDim = k <= 2 ? 0.42 : 1, editing = k === 4;
    page(24, 236, 290, 142, 'util.c', '정의', [{ s: 'int add(int a, int b) {' }, { s: '  g_count++;' }, { s: '  return a + b;', band: editing ? WARNBG : null }, { s: '}' }],
      { op: cDim, stroke: editing ? WARN : k === 3 ? ACC : INK });
    const inc = k === 0 ? typed(u, 0.2, 0.8) : 1, landed = k > 0 || u > 1.8;
    page(356, 30, 340, 236, 'main.c', '사용', [
      { s: '#include "util.h"', cut: inc, band: k === 0 ? ACCBG : null, bold: true },
      { s: 'int add(int, int);', col: ACC, op: landed ? (k === 0 ? fade(u, 1.8) : 1) : 0, band: landed ? ACCBG : null },
      { s: 'int main(void) {', op: k === 0 ? fade(u, 2.2) : 1 },
      { s: '  int s = add(3, 4);', op: k === 0 ? fade(u, 2.3) : 1, band: k === 1 ? INFOBG : null, bold: k === 1 },
      { s: '  printf("sum=%d\\n", s);', op: k === 0 ? fade(u, 2.4) : 1 },
      { s: '}', op: k === 0 ? fade(u, 2.4) : 1 }], { stroke: k === 4 ? GOOD : INK });
    if (k === 0) { fly(170, 86, 470, 108, seg(u, 0.9, 1.8), 'int add(int, int);', { mono: true });
      el('line', { x1: 318, y1: 300, x2: 400, y2: 300, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 2.0) });
      cross(359, 300, 9, pop(u, 2.0)); note(420, 305, '본문은 따라오지 않는다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 1) { // 호출을 프로토타입에 대어 본다
      path([[640, 122], [674, 122], [674, 100], [652, 100]], E(u, 0.2, 0.9), ACC);
      [['인자 2개', 0.9], ['3 → int, 4 → int', 1.3], ['반환 int → s', 1.7]].forEach(([s, a], i) => ok(370 + i * 0, 300 + i * 30, s, fade(u, a)));
      note(620, 330, '검사 기준은 프로토타입', fade(u, 2.1), { fill: ACC }); return; }
    // k ≥ 2: 오른쪽에 main.o
    const ox = 740, oy = 52, done = k >= 3 ? (k === 3 ? seg(u, 1.5, 2.1) : 1) : 0;
    grow(698, 120, 736, 120, k === 2 ? E(u, 0.1, 0.6) : 1, MUT);
    const o = obj(ox, oy, 200, 'main.o', [{ n: 'main', st: 'def' }, { n: 'add', st: done >= 1 ? 'fill' : 'hole', from: 'util.o 의 add' }], { s: k === 2 ? pop(u, 0.5) : 1 });
    if (k === 2) { mono(717, 112, 'cc -c', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      note(740, 214, '본문을 몰라도', fade(u, 1.4)); note(740, 238, '컴파일은 통과', fade(u, 1.6), { fill: GOOD });
      note(420, 316, 'add 자리는 비워 둔 채 main.o 가 나온다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 3) { path([[316, 330], [720, 330], [720, o.row(1)], [748, o.row(1)]], E(u, 0.2, 1.5), ACC, { dash: '7 5' });
      dot([[316, 330], [720, 330], [720, o.row(1)], [760, o.row(1)]], seg(u, 1.4, 2.2), ACC, 7);
      pill(520, 360, '링크 단계에서 연결', ACC, pop(u, 1.8), { fs: 14 });
      note(740, 214, '선언 · 정의 · 사용', fade(u, 2.1)); note(740, 238, '세 파일이 제자리', fade(u, 2.2), { fill: ACC }); return; }
    // k = 4: util.c 만 다시 컴파일
    pill(212, 222, '수정', WARN, pop(u, 0.2), { fs: 13.5 });
    card(820, 268, 220, 46, { rx: 10, text: 'util.c → 다시 컴파일', fs: 14.5, stroke: WARN, color: INK, s: pop(u, 0.6) });
    card(820, 326, 220, 46, { rx: 10, text: 'main.c → 그대로', fs: 14.5, stroke: GOOD, color: GOOD, s: pop(u, 1.0) });
    banner(526, 300, 'main.o 는 재사용', pop(u, 1.5));
    note(420, 360, '선언이 그대로면 main.c 는 건드리지 않는다', fade(u, 2.0), { fill: MUT, 'font-weight': 600 }); }

  // ---------- 2. 헤더와 include guard ----------
  const H = [ // util.h 줄과 나타나는 beat
    ['#ifndef UTIL_H', 0], ['#define UTIL_H', 0], null, ['#define MAX_LEN 128', 1], null,
    ['typedef struct {', 2], ['    int x, y;', 2], ['} Point;', 2], null,
    ['int add(int a, int b);', 3], ['int sub(int a, int b);', 3], null, ['extern int g_count;', 4], null, ['#endif', 5]];
  function macroTable(x, y, w, rows) { el('rect', { x, y, width: w, height: 36 + rows.length * 34, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 14, y + 22, '전처리기가 기억하는 매크로', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    rows.forEach(([n, v, op, hot], i) => { const yy = y + 34 + i * 34;
      if (hot) el('rect', { x: x + 6, y: yy, width: w - 12, height: 30, rx: 6, fill: ACCBG, opacity: op });
      mono(x + 18, yy + 21, n, { 'font-size': 15, 'font-weight': 700, opacity: op, fill: hot ? ACC : INK });
      mono(x + w - 18, yy + 21, v, { 'font-size': 15, opacity: op, 'text-anchor': 'end' }); }); }
  function s2(t, c) { const { k, u } = c;
    let yy = 20 + 56; const rows = H.map((h) => { if (!h) { yy += 8; return null; } const [s, b] = h, r = { s, y: yy, op: b < k ? 1 : b === k ? 1 : 0, cut: b === k ? typed(u, 0.15, 0.9) : null, band: b === k ? ACCBG : null };
      if (k === 5 && b === 5) r.col = ACC; yy += 22; return r; });
    page(24, 20, 420, 380, 'util.h', '여러 .c 가 함께 보는 선언', rows);
    const RX = 480, RW = 456;
    const mrows = [['UTIL_H', '정의됨', k === 0 ? fade(u, 0.9) : 1, k === 0 || k === 5], ['MAX_LEN', '128', k < 1 ? 0 : k === 1 ? fade(u, 0.9) : 1, k === 1]];
    macroTable(RX, 20, RW, mrows.filter((r) => r[2] > 0));
    const Y0 = 140;
    if (k === 0) { note(RX, Y0 + 40, '첫 include', fade(u, 1.2));
      spans(RX, Y0 + 76, [['#ifndef UTIL_H', { fill: INK, 'font-weight': 700 }], ['  →  아직 없음', { fill: MUT }]], { opacity: fade(u, 1.4) });
      ok(RX, Y0 + 112, '통과 · 아래 내용을 펼친다', fade(u, 1.8));
      sub(RX + RW / 2, Y0 + 170, '바로 다음 줄에서 UTIL_H 를 정의해 둔다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1) { [['main.c', 0], ['util.c', 1]].forEach(([n, i]) => { const cx = RX + 110 + i * 236;
        card(cx, Y0 + 150, 190, 64, { rx: 10, text: n + '\nMAX_LEN = 128', fs: 14.5, mono: true, s: pop(u, 0.5 + i * 0.3) });
        dot([[RX + RW - 60, 106], [cx, Y0 + 116]], seg(u, 1.0 + i * 0.3, 1.8 + i * 0.3), ACC, 6); });
      sub(RX + RW / 2, Y0 + 230, '값을 바꿀 때는 헤더 한 줄만 고친다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 2) { note(RX, Y0 + 20, 'Point 한 개의 메모리', fade(u, 0.6));
      const cw = 96; ['x', 'y'].forEach((n, i) => { const x = RX + i * (cw + 6), s = pop(u, 0.8 + i * 0.25);
        card(x + cw / 2, Y0 + 66, cw, 48, { rx: 6, text: 'int ' + n, fs: 15, mono: true, s, stroke: INFO });
        mono(x + cw / 2, Y0 + 110, '4바이트', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.25) }); });
      mono(RX + 2 * (cw + 6) + 12, Y0 + 72, '= sizeof(Point) 8', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      card(RX + RW / 2, Y0 + 200, RW, 64, { rx: 10, stroke: BAD, fill: BADBG, text: '같은 번역 단위에 두 번 펼치면\ntypedef 중복 정의 에러', fs: 14.5, color: BAD, s: pop(u, 2.0) }); return; }
    if (k === 3) { ['add', 'sub'].forEach((n, i) => { const y = Y0 + 30 + i * 70, s = pop(u, 0.4 + i * 0.3);
        card(RX + 120, y, 240, 50, { rx: 25, text: `${n}(int, int) → int`, fs: 15, mono: true, stroke: INFO, s });
        el('rect', { x: RX + 262, y: y - 22, width: 180, height: 44, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.9 + i * 0.3) });
        tx(RX + 352, y + 5, '{ 본문 없음 }', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9 + i * 0.3) }); });
      note(RX, Y0 + 180, '모양만 적었으니 여러 .c 가 include 해도 된다', fade(u, 1.6));
      note(RX, Y0 + 212, '본문을 여기 두면 .o 마다 add 가 생긴다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 4) { // extern 은 자리가 없고, 실체는 util.c 에 4바이트 하나
      note(RX, Y0 + 14, 'util.h', fade(u, 0.3)); mono(RX + 60, Y0 + 14, 'extern int g_count;', { 'font-size': 14.5, opacity: fade(u, 0.3) });
      el('rect', { x: RX, y: Y0 + 30, width: 160, height: 46, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.5) });
      tx(RX + 80, Y0 + 59, '자리 없음', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      grow(RX + 168, Y0 + 53, RX + 236, Y0 + 53, E(u, 0.9, 1.4), ACC);
      note(RX + 246, Y0 + 14, 'util.c', fade(u, 1.3)); mono(RX + 300, Y0 + 14, 'int g_count = 0;', { 'font-size': 14.5, opacity: fade(u, 1.3) });
      for (let i = 0; i < 4; i++) { el('rect', { x: RX + 246 + i * 48, y: Y0 + 30, width: 44, height: 46, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.4 + i * 0.12) });
        mono(RX + 268 + i * 48, Y0 + 59, '00', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.12) }); }
      sub(RX + 246 + 94, Y0 + 98, '실체 4바이트는 여기 하나', fade(u, 1.9), { 'font-size': 14 });
      card(RX + RW / 2, Y0 + 186, RW, 64, { rx: 10, stroke: WARN, fill: WARNBG, text: '헤더에 int g_count; 를 쓰면\ninclude 한 .o 마다 전역이 생긴다', fs: 14.5, s: pop(u, 2.2) }); return; }
    // k = 5: 두 번째 include 는 통째로 건너뛴다
    [['a.h 가 include', true, 0.3], ['b.h 가 include', false, 1.2]].forEach(([s, first, a], i) => { const y = Y0 + 12 + i * 110, op = fade(u, a);
      note(RX, y, `${i + 1}번째 · ${s}`, op);
      spans(RX, y + 30, [['#ifndef UTIL_H', { 'font-weight': 700 }], [first ? '  → 아직 없음' : '  → 이미 있음', { fill: first ? GOOD : WARN }]], { opacity: op });
      const bw = RW * (first ? E(u, a + 0.4, a + 1.0) : 1);
      el('rect', { x: RX, y: y + 44, width: Math.max(2, bw), height: 34, rx: 6, fill: first ? GOODBG : PANEL, stroke: first ? GOOD : OFF, 'stroke-width': 2, 'stroke-dasharray': first ? null : '6 5', opacity: op });
      tx(RX + 14, y + 66, first ? 'Point · add · sub · g_count 펼침' : '블록 전체를 건너뜀', { 'font-size': 14.5, 'font-weight': 700, fill: first ? GOOD : MUT, opacity: first ? fade(u, a + 0.9) : fade(u, a + 0.4), 'text-decoration': first ? null : 'line-through' }); });
    sub(RX + RW / 2, Y0 + 262, '#endif 까지가 한 블록이다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 3. 컴파일 & 링크 ----------
  // int 4바이트를 바이트 칸으로 (x86 은 낮은 바이트가 앞: 1 → 01 00 00 00)
  function cellRow(x, y, n, val, o) { o = o || {}; const v = +val;
    for (let i = 0; i < n; i++) { el('rect', { x: x + i * 46, y, width: 42, height: 44, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: o.op ?? 1 });
      mono(x + i * 46 + 21, y + 28, ((v >> (8 * i)) & 255).toString(16).padStart(2, '0'), { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
    mono(x + n * 46 + 10, y + 29, '= ' + val, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: o.op ?? 1 }); }
  const SRC = { m: [230, 48], u: [690, 48] };
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const body = k === 1 ? 1 : 0;
      page(24, 24, 470, 214, 'util.c', '정의', [{ s: '#include "util.h"', band: k === 0 ? ACCBG : null }, { s: '' }, { s: 'int g_count = 0;', band: k === 0 ? ACCBG : null, bold: k === 0 },
        { s: '' }, { s: 'int add(int a, int b) { g_count++; return a + b; }', op: body, cut: k === 1 ? typed(u, 0.2, 0.9) : null, band: k === 1 ? ACCBG : null },
        { s: 'int sub(int a, int b) { g_count++; return a - b; }', op: body, cut: k === 1 ? typed(u, 0.5, 1.2) : null, band: k === 1 ? ACCBG : null }], { fs: 13.5 });
      note(560, 52, 'g_count 의 실체 (int)', 1);
      const gv = k === 1 ? (u > 1.9 ? '1' : '0') : '0';
      cellRow(560, 68, 4, gv, { op: k === 0 ? fade(u, 0.6) : 1 });
      mono(560 + 90, 136, '4바이트', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (k === 0) { pill(650, 196, 'util.h · extern int g_count;', INFO, pop(u, 1.2), { mono: true, fs: 13.5 });
        grow(650, 180, 650, 146, E(u, 1.5, 2.0), INFO, { dash: '5 4' });
        note(24, 290, '헤더를 같이 include 하면 선언과 정의가 어긋날 때', fade(u, 1.8), { 'font-weight': 600 });
        note(24, 316, '컴파일러가 바로 잡아 준다', fade(u, 1.9), { fill: GOOD }); return; }
      path([[494, 167], [530, 167], [530, 90], [556, 90]], E(u, 1.0, 1.7), ACC);
      pill(780, 196, 'add(3, 4) 한 번 → g_count 1', ACC, pop(u, 1.9), { mono: true, fs: 13.5 });
      card(260, 310, 470, 60, { rx: 10, stroke: GOOD, fill: GOODBG, text: 'main.c 는 이 본문을 본 적이 없지만\n이미 컴파일을 통과했다', fs: 14.5, s: pop(u, 2.1) }); return; }
    // 파이프라인: 소스 → .o → app
    const editing = k === 4;
    card(SRC.m[0], SRC.m[1], 150, 40, { rx: 8, text: 'main.c', fs: 15, mono: true, fw: 800, s: k === 2 ? pop(u, 0.1) : 1, stroke: editing ? OFF : INK, color: editing ? MUT : INK });
    card(SRC.u[0], SRC.u[1], 150, 40, { rx: 8, text: 'util.c', fs: 15, mono: true, fw: 800, s: k === 2 ? pop(u, 0.2) : 1, stroke: editing ? WARN : INK });
    if (editing) pill(SRC.u[0] + 120, SRC.u[1], '수정', WARN, pop(u, 0.2), { fs: 13.5 });
    const g1 = k === 2 ? E(u, 0.3, 0.9) : 1, g2 = k === 2 ? E(u, 0.5, 1.1) : 1;
    grow(SRC.m[0], 70, SRC.m[0], 118, g1, editing ? OFF : MUT); grow(SRC.u[0], 70, SRC.u[0], 118, g2, editing ? WARN : MUT);
    mono(SRC.m[0] + 12, 100, 'gcc -c', { 'font-size': 13.5, fill: MUT, opacity: k === 2 ? fade(u, 0.6) : editing ? 0.4 : 1 });
    mono(SRC.u[0] + 12, 100, 'gcc -c', { 'font-size': 13.5, fill: editing ? WARN : MUT, opacity: k === 2 ? fade(u, 0.8) : 1 });
    if (editing) dot([[SRC.u[0], 70], [SRC.u[0], 120]], seg(u, 0.5, 1.1), WARN, 6);
    const filled = k === 3 ? u > 1.25 : k > 3;
    const mo = obj(110, 124, 240, 'main.o', [{ n: 'main', st: 'def' }, { n: 'add', st: filled ? 'fill' : 'hole', from: 'util.o 에서' }],
      { s: k === 2 ? pop(u, 0.9) : 1, tag: editing ? '재사용' : null, tagCol: GOOD, stroke: editing ? GOOD : INK });
    const uo = obj(570, 124, 240, 'util.o', [{ n: 'add', st: 'def' }, { n: 'sub', st: 'def' }, { n: 'g_count', st: 'def' }],
      { s: k === 2 ? pop(u, 1.1) : editing ? 1 + 0.06 * Math.sin(clamp(seg(u, 1.0, 1.6)) * Math.PI) : 1, tag: editing ? '다시 만듦' : null, tagCol: WARN, stroke: editing ? WARN : INK });
    if (k === 2) { note(110, 330, 'main.o 의 add 는 아직 빈칸이다', fade(u, 1.6), { fill: BAD });
      note(110, 358, '-c 는 링크 없이 오브젝트까지만', fade(u, 2.0), { fill: MUT, 'font-weight': 600 }); return; }
    // 링크
    const AX = 480, AY = 372;
    const lk = k === 3 ? E(u, 1.4, 2.0) : editing ? E(u, 1.6, 2.2) : 1;
    grow(230, 124 + mo.h + 4, AX - 60, AY - 22, lk, ACC); grow(690, 124 + uo.h + 4, AX + 60, AY - 22, lk, ACC);
    if (k === 3) fly(690, uo.row(0), 300, mo.row(1), seg(u, 0.3, 1.25), 'add', { mono: true });
    card(AX, AY, 210, 46, { rx: 10, text: 'app  (실행 파일)', fs: 15, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: k === 3 ? pop(u, 1.9) : editing ? pop(u, 2.0) : 1 });
    if (k === 3) { mono(AX + 130, AY + 6, '$ ./app  →  sum=7', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    note(24, 400, 'gcc -c 1번 + 링크 1번', fade(u, 2.2), { fill: WARN }); }

  // ---------- 4. Makefile 규칙과 재빌드 ----------
  const N = { 'main.c': [110, 92], 'util.h': [110, 206], 'util.c': [110, 320], 'main.o': [450, 132], 'util.o': [450, 280], app: [790, 206] };
  const RULES = [['app', ['main.o', 'util.o']], ['main.o', ['main.c', 'util.h']], ['util.o', ['util.c', 'util.h']]];
  function node(n, o) { o = o || {}; const [x, y] = N[n];
    card(x, y, 150, 46, { rx: 10, text: n, fs: 16, mono: true, fw: 800, stroke: o.col || INK, color: o.col || INK, fill: o.fill, dash: o.dash, s: o.s, op: o.op });
    if (o.ts) mono(x, y + 42, o.ts, { 'font-size': 14, 'text-anchor': 'middle', fill: o.tsCol || MUT, 'font-weight': o.tsCol ? 700 : 400, opacity: o.op ?? 1 }); }
  function edge(a, b, u, col, o) { const [x1, y1] = N[a], [x2, y2] = N[b]; grow(x1 + 78, y1, x2 - 80, y2, u, col || MUT, o); }
  function ruleText(x, y, target, deps, op) { spans(x, y, [[target, { fill: ACC, 'font-weight': 800 }], [' : ', { fill: MUT }], [deps.join(' '), { fill: INK }]], { 'font-size': 16, opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // 규칙의 문법: 타깃 : 의존성 / 탭 + 명령
      ruleText(150, 90, 'app', ['main.o', 'util.o'], fade(u, 0.2));
      [['타깃', 150, 'app'], ['의존성', 222, 'main.o util.o']].forEach(([s, x, w], i) => { const ww = tw(w, 16);
        el('path', { d: `M${x},104 v8 h${ww} v-8`, fill: 'none', stroke: i ? INK : ACC, 'stroke-width': 2, opacity: fade(u, 0.5 + i * 0.2) });
        tx(x + ww / 2, 134, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: i ? INK : ACC, opacity: fade(u, 0.5 + i * 0.2) }); });
      // 탭으로 들여쓴 명령
      const tabW = 72 * E(u, 0.9, 1.3);
      el('rect', { x: 150, y: 168, width: Math.max(2, tabW), height: 30, rx: 5, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 });
      if (tabW > 40) mono(186, 189, 'Tab', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' });
      mono(232, 189, 'gcc main.o util.o -o app', { 'font-size': 16, opacity: fade(u, 1.3) }); ok(560, 189, '규칙으로 읽힌다', fade(u, 1.5));
      // 스페이스로 들여쓴 명령
      for (let i = 0; i < 4; i++) el('circle', { cx: 162 + i * 18, cy: 254, r: 3.5, fill: BAD, opacity: fade(u, 1.8 + i * 0.06) });
      tx(186, 280, '스페이스 4칸', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      mono(232, 259, 'gcc main.o util.o -o app', { 'font-size': 16, opacity: fade(u, 1.9), fill: MUT });
      card(480, 346, 560, 50, { rx: 10, stroke: BAD, fill: BADBG, text: 'Makefile:2: *** missing separator.  Stop.', fs: 15, mono: true, color: BAD, s: pop(u, 2.2) }); return; }
    const clean = k === 4;
    // k = 5 의 시각 (예시)
    const T = { 'main.c': '10:00', 'util.h': '10:00', 'util.c': '10:00', 'main.o': '10:01', 'util.o': '10:01', app: '10:02' };
    const ph = k === 5 ? (u < 0.6 ? 0 : u < 1.3 ? 1 : u < 2.0 ? 2 : 3) : -1;
    if (k === 5) { if (ph >= 1) T['util.c'] = '10:05'; if (ph >= 2) T['util.o'] = '10:06'; if (ph >= 3) T.app = '10:06'; }
    const show = (n) => (k === 1 ? ['app', 'main.o', 'util.o'].includes(n) : k === 2 ? n !== 'util.c' : true);
    // 간선
    RULES.forEach(([tg, deps], ri) => deps.forEach((d, di) => { const on = k >= 5 || k === 4 || ri + 1 <= k; if (!on) return;
      const g = ri + 1 === k ? E(u, 0.3 + di * 0.25, 0.9 + di * 0.25) : 1;
      const hot = k === 5 && ((d === 'util.c' && ph >= 1) || (tg === 'app' && d === 'util.o' && ph >= 2));
      edge(d, tg, g, hot ? WARN : ri + 1 === k ? ACC : MUT, { op: clean ? 0.35 : 1 }); }));
    Object.keys(N).forEach((n) => { if (!show(n)) return; const isSrc = n.endsWith('.c') || n.endsWith('.h');
      const appear = (k === 1 && n !== 'app') || (k === 2 && ['main.c', 'util.h'].includes(n)) || (k === 3 && n === 'util.c') ? pop(u, 0.2) : 1;
      let o = { s: appear };
      if (clean && !isSrc) o = { dash: '6 5', col: OFF, op: 1 - 0.55 * E(u, 0.8, 1.6) };
      if (k === 5) { o.ts = T[n];
        if (n === 'util.c' && ph >= 1) { o.col = WARN; o.tsCol = WARN; }
        if (n === 'util.o') { if (ph === 1) { o.col = BAD; o.tsCol = BAD; } if (ph >= 2) { o.col = ACC; o.tsCol = ACC; o.fill = ACCBG; } }
        if (n === 'app') { if (ph === 1 || ph === 2) o.col = BAD; if (ph >= 3) { o.col = ACC; o.tsCol = ACC; o.fill = ACCBG; } }
        if (n === 'main.o' && ph >= 2) { o.col = GOOD; } }
      node(n, o); });
    if (k === 1) { ruleText(40, 396, 'app', ['main.o', 'util.o'], fade(u, 0.2)); note(620, 120, '둘 중 하나라도 app 보다', fade(u, 1.4), { 'font-size': 14.5 }); note(620, 144, '새것이면 다시 링크', fade(u, 1.5), { 'font-size': 14.5, fill: ACC }); return; }
    if (k === 2) { ruleText(40, 396, 'main.o', ['main.c', 'util.h'], fade(u, 0.2)); note(40, 296, 'util.h 를 빠뜨리면 헤더를 고쳐도', fade(u, 1.5), { 'font-size': 14.5, fill: BAD }); note(40, 320, 'main.o 는 다시 안 만들어진다', fade(u, 1.6), { 'font-size': 14.5, fill: BAD }); return; }
    if (k === 3) { ruleText(40, 396, 'util.o', ['util.c', 'util.h'], fade(u, 0.2)); note(620, 330, 'util.h 는 두 .o 가', fade(u, 1.5), { 'font-size': 14.5 }); note(620, 354, '함께 기대는 재료', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 4) { spans(40, 396, [['clean', { fill: ACC, 'font-weight': 800 }], [' :   ', { fill: MUT }], ['rm -f app main.o util.o', {}]], { 'font-size': 16, opacity: fade(u, 0.2) });
      ['main.o', 'util.o', 'app'].forEach((n, i) => cross(N[n][0] + 64, N[n][1] - 20, 9, pop(u, 1.0 + i * 0.2)));
      pill(790, 330, 'clean 은 파일이 아니다', WARN, pop(u, 1.8), { fs: 14 }); return; }
    // k = 5: 시각 비교로 낡은 것만
    const msg = ['모두 최신 · make 는 할 일 없음', 'util.c 10:05 > util.o 10:01 → 낡음', 'util.o 만 다시 컴파일 · main.o 건너뜀', 'app 다시 링크 → 다시 최신'][ph];
    card(480, 392, tw(msg, 15) + 40, 36, { rx: 18, fill: ph === 1 ? BADBG : ph >= 2 ? ACCBG : SOFT, stroke: 'none', text: msg, fs: 15, color: ph === 1 ? BAD : ph >= 2 ? ACC : INK });
    if (ph >= 2) pill(450, 200, '건너뜀', GOOD, 1, { fs: 13.5 });
    tx(940, 24, '시각은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }

  // ---------- 5. 변수 · 자동 변수 · 패턴 규칙 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { // 변수 정의 → 명령이 펼쳐진다
      [['CC', 'gcc'], ['CFLAGS', '-Wall -O2'], ['OBJS', 'main.o util.o']].forEach(([n, v], i) => { const y = 54 + i * 44, op = k === 0 ? fade(u, 0.2 + i * 0.25) : 1;
        spans(60, y, [[n.padEnd(7), { fill: ACC, 'font-weight': 800 }], ['= ', { fill: MUT }], [v, {}]], { 'font-size': 17, opacity: op }); });
      tx(500, 54, '고칠 곳이 한 줄로 모인다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: k === 0 ? fade(u, 1.0) : 1 });
      const Y = 236;
      spans(60, Y - 34, [['app', { fill: ACC, 'font-weight': 800 }], [': $(OBJS)', {}]], { 'font-size': 17, opacity: k === 0 ? fade(u, 1.1) : 1 });
      // 명령 틀: 토큰마다 펼친 값
      const toks = [['$(CC)', 'gcc', 0], ['$(CFLAGS)', '-Wall -O2', 0], ['$^', 'main.o util.o', 1], ['-o', '-o', -1], ['$@', 'app', 1]];
      let x = 60; toks.forEach(([raw, val, kind], i) => { const w = Math.max(tw(raw, 17), tw(val, 17)) + 14, cx = x + w / 2;
        const exp = kind < 0 ? 0 : kind === 0 ? (k === 0 ? E(u, 1.5 + i * 0.3, 2.1 + i * 0.3) : 1) : k === 1 ? E(u, 0.6 + (i - 2) * 0.5, 1.2 + (i - 2) * 0.5) : 0;
        mono(cx, Y, raw, { 'font-size': 17, 'text-anchor': 'middle', fill: kind < 0 ? INK : kind === 0 ? ACC : INFO, 'font-weight': 700, opacity: k === 0 && kind > 0 ? 1 : 1 });
        if (exp > 0) { grow(cx, Y + 10, cx, Y + 56, exp, kind === 0 ? ACC : INFO);
          if (exp > 0.9) mono(cx, Y + 80, val, { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 700, fill: kind === 0 ? ACC : INFO }); }
        else if (kind < 0 && (k === 1 || u > 2)) mono(cx, Y + 80, val, { 'font-size': 17, 'text-anchor': 'middle', fill: MUT });
        x += w + 10; });
      if (k === 0) { note(60, 372, '$(CC) · $(CFLAGS) 자리에 값이 들어간다', fade(u, 2.3), { fill: ACC }); return; }
      [['$@', '타깃 이름', 'app'], ['$^', '의존성 전부', 'main.o util.o']].forEach(([v, m, e], i) => { const y = 356 + i * 30;
        spans(60, y, [[v, { fill: INFO, 'font-weight': 800 }], ['  ' + m + '  →  ', { fill: MUT }], [e, { 'font-weight': 700 }]], { 'font-size': 15.5, opacity: fade(u, 1.8 + i * 0.3) }); });
      tx(940, 24, '실제 실행 명령', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) }); return; }
    if (k === 2) { // 패턴 규칙 하나가 두 규칙을 찍어 낸다
      spans(60, 54, [['%.o', { fill: ACC, 'font-weight': 800 }], [': ', { fill: MUT }], ['%.c', { fill: ACC, 'font-weight': 800 }], [' util.h', {}]], { 'font-size': 18, opacity: fade(u, 0.2) });
      mono(60, 86, '\t$(CC) $(CFLAGS) -c $< -o $@'.replace('\t', '    '), { 'font-size': 16, fill: MUT, opacity: fade(u, 0.4) });
      ['main', 'util'].forEach((st, i) => { const y = 160 + i * 120, a = 0.7 + i * 0.6, op = fade(u, a);
        grow(140, 96, 140 + i * 0, y - 22, E(u, a - 0.2, a + 0.2), ACC, { plain: true, op: 0.6 });
        pill(110, y, '% = ' + st, ACC, pop(u, a), { mono: true, fs: 14 });
        spans(200, y + 5, [[st + '.o', { fill: ACC, 'font-weight': 800 }], [': ', { fill: MUT }], [st + '.c', { 'font-weight': 700 }], [' util.h', {}]], { 'font-size': 16, opacity: op });
        spans(200, y + 37, [['gcc -Wall -O2 -c ', { fill: MUT }], [st + '.c', { fill: INFO, 'font-weight': 800 }], [' -o ', { fill: MUT }], [st + '.o', { fill: INFO, 'font-weight': 800 }]], { 'font-size': 16, opacity: fade(u, a + 0.4) });
        if (i === 0) { tx(740, y + 37, '$< = ' + st + '.c', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, a + 0.8) }); } });
      note(60, 404, '파일이 100개여도 규칙은 이 한 줄', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 3) { // .PHONY: clean 이라는 파일이 있을 때
      zone(30, 24, 280, 360, '작업 폴더', { fill: SOFT });
      ['Makefile', 'app', 'main.o', 'util.o', 'clean'].forEach((f, i) => { const y = 72 + i * 50, hot = f === 'clean';
        card(170, y, 220, 38, { rx: 6, text: f, fs: 15, mono: true, stroke: hot ? WARN : GRID, fill: hot ? WARNBG : PANEL, color: INK, s: hot ? pop(u, 0.3) : 1 }); });
      tx(170, 362, '우연히 생긴 파일 clean', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
      [['.PHONY 없음', false, 0.9], ['.PHONY: clean', true, 1.6]].forEach(([h, on, a], i) => { const x = 350 + i * 300, op = fade(u, a);
        card(x + 135, 60, 270, 44, { rx: 10, text: h, fs: 15, mono: true, fw: 800, stroke: on ? GOOD : BAD, color: on ? GOOD : BAD, op });
        mono(x + 12, 124, '$ make clean', { 'font-size': 15, opacity: op });
        tx(x + 12, 160, on ? '파일 여부를 보지 않고 실행' : 'clean 파일이 이미 최신', { 'font-size': 14.5, fill: on ? GOOD : BAD, 'font-weight': 700, opacity: op });
        tx(x + 12, 184, on ? 'rm -f app main.o util.o' : '→ 아무것도 지우지 않는다', { 'font-size': 14.5, fill: MUT, opacity: op, class: on ? 'mono' : null });
        ['app', 'main.o', 'util.o'].forEach((f, j) => { const y = 226 + j * 46, gone = on && u > a + 0.6 + j * 0.15;
          card(x + 135, y, 200, 36, { rx: 6, text: f, fs: 14.5, mono: true, stroke: gone ? OFF : INK, color: gone ? OFF : INK, dash: gone ? '5 4' : null, op });
          if (gone) cross(x + 250, y, 7, 1); else if (!on && op > 0.5) check(x + 250, y, 7, op); }); });
      return; }
    // k = 4: 헤더를 고치면 두 .o 가 함께 다시 만들어진다 + 실무 사고 4가지
    const hn = [480, 60], mo = [240, 176], uo = [720, 176], ap = [480, 280];
    card(hn[0], hn[1], 150, 44, { rx: 10, text: 'util.h', fs: 16, mono: true, fw: 800, stroke: WARN, fill: WARNBG });
    pill(hn[0] + 118, hn[1], '수정', WARN, pop(u, 0.2), { fs: 13.5 });
    [mo, uo].forEach((p, i) => { grow(hn[0] + (i ? 60 : -60), hn[1] + 22, p[0] + (i ? -40 : 40), p[1] - 22, E(u, 0.4, 1.0), WARN);
      card(p[0], p[1], 150, 44, { rx: 10, text: i ? 'util.o' : 'main.o', fs: 16, mono: true, fw: 800, stroke: u > 1.2 ? ACC : BAD, fill: u > 1.2 ? ACCBG : PANEL, color: u > 1.2 ? ACC : BAD });
      grow(p[0] + (i ? -40 : 40), p[1] + 22, ap[0] + (i ? 60 : -60), ap[1] - 22, E(u, 1.3, 1.7), ACC); });
    tx(480, 180, '%.o: %.c util.h', { 'font-size': 15, class: 'mono', 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
    card(ap[0], ap[1], 150, 44, { rx: 10, text: 'app', fs: 16, mono: true, fw: 800, stroke: ACC, fill: u > 1.8 ? ACCBG : PANEL, color: ACC });
    [['헤더에 정의', BAD], ['가드 누락', BAD], ['헤더 의존성 누락', WARN], ['의존성 과다', WARN]].forEach(([s, col], i) => {
      pill(128 + i * 236, 380, s, col, pop(u, 2.0 + i * 0.12), { fs: 14 }); }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'main.c가 util.h만 include하고 add(3, 4)를 부를 때, 컴파일러가 확인하는 것은 무엇인가?',
      o: ['util.c에 있는 add의 본문 코드', 'util.h의 프로토타입에 적힌 인자 개수와 타입', 'util.o가 이미 만들어져 있는지 여부'], a: 1,
      why: '컴파일 단계는 프로토타입 int add(int, int);만 보고 호출을 검사한다. 본문은 링크 단계에서 util.o와 짝지어진다.' },
    { q: 'include guard가 있는 util.h를 한 파일에서 두 번째로 include하면 무슨 일이 일어나는가?',
      o: ['UTIL_H가 이미 정의돼 있어 #endif까지 통째로 건너뛴다', 'Point 구조체가 다시 정의되어 에러가 난다', '매크로 MAX_LEN 값이 두 배가 된다'], a: 0,
      why: '첫 include에서 #define UTIL_H가 실행되었으므로, 두 번째에는 #ifndef UTIL_H가 거짓이 되어 블록 전체가 빠진다.' },
    { q: 'gcc -c main.c로 만든 main.o 안에서 add 자리는 어떤 상태인가?',
      o: ['add의 본문이 복사되어 들어 있다', '주소가 비어 있는 빈칸(undefined 심볼)이다', 'util.c를 자동으로 찾아 채워 둔다'], a: 1,
      why: '-c는 링크하지 않고 오브젝트까지만 만든다. 빈칸은 gcc main.o util.o -o app으로 링크할 때 util.o의 add로 채워진다.' },
    { q: 'util.c 한 파일만 고치고 make를 돌렸을 때 다시 실행되는 규칙은 무엇인가?',
      o: ['main.o와 util.o와 app 규칙 전부', 'main.o 규칙 하나', 'util.o 규칙과 app 규칙'], a: 2,
      why: 'make는 재료가 결과물보다 새로운 규칙만 다시 돈다. util.c가 util.o보다 새롭고, 그 결과 util.o가 app보다 새로워진다.' },
    { q: '패턴 규칙 %.o: %.c util.h의 명령 속 $<는 main.o를 만들 때 무엇으로 바뀌는가?',
      o: ['main.c', 'main.o', 'main.c util.h'], a: 0,
      why: '$<는 첫 번째 의존성이다. %가 main으로 맞춰지면 첫 의존성은 main.c이고, $@가 main.o, $^가 main.c util.h이다.' },
  ];

  const summary = [
    '선언은 헤더에, 정의는 .c에 둔다. main.c는 프로토타입만 보고도 컴파일된다.',
    'include guard는 같은 헤더가 두 번 펼쳐질 때 두 번째를 통째로 건너뛰게 한다.',
    'gcc -c로 만든 main.o의 add 자리는 비어 있고, 링크할 때 util.o의 정의로 채워진다.',
    'make는 시각을 비교해 util.c만 바뀌면 util.o와 app만 다시 만든다.',
  ];
  const review = [
    { q: '헤더에 add 함수 본문을 적고 main.c와 util.c가 둘 다 include했더니 빌드가 실패했다. 어디서 막혔을까?',
      o: ['전처리 단계에서 include guard가 막았다', '링크 단계에서 add 정의가 두 개라 충돌했다', '컴파일 단계에서 프로토타입을 못 찾았다'], a: 1,
      why: '각 .c가 본문을 하나씩 갖게 되어 main.o와 util.o 둘 다 add를 정의한다. 링커가 같은 심볼 두 개를 만나 멈춘다.' },
    { q: 'util.h의 Point에 필드를 더하고 make를 돌렸는데 main.o가 다시 만들어지지 않았다. 먼저 의심할 것은?',
      o: ['main.o 규칙의 의존성에 util.h가 빠져 있다', '명령 줄을 탭으로 들여썼다', 'util.h에 include guard가 있다'], a: 0,
      why: 'make는 규칙에 적힌 재료의 시각만 본다. util.h가 의존성에 없으면 헤더가 바뀌어도 main.o가 낡았다는 사실을 모른다.' },
    { q: '폴더에 clean이라는 파일이 생긴 뒤 make clean이 아무것도 지우지 않는다. 고칠 방법은?',
      o: ['clean 규칙 명령을 스페이스로 들여쓴다', 'clean 규칙에 main.o를 의존성으로 추가한다', '.PHONY: clean으로 파일이 아님을 알린다'], a: 2,
      why: 'make는 clean 파일이 이미 있고 재료가 없으니 최신이라고 판단한다. .PHONY로 지정하면 파일 여부와 상관없이 명령을 실행한다.' },
  ];

  R.page({ title: '분할 컴파일과 make', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
