/* I-2-1 연산자 오버로딩 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal, snippet, axes, G } = R;
  const { INK, MUT, OFF, GRID, PANEL, SOFT, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 지역 도우미 ──────────────────────────────────────────
  function cellBox(cx, cy, o) { o = o || {}; const w = o.w || 70, h = o.h || 44, g = G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 7, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash }, g);
    let v = o.val, sy = 1;
    if (o.flip) { const [old, at, u] = o.flip; if (u < at) { v = old; sy = 1 - seg(u, at - 0.18, at); } else sy = seg(u, at, at + 0.18); }
    if (v != null) { const vg = el('g', { transform: `scale(1 ${Math.max(0.05, sy)})` }, g); tx(0, 7, v, { 'text-anchor': 'middle', 'font-size': o.fs || 19, 'font-weight': 700, class: 'mono', fill: o.valCol || INK }, vg); }
    if (o.name) tx(0, -h / 2 - 9, o.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT }, g);
    return g; }
  // Vec2 한 개 = x, y 두 칸. vals = [x, y] (문자열), o.flips = [flipX, flipY]
  function vec(cx, cy, name, vals, o) { o = o || {}; const op = o.op ?? 1, s = o.s ?? 1;
    if (name) mono(cx - 84, cy + 7, name, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: o.col || INK, opacity: op });
    cellBox(cx - 38, cy, { name: o.noName ? null : 'x', val: vals[0], flip: o.flips && o.flips[0], s, op, stroke: o.stroke, valCol: o.valCol });
    cellBox(cx + 38, cy, { name: o.noName ? null : 'y', val: vals[1], flip: o.flips && o.flips[1], s, op, stroke: o.stroke, valCol: o.valCol }); }
  // 연산자 기계: 왼쪽·오른쪽 자리 두 개와 가운데 연산자
  function machine(cx, cy, opName, left, right, o) { o = o || {}; const op = o.op ?? 1, s = o.s ?? 1, g = G(cx, cy, s, op);
    el('rect', { x: -230, y: -40, width: 460, height: 80, rx: 14, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    [[-130, left], [130, right]].forEach(([x, sl]) => { if (!sl) return;
      const vc = sl.vcol || GOOD;   // sl.v: 자리에 들어온 값 (들어오면 이름 대신 값을 보인다)
      el('rect', { x: x - 82, y: -24, width: 164, height: 48, rx: 9, fill: sl.v ? (vc === BAD ? BADBG : GOODBG) : sl.fixed ? INFOBG : SOFT, stroke: sl.v ? vc : sl.fixed ? INFO : GRID, 'stroke-width': sl.v ? 2.4 : 1.8 }, g);
      tx(x, -3, sl.v || sl.n, { 'text-anchor': 'middle', 'font-size': sl.v ? 17 : 15, 'font-weight': 800, class: 'mono', fill: sl.v ? vc : sl.fixed ? INFO : INK }, g);
      tx(x, 16, sl.t, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g); });
    tx(0, 9, opName, { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, class: 'mono', fill: o.opCol || ACC }, g); }
  // 위로 휘는 곡선 점
  function qpts(x1, y1, x2, y2, lift, n) { n = n || 30; const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - lift, out = [];
    for (let i = 0; i <= n; i++) { const t = i / n; out.push([(1 - t) * (1 - t) * x1 + 2 * t * (1 - t) * mx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * my + t * t * y2]); } return out; }
  function arc(x1, y1, x2, y2, u, col, o) { o = o || {}; if (u <= 0) return; const pts = qpts(x1, y1, x2, y2, o.lift ?? 60), k = Math.max(2, Math.ceil(pts.length * clamp(u)));
    el('polyline', { points: pts.slice(0, k).map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1,
      'marker-end': u >= 0.98 ? (col === BAD ? 'url(#ra-ahr)' : col === ACC || !col ? 'url(#ra-ahb)' : 'url(#ra-ah)') : null }); }

  // ── 1. a + b 는 함수 호출이다 ───────────────────────────────
  function s1(t, c) { const { k, u } = c;
    // 오른쪽: 좌표 평면
    const ax = axes(600, 70, 290, 270, { x: [0, 7], y: [0, 7], xt: [0, 2, 4, 6], yt: [2, 4, 6], grid: true, xl: 'x', yl: 'y' });
    const vArrow = (x0, y0, x1, y1, uu, col, name, mid) => { if (uu <= 0) return; grow(ax.X(x0), ax.Y(y0), ax.X(x1), ax.Y(y1), uu, col, { sw: 3.2 });
      if (uu > 0.95 && name) { if (mid) mono(ax.X((x0 + x1) / 2) + 10, ax.Y((y0 + y1) / 2) + 6, name, { 'font-size': 16, 'font-weight': 800, fill: col });
        else mono(ax.X(x1) + 8, ax.Y(y1) - 6, name, { 'font-size': 16, 'font-weight': 800, fill: col }); } };
    if (k >= 3) { vArrow(0, 0, 1, 2, k === 3 ? E(u, 0.8, 1.4) : 1, INK, 'a'); const sh = k === 4 ? E(u, 0.3, 1.1) : 0;
      vArrow(lerp(0, 1, sh), lerp(0, 2, sh), lerp(3, 4, sh), lerp(4, 6, sh), k === 3 ? E(u, 1.3, 1.9) : 1, INFO, 'b', k === 4); }
    if (k === 4) { vArrow(0, 0, 4, 6, E(u, 1.2, 1.9), ACC, null); mono(ax.X(4) - 12, ax.Y(6) - 4, 'c = a + b', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.9) }); }
    // 왼쪽: Vec2 두 칸과 식
    const av = k >= 3 ? ['1', '2'] : ['?', '?'], bv = k >= 3 ? ['3', '4'] : ['?', '?'];
    vec(260, 110, 'a', av, { s: k === 0 ? pop(u, 0.2) : 1, flips: k === 3 ? [['?', 0.4, u], ['?', 0.5, u]] : null });
    vec(260, 200, 'b', bv, { s: k === 0 ? pop(u, 0.4) : 1, noName: true, flips: k === 3 ? [['?', 0.6, u], ['?', 0.7, u]] : null });
    mono(70, 60, 'struct Vec2 { double x, y; };', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.1) : 1 });
    if (k === 0) { mono(260, 282, 'a + b', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, opacity: fade(u, 0.8) });
      tx(260, 314, '부를 함수가 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); cross(350, 272, 10, pop(u, 1.3));
      terminal(40, 334, 460, 82, ['error: invalid operands to binary', '       expression (\'Vec2\' and \'Vec2\')'], seg(u, 1.6, 2.4) * 2, { title: '컴파일러', fs: 13.5, lh: 18 }); }
    if (k >= 1) { const mv = k === 1 ? E(u, 0.4, 1.3) : 1;
      mono(260, lerp(290, 268, mv), 'a + b', { 'text-anchor': 'middle', 'font-size': lerp(30, 20, mv), 'font-weight': 800, fill: k === 1 ? INK : MUT });
      grow(260, 280, 260, 300, k === 1 ? seg(u, 1.2, 1.5) : 1, ACC);
      mono(260, 330, 'operator+(a, b)', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 1.4) : 1 });
      if (k === 1) tx(260, 362, '컴파일러가 이 함수 호출로 바꿔 부른다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); }
    if (k === 2) { el('line', { x1: 40, y1: 246, x2: 500, y2: 246, stroke: GRID, 'stroke-width': 1 });
      mono(70, 374, 'return { a.x + b.x, a.y + b.y };', { 'font-size': 15, fill: INK, opacity: fade(u, 0.3) });
      pill(420, 404, '새 Vec2 를 값으로', GOOD, pop(u, 1.2), { fs: 14 });
      dot([[222, 110], [222, 200]], seg(u, 0.6, 1.1), WARN, 6); dot([[298, 110], [298, 200]], seg(u, 0.8, 1.3), WARN, 6);
      tx(70, 409, 'a, b 는 const& 로 읽기만', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 4) { vec(260, 380 - 0, 'c', ['4', '6'], { s: pop(u, 1.4), col: ACC, stroke: ACC, valCol: ACC, noName: true }); }
    if (k === 4) terminal(380, 352, 180, 62, ['4, 6'], u > 2.1 ? 1 : 0, { lh: 20 }); }

  // ── 2. 멤버 vs 비멤버 — 왼쪽 자리는 누구 것인가 ─────────────────
  function s2(t, c) { const { k, u } = c, MY = 122, NY = 256;
    tx(170, MY - 56, '멤버  Vec2::operator+', { 'font-size': 15, 'font-weight': 800, fill: k >= 1 ? INK : MUT });
    tx(170, NY - 56, '비멤버  operator*', { 'font-size': 15, 'font-weight': 800, fill: k >= 2 ? INK : MUT });
    const empty = { n: '?', t: '' }, at = (a) => u >= a;
    // k3: a·b 가 멤버 자리에, 2.0·a 가 비멤버 자리에 들어간다 / k4: a·2.0 이 비멤버 자리에 맞지 않는다
    const mL = { n: '*this', t: 'Vec2 고정', fixed: true }, mR = { n: 'rhs', t: 'const Vec2&' }, nL = { n: 's', t: 'double' }, nR = { n: 'v', t: 'const Vec2&' };
    if (k === 3) { if (at(0.7)) mL.v = 'a'; if (at(0.9)) mR.v = 'b'; if (at(2.3)) nL.v = '2.0'; if (at(2.4)) nR.v = 'a'; }
    if (k === 4) { if (at(0.7)) Object.assign(nL, { v: 'a', vcol: BAD }); if (at(0.8)) Object.assign(nR, { v: '2.0', vcol: BAD }); }
    machine(400, MY, '+', k >= 1 ? mL : empty, k >= 1 ? mR : empty, { dash: k < 1 ? '6 5' : null, opCol: k >= 1 ? ACC : OFF });
    machine(400, NY, '*', k >= 2 ? nL : empty, k >= 2 ? nR : empty, { dash: k < 2 ? '6 5' : null, opCol: k >= 2 ? ACC : OFF });
    if (k === 1) { lock(188, MY - 24, true, INFO, pop(u, 0.8) * 0.7); tx(660, MY + 5, '인자는 rhs 하나뿐', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) }); }
    if (k === 2) tx(660, NY + 5, '두 자리 모두 인자', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
    const res = (x, y, s, col, op) => mono(x, y, s, { 'font-size': 15.5, 'font-weight': 800, fill: col, opacity: op });
    if (k === 3) { fly(60, MY, 270, MY, seg(u, 0.2, 0.7), 'a', { mono: true }); fly(60, MY, 530, MY, seg(u, 0.4, 0.9), 'b', { mono: true });
      if (u > 0.9) res(660, MY - 14, 'a.operator+(b)', GOOD, fade(u, 1.0));
      // 2.0 이 멤버 왼쪽 자리로 가다가 튕겨 나온다
      const go = seg(u, 1.1, 1.5), back = seg(u, 1.5, 1.9);
      if (go > 0 && back < 1) card(lerp(60, 160, E(go, 0, 1)) - lerp(0, 100, E(back, 0, 1)), MY + 52, 52, 28, { rx: 14, fill: BAD, stroke: 'none', text: '2.0', fs: 13.5, fw: 700, color: PANEL, mono: true });
      if (u > 1.5) { cross(170, MY + 52, 8, pop(u, 1.5)); res(660, MY + 16, '2.0 * a  멤버로는 불가', BAD, fade(u, 1.5)); }
      fly(60, NY, 270, NY, seg(u, 1.8, 2.3), '2.0', { mono: true }); fly(60, NY, 530, NY, seg(u, 1.9, 2.4), 'a', { mono: true });
      if (u > 2.4) res(660, NY + 5, 'operator*(2.0, a)', GOOD, fade(u, 2.4)); }
    if (k === 4) { fly(60, NY, 270, NY, seg(u, 0.2, 0.7), 'a', { mono: true, fill: BAD }); fly(60, NY, 530, NY, seg(u, 0.3, 0.8), '2.0', { mono: true, fill: BAD });
      if (u > 0.8) cross(400, NY - 52, 9, pop(u, 0.8)); res(660, NY + 5, 'a * 2.0  짝이 없다', BAD, fade(u, 0.9));
      machine(400, 370, '*', { n: 'v', t: 'const Vec2&' }, { n: 's', t: 'double' }, { dash: '6 5', s: pop(u, 1.4), stroke: GOOD, opCol: GOOD });
      tx(660, 375, '이 순서를 하나 더', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); } }

  // ── 3. 연산자마다 돌려주는 것 ───────────────────────────────
  function s3(t, c) { const { k, u } = c, AX = 220, AY = 150;
    const ops = ['+', '+=', '==', '[]', '()', 'main'];
    ops.forEach((o, i) => { const on = i === k, done = i < k; pill(90 + i * 120, 46, o === 'main' ? '확인' : o, on ? ACC : done ? INK : OFF, 1, { mono: true, fs: 15, fill: on ? ACCBG : PANEL }); });
    // a 의 상태: {1,2} → (+=) {4,6} → ([]) {10,6}
    const st = k <= 0 ? ['1', '2'] : k <= 2 ? ['4', '6'] : ['10', '6'];
    const flips = k === 1 ? [['1', 1.2, u], ['2', 1.3, u]] : k === 3 ? [['4', 1.5, u], null] : null;
    vec(AX, AY, 'a', k === 1 ? ['4', '6'] : k === 3 ? ['10', '6'] : st, { flips, stroke: (k === 1 && u > 1.2) || (k === 3 && u > 1.5) ? WARN : INK });
    vec(AX, AY + 100, 'b', ['3', '4'], { noName: true });
    if (k === 0) { vec(640, AY + 50, 'a + b', ['4', '6'], { s: pop(u, 1.0), col: ACC, stroke: ACC, valCol: ACC, noName: true });
      grow(320, AY + 50, 510, AY + 50, seg(u, 0.4, 1.0), ACC); mono(415, AY + 36, 'operator+', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 0.5) });
      tx(640, AY + 110, '새 객체를 값으로 · a, b 는 그대로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); }
    if (k === 1) { dot([[AX, AY + 78], [AX, AY + 22]], seg(u, 0.3, 0.9), WARN, 7);
      arc(AX + 80, AY - 10, AX - 40, AY - 26, seg(u, 1.5, 2.1), INFO, { lift: 50 }); mono(AX + 120, AY - 64, 'return *this;  자기 자신을 참조로', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) });
      mono(560, 300, 'g += h += k;', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); mono(560, 326, '→ g {3, 4}, h {2, 2}', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
      tx(560, 352, '({1,2} {1,1} {1,1} 로 실행한 결과)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 2) { [[AX - 38, '==', 0.4], [AX + 38, '==', 0.9]].forEach(([x, s, a]) => { dot([[x, AY + 22], [x, AY + 78]], seg(u, a, a + 0.4), INFO, 6); mono(x, AY + 56, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, a) }); });
      pill(560, AY + 50, 'bool', INFO, pop(u, 1.5), { mono: true, fs: 16 }); lock(AX + 110, AY, true, MUT, pop(u, 1.8) * 0.7); lock(AX + 110, AY + 100, true, MUT, pop(u, 1.8) * 0.7);
      tx(560, AY + 100, 'const: 비교는 아무것도 바꾸지 않는다', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.0) }); }
    if (k === 3) { mono(560, AY - 40, 'a[0] = 10;', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.2) });
      arc(560, AY - 30, AX - 38, AY - 24, seg(u, 0.5, 1.0), ACC, { lift: 40 }); mono(560, AY + 6, 'double& — x 칸 그 자체', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      fly(560, AY - 40, AX - 38, AY, seg(u, 1.0, 1.5), '10', { fill: WARN, mono: true });
      tx(560, AY + 60, '참조를 돌려주니 왼쪽에 쓸 수 있다', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 1.8) }); }
    if (k === 4) { card(640, AY + 40, 380, 130, { rx: 12, stroke: ACC, sw: 2.2, s: pop(u, 0.3) });
      mono(640, AY + 14, 'a(s)', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      mono(640, AY + 52, 's × (x² + y²)', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(640, AY + 86, '길이의 제곱에 s 를 곱한다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      tx(640, AY + 140, 'x, y 를 품은 함수 객체(functor)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 1.7) }); }
    if (k === 5) { [['a += b', '{4, 6}'], ['a[0] = 10', '{10, 6}'], ['a == b', 'false']].forEach(([e, r], i) => { const y = 112 + i * 56, op = fade(u, 0.3 + i * 0.5);
        mono(520, y, e, { 'font-size': 18, 'font-weight': 700, opacity: op }); mono(700, y, '→ ' + r, { 'font-size': 18, 'font-weight': 800, fill: i === 2 ? BAD : ACC, opacity: op }); });
      pill(640, 300, '< 까지 있으면 정렬·set 키로 쓴다', INFO, pop(u, 1.9), { fs: 14 }); }
    const lines = [['Vec2 operator+(const Vec2&) const;'], ['Vec2& operator+=(const Vec2& r) {', '    x += r.x; y += r.y; return *this; }'], ['bool operator==(const Vec2& r) const {', '    return x == r.x && y == r.y; }'],
      ['double& operator[](int i) {', '    return i == 0 ? x : y; }'], ['double operator()(double s) const {', '    return s * (x * x + y * y); }'], ['a += b;  a[0] = 10;', 'bool same = (a == b);']][k];
    snippet(40, 330, lines, { fs: 14 }); }

  // ── 4. 스트림 << ─────────────────────────────────────────
  function s4(t, c) { const { k, u } = c, CX = 120, CY = 160, SX = 800;
    // cout 상자와 콘솔
    card(CX, CY, 150, 70, { rx: 10, stroke: INK, sw: 2.4, text: 'cout', fs: 20, mono: true, fw: 800 }); sub(CX, CY + 54, 'std::ostream', 1, { class: 'mono' });
    el('rect', { x: SX - 120, y: CY - 50, width: 240, height: 100, rx: 10, fill: INK });
    mono(SX - 106, CY - 26, '콘솔', { 'font-size': 13.5, fill: OFF });
    const printed = k < 2 ? '' : k === 2 ? '(1, 2)'.slice(0, Math.round(6 * E(u, 0.6, 1.9))) : k === 3 ? '(1, 2)' : ['(1, 2)', '(1, 2) and ', '(1, 2) and (3, 4)'][Math.min(2, Math.floor(seg(u, 0.4, 2.2) * 3))];
    mono(SX - 106, CY + 10, printed, { 'font-size': 16, fill: 'var(--term)', 'font-weight': 700 });
    if (k === 0) { card(400, CY, 80, 56, { rx: 10, text: 'v', fs: 20, mono: true, fw: 800, s: pop(u, 0.3) }); mono(470, CY + 7, '<<', { 'font-size': 24, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      card(560, CY, 100, 56, { rx: 10, text: 'cout', fs: 18, mono: true, fw: 800, s: pop(u, 0.6) }); cross(480, CY - 48, 10, pop(u, 1.1));
      tx(480, CY + 62, '멤버라면 v << cout 이 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      pill(480, 300, 'friend: private 을 읽도록 허락', INFO, pop(u, 1.8), { fs: 14 }); }
    if (k >= 1) { const sL = { n: 'os', t: 'std::ostream&' }, sR = { n: 'v', t: 'const Vec2&' }; if (k === 1 && u >= 1.4) sL.v = 'cout'; if (k === 1 && u >= 1.6) sR.v = 'a';
      machine(440, 300, '<<', sL, sR, { s: k === 1 ? pop(u, 0.2) : 1 });
      if (k === 1) { fly(CX, CY, 310, 300, seg(u, 0.8, 1.4), 'cout', { mono: true }); fly(440, 60, 570, 300, seg(u, 1.0, 1.6), 'a', { mono: true });
        mono(440, 380, 'operator<<(cout, a)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); } }
    if (k === 2) { ['(', '1', ', ', '2', ')'].forEach((p, i) => fly(440, 260, SX - 60, CY, seg(u, 0.4 + i * 0.28, 0.8 + i * 0.28), p, { mono: true, fill: WARN }));
      mono(440, 112, 'os << "(" << v.x << ", " << v.y << ")"', { 'text-anchor': 'middle', 'font-size': 14.5, fill: INK, opacity: fade(u, 0.2) }); }
    if (k === 3) { arc(440, 262, CX + 20, CY + 36, seg(u, 0.3, 1.1), GOOD, { lift: 50 }); mono(240, 376, 'return os;', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
      tx(350, 376, '(cout << a) 의 결과는 cout 자신', { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: fade(u, 1.3) });
      tx(440, 404, 'ostream 은 복사가 막혀 있어 값으로는 돌려줄 수 없다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); }
    if (k === 4) { const parts = ['a', '" and "', 'b'];
      parts.forEach((p, i) => { const a = 0.4 + i * 0.6; dot([[CX + 75, CY], [SX - 120, CY]], seg(u, a, a + 0.5), i === 1 ? MUT : ACC, 7);
        mono(300 + i * 120, 106, p, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, a) });
        if (i < 2) arc(300 + i * 120 + 30, 92, CX + 30, CY - 36, seg(u, a + 0.35, a + 0.6), GOOD, { lift: 20, op: 0.7 }); });
      mono(440, 72, '(((cout << a) << " and ") << b)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.1) }); }
  }

  // ── 5. 우주선 <=> ─────────────────────────────────────────
  function s5(t, c) { const { k, u } = c, six = ['==', '!=', '<', '<=', '>', '>='];
    const slot = (i) => [560 + (i % 3) * 120, 110 + Math.floor(i / 3) * 70];
    if (k === 0) { six.forEach((o, i) => { const [x, y] = slot(i), s = pop(u, 0.2 + i * 0.15);
        card(x, y, 100, 52, { rx: 10, text: 'operator' + o, fs: 13.5, mono: true, fw: 700, stroke: i === 1 ? BAD : INK, dash: i === 1 ? '5 4' : null, s }); });
      tx(680, 228, '여섯 개를 손으로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.3) });
      tx(680, 254, '하나라도 어긋나면 조용한 버그', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) });
      mono(70, 120, '#include <compare>', { 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    // Money
    tx(70, 74, 'struct Money', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    cellBox(130, 130, { name: 'won', val: 'int', w: 100, s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) tx(70, 196, '멤버를 선언한 순서대로 비교한다', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 0.8) });
    if (k >= 2) { card(330, 130, 120, 70, { rx: 14, stroke: ACC, sw: 2.6, fill: ACCBG, s: k === 2 ? pop(u, 0.2) : 1 }); mono(330, 140, '<=>', { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: ACC });
      mono(330, 196, '= default', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC });
      [2, 3, 4, 5].forEach((i, j) => { const [x, y] = slot(i), a = 0.6 + j * 0.25, f = k === 2 ? seg(u, a, a + 0.5) : 1;
        if (f > 0 && f < 1) fly(390, 130, x, y, f, six[i], { mono: true }); if (f >= 1) card(x, y, 100, 52, { rx: 10, text: six[i], fs: 18, mono: true, fw: 800, stroke: ACC, fill: ACCBG }); });
      if (k === 2) mono(330, 240, 'int → strong_ordering', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); }
    if (k >= 3) { [0, 1].forEach((i, j) => { const [x, y] = slot(i), a = 0.4 + j * 0.35, f = k === 3 ? seg(u, a, a + 0.5) : 1;
        if (f > 0 && f < 1) fly(390, 130, x, y, f, six[i], { mono: true, fill: GOOD }); if (f >= 1) card(x, y, 100, 52, { rx: 10, text: six[i], fs: 18, mono: true, fw: 800, stroke: GOOD, fill: GOODBG }); });
      if (k === 3) { tx(70, 270, '<=> 를 default 로 두면 == 도 함께 default 가 된다', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
        tx(70, 296, '== 를 직접 적어도 같은 것, != 는 == 에서 따라온다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); } }
    if (k === 4) { const ax = axes(80, 280, 380, 20, { x: [0, 2500], y: [0, 1], xt: [0, 1000, 2000] });
      [[1000, 'a'], [2000, 'b']].forEach(([v, n], i) => { el('circle', { cx: ax.X(v), cy: 300, r: 8 * pop(u, 0.2 + i * 0.2), fill: i ? INFO : ACC }); mono(ax.X(v), 282, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: i ? INFO : ACC, opacity: fade(u, 0.3 + i * 0.2) }); });
      terminal(560, 280, 360, 130, ['$ ./a.out', '1   ← a < b', '0   ← a >= b', '0   ← a == b'], 1 + seg(u, 0.8, 1.2) + seg(u, 1.3, 1.7) + seg(u, 1.8, 2.2), { title: '출력' }); } }

  // ── 6. 실무 실패 사례 ────────────────────────────────────────
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { tx(60, 72, '스택', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const gone = k === 0 ? seg(u, 1.1, 1.6) > 0.5 : true;
      zone(60, 86, 400, 110, null, { fill: gone ? SOFT : PANEL, stroke: gone ? OFF : INK, sw: 2, dash: gone ? '6 5' : null });
      mono(76, 110, k === 0 ? (gone ? 'badAdd() 끝 · 칸 해제' : 'badAdd()') : 'operator+() 끝', { 'font-size': 14, 'font-weight': 700, fill: gone ? MUT : INK });
      vec(300, 150, 't', gone && k === 0 ? ['??', '??'] : ['4', '6'], { noName: true, stroke: gone && k === 0 ? BAD : k === 1 && gone ? OFF : INK, valCol: gone && k === 0 ? BAD : k === 1 ? MUT : INK });
      zone(60, 214, 400, 110, null, { fill: PANEL, stroke: INK, sw: 2 }); mono(76, 238, 'main()', { 'font-size': 14, 'font-weight': 700 });
      if (k === 0) { card(170, 280, 120, 34, { rx: 8, text: 'Vec2& c', fs: 15, mono: true, fw: 800, stroke: gone ? BAD : ACC, fill: gone ? BADBG : ACCBG, s: pop(u, 0.3) });
        arc(200, 263, 290, 172, seg(u, 0.5, 1.0), gone ? BAD : ACC, { lift: 20 });
        tx(260, 360, '죽은 칸을 가리키는 참조 (UB)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
        snippet(520, 120, ['Vec2& badAdd(...) {', '    Vec2 t{ ... };', '    return t;   // t 는 곧 파괴'], { fs: 14 }); }
      if (k === 1) { fly(300, 150, 300, 276, seg(u, 0.3, 0.9), '{4, 6}', { mono: true, fill: GOOD });
        if (u > 0.9) vec(300, 276, 'c', ['4', '6'], { noName: true, stroke: GOOD, s: pop(u, 0.9) });
        tx(260, 360, '값이 호출한 쪽 칸으로 나온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
        snippet(520, 120, ['Vec2 operator+(const Vec2& a,', '               const Vec2& b) {', '    return { a.x + b.x, a.y + b.y };', '}'], { fs: 14 });
        tx(520, 260, '복사는 컴파일러가 대부분 생략한다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 2) { const sL = { n: 's', t: 'double' }, sR = { n: 'v', t: 'const Vec2&' }; if (u >= 1.1) sL.v = '2.0'; if (u >= 1.3) sR.v = 'a';
      machine(420, 150, '*', sL, sR, { s: pop(u, 0.2) });
      fly(80, 150, 290, 150, seg(u, 0.6, 1.1), '2.0', { mono: true }); fly(80, 150, 550, 150, seg(u, 0.8, 1.3), 'a', { mono: true });
      if (u > 1.3) check(420, 96, 11, pop(u, 1.3));
      mono(420, 240, 'Vec2 d = 2.0 * a;', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      tx(420, 280, '왼쪽이 double 이어도 비멤버면 받아 준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(420, 306, 'a * 2.0 까지 되려면 (Vec2, double) 짝을 하나 더 둔다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    const P = (c.beat.pitfalls || []).slice(0, 4), short = ['참조 반환', '== 만 있고 != 없음', '비대칭', '뜻을 배신하는 남용'];
    P.forEach((p, i) => { const cx = 250 + (i % 2) * 460, cy = 112 + Math.floor(i / 2) * 150, s = pop(u, 0.2 + i * 0.3), op = fade(u, 0.3 + i * 0.3);
      card(cx, cy, 420, 128, { rx: 12, stroke: GRID, sw: 1.6, s });
      tx(cx - 192, cy - 36, (i + 1) + '. ' + short[i], { 'font-size': 16, 'font-weight': 800, opacity: op });
      cross(cx - 182, cy - 4, 7, op); mono(cx - 166, cy + 1, p.bad.length > 40 ? p.bad.slice(0, 38) + '…' : p.bad, { 'font-size': 13.5, fill: BAD, opacity: op });
      check(cx - 182, cy + 28, 7, op); mono(cx - 166, cy + 33, p.fix.length > 40 ? p.fix.slice(0, 38) + '…' : p.fix, { 'font-size': 13.5, fill: GOOD, opacity: op }); });
    tx(480, 400, '연산자는 원래 뜻을 배신하지 않는 선에서만', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: 'Vec2 a, b에 대해 c = a + b라고 쓰면 실제로 일어나는 일은 무엇인가?',
      o: ['컴파일러가 x, y를 알아서 더한다', '컴파일러가 operator+(a, b) 함수 호출로 바꿔 부른다', 'a의 값이 b 만큼 바뀐다'], a: 1,
      why: '+ 는 문법 설탕이다. 우리가 쓴 operator+ 가 돌아 {1,2} + {3,4}가 {4,6}이 된다.' },
    { q: '2.0 * a를 지원하려면 operator* 를 어디에 둬야 하는가?',
      o: ['Vec2 밖의 비멤버 함수', 'Vec2의 멤버 함수', 'double의 멤버 함수'], a: 0,
      why: '멤버 연산자는 왼쪽 자리가 *this로 고정된다. 왼쪽이 double이면 비멤버만 받을 수 있다.' },
    { q: 'operator+= 가 Vec2& 를 돌려주는 이유는 무엇인가?',
      o: ['새 객체를 만들어야 해서', '참조가 값보다 항상 빨라서', '자기 자신을 돌려줘 a += b += c 같은 연쇄가 되게 하려고'], a: 2,
      why: '+= 는 자기 자신을 고치고 *this를 참조로 돌려준다. 반대로 + 는 새 값을 만들어 값으로 돌려준다.' },
    { q: 'operator<< 가 std::ostream& 를 돌려줘야 하는 이유는 무엇인가?',
      o: ['돌려받은 cout에 다음 << 를 이어 붙이기 위해', '출력 속도를 높이기 위해', 'Vec2를 수정하기 위해'], a: 0,
      why: 'cout << a << b는 (cout << a) << b로 풀린다. 앞의 결과가 cout 자신이어야 다음 << 가 이어진다.' },
    { q: 'auto operator<=>(const Money&) const = default; 한 줄로 얻지 못하는 것은 무엇인가?',
      o: ['a < b', 'a >= b', 'won을 거꾸로 비교하는 특별한 규칙'], a: 2,
      why: '= default는 멤버를 선언 순서대로 비교하는 규칙만 만든다. 다른 규칙이 필요하면 직접 구현한다.' },
    { q: 'Vec2& badAdd(...) { Vec2 t{...}; return t; }의 문제는 무엇인가?',
      o: ['함수가 끝나면 t가 파괴되어 죽은 칸을 가리킨다', 't가 너무 커서 느리다', '참조는 struct에 쓸 수 없다'], a: 0,
      why: '지역 객체 t는 함수가 끝나며 사라진다. 새 값을 만드는 연산자는 값으로 돌려줘야 안전하다.' },
  ];

  const summary = [
    'a + b는 컴파일러가 operator+(a, b) 호출로 바꿔 부르는 평범한 함수다.',
    '멤버 연산자는 왼쪽 자리가 자기 자신이라, 2.0 * a처럼 왼쪽이 남의 타입이면 비멤버로 둔다.',
    '+는 새 값을 값으로, +=와 []는 자기 칸을 참조로, ==는 const로 bool을 돌려준다.',
    '<<는 ostream&를 돌려줘 연쇄를 잇고, C++20 <=> = default 한 줄이 비교 여섯 개를 채운다.',
  ];
  const review = [
    { q: 'Vec2에 operator* 를 멤버로 만들었더니 a * 2.0은 되는데 2.0 * a가 컴파일되지 않는다. 고칠 방법은 무엇인가?',
      o: ['비멤버 operator*(double, const Vec2&)를 추가한다', '멤버 operator* 를 const로 바꾼다', '2.0을 float로 바꾼다'], a: 0,
      why: '멤버 연산자의 왼쪽 자리는 *this로 고정이다. 왼쪽에 double이 오는 순서는 비멤버 함수만 받을 수 있다.' },
    { q: 'operator<< 를 직접 만들었는데 cout << a << b에서 컴파일 에러가 난다. 먼저 볼 곳은 어디인가?',
      o: ['Vec2의 멤버 변수 이름', 'operator<< 의 반환 타입이 std::ostream& 인지', '#include <compare> 가 있는지'], a: 1,
      why: '연쇄는 앞의 결과에 다음 << 를 붙인다. 반환이 void 이거나 값이면 이어 붙일 cout이 없거나 복사가 막혀 깨진다.' },
    { q: '구조체에 비교 연산자 여섯 개를 손으로 써 뒀더니 a != b와 !(a == b) 결과가 다른 버그가 났다. C++20에서 가장 간단한 해결은 무엇인가?',
      o: ['operator!= 만 다시 쓴다', '비교를 모두 멤버가 아닌 함수로 옮긴다', 'auto operator<=>(const T&) const = default; 로 바꾼다'], a: 2,
      why: '= default로 두면 컴파일러가 같은 규칙에서 모든 비교를 만들어 서로 어긋날 수 없다. == 도 함께 default가 된다.' },
  ];

  R.page({ title: '연산자는 함수 호출이다', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
