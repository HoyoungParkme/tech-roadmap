/* V-2-1 Multi-turn RAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 왼쪽: 대화 turn 말풍선 (페이지의 FULL_TURNS). 오른쪽: 임베딩 공간 개념도 — 점의 자리는 그림용이고,
 * 검색 점수 0.93·0.81·0.88… 과 실패 점수 0.42·0.39 는 페이지의 예시값이다. AI 답은 모두 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, grow, dot, check, cross, snippet, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const TT = () => (typeof FULL_TURNS === 'undefined' ? [] : FULL_TURNS);
  function wrap(s, w, fs) { const out = []; let cur = '';
    String(s).split(/(\s+)/).forEach((wd) => { if (!wd) return; if (tw(cur + wd, fs) <= w) { cur += wd; return; } if (cur.trim()) out.push(cur.trim()); cur = wd.trimStart(); });
    if (cur.trim()) out.push(cur.trim()); return out; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const FAIL_DOCS = [{ id: 'misc-091', score: 0.42 }, { id: 'misc-118', score: 0.39 }];
  const FAIL_AI = '그것은 다양한 문맥에서 쓰이며, 예시는 상황에 따라 달라질 수 있습니다.';

  // ---------- 왼쪽: 말풍선 ----------
  const LX = 26, LW = 390;
  // who: 'user' | 'ai' | 'bad'. 돌려주는 값: 다음 y
  function bubble(y, who, text, o) { o = o || {}; const fs = 14, lines = wrap(text, LW - 80, fs).slice(0, o.max || 2), w = Math.min(LW - 40, Math.max(...lines.map((l) => tw(l, fs))) + 28), h = 14 + lines.length * 20;
    const x = who === 'user' ? LX + LW - w : LX + 30, s = o.s ?? 1; if (s <= 0) return y + h + 8;
    const col = who === 'user' ? INFO : who === 'bad' ? BAD : GOOD, bg = who === 'user' ? INFOBG : who === 'bad' ? BADBG : GOODBG;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: bg, stroke: o.hot ? col : 'none', 'stroke-width': 2.2, opacity: s });
    if (who !== 'user') { el('circle', { cx: LX + 12, cy: y + 14, r: 11, fill: bg, stroke: col, 'stroke-width': 1.6, opacity: s }); tx(LX + 12, y + 19, 'AI', { 'font-size': 13.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); }
    lines.forEach((ln, i) => { const t = tx(x + 14, y + 24 + i * 20, ln, { 'font-size': fs, 'font-weight': who === 'user' ? 700 : 500, fill: INK, opacity: s });
      if (o.mark && ln.includes(o.mark)) { const i0 = ln.indexOf(o.mark); el('rect', { x: x + 14 + tw(ln.slice(0, i0), fs) - 2, y: y + 10 + i * 20, width: tw(o.mark, fs) + 4, height: 19, rx: 4, fill: WARN, opacity: 0.25 * s }); } });
    if (o.tag) mono(who === 'user' ? x - 8 : x + w + 8, y + 18, o.tag, { 'font-size': 13.5, fill: MUT, 'text-anchor': who === 'user' ? 'end' : 'start', opacity: s });
    return y + h + 8; }
  function thread(n, o) { o = o || {}; const T = TT(); let y = o.y0 || 36;
    for (let i = 0; i < n; i++) { const t = T[i], last = i === n - 1;
      y = bubble(y, 'user', t.user, { s: last && o.userS != null ? o.userS : 1, hot: last && o.hot, tag: `#${t.n}`, mark: last ? o.mark : null, max: o.compact && !last ? 1 : 2 });
      const ai = last ? o.ai : 1; if (ai && (!last || o.ai)) y = bubble(y, last && o.bad ? 'bad' : 'ai', last && o.bad ? FAIL_AI : t.ai, { s: last && o.aiS != null ? o.aiS : 1, max: o.compact && !last ? 1 : 2 }); }
    return y; }

  // ---------- 오른쪽: 임베딩 공간 ----------
  const P = { 'py-001': [520, 118], 'py-014': [596, 160], 'py-022': [640, 96], 'py-031': [700, 140], 'py-045': [664, 206], 'py-051': [560, 222], 'misc-091': [780, 232], 'misc-118': [796, 112] };
  const QP = { q1: [552, 150], raw2: [860, 176], sa2: [668, 148], sa3: [610, 250] };
  function space(o) { o = o || {}; const s = o.s ?? 1;
    zone(440, 36, 494, 262, null, { op: s }); tx(745, 280, '임베딩 공간 (개념도)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: s });
    el('ellipse', { cx: 610, cy: 160, rx: 150, ry: 92, fill: ACCBG, opacity: 0.6 * s });
    tx(470, 280, '파이썬 데코레이터 문서', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: s });
    tx(918, 280, '기타 문서', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: s });
    Object.entries(P).forEach(([id, [x, y]], i) => { const a = o.pop ? o.pop(i) : s; if (a <= 0) return; const hit = o.hit && o.hit.includes(id);
      el('circle', { cx: x, cy: y, r: (hit ? 8 : 6) * a, fill: id.startsWith('misc') ? OFF : ACC, stroke: hit ? INK : 'none', 'stroke-width': 2 });
      mono(x + 11, y + 5, id, { 'font-size': 13.5, fill: hit ? INK : MUT, 'font-weight': hit ? 800 : 400, opacity: a }); }); }
  // 질의 점이 날아와 앉고, top-k 선이 자란다
  function query(key, label, docs, u0, o) { o = o || {}; const [qx, qy] = QP[key], col = o.col || INFO, from = o.from || [430, 40];
    const m = E(u0, 0, 0.6), x = lerp(from[0], qx, m), y = lerp(from[1], qy, m); if (u0 <= 0) return;
    el('path', { d: `M${x},${y - 11} L${x + 10},${y} L${x},${y + 11} L${x - 10},${y} Z`, fill: col, stroke: PANEL, 'stroke-width': 1.5 });
    if (o.label !== false && m >= 1) { el('line', { x1: x, y1: y - 11, x2: x, y2: 74, stroke: col, 'stroke-width': 1.2, opacity: 0.5 }); pill(x, 62, label, col, 1, { fs: 13.5, fill: PANEL }); }
    docs.forEach((d, i) => { const g = E(u0, 0.7 + i * 0.25, 1.2 + i * 0.25); if (g <= 0) return; const [dx, dy] = P[d.id];
      el('line', { x1: x, y1: y, x2: lerp(x, dx, g), y2: lerp(y, dy, g), stroke: col, 'stroke-width': 2, 'stroke-dasharray': '5 3' });
      if (g >= 1) mono(dx + 18 + tw(d.id, 13.5), dy + 5, d.score.toFixed(2), { 'font-size': 14, 'font-weight': 800, fill: col }); }); }

  // ---------- 1. 단일 turn ----------
  function s1(t, c) { const { k, u } = c, T = TT(); if (!T.length) return;
    space({ pop: k === 0 ? (i) => pop(u, 0.8 + i * 0.12) : null });
    if (k === 0) { ['embeddings', 'FAISS vectorstore', 'retriever k = 2', 'llm gpt-4o-mini'].forEach((s0, i) => pill(LX + 150, 70 + i * 50, s0, INK, pop(u, 0.2 + i * 0.2), { fs: 14, mono: true }));
      note(LX, 300, '대화는 아직 시작 전', fade(u, 1.8), { fill: MUT }); return; }
    const y = thread(1, { userS: k === 1 ? pop(u, 0.2) : 1, ai: k >= 3, aiS: k === 3 ? pop(u, 0.3) : 1, hot: k === 1 });
    if (k === 1) { note(LX, y + 30, 'rag_single_turn(question)', fade(u, 0.9), { class: 'mono', 'font-size': 14 });
      note(LX, y + 60, 'history 매개변수가 없다', fade(u, 1.4), { fill: WARN }); return; }
    query('q1', '질문 그대로', T[0].docs, k === 2 ? u - 0.2 : 9, { col: INFO });
    if (k === 2) { note(440, 330, '첫 질문은 자체로 완결 · top-2 가 데코레이터 문서', fade(u, 2.0)); return; }
    // k3: 저장 없음
    zone(440, 312, 494, 92, 'history', { stroke: GRID, dash: '5 4', fill: PANEL });
    tx(687, 372, '(비어 있음 · 방금 대화를 남기지 않았다)', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }

  // ---------- 2. 후속 질문 실패 ----------
  function s2(t, c) { const { k, u } = c, T = TT(); if (!T.length) return;
    space({ hit: k >= 1 && k <= 2 ? FAIL_DOCS.map((d) => d.id) : null });
    const y = thread(2, { userS: k === 0 ? pop(u, 0.2) : 1, hot: k === 0, mark: '그것', ai: k === 2, bad: true, aiS: k === 2 ? pop(u, 0.4) : 1 });
    if (k === 0) { grow(LX + LW - 140, 138, LX + LW - 140, 72, E(u, 1.0, 1.8), WARN, { dash: '4 4' });
      note(LX, y + 40, '"그것" = 데코레이터 · 사람은 안다', fade(u, 1.6)); note(LX, y + 70, 'retriever 는 이 문장만 본다', fade(u, 2.1), { fill: BAD }); return; }
    if (k <= 2) query('raw2', '"그것의 다른 예시는?"', FAIL_DOCS, k === 1 ? u - 0.2 : 9, { col: BAD });
    if (k === 1) { note(440, 330, '"데코레이터" 낱말이 없어 엉뚱한 곳에 떨어진다', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 2) { tx(440, 330, '응답 (예시) · 무관 문서로 지어낸 답', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); return; }
    // k3
    [['질문', 'stateful (앞 답에 기댄다)', WARN], ['검색', 'stateless (이 문장만 본다)', BAD]].forEach(([a, b], i) => {
      card(687, 330 + i * 46, 494, 38, { rx: 8, stroke: b.includes('stateless') ? BAD : WARN, s: pop(u, 0.3 + i * 0.4) });
      tx(458, 336 + i * 46, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) }); tx(520, 336 + i * 46, b, { 'font-size': 14.5, opacity: fade(u, 0.5 + i * 0.4) }); }); }

  // ---------- 3. standalone 재구성 ----------
  function s3(t, c) { const { k, u } = c, T = TT(); if (!T.length) return;
    thread(2, { hot: k === 2 });
    if (k === 0) { el('rect', { x: 440, y: 36, width: 494, height: 190, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      tx(456, 60, 'CONDENSE_PROMPT', { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: INFO });
      ['대화 이력 없이도 이해되는 단일 질문으로 다시 써라', '대명사 "그것", "그", "거기" 를 풀어 써라', '생략어 "다른 예시는?" 도 풀어 써라'].forEach((s0, i) => tx(456, 96 + i * 34, '· ' + s0, { 'font-size': 14.5, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.4) }));
      note(440, 270, '실패한 검색 결과는 치운다', fade(u, 1.8), { fill: MUT }); return; }
    // 재료 → condense LLM → standalone
    card(540, 80, 180, 48, { rx: 8, text: '{chat_history}\nturn #1', fs: 13.5, stroke: GOOD, color: INK, s: k === 1 ? pop(u, 0.3) : 1 });
    card(540, 170, 180, 48, { rx: 8, text: '{question}\n그것의 다른 예시는?', fs: 13.5, stroke: INFO, color: INK, s: k === 1 ? pop(u, 0.7) : 1 });
    card(800, 125, 160, 64, { rx: 10, text: 'condense\nLLM (싼 모델)', fs: 14, stroke: ACC, color: ACC, s: k === 1 ? pop(u, 1.2) : 1 });
    grow(632, 80, 718, 115, k === 1 ? E(u, 1.5, 2.0) : 1, MUT); grow(632, 170, 718, 135, k === 1 ? E(u, 1.6, 2.1) : 1, MUT);
    if (k === 1) { note(440, 270, 'CONDENSE_PROMPT | llm | StrOutputParser()', fade(u, 2.1), { class: 'mono', 'font-size': 14 }); return; }
    if (k === 2) { dot([[LX + 200, 50], [540, 80], [800, 125]], seg(u, 0.2, 1.4), GOOD, 7); dot([[LX + 300, 110], [540, 170], [800, 125]], seg(u, 0.5, 1.7), INFO, 7);
      note(440, 270, '이력 + 후속 질문을 한 번에 넣는다', fade(u, 1.8)); return; }
    // k3
    grow(800, 158, 800, 236, E(u, 0.2, 0.7), ACC);
    const m = E(u, 0.9, 1.9), txt = m < 0.5 ? '그것의 다른 예시는?' : T[1].standalone;
    pill(690, 266, txt, m < 0.5 ? INFO : ACC, pop(u, 0.6), { fs: 15, fill: m < 0.5 ? INFOBG : ACCBG });
    tx(690, 312, '"그것" → "파이썬 데코레이터"', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    sub(690, 344, 'LLM 1회가 늘지만 검색 품질이 살아난다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 4. 재구성 쿼리로 검색 ----------
  function s4(t, c) { const { k, u } = c, T = TT(); if (!T.length) return;
    space({ hit: k === 2 ? T[1].docs.map((d) => d.id).concat(FAIL_DOCS.map((d) => d.id)) : T[1].docs.map((d) => d.id) });
    const y = thread(2, { ai: k === 1 || k === 3, aiS: k === 1 ? pop(u, 0.4) : 1, bad: false });
    query('sa2', 'standalone', T[1].docs, k === 0 ? u - 0.2 : 9, { col: GOOD, sx: 6 });
    if (k === 0) { note(440, 330, 'lru_cache · dataclass · app.route 가 걸린다', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 1) { [['검색', 'standalone 질문'], ['답변', '원래 질문 + 대화 이력 + 문서']].forEach(([a, b], i) => { tx(440, 330 + i * 30, a, { 'font-size': 15, 'font-weight': 800, fill: i ? INFO : GOOD, opacity: fade(u, 1.2 + i * 0.4) }); tx(490, 330 + i * 30, b, { 'font-size': 14.5, opacity: fade(u, 1.2 + i * 0.4) }); }); return; }
    if (k === 2) { query('raw2', '재구성 없이', FAIL_DOCS, u - 0.3, { col: BAD });
      [['재구성 X', '0.42 · 0.39 → 무관 문서', BAD], ['재구성 O', '0.88 · 0.85 · 0.79 → 정답', GOOD]].forEach(([a, b, col], i) => { tx(440, 330 + i * 30, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.6 + i * 0.3) }); mono(530, 330 + i * 30, b, { 'font-size': 14, fill: col, opacity: fade(u, 1.6 + i * 0.3) }); });
      return; }
    // k3: 쿼리 두 갈래
    pill(560, 340, '검색용: ' + T[1].standalone, GOOD, pop(u, 0.3), { fs: 13.5, fill: GOODBG });
    pill(560, 384, '답변용: ' + T[1].user, INFO, pop(u, 0.8), { fs: 13.5, fill: INFOBG });
    sub(840, 366, '어투는 원문', fade(u, 1.4), { 'font-size': 14, 'font-weight': 700 }); }

  // ---------- 5. history 누적 ----------
  const CYC = [['① condense', 0], ['② retrieve', 1], ['③ answer', 2], ['④ append', 3]];
  function cycle(on, active, u0) { const cx = 690, cy = 140, rx = 190, ry = 78;
    el('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
    CYC.forEach(([s0, i]) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a), hot = active === i;
      card(x, y, 124, 36, { rx: 18, text: s0, fs: 14, stroke: hot ? ACC : on ? INFO : GRID, color: hot ? ACC : on ? INK : MUT, fill: hot ? ACCBG : PANEL, sw: hot ? 2.6 : 1.6, s: on > 0 ? on : 1 }); });
    if (u0 != null) { const a = -Math.PI / 2 + u0 * 2 * Math.PI; el('circle', { cx: cx + rx * Math.cos(a), cy: cy + ry * Math.sin(a), r: 6, fill: ACC }); } }
  function s5(t, c) { const { k, u } = c, T = TT(); if (!T.length) return;
    const n = k === 0 ? 2 : 3;
    thread(n, { compact: true, userS: k === 1 ? pop(u, 1.4) : 1, ai: k === 4, aiS: k === 4 ? pop(u, 0.3) : 1, hot: k === 1 });
    if (k <= 1) { cycle(1, null, (u * 0.4) % 1);
      if (k === 0) { tx(690, 146, 'ConversationBufferMemory', { 'font-size': 14, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) });
        note(440, 290, 'history = (질문, 답) 쌍 2개', fade(u, 1.4)); return; }
      tx(690, 146, 'ConversationalRetrievalChain', { 'font-size': 14, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
      note(440, 290, '네 단계를 체인 하나가 매 호출마다 돈다', fade(u, 1.0)); return; }
    if (k === 2) { cycle(1, 0); pill(690, 270, T[2].standalone, ACC, pop(u, 0.8), { fs: 14.5, fill: ACCBG });
      tx(690, 316, '"그 중에" → "파이썬 데코레이터 중에"', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(690, 346, '누적된 1·2턴 이력 덕분에 풀린다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { space({ hit: T[2].docs.map((d) => d.id) }); query('sa3', 'turn #3 standalone', T[2].docs, u - 0.2, { col: GOOD });
      note(440, 330, 'py-051 · py-022 가 걸린다', fade(u, 2.0), { fill: GOOD }); return; }
    cycle(1, 3);
    tx(440, 290, 'history', { 'font-size': 14, 'font-weight': 800, fill: MUT });
    [0, 1, 2].forEach((i) => card(530 + i * 136, 330, 124, 44, { rx: 8, text: `#${i + 1} (Q, A)`, fs: 14, mono: true, stroke: i === 2 ? ACC : GOOD, color: i === 2 ? ACC : INK, fill: i === 2 ? ACCBG : PANEL, s: i === 2 ? pop(u, 1.0) : 1 }));
    dot([[690, 218], [802, 310]], seg(u, 0.4, 1.0), ACC, 7); }

  const quiz = [
    { q: '첫 질문 "파이썬에서 데코레이터가 뭐야?"를 그대로 검색해도 잘 맞는 이유는?',
      o: ['질문 자체로 뜻이 완결돼 있어서', 'retriever가 대화 이력을 봐서', 'k가 2라서'], a: 0,
      why: '첫 질문에는 기댈 앞 대화가 없다. 문장 안에 "데코레이터"가 있으니 임베딩만으로 py-001(0.93)·py-014(0.81)가 걸린다.' },
    { q: '"그것의 다른 예시는?"을 그대로 검색했을 때 엉뚱한 문서가 나온 원인은?',
      o: ['임베딩 모델이 한국어를 못 해서', '질문은 앞 대화에 기대는데 검색은 이 문장만 봐서', '문서 수가 적어서'], a: 1,
      why: '"그것"이 데코레이터라는 정보는 대화 이력에만 있다. 검색은 stateless라 "데코레이터" 없이 misc 문서(예시 점수 0.42·0.39)를 가져온다.' },
    { q: 'condense 단계가 만드는 것은 무엇인가?',
      o: ['답변 문장', '대화 이력 요약본', '이력 없이도 뜻이 통하는 단일 질문'], a: 2,
      why: '이력과 후속 질문을 LLM에 한 번 더 넣어 "파이썬 데코레이터의 다른 예시는?"처럼 대명사를 푼 질문을 얻는다.' },
    { q: '재구성한 질문과 원래 질문은 각각 어디에 쓰나?',
      o: ['재구성한 질문은 검색에, 원래 질문은 이력과 함께 답변 생성에', '둘 다 검색에', '재구성한 질문만 답변 생성에'], a: 0,
      why: '검색에는 키워드가 살아 있는 standalone이 맞고, 답변은 사용자가 쓴 어투 그대로의 질문과 이력으로 만드는 것이 자연스럽다.' },
    { q: '3턴 "그 중에 가장 자주 쓰는 건?"이 제대로 풀린 데 필요했던 것은?',
      o: ['k를 늘린 것', '1·2턴의 (질문, 답)이 history에 쌓여 있던 것', '질문을 영어로 바꾼 것'], a: 1,
      why: '매 턴 답을 만든 뒤 (질문, 답)을 history에 붙여 두었기 때문에 condense가 "그 중에"를 "파이썬 데코레이터 중에"로 풀 수 있었다.' },
  ];

  const summary = [
    '단일 turn RAG는 질문 하나로 검색하고 끝나서, 대화 기록을 남기지 않는다.',
    '"그것" 같은 후속 질문을 그대로 검색하면 키워드가 빠져 무관한 문서가 걸린다.',
    '검색 전에 이력과 질문으로 대명사를 푼 standalone 질문을 만들고 그것으로 검색한다.',
    '답을 만든 뒤 (질문, 답)을 history에 쌓아야 다음 턴의 "그 중에"도 풀린다.',
  ];
  const review = [
    { q: '챗봇이 첫 질문에는 잘 답하는데 "그거 더 알려줘" 같은 후속 질문만 오면 엉뚱한 문서를 인용한다. 먼저 넣을 것은?',
      o: ['검색 전 질문을 다시 쓰는 condense', 'k를 10으로 늘리기', '답변 prompt에 대화 이력 넣기'], a: 0,
      why: '문제는 검색 단계다. 이력을 답변에만 넣어도 검색은 여전히 "그거"로 하므로, 검색 전에 질문을 풀어 써야 한다.' },
    { q: 'condense를 넣었는데 3턴째 "그 중에"가 여전히 풀리지 않는다. 의심할 곳은?',
      o: ['임베딩 모델', '답을 만든 뒤 (질문, 답)을 history에 붙이지 않았다', 'CONDENSE_PROMPT의 출력 파서'], a: 1,
      why: 'condense는 history를 재료로 쓴다. 2턴의 질문과 답이 쌓여 있지 않으면 "그 중"이 무엇의 그 중인지 알 수 없다.' },
    { q: '재구성한 질문 "파이썬 데코레이터의 다른 예시는?"으로 답변까지 만들었더니 어투가 딱딱해졌다. 어떻게 나누는 게 맞나?',
      o: ['답변에도 재구성 질문만 쓴다', '재구성 질문은 버리고 원문으로 검색한다', '검색은 재구성 질문, 답변은 원래 질문과 이력으로 만든다'], a: 2,
      why: '재구성 질문은 검색용이다. 답변 단계는 사용자가 쓴 질문과 이력을 받아야 자연스럽고 앞 대화와도 이어진다.' },
  ];

  R.page({ title: 'Multi-turn RAG — 질문을 풀어 쓰고 이력을 쌓는다', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
