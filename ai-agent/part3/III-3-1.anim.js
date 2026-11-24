/* III-3-1 Tool Use란 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 도구 명세 JSON, 요청 묶음, tool_call JSON, messages 목록, 병렬 tool_calls 를 그대로 화면에 놓는다.
 * 숫자: 120 * 3 + 50 = 410, 100 * 1380 = 138000 (파이썬으로 확인). 환율·매출 값은 페이지의 예시 결과(MC). */
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
  const SCHEMA = ['{', '  "type": "function",', '  "function": {', '    "name": "calculator",', '    "description": "사칙연산이 필요할 때 호출. …",',
    '    "parameters": {', '      "type": "object",', '      "properties": {', '        "expression": {', '          "type": "string",',
    '          "description": "평가할 수식. 예: …"', '        }', '      },', '      "required": ["expression"]', '    }', '  }', '}'];
  const SHOWN = [3, 5, 13, 17, 17, 17], HL1 = [[0, 1, 2], [3, 4], [5, 6, 7, 8, 9, 10, 11, 12], [13], [], []];
  function s1(t, c) { const { k, u } = c;
    const shown = k === 0 ? lerp(0, 3, E(u, 0.2, 1.4)) : lerp(SHOWN[k - 1], SHOWN[k], E(u, 0.2, 1.6));
    const box = codeBox(24, 22, 500, SCHEMA, { shown, hl: HL1[k], hlU: E(u, 0.1, 0.7), fs: 14, lh: 20.6, op: k === 5 ? 0.45 : 1, stroke: k === 5 ? GRID : INK });
    if (k <= 3) { // 오른쪽: 도구 카드가 칸마다 채워진다
      el('rect', { x: 560, y: 22, width: 376, height: 372, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      el('rect', { x: 560, y: 22, width: 376 * on(c, 0, 0.2, 0.9), height: 44, rx: 14, fill: INK });
      mono(578, 50, '"type": "function"', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: on(c, 0, 0.8, 0.4) });
      tx(918, 50, '도구 한 개 봉투', { 'font-size': 13.5, fill: PANEL, 'text-anchor': 'end', opacity: on(c, 0, 1.1, 0.4) });
      tx(580, 96, 'name', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: on(c, 1, 0.2) });
      if (k === 1) fly(300, box.ly(3), 690, 124, seg(u, 0.3, 1.2), '"calculator"', { mono: true });
      mono(580, 128, 'calculator', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: on(c, 1, 1.1, 0.3) });
      tx(580, 162, 'description', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: on(c, 1, 0.2) });
      const d1 = '사칙연산이 필요할 때 호출.', d2 = '수식 문자열을 받아 결과를 반환한다.', ty = k > 1 ? 1 : k === 1 ? seg(u, 1.2, 2.4) : 0;
      tx(580, 186, d1.slice(0, Math.round(d1.length * clamp(ty * 2))), { 'font-size': 15 });
      tx(580, 208, d2.slice(0, Math.round(d2.length * clamp(ty * 2 - 1))), { 'font-size': 15 });
      tx(580, 244, 'parameters', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: on(c, 2, 0.2) });
      pill(640, 270, 'expression', INFO, pon(c, 2, 0.5), { mono: true });
      mono(712, 275, ': string', { 'font-size': 15, fill: INK, opacity: on(c, 2, 0.9) });
      pill(700, 306, "예: '120 * 3 + 50'", ACC, pon(c, 2, 1.4), { mono: true, fs: 13.5 });
      if (k >= 3) { const a = on(c, 3, 0.2, 0.4);
        tx(571, 277, '★', { 'font-size': 18, fill: BAD, 'text-anchor': 'middle', opacity: a, 'font-weight': 800 }); tx(842, 275, 'required', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: a });
        const b = on(c, 3, 1.0, 0.4); mono(580, 358, 'calculator( )', { 'font-size': 16, fill: MUT, opacity: b, 'text-decoration': 'line-through' });
        cross(710, 352, 9, pon(c, 3, 1.3)); tx(730, 358, '인자 빠진 호출이 줄어든다', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: on(c, 3, 1.5) }); }
      return; }
    if (k === 4) { // 세 조각 괄호
      [[3, 3, 'name', '부를 때 쓰는 이름', INFO], [4, 4, 'description', '언제 쓸지 고르는 근거', ACC], [5, 14, 'parameters', '인자의 타입과 필수 여부', GOOD]].forEach(([a, b, n, d, col], i) => {
        const y0 = box.ly(a) - 9, y1 = box.ly(b) + 9, g = E(u, 0.2 + i * 0.45, 0.8 + i * 0.45), x = 534;
        el('path', { d: `M${x},${y0} h10 V${lerp(y0, y1, g)} h-10`, fill: 'none', stroke: col, 'stroke-width': 3, opacity: g > 0 ? 1 : 0 });
        const cy = (y0 + y1) / 2, ly = [70, 150, 250][i]; grow(x + 12, cy, 612, ly, seg(u, 0.5 + i * 0.45, 0.9 + i * 0.45), col, { plain: true });
        pill(680, ly, n, col, pop(u, 0.8 + i * 0.45), { mono: true }); tx(750, ly + 5, d, { 'font-size': 14.5, opacity: fade(u, 1.0 + i * 0.45) }); });
      tx(730, 380, '도구가 몇 개든 이 세 칸이 반복된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) });
      return; }
    // k5: LLM 이 보는 것 / 우리 쪽에만 있는 것
    llmBox(730, 74, t, { s: pop(u, 0.2), label: '명세 JSON만 읽는다', lop: fade(u, 0.6) });
    el('line', { x1: 548, y1: 168, x2: 940, y2: 168, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 6', opacity: fade(u, 0.8) });
    tx(940, 160, 'LLM에게 보내지 않음', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.9) });
    codeBox(548, 186, 392, ['def calculator(expression):', '    return eval(expression,', '        {"__builtins__": {}}, {})'], { py: true, fs: 14, title: 'execute.py (우리 서버)', shown: lerp(0, 3, E(u, 1.1, 2.2)) });
    lock(916, 206, true, INK, pop(u, 1.0));
    grow(524, 120, 640, 90, seg(u, 0.4, 1.0), ACC); }

  // ---------- 2. 요청에 tools 를 싣는다 ----------
  const Q1 = '사과 120원짜리 3개와 50원 봉지값은?';
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: 파일 → dict
    card(92, 52, 150, 48, { rx: 8, text: 'tool-schema.json', fs: 13.5, mono: true, stroke: GRID, s: pon(c, 0, 0.2) });
    grow(170, 52, 268, 52, k > 0 ? 1 : seg(u, 0.6, 1.2), MUT); mono(219, 40, 'json.load', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: on(c, 0, 0.7) });
    card(370, 52, 190, 48, { rx: 8, text: 'calculator_tool', fs: 14, mono: true, stroke: ACC, fill: ACCBG, s: pon(c, 0, 1.2) });
    pill(495, 52, 'dict', GOOD, pon(c, 0, 1.6), { mono: true, fs: 13.5 });
    // tools 배열
    if (k >= 1) { const a = on(c, 1, 0.1, 0.4); mono(24, 128, 'tools = [', { 'font-size': 15, 'font-weight': 700, opacity: a });
      [0, 1, 2].forEach((i) => { const x = 116 + i * 132;
        el('rect', { x, y: 106, width: 122, height: 36, rx: 7, fill: i === 0 ? ACCBG : PANEL, stroke: i === 0 ? ACC : GRID, 'stroke-width': 2, 'stroke-dasharray': i === 0 ? null : '5 4', opacity: a });
        if (i > 0) tx(x + 61, 129, '빈 자리', { 'font-size': 13.5, fill: OFF, 'text-anchor': 'middle', opacity: a }); });
      if (k === 1) fly(370, 52, 177, 124, seg(u, 0.4, 1.4), 'calculator_tool', { mono: true });
      mono(177, 129, 'calculator_tool', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: on(c, 1, 1.4, 0.3) });
      mono(512, 129, ']', { 'font-size': 15, 'font-weight': 700, opacity: a }); }
    // messages
    if (k >= 2) { mono(24, 182, 'messages', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: on(c, 2, 0.1) });
      const H = k === 4 && u > 0.3 ? { fill: ACC, 'font-weight': 800 } : {};
      msgRow(24, 192, 500, 'user', Q1, { u: k > 2 ? 1 : seg(u, 0.3, 1.5), sans: true, fs: 14.5, parts: [['사과 ', {}], ['120원', H], ['짜리 ', {}], ['3개', H], ['와 ', {}], ['50원', H], [' 봉지값은?', {}]] }); }
    llmBox(780, 150, t, { state: k >= 2 && k <= 4 ? 'think' : null, s: pon(c, 0, 0.6), label: k >= 2 && k <= 4 ? '추론 중' : k === 5 ? 'JSON만 돌려준다' : '대기', lcol: k >= 2 && k <= 4 ? ACC : MUT });
    // 요청 묶음
    if (k >= 3) { const a = on(c, 3, 0.1, 0.5);
      codeBox(24, 246, 470, ['client.chat.completions.create(', '    model="gpt-4o",', '    messages=messages,  # 1개', '    tools=tools,        # 1개', '    tool_choice="auto")'],
        { py: true, fs: 14, lh: 21, op: a, hl: k === 3 ? [3, 4] : [], hlU: E(u, 0.5, 1.1) });
      if (k === 3) { dot([[494, 320], [620, 320], [700, 190]], seg(u, 1.2, 2.3), ACC, 8); fly(494, 320, 700, 190, seg(u, 1.2, 2.4), 'messages + tools', { mono: true }); }
      if (k > 3 || (k === 3 && u > 2.3)) pill(780, 96, 'tools: calculator', ACC, k === 3 ? pop(u, 2.3) : 1, { mono: true, fs: 13.5 }); }
    if (k === 4) { // 질문 숫자와 description 을 잇는다
      el('path', { d: 'M300,226 C420,250 560,236 700,180', fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      card(830, 236, 210, 34, { rx: 8, text: '사칙연산이 필요할 때 호출', fs: 13.5, stroke: ACC, s: pop(u, 0.9) }); }
    if (k >= 4) { const a = on(c, 4, 1.3, 0.5);
      codeBox(520, 280, 420, ['"finish_reason": "tool_calls",', '"tool_calls": [{ "function": {', '  "name": "calculator",', '  "arguments": "{\\"expression\\": …}" }}]'],
        { fs: 14, lh: 21, op: a, stroke: ACC, title: 'response.choices[0]', tcol: ACC, shown: k === 4 ? lerp(0, 4, E(u, 1.4, 2.6)) : 4 });
    }
    if (k === 5) { cross(898, 152, 11, pop(u, 0.4)); tx(898, 128, '실행', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      lock(560, 230, true, INK, pop(u, 1.0)); tx(582, 236, '실행 권한은 우리 코드에', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); } }

  // ---------- 3. tool_call 을 받아 우리 코드가 실행 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 6) { // 통제 지점: JSON 과 실행 사이의 관문
      llmBox(110, 70, t, { op: 0.5 }); mono(250, 76, '{"name": "calculator", …}', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.2) });
      const ys = 200; el('line', { x1: 60, y1: ys, x2: 900, y2: ys, stroke: GRID, 'stroke-width': 3 });
      card(110, ys, 150, 46, { rx: 8, text: 'tool_call JSON', fs: 14, mono: true, stroke: ACC, fill: ACCBG });
      [['인자 검증', 300], ['rate-limit', 470], ['권한 체크', 640]].forEach(([s, x], i) => { const g = pop(u, 0.4 + i * 0.35);
        el('rect', { x: x - 10, y: ys - 44 * g, width: 20, height: 88 * g, rx: 4, fill: WARN, opacity: 0.85 }); tx(x, ys + 66, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.5 + i * 0.35) }); });
      card(820, ys, 160, 46, { rx: 8, text: 'func(**args)', fs: 15, mono: true, stroke: GOOD, fill: GOODBG });
      dot([[185, ys], [740, ys]], seg(u, 1.5, 2.6), ACC, 8);
      el('path', { d: 'M196,92 C420,60 700,110 800,176', fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.6) }); cross(520, 86, 10, pop(u, 1.8));
      tx(520, 128, 'LLM이 함수를 바로 부르는 길은 없다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(480, 330, '검증·제한·권한을 끼울 자리가 바로 이 사이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // 위: LLM 과 함수 본문 사이에 벽
    llmBox(100, 64, t, { op: k === 0 ? 1 : 0.6, w: 150, h: 64, state: null });
    codeBox(510, 20, 430, ['def calculator(expression: str) -> float:', '    """수식을 평가해 결과를 반환한다."""', '    return eval(expression, {"__builtins__": {}}, {})'],
      { py: true, fs: 13.5, lh: 21, title: 'execute.py', shown: k === 0 ? lerp(0, 3, E(u, 0.2, 1.4)) : 3, stroke: k === 4 ? GOOD : GRID, sw: k === 4 ? 2.5 : 1.5 });
    if (k === 0) { el('line', { x1: 300, y1: 24, x2: 300, y2: 110, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
      tx(400, 146, '본 적 없음', { 'font-size': 15, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    // dispatch 표
    if (k >= 1) { const a = on(c, 1, 0.1, 0.4); tx(510, 148, 'TOOL_FUNCTIONS', { 'font-size': 14, class: 'mono', 'font-weight': 700, fill: MUT, opacity: a });
      card(600, 178, 170, 36, { rx: 7, text: '"calculator"', fs: 14.5, mono: true, stroke: INFO, op: a }); grow(690, 178, 760, 178, on(c, 1, 0.4, 0.5), INK);
      card(850, 178, 170, 36, { rx: 7, text: 'calculator', fs: 14.5, mono: true, stroke: GOOD, fill: GOODBG, op: a });
      if (k === 1) { pill(600, 226, '"표에 없는 이름"', BAD, pop(u, 1.0), { mono: true, fs: 13.5 }); cross(712, 226, 9, pop(u, 1.4)); mono(732, 231, 'KeyError', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) }); } }
    // tool_call JSON
    if (k >= 2) { const a = on(c, 2, 0.6, 0.4);
      if (k === 2) fly(100, 100, 220, 150, seg(u, 0.1, 0.9), 'tool_calls', { mono: true });
      codeBox(20, 120, 470, ['{', '  "name": "calculator",', '  "arguments": "{\\"expression\\": \\"120 * 3 + 50\\"}"', '}'],
        { fs: 13.5, lh: 21, title: 'response…message.tool_calls[0].function', tcol: ACC, stroke: ACC, sw: 2, op: a, hl: k === 3 ? [1, 2] : [], hlU: E(u, 0.2, 0.8) }); }
    // 이름과 인자 분해
    if (k >= 3) { const a = on(c, 3, 0.6, 0.5);
      mono(24, 280, 'name = "calculator"', { 'font-size': 15, opacity: a }); pill(260, 275, 'str', MUT, pon(c, 3, 0.8), { mono: true, fs: 13.5 });
      mono(24, 316, 'args = json.loads(arguments)', { 'font-size': 15, opacity: on(c, 3, 1.1) });
      mono(44, 348, '→ {"expression": "120 * 3 + 50"}', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: on(c, 3, 1.6) }); pill(400, 343, 'dict', GOOD, pon(c, 3, 1.9), { mono: true, fs: 13.5 }); }
    // 실행: 계산이 한 단계씩 줄어든다
    if (k >= 4) { const y = 262, st = k > 4 ? 3 : 1 + Math.floor(clamp((u - 0.7) / 0.6, 0, 2));
      if (k === 4) dot([[420, 348], [480, 300], [560, 262]], seg(u, 0.1, 0.7), ACC, 7);
      mono(520, y + 5, 'func(**args)', { 'font-size': 14.5, fill: MUT });
      const vals = ['120 * 3 + 50', '360 + 50', '410'];
      vals.slice(0, st).forEach((v, i) => { const x = [640, 784, 888][i]; if (i) grow(x - 30, y, x - 8, y, 1, MUT);
        mono(x, y + 5, v, { 'font-size': i === 2 ? 22 : 15, 'font-weight': i === 2 ? 800 : 600, fill: i === 2 ? GOOD : INK }); });
      if (st === 3) mono(870, 296, 'result = 410', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 2.0) : 1 }); }
    if (k >= 5) R.terminal(510, 318, 430, 82, ['$ python execute.py', "[calculator] {'expression': '120 * 3 + 50'} → 410"], k === 5 ? lerp(0, 2, E(u, 0.3, 1.8)) : 2, { fs: 13.5, title: 'log' }); }

  // ---------- 4. 결과를 messages 에 싣고 다시 부른다 ----------
  const FA4 = '사과 3개와 봉지값을 합치면 총 410원입니다.';
  function s4(t, c) { const { k, u } = c;
    if (k >= 4) { // 한 바퀴 고리
      const cx = 480, cy = 212, rx = 330, ry = 150, st = [['질문', Q1.slice(0, 9) + '…', INFO], ['LLM', '1번째 호출', INK], ['tool_call', 'calculator(…)', ACC], ['우리 코드', 'eval → 410', GOOD], ['role=tool', '"410"', GOOD], ['LLM', '2번째 호출', INK], ['답변', '총 410원', INFO]];
      const P = st.map((_, i) => { const a = Math.PI + (i / st.length) * Math.PI * 2; return [cx + rx * Math.cos(a) * 1, cy + ry * Math.sin(a) * 1]; });
      el('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': k === 5 ? '8 6' : null });
      dot(P.slice(), k === 4 ? seg(u, 1.0, 2.7) : (t * 0.25) % 1, ACC, 8);
      st.forEach(([a, b, col], i) => { const s = k === 4 ? pop(u, 0.15 + i * 0.22) : 1; card(P[i][0], P[i][1], 168, 54, { rx: 10, stroke: col, sw: 2, s });
        tx(P[i][0], P[i][1] - 4, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: s }); mono(P[i][0], P[i][1] + 17, b, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: s }); });
      if (k === 5) { el('path', { d: `M${P[5][0] + 86},${P[5][1]} C950,${P[5][1] + 10} 950,${P[2][1] - 10} ${P[2][0] + 88},${P[2][1]}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', 'marker-end': 'url(#ra-ahb)', opacity: fade(u, 0.6) });
        tx(cx, 410, '더 필요하면 tool_calls를 또 내고 같은 왕복을 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) }); }
      banner(cx, cy, k === 4 ? 'LLM 호출 2번 · 함수 실행 1번' : 'Tool Use 한 사이클', k === 4 ? pop(u, 2.2) : pop(u, 1.4)); return; }
    mono(24, 36, 'messages', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    msgRow(24, 48, 590, 'user', Q1, {});
    msgRow(24, 92, 590, 'assistant', '', { u: k === 0 ? seg(u, 0.3, 1.5) : 1, parts: [['tool_calls: ', { fill: MUT }], ['calculator', { fill: ACC, 'font-weight': 700 }], ['(…)', {}], ['  id=call.id', { fill: INFO, 'font-weight': 700 }]] });
    if (k === 0) tx(24, 160, '이 줄이 빠지면 뒤에 오는 tool 메시지가 짝을 잃어 에러가 난다', { 'font-size': 14.5, fill: BAD, 'font-weight': 600, opacity: fade(u, 1.6) });
    if (k >= 1) { msgRow(24, 136, 590, 'tool', '', { u: k === 1 ? seg(u, 0.3, 1.4) : 1, parts: [['tool_call_id=call.id', { fill: INFO, 'font-weight': 700 }], ['  content: ', { fill: MUT }], ['"410"', { fill: GOOD, 'font-weight': 800 }]] });
      const g = on(c, 1, 1.4, 0.6); el('path', { d: 'M614,109 h18 V153 h-18', fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: g }); tx(640, 136, '같은 id로 짝', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: g });
      if (k === 1) { card(850, 150, 150, 44, { rx: 8, text: 'result = 410', fs: 15, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 0.2) }); fly(850, 150, 560, 153, seg(u, 0.6, 1.4), '"410"', { fill: GOOD, mono: true }); } }
    llmBox(820, 290, t, { state: k === 2 ? 'think' : null, label: k >= 2 ? '답변 생성' : '대기', lcol: k >= 2 ? ACC : MUT, op: k >= 2 ? 1 : 0.5 });
    if (k >= 2) { const a = on(c, 2, 0.1, 0.4); el('rect', { x: 16, y: 42, width: 606, height: 132, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: a });
      codeBox(24, 226, 470, ['second = client.chat.completions.create(', '    model="gpt-4o",', '    messages=messages,  # 3개', '    tools=tools)'], { py: true, fs: 14, lh: 21, op: a, hl: k === 2 ? [2, 3] : [] });
      if (k === 2) dot([[622, 110], [700, 200], [735, 280]], seg(u, 0.8, 2.0), ACC, 8); }
    if (k >= 3) { msgRow(24, 180, 590, 'assistant', FA4, { u: k === 3 ? seg(u, 0.9, 2.2) : 1, hot: k === 3 });
      if (k === 3) fly(560, 153, 410, 197, seg(u, 0.2, 1.0), '410', { fill: GOOD, mono: true }); } }

  // ---------- 5. 도구 여러 개 ----------
  const QA = '오늘 환율로 100달러는 한국 돈 얼마?', QB = '그리고 지난주 매출도 알려줘';
  const TOOLS5 = [['calculator', '사칙연산이 필요할 때', 20], ['web_search', '최신 정보(환율/뉴스 등) 검색', 335], ['db_query', '사내 DB의 매출/고객 데이터 조회', 650]];
  function s5(t, c) { const { k, u } = c, split = k === 0 ? E(u, 0.8, 1.6) : 1;
    // 질문이 둘로 쪼개진다
    const qa = [250 - 20 * (1 - split), 40], qb = [708 + 20 * (1 - split), 40];
    card(lerp(480, qa[0], split), 40, tw(QA, 15) + 30, 38, { rx: 19, text: QA, fs: 15, stroke: INFO, fill: INFOBG, color: INK, s: k === 0 ? pop(u, 0.2) : 1 });
    card(lerp(480, qb[0], split), 40, tw(QB, 15) + 30, 38, { rx: 19, text: QB, fs: 15, stroke: INFO, fill: INFOBG, color: INK, op: k === 0 ? fade(u, 0.8) : 1 });
    sub(qa[0], 76, '환율 조회 + 계산', on(c, 0, 1.6)); sub(qb[0], 76, '매출 집계', on(c, 0, 1.8));
    // tools 배열의 세 칸
    TOOLS5.forEach(([n, d, x], i) => { const appear = i === 0 ? 1 : on(c, i + 1, 0.2, 0.6), y = 92, w = 290;
      el('rect', { x, y, width: w, height: 100, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      if (appear <= 0) { tx(x + w / 2, y + 56, `tools[${i}]`, { 'font-size': 14, fill: OFF, 'text-anchor': 'middle', class: 'mono' }); return; }
      const hot = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i === 2) || k === 7;
      el('rect', { x, y: y + (1 - appear) * 40, width: w, height: 100, rx: 10, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : INK, 'stroke-width': 2, opacity: appear });
      mono(x + 14, y + 28, n, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: appear });
      tx(x + 14, y + 56, d, { 'font-size': 14, opacity: appear, fill: k === 7 ? INK : MUT, 'font-weight': k === 7 ? 700 : 400 });
      if (k === 1 && i === 0) pill(x + 226, y + 26, 'Step 1 명세', MUT, pop(u, 0.5), { fs: 13.5 });
      if (k >= 4) { const m = on(c, 4, 0.2 + i * 0.3, 0.4); mono(x + 14, y + 86, `TOOL_FUNCTIONS["${n}"]`, { 'font-size': 13.5, fill: GOOD, opacity: m }); check(x + 268, y + 81, 7, m); } });
    if (k === 2 || k === 3) { const [from, to] = k === 2 ? [[150, 60], [470, 92]] : [[708, 60], [790, 92]]; grow(from[0], from[1], to[0], to[1], seg(u, 0.8, 1.5), ACC); }
    if (k === 4) tx(480, 222, '키 하나라도 schema 이름과 다르면 그 이름을 부르는 순간 KeyError', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.4) });
    // 응답과 실행 결과
    if (k >= 5) { const a = on(c, 5, 0.1, 0.4), MC = (c.beat.multiCalls || c.steps[c.steps.length - 1].multiCalls);
      el('rect', { x: 20, y: 206, width: 920, height: 128, rx: 10, fill: SOFT, stroke: ACC, 'stroke-width': 1.8, opacity: a });
      tx(34, 228, '1차 응답 tool_calls (2개)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: a });
      tx(34, 316, '2차 응답 tool_calls (1개)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: k >= 6 ? on(c, 6, 1.4) : 0 });
      const rows = [[MC[0], 252], [MC[1], 280], [MC[2], 312]];
      rows.forEach(([m, y], i) => { const show = i < 2 ? on(c, 5, 0.5 + i * 0.4, 0.4) : on(c, 6, 1.6, 0.4); if (show <= 0) return;
        const arg = m.tool === 'db_query' ? '{"sql": "SELECT SUM(amt) … week=-1"}' : JSON.stringify(m.args).replace(/":/g, '": ').replace(/,"/g, ', "');
        spans(i < 2 ? 34 : 250, y + 5, [[m.tool, { fill: ACC, 'font-weight': 700 }], ['(' + arg + ')', {}]], { 'font-size': 14, opacity: show });
        const r = i < 2 ? on(c, 6, 0.3 + i * 0.4, 0.4) : on(c, 6, 2.1, 0.4);
        if (r > 0) mono(925, y + 5, '→ ' + m.result, { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: r }); });
      if (k === 5) for (let i = 0; i < 2; i++) dot([[480, 206], [480, 252 + i * 28]], seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3), ACC, 6);
      if (k >= 6) mono(925, 228, '결과 값은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: on(c, 6, 1.1, 0.4) }); }
    if (k === 6) tx(480, 372, '환율을 알아야 곱할 수 있으니 calculator는 다음 응답에서 불린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.2) });
    if (k === 7) { msgRow(20, 348, 920, 'assistant', c.beat.finalAnswer || '', { u: seg(u, 0.3, 1.6), fs: 14.5 });
      tx(480, 408, '세 도구 중 무엇을 부를지는 description 한 줄이 가른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); } }

  // 장면마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'LLM이 calculator를 부를지 말지 정할 때 읽는 것은 무엇인가?',
      o: ['execute.py에 있는 calculator 함수 본문', 'name·description·parameters로 된 명세 JSON', '지난번에 calculator를 부른 기록'], a: 1,
      why: '함수 본문은 우리 서버에만 있고 LLM에게 가지 않는다. LLM은 명세 JSON, 특히 description 문장만 보고 호출 여부와 인자를 정한다.' },
    { q: 'tools를 실어 요청을 보낸 뒤, 계산이 필요하다고 본 모델이 돌려주는 것은 무엇인가?',
      o: ['계산을 끝낸 값 410', 'calculator를 이 인자로 불러 달라는 tool_calls JSON', 'calculator 함수의 파이썬 코드'], a: 1,
      why: '모델은 실행하지 않고 호출 의도만 JSON으로 돌려준다. finish_reason이 "tool_calls"이고, 실행 권한은 우리 코드에 남는다.' },
    { q: 'tool_call의 arguments를 func(**args)에 넣기 전에 json.loads를 하는 이유는 무엇인가?',
      o: ['arguments가 문자열로 오기 때문에', '값을 암호화해서 보내기 때문에', 'LLM이 계산을 이미 끝냈기 때문에'], a: 0,
      why: 'arguments는 "{\\"expression\\": …}" 같은 문자열이다. json.loads로 dict를 만들어야 키워드 인자로 풀 수 있다.' },
    { q: '실행 결과 410을 모델에게 돌려줄 때 어느 요청의 결과인지 묶어 주는 것은 무엇인가?',
      o: ['content 안의 숫자', 'tool 메시지의 tool_call_id', '두 번째 호출의 model 이름'], a: 1,
      why: 'role="tool" 메시지의 tool_call_id가 앞 assistant 메시지의 call.id와 짝을 이룬다. 그 assistant 메시지를 빠뜨리면 짝이 안 맞아 에러가 난다.' },
    { q: '도구가 calculator·web_search·db_query 셋일 때 모델이 맞는 도구를 고르게 하는 가장 큰 요인은 무엇인가?',
      o: ['tools 배열에 넣은 순서', '함수 이름의 길이', '각 도구의 description 문장'], a: 2,
      why: '환율 질문은 "최신 정보(환율/뉴스 등) 검색", 매출 질문은 "사내 DB의 매출 조회" 설명에 붙는다. 도구가 늘수록 설명 품질이 정확도를 가른다.' },
  ];

  const summary = [
    'LLM은 함수를 실행할 수 없어서, 도구를 쓰려면 이름과 쓰임과 인자를 적은 명세 JSON을 함께 보낸다.',
    '모델은 description을 보고 도구를 고른 뒤 실행 대신 tool_calls JSON으로 호출을 요청한다.',
    '우리 코드가 arguments를 풀어 함수를 돌리고, 결과 410을 role tool 메시지로 다시 보낸다.',
    '두 번째 호출에서 모델이 410을 문장으로 다듬고, 도구가 여럿이면 description이 선택을 가른다.',
  ];
  const review = [
    { q: '모델이 calculator 대신 web_search를 자꾸 부른다. 먼저 고칠 곳은?',
      o: ['TOOL_FUNCTIONS의 순서', '두 도구의 description 문장', 'tool_choice를 지우기'], a: 1,
      why: '모델은 함수 본문이 아니라 명세의 description을 보고 고른다. 언제 쓰는 도구인지 문장을 분명히 고치는 것이 먼저다.' },
    { q: '두 번째 호출에서 tool_call_id에 맞는 요청이 없다는 에러가 났다. 가장 먼저 의심할 것은?',
      o: ['messages에 assistant의 tool_call 메시지를 넣지 않았다', 'eval 결과가 문자열이 아니었다', 'gpt-4o 대신 다른 모델을 썼다'], a: 0,
      why: 'role tool 메시지는 앞 assistant 메시지의 call.id와 짝을 이뤄야 한다. 그 줄을 빠뜨리면 결과가 어느 요청의 답인지 묶이지 않는다.' },
    { q: '환율과 매출을 묻자 모델이 web_search와 db_query를 한 응답에 함께 요청했다. 다음 행동으로 맞는 것은?',
      o: ['첫 번째만 실행하고 나머지는 버린다', '두 요청을 각각 실행해 결과 두 개를 모두 messages에 붙이고 다시 부른다', '결과를 합쳐 사용자에게 바로 보여 준다'], a: 1,
      why: '같은 dispatch를 요청 수만큼 돌리고 결과를 모두 돌려줘야 모델이 이어서 계산하거나 답을 만든다. 환율을 본 뒤에야 calculator로 138000을 구한다.' },
  ];

  R.page({ title: 'Tool Use — 명세·요청·실행·결과', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
