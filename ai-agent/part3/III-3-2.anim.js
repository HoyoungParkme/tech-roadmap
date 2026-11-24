/* III-3-2 Function Calling — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * OpenAI 와 Anthropic 의 tools 정의·응답·결과 메시지를 같은 시나리오(서울 날씨)로 나란히 놓는다.
 * 결과 dict 와 json.dumps(…, ensure_ascii=False) 출력은 파이썬으로 확인했다. 모델 응답 문장은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;


  // ---------- 지역 도우미 ----------
  const on = (c, kk, a = 0.2, d = 0.5) => (c.k > kk ? 1 : c.k === kk ? seg(c.u, a, a + d) : 0);
  const pon = (c, kk, a = 0.2) => (c.k > kk ? 1 : c.k === kk ? pop(c.u, a) : 0);
  // JSON 한 줄 색칠: 키 INFO, 문자열 ACC, 숫자 GOOD, 주석 MUT
  function jtok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\d[\d.,]*\b|\btrue\b|\bfalse\b|\bnull\b)/).forEach((w) => { if (w) out.push([w, /^(\d|true|false|null)/.test(w) ? { fill: GOOD, 'font-weight': 700 } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); let e = i + 1; while (e < line.length && line[e] !== '"') { if (line[e] === '\\') e++; e++; }
        const end = Math.min(line.length, e + 1), key = /^\s*:/.test(line.slice(end)); out.push([line.slice(i, end), key ? { fill: INFO, 'font-weight': 700 } : { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // 코드·JSON 상자. shown 줄까지 보이고(소수면 마지막 줄을 타이핑), hl 줄(0부터)은 형광 띠
  function codeBox(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, top = o.title ? 32 : 12, op = o.op ?? 1;
    const h = o.h || top + lines.length * lh + 10;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: op });
    if (o.title) tx(x + 14, y + 21, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    const shown = o.shown ?? lines.length, tk = o.py ? R.tokens : jtok;
    lines.forEach((s, i) => { const f = shown - i; if (f <= 0) return; const yy = y + top + i * lh, str = f < 1 ? s.slice(0, Math.round(s.length * f)) : s;
      if (o.hl && o.hl.includes(i)) el('rect', { x: x + 5, y: yy + 1, width: (w - 10) * (o.hlU ?? 1), height: lh - 1, rx: 4, fill: HL, opacity: 0.6 * op });
      spans(x + 14, yy + lh / 2 + fs * 0.36, tk(str), { 'font-size': fs, opacity: (o.dim && o.dim(i) ? 0.3 : 1) * op }); });
    return { h, ly: (i) => y + top + i * lh + lh / 2 }; }
  // messages 한 칸: 역할 이름 + 내용. u 로 칸이 왼쪽부터 채워진다
  const ROLE = { system: [MUT, SOFT], user: [INFO, INFOBG], assistant: [ACC, ACCBG], tool: [GOOD, GOODBG] };
  function msgRow(x, y, w, role, text, o) { o = o || {}; const u = o.u ?? 1; if (u <= 0) return; const [col, bg] = ROLE[role], h = o.h || 34, op = o.op ?? 1;
    el('rect', { x, y, width: Math.max(10, w * E(u, 0, 0.55)), height: h, rx: 8, fill: bg, stroke: o.hot ? INK : col, 'stroke-width': o.hot ? 2.4 : 1.6, opacity: op });
    const t = fade(u, 0.45, 0.35) * op;
    mono(x + 12, y + h / 2 + 5, role, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: t });
    if (o.parts) spans(x + 108, y + h / 2 + 5, o.parts, { 'font-size': o.fs || 14, opacity: t, class: o.sans ? null : 'mono' });
    else tx(x + 108, y + h / 2 + 5, text, { 'font-size': o.fs || 14.5, fill: INK, opacity: t, class: o.mono ? 'mono' : null }); }
  // LLM 상자. state: think → 점 세 개가 뛴다
  function llmBox(cx, cy, t, o) { o = o || {}; const w = o.w || 170, h = o.h || 72, op = o.op ?? 1;
    card(cx, cy, w, h, { rx: 14, stroke: o.stroke || INK, sw: 2.5, fill: o.fill || PANEL, op, s: o.s });
    tx(cx, cy - 5, 'LLM', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, opacity: op * (o.s ?? 1) });
    mono(cx, cy + 19, o.model || 'gpt-4o', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op * (o.s ?? 1) });
    if (o.state === 'think') for (let i = 0; i < 3; i++) el('circle', { cx: cx + w / 2 - 38 + i * 12, cy: cy - h / 2 + 15 - Math.abs(Math.sin(t * 4 + i)) * 4, r: 3.6, fill: ACC, opacity: op });
    if (o.label) tx(cx, cy + h / 2 + 22, o.label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.lcol || MUT, opacity: op * (o.lop ?? 1) }); }

  // ---------- 1. 도구 명세 JSON ----------

  const OA = GOOD, AN = WARN;   // OpenAI · Anthropic 표시 색
  const lane = (x, name, col, op) => { mono(x, 30, name, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op ?? 1 }); };
  // 겹 상자: 바깥에서 안으로 한 겹씩
  function layer(x, y, w, h, label, col, u, o) { o = o || {}; if (u <= 0) return;
    el('rect', { x, y, width: w, height: h * E(u, 0, 0.7), rx: 10, fill: o.fill || 'none', stroke: col, 'stroke-width': 2, opacity: o.op ?? 1 });
    if (label) mono(x + 12, y + 20, label, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 0.5) * (o.op ?? 1) }); }
  const jl = (x, y, s, op, a) => spans(x, y, jtok(s), Object.assign({ 'font-size': 14, opacity: op ?? 1 }, a || {}));

  // ---------- 1. tools 정의: OpenAI 세 겹 vs Anthropic 두 겹 ----------
  function s1(t, c) { const { k, u } = c;
    lane(20, 'OpenAI', OA); lane(490, 'Anthropic', AN, k >= 5 ? 1 : 0.4);
    mono(140, 30, 'client = OpenAI()', { 'font-size': 14, fill: INK, opacity: on(c, 0, 0.3) });
    mono(640, 30, 'client = Anthropic()', { 'font-size': 14, fill: INK, opacity: k >= 5 ? 1 : 0.35 * on(c, 0, 0.6) });
    if (k === 0) { codeBox(20, 60, 450, ['tools = [ ]   # 아직 비어 있다'], { py: true, op: fade(u, 1.0) }); codeBox(490, 60, 450, ['tools = [ ]'], { py: true, op: 0.4 * fade(u, 1.2) }); }
    // OpenAI 겹
    layer(20, 58, 450, 258, 'tools[0]', OA, k > 1 ? 1 : k === 1 ? seg(u, 0.2, 1.0) : 0, { fill: GOODBG });
    if (k >= 1) { jl(110, 78, '"type": "function"', on(c, 1, 0.6));
      layer(34, 92, 422, 214, '"function": {', OA, k > 1 ? 1 : seg(u, 1.2, 2.0), { fill: PANEL }); }
    if (k >= 2) { jl(48, 136, '"name": "get_weather",', on(c, 2, 0.2)); jl(48, 158, '"description": "도시 현재 날씨",', on(c, 2, 0.8)); }
    if (k >= 3) { layer(48, 170, 394, 128, '"parameters": {', OA, k > 3 ? 1 : seg(u, 0.2, 1.0), { fill: SOFT });
      jl(62, 214, '"type": "object",', on(c, 3, 0.9)); jl(62, 238, '"properties": {"city": {"type": "string"}}', on(c, 3, 1.4)); }
    if (k >= 4) { jl(62, 264, '"required": ["city"]', on(c, 4, 0.2)); if (k === 4) el('rect', { x: 56, y: 248, width: 200 * E(u, 0.2, 0.8), height: 22, rx: 4, fill: HL, opacity: 0.6 }); }
    if (k === 4 || k === 5) { const a = k === 4 ? fade(u, 1.0) : 1; spans(20, 344, [['tools[0]', { fill: OA, 'font-weight': 700 }], ['.function', { fill: OA, 'font-weight': 700 }], ['.parameters', { fill: OA, 'font-weight': 700 }], ['   세 겹', { fill: MUT }]], { 'font-size': 15, opacity: a }); }
    // Anthropic 겹
    if (k >= 5) { const g = k > 5 ? 1 : seg(u, 0.2, 1.0);
      layer(490, 58, 450, 258, 'tools[0]', AN, g, { fill: WARNBG });
      jl(504, 100, '"name": "get_weather",', k > 5 ? 1 : fade(u, 0.7)); jl(504, 122, '"description": "도시 현재 날씨",', k > 5 ? 1 : fade(u, 0.9));
      layer(504, 136, 422, 140, '"input_schema": {', AN, k > 5 ? 1 : seg(u, 1.0, 1.8), { fill: PANEL });
      const b = k > 5 ? 1 : fade(u, 1.6); jl(518, 180, '"type": "object",', b); jl(518, 204, '"properties": {"city": {"type": "string"}}', b); jl(518, 228, '"required": ["city"]', b);
      if (k === 5) { el('path', { d: 'M442,200 C470,200 470,170 504,170', fill: 'none', stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '5 4', 'marker-end': 'url(#ra-ah)', opacity: fade(u, 1.8) });
        spans(490, 344, [['tools[0]', { fill: AN, 'font-weight': 700 }], ['.input_schema', { fill: AN, 'font-weight': 700 }], ['   두 겹 · type/function 없음', { fill: MUT }]], { 'font-size': 15, opacity: fade(u, 2.0) }); } }
    if (k === 6) { codeBox(20, 326, 640, ['client.chat.completions.create(model="gpt-4o-mini",', '    messages=[{"role": "user", "content": "서울 날씨 알려줘"}],', '    tools=tools, tool_choice="auto")'],
        { py: true, fs: 14, lh: 20, h: 86, hl: [2], hlU: E(u, 0.3, 1.0), op: fade(u, 0.1) });
      dot([[660, 368], [740, 368]], seg(u, 1.0, 1.8), OA, 8);
      card(840, 368, 170, 56, { rx: 12, text: 'gpt-4o-mini', fs: 15, mono: true, stroke: INK, sw: 2.5, s: pop(u, 0.6) });
      sub(840, 412, '도구를 쓸지는 모델이 정한다', fade(u, 1.8), { fill: INK, 'font-weight': 600 }); } }

  // ---------- 2. 응답에서 호출 요청 꺼내기 ----------
  function crumbs(x, y, parts, n, col) { let xx = x; parts.forEach((p, i) => { const a = clamp(n - i); if (a <= 0) return; const w = tw(p, 14) + 18;
      el('rect', { x: xx, y: y - 14, width: w, height: 28, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 1.6, opacity: a }); mono(xx + 9, y + 5, p, { 'font-size': 14, opacity: a, 'font-weight': 700 }); xx += w + 4; }); }
  function s2(t, c) { const { k, u } = c;
    lane(20, 'OpenAI', OA); lane(490, 'Anthropic', AN, k >= 4 ? 1 : 0.4);
    // 왼쪽: response → choices[0] → message → tool_calls[0]
    const nO = k === 0 ? lerp(0, 3, E(u, 0.2, 1.6)) : k === 1 ? lerp(3, 4, E(u, 0.2, 0.8)) : 4;
    crumbs(20, 64, ['response', '.choices[0]', '.message', '.tool_calls[0]'], nO, OA);
    if (k >= 1) pill(150, 104, 'finish_reason: "tool_calls"', OA, pon(c, 1, 0.8), { mono: true, fs: 13.5 });
    if (k >= 2) { const L = ['{', '  "id": "call_abc123",', '  "function": {', '    "name": "get_weather",', '    "arguments": "{\\"city\\":\\"서울\\"}"', '  }}'];
      if (k >= 4) L.push('args = json.loads(arguments)  # dict');
      const sh = k === 2 ? lerp(1, 4, E(u, 0.2, 1.6)) : k === 3 ? lerp(4, 6, E(u, 0.2, 0.9)) : k === 4 ? lerp(6, 7, E(u, 0.2, 1.0)) : L.length;
      const bx = codeBox(20, 124, 450, L, { fs: 14, lh: 21, shown: sh, stroke: OA, sw: 1.8, hl: k === 2 ? [1, 3] : k === 3 ? [4] : k === 4 ? [6] : [], hlU: E(u, 0.2, 0.8), h: 176 });
      if (k >= 3) pill(440, bx.ly(4), 'str', BAD, pon(c, 3, 1.1), { mono: true, fs: 13.5 });
      if (k >= 4) pill(436, bx.ly(6), 'dict', GOOD, pon(c, 4, 1.2), { mono: true, fs: 13.5 }); }
    if (k <= 4) { msgRow(20, 360, 300, 'user', '서울 날씨 알려줘', { u: k === 0 ? seg(u, 0.1, 0.8) : 1 }); grow(326, 377, 380, 377, k === 0 ? seg(u, 0.8, 1.1) : 1, MUT);
      mono(388, 382, 'gpt-4o-mini의 응답', { 'font-size': 14, fill: MUT, opacity: on(c, 0, 1.0) }); }
    if (k === 3) tx(245, 330, '따옴표 안의 글자 한 줄 · 아직 dict가 아니다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
    // 오른쪽: resp → content[] → tool_use
    if (k >= 4) { const nA = k === 4 ? lerp(0, 3, E(u, 0.8, 2.0)) : 3; crumbs(490, 64, ['resp', '.content[i]', 'type=="tool_use"'], nA, AN);
      pill(612, 104, 'stop_reason: "tool_use"', AN, pon(c, 4, 1.6), { mono: true, fs: 13.5 }); }
    if (k >= 5) { const bx = codeBox(490, 124, 450, ['{"type": "tool_use",', ' "id": "toolu_xyz789",', ' "name": "get_weather",', ' "input": {"city": "서울"}}'], { fs: 14, lh: 21, stroke: AN, sw: 1.8, shown: k === 5 ? lerp(0, 4, E(u, 0.1, 0.9)) : 4, h: 176 });
      pill(880, bx.ly(3), 'dict', GOOD, pop(u, 0.9), { mono: true, fs: 13.5 });
      // 두 SDK 대조표
      const rows = [['위치', 'message.tool_calls', 'content[].tool_use'], ['인자', 'arguments (str)', 'input (dict)'], ['id', 'call_…', 'toolu_…'], ['종료', 'finish_reason="tool_calls"', 'stop_reason="tool_use"']];
      rows.forEach(([a, b, d], i) => { const y = 334 + i * 22, op = fade(u, 1.1 + i * 0.25);
        tx(40, y, a, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op }); mono(120, y, b, { 'font-size': 14, fill: OA, 'font-weight': 700, opacity: op }); mono(500, y, d, { 'font-size': 14, fill: AN, 'font-weight': 700, opacity: op });
        el('line', { x1: 30, y1: y + 7, x2: 930, y2: y + 7, stroke: GRID, opacity: op }); }); } }

  // ---------- 3. 이름으로 함수를 찾아 실행 ----------
  const RES = '{"temp": 24, "condition": "맑음", "city": "서울"}';
  function s3(t, c) { const { k, u } = c;
    codeBox(20, 20, 560, ['def get_weather(city: str) -> dict:', '    # 실제로는 weather API 등을 호출', '    return {"temp": 24, "condition": "맑음", "city": city}'],
      { py: true, fs: 14, lh: 21, title: 'execute.py', shown: k === 0 ? lerp(0, 3, E(u, 0.2, 1.6)) : 3, stroke: k === 3 ? GOOD : GRID, sw: k === 3 ? 2.4 : 1.5 });
    if (k === 0) tx(300, 170, 'LLM이 부르는 get_weather도 평범한 파이썬 함수다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    if (k >= 1) { const a = on(c, 1, 0.1, 0.4); mono(610, 40, 'TOOL_REGISTRY', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: a });
      [['"get_weather"', 'get_weather'], ['"get_time"', 'get_time']].forEach(([n, f], i) => { const y = 70 + i * 42, g = on(c, 1, 0.3 + i * 0.4, 0.4);
        card(690, y, 150, 32, { rx: 6, text: n, fs: 13.5, mono: true, stroke: INFO, op: g }); grow(768, y, 800, y, g, INK); card(870, y, 128, 32, { rx: 6, text: f, fs: 13.5, mono: true, stroke: GOOD, fill: GOODBG, op: g }); }); }
    if (k === 2) { pill(690, 172, 'name not in TOOL_REGISTRY', BAD, pop(u, 0.3), { mono: true, fs: 13.5 }); cross(850, 172, 9, pop(u, 0.8));
      codeBox(560, 200, 380, ['return {"error": "unknown tool: …"}'], { py: true, fs: 14, op: fade(u, 1.2), stroke: BAD });
      tx(750, 280, '실행 권한은 이 표를 쥔 개발자에게 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
    if (k >= 3) { const y = 270;
      if (k === 3) { card(120, y, 190, 44, { rx: 8, text: '{"city": "서울"}', fs: 15, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 0.1) });
        grow(216, y, 290, y, seg(u, 0.4, 0.8), INK); card(420, y, 250, 44, { rx: 8, text: 'fn(**args)', fs: 15, mono: true, stroke: INK, s: pop(u, 0.6) });
        mono(560, y + 5, '= get_weather(city="서울")', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) }); }
      if (k === 4) { // 두 SDK 가 같은 dispatch 로 들어온다
        card(150, 220, 250, 40, { rx: 8, text: 'OpenAI: json.loads 한 args', fs: 14, stroke: OA, fill: GOODBG, s: pop(u, 0.2) });
        card(150, 320, 250, 40, { rx: 8, text: 'Anthropic: block.input', fs: 14, stroke: AN, fill: WARNBG, s: pop(u, 0.4) });
        grow(276, 220, 316, 258, seg(u, 0.6, 1.0), INK); grow(276, 320, 316, 284, seg(u, 0.6, 1.0), INK);
        card(420, y, 200, 44, { rx: 8, text: 'dispatch(name, args)', fs: 14, mono: true, stroke: INK }); }
      grow(420, y + 22, 420, 334, k === 3 ? seg(u, 1.2, 1.6) : seg(u, 1.0, 1.3), INK);
      const r = k === 3 ? fade(u, 1.6) : fade(u, 1.4);
      el('rect', { x: 200, y: 340, width: 440, height: 44, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: r });
      jl(216, 367, RES, r, { 'font-size': 14 });
      if (k === 4) tx(660, 367, '두 SDK 모두 같은 dict', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); } }

  // ---------- 4. 결과를 messages 에 붙이고 다시 부른다 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 4) { // 호출이 N 개면 결과도 N 개
      tx(480, 34, 'tool_calls가 2개라면 tool 메시지도 2개', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      [0, 1].forEach((i) => { const y = 70 + i * 48, g = pop(u, 0.2 + i * 0.3);
        card(150, y + 17, 220, 36, { rx: 8, text: `tool_calls[${i}]`, fs: 14, mono: true, stroke: ACC, fill: ACCBG, s: g });
        grow(262, y + 17, 330, y + 17, seg(u, 0.6 + i * 0.3, 1.0 + i * 0.3), INK); card(400, y + 17, 120, 36, { rx: 8, text: 'dispatch', fs: 14, mono: true, s: pop(u, 0.8 + i * 0.3) });
        grow(462, y + 17, 520, y + 17, seg(u, 1.2 + i * 0.3, 1.5 + i * 0.3), INK);
        msgRow(526, y, 410, 'tool', '', { u: seg(u, 1.4 + i * 0.3, 2.2 + i * 0.3), parts: [[`tool_call_id = tool_calls[${i}].id`, { fill: INFO, 'font-weight': 700 }]] }); });
      el('line', { x1: 40, y1: 190, x2: 920, y2: 190, stroke: GRID, 'stroke-width': 1.5 });
      mono(30, 222, 'Anthropic', { 'font-size': 15, 'font-weight': 800, fill: AN, opacity: fade(u, 1.6) });
      msgRow(30, 238, 900, 'user', '', { u: seg(u, 1.7, 2.6), parts: [['content: [ ', { fill: MUT }], ['{tool_result, tool_use_id}', { fill: AN, 'font-weight': 700 }], [' × 결과 수만큼 ]', { fill: MUT }]] });
      tx(480, 320, 'Anthropic은 tool_result 블록들을 user 메시지 하나에 담는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 600, opacity: fade(u, 2.2) }); return; }
    lane(20, k === 5 ? 'OpenAI' : 'OpenAI messages', OA);
    const rows = [['user', '서울 날씨 알려줘', null], ['assistant', '', [['tool_calls: get_weather  ', {}], ['id=call_abc123', { fill: INFO, 'font-weight': 700 }]]],
      ['tool', '', [['tool_call_id=call_abc123  ', { fill: INFO, 'font-weight': 700 }], ['{"temp": 24, …}', { fill: GOOD }]]], ['assistant', '서울은 맑고 24도입니다.', null]];
    const W = k === 5 ? 440 : 600;
    rows.forEach(([r, txt, parts], i) => { const show = i < 2 ? 1 : i === 2 ? on(c, 1, 0.2, 1.0) : (k >= 3 || k === 5) ? 1 : k === 2 ? seg(u, 1.6, 2.5) : 0; if (show <= 0) return;
      msgRow(20, 44 + i * 44, W, r, txt, { u: show, parts: k === 5 ? (i === 2 ? [['tool_call_id=call_abc123', { fill: INFO, 'font-weight': 700 }]] : i === 1 ? [['id=call_abc123', { fill: INFO, 'font-weight': 700 }]] : parts) : parts, hot: i === 3 && k === 3 }); });
    if (k === 0) { tx(640, 116, '← 1차 응답 msg 그대로', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      tx(20, 212, 'user 질문과 1차 응답이 빠지면 LLM이 무슨 일이었는지 모른다', { 'font-size': 15, fill: BAD, 'font-weight': 600, opacity: fade(u, 1.4) }); }
    if (k >= 1 && k <= 3) { const g = on(c, 1, 1.0, 0.6); el('path', { d: `M${W + 20},105 h16 V149 h-16`, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: g }); }
    if (k === 1) { tx(20, 240, 'content는 문자열이어야 해서 json.dumps로 만든다', { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.4) });
      mono(20, 270, `"content": '${RES}'`, { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 2 || k === 3) { el('rect', { x: 12, y: 38, width: 616, height: 132, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: k === 2 ? fade(u, 0.1) : 0.5 });
      card(800, 300, 170, 60, { rx: 12, text: 'gpt-4o-mini', fs: 15, mono: true, stroke: INK, sw: 2.5 });
      if (k === 2) { dot([[628, 104], [720, 200], [790, 268]], seg(u, 0.3, 1.3), ACC, 8); mono(800, 352, 'finish_reason: "stop"', { 'font-size': 14, fill: OA, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) }); } }
    if (k === 3) { banner(320, 280, 'final.choices[0].message.content', pop(u, 0.4)); card(320, 340, 300, 44, { rx: 10, text: '"서울은 맑고 24도입니다."', fs: 16, stroke: ACC, fill: ACCBG, s: pop(u, 1.0) });
      tx(320, 394, 'tool_calls가 없고 사람이 읽을 문장만 있다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 5) { mono(500, 30, 'Anthropic', { 'font-size': 16, 'font-weight': 800, fill: AN });
      const ar = [['user', '서울 날씨 알려줘', null], ['assistant', '', [['tool_use  ', {}], ['id=toolu_xyz789', { fill: INFO, 'font-weight': 700 }]]], ['user', '', [['tool_result  ', {}], ['tool_use_id=toolu_xyz789', { fill: INFO, 'font-weight': 700 }]]], ['assistant', '서울은 맑고 24도입니다.', null]];
      ar.forEach(([r, txt, parts], i) => msgRow(500, 44 + i * 44, 440, r, txt, { u: i < 3 ? 1 : seg(u, 1.4, 2.4), parts, fs: 13.5 }));
      el('path', { d: 'M460,105 h12 V149 h-12', fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      el('path', { d: 'M940,105 h12 V149 h-12', fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.7) });
      tx(480, 250, 'id로 짝을 맞춰야 어느 호출의 결과인지 안다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      [['tool_call_id ↔ call_abc123', OA, 260], ['tool_use_id ↔ toolu_xyz789', AN, 700]].forEach(([s, col, x], i) => pill(x, 300, s, col, pop(u, 1.2 + i * 0.3), { mono: true, fs: 14 }));
      tx(480, 370, '필드 이름만 다르고 두 SDK 모두 같은 답에 닿는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 600, opacity: fade(u, 2.2) }); } }

  // ---------- 5. Anthropic 으로 처음부터 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 7) { // 두 SDK 필드 대응표
      tx(480, 40, 'OpenAI ↔ Anthropic, 바뀌는 것은 필드 이름', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      mono(250, 82, 'OpenAI', { 'font-size': 15, 'font-weight': 800, fill: OA, 'text-anchor': 'middle' }); mono(720, 82, 'Anthropic', { 'font-size': 15, 'font-weight': 800, fill: AN, 'text-anchor': 'middle' });
      [['tools[].function.parameters', 'tools[].input_schema'], ['message.tool_calls', 'content[].tool_use'], ['function.arguments (str)', 'tool_use.input (dict)'], ['role="tool"', 'role="user" + tool_result'], ['tool_call_id', 'tool_use_id']].forEach(([a, b], i) => {
        const y = 124 + i * 52, g = pop(u, 0.2 + i * 0.3);
        card(250, y, 360, 40, { rx: 8, text: a, fs: 14.5, mono: true, stroke: OA, fill: GOODBG, s: g }); card(720, y, 360, 40, { rx: 8, text: b, fs: 14.5, mono: true, stroke: AN, fill: WARNBG, s: g });
        grow(436, y, 534, y, seg(u, 0.5 + i * 0.3, 0.8 + i * 0.3), INK, { plain: true }); });
      tx(480, 404, 'print(final.content[0].text)  →  서울은 맑고 24도입니다.', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) }); return; }
    lane(20, 'Anthropic', AN);
    const TL = ['{"name": "get_weather",', ' "description": "도시 현재 날씨",', ' "input_schema": {"type": "object",', '   "properties": {"city": {"type": "string"}},', '   "required": ["city"]}}'];
    codeBox(20, 44, 450, TL, { fs: 14, lh: 20, shown: k === 0 ? lerp(0, 2, E(u, 0.2, 1.2)) : k === 1 ? lerp(2, 5, E(u, 0.2, 1.4)) : 5, stroke: k <= 1 ? AN : GRID, hl: k === 0 ? [0, 1] : k === 1 ? [2, 3, 4] : [] });
    if (k === 0) tx(245, 186, 'type·function 껍데기 없이 바로 name부터', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: AN, opacity: fade(u, 1.4) });
    if (k >= 2) { codeBox(490, 44, 450, ['resp = client.messages.create(', '    model="claude-opus-4-7",', '    max_tokens=1024,   # 필수', '    tools=tools, messages=messages)'], { py: true, fs: 14, lh: 20, op: on(c, 2, 0.1, 0.4), hl: k === 2 ? [2] : [], hlU: E(u, 0.6, 1.2) });
      if (k === 2) pill(850, 106, 'OpenAI엔 없는 필수값', BAD, pop(u, 1.2), { fs: 13.5 }); }
    // messages 목록
    const msgs = [['user', '서울 날씨 알려줘', null, 2], ['assistant', '', [['content: [ ', { fill: MUT }], ['tool_use', { fill: AN, 'font-weight': 700 }], [' ]', { fill: MUT }]], 5], ['user', '', [['[ ', { fill: MUT }], ['tool_result', { fill: AN, 'font-weight': 700 }], ['  toolu_xyz789 ]', { fill: INFO }]], 5], ['assistant', '서울은 맑고 24도입니다.', null, 6]];
    if (k >= 2) mono(20, 196, 'messages', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    msgs.forEach(([r, txt, parts, from], i) => { if (k < from) return; const show = k > from ? 1 : seg(u, i === 2 ? 1.0 : i === 3 ? 1.2 : 0.4, i === 2 ? 2.0 : i === 3 ? 2.4 : 1.4);
      msgRow(20, 206 + i * 44, 450, r, txt, { u: show, parts, hot: k === 6 && i === 3 }); });
    if (k === 6) { mono(715, 318, 'stop_reason: "end_turn"', { 'font-size': 14, fill: AN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    // 응답 블록과 실행
    if (k >= 3 && k <= 5) { const L = ['stop_reason: "tool_use"', 'content[0] {"type": "text", …}  ← 있을 수도', 'content[1] {"type": "tool_use",', '  "id": "toolu_xyz789",', '  "input": {"city": "서울"}}'];
      const bx = codeBox(490, 186, 450, L, { fs: 13.5, lh: 20, title: 'resp', tcol: AN, stroke: AN, shown: k === 3 ? lerp(0, 5, E(u, 0.2, 2.0)) : 5, dim: (i) => i === 1, hl: k === 4 ? [4] : [] });
      if (k >= 4) { const a = on(c, 4, 0.6, 0.4); pill(890, bx.ly(4), 'dict', GOOD, pon(c, 4, 0.3), { mono: true, fs: 13.5 });
        mono(500, 352, 'dispatch(block.name, block.input)', { 'font-size': 14, opacity: a }); mono(500, 380, '→ ' + RES, { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: on(c, 4, 1.2, 0.4) });
        if (k === 4) tx(715, 408, 'json.loads 없이 바로 넘긴다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: AN, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      if (k === 5) fly(700, 334, 330, 311, seg(u, 0.5, 1.0), 'tool_result', { fill: AN }); }
    if (k === 6) { card(715, 260, 220, 60, { rx: 12, text: 'claude-opus-4-7', fs: 15, mono: true, stroke: INK, sw: 2.5, s: pop(u, 0.2) });
      dot([[470, 280], [600, 260]], seg(u, 0.4, 1.1), AN, 8); grow(640, 280, 480, 350, seg(u, 1.1, 1.6), AN); } }

  // 장면마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '같은 get_weather 도구를 정의할 때 OpenAI와 Anthropic의 모양 차이는 무엇인가?',
      o: ['Anthropic은 type·function 껍데기 없이 name·description·input_schema를 바로 둔다', 'Anthropic은 JSON Schema 대신 파이썬 타입 힌트를 쓴다', 'OpenAI는 required를 쓸 수 없다'], a: 0,
      why: 'OpenAI는 tools[0].function.parameters로 세 겹, Anthropic은 tools[0].input_schema로 두 겹이다. 안에 든 JSON Schema는 같다.' },
    { q: 'OpenAI 응답의 arguments를 dispatch에 넘기기 전에 해야 하는 일은 무엇인가?',
      o: ['id를 toolu_로 바꾼다', 'json.loads로 문자열을 dict로 바꾼다', 'finish_reason을 "stop"으로 고친다'], a: 1,
      why: 'arguments는 \'{"city":"서울"}\' 같은 문자열로 온다. Anthropic의 input은 처음부터 dict라 이 단계가 없다.' },
    { q: '모델이 TOOL_REGISTRY에 없는 이름을 지어내 부르면 이 dispatch는 어떻게 하는가?',
      o: ['비슷한 이름의 함수를 찾아 대신 실행한다', '파이썬 예외로 프로그램을 멈춘다', '실행하지 않고 {"error": "unknown tool: …"}를 돌려준다'], a: 2,
      why: 'dispatch가 name not in TOOL_REGISTRY를 먼저 검사한다. 실행할 수 있는 함수는 개발자가 표에 넣은 것뿐이다.' },
    { q: 'OpenAI에서 2차 호출 전에 messages에 붙이는 도구 결과 메시지의 모양은 무엇인가?',
      o: ['role="tool", tool_call_id=call_abc123, content=JSON 문자열', 'role="assistant", content=결과 dict', 'role="system", content="도구 결과"'], a: 0,
      why: 'role tool 메시지가 tool_call_id로 1차 응답의 호출과 짝을 맞춘다. 결과는 json.dumps로 만든 문자열을 넣는다.' },
    { q: 'Anthropic에서 도구 결과를 돌려줄 때 쓰는 메시지는 무엇인가?',
      o: ['role="tool" 메시지 하나', 'role="user" 메시지 안의 tool_result 블록', 'assistant 메시지의 text 블록'], a: 1,
      why: 'Anthropic은 user 역할 메시지의 content에 {"type": "tool_result", "tool_use_id": …}를 넣는다. 짝은 tool_use_id로 맞춘다.' },
  ];

  const summary = [
    'OpenAI와 Anthropic 모두 도구를 JSON Schema로 정의하고, 감싸는 겹 수와 키 이름만 다르다.',
    'OpenAI의 arguments는 문자열이라 json.loads가 필요하고, Anthropic의 input은 이미 dict다.',
    '실행은 어느 쪽이든 개발자의 dispatch가 맡고, 표에 없는 이름은 error로 돌려준다.',
    '결과는 id로 짝을 지어 messages에 붙이고 2차 호출하면 자연어 답이 돌아온다.',
  ];
  const review = [
    { q: 'OpenAI 코드를 Anthropic으로 옮겼더니 dispatch에서 json.loads가 TypeError를 냈다. 원인은?',
      o: ['tool_use.input이 이미 dict라 json.loads에 넣을 필요가 없다', 'Anthropic이 인자를 XML로 보낸다', 'max_tokens를 빼먹었다'], a: 0,
      why: 'json.loads는 문자열을 받는다. Anthropic은 input을 dict로 주므로 그대로 dispatch에 넘기면 된다.' },
    { q: '도구 결과를 붙여 2차 호출했더니 어느 호출의 결과인지 맞지 않는다는 오류가 났다. 먼저 볼 곳은?',
      o: ['get_weather가 돌려준 온도 값', 'TOOL_REGISTRY에 get_time이 있는지', 'tool_call_id나 tool_use_id가 1차 응답의 id와 같은지'], a: 2,
      why: '결과 메시지는 id로 호출과 짝을 맞춘다. call_abc123이나 toolu_xyz789를 그대로 옮겨야 한다.' },
    { q: 'Anthropic으로 1차 호출을 보냈는데 요청 자체가 거절됐다. OpenAI 코드에는 없던 무엇이 빠졌을 가능성이 큰가?',
      o: ['tool_choice="auto"', 'max_tokens', 'type: "function"'], a: 1,
      why: 'messages.create는 max_tokens가 필수다. 이 장의 코드는 max_tokens=1024를 넣어 보낸다.' },
  ];

  R.page({ title: 'Function Calling — OpenAI vs Anthropic', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
