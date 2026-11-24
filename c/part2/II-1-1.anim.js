/* II-1-1 주소와 역참조 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
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

  // ---------- 1. 주소: 바이트 줄 위에 x, y 가 자리를 잡는다 ----------
  const S1 = { x0: 104, y: 150, w: 47, n: 16, base: 0xa18 };
  const bx = (i) => S1.x0 + i * S1.w;
  function s1(t, c) { const { k, u } = c;
    tx(40, 50, '메모리 (한 칸 = 1바이트)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    sub(920, 50, '주소는 예시 · 실행마다 바뀐다', 1, { 'text-anchor': 'end' });
    bytes(S1.x0, S1.y, S1.n, S1.w, 44, { show: (i) => (k === 0 ? seg(u, 0.2 + i * 0.04, 0.5 + i * 0.04) : 1) });
    for (let i = 0; i < S1.n; i++) { const a = S1.base + i, edge = i % 4 === 0;
      mono(bx(i) + S1.w / 2, S1.y + 64, a.toString(16), { 'text-anchor': 'middle', 'font-size': 13.5, fill: edge ? INK : MUT, 'font-weight': edge ? 700 : 400, opacity: k === 0 ? fade(u, 0.4 + i * 0.04) : 1 }); }
    mono(S1.x0 - 8, S1.y + 64, '…', { 'text-anchor': 'end', 'font-size': 14, fill: MUT });
    // x 블록 (바이트 4..7), y 블록 (8..11)
    const vars = [['x', 4, 42, ACC], ['y', 8, 7, INK]];
    vars.forEach(([nm, i0, v, col], j) => { const g = j === 0 ? (k === 0 ? E(u, 1.0, 1.7) : 1) : k < 1 ? 0 : k === 1 ? E(u, 0.3, 1.0) : 1; if (g <= 0) return;
      const x = bx(i0), w = S1.w * 4 * g, hot = (k === 2 && j === 0) || (k === 5 && j === 0);
      el('rect', { x, y: S1.y, width: w, height: 44, rx: 4, fill: j === 0 ? ACCBG : SOFT, stroke: hot ? ACC : col, 'stroke-width': hot ? 3.5 : 2.5 });
      if (g >= 1) { tx(x + 4, S1.y - 12, nm, { 'font-size': 18, 'font-weight': 800, fill: col });
        tx(x + 24, S1.y - 12, 'int 4B', { 'font-size': 13.5, fill: MUT, class: 'mono' });
        mono(x + S1.w * 2, S1.y + 30, String(v), { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: col, opacity: (j === 0 && k === 0) || (j === 1 && k === 1) ? fade(u, 1.7 - j * 0.6) : 1 }); } });
    // 값 읽기: 42 가 복사되어 printf 로
    if (k === 2) { fly(bx(6), S1.y + 22, 640, 290, seg(u, 0.4, 1.4), '42', { mono: true });
      pill(bx(6), S1.y + 108, '값으로 보기 · x는 42', ACC, pop(u, 0.2), { fs: 14 }); }
    // 주소 꺼내기: &x, &y 가 첫 바이트를 가리킨다
    if (k >= 3) { const a = k === 3 ? E(u, 0.2, 0.9) : 1, b = k === 3 ? E(u, 0.9, 1.6) : 1;
      [[4, '&x', a], [8, '&y', b]].forEach(([i, s, g]) => { if (g <= 0) return; const xx = bx(i) + 2, yy = S1.y + 76;
        el('path', { d: `M${xx},${yy + 30 * g} L${xx},${yy}`, stroke: ACC, 'stroke-width': 2.5, 'marker-end': g > 0.98 ? mk(ACC) : null });
        if (g > 0.98) tx(xx + 8, yy + 30, s, { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono' }); }); }
    if (k === 4) ruler(bx(4), bx(8), S1.y + 136, seg(u, 0.3, 1.3), 'a20 − a1c = 4 = sizeof(int)', ACC);
    if (k === 5) { pill(240, 340, '값 · 42', ACC, pop(u, 0.3), { mono: true, fs: 15 }); pill(240, 384, '주소 · 0x7ffe…a1c', INK, pop(u, 0.7), { mono: true, fs: 15 });
      tx(140, 322, 'x의 두 얼굴', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2), 'text-anchor': 'middle' }); }
    // 터미널: 실제 출력 줄 (주소는 예시)
    const lines = ['$ ./address', 'x = 42', '&x = 0x7ffe…a1c', '&y = 0x7ffe…a20', 'size = 4'];
    const shown = k < 2 ? 1 : k === 2 ? 1 + seg(u, 1.4, 2.0) : k === 3 ? 2 + seg(u, 1.6, 2.6) * 2 : k === 4 ? 4 + seg(u, 1.5, 2.1) : 5;
    terminal(560, 262, 360, 150, lines, shown, { title: 'address.c 실행', lh: 21 }); }

  // ---------- 2. 포인터와 역참조: p 에서 x 로 화살표 ----------
  const X2 = { x: 270, y: 180 }, P2 = { x: 690, y: 180 };
  function s2(t, c) { const { k, u } = c, xv = k >= 3 ? (k === 3 && u < 1.5 ? '42' : '99') : '42';
    const hasP = k >= 1, arrowU = k === 1 ? seg(u, 1.3, 2.1) : k > 1 ? 1 : 0;
    room(X2.x, X2.y, 150, 64, { name: 'x', type: 'int', val: xv, addr: '0x7ffe…a1c', s: k === 0 ? pop(u, 0.2) : 1 + (k === 3 ? R.bump(u, 1.5) : 0),
      stroke: k === 2 && u > 1.0 ? ACC : k === 3 && u > 1.2 ? WARN : INK, fill: k === 3 && u > 1.5 ? WARNBG : PANEL, vcol: k >= 3 && xv === '99' ? WARN : INK });
    room(P2.x, P2.y, 190, 64, { name: 'p', type: 'int *', val: hasP && !(k === 1 && u < 1.0) ? '0x7ffe…a1c' : '(아직 없음)', vfs: hasP ? 17 : 15, vcol: hasP ? ACC : MUT,
      addr: '0x7ffe…a30', dash: hasP ? null : '6 5', stroke: hasP ? ACC : MUT, op: hasP ? 1 : k === 0 ? fade(u, 0.8) * 0.7 : 0.7 });
    if (k === 0) { const s = pop(u, 1.3); pill(X2.x, 300, '&x → 0x7ffe…a1c', INK, s, { mono: true }); }
    if (k === 1) { fly(X2.x, X2.y + 56, P2.x, P2.y, seg(u, 0.2, 1.0), '&x', { mono: true }); }
    arc(P2.x - 95, P2.y - 12, X2.x + 78, X2.y - 12, 90, arrowU, ACC);
    if (hasP && arrowU >= 1) tx((X2.x + P2.x) / 2, 92, 'p가 x를 가리킨다', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 2.1) : 1 });
    if (k === 2) arcDot(P2.x - 95, P2.y - 12, X2.x + 78, X2.y - 12, 90, seg(u, 0.2, 1.0), ACC);
    if (k === 3) { const s = seg(u, 0.2, 1.2); if (s > 0 && s < 1) { const [x, y] = qpt(P2.x - 95, P2.y - 12, X2.x + 78, X2.y - 12, 90, E(s, 0, 1)); card(x, y, 48, 28, { rx: 14, fill: WARN, stroke: 'none', text: '99', fs: 14, color: PANEL, mono: true }); } }
    // 읽은 결과 줄
    const rows = [['&x', '0x7ffe…a1c', 'x의 주소', INK], ['*p', k >= 4 ? '99' : '42', '가리키는 값 읽기', ACC], ['*p = 99;', 'x도 99', '가리키는 칸에 쓰기', WARN], ['*&x', '99', '주소로 갔다가 값으로', INK]];
    const nRow = k === 0 ? 1 : k === 1 ? 1 : k === 2 ? 2 : k === 3 ? 3 : 4;
    rows.slice(0, nRow).forEach(([e, v, m, col], i) => { const y = 300 + i * 30, isNew = (k === 2 && i === 1) || (k === 3 && i === 2) || (k === 4 && i === 3), op = isNew ? fade(u, 1.1) : 1;
      if (k === 0) return;
      mono(560, y, e, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); mono(680, y, v, { 'font-size': 15, 'font-weight': 700, opacity: op }); tx(780, y, m, { 'font-size': 13.5, fill: MUT, opacity: op }); });
    if (k === 2) fly(X2.x, X2.y, 690, 330, seg(u, 0.9, 1.7), '42', { mono: true, stay: false });
    if (k === 4) { // & 와 * 왕복
      const ay = 340, ax = 160; arc(X2.x - 76, X2.y + 4, ax - 40, ay - 16, 40, seg(u, 0.2, 0.9), INK);
      pill(ax, ay, '0x7ffe…a1c', INK, pop(u, 0.8), { mono: true, fs: 13.5 });
      arc(ax + 40, ay - 16, X2.x - 62, X2.y + 34, -20, seg(u, 1.1, 1.8), ACC);
      mono(100, 250, '&', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, 0.5) }); mono(222, 290, '*', { 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) }); }
    if (k === 1) banner(480, 386, 'int *p = &x;  선언의 * 는 "포인터 타입" 표시', pop(u, 2.2));
    if (k === 2) banner(270, 386, '사용의 * 는 "따라가라"', pop(u, 1.8)); }

  // ---------- 3. 포인터 타입: 보폭과 읽는 바이트 수 ----------
  const A3 = { x0: 160, y: 220, w: 40 };
  const ax3 = (i) => A3.x0 + i * 4 * A3.w;   // a[i] 블록 왼쪽
  function arr4(o) { o = o || {};
    bytes(A3.x0, A3.y, 16, A3.w, 46, { show: (i) => o.show ? o.show(i) : 1 });
    [10, 20, 30, 40].forEach((v, i) => { const op = o.vop ? o.vop(i) : 1; if (op <= 0) return; const x = ax3(i), hot = o.hot === i;
      el('rect', { x: x + 2, y: A3.y + 2, width: A3.w * 4 - 4, height: 42, rx: 5, fill: hot ? ACCBG : 'none', stroke: hot ? ACC : INK, 'stroke-width': hot ? 3 : 2, opacity: op });
      mono(x + A3.w * 2, A3.y + 31, String(v), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: hot ? ACC : INK, opacity: op });
      tx(x + 6, A3.y + 70, `a[${i}]`, { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: op });
      mono(x + A3.w * 4 - 6, A3.y + 70, hex(0x100 + i * 4), { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) {
      tx(40, 50, 'int a[4] — 연속 16바이트 (주소는 예시)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      arr4({ show: (i) => (k === 0 ? seg(u, 0.2 + i * 0.03, 0.4 + i * 0.03) : 1), vop: (i) => (k === 0 ? fade(u, 0.7 + i * 0.12) : 1), hot: k === 0 ? 0 : k === 1 ? (u > 1.4 ? 1 : 0) : 1 });
      const at = k === 2 ? lerp(0, 1, E(u, 0.3, 1.3)) : 0, px = 330, py = 100;
      const pv = k === 2 ? (u > 0.8 ? 0x104 : 0x100) : 0x100;
      room(px, py, 150, 50, { name: 'p', type: 'int *', val: hex(pv), vfs: 18, vcol: ACC, stroke: ACC, s: k === 0 ? pop(u, 1.3) : 1 });
      const tgx = ax3(0) + A3.w * 2 + at * A3.w * 4;
      arc(px - 20, py + 26, tgx, A3.y - 4, 10, k === 0 ? seg(u, 1.5, 2.2) : 1, ACC);
      if (k === 1) { const g = seg(u, 0.3, 1.3); arc(ax3(0) + A3.w * 2, A3.y + 50, ax3(1) + A3.w * 2, A3.y + 50, -70, g, INK, { dash: g < 1 ? `${g} 2` : '6 5' });
        if (g >= 1) mono((ax3(0) + ax3(1)) / 2 + A3.w * 2, A3.y + 120, 'p + 1 = +4바이트', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); }
      const chips = k === 0 ? [] : k === 1 ? [['*p', '10'], ['*(p + 1)', '20']] : [['p++', '0x100 → 0x104'], ['*p', '20']];
      chips.forEach(([e, v], i) => { const op = fade(u, 1.5 + i * 0.4); mono(640, 90 + i * 32, e, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: op }); mono(760, 90 + i * 32, v, { 'font-size': 16, 'font-weight': 700, opacity: op }); });
      return; }
    if (k === 3) { // 타입별 보폭
      tx(40, 50, '같은 바이트 줄, 타입마다 다른 보폭', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      [['char *', 1, 'sizeof 1'], ['int *', 4, 'sizeof 4'], ['double *', 8, 'sizeof 8']].forEach(([nm, sz, s], r) => { const y = 100 + r * 108, x0 = 230, w = 34, a = fade(u, 0.2 + r * 0.5);
        mono(40, y + 30, nm, { 'font-size': 17, 'font-weight': 800, fill: r === 1 ? ACC : INK, opacity: a }); tx(40, y + 52, s, { 'font-size': 13.5, fill: MUT, opacity: a });
        bytes(x0, y + 6, 16, w, 36, { show: () => a, fill: (i) => (i < sz ? (r === 1 ? ACCBG : SOFT) : null) });
        const g = seg(u, 0.5 + r * 0.5, 1.2 + r * 0.5); arc(x0 + 4, y, x0 + sz * w + 4, y, 22 + sz * 3, g, r === 1 ? ACC : INK);
        if (g >= 1) mono(x0 + sz * w + 10, y - 4, `p+1 → +${sz}`, { 'font-size': 15, 'font-weight': 800, fill: r === 1 ? ACC : INK }); });
      return; }
    // k4: void*
    tx(40, 50, 'void *v = a; — 주소는 있지만 크기를 모른다', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    arr4({ hot: u > 1.7 ? 0 : -1 });
    room(330, 100, 150, 50, { name: 'v', type: 'void *', val: '0x100', vfs: 18, vcol: INK, stroke: INK });
    arc(310, 126, ax3(0) + A3.w * 2, A3.y - 4, 10, 1, MUT);
    const q = fade(u, 0.3); mono(640, 96, '*v', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: q }); tx(700, 96, '몇 바이트를 읽지? → 컴파일 에러', { 'font-size': 14, fill: BAD, opacity: q });
    if (q > 0.5) cross(615, 90, 8, pop(u, 0.4));
    const g = fade(u, 1.3); mono(640, 134, '*(int *)v', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: g }); tx(750, 134, '4바이트 읽기 → 10', { 'font-size': 14, fill: ACC, opacity: g });
    ruler(ax3(0), ax3(1), A3.y + 100, seg(u, 1.6, 2.3), '(int *)로 바꾸면 4바이트', ACC); }

  // ---------- 4. 위험한 포인터: 주소 공간 지도 ----------
  const MAP = [['int x = 0  (내 변수)', GOOD], ['다른 변수 (남의 데이터)', INK], ['스택의 다른 칸', INK], ['…', MUT]];
  function map4(o) { o = o || {}; const x = 640, w = 280;
    tx(x, 40, '메모리', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    MAP.forEach(([s, col], i) => { const y = 54 + i * 66, hot = o.hot === i;
      el('rect', { x, y, width: w, height: 56, rx: 6, fill: hot ? BADBG : i === 0 ? GOODBG : SOFT, stroke: hot ? BAD : GRID, 'stroke-width': hot ? 3 : 1.5 });
      tx(x + 14, y + 34, s, { 'font-size': 14.5, 'font-weight': 600, fill: hot ? BAD : col }); });
    el('rect', { x, y: 330, width: w, height: 60, rx: 6, fill: o.nullHot ? BADBG : PANEL, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    tx(x + 14, 356, '0번지 근처 · NULL', { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); tx(x + 14, 378, '여기를 읽거나 쓰면 즉시 강제 종료', { 'font-size': 13.5, fill: MUT }); }
  const mapY = (i) => 82 + i * 66;
  function s4(t, c) { const { k, u } = c;
    const garbage = '0x' + (((Math.floor(t * 7) * 2654435761) >>> 0) % 0xfffff).toString(16).padStart(5, '0');   // 미초기화: 값이 정해지지 않음
    const hot = k === 0 && u > 1.6 ? 1 : k === 4 && u > 1.6 ? 2 : -1;
    map4({ hot, nullHot: k === 3 && u < 1.2 });
    if (k <= 1) { const ok = k === 1;
      room(260, 110, 170, 54, { name: 'p', type: 'int *', val: ok ? '&x' : garbage, vfs: 18, vcol: ok ? GOOD : BAD, stroke: ok ? GOOD : BAD, dash: ok ? null : '5 4' });
      if (!ok) { const wob = Math.sin(t * 5) * 30; arc(350, 110, 636, mapY(1) + wob * (1 - seg(u, 1.0, 1.6)), 40, seg(u, 0.3, 1.0), BAD);
        if (u > 1.6) { mono(780, mapY(1) + 50, '*p = 5', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); cross(905, mapY(1) - 10, 9, pop(u, 1.6)); }
        tx(110, 210, 'int *p;  — 선언만 했다', { 'font-size': 15, 'font-weight': 700, fill: BAD }); tx(110, 236, '스택에 남아 있던 값이 그대로 주소가 된다', { 'font-size': 13.5, fill: MUT }); }
      else { arc(350, 110, 636, mapY(0), 30, seg(u, 0.3, 1.1), ACC); check(905, mapY(0) - 10, 9, pop(u, 1.2));
        tx(110, 210, 'int x = 0;  int *p = &x;', { 'font-size': 15, 'font-weight': 700, fill: GOOD, class: 'mono' }); tx(110, 236, '선언과 초기화를 한 줄에 — 빈 구간이 없다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) }); }
      return; }
    if (k <= 3) { room(260, 110, 170, 54, { name: 'q', type: 'int *', val: 'NULL', vfs: 18, vcol: WARN, stroke: WARN, s: k === 2 ? pop(u, 0.2) : 1 });
      arc(350, 120, 636, 356, -40, k === 2 ? seg(u, 0.6, 1.4) : 1, MUT, { dash: '7 6' });
      if (k === 2) { tx(110, 210, 'int *q = NULL;', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: WARN }); tx(110, 236, '"아직 아무것도 안 가리킨다" — 검사할 수 있는 값', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) }); }
      if (k === 3) { // if 가드: 점이 문에서 멈춘다
        const gx = 470; el('rect', { x: gx - 8, y: 200, width: 16, height: 150, rx: 4, fill: GOOD, opacity: pop(u, 0.2) });
        tx(gx, 190, 'if (q != NULL)', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 0.3) });
        const s = seg(u, 0.6, 1.4), dx = lerp(350, gx - 18, E(s, 0, 1)); if (s > 0) el('circle', { cx: dx, cy: lerp(160, 270, E(s, 0, 1)), r: 8, fill: ACC });
        if (u > 1.5) { check(100, 316, 10, pop(u, 1.5)); tx(120, 322, 'NULL이면 *q에 들어가지 않는다', { 'font-size': 14, 'font-weight': 700, fill: GOOD }); }
        tx(110, 400, '가드 없이 *q = 1; 이면 Segmentation fault', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.0) }); }
      return; }
    // k4, k5: scanf 의 &
    const good = k === 5;
    room(300, 250, 150, 54, { name: 'n', type: 'int', val: good && u > 1.3 ? '5' : '???', vfs: 18, vcol: good ? GOOD : MUT, stroke: good ? GOOD : INK, fill: good && u > 1.3 ? GOODBG : PANEL });
    pill(110, 250, 'scanf', INK, 1, { mono: true, fs: 15 });
    mono(110, 120, good ? 'scanf("%d", &n);' : 'scanf("%d", n);', { 'font-size': 17, 'font-weight': 800, fill: good ? GOOD : BAD });
    tx(110, 150, good ? '&n — n이 놓인 자리를 넘긴다' : 'n — 초기화도 안 된 값을 넘긴다', { 'font-size': 14, fill: MUT });
    if (!good) { arc(222, 250, 148, 250, 0, seg(u, 0.2, 0.7), MUT); arc(378, 250, 636, mapY(2), 50, seg(u, 0.8, 1.6), BAD); tx(330, 336, 'n의 값(???)을 주소로 착각해 그곳에 쓴다', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    else { arc(148, 250, 222, 250, 0, seg(u, 0.3, 1.0), ACC); fly(110, 250, 300, 250, seg(u, 1.0, 1.5), '5', { mono: true, fill: GOOD });
      ['초기화', 'NULL 검사', '& 확인'].forEach((s, i) => pill(170 + i * 140, 384, s, GOOD, pop(u, 1.7 + i * 0.25), { fs: 14 }));
      tx(300, 336, '입력 5는 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); } }

  // ---------- 5. swap: 스택 프레임 ----------
  const MAINY = 320, CALLY = 128;
  function frame(y, title, op, col) { zone(60, y - 72, 470, 144, title, { op, stroke: col || GRID, sw: 2, fill: SOFT, color: col || MUT }); }
  function s5(t, c) { const { k, u } = c;
    // main 의 a, b (값은 단계에 따라)
    let a = 3, b = 8; if (k === 4) { if (u > 1.7) a = 8; if (u > 2.5) b = 3; } if (k === 5) { a = 8; b = 3; }
    frame(MAINY, 'main 프레임 (원본)', k === 0 ? fade(u, 0.1) : 1);
    const mA = [190, MAINY + 8], mB = [370, MAINY + 8];
    room(mA[0], mA[1], 110, 54, { name: 'a', type: 'int', val: a, s: k === 0 ? pop(u, 0.4) : 1 + (k === 4 && u > 1.7 && u < 2.4 ? bump(u, 1.7) : 0), stroke: k === 5 ? GOOD : INK, vcol: k >= 4 && a === 8 ? GOOD : INK });
    room(mB[0], mB[1], 110, 54, { name: 'b', type: 'int', val: b, s: k === 0 ? pop(u, 0.6) : 1 + (k === 4 && u > 2.5 ? bump(u, 2.5) : 0), stroke: k === 5 ? GOOD : INK, vcol: k >= 4 && b === 3 ? GOOD : INK });
    // 호출 프레임
    if (k === 1 || k === 2) { const op = k === 1 ? E(u, 0.1, 0.5) : 1 - E(u, 0.2, 0.9), dy = k === 2 ? -40 * E(u, 0.2, 0.9) : -30 * (1 - E(u, 0.1, 0.5));
      if (op > 0.02) { const g = R.G(0, dy, 1, op);
        el('rect', { x: 60, y: CALLY - 72, width: 470, height: 144, rx: 12, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }, g);
        tx(74, CALLY - 50, 'bad_swap 프레임 (복사본)', { 'font-size': 13.5, 'font-weight': 700, fill: WARN }, g);
        const sw = k === 1 ? E(u, 1.6, 2.4) : 1, ax = lerp(190, 370, sw), bx2 = lerp(370, 190, sw), show = k === 1 ? fade(u, 1.2) : 1;
        [[190, 'a'], [370, 'b']].forEach(([x, nm]) => { card(x, CALLY + 8, 110, 54, { rx: 8, stroke: WARN, sw: 2.2, p: g }); tx(x - 55, CALLY - 27, nm, { 'font-size': 16, 'font-weight': 800 }, g); });
        mono(ax, CALLY + 15, '3', { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', opacity: show }, g); mono(bx2, CALLY + 15, '8', { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', opacity: show }, g); }
      if (k === 1) { fly(mA[0], mA[1], 190, CALLY + 8, seg(u, 0.5, 1.2), '3 복사', { mono: true }); fly(mB[0], mB[1], 370, CALLY + 8, seg(u, 0.6, 1.3), '8 복사', { mono: true }); }
      if (k === 2 && u > 1.0) tx(295, MAINY + 90, '프레임이 사라져도 원본은 3, 8 그대로', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k >= 3) { const op = k === 3 ? E(u, 0.1, 0.5) : k === 5 ? 1 - E(u, 0.2, 0.9) : 1;
      if (op > 0.02) { zone(60, CALLY - 72, 470, 144, 'swap 프레임 (주소를 받았다)', { op, stroke: ACC, sw: 2, fill: ACCBG, color: ACC });
        room(150, CALLY + 8, 110, 50, { name: 'pa', type: 'int *', val: '&a', vfs: 17, vcol: ACC, stroke: ACC, op });
        room(300, CALLY + 8, 110, 50, { name: 'pb', type: 'int *', val: '&b', vfs: 17, vcol: ACC, stroke: ACC, op });
        room(450, CALLY + 8, 90, 50, { name: 't', type: 'int', val: k === 4 && u > 0.9 ? '3' : k === 5 ? '3' : '', vfs: 18, op });
        const g = k === 3 ? seg(u, 0.7, 1.5) : 1;
        if (op > 0.5) { arc(150, CALLY + 34, mA[0] - 10, mA[1] - 30, 0, g, ACC); arc(300, CALLY + 34, mB[0] - 10, mB[1] - 30, 0, g, ACC); } }
      if (k === 4) { fly(mA[0], mA[1], 450, CALLY + 8, seg(u, 0.45, 1.0), '3', { mono: true });
        fly(mB[0], mB[1], mA[0], mA[1], seg(u, 1.0, 1.7), '8', { mono: true, fill: GOOD });
        fly(450, CALLY + 8, mB[0], mB[1], seg(u, 1.8, 2.5), '3', { mono: true, fill: GOOD });
        [['t = *pa;', 0.2], ['*pa = *pb;', 1.0], ['*pb = t;', 1.8]].forEach(([s, a], i) => { const on = u > a && u < a + 0.8;
          mono(600, 300 + i * 30, s, { 'font-size': 16, 'font-weight': 800, fill: on ? ACC : u > a ? INK : OFF }); }); } }
    // 터미널: 실제 출력
    const lines = ['$ ./swap', '3 8', '8 3'], shown = k <= 1 ? 1 : k === 2 ? 1 + seg(u, 1.0, 1.6) : k < 5 ? 2 : 2 + seg(u, 1.0, 1.6);
    terminal(580, 120, 340, 130, lines, shown, { title: 'swap.c 실행' });
    if (k === 2) tx(600, 290, 'bad_swap(a, b) 뒤', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
    if (k === 5) { tx(600, 290, 'swap(&a, &b) 뒤', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); banner(750, 360, '주소를 넘겨야 원본이 바뀐다', pop(u, 1.4)); }
    if (k === 0) tx(600, 290, '목표: 함수로 a, b를 맞바꾸기', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.9) }); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'int x = 42; 다음에 &x가 돌려주는 것은 무엇인가?',
      o: ['x에 담긴 값 42', 'x가 놓인 메모리 주소', 'x의 크기 4'], a: 1,
      why: '&는 주소 연산자다. 값 42가 아니라 42가 들어 있는 4바이트 칸의 첫 주소를 준다.' },
    { q: 'int *p = &x; 뒤에 *p = 99;를 실행하면 x는 어떻게 되는가?',
      o: ['99로 바뀐다', '42 그대로다', 'p에 담긴 주소값이 된다'], a: 0,
      why: '*p는 p가 가리키는 칸, 곧 x 자체다. 그 칸에 99를 쓰므로 x가 99가 된다.' },
    { q: 'int *p가 0x100을 가리킬 때 p + 1은 어느 주소인가?',
      o: ['0x101', '0x108', '0x104'], a: 2,
      why: '포인터 산술의 보폭은 가리키는 타입의 크기다. int는 4바이트이므로 0x100에서 4 늘어난 0x104다.' },
    { q: '가리킬 대상이 아직 없을 때 포인터에 넣어 둘 값은 무엇인가?',
      o: ['아무것도 넣지 않는다', 'NULL', '아무 변수의 주소'], a: 1,
      why: 'NULL은 if (p != NULL)로 걸러낼 수 있다. 선언만 한 포인터는 쓰레기 주소를 담고 있어 검사할 방법이 없다.' },
    { q: 'bad_swap(a, b)를 불러도 main의 a, b가 3, 8 그대로인 이유는 무엇인가?',
      o: ['함수가 a, b의 복사본만 받았기 때문이다', '임시 변수 t를 쓰지 않았기 때문이다', 'printf가 옛 값을 기억하기 때문이다'], a: 0,
      why: 'C는 인자를 값으로 복사해 넘긴다. bad_swap 안에서 바꾼 것은 프레임과 함께 사라지는 복사본이다.' },
  ];

  const summary = [
    '변수는 값과 주소를 함께 가진다. &x는 x가 놓인 칸의 주소를 꺼낸다.',
    'int *p = &x는 x의 주소를 p에 담고, *p는 그 주소로 가서 값을 읽거나 쓴다.',
    'int*에서 p + 1은 주소를 4 늘린다. 포인터 타입이 읽을 바이트 수와 보폭을 정한다.',
    '포인터는 선언할 때 초기화하고, 함수가 원본을 바꾸게 하려면 주소를 넘긴다.',
  ];
  const review = [
    { q: '함수 안에서 매개변수를 바꿨는데 main의 변수는 그대로다. 먼저 의심할 것은?',
      o: ['printf 형식 문자열이 틀렸다', '인자를 값으로 넘겨 복사본만 바꿨다', '변수 이름이 main과 겹쳤다'], a: 1,
      why: 'C는 인자를 복사해 넘긴다. 원본을 바꾸려면 swap(&a, &b)처럼 주소를 넘겨 *pa로 써야 한다.' },
    { q: 'double *p가 배열 첫 칸을 가리킬 때 *(p + 1)은 어디를 읽는가?',
      o: ['p보다 1바이트 뒤의 1바이트', 'p보다 4바이트 뒤의 4바이트', 'p보다 8바이트 뒤의 8바이트'], a: 2,
      why: '보폭과 읽는 크기는 모두 가리키는 타입이 정한다. double은 8바이트라 p + 1은 8 뒤로 가서 8바이트를 읽는다.' },
    { q: 'scanf("%d", n);으로 쓴 프로그램이 가끔 엉뚱하게 죽는다. 고칠 곳은?',
      o: ['n 앞에 &를 붙여 주소를 넘긴다', 'n을 long으로 바꾼다', '%d를 %p로 바꾼다'], a: 0,
      why: 'scanf는 값을 써 넣을 자리를 받아야 한다. n만 넘기면 초기화도 안 된 n의 값을 주소로 보고 그곳에 쓴다.' },
  ];

  R.page({ title: '포인터 메모리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
