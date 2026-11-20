/* III-1-2 DBSCAN — 밀도 기반 군집 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 점 좌표와 군집 결과는 페이지가 계산해 둔 POINTS · KM · DB · DB_SMALL · DB_BIG · KDIST 를 그대로 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, cross, check, axes, line, snippet, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, WARN, INFO, INFOBG } = C;

  // ---------- 페이지 데이터 ----------
  function D() {
    if (typeof POINTS === 'undefined') return null;
    return { P: POINTS, KM, DB, DBS: DB_SMALL, DBB: DB_BIG, KD: KDIST, EPS };
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const CL = [ACC, INFO];                 // DBSCAN 클러스터 0 / 1
  const KMC = (l) => (l === 0 ? INFO : WARN); // K-means 클러스터 0 / 1
  const INIT = [{ x: -1, y: 0.5 }, { x: 2, y: 0 }]; // 페이지 kmeans() 의 초기 중심
  const hsh = (i) => { const s = Math.sin((i + 1) * 91.17) * 43758.5453; return s - Math.floor(s); };

  // 데이터 좌표(x -1.55~2.55, y -1.15~1.8) → 무대 좌표
  function plot(x, y, w, o) { o = o || {}; const s = w / 4.1, h = 2.95 * s;
    if (o.frame !== false) el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    return { X: (v) => x + (v + 1.55) * s, Y: (v) => y + h - (v + 1.15) * s, s, h, x, y, w }; }
  // 점 하나: kind 'fill' | 'ring' | 'x'
  function pt(ax, p, o) { o = o || {}; const sc = o.s ?? 1; if (sc <= 0) return; const cx = ax.X(p.x), cy = ax.Y(p.y), r = (o.r || 5.5) * sc, col = o.col || INK, op = o.op ?? 1;
    if (o.kind === 'x') el('path', { d: `M${cx - r},${cy - r} L${cx + r},${cy + r} M${cx + r},${cy - r} L${cx - r},${cy + r}`, stroke: col, 'stroke-width': o.r && o.r < 4 ? 2 : 2.8, 'stroke-linecap': 'round', opacity: op });
    else el('circle', { cx, cy, r, fill: o.kind === 'ring' ? PANEL : col, stroke: col, 'stroke-width': 2, opacity: op }); }
  function ring(ax, p, r, col, op, dash) { el('circle', { cx: ax.X(p.x), cy: ax.Y(p.y), r, fill: 'none', stroke: col, 'stroke-width': 2.2, opacity: op ?? 1, 'stroke-dasharray': dash }); }
  function cent(ax, c, s, o) { o = o || {}; if (s <= 0) return; const x = ax.X(c.x), y = ax.Y(c.y), r = 10 * s;
    el('path', { d: `M${x - r},${y - r} L${x + r},${y + r} M${x + r},${y - r} L${x - r},${y + r}`, stroke: o.col || INK, 'stroke-width': 4.5, 'stroke-linecap': 'round', opacity: o.op ?? 1 }); }
  // eps 원 (데이터 반경 → 픽셀)
  function epsC(ax, p, rad, o) { o = o || {}; if ((o.u ?? 1) <= 0) return; el('circle', { cx: ax.X(p.x), cy: ax.Y(p.y), r: rad * ax.s * (o.u ?? 1), fill: o.fill || ACC, 'fill-opacity': o.fo ?? 0.08, stroke: o.col || ACC, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: o.op ?? 1 }); }
  // 두 중심의 수직이등분선을 데이터 상자 안으로 자른 양 끝
  function bisector(c0, c1) { const mx = (c0.x + c1.x) / 2, my = (c0.y + c1.y) / 2, dx = c1.x - c0.x, dy = c1.y - c0.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    let t0 = -9, t1 = 9; [[nx, mx, -1.55, 2.55], [ny, my, -1.15, 1.8]].forEach(([d, m, lo, hi]) => { if (Math.abs(d) < 1e-9) return; let a = (lo - m) / d, b = (hi - m) / d; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); });
    return { m: { x: mx, y: my }, a: { x: mx + nx * t0, y: my + ny * t0 }, b: { x: mx + nx * t1, y: my + ny * t1 }, side: (p) => (p.x - mx) * dx + (p.y - my) * dy > 0 ? 1 : 0 }; }
  function bisLine(ax, bs, u, o) { o = o || {}; if (u <= 0) return; const A = { x: lerp(bs.m.x, bs.a.x, u), y: lerp(bs.m.y, bs.a.y, u) }, B = { x: lerp(bs.m.x, bs.b.x, u), y: lerp(bs.m.y, bs.b.y, u) };
    el('line', { x1: ax.X(A.x), y1: ax.Y(A.y), x2: ax.X(B.x), y2: ax.Y(B.y), stroke: o.col || INK, 'stroke-width': o.sw || 2.5, 'stroke-dasharray': '8 6', opacity: o.op ?? 1 }); }
  // 오른쪽 칸의 한 줄: 이름 · 값
  function row(y, k, v, op, o) { o = o || {}; tx(552, y, k, { 'font-size': 15, fill: MUT, 'font-weight': 600, opacity: op });
    mono(930, y, v, { 'font-size': o.fs || 16, 'font-weight': 800, fill: o.col || INK, 'text-anchor': 'end', opacity: op }); }
  function head(y, s, op, col) { tx(552, y, s, { 'font-size': 17, 'font-weight': 800, fill: col || INK, opacity: op }); }

  // ---------- 1. K-means 의 실패 ----------
  function s1(t, c) { const { k, u } = c, d = D(); if (!d) return; const ax = plot(30, 34, 470);
    const cen = k <= 3 ? INIT : k === 4 ? INIT.map((p, i) => ({ x: lerp(p.x, d.KM.centroids[i].x, E(u, 0.2, 1.0)), y: lerp(p.y, d.KM.centroids[i].y, E(u, 0.2, 1.0)) })) : d.KM.centroids;
    const bs = bisector(d.KM.centroids[0], d.KM.centroids[1]);
    // k5: 초승달 두 개의 진짜 모양을 굵게 깔고, 경계 어느 쪽인지로 색칠
    if (k === 5) { const g = E(u, 0.2, 1.3);
      [0, 1].forEach((m) => { const arc = []; for (let i = 0; i <= 40; i++) { const th = Math.PI * i / 40; arc.push(m === 0 ? { x: Math.cos(th), y: Math.sin(th) } : { x: 1 - Math.cos(th), y: 0.5 - Math.sin(th) }); }
        const n = Math.round(40 * g); for (let i = 0; i < n; i++) { const a = arc[i], b = arc[i + 1];
          el('line', { x1: ax.X(a.x), y1: ax.Y(a.y), x2: ax.X(b.x), y2: ax.Y(b.y), stroke: KMC(bs.side(a)), 'stroke-width': 22, 'stroke-linecap': 'round', opacity: 0.2 }); } }); }
    if (k >= 4) { const g = k === 4 ? E(u, 0.9, 1.3) : 1; if (g > 0) el('line', { x1: ax.X(cen[0].x), y1: ax.Y(cen[0].y), x2: ax.X(lerp(cen[0].x, cen[1].x, g)), y2: ax.Y(lerp(cen[0].y, cen[1].y, g)), stroke: MUT, 'stroke-width': 1.5 });
      bisLine(ax, bs, k === 4 ? E(u, 1.3, 2.3) : 1); }
    d.P.forEach((p, i) => { let s = 1, y = p.y;
      if (i < 80 && k === 0) s = pop(u, 0.2 + i * 0.026, 0.4);
      if (i >= 80) { if (k === 0) return; if (k === 1) { const a = 0.3 + (i - 80) * 0.25, q = E(u, a, a + 0.5); if (q <= 0) return; y = lerp(1.8, p.y, q); } }
      let col = INK, op = 0.55;
      if (k >= 3) { const on = k > 3 || u > 0.3 + ((ax.X(p.x) - 30) / 470) * 1.6; if (on) { col = KMC(d.KM.labels[i]); op = 0.9; } }
      pt(ax, { x: p.x, y }, { col, s, op });
      if (i >= 80) { if (k === 1) ring(ax, p, 12, WARN, fade(u, 0.8 + (i - 80) * 0.25));
        if (k === 3) ring(ax, p, 12, KMC(d.KM.labels[i]), fade(u, 1.9));
        if (k === 6) ring(ax, p, 12 + 3 * Math.sin(t * 6), BAD, fade(u, 0.3)); } });
    if (k >= 2) cen.forEach((p, i) => cent(ax, p, k === 2 ? pop(u, 0.3 + i * 0.2) : 1, { op: k <= 3 ? 0.45 : 1 }));
    // k5: 한 점에서 두 중심까지의 거리
    if (k === 5) { const p = d.P[0], near = d.KM.labels[0], g = E(u, 1.4, 2.0);
      [0, 1].forEach((j) => { const q = d.KM.centroids[j]; if (g > 0) el('line', { x1: ax.X(p.x), y1: ax.Y(p.y), x2: ax.X(lerp(p.x, q.x, g)), y2: ax.Y(lerp(p.y, q.y, g)), stroke: j === near ? KMC(j) : MUT, 'stroke-width': j === near ? 3 : 2, 'stroke-dasharray': j === near ? null : '4 4' }); });
      ring(ax, p, 13, INK, fade(u, 1.3)); }

    // 오른쪽 칸
    if (k === 0) { head(64, '원본 데이터', fade(u, 0.2)); mono(552, 100, 'make_moons(n_samples=80,', { 'font-size': 15, opacity: fade(u, 0.3) }); mono(552, 124, '           noise=0.09)', { 'font-size': 15, opacity: fade(u, 0.3) });
      row(176, '점 개수', Math.round(80 * E(u, 0.2, 2.3)) + '점', fade(u, 0.3));
      sub(740, 240, '사람 눈에는 명백히 두 덩어리', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 1) { head(64, '실전 데이터의 오염', fade(u, 0.1));
      row(110, '초승달', '80점', 1); row(146, '+ 이상치', Math.round(6 * E(u, 0.3, 1.9)) + '점', fade(u, 0.3), { col: WARN });
      el('line', { x1: 552, y1: 166, x2: 930, y2: 166, stroke: GRID, 'stroke-width': 1.5 });
      row(194, 'X (vstack)', Math.round(tween(80, 86, u, 1.6)) + '점', 1);
      sub(740, 250, '이 6점을 끝까지 지켜본다', fade(u, 2.0), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }
    if (k === 2) { card(740, 90, 340, 54, { rx: 10, text: 'KMeans(n_clusters=2)', fs: 16, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      person(610, 250, '사람', { s: pop(u, 0.5) });
      const q = seg(u, 0.9, 1.6); card(lerp(660, 800, E(q, 0, 1)), lerp(240, 140, E(q, 0, 1)), 74, 34, { rx: 17, text: 'k = 2', fs: 15, mono: true, fill: WARN, stroke: 'none', color: PANEL, op: fade(u, 0.8) });
      tx(700, 260, '데이터를 보기 전에', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.7) });
      tx(700, 284, '개수를 정해 줘야 한다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
      sub(740, 350, '✕ = 중심이 생길 자리 (초기값)', fade(u, 2.1), { 'font-size': 15 }); }
    if (k === 3) { head(64, 'fit_predict(X)', fade(u, 0.1));
      row(110, '라벨', Math.round(86 * E(u, 0.3, 1.9)) + '개', 1); row(146, '미배정 (-1)', '0점', fade(u, 1.9), { col: BAD });
      tx(552, 210, '이상치 6점도 어딘가에 들어갔다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
      sub(740, 250, '예외도, 보류도 없다', fade(u, 2.3), { 'font-size': 15 }); }
    if (k === 4) { head(64, 'cluster_centers_', fade(u, 0.1)); tx(552, 100, '✕ 두 중심이 자리를 잡는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) });
      row(160, '경계 모양', '직선', fade(u, 1.5));
      tx(552, 196, '= 두 중심의 수직이등분선', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(740, 260, '어느 쪽 중심에 더 가까운가, 그것뿐', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 5) { head(64, '왜 반 토막인가', fade(u, 0.1));
      tx(552, 110, '굵은 띠 = 초승달의 진짜 모양', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) });
      tx(552, 136, '한 초승달이 두 색으로 잘린다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
      tx(552, 196, '○ 표시한 점은 위 초승달인데', { 'font-size': 15, opacity: fade(u, 1.6) });
      tx(552, 220, '더 가까운 오른쪽 중심으로 간다', { 'font-size': 15, opacity: fade(u, 1.8) });
      card(740, 290, 360, 46, { rx: 10, text: '판단 근거 = 중심까지 거리뿐', fs: 16, stroke: BAD, color: BAD, s: pop(u, 2.2) }); }
    if (k === 6) { [['"소속 없음" 이라는 답이 없다', '이상치 6점 → 전부 클러스터에 편입'], ['k 를 미리 알아야 한다', '실전에서는 개수를 모르는 경우가 대부분']].forEach(([a, b], i) => {
        const y = 100 + i * 130, s = pop(u, 0.3 + i * 0.7); card(740, y, 380, 92, { rx: 12, stroke: BAD, s, fill: BADBG });
        tx(578, y - 8, a, { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4 + i * 0.7) });
        tx(578, y + 22, b, { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.5 + i * 0.7) }); });
      tx(740, 380, '"거리" 가 아닌 다른 기준이 필요하다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); } }

  // ---------- 2. 밀도로 점 분류 ----------
  function samples(d) { const near = (kd, q) => d.P.reduce((b, p, i) => (d.DB.kind[i] === kd && (b < 0 || dist(p, q) < dist(d.P[b], q)) ? i : b), -1);
    return [near('core', { x: -0.75, y: 0.7 }), d.DB.kind.findIndex((x) => x === 'border'), d.DB.kind.findIndex((x) => x === 'noise')]; }
  const nbrs = (d, i, eps) => d.P.map((q, j) => (dist(d.P[i], q) <= eps ? j : -1)).filter((j) => j >= 0);
  function kindPt(ax, p, kind, o) { o = o || {}; if (kind === 'noise') pt(ax, p, Object.assign({ col: BAD, kind: 'x' }, o)); else if (kind === 'border') pt(ax, p, Object.assign({ col: ACC, kind: 'ring' }, o)); else pt(ax, p, Object.assign({ col: ACC }, o)); }
  function s2(t, c) { const { k, u } = c, d = D(); if (!d) return; const ax = plot(30, 34, 470), S = samples(d), NM = ['A', 'B', 'C'];
    // 대표 점 세 개의 eps 원과 이웃 선
    if (k === 1) epsC(ax, d.P[S[0]], d.EPS, { u: E(u, 0.3, 1.1) });
    if (k >= 2) S.forEach((si, j) => { const a = k === 2 ? 0.3 + j * 0.7 : -1, p = d.P[si];
      epsC(ax, p, d.EPS, { u: k === 2 ? E(u, a, a + 0.4) : 1, op: k === 2 ? 1 : 0.8, col: j === 2 ? BAD : ACC, fill: j === 2 ? BAD : ACC });
      if (k === 2) nbrs(d, si, d.EPS).forEach((q) => { if (q !== si) grow(ax.X(p.x), ax.Y(p.y), ax.X(d.P[q].x), ax.Y(d.P[q].y), E(u, a + 0.3, a + 0.6), j === 2 ? BAD : ACC, { plain: true, sw: 1.6 }); }); });
    // 점: 판정이 드러난 종류만 색칠
    const shown = { core: k >= 3, border: k >= 4, noise: k >= 5 }; let ci = 0;
    d.P.forEach((p, i) => { const kd = d.DB.kind[i];
      if (!shown[kd]) { pt(ax, p, { col: OFF, op: 0.9 }); return; }
      if (kd === 'core') { const s = k === 3 ? pop(u, 0.3 + (ci++) * 0.022, 0.4) : 1; pt(ax, p, { col: OFF, op: 0.9 }); kindPt(ax, p, kd, { s }); return; }
      const fresh = (kd === 'border' && k === 4) || (kd === 'noise' && k === 5);
      kindPt(ax, p, kd, { s: fresh ? pop(u, 0.4) : 1 });
      if (fresh) ring(ax, p, 13, kd === 'noise' ? BAD : ACC, fade(u, 0.6) * (1 - fade(u, 2.4))); });
    if (k >= 1) S.forEach((si, j) => { if (k === 1 && j > 0) return; const p = d.P[si], op = k === 1 ? fade(u, 0.2) : k === 2 ? fade(u, 0.3 + j * 0.7) : 1;
      lbl(ax.X(p.x) + (j === 0 ? -16 : 16), ax.Y(p.y) - 12, NM[j], op, { 'font-size': 16, fill: j === 2 ? BAD : INK }); });
    if (k === 1) { const p = d.P[S[0]], g = E(u, 1.1, 1.5); grow(ax.X(p.x), ax.Y(p.y), ax.X(p.x) + d.EPS * ax.s * g, ax.Y(p.y), 1, INK, { plain: true, sw: 2 });
      mono(ax.X(p.x) + d.EPS * ax.s / 2, ax.Y(p.y) + 22, 'eps', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 0) cent(ax, { x: 0.5, y: 0.25 }, 1, { op: 0.5 * (1 - fade(u, 1.6, 0.6)) });

    // 오른쪽 칸: 정의 · 파라미터 · 대표 점 · 집계
    const defs = [['core', '반경 안 이웃 ≥ MIN_PTS'], ['border', 'core 반경 안의 가장자리'], ['noise', '둘 다 아님 → 소속 없음']];
    defs.forEach(([nm, s], i) => { const y = 52 + i * 34, op = k === 0 ? fade(u, 0.3 + i * 0.4) : 1;
      if (nm === 'noise') el('path', { d: `M552,${y - 11} L562,${y - 1} M562,${y - 11} L552,${y - 1}`, stroke: BAD, 'stroke-width': 2.8, opacity: op });
      else el('circle', { cx: 557, cy: y - 6, r: 6, fill: nm === 'core' ? ACC : PANEL, stroke: ACC, 'stroke-width': 2, opacity: op });
      tx(574, y, nm, { 'font-size': 15, 'font-weight': 800, fill: nm === 'noise' ? BAD : ACC, opacity: op, class: 'mono' });
      tx(642, y, s, { 'font-size': 15, opacity: op }); });
    if (k === 0) { tx(552, 190, '중심(centroid) 대신', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); tx(552, 216, '"내 주변이 얼마나 붐비는가" 로 판정', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) }); }
    if (k >= 1) { const op = k === 1 ? 1 : 1; pill(620, 168, 'EPS = 0.25', ACC, k === 1 ? pop(u, 0.4) : 1, { mono: true, fs: 15 }); pill(780, 168, 'MIN_PTS = 4', ACC, k === 1 ? pop(u, 0.8) : 1, { mono: true, fs: 15, op });
      if (k === 1) { tx(552, 226, '입력은 이 두 숫자뿐', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); tx(552, 252, '클러스터 개수 k 는 받지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); } }
    if (k >= 2) S.forEach((si, j) => { const y = 216 + j * 30, n = nbrs(d, si, d.EPS).length, op = k === 2 ? fade(u, 0.6 + j * 0.7) : 1, kd = d.DB.kind[si];
      const verdict = (kd === 'core' && k >= 3) || (kd === 'border' && k >= 4) || (kd === 'noise' && k >= 5) ? '→ ' + kd : '';
      tx(552, y, NM[j], { 'font-size': 15, 'font-weight': 800, fill: j === 2 ? BAD : INK, opacity: op });
      mono(578, y, `이웃 ${n}개 (자기 포함)`, { 'font-size': 15, opacity: op });
      if (verdict) mono(930, y, verdict, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: kd === 'noise' ? BAD : ACC }); });
    if (k >= 3) { const cnt = (kd) => d.DB.kind.filter((x) => x === kd).length, parts = [['core', cnt('core'), ACC, 3], ['border', cnt('border'), INFO, 4], ['noise', cnt('noise'), BAD, 5]];
      let x = 552; const W = 378; parts.forEach(([nm, n, col, from]) => { if (k < from) return; const w = W * n / 86 * (k === from ? E(u, 0.3, 1.2) : 1);
        el('rect', { x, y: 318, width: Math.max(w, 2), height: 22, rx: 3, fill: col, opacity: 0.85 }); x += w; });
      const lab = parts.filter((p) => k >= p[3]).map(([nm, n]) => `${nm} ${n}`).join(' · ');
      mono(552, 364, lab, { 'font-size': 16, 'font-weight': 800 }); tx(552, 304, '86점 판정 결과', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); }
    if (k === 6) { banner(265, 398, 'k 도 중심도 아직 없다 — 점마다 밀도만 판정', pop(u, 0.4)); } }

  // ---------- 3. DBSCAN 확산 ----------
  function s3(t, c) { const { k, u } = c, d = D(); if (!d) return; const order = d.DB.order;
    if (k === 6) return compare(c, d);
    const ax = plot(30, 34, 470);
    const m = k === 0 ? Math.floor(lerp(0, 14, E(u, 0.3, 2.4))) : k === 1 ? Math.floor(lerp(0, order.length, E(u, 0.3, 2.4))) : order.length;
    const seen = new Set(order.slice(0, m)), cur = m > 0 && m < order.length ? order[m - 1] : -1;
    if (cur >= 0 && d.DB.kind[cur] === 'core') epsC(ax, d.P[cur], d.EPS, { col: CL[d.DB.labels[cur]], fill: CL[d.DB.labels[cur]], fo: 0.1 });
    if (k === 8) order.filter((_, i) => i % 9 === 0).forEach((i, j) => epsC(ax, d.P[i], d.EPS, { u: E(u, 0.2 + j * 0.08, 0.6 + j * 0.08), col: MUT, fill: MUT, fo: 0.05 }));
    d.P.forEach((p, i) => { const lab = d.DB.labels[i], kd = d.DB.kind[i];
      if (lab === -1) { pt(ax, p, { kind: 'x', col: k >= 2 ? BAD : OFF, op: k === 4 ? 0.3 : 1 }); if (k === 3) ring(ax, p, 13, BAD, fade(u, 0.3) * (1 - fade(u, 2.3))); return; }
      if (!seen.has(i)) { pt(ax, p, { col: OFF }); return; }
      const dim = (k === 4 && kd !== 'core') || k === 3 ? 0.35 : 1;
      pt(ax, p, { col: CL[lab], kind: kd === 'border' ? 'ring' : 'fill', op: dim, s: k === 4 && kd === 'core' ? 1 + 0.25 * E(u, 0.3, 0.8) : 1 }); });
    if (k === 7) newPoint(ax, d, u);

    // 오른쪽 칸
    if (k === 0) { head(64, '확산 규칙', fade(u, 0.1));
      el('circle', { cx: 560, cy: 104, r: 7, fill: ACC, opacity: fade(u, 0.3) }); tx(578, 110, 'core → 이웃을 흡수하고 다시 번진다', { 'font-size': 15, opacity: fade(u, 0.3) });
      el('circle', { cx: 560, cy: 140, r: 7, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.7) }); tx(578, 146, 'border → 흡수만, 불씨가 되지 않는다', { 'font-size': 15, opacity: fade(u, 0.7) });
      row(210, 'BFS 방문', `${m}점`, fade(u, 0.3), { col: ACC });
      sub(740, 270, '점선 원 = 지금 번지는 core 의 eps', fade(u, 1.2), { 'font-size': 15 }); }
    if (k === 1) { card(740, 80, 370, 50, { rx: 10, text: 'DBSCAN(eps=0.25, min_samples=4)', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      pill(650, 140, 'n_clusters=?', MUT, pop(u, 0.5), { mono: true, fs: 14 }); cross(650, 140, 16, pop(u, 0.9));
      tx(730, 146, '개수는 알려준 적 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      row(210, 'BFS 방문', `${m} / ${order.length}점`, 1, { col: ACC });
      sub(740, 270, '초승달 곡선을 따라 번진다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k === 2) { head(64, 'set(labels)', fade(u, 0.1)); const labs = [0, 1, -1];
      labs.forEach((l, i) => { const x = 590 + i * 80, gone = l === -1 && u > 1.2; card(x, 112, 60, 40, { rx: 8, text: String(l), fs: 17, mono: true, stroke: l === -1 ? BAD : CL[l], color: l === -1 ? BAD : CL[l], s: pop(u, 0.3 + i * 0.2), op: gone ? 0.35 : 1 }); if (gone) cross(x, 112, 14, pop(u, 1.2)); });
      row(200, 'n_clusters', String(Math.round(tween(0, d.DB.nClusters, u - 1.3, 0.6))), fade(u, 1.4), { col: ACC });
      row(236, 'n_noise', String(d.DB.nNoise), fade(u, 1.8), { col: BAD });
      sub(740, 300, '개수는 입력이 아니라 결과', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k === 3) { head(60, 'X[labels == -1]', fade(u, 0.1));
      d.P.slice(80).forEach((p, j) => { const y = 96 + j * 34, a = 0.4 + j * 0.25, q = seg(u, a, a + 0.5);
        if (q > 0 && q < 1) R.fly(ax.X(p.x), ax.Y(p.y), 600, y - 5, q, '-1', { fill: BAD });
        if (q >= 1) { mono(560, y, `[${p.x.toFixed(2)}, ${p.y.toFixed(2)}]`, { 'font-size': 15, fill: BAD, 'font-weight': 700 }); } });
      tx(552, 316, '이 목록이 곧 이상치', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.1) });
      sub(740, 346, '별도 알고리즘 없이 군집화의 부산물', fade(u, 2.3), { 'font-size': 15 }); }
    if (k === 4) { head(64, 'db.core_sample_indices_', fade(u, 0.1));
      row(116, 'core 점', Math.round(76 * E(u, 0.3, 1.2)) + '개', fade(u, 0.3), { col: ACC });
      tx(552, 176, '새 점을 배정할 때 기준이 되는', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) });
      tx(552, 200, '재사용 가능한 요약', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.5) }); }
    if (k === 5) orderDemo(u);
    if (k === 7) { head(64, '새 점 배정', fade(u, 0.1));
      pill(640, 110, 'db.predict(new_X)', MUT, pop(u, 0.5), { mono: true, fs: 14 }); cross(640, 110, 16, pop(u, 0.9));
      tx(552, 170, '없다 → 직접 찾는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      tx(552, 220, '① eps 안의 가장 가까운 core', { 'font-size': 15, opacity: fade(u, 1.3) });
      tx(552, 246, '② 있으면 그 클러스터, 없으면 -1', { 'font-size': 15, opacity: fade(u, 1.8) }); }
    if (k === 8) { head(64, 'eps 는 전 구역에 하나', fade(u, 0.1));
      tx(552, 96, '모든 원이 같은 크기다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) });
      const bx = 740, by = 230; [[620, 18, 0.07, '빽빽한 곳', ACC], [850, 8, 0.2, '성긴 곳', BAD]].forEach(([cx, n, sp, nm, col], j) => { const op = fade(u, 1.0 + j * 0.5);
        el('circle', { cx, cy: by, r: 40, fill: col, 'fill-opacity': 0.07, stroke: col, 'stroke-dasharray': '5 4', 'stroke-width': 1.8, opacity: op });
        for (let i = 0; i < n; i++) { const a = i * 2.4, rr = (8 + hsh(i + j * 40) * 30) * (sp / 0.07) ** 0.85; el('circle', { cx: cx + Math.cos(a) * Math.min(rr, 95), cy: by + Math.sin(a) * Math.min(rr, 70) * 0.8, r: 4.5, fill: j === 0 ? ACC : OFF, opacity: op }); }
        lbl(cx, by + 96, nm, op, { fill: col }); });
      tx(bx, 380, '밀도가 제각각이면 무너진다 → Step 5', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); } }
  // 새 점 하나를 가장 가까운 core 로
  function newPoint(ax, d, u) { const cores = d.DB.kind.map((kd, i) => (kd === 'core' ? i : -1)).filter((i) => i >= 0);
    const base = cores.reduce((b, i) => (dist(d.P[i], { x: 0, y: 1.05 }) < dist(d.P[b], { x: 0, y: 1.05 }) ? i : b), cores[0]);
    const np = { x: d.P[base].x + 0.05, y: d.P[base].y + 0.13 }, near = cores.reduce((b, i) => (dist(d.P[i], np) < dist(d.P[b], np) ? i : b), cores[0]);
    const q = E(u, 0.2, 0.6); if (q <= 0) return; const y = lerp(1.8, np.y, q);
    epsC(ax, np, d.EPS, { u: E(u, 1.2, 1.7), col: INK, fill: INK, fo: 0.05 });
    const g = E(u, 1.7, 2.1); if (g > 0) el('line', { x1: ax.X(np.x), y1: ax.Y(np.y), x2: ax.X(lerp(np.x, d.P[near].x, g)), y2: ax.Y(lerp(np.y, d.P[near].y, g)), stroke: INK, 'stroke-width': 2.5 });
    const col = u > 2.2 ? CL[d.DB.labels[near]] : INK; const cx = ax.X(np.x), cy = ax.Y(y);
    el('path', { d: `M${cx},${cy - 11} L${cx + 3.5},${cy - 3.5} L${cx + 11},${cy - 3.5} L${cx + 5},${cy + 2} L${cx + 7},${cy + 10} L${cx},${cy + 5} L${cx - 7},${cy + 10} L${cx - 5},${cy + 2} L${cx - 11},${cy - 3.5} L${cx - 3.5},${cy - 3.5} Z`, fill: col, stroke: PANEL, 'stroke-width': 1 });
    tx(cx + 16, cy - 10, '새 점', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) }); }
  // 추가 beat: border 는 먼저 닿은 클러스터에 (그림 칸 오른쪽에 확대 그림)
  function orderDemo(u) { zone(548, 30, 392, 360, 'border 하나가 두 core 반경에 걸칠 때', { fill: SOFT });
    const A = [655, 200], B = [825, 200], M = [740, 200], r = 95;
    [[A, ACC, 0.3], [B, INFO, 1.3]].forEach(([p, col, a]) => { el('circle', { cx: p[0], cy: p[1], r: r * E(u, a, a + 0.5), fill: col, 'fill-opacity': 0.08, stroke: col, 'stroke-dasharray': '5 4', 'stroke-width': 1.8 });
      el('circle', { cx: p[0], cy: p[1], r: 9, fill: col }); });
    lbl(A[0], A[1] + 34, 'core (클러스터 0)', 1, { fill: ACC, 'font-size': 15 }); lbl(B[0], B[1] + 34, 'core (클러스터 1)', 1, { fill: INFO, 'font-size': 15 });
    const first = u > 0.8, col = first ? ACC : MUT; el('circle', { cx: M[0], cy: M[1], r: 8, fill: PANEL, stroke: col, 'stroke-width': 2.5 });
    lbl(M[0], M[1] - 22, 'border', 1, { fill: col, 'font-size': 15 });
    R.dot([A, M], seg(u, 0.4, 0.8), ACC, 6); R.dot([B, M], seg(u, 1.4, 1.8), INFO, 6);
    if (u > 1.8) { card(M[0], 78, 220, 34, { rx: 8, text: '이미 클러스터 0 → 그대로', fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 1.8) }); }
    tx(744, 316, 'core · noise 판정 = 순서와 무관', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
    tx(744, 344, 'border 소속만 처리 순서에 따른다', { 'text-anchor': 'middle', 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.3) }); }
  const zone = R.zone;
  // K-means 와 나란히 (전면 두 그림)
  function compare(c, d) { const { u } = c, W = 420;
    [['K-means', 40, 0.2], ['DBSCAN', 500, 0.8]].forEach(([nm, x, a], j) => { const op = fade(u, a, 0.5), ax = plot(x, 30, W, { op });
      if (j === 0) bisLine(ax, bisector(d.KM.centroids[0], d.KM.centroids[1]), op, { op });
      d.P.forEach((p, i) => { if (j === 0) pt(ax, p, { col: KMC(d.KM.labels[i]), op: op * 0.9, r: 5 }); else { const l = d.DB.labels[i]; if (l === -1) pt(ax, p, { kind: 'x', col: BAD, op, r: 5 }); else pt(ax, p, { col: CL[l], kind: d.DB.kind[i] === 'border' ? 'ring' : 'fill', op, r: 5 }); } });
      if (j === 0) d.KM.centroids.forEach((q) => cent(ax, q, 1, { op }));
      lbl(x + W / 2, 362, nm, fade(u, a + 0.3), { 'font-size': 17, fill: j ? ACC : WARN });
      sub(x + W / 2, 392, j ? '모양 그대로 2개 · 이상치 -1 격리' : '초승달 반 토막 · 이상치 강제 배정', fade(u, 1.5 + j * 0.4), { 'font-size': 15, fill: INK, 'font-weight': 600 }); }); }

  // ---------- 4. k-distance 로 eps 고르기 ----------
  let RAW = null;
  function rawK(d) { if (RAW) return RAW; const v = d.P.map((p) => d.P.map((q) => dist(p, q)).sort((a, b) => a - b)[3]);
    const idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b] || a - b), rank = []; idx.forEach((i, r) => { rank[i] = r; }); RAW = { v, rank }; return RAW; }
  function mini(d, y, res, eps, colored, op) { const ax = plot(560, y, 170, { op });
    d.P.forEach((p, i) => { if (!colored) { pt(ax, p, { col: OFF, r: 2.8, op }); return; } const l = res.labels[i];
      if (l === -1) pt(ax, p, { kind: 'x', col: BAD, r: 2.6, op }); else pt(ax, p, { col: CL[l % 2], r: 2.8, op }); });
    return ax; }
  function s4(t, c) { const { k, u } = c, d = D(); if (!d) return;
    if (k === 0) { const ax = plot(600, 70, 300); d.P.forEach((p, i) => pt(ax, p, { col: INK, op: 0.5 * fade(u, 0.2), r: 3.5 }));
      lbl(750, 70 + ax.h + 30, '특징 2개 → 2차원', fade(u, 1.2), { 'font-size': 16 });
      tx(60, 150, 'MIN_PTS', { 'font-size': 26, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.3) });
      tx(190, 150, '= 2 × 차원', { 'font-size': 26, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(190, 206, '= 2 × 2', { 'font-size': 26, 'font-weight': 700, opacity: fade(u, 1.3) });
      card(250, 260, 120, 54, { rx: 12, text: '= 4', fs: 26, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.8) });
      sub(250, 336, '노이즈가 많으면 키워서 core 판정을 깐깐하게', fade(u, 2.2), { 'font-size': 15 });
      return; }
    const ax = axes(80, 46, 400, 290, { x: [0, 86], y: [0, 1], yt: [0, 0.25, 0.5, 0.75, 1], yl: '3번째 이웃까지 거리', xl: '점 86개 (거리 오름차순)' });
    const { v, rank } = rawK(d), grow0 = k === 1 ? E(u, 0.2, 0.7) : 1, srt = k === 1 ? E(u, 0.9, 2.2) : 1, bop = k === 1 ? 0.8 : 0.35;
    v.forEach((val, i) => { const xp = lerp(i, rank[i], srt), h = (ax.Y(0) - ax.Y(val)) * grow0;
      el('rect', { x: ax.X(xp + 0.5) - 1.8, y: ax.Y(0) - h, width: 3.6, height: h, fill: i >= 80 ? BAD : ACC, opacity: bop }); });
    if (k === 1) { tx(470, 90, '빨강 = 이상치 6점', { 'font-size': 15, fill: BAD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.9) }); }
    if (k >= 2) { line(ax, d.KD.map((val, i) => [i + 0.5, val]), k === 2 ? E(u, 0.2, 1.2) : 1, INK, { sw: 2.4 });
      const e = k === 2 ? E(u, 1.3, 1.8) : 1; if (e > 0) el('line', { x1: ax.X(0), y1: ax.Y(0.25), x2: ax.X(86 * e), y2: ax.Y(0.25), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      mono(ax.X(2), ax.Y(0.25) - 8, 'elbow ≈ 0.25', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: k === 2 ? fade(u, 1.7) : 1 });
      if (k === 2) { tx(ax.X(60), ax.Y(0.78), '꺾인 뒤 꼬리', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.1) }); tx(ax.X(60), ax.Y(0.78) + 22, '= 이상치들의 이웃 거리', { 'font-size': 15, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.2) }); } }
    const lineAt = (val, col, s1, s2, op) => { if (op <= 0) return; el('line', { x1: ax.X(0), y1: ax.Y(val), x2: ax.X(86), y2: ax.Y(val), stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': '3 4', opacity: op });
      if (s1) tx(ax.X(86) - 4, ax.Y(val) - 8, s1, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: op }); if (s2) tx(ax.X(86) - 4, ax.Y(val) + 20, s2, { 'font-size': 14, fill: col, 'text-anchor': 'end', opacity: op }); };
    if (k === 4) { lineAt(0.1, WARN, null, null, fade(u, 0.3)); tx(ax.X(3), ax.Y(0.72), '점선 = eps 0.10 · 거의 모든 점이 선 위', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) }); tx(ax.X(3), ax.Y(0.72) + 24, '→ core 가 못 되고 noise 로', { 'font-size': 15, fill: WARN, opacity: fade(u, 1.0) }); }
    if (k === 5) lineAt(0.9, INFO, 'eps 0.90 — 모든 점이 선 아래 → 전부 core', null, fade(u, 1.2));
    if (k === 2 || k === 1) return;
    // 미니 산점도 셋
    const R3 = [[0.1, d.DBS, 4], [0.25, d.DB, 5], [0.9, d.DBB, 5]], dim = k === 6 ? 0.18 : 1;
    if (k !== 6) R3.forEach(([eps, res, at], j) => { const y = 22 + j * 132, op = (k === 3 ? fade(u, 0.3 + j * 0.4) : 1) * dim, on = k > at || (k === at && (j !== 2 || u > 1.0));
      mini(d, y, res, eps, on && k >= 4, op);
      mono(745, y + 44, `eps = ${eps.toFixed(2)}`, { 'font-size': 16, 'font-weight': 800, opacity: op });
      if (on && k >= 4) mono(745, y + 72, `클러스터 ${res.nClusters} · noise ${res.nNoise}`, { 'font-size': 15, 'font-weight': 700, fill: j === 1 ? GOOD : j === 0 ? BAD : WARN, opacity: (k === at ? fade(u, j === 2 ? 1.4 : 0.6) : 1) * dim });
      if (on && k >= 5 && j === 1) mono(745, y + 98, '← 적정', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: dim }); });
    if (k === 6) { [['min_samples ↑', 'core 판정 깐깐 → noise 증가 · 보수적', WARN], ['min_samples ↓', '성긴 지역까지 이어져 → 군집 과합병', INFO]].forEach(([a, b], i) => {
        const y = 120 + i * 150, s = pop(u, 0.3 + i * 0.7); card(745, y, 380, 100, { rx: 12, stroke: C[i ? 'INFO' : 'WARN'], fill: PANEL, s });
        tx(575, y - 10, a, { 'font-size': 18, 'font-weight': 800, class: 'mono', fill: b && i ? INFO : WARN, opacity: fade(u, 0.4 + i * 0.7) });
        tx(575, y + 22, b, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.7) }); }); } }

  // ---------- 5. 언제 무엇을 ----------
  function blob(cx, cy, n, sp, seed, col, op, o) { o = o || {}; for (let i = 0; i < n; i++) { const a = hsh(seed + i) * 6.283, rr = Math.sqrt(hsh(seed + i + 500)) * sp;
      el('circle', { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr * (o.squash || 0.8), r: o.r || 4, fill: col, opacity: op }); } }
  function xmark(x, y, r, op) { el('path', { d: `M${x - r},${y - r} L${x + r},${y + r} M${x + r},${y - r} L${x - r},${y + r}`, stroke: BAD, 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: op }); }
  function s5(t, c) { const { k, u } = c, d = D(); if (!d) return;
    if (k <= 1) { const cols = [['K-means', '볼록한 덩어리 · k 를 앎 · 대용량', WARN], ['DBSCAN', '임의 모양 · 개수 미지 · 이상치', ACC], ['HDBSCAN', '+ 클러스터마다 밀도가 다를 때', INFO]];
      cols.forEach(([nm, crit, col], i) => { const cx = 165 + i * 315, op = k === 0 ? fade(u, 0.3 + i * 0.6) : 1;
        el('rect', { x: cx - 145, y: 24, width: 290, height: k === 0 ? 290 : 250, rx: 12, fill: SOFT, stroke: col, 'stroke-width': 2, opacity: op });
        lbl(cx, 54, nm, op, { 'font-size': 18, fill: col });
        if (i === 0) { [[-60, 130, INFO], [0, 175, WARN], [60, 125, ACC]].forEach(([dx, cy, cl], j) => { blob(cx + dx, cy, 12, 26, 10 + j * 30, cl, op * 0.85); cent({ X: (v) => v, Y: (v) => v, s: 1 }, { x: cx + dx, y: cy }, 0.7, { op }); }); }
        if (i === 1) { const ax = plot(cx - 115, 70, 230, { frame: false }); d.P.forEach((p, j) => { const l = d.DB.labels[j]; if (l === -1) pt(ax, p, { kind: 'x', col: BAD, r: 3, op }); else pt(ax, p, { col: CL[l], r: 3.2, op }); }); }
        if (i === 2) { blob(cx - 55, 140, 22, 22, 300, ACC, op * 0.85, { r: 3.5 }); blob(cx + 50, 150, 12, 55, 400, INFO, op * 0.85, { r: 3.5 }); xmark(cx + 110, 90, 5, op); xmark(cx - 110, 215, 5, op); }
        sub(cx, 270, crit, k === 0 ? fade(u, 0.6 + i * 0.6) : 1, { 'font-size': 15, fill: INK, 'font-weight': 600 }); });
      if (k === 0) tx(480, 365, '문제의 모양이 알고리즘을 고른다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.2) });
      if (k === 1) { snippet(130, 300, ['from sklearn.cluster import DBSCAN, HDBSCAN'], { fs: 16, op: fade(u, 0.3) });
        pill(740, 324, 'scikit-learn ≥ 1.3', ACC, pop(u, 1.0), { mono: true, fs: 15 });
        sub(740, 372, '별도 hdbscan 패키지 설치 불필요', fade(u, 1.6), { 'font-size': 15, fill: INK }); }
      return; }
    if (k === 2 || k === 3) { // GPS 승차 지점: 휘어진 도로 위의 점
      zone(24, 24, 520, 372, '승차 GPS 지도', { fill: SOFT });
      const bz = (q) => { const a = [70, 340], b = [160, 60], cc = [400, 380], e = [520, 90], m = 1 - q; return [m * m * m * a[0] + 3 * m * m * q * b[0] + 3 * m * q * q * cc[0] + q * q * q * e[0], m * m * m * a[1] + 3 * m * m * q * b[1] + 3 * m * q * q * cc[1] + q * q * q * e[1]]; };
      const road = []; for (let i = 0; i <= 40; i++) road.push(bz(i / 40)); el('polyline', { points: road.map((p) => p.join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 26, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      const pts = []; for (let i = 0; i < 46; i++) { const hot = i < 24 ? 0 : 1, q = hot === 0 ? 0.12 + hsh(i) * 0.24 : 0.6 + hsh(i) * 0.24, [x, y] = bz(q); pts.push([x + (hsh(i + 70) - 0.5) * 18, y + (hsh(i + 90) - 0.5) * 18, hot]); }
      const errs = [[120, 120], [300, 90], [470, 330], [250, 330], [500, 220]];
      pts.forEach(([x, y, h], i) => { const s = k === 2 ? pop(u, 0.2 + i * 0.012, 0.3) : 1; el('circle', { cx: x, cy: y, r: 5 * s, fill: k === 3 && u > 0.3 + h * 0.5 ? CL[h] : INK, opacity: 0.85 }); });
      errs.forEach(([x, y], i) => { if (k === 3 && u > 1.3) xmark(x, y, 6, 1); else el('circle', { cx: x, cy: y, r: 5, fill: INK, opacity: (k === 2 ? fade(u, 0.8) : 1) * 0.85 }); });
      if (k === 2) { const [x, y] = bz(0.24); el('circle', { cx: x, cy: y, r: 46 * E(u, 1.0, 1.5), fill: ACC, 'fill-opacity': 0.08, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); mono(x + 52, y + 4, '150m', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) }); }
      if (k === 3) { const [x0, y0] = bz(0.24), [x1, y1] = bz(0.72); lbl(x0 + 10, y0 + 50, '핫스팟 0', fade(u, 0.6), { fill: ACC }); lbl(x1 - 10, y1 + 52, '핫스팟 1', fade(u, 1.0), { fill: INFO });
        lbl(300, 128, '-1 = 오류 좌표', fade(u, 1.6), { fill: BAD }); }
      if (k === 2) { head(70, '"반경 150m 에 5건 이상"', fade(u, 0.2));
        [['np.radians(lat, lon)', '위경도 → 라디안'], ['eps = 150 / 6_371_000', '지구 반지름(m)으로 나눔'], ['min_samples = 5', '5건 이상'], ['metric = "haversine"', '구면 거리']].forEach(([a, b], i) => { const y = 120 + i * 62, op = fade(u, 0.5 + i * 0.4);
          mono(568, y, a, { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: op }); tx(568, y + 24, b, { 'font-size': 14, fill: MUT, opacity: op }); }); }
      if (k === 3) { head(70, 'fit_predict(coords)', fade(u, 0.1));
        tx(568, 130, '도로 모양대로 휘어진 핫스팟', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
        tx(568, 166, '오류 좌표 → -1 로 자동 격리', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
        tx(568, 240, 'K-means 였다면', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); tx(568, 264, '도로를 직선으로 자르고 오류 좌표도 넣었다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 4) { const ax = axes(70, 40, 430, 300, { x: [0, 1], y: [0, 1], xl: '거래 금액', yl: '거래 시각' });
      blob(ax.X(0.25), ax.Y(0.65), 26, 46, 600, INFO, 0.8 * fade(u, 0.2)); blob(ax.X(0.55), ax.Y(0.28), 26, 52, 700, ACC, 0.8 * fade(u, 0.4));
      const odd = [[0.92, 0.9], [0.88, 0.12], [0.08, 0.1], [0.62, 0.95]];
      odd.forEach(([x, y], i) => { const q = seg(u, 1.2 + i * 0.25, 1.7 + i * 0.25); xmark(ax.X(x), ax.Y(y), 7, fade(u, 0.7));
        if (q > 0) { const yy = 150 + i * 46; if (q < 1) R.fly(ax.X(x), ax.Y(y), 640, yy, q, '-1', { fill: BAD }); else { el('rect', { x: 600, y: yy - 17, width: 300, height: 34, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 1.5 }); tx(616, yy + 5, `조사 대상 거래 ${i + 1}`, { 'font-size': 15, 'font-weight': 700, fill: BAD }); } } });
      mono(600, 80, 'suspicious =', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.9) }); mono(600, 106, '  txn_df[labels == -1]', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
      tx(600, 360, '"정상" 을 정의하지 않고도', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); tx(600, 384, '정상 군집 밖을 찾는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) });
      return; }
    if (k === 5) { zone(24, 24, 600, 372, null, { fill: SOFT });
      const DX = 170, DY = 210, SX = 450, SY = 200, hd = u > 1.5;
      lbl(DX, 60, '도심 (빽빽)', 1, { fill: INK }); lbl(SX, 60, '교외 (성김)', 1, { fill: INK });
      blob(DX, DY, 30, 50, 800, ACC, 0.85, { r: 4.5 });
      for (let i = 0; i < 14; i++) { const a = hsh(i + 900) * 6.283, rr = 30 + Math.sqrt(hsh(i + 950)) * 100, x = SX + Math.cos(a) * rr, y = SY + Math.sin(a) * rr * 0.8;
        if (hd) el('circle', { cx: x, cy: y, r: 4.5 * (0.5 + 0.5 * pop(u, 1.6 + i * 0.03)), fill: INFO, opacity: 0.85 }); else if (u > 0.9) xmark(x, y, 5, 1); else el('circle', { cx: x, cy: y, r: 4.5, fill: OFF }); }
      [[DX - 20, DY], [SX + 40, SY - 20]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 32 * E(u, 0.3, 0.8), fill: 'none', stroke: hd ? OFF : INK, 'stroke-width': 2, 'stroke-dasharray': '5 4' }));
      sub(DX, 360, 'eps 하나 = 같은 크기의 원', fade(u, 0.5), { 'font-size': 15, fill: INK });
      sub(SX, 360, hd ? 'HDBSCAN 은 교외도 군집으로' : '교외는 전부 noise 로', fade(u, 0.9), { 'font-size': 15, fill: hd ? INFO : BAD, 'font-weight': 700 });
      head(80, 'DBSCAN', 1, hd ? OFF : INK); tx(660, 110, 'eps 하나로는 둘 다 못 맞춘다', { 'font-size': 15, fill: hd ? OFF : BAD, opacity: fade(u, 1.0) });
      card(790, 200, 300, 48, { rx: 10, text: 'HDBSCAN(min_cluster_size=5)', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.5) });
      [['eps 파라미터 없음', 1.9], ['여러 eps 를 계층적으로 훑는다', 2.1]].forEach(([s, a], i) => tx(660, 268 + i * 30, s, { 'font-size': 15, 'font-weight': i ? 400 : 700, opacity: fade(u, a) }));
      return; }
    if (k === 6) { const box = c.beat.compareBox; if (!box) return; const rows = box.rows, X0 = 40, XK = 600, XD = 770, top = 48, rh = 48;
      tx(X0, top, '상황', { 'font-size': 15, 'font-weight': 800, fill: MUT }); tx(XK, top, 'K-means', { 'font-size': 15, 'font-weight': 800, fill: WARN }); tx(XD, top, 'DBSCAN', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      el('line', { x1: X0, y1: top + 12, x2: 920, y2: top + 12, stroke: INK, 'stroke-width': 2 });
      const mc = (v) => (v.startsWith('◎') ? GOOD : v.startsWith('✗') ? BAD : MUT);
      rows.forEach((r, i) => { const y = top + 44 + i * rh, op = fade(u, 0.2 + i * 0.3);
        if (i % 2) el('rect', { x: X0 - 8, y: y - 30, width: 888, height: rh, fill: SOFT, opacity: op });
        tx(X0, y, r.crit, { 'font-size': 15.5, opacity: op }); tx(XK, y, r.km, { 'font-size': 15.5, 'font-weight': 700, fill: mc(r.km), opacity: op }); tx(XD, y, r.db, { 'font-size': 15.5, 'font-weight': 700, fill: mc(r.db), opacity: op }); });
      tx(480, 404, '밀도까지 제각각이면 → HDBSCAN · 어느 쪽이든 StandardScaler 먼저', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 2.2) }); } }

  RA.page({ title: '군집 실험실 — K-means 와 DBSCAN', scenes: [s1, s2, s3, s4, s5] });
})();
