/* I-1-1 GraphRAG란 무엇인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 벡터 공간의 점 7개(청크)와 지식 그래프(노드 6 · 엣지 7)를 그린다.
 * 그래프 수치(노드 6, 엣지 7, 잡스–Friedland 2 hop 이내 경로 3개)는 graph-build.cypher 를 networkx 로 다시 만들어 확인했다.
 * LLM 응답 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, zone, dbIcon, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, INFO, INFOBG } = C;

  // ---------- 벡터 공간: 청크 7개 (의미가 비슷한 것끼리 모이게 2D 로 투영) ----------
  const VP = { c1: [90, 110, 'Apple 창업'], c2: [330, 130, '잡스 인도여행'], c3: [410, 215, 'Friedland 영성'], c4: [70, 245, 'NeXT 설립'],
    c5: [160, 330, 'Pixar 인수'], c6: [200, 175, 'Wozniak 합류'], c7: [320, 300, 'Zen 불교'] };
  const IDS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
  const Q = [340, 185];   // 질문 벡터 자리: 가까운 순서가 c2 · c3 · c7 이 되게
  function vspace(ox, title, op) { zone(ox + 10, 36, 450, 352, title, { fill: SOFT, op: op ?? 1 }); }
  function vpoint(ox, id, o) { o = o || {}; const [x, y, lab] = VP[id], X = ox + x, s = o.s ?? 1, op = o.op ?? 1; if (s <= 0) return;
    if (o.hit) el('circle', { cx: X, cy: y, r: 15, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: op * clamp(s) });
    el('circle', { cx: X, cy: y, r: 8 * (0.4 + 0.6 * clamp(s)), fill: o.faded ? OFF : o.hit ? ACC : INFO, opacity: op });
    tx(X, y - (o.hit ? 21 : 15), lab, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': o.hit ? 800 : 600, fill: o.faded ? MUT : o.hit ? ACC : INK, opacity: op * clamp(s) }); }
  function qmark(ox, s) { if (s <= 0) return; const x = ox + Q[0], y = Q[1], r = 9 * s;
    el('path', { d: `M${x},${y - r} L${x + r},${y} L${x},${y + r} L${x - r},${y} Z`, fill: WARN, stroke: INK, 'stroke-width': 1.5 });
    mono(x - 14, y + 5, 'q_vec', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: clamp(s) }); }
  const vxy = (ox, id) => [ox + VP[id][0], VP[id][1]];

  // ---------- 지식 그래프: 노드 6 · 엣지 7 (graph-build.cypher) ----------
  const N = { jobs: { x: 430, y: 215, label: '잡스', type: ':Person' }, frd: { x: 760, y: 215, label: 'Friedland', type: ':Person' },
    apple: { x: 250, y: 105, label: 'Apple', type: ':Company' }, woz: { x: 250, y: 330, label: 'Wozniak', type: ':Person' },
    india: { x: 595, y: 335, label: '인도', type: ':Place' }, zen: { x: 595, y: 100, label: 'Zen 불교', type: ':Concept' } };
  const EDGES = [['jobs', 'frd', 'LEARNED_FROM'], ['jobs', 'apple', 'CO_FOUNDED'], ['woz', 'apple', 'CO_FOUNDED'],
    ['jobs', 'india', 'TRAVELED_TO'], ['frd', 'india', 'TRAVELED_TO'], ['frd', 'zen', 'PRACTICED'], ['jobs', 'zen', 'PRACTICED']];
  const NW = (n) => tw(n.label, 15) + 30;
  function gnode(n, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1; if (s <= 0) return; const w = NW(n), hot = o.hot;
    if (hot) el('rect', { x: n.x - w / 2 - 6, y: n.y - 24, width: w + 12, height: 48, rx: 24, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: 0.55 * op });
    card(n.x, n.y, w, 36, { rx: 18, text: n.label, fs: 15, fw: 800, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, color: hot ? ACC : INK, sw: hot ? 2.6 : 2, s, op });
    if (o.type !== false) mono(n.x, n.y - 26, n.type + (o.prop ? ' {' + o.prop + '}' : ''), { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.prop ? INFO : MUT, opacity: op * clamp(s) }); }
  function clip(a, b) { const w = NW(a) / 2 + 3, h = 21, dx = b.x - a.x, dy = b.y - a.y, t = Math.min(dx ? w / Math.abs(dx) : 1e9, dy ? h / Math.abs(dy) : 1e9); return [a.x + dx * t, a.y + dy * t]; }
  function gedge(a, b, rel, u, o) { o = o || {}; if (u <= 0) return; const [x1, y1] = clip(a, b), [x2, y2] = clip(b, a), col = o.col || MUT, op = o.op ?? 1;
    grow(x1, y1, x2, y2, u, col, { sw: o.sw || 2.2, dash: o.dash, op });
    if (rel && o.label !== false) { const lo = clamp((u - 0.75) / 0.25) * op, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, w = tw(rel, 13.5) + 12;
      el('rect', { x: mx - w / 2, y: my - 11, width: w, height: 21, rx: 4, fill: PANEL, opacity: lo });
      mono(mx, my + 5, rel, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: o.lcol || (col === MUT ? INK : col), opacity: lo }); } }
  const route = (...ids) => ids.map((id) => [N[id].x, N[id].y]);

  // ---------- 1. 벡터 RAG 인덱싱 ----------
  const CH = (i) => ({ x: 290, y: 72 + i * 46 });
  function s1(t, c) { const { k, u } = c, ox = 460;
    if (k === 0) {
      [['splitter', '500자씩 · 겹침 50', 200], ['embedder', '1536차원 벡터', 480]].forEach(([a, b, x], i) =>
        card(x, 200, 200, 84, { rx: 12, text: a + '\n' + b, fs: 16, s: pop(u, 0.3 + i * 0.5), stroke: i ? INFO : INK }));
      grow(305, 200, 375, 200, E(u, 0.8, 1.1)); grow(585, 200, 708, 200, E(u, 1.3, 1.6));
      dbIcon(760, 190, 'Chroma (벡터 DB)', { s: pop(u, 1.3) });
      sub(480, 330, '벡터 RAG 부품은 이 셋이 전부다', fade(u, 2), { 'font-size': 15, fill: INK }); return; }
    pill(95, 22, '문서 1개', INK, 1, { fs: 13.5 }); pill(290, 22, 'splitter', INK, 1, { fs: 13.5, mono: true }); pill(415, 22, 'embedder', INFO, 1, { fs: 13.5, mono: true });
    vspace(ox, 'Chroma · 벡터 공간 (2D 투영)');
    // 문서가 조각 7개로 쪼개진다
    el('rect', { x: 40, y: 70, width: 110, height: 300, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    IDS.forEach((id, i) => { const f = k === 1 ? E(u, 0.5 + i * 0.13, 1.3 + i * 0.13) : 1, to = CH(i);
      const x = lerp(95, to.x, f), y = lerp(92 + i * 41, to.y, f), w = lerp(100, 160, f), emb = (k === 2 && i < 4 && u > 0.9 + i * 0.35) || (k === 3 && (i < 4 || u > 0.9 + (i - 4) * 0.35)) || k >= 4;
      card(x, y, w, 34, { rx: 6, text: f > 0.55 ? VP[id][2] : '', fs: 15, fw: 600, stroke: emb ? INFO : INK, fill: emb ? INFOBG : PANEL, sw: 1.8 });
      if (f <= 0.55) [0, 1].forEach((j) => el('line', { x1: x - 38, y1: y - 5 + j * 10, x2: x + 38 - j * 22, y2: y - 5 + j * 10, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' })); });
    if (k === 1) { mono(95, 395, 'chunks = 7', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.1) }); return; }
    // 임베딩: 청크 → 벡터 공간의 점
    const landed = (i) => (k === 2 ? (i < 4 ? seg(u, 0.25 + i * 0.35, 0.95 + i * 0.35) : 0) : k === 3 ? (i < 4 ? 1 : seg(u, 0.25 + (i - 4) * 0.35, 0.95 + (i - 4) * 0.35)) : 1);
    IDS.forEach((id, i) => { const f = landed(i), p = CH(i), [X, Y] = vxy(ox, id);
      if (f > 0 && f < 1) fly(p.x + 82, p.y, X, Y, f, '1536차원', { fill: INFO });
      if (f >= 1) vpoint(ox, id, { hit: k === 4 && (id === 'c2' || id === 'c3'), s: k <= 3 ? pop(u, (k === 2 ? 0.95 + i * 0.35 : i < 4 ? 0 : 0.95 + (i - 4) * 0.35) - 0.05) : 1 }); });
    if (k === 2) { mono(ox + 235, 372, 'vectors: 4 / 7', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) }); return; }
    if (k === 3) { dbIcon(905, 345, null, { s: 0.42 * pop(u, 1.7), stroke: INFO }); mono(ox + 220, 372, 'db: 벡터 7개 저장', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { const [ax, ay] = vxy(ox, 'c2'), [bx, by] = vxy(ox, 'c3');
      el('line', { x1: ax + 12, y1: ay + 8, x2: lerp(ax + 12, bx - 12, E(u, 0.3, 1.2)), y2: lerp(ay + 8, by - 8, E(u, 0.3, 1.2)), stroke: MUT, 'stroke-width': 2.2, 'stroke-dasharray': '5 6' });
      cross((ax + bx) / 2 + 6, (ay + by) / 2 + 6, 10, pop(u, 1.3));
      tx(ox + 235, 372, '가까이 놓였을 뿐, "멘토" 같은 선은 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); return; }
    card(ox + 235, 368, 220, 36, { rx: 18, fill: INK, stroke: 'none', text: '점 7개 · 선 0개', fs: 16, fw: 800, color: PANEL, s: pop(u, 0.3) });
    pill(290, 396, 'X와 Y의 관계는?', BAD, pop(u, 1.2), { fs: 14 }); cross(392, 396, 8, pop(u, 1.7)); }

  // ---------- 2. 같은 질문을 벡터 검색으로 ----------
  const RANK = ['c2', 'c3', 'c7'];
  function s2(t, c) { const { k, u } = c, ox = 20, b = c.beat;
    vspace(ox, '벡터 공간 (점 7개)');
    const nHit = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : 3;
    IDS.forEach((id) => { const r = RANK.indexOf(id); vpoint(ox, id, { hit: r >= 0 && r < nHit && !(k === 6 && id === 'c7'), faded: k === 6 && id === 'c7' }); });
    pill(720, 26, b.question || '잡스와 Friedland의 연관?', ACC, k === 0 ? pop(u, 0.2) : 1, { fs: 15, fill: ACCBG });
    if (k === 0) { sub(720, 70, '두 인물 사이의 "관계"를 묻는 질문', fade(u, 0.9), { 'font-size': 15, fill: INK }); return; }
    const qs = k === 1 ? pop(u, 1.0) : 1;
    if (k === 1) dot([[720, 44], [ox + Q[0], Q[1]]], seg(u, 0.2, 1.0), WARN, 7);
    qmark(ox, qs);
    // 가까운 순서로 선을 긋는다
    RANK.forEach((id, i) => { if (i >= nHit) return; const [X, Y] = vxy(ox, id), g = (k === 1 && i === 0) ? E(u, 1.2, 1.9) : (k === 2 && i === 1) ? E(u, 0.3, 1.1) : (k === 3 && i === 2) ? E(u, 0.3, 1.1) : 1;
      if (k === 6 && id === 'c7') return;
      el('line', { x1: ox + Q[0], y1: Q[1], x2: lerp(ox + Q[0], X, g), y2: lerp(Q[1], Y, g), stroke: ACC, 'stroke-width': 2.2, opacity: 0.8 });
      if (g >= 1) mono(lerp(ox + Q[0], X, 0.6) + [12, 4, 12][i], lerp(Q[1], Y, 0.6) + [4, 16, 4][i], '#' + (i + 1), { 'font-size': 14, 'font-weight': 800, fill: ACC }); });
    if (k === 1) { sub(720, 70, '가장 가까운 점부터 걸린다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { mono(720, 74, 'similarity_search(query, k=3)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.4) }); return; }
    // top-3 목록
    tx(600, 86, 'results (k=3)', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    RANK.forEach((id, i) => { const y = 118 + i * 44, [X, Y] = vxy(ox, id), f = k === 3 ? E(u, 1.0 + i * 0.3, 1.7 + i * 0.3) : 1, dim = k === 6 && id === 'c7';
      if (f <= 0) return;
      card(lerp(X, 710, f), lerp(Y, y, f), 220, 34, { rx: 6, text: '#' + (i + 1) + '  ' + VP[id][2], fs: 15, stroke: dim ? GRID : ACC, color: dim ? MUT : INK, fill: dim ? SOFT : PANEL, sw: 1.8 }); });
    if (k === 6) tx(830, 210, '답에 쓰이지 않음', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) });
    if (k === 3) return;
    // LLM 과 응답
    card(710, 278, 170, 50, { rx: 10, text: 'LLM', fs: 17, fw: 800, stroke: INK, s: k === 4 ? pop(u, 0.2) : 1 });
    if (k === 4) for (let i = 0; i < 3; i++) dot([[710, 135 + i * 44], [600 + i * 20, 230], [710, 255]], seg(u, 0.5 + i * 0.25, 1.4 + i * 0.25), ACC, 5);
    if (k === 4) mono(830, 278, '컨텍스트 + 질문', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
    const ans = b.answer || '', bad = b.answerType === 'fail', as = k === 4 ? pop(u, 1.8) : 1;
    if (ans) { card(710, 352, 450, 44, { rx: 10, stroke: bad ? BAD : GOOD, fill: bad ? BADBG : GOODBG, sw: 2, s: as });
      tx(710, 358, ans, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: clamp(as) });
      tx(710, 392, '예시 응답', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp(as) }); }
    if (k >= 5) { const [ax, ay] = vxy(ox, 'c2'), [bx, by] = vxy(ox, 'c3');
      el('line', { x1: ax + 14, y1: ay + 6, x2: bx - 14, y2: by - 6, stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '5 6', opacity: k === 5 ? fade(u, 0.4) : 1 });
      cross((ax + bx) / 2 - 14, (ay + by) / 2 - 4, 9, k === 5 ? pop(u, 0.9) : 1); }
    if (k === 6) banner(240, 398, '조각은 모았지만 잇지는 못했다', pop(u, 1.1)); }

  // ---------- 3. 같은 청크에서 노드·엣지 뽑기 ----------
  const NODE_AT = { jobs: 1, frd: 1, apple: 2, woz: 2, india: 2, zen: 2 };
  const EDGE_AT = [3, 3, 3, 4, 4, 5, 5];
  const PROP = { jobs: 'born: 1955', apple: 'founded: 1976' };
  function s3(t, c) { const { k, u } = c;
    // 왼쪽: 청크 7개
    const cop = k === 6 ? lerp(1, 0.3, E(u, 0.2, 1.2)) : 1;
    tx(85, 34, '청크 7개', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: cop });
    IDS.forEach((id, i) => card(85, 62 + i * 44, 140, 32, { rx: 6, text: VP[id][2], fs: 15, fw: 600, stroke: INFO, fill: INFOBG, sw: 1.6, op: cop }));
    if (k === 0) { card(520, 200, 260, 84, { rx: 12, text: 'LLM 2차 패스\n엔티티 · 관계 추출', fs: 16, stroke: ACC, s: pop(u, 0.2) });
      for (let i = 0; i < 7; i++) dot([[155, 62 + i * 44], [390, 200]], ((t * 0.6 + i / 7) % 1), INFO, 5);
      card(520, 300, 380, 40, { rx: 8, text: '"사람·장소·조직과 관계를 JSON으로"', fs: 14, fw: 600, stroke: GRID, fill: SOFT, s: pop(u, 1.0) });
      sub(520, 360, 'Microsoft GraphRAG · LLMGraphTransformer 와 같은 방식', fade(u, 1.8), { 'font-size': 14 }); return; }
    // 엣지 먼저
    EDGES.forEach(([a, b, rel], i) => { const at = EDGE_AT[i]; if (k < at) return; const g = k === at ? E(u, 0.3 + (i % 3) * 0.35, 1.0 + (i % 3) * 0.35) : 1;
      gedge(N[a], N[b], rel, g, { col: k === at ? ACC : MUT }); });
    Object.keys(N).forEach((id, i) => { const at = NODE_AT[id]; if (k < at) return;
      gnode(N[id], { s: k === at ? pop(u, 0.25 + (i % 4) * 0.3) : 1, prop: PROP[id], hot: k === at }); });
    const nN = Object.keys(N).filter((id) => NODE_AT[id] <= k).length, nE = EDGE_AT.filter((a) => a <= k).length;
    pill(860, 30, `노드 ${nN} · 엣지 ${nE}`, k >= 5 ? ACC : INK, 1, { fs: 15, mono: true });
    if (k === 6) banner(520, 400, '점이 노드가 되고, 선이 관계가 됐다', pop(u, 1.0)); }

  // ---------- 4. 그래프에서 경로 찾기 ----------
  const PATHS = [['jobs', 'frd'], ['jobs', 'india', 'frd'], ['jobs', 'zen', 'frd']];
  function s4(t, c) { const { k, u } = c, b = c.beat;
    const lit = k >= 6 ? 2 : k >= 2 ? Math.min(3, k - 1) : 0;   // 켜진 경로 수
    const usedZen = k < 5;
    EDGES.forEach(([a, bb, rel]) => { const onPath = (p) => p.some((x, i) => i && ((p[i - 1] === a && x === bb) || (p[i - 1] === bb && x === a)));
      const pi = PATHS.findIndex(onPath), on = pi >= 0 && pi < lit && (pi < 2 || usedZen) && !(k >= 5 && pi === 2);
      const off = k >= 5 && pi === 2;
      gedge(N[a], N[bb], rel, 1, { col: on ? ACC : MUT, sw: on ? 3.4 : 2, dash: off ? '5 6' : null, op: on ? 1 : off ? 0.6 : 0.45 }); });
    Object.keys(N).forEach((id) => { const hot = (k >= 1 && (id === 'jobs' || id === 'frd')) || (k >= 3 && id === 'india') || (k === 4 && id === 'zen');
      gnode(N[id], { hot, op: hot || id === 'jobs' || id === 'frd' || k === 0 ? 1 : 0.6 }); });
    pill(180, 26, b.question || '잡스와 Friedland의 연관?', ACC, k === 0 ? pop(u, 0.2) : 1, { fs: 15, fill: ACCBG });
    if (k === 0) { mono(780, 30, '검색 대상: 그래프', { 'font-size': 15, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); return; }
    if (k === 1) { fly(150, 40, N.jobs.x, N.jobs.y, seg(u, 0.2, 1.1), '잡스'); fly(240, 40, N.frd.x, N.frd.y, seg(u, 0.35, 1.3), 'Friedland');
      mono(780, 30, '앵커 노드 2개', { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); return; }
    if (k <= 4) { mono(790, 30, '(a)-[*1..2]-(b)', { 'font-size': 16, 'font-weight': 800, fill: INK, 'text-anchor': 'middle' });
      const p = PATHS[k - 2]; dot(route(...p), seg(u, 0.3, 1.6), ACC, 8);
      pill(110, 396, `경로 ${k - 1}건`, ACC, k === 2 ? pop(u, 1.4) : 1, { fs: 15, mono: true });
      mono(110, 360, p.length - 1 + ' hop', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      return; }
    // 컨텍스트로 쓸 두 경로
    card(750, 42, 400, 56, { rx: 8, stroke: ACC, fill: PANEL, sw: 1.8, s: k === 5 ? pop(u, 0.9) : 1 });
    const co = k === 5 ? fade(u, 1.1) : 1;
    mono(750, 37, '잡스 --[가르침 받음]--> Friedland', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: co });
    mono(750, 58, '잡스 --[1974 여행]--> 인도 <--[여행]-- Friedland', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: co });
    pill(110, 396, '경로 3건 → 2건', k === 5 ? WARN : ACC, 1, { fs: 15 });
    if (k === 5) { tx(N.zen.x + 58, N.zen.y + 5, '이번 답에서 제외', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) }); return; }
    const as = pop(u, 0.4);
    card(610, 396, 520, 40, { rx: 10, stroke: GOOD, fill: GOODBG, sw: 2, s: as, text: b.answer || '', fs: 14.5, fw: 700 });
    mono(910, 396, '예시', { 'font-size': 13.5, fill: MUT, opacity: clamp(as) }); }

  // ---------- 5. 두 표현 나란히 ----------
  const M = { apple: [545, 110], woz: [545, 320], jobs: [650, 215], frd: [870, 215], zen: [760, 110], india: [760, 320] };
  const mn = (id) => ({ x: M[id][0], y: M[id][1], label: N[id].label });
  function panels(k, u, o) { o = o || {}; const op = o.op ?? 1, ox = 20;
    vspace(ox, '벡터 RAG · 점 7 · 선 0', op);
    zone(490, 36, 450, 352, 'GraphRAG · 노드 6 · 엣지 7', { fill: SOFT, op });
    IDS.forEach((id, i) => vpoint(ox, id, { s: k === 0 ? pop(u, 0.2 + i * 0.12) : 1, hit: o.vhit && o.vhit.includes(id), op }));
    EDGES.forEach(([a, b], i) => { const on = o.ghit && o.ghit.some((p) => p.some((x, j) => j && ((p[j - 1] === a && x === b) || (p[j - 1] === b && x === a))));
      gedge(mn(a), mn(b), null, k === 0 ? E(u, 1.0 + i * 0.12, 1.5 + i * 0.12) : 1, { col: on ? ACC : MUT, sw: on ? 3.2 : 2, op: op * (on ? 1 : 0.55) }); });
    Object.keys(M).forEach((id, i) => gnode(mn(id), { type: false, s: k === 0 ? pop(u, 0.6 + i * 0.1) : 1, hot: o.ghit && o.ghit.some((p) => p.includes(id)), op })); }
  function s5(t, c) { const { k, u } = c;
    if (k === 3) { // 비용 배수 (compare.md 의 어림값)
      tx(480, 44, '비용 배수 (벡터 RAG = 1, compare.md 어림값)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      const x0 = 240, W = 600, X = (v) => x0 + (v / 5) * W;
      [1, 2, 3, 4, 5].forEach((v) => { el('line', { x1: X(v), y1: 80, x2: X(v), y2: 340, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(X(v), 362, v + 'x', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); });
      [['인덱싱', 2, 5, '임베딩 + LLM 추출'], ['질의 1회', 1.5, 3, '엔티티 추출 + Cypher + LLM']].forEach(([name, lo, hi, why], i) => {
        const y = 120 + i * 130, g = E(u, 0.3 + i * 0.6, 1.2 + i * 0.6);
        tx(40, y + 26, name, { 'font-size': 17, 'font-weight': 800 });
        el('rect', { x: x0, y, width: (X(1) - x0) * g, height: 20, rx: 4, fill: INFO });
        mono(X(1) + 8, y + 15, '벡터 1x', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8 + i * 0.6) });
        el('rect', { x: x0, y: y + 30, width: (X(lo) - x0) * g, height: 20, rx: 4, fill: ACC });
        el('rect', { x: X(lo), y: y + 30, width: (X(hi) - X(lo)) * E(u, 1.0 + i * 0.6, 1.6 + i * 0.6), height: 20, rx: 4, fill: ACC, opacity: 0.3 });
        mono(X(hi) + 8, y + 45, `그래프 ${lo}~${hi}x`, { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5 + i * 0.6) });
        tx(x0, y + 78, why, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5 + i * 0.6) }); });
      return; }
    const vhit = k === 1 || k === 2 || k === 4 ? ['c2', 'c3'] : null, ghit = k === 1 || k === 2 || k === 4 ? [['jobs', 'india', 'frd']] : null;
    panels(k, u, { vhit, ghit, op: k === 5 ? 0.35 : 1 });
    if (k === 1) { qmark(20, 1); ['c2', 'c3', 'c7'].forEach((id) => { const [X, Y] = vxy(20, id), g = E(u, 0.3, 1.0); el('line', { x1: 20 + Q[0], y1: Q[1], x2: lerp(20 + Q[0], X, g), y2: lerp(Q[1], Y, g), stroke: ACC, 'stroke-width': 2.2 }); });
      pill(245, 404, 'top-k 한 번에 끝', INFO, pop(u, 1.1), { fs: 14 });
      dot([[650, 215], [760, 320]], seg(u, 0.4, 1.2), ACC, 8); dot([[760, 320], [870, 215]], seg(u, 1.3, 2.1), ACC, 8);
      pill(715, 404, 'hop 1 → hop 2 이동', ACC, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 2) { pill(480, 18, '잡스와 Friedland의 연관?', ACC, pop(u, 0.2), { fs: 14, fill: ACCBG });
      card(245, 404, 260, 32, { rx: 8, text: '사실 조각 2개', fs: 14.5, stroke: BAD, fill: BADBG, s: pop(u, 0.8) }); cross(395, 404, 8, pop(u, 1.0));
      card(715, 404, 260, 32, { rx: 8, text: '관계를 문장으로', fs: 14.5, stroke: GOOD, fill: GOODBG, s: pop(u, 1.3) }); check(865, 404, 9, pop(u, 1.5)); return; }
    if (k === 4) { const [ax, ay] = vxy(20, 'c2'), [bx, by] = vxy(20, 'c3');
      el('line', { x1: ax + 14, y1: ay + 6, x2: bx - 14, y2: by - 6, stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '5 6', opacity: fade(u, 0.3) }); cross((ax + bx) / 2 - 14, (ay + by) / 2 - 4, 9, pop(u, 0.7));
      pill(245, 404, '한 청크에 없는 관계 → 길이 없다', BAD, pop(u, 1.0), { fs: 14 });
      dot([[650, 215], [760, 320], [870, 215]], seg(u, 0.5, 2.0), ACC, 8);
      pill(715, 404, '노드를 두 번 건너 답한다', ACC, pop(u, 1.4), { fs: 14 }); return; }
    if (k === 5) { grow(240, 300, 420, 346, E(u, 0.3, 1.0), INFO); grow(720, 300, 540, 346, E(u, 0.3, 1.0), ACC);
      card(480, 372, 420, 52, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 1.0), text: '벡터 청크 + 그래프 경로 → LLM', fs: 16, fw: 800 });
      tx(240, 270, '단편 검색', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.2) });
      tx(720, 270, '관계 분석', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) }); } }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '벡터 RAG가 문서를 저장할 때 남기지 않는 것은 무엇인가?',
      o: ['청크의 원문 텍스트', '청크와 청크 사이의 관계', '청크마다의 임베딩 벡터'], a: 1,
      why: '청크 7개는 각각 1536차원 점으로 저장되지만 "A는 B의 멘토" 같은 연결은 어디에도 기록되지 않는다.' },
    { q: '"잡스와 Friedland의 연관?"에 벡터 RAG가 관계를 답하지 못한 까닭은 무엇인가?',
      o: ['임베딩 차원이 1536으로 너무 작아서', 'top-3에 두 사람의 청크가 들어오지 않아서', '두 사람을 잇는 문장이 어느 한 청크에도 없어서'], a: 2,
      why: '잡스 인도여행과 Friedland 영성 청크는 회수됐다. 둘을 잇는 문장이 없으니 사실 조각만 LLM에 전달됐다.' },
    { q: '그래프 구축 단계에서 LLM이 청크를 다시 읽어 뽑아내는 것은 무엇인가?',
      o: ['엔티티(노드)와 그 사이의 관계(엣지)', '청크마다 새로 만든 임베딩 벡터', '질문과 가장 비슷한 청크 3개'], a: 0,
      why: '사람·회사·장소·개념을 노드로, LEARNED_FROM 같은 관계를 엣지로 만들어 노드 6개, 엣지 7개 그래프가 된다.' },
    { q: '(a)-[*1..2]-(b) 패턴이 잡스와 Friedland 사이에서 찾은 경로는 몇 개인가?',
      o: ['1개', '2개', '3개'], a: 2,
      why: '직접 이어진 LEARNED_FROM 하나와 인도, Zen 불교를 거치는 2 hop 경로 둘을 합쳐 3개다. 답에는 그중 2개만 썼다.' },
    { q: '질문 대부분이 "X에 대해 알려줘" 같은 단편 사실 검색이라면 알맞은 선택은 무엇인가?',
      o: ['GraphRAG만 쓴다', '벡터 RAG로 충분하다', '질문마다 그래프를 새로 만든다'], a: 1,
      why: '단편 검색은 top-k 한 번이면 끝난다. GraphRAG는 인덱싱이 2~5배 비싸서 관계 질문이 있을 때 값을 한다.' },
  ];

  const summary = [
    '벡터 RAG는 청크 7개를 점으로 저장할 뿐, 점과 점 사이의 관계는 남기지 않는다.',
    '그래서 잡스와 Friedland의 관계를 물으면 사실 조각 두 개만 돌아온다.',
    'GraphRAG는 같은 청크에서 엔티티와 관계를 뽑아 노드 6개, 엣지 7개 그래프를 만든다.',
    '그래프에서는 2 hop 경로를 따라 관계를 답하지만, 인덱싱 비용은 2~5배로 늘어난다.',
  ];
  const review = [
    { q: '사내 문서 RAG에 "A팀과 B팀이 함께 한 프로젝트는?"을 물었더니 각 팀 소개만 돌아왔다. 먼저 의심할 것은?',
      o: ['두 팀을 잇는 내용이 한 청크에 함께 적혀 있지 않다', '임베딩 모델의 차원이 너무 크다', 'top-k를 1로 줄여야 한다'], a: 0,
      why: '벡터 검색은 질문과 비슷한 조각을 모을 뿐 조각 사이를 잇지 않는다. 관계가 한 청크에 없으면 답에 들어가지 못한다.' },
    { q: '그래프에서 경로 3개를 찾았는데 Zen 불교 경로는 컨텍스트에서 뺐다. 이렇게 한 이유로 알맞은 것은?',
      o: ['Cypher가 2 hop 경로를 하나만 돌려줘서', '질문에 답하는 데 필요한 경로만 골라 LLM에 넘기려고', 'Zen 불교 노드가 그래프에 없어서'], a: 1,
      why: '경로를 찾는 일과 답의 근거를 고르는 일은 따로다. 이 장에서는 멘토 관계와 인도 경로 두 개만 문장으로 바꿔 넘겼다.' },
    { q: 'FAQ 검색과 "누가 누구에게 영향을 줬나" 분석을 함께 해야 하는 서비스다. 알맞은 구성은?',
      o: ['벡터 RAG 하나로 모두 처리한다', 'GraphRAG 하나로 모두 처리한다', '벡터 검색과 그래프 탐색을 함께 돌리고 결과를 합친다'], a: 2,
      why: '단편 검색은 벡터가 싸고 빠르며 관계 분석은 그래프가 잘한다. 이 장의 결론도 둘을 함께 쓰는 하이브리드다.' },
  ];

  R.page({ title: '벡터 공간과 지식 그래프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
