/* II-1-2 포인터 연산·배열과의 관계 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
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

  // 배열 칸: a[0..n-1] (값·주소·이름표). o.hot(i) → 색, o.show(i) → 0..1
  const VALS = [10, 20, 30, 40, 50];
  function array(x0, y, w, o) { o = o || {}; const n = o.n || 5, vals = o.vals || VALS, h = o.h || 54;
    for (let i = 0; i < n; i++) { const a = o.show ? o.show(i) : 1; if (a <= 0) continue; const st = (o.hot && o.hot(i)) || {}, cx = x0 + i * w + w / 2;
      card(cx, y + h / 2, w - 6, h, { rx: 6, stroke: st.stroke || INK, fill: st.fill || PANEL, sw: st.sw || 2.2, s: o.drop ? 1 : a, op: o.drop ? a : 1, dash: st.dash });
      if (vals[i] != null) mono(cx, y + h / 2 + 7, String(vals[i]), { 'text-anchor': 'middle', 'font-size': o.vfs || 20, 'font-weight': 800, fill: st.color || INK, opacity: a });
      if (o.names !== false) mono(cx, y - 10, (o.nm || 'a') + `[${i}]`, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: a });
      if (o.addr !== false) mono(cx, y + h + 20, hex((o.base || 0x1000) + i * (o.size || 4)), { 'text-anchor': 'middle', 'font-size': 13.5, fill: st.acol || MUT, 'font-weight': st.acol ? 700 : 400, opacity: a }); } }
  // 위에서 칸을 가리키는 깃발 (이름 + 아래 화살표)
  function pin(cx, ytop, s, col, g) { if (g <= 0) return; const y1 = ytop - 64;
    pill(cx, y1, s, col, g, { mono: true, fs: 14.5 });
    if (g > 0.6) el('line', { x1: cx, y1: y1 + 14, x2: cx, y2: ytop - 26, stroke: col, 'stroke-width': 2.5, 'marker-end': mk(col) }); }
  // 칸 아래에서 건너뛰는 호
  function hop(xa, xb, y, u, col, label) { arc(xa, y, xb, y, -Math.min(70, 18 + Math.abs(xb - xa) * 0.18), u, col || ACC);
    if (u >= 1 && label) mono((xa + xb) / 2, y + Math.min(70, 18 + Math.abs(xb - xa) * 0.18) / 2 + 22, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col || ACC }); }

  // ---------- 1. 포인터 산술 ----------
  const A = { x0: 140, y: 150, w: 92 }, cxA = (i) => A.x0 + i * A.w + A.w / 2;
  function s1(t, c) { const { k, u } = c;
    tx(40, 44, 'int a[5] — 4바이트씩 빈틈없이 (주소 0x1000은 가정)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const tgt = [0, 1, 2, 3, 3][k];
    array(A.x0, A.y, A.w, { show: (i) => (k === 0 ? pop(u, 0.2 + i * 0.15) : 1), hot: (i) => (i === tgt && k > 0 ? { stroke: ACC, fill: ACCBG, color: ACC, acol: ACC } : k === 4 && i === 0 ? { stroke: ACC } : null) });
    pin(cxA(0), A.y, 'p', ACC, k === 0 ? pop(u, 1.2) : 1);
    if (k === 1) { hop(cxA(0), cxA(1), A.y + 84, seg(u, 0.3, 1.1), ACC, '+1칸 = +4바이트'); pin(cxA(1), A.y, 'p+1', INK, pop(u, 1.2)); }
    if (k === 2) { hop(cxA(0), cxA(2), A.y + 84, seg(u, 0.3, 1.1), ACC, '+2칸 = +8바이트'); pin(cxA(2), A.y, 'p+2', INK, pop(u, 1.1));
      fly(cxA(2), A.y + 27, 330, 372, seg(u, 1.5, 2.2), '30', { mono: true, stay: true }); }
    if (k >= 3) { pin(cxA(3), A.y, 'q', INK, k === 3 ? pop(u, 0.2) : 1);
      ruler(cxA(0), cxA(3), A.y + 108, k === 3 ? seg(u, 0.5, 1.4) : 1, '주소 차 12바이트 ÷ 4 = 요소 3개', ACC); }
    if (k === 4) { // 다른 배열 b 와 비교
      tx(640, 300, '다른 배열 b', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      array(640, 314, 54, { n: 3, vals: [7, 8, 9], names: false, addr: false, h: 40, vfs: 16, show: () => fade(u, 0.8), drop: true });
      check(100, 368, 10, pop(u, 0.3)); mono(124, 374, 'p < q', { 'font-size': 16, 'font-weight': 800, fill: GOOD });
      tx(200, 374, '같은 배열 안 · 참', { 'font-size': 14, fill: MUT });
      cross(440, 368, 9, pop(u, 1.4)); mono(462, 374, 'p < b', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      tx(530, 374, '정의되지 않음', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.4) }); return; }
    // 오른쪽 아래 실행 결과 (주소 줄은 예시)
    const rows = [['p', '0x1000'], ['p + 1', '0x1004'], ['p + 2', '0x1008'], ['*(p + 2)', '30'], ['q - p', '3']];
    const nr = [1, 2, 4, 5][k] || 5;
    rows.slice(0, nr).forEach(([e, v], i) => { const isNew = i >= ([0, 1, 2, 4][k]); const op = isNew ? fade(u, 1.3 + (i - [0, 1, 2, 4][k]) * 0.4) : 1; const y = 304 + i * 24;
      mono(640, y, e, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: op }); mono(760, y, v, { 'font-size': 15, 'font-weight': 700, opacity: op }); });
    if (k === 2) tx(170, 378, '*(p + 2)로 읽으면', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); }

  // ---------- 2. 배열 붕괴: a[i] 는 *(a + i) ----------
  function s2(t, c) { const { k, u } = c;
    tx(40, 44, 'int a[5] = {10, 20, 30, 40, 50};', { 'font-size': 15, 'font-weight': 700, fill: MUT, class: 'mono' });
    const pick = k === 3 ? 0 : k === 4 ? -1 : 2;
    array(A.x0, A.y, A.w, { hot: (i) => (i === pick ? { stroke: ACC, fill: ACCBG, color: ACC } : null) });
    // 배열 이름 a: k3 에서 주소로 바뀐다
    if (k === 1) { pin(cxA(0), A.y, 'a → &a[0]', ACC, pop(u, 0.2)); hop(cxA(0), cxA(2), A.y + 84, seg(u, 0.8, 1.6), ACC, '+ 2'); }
    if (k === 3) { const g = E(u, 0.3, 1.1); pill(lerp(80, cxA(0), g), lerp(A.y + 27, A.y - 64, g), g < 0.5 ? 'a' : '0x1000', ACC, 1, { mono: true, fs: 15 });
      if (g >= 1) el('line', { x1: cxA(0), y1: A.y - 50, x2: cxA(0), y2: A.y - 26, stroke: ACC, 'stroke-width': 2.5, 'marker-end': mk(ACC) });
      mono(640, 330, 'a == &a[0]', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) }); mono(800, 330, '→ 1', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.6) });
      tx(640, 360, '식 안의 배열 이름은 첫 원소 주소로 붕괴한다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { pin(cxA(0), A.y, 'p = a', ACC, 1); const s = seg(u, 0.2, 2.4), i = Math.min(4, Math.floor(s * 5));
      if (s > 0) el('circle', { cx: cxA(i), cy: A.y + 84, r: 8, fill: ACC });
      terminal(560, 296, 370, 104, ['$ ./array_decay', '30', '30', '30', '30', '1', VALS.slice(0, s > 0 ? i + 1 : 0).join(' ')], 7, { title: 'p[i]로 순회', lh: 20 });
      tx(140, 330, 'p[i] == *(p + i) == a[i]', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.4) }); return; }
    if (k === 3) return;
    // 같은 뜻의 네 가지 표기 (차례로)
    const forms = [['a[2]', INK], ['*(a + 2)', ACC], ['*(2 + a)', INK], ['2[a]', WARN]], nf = k === 0 ? 1 : k === 1 ? 2 : 4;
    forms.slice(0, nf).forEach(([s, col], i) => { const x = 120 + i * 190, isNew = (k === 0 && i === 0) || (k === 1 && i === 1) || (k === 2 && i >= 2);
      const g = isNew ? pop(u, k === 1 ? 1.4 : 0.3 + (i - 2 >= 0 ? (i - 2) * 0.5 : 0)) : 1; pill(x + 70, 330, s, col, g, { mono: true, fs: 17 });
      if (i > 0 && g > 0.5) mono(x - 8, 336, '≡', { 'font-size': 20, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle' }); });
    mono(870, 336, '→ 30', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.9) : 1 });
    if (k === 2) { cross(778, 296, 9, pop(u, 1.6)); tx(700, 392, '합법이지만 실무에서는 쓰지 않는다', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }

  // ---------- 3. 크기 소실: 함수로 넘기면 주소 하나 ----------
  function s3(t, c) { const { k, u } = c;
    const MX = 90, MY = 300, W = 70;
    zone(40, 236, 520, 170, 'main — 배열이 선언된 곳', { stroke: GRID, sw: 2 });
    array(MX, MY, W, { names: false, addr: false, h: 44, vfs: 17, hot: (i) => (k === 2 && u > 1.6 ? (i < 2 ? { stroke: BAD, fill: BADBG, color: BAD } : { stroke: GRID, color: OFF }) : k >= 3 && u > 0.6 ? { stroke: GOOD, fill: GOODBG } : null) });
    if (k === 0) { ruler(MX, MX + 5 * W, MY + 66, seg(u, 0.3, 1.2), 'sizeof(a) = 20', ACC); mono(450, 274, '20 / 4 = 5', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6), 'text-anchor': 'middle' }); }
    // 함수 프레임
    if (k >= 1 && k <= 2) { const op = k === 1 ? fade(u, 0.1) : 1;
      zone(40, 24, 520, 190, 'broken(int arr[])', { stroke: WARN, sw: 2, fill: WARNBG, color: WARN, op });
      mono(60, 74, 'int arr[]  ≡  int *arr', { 'font-size': 16, 'font-weight': 800, opacity: op });
      const g = k === 1 ? seg(u, 1.4, 2.0) : 1;
      tx(60, 116, 'arr (포인터 8바이트)', { 'font-size': 14, fill: MUT, opacity: op });
      bytes(60, 128, 8, 34, 40, { show: () => g, fill: () => ACCBG }); if (g >= 1) mono(196, 154, '0x1000', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      if (k === 1) { fly(MX + W / 2, MY + 22, 196, 148, seg(u, 0.6, 1.4), '&a[0]', { mono: true }); tx(370, 160, '배열 전체가 아니라 주소 하나', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); }
      if (k === 2) { ruler(60, 60 + 8 * 34, 186, seg(u, 0.2, 1.0), '', BAD); mono(360, 150, 'sizeof(arr) = 8', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) });
        mono(360, 180, '8 / 4 = 2  (기대 5)', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); } }
    if (k >= 3) { zone(40, 24, 520, 190, 'ok(int *arr, size_t n)', { stroke: GOOD, sw: 2, fill: GOODBG, color: GOOD, op: k === 3 ? fade(u, 0.1) : 1 });
      room(150, 120, 140, 50, { name: 'arr', type: 'int *', val: '0x1000', vfs: 17, vcol: ACC, stroke: ACC });
      room(340, 120, 110, 50, { name: 'n', type: 'size_t', val: '5', vfs: 18, vcol: GOOD, stroke: GOOD, s: k === 3 ? pop(u, 0.4) : 1 });
      tx(430, 126, '길이를 같이 받는다', { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
      if (k === 3) { const s = seg(u, 0.6, 2.4), i = Math.min(4, Math.floor(s * 5)); if (s > 0 && s < 1) el('circle', { cx: MX + i * W + W / 2, cy: MY + 62, r: 7, fill: GOOD }); } }
    // 실행 결과
    const lines = ['$ ./size_lost', 'main에서 본 길이 = 5', '함수 안에서 본 길이 = 2', '10 20 30 40 50'];
    const shown = [2, 2, 3, 3, 4][k] + (k === 0 ? seg(u, 1.6, 2.2) - 1 : k === 2 ? seg(u, 1.6, 2.2) - 1 : k === 4 ? 0 : 0);
    terminal(590, 60, 340, 128, lines, k === 4 ? 1 + seg(u, 0.2, 1.6) * 3 : shown, { title: 'size_lost.c 실행', lh: 21 });
    if (k === 4) { tx(600, 240, '같은 배열 a', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      tx(600, 268, 'broken(a) → 길이 2', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(600, 296, 'ok(a, 5) → 5칸 모두', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); } }

  // ---------- 4. 경계 초과 ----------
  function s4(t, c) { const { k, u } = c;
    const W = 92, x0 = 90, y = 130, cx = (i) => x0 + i * W + W / 2;
    if (k <= 3) {
      tx(40, 44, 'int a[5]; 유효 인덱스 0 … 4', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      array(x0, y, W, { hot: (i) => null });
      [5, 6, 7].forEach((i, j) => { const xx = x0 + i * W + 3; el('rect', { x: xx, y, width: W - 6, height: 54, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: j ? 0.6 : 1 });
        if (!j) { mono(cx(5), y - 10, 'a[5]', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700 }); mono(cx(5), y + 74, '0x1014', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD }); } });
      tx(cx(6) + 10, y + 34, '남의 메모리', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
      ruler(x0 + 3, x0 + 5 * W - 3, y + 102, k === 0 ? seg(u, 0.3, 1.2) : 1, '0 … n-1', GOOD);
      const stop = k === 1 ? 5 : 4, s = k >= 1 && k <= 2 ? seg(u, 0.2, 1.8) : 0, i = Math.min(stop, Math.floor(s * (stop + 1)));
      if (s > 0) { el('circle', { cx: cx(i), cy: y + 27, r: 9, fill: i === 5 ? BAD : ACC, opacity: 0.85 }); }
      if (k === 1 || k === 2) mono(40, 290, k === 1 ? 'for (i = 0; i <= 5; i++)' : 'for (i = 0; i < 5; i++)', { 'font-size': 17, 'font-weight': 800, fill: k === 1 ? BAD : GOOD });
      if (k === 1 && u > 1.8) { cross(cx(5), y - 40, 10, pop(u, 1.8)); }
      if (k === 2 && u > 1.9) check(cx(4) + 34, y - 30, 10, pop(u, 1.9));
      if (k === 3) { pin(cxA(0) - A.x0 + x0, y, 'p = a', ACC, 1); const s3 = seg(u, 0.2, 1.6), j = Math.min(4, Math.floor(s3 * 5));
        if (s3 > 0) el('circle', { cx: cx(j), cy: y + 27, r: 9, fill: ACC, opacity: 0.85 });
        pin(cx(5), y, 'a + 5', BAD, pop(u, 1.4)); mono(40, 290, 'for (p = a; p < a + 5; p++)', { 'font-size': 17, 'font-weight': 800, fill: GOOD });
        tx(40, 318, 'a + 5는 계산·비교만 된다. *(a + 5)는 미정의 동작', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }
      // 실제 실행 (zig cc 기본 디버그 빌드)
      if (k === 1) terminal(450, 270, 480, 140, ['$ ./overrun', '10 20 30 40 50 474', '…또는 검사 켜진 빌드에서', 'panic: index 5 out of bounds'], 1 + seg(u, 1.9, 2.8) * 3, { title: 'overrun.c 실행 (474는 예시)', lh: 22 });
      if (k === 2) terminal(450, 300, 480, 100, ['$ ./overrun', '10 20 30 40 50'], 1 + seg(u, 1.9, 2.4), { title: 'i < 5', lh: 22 });
      return; }
    // k4: 문자열 버퍼 8칸
    tx(40, 44, 'char buf[8]에 "123456789" 넣기', { 'font-size': 15, 'font-weight': 700, fill: MUT, class: 'mono' });
    const chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '\\0'], CW = 70, bx0 = 100;
    [[90, chars, 'strcpy', BAD, 0.2], [250, ['1', '2', '3', '4', '5', '6', '7', '\\0'], 'snprintf', GOOD, 1.4]].forEach(([yy, cs, nm, col, a0]) => {
      mono(40, yy - 14, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, a0) });
      for (let i = 0; i < 8; i++) el('rect', { x: bx0 + i * CW, y: yy, width: CW - 4, height: 48, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      el('rect', { x: bx0 + 8 * CW, y: yy, width: 2 * CW - 4, height: 48, rx: 5, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' });
      cs.forEach((ch, i) => { const g = seg(u, a0 + 0.1 + i * 0.09, a0 + 0.3 + i * 0.09); if (g <= 0) return;
        mono(bx0 + i * CW + CW / 2 - 2, yy + 31, ch, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: i >= 8 ? BAD : ch === '\\0' ? WARN : col === GOOD ? GOOD : INK, opacity: g }); });
      mono(bx0 + 4 * CW, yy + 72, nm === 'strcpy' ? '널까지 10바이트 > 8 → 두 칸이 넘친다' : '크기를 알고 7글자 + 널로 잘라 담는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, a0 + 1.0) }); });
    mono(bx0 + 9 * CW, 76, 'buf 밖', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700 }); }

  // ---------- 5. 문자열 · 2차원 배열 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { const CW = 110, x0 = 180, y = 130, ch = ["'a'", "'b'", "'c'", "'\\0'"], code = [97, 98, 99, 0];
      tx(40, 44, 'char msg[] = "abc";  (s는 msg의 첫 칸)', { 'font-size': 15, 'font-weight': 700, fill: MUT, class: 'mono' });
      ch.forEach((s, i) => { const g = k === 0 ? pop(u, 0.2 + i * 0.3) : 1, nul = i === 3;
        card(x0 + i * CW + CW / 2, y + 30, CW - 8, 60, { rx: 6, stroke: nul ? WARN : INK, fill: nul ? WARNBG : PANEL, s: g, sw: 2.2 });
        if (g > 0.3) { mono(x0 + i * CW + CW / 2, y + 38, s, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: nul ? WARN : INK });
          mono(x0 + i * CW + CW / 2, y + 84, String(code[i]), { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); } });
      if (k === 0) tx(x0 + 3.5 * CW, y - 20, '눈에 안 보이는 한 칸', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      if (k === 1) { ruler(x0 + 4, x0 + 3 * CW - 4, y + 120, seg(u, 0.2, 1.0), 'strlen = 3', ACC); ruler(x0 + 4, x0 + 4 * CW - 4, y + 186, seg(u, 1.0, 1.8), 'sizeof = 4', INK);
        tx(720, 380, 'malloc 할 때는 strlen + 1', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
      if (k === 2) { const s = seg(u, 0.2, 1.8), i = Math.min(3, Math.floor(s * 4)), px = x0 + i * CW + CW / 2;
        pin(x0 + CW / 2, y, 's', INK, 1); if (s > 0) { el('line', { x1: px, y1: y + 104, x2: px, y2: y + 70, stroke: ACC, 'stroke-width': 2.5, 'marker-end': mk(ACC) }); mono(px, y + 124, 'p', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC }); }
        for (let j = 0; j < i; j++) arc(x0 + j * CW + CW / 2, y + 104, x0 + (j + 1) * CW + CW / 2, y + 104, -20, 1, ACC, { plain: true, op: 0.5 });
        mono(480, 330, 'while (*p != \'\\0\') p++;', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
        mono(480, 370, 'return p - s;  → 3', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }
      return; }
    // 2차원 배열 m[2][3] → 한 줄 6칸
    tx(40, 44, 'int m[2][3] = {{1, 2, 3}, {4, 5, 6}};', { 'font-size': 15, 'font-weight': 700, fill: MUT, class: 'mono' });
    const g = k === 3 ? E(u, 0.6, 1.8) : 1, CW = 92;
    for (let i = 0; i < 6; i++) { const r = Math.floor(i / 3), cI = i % 3;
      const gx = 120 + cI * CW, gy = 90 + r * 70, lx = 200 + i * CW, ly = 230, x = lerp(gx, lx, g), y = lerp(gy, ly, g), hot = k === 4 && i === 4 && u > 1.8;
      card(x + CW / 2 - 4, y + 28, CW - 8, 56, { rx: 6, stroke: hot ? ACC : r ? C.INFO : INK, fill: hot ? ACCBG : r ? SOFT : PANEL, sw: hot ? 3 : 2.2 });
      mono(x + CW / 2 - 4, y + 36, String(i + 1), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: hot ? ACC : INK });
      if (g >= 1) mono(lx + CW / 2 - 4, ly + 80, `m[${r}][${cI}]`, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
    if (k === 3) { tx(500, 120, '행 0을 다 채우고 행 1로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); }
    if (k === 4) { pin(200 + CW / 2 - 4, 230, 'base', INK, 1);
      hop(200 + CW / 2 - 4, 200 + 3 * CW + CW / 2 - 4, 330, seg(u, 0.2, 0.9), ACC, null); hop(200 + 3 * CW + CW / 2 - 4, 200 + 4 * CW + CW / 2 - 4, 330, seg(u, 1.0, 1.6), ACC, null);
      mono(200 + 1.5 * CW, 392, '1 × 3 (한 행)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      mono(200 + 3.5 * CW + 20, 392, '+ 1', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      mono(560, 120, '*(base + 1*3 + 1) = 5', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      tx(560, 150, '열 개수 3을 알아야 계산된다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); } }

  const quiz = [
    { q: 'a[0]이 0x1000에 있을 때 int *p = &a[0];의 p + 2는 어느 주소인가?',
      o: ['0x1002', '0x1008', '0x1004'], a: 1,
      why: 'p + 2는 int 두 칸, 곧 2 × 4 = 8바이트를 민다. 그래서 0x1008이고 *(p + 2)는 a[2]의 30이다.' },
    { q: 'a[i]를 컴파일러가 실제로 계산하는 식은 무엇인가?',
      o: ['*(a + i)', '&a + i', 'a * i'], a: 0,
      why: '배열 이름 a가 첫 원소 주소로 붕괴한 뒤 i칸 가서 역참조한다. 덧셈이라 2[a]도 같은 30을 준다.' },
    { q: 'int arr[]로 배열을 받은 함수 안에서 sizeof(arr)가 8인 이유는 무엇인가?',
      o: ['int가 8바이트라서', '배열이 앞 두 칸만 복사돼서', 'arr가 사실 포인터라 포인터 크기가 나와서'], a: 2,
      why: '배열을 넘기면 첫 원소 주소 하나만 간다. 64비트에서 포인터는 8바이트라 8 / 4 = 2로 길이를 잘못 센다.' },
    { q: '길이 5인 배열을 for (i = 0; i <= 5; i++)로 돌면 무엇이 문제인가?',
      o: ['a[0]을 건너뛴다', '배열 밖 a[5]를 건드린다', '4번만 돈다'], a: 1,
      why: '유효 인덱스는 0부터 4까지다. 등호 하나 때문에 마지막에 배열 밖 a[5]를 읽어 쓰레기 값이 나오거나 멈춘다.' },
    { q: 'char msg[] = "abc";의 sizeof(msg)가 4인 이유는 무엇인가?',
      o: ['끝의 널 문자까지 저장해서', 'char가 4바이트라서', 'strlen이 1을 더해서'], a: 0,
      why: '문자열 끝에는 \\0 한 칸이 붙는다. strlen은 그 앞까지 세어 3, sizeof는 배열 전체라 4다.' },
  ];

  const summary = [
    'int*에 1을 더하면 주소는 4 늘어난다. 포인터 산술과 포인터 차는 요소 단위다.',
    'a[i]는 *(a + i)의 줄임이고, 식 안의 배열 이름은 첫 원소 주소로 바뀐다.',
    '배열을 함수에 넘기면 주소만 가서 sizeof가 8이 된다. 길이 n을 함께 넘긴다.',
    '유효 인덱스는 0부터 n-1까지다. 문자열은 널 한 칸이 더 붙고 2차원 배열은 행 우선이다.',
  ];
  const review = [
    { q: 'print_all(int arr[])에서 sizeof로 길이를 구했더니 5가 아니라 2가 나온다. 고칠 방법은?',
      o: ['int arr[]를 int arr[5]로 바꾼다', '호출하는 쪽에서 길이를 따로 넘긴다', 'sizeof(arr[0])를 sizeof(char)로 바꾼다'], a: 1,
      why: '매개변수에 대괄호를 써도 실체는 포인터라 크기를 적어도 소용없다. 길이를 아는 곳은 선언한 쪽뿐이므로 n을 인자로 넘긴다.' },
    { q: 'char buf[8]에 "12345678"을 strcpy했더니 옆 변수가 깨졌다. 원인은?',
      o: ['strcpy가 앞 4바이트만 복사해서', 'char가 부호 있는 타입이라서', '널 문자까지 9바이트가 들어가서'], a: 2,
      why: '8글자 뒤에 \\0이 붙어 9바이트가 필요하다. 한 칸이 buf 밖으로 넘치므로 snprintf(buf, sizeof buf, ...)처럼 크기를 알려 준다.' },
    { q: 'int m[2][3]에서 m[1][2]는 &m[0][0]에서 몇 번째 요소인가?',
      o: ['인덱스 5', '인덱스 3', '인덱스 6'], a: 0,
      why: '행 우선이라 한 행 3칸을 건너뛰고 2칸 더 간다. 1 × 3 + 2 = 5다.' },
  ];

  R.page({ title: '배열과 포인터 산술', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
