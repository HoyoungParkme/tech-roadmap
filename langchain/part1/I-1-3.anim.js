/* I-1-3 LCEL 파이프 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 위쪽 파이프는 STEPS 의 activeNodes · flowEdges, 아래 그림은 modeBox(갈래·chunk·task·batch 행)를 읽는다.
 * ms 값은 페이지의 예시 값이다. 0.82초짜리 가짜 모델로 langchain-core 1.8.4 에서 돌려 보면
 * 직렬 5건 4.11s · batch(max_concurrency=3) 1.67s · 5 0.83s · gather 3건 0.83s · 직렬 3건 2.46s 로 같은 비율이 나온다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, spans, cross, check, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, s, op) => { if (typeof s === 'number') { op = s; s = null; } return pill(x, y, s || '예시', MUT, 1, { fs: 13.5, op }); };
  // ---------- 위쪽 파이프: input → prompt → model → parser → output ----------
  const NODES = [['input', 'dict', 80, 104], ['prompt', 'prompt', 282, 150], ['model', 'model', 480, 150], ['parser', 'parser', 678, 150], ['output', '출력', 880, 104]];
  function rail(c, o) { o = o || {}; const b = c.beat, act = b.activeNodes || [], fe = b.flowEdges || [], pa = (c.prev && c.prev.flowEdges) || [], y = o.y || 66;
    NODES.slice(0, 4).forEach((n, i) => { const x1 = n[2] + n[3] / 2, x2 = NODES[i + 1][2] - NODES[i + 1][3] / 2, on = fe.includes(i), nw = on && !pa.includes(i);
      el('line', { x1, y1: y, x2, y2: y, stroke: GRID, 'stroke-width': 3 });
      if (on) { grow(x1, y, x2 - 2, y, nw ? seg(c.u, 0.2 + i * 0.2, 0.6 + i * 0.2) : 1, ACC, { sw: 3 }); if (o.flow) dot([[x1, y], [x2, y]], ((c.u * 0.9 + i * 0.25) % 1), ACC, 5); }
      if (on && i > 0 && i < 3) tx((x1 + x2) / 2, y - 10, '|', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, class: 'mono', fill: ACC }); });
    NODES.forEach(([id, name, x, w]) => { const on = act.includes(id), nw = on && !((c.prev && c.prev.activeNodes) || []).includes(id);
      card(x, y, w, 40, { rx: 20, text: name, fs: 15, fw: 800, mono: true, fill: on ? (id === 'input' || id === 'output' ? ACCBG : ACC) : PANEL, stroke: on ? ACC : GRID, color: on ? (id === 'input' || id === 'output' ? ACC : PANEL) : MUT, sw: 2, s: nw ? 0.7 + 0.3 * pop(c.u, 0.2) : 1 }); }); }

  // ---------- 1. 기본 파이프 ----------
  const STAGE = [['dict', '{"topic": "파이썬"}'], ['ChatPromptValue', 'Human: 파이썬에 대해 한 줄로 설명해줘'], ['AIMessage', 'content="파이썬은 읽기 쉬운…"'], ['str', '"파이썬은 읽기 쉬운 범용…"']];
  function s1(t, c) { const { k, u } = c, b = c.beat; rail(c, { flow: k === 3 });
    if (k === 0) { [['langchain_core.prompts', 'ChatPromptTemplate'], ['langchain_core.output_parsers', 'StrOutputParser'], ['langchain_openai', 'ChatOpenAI']].forEach(([m, n], i) =>
        spans(130, 170 + i * 44, [['from ', { fill: INFO, 'font-weight': 700 }], [m, {}], [' import ', { fill: INFO, 'font-weight': 700 }], [n, { fill: ACC, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.35) }));
      note(480, 340, '부품 클래스는 왔지만 파이프는 아직 비어 있다', fade(u, 1.7), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 1) { [['ChatPromptTemplate', '"{topic}에 대해 한 줄로 설명해줘"', 282], ['ChatOpenAI', 'model="gpt-4o-mini"', 480], ['StrOutputParser', 'AIMessage → str', 678]].forEach(([a, z, x], i) => {
        const s = pop(u, 0.3 + i * 0.3); card(x, 160 + (i % 2) * 70, 250, 56, { rx: 10, stroke: INK, s }); grow(x, 88, x, 132 + (i % 2) * 70, seg(u, 0.3 + i * 0.3, 0.6 + i * 0.3), MUT, { plain: true });
        if (s > 0.4) { mono(x, 156 + (i % 2) * 70, a, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle' }); tx(x, 176 + (i % 2) * 70, z, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, class: 'mono' }); } });
      note(480, 340, '노드 세 개가 켜졌지만 서로 이어지지는 않았다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 2) { mono(480, 190, 'chain = prompt | model | parser', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
      note(480, 250, '앞 단계의 출력이 뒤 단계의 입력으로 자동 전달된다', fade(u, 1.4), { 'text-anchor': 'middle' });
      sub(480, 282, 'Unix의 cat file | grep x | sort 와 같은 생각', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k 3, 4: 값이 바뀌어 가는 모습
    const n = k === 3 ? E(u, 0.2, 2.4) * 3.99 : 4;
    STAGE.forEach(([ty, v], i) => { const f = clamp(n - i); if (f <= 0) return; const y = 136 + i * 56;
      card(480, y, 660, 46, { rx: 10, stroke: i === 3 ? ACC : GRID, fill: i === 3 ? ACCBG : PANEL, s: 0.7 + 0.3 * f, op: f });
      mono(170, y + 5, ty, { 'font-size': 15, 'font-weight': 800, fill: i === 3 ? ACC : INFO, opacity: f });
      tx(360, y + 5, v, { 'font-size': 14, opacity: f, class: i === 1 ? null : 'mono' });
      if (i < 3) tx(800, y + 33, '↓', { 'font-size': 16, fill: MUT, opacity: clamp(n - i - 0.5) }); });
    if (k === 3) { ex(860, 352, '모델 답은 예시', fade(u, 1.8)); mono(860, 388, `${b.modeBox.latencyMs}ms (예시)`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    ['.invoke', '.stream', '.batch', '.ainvoke'].forEach((m, i) => pill(180 + i * 200, 382, m, ACC, pop(u, 0.4 + i * 0.25), { mono: true, fs: 15 }));
    sub(480, 412, 'Runnable이라 실행 메서드 네 개가 따라온다', fade(u, 1.6), { 'font-size': 14 }); }

  // ---------- 2. RunnableParallel · RunnableLambda ----------
  const LANE = { summary: 170, keyword: 250, length: 330 };
  function s2(t, c) { const { k, u } = c, br = c.beat.modeBox.branches || [], pn = ((c.prev && c.prev.modeBox.branches) || []).length;
    if (k === 0) { card(480, 160, 300, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.4, s: pop(u, 0.2) });
      mono(480, 156, 'model = ChatOpenAI(…)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) }); sub(480, 178, 'gpt-4o-mini', fade(u, 0.4));
      ['RunnableParallel', 'RunnableLambda'].forEach((s, i) => pill(330 + i * 300, 260, s, INK, pop(u, 0.9 + i * 0.3), { mono: true, fs: 15 }));
      note(480, 330, '세 갈래 중 두 갈래가 이 model 하나를 같이 쓴다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    // 입력과 갈래
    pill(104, 250, '{"topic": "파이썬"}', INK, 1, { mono: true, fs: 13.5 });
    tx(104, 222, 'input', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    const par = k >= 4;
    br.forEach((g, i) => { const y = LANE[g.name], nw = i >= pn, s = nw && k < 4 ? pop(u, 0.2) : 1;
      el('path', { d: `M188,250 C214,250 214,${y} 240,${y}`, fill: 'none', stroke: par ? ACC : GRID, 'stroke-width': 2.4, opacity: s });
      card(400, y, 300, 56, { rx: 10, stroke: g.name === 'length' ? INFO : INK, fill: PANEL, s });
      if (s > 0.4) { mono(262, y - 6, g.name, { 'font-size': 15, 'font-weight': 800, fill: g.name === 'length' ? INFO : ACC }); mono(262, y + 15, g.desc, { 'font-size': 13.5, fill: MUT }); }
      if (par) { el('path', { d: `M550,${y} C600,${y} 600,250 640,250`, fill: 'none', stroke: ACC, 'stroke-width': 2.4 });
        if (k === 4) { dot([[188, 250], [240, y], [550, y], [640, 250]], seg(u, 0.4, 2.0), ACC, 6); } }
      if (k === 1 + i && g.name !== 'length') note(560, y + 5, g.name === 'keyword' ? '파서만 Json으로 바꿨다' : 'prompt | model | Str', fade(u, 1.0), { 'font-size': 14, fill: MUT });
      if (k === 3 && g.name === 'length') note(560, y + 5, 'LLM 없이 len()만 계산', fade(u, 1.0), { 'font-size': 14, fill: INFO }); });
    if (k === 2 || k === 3) mono(260, 400, k === 2 ? '"{topic} 핵심 키워드 3개를 JSON 배열로만."' : 'RunnableLambda(lambda x: len(x["topic"]))', { 'font-size': 14, opacity: fade(u, 0.6) });
    if (par) { zone(232, 128, 330, 244, null, { fill: 'none', stroke: ACC, dash: '6 4' }); mono(240, 116, 'multi = RunnableParallel(…)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 4 ? fade(u, 0.2) : 1 }); }
    if (k === 4) note(800, 250, '입력 1개 → 3갈래 동시', fade(u, 1.6), { 'text-anchor': 'middle' });
    if (k === 5) { const s = pop(u, 0.2); card(790, 250, 300, 120, { rx: 12, stroke: ACC, fill: ACCBG, s });
      [['"summary": ', '"파이썬은 …"'], ['"keyword": ', '["프로그래밍", "범용", "쉬움"]'], ['"length": ', '3']].forEach(([a, z], i) => {
        spans(650, 222 + i * 28, [[a, { fill: MUT }], [z, { 'font-weight': 700, fill: i === 2 ? INFO : INK }]], { 'font-size': 13.5, opacity: fade(u, 0.4 + i * 0.25) }); });
      ex(890, 172, fade(u, 1.0));
      // 시간: 가장 긴 갈래만큼
      const L = [['summary', 0.9], ['keyword', 1.0], ['length', 0.05]];
      tx(600, 360, '걸린 시간', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
      L.forEach(([n, w], i) => el('rect', { x: 680, y: 346 + i * 14, width: 220 * w * E(u, 1.3, 2.2), height: 10, rx: 3, fill: n === 'length' ? INFO : ACC }));
      el('line', { x1: 900, y1: 340, x2: 900, y2: 392, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '3 3', opacity: fade(u, 2.2) });
      note(790, 412, '전체 = 가장 느린 갈래', fade(u, 2.3), { 'text-anchor': 'middle', 'font-size': 14 }); } }

  // ---------- 3. stream ----------
  function s3(t, c) { const { k, u } = c, mb = c.beat.modeBox, pc = ((c.prev && c.prev.modeBox.chunks) || []).length; rail(c, { flow: k >= 2 });
    if (k === 0) { note(480, 200, 'Step 1과 같은 세 부품이다', fade(u, 0.3), { 'text-anchor': 'middle' }); sub(480, 234, 'stream 때문에 바꿀 것이 없다', fade(u, 0.9), { 'font-size': 15 }); return; }
    if (k === 1) { mono(480, 190, 'chain = (prompt | model | parser)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      sub(480, 226, 'invoke 때와 완전히 같은 객체', fade(u, 1.0), { 'font-size': 15 }); return; }
    if (k === 2 || k === 4) { mono(60, 150, 'for chunk in chain.stream({"topic": "파이썬"}):', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      let x = 60; mb.chunks.forEach((s, i) => { const w = tw(s.replace(/^ /, '·'), 15) + 18, nw = i >= pc, sc = nw ? pop(u, 0.3 + (i - pc) * 0.35, 0.4) : 1;
        card(x + w / 2, 196, w, 36, { rx: 6, text: s.replace(/^ /, '·'), fs: 15, mono: true, stroke: ACC, fill: ACCBG, s: sc });
        if (nw) fly(880, 86, x + w / 2, 196, seg(u, 0.05 + (i - pc) * 0.35, 0.35 + (i - pc) * 0.35), 'chunk', {}); x += w + 6; });
      ex(870, 196, fade(u, 0.5)); sub(160, 238, '· 은 앞쪽 공백', fade(u, 0.8), { 'font-size': 13.5 });
      if (k === 2) { note(480, 300, '.stream()은 제너레이터다. 생기는 대로 하나씩 내보낸다', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
      // k 4: 활용과 주의
      note(250, 290, '챗봇 UI · 라이브 생성에 맞다', fade(u, 0.3), { 'text-anchor': 'middle', fill: GOOD });
      mono(560, 290, 'JsonOutputParser stream', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      ["{}", "{'name': '리'}", "{'name': '리스트'}", "{'name': '리스트', 'mutable': True}"].forEach((s, i) => mono(560, 318 + i * 24, s, { 'font-size': 13.5, opacity: fade(u, 1.0 + i * 0.3) }));
      note(250, 330, 'JSON은 끝까지 모아야 완성된다', fade(u, 1.2), { 'text-anchor': 'middle', fill: WARN, 'font-size': 14 });
      note(250, 356, '그래서 부분 dict를 내는 파서를 쓴다', fade(u, 1.6), { 'text-anchor': 'middle', fill: WARN, 'font-size': 14 }); return; }
    // k 3: 체감 지연
    const ax = axes(160, 150, 680, 170, { x: [0, 900], y: [0, 2], xt: [0, 95, 820], xl: 'ms (예시)' });
    [['invoke', 1.4, false], ['stream', 0.5, true]].forEach(([n, yv, st], i) => { const y = ax.Y(yv);
      tx(150, y + 5, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: st ? ACC : INK, class: 'mono' });
      const g = E(u, 0.2, 2.0), xe = ax.X(820 * g);
      el('rect', { x: ax.X(0), y: y - 12, width: Math.max(2, xe - ax.X(0)), height: 24, rx: 5, fill: st ? ACCBG : SOFT, stroke: st ? ACC : GRID });
      if (!st && g >= 1) card(ax.X(820) - 4, y - 32, 150, 26, { rx: 6, text: '여기서 한꺼번에', fs: 13.5, stroke: INK });
      if (st) for (let j = 0; j < 7; j++) { const tm = 95 + j * 120; if (tm <= 820 * g) el('rect', { x: ax.X(tm) - 3, y: y - 10, width: 6, height: 20, rx: 2, fill: ACC }); } });
    note(480, 380, `첫 글자: ${mb.ttftMs}ms  vs  ${mb.totalMs}ms`, fade(u, 2.0), { 'text-anchor': 'middle', class: 'mono', 'font-size': 16 });
    sub(480, 406, '전체 시간은 같고, 기다리는 느낌이 1/10쯤으로 준다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 4. ainvoke · gather ----------
  function s4(t, c) { const { k, u } = c, mb = c.beat.modeBox, tasks = mb.tasks || [], pt = ((c.prev && c.prev.modeBox.tasks) || []).length; rail(c, { flow: k >= 2 && k <= 4 });
    if (k === 0) { // 이벤트 루프
      const a = E(u, 0.2, 2.4) * Math.PI * 2; el('circle', { cx: 480, cy: 220, r: 70, fill: 'none', stroke: GRID, 'stroke-width': 8 });
      el('path', { d: `M480,150 A70,70 0 ${a > Math.PI ? 1 : 0} 1 ${480 + 70 * Math.sin(a)},${220 - 70 * Math.cos(a)}`, fill: 'none', stroke: ACC, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: a > 0.02 ? 1 : 0 });
      mono(480, 216, 'import asyncio', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); sub(480, 238, '이벤트 루프', fade(u, 0.5));
      note(480, 350, '재료는 그대로, 동시성은 이벤트 루프가 맡는다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { mono(480, 190, '같은 chain — async용으로 다시 만들지 않는다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) }); return; }
    if (k === 2) { mono(60, 140, 'async def one(topic):', { 'font-size': 14.5 }); mono(80, 164, 'return await chain.ainvoke({"topic": topic})', { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      // 스레드 타임라인: 기다리는 동안 다른 일
      tx(60, 236, '스레드', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 140, y: 222, width: 80, height: 22, rx: 4, fill: INK }); el('rect', { x: 220, y: 222, width: 560 * E(u, 0.3, 2.0), height: 22, rx: 4, fill: SOFT, stroke: GRID });
      [[300, '다른 요청'], [480, '다른 요청'], [640, '다른 요청']].forEach(([x, s], i) => { const s2 = pop(u, 0.8 + i * 0.4); card(x, 233, 120, 22, { rx: 4, text: s, fs: 13.5, stroke: INFO, fill: INFOBG, s: s2 }); });
      el('rect', { x: 780, y: 222, width: 60, height: 22, rx: 4, fill: ACC, opacity: fade(u, 2.1) });
      sub(480, 274, 'LLM 응답을 기다리는 동안 스레드를 막지 않는다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k 3~5: 간트
    const ax = axes(220, 140, 640, 150, { x: [0, 2500], y: [0, 3], xt: [0, 880, 2460], xl: 'ms (예시)' });
    tasks.forEach((tk, i) => { const y = ax.Y(2.5 - i), nw = i >= pt, g = k === 3 && nw ? E(u, 0.3, 1.6) : 1;
      tx(210, y + 5, tk.name.replace('task ', ''), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: ax.X(tk.t0), y: y - 11, width: (ax.X(tk.t1) - ax.X(tk.t0)) * g, height: 22, rx: 5, fill: ACC, opacity: 0.85 });
      if (g >= 1) mono(ax.X(tk.t1) + 6, y + 5, tk.t1 + 'ms', { 'font-size': 13.5, fill: MUT }); });
    if (k === 3) { mono(220, 128, 'await asyncio.gather(*[chain.ainvoke(...) for t in topics])', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.1) });
      note(540, 350, '세 호출의 기다리는 시간이 겹친다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { const ord = tasks.slice().sort((a, b) => a.t1 - b.t1);
      tx(220, 340, '끝난 순서', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
      ord.forEach((tk, i) => pill(380 + i * 120, 336, tk.name.split(': ')[1], MUT, pop(u, 0.4 + i * 0.2), { fs: 13.5 }));
      tx(220, 384, 'results', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      tasks.forEach((tk, i) => pill(380 + i * 120, 380, tk.name.split(': ')[1], ACC, pop(u, 1.4 + i * 0.2), { fs: 13.5 }));
      note(770, 384, '입력 순서 그대로', fade(u, 2.1), { 'font-size': 14, fill: ACC }); return; }
    // k 5: 직렬 vs 동시
    const sy = ax.Y(-0.2), g = E(u, 0.2, 1.8); let x0 = 0;
    tx(210, sy + 50, '직렬', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' });
    tasks.forEach((tk, i) => { const d = tk.t1; el('rect', { x: ax.X(x0), y: sy + 38, width: Math.max(0, (ax.X(Math.min(x0 + d, 2460 * g)) - ax.X(x0))), height: 20, rx: 4, fill: [INK, MUT, OFF][i], opacity: 2460 * g > x0 ? 1 : 0 }); x0 += d; });
    mono(ax.X(2460 * g) + 6, sy + 53, Math.round(mb.syncTotalMs * g) + 'ms', { 'font-size': 14, 'font-weight': 700 });
    banner(540, 386, `${mb.syncTotalMs}ms → ${mb.asyncTotalMs}ms · ${(mb.syncTotalMs / mb.asyncTotalMs).toFixed(1)}×`, pop(u, 1.9));
    sub(880, 128, 'IO 대기만 겹친다', fade(u, 2.2), { 'font-size': 14, 'text-anchor': 'end', fill: WARN, 'font-weight': 700 }); }

  // ---------- 5. batch ----------
  const ST = { wait: [MUT, PANEL, '대기'], run: [WARN, WARNBG, '실행 중'], done: [ACC, ACCBG, '완료'] };
  function s5(t, c) { const { k, u } = c, mb = c.beat.modeBox, rows = mb.rows || [], prow = (c.prev && c.prev.modeBox.rows) || []; rail(c, { flow: k >= 2 && k <= 5 });
    if (k === 0) { // 손잡이
      card(480, 200, 300, 90, { rx: 14, stroke: ACC, fill: ACCBG, s: pop(u, 0.2) });
      mono(480, 186, 'RunnableConfig', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      const n = Math.round(lerp(1, mb.maxConcurrency, E(u, 0.8, 1.8)));
      mono(480, 220, `max_concurrency = ${n}`, { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      note(480, 300, '동시에 몇 건까지 부를지 정하는 손잡이', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { ['invoke', 'stream', 'ainvoke', 'batch'].forEach((m, i) => { grow(480, 90, 180 + i * 200, 170, seg(u, 0.2 + i * 0.15, 0.5 + i * 0.15), ACC); pill(180 + i * 200, 190, '.' + m, ACC, pop(u, 0.5 + i * 0.15), { mono: true, fs: 15 }); });
      note(480, 280, '네 모드가 모두 이 체인 하나를 쓴다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    if (k <= 4) { // 대기열 표 + 동시 실행 칸
      tx(60, 130, 'inputs (5건)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      rows.forEach((r, i) => { const y = 160 + i * 46, [col, bg, lab] = ST[r.status], ch = !prow[i] || prow[i].status !== r.status, s = ch ? pop(u, 0.3 + i * 0.12) : 1;
        card(250, y, 380, 38, { rx: 8, stroke: col, fill: bg, sw: r.status === 'wait' ? 1.4 : 2, s });
        if (s > 0.4) { mono(76, y + 5, String(r.idx), { 'font-size': 14, fill: MUT }); tx(100, y + 5, r.topic, { 'font-size': 15, 'font-weight': 700 }); tx(250, y + 5, lab, { 'font-size': 13.5, 'font-weight': 700, fill: col }); tx(330, y + 5, r.status === 'done' ? r.out : '', { 'font-size': 13.5, fill: INK }); } });
      if (k >= 3) { tx(560, 130, `동시 실행 칸 (max_concurrency=${mb.maxConcurrency})`, { 'font-size': 14, 'font-weight': 700, fill: MUT });
        const run = rows.filter((r) => r.status === 'run');
        for (let j = 0; j < mb.maxConcurrency; j++) { const r = run[j], x = 620 + j * 110;
          card(x, 190, 96, 60, { rx: 10, stroke: r ? WARN : GRID, fill: r ? WARNBG : PANEL, dash: r ? null : '5 4', s: k === 3 ? pop(u, 0.2 + j * 0.15) : 1 });
          if (r) { tx(x, 196, r.topic, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); dot([[x - 34, 214], [x + 34, 214]], (t * 0.7 + j * 0.3) % 1, WARN, 4); } }
        note(730, 280, k === 3 ? '앞 3건만 돌고 나머지는 기다린다' : '끝난 칸에 다음 건이 들어간다', fade(u, 1.4), { 'text-anchor': 'middle', 'font-size': 14 });
        if (k === 4) note(730, 306, 'abatch는 같은 일을 async로', fade(u, 1.9), { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); }
      else note(730, 250, 'chain.batch(inputs)', fade(u, 1.0), { 'text-anchor': 'middle', class: 'mono' });
      ex(900, 370, fade(u, 0.6)); return; }
    if (k === 5) { // 4100 → 1640 → 820
      const ax = axes(260, 150, 600, 170, { x: [0, 4500], y: [0, 3], xt: [0, 820, 1640, 4100], xl: 'ms (예시: 한 건 820ms)' });
      [['직렬 invoke ×5', 4100, 5, INK], ['batch, 동시 3', 1640, 2, WARN], ['batch, 동시 5', 820, 1, ACC]].forEach(([n, ms, seg2, col], i) => { const y = ax.Y(2.5 - i), g = E(u, 0.2 + i * 0.3, 1.5 + i * 0.3);
        tx(250, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' });
        for (let j = 0; j < seg2; j++) { const a = j * 820, b = Math.min((j + 1) * 820, ms * g); if (b > a) el('rect', { x: ax.X(a) + 1, y: y - 11, width: ax.X(b) - ax.X(a) - 2, height: 22, rx: 4, fill: col, opacity: 0.85 }); }
        if (g >= 1) mono(ax.X(ms) + 6, y + 5, ms + 'ms', { 'font-size': 14, 'font-weight': 700, fill: col }); });
      note(480, 380, `동시 3이면 2묶음 · 시간 ${Math.round((1 - 1640 / 4100) * 100)}% 절감`, fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    // k 6
    [['평가 데이터셋 채점', 'LangSmith dataset evaluation'], ['임베딩 · 분류 대량 처리', '모아서 한 번에'], ['rate-limit 주의', 'max_concurrency로 보호']].forEach(([a, z], i) => { const y = 160 + i * 74, s = pop(u, 0.2 + i * 0.3), w = i === 2;
      card(480, y, 520, 58, { rx: 10, stroke: w ? WARN : ACC, s }); if (s > 0.4) { tx(250, y - 2, a, { 'font-size': 16, 'font-weight': 800, fill: w ? WARN : INK }); tx(250, y + 19, z, { 'font-size': 13.5, fill: MUT }); } }); }

  const quiz = [
    { q: 'chain.invoke({"topic": "파이썬"})에서 model 노드로 들어가는 값은 무엇인가?',
      o: ['{"topic": "파이썬"} dict', '"파이썬에 대해 한 줄로 설명해줘"가 든 ChatPromptValue', 'StrOutputParser가 만든 str'], a: 1,
      why: 'prompt가 dict를 받아 ChatPromptValue로 바꾼 뒤 model에 넘긴다. 흐름은 dict → ChatPromptValue → AIMessage → str이다.' },
    { q: 'RunnableParallel(summary=…, keyword=…, length=…).invoke의 결과는 무엇인가?',
      o: ['세 갈래 결과를 키로 묶은 dict', '가장 먼저 끝난 갈래의 결과', '세 결과를 이어 붙인 문자열'], a: 0,
      why: '입력 하나를 세 갈래에 동시에 흘리고 {"summary": …, "keyword": […], "length": 3}처럼 키별로 합친다.' },
    { q: 'invoke 대신 stream을 쓰면 무엇이 달라지나?',
      o: ['전체 생성 시간이 1/10로 준다', '모델이 더 짧게 답한다', '첫 글자가 보이기까지의 시간이 준다'], a: 2,
      why: '예시에서 첫 chunk는 95ms에 오고 끝은 똑같이 820ms다. 줄어드는 것은 기다리는 느낌이다.' },
    { q: 'asyncio.gather로 ainvoke 3건을 띄우면 결과 리스트의 순서는 어떻게 되나?',
      o: ['끝난 순서대로', '입력한 topics 순서대로', '매번 무작위'], a: 1,
      why: '예시에서 자바가 760ms로 먼저 끝나도 results는 파이썬, 자바, Go 순서다. gather는 넘긴 순서를 지킨다.' },
    { q: '5건을 batch(max_concurrency=3)로 돌리면 한 건 820ms일 때 대략 얼마가 걸리나?',
      o: ['1640ms', '820ms', '4100ms'], a: 0,
      why: '3건이 먼저 돌고 남은 2건이 이어서 돈다. 두 묶음이라 820ms의 두 배다.' },
  ];

  const summary = [
    'LCEL은 앞 부품의 출력을 다음 부품의 입력으로 넘기는 파이프다.',
    'RunnableParallel은 입력 하나를 여러 갈래로 보내 결과를 dict로 합친다.',
    'stream은 첫 글자를 빨리 보여 주고 ainvoke와 gather는 기다리는 시간을 겹친다.',
    'batch는 여러 입력을 모아 돌리고 max_concurrency로 동시 호출 수를 막는다.',
  ];
  const review = [
    { q: '챗봇 화면이 답이 다 만들어질 때까지 몇 초씩 멈춰 있다는 불만이 왔다. 체인은 그대로 두고 바꿀 것은?',
      o: ['batch로 바꾼다', 'invoke 대신 stream으로 받아 chunk마다 화면에 붙인다', 'RunnableParallel로 감싼다'], a: 1,
      why: 'stream은 생기는 대로 chunk를 내보내 첫 글자가 바로 보인다. 같은 chain에 이미 붙어 있어 체인을 다시 만들 필요가 없다.' },
    { q: '평가용 질문 500개를 돌렸더니 API가 rate-limit 오류를 낸다. 먼저 손댈 것은?',
      o: ['batch의 max_concurrency를 낮춘다', 'StrOutputParser를 JsonOutputParser로 바꾼다', 'asyncio.gather로 500개를 한꺼번에 띄운다'], a: 0,
      why: 'max_concurrency가 동시에 나가는 호출 수를 정한다. 낮추면 시간은 늘지만 제한을 넘지 않는다.' },
    { q: '한 주제로 요약과 키워드를 따로 부르니 시간이 두 배 걸린다. 결과를 한 dict로 받으면서 시간을 줄이는 방법은?',
      o: ['두 체인을 | 로 이어 붙인다', 'stream으로 바꾼다', 'RunnableParallel로 두 체인을 묶는다'], a: 2,
      why: 'RunnableParallel은 두 갈래를 동시에 돌려 가장 느린 갈래 시간만 든다. | 로 이으면 한 갈래 출력이 다음 입력이 되어 순서대로 돈다.' },
  ];

  R.page({ title: 'LCEL 파이프의 네 가지 실행', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
