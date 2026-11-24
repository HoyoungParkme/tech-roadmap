/* V-2-1 비용 최적화 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   비용 막대의 값(LLM·Cache·인덱싱·Embedding, 합계 100 → 80 → 58 → 20)은 페이지의 가정 모델이다. 합계가 맞는지는 파이썬으로 다시 더해 확인했다.
   cache_key 값은 hashlib.sha256 으로 실제 계산했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, check, cross, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그래프 (지식그래프 노드 12개, 예시) ----------
  const GN = [[90, 120], [160, 80], [230, 130], [130, 190], [210, 205], [290, 85], [300, 175], [80, 260], [170, 270], [260, 260], [330, 245], [340, 120]];
  const GE = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [1, 5], [5, 11], [2, 6], [6, 11], [4, 6], [3, 7], [7, 8], [4, 8], [8, 9], [9, 10], [6, 10], [6, 9]];
  function kg(o) { o = o || {}; const dx = o.dx || 0, dy = o.dy || 0;
    GE.forEach(([a, b]) => { const on = o.lit && o.lit(a) && o.lit(b); el('line', { x1: GN[a][0] + dx, y1: GN[a][1] + dy, x2: GN[b][0] + dx, y2: GN[b][1] + dy, stroke: on ? o.col || WARN : GRID, 'stroke-width': on ? 2.5 : 2 }); });
    GN.forEach(([x, y], i) => { const on = o.lit && o.lit(i), v = o.vec && o.vec(i);
      el('circle', { cx: x + dx, cy: y + dy, r: 12, fill: on ? (o.fill || WARNBG) : PANEL, stroke: on ? (o.col || WARN) : MUT, 'stroke-width': 2 });
      if (v) el('rect', { x: x + dx + 9, y: y + dy - 18, width: 16, height: 9, rx: 2, fill: INFO, opacity: v }); });
    if (o.title) tx(dx + 60, dy + 330, o.title, { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }

  // ---------- 오른쪽: 비용 막대 (페이지 데이터 cost) ----------
  const KEYS = [['llm', 'LLM 호출'], ['indexing', '인덱싱·탐색'], ['embedding', 'Embedding'], ['cache', 'Cache']];
  function costs(c, x, y) { x = x || 640; y = y || 70; const b = c.beat.cost, p = (c.prev && c.prev.cost) || b, u = c.u;
    el('rect', { x: x - 16, y: y - 8, width: 316, height: 300, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x, y + 16, '비용 (naive = 100, 가정)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    KEYS.forEach(([k, nm], i) => { const v = tween(p[k].value, b[k].value, u), st = b[k].state, col = st === 'crit' ? BAD : st === 'warn' ? WARN : st === 'good' ? GOOD : OFF, yy = y + 40 + i * 48;
      tx(x, yy + 13, nm, { 'font-size': 14, 'font-weight': 600 });
      hbar(x + 110, yy, 130, v, 70, { col, text: String(Math.round(v)), h: 18 }); });
    const tot = tween(c.prev ? c.prev.totalPct : 0, c.beat.totalPct, u), lat = tween(c.prev ? c.prev.latencyMs : 0, c.beat.latencyMs, u);
    el('line', { x1: x, y1: y + 236, x2: x + 284, y2: y + 236, stroke: GRID });
    tx(x, y + 266, '합계', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(x + 46, y + 268, Math.round(tot) + '%', { 'font-size': 22, 'font-weight': 800, fill: tot > 70 ? BAD : tot > 40 ? WARN : GOOD });
    tx(x + 150, y + 266, 'latency', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(x + 210, y + 268, (lat / 1000).toFixed(lat < 1000 ? 2 : 1) + 's', { 'font-size': 20, 'font-weight': 800 }); }
  const Q = (x, y, s, o) => card(x, y, tw(s, 14) + 26, 34, Object.assign({ rx: 17, stroke: ACC, sw: 2, text: s, fs: 14 }, o || {}));

  // ---------- 1. Naive ----------
  function s1(t, c) { const { k, u } = c; costs(c);
    kg({ dx: 20, lit: k === 2 ? (i) => i <= Math.floor(E(u, 0.2, 1.6) * 12) : k >= 3 ? () => true : null });
    if (k === 0) { card(200, 365, 150, 40, { rx: 8, stroke: BAD, sw: 2, text: 'gpt-4o', fs: 15, mono: true, s: pop(u, 0.3) }); card(400, 365, 190, 40, { rx: 8, stroke: INFO, sw: 2, text: 'embedding-3-large', fs: 13.5, mono: true, s: pop(u, 0.6) });
      tx(300, 410, '선언만 했다 · 아직 비용 0', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1) }); return; }
    if (k === 1) { Q(200, 360, '질문', { s: pop(u, 0.2) }); grow(240, 360, 300, 360, seg(u, 0.5, 0.9), INFO);
      cells(310, 342, ['0.1', '-0.3', '…', '0.7'], { w: 52, h: 36, fs: 13.5, style: () => ({ stroke: INFO, op: fade(u, 0.9) }) });
      tx(300, 410, '같은 질문이어도 매번 embed_query', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, opacity: fade(u, 1.4), 'font-weight': 700 }); return; }
    if (k === 2) { tx(220, 360, 'traverse_all · 노드 전부 코사인 계산', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      mono(220, 390, Math.floor(E(u, 0.2, 1.6) * 12) + ' / 12 노드', { 'font-size': 14.5, fill: WARN, 'text-anchor': 'middle' }); return; }
    if (k === 3) { dot([[230, 180], [230, 330]], seg(u, 0.2, 0.9), WARN, 7); card(230, 365, 200, 48, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, text: 'gpt-4o 에 통째로', fs: 15, s: pop(u, 0.8) });
      tx(470, 365, 'LLM 0 → 70', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) }); return; }
    // k4: 1000 질의 = 1000번
    for (let i = 0; i < 100; i++) { const x = 40 + (i % 25) * 16, y = 336 + Math.floor(i / 25) * 15, s = clamp(E(u, 0.2, 1.8) * 100 - i); if (s > 0) el('rect', { x, y, width: 13, height: 12, rx: 2, fill: BAD, opacity: 0.75 * s }); }
    tx(450, 350, '한 칸 = 10 질의', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1) }); mono(450, 376, '1000 × LLM', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); mono(450, 398, '+ embed + traverse', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }

  // ---------- 2. Redis 결과 캐시 ----------
  function s2(t, c) { const { k, u } = c; costs(c);
    R.redisBox(130, 120, { sub: 'qa:* · TTL 24h', s: k === 0 ? pop(u, 0.3) : 1 });
    kg({ dx: 240, dy: 20, lit: k >= 3 ? (i) => i % 3 === 0 : null });
    if (k === 1) { [['"  스콜세지 영화는? "', 'qa:dbce129f98936677'], ['"스콜세지 영화는?"', 'qa:dbce129f98936677']].forEach(([q, key], i) => {
        const y = 250 + i * 70; tx(40, y, q, { 'font-size': 14.5, opacity: fade(u, 0.2 + i * 0.4) }); grow(40, y + 12, 70, y + 30, seg(u, 0.6 + i * 0.4, 0.9 + i * 0.4), MUT, { plain: true });
        mono(80, y + 36, key, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0 + i * 0.4) }); });
      tx(300, 410, '공백·대소문자만 다르면 같은 키 (sha256 앞 16자)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k >= 2) { // 질의 10개 중 3개는 hit
      Q(52, 318, 'Q', {});
      for (let i = 0; i < 10; i++) { const hit = [0, 4, 7].includes(i), ph = ((t * 0.5 + i / 10) % 1);
        if (k === 2 && !hit) continue;
        if (hit) dot([[40, 300], [130, 160], [40, 140]], ph, GOOD, 6); else dot([[40, 300], [380, 220]], ph, WARN, 6); }
      pill(130, 205, 'hit 30% · ~1ms', GOOD, k === 2 ? pop(u, 0.5) : 1, { fs: 14 });
      if (k >= 3) pill(400, 380, 'miss 70% → GraphRAG → setex 24h', WARN, k === 3 ? pop(u, 0.4) : 1, { fs: 13.5 });
      if (k === 4) banner(320, 30, '100 → 80 · 4.2s → 2.9s', pop(u, 0.4)); } }

  // ---------- 3. 노드 임베딩 미리 계산 ----------
  function s3(t, c) { const { k, u } = c; costs(c);
    const vecAll = (i) => (k === 1 ? fade(u, 0.3 + 0.08 * i) : 1);
    kg({ dx: 20, vec: k === 0 ? null : vecAll, lit: k === 4 || k === 5 ? (i) => [2, 4, 6, 9, 10].includes(i) : null, col: ACC, fill: ACCBG });
    if (k === 0) { tx(230, 360, 'build_index · 인덱싱 때 한 번만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(230, 390, 'texts = [n.text for n in graph.nodes]', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); return; }
    if (k === 1) { tx(230, 360, 'embed_documents · 12개를 한 호출로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
      mono(230, 390, '호출 수 N → 1', { 'font-size': 15, fill: INFO, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.4) }); return; }
    if (k === 2 || k === 3) { const fx = 470, fy = 340; el('path', { d: `M${fx},${fy - 30} h70 l20,20 v60 h-90 z`, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: k === 2 ? fade(u, 0.8) : 1 });
      mono(fx + 45, fy + 15, '.pkl', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 2 ? fade(u, 1) : 1 }); mono(fx + 45, fy + 70, 'graph_index.pkl', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      if (k === 2) dot([[230, 200], [fx + 40, fy]], seg(u, 0.3, 1.0), INFO, 7);
      if (k === 3) { dot([[fx + 40, fy], [230, 200]], seg(u, 0.2, 1.0), INFO, 7); tx(230, 380, 'load_index · 노드 재임베딩 0회', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1) }); }
      return; }
    if (k === 4) { Q(150, 360, '질문만 임베딩', { s: pop(u, 0.2) }); tx(400, 365, '저장된 n.vec 과 내적 → top-5', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) }); return; }
    banner(300, 380, '인덱싱 1회 · 질의 N회는 노드 임베딩 0', pop(u, 0.4)); }

  // ---------- 4. 작은 모델로 라우팅 ----------
  function s4(t, c) { const { k, u } = c; costs(c);
    const mx = 200, my = 120;
    card(mx, my, 170, 50, { rx: 10, stroke: GOOD, sw: 2.5, fill: GOODBG, text: 'gpt-4o-mini', fs: 15, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    card(470, 300, 150, 50, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, text: 'gpt-4o', fs: 15, mono: true, s: k === 0 ? pop(u, 0.6) : 1 });
    if (k === 0) { tx(200, 170, 'router · 싸고 빠름', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) }); tx(470, 350, 'main · 비싸고 정확', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) }); return; }
    if (k === 1) { el('rect', { x: 330, y: 70, width: 260, height: 96, rx: 8, fill: INK, opacity: fade(u, 0.2) });
      ['class RouteDecision:', '  kind: str', '  answer: str'].forEach((l, i) => mono(346, 98 + i * 24, l, { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.4 + i * 0.3) }));
      tx(460, 200, 'answer 칸이 있어 mini 가 답까지 낸다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); return; }
    Q(60, 260, 'Q', {});
    grow(80, 245, mx - 60, my + 25, seg(u, 0.1, 0.5) * (k === 2 ? 1 : 0) + (k > 2 ? 1 : 0), GOOD);
    if (k === 2) tx(200, 200, 'context[:500] 만 보내 분류', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
    if (k >= 3) { for (let i = 0; i < 10; i++) { const simple = i < 8, ph = ((t * 0.45 + i / 10) % 1);
        if (simple) dot([[mx, my + 25], [mx, 250], [mx - 80, 330]], ph, GOOD, 6); else if (k >= 4) dot([[mx + 60, my + 20], [470, 275]], ph, BAD, 6); }
      card(mx - 80, 350, 120, 34, { rx: 17, stroke: GOOD, sw: 2, text: 'simple 80%', fs: 14, color: GOOD, s: k === 3 ? pop(u, 0.4) : 1 });
      if (k === 3) tx(310, 260, 'mini 가 바로 답 · 큰 모델 0회', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1) });
      if (k >= 4) card(470, 380, 150, 30, { rx: 15, stroke: BAD, sw: 2, text: 'complex 20%', fs: 14, color: BAD, s: k === 4 ? pop(u, 0.4) : 1 }); }
    if (k === 5) banner(320, 30, '58 → 20 · 1.8s → 0.95s', pop(u, 0.4)); }

  // ---------- 5. 누적 비교 ----------
  const STAGES = [['naive', 100, 4.2], ['+ 결과 캐시', 80, 2.9], ['+ 임베딩 캐시', 58, 1.8], ['+ 라우팅', 20, 0.95]];
  function s5(t, c) { const { k, u } = c; const shown = Math.min(k + 1, 4), x0 = 80, W = 120, base = 360, H = 260;
    tx(x0, 56, '같은 워크로드 · 1000 질의 + 인덱싱 (가정 모델)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    el('line', { x1: x0 - 10, y1: base, x2: x0 + 4 * (W + 30), y2: base, stroke: MUT, 'stroke-width': 1.8 });
    STAGES.forEach(([nm, v, lat], i) => { if (i >= shown) return; const now = i === shown - 1 && k < 4, g = now ? E(u, 0.2, 1.2) : 1, h = H * v / 100 * g, x = x0 + i * (W + 30);
      el('rect', { x, y: base - h, width: W, height: h, rx: 6, fill: i === 0 ? BAD : i === 3 ? GOOD : WARN, opacity: 0.85 });
      mono(x + W / 2, base - h - 10, v + '%', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: now ? fade(u, 1) : 1 });
      tx(x + W / 2, base + 24, nm, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); mono(x + W / 2, base + 46, lat + 's', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      if (i && (i < shown - 1 || !now || u > 1.2)) { const px = x0 + (i - 1) * (W + 30) + W, ph = H * STAGES[i - 1][1] / 100; el('line', { x1: px, y1: base - ph, x2: x, y2: base - ph, stroke: MUT, 'stroke-dasharray': '4 4' }); } });
    const x1 = 720;
    if (k === 0) { tx(x1, 160, '출발점', { 'font-size': 16, 'font-weight': 800 }); tx(x1, 188, 'mini 단가 = gpt-4o 의 1/30 가정', { 'font-size': 14, fill: MUT }); tx(x1, 210, '(2024-05 단가, 지금은 약 1/17)', { 'font-size': 13.5, fill: MUT }); }
    if (k === 1) { tx(x1, 160, '같은 질문은 LLM 을 안 부른다', { 'font-size': 15, 'font-weight': 700 }); mono(x1, 190, 'hit 30%', { 'font-size': 16, fill: GOOD, 'font-weight': 800 }); }
    if (k === 2) { tx(x1, 160, '노드 임베딩을 한 번만', { 'font-size': 15, 'font-weight': 700 }); tx(x1, 188, '남은 큰 덩어리는 LLM 호출', { 'font-size': 14, fill: MUT }); }
    if (k === 3) { tx(x1, 160, '단순 질문 80% 는 mini 가 끝낸다', { 'font-size': 15, 'font-weight': 700 }); tx(x1, 188, '현재 단가(1/17)로 셈하면 21%', { 'font-size': 14, fill: MUT }); }
    if (k === 4) { R.meters(700, 120, 230, [{ name: '1000 질의 비용 (가정)', val: '$200', good: true }]); tx(x1, 240, '비싼 호출을 줄이고', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) }); tx(x1, 264, '나머지는 캐시·작은 모델로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9) }); } }

  const quiz = [
    { q: 'naive 구현에서 같은 질문이 1000번 들어오면 gpt-4o는 몇 번 호출되는가?',
      o: ['1번', '1000번', '300번'], a: 1,
      why: '캐시도 분류도 없어서 질의 하나마다 임베딩, 전체 탐색, gpt-4o 호출이 한 번씩 일어난다. 이 상태가 100% 기준이다.' },
    { q: 'cache_key에서 같은 키가 나오는 두 질문은 어느 쌍인가?',
      o: ['"스콜세지 영화는?" 와 "  스콜세지 영화는? "', '"스콜세지 영화는?" 와 "스콜세지 작품은?"', '"Who founded Pixar?" 와 "Pixar founder?"'], a: 0,
      why: 'strip()과 lower() 뒤 sha256을 하므로 공백·대소문자만 다른 질문만 같은 키 qa:dbce129f98936677이 된다. 표현이 바뀌면 다른 키다.' },
    { q: '임베딩 캐시 단계에서 질의 때 남는 임베딩 호출은 무엇인가?',
      o: ['모든 노드 임베딩', '질문 하나의 임베딩', '아무것도 없다'], a: 1,
      why: '노드 벡터는 build_index 때 한 번 만들어 graph_index.pkl로 저장한다. 질의 때는 질문만 embed_query 한다.' },
    { q: '라우터가 simple_fact로 분류한 질문은 어떻게 끝나는가?',
      o: ['gpt-4o가 다시 답을 만든다', 'Redis에 저장만 하고 끝난다', 'mini가 분류하며 만든 answer를 그대로 돌려준다'], a: 2,
      why: 'RouteDecision에 answer 칸이 있어 mini 한 번으로 끝난다. 큰 모델은 남은 20% 에서만 부른다.' },
    { q: '세 기법을 차례로 붙였을 때 가정 모델의 총비용 흐름으로 맞는 것은 무엇인가?',
      o: ['100 → 80 → 58 → 20', '100 → 70 → 50 → 30', '100 → 58 → 80 → 20'], a: 0,
      why: '결과 캐시로 80, 노드 임베딩 캐시로 58, mini 라우팅으로 20이 된다. latency는 4.2s에서 0.95s로 준다.' },
  ];

  const summary = [
    '캐시 없는 GraphRAG는 같은 질문에도 매번 임베딩, 전체 탐색, 큰 모델 호출을 되풀이한다.',
    '질문을 정규화해 해시 키로 Redis에 답을 두면 hit 30%만으로 비용이 100에서 80이 된다.',
    '노드 임베딩을 인덱싱 때 한 번 만들어 저장하면 질의 때는 질문만 임베딩해 58까지 내려간다.',
    'mini가 먼저 분류하고 단순 질문 80%를 끝내면 큰 모델 호출이 줄어 가정 모델에서 20%가 된다.',
  ];
  const review = [
    { q: '결과 캐시를 붙였는데 hit가 거의 0이다. 질문 로그를 보니 같은 뜻을 다르게 묻는 경우가 많았다. 먼저 의심할 것은?',
      o: ['키가 글자 기준이라 표현이 다르면 다른 키다', 'TTL 24h가 길어 오래된 답이 남는다', 'Redis 응답이 느려 hit로 안 잡힌다'], a: 0,
      why: 'sha256 키는 글자가 하나만 달라도 바뀐다. 뜻이 같은 질문을 묶으려면 임베딩 유사도 기반 캐시 같은 다른 방법이 필요하다.' },
    { q: '그래프 노드가 매일 바뀌는 서비스에서 graph_index.pkl를 한 번만 만들어 두었다. 생길 문제는?',
      o: ['질의 비용이 다시 100으로 오른다', '새 노드에는 벡터가 없어 검색에서 빠진다', 'mini 라우팅이 멈춘다'], a: 1,
      why: '미리 계산한 임베딩은 인덱싱 때의 노드만 담는다. 바뀐 노드는 다시 임베딩해 저장해야 한다.' },
    { q: '라우팅 뒤 복잡한 질문의 품질이 떨어졌다는 불만이 나왔다. 먼저 볼 곳은?',
      o: ['노드 임베딩 차원', 'Redis TTL 길이', 'mini가 복잡한 질문을 단순으로 분류한 비율'], a: 2,
      why: '잘못 simple로 분류되면 mini의 답이 그대로 나간다. 분류 정확도를 표본으로 확인하는 것이 먼저다.' },
  ];

  R.page({ title: 'GraphRAG 비용 계산', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
