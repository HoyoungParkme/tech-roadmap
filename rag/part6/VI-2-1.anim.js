/* VI-2-1 Agentic RAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * cycle·도구·답은 페이지 STEPS 의 cycles / tools / finalAnswer 를 읽는다. Thought 문장과 답은 예시 출력이다.
 * 계산 값: 1550000 / 1400 = 1107.142857142857 (Python 으로 확인) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, dot, cross, check, dbIcon, terminal, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function bubble(x, y, s, o) { o = o || {}; const fs = o.fs || 15, w = tw(s, fs) + 30, h = fs + 20, g = G(x, y, o.s, o.op);
    el('path', { d: `M18,${h / 2 - 3} l-8,12 l20,-10`, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: 0, y: -h / 2, width: w, height: h, rx: h / 2, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2 }, g);
    tx(15, fs * 0.36, s, { 'font-size': fs, 'font-weight': 700, fill: o.color || INK }, g); return w; }
  const TOOL = { retriever: ['search_docs', INFO], calc: ['calculator', WARN], api: ['fx_rate', GOOD] };
  // 도구 카드
  function tool(cx, cy, id, o) { o = o || {}; const [n, col] = TOOL[id], on = o.on !== false;
    const g = card(cx, cy, o.w || 230, 58, { rx: 10, stroke: on ? col : GRID, sw: 2.4, fill: on ? PANEL : SOFT, s: o.s, op: o.op });
    mono(0, -4, n + '()', { 'font-size': 15.5, 'font-weight': 800, fill: on ? col : MUT, 'text-anchor': 'middle' }, g);
    tx(0, 17, o.sub || { retriever: '사내 문서 벡터 검색', calc: '수식 계산', api: '실시간 환율 조회' }[id], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g);
    mono(-(o.w || 230) / 2 + 10, -38, '@tool', { 'font-size': 13.5, 'font-weight': 700, fill: ACC }, g); return g; }
  // ReAct 고리: Thought → Action → Observation
  function loop(cx, cy, r, u0, o) { o = o || {}; const P = [[cx, cy - r, 'Thought', ACC], [cx + r * 0.87, cy + r * 0.5, 'Action', INFO], [cx - r * 0.87, cy + r * 0.5, 'Observation', GOOD]];
    const a = clamp(u0); el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': `${a * 2 * Math.PI * r} 999` , transform: `rotate(-90 ${cx} ${cy})` });
    P.forEach(([x, y, n, col], i) => { const s = clamp(u0 * 3 - i); card(x, y, tw(n, 15) + 26, 34, { rx: 17, text: n, fs: 15, fw: 800, stroke: col, color: col, fill: PANEL, s }); });
    return P; }
  const around = (cx, cy, r, f) => { const a = -Math.PI / 2 + f * 2 * Math.PI; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };

  // ---------- 1. 정적 RAG ----------
  function s1(t, c) { const { k, u } = c, y = 200;
    bubble(20, 60, '아이폰 16 프로 출고가와 달러 가격?', { s: k === 0 ? pop(u, 0.1) : 1 });
    dbIcon(150, y, 'retriever (k=3)', { s: k === 0 ? pop(u, 0.3) : 1 });
    const pg = card(420, y, 260, 96, { rx: 10, stroke: INK, s: k === 0 ? pop(u, 0.6) : 1 });
    mono(-115, -22, 'prompt', { 'font-size': 14, 'font-weight': 800, fill: ACC }, pg); mono(-115, 6, k >= 2 && (k > 2 || u > 1.3) ? '자료:' : '자료: {context}', { 'font-size': 14 }, pg); mono(-115, 32, '질문: {question}', { 'font-size': 14 }, pg);
    card(640, y, 120, 54, { text: 'LLM', fs: 16, fw: 800, stroke: INK, s: k === 0 ? pop(u, 0.9) : 1 });
    [[200, 286], [552, 578], [702, 742]].forEach(([a, b], i) => grow(a, y, b, y, k === 0 ? E(u, 1.2 + i * 0.3, 1.6 + i * 0.3) : 1, MUT));
    tx(480, 400, '한 방향으로만 흐른다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 0 ? fade(u, 2.2) : 1 });
    if (k === 0) return;
    const D = '출고가 1,550,000원';
    if (k === 1) { dot([[60, 82], [60, 140], [100, y]], seg(u, 0.2, 0.9), INFO, 7); }
    const f = k === 1 ? E(u, 1.0, 1.8) : 1, g2 = k === 2 ? E(u, 0.3, 1.4) : k > 2 ? 1 : 0;
    if (f > 0) card(lerp(150, 424, g2), lerp(lerp(y, 320, f), y + 2, g2), tw(D, 14) + 24, 30, { rx: 6, text: D, fs: 14, fw: 700, stroke: INFO, fill: INFOBG, s: lerp(1, 0.85, g2), op: 1 });
    if (k === 1) tx(150, 360, '문서 1건 회수', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    if (k === 2) dot([[552, y], [578, y]], seg(u, 1.6, 2.3), INK, 6);
    if (k < 3) return;
    const a = k === 3 ? fade(u, 0.3) : 1;
    tx(780, 150, '답 (예시 출력)', { 'font-size': 13.5, fill: MUT, opacity: a });
    card(855, 210, 160, 92, { rx: 10, stroke: WARN, sw: 2, op: a });
    tx(788, 198, '1,550,000원', { 'font-size': 15, 'font-weight': 800, opacity: a }); check(918, 192, 8, k === 3 ? pop(u, 0.7) : 1);
    tx(788, 232, '달러 가격 ?', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: a }); cross(918, 227, 7, k === 3 ? pop(u, 1.2) : 1);
    if (k === 4) { const lu = E(u, 0.3, 1.5);
      el('path', { d: `M855,256 C855,${lerp(256, 330, lu)} 150,330 150,${lerp(330, 262, lu)}`, fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: lu > 0 ? 1 : 0 });
      card(500, 330, 230, 36, { rx: 18, text: '다시 검색할 길이 없다', fs: 15, fw: 800, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.4) });
      card(800, 380, 200, 32, { rx: 16, text: '계산 도구도 없다', fs: 14, fw: 700, stroke: BAD, color: BAD, s: pop(u, 1.9) }); } }

  // ---------- 2. retriever 를 도구로 ----------
  const L2 = [680, 220, 112];
  function s2(t, c) { const { k, u } = c, cy = c.beat.cycles;
    tool(190, 110, 'retriever', { s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { card(190, 200, 340, 52, { rx: 8, stroke: ACC, dash: '5 4', fill: ACCBG, op: fade(u, 1.0) });
      tx(30, 196, 'docstring = 도구 설명서', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      tx(30, 216, '"사내 문서 벡터 DB에서 검색한다"', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) }); return; }
    // 도구 목록
    zone(30, 180, 330, 80, 'tools = [ … ]', { fill: SOFT });
    card(110, 228, 130, 32, { rx: 16, text: 'search_docs', mono: true, fs: 14, fw: 800, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.4) : 1 });
    [250, 320].forEach((x) => card(x, 228, 56, 32, { rx: 16, stroke: GRID, dash: '4 4', fill: PANEL }));
    if (k === 1) return;
    const P = loop(L2[0], L2[1], L2[2], k === 2 ? E(u, 0.2, 1.6) : 1);
    if (k === 2) { tx(L2[0], L2[1] + 6, 'create_react_agent', { 'font-size': 14, 'text-anchor': 'middle', class: 'mono', fill: MUT, opacity: fade(u, 1.8) }); return; }
    bubble(30, 320, '아이폰 16 프로 한국 출고가는?', { fs: 14.5, s: k === 3 ? pop(u, 0.1) : 1 });
    const th = cy[0] && cy[0].thought;
    if (th) { const a = k === 3 ? fade(u, 0.8) : 1; tx(L2[0], 46, 'Thought (예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: a });
      tx(L2[0], 70, '출고가 정보 필요 → search_docs', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: a }); }
    if (k === 3) { const p = around(L2[0], L2[1], L2[2], E(u, 1.2, 2.6) * 0.33); el('circle', { cx: p[0], cy: p[1], r: 8, fill: ACC }); return; }
    // k4: 한 바퀴
    const f = E(u, 0.1, 2.0); if (f < 1) { const p = around(L2[0], L2[1], L2[2], 0.33 + f * 0.67); el('circle', { cx: p[0], cy: p[1], r: 8, fill: INFO }); }
    card(L2[0], L2[1], 170, 34, { rx: 8, text: '출고가 1,550,000원', fs: 14, fw: 700, stroke: GOOD, fill: GOODBG, s: pop(u, 1.0) });
    card(250, 390, 330, 36, { rx: 18, text: '부분 답변: 달러 환산은 아직 못 함', fs: 14.5, fw: 700, stroke: WARN, color: INK, s: pop(u, 1.8) }); }

  // ---------- 3. 같은 도구를 다시 ----------
  const L3 = [190, 250, 96];
  function s3(t, c) { const { k, u } = c, cy = c.beat.cycles, pc = c.prev ? c.prev.cycles.length : 0;
    card(190, 60, 160, 34, { rx: 17, text: 'search_docs', mono: true, fs: 14.5, fw: 800, stroke: INFO, color: INFO, s: k === 0 ? pop(u, 0.2) : 1 });
    tx(190, 104, 'Step 2와 같은 도구 하나', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.8) : 1 });
    loop(L3[0], L3[1], L3[2], k === 0 ? E(u, 0.8, 2.0) : 1);
    if (k === 0) return;
    // 반복 칸 5개
    const x0 = 420;
    mono(x0, 52, 'max_iterations=5', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.2) : 1 });
    for (let i = 0; i < 5; i++) { const y = 74 + i * 46, s = k === 1 ? pop(u, 0.3 + i * 0.15) : 1, c0 = cy[i];
      card(680, y + 18, 520, 38, { rx: 8, stroke: c0 ? INFO : GRID, dash: c0 ? null : '5 4', fill: c0 ? PANEL : SOFT, s });
      mono(436, y + 23, `#${i + 1}`, { 'font-size': 14, 'font-weight': 800, fill: c0 ? INFO : OFF, opacity: s });
      if (c0) { const fresh = i >= pc, a = fresh ? fade(u, 0.4) : 1;
        mono(470, y + 23, `"${c0.action.query}"`, { 'font-size': 13.5, opacity: a });
        tx(930, y + 23, i === 0 ? '1,550,000원' : '100만원 = $714.29', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fresh ? fade(u, 1.4) : 1 });
        if (fresh) { const p = around(L3[0], L3[1], L3[2], E(u, 0.2, 1.8)); el('circle', { cx: p[0], cy: p[1], r: 8, fill: INFO }); } } }
    if (k === 1) return;
    // 필요한 정보 체크리스트
    const need = [['출고가', cy.length >= 1], ['환율 환산식', cy.length >= 2], ['달러 계산 결과', false]];
    tx(420, 330, '복합 질문에 필요한 것', { 'font-size': 14.5, 'font-weight': 800, opacity: k === 2 ? fade(u, 0.3) : 1 });
    need.forEach(([n, ok], i) => { const x = 440 + i * 170, a = k === 2 ? fade(u, 0.6 + i * 0.3) : 1;
      el('rect', { x, y: 350, width: 22, height: 22, rx: 4, fill: PANEL, stroke: ok ? GOOD : GRID, 'stroke-width': 2, opacity: a }); if (ok) check(x + 11, 361, 7);
      tx(x + 30, 367, n, { 'font-size': 14.5, 'font-weight': 700, fill: ok ? GOOD : INK, opacity: a }); });
    if (k === 4) tx(420, 404, 'Observation이 부족하다 → query를 바꿔 같은 도구를 다시 부른다', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.8) });
    if (k === 5) { cross(791, 361, 8, pop(u, 0.4)); tx(420, 404, '검색만으로는 계산을 못 한다 — 다른 종류의 도구가 필요하다', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) }); } }

  // ---------- 4. 도구 셋 ----------
  const TX = { retriever: 170, calc: 480, api: 790 }, AG = [480, 220];
  const RES = { retriever: '1,550,000원', api: '1400.0', calc: '1107.142857…' };
  function s4(t, c) { const { k, u } = c, tools = c.beat.tools, cy = c.beat.cycles, pc = c.prev ? c.prev.cycles.length : 0;
    ['retriever', 'calc', 'api'].forEach((id) => { const on = tools.includes(id), fresh = on && c.prev && !c.prev.tools.includes(id);
      tool(TX[id], 76, id, { on, s: fresh ? pop(u, 0.2) : 1, op: on ? 1 : 0.4 }); });
    if (k === 1) mono(480, 150, 'eval(expr, {"__builtins__": {}})', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    if (k === 2) mono(790, 150, 'GET …?base=USD&to=KRW', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    if (k < 3) return;
    const ag = k === 3 ? pop(u, 0.2) : 1;
    card(AG[0], AG[1], 220, 50, { rx: 25, text: 'Agent (executor)', fs: 15, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: ag });
    ['retriever', 'calc', 'api'].forEach((id, i) => { grow(AG[0] + (TX[id] - AG[0]) * 0.25, AG[1] - 26, TX[id], 108, k === 3 ? E(u, 0.6 + i * 0.2, 1.2 + i * 0.2) : 1, GRID, { plain: true, sw: 2 }); });
    if (k === 3) { tx(480, 300, '질문에 맞는 도구를 Agent가 고른다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    const order = ['retriever', 'api', 'calc'];
    cy.forEach((cc, i) => { const id = cc.action.tool, col = TOOL[id][1], fresh = i >= pc, s0 = (i - pc) * 1.0, a = fresh ? E(u, 0.2 + s0, 0.9 + s0) : 1;
      if (fresh && a < 1) dot([[AG[0], AG[1] - 26], [TX[id], 110], [TX[id], 300]], a, col, 8);
      el('circle', { cx: TX[id] - 100, cy: 300, r: 13, fill: col, opacity: a >= 1 ? 1 : 0 }); mono(TX[id] - 100, 305, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: a >= 1 ? 1 : 0 });
      if (a >= 1) { card(TX[id] + 10, 300, 170, 36, { rx: 8, text: RES[id], mono: true, fs: 15, fw: 800, stroke: col, fill: PANEL, s: fresh ? pop(u, 0.9 + s0, 0.4) : 1 });
        mono(TX[id] + 10, 340, id === 'calc' ? '1550000 / 1400' : id === 'api' ? 'USD->KRW' : '"출고가"', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } });
    if (k === 6) banner(480, 392, '출고가 1,550,000원 · 약 $1,107.14', pop(u, 0.3)); }

  // ---------- 5. trace ----------
  const LOG = ['> Entering new AgentExecutor chain...',
    'Thought: 출고가 정보가 필요.', 'Action: search_docs(아이폰 16 프로 출고가)', 'Observation: 한국 출고가 1,550,000원',
    'Thought: 환율은 외부 API.', 'Action: fx_rate(USD->KRW)', 'Observation: 1400.0',
    'Thought: 나눗셈은 calculator.', 'Action: calculator(1550000 / 1400)', 'Observation: 1107.142857142857',
    'Final Answer: 1,550,000원 / 약 $1,107.14', '> Finished chain.'];
  const SHOWN = [0, 1, 4, 7, 10, 12, 12];
  function s5(t, c) { const { k, u } = c, n0 = k > 0 ? SHOWN[k - 1] : 0, n1 = SHOWN[k], cy = c.beat.cycles;
    terminal(20, 30, 600, 370, LOG, k === 0 ? 0 : lerp(n0, n1, E(u, 0.2, 2.2)), { title: 'verbose=True', fs: 14 });
    const x0 = 650;
    if (k === 0) { [['verbose=True', 'trace를 출력'], ['return_intermediate_steps=True', 'cycle을 돌려받기']].forEach(([a, b], i) => {
        const s = pop(u, 0.4 + i * 0.5); card(795, 150 + i * 90, 290, 64, { rx: 10, stroke: ACC, s }); mono(x0 + 10, 144 + i * 90, a, { 'font-size': 13.5, 'font-weight': 800, fill: ACC, opacity: s });
        tx(x0 + 10, 168 + i * 90, b, { 'font-size': 14, fill: MUT, opacity: s }); }); return; }
    tx(x0, 52, '쌓인 cycle', { 'font-size': 15, 'font-weight': 800 });
    cy.forEach((cc, i) => { const fresh = c.prev && i >= c.prev.cycles.length, s = fresh ? pop(u, 1.6) : 1, y = 96 + i * 62;
      const [n, col] = cc.isFinal ? ['Final Answer', ACC] : TOOL[cc.action.tool];
      card(795, y, 290, 50, { rx: 10, stroke: col, sw: 2.2, fill: PANEL, s });
      mono(x0 + 12, y + 5, cc.isFinal ? 'Final' : `#${i + 1}`, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: s });
      mono(x0 + 70, y + 5, cc.isFinal ? '최종 답 종합' : n, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); });
    if (k === 6) { const a = fade(u, 0.4); tx(x0, 372, 'result["intermediate_steps"]', { 'font-size': 14, class: 'mono', fill: ACC, 'font-weight': 800, opacity: a });
      tx(x0, 396, '3건 = 답의 근거 기록', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) }); } }

  const quiz = [
    { q: '정적 RAG가 "출고가와 달러 가격" 질문에서 달러 가격을 답하지 못한 이유는 무엇인가?',
      o: ['검색 한 번으로 끝나고 추가 검색이나 계산을 할 길이 없어서', 'retriever가 문서를 하나도 찾지 못해서', 'LLM이 한국어를 못 읽어서'], a: 0,
      why: '질문 → 1회 검색 → 답변의 단방향 파이프라인이라, 출고가 문서 한 건으로 끝나고 되돌아갈 수 없다.' },
    { q: '@tool로 감싼 search_docs의 docstring은 Agent에게 어떤 역할을 하는가?',
      o: ['검색 결과를 요약한다', '어떤 도구인지 알려 주는 설명서가 된다', '검색 횟수를 제한한다'], a: 1,
      why: 'Agent는 docstring을 읽고 언제 이 도구를 쓸지 판단한다.' },
    { q: '첫 Observation에 환율 정보가 없을 때 Agent는 무엇을 하는가?',
      o: ['바로 Final Answer를 낸다', 'max_iterations를 늘린다', '같은 search_docs를 다른 query로 다시 부른다'], a: 2,
      why: '부족하다고 판단하면 query를 "원달러 환율 1400 환산표"로 바꿔 두 번째 iteration을 돈다.' },
    { q: '도구 셋을 쓸 때 calculator가 맡는 일은 무엇인가?',
      o: ['1550000 / 1400 같은 수식을 정확히 계산한다', '실시간 환율을 조회한다', '사내 문서를 검색한다'], a: 0,
      why: 'LLM 암산 대신 계산 도구가 1107.142857…을 낸다. 환율은 fx_rate, 출고가는 search_docs가 맡는다.' },
    { q: 'return_intermediate_steps=True로 얻는 것은 무엇인가?',
      o: ['더 빠른 응답', '각 cycle의 (도구 호출, 관찰 결과) 목록', '토큰 사용량 감소'], a: 1,
      why: 'search_docs, fx_rate, calculator 세 호출과 결과가 돌아온다. 이 trace가 답의 근거가 된다.' },
  ];

  const summary = [
    '정적 RAG는 한 번 검색하고 끝나서, 정보가 모자라도 다시 찾거나 계산하지 못한다.',
    'retriever를 @tool로 감싸 Agent에 주면 Thought, Action, Observation을 돌며 스스로 쓴다.',
    '정보가 모자라면 같은 도구를 다른 query로 다시 부르고, 필요하면 다른 도구로 바꾼다.',
    '출고가 1,550,000원을 1,400으로 나눠 약 $1,107.14를 얻었고, trace가 그 근거가 된다.',
  ];
  const review = [
    { q: 'Agent가 환율 질문에서 search_docs만 계속 부르다 max_iterations에 걸렸다. 먼저 고칠 것은?',
      o: ['max_iterations를 50으로 올린다', '환율 조회·계산 도구를 tools 목록에 추가한다', 'retriever의 k를 1로 줄인다'], a: 1,
      why: '검색 도구만 있으면 계산을 할 수 없다. 알맞은 도구가 목록에 있어야 Agent가 갈아탈 수 있다.' },
    { q: 'Agent가 곱셈을 직접 하다 틀린 값을 냈다. calculator 도구가 있는데도 쓰지 않았다면 먼저 볼 곳은?',
      o: ['calculator의 docstring 설명', '벡터 DB 인덱스', '답변 글꼴'], a: 0,
      why: 'Agent는 docstring으로 도구의 쓰임을 안다. 설명이 모호하면 도구를 고르지 못한다.' },
    { q: '고객이 "이 답은 어디서 나왔나"를 묻는다. Agentic RAG에서 근거로 보여 줄 수 있는 것은?',
      o: ['임베딩 벡터 값', '모델의 가중치', 'intermediate_steps에 남은 도구 호출과 관찰 결과'], a: 2,
      why: '각 cycle의 Action과 Observation이 남아 있어, 어떤 도구에서 어떤 값을 받아 답했는지 보여 줄 수 있다.' },
  ];

  R.page({ title: 'Agentic RAG 도구 루프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
