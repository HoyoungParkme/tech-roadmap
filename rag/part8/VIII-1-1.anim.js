/* VIII-1-1 검색기 선택 가이드와 툴 지도 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 버그 15건이 검색/생성 두 통으로 갈리고, recall@5 62% 가 천장이 된다 → 검색기 사다리(BM25·벡터·RRF·리랭커)
 *       → 프레임워크 3사의 공통 조각 retriever → 저장×임베딩×리랭커 조합 경로 → recommend() 결정 흐름.
 * 숫자: 페이지 STEPS(15건 = 11 + 4, recall 62%, 사다리 recall·지연, QPS 경계)와 실제 실행값
 *       (RRF 1/(60+순위) 합: d1 0.0325, d3 0.0323 / recommend(0.62, 4/15, 5, 3) 결과). 사다리 recall 은 예시 수치다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const tag = (x, y, s, op) => pill(x, y, s, WARN, 1, { fs: 13.5, op: op ?? 1, fill: WARNBG });

  // ---------- 1. 실패 해부 ----------
  const PIPE = [['질의', 110], ['검색 top-5', 330], ['컨텍스트', 550], ['생성', 770]];
  const home = (i) => [70 + (i % 5) * 26, 165 + Math.floor(i / 5) * 26];
  const binPos = (i) => i < 11 ? [262 + (i % 6) * 26, 200 + Math.floor(i / 6) * 26] : [722 + ((i - 11) % 4) * 26, 200];
  function s1(t, c) { const { k, u } = c, g = c.beat.gauge, pg = c.prev ? c.prev.gauge : g;
    PIPE.forEach(([s, x], i) => { card(x, 70, 160, 44, { rx: 10, text: s, fs: 15, stroke: INK }); if (i) grow(PIPE[i - 1][1] + 80, 70, x - 82, 70, 1, MUT); });
    pill(330, 22, 'Q: "우리 결제 모듈 타임아웃 기본값은?"', MUT, 1, { fs: 13.5, color: INK });
    tx(60, 146, '"답이 이상해요" 15건', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
    // 통 두 개
    if (k >= 1) { el('rect', { x: 245, y: 180, width: 170, height: 70, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2 }); tx(330, 274, '검색 실패 11건', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); grow(330, 94, 330, 176, k === 1 ? E(u, 0.1, 0.5) : 1, BAD); }
    if (k >= 2) { el('rect', { x: 705, y: 180, width: 130, height: 50, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }); tx(770, 254, '생성 실패 4건', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' }); grow(770, 94, 770, 176, k === 2 ? E(u, 0.1, 0.5) : 1, WARN); }
    for (let i = 0; i < 15; i++) { const [hx, hy] = home(i), [bx, by] = binPos(i), moved = i < 11 ? k >= 1 : k >= 2, f = !moved ? 0 : (i < 11 && k === 1) || (i >= 11 && k === 2) ? E(u, 0.4 + (i % 11) * 0.05, 1.4 + (i % 11) * 0.05) : 1;
      el('circle', { cx: lerp(hx, bx, f), cy: lerp(hy, by, f), r: 9 * (k === 0 ? pop(u, 0.2 + i * 0.05) : 1), fill: moved && f > 0.5 ? (i < 11 ? BAD : WARN) : INK }); }
    if (k === 0) { [['근거가 top-k에 들어왔나?', 520], ['답이 맞았나?', 760]].forEach(([s, x], i) => pill(x, 190, s, INFO, pop(u, 0.8 + i * 0.4), { fs: 14.5, fill: INFOBG }));
      note(440, 250, '두 비트면 책임이 갈린다', fade(u, 1.8), { fill: MUT }); }
    if (k === 1) note(440, 210, '근거가 컨텍스트에 없었다', fade(u, 1.6), { fill: BAD });
    if (k === 2) note(440, 210, '근거는 있었는데 잘못 읽었다', fade(u, 1.6), { fill: WARN });
    // recall@5 게이지와 천장
    if (k >= 3) { const v = tween(pg.value, g.value, u), X = 120, W = 600, y = 330;
      tx(X, y - 12, 'recall@5 — 정답 문서가 top-5 안에 든 비율', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: X, y, width: W, height: 30, rx: 6, fill: SOFT });
      el('rect', { x: X, y, width: W * v / 100, height: 30, rx: 6, fill: ACC });
      mono(X + W * v / 100 + 10, y + 22, Math.round(v) + '%', { 'font-size': 20, 'font-weight': 800, fill: ACC });
      if (k === 4) { const cx = X + W * 0.62, f = E(u, 0.3, 1.0);
        el('line', { x1: cx, y1: lerp(y + 30, 296, f), x2: cx, y2: y + 30 + (1 - f) * 0, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
        tx(cx + 96, y - 12, '답 정확도의 천장', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
        // 생성 튜닝 화살표가 천장에 막힌다
        grow(X + W + 10, 404, X + W * 0.62 + 8, 404, E(u, 1.3, 2.1), WARN);
        tx(X + W + 20, 409, 'generator 튜닝', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
        if (u > 2.1) cross(X + W * 0.62 + 24, 404, 8, pop(u, 2.1)); } } }

  // ---------- 2. 검색기 사다리 ----------
  const RRF = { bm: ['d3', 'd1', 'd7'], vec: ['d1', 'd5', 'd3'], fused: [['d1', 0.0325], ['d3', 0.0323], ['d5', 0.0161], ['d7', 0.0159]] };
  function s2(t, c) { const { k, u } = c, L = c.beat.ladder, pn = c.prev && c.prev.ladder ? c.prev.ladder.length : 0;
    // 사다리 기둥
    el('line', { x1: 40, y1: 60, x2: 40, y2: 380, stroke: GRID, 'stroke-width': 4 }); el('line', { x1: 300, y1: 60, x2: 300, y2: 380, stroke: GRID, 'stroke-width': 4 });
    tx(330, 40, 'recall (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(560, 40, '지연', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    L.forEach((r, i) => { const y = 340 - i * 80, fresh = i >= pn, f = fresh ? E(u, 0.2, 1.0) : 1, col = [INFO, INFO, ACC, GOOD][i];
      el('line', { x1: 40, y1: y, x2: lerp(40, 300, f), y2: y, stroke: INK, 'stroke-width': 4 });
      tx(52, y - 10, `${r.tier}층  ${r.name}`, { 'font-size': 15, 'font-weight': 800, opacity: f });
      el('rect', { x: 330, y: y - 26, width: 200, height: 20, rx: 4, fill: SOFT, opacity: f });
      el('rect', { x: 330, y: y - 26, width: 200 * r.recall / 100 * (fresh ? E(u, 0.6, 1.4) : 1), height: 20, rx: 4, fill: col });
      mono(538, y - 10, r.recall + '%', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(fresh ? u : 3, 1.0), 'text-anchor': 'start' });
      mono(600, y - 10, r.latency, { 'font-size': 14.5, fill: MUT, opacity: f });
      tx(52, y + 16, r.good, { 'font-size': 13.5, fill: GOOD, opacity: f }); });
    const RX = 690;
    if (k === 1) { tx(RX, 70, 'BM25 점수와 코사인 점수는', { 'font-size': 14.5, 'font-weight': 700 }); tx(RX, 94, '단위가 달라 바로 못 더한다', { 'font-size': 14.5, 'font-weight': 700 });
      card(RX + 120, 150, 230, 52, { rx: 10, text: '점수 대신 순위로:\n1 / (60 + 순위)', fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.0) }); }
    if (k === 2) { tx(RX, 60, 'RRF 실제 계산', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      [['BM25', RRF.bm], ['벡터', RRF.vec]].forEach(([n, l], j) => { mono(RX, 90 + j * 34, n, { 'font-size': 14, 'font-weight': 700, fill: j ? INFO : WARN }); l.forEach((d, i) => card(RX + 80 + i * 50, 85 + j * 34, 42, 26, { rx: 5, text: d, mono: true, fs: 13.5, stroke: j ? INFO : WARN, op: fade(u, 0.3 + i * 0.1) })); });
      RRF.fused.forEach(([d, v], i) => { const y = 180 + i * 30, op = fade(u, 1.0 + i * 0.25);
        mono(RX, y, d, { 'font-size': 14.5, 'font-weight': 800, fill: i < 2 ? ACC : INK, opacity: op }); mono(RX + 40, y, v.toFixed(4), { 'font-size': 14.5, opacity: op });
        el('rect', { x: RX + 120, y: y - 12, width: 110 * v / 0.0325, height: 14, rx: 3, fill: i < 2 ? ACC : OFF, opacity: op }); });
      note(RX, 310, '두 목록에 다 있는 d1·d3이 위로', fade(u, 2.2), { fill: ACC, 'font-size': 14 }); }
    if (k === 3) { tx(RX, 70, 'hybrid_search()', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      [['BM25 상위 20', WARN], ['벡터 상위 20', INFO]].forEach(([s, col], i) => { card(RX + 70, 110 + i * 46, 140, 36, { rx: 8, text: s, fs: 14, stroke: col, color: col, s: pop(u, 0.2 + i * 0.2) }); grow(RX + 142, 110 + i * 46, RX + 200, 133, E(u, 0.6, 1.0), MUT, { plain: true }); });
      card(RX + 230, 133, 60, 36, { rx: 8, text: 'RRF', mono: true, fs: 14, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      c.beat.recommend.forEach((r, i) => { const op = fade(u, 1.3 + i * 0.4); tx(RX, 220 + i * 50, r.doc, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); tx(RX, 242 + i * 50, '→ ' + r.pick, { 'font-size': 14, fill: ACC, opacity: op }); }); }
    if (k === 4) { c.beat.recommend.forEach((r, i) => { const op = i === 2 ? fade(u, 1.4) : 1; tx(RX, 70 + i * 56, r.doc, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); tx(RX, 92 + i * 56, '→ ' + r.pick, { 'font-size': 14, fill: ACC, opacity: op }); });
      note(RX, 270, '필요한 층까지만 올라간다', fade(u, 2.0), { fill: WARN }); note(RX, 296, '4층은 지연 ~120ms·GPU', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); }
    if (k === 0) { note(RX, 120, '단어가 정확히 겹치면 강하다', fade(u, 1.0)); note(RX, 150, '"TIMEOUT_MS" 같은 토큰', fade(u, 1.3), { fill: MUT, 'font-size': 14 });
      note(RX, 200, '동의어·다른 표현은 놓친다', fade(u, 1.8), { fill: BAD }); } }

  // ---------- 3. 프레임워크 3사 ----------
  const FW = [['LangChain', INFO, 160], ['LlamaIndex', ACC, 480], ['Haystack', GOOD, 800]];
  function s3(t, c) { const { k, u } = c;
    FW.forEach(([name, col, x], i) => { if (i > k && k < 3) return; const s = i === k ? pop(u, 0.2) : 1, op = k === 3 ? 0.9 : 1;
      card(x, 60, 200, 40, { rx: 10, text: name, fs: 16, fw: 800, stroke: col, color: col, s });
      const ret = k === 3, rcol = ret ? ACC : INK;
      if (i === 0) { // 체인 고리
        [['FAISS', 120], ['retriever', 190], ['RetrievalQA', 260]].forEach(([s2, y], j) => { const f = k === 0 ? fade(u, 0.5 + j * 0.3) : 1;
          el('rect', { x: x - 80, y: y - 22, width: 160, height: 44, rx: 22, fill: PANEL, stroke: j === 1 ? rcol : INK, 'stroke-width': j === 1 && ret ? 3.5 : 2, opacity: f * op });
          mono(x, y + 5, s2, { 'font-size': 14.5, 'text-anchor': 'middle', fill: j === 1 ? rcol : INK, opacity: f * op });
          if (j) el('line', { x1: x, y1: y - 48, x2: x, y2: y - 22, stroke: INK, 'stroke-width': 6, opacity: f * op }); });
        if (k === 0) note(x, 320, '4줄로 조립, 통합 수백 개', fade(u, 1.6), { 'text-anchor': 'middle', fill: MUT }); }
      if (i === 1) { // 문서 → 노드 → 인덱스 나무
        const f = k === 1 ? E(u, 0.4, 1.6) : 1;
        card(x, 120, 120, 36, { rx: 6, text: 'Document', mono: true, fs: 14, stroke: INK, op: op });
        [-70, 0, 70].forEach((dx, j) => { grow(x, 138, x + dx, 172, f, MUT, { plain: true }); card(x + dx, 188, 58, 30, { rx: 6, text: 'node', mono: true, fs: 13.5, stroke: GRID, op: f * op }); grow(x + dx, 204, x, 236, f, MUT, { plain: true }); });
        card(x, 256, 150, 38, { rx: 8, text: 'retriever', mono: true, fs: 14.5, stroke: rcol, color: rcol, sw: ret ? 3.5 : 2, op: f * op });
        if (k === 1) note(x, 320, '인덱싱·검색 조율이 1급', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); }
      if (i === 2) { // DAG
        const f = k === 2 ? E(u, 0.4, 1.4) : 1;
        card(x - 60, 150, 110, 40, { rx: 8, text: 'retriever', mono: true, fs: 14, stroke: rcol, color: rcol, sw: ret ? 3.5 : 2, op: op });
        card(x + 60, 230, 110, 40, { rx: 8, text: 'prompt', mono: true, fs: 14, stroke: INK, op: f * op });
        grow(x - 20, 172, x + 40, 208, f, MUT);
        mono(x + 20, 270, 'documents →', { 'font-size': 13.5, fill: MUT, opacity: f });
        if (k === 2) note(x, 320, '노드·엣지가 눈에 보인다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); } });
    if (k === 3) { card(480, 360, 300, 46, { rx: 10, text: '결국 retriever 한 조각', fs: 16, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.0) });
      [[242, 190], [480, 280], [740, 172]].forEach(([x, y], i) => grow(x, y + (i === 0 ? 0 : 24), lerp(x, 480, 0.6), 334, E(u, 0.3 + i * 0.15, 0.9 + i * 0.15), ACC));
      note(40, 404, '5단계 이하 고정 파이프라인이면 직접 구현이 더 투명하다', fade(u, 1.8), { fill: WARN, 'font-size': 14.5 }); } }

  // ---------- 4. 스택 조합 ----------
  const COLS = [['벡터 저장', ['pgvector', 'ES/OpenSearch', '전용 벡터DB']], ['임베딩', ['API (OpenAI)', '오픈소스 (e5/bge)']], ['리랭커', ['없음', 'cross-encoder']]];
  const CX = [180, 480, 780], CY = (j) => 120 + j * 70;
  const PATHS = [[0, 0, 0, INFO, 'MVP · < 5 QPS'], [1, 1, 0, ACC, '성장기 · 수십 QPS'], [2, 1, 1, GOOD, '대규모 · 수백 QPS+']];
  function s4(t, c) { const { k, u } = c, nAx = c.beat.axes.length, nSt = c.beat.stacks.length, pAx = c.prev && c.prev.axes ? c.prev.axes.length : 0, pSt = c.prev && c.prev.stacks ? c.prev.stacks.length : 0;
    COLS.forEach(([h, opts], i) => { if (i >= nAx) return; const fresh = i >= pAx;
      tx(CX[i], 70, h, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fresh ? fade(u, 0.2) : 1 });
      opts.forEach((o, j) => card(CX[i], CY(j), 200, 44, { rx: 10, text: o, fs: 15, stroke: GRID, s: fresh ? pop(u, 0.3 + j * 0.2) : 1 })); });
    PATHS.slice(0, nSt).forEach(([a, b, r, col, name], p) => { const fresh = p >= pSt, f = fresh ? E(u, 0.6, 1.8) : 1, off = (p - 1) * 6;
      const pts = [[CX[0], CY(a)], [CX[1], CY(b)], [CX[2], CY(r)]].slice(0, Math.max(2, nAx));
      const seg1 = clamp(f * 2), seg2 = clamp(f * 2 - 1);
      [[pts[0], pts[1], seg1], [pts[1], pts[2], seg2]].forEach(([P, Q, s]) => { if (!Q || s <= 0) return; el('line', { x1: P[0] + 100, y1: P[1] + off, x2: lerp(P[0] + 100, Q[0] - 100, s), y2: lerp(P[1], Q[1], s) + off, stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round' }); });
      pts.slice(0, 1 + (seg1 >= 1 ? 1 : 0) + (seg2 >= 1 && pts[2] ? 1 : 0)).forEach(([x, y]) => el('rect', { x: x - 100, y: y - 22, width: 200, height: 44, rx: 10, fill: 'none', stroke: col, 'stroke-width': 3 }));
      pill(160 + p * 320, 370, name, col, fresh ? pop(u, 1.6) : 1, { fs: 14.5 }); });
    if (k === 0) note(480, 330, '이미 쓰는 Postgres에 확장만 — 새 인프라 0', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT });
    if (k === 1) note(480, 330, 'embedder 를 인자로 받으면 API ↔ 오픈소스를 코드 수정 없이 바꾼다', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT, 'font-size': 14.5 });
    if (k === 2) mono(480, 330, 'ORDER BY embedding <=> q LIMIT top_k*4', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    if (k === 4) note(480, 330, '같은 mini_rag() 에 인자만 바꿔 규모를 옮긴다', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC }); }

  // ---------- 5. 결정 흐름 ----------
  const INPUT = 'recommend(recall=0.62, 생성오류=4/15, 단계=5, QPS=3)';
  const DEC = [['recall@k 를\n쟀는가?', '쟀다 → 다음', ACC], ['recall < 0.7 ?', '0.62 → 하이브리드+RRF', BAD], ['파이프라인\n5단계 이하?', '5 → 직접 구현', INFO], ['QPS < 5 ?', '3 → pgvector + API', GOOD]];
  function s5(t, c) { const { k, u } = c, n = c.beat.flow.length, pn = c.prev && c.prev.flow ? c.prev.flow.length : 0;
    card(470, 34, 580, 36, { rx: 18, text: INPUT, mono: true, fs: 14.5, stroke: INK, s: k === 0 ? pop(u, 0.2) : 1 });
    tag(890, 34, '입력은 예시', k === 0 ? fade(u, 0.8) : 1);
    DEC.slice(0, n).forEach(([q, ans, col], i) => { const x = 130 + i * 233, fresh = i >= pn;
      const g = R.G(x, 140, fresh ? pop(u, 0.2) : 1);
      el('path', { d: 'M0,-52 L100,0 L0,52 L-100,0 Z', fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g);
      q.split('\n').forEach((s, j, a) => tx(0, (j - (a.length - 1) / 2) * 20 + 5, s, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' }, g));
      if (i) grow(x - 133, 140, x - 102, 140, fresh ? E(u, 0.1, 0.3) : 1, MUT);
      const f = fresh ? E(u, 0.8, 1.4) : 1; grow(x, 194, x, 228, f, col);
      if (f >= 1) card(x, 252, 214, 40, { rx: 8, text: ans, fs: 14, fw: 700, stroke: col, color: col, s: fresh ? pop(u, 1.3) : 1 }); });
    if (k === 1) note(130 + 233, 300, '0.55 이상이라 리랭커까지는 아니다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT, 'font-size': 14.5 });
    if (k === 3) note(480, 310, '실행 결과: 하이브리드+RRF · 직접 구현 · pgvector + API', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC });
    if (k === 4) [['평가 없이 벡터만'], ['프레임워크 과의존'], ['상시 리랭커']].forEach(([s], i) => { const x = 170 + i * 310, sc = pop(u, 0.3 + i * 0.3);
      card(x, 340, 260, 46, { rx: 10, text: s, fs: 15, fw: 700, stroke: BAD, color: BAD, fill: BADBG, s: sc }); cross(x - 110, 340, 8, sc); }); }

  const quiz = [
    { q: '정답 문서가 컨텍스트에 아예 없었는데 답이 틀렸다면, 책임은 어디에 있는가?',
      o: ['생성 — 프롬프트를 다듬는다', '검색 — recall@k를 올려야 한다', '평가 — 지표가 잘못됐다'], a: 1,
      why: '근거가 없으면 어떤 LLM도 맞힐 수 없다. 15건 중 11건이 이 경우라 recall@5 62%가 답 정확도의 천장이 된다.' },
    { q: 'BM25와 벡터 검색 결과를 합칠 때 점수 대신 순위를 쓰는 RRF를 고르는 이유는 무엇인가?',
      o: ['두 검색의 점수 단위가 달라 그대로 더할 수 없어서', '순위가 계산이 더 빨라서', 'BM25가 순위만 돌려줘서'], a: 0,
      why: 'BM25 점수와 코사인 유사도는 범위가 다르다. 1/(60+순위)를 더하면 두 목록에 다 있는 문서(d1·d3)가 위로 온다.' },
    { q: 'LangChain·LlamaIndex·Haystack 세 방식에 공통으로 들어 있는 조각은 무엇인가?',
      o: ['에이전트', 'retriever', '평가 대시보드'], a: 1,
      why: '세 프레임워크는 retriever를 노출하는 방식만 다르다. 파이프라인이 5단계 이하로 단순하면 hybrid_search 한 함수로 직접 구현하는 편이 투명하다.' },
    { q: 'QPS가 5 미만이고 문서가 1만 건 수준인 MVP에 맞는 스택은 무엇인가?',
      o: ['pgvector + API 임베딩, 리랭커 없음', '전용 벡터DB + 오픈소스 + cross-encoder', 'ES/OpenSearch + 오픈소스 임베딩'], a: 0,
      why: '이미 쓰는 Postgres에 확장만 얹으면 새 인프라가 0이다. 규모가 커져 병목이 보일 때 한 축씩 올린다.' },
    { q: 'recommend()에 recall 0.62를 넣으면 검색기 권고는 무엇인가?',
      o: ['현행 유지', '하이브리드+RRF + 리랭커까지', '하이브리드+RRF로 올려라'], a: 2,
      why: '0.7 미만이라 하이브리드로 올리고, 0.55 미만일 때만 리랭커를 더한다. 0.62는 그 사이다.' },
  ];

  const summary = [
    '답이 틀린 버그 15건 중 11건은 정답 문서가 top-5에 없던 검색 실패였다.',
    'recall@5가 62%면 생성을 아무리 다듬어도 답 정확도는 62%를 넘지 못한다.',
    '검색기는 BM25, 벡터, RRF 하이브리드, 리랭커 순으로 필요한 층까지만 올린다.',
    '파이프라인이 단순하면 직접 구현하고, 스택은 지금 규모의 최소 조합에서 시작한다.',
  ];
  const review = [
    { q: '팀이 한 달 내내 프롬프트만 고쳤는데 정확도가 60% 언저리에서 멈췄다. 먼저 잴 것은 무엇인가?',
      o: ['LLM의 temperature', 'recall@k', '응답 지연'], a: 1,
      why: '정답 근거가 컨텍스트에 들어오는 비율이 천장을 정한다. recall@k가 62%라면 프롬프트로는 그 위로 못 간다.' },
    { q: '에러코드 "TIMEOUT_MS=3000"을 물으면 벡터 검색이 엉뚱한 문서를 준다. 가장 알맞은 다음 칸은 무엇인가?',
      o: ['BM25를 더해 RRF로 합친다', '임베딩 차원을 늘린다', '프레임워크를 LangChain으로 바꾼다'], a: 0,
      why: '정확한 토큰은 단어가 겹치는 BM25가 강하다. 벡터와 순위로 합치면 서로의 약점을 메운다.' },
    { q: 'QPS 3짜리 사내 도구에 처음부터 전용 벡터DB와 상시 리랭커를 깔았다. 무엇이 문제인가?',
      o: ['recall이 떨어진다', '임베딩을 쓸 수 없다', '규모에 비해 지연·비용·운영 부담만 커진다'], a: 2,
      why: '대규모 스택은 수백 QPS에서 비용을 통제하려는 조합이다. 지금 규모에는 pgvector + API로 충분하다.' },
  ];

  R.page({ title: '검색기 사다리와 툴 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
