/* II-2-2 Retrievers — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: child 청크 12개를 벡터 공간의 점으로 놓고(색 = parent), 질문 ◆ 이 어떤 점을 집어 오는지 방식마다 보여 준다.
 * 점 위치와 점수(0.94 등)는 예시다(페이지 데이터의 값). MultiQuery 의 질문 3개도 LLM 출력 예시다.
 * 기본값(MultiQuery 3개, MMR lambda 0.5)은 langchain-classic 1.1 / langchain-core 1.8 코드에서 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const PC = { P1: ACC, P2: INFO, P3: MUT, P4: WARN, P5: GOOD };
  const CH = {
    C1: ['P1', 0.22, 0.78, 'AI Agent 는 자율적으로 판단하고 행동한다', 'agent', 2024], C2: ['P1', 0.32, 0.66, '환경을 관찰하고 도구를 호출한다', 'agent', 2024], C12: ['P1', 0.12, 0.64, '에이전트는 목표 달성을 위해 다단계 추론을 한다', 'agent', 2024],
    C10: ['P5', 0.42, 0.88, '에이전트는 task 성공률로 평가한다', 'agent', 2022], C11: ['P5', 0.54, 0.80, 'AgentBench 와 SWE-bench 가 대표 벤치마크다', 'agent', 2022],
    C3: ['P2', 0.46, 0.48, 'RAG 는 검색과 생성을 결합한 기법이다', 'rag', 2024], C4: ['P2', 0.58, 0.40, 'Retriever 가 관련 문서를 가져와 근거로 사용된다', 'rag', 2024],
    C5: ['P3', 0.18, 0.24, 'LangChain 은 LLM 앱 개발 프레임워크다', 'fmwk', 2023], C6: ['P3', 0.30, 0.12, 'Chain · Memory · Tool 컴포넌트를 조립한다', 'fmwk', 2023],
    C7: ['P4', 0.78, 0.44, 'FAISS 와 Chroma 는 대표적인 벡터 DB 다', 'store', 2025], C8: ['P4', 0.88, 0.32, 'pgvector 는 PostgreSQL 확장으로 운영이 쉽다', 'store', 2025], C9: ['P4', 0.80, 0.20, 'Pinecone 은 매니지드 벡터 DB 서비스다', 'store', 2025],
  };
  const IDS = Object.keys(CH);
  const BOX = [30, 50, 470, 330];   // 벡터 공간 판
  const P = (a, b) => [BOX[0] + 24 + a * (BOX[2] - 48), BOX[1] + BOX[3] - 20 - b * (BOX[3] - 44)];
  const at = (id) => P(CH[id][1], CH[id][2]);
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  // 점 12개. o.pop(i), o.st(id) → 'pick' | 'drop' | 'dim' | 'hit'
  function space(o) { o = o || {}; const [x, y, w, h] = BOX;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 12, y + 20, o.title || 'child 청크 12개 (색 = parent)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    sub(x + w - 10, y + h - 6, '점 위치는 예시', 0.9, { 'text-anchor': 'end' });
    IDS.forEach((id, i) => { const s = o.pop ? o.pop(i) : 1; if (s <= 0) return; const [cx, cy] = at(id), st = o.st ? o.st(id) : null, col = PC[CH[id][0]];
      const dim = st === 'dim' || st === 'drop', pick = st === 'pick' || st === 'hit';
      if (pick) el('circle', { cx, cy, r: 15, fill: 'none', stroke: INK, 'stroke-width': 2.6 });
      el('circle', { cx, cy, r: 8 * clamp(s), fill: dim ? OFF : col, opacity: dim ? 0.55 : 1 });
      mono(cx + 12, cy - 8, id, { 'font-size': 13.5, 'font-weight': 700, fill: dim ? OFF : INK, opacity: clamp(s) });
      if (st === 'drop') cross(cx, cy, 7, 1); }); }
  function legend(x, y, op) { Object.entries(PC).forEach(([p, col], i) => { el('circle', { cx: x + i * 72, cy: y, r: 6, fill: col, opacity: op }); mono(x + 10 + i * 72, y + 5, p, { 'font-size': 13.5, 'font-weight': 700, opacity: op }); }); }
  function query(pos, label, o) { o = o || {}; const [qx, qy] = P(pos[0], pos[1]), op = o.op ?? 1;
    el('rect', { x: qx - 9, y: qy - 9, width: 18, height: 18, fill: o.col || WARN, transform: `rotate(45 ${qx} ${qy})`, opacity: op });
    if (label) tx(qx + (o.dx ?? -14), qy + (o.dy ?? 22), label, { 'font-size': 13.5, 'font-weight': 800, fill: o.col || WARN, 'text-anchor': o.anchor || 'middle', opacity: op });
    return [qx, qy]; }
  function link(q, id, f, col) { if (f <= 0) return; const [hx, hy] = at(id); el('line', { x1: q[0], y1: q[1], x2: lerp(q[0], hx, f), y2: lerp(q[1], hy, f), stroke: col || ACC, 'stroke-width': 2.2 }); }
  // 오른쪽 후보 목록: rows = [[id, score, st, note]]
  function list(x, y, rows, o) { o = o || {}; if (o.title) tx(x, y - 12, o.title, { 'font-size': 14, 'font-weight': 800, fill: MUT });
    rows.forEach(([id, sc, st, note], i) => { const yy = y + i * 40, s = o.pop ? o.pop(i) : 1; if (s <= 0) return; const col = PC[CH[id][0]], dim = st === 'drop' || st === 'dim';
      card(x + 200, yy + 14, 400, 34, { rx: 6, stroke: st === 'pick' ? INK : GRID, sw: st === 'pick' ? 2.4 : 1.4, fill: st === 'pick' ? ACCBG : PANEL, s, op: dim ? 0.45 : 1 });
      el('circle', { cx: x + 14, cy: yy + 14, r: 6, fill: dim ? OFF : col, opacity: clamp(s) });
      mono(x + 26, yy + 19, id, { 'font-size': 13.5, 'font-weight': 800, opacity: clamp(s) * (dim ? 0.5 : 1) });
      tx(x + 66, yy + 19, note || CH[id][3].slice(0, 17) + '…', { 'font-size': 13.5, opacity: clamp(s) * (dim ? 0.5 : 1), fill: note ? (st === 'drop' ? BAD : GOOD) : INK, 'font-weight': note ? 700 : 400 });
      if (sc != null) mono(x + 390, yy + 19, sc.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: dim ? OFF : ACC, opacity: clamp(s) });
      if (st === 'drop') el('line', { x1: x + 26, y1: yy + 14, x2: x + 360, y2: yy + 14, stroke: BAD, 'stroke-width': 1.6, opacity: 0.6 }); }); }

  // ---------- 1. similarity ----------
  const Q1 = [0.24, 0.72];
  const SIM = [['C1', 0.94], ['C2', 0.89], ['C12', 0.86], ['C10', 0.71], ['C11', 0.62], ['C3', 0.55], ['C4', 0.48]];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { space({ pop: () => 0 }); pill(730, 130, 'OpenAIEmbeddings', INFO, pop(u, 0.2), { mono: true, fs: 15 }); pill(730, 190, 'FAISS', INFO, pop(u, 0.5), { mono: true, fs: 15 });
      sub(730, 250, '저장된 벡터는 아직 없다', fade(u, 1.0), { 'font-size': 15 }); return; }
    if (k === 1) { space({ pop: (i) => pop(u, 0.2 + i * 0.12) }); legend(560, 90, fade(u, 1.0));
      ['P1 AI Agent 개론', 'P2 RAG 패턴', 'P3 LangChain 입문', 'P4 Vector Store 비교', 'P5 에이전트 평가'].forEach((s, i) => tx(560, 136 + i * 30, s, { 'font-size': 14, fill: Object.values(PC)[i], 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.1) }));
      sub(700, 310, 'metadata: id · category · year 도 함께', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 2) { space({}); legend(560, 90, 1);
      card(730, 190, 360, 90, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG, s: pop(u, 0.3) });
      mono(730, 180, 'as_retriever(', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      mono(730, 206, 'search_type="similarity", k=3)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      sub(730, 270, 'Vector Store 를 Retriever 로 감싼다', fade(u, 1.2), { 'font-size': 15 }); return; }
    const q = Q1, picked = k >= 4;
    space({ st: (id) => (picked && ['C1', 'C2', 'C12'].includes(id) ? 'pick' : k === 5 && !['C1', 'C2', 'C12'].includes(id) ? 'dim' : null) });
    const qq = query(q, '"AI Agent 란 무엇인가?"', { op: k === 3 ? fade(u, 0.2) : 1, dx: 60, dy: 28, anchor: 'start' });
    if (k === 3) SIM.forEach(([id], i) => link(qq, id, E(u, 0.4 + i * 0.12, 0.8 + i * 0.12), GRID));
    if (k >= 4) ['C1', 'C2', 'C12'].forEach((id, i) => link(qq, id, k === 4 ? E(u, 0.2 + i * 0.2, 0.6 + i * 0.2) : 1, ACC));
    list(540, 90, SIM.map(([id, sc], i) => [id, sc, picked && i < 3 ? 'pick' : picked ? 'dim' : null]), { title: '점수 (예시)', pop: k === 3 ? (i) => pop(u, 0.6 + i * 0.15) : null });
    if (k === 5) { const [ax, ay] = at('C1'); el('ellipse', { cx: ax + 8, cy: ay + 10, rx: 70, ry: 50, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      tx(740, 395, '셋 다 P1 출신 · 시야가 좁다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); } }

  // ---------- 2. MMR ----------
  const MMR = [['C1', 0.94, 'pick', '쿼리와 가장 가깝다'], ['C2', 0.89, 'drop', 'C1 과 너무 비슷'], ['C12', 0.86, 'drop', 'C1 과 같은 주제'], ['C10', 0.71, 'pick', '평가 · 새 관점'],
    ['C11', 0.62, 'drop', 'C10 과 같은 P5'], ['C3', 0.55, 'pick', 'RAG · 다른 주제'], ['C4', 0.48, null]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const lam = lerp(1, 0.5, E(u, 0.8, 1.8));
      R.spans(80, 110, [['λ', { fill: ACC, 'font-weight': 800 }], [' · sim(질문, d)  −  ', {}], ['(1 − λ)', { fill: WARN, 'font-weight': 800 }], [' · max sim(d, 이미 뽑은 것)', {}]], { 'font-size': 18 });
      sub(250, 150, '질문과 가까울수록 +', fade(u, 0.4), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); sub(650, 150, '이미 뽑은 것과 닮을수록 −', fade(u, 0.6), { 'font-size': 15, fill: WARN, 'font-weight': 700 });
      el('line', { x1: 200, y1: 250, x2: 760, y2: 250, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
      el('circle', { cx: lerp(200, 760, lam), cy: 250, r: 12, fill: PANEL, stroke: ACC, 'stroke-width': 3 });
      mono(lerp(200, 760, lam), 226, `λ=${lam.toFixed(1)}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      tx(200, 285, '0 · 다양성만', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); tx(760, 285, '1 · similarity 와 같다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      sub(480, 340, 'lambda_mult 기본값 0.5', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { space({}); card(730, 190, 380, 120, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG, s: pop(u, 0.3) });
      mono(560, 160, 'search_type="mmr"', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      mono(560, 190, '"k": 3, "fetch_k": 10', { 'font-size': 15, opacity: fade(u, 0.7) }); mono(560, 220, '"lambda_mult": 0.5', { 'font-size': 15, opacity: fade(u, 1.0) });
      sub(730, 290, '후보 10개를 먼저 가져와 그중 3개를 고른다', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    const qq0 = P(Q1[0], Q1[1]);
    if (k === 2) { space({}); const qq = query(Q1, null, {});
      el('circle', { cx: qq[0], cy: qq[1], r: lerp(0, 130, E(u, 0.3, 1.3)), fill: ACCBG, opacity: 0.35, stroke: ACC, 'stroke-dasharray': '6 5' });
      query(Q1, null, {});
      list(540, 90, MMR.map(([id, sc]) => [id, sc, null]), { title: '후보 풀 (상위 7개 표시 · 점수 예시)', pop: (i) => pop(u, 0.8 + i * 0.12) }); return; }
    // k3, k4 순차 선택
    const n = k === 3 ? MMR.length * E(u, 0.2, 2.4) : MMR.length, rows = MMR.map((r, i) => (i < n ? r : [r[0], r[1], null]));
    space({ st: (id) => { const r = rows.find((x) => x[0] === id); return r ? r[2] : k === 4 ? 'dim' : null; } });
    const qq = query(Q1, null, {});
    rows.forEach(([id, , st]) => { if (st === 'pick') link(qq, id, 1, ACC); });
    list(540, 90, rows.map(([id, sc, st, note]) => [id, sc, st, st ? note : null]), { title: '한 개씩 고르기 (점수 예시)' });
    if (k === 4) { banner(740, 395, 'P1 · P5 · P2 에서 한 개씩', pop(u, 0.3)); } }

  // ---------- 3. metadata filter ----------
  const Q3 = [0.66, 0.26];
  const FIL = [['C7', 0.93, 'pick', null], ['C8', 0.88, 'pick', null], ['C9', 0.84, 'pick', null], ['C1', 0.61, 'drop', 'agent/2024 · category ✗'], ['C5', 0.55, 'drop', 'fmwk/2023 · category ✗'], ['C10', 0.42, 'drop', 'agent/2022 · year ✗']];
  const pass = (id) => CH[id][4] === 'store' && CH[id][5] >= 2024;
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const g = G(480, 190, 1);
      el('path', { d: 'M-200,-110 H200 L40,40 V110 H-40 V40 Z', fill: SOFT, stroke: INK, 'stroke-width': 2.4 }, g);
      tx(480, 120, 'where 조건', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3) });
      for (let i = 0; i < 8; i++) { const f = seg(u, 0.4 + i * 0.18, 1.6 + i * 0.18), ok = i % 3 === 0; if (f <= 0 || f >= 1) continue;
        const x = lerp(330 + i * 40, 480, Math.min(1, f * 1.4)), y = lerp(60, ok ? 320 : 140, f); el('circle', { cx: x, cy: y, r: 7, fill: ok ? GOOD : OFF }); if (!ok && f > 0.6) cross(x, y, 6, 1); }
      sub(480, 380, '점수가 높아도 조건 밖이면 버린다', fade(u, 1.8), { 'font-size': 15.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { space({ title: 'Chroma (metadata 포함)' });
      ['C1', 'C5', 'C7', 'C10'].forEach((id, i) => pill(600 + (i % 2) * 190, 310 + Math.floor(i / 2) * 44, `${id} ${CH[id][4]}/${CH[id][5]}`, PC[CH[id][0]], pop(u, 0.3 + i * 0.3), { fs: 13.5, mono: true }));
      mono(540, 150, 'metadata={"id": c.id,', { 'font-size': 15, opacity: fade(u, 0.4) }); mono(560, 178, '"category": c.category,', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.7) });
      mono(560, 206, '"year": c.year}', { 'font-size': 15, fill: ACC, opacity: fade(u, 1.0) });
      sub(720, 256, 'Document 12개가 꼬리표를 달고 저장된다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 2) { space({}); card(730, 190, 400, 150, { rx: 10, stroke: ACC, sw: 2.4, fill: ACCBG, s: pop(u, 0.2) });
      mono(550, 140, '"filter": {"$and": [', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(570, 172, '{"category": {"$eq": "store"}},', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.7) });
      mono(570, 202, '{"year":     {"$gte": 2024}},', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.1) });
      mono(550, 234, ']}', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      sub(730, 300, 'Chroma 는 Mongo 식 연산자 ($eq · $gte · $and)', fade(u, 1.7), { 'font-size': 14.5 }); return; }
    const f = k === 3 ? E(u, 0.3, 1.2) : 1;
    space({ st: (id) => (f < 0.5 ? null : !pass(id) ? 'dim' : k >= 4 && ['C7', 'C8', 'C9'].includes(id) ? 'pick' : null) });
    const qq = query(Q3, '"벡터 DB 추천해줘"', { dx: -10, dy: 34, anchor: 'end' });
    if (k >= 4) ['C7', 'C8', 'C9'].forEach((id, i) => link(qq, id, k === 4 ? E(u, 0.2 + i * 0.2, 0.6 + i * 0.2) : 1, ACC));
    if (k <= 4) list(540, 90, FIL.map(([id, sc, st, note]) => [id, sc, k === 3 ? (st === 'drop' && u > 1.0 ? 'drop' : null) : st, st === 'drop' && (k === 4 || u > 1.0) ? note : null]), { title: '조건 먼저, 그다음 점수 (예시)' });
    if (k === 3) sub(740, 360, '조건 밖 3개는 점수와 상관없이 탈락', fade(u, 1.5), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    if (k === 5) { [['tenant_id', '고객사마다 문서 분리'], ['권한', '볼 수 있는 문서만'], ['기간', 'year ≥ 2024 처럼']].forEach(([a, b], i) => { const y = 110 + i * 80, s = pop(u, 0.3 + i * 0.3);
        card(730, y, 360, 60, { rx: 10, stroke: ACC, sw: 2, s }); mono(570, y - 4, a, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4 + i * 0.3) }); tx(570, y + 18, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); });
      sub(730, 370, '경계가 뚜렷한 조건일 때 쓴다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // ---------- 4. MultiQueryRetriever ----------
  const MQ = [['AI Agent 란 무엇인가?', [0.24, 0.92], ['C1', 'C2']], ['자율 에이전트는 어떻게 동작하는가?', [0.22, 0.50], ['C2', 'C12']], ['에이전트 성능은 어떻게 평가하는가?', [0.50, 0.94], ['C10', 'C11']]];
  const QC = [ACC, INFO, GOOD];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { space({}); const [qx, qy] = P(0.3, 0.7);
      el('circle', { cx: qx, cy: qy, r: lerp(10, 110, E(u, 0.3, 1.4)), fill: WARNBG, opacity: 0.5, stroke: WARN, 'stroke-dasharray': '6 5' });
      query([0.3, 0.7], '"에이전트?"', { dy: 32 });
      tx(740, 160, '질문이 짧으면', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(740, 192, '벡터가 어디를 가리키는지 흐리다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.1) });
      sub(740, 240, 'LLM 으로 질문을 여러 개로 풀어 쓴다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1 || k === 2) { card(240, 200, 300, 60, { rx: 10, stroke: INK, sw: 2.2, text: 'base retriever (k=2)', fs: 15, mono: true, s: k === 1 ? pop(u, 0.2) : 1 });
      card(720, 200, 300, 60, { rx: 10, stroke: INFO, sw: 2.2, fill: INFOBG, text: 'gpt-4o-mini (temperature=0)', fs: 14.5, mono: true, color: INFO, s: k === 1 ? pop(u, 0.6) : 1 });
      if (k === 1) { sub(240, 250, '질문 하나에 2개', fade(u, 0.6)); sub(720, 250, '질문을 바꿔 쓰는 역할', fade(u, 1.0)); return; }
      card(480, 90, 380, 56, { rx: 10, stroke: ACC, sw: 2.6, fill: ACCBG, text: 'MultiQueryRetriever.from_llm', fs: 15, mono: true, color: ACC, s: pop(u, 0.4) });
      grow(400, 120, 270, 168, E(u, 0.7, 1.1), ACC); grow(560, 120, 690, 168, E(u, 0.9, 1.3), ACC);
      sub(480, 300, '부품 두 개를 하나의 retriever 로 묶는다 (include_original 은 기본 False)', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    space({ st: (id) => (k >= 4 && MQ.some(([, , h]) => h.includes(id)) ? 'pick' : k === 5 && !MQ.some(([, , h]) => h.includes(id)) ? 'dim' : null) });
    MQ.forEach(([s, pos, hits], i) => { const op = k === 3 ? fade(u, 0.3 + i * 0.4) : 1, qq = query(pos, `Q${i + 1}`, { col: QC[i], op, dx: i === 2 ? 0 : -16, dy: i === 2 ? -16 : 5, anchor: i === 2 ? 'middle' : 'end' });
      if (k >= 4) hits.forEach((id, j) => link(qq, id, k === 4 ? E(u, 0.2 + i * 0.4 + j * 0.15, 0.5 + i * 0.4 + j * 0.15) : 1, QC[i]));
      if (k === 3) { tx(540, 110 + i * 60, `Q${i + 1}  ${s}`, { 'font-size': 15, 'font-weight': 700, fill: QC[i], opacity: op }); } });
    if (k === 3) { tx(540, 70, 'LLM 이 만든 질문 3개 (예시)', { 'font-size': 14, 'font-weight': 800, fill: MUT }); sub(720, 300, 'invoke 한 번 = LLM 호출 1번', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { MQ.forEach(([, , hits], i) => { mono(540, 110 + i * 40, `Q${i + 1} → [${hits.join(', ')}]`, { 'font-size': 15, 'font-weight': 700, fill: QC[i], opacity: fade(u, 0.4 + i * 0.4) }); });
      el('line', { x1: 540, y1: 236, x2: 900, y2: 236, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.6) });
      mono(540, 270, '합집합 → C1 · C2 · C12 · C10 · C11', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) });
      sub(720, 300, '6건 중 겹친 C2 하나를 빼 5건', fade(u, 2.1), { 'font-size': 15 }); return; }
    // k5 효과와 비용
    tx(720, 110, '단일 검색이 놓친 P5 청크까지', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.3) });
    [['LLM 호출', 1, INFO], ['검색', 3, ACC]].forEach(([n, m, col], i) => { const y = 170 + i * 60; tx(560, y + 18, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.3) });
      for (let j = 0; j < m; j++) card(680 + j * 50, y + 12, 40, 32, { rx: 6, stroke: col, sw: 2, fill: col === INFO ? INFOBG : ACCBG, s: pop(u, 0.7 + i * 0.3 + j * 0.15) }); });
    sub(720, 320, '지연과 비용이 그만큼 늘어난다', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }

  // ---------- 5. ParentDocumentRetriever ----------
  const P4 = 'FAISS · Chroma · pgvector · Pinecone 은 모두 임베딩 벡터를 인덱싱·검색한다. 규모와 운영 환경에 따라 선택한다.';
  const KIDS = ['C7', 'C8', 'C9'];
  function parentCard(x, y, w, o) { o = o || {}; const g = G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: 0, width: w, height: 110, rx: 10, fill: o.fill || PANEL, stroke: WARN, 'stroke-width': 2.4 }, g);
    tx(14, 24, 'P4  Vector Store 비교', { 'font-size': 15, 'font-weight': 800, fill: WARN }, g);
    tx(14, 54, P4.slice(0, 38), { 'font-size': 14 }, g); tx(14, 78, P4.slice(38), { 'font-size': 14 }, g); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(250, 120, 340, 80, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.2) }); tx(250, 112, '작은 청크', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
      sub(250, 140, '임베딩이 또렷하다 · 문맥이 부족하다', fade(u, 0.5), { 'font-size': 14.5 });
      card(710, 120, 340, 80, { rx: 10, stroke: WARN, sw: 2, s: pop(u, 0.6) }); tx(710, 112, '큰 청크', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.7) });
      sub(710, 140, '문맥이 풍부하다 · 임베딩이 흐리다', fade(u, 0.9), { 'font-size': 14.5 });
      banner(480, 270, '찾을 때는 child, 돌려줄 때는 parent', pop(u, 1.5)); return; }
    if (k === 1) { const f = E(u, 0.3, 1.2);
      el('rect', { x: 80, y: 120, width: 800 * f, height: 44, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }); mono(90, 148, 'parent_splitter  chunk_size=400', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.6) });
      for (let i = 0; i < 5; i++) { const s = pop(u, 1.2 + i * 0.15); el('rect', { x: 80 + i * 164, y: 210, width: 156 * clamp(s), height: 40, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); }
      mono(90, 284, 'child_splitter  chunk_size=80', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      sub(480, 340, '같은 문서를 두 크기로 자를 준비', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { const s0 = k === 2 ? (i) => pop(u, 0.2 + i * 0.5) : () => 1;
      card(250, 170, 300, 120, { rx: 12, stroke: ACC, sw: 2.4, s: s0(0) }); tx(250, 140, 'vectorstore (Chroma)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: clamp(s0(0)) });
      KIDS.forEach((id, i) => el('circle', { cx: 190 + i * 60, cy: 190, r: 9, fill: WARN, opacity: clamp(s0(0)) })); sub(250, 220, 'child 벡터', clamp(s0(0)));
      card(710, 170, 300, 120, { rx: 12, stroke: WARN, sw: 2.4, s: s0(1) }); tx(710, 140, 'docstore (InMemoryStore)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN, opacity: clamp(s0(1)) });
      mono(710, 186, '"id-P4" → P4 원문', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: clamp(s0(1)) }); sub(710, 220, 'key-value', clamp(s0(1)));
      if (k === 2) return;
      card(480, 340, 420, 56, { rx: 10, stroke: INK, sw: 2.6, fill: SOFT, text: 'ParentDocumentRetriever', fs: 16, mono: true, s: pop(u, 0.4) });
      [[250, 230], [710, 230]].forEach(([x, y], i) => grow(x, y, 480 + (i ? 80 : -80), 312, E(u, 0.8 + i * 0.2, 1.2 + i * 0.2), INK));
      sub(480, 50, '스플리터 2개 + 저장소 2개 = 부품 4개', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { parentCard(40, 60, 520, { s: pop(u, 0.2) });
      KIDS.forEach((id, i) => { const y = 210 + i * 54;
        grow(80 + i * 30, 170, 80 + i * 30, y, E(u, 0.5 + i * 0.3, 0.8 + i * 0.3), ACC, { plain: true });
        card(300, y, 440, 40, { rx: 8, stroke: ACC, sw: 2, text: `${id}  ${CH[id][3]}`, fs: 13.5, s: pop(u, 0.8 + i * 0.3) });
        grow(522, y, 640, y, E(u, 1.4 + i * 0.2, 1.7 + i * 0.2), MUT, { dash: '4 4' }); mono(650, y + 5, 'doc_id = P4', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6 + i * 0.2) }); });
      sub(780, 120, 'child 마다 부모 id 가 붙는다', fade(u, 2.0), { 'font-size': 14.5, 'text-anchor': 'middle' });
      sub(780, 142, '(예시 문장은 줄여 쓴 것)', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { space({ title: 'child 벡터', st: (id) => (id === 'C8' ? 'hit' : KIDS.includes(id) ? null : 'dim') });
      const qq = query([0.94, 0.66], '"pgvector 가 뭐야?"', { dx: 0, dy: -18, anchor: 'end' }); link(qq, 'C8', E(u, 0.4, 1.0), ACC);
      list(540, 110, [['C8', 0.95, 'pick'], ['C7', 0.78, null], ['C9', 0.74, null]], { title: 'child 점수 (예시)', pop: (i) => pop(u, 0.8 + i * 0.2) });
      sub(740, 270, '한 문장짜리 child 에 정확히 꽂힌다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 6) { card(160, 110, 260, 44, { rx: 8, stroke: ACC, sw: 2.4, fill: ACCBG, text: 'C8 hit · doc_id = P4', fs: 14.5, mono: true });
      grow(160, 134, 160, 190, E(u, 0.3, 0.7), WARN); card(160, 220, 260, 50, { rx: 8, stroke: WARN, sw: 2, text: 'docstore.mget(["P4"])', fs: 14, mono: true, s: pop(u, 0.6) });
      grow(300, 220, 380, 220, E(u, 1.0, 1.3), WARN);
      parentCard(400, 160, 520, { s: pop(u, 1.2), fill: WARNBG });
      tx(660, 320, 'hit 은 한 문장, 돌려주는 것은 P4 문단 전체', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) }); return; }
    // k7 트레이드오프
    card(250, 150, 360, 110, { rx: 12, stroke: GOOD, sw: 2.4, s: pop(u, 0.2) }); tx(250, 132, '얻는 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
    tx(250, 162, 'LLM 이 넓은 문맥으로 답한다', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.4) });
    card(710, 150, 360, 110, { rx: 12, stroke: WARN, sw: 2.4, s: pop(u, 0.7) }); tx(710, 132, '치르는 것', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.8) });
    tx(710, 162, 'docstore 공간 · parent 길이만큼 토큰', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.9) });
    sub(480, 300, '논문 · 정책 · 매뉴얼처럼 긴 문서 RAG 에 잘 맞는다', fade(u, 1.5), { 'font-size': 15.5, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'similarity 검색으로 top-3를 뽑았더니 셋 다 같은 parent(P1)에서 나왔다. 이 방식의 한계는 무엇인가?',
      o: ['질문과 가까운 순서로만 고르니 비슷한 청크가 위를 다 차지한다', '점수를 계산하지 못한다', 'metadata를 저장할 수 없다'], a: 0,
      why: 'similarity는 질문과의 거리만 본다. C1·C2·C12처럼 서로 비슷한 청크가 1~3등을 다 가져가 다른 관점이 빠진다.' },
    { q: 'MMR에서 lambda_mult를 1.0으로 주면 결과는 어떻게 되나?',
      o: ['다양성만 보고 고른다', '무작위로 고른다', 'similarity 검색과 같아진다'], a: 2,
      why: 'λ=1이면 이미 뽑은 것과 닮았다는 감점이 0이 되어 질문과의 유사도만 남는다.' },
    { q: 'filter로 category="store" AND year≥2024를 걸었을 때 C1(agent/2024, 점수 0.61)은 어떻게 되나?',
      o: ['점수가 높으면 그래도 들어간다', '조건을 못 맞춰 점수와 상관없이 빠진다', '마지막 순위로 들어간다'], a: 1,
      why: 'metadata 조건을 먼저 보고 통과한 것끼리만 점수로 순위를 매긴다. C1은 category가 agent라 탈락한다.' },
    { q: 'MultiQueryRetriever가 질문 3개로 각각 k=2씩 찾아 6건이 나왔는데 최종 결과는 5건이다. 왜인가?',
      o: ['두 질문이 같은 C2를 찾아 합집합에서 하나가 빠졌다', 'LLM이 한 건을 지웠다', 'k가 5로 바뀌었다'], a: 0,
      why: '결과는 중복을 뺀 합집합이다. Q1과 Q2가 모두 C2를 가져와 C1·C2·C12·C10·C11 5건이 남았다.' },
    { q: 'ParentDocumentRetriever가 "pgvector가 뭐야?"에 돌려주는 것은?',
      o: ['검색에 걸린 child C8 한 문장', 'P4 parent 문단 전체', 'P1~P5 parent 전부'], a: 1,
      why: '검색은 작은 child로 하고, 걸린 child의 doc_id로 docstore에서 parent를 꺼내 돌려준다.' },
  ];

  const summary = [
    'similarity는 질문과 가까운 순으로만 골라 비슷한 청크가 위를 다 차지하기 쉽다.',
    'MMR은 후보를 넉넉히 가져온 뒤 이미 뽑은 것과 닮은 청크를 깎아 여러 관점을 고른다.',
    'metadata filter는 조건을 먼저 걸어 점수가 높아도 범위 밖 문서는 빼 버린다.',
    'MultiQuery는 질문을 여러 개로 풀고, ParentDocument는 child로 찾아 parent를 돌려준다.',
  ];
  const review = [
    { q: '고객사 A의 질문에 고객사 B의 문서가 섞여 답에 나왔다. 가장 먼저 붙일 것은?',
      o: ['MMR로 다양성을 높인다', 'MultiQueryRetriever로 질문을 늘린다', '저장할 때 tenant_id를 metadata로 넣고 filter로 거른다'], a: 2,
      why: '권한과 테넌트처럼 경계가 뚜렷한 조건은 점수와 상관없이 막아야 한다. filter가 그 역할을 한다.' },
    { q: '요약 기능에 넣을 청크가 매번 같은 절에서만 나와 내용이 한쪽으로 쏠린다. 알맞은 손질은?',
      o: ['search_type을 "mmr"로 바꾸고 fetch_k를 넉넉히 준다', 'k를 1로 줄인다', 'child_splitter를 없앤다'], a: 0,
      why: 'MMR은 이미 뽑은 것과 닮은 후보를 깎아 다른 절의 청크를 끌어온다. 요약처럼 여러 관점이 필요할 때 맞는다.' },
    { q: '검색은 잘 맞는데 LLM 답이 근거가 짧아 자꾸 앞뒤 문맥을 놓친다. 지연 증가 없이 먼저 해 볼 것은?',
      o: ['MultiQueryRetriever로 LLM 호출을 늘린다', 'ParentDocumentRetriever로 찾은 child의 parent를 넘긴다', 'filter에 year 조건을 추가한다'], a: 1,
      why: '작은 child로 정확히 찾고 큰 parent를 돌려주면 검색 정확도를 지키면서 문맥이 넓어진다. LLM 호출이 늘지 않는다.' },
  ];

  R.page({ title: '질문 ◆ 이 집어 오는 청크', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
