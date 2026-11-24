/* I-2-1 Agent 아키텍처 전체 지도 — 장면 5개 (../../anim/engine.js 규칙). 5부품 지도 위로 요청 JSON·messages·도구 스펙·Redis/벡터 기억·RunResult 를 그린다 */
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

  // ---------- 왼쪽 작은 지도: 5개 부품과 흐름 (페이지 데이터 activeComponents · activeFlows) ----------
  const NODE = { user: [115, 52, 'User'], core: [115, 146, 'Core'], tools: [52, 244, 'Tools'], memory: [180, 244, 'Memory'], output: [115, 340, 'Output'] };
  const LINK = { 'u-c': ['user', 'core'], 'c-m': ['core', 'memory'], 'm-c': ['memory', 'core'], 'c-t': ['core', 'tools'], 't-c': ['tools', 'core'], 'c-o': ['core', 'output'] };
  function map(c, t) { const b = c.beat, on = b.activeComponents || [], fl = b.activeFlows || [];
    el('rect', { x: 2, y: 22, width: 232, height: 352, rx: 12, fill: SOFT, opacity: 0.6 });
    [['user', 'core'], ['core', 'tools'], ['core', 'memory'], ['core', 'output']].forEach(([a, z]) => el('line', { x1: NODE[a][0], y1: NODE[a][1], x2: NODE[z][0], y2: NODE[z][1], stroke: GRID, 'stroke-width': 2.5 }));
    fl.forEach((f, i) => { const [a, z] = LINK[f] || []; if (!a) return; const A = NODE[a], Z = NODE[z];
      el('line', { x1: A[0], y1: A[1], x2: Z[0], y2: Z[1], stroke: ACC, 'stroke-width': 3 }); dot([[A[0], A[1]], [Z[0], Z[1]]], (t * 0.8 + i * 0.37) % 1, ACC, 6); });
    Object.keys(NODE).forEach((n) => { const [x, y, s] = NODE[n], hot = on.includes(n);
      card(x, y, 96, 36, { rx: 18, text: s, fs: 15, fw: 800, fill: hot ? ACC : PANEL, stroke: hot ? ACC : INK, color: hot ? PANEL : INK }); }); }
  const MX = 256;   // 오른쪽 본문 시작
  const ASK = '내일 부산 출장 준비해줘';

  // ---------- 1. User: 요청이 들어오는 입구 ----------
  function s1(t, c) { const { k, u } = c; map(c, t);
    bubble(MX + 4, 52, ASK, 'l', { s: k === 0 ? pop(u, 0.3) : 1, fs: 15, fill: INFO, color: PANEL, stroke: 'none' });
    pill(840, 52, 'app/routers/user.py', INK, k === 0 ? pop(u, 0.9) : 1, { mono: true, fs: 13.5 });
    if (k === 0) { note(MX, 140, '진입점 파일. 여기서는 검증과 위임만 한다', fade(u, 1.5)); return; }
    // 경로: prefix + "/chat"
    pill(MX + 75, 118, 'prefix="/agent"', ACC, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5 });
    tx(MX + 160, 123, '+', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.5) : 1 });
    pill(MX + 262, 118, '@router.post("/chat")', ACC, k === 1 ? pop(u, 0.6) : 1, { mono: true, fs: 13.5 });
    grow(MX + 360, 118, MX + 420, 118, k === 1 ? E(u, 1.1, 1.5) : 1, ACC);
    pill(MX + 510, 118, 'POST /agent/chat', ACC, k === 1 ? pop(u, 1.5) : 1, { mono: true, fs: 15, fill: ACCBG });
    if (k === 1) return;
    // 요청·응답 스키마
    code(MX, 160, ['{"session_id": "u-42",', ' "message": "내일 부산 출장 준비해줘"}'], { fs: 14.5, shown: k === 2 ? E(u, 0.2, 1.2) * 2 : 2, title: 'ChatRequest', op: k >= 5 ? 0.45 : 1 });
    if (k === 2) { check(MX + 420, 190, 13, pop(u, 1.6)); note(MX + 446, 196, '형식 검증 통과', fade(u, 1.7), { fill: GOOD }); note(MX, 260, '형식이 틀리면 Core까지 가지 않는다', fade(u, 2.0), { fill: MUT }); return; }
    code(MX + 450, 160, ['{"answer": str,', ' "used_tools": [ ]}'], { fs: 14.5, dash: '5 4', shown: k === 3 ? E(u, 0.2, 1.2) * 2 : 2, title: 'ChatResponse (돌려줄 모양)', op: k >= 5 ? 0.45 : 1 });
    if (k === 3) return;
    if (k === 4) { code(MX, 270, ['core: AgentCore = Depends(AgentCore)'], { fs: 15, shown: E(u, 0.2, 1.0) }); note(MX, 360, 'User → Core 통로가 열렸다', fade(u, 1.6), { fill: ACC }); return; }
    if (k === 5) { card(MX + 160, 310, 300, 96, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) }); card(MX + 510, 310, 300, 96, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.6) });
      tx(MX + 160, 296, '라우터: 검증 · 위임', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); tx(MX + 160, 324, '비즈니스 로직 없음', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: fade(u, 1.2) });
      tx(MX + 510, 296, 'Core: 판단', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); tx(MX + 510, 324, '도구 · 기억 · LLM은 여기서', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      grow(MX + 312, 310, MX + 356, 310, E(u, 1.3, 1.8), ACC); return; }
    code(MX, 270, ['result = await core.run("u-42", "내일 부산 출장 준비해줘")', 'return ChatResponse(answer=result.answer,', '                    used_tools=result.used_tools)'], { fs: 14, shown: E(u, 0.2, 1.8) * 3 }); }

  // ---------- 2. Core: messages 를 조립하고 LLM 을 최대 5번 ----------
  function s2(t, c) { const { k, u } = c; map(c, t);
    pill(MX + 90, 40, 'app/services/core.py', INK, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5 });
    ['ToolRegistry', 'MemoryStore'].forEach((s, i) => pill(MX + 300 + i * 150, 40, s, ACC, k === 0 ? pop(u, 0.7 + i * 0.3) : 1, { mono: true, fs: 13.5 }));
    if (k === 0) { note(MX, 120, '추론 엔진 파일. 도구와 기억을 함께 끌어온다', fade(u, 1.5)); return; }
    if (k === 1) { code(MX, 90, ['SYSTEM_PROMPT = """너는 출장 준비를 돕는 AI Agent 다.', '필요하면 도구(search_web, query_db, call_api)를 사용해라.', '도구가 필요 없으면 바로 답해라."""'], { fs: 14, shown: E(u, 0.2, 2.0) * 3 }); return; }
    // 세 조각
    [['llm', 'AsyncOpenAI()'], ['tools', 'ToolRegistry()'], ['memory', 'MemoryStore()']].forEach(([a, b], i) => { const x = MX + 110 + i * 230, s = k === 2 ? pop(u, 0.2 + i * 0.35) : 1;
      card(x, 98, 210, 48, { rx: 10, stroke: i ? ACC : INK, sw: 2, s }); if (s > 0.5) { mono(x, 93, 'self.' + a, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' }); mono(x, 112, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } });
    if (k === 2) return;
    if (k === 3) { code(MX, 150, ['history = await self.memory.load("u-42")'], { fs: 14.5, shown: E(u, 0.2, 0.9) });
      for (let i = 0; i < 5; i++) msg(MX, 220 + i * 32, 520, i % 2 ? 'assistant' : 'user', '(이전 대화)', { u: E(u, 1.0 + i * 0.2, 1.6 + i * 0.2), h: 26, fs: 13.5, op: 0.7 });
      note(MX + 540, 290, '최근 20턴', fade(u, 2.2), { fill: MUT }); return; }
    // messages = [system, *history, user]
    const rows = [['system', '너는 출장 준비를 돕는 AI Agent 다. …'], ['user', '*history  (이전 대화 최근 20턴)', { op: 0.7, label: 'history' }], ['user', ASK]];
    msgs(MX, 180, 670, rows, k === 4 ? E(u, 0.2, 2.0) * 3 : 3, { title: 'messages', fs: 13.5, gap: 36, op: k >= 5 ? 1 : 1 });
    if (k === 4) return;
    tx(MX, 312, 'for _ in range(5):', { 'font-size': 14.5, class: 'mono', 'font-weight': 700 }); slots(MX + 170, 298, 5, k === 5 ? E(u, 0.3, 1.0) : 1, { w: 30, h: 18 });
    if (k === 5) { mono(MX, 350, 'llm(messages, tools=self.tools.schemas())', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) }); return; }
    if (k === 6) { card(MX + 120, 370, 200, 44, { rx: 8, text: 'tool_calls 있음 → 계속', fs: 14, fw: 700, stroke: WARN, color: WARN, s: pop(u, 0.3) });
      card(MX + 400, 370, 200, 44, { rx: 8, text: '없음 → break, 답 완성', fs: 14, fw: 700, stroke: OFF, color: OFF, s: pop(u, 0.7) }); return; }
    code(MX, 338, ['{"name": "search_web", "arguments": {"query": "부산 날씨 내일"}}'], { fs: 14, shown: E(u, 0.2, 1.4), title: 'tool_calls[0]  (실행은 tools.py 몫)' }); }

  // ---------- 3. Tools: 이름 → 함수, 결과는 JSON ----------
  function s3(t, c) { const { k, u } = c; map(c, t);
    tx(MX, 40, 'self._tools', { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: MUT });
    [['search_web', '외부 검색 API'], ['query_db', '사내 DB'], ['call_api', '외부 시스템 POST']].forEach(([a, b], i) => { const y = 72 + i * 36, s = k === 0 ? pop(u, 0.2 + i * 0.3) : 1, hot = (k >= 3 && k <= 4 && i === 0) || (k === 5 && i === 1) || (k === 6 && i === 2);
      pill(MX + 62, y, a, hot ? ACC : INK, s, { mono: true, fs: 13.5, fill: hot ? ACCBG : PANEL }); if (s > 0.5) tx(MX + 140, y + 5, b, { 'font-size': 14, fill: MUT }); });
    if (k === 0) return;
    if (k <= 2) { code(MX + 330, 30, ['{"name": "search_web",', ' "description": "웹 검색 — 최신 정보가 필요할 때",', ' "parameters": {"query": {"type": "string"}}}'], { fs: 13.5, shown: k === 1 ? E(u, 0.2, 1.5) * 3 : 3, title: 'schemas()  LLM이 보는 것' });
      if (k === 2) { code(MX + 330, 140, ['{"name": "query_db",', ' "description": "사내 DB 조회",', ' "parameters": {"sql": {"type": "string"}}}'], { fs: 13.5, shown: E(u, 0.2, 1.4) * 3 });
        note(MX + 330, 260, 'LLM 앞에 후보는 2개. call_api는 스키마에 없다', fade(u, 1.8), { fill: WARN }); }
      return; }
    if (k === 3) { code(MX, 200, ['await self._tools["search_web"](**{"query": "부산 날씨 내일"})'], { fs: 14.5, shown: E(u, 0.2, 1.4), title: 'dispatch(name, args)' }); return; }
    if (k === 4) { code(MX, 200, ['GET https://api.search/q?q=부산 날씨 내일'], { fs: 14.5, shown: E(u, 0.2, 1.0) });
      server(MX + 560, 300, '외부 검색 API', { s: 0.85, lamp: u > 1.6 ? GOOD : OFF }); dot([[MX + 300, 240], [MX + 500, 300]], seg(u, 1.0, 1.7), ACC, 7); return; }
    if (k === 5) { code(MX, 200, ['await self.query_db("select …")', '→ [{"city": "Busan", "rain_pct": 60}]   # 예시 반환'], { fs: 14.5, shown: E(u, 0.2, 1.6) * 2 }); dbIconLite(MX + 600, 300, pop(u, 0.4)); return; }
    code(MX, 200, ['await self.call_api(url, payload)   # POST'], { fs: 14.5, shown: E(u, 0.2, 0.9) });
    msg(MX, 290, 620, 'tool', '"비 60%, 19~24°C"   (예시 결과)', { u: E(u, 1.2, 2.2), fs: 14 });
    note(MX, 350, '결과 JSON은 messages에 붙어 다시 Core로 올라간다', fade(u, 2.0)); }
  function dbIconLite(cx, cy, s) { R.dbIcon(cx, cy, '사내 DB', { s }); }

  // ---------- 4. Memory: Redis 리스트(단기) + 벡터(장기) ----------
  const PTS = [[0.2, 0.7], [0.3, 0.55], [0.72, 0.3], [0.8, 0.45], [0.55, 0.8], [0.15, 0.25], [0.62, 0.62], [0.4, 0.2], [0.88, 0.75], [0.35, 0.85]];   // 그림용 2차원 배치 (예시)
  function vbox(x, y, w, h, u, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 10, y - 8, '장기: 벡터 저장소 (self.long)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    PTS.forEach(([a, b], i) => { const s = clamp(u * 10 - i); if (s <= 0) return; el('circle', { cx: x + a * w, cy: y + (1 - b) * h, r: 6 * s, fill: o.near && o.near.includes(i) ? ACC : OFF }); });
    sub(x + w / 2, y + h + 18, '2차원은 그림용 배치', 1); }
  function redis(x, y, n, o) { o = o || {}; tx(x, y - 10, '단기: Redis 리스트  chat:u-42', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, class: 'mono' });
    mono(x, y + 21, '…', { 'font-size': 16, fill: MUT });
    for (let i = 0; i < n; i++) { const cx = x + 18 + i * 25; el('rect', { x: cx, y, width: 21, height: 28, rx: 3, fill: i % 2 ? ACCBG : INFOBG, stroke: o.newi === i ? INFO : 'none', 'stroke-width': 2, opacity: o.op ? o.op(i) : 1 }); }
    if (o.win) { const a = x + 18 + (n - 20) * 25, b = x + 18 + n * 25 - 4; el('path', { d: `M${a},${y + 36} v8 H${b} v-8`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: o.win });
      mono((a + b) / 2, y + 62, 'lrange(-20, -1)  최근 20건', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: o.win }); } }
  function s4(t, c) { const { k, u } = c; map(c, t);
    const n = k >= 2 ? 23 : 22;
    redis(MX, 50, n, { win: k === 1 ? fade(u, 0.8) : k === 2 ? 1 : 0, newi: k === 2 ? 22 : -1, op: (i) => (k === 0 ? clamp(u * 3 - i * 0.1) : k === 2 && i === 22 ? E(u, 0.6, 1.4) : 1) });
    if (k === 2) { mono(MX, 142, 'rpush("chat:u-42", {"role": "user", "content": "내일 부산 출장 준비해줘"})', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.2) }); }
    if (k === 0) { vbox(MX + 330, 190, 330, 170, E(u, 0.6, 1.8)); return; }
    if (k <= 2) { vbox(MX + 330, 190, 330, 170, 1); return; }
    const near = k === 4 ? [2, 3, 6] : null;
    vbox(MX + 330, 190, 330, 170, 1, { near: k === 4 && u > 1.2 ? near : null });
    if (k === 3) { pill(MX + 120, 210, '"부산 출장 …"', INK, pop(u, 0.2), { fs: 14 }); grow(MX + 120, 228, MX + 120, 262, E(u, 0.6, 1.0), MUT);
      slots(MX + 20, 272, 8, E(u, 0.9, 1.6) * 8, { w: 22, h: 22, gap: 3, col: (i) => (i % 3 ? INFO : ACC) });
      dot([[MX + 230, 283], [MX + 330 + 0.72 * 330, 190 + 0.7 * 170]], seg(u, 1.7, 2.4), ACC, 7);
      sub(MX + 120, 316, 'remember(): 임베딩으로 저장', fade(u, 1.6)); return; }
    if (k === 4) { const qx = MX + 330 + 0.7 * 330, qy = 190 + 0.55 * 170;
      el('circle', { cx: qx, cy: qy, r: 8, fill: INFO, opacity: fade(u, 0.3) }); tx(qx + 12, qy - 10, 'query', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, class: 'mono', opacity: fade(u, 0.3) });
      near.forEach((i, j) => grow(qx, qy, MX + 330 + PTS[i][0] * 330, 190 + (1 - PTS[i][1]) * 170, E(u, 0.6 + j * 0.2, 1.1 + j * 0.2), ACC, { plain: true }));
      code(MX, 210, ['recall(query, k=3)', '→ 가장 가까운 3건'], { fs: 14, shown: E(u, 0.2, 1.4) * 2 }); return; }
    if (k === 5) { code(MX, 210, ['embeddings.create(', '  model="text-embedding-3-small")'], { fs: 14, shown: E(u, 0.2, 1.2) * 2 });
      slots(MX, 300, 12, E(u, 1.0, 2.0) * 12, { w: 22, h: 22, gap: 3, col: (i) => (i % 4 === 1 ? ACC : i % 3 ? INFO : WARN) }); mono(MX + 305, 316, '…', { 'font-size': 16 });
      sub(MX + 160, 346, '텍스트 → 숫자 1536개 (기본 차원)', fade(u, 1.8)); return; }
    code(MX, 210, ['dot = sum(x * y for x, y in zip(a, b))', 'return dot   # 정규화 생략'], { fs: 14, shown: E(u, 0.2, 1.2) * 2 });
    pill(MX + 110, 318, '최근 20턴 + top-3', ACC, pop(u, 1.4), { fs: 14 }); grow(MX + 110, 300, MX + 110, 250, 0, ACC);
    note(MX, 370, '합쳐서 다음 LLM 호출의 messages로', fade(u, 1.8)); }

  // ---------- 5. Output: 사용자에게 할 말 + 바깥에 남길 흔적 ----------
  const ANS = '부산 비 예보. KTX 09:00 + 호텔 예약 완료';
  function s5(t, c) { const { k, u } = c; map(c, t);
    const F = [['answer', 'str', '사용자에게 보낼 텍스트'], ['used_tools', 'list[str]', '사용한 도구 이름'], ['side_effects', 'list[dict]', '외부 작업 로그']];
    if (k === 0 || k === 5) { F.forEach(([a, ty, d], i) => { const y = 70 + i * 52; card(MX + 220, y, 440, 44, { rx: 8, stroke: GRID, s: k === 0 ? pop(u, 0.2 + i * 0.3) : 1 });
        mono(MX + 14, y + 5, a, { 'font-size': 15, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.3 + i * 0.3) : 1 });
        mono(MX + 160, y + 5, k === 5 ? ['"' + ANS + '"', '["search_web", "call_api"]', '[{"action": "call_api", "ok": true}]'][i] : ty + '   # ' + d, { 'font-size': 13.5, fill: k === 5 ? ACC : MUT, opacity: k === 0 ? fade(u, 0.5 + i * 0.3) : fade(u, 0.3 + i * 0.4) }); });
      tx(MX, 40, k === 5 ? 'RunResult(…) 반환' : '@dataclass RunResult', { 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: k === 5 ? ACC : INK });
      if (k === 5) note(MX, 260, '답 · 사용 도구 · 부수효과를 한 객체로 묶어 올린다  (예시 값)', fade(u, 1.6), { fill: MUT });
      return; }
    if (k === 1) { card(MX + 200, 120, 380, 64, { rx: 10, text: 'OutputHandler(tools: ToolRegistry)', fs: 15, fw: 800, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      ['search_web', 'query_db', 'call_api'].forEach((s, i) => pill(MX + 80 + i * 130, 200, s, INK, pop(u, 0.8 + i * 0.2), { mono: true, fs: 13.5 }));
      note(MX, 260, '마지막에 도구를 한 번 더 부를 수 있다', fade(u, 1.6)); return; }
    // finalize(answer, actions)
    code(MX, 40, ['finalize(answer="' + ANS + '",', '         actions=[{"name": "call_api", "args": {"url": "…/calendar", …}}])'], { fs: 13.5, shown: k === 2 ? E(u, 0.2, 1.8) * 2 : 2, title: '예시 입력', op: k >= 3 ? 0.5 : 1 });
    if (k === 2) return;
    if (k === 3 || k === 4) { grow(MX + 200, 120, MX + 100, 180, k === 3 ? E(u, 0.2, 0.8) : 1, INFO); grow(MX + 300, 120, MX + 470, 180, k === 3 ? E(u, 0.5, 1.1) : 1, ACC);
      bubble(MX, 210, ANS, 'l', { s: k === 3 ? pop(u, 0.9) : 1, fs: 14, stroke: INFO }); tx(MX, 262, '(1) 사용자 응답', { 'font-size': 14, 'font-weight': 800, fill: INFO });
      // 캘린더
      const cx = MX + 560, cy = 220; card(cx, cy, 170, 110, { rx: 10, stroke: ACC, sw: 2, s: k === 3 ? pop(u, 1.2) : 1 }); el('rect', { x: cx - 85, y: cy - 55, width: 170, height: 26, rx: 10, fill: ACC, opacity: k === 3 ? fade(u, 1.3) : 1 });
      tx(cx, cy - 37, '캘린더', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.3) : 1 }); tx(cx - 130, 300, '(2) 외부 작업', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: k === 3 ? fade(u, 1.4) : 1 });
      if (k === 4) { card(cx, cy + 12, 140, 38, { rx: 6, text: '부산 출장', fs: 14, fw: 700, fill: ACCBG, stroke: ACC, color: ACC, s: pop(u, 0.9) }); check(cx + 62, cy - 14, 9, pop(u, 1.3));
        code(MX, 330, ['side.append({"action": "call_api", "ok": True})'], { fs: 14, shown: E(u, 1.4, 2.2) }); }
      return; }
    // k6: 전체 경로
    [['user.py', 320], ['core.py', 450], ['tools.py · memory.py', 620], ['output.py', 800]].forEach(([n, x], i) => pill(x, 160, n, i === 3 ? ACC : INK, pop(u, 0.2 + i * 0.3), { mono: true, fs: 13.5 }));
    [[366, 404], [496, 522], [718, 746]].forEach(([a, b], i) => grow(a, 160, b, 160, E(u, 0.4 + i * 0.3, 0.7 + i * 0.3), MUT));
    code(MX, 230, ['HTTP 200 OK', '{"answer": "' + ANS + '",', ' "used_tools": ["search_web", "call_api"]}'], { fs: 14, shown: E(u, 1.4, 2.4) * 3, title: 'ChatResponse  (예시 값)' }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '라우터 user.py가 맡는 일은 무엇인가?',
      o: ['요청 형식을 검증하고 Core에 넘긴다', '도구를 골라 실행한다', '대화를 벡터로 저장한다'], a: 0,
      why: 'ChatRequest로 session_id와 message를 검증한 뒤 core.run에 위임한다. 판단은 AgentCore가 한다.' },
    { q: 'AgentCore.run()이 LLM에 보내는 messages의 순서는 무엇인가?',
      o: ['user, system, history', 'system, 이전 대화, 이번 질문', '도구 결과, user'], a: 1,
      why: 'SYSTEM_PROMPT를 맨 앞에, memory.load로 읽은 history를 가운데, 이번 질문을 끝에 둔다.' },
    { q: 'LLM이 search_web을 고르면 실제 함수를 부르는 곳은 어디인가?',
      o: ['Core의 SYSTEM_PROMPT', 'LLM 내부', 'ToolRegistry.dispatch'], a: 2,
      why: 'dispatch는 이름으로 self._tools에서 함수를 찾아 args를 풀어 await한다. 결과 JSON은 다시 Core로 올라간다.' },
    { q: 'MemoryStore.load()가 Redis에서 읽어 오는 범위는 어디인가?',
      o: ['질문과 비슷한 문서 3건', '이 세션의 최근 20건', '모든 사용자의 대화'], a: 1,
      why: 'lrange("chat:u-42", -20, -1)로 세션 리스트의 뒤쪽 20건만 읽는다. 비슷한 문서 3건은 recall이 벡터에서 찾는 것이다.' },
    { q: 'Output이 처리하는 두 갈래는 무엇인가?',
      o: ['검증과 위임', '단기 기억과 장기 기억', '사용자에게 보낼 답과 외부 시스템 작업'], a: 2,
      why: 'finalize는 답 텍스트를 RunResult에 담고, actions의 도구를 실제로 호출해 side_effects에 기록한다.' },
  ];

  // 완료 화면: 정리 문장과 장면을 엮는 복습 문제
  const summary = [
    '요청은 라우터에서 형식만 검증받고 AgentCore로 넘어간다.',
    'Core는 system, 이전 대화, 이번 질문을 묶어 LLM을 최대 5번 부른다.',
    'LLM이 고른 도구 이름은 ToolRegistry가 실제 함수로 이어 실행한다.',
    '기억은 Redis 최근 20건과 벡터 top-3로 나뉘고, 답과 외부 작업은 Output이 마무리한다.',
  ];
  const review = [
    { q: '도구 결과가 다음 LLM 판단에 반영되지 않는다. 먼저 볼 곳은?',
      o: ['결과를 messages에 붙이는 Core 루프', '라우터의 ChatRequest 스키마', 'Redis 연결 주소'], a: 0,
      why: 'Tools는 결과를 돌려줄 뿐이고, 그것을 messages에 붙여 다시 LLM에 넘기는 일은 Core 루프가 한다.' },
    { q: '어제 말한 "창가 자리 선호"를 Agent가 오늘 대화에서 기억하지 못한다. 확인할 곳은?',
      o: ['ToolRegistry 등록', 'remember()로 장기 저장했는지', 'ChatResponse 형태'], a: 1,
      why: 'Redis 단기 기억은 세션 단위다. 세션을 넘는 정보는 remember로 벡터에 남겨야 recall로 다시 찾을 수 있다.' },
    { q: 'call_api를 레지스트리에 넣었는데 LLM이 한 번도 고르지 않는다. 원인은?',
      o: ['Redis 리스트가 비어 있다', 'OutputHandler가 없다', 'schemas()에 call_api 스펙이 없다'], a: 2,
      why: 'schemas()는 search_web과 query_db 두 개만 돌려준다. LLM은 스펙으로 받은 도구만 고를 수 있다.' },
  ];

  R.page({ title: 'Agent 아키텍처 지도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
