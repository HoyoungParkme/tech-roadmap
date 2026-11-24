/* V-2-1 LLM-as-Judge — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, person, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const A_TXT = ['RAG는 외부 문서를 검색해서 LLM 답변에', '참고하는 기법입니다. 환각을 줄이고', '최신 정보를 반영할 수 있습니다.'];
  const B_TXT = ['RAG는 검색을 활용한 생성 모델인데요,', '정말 다양한 분야에 쓰이고요, 매우', '유용하며, 많은 회사들이 사용합니다.'];
  function answer(cx, cy, w, head, lines, o) { o = o || {};
    const h = 40 + lines.length * 22, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash }, g);
    tx(-w / 2 + 14, -h / 2 + 22, head, { 'font-size': 14, 'font-weight': 700, fill: o.hcol || MUT }, g);
    lines.forEach((l, i) => tx(-w / 2 + 14, -h / 2 + 46 + i * 22, l, { 'font-size': 14 }, g)); return g; }

  // ── 1. 사람 평가: 1만 건을 손으로
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    person(80, 120, '평가자', {});
    answer(320, 112, 360, '답변 A · gpt-4o-mini', A_TXT);
    card(320, 206, 200, 34, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.5, text: '점수 (1~5): ' + (Math.floor(t * 2) % 2 ? '▏' : ' '), fs: 14, mono: true });
    if (k === 0) { clock(80, 300, 30, E(u, 0.3, 2.4), WARN, '건당 30초'); grow(110, 130, 136, 130, fade(u, 0.3), MUT); }
    if (k === 1) { const n = Math.round(lerp(1, 10000, E(u, 0.3, 2.2)));
      for (let i = 5; i >= 0; i--) el('rect', { x: 150 + i * 8, y: 268 - i * 8, width: 170, height: 110, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
      mono(150, 300, 'eval_set.csv', { 'font-size': 14, fill: MUT });
      mono(150, 340, n.toLocaleString('en-US') + '건', { 'font-size': 24, 'font-weight': 800, fill: BAD });
      tx(150, 370, '한 건마다 사람이 붙는다', { 'font-size': 13.5, fill: MUT }); }
    if (k === 2) { mono(30, 290, '10,000 × 30초 = 300,000초', { 'font-size': 16, opacity: fade(u, 0.2) });
      mono(30, 322, `≈ ${tween(0, 83.3, u, 1.4).toFixed(1)}시간`, { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.5) });
      mono(30, 360, `× 시급 $25 ≈ $${Math.round(tween(0, 2083, u, 2)).toLocaleString('en-US')}`, { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); }
    if (k === 3) { [['3', 60], ['4', 160], ['5', 260]].forEach(([s, x], i) => { person(x, 320, null, { s: pop(u, 0.2 + i * 0.2) });
        card(x + 26, 276, 30, 30, { rx: 15, fill: WARN, stroke: 'none', text: s, fs: 15, fw: 800, s: pop(u, 0.5 + i * 0.2) }); });
      tx(160, 388, '같은 답, 다른 점수 (예시) · κ < 0.6', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      pill(400, 300, 'BLEU / ROUGE', MUT, pop(u, 1.4), { fs: 14 });
      tx(400, 336, '단어 겹침만 센다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) });
      tx(400, 356, '뜻은 못 본다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) }); }
    // 오른쪽 비교표
    const X = 540, rows = (b.verdict && b.verdict.rows) || [], prow = (p.verdict && p.verdict.rows) || [];
    el('rect', { x: X, y: 30, width: 404, height: 64 + rows.length * 54, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    tx(X + 210, 62, '사람', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD }); tx(X + 330, 62, 'LLM Judge', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
    rows.forEach((r, i) => { const y = 106 + i * 54, fresh = !prow.some((q) => q.label === r.label), s = fresh ? pop(u, 0.4) : 1;
      el('line', { x1: X + 12, y1: y - 26, x2: X + 392, y2: y - 26, stroke: GRID, 'stroke-width': 1 });
      tx(X + 16, y + 5, r.label, { 'font-size': 14.5, 'font-weight': 700, opacity: s });
      card(X + 210, y, 110, 32, { rx: 8, fill: BADBG, stroke: 'none', text: r.human, fs: 14.5, s });
      card(X + 330, y, 110, 32, { rx: 8, fill: GOODBG, stroke: 'none', text: r.llm, fs: 14.5, s }); });
    sub(X + 202, 410, 'LLM 쪽 값은 이 장의 예시', 1); }

  // ── 2. Judge 체인: 프롬프트 | judge_llm | 파서 → "점수: 4"
  function s2(t, c) { const { k, u } = c, Y = 250;
    answer(480, 58, 560, '평가 대상 · 답변 A (gpt-4o-mini)', [A_TXT[0] + ' ' + A_TXT[1].slice(0, 9) + ' …'], { stroke: GRID });
    // 프롬프트 카드
    const P = [[2, '당신은 엄격한 채점관입니다.'], [2, '1~5점을 매기고 이유를 설명하세요.'], [3, '[질문]: {question}'], [3, '[답변]: {answer}'], [3, '출력: "점수: <1~5>\\n이유: <한 문장>"']];
    el('rect', { x: 20, y: 120, width: 330, height: 236, rx: 10, fill: PANEL, stroke: k >= 2 ? INK : MUT, 'stroke-width': 2, 'stroke-dasharray': k >= 2 ? null : '6 5' });
    tx(36, 146, 'judge_prompt', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    P.forEach(([kk, s], i) => { if (k < kk) return; const o = k === kk ? fade(u, 0.3 + i * 0.25) : 1, slot = s.includes('{');
      const filled = slot && k >= 4 && (k > 4 || u > 1.1);
      tx(36, 182 + i * 34, filled ? (i === 2 ? '[질문]: RAG는 무엇인가요?' : '[답변]: RAG는 외부 문서를 …') : s, { 'font-size': i === 4 ? 13.5 : 14.5, fill: filled ? GOOD : slot && i < 4 ? ACC : INK, 'font-weight': slot ? 700 : 500, opacity: o, class: i === 4 ? 'mono' : null }); });
    if (k === 0) pill(185, 238, '부품만 올려 둔 상태', MUT, pop(u, 0.3), { fs: 14 });
    // Judge · 파서
    const judgeOn = k >= 1;
    card(500, Y, 150, 96, { rx: 12, fill: judgeOn ? ACCBG : PANEL, stroke: judgeOn ? ACC : MUT, sw: 2.4, dash: judgeOn ? null : '6 5', text: judgeOn ? 'gpt-4o\nJudge' : 'ChatOpenAI', fs: 16, fw: 800, s: k === 0 ? pop(u, 0.5) : 1 });
    if (judgeOn) { mono(500, Y + 70, 'temperature=0', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: k === 1 ? fade(u, 0.8) : 1 });
      if (k === 1) tx(500, Y + 94, '같은 답 → 같은 점수', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) }); }
    card(680, Y, 130, 56, { rx: 10, fill: PANEL, stroke: MUT, sw: 2, text: 'StrOutput\nParser', fs: 14, s: k === 0 ? pop(u, 0.8) : 1 });
    if (k === 0) { mono(500, 380, 'input("점수 (1~5): ")', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      el('line', { x1: 410, y1: 375, x2: lerp(410, 590, E(u, 1.5, 2.2)), y2: 375, stroke: BAD, 'stroke-width': 3 }); }
    // 파이프
    if (k >= 4) { [[350, 425], [575, 615]].forEach(([a, z], i) => { const g = k === 4 ? E(u, 0.1 + i * 0.2, 0.5 + i * 0.2) : 1;
        grow(a, Y, lerp(a, z, g), Y, g, ACC, { sw: 2.6 }); mono((a + z) / 2, Y - 10, '|', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: g }); });
      if (k === 4) { fly(480, 92, 230, 250, seg(u, 0.4, 1.1), 'question · answer', { fill: GOOD }); dot([[350, Y], [425, Y], [575, Y], [615, Y]], seg(u, 1.3, 2.4), WARN, 7);} }
    if (k === 5) { grow(745, Y, 770, Y, 1, ACC);
      card(860, Y, 176, 92, { rx: 10, fill: GOODBG, stroke: GOOD, sw: 2, text: '점수: 4\n이유: 예시 부족', fs: 15, s: pop(u, 0.3) });
      sub(860, Y + 66, 'LLM 출력은 예시', fade(u, 0.8));
      mono(670, 384, '1만 건: 83시간 · $2,083  →  수 분 · 약 $30', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); } }

  // ── 3. 기준 세 개: JSON 문자열이 dict 가 되고 막대 세 개로
  const CRIT = [['faithfulness', '사실에 부합 · 환각 X'], ['relevance', '질문에 답하는가'], ['helpfulness', '실제로 도움이 되나']];
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const sc = (b.verdict && b.verdict.scores) || [], ps = (p.verdict && p.verdict.scores) || [];
    // 오른쪽: 기준 막대
    const GX = 640;
    tx(GX, 46, '항목별 점수 (1~5)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    CRIT.forEach(([key, d], i) => { const y = 92 + i * 84, v = sc[i] ? tween(ps[i] ? ps[i].value : 0, sc[i].value, u) : 0, weak = k === 6 && key === 'helpfulness';
      if (weak) el('rect', { x: GX - 10, y: y - 28, width: 310, height: 74, rx: 8, fill: WARNBG });
      mono(GX, y, key, { 'font-size': 15, 'font-weight': 700 });
      if (k >= 3) tx(GX, y + 20, d, { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 0.3 + i * 0.3) : 1 });
      hbar(GX, y + 30, 230, v, 5, { h: 14, col: weak ? WARN : ACC, text: k === 5 ? '…' : v > 0 ? v.toFixed(0) : '—' }); });
    if (k === 6) { mono(GX, 352, `합계 ${Math.round(tween(0, 12, u))} / 15`, { 'font-size': 20, 'font-weight': 800, fill: ACC });
      tx(GX, 380, '약점: helpfulness · 예시 부족', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) }); }
    // 왼쪽
    if (k === 0) { ['JsonOutputParser', 'BaseModel · Field'].forEach((s, i) => pill(170, 110 + i * 50, s, ACC, pop(u, 0.2 + i * 0.3), { mono: true }));
      mono(170, 240, '"점수: 4 / 이유: …"', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) });
      el('line', { x1: 60, y1: 235, x2: lerp(60, 280, E(u, 1.2, 1.9)), y2: 235, stroke: BAD, 'stroke-width': 3 });
      tx(170, 270, '숫자 하나로는 약점이 안 보인다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); }
    if (k >= 1 && k <= 3) { const rows = ['class CriteriaScore(BaseModel):', '  faithfulness: int  1~5', '  relevance:    int  1~5', '  helpfulness:  int  1~5', '  rationale: str'];
      el('rect', { x: 20, y: 60, width: 330, height: 160, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      rows.forEach((s, i) => mono(34, 90 + i * 28, s, { 'font-size': 14, 'font-weight': i ? 500 : 700, opacity: k === 1 ? fade(u, 0.2 + i * 0.3) : 1 }));
      if (k === 1) tx(185, 246, '스키마는 Judge에게 줄 형식 안내문이 된다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { const X = 20;
      mono(X, 268, "'{\"faithfulness\": 4, \"relevance\": 5, …}'", { 'font-size': 14, fill: MUT });
      grow(185, 278, 185, 300, seg(u, 0.4, 0.8), ACC);
      card(185, 320, 330, 34, { rx: 8, fill: ACCBG, stroke: ACC, sw: 1.8, text: "dict  {'faithfulness': 4, …}", fs: 14, mono: true, s: pop(u, 0.8) });
      card(185, 372, 330, 40, { rx: 8, fill: WARNBG, stroke: WARN, sw: 1.8, text: '"faithfulness": 9 도 그대로 통과\n범위 검사는 PydanticOutputParser', fs: 13.5, s: pop(u, 1.6) }); }
    if (k >= 4) { const lines = ['당신은 RAG 답변 평가관입니다. 3기준 1~5점.', '[질문]: {question}', '[답변]: {answer}', '{format_instructions}'];
      el('rect', { x: 20, y: 60, width: 360, height: 170, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      lines.forEach((s, i) => { const fi = i === 3 && (k > 4 || u > 1.2);
        tx(34, 96 + i * 34, fi ? '← 형식 안내문 1,412자' : s, { 'font-size': 14, fill: i ? (fi ? GOOD : ACC) : INK, 'font-weight': i ? 700 : 500, class: i && !fi ? 'mono' : null }); });
      if (k === 4) { fly(200, 330, 200, 198, seg(u, 0.3, 1.2), '.partial(format_instructions=…)', { mono: true });
        tx(200, 270, 'langchain-core 1.8 기준 길이', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); }
      if (k >= 5) { mono(200, 270, 'prompt | judge | parser', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
        if (k === 5) dot([[380, 145], [500, 145], [500, 200], [GX - 20, 200]], seg(u, 0.3, 2.2), WARN, 7);
        if (k === 6) card(250, 340, 440, 34, { rx: 8, fill: ACCBG, stroke: ACC, sw: 1.8, text: "{'faithfulness': 4, 'relevance': 5, 'helpfulness': 3, …}", fs: 13.5, mono: true, s: pop(u, 0.2) }); } } }

  // ── 4. Pairwise: 저울이 더 나은 답 쪽으로 기운다
  function s4(t, c) { const { k, u } = c, b = c.beat;
    const v = b.verdict || {}, bScore = v.b ? v.b.score : 0;
    const winA = k === 5;
    answer(180, 100, 330, 'A · gpt-4o-mini · 12/15', A_TXT, { stroke: winA ? GOOD : INK, hcol: winA ? GOOD : MUT });
    if (k >= 1) answer(780, 100, 330, `B · gpt-3.5-turbo · ${k === 5 ? Math.round(tween(0, bScore, u)) + '/15' : '채점 전'}`, B_TXT, { s: k === 1 ? pop(u, 0.2) : 1, stroke: k === 5 ? BAD : INK, hcol: k === 5 ? BAD : MUT });
    else answer(780, 100, 330, 'B · 아직 없음', ['', '', ''], { dash: '6 5', stroke: MUT });
    if (k === 5) { ['"다양한 분야"', '"매우 유용"'].forEach((s, i) => pill(720 + i * 130, 176, s, BAD, pop(u, 0.9 + i * 0.3), { fs: 13.5 }));
      pill(180, 26, 'WINNER', GOOD, pop(u, 1.2), { fs: 13.5 }); pill(780, 26, 'LOSE', BAD, pop(u, 1.2), { fs: 13.5 }); }
    // 저울
    const ang = k === 5 ? lerp(0, -9, E(u, 0.3, 1.4)) : k === 4 ? Math.sin(t * 5) * 4 : 0, cx = 480, cy = 236;
    el('path', { d: `M${cx - 30},${cy + 96} L${cx},${cy + 6} L${cx + 30},${cy + 96} Z`, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    const g = el('g', { transform: `rotate(${ang} ${cx} ${cy})` });
    el('line', { x1: cx - 200, y1: cy, x2: cx + 200, y2: cy, stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    el('circle', { cx, cy, r: 8, fill: ACC }, g);
    [-200, 200].forEach((dx) => { const px = cx + dx, py = cy;
      const r = (ang * Math.PI) / 180, ex = cx + dx * Math.cos(r), ey = cy + dx * Math.sin(r);
      el('line', { x1: ex, y1: ey, x2: ex - 36, y2: ey + 44, stroke: MUT, 'stroke-width': 1.6 }); el('line', { x1: ex, y1: ey, x2: ex + 36, y2: ey + 44, stroke: MUT, 'stroke-width': 1.6 });
      el('path', { d: `M${ex - 46},${ey + 44} Q${ex},${ey + 70} ${ex + 46},${ey + 44} Z`, fill: dx < 0 ? (winA ? GOODBG : PANEL) : (k === 5 ? BADBG : PANEL), stroke: INK, 'stroke-width': 2 });
      tx(ex, ey + 60, dx < 0 ? 'A' : 'B', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); });
    tx(cx, cy - 18, 'gpt-4o Judge', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    // 아래 줄: beat 마다 하나
    const Yb = 388;
    if (k === 0) { pill(cx, Yb - 30, 'from typing import Literal', ACC, pop(u, 0.3), { mono: true, fs: 14 });
      tx(cx, Yb + 6, '절대 점수 대신 둘 중 고르기', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1) }); }
    if (k === 1) ['"A"', '"B"', '"tie"'].forEach((s, i) => pill(cx - 90 + i * 90, Yb, s, INK, pop(u, 0.8 + i * 0.25), { mono: true }));
    if (k === 2) { fly(180, 150, 380, Yb, seg(u, 0.2, 1.0), '{answer_a}', { mono: true, stay: true }); fly(780, 150, 580, Yb, seg(u, 0.6, 1.4), '{answer_b}', { mono: true, stay: true });
      tx(cx, Yb + 5, '한 프롬프트', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 3) card(cx, Yb, 470, 36, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.6, text: '{"winner": "A" | "B" | "tie", "rationale": "…"}', fs: 14, mono: true, s: pop(u, 0.3) });
    if (k === 4) tx(cx, Yb, 'Judge가 두 답을 나란히 읽는 중', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
    if (k === 5) card(cx, Yb, 600, 36, { rx: 8, fill: GOODBG, stroke: GOOD, sw: 1.8, text: 'winner: A · B는 정의 없이 공허한 표현만 나열 (예시)', fs: 14, s: pop(u, 1.6) }); }

  // ── 5. 편향과 비용
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const bi = (b.verdict && b.verdict.biases) || [], pb = ((p.verdict && p.verdict.biases) || []).length;
    const mit = (b.verdict && b.verdict.mitigation) || [], pm = ((p.verdict && p.verdict.mitigation) || []).map((m) => m.text);
    tx(24, 40, 'Judge가 더 얹어 주는 점수 (예시 수치)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    bi.forEach((x, i) => { const y = 74 + i * 56, fresh = i >= pb, g = fresh ? E(u, 0.3, 1.3) : 1;
      tx(24, y + 4, x.label, { 'font-size': 14.5, 'font-weight': 700 });
      el('rect', { x: 24, y: y + 14, width: 360, height: 16, rx: 4, fill: SOFT });
      el('rect', { x: 24, y: y + 14, width: 360 * x.delta / 0.5 * g, height: 16, rx: 4, fill: x.delta >= 0.4 ? BAD : WARN });
      mono(24 + 360 * x.delta / 0.5 * g + 8, y + 27, '+' + (x.delta * g).toFixed(1), { 'font-size': 14, 'font-weight': 800, fill: x.delta >= 0.4 ? BAD : WARN }); });
    // 오른쪽: 완화책
    tx(520, 40, '완화책', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    mit.forEach((m, i) => { const fresh = !pm.includes(m.text), y = 76 + i * 50;
      card(730, y, 420, 40, { rx: 8, fill: GOODBG, stroke: GOOD, sw: 1.6, text: m.text.replace(' — ', ' · '), fs: 14, s: fresh ? pop(u, 0.9) : 1 }); });
    // 아래: 이 beat 의 그림
    const Y = 330;
    el('line', { x1: 20, y1: 252, x2: 940, y2: 252, stroke: GRID, 'stroke-width': 1.2 });
    if (k === 0) { card(260, Y, 170, 52, { rx: 10, stroke: ACC, sw: 2, text: 'GPT-4 Judge', fs: 15 });
      card(660, Y, 190, 52, { rx: 10, stroke: ACC, sw: 2, fill: ACCBG, text: 'GPT-4 계열 답', fs: 15 });
      grow(345, Y, 565, Y, seg(u, 0.4, 1.2), ACC); pill(455, Y - 30, '+0.3', BAD, pop(u, 1.3), { fs: 14 });
      tx(480, 392, 'Judge와 Student 계열을 가른다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 1) { const sw = E(u, 0.6, 1.6);
      card(lerp(330, 430, sw), Y, 80, 44, { rx: 8, stroke: INFO, sw: 2, text: 'A', fs: 16, fw: 800 }); card(lerp(430, 330, sw), Y, 80, 44, { rx: 8, stroke: WARN, sw: 2, text: 'B', fs: 16, fw: 800 });
      tx(380, Y + 50, '(A,B) 와 (B,A) 두 번', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      grow(500, Y, 590, Y, seg(u, 1.6, 2.1), ACC); card(680, Y, 150, 44, { rx: 8, fill: GOODBG, stroke: GOOD, sw: 2, text: '평균', fs: 15, s: pop(u, 2.0) }); }
    if (k === 2) { [['짧고 정확한 답', 160], ['길고 장황한 답', 400]].forEach(([s, w], i) => { const y = Y - 26 + i * 44, g = E(u, 0.2 + i * 0.4, 1.0 + i * 0.4);
        tx(24, y + 5, s, { 'font-size': 14 }); el('rect', { x: 150, y: y - 9, width: w * g, height: 18, rx: 4, fill: i ? WARN : INFO }); });
      pill(700, Y - 4, '"간결성도 중요" 명시', GOOD, pop(u, 1.6), { fs: 14 }); sub(300, 400, '막대 길이 = 답 길이', fade(u, 1)); }
    if (k === 3) { mono(40, Y - 10, '$30 / 10,000건', { 'font-size': 22, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      tx(40, Y + 20, 'GPT-4 Judge · criteria 3종', { 'font-size': 14, fill: MUT });
      grow(330, Y - 16, 430, Y - 16, seg(u, 0.8, 1.3), MUT);
      mono(460, Y - 10, `매일 × 30일 ≈ $${Math.round(tween(0, 900, u, 1.6))}`, { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) });
      tx(460, Y + 20, '월 $1,000 단위 · 회귀 셋만 Judge로', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 4) { for (let i = 0; i < 100; i++) { const x = 40 + (i % 25) * 15, y = 280 + Math.floor(i / 25) * 15, h = i % 20 === 7;
        el('circle', { cx: x, cy: y, r: 5, fill: h && u > 0.6 + (i / 100) ? ACC : OFF }); }
      tx(40, 360, '무작위 5% 는 사람이 다시 본다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      pill(700, Y - 10, '사람과 일치 0.7 ~ 0.85', INFO, pop(u, 1.6), { fs: 14 }); }
    if (k === 5) ['Pairwise', '위치 swap', '다중 Judge', '인간 5%'].forEach((s, i) => { card(130 + i * 233, Y, 200, 50, { rx: 25, fill: ACCBG, stroke: ACC, sw: 2, text: s, fs: 16, fw: 800, s: pop(u, 0.2 + i * 0.3) });
      if (i) tx(130 + i * 233 - 116, Y + 6, '+', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); }); }

  const quiz = [
    { q: 'eval_set.csv 1만 건을 한 건에 30초씩 사람이 채점하면 대략 얼마나 걸리는가?',
      o: ['약 8시간', '약 83시간', '약 830시간'], a: 1,
      why: '10,000 × 30초 = 300,000초, 약 83시간이다. 시급 $25면 약 $2,083이 든다.' },
    { q: 'Judge 모델을 temperature=0으로 두는 이유는 무엇인가?',
      o: ['채점 속도를 높이려고', '토큰 비용을 줄이려고', '같은 답에 같은 점수가 나오게 하려고'], a: 2,
      why: '온도가 높으면 같은 답에도 점수가 흔들린다. 채점은 재현돼야 하므로 0으로 둔다.' },
    { q: 'JsonOutputParser(pydantic_object=CriteriaScore)가 {"faithfulness": 9, …}를 받으면 어떻게 되는가?',
      o: ['9가 든 dict를 그대로 돌려준다', '1~5 범위를 벗어나 예외를 던진다', '5로 잘라서 돌려준다'], a: 0,
      why: '스키마는 형식 안내문에만 쓰이고 값 검사는 하지 않는다(langchain-core 1.8로 확인). 범위까지 보려면 PydanticOutputParser를 쓴다.' },
    { q: '두 답을 나란히 보여 주고 고르게 하는 pairwise 방식의 장점은 무엇인가?',
      o: ['Judge 호출 비용이 들지 않는다', '절대 점수보다 판정이 덜 흔들린다', '위치 편향이 사라진다'], a: 1,
      why: '"몇 점인가"보다 "어느 쪽이 나은가"가 Judge에게 쉬운 질문이다. 다만 위치 편향은 남아 순서를 바꿔 한 번 더 돌린다.' },
    { q: 'Pairwise에서 위치 편향을 줄이는 방법은 무엇인가?',
      o: ['(A,B)와 (B,A)로 두 번 평가해 평균 낸다', '항상 좋은 답을 먼저 보여 준다', 'Judge 온도를 높인다'], a: 0,
      why: '먼저 본 답이 유리해지는 만큼 순서를 바꿔 한 번 더 재면 그 차이가 상쇄된다.' },
  ];

  const summary = [
    '사람이 1만 건을 30초씩 채점하면 83시간, 시급 $25로 약 $2,083이 들고 기준도 흔들린다.',
    'Judge LLM에 질문과 답을 넣고 점수와 이유를 받으면 같은 일을 수 분 안에 끝낸다.',
    '기준을 faithfulness·relevance·helpfulness로 나누면 4·5·3처럼 약점이 드러난다.',
    'Judge도 위치·장문·자기 편향이 있어 순서 바꾸기와 사람 5% 재검토를 함께 쓴다.',
  ];
  const review = [
    { q: 'Judge 점수가 답이 길수록 높게 나온다. 먼저 손볼 곳은?',
      o: ['Judge 프롬프트에 간결성도 평가하라고 적는다', '더 길게 답하도록 학생 모델을 바꾼다', 'Judge 온도를 높인다'], a: 0,
      why: '장문 편향은 세 편향 중 가장 컸다(+0.4, 예시). 채점 기준에 간결성을 넣어 길이만으로 점수가 오르지 않게 한다.' },
    { q: '답변이 faithfulness 4, relevance 5, helpfulness 3을 받았다. 프롬프트를 고칠 방향은?',
      o: ['문서를 더 넣어 환각을 줄인다', '예시를 들어 설명하도록 지시한다', '질문과 관련 없는 내용을 뺀다'], a: 1,
      why: '사실성과 관련성은 이미 높고 helpfulness만 낮다. Judge의 이유도 예시 부족이었다.' },
    { q: '새 모델과 옛 모델을 Judge로 비교하는데 Judge가 새 모델과 같은 계열이다. 알맞은 조치는?',
      o: ['그대로 절대 점수로 비교한다', 'pairwise로 바꾸고 한 번만 돌린다', '계열이 다른 Judge를 함께 써서 점수를 모은다'], a: 2,
      why: '자기 편향 때문에 같은 계열 답을 후하게 볼 수 있다. 다른 계열 Judge를 섞으면 한쪽 편향이 묽어진다.' },
  ];

  R.page({ title: 'LLM 판사의 채점', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
