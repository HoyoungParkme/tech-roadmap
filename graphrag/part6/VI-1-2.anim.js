/* VI-1-2 추출 파이프라인 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   stable_id 결과(company:삼성전자 · company:samsungelectronics · company:삼성)와 dup_rate(9200, 2700) = 0.7065 는 고친 코드를 Python 3.12 로 실행한 값이다.
   CREATE 두 번 = 노드 6 / MERGE 두 번 = 노드 3 은 같은 멘션 3건을 두 번 넣어 세어 확인했다.
   문서·청크·멘션 수(320 · 1,840 · 9,200 · 4,100 · 2,700)와 Company 312 · CEO_OF 289, LLM 추출 결과는 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, check, cross, hbar, snippet, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const exam = (x, y, op) => pill(x, y, '예시', WARN, 1, { fs: 13.5, op: op ?? 1 });
  const TY = { Company: [INFO, INFOBG], Person: [ACC, ACCBG], Location: [GOOD, GOODBG], X: [MUT, PANEL] };
  function node(x, y, name, o) { o = o || {}; const [col, bg] = TY[o.t || 'X'], s = o.s ?? 1; if (s <= 0.02) return 0; const w = Math.max(64, tw(name, o.fs || 14.5) + 24), g = G(x, y, s, o.op);
    el('rect', { x: -w / 2, y: -17, width: w, height: 34, rx: 17, fill: o.fill || bg, stroke: o.stroke || col, 'stroke-width': o.hot ? 3 : 2, 'stroke-dasharray': o.dash }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': o.fs || 14.5, 'font-weight': 700, fill: o.color || INK, class: o.mono ? 'mono' : null }, g);
    if (o.tag) mono(0, -25, o.tag, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700 }, g); return w; }
  function arc(a, b, u, rel, o) { o = o || {}; if (u <= 0) return; const [x1, y1, w1 = 80] = a, [x2, y2, w2 = 80] = b, dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const pad = (w) => Math.min(Math.abs(ux) > 1e-3 ? (w / 2) / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-3 ? 17 / Math.abs(uy) : 1e9) + 3;
    const sx = x1 + ux * pad(w1), sy = y1 + uy * pad(w1), ex = x2 - ux * pad(w2), ey = y2 - uy * pad(w2); grow(sx, sy, ex, ey, u, o.col || MUT, { sw: o.sw || 2.2, dash: o.dash });
    if (rel && u > 0.6) { const mx = (sx + ex) / 2 + (o.lx || 0), my = (sy + ey) / 2 + (o.ly || 0), w = tw(rel, 13.5) + 10, op = seg(u, 0.6, 1);
      el('rect', { x: mx - w / 2, y: my - 11, width: w, height: 22, rx: 4, fill: PANEL, opacity: op }); mono(mx, my + 5, rel, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.col || INK, 'font-weight': 700, opacity: op }); } }

  // ---------- 1. 6단 공정 ----------
  const ST = [['문서 수집', '320 docs'], ['청킹', '1,840 chunks'], ['개체 인식', '9,200 mentions'], ['관계 추출', '4,100 triples'], ['중복 해소', '2,700 entities'], ['그래프 적재', 'Neo4j']];
  function glyph(i, x, y, op) { // 공정마다 다른 작은 그림
    if (i === 0) [0, 6, 12].forEach((d) => el('rect', { x: x - 14 + d, y: y - 18 + d * 0.6, width: 22, height: 28, rx: 3, fill: PANEL, stroke: INFO, 'stroke-width': 1.6, opacity: op }));
    if (i === 1) { [0, 1, 2].forEach((j) => el('rect', { x: x - 20 + j * 14, y: y - 12, width: 11, height: 24, rx: 2, fill: ACCBG, stroke: ACC, 'stroke-width': 1.4, opacity: op })); }
    if (i === 2) { el('rect', { x: x - 20, y: y - 9, width: 40, height: 18, rx: 9, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6, opacity: op }); mono(x, y + 5, 'ORG', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: op }); }
    if (i === 3) { el('circle', { cx: x - 14, cy: y, r: 7, fill: ACCBG, stroke: ACC, opacity: op }); el('circle', { cx: x + 14, cy: y, r: 7, fill: INFOBG, stroke: INFO, opacity: op }); el('line', { x1: x - 7, y1: y, x2: x + 7, y2: y, stroke: INK, 'stroke-width': 2, opacity: op }); }
    if (i === 4) { [-12, 0, 12].forEach((d) => el('circle', { cx: x + d * 0.6, cy: y + (d ? -6 : 6), r: 6, fill: WARNBG, stroke: WARN, opacity: op * 0.7 })); el('circle', { cx: x + 16, cy: y, r: 8, fill: GOODBG, stroke: GOOD, opacity: op }); }
    if (i === 5) { [[-14, -8], [10, -12], [0, 10], [16, 8]].forEach(([dx, dy], j, a) => { if (j) el('line', { x1: x + a[0][0], y1: y + a[0][1], x2: x + dx, y2: y + dy, stroke: MUT, opacity: op }); }); [[-14, -8], [10, -12], [0, 10], [16, 8]].forEach(([dx, dy]) => el('circle', { cx: x + dx, cy: y + dy, r: 5, fill: INFOBG, stroke: INFO, opacity: op })); } }
  function s1(t, c) { const { k, u } = c; const n = ((c.beat.pipeline || {}).stages || []).length, pn = c.prev ? ((c.prev.pipeline || {}).stages || []).length : 0;
    const X = (i) => 85 + i * 158, Y = 150;
    el('line', { x1: 50, y1: Y + 46, x2: 910, y2: Y + 46, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    ST.forEach(([nm, out], i) => { if (i >= n) return; const now = i >= pn, s = now ? pop(u, 0.2 + (i - pn) * 0.4) : 1; if (s <= 0.02) return;
      card(X(i), Y, 120, 72, { rx: 10, stroke: k === 5 && (i === 1 || i === 4) ? BAD : INK, sw: 2, s }); glyph(i, X(i), Y - 8, s);
      tx(X(i), Y + 26, nm, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: s }); mono(X(i), Y - 50, out, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: now ? fade(u, 0.5 + (i - pn) * 0.4) : 1 });
      if (i && k >= 3) { const gx = (X(i - 1) + X(i)) / 2, s2 = k === 3 ? pop(u, 0.3 + i * 0.15) : 1; el('path', { d: `M${gx},${Y + 34} l11,12 l-11,12 l-11,-12 z`, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, transform: `translate(${gx * (1 - s2)} ${(Y + 46) * (1 - s2)}) scale(${s2})` }); } });
    if (k <= 2) for (let i = 0; i < 6; i++) dot([[40, Y + 46], [X(Math.max(0, n - 1)) + 60, Y + 46]], ((t * 0.4 + i / 6) % 1), INFO, 5);
    if (k === 0) tx(480, 300, '통과한 것만 하류로 보낸다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1) });
    if (k === 1) { mono(240, 300, 'Mention(text, type, doc_id, span)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); tx(240, 328, '청크로 잘라 둬야 위치를 적을 수 있다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 2) { mono(240, 300, 'Triple(subj, rel, obj, evidence)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); tx(240, 328, '근거 문장이 없으면 환각으로 보고 떨군다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); }
    if (k === 3) tx(480, 300, '공정 사이마다 게이트 · gate_chunks · gate_extraction', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
    if (k === 4) { tx(480, 300, '마지막 게이트는 그래프 자체 검증 · verify_graph', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); }
    if (k === 5) { card(240, 330, 330, 48, { rx: 8, stroke: BAD, fill: BADBG, sw: 2, text: '반토막 문장 → 관계 추출이 헛것을 잡는다', fs: 14, s: pop(u, 0.4) });
      card(720, 330, 330, 48, { rx: 8, stroke: BAD, fill: BADBG, sw: 2, text: '정규화 생략 → 한 회사가 노드 3개로', fs: 14, s: pop(u, 0.9) }); }
    if (k <= 1) exam(900, 60, 1); }

  // ---------- 2. spaCy vs LLM 추출 ----------
  const SENT = [['삼성전자', ACC], ['는 ', null], ['2024년 3월', WARN], [' ', null], ['한종희', ACC], [' 부회장을 대표이사로 선임했다. 이 회사는 ', null], ['수원', ACC], ['에 본사를 둔다.', null]];
  function sentence(y, hl) { R.spans(60, y, SENT.map(([s0, col]) => [s0, col ? { fill: hl ? col : INK, 'font-weight': 700 } : {}]), { class: null, 'font-size': 15 }); }
  function s2(t, c) { const { k, u } = c; sentence(70, k >= 2 ? 1 : 0); exam(900, 64);
    // 왼쪽: spaCy
    tx(60, 130, 'spaCy NER', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    [['삼성전자', 'ORG'], ['2024년 3월', 'DATE'], ['한종희', 'PERSON'], ['수원', 'LOC']].forEach(([s0, ty], i) => { const y = 168 + i * 40; mono(60, y, s0, { 'font-size': 14.5 }); pill(250, y - 5, ty, MUT, 1, { mono: true, fs: 13.5 }); });
    tx(60, 340, '관계는 못 뽑는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD });
    el('line', { x1: 330, y1: 110, x2: 330, y2: 400, stroke: GRID, 'stroke-width': 2 });
    tx(360, 130, 'LLM 구조화 추출 · emit_graph', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 0) { ['Company', 'Person', 'Product', 'Location'].forEach((s0, i) => pill(420 + i * 120, 190, s0, ACC, pop(u, 0.2 + i * 0.2), { fs: 14 })); ['CEO_OF', 'HEADQUARTERED_IN', 'MAKES'].forEach((s0, i) => pill(440 + i * 165, 250, s0, INFO, pop(u, 1.0 + i * 0.2), { mono: true, fs: 13.5 }));
      tx(640, 320, 'VI-1-1 온톨로지 = 추출 계약서', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { el('rect', { x: 360, y: 160, width: 560, height: 150, rx: 8, fill: INK, opacity: fade(u, 0.2) });
      ['tools=[EXTRACT_TOOL]', 'input_schema: {', '  entities: [{text, type}],', '  relations: [{subj, rel, obj, evidence}] }'].forEach((l, i) => mono(378, 190 + i * 30, l, { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 0.4 + i * 0.3) }));
      tx(640, 350, '자유 텍스트 대신 도구 입력 형식으로 답한다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k2~: 추출된 그래프
    const H = [450, 230, 'Person'], S = [700, 180, 'Company'], W = [820, 290, 'Location'];
    const wH = node(H[0], H[1], '한종희', { t: 'Person', tag: 'Person', s: k === 2 ? pop(u, 0.3) : 1 }), wS = node(S[0], S[1], '삼성전자', { t: 'Company', tag: 'Company', s: k === 2 ? pop(u, 0.6) : 1 }), wW = node(W[0], W[1], '수원', { t: 'Location', tag: 'Location', s: k === 2 ? pop(u, 0.9) : 1 });
    if (k === 2) { tx(640, 360, '타입은 enum 안에서만 · 스키마 밖 타입은 생길 수 없다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    arc([H[0], H[1], wH], [S[0], S[1], wS], k === 3 ? seg(u, 0.2, 0.9) : 1, 'CEO_OF', { col: ACC, ly: -14 }); arc([S[0], S[1], wS], [W[0], W[1], wW], k === 3 ? seg(u, 0.7, 1.4) : 1, 'HEADQUARTERED_IN', { col: INFO, lx: 40 });
    if (k === 3) { tx(360, 360, 'evidence: "한종희 부회장을 대표이사로 선임했다"', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k >= 4) { el('rect', { x: 340, y: 320, width: 590, height: 92, rx: 8, fill: PANEL, stroke: GRID });
      const rows = k === 4 ? [['속도 / 비용', 'ms · 거의 무료', '초 단위 · 토큰비'], ['관계 추출', '불가', '강함']] : [['도메인 타입', '재학습 필요', '프롬프트로 즉시'], ['환각 위험', '없음(결정적)', '근거 검증 필요']];
      rows.forEach(([a, b, c0], i) => { const y = 350 + i * 34, s = fade(u, 0.3 + i * 0.4); tx(356, y, a, { 'font-size': 14, 'font-weight': 700, opacity: s }); tx(520, y, 'spaCy ' + b, { 'font-size': 14, opacity: s }); tx(730, y, 'LLM ' + c0, { 'font-size': 14, fill: ACC, opacity: s }); });
      if (k === 4) mono(360, 300, 'tool_choice → emit_graph', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      if (k === 5) { grow(260, 300, 345, 250, seg(u, 0.3, 0.9), ACC); tx(60, 395, '애매하거나 관계가 필요한 청크만 LLM 으로', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) }); } } }

  // ---------- 3. 중복 해소 ----------
  const FR = [['삼성전자', 2, 140, 130], ['Samsung Electronics', 1, 140, 210], ['삼성', 1, 140, 290], ['삼성전자(주)', 1, 140, 370]];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { FR.forEach(([nm, r, x, y], i) => { node(x + 60, y, nm, { t: 'Company', s: pop(u, 0.2 + i * 0.2) }); mono(x + 230, y + 5, `관계 ${r}`, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.2) }); });
      mono(560, 150, 'LEGAL_SUFFIX = ["(주)", "주식회사",', { 'font-size': 14.5, opacity: fade(u, 1.4) }); mono(560, 176, '  "inc", "corp", "ltd", "co"]', { 'font-size': 14.5, opacity: fade(u, 1.5) });
      tx(700, 300, '"삼성의 대표는?" 에 반쪽 답만 나온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 1 || k === 2) { const rows = [['삼성전자', 'company:삼성전자'], ['Samsung Electronics', 'company:samsungelectronics'], ['삼성', 'company:삼성'], ['삼성전자(주)', 'company:삼성전자'], ['Costco Inc', 'company:costco']];
      tx(60, 80, k === 1 ? 'normalize_name · 소문자 → 끝 접미사 → 공백' : 'stable_id = 타입 + 정규화 이름 (실행 결과)', { 'font-size': 15, 'font-weight': 700 });
      rows.forEach(([a, b], i) => { const y = 130 + i * 52, s = fade(u, 0.2 + i * 0.25), same = b === 'company:삼성전자';
        mono(60, y, a, { 'font-size': 15, opacity: s }); grow(270, y - 5, 330, y - 5, seg(u, 0.4 + i * 0.25, 0.7 + i * 0.25), MUT); mono(345, y, k === 1 ? b.replace('company:', '') : b, { 'font-size': 15, 'font-weight': 700, fill: same ? ACC : INK, opacity: s }); });
      if (k === 1) { tx(700, 330, '예전 코드는 "costco" 의 co 까지 지웠다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) }); mono(700, 356, '"Costco Inc" → "st"', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2) }); }
      else tx(700, 330, '언제 돌려도 같은 개체는 같은 키', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { const B = [['company:삼성전자', ['삼성전자', '삼성전자(주)']], ['company:samsungelectronics', ['Samsung Electronics']], ['company:삼성', ['삼성']]];
      B.forEach(([key, ms], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3); el('path', { d: `M${x - 120},150 L${x - 100},330 H${x + 100} L${x + 120},150`, fill: i === 0 ? ACCBG : SOFT, stroke: i === 0 ? ACC : GRID, 'stroke-width': 2, opacity: s });
        mono(x, 130, key, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: i === 0 ? ACC : INK, opacity: s }); ms.forEach((m, j) => node(x, 220 + j * 50, m, { t: 'Company', s: pop(u, 0.6 + i * 0.3 + j * 0.2), fs: 14 })); });
      tx(480, 380, '규칙으로 4조각 → 버킷 3개 · 관계 3개가 한 버킷에', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k4~5 임베딩 병합 → 표준 노드
    const m = k === 4 ? E(u, 0.6, 1.6) : 1, cx = 480, cy = 210;
    [['Samsung Electronics', 200, 120], ['삼성', 200, 300], ['삼성전자(주)', 760, 300]].forEach(([nm, x, y], i) => { if (m >= 0.98) return; node(lerp(x, cx, m), lerp(y, cy, m), nm, { t: 'Company', op: 1 - m * 0.5 }); });
    if (k === 4 && u < 1.6) { mono(200, 220, 'cos ≥ 0.88', { 'font-size': 15, fill: WARN, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); exam(200, 250, fade(u, 0.3)); }
    node(cx, cy, '삼성전자', { t: 'Company', hot: m > 0.95, tag: 'company:삼성전자' }); if (m > 0.95) mono(cx, cy + 46, '관계 5 · 별칭 3', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    if (k === 5) { R.meters(250, 300, 460, [{ name: 'mentions → entities', val: '9,200 → 2,700' }, { name: 'dup_rate', val: '0.7065', bar: 70.65 }]);
      tx(480, 410, '예상 범위(< 0.75)를 벗어나면 적재를 막는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) }); } }

  // ---------- 4. MERGE 적재와 검증 ----------
  function s4(t, c) { const { k, u } = c; const checks = (c.beat.load || {}).checks || [];
    // 오른쪽: 검증 목록 (페이지 데이터)
    el('rect', { x: 600, y: 60, width: 330, height: 330, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); tx(616, 86, '검증 쿼리', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    checks.forEach((ch, i) => { const y = 122 + i * 52, isNew = !c.prev || !((c.prev.load || {}).checks || []).some((p) => p.name === ch.name), s = isNew ? fade(u, 0.6) : 1;
      check(626, y - 5, 8, s > 0.5 ? 1 : 0); tx(644, y, ch.name, { 'font-size': 14, 'font-weight': 700, opacity: s }); mono(912, y, ch.val, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: GOOD, opacity: s }); });
    if (k === 4) exam(880, 370, fade(u, 0.8));
    if (k === 0) { el('rect', { x: 40, y: 110, width: 520, height: 72, rx: 8, fill: INK }); mono(56, 140, 'CREATE CONSTRAINT IF NOT EXISTS', { 'font-size': 14.5, fill: 'var(--term)' }); mono(56, 166, 'FOR (n:Entity) REQUIRE n.id IS UNIQUE', { 'font-size': 14.5, fill: PANEL, opacity: fade(u, 0.5) });
      lock(300, 260, true, ACC, pop(u, 1.0)); tx(300, 320, '중복 키는 DB 단에서 막힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 1) { tx(160, 90, 'CREATE × 2', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); tx(440, 90, 'MERGE × 2', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      const ids = ['삼성전자', '한종희', '수원'], second = E(u, 0.8, 1.8);
      ids.forEach((nm, i) => { node(160, 140 + i * 50, nm, { fs: 14 }); node(440, 140 + i * 50, nm, { fs: 14, hot: second > 0.5 }); if (second > 0) node(160, 290 + i * 40, nm, { fs: 14, s: pop(u, 0.8 + i * 0.2), stroke: BAD, color: BAD }); });
      mono(160, 408, Math.round(3 + 3 * Math.min(1, second * 1.5)) + ' 노드', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); mono(440, 408, '3 노드', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); return; }
    if (k === 2) { const a = [140, 200], b = [440, 200]; const wa = node(a[0], a[1], '한종희', { t: 'Person' }), wb = node(b[0], b[1], '삼성전자', { t: 'Company' });
      arc([...a, wa], [...b, wb], seg(u, 0.2, 0.9), 'REL {type:CEO_OF}', { col: ACC, ly: -16 }); if (u > 1.4) arc([a[0], a[1] + 4, wa], [b[0], b[1] + 4, wb], 1, null, { col: ACC, dash: '5 5' });
      tx(290, 300, '같은 관계를 다시 넣어도 엣지는 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { const P = [[120, 140], [230, 110], [300, 200], [180, 230], [400, 150], [420, 260], [260, 320]]; const E2 = [[0, 1], [1, 2], [0, 3], [2, 4], [4, 5], [3, 6], [5, 6]];
      E2.forEach(([a, b]) => el('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: GRID, 'stroke-width': 2 })); P.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 11, fill: INFOBG, stroke: INFO, 'stroke-width': 2 }));
      el('circle', { cx: 500, cy: 340, r: 11 * (1 - E(u, 0.8, 1.4)), fill: BADBG, stroke: BAD, 'stroke-width': 2 }); tx(500, 372, u < 1.4 ? '고아?' : '', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
      mono(60, 400, 'assert orphans == 0', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { [['Company', 312, INFO], ['CEO_OF', 289, ACC]].forEach(([nm, v, col], i) => { const y = 150 + i * 90; tx(60, y + 14, nm, { 'font-size': 15, 'font-weight': 700 }); hbar(180, y, 280, v * E(u, 0.2 + i * 0.3, 1.2 + i * 0.3), 400, { col, h: 24, text: String(v) }); });
      tx(60, 360, '예상 범위를 벗어나면 서비스에 붙이지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    const P = [[120, 160], [220, 120], [300, 210], [170, 260]]; [[0, 1], [1, 2], [0, 3], [2, 3]].forEach(([a, b]) => el('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: GRID, 'stroke-width': 2 })); P.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 11, fill: INFOBG, stroke: INFO, 'stroke-width': 2 }));
    [[420, 150], [470, 250]].forEach(([x, y], i) => { const s = pop(u, 0.6 + i * 0.3); el('circle', { cx: x, cy: y, r: 11 * s, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); el('line', { x1: 300, y1: 210, x2: lerp(300, x, s), y2: lerp(210, y, s), stroke: GOOD, 'stroke-width': 2 }); });
    tx(290, 340, '오늘 문서만 추출해 같은 load_to_neo4j 로 얹는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); }

  // ---------- 5. 세 갈래 길 ----------
  const RD = [['직접 조립', 'spaCy + LLM + Neo4j', ACC], ['MS GraphRAG', 'graphrag index', INFO], ['LlamaIndex KG', 'KnowledgeGraphIndex', GOOD]];
  function s5(t, c) { const { k, u } = c; const shown = Math.min(k + 1, 3);
    R.dbIcon(70, 220, '문서', { s: 0.7 }); R.dbIcon(880, 220, '그래프', { s: 0.7, stroke: ACC });
    RD.forEach(([nm, how, col], i) => { if (i >= shown) return; const y = 110 + i * 110, now = i === shown - 1 && k <= 2, g = now ? E(u, 0.2, 1.4) : 1;
      el('path', { d: `M110,220 C200,220 200,${y} 300,${y} H660 C760,${y} 760,220 840,220`, fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-dasharray': '1000', 'stroke-dashoffset': 1000 * (1 - g) });
      card(480, y, 240, 52, { rx: 10, stroke: col, sw: 2, text: nm + '\n' + how, fs: 14, s: now ? pop(u, 0.8) : 1 }); });
    if (k === 0) tx(480, 400, '청킹·추출·병합·적재를 우리 손으로 · 통제력 최고', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
    if (k === 1) tx(480, 400, '추출 → 커뮤니티 탐지(Leiden) → 계층 요약까지 자동', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
    if (k === 2) tx(480, 400, 'StorageContext 로 Neo4jGraphStore 를 물린다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
    if (k === 3) {
      tx(480, 400, 'LlamaIndex 의 손잡이는 max_triplets_per_chunk=5 정도', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1) });
      ['통제력 ◎', '손품 ◎', '통합 ◎'].forEach((s0, i) => pill(660 + 0, 110 + i * 110, s0, RD[i][2], pop(u, 0.3 + i * 0.3), { fs: 13.5 })); }
    if (k >= 4) { const recos = [['도메인 스키마·통제', 0], ['대규모 요약형 탐색', 1], ['빠른 통합·프로토타입', 2]];
      recos.forEach(([w, i], j) => pill(185, 110 + i * 110, w, RD[i][2], k === 4 ? pop(u, 0.3 + j * 0.3) : 1, { fs: 13.5 }));
      if (k === 5) banner(480, 405, 'RAG 관점의 선택은 rag VIII-1-2 에서', pop(u, 0.4)); } }

  const quiz = [
    { q: '6단 파이프라인에서 각 공정 뒤에 게이트를 두는 까닭은 무엇인가?',
      o: ['앞 공정의 불량이 뒤 공정을 그대로 오염시키기 때문에', 'LLM 호출 수를 늘리려고', '문서 수를 320건으로 맞추려고'], a: 0,
      why: '반토막 문장은 엉뚱한 관계를, 정규화 생략은 쪼개진 노드를 만든다. 통과한 것만 하류로 보낸다.' },
    { q: 'emit_graph 도구 스키마에서 rel을 enum으로 묶은 효과는 무엇인가?',
      o: ['추출 속도가 spaCy 만큼 빨라진다', '온톨로지에 없는 관계 이름이 나올 수 없다', '근거 문장이 자동으로 붙는다'], a: 1,
      why: 'rel은 CEO_OF, HEADQUARTERED_IN, MAKES 중 하나만 된다. 근거는 required에 evidence를 넣어야 강제된다.' },
    { q: '고친 normalize_name에서 "삼성전자(주)" 와 같은 stable_id를 갖는 이름은 무엇인가?',
      o: ['Samsung Electronics', '삼성', '삼성전자'], a: 2,
      why: '맨 끝 (주)만 떼면 둘 다 company:삼성전자 가 된다. Samsung Electronics와 삼성은 임베딩 단계에서 붙는다.' },
    { q: '같은 문서로 적재를 두 번 돌렸을 때 CREATE와 MERGE의 노드 수 차이는 무엇인가?',
      o: ['CREATE는 6개로 늘고 MERGE는 3개 그대로다', '둘 다 3개다', 'MERGE가 6개가 된다'], a: 0,
      why: 'MERGE는 있으면 재사용한다. 그래서 몇 번을 돌려도 결과가 같고 증분 갱신이 안전하다.' },
    { q: '문서 전체를 아우르는 요약형 질문이 주력인 대규모 코퍼스에 맞는 길은 무엇인가?',
      o: ['LlamaIndex KG', '직접 조립', 'MS GraphRAG'], a: 2,
      why: 'MS GraphRAG는 커뮤니티 탐지와 계층 요약까지 자동으로 만들어 글로벌 질문에 강하다. 대신 호출이 많아 비싸다.' },
  ];

  const summary = [
    '지식그래프는 수집, 청킹, 개체 인식, 관계 추출, 중복 해소, 적재 여섯 공정을 게이트로 나눠 만든다.',
    'spaCy는 싸고 빠르지만 관계를 못 뽑고, LLM은 온톨로지를 enum으로 묶은 도구 스키마로 개체와 관계를 함께 뽑는다.',
    '규칙 정규화와 임베딩 병합, 안정 ID로 삼성전자 네 조각을 관계 5개짜리 노드 하나로 모은다.',
    'MERGE로 적재하면 다시 돌려도 결과가 같고, 고아 노드와 타입별 통계를 검증한 뒤에 서비스에 붙인다.',
  ];
  const review = [
    { q: '적재 뒤 "삼성의 대표는?" 에 답이 절반만 나온다. 그래프를 보니 삼성 관련 노드가 여러 개다. 먼저 손볼 공정은?',
      o: ['정규화·중복 해소의 규칙과 임계값', '문서 수집의 인코딩 검사', 'Neo4j 커넥션 풀'], a: 0,
      why: '표기가 다른 동일 회사가 따로 남으면 관계가 흩어진다. 접미사 규칙과 임베딩 병합 임계값을 다시 본다.' },
    { q: '매일 밤 같은 문서 묶음이 다시 적재되는데 노드 수가 날마다 늘어난다. 의심할 곳은?',
      o: ['spaCy 모델 버전', 'MERGE 대신 CREATE를 쓰거나 키 라벨이 제약과 다르다', 'max_triplets_per_chunk'], a: 1,
      why: 'MERGE와 UNIQUE 제약이 같은 라벨·키를 봐야 멱등이 된다. CREATE는 돌릴 때마다 새 노드를 만든다.' },
    { q: 'LLM 추출 결과에 문서에 없는 관계가 섞여 들어온다. 파이프라인에서 막을 방법은?',
      o: ['청크 크기를 두 배로 키워 문맥을 늘린다', 'tool_choice를 끄고 자유 텍스트로 받는다', 'evidence를 필수로 받고 근거 없는 트리플을 떨군다'], a: 2,
      why: '근거 문장이 없는 관계는 환각으로 본다. 스키마의 required와 gate_extraction이 함께 막는다.' },
  ];

  R.page({ title: '추출 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
