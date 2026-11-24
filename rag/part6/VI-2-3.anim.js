/* VI-2-3 Graph RAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 청크·트리플·경로·커뮤니티·비용은 페이지 STEPS 의 chunks / triples / path / local / global / compare 를 읽는다.
 * 문서 길이 2,800자는 청크 겹침을 보이려고 든 예이고, LLM 답은 예시 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, dot, cross, check, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const N = { kim: ['김영수', '본부장', 'person', 90, 80], lee: ['이민지', '시니어', 'person', 300, 80], park: ['박준호', '주니어', 'person', 510, 80],
    rag: ['RAG 프로젝트', 'Q3 런칭', 'project', 300, 225], team: ['AI 팀', '20명', 'org', 90, 360], cust: ['대형 고객사', '도입 검토', 'org', 510, 360] };
  const EG = [['kim', 'lee', '상사'], ['lee', 'park', '멘토'], ['lee', 'rag', '리드'], ['park', 'rag', '참여'], ['team', 'rag', '주관'], ['kim', 'team', '소속'], ['rag', 'cust', '대상']];
  const TCOL = { person: INFO, project: ACC, org: WARN };
  const hsh = (i) => { const s = Math.sin((i + 1) * 57.31) * 43758.5453; return s - Math.floor(s); };

  function bubble(x, y, s, o) { o = o || {}; const fs = o.fs || 15, w = tw(s, fs) + 30, h = fs + 20, g = G(x, y, o.s, o.op);
    el('path', { d: `M18,${h / 2 - 3} l-8,12 l20,-10`, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: 0, y: -h / 2, width: w, height: h, rx: h / 2, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2 }, g);
    tx(15, fs * 0.36, s, { 'font-size': fs, 'font-weight': 700, fill: o.color || INK }, g); return w; }
  // 그래프 노드
  function node(id, on, o) { o = o || {}; const [l, s2, ty, x, y] = N[id], col = TCOL[ty], w = Math.max(96, tw(l, 15) + 26);
    const g = card(x, y, w, 50, { rx: ty === 'person' ? 25 : 8, stroke: on ? col : GRID, sw: on ? (o.hot ? 3.4 : 2.4) : 1.6, fill: o.hot ? (ty === 'person' ? INFOBG : ty === 'org' ? WARNBG : ACCBG) : on ? PANEL : SOFT, s: o.s, op: o.op });
    tx(0, -2, l, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? INK : MUT }, g); tx(0, 16, s2, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g); }
  // 엣지 (u: 자라는 정도)
  function edge(i, u, o) { o = o || {}; if (u <= 0) return; const [a, b, lb] = EG[i], A = N[a], B = N[b], dx = B[3] - A[3], dy = B[4] - A[4], L = Math.hypot(dx, dy);
    const pad = (P, ux, uy) => { const w = Math.max(96, tw(P[0], 15) + 26) / 2 + 4, h = 29; const t = Math.min(Math.abs(ux) > 1e-6 ? w / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-6 ? h / Math.abs(uy) : 1e9); return t; };
    const ux = dx / L, uy = dy / L, t0 = pad(A, ux, uy), t1 = L - pad(B, ux, uy), x1 = A[3] + ux * t0, y1 = A[4] + uy * t0, x2 = A[3] + ux * t1, y2 = A[4] + uy * t1;
    const col = o.col || (o.on ? ACC : GRID);
    grow(x1, y1, x2, y2, u, col === ACC ? ACC : col === BAD ? BAD : MUT, { sw: o.on ? 3 : 2, dash: o.dash, op: o.on || o.dash ? 1 : 0.7 });
    if (u >= 1 && o.label !== false) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; card(mx, my, tw(lb, 13.5) + 16, 24, { rx: 12, text: lb, fs: 13.5, fw: 800, stroke: o.on ? ACC : GRID, color: o.on ? ACC : MUT, fill: PANEL }); } }
  function graph(on, eon, o) { o = o || {}; EG.forEach((_, i) => { if (o.edges && !o.edges.includes(i)) return; edge(i, o.eu ? o.eu(i) : 1, { on: eon.includes(i) }); });
    Object.keys(N).forEach((id) => node(id, on.includes(id), { hot: o.hot && o.hot.includes(id), s: o.ns ? o.ns(id) : 1 })); }
  const panel = (title, op) => { zone(640, 30, 300, 380, title, { fill: SOFT, op: op ?? 1 }); };

  // ---------- 1. 청크 RAG ----------
  const DOC = 2800, CS = 1000, OV = 100, BX = 40, BW = 880, PX = (v) => BX + BW * v / DOC;
  const CH = [0, 1, 2].map((i) => [i * (CS - OV), Math.min(DOC, i * (CS - OV) + CS)]);   // 0–1000, 900–1900, 1800–2800
  const SP = [240, 300], CP = [[300, 250], [165, 345], [345, 370]];
  function s1(t, c) { const { k, u } = c, ch = c.beat.chunks;
    // 문서와 청크 경계
    tx(BX, 30, '인사·프로젝트 문서 (예: 2,800자)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    mono(920, 30, `chunk_size=${CS} · overlap=${OV}`, { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    el('rect', { x: BX, y: 42, width: BW, height: 22, rx: 4, fill: SOFT, stroke: GRID });
    for (let i = 0; i < 40; i++) el('line', { x1: BX + 8 + i * 22, y1: 53, x2: BX + 8 + i * 22 + 14 * (0.5 + hsh(i) * 0.5), y2: 53, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' });
    CH.forEach(([a, b], i) => { const g = k === 0 ? E(u, 0.4 + i * 0.5, 1.0 + i * 0.5) : 1; if (g <= 0) return; const y = 74 + i * 0;
      el('path', { d: `M${PX(a) + 2},${y} v10 h${(PX(b) - PX(a) - 4) * g} v-10`, fill: 'none', stroke: INFO, 'stroke-width': 2.4 });
      if (g >= 1) { mono((PX(a) + PX(b)) / 2, y + 26, `#${i + 1}  ${a}–${b}`, { 'font-size': 13.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
        if (i > 0) el('rect', { x: PX(a), y: 42, width: PX(a + OV) - PX(a), height: 22, fill: WARN, opacity: 0.55 }); } });
    if (k === 0) { tx(480, 160, '겹친 100자 (주황) 말고는 경계에서 문장 사이 관계가 끊긴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // 벡터 공간
    zone(20, 130, 440, 280, 'FAISS 임베딩 공간 (2D로 줄여 그림)', {});
    for (let i = 0; i < 26; i++) { const x = 50 + hsh(i) * 380, y = 175 + hsh(i + 40) * 215; if (Math.hypot(x - SP[0], y - SP[1]) < 50) continue; el('circle', { cx: x, cy: y, r: 4.5, fill: OFF }); }
    CP.forEach((p, i) => { const a = k === 1 ? E(u, 0.3 + i * 0.3, 1.1 + i * 0.3) : 1; el('circle', { cx: lerp(PX((CH[i][0] + CH[i][1]) / 2), p[0], a), cy: lerp(110, p[1], a), r: 7, fill: INFO });
      if (a >= 1) mono(p[0] + 10, p[1] - 8, `#${i + 1}`, { 'font-size': 14, 'font-weight': 800, fill: INFO }); });
    if (k === 1) { tx(480, 240, '청크마다 벡터 하나', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // 질의와 top-3
    const qs = k === 2 ? pop(u, 0.1) : 1; el('circle', { cx: SP[0], cy: SP[1], r: 9 * qs, fill: ACC }); mono(SP[0] - 4, SP[1] - 16, 'q', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: qs });
    bubble(470, 150, '김영수의 부하가 리드하는 프로젝트의 주관 부서는?', { fs: 13.5, s: qs });
    ch.forEach((cc, i) => { const a = k === 2 ? E(u, 0.4 + i * 0.4, 1.0 + i * 0.4) : 1, p = CP[i];
      el('line', { x1: SP[0], y1: SP[1], x2: lerp(SP[0], p[0], a), y2: lerp(SP[1], p[1], a), stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      if (a < 1) return; mono((SP[0] + p[0]) / 2 + 6, (SP[1] + p[1]) / 2 + 16, cc.score.toFixed(2), { 'font-size': 13.5, 'font-weight': 800, fill: ACC });
      const y = 205 + i * 52, f = k === 2 ? fade(u, 1.0 + i * 0.4) : 1;
      card(705, y, 470, 44, { rx: 8, stroke: INFO, op: f }); mono(482, y + 5, `#${cc.id}`, { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: f });
      tx(518, y + 5, cc.text.length > 26 ? cc.text.slice(0, 26) + '…' : cc.text, { 'font-size': 13.5, opacity: f }); });
    if (k === 3) { card(705, 375, 470, 46, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 0.4) }); tx(482, 370, 'LLM 답 (예시 출력)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
      tx(482, 391, '"관련 정보가 부족해 답할 수 없습니다."', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) }); }
    if (k === 4) { const ys = 375, a = fade(u, 0.2);
      [[505, '김영수'], [640, '이민지'], [800, 'RAG'], [905, 'AI 팀']].forEach(([x, s], i) => card(x, ys, tw(s, 14) + 20, 32, { rx: 16, text: s, fs: 14, fw: 800, stroke: INK, op: a }));
      grow(538, ys, 604, ys, E(u, 0.3, 0.8), ACC); tx(571, ys - 22, '#1', { 'font-size': 13.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      el('line', { x1: 676, y1: ys, x2: 772, y2: ys, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '5 5', opacity: fade(u, 1.0) }); mono(724, ys - 10, '?', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      grow(872, ys, 830, ys, E(u, 1.4, 1.9), ACC); tx(851, ys - 22, '#3', { 'font-size': 13.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); } }

  // ---------- 2. 트리플 → 그래프 ----------
  const nm = (id) => N[id][0];
  function s2(t, c) { const { k, u } = c, tr = c.beat.triples || [], ptr = (c.prev && c.prev.triples) || [], on = c.beat.activeNodes, eon = c.beat.activeEdges, pe = (c.prev && c.prev.activeEdges) || [];
    panel(k === 0 ? 'LLMGraphTransformer' : k === 4 ? '빌드 비용' : `트리플 ${tr.length}건`);
    if (k === 0) { Object.keys(N).forEach((id) => node(id, false, { op: 0.5 }));
      tx(300, 160, '그래프는 아직 비어 있다', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      [['Person', INFO], ['Project', ACC], ['Org', WARN]].forEach(([n, col], i) => card(700 + i * 82, 84, 74, 30, { rx: 15, text: n, mono: true, fs: 13.5, fw: 800, stroke: col, color: col, s: pop(u, 0.4 + i * 0.2) }));
      tx(656, 132, '허용 관계 7종', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
      EG.forEach(([, , lb], i) => card(690 + (i % 4) * 66, 160 + Math.floor(i / 4) * 40, 58, 28, { rx: 14, text: lb, fs: 13.5, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.1 + i * 0.12) }));
      return; }
    // 그래프 (새 엣지는 자란다)
    EG.forEach((_, i) => { if (!eon.includes(i)) { if (k >= 2) edge(i, 1, { on: false }); return; }
      const fresh = !pe.includes(i), j = eon.filter((x) => !pe.includes(x)).indexOf(i); edge(i, fresh ? E(u, 0.3 + j * 0.2, 0.9 + j * 0.2) : 1, { on: true }); });
    Object.keys(N).forEach((id) => node(id, on.includes(id), { s: on.includes(id) && c.prev && !c.prev.activeNodes.includes(id) ? pop(u, 0.2) : 1 }));
    if (k <= 2) tr.forEach((x, i) => { const fresh = i >= ptr.length, a = fresh ? fade(u, 0.3 + (i - ptr.length) * 0.2) : 1;
      tx(656, 80 + i * 40, `${nm(x.s)} –${x.p}→ ${nm(x.o)}`, { 'font-size': 14, 'font-weight': 700, opacity: a }); });
    if (k === 3) { mono(656, 80, 'MATCH (a)-[r]->(b)', { 'font-size': 14, 'font-weight': 800, fill: ACC }); mono(656, 104, 'RETURN a, type(r), b', { 'font-size': 14, 'font-weight': 800, fill: ACC });
      const n = Math.round(lerp(4, 7, E(u, 0.2, 1.6))); mono(656, 170, `엣지 ${n} / 7`, { 'font-size': 24, 'font-weight': 800 }); tx(656, 210, '흩어진 관계가 엣지로 모였다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { tx(656, 84, '청크당 LLM 호출 1회 추가', { 'font-size': 14.5, 'font-weight': 700 });
      [['청크 RAG', 1, OFF], ['Graph 빌드', 1.3, WARN]].forEach(([n, v, col], i) => { const y = 120 + i * 50; tx(656, y + 14, n, { 'font-size': 14, 'font-weight': 700 }); el('rect', { x: 760, y, width: 130 * v / 1.3 * E(u, 0.3 + i * 0.4, 1.1 + i * 0.4), height: 20, rx: 4, fill: col }); });
      mono(656, 240, '+30% 토큰', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      tx(656, 280, '한 번 만들면 계속 재사용', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); } }

  // ---------- 3. traverse ----------
  const CY = ['MATCH (a:Person {name:"김영수"})', '  -[:상사]->(b)', '  -[:리드]->(p:Project)', '  <-[:주관]-(o:Org)', 'RETURN o.name'];
  function s3(t, c) { const { k, u } = c, path = c.beat.path, pp = (c.prev && c.prev.path) || [], on = c.beat.activeNodes, eon = c.beat.activeEdges;
    panel('GraphCypherQAChain');
    graph(on, eon, { hot: on });
    // Cypher 줄: hop 이 늘 때마다 한 줄씩
    const lines = k === 0 ? 0 : k === 1 ? 1 : Math.min(5, path.length + (k >= 4 ? 1 : 0));
    CY.forEach((s, i) => { const vis = i < lines || k >= 4, cur = (k === 2 && i === 1) || (k === 3 && i === 2) || (k === 4 && i === 3);
      mono(656, 76 + i * 26, s, { 'font-size': 13.5, 'font-weight': cur ? 800 : 600, fill: cur ? ACC : vis ? INK : OFF, opacity: vis ? 1 : 0.35 }); });
    if (k === 0) { tx(656, 230, '자연어 → Cypher 자동 변환', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) }); return; }
    if (k === 1) { const s = pop(u, 0.2); el('circle', { cx: N.kim[3], cy: N.kim[4], r: 62 * s, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); tx(656, 230, '시작 노드: 김영수', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) }); }
    // 새 hop 을 따라 흐르는 점
    if (path.length > pp.length && pp.length) { const a = pp[pp.length - 1].node, b = path[path.length - 1].node; dot([[N[a][3], N[a][4]], [N[b][3], N[b][4]]], seg(u, 0.2, 1.3), ACC, 9); }
    if (k >= 2) { tx(656, 230, `hop ${path.length - 1} / 3`, { 'font-size': 20, 'font-weight': 800, fill: ACC, class: 'mono' });
      tx(656, 262, path.map((p) => p.label).join(' → '), { 'font-size': 14, 'font-weight': 700 }); }
    if (k >= 4) card(790, 320, 250, 44, { rx: 22, text: '답: AI 팀', fs: 17, fw: 800, stroke: 'none', fill: GOOD, color: PANEL, s: k === 4 ? pop(u, 1.4) : 1 });
    if (k === 5) { el('line', { x1: 150, y1: 360, x2: 445, y2: 360, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 6', opacity: fade(u, 0.4) });
      card(300, 396, 170, 30, { rx: 15, text: '없는 엣지는 못 간다', fs: 13.5, fw: 800, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.9) });
      tx(656, 390, '추출 품질이 정답률을 정한다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); } }

  // ---------- 4. Local vs Global ----------
  const COMM = { C1: [['kim', 'team'], INFO], C2: [['lee', 'park', 'rag'], ACC], C3: [['cust'], WARN] };
  function hull(ids, col, a, label) { const xs = ids.map((i) => N[i][3]), ys = ids.map((i) => N[i][4]), x0 = Math.min(...xs) - 80, x1 = Math.max(...xs) + 80, y0 = Math.min(...ys) - 44, y1 = Math.max(...ys) + 44;
    el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 30, fill: col, opacity: 0.12 * a, stroke: col, 'stroke-width': 2, 'stroke-opacity': a, 'stroke-dasharray': '6 5' });
    mono(x0 + 12, y1 - 10, label, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: a }); }
  function s4(t, c) { const { k, u } = c, L = c.beat.local, Gq = c.beat.global, comm = Gq.communities;
    if (k >= 2) Object.keys(COMM).forEach((id, i) => { const [ids, col] = COMM[id]; hull(ids, col, k === 2 ? fade(u, 0.3 + i * 0.4) : 1, id); });
    graph(k <= 1 ? c.beat.activeNodes : Object.keys(N), k <= 1 ? c.beat.activeEdges : [], { hot: k <= 1 ? ['kim'] : [] });
    if (k <= 1) { panel('Local Query');
      tx(656, 80, L.query, { 'font-size': 14.5, 'font-weight': 700 }); mono(656, 108, 'seed=김영수 · max_hops=1', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      if (k === 0) { const s = pop(u, 0.3); el('circle', { cx: N.kim[3], cy: N.kim[4], r: 62 * s, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); return; }
      const g = E(u, 0.3, 1.4); el('circle', { cx: N.kim[3], cy: N.kim[4], r: lerp(62, 300, g), fill: INFO, opacity: 0.06, stroke: INFO, 'stroke-dasharray': '4 4' });
      [['노드', `${L.nodes.length}개`], ['시간', L.time], ['토큰', L.tokens.toLocaleString('en-US')]].forEach(([a, b], i) => { const op = fade(u, 1.0 + i * 0.3);
        tx(656, 170 + i * 46, a, { 'font-size': 14.5, fill: MUT, opacity: op }); mono(740, 172 + i * 46, b, { 'font-size': 22, 'font-weight': 800, fill: INFO, opacity: op }); }); return; }
    panel(k === 4 ? 'Local vs Global' : 'Global · 커뮤니티 요약');
    if (k === 2) { mono(656, 80, 'detect_communities', { 'font-size': 14, 'font-weight': 800, fill: ACC }); mono(656, 102, '(algorithm="leiden")', { 'font-size': 14, fill: ACC });
      comm.forEach((cc, i) => tx(656, 150 + i * 34, `${cc.id} ${cc.name}`, { 'font-size': 15, 'font-weight': 800, fill: COMM[cc.id][1], opacity: fade(u, 0.5 + i * 0.4) })); return; }
    if (k === 3) { comm.forEach((cc, i) => { const y = 92 + i * 92, s = pop(u, 0.3 + i * 0.4); card(790, y, 270, 76, { rx: 10, stroke: COMM[cc.id][1], s });
        tx(668, y - 12, `${cc.id} 요약`, { 'font-size': 14, 'font-weight': 800, fill: COMM[cc.id][1], opacity: s }); tx(668, y + 14, cc.summary, { 'font-size': 13.5, opacity: s }); });
      tx(656, 390, '큰 그림 질문은 요약들 위에서 합성', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k4: 비교
    tx(656, 80, Gq.query, { 'font-size': 14, 'font-weight': 700 });
    [['시간', 0.12, 2.4, '120ms', '2.4s'], ['토큰', 850, 4200, '850', '4,200']].forEach(([n, a, b, la, lb], i) => { const y = 120 + i * 110, g = E(u, 0.3 + i * 0.4, 1.2 + i * 0.4), W = 170;
      tx(656, y, n, { 'font-size': 15, 'font-weight': 800 });
      tx(656, y + 30, 'Local', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }); el('rect', { x: 710, y: y + 18, width: Math.max(3, W * a / b * g), height: 16, rx: 3, fill: INFO }); mono(710 + W * a / b * g + 8, y + 31, la, { 'font-size': 14, 'font-weight': 800, fill: INFO });
      tx(656, y + 60, 'Global', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }); el('rect', { x: 710, y: y + 48, width: W * g, height: 16, rx: 3, fill: ACC }); mono(710 + W * g + 8, y + 61, lb, { 'font-size': 14, 'font-weight': 800, fill: ACC }); });
    tx(656, 372, '인물 추적 → Local', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) }); tx(656, 396, '전체 동향 → Global', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }

  // ---------- 5. 비용 ----------
  const nv = (s) => parseFloat(String(s).replace(/[^0-9.]/g, ''));
  function s5(t, c) { const { k, u } = c, cmp = c.beat.compare, pn = c.prev ? c.prev.compare.length : 0;
    tx(30, 34, '청크 RAG', { 'font-size': 14, 'font-weight': 700, fill: MUT }); el('rect', { x: 100, y: 24, width: 14, height: 12, rx: 2, fill: OFF });
    tx(130, 34, 'Graph RAG', { 'font-size': 14, 'font-weight': 700, fill: ACC }); el('rect', { x: 210, y: 24, width: 14, height: 12, rx: 2, fill: ACC });
    tx(940, 34, '예시 수치', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const bars = cmp.filter((r) => !isNaN(nv(r.chunk.v)));
    bars.forEach((r, i) => { const fresh = i >= pn, g = fresh ? E(u, 0.2 + (i - pn) * 0.4, 1.0 + (i - pn) * 0.4) : 1, y = 66 + i * 72, a = nv(r.chunk.v), b = nv(r.graph.v), top = Math.max(a, b), W = 420, op = k >= 3 ? 0.5 : 1;
      tx(30, y + 22, r.metric, { 'font-size': 15, 'font-weight': 700, opacity: op });
      el('rect', { x: 250, y, width: W * a / top * g, height: 20, rx: 4, fill: OFF, opacity: op }); el('rect', { x: 250, y: y + 26, width: W * b / top * g, height: 20, rx: 4, fill: ACC, opacity: op });
      if (g > 0.6) { mono(258 + W * a / top, y + 16, r.chunk.v, { 'font-size': 14, fill: MUT, opacity: op }); mono(258 + W * b / top, y + 42, r.graph.v, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: op }); }
      const d = i === 0 ? '+80%' : i === 1 ? '-25%' : '+33%p', good = i > 0;
      if (g >= 1) mono(930, y + 30, d, { 'font-size': 19, 'font-weight': 800, fill: good ? GOOD : BAD, 'text-anchor': 'end', opacity: op * (fresh ? fade(u, 1.0 + (i - pn) * 0.4) : 1) }); });
    if (k === 0) tx(250, 150, '트리플·커뮤니티 추출 LLM 이 붙는다 · 1회 비용', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
    if (k === 2) { el('rect', { x: 20, y: 200, width: 920, height: 64, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      banner(480, 310, '빌드는 비싸고, 질의는 싸고, 다중 hop은 정확하다', pop(u, 0.9)); }
    if (k === 3) { const col = [['청크 RAG', OFF, ['FAQ · 매뉴얼', '학술 논문 검색'], '갱신 저렴'], ['Graph RAG', ACC, ['법률 · 판례', '의료 케이스', '기업 KMS · CRM'], '갱신 시 재추출']];
      col.forEach(([n, cc, ds, up], j) => { const x = 30 + j * 470; tx(x, 300, n, { 'font-size': 15, 'font-weight': 800, fill: j ? ACC : MUT });
        mono(x + 120, 300, up, { 'font-size': 14, fill: j ? BAD : GOOD, 'font-weight': 700, opacity: fade(u, 1.6) });
        ds.forEach((d, i) => card(x + 70 + i * 148, 350, 138, 40, { rx: 20, text: d, fs: 14, fw: 700, stroke: j ? ACC : MUT, fill: PANEL, s: pop(u, 0.3 + j * 0.5 + i * 0.2) })); }); }
    if (k === 4) { [['갱신 때 트리플을 다시 뽑아야 한다', '스트리밍 갱신에 불리'], ['추출 품질이 답 품질을 정한다', 'schema 설계가 중요'], ['관계가 드문 도메인', '그래프 효익이 적다']].forEach(([a, b], i) => {
        const s = pop(u, 0.3 + i * 0.4), x = 165 + i * 315; card(x, 340, 295, 70, { rx: 10, stroke: BAD, s }); tx(x - 132, 334, a, { 'font-size': 14, 'font-weight': 800, opacity: s }); tx(x - 132, 358, b, { 'font-size': 13.5, fill: MUT, opacity: s }); }); } }

  const quiz = [
    { q: '청크 RAG가 "김영수의 부하가 리드하는 프로젝트의 주관 부서"를 답하지 못한 이유는 무엇인가?',
      o: ['유사도 점수가 0.5보다 낮아서', '"이민지 → RAG 리드" 관계가 회수된 어느 청크에도 없어서', 'chunk_overlap이 너무 커서'], a: 1,
      why: '청크 #1엔 김영수→이민지, #3엔 RAG→AI 팀만 있다. 가운데 고리가 없어 다중 hop이 끊긴다.' },
    { q: 'LLMGraphTransformer가 청크에서 뽑아내는 것은 무엇인가?',
      o: ['(주어, 관계, 목적어) 트리플', '청크 임베딩 벡터', '커뮤니티 요약문'], a: 0,
      why: '(김영수, 상사, 이민지) 같은 트리플 7건이 나오고 Neo4j에 엣지로 적재된다.' },
    { q: '3-hop traverse에서 RAG 프로젝트에서 AI 팀으로 갈 때 쓰는 엣지는 무엇인가?',
      o: ['소속', '참여', '주관 (역방향)'], a: 2,
      why: '엣지는 AI 팀 -[주관]-> RAG 프로젝트 방향이라, Cypher에서 <-[:주관]-로 거꾸로 따라간다.' },
    { q: '"회사 조직 전반의 협업 패턴은?" 같은 질문에 맞는 방식은 무엇인가?',
      o: ['Local 쿼리 (seed 주변 1-hop)', 'Global 쿼리 (커뮤니티 요약 합성)', '청크 top-3 검색'], a: 1,
      why: '전체 그림 질문은 Leiden으로 묶은 커뮤니티마다 요약을 만들고 그 위에서 합성한다. 예시로 2.4초, 4,200 토큰이 든다.' },
    { q: '예시 수치에서 Graph RAG가 청크 RAG보다 비싼 항목은 무엇인가?',
      o: ['질의당 평균 토큰', '다중 hop 정확도', '빌드 비용'], a: 2,
      why: '빌드는 $10에서 $18로 80% 비싸지만 한 번이면 된다. 질의당 토큰은 3,200에서 2,400으로 오히려 줄어든다.' },
  ];

  const summary = [
    '청크로 자르면 문장 사이 관계가 경계에서 끊겨 여러 단계를 거치는 질문에 답하지 못한다.',
    'LLM으로 트리플을 뽑아 그래프에 넣으면 흩어진 관계가 명시적인 엣지가 된다.',
    'Cypher로 김영수에서 이민지, RAG 프로젝트, AI 팀까지 3-hop을 따라가 답을 찾는다.',
    '예시 수치로 빌드 비용은 80% 늘지만 다중 hop 정확도는 46%에서 79%로 오른다.',
  ];
  const review = [
    { q: '법률 판례 검색에서 "A 판례가 인용한 판례가 다시 인용한 법 조항"을 자주 묻는다. 알맞은 구성은?',
      o: ['청크 크기를 키운 청크 RAG', '인용 관계를 엣지로 둔 Graph RAG', '검색 없이 LLM만 쓰기'], a: 1,
      why: '인용의 인용은 다중 hop 관계다. 엣지로 명시하면 traverse로 따라갈 수 있다.' },
    { q: 'Graph RAG를 붙였는데 특정 관계 질문에서만 늘 답이 없다. 먼저 확인할 것은?',
      o: ['그 관계가 트리플 추출 단계에서 엣지로 만들어졌는지', '임베딩 모델의 차원 수', 'Global 쿼리의 커뮤니티 수'], a: 0,
      why: '그래프에 없는 엣지는 traverse로 갈 수 없다. 추출 schema와 품질부터 봐야 한다.' },
    { q: '매일 수천 건씩 바뀌는 FAQ 문서 검색에 Graph RAG를 쓰자는 제안이 나왔다. 가장 큰 걸림돌은?',
      o: ['다중 hop 정확도가 낮아진다', 'Local 쿼리가 느리다', '바뀔 때마다 트리플을 다시 뽑아야 한다'], a: 2,
      why: '그래프는 갱신 때 재추출 비용이 든다. 관계 질의가 적고 갱신이 잦은 FAQ는 청크 RAG가 낫다.' },
  ];

  R.page({ title: 'Graph RAG 관계 탐색', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
