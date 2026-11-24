/* V-2-1 표준 라이브러리 지도 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인 (zig cc = clang, Windows x86_64): map.c → len=5 · sqrt=1.41 · upper=A / strings.c → dst="hello w" len=7 · buf=abc
 * stdlib_demo.c → 1 2 3 4 · v=42 rest=x / io.c 에 42 → 제곱=1764, out.txt 에 n=42, abc → "정수를 입력하세요" 종료 코드 1
 * io.c 에 "6\n7\n" → m 이 찍히지 않는다(scanf 가 남긴 줄바꿈을 fgets 가 읽음) / misc.c → sqrt(2)=1.4142 · INT_MAX=2147483647 bytes=4
 * · "fopen: No such file or directory". time(NULL) 값은 실행마다 바뀌므로 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, spans, sub, pill, banner, grow, fly, dot, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const typed = (u, a, b) => clamp((u - a) / (b - a));
  const ok = (x, y, s, op) => { if (op <= 0) return; check(x + 7, y - 5, 7, op); tx(x + 22, y, s, { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: op }); };
  // 글자 칸 한 줄: chars 배열, o.style(i, ch) → {fill, stroke, col, dash, op, s}
  function chars(x, y, arr, o) { o = o || {}; const w = o.w || 46, h = o.h || 44;
    arr.forEach((ch, i) => { const st = (o.style && o.style(i, ch)) || {}; if (st.hide) return;
      card(x + i * w + (w - 4) / 2, y + h / 2, w - 4, h, { rx: 4, text: ch == null ? '' : ch === ' ' ? '␣' : ch, fs: o.fs || 16, mono: true, fw: 700, fill: st.fill || PANEL, stroke: st.stroke || INK, color: st.col || INK, dash: st.dash, op: st.op, s: st.s, sw: st.sw || 2 });
      if (o.index) mono(x + i * w + (w - 4) / 2, y + h + 17, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: st.op ?? 1 }); }); }
  function term(x, y, w, lines, op) { const h = 22 + lines.length * 24; el('rect', { x, y, width: w, height: h, rx: 8, fill: INK, opacity: op ?? 1 });
    lines.forEach((l, i) => { const [s, col] = Array.isArray(l) ? l : [l, null]; mono(x + 14, y + 28 + i * 24, s, { 'font-size': 14.5, fill: col || 'var(--term)', opacity: op ?? 1 }); }); }

  // ---------- 1. 헤더 지도 ----------
  const HD = [['stdio.h', '입출력', ['printf', 'scanf', 'fopen', 'fgets']], ['stdlib.h', '메모리·유틸', ['malloc', 'free', 'atoi', 'qsort']], ['string.h', '문자열·메모리', ['strlen', 'strcpy', 'memcpy', 'memset']],
    ['math.h', '수학', ['sqrt', 'pow', 'floor', 'fabs']], ['ctype.h', '문자 분류', ['isdigit', 'isalpha', 'toupper', 'tolower']], ['time.h', '시간', ['time', 'clock', 'strftime', 'difftime']]];
  const TP = (i) => [24 + (i % 3) * 206, 24 + Math.floor(i / 3) * 186];
  function tile(i, o) { o = o || {}; const [x, y] = TP(i), [n, role, fns] = HD[i], s = o.s ?? 1; if (s <= 0) return;
    const g = el('g', { transform: `translate(${x + 98} ${y + 84}) scale(${s}) translate(${-x - 98} ${-y - 84})`, opacity: o.op ?? 1 });
    el('rect', { x, y, width: 196, height: 168, rx: 10, fill: PANEL, stroke: o.hot ? ACC : INK, 'stroke-width': o.hot ? 3 : 2 }, g);
    mono(x + 12, y + 24, n, { 'font-size': 16, 'font-weight': 800, fill: o.hot ? ACC : INK }, g);
    tx(x + 184, y + 24, role, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 }, g);
    fns.forEach((f, j) => { const hi = o.fn === f, yy = y + 40 + j * 31;
      el('rect', { x: x + 10, y: yy, width: 176, height: 26, rx: 13, fill: hi ? ACC : SOFT, stroke: 'none' }, g);
      mono(x + 24, yy + 18, f, { 'font-size': 14, 'font-weight': 700, fill: hi ? PANEL : INK }, g); });
    if (o.tag) { el('rect', { x: x + 128, y: y - 12, width: 60, height: 24, rx: 12, fill: WARN }, g); mono(x + 158, y + 5, o.tag, { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g); } }
  const fnPos = (i, j) => [TP(i)[0] + 186, TP(i)[1] + 53 + j * 31];
  function s1(t, c) { const { k, u } = c, RX = 660;
    const calls = { 2: [[2, 'strlen'], [0, 'printf']], 3: [[1, 'atoi'], [3, 'sqrt'], [4, 'toupper']] }[k] || [];
    HD.forEach((_, i) => { const hot = calls.find((q) => q[0] === i);
      tile(i, { s: k === 0 ? (i < 3 ? pop(u, 0.3 + i * 0.3) : 0) : k === 1 && i >= 3 ? pop(u, 0.3 + (i - 3) * 0.3) : 1, hot: !!hot, fn: hot && hot[1], tag: i === 3 && k >= 1 ? '-lm' : null }); });
    if (k <= 1) { const inc = HD.slice(0, k === 0 ? 3 : 6).map((h) => '#include <' + h[0] + '>');
      inc.forEach((s, i) => { const now = k === 0 || i >= 3, j = k === 0 ? i : i - 3; mono(RX, 60 + i * 30, s, { 'font-size': 15, opacity: now ? fade(u, 0.3 + j * 0.3) : 1, 'font-weight': now ? 700 : null }); });
      if (k === 1) { tx(RX, 270, 'math.h 의 함수는', { 'font-size': 15, opacity: fade(u, 1.6) }); tx(RX, 294, '링크할 때 -lm 을 붙인다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) }); }
      else tx(RX, 270, '용도별로 나뉜 헤더 묶음', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      return; }
    if (k === 2) { mono(RX, 50, 'strlen("hello")', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      grow(RX - 6, 44, fnPos(2, 0)[0] + 6, fnPos(2, 0)[1], E(u, 0.3, 0.8), ACC);
      const n = Math.min(5, Math.floor(clamp((u - 0.9) / 1.0) * 6));
      chars(RX, 80, ['h', 'e', 'l', 'l', 'o', '\\0'], { w: 44, style: (i) => ({ fill: i < n ? ACCBG : PANEL, stroke: i === 5 ? MUT : i < n ? ACC : INK, col: i === 5 ? MUT : INK }) });
      mono(RX, 160, '센 글자 ' + n, { 'font-size': 16, 'font-weight': 700, fill: ACC });
      tx(RX, 186, '\\0 을 만나면 멈춘다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) });
      term(RX, 220, 270, [['len=5', 'var(--panel)']], fade(u, 2.1));
      tx(RX, 300, '반환형 size_t → %zu 로 찍는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { [['atoi("42")', 'n = 42', 1, 2], ['sqrt(2.0)', 'sqrt=1.41', 3, 0], ["toupper('a')", 'upper=A', 4, 2]].forEach(([call, out, ti, fj], i) => {
        const y = 50 + i * 100, a = 0.2 + i * 0.6; mono(RX, y, call, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, a) });
        grow(RX - 6, y - 6, fnPos(ti, fj)[0] + 6, fnPos(ti, fj)[1], E(u, a + 0.1, a + 0.5), ACC);
        mono(RX + 20, y + 32, '→ ' + out, { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, a + 0.5) }); });
      tx(RX, 360, '한 줄마다 지도의 다른 칸', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k = 4: man 3 이 진짜 지도
    el('rect', { x: RX - 10, y: 24, width: 290, height: 168, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.2) });
    [['$ man 3 strlen', MUT, 700], ['SYNOPSIS', INK, 800], ['#include <string.h>', ACC, 800], ['size_t strlen(const char *s);', INK, 400]].forEach(([s, col, fw], i) =>
      mono(RX + 2, 52 + i * 34, s, { 'font-size': 14, fill: col, 'font-weight': fw, opacity: fade(u, 0.4 + i * 0.25) }));
    el('rect', { x: RX - 10, y: 214, width: 290, height: 124, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.5) });
    tx(RX + 2, 240, 'include 를 빠뜨리면', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    mono(RX + 2, 268, 'implicit declaration', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
    mono(RX + 2, 290, 'of function \'strlen\'', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
    tx(RX + 2, 318, '반환형을 int 로 짐작한다', { 'font-size': 14, fill: INK, opacity: fade(u, 2.0) }); }

  // ---------- 2. string.h ----------
  const SRC = ['h', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd', '\\0'];
  const DX = 150, DY = 230, SY = 80;
  function rows(o) { o = o || {};
    mono(24, SY + 28, 'src', { 'font-size': 16, 'font-weight': 800 }); mono(24, DY + 28, 'dst', { 'font-size': 16, 'font-weight': 800 });
    chars(DX, SY, SRC, { index: o.idx, style: (i) => ({ s: o.srcS ? o.srcS(i) : 1, stroke: i === 11 ? MUT : INK, col: i === 11 ? MUT : INK }) });
    tx(DX + 12 * 46 + 12, SY + 28, '12칸', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
    // dst 8칸 + 그 뒤 옆 변수 자리 4칸
    el('rect', { x: DX + 8 * 46 - 2, y: DY - 10, width: 4 * 46 + 4, height: 64, rx: 6, fill: o.over ? BADBG : SOFT, stroke: o.over ? BAD : GRID, 'stroke-dasharray': '5 4', 'stroke-width': 1.5 });
    tx(DX + 10 * 46, DY + 76, '옆 변수의 자리', { 'font-size': 14, fill: o.over ? BAD : MUT, 'text-anchor': 'middle', 'font-weight': 700 });
    el('path', { d: `M${DX},${DY - 16} v-8 H${DX + 8 * 46 - 4} v8`, fill: 'none', stroke: INFO, 'stroke-width': 2 });
    tx(DX + 4 * 46, DY - 30, 'char dst[8]', { 'font-size': 14.5, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, class: 'mono' }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) {
      if (k === 0) { rows({ srcS: (i) => pop(u, 0.2 + i * 0.08) }); chars(DX, DY, Array(8).fill('?'), { style: () => ({ stroke: MUT, col: MUT, op: fade(u, 1.4) }) });
        tx(24, 380, '지역 배열은 0 으로 채워지지 않는다 · 12칸을 8칸에 넣으려 한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
      if (k === 1) { const n = Math.floor(clamp((u - 0.2) / 1.9) * 12.999); rows({ over: n > 8 });
        chars(DX, DY, SRC.map((ch, i) => (i < n ? ch : i < 8 ? '?' : null)), { style: (i) => (i >= n && i >= 8 ? { hide: true } : i >= 8 ? { fill: BAD, stroke: BAD, col: PANEL } : i < n ? { fill: ACCBG, stroke: ACC } : { stroke: MUT, col: MUT }) });
        if (n < 12) fly(DX + n * 46 + 21, SY + 22, DX + n * 46 + 21, DY + 22, (u - 0.2) / 1.9 * 12.999 % 1, SRC[n] === ' ' ? '␣' : SRC[n], { mono: true });
        mono(24, 360, 'strcpy(dst, src);', { 'font-size': 16, 'font-weight': 800, fill: BAD });
        tx(24, 390, 'dst 크기를 모른 채 \\0 까지 12칸을 쓴다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); return; }
      rows({});
      const res = ['h', 'e', 'l', 'l', 'o', ' ', 'w', '\\0'];
      if (k === 2) { const n = Math.floor(clamp((u - 0.2) / 1.4) * 8.999);
        chars(DX, DY, res.map((ch, i) => (i < n ? ch : '?')), { style: (i) => (i < n ? { fill: i === 7 ? GOODBG : ACCBG, stroke: i === 7 ? GOOD : ACC, col: i === 7 ? GOOD : INK } : { stroke: MUT, col: MUT }) });
        mono(24, 360, 'snprintf(dst, sizeof dst, "%s", src);', { 'font-size': 16, 'font-weight': 800, fill: GOOD });
        tx(24, 390, '7글자만 담고 마지막 칸에 \\0 · 경계 밖은 그대로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
      // k = 3: strlen 이 \0 까지 센다
      const n = Math.min(7, Math.floor(clamp((u - 0.2) / 1.6) * 8));
      chars(DX, DY, res, { index: true, style: (i) => (i < n ? { fill: ACCBG, stroke: ACC } : i === 7 ? { stroke: GOOD, col: GOOD } : {}) });
      el('polygon', { points: `${DX + Math.min(n, 7) * 46 + 21},${DY + 70} ${DX + Math.min(n, 7) * 46 + 13},${DY + 84} ${DX + Math.min(n, 7) * 46 + 29},${DY + 84}`, fill: ACC });
      mono(DX + 8 * 46 + 210, DY + 28, 'strlen = ' + n, { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      term(24, 340, 420, [['dst="hello w" len=7', 'var(--panel)']], fade(u, 2.0));
      tx(470, 370, '배열 8칸 · 문자열 길이 7', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k <= 5) { // buf[16]
      const BX = 60, BY = 130;
      mono(24, 60, k === 4 ? 'memset(buf, 0, sizeof buf);' : 'memcpy(buf, "abc", 4);', { 'font-size': 17, 'font-weight': 800 });
      mono(24, BY - 16, 'char buf[16]', { 'font-size': 14.5, fill: INFO, 'font-weight': 700 });
      const sweep = k === 4 ? clamp((u - 0.3) / 1.4) * 16 : 16;
      const cp = k === 5 ? Math.floor(clamp((u - 0.3) / 1.2) * 4.999) : 0, ABC = ['a', 'b', 'c', '\\0'];
      chars(BX, BY, Array.from({ length: 16 }, (_, i) => (i < cp ? ABC[i] : i < sweep ? '0' : '?')), { w: 52, index: true,
        style: (i) => (i < cp ? { fill: ACCBG, stroke: ACC } : i < sweep ? { fill: SOFT, stroke: INFO, col: INFO } : { stroke: MUT, col: MUT }) });
      if (k === 4) { tx(24, 260, '바이트마다 값 0 · sizeof buf 로 크기 16 을 정확히 준다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
        tx(24, 290, '0 으로 채운 버퍼는 그 자체로 빈 문자열이다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
      el('path', { d: `M${BX},${BY - 6} v-8 H${BX + 4 * 52 - 4} v8`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.5) });
      tx(BX + 4 * 52 + 8, BY - 12, '4 = a, b, c, \\0', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
      term(24, 250, 300, [['buf=abc', 'var(--panel)']], fade(u, 1.9));
      tx(360, 278, 'memcpy 는 \\0 을 스스로 붙이지 않는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(360, 304, '겹치는 영역이면 memmove', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.4) }); return; }
    // k = 6: 크기를 받지 않는 함수 → 크기를 받는 함수
    chars(DX, 40, SRC, { w: 40, fs: 14, h: 38, style: (i) => (i >= 8 ? { fill: BAD, stroke: BAD, col: PANEL } : { fill: ACCBG, stroke: ACC }) });
    el('path', { d: `M${DX},34 v-6 H${DX + 8 * 40 - 4} v6`, fill: 'none', stroke: INFO, 'stroke-width': 2 });
    tx(DX + 8 * 40 + 80, 112, '경계 밖 4칸', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle' });
    [['strcpy', 'snprintf(…, sizeof dst, …)'], ['strcat', 'strncat / snprintf'], ['gets', 'fgets(buf, sizeof buf, stdin)'], ['sprintf', 'snprintf(buf, sizeof buf, …)']].forEach(([a, b], i) => {
      const y = 170 + i * 56, s = pop(u, 0.3 + i * 0.3);
      card(140, y, 200, 42, { rx: 8, text: a, fs: 16, mono: true, fw: 800, stroke: BAD, color: BAD, fill: BADBG, s });
      if (s > 0.6) el('line', { x1: 80, y1: y, x2: 200, y2: y, stroke: BAD, 'stroke-width': 2.5 });
      grow(246, y, 330, y, E(u, 0.5 + i * 0.3, 0.8 + i * 0.3), GOOD);
      mono(344, y + 5, b, { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.7 + i * 0.3) }); }); }

  // ---------- 3. stdlib.h ----------
  function heap(x, y, vals, o) { o = o || {}; zone(x - 14, y - 40, 4 * 60 + 28, 120, '힙 16바이트', { fill: o.freed ? 'none' : SOFT, stroke: o.freed ? OFF : 'none', dash: o.freed ? '6 5' : null, color: o.freed ? OFF : MUT });
    vals.forEach((v, i) => { const xx = o.pos ? o.pos(i) : x + i * 60; card(xx + 27, y + 24, 54, 48, { rx: 6, text: v == null ? '' : String(v), fs: 18, mono: true, fw: 800, stroke: o.freed ? OFF : ACC, fill: o.freed ? PANEL : ACCBG, color: o.freed ? OFF : INK, dash: o.freed ? '5 4' : null }); }); }
  const zone = (x, y, w, h, title, o) => R.zone(x, y, w, h, title, o);
  function ptrBox(x, y, val, o) { o = o || {}; card(x + 60, y + 26, 120, 52, { rx: 8, stroke: o.col || INK, s: o.s });
    mono(x + 12, y + 20, 'arr', { 'font-size': 14, 'font-weight': 800, fill: MUT }); mono(x + 108, y + 44, val, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: o.col || INK });
    tx(x + 60, y - 10, 'main 의 지역 변수', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { mono(24, 50, 'int cmp_int(const void *a, const void *b)', { 'font-size': 16, 'font-weight': 700 });
      mono(24, 82, 'return (x > y) - (x < y);', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      [[3, 1], [1, 4], [2, 2]].forEach(([x, y], i) => { const yy = 150 + i * 72, a = 0.7 + i * 0.5, r = (x > y) - (x < y);
        card(70, yy, 64, 50, { rx: 25, text: String(x), fs: 20, mono: true, fw: 800, s: pop(u, a) }); card(160, yy, 64, 50, { rx: 25, text: String(y), fs: 20, mono: true, fw: 800, s: pop(u, a) });
        mono(220, yy + 6, `(${x > y ? 1 : 0}) - (${x < y ? 1 : 0})`, { 'font-size': 16, opacity: fade(u, a + 0.3) });
        mono(390, yy + 6, '= ' + r, { 'font-size': 20, 'font-weight': 800, fill: r > 0 ? INFO : r < 0 ? WARN : MUT, opacity: fade(u, a + 0.5) });
        tx(470, yy + 6, r > 0 ? 'x 가 뒤로' : r < 0 ? 'x 가 앞으로' : '같다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, a + 0.5) }); });
      tx(600, 170, 'x - y 로 빼면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(600, 196, '큰 값끼리 오버플로가 난다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
      tx(600, 222, '비교 두 번은 늘 -1 · 0 · 1', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) }); return; }
    const HX = 440, HY = 130;
    if (k === 5) { // strtol
      mono(24, 50, 'long v = strtol("42x", &end, 10);', { 'font-size': 16, 'font-weight': 800 });
      const p = Math.min(2, Math.floor(clamp((u - 0.3) / 1.0) * 3));
      chars(120, 110, ['4', '2', 'x', '\\0'], { w: 56, index: true, style: (i) => (i < p ? { fill: ACCBG, stroke: ACC } : i === 2 && u > 1.4 ? { stroke: WARN, col: WARN, sw: 3 } : {}) });
      if (u > 1.4) { grow(140 + 2 * 56, 230, 140 + 2 * 56, 182, E(u, 1.4, 1.8), WARN); mono(140 + 2 * 56, 254, 'end', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' }); }
      mono(380, 140, 'v = ' + (p >= 2 ? 42 : p ? 4 : 0), { 'font-size': 22, 'font-weight': 800, fill: ACC });
      term(380, 180, 300, [['v=42 rest=x', 'var(--panel)']], fade(u, 1.9));
      el('rect', { x: 24, y: 300, width: 912, height: 96, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: fade(u, 2.0) });
      mono(44, 336, 'atoi("abc") = 0     atoi("0") = 0', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
      tx(44, 368, 'atoi 는 실패와 진짜 0 을 구분하지 못한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    const freed = k === 4;
    ptrBox(40, HY, freed ? 'NULL' : '0x…', { col: freed ? GOOD : INK, s: k === 1 ? pop(u, 0.2) : 1 });
    if (!freed) grow(162, HY + 26, HX - 18, HY + 24, k === 1 ? E(u, 0.6, 1.1) : 1, ACC);
    else { cross(300, HY + 26, 9, pop(u, 0.8)); }
    let vals = [null, null, null, null], pos = null;
    if (k >= 2) { const from = [3, 1, 4, 2], sorted = [1, 2, 3, 4];
      if (k === 2) { const s = E(u, 1.0, 2.0); vals = from; pos = (i) => HX + lerp(i, sorted.indexOf(from[i]), s) * 60;
        if (u < 0.9) vals = from.map((v, i) => (u > 0.2 + i * 0.15 ? v : null)); }
      else vals = sorted; }
    heap(HX, HY, vals, { pos, freed });
    if (k === 1) { mono(24, 50, 'int *arr = malloc(4 * sizeof *arr);', { 'font-size': 16, 'font-weight': 800 });
      el('rect', { x: 40, y: 260, width: 300, height: 50, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.4) });
      mono(56, 291, 'if (!arr) return 1;', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); check(318, 285, 8, fade(u, 1.7));
      tx(380, 290, 'NULL 이 아니다 · 통과', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      tx(HX + 130, HY + 104, 'int 4칸 = 16바이트', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); return; }
    if (k === 2) { mono(24, 50, 'qsort(arr, 4, sizeof *arr, cmp_int);', { 'font-size': 16, 'font-weight': 800 });
      tx(HX + 130, HY + 104, u < 1.0 ? '3 · 1 · 4 · 2 를 쓴다' : 'cmp_int 로 비교하며 자리 바꿈', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle' });
      tx(24, 330, '원소 개수 · 원소 크기 · 비교 함수 세 가지를 알려 준다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { term(40, 270, 300, [['1 2 3 4', 'var(--panel)']], fade(u, 0.4));
      pill(HX + 130, HY + 110, '아직 반납 전', WARN, pop(u, 1.2), { fs: 14 });
      tx(380, 360, '여기서 return 하면 16바이트가 그대로 남는다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); return; }
    mono(24, 50, 'free(arr);  arr = NULL;', { 'font-size': 16, 'font-weight': 800, fill: GOOD });
    tx(HX + 130, HY + 104, '힙에 돌려줌', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    tx(24, 300, 'free 는 정확히 한 번', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
    tx(24, 328, 'NULL 을 넣어 두면 다시 써도 바로 드러난다 (use-after-free 예방)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) }); }

  // ---------- 4. stdio.h ----------
  function nBox(x, y, val, o) { o = o || {}; card(x + 55, y + 28, 110, 56, { rx: 8, stroke: o.col || INK, sw: 2.5, s: o.s });
    mono(x + 10, y + 18, o.name || 'n', { 'font-size': 14, 'font-weight': 800, fill: MUT }); mono(x + 98, y + 46, val, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: o.col || INK }); }
  function stream(x, y, arr, o) { o = o || {}; tx(x, y - 12, o.title || '입력', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    chars(x, y, arr, { w: 40, h: 38, fs: 15, style: o.style }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mono(24, 60, 'int n;', { 'font-size': 18, 'font-weight': 800 }); nBox(40, 110, '?', { col: WARN, s: pop(u, 0.4) });
      const g = Math.floor(t * 7) % 4; mono(260, 148, ['-81', '32767', '0', '1918'][g], { 'font-size': 18, fill: OFF, opacity: fade(u, 1.0) });
      tx(260, 180, '예전 값이 무엇이든 남아 있을 수 있다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
      tx(24, 280, '초기화하지 않은 지역 변수는 0 이 아니다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(24, 310, '값이 정말 들어왔는지 확인하기 전엔 쓰면 안 된다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k <= 2) { mono(24, 46, 'if (scanf("%d", &n) != 1) { … }', { 'font-size': 16, 'font-weight': 800 });
      [['4', '2', '\\n'], ['a', 'b', 'c', '\\n']].forEach((inp, i) => { const y = 110 + i * 150, a = 0.3 + i * 0.7, good = i === 0;
        stream(24, y, inp, { title: good ? '입력 "42"' : '입력 "abc"', style: (j) => ({ op: fade(u, a + j * 0.08) }) });
        grow(200, y + 19, 290, y + 19, E(u, a + 0.4, a + 0.7), good ? GOOD : BAD);
        mono(300, y + 25, '반환 ' + (good ? 1 : 0), { 'font-size': 17, 'font-weight': 800, fill: good ? GOOD : BAD, opacity: fade(u, a + 0.6) });
        nBox(420, y - 10, good ? '42' : '?', { col: good ? GOOD : WARN, s: pop(u, a + 0.8) });
        if (!good) term(560, y - 6, 370, [['정수를 입력하세요', 'var(--badbg)'], ['(stderr · 종료 코드 1)', 'var(--muted)']], fade(u, a + 1.0));
        else if (k === 2) { grow(536, y + 18, 600, y + 18, E(u, 0.3, 0.7), ACC); term(610, y - 6, 320, [['입력값의 제곱=1764', 'var(--panel)']], fade(u, 0.7)); } });
      if (k === 2) { el('rect', { x: 24, y: 380 - 26, width: 520, height: 40, rx: 8, fill: SOFT, opacity: fade(u, 1.6) });
        mono(40, 380, 'EOF (Ctrl-D) → 반환 EOF · 0 과 다르다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); }
      return; }
    if (k <= 4) { mono(24, 46, 'FILE *fp = fopen("out.txt", "w");', { 'font-size': 16, 'font-weight': 800 });
      card(90, 130, 120, 56, { rx: 8, stroke: INK, s: k === 3 ? pop(u, 0.2) : 1 }); mono(40, 124, 'fp', { 'font-size': 15, 'font-weight': 800, fill: MUT }); mono(130, 140, '0x…', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle' });
      grow(152, 130, 260, 130, k === 3 ? E(u, 0.5, 0.9) : 1, ACC);
      // FILE 구조: 버퍼
      el('rect', { x: 270, y: 90, width: 260, height: 120, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: k === 3 ? fade(u, 0.7) : 1 });
      mono(284, 114, 'FILE', { 'font-size': 15, 'font-weight': 800, opacity: k === 3 ? fade(u, 0.7) : 1 });
      tx(284, 140, '메모리 버퍼', { 'font-size': 14, fill: MUT, opacity: k === 3 ? fade(u, 0.8) : 1 });
      const inBuf = k === 4 ? (u > 0.5 && u < 1.6 ? 1 : 0) : 0;
      el('rect', { x: 284, y: 152, width: 232, height: 40, rx: 6, fill: PANEL, stroke: GRID, opacity: k === 3 ? fade(u, 0.8) : 1 });
      if (inBuf) mono(298, 178, 'n=42\\n', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      // 디스크 파일
      el('path', { d: 'M640,96 H760 L780,116 V206 H640 Z', fill: PANEL, stroke: INK, 'stroke-width': 2 });
      mono(652, 124, 'out.txt', { 'font-size': 15, 'font-weight': 800 }); tx(710, 230, '디스크', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      if (k === 4 && u > 1.6) mono(656, 166, 'n=42', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      if (k === 3) { el('rect', { x: 24, y: 270, width: 560, height: 92, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: fade(u, 1.3) });
        mono(40, 302, 'if (!fp) { perror("fopen"); return 1; }', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
        tx(40, 334, '열기에 실패하면 NULL · errno 를 사람 말로 찍는다', { 'font-size': 14.5, opacity: fade(u, 1.7) }); return; }
      fly(100, 300, 400, 172, seg(u, 0.1, 0.5), 'fprintf(fp, "n=%d\\n", n)', { mono: true });
      if (u > 1.4) dot([[520, 172], [640, 160]], seg(u, 1.3, 1.6), ACC, 7);
      mono(24, 320, 'fclose(fp);', { 'font-size': 17, 'font-weight': 800, fill: u > 1.2 ? GOOD : OFF });
      tx(24, 352, '쓰기는 먼저 버퍼에 쌓이고, fclose 가 디스크에 내보낸다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(24, 380, '닫지 않고 죽으면 버퍼에 남은 내용은 사라질 수 있다', { 'font-size': 14.5, fill: WARN, opacity: fade(u, 2.2) }); return; }
    // k = 5,6: fgets → sscanf, k = 7: scanf 뒤 fgets 의 함정
    const LX = 120, LY = 200;
    if (k <= 6) { mono(24, 46, k === 5 ? 'fgets(line, sizeof line, stdin)' : 'sscanf(line, "%d", &m) == 1', { 'font-size': 16, 'font-weight': 800 });
      stream(24, 90, ['7', '\\n'], { title: '키보드 입력 (fgets 로만 읽을 때)', style: () => ({}) });
      const n = k === 5 ? Math.floor(clamp((u - 0.3) / 1.0) * 3.999) : 3;
      mono(24, LY + 28, 'line', { 'font-size': 16, 'font-weight': 800 });
      chars(LX, LY, Array.from({ length: 12 }, (_, i) => (i < n ? ['7', '\\n', '\\0'][i] : '')), { w: 46, style: (i) => (i < n ? { fill: ACCBG, stroke: ACC } : { stroke: GRID }) });
      tx(LX + 12 * 46 + 10, LY + 28, '… 64칸', { 'font-size': 14.5, fill: MUT });
      if (k === 5) { tx(24, 320, '크기 64 를 함께 넘긴다 · 최대 63글자 + \\0 이라 넘칠 수 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
        tx(24, 348, '줄바꿈 \\n 까지 담긴다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
      grow(LX + 23, LY + 50, LX + 23, 300, E(u, 0.3, 0.8), ACC);
      nBox(LX - 32, 304, u > 0.9 ? '7' : '?', { name: 'm', col: u > 0.9 ? ACC : WARN });
      mono(300, 340, '반환 1', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
      tx(420, 340, '읽기와 파싱을 나누면, 파싱이 실패해도 입력은 망가지지 않는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    mono(24, 46, '입력 "6\\n7\\n" 을 scanf 다음 fgets 로 읽으면', { 'font-size': 16, 'font-weight': 800 });
    const st = ['6', '\\n', '7', '\\n'];
    stream(24, 100, st, { title: '입력 스트림', style: (i) => (i === 0 ? { fill: GOODBG, stroke: GOOD, op: 1 - 0.6 * E(u, 0.6, 1.0) } : i === 1 ? { fill: u > 1.3 ? BADBG : PANEL, stroke: u > 1.3 ? BAD : INK } : {}) });
    tx(24, 172, 'scanf 가 6 만 가져간다', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.6) });
    tx(24, 198, 'fgets 는 남은 \\n 에서 줄이 끝났다고 본다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
    mono(24, LY + 66, 'line', { 'font-size': 16, 'font-weight': 800 });
    chars(LX, LY + 38, ['\\n', '\\0', '', '', '', ''], { w: 46, style: (i) => (i < 2 && u > 1.5 ? { fill: BADBG, stroke: BAD } : { stroke: GRID }) });
    term(24, 320, 440, [['$ printf "6\\n7\\n" | ./io', 'var(--panel)'], ['입력값의 제곱=36', null]], fade(u, 1.9));
    tx(490, 348, 'm=7 은 찍히지 않는다 (실행 확인)', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
    tx(490, 376, '입력은 처음부터 fgets 로 통일한다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.4) }); }

  // ---------- 5. 수학·시간·진단 ----------
  const MC = [['math.h', 'sqrt · pow · floor', '링크 시 -lm'], ['time.h', 'time · clock · strftime', '현재 시각·경과'], ['assert.h', 'assert(x)', 'NDEBUG 면 꺼짐'],
    ['errno.h', 'errno · perror · strerror', '실패 직후에만'], ['limits.h', 'INT_MAX · LONG_MAX', '타입 경계값'], ['stdint.h', 'int32_t · uint64_t', '고정 폭 정수']];
  function mcard(i, s, hot) { const x = 24 + (i % 3) * 306, y = 60 + Math.floor(i / 3) * 110, [n, f, tip] = MC[i]; if (s <= 0) return;
    card(x + 145, y + 46, 290, 92, { rx: 10, stroke: hot ? ACC : INK, s });
    if (s < 0.6) return; mono(x + 14, y + 24, n, { 'font-size': 16, 'font-weight': 800, fill: hot ? ACC : INK });
    mono(x + 14, y + 52, f, { 'font-size': 14 }); tx(x + 14, y + 76, tip, { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { mono(24, 34, k === 0 ? '#include <math.h> <time.h> <assert.h>' : '#include <errno.h> <stdint.h> <limits.h>', { 'font-size': 15.5, 'font-weight': 700 });
      MC.forEach((_, i) => mcard(i, k === 0 ? (i < 3 ? pop(u, 0.3 + i * 0.25) : 0) : i < 3 ? 1 : pop(u, 0.3 + (i - 3) * 0.25), k === 0 && i === 0));
      if (k === 0) { // -lm 이 sqrt 빈칸을 채운다
        const Y = 300; card(140, Y + 40, 200, 70, { rx: 10, stroke: INK, s: pop(u, 1.2) }); mono(60, Y + 32, 'misc.o', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.3) });
        const filled = u > 2.1; el('rect', { x: 60, y: Y + 44, width: 160, height: 24, rx: 5, fill: filled ? ACCBG : PANEL, stroke: filled ? ACC : BAD, 'stroke-dasharray': filled ? null : '5 4', 'stroke-width': 2, opacity: fade(u, 1.3) });
        mono(70, Y + 62, filled ? 'sqrt ← libm' : 'sqrt ?', { 'font-size': 14, 'font-weight': 700, fill: filled ? ACC : BAD, opacity: fade(u, 1.3) });
        mono(300, Y + 40, '$ gcc misc.c -lm', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.5) });
        fly(760, Y + 40, 140, Y + 56, seg(u, 1.6, 2.1), 'libm', { mono: true });
        tx(300, Y + 72, '-lm 을 빠뜨리면 sqrt 가 undefined reference', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      else { tx(24, 330, 'int 의 크기는 플랫폼마다 다를 수 있다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.4) });
        tx(24, 360, '폭이 중요하면 stdint.h · 경계값은 limits.h', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 2) { // 한 변 1 인 정사각형의 대각선 = √2
      const x0 = 120, y0 = 330, L = 200, d = E(u, 0.4, 1.3);
      el('rect', { x: x0, y: y0 - L, width: L, height: L, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      mono(x0 + L / 2, y0 + 26, '1', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' }); mono(x0 - 20, y0 - L / 2 + 6, '1', { 'font-size': 18, 'font-weight': 800 });
      el('line', { x1: x0, y1: y0, x2: x0 + L * d, y2: y0 - L * d, stroke: ACC, 'stroke-width': 4 });
      if (d > 0.95) mono(x0 + L / 2 + 26, y0 - L / 2 + 6, '√2', { 'font-size': 18, 'font-weight': 800, fill: ACC });
      mono(420, 140, 'sqrt(2.0)', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.0) });
      term(420, 170, 340, [['sqrt(2)=1.4142', 'var(--panel)']], fade(u, 1.5));
      tx(420, 260, '%.4f 라서 소수 넷째 자리까지 찍힌다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) });
      tx(420, 290, '-lm 이 없으면 링크에서 멈추는 줄이 바로 이것', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { mono(24, 46, 'int32_t fixed = 100;', { 'font-size': 16, 'font-weight': 800 });
      const nb = Math.floor(clamp((u - 0.2) / 0.9) * 32.999);
      for (let i = 0; i < 32; i++) { const bit = (100 >> (31 - i)) & 1; const x = 24 + i * 28 + Math.floor(i / 8) * 6;
        el('rect', { x, y: 70, width: 24, height: 36, rx: 3, fill: i < nb ? (bit ? ACC : PANEL) : SOFT, stroke: i < nb ? ACC : GRID, 'stroke-width': 1.5 });
        if (i < nb) mono(x + 12, 94, String(bit), { 'font-size': 14, 'font-weight': 700, fill: bit ? PANEL : MUT, 'text-anchor': 'middle' }); }
      tx(24, 132, '어느 플랫폼에서도 정확히 32비트 · 100 의 2진수', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.1) });
      term(24, 160, 480, [['INT_MAX=2147483647 bytes=4', 'var(--panel)']], fade(u, 1.3));
      tx(530, 192, '이 PC 의 int 는 4바이트', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) });
      el('rect', { x: 24, y: 260, width: 400, height: 56, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.9) });
      mono(42, 294, 'assert(fixed > 0);', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); check(400, 288, 9, fade(u, 2.2));
      tx(450, 294, '참이라 그대로 지나간다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { mono(24, 46, 'FILE *fp = fopen("nope.txt", "r");', { 'font-size': 16, 'font-weight': 800 });
      card(110, 120, 140, 52, { rx: 8, text: 'fp = NULL', fs: 16, mono: true, fw: 800, stroke: BAD, color: BAD, s: pop(u, 0.4) });
      grow(184, 120, 300, 120, E(u, 0.7, 1.0), BAD);
      card(400, 120, 180, 52, { rx: 8, text: 'errno = ENOENT', fs: 15, mono: true, fw: 800, stroke: WARN, s: pop(u, 1.0) });
      grow(494, 120, 600, 120, E(u, 1.3, 1.6), MUT);
      term(610, 98, 330, [['fopen: No such file', 'var(--badbg)'], ['or directory', 'var(--badbg)']], fade(u, 1.6));
      tx(24, 230, 'perror 는 실패 바로 다음 줄에서 부른다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(24, 260, '다른 호출이 끼면 errno 가 바뀌거나, 성공해도 옛 값이 남는다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    // k = 5: time(NULL) 과 man 3
    mono(24, 46, 'time(NULL)', { 'font-size': 18, 'font-weight': 800 });
    el('line', { x1: 40, y1: 120, x2: 40 + 420 * E(u, 0.3, 1.2), y2: 120, stroke: ACC, 'stroke-width': 4 });
    mono(40, 148, '1970-01-01 00:00 UTC', { 'font-size': 14, fill: MUT });
    mono(460, 112, 'now=1795491148', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.2) });
    tx(460, 148, '그때부터 흐른 초 · 값은 예시', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.3) });
    el('rect', { x: 540, y: 30, width: 396, height: 200, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.0) });
    [['$ man 3 sqrt', MUT, 700], ['SYNOPSIS', INK, 800], ['#include <math.h>', ACC, 800], ['double sqrt(double x);', INK, 400], ['Link with -lm.', WARN, 700]].forEach(([s, col, fw], i) =>
      mono(556, 60 + i * 34, s, { 'font-size': 14.5, fill: col, 'font-weight': fw, opacity: fade(u, 1.2 + i * 0.2) }));
    tx(24, 300, '모르는 함수는 man 3 함수명 으로', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
    tx(24, 330, '헤더 · 시그니처 · 반환값 · 에러를 확인한다', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'sqrt를 쓰는 프로그램을 빌드할 때 math.h include 말고 더 필요한 것은 무엇인가?',
      o: ['링크할 때 -lm을 붙인다', '-g 플래그를 붙인다', 'stdlib.h도 include한다'], a: 0,
      why: 'math.h는 선언만 준다. sqrt의 실제 코드는 수학 라이브러리 libm에 있어 -lm으로 링크해야 한다.' },
    { q: 'char dst[8]에 snprintf(dst, sizeof dst, "%s", "hello world")를 하면 dst는 어떻게 되는가?',
      o: ['hello world 12칸이 모두 들어가 옆 칸을 덮는다', '"hello w"와 \\0이 들어가 strlen이 7이다', '아무것도 쓰지 않고 실패한다'], a: 1,
      why: 'snprintf는 크기 8을 알기 때문에 7글자만 담고 마지막 칸에 \\0을 넣는다. 실제 출력도 dst="hello w" len=7이었다.' },
    { q: 'free(arr) 바로 다음에 arr = NULL을 넣는 이유는 무엇인가?',
      o: ['메모리를 한 번 더 돌려주기 위해', 'qsort가 다시 정렬하게 하려고', '반납한 메모리를 모르고 다시 쓰는 일을 막으려고'], a: 2,
      why: '반납한 주소를 그대로 들고 있으면 use-after-free나 double free가 조용히 일어난다. NULL이면 다시 쓸 때 바로 드러난다.' },
    { q: 'scanf("%d", &n)에 "abc"를 입력하면 반환값과 n은 어떻게 되는가?',
      o: ['반환 0, n은 손대지 않은 쓰레기값', '반환 1, n은 0', '반환 EOF, n은 -1'], a: 0,
      why: '반환값은 읽은 항목 수다. 하나도 못 읽어 0이고 n에는 아무것도 쓰지 않는다. 그래서 != 1 검사가 필요하다.' },
    { q: 'fopen이 NULL을 준 직후 perror("fopen")을 부르면 무엇이 찍히는가?',
      o: ['fopen: Success', 'fopen: No such file or directory', '아무것도 찍히지 않는다'], a: 1,
      why: 'fopen이 실패하며 errno에 ENOENT를 남겼고, perror가 그 값을 문장으로 바꿔 stderr에 찍는다.' },
  ];

  const summary = [
    '쓰는 함수의 헤더를 include해야 컴파일러가 반환형과 인자를 안다.',
    'strcpy는 dst 크기를 모른다. 크기를 받는 snprintf는 7글자와 \\0만 담는다.',
    'malloc 결과는 NULL을 확인하고, 다 쓰면 free 한 번 뒤 포인터를 NULL로 둔다.',
    'scanf·fopen 같은 입출력은 반환값을 읽어 실패를 바로 처리한다.',
  ];
  const review = [
    { q: '사용자 이름을 char name[16]에 strcpy로 담았더니, 긴 이름을 넣을 때마다 옆 변수 값이 바뀐다. 먼저 바꿀 것은?',
      o: ['name을 지역 변수 대신 전역으로 옮긴다', 'snprintf(name, sizeof name, "%s", src)로 바꾼다', 'strlen으로 길이를 출력해 본다'], a: 1,
      why: 'strcpy는 \\0까지 끝까지 써서 16칸 밖을 덮는다. 크기를 받는 함수로 바꾸면 넘치지 않고 잘린다.' },
    { q: 'scanf로 나이를 받은 뒤 fgets로 이름을 받았더니 이름이 항상 빈 줄이다. 원인은?',
      o: ['fgets의 크기 인자가 너무 작다', 'stdin 버퍼가 가득 찼다', 'scanf가 남긴 줄바꿈을 fgets가 읽었다'], a: 2,
      why: 'scanf는 숫자만 가져가고 줄바꿈을 남긴다. 다음 fgets는 그 줄바꿈에서 줄이 끝났다고 본다. 입력은 fgets 하나로 통일한다.' },
    { q: '설정 파일의 숫자를 atoi로 읽었는데 잘못된 값이 들어와도 0으로 동작한다. 어떻게 고칠까?',
      o: ['strtol로 읽고 end 포인터로 어디서 멈췄는지 확인한다', 'atoi 결과에 1을 더한다', 'scanf로 바꾼다'], a: 0,
      why: 'atoi("abc")와 atoi("0")은 둘 다 0이라 구분되지 않는다. strtol은 end가 숫자 뒤 위치를 가리켜 실패를 알 수 있다.' },
  ];

  R.page({ title: '표준 라이브러리 헤더 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
