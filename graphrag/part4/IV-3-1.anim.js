/* IV-3-1 평가 지표 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * judge LLM이 매기는 점수는 예시다. 1/2 · 2/3 · precision@2 같은 비율은 RAGAS 정의대로 센 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, BAD, GOOD, WARN, INFO } = C;

  // 질문·답 상자
  function qa(q, a, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return;
    zone(24, 18, 912, 84, null, { fill: SOFT, op: clamp(s) });
    tx(42, 50, 'Q', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: s }); tx(70, 50, q, { 'font-size': 16, 'font-weight': 700, opacity: s });
    tx(42, 84, 'A', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: s });
    if (o.parts) { let x = 70; o.parts.forEach(([t, col]) => { const e = tx(x, 84, t, { 'font-size': 16, fill: col || INK, 'font-weight': col ? 800 : 500, style: 'white-space:pre', opacity: s }); let w = 0; try { w = e.getComputedTextLength(); } catch (err) { w = 0; } x += w || tw(t, 16) * 0.9;
      if (col === BAD) el('line', { x1: x - (w || tw(t, 16) * 0.9), y1: 90, x2: x, y2: 90, stroke: BAD, 'stroke-width': 2.5, opacity: s * (o.mark ?? 1) }); }); }
    else tx(70, 84, a, { 'font-size': 16, opacity: s }); }
  // 지표 게이지: 값 v(0~1), 임계치 th
  function gauge(x, y, w, name, v, th, o) { o = o || {}; const bad = v != null && v < th, col = v == null ? OFF : bad ? (o.warn ? WARN : BAD) : GOOD;
    tx(x, y - 10, name, { 'font-size': 15, 'font-weight': 800 });
    mono(x + w, y - 10, v == null ? '—' : v.toFixed(2), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: col });
    el('rect', { x, y, width: w, height: 18, rx: 5, fill: SOFT });
    if (v != null && v > 0) el('rect', { x, y, width: w * clamp(v), height: 18, rx: 5, fill: col });
    if (th != null) { const tx0 = x + w * th; el('line', { x1: tx0, y1: y - 5, x2: tx0, y2: y + 23, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' });
      mono(tx0, y + 40, '임계 ' + th.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } }
  // 작은 그래프 조각 (contexts)
  function gnode(x, y, name, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const col = o.col || INK, w = Math.max(80, tw(name, 15) * 0.9 + 26);
    card(x, y, w, 38, { rx: 19, stroke: col, sw: o.dash ? 2 : 2.5, dash: o.dash, fill: o.fill || PANEL, text: name, fs: 15, fw: 800, color: col, s }); }
  function gedge(x1, y1, x2, y2, label, g, o) { o = o || {}; if (g <= 0) return; const col = o.col || INK;
    el('line', { x1, y1, x2: lerp(x1, x2, g), y2: lerp(y1, y2, g), stroke: col, 'stroke-width': 2.8, 'stroke-dasharray': o.dash, 'marker-end': g > 0.98 && !o.dash ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
    if (label && g > 0.7) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 8, w = tw(label, 13.5) + 10; el('rect', { x: mx - w / 2, y: my - 13, width: w, height: 19, rx: 4, fill: PANEL });
      mono(mx, my + 1, label, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700 }); } }
  const imp = (u, s1, s2) => { pill(300, 220, s1, ACC, pop(u, 0.3), { mono: true, fs: 15 }); if (s2) pill(640, 220, s2, INK, pop(u, 0.7), { mono: true, fs: 15 }); };

  // 1. Faithfulness
  const A1 = [['잡스는 1976년 워즈니악과 애플을, '], ['1986년 MS도 공동 창업했다.', BAD]];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { imp(u, 'ragas.metrics.faithfulness', 'datasets.Dataset'); sub(480, 290, '답의 주장이 그래프 근거에서 나오는가', fade(u, 1.2), { 'font-size': 16 }); return; }
    qa('잡스가 공동 창업한 회사는?', null, { parts: A1, s: k === 1 ? pop(u, 0.2) : 1, mark: k === 1 ? fade(u, 1.2) : 1 });
    // contexts 그래프
    const gs = k === 1 ? 0 : 1, g = k === 2 ? E(u, 0.3, 1.3) : 1;
    if (k >= 2) { zone(24, 120, 470, 290, 'contexts (그래프 traverse 결과)', { fill: PANEL, stroke: GRID, sw: 1.5 });
      gnode(110, 260, 'Jobs', { s: gs }); gnode(400, 260, 'Apple', { col: ACC, s: gs }); gnode(110, 370, 'Wozniak', { s: gs });
      gedge(152, 260, 356, 260, 'founded:1976', g); gedge(150, 360, 360, 276, 'co_founded', k === 2 ? E(u, 0.7, 1.7) : 1);
      gnode(400, 170, 'Microsoft', { col: OFF, dash: '5 4', s: k === 2 ? fade(u, 1.8) : 1 });
      el('line', { x1: 146, y1: 246, x2: 346, y2: 180, stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '5 5', opacity: k === 2 ? fade(u, 2) : 1 });
      tx(236, 196, '엣지 없음', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 2.1) : 1 }); }
    if (k === 3) { tx(530, 160, 'ground_truth', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.2) });
      tx(530, 190, '잡스는 워즈니악과 함께 애플을 공동 창업했다.', { 'font-size': 15, opacity: fade(u, 0.5) });
      card(720, 270, 300, 56, { rx: 10, stroke: INK, sw: 2, text: 'Dataset.from_list([sample]) · 1건', fs: 14.5, mono: true, s: pop(u, 1.2) }); }
    if (k >= 4) { const v = k === 4 ? lerp(0, 0.5, E(u, 0.5, 1.8)) : 0.5; gauge(530, 170, 380, 'faithfulness', k === 4 && u < 0.5 ? null : v, 0.85);
      if (k === 4) mono(530, 268, 'evaluate(ds, metrics=[faithfulness])', { 'font-size': 14, opacity: fade(u, 0.2) }); }
    if (k === 5) { banner(720, 290, 'hallucination 알람 · 0.50 < 0.85', pop(u, 0.4)); sub(720, 336, '배포를 막는다', fade(u, 1), { 'font-size': 15 }); }
    if (k === 6) { [['잡스가 워즈니악과 애플 공동 창업', true], ['1986년 MS 공동 창업', false]].forEach(([s, ok], i) => { const y = 270 + i * 44, op = fade(u, 0.3 + i * 0.6);
        tx(560, y, s, { 'font-size': 15, 'font-weight': 700, fill: ok ? INK : BAD, opacity: op }); if (ok) check(540, y - 5, 8, pop(u, 0.5)); else cross(540, y - 5, 8, pop(u, 1.1)); });
      el('rect', { x: 62, y: 238, width: 386, height: 44, rx: 22, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.5) });
      mono(560, 372, 'supported / total = 1/2 = 0.50', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); } }

  // 2. Answer Relevancy
  const A2 = [['애플은 '], ['1976년', WARN], ['에 '], ['캘리포니아', WARN], ['에서 만들어진 회사이다.']];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { imp(u, 'ragas.metrics.answer_relevancy'); sub(480, 290, '사실 여부가 아니라 질문에 맞게 답했는가', fade(u, 1), { 'font-size': 16 }); return; }
    qa('애플의 창업자는 누구인가?', null, { parts: A2, s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { tx(480, 200, '"누구"를 물었는데 답은 연도와 위치만 말한다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) });
      sub(480, 236, '틀린 말은 없다. 초점이 다를 뿐', fade(u, 1.8), { 'font-size': 15 }); return; }
    zone(24, 120, 400, 290, 'contexts', { fill: PANEL, stroke: GRID, sw: 1.5 });
    gnode(100, 200, 'Jobs'); gnode(330, 200, 'Apple', { col: ACC }); gnode(330, 340, 'California');
    gedge(142, 200, 286, 200, 'founded', k === 2 ? E(u, 0.3, 1.2) : 1); gedge(330, 220, 330, 318, 'located_in', k === 2 ? E(u, 0.7, 1.6) : 1);
    if (k === 2) { check(70, 160, 9, pop(u, 1.8)); tx(460, 200, '검색은 창업 엣지를 가져왔다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(460, 232, '→ 문제는 생성 쪽', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); }
    if (k >= 3 && k <= 4) gauge(470, 170, 440, 'answer_relevancy (예시)', k === 3 ? lerp(0, 0.3, E(u, 0.4, 1.6)) : 0.3, 0.8);
    if (k === 4) { ['"애플은 언제 만들어졌나?"', '"애플은 어디에 있나?"'].forEach((s, i) => { const y = 280 + i * 46;
        fly(560, 84, 470, y, seg(u, 0.2 + i * 0.4, 0.9 + i * 0.4), '역질문', { fill: WARN });
        tx(560, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4) });
        tx(900, y + 5, '≠ 원 질문', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.4 + i * 0.3) }); });
      sub(690, 392, '원래 질문과 코사인 유사도가 낮다 → 평균이 점수', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 5) { gauge(470, 160, 440, 'faithfulness (예시)', 0.92, 0.85); gauge(470, 250, 440, 'answer_relevancy (예시)', 0.3, 0.8);
      tx(470, 350, '사실은 맞는데 질문을 피한다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) });
      tx(470, 382, '→ 프롬프트에 "질문에 직접 답하라"', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) }); } }

  // 3. Context Recall
  const GT = ['잡스가 애플을 공동 창업했다.', '워즈니악도 공동 창업했다.', '로널드 웨인도 공동 창업자다.'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { imp(u, 'ragas.metrics.context_recall'); sub(480, 290, '정답에 필요한 정보가 검색 결과에 다 있는가', fade(u, 1), { 'font-size': 16 }); return; }
    qa('애플 공동 창업자 3명을 모두 알려줘', '잡스, 워즈니악이 공동 창업했다.', { s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { tx(480, 210, '답은 두 명만 말한다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.8) }); sub(480, 244, '거짓은 아니지만 모자라다', fade(u, 1.3), { 'font-size': 15 }); return; }
    zone(24, 120, 420, 290, 'contexts (traverse)', { fill: PANEL, stroke: GRID, sw: 1.5 });
    const found = k === 6 ? E(u, 1, 2) : 0;
    gnode(234, 250, 'Apple', { col: ACC }); gnode(90, 170, 'Jobs'); gnode(90, 340, 'Wozniak');
    gnode(370, 340, 'Wayne', { col: found > 0.5 ? INK : OFF, dash: found > 0.5 ? null : '5 4' });
    gedge(124, 182, 192, 232, null, k === 2 ? E(u, 0.3, 1) : 1, { col: ACC }); gedge(130, 326, 194, 270, null, k === 2 ? E(u, 0.6, 1.3) : 1, { col: ACC });
    gedge(338, 326, 274, 270, null, 1, { col: found > 0.5 ? ACC : OFF, dash: found > 0.5 ? null : '5 5' });
    if (k === 2) { tx(330, 400, '웨인 엣지는 안 왔다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); mono(430, 150, '2건', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 1.3) }); }
    // 정답 문장
    if (k >= 3 && k !== 4) { tx(480, 150, 'ground_truth (3문장)', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      GT.forEach((s, i) => { const y = 190 + i * 40; tx(500, y, s, { 'font-size': 15.5, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.3 + i * 0.4) : 1 });
        if (k >= 5) { const ok = i < 2 || found > 0.5; if (ok) check(484, y - 5, 8, k === 5 ? pop(u, 0.4 + i * 0.4) : 1); else cross(484, y - 5, 8, k === 5 ? pop(u, 1.2) : 1); } }); }
    if (k === 4) gauge(480, 190, 430, 'context_recall', lerp(0, 2 / 3, E(u, 0.4, 1.6)), 0.75);
    if (k === 5) { mono(480, 340, 'supported / total = 2/3 = 0.67', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); sub(700, 380, 'missing-context 알람', fade(u, 2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
    if (k === 6) { const r = lerp(110, 150, E(u, 0.2, 1)); el('circle', { cx: 234, cy: 250, r, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0.7 });
      tx(480, 340, '처방: traverse depth 1 → 2', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) }); tx(480, 370, '또는 community 요약을 함께 가져온다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) }); } }

  // 4. Context Precision: 쓸모 있는 근거의 순위
  const CTX = ['(Jobs)-[founded]->(Apple)', '(Jobs)-[born_in]->(SanFrancisco)', '(Jobs)-[hired]->(Cook)', '(Apple)-[released]->(iPhone)', '… 6건 더'];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { imp(u, 'ragas.metrics.context_precision'); sub(480, 290, '쓸모 있는 근거가 위 순위에 있는가', fade(u, 1), { 'font-size': 16 }); return; }
    qa('잡스의 출생지는?', '잡스는 샌프란시스코에서 태어났다.', { s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { tx(480, 210, '좁은 질문, 정확한 답', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.8) }); sub(480, 244, '문제는 끌어온 자료 쪽', fade(u, 1.3), { 'font-size': 15 }); return; }
    // 순위 목록
    const up = k === 6 ? E(u, 0.3, 1.3) : 0;   // reranker: born_in을 1순위로
    const rows = k >= 3 ? CTX : CTX.slice(0, 4);
    zone(24, 116, 440, 296, k >= 3 ? 'contexts · 순위 (총 10건)' : 'contexts · 순위', { fill: PANEL, stroke: GRID, sw: 1.5 });
    rows.forEach((s, i) => { let y = 160 + i * 46; if (i === 0) y = lerp(y, y + 46, up); if (i === 1) y = lerp(y, y - 46, up);
      const useful = i === 1, more = i === 4, op = k === 6 && i >= 3 ? 1 - 0.6 * E(u, 1.5, 2.2) : 1;
      if (!more) mono(40, y + 5, String(i === 0 ? (up > 0.5 ? 2 : 1) : i === 1 ? (up > 0.5 ? 1 : 2) : i + 1), { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: op });
      card(250, y, 360, 36, { rx: 8, stroke: useful ? GOOD : more ? GRID : GRID, fill: useful ? C.GOODBG : PANEL, sw: useful ? 2.5 : 1.5, op });
      mono(84, y + 5, s, { 'font-size': 13.5, 'font-weight': useful ? 800 : 500, fill: useful ? GOOD : more ? MUT : INK, opacity: op });
      if (k >= 2 && !more) { const s0 = k === 2 ? pop(u, 0.4 + i * 0.3) : 1; if (useful) check(446, y, 8, s0); else cross(446, y, 7, s0 * op); } });
    if (k === 2) { tx(490, 200, '정답에 쓰인 건 born_in 하나', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); tx(490, 232, '그런데 2순위에 있다', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2) }); }
    if (k === 3) { tx(490, 200, '10건 중 쓸모 있는 건 1건', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5) }); tx(490, 232, '나머지 9건은 토큰만 먹는다', { 'font-size': 15.5, fill: MUT, opacity: fade(u, 1) }); }
    if (k === 4) gauge(490, 190, 420, 'context_precision', lerp(0, 0.5, E(u, 0.4, 1.6)), 0.7, { warn: true });
    if (k === 5) { mono(490, 170, 'v = [0, 1, 0, 0, …]', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(490, 210, 'precision@2 = 1/2', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9) });
      mono(490, 250, '평균(쓸모 있는 순위만) = 0.50', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.5) });
      sub(700, 300, '앞 순위에 노이즈가 끼면 점수가 깎인다', fade(u, 2), { 'font-size': 14.5 }); }
    if (k === 6) { gauge(490, 190, 420, 'reranker 뒤 precision', up > 0.5 ? 1 : 0.5, 0.7);
      tx(490, 300, '1순위로 올리면 precision@1 = 1.00', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      tx(490, 332, 'top-3 만 남겨 토큰도 줄인다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      tx(490, 380, 'hop을 넓히면 recall ↑, precision ↓', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.2) }); } }

  // 5. 4지표를 CI에
  const M = [['faithfulness', 0.95, 0.85], ['answer_relevancy', 0.92, 0.8], ['context_recall', 0.88, 0.75], ['context_precision', 0.82, 0.7]];
  function s5(t, c) { const { k, u } = c;
    const on = [k >= 1, k >= 2, k >= 2, k >= 3];
    const X = 300, W = 360;
    M.forEach(([n, v, th], i) => { const y = 74 + i * 78, fresh = (k === 1 && i === 0) || (k === 2 && (i === 1 || i === 2)) || (k === 3 && i === 3);
      const val = on[i] ? (fresh ? lerp(0, v, E(u, 0.3 + (i === 2 ? 0.4 : 0), 1.4 + (i === 2 ? 0.4 : 0))) : v) : null;
      gauge(X, y, W, n, val, k >= 5 ? th : null);
      if (k >= 5) check(X + W + 30, y + 9, 9, k === 5 ? pop(u, 0.6 + i * 0.2) : 1); });
    // 평균
    const avg = [null, 0.95, 0.92, 0.89][Math.min(k, 3)];
    zone(30, 40, 230, 120, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
    tx(46, 72, k === 0 ? 'judge 모델' : '켠 지표 평균', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k === 0) { mono(46, 106, 'gpt-4o-mini', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) }); mono(46, 136, 'text-embedding-3-small', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7) }); }
    else mono(46, 124, (k <= 3 && c.prev ? tween([null, null, 0.95, 0.92][k] ?? 0, avg, u) : 0.89).toFixed(2), { 'font-size': 34, 'font-weight': 800, fill: ACC });
    sub(145, 190, '점수는 예시', 1, { 'font-size': 13.5 });
    if (k === 4) { tx(30, 240, 'golden_qa.jsonl', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      for (let i = 0; i < 50; i++) { const s = fade(u, 0.3 + i * 0.03); el('rect', { x: 30 + (i % 10) * 22, y: 256 + Math.floor(i / 10) * 22, width: 18, height: 18, rx: 3, fill: ACC, opacity: s * 0.85 }); }
      mono(250, 384, '50문항', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.9) }); }
    if (k === 5) { banner(145, 300, 'CI 통과', pop(u, 1.6)); sub(145, 344, '하한 아래면 PR을 막는다', fade(u, 1.9), { 'font-size': 14 }); }
    if (k === 6) { card(145, 260, 220, 44, { rx: 8, stroke: INK, sw: 2, text: 'metrics.json', fs: 15, mono: true, s: pop(u, 0.3) });
      pill(90, 340, 'TruLens', INFO, pop(u, 0.9), { fs: 14 }); pill(200, 340, 'DeepEval', INFO, pop(u, 1.2), { fs: 14 });
      sub(145, 384, 'trace · pytest 쪽 대안', fade(u, 1.6), { 'font-size': 14 }); } }

  const quiz = [
    { q: '답의 주장 2개 중 1개만 그래프 근거로 설명될 때 faithfulness는 얼마인가?',
      o: ['0.50', '0.85', '1.00'], a: 0,
      why: 'faithfulness는 지지되는 주장 수를 전체 주장 수로 나눈다. 1/2 = 0.50이라 임계치 0.85 아래, hallucination 알람이 뜬다.' },
    { q: 'faithfulness는 0.92인데 answer_relevancy만 0.30일 때 먼저 고칠 곳은 어디인가?',
      o: ['그래프 traverse 깊이', '답변 생성 프롬프트', 'judge 모델'], a: 1,
      why: '검색은 창업 엣지를 제대로 가져왔고 답에 거짓도 없다. 질문을 피해 일반론으로 답한 것이니 "질문에 직접 답하라"를 넣는다.' },
    { q: '정답 문장 3개 중 2개만 contexts로 설명될 때 context_recall과 처방은?',
      o: ['0.33, 프롬프트 수정', '1.00, 처방 없음', '0.67, traverse를 넓히거나 community 요약을 함께 가져온다'], a: 2,
      why: '2/3 = 0.67로 임계치 0.75보다 낮다. 빠진 것은 웨인 엣지, 즉 검색 쪽이라 탐색 범위를 넓힌다.' },
    { q: '유일하게 쓸모 있는 근거가 2순위에 있을 때 RAGAS context_precision은 얼마인가?',
      o: ['0.10, 10건 중 1건이라서', '0.50, precision@2가 1/2라서', '1.00, 근거가 들어 있으니까'], a: 1,
      why: 'RAGAS는 쓸모 있는 순위 k의 precision@k를 평균한다. born_in이 2순위라 1/2 = 0.50이고, reranker로 1순위에 올리면 1.00이 된다.' },
    { q: '네 지표 0.95·0.92·0.88·0.82를 켰을 때 평균과 CI 판정은?',
      o: ['0.89, 네 임계치를 모두 넘어 통과', '0.82, precision이 낮아 실패', '0.95, faithfulness만 본다'], a: 0,
      why: '평균은 0.89다. 하한 0.85·0.80·0.75·0.70을 모두 넘으니 PR이 통과한다.' },
  ];

  const summary = [
    'Faithfulness는 답의 주장 중 그래프 근거가 있는 비율로, 1/2이면 0.50이다.',
    'Answer Relevancy가 낮고 Faithfulness가 높으면 답이 질문을 피한 것이다.',
    'Context Recall은 정답 문장이 검색 결과에 있는 비율이고 낮으면 탐색을 넓힌다.',
    'Context Precision은 근거의 순위를 보며, 네 지표에 하한을 두고 CI에서 돌린다.',
  ];
  const review = [
    { q: 'traverse depth를 1에서 3으로 늘렸더니 context_recall은 올랐는데 context_precision이 떨어졌다. 맞는 대응은?',
      o: ['reranker로 쓸모 있는 근거를 위로 올리고 top-k만 남긴다', 'depth를 0으로 줄인다', 'faithfulness 임계치를 낮춘다'], a: 0,
      why: '넓게 가져오면 정답 근거는 늘지만 노이즈도 앞에 섞인다. 순위를 다시 매겨 자르면 두 지표의 균형을 잡을 수 있다.' },
    { q: '답에 그래프에 없는 회사 이름이 섞여 나왔다. 어느 지표가 가장 먼저 떨어지나?',
      o: ['context_recall', 'faithfulness', 'context_precision'], a: 1,
      why: 'contexts로 뒷받침되지 않는 주장이 생긴 것이라 faithfulness가 내려간다. 검색 결과와 무관하게 생성 단계의 환각이다.' },
    { q: 'PR 하나가 context_precision을 0.82에서 0.65로 떨어뜨렸다. CI 설정대로라면 어떻게 되나?',
      o: ['평균이 0.85를 넘으면 통과한다', '경고만 남기고 통과한다', '하한 0.70 아래라 막힌다'], a: 2,
      why: '임계치는 지표마다 따로 건다. context_precision 하한이 0.70이라 0.65면 그 PR은 회귀로 판정된다.' },
  ];

  R.page({ title: 'GraphRAG 평가 지표', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
