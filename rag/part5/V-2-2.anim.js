/* V-2-2 Streaming & UX — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 시간 막대(0~5초)와 채팅 화면이 함께 움직인다. TTFT·전체 시간·보인 토큰 수·SSE 로그·인용 카드·UX 상태는
 * beat 데이터(ttft, total, tokensShown, sseLog, cites, uxState)를, 토큰과 인용은 페이지의 TOKENS·CITES 를 읽는다.
 * 시간 값(검색 0.2초, 첫 토큰 0.3초, 전체 4.8초)은 페이지의 시나리오 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, grow, dot, check, cross, person, browser, server, snippet, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const TK = () => (typeof TOKENS === 'undefined' ? [] : TOKENS);
  const CT = () => (typeof CITES === 'undefined' ? [] : CITES);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 채팅 화면 ----------
  const SX = 30, SY = 30, SW = 420, SH = 220;
  function screen(o) { o = o || {};
    browser(SX + SW / 2, SY + SH / 2, SW, SH, null, { stroke: o.stroke });
    pill(SX + SW - 110, SY + 50, '연차 휴가 정책은?', INFO, 1, { fs: 13.5, fill: INFOBG }); }
  // n 개 토큰을 화면에 (두 줄 자동 줄바꿈). o.s(i) 로 하나씩 튀어나오게
  function tokens(n, o) { o = o || {}; const T = TK(); let x = SX + 18, y = SY + 92;
    for (let i = 0; i < Math.min(n, T.length); i++) { const s = o.s ? o.s(i) : 1, e = tx(x, y, T[i].trim(), { 'font-size': 14.5, 'font-weight': 600, fill: o.col || INK, opacity: Math.max(0, s) });
      let w = tw(T[i].trim(), 14.5); try { const m = e.getComputedTextLength(); if (m > 0) w = m; } catch (err) { /* 측정 불가 */ }
      if (x + w > SX + SW - 16) { x = SX + 18; y += 26; e.setAttribute('x', x); e.setAttribute('y', y); }
      x += w + 6; }
    if (o.caret && n < T.length) el('rect', { x, y: y - 14, width: 2.5, height: 18, fill: ACC, opacity: Math.floor(o.caret * 3) % 2 ? 0.2 : 1 });
    return { x, y }; }
  function spinner(cx, cy, t) { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 4; el('circle', { cx: cx + Math.cos(a) * 16, cy: cy + Math.sin(a) * 16, r: 3.5, fill: MUT, opacity: 0.15 + (i / 8) * 0.8 }); } }
  function skeleton(op) { [0, 1, 2].forEach((i) => el('rect', { x: SX + 18, y: SY + 80 + i * 26, width: [340, 290, 200][i], height: 14, rx: 7, fill: SOFT, opacity: op })); }

  // ---------- 시간 막대 0~5초 ----------
  const TX0 = 90, TW = 800, TY = 330, X = (ms) => TX0 + (ms / 5000) * TW;
  function axis(o) { o = o || {}; el('line', { x1: TX0, y1: TY + 34, x2: TX0 + TW, y2: TY + 34, stroke: MUT, 'stroke-width': 1.5 });
    [0, 1, 2, 3, 4, 5].forEach((s) => { el('line', { x1: X(s * 1000), y1: TY + 34, x2: X(s * 1000), y2: TY + 40, stroke: MUT }); mono(X(s * 1000), TY + 56, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    if (o.label) tx(TX0 - 10, TY + 22, o.label, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' }); }
  function span(a, b, u, col, label, y) { const yy = y ?? TY + 8, x1 = X(a), x2 = lerp(x1, X(b), clamp(u)); if (u <= 0) return;
    el('rect', { x: x1, y: yy, width: Math.max(2, x2 - x1), height: 22, rx: 4, fill: col, opacity: 0.85 });
    if (label && u >= 1 && x2 - x1 > tw(label, 13.5) + 8) tx((x1 + x2) / 2, yy + 16, label, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }); }
  function marker(ms, label, col, op, up) { const x = X(ms); el('line', { x1: x, y1: TY - 6, x2: x, y2: TY + 36, stroke: col, 'stroke-width': 2.4, opacity: op });
    pill(Math.min(Math.max(x, 70), 890), TY - 22, label, col, op, { fs: 13.5, fill: PANEL, mono: true }); }

  // ---------- 1. 일괄 응답 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, T = TK();
    screen(); axis({ label: 'batch' });
    server(700, 120, 'POST /chat', { lamp: k <= 1 ? WARN : GOOD });
    span(0, 200, k === 0 ? E(u, 0.3, 1.0) : 1, INFO, '', TY + 8);
    if (k === 0) { tx(X(200) + 8, TY + 24, '검색 0.2s', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) }); note(SX + 20, SY + 110, '(빈 화면)', fade(u, 0.5), { fill: MUT }); return; }
    span(200, 4800, k === 1 ? E(u, 0.2, 2.6) : 1, WARN, 'llm.invoke · 4.6s 블로킹');
    if (k === 1) { spinner(SX + SW / 2, SY + 120, t); note(560, 220, '마지막 토큰까지 통째로 기다린다', fade(u, 0.6), { fill: WARN }); return; }
    if (k === 2) { spinner(SX + SW / 2, SY + 120, t); fly(640, 180, SX + SW / 2, SY + 120, seg(u, 0.4, 1.8), '{ answer, cites } 한 덩어리', { mono: false });
      marker(4800, '4.8s', BAD, fade(u, 0.2)); return; }
    marker(4800, 'TTFT = 4.8s', BAD, 1);
    tokens(b.tokensShown, { s: k === 3 ? () => pop(u, 0.4) : null });
    if (k === 3) { note(560, 220, `토큰 ${b.tokensShown}개가 한꺼번에`, fade(u, 0.8)); return; }
    person(560, 230, null, { s: pop(u, 0.2) });
    card(720, 214, 230, 44, { rx: 22, text: '끊긴 거 아닌가?', fs: 15, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.6) });
    sub(480, 290, '첫 글자가 보이기까지 4.8초 동안 화면은 비어 있다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: BAD }); }

  // ---------- 2. Streaming ----------
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    screen(); axis({ label: 'stream' });
    el('rect', { x: X(0), y: TY - 26 + 12, width: X(4800) - X(0), height: 8, rx: 4, fill: OFF, opacity: 0.4 });
    tx(X(4800) + 6, TY - 6, 'batch 4.8s', { 'font-size': 13.5, fill: MUT });
    if (k === 0) { snippet(500, 60, ['llm = ChatOpenAI(', '    model="gpt-4o-mini",', '    streaming=True)'], { op: fade(u, 0.2) });
      note(500, 200, '토큰이 생기는 즉시 델타로 받는다', fade(u, 1.2), { fill: ACC }); span(0, 200, 1, INFO); return; }
    span(0, 200, 1, INFO); const n = Math.round(tween(p.tokensShown || 0, b.tokensShown, u, 2));
    span(200, 4800, k === 4 ? 1 : (n / 17), ACC, '토큰이 흘러간다');
    marker(300, 'TTFT 0.3s', GOOD, 1);
    tokens(n, { caret: t });
    if (k === 1) { snippet(500, 50, ['async for chunk in llm.astream(prompt):', '    yield chunk.content'], { op: fade(u, 0.2) }); return; }
    if (k === 2 || k === 3) { server(840, 140, 'FastAPI', { lamp: GOOD, s: 0.8 });
      for (let i = 0; i < 5; i++) dot([[790, 140], [SX + SW + 10, 140]], ((t * 0.9 + i / 5) % 1), ACC, 5);
      mono(620, 112, k === 2 ? 'StreamingResponse' : 'reader.read() 반복', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); return; }
    // k4: 체감 비교
    [['batch', 4800, BAD], ['stream', 300, GOOD]].forEach(([lab, ms, col], i) => { const y = 70 + i * 60, g = E(u, 0.3 + i * 0.4, 1.3 + i * 0.4);
      tx(500, y + 16, lab, { 'font-size': 15, 'font-weight': 800, fill: col });
      el('rect', { x: 570, y, width: 300 * ms / 4800 * g + 2, height: 24, rx: 4, fill: col, opacity: 0.85 });
      mono(580 + 300 * ms / 4800 * g, y + 17, (ms / 1000).toFixed(1) + 's', { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.4) }); });
    tx(690, 210, '첫 글자까지 4.8 ÷ 0.3 = 16배 빠르다', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); }

  // ---------- 3. SSE ----------
  function evLog(log, n, y0) { log.slice(0, n).forEach((e, i) => { const y = y0 + i * 22, col = e.event === 'token' ? ACC : e.event === 'cite' ? GOOD : e.event === 'done' ? INK : INFO;
    mono(500, y, String(e.t).padStart(4, ' ') + 'ms', { 'font-size': 13.5, fill: MUT });
    mono(570, y, 'event: ' + e.event, { 'font-size': 13.5, 'font-weight': 800, fill: col });
    mono(720, y, e.data.length > 22 ? e.data.slice(0, 21) + '…' : e.data, { 'font-size': 13.5 }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, log = b.sseLog || [], p = c.prev || {};
    screen(); axis({ label: 'SSE' });
    if (k === 0) { el('rect', { x: 500, y: 50, width: 400, height: 110, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      tx(516, 74, 'SSE 메시지 한 개', { 'font-size': 13.5, 'font-weight': 800, fill: MUT });
      mono(516, 104, 'event: token', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      mono(516, 130, 'data: "연차 "', { 'font-size': 15, opacity: fade(u, 1.0) });
      mono(516, 152, '(빈 줄 = 메시지 끝)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) });
      note(500, 200, '이름으로 토큰·메타·완료를 나눈다', fade(u, 2.0)); return; }
    const prevN = p.sseLog ? p.sseLog.length : 0, n = k <= 3 ? Math.round(lerp(prevN, log.length, E(u, 0.2, 1.8))) : log.length;
    tx(500, 44, '이벤트 로그', { 'font-size': 13.5, 'font-weight': 800, fill: MUT });
    evLog(log, n, 70);
    log.slice(0, n).forEach((e) => { const col = e.event === 'token' ? ACC : e.event === 'cite' ? GOOD : e.event === 'done' ? INK : INFO;
      el('line', { x1: X(e.t), y1: TY + 2, x2: X(e.t), y2: TY + 30, stroke: col, 'stroke-width': 3 }); });
    const shown = Math.round(tween(p.tokensShown || 0, b.tokensShown, u, 1.6));
    if (shown > 0) tokens(shown, { caret: k === 2 ? t : null }); else if (k === 1) skeleton(1);
    if (k === 3) { CT().forEach((ci, i) => pill(SX + 70 + i * 140, SY + SH - 30, ci.id + ' ' + ci.score.toFixed(2), GOOD, pop(u, 1.2 + i * 0.2), { fs: 13.5, mono: true, fill: GOODBG })); }
    if (k === 4) { el('rect', { x: 500, y: 250, width: 400, height: 56, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5, opacity: fade(u, 0.3) });
      mono(516, 272, 'media_type="text/event-stream"', { 'font-size': 13.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.5) });
      mono(516, 294, 'Cache-Control: no-cache', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 1.0) }); }
    if (k === 5) { [['token', 'append(...)', ACC], ['cite', 'showCites(...)', GOOD], ['done', 'es.close()', INK]].forEach(([e, f, col], i) => {
        mono(510, 274 + i * 22, `${e} → ${f}`, { 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) }); });
      tx(500, 252, 'EventSource 리스너 · 끊기면 자동 재연결', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) }); } }

  // ---------- 4. 인용은 본문 뒤에 ----------
  function citeCards(items, s) { items.forEach((ci, i) => { const x = SX + 8 + i * 140, sc = s ? s(i) : 1; if (sc <= 0) return;
    const g = card(x + 64, SY + SH + 36, 132, 56, { rx: 8, stroke: GOOD, fill: GOODBG, sw: 1.6, s: sc });
    mono(-58, -8, ci.id, { 'font-size': 13.5, 'font-weight': 800, fill: GOOD }, g); mono(58, -8, ci.score.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'end', fill: GOOD }, g);
    tx(-58, 14, ci.src.length > 11 ? ci.src.slice(0, 10) + '…' : ci.src, { 'font-size': 13.5, 'font-weight': 600 }, g); }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {}, items = (b.cites && b.cites.items) || CT();
    screen(); axis({ label: 'cite' });
    span(0, 200, 1, INFO); const n = Math.round(tween(p.tokensShown || 0, b.tokensShown, u, 1.6));
    span(200, 4800, k === 0 ? 0 : Math.max(n / 17, k >= 2 ? 1 : 0), ACC, '본문 token');
    if (k === 0) { tx(500, 50, 'cite_payload — 검색 직후 옆에 보관', { 'font-size': 14, 'font-weight': 800, fill: MUT });
      CT().forEach((ci, i) => { const y = 74 + i * 52; card(700, y + 18, 400, 44, { rx: 8, stroke: GRID, dash: '5 4', s: pop(u, 0.4 + i * 0.3) });
        mono(512, y + 23, ci.id, { 'font-size': 13.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5 + i * 0.3) }); tx(566, y + 23, ci.src, { 'font-size': 14, opacity: fade(u, 0.5 + i * 0.3) });
        mono(886, y + 23, ci.score.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.5 + i * 0.3) }); });
      return; }
    tokens(n, { caret: k === 1 ? t : null });
    if (k === 1) { pill(700, 90, '[C-1]', BAD, pop(u, 0.6), { mono: true, fs: 14 }); cross(745, 90, 10, pop(u, 1.0));
      note(560, 150, '본문에는 인용 마크를 섞지 않는다', fade(u, 1.2)); sub(700, 180, '마크다운이 깨지고 LLM 이 번호를 자주 틀린다', fade(u, 1.6), { 'font-size': 14 }); return; }
    marker(4900, 'cite 4.9s', GOOD, 1);
    citeCards(items, k === 2 ? (i) => pop(u, 0.6 + i * 0.25) : null);
    if (k === 2) { note(560, 120, '본문이 끝난 직후 cite 이벤트 1회', fade(u, 0.3), { fill: GOOD }); return; }
    if (k === 3) { [['token', 'setAnswer(prev + …)', ACC], ['cite', 'setCites(…)', GOOD]].forEach(([e, f, col], i) => { const y = 80 + i * 60;
        pill(540, y, e, col, pop(u, 0.3 + i * 0.4), { mono: true, fs: 14 }); grow(580, y, 640, y, E(u, 0.6 + i * 0.4, 1.0 + i * 0.4), col); mono(650, y + 5, f, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 0.9 + i * 0.4) }); });
      sub(700, 210, '본문 상태와 출처 상태를 따로 둔다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    note(560, 100, 'cite 도착 전에는', fade(u, 0.3)); pill(720, 140, '출처 확인 중...', MUT, pop(u, 0.6), { fs: 14 });
    note(560, 200, '본문은 깔끔, 출처는 점수까지 카드로', fade(u, 1.4), { fill: GOOD }); }

  // ---------- 5. 4-상태 UX ----------
  const ST = { idle: [680, 50], loading: [560, 135], streaming: [800, 135], error: [680, 222] };
  function machine(cur, u) { // 위 삼각형: idle→loading→streaming→idle, 아래 삼각형: streaming→error→loading
    const L = [['idle', 'loading', 'start()', 560, 82, 'end'], ['loading', 'streaming', '첫 token', 680, 126, 'middle'], ['streaming', 'idle', 'done', 800, 82, 'start'],
      ['streaming', 'error', 'onerror', 800, 196, 'start'], ['error', 'loading', '800ms 재시도', 560, 196, 'end']];
    L.forEach(([a, b2, lab, lx, ly, anc]) => { const [x1, y1] = ST[a], [x2, y2] = ST[b2], dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
      const kx = (v) => v / d, sx = x1 + kx(dx) * (dy ? 40 : 60), sy = y1 + kx(dy) * (dy ? 24 : 0), ex = x2 - kx(dx) * (dy ? 40 : 60), ey = y2 - kx(dy) * (dy ? 24 : 0);
      grow(sx, sy, ex, ey, 1, MUT, { sw: 1.6 }); mono(lx, ly, lab, { 'font-size': 13.5, fill: MUT, 'text-anchor': anc }); });
    Object.entries(ST).forEach(([nm, [x, y]]) => { const hot = nm === cur, col = nm === 'error' ? BAD : nm === 'streaming' ? ACC : nm === 'loading' ? INFO : INK;
      card(x, y, 116, 44, { rx: 22, text: nm, fs: 15, mono: true, fw: 800, stroke: col, color: hot ? PANEL : col, fill: hot ? col : PANEL, sw: hot ? 3 : 1.6, s: hot ? 1 + Math.sin(u * 4) * 0.03 : 1 }); }); }
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    screen({ stroke: b.uxState === 'error' && k >= 3 ? BAD : null });
    if (k === 0) { machine(null, u); tx(500, 290, "type UxState = 'idle' | 'loading' | 'streaming' | 'error'", { 'font-size': 13.5, class: 'mono', fill: INFO, opacity: fade(u, 0.6) });
      note(SX + 20, SY + 110, '상태 네 개를 타입으로 못 박는다', fade(u, 1.2)); return; }
    machine(b.uxState, u);
    if (k === 1) { skeleton(0.5 + 0.5 * Math.abs(Math.sin(t * 3))); sub(SX + SW / 2, SY + SH - 20, 'loading · 검색 중 스켈레톤', fade(u, 0.6), { 'font-size': 14, 'font-weight': 700, fill: INFO }); return; }
    const n = Math.round(tween(p.tokensShown || 0, b.tokensShown, u, 1.4)); tokens(n, { caret: k === 2 ? t : null });
    if (k === 2) { sub(SX + SW / 2, SY + SH - 20, 'streaming · 타이핑', fade(u, 0.6), { 'font-size': 14, 'font-weight': 700, fill: ACC }); return; }
    const g = card(SX + SW / 2, SY + 170, 360, 50, { rx: 8, stroke: BAD, fill: BADBG, sw: 2, s: k === 3 ? pop(u, 0.3) : 1 });
    tx(-164, -4, '연결이 끊겼습니다 (token #6)', { 'font-size': 14.5, 'font-weight': 800, fill: BAD }, g);
    card(130, 0, 80, 30, { rx: 15, text: '다시 시도', fs: 13.5, stroke: BAD, color: BAD, p: g });
    if (k === 3) { const r = E(u, 1.0, 2.4); el('rect', { x: 500, y: 290, width: 240 * r, height: 10, rx: 5, fill: WARN });
      el('rect', { x: 500, y: 290, width: 240, height: 10, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 1.2 });
      mono(750, 300, `800ms 뒤 재시도 · ${r >= 1 ? 1 : 0} / 2`, { 'font-size': 14, 'font-weight': 800, fill: WARN }); return; }
    [['loading', '스켈레톤', INFO], ['streaming', '타이핑', ACC], ['error', '재시도 버튼', BAD]].forEach(([s0, ui, col], i) => {
      mono(500 + i * 150, 296, s0, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.3) }); tx(500 + i * 150, 318, '→ ' + ui, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.3) }); });
    tx(700, 380, '"어느 단계인지" 를 늘 보여 준다', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: '일괄(batch) 응답에서 사용자가 첫 글자를 보는 시점(TTFT)은 언제인가?',
      o: ['검색이 끝난 0.2초', '전체 생성이 끝난 4.8초', '첫 토큰이 만들어진 0.3초'], a: 1,
      why: 'invoke는 마지막 토큰까지 기다렸다가 한 덩어리로 돌려준다. 그래서 TTFT가 전체 시간 4.8초와 같고 그동안 화면은 빈다.' },
    { q: 'streaming으로 바꿔도 전체 시간은 4.8초 그대로다. 그런데도 체감이 나아지는 이유는?',
      o: ['첫 토큰이 0.3초에 보여 "이미 답하는 중"으로 느껴져서', 'LLM이 더 빨리 생성해서', '토큰 수가 줄어서'], a: 0,
      why: 'astream은 토큰이 생기는 즉시 내보낸다. 첫 글자까지의 대기가 4.8초에서 0.3초로 16배 줄어든다.' },
    { q: 'SSE가 단순 청크 스트림보다 나은 점은 무엇인가?',
      o: ['데이터를 압축해 보낸다', '양방향으로 메시지를 주고받는다', 'event 이름으로 meta·token·cite·done을 구분하고 끊기면 다시 연결한다'], a: 2,
      why: 'SSE 메시지는 event: 이름과 data: 내용으로 이루어진다. 프론트는 이름별 리스너를 걸고, EventSource가 자동 재연결도 맡는다. 양방향은 WebSocket의 몫이다.' },
    { q: '인용 정보를 본문 토큰 사이에 끼우지 않고 답이 끝난 뒤 cite 이벤트로 보내는 이유는?',
      o: ['본문 마크다운이 깨지지 않고 LLM의 번호 오표기도 피할 수 있어서', 'cite 이벤트가 더 빨라서', '인용이 없어도 되기 때문에'], a: 0,
      why: '검색 직후 chunk 메타를 cite_payload로 보관했다가 본문이 끝나면 한 번에 보낸다. 본문은 깔끔하고 출처는 점수까지 카드로 보인다.' },
    { q: '토큰 #6에서 연결이 끊겼을 때 이 장의 ChatBox가 하는 일은?',
      o: ['스피너를 계속 돌린다', 'error 상태로 바꾸고 800ms 뒤 최대 2회까지 자동으로 다시 시도한다', '받은 토큰을 지운 채 아무것도 보이지 않는다'], a: 1,
      why: 'onerror에서 error 상태와 재시도 버튼을 보이고, retryRef가 2보다 작으면 800ms 뒤 start를 다시 부른다.' },
  ];

  const summary = [
    '일괄 응답은 4.8초 동안 화면이 비어 있다가 답이 한꺼번에 나타난다.',
    'streaming은 전체 시간은 같아도 첫 글자가 0.3초에 보여 체감 대기가 16배 줄어든다.',
    'SSE는 event 이름으로 토큰·인용·완료를 나누고, 인용은 본문이 끝난 뒤 따로 보낸다.',
    'idle·loading·streaming·error 네 상태를 화면에 드러내야 끊긴 건지 답하는 중인지 안다.',
  ];
  const review = [
    { q: 'streaming을 붙였는데도 첫 글자가 1초 넘게 걸린다. 시간 막대에서 먼저 볼 구간은?',
      o: ['첫 token 전 (검색 + 첫 토큰)', '마지막 token과 done 사이', 'cite 이벤트가 오는 때'], a: 0,
      why: 'TTFT는 검색 시간과 첫 토큰 생성 시간을 더한 값이다. 이 장의 0.3초는 검색 0.2초를 전제로 하니, 검색이 느리면 streaming만으로는 줄지 않는다.' },
    { q: '답이 다 나왔는데 출처 카드가 한참 비어 있어 사용자가 "출처 없음"으로 오해한다. 무엇을 더할까?',
      o: ['본문 사이에 [C-1]을 끼운다', 'cite 이벤트를 없앤다', 'cite 도착 전 "출처 확인 중..." 자리표시를 미리 띄운다'], a: 2,
      why: '인용은 본문 뒤 cite 이벤트로 오므로 짧은 공백이 생긴다. 자리표시를 먼저 보여 주면 기다리는 중임을 알 수 있다.' },
    { q: 'EventSource로 POST 전용 /chat/sse 엔드포인트에 연결했더니 아무 이벤트도 오지 않는다. 원인은?',
      o: ['SSE는 한글을 보낼 수 없다', 'EventSource는 GET 요청만 보내서 라우트가 맞지 않는다', 'Cache-Control 헤더가 없어서'], a: 1,
      why: 'EventSource는 GET으로만 연결한다. 그래서 이 장의 서버 코드는 @app.get("/chat/sse")로 열고 질문을 query 파라미터로 받는다.' },
  ];

  R.page({ title: 'Streaming — 첫 글자를 앞당기고 상태를 보여 준다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
