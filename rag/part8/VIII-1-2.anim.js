/* VIII-1-2 RAG vs GraphRAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 청크 8장으로 된 지식베이스에서 Q1 은 한 장으로 끝나고 Q2 는 조각만 흩어진다 → 질문 7유형 → 엔티티 그래프를
 *       퇴사 → 창업 → 투자받음 엣지로 순회해 교집합을 계산 → 유형별 정확도·비용 막대 → choose_architecture() 흐름.
 * 숫자: 페이지 STEPS 의 실험표(92/90, 41/86, 38/81, 비용 ×1~×12 — 페이지가 "개념 실험"이라 밝힌 예시 수치)와
 *       실제 실행값(예시 그래프에서 {X벤처, Y캐피탈} ∩ {X벤처} = {X벤처}, choose_architecture 세 입력의 결과). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const tag = (x, y, s, op) => pill(x, y, s, WARN, 1, { fs: 13.5, op: op ?? 1, fill: WARNBG });

  // ---------- 1. 같은 질문, 다른 운명 ----------
  const KB = ['정책: 환불', '문서1 퇴사자', '문서2 B사', '문서3 C사', '문서4 D사', '문서5 투자', '문서6 투자', '문서7 투자'];
  const kbPos = (i) => [540 + (i % 4) * 110, 150 + Math.floor(i / 4) * 90];
  function kb(hot, o) { o = o || {};
    tx(485, 92, '지식베이스 — 청크 8장', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    KB.forEach((s, i) => { const [x, y] = kbPos(i), h = hot && hot.includes(i), col = h ? (o.col || ACC) : GRID;
      card(x, y, 100, 64, { rx: 8, text: s.replace(' ', '\n'), fs: 14, stroke: col, color: h ? col : INK, fill: h ? (o.bg || ACCBG) : PANEL, sw: h ? 2.5 : 1.5 }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['Q1  "환불 정책이 뭐야?"', 'hops = 1', GOOD], ['Q2  "A사 출신 창업 회사들의 공통 투자자는?"', 'hops = 3', BAD]].forEach(([q, h, col], i) => { const y = 130 + i * 110, s = pop(u, 0.3 + i * 0.5);
        card(380, y, 600, 54, { rx: 12, text: q, fs: 16, fw: 700, stroke: INK, s });
        pill(760, y, h, col, pop(u, 1.2 + i * 0.4), { mono: true, fs: 15 }); });
      note(80, 360, '숨은 속성 hops — 답을 만들려면 문서를 몇 개 이어야 하나', fade(u, 2.0), { fill: MUT }); return; }
    // 왼쪽 파이프라인
    const steps = [['질의 임베딩', 110], ['벡터 검색 top-5', 200], ['LLM', 290]];
    steps.forEach(([s, y], i) => { card(170, y, 210, 46, { rx: 10, text: s, fs: 15, stroke: INK, s: k === 1 ? pop(u, 0.2 + i * 0.3) : 1 }); if (i) grow(170, y - 67, 170, y - 25, k === 1 ? E(u, 0.4 + i * 0.3, 0.7 + i * 0.3) : 1, MUT); });
    if (k === 1) { kb(null); note(40, 370, '검색기도 LLM도 같은 조건 — 두 질문을 차례로 넣는다', fade(u, 1.6), { fill: MUT }); return; }
    if (k === 2) { pill(170, 50, 'Q1 환불 정책 (hops 1)', GOOD, 1, { fs: 14.5 });
      kb(u > 0.8 ? [0] : null, { col: GOOD, bg: GOODBG });
      dot([[275, 200], [490, 150]], seg(u, 0.3, 0.8), GOOD, 7);
      if (u > 1.2) { grow(490, 160, 275, 290, E(u, 1.2, 1.6), GOOD); card(250, 360, 380, 44, { rx: 10, text: '"결제일로부터 7일 이내…"  ✓', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.6) }); tag(880, 380, '답은 예시', fade(u, 2.0)); }
      return; }
    pill(170, 50, 'Q2 공통 투자자 (hops 3)', BAD, 1, { fs: 14.5 });
    const hit = [1, 3, 5, 6, 0];   // 흩어져 회수된 조각
    kb(u > 0.6 || k === 4 ? hit : null, { col: WARN, bg: WARNBG });
    if (k === 3) { for (let i = 0; i < 4; i++) dot([[275, 200], kbPos(hit[i])], seg(u, 0.2 + i * 0.1, 0.8 + i * 0.1), WARN, 6);
      // 이어져야 할 엣지는 없다
      [['M650,118 Q760,70 870,118', 760, 84], ['M870,182 L650,208', 760, 200], ['M870,182 L760,208', 830, 202]].forEach(([d, qx, qy], j) => { const f = E(u, 1.2 + j * 0.2, 1.8 + j * 0.2);
        el('path', { d, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: 0.8 * f });
        if (f >= 1) tx(qx, qy, '?', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); });
      card(250, 360, 380, 44, { rx: 10, text: '없는 관계를 지어내거나 "모름"', fs: 15, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 2.0) }); cross(80, 360, 9, pop(u, 2.0)); return; }
    // k 4: k 를 늘려도
    mono(40, 360, 'top-k: 5 → ' + Math.round(lerp(5, 10, E(u, 0.3, 1.3))), { 'font-size': 18, 'font-weight': 800, fill: INK });
    note(40, 396, '청크를 더 모아도 엣지는 인덱스에 없다', fade(u, 1.5), { fill: BAD });
    note(485, 360, '조각은 다 와도 "퇴사 → 창업 → 투자" 연결이 없다', fade(u, 1.8), { fill: MUT, 'font-size': 14.5 }); }

  // ---------- 2. RAG 의 수비 범위 ----------
  const QT = [['fact', '사실 조회', '"반품 기한은?"'], ['define', '정의', '"SLA가 뭐야?"'], ['summary', '요약', '"계약서 핵심 3줄"'], ['similar', '유사 사례', '"비슷한 장애 이력"'],
    ['multihop', '다중 홉', '"공통 투자자?"'], ['aggregate', '집계', '"가장 많이 협업한?"'], ['global', '전역 요약', '"코퍼스 주제 지형?"']];
  function s2(t, c) { const { k, u } = c;
    QT.forEach(([key, name, ex], i) => { const local = i < 4, x = local ? 130 + i * 160 : 210 + (i - 4) * 230, y = local ? 110 : 280, s = k === 0 ? pop(u, 0.2 + i * 0.15) : 1;
      const col = k >= 1 ? (local ? GOOD : BAD) : INK;
      card(x, y, local ? 148 : 210, 70, { rx: 10, stroke: col, fill: k >= 1 ? (local ? GOODBG : BADBG) : PANEL, s });
      mono(x, y - 12, key, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s });
      tx(x, y + 8, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); tx(x, y + 28, ex, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    if (k === 0) note(40, 200, '질문을 7유형으로 나눈다', fade(u, 1.6), { fill: MUT });
    if (k >= 1) { el('rect', { x: 46, y: 64, width: 648, height: 92, rx: 14, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: k === 1 ? fade(u, 0.3) : 1 });
      mono(46, 186, 'LOCAL_TYPES → is_local() = True', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: k === 1 ? fade(u, 0.8) : 1 });
      mono(50, 236, '관계형 → 청크 한 장으로는 못 푼다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: k === 1 ? fade(u, 1.4) : 1 }); }
    // 오른쪽: VIII-1-1 사다리 재사용
    if (k >= 2) { const X = 760; tx(X, 60, 'VIII-1-1 사다리', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      ['BM25', '벡터', 'RRF 하이브리드', '(옵션) 리랭커'].forEach((s, i) => { const y = 200 - i * 34, f = k === 2 ? E(u, 0.2 + i * 0.25, 0.7 + i * 0.25) : 1;
        el('line', { x1: X, y1: y, x2: X + lerp(0, 170, f), y2: y, stroke: INK, 'stroke-width': 3 }); tx(X + 6, y - 7, s, { 'font-size': 13.5, opacity: f }); });
      el('line', { x1: X, y1: 80, x2: X, y2: 210, stroke: GRID, 'stroke-width': 3 }); el('line', { x1: X + 170, y1: 80, x2: X + 170, y2: 210, stroke: GRID, 'stroke-width': 3 });
      if (k === 2) grow(X - 10, 150, 700, 120, E(u, 1.4, 1.9), GOOD); }
    if (k === 3) { // 질문 로그: 대부분 국소
      const X = 800, Y = 260; tx(X - 10, Y - 20, '질문 로그 20건', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 20; i++) { const rel = i === 6 || i === 13 || i === 18; el('circle', { cx: X + (i % 5) * 32, cy: Y + Math.floor(i / 5) * 30, r: 10 * pop(u, 0.2 + i * 0.05), fill: rel ? BAD : GOOD }); }
      tag(X + 70, 396, '분포는 예시', fade(u, 1.6)); } }

  // ---------- 3. GraphRAG — 순회로 답을 만든다 ----------
  const N = { A: ['A사', 110, 200], P1: ['이재훈', 310, 120], P2: ['박서연', 310, 280], B: ['B사', 510, 120], C: ['C사', 510, 280], X: ['X벤처', 730, 230], Y: ['Y캐피탈', 730, 90] };
  const EDGES = [['A', 'P1', '퇴사', 1], ['A', 'P2', '퇴사', 1], ['P1', 'B', '창업', 2], ['P2', 'C', '창업', 2], ['B', 'X', '투자받음', 3], ['B', 'Y', '투자받음', 3], ['C', 'X', '투자받음', 3]];
  function graph(lit, gu, o) { o = o || {};
    EDGES.forEach(([a, b, rel, hop]) => { const [, x1, y1] = N[a], [, x2, y2] = N[b], on = lit >= hop, f = on ? (lit === hop ? gu : 1) : 0, col = [INFO, ACC, WARN][hop - 1];
      el('line', { x1, y1, x2, y2, stroke: GRID, 'stroke-width': 2, opacity: o.op ?? 1 });
      if (f > 0) el('line', { x1, y1, x2: lerp(x1, x2, f), y2: lerp(y1, y2, f), stroke: col, 'stroke-width': 4, opacity: o.op ?? 1 });
      tx((x1 + x2) / 2, (y1 + y2) / 2 - 8, rel, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? col : MUT, opacity: o.op ?? 1 }); });
    Object.entries(N).forEach(([key, [s, x, y]]) => { const win = o.win && key === 'X', on = key === 'A' || (lit >= 1 && (key === 'P1' || key === 'P2')) || (lit >= 2 && (key === 'B' || key === 'C')) || (lit >= 3 && (key === 'X' || key === 'Y'));
      card(x, y, 100, 42, { rx: 21, text: s, fs: 15, fw: 800, stroke: win ? GOOD : on ? INK : GRID, color: win ? GOOD : INK, fill: win ? GOODBG : PANEL, sw: win ? 3.5 : 2, op: o.op ?? 1 }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(110, 200, 140, 120, { rx: 10, text: '문서들\n(퇴사자 명단,\n회사 소개,\n투자 기사)', fs: 14, stroke: INK });
      card(330, 200, 120, 60, { rx: 10, text: 'LLM\n트리플 추출', fs: 14.5, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.4) }); grow(182, 200, 268, 200, E(u, 0.3, 0.7), MUT);
      [['A사', '퇴사', '이재훈'], ['이재훈', '창업', 'B사'], ['B사', '투자받음', 'X벤처']].forEach((tr, i) => { const f = E(u, 0.9 + i * 0.35, 1.5 + i * 0.35);
        card(lerp(400, 640, f), 120 + i * 80, 300, 44, { rx: 8, text: `(${tr.join(', ')})`, mono: true, fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, op: f }); });
      note(500, 370, '문서 전체를 LLM으로 훑는다 — 토큰 비용이 크다', fade(u, 2.1), { fill: WARN }); return; }
    if (k === 1) { graph(0, 0, { op: E(u, 0.2, 1.2) }); note(40, 380, '트리플이 엣지가 된다 — 추출 오류는 그대로 답의 오류', fade(u, 1.6), { fill: WARN }); tag(870, 380, '그래프는 예시', fade(u, 1.8)); return; }
    if (k === 2) { graph(1, E(u, 0.3, 1.3)); note(40, 380, 'hop 1 — A사에서 퇴사 엣지를 따라 이재훈·박서연', fade(u, 1.4), { fill: INFO }); return; }
    if (k === 3) { const lit = u < 1.3 ? 2 : 3, gu = lit === 2 ? E(u, 0.2, 1.1) : E(u, 1.3, 2.2); graph(lit, gu);
      note(40, 380, 'hop 2 창업 → hop 3 투자받음 — 경로마다 투자자 집합', fade(u, 1.0), { fill: ACC }); return; }
    if (k === 4) { graph(3, 1, { win: u > 1.2 });
      mono(40, 370, '{X벤처, Y캐피탈} ∩ {X벤처} = {X벤처}', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
      note(40, 404, '벡터 검색은 이 교집합을 계산할 수 없다', fade(u, 1.8), { fill: MUT }); return; }
    graph(3, 1, { win: true, op: 0.35 });
    [['집계', '엣지 개수를 센다'], ['전역 요약', '커뮤니티별 요약 → 합친다']].forEach(([a, b], i) => { const x = 210 + i * 330, s = pop(u, 0.3 + i * 0.4);
      card(x, 330, 290, 56, { rx: 10, stroke: GOOD, fill: GOODBG, s }); tx(x - 130, 336, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) }); tx(x - 40, 336, b, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.4) }); });
    [['구축 비용'], ['온톨로지 관리'], ['추출 오류 = 답 오류']].forEach(([s], i) => pill(860, 300 + i * 40, s, BAD, pop(u, 1.4 + i * 0.3), { fs: 14, fill: BADBG })); }

  // ---------- 4. 정확도·비용 비교 ----------
  function s4(t, c) { const { k, u } = c, ex = c.beat.experiment, pn = c.prev && c.prev.experiment ? c.prev.experiment.length : 0;
    if (k <= 1) { card(110, 200, 170, 54, { rx: 10, text: '질문', fs: 16, stroke: INK });
      card(330, 200, 170, 64, { rx: 10, text: 'classify_qtype\n(가벼운 LLM·규칙)', fs: 14, stroke: WARN, color: INK, fill: WARNBG, s: k === 0 ? pop(u, 0.3) : 1 });
      grow(196, 200, 244, 200, k === 0 ? E(u, 0.2, 0.5) : 1, MUT);
      if (k === 0) { ['fact', 'define', 'summary', 'similar', 'multihop', 'aggregate', 'global'].forEach((s, i) => pill(560 + (i % 4) * 100, 150 + Math.floor(i / 4) * 60, s, i < 4 ? GOOD : BAD, pop(u, 0.9 + i * 0.12), { mono: true, fs: 13.5 }));
        note(500, 300, '유형을 알아야 승자를 가릴 수 있다', fade(u, 2.0), { fill: MUT }); return; }
      [['국소 → 벡터 RAG (싸다)', 120, GOOD], ['관계 → GraphRAG (비싸다)', 280, BAD]].forEach(([s, y, col], i) => { grow(416, 200, 560, y, E(u, 0.3 + i * 0.4, 0.8 + i * 0.4), col); card(700, y, 270, 50, { rx: 10, text: s, fs: 15, fw: 700, stroke: col, color: col, s: pop(u, 0.8 + i * 0.4) }); });
      note(40, 380, 'route_answer — 모든 질문이 먼저 라우터를 지난다', fade(u, 1.8), { fill: MUT }); return; }
    // 막대: 유형별 정확도 (RAG vs GraphRAG)
    const ax = R.axes(90, 70, 520, 250, { x: [0, 3], y: [0, 100], yt: [0, 50, 100], yl: '정확도 %', grid: true });
    ex.forEach((r, i) => { const fresh = i >= pn, f = fresh ? E(u, 0.3, 1.3) : 1, x0 = 90 + i * 173 + 30;
      [[r.rag.acc, INFO], [r.graph.acc, ACC]].forEach(([v, col], j) => { const h = 250 * v / 100 * f, x = x0 + j * 58;
        el('rect', { x, y: 320 - h, width: 50, height: h, rx: 4, fill: col });
        mono(x + 25, 312 - h, String(Math.round(v * f)), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(fresh ? u : 3, 0.8) }); });
      tx(x0 + 54, 346, r.qtype, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fresh ? fade(u, 0.2) : 1 });
      mono(x0 + 54, 370, `비용 ×${r.rag.cost} : ×${r.graph.cost}`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fresh ? fade(u, 1.2) : 1 });
      pill(x0 + 54, 400, '승: ' + r.winner, r.winner === 'RAG' ? INFO : ACC, fresh ? pop(u, 1.6) : 1, { fs: 13.5 }); });
    // 범례·지연
    [['벡터 RAG', INFO], ['GraphRAG', ACC]].forEach(([s, col], i) => { el('rect', { x: 660, y: 74 + i * 28, width: 16, height: 16, rx: 3, fill: col }); tx(684, 87 + i * 28, s, { 'font-size': 14.5, 'font-weight': 700 }); });
    tag(780, 150, '개념 실험 수치 (예시)', 1);
    const last = ex[ex.length - 1]; note(660, 200, `지연 ${last.rag.lat} vs ${last.graph.lat}`, fresh0(u, pn, ex), { 'font-size': 14.5 });
    if (k === 2) note(660, 240, '정확도 비슷 → 싼 RAG', fade(u, 2.0), { fill: INFO });
    if (k === 3) note(660, 240, '관계를 못 봐 RAG 급락', fade(u, 2.0), { fill: BAD });
    if (k === 4) { note(660, 240, '승자는 질문 유형이 정한다', fade(u, 2.0), { fill: ACC }); note(660, 268, '→ 유형별로 라우팅', fade(u, 2.3), { fill: MUT }); } }
  const fresh0 = (u) => fade(u, 1.0);

  // ---------- 5. 선택 흐름 ----------
  const RUNS = [['관계형 10% · 본질 아님 · recall 0.84', '순수 RAG', INFO], ['관계형 30% · 본질 아님 · recall 0.62', 'recall 먼저 → 라우팅 하이브리드', WARN], ['관계형 30% · 관계가 본질 · recall 0.9', '순수 GraphRAG', ACC]];
  function s5(t, c) { const { k, u } = c;
    const D = [['질문 분포를\n쟀는가?', 120], ['recall\n< 0.7 ?', 330], ['관계가\n서비스 본질?', 540], ['관계형\n< 20% ?', 750]];
    const n = k === 0 ? 1 : k === 1 ? 2 : 4;
    D.slice(0, n).forEach(([q, x], i) => { const fresh = (k === 0 && i === 0) || (k === 1 && i === 1) || (k === 2 && i >= 2);
      const g = R.G(x, 110, fresh ? pop(u, 0.2 + (i >= 2 ? (i - 2) * 0.4 : 0)) : 1);
      el('path', { d: 'M0,-50 L95,0 L0,50 L-95,0 Z', fill: PANEL, stroke: [ACC, WARN, BAD, INFO][i], 'stroke-width': 2.5 }, g);
      q.split('\n').forEach((s, j) => tx(0, (j - 0.5) * 20 + 5, s, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' }, g));
      if (i) grow(x - 115, 110, x - 97, 110, 1, MUT); });
    if (k === 0) { card(120, 220, 210, 44, { rx: 8, text: '아니오 → 먼저 분류·집계', fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.0) }); grow(120, 162, 120, 196, E(u, 0.8, 1.0), BAD);
      note(40, 320, '근거 없는 그래프 도입을 첫 칸에서 막는다', fade(u, 1.6), { fill: MUT }); return; }
    if (k === 1) { card(330, 220, 250, 44, { rx: 8, text: '예 → 검색기 사다리부터', fs: 14, stroke: WARN, color: WARN, s: pop(u, 1.0) }); grow(330, 162, 330, 196, E(u, 0.8, 1.0), WARN);
      note(40, 320, '벡터 RAG의 recall도 안 맞춘 채 그래프부터 까는 것이 흔한 실수', fade(u, 1.6), { fill: MUT }); return; }
    if (k === 2) { pill(540, 194, '예 → 순수 GraphRAG', ACC, pop(u, 1.0), { fs: 13.5 }); pill(750, 194, '예 → 순수 RAG', INFO, pop(u, 1.3), { fs: 13.5 }); pill(860, 50, '아니오 → 라우팅', WARN, pop(u, 1.6), { fs: 13.5 });
      tx(40, 250, 'choose_architecture() 실행 결과', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      RUNS.forEach(([a, b, col], i) => { const y = 284 + i * 40, op = fade(u, 1.8 + i * 0.25); mono(40, y, a, { 'font-size': 14, opacity: op }); tx(470, y, '→ ' + b, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); });
      tag(880, 390, '입력은 예시', fade(u, 2.2)); return; }
    if (k === 3) { // 점진 도입 타임라인
      el('line', { x1: 80, y1: 280, x2: lerp(80, 880, E(u, 0.2, 2.0)), y2: 280, stroke: INK, 'stroke-width': 3 });
      [[110, '순수 RAG로 시작', INFO], [440, '다중 홉 질문이 실제로 쌓임', WARN], [780, '라우팅으로 그래프를 얹는다', ACC]].forEach(([x, s, col], i) => { const op = fade(u, 0.4 + i * 0.6);
        el('circle', { cx: x, cy: 280, r: 10, fill: col, opacity: op }); tx(x, 316, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: op }); });
      note(80, 370, '미리 깔면 구축비·온톨로지 관리만 먼저 떠안는다', fade(u, 2.2), { fill: MUT }); return; }
    [['분포 안 보고 전면 GraphRAG'], ['recall 없이 그래프부터'], ['온톨로지 없이 트리플만']].forEach(([s], i) => { const x = 170 + i * 310, sc = pop(u, 0.3 + i * 0.3);
      card(x, 260, 270, 50, { rx: 10, text: s, fs: 15, fw: 700, stroke: BAD, color: BAD, fill: BADBG, s: sc }); cross(x - 118, 260, 8, sc); });
    note(480, 350, '다음은 graphrag 과정 — 그래프 구축·커뮤니티 요약 심화', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC }); }

  const quiz = [
    { q: '"A사 출신 창업 회사들의 공통 투자자는?"에 벡터 RAG가 실패하는 이유는 무엇인가?',
      o: ['top-k가 5로 너무 작아서', '답이 여러 문서의 관계에서 계산돼야 하는데 청크 사이 엣지가 인덱스에 없어서', '임베딩 모델이 한국어를 못 해서'], a: 1,
      why: '퇴사자 명단, 회사 소개, 투자 기사는 각각 다른 청크다. k를 10으로 늘려도 조각만 더 올 뿐 퇴사 → 창업 → 투자 연결은 생기지 않는다.' },
    { q: '7가지 질문 유형 중 is_local()이 True인 것은 무엇인가?',
      o: ['fact·define·summary·similar', 'multihop·aggregate·global', 'fact·multihop·global'], a: 0,
      why: '사실 조회, 정의, 요약, 유사 사례는 답이 한 청크 안에 있다. VIII-1-1의 검색기 사다리로 recall만 확보하면 풀린다.' },
    { q: '예시 그래프에서 공통 투자자가 X벤처로 나오는 계산은 무엇인가?',
      o: ['투자 기사 청크 중 유사도가 가장 높은 것', 'X벤처와 연결된 엣지 수', 'B사 투자자 {X벤처, Y캐피탈}과 C사 투자자 {X벤처}의 교집합'], a: 2,
      why: 'A사에서 퇴사 → 창업 → 투자받음 엣지를 따라 경로별 투자자 집합을 모은 뒤 교집합을 취한다. 순회가 답을 만든다.' },
    { q: '단순 조회 질문에 GraphRAG를 쓰면 어떻게 되는가? (개념 실험 수치)',
      o: ['정확도가 92%에서 41%로 떨어진다', '정확도는 90% 대 92%로 비슷한데 비용은 6배다', '비용은 같고 정확도만 오른다'], a: 1,
      why: '답이 한 청크에 있는 질문에서는 두 방식 정확도가 비슷하다. 같은 답을 6배 비용과 450ms 지연으로 내는 셈이다.' },
    { q: 'choose_architecture()에서 관계 추론이 서비스의 본질이 아니고 관계형 질문이 10%라면 결과는 무엇인가?',
      o: ['순수 RAG로 시작', '라우팅 하이브리드', '순수 GraphRAG'], a: 0,
      why: '본질이 아니면 관계형 비율을 본다. 0.2 미만이라 순수 RAG로 시작하고, 다중 홉이 실제로 쌓이면 그때 그래프를 얹는다.' },
  ];

  const summary = [
    '답이 한 청크에 있는 질문은 벡터 RAG로 끝나지만, 다중 홉 질문은 청크 검색으로 풀리지 않는다.',
    '청크 사이 관계가 인덱스에 없어서 top-k를 늘리거나 리랭커를 붙여도 해결되지 않는다.',
    'GraphRAG는 트리플 그래프를 순회해 답을 계산하지만 구축 비용과 온톨로지 관리가 따른다.',
    '질문 유형으로 라우팅하고, 관계형이 적으면 RAG로 시작해 필요할 때 그래프를 얹는다.',
  ];
  const review = [
    { q: '사내 챗봇 질문 로그를 세어 보니 대부분 사실 조회와 정의였고 다중 홉은 몇 건뿐이다. 알맞은 출발점은 무엇인가?',
      o: ['순수 RAG로 시작하고 recall부터 맞춘다', '모든 문서로 지식 그래프를 먼저 구축한다', '질문마다 RAG와 GraphRAG를 둘 다 돌려 비교한다'], a: 0,
      why: '국소 질문은 검색기 사다리로 충분하다. 그래프는 다중 홉 질문이 실제로 쌓일 때 라우팅으로 얹는다.' },
    { q: 'GraphRAG를 도입했는데 엉뚱한 투자자가 공통 투자자로 나온다. 먼저 의심할 곳은 무엇인가?',
      o: ['벡터 검색의 top-k', 'LLM이 추출한 트리플의 정확성', '라우터의 분류 프롬프트'], a: 1,
      why: '그래프 답은 엣지를 따라 계산된다. 트리플 추출이 틀리면 순회가 맞아도 답이 틀리므로 추출 품질과 온톨로지 관리를 먼저 본다.' },
    { q: '단순 조회와 다중 홉이 섞여 들어오는 서비스에서 정확도와 평균 비용을 함께 잡는 구성은 무엇인가?',
      o: ['모든 질문을 GraphRAG로', '모든 질문을 벡터 RAG로', '유형을 분류해 국소는 RAG, 관계형만 GraphRAG로'], a: 2,
      why: '단순 조회는 RAG가 비슷한 정확도를 싸게 내고, 다중 홉은 GraphRAG가 41% 대 86%로 이긴다. 나눠 보내면 둘 다 잡는다.' },
  ];

  R.page({ title: '청크 검색과 그래프 순회', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
