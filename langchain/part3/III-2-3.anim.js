/* III-2-3 Agent + Tools Chain — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 도구 3개·질문·도구 결과는 페이지 데이터와 같다. LLM 이 쓰는 답 문장, 184 ms·1.42 s·312 tok 는 예시다.
 * langchain 0.3.27 에서 tool_call 을 차례로 내는 가짜 채팅 모델로 돌려 확인한 것:
 *  - @tool 스키마, verbose 로그 형식("Invoking: `weather_tool` with `{'city': '서울'}`"), LLM 이 받는 메시지 2 → 4 → 6개
 *  - intermediate_steps 출력, 콜백 이벤트 7건과 그 문자열, 예제 함수의 tool_end 0 ms */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, spans, snippet, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  const TOOLS = [
    { name: 'weather_tool', arg: 'city', doc: '도시의 현재 날씨를 조회합니다.', ret: 'return f"{city}: 맑음, 24°C"', col: INFO },
    { name: 'search_tool', arg: 'query', doc: '웹에서 정보를 검색합니다.', ret: 'return "검색 결과 ..."', col: WARN },
    { name: 'calc_tool', arg: 'expr', doc: '수식을 계산해 결과를 반환합니다.', ret: 'return str(eval(expr))', col: GOOD },
  ];
  const Q = '서울 날씨 알려주고 23 × 17 도 계산해줘';
  const ANSWER = '서울은 맑고 24°C입니다. 23 × 17 = 391입니다.';
  const trunc = (s, w, fs) => { s = String(s); if (tw(s, fs) <= w) return s; while (s.length && tw(s + '…', fs) > w) s = s.slice(0, -1); return s + '…'; };
  const fnLines = (t) => ['@tool', `def ${t.name}(${t.arg}: str) -> str:`, `    """${t.doc}"""`, `    ${t.ret}`];

  // 도구 상자 (가운데 아래 기준)
  function toolbox(cx, cy, n, o) { o = o || {}; const w = 520, h = 74;
    el('path', { d: `M${cx - w / 2},${cy - h / 2} L${cx - w / 2 + 20},${cy + h / 2} H${cx + w / 2 - 20} L${cx + w / 2},${cy - h / 2}`, fill: SOFT, stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
    el('path', { d: `M${cx - 50},${cy - h / 2} V${cy - h / 2 - 18} H${cx + 50} V${cy - h / 2}`, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
    TOOLS.slice(0, n).forEach((t, i) => card(cx - 160 + i * 160, cy + 6, 146, 32, { rx: 8, text: t.name, fs: 13.5, mono: true, fw: 700, stroke: t.col, fill: PANEL, color: t.col, s: o.last && i === n - 1 ? o.last : 1 }));
    mono(cx + w / 2 + 16, cy + 10, `tools ${n}개`, { 'font-size': 16, 'font-weight': 800, fill: n ? ACC : MUT }); }
  // 도구 명세 카드 (왼쪽 위 기준) — @tool 이 함수에서 뽑아낸 것
  function spec(x, y, t, f) { const rows = [['name', t.name], ['description', t.doc], ['args', `{"${t.arg}": "string"}`]];
    el('rect', { x, y, width: 410, height: 132, rx: 12, fill: PANEL, stroke: t.col, 'stroke-width': 2.2, opacity: clamp(f * 3) });
    tx(x + 14, y + 22, 'StructuredTool', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: clamp(f * 3) });
    rows.forEach(([k, v], i) => { const op = clamp(f * 3 - i - 0.2);
      mono(x + 14, y + 54 + i * 28, k, { 'font-size': 14, fill: MUT, opacity: op });
      (k === 'args' || k === 'name' ? mono : tx)(x + 124, y + 54 + i * 28, v, { 'font-size': 14.5, 'font-weight': 700, fill: k === 'name' ? t.col : INK, opacity: op }); }); }

  // ---------- 1. @tool ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { snippet(220, 100, ['from langchain_core.tools import tool'], { fs: 16, op: fade(u, 0.2) });
      toolbox(400, 290, 0); sub(400, 380, '아직 도구는 하나도 없다', fade(u, 1.2), { 'font-size': 15 });
      card(400, 196, 74, 34, { rx: 17, text: '@tool', fs: 16, fw: 800, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.6) }); return; }
    if (k === 4) { // 함수의 세 부분 → 스키마 · 설명 · Observation
      const tl = TOOLS[2]; snippet(24, 92, fnLines(tl).concat(['    # 반환 str → Observation']), { fs: 15, w: 440 });
      [[3, '"description"', 'LLM이 도구를 고를 때 읽는 설명', ACC], [2, '"parameters"', '{"expr": {"type": "string"}}, required', INFO], [4, 'Observation', 'ReAct 루프에 결과로 들어간다', GOOD]].forEach(([ln, a, b, col], i) => {
        const y = 92 + 14 + 15 + (ln - 1) * 23 - 5, ty = 112 + i * 98, f = E(u, 0.3 + i * 0.6, 0.8 + i * 0.6);
        el('rect', { x: 34, y: y - 15, width: 420, height: 22, rx: 4, fill: 'none', stroke: col, 'stroke-width': 2, opacity: f });
        grow(458, y - 4, 530, ty, f, col);
        el('rect', { x: 540, y: ty - 28, width: 396, height: 70, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: f });
        mono(556, ty - 4, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: f }); tx(556, ty + 24, b, { 'font-size': 14, fill: MUT, opacity: f }); });
      sub(240, 380, 'convert_to_openai_tool(calc_tool) 로 확인한 스키마', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k1~3: 함수 → @tool → 명세 카드 → 도구 상자
    const tl = TOOLS[k - 1], f = E(u, 0.9, 1.9);
    const sn = snippet(24, 84, fnLines(tl).slice(1), { fs: 15, w: 440 });
    card(76, 64, 74, 30, { rx: 15, text: '@tool', fs: 15, fw: 800, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.3) });
    grow(470, 130, 516, 130, E(u, 0.7, 1.0), ACC);
    spec(524, 66, tl, f);
    if (k === 3) pill(260, 196, 'eval 은 예시용 · 실서비스 금지', BAD, pop(u, 1.6), { fs: 13.5 });
    const inBox = u > 2.3;
    toolbox(400, 320, inBox ? k : k - 1, { last: inBox ? pop(u, 2.3, 0.4) : 1 });
    if (!inBox) fly(730, 200, 400 - 160 + (k - 1) * 160, 326, seg(u, 2.0, 2.3), tl.name, { fill: tl.col, mono: true });
  }

  // ---------- 2. Agent 만들기 ----------
  function llmCard(cx, cy, s, o) { o = o || {}; const g = card(cx, cy, 200, 84, { rx: 14, stroke: INK, sw: 2.5, s, op: o.op });
    tx(0, -10, 'ChatOpenAI', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 }, g); mono(0, 16, 'gpt-4o-mini', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }, g);
    if (o.temp != null) mono(0, 36, `temperature=${o.temp}`, { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC }, g); return g; }
  const MSGS = [['system', '너는 도구를 잘 활용하는 비서다.', INK], ['human', '{input}', INFO], ['placeholder', '{agent_scratchpad}', WARN]];
  function msgStack(x, y, f, o) { o = o || {}; MSGS.forEach(([role, text, col], i) => { const op = clamp(f * 3 - i) * (o.op ?? 1), yy = y + i * 44;
      el('rect', { x, y: yy, width: 380, height: 36, rx: 10, fill: i === 2 ? PANEL : SOFT, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': i === 2 ? '6 5' : null, opacity: op });
      mono(x + 12, yy + 23, role, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op });
      (i ? mono : tx)(x + 120, yy + 23, text, { 'font-size': 14.5, fill: i ? col : INK, opacity: op }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) {
      const temp = k === 0 ? tween(1, 0, u, 1.4) : 0;
      llmCard(160, 140, k === 0 ? pop(u, 0.1) : 1, { temp: temp < 0.05 ? 0 : temp.toFixed(1) });
      // 온도 계기: 0 ~ 2
      const gx = 160, gy = 300, r = 64, a = Math.PI * (1 - temp / 2);
      el('path', { d: `M${gx - r},${gy} A${r},${r} 0 0 1 ${gx + r},${gy}`, fill: 'none', stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round' });
      el('line', { x1: gx, y1: gy, x2: gx + Math.cos(a) * (r - 10), y2: gy - Math.sin(a) * (r - 10), stroke: ACC, 'stroke-width': 4, 'stroke-linecap': 'round' }); el('circle', { cx: gx, cy: gy, r: 6, fill: ACC });
      mono(gx - r, gy + 22, '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(gx + r, gy + 22, '2', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      sub(gx, gy + 48, '도구 선택이 흔들리지 않게 0', k === 0 ? fade(u, 1.6) : 1, { 'font-size': 14 });
      if (k >= 1) { const f = k === 1 ? E(u, 0.2, 1.6) : 1;
        mono(560, 92, 'tools = [', { 'font-size': 17, 'font-weight': 800, opacity: k === 1 ? fade(u, 0.1) : 1 });
        TOOLS.forEach((tl, i) => { const s = clamp(f * 3 - i); if (s > 0) card(lerp(900, 640, s), 126 + i * 40, 170, 32, { rx: 8, text: tl.name, fs: 14, mono: true, fw: 700, stroke: tl.col, color: tl.col, op: s }); });
        mono(560, 256, ']', { 'font-size': 17, 'font-weight': 800, opacity: k === 1 ? fade(u, 1.6) : 1 }); }
      if (k === 2) { msgStack(330, 284, E(u, 0.2, 1.4)); tx(330, 274, 'prompt (메시지 3장)', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.1) });
        tx(720, 396, '도구 호출 기록이 쌓일 자리', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 3) { const f = E(u, 0.2, 1.2);
      llmCard(lerp(160, 300, f), lerp(140, 150, f), 1 - 0.3 * f, { op: 1 - f });
      TOOLS.forEach((tl, i) => card(lerp(640, 480, f), lerp(126 + i * 40, 150, f), 170, 32, { rx: 8, text: tl.name, fs: 14, mono: true, fw: 700, stroke: tl.col, color: tl.col, op: 1 - f }));
      msgStack(lerp(330, 290, f), lerp(284, 160, f), 1, { op: 1 - f });
      const s = pop(u, 1.0);
      card(480, 180, 560, 150, { rx: 16, stroke: ACC, sw: 3, fill: ACCBG, s });
      tx(480, 140, 'agent = create_tool_calling_agent(llm, tools, prompt)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.2) });
      [['prompt', 330], ['llm.bind_tools(tools)', 480], ['parser', 632]].forEach(([s2, x], i) => card(x, 196, i === 1 ? 190 : 96, 38, { rx: 9, text: s2, fs: 14, fw: 700, mono: true, stroke: INK, fill: PANEL, s: pop(u, 1.4 + i * 0.2) }));
      mono(386, 202, '|', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); mono(578, 202, '|', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      el('circle', { cx: 730, cy: 140, r: 9, fill: u > 2.1 ? GOOD : OFF }); mono(746, 145, 'ready', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
      sub(480, 300, '타입은 RunnableSequence: 결국 LCEL 체인 하나', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k4: Agent 는 다음 행동만 고른다
    pill(110, 210, '입력 + 기록', INFO, 1, { fs: 14 }); grow(176, 210, 300, 210, E(u, 0.1, 0.5), INFO);
    card(380, 210, 150, 80, { rx: 14, text: 'agent', fs: 18, fw: 800, mono: true, stroke: ACC, fill: ACCBG, color: ACC });
    grow(456, 196, 600, 130, E(u, 0.6, 1.0), INFO); grow(456, 224, 600, 290, E(u, 0.8, 1.2), GOOD);
    card(740, 130, 260, 56, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 1.0) }); mono(624, 126, 'AgentAction', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.1) }); tx(624, 148, '이 도구를 이 인자로 불러라', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) });
    card(740, 290, 260, 56, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.2) }); mono(624, 286, 'AgentFinish', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) }); tx(624, 308, '이게 최종 답이다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
    el('path', { d: 'M870,140 C960,400 380,420 380,254', fill: 'none', stroke: OFF, 'stroke-width': 2.2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.7) });
    cross(640, 360, 13, pop(u, 2.0)); tx(380, 404, '도구를 실제로 부르고 다시 묻는 루프는 없다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) });
  }

  // ---------- 3. AgentExecutor 루프 ----------
  const ROWS = [['system', '비서 역할', INK], ['human', Q, INFO], ['ai', "tool_call weather_tool {'city': '서울'}", ACC], ['tool', '서울: 맑음, 24°C', GOOD],
    ['ai', "tool_call calc_tool {'expr': '23*17'}", ACC], ['tool', '391', GOOD]];
  function msgList(n, newFrom, u, hiAll) { tx(24, 84, 'LLM이 받는 메시지', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    ROWS.slice(0, n).forEach(([role, text, col], i) => { const y = 96 + i * 44, op = i >= newFrom ? fade(u, 0.9 + (i - newFrom) * 0.4) : 1;
      el('rect', { x: 24, y, width: 300, height: 38, rx: 8, fill: hiAll ? ACCBG : i >= 2 ? PANEL : SOFT, stroke: col, 'stroke-width': 1.6, opacity: op });
      mono(34, y + 24, role, { 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: op });
      (role === 'human' || role === 'system' ? tx : mono)(96, y + 24, trunc(text, 218, 13.5), { 'font-size': 13.5, opacity: op }); });
    mono(24, 96 + n * 44 + 18, `${n}개`, { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); }
  function toolCol(st) { TOOLS.forEach((tl, i) => { const y = 150 + i * 70, on = st[i];
      card(810, y, 210, 50, { rx: 10, stroke: on ? tl.col : GRID, sw: on ? 2.6 : 1.6, fill: on === 'run' ? SOFT : PANEL });
      mono(722, y - 2, tl.name, { 'font-size': 14.5, 'font-weight': 800, fill: on ? tl.col : MUT });
      if (on === 'done') mono(722, y + 18, i === 0 ? '서울: 맑음, 24°C' : '391', { 'font-size': 13.5, fill: INK }); }); }
  function s3(t, c) { const { k, u } = c;
    // 틀: Executor 가 agent 와 tools 를 감싼다
    el('rect', { x: 344, y: 70, width: 600, height: 330, rx: 18, fill: 'none', stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': k === 0 ? `${E(u, 0.1, 1.0) * 1900} 1900` : null });
    mono(360, 94, 'AgentExecutor', { 'font-size': 15, 'font-weight': 800 });
    const iter = [0, 0, 1, 2, 2, 2][k], it = k === 2 || k === 3 ? (u > 2.0 ? iter : iter - 1) : iter;
    mono(930, 94, `반복 ${it} / 5`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: it ? ACC : MUT });
    card(480, 230, 150, 70, { rx: 14, text: 'agent', fs: 18, fw: 800, mono: true, stroke: ACC, fill: ACCBG, color: ACC });
    toolCol([k >= 2 ? (k === 2 && u < 1.6 ? 'run' : 'done') : null, null, k >= 3 ? (k === 3 && u < 1.6 ? 'run' : 'done') : null]);
    if (k === 0) { [['max_iterations=5', '무한 루프 방지'], ['handle_parsing_errors=True', '파싱 오류면 다시'], ['verbose=True', '로그 출력']].forEach(([a, b], i) => { const s = pop(u, 1.0 + i * 0.3);
        pill(184, 140 + i * 74, a, INK, s, { fs: 13.5, mono: true }); sub(184, 168 + i * 74, b, fade(u, 1.2 + i * 0.3), { 'font-size': 14 }); }); return; }
    const n = [0, 2, 4, 6, 6, 6][k], newFrom = [0, 0, 2, 4, 6, 6][k];
    msgList(n, newFrom, u, k === 4);
    if (k === 1) { fly(170, 60, 170, 140, seg(u, 0.1, 0.7), '질문', { fill: INFO });
      dot([[324, 140], [404, 230]], seg(u, 1.4, 2.0), INFO, 6); [0, 1, 2].forEach((j) => el('circle', { cx: 462 + j * 18, cy: 290, r: 4, fill: ACC, opacity: 0.3 + 0.7 * Math.abs(Math.sin(u * 4 + j)) * fade(u, 2.0) }));
      mono(480, 330, 'LLM 호출 1번째', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 2 || k === 3) { const ti = k === 2 ? 0 : 2, ty = 150 + ti * 70, call = k === 2 ? "weather_tool {'city': '서울'}" : "calc_tool {'expr': '23*17'}";
      fly(600, 170, 700, ty, seg(u, 0.2, 1.0), call, { mono: true, fill: ACC });
      fly(700, ty + 20, 330, 96 + (newFrom + 1) * 44 + 19, seg(u, 1.6, 2.3), k === 2 ? '서울: 맑음, 24°C' : '391', { fill: GOOD });
      mono(480, 330, `LLM 호출 ${k}번째`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); return; }
    if (k === 4) { dot([[324, 230], [404, 230]], seg(u, 0.2, 0.7), ACC, 6); mono(480, 330, 'LLM 호출 3번째', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      pill(560, 140, 'tool_calls 없음', GOOD, pop(u, 1.0), { fs: 14 });
      el('path', { d: 'M556,214 C640,180 660,180 700,180', fill: 'none', stroke: OFF, 'stroke-width': 2.4, 'stroke-dasharray': '6 5' }); cross(640, 188, 12, pop(u, 1.4));
      tx(480, 376, '도구를 안 부르면 루프가 끝난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    // k5: 최종 답
    el('rect', { x: 360, y: 322, width: 568, height: 70, rx: 12, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
    mono(376, 344, 'result["output"]  (예시 출력)', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.4) });
    tx(376, 374, ANSWER.slice(0, Math.round(ANSWER.length * E(u, 0.5, 1.6))), { 'font-size': 16, 'font-weight': 700 });
    pill(480, 150, 'LLM 3번 · 도구 2번', ACC, pop(u, 1.9), { fs: 14 });
  }

  // ---------- 4. verbose 로그와 trace ----------
  const LOG = [
    [['> Entering new AgentExecutor chain...', PANEL]],
    [["Invoking: `weather_tool` with `{'city': '서울'}`", HL]],
    [['서울: 맑음, 24°C', 'var(--term)']],
    [["Invoking: `calc_tool` with `{'expr': '23*17'}`", HL]],
    [['391', 'var(--term)'], ['서울은 맑고 24°C입니다. 23 × 17 = 391입니다.', PANEL]],
    [['> Finished chain.', PANEL]],
  ];
  function term(x, y, w, h, upto, part4, typing, u) {
    el('rect', { x, y, width: w, height: h, rx: 10, fill: INK });
    [0, 14, 28].forEach((d) => el('circle', { cx: x + 16 + d, cy: y + 15, r: 4.5, fill: OFF, opacity: 0.8 }));
    mono(x + 62, y + 20, 'python executor.py', { 'font-size': 13.5, fill: OFF });
    const LY = [52, 98, 132, 178, 212, 258];
    LOG.slice(0, upto).forEach((parts, i) => { let ps = i === 4 ? parts.slice(0, part4) : parts;
      if (i === upto - 1 && typing != null) { const full = ps.map((p) => p[0]).join(''), nshow = Math.round(full.length * typing); let left = nshow; ps = ps.map(([s0, col]) => { const t2 = s0.slice(0, Math.max(0, left)); left -= s0.length; return [t2, col]; }); }
      spans(x + 16, y + LY[i], ps.map(([s0, col]) => [s0, { fill: col }]), { 'font-size': 14.5 }); });
    return LY; }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) {
      const upto = [1, 3, 5, 6][k], part4 = k === 2 ? 1 : 2, typing = k === 0 ? E(u, 0.2, 1.2) : null;
      const LY = term(24, 70, 590, 300, upto, part4, typing, u), y0 = 70;
      if (k === 0) { pill(780, 150, 'verbose=True', ACC, pop(u, 1.2), { fs: 15, mono: true }); sub(780, 190, '루프가 도는 동안 콘솔에 찍힌다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
      const tag = (i, s, col, a) => { const y = y0 + LY[i] - 5; grow(622, y, 660, y, a, col, { plain: true }); pill(730, y, s, col, a, { fs: 14 }); };
      if (k >= 1) { tag(1, 'Action', ACC, k === 1 ? pop(u, 0.8) : 1); tag(2, 'Observation', GOOD, k === 1 ? pop(u, 1.3) : 1); }
      if (k >= 2) { tag(3, 'Action', ACC, k === 2 ? pop(u, 0.8) : 1); tag(4, 'Observation', GOOD, k === 2 ? pop(u, 1.3) : 1); }
      if (k === 1) { tx(640, 290, 'Thought 줄은 없다', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
        tx(640, 314, '모델이 tool_call 로 바로 고른다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); }
      if (k === 3) { const y = y0 + 212 + 8; el('line', { x1: 40, y1: y, x2: 68, y2: y, stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.8) });
        el('line', { x1: 72, y1: y, x2: 470, y2: y, stroke: HL, 'stroke-width': 3, opacity: fade(u, 1.0) });
        pill(760, 330, '최종 답 (예시)', WARN, pop(u, 1.2), { fs: 14 }); tx(640, 364, '"391" 바로 뒤에 줄바꿈 없이 붙는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); }
      if (k >= 2) sub(320, 400, '도구 결과 두 줄은 코드가 돌려준 실제 값', k === 2 ? fade(u, 1.8) : 1, { 'font-size': 14 });
      return; }
    if (k === 4) { // intermediate_steps
      mono(24, 92, 'AgentExecutor(..., return_intermediate_steps=True)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
      mono(24, 122, 'executor.invoke({...}, return_intermediate_steps=True)', { 'font-size': 15, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 0.4) });
      tx(560, 122, '→ 조용히 무시된다 (키: input, output)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.7) });
      [["weather_tool", "{'city': '서울'}", '서울: 맑음, 24°C', INFO], ["calc_tool", "{'expr': '23*17'}", '391', GOOD]].forEach(([a, b, o, col], i) => { const y = 190 + i * 90, s = pop(u, 1.0 + i * 0.4);
        card(240, y, 420, 64, { rx: 12, stroke: col, sw: 2.2, s }); mono(44, y - 6, 'action.tool', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1 + i * 0.4) });
        mono(150, y - 6, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.1 + i * 0.4) }); mono(150, y + 18, b, { 'font-size': 14.5, opacity: fade(u, 1.1 + i * 0.4) });
        grow(454, y, 540, y, E(u, 1.3 + i * 0.4, 1.6 + i * 0.4), MUT);
        card(700, y, 300, 64, { rx: 12, stroke: GOOD, fill: GOODBG, sw: 2, s: pop(u, 1.5 + i * 0.4) }); mono(700, y + 6, o, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.4) }); });
      sub(480, 400, 'result["intermediate_steps"] = [(action, observation), …]', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    // k5: LangSmith 같은 관측 도구의 trace 트리 (시간·토큰은 예시)
    zone(24, 70, 912, 336, 'trace 트리 (LangSmith · Langfuse 화면을 단순화 · 수치는 예시)', { fill: SOFT });
    const SP = [[0, 'AgentExecutor', '1.42 s · 312 tok', 1.42, ACC], [1, 'LLM 호출 1 → tool_call', '', null, INK], [1, 'weather_tool', '184 ms', 0.184, INFO], [1, 'LLM 호출 2 → tool_call', '', null, INK], [1, 'calc_tool', '0 ms', 0, GOOD], [1, 'LLM 호출 3 → 답', '', null, INK]];
    SP.forEach(([lv, name, val, sec, col], i) => { const y = 120 + i * 46, op = fade(u, 0.2 + i * 0.25), x = 44 + lv * 30;
      if (lv) el('path', { d: `M${44 + 10},${y - 30} V${y - 5} H${x - 4}`, fill: 'none', stroke: GRID, 'stroke-width': 1.6, opacity: op });
      mono(x, y, name, { 'font-size': 15, 'font-weight': lv ? 600 : 800, fill: col, opacity: op });
      if (sec != null) { el('rect', { x: 430, y: y - 14, width: Math.max(3, 290 * (sec / 1.42) * E(u, 0.4 + i * 0.25, 1.0 + i * 0.25)), height: 18, rx: 4, fill: col, opacity: 0.8 });
        mono(926, y, val, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: col, opacity: op }); }
      else mono(926, y, '시간·토큰 기록', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); });
  }

  // ---------- 5. callbacks ----------
  const EVX = [420, 470, 580, 650, 700, 740, 880];
  const nm = (e) => e.replace(/^on_/, '');
  function handlerCard(entries, nEv, o) { o = o || {};
    el('rect', { x: 24, y: 70, width: 310, height: 190, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    mono(38, 96, 'ToolTimerHandler', { 'font-size': 15, 'font-weight': 800 }); mono(38, 118, '(BaseCallbackHandler)', { 'font-size': 13.5, fill: MUT });
    mono(38, 156, 'self.starts', { 'font-size': 14, fill: MUT });
    el('rect', { x: 150, y: 138, width: 170, height: 28, rx: 6, fill: entries ? WARNBG : SOFT, stroke: entries ? WARN : GRID, 'stroke-width': 1.5 });
    mono(160, 157, entries || '{}', { 'font-size': 13.5, fill: entries ? WARN : MUT, 'font-weight': 700 });
    mono(38, 204, 'self.events', { 'font-size': 14, fill: MUT });
    el('rect', { x: 150, y: 186, width: 170, height: 28, rx: 6, fill: nEv ? ACCBG : SOFT, stroke: nEv ? ACC : GRID, 'stroke-width': 1.5 });
    mono(160, 205, nEv ? `[ ${nEv}건 ]` : '[]', { 'font-size': 13.5, fill: nEv ? ACC : MUT, 'font-weight': 700 }); }
  function evRows(list, from, u, op) { list.forEach((e, i) => { const y = 176 + i * 32, f = i >= from ? fade(u, 0.3 + (i - from) * 0.3) : 1;
      const tag = `[${nm(e.event)}]`; spans(360, y, [[tag, { fill: e.event === 'on_agent_finish' ? GOOD : e.event === 'on_agent_action' ? INFO : ACC, 'font-weight': 700 }], [' ' + trunc(e.payload, 560 - tw(tag, 14), 14), {}]], { 'font-size': 14, opacity: f * (op ?? 1) }); }); }
  function timeline(n, u, from) { el('line', { x1: 380, y1: 120, x2: 930, y2: 120, stroke: MUT, 'stroke-width': 2 }); tx(930, 146, '실행 순서 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    EVX.slice(0, n).forEach((x, i) => { const s = i >= from ? pop(u, 0.3 + (i - from) * 0.3) : 1; el('circle', { cx: x, cy: 120, r: 8 * s, fill: i === 6 ? GOOD : [0, 3].includes(i) ? INFO : ACC }); }); }
  function s5(t, c) { const { k, u } = c, cb = (c.beat.dataState && c.beat.dataState.callbacks) || [];
    if (k === 0) { handlerCard(null, 0); el('rect', { x: 24, y: 70, width: 310, height: 190, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.2) * (1 - fade(u, 1.4)) });
      [['starts', '도구 이름 → 시작 시각', 152], ['events', '(이벤트, 내용) 기록', 200]].forEach(([a, b, y], i) => { grow(330, y, 400, y, E(u, 0.8 + i * 0.4, 1.1 + i * 0.4), MUT); tx(412, y + 5, b, { 'font-size': 15, opacity: fade(u, 1.0 + i * 0.4) }); });
      sub(480, 340, '빈 그릇 두 개를 들고 이벤트를 기다린다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k >= 1 && k <= 3) { const n = k, entries = k === 2 ? "{'weather_tool': t0}" : null;
      handlerCard(entries, n); timeline(n, u, n - 1); evRows(cb.slice(0, n), n - 1, u);
      if (k === 1) { tx(420, 96, 'on_agent_action', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); sub(170, 310, '도구를 고른 순간', fade(u, 1.0), { 'font-size': 15 }); }
      if (k >= 2) { const run = k === 2 ? E(u, 0.4, 2.6) * 0.5 : 0.5; clock(110, 330, 40, run, k === 3 ? ACC : WARN);
        tx(170, 322, k === 2 ? 'perf_counter() 시작' : '경과 = 지금 − 시작', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) });
        if (k === 3) { mono(170, 350, '184 ms (예시: 실제 API)', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); mono(170, 376, '예제 함수는 0 ms', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); } }
      return; }
    if (k === 4) { handlerCard(null, 0); const g = E(u, 0.2, 1.0);
      ['agent_action', 'tool_start', 'tool_end'].forEach((e, i) => tx(360 - 80 * g, 176 + i * 32, `[${e}] …`, { 'font-size': 14, class: 'mono', opacity: 1 - g }));
      snippet(360, 230, ['def on_agent_finish(self, finish, **kwargs): ...', 'handler = ToolTimerHandler()'], { fs: 14.5, op: fade(u, 0.8) });
      sub(640, 350, '새 handler, 기록 0건으로 실행을 기다린다', fade(u, 1.8), { 'font-size': 15 }); return; }
    // k5, k6: 실제 실행
    const n = k === 5 ? 6 : 7, from = k === 5 ? 0 : 6;
    handlerCard(null, k === 5 ? Math.min(6, Math.floor(E(u, 0.3, 2.1) * 6) + (u > 0.3 ? 1 : 0)) : 7); timeline(n, u, from); evRows(cb.slice(0, n), from, u);
    if (k === 5) { pill(170, 300, 'config={"callbacks": [handler]}', ACC, pop(u, 0.1), { fs: 13.5, mono: true }); sub(170, 336, '도구 두 번 → 이벤트 6건', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    [['LangSmith 업로드', INFO], ['느리면 알림', WARN], ['개인정보 가리기', BAD]].forEach(([s, col], i) => pill(110 + (i % 2) * 150, 300 + Math.floor(i / 2) * 46, s, col, pop(u, 1.0 + i * 0.25), { fs: 14 }));
    sub(170, 400, '이 훅들에서 붙이는 일', fade(u, 1.8), { 'font-size': 14 });
  }

  const quiz = [
    { q: '@tool이 붙은 함수에서 LLM이 "언제 이 도구를 쓸지" 판단하는 근거는 무엇인가?',
      o: ['함수 이름의 길이', 'docstring에서 온 description', '반환 문자열의 내용'], a: 1,
      why: '@tool은 docstring을 description으로, 타입 힌트를 인자 스키마로 옮긴다. 모델은 이 설명을 보고 도구를 고른다.' },
    { q: 'create_tool_calling_agent가 만든 agent만 invoke하면 어떤 일이 일어나는가?',
      o: ['도구를 다 부르고 최종 답까지 낸다', '도구 목록을 출력하고 끝난다', '다음 행동(AgentAction 또는 AgentFinish)을 한 번 결정만 한다'], a: 2,
      why: 'agent는 prompt | llm.bind_tools(tools) | parser 체인이다. 도구를 실제로 부르고 다시 묻는 루프는 AgentExecutor가 돈다.' },
    { q: '"서울 날씨 + 23×17" 질문에서 마지막 LLM 호출은 메시지를 몇 개 받는가?',
      o: ['2개 (system, human)', '4개', '6개 (system, human, ai, tool, ai, tool)'], a: 2,
      why: '도구를 한 번 부를 때마다 ai(tool_call)와 tool(결과) 두 개가 scratchpad에 붙는다. 2 → 4 → 6으로 늘어난다.' },
    { q: 'intermediate_steps를 받으려면 어디에 return_intermediate_steps=True를 넣어야 하나?',
      o: ['AgentExecutor를 만들 때 인자로', 'executor.invoke의 두 번째 인자로', '@tool 데코레이터 안에'], a: 0,
      why: 'invoke 인자로 넣으면 조용히 무시되어 결과 키가 input, output뿐이다. Executor 생성 옵션으로 켜야 한다.' },
    { q: 'ToolTimerHandler로 이 질문을 실행하면 events에 몇 건이 쌓이나?',
      o: ['7건', '3건', '2건'], a: 0,
      why: '도구 한 번에 agent_action · tool_start · tool_end 3건씩, 두 번이면 6건이다. 끝에 agent_finish 1건이 더해진다.' },
  ];

  const summary = [
    '@tool은 함수의 docstring을 설명으로, 타입 힌트를 인자 스키마로 바꿔 도구로 만든다.',
    'agent는 다음 행동만 고르는 체인이고, 도구를 부르고 다시 묻는 루프는 AgentExecutor가 돈다.',
    '도구를 부를 때마다 ai와 tool 메시지가 붙어 LLM이 받는 메시지가 2, 4, 6개로 는다.',
    'verbose 로그와 콜백 이벤트 7건으로 어느 도구가 언제 얼마나 걸렸는지 본다.',
  ];
  const review = [
    { q: '에이전트가 날씨 질문에 search_tool만 계속 부른다. 먼저 고칠 곳은?',
      o: ['max_iterations를 늘린다', 'weather_tool의 docstring을 더 분명하게 쓴다', 'verbose를 끈다'], a: 1,
      why: '모델은 description을 보고 도구를 고른다. 설명이 흐리면 엉뚱한 도구를 고르고, 반복 횟수를 늘려도 나아지지 않는다.' },
    { q: '모델이 같은 도구를 끝없이 다시 부른다. 반복을 끊어 주는 설정은?',
      o: ['handle_parsing_errors=True', 'temperature=0', 'max_iterations=5'], a: 2,
      why: 'AgentExecutor는 max_iterations에 닿으면 멈춘다. temperature나 파싱 오류 처리는 반복 횟수를 막지 않는다.' },
    { q: 'verbose 로그에서 Thought 줄을 찾았는데 없다. 왜인가?',
      o: ['tool-calling agent는 tool_call을 바로 내서 Invoking과 결과만 찍힌다', 'verbose=True가 꺼져 있다', '콜백 핸들러가 Thought를 지웠다'], a: 0,
      why: '텍스트 ReAct와 달리 tool-calling agent는 모델이 tool_call JSON으로 바로 답한다. 로그에는 Action과 Observation만 남는다.' },
  ];

  R.page({ title: 'Agent와 도구 호출', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
