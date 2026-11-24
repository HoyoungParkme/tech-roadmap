/* IV-2-2 MCP 통신 흐름 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 왼쪽 시퀀스(Client ↔ Server)는 STEPS 의 messages·activeId 를, 오른쪽 JSON 은 각 메시지의 payload 를 그대로 그린다.
 * Step 5 의 오류 응답과 종료 코드는 SDK 서버를 직접 띄워 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const JRE = /("(?:[^"\\]|\\.)*")(\s*:)?|(\/\/.*$)|(-?\b\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)/g;
  function jtok(line) { const out = []; let i = 0, m; JRE.lastIndex = 0;
    while ((m = JRE.exec(line))) { if (m.index > i) out.push([line.slice(i, m.index), {}]);
      if (m[1]) { out.push([m[1], m[2] ? { fill: INFO, 'font-weight': 700 } : { fill: ACC }]); if (m[2]) out.push([m[2], {}]); }
      else if (m[3]) out.push([m[3], { fill: MUT }]); else out.push([m[4], { fill: WARN, 'font-weight': 700 }]);
      i = JRE.lastIndex; }
    if (i < line.length) out.push([line.slice(i), {}]); return out; }
  function codePanel(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, shown = o.shown ?? lines.length, op = o.op ?? 1;
    const top = o.title ? 34 : 12, h = o.h || lines.length * lh + top + 10;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, opacity: op });
    if (o.title) mono(x + 14, y + 22, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.stroke || MUT, opacity: op });
    const n = Math.ceil(shown);
    lines.slice(0, n).forEach((s, i) => { const part = i === n - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s, yy = y + top + i * lh;
      if (o.hi && o.hi.includes(i)) el('rect', { x: x + 5, y: yy, width: w - 10, height: lh, rx: 4, fill: 'var(--hl)', opacity: 0.55 * op });
      spans(x + 14, yy + fs * 0.95, jtok(part), { 'font-size': fs, opacity: op }); });
    return h; }
  // JSON 을 짧은 것은 한 줄로, 긴 것은 펼쳐서 줄 배열로
  const PXW = 430, pw = (s, ind) => tw(s, 13.5) + ind * 8.1;   // 판 안 글자 폭 어림
  function jfmt(v, ind, ex) { ind = ind || 0; ex = ex || 0; const s = JSON.stringify(v);
    if (typeof v === 'string') { let t = s; while (pw(t, ind + ex) > PXW && t.length > 8) t = t.slice(0, -3) + '…"'; return [t]; }
    if (v === null || typeof v !== 'object' || pw(s, ind + ex) <= PXW) return [s];
    const arr = Array.isArray(v), ent = arr ? v.map((x) => [null, x]) : Object.entries(v), out = [arr ? '[' : '{'];
    ent.forEach(([k, x], i) => { const pre = ' '.repeat(ind + 2) + (k !== null ? JSON.stringify(k) + ': ' : ''), sb = jfmt(x, ind + 2, pre.length - ind - 2), cm = i < ent.length - 1 ? ',' : '';
      if (sb.length === 1) out.push(pre + sb[0] + cm); else { out.push(pre + sb[0]); sb.slice(1, -1).forEach((l) => out.push(l)); out.push(sb[sb.length - 1] + cm); } });
    out.push(' '.repeat(ind) + (arr ? ']' : '}')); return out; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: INK, opacity: op ?? 1 }, a || {}));
  const KC = { request: ACC, response: INFO, notification: WARN };
  const colOf = (m) => (m.payload && m.payload.error ? BAD : KC[m.kind] || INK);

  // 왼쪽 시퀀스: Client(x=70) ↔ Server(x=420), 메시지마다 한 줄
  const LX = 70, RX = 420;
  function seq(c, o) { o = o || {}; const b = c.beat, ms = b.messages, gap = o.gap || Math.min(52, 300 / ms.length), y0 = o.y0 || 100;
    card(LX, 44, 110, 36, { rx: 8, text: 'Client', fs: 15, stroke: ACC, color: ACC, fill: ACCBG });
    card(RX, 44, 110, 36, { rx: 8, text: 'Server', fs: 15, stroke: INFO, color: INFO, fill: INFOBG });
    el('line', { x1: LX, y1: 62, x2: LX, y2: 404, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    el('line', { x1: RX, y1: 62, x2: RX, y2: 404, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    const prevHit = new Set(((c.prev && c.prev.messages) || []).filter((m) => m.hit).map((m) => m.id));
    ms.forEach((m, i) => { const y = y0 + i * gap, toR = m.from === 'client', col = m.hit ? colOf(m) : OFF, act = m.id === b.activeId && m.hit;
      const fresh = m.hit && !prevHit.has(m.id), g = fresh ? seg(c.u, 0.2, 1.0) : m.hit ? 1 : 1;
      const x1 = toR ? LX + 6 : RX - 6, x2 = toR ? RX - 6 : LX + 6;
      if (g > 0) el('line', { x1, y1: y, x2: lerp(x1, x2, g), y2: y, stroke: col, 'stroke-width': act ? 3.2 : 2, 'stroke-dasharray': m.kind === 'notification' ? '7 5' : null, 'marker-end': g > 0.98 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null });
      const idTxt = m.payload && m.payload.id != null ? '  #' + m.payload.id : '';
      mono((LX + RX) / 2, y - 8, m.label + idTxt, { 'font-size': 13.5, 'font-weight': act ? 800 : 600, 'text-anchor': 'middle', fill: m.hit ? (act ? col : INK) : MUT, opacity: m.hit ? 1 : 0.7 }); });
    return { y: (i) => y0 + i * gap }; }
  // 오른쪽 JSON 카드: 지금 메시지의 payload (또는 그 일부)
  function payloadCard(m, part, o) { o = o || {}; if (!m || !m.payload) return 0; const v = part ? part(m.payload) : m.payload, L = jfmt(v);
    if (o.hm) o.hi = L.map((l, i) => (o.hm.some((h) => l.includes(h)) ? i : -1)).filter((i) => i >= 0);
    return codePanel(470, o.y || 30, 470, L, { fs: 13.5, lh: o.lh || 19.5, title: o.title || (m.kind + (m.payload.id != null ? ' · id ' + m.payload.id : ' · id 없음')), stroke: colOf(m), hi: o.hi, shown: o.typing ? E(c0.u, 0.3, 1.4) * L.length : L.length }); }
  let c0 = null;   // payloadCard 가 타이핑 시간을 읽는다
  const act = (c) => c.beat.messages.find((m) => m.id === c.beat.activeId);

  // ---------- 1. Initialize: 능력을 밝히고 합의한다 ----------
  function s1(t, c) { c0 = c; const { k, u } = c, m = act(c);
    seq(c, { y0: 120, gap: 70 });
    if (k <= 1) { payloadCard(m, null, { typing: k === 0, hm: k === 0 ? ['"id"', '"method"'] : ['protocolVersion', 'capabilities', 'clientInfo'] });
      if (k === 1) { ['roots', 'sampling'].forEach((s, i) => fly(LX + 20, 120, RX - 20, 120, seg(u, 0.6 + i * 0.3, 1.6 + i * 0.3), s, { mono: true }));
        note(245, 340, 'Client가 해 줄 수 있는 일을 먼저 밝힌다', fade(u, 1.8), { 'text-anchor': 'middle' }); }
      return; }
    if (k <= 3) { if (k === 2) payloadCard(m, (p) => ({ jsonrpc: p.jsonrpc, id: p.id, result: { protocolVersion: p.result.protocolVersion, capabilities: '…', serverInfo: p.result.serverInfo } }), { hm: ['"id"'] });
      else payloadCard(m, (p) => ({ result: { capabilities: p.result.capabilities } }), { hm: ['subscribe'] });
      if (k === 2) { card(705, 360, 300, 56, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 1.0) });
        mono(705, 366, '요청 #1 ↔ 응답 #1 짝 맞음', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.1) }); }
      if (k === 3) note(705, 380, 'subscribe: true → 나중에 구독할 수 있다', fade(u, 1.2), { 'text-anchor': 'middle', fill: INFO });
      return; }
    if (k === 4) { payloadCard(m, null, { hm: ['method'] });
      card(705, 220, 300, 60, { rx: 10, stroke: WARN, dash: '6 5', text: 'id 없음 → 답을 기다리지 않는다', fs: 14.5, color: WARN, s: pop(u, 1.0) });
      note(705, 320, '핸드셰이크 끝 · 본 통신 시작', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    // k5: id 로 갈라 담기
    [['id 있음', 'request / response', ACC, ['initialize #1', 'result #1']], ['id 없음', 'notification', WARN, ['notifications/initialized']]].forEach(([h, d, col, items], i) => {
      const x = 590 + i * 240; card(x, 230, 220, 250, { rx: 14, stroke: col, sw: 2.5, s: pop(u, 0.2 + i * 0.2) });
      tx(x, 130, h, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.3) });
      mono(x, 156, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
      items.forEach((s, j) => { const f = seg(u, 0.6 + (i * 2 + j) * 0.35, 1.2 + (i * 2 + j) * 0.35); if (f <= 0) return;
        card(x, lerp(60, 200 + j * 46, E(f, 0, 1)), Math.min(tw(s, 13.5) + 24, 210), 32, { rx: 16, text: s, fs: 13.5, mono: true, fill: col, stroke: 'none', color: PANEL }); }); }); }

  // ---------- 2. Discovery: 목록이 곧 계약서 ----------
  function s2(t, c) { c0 = c; const { k, u } = c, m = act(c);
    seq(c, { y0: 96, gap: 44 });
    if (k === 0) { payloadCard(m, null, { typing: true }); note(705, 140, 'params도 없는 한 줄', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { payloadCard(m, (p) => ({ result: { tools: p.result.tools.map((x) => ({ name: x.name, inputSchema: '…' })) } }), {});
      note(705, 260, 'result.tools[] = 이 Server의 도구들', fade(u, 1.0), { 'text-anchor': 'middle' }); return; }
    if (k === 2 || k === 3) { const tool = m.payload.result.tools[k - 2];
      payloadCard(m, () => tool, { title: 'tools[' + (k - 2) + ']', hm: k === 2 ? ['required'] : ['days'] });
      // LLM 이 보는 함수 모양
      const req = (tool.inputSchema.required || []), props = Object.keys(tool.inputSchema.properties);
      const sig = tool.name + '(' + props.map((p) => p + (req.includes(p) ? '' : '?')).join(', ') + ')';
      card(705, 340, 440, 56, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 1.0) });
      mono(705, 346, sig, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.1) });
      tx(705, 392, k === 2 ? 'LLM은 이 모양으로 city를 채운다' : 'required가 없어 days는 빼도 된다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 4) { payloadCard(m, null, { typing: true }); note(705, 140, 'method만 바뀐 같은 모양', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k === 5) { payloadCard(m, (p) => p.result.resources, { title: 'result.resources', hm: ['"uri"'] });
      ['seoul', 'busan'].forEach((s, i) => pill(620 + i * 170, 330, 'weather://' + '…/' + s, INFO, pop(u, 0.8 + i * 0.3), { mono: true, fs: 13.5 }));
      tx(705, 380, '스킴은 Server가 마음대로 정한다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); return; }
    // k6: LLM 요청에 실리는 도구 목록
    tx(482, 50, 'LLM 호출에 함께 실리는 도구 후보', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const tools = c.beat.messages.find((x) => x.id === 'tools-list-res');
    ['get_weather', 'get_forecast'].forEach((n, i) => { const y = 100 + i * 70, s = pop(u, 0.3 + i * 0.3);
      card(705, y, 460, 56, { rx: 10, stroke: ACC, s }); mono(490, y + 5, n, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: s });
      mono(920, y + 5, i ? 'city, days?' : 'city', { 'font-size': 14, 'text-anchor': 'end', opacity: s }); });
    card(705, 290, 460, 60, { rx: 10, stroke: INFO, dash: '6 5', s: pop(u, 1.1) });
    mono(705, 286, 'inputSchema = 인자 검증 규칙', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) });
    tx(705, 308, 'prompts/list도 같은 방식으로 받는다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) }); }

  // ---------- 3. Invocation: 호출 → 실행 → 결과 ----------
  function s3(t, c) { c0 = c; const { k, u } = c, m = act(c);
    seq(c, { y0: 110, gap: 56 });
    if (k <= 1) { payloadCard(m, null, { typing: k === 0, hm: k === 0 ? ['"id"', '"method"'] : ['"params"', 'arguments'] });
      if (k === 1) { card(705, 330, 400, 54, { rx: 27, stroke: ACC, fill: ACCBG, s: pop(u, 0.9) });
        mono(705, 336, 'LLM: get_weather(city="서울")', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) }); }
      return; }
    if (k === 2) { // Server 안에서 파이썬 함수가 돈다
      codePanel(470, 40, 470, ['@mcp.tool()', 'def get_weather(city: str) -> str:', '    data = weather_api.fetch(city)', '    return f"{city}: {data.summary}, …"'], { fs: 14, lh: 22, title: 'Server 안 (Python 예시)', stroke: INFO, hi: [1, 2] });
      const f = seg(u, 0.8, 2.0); fly(560, 200, 860, 200, f, 'weather_api.fetch("서울")', { mono: true, fill: INFO, stay: true });
      tx(705, 290, '외부 API 결과를 문자열로 돌려준다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { payloadCard(m, null, { hm: ['"text"', 'isError'] });
      card(705, 372, 420, 56, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 1.0) });
      tx(705, 378, '서울: 맑음, 24°C, 습도 55%  (예시 값)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.1) }); return; }
    if (k === 4) { const err = { jsonrpc: '2.0', id: 4, error: { code: -32602, message: 'Invalid params', data: { field: 'city', reason: 'missing' } } };
      codePanel(470, 40, 470, jfmt(err), { fs: 13.5, lh: 19.5, title: 'response · id 4 (error)', stroke: BAD, hi: jfmt(err).map((l, i) => (/code|message/.test(l) ? i : -1)).filter((i) => i >= 0) });
      fly(RX - 20, 166, LX + 20, 166, seg(u, 0.4, 1.4), 'error -32602', { mono: true, fill: BAD });
      note(705, 330, 'result 대신 error · 같은 id 4', fade(u, 1.4), { 'text-anchor': 'middle', fill: BAD }); return; }
    // k5: 실패 두 갈래
    [['도구 안에서 실패', 'result.isError: true', '정상 응답 모양 · LLM이 읽고 다시 시도할 수 있다', WARN], ['프로토콜 오류', 'error { code, message }', '알 수 없는 메서드·잘못된 요청', BAD]].forEach(([h, f, d, col], i) => {
      const y = 100 + i * 140, s = pop(u, 0.3 + i * 0.4);
      card(705, y, 460, 110, { rx: 12, stroke: col, sw: 2.5, s });
      tx(495, y - 22, h, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s }); mono(495, y + 8, f, { 'font-size': 15, 'font-weight': 700, opacity: s });
      tx(495, y + 36, d, { 'font-size': 13.5, fill: MUT, opacity: s }); }); }

  // ---------- 4. Notification: 서버가 먼저 말을 건다 ----------
  function s4(t, c) { c0 = c; const { k, u } = c, m = act(c);
    seq(c, { y0: 100, gap: 50 });
    // 관측소 값 (Server 쪽 실제 데이터) 과 Client 캐시
    const srvT = k >= 2 ? 25 : 24, cliT = k >= 4 ? 25 : 24;
    const st = k === 2 ? tween(24, 25, u, 0.8) : srvT, ct = k === 4 ? tween(24, 25, u, 1.4) : cliT;
    if (k <= 4) { card(820, 380, 220, 44, { rx: 10, stroke: INFO, fill: INFOBG });
      mono(820, 386, 'Server 서울 ' + st.toFixed(0) + '°C', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
      card(590, 380, 220, 44, { rx: 10, stroke: ct < st ? WARN : ACC, fill: ct < st ? WARNBG : ACCBG });
      mono(590, 386, 'Client 캐시 ' + ct.toFixed(0) + '°C', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ct < st ? WARN : ACC }); }
    if (k === 0) { payloadCard(m, null, { typing: true, hm: ['"params"', '"uri"'] }); return; }
    if (k === 1) { payloadCard(m, null, {}); note(705, 200, 'result가 비어도 응답은 반드시 온다', fade(u, 0.8), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { clock(860, 260, 30, E(u, 0.1, 1.0), WARN, '시간 경과'); payloadCard(m, null, { hm: ['"method"'] });
      tx(640, 260, '요청하지 않았는데 온다', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    if (k === 3) { payloadCard(m, null, { typing: true, hm: ['"method"', '"id"'] }); note(705, 260, '알림엔 uri뿐 · 내용은 다시 읽는다', fade(u, 1.4), { 'text-anchor': 'middle' }); return; }
    if (k === 4) { payloadCard(m, (p) => ({ id: p.id, contents: p.result.contents.map((x) => ({ uri: x.uri, text: x.text })) }), { hm: ['"text"'] });
      const d = JSON.parse(m.payload.result.contents[0].text); pill(705, 250, 'temp ' + d.temp + ' · updated ' + d.updated, INFO, pop(u, 0.8), { mono: true, fs: 13.5 }); return; }
    if (k === 5) { const N = ['notifications/tools/list_changed', 'notifications/resources/list_changed', 'notifications/prompts/list_changed', 'notifications/message'];
      tx(482, 50, '같은 모양의 다른 알림 (모두 id 없음)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      N.forEach((s, i) => { const y = 96 + i * 60, sc = pop(u, 0.2 + i * 0.3); card(705, y, 460, 46, { rx: 23, stroke: WARN, dash: '6 5', s: sc });
        mono(490, y + 5, s, { 'font-size': 14, 'font-weight': 700, opacity: sc }); });
      tx(705, 360, '목록 변경 · 서버 로그도 push로 온다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); return; }
    // k6: 고리 세 칸
    const P = [['resources/subscribe', ACC, 705, 90], ['notifications/resources/updated', WARN, 770, 270], ['resources/read', INFO, 545, 200]];
    P.forEach(([s, col, x, y], i) => { card(x, y, Math.min(tw(s, 14) + 30, 330), 44, { rx: 22, text: s, fs: 14, mono: true, stroke: col, color: col, s: pop(u, 0.2 + i * 0.3) }); });
    grow(740, 114, 790, 246, seg(u, 0.9, 1.3), WARN); grow(660, 272, 560, 224, seg(u, 1.3, 1.7), INFO); grow(560, 176, 640, 114, seg(u, 1.7, 2.1), ACC);
    tx(705, 380, 'stdio든 HTTP든 같은 메시지 흐름', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }

  // ---------- 5. Shutdown: 메시지가 아니라 Transport 로 끝낸다 ----------
  function s5(t, c) { c0 = c; const { k, u } = c, m = act(c);
    if (k <= 1) { seq(c, { y0: 110, gap: 60 });
      if (k === 0) { payloadCard(m, null, { typing: true }); card(705, 180, 340, 56, { rx: 10, stroke: BAD, dash: '6 5', s: pop(u, 1.2), text: 'MCP 스펙에 없는 메서드', fs: 15, color: BAD });
        tx(705, 250, 'LSP의 shutdown / exit와 헷갈리기 쉽다', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); }
      else { payloadCard(m, null, { hm: ['error', 'code', 'message'] }); note(705, 260, 'TypeScript SDK 서버의 실제 응답', fade(u, 1.0), { 'text-anchor': 'middle', fill: BAD }); }
      return; }
    if (k === 2 || k === 3) { // stdio: stdin 을 닫는다 → 종료
      el('rect', { x: 40, y: 60, width: 300, height: 120, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }); mono(56, 84, 'Host · Client', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const alive = k === 2 ? u < 1.4 : false;
      el('rect', { x: 600, y: 60, width: 320, height: 120, rx: 12, fill: alive ? PANEL : SOFT, stroke: alive ? INFO : OFF, 'stroke-width': 2.2, 'stroke-dasharray': alive ? null : '6 5' });
      mono(616, 84, 'Server 프로세스', { 'font-size': 14, 'font-weight': 700, fill: alive ? INFO : MUT });
      const cut = k === 2 ? E(u, 0.4, 1.0) : 1;
      el('line', { x1: 340, y1: 110, x2: lerp(600, 470, cut), y2: 110, stroke: INFO, 'stroke-width': 4 }); mono(470, 98, 'stdin', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
      el('line', { x1: 600, y1: 150, x2: 340, y2: 150, stroke: alive ? INFO : OFF, 'stroke-width': 4 }); mono(470, 172, 'stdout', { 'font-size': 14, 'font-weight': 700, fill: alive ? INFO : MUT, 'text-anchor': 'middle' });
      if (k === 2) { mono(760, 140, alive ? 'running' : 'exit 0', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: alive ? INFO : GOOD }); if (!alive) check(840, 134, 10, pop(u, 1.5));
        note(480, 260, 'stdin이 닫히면 Server는 스스로 끝난다', fade(u, 1.8), { 'text-anchor': 'middle' });
        tx(480, 290, '직접 실행: Python·TS 서버 모두 곧바로 종료 코드 0', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); return; }
      mono(760, 140, '안 끝나면?', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      // 시간 막대: 기다림 → SIGTERM → SIGKILL
      const x0 = 120, x1 = 860, g = E(u, 0.2, 2.2); el('line', { x1: x0, y1: 290, x2: lerp(x0, x1, g), y2: 290, stroke: MUT, 'stroke-width': 3 });
      [['stdin 닫기', 0, INFO], ['기다림', 0.3, MUT], ['SIGTERM', 0.62, WARN], ['SIGKILL', 0.95, BAD]].forEach(([s, f, col]) => { if (g < f) return; const x = lerp(x0, x1, f);
        el('circle', { cx: x, cy: 290, r: 8, fill: col }); mono(x, 322, s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); });
      tx(480, 370, '정해 둔 시간마다 한 단계씩 세게', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { // HTTP: 연결 닫기 / DELETE
      codePanel(40, 60, 420, ['DELETE /mcp HTTP/1.1', 'Mcp-Session-Id: <initialize 때 받은 id>'], { fs: 14, lh: 24, title: 'Streamable HTTP', stroke: ACC, shown: E(u, 0.2, 1.2) * 2 });
      el('rect', { x: 600, y: 60, width: 320, height: 110, rx: 12, fill: PANEL, stroke: INFO, 'stroke-width': 2.2 }); mono(616, 84, 'Remote Server  /mcp', { 'font-size': 14, 'font-weight': 700, fill: INFO });
      mono(760, 136, u < 1.5 ? '세션 살아 있음' : '세션 종료', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: u < 1.5 ? INFO : GOOD });
      fly(470, 115, 590, 115, seg(u, 0.8, 1.5), 'DELETE', { mono: true });
      el('line', { x1: 120, y1: 260, x2: 840, y2: 260, stroke: INFO, 'stroke-width': 4, 'stroke-dasharray': '10 6', opacity: 1 - E(u, 1.6, 2.2) * 0.8 }); cross(480, 260, 14, pop(u, 2.0));
      tx(480, 310, 'HTTP 연결을 닫으면 끝난다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    // k5: 다섯 단계 띠
    const PH = [['Initialize', 'initialize · initialized'], ['Discovery', 'tools/list · resources/list'], ['Invocation', 'tools/call'], ['Notification', 'subscribe · updated · read'], ['Shutdown', 'Transport 닫기']];
    PH.forEach(([n, d], i) => { const x = 104 + i * 188, s = pop(u, 0.2 + i * 0.25), last = i === 4;
      card(x, 170, 172, 120, { rx: 12, stroke: last ? WARN : ACC, fill: last ? WARNBG : PANEL, sw: 2.2, s });
      tx(x, 140, (i + 1) + '. ' + n, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: s, fill: last ? WARN : INK });
      d.split(' · ').forEach((p, j) => mono(x, 174 + j * 22, p, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: s, fill: MUT })); });
    tx(480, 300 + 30, '1~4는 JSON-RPC 메시지, 5는 Transport', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'initialize 핸드셰이크를 닫는 notifications/initialized에 id가 없는 이유는 무엇인가?',
      o: ['서버가 id를 새로 붙여 주기 때문', '답을 기다리지 않는 알림이기 때문', 'initialize 응답과 같은 id를 쓰기 때문'], a: 1,
      why: 'id가 있으면 request, 없으면 notification이다. initialized는 "이제 시작한다"는 통보라 응답이 없다.' },
    { q: 'tools/list에서 get_forecast의 inputSchema에 required가 없다. LLM이 부를 때 days는 어떻게 되나?',
      o: ['빼도 된다', '반드시 채워야 한다', 'city 대신 days만 보내야 한다'], a: 0,
      why: 'required 배열에 없는 속성은 선택이다. get_weather는 required: ["city"]라 city를 꼭 넣어야 한다.' },
    { q: 'tools/call 응답의 isError: true와 error 객체는 어떻게 다른가?',
      o: ['둘은 같은 뜻이고 이름만 다르다', 'error 객체는 도구 안 실패, isError는 네트워크 실패다', 'isError는 도구 안의 실패, error 객체는 프로토콜 수준 오류다'], a: 2,
      why: 'isError: true는 정상 응답 모양 안에서 도구가 실패했다는 뜻이고, -32602 같은 error 객체는 요청 자체가 잘못됐다는 뜻이다.' },
    { q: 'notifications/resources/updated를 받은 Client가 최신 값을 얻으려면 무엇을 해야 하나?',
      o: ['알림의 params.uri로 resources/read를 다시 부른다', '알림 본문의 contents를 그대로 쓴다', 'resources/subscribe를 한 번 더 보낸다'], a: 0,
      why: '알림에는 바뀐 uri만 있다. 그래서 id 6으로 resources/read를 보내 temp 25가 담긴 최신 contents를 받았다.' },
    { q: 'stdio로 연결된 MCP Server를 정상적으로 끝내는 첫 단계는 무엇인가?',
      o: ['shutdown 요청을 보낸다', 'Server 프로세스의 stdin을 닫는다', '곧바로 SIGKILL을 보낸다'], a: 1,
      why: 'MCP에는 종료 메시지가 없다. stdin을 닫고 기다리다가 안 끝나면 SIGTERM, 그다음 SIGKILL 순서다.' },
  ];
  const summary = [
    '연결은 initialize 요청과 응답으로 서로의 capabilities를 맞추고 initialized 알림으로 시작한다.',
    'tools/list가 돌려준 이름과 inputSchema가 LLM이 인자를 만드는 기준이 된다.',
    'tools/call의 결과는 같은 id로 돌아오고, 실패는 isError 또는 error 객체로 구분한다.',
    '변경은 id 없는 알림으로 오고, 종료는 메시지 없이 stdin이나 HTTP 연결을 닫아서 한다.',
  ];
  const review = [
    { q: 'Client가 날씨 관측소 리소스를 구독하려 한다. 보내기 전에 확인할 것은?',
      o: ['initialize 응답의 capabilities.resources.subscribe', 'tools/list 결과의 inputSchema', 'notifications/initialized의 id'], a: 0,
      why: '이후 단계는 initialize에서 합의한 capabilities를 따른다. 이 Server는 subscribe: true를 밝혀서 구독이 가능했다.' },
    { q: 'Client가 종료하면서 shutdown 요청을 보냈더니 -32601 Method not found가 왔다. 맞는 대응은?',
      o: ['Server 버전을 올려 shutdown을 지원하게 한다', 'notifications/exit 알림을 이어서 보낸다', 'stdin을 닫고 기다린 뒤 필요하면 SIGTERM'], a: 2,
      why: 'MCP는 종료를 Transport에 맡긴다. 오류 응답은 정상이고, stdin을 닫는 것이 첫 단계다.' },
    { q: '날씨 값이 바뀔 때마다 LLM이 최신 값을 쓰게 하고 싶다. 메시지 순서로 알맞은 것은?',
      o: ['tools/list → tools/call → tools/list', 'resources/subscribe → notifications/resources/updated → resources/read', 'initialize → notifications/initialized → resources/subscribe만 반복'], a: 1,
      why: '구독해 두면 Server가 바뀐 uri를 알리고, Client가 그 uri를 다시 읽어 최신 contents를 받는다.' },
  ];

  R.page({ title: 'MCP 메시지 라이프사이클', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
