/* I-1-1 전통 DB vs 벡터 DB — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 행이 쌓인 표와 B-Tree(장면 1) → 단어가 점이 되는 2D 공간(장면 2) → apple 기준 각도(장면 3)
 *       → 그래프를 따라가는 top-k 검색(장면 4) → 같은 질문을 두 DB가 어떻게 푸는지(장면 5).
 * 숫자: 페이지 STEPS 데이터와 코드 주석. 임베딩 값·유사도는 API 출력이라 다시 돌릴 수 없는 예시 값이다.
 *       장면 3의 각도는 cos 값에서 바로 구한 것(θ = arccos(sim))이고 apple 기준 각도만 맞췄다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, dbIcon, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const typed = (s, u, a, d) => { const n = Math.round(s.length * clamp((u - a) / d)); return s.slice(0, n); };
  // 결정적인 의사 난수 (같은 그림을 매번 같게)
  function rnd(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  // ---------- 장면 1. 전통 DB: 표 + B-Tree ----------
  const TB = { x: 40, y: 150, iw: 64, nw: 190, rh: 36 };
  function sqlBox(q, u, typing, note) {
    el('rect', { x: 28, y: 16, width: 524, height: 86, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    const lines = String(q || '').split('\n');
    const all = lines.join('\n'), shown = typing ? typed(all, u, 0.1, 1.0) : all;
    shown.split('\n').forEach((s, i) => R.spans(46, 50 + i * 26, R.tokens(s), { 'font-size': 15 }));
    if (note) tx(TB.x, 130, note, { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: typing ? fade(u, 1.2) : 1 });
  }
  function table(rows, o) { o = o || {}; const { x, y, iw, nw, rh } = TB, hw = o.headW ?? 1;
    el('rect', { x, y, width: (iw + nw) * hw, height: rh - 4, rx: 6, fill: INK });
    if (hw > 0.5) { tx(x + 14, y + 22, 'id', { 'font-size': 15, 'font-weight': 700, fill: PANEL, class: 'mono' }); tx(x + iw + 14, y + 22, 'name', { 'font-size': 15, 'font-weight': 700, fill: PANEL, class: 'mono' }); }
    rows.forEach((r, i) => { const yy = y + (i + 1) * rh, s = o.rowOp ? o.rowOp(i) : 1; if (s <= 0.01) return;
      const st = o.style ? o.style(i, r) : {};
      el('rect', { x, y: yy, width: iw + nw, height: rh - 4, rx: 6, fill: st.fill || PANEL, stroke: st.stroke || GRID, 'stroke-width': st.sw || 1.5, 'stroke-dasharray': st.dash, opacity: s });
      mono(x + 14, yy + 22, String(r.id), { 'font-size': 15, fill: MUT, opacity: s });
      const nm = o.typeName ? o.typeName(i, r.name) : r.name;
      if (st.hiPart) { R.spans(x + iw + 14, yy + 22, st.hiPart, { 'font-size': 15, opacity: s }); }
      else mono(x + iw + 14, yy + 22, nm, { 'font-size': 15, 'font-weight': 600, fill: st.color || INK, opacity: s });
      if (st.mark) { const mx = x + iw + nw + 22;
        if (st.mark === 'hit') { check(mx, yy + 15, 8, st.markS ?? 1); tx(mx + 16, yy + 21, 'HIT', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: st.markS ?? 1 }); }
        else { cross(mx, yy + 15, 7, st.markS ?? 1); tx(mx + 16, yy + 21, st.mark, { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: st.markS ?? 1 }); } } });
    if (o.empty) { el('rect', { x, y: y + rh, width: iw + nw, height: rh * 2, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '5 5', opacity: o.empty });
      tx(x + (iw + nw) / 2, y + rh * 2 + 5, '행 0개', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: o.empty }); } }
  // B-Tree: 뿌리 [computer | laptop], 잎 [apple, banana] [computer, grape] [laptop, orange]
  const BT = { rx: 765, ry: 150, ly: 262, lx: [640, 765, 890], keys: [['apple', 'banana'], ['computer', 'grape'], ['laptop', 'orange']] };
  function btree(o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1;
    if (s <= 0.01) return;
    tx(BT.rx, 104, 'idx_fruits_name · B-Tree', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: o.dim ? OFF : INK, opacity: op });
    const g = R.G(BT.rx, BT.ry, s, op); el('rect', { x: -110, y: -18, width: 220, height: 36, rx: 7, fill: PANEL, stroke: o.dim ? OFF : INK, 'stroke-width': 2 }, g);
    el('line', { x1: 0, y1: -18, x2: 0, y2: 18, stroke: GRID, 'stroke-width': 1.5 }, g);
    ['computer', 'laptop'].forEach((k, i) => tx(i ? 55 : -55, 6, k, { 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono', fill: o.dim ? OFF : INK, opacity: o.keys ?? 1 }, g));
    BT.lx.forEach((x, i) => { const e = o.edge ?? 1; R.grow(BT.rx + (i - 1) * 90, BT.ry + 18, x, BT.ly - 34, e, o.dim ? OFF : MUT, { plain: true });
      const gl = R.G(x, BT.ly, o.leafS ? o.leafS(i) : 1, op); el('rect', { x: -56, y: -34, width: 112, height: 68, rx: 7, fill: o.hiLeaf === i ? GOODBG : PANEL, stroke: o.hiLeaf === i ? GOOD : o.dim ? OFF : INK, 'stroke-width': 2 }, gl);
      BT.keys[i].forEach((k, j) => { const ks = o.keyOp ? o.keyOp(i, j) : 1; if (ks > 0.01) tx(0, -8 + j * 26, k, { 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono', 'font-weight': o.hiKey === k ? 800 : 500, fill: o.hiKey === k ? GOOD : o.dim ? OFF : INK, opacity: ks }, gl); }); });
    sub(BT.rx, 330, '정렬된 글자 순서로만 나뉜다', o.note ?? 0, { 'font-size': 14 }); }
  const ORDER = { apple: [0, 0], banana: [0, 1], computer: [1, 0], grape: [1, 1], laptop: [2, 0], orange: [2, 1] };

  function s1(t, c) { const { k, u } = c, b = c.beat, rows = b.rows;
    sqlBox(b.sqlQuery, u, true, b.sqlNote);
    if (k === 0) { table(rows, { headW: E(u, 0.3, 1.2), rowOp: () => 0, empty: fade(u, 1.4) }); return; }
    // B-Tree 는 k1 에 뼈대만 생기고, k2 에 행이 들어오며 키가 잎에 떨어진다
    const keyOp = k === 1 ? () => 0 : k === 2 ? (i, j) => { const n = rows.findIndex((r) => r.name === BT.keys[i][j]); return fade(u, 0.3 + n * 0.3); } : () => 1;
    if (k === 1) { table(rows, { rowOp: () => 0, empty: 1 });
      btree({ s: pop(u, 0.2), edge: E(u, 0.7, 1.3), leafS: (i) => pop(u, 1.0 + i * 0.25), keys: fade(u, 0.5), keyOp, note: fade(u, 1.8) });
      return; }
    if (k === 2) { table(rows, { rowOp: (i) => fade(u, 0.2 + i * 0.3, 0.3), typeName: (i, s) => typed(s, u, 0.2 + i * 0.3, 0.3) });
      btree({ keyOp, note: 1 }); mono(TB.x + 290, 404, '6 rows', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { const hitS = fade(u, 1.7);
      btree({ hiLeaf: u > 1.0 ? 0 : null, hiKey: u > 1.0 ? 'apple' : null });
      dot([[BT.rx - 55, BT.ry], [BT.lx[0], BT.ly - 34], [BT.lx[0] - 30, BT.ly - 8]], seg(u, 0.2, 1.0), ACC, 7);
      fly(BT.lx[0] - 60, BT.ly - 8, TB.x + 200, TB.y + TB.rh + 16, seg(u, 1.0, 1.7), 'apple', { mono: true });
      table(rows, { style: (i, r) => r.hit ? { fill: hitS > 0.5 ? GOODBG : PANEL, stroke: hitS > 0.5 ? GOOD : GRID, sw: 2, mark: 'hit', markS: hitS } : {} });
      sub(BT.rx, 330, 'computer보다 앞 → 왼쪽 잎 → apple', fade(u, 0.6), { 'font-size': 14 }); return; }
    if (k === 4) { // LIKE '%app%' — 앞에 %가 있어 B-Tree를 못 타고 행을 하나씩 훑는다
      btree({ dim: true, op: 0.55 }); tx(BT.rx, 384, "앞이 '%'라 정렬 순서를 못 쓴다", { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      const scan = lerp(0, 6, E(u, 0.3, 2.2));
      el('rect', { x: TB.x - 8, y: TB.y + TB.rh * (1 + Math.min(5.6, scan)) - 4, width: TB.iw + TB.nw + 16, height: 4, rx: 2, fill: WARN, opacity: scan < 6 ? 1 : 0 });
      table(rows, { style: (i, r) => { const seen = scan > i + 0.6, ms = seen ? 1 : 0;
        if (r.hit) return { fill: GOODBG, stroke: GOOD, sw: 2, mark: 'hit', hiPart: [['app', { fill: GOOD, 'font-weight': 800, 'text-decoration': 'underline' }], ['le', { 'font-weight': 600 }]] };
        if (r.miss) return { stroke: seen ? BAD : GRID, dash: seen ? '5 4' : null, mark: 'miss', markS: ms };
        return { color: seen ? MUT : INK }; } });
      return; }
    // k5: 의미 질문에는 답이 없다
    btree({ dim: true, op: 0.5 });
    table(rows, { style: (i, r) => r.hit ? { fill: GOODBG, stroke: GOOD, sw: 2, mark: 'hit' } : r.miss ? { stroke: BAD, dash: '5 4', mark: 'miss' } : {} });
    const s = pop(u, 0.3); card(BT.rx, 384, 330, 44, { rx: 22, fill: WARNBG, stroke: WARN, text: '"사과 비슷한 단어는?"', fs: 15.5, color: WARN, s });
    tx(BT.rx, 330, '글자가 같은가만 물을 수 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
    cross(BT.rx + 150, 384, 10, pop(u, 1.6)); }

  // ---------- 장면 2·4 공용: 2D 로 줄여 본 의미 공간 ----------
  // 페이지의 2D 좌표(points.x 0~360, y 0~240)를 무대 위 판으로 옮긴다
  function plane(x, y, w, h, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: SOFT, stroke: o.dash ? OFF : GRID, 'stroke-width': 1.5, 'stroke-dasharray': o.dash ? '6 5' : null });
    if (o.title) tx(x + 14, y + 24, o.title, { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    const sx = o.sx || w / 400, sy = o.sy || h / 270, ox = o.ox ?? 0, oy = o.oy ?? 0;
    return { P: (px, py) => [x + (px - ox) * sx, y + (py - oy) * sy] }; }
  const FRUIT = new Set(['apple', 'orange', 'banana', 'grape']);
  function wordDot(p, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return; const [x, y] = p, col = o.col || (o.fruit ? GOOD : INFO);
    el('circle', { cx: x, cy: y, r: 8 * s, fill: o.hit ? col : PANEL, stroke: col, 'stroke-width': 2.5 });
    if (o.label) tx(x + (o.dx ?? 13), y + (o.dy ?? -10), o.label, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: o.lop ?? clamp(s), 'text-anchor': o.anchor }); }
  const LBL = { apple: [-12, -12, 'end'], orange: [12, -12], banana: [-12, 20, 'end'], grape: [12, 20], computer: [-12, 22, 'end'], laptop: [12, -12] };

  // ---------- 장면 2. 벡터화 ----------
  const VEC = { apple: [0.21, 0.84, -0.13, 0.07], orange: [0.19, 0.81, -0.10, 0.05], banana: [0.24, 0.79, -0.18, 0.11],
    grape: [0.22, 0.83, -0.15, 0.09], computer: [-0.42, 0.11, 0.67, -0.55], laptop: [-0.40, 0.13, 0.65, -0.51] };   // vector.py 주석 (예시 값)
  const WORDS = ['apple', 'orange', 'banana', 'grape', 'computer', 'laptop'];
  const MODEL = [330, 190];
  function model(s, o) { o = o || {}; const g = card(MODEL[0], MODEL[1], 190, 84, { rx: 12, fill: ACCBG, stroke: ACC, sw: 2.5, s });
    tx(0, -8, '임베딩 모델', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: ACC }, g);
    tx(0, 16, 'text-embedding-3-small', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: INK }, g);
    if (o.client) tx(MODEL[0], MODEL[1] + 66, 'client = OpenAI()', { 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono', fill: MUT, opacity: o.client }); }
  function s2(t, c) { const { k, u } = c, pts = c.beat.points;
    const pl = plane(520, 34, 410, 350, { title: '1536차원을 2D로 줄여 본 공간', dash: k < 3, ox: 60, oy: 30, sx: 1.35, sy: 1.45 });
    const at = (id) => { const p = pts.find((q) => q.id === id); return pl.P(p.x, p.y); };
    if (k === 0) { model(pop(u, 0.3), { client: fade(u, 0.9) }); tx(725, 216, '벡터 0개', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 1.2) }); return; }
    if (k === 1) { model(1, { client: 1 });
      fly(70, MODEL[1], MODEL[0] - 80, MODEL[1], seg(u, 0.2, 0.9), 'apple', { mono: true });
      const v = VEC.apple, cells = v.map((x) => x.toFixed(2)).concat(['…']);
      R.cells(190, 310, cells, { w: 62, h: 40, gap: 6, fs: 15, style: (i) => ({ s: pop(u, 1.0 + i * 0.15), stroke: i < 4 ? ACC : OFF, color: i < 4 ? INK : MUT }) });
      grow(MODEL[0], MODEL[1] + 44, MODEL[0], 300, E(u, 0.9, 1.2), ACC);
      mono(190, 384, 'len(vector) == 1536', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
      tx(725, 216, '벡터 0개', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT }); return; }
    // 단어 목록 (왼쪽)
    const wy = (i) => 60 + i * 56;
    if (k <= 3) { model(1);
      WORDS.forEach((w, i) => { const s = k === 2 ? pop(u, 0.2 + i * 0.25) : 1; if (s > 0.01) pill(90, wy(i), w, FRUIT.has(w) ? GOOD : INFO, s, { mono: true, fs: 15 }); });
      if (k === 2) { mono(40, 400, 'words = 6개', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) }); return; }
      WORDS.forEach((w, i) => { const a = 0.15 + i * 0.32, p = at(w), f = FRUIT.has(w);
        fly(150, wy(i), MODEL[0] - 120, MODEL[1], seg(u, a, a + 0.35), w, { mono: true, fill: f ? GOOD : INFO });
        fly(MODEL[0] + 70, MODEL[1], p[0], p[1], seg(u, a + 0.35, a + 0.75), '[…]', { mono: true, fill: f ? GOOD : INFO });
        const l = LBL[w]; wordDot(p, { fruit: f, s: pop(u, a + 0.75), label: w, dx: l[0], dy: l[1], anchor: l[2] }); });
      return; }
    // k4·k5: 앞 4개 차원 표 + 공간
    WORDS.forEach((w) => { const p = at(w), l = LBL[w]; wordDot(p, { fruit: FRUIT.has(w), label: w, dx: l[0], dy: l[1], anchor: l[2] }); });
    if (k === 4) { const m = WORDS.map((w) => VEC[w]);
      const rowsShown = Math.ceil(lerp(0, 6, E(u, 0.2, 1.6)));
      R.heat(150, 70, m.slice(0, rowsShown), 50, { max: 0.84, rows: WORDS.slice(0, rowsShown), cols: ['d1', 'd2', 'd3', 'd4'], fmt: (v) => v.toFixed(2), fs: 14 });
      tx(150, 400, '앞 4개 차원 (예시 값)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      if (u > 1.8) { el('rect', { x: 146, y: 66, width: 204, height: 202, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
        el('rect', { x: 146, y: 266, width: 204, height: 104, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 2.1) }); }
      return; }
    // k5: 묶음과 거리
    const a = at('apple'), o = at('orange'), cp = at('computer');
    el('ellipse', { cx: 660, cy: 162, rx: 92 * E(u, 0.2, 0.9), ry: 66 * E(u, 0.2, 0.9), fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
    el('ellipse', { cx: 838, cy: 278, rx: 70 * E(u, 0.5, 1.2), ry: 50 * E(u, 0.5, 1.2), fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
    grow(a[0], a[1], o[0], o[1], E(u, 1.0, 1.5), GOOD, { plain: true, sw: 3 });
    grow(a[0], a[1], cp[0], cp[1], E(u, 1.4, 2.1), BAD, { plain: true, sw: 3, dash: '7 5' });
    tx(250, 150, '가깝다 = 뜻이 비슷하다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
    tx(250, 190, '멀다 = 뜻이 다르다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
    tx(250, 260, 'Semantic Embedding', { 'text-anchor': 'middle', 'font-size': 16, class: 'mono', fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // ---------- 장면 3. 코사인: apple 기준 각도 ----------
  // apple 은 위(90°). 다른 단어는 θ = arccos(sim) 만큼 기울인다. 길이는 뜻이 없어서 일부러 다르게 둔다
  const SIM = [['orange', 0.85, -1, 250], ['grape', 0.81, 1, 200], ['banana', 0.78, -1, 175], ['computer', 0.12, -1, 235], ['laptop', 0.10, 1, 215]];
  const O = [300, 372];
  function arrowTo(ang, len, u, col, sw) { const r = ang * Math.PI / 180; grow(O[0], O[1], O[0] + Math.cos(r) * len, O[1] - Math.sin(r) * len, u, col, { sw: sw || 3 }); return [O[0] + Math.cos(r) * len, O[1] - Math.sin(r) * len]; }
  function arc(a0, a1, r, u, col) { if (u <= 0) return; const e = a0 + (a1 - a0) * u, p = (a) => [O[0] + Math.cos(a * Math.PI / 180) * r, O[1] - Math.sin(a * Math.PI / 180) * r];
    const [x0, y0] = p(a0), [x1, y1] = p(e); el('path', { d: `M${x0},${y0} A${r},${r} 0 0 ${e < a0 ? 1 : 0} ${x1},${y1}`, fill: 'none', stroke: col, 'stroke-width': 2.5 }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { // 수직선 위의 세 경우
      const L = 120, Rr = 840, Xv = (v) => lerp(L, Rr, (v + 1) / 2), y = 270;
      el('line', { x1: L, y1: y, x2: Rr, y2: y, stroke: MUT, 'stroke-width': 2 });
      [[-1, '정반대', 180], [0, '직교', 90], [1, '같은 방향', 0]].forEach(([v, name, deg], i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.4) : 1, x = Xv(v);
        el('line', { x1: x, y1: y - 7, x2: x, y2: y + 7, stroke: MUT, 'stroke-width': 2 });
        mono(x, y + 30, v.toFixed(1), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: s });
        tx(x, y + 56, name, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: s });
        if (s > 0.02) { const g = R.G(x, 190, s); el('line', { x1: 0, y1: 0, x2: 0, y2: -60, stroke: INK, 'stroke-width': 3, 'marker-end': 'url(#ra-ah)' }, g);
          const r = (90 - deg) * Math.PI / 180; el('line', { x1: 0, y1: 0, x2: Math.cos(r) * 56, y2: -Math.sin(r) * 56, stroke: ACC, 'stroke-width': 3, 'marker-end': 'url(#ra-ahb)' }, g); } });
      if (k === 0) return;
      card(480, 70, 430, 56, { rx: 12, fill: ACCBG, stroke: ACC, sw: 2, text: 'cos θ = (a · b) / (|a| · |b|)', fs: 19, mono: true, color: ACC, s: pop(u, 0.2) });
      tx(480, 128, '두 벡터를 넣으면 숫자 하나가 나온다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) });
      return; }
    // k2~: apple 기준 부채꼴
    el('line', { x1: 60, y1: O[1], x2: 560, y2: O[1], stroke: GRID, 'stroke-width': 1.5 });
    const apS = k === 2 ? E(u, 0.2, 1.0) : 1; const ap = arrowTo(90, 260, apS, INK, 3.5);
    if (apS > 0.9) tx(ap[0], ap[1] - 10, 'q = apple', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, class: 'mono' });
    if (k === 2) { sub(O[0], O[1] + 30, '원점에서 apple 방향으로 화살표 하나', fade(u, 1.1), { 'font-size': 14.5 }); return; }
    const panel = (rows) => { tx(610, 62, 'apple과의 cos (예시 값)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      rows.forEach(([w, v, s], i) => { if (s <= 0.01) return; const y = 88 + i * 50, f = FRUIT.has(w);
        mono(610, y + 15, w, { 'font-size': 15, 'font-weight': 700, fill: f ? GOOD : INFO, opacity: clamp(s) });
        hbar(700, y + 1, 150, v, 1, { h: 18, col: f ? GOOD : INFO, u: clamp(s), text: v.toFixed(2) }); }); };
    if (k === 3) { const [w, v, side, len] = SIM[0], ang = 90 + side * Math.acos(v) * 180 / Math.PI;
      const p = arrowTo(ang, len, E(u, 0.2, 1.0), GOOD); if (u > 1.0) tx(p[0] + 8, p[1] - 6, w, { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end' });
      arc(90, ang, 70, E(u, 1.0, 1.6), WARN);
      mono(O[0] - 66, O[1] - 92, 'θ ≈ 32°', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      panel([[w, tween(0, v, u, 1.4), 1]]); return; }
    SIM.forEach(([w, v, side, len], i) => { const ang = 90 + side * Math.acos(v) * 180 / Math.PI, a = k === 4 && i > 0 ? 0.2 + (i - 1) * 0.35 : -1;
      const g = a < 0 ? 1 : E(u, a, a + 0.6), f = FRUIT.has(w), p = arrowTo(ang, len, g, f ? GOOD : INFO, 2.6);
      if (g > 0.95) tx(p[0] + (side < 0 ? 10 : -10), p[1] + (w === 'banana' ? 18 : w === 'laptop' ? -10 : -4), w, { 'font-size': 15, 'font-weight': 700, fill: f ? GOOD : INFO, 'text-anchor': side < 0 ? 'start' : 'end' }); });
    if (k === 4) { panel(SIM.map(([w, v], i) => [w, v, i === 0 ? 1 : fade(u, 0.5 + (i - 1) * 0.35)]));
      tx(610, 360, '같은 과일 0.78~0.85', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
      tx(610, 386, '기기 0.10~0.12', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.2) }); return; }
    // k5: 단어가 100만 개라면 비교도 100만 번
    const R0 = rnd(7); for (let i = 0; i < 60; i++) { const ang = R0() * 180, len = 120 + R0() * 140, s = clamp(u * 1.4 - i / 60);
      if (s > 0) { const r = ang * Math.PI / 180; el('line', { x1: O[0], y1: O[1], x2: O[0] + Math.cos(r) * len, y2: O[1] - Math.sin(r) * len, stroke: OFF, 'stroke-width': 1.2, opacity: s * 0.8 }); } }
    const n = Math.round(tween(5, 1000000, u, 1.6));
    tx(610, 120, 'apple 한 번 물을 때 비교 횟수', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    mono(610, 170, n.toLocaleString('en-US') + '번', { 'font-size': 30, 'font-weight': 800, fill: n > 100000 ? BAD : INK });
    card(740, 260, 250, 50, { rx: 25, fill: INK, stroke: 'none', text: '그래서 ANN 인덱스', fs: 16, color: PANEL, s: pop(u, 1.9) }); }

  // ---------- 장면 4. 벡터 DB 의 ANN 검색 ----------
  const PL4 = { x: 30, y: 28, w: 540, h: 364 };
  const P4 = (px, py) => [PL4.x + 20 + (px - 40) * 1.55, PL4.y + 10 + (py - 40) * 1.6];
  // 배경 점(다른 벡터들)과 가까운 이웃 연결선 — 한 번만 만든다
  const BG = (() => { const r = rnd(11), pts = []; while (pts.length < 46) { const px = 40 + r() * 330, py = 40 + r() * 220; pts.push([px, py]); } return pts; })();
  function graph(pts) { const E2 = []; pts.forEach((p, i) => { const d = pts.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j]).filter(([, j]) => j !== i).sort((a, b) => a[0] - b[0]);
    d.slice(0, 2).forEach(([, j]) => { if (!E2.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) E2.push([i, j]); }); }); return E2; }
  function s4(t, c) { const { k, u } = c, b = c.beat, pts = b.points;
    const all = BG.concat(pts.map((p) => [p.x, p.y])), EDG = graph(all);
    el('rect', { x: PL4.x, y: PL4.y, width: PL4.w, height: PL4.h, rx: 12, fill: SOFT, stroke: k === 0 ? OFF : GRID, 'stroke-width': 1.5, 'stroke-dasharray': k === 0 ? '6 5' : null });
    // 오른쪽 판
    const RX = 600;
    if (k === 0) { const s = pop(u, 0.2); card(765, 150, 320, 150, { rx: 12, stroke: ACC, sw: 2.5, fill: PANEL, s });
      if (s > 0.5) { tx(625, 108, 'collection', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); mono(625, 136, 'name = "fruits"', { 'font-size': 15.5, 'font-weight': 700 });
        mono(625, 172, 'hnsw:space = cosine', { 'font-size': 15.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) }); mono(625, 204, 'index = HNSW', { 'font-size': 15.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) }); }
      tx(300, 214, '벡터 0개', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 1.2) }); return; }
    const load = k === 1 ? E(u, 0.2, 1.4) : 1, edgeU = k === 1 ? E(u, 1.2, 2.4) : 1;
    EDG.forEach(([i, j], n) => { const s = clamp(edgeU * EDG.length - n); if (s <= 0) return; const [x1, y1] = P4(...all[i]), [x2, y2] = P4(...all[j]);
      el('line', { x1, y1, x2: lerp(x1, x2, s), y2: lerp(y1, y2, s), stroke: GRID, 'stroke-width': 1.6 }); });
    BG.forEach((p, i) => { const s = clamp(load * BG.length * 1.1 - i); if (s > 0) { const [x, y] = P4(...p); el('circle', { cx: x, cy: y, r: 4 * s, fill: OFF }); } });
    const top = k >= 4, q = b.query, qp = q ? P4(q.x, q.y) : null, rad = (b.topK || 70) * 1.58;
    if (k >= 3) { const g = k === 3 ? E(u, 0.3, 1.4) : 1;
      el('circle', { cx: qp[0], cy: qp[1], r: rad * g, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: 0.75 }); }
    pts.forEach((p, i) => { const s = clamp(load * 6 - i * 0.6), l = LBL[p.id];
      wordDot(P4(p.x, p.y), { fruit: FRUIT.has(p.id), s, hit: top && p.hit, label: p.label, dx: l[0], dy: l[1], anchor: l[2] }); });
    if (k === 1) { tx(RX, 120, '적재 = 인덱싱 1회', { 'font-size': 17, 'font-weight': 800 });
      mono(RX, 160, 'col.add(ids, documents,', { 'font-size': 15, fill: MUT }); mono(RX, 184, '        embeddings)', { 'font-size': 15, fill: MUT });
      tx(RX, 240, '점 하나 = 벡터 하나', { 'font-size': 15, fill: INK, opacity: fade(u, 1.0) });
      tx(RX, 266, '가까운 점끼리 선으로 잇는다', { 'font-size': 15, fill: INK, opacity: fade(u, 1.4) });
      tx(RX, 316, '그림에는 일부만, 실제로는 100만 개', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    const qs = k === 2 ? pop(u, 0.4) : 1;
    if (qs > 0.01) { el('circle', { cx: qp[0], cy: qp[1], r: 10 * qs, fill: BAD, stroke: PANEL, 'stroke-width': 2 });
      tx(qp[0] + 14, qp[1] + 26, q.label, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: clamp(qs), class: 'mono' }); }
    if (k === 2) { tx(RX, 120, '검색어도 같은 모델로', { 'font-size': 17, 'font-weight': 800 }); mono(RX, 160, 'q_vec = embed("fruit")', { 'font-size': 15.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(RX, 210, '공간 위 빨간 점 하나가 된다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
    if (k === 3) { tx(RX, 120, 'n_results = 4', { 'font-size': 18, 'font-weight': 800, class: 'mono', fill: ACC });
      tx(RX, 160, '쿼리 점 근처 후보만 본다', { 'font-size': 15, opacity: fade(u, 0.8) }); tx(RX, 188, '먼 점은 비교하지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) }); return; }
    const res = [['orange', 0.92], ['grape', 0.88], ['banana', 0.85], ['apple', 0.84]];
    if (k === 4) { tx(RX, 64, 'top-4 결과 (예시 값)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      res.forEach(([w, v], i) => { const s = fade(u, 0.3 + i * 0.3), y = 86 + i * 52; if (s <= 0) return;
        mono(RX, y + 18, `${i + 1}. ${w}`, { 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: s }); hbar(RX + 120, y + 4, 140, v, 1, { h: 18, col: GOOD, u: s, text: v.toFixed(2) }); });
      tx(RX, 330, '걸린 시간 5ms', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 5) { // 그래프를 따라 몇 번만 옮겨 다닌다
      const lap = pts.find((p) => p.id === 'laptop'), path = [[lap.x, lap.y]];
      [0.3, 0.55, 0.8].forEach((f) => { const tx0 = lerp(lap.x, q.x, f), ty0 = lerp(lap.y, q.y, f);
        path.push(BG.reduce((m, p) => (Math.hypot(p[0] - tx0, p[1] - ty0) < Math.hypot(m[0] - tx0, m[1] - ty0) ? p : m), BG[0])); });
      const org = pts.find((p) => p.id === 'orange'); path.push([org.x, org.y]);
      const route = path.map((p) => P4(...p)), hopU = E(u, 0.2, 1.8);
      for (let i = 0; i < route.length - 1; i++) { const s = clamp(hopU * (route.length - 1) - i); if (s > 0) grow(route[i][0], route[i][1], lerp(route[i][0], route[i + 1][0], 1), lerp(route[i][1], route[i + 1][1], 1), s, WARN, { sw: 3.5, plain: true }); }
      route.forEach((p, i) => { if (hopU * (route.length - 1) >= i) el('circle', { cx: p[0], cy: p[1], r: 6, fill: WARN }); });
      tx(route[0][0] + 14, route[0][1] + 26, '진입점', { 'font-size': 14.5, 'font-weight': 700, fill: WARN });
      tx(RX, 64, '비교 횟수', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      tx(RX, 104, '전수 비교', { 'font-size': 15, 'font-weight': 700 }); hbar(RX + 90, 90, 150, 1000000, 1000000, { h: 18, col: BAD, u: E(u, 0.3, 1.0), text: '100만' });
      tx(RX, 146, 'HNSW', { 'font-size': 15, 'font-weight': 700 }); hbar(RX + 90, 132, 150, 50, 1000000, { h: 18, col: GOOD, u: E(u, 0.8, 1.4), text: '수십' });
      tx(RX, 214, '수 초 → 5ms', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      tx(RX, 252, '정확도 100% → 99%', { 'font-size': 17, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); return; }
    // k6: 정의
    [['임베딩 저장소', '벡터 + 문서'], ['ANN 인덱스', 'HNSW · IVF'], ['top-k API', 'query(n_results)']].forEach(([a, bb], i) => {
      const s = pop(u, 0.2 + i * 0.4), y = 90 + i * 84; card(760, y, 300, 66, { rx: 10, stroke: ACC, sw: 2.2, fill: i === 1 ? ACCBG : PANEL, s });
      if (s > 0.5) { tx(630, y - 4, a, { 'font-size': 16.5, 'font-weight': 800 }); mono(630, y + 20, bb, { 'font-size': 14, fill: MUT }); }
      if (i < 2) mono(900, y + 50, '+', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
    card(760, 360, 300, 44, { rx: 22, fill: INK, stroke: 'none', text: '= 벡터 DB', fs: 17, color: PANEL, s: pop(u, 1.6) }); }

  // ---------- 장면 5. 같은 질문, 두 DB ----------
  function half(side, title, col) { const x = side ? 500 : 30; el('rect', { x, y: 70, width: 430, height: 330, rx: 12, fill: side ? ACCBG : SOFT, stroke: col, 'stroke-width': 1.5, opacity: 0.6 });
    tx(x + 18, 96, title, { 'font-size': 15.5, 'font-weight': 800, fill: col }); }
  function miniTable(x, y, rows, hiId, s) { rows.forEach((r, i) => { const yy = y + i * 34, on = r.name === hiId;
    el('rect', { x, y: yy, width: 200, height: 28, rx: 5, fill: on ? GOODBG : PANEL, stroke: on ? GOOD : GRID, 'stroke-width': on ? 2 : 1.2, opacity: s });
    mono(x + 12, yy + 19, `${r.id}  ${r.name}`, { 'font-size': 14.5, fill: on ? GOOD : INK, 'font-weight': on ? 800 : 500, opacity: s }); }); }
  function miniCloud(x, y, hit, s, q) { const pts = [['apple', 22, 66], ['orange', 104, 22], ['banana', 50, 126], ['grape', 136, 96], ['computer', 270, 172], ['laptop', 300, 112]];
    if (q) { el('circle', { cx: x + 80, cy: y + 72, r: 92 * s, fill: PANEL, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); el('circle', { cx: x + 80, cy: y + 72, r: 8, fill: BAD }); }
    pts.forEach(([w, px, py]) => { const f = FRUIT.has(w), on = hit && f; el('circle', { cx: x + px, cy: y + py, r: 7, fill: on ? GOOD : PANEL, stroke: f ? GOOD : INFO, 'stroke-width': 2.2, opacity: s });
      tx(x + px + 11, y + py + 5, w, { 'font-size': 14, fill: f ? GOOD : INFO, 'font-weight': 600, opacity: s }); }); }
  function s5(t, c) { const { k, u } = c, rows = (c.beat.rows || c.steps[0].rows);
    const crit = ['검색 방식', '데이터 표현', '인덱스', '잘 답하는 질문', '제품과 사용처', '결론'][k];
    if (k < 5) { pill(480, 36, crit, INK, k === 0 ? pop(u, 0.1) : 1, { fs: 16 }); half(0, '전통 DB', MUT); half(1, '벡터 DB', ACC); }
    const L = 60, Rx = 530, s = fade(u, 0.2, 0.5), s2 = fade(u, 0.8, 0.5);
    if (k === 0) { mono(L, 140, "name = 'apple'", { 'font-size': 18, 'font-weight': 800, opacity: s }); tx(L, 172, '글자가 같은가?', { 'font-size': 15.5, fill: MUT, opacity: s });
      miniTable(L, 196, rows.slice(0, 5), 'apple', s);
      mono(Rx, 140, 'cos(q, x) 큰 순서', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: s2 }); tx(Rx, 172, '의미가 비슷한가?', { 'font-size': 15.5, fill: MUT, opacity: s2 });
      miniCloud(Rx + 10, 206, true, s2, true); return; }
    if (k === 1) { tx(L, 140, '행(row) · 컬럼마다 값 하나', { 'font-size': 16, 'font-weight': 700, opacity: s });
      R.cells(L, 170, ['1', "'apple'"], { w: 120, h: 46, fs: 16, style: (i) => ({ s: pop(u, 0.3 + i * 0.2) }) });
      tx(L, 260, 'id · name', { 'font-size': 15, fill: MUT, opacity: s, class: 'mono' });
      tx(Rx, 140, '점(point) · 1536개 float', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: s2 });
      R.cells(Rx, 170, ['0.21', '0.84', '-0.13', '…'], { w: 80, h: 46, fs: 15.5, style: (i) => ({ s: pop(u, 0.9 + i * 0.15), stroke: ACC }) });
      tx(Rx, 260, '+ 메타데이터 (id, 문서)', { 'font-size': 15, fill: MUT, opacity: s2 });
      el('circle', { cx: Rx + 300, cy: 320, r: 10 * pop(u, 1.6), fill: GOOD }); tx(Rx + 318, 326, 'apple', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
    if (k === 2) { // 왼쪽 B-Tree, 오른쪽 그래프
      const bx = 245; el('rect', { x: bx - 80, y: 130, width: 160, height: 34, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: s });
      mono(bx, 153, 'computer|laptop', { 'font-size': 14, 'text-anchor': 'middle', opacity: s });
      [[-130, 'apple…'], [0, 'computer…'], [130, 'laptop…']].forEach(([dx, kk], i) => { const ls = pop(u, 0.4 + i * 0.2); grow(bx + dx * 0.4, 164, bx + dx, 226, E(u, 0.3, 0.8), MUT, { plain: true });
        card(bx + dx, 248, 118, 40, { rx: 6, text: kk, fs: 14, mono: true, s: ls }); });
      tx(bx, 312, 'B-Tree · Hash · GIN', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: s });
      tx(bx, 340, '정렬된 키를 비교', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: s });
      const gp = [[560, 170], [640, 140], [610, 220], [700, 200], [760, 150], [820, 230], [880, 170], [740, 260]], ge = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 6], [3, 7], [7, 5], [5, 6], [1, 4]];
      ge.forEach(([a, bb], i) => grow(gp[a][0], gp[a][1], gp[bb][0], gp[bb][1], E(u, 0.8 + i * 0.06, 1.1 + i * 0.06), ACC, { plain: true }));
      gp.forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 7 * pop(u, 0.8 + i * 0.05), fill: PANEL, stroke: ACC, 'stroke-width': 2.2 }));
      tx(715, 312, 'HNSW · IVF · PQ', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: s2 });
      tx(715, 340, '가까운 점을 따라 탐색', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: s2 }); return; }
    if (k === 3) { [['"id = 42 사용자?"', 140], ['"price < 1000 상품?"', 200]].forEach(([q, y], i) => { const p = pop(u, 0.2 + i * 0.3); card(245, y, 330, 46, { rx: 23, text: q, fs: 16, s: p, fill: PANEL, stroke: INK }); });
      [['"이 글과 비슷한 글 5개?"', 140], ['"사과 비슷한 단어?"', 200]].forEach(([q, y], i) => { const p = pop(u, 0.9 + i * 0.3); card(715, y, 330, 46, { rx: 23, text: q, fs: 16, s: p, fill: PANEL, stroke: ACC, color: ACC }); });
      tx(245, 290, '정확한 값 · 범위', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(715, 290, '가까운 것 몇 개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { dbIcon(160, 190, 'PostgreSQL · MySQL', { s: pop(u, 0.2) });
      tx(L, 320, '회원 · 주문 · 결제', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) }); tx(L, 348, '트랜잭션 시스템', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) });
      dbIcon(640, 190, 'Pinecone · Milvus · pgvector', { s: pop(u, 0.9), stroke: ACC });
      tx(Rx, 320, 'RAG · 추천 · 이미지 검색', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) }); tx(Rx, 348, '중복 탐지', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) }); return; }
    // k5: 한 DB 안에 두 인덱스
    const m = E(u, 0.2, 1.2);
    dbIcon(480, 150, 'PostgreSQL + pgvector', { s: 1.25 });
    pill(lerp(140, 360, m), 280, 'B-Tree (id, category)', INK, 1, { fs: 15 });
    pill(lerp(820, 610, m), 280, 'HNSW (embedding)', ACC, 1, { fs: 15 });
    R.snippet(170, 320, ["WHERE category = 'fruit'  ORDER BY embedding <=> q"], { fs: 15, op: fade(u, 1.4) });
    tx(480, 36, '대체재가 아니라 보완재', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.0) }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: "fruits 테이블에 LIKE '%app%'를 걸었을 때 orange·banana가 안 나오는 까닭은 무엇인가?",
      o: ['B-Tree 인덱스가 아직 만들어지지 않아서', '조건이 글자 비교라 뜻이 가까워도 글자가 다르면 걸리지 않아서', 'LIKE는 첫 행 하나만 돌려주게 되어 있어서'], a: 1,
      why: '전통 DB는 글자가 같은지만 본다. apple만 app을 품고 있어 1행이 나오고, 뜻이 가까운 과일 이름은 글자가 달라 빠진다.' },
    { q: '임베딩 뒤 apple과 orange가 공간에서 가까이 놓이는 까닭은 무엇인가?',
      o: ['알파벳 순서가 비슷해서', '두 단어의 글자 수가 같아서', '임베딩 모델이 뜻이 비슷한 단어를 비슷한 숫자 배열로 바꿔서'], a: 2,
      why: '단어 하나가 1536개 float로 바뀌고, 뜻이 비슷하면 값도 비슷해 좌표가 가까워진다. 과일 넷이 한 덩어리, computer·laptop이 다른 덩어리를 이룬다.' },
    { q: 'apple과의 코사인 유사도가 0.12인 computer는 apple과 어떤 관계인가?',
      o: ['두 화살표가 거의 직각이라 뜻이 거의 무관하다', '두 화살표가 정반대라 뜻이 반대다', '화살표 길이가 짧아 덜 중요한 단어다'], a: 0,
      why: 'cos 값이 0에 가까우면 각도가 90도에 가깝다. 코사인은 방향만 보므로 화살표 길이와는 상관이 없다.' },
    { q: 'HNSW 인덱스가 100만 개 벡터에서 top-4를 5ms에 찾는 방법은 무엇인가?',
      o: ['100만 개 전부와 코사인을 빠르게 계산한다', '가까운 점끼리 이은 그래프를 따라 몇십 번만 비교하며 다가간다', '단어의 첫 글자로 정렬해 이진 탐색한다'], a: 1,
      why: '전수 비교는 100만 번이지만 HNSW는 그래프를 따라 수십 번만 비교한다. 대신 정확도가 100%에서 99%쯤으로 조금 내려간다.' },
    { q: '실무에서 전통 DB와 벡터 DB를 함께 쓰는 흔한 방법은 무엇인가?',
      o: ['벡터 DB로 모두 옮기고 전통 DB는 끈다', '전통 DB의 LIKE를 벡터 검색 대신 쓴다', 'PostgreSQL에 pgvector를 붙여 B-Tree와 HNSW 인덱스를 한 DB에 둔다'], a: 2,
      why: '정확한 조건은 B-Tree가, 비슷한 것 찾기는 HNSW가 맡는다. 한 쿼리에서 WHERE 조건과 거리 정렬을 함께 쓸 수 있다.' },
  ];

  const summary = [
    '전통 DB는 글자가 같은지만 묻는다. LIKE로도 apple만 나오고 orange나 banana는 못 찾는다.',
    '임베딩 모델이 단어를 1536개 숫자로 바꾸면 뜻이 비슷한 단어가 가까운 점이 된다.',
    '코사인 유사도는 두 벡터의 각도로 가까움을 잰다. 1에 가까울수록 뜻이 비슷하다.',
    '벡터 DB는 HNSW 같은 ANN 인덱스로 100만 개 중 top-k를 5ms쯤에 찾고 정확도를 조금 양보한다.',
  ];
  const review = [
    { q: "쇼핑몰 검색창에 '운동화'를 넣었더니 '러닝화' 상품이 하나도 안 나온다. 먼저 의심할 것은?",
      o: ["검색이 name LIKE '%운동화%' 같은 글자 비교로만 되어 있다", '상품 테이블에 B-Tree 인덱스가 없다', '러닝화 상품의 가격이 너무 높다'], a: 0,
      why: '글자 비교는 뜻이 같아도 글자가 다르면 놓친다. 임베딩으로 바꿔 코사인으로 비교해야 러닝화가 가까운 결과로 잡힌다.' },
    { q: '단어 6개로는 코사인 전수 비교가 잘 돌았는데 100만 개로 늘리자 응답이 수 초로 늘었다. 알맞은 대응은?',
      o: ['코사인 대신 LIKE로 바꾼다', 'HNSW 같은 ANN 인덱스를 두고 top-k만 근처에서 찾는다', '벡터 차원을 1536에서 4로 줄인다'], a: 1,
      why: '전수 비교는 질문 하나에 100만 번 계산한다. ANN 인덱스는 수십 번 비교로 5ms 안팎에 답하고 정확도를 99% 수준으로 유지한다.' },
    { q: "'카테고리가 fruit이고 뜻이 apple에 가까운 상품 5개'를 한 번에 찾으려 한다. 가장 알맞은 구성은?",
      o: ['전통 DB의 B-Tree만으로 정렬한다', '벡터 DB만 쓰고 카테고리는 앱에서 거른다', 'pgvector로 WHERE와 거리 정렬을 한 쿼리에 쓴다'], a: 2,
      why: '카테고리 같은 정확한 조건은 전통 인덱스가, 비슷함은 HNSW가 잘한다. 두 인덱스를 한 DB에 두면 한 쿼리로 함께 쓸 수 있다.' },
  ];

  R.page({ title: '전통 DB vs 벡터 DB', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
