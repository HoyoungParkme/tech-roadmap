/* I-1-1 컴파일 과정 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 소스 파일 → .i → .s → .o → 실행 파일. 심볼 표(T/U)와 링크 연결은 페이지 STEPS 의 objects · resolve 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 문서 아이콘: 왼쪽 위 (x, y), 오른쪽 위 모서리가 접힌 종이 + 위쪽 파일 이름 탭
  function doc(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1, f = 18, col = o.stroke || INK;
    el('path', { d: `M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: op });
    el('path', { d: `M${x + w - f},${y} V${y + f} H${x + w}`, fill: 'none', stroke: col, 'stroke-width': 1.5, opacity: op });
    if (name) mono(x + 12, y - 9, name, { 'font-size': 15, 'font-weight': 800, fill: o.nameCol || col, opacity: op }); }
  // 코드 줄: rows = [text | [text, attrs]]
  function code(x, y, rows, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 9;
    rows.forEach((r, i) => { const [s, a] = Array.isArray(r) ? r : [r, {}]; if (!s) return; mono(x, y + i * lh, s, Object.assign({ 'font-size': fs, fill: INK }, a)); }); }
  // 일부만 타이핑된 글
  const typed = (s, u) => s.slice(0, Math.round(s.length * clamp(u)));
  const hlBar = (x, y, w, op, col) => el('rect', { x, y: y - 17, width: w, height: 23, rx: 4, fill: col || ACCBG, opacity: op });

  // ---------- 1. 전처리 ----------
  const SRC = ['#include <stdio.h>', '#include "math_utils.h"', '', '#define PI 3.14159', '#define SQ(x) ((x)*(x))', '', 'int main(void) {', '  double area = PI * SQ(2);', '  printf("area=%f\\n", area);', '}'];
  function s1(t, c) { const { k, u } = c;
    if (k === 4) return pitfall(u);
    const X0 = 24, Y0 = 52, LY = (i) => Y0 + 34 + i * 27;
    doc(X0, Y0, 350, 300, 'hello.c');
    SRC.forEach((s, i) => { if (!s) return; const dir = s.startsWith('#'), gone = k === 3 && dir;
      if ((k === 0 && i < 2) || (k === 1 && (i === 3 || i === 4)) || (k === 2 && i === 7)) hlBar(X0 + 8, LY(i), 334, fade(u, 0.1));
      mono(X0 + 16, LY(i), s, { 'font-size': 14.5, fill: gone ? OFF : dir ? INFO : INK, 'text-decoration': gone && u > 0.6 ? 'line-through' : null }); });
    // 가운데: gcc -E 와 치환 규칙표
    grow(388, 150, 560, 150, k === 0 ? E(u, 0.1, 0.6) : 1, ACC);
    mono(474, 138, 'gcc -E', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    if (k === 1 || k === 2) { const s0 = k === 1 ? pop(u, 0.5) : 1;
      zone(392, 196, 164, 104, '치환 규칙표', { fill: WARNBG, stroke: WARN, sw: 1.5, op: s0 });
      [['PI', '3.14159'], ['SQ(x)', '((x)*(x))']].forEach(([a, b], i) => { const op = k === 1 ? fade(u, 0.9 + i * 0.5) : 1;
        mono(404, 246 + i * 32, a, { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: op }); mono(452, 246 + i * 32, '→ ' + b, { 'font-size': 13.5, fill: INK, opacity: op }); });
      if (k === 1) sub(474, 326, '아직 아무 코드도 안 생겼다', fade(u, 2), { 'font-size': 14 }); }
    // 오른쪽: hello.i
    const RX = 576; doc(RX, Y0, 360, 300, 'hello.i', { stroke: k >= 0 ? ACC : INK, nameCol: ACC });
    const blk = k === 0 ? E(u, 0.4, 1.8) : 1;
    if (k === 0) { fly(X0 + 180, LY(0), RX + 150, Y0 + 50, seg(u, 0.3, 1.3), 'stdio.h 내용', { fill: INFO }); fly(X0 + 180, LY(1), RX + 150, Y0 + 148, seg(u, 0.7, 1.7), 'math_utils.h 내용', { fill: INFO }); }
    const bh = (k === 3 ? lerp(76, 150, E(u, 0.3, 1.6)) : 76) * blk;
    el('rect', { x: RX + 12, y: Y0 + 16, width: 336, height: bh, rx: 6, fill: INFOBG, opacity: 0.9 });
    if (blk > 0.6) { code(RX + 22, Y0 + 40, ['int printf(const char *, ...);'], { fs: 14 }); sub(RX + 180, Y0 + 66, '… stdio.h 선언 수백 줄 …', 1, { 'font-size': 13.5 }); }
    const sy = Y0 + 16 + bh + 26;
    if (k === 0) mono(RX + 22, Y0 + 118, 'int square(int x);', { 'font-size': 14, opacity: fade(u, 1.6) });
    if (k >= 1) mono(RX + 22, sy, 'int square(int x);', { 'font-size': 14 });
    if (k >= 2) { const L = 'double area = 3.14159 * ((2)*(2));', p = k === 2 ? E(u, 0.6, 2.0) : 1;
      mono(RX + 22, sy + 34, 'int main(void) {', { 'font-size': 14, opacity: k === 2 ? fade(u, 0.3) : 1 });
      spansAt(RX + 30, sy + 60, [['double area = ', INK], ['3.14159', ACC], [' * ', INK], ['((2)*(2))', ACC], [';', INK]], p);
      if (k === 2) { fly(X0 + 170, LY(7), RX + 140, sy + 60, seg(u, 0.2, 0.9), 'PI', { fill: WARN, mono: true }); fly(X0 + 250, LY(7), RX + 250, sy + 60, seg(u, 0.4, 1.1), 'SQ(2)', { fill: WARN, mono: true });
        sub(RX + 180, sy + 98, '글자만 바뀐다. 곱셈은 아직 안 한다', fade(u, 2.1), { 'font-size': 14, fill: ACC, 'font-weight': 700 }); } }
    if (k === 3) { [['지시자 줄 사라짐', 0.8, 170], ['주석 사라짐', 1.3, 480], ['헤더가 펼쳐져 길어짐', 1.8, 790]].forEach(([s, a, x], i) => pill(x, 390, s, i === 2 ? ACC : MUT, pop(u, a), { fs: 14, fill: PANEL }));
      sub(474, 240, '펼쳐진', fade(u, 2.1), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); sub(474, 262, '순수 C 텍스트', fade(u, 2.1), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }
  }
  // 색이 다른 조각을 u 만큼 타이핑
  function spansAt(x, y, parts, u) { const total = parts.reduce((a, p) => a + p[0].length, 0); let left = Math.round(total * clamp(u)), dx = 0;
    parts.forEach(([s, col]) => { const show = s.slice(0, Math.max(0, left)); left -= s.length; if (show) mono(x + dx, y, show, { 'font-size': 14, 'font-weight': col === ACC ? 800 : 400, fill: col }); dx += tw(s, 14); }); }
  // 괄호 없는 매크로: SQ(1+2) → 1+2*1+2
  function pitfall(u) {
    mono(60, 64, '#define SQ(x) x*x', { 'font-size': 20, 'font-weight': 800, fill: BAD });
    tx(330, 64, '괄호 없이 정의', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    mono(60, 120, 'SQ(1+2)', { 'font-size': 20, 'font-weight': 800 }); grow(170, 113, 250, 113, E(u, 0.2, 0.6), MUT);
    // x 자리 두 곳에 '1+2' 가 그대로 들어간다
    const toks = ['1', '+', '2', '*', '1', '+', '2'], fromX = (i) => (i < 3 ? 1 : i > 3 ? 1 : 0);
    toks.forEach((s, i) => { const x = 270 + i * 30, s0 = pop(u, 0.5 + i * 0.08); if (s0 <= 0) return;
      card(x, 112, 26, 34, { rx: 5, text: s, fs: 18, mono: true, fw: 800, stroke: s === '*' ? BAD : fromX(i) ? INFO : GRID, color: s === '*' ? BAD : INK, s: s0 }); });
    sub(360, 150, '글자 그대로 붙였다', fade(u, 1), { 'font-size': 14 });
    // 계산 순서 두 가지
    const tree = (cx, top, rows, col, res, op) => { rows.forEach((r, i) => card(cx, top + i * 52, tw(r, 17) + 30, 38, { rx: 8, text: r, fs: 17, mono: true, fw: 700, stroke: col, op: op * fade(u, 1.2 + i * 0.35) }));
      card(cx, top + rows.length * 52 + 8, 90, 46, { rx: 10, text: res, fs: 24, mono: true, fw: 800, stroke: col, color: col, sw: 3, s: pop(u, 1.2 + rows.length * 0.35) * op }); };
    tx(230, 210, '실제로 계산되는 순서', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
    tree(230, 246, ['1 + (2*1) + 2', '1 + 2 + 2'], BAD, '5', 1);
    tx(700, 210, '괄호로 감싼 SQ(x) ((x)*(x))', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
    tree(700, 246, ['((1+2)*(1+2))', '3 * 3'], GOOD, '9', 1);
    cross(300, 362, 11, pop(u, 2.2)); check(770, 362, 11, pop(u, 2.2)); }

  // ---------- 2. 컴파일 ----------
  const GX = [190, 380, 570, 760], GN = ['전처리', '컴파일', '어셈블', '링크'], FN = ['hello.c', 'hello.i', 'hello.s', 'hello.o', 'hello'];
  function track(y, stopAt, u, o) { o = o || {}; const x0 = 80, xEnd = stopAt == null ? 880 : GX[stopAt] + 60, prog = E(u, 0.2, 1.8);
    el('line', { x1: x0, y1: y, x2: 880, y2: y, stroke: GRID, 'stroke-width': 3 });
    GX.forEach((gx, i) => { const live = stopAt == null || i <= stopAt; el('rect', { x: gx - 9, y: y - 22, width: 18, height: 44, rx: 4, fill: live ? (o.col || INK) : SOFT, opacity: live ? 0.85 : 1 }); });
    const px = lerp(x0, xEnd, prog); el('circle', { cx: px, cy: y, r: 8, fill: o.col || ACC });
    const files = stopAt == null ? 5 : stopAt + 2; for (let i = 0; i < files; i++) { const fx = i === 0 ? x0 + 12 : GX[i - 1] + 60; if (px >= fx - 4 || i === 0) mono(fx, y + 42, FN[i], { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: i === files - 1 ? (o.col || ACC) : INK }); }
    if (stopAt != null && prog >= 1) el('rect', { x: GX[stopAt] + 22, y: y - 22, width: 6, height: 44, rx: 2, fill: BAD }); }
  function s2(t, c) { const { k, u } = c, T = c.beat.translate;
    if (k === 0) { GX.forEach((gx, i) => lbl(gx, 92, GN[i], fade(u, 0.1 + i * 0.15)));
      track(160, null, u); mono(480, 270, 'gcc hello.c -o hello', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(480, 302, '플래그가 없으면 네 단계를 쉬지 않고 지나간다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { GX.forEach((gx, i) => lbl(gx, 52, GN[i], 1));
      [['-E', 0, MUT], ['-S', 1, ACC], ['-c', 2, MUT]].forEach(([f, st, col], i) => { const y = 112 + i * 104, uu = Math.max(0, u - i * 0.25);
        mono(40, y + 6, f, { 'font-size': 20, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); track(y, st, uu, { col }); });
      return; }
    if (k === 4) return errSort(c.beat.errKinds.rows, u);
    // k ≥ 2: C 한 줄 → 어셈블리
    tx(40, 44, T.cTitle, { 'font-size': 14, fill: MUT, 'font-weight': 700 }); zone(28, 56, 330, 110, null, { fill: SOFT });
    T.cLines.forEach((s, i) => { const hot = k >= 3 && i === 1; if (hot) hlBar(36, 92 + i * 28, 314, 1, ACCBG); mono(44, 92 + i * 28, s, { 'font-size': 15, 'font-weight': hot ? 800 : 400, fill: hot ? ACC : INK }); });
    tx(420, 44, T.asmTitle, { 'font-size': 14, fill: ACC, 'font-weight': 700 }); zone(408, 56, 300, 18 + 9 * 30, null, { fill: ACCBG });
    const prevN = c.prev && c.prev.translate ? c.prev.translate.asmLines.length : 0, A = T.asmLines;
    A.forEach((s, i) => { const nu = i < prevN ? 1 : clamp((u - 0.3) * 2.5 - (i - prevN) * 0.6); if (nu <= 0) return;
      const hot = (k === 2 && (i === 1 || i === 2)) || (k >= 3 && i === 6), mid = k >= 3 && i >= 3 && i <= 6;
      if (hot) hlBar(414, 92 + i * 30, 288, 1, k === 2 ? INFOBG : WARNBG);
      mono(424, 92 + i * 30, typed(s, nu), { 'font-size': 14.5, 'font-weight': i === 0 || hot ? 800 : 400, fill: i === 0 ? ACC : hot && k >= 3 ? WARN : mid ? INK : k >= 3 ? MUT : INK }); });
    if (k === 2) { grow(250, 92, 410, 92, E(u, 0.2, 0.8), ACC); sub(560, 370, '함수 이름은 라벨, 먼저 프레임을 세운다', fade(u, 1.6), { 'font-size': 15 }); }
    if (k === 2) { // 작은 스택: 이전 rbp 가 쌓이고 rbp 가 그 자리를 가리킨다
      const sx = 770, w = 150; tx(sx, 78, '스택', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      [['반환 주소', 0, 1], ['이전 rbp', 1, pop(u, 0.9)]].forEach(([s, i, sc]) => card(sx + w / 2, 110 + i * 40, w, 36, { rx: 4, text: s, fs: 14, stroke: i ? INFO : GRID, s: sc }));
      grow(sx + w + 30, 150, sx + w + 4, 150, E(u, 1.6, 2.1), ACC); mono(sx + w + 8, 186, 'rbp', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); }
    if (k >= 3) { // return a + b 가 어느 명령이 되었나
      const u4 = k === 3 ? u : 3; [3, 4, 5, 6].forEach((i, j) => { const g = E(u4, 0.5 + j * 0.2, 1.0 + j * 0.2); if (g <= 0) return;
        el('path', { d: `M350,120 C385,120 380,${86 + i * 30} 412,${86 + i * 30}`, fill: 'none', stroke: i === 6 ? WARN : GRID, 'stroke-width': i === 6 ? 2.6 : 1.6, opacity: g }); });
      if (k === 3) { card(820, 266, 150, 58, { rx: 8, text: 'eax\n← a + b', fs: 15, mono: true, stroke: WARN, s: pop(u, 1.8) });
        sub(560, 404, 'C 한 줄이 명령 다섯 개가 됐다 (-O0)', fade(u, 2.2), { 'font-size': 15 }); } }
  }
  // 에러 메시지를 "지금 잡히는 것" 과 "링크에서 날 것" 으로 나눈다
  function errSort(rows, u) {
    tx(480, 44, '컴파일러가 보는 범위 = 파일 하나', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    zone(40, 220, 410, 180, '컴파일 에러 · 이 단계에서 잡힌다', { fill: BADBG, stroke: BAD, sw: 2, color: BAD });
    zone(510, 220, 410, 180, '링크 에러 · 이 단계는 모른다', { fill: SOFT, stroke: MUT, sw: 2, color: MUT });
    let bad = 0; rows.forEach((r, i) => { const tgt = r.ok ? [715, 300] : [245, 290 + bad++ * 54], st = [480, 96 + i * 38], g = E(u, 0.5 + i * 0.5, 1.2 + i * 0.5);
      mono(lerp(st[0], tgt[0], g), lerp(st[1], tgt[1], g), r.msg, { 'font-size': 14, 'font-weight': 700, fill: r.ok ? MUT : BAD, 'text-anchor': 'middle' });
      tx(tgt[0], tgt[1] + 21, r.note.replace(/^← /, ''), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); });
    sub(715, 380, '다른 파일의 함수는 아직 찾지 않는다', fade(u, 2.4), { 'font-size': 14 }); }

  // ---------- 3. 어셈블: .o 와 심볼 표 ----------
  // 오브젝트 카드: 기계어 바이트 한 줄 + 심볼 표 (T = 정의, U = 빈칸)
  function objCard(x, y, w, o, opt) { opt = opt || {}; const rows = o.defined.map((n) => ['T', n]).concat(o.undef.map((n) => ['U', n])), h = 84 + rows.length * 30, op = opt.op ?? 1, gr = opt.grow ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: opt.stroke || INK, 'stroke-width': 2.2, 'stroke-dasharray': opt.dash, opacity: op });
    mono(x + 14, y + 26, o.name, { 'font-size': 16, 'font-weight': 800, opacity: op });
    const bytes = ['55', '48', '89', 'E5', '…']; bytes.forEach((b, i) => { if (clamp(gr * 5 - i) <= 0) return; card(x + 26 + i * 40, y + 50, 34, 24, { rx: 4, text: b, fs: 13.5, mono: true, fw: 700, stroke: GRID, fill: SOFT, op });
    }); tx(x + 232, y + 55, '기계어', { 'font-size': 13.5, fill: MUT, opacity: op * clamp(gr * 2) });
    rows.forEach(([kd, n], i) => { const yy = y + 84 + i * 30, s = clamp(gr * (rows.length + 1) - i - 1); if (s <= 0) return; const U = kd === 'U', hot = opt.hot && opt.hot(n, kd);
      el('rect', { x: x + 10, y: yy - 20, width: w - 20, height: 28, rx: 5, fill: hot ? (U ? WARNBG : GOODBG) : 'none', opacity: op * s });
      mono(x + 22, yy, kd, { 'font-size': 16, 'font-weight': 800, fill: U ? WARN : GOOD, opacity: op * s }); mono(x + 50, yy, n, { 'font-size': 15, 'font-weight': 700, opacity: op * s });
      const slot = U ? (opt.fill && opt.fill(n)) || '????????' : '정의 있음'; mono(x + w - 18, yy, slot, { 'font-size': 13.5, 'text-anchor': 'end', fill: U ? (opt.fill && opt.fill(n) ? GOOD : WARN) : MUT, opacity: op * s }); });
    return { h, rowY: (n) => y + 84 + rows.findIndex((r) => r[1] === n) * 30 - 6 }; }
  function s3(t, c) { const { k, u } = c, objs = c.beat.objects || [];
    if (k === 0) { doc(40, 60, 380, 200, 'main.c');
      code(58, 104, ['int square(int x);', 'int main(void) {', ['  square(2);', { 'font-weight': 800, fill: WARN }], ['  printf("...");', { 'font-weight': 800, fill: WARN }], '}'], { fs: 15, lh: 28 });
      [['math_utils.c', 'square 정의', 150], ['libc', 'printf 정의', 250]].forEach(([a, b, y], i) => { const g = E(u, 0.5 + i * 0.5, 1.2 + i * 0.5);
        grow(260, i ? 194 : 166, 600, y, g, WARN, { dash: '6 5' });
        card(720, y, 220, 56, { rx: 10, text: a + '\n' + b, fs: 14.5, dash: '6 5', stroke: MUT, s: pop(u, 0.9 + i * 0.5) }); });
      sub(480, 360, '쓰는 곳과 정의한 곳이 다른 파일이다', fade(u, 2.1), { 'font-size': 15 }); return; }
    const main = objs[0], mu = objs[1];
    const hotU = k === 5 ? (n, kd) => kd === 'U' : k === 4 ? (n) => n === 'square' : null;
    const A = objCard(40, 40, 380, main, { grow: k === 1 ? E(u, 0.3, 1.9) : 1, hot: hotU, stroke: k === 1 ? ACC : INK });
    if (k === 1) mono(230, 26, 'gcc -c main.c', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.1) });
    if (mu) { const B = objCard(540, 40, 380, mu, { grow: k === 2 ? E(u, 0.3, 1.6) : 1, hot: k >= 4 ? (n) => n === 'square' : null });
      if (k >= 4) { const g = k === 4 ? E(u, 0.6, 1.6) : 1; el('line', { x1: 420, y1: A.rowY('square'), x2: lerp(420, 540, g), y2: lerp(A.rowY('square'), B.rowY('square'), g), stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
        if (g >= 1 && k === 4) pill(480, 200, '같은 이름', GOOD, 1, { fs: 13.5, fill: PANEL }); } }
    if (k >= 3) { const n = k === 3 ? 1 + E(u, 0.2, 1.6) * 3 : k === 4 ? 4 + E(u, 0.2, 1.2) * 2 : 6;
      terminal(40, 264, 880, 148, ['$ nm main.o', '0000000000000000 T main', '                 U printf', '                 U square', '$ nm math_utils.o', '0000000000000000 T square'], n, { lh: 21 }); }
    if (k === 5) banner(480, 239, 'U 칸 = 주소를 모르는 빈칸, 링크가 채운다', pop(u, 0.5));
  }

  // ---------- 4. 링크 ----------
  function libBox(cx, cy, name, sym, o) { o = o || {}; card(cx, cy, 200, 62, { rx: 10, stroke: o.stroke || INK, dash: o.dash, s: o.s, op: o.op, fill: o.fill });
    if ((o.s ?? 1) > 0.5) { mono(cx - 86, cy - 6, name, { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1, fill: o.stroke || INK }); mono(cx - 86, cy + 18, sym, { 'font-size': 14, fill: o.symCol || GOOD, 'font-weight': 700, opacity: o.op ?? 1 }); } }
  // 정의 → ld → 빈칸 (g 0→1 만큼 자라는 두 토막 선)
  function via(ax, ay, bx, by, g, col) { col = col || GOOD;
    const a = clamp(g * 2), b = clamp(g * 2 - 1); if (a > 0) el('line', { x1: ax, y1: ay, x2: lerp(ax, 517, a), y2: lerp(ay, 110, a), stroke: col, 'stroke-width': 2.4 });
    if (b > 0) grow(443, 110, bx, by, b, col); }
  function s4(t, c) { const { k, u } = c;
    // 왼쪽: 빈칸이 있는 .o, 가운데: 링커, 오른쪽: 정의를 가진 파일들
    const LX = 40, W = 330, rowY = { printf: 130, square: 170 };
    if (k <= 3) { el('rect', { x: LX, y: 40, width: W, height: 160, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
      mono(LX + 14, 66, 'main.o', { 'font-size': 16, 'font-weight': 800 }); mono(LX + 22, 98, 'T main', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      const sq = k === 0 ? (E(u, 1.2, 1.8) >= 1 ? 'ok' : 'empty') : k === 1 ? 'ok' : 'miss', pf = k === 0 ? 'empty' : k === 1 && E(u, 1.0, 1.6) < 1 ? 'empty' : 'ok';
      [['printf', pf, '→ libc'], ['square', sq, '→ math_utils.o']].forEach(([n, st, to]) => { const y = rowY[n], col = st === 'ok' ? GOOD : st === 'miss' ? BAD : WARN;
        el('rect', { x: LX + 10, y: y - 20, width: W - 20, height: 28, rx: 5, fill: st === 'ok' ? GOODBG : st === 'miss' ? BADBG : WARNBG });
        mono(LX + 22, y, 'U ' + n, { 'font-size': 15, 'font-weight': 700, fill: col }); mono(LX + W - 18, y, st === 'ok' ? to : st === 'miss' ? '? 못 찾음' : '????????', { 'font-size': 13.5, 'text-anchor': 'end', fill: col, 'font-weight': 700 }); }); }
    const ld = (s) => { card(480, k <= 3 ? 110 : 200, 70, 70, { rx: 35, text: 'ld', fs: 20, mono: true, fw: 800, stroke: ACC, color: ACC, s }); };
    if (k <= 3) { ld(1);
      if (k <= 1 || (k === 2 && u < 0.4)) libBox(780, 80, 'math_utils.o', 'T square', {});
      else { el('rect', { x: 680, y: 49, width: 200, height: 62, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
        mono(780, 76, 'math_utils.o', { 'font-size': 14, fill: OFF, 'text-anchor': 'middle', 'text-decoration': 'line-through' }); tx(780, 100, '링크 목록에서 빠짐', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); }
      libBox(780, 180, 'libc', 'printf', {});
      if (k <= 1) via(680, 80, LX + W + 4, rowY.square - 6, k === 0 ? E(u, 0.3, 1.2) : 1);
      if (k >= 1) via(680, 180, LX + W + 4, rowY.printf - 6, k === 1 ? E(u, 0.2, 1.0) : 1);
      if (k === 2) { dot([[515, 110], [680, 80], [680, 180], [515, 110]], seg(u, 0.9, 2.4), BAD, 7); }
      if (k === 1) { const g = pop(u, 1.4); card(200, 268, 200, 60, { rx: 10, text: 'app (실행 파일)', fs: 15, fw: 800, stroke: GOOD, color: GOOD, sw: 2.5, s: g });
        terminal(440, 238, 480, 110, ['$ ./app', 'area=12.566360'], 1 + E(u, 1.8, 2.6), { title: '' }); }
      if (k === 2) { sub(200, 260, '목록에 없는 파일은 링커가 볼 수 없다', fade(u, 1.6), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); mono(200, 300, 'gcc main.o -o app', { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); }
      if (k === 3) { terminal(40, 236, 880, 134, ['$ gcc main.o -o app', "/usr/bin/ld: undefined reference to `square'", 'collect2: error: ld returned 1 exit status'], 1 + E(u, 0.2, 1.6) * 2, { lh: 24 });
        el('rect', { x: 50, y: 286, width: 104, height: 25, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
        tx(40, 396, '앞에 붙은 이름이 ld 이므로 링크 에러다. cc1 이었다면 컴파일 에러', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 4) { // calc.o 의 U sqrt 와 -lm
      el('rect', { x: LX, y: 140, width: W, height: 120, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }); mono(LX + 14, 168, 'calc.o', { 'font-size': 16, 'font-weight': 800 });
      const on = E(u, 1.2, 1.7) >= 1; el('rect', { x: LX + 10, y: 196, width: W - 20, height: 28, rx: 5, fill: on ? GOODBG : BADBG });
      mono(LX + 22, 216, 'U sqrt', { 'font-size': 15, 'font-weight': 700, fill: on ? GOOD : BAD }); mono(LX + W - 18, 216, on ? '→ libm' : '? 못 찾음', { 'font-size': 13.5, 'text-anchor': 'end', fill: on ? GOOD : BAD, 'font-weight': 700 });
      ld(1); libBox(780, 120, 'libc', 'printf …', { symCol: MUT }); libBox(780, 290, 'libm', 'sqrt', { dash: on ? null : '6 5', stroke: on ? GOOD : MUT, symCol: on ? GOOD : MUT });
      cross(662, 120, 10, pop(u, 0.4)); tx(780, 168, 'sqrt 는 여기 없다', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      fly(480, 400, 480, 290, seg(u, 0.7, 1.3), '-lm', { stay: true, mono: true });
      if (on) grow(680, 290, LX + W + 4, 210, E(u, 1.7, 2.4), GOOD);
      sub(480, 50, '#include <math.h> 는 선언만 준다. 정의는 libm 안에 있다', fade(u, 0.2), { 'font-size': 15, fill: INK }); return; }
    // k 5: 같은 이름 둘
    ld(1); [['a.o', 110], ['b.o', 290]].forEach(([n, y], i) => { libBox(180, y, n, 'T square', { s: pop(u, 0.2 + i * 0.3) }); grow(282, y, 440, 200 + (i ? 18 : -18), E(u, 0.8, 1.5), BAD); });
    cross(480, 200, 22, pop(u, 1.6)); terminal(560, 160, 380, 84, ["multiple definition of `square'"], 1, {});
    sub(750, 290, '어느 쪽을 쓸지 정할 수 없다', fade(u, 2), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
  }

  // ---------- 5. 전체 지도 ----------
  const CH_X = [90, 290, 490, 690, 870];
  function chainMap(chain, upto, u, o) { o = o || {};
    chain.forEach((f, i) => { if (i > upto) return; const s = i === upto && o.anim ? pop(u, 0.6) : 1, x = CH_X[i];
      const isExe = f.file === 'app'; if (s > 0.2) { doc(x - 50, 70, 100, 92, null, { stroke: isExe ? ACC : INK, fill: isExe ? ACCBG : PANEL, op: s });
        mono(x, 108, ['C', 'C+', 'asm', '01', '▶'][i], { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: isExe ? ACC : MUT, opacity: s });
        mono(x, 186, f.file, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(x, 208, f.label, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }
      if (i > 0) { const g = i === upto && o.anim ? E(u, 0.1, 0.6) : 1; grow(CH_X[i - 1] + 54, 116, lerp(CH_X[i - 1] + 54, x - 56, 1), 116, g, i === upto && o.anim ? ACC : MUT);
        if (f.flag) mono((CH_X[i - 1] + x) / 2, 100, f.flag, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: g }); } }); }
  function s5(t, c) { const { k, u } = c, P = c.beat.pipeline, n = P.chain.length - 1;
    if (k <= 2) { const pn = c.prev && c.prev.pipeline ? c.prev.pipeline.chain.length - 1 : 0;
      chainMap(P.chain, n, u, { anim: false });
      if (n > pn) { const nx = CH_X[n]; el('circle', { cx: nx, cy: 116, r: 60, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: 1 - fade(u, 0.9, 1.0) }); }
      const notes = ['헤더가 펼쳐지고 매크로가 치환된 C', '문법·타입 검사를 통과한 CPU 명령 텍스트', '파일마다 따로 만든 기계어 + 심볼 표, 마지막에 링크'];
      sub(480, 270, notes[k], fade(u, 0.8), { 'font-size': 16, fill: INK, 'font-weight': 700 });
      if (k === 2) { tx(480, 320, '.o 까지는 파일 하나씩, 링크만 여러 파일을 한꺼번에 본다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
      return; }
    chainMap(P.chain, n, u, {});
    const blocks = (x, y, n2, col, g) => { for (let i = 0; i < n2; i++) { const s = clamp(g * n2 - i); if (s <= 0) continue; el('rect', { x: x + i * 34, y, width: 28, height: 28, rx: 4, fill: col, opacity: 0.85 * s }); } };
    if (k === 3 || k === 5) { const op = k === 5 ? 0.45 : 1; zone(40, 240, 420, 150, 'gcc -static → app_static', { fill: SOFT, stroke: k === 3 ? ACC : 'none', op });
      blocks(60, 290, 2, ACC, 1); tx(60, 340, '내 코드', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op }); blocks(140, 290, 8, INFO, k === 3 ? E(u, 0.4, 1.8) : 1);
      tx(140, 340, 'libc 코드를 통째로 복사', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: op }); if (k === 3) { mono(60, 374, 'ldd → not a dynamic executable', { 'font-size': 14, fill: MUT, opacity: fade(u, 2) }); } }
    if (k === 4 || k === 5) { const op = k === 5 ? 0.45 : 1; zone(500, 240, 420, 150, 'gcc (기본) → app_dyn', { fill: SOFT, stroke: k === 4 ? ACC : 'none', op });
      blocks(520, 290, 2, ACC, 1); tx(520, 340, '내 코드 + 참조 표시', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op });
      card(820, 304, 150, 52, { rx: 10, text: 'libc.so.6', fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO, s: k === 4 ? pop(u, 0.8) : 1, op });
      grow(600, 304, 742, 304, k === 4 ? E(u, 1.0, 1.8) : 1, INFO, { dash: '6 5', op });
      if (k === 4) tx(680, 374, '실행할 때 불러온다. 없으면 실행 실패', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2) }); }
    if (k === 5) { [[CH_X[2] - 100, '컴파일 에러', '문법·타입'], [CH_X[4] - 90, '링크 에러', 'undefined reference'], [CH_X[4] + 4, '로더 에러', '.so 를 못 찾음']].forEach(([x, a, b], i) => {
        const s = pop(u, 0.3 + i * 0.4), y = i === 2 ? 246 : 40; card(x, y, i === 2 ? 150 : 160, 50, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s });
        if (s > 0.5) { tx(x, y - 3, a, { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); tx(x, y + 17, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } });
      banner(480, 404, '에러가 난 단계를 알면 고칠 곳이 보인다', pop(u, 1.8)); }
  }

  const quiz = [
    { q: '#define SQ(x) x*x로 정의하고 SQ(1+2)를 쓰면 결과는 무엇인가?',
      o: ['9', '5', '컴파일 에러'], a: 1,
      why: '전처리기는 글자를 그대로 붙여 1+2*1+2를 만든다. 곱셈이 먼저 계산돼 1+2+2 = 5가 된다.' },
    { q: '세미콜론을 빠뜨린 실수는 네 단계 중 어디서 잡히는가?',
      o: ['컴파일 (.i → .s)', '전처리 (.c → .i)', '링크 (.o → 실행 파일)'], a: 0,
      why: '문법과 타입은 컴파일러가 .i를 어셈블리로 번역하면서 검사한다. 다른 파일의 함수를 못 찾는 문제는 링크에서 난다.' },
    { q: 'nm main.o에 U square가 찍혔다. 이 줄은 무엇을 뜻하는가?',
      o: ['square의 정의가 main.o 안에 있다', 'square는 매크로라서 지워졌다', 'square를 쓰지만 주소는 아직 모르는 빈칸이다'], a: 2,
      why: 'U는 undefined의 줄임이다. 이 파일은 square를 호출만 하고, 정의(T square)는 math_utils.o에 있다.' },
    { q: 'gcc main.o -o app에서 undefined reference to square가 났다. 원인은 무엇인가?',
      o: ['square의 정의가 든 math_utils.o를 링크 목록에 넣지 않았다', 'main.c에 세미콜론이 빠졌다', '헤더 math_utils.h를 include 하지 않았다'], a: 0,
      why: '에러를 낸 것이 ld 이므로 링크 에러다. 링커는 넘겨받은 .o와 라이브러리 안에서만 정의를 찾는다.' },
    { q: '동적 링크로 만든 실행 파일을 다른 서버에 옮겼더니 실행이 안 된다. 가장 그럴듯한 이유는 무엇인가?',
      o: ['실행 파일 안에 libc 코드가 너무 많이 들어 있다', '그 서버에 필요한 .so 파일이 없다', '그 서버에서 다시 전처리를 해야 한다'], a: 1,
      why: '동적 링크는 참조 표시만 남기고 실행할 때 .so를 불러온다. 그 파일이 없으면 실행 시점 로더 에러가 난다.' },
  ];

  const summary = [
    '전처리기는 문법을 모른 채 #include는 붙여 넣고 #define은 글자로 바꾼다.',
    '매크로를 괄호 없이 정의하면 SQ(1+2)가 1+2*1+2로 펼쳐져 9 대신 5가 나온다.',
    '컴파일은 파일 하나의 문법과 타입만 보고, .o에는 정의(T)와 빈칸(U)이 함께 남는다.',
    '링크가 U 빈칸을 다른 .o와 라이브러리의 정의로 채우고, 못 채우면 ld가 에러를 낸다.',
  ];
  const review = [
    { q: '헤더를 include 했고 컴파일도 됐는데 링크에서 undefined reference가 났다. 먼저 확인할 것은?',
      o: ['헤더에 오타가 있는지', '정의가 든 .o나 라이브러리를 링크 명령에 넣었는지', '최적화 옵션 -O2를 켰는지'], a: 1,
      why: '헤더는 선언만 주기 때문에 컴파일은 통과한다. 정의가 든 파일이 링크 목록에 없으면 U 빈칸이 채워지지 않는다.' },
    { q: 'sqrt를 쓰는 calc.c가 gcc calc.c로는 링크되지 않고 -lm을 붙이면 된다. 이 차이가 생기는 단계는?',
      o: ['링크, libm은 자동으로 붙지 않는다', '전처리, math.h를 못 찾았다', '컴파일, sqrt의 타입이 틀렸다'], a: 0,
      why: 'math.h는 선언만 주고 sqrt의 정의는 libm에 있다. libc와 달리 libm은 -lm으로 직접 알려 줘야 링커가 찾는다.' },
    { q: 'nm main.o의 심볼 목록에 매크로 PI가 보이지 않는다. 그 까닭으로 맞는 것은?',
      o: ['PI가 U로 남아 링크를 기다린다', '-O0에서는 심볼 표를 만들지 않는다', 'PI는 전처리에서 3.14159로 바뀌어 컴파일러까지 가지 않는다'], a: 2,
      why: '#define은 전처리 단계의 글자 치환 규칙이라 .i에는 이름이 남지 않는다. 심볼 표에는 함수와 전역 변수만 오른다.' },
  ];

  R.page({ title: '컴파일 과정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
