/* I-2-2 자율성 스펙트럼 — 장면 5개 (../../anim/engine.js 규칙). L0~L5 게이지 아래로 요청 JSON·tool_choice·승인 프롬프트·가드레일·멀티에이전트 릴레이를 그린다 */
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

  // ---------- 위: 자율성 게이지 L0~L5 (페이지 데이터 filledLevels · activeLevel · risk) ----------
  const LV = ['Chatbot', 'Router', 'Tool Caller', 'ReAct', 'Autonomous', 'Multi-Agent'];
  const RISK = { '낮음': GOOD, '중간': WARN, '높음': BAD, '매우 높음': BAD };
  function gauge(c) { const b = c.beat, p = c.prev || {}, f = b.filledLevels || [], pf = p.filledLevels || [];
    LV.forEach((n, i) => { const x = 20 + i * 124, on = f.includes(i), fresh = on && !pf.includes(i) && c.k === 0, a = fresh ? E(c.u, 0.2, 1.0) : on ? 1 : 0, act = b.activeLevel === i;
      el('rect', { x, y: 16, width: 118, height: 44, rx: 8, fill: PANEL, stroke: act ? INK : GRID, 'stroke-width': act ? 3 : 1.5 });
      if (a > 0) el('rect', { x, y: 16, width: 118 * a, height: 44, rx: 8, fill: ACC, opacity: 0.25 + 0.13 * i });
      mono(x + 10, 34, 'L' + i, { 'font-size': 14, 'font-weight': 800, fill: act ? INK : on ? INK : OFF });
      tx(x + 10, 52, n, { 'font-size': 13.5, 'font-weight': 700, fill: act ? INK : on ? INK : OFF }); });
    tx(20, 76, '← 사람 주도', { 'font-size': 13.5, fill: MUT }); tx(760, 76, '완전 자율 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const rc = RISK[b.risk] || MUT, changed = p.risk !== b.risk;
    tx(860, 32, '위험도', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    card(860, 52, 120, 30, { rx: 15, text: b.risk, fs: 15, fw: 800, stroke: rc, color: b.risk === '매우 높음' ? PANEL : rc, fill: b.risk === '매우 높음' ? BAD : PANEL, s: changed ? 1 + R.bump(c.u, 0.2) : 1 }); }
  // ---------- 아래: 사람 · Agent · 가드레일 (beat 마다 바뀌는 역할) ----------
  function roles(c) { const b = c.beat, p = c.prev || {};
    [['사람', b.humanRole, p.humanRole, INFO], ['Agent', b.agentRole, p.agentRole, ACC], ['가드레일', b.guardrail, p.guardrail, WARN]].forEach(([h, s, ps, col], i) => { const x = 20 + i * 310, ch = s !== ps;
      el('rect', { x, y: 352, width: 300, height: 58, rx: 10, fill: PANEL, stroke: ch ? col : GRID, 'stroke-width': ch ? 2.2 : 1.5 });
      tx(x + 12, 372, h, { 'font-size': 13.5, 'font-weight': 800, fill: col });
      tx(x + 12, 396, s, { 'font-size': tw(s, 14) > 276 ? 13.5 : 14, 'font-weight': 600, opacity: ch ? fade(c.u, 0.3) : 1 }); }); }
  function frame(c) { gauge(c); roles(c); }
  const Y0 = 112;   // 가운데 본문 시작

  // ---------- 1. L0~1 챗봇: LLM 한 번, 도구 0개 ----------
  function s1(t, c) { const { k, u } = c; frame(c);
    if (k === 0) { code(20, Y0, ['"""Level 0: 단순 챗봇 — 외부 행동 없이 텍스트만 반환', '특징: LLM 호출 1회. 도구 사용 X. 자율성 0"""'], { fs: 14.5, shown: E(u, 0.2, 1.6) * 2 });
      pill(200, 220, 'LLM 호출 1회', ACC, pop(u, 1.6), { fs: 15 }); pill(380, 220, '도구 0개', MUT, pop(u, 1.9), { fs: 15 }); return; }
    card(480, 210, 150, 54, { rx: 10, text: 'LLM', fs: 17, fw: 800, stroke: ACC, fill: ACCBG, color: ACC });
    pill(480, 150, 'client = Anthropic()', INK, k === 1 ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 });
    if (k === 1) { note(580, 215, '이 통로 하나가 능력의 전부', fade(u, 1.2)); return; }
    if (k === 2 || k === 6) { const out = k === 6 ? '라벨 1개 (예: 담당 부서)' : 'str';
      card(150, 210, 210, 44, { rx: 8, text: 'user_message: str', fs: 14, mono: true, s: k === 2 ? pop(u, 0.2) : 1 }); grow(258, 210, 400, 210, k === 2 ? E(u, 0.5, 1.0) : E(u, 0.3, 0.8), MUT);
      grow(558, 210, 700, 210, E(u, 1.0, 1.5), MUT); card(800, 210, k === 6 ? 210 : 90, 44, { rx: 8, text: out, fs: 14, mono: k !== 6, stroke: k === 6 ? WARN : INK, color: k === 6 ? WARN : INK, s: pop(u, 1.5) });
      note(330, 310, k === 6 ? 'Level 1 라우터도 구조는 같다. 출력이 라벨일 뿐' : '상태도 루프도 없다', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 3) { code(20, Y0 + 10, ['{"model": "claude-sonnet-4-6",', ' "max_tokens": 1024,', ' "messages": [{"role": "user",', '   "content": "환불 정책이 어떻게 되나요?"}]}'], { fs: 14, shown: E(u, 0.2, 1.6) * 4, title: 'messages.create(…) 1회' });
      dot([[350, 180], [405, 205]], seg(u, 1.8, 2.4), ACC, 7); return; }
    if (k === 4) { code(20, Y0 + 30, ['response.content[0].text'], { fs: 15, shown: E(u, 0.2, 0.8) }); grow(558, 210, 650, 210, E(u, 0.8, 1.2), MUT);
      bubble(660, 210, '(답 텍스트)', 'l', { s: pop(u, 1.1), fs: 14.5 }); pill(860, 210, '끝', BAD, pop(u, 1.8), { fs: 14 }); return; }
    // k5: 사람이 부를 때만 한 번
    [0, 1, 2].forEach((i) => { const x = 160 + i * 270, a = E(u, 0.2 + i * 0.6, 0.7 + i * 0.6);
      person(x - 60, 300, null, { s: 0.7 * pop(u, 0.2 + i * 0.6) }); grow(x - 30, 285, x + 50, 240, a, INFO); mono(x + 60, 236, 'chatbot()', { 'font-size': 13.5, fill: INFO, opacity: a }); });
    note(560, 150, '스스로 시작하지 않는다', fade(u, 2.0), { fill: MUT }); }

  // ---------- 2. L2 Tool Caller: 도구는 사람이 정한다 ----------
  function s2(t, c) { const { k, u } = c; frame(c);
    const SC = ['GET_WEATHER = {"name": "get_weather",', '  "description": "도시 이름으로 현재 날씨 조회",', '  "input_schema": {"properties": {"city": {"type": "string"}},', '                   "required": ["city"]}}'];
    code(20, Y0, SC, { fs: 13.5, shown: k === 0 ? E(u, 0.3, 1.8) * 4 : 4, op: k >= 2 ? 0.45 : 1, title: '사람이 직접 쓴 도구 1개' });
    if (k === 0) { person(640, 170, '사람', { s: pop(u, 0.2) }); grow(610, 160, 560, 150, E(u, 0.6, 1.0), INFO); return; }
    if (k === 1) { code(20, 230, ['def get_weather(city: str) -> dict:', '    return {"city": city, "temp": 22, "cond": "맑음"}   # 예시'], { fs: 14, shown: E(u, 0.2, 1.4) * 2 }); note(560, 255, '실행 주체는 사람이 짠 코드', fade(u, 1.6)); return; }
    if (k === 2) { bubble(560, 230, '서울 날씨 알려줘', 'l', { s: pop(u, 0.3), fill: INFO, color: PANEL, stroke: 'none' }); grow(720, 230, 790, 230, E(u, 0.8, 1.2), MUT);
      mono(800, 235, 'call_with_tool()', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    // 문이 하나뿐인 LLM
    card(160, 260, 130, 50, { rx: 10, text: 'LLM', fs: 16, fw: 800, stroke: ACC, fill: ACCBG, color: ACC });
    card(430, 260, 170, 50, { rx: 10, text: 'get_weather', fs: 15, fw: 800, mono: true, stroke: INK, s: k === 3 ? pop(u, 0.2) : 1 });
    grow(226, 260, 342, 260, k === 3 ? E(u, 0.4, 0.9) : 1, ACC);
    if (k === 3) { R.lock(300, 228, true, INK, pop(u, 1.0)); code(560, 230, ['tool_choice={"type": "tool",', '             "name": "get_weather"}'], { fs: 13.5, shown: E(u, 1.2, 2.2) * 2 }); return; }
    if (k === 4) { code(540, 226, ['tool_use.input = {"city": "서울"}', 'get_weather(**tool_use.input)  # 사람 코드'], { fs: 13.5, shown: E(u, 0.2, 1.8) * 2 }); return; }
    if (k === 5) { terminal(560, 226, 380, 100, ['$ python level-2-tool-call.py', ["{'city': '서울', 'temp': 22, 'cond': '맑음'}", 'var(--panel)']], E(u, 0.3, 1.6) * 2, { title: 'print(result)' }); return; }
    // k6: 도구가 늘면 분기가 는다
    ['if …:    tools=[도구 A]', 'elif …:  tools=[도구 B]', 'elif …:  tools=[도구 C]', 'elif …:  …'].forEach((s, i) => mono(560, 220 + i * 26, s, { 'font-size': 14, fill: i ? WARN : INK, opacity: fade(u, 0.2 + i * 0.45) }));
    note(560, 335, '분기는 전부 사람이 짜고 고친다', fade(u, 2.1), { fill: WARN }); }

  // ---------- 3. L3 ReAct: LLM 이 고르고, 사람이 step 마다 승인 ----------
  const T3 = [['search_web', '웹 검색', INK], ['read_file', '파일 읽기', INK], ['send_email', '이메일 발송', BAD]];
  function s3(t, c) { const { k, u } = c; frame(c);
    tx(20, Y0 + 8, 'TOOLS', { 'font-size': 13.5, 'font-weight': 800, class: 'mono', fill: MUT });
    const pick = k === 4 ? (u < 1.8 ? Math.floor(u * 4) % 3 : 1) : k >= 5 && k <= 7 ? 1 : -1;
    T3.forEach(([n, d, col], i) => { if (k === 0 && i) return; const y = Y0 + 36 + i * 44, s = (k === 0 && i === 0) || (k === 1 && i > 0) ? pop(u, 0.3 + i * 0.3) : 1, hot = pick === i;
      card(100, y, 160, 36, { rx: 8, text: n, fs: 14, fw: 800, mono: true, stroke: hot ? ACC : col, color: hot ? ACC : col, fill: hot ? ACCBG : PANEL, s });
      if (s > 0.5) tx(190, y + 5, d, { 'font-size': 13.5, fill: MUT }); });
    if (k === 1) { pill(340, Y0 + 124, '되돌릴 수 없는 행동', BAD, pop(u, 1.3), { fs: 13.5, fill: BADBG }); return; }
    if (k === 0) return;
    if (k === 2) { code(320, Y0 + 20, ['def execute_tool(name, args):', '    if name == "search_web": …', '    if name == "read_file":  …', '    if name == "send_email": …', '    raise ValueError(name)'], { fs: 14, shown: E(u, 0.2, 1.8) * 5, hi: (i) => i === 4 && u > 2 });
      return; }
    // 메시지 + 루프
    const rows = [['user', 'README.md 요약해 user@x.com으로 메일'], ['assistant', 'tool_use: read_file({"path": "README.md"})'], ['user', 'tool_result: (README 내용)', { label: 'result' }]];
    msgs(320, Y0 + 34, 610, rows, k === 3 ? E(u, 0.3, 1.2) : k <= 6 ? 1 : 1 + E(u, 0.2, 1.8) * 2, { title: 'messages  (while True)', fs: 13.5 });
    if (k === 3) { note(320, 230, '목표 한 문장으로 여러 번 돌 준비', fade(u, 1.5)); return; }
    if (k === 4) { note(320, 230, 'tools=TOOLS로 후보 전부를 넘긴다. 고르는 건 LLM', fade(u, 1.9)); return; }
    if (k === 5) { card(420, 250, 230, 40, { rx: 8, text: 'stop_reason == "end_turn"?', fs: 13.5, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.3) });
      grow(536, 250, 640, 250, E(u, 0.8, 1.3), OFF, { dash: '5 4' }); tx(690, 255, '예: 답 반환', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) });
      grow(420, 272, 420, 316, E(u, 1.4, 1.9), ACC); tx(434, 312, '아니오 (tool_use): 계속', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 6) { terminal(320, 210, 610, 92, ["[승인?] read_file({'path': 'README.md'}) y/n: y"], E(u, 0.3, 2.0), { title: 'input()' }); return; }
    if (k === 7) return;
    // k8: 두 번 승인
    [['read_file', '승인 y'], ['send_email', '승인 y'], ['end_turn', '답 반환']].forEach(([a, b], i) => { const x = 160 + i * 300, s = pop(u, 0.2 + i * 0.6);
      pill(x, 270, a, i === 2 ? GOOD : ACC, s, { mono: true, fs: 13.5 }); if (i < 2) { pill(x, 306, b, INFO, pop(u, 0.5 + i * 0.6), { fs: 13.5 }); grow(x + 70, 270, x + 220, 270, E(u, 0.6 + i * 0.6, 0.9 + i * 0.6), MUT); } }); }

  // ---------- 4. L4 자율 실행: 승인 대신 가드레일 ----------
  function s4(t, c) { const { k, u } = c; frame(c);
    const GR = ['max_iterations = 20', 'max_cost_usd   = ' + (k === 8 ? '2.0' : '5.0'), 'allowed_tools  = (search_web, read_file, write_file)', 'forbidden_paths = (/etc, /home)'];
    code(20, Y0, GR, { fs: 13.5, shown: k === 0 ? E(u, 0.2, 2.0) * 4 : 4, title: 'Guardrails', hi: (i) => (k === 2 && i === 0) || (k === 3 && i === 1) || (k === 5 && i === 2) || (k === 8 && i === 1) || (k === 7 && i === 0), op: 1 });
    if (k === 0) return;
    // 비용 계기 · 반복 칸
    const steps = k <= 2 ? 0 : k === 3 ? E(u, 0.3, 0.8) : k <= 6 ? (k === 4 ? 2 : k === 5 ? 3 : 4) : 20, cost = steps * 0.01;
    tx(520, Y0 + 8, 'self.cost', { 'font-size': 13.5, 'font-weight': 800, class: 'mono', fill: MUT });
    mono(520, Y0 + 38, '$' + (k === 7 ? tween(0.04, 0.2, u) : cost).toFixed(2), { 'font-size': 22, 'font-weight': 800, fill: ACC });
    mono(640, Y0 + 38, '/ $' + (k === 8 ? '2.00' : '5.00'), { 'font-size': 15, fill: MUT });
    if (k >= 2) { tx(520, Y0 + 72, 'for step in range(20)', { 'font-size': 13.5, class: 'mono', 'font-weight': 700 }); slots(520, Y0 + 82, 20, k === 7 ? lerp(4, 20, E(u, 0.2, 1.6)) : Math.ceil(steps), { w: 17, h: 16, gap: 3 }); }
    if (k === 1) { note(520, Y0 + 80, '가드레일을 품고, 누적 비용 0에서 시작', fade(u, 0.8)); return; }
    if (k === 2) { card(640, 260, 300, 40, { rx: 8, text: 'cost > max_cost_usd → halted', fs: 13.5, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.0) }); return; }
    if (k === 3) { code(520, 230, ['self.cost += self._estimate_cost(resp)', '# _estimate_cost는 0.01을 돌려준다'], { fs: 13.5, shown: E(u, 0.8, 1.8) * 2 }); return; }
    if (k === 4) { [['end_turn', INK], ['_self_check ✗', BAD], ['"다시 검토해줘"', WARN]].forEach(([s, col], i) => { pill(560 + i * 130, 250, s, col, pop(u, 0.2 + i * 0.5), { fs: 13.5, mono: i < 2 }); if (i < 2) grow(612 + i * 130, 250, 630 + i * 130, 250, E(u, 0.5 + i * 0.5, 0.8 + i * 0.5), MUT); });
      note(520, 300, '통과해야 done. 떨어지면 다시 돈다', fade(u, 1.8)); return; }
    if (k === 5) { pill(600, 250, 'send_email (예)', BAD, pop(u, 0.2), { mono: true, fs: 13.5 }); cross(690, 250, 10, pop(u, 0.8));
      code(520, 280, ['{"status": "blocked", "tool": "send_email"}'], { fs: 13.5, shown: E(u, 1.2, 2.0) }); return; }
    if (k === 6) { terminal(520, 226, 410, 52, ['[승인?] … y/n:'], 1, {}); el('line', { x1: 520, y1: 252, x2: 930, y2: 252, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.5) });
      note(520, 304, '승인 없이 바로 _execute, 결과는 messages로', fade(u, 1.2), { fill: ACC }); return; }
    if (k === 7) { code(520, 236, ['return {"status": "max_iter"}'], { fs: 14, shown: E(u, 1.6, 2.2) }); note(520, 300, '20회 × $0.01 = $0.20에서 멈춘다', fade(u, 2.0), { fill: MUT }); return; }
    code(520, 226, ['agent.run("최근 한 달 issues → weekly-report.md 작성")'], { fs: 13.5, shown: E(u, 0.2, 1.4) });
    pill(700, 300, '사람은 결과 dict만 받는다', INFO, pop(u, 1.6), { fs: 14 }); }

  // ---------- 5. L5 Multi-Agent: Agent 가 Agent 를 부린다 ----------
  const TEAM = [['researcher', 'search_web'], ['coder', 'write_file'], ['reviewer', 'read_file']];
  function s5(t, c) { const { k, u } = c; frame(c);
    if (k === 0) { code(20, Y0, ['@dataclass', 'class SubAgent:', '    name: str', '    role: str           # researcher / coder / reviewer', '    system_prompt: str', '    allowed_tools: list'], { fs: 13.5, shown: E(u, 0.2, 2.0) * 6 }); return; }
    if (k === 1) { code(20, Y0, ['client.messages.create(', '    system=self.system_prompt,', '    messages=[*memory, {"role": "user", "content": task}])', '→ resp.content[-1].text'], { fs: 13.5, shown: E(u, 0.2, 2.0) * 4, title: 'execute(task, memory)' }); return; }
    if (k === 2) { code(20, Y0, ['store: list = []', 'remember(fact)  → store.append(fact)', 'recall(q)       → 낱말이 하나라도 겹치는 fact'], { fs: 14, shown: E(u, 0.2, 1.6) * 3, title: 'LongTermMemory  (실전은 vector DB)' });
      ['researcher: …', 'coder: …'].forEach((s, i) => msg(560, 140 + i * 36, 360, 'tool', s, { u: E(u, 1.4 + i * 0.3, 2.0 + i * 0.3), label: 'fact', fs: 13.5 })); return; }
    // 조율자 + 팀
    const ox = 170, oy = 220;
    card(ox, oy, 180, 56, { rx: 12, text: 'Orchestrator', fs: 16, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: k === 3 ? pop(u, 0.2) : 1 });
    R.dbIcon(ox, 305, null, { s: 0.45 }); tx(ox + 34, 312, 'LongTermMemory', { 'font-size': 13.5, fill: MUT });
    TEAM.forEach(([r, tool], i) => { const x = 470 + i * 160, y = 150, s = k === 3 ? pop(u, 0.6 + i * 0.25) : 1, hot = k === 8 && Math.floor(E(u, 0.3, 2.4) * 3) === i;
      grow(ox + 92, oy - 10, x - 60, y + 14, k === 3 ? E(u, 0.6 + i * 0.25, 1.0 + i * 0.25) : 1, GRID, { plain: true });
      card(x, y, 140, 46, { rx: 10, text: r, fs: 14.5, fw: 800, mono: true, stroke: hot ? ACC : INK, fill: hot ? ACC : PANEL, color: hot ? PANEL : INK, s });
      if (k >= 7) pill(x, y + 44, tool, INK, k === 7 ? pop(u, 0.4 + i * 0.3) : 1, { mono: true, fs: 13.5 }); });
    if (k === 3) { note(420, 240, '여기서부터 Agent가 Agent를 부린다', fade(u, 1.6)); return; }
    if (k === 4) { code(400, 230, ['plan = self._plan("RAG PoC 구현 + 벤치마크 + 보고서")', '→ [{"role": "researcher", …}, {"role": "coder", …}, …]   # 예시'], { fs: 13.5, shown: E(u, 0.2, 1.8) * 2 }); return; }
    if (k === 5) { code(400, 230, ['ctx = self.memory.recall(step["task"])', 'out = agent.execute(step["task"], memory=self._msg(ctx))', 'self.memory.remember(f"{role}: {out[:80]}")'], { fs: 13.5, shown: E(u, 0.2, 2.0) * 3 });
      dot([[ox, 290], [ox, 250]], seg(u, 0.3, 0.9), INFO, 6); dot([[ox, 250], [ox, 290]], seg(u, 1.8, 2.4), ACC, 6); return; }
    if (k === 6) { ['researcher 결과', 'coder 결과', 'reviewer 결과'].forEach((s, i) => fly(470 + i * 160, 180, 560, 290, seg(u, 0.2 + i * 0.3, 1.0 + i * 0.3), s, { fill: INK }));
      card(640, 290, 200, 44, { rx: 10, text: '_synthesize → 보고', fs: 14.5, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.6) }); return; }
    if (k === 7) { note(420, 260, '역할마다 다른 도구 권한', fade(u, 1.4)); return; }
    pill(170, 140, '미션 한 줄', INFO, pop(u, 0.1), { fs: 14 });
    grow(540, 150, 560, 150, 1, MUT); grow(700, 150, 720, 150, 1, MUT);
    note(420, 270, 'researcher → coder → reviewer가 알아서 이어진다', fade(u, 2.2)); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'Level 0 챗봇에서 LLM은 언제, 몇 번 불리나?',
      o: ['사람이 부를 때 한 번', '스스로 여러 번 반복해서', '도구 실행이 끝날 때까지'], a: 0,
      why: 'chatbot()은 str을 받아 messages.create를 한 번 부르고 텍스트를 돌려준다. 시작도 횟수도 사람이 정한다.' },
    { q: 'Level 2에서 어떤 도구를 쓸지 정하는 쪽은 누구인가?',
      o: ['LLM', '사람이 tool_choice로 지정', '도구 자신'], a: 1,
      why: 'tools에 GET_WEATHER 하나만 주고 tool_choice로 그 도구를 강제한다. LLM은 city 인자만 채운다.' },
    { q: 'Level 3 코드에서 도구가 실행되기 직전에 일어나는 일은 무엇인가?',
      o: ['비용 한도를 검사한다', '곧바로 실행된다', 'input()으로 사람에게 y/n 승인을 받는다'], a: 2,
      why: 'LLM이 고른 도구와 인자를 보여 주고 y가 아니면 "사용자 거부"로 멈춘다. 선택은 LLM, 승인은 사람이다.' },
    { q: 'Level 4에서 승인 프롬프트 대신 위험한 도구를 막는 것은 무엇인가?',
      o: ['allowed_tools 화이트리스트', 'max_tokens 값', '시스템 프롬프트 문구'], a: 0,
      why: '목록 밖 도구를 고르면 {"status": "blocked"}로 끝난다. 반복 20회와 비용 한도도 함께 브레이크 역할을 한다.' },
    { q: 'Orchestrator가 계획의 단계마다 하는 일은 무엇인가?',
      o: ['모든 도구를 직접 실행한다', '담당 에이전트에 위임하고 결과를 기억한다', '단계마다 사람 승인을 받는다'], a: 1,
      why: 'step["role"]로 에이전트를 찾아 recall한 기억과 함께 넘기고, 결과 앞 80자를 remember로 남긴다.' },
  ];

  // 완료 화면: 정리 문장과 장면을 엮는 복습 문제
  const summary = [
    'L0~1은 사람이 부를 때 LLM을 한 번 불러 텍스트만 돌려준다.',
    'L2는 도구를 쓰지만 어떤 도구를 쓸지는 사람이 tool_choice로 정한다.',
    'L3은 LLM이 도구를 고르고, 사람이 step마다 y/n으로 승인한다.',
    'L4는 승인 대신 반복 20회, 비용 한도, 도구 화이트리스트로 막고 L5는 Agent가 Agent를 부린다.',
  ];
  const review = [
    { q: '사내 문서를 요약해 메일로 보내는 Agent를 만든다. 메일은 되돌릴 수 없다. 알맞은 수준은?',
      o: ['L0 챗봇', '보내기 전 사람이 승인하는 L3', 'send_email을 허용한 L4'], a: 1,
      why: '되돌릴 수 없는 행동은 실행 전에 사람이 확인하는 편이 안전하다. L4는 승인 없이 바로 실행한다.' },
    { q: 'L4 Agent가 {"status": "max_iter"}로 끝났다. 비용 한도 $2.0에는 왜 걸리지 않았나?',
      o: ['회당 $0.01이라 20회에도 $0.20이다', '비용 검사가 루프 밖에 있다', 'max_cost_usd가 무시된다'], a: 0,
      why: '_estimate_cost는 0.01을 돌려주므로 20회를 다 돌아도 $0.20이다. 이 설정에서는 반복 상한이 먼저 걸린다.' },
    { q: 'L5 팀에서 researcher가 잘못 저장한 사실 때문에 coder 결과까지 틀렸다. 먼저 손볼 곳은?',
      o: ['coder의 allowed_tools', '사람 승인 프롬프트', '장기 메모리에 남기는 내용과 recall 규칙'], a: 2,
      why: '기억은 다음 단계에 그대로 붙어 넘어간다. 틀린 fact가 recall되면 이어지는 에이전트도 그 위에서 일한다.' },
  ];

  R.page({ title: '자율성 스펙트럼', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
