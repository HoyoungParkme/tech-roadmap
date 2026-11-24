/* I-1-1 참조 vs 포인터 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal, snippet, G } = R;
  const { INK, MUT, OFF, GRID, PANEL, SOFT, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG } = C;

  // ── 지역 도우미 ──────────────────────────────────────────
  // 메모리 칸: 가운데 값, 아래 이름·타입·주소. o.flip = [옛 값, 바뀌는 시각, u] 이면 그 시각에 값이 뒤집히며 바뀐다
  function cellBox(cx, cy, o) { o = o || {}; const w = o.w || 140, h = o.h || 60, g = G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash }, g);
    let v = o.val, sy = 1;
    if (o.flip) { const [old, at, u] = o.flip; if (u < at) { v = old; sy = 1 - seg(u, at - 0.18, at); } else sy = seg(u, at, at + 0.18); }
    if (v != null) { const vg = el('g', { transform: `scale(1 ${Math.max(0.05, sy)})` }, g);
      tx(0, 7, v, { 'text-anchor': 'middle', 'font-size': o.fs || 20, 'font-weight': 700, class: 'mono', fill: o.valCol || INK }, vg); }
    if (o.name) { const nm = tx(0, h / 2 + 22, '', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }, g);
      const a = document.createElementNS('http://www.w3.org/2000/svg', 'tspan'); a.textContent = o.name; nm.appendChild(a);
      if (o.type) { const b = document.createElementNS('http://www.w3.org/2000/svg', 'tspan'); b.textContent = '  ' + o.type; b.setAttribute('fill', MUT); b.setAttribute('font-weight', 600); b.setAttribute('font-size', 14); nm.appendChild(b); } }
    if (o.addr) tx(0, h / 2 + 42, o.addr, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g);
    return g; }
  // 이름표(참조): 구멍 뚫린 꼬리표
  function nameTag(cx, cy, name, o) { o = o || {}; const col = o.col || ACC, w = tw(name, 16) + 34, g = G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -15, width: w, height: 30, rx: 8, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2 }, g);
    el('circle', { cx: -w / 2 + 11, cy: 0, r: 4, fill: PANEL, stroke: col, 'stroke-width': 1.5 }, g);
    tx(6, 6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono', fill: col }, g); return g; }
  // 위로 휘는 곡선의 점들
  function qpts(x1, y1, x2, y2, lift, n) { n = n || 30; const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - lift, out = [];
    for (let i = 0; i <= n; i++) { const t = i / n; out.push([(1 - t) * (1 - t) * x1 + 2 * t * (1 - t) * mx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * my + t * t * y2]); } return out; }
  // 휘는 화살표를 u 만큼 그린다 (포인터가 가리키는 선)
  function arc(x1, y1, x2, y2, u, col, o) { o = o || {}; if (u <= 0) return; const pts = qpts(x1, y1, x2, y2, o.lift ?? 80), k = Math.max(2, Math.ceil(pts.length * clamp(u)));
    el('polyline', { points: pts.slice(0, k).map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.6, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round', opacity: o.op ?? 1,
      'marker-end': u >= 0.98 && !o.plain ? (col === BAD ? 'url(#ra-ahr)' : col === INK || col === MUT ? 'url(#ra-ah)' : 'url(#ra-ahb)') : null }); return pts; }
  const memZone = (y, h, title) => zone(40, y ?? 56, 880, h ?? 196, title || '메모리 · 주소는 예시');
  const code = (lines, op) => snippet(40, 288, lines, { op: op ?? 1 });

  // ── 1. 포인터 — 주소를 담는 변수 ─────────────────────────────
  function s1(t, c) { const { k, u } = c, PX = 730, XX = 220, YX = 400, CY = 150;
    memZone();
    // x 는 계속 살아 있다 (10 → 20)
    cellBox(XX, CY, { name: 'x', type: 'int', addr: '0x1000', val: k < 2 ? '10' : '20', flip: k === 2 ? ['10', 1.4, u] : null, s: k === 0 ? pop(u, 0.2) : 1, stroke: k === 2 && u > 1.4 ? WARN : INK });
    if (k >= 3) cellBox(YX, CY, { name: 'y', type: 'int', addr: '0x1008', val: '99', s: k === 3 ? pop(u, 0.2) : 1 });
    // p 칸: 값은 주소
    const pv = k <= 2 ? '0x1000' : k === 3 ? '0x1008' : 'nullptr', pflip = k === 3 ? ['0x1000', 1.3, u] : k === 4 ? ['0x1008', 0.8, u] : null;
    cellBox(PX, CY, { name: 'p', type: 'int*', addr: '0x2000', val: pv, flip: pflip, fs: 19, fill: ACCBG, stroke: ACC, valCol: k >= 4 && !(k === 4 && u < 0.8) ? MUT : ACC, s: k === 0 ? pop(u, 0.7) : 1 });
    // 가리키는 화살표
    const top = CY - 30;
    if (k === 0) arc(PX - 20, top, XX + 20, top, seg(u, 1.1, 1.9), ACC, { lift: 100 });
    if (k === 1 || k === 2) arc(PX - 20, top, XX + 20, top, 1, ACC, { lift: 100 });
    if (k === 3) { const tx2 = lerp(XX + 20, YX + 20, E(u, 0.8, 1.6)); arc(PX - 20, top, tx2, top, 1, ACC, { lift: lerp(100, 70, E(u, 0.8, 1.6)) }); }
    if (k === 4) arc(PX - 20, top, YX + 20, top, 1 - seg(u, 0.3, 1.0), ACC, { lift: 70, plain: true });
    if (k === 4) sub(PX, 104, '아무것도 안 가리킨다', fade(u, 1.1), { 'font-weight': 700 });
    if (k === 0) sub(470, 92, '&x — x 의 주소를 담는다', fade(u, 1.8), { fill: ACC, 'font-weight': 700 });
    // 출력 창
    const out = ['$ ./a.out', '0x1000      ← p', '10          ← *p', '20          ← x', '99          ← *p'];
    const shown = k === 0 ? 1 : k === 1 ? 1 + (u > 0.9 ? 1 : 0) + (u > 2.3 ? 1 : 0) : k === 2 ? 3 + (u > 2.0 ? 1 : 0) : k === 3 ? 4 + (u > 2.4 ? 1 : 0) : 5;
    terminal(580, 270, 340, 140, out, shown, { title: '출력 · 주소는 예시', fs: 14 });
    if (k === 1) { fly(PX, CY, 700, 330, seg(u, 0.2, 0.9), '0x1000', { mono: true });
      const pts = qpts(PX - 20, top, XX + 20, top, 100); dot(pts, seg(u, 1.0, 1.6), WARN, 7); fly(XX, CY, 700, 352, seg(u, 1.6, 2.3), '10', { mono: true }); }
    if (k === 2) { fly(150, 310, PX, top, seg(u, 0.2, 0.7), '20', { fill: WARN, mono: true });
      const pts = qpts(PX - 20, top, XX + 20, top, 100); dot(pts, seg(u, 0.75, 1.35), WARN, 7);
      tx(905, 104, 'p 의 값 0x1000 은 그대로', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) }); }
    if (k === 3) { const pts = qpts(PX - 20, top, YX + 20, top, 70); dot(pts, seg(u, 1.8, 2.3), WARN, 7); }
    // 아래 왼쪽: 이 beat 의 코드
    const lines = [['int x = 10;', 'int* p = &x;'], ['std::cout << p;', 'std::cout << *p;'], ['*p = 20;', 'std::cout << x;'], ['int y = 99;', 'p = &y;'], ['p = nullptr;'], ['// std::cout << *p;']][k];
    if (k < 5) code(lines, k === 0 ? fade(u, 0.1) : 1);
    if (k === 5) { // null 을 열면: 빈 곳으로 가는 점선과 ✕
      el('line', { x1: PX - 30, y1: top, x2: 560, y2: 88, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 6', opacity: fade(u, 0.2) });
      dot([[PX - 30, top], [560, 88]], seg(u, 0.3, 0.9), BAD, 7); cross(548, 86, 11, pop(u, 0.9));
      tx(470, 92, '*p → 크래시', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      const ops = c.beat.ops || [], nm = ['재대입', 'null 가능', '역참조'];
      ops.slice(0, 3).forEach((o, i) => { const cx = 124 + i * 168, s = pop(u, 1.3 + i * 0.3);
        card(cx, 345, 156, 92, { rx: 10, stroke: i === 1 ? WARN : GOOD, sw: 2, s });
        tx(cx, 330, nm[i], { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.4 + i * 0.3) });
        mono(cx, 360, o.code, { 'text-anchor': 'middle', 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.4 + i * 0.3) }); });
      tx(40, 286, '포인터만 가진 세 가지 자유', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) }); } }

  // ── 2. 참조 — 같은 칸에 붙은 또 하나의 이름 ─────────────────────
  function s2(t, c) { const { k, u } = c, XX = 300, ZX = 620, CY = 150, top = CY - 30;
    memZone();
    const xv = k < 2 ? '10' : k === 2 ? '20' : '99', xflip = k === 2 ? ['10', 1.3, u] : k === 3 ? ['20', 2.2, u] : null;
    cellBox(XX, CY, { addr: '0x1000', val: xv, flip: xflip, s: k === 0 ? pop(u, 0.2) : 1, stroke: (k === 2 && u > 1.3) || (k === 3 && u > 2.2) ? WARN : INK });
    sub(XX, CY + 58, 'int 칸 하나', 1, { 'font-weight': 700, fill: INK });
    // 이름표 x, r 과 끈
    const tgX = [XX - 62, 82], wob = k === 3 ? Math.sin(seg(u, 0.5, 1.4) * Math.PI) : 0, tgR = [lerp(XX + 62, ZX - 60, wob * 0.75), 82];
    const sx = k === 0 ? pop(u, 0.5) : 1;
    el('line', { x1: tgX[0], y1: tgX[1] + 15, x2: XX - 30, y2: top, stroke: ACC, 'stroke-width': 2, opacity: sx });
    nameTag(tgX[0], tgX[1], 'x', { s: sx });
    const rIn = k === 0 ? E(u, 1.0, 1.8) : 1, rx0 = lerp(560, tgR[0], rIn);
    if (k > 0 || u > 1.0) { if (rIn > 0.98) el('line', { x1: tgR[0], y1: tgR[1] + 15, x2: XX + 30, y2: top, stroke: k === 3 && wob > 0.3 ? BAD : ACC, 'stroke-width': 2 });
      nameTag(rx0, tgR[1], 'r', {}); }
    if (k === 0) { cellBox(ZX + 120, CY, { val: '', dash: '6 5', stroke: OFF, op: fade(u, 1.9) * 0.9 }); cross(ZX + 120, CY, 16, pop(u, 2.2));
      sub(ZX + 120, CY + 58, '새 칸은 생기지 않는다', fade(u, 2.2), { 'font-weight': 700 }); }
    if (k === 3 || k === 4) cellBox(ZX, CY, { name: 'z', type: 'int', addr: '0x1008', val: '99', s: k === 3 ? pop(u, 0.2) : 1 });
    if (k === 3) { cross(ZX - 60, 120, 11, pop(u, 1.2));
      tx(ZX - 30, 76, '갈아타기 없음', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      fly(ZX, CY, XX, CY, seg(u, 1.5, 2.2), '99', { fill: WARN, mono: true }); }
    // 출력 창
    const out = ['$ ./a.out', '10                 ← r', '20                 ← x', '0x1000 0x1000      ← &x, &r', '99                 ← x'];
    const shown = k === 0 ? 1 : k === 1 ? 1 + (u > 1.8 ? 1 : 0) : k === 2 ? 2 + (u > 1.6 ? 1 : 0) + (u > 2.2 ? 1 : 0) : k === 3 ? 4 + (u > 2.4 ? 1 : 0) : 5;
    terminal(580, 270, 340, 140, out, shown, { title: '출력 · 주소는 예시', fs: 14 });
    if (k === 1) { dot([[tgR[0], tgR[1] + 15], [XX + 30, top], [XX, CY]], seg(u, 0.3, 0.9), WARN, 7); fly(XX, CY, 700, 330, seg(u, 1.0, 1.8), '10', { mono: true });
      pill(XX + 160, 82, '* 없이 그냥 r', GOOD, pop(u, 1.2), { fs: 14 }); }
    if (k === 2) { fly(150, 310, tgR[0], tgR[1], seg(u, 0.2, 0.85), '20', { fill: WARN, mono: true }); dot([[tgR[0], tgR[1] + 15], [XX + 30, top]], seg(u, 0.85, 1.25), WARN, 7);
      pill(XX + 170, 82, '&x == &r', GOOD, pop(u, 2.2), { fs: 14, mono: true }); }
    const lines = [['int x = 10;', 'int& r = x;'], ['std::cout << r;'], ['r = 20;', 'std::cout << &x << &r;'], ['int z = 99;', 'r = z;   // x = 99'], ['// int& bad;', '// int& n = nullptr;']][k];
    code(lines, k === 0 ? fade(u, 0.1) : 1);
    if (k === 4) { [['bad', '초기화 없음'], ['n', '= nullptr']].forEach(([nm, why], i) => { const y = 92 + i * 92, s = pop(u, 0.3 + i * 0.6), cx = 820;
        nameTag(cx - 30, y, nm, { col: BAD, fill: BADBG, s });
        el('line', { x1: cx - 30, y1: y + 15, x2: cx - 30, y2: y + 42, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: s });
        cross(cx - 30, y + 48, 8, s); tx(cx + 12, y + 6, why, { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5 + i * 0.6) }); });
      tx(780, 270 - 12, '둘 다 컴파일 에러', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }

  // ── 3. 함수 인자 전달 — 스택 프레임으로 보기 ─────────────────────
  const STR = ['긴', ' ', '문', '자', '열', ' ', '.', '.', '.'];
  function frame(x, y, w, h, title, op, col) { zone(x, y, w, h, null, { fill: PANEL, stroke: col || INK, sw: 2, op });
    mono(x + 14, y + 24, title, { 'font-size': 14, 'font-weight': 700, fill: col || INK, opacity: op }); }
  function s3(t, c) { const { k, u } = c;
    zone(40, 56, 380, 250, 'main() 의 스택 프레임');
    const A = [120, 150], Bc = [300, 150];
    if (k >= 2) { const av = k === 2 ? '5' : '100', af = k === 3 ? ['5', 1.8, u] : null;
      cellBox(A[0], A[1], { name: 'a', type: 'int', val: k === 2 ? '5' : av, flip: af, w: 110, h: 54, s: k === 2 ? pop(u, 0.2) : 1, stroke: k === 3 && u > 1.8 ? WARN : INK }); }
    if (k === 2 && u > 2.2) check(A[0] + 70, A[1] - 34, 9, pop(u, 2.2));
    if (k >= 4) { const n = STR.length, cw = 30;
      STR.forEach((ch, i) => { const s = k === 4 ? pop(u, 0.15 + i * 0.06) : 1; card(70 + i * 34, 262, cw, 34, { rx: 5, text: ch, fs: 15, mono: true, sw: 1.6, s, stroke: GRID }); });
      tx(56, 236, 'big  std::string', { 'font-size': 14, 'font-weight': 700, fill: INK }); }
    if (k >= 5) cellBox(Bc[0], Bc[1], { name: 'b', type: 'int', val: '5', flip: ['5', 1.4, u], w: 110, h: 54, s: pop(u, 0.2), stroke: u > 1.4 ? WARN : INK });
    if (k <= 1) { // 네 가지 매개변수 모양
      const kinds = [['값 전달', 'int n', 'cell'], ['참조', 'int& n', 'tag'], ['const 참조', 'const std::string& s', 'lock'], ['포인터', 'int* n', 'ptr']];
      kinds.forEach(([nm, sig, shape], i) => { if (i >= 2 && k === 0) return; const cx = i % 2 ? 805 : 575, cy = i < 2 ? 116 : 236, s = (k === 0 && i < 2) || (k === 1 && i >= 2) ? pop(u, 0.2 + (i % 2) * 0.4) : 1;
        card(cx, cy, 210, 104, { rx: 10, s, stroke: GRID, sw: 1.6 });
        const op = (k === 0 && i < 2) || (k === 1 && i >= 2) ? fade(u, 0.4 + (i % 2) * 0.4) : 1;
        tx(cx - 92, cy - 26, nm, { 'font-size': 15, 'font-weight': 800, opacity: op }); mono(cx - 92, cy - 4, sig, { 'font-size': 13.5, fill: MUT, opacity: op });
        if (shape === 'cell') { cellBox(cx - 50, cy + 28, { val: 'n', w: 54, h: 30, fs: 15, op }); tx(cx - 12, cy + 33, '자기 칸 = 복사본', { 'font-size': 13.5, fill: INK, opacity: op }); }
        if (shape === 'tag') { nameTag(cx - 54, cy + 28, 'n', { op }); tx(cx - 14, cy + 33, '원본에 붙는 이름표', { 'font-size': 13.5, opacity: op }); }
        if (shape === 'lock') { nameTag(cx - 60, cy + 28, 's', { op }); lock(cx - 26, cy + 28, true, ACC, 0.7 * op); tx(cx - 8, cy + 33, '읽기만, 복사 없음', { 'font-size': 13.5, opacity: op }); }
        if (shape === 'ptr') { cellBox(cx - 50, cy + 28, { val: '주소', w: 54, h: 30, fs: 13.5, op, fill: ACCBG, stroke: ACC, valCol: ACC }); tx(cx - 12, cy + 33, 'nullptr 도 온다', { 'font-size': 13.5, opacity: op }); }
      }); }
    if (k === 2) { const op = 1 - seg(u, 1.9, 2.4); frame(500, 80, 400, 170, 'byValue(int n)', op);
      cellBox(700, 160, { name: 'n', val: '5', flip: ['5', 1.4, u], w: 110, h: 54, op, stroke: u > 1.4 ? WARN : INK });
      fly(A[0], A[1], 700, 160, seg(u, 0.4, 1.0), '5 복사', { mono: true });
      tx(520, 238, 'n = 100;  복사본만 바뀐다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) * op });
      tx(240, 296 - 10, 'a 는 그대로 5', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k === 3) { frame(500, 80, 400, 170, 'byRef(int& n)', 1);
      nameTag(700, 160, 'n', { s: pop(u, 0.2) });
      arc(690, 145, A[0] + 20, A[1] - 27, seg(u, 0.4, 1.0), ACC, { lift: 12 });
      const pts = qpts(690, 145, A[0] + 20, A[1] - 27, 12); dot(pts, seg(u, 1.1, 1.75), WARN, 8);
      tx(520, 238, 'n = 100;  n 이 곧 a', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      tx(240, 286, 'a: 5 → 100', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 1.9) }); }
    if (k === 4) { frame(500, 80, 400, 170, 'byConstRef(const std::string& s)', 1);
      nameTag(640, 160, 's', { s: pop(u, 0.9) }); lock(684, 160, true, ACC, pop(u, 1.0) * 0.8);
      arc(625, 177, 210, 245, seg(u, 1.1, 1.7), ACC, { lift: 10 });
      mono(880, 156, '복사 0회', { 'text-anchor': 'end', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      mono(880, 184, 's.size() → 17', { 'text-anchor': 'end', 'font-size': 14, fill: INK, opacity: fade(u, 2.1) });
      tx(520, 238, 'UTF-8 로 한글 한 글자는 3바이트', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); }
    if (k === 5) { frame(500, 66, 400, 116, 'byPtr(&b)', 1); frame(500, 194, 400, 104, 'byPtr(nullptr)', fade(u, 1.7));
      cellBox(600, 124, { name: '', val: '&b', w: 90, h: 46, fs: 16, fill: ACCBG, stroke: ACC, valCol: ACC, s: pop(u, 0.2) });
      arc(570, 124, Bc[0] + 56, Bc[1], seg(u, 0.4, 0.9), ACC, { lift: 0 });
      dot(qpts(570, 124, Bc[0] + 56, Bc[1], 0), seg(u, 0.9, 1.35), WARN, 8);
      tx(670, 130, '*n = 100', { 'font-size': 14.5, class: 'mono', fill: INK, opacity: fade(u, 0.9) });
      cellBox(600, 250, { val: 'nullptr', w: 110, h: 42, fs: 15, valCol: MUT, op: fade(u, 1.8) });
      el('rect', { x: 690, y: 232, width: 82, height: 36, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 2.0) });
      mono(731, 256, 'if (n)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(790, 256, '건너뛴다, 안전', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); }
    const lines = [['void byValue(int n)  { n = 100; }', 'void byRef(int& n)   { n = 100; }'], ['void byConstRef(const std::string& s);', 'void byPtr(int* n) { if (n) *n = 100; }'],
      ['int a = 5;', 'byValue(a);   // a → 5'], ['byRef(a);     // a → 100'], ['std::string big = "긴 문자열 ...";', 'byConstRef(big);'], ['byPtr(&b);    // b → 100', 'byPtr(nullptr);']][k];
    snippet(40, 322, lines, { fs: 14 }); }

  // ── 4. 무엇을 언제 쓰나 ───────────────────────────────────────
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { zone(40, 56, 400, 230, 'main()'); frame(500, 56, 420, 230, 'sum(const std::vector<int>& v)', 1);
      [1, 2, 3].forEach((v, i) => card(110 + i * 76, 150, 64, 56, { rx: 8, text: String(v), fs: 20, mono: true, s: k === 0 ? pop(u, 0.15 + i * 0.1) : 1 }));
      tx(78, 106, 'nums  std::vector<int>', { 'font-size': 14, 'font-weight': 700 });
      nameTag(590, 130, 'v', { s: k === 0 ? pop(u, 0.6) : 1 }); lock(632, 130, true, ACC, (k === 0 ? pop(u, 0.7) : 1) * 0.8);
      arc(575, 115, 186, 122, k === 0 ? seg(u, 0.8, 1.5) : 1, ACC, { lift: 40 });
      if (k === 0) { tx(530, 200, '참조 매개변수는 빈 채로 만들 수 없다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
        tx(530, 226, '호출하는 쪽이 반드시 무언가를 넘긴다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) }); }
      if (k === 1) { const at = [0.3, 0.8, 1.3], i = at.filter((a) => u >= a).length - 1, sv = [0, 1, 3, 6][i + 1];
        if (i >= 0) el('rect', { x: 110 + i * 76 - 36, y: 118, width: 72, height: 64, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 3 });
        mono(600, 196, 's = ' + sv, { 'font-size': 22, 'font-weight': 800, fill: WARN });
        mono(600, 226, 'for (int x : v) s += x;', { 'font-size': 13.5, fill: MUT });
        // 포인터라면 칸을 건너다닌다
        const op = fade(u, 1.8);
        ['p', 'p + 1', 'p + 2'].forEach((s, j) => { const x = 110 + j * 76; grow(x, 248, x, 186, op, INK, { sw: 2 }); mono(x, 266, s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: INK, opacity: op }); }); } }
    if (k === 2 || k === 3) { zone(40, 56, 400, 230, 'main()'); frame(500, 56, 420, 140, k === 2 ? 'findUser(0)' : 'findUser(id)  id > 0', 1);
      mono(520, 112, k === 2 ? 'if (id <= 0) return nullptr;' : 'return &name;', { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.2) });
      if (k === 3) { zone(500, 214, 420, 92, '정적 영역 · 함수가 끝나도 남는다', { fill: SOFT });
        cellBox(830, 262, { val: '"Ada"', w: 110, h: 40, fs: 16, s: pop(u, 0.2) }); mono(760, 268, 'name', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); }
      cellBox(150, 160, { name: 'u', type: 'std::string*', val: k === 2 ? 'nullptr' : '&name', w: 130, h: 52, fs: 17, fill: ACCBG, stroke: ACC, valCol: k === 2 ? MUT : ACC, s: pop(u, 1.2) });
      fly(700, 150, 150, 160, seg(u, 0.5, 1.2), k === 2 ? 'nullptr' : '&name', { mono: true, fill: k === 2 ? MUT : ACC });
      if (k === 2) { tx(260, 252, '"못 찾음"을 값으로 말한다', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
        tx(670, 172, '참조로는 비어 있음을 표현할 수 없다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
      if (k === 3) { arc(190, 134, 800, 242, seg(u, 1.5, 2.2), ACC, { lift: 90 });
        tx(260, 252, '나중에 다른 대상으로 갈아탈 수도 있다', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); } }
    if (k === 4) { // 결정 흐름
      const qs = ['대상이 없을 수 있나?', '가리키는 대상을 바꾸나?', '배열을 걷거나 new/delete 인가?'];
      qs.forEach((q, i) => { const y = 92 + i * 92, s = pop(u, 0.2 + i * 0.25);
        card(250, y, 330, 60, { rx: 10, s, stroke: INK, sw: 2 }); tx(250, y + 6, q, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.25) });
        grow(418, y, 560, y, seg(u, 0.5 + i * 0.25, 0.9 + i * 0.25), ACC); mono(488, y - 10, '예', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 0.8 + i * 0.25) });
        if (i < 2) grow(250, y + 31, 250, y + 61, seg(u, 0.6 + i * 0.25, 0.9 + i * 0.25), MUT); });
      card(680, 184, 220, 230, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 1.1) });
      mono(680, 172, 'T*', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      tx(680, 206, '포인터 · if (p) 확인', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INK, opacity: fade(u, 1.2) });
      grow(250, 307, 250, 340, seg(u, 1.2, 1.5), MUT); mono(270, 330, '모두 아니오', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      card(250, 372, 330, 52, { rx: 10, stroke: GOOD, sw: 2.5, fill: GOODBG, s: pop(u, 1.5) });
      mono(250, 378, 'const T&  /  T&', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      tx(445, 378, '기본값 = 참조', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) });
      pill(680, 340, 'sum(nums) → 참조', GOOD, pop(u, 2.0), { mono: true, fs: 13.5 }); pill(680, 380, 'findUser → 포인터', ACC, pop(u, 2.2), { mono: true, fs: 13.5 }); } }

  // ── 5. 실무 실패 사례 ────────────────────────────────────────
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // 스택: 아래 main, 위 badRef
      tx(60, 74, '스택 (위로 쌓인다)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const pop1 = seg(u, 1.2, 1.7);
      zone(60, 90, 360, 120, null, { fill: pop1 > 0.5 ? SOFT : PANEL, stroke: pop1 > 0.5 ? OFF : INK, sw: 2, dash: pop1 > 0.5 ? '6 5' : null });
      mono(76, 114, pop1 > 0.5 ? 'badRef() 끝 · 칸 해제' : 'badRef()', { 'font-size': 14, 'font-weight': 700, fill: pop1 > 0.5 ? MUT : INK });
      cellBox(240, 160, { name: '', val: pop1 > 0.5 ? '??' : '42', w: 100, h: 46, fs: 18, stroke: pop1 > 0.5 ? BAD : INK, valCol: pop1 > 0.5 ? BAD : INK, dash: pop1 > 0.5 ? '5 4' : null });
      mono(170, 166, 'x', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
      zone(60, 222, 360, 100, null, { fill: PANEL, stroke: INK, sw: 2 }); mono(76, 246, 'main()', { 'font-size': 14, 'font-weight': 700 });
      nameTag(150, 284, 'int& r', { col: pop1 > 0.5 ? BAD : ACC, fill: pop1 > 0.5 ? BADBG : ACCBG, s: pop(u, 0.4) });
      arc(150, 269, 240, 184, seg(u, 0.6, 1.1), pop1 > 0.5 ? BAD : ACC, { lift: 30 });
      tx(240, 352, '죽은 칸을 계속 본다 (UB)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      // 오른쪽: 값 반환
      tx(500, 74, '값으로 반환하면', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.9) });
      zone(500, 90, 400, 120, null, { fill: SOFT, stroke: OFF, sw: 2, dash: '6 5', op: fade(u, 1.9) }); mono(516, 114, 'goodRef() 끝', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) });
      zone(500, 222, 400, 100, null, { fill: PANEL, stroke: INK, sw: 2, op: fade(u, 1.9) }); mono(516, 246, 'main()', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.9) });
      fly(700, 160, 700, 280, seg(u, 2.0, 2.5), '42', { mono: true, fill: GOOD });
      if (u > 2.5) { cellBox(700, 280, { val: '42', w: 100, h: 42, fs: 18, stroke: GOOD }); check(770, 280, 10, pop(u, 2.5)); }
      return; }
    if (k === 1) { const cells = (x, y, n, s0, col) => STR.forEach((ch, i) => { const s = n == null ? 1 : clamp(n - i); if (s <= 0) return; card(x + i * 34, y, 30, 34, { rx: 5, text: ch, fs: 15, mono: true, sw: 1.6, stroke: col || GRID, s: s0 ?? 1, op: s }); });
      tx(60, 80, '호출하는 쪽의 big', { 'font-size': 14, 'font-weight': 700 }); cells(76, 112);
      frame(60, 160, 360, 120, 'useValue(std::string s)', 1); cells(76, 236, lerp(0, STR.length, E(u, 0.3, 1.8)), 1, BAD);
      tx(240, 310, '호출할 때마다 전부 복사', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      frame(500, 160, 400, 120, 'useRef(const std::string& s)', fade(u, 0.3));
      nameTag(830, 236, 's', { s: pop(u, 0.6) }); lock(872, 236, true, ACC, pop(u, 0.7) * 0.8);
      arc(815, 221, 360, 96, seg(u, 0.8, 1.5), ACC, { lift: 90 });
      mono(540, 242, '복사 0회', { 'text-anchor': 'start', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      tx(700, 310, '& 하나 차이', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { memZone(56, 210, '메모리');
      el('rect', { x: 60, y: 96, width: 200, height: 120, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' });
      tx(160, 150, '주소 0 근처', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD }); tx(160, 174, '열면 프로그램이 죽는다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD });
      cellBox(520, 150, { name: 'p', type: 'int*', val: 'nullptr', fs: 17, valCol: MUT, fill: ACCBG, stroke: ACC });
      dot([[450, 150], [270, 150]], seg(u, 0.3, 1.0), BAD, 8); cross(270, 150, 14, pop(u, 1.0));
      mono(370, 128, '*p = 1;', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
      el('rect', { x: 690, y: 128, width: 92, height: 44, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.2, opacity: fade(u, 1.4) });
      mono(736, 156, 'if (p)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) });
      dot([[590, 150], [688, 150]], seg(u, 1.6, 2.1), INK, 8); if (u > 2.1) check(820, 150, 12, pop(u, 2.1));
      tx(736, 206, '먼저 확인하고 연다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) });
      snippet(40, 300, ['int* p = nullptr;', '// *p = 1;     // 크래시', 'if (p) *p = 1;'], { fs: 14 }); return; }
    // k3: 미초기화 포인터
    memZone(56, 210, '메모리');
    const junk = ['0x7a3f', '0x01c8', '0xe210', '0x5d9b'], j = Math.floor(t * 3) % 4, fixed = u > 1.6;
    cellBox(200, 150, { name: 'q', type: 'int*', val: fixed ? 'nullptr' : junk[j] + '…', flip: fixed ? ['', 1.6, u] : null, fs: 17, fill: fixed ? ACCBG : WARNBG, stroke: fixed ? ACC : WARN, valCol: fixed ? MUT : WARN, s: pop(u, 0.1) });
    if (!fixed) { const tg = [[520, 100], [760, 180], [640, 210], [860, 110]][j]; arc(220, 120, tg[0], tg[1], 1, WARN, { lift: 40, dash: '6 5' }); el('circle', { cx: tg[0], cy: tg[1], r: 9, fill: WARN, opacity: 0.6 });
      tx(600, 236, '어디를 가리킬지 아무도 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN }); }
    else tx(560, 158, 'q = nullptr;  비어 있음을 분명히', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    [['댕글링', BAD], ['큰 객체 값 복사', WARN], ['null 역참조', BAD], ['미초기화 포인터', WARN]].forEach(([s, col], i) => pill(150 + i * 220, 320, s, col, pop(u, 2.0 + i * 0.12), { fs: 15 }));
    tx(480, 380, '대상이 살아 있는 동안만 유효하다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.5) }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'int x = 10; int* p = &x; 뒤에 *p = 20; 을 실행하면 바뀌는 것은 무엇인가?',
      o: ['p에 담긴 주소', 'p가 가리키는 x의 값', 'p와 x 둘 다'], a: 1,
      why: '*p는 p가 가리키는 곳을 연다. 그래서 x가 20이 되고, p에 담긴 주소 0x1000(예시)은 그대로다.' },
    { q: 'int& r = x; 뒤에 r = z; 를 실행하면 어떻게 되는가?',
      o: ['x에 z의 값 99가 들어간다', 'r이 이제 z를 가리킨다', '컴파일 에러가 난다'], a: 0,
      why: '참조는 한 번 묶이면 다른 변수로 갈아탈 수 없다. r = z는 x에 z의 값을 대입하는 문장일 뿐이다.' },
    { q: '긴 std::string을 읽기만 하는 함수의 매개변수로 가장 알맞은 것은 무엇인가?',
      o: ['std::string s', 'std::string& s', 'const std::string& s'], a: 2,
      why: 'const 참조는 복사가 0회이고, 함수 안에서 바꾸려 하면 컴파일 에러가 난다. 값으로 받으면 호출마다 문자열 전체가 복사된다.' },
    { q: '조회에 실패할 수 있는 findUser가 참조 대신 포인터를 돌려주는 이유는 무엇인가?',
      o: ['nullptr로 "못 찾음"을 표현할 수 있어서', '포인터가 참조보다 빨라서', '참조는 함수에서 돌려줄 수 없어서'], a: 0,
      why: '참조는 null이 될 수 없어 "없음"을 표현할 방법이 없다. 포인터는 nullptr로 그것을 말하고, 받는 쪽은 if (u)로 확인한다.' },
    { q: 'int& badRef() { int x = 42; return x; }가 위험한 이유는 무엇인가?',
      o: ['42가 int 범위를 넘어서', '참조는 반환 타입으로 쓸 수 없어서', '함수가 끝나면 x가 사라져 참조가 죽은 칸을 가리켜서'], a: 2,
      why: '지역 변수 x는 함수가 끝나는 순간 파괴된다. 컴파일은 되지만 그 참조를 읽는 것은 미정의 동작(UB)이다.' },
  ];

  const summary = [
    '포인터는 주소를 담는 별도 칸이라 재대입과 nullptr이 되고, 값은 *p로 열어야 읽힌다.',
    '참조는 이미 있는 칸에 붙는 이름표다. 새 칸이 없고, null이 없고, 갈아탈 수 없다.',
    '읽기만 하면 const T&, 원본을 고치면 T&, 없을 수 있으면 T*로 받는다.',
    '참조와 포인터는 대상이 살아 있는 동안만 유효하다. 지역 변수의 주소를 밖으로 내보내지 않는다.',
  ];
  const review = [
    { q: '함수 안에서 매개변수를 고쳤는데 호출한 쪽 값이 그대로다. 먼저 확인할 것은 무엇인가?',
      o: ['매개변수가 int& 가 아니라 int로 선언됐는지', '함수가 static 인지', '컴파일러 최적화 단계'], a: 0,
      why: 'int로 받으면 복사본만 바뀐다. byValue(a) 뒤 a가 5 그대로였던 것과 같다. 원본을 고치려면 int& 로 받는다.' },
    { q: '포인터를 반환하는 함수를 호출한 뒤 곧바로 *u로 열었더니 가끔 크래시가 난다. 가장 먼저 의심할 것은 무엇인가?',
      o: ['문자열 인코딩 문제', '함수가 nullptr을 돌려줬는데 확인 없이 열었다', '참조와 포인터를 섞어 써서'], a: 1,
      why: '포인터 반환은 "없음"을 nullptr로 말할 수 있다는 뜻이다. 받은 쪽은 if (u)로 확인한 뒤에만 열어야 한다.' },
    { q: '선택적인 설정값을 받는 함수인데, 넘길 값이 없을 때도 있다. 매개변수로 알맞은 것은 무엇인가?',
      o: ['const Config& c', 'Config c', 'const Config* c'], a: 2,
      why: '참조는 반드시 무언가에 묶여야 해서 "없음"을 넘길 수 없다. 없을 수 있으면 포인터로 받고 if (c)로 확인한다.' },
  ];

  R.page({ title: '메모리 칸으로 보는 참조와 포인터', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
