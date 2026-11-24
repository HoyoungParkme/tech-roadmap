/* V-2-2 자동 평가 파이프라인 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const KEYS = ['accuracy', 'relevance', 'safety'];
  const ST = { pending: ['대기', MUT, SOFT], running: ['실행중', INFO, INFOBG], pass: ['PASS', GOOD, GOODBG], warn: ['WARN', WARN, WARNBG], fail: ['FAIL', BAD, BADBG] };
  const stat = (x, y, s, sc) => { const [t, col, bg] = ST[s] || ST.pending; card(x, y, 74, 26, { rx: 13, fill: bg, stroke: col, sw: 1.6, text: t, fs: 13.5, fw: 800, color: col, s: sc }); };
  const scoreCol = (v) => (v >= 0.85 ? GOOD : v >= 0.7 ? WARN : BAD);

  // ── 1. Dataset: (질문, 기대 답변) 쌍 5개
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k === 0) { card(300, 200, 200, 70, { rx: 12, stroke: ACC, sw: 2.4, text: 'client = Client()', fs: 15, mono: true, s: pop(u, 0.2) });
      grow(400, 200, 560, 200, seg(u, 0.6, 1.2), ACC); card(660, 200, 200, 70, { rx: 12, fill: SOFT, stroke: GRID, sw: 2, text: 'LangSmith\n데이터셋 0개', fs: 15, s: pop(u, 1.1) });
      tx(480, 300, '평가의 출발점. 아직 시험 문항이 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    const rows = (b.table && b.table.rows) || [], pn = ((p.table && p.table.rows) || []).length;
    el('rect', { x: 20, y: 24, width: 920, height: 330, rx: 12, fill: PANEL, stroke: k === 1 ? ACC : GRID, 'stroke-width': 2, opacity: k === 1 ? fade(u, 0.2) : 1 });
    tx(40, 54, 'Dataset', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(110, 54, 'qa-eval-v1', { 'font-size': 16, 'font-weight': 800 });
    const reg = b.summary && b.summary.right ? b.summary.right.value : '0 / 5', pr = p.summary && p.summary.right ? p.summary.right.value : reg;
    const nReg = k === 3 ? Math.round(tween(parseInt(pr), parseInt(reg), u, 1.6)) : parseInt(reg);
    mono(920, 54, `등록 ${nReg} / 5`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: nReg === 5 ? GOOD : MUT });
    const hdr = [['id', 40], [k === 3 ? 'inputs.question' : '질문', 110], [k === 3 ? 'outputs.answer' : '기대 답변', 430], ['상태', 850]];
    hdr.forEach(([s, x]) => tx(x, 92, s, { 'font-size': 14, 'font-weight': 700, fill: k === 3 && x > 100 && x < 800 ? ACC : MUT, class: k === 3 && x > 100 && x < 800 ? 'mono' : null }));
    for (let i = 0; i < 5; i++) { const y = 128 + i * 46, r = rows[i];
      el('line', { x1: 36, y1: y - 22, x2: 924, y2: y - 22, stroke: GRID, 'stroke-width': 1 });
      if (!r) { el('rect', { x: 110, y: y - 12, width: 780, height: 22, rx: 5, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5', opacity: k === 1 ? fade(u, 0.5 + i * 0.15) : 1 }); continue; }
      const fresh = i >= pn, s = fresh ? pop(u, 0.2 + i * 0.25) : 1, o = fresh ? fade(u, 0.25 + i * 0.25) : 1;
      mono(40, y + 5, r.caseId, { 'font-size': 14.5, 'font-weight': 700, opacity: o });
      tx(110, y + 5, r.q, { 'font-size': 14.5, opacity: o }); tx(430, y + 5, r.ref, { 'font-size': 14.5, fill: MUT, opacity: o });
      stat(886, y, 'pending', s);
      if (k === 3) dot([[480, 400], [480, 370], [140, y]], seg(u, 0.2 + i * 0.25, 1.0 + i * 0.25), ACC, 6); }
    if (k === 2) tx(480, 392, 'examples = [ … ]  실유저 질의 4건 + 안전성 엣지 1건 (tc05)', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
    if (k === 3) card(480, 392, 340, 34, { rx: 8, fill: ACCBG, stroke: ACC, sw: 1.8, text: 'client.create_examples(inputs, outputs)', fs: 14, mono: true }); }

  // ── 2. Evaluator 세 개: Judge 가 0~1 점수를 매기는 함수
  function s2(t, c) { const { k, u } = c;
    card(110, 92, 170, 76, { rx: 12, fill: ACCBG, stroke: ACC, sw: 2.4, text: 'judge\ngpt-4o · T=0', fs: 15, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) tx(110, 156, '학생: gpt-4o-mini', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1) });
    if (k >= 1) { card(110, 230, 190, 60, { rx: 10, stroke: INK, sw: 2, text: '_score(prompt)\n→ float 0~1', fs: 14.5, mono: true, s: k === 1 ? pop(u, 0.2) : 1 });
      grow(110, 132, 110, 196, k === 1 ? seg(u, 0.5, 1.0) : 1, ACC);
      if (k === 1) { const v = E(u, 1.2, 2.4); el('rect', { x: 20, y: 290, width: 180, height: 12, rx: 6, fill: SOFT }); el('rect', { x: 20, y: 290, width: 180 * 0.95 * v, height: 12, rx: 6, fill: ACC });
        mono(210, 301, (0.95 * v).toFixed(2), { 'font-size': 14, 'font-weight': 700 }); sub(110, 330, '"0.95" 문자열 → float (예시)', fade(u, 1.6)); } }
    const EV = [['accuracy', ['기대: {ref}', '실제: {pred}'], '의미 유사도'], ['relevance', ['질문: {q}', '답변: {a}'], '주제 일치도'], ['safety', ['유해·개인정보?', '있으면 0 · 없으면 1'], '1 = 안전']];
    EV.forEach(([nm, ins, d], i) => { const cx = 400 + i * 200, born = 2 + i; if (k < born) { card(cx, 200, 176, 230, { rx: 12, dash: '6 5', stroke: GRID, sw: 2 }); return; }
      const s = k === born ? pop(u, 0.2) : 1, col = i === 2 ? GOOD : ACC;
      card(cx, 200, 176, 230, { rx: 12, stroke: col, sw: 2.2, s });
      mono(cx, 112, nm, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s });
      ins.forEach((l, j) => tx(cx, 150 + j * 26, l, { 'font-size': 13.5, 'text-anchor': 'middle', class: j || i === 2 ? null : 'mono', opacity: k === born ? fade(u, 0.5 + j * 0.3) : 1 }));
      if (i < 2) { const v = k === born ? E(u, 1.0, 2.0) : 1; el('rect', { x: cx - 70, y: 222, width: 140, height: 10, rx: 5, fill: SOFT }); el('circle', { cx: cx - 70 + 140 * v * (i ? 0.93 : 0.95), cy: 227, r: 8, fill: col });
        mono(cx - 70, 252, '0', { 'font-size': 13.5, fill: MUT }); mono(cx + 70, 252, '1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
      else { const on = k === born ? (u > 1.2 ? 1 : 0) : 1; el('rect', { x: cx - 28, y: 214, width: 56, height: 28, rx: 14, fill: on ? GOOD : BAD });
        el('circle', { cx: cx - 14 + 28 * on, cy: 228, r: 11, fill: PANEL }); }
      tx(cx, 290, d, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: s });
      if (k >= 2) grow(205, 230, cx - 90, 200 + (i - 1) * 20, k === born ? seg(u, 0.3, 0.9) : 1, GRID, { plain: true, sw: 1.6, dash: '4 4' }); });
    if (k === 5) { el('path', { d: 'M310,330 V346 H890 V330', fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: E(u, 0.2, 0.8) });
      card(600, 380, 380, 40, { rx: 10, fill: ACCBG, stroke: ACC, sw: 2, text: 'EVALUATORS = [accuracy, relevance, safety]', fs: 14, mono: true, s: pop(u, 0.6) }); } }

  // ── 3. evaluate: 5케이스 × 3지표 표가 채워진다
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const rows = b.table.rows, prow = (p.table && p.table.rows) || [];
    const info = [['chain v1', 'prompt | gpt-4o-mini'], ['predict(inputs)', '→ {"output": …}'], ['evaluate(…)', '5 × 3 = 15번 채점']];
    info.forEach(([a, d], i) => { if (k < i) return; const y = 70 + i * 90, s = k === i ? pop(u, 0.2) : 1;
      card(150, y, 260, 64, { rx: 10, stroke: k === i ? ACC : GRID, sw: 2, text: '', s }); mono(30, y - 4, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); tx(30, y + 19, d, { 'font-size': 13.5, fill: MUT, class: 'mono', opacity: s }); });
    if (k >= 2) mono(30, 330, 'max_concurrency=4', { 'font-size': 14, fill: MUT });
    const X = 320, CX = [640, 730, 820];
    tx(X, 46, 'id', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(X + 58, 46, '질문', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    ['acc', 'rel', 'safe'].forEach((s, j) => tx(CX[j], 46, s, { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono' }));
    tx(904, 46, '상태', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'middle' });
    rows.forEach((r, i) => { const y = 82 + i * 52, pr = prow[i] || {}, newScore = r.scores.accuracy != null && (!pr.scores || pr.scores.accuracy == null);
      mono(X, y + 5, r.caseId, { 'font-size': 14.5, 'font-weight': 700 }); tx(X + 58, y + 5, r.q, { 'font-size': 14 });
      KEYS.forEach((key, j) => { const v = r.scores[key]; const d = newScore ? (i % 3) * 0.25 + j * 0.15 : 0, s = newScore ? pop(u, 0.4 + d) : 1;
        if (v == null) { card(CX[j], y, 76, 36, { rx: 6, fill: SOFT, stroke: 'none', text: r.status === 'running' ? '…' : '', fs: 15, color: MUT }); return; }
        card(CX[j], y, 76, 36, { rx: 6, fill: scoreCol(v), stroke: 'none', text: v.toFixed(2), fs: 15, fw: 800, color: PANEL, mono: true, s });
        if (k === 4 && i === 4 && j === 2) el('rect', { x: CX[j] - 42, y: y - 22, width: 84, height: 44, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 3 }); });
      stat(904, y, r.status, r.status !== pr.status ? pop(u, 0.3 + (newScore ? 0.9 : 0)) : 1); });
    if (k === 1) for (let i = 0; i < 5; i++) dot([[280, 160], [X - 6, 82 + i * 52]], (t * 0.8 + i / 5) % 1, INFO, 5);
    if (k === 4) { const y = 82 + 5 * 52 + 4, avg = [0.86, 0.87, 0.92];
      el('line', { x1: X, y1: y - 26, x2: 944, y2: y - 26, stroke: INK, 'stroke-width': 2 });
      tx(X, y + 5, '평균', { 'font-size': 15, 'font-weight': 800 });
      avg.forEach((v, j) => mono(CX[j], y + 6, tween(0, v, u, 1.3).toFixed(2), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }));
      tx(CX[2], y + 40, 'tc05 0.62가 평균을 끌어내림', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.5) }); } }

  // ── 4. 대시보드: v1 vs v2 막대와 delta
  const V1 = [0.95, 0.91, 0.88, 0.85, 0.72];
  function s4(t, c) { const { k, u } = c, b = c.beat, cmp = b.compare;
    const BX = 230, BW = 500, xs = (v) => BX + BW * v;
    tx(30, 40, 'METRICS', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    if (k >= 3) { tx(BX, 40, '■ v1 gpt-4o-mini', { 'font-size': 14, 'font-weight': 700, fill: INFO }); tx(BX + 200, 40, '■ v2 gpt-4o + few-shot', { 'font-size': 14, 'font-weight': 700, fill: ACC }); }
    if (k === 4) tx(880, 40, 'delta', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    KEYS.forEach((key, i) => { const y = 92 + i * 74;
      mono(30, y + 5, key, { 'font-size': 16, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2 + i * 0.3) : 1 });
      if (k >= 3 && cmp) [['v1', INFO, -12], ['v2', ACC, 12]].forEach(([vk, col, dy], j) => { const g = k === 3 ? E(u, 0.2 + j * 0.6 + i * 0.15, 1.0 + j * 0.6 + i * 0.15) : 1, v = cmp[vk][key];
        el('rect', { x: BX, y: y + dy - 9, width: BW, height: 18, rx: 4, fill: SOFT });
        el('rect', { x: BX, y: y + dy - 9, width: BW * v * g, height: 18, rx: 4, fill: col });
        mono(BX + BW * v * g + 8, y + dy + 5, (v * g).toFixed(2), { 'font-size': 14, 'font-weight': 700, fill: col }); });
      if (k === 4) pill(880, y, '+' + cmp.delta[key].toFixed(2), GOOD, pop(u, 0.3 + i * 0.3), { fs: 15, mono: true }); });
    if (k === 1) { const y = 92; tx(BX, 74, 'feedback_stats["accuracy"]["avg"]  (v1 케이스 5개)', { 'font-size': 13.5, fill: MUT, class: 'mono' });
      V1.forEach((v, i) => { const x = xs(v), f = E(u, 1.2, 2.0);
        el('circle', { cx: lerp(x, xs(0.862), f), cy: y + 6, r: 8, fill: scoreCol(v), opacity: 1 - 0.6 * f * (i > 0 ? 1 : 0) });
        if (f < 0.5) mono(x, y + 34 + (i % 2) * 16, v.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.12) * (1 - f * 2) }); });
      el('line', { x1: BX, y1: y + 6, x2: BX + BW, y2: y + 6, stroke: GRID, 'stroke-width': 1.5 });
      mono(xs(0.862), y + 44, 'round(4.31 / 5, 2) = 0.86', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) }); }
    if (k === 2) { card(330, 230, 240, 40, { rx: 8, stroke: INK, sw: 2, text: '"v1-gpt4o-mini"', fs: 14.5, mono: true, s: pop(u, 0.2) });
      grow(452, 230, 560, 230, seg(u, 0.6, 1.1), ACC);
      card(720, 230, 300, 40, { rx: 8, fill: ACCBG, stroke: ACC, sw: 2, text: 'v1-gpt4o-mini-xxxxxxxx', fs: 14.5, mono: true, s: pop(u, 1.1) });
      tx(720, 276, 'evaluate가 붙인 8자리 접미사', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) });
      card(480, 340, 520, 40, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.6, text: '{accuracy: 0.86, relevance: 0.87, safety: 0.92}', fs: 14.5, mono: true, s: pop(u, 1.9) }); }
    if (k === 4) { tx(30, 330, '케이스 상태', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      b.table.rows.forEach((r, i) => { const x = 190 + i * 150; mono(x - 50, 365, r.caseId, { 'font-size': 14, 'font-weight': 700 }); stat(x + 30, 360, r.status, i === 4 ? pop(u, 1.3) : 1); });
      tx(480, 404, 'tc05 WARN → PASS · 5케이스 모두 통과', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); } }

  // ── 5. 회귀 검출: delta 가 임계치를 넘으면 CI 를 막는다
  function s5(t, c) { const { k, u } = c, b = c.beat, cmp = b.compare;
    card(200, 40, 340, 40, { rx: 8, fill: GOODBG, stroke: GOOD, sw: 2, text: 'baseline  v2-gpt4o-fewshot', fs: 14, mono: true });
    card(640, 40, 340, 40, { rx: 8, fill: WARNBG, stroke: WARN, sw: 2, text: 'candidate  v3-short-prompt', fs: 14, mono: true });
    const Z = 560, S = 2400, Th = Z - 0.03 * S;
    el('line', { x1: Z, y1: 92, x2: Z, y2: 262, stroke: INK, 'stroke-width': 2 }); mono(Z, 282, '0', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    el('line', { x1: Th, y1: 92, x2: Th, y2: 262, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k === 0 ? E(u, 0.3, 1) : 1 });
    mono(Th, 282, 'THRESHOLD -0.03', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: BAD, opacity: k === 0 ? fade(u, 0.6) : 1 });
    KEYS.forEach((key, i) => { const y = 120 + i * 56; mono(30, y + 5, key, { 'font-size': 15, 'font-weight': 700 });
      if (k >= 1 && cmp) { const d = cmp.delta[key], g = k === 1 ? E(u, 0.2 + i * 0.3, 1.0 + i * 0.3) : 1, failed = d < -0.03 - 1e-9;
        el('rect', { x: Z + d * S * g, y: y - 11, width: -d * S * g, height: 22, rx: 4, fill: failed ? BAD : WARN });
        mono(Z + d * S * g - 10, y + 6, d.toFixed(2), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: failed ? BAD : WARN, opacity: fade(u, 0.6 + i * 0.3) });
        mono(Z + 20, y + 6, `${cmp.v1[key].toFixed(2)} → ${cmp.v2[key].toFixed(2)}`, { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 1.2 + i * 0.3) : 1 });
        if (k >= 1) { if (failed) cross(760, y, 8, k === 1 ? pop(u, 1.4 + i * 0.2) : 1); else tx(735, y + 5, '같음 → 통과', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: k === 1 ? fade(u, 2) : 1 }); } } });
    if (k === 0) tx(Z + 180, 180, 'd < THRESHOLD 면 회귀', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2), class: 'mono' });
    if (k >= 1) { const rows = b.table.rows; rows.forEach((r, i) => { const y = 112 + i * 38; mono(828, y + 5, r.caseId, { 'font-size': 13.5, 'font-weight': 700 }); stat(906, y, r.status, k === 1 ? pop(u, 0.4 + i * 0.15) : 1); }); }
    const Y = 352;
    if (k === 1) tx(400, Y, 'v3 결과: tc04 FAIL · tc03 / tc05 WARN', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) });
    if (k === 2) { fly(300, Y, 640, Y, seg(u, 0.3, 1.4), 'failed: accuracy, relevance', { fill: BAD, stay: true });
      card(860, Y, 150, 44, { rx: 10, stroke: INFO, sw: 2, text: 'Slack #ml-ops', fs: 15, s: pop(u, 1.2) }); grow(760, Y, 782, Y, seg(u, 1.4, 1.7), BAD); }
    if (k === 3) { [['push', INK], ['evaluate v3', INK], ['회귀 검사', BAD], ['배포', MUT]].forEach(([s, col], i) => { const x = 110 + i * 220, sc = pop(u, 0.2 + i * 0.3);
        card(x, Y, 170, 44, { rx: 22, stroke: col, sw: 2.2, fill: i === 2 ? BADBG : PANEL, text: s, fs: 15, color: i === 3 ? MUT : INK, s: sc, dash: i === 3 ? '6 5' : null });
        if (i) grow(x - 125, Y, x - 88, Y, seg(u, 0.3 + i * 0.3, 0.6 + i * 0.3), i === 3 ? BAD : MUT); });
      cross(550, Y - 34, 10, pop(u, 1.4)); mono(550, Y + 46, 'sys.exit(1) → BLOCKED', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) }); } }

  const quiz = [
    { q: 'LangSmith Dataset의 예제(example) 하나는 무엇으로 이루어지는가?',
      o: ['질문 inputs와 기대 답변 outputs 한 쌍', '모델 이름과 프롬프트', '점수와 PASS/WARN 상태'], a: 0,
      why: 'create_examples에 inputs={"question"}과 outputs={"answer"}를 나란히 넘긴다. 점수는 나중에 evaluate가 붙인다.' },
    { q: 'evaluator accuracy(run, example)에서 기대 답변은 어디서 읽는가?',
      o: ['run.outputs["output"]', 'example.outputs["answer"]', 'example.inputs["question"]'], a: 1,
      why: 'run은 체인이 이번에 낸 출력이고 example은 Dataset에 저장한 정답이다. accuracy는 둘을 Judge에게 비교시킨다.' },
    { q: 'v1 결과에서 safety 평균이 0.92인데도 눈여겨봐야 할 것은 무엇인가?',
      o: ['safety 평균이 1보다 작다', 'tc01의 accuracy가 0.95다', 'tc05의 safety가 0.62로 혼자 낮다'], a: 2,
      why: '나머지 네 케이스는 safety 1.0이다. 평균은 높아 보여도 안전성 엣지 케이스 하나가 위험 신호를 내고 있다.' },
    { q: 'v1에서 v2로 바꾼 뒤 accuracy 평균은 어떻게 변했는가?',
      o: ['0.92 → 0.86', '0.86 → 0.92', '0.87 → 0.92'], a: 1,
      why: 'v2(gpt-4o + few-shot)는 accuracy +0.06, relevance·safety +0.05로 세 지표가 모두 올랐다.' },
    { q: 'THRESHOLD=-0.03, failed는 d < THRESHOLD로 고른다. delta가 -0.11, -0.10, -0.03이면 failed에 드는 지표는?',
      o: ['accuracy 하나', 'accuracy와 relevance 둘', '세 지표 모두'], a: 1,
      why: 'safety의 -0.03은 임계치와 같아서 < 조건을 만족하지 않는다. 그래도 failed가 비어 있지 않아 sys.exit(1)로 빌드가 막힌다.' },
  ];

  const summary = [
    '자동 평가는 질문과 기대 답변 쌍 5건을 LangSmith Dataset에 올리는 데서 시작한다.',
    'accuracy·relevance·safety를 Judge가 0~1로 매기는 함수로 만들고 evaluate로 한 번에 돌린다.',
    'v1은 accuracy 평균 0.86이었고 few-shot을 넣은 v2는 0.92로 세 지표가 모두 올랐다.',
    'prompt를 줄인 v3는 0.81로 떨어져 임계치 -0.03을 넘었고 CI가 배포를 막았다.',
  ];
  const review = [
    { q: '프롬프트를 짧게 줄였더니 비용이 줄었다. 배포해도 될지 판단하려면 무엇을 하나?',
      o: ['같은 Dataset으로 evaluate를 돌려 이전 버전과 delta를 본다', '질문 몇 개를 손으로 넣어 보고 괜찮으면 배포한다', '비용이 줄었으니 바로 배포한다'], a: 0,
      why: 'v3도 prompt를 줄였을 뿐인데 accuracy가 0.92에서 0.81로 떨어졌다. 같은 문항으로 재야 이런 회귀가 보인다.' },
    { q: '회귀 검사에서 tc04만 FAIL(accuracy 0.65)이 나왔다. 원인을 찾을 때 먼저 할 일은?',
      o: ['임계치를 느슨하게 바꾼다', 'tc04에 대한 v3 출력과 기대 답변을 나란히 본다', 'Dataset에서 tc04를 지운다'], a: 1,
      why: '기대 답변은 Buffer/Window/Summary/Vector 네 가지다. v3 출력에서 무엇이 빠졌는지 보면 줄인 prompt의 문제가 드러난다.' },
    { q: 'Dataset이 5케이스뿐일 때 평균 accuracy 0.86을 조심해서 읽어야 하는 이유는?',
      o: ['Judge가 5개까지만 채점한다', '평균은 늘 0.86 근처로 나온다', '케이스 하나가 평균을 크게 흔든다'], a: 2,
      why: 'v1에서 tc05(0.72) 하나를 빼면 평균이 약 0.90이 된다. 케이스가 적을수록 한 건의 무게가 커진다.' },
  ];

  R.page({ title: '평가 파이프라인과 회귀 알람', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
