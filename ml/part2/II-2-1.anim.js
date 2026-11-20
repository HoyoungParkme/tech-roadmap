/* II-2-1 SVM — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 결정 경계 = 두 마을 사이에 낸 "도로". 마진 = 도로 폭, 서포트 벡터 = 도로 가장자리에 붙은 집.
 * 숫자는 페이지의 코드 주석·STEPS 데이터(cTrade, gamma, compare)에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, fly, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통: 산점도 판 ----------
  const PL = { x: 60, y: 40, w: 320, h: 320 };
  function plot(o) { o = o || {};
    const p = Object.assign({ x: [0, 100], y: [0, 100], xt: [0, 50, 100], yt: [0, 50, 100], xl: '이용시간', yl: '결제액' }, o);
    const ax = R.axes(o.px ?? PL.x, o.py ?? PL.y, o.pw ?? PL.w, o.ph ?? PL.h, p);
    const cp = el('clipPath', { id: o.id || 'ra221c' }); el('rect', { x: ax.x, y: ax.y, width: ax.w, height: ax.h }, cp);
    return ax; }
  // 점: A = 파란 원(유지), B = 주황 네모(이탈)
  function pt(ax, x, y, cls, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1; if (s <= 0.02 || op <= 0.02) return;
    const cx = ax.X(x), cy = ax.Y(y), r = (o.r || 7) * s, col = cls === 'A' ? INFO : WARN;
    if (cls === 'A') el('circle', { cx, cy, r, fill: o.hollow ? PANEL : col, stroke: col, 'stroke-width': 2, opacity: op, 'stroke-dasharray': o.dash });
    else el('rect', { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, rx: 2, fill: o.hollow ? PANEL : col, stroke: col, 'stroke-width': 2, opacity: op, 'stroke-dasharray': o.dash });
    if (o.ring) el('circle', { cx, cy, r: r + 7, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: o.ring });
    if (o.bad) el('circle', { cx, cy, r: r + 5, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: o.bad }); }
  // w1·x + w2·y + b = 0 직선을 판 안에서 u 만큼 그린다
  function seg2(w1, w2, b, L) { L = L || 100; const P = []; const add = (x, y) => { if (x > -1e-6 && x < L + 1e-6 && y > -1e-6 && y < L + 1e-6 && !P.some((q) => Math.hypot(q[0] - x, q[1] - y) < 1e-3)) P.push([x, y]); };
    if (Math.abs(w2) > 1e-9) { add(0, -b / w2); add(L, -(b + L * w1) / w2); } if (Math.abs(w1) > 1e-9) { add(-b / w1, 0); add(-(b + L * w2) / w1, L); }
    P.sort((a, c) => a[0] - c[0] || c[1] - a[1]); return P; }
  function wline(ax, w1, w2, b, u, col, o) { o = o || {}; const p = seg2(w1, w2, b, o.lim); if (p.length < 2 || u <= 0) return null; const [a, c] = p, f = clamp(u);
    el('line', { x1: ax.X(a[0]), y1: ax.Y(a[1]), x2: ax.X(lerp(a[0], c[0], f)), y2: ax.Y(lerp(a[1], c[1], f)), stroke: col || MUT, 'stroke-width': o.sw || 2.6, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linecap': 'round' }); return p; }
  // 도로(마진): 중심선 w·x+b=0 양쪽으로 폭 width(데이터 단위)
  function road(ax, w1, w2, b, width, o) { o = o || {}; if (width <= 0.05) return; const n2 = w1 * w1 + w2 * w2, n = Math.sqrt(n2), p0 = [-b * w1 / n2, -b * w2 / n2], d = [-w2 / n, w1 / n];
    el('line', { x1: ax.X(p0[0] - 300 * d[0]), y1: ax.Y(p0[1] - 300 * d[1]), x2: ax.X(p0[0] + 300 * d[0]), y2: ax.Y(p0[1] + 300 * d[1]), stroke: o.col || ACCBG, 'stroke-width': width * ax.w / 100, opacity: o.op ?? 1, 'clip-path': `url(#${o.id || 'ra221c'})` });
    if (o.edges !== false) [-1, 1].forEach((sg) => wline(ax, w1, w2, b + sg * (width / 2) * n, 1, o.edge || ACC, { dash: '7 6', sw: 2, op: o.op ?? 1 })); }
  const proj = (x, y, c) => { const t = (c - x - y) / 2; return [x + t, y + t]; };   // x+y=c 로 내린 수선의 발
  const A8 = [[15, 25], [25, 15], [30, 40], [45, 25]], B8 = [[62, 78], [78, 62], [60, 70], [72, 58]];
  const P8 = A8.map((p) => [...p, 'A']).concat(B8.map((p) => [...p, 'B']));
  const isSV = (p) => p[0] + p[1] === 70 || p[0] + p[1] === 130;          // 마진 위의 점 4개
  const isSV3 = (p) => isSV(p) && !(p[0] === 60 && p[1] === 70);          // sklearn 이 저장한 3개 (α>0)
  const MW = 42.43;    // 하드 마진 폭 2/‖w‖ (코드 주석 margin = 42.43)
  function dots(ax, pts, f) { pts.forEach((p, i) => pt(ax, p[0], p[1], p[2], f ? f(p, i) : {})); }
  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op }, a || {})); }

  // ---------- 1. 무수한 분리선 ----------
  const CAND = [[1, 1, -78, '①', 'w=(1,1)  b=−78', 'A에 바짝'], [1, 1, -122, '②', 'w=(1,1)  b=−122', 'B에 바짝'], [2, 1, -150, '③', 'w=(2,1)  b=−150', '기울기 급함']];
  const CLBL = [[70, 4], [96, 30], [33, 92]];
  function candCards(u, k) { CAND.forEach(([, , , n, wb, why], i) => { const y = 110 + i * 62, s = k === 1 ? pop(u, 0.3 + i * 0.5) : 1;
      card(600, y, 300, 46, { rx: 8, stroke: MUT, s, text: `${n}  ${wb}`, fs: 15, mono: true, fw: 700 });
      tx(760, y + 6, why, { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 0.5 + i * 0.5) : 1 }); }); }
  function s1(t, c) { const { k, u } = c;
    const ax = plot();
    if (k === 0) {
      el('rect', { x: 460, y: 46, width: 270, height: 312, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(484, 72, 'X (시간, 결제)', { 'font-size': 14, 'font-weight': 700, fill: MUT }); mono(680, 72, 'y', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      P8.forEach(([x, y, cl], i) => { const at = 0.3 + i * 0.2, op = fade(u, at, 0.25), yy = 104 + i * 31;
        mono(484, yy, `[${x}, ${y}]`, { 'font-size': 15, opacity: op }); mono(684, yy, cl === 'A' ? '0' : '1', { 'font-size': 15, 'font-weight': 700, fill: cl === 'A' ? INFO : WARN, opacity: op });
        pt(ax, x, y, cl, { s: pop(u, at) }); });
      pill(830, 150, 'A 4건 · 유지', INFO, pop(u, 2.0), { fs: 15 }); pill(830, 200, 'B 4건 · 이탈', WARN, pop(u, 2.15), { fs: 15 });
      note(760, 270, '두 무리가 겹치지 않는다', fade(u, 2.3)); return; }
    dots(ax, P8);
    if (k === 1 || k === 2) { CAND.forEach(([w1, w2, b], i) => { const at = 0.3 + i * 0.5, f = k === 1 ? E(u, at, at + 0.5) : 1;
        wline(ax, w1, w2, b, f, MUT, { dash: '8 6' }); lbl(ax.X(CLBL[i][0]), ax.Y(CLBL[i][1]), CAND[i][3], f > 0.9 ? 1 : 0, { fill: MUT }); });
      candCards(u, k);
      if (k === 1) note(450, 330, '세 직선 모두 두 무리를 나눈다 — 무엇이 더 좋은가?', fade(u, 2.1));
      if (k === 2) { CAND.forEach((_, i) => pill(860, 110 + i * 62, 'acc 1.0', GOOD, pop(u, 0.4 + i * 0.35), { mono: true, fs: 14.5 }));
        note(450, 330, '정확도가 전부 같다 → 이 자로는 고를 수 없다', fade(u, 1.7), { fill: BAD }); cross(870, 300, 12, pop(u, 2.0)); } return; }
    if (k === 3) { wline(ax, 1, 1, -100, E(u, 0.2, 0.7), INK, { sw: 3 });
      P8.forEach(([x, y], i) => { const [fx, fy] = proj(x, y, 100), g = E(u, 0.8 + i * 0.12, 1.1 + i * 0.12); if (g > 0) el('line', { x1: ax.X(x), y1: ax.Y(y), x2: ax.X(lerp(x, fx, g)), y2: ax.Y(lerp(y, fy, g)), stroke: INFO, 'stroke-width': 1.6, opacity: 0.7 }); });
      dots(ax, P8);
      lbl(640, 90, '로지스틱 회귀', fade(u, 0.3), { 'font-size': 18 });
      note(470, 150, '8개 점 전부가 선을 당긴다', fade(u, 1.0));
      mono(470, 200, 'max Σ log P(yᵢ | xᵢ)', { 'font-size': 18, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
      sub(640, 236, '멀리 있는 점까지 모든 점의 로그 우도 합', fade(u, 1.8), { 'font-size': 14.5 });
      pill(640, 300, '출력 = 확률', INFO, pop(u, 2.2), { fs: 15 }); return; }
    if (k === 4) { road(ax, 1, 1, -100, MW * E(u, 1.4, 2.0), { edges: u > 1.9 });
      wline(ax, 1, 1, -100, 1, INK, { sw: 3 });
      P8.forEach(([x, y], i) => { if (!isSV([x, y])) return; const [fx, fy] = proj(x, y, 100), g = E(u, 0.4, 1.0);
        el('line', { x1: ax.X(x), y1: ax.Y(y), x2: ax.X(lerp(x, fx, g)), y2: ax.Y(lerp(y, fy, g)), stroke: ACC, 'stroke-width': 2.6 }); });
      dots(ax, P8, (p) => ({ op: isSV(p) ? 1 : 1 - 0.65 * E(u, 0.3, 0.8), ring: isSV(p) ? fade(u, 0.5) : 0 }));
      lbl(640, 90, 'SVM', fade(u, 0.3), { 'font-size': 18, fill: ACC });
      note(470, 150, '경계에 가장 가까운 점만 본다', fade(u, 0.8));
      note(470, 186, '그 거리 = 마진 (도로 폭)', fade(u, 1.4), { fill: ACC });
      sub(640, 236, '멀리 있는 점은 기준에서 빠진다', fade(u, 1.8), { 'font-size': 14.5 });
      pill(640, 300, '기준 = 거리, 확률은 버린다', ACC, pop(u, 2.2), { fs: 15 }); return; }
    if (k === 5) { road(ax, 1, 1, -100, MW, { op: fade(u, 0.2) });
      wline(ax, 1, 1, -78, 1, BAD, { dash: '8 6' }); wline(ax, 1, 1, -100, 1, ACC, { sw: 3 });
      const w = E(u, 0.6, 1.8), nx = lerp(30, 37, w) + Math.sin(u * 9) * 1.2 * (1 - w), ny = lerp(40, 47, w);
      pt(ax, nx, ny, 'A', { hollow: true, dash: '3 3', s: pop(u, 0.4) });
      sub(ax.X(nx) + 46, ax.Y(ny) - 12, '새 A 고객', fade(u, 0.5), { 'font-size': 14 });
      note(470, 110, '새 데이터는 훈련 점 근처에서 흔들린다', fade(u, 0.4));
      tx(470, 170, '① A에 바짝 붙은 선', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); cross(720, 165, 10, pop(u, 1.9)); sub(800, 170, '→ 오분류', fade(u, 1.9), { fill: BAD });
      tx(470, 220, '여유가 넓은 선', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); check(720, 215, 11, pop(u, 2.2)); sub(800, 220, '→ 흡수', fade(u, 2.2), { fill: GOOD });
      note(470, 300, '"얼마나 여유 있게 나눴나" = 마진', fade(u, 2.4)); } }

  // ---------- 2. 마진 최대화 ----------
  function s2(t, c) { const { k, u } = c, ax = plot();
    if (k === 0) { const g = E(u, 0.3, 1.4); road(ax, 1, 1, -100, MW * g, { edges: g > 0.98 }); wline(ax, 1, 1, -100, 1, INK, { sw: 3 }); dots(ax, P8);
      if (g > 0.2) { const a = proj(35, 35, 100 - 30 * g), b2 = proj(65, 65, 100 + 30 * g); el('line', { x1: ax.X(50 - 15 * g), y1: ax.Y(50 - 15 * g), x2: ax.X(50 + 15 * g), y2: ax.Y(50 + 15 * g), stroke: INK, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' });
        mono(ax.X(64), ax.Y(38), '2/‖w‖', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); }
      card(660, 110, 360, 56, { rx: 10, stroke: ACC, text: 'maximize   2 / ‖w‖', fs: 18, mono: true, color: ACC, s: pop(u, 0.6) });
      mono(660, 170, '= minimize ‖w‖', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      card(660, 240, 360, 56, { rx: 10, stroke: INK, text: '제약  yᵢ (w·xᵢ + b) ≥ 1', fs: 17, mono: true, s: pop(u, 1.8) });
      sub(660, 290, '모든 점이 도로 밖에 있어야 한다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { road(ax, 1, 1, -100, MW, { op: fade(u, 1.0, 0.5) }); wline(ax, 1, 1, -100, E(u, 0.5, 1.1), INK, { sw: 3 }); dots(ax, P8);
      card(660, 100, 380, 54, { rx: 10, stroke: ACC, text: 'SVC(kernel="linear", C=1e6)', fs: 16, mono: true, color: ACC, s: pop(u, 0.2) });
      grow(500, 140, 400, 200, E(u, 0.4, 0.8), ACC);
      note(500, 230, 'C 를 아주 크게 = 위반 벌점이 무한대', fade(u, 1.3));
      tx(500, 270, '도로 안에 들어온 점 0개', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); check(720, 264, 10, pop(u, 1.9));
      pill(660, 330, '하드 마진', INK, pop(u, 2.2), { fs: 15 }); return; }
    if (k === 2) { road(ax, 1, 1, -100, MW); wline(ax, 1, 1, -100, 1, INK, { sw: 3 });
      const sv = P8.filter(isSV3), rest = P8.filter((p) => !isSV3(p));
      rest.forEach((p) => pt(ax, p[0], p[1], p[2], { op: 1 - 0.65 * E(u, 1.4, 1.9) }));
      sv.forEach((p, i) => pt(ax, p[0], p[1], p[2], { ring: pop(u, 0.3 + i * 0.25) }));
      const z = [60, 70]; el('circle', { cx: ax.X(z[0]), cy: ax.Y(z[1]), r: 14, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: fade(u, 1.2) });
      mono(ax.X(z[0]) - 18, ax.Y(z[1]) - 18, 'α=0', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      mono(470, 80, 'svm.support_vectors_', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      sv.forEach((p, i) => card(560, 112 + i * 42, 140, 34, { rx: 6, text: `[${p[0]}. ${p[1]}.]`, fs: 15, mono: true, stroke: p[2] === 'A' ? INFO : WARN, color: p[2] === 'A' ? INFO : WARN, s: pop(u, 0.5 + i * 0.25) }));
      mono(470, 280, 'n_support_ = [2 1]', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7) });
      note(700, 120, '모델이 기억하는 점', fade(u, 1.2)); note(700, 150, '= 이 3개뿐', fade(u, 1.4), { fill: ACC });
      sub(780, 200, '(60,70) 은 마진 위지만 α=0', fade(u, 1.8), { 'font-size': 14.5 });
      sub(780, 228, '나머지 5개는 저장하지 않는다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 3) { road(ax, 1, 1, -100, MW); wline(ax, 1, 1, -100, 1, INK, { sw: 3 }); dots(ax, P8, (p) => ({ ring: isSV3(p) ? 1 : 0 }));
      const g = E(u, 0.3, 1.0); el('line', { x1: ax.X(35), y1: ax.Y(35), x2: ax.X(lerp(35, 65, g)), y2: ax.Y(lerp(35, 65, g)), stroke: BAD, 'stroke-width': 3, 'marker-end': g > 0.97 ? 'url(#ra-ahr)' : null });
      mono(ax.X(58), ax.Y(30), MW.toFixed(2), { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      [['w = svm.coef_[0]', 0.6], ['‖w‖ = np.linalg.norm(w)', 1.0], ['margin = 2 / ‖w‖', 1.4]].forEach(([s, at], i) => mono(470, 110 + i * 40, s, { 'font-size': 16, opacity: fade(u, at) }));
      const v = MW * E(u, 1.6, 2.3); mono(470, 270, `= ${v.toFixed(2)}`, { 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      sub(620, 320, '눈으로 보던 도로 폭이 숫자가 된다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 4) { road(ax, 1, 1, -100, MW); wline(ax, 1, 1, -100, 1, INK, { sw: 3 });
      dots(ax, P8, (p) => (p[0] === 15 && p[1] === 25 ? { op: 1 - 0.75 * E(u, 0.7, 1.1) } : { ring: isSV3(p) ? 1 : 0 }));
      cross(ax.X(15), ax.Y(25), 10, pop(u, 0.4));
      const d = 1 - E(u, 1.2, 2.0); if (u > 1.2) wline(ax, 1, 1, -100 - 22 * d, 1, BAD, { dash: '6 5', sw: 2.2 });
      mono(470, 110, 'mask[0] = False   # (15,25)', { 'font-size': 15, opacity: fade(u, 0.4) });
      mono(470, 150, 'svm2 = SVC(...).fit(X[mask], y[mask])', { 'font-size': 15, opacity: fade(u, 1.1) });
      mono(470, 210, 'np.allclose(coef_, coef_2)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      pill(820, 205, 'True', GOOD, pop(u, 2.2), { mono: true, fs: 16 });
      note(470, 290, '먼 점을 지워도 경계는 그대로', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 5) { const g = E(u, 1.0, 2.0), n0 = Math.SQRT2, n1 = Math.hypot(27, 33);
      const w1 = lerp(1 / n0, 27 / n1, g), w2 = lerp(1 / n0, 33 / n1, g), b = lerp(-100 / n0, -2949 / n1, g);
      wline(ax, 1, 1, -100, 1, OFF, { dash: '6 5', sw: 2, op: g });
      road(ax, w1, w2, b, lerp(MW, 42.64, g), { col: g > 0.05 ? WARNBG : ACCBG, edge: g > 0.05 ? WARN : ACC }); wline(ax, w1, w2, b, 1, g > 0.05 ? WARN : INK, { sw: 3 });
      dots(ax, P8, (p) => (p[0] === 30 && p[1] === 40 ? { op: 1 - 0.75 * E(u, 0.5, 0.9) } : { ring: (p[0] === 45 || p[0] === 72) && u > 2.0 ? fade(u, 2.0) : isSV3(p) && u < 0.9 ? 1 : 0 }));
      cross(ax.X(30), ax.Y(40), 10, pop(u, 0.3));
      note(470, 110, '서포트 벡터 (30,40) 하나를 지우면', fade(u, 0.3));
      note(470, 160, '경계가 통째로 기울어 움직인다', fade(u, 1.4), { fill: WARN });
      sub(640, 220, '이웃 SV 가 새로 경계를 붙잡는다', fade(u, 2.0), { 'font-size': 14.5 });
      pill(640, 290, '경계 근처 라벨 오류에 민감', BAD, pop(u, 2.3), { fs: 15 }); } }

  // ---------- 3. 소프트 마진과 C ----------
  const OUT2 = [[40, 50, 'A'], [30, 50, 'B']], P10 = P8.concat(OUT2);
  // 코드(X/10)로 학습한 실제 경계를 원래 좌표로: [w1, w2, b, 도로 폭] — 폭은 출력 margin × 10
  const CFIT = { 'C=0.01': [0.147, 0.163, -13.974, 91.1], 'C=1': [0.24713, 0.53448, -38.7931, 34.0], 'C=100': [-1.99902, 10.4948, -454.7726, 1.87] };
  function mini(x, y, s, id) { return plot({ px: x, py: y, pw: s, ph: s, xt: [], yt: [], xl: null, yl: null, id }); }
  function crow(rows, cname) { return (rows || []).find((r) => r.c === cname); }
  function s3(t, c) { const { k, u } = c, rows = (c.beat.pane.cTrade || {}).rows || [], prow = ((c.prev && c.prev.pane.cTrade) || {}).rows || [];
    if (k === 0) { const ax = plot(); road(ax, 1, 1, -100, MW); wline(ax, 1, 1, -100, 1, INK, { sw: 3 }); dots(ax, P8);
      const g = E(u, 1.4, 1.9); pt(ax, 44, 40, 'A', { hollow: true, dash: '3 3', s: pop(u, 1.2) });
      if (g > 0) { const [fx, fy] = proj(44, 40, 70); el('line', { x1: ax.X(fx), y1: ax.Y(fy), x2: ax.X(lerp(fx, 44, g)), y2: ax.Y(lerp(fy, 40, g)), stroke: BAD, 'stroke-width': 3 }); }
      mono(ax.X(30), ax.Y(52), 'ξ', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      mono(480, 120, '‖w‖² / 2', { 'font-size': 24, 'font-weight': 800, opacity: fade(u, 0.3) });
      mono(640, 120, '+ C · Σ ξᵢ', { 'font-size': 24, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) });
      sub(540, 152, '도로 폭', fade(u, 0.5), { 'font-size': 14.5 }); sub(720, 152, '위반량 벌점', fade(u, 1.1), { 'font-size': 14.5, fill: BAD });
      note(480, 230, 'ξ = 점이 도로 안으로 들어온 깊이', fade(u, 1.8));
      note(480, 280, 'C = 위반 1단위의 값 (환율)', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 1) { const ax = plot(), g = E(u, 1.2, 1.9);
      const H = CFIT['C=100'], hn = Math.hypot(H[0], H[1]), w1 = lerp(1 / Math.SQRT2, H[0] / hn, g), w2 = lerp(1 / Math.SQRT2, H[1] / hn, g), b0 = lerp(-100 / Math.SQRT2, H[2] / hn, g);
      road(ax, w1, w2, b0, lerp(MW, H[3], g), { col: g > 0.05 ? 'var(--badbg)' : ACCBG, edge: g > 0.05 ? BAD : ACC }); wline(ax, w1, w2, b0, 1, g > 0.05 ? BAD : INK, { sw: 3 });
      dots(ax, P8);
      OUT2.forEach(([x, y, cl], i) => { const f = E(u, 0.3 + i * 0.3, 0.9 + i * 0.3), sx = 470, sy = 120 + i * 50;
        if (f < 1) { const X = lerp(sx, ax.X(x), f), Y = lerp(sy, ax.Y(y), f); el('circle', { cx: X, cy: Y, r: 7, fill: cl === 'A' ? INFO : WARN }); }
        else pt(ax, x, y, cl, { bad: 1, s: 1 + bump(u, 0.9 + i * 0.3) }); });
      mono(470, 110, '[40, 50] → A (경계 바로 앞)', { 'font-size': 15, fill: INFO, opacity: fade(u, 0.3) });
      mono(470, 160, '[30, 50] → B (A 진영 한가운데)', { 'font-size': 15, fill: WARN, opacity: fade(u, 0.6) });
      note(470, 250, '하드 마진: 도로 폭이 거의 0', fade(u, 2.0), { fill: BAD });
      sub(640, 290, '두 점 사이로 경계가 눕듯이 기운다', fade(u, 2.3), { 'font-size': 15 }); return; }
    const NAMES = ['C=0.01', 'C=1', 'C=100'];
    if (k === 2) { NAMES.forEach((nm, i) => { const x = 50 + i * 305, at = 0.3 + i * 0.5, ax = mini(x, 70, 230, 'ra221m' + i);
        const F = CFIT[nm]; road(ax, F[0], F[1], F[2], F[3] * E(u, at, at + 0.6), { id: 'ra221m' + i }); wline(ax, F[0], F[1], F[2], E(u, at, at + 0.4), INK, { sw: 2.4 });
        dots(ax, P10, () => ({ r: 5 }));
        lbl(x + 115, 56, nm, fade(u, at), { 'font-size': 17, class: 'mono' });
        for (let f = 0; f < 5; f++) el('rect', { x: x + f * 47, y: 322, width: 41, height: 20, rx: 4, fill: f / 5 < E(u, 1.8, 2.5) ? ACC : SOFT, opacity: 0.85 }); });
      sub(480, 372, '같은 데이터 · C 만 바꿔 3번 학습 → 각각 5-폴드 교차검증', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k ≥ 3 : 성적표
    const COLS = [['C', 40], ['margin', 140], ['SV', 240], ['train', 300], ['cv', 380]];
    function sheet(x0, y0) { COLS.forEach(([h, dx]) => mono(x0 + dx, y0, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
      el('line', { x1: x0 + 30, y1: y0 + 10, x2: x0 + 450, y2: y0 + 10, stroke: GRID, 'stroke-width': 1.5 });
      rows.forEach((r, i) => { const old = crow(prow, r.c), op = old ? 1 : fade(u, 0.3 + i * 0.3), y = y0 + 40 + i * 38, best = r.c === 'C=1' && k >= 4;
        if (best) el('rect', { x: x0 + 30, y: y - 25, width: 420, height: 34, rx: 6, fill: ACCBG, opacity: fade(u, 1.6) });
        [r.c, String(r.margin), String(r.sv), r.train + '%', r.test + '%'].forEach((s, j) => mono(x0 + COLS[j][1], y, s, { 'font-size': 15.5, 'font-weight': j === 0 || j === 4 ? 700 : 400, fill: j === 4 ? ACC : INK, opacity: op })); }); }
    if (k === 3) { const ax = plot(), F = CFIT['C=100']; road(ax, F[0], F[1], F[2], F[3], { col: WARNBG, edge: WARN }); wline(ax, F[0], F[1], F[2], E(u, 0.2, 0.9), INK, { sw: 3 }); dots(ax, P10, (p) => ({ bad: p.length === 3 && OUT2.some((o) => o[0] === p[0] && o[1] === p[1]) ? 1 : 0 }));
      lbl(220, 24, 'C=100', 1, { class: 'mono', fill: WARN });
      sheet(420, 70);
      const r = crow(rows, 'C=100');
      if (r) { tx(460, 200, 'train', { 'font-size': 15, fill: MUT }); R.hbar(520, 186, 280, r.train, 100, { u: E(u, 1.0, 1.6), col: INK, text: r.train + '%' });
        tx(460, 240, 'cv', { 'font-size': 15, fill: MUT }); R.hbar(520, 226, 280, r.test, 100, { u: E(u, 1.3, 1.9), col: ACC, text: r.test + '%' }); }
      pill(660, 310, '훈련 ≫ 검증 = 과적합 신호', BAD, pop(u, 2.1), { fs: 15 }); return; }
    // k 4, 5 : 성적표 + 검증 곡선
    sheet(10, 60);
    const ch = R.axes(560, 60, 330, 250, { x: [-0.3, 2.3], y: [78, 102], yt: [80, 90, 100], grid: true, yl: '정확도 %' });
    const ord = ['C=0.01', 'C=1', 'C=100'], all = ord.map((n) => crow(rows, n));
    ord.forEach((n, i) => mono(ch.X(i), 335, n, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }));
    if (all.every(Boolean)) { const lu = k === 4 ? E(u, 0.9, 1.9) : 1;
      R.line(ch, all.map((r, i) => [i, r.train]), lu, INK, { dash: '7 5' }); R.line(ch, all.map((r, i) => [i, r.test]), lu, ACC, { sw: 3 });
      R.scatter(ch, all.map((r, i) => [i, r.test, ACC]), { u: lu, r: 5 });
      mono(ch.X(2) + 8, ch.Y(100) - 8, 'train', { 'font-size': 14, fill: INK, 'text-anchor': 'end', opacity: lu > 0.95 ? 1 : 0 });
      mono(ch.X(1), ch.Y(90) - 14, 'cv', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: lu > 0.95 ? 1 : 0 }); }
    if (k === 4) { note(30, 250, 'train 은 C 따라 0.80 → 0.90 → 1.00', fade(u, 1.9)); note(30, 282, 'cv 는 가운데(C=1, 0.90)에서 꺾인다', fade(u, 2.2), { fill: ACC }); return; }
    el('rect', { x: ch.X(-0.3), y: 60, width: ch.X(0.5) - ch.X(-0.3), height: 250, fill: INFOBG, opacity: 0.6 * fade(u, 0.3) });
    el('rect', { x: ch.X(1.5), y: 60, width: ch.X(2.3) - ch.X(1.5), height: 250, fill: 'var(--badbg)', opacity: 0.6 * fade(u, 0.6) });
    tx(ch.X(0.1), ch.Y(90) + 5, '과소적합', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    tx(ch.X(1.9), ch.Y(90) + 5, '과적합', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
    tx(30, 240, 'C↑ 마진↓ 과적합 · C↓ 마진↑ 과소적합', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.0) });
    ['0.01', '0.1', '1', '10', '100'].forEach((s, i) => { const x = 50 + i * 95; el('line', { x1: x, y1: 300, x2: x, y2: 312, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.4 + i * 0.15) }); mono(x, 334, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4 + i * 0.15) }); });
    grow(50, 306, 430, 306, E(u, 1.4, 2.1), MUT, { plain: true });
    note(30, 372, '자릿수씩 옮기며(로그 스케일) 교차검증으로 고른다', fade(u, 2.3), { fill: ACC }); }

  // ---------- 4. 커널 트릭 ----------
  // XOR 점: STEPS 의 pane.points (0~100) 를 코드 좌표(0~10)로
  const xorPts = (c) => (c.beat.pane.points || []).map((p) => [p.x / 10, p.y / 10, p.cls]);
  function xplot(o) { return plot(Object.assign({ x: [0, 10], y: [0, 10], xt: [0, 5, 10], yt: [0, 5, 10], xl: 'x1', yl: 'x2' }, o || {})); }
  function xdot(ax, p, o) { pt(ax, p[0] * 10, p[1] * 10, p[2], o); }   // pt 는 0~100 기준
  function xdots(ax, P, f) { const sx = (v) => ax.X(v), sy = (v) => ax.Y(v);
    P.forEach((p, i) => { const o = f ? f(p, i) : {}, s = o.s ?? 1, op = o.op ?? 1; if (s <= 0.02 || op <= 0.02) return; const cx = sx(p[0]), cy = sy(p[1]), r = (o.r || 6.5) * s, col = p[2] === 'A' ? INFO : WARN;
      if (p[2] === 'A') el('circle', { cx, cy, r, fill: col, opacity: op }); else el('rect', { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, rx: 2, fill: col, opacity: op });
      if (o.bad) el('circle', { cx, cy, r: r + 5, fill: 'none', stroke: BAD, 'stroke-width': 2.2, opacity: o.bad }); }); }
  // 커널 다수결 칠하기 (RBF: exp(-γ‖p−q‖²) 가중 투표)
  function kshade(ax, P, gamma, u, n) { n = n || 22; const cw = ax.w / n, chh = ax.h / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if ((i + j) / (2 * n) > u) continue; const x = (i + 0.5) * 10 / n, y = (j + 0.5) * 10 / n;
      let f = 0, z = 0; P.forEach((p) => { const w = Math.exp(-gamma * ((p[0] - x) ** 2 + (p[1] - y) ** 2)); f += p[2] === 'A' ? w : -w; z += w; });
      const v = z > 1e-9 ? f / z : 0; if (Math.abs(v) < 0.05 || z < 1e-6) continue;
      el('rect', { x: ax.x + i * cw, y: ax.y + ax.h - (j + 1) * chh, width: cw + 0.5, height: chh + 0.5, fill: v > 0 ? INFOBG : WARNBG, opacity: 0.9 }); } }
  function islands(ax, P, u) { P.forEach((p, i) => { const s = pop(u, 0.2 + i * 0.03); if (s > 0) el('circle', { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: 13 * s, fill: p[2] === 'A' ? INFOBG : WARNBG, stroke: p[2] === 'A' ? INFO : WARN, 'stroke-width': 1.2 }); }); }
  function s4(t, c) { const { k, u } = c, P = xorPts(c);
    if (k === 0) { const ax = xplot({ pw: 230, ph: 230, py: 90 }), a = P[0], b = P[8];
      el('line', { x1: ax.X(a[0]), y1: ax.Y(a[1]), x2: ax.X(b[0]), y2: ax.Y(b[1]), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.5) });
      xdots(ax, [a, b]); mono(ax.X(a[0]) + 12, ax.Y(a[1]) + 5, 'a', { 'font-size': 17, 'font-weight': 800 }); mono(ax.X(b[0]) + 12, ax.Y(b[1]) + 5, 'b', { 'font-size': 17, 'font-weight': 800 });
      // 순진한 길: φ 로 보낸 뒤 내적
      tx(330, 74, '순진한 길', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      grow(310, 130, 380, 130, E(u, 0.3, 0.6), BAD);
      const cellsN = ['x1', 'x2', 'x1²', 'x1x2', 'x2²', '…', '∞'];
      cellsN.forEach((s, i) => card(420 + i * 56, 130, 52, 40, { rx: 5, text: s, fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.5 + i * 0.12) }));
      mono(420, 176, 'φ(x) 좌표를 실제로 만든다', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.0) });
      grow(810, 130, 860, 220, E(u, 1.2, 1.5), BAD);
      // 트릭: 원공간에서 바로
      tx(330, 266, '커널 트릭', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      grow(310, 300, 840, 300, E(u, 1.6, 2.1), GOOD);
      mono(420, 290, 'K(a,b) = exp(−γ‖a−b‖²)', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      card(880, 250, 120, 58, { rx: 10, stroke: INK, text: 'φ(a)·φ(b)', fs: 15, mono: true, s: pop(u, 1.4) });
      note(420, 350, '같은 값을 좌표 계산 없이 얻는다', fade(u, 2.3), { fill: GOOD }); return; }
    const ax = xplot();
    if (k === 1) { const quad = [[0, 0], [5, 5], [0, 5], [5, 0]]; quad.forEach(([qx, qy], i) => el('rect', { x: ax.X(qx), y: ax.Y(qy + 5), width: ax.w / 2, height: ax.h / 2, fill: i < 2 ? INFOBG : WARNBG, opacity: 0.7 * fade(u, 0.3 + i * 0.4) }));
      xdots(ax, P, (p, i) => ({ s: pop(u, 0.3 + Math.floor(i / 4) * 0.4 + (i % 4) * 0.05) }));
      note(450, 120, '좌하 · 우상 = A', fade(u, 1.0), { fill: INFO }); note(450, 160, '좌상 · 우하 = B', fade(u, 1.4), { fill: WARN });
      note(450, 240, '대각 맞은편끼리 같은 라벨 = XOR', fade(u, 2.0));
      sub(640, 290, '직선 하나로는 못 나눈다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 2) { const fin = u > 1.9, th = lerp(0.15, Math.PI - 0.15, E(u, 0.3, 1.8)), nx = Math.cos(th), ny = Math.sin(th);
      // 훑는 동안: 중심을 지나는 직선, 법선 부호로 나누고 더 많이 맞는 배정. 끝: 코드의 linear SVC 가 찾은 실제 직선
      const LW = [0.22779, 0.17114, -1.39704], val = (p) => (fin ? LW[0] * p[0] + LW[1] * p[1] + LW[2] : nx * (p[0] - 5) + ny * (p[1] - 5));
      const side = P.map((p) => val(p) > 0);
      const okA = P.filter((p, i) => (side[i] ? 'A' : 'B') === p[2]).length, flip = fin ? true : okA < P.length / 2, wrong = P.map((p, i) => ((side[i] !== flip) ? 'A' : 'B') !== p[2]);
      if (fin) wline(ax, LW[0], LW[1], LW[2], 1, INK, { sw: 2.6, lim: 10 }); else wline(ax, nx, ny, -(nx * 5 + ny * 5), 1, MUT, { dash: '8 6', lim: 10 });
      xdots(ax, P, (p, i) => ({ bad: wrong[i] ? 1 : 0 }));
      const acc = P.length - wrong.filter(Boolean).length;
      mono(470, 120, `맞힌 점 ${acc} / ${P.length}`, { 'font-size': 20, 'font-weight': 800 });
      note(470, 180, '어디에 그어도 한 군집 이상은 틀린다', fade(u, 1.0), { fill: BAD });
      mono(470, 260, 'linear SVC → score = 0.75', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      sub(640, 310, '문제는 C 가 아니라 직선이라는 가설', fade(u, 2.4), { 'font-size': 15 }); return; }
    if (k === 3) { const ch = R.axes(560, 60, 320, 300, { x: [0, 10], y: [-14, 14], xt: [0, 5, 10], yt: [-10, 0, 10], xl: 'x1', yl: '(x1−5)(x2−5)' });
      xdots(ax, P, () => ({ op: 0.35 }));
      P.forEach((p) => { const z = (p[0] - 5) * (p[1] - 5), f = E(u, 0.3, 1.3), X = lerp(ax.X(p[0]), ch.X(p[0]), f), Y = lerp(ax.Y(p[1]), ch.Y(z), f), col = p[2] === 'A' ? INFO : WARN;
        if (p[2] === 'A') el('circle', { cx: X, cy: Y, r: 6, fill: col }); else el('rect', { x: X - 6, y: Y - 6, width: 12, height: 12, rx: 2, fill: col }); });
      const g = E(u, 1.5, 2.0); if (g > 0) el('line', { x1: ch.X(0), y1: ch.Y(0), x2: ch.X(10 * g), y2: ch.Y(0), stroke: GOOD, 'stroke-width': 3.5 });
      mono(ch.X(10) + 6, ch.Y(0) + 5, '평면', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      mono(430, 22, '= x1·x2 − 5·x1 − 5·x2 + 25  (특성 3개의 선형식)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      pill(220, 404, 'manual φ → ≈ 1.00', GOOD, pop(u, 2.2), { mono: true, fs: 15 }); return; }
    if (k === 4) { xdots(ax, P, () => ({ op: 0.3 }));
      const feats = ['x1', 'x2', 'x1·x2', 'x1²', 'x2²', 'x1³', 'x1²x2', 'x1x2²', 'x2³', '…'];
      feats.forEach((s, i) => { const col = i < 3 ? GOOD : BAD; card(450 + (i % 5) * 96, 100 + Math.floor(i / 5) * 56, 88, 44, { rx: 6, text: s, fs: 15, mono: true, stroke: col, color: col, s: pop(u, 0.3 + i * 0.13) }); });
      note(450, 250, 'x1·x2 가 맞은 건 운이었다', fade(u, 1.0));
      note(450, 290, '어떤 φ 가 좋은지 미리 모른다', fade(u, 1.6), { fill: BAD });
      note(450, 330, '차수를 올리면 좌표 수가 폭발한다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 5) { kshade(ax, P, 0.1, E(u, 0.3, 1.6)); xdots(ax, P);
      mono(470, 110, 'SVC(kernel="rbf", gamma=0.1)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      note(470, 180, 'A 군집 둘을 감싸는 곡선 경계', fade(u, 1.4));
      pill(560, 240, 'score = 1.00 · SV 11', GOOD, pop(u, 1.8), { mono: true, fs: 16 });
      sub(660, 300, '바뀐 코드는 kernel 인자 하나', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k 6, 7 : gamma 비교 판 3개는 별도 좌표
    }
  function s4g(t, c) { const { k, u } = c, P = xorPts(c);
    const G = [['gamma=0.0001', 'train 0.75 · test 0.75', '거의 직선 · 과소적합', WARN], ['gamma=0.1', 'train 1.00 · test 1.00', '군집 단위 곡선 · SV 11', GOOD], ['gamma=100', 'train 1.00 · test 0.64', '점마다 섬 · 과적합 · SV 99', BAD]];
    G.forEach(([nm, res, why, col], i) => { const x = 50 + i * 305, show = i < 2 || k === 7, at = k === 6 ? 0.3 + i * 0.7 : i === 2 ? 0.3 : 0, ax = plot({ px: x, py: 70, pw: 230, ph: 230, x: [0, 10], y: [0, 10], xt: [], yt: [], xl: null, yl: null, id: 'ra221g' + i });
      lbl(x + 115, 54, nm, 1, { class: 'mono', 'font-size': 16 });
      if (!show) { mono(x + 115, 195, '?', { 'font-size': 40, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle' }); xdots(ax, P, () => ({ op: 0.3, r: 5 })); return; }
      if (i === 0) { const g = E(u, at, at + 0.6), n = 18; // 직선에 가까운 경계: 선형 SVC 와 같은 한 군집 오분류(train 0.75)
        for (let a = 0; a < n; a++) for (let q = 0; q < n; q++) { if ((a + q) / (2 * n) > g) continue; const x = (a + 0.5) * 10 / n, y = (q + 0.5) * 10 / n, v = 0.22779 * x + 0.17114 * y - 1.39704;
          el('rect', { x: ax.x + a * ax.w / n, y: ax.y + ax.h - (q + 1) * ax.h / n, width: ax.w / n + 0.5, height: ax.h / n + 0.5, fill: v < 0 ? INFOBG : WARNBG, opacity: 0.9 }); } }
      if (i === 1) kshade(ax, P, 0.1, E(u, at, at + 0.6), 18);
      if (i === 2) islands(ax, P, u - at);
      xdots(ax, P, () => ({ r: 5 }));
      mono(x + 115, 326, res, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, at + 0.6) });
      tx(x + 115, 352, why, { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, at + 0.8) }); });
    if (k === 6) sub(480, 396, 'gamma = 한 점의 영향 반경의 역수 — 작을수록 완만하다', fade(u, 2.0), { 'font-size': 15 });
    if (k === 7) tx(480, 396, 'test 0.64 · SV 99개 = 점을 외웠다 → C 와 gamma 를 함께 그리드서치', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) }); }
  function s4all(t, c) { return c.k >= 6 ? s4g(t, c) : s4(t, c); }

  // ---------- 5. 실전 파이프라인 ----------
  const GC = ['0.1', '1', '10', '100'], GG = ['"scale"', '0.001', '0.01', '0.1'];
  function grid16(x, y, u, o) { o = o || {}; const cs = 62;
    GG.forEach((g, j) => mono(x + j * cs + cs / 2, y - 12, g, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }));
    GC.forEach((cc, i) => mono(x - 12, y + i * cs + cs / 2 + 5, cc, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }));
    mono(x - 12, y - 12, 'C \\ γ', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const n = i * 4 + j, best = o.best && i === 2 && j === 0, s = o.fill ? pop(u, o.fill + n * 0.08) : 1;
      card(x + j * cs + cs / 2, y + i * cs + cs / 2, cs - 6, cs - 6, { rx: 6, stroke: best ? ACC : GRID, sw: best ? 3 : 1.5, fill: best ? ACCBG : PANEL, s });
      if (o.folds) for (let f = 0; f < 5; f++) { const on = u * 1.0 - (o.folds + (n * 5 + f) * 0.022) > 0; el('circle', { cx: x + j * cs + 14 + f * 9, cy: y + i * cs + cs / 2, r: 3.4, fill: on ? ACC : SOFT }); } } }
  function pipe(x, y, u, o) { o = o || {}; const off = o.noScaler;
    card(x + 90, y, 170, 52, { rx: 10, stroke: off ? OFF : INFO, color: off ? OFF : INFO, text: 'StandardScaler', fs: 15, mono: true, s: o.s1 ?? 1 });
    grow(x + 180, y, x + 230, y, o.g ?? 1, MUT);
    card(x + 320, y, 170, 52, { rx: 10, stroke: ACC, color: ACC, text: 'SVC(rbf)', fs: 15, mono: true, s: o.s2 ?? 1 });
    if (off) cross(x + 90, y, 16, o.cross ?? 1); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { lbl(240, 70, '‖a − b‖² = Σ (특성 차이)²', fade(u, 0.2), { 'font-size': 18, class: 'mono' });
      const big = E(u, 0.6, 1.5); el('rect', { x: 60, y: 110, width: 360 * big, height: 40, rx: 5, fill: WARN, opacity: 0.85 });
      mono(60, 176, '값 범위 ~4069 인 특성', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.8) });
      el('rect', { x: 60 + 360 * big, y: 110, width: 3, height: 40, fill: INFO, opacity: fade(u, 1.3) });
      mono(60, 210, '값 범위 ~0.03 인 특성 → 거의 0', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
      note(60, 280, '큰 축 하나가 거리를 독점한다', fade(u, 1.8), { fill: BAD });
      note(560, 130, 'SVM 마진 = 거리', fade(u, 0.4));
      sub(700, 166, '좌표 단위에 그대로 휘둘린다', fade(u, 0.8), { 'font-size': 15 });
      pill(700, 250, 'StandardScaler 필수', ACC, pop(u, 2.2), { fs: 16 }); return; }
    if (k === 1) { for (let r = 0; r < 18; r++) for (let q = 0; q < 30; q++) { const cls = (r * 7 + q * 0) % 8 < 3; el('rect', { x: 60 + q * 11, y: 80 + r * 14, width: 9, height: 11, rx: 1.5, fill: q === 0 ? (cls ? BAD : GOOD) : GRID, opacity: fade(u, 0.2 + r * 0.04) }); }
      mono(60, 68, '569건 × 30특성', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      const g = E(u, 1.0, 1.7); el('line', { x1: 60, y1: 80 + 14 * 14.4, x2: 60 + 330 + 40 * g, y2: 80 + 14 * 14.4, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: g });
      mono(420, 160, 'X_tr  (8)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) }); mono(420, 300, 'X_te  (2)', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      note(600, 180, 'stratify=y', fade(u, 1.9), { class: 'mono', fill: ACC });
      sub(720, 216, '양쪽의 클래스 비율이 같게 나눈다', fade(u, 2.1), { 'font-size': 15 });
      sub(720, 260, '맨 앞 칸 색 = 클래스', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 2) { pipe(80, 90, u, { s1: pop(u, 0.2), s2: pop(u, 0.5), g: E(u, 0.4, 0.6) });
      mono(480, 50, 'Pipeline([...])', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      for (let f = 0; f < 5; f++) { const y = 180 + f * 36, on = fade(u, 0.9 + f * 0.2);
        for (let q = 0; q < 5; q++) el('rect', { x: 120 + q * 70, y, width: 64, height: 26, rx: 4, fill: q === f ? WARN : ACCBG, stroke: q === f ? WARN : ACC, 'stroke-width': 1.2, opacity: on });
        mono(100, y + 18, `폴드${f + 1}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: on }); }
      note(500, 220, 'scaler.fit ← 훈련 폴드(초록)만', fade(u, 1.8), { fill: ACC });
      tx(500, 262, '검증 폴드(주황) 통계가 새지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
      pill(640, 330, '데이터 누수 차단', GOOD, pop(u, 2.3), { fs: 15 }); return; }
    if (k === 3) { grid16(140, 90, u, { fill: 0.3 });
      mono(560, 120, 'svc__C', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(700, 120, '× 4', { 'font-size': 16, opacity: fade(u, 0.3) });
      mono(560, 160, 'svc__gamma', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(700, 160, '× 4', { 'font-size': 16, opacity: fade(u, 0.6) });
      mono(560, 220, `= ${Math.min(16, Math.floor(clamp((u - 0.3) / 0.08, 0, 16)))} 조합`, { 'font-size': 26, 'font-weight': 800, fill: ACC });
      note(560, 290, '자릿수 간격(로그)으로 함께 훑는다', fade(u, 2.0)); return; }
    if (k === 4) { grid16(140, 90, u, { folds: 0.3 });
      const n = Math.min(80, Math.floor(clamp((u - 0.3) / 0.022, 0, 80)));
      mono(560, 130, `학습 ${n} / 80`, { 'font-size': 26, 'font-weight': 800, fill: ACC });
      sub(660, 168, '16 조합 × 5 폴드', 1, { 'font-size': 15 });
      lock(580, 250, true, WARN, pop(u, 0.4)); mono(610, 258, 'X_te — 아직 한 번도 안 봤다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
      note(560, 330, '최선 조합을 골라 훈련셋 전체로 재학습', fade(u, 2.2)); return; }
    if (k === 5 || k === 6) { pipe(60, 70, u, { noScaler: k === 6, cross: pop(u, 0.3) });
      mono(60, 140, 'best: C=10 · gamma=0.01', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: k === 5 ? fade(u, 0.3) : 1 });
      const toV = (v) => (v - 0.5) / 0.5;
      tx(60, 206, 'cv', { 'font-size': 15, fill: MUT }); R.hbar(120, 192, 420, toV(0.980), 1, { u: k === 5 ? E(u, 0.6, 1.2) : 1, col: INFO, text: '0.980', label: k === 5 ? u > 0.9 : true });
      const tv = k === 5 ? 0.982 : tween(0.982, 0.947, u, 1.2);
      tx(60, 256, 'test', { 'font-size': 15, fill: MUT }); R.hbar(120, 242, 420, toV(tv), 1, { u: k === 5 ? E(u, 1.0, 1.6) : 1, col: k === 6 && u > 0.5 ? WARN : ACC, text: tv.toFixed(3), label: k === 5 ? u > 1.3 : true });
      if (k === 6) { tx(60, 306, '고정', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) }); R.hbar(120, 292, 420, toV(0.632), 1, { u: E(u, 1.5, 2.1), col: BAD, text: '0.632', label: u > 1.8 }); }
      mono(120, 346, '0.5', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(540, 346, '1.0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (k === 5) { note(620, 220, 'cv ≈ test', fade(u, 1.8), { fill: GOOD }); sub(760, 256, '선택 과정이 과적합되지 않았다', fade(u, 2.1), { 'font-size': 14.5 }); }
      else { note(620, 200, '스케일러만 뺐다', fade(u, 0.5), { fill: BAD }); sub(760, 236, '다시 찾은 최선 C=100 → 0.947', fade(u, 1.1), { 'font-size': 14.5 }); sub(760, 262, 'C=10·γ=0.01 고정 → 0.632', fade(u, 1.7), { 'font-size': 14.5, fill: BAD }); note(620, 320, '에러 없이 성능만 무너진다', fade(u, 2.2)); }
      return; }
    if (k === 7) { const ax = R.axes(70, 70, 300, 240, { x: [-4, 4], y: [0, 1], xt: [0], yt: [0, 0.5, 1], xl: 'SVM 거리 f(x)', yl: 'P(y=1)' });
      const S = []; for (let i = 0; i <= 40; i++) { const v = -4 + i * 0.2; S.push([v, 1 / (1 + Math.exp(-1.6 * v))]); }
      R.line(ax, S, E(u, 0.3, 1.2), ACC, { sw: 3 });
      mono(220, 394, 'Platt: σ(A·f + B) 를 덧붙인다', { 'font-size': 14.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      const rows = ((c.beat.pane.compare || {}).rows) || [];
      mono(560, 60, '로지스틱', { 'font-size': 14, 'font-weight': 700, fill: INFO }); mono(750, 60, 'SVM', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      rows.forEach((r, i) => { const y = 92 + i * 40, op = fade(u, 0.9 + i * 0.18);
        tx(440, y, r.crit, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op });
        tx(560, y + 18, r.logit, { 'font-size': 13.5, opacity: op }); tx(750, y + 18, r.svm, { 'font-size': 13.5, opacity: op }); });
      return; } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '훈련 정확도가 모두 1.0 인 후보 직선 3개 가운데 SVM 은 무엇을 기준으로 하나를 고르나?',
      o: ['모든 점의 로그 우도 합', '경계와 가장 가까운 점까지의 거리(마진)', '직선 기울기의 크기'], a: 1,
      why: '훈련 정확도로는 세 선을 구분할 수 없다. SVM 은 확률을 버리고 "얼마나 여유 있게 나눴는가"라는 기하 기준으로 고른다. 우도 합은 로지스틱의 기준이다.' },
    { q: '서포트 벡터가 아닌 점 (15,25) 를 빼고 다시 학습하면 결정 경계는 어떻게 되나?',
      o: ['경계가 통째로 움직인다', '계수가 조금씩 움직인다', '전혀 움직이지 않는다 — coef_ 가 같다'], a: 2,
      why: '경계는 마진 위의 서포트 벡터만으로 결정된다. 반대로 서포트 벡터 하나가 빠지면 경계가 통째로 움직인다.' },
    { q: '소프트 마진 SVM 에서 C 를 크게 키우면 어떻게 되나?',
      o: ['마진이 좁아지고 과적합 경향이 생긴다', '마진이 넓어지고 훈련 오류가 는다', '커널이 자동으로 바뀐다'], a: 0,
      why: 'C 는 마진 위반에 매기는 벌점의 세기다. C=100 은 train 100% 인데 cv 0.80 이고, C=1 이 cv 0.90 으로 가장 좋다.' },
    { q: 'XOR 패턴에서 선형 SVM 이 정확도 0.75 에 갇힐 때, RBF 커널은 어떻게 풀어내나?',
      o: ['C 를 아주 크게 키운다', '고차원 내적을 원공간에서 바로 계산한다', '고차원 좌표 φ(x) 를 실제로 전부 만든다'], a: 1,
      why: 'SVM 학습에는 점들끼리의 내적만 필요하다. 커널 K(a,b) 가 "고차원으로 보낸 뒤의 내적"을 직접 계산해 좌표 없이 곡선 경계(정확도 1.00)를 얻는다.' },
    { q: 'SVM 파이프라인에서 StandardScaler 를 빼면 성능이 무너지는 이유는?',
      o: ['거리로 마진을 재므로 범위가 큰 특성이 거리를 독점해서', '스케일러가 없으면 확률이 나오지 않아서', '그리드서치가 실행되지 않아서'], a: 0,
      why: '특성 범위가 0.03~4069 로 제각각이면 큰 축이 거리를 지배한다. 같은 C=10·gamma=0.01 이 스케일링 없이 0.632 로 떨어진다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '훈련 데이터를 다 맞히는 선은 여러 개라서, 정확도만으로는 좋은 선을 고를 수 없다.',
    'SVM은 두 클래스 사이 도로 폭이 가장 넓은 선을 고른다. 경계는 서포트 벡터 몇 개가 정한다.',
    '겹치는 데이터는 소프트 마진으로 받는다. C가 크면 도로가 좁아지고 과적합 쪽으로 기운다.',
    '직선으로 안 나뉘는 XOR은 RBF 커널로 풀려 정확도가 0.75에서 1.00이 됐다. 거리를 쓰니 스케일링은 필수다.',
  ];
  const review = [
    { q: 'RBF SVM에서 C와 gamma를 둘 다 크게 잡았더니 훈련 정확도는 100%인데 교차검증 점수가 크게 낮다. 다음에 할 일은?',
      o: ['선형 커널로 바꿔 직선 경계로 돌아간다', '훈련 점수가 가장 높은 조합을 그대로 쓴다', '로그 간격 그리드로 C와 gamma를 함께 교차검증한다'], a: 2,
      why: 'C와 gamma는 함께 과적합을 조절하는 한 쌍이라 같이 그리드서치해야 한다. 선형 커널은 XOR 같은 비선형 패턴을 담지 못한다.' },
    { q: '이탈 위험을 확률 점수로 보여 줘야 하고 데이터는 수십만 건이다. 더 맞는 모델은?',
      o: ['로지스틱 회귀', 'RBF 커널 SVM', '하드 마진 선형 SVM'], a: 0,
      why: 'SVM은 확률 대신 경계 근처의 마진을 보고 선을 긋는다. 확률이 필요하고 데이터가 수십만 건 이상이면 로지스틱이 낫다.' },
    { q: '라벨이 잘못된 점 하나가 상대 진영 깊숙이 들어가 하드 마진 경계가 크게 기울었다. 가장 맞는 처방은?',
      o: ['gamma를 키워 그 점을 섬으로 감싼다', '소프트 마진으로 위반을 허용하고 C는 교차검증으로 고른다', 'C를 아주 크게 키워 위반을 하나도 허용하지 않는다'], a: 1,
      why: '하드 마진은 점 하나 때문에 도로가 거의 0으로 줄어든다. 위반을 벌점으로 허용해야 넓은 도로를 지키고, C가 클수록 하드 마진에 가까워진다.' },
  ];

  R.page({ title: 'SVM 결정 경계 들여다보기', scenes: [s1, s2, s3, s4all, s5], quiz, summary, review });
})();
