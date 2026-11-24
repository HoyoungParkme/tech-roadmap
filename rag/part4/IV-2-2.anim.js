/* IV-2-2 Query Transformation — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 문서 8건은 페이지의 CORPUS, 검색 결과·점수·recall 은 STEPS 의 queries·recall·compareRows 를 읽는다.
 * 임베딩 지도 위 점의 위치는 개념도다(실제 좌표가 아니다). 점수는 페이지의 예시 값, LLM 출력은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const POS = { 'D-12': [380, 160], 'D-07': [455, 115], 'D-23': [330, 235], 'D-31': [440, 250], 'D-44': [215, 115], 'D-51': [120, 165], 'D-09': [220, 345], 'D-18': [380, 355] };
  const SHORT = { 'D-12': 'lsof + kill', 'D-07': 'fuser -k', 'D-23': 'ss / netstat', 'D-31': 'systemctl stop', 'D-44': 'SIGTERM / SIGKILL', 'D-51': '프로세스 모델', 'D-09': 'Windows netstat', 'D-18': 'Docker stop' };
  const TAGCOL = { gold: GOOD, related: INFO, concept: WARN, noise: OFF };
  const QP = { orig: [250, 285], hyde: [478, 185], m1: [355, 200], m2: [300, 140], m3: [505, 190], abs: [160, 120] };
  const corpus = () => (typeof CORPUS === 'undefined' ? [] : CORPUS);
  const tagOf = (id) => (corpus().find((d) => d.id === id) || {}).tag;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const QTXT = '리눅스에서 특정 포트 죽이는 명령어';

  // 임베딩 지도: 문서 8건 (o.op 흐림, o.s 등장, o.ring 강조할 id 목록)
  function map(o) { o = o || {}; const op = o.op ?? 1;
    zone(30, 34, 540, 376, '임베딩 공간 (개념도)', { op });
    corpus().forEach((d, i) => { const [x, y] = POS[d.id], s = o.s ? o.s(i) : 1; if (s <= 0.02) return; const col = TAGCOL[d.tag];
      const g = R.G(x, y, s, op); el('circle', { r: 9, fill: d.tag === 'gold' ? col : PANEL, stroke: col, 'stroke-width': 3 }, g);
      tx(0, 26, d.id, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: d.tag === 'noise' ? MUT : INK }, g); });
    if (o.legend) [['정답', GOOD], ['관련', INFO], ['개념', WARN], ['잡음', OFF]].forEach(([n, col], i) => { const x = 60 + i * 90;
      el('circle', { cx: x, cy: 392, r: 6, fill: col, opacity: o.legend }); tx(x + 12, 397, n, { 'font-size': 14, opacity: o.legend }); }); }
  function qdot(p, s, col, label, o) { o = o || {}; if (s <= 0.02) return; const [x, y] = p;
    const g = R.G(x, y, s, o.op ?? 1); el('path', { d: 'M0,-13 L12,0 L0,13 L-12,0 Z', fill: col || ACC, stroke: PANEL, 'stroke-width': 2 }, g);
    if (label) tx(0, o.below ? 32 : -20, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col || ACC }, g); }
  function rays(p, hits, u, col, o) { o = o || {}; hits.forEach((h, i) => { const q = POS[h.id], g = E(u, 0.1 + i * 0.15, 0.6 + i * 0.15); if (!q || g <= 0) return;
      el('line', { x1: p[0], y1: p[1], x2: lerp(p[0], q[0], g), y2: lerp(p[1], q[1], g), stroke: col || ACC, 'stroke-width': 2.2, opacity: o.op ?? 0.75, 'stroke-dasharray': o.dash }); }); }
  // 오른쪽 결과 목록 (점수 순)
  function hitList(x, y, hits, u, o) { o = o || {}; tx(x, y - 14, o.title || 'top-5 결과', { 'font-size': 15, 'font-weight': 800, fill: o.col || ACC });
    hits.forEach((h, i) => { const s = o.anim ? pop(u, 0.3 + i * 0.15, 0.45) : 1; if (s <= 0.02) return; const gold = h.tag === 'gold', yy = y + i * 36 + 14, cut = o.cut != null && i >= o.cut;
      const g = R.G(x + 170, yy, s, cut ? 0.45 : 1); el('rect', { x: -170, y: -15, width: 340, height: 30, rx: 6, fill: gold ? GOODBG : PANEL, stroke: gold ? GOOD : GRID, 'stroke-width': gold ? 2 : 1.5 }, g);
      tx(-158, 5, h.id, { 'font-size': 13.5, class: 'mono', 'font-weight': 700, fill: TAGCOL[h.tag] === OFF ? MUT : TAGCOL[h.tag] }, g);
      tx(-102, 5, SHORT[h.id], { 'font-size': 14, 'font-weight': 600, 'text-decoration': cut ? 'line-through' : null }, g);
      tx(158, 5, h.score.toFixed(2), { 'font-size': 14, class: 'mono', 'font-weight': 700, 'text-anchor': 'end', fill: gold ? GOOD : INK }, g); }); }
  function recallBox(x, y, got, op, o) { o = o || {}; const has = (id) => got.includes(id);
    tx(x, y, '정답 문서', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: op });
    ['D-12', 'D-07'].forEach((id, i) => { const cx = x + 120 + i * 92, ok = has(id); card(cx, y - 5, 80, 30, { rx: 6, text: id, fs: 14, mono: true, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, color: ok ? GOOD : BAD, op, dash: ok ? null : '4 3' }); });
    const n = got.filter((id) => id === 'D-12' || id === 'D-07').length;
    mono(x, y + 36, `recall@5 = ${n}/2 = ${n * 50}%`, { 'font-size': 20, 'font-weight': 800, fill: n === 2 ? GOOD : BAD, opacity: op }); }
  const sortHits = (h) => h.slice().sort((a, b) => b.score - a.score);
  // 여러 쿼리 결과 합치기: id 마다 가장 높은 점수
  function union(qs) { const m = {}; qs.forEach((q) => q.hits.forEach((h) => { if (!m[h.id] || m[h.id].score < h.score) m[h.id] = h; })); return sortHits(Object.values(m)); }
  const Q = (c, lab) => (c.beat.queries || []).find((q) => q.label.startsWith(lab));

  // ---------- 1. 원 쿼리 ----------
  function s1(t, c) { const { k, u } = c, q = Q(c, '원본'), hits = q ? sortHits(q.hits) : [];
    map({ s: k === 0 ? (i) => pop(u, 0.2 + i * 0.15) : null, legend: k === 0 ? fade(u, 1.6) : 1 });
    if (k === 0) { card(760, 150, 300, 80, { rx: 10, stroke: INK, text: 'FAISS 위키 인덱스\n(이 장 예시 문서 8건)', fs: 15, s: pop(u, 0.8) });
      note(760, 240, '아직 검색 전 · 결과 0건', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); return; }
    pill(230, 66, QTXT, ACC, 1, { fs: 14 });
    if (k === 1) { dot([[230, 80], QP.orig], seg(u, 0.3, 1.1), ACC, 7); qdot(QP.orig, pop(u, 1.1), ACC, '질의');
      card(760, 160, 320, 70, { rx: 10, stroke: ACC, text: 'similarity_search(\n  query, k=5)', fs: 15, mono: true, color: ACC, s: pop(u, 1.4) });
      note(760, 250, '짧은 질문 그대로 임베딩', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    qdot(QP.orig, 1, ACC, '질의'); rays(QP.orig, hits, k === 2 ? u : 3, ACC);
    hitList(590, 60, hits, u, { anim: k === 2 });
    if (k === 3) { const [x, y] = POS['D-07']; el('circle', { cx: x, cy: y, r: 22, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 0.3) });
      tx(x, y - 30, '"죽이는" ≠ "종료"', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
      recallBox(590, 300, (c.beat.union || []), fade(u, 1.0)); } }

  // ---------- 2. HyDE ----------
  const HY = ['리눅스에서 특정 포트를 사용 중인 프로세스를', '종료하려면 lsof -i :포트번호 로 PID 를 찾은 뒤', 'kill -9 PID 를 보내거나, fuser -k 포트/tcp 로', '즉시 SIGKILL 을 전송한다…'];
  const KEYS = ['lsof', 'kill', 'fuser', 'SIGKILL'];
  function hydeText(x, y, u) { let n = 0; HY.forEach((ln, i) => { const show = clamp(u * HY.length - i); if (show <= 0) return;
      const part = ln.slice(0, Math.round(ln.length * show)); tx(x, y + i * 26, part, { 'font-size': 14.5 });
      KEYS.forEach((kw) => { const at = part.indexOf(kw); if (at < 0) return; n++;
        const pre = tw(part.slice(0, at), 14.5); el('rect', { x: x + pre - 2, y: y + i * 26 - 15, width: tw(kw, 14.5) + 4, height: 20, rx: 4, fill: ACC, opacity: 0.18 }); }); });
    return n; }
  function s2(t, c) { const { k, u } = c, hq = Q(c, 'HyDE'), hits = hq ? sortHits(hq.hits) : [];
    map({ op: k <= 2 ? 0.5 : 1 });
    if (k === 0) { card(760, 140, 260, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'LLM  gpt-4o-mini', fs: 16, color: ACC, s: pop(u, 0.3) });
      card(760, 250, 260, 60, { rx: 10, stroke: INK, text: '임베딩 · 위키 인덱스', fs: 15, s: pop(u, 0.8) });
      note(760, 330, '먼저 가짜 답을 쓰게 한다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k <= 2) { qdot(QP.orig, 1, OFF, '원 질문', { op: 0.6 });
      zone(585, 40, 355, k === 1 ? 170 : 360, 'hyde_prompt', { fill: SOFT, color: ACC });
      tx(600, 86, '질문에 위키 문서처럼', { 'font-size': 15 }); tx(600, 110, '한 단락으로 답하라.', { 'font-size': 15 });
      card(700, 160, 210, 34, { rx: 6, text: '질문: {query}', fs: 15, mono: true, stroke: ACC, color: ACC, dash: '5 4' });
      if (k === 1) { fly(300, 270, 700, 160, seg(u, 0.5, 1.8), '포트 죽이는 명령어', { fill: OFF, color: INK }); note(600, 260, '원 질문은 슬롯에 들어갈 뿐', fade(u, 2.0), { fill: MUT }); return; }
      tx(600, 214, '답변 (LLM 출력 예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const n = hydeText(598, 244, E(u, 0.2, 2.2)); void n;
      sub(762, 380, '문서에 쓰일 단어가 답변 안에 들어온다', fade(u, 2.3), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); return; }
    const mv = k === 3 ? E(u, 0.2, 1.0) : 1, p = [lerp(QP.orig[0], QP.hyde[0], mv), lerp(QP.orig[1], QP.hyde[1], mv)];
    qdot(QP.orig, 1, OFF, null, { op: 0.5 }); if (mv > 0.02) el('line', { x1: QP.orig[0], y1: QP.orig[1], x2: p[0], y2: p[1], stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
    qdot(p, 1, ACC, mv > 0.9 ? '가상 답변' : null, { below: true });
    rays(QP.hyde, hits, k === 3 ? u - 1.0 : 3, ACC);
    hitList(590, 60, hits, u - 1.0, { anim: k === 3 });
    if (k === 4) recallBox(590, 300, c.beat.union || [], fade(u, 0.3)); }

  // ---------- 3. Multi-Query ----------
  const MQP = [QP.m1, QP.m2, QP.m3];
  function variants(qs, u, o) { o = o || {}; qs.forEach((q, i) => { const y = 66 + i * 92, s = o.anim ? pop(u, 0.6 + i * 0.3) : 1, act = o.on ? o.on(i) : 1;
      if (s <= 0.02) return; card(762, y, 356, 34, { rx: 8, text: q.text, fs: 14, stroke: ACC, fill: act >= 1 ? ACCBG : PANEL, s, op: act > 0 ? 1 : 0.5 });
      tx(586, y - 22, '#' + (i + 1), { 'font-size': 13.5, 'font-weight': 800, fill: ACC, opacity: s });
      (q.hits || []).forEach((h, j) => { const hs = o.hitS ? o.hitS(i, j) : 1; if (hs <= 0.02) return; const gold = h.tag === 'gold';
        card(642 + j * 120, y + 36, 112, 28, { rx: 6, text: `${h.id} ${h.score.toFixed(2)}`, fs: 13.5, mono: true, stroke: gold ? GOOD : GRID, fill: gold ? GOODBG : PANEL, color: gold ? GOOD : INK, s: hs }); }); }); }
  function s3(t, c) { const { k, u } = c, qs = (c.beat.queries || []);
    map({ op: k === 0 ? 0.5 : 1 });
    if (k === 0) { card(760, 150, 320, 90, { rx: 12, stroke: ACC, sw: 2.5, text: 'MultiQueryRetriever\n.from_llm(retriever(k=3), llm)', fs: 15, mono: true, color: ACC, s: pop(u, 0.3) });
      note(760, 260, 'LLM이 같은 질문을 여러 표현으로', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { qs.forEach((q, i) => { qdot(MQP[i], 1, ACC, '#' + (i + 1)); rays(MQP[i], q.hits, 3, ACC, { op: 0.4 }); });
      const all = []; qs.forEach((q) => q.hits.forEach((h) => all.push(h))); const un = union(qs);
      tx(590, 46, `9건 → 중복 ${all.length - un.length}건 제거 → ${un.length}건`, { 'font-size': 15, 'font-weight': 800, fill: ACC });
      hitList(590, 84, un, u, { anim: true, cut: 5, title: '' });
      const y = 84 + 5 * 36 - 4, g = E(u, 1.3, 1.7); el('line', { x1: 590, y1: y, x2: 590 + 340 * g, y2: y, stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
      recallBox(590, 340, un.slice(0, 5).map((h) => h.id), fade(u, 1.8)); return; }
    const act = k - 2;   // k2→#1, k3→#2, k4→#3
    qs.forEach((q, i) => { const s = k === 1 ? pop(u, 0.6 + i * 0.3) : 1; if (k === 1) dot([QP.orig, MQP[i]], seg(u, 0.3 + i * 0.3, 1.0 + i * 0.3), ACC, 5);
      qdot(MQP[i], s, i === act ? ACC : k === 1 ? ACC : INFO, '#' + (i + 1));
      if (i < act || (i === act && k >= 2)) rays(MQP[i], q.hits, i === act ? u : 3, i === act ? ACC : INFO, { op: i === act ? 0.85 : 0.35 }); });
    if (k === 1) qdot(QP.orig, 1 - E(u, 0.2, 0.6), OFF, '원 질문');
    variants(qs, u, { anim: k === 1, on: (i) => (i === act ? 1 : i < act ? 0.6 : k === 1 ? 1 : 0), hitS: (i, j) => (i < act ? 1 : i === act ? pop(u, 0.4 + j * 0.25) : 0) });
    if (k === 1) note(586, 360, 'LLM 1회 호출로 변형 3개', fade(u, 2.0), { fill: ACC });
    if (k === 4) { const [x, y] = POS['D-07']; el('circle', { cx: x, cy: y, r: 22, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.2) });
      note(586, 360, 'fuser 변형이 원 질문이 놓친 D-07을 0.91로', fade(u, 1.5), { fill: GOOD, 'font-size': 14.5 }); } }

  // ---------- 4. Step-Back ----------
  function s4(t, c) { const { k, u } = c, qs = c.beat.queries || [], cq = Q(c, '원본'), aq = Q(c, 'Step-Back');
    map({ op: k === 0 ? 0.5 : 1 });
    if (k === 0) { card(760, 150, 260, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'LLM  gpt-4o-mini', fs: 16, color: ACC, s: pop(u, 0.3) });
      card(760, 250, 260, 60, { rx: 10, stroke: INK, text: '임베딩 · 위키 인덱스', fs: 15, s: pop(u, 0.8) }); return; }
    // 계단: 아래 = 구체, 위 = 추상
    const stair = (op) => { el('path', { d: 'M600,330 H700 V250 H800 V170 H900', fill: 'none', stroke: GRID, 'stroke-width': 3, opacity: op }); };
    if (k <= 2) { stair(1); card(700, 360, 220, 38, { rx: 8, text: '원 질문 (구체)', fs: 14.5, stroke: INK });
      sub(700, 395, QTXT, 1, { 'font-size': 13.5 });
      qdot(QP.orig, 1, INK, '구체');
      if (k === 1) { card(760, 100, 320, 70, { rx: 10, stroke: ACC, text: '한 단계 더 추상적인\n질문으로 바꿔라', fs: 15, color: ACC, s: pop(u, 0.4) }); return; }
      dot([[700, 330], [700, 250], [800, 250], [800, 170], [880, 170]], seg(u, 0.2, 1.4), ACC, 7);
      card(760, 96, 340, 62, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'OS에서 프로세스와 포트는 어떻게\n관리되며 어떤 시그널로 종료하는가?', fs: 14, color: INK, s: pop(u, 1.4) });
      tx(592, 140, 'LLM 추상화 (출력 예시)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      qdot(QP.abs, pop(u, 1.8), ACC, '추상'); return; }
    qdot(QP.orig, 1, INK, '구체'); qdot(QP.abs, 1, ACC, '추상');
    const ch = cq ? sortHits(cq.hits) : [], ah = aq ? sortHits(aq.hits) : [];
    rays(QP.orig, ch, k === 3 ? u : 3, INK, { op: k === 5 ? 0.4 : 0.7 });
    if (k >= 4) rays(QP.abs, ah, k === 4 ? u : 3, ACC, { op: k === 5 ? 0.4 : 0.8 });
    if (k < 5) { hitList(590, 60, ch, u, { anim: k === 3, title: '구체 질문 top-3', col: INK });
      if (k >= 4) hitList(590, 210, ah, u, { anim: true, title: '추상 질문 top-3', col: ACC }); return; }
    const un = union(qs); tx(590, 46, `6건 합치기 (중복 ${6 - un.length}건)`, { 'font-size': 15, 'font-weight': 800, fill: ACC });
    hitList(590, 84, un, u, { anim: true, cut: 5, title: '' });
    recallBox(590, 340, un.slice(0, 5).map((h) => h.id), fade(u, 1.6)); }

  // ---------- 5. 비교 ----------
  const COST = ['추가 비용 없음', 'LLM 1회', 'LLM 1회 + 검색 N회', 'LLM 1회 + 검색 2회'];
  function s5(t, c) { const { k, u } = c, rows = c.beat.compareRows || [], pr = (c.prev && c.prev.compareRows) || [];
    tx(40, 50, 'recall@5 · 같은 질의 · 같은 코퍼스 · 같은 임베딩 모델', { 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.2) : 1 });
    const X0 = 230, W = 420; el('line', { x1: X0, y1: 80, x2: X0, y2: 370, stroke: MUT, 'stroke-width': 1.8 });
    [0, 50, 100].forEach((v) => { const x = X0 + W * v / 100; el('line', { x1: x, y1: 80, x2: x, y2: 370, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(x, 392, v + '%', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    ['원 쿼리만', 'HyDE', 'Multi-Query', 'Step-Back'].forEach((nm, i) => { const y = 110 + i * 70, r = rows[i], isNew = i >= pr.length && r;
      tx(X0 - 14, y + 18, nm, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', fill: r ? INK : OFF });
      if (!r) { el('rect', { x: X0, y, width: W, height: 26, rx: 4, fill: SOFT }); return; }
      const g = isNew ? E(u, 0.2, 1.2) : 1, col = r.recall >= 100 ? GOOD : BAD;
      el('rect', { x: X0, y, width: W, height: 26, rx: 4, fill: SOFT }); el('rect', { x: X0, y, width: Math.max(3, W * r.recall / 100 * g), height: 26, rx: 4, fill: col, opacity: 0.85 });
      mono(X0 + W * r.recall / 100 * g - 8, y + 19, Math.round(r.recall * g) + '%', { 'font-size': 14.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end' });
      tx(X0 + W + 18, y + 18, COST[i], { 'font-size': 14.5, fill: MUT, 'font-weight': 600, opacity: isNew ? fade(u, 1.0) : 1 }); });
    if (k === 4) pill(800, 50, '모르겠으면 Multi-Query부터', ACC, pop(u, 1.6), { fs: 14.5 }); }

  const quiz = [
    { q: '원 질문으로 검색했을 때 정답 D-07(fuser -k)을 놓친 원인은 무엇인가?',
      o: ['인덱스에 D-07이 없어서', '짧은 질문의 "죽이는"과 문서의 "종료" 같은 어휘 차이 때문에', 'k를 5로 너무 크게 잡아서'], a: 1,
      why: '짧은 키워드 질문은 길게 설명한 위키 문서와 임베딩 거리가 멀다. 정답 2개 중 1개만 잡혀 recall@5가 50%다.' },
    { q: 'HyDE가 검색에 쓰는 벡터는 무엇인가?',
      o: ['LLM이 쓴 가상 답변 한 단락의 임베딩', '원 질문의 임베딩', '정답 문서의 임베딩'], a: 0,
      why: '가상 답변에는 lsof, kill, fuser, SIGKILL처럼 문서에 쓰이는 단어가 들어 있어 위키 문서와 가깝다. 그래서 D-07도 0.86으로 잡힌다.' },
    { q: 'Multi-Query에서 9건을 합쳤을 때 남는 문서는 몇 건인가?',
      o: ['9건', '5건', '6건'], a: 2,
      why: 'D-12·D-23·D-44가 두 번씩 잡혀 중복 3건이 빠지고 6건이 남는다. 점수 상위 5건 안에 정답 2개가 모두 있다.' },
    { q: 'Step-Back이 추상 질문으로 더 끌어오는 문서는 어떤 종류인가?',
      o: ['Windows·Docker 같은 잡음 문서', '시그널·프로세스 모델 같은 배경 지식 문서', '원 질문과 똑같은 명령어 문서'], a: 1,
      why: '추상 질문은 D-51(프로세스 모델)과 D-44(SIGTERM/SIGKILL)를 0.84·0.81로 끌어온다. 구체 결과와 합쳐 답에 배경을 더한다.' },
    { q: '네 전략 중 추가 비용이 없는 대신 recall@5가 가장 낮은 것은 무엇인가?',
      o: ['원 쿼리만', 'HyDE', 'Step-Back'], a: 0,
      why: '원 쿼리만은 50%이고 나머지 셋은 100%다. 대신 HyDE·Multi-Query·Step-Back은 모두 LLM 호출이 1회씩 더 든다.' },
  ];
  const summary = [
    '짧은 질문을 그대로 검색하면 문서와 어휘가 달라 정답 2개 중 1개만 잡혔다. recall@5는 50%다.',
    'HyDE는 LLM이 쓴 가상 답변을 임베딩해 문서 쪽 단어로 검색한다.',
    'Multi-Query는 표현을 바꾼 질문 3개로 각각 찾아 합치고, Step-Back은 추상 질문으로 배경 문서를 더한다.',
    '세 방법 모두 이 예시에서 recall@5 100%를 냈고, 대가로 LLM 호출이 1회 늘어난다.',
  ];
  const review = [
    { q: '사내 매뉴얼 검색에서 사용자 질문은 짧고 문서는 길게 풀어 쓴 답변형이다. 먼저 해 볼 전략은?',
      o: ['원 쿼리를 그대로 쓰고 k만 늘린다', 'HyDE로 가상 답변을 만들어 검색한다', 'Step-Back으로 질문을 더 추상화한다'], a: 1,
      why: '짧은 질문과 긴 답변형 문서 사이의 어휘 차이가 원인이다. 가상 답변은 문서와 같은 말투와 단어로 쓰여 그 차이를 메운다.' },
    { q: 'HyDE를 붙였더니 엉뚱한 문서가 가끔 1위로 올라온다. 먼저 의심할 것은?',
      o: ['LLM이 쓴 가상 답변에 틀린 내용이 섞였다', '임베딩 모델 차원이 작다', '정답 문서가 인덱스에서 지워졌다'], a: 0,
      why: '가상 답변은 정확하지 않아도 되는 가짜 답이라 환각이 검색어로 그대로 들어간다. 비교표의 HyDE 약점이 바로 이것이다.' },
    { q: 'Multi-Query 결과가 매번 6건, 7건으로 들쭉날쭉하다. 왜 그런가?',
      o: ['MultiQueryRetriever가 점수 상위 5건만 돌려주기 때문이다', 'FAISS 인덱스가 매번 바뀌기 때문이다', '변형 질문마다 top-k를 모아 중복만 빼고 합치기 때문이다'], a: 2,
      why: '변형 3개 × k=3이면 최대 9건이고, 겹치는 문서만큼 줄어든다. 이 장 예시는 중복 3건이 빠져 6건이 되었다.' },
  ];

  R.page({ title: '질문 바꿔 검색하기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
