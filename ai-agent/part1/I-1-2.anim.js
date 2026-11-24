/* I-1-2 Agent의 3요소 — 장면 5개 (../../anim/engine.js 규칙). history·TOOLS JSON·레지스트리·Observe→Think→Act 고리를 그린다 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, person, cross, check, clock, terminal, G, spans, hbar, server, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // ---------- AI Agent 공용 그림 도구 (메시지 목록 · 말풍선 · JSON · 루프 고리 · 토큰 막대) ----------
  const ROLE = { system: [MUT, SOFT], user: [INFO, INFOBG], assistant: [ACC, ACCBG], tool: [GOOD, GOODBG] };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 메시지 한 줄: [role] 내용. u 0→1 동안 칸이 왼쪽부터 채워진 뒤 글자가 나온다. o.ghost 면 점선 빈 자리
  function msg(x, y, w, role, text, o) { o = o || {}; const u = o.u ?? 1; if (u <= 0) return; const [c, bg] = ROLE[role] || ROLE.system, h = o.h || 30, tg = o.tag || 96, op = o.op ?? 1;
    el('rect', { x, y: y - h / 2, width: Math.max(6, w * E(u, 0, 0.55)), height: h, rx: 7, fill: o.ghost ? 'none' : bg, stroke: o.hot || o.ghost ? c : 'none', 'stroke-width': o.hot ? 2.4 : 1.6, 'stroke-dasharray': o.ghost ? '5 4' : null, opacity: op });
    const a = seg(u, 0.25, 0.6) * op;
    el('rect', { x: x + 5, y: y - h / 2 + 5, width: tg - 10, height: h - 10, rx: (h - 10) / 2, fill: o.ghost ? 'none' : c, stroke: o.ghost ? c : 'none', 'stroke-dasharray': o.ghost ? '4 3' : null, opacity: a });
    mono(x + tg / 2, y + 5, o.label || role, { 'font-size': 13.5, 'font-weight': 700, fill: o.ghost ? c : PANEL, 'text-anchor': 'middle', opacity: a });
    if (text) mono(x + tg + 6, y + 5, text, { 'font-size': o.fs || 14, fill: o.col || (o.ghost ? c : INK), opacity: seg(u, 0.45, 0.85) * op, 'font-weight': o.fw || 500 }); }
  // 말풍선: side 'r' 이면 x 가 오른쪽 끝(사용자), 'l' 이면 왼쪽 끝(봇). \n 으로 여러 줄
  function bubble(x, y, text, side, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const rows = String(text).split('\n'), fs = o.fs || 14.5;
    const w = Math.max(...rows.map((r) => tw(r, fs))) + 26, h = rows.length * (fs + 6) + 14, R0 = side === 'r';
    const g = G(x, y, s, o.op), fill = o.fill || (R0 ? INFO : PANEL), col = o.color || (R0 ? PANEL : INK);
    el('rect', { x: R0 ? -w : 0, y: -h / 2, width: w, height: h, rx: 12, fill, stroke: o.stroke || (R0 ? 'none' : GRID), 'stroke-width': 1.8, 'stroke-dasharray': o.dash }, g);
    rows.forEach((r, i) => tx(R0 ? -w + 13 : 13, -h / 2 + 5 + fs + i * (fs + 6), r, { 'font-size': fs, fill: col, 'font-weight': 600 }, g));
    return { w, h }; }
  // JSON·코드 조각 색칠: 키는 파랑, 문자열은 초록, 숫자는 주황, # 주석은 회색
  function jtok(line) { const out = []; let last = 0, m; const ci = line.search(/(^|\s)#\s/);
    const body = ci >= 0 ? line.slice(0, ci) : line, re = /("(?:[^"\\]|\\.)*")(\s*:)?|(\b\d+(?:\.\d+)?\b)|\b(true|false|null|None|True|False)\b/g;
    while ((m = re.exec(body))) { if (m.index > last) out.push([body.slice(last, m.index), {}]);
      if (m[1]) { out.push([m[1], { fill: m[2] ? INFO : ACC, 'font-weight': m[2] ? 700 : 500 }]); if (m[2]) out.push([m[2], {}]); }
      else if (m[3]) out.push([m[3], { fill: WARN, 'font-weight': 700 }]); else out.push([m[0], { fill: MUT, 'font-weight': 700 }]);
      last = re.lastIndex; }
    if (last < body.length) out.push([body.slice(last), {}]); if (ci >= 0) out.push([line.slice(ci), { fill: MUT }]); return out; }
  // 코드 상자: shown 줄까지 보인다(소수면 마지막 줄을 타이핑). o.hi(i) 강조 줄
  function code(x, y, lines, o) { o = o || {}; const fs = o.fs || 14, lh = fs + 7, n = lines.length, shown = o.shown ?? n, op = o.op ?? 1;
    const w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + 28, h = n * lh + 16;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: op, 'stroke-dasharray': o.dash });
    if (o.title) tx(x + 2, y - 8, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    const k = Math.ceil(shown);
    lines.forEach((s, i) => { if (i >= k) return; const part = i === k - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: y + 8 + i * lh, width: w - 8, height: lh, rx: 4, fill: HL, opacity: 0.6 * op });
      spans(x + 14, y + 8 + i * lh + fs * 0.98, jtok(part), { 'font-size': fs, opacity: op }); });
    return { w, h, lh }; }
  // 루프 고리: names 를 원 위에 고르게 놓는다. o.arc: 0→n 만큼 진행 호가 자람, o.on: 켜진 마디, o.dot: 고리 위 점(0→1 한 바퀴)
  function ring(cx, cy, r, names, o) { o = o || {}; const n = names.length, op = o.op ?? 1, A = (i) => -Math.PI / 2 + i * 2 * Math.PI / n;
    const P = (i) => [cx + r * Math.cos(A(i)), cy + r * Math.sin(A(i))];
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 6', opacity: op });
    const arc = clamp(o.arc ?? 0, 0, n);
    if (arc >= n - 0.001) el('circle', { cx, cy, r, fill: 'none', stroke: o.col || ACC, 'stroke-width': 3.5, opacity: op });
    else if (arc > 0.001) { const a1 = A(0) + arc / n * 2 * Math.PI, big = arc / n > 0.5 ? 1 : 0;
      el('path', { d: `M${cx},${cy - r} A${r},${r} 0 ${big} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}`, fill: 'none', stroke: o.col || ACC, 'stroke-width': 3.5, opacity: op }); }
    if (o.dot > 0 && o.dot < 1) { const a = -Math.PI / 2 + o.dot * 2 * Math.PI; el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 8, fill: o.col || ACC, opacity: op }); }
    names.forEach((s, i) => { const [x, y] = P(i), on = o.on === i, sc = o.s ? o.s(i) : 1; if (sc <= 0) return;
      card(x, y, o.nw || 118, o.nh || 40, { rx: (o.nh || 40) / 2, text: s, fs: o.fs || 15, fw: 800, fill: on ? (o.col || ACC) : PANEL, stroke: on ? (o.col || ACC) : INK, color: on ? PANEL : INK, s: sc, op }); });
    return P; }
  // 막대 칸(토큰·횟수): x 부터 w 폭, 전체 max 중 v 만큼 채움. o.ticks 눈금 개수
  function slots(x, y, n, filled, o) { o = o || {}; const w = o.w || 22, h = o.h || 22, g = o.gap ?? 4;
    for (let i = 0; i < n; i++) { const f = clamp(filled - i); el('rect', { x: x + i * (w + g), y, width: w, height: h, rx: 4, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.5 });
      if (f > 0) el('rect', { x: x + i * (w + g), y, width: w * f, height: h, rx: 4, fill: o.col ? o.col(i) : ACC, opacity: 0.85 }); } }
  // 비어 있는 자리(점선) + ✗
  function slotX(cx, cy, w, h, s, sc) { card(cx, cy, w, h, { rx: 8, text: s, fs: 14, fw: 700, fill: 'none', stroke: OFF, color: OFF, dash: '5 4', s: sc }); if (sc > 0.5) cross(cx + w / 2 - 4, cy - h / 2 + 4, 7, sc); }
  // 사람이 읽는 순서대로 위에서 아래로 쌓이는 메시지 목록. rows: [[role, text, o?]], at: 지금까지 보일 줄 수(소수 = 마지막 줄이 채워지는 중)
  function msgs(x, y, w, rows, at, o) { o = o || {}; const gap = o.gap || 36;
    if (o.title) tx(x, y - 24, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono' });
    rows.forEach(([role, text, ro], i) => { const u = clamp(at - i); if (u <= 0) return; msg(x, y + i * gap, w, role, text, Object.assign({ u, fs: o.fs, tag: o.tag, h: o.h }, ro || {})); }); }

  const ASK = '강릉 1박2일 여행 계획 짜줘';
  // 관찰 출처 아이콘: user(사람) · tool(톱니 대신 렌치 상자) · env(센서 상자)
  function sources(x, sc, on) {
    person(x, 92, 'user', { s: sc(0), stroke: on === 0 ? INFO : INK });
    card(x, 202, 92, 46, { rx: 8, text: 'tool', fs: 15, fw: 800, mono: true, stroke: on === 1 ? GOOD : INK, color: on === 1 ? GOOD : INK, s: sc(1) });
    card(x, 300, 92, 46, { rx: 8, text: 'env', fs: 15, fw: 800, mono: true, stroke: on === 2 ? MUT : INK, color: MUT, s: sc(2) });
    if (sc(1) > 0.5) sub(x, 240, '이전 도구 결과', 1); if (sc(2) > 0.5) sub(x, 338, '환경 상태', 1); }

  // ---------- 1. Observe: 들어오는 것은 전부 history 한 줄 ----------
  function s1(t, c) { const { k, u } = c;
    const box = k === 2 ? E(u, 0.2, 1.2) : 1;
    zone(330, 40, 610, 190, null, { fill: SOFT, stroke: k === 2 ? ACC : GRID, sw: 2, op: k === 0 ? fade(u, 0.2) : 1 });
    mono(348, 66, k >= 2 ? 'Context.history: list[Observation]' : 'Context', { 'font-size': 15, 'font-weight': 800, fill: k === 2 ? ACC : INK, opacity: k === 0 ? fade(u, 0.3) : 1 });
    const n = k < 4 ? 0 : k === 4 ? E(u, 1.0, 1.8) : 1;
    mono(920, 66, `len = ${k >= 4 && n > 0.5 ? 1 : 0}`, { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: k === 0 ? fade(u, 0.5) : 1 });
    if (k === 2) { el('path', { d: `M346,${92} v${110 * box}`, stroke: ACC, 'stroke-width': 3, fill: 'none' }); }
    if (k <= 3) mono(348, 112, 'history = [ ]', { 'font-size': 15, fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
    if (k === 0) { sub(635, 170, '아직 들어온 정보가 없다', fade(u, 1.2), { 'font-size': 15 }); return; }
    sources(90, (i) => (k === 1 ? pop(u, 0.9 + i * 0.3) : 1), k === 4 ? 0 : k === 5 ? 1 : -1);
    // 관찰 한 건의 모양
    if (k === 1) { code(330, 260, ['@dataclass', 'class Observation:', '    source: str    # "user" | "tool" | "env"', '    content: Any   # 텍스트, JSON, 센서 값'], { fs: 14.5, shown: E(u, 0.2, 1.6) * 4, title: '관찰 한 건' }); return; }
    if (k === 3) { code(330, 260, ['def add(self, source, content):', '    self.history.append(Observation(source, content))'], { fs: 14.5, shown: E(u, 0.2, 1.2) * 2, title: 'add() 한 번 = history 한 줄' });
      msg(348, 150, 570, 'user', '(source, content)', { u: E(u, 1.3, 2.3), ghost: true, label: 'source' }); return; }
    if (k === 2) { sub(635, 190, '이 리스트 하나가 Agent의 작업 기억 전부', fade(u, 1.3), { 'font-size': 15, fill: INK }); return; }
    // 사용자 입력 → history[0]
    if (k === 4) fly(130, 92, 520, 150, seg(u, 0.2, 1.1), ASK, { fill: INFO });
    msg(348, 150, 570, 'user', ASK, { u: n, label: 'user', hot: k === 4 });
    if (k >= 4) mono(926, 155, '[0]', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: n });
    if (k === 5) { msg(348, 192, 570, 'tool', '{"tool": "search_weather", "result": …}', { u: E(u, 0.3, 1.4), ghost: true });
      dot([[136, 202], [348, 192]], seg(u, 0.2, 1.0), GOOD, 6);
      note(348, 270, '도구 결과도 같은 history에 쌓인다 (다음 cycle부터)', fade(u, 1.6), { fill: GOOD }); return; }
    if (k === 6) { grow(635, 232, 635, 296, E(u, 0.2, 0.9), ACC);
      card(635, 332, 300, 60, { rx: 10, text: 'LLM\nmessages = history 전체', fs: 15, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.8) });
      note(330, 410, 'LLM은 "지금 상태가 뭐야?" 라고 물어볼 수 없다', fade(u, 1.6), { fill: MUT }); } }

  // ---------- 2. Think: LLM 이 다음 행동을 JSON 으로 낸다 ----------
  const TOOLS = ['{"name": "search_weather",', ' "description": "특정 지역/날짜의 날씨를 조회한다",', ' "parameters": {"properties": {', '   "location": {"type": "string"},', '   "date": {"type": "string"}},', '  "required": ["location", "date"]}}'];
  function s2(t, c) { const { k, u } = c;
    msgs(20, 72, 300, [['user', ASK]], 1, { title: 'Context.history', fs: 13.5 });
    if (k === 0) fly(70, 130, 170, 160, seg(u, 0.1, 0.8), 'Observe 결과', { fill: INK, stay: true });
    card(330, 232, 170, 60, { rx: 10, text: 'LLM\ngpt-4o-mini', fs: 15, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: k === 0 ? pop(u, 0.9) : 1 });
    if (k === 0) { note(240, 330, '판단은 전부 이 LLM 하나에서 나온다', fade(u, 1.6)); return; }
    // TOOLS 메뉴
    const sh = k === 1 ? 1 + E(u, 0.2, 1.4) : k === 2 ? 2 + E(u, 0.2, 1.8) * 4 : 6;
    code(500, 22, TOOLS, { fs: 14, shown: sh, title: 'TOOLS  (LLM이 보는 이름과 설명)', op: k >= 3 ? 0.45 : 1, hi: (i) => (k === 1 && i < 2) || (k === 2 && i === 5) });
    if (k <= 2) { if (k === 1) note(500, 196, '함수 본문은 LLM에게 보이지 않는다', fade(u, 1.8), { fill: MUT }); return; }
    // history → messages → LLM
    if (k === 3) { mono(20, 150, 'build_messages(ctx)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      msg(20, 186, 300, 'user', ASK, { u: E(u, 0.5, 1.3), fs: 13.5 }); grow(170, 204, 290, 220, E(u, 1.4, 2.0), ACC); }
    if (k >= 4) { // 갈림길: tool_call / final, tool_choice="auto"
      const pick = k === 4 ? (Math.floor(t * 1.6) % 2) : 0;
      grow(415, 232, 590, 228, k === 4 ? E(u, 0.2, 0.8) : 1, pick === 0 ? ACC : OFF, { plain: true });
      grow(415, 232, 590, 300, k === 4 ? E(u, 0.2, 0.8) : 1, pick === 1 ? ACC : OFF, { plain: true });
      pill(660, 228, 'tool_call', pick === 0 ? ACC : OFF, k === 4 ? pop(u, 0.6) : 1, { mono: true, fs: 14, fill: pick === 0 ? ACCBG : PANEL });
      pill(660, 300, 'final', pick === 1 ? ACC : OFF, k === 4 ? pop(u, 0.8) : 1, { mono: true, fs: 14, fill: pick === 1 ? ACCBG : PANEL });
      pill(330, 300, 'tool_choice="auto"', INK, k === 4 ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 });
      if (k === 4) note(500, 370, '쓸지 말지도 LLM이 정한다. 사람이 분기를 짜지 않는다', fade(u, 1.5)); }
    if (k === 5) code(20, 340, ['tool_calls[0].function.name      = "search_weather"', 'tool_calls[0].function.arguments = \'{"location": "강릉", "date": "내일"}\''], { fs: 14, shown: E(u, 0.2, 1.8) * 2, title: '응답에서 꺼낸 것' });
    if (k === 6) { code(20, 340, ['{"type": "tool_call", "name": "search_weather",', ' "args": {"location": "강릉", "date": "내일"}}'], { fs: 14.5, shown: E(u, 0.2, 1.4) * 2, title: 'think()가 돌려주는 결정' });
      cross(780, 300, 9, pop(u, 1.5)); note(600, 382, 'if/else 분기 코드는 어디에도 없다', fade(u, 1.8), { fill: MUT }); } }

  // ---------- 3. Act: 이름으로 함수를 찾아 실행만 한다 ----------
  const REG = [['search_weather', 'call_weather_api(location, date)'], ['search_restaurant', 'call_restaurant_api(location, cuisine)'], ['search_hotel', 'call_hotel_api(location, checkin)']];
  function s3(t, c) { const { k, u } = c;
    tx(20, 30, 'TOOL_REGISTRY', { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: MUT });
    REG.forEach(([a, b], i) => { const y = 62 + i * 42, s = k === 0 ? pop(u, 0.2 + i * 0.35) : 1, hot = k >= 2 && k <= 3 && i === 0;
      pill(100, y, a, hot ? ACC : INK, s, { mono: true, fs: 13.5, fill: hot ? ACCBG : PANEL }); if (s > 0.5) { grow(178, y, 214, y, 1, MUT); mono(222, y + 5, b, { 'font-size': 13.5, fill: hot ? ACC : INK }); } });
    if (k === 5) msg(30, 62 + 3 * 42, 520, 'tool', '새 도구는 여기 한 줄만 더한다', { u: E(u, 1.2, 2.2), ghost: true, label: '+' });
    if (k === 0) { note(20, 230, 'Act가 볼 곳은 이 표 하나뿐이다', fade(u, 1.5)); return; }
    card(800, 92, 250, 64, { rx: 10, text: 'act(decision, ctx)', fs: 15, fw: 800, mono: true, stroke: ACC, color: ACC, s: k === 1 ? pop(u, 0.2) : 1 });
    if (k === 1) { fly(620, 380, 800, 140, seg(u, 0.6, 1.7), 'decision: tool_call', { mono: true }); note(620, 220, 'Think의 결정과 컨텍스트를 함께 받는다', fade(u, 1.9)); return; }
    if (k === 2) { grow(680, 92, 568, 62, E(u, 0.2, 0.8), ACC);
      code(600, 170, ['fn = TOOL_REGISTRY["search_weather"]', 'fn(location="강릉", date="내일")'], { fs: 14, shown: E(u, 0.6, 1.8) * 2 });
      server(800, 320, '날씨 API', { s: 0.8, lamp: u > 2 ? GOOD : OFF }); dot([[800, 250], [800, 290]], seg(u, 1.9, 2.5), ACC, 7); return; }
    // 결과 → history (다음 Observe)
    msgs(30, 300, 560, [['user', ASK], ['tool', '{"tool": "search_weather", "result": {"temp": 22, "sky": "맑음"}}']], k === 3 ? 1 + E(u, 0.8, 1.8) : 2, { title: 'ctx.history', fs: 13.5 });
    if (k === 3) { fly(800, 130, 360, 336, seg(u, 0.2, 1.0), '{"temp": 22, "sky": "맑음"}', { mono: true, fill: GOOD });
      code(600, 190, ['return {"continue": True, "result": …}'], { fs: 14, shown: E(u, 1.8, 2.5) }); return; }
    if (k === 4) { code(620, 190, ['if decision["type"] == "final":', '    return {"continue": False,', '            "answer": ...}'], { fs: 14, op: 0.6, dash: '5 4' });
      cross(905, 205, 12, pop(u, 1.0)); note(620, 290, '이번 결정은 tool_call이라 해당 없음', fade(u, 1.4), { fill: MUT }); return; }
    // k5: 역할 분담
    card(700, 200, 200, 56, { rx: 10, text: 'Think = 판단 (LLM)', fs: 15, fw: 800, stroke: INFO, color: INFO, s: pop(u, 0.2) });
    card(700, 266, 200, 56, { rx: 10, text: 'Act = 실행만 (코드)', fs: 15, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.6) }); }

  // ---------- 4. Loop: Observe → Think → Act 를 다시 ----------
  const H4 = [['user', ASK], ['tool', 'search_weather → {"temp": 22, "sky": "맑음"}'], ['tool', 'search_restaurant → 추천 식당 3곳']];
  function s4(t, c) { const { k, u } = c;
    const on = k === 1 ? 0 : k === 2 ? 1 : k === 3 || k === 4 ? 2 : k === 5 ? 0 : k === 6 ? 1 : 2;
    const arc = k === 0 ? E(u, 0.6, 2.0) * 3 : k === 1 ? 0.15 : k === 2 ? 1 : k === 3 || k === 4 ? 2 : k === 5 ? 3 : k === 6 ? 1 : 2;
    ring(200, 212, 118, ['Observe', 'Think', 'Act'], { on: k === 0 ? -1 : on, arc, col: k === 0 ? OFF : ACC, s: (i) => (k === 0 ? pop(u, 0.2 + i * 0.25) : 1),
      dot: k === 2 ? seg(u, 0.2, 1.0) / 3 : k === 3 ? 1 / 3 + seg(u, 0.2, 1.0) / 3 : k === 5 ? 2 / 3 + seg(u, 0.2, 1.0) / 3 : k === 6 ? seg(u, 1.0, 1.8) / 3 : k === 7 ? 1 / 3 + seg(u, 0.2, 1.0) / 3 : null });
    if (k === 0) { note(420, 210, 'observe · think · act를 가져와 루프 하나로 엮는다', fade(u, 1.8)); return; }
    // cycle 카운터와 안전장치
    const cyc = k <= 4 ? 1 : 2;
    mono(420, 42, `cycle ${cyc}`, { 'font-size': 18, 'font-weight': 800, fill: ACC });
    tx(540, 40, 'MAX_ITERATIONS = 10', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: k === 6 ? BAD : MUT });
    slots(540, 52, 10, k === 1 ? 0 : cyc, { w: 30, h: 18, gap: 4, col: () => ACC, stroke: k === 6 ? BAD : GRID });
    msgs(420, 130, 515, H4, k <= 4 ? (k === 1 ? E(u, 0.2, 1.0) : 1) : k <= 6 ? (k === 5 ? 1 + E(u, 1.0, 1.8) : 2) : 2 + E(u, 1.3, 2.2), { title: 'ctx.history', fs: 13.5 });
    // 이 beat 의 결정·결과
    const show = (s, col, a) => pill(200, 212, s, col, a, { mono: true, fs: 13.5, fill: PANEL });
    if (k === 2) show('search_weather("강릉", "내일")', ACC, pop(u, 1.1));
    if (k === 3) show('{"temp": 22, "sky": "맑음"}', GOOD, pop(u, 1.1));
    if (k === 4) card(200, 212, 150, 50, { rx: 8, text: 'continue?\nTrue → 계속', fs: 14, fw: 700, stroke: WARN, color: WARN, s: pop(u, 0.4) });
    if (k === 6) show('search_restaurant("강릉", "회")', ACC, pop(u, 1.8));
    if (k === 7) show('추천 식당 3곳', GOOD, pop(u, 1.1));
    if (k === 6) note(420, 300, '10 cycle을 넘기면 실패 문구로 강제 종료', fade(u, 0.6), { fill: BAD });
    if (k === 7) { note(420, 300, '챗봇 : 1턴 → LLM 1번 → 응답', fade(u, 1.5), { fill: MUT }); note(420, 330, 'Agent : 1턴 → (Think + Act) × N → 응답', fade(u, 1.8), { fill: ACC });
      note(420, 366, 'N은 LLM이 정한다', fade(u, 2.2)); }
    if (k === 1) note(420, 300, '빈 Context에 사용자 입력이 0번 관찰로 들어간다', fade(u, 1.2)); }

  // ---------- 5. 시나리오: 4 cycle trace ----------
  const TR = [['1', '날씨부터 봐야 한다', 'search_weather("강릉", "내일")', '맑음 22도'], ['2', '식당 추천 필요', 'search_restaurant("강릉", "회")', '회식당 3곳'],
    ['3', '1박이니 호텔 필요', 'search_hotel("강릉", "내일")', '호텔 5곳'], ['4', '정보 충분 → final', '(도구 호출 없음)', '일정 작성']];
  function s5(t, c) { const { k, u } = c;
    const X = [44, 90, 300, 640];
    ['cycle', 'Think 결정', 'Act', '결과'].forEach((s, i) => tx(X[i], 40, s, { 'font-size': 14, 'font-weight': 800, fill: MUT }));
    el('line', { x1: 24, y1: 52, x2: 936, y2: 52, stroke: GRID, 'stroke-width': 2 });
    const rowsN = k <= 3 ? k + E(u, 0.2, 1.4) : 4;
    TR.forEach((r, i) => { const a = clamp(rowsN - i); if (a <= 0) return; const y = 84 + i * 46, fin = i === 3;
      el('rect', { x: 24, y: y - 20, width: 912 * E(a, 0, 0.6), height: 38, rx: 6, fill: fin ? WARNBG : i % 2 ? PANEL : SOFT, opacity: 1 });
      const op = seg(a, 0.4, 1), hiT = k === 6;
      mono(X[0] + 8, y + 5, r[0], { 'font-size': 15, 'font-weight': 800, opacity: op });
      tx(X[1], y + 5, r[1], { 'font-size': 14.5, 'font-weight': 700, fill: hiT ? ACC : fin ? WARN : INK, opacity: op });
      mono(X[2], y + 5, r[2], { 'font-size': 14, fill: fin ? MUT : ACC, opacity: op });
      tx(X[3], y + 5, r[3], { 'font-size': 14.5, fill: fin ? WARN : GOOD, 'font-weight': 700, opacity: op }); });
    if (k === 3) note(300, 290, '도구를 부르지 않는 cycle도 한 번의 판단이다', fade(u, 1.6), { fill: WARN });
    if (k === 4) { card(480, 300, 600, 76, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.3) });
      tx(200, 292, '1일차: 14시 호텔 체크인 → 18시 회식당 → 호텔 1박', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7) });
      tx(200, 318, '2일차: 오전 오죽헌 관광 → 13시 강릉 출발', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      pill(480, 372, 'cycle 4의 final로 루프 종료 · cycle 5는 없다', WARN, pop(u, 1.6), { fs: 14, fill: PANEL }); }
    if (k === 5) { tx(60, 290, 'LLM 호출', { 'font-size': 15, 'font-weight': 800 }); slots(160, 276, 4, E(u, 0.2, 1.2) * 4, { w: 40, h: 20, col: () => INFO }); mono(340, 292, '4번', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) });
      tx(60, 330, '도구 호출', { 'font-size': 15, 'font-weight': 800 }); slots(160, 316, 4, E(u, 0.6, 1.6) * 3, { w: 40, h: 20, col: () => GOOD }); mono(340, 332, '3번', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      note(460, 312, 'cycle이 늘면 LLM 비용도 그만큼 는다', fade(u, 2.0)); }
    if (k === 6) { pill(240, 300, '사람이 준 것: 목표 한 줄', INFO, pop(u, 0.6), { fs: 15 });
      pill(640, 300, 'LLM이 정한 것: 호출 순서 · 종료 시점', ACC, pop(u, 1.2), { fs: 15 });
      note(260, 370, '종료는 Think가 final을 내거나 MAX_ITERATIONS에 닿을 때뿐', fade(u, 1.8), { fill: MUT }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '도구를 실행한 결과는 Agent의 어디에 들어가나?',
      o: ['사용자 입력과 같은 history에 source="tool"로', '별도 로그 파일에만', 'LLM 내부 기억에 저절로'], a: 0,
      why: 'observe_tool_result()가 ctx.add(source="tool", …)를 부른다. 사용자 입력과 같은 history에 쌓여 다음 Think의 재료가 된다.' },
    { q: 'think()에서 도구를 쓸지 말지는 누가 정하나?',
      o: ['사람이 미리 짠 if/else 분기', 'tool_choice="auto"를 받은 LLM', '항상 첫 번째 도구가 불린다'], a: 1,
      why: 'TOOLS와 tool_choice="auto"를 넘기면 LLM이 tool_calls를 낼지 바로 답할지 고른다. 코드에는 분기가 없다.' },
    { q: 'act()가 실제 파이썬 함수를 찾아오는 곳은 어디인가?',
      o: ['TOOLS 스키마의 description', 'Context.history', 'TOOL_REGISTRY 표'], a: 2,
      why: 'act()는 decision["name"]으로 TOOL_REGISTRY에서 함수를 꺼내 args를 풀어 호출한다. 스키마는 LLM이 읽는 설명일 뿐이다.' },
    { q: 'run_agent 루프가 끝나는 경우는 무엇인가?',
      o: ['Think가 final을 내거나 10 cycle에 닿을 때', '도구를 한 번 실행했을 때', '사용자가 다시 입력할 때'], a: 0,
      why: 'act()가 continue=False를 돌려줄 때만 답을 반환한다. LLM이 끝을 못 내면 MAX_ITERATIONS 10에서 실패 문구로 멈춘다.' },
    { q: '강릉 여행 시나리오에서 LLM은 몇 번 불렸나?',
      o: ['3번', '4번', '5번'], a: 1,
      why: 'think()는 cycle마다 한 번 불린다. cycle 4에서 final이 나와 바로 반환하므로 LLM 4번, 도구 3번이다.' },
  ];

  // 완료 화면: 정리 문장과 장면을 엮는 복습 문제
  const summary = [
    'Agent는 사용자 입력과 도구 결과를 모두 history에 한 줄씩 쌓고 그 전체를 LLM에 넘긴다.',
    'Think에서는 LLM이 도구를 쓸지, 어떤 이름과 인자로 부를지 JSON으로 정한다.',
    'Act는 TOOL_REGISTRY에서 함수를 찾아 실행하고 결과를 다시 history에 넣는다.',
    '강릉 여행 예시는 cycle 4의 final에서 끝나 LLM 4번, 도구 3번이 쓰였다.',
  ];
  const review = [
    { q: 'Agent가 같은 날씨 도구를 계속 다시 부른다. 먼저 의심할 것은?',
      o: ['도구 결과가 history에 들어가지 않는다', 'TOOL_REGISTRY에 도구가 너무 많다', 'tool_choice가 auto로 되어 있다'], a: 0,
      why: 'Think는 history만 보고 판단한다. 결과가 쌓이지 않으면 LLM은 아직 날씨를 모른다고 보고 같은 호출을 되풀이한다.' },
    { q: 'MAX_ITERATIONS를 10에서 3으로 줄였다. 강릉 여행 요청은 어떻게 되나?',
      o: ['아무 영향이 없다', '세 번째 cycle에서 일정표를 낸다', '세 cycle 모두 도구를 부르고 실패 문구로 끝난다'], a: 2,
      why: '이 요청은 cycle 1~3에서 도구를 부르고 cycle 4에서야 final이 나온다. 상한이 3이면 final에 닿기 전에 루프가 끝난다.' },
    { q: 'search_train 함수를 TOOL_REGISTRY에만 넣었더니 LLM이 한 번도 고르지 않는다. 무엇이 빠졌나?',
      o: ['Context.history 초기화', 'TOOLS 스키마의 이름과 설명', 'act()의 final 분기'], a: 1,
      why: 'LLM이 보는 것은 TOOLS의 이름과 설명이다. 레지스트리는 실행만 맡으므로 스키마에 없으면 고를 수 없다.' },
  ];

  R.page({ title: 'Agent의 3요소', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
