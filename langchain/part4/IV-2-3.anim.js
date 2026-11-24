/* IV-2-3 Multi-Agent Supervisor — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 라우팅 순서(supervisor 4번 · 작업자 3번), 최종 messages 4개, 노드 6 · 엣지 8, Route가 "designer"를 거부하는 것은
 * langgraph 1.2 + pydantic + 정해진 답을 내는 가짜 모델로 실행해 확인했다. 작업자가 쓴 문장과 800 토큰은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const ROLE = { researcher: [INFO, INFOBG], coder: [ACC, ACCBG], writer: [WARN, WARNBG], supervisor: [INK, SOFT], user: [MUT, SOFT], FINISH: [GOOD, GOODBG] };
  const TOOLS = [['web_search', 'researcher'], ['wiki_lookup', 'researcher'], ['arxiv_search', 'researcher'], ['python_repl', 'coder'], ['file_write', 'coder'], ['file_read', 'coder'],
    ['markdown_fmt', 'writer'], ['html_render', 'writer'], ['translator', 'writer'], ['calculator', 'user'], ['db_query', 'user'], ['email_send', 'user']];
  function chip(cx, cy, name, role, s, o) { o = o || {}; const [col, bg] = ROLE[role]; if (s <= 0) return;
    card(cx, cy, o.w || tw(name, 13.5) + 22, 28, { rx: 14, stroke: o.hot ? BAD : col, sw: o.hot ? 2.6 : 1.6, fill: o.dim ? PANEL : bg, text: name, fs: 13.5, fw: 700, mono: true, color: o.dim ? OFF : col, s, op: o.op }); }
  // 에이전트 노드: 이름 + 아래 작은 글
  function anode(cx, cy, name, role, s, o) { o = o || {}; if (s <= 0) return; const [col, bg] = ROLE[role];
    card(cx, cy, o.w || 150, o.h || 52, { rx: 12, stroke: o.ghost ? OFF : col, sw: o.on ? 3.4 : 2.2, fill: o.on ? bg : PANEL, dash: o.ghost ? '6 5' : null, text: name, fs: 16, fw: 800, mono: true, color: o.ghost ? OFF : col, s });
    if (o.sub) sub(cx, cy + (o.h || 52) / 2 + 18, o.sub, clamp(s), { fill: o.subCol || MUT }); }
  function capsule(cx, cy, s, name, on) { card(cx, cy, 74, 30, { rx: 15, fill: on ? GOOD : INK, stroke: 'none', text: name, fs: 13.5, fw: 700, color: PANEL, s, mono: true }); }

  // ---------- 별 모양 그래프 ----------
  const P = { supervisor: [290, 236], researcher: [100, 88], coder: [290, 88], writer: [480, 88], START: [100, 362], END: [480, 362] };
  const MEM = ['researcher', 'coder', 'writer'];
  // 두 노드 사이 선 (가장자리에서 끝나게), off: 옆으로 비킴
  function seg2(a, b, off, ra, rb) { const [x1, y1] = P[a], [x2, y2] = P[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d, nx = -uy * off, ny = ux * off;
    return [x1 + ux * ra + nx, y1 + uy * ra + ny, x2 - ux * rb + nx, y2 - uy * rb + ny]; }
  const R_ = (n) => (n === 'START' || n === 'END' ? 26 : 34);
  const down = (m) => seg2('supervisor', m, 9, R_('supervisor'), R_(m)), up = (m) => seg2(m, 'supervisor', 9, R_(m), R_('supervisor'));
  const RT = { SS: seg2('START', 'supervisor', 0, 28, 36), SE: seg2('supervisor', 'END', 0, 36, 30) };
  const route = (s) => [[s[0], s[1]], [s[2], s[3]]];
  // o: sN 노드 크기, eUp/eDown/eStart/eEnd 선이 자란 정도, on: 켜진 노드, hot: 켜진 엣지 이름, flow: [선 좌표, u]
  function star(o) { o = o || {}; const sN = o.sN ?? 1;
    if (o.eStart) grow(...RT.SS, o.eStart, o.hot === 'SS' ? ACC : MUT);
    if (o.eEnd) grow(...RT.SE, o.eEnd, o.hot === 'SE' ? GOOD : MUT, { dash: '6 4' });
    MEM.forEach((m) => { if (o.eDown) grow(...down(m), o.eDown, o.hot === 'd' + m ? ROLE[m][0] : MUT, { dash: '6 4' }); if (o.eUp) grow(...up(m), o.eUp, o.hot === 'u' + m ? ROLE[m][0] : MUT); });
    if (o.eEnd && o.finish) mono(lerp(RT.SE[0], RT.SE[2], 0.5) + 10, lerp(RT.SE[1], RT.SE[3], 0.5) - 6, 'FINISH', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: o.eEnd });
    if (o.start !== false) capsule(...P.START, o.sSE ?? sN, 'START'); if (o.end !== false) capsule(...P.END, o.sSE ?? sN, 'END', o.on === 'END');
    anode(...P.supervisor, 'supervisor', 'supervisor', o.sSup ?? sN, { on: o.on === 'supervisor', w: 160 });
    MEM.forEach((m, i) => anode(...P[m], m, m, o.sMem ? o.sMem(i) : sN, { on: o.on === m, w: 150 }));
    if (o.flow) dot(route(o.flow[0]), o.flow[1], o.flowCol || ACC, 8); }

  // ---------- state 판 ----------
  const MSGS = [['user', 'GitHub API를 조사하고…'], ['researcher', 'auth: token, endpoints…'], ['coder', 'import requests …'], ['writer', '# GitHub User Fetcher…']];
  function statePanel(x, y, n, next, o) { o = o || {}; const w = 340;
    el('rect', { x, y, width: w, height: 330, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.6 });
    mono(x + 16, y + 26, 'state', { 'font-size': 15, 'font-weight': 800 });
    mono(x + 16, y + 62, 'next', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    if (next) { const [col, bg] = ROLE[next] || [MUT, SOFT]; card(x + 70 + (tw(`"${next}"`, 14) + 26) / 2, y + 57, tw(`"${next}"`, 14) + 26, 30, { rx: 15, stroke: col, fill: bg, sw: 2, text: `"${next}"`, fs: 14, fw: 800, mono: true, color: col, s: o.nextPop ?? 1 }); }
    else mono(x + 74, y + 62, '—', { 'font-size': 15, fill: OFF });
    mono(x + 16, y + 102, `messages  (${o.count != null ? o.count : n}개)`, { 'font-size': 15, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < Math.ceil(n); i++) { const s = clamp(n - i), [name, txt] = MSGS[i], [col, bg] = ROLE[name], yy = y + 118 + i * 50, g = G(x + 14 + (1 - s) * 30, yy, 1, s);
      el('rect', { x: 0, y: 0, width: w - 28, height: 42, rx: 8, fill: bg, stroke: col, 'stroke-width': 1.4 }, g);
      mono(10, 17, `[${i}] ${name === 'user' ? 'Human' : 'Human · name="' + name + '"'}`, { 'font-size': 13.5, 'font-weight': 800, fill: col }, g);
      mono(10, 35, txt, { 'font-size': 13.5 }, g); } }

  // 1. 만능 Agent 하나 — 도구 12개
  const chipPos = (i) => [450 + (i % 4) * 128, 84 + Math.floor(i / 4) * 52];
  function s1(t, c) { const { k, u } = c, A = [190, 200];
    anode(...A, 'mono_agent', 'user', k === 0 ? pop(u, 0.2) : 1, { w: 180, h: 60, on: k === 4 });
    mono(A[0], A[1] + 56, 'llm = gpt-4o-mini', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.7) : 1 });
    if (k === 0) { tx(650, 200, 'tools = [ ]', { 'text-anchor': 'middle', 'font-size': 18, class: 'mono', fill: OFF, opacity: fade(u, 1.0) }); return; }
    const n = k === 1 ? E(u, 0.2, 2.2) * 12 : 12;
    const hotIdx = k === 4 ? [0, 3, 6, 4, 1, 7][Math.floor(t * 2.2) % 6] : -1;
    TOOLS.forEach(([nm, r], i) => { const s = clamp(n - i); if (s <= 0) return; const [x, y] = chipPos(i);
      el('line', { x1: A[0] + 90, y1: A[1], x2: x - 58, y2: y, stroke: i === hotIdx ? BAD : GRID, 'stroke-width': i === hotIdx ? 2.4 : 1.2, opacity: s });
      chip(x, y, nm, r, pop(s, 0), { w: 120, hot: i === hotIdx }); });
    mono(A[0], A[1] - 52, `도구 ${Math.round(n)}개`, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: n > 9 ? BAD : INK });
    if (k === 2) { const segs = 13, x0 = 120, w = 720, y = 300; tx(x0, y - 16, '시스템 프롬프트 = 만능 비서 지시 + 도구 설명 12개', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < segs; i++) { const v = clamp(E(u, 0.3, 2.0) * segs - i); if (v <= 0) continue; el('rect', { x: x0 + i * (w / segs), y, width: w / segs - 3, height: 26, rx: 4, fill: i === 0 ? INK : ROLE[TOOLS[i - 1][1]][0], opacity: 0.25 + 0.6 * v }); }
      mono(x0 + w, y + 54, '약 800 토큰 (예시)', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { const q = '"이 API 조사하고 코드 만들고 README까지 작성"'; pill(480, 300, q, INFO, pop(u, 0.2), { fs: 15, fill: INFOBG });
      [['조사', 'researcher'], ['코드', 'coder'], ['README', 'writer']].forEach(([s, r], i) => { const v = pop(u, 1.0 + i * 0.3); grow(480, 318, 300 + i * 180, 360, E(u, 0.8 + i * 0.3, 1.2 + i * 0.3), MUT, { plain: true }); chip(300 + i * 180, 376, s, r, v, { w: 120 }); });
      return; }
    if (k === 4) { pill(A[0], A[1] + 92, '다음은 search? code? markdown?', BAD, pop(u, 0.2), { fs: 14 });
      [['도구 선택이 갈팡질팡', 0.6], ['한 단계 실수가 다음으로 번짐', 1.1], ['어디서 틀렸는지 추적이 어렵다', 1.6]].forEach(([s, a], i) => card(270 + i * 250, 380, 236, 44, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, text: s, fs: 14.5, fw: 700, color: BAD, s: pop(u, a) })); } }

  // 2. 역할별 Agent 셋
  const SPL = { researcher: [170, 200], coder: [480, 200], writer: [790, 200] };
  const OWN = { researcher: ['web_search', 'wiki_lookup'], coder: ['python_repl', 'file_write'], writer: ['markdown_fmt'] };
  const PROMPT = { researcher: '"출처를 인용해 사실만"', coder: '"동작하는 코드를"', writer: '"README 형태로 정리"' };
  function s2(t, c) { const { k, u } = c;
    card(480, 52, 210, 40, { rx: 20, stroke: INK, sw: 2, text: 'llm = gpt-4o-mini', fs: 15, fw: 700, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    MEM.forEach((m, i) => { const [x, y] = SPL[m], made = k > i + 0 && k >= 1 ? (k === i + 1 ? pop(u, 0.2) : 1) : 0;
      grow(480, 72, x, y - 30, k === 0 ? E(u, 0.6 + i * 0.2, 1.2 + i * 0.2) : 1, GRID, { plain: true, dash: '4 4' });
      if (!made || made <= 0) anode(x, y, m, m, 1, { ghost: true });
      else { anode(x, y, m, m, made, { on: k === i + 1 });
        OWN[m].forEach((nm, j) => { const v = k === i + 1 ? E(u, 0.6 + j * 0.3, 1.1 + j * 0.3) : 1; fly(x + (j - 0.5) * 140, 420, x, 268 + j * 36, v < 1 ? v : 0, nm, { mono: true, fill: ROLE[m][0] }); if (v >= 1) chip(x, 268 + j * 36, nm, m, 1, { w: 140 }); });
        tx(x, 352, PROMPT[m], { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: k === i + 1 ? fade(u, 1.6) : 1 });
        mono(x, 380, `도구 ${OWN[m].length}개`, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ROLE[m][0], opacity: k === i + 1 ? fade(u, 1.9) : 1 }); } });
    if (k === 0) tx(480, 404, '모델은 하나를 같이 쓰고, 역할만 셋으로 나눈다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
    if (k === 4) { [[245, 325], [555, 635]].forEach(([a, b], i) => { tx((a + b) / 2, 206, '?', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3 + i * 0.3) }); });
      banner(480, 130, '누가 먼저 일하지? 서로 잇는 엣지가 없다', pop(u, 1.0)); } }

  // 3. Supervisor — 다음 작업자 고르기
  const OPTS = ['researcher', 'coder', 'writer', 'FINISH'];
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { tx(70, 60, 'options = members + ["FINISH"]', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
      OPTS.forEach((o, i) => chip(150 + i * 190, 116, `"${o}"`, o, k === 0 ? pop(u, 0.4 + i * 0.3) : 1, { w: 160 }));
      if (k === 0) { el('path', { d: 'M75,146 L75,156 L605,156 L605,146', fill: 'none', stroke: MUT, 'stroke-width': 1.8, opacity: fade(u, 1.4) }); mono(340, 180, 'members', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
        tx(480, 300, '고를 수 있는 답은 이 4개뿐', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.9) }); return; }
      // k = 1: Literal 체
      card(480, 270, 560, 56, { rx: 10, stroke: INK, sw: 2.4, fill: SOFT, text: 'class Route(BaseModel): next: Literal[…4개]', fs: 15, fw: 700, mono: true, s: pop(u, 0.2) });
      fly(250, 200, 360, 262, seg(u, 0.6, 1.3), '"coder"', { mono: true, fill: ACC }); if (u > 1.3) { check(360, 340, 11, pop(u, 1.3)); mono(380, 346, 'Route(next="coder")', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD }); }
      const b = seg(u, 1.3, 2.0); if (b > 0 && b < 1) fly(720, 200, 640, 262, b, '"designer"', { mono: true, fill: BAD });
      if (u > 2.0) { cross(640, 340, 10, pop(u, 2.0)); mono(660, 346, 'ValidationError', { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); }
      tx(480, 404, '스키마 밖의 값은 통과하지 못한다 (실행 확인)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    const SX = 330, SY = 210;
    anode(SX, SY, 'supervisor', 'supervisor', k === 2 ? pop(u, 0.2) : 1, { w: 170, h: 60, on: k >= 3 });
    if (k === 2) { tx(SX, SY - 56, '"당신은 PM 입니다. 다음 작업자 한 명을 고르세요."', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 0.4) });
      [['조사가 필요하면', 'researcher'], ['코드가 필요하면', 'coder'], ['문서화가 필요하면', 'writer'], ['다 끝났으면', 'FINISH']].forEach(([a, o], i) => { const y = 90 + i * 70, v = fade(u, 0.8 + i * 0.35);
        tx(620, y + 5, a, { 'font-size': 15, 'text-anchor': 'end', opacity: v }); grow(632, y, 680, y, v, MUT); chip(760, y, o, o, pop(u, 0.8 + i * 0.35), { w: 140 }); });
      return; }
    if (k === 3) { // 입력 → 노드 → {"next": …}
      [['user', 'Human'], ['researcher', 'researcher'], ['coder', 'coder']].forEach(([r, s], i) => chip(110, 150 + i * 40, s, r, pop(u, 0.2 + i * 0.15), { w: 150 }));
      tx(110, 110, 'state["messages"]', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 0.2) });
      grow(190, 190, SX - 90, SY, E(u, 0.6, 1.1), MUT);
      mono(SX, SY + 54, 'llm.with_structured_output(Route)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
      grow(SX + 88, SY, 560, SY, E(u, 1.2, 1.7), ACC);
      card(680, SY, 220, 44, { rx: 8, stroke: ACC, sw: 2, fill: ACCBG, text: 'return {"next": …}', fs: 15, fw: 800, mono: true, color: ACC, s: pop(u, 1.6) });
      tx(SX, 370, '도구가 없다 · 고르기만 하는 LLM 노드', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.1) }); return; }
    // k = 4: 첫 판단
    pill(SX, 80, '"API 조사 → 코드 → README"', INFO, pop(u, 0.1), { fs: 15, fill: INFOBG }); grow(SX, 100, SX, SY - 34, E(u, 0.4, 0.9), INFO);
    card(700, SY, 300, 44, { rx: 8, stroke: INFO, sw: 2.4, fill: INFOBG, text: 'Route(next="researcher")', fs: 15, fw: 800, mono: true, color: INFO, s: pop(u, 1.1) });
    grow(SX + 88, SY, 546, SY, E(u, 0.9, 1.3), INFO);
    OPTS.forEach((o, i) => chip(220 + i * 170, 340, o, o, 1, { w: 140, dim: o !== 'researcher' || u < 1.6 }));
    tx(480, 396, '첫 차례는 조사', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); }

  // 4. 별 모양 그래프 조립
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 50, 'class AgentState(TypedDict)', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      // messages: 누적
      mono(60, 110, 'messages: Annotated[list, add_messages]', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      const a = E(u, 0.5, 1.2); chip(110, 160, '[user]', 'user', pop(u, 0.4), { w: 90 }); mono(170, 165, '+', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.6) }); chip(260, 160, '[researcher]', 'researcher', pop(u, 0.7), { w: 140 });
      grow(340, 160, 390, 160, a, MUT); chip(420, 160, 'user', 'user', pop(u, 1.2), { w: 70 }); chip(530, 160, 'researcher', 'researcher', pop(u, 1.3), { w: 130 });
      tx(620, 165, '뒤에 이어 붙는다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      // next: 덮어쓰기
      mono(60, 250, 'next: str', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 1.4) });
      chip(130, 300, '"researcher"', 'researcher', pop(u, 1.6), { w: 140 }); grow(210, 300, 270, 300, E(u, 1.8, 2.1), MUT);
      chip(350, 300, '"coder"', 'coder', pop(u, 2.1), { w: 120 }); tx(430, 305, '마지막 값으로 덮어쓴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) });
      tx(480, 396, '모든 노드가 이 state 하나를 같이 본다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.5) }); return; }
    if (k === 1) { zone(50, 70, 380, 290, 'researcher 안쪽 messages (예시)', { fill: SOFT });
      [['Human', 'user'], ['AI · tool_calls', 'researcher'], ['Tool · 검색 결과', 'user'], ['AI · 조사 요약', 'researcher']].forEach(([s, r], i) => chip(240, 120 + i * 54, s, r, pop(u, 0.2 + i * 0.15), { w: 300, hot: i === 3 && u > 1.0 }));
      grow(400, 282, 560, 220, E(u, 1.0, 1.6), INFO);
      mono(480, 236, '[-1].content', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
      card(740, 210, 340, 64, { rx: 10, stroke: INFO, sw: 2.4, fill: INFOBG, s: pop(u, 1.6) });
      mono(590, 204, 'HumanMessage(content=…,', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.7) }); mono(590, 228, '             name="researcher")', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.9) });
      tx(740, 300, '공용 messages 에는 한 줄만 들어간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    const o = { sSup: k === 2 ? pop(u, 0.2) : 1, sMem: (i) => (k === 2 ? pop(u, 0.6 + i * 0.25) : 1), sSE: k >= 3 ? 1 : 0, start: k >= 3, end: k >= 4,
      eStart: k === 3 ? E(u, 0.2, 0.8) : k > 3 ? 1 : 0, eUp: k === 3 ? E(u, 0.9, 1.8) : k > 3 ? 1 : 0, eDown: k === 4 ? E(u, 0.3, 1.2) : k > 4 ? 1 : 0, eEnd: k === 4 ? E(u, 1.2, 1.8) : k > 4 ? 1 : 0,
      finish: true, hot: k === 4 && u > 1.9 ? 'dresearcher' : null, on: k === 4 && u > 1.9 ? 'researcher' : k === 2 ? 'supervisor' : null };
    star(o);
    const X = 620;
    if (k === 2) ['add_node("supervisor", …)', 'add_node("researcher", …)', 'add_node("coder", …)', 'add_node("writer", …)'].forEach((s, i) => mono(X, 120 + i * 40, s, { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.25) }));
    if (k === 3) { ['add_edge(START, "supervisor")', 'for member in members:', '  add_edge(member, "supervisor")'].forEach((s, i) => mono(X, 130 + i * 34, s, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.4) }));
      tx(X, 270, '일이 끝나면 늘 supervisor로 돌아온다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 4) { ['add_conditional_edges("supervisor",', '  lambda s: s["next"], {…,', '  "FINISH": END})'].forEach((s, i) => mono(X, 130 + i * 34, s, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.3) }));
      tx(X, 270, 'next 값이 곧 다음 노드 이름', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.9) }); }
    if (k === 5) { mono(X, 120, 'app = graph.compile()', { 'font-size': 16, 'font-weight': 800 });
      [['노드', 6, '(START·END 포함)'], ['엣지', 8, '(1 + 3 복귀 + 4 분기)']].forEach(([a, v, d], i) => { const y = 190 + i * 70;
        tx(X, y, a, { 'font-size': 16, 'font-weight': 700 }); mono(X + 60, y + 2, String(Math.round(tween(0, v, u))), { 'font-size': 26, 'font-weight': 800, fill: ACC }); tx(X + 100, y, d, { 'font-size': 14, fill: MUT }); });
      tx(X, 340, 'get_graph()로 세어 확인', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); } }

  // 5. 실행 — supervisor가 FINISH로 끝낸다
  const NEXT = [null, 'researcher', 'coder', 'writer', 'FINISH', 'FINISH'];
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { const order = ['supervisor', 'researcher', 'supervisor', 'coder', 'supervisor', 'writer', 'supervisor'];
      order.forEach((n, i) => { const x = 80 + i * 134, s = pop(u, 0.2 + i * 0.15), [col, bg] = ROLE[n];
        card(x, 60, 120, 38, { rx: 10, stroke: col, sw: 2, fill: bg, text: n === 'supervisor' ? 'sup' : n, fs: 14, fw: 800, mono: true, color: col, s });
        if (i < 6) grow(x + 61, 60, x + 72, 60, fade(u, 0.3 + i * 0.15), MUT); });
      tx(80, 108, 'supervisor 판단 4번 · 작업자 3번 (실행 확인)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) });
      terminal(60, 140, 840, 250, [["for m in final_state['messages']: print(f\"[{m.name or 'user'}] …\")", 'var(--hl)'], '[user]       GitHub API를 조사하고…', '[researcher] auth: token, endpoints: /users/{name}…', '[coder]      import requests …', '[writer]     # GitHub User Fetcher …'],
        lerp(0, 5, E(u, 0.6, 2.4)), { title: 'finish.py  (출력 예시)', lh: 34, fs: 15 }); return; }
    const n = k <= 1 ? 1 : k === 2 ? 1 + E(u, 0.9, 1.3) + E(u, 2.2, 2.6) : k === 3 ? 3 + E(u, 1.3, 1.8) : 4;
    let on = null, flow = null, hot = null, col = ACC;
    if (k === 0) on = null;
    if (k === 1) { flow = [RT.SS, seg(u, 0.2, 1.0)]; hot = 'SS'; on = u > 1.0 ? 'supervisor' : null; }
    if (k === 2) { const ph = u < 0.5 ? 0 : u < 1.0 ? 1 : u < 1.8 ? 2 : 3;
      flow = ph === 0 ? [down('researcher'), seg(u, 0.05, 0.5)] : ph === 1 ? [up('researcher'), seg(u, 0.5, 1.0)] : ph === 2 ? [down('coder'), seg(u, 1.3, 1.8)] : [up('coder'), seg(u, 1.8, 2.3)];
      on = ph === 0 ? 'researcher' : ph === 1 ? 'supervisor' : ph === 2 ? 'coder' : 'supervisor'; hot = ['dresearcher', 'uresearcher', 'dcoder', 'ucoder'][ph]; col = ROLE[on === 'supervisor' ? ['researcher', 'coder'][ph >> 1] : on][0]; }
    if (k === 3) { flow = u < 0.9 ? [down('writer'), seg(u, 0.2, 0.9)] : [up('writer'), seg(u, 1.0, 1.7)]; on = u < 0.9 ? 'writer' : 'supervisor'; hot = u < 0.9 ? 'dwriter' : 'uwriter'; col = WARN; }
    if (k === 4) { flow = [RT.SE, seg(u, 0.8, 1.6)]; hot = 'SE'; on = u > 1.6 ? 'END' : 'supervisor'; col = GOOD; }
    star({ eStart: 1, eUp: 1, eDown: 1, eEnd: 1, finish: true, on, flow, hot, flowCol: col });
    const nx = k === 2 ? (u < 1.0 ? 'researcher' : 'coder') : NEXT[k];
    statePanel(600, 40, n, nx, { count: Math.round(n) });
    if (k === 0) tx(290, 406, 'messages에 요청 하나로 시작', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) });
    if (k === 4) tx(290, 406, 'supervisor가 FINISH → END', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: '도구 12개를 한 Agent에 모두 붙였을 때 생기는 문제로 맞는 것은 무엇인가?',
      o: ['도구를 아예 호출하지 못한다', '프롬프트가 길어지고 어떤 도구를 쓸지 판단이 흔들린다', 'LLM이 자동으로 역할을 나눠 준다'], a: 1,
      why: '도구 설명이 모두 시스템 프롬프트에 붙어 길어지고, 조사·코드·문서 도구가 섞여 tool 선택이 갈팡질팡한다.' },
    { q: 'Agent를 researcher·coder·writer로 나눈 뒤에도 남는 문제는 무엇인가?',
      o: ['누가 먼저 일할지 정하는 연결이 없다', '세 Agent가 서로 다른 모델을 써야 한다', '도구를 하나도 가질 수 없다'], a: 0,
      why: '각 Agent는 짧은 프롬프트와 도구 1~2개로 명확해졌지만, 셋을 잇는 엣지와 순서를 정할 주체가 아직 없다.' },
    { q: 'Supervisor가 Route 스키마로 돌려줄 수 있는 next 값은 몇 가지인가?',
      o: ['3가지', '제한이 없다', '4가지'], a: 2,
      why: 'Literal["researcher", "coder", "writer", "FINISH"]로 묶어 이 4개 밖의 값은 ValidationError로 막힌다.' },
    { q: 'sub-agent 작업이 끝난 뒤 그래프는 어디로 가나?',
      o: ['곧바로 END', '다시 supervisor', '다음 sub-agent'], a: 1,
      why: 'member마다 add_edge(member, "supervisor")를 걸어 두었다. 다음 차례는 항상 supervisor가 정한다.' },
    { q: '이 예제를 끝까지 돌렸을 때 final_state["messages"]에는 메시지가 몇 개 있나?',
      o: ['4개', '8개', '7개'], a: 0,
      why: 'supervisor는 next만 바꾸고 메시지를 남기지 않는다. user 요청과 researcher·coder·writer 결과 3개를 더해 4개다.' },
  ];

  const summary = [
    '도구 12개를 한 Agent에 몰면 프롬프트가 길어지고 도구 선택이 흔들린다.',
    '역할별로 도구 1~2개만 가진 Agent 셋으로 나누면 각자의 일이 분명해진다.',
    'Supervisor는 도구 없이 messages를 보고 next 하나만 고르는 LLM 노드다.',
    '작업자는 끝나면 supervisor로 돌아오고, next가 FINISH면 END로 간다.',
  ];
  const review = [
    { q: '출력을 찍었더니 사용자 요청 줄이 [None]으로 나온다. 고칠 곳은?',
      o: ["getattr(m, 'name', 'user')를 m.name or 'user'로 바꾼다", 'make_node에서 name을 뺀다', 'add_messages를 operator.add로 바꾼다'], a: 0,
      why: 'HumanMessage에는 name 속성이 늘 있고 값이 None이다. getattr 기본값은 속성이 없을 때만 쓰이므로 None이 찍힌다.' },
    { q: 'writer가 끝났는데 supervisor가 계속 researcher를 다시 고른다. 먼저 의심할 것은?',
      o: ['writer의 도구가 markdown_fmt 하나뿐이다', '작업 결과가 공용 messages에 쌓이지 않는다', 'researcher의 프롬프트가 너무 짧다'], a: 1,
      why: 'supervisor는 state의 messages만 보고 판단한다. 작업 결과가 messages에 안 쌓이면 늘 처음 상태로 보인다.' },
    { q: '번역 담당 translator Agent를 하나 더 넣으려 한다. 바꿀 곳이 아닌 것은?',
      o: ['Route의 Literal 목록과 supervisor 프롬프트', 'add_node와 복귀 엣지, 분기 매핑', 'researcher의 도구 목록'], a: 2,
      why: '새 작업자는 선택지와 그래프 배선에만 들어가면 된다. 다른 Agent의 도구는 건드릴 필요가 없다.' },
  ];

  R.page({ title: 'Supervisor와 작업자 셋', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
