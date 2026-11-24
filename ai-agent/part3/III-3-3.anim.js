/* III-3-3 Tool Use + ReAct 통합 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * Agent 의 세 부품, ReAct 고리(Thought → Action → Observation), 쌓이는 messages, 호출마다 보내는 messages 수를 그린다.
 * messages 수 1·3·5개, LLM 3회·도구 2회, 33줄(빈 줄·주석 빼면 27줄), 도구 결과 JSON 은 파이썬(가짜 client)으로 확인했다. Thought 문장은 예시. */
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

  const Q = '서울 날씨 보고, 비 오면 실내 데이트 코스 추천해줘';
  const OBS1 = '{"city": "서울", "temp": 18, "condition": "비", "rain_prob": 80}';
  const PLACES = ['코엑스 아쿠아리움', '국립중앙박물관', '롯데월드', '북서울미술관'];
  const B = { 'font-weight': 700 }, M = { fill: MUT }, A = { fill: ACC, 'font-weight': 700 }, G = { fill: GOOD, 'font-weight': 700 };
  // 대화 기록 여섯 칸 (Anthropic 형식: tool_result 는 user 역할)
  const MSGS = [
    ['user', Q, null],
    ['assistant', '', [['text ', M], ['날씨부터 확인  ', {}], ['tool_use ', M], ['get_weather', A]]],
    ['user', '', [['tool_result ', M], ['{"city": "서울", …, "rain_prob": 80}', G]]],
    ['assistant', '', [['text ', M], ['실내 코스 검색  ', {}], ['tool_use ', M], ['search', A]]],
    ['user', '', [['tool_result ', M], ['["코엑스 아쿠아리움", …]', G]]],
    ['assistant', '오늘 서울은 비(18°C, 강수 80%)입니다. 실내 코스는…', null],
  ];
  function msgs(x, y, w, n, o) { o = o || {}; const gap = o.gap || 42;
    for (let i = 0; i < Math.ceil(n); i++) { const [r, txt, parts] = MSGS[i];
      msgRow(x, y + i * gap, w, r, txt, { u: i === Math.ceil(n) - 1 && n % 1 ? n % 1 : 1, parts, sans: true, fs: o.fs || 14, h: o.h, hot: o.hot === i, op: o.dim && o.dim(i) ? 0.45 : 1 }); } }
  // ReAct 고리: Thought → Action → Observation
  const RG = { cx: 730, cy: 214, r: 118 };
  const RN = [['Thought', '추론', -90], ['Action', '도구 호출', 30], ['Observation', '결과 받기', 150]];
  const rpos = (i) => { const a = RN[i][2] * Math.PI / 180; return [RG.cx + RG.r * Math.cos(a), RG.cy + RG.r * Math.sin(a)]; };
  function ring(t, lit, center, o) { o = o || {}; const op = o.op ?? 1;
    el('circle', { cx: RG.cx, cy: RG.cy, r: RG.r, fill: 'none', stroke: GRID, 'stroke-width': 4, opacity: op });
    for (let i = 0; i < 3; i++) { const a0 = (RN[i][2] + 22) * Math.PI / 180, a1 = (RN[(i + 1) % 3][2] - 22 + (i === 2 ? 360 : 0)) * Math.PI / 180;
      el('path', { d: `M${RG.cx + RG.r * Math.cos(a0)},${RG.cy + RG.r * Math.sin(a0)} A${RG.r},${RG.r} 0 0 1 ${RG.cx + RG.r * Math.cos(a1)},${RG.cy + RG.r * Math.sin(a1)}`, fill: 'none', stroke: MUT, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: op }); }
    RN.forEach(([n, d], i) => { const [x, y] = rpos(i), on1 = lit === i || (Array.isArray(lit) && lit.includes(i)), s = o.s ? o.s(i) : 1;
      card(x, y, 150, 50, { rx: 12, stroke: on1 ? ACC : INK, sw: on1 ? 3 : 2, fill: on1 ? ACCBG : PANEL, s, op });
      tx(x, y - 3, n, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: on1 ? ACC : INK, opacity: op * s }); tx(x, y + 17, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op * s }); });
    if (center) { mono(RG.cx, RG.cy + 2, center[0], { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: op });
      if (center[1]) mono(RG.cx, RG.cy + 24, center[1], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); }
    if (o.dot != null) { const a = (-90 + 360 * o.dot) * Math.PI / 180; if (o.dot > 0 && o.dot < 1) el('circle', { cx: RG.cx + RG.r * Math.cos(a), cy: RG.cy + RG.r * Math.sin(a), r: 8, fill: ACC }); } }
  // 생각 말풍선 (모델 출력 예시)
  function thought(x, y, s, a) { if (a <= 0) return; const w = tw(s, 14.5) + 30;
    card(x, y, w, 36, { rx: 18, stroke: ACC, fill: PANEL, s: a, sw: 2, dash: '5 3' }); tx(x, y + 5, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 600, opacity: a });
    tx(x - w / 2 - 8, y + 5, '예시', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT, opacity: a }); }
  // 호출마다 보낸 messages 수 막대
  function sendBars(x, y, vals, u0) { tx(x, y, 'LLM 호출마다 보낸 messages', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    vals.forEach((v, i) => { const yy = y + 14 + i * 28; mono(x, yy + 14, `${i + 1}번째`, { 'font-size': 13.5, fill: MUT });
      R.hbar(x + 70, yy, 180, v, 6, { h: 18, u: u0 == null ? 1 : clamp(u0 * vals.length - i), text: v + '개' }); }); }

  // ---------- 1. Agent 조립 ----------
  function s1(t, c) { const { k, u } = c;
    el('rect', { x: 24, y: 24, width: 912, height: 300, rx: 16, fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
    mono(44, 52, 'Agent', { 'font-size': 17, 'font-weight': 800 });
    const SK = [[44, '1 두뇌 · LLM', 0], [340, '2 도구 · TOOLS', 1], [636, '3 매뉴얼 · SYSTEM', 4]];
    SK.forEach(([x, name, from]) => { const filled = k >= from; el('rect', { x, y: 70, width: 280, height: 236, rx: 12, fill: filled ? PANEL : 'none', stroke: filled ? INK : OFF, 'stroke-width': 2, 'stroke-dasharray': filled ? null : '7 5' });
      tx(x + 14, 94, name, { 'font-size': 15, 'font-weight': 800, fill: filled ? INK : OFF }); });
    // 1 두뇌
    mono(58, 132, 'client = Anthropic()', { 'font-size': 15, opacity: on(c, 0, 0.3) });
    pill(160, 170, 'MODEL = "claude-sonnet-4-5"', ACC, pon(c, 0, 0.9), { mono: true, fs: 13.5 });
    if (k === 0) tx(184, 240, '아직 쓸 수 있는 도구가 없다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 600, opacity: fade(u, 1.6) });
    // 2 도구
    if (k >= 1) { const a = on(c, 1, 0.2, 0.6); el('rect', { x: 354, y: 108 - 20 * (1 - a), width: 252, height: k >= 2 ? 104 : 64, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: a });
      mono(366, 132, 'get_weather', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: a }); tx(366, 156, '특정 도시의 현재 날씨를 조회한다', { 'font-size': 13.5, opacity: on(c, 1, 0.8) }); }
    if (k >= 2) { const a = on(c, 2, 0.3, 0.5); spans(366, 186, [['input_schema: ', M], ['city', { fill: INFO, 'font-weight': 700 }], [': string', {}]], { 'font-size': 14, opacity: a });
      tx(366, 204, '★ required', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: on(c, 2, 1.0) }); }
    if (k >= 3) { const a = on(c, 3, 0.2, 0.6); el('rect', { x: 354, y: 222 + 20 * (1 - a), width: 252, height: 64, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: a });
      mono(366, 246, 'search', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: a }); tx(366, 270, '웹 검색 결과 목록을 돌려준다', { 'font-size': 13.5, opacity: on(c, 3, 0.8) });
      pill(560, 246, '1 → 2개', WARN, pon(c, 3, 1.2), { fs: 13.5 }); }
    // 3 매뉴얼
    if (k >= 4) { if (u < 1.0) fly(480, 400, 776, 140, seg(u, 0.1, 0.9), 'system-prompt.md', { mono: true });
      mono(650, 124, 'SYSTEM = open("system-prompt.md")', { 'font-size': 13.5, opacity: fade(u, 0.9) });
      [['1. Thought', '다음에 무엇을 할지 추론'], ['2. Action', '적절한 도구를 호출'], ['3. Observation', '결과를 받아 다음 Thought로']].forEach(([a, b], i) => {
        const y = 162 + i * 46, s = pop(u, 1.0 + i * 0.3); tx(652, y, a, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: s }); tx(652, y + 20, b, { 'font-size': 13.5, opacity: s }); });
      banner(480, 370, 'LLM + 도구 2개 + ReAct 매뉴얼 = 조립 완료', pop(u, 2.0)); } }

  // ---------- 2. 질문 → Thought 1 → 도구 선택 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { // 부품을 루프 파일로
      card(180, 110, 260, 110, { rx: 12, stroke: INK, s: pop(u, 0.1) }); mono(180, 80, 'init.py', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      ['client', 'MODEL', 'TOOLS', 'SYSTEM'].forEach((s, i) => pill(98 + (i % 2) * 150, 112 + Math.floor(i / 2) * 36, s, ACC, pop(u, 0.3 + i * 0.12), { mono: true, fs: 13.5 }));
      card(180, 290, 260, 80, { rx: 12, stroke: INK, s: pop(u, 0.4) }); mono(180, 278, 'tools.py', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.5) });
      pill(180, 308, 'execute_tool', GOOD, pop(u, 0.7), { mono: true, fs: 13.5 });
      card(720, 210, 300, 200, { rx: 14, stroke: ACC, sw: 2.5, s: pop(u, 0.9) }); mono(720, 140, 'loop.py', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      fly(310, 120, 660, 190, seg(u, 1.2, 2.0), 'import client·TOOLS·SYSTEM', { mono: true }); fly(310, 290, 660, 240, seg(u, 1.6, 2.5), 'import execute_tool', { mono: true, fill: GOOD });
      if (u > 2.0) { mono(600, 194, 'from init import …', { 'font-size': 14, opacity: fade(u, 2.0) }); mono(600, 244, 'from tools import …', { 'font-size': 14, opacity: fade(u, 2.3) }); }
      return; }
    mono(20, 34, 'messages', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    msgs(20, 46, 470, k === 1 ? seg(u, 0.2, 1.4) : k >= 5 ? 1 + seg(u, 1.6, 2.6) : 1, { fs: 13.5, hot: k === 5 ? 1 : null });
    if (k >= 2) ring(t, k >= 3 && k <= 4 ? 0 : k === 5 ? 1 : -1, ['step 0', 'for … range(10)'], { s: (i) => (k === 2 ? pop(u, 0.2 + i * 0.25) : 1) });
    if (k === 1) tx(250, 130, '대화 기록 messages의 첫 칸이 출발점이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.4) });
    if (k === 2) tx(250, 130, 'max_iters = 10 · 한 바퀴 = Thought + Action + Observation', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 600, opacity: fade(u, 1.4) });
    if (k === 3) { codeBox(20, 110, 470, ['client.messages.create(model=MODEL, max_tokens=1024,', '    system=SYSTEM, tools=TOOLS,', '    messages=messages)   # 지금 1개'], { py: true, fs: 13.5, lh: 20, op: fade(u, 0.1) });
      dot([[490, 140], [655, 100]], seg(u, 0.6, 1.2), ACC, 8); thought(730, 38, '먼저 서울 날씨를 확인해야 한다', pop(u, 1.4)); }
    if (k === 4) { const cx = 220, cy = 220; el('path', { d: `M${cx},${cy - 44} L${cx + 120},${cy} L${cx},${cy + 44} L${cx - 120},${cy} Z`, fill: WARNBG, stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 0.2) });
      mono(cx, cy + 5, 'stop_reason == "tool_use"?', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.3) });
      grow(cx + 120, cy, 430, cy, seg(u, 0.8, 1.2), ACC); tx(434, cy - 12, '예 → 도구 실행', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.1) });
      grow(cx, cy + 44, cx, 330, seg(u, 1.3, 1.7), MUT); mono(cx, 352, 'return resp.content[-1].text', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: 0.6 * fade(u, 1.6) });
      tx(cx + 14, 296, '아니오', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) }); check(470, 220, 10, pop(u, 1.8)); }
    if (k === 5) { codeBox(20, 140, 470, ['{"type": "tool_use",', ' "name": "get_weather",', ' "input": {"city": "서울"}}'], { fs: 14, lh: 21, title: 'resp.content 의 tool_use 블록', tcol: ACC, stroke: ACC, shown: lerp(0, 3, E(u, 0.2, 1.4)) });
      el('path', { d: 'M490,190 C560,200 600,240 690,262', fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.2) }); } }

  // ---------- 3. 도구 실행 → Observation → Thought 2 ----------
  function s3(t, c) { const { k, u } = c;
    mono(20, 34, 'messages', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k >= 2) pill(160, 30, 'messages 3개', INFO, k === 2 ? pop(u, 1.8) : 1, { fs: 13.5 });
    msgs(20, 46, 470, k < 2 ? 2 : k === 2 ? 2 + seg(u, 1.0, 1.9) : 3, { fs: 13.5, hot: k === 2 ? 2 : null });
    const lit = k <= 1 ? 1 : k === 2 ? 2 : 0;
    ring(t, lit, k >= 3 ? [k === 3 && u < 1.2 ? 'step 0' : 'step 1', 'for … range(10)'] : ['step 0', 'for … range(10)'], { dot: k === 3 ? seg(u, 0.2, 1.2) * (1 / 3) + 2 / 3 : null });
    if (k === 0) { card(255, 200, 300, 44, { rx: 8, text: 'get_weather(city="서울")', fs: 15, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 0.2) });
      tx(255, 250, 'LLM이 준 것은 이름과 인자뿐 · 아직 실행 전', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, 'font-weight': 600, opacity: fade(u, 1.0) }); }
    if (k === 1) { codeBox(20, 160, 470, ['observation = execute_tool(tool_use.name,', '                           tool_use.input)'], { py: true, fs: 14, lh: 21, hl: [0, 1], hlU: E(u, 0.2, 0.8) });
      card(255, 270, 290, 44, { rx: 8, text: 'tools.get_weather("서울")', fs: 14.5, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 0.8) });
      mono(255, 320, OBS1, { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 2) { codeBox(20, 190, 470, ['{"role": "user", "content": [{', '  "type": "tool_result",', '  "tool_use_id": tool_use.id,', '  "content": json.dumps(observation, …)}]}'], { py: true, fs: 13.5, lh: 20, op: fade(u, 0.1), hl: [1] });
      fly(320, 290, 250, 150, seg(u, 0.7, 1.4), 'Observation', { fill: GOOD }); }
    if (k === 3) { sendBars(20, 200, [1, 3], seg(u, 0.4, 1.8)); tx(20, 320, '같은 호출을 다시 하지만, 기록이 쌓여 입력이 길어졌다', { 'font-size': 14.5, 'font-weight': 600, opacity: fade(u, 1.8) }); }
    if (k === 4) { mono(20, 220, 'rain_prob: 80', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
      grow(160, 214, 600, 120, seg(u, 0.6, 1.2), ACC); thought(720, 38, '비 확률 80% → 실내 데이트 코스를 검색해야 한다', pop(u, 1.2));
      tx(20, 290, 'Observation이 다음 Thought의 입력이 된다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); } }

  // ---------- 4. 두 번째 도구 → 최종 답 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 5) { // 루프 끝: 대화 기록 6칸과 최종 답
      mono(20, 34, 'messages (6칸)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      msgs(20, 44, 520, 5 + seg(u, 0.4, 1.4), { fs: 13.5, h: 30, gap: 36, hot: 5 });
      card(745, 70, 360, 46, { rx: 10, stroke: WARN, fill: WARNBG, s: pop(u, 0.2) }); mono(745, 75, 'stop_reason != "tool_use"', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      grow(745, 94, 745, 130, seg(u, 0.6, 0.9), INK); mono(745, 150, 'return resp.content[-1].text', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      sendBars(580, 196, [1, 3, 5], seg(u, 1.0, 2.0));
      tx(20, 290, '오늘 서울은 비(18°C, 강수 80%)입니다.', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(20, 314, '실내 코스: ' + PLACES.join(' / '), { 'font-size': 14.5, opacity: fade(u, 1.8) });
      tx(20, 338, '우산 꼭 챙기세요!', { 'font-size': 14.5, opacity: fade(u, 2.0) }); tx(540, 290, '예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      tx(480, 398, '도구를 다 써서가 아니라 정보가 충분해서 멈춘다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    // 위: tools.py
    codeBox(20, 20, 520, ['def get_weather(city: str) -> dict:', '    # 데모: 하드코딩 — 실제로는 OpenWeather API 호출', '    return {"city": city, "temp": 18,', '            "condition": "비", "rain_prob": 80}'],
      { py: true, fs: 13.5, lh: 20, title: 'tools.py', op: k === 0 ? 1 : 0.5 });
    if (k === 0) { pill(430, 40, 'Cycle 1에서 실행됨', GOOD, pop(u, 0.8), { fs: 13.5 }); tx(280, 190, '평범한 파이썬 함수일 뿐이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    // 오른쪽: TOOL_REGISTRY
    mono(580, 40, 'TOOL_REGISTRY', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    [['"get_weather"', 'get_weather'], ['"search"', 'search']].forEach(([n, f], i) => { const y = 70 + i * 44, hot = k >= 1 && k <= 4 && i === 1;
      card(660, y, 150, 34, { rx: 6, text: n, fs: 13.5, mono: true, stroke: hot ? ACC : INFO, fill: hot ? ACCBG : PANEL }); grow(737, y, 770, y, 1, INK);
      card(850, y, 150, 34, { rx: 6, text: f, fs: 13.5, mono: true, stroke: GOOD, fill: hot && k >= 3 ? GOODBG : PANEL }); });
    if (k >= 1 && k <= 4) { const y = 170; card(300, y, 400, 40, { rx: 8, text: 'search(query="서울 실내 데이트 코스")', fs: 14.5, mono: true, stroke: ACC, fill: ACCBG, s: k === 1 ? pop(u, 0.2) : 1 });
      if (k === 1) grow(500, y, 584, 114, seg(u, 0.8, 1.4), ACC); }
    if (k === 2) { pill(660, 172, 'name not in TOOL_REGISTRY', BAD, pop(u, 0.4), { mono: true, fs: 13.5 }); cross(820, 172, 9, pop(u, 0.8));
      mono(560, 220, 'return {"error": "Unknown tool: …"}', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(300, 260, '없는 이름이면 실행하지 않고 error로 답한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 3) { codeBox(20, 210, 520, ['try:', '    return TOOL_REGISTRY[name](**args)', 'except Exception as e:', '    return {"error": str(e)}'], { py: true, fs: 14, lh: 21, hl: [1], hlU: E(u, 0.2, 0.8) });
      tx(580, 300, '예외도 error dict로 바꿔', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); tx(580, 324, '루프는 계속 돈다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) }); }
    if (k === 4) { tx(20, 236, 'Observation 4건', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
      PLACES.forEach((p, i) => { const s = pop(u, 0.4 + i * 0.3), x = 20 + i * 232; card(x + 108, 290, 216, 50, { rx: 10, stroke: GOOD, fill: GOODBG, s }); tx(x + 108, 296, p, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: s }); });
      tx(480, 370, '이 목록이 Cycle 2의 Observation으로 messages에 붙는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.8) }); } }

  // ---------- 5. 30줄 미니 Agent ----------
  const TL = [['LLM 호출 1', INK], ['get_weather', GOOD], ['LLM 호출 2', INK], ['search', GOOD], ['LLM 호출 3', INK], ['최종 답', ACC]];
  function s5(t, c) { const { k, u } = c;
    // 위: 실제로 돈 순서
    const lit = (i) => (k === 1 ? (i % 2 === 0 && clamp(u * 1.6 - i * 0.4) > 0) : k === 3 ? (i === 1 || i === 3) && clamp(u * 1.6 - i * 0.3) > 0 : k >= 4);
    TL.forEach(([s, col], i) => { const x = 88 + i * 157, hot = lit(i); card(x, 44, 138, 36, { rx: 18, text: s, fs: 14, stroke: hot ? col : GRID, color: hot ? col : MUT, fill: hot ? PANEL : SOFT, sw: hot ? 2.4 : 1.5 }); if (i) grow(x - 88, 44, x - 70, 44, 1, MUT); });
    // 가운데: while True 고리
    const cx = 480, cy = 222, op = 1;
    if (k === 5) return lines33(t, c);
    el('ellipse', { cx, cy, rx: 300, ry: 88, fill: 'none', stroke: GRID, 'stroke-width': 4, opacity: op });
    mono(cx, cy + 6, 'while True:', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: op * (k === 0 ? pop(u, 0.3) : 1) });
    if (k === 4) { const p = (t * 0.3) % 1, a = p * Math.PI * 2 - Math.PI / 2; el('circle', { cx: cx + 300 * Math.cos(a), cy: cy + 88 * Math.sin(a), r: 8, fill: ACC }); }
    const ST = [[cx, cy - 88, 'resp = client.messages.create(…)', 1], [cx + 300, cy, 'messages.append(assistant)', 2], [cx, cy + 88, 'execute_tool(name, input)', 3], [cx - 300, cy, 'messages.append(tool_result)', 4]];
    ST.forEach(([x, y, s, from]) => { if (k < from) return; const a = k === from ? pop(u, 0.2) : 1, hot = k === from;
      card(x, y, tw(s, 13.5) + 28, 40, { rx: 8, text: s, fs: 13.5, mono: true, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, s: a, op }); });
    if (k === 1) mono(cx, cy - 52, 'model="claude-sonnet-4-5", tools=TOOLS', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
    if (k === 2) { pill(cx + 300, cy + 56, 'stop_reason != "tool_use" → return', WARN, pop(u, 0.9), { mono: true, fs: 13.5 }); }
    // 아래: 횟수
    const n1 = k >= 1 ? (k === 1 ? Math.min(3, Math.floor(u * 1.6) + 1) : 3) : 0, n2 = k >= 3 ? (k === 3 ? Math.min(2, Math.floor(u * 1.4) + 1) : 2) : 0;
    if (k < 5) { mono(150, 370, `LLM 호출 ${n1}회`, { 'font-size': 17, 'font-weight': 800, opacity: k >= 1 ? 1 : 0.3, 'text-anchor': 'middle' });
      mono(480, 370, `도구 호출 ${n2}회`, { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: k >= 3 ? 1 : 0.3, 'text-anchor': 'middle' });
      mono(810, 370, 'Cycle 2회', { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      if (k === 0) sub(480, 400, '앞 장의 for 문이 여기서는 while True다', fade(u, 1.2), { 'font-size': 14.5, fill: INK }); return; }
  }
  function lines33(t, c) { const { u } = c;
    const parts = [[2, '주석', OFF], [2, 'import', MUT], [1, '', null], [1, 'client', INFO], [6, 'TOOLS', INFO], [1, '', null], [3, '실행 함수', GOOD], [1, '', null], [14, 'run_agent 루프', ACC], [1, '', null], [1, 'print', MUT]];
    let x = 40; const unit = 880 / 33, g = E(u, 0.2, 1.6);
    parts.forEach(([n, name, col]) => { const w = n * unit; if (col) { el('rect', { x, y: 190, width: Math.max(0, w * g - 2), height: 44, rx: 5, fill: col, opacity: 0.85 });
        if (w > 60) tx(x + w / 2, 218, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: fade(u, 1.4) }); }
      x += w; });
    mono(40, 260, '1', { 'font-size': 13.5, fill: MUT }); mono(920, 260, '33', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    tx(480, 160, 'mini-agent.py 33줄 · 빈 줄과 주석을 빼면 27줄', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) });
    tx(480, 300, '도구 정의·실행 함수·루프가 한 파일에 다 들어간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.6) });
    tx(480, 360, '프레임워크는 이 위에 retry·파싱·메모리를 얹는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 600, opacity: fade(u, 2.0) }); }

  // 장면마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '이 장의 Agent를 이루는 세 부품은 무엇인가?',
      o: ['LLM 클라이언트, 도구 목록 TOOLS, ReAct system prompt', '데이터베이스, 웹 서버, 캐시', 'LLM 클라이언트, 벡터 DB, 프롬프트 캐시'], a: 0,
      why: 'client와 MODEL이 두뇌, get_weather·search 두 도구가 장비, Thought·Action·Observation을 적은 SYSTEM이 매뉴얼이다.' },
    { q: '첫 LLM 호출 뒤 루프가 바로 끝나지 않고 도구 실행으로 넘어가는 조건은 무엇인가?',
      o: ['messages가 2개 이상일 때', 'stop_reason이 "tool_use"일 때', 'max_iters가 10일 때'], a: 1,
      why: 'stop_reason이 tool_use가 아니면 resp.content[-1].text를 돌려주고 끝난다. tool_use면 tool_use 블록을 꺼내 실행한다.' },
    { q: 'Cycle 1이 끝나고 두 번째 LLM 호출이 처음과 다른 결과를 내는 까닭은 무엇인가?',
      o: ['다른 모델로 바꿔 불러서', 'temperature가 자동으로 올라가서', 'messages에 tool_result로 붙은 날씨 Observation이 입력에 들어가서'], a: 2,
      why: '같은 create 호출이지만 messages가 1개에서 3개로 늘었다. rain_prob 80을 본 모델이 실내 코스 검색을 고른다.' },
    { q: '두 번째 도구 search까지 쓴 뒤 루프가 멈추는 이유로 맞는 것은 무엇인가?',
      o: ['등록된 도구를 모두 써서', '모델이 도구 대신 답을 내 stop_reason이 바뀌어서', 'max_iters 10회를 다 돌아서'], a: 1,
      why: '루프는 도구 개수와 상관없이 stop_reason만 본다. 날씨와 코스 목록이 모이자 모델이 텍스트 답을 내고, 루프가 그 글을 돌려준다.' },
    { q: '30줄 미니 Agent가 서울 날씨 질문을 처리하며 LLM을 몇 번 불렀나?',
      o: ['2번', '3번', '6번'], a: 1,
      why: 'get_weather를 고른 호출, search를 고른 호출, 최종 답을 낸 호출로 LLM 3번, 도구 2번이다.' },
  ];

  const summary = [
    'Agent는 LLM 클라이언트와 도구 목록과 ReAct system prompt 세 부품으로 조립한다.',
    '루프마다 쌓인 messages를 통째로 보내고, stop_reason이 tool_use면 도구를 실행한다.',
    '도구 결과는 tool_result로 messages에 붙어 다음 Thought의 입력이 된다.',
    '날씨 질문은 LLM 3번과 도구 2번으로 끝났고, 이 루프는 빈 줄과 주석을 빼면 27줄이다.',
  ];
  const review = [
    { q: 'Agent가 같은 get_weather를 계속 부르며 max_iters까지 돈다. 가장 먼저 확인할 것은?',
      o: ['tool_result를 messages에 붙이는 줄이 빠졌는지', 'TOOLS에 search가 등록됐는지', 'MODEL 이름의 철자'], a: 0,
      why: '결과가 messages에 붙지 않으면 다음 호출의 입력이 그대로라 모델은 같은 Thought를 되풀이한다. Observation이 되먹임돼야 루프가 나아간다.' },
    { q: 'search 함수가 잘못된 인자로 예외를 냈는데 Agent는 멈추지 않고 답을 이어 갔다. 그 이유는?',
      o: ['LLM이 예외를 대신 고쳐서', 'execute_tool이 예외를 {"error": …}로 바꿔 Observation으로 돌려줘서', 'while True가 예외를 무시해서'], a: 1,
      why: 'try/except가 예외를 error dict로 바꾸고, 그 dict가 tool_result로 들어간다. 모델은 오류를 보고 다른 행동을 고를 수 있다.' },
    { q: '세 번째 LLM 호출에 보낸 messages는 몇 개였나?',
      o: ['1개', '3개', '5개'], a: 2,
      why: 'user 질문 하나에 사이클마다 assistant와 tool_result가 두 개씩 붙어 1, 3, 5개로 늘었다. 마지막 답이 붙어 기록은 6칸이 된다.' },
  ];

  R.page({ title: 'Tool Use + ReAct 루프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
