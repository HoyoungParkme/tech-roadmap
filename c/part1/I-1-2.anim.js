/* I-1-2 타입·크기·정수 오버플로 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 바이트 칸·비트 칸으로 타입을 그린다. 표의 크기·범위는 페이지 STEPS 의 rows · pitfalls 를 읽는다.
 * 출력 값은 zig cc(clang)로 types.c 를 실제로 돌려 확인했다 (long 크기는 x86-64 리눅스/윈도우 대상 각각). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 비트 칸 한 줄: bits 문자열, o.w 칸 폭, o.gap, o.byteGap(8칸마다 띄움), o.style(i, b) → {fill, stroke, color, op, dy}
  function bitRow(x, y, bits, o) { o = o || {}; const w = o.w || 40, h = o.h || w, gap = o.gap ?? 4, bg = o.byteGap ?? 0, fs = o.fs || Math.min(20, w * 0.62);
    const X = (i) => x + i * (w + gap) + Math.floor(i / 8) * bg;
    [...bits].forEach((b, i) => { if (b === ' ') return; const st = (o.style && o.style(i, b)) || {}; const op = st.op ?? 1; if (op <= 0.01) return;
      const one = b === '1';
      el('rect', { x: X(i), y: y + (st.dy || 0), width: w, height: h, rx: 4, fill: st.fill || (one ? ACCBG : PANEL), stroke: st.stroke || (one ? ACC : GRID), 'stroke-width': 1.8, opacity: op });
      if (fs >= 13.5) mono(X(i) + w / 2, y + (st.dy || 0) + h / 2 + fs * 0.36, b, { 'font-size': fs, 'font-weight': 800, 'text-anchor': 'middle', fill: st.color || (one ? ACC : MUT), opacity: op }); });
    return X; }
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const BW = 76;   // 바이트 한 칸 폭 (장면 1)

  // ---------- 1. 크기 ----------
  function byteBox(x, y, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: BW - 6, height: 36, rx: 5, fill: o.fill || ACCBG, stroke: o.stroke || ACC, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    for (let b = 1; b < 8; b++) el('line', { x1: x + b * (BW - 6) / 8, y1: y + 24, x2: x + b * (BW - 6) / 8, y2: y + 36, stroke: o.stroke || ACC, 'stroke-width': 1, opacity: op * 0.6 }); }
  function s1(t, c) { const { k, u } = c, rows = c.beat.rows || [], prevN = c.prev && c.prev.rows ? c.prev.rows.length : 0, X0 = 250;
    // 눈금자: 0~8 바이트
    for (let i = 0; i <= 8; i++) { el('line', { x1: X0 + i * BW, y1: 52, x2: X0 + i * BW, y2: 60, stroke: MUT, 'stroke-width': 1.5 }); mono(X0 + i * BW, 46, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    tx(X0 - 16, 46, '바이트', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 });
    if (k === 0) { card(480, 200, 380, 120, { rx: 12, stroke: INFO, fill: INFOBG, s: pop(u, 0.2) });
      mono(480, 182, '#include <stdint.h>', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.5) });
      pill(410, 228, 'int32_t', INFO, pop(u, 1.0), { mono: true, fill: PANEL }); pill(550, 228, 'uint64_t', INFO, pop(u, 1.3), { mono: true, fill: PANEL });
      sub(480, 320, '아직 잰 타입은 없다. 크기는 sizeof 로 물어본다', fade(u, 1.8), { 'font-size': 15 }); return; }
    rows.forEach((r, i) => { const y = 76 + i * 58, nb = r.bits / 8, isNew = i >= prevN, g = isNew ? E(u, 0.3 + (i - prevN) * 0.5, 1.2 + (i - prevN) * 0.5) : 1, longRow = r.name.startsWith('long*');
      mono(40, y + 20, r.name.replace('*', ''), { 'font-size': 17, 'font-weight': 800, opacity: isNew ? fade(u, 0.2 + (i - prevN) * 0.5) : 1 });
      tx(40, y + 40, r.range, { 'font-size': 13.5, fill: MUT, opacity: isNew ? fade(u, 1 + (i - prevN) * 0.5) : 1 });
      for (let b = 0; b < nb; b++) { if (clamp(g * nb - b) <= 0) continue; const win = longRow && b >= 4;
        const flick = k === 5 && win ? (Math.floor(t * 1.3) % 2 ? 0.2 : 1) : 1;
        byteBox(X0 + b * BW + 3, y + 2, { op: flick, fill: win ? WARNBG : ACCBG, stroke: win ? WARN : ACC, dash: win ? '5 4' : null }); }
      const endX = X0 + nb * BW + 10;
      if (g >= 1 && k < 4) mono(endX, y + 26, `${nb}`, { 'font-size': 15, 'font-weight': 800, fill: longRow ? WARN : ACC });
      if (longRow && k >= 3) { tx(X0 + 4 * BW + 152, y - 4, '64비트 윈도우는 여기까지(4)', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.6) : 1 });
        el('line', { x1: X0 + 4 * BW, y1: y - 2, x2: X0 + 4 * BW, y2: y + 42, stroke: WARN, 'stroke-width': 3, opacity: k === 3 ? fade(u, 1.4) : 1 }); }
      if (k >= 4) pill(endX + 46, y + 20, r.fixed, GOOD, k === 4 ? pop(u, 0.3 + i * 0.25) : 1, { mono: true, fs: 13.5, fill: PANEL }); });
    if (k === 5) { [['64비트 리눅스', 'long = 8', 300], ['64비트 윈도우', 'long = 4', 660]].forEach(([a, b, x], i) => { const s = pop(u, 0.3 + i * 0.4);
        card(x, 384, 300, 44, { rx: 22, stroke: i ? WARN : ACC, fill: PANEL, s }); if (s > 0.5) { tx(x - 130, 390, a, { 'font-size': 15, 'font-weight': 700 }); mono(x + 130, 390, b, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: i ? WARN : ACC }); } }); }
  }

  // ---------- 2. 2의 보수 ----------
  const PV = [128, 64, 32, 16, 8, 4, 2, 1];
  function byteView(signedMsb, u, k) { const x = 180, w = 64, gap = 8, X = bitRow(x, 64, '11111111', { w, gap, fs: 26 });
    PV.forEach((v, i) => { const neg = signedMsb && i === 0, val = neg ? -128 : v, op = k === 0 ? fade(u, 0.3 + i * 0.12) : 1;
      mono(X(i) + w / 2, 160, String(val), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: neg ? BAD : MUT, opacity: op });
      if (neg) tx(X(0) + w / 2, 186, '부호 비트', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 }); });
    return X; }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { const signed = k >= 1, X = byteView(signed, u, k);
      tx(100, 104, '0xFF', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono' });
      const uSum = k === 0 ? Math.round(255 * E(u, 1.2, 2.2)) : 255;
      const row = (y, name, val, col, op) => { tx(180, y, name, { 'font-size': 16, 'font-weight': 700, opacity: op }); mono(410, y, '= ' + val, { 'font-size': 26, 'font-weight': 800, fill: col, opacity: op }); };
      row(250, 'unsigned char 로 읽으면', String(uSum), ACC, k === 0 ? fade(u, 1.1) : 1);
      if (signed) { const sv = k === 1 ? Math.round(lerp(255, -1, E(u, 0.8, 2.0))) : -1; row(310, 'signed char 로 읽으면', k === 1 && u < 0.8 ? '?' : String(k === 1 ? (E(u, 0.8, 2.0) >= 1 ? -1 : '-128 + 127') : -1), BAD, k === 1 ? fade(u, 0.4) : 1); }
      if (k === 1) sub(480, 372, '비트는 하나도 안 바뀌었다. 맨 앞 칸의 자릿값만 -128 이 됐다', fade(u, 2.1), { 'font-size': 15, fill: INK });
      if (k === 2) { terminal(590, 216, 330, 110, ['$ ./types', 'u=255  s=-1'], 1 + E(u, 0.3, 1.0), {});
        pill(660, 360, '%u → 255', ACC, pop(u, 1.2), { mono: true, fill: PANEL }); pill(840, 360, '%d → -1', BAD, pop(u, 1.5), { mono: true, fill: PANEL }); }
      return; }
    // k ≥ 3: unsigned int z (32비트)
    const zx = 60, zw = 22, zg = 3, flip = k === 3 ? 0 : k === 4 ? E(u, 0.3, 1.9) : 1, bits = [...Array(32)].map((_, i) => (k >= 4 && 31 - i < flip * 32.5 ? '1' : '0')).join('');
    tx(zx, 46, 'unsigned int z (32비트)', { 'font-size': 15, 'font-weight': 700 });
    bitRow(zx, 62, bits, { w: zw, h: 34, gap: zg, byteGap: 10, fs: 14 });
    if (k === 3) { mono(480, 150, 'z = 0', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      sub(480, 186, '모든 비트가 0, 이보다 작은 unsigned 값은 없다', fade(u, 1), { 'font-size': 15 });
      el('line', { x1: 120, y1: 270, x2: 840, y2: 270, stroke: MUT, 'stroke-width': 2 }); el('circle', { cx: 120, cy: 270, r: 8, fill: ACC, opacity: fade(u, 1.4) });
      mono(120, 300, '0', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800 }); mono(840, 300, '4294967295', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT });
      tx(120, 246, '바닥', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { const bx = zx + (31 - Math.min(31, Math.floor(flip * 32))) * (zw + zg) + Math.floor((31 - Math.min(31, Math.floor(flip * 32))) / 8) * 10;
      if (flip < 1) mono(bx + zw / 2, 124, '빌림', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 });
      mono(480, 170, 'z - 1 = ' + (flip >= 1 ? '4294967295' : '…'), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: flip >= 1 ? BAD : INK });
      el('line', { x1: 120, y1: 270, x2: 840, y2: 270, stroke: MUT, 'stroke-width': 2 }); mono(120, 300, '0', { 'font-size': 15, 'text-anchor': 'middle' }); mono(840, 300, 'UINT_MAX', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 800 });
      const a = E(u, 0.6, 2.0); el('path', { d: `M120,262 C120,200 840,200 840,262`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': `${a * 800} 2000` });
      el('circle', { cx: a >= 1 ? 840 : 120, cy: 270, r: 8, fill: BAD });
      sub(480, 360, '0 아래로 가지 못하고 반대쪽 끝으로 넘어간다', fade(u, 2.1), { 'font-size': 15, fill: INK }); return; }
    if (k === 5) { // size_t 감소 루프
      mono(480, 150, 'for (size_t i = 2; i >= 0; i--)', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
      const vals = ['2', '1', '0', '18446744073709551615'], n = Math.min(4, Math.floor(E(u, 0.2, 2.0) * 4.2));
      vals.forEach((v, i) => { if (i >= n) return; const x = [120, 220, 320, 600][i]; card(x, 236, i === 3 ? 330 : 70, 46, { rx: 8, text: v, fs: 17, mono: true, fw: 800, stroke: i === 3 ? BAD : ACC, color: i === 3 ? BAD : INK, s: pop(u, 0.2 + i * 0.45) });
        if (i < 3) check(x, 282, 8, 1); });
      if (n >= 4) { check(600, 282, 8, 1); tx(600, 316, 'i >= 0 은 언제나 참, 끝나지 않는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); }
      pill(480, 380, '해결: while (i-- > 0) 또는 signed 인덱스', GOOD, pop(u, 2.3), { fill: PANEL, fs: 14 });
      sub(480, 186, 'size_t 는 64비트 unsigned (x86-64 기준)', fade(u, 0.5), { 'font-size': 14 }); return; }
    terminal(160, 140, 640, 150, ['$ ./types', 'u=255  s=-1', '0u - 1 = 4294967295', 'UINT_MAX = 4294967295'], 1 + E(u, 0.2, 1.8) * 3, { lh: 26, fs: 16 });
    if (u > 2) { el('rect', { x: 254, y: 218, width: 134, height: 52, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); tx(321, 330, '두 값이 같다', { 'font-size': 15, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle' }); }
  }

  // ---------- 3. 오버플로 ----------
  function dial(cx, cy, r, val, o) { o = o || {}; el('circle', { cx, cy, r, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
    for (let v = 0; v < 256; v += 8) { const a = -Math.PI / 2 + (v / 256) * 2 * Math.PI; el('line', { x1: cx + Math.cos(a) * (r - 8), y1: cy + Math.sin(a) * (r - 8), x2: cx + Math.cos(a) * r, y2: cy + Math.sin(a) * r, stroke: MUT, 'stroke-width': 1.5 }); }
    [[0, '0'], [64, '64'], [128, '128'], [192, '192']].forEach(([v, s]) => { const a = -Math.PI / 2 + (v / 256) * 2 * Math.PI; mono(cx + Math.cos(a) * (r - 26), cy + Math.sin(a) * (r - 26) + 5, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
    const a = -Math.PI / 2 + (val / 256) * 2 * Math.PI; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * (r - 14), y2: cy + Math.sin(a) * (r - 14), stroke: o.col || ACC, 'stroke-width': 4, 'stroke-linecap': 'round' });
    el('circle', { cx, cy, r: 6, fill: o.col || ACC }); const shown = ((Math.round(val) % 256) + 256) % 256;
    mono(cx, cy + r + 30, 'uint8_t u = ' + shown, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: o.col || ACC }); }
  function s3(t, c) { const { k, u } = c;
    const dv = k === 0 ? lerp(254, 256, E(u, 0.3, 2.0)) : 256; dial(190, 190, 120, dv, { col: k === 0 && dv > 255.5 ? GOOD : ACC });
    if (k === 0) { mono(420, 150, '255 + 1 = 0', { 'font-size': 26, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) }); tx(420, 190, '2⁸ = 256 으로 나눈 나머지', { 'font-size': 16, fill: MUT, opacity: fade(u, 2.2) });
      tx(420, 230, '표준이 정한 동작. 해시·순환 버퍼에 일부러 쓴다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) }); return; }
    // 오른쪽: int 의 수직선과 벼랑
    const L = 400, Rr = 840, y = 90;
    if (k <= 2) { el('line', { x1: L, y1: y, x2: Rr, y2: y, stroke: INK, 'stroke-width': 3 }); el('path', { d: `M${Rr},${y} L${Rr},${y + 60} L${Rr + 60},${y + 60}`, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
      mono(L, y + 26, '0', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(Rr, y - 14, 'INT_MAX', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INK });
      mono(Rr - 10, y + 26, '2147483647', { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
      const px = k === 1 ? lerp(L + 200, Rr, E(u, 0.2, 1.4)) : Rr; el('circle', { cx: px, cy: y, r: 9, fill: ACC });
      mono(Rr + 30, y + 50, '+1 ?', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.6) : 1 });
      if (k === 1) tx(620, 196, '여기서 1 을 더하면 표준이 결과를 정하지 않는다 (UB)', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 2) { mono(420, 210, 'if (s + 1 < s) { … }', { 'font-size': 19, 'font-weight': 800, fill: INK });
      const cut = E(u, 0.6, 1.4); el('line', { x1: 412, y1: 203, x2: 412 + 250 * cut, y2: 203, stroke: BAD, 'stroke-width': 3 });
      tx(420, 246, '컴파일러: s + 1 < s 는 일어날 수 없다 → 통째로 삭제', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
      tx(420, 300, '실제 CPU 에서는 보통 이렇게 넘어가지만, 표준은 약속하지 않는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      mono(420, 334, '0x7FFFFFFF → 0x80000000', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) });
      tx(420, 370, '같은 코드가 -O0 과 -O2 에서 다르게 움직일 수 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k >= 3) { // a > INT_MAX - b 를 막대로
      const X = (v) => 420 + (v / 2147483647) * 420, rowsY = [70, 130, 190];
      el('line', { x1: X(2147483647), y1: 50, x2: X(2147483647), y2: 230, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }); mono(X(2147483647), 44, 'INT_MAX', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 800 });
      const g = k === 3 ? E(u, 0.2, 1.2) : 1;
      [['a', 2000000000, ACC], ['b', 2000000000, ACC], ['INT_MAX - b', 147483647, WARN]].forEach(([n, v, col], i) => { const gi = k === 3 ? E(u, 0.2 + i * 0.4, 1.0 + i * 0.4) : 1;
        mono(410, rowsY[i] + 16, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: gi > 0 ? 1 : 0 });
        el('rect', { x: 420, y: rowsY[i], width: Math.max(2, (X(v) - 420) * gi), height: 24, rx: 4, fill: col, opacity: 0.85 });
        mono(i === 2 ? X(v) + 8 : 430, rowsY[i] + 18, fmt(v), { 'font-size': 14, 'font-weight': 800, fill: i === 2 ? WARN : PANEL, opacity: fade(u, k === 3 ? 0.9 + i * 0.4 : 0) }); });
      const ok = k === 3 ? fade(u, 2.1) : 1; mono(420, 270, 'a > INT_MAX - b  →  참', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: ok });
      tx(420, 300, '더하기 전에 뺄셈으로 비교해서 넘치지 않는다', { 'font-size': 14.5, fill: MUT, opacity: ok }); g; }
    if (k === 4) { card(640, 370, 300, 48, { rx: 10, text: 'overflow! 더하지 않는다', fs: 16, stroke: WARN, color: WARN, sw: 2.5, s: pop(u, 0.4) });
      mono(420, 345, 'a + b', { 'font-size': 18, 'font-weight': 800, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.0) }); }
    if (k === 5) terminal(400, 320, 520, 92, ['255 + 1 = 0', 'overflow! 더하지 않는다'], 1 + E(u, 0.2, 1.2), { lh: 24 });
  }

  // ---------- 4. 형변환 ----------
  const B300 = '00000000000000000000000100101100';
  function s4(t, c) { const { k, u } = c, x0 = 70, w = 20, g = 2, bg = 10;
    if (k <= 3) { const fall = k === 1 ? E(u, 0.4, 1.6) : k > 1 ? 1 : 0;
      tx(x0, 44, 'int big = 300', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      const X = bitRow(x0, 58, B300, { w, h: 32, gap: g, byteGap: bg, fs: 14, style: (i) => (i < 24 ? { op: 1 - fall * 0.85, dy: fall * 60, stroke: k === 0 ? GRID : MUT } : { stroke: ACC, fill: k === 0 && u > 1 ? ACCBG : null }) });
      if (k === 0) { el('rect', { x: X(24) - 4, y: 52, width: X(31) + w - X(24) + 8, height: 44, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
        tx(X(28), 120, '하위 8비트', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); sub(480, 170, 'char 에는 1바이트만 들어간다', fade(u, 1.8), { 'font-size': 15, fill: INK }); }
      if (k >= 1) { if (k === 1) tx(X(11), 170, '상위 24비트는 버려진다', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
        mono(X(31) + w + 14, 80, k === 1 && u < 1.8 ? '= ?' : '= 44', { 'font-size': 20, 'font-weight': 800, fill: ACC });
        if (k === 1) tx(X(28), 124, '32 + 8 + 4 = 44', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
      const ext = (y, label, fillBit, col, valTxt, kk) => { const gr = k === kk ? E(u, 0.6, 2.0) : 1; tx(x0, y - 12, label, { 'font-size': 15, 'font-weight': 700, class: 'mono' });
        const bits = [...Array(32)].map((_, i) => (i >= 24 ? '1' : 24 - i <= gr * 24.5 ? fillBit : ' ')).join('');
        bitRow(x0, y, bits, { w, h: 32, gap: g, byteGap: bg, fs: 14, style: (i) => (i < 24 ? { fill: col === BAD ? BADBG : INFOBG, stroke: col, color: col } : {}) });
        if (gr >= 1) mono(X(31) + w + 14, y + 22, valTxt, { 'font-size': 18, 'font-weight': 800, fill: col }); };
      if (k >= 2) ext(240, 'signed char sc = -1 → (int)', '1', BAD, '= -1', 2);
      if (k === 2) tx(480, 296, '부호 비트(1)를 위쪽으로 복사한다: 부호 확장', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      if (k >= 3) ext(340, 'unsigned char uc = 255 → (int)', '0', INFO, '= 255', 3);
      if (k === 3) tx(480, 400, '같은 0xFF 인데 0 으로 채운다: 제로 확장', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    // k ≥ 4: int a = -1, unsigned b = 1
    const conv = k === 5 ? E(u, 0.3, 1.3) : k > 5 ? 1 : 0;
    tx(x0, 44, conv > 0.5 ? '(unsigned) a' : 'int a', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: conv > 0.5 ? BAD : INK });
    bitRow(x0, 58, '1'.repeat(32), { w, h: 32, gap: g, byteGap: bg, fs: 14 });
    mono(935, 80, conv > 0.5 ? '4294967295' : '-1', { 'font-size': 18, 'font-weight': 800, fill: conv > 0.5 ? BAD : INK, 'text-anchor': 'end' });
    tx(x0, 124, 'unsigned b', { 'font-size': 15, 'font-weight': 700, class: 'mono' }); bitRow(x0, 138, '0'.repeat(31) + '1', { w, h: 32, gap: g, byteGap: bg, fs: 14 });
    mono(935, 160, '1', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end' });
    if (k === 4) { sub(480, 240, '비트만 보면 둘 다 평범하다. -1 < 1 은 당연해 보인다', fade(u, 0.8), { 'font-size': 15, fill: INK }); return; }
    // 수직선 위 두 점
    const L = 120, Rr = 840, ly = 270; el('line', { x1: L, y1: ly, x2: Rr, y2: ly, stroke: MUT, 'stroke-width': 2 });
    mono(L, ly + 26, '0', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); mono(Rr, ly + 26, 'UINT_MAX', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    el('circle', { cx: L + 3, cy: ly, r: 8, fill: INK }); mono(L + 3, ly - 16, 'b', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    const ax = lerp(L - 40, Rr, conv); el('circle', { cx: ax, cy: ly, r: 9, fill: BAD }); mono(ax, ly - 16, 'a', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
    if (k === 5) { mono(480, 350, 'a < b  →  거짓', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(480, 390, '섞이면 signed 쪽이 unsigned 로 바뀐다. -Wsign-compare 가 잡아 준다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    terminal(200, 318, 560, 96, ['(char)300 = 44', '(int)sc=-1  (int)uc=255', 'a >= b  ?!'], 1 + E(u, 0.2, 1.6) * 2, { lh: 22 });
  }

  // ---------- 5. 실수 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { const P = c.beat.pitfalls || [];
      tx(480, 42, '타입 함정 다섯 가지와 처방', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      P.forEach((p, i) => { const y = 84 + i * 66, s = pop(u, 0.2 + i * 0.3);
        card(270, y, 400, 52, { rx: 10, stroke: BAD, fill: BADBG, s }); card(720, y, 360, 52, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 0.4 + i * 0.3) });
        if (s > 0.5) tx(270, y + 5, p.bug, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD });
        if (pop(u, 0.4 + i * 0.3) > 0.5) tx(720, y + 5, p.fix, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD });
        grow(472, y, 536, y, E(u, 0.5 + i * 0.3, 0.8 + i * 0.3), MUT); }); return; }
    if (k === 3) { // 100000 * 100000
      const X = (v) => 120 + (v / 1e10) * 720; el('line', { x1: X(2147483647), y1: 70, x2: X(2147483647), y2: 300, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
      mono(X(2147483647), 62, 'INT_MAX ≈ 21억', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      const g1 = E(u, 0.3, 1.2), g2 = E(u, 1.3, 2.3);
      tx(120, 110, '100000 * 100000   (int 끼리)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      el('rect', { x: 120, y: 124, width: (X(2147483647) - 120) * g1, height: 30, rx: 4, fill: BAD, opacity: 0.85 });
      if (g1 >= 1) { cross(X(2147483647) + 24, 139, 11, 1); tx(X(2147483647) + 46, 145, 'int 에 안 들어간다, 넘친다 (UB)', { 'font-size': 15, 'font-weight': 700, fill: BAD }); }
      tx(120, 220, '100000LL * 100000LL   (long long)', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.2) });
      el('rect', { x: 120, y: 234, width: Math.max(1, (X(1e10) - 120) * g2), height: 30, rx: 4, fill: GOOD, opacity: 0.85 });
      if (g2 >= 1) mono(X(1e10), 290, '10000000000', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' });
      sub(480, 360, '결과를 담는 변수가 아니라 피연산자 타입이 계산을 정한다', fade(u, 2.4), { 'font-size': 15, fill: INK }); return; }
    // k 0~2: 0.3 근처를 확대한 수직선
    const vals = [['0.1', '0.1000000000000000055511…'], ['0.2', '0.2000000000000000111022…'], ['0.1 + 0.2', '0.3000000000000000444089…'], ['0.3', '0.2999999999999999888977…']];
    vals.forEach(([a, b], i) => { const op = k === 0 ? fade(u, 0.2 + i * 0.35) : 1, hot = i >= 2;
      mono(260, 50 + i * 32, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: hot ? (i === 2 ? BAD : INFO) : INK, opacity: op });
      mono(280, 50 + i * 32, '→ ' + b, { 'font-size': 16, fill: hot ? (i === 2 ? BAD : INFO) : MUT, opacity: op }); });
    tx(700, 50, '실제로 저장되는 double 값', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.3) : 1 });
    const ly = 250, cx = 480, sc = 720 / 2e-16, P = (v) => cx + (v - 0.3) * sc, a = 0.30000000000000004441, b = 0.2999999999999999889;
    if (k === 2) { const g2 = E(u, 0.3, 1.2); el('rect', { x: 120 - 20 * (1 - g2), y: ly - 50, width: 720 + 40 * (1 - g2), height: 100, fill: GOODBG, opacity: g2 });
      tx(480, ly - 60, '|차이| < 1e-9 인 띠, 이 그림 폭(2e-16)보다 훨씬 넓다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    el('line', { x1: 120, y1: ly, x2: 840, y2: ly, stroke: MUT, 'stroke-width': 2 });
    [-1e-16, 0, 1e-16].forEach((d) => { el('line', { x1: P(0.3 + d), y1: ly - 6, x2: P(0.3 + d), y2: ly + 6, stroke: MUT }); });
    mono(P(0.3 - 1e-16), ly + 30, '0.3 - 1e-16', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(P(0.3 + 1e-16), ly + 30, '0.3 + 1e-16', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    const s0 = k === 0 ? pop(u, 1.6) : 1; el('circle', { cx: P(b), cy: ly, r: 9 * s0, fill: INFO }); el('circle', { cx: P(a), cy: ly, r: 9 * s0, fill: BAD });
    mono(P(b), ly - 20, '0.3', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: s0 }); mono(P(a), ly - 20, '0.1 + 0.2', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: s0 });
    if (k >= 1) { const gap = k === 1 ? E(u, 0.3, 1.0) : 1; el('line', { x1: P(b), y1: ly + 48, x2: lerp(P(b), P(a), gap), y2: ly + 48, stroke: WARN, 'stroke-width': 3 });
      mono((P(a) + P(b)) / 2, ly + 72, '차이 5.55e-17', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: gap }); }
    if (k === 1) { mono(480, 380, 'a + b == 0.3   →   거짓', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
    if (k === 2) { mono(480, 380, 'fabs((a + b) - 0.3) < 1e-9   →   참', { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
  }

  const quiz = [
    { q: '같은 코드가 64비트 리눅스에서는 8, 64비트 윈도우에서는 4를 찍는 sizeof는 무엇인가?',
      o: ['sizeof(int)', 'sizeof(long)', 'sizeof(long long)'], a: 1,
      why: 'long만 플랫폼(ABI)마다 다르다. 크기가 규약인 자리에는 int32_t·int64_t처럼 이름에 비트 수가 박힌 타입을 쓴다.' },
    { q: '비트 11111111을 signed char로 읽으면 왜 -1 인가?',
      o: ['맨 앞 비트의 자릿값이 -128이라 -128 + 127 = -1이 된다', '부호 비트를 지우고 나머지를 읽는다', '255에서 256을 두 번 뺀다'], a: 0,
      why: '2의 보수에서는 맨 앞 칸만 음수 자릿값(-128)을 가진다. 나머지 일곱 칸의 합 127과 더하면 -1이다.' },
    { q: 'int s = INT_MAX; 다음에 쓴 if (s + 1 < s) 검사가 최적화 뒤 사라졌다. 이유는 무엇인가?',
      o: ['컴파일러 버그다', 'unsigned처럼 0으로 돌아가기 때문이다', 'signed 오버플로는 UB라 컴파일러가 그 조건을 항상 거짓으로 본다'], a: 2,
      why: '표준은 signed 오버플로가 일어나지 않는다고 가정하게 한다. 검사는 a > INT_MAX - b처럼 더하기 전에 해야 한다.' },
    { q: 'int a = -1; unsigned b = 1; 일 때 a < b가 거짓이 되는 이유는 무엇인가?',
      o: ['-1이 0으로 잘린다', 'a가 unsigned로 바뀌어 4294967295가 된다', 'b가 signed로 바뀌어 -1이 된다'], a: 1,
      why: 'signed와 unsigned가 한 식에 섞이면 signed 쪽이 unsigned로 변환된다. 모든 비트가 1인 -1은 UINT_MAX가 된다.' },
    { q: '0.1 + 0.2와 0.3을 비교하는 올바른 방법은 무엇인가?',
      o: ['a + b == 0.3', '(int)(a + b) == (int)0.3', 'fabs((a + b) - 0.3) < 1e-9'], a: 2,
      why: '두 값은 저장되는 순간부터 약 5.55e-17 만큼 다르다. 허용 오차를 두고 비교해야 의도한 판정이 나온다.' },
  ];

  const summary = [
    'int와 long의 바이트 수는 플랫폼이 정해서 long은 리눅스 8, 윈도우 4로 갈린다.',
    '같은 비트 11111111도 unsigned면 255, signed면 -1로 읽히고 0u - 1은 UINT_MAX가 된다.',
    'unsigned 넘침은 한 바퀴 돌아 0이 되지만 signed 넘침은 UB라서 검사는 더하기 전에 한다.',
    '섞인 비교에서 -1은 4294967295로 바뀌고, 실수는 == 대신 허용 오차를 두고 비교한다.',
  ];
  const review = [
    { q: '파일 헤더의 길이 칸을 long으로 읽었더니 리눅스에서 만든 파일이 윈도우에서 깨진다. 먼저 바꿀 것은?',
      o: ['길이 칸 타입을 int64_t 같은 고정폭 타입으로', 'printf 형식을 %d로', '컴파일러 최적화 단계를'], a: 0,
      why: 'long은 리눅스 8바이트, 윈도우 4바이트라 읽는 폭이 달라진다. 크기가 곧 규약인 자리에는 stdint.h의 고정폭 타입을 쓴다.' },
    { q: 'for (size_t i = n - 1; i >= 0; i--)가 끝나지 않는다. 두 장면의 내용을 엮은 설명으로 맞는 것은?',
      o: ['size_t가 signed라 음수에서 멈추지 못한다', 'size_t는 unsigned라 0에서 1을 빼면 최댓값이 되어 i >= 0이 늘 참이다', 'i-- 가 UB라 컴파일러가 조건을 지웠다'], a: 1,
      why: 'unsigned는 0 아래가 없어 한 바퀴 돌아 거대한 수가 된다. while (i-- > 0) 꼴로 바꾸거나 signed 인덱스를 쓴다.' },
    { q: '두 int를 더하기 전에 넘침을 막으려 한다. UB를 건드리지 않는 검사는?',
      o: ['if (a + b < a)', 'if ((long)(a + b) > INT_MAX)', 'if (a > INT_MAX - b)'], a: 2,
      why: '앞의 두 검사는 이미 a + b를 계산해 UB가 난 뒤다. INT_MAX - b는 넘치지 않으므로 b가 양수일 때 안전하게 미리 판정한다.' },
  ];

  R.page({ title: '비트와 타입', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
