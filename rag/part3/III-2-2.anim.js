/* III-2-2 인덱싱 전략 IVF / HNSW / PQ — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 군집·그래프·비교 점수는 페이지의 IVF_CLUSTERS · HNSW_LAYERS · COMPARISON, PQ 코드는 beat.pqDim 을 읽는다.
 * IVF 쿼리 위치(40, 52)는 그림용이며, 가까운 중심 순서(C → A)는 그 위치에서 직접 계산한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, check, cross, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const ok = () => typeof IVF_CLUSTERS !== 'undefined';
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const CCOL = { A: INFO, B: WARN, C: ACC, D: GOOD };
  function star(x, y, r, col) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push(`${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`); }
    el('polygon', { points: pts.join(' '), fill: col || BAD, stroke: PANEL, 'stroke-width': 1.5 }); }
  const dia = (x, y, r, col, op) => el('path', { d: `M${x},${y - r} L${x + r},${y} L${x},${y + r} L${x - r},${y} Z`, fill: PANEL, stroke: col, 'stroke-width': 2.8, opacity: op ?? 1 });
  // 바코드 (PQ 코드 8바이트)
  function barcode(x, y, w, h, codes, col, op) { const n = codes.length, bw = w / n; codes.forEach((v, i) => { el('rect', { x: x + i * bw + 1, y, width: bw - 2, height: h, rx: 1.5, fill: col || ACC, opacity: (op ?? 1) * (0.3 + 0.7 * ((v % 97) / 97)) }); }); }

  // ---------- 1. IVF ----------
  const IX = (p) => 50 + p * 4.3, IY = (p) => 30 + p * 3.7, Q = { x: 40, y: 52 };
  function ivfSpace(o) { o = o || {}; zone(30, 30, 440, 370, '벡터 공간 (그림용 4구역)', { fill: SOFT });
    const order = IVF_CLUSTERS.map((c) => ({ id: c.id, d: Math.hypot(c.cx - Q.x, c.cy - Q.y) })).sort((a, b) => a.d - b.d).map((c) => c.id);
    const open = order.slice(0, o.nprobe || 0);
    IVF_CLUSTERS.forEach((c, i) => { const col = CCOL[c.id], on = open.includes(c.id), tr = o.train ?? 1;
      if (tr > 0.5) el('circle', { cx: IX(c.cx), cy: IY(c.cy), r: 62, fill: on ? ACCBG : 'none', stroke: on ? ACC : col, 'stroke-width': on ? 2.8 : 1.5, 'stroke-dasharray': '6 5', opacity: (tr - 0.5) * 2 * (o.dim && !on ? 0.5 : 1) });
      c.points.forEach((p) => el('circle', { cx: IX(p.x), cy: IY(p.y), r: 5.5, fill: tr > 0.3 ? col : OFF, opacity: o.dim && !on ? 0.3 : 1 }));
      if (o.train != null && tr > 0) { const sx = IX(50 + (i - 1.5) * 12), sy = IY(50); dia(lerp(sx, IX(c.cx), tr), lerp(sy, IY(c.cy), tr), 10, col); }
      if (tr >= 1) tx(IX(c.cx) + 50, IY(c.cy) - 50, c.id, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); });
    return order; }
  function s1(t, c) { const { k, u } = c; if (!ok()) return;
    if (k === 0) { ivfSpace({ train: 0 }); tx(500, 70, 'IndexIVFFlat(quantizer, 1536, nlist)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      note(500, 120, '벡터 1M개를 nlist = 100 구역으로 나눌 준비', fade(u, 0.5)); note(500, 150, '그림은 4구역만 그렸다', fade(u, 1.0), { fill: MUT });
      sub(690, 200, '아직 구역 중심이 없다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { ivfSpace({ train: E(u, 0.3, 1.8) }); mono(500, 70, 'index.train(vectors)', { 'font-size': 16, 'font-weight': 800 });
      note(500, 120, 'k-means가 구역 중심 ◇을 찾는다', fade(u, 0.5)); note(500, 150, '그다음 add로 점을 구역에 넣는다', fade(u, 1.6));
      card(690, 230, 380, 56, { rx: 10, stroke: WARN, fill: WARNBG, text: 'HNSW와 달리 train이 꼭 필요하다', fs: 15, s: pop(u, 2.0) }); return; }
    if (k === 2) { const np = u < 1.4 ? 1 : 2, order = ivfSpace({ nprobe: np, dim: true });
      star(IX(Q.x), IY(Q.y), 13, BAD); IVF_CLUSTERS.forEach((cl, i) => grow(IX(Q.x), IY(Q.y), IX(cl.cx), IY(cl.cy), E(u, 0.1, 0.6), MUT, { plain: true, sw: 1.3, dash: '3 4' }));
      mono(500, 70, 'index.nprobe = ' + np, { 'font-size': 18, 'font-weight': 800, fill: ACC });
      note(500, 120, '가까운 중심 순서: ' + order.join(' → '), fade(u, 0.5)); note(500, 160, 'nprobe 1 → ' + order[0] + '만, 2 → ' + order[0] + ' + ' + order[1], fade(u, 1.4), { fill: ACC });
      note(500, 200, '열린 구역의 점만 거리 계산', fade(u, 1.9)); return; }
    if (k === 3) { tx(40, 60, 'nprobe 다이얼 (1M 벡터 · nlist 100)', { 'font-size': 17, 'font-weight': 800 });
      [['1', '1만 개', 0.85, '~85%', '빠름', GOOD], ['10', '10만 개', 0.95, '~95%', '균형', INFO], ['100', '100만 개 (전부)', 1.0, '100%', '느림 · 전수 비교', WARN]].forEach(([n, scan, r, rl, sp, col], i) => {
        const y = 110 + i * 92, s = pop(u, 0.2 + i * 0.45);
        card(110, y + 10, 120, 60, { rx: 30, stroke: col, sw: 2.5, text: 'nprobe ' + n, fs: 16, mono: true, s });
        tx(200, y, '비교: ' + scan, { 'font-size': 15, 'font-weight': 700, opacity: s }); el('rect', { x: 200, y: y + 12, width: 300, height: 16, rx: 3, fill: SOFT, opacity: s });
        el('rect', { x: 200, y: y + 12, width: 300 * [0.01, 0.1, 1][i] * E(u, 0.4 + i * 0.45, 1.0 + i * 0.45) + 2, height: 16, rx: 3, fill: col });
        tx(560, y, 'recall ' + rl, { 'font-size': 15, 'font-weight': 700, opacity: s }); hbar(560, y + 12, 220, r, 1, { col, h: 16, label: false, u: E(u, 0.4 + i * 0.45, 1.0 + i * 0.45) });
        tx(800, y + 26, sp, { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: s }); });
      sub(480, 400, 'recall 85·95%는 데이터마다 다른 예시값, nprobe = nlist면 전수 비교라 100%', fade(u, 1.8)); return; }
    tx(40, 60, '100구역 중 1구역만 연다', { 'font-size': 17, 'font-weight': 800 });
    for (let r = 0; r < 10; r++) for (let q = 0; q < 10; q++) { const on = r === 6 && q === 4, s = clamp(E(u, 0.1, 1.2) * 100 - (r * 10 + q));
      el('rect', { x: 60 + q * 32, y: 90 + r * 30, width: 29, height: 27, rx: 3, fill: on ? ACC : OFF, opacity: (on ? 1 : 0.35) * s }); }
    mono(440, 160, '1,000,000개', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.2) }); mono(440, 200, '→ 10,000개만 비교', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
    note(440, 260, '서울 전체 식당 대신', fade(u, 2.0)); note(440, 288, '내가 있는 구 안에서만 찾는 셈', fade(u, 2.2)); }

  // ---------- 2. HNSW ----------
  const LY = [80, 205, 330];   // L2, L1, L0 판 위치
  const HX = (x) => 90 + x * 4.6, HY = (li, y) => LY[li] + (y - 50) * 0.75;
  function layers(o) { o = o || {};
    HNSW_LAYERS.forEach((L, li) => { const g = o.build ? clamp(o.build * 3 - (2 - li)) : 1; if (g <= 0) return;
      el('path', { d: `M60,${LY[li] - 42} L540,${LY[li] - 42} L580,${LY[li] + 42} L100,${LY[li] + 42} Z`, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: g });
      tx(48, LY[li] + 5, 'L' + (2 - li), { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'end', opacity: g });
      const pos = {}; L.nodes.forEach((n) => { pos[n.id] = [HX(n.x), HY(li, n.y)]; });
      L.edges.forEach(([a, b]) => { const [x1, y1] = pos[a], [x2, y2] = pos[b]; el('line', { x1, y1, x2: lerp(x1, x2, g), y2: lerp(y1, y2, g), stroke: MUT, 'stroke-width': 1.6 }); });
      L.nodes.forEach((n) => { const [x, y] = pos[n.id], hot = (o.hot || []).includes(n.id) && (o.hotL == null || o.hotL.includes(li));
        el('circle', { cx: x, cy: y, r: hot ? 11 : 8, fill: hot ? ACC : PANEL, stroke: hot ? ACC : INFO, 'stroke-width': 2.5, opacity: g });
        tx(x, y + 5, n.id, { 'font-size': 13.5, 'font-weight': 800, fill: hot ? PANEL : INFO, 'text-anchor': 'middle', opacity: g }); }); }); }
  const npos = (li, id) => { const n = HNSW_LAYERS[li].nodes.find((m) => m.id === id); return [HX(n.x), HY(li, n.y)]; };
  function s2(t, c) { const { k, u } = c; if (!ok()) return;
    if (k === 0) { layers({ build: E(u, 0.2, 1.8) }); mono(620, 80, 'IndexHNSWFlat(1536, M=32)', { 'font-size': 14.5, 'font-weight': 700 });
      note(620, 130, '아래층 L0: 모든 벡터', fade(u, 0.6)); note(620, 160, '위로 갈수록 듬성듬성', fade(u, 1.2)); note(620, 200, 'M = 노드당 연결 수 (보통 16~64)', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 1) { layers({}); tx(620, 70, '후보 큐 크기', { 'font-size': 16, 'font-weight': 800 });
      [['efConstruction', 200, '빌드 품질'], ['efSearch', 64, '검색 후보']].forEach(([n, v, d], i) => { const y = 110 + i * 110, g = E(u, 0.3 + i * 0.6, 1.2 + i * 0.6);
        mono(620, y, n + ' = ' + v, { 'font-size': 15, 'font-weight': 800, fill: i ? ACC : INFO });
        const cols = 20, cells = Math.round(v / 8 * g); for (let j = 0; j < 25; j++) el('rect', { x: 620 + (j % cols) * 15, y: y + 12 + Math.floor(j / cols) * 15, width: 12, height: 12, rx: 2, fill: j < cells ? (i ? ACC : INFO) : SOFT });
        sub(620 + 150, y + 64, d + ' · 칸 하나 = 후보 8개', fade(u, 0.6 + i * 0.6)); });
      note(620, 380, '클수록 recall↑ · 느려짐', fade(u, 2.0)); return; }
    if (k === 2) { layers({ hot: ['c'], hotL: [0] }); const [cx, cy] = npos(0, 'c');
      const drop = E(u, 0.4, 1.4), nx = HX(40), ny = lerp(20, HY(2, 75), drop);
      el('circle', { cx: nx, cy: ny, r: 9, fill: WARN, opacity: drop > 0 ? 1 : 0 }); if (drop >= 1) { grow(nx, ny, HX(32), HY(2, 60), E(u, 1.4, 1.8), WARN, { plain: true }); grow(nx, ny, HX(52), HY(2, 65), E(u, 1.5, 1.9), WARN, { plain: true }); }
      mono(620, 80, 'index.add(vectors)', { 'font-size': 16, 'font-weight': 800 });
      note(620, 130, 'train 없이 바로 그래프에 꽂힌다', fade(u, 0.5)); note(620, 160, '이웃 M개와 연결', fade(u, 1.5), { fill: WARN });
      pill(cx + 90, cy - 30, 'entry point c', ACC, pop(u, 1.9), { fs: 14 }); return; }
    if (k === 3) { const path = c.beat.searchPath || [], g = E(u, 0.2, 2.4);
      layers({ hot: path.slice(0, 1 + Math.floor(g * 2.99)), hotL: [0, 1, 2] });
      const route = [npos(0, 'c'), npos(1, 'c'), npos(1, 'd'), npos(2, 'd'), npos(2, 'h')];
      for (let i = 1; i < route.length; i++) grow(route[i - 1][0], route[i - 1][1], route[i][0], route[i][1], clamp(g * 4 - (i - 1)), BAD, { sw: 3.5 });
      tx(620, 80, '검색: 위에서 아래로', { 'font-size': 16, 'font-weight': 800 });
      ['L2: 큰 점프로 대략 위치', 'L1: 한 층 내려와 다시 점프', 'L0: efSearch 후보를 정밀 비교'].forEach((s, i) => note(620, 130 + i * 34, s, fade(u, 0.4 + i * 0.7)));
      mono(620, 260, 'c → d → h', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); note(620, 300, '방문 노드 수 ≈ O(log N)', fade(u, 2.3), { fill: MUT }); return; }
    layers({ hot: ['c', 'd', 'h'] });
    tx(620, 70, '장점', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); note(620, 100, 'train 불필요 · 높은 recall', fade(u, 0.3));
    tx(620, 150, '단점', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.7) }); note(620, 180, '이웃 목록(그래프)을 메모리에 둔다', fade(u, 0.8)); note(620, 206, '빌드가 느리다', fade(u, 0.9));
    ['Chroma', 'Qdrant', 'Weaviate', 'pgvector'].forEach((n, i) => pill(660 + (i % 2) * 140, 270 + Math.floor(i / 2) * 50, n, ACC, pop(u, 1.3 + i * 0.2), { fs: 14 }));
    sub(730, 380, '기본 인덱스가 HNSW', fade(u, 2.1)); }

  // ---------- 3. PQ ----------
  function s3(t, c) { const { k, u } = c; const pq = c.beat.pqDim || { m: 8, sub: 192, codes: [] }, prev = (c.prev && c.prev.pqDim) || { codes: [0, 0, 0, 0, 0, 0, 0, 0] };
    const X0 = 60, W = 840, bw = W / pq.m;
    tx(X0, 50, '1536차원 float32 벡터 1개', { 'font-size': 16, 'font-weight': 800 }); mono(X0 + W, 50, '6,144 B', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
    for (let i = 0; i < pq.m; i++) { const sp = k === 0 ? E(u, 0.3 + i * 0.1, 0.8 + i * 0.1) : 1, x = X0 + i * bw + sp * 4;
      el('rect', { x, y: 66, width: bw - sp * 8, height: 40, rx: 4, fill: INFO, opacity: 0.8 }); mono(x + (bw - 8) / 2, 92, pq.sub + 'd', { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: sp }); }
    if (k === 0) { note(X0, 160, 'm = 8 조각 × 192차원', fade(u, 1.4)); note(X0, 190, 'nbits = 8 → 조각마다 중심 256개 중 하나로', fade(u, 1.9), { fill: ACC }); return; }
    // 코드 칸
    pq.codes.forEach((v, i) => { const x = X0 + i * bw + 4, was = prev.codes[i] || 0, newOne = v && !was, s = newOne && k <= 2 ? pop(u, 0.3 + i * 0.2) : v ? 1 : 0;
      el('rect', { x, y: 150, width: bw - 8, height: 44, rx: 6, fill: v ? ACCBG : SOFT, stroke: v ? ACC : GRID, 'stroke-width': 2 });
      if (v) mono(x + (bw - 8) / 2, 179, String(v), { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: s });
      if (newOne && k <= 2) grow(x + (bw - 8) / 2, 108, x + (bw - 8) / 2, 146, E(u, 0.1 + i * 0.2, 0.4 + i * 0.2), MUT, { plain: true }); });
    sub(X0 + W / 2, 216, '조각마다 가장 가까운 중심 번호 (1바이트)', 1);
    if (k === 1) { for (let j = 0; j < 40; j++) { const a = j * 2.4, r = 10 + (j % 5) * 9; el('circle', { cx: 160 + Math.cos(a) * r * 1.6, cy: 310 + Math.sin(a) * r, r: 3.5, fill: j === 7 ? ACC : OFF, opacity: fade(u, 0.2) }); }
      tx(60, 400, '조각 1의 코드북: 중심 256개 중 42번이 가장 가깝다', { 'font-size': 14.5, 'font-weight': 600, opacity: fade(u, 1.0) });
      note(500, 300, '조각마다 따로 k-means (256개)', fade(u, 0.6)); return; }
    if (k === 2) { tx(60, 270, '벡터 1개', { 'font-size': 15, 'font-weight': 700 }); mono(260, 270, '6,144 B  →  8 B', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      tx(60, 320, '1M 개', { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 160, y: 305, width: 600, height: 22, rx: 4, fill: OFF }); el('rect', { x: 160, y: 335, width: Math.max(2, 600 / 768) , height: 22, rx: 1, fill: ACC });
      mono(770, 322, '6,144 MB', { 'font-size': 14.5, 'font-weight': 700 }); mono(170, 352, '8 MB', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      note(60, 400, '768배 작다 (99.87% 절감)', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 3) { tx(60, 262, '쿼리 → 거리표 (8 조각 × 256)', { 'font-size': 15, 'font-weight': 800 });
      for (let r = 0; r < 8; r++) for (let q = 0; q < 24; q++) { const hit = Math.floor((pq.codes[r] / 256) * 24) === q;
        el('rect', { x: 60 + q * 15, y: 276 + r * 15, width: 13, height: 13, rx: 2, fill: hit && u > 0.6 + r * 0.15 ? BAD : INFO, opacity: hit && u > 0.6 + r * 0.15 ? 1 : 0.15 + 0.5 * (((r * 7 + q * 13) % 10) / 10) }); }
      note(500, 290, 'DB 벡터는 코드만 가지고 있다', fade(u, 0.4)); note(500, 320, '코드 8개로 표를 찾아 더하면 거리', fade(u, 1.2), { fill: BAD });
      note(500, 360, '1M 비교 = 8M 번 표 조회·덧셈', fade(u, 2.0)); return; }
    tx(60, 270, '얻는 것', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); note(60, 300, '메모리 768배 절감', fade(u, 0.3));
    tx(500, 270, '잃는 것', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) }); note(500, 300, 'recall 70~85% (예시)', fade(u, 0.7));
    barcode(60, 330, 220, 40, pq.codes, ACC, fade(u, 1.2)); note(300, 360, '와인 원액 대신 바코드 8개로 비교하는 셈', fade(u, 1.5)); }

  // ---------- 4. 결합 ----------
  function s4(t, c) { const { k, u } = c; if (!ok()) return; const codes = [42, 156, 7, 203, 91, 18, 245, 63];
    if (k <= 1) { zone(30, 30, 440, 370, '① IVF + PQ: 구역 안에 바코드만', { fill: SOFT });
      IVF_CLUSTERS.forEach((cl, i) => { const col = CCOL[cl.id], s = k === 0 ? pop(u, 0.2 + i * 0.2) : 1;
        el('circle', { cx: IX(cl.cx), cy: IY(cl.cy), r: 62 * s, fill: 'none', stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': '6 5' }); dia(IX(cl.cx), IY(cl.cy), 9, col, s);
        cl.points.forEach((p, j) => barcode(IX(p.x) - 12, IY(p.y) - 6, 24, 12, codes.map((v) => (v + j * 31 + i * 17) % 256), col, k === 0 ? fade(u, 0.8 + i * 0.2) : 1)); });
      if (k === 0) { mono(500, 70, 'IndexIVFPQ(q, 1536, 100, 8, 8)', { 'font-size': 14.5, 'font-weight': 700 });
        note(500, 120, 'IVF로 볼 구역을 좁히고', fade(u, 0.8)); note(500, 150, '구역 안 벡터는 8바이트 코드로', fade(u, 1.4), { fill: ACC }); note(500, 190, 'nlist · m · nbits를 한 번에 정한다', fade(u, 2.0), { fill: MUT }); return; }
      tx(500, 70, '1M 벡터 메모리', { 'font-size': 16, 'font-weight': 800 });
      [['Flat (원본)', 6144, '6,144 MB', OFF], ['IVF + PQ', 8, '8 MB + IVF 오버헤드', ACC]].forEach(([n, v, s, col], i) => { const y = 100 + i * 64;
        tx(500, y, n, { 'font-size': 15, 'font-weight': 700 }); const bw = Math.max(3, 300 * v / 6144 * E(u, 0.2 + i * 0.4, 1.0 + i * 0.4)); el('rect', { x: 500, y: y + 10, width: bw, height: 22, rx: 4, fill: col }); mono(510 + bw, y + 27, s, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.4) }); });
      note(500, 280, '1M~1B 규모 · RAM이 모자랄 때', fade(u, 1.8)); note(500, 310, 'FAISS 논문이 십억 벡터에 쓴 조합', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 2) { tx(40, 60, '② HNSW + PQ: 그래프 노드가 바코드', { 'font-size': 16, 'font-weight': 800 });
      const N = [[100, 200], [200, 140], [210, 280], [320, 190], [330, 320], [430, 150], [440, 260]], E2 = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [3, 6], [4, 6], [5, 6]];
      E2.forEach(([a, b], i) => { const g = E(u, 0.2 + i * 0.08, 0.6 + i * 0.08); el('line', { x1: N[a][0], y1: N[a][1], x2: lerp(N[a][0], N[b][0], g), y2: lerp(N[a][1], N[b][1], g), stroke: MUT, 'stroke-width': 1.6 }); });
      N.forEach(([x, y], i) => { el('rect', { x: x - 26, y: y - 13, width: 52, height: 26, rx: 5, fill: PANEL, stroke: INFO, 'stroke-width': 2 }); barcode(x - 22, y - 9, 44, 18, codes.map((v) => (v + i * 37) % 256), INFO, fade(u, 1.0)); });
      tx(560, 120, '메모리 (개념)', { 'font-size': 15, 'font-weight': 800 });
      [['HNSW', 1, BAD], ['HNSW + PQ', 0.25, GOOD]].forEach(([n, v, col], i) => { const y = 150 + i * 60; tx(560, y, n, { 'font-size': 14.5, 'font-weight': 700 }); el('rect', { x: 560, y: y + 10, width: 300 * v * E(u, 0.6 + i * 0.4, 1.4 + i * 0.4) + 2, height: 22, rx: 4, fill: col }); });
      note(560, 310, '그래프 점프는 그대로', fade(u, 1.8)); note(560, 338, '벡터 원본 대신 코드를 들고 있다', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 3) { card(200, 110, 240, 60, { rx: 10, stroke: ACC, text: 'ivf_pq', fs: 17, mono: true, s: pop(u, 0.2) }); card(200, 250, 240, 60, { rx: 10, stroke: INFO, text: 'hnsw_pq', fs: 17, mono: true, s: pop(u, 0.5) });
      grow(322, 110, 470, 175, E(u, 0.8, 1.3), ACC); grow(322, 250, 470, 190, E(u, 0.9, 1.4), INFO);
      card(640, 182, 320, 66, { rx: 12, stroke: INK, sw: 2.5, text: 'D, I = index.search(query, k=5)', fs: 15, mono: true, s: pop(u, 1.3) });
      note(480, 300, '어느 결합이든 부르는 법은 같다', fade(u, 1.9)); note(480, 330, 'Milvus는 HNSW_PQ 인덱스도 제공', fade(u, 2.2), { fill: MUT }); return; }
    // k4: rerank
    tx(40, 60, 'PQ 근사 거리로 top-50', { 'font-size': 16, 'font-weight': 800 }); tx(520, 60, '원본 거리로 다시 정렬 → top-5', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
    for (let i = 0; i < 50; i++) { const x = 40 + (i % 10) * 42, y = 90 + Math.floor(i / 10) * 40, top = i < 8; el('rect', { x, y, width: 36, height: 30, rx: 4, fill: top ? INFOBG : SOFT, stroke: top ? INFO : GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1 + i * 0.012) }); if (top) mono(x + 18, y + 20, String(i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: 1 - fade(u, 1.0, 0.3) }); }
    const re = [3, 1, 6, 2, 8], g = E(u, 1.3, 2.2);
    re.forEach((r, j) => { const sx = 40 + ((r - 1) % 10) * 42 + 18, sy = 105, tx0 = 560 + j * 70, ty = 150;
      card(lerp(sx, tx0, g), lerp(sy, ty, g), 52, 40, { rx: 6, stroke: GOOD, fill: GOODBG, text: String(r), fs: 16, mono: true, op: g > 0 ? 1 : 0 }); mono(tx0, ty + 46, (j + 1) + '위', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); });
    note(520, 280, '근사 순위 3위가 원본으로는 1위', fade(u, 2.3), { fill: GOOD }); sub(700, 320, '(순위 바뀜은 설명용 예)', fade(u, 2.3)); }

  // ---------- 5. 비교 ----------
  const ALG = [['ivf', 'IVF'], ['hnsw', 'HNSW'], ['pq', 'PQ'], ['ivfPq', 'IVF+PQ'], ['hnswPq', 'HNSW+PQ']];
  function s5(t, c) { const { k, u } = c; if (!ok()) return;
    if (k === 0) { ALG.forEach(([key, n], j) => tx(300 + j * 130, 54, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: [INFO, ACC, WARN, GOOD, INK][j] }));
      COMPARISON.forEach((row, i) => { const y = 96 + i * 60; tx(40, y + 6, row.criteria, { 'font-size': 15, 'font-weight': 700 });
        ALG.forEach(([key], j) => { const v = row[key], col = [INFO, ACC, WARN, GOOD, INK][j];
          for (let s = 0; s < 5; s++) { const on = s < v, a = E(u, 0.2 + i * 0.25 + s * 0.05, 0.5 + i * 0.25 + s * 0.05); el('circle', { cx: 256 + j * 130 + s * 22, cy: y, r: 7.5, fill: on ? col : SOFT, opacity: on ? a : 1 }); } }); });
      sub(480, 404, '점 5개 만점 (페이지 비교표)', fade(u, 1.8)); return; }
    if (k === 1) { tx(40, 60, '데이터 규모별 권장', { 'font-size': 17, 'font-weight': 800 });
      [['< 100K', 'Flat (정확)', 'PoC'], ['100K ~ 10M', 'HNSW', 'Chroma · Qdrant'], ['10M ~ 1B', 'IVF + PQ', 'FAISS · Milvus'], ['1B+', 'OPQ + IVF + PQ', 'Facebook 사내']].forEach(([a, b, s], i) => {
        const x = 50 + i * 220, y = 300 - i * 55, sc = pop(u, 0.2 + i * 0.35), col = [GRID, ACC, GOOD, WARN][i];
        el('rect', { x, y, width: 205, height: 392 - y, rx: 8, fill: SOFT, stroke: col, 'stroke-width': 2.2, opacity: sc });
        mono(x + 12, y + 26, a, { 'font-size': 15, 'font-weight': 800, opacity: sc }); tx(x + 12, y + 54, b, { 'font-size': 16, 'font-weight': 800, fill: col === GRID ? INK : col, opacity: sc }); tx(x + 12, y + 80, s, { 'font-size': 14, fill: MUT, opacity: sc }); }); return; }
    if (k === 2) { tx(40, 60, 'Vector Store 기본값', { 'font-size': 17, 'font-weight': 800 });
      [['Chroma · Qdrant · Weaviate', 'HNSW', ACC], ['Milvus', 'IVF+PQ (또는 HNSW)', GOOD], ['FAISS', '직접 선택', INK], ['Pinecone', '자동 (managed)', INFO], ['pgvector', 'HNSW (v0.5+) / IVFFlat', ACC]].forEach(([a, b, col], i) => {
        const y = 100 + i * 60, s = pop(u, 0.2 + i * 0.3); card(480, y + 6, 840, 48, { rx: 10, stroke: GRID, sw: 1.5, s });
        tx(80, y + 12, a, { 'font-size': 16, 'font-weight': 700, opacity: s }); mono(880, y + 12, b, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: s }); });
      note(80, 404, '대부분은 기본값으로 시작해도 충분하다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 3) { tx(40, 60, '결정 트리', { 'font-size': 17, 'font-weight': 800 });
      [['데이터 < 100만?', 'HNSW', ACC], ['RAM 부족?', 'PQ 필수 (IVF+PQ)', GOOD], ['빌드를 빨리?', 'IVF', INFO], ['최고 정확도?', 'HNSW + 큰 efSearch', ACC], ['모르겠다?', 'HNSW 기본값', ACC]].forEach(([q, a, col], i) => {
        const y = 100 + i * 60, s = pop(u, 0.2 + i * 0.35); card(200, y + 6, 280, 46, { rx: 23, stroke: INK, text: q, fs: 15, s });
        grow(344, y + 6, 480, y + 6, E(u, 0.4 + i * 0.35, 0.7 + i * 0.35), col); card(620, y + 6, 260, 46, { rx: 10, stroke: col, sw: 2.2, text: a, fs: 15, s: pop(u, 0.6 + i * 0.35) }); }); return; }
    tx(480, 110, '한 줄 정리', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
    [['정확도', 'HNSW', ACC], ['메모리', 'PQ', WARN], ['균형', 'IVF', INFO], ['대규모', 'IVF+PQ', GOOD]].forEach(([a, b, col], i) => { const cx = 150 + i * 220, s = pop(u, 0.3 + i * 0.35);
      card(cx, 230, 190, 110, { rx: 14, stroke: col, sw: 2.5, s }); tx(cx, 212, a, { 'font-size': 16, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); tx(cx, 250, b, { 'font-size': 22, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); }); }

  const quiz = [
    { q: 'IVF 인덱스에서 nprobe를 1에서 2로 올리면 무엇이 달라지는가?',
      o: ['쿼리에 가장 가까운 구역 다음으로 가까운 구역까지 열어 비교한다', '구역 수(nlist)가 두 배가 된다', '벡터가 압축된다'], a: 0,
      why: '그림의 쿼리는 C 구역 중심에 가장 가깝고 다음이 A다. nprobe 2면 C와 A 안의 점만 거리를 잰다.' },
    { q: 'HNSW 검색이 L2 층에서 시작해 아래층으로 내려가는 까닭은 무엇인가?',
      o: ['위층에 정답이 모여 있어서', '듬성한 위층에서 크게 점프해 대략 위치를 잡고 아래층에서 세밀하게 찾으려고', '아래층은 train이 끝나야 쓸 수 있어서'], a: 1,
      why: '위층은 노드가 적어 멀리 건너뛰기 좋다. c, d, h 순서로 내려오며 좁히므로 방문 노드가 O(log N) 정도로 줄어든다.' },
    { q: '1536차원 벡터를 m=8, nbits=8로 PQ 압축하면 벡터 1개는 몇 바이트가 되는가?',
      o: ['192바이트', '8바이트', '1,536바이트'], a: 1,
      why: '8조각마다 256개 중심 중 하나의 번호(1바이트)만 남긴다. 6,144B가 8B가 되어 1M개면 6,144MB가 8MB다.' },
    { q: 'IVF+PQ나 HNSW+PQ로 top-50을 뽑은 뒤 원본 거리로 다시 정렬하는 이유는 무엇인가?',
      o: ['PQ 압축 때문에 생긴 거리 오차를 바로잡으려고', '검색 속도를 더 높이려고', '인덱스를 다시 학습하려고'], a: 0,
      why: 'PQ 거리는 근사값이라 순위가 조금 틀릴 수 있다. 후보 50개만 원본으로 다시 재면 비용은 작고 정확도는 돌아온다.' },
    { q: '데이터가 100만 개 미만이고 무엇을 고를지 모르겠다면 결정 트리는 무엇을 권하는가?',
      o: ['PQ 단독', 'IVF + PQ', 'HNSW 기본값'], a: 2,
      why: 'HNSW는 train 없이 높은 recall을 내고 Chroma·Qdrant·Weaviate·pgvector의 기본값이다. 메모리가 모자랄 때 PQ를 더한다.' },
  ];

  const summary = [
    'IVF는 k-means로 공간을 구역으로 나누고 nprobe개 구역 안의 벡터만 비교한다.',
    'HNSW는 층층이 쌓은 그래프를 위에서 아래로 점프하며 찾고, train이 필요 없다.',
    'PQ는 벡터를 조각내 번호로 바꿔 6,144B를 8B로 줄이지만 정확도를 일부 잃는다.',
    '규모가 크면 IVF+PQ를 쓰고, 압축으로 흔들린 순위는 원본 거리로 다시 정렬한다.',
  ];
  const review = [
    { q: '벡터 5억 개를 RAM 64GB 서버 한 대에 올려야 한다. 원본은 float32 1536차원이다. 먼저 검토할 조합은?',
      o: ['HNSW Flat', 'IVF + PQ', 'Brute Force'], a: 1,
      why: '원본은 1M개만으로도 6,144MB라 5억 개는 RAM에 들어가지 않는다. PQ로 벡터를 바이트 몇 개로 줄이고 IVF로 볼 구역을 좁힌다.' },
    { q: 'IVF 인덱스를 만들려는데 index.add에서 오류가 났다. 먼저 의심할 것은?',
      o: ['efSearch를 정하지 않았다', 'nprobe가 nlist보다 크다', 'train을 먼저 호출하지 않았다'], a: 2,
      why: 'IVF는 구역 중심을 k-means로 먼저 배워야 벡터를 구역에 넣을 수 있다. HNSW와 달리 train을 먼저 하고 add를 해야 한다.' },
    { q: 'IVF+PQ로 바꿨더니 메모리는 크게 줄었는데 정답 문서 순위가 자주 뒤바뀐다. 손볼 곳으로 알맞은 것은?',
      o: ['PQ로 후보를 넉넉히 뽑고 원본 거리로 재정렬한다', 'nlist를 1로 줄여 구역을 하나로 만든다', 'm을 1로 줄여 더 세게 압축한다'], a: 0,
      why: '압축 거리는 근사라 순위가 흔들린다. top-50을 원본으로 다시 재면 메모리 이득은 지키고 순위는 바로잡는다.' },
  ];

  R.page({ title: '인덱싱 전략', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
