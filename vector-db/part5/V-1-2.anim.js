/* V-1-2 의사결정 플로우차트 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 왼쪽 작은 지도는 각 beat 의 activeNodes · activeEdges · resultId · question · answer 를 읽는다.
 * FAISS 장면의 nprobe 곡선은 faiss.py 를 축소해(10만 개 · 768차원 · nlist 1024, 12차원 잠재 구조 합성 데이터) faiss-cpu 1.16.0 1스레드로 실제 잰 값.
 * 규모별 크기(768차원 float32 = 3,072바이트)와 Pinecone 예시 점수(상수 벡터라 코사인 1.000)도 계산으로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, dbIcon, axes, line, scatter, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 왼쪽 작은 지도 ----------
  const QX = 250, RX = 78;
  const N = {
    start: { x: QX, y: 34, t: 's', s: '시작' },
    q1: { x: QX, y: 98, t: 'q', s: '데이터 규모?' }, q2: { x: QX, y: 162, t: 'q', s: '기존 RDB?' }, q3: { x: QX, y: 226, t: 'q', s: '단일 앱?' },
    q4: { x: QX, y: 290, t: 'q', s: 'PoC · 연구?' }, q5: { x: QX, y: 354, t: 'q', s: '엔터프라이즈?' },
    r_pg: { x: RX, y: 162, t: 'r', s: 'pgvector', c: INFO }, r_chr: { x: RX, y: 226, t: 'r', s: 'Chroma', c: ACC },
    r_faiss: { x: RX, y: 290, t: 'r', s: 'FAISS', c: WARN }, r_mng: { x: RX, y: 354, t: 'r', s: '관리형', c: BAD },
  };
  const ED = [['start', 'q1'], ['q1', 'q2'], ['q2', 'r_pg', 'YES'], ['q2', 'q3', 'NO'], ['q3', 'r_chr', 'YES'], ['q3', 'q4', 'NO'], ['q4', 'r_faiss', 'YES'], ['q4', 'q5', 'NO'], ['q5', 'r_mng', 'YES']];
  const ends = (a, b) => { const A = N[a], B = N[b]; if (B.x < A.x) return [A.x - 78, A.y, B.x + 52, B.y]; return [A.x, A.y + (A.t === 's' ? 16 : 24), B.x, B.y - 24]; };
  function minimap(c, o) { o = o || {}; const b = c.beat, p = c.prev, act = new Set(b.activeNodes), ae = new Set(b.activeEdges), pe = new Set(p ? p.activeEdges : []), u = c.u;
    ED.forEach(([a, bb, lab]) => { const [x1, y1, x2, y2] = ends(a, bb), key = a + '-' + bb, on = ae.has(key), fresh = on && !pe.has(key) && c.k > 0 ? E(u, 0.2, 0.9) : on ? 1 : 0;
      el('line', { x1, y1, x2, y2, stroke: GRID, 'stroke-width': 1.6 });
      if (fresh > 0) el('line', { x1, y1, x2: lerp(x1, x2, fresh), y2: lerp(y1, y2, fresh), stroke: ACC, 'stroke-width': 3 });
      if (lab) tx(bb.startsWith('r') ? (x1 + x2) / 2 : x1 + 8, bb.startsWith('r') ? y1 - 6 : (y1 + y2) / 2 + 5, lab, { 'font-size': 13.5, 'font-weight': 700, fill: on ? ACC : OFF, 'text-anchor': bb.startsWith('r') ? 'middle' : 'start' }); });
    Object.keys(N).forEach((id) => { const n = N[id], on = act.has(id), res = b.resultId === id, isNew = on && !(p && p.activeNodes.includes(id)) && c.k > 0, s = isNew ? pop(u, 0.7) : 1;
      if (n.t === 's') card(n.x, n.y, 96, 30, { rx: 15, text: n.s, fs: 14, fill: on ? ACC : PANEL, stroke: ACC, color: on ? PANEL : ACC, s });
      else if (n.t === 'q') { const g = R.G(n.x, n.y, s); el('path', { d: 'M0,-24 L78,0 L0,24 L-78,0 Z', fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.4 : 1.6 }, g);
        tx(0, 5, n.s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: on ? INK : MUT }, g); }
      else card(n.x, n.y, 104, 38, { rx: 8, text: n.s, fs: 14.5, fill: res ? n.c : PANEL, stroke: on ? n.c : GRID, color: res ? PANEL : on ? n.c : MUT, sw: res ? 2.6 : 1.6, s }); });
    // 이번 beat 에 새로 열린 길을 따라 공이 내려간다
    const fresh = b.activeEdges.filter((e) => !pe.has(e)); if (c.k > 0 && fresh.length) { const [a, bb] = fresh[fresh.length - 1].split('-'), [x1, y1, x2, y2] = ends(a, bb); dot([[x1, y1], [x2, y2]], seg(u, 0.2, 0.9), ACC, 6); }
    el('line', { x1: 340, y1: 20, x2: 340, y2: 400, stroke: GRID, 'stroke-width': 1.5 }); }
  function qa(c, o) { o = o || {}; const b = c.beat, ok = b.answerType === 'success';
    tx(360, 30, b.question, { 'font-size': 15, 'font-weight': 800, fill: INK });
    const fresh = ok && !(c.prev && c.prev.answerType === 'success');
    tx(360, 406, b.answer, { 'font-size': 14, 'font-weight': 700, fill: ok ? GOOD : MUT, opacity: fresh ? fade(c.u, 1.6) : 1 }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 데이터 규모 ----------
  const LX = (n) => 380 + ((Math.log10(n) - 4) / 5) * 540;   // 1만 ~ 10억
  function s1(t, c) { const { k, u } = c; minimap(c); qa(c);
    if (k === 0) { for (let i = 0; i < 18; i++) { const ph = (t * 0.5 + i / 18) % 1; el('circle', { cx: 520 + ((i * 37) % 160), cy: 70 + ph * 190, r: 5, fill: INFO, opacity: 0.8 * (1 - ph * 0.6) }); }
      el('path', { d: 'M480,270 L500,350 H700 L720,270', fill: SOFT, stroke: INK, 'stroke-width': 2.4 });
      mono(600, 322, '? 개', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.6) });
      note(760, 200, '규모가', fade(u, 1.2)); note(760, 226, '후보를 먼저', fade(u, 1.4)); note(760, 252, '잘라낸다', fade(u, 1.6)); return; }
    if (k === 1) { const bands = [[1e4, 1e5, '소형', '모두 가능', GOOD], [1e5, 1e7, '중형', 'pgvector · Chroma', INFO], [1e7, 1e8, '대형', 'FAISS · Milvus', WARN], [1e8, 1e9, '초대형', '관리형 · 샤딩', BAD]];
      bands.forEach(([a, b2, n, cand, col], i) => { const g = E(u, 0.2 + i * 0.35, 0.8 + i * 0.35); if (g <= 0) return; const x0 = LX(a), w = (LX(b2) - x0) * g;
        el('rect', { x: x0, y: 150, width: w, height: 56, fill: col, opacity: 0.2 }); el('rect', { x: x0, y: 150, width: w, height: 56, fill: 'none', stroke: col, 'stroke-width': 2 });
        tx(x0 + 8, 172, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.6 + i * 0.35) }); tx(x0 + 8, 196, cand, { 'font-size': 13.5, fill: INK, opacity: fade(u, 0.6 + i * 0.35) }); });
      el('line', { x1: 380, y1: 230, x2: 920, y2: 230, stroke: MUT, 'stroke-width': 1.8 });
      [[1e4, '1만'], [1e5, '10만'], [1e6, '100만'], [1e7, '1000만'], [1e8, '1억'], [1e9, '10억']].forEach(([n, s]) => { el('line', { x1: LX(n), y1: 230, x2: LX(n), y2: 236, stroke: MUT }); mono(LX(n), 254, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      tx(380, 300, '768차원 float32 원본 크기 (벡터 1개 = 3,072바이트)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) });
      [[1e5, '0.3 GB'], [1e7, '30.7 GB'], [1e8, '307 GB']].forEach(([n, s], i) => { const op = fade(u, 2.0 + i * 0.15); el('line', { x1: LX(n), y1: 238, x2: LX(n), y2: 318, stroke: INFO, 'stroke-dasharray': '3 3', opacity: op }); mono(LX(n), 340, s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: op }); });
      return; }
    if (k === 2 || k === 3) { const L = [['1', '데이터 규모', '지금 단계', INK], ['2', '기존 RDB 사용 중?', 'YES → pgvector', INFO], ['3', '단일 앱?', 'YES → Chroma', ACC], ['4', 'PoC · 연구?', 'YES → FAISS', WARN], ['5', '엔터프라이즈?', 'YES → 관리형', BAD]];
      L.forEach(([n, q, r, col], i) => { const y = 80 + i * 56, s = k === 2 ? pop(u, 0.2 + i * 0.25) : 1;
        card(380, y, 34, 34, { rx: 17, text: n, fs: 15, fill: i === 0 ? ACC : PANEL, stroke: ACC, color: i === 0 ? PANEL : ACC, s });
        tx(410, y + 5, q, { 'font-size': 15, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.3 + i * 0.25) : 1 }); tx(640, y + 5, r, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: k === 2 ? fade(u, 0.4 + i * 0.25) : 1 }); });
      if (k === 3) { // 예: 2 NO, 3 NO, 4 YES → 멈춤
        const path = [[860, 136], [860, 192], [860, 248]], hit = E(u, 0.3, 2.0) * 3;
        ['NO', 'NO', 'YES'].forEach((s, i) => { const op = clamp(hit - i); if (op <= 0) return; pill(860, 136 + i * 56, s, i === 2 ? GOOD : MUT, op, { fs: 13.5 }); });
        if (hit >= 3) { el('rect', { x: 368, y: 226, width: 560, height: 44, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 2.4 }); }
        tx(640, 370, '위에서부터 처음 YES 에서 멈춘다', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.2) }); }
      return; }
    [['기존 인프라 재활용', '이미 있는 PG·팀 노하우를 먼저 쓴다'], ['과한 도구 배제', '10만 벡터에 샤딩 클러스터는 낭비'], ['운영 부담 최소화', '백업·모니터링을 새로 만들지 않는다']].forEach(([a, b], i) => { const y = 90 + i * 92, s = pop(u, 0.2 + i * 0.4);
      card(640, y, 540, 72, { rx: 12, stroke: ACC, sw: 2, s }); tx(390, y - 6, a, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.4) }); tx(390, y + 20, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.35 + i * 0.4) }); }); }

  // ---------- 2. pgvector ----------
  const ROWS = [['1', 'earbuds', '120', 'electronics'], ['2', 'mug', '15', 'kitchen'], ['3', 'monitor', '450', 'electronics'], ['4', 'laptop', '1200', 'electronics']];
  function pgTable(o) { o = o || {}; const x0 = 360, y0 = 70, cw = [36, 90, 58, 112], ec = o.emb ? 120 : 0, rh = 34;
    const cols = ['id', 'name', 'price', 'category'];
    let x = x0; cols.forEach((h, j) => { card(x + cw[j] / 2, y0, cw[j] - 2, 30, { rx: 4, text: h, fs: 13.5, mono: true, fill: INFOBG, stroke: INFO }); x += cw[j]; });
    if (ec) { const s = o.embS ?? 1; card(x + ec / 2, y0, ec - 2, 30, { rx: 4, text: 'embedding', fs: 13.5, mono: true, fill: ACC, stroke: ACC, color: PANEL, s }); }
    ROWS.forEach((r, i) => { const dim = o.dim ? o.dim(i) : 1, y = y0 + 34 + i * rh + (o.shift ? o.shift(i) : 0); let xx = x0;
      r.forEach((v, j) => { card(xx + cw[j] / 2, y, cw[j] - 2, rh - 4, { rx: 3, text: v, fs: 13.5, mono: true, stroke: GRID, sw: 1.2, op: dim }); xx += cw[j]; });
      if (ec) { const f = o.fill ? o.fill(i) : 0; card(xx + ec / 2, y, ec - 2, rh - 4, { rx: 3, text: f >= 1 ? '[0.02, …]' : 'NULL', fs: 13.5, mono: true, stroke: f >= 1 ? ACC : GRID, color: f >= 1 ? ACC : OFF, sw: 1.2, op: dim * (o.embS ?? 1) }); } });
    tx(x0, y0 + 34 + 4 * rh + 4, 'products (예시 행)', { 'font-size': 13.5, fill: MUT }); }
  function s2(t, c) { const { k, u } = c; minimap(c); qa(c);
    if (k === 0) { pgTable(); snippet(360, 270, ['CREATE EXTENSION IF NOT EXISTS vector;'], { op: fade(u, 0.3) });
      sub(640, 350, '새 DB 없이 기존 PostgreSQL 에 확장 한 줄', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { pgTable({ emb: true, embS: pop(u, 0.4) }); snippet(360, 270, ['ALTER TABLE products', '  ADD COLUMN embedding vector(1536);'], { op: fade(u, 0.2) });
      mono(900, 300, '1536 × 4B', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 1.4) }); mono(900, 326, '= 6,144B / 행', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { // HNSW 층 그래프
      const L0 = [[380, 330], [430, 300], [470, 345], [520, 310], [570, 340], [610, 300], [660, 335], [700, 305], [740, 345], [790, 312], [840, 338], [880, 302]], L1 = [1, 4, 7, 10], L2 = [4, 10];
      const lay = (ids, y0, op, col) => { for (let i = 0; i < ids.length - 1; i++) { const a = L0[ids[i]], b = L0[ids[i + 1]]; el('line', { x1: a[0], y1: y0 + a[1] - 320, x2: b[0], y2: y0 + b[1] - 320, stroke: col, 'stroke-width': 1.8, opacity: op }); }
        ids.forEach((i) => el('circle', { cx: L0[i][0], cy: y0 + L0[i][1] - 320, r: 6, fill: col, opacity: op })); };
      const all = L0.map((_, i) => i); lay(all, 320, fade(u, 0.2), INFO); for (let i = 0; i < 10; i++) { const a = L0[i], b = L0[i + 2]; el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: INFO, 'stroke-width': 1, opacity: 0.4 * fade(u, 0.5) }); }
      lay(L1, 220, fade(u, 0.8), ACC); lay(L2, 130, fade(u, 1.3), WARN);
      [['층 2', 130, WARN], ['층 1', 220, ACC], ['층 0 (전체)', 322, INFO]].forEach(([s, y, col], i) => tx(920, y + 5, s, { 'font-size': 13.5, 'text-anchor': 'end', 'font-weight': 700, fill: col, opacity: fade(u, 0.3 + (2 - i) * 0.5) }));
      [4, 10].forEach((i) => L1.includes(i) && el('line', { x1: L0[i][0], y1: 130 + L0[i][1] - 320, x2: L0[i][0], y2: 220 + L0[i][1] - 320, stroke: MUT, 'stroke-dasharray': '3 3', opacity: fade(u, 1.4) }));
      dot([[L0[10][0], 130 + L0[10][1] - 320], [L0[4][0], 130 + L0[4][1] - 320], [L0[4][0], 220 + L0[4][1] - 320], [L0[4][0], L0[4][1]], [L0[3][0], L0[3][1]]], seg(u, 1.5, 2.8), BAD, 6);
      mono(380, 80, 'USING hnsw (embedding vector_cosine_ops)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(380, 104, 'WITH (m = 16, ef_construction = 64)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      tx(380, 375, '위층에서 크게 건너뛰고 아래층에서 좁힌다', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { const f = (i) => clamp(E(u, 0.3, 2.2) * 4 - i); pgTable({ emb: true, fill: (i) => (f(i) >= 1 ? 1 : 0) });
      const i = Math.min(3, Math.floor(E(u, 0.3, 2.2) * 4)); if (u < 2.3) fly(640, 330, 860, 104 + i * 34, (E(u, 0.3, 2.2) * 4) % 1, '$1::vector', { mono: true });
      card(560, 330, 160, 40, { rx: 8, text: '앱 · 임베딩 API', fs: 14, stroke: MUT });
      tx(660, 380, 'DB 는 UPDATE 로 받아 저장만 한다', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); return; }
    if (k === 4) { const keep = [0, 2], out = (i) => !keep.includes(i);
      pgTable({ emb: true, fill: () => 1, dim: (i) => (out(i) ? 1 - 0.75 * E(u, 0.3, 1.0) : 1) });
      keep.forEach((i, r) => { card(805, 104 + i * 34, 30, 26, { rx: 13, text: String(r + 1), fs: 14, fill: ACC, stroke: ACC, color: PANEL, s: pop(u, 1.3 + r * 0.25) }); });
      tx(830, 82, '거리순', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      mono(360, 290, "WHERE category = 'electronics'", { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
      mono(360, 314, '  AND price BETWEEN 100 AND 500', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
      mono(360, 338, 'ORDER BY embedding <=> $1 LIMIT 10', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      tx(360, 368, '필터와 거리 정렬이 한 쿼리 안에서 (정렬 순서는 예시)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    const P = [['DBA 가 이미 안다', GOOD], ['새 DB · 백업 정책 불필요', GOOD], ['JOIN · WHERE · 트랜잭션', GOOD]], M = [['1억 벡터 이상', BAD], ['수평 샤딩 별도 설계', BAD]];
    tx(370, 74, '장점', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); tx(670, 74, '한계', { 'font-size': 16, 'font-weight': 800, fill: BAD });
    P.forEach(([s], i) => { check(382, 112 + i * 44, 8, pop(u, 0.3 + i * 0.25)); tx(400, 118 + i * 44, s, { 'font-size': 15, opacity: fade(u, 0.35 + i * 0.25) }); });
    M.forEach(([s], i) => { cross(682, 112 + i * 44, 8, pop(u, 1.2 + i * 0.25)); tx(700, 118 + i * 44, s, { 'font-size': 15, opacity: fade(u, 1.25 + i * 0.25) }); }); }

  // ---------- 3. Chroma ----------
  function appBox(o) { o = o || {}; el('rect', { x: 360, y: 56, width: 250, height: 140, rx: 12, fill: SOFT, stroke: o.off ? OFF : INK, 'stroke-width': 2, 'stroke-dasharray': o.off ? '6 5' : null, opacity: o.op ?? 1 });
    tx(374, 78, o.off ? '앱 재시작 중…' : '앱 프로세스 (Python)', { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: o.op ?? 1 });
    card(485, 132, 160, 40, { rx: 8, text: 'chromadb', fs: 15, mono: true, stroke: ACC, color: ACC, op: (o.op ?? 1) * (o.off ? 0.3 : 1) }); }
  function folder(x, y, name, s) { const g = R.G(x, y, s ?? 1); el('path', { d: 'M-40,-26 H-10 L-2,-18 H40 V26 H-40 Z', fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 }, g); tx(0, 46, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: ACC }, g); }
  function s3(t, c) { const { k, u } = c; if (k === 6) return s3x(t, c); minimap(c); qa(c);
    if (k === 0) { appBox(); card(800, 126, 130, 70, { rx: 10, text: '별도 서버', fs: 15, stroke: OFF, color: OFF, dash: '6 5', op: fade(u, 0.5) }); cross(800, 126, 22, pop(u, 1.0));
      tx(640, 260, '앱 프로세스 안에서 바로 쓰는 임베디드 DB', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    if (k === 1) { const off = u > 1.2 && u < 1.9; appBox({ off }); grow(610, 132, 730, 132, E(u, 0.2, 0.8), ACC); folder(790, 132, './chroma_db', pop(u, 0.6));
      if (u > 0.9) mono(790, 230, 'chroma.sqlite3', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      tx(640, 290, off ? '재시작 중에도 폴더는 그대로' : u >= 1.9 ? '다시 켜면 그대로 읽는다' : 'path 를 주면 디스크에 영속 저장', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: off ? WARN : u >= 1.9 ? GOOD : INK }); return; }
    if (k === 2) { card(470, 100, 220, 44, { rx: 8, text: '"RAG에 자주 쓰이는 도구는?"', fs: 13.5, s: pop(u, 0.2) });
      grow(470, 124, 470, 166, E(u, 0.5, 0.9), MUT); card(470, 192, 220, 46, { rx: 10, text: 'all-MiniLM-L6-v2', fs: 14.5, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 0.8) });
      grow(470, 216, 470, 256, E(u, 1.1, 1.4), MUT);
      const n = Math.round(E(u, 1.3, 2.4) * 24); for (let i = 0; i < 24; i++) el('rect', { x: 360 + i * 19, y: 266, width: 16, height: 28, rx: 2, fill: i < n ? INFO : SOFT, opacity: i < n ? 0.35 + 0.6 * ((i * 7) % 10) / 10 : 1 });
      mono(820, 286, '… 384차원', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.2) });
      tx(640, 340, '컬렉션에 등록해 두면 add · query 때 자동 호출', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { const ox = 500, oy = 320, a1 = -0.35, a2 = -0.95, L = 210;
      grow(ox, oy, ox + Math.cos(a1) * L, oy + Math.sin(a1) * L, E(u, 0.2, 0.8), INFO); grow(ox, oy, ox + Math.cos(a2) * L, oy + Math.sin(a2) * L, E(u, 0.5, 1.1), ACC);
      const arcF = E(u, 1.1, 1.7); if (arcF > 0) { const r = 70, b2 = lerp(a1, a2, arcF); el('path', { d: `M${ox + Math.cos(a1) * r},${oy + Math.sin(a1) * r} A${r},${r} 0 0 0 ${ox + Math.cos(b2) * r},${oy + Math.sin(b2) * r}`, fill: 'none', stroke: WARN, 'stroke-width': 2.4 }); }
      tx(ox + 82, oy - 36, 'θ', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
      mono(720, 120, 'hnsw:space = "cosine"', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      mono(720, 160, '거리 = 1 − cos θ', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.8) });
      tx(720, 196, '길이는 무시하고 방향만 본다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    const D1 = [560, 170], D2 = [640, 230], Q = [600, 120];
    el('rect', { x: 360, y: 60, width: 520, height: 280, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 1.5 }); tx(374, 82, '컬렉션 docs', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    if (k === 4) { [[D1, 'd1', '"Chroma는 RAG 프로토타입에…"'], [D2, 'd2', '"PersistentClient는 디스크에…"']].forEach(([p, id, s], i) => { const f = E(u, 0.3 + i * 0.7, 1.0 + i * 0.7);
        if (f <= 0) return; el('circle', { cx: lerp(400, p[0], f), cy: lerp(380, p[1], f), r: 9, fill: ACC });
        mono(p[0] + 16, p[1] + 5, id + ' · src=intro', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0 + i * 0.7) }); });
      tx(380, 324, '문서 · metadatas · ids 만 넘기면 임베딩은 자동', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { [D1, D2].forEach((p, i) => { el('circle', { cx: p[0], cy: p[1], r: 9, fill: ACC }); mono(p[0] + 16, p[1] + 5, 'd' + (i + 1), { 'font-size': 13.5, 'font-weight': 700, fill: ACC }); });
      if (k === 5) { el('path', { d: `M${Q[0]},${Q[1] - 11} L${Q[0] + 10},${Q[1] + 8} L${Q[0] - 10},${Q[1] + 8} Z`, fill: BAD, opacity: fade(u, 0.2) }); mono(Q[0] + 16, Q[1] - 4, 'query_texts', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
        [D1, D2].forEach((p, i) => grow(Q[0], Q[1], p[0], p[1], E(u, 1.4 + i * 0.3, 1.9 + i * 0.3), BAD, { plain: true, dash: '4 3' }));
        mono(700, 300, 'where={"src": "intro"}', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.9) });
        tx(380, 324, 'n_results=3 이지만 문서가 2개라 2건이 돌아온다', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.2) }); return; }
    } }
  function s3x(t, c) { const { u } = c; minimap(c); qa(c);
    tx(370, 84, '장점', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); tx(670, 84, '한계', { 'font-size': 16, 'font-weight': 800, fill: BAD });
    ['4~5줄로 RAG 검색', 'LangChain 통합', '서버 없이 단일 앱'].forEach((s, i) => { check(382, 122 + i * 44, 8, pop(u, 0.3 + i * 0.25)); tx(400, 128 + i * 44, s, { 'font-size': 15, opacity: fade(u, 0.35 + i * 0.25) }); });
    ['여러 프로세스가 동시 접근', '100만 벡터 이상'].forEach((s, i) => { cross(682, 122 + i * 44, 8, pop(u, 1.2 + i * 0.25)); tx(700, 128 + i * 44, s, { 'font-size': 15, opacity: fade(u, 1.25 + i * 0.25) }); });
    tx(700, 230, '→ pgvector · FAISS 로 이전 검토', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); }

  // ---------- 4. FAISS ----------
  function prng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  const PB = { x: 360, y: 60, w: 260, h: 260 };
  const CEN = [[0.18, 0.2], [0.5, 0.15], [0.82, 0.22], [0.2, 0.52], [0.52, 0.5], [0.84, 0.55], [0.17, 0.85], [0.5, 0.82], [0.83, 0.86]];
  const CEN0 = [[0.4, 0.4], [0.45, 0.35], [0.6, 0.42], [0.35, 0.55], [0.55, 0.6], [0.65, 0.5], [0.4, 0.65], [0.5, 0.7], [0.62, 0.62]];
  const PTS = (() => { const r = prng(7), o = []; for (let i = 0; i < 130; i++) { const c = CEN[i % 9]; o.push([clamp(c[0] + (r() - 0.5) * 0.3, 0.03, 0.97), clamp(c[1] + (r() - 0.5) * 0.3, 0.03, 0.97)]); } return o; })();
  const near = (p, cs) => { let b = 0, bd = 9; cs.forEach((c, i) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = i; } }); return b; };
  const CCOL = [INFO, ACC, WARN, GOOD, BAD, INFO, WARN, ACC, GOOD];
  const PX = (p) => [PB.x + p[0] * PB.w, PB.y + p[1] * PB.h];
  function cellsBg(cs, hi, op) { const st = 13; for (let gx = 0; gx < PB.w; gx += st) for (let gy = 0; gy < PB.h; gy += st) { const ci = near([(gx + st / 2) / PB.w, (gy + st / 2) / PB.h], cs);
      el('rect', { x: PB.x + gx, y: PB.y + gy, width: st, height: st, fill: CCOL[ci], opacity: (hi && hi.includes(ci) ? 0.32 : 0.08) * op }); } }
  const QP = [0.47, 0.4];
  const NPROBE = [[1, 0.237, 0.046], [4, 0.522, 0.091], [16, 0.844, 0.344], [64, 0.991, 1.248]];   // 축소 실측 (recall@10, ms/질의)
  function s4(t, c) { const { k, u } = c; minimap(c); qa(c);
    if (k === 0) { el('rect', { x: 360, y: 60, width: 300, height: 170, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2 }); tx(374, 82, 'Python 프로세스', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      card(440, 150, 110, 44, { rx: 8, text: 'numpy 배열', fs: 14 }); grow(495, 150, 540, 150, E(u, 0.3, 0.7), ACC); card(595, 150, 100, 44, { rx: 8, text: 'faiss', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.5) });
      ['영속 저장', '메타데이터', '네트워크 API'].forEach((s, i) => { const y = 90 + i * 56; card(800, y, 150, 40, { rx: 8, text: s, fs: 14.5, stroke: OFF, color: OFF, dash: '5 4', op: fade(u, 1.0 + i * 0.2) }); cross(870, y, 9, pop(u, 1.3 + i * 0.2)); });
      tx(360, 290, '인덱스 알고리즘만 있는 라이브러리 · 대신 성능과 종류가 표준급', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { mono(380, 100, 'D = 768', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(380, 140, 'N = 1,000,000', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, 0.5) });
      tx(380, 200, '원본 크기 = N × D × 4바이트', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      el('rect', { x: 380, y: 222, width: 500, height: 30, rx: 6, fill: SOFT }); el('rect', { x: 380, y: 222, width: 500 * E(u, 1.1, 2.0), height: 30, rx: 6, fill: INFO, opacity: 0.75 });
      mono(880, 280, '3.07 GB', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: INFO, opacity: fade(u, 2.0) });
      tx(380, 330, '이 규모부터 인덱스 종류가 속도를 좌우한다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const n = Math.round(E(u, 0.2, 1.6) * 12);
      for (let r = 0; r < 12; r++) for (let q = 0; q < 14; q++) if (r < n) el('rect', { x: 380 + q * 16, y: 70 + r * 16, width: 14, height: 14, fill: INFO, opacity: 0.2 + 0.5 * (((r * 14 + q) * 37) % 11) / 11 });
      tx(380, 286, 'xb  (1,000,000 × 768)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.0) });
      for (let r = 0; r < 3; r++) for (let q = 0; q < 14; q++) el('rect', { x: 660 + q * 16, y: 70 + r * 16, width: 14, height: 14, fill: BAD, opacity: (0.2 + 0.5 * ((r * 5 + q * 3) % 7) / 7) * fade(u, 1.4) });
      tx(660, 140, 'xq  (10 × 768)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.5) });
      pill(760, 200, 'dtype = float32', INK, pop(u, 1.9), { fs: 14, mono: true }); return; }
    if (k === 3) { cellsBg(CEN, null, fade(u, 0.3, 0.8)); PTS.forEach((p) => { const [x, y] = PX(p); el('circle', { cx: x, cy: y, r: 3.2, fill: MUT, opacity: 0.7 }); });
      CEN.forEach((cc, i) => { const [x, y] = PX(cc); el('circle', { cx: x, cy: y, r: 7, fill: CCOL[i], stroke: PANEL, 'stroke-width': 2, opacity: fade(u, 0.6 + i * 0.08) }); });
      tx(650, 90, '점 = 벡터, 칸 = 셀(보로노이)', { 'font-size': 14.5, 'font-weight': 700 }); tx(650, 118, '(2차원으로 줄여 그린 그림)', { 'font-size': 13.5, fill: MUT });
      mono(650, 170, 'nlist = 4096', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      mono(650, 204, '√N = 1,000', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); mono(650, 230, '4·√N ≈ 4,000', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(650, 270, '셀 하나에 평균 1,000,000 / 4,096', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); tx(650, 292, '≈ 244개', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { const f = E(u, 0.2, 1.4), cs = CEN.map((cc, i) => [lerp(CEN0[i][0], cc[0], f), lerp(CEN0[i][1], cc[1], f)]);
      cellsBg(cs, null, 1); const add = E(u, 1.5, 2.6);
      PTS.forEach((p, i) => { const [x, y] = PX(p), on = i / PTS.length < add; el('circle', { cx: x, cy: y, r: 3.2, fill: on ? CCOL[near(p, cs)] : MUT, opacity: on ? 0.95 : 0.5 }); });
      cs.forEach((cc, i) => { const [x, y] = PX(cc); el('circle', { cx: x, cy: y, r: 7, fill: CCOL[i], stroke: PANEL, 'stroke-width': 2 }); });
      mono(650, 110, 'index.train(xb)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) }); tx(650, 136, 'K-means 로 셀 중심이 자리를 잡는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) });
      mono(650, 200, 'index.add(xb)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.4) }); tx(650, 226, '각 벡터가 가장 가까운 셀 목록에 들어간다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      mono(650, 280, 'ntotal = ' + Math.round(1000000 * add).toLocaleString('en-US'), { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) }); return; }
    if (k === 5) { const order = CEN.map((cc, i) => [(cc[0] - QP[0]) ** 2 + (cc[1] - QP[1]) ** 2, i]).sort((a, b) => a[0] - b[0]).map((d) => d[1]);
      const np = u < 0.9 ? 1 : u < 1.6 ? 2 : 4, hi = order.slice(0, np); cellsBg(CEN, hi, 1);
      PTS.forEach((p) => { const ci = near(p, CEN), [x, y] = PX(p); el('circle', { cx: x, cy: y, r: 3.2, fill: hi.includes(ci) ? CCOL[ci] : MUT, opacity: hi.includes(ci) ? 1 : 0.35 }); });
      const [qx, qy] = PX(QP); el('path', { d: `M${qx},${qy - 10} L${qx + 9},${qy + 7} L${qx - 9},${qy + 7} Z`, fill: BAD });
      mono(PB.x, PB.y + PB.h + 26, 'nprobe = ' + np + ' (그림)', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      // 오른쪽: 실측 곡선
      const ax = axes(690, 80, 220, 200, { x: [0, 3], y: [0, 1], yt: [0, 0.5, 1], grid: true });
      tx(650, 64, 'recall@10', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      NPROBE.forEach(([n], i) => mono(ax.X(i), 300, String(n), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
      tx(910, 322, 'nprobe', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      line(ax, NPROBE.map(([, r], i) => [i, r]), E(u, 0.3, 2.0), ACC);
      NPROBE.forEach(([n, r, ms], i) => { const op = clamp(E(u, 0.3, 2.0) * 3 - i + 1); if (op <= 0) return; el('circle', { cx: ax.X(i), cy: ax.Y(r), r: 5, fill: ACC, opacity: op });
        mono(ax.X(i), ax.Y(r) - 10 - (i === 3 ? 0 : 0), r.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
        mono(ax.X(i), 344, ms.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: op }); });
      tx(650, 344, 'ms', { 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
      tx(650, 372, '축소 실측 10만 개 · 전수 1.27ms', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { card(470, 120, 150, 60, { rx: 10, text: 'CPU 인덱스', fs: 15, stroke: INK }); grow(545, 120, 680, 120, E(u, 0.3, 1.0), ACC); card(760, 120, 150, 60, { rx: 10, text: 'GPU 인덱스', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      mono(612, 104, 'index_cpu_to_gpu', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      tx(760, 172, '코드 주석: 10~100배', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.1) });
      grow(470, 152, 470, 240, E(u, 1.4, 1.9), WARN); const g = R.G(470, 270, pop(u, 1.8)); el('path', { d: 'M-15,-20 H7 L15,-12 V20 H-15 Z', fill: PANEL, stroke: WARN, 'stroke-width': 2 }, g);
      mono(500, 276, 'ivf_flat.index', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      tx(500, 300, 'write_index 를 부르지 않으면 재시작 때 사라진다', { 'font-size': 14, fill: WARN, opacity: fade(u, 2.1) }); return; }
    ['메타데이터', '필터', 'CRUD', '네트워크 API', '다중 클라이언트'].forEach((s, i) => { const x = 440 + (i % 3) * 170, y = 110 + Math.floor(i / 3) * 80;
      card(x, y, 150, 46, { rx: 9, text: s, fs: 15, stroke: BAD, color: INK, s: pop(u, 0.2 + i * 0.2) }); cross(x + 62, y - 18, 8, pop(u, 0.5 + i * 0.2)); });
    banner(640, 300, 'DB 가 아니라 라이브러리 · 나머지는 직접 만든다', pop(u, 1.6)); }

  // ---------- 5. 관리형 (Pinecone) ----------
  function cloud(x, y, w, h, op) { el('path', { d: `M${x + 40},${y + h} H${x + w - 40} A40,40 0 0 0 ${x + w - 30},${y + 30} A50,50 0 0 0 ${x + w / 2},${y + 10} A50,50 0 0 0 ${x + 40},${y + 40} A30,30 0 0 0 ${x + 40},${y + h} Z`, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: op }); }
  function json(x, y, lines, op, hiIdx) { lines.forEach((s, i) => mono(x, y + i * 22, s, { 'font-size': 14, fill: hiIdx && hiIdx.includes(i) ? ACC : INK, 'font-weight': hiIdx && hiIdx.includes(i) ? 800 : 500, opacity: typeof op === 'function' ? op(i) : op })); }
  function s5(t, c) { const { k, u } = c; minimap(c); qa(c);
    if (k === 0) { cloud(380, 110, 330, 180, fade(u, 0.2)); ['샤딩', '복제', '백업', '스케일'].forEach((s, i) => card(470 + (i % 2) * 150, 200 + Math.floor(i / 2) * 46, 120, 36, { rx: 8, text: s, fs: 14.5, stroke: ACC, s: pop(u, 0.5 + i * 0.2) }));
      tx(545, 320, 'SaaS 가 책임진다', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.4) });
      card(840, 220, 140, 60, { rx: 10, text: '우리 몫\n코드 몇 줄', fs: 14.5, s: pop(u, 1.6) });
      tx(640, 370, '가장 편하고 가장 비싸다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { mono(380, 100, 'PINECONE_API_KEY = ••••••••', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      grow(500, 116, 500, 176, E(u, 0.6, 1.1), ACC); card(500, 206, 240, 50, { rx: 10, text: 'pc = Pinecone(api_key)', fs: 14.5, mono: true, stroke: ACC, s: pop(u, 1.0) });
      ['서버 설치', '디스크 준비', '용량 계획'].forEach((s, i) => { const y = 100 + i * 56; card(810, y, 140, 40, { rx: 8, text: s, fs: 14.5, stroke: OFF, color: OFF, dash: '5 4' }); cross(870, y - 12, 8, pop(u, 1.4 + i * 0.2)); }); return; }
    if (k === 2) { card(470, 110, 200, 110, { rx: 10, stroke: GRID }); tx(386, 76, 'pc.list_indexes()', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.1) });
      ['faq', 'images'].forEach((s, i) => mono(400, 104 + i * 26, '· ' + s, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.2) })); mono(400, 156, '· (예시 목록)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      mono(620, 110, '"products" in ?', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0) }); pill(850, 110, '없음 → 생성', ACC, pop(u, 1.4), { fs: 14 });
      pill(850, 170, '있으면 건너뜀', MUT, pop(u, 1.8), { fs: 14 }); tx(380, 270, '배포 스크립트를 여러 번 돌려도 안전하다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { card(540, 170, 330, 200, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 0.2) }); tx(394, 94, 'create_index', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.3) });
      [['dimension', '1536'], ['metric', '"cosine"'], ['cloud', '"aws"'], ['region', '"us-east-1"']].forEach(([a, b], i) => { const op = fade(u, 0.5 + i * 0.25); mono(394, 132 + i * 36, a, { 'font-size': 14.5, fill: MUT, opacity: op }); mono(686, 132 + i * 36, b, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', opacity: op }); });
      ['샤드 수', '노드 수'].forEach((s, i) => { const y = 120 + i * 60; card(820, y, 130, 40, { rx: 8, text: s, fs: 14.5, stroke: OFF, color: OFF, dash: '5 4' }); cross(875, y - 12, 8, pop(u, 1.6 + i * 0.2)); });
      tx(820, 230, '지정하지 않는다', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 7) return cost7(u);
    // k4~: 인덱스 products 안의 namespace 두 칸
    const box = (op) => { el('rect', { x: 680, y: 60, width: 250, height: 290, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: op }); tx(694, 84, 'index "products"', { 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: op });
      [['tenant_a', ACC], ['tenant_b', WARN]].forEach(([s, col], i) => { el('rect', { x: 694, y: 100 + i * 124, width: 222, height: 110, rx: 9, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op }); mono(706, 122 + i * 124, s, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: op }); }); };
    if (k === 4) { box(1); json(360, 90, ['upsert(vectors=[', '  {"id": "p1",', '   "values": [0.12] × 1536,', '   "metadata": {"sku": "A1"}},', '  {"id": "p2", … "B2"}],', ' namespace="tenant_a")'], (i) => fade(u, 0.1 + i * 0.15), [5]);
      [0, 1].forEach((i) => { const f = E(u, 1.2 + i * 0.4, 1.9 + i * 0.4); if (f <= 0) return; const x = lerp(600, 760 + i * 80, f), y = lerp(200, 170, f); el('circle', { cx: x, cy: y, r: 9, fill: ACC }); if (f >= 1) mono(x, y + 26, 'p' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 }); });
      tx(805, 300, '비어 있다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); return; }
    box(1); [0, 1].forEach((i) => { el('circle', { cx: 760 + i * 80, cy: 170, r: 9, fill: ACC }); mono(760 + i * 80, 196, 'p' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 }); });
    if (k === 5) { json(360, 90, ['query(vector=[0.12] × 1536,', '  top_k=10,', '  include_metadata=True,', '  namespace="tenant_a",', '  filter={"sku": {"$in":', '          ["A1", "B2"]}})'], (i) => fade(u, 0.1 + i * 0.15), [3, 4]);
      dot([[600, 200], [700, 200], [740, 170]], seg(u, 1.2, 2.0), BAD, 7); el('rect', { x: 694, y: 224, width: 222, height: 110, rx: 9, fill: OFF, opacity: 0.4 * fade(u, 1.6) });
      tx(805, 290, '보지 않는다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 6) { json(360, 90, ['matches: [', '  {id: "p1", score: 1.000,', '   metadata: {sku: "A1"}},', '  {id: "p2", score: 1.000,', '   metadata: {sku: "B2"}}', ']'], (i) => fade(u, 0.2 + i * 0.2), [1, 3]);
      tx(360, 260, '[0.12]과 [0.34]를 1536번 늘어놓은 벡터는', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); tx(360, 284, '방향이 같아서 코사인이 둘 다 1이다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      fly(740, 170, 420, 112, seg(u, 0.1, 0.8), 'score + metadata', { mono: true }); return; }
  }
  function cost7(u) { // k7: 비용과 소버린티
    el('rect', { x: 360, y: 70, width: 300, height: 34, rx: 6, fill: SOFT }); el('rect', { x: 360, y: 70, width: 300 * E(u, 0.2, 1.2), height: 34, rx: 6, fill: BAD, opacity: 0.7 });
    tx(360, 132, '비용이 가장 비싸다', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.0) }); tx(360, 156, '코드 주석: 100만 벡터 기준 월 수십~수백 USD', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) });
    card(500, 210, 280, 56, { rx: 10, text: '데이터가 외부 리전에 저장된다', fs: 14.5, stroke: WARN, s: pop(u, 1.4) }); tx(360, 270, '보안 · 소버린티 검토가 따라온다', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: '벡터 DB를 고를 때 가장 먼저 묻는 질문은 무엇인가?',
      o: ['어느 회사 제품이 유명한가', '얼마나 많은 벡터를 저장할 것인가', '어떤 프로그래밍 언어를 쓰는가'], a: 1,
      why: '규모가 후보를 먼저 자른다. 768차원 기준 10만 개는 0.3GB지만 1억 개는 307GB라서 쓸 수 있는 도구가 달라진다.' },
    { q: '이미 PostgreSQL을 쓰는 팀이 pgvector를 고르는 가장 큰 이유는?',
      o: ['WHERE 필터와 벡터 거리 정렬을 한 쿼리로 쓰고, 새 DB를 들이지 않아도 돼서', 'GPU 가속이 기본으로 켜져서', '1억 벡터 이상에서 가장 빨라서'], a: 0,
      why: 'CREATE EXTENSION 한 줄로 기존 테이블에 vector 컬럼을 붙이고, 백업·운영도 기존 DB 그대로다. 1억 이상은 오히려 한계로 적혀 있다.' },
    { q: 'Chroma PersistentClient에 path를 준 앱을 재시작하면 데이터는 어떻게 되나?',
      o: ['메모리에만 있어서 사라진다', './chroma_db 폴더에 남아 있어서 그대로 읽힌다', '별도 서버에 접속해야 복구된다'], a: 1,
      why: 'PersistentClient는 지정한 폴더(SQLite 파일)에 저장한다. 서버 프로세스 없이도 재시작 후 데이터가 남는다.' },
    { q: 'IVF 인덱스에서 nprobe를 1에서 64로 키우면 어떻게 되나?',
      o: ['검사하는 셀이 늘어 recall은 오르고 검색은 느려진다', '셀 수(nlist)가 늘어난다', 'recall과 속도가 모두 좋아진다'], a: 0,
      why: '축소 실측에서 recall@10은 0.24에서 0.99로 올랐고, 질의당 시간은 0.05ms에서 1.25ms로 늘었다.' },
    { q: 'Pinecone에서 한 인덱스를 여러 고객사가 나눠 쓰게 하는 옵션은?',
      o: ['region', 'metric', 'namespace'], a: 2,
      why: 'upsert와 query에 namespace를 주면 그 칸 안의 벡터만 다룬다. 멀티테넌시가 옵션 한 줄로 처리된다.' },
  ];
  const summary = [
    '벡터 DB 선택은 데이터 규모에서 시작하고, 768차원 1억 개면 원본만 307GB다.',
    '기존 PostgreSQL이 있으면 pgvector, 단일 앱이면 Chroma를 먼저 본다.',
    'FAISS는 인덱스 라이브러리라 nprobe 같은 손잡이가 있지만 저장과 메타데이터는 직접 만든다.',
    '관리형은 샤딩과 백업을 맡기는 대신 비용과 데이터 소버린티 검토가 따른다.',
  ];
  const review = [
    { q: 'PostgreSQL이 없는 스타트업이 RAG 데모를 한 대의 서버에서 띄우려 한다. 트리를 따르면 어디서 멈추나?',
      o: ['pgvector', 'Chroma', '관리형'], a: 1,
      why: '기존 RDB 질문에서 NO, 단일 앱 질문에서 YES가 나온다. 위에서 처음 YES가 나온 Chroma에서 멈춘다.' },
    { q: 'FAISS로 실험하다 서버를 재시작했더니 인덱스가 비어 있었다. 먼저 의심할 것은?',
      o: ['nprobe가 너무 작았다', 'write_index로 파일에 저장하지 않았다', 'nlist를 sqrt(N)보다 크게 잡았다'], a: 1,
      why: 'FAISS는 DB가 아니라서 영속성을 직접 챙겨야 한다. write_index로 저장하고 시작할 때 read_index로 불러와야 한다.' },
    { q: '여러 고객사가 쓰는 SaaS를 운영 인력 없이 만들려는데 데이터가 외부 리전에 있어도 된다. 가장 맞는 선택은?',
      o: ['FAISS를 GPU에 올린다', 'Chroma 폴더를 고객사마다 하나씩 둔다', '관리형 벡터 DB의 namespace로 나눈다'], a: 2,
      why: '샤딩·백업·스케일을 SaaS가 맡고 namespace로 테넌트를 나눈다. 소버린티 제약이 없을 때 이 분기의 조건에 맞는다.' },
  ];

  R.page({ title: '벡터 DB 의사결정 플로우차트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
