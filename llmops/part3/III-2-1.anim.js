/* III-2-1 RAGAS 4축 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 3/3·0/3, 3/5=0.60, precision@k, RAGAS 평균 0.76, 4/5=0.80, F1 0.69, 평균 0.86 은 파이썬으로 다시 계산한 값.
 * relevancy 0.92/0.30/0.10, faithfulness 0.95, 대시보드 4축 점수는 페이지 코드의 예시 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, cross, check, dot, hbar, axes, scatter, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op) => pill(x, y, '예시', WARN, 1, { fs: 13.5, op });
  const f2 = (v) => v.toFixed(2);
  // 0~1 점수 막대 + 기준선
  function gauge(x, y, w, v, o) { o = o || {}; const h = o.h || 26;
    el('rect', { x, y, width: w, height: h, rx: 6, fill: SOFT });
    el('rect', { x, y, width: Math.max(2, w * clamp(v)), height: h, rx: 6, fill: o.col || ACC, opacity: 0.9 });
    if (o.base != null) { const bx = x + w * o.base; el('line', { x1: bx, y1: y - 8, x2: bx, y2: y + h + 8, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' });
      if (o.baseLabel !== false) mono(bx, y - 12, String(o.base), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    if (o.text !== false) mono(x + w + 12, y + h / 2 + 6, o.text ?? f2(v), { 'font-size': 16, 'font-weight': 800, fill: o.col || ACC }); }

  // ---------- 1. Faithfulness ----------
  const RULES = ['구매 후 7일 이내만 가능', '미개봉 상품에 한함', '전자제품은 환불 불가'];
  const CA = ['7일 이내', '미개봉', '전자제품 불가'], CB = ['30일 이내', '무조건 가능', '전자제품도 환불'];
  function ctxDoc(o) { o = o || {}; const x = 30, y = 40, w = 270, h = 190;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    el('rect', { x, y, width: w, height: 34, rx: 10, fill: INK, opacity: o.op ?? 1 });
    tx(x + 14, y + 23, 'context · 환불 정책', { 'font-size': 14.5, 'font-weight': 800, fill: PANEL, opacity: o.op ?? 1 });
    RULES.forEach((r, i) => { const yy = y + 70 + i * 44, s = o.rows ? o.rows(i) : 1; if (s <= 0) return;
      el('circle', { cx: x + 22, cy: yy - 5, r: 11, fill: ACCBG, stroke: ACC, opacity: s });
      mono(x + 22, yy, String(i + 1), { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s });
      tx(x + 42, yy, r, { 'font-size': 15, 'font-weight': 600, opacity: s }); });
    return (i) => [x + w, y + 65 + i * 44]; }
  function claimRow(y, cl, col, o) { o = o || {}; return cl.map((s, i) => { const cx = 420 + i * 175, sc = o.s ? o.s(i) : 1;
    card(cx, y, 160, 38, { rx: 19, text: s, fs: 14.5, fw: 700, stroke: col, color: col, fill: o.fill ? o.fill(i) : PANEL, s: sc }); return [cx - 80, y]; }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 6) { // 평가셋 전체
      for (let i = 0; i < 100; i++) { const q = i % 20, r = Math.floor(i / 20), s = clamp(E(u, 0.1, 1.2) * 100 - i);
        el('rect', { x: 60 + q * 22, y: 60 + r * 22, width: 18, height: 18, rx: 3, fill: i % 20 === 7 || i === 63 || i === 88 || i === 41 || i === 16 ? BAD : GOOD, opacity: 0.25 + 0.6 * s }); }
      sub(275, 190, '평가셋 100~1000 케이스 (칸은 개념 그림)', fade(u, 1.0));
      tx(560, 90, 'evaluate(metrics=[faithfulness])', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.8) });
      gauge(560, 130, 300, E(u, 1.0, 2.0) * 0.95, { col: GOOD, base: 0.85, text: f2(E(u, 1.0, 2.0) * 0.95) }); ex(890, 100, fade(u, 2.0));
      [['0.95+', '훌륭 (환각률 5% 이하)', GOOD], ['0.85+', '허용', INFO], ['0.85-', '위험 → RAG 개선', BAD]].forEach(([a, b, col], i) => { const y = 250 + i * 40;
        mono(560, y, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.8 + i * 0.2) }); note(630, y, b, fade(u, 1.8 + i * 0.2)); });
      return; }
    const R0 = ctxDoc({ rows: (i) => (k === 0 ? fade(u, 0.4 + i * 0.4) : 1) });
    if (k === 0) { el('rect', { x: 20, y: 30, width: 290, height: 210, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', opacity: fade(u, 1.8) });
      note(340, 140, '← 답변의 모든 사실은 이 안에서만 나와야 한다', fade(u, 2.0), { fill: ACC }); return; }
    const ansA = k === 1 ? pop(u, 0.2) : 1;
    if (k <= 2) { card(640, 95, 560, 110, { rx: 12, stroke: GOOD, sw: 2.5, s: ansA });
      tx(380, 66, '답변 A — 충실', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: ansA }); tx(380, 98, '환불은 구매 후 7일 이내, 미개봉 상품에 한해 가능합니다.', { 'font-size': 14.5, opacity: ansA });
      tx(380, 122, '전자제품은 환불이 불가능합니다.', { 'font-size': 14.5, opacity: ansA });
      if (k === 1) RULES.forEach((_, i) => grow(R0(i)[0] + 4, R0(i)[1], 356, 95, E(u, 1.0 + i * 0.3, 1.6 + i * 0.3), GOOD, { plain: true, sw: 1.8, dash: '4 4' }));
      if (k === 2) { const sB = pop(u, 0.2); card(640, 280, 560, 110, { rx: 12, stroke: BAD, sw: 2.5, s: sB });
        tx(380, 251, '답변 B — 환각', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: sB });
        R.spans(380, 283, [['환불은 ', { fill: INK }], ['30일', { fill: BAD, 'font-weight': 800 }], [' 이내라면 ', { fill: INK }], ['무조건', { fill: BAD, 'font-weight': 800 }], [' 가능합니다.', { fill: INK }]], { 'font-size': 14.5, class: null, opacity: sB });
        R.spans(380, 307, [['전자제품도 환불', { fill: BAD, 'font-weight': 800 }], [' 됩니다.', { fill: INK }]], { 'font-size': 14.5, class: null, opacity: sB });
        note(380, 360, '문장은 자연스럽지만 context에 근거가 없다', fade(u, 1.6), { fill: BAD }); }
      return; }
    // k ≥ 3: claim 단위
    tx(345, 80, 'A', { 'font-size': 20, 'font-weight': 800, fill: GOOD }); tx(345, 270, 'B', { 'font-size': 20, 'font-weight': 800, fill: BAD });
    const pa = claimRow(75, CA, GOOD, { s: (i) => (k === 3 ? pop(u, 0.3 + i * 0.25) : 1), fill: (i) => (k >= 4 ? GOODBG : PANEL) });
    const pb = claimRow(265, CB, BAD, { s: (i) => (k === 3 ? pop(u, 1.1 + i * 0.25) : 1), fill: (i) => (k >= 4 ? BADBG : PANEL) });
    if (k === 3) { mono(380, 160, 'claims = llm.extract_claims(answer)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { pa.forEach(([x, y], i) => { grow(R0(i)[0] + 4, R0(i)[1], x - 4, y, E(u, 0.2 + i * 0.3, 0.7 + i * 0.3), GOOD, { plain: true, sw: 2 }); check(x + 150, y - 26, 8, pop(u, 0.7 + i * 0.3)); });
      pb.forEach(([x, y], i) => { grow(R0(i)[0] + 4, R0(i)[1] + 10, lerp(R0(i)[0] + 4, x - 4, 0.55), lerp(R0(i)[1] + 10, y, 0.55), E(u, 1.2 + i * 0.3, 1.6 + i * 0.3), BAD, { plain: true, sw: 2, dash: '5 4' }); cross(x + 150, y - 26, 7, pop(u, 1.6 + i * 0.3)); });
      mono(760, 128, 'supported = 3', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4) }); mono(760, 318, 'supported = 0', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.3) });
      return; }
    // k = 5: 비율
    const ga = E(u, 0.3, 1.2), gb = E(u, 1.0, 1.8);
    mono(380, 140, 'faithfulness = 3 / 3', { 'font-size': 16, 'font-weight': 800 }); gauge(380, 152, 360, ga, { col: GOOD, text: f2(ga) });
    mono(380, 330, 'faithfulness = 0 / 3', { 'font-size': 16, 'font-weight': 800 }); gauge(380, 342, 360, 0, { col: BAD, text: '0.00' });
    sub(160, 300, 'claim 단위라 부분 점수도 난다', fade(u, 2.0), { 'font-size': 14 }); sub(160, 322, '(예: 2/3 = 0.67)', fade(u, 2.1)); }

  // ---------- 2. Answer Relevancy ----------
  const ANS = [['A', '환불 기간은 7일입니다.', GOOD, '직답'], ['B', '환불은 미개봉 상품에 한합니다. 좋은 하루 되세요.', WARN, '딴말'], ['C', '죄송하지만 답변하기 어렵습니다.', BAD, '거부']];
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { card(300, 50, 400, 44, { rx: 22, stroke: INK, sw: 2, s: k === 0 ? pop(u, 0.2) : 1 });
      R.spans(130, 56, [['Q. 환불 ', {}], ['기간', { fill: ACC, 'font-weight': 800 }], ['은 며칠인가요?', {}]], { 'font-size': 16, class: null, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.3) : 1 });
      card(760, 50, 330, 40, { rx: 8, stroke: GRID, text: 'context: 7일 이내, 미개봉만', fs: 14, s: k === 0 ? pop(u, 0.8) : 1 });
      if (k === 0) { note(300, 140, '질문이 무엇을 물었는지가 이 축의 기준선', fade(u, 1.5), { 'text-anchor': 'middle', fill: MUT }); return; }
      ANS.forEach(([n, a, col, tag], i) => { if (i === 2 && k < 2) return; const y = 140 + i * 90, s = (k === 1 && i < 2) ? pop(u, 0.2 + i * 0.5) : (k === 2 && i === 2) ? pop(u, 0.2) : 1;
        card(380, y, 640, 70, { rx: 12, stroke: col, sw: 2, s }); mono(84, y + 6, n, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: s }); tx(110, y + 6, a, { 'font-size': 15, opacity: s });
        if (k >= 1 && i < 2) { tx(730, y - 8, 'faithful', { 'font-size': 13.5, fill: MUT, opacity: fade(u, k === 1 ? 1.0 + i * 0.5 : 0) }); check(840, y - 12, 8, k === 1 ? pop(u, 1.0 + i * 0.5) : 1);
          tx(730, y + 18, '"기간"에 답', { 'font-size': 13.5, fill: MUT, opacity: fade(u, k === 1 ? 1.3 + i * 0.5 : 0) }); (i === 0 ? check : cross)(840, y + 14, 8, k === 1 ? pop(u, 1.3 + i * 0.5) : 1); }
        if (i === 2) { mono(730, y + 6, 'claims = 0 → 0 / 0', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) }); } });
      if (k === 2) note(110, 400, '거부 답변은 faithfulness를 잴 claim이 없다 → relevancy로만 잡힌다', fade(u, 1.6), { fill: BAD });
      return; }
    if (k === 3) { card(170, 200, 260, 70, { rx: 12, stroke: GOOD, sw: 2, text: 'A: 환불 기간은 7일입니다.', fs: 14.5 });
      ['환불 기간이 어떻게 되나요?', '며칠 안에 환불 가능?', '…'].forEach((q, i) => { const y = 100 + i * 100, g = E(u, 0.3 + i * 0.5, 1.0 + i * 0.5);
        grow(300, 200, 470, y, g, INFO); card(640, y, 320, 50, { rx: 25, stroke: INFO, text: q, fs: 14.5, s: pop(u, 0.8 + i * 0.5), fill: INFOBG }); });
      mono(170, 280, 'llm.generate_questions(answer, n=3)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      note(480, 400, '정답 없이도 잰다 — 답만 보고 나올 법한 질문을 만든다', fade(u, 2.1), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 4) { const O = [160, 340], L = 300;
      const vec = (deg, col, lab, d) => { const a = -deg * Math.PI / 180, g = E(u, d, d + 0.6); grow(O[0], O[1], O[0] + Math.cos(a) * L * g, O[1] + Math.sin(a) * L * g, g, col, { sw: 3 });
        if (g > 0.9) tx(O[0] + Math.cos(a) * (L + 14), O[1] + Math.sin(a) * (L + 14), lab, { 'font-size': 14, 'font-weight': 700, fill: col }); };
      vec(30, INK, '원 질문', 0.1); vec(36, INFO, '생성 q1', 0.6); vec(25, INFO, '생성 q2', 0.9); vec(70, WARN, 'B에서 만든 질문', 1.4);
      el('path', { d: `M ${O[0] + 80} ${O[1] - 46} A 92 92 0 0 0 ${O[0] + 31} ${O[1] - 86}`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.9) });
      note(560, 120, 'sims = cosine(원 질문, 생성 질문)', fade(u, 0.4), { class: 'mono', 'font-size': 14.5 });
      note(560, 160, '방향이 가까울수록 1에 가깝다', fade(u, 1.0)); note(560, 196, '평균 = answer relevancy', fade(u, 1.4), { fill: ACC });
      note(560, 250, '딴말에서 만든 질문은 각도가 벌어진다', fade(u, 2.0), { fill: WARN }); sub(700, 400, '(각도는 개념 그림)', fade(u, 2.2)); return; }
    // k = 5: 두 축 조합
    const ax = axes(130, 50, 330, 300, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1], yt: [0, 0.5, 1], xl: 'faithfulness', yl: 'relevancy' });
    [['좋은 답', 0.75, 0.9, GOOD], ['동문서답', 0.75, 0.15, WARN], ['환각', 0.25, 0.9, BAD], ['거부·무관', 0.25, 0.15, MUT]].forEach(([n, a, b, col], i) =>
      tx(ax.X(a), ax.Y(b), n, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.2) }));
    el('line', { x1: ax.X(0.5), y1: ax.Y(0), x2: ax.X(0.5), y2: ax.Y(1), stroke: GRID, 'stroke-dasharray': '4 4' }); el('line', { x1: ax.X(0), y1: ax.Y(0.5), x2: ax.X(1), y2: ax.Y(0.5), stroke: GRID, 'stroke-dasharray': '4 4' });
    scatter(ax, [[1, 0.92, GOOD], [1, 0.30, WARN]], { u: E(u, 1.0, 1.6), r: 9 });
    mono(ax.X(1) - 16, ax.Y(0.92) + 5, 'A', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.4) });
    mono(ax.X(1) - 16, ax.Y(0.30) + 5, 'B', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.6) });
    [['A', 0.92, GOOD], ['B', 0.30, WARN], ['C', 0.10, BAD]].forEach(([n, v, col], i) => { const y = 90 + i * 70; mono(570, y + 18, n, { 'font-size': 18, 'font-weight': 800, fill: col });
      gauge(600, y, 250, v * E(u, 0.4 + i * 0.3, 1.2 + i * 0.3), { col, base: 0.8, baseLabel: i === 0, text: f2(v * E(u, 0.4 + i * 0.3, 1.2 + i * 0.3)) }); });
    ex(880, 60, 1); note(570, 330, 'C는 faithfulness를 못 재 점으로 못 찍는다', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); }

  // ---------- 3. Context Precision ----------
  const CH = [['환불은 7일 이내 미개봉만 가능', 1], ['배송은 평일 기준 1~2일 소요', 0], ['환불 신청은 마이페이지에서', 1], ['VIP 회원 혜택은 5% 추가 할인', 0], ['전자제품은 환불 불가', 1]];
  const PK = [1, 0.5, 2 / 3, 0.5, 0.6];
  function chunkList(k, u, o) { o = o || {}; CH.forEach(([s, r], i) => { const y = 90 + i * 54, show = k === 1 ? pop(u, 0.2 + i * 0.25) : 1, judged = k >= 2 ? (k === 2 ? E(u, 0.2, 2.2) * 5 > i : true) : k === 1;
      card(260, y, 400, 42, { rx: 8, stroke: judged ? (r ? GOOD : BAD) : GRID, sw: 2, fill: judged && !r ? BADBG : PANEL, s: show, op: o.op });
      mono(78, y + 5, '#' + (i + 1), { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: show * (o.op ?? 1) });
      tx(110, y + 5, s, { 'font-size': 14.5, fill: judged && !r ? MUT : INK, opacity: show * (o.op ?? 1) });
      if (judged) (r ? check : cross)(440, y, 8, k === 1 ? pop(u, 1.4 + i * 0.15) : 1); }); }
  function s3(t, c) { const { k, u } = c;
    card(260, 40, 400, 40, { rx: 20, stroke: INK, text: 'Q. 환불 기간은?', fs: 15, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { [0, 1, 2, 3, 4].forEach((i) => card(260, 90 + i * 54, 400, 42, { rx: 8, stroke: GRID, dash: '5 5', s: pop(u, 0.6 + i * 0.15) }));
      note(500, 200, 'retrieval이 가져온 chunk 5개', fade(u, 1.6)); note(500, 228, '이번엔 답이 아니라 검색 결과를 채점한다', fade(u, 1.9), { fill: MUT }); return; }
    chunkList(k, u, { op: k >= 4 ? 0.55 : 1 });
    if (k === 1) { note(500, 200, 'ground truth: 1 · 3 · 5가 관련', fade(u, 1.8)); return; }
    if (k === 2) { const n = Math.min(5, Math.floor(E(u, 0.2, 2.2) * 5 + 0.001)), rel = CH.slice(0, n).filter((x) => x[1]).length;
      if (n < 5) el('rect', { x: 56, y: 90 + n * 54 - 24, width: 410, height: 48, rx: 10, fill: 'none', stroke: INFO, 'stroke-width': 3 });
      mono(520, 140, 'llm.is_relevant(chunk, q, gt)', { 'font-size': 14.5, fill: MUT }); mono(520, 190, `relevant = ${rel}`, { 'font-size': 22, 'font-weight': 800, fill: GOOD });
      note(520, 240, '기준은 "질문과 비슷한가"가 아니라', fade(u, 1.0), { fill: MUT }); note(520, 266, '"답을 만들 수 있는가"', fade(u, 1.2), { fill: MUT }); return; }
    if (k === 3) { mono(520, 150, '3 / 5', { 'font-size': 30, 'font-weight': 800 }); const g = E(u, 0.3, 1.3) * 0.6;
      gauge(520, 190, 300, g, { col: BAD, base: 0.75, text: f2(g) }); note(520, 260, '기준선 0.75 미달', fade(u, 1.5), { fill: BAD });
      note(520, 292, '→ 프롬프트가 아니라 retrieval을 고친다', fade(u, 1.8)); return; }
    // k ≥ 4: precision@k
    const ax = axes(560, 70, 330, 220, { x: [0.5, 5.5], y: [0, 1], xt: [1, 2, 3, 4, 5], yt: [0, 0.5, 1], xl: 'k', yl: 'precision@k', grid: true });
    line(ax, PK.map((v, i) => [i + 1, v]), k === 4 ? E(u, 0.3, 2.0) : 1, ACC);
    scatter(ax, PK.map((v, i) => [i + 1, v, CH[i][1] ? GOOD : BAD]), { u: k === 4 ? E(u, 0.3, 2.0) : 1, r: 7 });
    if (k === 4) { mono(560, 350, 'top_k = retrieved[:k]', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.2) }); return; }
    [['@1', '1.00'], ['@3', '0.67'], ['@5', '0.60']].forEach(([a, b], i) => mono(ax.X([1, 3, 5][i]) + (i === 0 ? 14 : 0), ax.Y(PK[[0, 2, 4][i]]) + 26, b, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2 + i * 0.2) }));
    card(720, 370, 420, 60, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.0) });
    mono(720, 366, 'RAGAS = (1.00 + 0.67 + 0.60) / 3 = 0.76', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    sub(720, 388, '관련 chunk가 놓인 자리의 @k 평균', fade(u, 1.4));
    pill(260, 386, 'MRR: 첫 관련 chunk 1등 → 1.0', INFO, pop(u, 1.8), { fs: 14 }); }

  // ---------- 4. Context Recall ----------
  const GT = ['환불은 7일 이내 미개봉 상품에 한합니다.', '전자제품은 환불이 불가합니다.', '환불 신청은 마이페이지에서 가능합니다.', '배송비는 사용자가 부담합니다.'];
  const FACTS = [['7일 이내', 0], ['미개봉만', 0], ['전자제품 불가', 2], ['마이페이지 신청', 1], ['배송비 부담', -1]];
  const RCH = ['환불은 7일 이내 미개봉만 가능', '환불 신청은 마이페이지에서', '전자제품은 환불 불가'];
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { card(230, 170, 400, 230, { rx: 12, stroke: INK, sw: 2, s: k === 0 ? pop(u, 0.1) : 1 });
      tx(50, 80, 'ground truth (사람이 쓴 정답)', { 'font-size': 14.5, 'font-weight': 800, fill: MUT });
      GT.forEach((s, i) => tx(50, 125 + i * 40, s, { 'font-size': 14.5, fill: i === 3 && k === 1 ? BAD : INK, 'font-weight': i === 3 && k === 1 ? 800 : 500, opacity: k === 0 ? fade(u, 0.4 + i * 0.35) : 1 }));
      if (k === 0) { note(480, 360, '이 안의 사실이 recall의 분모가 된다', fade(u, 2.0), { fill: MUT, 'text-anchor': 'middle' }); return; }
      tx(520, 80, 'retrieved (검색된 chunk)', { 'font-size': 14.5, 'font-weight': 800, fill: MUT });
      RCH.forEach((s, i) => card(700, 125 + i * 56, 340, 42, { rx: 8, stroke: GOOD, text: s, fs: 14, s: pop(u, 0.3 + i * 0.3) }));
      card(700, 125 + 3 * 56, 340, 42, { rx: 8, stroke: BAD, dash: '6 5', text: '배송비 — 검색 안 됨', fs: 14, color: BAD, s: pop(u, 1.4) });
      return; }
    // k ≥ 2: 사실 칩 ↔ chunk
    const fx = 180, fy = (i) => 80 + i * 60, cx = 700, cy = (j) => 110 + j * 80;
    if (k <= 4) FACTS.forEach(([f, j], i) => card(fx, fy(i), 200, 42, { rx: 21, text: f, fs: 15, fw: 700, stroke: k >= 3 ? (j < 0 ? BAD : GOOD) : ACC, color: k >= 3 && j < 0 ? BAD : INK, fill: k >= 3 && j < 0 ? BADBG : PANEL, s: k === 2 ? pop(u, 0.3 + i * 0.25) : 1, op: k >= 5 ? 0.35 : 1 }));
    if (k === 2) { sub(fx, 400, '문장 4개 → 사실 5개 (첫 문장에 조건이 둘)', fade(u, 1.8)); mono(560, 210, 'facts = llm.extract_facts(ground_truth)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k <= 4) { RCH.forEach((s, j) => card(cx, cy(j), 330, 44, { rx: 8, stroke: GRID, text: s, fs: 14 }));
      let found = 0; FACTS.forEach(([f, j], i) => { const g = k === 3 ? E(u, 0.2 + i * 0.35, 0.6 + i * 0.35) : 1; if (j >= 0) { grow(fx + 102, fy(i), cx - 168, cy(j), g, GOOD, { plain: true, sw: 2.2 }); if (g >= 1) found++; }
        else if (g > 0) cross(fx + 130, fy(i), 9, pop(u, 1.8)); });
      if (k === 3) { mono(560, 380, `found = ${found}`, { 'font-size': 20, 'font-weight': 800, fill: GOOD }); return; }
      const g = E(u, 0.3, 1.3) * 0.8; mono(470, 370, '4 / 5 =', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
      gauge(560, 352, 260, g, { col: WARN, base: 0.75, text: f2(g) }); return; }
    if (k === 5) { [['precision', 0.60, BAD], ['recall', 0.80, WARN], ['F1', 2 * 0.6 * 0.8 / 1.4, ACC]].forEach(([n, v, col], i) => { const y = 90 + i * 80, g = E(u, 0.2 + i * 0.5, 1.0 + i * 0.5);
        mono(480, y + 20, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end' }); gauge(500, y, 300, v * g, { col, text: f2(v * g), h: 30 }); });
      mono(650, 340, '2PR / (P+R) = 0.96 / 1.40', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      note(650, 380, '조화 평균 — 낮은 쪽으로 끌려간다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    // k = 6: K 조정 (개념 그림)
    const ax = axes(130, 60, 380, 260, { x: [0, 1], y: [0, 1], xl: 'Top-K →', yl: '점수' });
    line(ax, [[0.05, 0.35], [0.3, 0.65], [0.6, 0.85], [0.95, 0.93]], E(u, 0.2, 1.4), GOOD, { sw: 3 });
    line(ax, [[0.05, 0.9], [0.3, 0.75], [0.6, 0.55], [0.95, 0.35]], E(u, 0.4, 1.6), BAD, { sw: 3 });
    tx(ax.X(0.95), ax.Y(0.93) - 12, 'recall', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' }); tx(ax.X(0.95), ax.Y(0.35) + 24, 'precision', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
    sub(320, 404, '(개념 그림 — 실측 곡선 아님)', fade(u, 1.6));
    [['QA · 요약', 'K=10~20 + Reranker', GOOD], ['정책 답변', 'K=3~5', INFO]].forEach(([a, b, col], i) => { const y = 120 + i * 110, s = pop(u, 1.4 + i * 0.4);
      card(740, y, 340, 80, { rx: 12, stroke: col, sw: 2, s }); tx(590, y - 8, a, { 'font-size': 16, 'font-weight': 800, opacity: s }); mono(590, y + 22, b, { 'font-size': 15, fill: col, opacity: s }); }); }

  // ---------- 5. 4축 대시보드 ----------
  const AX = [['faithfulness', 0.92, 0.85, '프롬프트 강화', GOOD], ['answer_relevancy', 0.88, 0.80, '질문 분류 · few-shot', INFO], ['context_precision', 0.78, 0.75, 'Reranker · 임베딩 fine-tune', WARN], ['context_recall', 0.85, 0.75, 'Top-K 5→10 · chunk · hybrid', ACC]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { AX.forEach(([n, , , , col], i) => { const cx = 140 + i * 228, s = pop(u, 0.2 + i * 0.3);
        card(cx, 160, 200, 150, { rx: 14, stroke: col, sw: 2.5, s }); mono(cx, 166, n, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s }); });
      mono(480, 60, 'from ragas.metrics import (…4개…)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      note(480, 320, '4축을 따로 돌리지 않고 한 번에 묶는다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 1) { const cols = ['question', 'answer', 'contexts', 'ground_truth'];
      cols.forEach((h, j) => { const x = 80 + j * 205, s = pop(u, 0.2 + j * 0.3); card(x + 95, 80, 190, 40, { rx: 6, text: h, fs: 14.5, mono: true, fw: 800, fill: j === 3 ? WARNBG : ACCBG, stroke: j === 3 ? WARN : ACC, s });
        for (let r = 0; r < 4; r++) el('rect', { x: x + 4, y: 116 + r * 42, width: 182, height: 34, rx: 5, fill: SOFT, opacity: fade(u, 0.6 + j * 0.3 + r * 0.1) }); });
      note(80, 330, 'ground_truth가 없으면 precision·recall을 못 잰다', fade(u, 2.0), { fill: WARN }); mono(80, 370, 'ds = Dataset.from_dict(eval_data)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { card(140, 200, 180, 200, { rx: 10, stroke: GRID, text: 'Dataset\n(평가셋)', fs: 15 });
      AX.forEach(([n, , , , col], i) => { const y = 70 + i * 86; card(720, y, 300, 60, { rx: 10, stroke: col, sw: 2, text: n, fs: 14.5, mono: true, color: col, s: pop(u, 0.2 + i * 0.15) });
        for (let d = 0; d < 3; d++) dot([[230, 200], [420, 200], [570, y]], seg(u, 0.5 + i * 0.2 + d * 0.3, 1.2 + i * 0.2 + d * 0.3), col, 6); });
      mono(400, 380, 'evaluate(ds, metrics=[…4축…])', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    // k ≥ 3: 막대
    AX.forEach(([n, v, b, fix, col], i) => { const y = 70 + i * 72, g = k === 3 ? E(u, 0.2 + i * 0.25, 1.0 + i * 0.25) : 1, dim = k === 7 ? 0.35 : 1;
      mono(300, y + 19, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: dim });
      if (k === 7) { gauge(320, y, 280, v, { col, h: 26, text: false }); grow(610, y + 13, 650, y + 13, E(u, 0.2 + i * 0.3, 0.6 + i * 0.3), MUT);
        tx(660, y + 19, n.includes('recall') ? fix : fix, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) }); return; }
      gauge(320, y, 400, v * g, { col, h: 28, base: k >= 4 ? b : null, text: f2(v * g) });
      if (k >= 4) mono(800, y + 20, `+${(v - b).toFixed(2)}`, { 'font-size': 15, 'font-weight': 800, fill: i === 2 ? WARN : GOOD, opacity: k === 4 ? fade(u, 0.6 + i * 0.25) : 1 }); });
    if (k === 3) { const av = 0.8575, g = E(u, 1.6, 2.2); el('line', { x1: 320 + 400 * av, y1: 56, x2: 320 + 400 * av, y2: 56 + 290 * g, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '2 4' });
      mono(320 + 400 * av, 50, '평균 0.86', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); ex(900, 40, 1);
      note(320, 390, '평균은 precision 0.78을 가린다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 4) { note(320, 390, '축마다 기준선이 다르다 — faithfulness만 0.85', fade(u, 1.6)); return; }
    if (k === 5) { mono(320, 390, 'failures = [ ]   ← 지금은 미달 0건', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
      el('rect', { x: 20, y: 70 + 2 * 72 - 10, width: 900, height: 48, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.4) });
      sub(640, 408, 'precision이 0.03만 떨어져도 failures에 들어간다', fade(u, 1.8)); return; }
    if (k === 6) { const st = [['PR', INK], ['4축 평가', ACC], ['기준선 비교', WARN]];
      st.forEach(([n, col], i) => card(150 + i * 200, 370, 160, 44, { rx: 8, stroke: col, text: n, fs: 14.5, s: pop(u, 0.2 + i * 0.3) }));
      [0, 1].forEach((i) => grow(232 + i * 200, 370, 268 + i * 200, 370, E(u, 0.4 + i * 0.3, 0.7 + i * 0.3), MUT));
      grow(632, 370, 700, 370, E(u, 1.2, 1.5), BAD); card(790, 370, 160, 44, { rx: 8, stroke: BAD, fill: BADBG, text: '미달 → exit(1)', fs: 14.5, color: BAD, s: pop(u, 1.5) });
      cross(900, 370, 10, pop(u, 1.8)); return; }
    note(320, 390, '한 축이라도 5% 하락하면 알람 — 어느 축인지가 작업 지시서다', fade(u, 1.8)); }

  const quiz = [
    { q: 'context에 "7일 이내"만 있는데 답이 "30일 이내라면 무조건 가능"이라고 했다. claim 세 개가 모두 근거 없으면 faithfulness는 얼마인가?',
      o: ['0.00', '0.33', '판정할 수 없다'], a: 0,
      why: 'supported / 전체 claim = 0 / 3이다. 충실한 답 A는 3 / 3 = 1.00이었다.' },
    { q: '"환불은 미개봉 상품에 한합니다. 좋은 하루 되세요."는 환각이 없는데 왜 점수가 낮게 나오는가?',
      o: ['faithfulness가 0이라서', '질문이 물은 "기간"에 답하지 않아 relevancy가 낮아서', 'context precision이 낮아서'], a: 1,
      why: '사실은 맞지만 질문에 답하지 않았다. 답에서 역으로 만든 질문이 원 질문과 멀어져 relevancy가 떨어진다(예시 0.30).' },
    { q: '검색된 5개 중 1·3·5번만 관련 있을 때 RAGAS의 context precision이 0.60이 아니라 0.76인 이유는 무엇인가?',
      o: ['관련 chunk가 놓인 자리의 precision@k를 평균해 순서를 반영해서', '임베딩 유사도를 함께 곱해서', '무관한 chunk를 반만 세서'], a: 0,
      why: '(1.00 + 0.67 + 0.60) / 3 = 0.76이다. 관련 chunk가 위에 있을수록 점수가 오른다.' },
    { q: 'precision 0.60, recall 0.80일 때 F1은 얼마인가?',
      o: ['0.70', '0.80', '0.69'], a: 2,
      why: '2 × 0.60 × 0.80 / 1.40 = 0.686이다. 조화 평균이라 산술 평균 0.70보다 낮은 쪽으로 끌린다.' },
    { q: '대시보드에서 context_recall만 기준선 아래로 떨어졌다. 먼저 손볼 곳은 어디인가?',
      o: ['시스템 프롬프트의 환각 금지 문구', 'Top-K, chunk 크기, 하이브리드 검색', 'judge 모델의 temperature'], a: 1,
      why: 'recall은 필요한 사실을 검색이 다 가져왔는지다. 검색 쪽(K, chunk, BM25+dense)을 고친다.' },
  ];

  const summary = [
    'faithfulness는 답을 claim으로 쪼개 context에서 추론되는 비율을 잰다. 환각 답 B는 0/3이었다.',
    'answer relevancy는 답에서 질문을 거꾸로 만들어 원 질문과 비교한다. 딴말과 거부를 잡는다.',
    'context precision은 검색 결과 중 쓸모 있는 비율이고, 3/5면 0.60, 순서를 반영하면 0.76이다.',
    'context recall은 정답의 사실 중 검색이 덮은 비율이다. 네 축은 평균이 아니라 따로 본다.',
  ];
  const review = [
    { q: '프롬프트를 바꾼 뒤 faithfulness는 그대로인데 relevancy만 크게 떨어졌다. 가장 그럴듯한 증상은?',
      o: ['답에 없는 사실을 지어낸다', '사실은 맞지만 질문과 다른 이야기를 한다', '검색이 필요한 문서를 못 가져온다'], a: 1,
      why: '두 축 조합에서 faithful 높음, relevancy 낮음은 동문서답이다. 환각이면 faithfulness가 떨어진다.' },
    { q: '답이 자꾸 "배송비" 같은 내용을 빠뜨린다. 4축 중 무엇이 먼저 낮게 나올까?',
      o: ['context precision', 'faithfulness', 'context recall'], a: 2,
      why: '필요한 사실을 검색이 못 가져오면 recall이 떨어진다. 이 장의 예에서 배송비 하나 때문에 0.80이 됐다.' },
    { q: '4축 평균이 0.86으로 괜찮아 보여 배포하려 한다. 무엇을 확인해야 할까?',
      o: ['축마다 기준선과의 차이, 특히 0.03뿐인 precision', '평균이 0.85를 넘었는지만', 'relevancy 예시 값이 0.92인지'], a: 0,
      why: '평균은 낮은 축을 가린다. precision 0.78은 기준선 0.75와 0.03 차이라 조금만 떨어져도 게이트에 걸린다.' },
  ];

  R.page({ title: 'RAGAS 4축 채점판', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
