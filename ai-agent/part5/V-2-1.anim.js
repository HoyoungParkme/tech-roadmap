/* V-2-1 에이전트 루프 구현 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   오른쪽은 늘 messages 배열(역할별 색), 왼쪽은 그 장면의 코드가 하는 일. LLM 응답은 페이지의 예시 대화다. */
(function () {
  const R = window.RA, { C, el, tx, E, clamp, seg, pop, fade, tw, card, mono, sub, pill, grow, fly, check, cross, spans, tokens, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, INFO, INFOBG } = C;

  // ---------- 이 페이지 도우미 ----------
  const ap = (c, at, t0 = 0.2, d = 0.6) => (c.k > at ? 1 : c.k === at ? seg(c.u, t0, t0 + d) : 0);   // at 번째 beat 에 등장, 지난 beat 면 1
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const ROLE = { system: [INFO, INFOBG], user: [INK, SOFT], assistant: [ACC, ACCBG], tool: [GOOD, GOODBG], error: [BAD, BADBG] };
  // 메시지 한 칸: 역할 딱지 + 내용 줄들
  function msg(x, y, w, role, lines, o) {
    o = o || {}; lines = [].concat(lines); const h = 34 + (lines.length - 1) * 22, op = o.op ?? 1; if (op <= 0.01) return h;
    const [col, bg] = ROLE[o.as || role], g = el('g', { opacity: op });
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.hot ? bg : PANEL, stroke: col, 'stroke-width': o.hot ? 2.4 : 1.5 }, g);
    const rw = tw(role, 13.5) + 14;
    el('rect', { x: x + 6, y: y + 6, width: rw, height: 22, rx: 11, fill: col }, g);
    mono(x + 6 + rw / 2, y + 22, role, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }, g);
    lines.forEach((s, i) => tx(x + rw + 14, y + 22 + i * 22, s, { 'font-size': 14, fill: INK, class: o.mono ? 'mono' : null, style: 'white-space:pre' }, g));
    return h; }
  // messages 판: list = [{ role, lines, op, hot, mono, as }] 를 위에서부터 쌓는다. 각 칸의 y 를 돌려준다
  const MX = 585, MW = 355, MY = 52;
  function board(list, n) {
    tx(MX, 36, 'messages', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    mono(MX + MW, 36, `${n}건`, { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'end' });
    let y = MY; const ys = [];
    list.forEach((m) => { ys.push(y); if ((m.op ?? 1) <= 0.01) return; y += msg(MX, y, MW, m.role, m.lines, m) + 8; });
    return ys; }
  // 코드 상자: rows = [{ s, op, hl, f(타이핑 비율) }]
  function codeBox(x, y, w, rows, o) {
    o = o || {}; const fs = o.fs || 14, lh = fs + 9, h = o.h || rows.length * lh + 16;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    rows.forEach((r, i) => { if (typeof r === 'string') r = { s: r }; const op = (r.op ?? 1) * (o.op ?? 1); if (op <= 0.01) return; const yy = y + 8 + i * lh;
      if (r.hl) el('rect', { x: x + 4, y: yy, width: w - 8, height: lh, rx: 4, fill: r.bad ? BADBG : ACCBG, opacity: op });
      spans(x + 12, yy + lh / 2 + fs * 0.36, tokens(r.f != null ? typed(r.s, r.f) : r.s), { 'font-size': fs, opacity: op }); });
    return h; }
  // iteration 칸: n 칸 중 it 만큼 채움 (소수면 채워지는 중)
  function iters(x, y, n, it, o) {
    o = o || {}; const g = el('g', { opacity: o.op ?? 1 }), col = o.col || ACC;
    tx(x, y - 9, o.label || 'iteration', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }, g);
    for (let i = 0; i < n; i++) { const f = clamp(it - i), vis = o.show == null ? 1 : clamp(o.show * n - i);
      if (vis <= 0) continue;
      el('rect', { x: x + i * 38, y, width: 32, height: 26, rx: 5, fill: f > 0 ? col : PANEL, 'fill-opacity': f > 0 ? 0.2 + 0.8 * f : 1, stroke: f > 0 ? col : GRID, 'stroke-width': 1.6, opacity: vis }, g);
      mono(x + i * 38 + 16, y + 18, String(i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: f > 0.5 ? PANEL : MUT, 'font-weight': 700, opacity: vis }, g); }
    mono(x + n * 38 + 6, y + 18, `${Math.round(it)} / ${n}`, { 'font-size': 14, 'font-weight': 700, fill: col }, g); }
  // 원호 화살표 (각도는 도, 0 = 위쪽, 시계 방향)
  function arc(cx, cy, r, a0, a1, col, o) { o = o || {}; if (a1 - a0 < 1) return;
    const P = (a) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)], [x0, y0] = P(a0), [x1, y1] = P(a1);
    el('path', { d: `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 3, 'stroke-dasharray': o.dash, 'marker-end': o.head === false ? null : col === ACC ? 'url(#ra-ahb)' : 'url(#ra-ah)' }); }

  const USER = '서울 날씨와 도쿄 날씨 비교해줘';
  const A_CALLS = ['tool_calls 2건', 'call_1 get_weather Seoul', 'call_2 get_weather Tokyo'];
  const FINAL = ['서울은 18도로 맑고, 도쿄는', '22도로 흐립니다. 도쿄가', '4도 더 따뜻합니다.'];

  // 1. 기본 루프 골격
  function s1(t, c) { const { k, u } = c, it = c.beat.loopState.iteration;
    codeBox(24, 22, 500, [{ s: 'def run_agent(user_input, max_iter=5):', f: k === 0 ? seg(u, 0.2, 1.0) : 1, hl: k === 0 }]);
    iters(40, 104, 5, it, { label: 'max_iter = 5  ·  칸을 다 쓰면 루프가 끝난다', show: k === 0 ? E(u, 1.0, 2.2) : 1 });
    // messages 버퍼
    const m1 = ap(c, 1, 1.0, 0.5);
    if (k === 1) fly(480, 130, MX + 150, MY + 17, seg(u, 0.2, 1.2), 'user_input');
    board([{ role: 'user', lines: [USER], op: m1, hot: k === 1 || k === 4 }], k >= 1 ? 1 : 0);
    if (k >= 1) sub(MX + MW / 2, MY + 62, 'LLM 컨텍스트는 이 리스트 하나다', k === 1 ? fade(u, 1.6) : 1, { 'font-size': 14 });
    // 종료 재료 두 개
    const v = ap(c, 2, 0.3, 0.5);
    if (v > 0) { card(140, 172, 210, 40, { text: 'done = False', mono: true, fs: 15, s: k === 2 ? pop(u, 0.3) : 1, stroke: k === 2 ? ACC : INK });
      card(380, 172, 210, 40, { text: 'iteration = 0', mono: true, fs: 15, s: k === 2 ? pop(u, 0.8) : 1, stroke: k === 2 ? ACC : INK });
      sub(140, 210, '답이 나왔나?', k === 2 ? fade(u, 1.4) : 1); sub(380, 210, '몇 바퀴 돌았나?', k === 2 ? fade(u, 1.6) : 1); }
    // while 조건과 고리
    const w = ap(c, 3, 0.2, 1.0);
    if (w > 0) { const s = 'while not done and iteration < max_iter:';
      spans(270 - tw(s, 14) / 2, 246, [['while ', { fill: INFO, 'font-weight': 700 }], ['not done', { fill: GOOD, 'font-weight': 700 }], [' and ', { fill: INFO, 'font-weight': 700 }], ['iteration < max_iter', { fill: GOOD, 'font-weight': 700 }], [':', {}]].map(([a, b], i, arr) => {
        const before = arr.slice(0, i).reduce((n, p) => n + p[0].length, 0), shown = Math.round(s.length * w) - before; return [a.slice(0, Math.max(0, shown)), b]; }), { 'font-size': 14 });
      const ringF = k === 3 ? E(u, 0.9, 2.1) : 1;
      el('circle', { cx: 270, cy: 335, r: 62, fill: 'none', stroke: GRID, 'stroke-width': 2 });
      arc(270, 335, 62, 8, 8 + 335 * ringF, ACC, { head: ringF > 0.97 });
      const gop = k === 3 ? fade(u, 1.6) : 1;
      tx(118, 340, 'not done', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', class: 'mono', opacity: gop }); check(118, 362, 8, gop);
      tx(424, 340, `${it} < 5`, { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', class: 'mono', opacity: gop }); check(424, 362, 8, gop);
      if (k === 3) mono(270, 340, 'iteration += 1', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); }
    // 비어 있는 몸통
    if (k >= 4) { [['① LLM 호출', 270, 273], ['② tool 실행', 330, 369], ['③ 종료 판정', 210, 369]].forEach(([s, x, y], i) => {
        card(x, y, tw(s, 14) + 22, 28, { rx: 14, text: s, fs: 14, fw: 700, stroke: MUT, dash: '5 4', color: MUT, s: pop(u, 0.2 + i * 0.25) }); });
      mono(270, 340, 'pass', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
      const rf = E(u, 1.4, 2.4), pts = [[332, 335], [500, 335], [500, 69], [MX - 6, 69]], L = [168, 266, MX - 506], tot = L[0] + L[1] + L[2];
      let d = rf * tot, path = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 0; i < 3 && d > 0; i++) { const f = Math.min(1, d / L[i]); d -= L[i]; path += ` L${pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f},${pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f}`; }
      if (rf > 0) el('path', { d: path, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'marker-end': rf > 0.98 ? 'url(#ra-ahb)' : null });
      tx(510, 214, 'return messages', { 'font-size': 14, 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 2.0) }); } }

  // 2. LLM 호출 + tool_calls 파싱
  function s2(t, c) { const { k, u } = c, it = c.beat.loopState.iteration, pit = c.prev ? c.prev.loopState.iteration : it;
    const r1 = ap(c, 1, 0.2, 1.2), r2 = ap(c, 2, 0.2, 1.2);
    codeBox(24, 22, 430, [
      { s: 'TOOLS = [{"type": "function", "function": {', op: r1, f: r1 },
      { s: '  "name": "get_weather",', op: r1, f: r1, hl: k === 1 },
      { s: '  "description": "도시 날씨 조회",', op: r1, f: r1, hl: k === 1 },
      { s: '  "parameters": {"type": "object",', op: r2, f: r2 },
      { s: '    "properties": {"city": {"type": "string"}},', op: r2, f: r2, hl: k === 2 },
      { s: '    "required": ["city"]}}}]', op: r2, f: r2, hl: k === 2 }], { op: k >= 1 ? 1 : 0.35 });
    if (k === 1) sub(239, 200, 'LLM은 name 과 description 을 읽고 부를지 정한다', fade(u, 1.5), { 'font-size': 14, fill: INK });
    if (k === 2) { pill(150, 200, 'get_weather({})', BAD, pop(u, 1.4), { mono: true, fs: 14 }); cross(240, 200, 8, pop(u, 1.7));
      tx(262, 205, 'city 가 빠진 호출은 막힌다', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    // LLM
    const L = [330, 330];
    card(L[0], L[1], 150, 64, { text: 'LLM\ngpt-4o-mini', fs: 15, stroke: k === 3 || k === 4 ? ACC : INK, s: k === 0 ? pop(u, 0.3) : 1 });
    mono(L[0], L[1] + 52, 'client = OpenAI()', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.9) : 1 });
    iters(40, 236, 5, k === 3 ? pit + (it - pit) * E(u, 1.3, 2.0) : it, { op: k >= 3 ? 1 : 0.45 });
    if (k === 3) { fly(MX + 120, MY + 17, L[0] + 20, L[1] - 20, seg(u, 0.2, 1.2), 'messages 1건');
      fly(240, 170, L[0] - 30, L[1] - 20, seg(u, 0.5, 1.5), 'TOOLS', { fill: INFO });
      tx(L[0], L[1] - 46, '1회차 시작', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    // 응답을 messages 에 쌓는다
    const a = ap(c, 4, 1.1, 0.5);
    if (k === 4) fly(L[0] + 60, L[1] - 10, MX + 120, MY + 60, seg(u, 0.2, 1.2), 'assistant');
    const ys = board([{ role: 'user', lines: [USER] }, { role: 'assistant', lines: A_CALLS, op: a, hot: k >= 4, mono: true }], k >= 4 ? (k === 4 && u < 1.1 ? 1 : 2) : 1);
    if (k === 4) sub(MX + MW / 2, 205, '이걸 빼면 다음 회차가 앞의 결정을 모른다', fade(u, 1.8), { 'font-size': 14, fill: INK });
    // 분기
    if (k >= 5) { const g1 = E(u, 0.2, 1.0), g2 = E(u, 0.6, 1.4);
      grow(L[0] + 76, L[1] - 6, 600, 262, g1, ACC); grow(L[0] + 76, L[1] + 10, 600, 352, g2, MUT, { dash: '5 5' });
      pill(752, 262, 'tool_calls 있음 → tool 실행', ACC, pop(u, 0.9), { fs: 14 });
      pill(752, 352, 'content 만 → 최종 답변', MUT, pop(u, 1.3), { fs: 14, color: MUT });
      ['call_1', 'call_2'].forEach((s, i) => pill(680 + i * 150, 300, s + ' pending', WARN, pop(u, 1.8 + i * 0.25), { mono: true, fs: 13.5 })); } }

  // 3. tool 실행 + 결과 messages 추가
  function s3(t, c) { const { k, u } = c;
    // 레지스트리
    zone(24, 18, 430, 112, 'TOOL_REGISTRY  (부를 수 있는 것은 이 표뿐)', { stroke: k === 0 ? ACC : 'none', sw: 2 });
    [['"get_weather"', 'lambda city: FAKE[city]'], ['"calculator"', 'lambda expr: str(eval(expr))']].forEach(([n, f], i) => {
      const y = 56 + i * 34, op = k === 0 ? fade(u, 0.3 + i * 0.4) : 1, hot = (k === 2 || k === 3) && i === 0;
      if (hot) el('rect', { x: 32, y: y - 4, width: 414, height: 30, rx: 6, fill: ACCBG });
      mono(40, y + 16, n, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op }); mono(176, y + 16, '→ ' + f, { 'font-size': 14, opacity: op }); });
    // 요청받은 호출 두 건
    const cl = ap(c, 1, 0.2, 0.5);
    const calls = [['call_1', 'Seoul'], ['call_2', 'Tokyo']];
    calls.forEach(([id, city], i) => { const y = 150 + i * 44, done = (k >= 3 && i === 0) || k >= 4;
      card(239, y + 17, 430, 36, { rx: 8, stroke: done ? GOOD : WARN, sw: 1.8, op: cl });
      spans(40, y + 22, [[id + '  ', { 'font-weight': 700, fill: i ? WARN : ACC }], ['get_weather  ', {}], [`'{"city": "${city}"}'`, { fill: ACC }]], { 'font-size': 14, opacity: cl });
      if (done) check(432, y + 17, 8, k === 3 || (k === 4 && i === 1) ? pop(u, k === 3 ? 1.6 : 0.4) : 1); });
    if (k >= 1) { const ci = k === 1 ? (u < 1.4 ? 0 : 1) : 0; el('path', { d: `M14,${150 + ci * 44 + 8} L24,${150 + ci * 44 + 17} L14,${150 + ci * 44 + 26} Z`, fill: ACC, opacity: k === 1 ? fade(u, 0.6) : 1 });
      if (k === 1) mono(239, 260, 'for call in tool_calls:  2번 돈다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) }); }
    // 인자 파싱
    if (k === 2) { pill(110, 262, `'{"city": "Seoul"}'`, INK, pop(u, 0.3), { mono: true, fs: 14 }); sub(110, 292, '문자열 (str)', fade(u, 0.5));
      grow(196, 262, 262, 262, E(u, 0.8, 1.3), ACC); mono(229, 240, 'json.loads', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) });
      pill(352, 262, '{city: "Seoul"}', ACC, pop(u, 1.3), { mono: true, fs: 14 }); sub(352, 292, '딕셔너리 (dict)', fade(u, 1.5));
      tx(239, 330, 'name 으로 레지스트리에서 함수를 찾는다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) }); }
    // 실행
    if (k >= 3) { const op = k === 3 ? 1 : 0.55;
      mono(130, 270, 'func(**args)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
      grow(196, 265, 262, 265, k === 3 ? E(u, 0.4, 0.9) : 1, GOOD);
      pill(355, 265, 'Seoul: 18°C, 맑음', GOOD, k === 3 ? pop(u, 0.9) : 1, { fs: 14, op });
      tx(239, 318, '없는 이름이면  "[error] unknown tool: …"', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 2.0) : op }); }
    // 결과를 tool 메시지로
    const t1 = ap(c, 4, 0.5, 0.5), t2 = ap(c, 4, 1.1, 0.5);
    const n = k < 4 ? 2 : u < 0.5 ? 2 : u < 1.1 ? 3 : 4;
    const ys = board([{ role: 'user', lines: [USER] }, { role: 'assistant', lines: A_CALLS, mono: true },
      { role: 'tool', lines: ['call_1 · Seoul: 18°C, 맑음'], op: t1, hot: k === 4 }, { role: 'tool', lines: ['call_2 · Tokyo: 22°C, 흐림'], op: t2, hot: k === 4 }], n);
    if (k === 4) { // tool_call_id 짝 맞추기
      [[ys[1] + 44, ys[2] + 17, ACC, 1.4], [ys[1] + 66, ys[3] + 17, WARN, 1.8]].forEach(([y0, y1, col, a0]) => { const f = E(u, a0, a0 + 0.6); if (f <= 0) return;
        el('path', { d: `M${MX + MW},${y0} C${MX + MW + 16},${y0} ${MX + MW + 16},${y1} ${MX + MW},${y1}`, fill: 'none', stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': `${f * 200} 200` }); });
      tx(MX + MW / 2, ys[3] + 66, 'tool_call_id 로 어느 호출의 답인지 가린다', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // 4. 종료 조건
  function s4(t, c) { const { k, u } = c, it = c.beat.loopState.iteration;
    codeBox(24, 18, 430, [{ s: 'FINAL_TOKEN = "Final Answer:"', f: k === 0 ? seg(u, 0.2, 1.0) : 1, hl: k === 0 }]);
    if (k === 0) sub(239, 80, 'ReAct 방식에서 쓰는 종료 표시', fade(u, 1.2), { 'font-size': 14 });
    // should_stop 의 세 관문 (위에서부터 차례로 본다)
    const G = [['① iteration >= max_iter', 1], ['② tool_calls 없음 + content 있음', 2], ['③ FINAL_TOKEN in content', 3]];
    G.forEach(([s, at], i) => { const y = 104 + i * 58, op = ap(c, at, 0.2, 0.5), hot = k === at || (k === 5 && i === 1); if (op <= 0) return;
      card(239, y, 430, 46, { rx: 10, stroke: hot ? (i === 1 && k !== 3 ? GOOD : ACC) : GRID, sw: hot ? 2.4 : 1.5, op });
      tx(40, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: op }); });
    if (k >= 1) { const s = `${k >= 2 ? 2 : 1} ≥ 5 ? 아니오`; mono(440, 109, s, { 'font-size': 14, 'text-anchor': 'end', fill: MUT, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.9) : 1 });
      if (k === 1) sub(239, 146, '상한을 맨 먼저 본다. 비용 폭주를 막는 차단기다', fade(u, 1.5), { 'font-size': 14, fill: INK }); }
    if (k >= 2 && k !== 3) { mono(440, 167, '예 → final_answer', { 'font-size': 14, 'text-anchor': 'end', fill: GOOD, 'font-weight': 800, opacity: k === 2 ? fade(u, 1.8) : 1 }); }
    if (k === 3) { mono(440, 225, '있으면 final_token', { 'font-size': 14, 'text-anchor': 'end', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.7) });
      pill(239, 286, '셋 다 아니면 → continue', MUT, pop(u, 1.3), { fs: 14.5, color: INK }); }
    // 통합 루프 한 바퀴
    if (k === 4) { const P = [['iteration += 1', 92], ['call_llm', 220], ['should_stop', 336], ['execute_tool_calls', 0]];
      P.slice(0, 3).forEach(([s, x], i) => { pill(x, 300, s, i === 1 ? ACC : INK, pop(u, 0.2 + i * 0.35), { mono: true, fs: 14 }); if (i < 2) grow(x + tw(s, 14) / 2 + 16, 300, P[i + 1][1] - tw(P[i + 1][0], 14) / 2 - 16, 300, E(u, 0.5 + i * 0.35, 0.8 + i * 0.35), MUT); });
      grow(336, 318, 336, 350, E(u, 1.4, 1.7), MUT); pill(336, 368, 'execute_tool_calls', INK, pop(u, 1.6), { mono: true, fs: 14 });
      el('path', { d: 'M250,368 L92,368 L92,320', fill: 'none', stroke: MUT, 'stroke-width': 2.2, 'stroke-dasharray': '5 5', 'marker-end': 'url(#ra-ah)', opacity: fade(u, 2.0) });
      tx(160, 392, '다시 돈다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }
    if (k === 5) { card(239, 318, 430, 70, { rx: 10, stroke: GOOD, sw: 2.5, s: pop(u, 0.3) });
      mono(40, 310, 'return {"answer": content,', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(40, 334, '        "reason": "final_answer"}', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      tx(239, 392, `iteration ${it} / 5 에서 정상 종료 · status done`, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); }
    // messages
    const fin = ap(c, 2, 0.8, 0.6);
    if (k === 2) fly(300, 167, MX + 150, 270, seg(u, 0.2, 1.0), '2회차 응답');
    board([{ role: 'user', lines: [USER] }, { role: 'assistant', lines: A_CALLS, mono: true }, { role: 'tool', lines: ['call_1 · Seoul: 18°C, 맑음'] }, { role: 'tool', lines: ['call_2 · Tokyo: 22°C, 흐림'] },
      { role: 'assistant', lines: FINAL, op: fin, hot: k === 2 || k === 5 }], k >= 2 && fin > 0.5 ? 5 : 4); }

  // 5. 에러 처리
  function s5(t, c) { const { k, u } = c, it = c.beat.loopState.iteration;
    ['time', 'APIError', 'RateLimitError'].forEach((s, i) => pill([50, 130, 256][i], 34, s, i ? BAD : INK, k === 0 ? pop(u, 0.2 + i * 0.3) : 1, { mono: true, fs: 13.5 }));
    mono(454, 40, `iteration ${it} / 5`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: k >= 1 ? 1 : 0.4 });
    // safe_execute: try / except
    const tr = ap(c, 1, 0.2, 0.6);
    if (tr > 0) { el('rect', { x: 24, y: 62, width: 430, height: 84, rx: 10, fill: PANEL, stroke: k === 2 ? BAD : INK, 'stroke-width': 2, opacity: tr });
      mono(38, 86, 'try:', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: tr });
      mono(58, 110, 'args = json.loads(arguments)', { 'font-size': 14, opacity: tr }); mono(58, 132, 'TOOL_REGISTRY[name](**args)', { 'font-size': 14, opacity: tr }); }
    if (k >= 2) { const f = k === 2 ? E(u, 0.2, 0.6) : 1;
      el('path', { d: 'M400,92 L384,114 L398,114 L380,140', fill: 'none', stroke: BAD, 'stroke-width': 3.5, 'stroke-linejoin': 'round', opacity: f });
      mono(440, 86, 'HTTPTimeout', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: f });
      el('rect', { x: 24, y: 156, width: 430, height: 70, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: k === 2 ? fade(u, 0.7) : 1 });
      mono(38, 180, 'except Exception as e:', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: k === 2 ? fade(u, 0.8) : 1 });
      mono(58, 206, typed('result = "[error] HTTPTimeout: 30s 초과"', k === 2 ? seg(u, 1.1, 2.2) : 1), { 'font-size': 14, fill: BAD }); }
    if (k === 3) tx(239, 252, '실패도 같은 모양의 tool 메시지가 된다. 루프는 계속 돈다', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) });
    // 지수 백오프: 429 → 1s, 2s, 4s
    if (k === 4 || k === 5) { const x0 = 40, ps = 44, top = 268; let x = x0;
      tx(24, 256, '429 RateLimit → time.sleep(2 ** attempt)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: k === 4 ? fade(u, 0.2) : 1 });
      [1, 2, 4].forEach((s, i) => { const a0 = 0.4 + i * 0.6, f = k === 4 ? E(u, a0, a0 + 0.5) : 1;
        cross(x + 8, top + 16, 7, k === 4 ? pop(u, a0 - 0.15) : 1); x += 22;
        el('rect', { x, y: top + 6, width: Math.max(1, s * ps * f), height: 20, rx: 4, fill: WARN, opacity: 0.85 });
        if (f > 0.6) mono(x + s * ps / 2, top + 46, s + 's', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN });
        x += s * ps + 8; }); }
    if (k === 5) { el('rect', { x: 24, y: 330, width: 430, height: 64, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.3) });
      mono(38, 354, 'if attempt == max_retries - 1: raise', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
      mono(38, 380, 'RuntimeError("LLM 재시도 모두 실패")', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.3) });
      grow(430, 380, 430, 340, E(u, 1.6, 2.2), BAD); }
    if (k === 6) { card(239, 300, 430, 56, { rx: 10, stroke: GOOD, sw: 2.5, s: pop(u, 0.9) });
      tx(239, 296, '두 번째 get_weather(Seoul) 성공', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) });
      mono(239, 318, 'status: recovered', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) }); }
    if (k === 7) { mono(239, 280, 'for i in range(max_iter): … 를 다 쓰면', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      card(239, 326, 430, 50, { rx: 25, fill: INK, stroke: 'none', text: '"[fallback] 최대 반복 초과 — 답변 미완"', fs: 14.5, mono: true, color: PANEL, s: pop(u, 0.8) });
      tx(239, 384, '함수가 말없이 사라지는 길은 없다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); }
    // messages
    const e1 = ap(c, 3, 0.2, 0.6), r1 = ap(c, 4, 1.9, 0.5), ok = ap(c, 6, 0.3, 0.6);
    board([{ role: 'user', lines: ['날씨 비교해줘'] }, { role: 'assistant', lines: ['tool_calls: get_weather(Seoul)'], mono: true },
      { role: 'tool', lines: ['[error] HTTPTimeout:', '30s 초과'], as: 'error', op: e1, hot: k === 3 || k === 7, mono: true },
      { role: 'assistant', lines: ['재시도: get_weather(Seoul)'], mono: true, op: r1, hot: k === 4 },
      { role: 'tool', lines: ['Seoul: 18°C, 맑음'], op: ok, hot: k === 6 }], 2 + (e1 > 0.5) + (r1 > 0.5) + (ok > 0.5)); }

  const quiz = [
    { q: 'while 조건에 iteration < max_iter를 꼭 같이 두는 이유는 무엇인가?',
      o: ['LLM 호출을 빠르게 하려고', 'LLM이 끝내 답을 못 내도 루프가 반드시 끝나게 하려고', 'messages 리스트를 비우려고'], a: 1,
      why: 'done만 보면 LLM이 계속 도구를 부를 때 멈출 길이 없다. max_iter 5칸을 다 쓰면 무조건 빠져나온다.' },
    { q: 'call_llm이 assistant 메시지를 messages에 다시 붙이는 까닭은 무엇인가?',
      o: ['다음 회차의 LLM이 자기가 무엇을 요청했는지 알게 하려고', '응답 속도를 높이려고', 'tool 스키마를 저장하려고'], a: 0,
      why: 'LLM은 상태가 없다. 이 메시지를 빼면 다음 회차에 tool_calls 2건을 요청했다는 사실이 사라져 같은 자리를 돈다.' },
    { q: 'tool 결과 메시지에 tool_call_id를 붙이는 이유는 무엇인가?',
      o: ['도구 실행을 더 빠르게 하려고', 'tool 메시지를 화면에 예쁘게 보이려고', '여러 호출 중 어느 호출의 결과인지 LLM이 가리게 하려고'], a: 2,
      why: '서울과 도쿄 두 호출이 한 번에 왔다. call_1과 call_2로 짝을 맞춰야 18°C와 22°C가 어느 도시인지 알 수 있다.' },
    { q: '이 예시에서 루프가 2회차에 멈춘 reason은 무엇인가?',
      o: ['final_answer, tool_calls 없이 content만 왔다', 'max_iter_reached, 상한에 걸렸다', 'final_token, Final Answer: 가 들어 있었다'], a: 0,
      why: '2회차 응답은 날씨 비교 문장뿐이고 tool_calls가 없었다. 두 번째 관문에서 final_answer로 끝난다.' },
    { q: 'tool 실행 중 타임아웃 예외가 나면 safe_execute는 어떻게 하나?',
      o: ['예외를 그대로 올려 루프를 멈춘다', '에러 문자열을 tool 메시지로 넣고 루프를 이어 간다', '같은 tool을 바로 무한히 다시 부른다'], a: 1,
      why: '"[error] HTTPTimeout: 30s 초과" 같은 문자열이 tool 메시지가 된다. LLM이 그것을 읽고 재시도할지 스스로 정한다.' },
  ];

  const summary = [
    '에이전트 루프는 while 하나다. 종료 조건에 max_iter를 함께 걸어 언제든 끝나게 만든다.',
    'LLM은 상태가 없어서 user, assistant, tool 메시지를 모두 messages에 쌓아 매번 다시 보낸다.',
    'tool 결과에는 tool_call_id를 붙인다. 서울과 도쿄 두 호출의 답을 LLM이 이것으로 가린다.',
    'tool 예외는 에러 문자열로 돌려주고, API 429는 1초, 2초, 4초 간격으로 다시 부른다.',
  ];
  const review = [
    { q: '루프가 매번 max_iter 5회를 다 쓰고 끝난다. 로그를 보니 회차마다 같은 get_weather 호출이 반복된다. 먼저 의심할 것은?',
      o: ['assistant 응답이나 tool 결과를 messages에 붙이지 않았다', 'max_iter를 5로 둔 것이 너무 작다', 'TOOLS의 description이 한국어로 적혀 있다'], a: 0,
      why: '앞 회차의 요청과 결과가 messages에 없으면 LLM은 매번 처음 질문만 보고 같은 호출을 다시 고른다.' },
    { q: '날씨 API가 30초 넘게 응답하지 않자 에이전트 전체가 예외로 죽었다. 고칠 곳은?',
      o: ['max_iter를 10으로 늘린다', 'tool 실행을 try로 감싸 에러 문자열을 tool 메시지로 돌려준다', 'FINAL_TOKEN을 다른 글자로 바꾼다'], a: 1,
      why: 'tool 예외를 잡아 messages에 넣으면 루프는 살아 있고, LLM이 그 에러를 보고 재시도나 다른 답을 고른다.' },
    { q: 'LLM이 한 응답에 tool_calls 두 건을 보냈다. 결과를 돌려주는 올바른 방법은?',
      o: ['두 결과를 한 문자열로 합쳐 user 메시지로 보낸다', '먼저 끝난 결과 하나만 보낸다', '호출마다 role이 tool인 메시지를 하나씩, 각자의 tool_call_id를 붙여 보낸다'], a: 2,
      why: '호출 수만큼 tool 메시지가 있어야 하고 id가 짝을 이뤄야 한다. 그래야 다음 회차에 LLM이 두 결과를 섞지 않는다.' },
  ];

  R.page({ title: '에이전트 루프와 messages', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
