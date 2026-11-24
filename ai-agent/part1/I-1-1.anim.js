/* I-1-1 챗봇 vs AI Agent — 장면 5개 (../../anim/engine.js 규칙). 대화·messages·도구 JSON·ReAct 루프를 그린다 */
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
    mono(x + tg / 2, y + 5, role, { 'font-size': 13.5, 'font-weight': 700, fill: o.ghost ? c : PANEL, 'text-anchor': 'middle', opacity: a });
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

  // 글을 폭에 맞게 줄바꿈
  function wrap(s, fs, maxW) { const words = String(s).split(' '), rows = []; let cur = '';
    words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (tw(t, fs) > maxW && cur) { rows.push(cur); cur = w; } else cur = t; }); if (cur) rows.push(cur); return rows.join('\n'); }
  // 대화 화면: 페이지 데이터의 messages 를 말풍선으로. 앞 beat 에 없던 말풍선만 튀어나온다
  function chat(x, y, w, h, list, prevN, u, o) { o = o || {};
    browser(x + w / 2, y + h / 2, w, h, null, { stroke: o.stroke });
    mono(x + w / 2 + 20, y + 18, o.title || 'chatbot', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 });
    let yy = y + 42; list.forEach((m, i) => { const isU = m.role === 'user', fs = 14, txt = wrap(m.text, fs, w - 70), rows = txt.split('\n').length, bh = rows * 20 + 14;
      const s = i >= prevN ? pop(u, 0.2 + (i - prevN) * 0.6) : 1, bad = o.limit && !isU && i === list.length - 1;
      bubble(isU ? x + w - 12 : x + 12, yy + bh / 2, txt, isU ? 'r' : 'l', { s, fs, fill: isU ? (o.ucol || INFO) : bad ? BADBG : PANEL, stroke: bad ? BAD : undefined, color: isU ? PANEL : bad ? BAD : INK });
      yy += bh + 10; });
    if (!list.length) sub(x + w / 2, y + h / 2, '대기 중', 1); }
  const N = (b, key) => (b && b[key] ? b[key].messages.length : 0);

  // ---------- 1. 챗봇: LLM 한 번 부르고 끝 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    chat(18, 34, 300, 340, b.chatbot.messages, N(c.prev, 'chatbot'), u, { title: 'chatbot.py' });
    mono(352, 46, 'client = OpenAI()', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
    card(560, 82, 170, 58, { rx: 10, text: 'LLM\ngpt-4o-mini', fs: 15, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: k === 0 ? pop(u, 0.4) : 1 });
    slotX(745, 82, 112, 44, '도구 목록', k === 0 ? pop(u, 1.0) : 1); slotX(875, 82, 112, 44, '외부 API', k === 0 ? pop(u, 1.3) : 1);
    if (k === 0) { note(352, 150, 'LLM 하나만 연결했다', fade(u, 1.8), { fill: MUT }); return; }
    // 입구: chatbot(user_message)
    mono(352, 172, 'def chatbot(user_message) -> str', { 'font-size': 15, 'font-weight': 700, fill: k === 1 ? ACC : INK, opacity: k === 1 ? fade(u, 0.2) : 1 });
    if (k === 1) { fly(250, 66, 470, 138, seg(u, 0.6, 1.8), '내일 서울 날씨?', { fill: INFO }); note(352, 212, '질문이 들어오는 입구는 여기 하나', fade(u, 1.9), { fill: MUT }); return; }
    // LLM 호출 1회
    if (k === 2) { dot([[470, 160], [560, 112]], seg(u, 0.2, 1.0), ACC, 7); }
    pill(700, 120, '호출 1회', ACC, k === 2 ? pop(u, 1.0) : 1, { fs: 13.5, fill: PANEL });
    if (k === 2) { note(352, 214, '이 호출 하나가 전부다', fade(u, 1.6)); return; }
    // messages 두 줄 + 비어 있는 tool 자리
    const rows = [['system', '친절한 챗봇이다. 학습 데이터로만 답한다.'], ['user', '내일 서울 날씨?'], ['tool', '(외부 데이터가 들어올 자리 없음)', { ghost: true }]];
    msgs(352, 226, 580, rows, k === 3 ? E(u, 0.2, 2.2) * 3 : 3, { title: 'messages=[ … ]', gap: 34 });
    if (k === 3) return;
    if (k === 4) { code(352, 318, ['response.choices[0].message.content', '# → 문자열 하나만 꺼낸다'], { shown: E(u, 0.2, 1.4) * 2, fs: 14.5 });
      fly(690, 340, 120, 170, seg(u, 1.4, 2.4), 'content', { mono: true }); return; }
    if (k === 5) { // 학습 시점 타임라인
      const x0 = 360, xc = 660, x1 = 915, y = 350;
      el('rect', { x: x0, y: y - 9, width: (xc - x0) * E(u, 0.1, 1.0), height: 18, rx: 4, fill: INFO, opacity: 0.75 });
      tx(x0, y - 18, '학습 데이터', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      grow(xc, y, x1, y, E(u, 1.0, 1.8), OFF, { dash: '5 5', plain: true });
      el('line', { x1: xc, y1: y - 20, x2: xc, y2: y + 20, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.9) });
      tx(xc, y + 38, '학습 시점 (예: 2024)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      card(x1 - 22, y, 58, 32, { rx: 8, text: '내일', fs: 14, stroke: WARN, color: WARN, s: pop(u, 1.8) });
      tx(790, y - 18, '이 구간은 모른다', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k6: input → LLM → output, 그리고 끝
    const P = [[410, 'input'], [560, 'LLM'], [710, 'output']];
    P.forEach(([x, s], i) => { card(x, 336, 104, 38, { rx: 19, text: s, fs: 15, fw: 800, mono: true, stroke: i === 1 ? ACC : INK, color: i === 1 ? ACC : INK, s: pop(u, 0.2 + i * 0.35) });
      if (i < 2) grow(x + 54, 336, x + 94, 336, E(u, 0.4 + i * 0.35, 0.8 + i * 0.35), MUT); });
    pill(840, 336, '끝', BAD, pop(u, 1.3), { fs: 15 });
    [['Tool', 430], ['Memory', 575], ['Loop', 720]].forEach(([s, x], i) => slotX(x, 392, 120, 34, s + ' 없음', pop(u, 1.7 + i * 0.2))); }

  // ---------- 2. 챗봇의 한계: 바깥으로 손을 못 뻗는다 ----------
  const OUT = [['api.weather.kr', '실시간 날씨', 110], ['calendar API', '일정 쓰기', 200], ['notify API', '알림 보내기', 290]];
  function s2(t, c) { const { k, u } = c, b = c.beat;
    chat(18, 34, 300, 340, b.chatbot.messages, N(c.prev, 'chatbot'), u, { title: 'chatbot.py', limit: b.chatbot.status === 'limit' });
    card(420, 200, 150, 56, { rx: 10, text: k >= 4 ? 'LLM\n텍스트 → 텍스트' : 'LLM 하나', fs: k >= 4 ? 14 : 15, fw: 800, stroke: ACC, fill: ACCBG, color: ACC });
    const wallU = k === 0 ? E(u, 0.2, 1.0) : 1;
    el('line', { x1: 530, y1: 60, x2: 530, y2: 60 + 280 * wallU, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
    tx(745, 50, '외부 세계', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
    OUT.forEach(([n, d, y], i) => { const s = k === 0 ? pop(u, 0.6 + i * 0.35) : 1; card(745, y, 250, 58, { rx: 10, s, stroke: GRID, sw: 2 });
      if (s > 0.3) { mono(635, y - 4, n, { 'font-size': 15, 'font-weight': 700 }); tx(635, y + 18, d, { 'font-size': 13.5, fill: MUT }); } });
    if (k === 0) { note(560, 380, '아래 요청은 전부 바깥에 손을 뻗어야 하는 일', fade(u, 1.9), { fill: MUT }); return; }
    // 시도한 화살표가 벽에서 막힌다: k1 calendar, k2 notify, k3 weather
    const tries = [[1, 200], [2, 290], [3, 110]];
    tries.forEach(([kk, y]) => { if (k < kk) return; const g = k === kk ? E(u, 0.3, 1.2) : 1;
      grow(497, 200, lerp(497, 524, g), lerp(200, y, g), g, BAD, { plain: true }); if (g >= 1) cross(530, y, 11, k === kk ? pop(u, 1.2) : 1); });
    if (k === 3) [['Tool', 450], ['Memory', 620], ['Loop', 790]].forEach(([s, x], i) => slotX(x, 380, 150, 40, s + ' 없음', pop(u, 1.2 + i * 0.3)));
    if (k === 4) { [['+ Tool', 450], ['+ Memory', 620], ['+ Loop', 790]].forEach(([s, x], i) => card(x, 380, 150, 40, { rx: 8, text: s, fs: 15, fw: 800, fill: ACCBG, stroke: ACC, color: ACC, s: pop(u, 0.8 + i * 0.3) }));
      tx(620, 345, '이것을 더하면 AI Agent', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); } }

  // ---------- 3. AI Agent: 도구 스키마 → tool_calls → 결과 → 답 ----------
  const SCHEMA = ['{"type": "function",', ' "function": {', '   "name": "get_weather",', '   "description": "도시와 날짜로 실시간 날씨를 조회한다",',
    '   "parameters": {"type": "object", "properties": {', '     "city": {"type": "string"}, "date": {"type": "string"}},', '     "required": ["city", "date"]}}}'];
  const M3 = [['user', '내일 서울 날씨?'], ['assistant', 'get_weather(city="Seoul", date="tomorrow")'], ['tool', '{"temp": 9, "rain": 90, "cond": "rainy"}'], ['assistant', '내일 서울은 9°C, 강수확률 90%입니다. 우산 챙기세요.']];
  function agentBox(x, y, a, o) { o = o || {}; card(x + 145, y + 52, 290, 104, { rx: 12, stroke: ACC, sw: 2.5 });
    tx(x + 16, y + 26, 'AI Agent', { 'font-size': 16, 'font-weight': 800, fill: ACC });
    [['LLM', true], ['Tool', a.tools], ['Memory', a.memory], ['Loop', a.loop]].forEach(([s, on], i) => { const cx = x + 44 + i * 67;
      card(cx, y + 70, 60, 34, { rx: 8, text: s, fs: 13.5, fw: 800, mono: true, fill: on ? ACC : PANEL, stroke: on ? ACC : OFF, color: on ? PANEL : OFF, dash: on ? null : '4 4', s: o.pop === i ? pop(o.u, 0.6) : 1 }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    agentBox(14, 18, b.agent, { pop: k === 1 ? 1 : null, u });
    if (k === 0) { pill(160, 150, 'client = OpenAI()', INK, pop(u, 0.3), { mono: true, fs: 13.5 }); pill(160, 192, 'import json, requests', ACC, pop(u, 0.8), { mono: true, fs: 13.5 });
      note(352, 60, '클라이언트는 챗봇과 같다', fade(u, 1.4)); note(352, 90, '달라지는 것은 여기에 붙일 것들', fade(u, 1.8), { fill: MUT }); return; }
    // 도구 함수
    code(14, 140, ['def get_weather(city, date):', '  GET api.weather.kr/v1/{city}/{date}', '  return res.json()'], { fs: 13.5, w: 318, shown: k === 1 ? E(u, 0.2, 1.6) * 3 : 3, title: '도구 = 파이썬 함수' });
    if (k === 1) return;
    // 스키마: k2 이름·설명, k3 파라미터
    const sh = k === 2 ? 1 + E(u, 0.2, 1.8) * 3 : k === 3 ? 4 + E(u, 0.2, 1.6) * 3 : 7;
    code(352, 26, SCHEMA, { fs: 13.5, shown: sh, op: k >= 4 ? 0.35 : 1, title: 'tools=[…]  LLM이 읽는 설명', hi: (i) => (k === 2 && (i === 2 || i === 3)) || (k === 3 && i === 6) });
    if (k <= 3) return;
    // 메시지가 쌓인다: k4 user + tool_calls, k5 tool 결과, k6 답
    const at = k === 4 ? E(u, 0.1, 1.8) * 2 : k === 5 ? 2 + E(u, 1.3, 2.2) : 3 + E(u, 0.3, 1.6);
    msgs(352, 228, 586, M3, at, { title: 'messages', gap: 40, fs: 13.5 });
    if (k === 4) pill(800, 302, 'content 대신 tool_calls', ACC, pop(u, 1.9), { fs: 13.5, fill: PANEL });
    if (k >= 5) { server(170, 318, 'api.weather.kr', { s: 0.8, lamp: k === 5 ? GOOD : OFF });
      if (k === 5) { dot([[170, 232], [170, 280]], seg(u, 0.1, 0.6), ACC, 7); dot([[230, 318], [352, 308]], seg(u, 0.7, 1.3), GOOD, 7); } } }

  // ---------- 4. 자율 루프: messages 를 통째로 넘기며 최대 5회 ----------
  const M4 = [['system', '목표 달성에 필요한 도구를 자율 호출하라.'], ['user', '내일 비 오면 17시에 우산 알림 줘'], ['assistant', 'get_weather({"city": "Seoul"})'], ['tool', '{"rain": 90}'],
    ['assistant', 'schedule_notify({"at": "17:00", "msg": "우산"})'], ['tool', '{"scheduled": "ok"}'], ['assistant', '내일 서울 비 90% 확인, 17시 우산 알림 등록 완료.']];
  const TOK = [29, 44, 67];   // 회차마다 LLM 에 보낸 메시지 내용의 토큰 수 (o200k_base 로 센 값, 역할·형식 토큰 제외)
  function s4(t, c) { const { k, u } = c;
    // 도구 표 (왼쪽 아래)
    tx(20, 356, 'tools_map', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono' });
    const hotTool = k === 5 ? 0 : k === 6 ? 1 : -1;
    ['get_weather', 'schedule_notify'].forEach((s, i) => pill(i ? 230 : 82, 388, s, hotTool === i ? ACC : INK, k === 0 ? pop(u, 0.3 + i * 0.4) : 1, { mono: true, fs: 13.5, fill: hotTool === i ? ACCBG : PANEL }));
    if (k === 0) { note(20, 320, '이름으로 함수를 찾을 수 있게 표로 묶는다', fade(u, 1.4)); }
    // 메시지 = 메모리
    const at = k < 1 ? 0 : k === 1 ? E(u, 0.2, 1.6) * 2 : k === 2 ? 2 : k === 3 ? 2 + E(u, 0.3, 1.3) : k === 4 ? 3 : k === 5 ? 3 : k === 6 ? 4 + E(u, 0.3, 1.4) : 5 + E(u, 0.2, 1.0) + E(u, 1.5, 2.4);
    msgs(372, 62, 562, M4, at, { title: 'messages  (= 메모리, 계속 쌓인다)', gap: 34, h: 28, fs: 13.5, tag: 92 });
    if (k === 5) msg(372, 62 + 3 * 34, 562, 'tool', '{"rain": 90}', { u: E(u, 1.4, 2.4), h: 28, fs: 13.5, tag: 92, hot: true });
    if (k < 2) return;
    // 루프 고리
    const on = k === 2 ? 0 : k === 3 ? 1 : k === 4 ? 1 : k === 5 ? 2 : 0;
    const arc = k === 2 ? E(u, 0.2, 1.2) * 0.2 : k === 3 ? 1 : k === 4 ? 1.5 : k === 5 ? 2 + E(u, 0.2, 1.2) * 0.6 : 3;
    ring(185, 190, 98, ['Reason', 'Act', 'Observe'], { on, arc, nw: 108, dot: k === 2 ? seg(u, 0.2, 1.2) * 0.33 : k === 6 ? seg(u, 0.2, 1.3) : null, s: (i) => (k === 2 ? pop(u, 0.2 + i * 0.25) : 1) });
    const step = k <= 5 ? 1 : k === 6 ? 2 : 3;
    mono(20, 36, `step ${step} / 5`, { 'font-size': 16, 'font-weight': 800, fill: ACC }); slots(132, 22, 5, step, { w: 22, h: 18 });
    if (k === 2) dot([[372, 80], [300, 120], [240, 135]], seg(u, 0.6, 1.6), INFO, 7);
    if (k === 4) card(185, 190, 112, 50, { rx: 8, text: 'tool_calls?\n있음 → 계속', fs: 13.5, fw: 700, stroke: WARN, color: WARN, s: pop(u, 0.3) });
    if (k === 7) card(185, 190, 112, 50, { rx: 8, text: 'tool_calls\n없음 → 끝', fs: 13.5, fw: 700, stroke: GOOD, color: GOOD, s: pop(u, 0.4) });
    // 회차별로 LLM 에 넘긴 내용 (토큰)
    const calls = k <= 5 ? 1 : k === 6 ? 2 : 3;
    tx(372, 324, 'LLM에 보낸 메시지 내용 (토큰)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < calls; i++) { const fresh = (k === 2 && i === 0) || (k === 6 && i === 1) || (k === 7 && i === 2), g = fresh ? E(u, 0.3, 1.3) : 1;
      mono(372, 348 + i * 24, `${i + 1}회차`, { 'font-size': 13.5, fill: MUT }); hbar(430, 336 + i * 24, 420, TOK[i], 80, { h: 16, u: g, col: i === calls - 1 ? ACC : OFF, text: String(TOK[i]) }); } }

  // ---------- 5. 챗봇 vs AI Agent: 기준 7개 ----------
  const CRIT = ['동작 방식', '도구', '메모리', '자율성', '결과 형태', '적합 용도', '비유'];
  function radio(cx, cy, s) { const g = G(cx, cy, s); el('rect', { x: -26, y: -40, width: 52, height: 86, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }, g);
    el('line', { x1: 14, y1: -40, x2: 14, y2: -70, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    for (let i = 0; i < 3; i++) el('line', { x1: -14, y1: -22 + i * 9, x2: 14, y2: -22 + i * 9, stroke: OFF, 'stroke-width': 3 }, g);
    el('circle', { cx: 0, cy: 18, r: 11, fill: SOFT, stroke: INK, 'stroke-width': 2 }, g); }
  function s5(t, c) { const { k, u } = c;
    el('line', { x1: 480, y1: 20, x2: 480, y2: 350, stroke: GRID, 'stroke-width': 2 });
    lbl(240, 34, '챗봇', 1, { 'font-size': 17 }); lbl(720, 34, 'AI Agent', 1, { 'font-size': 17, fill: ACC });
    CRIT.forEach((s, i) => { const done = i < k || k === 7, cur = i === k; card(80 + i * 133, 392, 120, 32, { rx: 16, text: s, fs: 13.5, fw: 700, fill: cur ? INK : done ? SOFT : PANEL, stroke: cur ? INK : GRID, color: cur ? PANEL : done ? INK : OFF }); });
    if (k === 0) { [['input', 110], ['LLM', 240], ['output', 370]].forEach(([s, x], i) => { card(x, 190, 92, 38, { rx: 19, text: s, fs: 14, fw: 800, mono: true, s: pop(u, 0.2 + i * 0.3) }); if (i < 2) grow(x + 48, 190, x + 82, 190, E(u, 0.4 + i * 0.3, 0.8 + i * 0.3), MUT); });
      sub(240, 250, '1 사이클', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK });
      ring(720, 190, 78, ['Reason', 'Act'], { arc: 2, on: Math.floor(t * 1.3) % 2, dot: (t * 0.6) % 1, nw: 96, s: (i) => pop(u, 0.4 + i * 0.3) });
      sub(720, 300, 'N 사이클 반복', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700, fill: ACC }); return; }
    if (k === 1) { bubble(450, 110, '실제 내일 날씨를 확인해줘', 'r', { s: pop(u, 0.2), fs: 14 }); bubble(30, 170, '외부 API에 접근할 수 없습니다.', 'l', { s: pop(u, 0.8), fs: 14, fill: BADBG, stroke: BAD, color: BAD });
      code(520, 90, ['get_weather({"city": "Seoul"})', '→ {"temp": 9, "rain": 90}'], { fs: 14.5, shown: E(u, 0.4, 1.8) * 2, title: 'tool_calls → 결과' });
      check(900, 120, 13, pop(u, 1.9)); return; }
    if (k === 2) { bubble(450, 100, '아까 뭐라고 했지?', 'r', { s: pop(u, 0.2), fs: 14 }); bubble(30, 160, '이전 대화는 기억하지 못합니다.', 'l', { s: pop(u, 0.8), fs: 14 });
      sub(240, 230, '한 턴 위주, 맥락 유지가 약하다', fade(u, 1.3));
      msgs(512, 90, 420, [['user', '내일 서울 날씨?'], ['assistant', 'get_weather(...)'], ['tool', '{"temp": 9, "rain": 90}'], ['assistant', '9°C, 비 90%']], E(u, 0.3, 2.0) * 4, { gap: 36, fs: 13.5, title: 'messages' });
      sub(720, 250, '도구 결과까지 남겨 다음 판단에 쓴다', fade(u, 2.1)); return; }
    if (k === 3) { card(110, 190, 104, 40, { rx: 8, text: '입력 1번', fs: 14, s: pop(u, 0.2) }); grow(165, 190, 300, 190, E(u, 0.5, 1.1), MUT); card(360, 190, 104, 40, { rx: 8, text: '답 1번', fs: 14, s: pop(u, 1.1) });
      sub(240, 250, '스스로 다음 행동을 하지 않는다', fade(u, 1.5));
      pill(560, 190, '목표 하나', ACC, pop(u, 0.3), { fs: 14 });
      ['get_weather', 'schedule_notify', '종합 답변'].forEach((s, i) => { const y = 110 + i * 80; grow(612, 190, 712, y, E(u, 0.7 + i * 0.3, 1.2 + i * 0.3), ACC); pill(800, y, s, ACC, pop(u, 1.2 + i * 0.3), { mono: i < 2, fs: 13.5 }); });
      return; }
    if (k === 4) { bubble(30, 150, '텍스트로만 안내할 수 있습니다.', 'l', { s: pop(u, 0.3), fs: 14 }); sub(240, 220, '결과는 문장뿐', fade(u, 1.0));
      bubble(512, 110, '17시 우산 알림 등록 완료.', 'l', { s: pop(u, 0.3), fs: 14, fill: ACCBG, stroke: ACC, color: ACC });
      card(720, 230, 280, 76, { rx: 12, stroke: GOOD, sw: 2.5, s: pop(u, 1.0) }); clock(620, 230, 22, E(u, 1.2, 2.0) * 0.71, GOOD);
      mono(660, 224, '17:00  우산', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.3) }); mono(660, 248, '{"scheduled": "ok"}', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.5) });
      sub(720, 300, '알림이 실제로 등록됐다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: GOOD }); return; }
    if (k === 5) { zone(30, 62, 420, 250, null, { fill: GOODBG, op: fade(u, 0.1) });
      bubble(430, 110, '환불 규정 알려줘', 'r', { s: pop(u, 0.3), fs: 14 }); bubble(50, 170, '환불은 7일 이내 가능합니다.', 'l', { s: pop(u, 0.8), fs: 14 });
      tx(240, 260, 'FAQ · 안내 · 단순 상담', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.3) });
      tx(720, 170, '예약 · 데이터 조회 · 가공', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
      tx(720, 200, '다단계 워크플로 자동화', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      sub(720, 250, '단순 응답에는 굳이 필요 없다', fade(u, 2.1)); return; }
    if (k === 6) { radio(240, 180, pop(u, 0.2)); tx(240, 290, '무전기: 말만 주고받는다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      person(690, 175, null, { s: 1.6 * pop(u, 0.8) }); card(775, 190, 56, 70, { rx: 6, s: pop(u, 1.1) });
      [0, 1, 2].forEach((i) => check(775, 168 + i * 20, 6, pop(u, 1.3 + i * 0.2)));
      tx(720, 290, '비서: 판단하고 직접 처리한다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) }); return; }
    // k7 결론
    const parts = [['LLM', INK], ['Tool', ACC], ['Memory', ACC], ['Loop', ACC]];
    parts.forEach(([s, col], i) => { card(150 + i * 170, 170, 120, 50, { rx: 10, text: s, fs: 17, fw: 800, mono: true, stroke: col, color: col, fill: i ? ACCBG : PANEL, s: pop(u, 0.2 + i * 0.3) });
      if (i < 3) tx(235 + i * 170, 178, '+', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.3) }); });
    tx(745, 178, '=', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
    card(850, 170, 150, 56, { rx: 12, text: 'AI Agent', fs: 18, fw: 800, fill: ACC, stroke: ACC, color: PANEL, s: pop(u, 1.4) });
    tx(480, 270, 'LLM은 그대로 두고 손·기억·반복을 더했다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) });
    tx(480, 310, '단순 응답이면 챗봇, 행동이 필요하면 Agent', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '챗봇 코드가 LLM에 넘기는 messages에 들어 있는 것은 무엇인가?',
      o: ['system 지시와 user 질문 두 줄', '질문과 날씨 API 응답', '지금까지 부른 도구 목록'], a: 0,
      why: 'chatbot()은 system과 user 두 줄만 넣고 gpt-4o-mini를 한 번 부른다. 외부 데이터가 들어갈 자리가 없어 학습 시점의 일반론이 나온다.' },
    { q: '챗봇이 캘린더 메모와 17시 알림 요청을 모두 거절한 공통 원인은 무엇인가?',
      o: ['모델이 작아서 문장을 못 만든다', '바깥 시스템을 부를 도구가 없다', '질문이 너무 길다'], a: 1,
      why: '두 요청 모두 캘린더 API, 알림 API처럼 외부 시스템에 손을 뻗어야 한다. LLM 하나만 있는 챗봇에는 그 통로가 없다.' },
    { q: 'tools를 넘겨 LLM을 부르면 응답에 content 대신 무엇이 오나?',
      o: ['기상청 API가 돌려준 날씨 값', 'get_weather 함수의 본문 코드', '부를 함수 이름과 인자를 담은 tool_calls'], a: 2,
      why: 'LLM은 함수를 직접 실행하지 않는다. tool_calls로 이름과 city·date를 알려 주면 코드가 get_weather를 실행해 {temp: 9, rain: 90}을 받는다.' },
    { q: 'run_agent 루프가 답을 돌려주며 끝나는 조건은 무엇인가?',
      o: ['LLM 응답에 tool_calls가 없을 때', '도구를 한 번 실행했을 때', 'messages가 세 줄이 됐을 때'], a: 0,
      why: 'msg.tool_calls가 비면 content를 반환한다. 그 전까지는 결과를 role "tool"로 쌓고 다시 LLM을 부르며, 최대 5회가 상한이다.' },
    { q: '다음 중 챗봇으로 충분한 일은 무엇인가?',
      o: ['비 오면 17시 알림 등록', '환불 규정 같은 FAQ 안내', '날씨를 확인하고 일정 등록'], a: 1,
      why: '정해진 정보를 말로 안내하는 일은 LLM 한 번 호출로 끝난다. 조회하고 등록하는 행동이 필요할 때 Agent를 쓴다.' },
  ];

  // 완료 화면: 정리 문장과 장면을 엮는 복습 문제
  const summary = [
    '챗봇은 LLM을 한 번 부르고 끝난다. 학습 시점 이후의 내일 날씨는 알 수 없다.',
    '캘린더 쓰기나 알림 보내기처럼 바깥 시스템을 건드리는 일은 챗봇이 하지 못한다.',
    'Agent에서는 LLM이 tool_calls로 부를 함수를 고르고, 코드가 실행한 결과를 다시 넘긴다.',
    '결과를 messages에 쌓으며 tool_calls가 없을 때까지 돌면 목표 한 줄로 여러 도구를 쓴다.',
  ];
  const review = [
    { q: '챗봇에 "오늘 환율 알려줘"라고 물었더니 그럴듯한 숫자가 나왔다. 먼저 의심할 것은?',
      o: ['학습 시점의 값을 답했을 수 있다', 'API 키가 만료됐다', '도구 실행 결과가 틀렸다'], a: 0,
      why: '챗봇은 외부 API 없이 학습 지식으로만 답한다. 실시간 값처럼 보여도 학습 시점 기준의 일반론일 수 있다.' },
    { q: 'Agent가 날씨와 상관없는 질문에도 get_weather를 부른다. 먼저 고칠 곳은?',
      o: ['get_weather 함수 본문', 'tools 스키마의 description', 'max_steps 값'], a: 1,
      why: 'LLM이 읽는 것은 함수 본문이 아니라 이름과 설명이다. 설명이 모호하면 도구를 고르는 판단도 흔들린다.' },
    { q: 'run_agent가 다섯 번을 다 돌고도 답 없이 끝났다. 가장 그럴듯한 원인은?',
      o: ['도구 결과로 기억이 넘쳤다', 'LLM을 한 번만 불렀다', 'LLM이 매번 tool_calls를 냈다'], a: 2,
      why: '루프는 tool_calls가 없는 응답이 와야 답을 돌려준다. 매 회 도구를 부르면 5회 상한에서 멈춘다.' },
  ];

  R.page({ title: '챗봇 vs AI Agent', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
