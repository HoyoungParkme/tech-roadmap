/* II-1-2 FAISS 인덱스 종류 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 쿼리 위치는 beat.query({x 0~400, y 0~260}), 강조할 인덱스는 beat.activeId 를 읽는다.
 * 메모리·속도·recall 숫자는 faiss-cpu 1.16.0 으로 128차원 5만·10만 개를 1스레드로 직접 재 본 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmtN = (v) => Math.round(v).toLocaleString('en-US');
  const star = (x, y, s, col) => { const g = R.G(x, y, s ?? 1); el('path', { d: 'M0,-14 L4,-4 L14,-4 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-4 L-4,-4 Z', fill: col || BAD, stroke: PANEL, 'stroke-width': 1.5 }, g); };

  // ---------- 2차원으로 줄여 그린 점 120개 + k-means(20) 기록 ----------
  const BX = 40, BY = 40, BW = 480, BH = 340;
  const PTS = (() => { const r = rng(11), p = []; for (let i = 0; i < 120; i++) p.push([BX + 14 + r() * (BW - 28), BY + 34 + r() * (BH - 48)]); return p; })();
  const KM = (() => { const K = 20, r = rng(5); let cs = []; for (let i = 0; i < K; i++) cs.push(PTS[Math.floor(r() * PTS.length)].slice());
    const hist = [cs.map((c) => c.slice())];
    for (let it = 0; it < 6; it++) { const sum = cs.map(() => [0, 0, 0]);
      PTS.forEach((p) => { let b = 0, bd = 1e9; cs.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = j; } }); sum[b][0] += p[0]; sum[b][1] += p[1]; sum[b][2]++; });
      cs = cs.map((c, j) => (sum[j][2] ? [sum[j][0] / sum[j][2], sum[j][1] / sum[j][2]] : c)); hist.push(cs.map((c) => c.slice())); }
    return hist; })();
  const CCOL = [ACC, INFO, WARN, GOOD];
  const nearestC = (p, cs) => { let b = 0, bd = 1e9; cs.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = j; } }); return b; };
  const qpos = (q) => [BX + 20 + (q.x / 400) * (BW - 40), BY + 40 + (q.y / 260) * (BH - 60)];
  function plot(title) { el('rect', { x: BX, y: BY, width: BW, height: BH, rx: 12, fill: SOFT, stroke: GRID });
    tx(BX + 14, BY + 22, title || '벡터 공간 (128차원을 2차원으로, 점 120개로 줄여 그림)', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); }

  // ---------- 1. Flat ----------
  function s1(t, c) { const { k, u } = c, q = c.beat.query, pq = (c.prev && c.prev.query) || q;
    plot();
    const appear = k === 0 ? E(u, 0.2, 1.8) : 1;
    PTS.forEach((p, i) => { const s = clamp(appear * PTS.length - i); if (s > 0) el('circle', { cx: p[0], cy: p[1], r: 4.5 * s, fill: OFF }); });
    const RX = 560;
    if (k === 0) { mono(RX, 80, 'vectors', { 'font-size': 16, 'font-weight': 700 }); mono(RX, 110, '(50,000 × 128) float32', { 'font-size': 16, fill: INFO, 'font-weight': 700 });
      note(RX, 150, '아직 인덱스는 없다', fade(u, 1.8), { fill: MUT }); return; }
    // 인덱스 상자
    const n = k === 1 ? 50000 * E(u, 0.3, 1.8) : 50000;
    el('rect', { x: RX, y: 50, width: 360, height: 62, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 });
    mono(RX + 14, 76, 'IndexFlatL2(128)', { 'font-size': 15.5, 'font-weight': 800, fill: ACC }); mono(RX + 14, 100, 'ntotal ' + fmtN(n), { 'font-size': 15, fill: INK });
    if (k === 1) { for (let i = 0; i < 5; i++) { const a = seg(u, 0.3 + i * 0.25, 1.0 + i * 0.25); if (a > 0 && a < 1) dot([PTS[i * 20], [RX + 10, 80]], a, ACC, 6); }
      note(RX, 150, 'train 없이 add 만 하면 끝', fade(u, 1.6)); return; }
    const qp = qpos(q), qq = qpos(pq), qx = tween(qq[0], qp[0], u), qy = tween(qq[1], qp[1], u);
    if (k === 2) { star(qx, qy, 1.2); mono(RX, 150, 'D, I = index.search(q, k=5)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      note(RX, 186, '쿼리 한 개 = 128차원 벡터 한 개', fade(u, 1.2), { fill: MUT }); return; }
    if (k === 3) { const m = Math.floor(E(u, 0.2, 2.0) * PTS.length);
      for (let i = 0; i < m; i++) el('line', { x1: qx, y1: qy, x2: PTS[i][0], y2: PTS[i][1], stroke: BAD, 'stroke-width': 1, opacity: 0.3 });
      const top = PTS.map((p, i) => [Math.hypot(p[0] - qx, p[1] - qy), i]).sort((a, b) => a[0] - b[0]).slice(0, 5);
      if (u > 2.0) top.forEach(([, i]) => el('circle', { cx: PTS[i][0], cy: PTS[i][1], r: 7, fill: ACC }));
      star(qx, qy, 1.2);
      tx(RX, 160, '거리 계산', { 'font-size': 15, 'font-weight': 700 }); mono(RX, 194, fmtN(50000 * E(u, 0.2, 2.0)) + ' / 50,000', { 'font-size': 22, 'font-weight': 800, fill: BAD });
      note(RX, 232, '빠뜨리는 점이 없다 → recall 100%', fade(u, 2.0), { fill: GOOD }); return; }
    // k 4: O(N) 그래프 (실측)
    star(qx, qy, 1.2);
    const ax = R.axes(RX + 40, 150, 300, 190, { x: [0, 100000], y: [0, 6], xt: [0, 50000, 100000].map((v) => v), yt: [0, 2, 4, 6], grid: true });
    tx(RX + 40, 136, '쿼리당 ms (1스레드 실측)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    R.line(ax, [[0, 0], [50000, 2.81], [100000, 5.36]], E(u, 0.2, 1.4), BAD);
    [[50000, 2.81], [100000, 5.36]].forEach(([x, y], i) => { const o = fade(u, 0.8 + i * 0.4); el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6, fill: BAD, opacity: o }); mono(ax.X(x) - 10, ax.Y(y) - 12, y.toFixed(2), { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: o }); });
    note(RX + 40, 404, 'N 이 두 배면 시간도 두 배', fade(u, 1.8)); }

  // ---------- 2. IVF ----------
  function cells(cs, o) { o = o || {};
    PTS.forEach((p) => { const j = nearestC(p, cs), on = !o.probe || o.probe.includes(j);
      el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: o.color ? CCOL[j % 4] : OFF, opacity: on ? 0.85 : 0.15 }); });
    cs.forEach((c, j) => { const on = !o.probe || o.probe.includes(j); el('path', { d: `M${c[0]},${c[1] - 9} L${c[0] + 9},${c[1]} L${c[0]},${c[1] + 9} L${c[0] - 9},${c[1]} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: (o.op ?? 1) * (on ? 1 : 0.3) }); }); }
  function kmAt(f) { const h = KM, x = f * (h.length - 1), i = Math.min(h.length - 2, Math.floor(x)), r = x - i; return h[i].map((c, j) => [lerp(c[0], h[i + 1][j][0], r), lerp(c[1], h[i + 1][j][1], r)]); }
  function s2(t, c) { const { k, u } = c, q = c.beat.query, pq = (c.prev && c.prev.query) || q, RX = 560;
    plot();
    if (k === 0) { PTS.forEach((p) => el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: OFF }));
      el('rect', { x: RX, y: 60, width: 360, height: 90, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      mono(RX + 14, 88, 'quantizer = IndexFlatL2(128)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(RX + 14, 124, '군집 중심을 담아 둘 자리 (비어 있음)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) }); return; }
    if (k === 1) { const s = E(u, 0.3, 1.6); PTS.forEach((p) => el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: OFF }));
      KM[0].forEach((cc, j) => { if (clamp(s * 20 - j) > 0) el('path', { d: `M${cc[0]},${cc[1] - 9} L${cc[0] + 9},${cc[1]} L${cc[0]},${cc[1] + 9} L${cc[0] - 9},${cc[1]} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2 }); });
      mono(RX, 80, 'IndexIVFFlat(quantizer, 128, nlist=100)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      note(RX, 120, '◇ 군집 중심 (그림은 20개)', fade(u, 0.8)); note(RX, 148, '아직 제자리를 못 찾았다', fade(u, 1.4), { fill: MUT });
      mono(RX, 200, '50,000 ÷ 100 = 군집당 약 500개', { 'font-size': 15, fill: INK, opacity: fade(u, 1.8) }); return; }
    const fin = KM[KM.length - 1], qp = qpos(q), qq = qpos(pq), qx = tween(qq[0], qp[0], u), qy = tween(qq[1], qp[1], u);
    if (k === 2) { const f = E(u, 0.2, 1.8), cs = kmAt(f); cells(cs, { color: true });
      mono(RX, 80, 'index.train(vectors)', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      mono(RX, 112, 'k-means 반복 ' + Math.round(f * (KM.length - 1)) + ' / ' + (KM.length - 1), { 'font-size': 15, fill: INK });
      if (u > 1.9) { const j = nearestC([qx, qy], fin); el('circle', { cx: fin[j][0], cy: fin[j][1], r: 18, fill: 'none', stroke: BAD, 'stroke-width': 2.5 }); star(qx, qy, 1.1);
        note(RX, 160, '쿼리와 가장 가까운 중심부터 본다', fade(u, 2.0), { fill: BAD }); }
      return; }
    if (k === 3) { const order = fin.map((cc, j) => [Math.hypot(cc[0] - qx, cc[1] - qy), j]).sort((a, b) => a[0] - b[0]).map((d) => d[1]);
      cells(fin, { color: true, probe: order.slice(0, 2) }); star(qx, qy, 1.2);
      mono(RX, 80, 'index.nprobe = 10', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      tx(RX, 112, '100개 군집 중 10개만 연다 (그림은 20개 중 2개)', { 'font-size': 14.5, fill: MUT });
      tx(RX, 160, '비교하는 벡터', { 'font-size': 15, 'font-weight': 700 });
      mono(RX, 194, fmtN(lerp(50000, 5000, E(u, 0.3, 1.6))) + ' / 50,000', { 'font-size': 22, 'font-weight': 800, fill: ACC });
      note(RX, 232, '+ 중심 100개와의 거리 계산', fade(u, 1.8), { fill: MUT }); return; }
    // k 4: recall-속도 곡선 (실측, 균등 난수 5만 개)
    cells(fin, { color: true });
    const ax = R.axes(RX + 50, 70, 300, 250, { x: [0, 3], y: [0, 1], xt: [0, 1, 2, 3], yt: [0, 0.5, 1], grid: true });
    tx(RX + 50, 56, 'recall@10', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); tx(RX + 350, 362, '쿼리당 ms', { 'font-size': 14, fill: MUT, 'font-weight': 600, 'text-anchor': 'end' });
    const P = [[0.083, 0.063, 'nprobe 1'], [0.275, 0.324, 'nprobe 10'], [1.04, 0.654, 'nprobe 32'], [2.81, 1.0, 'Flat']];
    R.line(ax, P.slice(0, 3).map((p) => [p[0], p[1]]), E(u, 0.2, 1.4), ACC);
    P.forEach(([x, y, n], i) => { const o = fade(u, 0.4 + i * 0.35); el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 6, fill: i === 3 ? BAD : ACC, opacity: o });
      mono(ax.X(x) + (i === 3 ? -10 : 10), ax.Y(y) + (i === 0 ? -10 : 5), n + ' · ' + y.toFixed(2), { 'font-size': 14, 'font-weight': 700, fill: i === 3 ? BAD : ACC, 'text-anchor': i === 3 ? 'end' : 'start', opacity: o }); });
    note(RX, 404, '권장 출발점: nprobe ≈ √nlist = 10', fade(u, 1.9)); }

  // ---------- 3. HNSW ----------
  const NODES = (() => { const r = rng(23), n = []; for (let i = 0; i < 32; i++) n.push([0.05 + r() * 0.9, 0.08 + r() * 0.84]); return n; })();
  const LVL = [32, 16, 8, 3];                  // 층마다 그리는 노드 수 (위층 노드는 아래층에도 있다)
  const REAL = ['50,000', '1,611', '45', '3'];  // M=32 로 5만 개를 넣었을 때 실제 층별 노드 수
  const LY = [360, 268, 176, 84];
  const P3 = (i, L) => { const [a, b] = NODES[i]; return [70 + b * 70 + a * 430, LY[L] + (b - 0.5) * 46]; };
  function plane(L, op, hot) { const y = LY[L]; el('path', { d: `M70,${y - 23} L500,${y - 23} L570,${y + 23} L140,${y + 23} Z`, fill: hot ? INFOBG : SOFT, stroke: hot ? INFO : GRID, 'stroke-width': 1.8, opacity: op });
    tx(18, y + 5, 'L' + L, { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: MUT, opacity: op }); }
  function edgesOf(L) { const n = LVL[L], out = []; for (let i = 0; i < n; i++) { const d = []; for (let j = 0; j < n; j++) if (j !== i) d.push([Math.hypot(NODES[i][0] - NODES[j][0], NODES[i][1] - NODES[j][1]), j]); d.sort((a, b) => a[0] - b[0]); d.slice(0, Math.min(3, n - 1)).forEach(([, j]) => { if (i < j) out.push([i, j]); }); } return out; }
  const EDGES = [0, 1, 2, 3].map(edgesOf);
  function layer(L, op, o) { o = o || {}; plane(L, op, o.hot); if (op <= 0) return;
    EDGES[L].forEach(([i, j]) => { const a = P3(i, L), b = P3(j, L); el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: MUT, 'stroke-width': 1.2, opacity: 0.6 * op }); });
    for (let i = 0; i < LVL[L]; i++) { const p = P3(i, L); el('circle', { cx: p[0], cy: p[1], r: L ? 6 : 4.5, fill: L ? INFO : OFF, opacity: op }); }
    if (o.count) mono(580, LY[L] + 5, o.count, { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: op }); }
  // 탐색 경로: 위층 진입점 → 층마다 욕심쟁이 이동 → 아래로
  const QH = [0.62, 0.7];
  const PATH = (() => { let cur = 0; const out = [];
    for (let L = 3; L >= 0; L--) { out.push([cur, L]); let moved = true;
      while (moved) { moved = false; const nb = EDGES[L].filter((e) => e.includes(cur)).map((e) => (e[0] === cur ? e[1] : e[0]));
        const dist = (i) => Math.hypot(NODES[i][0] - QH[0], NODES[i][1] - QH[1]); let best = cur; nb.forEach((j) => { if (dist(j) < dist(best)) best = j; });
        if (best !== cur) { cur = best; out.push([cur, L]); moved = true; } } }
    return out; })();
  function s3(t, c) { const { k, u } = c, RX = 650;
    if (k === 0) { layer(0, 1); const hub = 5, p = P3(hub, 0), nb = NODES.map((q, j) => [Math.hypot(q[0] - NODES[hub][0], q[1] - NODES[hub][1]), j]).sort((a, b) => a[0] - b[0]).slice(1, 11);
      nb.forEach(([, j], i) => { const q = P3(j, 0); grow(p[0], p[1], q[0], q[1], E(u, 0.3 + i * 0.1, 0.9 + i * 0.1), ACC, { plain: true }); });
      el('circle', { cx: p[0], cy: p[1], r: 8, fill: ACC });
      mono(RX, 120, 'IndexHNSWFlat(128, M=32)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      note(RX, 160, '노드마다 이웃을 M=32개 잇는다', fade(u, 0.8)); note(RX, 186, '맨 아래층(L0)은 2M = 64개', fade(u, 1.3), { fill: MUT });
      note(RX, 230, 'M ↑ → 정확도 ↑, 메모리 ↑', fade(u, 1.9), { fill: WARN }); return; }
    if (k === 1) { layer(0, 0.5);
      const row = (y, n, lbl, col, f) => { mono(600, y - 12, lbl, { 'font-size': 15, 'font-weight': 700, fill: col }); for (let i = 0; i < n; i++) { const on = i < Math.round(f * n); el('rect', { x: 600 + (i % 16) * 17, y: y + Math.floor(i / 16) * 17, width: 14, height: 14, rx: 3, fill: on ? col : PANEL, stroke: col, 'stroke-width': 1.3, opacity: on ? 0.8 : 0.6 }); } };
      row(110, 40, 'efConstruction = 40  (빌드 때 후보)', ACC, E(u, 0.2, 1.2)); row(240, 16, 'efSearch = 16  (검색 때 후보)', INFO, E(u, 1.0, 1.8));
      note(600, 310, '후보 목록이 넓을수록 꼼꼼하다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 2) { [0, 1, 2, 3].forEach((L) => { const o = E(u, 0.2 + L * 0.45, 0.7 + L * 0.45); if (o > 0) layer(L, o, { count: REAL[L] }); });
      tx(580, 40, '층별 노드 수 (실측)', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.3) });
      note(RX + 70, 220, 'add 가 곧 빌드', fade(u, 1.9), { 'font-size': 16 }); note(RX + 70, 246, 'train 단계가 없다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 3) { [0, 1, 2, 3].forEach((L) => layer(L, 1, { count: REAL[L] }));
      const qp = P3(0, 0); const qx = 70 + QH[1] * 70 + QH[0] * 430, qy = LY[0] + (QH[1] - 0.5) * 46; star(qx, qy, 1.1);
      const pts = PATH.map(([i, L]) => P3(i, L)), f = E(u, 0.2, 2.3) * (pts.length - 1), m = Math.floor(f);
      const shown = pts.slice(0, m + 1); if (m < pts.length - 1) { const a = pts[m], b = pts[m + 1], r = f - m; shown.push([lerp(a[0], b[0], r), lerp(a[1], b[1], r)]); }
      el('polyline', { points: shown.map((p) => p.join(',')).join(' '), fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-linejoin': 'round' });
      shown.forEach((p, i) => { if (i <= m) el('circle', { cx: p[0], cy: p[1], r: 6.5, fill: BAD }); });
      void qp; note(RX + 70, 220, '위층: 크게 점프', fade(u, 0.5)); note(RX + 70, 246, '아래층: 촘촘히 좁힘', fade(u, 1.5)); return; }
    // k 4: 비용 (5만 개, 1스레드 실측)
    [0, 1, 2, 3].forEach((L) => layer(L, 0.35));
    zone(600, 40, 340, 330, null, { fill: PANEL, stroke: GRID });
    tx(616, 70, '메모리 (MB)', { 'font-size': 15, 'font-weight': 700 });
    R.hbar(616, 84, 200, 25.6, 39.2, { u: E(u, 0.2, 1.0), col: MUT, text: 'Flat 25.6' }); R.hbar(616, 112, 200, 39.2, 39.2, { u: E(u, 0.4, 1.2), col: WARN, text: 'HNSW 39.2' });
    tx(616, 180, '쿼리당 ms', { 'font-size': 15, 'font-weight': 700 });
    R.hbar(616, 194, 200, 2.81, 2.81, { u: E(u, 1.0, 1.8), col: MUT, text: 'Flat 2.81' }); R.hbar(616, 222, 200, 0.35, 2.81, { u: E(u, 1.2, 2.0), col: ACC, text: 'HNSW 0.35' });
    note(616, 290, '엣지를 저장하느라 1.5배', fade(u, 1.8), { fill: WARN }); note(616, 316, '대신 약 8배 빠르다', fade(u, 2.1), { fill: ACC });
    sub(770, 352, 'efSearch 16 · 균등 난수 5만 개', fade(u, 2.1)); }

  // ---------- 4. PQ ----------
  const SEGC = [ACC, INFO, WARN, GOOD, ACC, INFO, WARN, GOOD];
  const CODES = [188, 138, 65, 72, 211, 249, 1, 83];   // 첫 벡터를 IndexPQ(128, 8, 8)로 인코딩한 실제 코드
  function s4(t, c) { const { k, u } = c, X0 = 40, cw = 5.8;
    const segX = (s, sp) => X0 + s * 16 * cw + s * 14 * sp;
    const split = k === 0 ? E(u, 0.9, 1.8) : 1;
    tx(X0, 40, '벡터 1개 = 128차원 float32 = 512 byte', { 'font-size': 15, 'font-weight': 700 });
    for (let s = 0; s < 8; s++) for (let i = 0; i < 16; i++) { const j = s * 16 + i, sh = k === 0 ? clamp(E(u, 0.1, 0.8) * 128 - j) : 1; if (sh <= 0) continue;
      el('rect', { x: segX(s, split) + i * cw, y: 54, width: cw - 1, height: 30, fill: split > 0.05 ? SEGC[s] : INFO, opacity: 0.4 + 0.3 * sh }); }
    if (split > 0.5) for (let s = 0; s < 8; s++) mono(segX(s, 1) + 8 * cw, 104, '16', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: split });
    if (k === 0) { note(X0, 150, 'm = 8 조각, 조각마다 16차원', fade(u, 1.6)); note(X0, 176, 'nbits = 8 → 조각마다 2⁸ = 256개 대표값', fade(u, 2.0), { fill: MUT }); return; }
    // 서브공간별 코드북 (작은 점 구름 + 중심)
    const cbY = 140, cbH = 120;
    for (let s = 0; s < 8; s++) { const x = segX(s, 1), w = 16 * cw, r = rng(100 + s), o = k === 1 ? fade(u, 0.2 + s * 0.15) : 1;
      el('rect', { x, y: cbY, width: w, height: cbH, rx: 6, fill: SOFT, stroke: GRID, opacity: o });
      for (let i = 0; i < 14; i++) el('circle', { cx: x + 8 + r() * (w - 16), cy: cbY + 10 + r() * (cbH - 20), r: 2.5, fill: OFF, opacity: o });
      const km = k === 1 ? E(u, 0.6 + s * 0.15, 1.4 + s * 0.15) : 1;
      for (let i = 0; i < 5; i++) el('rect', { x: x + 10 + r() * (w - 24), y: cbY + 10 + r() * (cbH - 24), width: 7, height: 7, fill: SEGC[s], opacity: km });
      if (k >= 2) { const pick = 0.2 + (CODES[s] / 255) * 0.6; el('circle', { cx: x + w * pick, cy: cbY + cbH * (1 - pick), r: 7, fill: 'none', stroke: INK, 'stroke-width': 2.2 }); } }
    tx(X0, cbY + cbH + 24, '코드북 8개 × 중심 256개 (그림은 5개씩)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    if (k === 1) { mono(X0, cbY + cbH + 54, 'index.train(vectors)  # 조각마다 k-means', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) }); return; }
    if (k === 2) { // 코드 8 byte
      const y = 330; tx(X0, y - 14, '저장되는 것: 가장 가까운 중심의 번호 8개', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      CODES.forEach((v, s) => { const a = seg(u, 0.3 + s * 0.15, 1.0 + s * 0.15), x = segX(s, 1) + 8 * cw;
        if (a > 0) card(x, lerp(cbY + 60, y + 24, E(a, 0, 1)), 52, 34, { rx: 6, text: String(v), fs: 15, mono: true, fw: 800, stroke: SEGC[s], color: SEGC[s] }); });
      const op = fade(u, 1.8); mono(X0, 404, '512 B → 8 B   ·   5만 개 25.6 MB → 0.4 MB', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: op });
      return; }
    if (k === 3) { // 거리 표에서 8번 찾아 더하기
      const y = 320; tx(X0, y - 18, '쿼리 조각 ↔ 256개 중심 거리를 먼저 표로 (8 × 256)', { 'font-size': 14.5, 'font-weight': 700 });
      CODES.forEach((v, s) => { const x = segX(s, 1), w = 16 * cw;
        for (let i = 0; i < 8; i++) el('rect', { x: x + i * (w / 8), y, width: w / 8 - 1, height: 26, fill: SEGC[s], opacity: 0.15 + 0.12 * ((i * 7 + s) % 5) });
        const hit = Math.floor((v / 256) * 8), a = fade(u, 0.5 + s * 0.15); el('rect', { x: x + hit * (w / 8) - 1, y: y - 2, width: w / 8 + 1, height: 30, fill: 'none', stroke: INK, 'stroke-width': 2.4, opacity: a }); });
      mono(X0, y + 62, '거리 ≈ 표[0][188] + 표[1][138] + … + 표[7][83]', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      note(X0, y + 90, '원본 벡터로 되돌리지 않는다', fade(u, 2.2), { fill: MUT }); return; }
    // k 4: recall 손실 (실측)
    const y = 316; tx(X0, y - 10, 'recall@10 (균등 난수 5만 개 실측)', { 'font-size': 14.5, 'font-weight': 700 });
    tx(X0, y + 24, 'Flat', { 'font-size': 15, 'font-weight': 700 }); R.hbar(X0 + 60, y + 10, 300, 1, 1, { u: E(u, 0.2, 1.0), col: MUT, text: '1.00' });
    tx(X0, y + 58, 'PQ', { 'font-size': 15, 'font-weight': 700, fill: BAD }); R.hbar(X0 + 60, y + 44, 300, 0.076, 1, { u: E(u, 0.6, 1.4), col: BAD, text: '0.08' });
    card(770, y + 30, 300, 66, { rx: 10, text: 'IndexIVFPQ\n군집으로 좁히고 + 코드로 압축', fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.6) }); }

  // ---------- 5. 비교 ----------
  const NAMES = [['flat', 'Flat'], ['ivf', 'IVF'], ['hnsw', 'HNSW'], ['pq', 'PQ']];
  function bars(title, vals, max, fmt, o) { o = o || {}; const u = o.u ?? 1, act = o.act;
    tx(60, 54, title, { 'font-size': 16, 'font-weight': 800 }); if (o.sub) tx(60, 78, o.sub, { 'font-size': 13.5, fill: MUT });
    NAMES.forEach(([id, n], i) => { const y = 110 + i * 64, hot = act === id, v = vals[i];
      tx(60, y + 22, n, { 'font-size': 17, 'font-weight': 800, fill: hot ? ACC : INK });
      if (Array.isArray(v)) { el('rect', { x: 170, y: y + 4, width: 560, height: 26, rx: 5, fill: SOFT });
        el('rect', { x: 170 + 560 * v[0] / max, y: y + 4, width: Math.max(4, 560 * (v[1] - v[0]) / max * clamp(u * 4 - i)), height: 26, rx: 5, fill: hot ? ACC : MUT });
        mono(745, y + 23, fmt(v), { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : INK, opacity: clamp(u * 4 - i) }); return; }
      R.hbar(170, y + 4, 560, v, max, { h: 26, u: clamp(u * 4 - i), col: hot ? ACC : MUT, text: fmt(v) }); }); }
  function s5(t, c) { const { k, u } = c, act = c.beat.activeId;
    if (k === 0) { const items = [['Flat', '전부 잰다'], ['IVF', '가까운 군집만'], ['HNSW', '그래프를 따라'], ['PQ', '압축해서 잰다']];
      items.forEach(([n, d], i) => { const cx = 130 + i * 233, s = pop(u, 0.2 + i * 0.35); zone(cx - 100, 70, 200, 230, null, { fill: SOFT, stroke: GRID, op: s });
        const r = rng(3 + i), pts = []; for (let j = 0; j < 14; j++) pts.push([cx - 80 + r() * 160, 100 + r() * 130]);
        const q = [cx, 165];
        if (i === 0) pts.forEach((p) => el('line', { x1: q[0], y1: q[1], x2: p[0], y2: p[1], stroke: BAD, 'stroke-width': 1, opacity: 0.4 * s }));
        if (i === 1) [[cx - 40, 135], [cx + 45, 190]].forEach(([a, b], j) => el('circle', { cx: a, cy: b, r: 46, fill: j ? 'none' : ACCBG, stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: s }));
        if (i === 2) for (let j = 0; j < 13; j++) el('line', { x1: pts[j][0], y1: pts[j][1], x2: pts[j + 1][0], y2: pts[j + 1][1], stroke: INFO, 'stroke-width': 1.3, opacity: s });
        if (i === 3) [188, 138, 65, 72].forEach((v, j) => card(cx - 60 + j * 40, 245, 36, 26, { rx: 4, text: String(v), fs: 13.5, mono: true, stroke: WARN, color: WARN, op: s }));
        pts.forEach((p) => el('circle', { cx: p[0], cy: p[1], r: 4, fill: OFF, opacity: s }));
        lbl(cx, 330, n, s, { 'font-size': 18 }); sub(cx, 356, d, s, { 'font-size': 14.5 }); });
      return; }
    if (k === 1) { bars('recall@10 범위 (실제 임베딩에서 흔한 값 · 예시)', [[99.6, 100], [95, 99], [95, 99], [70, 90]], 100, (v) => v[0] >= 99.5 ? '100%' : v[0] + '~' + v[1] + '%', { u: E(u, 0.2, 1.6), act });
      note(170, 380, '정확히 맞아야 하면 Flat 하나뿐', fade(u, 1.9), { fill: ACC }); return; }
    if (k === 2) { bars('메모리 MB (128차원 5만 개, 실측)', [25.6, 26.1, 39.2, 0.4], 39.2, (v) => v.toFixed(1), { u: E(u, 0.2, 1.6), act, sub: 'PQ 는 코드만, 코드북 0.13 MB 별도' }); return; }
    if (k === 3) { bars('쿼리당 ms (10만 개 top-10, 1스레드 실측)', [5.36, 0.23, 0.13, 0.62], 5.36, (v) => v.toFixed(2), { u: E(u, 0.2, 1.6), act, sub: 'IVF nprobe 10 · HNSW efSearch 16' }); return; }
    if (k === 4) { tx(60, 54, '같은 설정, 다른 데이터 — recall@10 실측', { 'font-size': 16, 'font-weight': 800 });
      const G = [['IVF  nprobe 10', 1.0, 0.32], ['HNSW  efSearch 16', 0.95, 0.27]];
      G.forEach(([n, a, b], i) => { const y = 110 + i * 130; tx(60, y, n, { 'font-size': 16, 'font-weight': 800, class: 'mono' });
        tx(60, y + 36, '군집 있는 데이터', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); R.hbar(230, y + 20, 520, a, 1, { h: 24, u: E(u, 0.2 + i * 0.5, 1.0 + i * 0.5), col: GOOD, text: a.toFixed(2) });
        tx(60, y + 74, '균등 난수', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); R.hbar(230, y + 58, 520, b, 1, { h: 24, u: E(u, 0.4 + i * 0.5, 1.2 + i * 0.5), col: BAD, text: b.toFixed(2) }); });
      note(60, 390, '벤치마크 숫자를 믿지 말고 내 데이터로 잰다', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 5) { tx(60, 54, '규모별 권장', { 'font-size': 16, 'font-weight': 800 });
      const Z = [['flat', 'Flat', '~10만', '정확도 100%'], ['ivf', 'IVF', '100만', '균형'], ['hnsw', 'HNSW', '1000만', '최고 속도'], ['pq', 'IVF + PQ', '1억~', 'RAM 제약']];
      el('line', { x1: 60, y1: 300, x2: lerp(60, 900, E(u, 0.1, 1.0)), y2: 300, stroke: MUT, 'stroke-width': 2.5, 'marker-end': u > 1 ? 'url(#ra-ah)' : null });
      tx(900, 330, '벡터 수 N', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
      Z.forEach(([id, n, s, d], i) => { const x = 70 + i * 210, o = pop(u, 0.4 + i * 0.3), hot = act === id;
        card(x + 95, 180, 190, 120, { rx: 10, stroke: hot ? ACC : GRID, fill: hot ? ACCBG : PANEL, sw: hot ? 3 : 1.8, s: o });
        tx(x + 95, 160, n, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: hot ? ACC : INK, opacity: o }); tx(x + 95, 196, d, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: o });
        mono(x + 95, 284, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: o }); el('line', { x1: x + 95, y1: 292, x2: x + 95, y2: 308, stroke: MUT, 'stroke-width': 2, opacity: o }); });
      return; }
    // k 6: 실전 조합
    tx(60, 54, '실전에서는 섞어 쓴다', { 'font-size': 16, 'font-weight': 800 });
    const s = pop(u, 0.2); zone(60, 80, 520, 290, 'IndexIVFPQ', { fill: SOFT, stroke: ACC, color: ACC, op: s });
    [[180, 180], [330, 260], [470, 170]].forEach(([x, y], j) => { const o = fade(u, 0.5 + j * 0.3); el('circle', { cx: x, cy: y, r: 70, fill: 'none', stroke: ACC, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', opacity: o });
      for (let i = 0; i < 3; i++) card(x - 30 + (i % 2) * 60, y - 20 + Math.floor(i / 2) * 40, 52, 26, { rx: 4, text: String([188, 65, 249, 138, 211, 83, 72, 1, 138][j * 3 + i]), fs: 13.5, mono: true, stroke: WARN, color: WARN, op: o }); });
    sub(320, 360, '군집(IVF)으로 좁히고, 군집 안은 PQ 코드', fade(u, 1.4), { 'font-size': 14.5, fill: INK });
    [['IVFFlat + GPU', '큰 데이터를 GPU 로'], ['HNSW', 'Qdrant · Weaviate · Milvus 의 대표 인덱스']].forEach(([a, b], i) => { const o = pop(u, 1.4 + i * 0.4);
      card(770, 150 + i * 110, 330, 80, { rx: 10, stroke: INFO, s: o }); tx(770, 140 + i * 110, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: o }); tx(770, 166 + i * 110, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: o }); }); }

  const quiz = [
    { q: 'IndexFlatL2로 5만 개에서 쿼리 하나를 검색하면 거리 계산은 몇 번 하는가?',
      o: ['top-5만 찾으니 5번', '50,000번', '군집 수인 100번'], a: 1,
      why: 'Flat은 저장된 모든 벡터와 거리를 잰다. 그래서 recall은 100%지만 시간은 N에 비례해 5만 개 2.81ms, 10만 개 5.36ms로 늘었다.' },
    { q: 'IVF에서 nprobe를 1에서 32로 올리면 어떻게 되는가?',
      o: ['더 많은 군집을 열어 recall이 오르고 검색은 느려진다', 'train을 다시 해야 한다', '메모리가 32배로 는다'], a: 0,
      why: '실측에서 nprobe 1은 recall 0.06·0.08ms, 32는 0.65·1.04ms였다. 여는 군집 수가 정확도와 속도를 맞바꾸는 손잡이다.' },
    { q: 'HNSW 검색이 위층에서 시작하는 이유는 무엇인가?',
      o: ['위층에 벡터 원본이 저장되어 있어서', '위층이 가장 정확한 거리를 주어서', '노드가 적은 위층에서 크게 점프해 목표 근처로 빨리 가려고'], a: 2,
      why: '5만 개를 넣었을 때 맨 위층은 3개, 그 아래는 45개, 1,611개 순이다. 성긴 층에서 멀리 가고 촘촘한 아래층에서 좁힌다.' },
    { q: 'IndexPQ(128, m=8, nbits=8)가 벡터 하나를 저장하는 데 쓰는 크기는 얼마인가?',
      o: ['8 byte', '128 byte', '512 byte'], a: 0,
      why: '16차원 조각 8개마다 256개 중심 중 하나의 번호(1 byte)만 남긴다. 원본 512 byte가 8 byte가 되어 5만 개가 25.6 MB에서 0.4 MB로 준다.' },
    { q: '벤치마크 표의 recall 95~99%를 보고 HNSW를 골랐다. 그다음 해야 할 일은 무엇인가?',
      o: ['efSearch를 최솟값으로 내린다', '내 데이터로 Flat 결과와 비교해 recall을 직접 잰다', '표를 믿고 바로 배포한다'], a: 1,
      why: '같은 efSearch 16이 군집 데이터에서는 0.95, 균등 난수에서는 0.27이었다. recall은 데이터에 따라 크게 달라진다.' },
  ];

  const summary = [
    'Flat은 모든 벡터와 거리를 재서 정확하지만 시간이 N에 비례해 늘어난다.',
    'IVF는 k-means 군집 중 nprobe개만 열고, nprobe가 정확도와 속도를 맞바꾼다.',
    'HNSW는 성긴 위층에서 촘촘한 아래층으로 내려가며 찾고, 엣지 때문에 메모리가 1.5배 든다.',
    'PQ는 벡터를 중심 번호 8개로 줄여 512 byte를 8 byte로 만들지만 recall을 잃는다.',
  ];
  const review = [
    { q: '128차원 벡터 1억 개를 RAM이 넉넉하지 않은 서버 한 대에 올려야 한다. 어떤 인덱스를 먼저 볼까?',
      o: ['IndexFlatL2', 'IndexIVFPQ', 'IndexHNSWFlat'], a: 1,
      why: 'Flat과 HNSW는 벡터마다 원본 512 byte를 그대로 들고 있다. 군집으로 범위를 좁히고 8 byte 코드로 줄이는 IVFPQ가 맞다.' },
    { q: 'IVF 인덱스를 만들고 바로 add를 했더니 오류가 났다. 빠진 단계는?',
      o: ['nprobe 설정', 'efConstruction 설정', 'train으로 군집 중심 학습'], a: 2,
      why: 'IVF와 PQ는 k-means로 중심을 먼저 배워야 벡터를 어느 군집, 어느 코드에 넣을지 정할 수 있다. Flat과 HNSW는 train이 없다.' },
    { q: 'HNSW로 바꾼 뒤 검색은 빨라졌는데 정답을 자주 놓친다. 먼저 손볼 값은?',
      o: ['efSearch를 키운다', 'nlist를 줄인다', 'nbits를 줄인다'], a: 0,
      why: 'efSearch는 검색 때 들고 다니는 후보 수다. 실측에서 16에서 64로 올리자 recall이 0.27에서 0.55로 올랐고 시간은 조금 늘었다.' },
  ];

  R.page({ title: '네 가지 인덱스의 동작', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
