/* II-2-2 흔한 포인터 버그 — 댕글링·NULL — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tween, card, mono, sub, lbl, pill, banner, fly, dot, zone, terminal, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG } = C;

  // ---------- 지역 도우미 ----------
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  // 휘는 화살표 (u 만큼 자란다). bend > 0 이면 위로 휜다
  function arc(x1, y1, x2, y2, bend, u, col, o) { o = o || {}; if (u <= 0) return;
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - bend;
    el('path', { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.6, pathLength: 1,
      'stroke-dasharray': o.dash || `${clamp(u)} 2`, 'marker-end': u > 0.98 && !o.plain ? mk(col) : null, opacity: o.op ?? 1, 'stroke-linecap': 'round' }); }
  const qpt = (x1, y1, x2, y2, bend, s) => { const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - bend, a = 1 - s; return [a * a * x1 + 2 * a * s * cx + s * s * x2, a * a * y1 + 2 * a * s * cy + s * s * y2]; };
  function arcDot(x1, y1, x2, y2, bend, s, col, r) { if (s <= 0 || s >= 1) return; const [x, y] = qpt(x1, y1, x2, y2, bend, E(s, 0, 1)); el('circle', { cx: x, cy: y, r: r || 7, fill: col || ACC }); }
  // 메모리 칸 하나: 이름(위) · 값(안) · 주소(아래)
  function room(cx, cy, w, h, o) { o = o || {};
    card(cx, cy, w, h, { rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, sw: o.sw || 2.2, dash: o.dash, s: o.s, op: o.op });
    if (o.val != null) mono(cx, cy + 7, String(o.val), { 'text-anchor': 'middle', 'font-size': o.vfs || 20, 'font-weight': 700, fill: o.vcol || INK, opacity: (o.op ?? 1) * (o.vop ?? 1) });
    if (o.name) tx(cx - w / 2, cy - h / 2 - 10, o.name, { 'font-size': 16, 'font-weight': 800, fill: o.ncol || INK, opacity: o.op ?? 1 });
    if (o.type) tx(cx + w / 2, cy - h / 2 - 10, o.type, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', class: 'mono', opacity: o.op ?? 1 });
    if (o.addr) mono(cx, cy + h / 2 + 20, o.addr, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.acol || MUT, opacity: o.op ?? 1 }); }
  // 바이트 칸 한 줄 (연속)
  function bytes(x, y, n, w, h, o) { o = o || {};
    for (let i = 0; i < n; i++) { const a = o.show ? o.show(i) : 1; if (a <= 0) continue;
      el('rect', { x: x + i * w, y, width: w, height: h, fill: (o.fill && o.fill(i)) || PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: a }); } }
  // 대괄호 자 (재기)
  function ruler(x1, x2, y, u, text, col) { if (u <= 0) return; const xe = lerp(x1, x2, E(u, 0, 1));
    el('path', { d: `M${x1},${y - 8} V${y} H${xe}` + (u >= 1 ? ` V${y - 8}` : ''), fill: 'none', stroke: col || INK, 'stroke-width': 2 });
    if (u >= 1 && text) mono((x1 + x2) / 2, y + 20, text, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK }); }
  const hex = (n) => '0x' + n.toString(16);

  // 힙 블록: 가운데 기준. o.state = 'live' | 'freed' | 'other' | 'bad'
  function hblock(cx, cy, w, h, text, o) { o = o || {}; const st = o.state || 'live';
    const col = st === 'freed' ? MUT : st === 'bad' ? BAD : st === 'other' ? WARN : o.col || INK;
    card(cx, cy, w, h, { rx: 8, stroke: col, fill: st === 'freed' ? PANEL : st === 'bad' ? BADBG : st === 'other' ? WARNBG : o.fill || PANEL, sw: 2.4, dash: st === 'freed' ? '7 6' : null, s: o.s, op: o.op });
    if (text != null) mono(cx, cy + 7, text, { 'text-anchor': 'middle', 'font-size': o.fs || 20, 'font-weight': 800, fill: col, opacity: o.op ?? 1 });
    if (o.label) tx(cx, cy + h / 2 + 20, o.label, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
  // 문(가드): 세로 막대 + 이름
  function gate(x, y1, y2, s, col, g, below) { if (g <= 0) return; el('rect', { x: x - 7, y: y1, width: 14, height: (y2 - y1) * g, rx: 4, fill: col || GOOD });
    if (g >= 1) mono(x, below ? y2 + 22 : y1 - 10, s, { 'font-size': 14.5, 'font-weight': 800, fill: col || GOOD, 'text-anchor': 'middle' }); }
  const garbage = (t) => '0x' + (((Math.floor(t * 7) * 2654435761) >>> 0) % 0xfffff).toString(16).padStart(5, '0');
  function areas(o) { o = o || {}; zone(30, 40, 290, 360, '스택', { stroke: GRID, sw: 2, op: o.op }); zone(350, 40, 580, 360, '힙', { stroke: GRID, sw: 2, fill: PANEL, op: o.op }); }

  // ---------- 1. 댕글링 포인터 ----------
  function s1(t, c) { const { k, u } = c, P = [175, 200], B = [600, 200];
    areas();
    const good = k >= 4;
    if (!good) {
      const freed = k >= 1 && !(k === 1 && u < 0.8), other = k === 3;
      room(P[0], P[1], 150, 56, { name: 'p', type: 'int *', val: '0x1000', vfs: 18, vcol: freed ? BAD : ACC, stroke: freed ? BAD : ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      const val = k === 0 ? (u > 1.4 ? '42' : '') : k === 1 ? '42' : k === 2 ? '?' : (u > 1.8 ? '7' : '다른 값');
      hblock(B[0], B[1], 190, 70, val, { state: k === 3 ? (u > 1.8 ? 'bad' : 'other') : freed ? 'freed' : 'live', s: k === 0 ? pop(u, 0.5) : 1, fs: val.length > 3 ? 17 : 20,
        label: k === 0 ? '0x1000 (예시) · 4바이트' : k === 1 ? '반납됨 · 할당자 것' : k === 2 ? '반납된 자리' : u > 1.8 ? '남의 데이터 훼손' : '다른 malloc이 가져감' });
      arc(P[0] + 76, P[1] - 10, B[0] - 96, B[1] - 10, 40, k === 0 ? seg(u, 0.9, 1.5) : 1, freed ? BAD : ACC, { dash: freed ? '8 6' : null });
      if (k === 1) { tx(P[0], 300, 'free(p);', { 'font-size': 17, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle' });
        tx(P[0], 330, 'p의 값은 그대로다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
      if (k === 2) { arcDot(P[0] + 76, P[1] - 10, B[0] - 96, B[1] - 10, 40, seg(u, 0.2, 1.0), BAD);
        mono(P[0], 300, 'printf("%d", *p);', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
        tx(640, 310, '옛 값 42가 남아 있으면 그대로 찍힌다', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
        tx(640, 340, '이번 실행(zig cc, Windows)에서는 316176이 찍혔다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
      if (k === 3) { room(P[0], 320, 150, 56, { name: 'q', type: '다른 코드', val: '0x1000', vfs: 18, vcol: WARN, stroke: WARN, s: pop(u, 0.2) });
        arc(P[0] + 76, 320, B[0] - 96, B[1] + 20, -30, seg(u, 0.4, 1.0), MUT);
        const s = seg(u, 1.1, 1.8); if (s > 0 && s < 1) { const [x, y] = qpt(P[0] + 76, P[1] - 10, B[0] - 96, B[1] - 10, 40, E(s, 0, 1)); card(x, y, 70, 28, { rx: 14, fill: BAD, stroke: 'none', text: '*p = 7', fs: 13.5, color: PANEL, mono: true }); } }
      return; }
    // k4~k6: 방어판
    const nulled = k >= 5 && !(k === 5 && u < 1.2);
    room(P[0], P[1], 150, 56, { name: 'p', type: 'int *', val: nulled ? 'NULL' : '0x1000', vfs: 18, vcol: nulled ? WARN : ACC, stroke: nulled ? WARN : ACC, s: k === 4 ? pop(u, 0.2) : 1 + (k === 5 ? bump(u, 1.2) : 0) });
    const freed = k >= 5 && !(k === 5 && u < 0.5);
    hblock(B[0], B[1], 190, 70, freed ? '' : k === 4 && u < 1.6 ? '' : '42', { state: freed ? 'freed' : 'live', col: GOOD, fill: GOODBG, label: freed ? '반납됨' : '할당 성공을 확인한 블록' });
    if (!nulled) arc(P[0] + 76, P[1] - 10, B[0] - 96, B[1] - 10, 40, k === 4 ? seg(u, 1.0, 1.5) : k === 5 ? 1 - E(u, 0.6, 1.2) : 1, ACC);
    if (k === 4) { gate(420, 120, 280, 'if (!p) return;', GOOD, E(u, 0.3, 0.9)); tx(P[0], 300, 'malloc이 NULL이면 여기서 멈춘다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 5) { mono(P[0], 300, 'free(p);', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) }); mono(P[0], 330, 'p = NULL;', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(640, 330, '옛 주소가 사라져 댕글링 상태가 없어진다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 6) { gate(420, 120, 280, 'if (p)', GOOD, 1); const s = seg(u, 0.3, 1.0); if (s > 0) el('circle', { cx: lerp(P[0] + 80, 404, E(s, 0, 1)), cy: P[1], r: 8, fill: ACC });
      if (u > 1.1) { check(480, 200, 11, pop(u, 1.1)); tx(640, 330, 'p가 NULL이라 *p = 7은 건너뛴다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); } } }

  // ---------- 2. 미초기화 포인터와 NULL 역참조 ----------
  const MAP = [['스택의 다른 변수', 0], ['힙 블록', 1], ['코드', 2]];
  function map2(o) { o = o || {}; const x = 600, w = 320;
    tx(x, 40, '메모리', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    MAP.forEach(([s], i) => { const y = 54 + i * 76, hot = o.hot === i, ok = o.ok === i;
      el('rect', { x, y, width: w, height: 64, rx: 6, fill: hot ? BADBG : ok ? GOODBG : SOFT, stroke: hot ? BAD : ok ? GOOD : GRID, 'stroke-width': hot || ok ? 3 : 1.5 });
      tx(x + 14, y + 38, s, { 'font-size': 15, 'font-weight': 700, fill: hot ? BAD : ok ? GOOD : INK }); });
    el('rect', { x, y: 290, width: w, height: 90, rx: 6, fill: o.nullHot ? BADBG : PANEL, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    tx(x + 14, 322, '0번지 근처 · NULL', { 'font-size': 15, 'font-weight': 700, fill: BAD }); tx(x + 14, 348, '접근하면 Segmentation fault', { 'font-size': 14, fill: MUT }); }
  const mY = (i) => 86 + i * 76;
  function s2(t, c) { const { k, u } = c, P = [200, 130];
    map2({ hot: k === 1 && u > 1.4 ? 0 : -1, nullHot: k === 2 && u > 1.4, ok: k >= 3 && k !== 4 ? 1 : k === 4 && u > 1.0 ? 1 : -1 });
    if (k <= 1) { room(P[0], P[1], 170, 56, { name: 'p', type: 'int *', val: garbage(t), vfs: 18, vcol: BAD, stroke: BAD, dash: '5 4', s: k === 0 ? pop(u, 0.2) : 1 });
      mono(60, 230, k === 0 ? 'int *p;' : '*p = 10;', { 'font-size': 18, 'font-weight': 800, fill: BAD });
      tx(60, 262, k === 0 ? 'C는 지역 변수를 0으로 채우지 않는다' : '어디를 덮어쓸지 아무도 모른다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
      if (k === 1) { const wob = Math.sin(t * 5) * 26 * (1 - seg(u, 0.8, 1.4)); arc(P[0] + 86, P[1], 596, mY(0) + wob, 30, seg(u, 0.2, 0.8), BAD);
        if (u > 1.4) cross(900, mY(0) - 14, 9, pop(u, 1.4));
        tx(60, 330, '-Wall을 켜면 컴파일러가 이 줄을 경고한다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 2) { room(P[0], P[1], 170, 56, { name: 'buf', type: 'int *', val: 'NULL', vfs: 18, vcol: WARN, stroke: WARN, s: pop(u, 0.2) });
      mono(60, 230, 'buf = malloc(n * sizeof(int));', { 'font-size': 15, 'font-weight': 800 }); tx(60, 256, '메모리가 모자라면 NULL이 돌아온다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      mono(60, 300, 'buf[0] = 1;', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) }); arc(P[0] + 86, P[1] + 10, 596, 320, -30, seg(u, 0.9, 1.4), BAD);
      tx(60, 330, '검사 없이 쓰면 그 자리에서 강제 종료', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); return; }
    // k3~k5: 방어
    const got = !(k === 3 && u < 1.2);
    room(P[0], P[1], 170, 56, { name: 'buf', type: 'int *', val: got ? '●' : 'NULL', vfs: got ? 20 : 18, vcol: got ? GOOD : WARN, stroke: got ? GOOD : WARN });
    if (got && k !== 4) arc(P[0] + 86, P[1], 596, mY(1), 30, k === 3 ? seg(u, 1.2, 1.8) : 1, ACC);
    if (k === 3) { mono(60, 230, 'int *buf = NULL;', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); mono(60, 258, 'buf = malloc(n * sizeof(int));', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0) });
      tx(60, 300, '처음부터 "아직 없음"을 값으로 말해 둔다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 4) { gate(330, 100, 170, 'if (buf == NULL)', GOOD, E(u, 0.2, 0.7), true);
      arc(340, 150, 520, 280, -30, seg(u, 0.8, 1.4), WARN); mono(440, 316, 'return NULL;', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      arc(340, 112, 596, mY(1), 20, seg(u, 1.0, 1.6), ACC); tx(60, 230, '실패하면 더 가지 않고', { 'font-size': 14.5, opacity: fade(u, 1.4) }); tx(60, 256, 'NULL을 호출자에게 그대로 올린다', { 'font-size': 14.5, opacity: fade(u, 1.6) }); }
    if (k === 5) { for (let i = 0; i < 4; i++) { const g = seg(u, 0.2 + i * 0.2, 0.4 + i * 0.2); el('rect', { x: 760 + i * 40, y: mY(1) - 18, width: 36, height: 36, rx: 4, fill: g > 0 ? GOODBG : PANEL, stroke: GOOD, 'stroke-width': 1.5 });
        if (g > 0) mono(778 + i * 40, mY(1) + 6, '0', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: g }); }
      sub(840, mY(1) + 46, 'n = 4 예시', 1);
      card(200, 300, 220, 56, { rx: 10, stroke: ACC, fill: ACCBG, text: '호출자', fs: 16, color: ACC, s: pop(u, 1.2) });
      arc(P[0], P[1] + 30, 200, 270, 0, seg(u, 1.4, 1.9), ACC); tx(200, 356, '이제 해제 책임은 호출자에게', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); } }

  // ---------- 3. 이중 free: 할당자의 free list ----------
  function freeList(items, y, o) { o = o || {}; tx(380, y - 46, '할당자의 free list (빈 블록 줄)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    let x = 400; items.forEach((it, i) => { const [s, col] = it; card(x + 40, y, 80, 44, { rx: 6, stroke: col || MUT, fill: col === BAD ? BADBG : PANEL, sw: 2.2, text: s, fs: 15, mono: true, color: col || MUT, s: o.popLast && i === 0 ? o.popLast : 1 });
      arc(x + 82, y, x + 118, y, 0, 1, col === BAD ? BAD : MUT); x += 120; }); mono(x + 4, y + 6, 'NULL', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
  function s3(t, c) { const { k, u } = c, S = [175, 150], BL = [620, 140];
    if (k <= 3) areas(); else zone(350, 40, 580, 360, '힙', { stroke: GRID, sw: 2, fill: PANEL });
    if (k <= 3) { const nulled = k >= 2 && !(k === 2 && u < 1.3);
      room(S[0], S[1], 150, 56, { name: 's', type: 'char *', val: nulled ? 'NULL' : '●', vfs: nulled ? 18 : 20, vcol: nulled ? WARN : ACC, stroke: nulled ? WARN : ACC });
      const inList = k === 0 ? u > 1.5 : k === 1 || k === 3 || (k === 2 && u > 0.6);
      if (!inList || k === 1) hblock(BL[0], BL[1], 150, 56, '32B', { state: k === 1 ? 'bad' : 'live', s: k === 0 ? pop(u, 0.2) : 1, label: k === 1 ? '같은 블록을 또 반납' : 'malloc(32)' });
      if (!nulled && !(k === 0 && u > 1.5) && k !== 3) arc(S[0] + 76, S[1], BL[0] - 76, BL[1], 20, k === 0 ? seg(u, 0.4, 0.9) : 1, k === 1 ? BAD : ACC, { dash: inList ? '8 6' : null });
      const items = k === 1 ? (u > 1.2 ? [['s', BAD], ['s', BAD], ['…']] : [['s'], ['…']]) : inList ? [['s'], ['…']] : [['…']];
      freeList(items, 330, { popLast: (k === 0 && u > 1.5) || (k === 2 && u > 0.6) ? pop(u, k === 0 ? 1.5 : 0.6) : 1 });
      if (k === 0) mono(S[0], 240, u > 1.2 ? 'free(s); ①' : 's = malloc(32);', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      if (k === 1) { mono(S[0], 240, 'free(s); ②', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); if (u > 1.2) cross(840, 288, 9, pop(u, 1.2));
        tx(S[0], 270, '이번 실행: 프로그램이', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); tx(S[0], 292, '강제 종료됐다 (Windows)', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
      if (k === 2) { mono(S[0], 240, 'free(s);', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); mono(S[0], 270, 's = NULL;', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
      if (k === 3) { mono(S[0], 240, 'free(s);  /* s == NULL */', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' });
        arc(S[0] + 76, S[1], 560, 140, 20, seg(u, 0.3, 0.9), MUT, { dash: '6 6' }); pill(640, 140, '아무 일도 없다 · no-op', GOOD, pop(u, 1.0), { fs: 15 });
        check(840, 288, 10, pop(u, 1.6)); tx(S[0], 274, '표준이 보장한다', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
      return; }
    // k4, k5: 소유권
    zone(40, 60, 270, 120, 'caller — 만든 쪽', { stroke: ACC, sw: 2, fill: ACCBG, color: ACC });
    zone(40, 210, 270, 110, 'use(s) — 빌린 쪽', { stroke: GRID, sw: 2, fill: PANEL, op: k === 5 ? 1 - E(u, 0.1, 0.6) * 0.6 : 1 });
    const freed = k === 5 && u > 1.0;
    room(175, 140, 130, 48, { name: 's', type: 'char *', val: freed && u > 1.6 ? 'NULL' : '●', vfs: 18, vcol: freed && u > 1.6 ? WARN : ACC, stroke: ACC });
    room(175, 284, 130, 48, { name: 's', type: '빌림', val: '●', vfs: 18, vcol: MUT, stroke: MUT, dash: '6 5', op: k === 5 ? 1 - E(u, 0.1, 0.6) * 0.6 : 1 });
    hblock(BL[0], 200, 150, 56, freed ? '' : '32B', { state: freed ? 'freed' : 'live', label: freed ? 'caller가 한 번만 반납' : '주인: caller' });
    if (!(freed && u > 1.6)) arc(241, 140, BL[0] - 76, 196, 20, 1, ACC);
    if (k === 4 || (k === 5 && u < 0.6)) arc(241, 284, BL[0] - 76, 210, -20, k === 4 ? seg(u, 0.4, 1.0) : 1, MUT, { dash: '7 6' });
    if (k === 4) { tx(175, 366, '사용만 하고 free는 하지 않는다', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 5) { mono(640, 330, 'free(s);  s = NULL;', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(640, 362, '해제하는 곳이 하나뿐이라 이중 free가 생길 자리가 없다', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }

  // ---------- 4. 버퍼 오버런 · 얕은 복사 ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { const N = 4, W = 90, x0 = 150, y = 150;
      zone(110, 80, 740, 170, '힙 (n = 4 예시)', { stroke: GRID, sw: 2, fill: PANEL });
      for (let i = 0; i < N; i++) { el('rect', { x: x0 + i * W, y, width: W - 6, height: 56, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: k === 0 ? pop(u, 0.2 + i * 0.15) : 1 });
        mono(x0 + i * W + 42, y + 78, `buf[${i}]`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.4 + i * 0.15) : 1 }); }
      const hit = k === 1 && u > 1.9;
      el('rect', { x: x0 + N * W + 10, y, width: 190, height: 56, rx: 6, fill: hit ? BADBG : SOFT, stroke: hit ? BAD : GRID, 'stroke-width': hit ? 3 : 1.5 });
      tx(x0 + N * W + 105, y + 34, '다음 블록 머리', { 'font-size': 15, 'font-weight': 700, fill: hit ? BAD : MUT, 'text-anchor': 'middle' });
      mono(x0 + N * W + 105, y + 78, 'buf[4] 자리', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle' });
      ruler(x0, x0 + N * W - 6, y - 16, 1, '', GOOD); if (k === 0) tx(x0 + 2 * W, 118, '0 … n-1', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 1.0) });
      if (k >= 1) { const stop = k === 1 ? 4 : 3, s = seg(u, 0.2, 1.9), i = Math.min(stop, Math.floor(s * (stop + 1)));
        for (let j = 0; j <= Math.min(i, 3); j++) if (s > 0) mono(x0 + j * W + 42, y + 36, String(j), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
        if (s > 0 && i === 4) mono(x0 + N * W + 105, y - 8, 'buf[4] = 4', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
        mono(110, 300, k === 1 ? 'for (int i = 0; i <= n; i++)' : 'for (int i = 0; i < n; i++)', { 'font-size': 17, 'font-weight': 800, fill: k === 1 ? BAD : GOOD });
        if (k === 1) { tx(110, 332, '이번 실행에서는 아무 증상 없이 지나갔다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); tx(110, 358, '증상은 나중에, 엉뚱한 곳에서 나타난다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); }
        if (k === 2) { if (u > 2.0) check(x0 + 3 * W + 42, y - 32, 10, pop(u, 2.0)); mono(110, 332, 'if (!buf) return;', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.4) }); } }
      return; }
    // k3~k5: 얕은 복사 vs 깊은 복사 (문자열 "kim" 은 예시)
    areas();
    const deep = k >= 4, copied = k === 5 ? seg(u, 0.3, 1.6) : 0;
    room(175, 130, 160, 52, { name: 'a.name', type: 'char *', val: '●', vcol: ACC, stroke: ACC });
    room(175, 270, 160, 52, { name: 'b.name', type: 'char *', val: '●', vcol: deep ? GOOD : WARN, stroke: deep ? GOOD : WARN, s: k === 3 ? pop(u, 0.4) : 1 });
    const strCells = (x, y, chars, col, g) => chars.forEach((ch, i) => { const a = g == null ? 1 : clamp(g * chars.length - i); el('rect', { x: x + i * 50, y: y - 24, width: 46, height: 48, rx: 5, fill: ch === '\\0' && a > 0 ? WARNBG : PANEL, stroke: col, 'stroke-width': 2 });
      if (a > 0) mono(x + i * 50 + 23, y + 7, ch, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ch === '\\0' ? WARN : col, opacity: a }); });
    strCells(560, 130, ['k', 'i', 'm', '\\0'], ACC); tx(560, 96, '"kim" (예시 이름)', { 'font-size': 14, fill: MUT });
    arc(256, 130, 556, 130, 20, 1, ACC);
    if (!deep) { arc(256, 270, 556, 140, -30, seg(u, 0.6, 1.3), BAD);
      tx(640, 250, '두 구조체가 한 블록을 공유', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(640, 280, '둘 다 free 하면 이중 free', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); tx(640, 306, '한쪽만 free 하면 다른 쪽이 댕글링', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      mono(560, 370, 'User shallow(User a) { return a; }', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) }); return; }
    strCells(560, 290, ['k', 'i', 'm', '\\0'], GOOD, k === 4 ? 0 : copied);
    if (k === 4) { ruler(560, 756, 340, seg(u, 0.4, 1.2), 'strlen 3 + 1 = 4칸', GOOD); mono(560, 236, 'malloc(strlen(a.name) + 1)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
      if (u > 1.2) tx(760, 290 - 36, '+1은 널 자리', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); }
    if (k === 5) mono(560, 236, 'strcpy(b.name, a.name);', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    arc(256, 270, 556, 290, 10, k === 4 ? seg(u, 1.4, 2.0) : 1, ACC);
    if (k === 5) tx(175, 370, 'a, b가 각자 자기 블록만 free', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }

  // ---------- 5. 방어 습관과 도구 ----------
  const RULES = [['선언 즉시 초기화 (= NULL)', 'Step 2'], ['malloc 반환값 NULL 검사', 'Step 2'], ['free 직후 포인터 = NULL', 'Step 1 · 3'], ['해제 책임은 한 곳으로', 'Step 3'], ['경계 검사 (0 … n-1)', 'Step 4'], ['포인터 가진 구조체는 깊은 복사', 'Step 4']];
  function s5(t, c) { const { k, u } = c;
    const lines = [['$ gcc -g -fsanitize=address dangling.c -o app'], ['$ ./app'], ['==ERROR: AddressSanitizer: heap-use-after-free', C.BAD], ['  READ of size 4 … freed by thread T0 here:', C.BAD],
      ['$ gcc -g dangling.c -o app'], ['$ valgrind --leak-check=full ./app'], ['Invalid read of size 4', C.WARN], ['Invalid write of size 4', C.WARN], ['definitely lost: 32 bytes in 1 blocks', C.WARN]];
    const shown = [2 * seg(u, 0.2, 1.4), 2 + 2 * seg(u, 0.2, 1.2), 4 + 2 * seg(u, 0.2, 1.2), 6 + 3 * seg(u, 0.2, 1.6), 9, 9][k];
    const wide = k <= 3, tw0 = wide ? 880 : 500;
    terminal(40, 40, tw0, wide ? 260 : 360, lines.map((l) => (l[1] ? [l[0], l[1]] : l[0])), shown, { title: '출력은 Linux에서 흔한 예시', lh: 25, fs: wide ? 15 : 14 });
    if (k === 1) tx(60, 340, '문제 종류, 읽은 줄, free 한 줄까지 함께 알려 준다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
    if (k === 2) tx(60, 340, '다시 빌드하지 않고 실행 파일을 감싸서 돌린다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
    if (k === 3) [['Invalid read', 'use-after-free (Step 1)'], ['Invalid write', '버퍼 오버런 (Step 4)'], ['definitely lost', '메모리 누수']].forEach(([a, b], i) => { const op = fade(u, 1.0 + i * 0.4);
      mono(60 + i * 300, 336, a, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: op }); tx(60 + i * 300, 362, b, { 'font-size': 14.5, opacity: op }); });
    if (k >= 4) { tx(570, 52, '코드 리뷰 체크리스트', { 'font-size': 15, 'font-weight': 800 });
      RULES.forEach(([r, st], i) => { const on = i < 3 || k === 5, g = (k === 4 && i < 3) || (k === 5 && i >= 3) ? pop(u, 0.2 + (i % 3) * 0.35) : on ? 1 : 0; if (g <= 0) return;
        const y = 92 + i * 52; card(745, y, 350, 44, { rx: 8, stroke: GOOD, fill: GOODBG, sw: 1.8, s: g });
        if (g > 0.5) { el('circle', { cx: 590, cy: y, r: 11, fill: GOOD }); mono(590, y + 5, String(i + 1), { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
          tx(610, y + 5, r, { 'font-size': 14.5, 'font-weight': 700 }); mono(910, y + 5, st, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } });
      if (k === 5) tx(745, 410, '개발·CI에서 ASan · valgrind를 켠다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); } }

  const quiz = [
    { q: 'free(p) 바로 뒤 p에 들어 있는 값은 무엇인가?',
      o: ['NULL로 바뀐다', '반납한 블록의 옛 주소 그대로다', '0x0으로 지워진다'], a: 1,
      why: 'free는 블록만 할당자에게 돌려주고 포인터 변수는 건드리지 않는다. 그래서 p = NULL;을 직접 붙여야 한다.' },
    { q: 'malloc 반환값을 검사하지 않고 buf[0] = 1;을 쓰면 어떤 때 죽는가?',
      o: ['할당이 실패해 buf가 NULL일 때', 'n이 짝수일 때', 'buf를 free하기 전에'], a: 0,
      why: 'malloc은 실패하면 NULL을 준다. 그 상태로 buf[0]에 쓰면 0번지 근처 접근이라 Segmentation fault가 난다.' },
    { q: 'free(s); s = NULL; 뒤에 실수로 free(s)를 한 번 더 부르면 어떻게 되는가?',
      o: ['free list가 깨져 프로그램이 죽는다', '컴파일 에러가 난다', '아무 일도 일어나지 않는다'], a: 2,
      why: 'free(NULL)은 표준이 아무 일도 하지 않는다고 정해 두었다. 그래서 free 뒤 NULL은 이중 free까지 막아 준다.' },
    { q: 'char *name을 가진 구조체를 b = a;로 복사하면 무엇이 문제인가?',
      o: ['name 문자열이 두 번 복사돼 메모리가 낭비된다', '두 구조체가 같은 힙 블록을 가리키게 된다', 'b.name이 NULL이 된다'], a: 1,
      why: '얕은 복사는 주소만 복사한다. 둘 다 free하면 이중 free, 한쪽만 free하면 다른 쪽이 댕글링이 된다.' },
    { q: '이미 빌드한 실행 파일을 다시 컴파일하지 않고 누수까지 검사하려면 무엇을 쓰는가?',
      o: ['valgrind --leak-check=full', '-fsanitize=address', 'gcc -Wall'], a: 0,
      why: 'valgrind는 실행을 감싸서 돌리므로 재빌드가 필요 없고 definitely lost로 누수를 알려 준다. ASan은 다시 컴파일해야 한다.' },
  ];

  const summary = [
    'free는 블록만 돌려주고 포인터 값은 그대로 둔다. 그 포인터로 읽고 쓰면 정의되지 않은 동작이다.',
    '포인터는 NULL로 초기화하고, malloc 결과는 쓰기 전에 NULL인지 검사한다.',
    'free 뒤 p = NULL로 두면 두 번째 free가 무해해진다. 해제하는 곳은 하나로 정한다.',
    '버퍼 반복은 i < n까지만 돌고, 포인터를 가진 구조체는 깊은 복사한다.',
  ];
  const review = [
    { q: '테스트에서는 잘 돌던 코드가 배포 뒤 가끔 엉뚱한 값을 낸다. free 다음 줄에서 같은 포인터를 읽고 있었다. 먼저 할 일은?',
      o: ['그 포인터를 읽는 printf를 지운다', 'free 바로 뒤에 p = NULL을 넣고 ASan으로 다시 돌려 본다', 'malloc 크기를 두 배로 늘린다'], a: 1,
      why: '반납한 블록을 읽는 use-after-free다. 옛 값이 남아 있으면 증상이 숨는데, NULL로 바꾸고 ASan을 켜면 읽은 줄과 free한 줄이 함께 나온다.' },
    { q: 'User를 함수 인자로 값 복사한 뒤 두 함수가 각자 free(u.name)을 불렀더니 abort가 났다. 원인은?',
      o: ['얕은 복사로 같은 블록을 두 번 반납했다', 'name에 널 문자가 없었다', 'malloc이 NULL을 돌려줬다'], a: 0,
      why: '구조체 복사는 name 주소만 복사하므로 두 쪽이 같은 블록을 가리킨다. 깊은 복사하거나 해제 책임을 한쪽에만 둔다.' },
    { q: 'valgrind가 Invalid write of size 4를 보고했다. 가장 먼저 볼 코드는?',
      o: ['free 뒤 NULL을 넣었는지', '반복문 조건이 i <= n인지', 'printf 형식 문자열'], a: 1,
      why: 'Invalid write는 내 것이 아닌 자리에 쓴 것이다. n칸 버퍼에 i <= n으로 돌면 buf[n]에 4바이트 int를 써서 이 보고가 나온다.' },
  ];

  R.page({ title: '힙과 포인터 버그', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
