/* III-2-2 ReAct 실행 흐름 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 파일 다섯 개(agent-loop / thought / action / observation / terminate)를 따라 history 메시지와 도구 호출 JSON 을 그린다.
 * 메시지 본문 토큰은 o200k_base 로 센 값: system 78, user 10, assistant 46, Observation 1 58, assistant 48, Observation 2 66 (누적 306).
 * 검색·본문 텍스트는 페이지의 예시(CYC). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, cross, check, snippet, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const ROLE = { system: [MUT, SOFT], user: [INFO, INFOBG], assistant: [ACC, ACCBG], obs: [GOOD, GOODBG] };
  // 메시지 한 줄 (왼쪽 위 기준). role 'obs' 는 Observation 을 담은 user 메시지
  function msg(x, y, w, role, text, sl, o) { o = o || {}; sl = sl ?? 1; if (sl <= 0) return; const [col, bg] = ROLE[role], dx = (1 - E(sl, 0, 1)) * 36, op = clamp(sl * 1.5) * (o.op ?? 1);
    el('rect', { x: x + dx, y, width: w, height: 32, rx: 8, fill: bg, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': o.dash, opacity: op });
    tx(x + dx + 10, y + 21, role === 'obs' ? 'user' : role, { 'font-size': 13.5, 'font-weight': 800, fill: col, class: 'mono', opacity: op });
    mono(x + dx + 96, y + 21, text, { 'font-size': 13.5, fill: o.dash ? MUT : INK, opacity: op });
    if (o.tok != null) mono(x + dx + w - 8, y + 21, o.tok + 't', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  function file(cx, cy, name, fn, o) { o = o || {}; card(cx, cy, o.w || 170, 50, { rx: 8, stroke: o.col || INK, fill: o.fill || PANEL, sw: o.hot ? 3 : 1.8, s: o.s ?? 1, op: o.op });
    if ((o.s ?? 1) > 0.5) { mono(cx, cy - 4, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: o.col || INK, opacity: o.op ?? 1 }); mono(cx, cy + 15, fn, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); } }
  function llm(cx, cy, s) { card(cx, cy, 120, 54, { rx: 12, sw: 2.5, s }); if (s > 0.5) tx(cx, cy + 6, 'LLM', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 }); }

  const Q = '잡스가 인도를 여행한 해는?';

  // 1. agent-loop.py — 루프의 뼈대
  const MC = { x: 240, y: 210 }, MOD = [['thought.py', 'generate_thought', 120, 70, INFO], ['action.py', 'execute_action', 360, 70, WARN], ['observation.py', 'build_observation', 360, 350, GOOD], ['terminate.py', 'should_terminate', 120, 350, BAD]];
  function s1(t, c) { const { k, u } = c;
    file(MC.x, MC.y, 'agent_loop.py', 'run_react()', { w: 190, s: k === 0 ? pop(u, 0.2) : 1, hot: true });
    if (k === 0) { note(40, 300, '사이클을 반복하는 메인 루프', fade(u, 1.0)); note(40, 328, '실제 일은 네 파일에 맡긴다', fade(u, 1.6), { fill: MUT }); }
    if (k >= 1) MOD.forEach(([n, f, x, y, col], i) => { const g = k === 1 ? E(u, 0.2 + i * 0.35, 0.7 + i * 0.35) : 1;
      grow(MC.x, MC.y + (y < MC.y ? -25 : 25), x, y + (y < MC.y ? 25 : -25), g, GRID, { plain: true, sw: 2 });
      const hot = (k === 3 && i === 0) || (k === 4 && i === 3) || (k === 5 && (i === 1 || i === 2));
      file(x, y, n, f, { col, w: 200, s: k === 1 ? pop(u, 0.5 + i * 0.35) : 1, hot, op: k >= 3 && !hot ? 0.5 : 1 }); });
    if (k <= 1) return;
    // 오른쪽: history
    const hx = 520;
    tx(hx, 40, 'history', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    msg(hx, 52, 420, 'user', Q, k === 2 ? seg(u, 0.3, 1.2) : 1);
    if (k === 2) { mono(hx, 120, '[{"role": "user", "content": question}]', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) }); return; }
    // 회차 칸
    tx(hx, 128, 'for i in range(max_iter=5)', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT });
    for (let i = 0; i < 5; i++) { const on = i === 0; card(hx + 30 + i * 62, 162, 50, 34, { rx: 6, text: 'i=' + i, fs: 13.5, mono: true, stroke: on ? ACC : GRID, color: on ? ACC : MUT, fill: on ? ACCBG : PANEL, s: k === 3 ? pop(u, 0.3 + i * 0.12) : 1 }); }
    if (k === 3) { dot([[MC.x, MC.y - 25], [120, 95]], seg(u, 1.0, 1.8), INFO, 7); sub(hx + 170, 220, '매 회차 첫 일: LLM에게 다음 수를 묻는다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 4) { dot([[MC.x - 40, MC.y + 25], [120, 325]], seg(u, 0.3, 1.1), BAD, 7);
      card(hx + 210, 250, 400, 44, { rx: 22, text: 'Final Answer 면 도구를 건드리지 않고 return', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 1.1) });
      sub(hx + 210, 296, '도구 실행 전에 종료부터 확인한다', fade(u, 1.7), { 'font-size': 14 }); return; }
    // k5: 한 바퀴
    const loop = [[MC.x + 50, MC.y - 25], [360, 95], [360, 325], [MC.x + 50, MC.y + 25]];
    dot(loop, (u * 0.55) % 1, ACC, 7);
    msg(hx, 196, 420, 'assistant', 'Thought + Action', fade(u, 0.5), { dash: '5 4' });
    msg(hx, 236, 420, 'obs', 'Observation: …', fade(u, 1.0), { dash: '5 4' });
    sub(hx + 210, 292, '도구 결과를 붙이고 루프 처음으로', fade(u, 1.4), { 'font-size': 14 });
    pill(hx + 210, 336, '5회 돌아도 답이 없으면 → [max_iter 초과]', WARN, pop(u, 1.8), { fs: 13.5 }); }

  // 2. thought.py — 사이클 1
  const RAW1 = ['Thought: 잡스의 인도 여행 정보가 필요하다. 위키피디아에서 검색하자.', 'Action: search("Steve Jobs India trip")'];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { file(240, 150, 'thought.py', 'generate_thought', { col: INFO, w: 220, s: pop(u, 0.2) });
      file(600, 150, 'llm.py', 'call_llm', { s: pop(u, 0.6) }); grow(352, 150, 512, 150, E(u, 0.8, 1.3), MUT);
      card(240, 280, 160, 40, { rx: 20, text: 'tools 호출', fs: 15, stroke: OFF, color: OFF, dash: '5 4', s: pop(u, 1.4) }); cross(340, 280, 10, pop(u, 1.6));
      note(450, 286, '도구는 여기서 부르지 않는다', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 1) { snippet(40, 50, ['REACT_SYSTEM = """당신은 ReAct 에이전트입니다.', '아래 형식으로만 응답하세요:', '', 'Thought: <지금 아는 것, 다음에 필요한 것>', 'Action: <도구이름>(<인자>)', 'Final Answer: <최종 답>', '"""'], { fs: 14.5, op: fade(u, 0.2) });
      ['Thought', 'Action', 'Final Answer'].forEach((s, i) => pill(760, 150 + i * 50, s + ':', [INFO, WARN, ACC][i], pop(u, 0.9 + i * 0.35), { fs: 15, mono: true }));
      sub(760, 320, '형식이 고정돼야 파싱이 된다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // 호출: messages = [system, *history]
    tx(24, 40, 'messages', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    msg(24, 52, 420, 'system', 'REACT_SYSTEM (형식 규약)', k === 2 ? seg(u, 0.2, 0.9) : 1, { tok: 78 });
    msg(24, 92, 420, 'user', Q, k === 2 ? seg(u, 0.6, 1.3) : 1, { tok: 10 });
    mono(24, 150, '입력 88 토큰', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 2 ? fade(u, 1.4) : 1 });
    llm(560, 86, 1); grow(450, 86, 498, 86, 1, MUT);
    mono(640, 64, 'temperature=0.0', { 'font-size': 13.5, fill: MUT }); mono(640, 84, 'stop=["Observation:"]', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 });
    if (k === 2) { dot([[450, 86], [498, 86]], seg(u, 1.6, 2.4), INFO, 7); return; }
    // 원문 응답
    const ry = 190; el('rect', { x: 24, y: ry, width: 912, height: 86, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    tx(36, ry + 20, 'raw', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, class: 'mono' });
    if (k === 3) el('rect', { x: 32, y: ry + 28, width: 896, height: 26, rx: 5, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: E(u, 1.0, 1.4) });
    if (k >= 4) el('rect', { x: 32, y: ry + 54, width: 896, height: 26, rx: 5, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: k === 4 ? E(u, 1.2, 1.6) : 1 });
    RAW1.forEach((s, i) => mono(44, ry + 46 + i * 26, k === 3 ? typed(s, E(u, 0.1 + i * 0.4, 0.8 + i * 0.4)) : s, { 'font-size': 14 }));
    if (k === 3) { card(780, 330, 260, 40, { rx: 20, text: 'thought = "잡스의 인도…"', fs: 14, stroke: INFO, color: INFO, s: pop(u, 1.6) }); sub(780, 372, '_extract(raw, "Thought:")', fade(u, 1.8), { class: 'mono' }); return; }
    if (k === 4) { card(240, 340, 300, 48, { rx: 10, text: '"Final Answer:" in raw ?', fs: 15, mono: true, s: pop(u, 0.3) });
      grow(390, 340, 560, 340, E(u, 0.8, 1.2), WARN); card(660, 340, 190, 40, { rx: 20, text: '아니오 → tool 분기', fs: 15, stroke: WARN, color: WARN, s: pop(u, 1.2) }); return; }
    // k5: 문자열 → dict, 그리고 Observation 1
    snippet(24, 296, ['{"type": "tool", "name": "search",', ' "args": "Steve Jobs India trip"}'], { fs: 14, op: fade(u, 0.2) });
    mono(470, 290, 'line.split("(", 1)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) });
    msg(470, 312, 466, 'obs', 'Observation: - Steve Jobs … (결과 5건)', seg(u, 1.3, 2.0), { tok: 58 });
    sub(700, 370, '루프가 도구를 실행해 history에 붙인다', fade(u, 2.0), { 'font-size': 14 }); }

  // 3. action.py — 사이클 2
  function tools(x, y, hi, o) { o = o || {}; tx(x, y - 12, 'TOOLS', { 'font-size': 14, 'font-weight': 800, class: 'mono' });
    [['"search"', '_search'], ['"read_page"', '_read_page']].forEach(([a, b], i) => { const yy = y + i * 40, on = hi === i;
      el('rect', { x, y: yy, width: 300, height: 34, rx: 6, fill: on ? WARNBG : PANEL, stroke: on ? WARN : GRID, 'stroke-width': on ? 2.5 : 1.5 });
      mono(x + 12, yy + 22, a, { 'font-size': 14, 'font-weight': 700 }); mono(x + 288, yy + 22, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); }); }
  function s3(t, c) { const { k, u } = c, tx0 = 600, ty0 = 70;
    tools(tx0, ty0, k === 2 ? 1 : k === 3 ? 0 : k === 4 ? 1 : null);
    if (k === 0) { snippet(24, 50, ['execute_action(', '  action={"type": "tool", "name": "search", ...},', '  tools=TOOLS)'], { fs: 14, op: fade(u, 0.2) });
      sub(300, 190, 'LLM은 여기 관여하지 않는다 · dict와 표 두 개만 받는다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 1) { card(200, 110, 280, 44, { rx: 10, text: '{"type": "final", …}', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      grow(345, 110, 440, 110, E(u, 0.5, 0.9), BAD); card(500, 110, 100, 40, { rx: 8, text: 'type 가드', fs: 14, s: pop(u, 0.4) });
      grow(450, 132, 350, 190, E(u, 1.0, 1.4), BAD); mono(220, 210, 'ValueError', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      card(200, 290, 280, 44, { rx: 10, text: '{"type": "tool", …}', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.6) });
      grow(345, 290, 590, 100, E(u, 1.9, 2.5), GOOD); return; }
    if (k === 2) { msg(24, 50, 540, 'assistant', 'Thought: 검색 1번 결과에 단서가 있겠다. 본문을 읽자.', seg(u, 0.2, 0.9));
      snippet(24, 110, ['{"type": "tool", "name": "read_page",', ' "args": "Steve Jobs"}'], { fs: 14, op: fade(u, 0.8) });
      grow(400, 140, 592, 128, E(u, 1.3, 1.9), WARN); mono(tx0, 180, 'tools["read_page"]("Steve Jobs")', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { tx(24, 50, 'search → list[dict] (사이클 1의 결과)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      ['Steve Jobs', 'Steve Jobs (book)', 'Daniel Kottke', 'Apple Inc.', 'iPhone'].forEach((s, i) => { const f = seg(u, 0.3 + i * 0.25, 0.7 + i * 0.25); if (f <= 0) return;
        mono(36, 84 + i * 30, `{"title": "${s}", "snippet": "…"}`, { 'font-size': 14, opacity: f }); });
      sub(300, 260, 'build_observation이 상위 5개만 120자씩 줄로 정리한다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 4) { const body = ['Steve Jobs (1955-2011) was an American business magnate,', 'inventor, and investor. In 1974, Jobs traveled to India', 'with his Reed College friend Daniel Kottke in search of', 'spiritual enlightenment. They visited the ashram of …'];
      el('rect', { x: 24, y: 40, width: 540, height: 130, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.8 });
      body.forEach((s, i) => mono(36, 66 + i * 26, s, { 'font-size': 13.5, opacity: seg(u, 0.2 + i * 0.2, 0.5 + i * 0.2) }));
      el('rect', { x: 36 + tw('inventor, and investor. ', 13.5) - 3, y: 72 + 26 - 17, width: tw('In 1974, Jobs traveled to India', 13.5) + 6, height: 22, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: E(u, 1.3, 1.7) });
      mono(24, 196, 'result[:500] + "..."  # 본문은 앞 500자만', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      msg(24, 220, 540, 'obs', 'Observation: Steve Jobs (1955-2011) … In 1974 …', seg(u, 1.9, 2.5), { tok: 66 }); return; }
    // k5: 표에 없는 이름은 실행되지 않는다
    card(200, 110, 300, 44, { rx: 10, text: '{"name": "delete_db", …}', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.2) });
    grow(352, 110, 590, 100, E(u, 0.5, 1.1), BAD); cross(600, 160, 14, pop(u, 1.2));
    mono(600, 200, 'KeyError: \'delete_db\'', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
    sub(400, 280, 'LLM이 아무리 요청해도 등록된 2개만 실행된다', fade(u, 1.8), { 'font-size': 15 }); }

  // 4. 사이클 3 — 쌓인 history 를 보고 Final Answer
  const HIST = [['system', 'REACT_SYSTEM', 78], ['user', Q, 10], ['assistant', 'Thought … Action: search(…)', 46], ['obs', 'Observation: - Steve Jobs … (5건)', 58], ['assistant', 'Thought … Action: read_page(…)', 48], ['obs', 'Observation: … In 1974 …', 66]];
  const RAW3 = ['Thought: 본문에 "In 1974, Jobs traveled to India..."가 있다.', 'Final Answer: 잡스는 1974년에 인도를 여행했습니다.'];
  function s4(t, c) { const { k, u } = c;
    let cum = 0; const cums = HIST.map((h) => (cum += h[2]));
    HIST.forEach(([r, s, tk], i) => msg(24, 40 + i * 38, 470, r, s, k === 0 ? seg(u, 0.1 + i * 0.25, 0.5 + i * 0.25) : 1, { tok: tk, op: k >= 1 ? 0.7 : 1 }));
    // 입력 토큰 막대
    const nShown = k === 0 ? Math.floor(clamp((u - 0.1) / 0.25, 0, 6)) : 6, used = nShown ? cums[Math.min(nShown, 6) - 1] : 0;
    const bx = 540, by = 50, bw = 380; tx(bx, by - 12, '세 번째 호출의 입력', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('rect', { x: bx, y: by, width: bw, height: 22, rx: 4, fill: SOFT });
    HIST.slice(0, nShown).forEach(([r], i) => { const x0 = i ? cums[i - 1] : 0; el('rect', { x: bx + bw * x0 / 320, y: by, width: bw * HIST[i][2] / 320 - 1, height: 22, fill: ROLE[r][0], opacity: 0.8 }); });
    mono(bx, by + 46, used + ' 토큰', { 'font-size': 16, 'font-weight': 800, fill: INFO });
    sub(bx + bw - 60, by + 46, '사이클마다 길어진다', k === 0 ? fade(u, 1.9) : 1, { 'font-size': 13.5 });
    if (k === 0) return;
    // 원문 응답
    const ry = 290; el('rect', { x: 24, y: ry, width: 912, height: 86, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    tx(36, ry + 20, 'raw (사이클 3)', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, class: 'mono' });
    if (k >= 2) el('rect', { x: 32, y: ry + 54, width: 896, height: 26, rx: 5, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: k === 2 ? E(u, 0.3, 0.7) : 1 });
    RAW3.forEach((s, i) => { if (i === 1 && k < 2) return; mono(44, ry + 46 + i * 26, (k === 1 && i === 0) || (k === 2 && i === 1) ? typed(s, E(u, 0.2, 1.0)) : s, { 'font-size': 14, 'font-weight': i === 1 ? 700 : 400 }); });
    if (k === 1) { sub(730, 150, '근거가 충분해졌다 · 더 부를 도구가 없다', fade(u, 1.4), { 'font-size': 14 }); return; }
    if (k === 2) { snippet(540, 140, ['{"type": "final",', ' "answer": "잡스는 1974년에 인도를', '            여행했습니다."}'], { fs: 13.5, op: fade(u, 1.2) }); return; }
    if (k === 3) { card(660, 160, 260, 44, { rx: 10, text: '_parse_tool_call(…)', fs: 14, mono: true, stroke: OFF, color: OFF, dash: '5 4', s: pop(u, 0.2) }); cross(660, 160, 14, pop(u, 0.7));
      msg(540, 216, 380, 'obs', 'Observation 3', fade(u, 1.2), { dash: '5 4', op: 0.7 }); cross(730, 232, 10, pop(u, 1.5)); return; }
    // k4: 루프로 돌려보낸다
    card(620, 170, 160, 40, { rx: 20, text: 'thought, action', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
    grow(702, 170, 790, 170, E(u, 0.6, 1.0), ACC); file(860, 170, 'terminate.py', 'should_terminate', { col: BAD, w: 150, s: pop(u, 1.0) }); }

  // 5. terminate.py — 멈출지 계속할지
  function s5(t, c) { const { k, u } = c;
    // 함수 상자 + 입력 세 개
    const inp = [['action', '{"type": "final", …}'], ['iter_idx', '2'], ['max_iter', '5']];
    inp.forEach(([n, v], i) => { const y = 60 + i * 44, s = k === 0 ? pop(u, 0.2 + i * 0.35) : 1;
      card(140, y, 250, 36, { rx: 8, stroke: GRID, s }); if (s > 0.5) { mono(26, y + 5, n, { 'font-size': 14, 'font-weight': 800, fill: MUT }); mono(250, y + 5, v, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700 }); } });
    file(420, 104, 'should_terminate', '(action, iter_idx, max_iter)', { col: BAD, w: 250, s: k === 0 ? pop(u, 1.3) : 1 });
    if (k === 0) { [60, 104, 148].forEach((y, i) => grow(266, y, 292, 104, E(u, 1.0 + i * 0.1, 1.3 + i * 0.1), MUT, { plain: true })); sub(420, 180, '이 세 값만으로 계속할지 멈출지 정한다', fade(u, 1.8), { 'font-size': 14 }); return; }
    // 조건 두 줄
    const cond = [['(1) action["type"] == "final"', '정상 종료'], ['(2) iter_idx >= max_iter - 1', '안전장치']];
    cond.forEach(([a, b], i) => { const y = 220 + i * 56, hit = i === 0 && k >= 2, s = k === 1 ? pop(u, 0.3 + i * 0.4) : 1;
      card(260, y, 480, 44, { rx: 10, stroke: hit ? GOOD : GRID, fill: hit ? GOODBG : PANEL, sw: hit ? 2.5 : 1.6, s });
      if (s > 0.5) { mono(40, y + 5, a, { 'font-size': 14.5, 'font-weight': 700 }); tx(484, y + 5, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); }
      if (hit) check(520, y, 11, k === 2 ? pop(u, 0.5) : 1); });
    if (k === 1) { sub(260, 350, '이 둘 말고는 루프를 멈추는 길이 없다', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 2) { grow(560, 220, 680, 220, E(u, 0.8, 1.2), GOOD); card(800, 220, 230, 44, { rx: 22, text: 'return True, "잡스는 1974년…"', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.2) });
      sub(800, 262, '3 사이클 만에 정상 종료', fade(u, 1.8), { fill: GOOD, 'font-weight': 700 }); return; }
    // 회차 게이지
    const gx = 600, gy = 70;
    tx(gx, gy - 14, 'iter_idx', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: MUT });
    for (let i = 0; i < 5; i++) { const on = i <= 2, guard = i === 4;
      el('rect', { x: gx + i * 64, y: gy, width: 56, height: 32, rx: 6, fill: on ? ACCBG : PANEL, stroke: guard ? BAD : on ? ACC : GRID, 'stroke-width': guard ? 2.5 : 1.6, 'stroke-dasharray': guard ? '5 3' : null, opacity: k === 3 ? fade(u, 0.2 + i * 0.12) : 1 });
      mono(gx + i * 64 + 28, gy + 21, String(i), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: guard ? BAD : on ? ACC : MUT }); }
    mono(gx + 4 * 64 + 28, gy + 54, 'max_iter-1', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD });
    if (k === 3) { el('rect', { x: 34, y: 254, width: 452, height: 44, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, opacity: fade(u, 0.8) }); sub(760, 160, '2 < 4 · 답을 못 찾을 때만 걸리는 가드', fade(u, 1.4), { 'font-size': 14 }); return; }
    if (k === 4) { el('path', { d: 'M500,276 C700,276 856,220 856,108', fill: 'none', stroke: OFF, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      card(700, 380, 220, 40, { rx: 20, text: 'return False, None', fs: 14, mono: true, stroke: MUT, color: MUT, s: pop(u, 0.8) });
      sub(700, 350, '둘 다 아니면 다음 사이클 · 이번엔 타지 않음', fade(u, 1.4), { 'font-size': 14 }); return; }
    // k5: 실전 가드 네 개
    const gy2 = 360, items = [['토큰 예산', 0], ['시간 제한', 1], ['같은 Action 반복', 2], ['사용자 취소', 3]];
    items.forEach(([n, i]) => { const x = 130 + i * 233, s = pop(u, 0.3 + i * 0.35); card(x, gy2, 210, 92, { rx: 12, stroke: WARN, s });
      if (s < 0.5) return; tx(x, gy2 + 34, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN });
      if (i === 0) { el('rect', { x: x - 80, y: gy2 - 26, width: 160, height: 14, rx: 3, fill: SOFT }); el('rect', { x: x - 80, y: gy2 - 26, width: 160 * 0.6, height: 14, rx: 3, fill: WARN }); mono(x, gy2 + 4, '306 / budget', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
      if (i === 1) clock(x, gy2 - 10, 18, E(u, 0.6, 2.6) * 0.7, WARN);
      if (i === 2) ['search(a)', 'search(a)', 'search(a)'].forEach((s2, j) => mono(x - 60 + j * 4, gy2 - 22 + j * 14, s2, { 'font-size': 13.5, fill: j === 2 ? BAD : MUT }));
      if (i === 3) mono(x, gy2 - 6, 'CancelledError', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
    sub(300, 186, '실전에서는 무한 루프를 막는 층을 더 쌓는다', fade(u, 1.8), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'run_react 루프가 한 회차에서 하는 일의 순서로 맞는 것은 무엇인가?',
      o: ['도구 실행 → Thought 생성 → 종료 확인', 'Thought·Action 생성 → 종료 확인 → 도구 실행 후 Observation 추가', '종료 확인 → 도구 실행 → Thought 생성'], a: 1,
      why: '먼저 LLM에게 다음 수를 묻고, Final Answer면 도구를 건드리지 않고 반환한다. 아니면 도구를 실행해 Observation을 history에 붙인다.' },
    { q: 'generate_thought가 LLM을 부를 때 stop=["Observation:"]을 함께 주는 이유는 무엇인가?',
      o: ['응답을 JSON으로 받으려고', 'Final Answer를 막으려고', '모델이 Action 뒤에 관찰 결과를 지어 쓰지 못하게 하려고'], a: 2,
      why: 'Observation은 도구를 실제로 돌린 결과로 루프가 채운다. 모델은 Thought와 Action 까지만 쓰면 된다.' },
    { q: 'LLM이 TOOLS에 없는 "delete_db"를 Action으로 요청하면 어떻게 되는가?',
      o: ['tools[name] 조회에서 KeyError가 나 실행되지 않는다', '비슷한 이름의 도구가 대신 실행된다', 'LLM이 직접 그 함수를 실행한다'], a: 0,
      why: '실행기는 등록된 이름표에서만 함수를 찾는다. 표에 없는 이름은 조용히 넘어가지 않고 바로 오류로 드러난다.' },
    { q: '세 번째 호출에서 LLM이 Action 대신 Final Answer를 낸 근거는 무엇인가?',
      o: ['max_iter에 도달했기 때문이다', 'history에 "In 1974, Jobs traveled to India"가 든 Observation 2가 있었기 때문이다', '첫 검색 결과 제목에 연도가 있었기 때문이다'], a: 1,
      why: '두 번의 사이클로 쌓인 history 306토큰 안에 연도가 적힌 본문이 들어 있었다. 더 부를 도구가 없으니 답을 냈다.' },
    { q: 'iter_idx=2, max_iter=5에서 should_terminate가 루프를 멈춘 이유는 무엇인가?',
      o: ['안전장치 iter_idx >= 4에 걸려서', '토큰 예산을 넘어서', 'action의 type이 "final" 이어서'], a: 2,
      why: '2는 max_iter - 1 = 4에 못 미쳐 안전장치는 걸리지 않았다. 정상 종료 조건인 final이 먼저 참이 됐다.' },
  ];

  const summary = [
    'run_react는 Thought 생성, 종료 확인, 도구 실행, Observation 추가를 한 회차로 돈다.',
    'LLM은 Thought와 Action까지만 쓰고, Observation은 도구를 실제로 돌린 결과로 채운다.',
    '사이클마다 history가 길어져 세 번째 호출의 입력은 306토큰이 됐다.',
    '루프는 Final Answer가 나오거나 max_iter에 닿을 때만 멈추고, 실전에선 가드를 더 단다.',
  ];
  const review = [
    { q: '에이전트가 같은 search를 계속 반복하다 max_iter 에서야 멈춘다. 가장 먼저 붙일 가드는?',
      o: ['같은 Action이 연속으로 나오면 멈추는 반복 감지', 'temperature를 0으로 고정하기', 'TOOLS에서 search를 지우기'], a: 0,
      why: 'max_iter는 마지막 안전망이라 낭비를 다 치른 뒤에 걸린다. 같은 Action 반복을 잡으면 그 전에 끊을 수 있다.' },
    { q: 'read_page가 본문 전체를 돌려주자 몇 사이클 뒤 컨텍스트 한도에 걸렸다. 어느 파일을 고치는가?',
      o: ['terminate.py의 max_iter', 'observation.py에서 본문을 앞 500자로 자르는 부분', 'thought.py의 REACT_SYSTEM'], a: 1,
      why: 'Observation은 다음 호출마다 그대로 입력에 들어간다. build_observation이 결과를 줄여야 history가 덜 자란다.' },
    { q: 'history에 {"role": "tool", "content": observation}을 넣었더니 API가 400 오류를 냈다. 이 텍스트 ReAct에서 맞는 방법은?',
      o: ['role을 "system"으로 바꾼다', 'Observation을 history에서 뺀다', '"Observation: …" 텍스트를 user 메시지로 넣는다'], a: 2,
      why: 'role "tool"은 함수 호출 응답에 tool_call_id를 달아야 쓸 수 있다. 텍스트로 주고받는 ReAct는 관찰을 user 메시지로 돌려준다.' },
  ];

  R.page({ title: 'ReAct 실행 흐름 — 파일 다섯 개', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
