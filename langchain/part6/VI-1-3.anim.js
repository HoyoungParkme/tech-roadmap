/* VI-1-3 Multi-Agent 워크플로우 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 확인한 값: supervisor.py 의 StateGraph 를 langgraph 1.2 로 가짜 agent 와 함께 실행해
 * 이벤트 순서(supervisor 5번 · agent 4번 = 노드 9번), writer 의 State 전체 전달, stream 뒤 invoke 의 재실행을 확인했다.
 * 보고서의 시장 수치는 LLM 출력 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, person, check, cross, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 14, fill: MUT, opacity: op ?? 1 }, a || {}));

  const AG = [{ id: 'researcher', name: 'Researcher', job: '조사', col: ACC, tool: 'Tavily' }, { id: 'analyst', name: 'Analyst', job: '분석', col: INFO, tool: 'Python REPL' },
    { id: 'writer', name: 'Writer', job: '작성', col: WARN, tool: 'Markdown' }, { id: 'reviewer', name: 'Reviewer', job: '검토', col: GOOD, tool: 'LLM 검토' }];
  const SLOTS = ['topic', 'research', 'analysis', 'draft', 'final_report', 'next_agent'];
  const VAL = { topic: '"2024 AI 시장 분석 보고서"', research: '"AI 시장 5건 사실 추출"', analysis: '"트렌드 3개 + 수치"', draft: '"초안 (서·본·결)"', final_report: '"교정 완료"' };
  // State 표: vals[slot] 가 있으면 값, 없으면 "" . hot = 방금 바뀐 칸
  function stateTable(x, y, w, vals, o) { o = o || {}; const rh = o.rh || 44;
    el('rect', { x, y, width: w, height: rh * SLOTS.length + 34, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 22, o.title || 'ReportState', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    SLOTS.forEach((sl, i) => { const yy = y + 30 + i * rh, v = vals[sl], hot = o.hot === sl, op = o.rowOp ? o.rowOp(i) : 1;
      if (hot) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: rh - 6, rx: 6, fill: ACCBG, opacity: op });
      mono(x + 16, yy + rh / 2 + 4, sl, { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      mono(x + (o.kw || 140), yy + rh / 2 + 4, v == null || v === '' ? '""' : v, { 'font-size': 14, fill: v ? (hot ? ACC : INK) : OFF, 'font-weight': hot ? 700 : 400, opacity: op }); }); }
  const rowCY = (y, i, rh) => y + 30 + i * (rh || 44) + (rh || 44) / 2 - 2;

  // ---------- 1. 시나리오 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const s = pop(u, 0.2);
      card(480, 160, 360, 150, { rx: 12, stroke: INK, sw: 2.5, s });
      mono(480, 120, 'topic', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s });
      const ty = '2024 AI 시장 분석 보고서', n = Math.round(lerp(0, ty.length, E(u, 0.5, 1.6)));
      tx(480, 160, ty.slice(0, n), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
      [['약 3페이지 (서·본·결)', 360], ['2시간 안에', 600]].forEach(([a, x], i) => pill(x, 280, a, WARN, pop(u, 1.8 + i * 0.3), { fs: 14.5 }));
      note(480, 360, '사람 손 없이 끝까지 자동으로', fade(u, 2.3), { 'text-anchor': 'middle', 'font-size': 15 }); return; }
    if (k === 1) { person(220, 200, 'Agent 하나', {});
      ['조사', '분석', '작성'].forEach((s, i) => { const by = 110 - i * 0 , x = 150 + i * 70, b = pop(u, 0.2 + i * 0.3);
        card(x, 96 - (i % 2) * 8, 58, 32, { rx: 16, text: s, fs: 14, stroke: WARN, fill: WARNBG, s: b }); });
      [['품질이 고르지 않다', '깊이가 부족한 곳이 생긴다'], ['토큰 한도', '자료 일부만 처리한다'], ['검토자가 없다', '오류를 걸러 내지 못한다']].forEach(([a, b], i) => {
        const y = 110 + i * 88, s = pop(u, 1.0 + i * 0.4); card(640, y, 420, 70, { rx: 10, stroke: BAD, sw: 2, s }); cross(460, y, 10, s);
        tx(490, y - 4, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.1 + i * 0.4) }); tx(490, y + 20, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.1 + i * 0.4) }); });
      return; }
    // k ≥ 2: 넷으로 쪼개진다
    const g = k === 2 ? E(u, 0.2, 1.4) : 1, sy = k === 3 ? 260 : 200;
    AG.forEach((a, i) => { const x = lerp(480, 150 + i * 220, g), y = lerp(200, sy, g);
      person(x, y, null, { stroke: a.col, s: k === 2 ? lerp(0.6, 1, g) : 1 });
      if (g > 0.9) { lbl(x, y + 52, a.name, 1, { fill: a.col }); tx(x, y + 74, c.beat.scenario && c.beat.scenario.steps[i] ? c.beat.scenario.steps[i] : a.job, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
        mono(x, y - 46, a.tool, { 'font-size': 13.5, fill: a.col, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 1.6 + i * 0.15) : 1 }); } });
    if (k === 2) { note(480, 400, '한 가지 일만 맡는 전문가 넷', fade(u, 2.2), { 'text-anchor': 'middle', 'font-size': 15 }); return; }
    // k === 3: Supervisor 와 user
    person(480, 80, null, { stroke: INK, s: pop(u, 0.2) }); lbl(560, 78, 'Supervisor', fade(u, 0.3), { 'text-anchor': 'start' });
    AG.forEach((a, i) => grow(480, 112, 150 + i * 220, 196, E(u, 0.5 + i * 0.1, 1.0 + i * 0.1), MUT, { dash: '4 4', plain: true }));
    person(80, 80, 'user', { s: pop(u, 0.9) });
    fly(130, 70, 380, 70, seg(u, 1.2, 2.2), '주제 전달', { stay: true });
    note(560, 104, '다음 순서를 정하고 모자라면 다시 부른다', fade(u, 2.0), { 'font-size': 14 }); }

  // ---------- 2. Agent 정의 ----------
  const TB = { x: 330, y: 60, w: 300 };
  const POS = [[150, 120], [800, 120], [150, 300], [800, 300]];
  const IO = [[['topic'], 'research'], [['research'], 'analysis'], [['research', 'analysis'], 'draft'], [['draft'], 'final_report']];
  function s2(t, c) { const { k, u } = c, defs = c.beat.agentDefs || [];
    stateTable(TB.x, TB.y, TB.w, { topic: VAL.topic.length > 14 ? '"2024 AI 시장…"' : VAL.topic }, { rowOp: (i) => (k === 0 ? fade(u, 0.3 + i * 0.25) : 1), kw: 140 });
    if (k === 0) { note(TB.x, 380, '네 agent가 이 dict 하나를 나눠 쓴다', fade(u, 2.0), { 'font-size': 15 }); return; }
    defs.forEach((d) => { const i = d.idx, a = AG[i], [x, y] = POS[i], fresh = i === k - 1, s = fresh ? pop(u, 0.2) : 1, op = fresh ? 1 : 0.55;
      card(x, y, 220, 80, { rx: 12, stroke: a.col, sw: 2.4, s, op });
      mono(x, y - 14, a.id + '_agent', { 'font-size': 15, 'font-weight': 800, fill: a.col, 'text-anchor': 'middle', opacity: s * op });
      tx(x, y + 8, a.tool, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s * op });
      mono(x, y + 30, 'defined', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fresh ? fade(u, 2.0) : op });
      const left = x < TB.x, ex = left ? x + 110 : x - 110, tx0 = left ? TB.x : TB.x + TB.w;
      IO[i][0].forEach((sl, j) => { const ry = rowCY(TB.y, SLOTS.indexOf(sl));
        grow(tx0, ry, ex, y - 12 + j * 10, fresh ? E(u, 0.7, 1.3) : 1, INFO, { op: op, sw: 2 }); });
      const wy = rowCY(TB.y, SLOTS.indexOf(IO[i][1]));
      grow(ex, y + 14, tx0, wy, fresh ? E(u, 1.3, 1.9) : 1, a.col === GOOD || a.col === WARN ? ACC : a.col, { op, sw: 2.4 }); });
    const io = fade(u, 2.2);
    if (k === 3) note(TB.x, 390, 'chain.invoke(state) : State 전체를 넘긴다', io, { 'font-size': 15, class: 'mono' });
    else if (k === 4) banner(480, 396, '4 Agent 정의 완료', pop(u, 2.2));
    else note(TB.x, 390, '파란 선은 읽는 칸, 진한 선은 돌려주는 칸', io, { 'font-size': 15 }); }

  // ---------- 3. Supervisor + StateGraph ----------
  const GS = [300, 210], GA = AG.map((a, i) => [680, 66 + i * 96]), GST = [90, 210], GEND = [300, 372];
  function nodes(k, u, o) { o = o || {};
    card(GS[0], GS[1], 160, 56, { rx: 12, text: 'supervisor', fs: 16, mono: true, stroke: INK, fill: SOFT, sw: 2.6, s: o.pop ? pop(u, 0.2) : 1 });
    AG.forEach((a, i) => card(GA[i][0], GA[i][1], 160, 50, { rx: 12, text: a.id, fs: 15, mono: true, stroke: a.col, sw: 2.4, s: o.pop ? pop(u, 0.5 + i * 0.25) : 1 })); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(GS[0], GS[1], 160, 56, { rx: 12, text: 'supervisor', fs: 16, mono: true, stroke: INK, fill: SOFT, sw: 2.6 });
      const rows = [['research', 'researcher'], ['analysis', 'analyst'], ['draft', 'writer'], ['final_report', 'reviewer'], [null, 'done']];
      const scan = Math.min(4, Math.floor(seg(u, 0.4, 2.4) * 5));
      rows.forEach(([sl, to], i) => { const y = 74 + i * 62, on = i === scan;
        el('rect', { x: 470, y: y - 24, width: 460, height: 46, rx: 8, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.2 : 1.4, opacity: fade(u, 0.1 + i * 0.12) });
        mono(486, y + 5, sl ? `not state.get("${sl}")` : 'else', { 'font-size': 14.5, opacity: fade(u, 0.1 + i * 0.12) });
        mono(916, y + 5, `→ "${to}"`, { 'font-size': 14.5, 'font-weight': 700, fill: AG[i] ? AG[i].col : INK, 'text-anchor': 'end', opacity: fade(u, 0.1 + i * 0.12) }); });
      grow(380, 210, 466, 74 + scan * 62, E(u, 0.4, 0.8), ACC, { plain: true });
      note(90, 330, '위에서부터 처음 만나는 빈 칸', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 1) { card(GS[0], GS[1], 160, 56, { rx: 12, text: 'supervisor', fs: 16, mono: true, stroke: INK, fill: SOFT, sw: 2.6 });
      const rx = 560; el('path', { d: `M${rx - 60},210 L${rx},170 L${rx + 60},210 L${rx},250 Z`, fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
      mono(rx, 215, 'route', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      grow(380, 210, 498, 210, E(u, 0.4, 0.8), MUT);
      pill(440, 180, 'next_agent', MUT, pop(u, 0.6), { mono: true, fs: 13.5 });
      grow(620, 196, 780, 110, E(u, 1.0, 1.5), ACC); card(850, 100, 150, 44, { rx: 10, text: '"writer" 등', fs: 14.5, mono: true, stroke: ACC, s: pop(u, 1.5) });
      grow(620, 224, 780, 310, E(u, 1.5, 2.0), BAD); card(850, 320, 150, 44, { rx: 10, text: 'END', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 2.0) });
      mono(680, 128, '이름 그대로', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.5), 'text-anchor': 'end' }); mono(700, 290, '"done"이면', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 2.0), 'text-anchor': 'end' }); return; }
    nodes(k, u, { pop: k === 2 });
    if (k === 2) { mono(90, 60, 'StateGraph(ReportState)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(90, 390, 'nodes 5', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); return; }
    // k ≥ 3: 시작·조건 분기·END
    el('ellipse', { cx: GST[0], cy: GST[1], rx: 62, ry: 22, fill: SOFT, stroke: MUT, 'stroke-width': 2 }); mono(GST[0], GST[1] + 5, '__start__', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    el('ellipse', { cx: GEND[0], cy: GEND[1], rx: 62, ry: 22, fill: SOFT, stroke: MUT, 'stroke-width': 2 }); mono(GEND[0], GEND[1] + 5, '__end__', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    const a3 = (a, b) => (k === 3 ? E(u, a, b) : 1);
    grow(152, 210, 218, 210, a3(0.2, 0.6), MUT);
    AG.forEach((a, i) => grow(380, 200, 598, GA[i][1] - 8, a3(0.6 + i * 0.2, 1.1 + i * 0.2), MUT, { dash: '6 4' }));
    grow(300, 238, 300, 348, a3(1.5, 1.9), BAD, { dash: '6 4' });
    if (k === 3) { note(90, 120, 'set_entry_point', fade(u, 0.3), { class: 'mono', fill: INK });
      note(420, 400, 'add_conditional_edges', fade(u, 1.6), { class: 'mono', fill: INK }); return; }
    // k === 4: 되돌아오는 edge
    AG.forEach((a, i) => grow(600, GA[i][1] + 10, 382, 222, E(u, 0.2 + i * 0.25, 0.8 + i * 0.25), a.col === WARN || a.col === GOOD ? ACC : a.col, { sw: 2 }));
    banner(500, 398, 'app = graph.compile()', pop(u, 1.8)); }

  // ---------- 4. 실행: hand-off ----------
  const M = { s: [110, 210], a: AG.map((a, i) => [330, 66 + i * 96]), end: [110, 372] };
  const NEXT = ['""', '"researcher"', '"analyst"', '"writer"', '"reviewer"', '"done"'], RUNS = [0, 1, 3, 5, 7, 9];
  function s4(t, c) { const { k, u } = c, b = c.beat, act = b.activeAgent, done = b.completed || [];
    card(M.s[0], M.s[1], 140, 52, { rx: 12, text: 'supervisor', fs: 15, mono: true, stroke: INK, fill: SOFT, sw: 2.4 });
    el('ellipse', { cx: M.end[0], cy: M.end[1], rx: 50, ry: 20, fill: k === 5 ? BADBG : SOFT, stroke: k === 5 ? BAD : MUT, 'stroke-width': 2 }); mono(M.end[0], M.end[1] + 5, 'END', { 'font-size': 14, 'text-anchor': 'middle', fill: k === 5 ? BAD : MUT });
    AG.forEach((a, i) => { const run = i === act && !done.includes(i), ok = done.includes(i);
      el('line', { x1: 180, y1: 210, x2: 254, y2: M.a[i][1], stroke: GRID, 'stroke-width': 2 });
      card(M.a[i][0], M.a[i][1], 150, 46, { rx: 12, text: a.id, fs: 15, mono: true, stroke: run || ok ? a.col : GRID, fill: run ? ACCBG : PANEL, color: run || ok ? INK : MUT, sw: run ? 3 : 2 });
      if (ok) check(420, M.a[i][1], 9, k > 0 && i === act - 1 || (k === 5 && i === 3) ? pop(u, 0.9) : 1);
      if (run) mono(420, M.a[i][1] + 5, 'RUN', { 'font-size': 13.5, 'font-weight': 800, fill: a.col, opacity: fade(u, 1.0) }); });
    el('line', { x1: 110, y1: 236, x2: 110, y2: 350, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    // 왕복 점: 앞 agent → supervisor → 다음 agent
    if (k >= 1 && k <= 4) { const to = M.a[k - 1], from = k >= 2 ? M.a[k - 2] : null, route = [];
      if (from) route.push([from[0] - 75, from[1]], [180, 210]); else route.push([180, 210]);
      route.push([to[0] - 75, to[1]]); dot(route.length > 1 ? route : [[180, 210], [to[0] - 75, to[1]]], seg(u, 0.2, 1.4), BAD, 7); }
    if (k === 5) dot([[M.a[3][0] - 75, M.a[3][1]], [180, 210], [110, 236], [110, 352]], seg(u, 0.2, 1.6), BAD, 7);
    // 오른쪽: State
    const vals = { topic: '"2024 AI 시장…"', next_agent: NEXT[k] };
    ['research', 'analysis', 'draft', 'final_report'].forEach((sl, i) => { if (done.includes(i)) vals[sl] = VAL[sl]; });
    const hot = k >= 2 && k <= 5 ? ['research', 'analysis', 'draft', 'final_report'][k - 2] : k === 1 ? 'next_agent' : null;
    stateTable(520, 40, 420, vals, { hot, kw: 160, title: 'State' + (k === 0 ? ' · 초기값' : '') });
    const runs = Math.round(tween(RUNS[k - 1] ?? 0, RUNS[k], u, 1.2));
    mono(520, 380, `노드 실행 ${runs}회`, { 'font-size': 17, 'font-weight': 800, fill: runs ? INK : MUT });
    cells(700, 360, Array.from({ length: 9 }, (_, i) => (i < runs ? (i % 2 ? 'A' : 'S') : '')), { w: 22, h: 30, gap: 3, fs: 13.5, style: (i) => ({ stroke: i < runs ? (i % 2 ? ACC : INK) : GRID, fill: i < runs ? (i % 2 ? ACCBG : SOFT) : PANEL }) });
    if (k === 5) note(520, 412, 'S = supervisor 5번 · A = agent 4번', fade(u, 1.8)); }

  // ---------- 5. 보고서 ----------
  function s5(t, c) { const { k, u } = c, rep = c.beat.report || { sections: [], credits: [] }, prevN = ((c.prev && c.prev.report) || { sections: [] }).sections.length;
    const narrow = k >= 3, X = narrow ? 40 : 200, W = narrow ? 440 : 560;
    el('rect', { x: X, y: 20, width: W, height: 384, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    tx(X + 20, 52, rep.title, { 'font-size': 18, 'font-weight': 800 });
    card(X + W - 70, 46, 110, 26, { rx: 6, text: 'LLM 출력 예시', fs: 13.5, stroke: WARN, color: WARN, fill: WARNBG });
    rep.sections.forEach((s2, i) => { const y = 86 + i * 62, fresh = i >= prevN && k < 3, op = fresh ? fade(u, 0.3 + (i - prevN) * 0.5) : 1;
      if (op <= 0) return; const hl = narrow ? s2.h.replace('본론·', '') : s2.h;
      tx(X + 20, y + 18, hl, { 'font-size': 14.5, 'font-weight': 700, fill: s2.h.startsWith('본론') ? INFO : ACC, opacity: op });
      const body = narrow && tw(s2.body, 15) > W - 40 ? s2.body.slice(0, 22) + '…' : s2.body;
      tx(X + 20, y + 42, body, { 'font-size': 15, opacity: op });
      if (fresh && /\d/.test(s2.body)) el('rect', { x: X + 14, y: y + 26, width: Math.min(W - 28, tw(body, 15) + 12), height: 24, rx: 4, fill: WARN, opacity: 0.18 * op }); });
    if (k < 3) { note(X + W + 12, 396, '수치는 예시', fade(u, 1.8), { 'font-size': 13.5 }); return; }
    if (k === 3) { tx(520, 52, 'Multi-Agent Credits', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      rep.credits.forEach((cr, i) => { const y = 82 + i * 76, a = AG[i], s = pop(u, 0.4 + i * 0.35);
        card(730, y + 26, 420, 64, { rx: 10, stroke: a.col, sw: 2.2, s });
        tx(536, y + 22, cr.agent, { 'font-size': 15, 'font-weight': 800, fill: a.col === WARN ? INK : a.col, opacity: fade(u, 0.5 + i * 0.35) });
        tx(536, y + 44, cr.work, { 'font-size': 14.5, opacity: fade(u, 0.5 + i * 0.35) }); }); return; }
    // k === 4: 반환과 실행 기록
    person(870, 110, 'user', { s: pop(u, 0.2) });
    fly(520, 110, 760, 110, seg(u, 0.4, 1.4), 'final_report', { stay: true, mono: true });
    mono(520, 220, '노드 실행 9회', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) });
    cells(520, 236, ['S', 'R', 'S', 'A', 'S', 'W', 'S', 'V', 'S'], { w: 40, h: 36, gap: 4, fs: 14, style: (i, v) => { const on = i < Math.round(lerp(0, 9, E(u, 1.3, 2.3))), a = { R: AG[0], A: AG[1], W: AG[2], V: AG[3] }[v];
      return { stroke: on ? (a ? a.col : INK) : GRID, fill: on ? (a ? PANEL : SOFT) : PANEL, op: on ? 1 : 0.25 }; } });
    note(520, 306, 'S = supervisor · R·A·W·V = 네 agent', fade(u, 2.0));
    note(520, 334, 'supervisor가 next_agent="done" → END', fade(u, 2.3), { fill: INK, class: 'mono' }); }

  const quiz = [
    { q: '보고서 작성을 Agent 하나에 다 맡길 때의 한계로 이 장이 꼽지 않은 것은?',
      o: ['품질이 고르지 않다', '토큰 한도에 걸린다', 'LangGraph를 쓸 수 없다'], a: 2,
      why: '이 장이 꼽은 한계는 품질 불균일, 토큰 한도, 검토자 부재 세 가지다. 그래서 일을 넷으로 나누고 Reviewer를 따로 둔다.' },
    { q: 'writer_agent가 다른 agent와 다르게 chain.invoke에 넘기는 것은 무엇인가?',
      o: ['State 전체', 'draft 칸 하나', 'topic 문자열 하나'], a: 0,
      why: 'writer는 research와 analysis 두 칸이 모두 필요해서 State 전체를 넘긴다. 템플릿에 없는 칸은 프롬프트가 무시한다.' },
    { q: 'research와 analysis는 찼고 draft가 비어 있을 때 supervisor가 돌려주는 next_agent는?',
      o: ['"analyst"', '"writer"', '"done"'], a: 1,
      why: 'supervisor는 위에서부터 처음 만나는 빈 칸을 찾는다. draft가 비었으니 writer 차례다.' },
    { q: '실행이 끝날 때까지 supervisor 노드는 모두 몇 번 돌았나?',
      o: ['5번', '4번', '9번'], a: 0,
      why: 'agent 앞에서 한 번씩 4번, 마지막에 done을 내려고 한 번 더 돌아 5번이다. 노드 실행은 모두 9번이다.' },
    { q: '보고서에 나온 "AI 시장 5,400억 달러" 같은 수치는 어떻게 다뤄야 하나?',
      o: ['Multi-Agent가 만들었으니 그대로 믿는다', 'Reviewer가 봤으니 확인이 필요 없다', '예시 출력이므로 출처를 붙여 따로 확인한다'], a: 2,
      why: '이 페이지의 보고서는 실행 예시라 수치가 실제 통계가 아니다. 실무에서는 Researcher가 모은 출처를 수치마다 붙여 확인한다.' },
  ];

  const summary = [
    '조사부터 검토까지 Agent 하나에 맡기면 품질이 고르지 않고 토큰 한도에 걸리며 검토자도 없다.',
    'ReportState 하나에 칸을 나눠 두고, 네 agent는 각자 자기 칸만 채워 돌려준다.',
    'supervisor가 위에서부터 빈 칸을 찾아 다음 agent를 고르고, 모두 차면 done으로 END에 간다.',
    '이번 실행은 노드 9번으로 끝났고, stream 뒤에 invoke를 또 부르면 전체가 한 번 더 돈다.',
  ];
  const review = [
    { q: '실행 로그에 researcher만 계속 반복해서 찍힌다. 가장 먼저 의심할 것은?',
      o: ['researcher_agent가 research 칸을 빈 값으로 돌려준다', 'Reviewer 프롬프트가 너무 길다', 'set_entry_point를 두 번 불렀다'], a: 0,
      why: 'supervisor는 research가 비어 있으면 늘 researcher를 고른다. 검색 결과가 비거나 반환 키 이름이 틀리면 같은 노드만 돈다.' },
    { q: '"Translator" agent를 Writer와 Reviewer 사이에 넣으려 한다. 고칠 곳으로 맞는 묶음은?',
      o: ['run.py의 initial_state만 고친다', 'route 함수만 고친다', 'State 칸, supervisor 조건, 노드와 되돌아오는 edge를 모두 더한다'], a: 2,
      why: '새 agent는 자기 칸이 있어야 하고, supervisor가 그 칸을 검사해야 하며, 노드 등록과 supervisor로 돌아오는 edge가 필요하다.' },
    { q: '팀원이 app.stream으로 진행을 보고 이어서 app.invoke로 결과를 받았더니 비용이 예상의 두 배가 나왔다. 까닭은?',
      o: ['stream이 각 노드를 두 번씩 실행한다', 'invoke가 워크플로를 처음부터 다시 실행한다', 'supervisor가 매번 LLM을 두 번 부른다'], a: 1,
      why: 'stream과 invoke는 각각 그래프를 처음부터 끝까지 돌린다. 하나만 쓰거나 stream에서 받은 마지막 State를 쓰면 된다.' },
  ];

  R.page({ title: 'Supervisor Multi-Agent 그래프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
