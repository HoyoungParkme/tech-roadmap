/* I-2-1 GraphRAG가 빛나는 시나리오 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 환승 노선 그래프(역 4 · 구간 3), 의료 · 금융 그래프를 그린다.
 * 홉 수(강남→해운대 3홉, 고혈압→약 B 2홉, TX-991→ring-77 2홉)는 코드의 그래프를 networkx 로 다시 만들어 확인했다.
 * LLM 응답 문장은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그래프 부품 ----------
  const NW = (n) => tw(n.label, 15) + 30;
  function gnode(n, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1; if (s <= 0) return; const w = NW(n), hot = o.hot, warn = o.warn;
    const st = warn ? { stroke: BAD, fill: BADBG, color: BAD } : hot ? { stroke: ACC, fill: ACCBG, color: ACC } : { stroke: INK, fill: PANEL, color: INK };
    card(n.x, n.y, w, 36, { rx: 18, text: n.label, fs: 15, fw: 800, ...st, sw: hot || warn ? 2.6 : 2, s, op });
    if (n.type && o.type !== false) mono(n.x, n.y - 26, n.type + (n.prop ? ' {' + n.prop + '}' : ''), { 'font-size': 13.5, 'text-anchor': 'middle', fill: n.prop ? INFO : MUT, opacity: op * clamp(s) }); }
  function clip(a, b) { const w = NW(a) / 2 + 3, h = 21, dx = b.x - a.x, dy = b.y - a.y, t = Math.min(dx ? w / Math.abs(dx) : 1e9, dy ? h / Math.abs(dy) : 1e9); return [a.x + dx * t, a.y + dy * t]; }
  function gedge(a, b, rel, u, o) { o = o || {}; if (u <= 0) return; const [x1, y1] = clip(a, b), [x2, y2] = clip(b, a), col = o.col || MUT, op = o.op ?? 1;
    grow(x1, y1, x2, y2, u, col, { sw: o.sw || 2.4, dash: o.dash, op });
    if (rel) { const lo = clamp((u - 0.75) / 0.25) * op, mx = (x1 + x2) / 2 + (o.lx || 0), my = (y1 + y2) / 2 + (o.ly || 0), w = tw(rel, 13.5) + 12;
      el('rect', { x: mx - w / 2, y: my - 11, width: w, height: 21, rx: 4, fill: PANEL, opacity: lo });
      mono(mx, my + 5, rel, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: o.lcol || (col === MUT ? INK : col), opacity: lo }); } }
  const ring = (n, r, col, op) => el('circle', { cx: n.x, cy: n.y, r, fill: 'none', stroke: col, 'stroke-width': 2, opacity: op });

  // ---------- 환승 노선 그래프 ----------
  const ST = { gangnam: { x: 110, y: 210, label: '강남', line: 'line: 지하철 2호선' }, seoul: { x: 300, y: 120, label: '서울역', line: 'line: 환승역' },
    busan: { x: 650, y: 300, label: '부산역', line: 'line: 환승역' }, haeundae: { x: 860, y: 300, label: '해운대', line: 'line: 버스 종점' } };
  const ROUTE = ['gangnam', 'seoul', 'busan', 'haeundae'];
  const LEG = [['gangnam', 'seoul', 'subway · 2·4호선', INFO], ['seoul', 'busan', 'ktx · 경부선', ACC], ['busan', 'haeundae', 'bus · 1003', WARN]];
  function station(id, o) { o = o || {}; const n = { ...ST[id], type: ':Station' }; gnode(n, o);
    if (o.prop) mono(n.x, n.y + 40, n.line, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: (o.op ?? 1) * clamp(o.s ?? 1) }); }
  function legs(u, o) { o = o || {}; LEG.forEach(([a, b, rel, col], i) => { const g = typeof u === 'function' ? u(i) : u;
    gedge(ST[a], ST[b], o.labels === false ? null : rel, g, { col: o.grey ? MUT : col, sw: o.lit && o.lit(i) ? 3.6 : 2.6, op: o.grey ? 0.5 : 1, ly: i === 0 ? -22 : i === 1 ? -18 : -20, lx: i === 0 ? -18 : 0 }); }); }

  // ---------- 1. 환승 그래프 만들기 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { ROUTE.forEach((id, i) => { const n = ST[id]; el('rect', { x: n.x - 40, y: n.y - 18, width: 80, height: 36, rx: 18, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 0.2 + i * 0.2) }); });
      LEG.forEach(([a, b], i) => { const p = ST[a], q = ST[b]; el('line', { x1: p.x + 42, y1: p.y, x2: lerp(p.x + 42, q.x - 42, E(u, 1.0 + i * 0.3, 1.6 + i * 0.3)), y2: lerp(p.y, q.y, E(u, 1.0 + i * 0.3, 1.6 + i * 0.3)), stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); });
      card(700, 90, 300, 56, { rx: 10, text: '노선도 설계\n역 4개 · 구간 3개', fs: 15, s: pop(u, 1.9), stroke: GRID }); return; }
    ROUTE.forEach((id, i) => { const at = i < 2 ? 1 : 2; if (k < at) return; station(id, { s: k === at ? pop(u, 0.3 + (i % 2) * 0.4) : 1, prop: true, hot: k >= 4 && (id === 'gangnam' || id === 'haeundae'), op: k >= 4 && (id === 'seoul' || id === 'busan') ? 0.55 : 1 }); });
    if (k === 2) { sub(480, 220, '역 4개 준비, 아직 서로 이어져 있지 않다', fade(u, 1.4), { 'font-size': 15, fill: INK }); return; }
    if (k <= 1) return;
    legs((i) => (k === 3 ? E(u, 0.3 + i * 0.5, 1.0 + i * 0.5) : 1), { grey: k >= 4 });
    if (k === 3) { mono(720, 60, 'CONNECTS × 3', { 'font-size': 18, 'font-weight': 800, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    // 직항 조회
    const a = ST.gangnam, b = ST.haeundae, g = k === 4 ? E(u, 0.3, 1.5) : 1;
    const pts = []; for (let i = 0; i <= 30 * g; i++) { const f = i / 30; pts.push([lerp(a.x, b.x, f), lerp(a.y - 30, b.y - 30, f) - Math.sin(f * Math.PI) * 170]); }
    if (pts.length > 1) el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: k === 5 ? BAD : ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 6' });
    mono(480, 34, '(강남)-[:CONNECTS]->(해운대) ?', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 5 ? BAD : ACC, opacity: k === 4 ? fade(u, 0.6) : 1 });
    if (k === 5) { cross(485, 55, 14, pop(u, 0.3)); pill(480, 390, '결과 0 row · 직항 없음', BAD, pop(u, 0.9), { fs: 15 });
      tx(820, 390, '답은 환승 경로에만 있다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.6) }); } }

  // ---------- 2. 텍스트 검색 흉내 ----------
  const CHUNKS = ['강남역 출구 안내', '강남 맛집 추천', '강남 부동산 시세', '강남 관련 청크'];
  function s2(t, c) { const { k, u } = c;
    ROUTE.forEach((id) => station(id, { hot: k >= 2 && id === 'gangnam', op: k >= 2 && id !== 'gangnam' ? 0.35 : 0.7 }));
    legs(1, { grey: true, labels: false });
    pill(700, 30, '강남에서 해운대까지 가려면?', ACC, k === 0 ? pop(u, 0.2) : 1, { fs: 15, fill: ACCBG });
    mono(700, 66, '비유: 텍스트 top-k 검색', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) return;
    CHUNKS.forEach((s, i) => { const x = 590 + (i % 2) * 210, y = 104 + Math.floor(i / 2) * 44, f = k === 1 ? pop(u, 0.2 + i * 0.25) : 1;
      card(x, y, 196, 34, { rx: 6, text: s, fs: 14.5, stroke: INFO, fill: INFOBG, sw: 1.5, s: f, op: k >= 2 ? 0.75 : 1 }); });
    if (k === 1) { card(695, 196, 330, 34, { rx: 6, text: '경로 전체가 담긴 청크', fs: 14.5, stroke: BAD, dash: '5 5', color: MUT, s: pop(u, 1.4) }); cross(870, 196, 9, pop(u, 1.8)); return; }
    mono(ST.gangnam.x + 10, 120, 'WHERE s.name', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.3) : 1 });
    mono(ST.gangnam.x + 10, 140, 'CONTAINS "강남"', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.5) : 1 });
    if (k === 2) { sub(480, 395, '이름이 맞는 노드 하나만 집는다. 연결은 보지 않는다', fade(u, 1.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { ['s.name', 's.line'].forEach((h, i) => { card(150 + i * 170, 330, 160, 32, { rx: 4, text: h, fs: 14.5, mono: true, fill: INFOBG, stroke: INFO, sw: 1.5, s: pop(u, 0.2) });
        card(150 + i * 170, 366, 160, 32, { rx: 4, text: ['"강남"', '"지하철 2호선"'][i], fs: 14.5, mono: true, stroke: GRID, s: pop(u, 0.6 + i * 0.2) }); });
      pill(470, 366, '1 row', INFO, pop(u, 1.2), { fs: 14, mono: true }); return; }
    card(480, 390, 470, 40, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 0.3), text: '"해운대 가는 법은 모르겠습니다"', fs: 15, fw: 700 });
    mono(770, 395, '예시 응답', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) }); }

  // ---------- 3. shortestPath 로 환승 경로 ----------
  function s3(t, c) { const { k, u } = c;
    const reach = k === 0 ? 0 : k === 1 ? Math.floor(E(u, 0.3, 2.2) * 3.999) : 3;   // 몇 홉까지 닿았나
    legs((i) => (k === 0 || i < reach ? 1 : 0), { lit: (i) => i < reach, grey: k === 0 });
    if (k >= 1) LEG.forEach(([a, b], i) => { if (i >= reach) gedge(ST[a], ST[b], null, 1, { col: MUT, op: 0.5 }); });
    ROUTE.forEach((id, i) => station(id, { hot: id === 'gangnam' || id === 'haeundae' || (k >= 1 && i <= reach), op: 1 }));
    if (k >= 1) ROUTE.forEach((id, i) => { if (i === 0 || i > reach) return; const n = ST[id];
      card(n.x + 46, n.y + 30, 34, 24, { rx: 12, text: String(i), fs: 13.5, mono: true, fill: ACC, stroke: 'none', color: PANEL, s: k === 1 ? pop(u, 0.3 + (i - 1) * 0.65 + 0.3) : 1 }); });
    if (k === 0) { pill(480, 34, 'shortestPath( (강남) -[:CONNECTS*1..5]- (해운대) )', ACC, pop(u, 0.3), { fs: 14.5, mono: true });
      sub(480, 395, '텍스트 대신 두 노드 사이의 경로를 따라간다', fade(u, 1.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { dot(ROUTE.map((id) => [ST[id].x, ST[id].y]), seg(u, 0.3, 2.3), ACC, 8);
      mono(480, 34, `hop ${reach} / 최대 5`, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); return; }
    // 경로에서 리스트 두 개
    const stops = ['강남', '서울역', '부산역', '해운대'], modes = ['subway', 'ktx', 'bus'];
    if (k <= 4) { mono(470, 52, 'stops =', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: INK, opacity: k === 2 ? fade(u, 0.3) : 1 });
      mono(470, 102, 'modes =', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: INK, opacity: k === 2 ? fade(u, 0.6) : 1 });
      if (k === 2) { mono(480, 395, '[n IN nodes(p) | n.name]  ·  [r IN relationships(p) | r.by]', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) }); }
      cells(484, 32, stops.map((s, i) => (k >= 3 ? s : '')), { w: 96, h: 32, gap: 4, mono: false, fs: 15, style: (i) => ({ stroke: k >= 3 ? ACC : GRID, fill: k >= 3 ? ACCBG : PANEL, s: k === 3 ? pop(u, 0.3 + i * 0.25) : 1 }) });
      cells(484, 82, modes.map((s) => (k >= 4 ? s : '')), { w: 96, h: 32, gap: 4, fs: 15, style: (i) => ({ stroke: k >= 4 ? LEG[i][3] : GRID, color: k >= 4 ? LEG[i][3] : INK, s: k === 4 ? pop(u, 0.3 + i * 0.25) : 1 }) });
      if (k === 3) ROUTE.forEach((id, i) => { const n = ST[id]; if (u < 0.3 + i * 0.25) fly(n.x, n.y, 532 + i * 100, 48, seg(u, i * 0.25, 0.3 + i * 0.25), stops[i]); });
      return; }
    card(330, 380, 500, 38, { rx: 8, stroke: ACC, fill: PANEL, sw: 1.8, text: '강남 → 서울역 → 부산역 → 해운대 (3홉)', fs: 15, fw: 700, s: k === 5 ? pop(u, 0.2) : 1, op: k === 6 ? 0.5 : 1 });
    if (k === 5) { grow(585, 380, 660, 380, E(u, 0.8, 1.1), ACC); card(720, 380, 100, 42, { rx: 10, text: 'LLM', fs: 16, fw: 800, s: pop(u, 1.1) }); return; }
    card(480, 60, 560, 44, { rx: 10, stroke: GOOD, fill: GOODBG, sw: 2, s: pop(u, 0.3), text: '지하철로 서울역, KTX로 부산역, 버스로 해운대', fs: 16, fw: 800 });
    mono(800, 96, '예시 응답 · 어느 문서에도 통째로 없던 답', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.7) }); }

  // ---------- 4. 의료 · 금융 · 법률 · R&D ----------
  const MED = { d: { x: 130, y: 210, label: '고혈압', type: ':Disease' }, s: { x: 360, y: 90, label: '두통', type: ':Symptom' },
    a: { x: 360, y: 320, label: '약 A', type: ':Drug', cls: 'class: ACE inhibitor' }, b: { x: 640, y: 320, label: '약 B', type: ':Drug', cls: 'class: NSAID' } };
  const DOMS = [
    { name: '의료', gist: '질병 · 증상 · 약물', n: [['고혈압', 50, 60], ['두통', 160, 25], ['약 A', 160, 95], ['약 B', 270, 60]], e: [[0, 1], [0, 2], [2, 3]] },
    { name: '법률', gist: '판례 · 법령 인용', n: [['판례 A', 50, 60], ['민법 §750', 180, 25], ['판례 B', 180, 95], ['민법 §751', 300, 60]], e: [[0, 1], [0, 2], [2, 3]] },
    { name: '금융', gist: '거래 · 계좌 · 사기탐지', n: [['계좌 A', 50, 60], ['거래 1', 160, 25], ['계좌 B', 270, 60], ['사기링', 270, 120]], e: [[0, 1], [1, 2], [2, 3]] },
    { name: 'R&D', gist: '논문 인용 계보', n: [['논문 A', 50, 60], ['논문 B', 170, 25], ['논문 C', 170, 95], ['논문 D', 290, 60]], e: [[1, 0], [2, 0], [3, 1]] },
  ];
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { DOMS.forEach((d, q) => { const ox = 20 + (q % 2) * 470, oy = 12 + Math.floor(q / 2) * 204, s = pop(u, 0.2 + q * 0.3);
        zone(ox, oy, 450, 192, d.name + ' · ' + d.gist, { fill: SOFT, op: clamp(s) });
        const P = d.n.map(([l, x, y]) => ({ x: ox + 30 + x * 1.15, y: oy + 52 + y * 1.0, label: l }));
        d.e.forEach(([a, b]) => gedge(P[a], P[b], null, E(u, 0.5 + q * 0.3, 1.1 + q * 0.3), { col: ACC }));
        P.forEach((p) => gnode(p, { s })); });
      return; }
    if (k === 4) { // 금융: 키워드 검색은 이름이 맞는 노드만
      const F = [{ x: 130, y: 220, label: '계좌 A' }, { x: 360, y: 220, label: '거래 TX-991' }, { x: 590, y: 220, label: '계좌 B' }, { x: 820, y: 220, label: 'ring-77' }];
      [[0, 1, 'SENDS'], [1, 2, 'TO'], [2, 3, 'FLAGGED']].forEach(([a, b, r]) => gedge(F[a], F[b], r, 1, { op: 0.5 }));
      F.forEach((n, i) => gnode(n, { hot: i === 1, op: i === 1 ? 1 : 0.45, warn: false }));
      pill(360, 120, '키워드 검색: "TX-991"', INFO, pop(u, 0.2), { fs: 15 });
      grow(360, 136, 360, 196, E(u, 0.5, 0.9), INFO);
      cross(820, 220, 22, pop(u, 1.3)); tx(820, 280, '두 홉 건너 사기링은 안 보인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      tx(480, 370, '의료처럼 금융도 다단계 점검이 필요하다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    const ns = ['d', 's', 'a', 'b'];
    if (k >= 1) [['d', 's', 'HAS_SYMPTOM'], ['d', 'a', 'TREATED_BY'], ['a', 'b', 'INTERACTS_WITH']].forEach(([a, b, r], i) => {
      const on = k >= 2 && (r !== 'HAS_SYMPTOM');
      gedge(MED[a], MED[b], r, k === 1 ? E(u, 0.3 + i * 0.5, 1.0 + i * 0.5) : 1, { col: on ? ACC : r === 'INTERACTS_WITH' ? BAD : MUT, sw: on ? 3.4 : 2.4, ly: r === 'INTERACTS_WITH' ? -24 : 0 }); });
    if (k === 1) mono(500, 270, '{severity: "high"}', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    ns.forEach((id, i) => { const s0 = k === 0 ? pop(u, 0.3 + i * 0.3) : 1; gnode(MED[id], { s: s0, hot: k >= 2 && id !== 's' });
      if (MED[id].cls) mono(MED[id].x, MED[id].y + 40, MED[id].cls, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: clamp(s0) }); });
    zone(700, 40, 245, 340, null, { fill: SOFT });
    card(822, 100, 225, 80, { rx: 8, stroke: GRID, fill: PANEL, text: '고혈압 환자가 약 A 복용 중\n두통에 약 B 같이 먹어도\n되나?', fs: 14, fw: 600, s: k === 0 ? pop(u, 1.6) : 1 });
    if (k === 2) { dot([[MED.d.x, MED.d.y], [MED.a.x, MED.a.y], [MED.b.x, MED.b.y]], seg(u, 0.3, 1.9), ACC, 8);
      mono(822, 190, '2홉 경로', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) }); }
    if (k >= 3) { ['a.name', 'b.name', 'warn'].forEach((h, i) => { card(822, 170 + i * 56, 210, 48, { rx: 6, stroke: i === 2 ? BAD : GRID, fill: i === 2 ? BADBG : PANEL, sw: 1.6, s: pop(u, 0.3 + i * 0.3) });
        mono(732, 166 + i * 56, h, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) });
        tx(822, 184 + i * 56, ['약 A', '약 B', '병용 주의'][i], { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 2 ? BAD : INK, opacity: fade(u, 0.4 + i * 0.3) }); });
      mono(822, 362, '1 row', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); } }

  // ---------- 5. 금융 사기 탐지와 선택 기준 ----------
  function s5(t, c) { const { k, u } = c, top = k >= 4, y = top ? 70 : 220;
    const F = { a: { x: 120, y, label: '계좌 A-001', type: ':Account' }, t: { x: 340, y, label: 'TX-991', type: ':Transaction', prop: 'amount: 9,900,000' },
      b: { x: 620, y, label: '계좌 B-002', type: ':Account', prop: 'flag: suspicious' }, r: { x: 840, y, label: 'ring-77', type: ':FraudRing' } };
    if (k >= 1) [['a', 't', 'SENDS'], ['t', 'b', 'TO'], ['b', 'r', 'FLAGGED']].forEach(([p, q, rel], i) => {
      const lit = k === 2 ? (i === 0 || i === 1 ? seg(u, 0.4, 0.5) > 0 : seg(u, 1.3, 1.4) > 0) : k === 3 && i > 0;
      gedge(F[p], F[q], rel, k === 1 ? E(u, 0.3 + i * 0.4, 0.9 + i * 0.4) : 1, { col: lit ? ACC : MUT, sw: lit ? 3.4 : 2.4 }); });
    ['a', 't', 'b'].forEach((id, i) => gnode(F[id], { s: k === 0 ? pop(u, 0.3 + i * 0.35) : 1, hot: id === 't' && k >= 2, warn: id === 'b' && k < 2 && u > 1.4 }));
    if (k >= 1) gnode(F.r, { s: k === 1 ? pop(u, 1.4) : 1, warn: true });
    if (k === 0) { tx(480, 330, '계좌 둘과 거래 하나. B에는 이미 의심 표시가 있다', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.6) }); return; }
    if (k === 1) return;
    if (k === 2) { const r1 = E(u, 0.3, 1.0), r2 = E(u, 1.2, 1.9);
      [F.a, F.b].forEach((n) => ring(n, 30 + 30 * r1, ACC, 0.7 * (1 - r1 * 0.5)));
      ring(F.r, 30 + 30 * r2, BAD, 0.7 * (1 - r2 * 0.5));
      mono(480, 330, 'MATCH p = (t)-[*1..3]-(f:FraudRing)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.2) });
      pill(F.a.x, y + 60, 'hop 1', ACC, pop(u, 0.8), { fs: 13.5, mono: true }); pill(F.b.x, y + 60, 'hop 1', ACC, pop(u, 0.8), { fs: 13.5, mono: true }); pill(F.r.x, y + 60, 'hop 2', BAD, pop(u, 1.8), { fs: 13.5, mono: true }); return; }
    if (k === 3) { banner(480, 330, 'hops = 2 · f.name = "ring-77"', pop(u, 0.3));
      tx(F.t.x, y + 64, '거래만 보면 정상', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
      tx(480, 390, '단순 검색으로는 못 잡는 관계 패턴', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    // 선택 기준 두 칸
    const L = [['GraphRAG 권장', ACC, ['멀티홉 추론 · 환승형 질문', '의료·법률처럼 누락 위험이 큰 곳', '인용·계보·네트워크 분석', '책 한 권 통째 요약']],
      ['RAG로 충분', INFO, ['단순 FAQ · 단발 질문', '자주 갱신되는 콘텐츠', '데이터셋이 작다', '비용·복잡도를 줄여야 한다']]];
    L.forEach(([h, col, items], j) => { const cx = 245 + j * 470, show = j === 0 || k === 5, s = j === 0 ? (k === 4 ? pop(u, 0.3) : 1) : pop(u, 0.3); if (!show) return;
      zone(cx - 220, 150, 440, 250, null, { fill: PANEL, stroke: col, op: clamp(s) });
      tx(cx, 182, h, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: clamp(s) });
      items.forEach((it, i) => { const f = (j === 0 && k === 4) || (j === 1 && k === 5) ? fade(u, 0.6 + i * 0.3) : 1;
        (j === 0 ? check : (x, yy, r, sc) => el('circle', { cx: x, cy: yy, r: 5, fill: INFO, opacity: sc }))(cx - 190, 222 + i * 46, 8, f);
        tx(cx - 170, 228 + i * 46, it, { 'font-size': 15.5, 'font-weight': 600, opacity: f }); }); });
  }

  const quiz = [
    { q: '강남에서 해운대로 바로 가는 CONNECTS 엣지를 MATCH로 찾으면 어떤 결과가 나오는가?',
      o: ['해운대 노드 1개', '빈 결과', '역 4개 전체'], a: 1,
      why: '구간 엣지는 강남과 서울역, 서울역과 부산역, 부산역과 해운대 사이에만 있다. 직항이 없으니 0 row다.' },
    { q: '"강남" 텍스트 검색이 환승 경로를 돌려주지 못하는 까닭은 무엇인가?',
      o: ['강남과 관련된 청크가 하나도 없어서', '검색 결과가 너무 많아 잘려서', '이름이 맞는 조각만 가져오고 연결은 따라가지 않아서'], a: 2,
      why: '출구, 맛집, 부동산처럼 "강남"과 닮은 조각은 잔뜩 오지만 부산까지 가는 연결은 어느 조각에도 통째로 없다.' },
    { q: 'shortestPath가 찾은 강남에서 해운대까지의 경로는 몇 홉인가?',
      o: ['3홉', '2홉', '5홉'], a: 0,
      why: '서울역과 부산역을 거쳐 구간 세 개를 지난다. *1..5의 5는 탐색할 수 있는 최대 길이일 뿐이다.' },
    { q: '약 B를 같이 먹어도 되는지 판단하려면 의료 그래프에서 어떤 경로를 따라가야 하는가?',
      o: ['고혈압에서 두통으로', '약 B에서 두통으로', '고혈압에서 약 A를 거쳐 약 B로'], a: 2,
      why: 'TREATED_BY로 약 A에 닿고 INTERACTS_WITH로 약 B에 닿는 2홉 경로가 상호작용 경고를 만든다.' },
    { q: '다음 중 GraphRAG보다 RAG로 충분한 경우는 무엇인가?',
      o: ['자주 갱신되는 단순 FAQ', '2홉 건너 사기링과 이어진 거래 탐지', '판례가 인용한 법령 추적'], a: 0,
      why: '단발 질문이고 내용이 자주 바뀌면 그래프를 만들고 유지하는 비용이 효과보다 크다.' },
  ];

  const summary = [
    '강남에서 해운대로 가는 직항 엣지는 없고, 답은 서울역과 부산역을 거치는 3홉 경로에 있다.',
    '텍스트 검색은 "강남"과 닮은 조각만 가져와서 역 사이 연결을 따라가지 못한다.',
    'shortestPath는 노선 그래프를 따라가 역 이름과 이동 수단이 담긴 경로를 돌려준다.',
    '의료, 법률, 금융, R&D처럼 답이 관계의 연쇄에 있고 누락이 위험한 곳에서 GraphRAG가 값을 한다.',
  ];
  const review = [
    { q: '보험사 챗봇에 "이 고객의 가족 중 같은 설계사에게 가입한 사람은?"을 물었더니 고객 정보 문서만 돌아왔다. 알맞은 해석은?',
      o: ['답이 고객, 가족, 설계사로 이어지는 관계의 연쇄에 있다', '고객 정보 문서가 너무 길다', '임베딩 모델이 한국어를 읽지 못한다'], a: 0,
      why: '환승 경로처럼 여러 엔티티를 건너야 하는 질문이다. 한 문서와 닮은 조각을 찾는 검색으로는 연결이 나오지 않는다.' },
    { q: '거래 TX-991은 금액과 계좌만 보면 정상이다. 그래프에서 확인할 것으로 알맞은 것은?',
      o: ['금액이 평균보다 큰지', '계좌 A의 개설일', '몇 홉 안에 사기링 노드와 이어지는지'], a: 2,
      why: 'ring-77은 거래에서 2홉 떨어져 있다. 경로 길이를 묻는 질의라야 이런 관계 패턴이 드러난다.' },
    { q: '매일 바뀌는 사내 공지로 Q&A 봇을 만든다. 질문은 대부분 "이번 주 행사는?" 같은 단발이다. 알맞은 선택은?',
      o: ['처음부터 GraphRAG로 만든다', 'RAG로 시작한다', '질문마다 그래프를 새로 만든다'], a: 1,
      why: '단발 질문이고 내용이 자주 갱신되는 경우다. 선택 기준표에서 RAG로 충분한 쪽에 해당한다.' },
  ];

  R.page({ title: '환승 경로와 도메인 그래프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
