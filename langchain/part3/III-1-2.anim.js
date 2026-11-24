/* III-1-2 RouterChain — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 질문·라벨·답은 STEPS 의 query / classified / answer(예시 LLM 출력)를 읽는다.
 * 분기 동작(첫 조건부터 검사, 다 false 면 마지막 인자)과 문자열 하나가 {topic, question} dict 로 바뀌는 것은
 * langchain-core 1.8.4 RunnableBranch 에 고정 응답 모델을 넣어 실행해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 글자 폭(어림)으로 줄 나누기
  function wrap(s, w, fs) { const out = []; let cur = '';
    String(s).split(' ').forEach((word) => { const t = cur ? cur + ' ' + word : word; if (tw(t, fs) > w && cur) { out.push(cur); cur = word; } else cur = t; });
    if (cur) out.push(cur); return out; }
  function textBox(cx, cy, w, s, o) { o = o || {}; const fs = o.fs || 14.5, lines = wrap(s, w - 28, fs), h = lines.length * (fs + 7) + 22, sc = o.s ?? 1; if (sc <= 0) return h;
    card(cx, cy, w, h, { rx: o.rx ?? 10, stroke: o.stroke || INK, fill: o.fill || PANEL, sw: o.sw || 2, s: sc, dash: o.dash });
    if (sc > 0.6) lines.forEach((l, i) => tx(cx - w / 2 + 14, cy - h / 2 + 15 + fs * 0.9 + i * (fs + 7), l, { 'font-size': fs, fill: o.color || INK, 'font-weight': o.fw || 500 }));
    return h; }
  // 템플릿 줄: {변수}는 점선 칸
  function tline(x, y, s, o) { o = o || {}; const fs = o.fs || 14; let cx = x;
    s.split(/(\{[^}]+\})/).filter(Boolean).forEach((p) => { const m = p.match(/^\{(.+)\}$/), v = m && o.fill ? o.fill : p, w = tw(v, fs) + (m ? 10 : 0);
      if (m) { el('rect', { x: cx + 1, y: y - fs + 1, width: w - 2, height: fs + 8, rx: 4, fill: o.fill ? INFOBG : ACCBG, stroke: o.fill ? INFO : ACC, 'stroke-width': 1.5, 'stroke-dasharray': o.fill ? null : '4 3' });
        tx(cx + 5, y + 2, v, { 'font-size': fs, 'font-weight': 700, fill: o.fill ? INFO : ACC, class: o.fill ? null : 'mono' }); }
      else tx(cx, y + 2, p, { 'font-size': fs, fill: INK, style: 'white-space:pre' });
      cx += w; }); }
  const DOM = [{ id: 'math', name: 'math_chain', role: '수학 전문가', need: ['단계별 풀이', '검산'] },
               { id: 'history', name: 'history_chain', role: '역사 전문가', need: ['시대 배경', '인과관계'] },
               { id: 'code', name: 'code_chain', role: '코드 전문가', need: ['예제 코드', 'Big-O'] }];
  const ex = (x, y, op, a) => tx(x, y, '예시 출력', Object.assign({ 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  function qCard(cx, cy, q, s, o) { o = o || {}; return textBox(cx, cy, o.w || 220, '"' + q + '"', { s, stroke: WARN, fill: WARNBG, fw: 700, fs: 14.5 }); }
  function needList(x, y, items, ok, op) { items.forEach((n, i) => { const yy = y + i * 28;
    (ok ? check : cross)(x + 8, yy - 5, 8, op); tx(x + 26, yy, n, { 'font-size': 15, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: clamp(op) }); }); }

  // ---------- 1. 만능 prompt 하나 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    const gs = k === 0 ? pop(u, 0.2) : 1;
    card(470, 200, 280, 110, { rx: 12, stroke: BAD, sw: 2.4, fill: BADBG, s: gs, dash: '7 4' });
    if (gs > 0.6) { mono(345, 166, 'generic_prompt', { 'font-size': 13.5, 'font-weight': 700, fill: BAD });
      tline(345, 204, '다음 질문에 답하세요:', { fs: 14.5 }); tline(345, 234, '{question}', { fs: 14.5, fill: k >= 1 && k <= 3 && seg(u, 0.8, 0.9) > 0 ? '…' + (b.query || '').slice(-8) : null }); }
    if (k === 0) { ['수학', '역사', '코드'].forEach((d, i) => { const y = 110 + i * 90, s = pop(u, 0.6 + i * 0.3);
        pill(110, y, d + ' 질문', INK, s, { fs: 14, fill: PANEL }); grow(165, y, 325, 200 + (i - 1) * 30, E(u, 0.9 + i * 0.3, 1.5 + i * 0.3), MUT); });
      sub(470, 300, '어떤 질문이든 같은 문장 하나로 받는다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k <= 3) { const d = DOM[k - 1];
      qCard(140, 200, b.query, pop(u, 0.1), { w: 230 }); grow(258, 200, 325, 200, E(u, 0.5, 0.8), MUT);
      grow(612, 200, 680, 200, E(u, 1.0, 1.3), MUT);
      const h = textBox(810, 150, 250, b.answer, { s: pop(u, 1.2), fs: 14 }); ex(690, 150 + h / 2 + 22, fade(u, 1.6));
      if (fade(u, 1.8) > 0) { tx(690, 290, d.role + '라면 있어야 할 것', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 1.8) }); needList(690, 322, d.need, false, pop(u, 2.0)); }
      return; }
    // k4: 세 답 모두 얕다
    DOM.forEach((d, i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3);
      card(x, 355, 270, 90, { rx: 10, stroke: BAD, sw: 2, s });
      if (s > 0.6) { tx(x - 120, 330, ['수학', '역사', '코드'][i] + ' 답', { 'font-size': 15, 'font-weight': 700 }); needList(x - 120, 360, d.need, false, 1); } });
    sub(470, 290, '지시가 두루뭉실하니 어느 쪽도 깊어지지 않는다', fade(u, 1.4), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // ---------- 2. 도메인별 chain ----------
  const DY = [100, 210, 320], DX = 620;
  function domCard(i, s, o) { o = o || {}; if (s <= 0) return; const d = DOM[i], y = DY[i];
    card(DX, y, 470, 92, { rx: 10, stroke: o.on ? GOOD : o.off ? GRID : ACC, sw: o.on ? 3 : 2, fill: o.on ? GOODBG : PANEL, s, op: o.off ? 0.55 : 1 });
    if (s < 0.6) return; const op = o.off ? 0.5 : 1;
    mono(DX - 220, y - 18, d.name, { 'font-size': 15, 'font-weight': 700, fill: o.on ? GOOD : ACC, opacity: op });
    tx(DX - 220, y + 8, '너는 ' + d.role + '다.', { 'font-size': 14, opacity: op });
    d.need.forEach((n, j) => pill(DX - 150 + j * 130 + (j ? 10 : 0), y + 30, n, o.on ? GOOD : INFO, 1, { fs: 13.5, fill: PANEL, op }));
    mono(DX + 220, y + 8, '| llm | parser', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    if (k < 4) { pill(150, 150, 'llm = gpt-4o-mini', INK, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 14, fill: PANEL });
      pill(150, 260, 'parser = StrOutputParser()', INK, k === 0 ? pop(u, 0.6) : 1, { mono: true, fs: 14, fill: PANEL }); }
    if (k === 0) { sub(150, 330, '세 chain 이 같이 쓴다', fade(u, 1.2), { 'font-size': 15 }); return; }
    for (let i = 0; i < 3; i++) { const s = k === i + 1 ? pop(u, 0.2) : k > i + 1 ? 1 : 0; if (s <= 0) continue;
      domCard(i, s); if (k <= 3) { const lu = k === i + 1 ? E(u, 0.9, 1.5) : 1; grow(250, 150, DX - 238, DY[i], lu, OFF, { plain: true, dash: '4 4' }); } }
    if (k >= 1 && k <= 3) { const d = DOM[k - 1]; tx(DX - 235, DY[k - 1] + 64, '"' + d.need.join(' + ') + '"를 꼭 하라고 시킨다', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // k4: 누가 고르나
    qCard(130, 205, '이차방정식 x² - 5x + 6 = 0의 해를 구해줘', pop(u, 0.2), { w: 210 });
    DY.forEach((y, i) => { grow(240, 205, DX - 240, y, E(u, 0.6 + i * 0.2, 1.2 + i * 0.2), WARN, { dash: '6 5', plain: true });
      mono(320 + i * 12, lerp(205, y, 0.45) + 6, '?', { 'font-size': 22, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3 + i * 0.2) }); });
    sub(470, 400, '어느 chain 으로 보낼지 정하는 부품이 아직 없다', fade(u, 1.9), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }

  // ---------- 3. 분류 LLM ----------
  function classifyCard(cx, cy, s, fill) { card(cx, cy, 380, 150, { rx: 12, stroke: ACC, sw: 2.4, s });
    if (s < 0.6) return; const x = cx - 175;
    mono(x, cy - 50, 'classify_prompt', { 'font-size': 13.5, 'font-weight': 700, fill: ACC });
    tline(x, cy - 20, '질문이 어떤 도메인인지 라벨 하나만 출력.', { fs: 14 });
    tline(x, cy + 6, '가능한 라벨: math, history, code', { fs: 14 });
    tline(x, cy + 34, '질문: {question}', { fs: 14, fill });
    tline(x, cy + 60, '라벨:', { fs: 14 }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    classifyCard(480, 140, k === 0 ? pop(u, 0.2) : 1, k >= 2 && (k > 2 || seg(u, 0.7, 0.8) > 0) ? '…= 0의 해를 구해줘' : null);
    if (k === 0) { sub(480, 270, '답은 하지 않고 라벨 한 단어만 낸다', fade(u, 1.2), { 'font-size': 15 }); return; }
    pill(480, 240, 'gpt-4o-mini · temperature=0', INK, k === 1 ? pop(u, 0.3) : 1, { mono: true, fs: 14, fill: PANEL });
    if (k === 1) { qCard(130, 140, b.query, pop(u, 0.8), { w: 200 }); sub(480, 290, '작은 모델 + 온도 0: 싸고, 같은 질문엔 같은 라벨', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 2) { qCard(130, 140, b.query, 1, { w: 200 }); dot([[232, 140], [290, 174]], seg(u, 0.2, 0.7), INFO, 7);
      grow(480, 258, 480, 300, E(u, 1.0, 1.3), ACC);
      pill(480, 322, 'topic = "' + b.classified + '"', GOOD, pop(u, 1.3), { mono: true, fs: 15, fill: GOODBG });
      [['조선 건국 배경?', 'history'], ['이진탐색 구현?', 'code']].forEach(([q, l], i) => { const y = 300 + i * 50, s = pop(u, 1.8 + i * 0.3);
        pill(780, y, q, MUT, s, { fs: 13.5, fill: PANEL }); mono(870, y + 5, '→ ' + l, { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0 + i * 0.3) }); });
      return; }
    // k3: 라벨이 조건문의 입력이 된다
    pill(480, 322, 'topic = "math"', GOOD, 1, { mono: true, fs: 15, fill: GOODBG });
    qCard(130, 140, b.query, 1, { w: 200 });
    const conds = ['math', 'history', 'code'];
    conds.forEach((d, i) => { const y = 280 + i * 44, s = pop(u, 0.4 + i * 0.35), x = 820;
      if (s <= 0) return; mono(x - 30, y + 5, `"${d}" in topic`, { 'font-size': 14.5, 'text-anchor': 'end', fill: INK, opacity: clamp(s) });
      if (i === 0) check(x - 2, y, 9, s); else cross(x - 2, y, 8, s);
      mono(x + 18, y + 5, i === 0 ? 'True' : 'False', { 'font-size': 14.5, 'font-weight': 700, fill: i === 0 ? GOOD : MUT, opacity: clamp(s) }); });
    grow(560, 322, 640, 300, E(u, 0.2, 0.5), MUT); }

  // ---------- 4·5. RunnableBranch ----------
  const GX = 560, GY = [80, 160, 240, 340];
  // 조건 칸 + 연결 chain. o = { lit(0~3), checked(개수), dflt: 'math_chain'|'default_chain', s }
  function gates(o) { o = o || {}; const conds = ['"math" in topic', '"history" in topic', '"code" in topic'];
    el('line', { x1: GX - 140, y1: GY[0] - 30, x2: GX - 140, y2: GY[3], stroke: GRID, 'stroke-width': 3 });
    conds.forEach((cd, i) => { const s = o.s ? o.s(i) : 1; if (s <= 0) return; const y = GY[i], lit = o.lit === i, chk = (o.checked ?? -1) > i || (o.checked ?? -1) === i && lit, fail = (o.checked ?? -1) > i && !lit;
      card(GX - 30, y, 210, 46, { rx: 23, stroke: lit ? GOOD : fail ? GRID : INK, sw: lit ? 3 : 2, fill: lit ? GOODBG : PANEL, s });
      mono(GX - 30, y + 5, cd, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: fail ? OFF : lit ? GOOD : INK, opacity: clamp(s) });
      if (fail) cross(GX + 92, y, 7, 1); if (lit && chk) check(GX + 92, y, 9, 1);
      grow(GX + 75, y, GX + 150, y, clamp(s), lit ? GOOD : MUT);
      card(GX + 240, y, 170, 46, { rx: 8, stroke: lit ? GOOD : ACC, sw: lit ? 3 : 2, fill: lit ? GOODBG : PANEL, s, op: fail || (o.lit != null && !lit && o.lit !== 3) ? 0.45 : 1 });
      mono(GX + 240, y + 5, DOM[i].name, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: lit ? GOOD : ACC, opacity: clamp(s) * (fail ? 0.5 : 1) }); });
    const s = o.s ? o.s(3) : 1; if (s <= 0) return; const y = GY[3], lit = o.lit === 3, dn = o.dflt || 'math_chain';
    tx(GX - 130, y + 5, '어느 것도 아니면', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: clamp(s) });
    grow(GX + 10, y, GX + 150, y, clamp(s), lit ? GOOD : MUT);
    card(GX + 240, y, 170, 46, { rx: 8, stroke: lit ? GOOD : dn === 'default_chain' ? INFO : ACC, sw: lit ? 3 : 2, dash: o.dash ? '6 4' : null, fill: lit ? GOODBG : PANEL, s });
    mono(GX + 240, y + 5, dn, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: lit ? GOOD : dn === 'default_chain' ? INFO : ACC, opacity: clamp(s) });
    mono(GX - 140, GY[0] - 42, 'RunnableBranch', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: clamp(s) }); }
  // 왼쪽: 문자열 → {topic, question} dict
  function parallel(q, topic, u0, s) { if (s <= 0) return;
    pill(110, 210, q.length > 12 ? q.slice(0, 11) + '…' : q, WARN, s, { fs: 14, fill: WARNBG });
    const a = E(u0, 0.1, 0.6); grow(170, 200, 230, 150, a, MUT); grow(170, 220, 230, 270, a, MUT);
    card(320, 150, 170, 42, { rx: 8, stroke: ACC, sw: 2, s: clamp(a * 2) }); mono(320, 155, 'classify_chain', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: a });
    card(320, 270, 170, 42, { rx: 8, stroke: INK, sw: 2, s: clamp(a * 2) }); mono(320, 275, 'Passthrough()', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: a });
    mono(250, 118, 'topic', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: a }); mono(250, 238, 'question', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: a });
    if (topic) { pill(320, 196, '"' + topic + '"', topic === 'math' ? GOOD : INFO, 1, { mono: true, fs: 14, fill: PANEL }); } }
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { gates({ s: (i) => pop(u, 0.2 + i * 0.4), dash: true });
      sub(GX + 240, GY[3] + 46, '기본값: 다음 장면에서 바꾼다', fade(u, 2.0), { 'font-size': 14 });
      sub(200, 200, '(조건, runnable) 짝을', fade(u, 1.0), { 'font-size': 15 }); sub(200, 228, '위에서부터 차례로 검사', fade(u, 1.3), { 'font-size': 15 }); return; }
    gates({ lit: k >= 3 ? 0 : null, checked: k >= 3 ? (k === 3 ? (seg(u, 0.4, 0.8) > 0 ? 0 : -1) : 0) : -1, dash: true });
    if (k === 1) { parallel(b.query, null, u, pop(u, 0.2));
      mono(280, 370, '{"topic": classify_chain, "question": RunnablePassthrough()}', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(280, 400, '문자열 하나가 키 두 개짜리 dict 로 바뀐다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k < 4) parallel(b.query, k === 2 ? (seg(u, 1.0, 1.1) > 0 ? b.classified : null) : b.classified, 3, 1);
    if (k === 2) { dot([[170, 200], [235, 150], [405, 150]], seg(u, 0.2, 1.0), INFO, 7); dot([[170, 220], [235, 270], [405, 270]], seg(u, 0.2, 1.0), INFO, 7);
      pill(280, 370, '{topic: "math", question: "x²…"}', INK, pop(u, 1.6), { mono: true, fs: 13.5, fill: PANEL }); return; }
    // k3, 4: 첫 조건이 맞아 math_chain
    dot([[405, 210], [GX - 140, 210], [GX - 140, GY[0]], [GX - 135, GY[0]]], k === 3 ? seg(u, 0.1, 0.5) : 0, GOOD, 7);
    if (k === 3) { [1, 2].forEach((i) => tx(GX - 30, GY[i] + 32, '건너뜀', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.3) }));
      sub(280, 400, '첫 번째로 맞은 조건 하나만 실행된다', fade(u, 1.6), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    const h = textBox(215, 250, 350, b.answer || '', { s: pop(u, 0.3), stroke: GOOD, fill: GOODBG, fs: 14.5 });
    ex(40, 250 + h / 2 + 22, fade(u, 0.8));
    tx(40, 250 - h / 2 - 14, '풀이 단계 + 검산이 들어 있다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) }); }

  // ---------- 5. Fallback ----------
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { card(480, 170, 520, 170, { rx: 12, stroke: INFO, sw: 2.4, s: pop(u, 0.2) });
      if (pop(u, 0.2) > 0.6) { mono(240, 114, 'default_chain', { 'font-size': 15, 'font-weight': 700, fill: INFO });
        tline(240, 148, '너는 일반 비서다. 수학·역사·코드가 아닐 때 불린다.', { fs: 14.5 });
        tline(240, 178, '"전문 도메인이 아닙니다"라고 알린 뒤', { fs: 14.5 }); tline(240, 206, '일반 답변을 짧게. 질문: {question}', { fs: 14.5 }); }
      sub(480, 300, '모르는 주제가 와도 받을 자리를 만든다', fade(u, 1.5), { 'font-size': 15 }); return; }
    const dflt = k === 1 && seg(u, 1.2, 1.3) <= 0 ? 'math_chain' : 'default_chain';
    const lit = k >= 4 ? (k === 4 ? (seg(u, 1.9, 2.0) > 0 ? 3 : null) : 3) : null;
    const checked = k === 4 ? Math.floor(E(u, 0.3, 1.9) * 3.99) : k >= 5 ? 3 : -1;
    gates({ dflt, lit, checked });
    if (k === 1) { if (dflt === 'math_chain') { cross(GX + 240, GY[3], 14, pop(u, 0.5)); }
      else fly(200, GY[3], GX + 240, GY[3], seg(u, 1.1, 1.3) < 1 ? seg(u, 1.1, 1.3) : 0, 'default_chain', { fill: INFO, mono: true });
      sub(220, 200, '마지막 인자 = 아무 조건도', fade(u, 1.6), { 'font-size': 15 }); sub(220, 228, '안 맞을 때 가는 곳', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k < 5) parallel(b.query, k >= 3 ? (k === 3 && seg(u, 1.0, 1.1) <= 0 ? null : 'philosophy') : null, k === 2 ? u : 3, k === 2 ? pop(u, 0.2) : 1);
    if (k === 2) { sub(280, 380, '분류 + 분기 파이프는 그대로 둔다', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 3) { dot([[170, 200], [235, 150], [405, 150]], seg(u, 0.2, 1.0), INFO, 7);
      sub(320, 380, '라벨 목록에 없는 값이 나왔다', fade(u, 1.4), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 4) { const route = [[405, 210], [GX - 140, 210], [GX - 140, GY[3]], [GX + 150, GY[3]]]; dot(route, seg(u, 1.9, 2.6), INFO, 7);
      sub(280, 380, 'math · history · code 조건이 모두 False', fade(u, 1.9), { 'font-size': 15 }); return; }
    const h = textBox(215, 230, 350, b.answer || '', { s: pop(u, 0.3), stroke: INFO, fill: INFOBG, fs: 14.5 });
    ex(40, 230 + h / 2 + 22, fade(u, 0.8));
    sub(GX + 150, 408, '죽지 않고 안내한 뒤 답한다', fade(u, 1.4), { 'font-size': 15, fill: INFO, 'font-weight': 700 }); }

  const quiz = [
    { q: '만능 prompt 하나로 수학·역사·코드 질문을 받을 때 생기는 문제는 무엇인가?',
      o: ['질문마다 모델을 새로 불러 비용이 커진다', '지시가 두루뭉실해 어느 도메인도 깊게 답하지 못한다', 'prompt 변수가 여러 개라 TypeError가 난다'], a: 1,
      why: '"다음 질문에 답하세요" 한 문장으로는 수학의 검산, 역사의 인과, 코드의 Big-O를 요구할 수 없다.' },
    { q: '전문 chain 세 개를 만든 뒤에도 남은 문제는 무엇인가?',
      o: ['들어온 질문을 어느 chain으로 보낼지 정하는 부품이 없다', '세 chain이 llm을 공유할 수 없다', '전문 prompt는 {question} 변수를 못 쓴다'], a: 0,
      why: '수학·역사·코드 chain은 준비됐지만 질문을 보고 하나를 골라 주는 분류 단계가 아직 없다.' },
    { q: '분류 chain이 하는 일은 무엇인가?',
      o: ['질문에 바로 답을 만든다', '질문을 영어로 번역한다', '질문을 보고 math·history·code 중 라벨 한 단어를 낸다'], a: 2,
      why: '분류 prompt는 "라벨 하나만 출력" 하라고 시키고, 그 문자열이 RunnableBranch 조건문의 입력 topic이 된다.' },
    { q: 'RunnableBranch에서 topic이 "math" 일 때 실행되는 것은 무엇인가?',
      o: ['조건이 맞은 chain 전부', '위에서부터 검사해 처음 맞은 math_chain 하나', '마지막 인자인 default chain'], a: 1,
      why: '(조건, runnable) 짝을 순서대로 검사해 첫 번째로 True인 것 하나만 실행하고 나머지는 건너뛴다.' },
    { q: '분류기가 "philosophy"를 내면 RunnableBranch는 어떻게 하는가?',
      o: ['오류를 내고 멈춘다', 'math_chain으로 보낸다', '모든 조건이 False라 마지막 인자 default_chain을 실행한다'], a: 2,
      why: '세 람다가 모두 False면 마지막 인자가 불린다. default_chain은 전문 분야가 아니라고 알린 뒤 일반 답변을 한다.' },
  ];

  const summary = [
    '만능 prompt 하나로 여러 분야를 받으면 어느 분야도 깊게 답하지 못한다.',
    '분야마다 풀이와 검산 같은 요구를 박은 전문 chain을 따로 만든다.',
    '작은 분류 모델이 라벨 한 단어를 내고 RunnableBranch가 처음 맞은 chain으로 보낸다.',
    '조건이 모두 틀리면 마지막 인자 default_chain이 받아 시스템이 멈추지 않는다.',
  ];
  const review = [
    { q: '"블록체인이 뭐야?"를 물었더니 math_chain이 답했다. branch의 마지막 인자가 math_chain이었다. 먼저 고칠 것은?',
      o: ['마지막 인자를 일반 답변용 default_chain으로 바꾼다', '분류 모델의 temperature를 1로 올린다', 'math_chain의 prompt를 더 길게 쓴다'], a: 0,
      why: '라벨이 목록에 없으면 조건이 모두 False라 마지막 인자로 간다. 그 자리가 math_chain이면 엉뚱한 전문가가 답한다.' },
    { q: '법률 질문도 받으려 한다. 무엇을 더하면 되나?',
      o: ['generic_prompt 하나로 돌아간다', '분류 라벨에 law를 넣고, (조건, law_chain) 짝 하나를 branch에 더한다', 'default_chain을 지운다'], a: 1,
      why: '라우터는 분류기 + 전문 chain N개 + default 구조다. 분류기가 law를 낼 수 있게 하고 짝 하나만 더하면 된다.' },
    { q: '분류 단계에 큰 모델 대신 gpt-4o-mini에 temperature=0을 쓰는 까닭은?',
      o: ['작은 모델만 RunnableBranch와 함께 쓸 수 있어서', '큰 모델은 라벨 목록을 읽지 못해서', '라벨 한 단어면 되니 싸게, 같은 질문엔 같은 라벨로'], a: 2,
      why: '분류는 답을 만드는 일보다 가벼워 작은 모델로 충분하다. 온도 0은 분기를 흔들지 않게 한다.' },
  ];

  R.page({ title: '질문 라우팅', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
