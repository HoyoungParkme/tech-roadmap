/* III-2-1 C 문자열과 버퍼 오버플로 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * char 배열 칸과 널 종료(\0), 경계를 넘는 바이트를 그린다. 칸 상태와 체크리스트는 페이지 STEPS의 cells · facts · checklist를 읽는다.
 * 실측: zig cc 0.17 (-O0, Windows x64). 예시 입력은 그림에 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, fly, dot, cross, check, terminal, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 도우미 ----------
  // 바이트 칸 한 줄. v: 글자(문자열) 또는 null. st(i) → 'data' | 'nul' | 'empty' | 'bad' | 'zero' | 'ro'
  function row(x, y, n, w, v, st, o) { o = o || {}; const h = o.h || 46;
    for (let i = 0; i < n; i++) { const s = st(i), cx = x + i * w, sc = o.s ? o.s(i) : 1; if (sc <= 0) continue;
      const col = s === 'bad' ? BAD : s === 'nul' ? WARN : s === 'zero' ? WARN : s === 'empty' ? GRID : s === 'ro' ? MUT : ACC;
      const bg = s === 'bad' ? BADBG : s === 'nul' ? WARNBG : s === 'zero' ? PANEL : s === 'empty' ? PANEL : s === 'ro' ? SOFT : ACCBG;
      el('rect', { x: cx, y, width: w - 3, height: h, rx: 5, fill: bg, stroke: col, 'stroke-width': s === 'empty' ? 1.4 : 2, 'stroke-dasharray': s === 'empty' || s === 'zero' ? '4 3' : null, opacity: sc });
      const ch = v ? v(i) : null; if (ch != null) mono(cx + (w - 3) / 2, y + h / 2 + 6, ch, { 'font-size': ch.length > 1 ? 14.5 : 17, 'font-weight': 800, 'text-anchor': 'middle', fill: s === 'bad' ? BAD : s === 'nul' || s === 'zero' ? WARN : INK, opacity: sc * (o.vop ? o.vop(i) : 1) });
      if (o.index) mono(cx + (w - 3) / 2, y + h + 18, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: sc }); } }
  // 가로 괄호 + 이름표
  function brace(x1, x2, y, s, col, op, up) { const d = up ? -10 : 10;
    el('path', { d: `M${x1},${y} v${d} H${x2} v${-d}`, fill: 'none', stroke: col, 'stroke-width': 2.2, opacity: op });
    mono((x1 + x2) / 2, y + d + (up ? -8 : 22), s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: op }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const SRC = 'ABCDEFGHIJ';   // 예시 입력 (10글자)

  // ---------- 1. 문자열 = char 배열 + \0 ----------
  const HELLO = ['H', 'e', 'l', 'l', 'o', '\\0'];
  function facts(c) { const fs = c.beat.facts || [];
    fs.forEach((f, i) => { const y = 56 + i * 54, fresh = c.prev && c.prev.facts && c.prev.facts[i] && c.prev.facts[i].v !== f.v, op = fresh ? fade(c.u, 0.9) : 1;
      el('rect', { x: 690, y: y - 24, width: 240, height: 44, rx: 10, fill: PANEL, stroke: fresh ? ACC : GRID, 'stroke-width': fresh ? 2.4 : 1.5 });
      mono(706, y + 4, f.k, { 'font-size': 15, 'font-weight': 700 }); mono(916, y + 5, f.v, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: f.v === '?' ? MUT : ACC, opacity: f.v === '?' ? 1 : op }); }); }
  function s1(t, c) { const { k, u } = c, X = 60, W = 68, Y = 150;
    facts(c);
    const dim = k >= 4 ? 0.35 : 1;
    mono(X, Y - 18, k === 0 ? 'char msg[8]  (아직 채우기 전)' : 'char msg[8] = "Hello";', { 'font-size': 15, 'font-weight': 700, opacity: dim });
    if (k === 0) { row(X, Y, 8, W, () => '?', () => 'empty', { index: true, s: (i) => pop(u, 0.3 + i * 0.1) }); sub(X + 272, 260, 'C 에는 문자열 타입이 없다. char 칸이 이어진 배열일 뿐이다', fade(u, 1.5), { 'font-size': 15 }); return; }
    const st = (i) => (i < 5 ? 'data' : i === 5 ? 'nul' : 'zero');
    row(X, Y, 8, W, (i) => (i < 6 ? HELLO[i] : '\\0'), st, { index: true, s: k === 1 ? (i) => pop(u, 0.2 + i * 0.22, 0.5) : (i) => dim });
    if (k === 1) { sub(X + 5.5 * W, Y + 90, '널 종료가 자동으로 붙는다', fade(u, 1.6), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 });
      sub(X + 7 * W, Y + 112, '남은 칸도 0으로 채워진다', fade(u, 2.1), { 'font-size': 14 }); }
    if (k === 2) { const p = Math.min(5, Math.floor(E(u, 0.2, 2.0) * 6)), cx = X + p * W + W / 2 - 2;
      el('path', { d: `M${cx - 9},${Y - 34} L${cx + 9},${Y - 34} L${cx},${Y - 20} Z`, fill: p === 5 ? WARN : ACC });
      for (let i = 0; i < p; i++) mono(X + i * W + W / 2 - 2, Y + 92, String(i + 1), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      if (p === 5) tx(X + 5 * W + W / 2, Y + 96, '여기서 멈춤', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      sub(X + 272, 330, 'strlen은 배열 크기를 모른다. \\0을 만날 때까지 셀 뿐이다', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 3) { brace(X, X + 5 * W - 3, Y + 70, 'strlen = 5', ACC, fade(u, 0.3));
      brace(X, X + 8 * W - 3, Y - 40, 'sizeof = 8', INK, fade(u, 1.0), true);
      sub(X + 272, 340, '버퍼 크기는 sizeof, 글자 수는 strlen. 섞으면 한 칸이 모자란다', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }
    if (k === 4) { // 리터럴은 읽기 전용 영역
      el('rect', { x: 40, y: 250, width: 200, height: 120, rx: 10, fill: SOFT }); tx(54, 272, '스택', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      card(140, 316, 150, 44, { rx: 6, text: 'char* lit', fs: 15, mono: true, stroke: INK }); mono(140, 360, '8 B (주소 하나)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      el('rect', { x: 300, y: 250, width: 380, height: 120, rx: 10, fill: SOFT, stroke: MUT, 'stroke-dasharray': '5 4' }); tx(340, 272, '읽기 전용 영역', { 'font-size': 14, 'font-weight': 700, fill: MUT }); lock(318, 268, true, MUT, 0.8);
      row(330, 296, 6, 54, (i) => HELLO[i], () => 'ro', { s: (i) => pop(u, 0.2 + i * 0.08) });
      el('line', { x1: 216, y1: 316, x2: 324, y2: 318, stroke: INK, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 0.7) });
      fly(150, 222, 356, 300, seg(u, 1.0, 1.8), "lit[0] = 'h'", { mono: true, fill: BAD });
      cross(356, 318, 16, pop(u, 1.8)); tx(810, 316, '세그멘테이션 폴트', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 5) { el('rect', { x: 40, y: 250, width: 380, height: 130, rx: 10, fill: SOFT, stroke: MUT, 'stroke-dasharray': '5 4' }); tx(56, 272, '읽기 전용 "Hello"', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      row(60, 296, 6, 54, (i) => HELLO[i], () => 'ro');
      el('rect', { x: 480, y: 250, width: 440, height: 130, rx: 10, fill: SOFT }); tx(496, 272, '스택 char buf[6]', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 6; i++) fly(60 + i * 54 + 25, 318, 510 + i * 54 + 25, 318, seg(u, 0.2 + i * 0.12, 0.8 + i * 0.12), HELLO[i], { mono: true });
      const changed = u > 1.7;
      row(510, 296, 6, 54, (i) => (i === 0 && changed ? 'h' : HELLO[i]), (i) => (i === 5 ? 'nul' : 'data'), { s: (i) => (u > 0.8 + i * 0.12 ? 1 : 0), vop: (i) => (i === 0 ? 1 : 1) });
      if (changed) el('rect', { x: 508, y: 294, width: 55, height: 50, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 3 });
      mono(700, 368, '출력: hello', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); } }

  // ---------- 2. 위험 함수 vs 크기를 받는 함수 ----------
  function srcRow(y, op) { mono(60, y - 14, 'src = "ABCDEFGHIJ"  (예시 입력 10글자)', { 'font-size': 14.5, 'font-weight': 700, opacity: op });
    row(60, y, 11, 44, (i) => (i < 10 ? SRC[i] : '\\0'), (i) => (i < 10 ? 'data' : 'nul'), { s: () => op, h: 40 }); }
  function s2(t, c) { const { k, u } = c, X = 60, W = 56, Y = 200;
    srcRow(70, 1);
    if (k === 4) { // strncat로 남은 공간만큼
      const L = 'log: ' + SRC, w = 52;
      mono(X, Y - 18, 'char line[16] = "log: ";', { 'font-size': 15, 'font-weight': 700 });
      row(X, Y, 16, w, (i) => (i < 5 ? 'log: '[i] === ' ' ? '␣' : 'log: '[i] : i < 15 ? (u > 0.6 + (i - 5) * 0.13 ? L[i] : null) : (u > 2.0 ? '\\0' : null)),
        (i) => (i < 5 ? 'data' : i < 15 ? (u > 0.6 + (i - 5) * 0.13 ? 'data' : 'empty') : u > 2.0 ? 'nul' : 'empty'), { index: true });
      brace(X + 5 * w, X + 15 * w - 3, Y + 76, '16 − 5 − 1 = 10칸', ACC, fade(u, 0.3));
      sub(480, 370, 'strncat의 세 번째 인자는 "붙일 최대 길이". 널 자리 1칸을 뺀다', fade(u, 2.2), { 'font-size': 15 }); return; }
    const name = k === 3 ? 'char t[8]' : 'char dst[8]';
    mono(X, Y - 18, name, { 'font-size': 15, 'font-weight': 700 });
    // 8칸 + 이웃 3칸
    tx(X + 8 * W + 70, Y - 18, '이웃 메모리', { 'font-size': 14, 'font-weight': 700, fill: k === 1 ? BAD : MUT, 'text-anchor': 'middle' });
    el('rect', { x: X + 8 * W - 2, y: Y - 6, width: 3 * W + 4, height: 58, rx: 6, fill: 'none', stroke: k === 1 ? BAD : GRID, 'stroke-dasharray': '5 4' });
    if (k === 0) { row(X, Y, 8, W, null, () => 'empty', { index: true, s: (i) => pop(u, 0.2 + i * 0.06) });
      card(700, 330, 380, 70, { rx: 12, stroke: INK, s: pop(u, 1.0) }); mono(700, 322, 'strcpy(dst, src)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      tx(700, 348, '받는 것은 주소 두 개뿐 · 크기는 모른다', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(250, 330, '8 이라는 크기는 선언한 쪽만 안다', fade(u, 1.8), { 'font-size': 15 }); return; }
    const at = (i) => 0.3 + i * 0.16;
    if (k === 1) { row(X, Y, 11, W, (i) => (u > at(i) ? (i < 10 ? SRC[i] : '\\0') : null), (i) => (u > at(i) ? (i < 8 ? 'data' : 'bad') : i < 8 ? 'empty' : 'empty'), { index: true });
      tx(X + 9.5 * W, Y + 100, '3바이트가 넘쳤다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(300, 340, 'strcpy가 멈추는 기준은 src의 \\0 뿐이다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 2) { row(X, Y, 8, W, (i) => (u > at(i) ? (i < 7 ? SRC[i] : '\\0') : null), (i) => (u > at(i) ? (i < 7 ? 'data' : 'nul') : 'empty'), { index: true });
      ['H', 'I', 'J'].forEach((ch, j) => { const f = seg(u, 1.6 + j * 0.1, 2.3 + j * 0.1); if (f > 0 && f < 1) mono(X + (8 + j) * W + 26, Y + 30 + 60 * f, ch, { 'font-size': 17, 'font-weight': 800, fill: MUT, opacity: 1 - f }); });
      mono(700, 340, 'snprintf(dst, sizeof(dst), "%s", src)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      tx(700, 372, '7글자 + \\0 · 넘칠 수 없다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    // k3: strncpy는 \0을 붙이지 않는다 → t[7] = '\0'
    const fix = u > 1.8;
    row(X, Y, 8, W, (i) => (u > at(i) ? (i === 7 && fix ? '\\0' : SRC[i]) : null), (i) => (u > at(i) ? (i === 7 ? (fix ? 'nul' : 'bad') : 'data') : 'empty'), { index: true });
    tx(X + 7.5 * W, Y + 100, fix ? "t[7] = '\\0'로 마무리" : '\\0이 없다', { 'font-size': 15, 'font-weight': 800, fill: fix ? GOOD : BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
    mono(700, 340, 'strncpy(t, src, sizeof(t))', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
    sub(700, 372, '잘리면 널 종료를 붙이지 않는다', fade(u, 1.0), { 'font-size': 15 }); }

  // ---------- 3. 오버플로가 이웃을 덮는다 ----------
  const OX = 66, OW = 46, OY = 140, OFL = 'OVERFLOW!';
  function strip(bytes, st) { // 0~5 dst, 6~9 is_admin, 10~17 복귀 주소
    [['char dst[6]', 0, 6, ACC], ['int is_admin', 6, 4, INFO], ['복귀 주소 (8B)', 10, 8, INK]].forEach(([s, a, n, col]) => {
      el('path', { d: `M${OX + a * OW},${OY - 12} v-8 H${OX + (a + n) * OW - 3} v8`, fill: 'none', stroke: col, 'stroke-width': 2 });
      tx(OX + (a + n / 2) * OW, OY - 28, s, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); });
    row(OX, OY, 18, OW, (i) => bytes[i], st, { index: true }); }
  function s3(t, c) { const { k, u } = c;
    el('rect', { x: 40, y: 64, width: 880, height: 170, rx: 12, fill: SOFT }); tx(56, 86, 'login()의 스택 프레임 (낮은 주소 → 높은 주소)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const at = (i) => 0.3 + i * 0.16;
    let bytes, st, val;
    if (k === 0) { bytes = ['H', 'i', '\\0', null, null, null, '00', '00', '00', '00'].concat(Array(8).fill('··'));
      st = (i) => (i < 2 ? 'data' : i === 2 ? 'nul' : i < 6 ? 'empty' : i < 10 ? 'zero' : 'ro'); val = 0; }
    else if (k === 4) { const L = 18, n = Math.floor(lerp(0, L, E(u, 0.2, 2.0)));
      bytes = Array.from({ length: 18 }, (_, i) => (i < n ? 'A' : i < 6 ? null : i < 10 ? '··' : '··'));
      st = (i) => (i < n ? (i < 6 ? 'data' : 'bad') : i < 6 ? 'empty' : 'ro'); val = null; }
    else { const all = OFL.split('').concat(['\\0']), n = k === 1 ? Math.floor(lerp(0, 10, E(u, 0.2, 2.0)) + 0.001) : 10;
      bytes = Array.from({ length: 18 }, (_, i) => (i < 10 ? (i < n ? all[i] : i < 6 ? null : '00') : '··'));
      st = (i) => (i < 10 ? (i < n ? (i < 6 ? (all[i] === '\\0' ? 'nul' : 'data') : 'bad') : i < 6 ? 'empty' : 'zero') : 'ro');
      val = n >= 10 ? 2185039 : 0; }
    strip(bytes, st);
    // is_admin 값
    if (val != null) { const v = k === 1 ? (u > 2.0 ? Math.round(lerp(0, 2185039, E(u, 2.0, 2.6))) : 0) : val;
      mono(OX + 8 * OW, OY + 104, `is_admin = ${v.toLocaleString('en-US')}`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: v ? BAD : GOOD }); }
    if (k === 0) { sub(480, 290, '"Hi"는 널 포함 3바이트라 6칸 안에 들어간다', fade(u, 0.8), { 'font-size': 15 }); return; }
    if (k === 1) { mono(480, 300, 'strcpy(dst, "OVERFLOW!")', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      sub(480, 334, '9글자 + 널 = 10바이트 → 6칸을 넘친 4바이트가 is_admin에 쓰였다', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      sub(480, 400, '실측 (zig cc -O0 -fno-stack-protector): is_admin이 dst 바로 뒤. 배치는 컴파일러마다 다르다', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    if (k === 2) { mono(240, 300, 'if (is_admin)', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      el('line', { x1: 330, y1: 294, x2: 430, y2: 294, stroke: BAD, 'stroke-width': 3, 'marker-end': 'url(#ra-ahr)', opacity: fade(u, 0.6) });
      terminal(450, 262, 440, 76, ['관리자 권한 탈취!'], lerp(0, 1, E(u, 0.9, 1.6)), { fs: 15 });
      sub(480, 370, '0x0021574F는 0이 아니라 참이다. 프로그램은 오류 없이 계속 돈다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 3) { const bx = 160, sc = 60;
      tx(bx - 14, 300, '입력', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(bx - 14, 340, '버퍼', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: bx, y: 284, width: 10 * sc * E(u, 0.2, 1.2), height: 24, rx: 4, fill: BAD, opacity: 0.8 }); mono(bx + 10 * sc + 10, 302, '10 B', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      el('rect', { x: bx, y: 324, width: 6 * sc, height: 24, rx: 4, fill: ACC, opacity: 0.8 }); mono(bx + 6 * sc + 10, 342, '6 B', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      el('line', { x1: bx + 6 * sc, y1: 276, x2: bx + 6 * sc, y2: 356, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
      sub(480, 394, '길이 검증 한 줄이 빠지면 입력 하나로 충분하다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // k4: 복귀 주소까지
    const hit = u > 2.0;
    mono(480, 296, '더 긴 입력 "AAAA…" (예시 18바이트)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
    if (hit) { mono(OX + 14 * OW, OY + 104, 'ret = 0x4141414141414141', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      pill(300, 350, 'SIGSEGV', BAD, pop(u, 2.1), { mono: true, fs: 15 }); tx(560, 356, '또는 공격자가 고른 주소로 점프', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); } }

  // ---------- 4. 1바이트 · gets · fgets ----------
  function s4(t, c) { const { k, u } = c, X = 120, W = 64, Y = 150, H5 = ['h', 'e', 'l', 'l', 'o', '\\0'];
    if (k <= 1) { const n = k === 0 ? 5 : 6, at = (i) => 0.3 + i * 0.25;
      mono(X, Y - 18, k === 0 ? 'char buf[5]; strcpy(buf, "hello");' : 'char buf[6]; strcpy(buf, "hello");', { 'font-size': 15, 'font-weight': 700 });
      row(X, Y, 6, W, (i) => (u > at(i) ? H5[i] : null), (i) => (i >= n ? (u > at(i) ? 'bad' : 'empty') : u > at(i) ? (i === 5 ? 'nul' : 'data') : 'empty'), { index: true });
      if (k === 0) { el('rect', { x: X + 5 * W - 4, y: Y - 6, width: W + 4, height: 58, rx: 6, fill: 'none', stroke: BAD, 'stroke-dasharray': '5 4' });
        tx(X + 5.5 * W, Y + 96, 'buf 밖 1칸', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        sub(480, 330, '글자 5 + 널 1 = 6바이트가 필요하다', fade(u, 2.0), { 'font-size': 15.5, 'font-weight': 700 }); }
      else { check(X + 6 * W + 30, Y + 23, 14, pop(u, 1.9)); sub(480, 330, '버퍼 크기 = 글자 수 + 1', fade(u, 2.0), { 'font-size': 16, 'font-weight': 800, fill: GOOD }); }
      return; }
    if (k === 2) { // gets는 멈추지 않는다
      mono(X, Y - 18, 'gets(buf);   // buf는 6칸', { 'font-size': 15, 'font-weight': 700 });
      const n = Math.floor(lerp(0, 12, E(u, 0.2, 2.2)));
      row(X, Y, 12, 58, (i) => (i < n ? 'x' : null), (i) => (i < n ? (i < 6 ? 'data' : 'bad') : i < 6 ? 'empty' : 'empty'), { index: true });
      mono(X + 12 * 58 + 20, Y + 30, '…', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      tx(480, 300, '입력 길이를 전혀 제한하지 않는다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      pill(480, 350, 'C11에서 표준에서 삭제', BAD, pop(u, 2.0), { fs: 15 }); return; }
    if (k === 3) { // fgets(in, 64) — 8 × 8 칸
      mono(60, 60, 'char in[64];  fgets(in, sizeof(in), stdin);', { 'font-size': 15, 'font-weight': 700 });
      const n = Math.floor(lerp(0, 64, E(u, 0.2, 1.8)));
      for (let i = 0; i < 64; i++) { const x = 60 + (i % 16) * 30, y = 90 + Math.floor(i / 16) * 34, on = i < n, nul = i === 63;
        el('rect', { x, y, width: 27, height: 30, rx: 3, fill: on ? (nul ? WARNBG : ACCBG) : PANEL, stroke: on ? (nul ? WARN : ACC) : GRID, 'stroke-width': 1.4 }); }
      if (n >= 64) mono(60 + 15 * 30 + 13, 90 + 3 * 34 + 21, '\\0', { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      mono(270, 260, '최대 63글자 + \\0', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) });
      el('rect', { x: 600, y: 90, width: 320, height: 130, rx: 12, fill: SOFT });
      tx(620, 120, '읽지 못한 나머지 입력', { 'font-size': 15, 'font-weight': 700 }); tx(620, 148, '다음 읽기를 기다린다', { 'font-size': 14.5, fill: MUT });
      for (let i = 0; i < 8; i++) el('rect', { x: 620 + i * 34, y: 170, width: 30, height: 30, rx: 3, fill: OFF, opacity: fade(u, 1.9 + i * 0.05) });
      sub(480, 330, 'fgets는 크기를 받으니 입력이 아무리 길어도 버퍼를 넘지 않는다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k4: 개행을 \0으로
    const K = ['K', 'i', 'm', '\\n', '\\0', null, null, null], fix = u > 1.4;
    mono(X, Y - 18, '입력 "Kim⏎" (예시)이 in[]에 들어온 모습', { 'font-size': 15, 'font-weight': 700 });
    row(X, Y, 8, W, (i) => (i === 3 && fix ? '\\0' : K[i]), (i) => (i < 3 ? 'data' : i === 3 ? (fix ? 'nul' : 'bad') : i === 4 ? 'nul' : 'empty'), { index: true });
    mono(X + 3.5 * W, Y + 100, 'strcspn(in, "\\n") = 3', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
    el('path', { d: `M${X + 3.5 * W},${Y + 80} v-24`, stroke: ACC, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ahb)', opacity: fade(u, 0.5) });
    sub(480, 340, "in[3] = '\\0'으로 개행이 사라지고 널 종료가 확실해진다", fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }

  // ---------- 5. 안전한 조립과 체크리스트 ----------
  function checklist(c) { const rows = c.beat.checklist || [], pr = (c.prev && c.prev.checklist) || [], k = c.k;
    tx(590, 46, '안전 체크리스트', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    rows.forEach((r, i) => { const y = 64 + i * 66, ok = /^✔/.test(r.note) || k === 5, was = pr[i] && /^✔/.test(pr[i].note), turn = ok && !was && k < 5;
      el('rect', { x: 580, y, width: 350, height: 58, rx: 10, fill: PANEL, stroke: ok ? GOOD : GRID, 'stroke-width': ok ? 2 : 1.4 });
      el('circle', { cx: 600, cy: y + 20, r: 8, fill: ok ? GOOD : OFF, opacity: turn ? fade(c.u, 1.2) : 1 });
      tx(618, y + 25, r.do, { 'font-size': 14.5, 'font-weight': 800 });
      tx(618, y + 47, k === 5 ? r.tool : r.note.replace(/^✔\s*/, ''), { 'font-size': 13.5, fill: ok ? GOOD : MUT, 'font-weight': 600, class: k === 5 ? 'mono' : null }); }); }
  function s5(t, c) { const { k, u } = c, X = 40, W = 32;
    checklist(c);
    const greet = (s, n) => row(X, 150, 16, W, (i) => (i < s.length ? (s[i] === ' ' ? '␣' : s[i]) : i === s.length ? '\\0' : null), (i) => (i < s.length ? 'data' : i === s.length ? 'nul' : 'empty'), { s: (i) => (i <= s.length ? n(i) : 1), h: 42 });
    if (k === 0) { mono(X, 120, 'snprintf(out, cap = 16, "Hello, %s!", name)', { 'font-size': 14.5, 'font-weight': 700 });
      greet('Hello, Kim!', (i) => pop(u, 0.3 + i * 0.12, 0.4));
      mono(X, 240, 'name = "Kim" (예시) → n = 11', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      sub(280, 320, '버퍼를 받는 함수는 용량 cap도 함께 받는다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { mono(X, 120, 'name = "Christopher" (예시)', { 'font-size': 14.5, 'font-weight': 700 });
      greet('Hello, Christop', (i) => pop(u, 0.2 + i * 0.08, 0.3));
      mono(X, 240, 'n = 19  ≥  cap 16', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      pill(170, 300, 'return -1', BAD, pop(u, 2.0), { mono: true, fs: 15 }); sub(380, 304, '잘렸다고 호출자에게 알린다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { mono(X, 72, 'char line[32];  fgets(line, sizeof(line), stdin);', { 'font-size': 14.5, 'font-weight': 700 });
      const n = k === 2 ? Math.floor(lerp(0, 32, E(u, 0.2, 1.6))) : 0;
      for (let i = 0; i < 32; i++) { const x = X + (i % 16) * W, y = 92 + Math.floor(i / 16) * 46, on = k === 2 && i < n, nul = i === 31;
        el('rect', { x, y, width: W - 3, height: 40, rx: 4, fill: on ? (nul ? WARNBG : ACCBG) : PANEL, stroke: on ? (nul ? WARN : ACC) : GRID, 'stroke-width': 1.4 }); }
      if (k === 2) { mono(280, 238, '최대 31글자 + \\0', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.7) });
        sub(280, 290, 'gets 대신 크기를 받는 fgets가 첫 방어선', fade(u, 2.0), { 'font-size': 15 }); return; }
      const K = ['K', 'i', 'm', '\\n', '\\0'], fix = u > 1.2;
      K.forEach((ch, i) => { const x = X + i * W, nl = i === 3; mono(x + 14, 118, nl && fix ? '\\0' : ch, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: nl ? (fix ? WARN : BAD) : i === 4 ? WARN : INK }); });
      mono(280, 238, 'line[strcspn(line, "\\n")] = \'\\0\'', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      sub(280, 290, '입력 "Kim⏎" (예시)의 개행 자리가 \\0이 된다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 4) { mono(X, 70, 'char msg[16];  make_greeting(msg, sizeof(msg), line)', { 'font-size': 14, 'font-weight': 700 });
      [['"Kim"', '11', 'Hello, Kim!', GOOD], ['"Christopher"', '-1', '이름이 너무 깁니다(잘림)', WARN]].forEach(([a, r, out, col], i) => { const y = 130 + i * 110, op = fade(u, 0.3 + i * 0.8);
        mono(X, y, `line = ${a}`, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(X + 300, y, `→ ${r}`, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op });
        terminal(X, y + 12, 500, 72, [out], op > 0.99 ? 1 : 0, { fs: 15 }); });
      sub(280, 372, '잘리는 건 정상이다. 잘렸다는 걸 알 수 있어야 한다 (입력은 예시)', fade(u, 2.0), { 'font-size': 14 }); return; }
    terminal(X, 90, 510, 110, ['$ gcc -Wall -Wextra -fsanitize=address safe_string.c', '$ ./a.out'], lerp(0, 2, E(u, 0.2, 1.4)), { title: '빌드 옵션', fs: 13.5 });
    sub(290, 250, '-Wall -Wextra 경고 + ASan이 실행 중 오버플로를 잡는다', fade(u, 1.6), { 'font-size': 15 });
    sub(290, 290, '사람 눈이 놓친 것은 도구가 한 번 더 본다', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }

  const quiz = [
    { q: 'char msg[8] = "Hello"; 에서 strlen(msg)와 sizeof(msg)는 각각 얼마인가?',
      o: ['5와 8', '6과 8', '5와 6'], a: 0,
      why: 'strlen은 \\0 앞까지 센 글자 수 5를, sizeof는 배열 전체 칸 수 8을 돌려준다. 널 칸까지 세면 6이지만 그 값을 주는 함수는 없다.' },
    { q: 'src가 10글자일 때 8칸 dst에 snprintf(dst, sizeof(dst), "%s", src)를 하면 dst는 어떻게 되는가?',
      o: ['10글자가 모두 들어가고 2칸이 넘친다', '앞 7글자와 \\0이 들어간다', '앞 8글자가 들어가고 \\0은 없다'], a: 1,
      why: 'snprintf는 크기 8을 넘지 않게 7글자에서 자르고 널 종료를 붙인다. 앞 8글자에 \\0이 없는 쪽은 strncpy의 결과다.' },
    { q: 'login("OVERFLOW!")에서 넘친 4바이트는 어디에 쓰였나?',
      o: ['바로 뒤 is_admin', 'dst의 앞쪽 칸', '힙 영역'], a: 0,
      why: '9글자 + 널 = 10바이트 가운데 6칸을 넘는 O W ! \\0이 이웃 is_admin을 덮었다. 실측 값은 2,185,039로 0이 아니어서 관리자 분기가 열린다.' },
    { q: 'char buf[5]에 "hello"를 strcpy하면 몇 바이트가 넘치는가?',
      o: ['0바이트', '1바이트', '5바이트'], a: 1,
      why: '글자 5개와 널 1개로 6바이트가 필요한데 칸은 5개다. 널이 buf 밖 한 칸에 쓰이는 off-by-one이다.' },
    { q: 'make_greeting이 -1을 돌려주는 경우는 언제인가?',
      o: ['name이 빈 문자열일 때', 'snprintf가 0을 돌려줄 때', 'snprintf 반환값이 cap 이상이라 잘렸을 때'], a: 2,
      why: 'snprintf는 쓰려 했던 전체 길이를 돌려준다. "Christopher"는 19라 cap 16을 넘으므로 잘렸다고 알린다.' },
  ];

  const summary = [
    'C 문자열은 char 배열 끝에 \\0이 붙은 것이라 strlen과 sizeof가 다르다.',
    'strcpy·gets는 목적지 크기를 모른 채 \\0이 나올 때까지 그대로 쓴다.',
    '6칸 버퍼에 10바이트를 쓰면 넘친 4바이트가 바로 옆 is_admin 값을 바꾼다.',
    '버퍼는 글자 수 + 1로 잡고 snprintf·fgets로 크기를 넘기고 반환값을 확인한다.',
  ];
  const review = [
    { q: '사용자 이름을 strcpy로 char name[16]에 복사하는 코드가 긴 이름에서 엉뚱한 변수를 바꿔 놓았다. 가장 알맞은 수정은?',
      o: ['name을 char name[17]로 한 칸만 늘린다', 'snprintf(name, sizeof(name), "%s", input)으로 바꾸고 반환값을 확인한다', 'strncpy로 바꾸고 끝 처리는 하지 않는다'], a: 1,
      why: '크기를 받는 snprintf는 넘치지 않고 널 종료도 붙인다. strncpy는 잘릴 때 \\0이 없어 마무리를 따로 해야 한다.' },
    { q: 'strncpy로 잘라 복사한 문자열을 printf했더니 뒤에 알 수 없는 글자가 줄줄이 붙어 나온다. 먼저 의심할 것은?',
      o: ['잘린 문자열에 널 종료가 없다', 'printf의 서식 문자열이 틀렸다', '버퍼가 너무 크다'], a: 0,
      why: 'strncpy는 원본이 길면 \\0을 붙이지 않는다. printf가 \\0을 찾아 배열 밖까지 읽어 나가므로 buf[n-1]에 직접 \\0을 넣어야 한다.' },
    { q: '로그 버퍼 line[16]에 "log: "가 들어 있다. strncat으로 덧붙일 때 세 번째 인자로 맞는 값은?',
      o: ['16', '11', '10'], a: 2,
      why: '남은 공간은 16 - 5 = 11칸이고 그중 한 칸은 널 자리다. 그래서 붙일 최대 길이는 16 - 5 - 1 = 10이다.' },
  ];

  R.page({ title: 'char 칸과 널 종료', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
