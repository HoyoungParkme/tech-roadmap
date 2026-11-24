/* III-1-3 ConversationChain 메모리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 대화 문장은 STEPS 의 turns, 메모리 상태는 memoryBox 를 읽는다. AI 응답·요약문·유사도 점수는 예시다.
 * 토큰 수(턴 누적 37·73·107·142·172, 창 73·72·68)는 예시 대화를 gpt-4o-mini 토크나이저(o200k_base)와
 * ChatOpenAI.get_num_tokens_from_messages 로 센 값이고, 창이 5턴 질문 때 3·4턴을 싣는 것과 SummaryBuffer(80)가
 * 3턴부터 앞 턴을 요약으로 옮기는 것은 langchain-classic 1.1.0 에 고정 응답 모델을 넣어 실행해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, axes, scatter, line, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const CUM = [37, 73, 107, 142, 172];   // 턴 n 까지 저장된 history 토큰 (실측)

  const cut = (s, w, fs) => { if (tw(s, fs) <= w) return s; let t = s; while (t.length > 1 && tw(t + '…', fs) > w) t = t.slice(0, -1); return t + '…'; };
  // 말풍선: who 'u'(손님) | 'a'(바리스타)
  function bubble(x, y, w, text, o) { o = o || {}; const fs = o.fs || 14, s = o.s ?? 1; if (s <= 0) return; const h = fs + 18;
    const col = o.col || (o.who === 'a' ? INFO : INK), fill = o.fill || (o.who === 'a' ? INFOBG : PANEL);
    card(x + w / 2, y, w, h, { rx: h / 2, stroke: col, sw: o.sw || 1.8, fill, s, op: o.op, dash: o.dash });
    if (s > 0.6) tx(x + 14, y + fs * 0.36, cut(text, w - 28, fs), { 'font-size': fs, fill: o.tcol || INK, opacity: o.op ?? 1, 'text-decoration': o.strike ? 'line-through' : null }); }
  const turnOf = (c, n) => (c.beat.turns || []).find((x) => x.n === n);
  const importPills = (names, u, y) => names.forEach((n, i) => pill(480, (y || 130) + i * 54, n, i === 0 ? ACC : INK, pop(u, 0.2 + i * 0.35), { mono: true, fs: 15, fill: PANEL }));
  const ex = (x, y, op, a) => tx(x, y, '예시 응답', Object.assign({ 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 메모리 없음 ----------
  const RY = [95, 185, 275];
  function callRow(i, tn, u0, o) { o = o || {}; const y = RY[i], op = o.op ?? 1;
    tx(30, y + 5, tn.n + '턴', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: op });
    bubble(80, y, 290, tn.user, { s: pop(u0, 0.1), op, strike: o.strike });
    grow(380, y, 432, y, E(u0, 0.5, 0.8) * op, MUT);
    card(480, y, 90, 44, { rx: 8, stroke: INK, sw: 2, s: pop(u0, 0.6), op }); mono(480, y + 5, 'LLM', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u0, 0.7) * op });
    grow(528, y, 580, y, E(u0, 1.0, 1.3) * op, MUT);
    const fail = tn.state === 'fail';
    bubble(590, y, 345, tn.ai, { who: 'a', s: pop(u0, 1.3), op, col: fail ? BAD : INFO, fill: fail ? BADBG : INFOBG, strike: o.strike }); }
  function s1(t, c) { const { k, u } = c, turns = c.beat.turns || [];
    if (k === 0) { server(480, 150, 'ChatOpenAI(gpt-4o-mini)', { s: pop(u, 0.2) });
      card(480, 320, 300, 56, { rx: 10, stroke: GRID, dash: '6 5', fill: 'none', s: pop(u, 0.8) });
      mono(480, 326, 'history = 없음', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) }); cross(650, 320, 10, pop(u, 1.4));
      sub(480, 390, '대화를 담아 둘 곳이 어디에도 없다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k <= 3) { turns.forEach((tn, i) => { const fresh = i === turns.length - 1; callRow(i, tn, fresh ? u : 3); });
      if (k === 2) mono(225, RY[1] + 40, '박서연', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      if (k === 3) { sub(480, 350, '5턴 호출에는 1·2턴이 실려 있지 않다', fade(u, 1.8), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
      return; }
    if (k === 4) { turns.forEach((tn, i) => callRow(i, tn, 3, { op: tn.state === 'dropped' ? 1 - 0.65 * E(u, 0.3, 1.2) : 1, strike: tn.state === 'dropped' && u > 1.0 }));
      [140, 230].forEach((y, i) => el('line', { x1: 20, y1: y, x2: 940, y2: y, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '8 6', opacity: fade(u, 1.2 + i * 0.3) }));
      sub(480, 350, '호출마다 완전히 따로다. 서버는 앞 호출을 남기지 않는다', fade(u, 1.8), { 'font-size': 15 }); return; }
    // k5: 남은 것은 실패한 5턴 하나, 고치는 방법
    turns.forEach((tn) => callRow(0, tn, 3));
    const s = pop(u, 0.6); card(480, 270, 620, 150, { rx: 12, stroke: GOOD, sw: 2.4, fill: GOODBG, s });
    if (s > 0.6) { tx(200, 225, 'Memory 가 하는 일', { 'font-size': 16, 'font-weight': 800, fill: GOOD });
      [['history', '1~4턴 대화를 모아 두었다가'], ['+ 새 질문', '"제 이름 기억하세요?"'], ['= 한 번에 보낸다', 'LLM 이 앞 대화를 읽는다']].forEach(([a, b], i) => {
        mono(200, 262 + i * 30, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.35) }); tx(380, 262 + i * 30, b, { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.9 + i * 0.35) }); }); } }

  // ---------- 2. Buffer ----------
  function notebook(x, y, w, lines, shown, o) { o = o || {}; const lh = 23, h = 44 + Math.max(lines.length, 1) * lh;
    el('rect', { x, y, width: w, height: Math.max(h, 70), rx: 10, fill: PANEL, stroke: o.stroke || ACC, 'stroke-width': 2 });
    mono(x + 14, y + 24, o.title || 'memory · history', { 'font-size': 14, 'font-weight': 700, fill: o.stroke || ACC });
    if (!lines.length) mono(x + 14, y + 54, '(비어 있음)', { 'font-size': 14, fill: OFF });
    lines.forEach(([who, s], i) => { const op = clamp(shown - i); if (op <= 0) return;
      mono(x + 14, y + 52 + i * lh, who, { 'font-size': 14, 'font-weight': 700, fill: who === 'AI:' ? INFO : INK, opacity: op });
      tx(x + 60, y + 52 + i * lh, cut(s, w - 76, 14), { 'font-size': 14, opacity: op }); }); }
  const linesOf = (slots) => slots.flatMap((sl) => [['Human:', sl.user], ['AI:', sl.ai]]);
  function tokChart(n, u0, o) { o = o || {}; const ax = axes(600, 80, 300, 220, { x: [0, 5.5], y: [0, 200], xt: [1, 2, 3, 4, 5], yt: [0, 100, 200], grid: true, xl: '턴', yl: 'history 토큰' });
    const pts = CUM.slice(0, n).map((v, i) => [i + 1, v]);
    line(ax, pts, n <= 1 ? 1 : clamp(o.lu ?? 1), ACC); scatter(ax, pts.map((p) => [p[0], p[1], ACC]), { u: 1 });
    if (n) { const [xv, yv] = pts[n - 1]; mono(ax.X(xv) - 8, ax.Y(yv) - 12, String(yv), { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u0, 0.8) }); }
    return ax; }
  function s2(t, c) { const { k, u } = c, mb = c.beat.memoryBox || {};
    if (k === 0) { importPills(['ConversationBufferMemory', 'ConversationChain'], u, 150); sub(480, 290, 'langchain_classic.memory / langchain_classic.chains', fade(u, 1.2), { 'font-size': 14.5, class: 'mono' }); return; }
    if (k === 1) { notebook(40, 60, 400, [], 0);
      card(700, 110, 380, 92, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.3) });
      if (pop(u, 0.3) > 0.6) { mono(530, 88, 'ConversationChain prompt', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
        mono(530, 118, '{history}', { 'font-size': 15, 'font-weight': 800, fill: ACC }); mono(530, 144, 'Human: {input}', { 'font-size': 15 }); }
      grow(440, 84, 524, 112, E(u, 0.8, 1.3), ACC);
      pill(700, 260, 'memory_key="history"', GOOD, pop(u, 1.3), { mono: true, fs: 14.5, fill: GOODBG }); check(840, 260, 10, pop(u, 1.5));
      pill(700, 320, 'memory_key="chat_history"', BAD, pop(u, 1.8), { mono: true, fs: 14.5, fill: BADBG }); cross(860, 320, 9, pop(u, 2.0));
      mono(700, 362, 'ValidationError', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) });
      sub(240, 200, '키 이름이 prompt 슬롯과 같아야 한다', fade(u, 1.0), { 'font-size': 15 }); return; }
    const slots = mb.slots || [], ln = linesOf(slots), prevN = k === 2 ? 0 : ((c.prev && c.prev.memoryBox && c.prev.memoryBox.slots) || []).length * 2;
    const shown = lerp(prevN, ln.length, E(u, 0.2, 1.6));
    const n = slots.length, lu = E(u, 0.2, 1.4);
    if (k <= 3) { notebook(40, 50, 450, ln, shown); tokChart(n, u, { lu }); return; }
    // k4: 5턴 — prompt 는 1~4턴(142) + 질문, 저장 후 172
    notebook(40, 30, 450, ln.slice(0, 8), 8, { title: '5턴 prompt 의 history (1~4턴)' });
    bubble(40, 286, 450, '제 이름 기억하세요?', { s: pop(u, 0.3) });
    bubble(40, 336, 450, (turnOf(c, 5) || {}).ai || '', { who: 'a', s: pop(u, 0.9), col: GOOD, fill: GOODBG }); ex(42, 375, fade(u, 1.1));
    const ax = tokChart(E(u, 1.2, 2.0) > 0.5 ? 5 : 4, u, { lu: 1 });
    mono(750, 372, `실을 때 ${mb.promptTokens} · 저장 후 ${mb.tokens}`, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) });
    sub(750, 400, '턴마다 30~40 토큰씩 계속 는다', fade(u, 2.1), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }

  // ---------- 3. Window k=2 ----------
  const WX = (n) => 105 + (n - 1) * 187, WY = 200, WW = 170, WH = 116;
  function turnCard(n, tn, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const x = WX(n), op = o.op ?? 1;
    card(x, WY, WW, WH, { rx: 10, stroke: o.col || INK, sw: 2, fill: o.fill || PANEL, s, op, dash: o.dash });
    if (s < 0.6) return;
    tx(x - WW / 2 + 12, WY - 34, n + '턴', { 'font-size': 15, 'font-weight': 800, fill: o.col || MUT, opacity: op });
    tx(x - WW / 2 + 12, WY - 6, cut(tn.user, WW - 24, 14), { 'font-size': 14, opacity: op, 'font-weight': 600 });
    tx(x - WW / 2 + 12, WY + 22, cut(tn.ai, WW - 24, 14), { 'font-size': 14, fill: tn.state === 'fail' ? BAD : INFO, opacity: op }); }
  function windowFrame(a, op, label) { const x0 = lerp(WX(1), WX(4), a) - WW / 2 - 10, w = 187 + WW + 20;
    el('rect', { x: x0, y: WY - WH / 2 - 14, width: w, height: WH + 28, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 3.2, opacity: op });
    if (label) pill(x0 + w / 2, WY - WH / 2 - 14, label, ACC, 1, { fs: 13.5, mono: true, fill: PANEL, op }); }
  function s3(t, c) { const { k, u } = c, mb = c.beat.memoryBox || {};
    if (k === 0) { importPills(['ConversationBufferWindowMemory'], u, 90); for (let n = 1; n <= 5; n++) card(WX(n), WY + 40, WW, WH, { rx: 10, stroke: GRID, dash: '6 5', fill: 'none', s: pop(u, 0.8 + n * 0.15) });
      sub(480, 370, '대화 칸 다섯 개. 아직 창 크기는 없다', fade(u, 1.9), { 'font-size': 15 }); return; }
    for (let n = 1; n <= 5; n++) if (!turnOf(c, n)) card(WX(n), WY, WW, WH, { rx: 10, stroke: GRID, dash: '6 5', fill: 'none' });
    if (k === 1) { windowFrame(0, fade(u, 0.3), 'k=2'); sub(480, 340, '최근 2턴만 prompt 에 싣는다', fade(u, 1.0), { 'font-size': 15 }); return; }
    const pos = k === 2 ? 0 : k === 3 ? E(u, 1.0, 2.0) * (2 / 3) : 2 / 3;
    (c.beat.turns || []).forEach((tn) => { const fresh = (k === 2 && tn.n <= 2) || (k === 3 && (tn.n === 3 || tn.n === 4)) || (k === 4 && tn.n === 5);
      const out = tn.state === 'dropped' && (k === 4 || seg(u, 1.4, 2.0) > 0);
      turnCard(tn.n, tn, { s: fresh ? pop(u, 0.2 + (tn.n % 2) * 0.3) : 1, op: out ? 0.4 : 1, col: tn.state === 'fail' ? BAD : out ? OFF : INK, fill: tn.state === 'fail' ? BADBG : PANEL, dash: out ? '5 4' : null }); });
    windowFrame(pos, 1, 'k=2');
    const tok = tween(c.prev && c.prev.memoryBox ? c.prev.memoryBox.tokens : 0, mb.tokens, u);
    mono(480, 66, `창 안 ${Math.round(tok)} 토큰`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    if (k === 3) { sub(WX(1.5), 300, '창 밖: 저장은 돼 있지만 실리지 않는다', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); return; }
    if (k === 4) { sub(WX(1.5), 300, '이름(2턴)은 창 밖', fade(u, 0.6), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); ex(WX(5) - 80, 286, fade(u, 1.0));
      pill(WX(4.5), 360, `답한 뒤 창은 4·5턴 · ${mb.after} 토큰`, MUT, pop(u, 1.8), { fs: 14, fill: PANEL }); } }

  // ---------- 4. SummaryBuffer ----------
  function gauge(v, limit, u0, o) { o = o || {}; const x = 80, y = 70, h = 280, w = 54, max = 120, Y = (q) => y + h - (q / max) * h;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    if (v > 0) el('rect', { x: x + 4, y: Y(v), width: w - 8, height: y + h - Y(v) - 4, rx: 5, fill: v > limit ? BAD : ACC, opacity: 0.85 });
    if (limit) { el('line', { x1: x - 14, y1: Y(limit), x2: x + w + 14, y2: Y(limit), stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }); mono(x + w + 18, Y(limit) + 5, String(limit), { 'font-size': 15, 'font-weight': 800, fill: WARN }); }
    mono(x + w / 2, y + h + 26, 'buffer 토큰', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 });
    if (v > 0) mono(x - 10, Y(v) + 5, String(Math.round(v)), { 'font-size': 16, 'font-weight': 800, fill: v > limit ? BAD : INK, 'text-anchor': 'end' }); }
  function sumBox(text, op, s) { card(600, 100, 600, 74, { rx: 12, stroke: INFO, sw: 2.2, fill: INFOBG, s: s ?? 1 });
    tx(318, 88, 'summary', { 'font-size': 14, 'font-weight': 700, fill: INFO, class: 'mono' });
    tx(318, 118, text || '(아직 요약 없음)', { 'font-size': 15, fill: text ? INK : OFF, 'font-weight': text ? 700 : 400, opacity: op ?? 1 }); }
  const BX = [380, 600, 820];
  function bufCard(i, tn, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const x = BX[i], y = o.y ?? 250;
    card(x, y, 200, 96, { rx: 10, stroke: o.col || INK, sw: 2, s, fill: o.fill || PANEL, op: o.op });
    if (s < 0.6) return; tx(x - 88, y - 24, tn.n + '턴', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    tx(x - 88, y + 2, cut(tn.user, 176, 14), { 'font-size': 14, 'font-weight': 600 }); tx(x - 88, y + 28, cut(tn.ai, 176, 14), { 'font-size': 14, fill: INFO }); }
  function s4(t, c) { const { k, u } = c, mb = c.beat.memoryBox || {}, turns = c.beat.turns || [];
    if (k === 0) { importPills(['ConversationSummaryBufferMemory', 'ChatOpenAI'], u, 150); sub(480, 300, '요약을 쓰려면 메모리 안에도 LLM 이 있어야 한다', fade(u, 1.3), { 'font-size': 15 }); return; }
    if (k === 1) { gauge(0, tween(0, 80, u), u); sumBox('', 1, pop(u, 0.6)); tx(300, 220, 'buffer (원문)', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono', opacity: fade(u, 1.0) });
      sub(600, 330, 'max_token_limit=80: 넘으면 오래된 턴부터 요약한다', fade(u, 1.4), { 'font-size': 15 }); return; }
    tx(300, 190, 'buffer (원문)', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    if (k === 2) { gauge(tween(0, mb.tokens, u), 80, u); sumBox('', 1);
      turns.forEach((tn, i) => bufCard(i, tn, { s: pop(u, 0.2 + i * 0.4) })); sub(600, 360, '73 < 80: 아직 요약하지 않는다', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    const T = (n) => turns.find((x) => x.n === n);
    if (k === 3) { // 3턴 저장 → 107 → 1턴 요약 → 73 ; 4턴 저장 → 2턴 요약 → 72
      const p1 = seg(u, 0.2, 0.6), p2 = seg(u, 0.6, 1.2), p3 = seg(u, 1.5, 2.4);
      const v = u < 0.6 ? lerp(73, mb.over, E(u, 0.2, 0.6)) : u < 1.5 ? lerp(mb.over, 73, E(u, 0.6, 1.2)) : lerp(73, mb.tokens, E(u, 1.5, 2.4));
      gauge(v, 80, u);
      sumBox(p2 >= 1 ? mb.summary : '', fade(u, 1.0), 1);
      if (u < 1.2) { bufCard(0, T(1), { y: lerp(250, 100, E(u, 0.6, 1.2)), s: 1 - seg(u, 0.9, 1.2), col: BAD }); bufCard(1, T(2), {}); bufCard(2, T(3), { s: pop(u, 0.1) }); }
      else if (u < 1.5) { bufCard(0, T(2), {}); bufCard(1, T(3), {}); }
      else if (u < 2.2) { bufCard(0, T(2), { y: lerp(250, 100, E(u, 1.5, 2.1)), s: 1 - seg(u, 1.9, 2.1), col: BAD }); bufCard(1, T(3), {}); bufCard(2, T(4), { s: pop(u, 1.5) }); }
      else { bufCard(0, T(3), {}); bufCard(1, T(4), {}); }
      if (u > 0.3 && u < 1.0) mono(180, 90, `${mb.over} > 80`, { 'font-size': 17, 'font-weight': 800, fill: BAD });
      return; }
    // k4: 5턴 질문 — 요약 + 원문
    gauge(mb.tokens, 80, u); sumBox(mb.summary, 1);
    bufCard(0, T(3), {}); bufCard(1, T(4), {});
    const q = T(5); bubble(720, 222, 210, q.user, { s: pop(u, 0.3), fs: 14 });
    bubble(720, 272, 210, q.ai, { who: 'a', s: pop(u, 1.0), col: GOOD, fill: GOODBG, fs: 14 }); ex(722, 312, fade(u, 1.2));
    grow(820, 138, 826, 206, E(u, 0.5, 1.0), GOOD, { dash: '5 4' });
    pill(600, 370, `답한 뒤 3턴도 요약으로 · buffer 4·5턴 ${mb.after} 토큰`, MUT, pop(u, 1.8), { fs: 14, fill: PANEL }); }

  // ---------- 5. VectorStore ----------
  const PTS = { init: [1.2, 4.3], 1: [3.6, 1.4], 2: [7.4, 4.6], 3: [4.4, 0.9], 4: [3.0, 2.2], 5: [8.2, 3.6] }, Q = [7.9, 4.2];
  function s5(t, c) { const { k, u } = c, mb = c.beat.memoryBox || {};
    if (k === 0) { importPills(['VectorStoreRetrieverMemory', 'FAISS', 'OpenAIEmbeddings'], u, 120); sub(480, 320, '저장소 · 임베딩 · 메모리가 한 세트', fade(u, 1.4), { 'font-size': 15 }); return; }
    el('rect', { x: 40, y: 40, width: 560, height: 330, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(56, 64, '벡터 공간 (점 위치는 설명용 그림)', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    const ax = { X: (v) => 60 + v * 55, Y: (v) => 350 - v * 55 };
    // 오른쪽: 저장 건수와 retriever
    const st = Math.round(tween(c.prev && c.prev.memoryBox ? c.prev.memoryBox.totalStored || 0 : 0, mb.totalStored || 0, u));
    mono(780, 80, `stored ${st}건`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    pill(780, 124, 'retriever: k=2', INK, k === 1 ? pop(u, 0.8) : 1, { mono: true, fs: 14.5, fill: PANEL });
    if (k === 1) { sub(320, 210, '문장을 벡터로 바꿔 넣을 빈 공간', fade(u, 1.2), { 'font-size': 15 }); return; }
    const pt = (key, s, col, label) => { if (s <= 0) return; const [vx, vy] = PTS[key]; el('circle', { cx: ax.X(vx), cy: ax.Y(vy), r: 8 * s, fill: col });
      if (label) tx(ax.X(vx) + 13, ax.Y(vy) + 5, label, { 'font-size': 14, 'font-weight': 700, fill: col === OFF ? MUT : INK, opacity: clamp(s) }); };
    pt('init', k === 2 ? pop(u, 0.3) : 1, OFF, 'init');
    if (k === 2) { sub(780, 180, 'FAISS.from_texts(["init"])', fade(u, 0.8), { 'font-size': 14, class: 'mono' }); return; }
    const turns = c.beat.turns || [];
    turns.forEach((tn, i) => { const s = k === 3 ? pop(u, 0.3 + i * 0.35) : 1, rec = tn.state === 'recalled' || (k === 5 && tn.n === 5);
      pt(tn.n, s, rec && k === 5 ? GOOD : tn.n === 2 || tn.n === 5 ? INFO : ACC, tn.n + '턴');
      if (k === 3) { const [vx, vy] = PTS[tn.n]; fly(780, 200, ax.X(vx), ax.Y(vy), seg(u, 0.0 + i * 0.35, 0.3 + i * 0.35), tn.n + '턴', { fill: ACC }); } });
    if (k === 3) { sub(780, 200, 'save_context 로 턴마다 저장', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    const qx = ax.X(Q[0]), qy = ax.Y(Q[1]);
    el('circle', { cx: qx, cy: qy, r: 9, fill: WARN }); el('circle', { cx: qx, cy: qy, r: 9 + (k === 4 ? E(u, 0.4, 2.2) : 1) * 70, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    pill(qx - 100, qy - 50, '제 이름 기억하세요?', WARN, k === 4 ? pop(u, 0.2) : 1, { fs: 14, fill: WARNBG });
    if (k === 4) { sub(780, 200, '질문도 벡터로 바꿔 가까운 점을 찾는다', fade(u, 1.2), { 'font-size': 14.5 }); return; }
    (mb.recalled || []).forEach((r, i) => { const [vx, vy] = PTS[r.n]; grow(qx, qy, ax.X(vx), ax.Y(vy), E(u, 0.2 + i * 0.4, 0.8 + i * 0.4), GOOD, { plain: true });
      const y = 200 + i * 66, s = pop(u, 0.9 + i * 0.4); card(780, y, 300, 54, { rx: 10, stroke: GOOD, sw: 2, fill: GOODBG, s });
      if (s > 0.6) { mono(642, y + 5, r.score.toFixed(2), { 'font-size': 16, 'font-weight': 800, fill: GOOD }); tx(694, y + 5, cut(r.text, 176, 14), { 'font-size': 14 }); } });
    tx(632, 318, '점수는 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) });
    sub(780, 362, 'prompt 에는 이 2건만 실린다', fade(u, 1.9), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }

  const quiz = [
    { q: 'LLM만 호출했더니 5턴째 "제 이름 기억하세요?"에 "처음 뵙는데요?"가 나온 까닭은 무엇인가?',
      o: ['모델이 너무 작아서', 'API 호출이 서로 독립이라 앞 대화가 실려 가지 않아서', '2턴에서 이름을 영어로 말하지 않아서'], a: 1,
      why: 'LLM API는 stateless다. 앞 호출을 남기지 않으므로 history를 모아 함께 보내는 Memory가 필요하다.' },
    { q: 'ConversationChain에 ConversationBufferMemory(memory_key="chat_history")를 넘기면 어떻게 되는가?',
      o: ['만들 때 ValidationError가 난다', '대화가 chat_history에 잘 쌓인다', '첫 턴만 기억한다'], a: 0,
      why: 'ConversationChain의 기본 prompt는 {history} 슬롯을 쓴다. 메모리 키가 이와 다르면 만들 때 바로 오류가 난다.' },
    { q: 'k=2 창 메모리로 5턴 "제 이름 기억하세요?"를 물을 때 prompt에 실리는 것은 무엇인가?',
      o: ['1~4턴 전부', '1·2턴', '3·4턴'], a: 2,
      why: '창은 최근 2턴만 싣는다. 5턴을 묻는 순간 창에는 3·4턴(72 토큰)이 있고, 이름이 있던 2턴은 창 밖이다.' },
    { q: 'max_token_limit=80인 SummaryBuffer에서 처음 요약이 생기는 때는 언제인가?',
      o: ['3턴을 저장해 버퍼가 107 토큰이 되었을 때', '1턴을 저장하자마자', '5턴을 다 마친 뒤 한꺼번에'], a: 0,
      why: '2턴까지는 73 토큰이라 한도 안이다. 3턴 저장으로 80을 넘으면 가장 오래된 1턴부터 요약으로 옮긴다.' },
    { q: 'VectorStore 메모리가 대화가 100턴이 되어도 prompt를 짧게 유지하는 방법은 무엇인가?',
      o: ['오래된 턴을 지워 버린다', '모든 턴을 한 줄로 요약한다', '질문과 가까운 턴 k개만 검색해 싣는다'], a: 2,
      why: '턴을 모두 임베딩해 두고 질문과 의미가 가까운 2건만 꺼내 쓴다. 그래서 prompt 길이가 대화 길이와 상관없다.' },
  ];

  const summary = [
    'LLM API는 호출마다 따로라서 앞 대화를 함께 보내야 이름을 기억한다.',
    'Buffer는 전부 보내 정확하지만 history가 턴마다 30~40 토큰씩 늘어 5턴에 172가 된다.',
    'Window k=2는 72 토큰 안팎으로 일정하지만 창 밖 2턴의 이름을 잊는다.',
    'SummaryBuffer는 넘친 턴을 요약해 이름을 지키고, Vector는 질문과 가까운 턴만 꺼낸다.',
  ];
  const review = [
    { q: '상담 챗봇이 30턴쯤 지나면 응답이 느려지고 요금이 늘었다. 메모리는 Buffer다. 먼저 의심할 것은?',
      o: ['모든 턴 원문이 매번 prompt에 실려 토큰이 계속 늘었다', '창 크기 k가 너무 작다', '임베딩 모델이 느리다'], a: 0,
      why: 'Buffer는 history를 전부 싣는다. 예시 대화도 턴마다 30~40 토큰씩 늘어 5턴에 172 토큰이었다.' },
    { q: 'k=2 창 메모리 봇이 대화 초반에 들은 고객 이름을 자꾸 잊는다. 이름을 지키면서 토큰도 아끼려면?',
      o: ['k를 1로 줄인다', 'ConversationSummaryBufferMemory로 바꿔 넘친 턴을 요약으로 남긴다', 'memory_key를 chat_history로 바꾼다'], a: 1,
      why: '창은 밀려난 턴을 싣지 않는다. SummaryBuffer는 한도를 넘친 오래된 턴을 요약에 담아 이름 같은 정보를 남긴다.' },
    { q: '몇 달 치 대화를 기억하는 개인 비서에서 "지난번에 말한 알레르기"를 찾아 써야 한다. 알맞은 메모리는?',
      o: ['ConversationBufferWindowMemory(k=2)', '메모리 없이 LLM만 호출', 'VectorStoreRetrieverMemory'], a: 2,
      why: '오래된 한 턴을 의미로 찾아 꺼내야 한다. 모든 턴을 임베딩해 두고 질문과 가까운 것만 꺼내는 Vector 메모리가 맞다.' },
  ];

  R.page({ title: '대화 메모리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
