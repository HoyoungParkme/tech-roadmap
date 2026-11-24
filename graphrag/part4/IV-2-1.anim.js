/* IV-2-1 커뮤니티 탐지 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그래프 데이터는 실제로 만든 것: networkx random_partition_graph([25]*4, 0.16, 0.003, seed=29), 노드 번호는 random.Random(24)로 섞음.
 * S: 페이지의 louvain_phase1을 그대로 돌린 바퀴별 동네 번호(1·2·3바퀴), P1: Phase 1 수렴, H1: Phase 2 1바퀴, F: 최종 4개(= leidenalg 결과)
 * 좌표는 nx.spring_layout(seed=3). 수치(212·11·Q 값)는 모두 이 그래프에서 계산했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, BAD, GOOD, WARN, INFO } = C;
  const D = {"P":[[547,263],[50,44],[276,334],[102,84],[219,157],[250,356],[332,167],[490,302],[169,165],[186,172],[321,145],[103,99],[226,261],[489,268],[154,86],[195,147],[91,343],[348,205],[295,170],[126,152],[297,120],[146,67],[494,289],[122,70],[112,76],[480,297],[457,222],[64,73],[563,268],[304,302],[249,305],[343,157],[223,188],[506,275],[517,257],[278,164],[40,68],[281,295],[99,69],[333,114],[276,146],[259,159],[356,139],[259,173],[550,301],[410,302],[237,137],[239,329],[549,282],[105,118],[136,321],[299,181],[266,151],[203,276],[274,204],[553,257],[48,113],[270,241],[520,318],[87,100],[184,324],[516,265],[73,59],[76,70],[190,289],[245,313],[131,96],[282,313],[550,246],[365,146],[261,344],[207,300],[257,380],[295,319],[95,59],[192,231],[339,174],[211,362],[536,285],[580,261],[528,277],[164,123],[251,271],[534,304],[510,306],[123,57],[435,249],[80,40],[280,134],[440,284],[202,292],[61,93],[56,81],[524,231],[88,78],[285,191],[475,291],[254,289],[222,313],[157,99]],"E":[[0,34],[0,28],[0,13],[0,79],[1,27],[1,74],[2,29],[2,65],[2,5],[3,38],[3,99],[3,62],[3,66],[3,91],[4,52],[4,8],[4,41],[5,47],[6,31],[6,54],[6,69],[6,42],[7,22],[7,83],[7,45],[7,84],[7,61],[7,58],[8,9],[9,15],[9,32],[10,35],[10,69],[10,76],[10,42],[10,39],[10,41],[11,92],[11,81],[11,19],[11,94],[11,24],[11,27],[11,74],[12,75],[12,30],[12,64],[12,71],[12,54],[13,86],[13,22],[13,33],[13,96],[14,46],[14,38],[14,85],[14,94],[14,21],[14,23],[15,46],[16,50],[17,86],[17,18],[17,51],[17,95],[18,31],[18,54],[18,40],[18,46],[18,41],[19,75],[19,59],[19,49],[20,52],[20,88],[20,39],[21,99],[21,74],[22,34],[22,83],[22,45],[22,48],[23,63],[23,99],[23,62],[23,24],[24,38],[24,66],[24,74],[25,33],[25,89],[25,45],[25,84],[25,61],[25,58],[26,34],[26,93],[26,61],[26,76],[27,38],[27,59],[28,55],[28,33],[28,68],[28,48],[29,45],[29,97],[29,37],[29,67],[29,82],[29,30],[30,67],[30,73],[30,70],[30,98],[30,71],[30,90],[32,75],[32,35],[32,41],[33,86],[33,44],[33,61],[34,78],[34,68],[34,61],[34,48],[35,51],[35,88],[35,40],[35,95],[36,62],[36,94],[36,91],[37,67],[37,82],[38,59],[38,87],[40,46],[40,41],[41,51],[41,76],[41,95],[41,46],[41,81],[43,54],[43,51],[43,46],[44,83],[44,58],[44,48],[45,96],[45,89],[45,73],[46,76],[46,99],[47,97],[47,73],[47,70],[47,77],[47,90],[48,55],[48,83],[49,99],[49,81],[49,56],[49,91],[50,90],[52,88],[52,95],[53,65],[53,75],[53,90],[55,80],[55,93],[55,61],[56,91],[57,97],[57,95],[59,63],[59,94],[60,98],[60,71],[61,80],[61,78],[61,68],[61,79],[62,92],[62,87],[62,74],[64,98],[65,73],[66,81],[68,93],[70,73],[70,72],[73,98],[74,87],[74,85],[74,94],[75,82],[75,90],[78,84],[80,96],[84,96],[85,94],[86,89],[90,97],[90,98],[91,92],[91,94],[92,94]],"S":[[0,1,2,3,4,2,5,6,4,7,8,9,10,11,12,7,13,14,15,16,17,18,19,20,21,22,23,1,24,25,26,5,7,11,27,28,29,30,31,17,32,32,5,14,33,22,32,34,19,35,13,14,36,37,15,38,35,39,33,16,40,38,29,20,10,37,41,30,24,8,42,40,42,42,21,37,32,34,43,0,38,41,30,19,43,12,11,31,17,22,37,35,9,23,12,36,43,39,40,18],[0,1,2,3,4,2,5,6,4,7,8,9,10,11,12,7,13,14,8,15,16,17,6,18,9,19,20,1,21,22,23,5,7,11,6,8,24,22,25,16,8,8,5,26,6,19,8,27,6,28,13,8,16,29,26,30,28,31,6,15,23,30,24,18,10,2,3,22,21,5,27,23,27,27,9,29,8,27,32,0,30,3,22,6,32,12,11,25,16,19,29,28,24,20,12,8,32,31,23,17],[0,1,2,3,4,2,5,6,4,7,8,9,10,11,12,7,13,8,8,14,15,16,6,17,9,18,19,1,20,21,10,5,8,11,6,8,22,21,23,15,8,8,5,8,6,18,8,24,6,25,13,8,15,26,8,27,25,28,6,14,10,27,22,17,10,2,3,21,20,5,24,10,24,24,9,26,8,24,29,0,27,3,21,6,29,12,11,23,15,18,26,25,22,19,12,8,29,28,10,16]],"P1":[0,1,2,3,4,2,5,6,4,7,8,9,10,11,12,7,13,8,8,14,15,16,6,17,9,18,19,1,20,21,10,5,8,11,6,8,22,21,23,15,8,8,5,8,6,18,8,24,6,25,13,8,15,26,8,27,25,28,6,14,10,27,22,17,10,2,3,21,20,5,24,10,24,24,9,26,8,24,29,0,27,3,21,6,29,12,11,23,15,18,26,25,22,19,12,8,29,28,10,16],"F":[0,3,1,3,2,1,2,0,2,2,2,3,1,0,3,2,1,2,2,3,2,3,0,3,3,0,0,3,0,1,1,2,2,0,0,2,3,1,3,2,2,2,2,2,0,0,2,1,0,3,1,2,2,1,2,0,3,1,0,3,1,0,3,3,1,1,3,1,0,2,1,1,1,1,3,1,2,1,0,0,0,3,1,0,0,3,0,3,2,0,1,3,3,0,3,2,0,1,1,3],"grp":[0,3,1,3,2,1,2,0,2,2,2,3,1,0,3,2,1,2,2,3,2,3,0,3,3,0,0,3,0,1,1,2,2,0,0,2,3,1,3,2,2,2,2,2,0,0,2,1,0,3,1,2,2,1,2,0,3,1,0,3,1,0,3,3,1,1,3,1,0,2,1,1,1,1,3,1,2,1,0,0,0,3,1,0,0,3,0,3,2,0,1,3,3,0,3,2,0,1,1,3],"H1":[0,1,2,3,4,2,5,0,4,5,5,6,7,0,6,5,8,5,5,6,4,6,0,6,6,0,0,1,0,9,7,5,5,0,0,5,6,9,6,4,5,5,5,5,0,0,5,7,0,3,8,5,4,7,5,0,3,7,0,6,7,0,6,6,7,2,3,9,0,5,7,7,7,7,6,7,5,7,0,0,0,3,9,0,0,6,0,6,4,0,7,3,6,0,6,5,0,7,7,6]};
  const COL = [ACC, WARN, INFO, BAD], NAME = ['A', 'B', 'C', 'D'];
  const TOPIC = ['1970s 창업자', '90s SW 거인', '클라우드 시대', 'AI 연구자'];   // 페이지의 예시 이름
  const P = D.P.map(([x, y]) => [x - 10, y - 8]);
  const QV = { single: -0.01, s: [0.28, 0.39, 0.42], p1: 0.42, h1: 0.63, f: 0.70 };
  // 동네 크기·중심
  function groups(part) { const g = {}; part.forEach((c, i) => { (g[c] = g[c] || []).push(i); }); return g; }
  function cent(ids) { return [ids.reduce((a, i) => a + P[i][0], 0) / ids.length, ids.reduce((a, i) => a + P[i][1], 0) / ids.length]; }
  const GP1 = groups(D.P1), GH1 = groups(D.H1), GF = groups(D.F);
  const INTRA = [0, 1, 2, 3].map((k) => D.E.filter(([a, b]) => D.F[a] === k && D.F[b] === k).length);
  // 노드 색: 혼자인 동네는 회색, 아니면 그 노드가 결국 들어갈 큰 동네의 색 (보기 쉽게)
  function colorOf(part, sizes) { return (i) => (sizes[part[i]] > 1 ? COL[D.F[i]] : OFF); }
  function sizesOf(part) { const s = {}; part.forEach((c) => { s[c] = (s[c] || 0) + 1; }); return s; }
  function graph(o) { o = o || {}; const pos = o.pos || P, part = o.part;
    const eu = o.edgeU ?? 1;
    D.E.forEach(([a, b], j) => { const g = clamp((eu * (D.E.length + 20) - j) / 20); if (g <= 0) return;
      const same = part && part[a] === part[b] && (o.sizes ? o.sizes[part[a]] > 1 : true);
      const inter = o.inter && D.F[a] !== D.F[b];
      const col = inter ? BAD : same ? COL[D.F[a]] : GRID;
      el('line', { x1: pos[a][0], y1: pos[a][1], x2: lerp(pos[a][0], pos[b][0], g), y2: lerp(pos[a][1], pos[b][1], g), stroke: col, 'stroke-width': inter ? 3 : same ? 2.2 : 1.4, opacity: o.edgeOp ?? (same || inter ? 0.9 : 1) }); });
    P.forEach((_, i) => { const s = o.nodeS ? o.nodeS(i) : 1; if (s <= 0) return; const col = o.col ? o.col(i) : OFF;
      el('circle', { cx: pos[i][0], cy: pos[i][1], r: (o.r || 6.5) * s, fill: col, stroke: PANEL, 'stroke-width': 1.5, opacity: o.nodeOp ?? 1 }); }); }
  // 오른쪽 계기판: 동네 수, Q
  function panel(n, q, o) { o = o || {}; const x = 640;
    zone(x - 16, 24, 336, o.h || 150, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
    tx(x, 56, '동네 수', { 'font-size': 14, 'font-weight': 700, fill: MUT }); mono(x + 300, 60, n == null ? '—' : String(Math.round(n)), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'end', fill: INK });
    tx(x, 104, 'modularity Q', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    mono(x + 300, 108, q == null ? '—' : (q < 0 && q > -0.005 ? '0.00' : q.toFixed(2)), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'end', fill: q != null && q >= 0.6 ? ACC : INK });
    el('rect', { x, y: 124, width: 300, height: 12, rx: 6, fill: SOFT });
    if (q != null && q > 0) el('rect', { x, y: 124, width: 300 * clamp(q), height: 12, rx: 6, fill: ACC }); }
  const tq = (c, a, b, d) => tween(a, b, c.u, d);

  // 1. 큰 그래프, 군집 모름
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { el('rect', { x: 20, y: 20, width: 570, height: 380, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
      sub(305, 214, '엔티티 그래프가 들어올 자리', fade(u, 0.3), { 'font-size': 15 });
      [['입력', 'G (V=100, E≈200)'], ['출력', 'node → community_id']].forEach(([a, s], i) => { const y = 120 + i * 90, op = fade(u, 0.5 + i * 0.6);
        tx(640, y, a, { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: op }); mono(640, y + 32, s, { 'font-size': 18, 'font-weight': 800, fill: i ? ACC : INK, opacity: op }); });
      grow(760, 168, 760, 194, E(u, 1.3, 1.8), MUT); return; }
    graph({ edgeU: k === 1 ? E(u, 0.8, 2.4) : 1, nodeS: k === 1 ? (i) => pop(u, 0.1 + i * 0.006) : null, inter: k === 2 && u > 1 });
    const V = k === 1 ? Math.round(lerp(0, 100, E(u, 0.1, 0.8))) : 100, Ecount = k === 1 ? Math.round(lerp(0, 212, E(u, 0.8, 2.4))) : 212;
    zone(624, 24, 336, 110, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
    tx(640, 60, '노드 V', { 'font-size': 14, 'font-weight': 700, fill: MUT }); mono(940, 64, String(V), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'end' });
    tx(640, 108, '엣지 E', { 'font-size': 14, 'font-weight': 700, fill: MUT }); mono(940, 112, k === 1 ? '≈' + Ecount : String(Ecount), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'end' });
    if (k === 2) { card(790, 200, 300, 64, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.1) });
      tx(790, 196, '심어 둔 4덩어리 사이 엣지', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(790, 220, '11개', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) }); }
    if (k === 3) { mono(790, 200, 'community = -1', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, opacity: fade(u, 0.3) });
      sub(790, 228, '100개 모두 한 덩어리 취급', fade(u, 0.6), { 'font-size': 14.5 });
      tx(640, 290, 'Q', { 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: fade(u, 1) }); mono(940, 294, '0.00', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1) });
      sub(790, 330, '전부 한 동네면 modularity는 0', fade(u, 1.4)); }
    if (k === 4) { mono(790, 210, 'louvain_communities(G)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      sub(790, 238, '아직 부르지 않았다 · Q 측정 전', fade(u, 0.7), { 'font-size': 14.5 }); } }

  // 2. Phase 1: 노드를 이웃 동네로 옮긴다
  const PARTS = [null, D.P.map((_, i) => i), D.S[0], D.S[1], D.S[2], D.P1];
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { const focus = 7, nb = D.E.filter(([a, b]) => a === focus || b === focus).map(([a, b]) => (a === focus ? b : a));
      graph({ col: (i) => (k === 1 ? COL[i % 4] : OFF), nodeOp: k === 1 ? 0.55 : 1 });
      if (k === 0) { nb.forEach((j, n) => grow(P[focus][0], P[focus][1], P[j][0], P[j][1], E(u, 0.6 + n * 0.25, 1.0 + n * 0.25), ACC, { sw: 3, plain: true }));
        el('circle', { cx: P[focus][0], cy: P[focus][1], r: 11, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.3) }); }
      panel(k === 1 ? 100 : null, k === 1 ? tq(c, null, -0.01) : null);
      const txt = k === 0 ? ['노드 하나씩 이웃 동네를 살펴', 'Q가 가장 많이 오르는 곳으로 옮긴다'] : ['처음엔 노드마다 자기 혼자 동네', 'partition = { i: i }'];
      txt.forEach((s, i) => tx(640, 230 + i * 30, s, { 'font-size': 15.5, 'font-weight': i ? 600 : 700, fill: i && k === 1 ? ACC : INK, class: i && k === 1 ? 'mono' : null, opacity: fade(u, 0.5 + i * 0.4) })); return; }
    const cur = PARTS[k], prev = PARTS[k - 1], sc = sizesOf(cur), sp = sizesOf(prev);
    const switched = (i) => u > 0.3 + i * 0.016;
    const part = cur.map((v, i) => (switched(i) ? v : 1000 + prev[i]));
    const sizes = {}; part.forEach((v) => { sizes[v] = (sizes[v] || 0) + 1; });
    graph({ part, sizes, col: (i) => (switched(i) ? colorOf(cur, sc)(i) : colorOf(prev, sp)(i)) });
    const ns = [100, 44, 33, 30, 30], qs = [-0.01, 0.28, 0.39, 0.42, 0.42];
    panel(tq(c, ns[k - 2], ns[k - 1], 1.6), tq(c, qs[k - 2], qs[k - 1], 1.6));
    const moves = [64, 20, 6, 0][k - 2];
    tx(640, 230, `${k - 1}바퀴째 훑기`, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
    mono(640, 262, `옮긴 노드 ${moves}개`, { 'font-size': 16, fill: moves ? ACC : MUT, 'font-weight': 700, opacity: fade(u, 0.6) });
    if (k === 5) { banner(790, 330, '이동 0 → Pass 1 수렴', pop(u, 1)); sub(790, 372, '큰 덩어리 4개로는 아직', fade(u, 1.5), { 'font-size': 14.5 }); }
    else sub(790, 300, '같은 동네 안 엣지는 색으로 굵게', fade(u, 1), { 'font-size': 14 }); }

  // 3. Phase 2: 동네를 super-node로 접고 다시
  function superNodes(gs, posOf) { return Object.keys(gs).map((c) => ({ c, ids: gs[c], at: posOf ? posOf(c) : cent(gs[c]) })); }
  function s3(t, c) { const { k, u } = c, sz1 = sizesOf(D.P1);
    const col1 = colorOf(D.P1, sz1);
    if (k <= 1) { graph({ part: D.P1, sizes: sz1, col: col1 }); panel(30, 0.42);
      if (k === 0) { tx(640, 230, '동네 하나 = 점 하나로 접고', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) }); tx(640, 262, '그 위에서 Phase 1을 다시', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) }); }
      else { mono(640, 236, 'H = louvain_phase2(G, partition)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); sub(790, 268, 'H의 노드 = community id', fade(u, 0.8), { 'font-size': 14.5 }); }
      return; }
    const sn = superNodes(GP1);
    const fold = k === 2 ? E(u, 0.3, 1.6) : 1;
    const pos = P.map((p, i) => { const s = sn.find((x) => x.c == D.P1[i]); return [lerp(p[0], s.at[0], fold), lerp(p[1], s.at[1], fold)]; });
    if (k === 2) { graph({ pos, part: D.P1, sizes: sz1, col: col1, edgeOp: 1 - fold * 0.8 }); panel(30, 0.42);
      tx(640, 230, `super-node ${Math.round(lerp(0, 30, E(u, 1, 1.8)))}개`, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.8) }); return; }
    // super-graph H
    const posF = (stage) => sn.map((s) => { let at = s.at;
      if (stage > 0) { const h = cent(GH1[D.H1[s.ids[0]]]), f = cent(GF[D.F[s.ids[0]]]); const a = E(stage, 0, 1), b2 = E(stage, 1.15, 2.1);
        at = [lerp(lerp(s.at[0], h[0], a), f[0], b2), lerp(lerp(s.at[1], h[1], a), f[1], b2)]; } return at; });
    const st = k === 5 ? seg(u, 0.2, 2.4) * 2.2 : 0, at = posF(st);
    const W = {}; let inter = 0; D.E.forEach(([a, b]) => { const ca = D.P1[a], cb = D.P1[b]; if (ca === cb) return; inter++; const key = ca < cb ? ca + '-' + cb : cb + '-' + ca; W[key] = (W[key] || 0) + 1; });
    const idx = {}; sn.forEach((s, i) => { idx[s.c] = i; });
    if (k >= 4) Object.keys(W).forEach((key, j) => { const [a, b] = key.split('-'), A = at[idx[a]], B2 = at[idx[b]], g = k === 4 ? E(u, 0.2 + j * 0.012, 0.6 + j * 0.012) : 1;
      el('line', { x1: A[0], y1: A[1], x2: lerp(A[0], B2[0], g), y2: lerp(A[1], B2[1], g), stroke: MUT, 'stroke-width': 1 + W[key] * 1.3, opacity: 0.5 }); });
    sn.forEach((s, i) => { const r = 5 + Math.sqrt(s.ids.length) * 3.4, col = s.ids.length > 1 ? COL[D.F[s.ids[0]]] : OFF;
      el('circle', { cx: at[i][0], cy: at[i][1], r, fill: col, opacity: 0.85, stroke: PANEL, 'stroke-width': 2 });
      if (k === 3 && s.ids.length > 1) { const ins = D.E.filter(([a, b]) => D.P1[a] == s.c && D.P1[b] == s.c).length;
        el('circle', { cx: at[i][0] + r * 0.7, cy: at[i][1] - r * 0.7, r: r * 0.55, fill: 'none', stroke: INK, 'stroke-width': 1.6, opacity: fade(u, 0.4 + i * 0.03) });
        if (ins >= 6) mono(at[i][0], at[i][1] + 5, String(ins), { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 0.8) }); } });
    const n = k === 5 ? (u < 1.4 ? lerp(30, 10, E(u, 0.2, 1.2)) : lerp(10, 4, E(u, 1.5, 2.4))) : 30;
    const q = k === 5 ? (u < 1.4 ? lerp(0.42, 0.63, E(u, 0.2, 1.2)) : lerp(0.63, 0.70, E(u, 1.5, 2.4))) : 0.42;
    panel(n, q);
    if (k === 3) { tx(640, 230, '동네 안 엣지 102개', { 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 0.3) }); tx(640, 260, '→ super-node의 self-loop 가중치', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) });
      sub(790, 300, '고리 안 숫자 = 내부 엣지 수', fade(u, 1.2), { 'font-size': 14 }); sub(790, 330, '접기만 했으니 Q는 0.42 그대로', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 4) { tx(640, 230, `super-edge ${Object.keys(W).length}개`, { 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 0.6) }); tx(640, 260, `가중치 합 ${inter} = 동네 사이 엣지 수`, { 'font-size': 15, fill: MUT, opacity: fade(u, 1) });
      sub(790, 300, '선 굵기 = weight', fade(u, 1.3), { 'font-size': 14 }); }
    if (k === 5) { tx(640, 230, u < 1.4 ? '한 바퀴: 30 → 10' : '두 바퀴: 10 → 4', { 'font-size': 17, 'font-weight': 800 }); } }

  // 4. Leiden: refinement + 최종 4개
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { const at = [0, 1, 2, 3].map((g) => cent(GF[g]));
      at.forEach((p, g) => { el('circle', { cx: p[0], cy: p[1], r: 22, fill: COL[g], opacity: 0.85 }); mono(p[0], p[1] + 5, NAME[g], { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL }); });
      if (k === 0) { ['local move', 'refinement', 'aggregation'].forEach((s, i) => { const y = 150 + i * 70;
          card(790, y, 220, 46, { rx: 10, text: s, fs: 16, fw: 800, mono: true, stroke: i === 1 ? ACC : GRID, color: i === 1 ? ACC : INK, sw: i === 1 ? 3 : 1.8, s: pop(u, 0.3 + i * 0.4) });
          if (i) grow(790, y - 47, 790, y - 25, E(u, 0.2 + i * 0.4, 0.5 + i * 0.4), MUT); });
        tx(790, 62, 'Leiden = Louvain + refinement', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
        sub(790, 380, '끊긴 동네가 생기지 않게 안을 다시 쪼갠다', fade(u, 1.8), { 'font-size': 14 }); }
      else { pill(720, 160, 'import igraph', INK, pop(u, 0.3), { mono: true, fs: 15 }); pill(870, 160, 'leidenalg', ACC, pop(u, 0.6), { mono: true, fs: 15 });
        sub(790, 220, 'leidenalg는 igraph 그래프를 받는다', fade(u, 1), { 'font-size': 14.5 }); }
      return; }
    const back = k === 2 ? E(u, 0.3, 1.6) : 1;
    const pos = P.map((p, i) => { const f = cent(GF[D.F[i]]); return [lerp(f[0], p[0], back), lerp(f[1], p[1], back)]; });
    const colored = k >= 3;
    graph({ pos, part: colored ? D.F : null, col: (i) => (colored ? (k === 3 ? (u > 0.3 + i * 0.015 ? COL[D.F[i]] : OFF) : COL[D.F[i]]) : OFF), edgeOp: k === 2 ? back : 1 });
    if (k === 2) { mono(640, 70, 'G_ig = ig.Graph.from_networkx(G)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(640, 120, `노드 ${Math.round(lerp(4, 100, back))} · 엣지 212 그대로`, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) }); return; }
    if (k >= 4) [0, 1, 2, 3].forEach((g) => { const xs = GF[g].map((i) => P[i][0]), ys = GF[g].map((i) => P[i][1]), x0 = Math.min(...xs) - 14, y0 = Math.min(...ys) - 14, w = Math.max(...xs) - x0 + 14, h = Math.max(...ys) - y0 + 14, gg = k === 4 ? E(u, 0.3 + g * 0.3, 1 + g * 0.3) : 1;
      el('rect', { x: x0, y: y0, width: w, height: h, rx: 14, fill: 'none', stroke: COL[g], 'stroke-width': 2.5, 'stroke-dasharray': '7 5', pathLength: 1, opacity: gg });
      mono(Math.max(x0 + 8, 20), Math.max(y0 - 6, 18), NAME[g], { 'font-size': 16, 'font-weight': 800, fill: COL[g], opacity: gg }); });
    panel(k === 3 ? lerp(4, 4, 1) : 4, 0.70);
    if (k === 3) { tx(640, 230, 'refinement 뒤 100개 모두 착색', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.4) }); }
    if (k === 4) { mono(640, 230, 'find_partition(..., seed=42)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); sub(790, 262, 'seed를 고정해 매번 같은 결과', fade(u, 0.8), { 'font-size': 14 }); }
    if (k === 5) { [0, 1, 2, 3].forEach((g) => { const y = 214 + g * 40; mono(640, y + 13, NAME[g], { 'font-size': 16, 'font-weight': 800, fill: COL[g] });
        hbar(670, y, 200, 25 * E(u, 0.2 + g * 0.2, 1 + g * 0.2), 25, { h: 18, col: COL[g], text: '25' }); });
      sub(790, 390, '만들 때 심은 네 덩어리와 같다', fade(u, 1.8), { 'font-size': 14 }); } }

  // 5. 동네별 요약 → Global query
  function s5(t, c) { const { k, u } = c;
    const foldG = k >= 4 ? (k === 4 ? E(u, 0.3, 1.5) : 1) : 0;
    const pos = P.map((p, i) => { const f = cent(GF[D.F[i]]); return [lerp(p[0], f[0], foldG), lerp(p[1], f[1], foldG)]; });
    graph({ pos, part: D.F, col: (i) => COL[D.F[i]], edgeOp: 1 - foldG * 0.85, nodeOp: k === 1 || k === 2 ? 0.5 : 1 });
    if (k === 1 || k === 2) { graph({ part: D.F, col: (i) => (D.F[i] === 0 ? COL[0] : 'none'), edgeOp: 0, r: 7 }); }
    const X = 790, cardY = (g) => 70 + g * 78;
    if (k === 0) { card(X, 200, 240, 70, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.3) }); tx(X, 196, 'OpenAI()', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.5) });
      sub(X, 222, '동네 하나당 LLM 한 번', fade(u, 0.8), { 'font-size': 14 }); return; }
    if (k === 1) { const a = cent(GF[0]); fly(a[0], a[1], X, 150, seg(u, 0.4, 1.4), `노드 25 · 엣지 ${INTRA[0]}`, { fill: COL[0], stay: true });
      mono(X, 220, 'summarize_community(', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(X, 244, '  nodes, edges) → str', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(X, 280, '한 문단, 200자 이내', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { R.snippet(630, 130, ['다음 인물/회사와 관계를', '한 문단으로 요약하라.', '엔티티: {nodes}', '관계:   {edges}'], { fs: 14.5, op: fade(u, 0.3) }); return; }
    // 요약 카드 4장
    [0, 1, 2, 3].forEach((g) => { const y = cardY(g), s = k === 3 ? pop(u, 0.9 + g * 0.35) : 1, a = cent(GF[g]);
      if (k === 3) dot([a, [X - 140, y]], seg(u, 0.2 + g * 0.35, 1 + g * 0.35), COL[g], 6);
      card(X, y, 290, 66, { rx: 10, stroke: COL[g], sw: 2, s, op: k >= 5 ? 1 : 1 });
      tx(X - 130, y - 6, `${NAME[g]} · ${TOPIC[g]}`, { 'font-size': 15, 'font-weight': 800, fill: COL[g], opacity: k === 3 ? fade(u, 1 + g * 0.35) : 1 });
      mono(X - 130, y + 18, `엔티티 25 · 내부 관계 ${INTRA[g]}`, { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 1.1 + g * 0.35) : 1 }); });
    if (k === 3) mono(X + 145, 30, 'LLM 호출 4회', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 2) });
    else mono(X + 145, 30, '이름·요약문은 예시', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT });
    if (k === 4) banner(300, 395, '노드 100개 → 요약 4개', pop(u, 1.6));
    if (k >= 5) { el('path', { d: `M${X - 155},${cardY(0) - 33} h-12 V${cardY(3) + 33} h12`, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: k === 5 ? fade(u, 0.3) : 1 });
      mono(X - 175, 200, 'ctx', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: k === 5 ? fade(u, 0.5) : 1 });
      card(300, 60, 360, 46, { rx: 23, stroke: INK, sw: 2, text: '"이들이 만든 산업 트렌드는?"', fs: 15, s: k === 5 ? pop(u, 0.9) : 1 }); }
    if (k === 6) { fly(X - 200, 262, 330, 230, seg(u, 0.2, 1.1), 'system = 요약 4개', { fill: ACC });
      card(300, 200, 150, 56, { rx: 12, stroke: ACC, fill: C.ACCBG, sw: 2.5, text: 'gpt-4o', fs: 16, s: pop(u, 0.1) });
      card(300, 330, 420, 56, { rx: 10, stroke: GOOD, sw: 2, text: '네 동네 요약을 엮은 답 (예시)', fs: 15, color: GOOD, s: pop(u, 1.4) });
      grow(300, 230, 300, 298, E(u, 1.1, 1.5), GOOD); } }

  const quiz = [
    { q: '군집을 찾기 전, community를 모두 -1로 둔 그래프의 modularity는 얼마인가?',
      o: ['0.00', '1.00', '0.70'], a: 0,
      why: '전부 한 덩어리면 안쪽 엣지 비율이 기대값과 같아 Q가 0이다. 이 그래프는 노드 100, 엣지 212다.' },
    { q: 'Louvain Phase 1에서 노드 하나가 하는 일은 무엇인가?',
      o: ['가장 차수가 큰 노드에게 간다', 'Q가 가장 많이 오르는 이웃의 동네로 옮긴다', '무작위 동네로 옮긴다'], a: 1,
      why: '이웃 동네마다 합류했을 때의 Q 증분을 재서 가장 큰 곳으로 간다. 이 그래프에서는 세 바퀴 만에 동네 30개, Q 0.42가 됐다.' },
    { q: 'Phase 2에서 동네 안쪽 엣지를 self-loop 가중치로 남겨야 하는 까닭은 무엇인가?',
      o: ['그림을 예쁘게 그리려고', 'super-node 수를 줄이려고', '버리면 차수가 줄어 Q 계산이 틀어지기 때문'], a: 2,
      why: '내부 엣지 102개를 남기면 H에서 잰 Q가 원래와 같은 0.42지만, 버리면 -0.04가 된다. 이후 이동 판단도 틀어진다.' },
    { q: 'leidenalg로 이 그래프를 나눈 결과는 무엇인가?',
      o: ['26·24·25·25, Q 0.61', '25개씩 4개, Q 0.70', '동네 30개, Q 0.42'], a: 1,
      why: 'seed=42로 돌리면 심어 둔 네 덩어리와 똑같이 25개씩 나뉘고 Q는 0.70이다. Leiden은 refinement로 끊긴 동네를 막는다.' },
    { q: 'Global query에 community 요약을 쓰는 이유는 무엇인가?',
      o: ['노드·엣지 전체 대신 짧은 요약 4개만 컨텍스트에 넣으면 되기 때문', '요약이 원본보다 항상 정확하기 때문', 'Local query보다 호출이 적기 때문'], a: 0,
      why: '노드 100개와 엣지 212개를 통째로 넣는 대신 동네별 요약 4개로 전체를 훑는다. 요약은 동네마다 LLM을 한 번씩 불러 만든다.' },
  ];

  const summary = [
    '노드 100개, 엣지 212개 그래프는 처음엔 어떤 노드가 한 무리인지 모른다.',
    'Louvain Phase 1은 Q가 오르는 이웃 동네로 노드를 옮겨 동네 30개, Q 0.42에서 멈춘다.',
    'Phase 2는 동네를 점으로 접고 다시 돌려 4개, Q 0.70으로 합친다.',
    '동네마다 LLM으로 요약을 만들어 두면 Global 질문에 요약 4개만 넣으면 된다.',
  ];
  const review = [
    { q: '직접 짠 Louvain의 Phase 2에서 super-graph로 잰 Q가 갑자기 음수로 나왔다. 먼저 의심할 것은?',
      o: ['동네 안쪽 엣지를 self-loop로 남기지 않고 버렸다', 'seed를 고정하지 않았다', '노드 수가 너무 많다'], a: 0,
      why: '이 그래프에서 같은 분할을 self-loop 없이 재면 Q가 -0.04, 남기면 0.42다. 접을 때 내부 엣지를 가중치로 남겨야 한다.' },
    { q: 'Phase 1이 끝났는데 동네가 30개나 남았다. 다음 단계로 맞는 것은?',
      o: ['노드 이동을 처음부터 다시 한다', 'Q가 0.42라 실패로 보고 멈춘다', '동네를 super-node로 접고 그 위에서 이동을 반복한다'], a: 2,
      why: 'Phase 1은 노드 단위로만 움직여 작은 동네에서 멈춘다. 접은 그래프에서 다시 돌리면 30개가 10개, 4개로 합쳐진다.' },
    { q: '"이 회사들 전체의 공통 흐름은?"이라는 질문이 왔다. 인덱싱 때 미리 해 둘 일은?',
      o: ['모든 노드에 임베딩만 붙여 둔다', '커뮤니티를 나누고 동네마다 요약을 만들어 둔다', '엣지를 모두 지운다'], a: 1,
      why: '전체를 훑는 질문은 특정 노드에서 출발할 수 없다. 동네별 요약을 미리 만들어 두면 그 요약만 모아 답할 수 있다.' },
  ];

  R.page({ title: '엔티티 그래프 · 커뮤니티 탐지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
