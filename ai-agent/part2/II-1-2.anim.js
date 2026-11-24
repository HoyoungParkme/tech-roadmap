/* II-1-2 토큰과 컨텍스트 윈도우 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 토큰 조각·ID·사전 크기는 tiktoken(o200k_base, cl100k_base)으로 직접 돌려 본 값이다.
 * 윈도우 막대의 크기(500, 2,000, 45,000 …)는 페이지 STEPS 의 usage 데이터를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, terminal, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const chip = (cx, cy, s, o) => { o = o || {}; const fs = o.fs || 15; return card(cx, cy, tw(s, fs) + 22, o.h || 34, { rx: 7, text: s, fs, mono: true, fw: 700, fill: o.fill || PANEL, stroke: o.stroke || INK, color: o.color || INK, s: o.s, op: o.op }); };
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const show = (s) => s.replace(/ /g, '␣');

  // ---------- 1. 토큰 ≠ 단어 ----------
  function pieceRow(y, word, pieces, n, s0, u, o) { o = o || {};
    note(60, y + 6, word, fade(u, s0), { class: 'mono', 'font-weight': 700, 'font-size': 16 });
    grow(250, y, 290, y, E(u, s0 + 0.1, s0 + 0.4), MUT);
    let x = 304; pieces.forEach((p, i) => { const w = tw(show(p), 15) + 22, sp = p.startsWith(' ');
      chip(x + w / 2, y, show(p), { s: pop(u, s0 + 0.3 + i * 0.18), stroke: sp ? WARN : ACC, color: sp ? WARN : ACC, fill: sp ? WARNBG : ACCBG }); x += w + 8; });
    mono(Math.max(x + 12, 620), y + 6, n + (n > 1 ? ' tokens' : ' token'), { 'font-size': 15, 'font-weight': 800, fill: n > 1 ? BAD : GOOD, opacity: fade(u, s0 + 0.7) });
    if (o.lang) tx(860, y + 6, o.lang, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, s0 + 0.7) }); }
  const ROWS1 = [['Hello', ['Hello'], '영어'], ['strawberry', ['st', 'raw', 'berry'], '영어'], ['안녕하세요', ['안', '녕하세요'], '한국어'], ['AI Agent', ['AI', ' Agent'], '공백 포함']];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { // 글자 → 조각으로 합쳐지기 (BPE 개념)
      const L = [...'strawberry'], groups = [[0, 2], [2, 5], [5, 10]], m = E(u, 0.9, 1.9);
      tx(60, 90, '글자 10개', { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.2) });
      L.forEach((ch, i) => { const g = groups.findIndex(([a, b]) => i >= a && i < b), x = 200 + i * 44 + g * 26 * m;
        card(x, 84, 38, 40, { rx: 5, text: ch, fs: 17, mono: true, fw: 700, stroke: GRID, s: pop(u, 0.2 + i * 0.05, 0.4) }); });
      groups.forEach(([a, b], g) => { const x0 = 200 + a * 44 + g * 26 - 20, x1 = 200 + (b - 1) * 44 + g * 26 + 20;
        el('path', { d: `M${x0},112 v12 H${x1} v-12`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: m });
        chip((x0 + x1) / 2, 160, ['st', 'raw', 'berry'][g], { s: pop(u, 1.6 + g * 0.15), stroke: ACC, color: ACC, fill: ACCBG }); });
      tx(60, 166, '토큰 3개', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.7) });
      [['문자', 's · t · r …', 160], ['토큰 (subword)', 'st · raw · berry', 480], ['단어', 'strawberry', 800]].forEach(([a, b, x], i) => {
        card(x, 290, i === 1 ? 260 : 190, 76, { rx: 10, stroke: i === 1 ? ACC : GRID, sw: i === 1 ? 3 : 1.5, s: pop(u, 2.0 + i * 0.12) });
        lbl(x, 284, a, fade(u, 2.1), { fill: i === 1 ? ACC : INK }); mono(x, 308, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); });
      return; }
    const n = Math.min(k, 4);
    ROWS1.slice(0, n).forEach(([w, ps, lang], i) => pieceRow(90 + i * 66, w, ps, ps.length, i === k - 1 ? 0.2 : -5, u, { lang }));
    if (k === 4) note(304, 340, '␣Agent : 앞 공백까지 한 조각', fade(u, 1.2), { fill: WARN });
    if (k === 5) { [['영어', '글자 수 ÷ 4', 'strawberry 10 ÷ 4 = 2.5 → 실제 3'], ['한국어', '글자 수 × 1.5', '안녕하세요 5 × 1.5 = 7.5 → 실제 2']].forEach(([a, f, ex], i) => {
        const x = 250 + i * 460, s = pop(u, 0.3 + i * 0.4);
        card(x, 362, 420, 76, { rx: 10, stroke: i ? WARN : INFO, sw: 2, s });
        note(x - 190, 354, a + ' · ' + f, fade(u, 0.5 + i * 0.4), { 'font-weight': 800 });
        mono(x - 190, 382, ex, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8 + i * 0.4) }); });
      sub(480, 412, '어림셈은 넉넉하게 잡는 값 · 정확한 수는 tiktoken으로 센다', fade(u, 1.8)); } }

  // ---------- 2. tiktoken ----------
  const TERM = [
    '>>> import tiktoken',
    '>>> enc = tiktoken.encoding_for_model("gpt-4o")',
    '>>> enc.name', ["'o200k_base'", 'var(--term)'],
    '>>> ids = enc.encode("strawberry")', '>>> ids', '[302, 1618, 19772]', '>>> len(ids)', '3',
    '>>> [enc.decode([t]) for t in ids]', "['st', 'raw', 'berry']",
  ];
  const SHOWN = [1, 2, 4, 4, 9, 11, 11];
  function s2(t, c) { const { k, u } = c;
    const prevN = k > 0 ? SHOWN[k - 1] : 0, n = lerp(prevN, SHOWN[k], E(u, 0.2, 1.4));
    terminal(470, 56, 470, 300, TERM, n, { title: 'python', fs: 13.5, lh: 23 });
    if (k === 0) { note(40, 120, 'pip install tiktoken', fade(u, 0.4), { class: 'mono' });
      note(40, 170, '어림셈 대신 실제 사전으로 센다', fade(u, 1.0), { fill: MUT }); return; }
    if (k === 1 || k === 2) { const rows = [['gpt-4o', 'o200k_base', '200,019'], ['gpt-4', 'cl100k_base', '100,277'], ['gpt-3.5', 'cl100k_base', '100,277']];
      tx(40, 86, '모델 → 인코더 (사전 크기)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      rows.forEach(([m, e, v], i) => { if (k === 1 && i > 0) return; const y = 124 + i * 50, s = k === 1 ? pop(u, 0.4) : i === 0 ? 1 : pop(u, 0.2 + i * 0.3);
        chip(90, y, m, { s, stroke: i === 0 ? ACC : INK, color: i === 0 ? ACC : INK }); grow(150, y, 196, y, s, MUT);
        chip(270, y, e, { s, stroke: i === 0 ? ACC : INFO, color: i === 0 ? ACC : INFO }); mono(350, y + 5, v, { 'font-size': 13.5, fill: MUT, opacity: s }); });
      if (k === 2) { note(40, 300, 'strawberry 자르는 법도 다르다', fade(u, 1.1), { 'font-size': 14.5 });
        [['o200k', ['st', 'raw', 'berry'], ACC], ['cl100k', ['str', 'aw', 'berry'], INFO]].forEach(([nm, ps, col], r) => { const y = 336 + r * 42;
          mono(40, y + 5, nm, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 1.3 + r * 0.3) });
          let x = 120; ps.forEach((p) => { const w = tw(p, 14) + 20; chip(x + w / 2, y, p, { fs: 14, h: 30, stroke: col, color: col, s: pop(u, 1.4 + r * 0.3) }); x += w + 6; }); }); }
      return; }
    if (k === 3 || k === 4) { ['st', 'raw', 'berry'].forEach((p, i) => { const x = 90 + i * 120, id = [302, 1618, 19772][i];
        chip(x, 140, p, { stroke: ACC, color: ACC, fill: ACCBG, s: k === 3 ? pop(u, 0.4 + i * 0.2) : 1 });
        if (k === 3) fly(x, 140, x, 200, seg(u, 0.9 + i * 0.15, 1.6 + i * 0.15), String(id), { mono: true });
        mono(x, 205, String(id), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.7 + i * 0.1) : 1 }); });
      if (k === 3) mono(40, 280, 'len(ids) = 3 = 토큰 수', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      if (k === 4) { [0, 1, 2].forEach((i) => grow(90 + i * 120, 190, 90 + i * 120, 158, E(u, 0.2 + i * 0.2, 0.7 + i * 0.2), INFO));
        note(40, 280, 'ID 하나씩 되돌리면 조각이 보인다', fade(u, 1.2)); }
      return; }
    if (k === 5) { const L = [['Hello', 1], ['strawberry', 3], ['안녕하세요', 2]];
      L.forEach(([w, nn], i) => { const y = 110 + i * 44; mono(40, y, w, { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.2) }); mono(330, y, nn + ' tok', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.2) }); });
      el('line', { x1: 40, y1: 232, x2: 340, y2: 232, stroke: GRID, 'stroke-width': 2, opacity: fade(u, 0.9) });
      mono(330, 258, '6 tok', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      mono(40, 300, '6 × $2.50 / 1M = $0.000015', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      mono(40, 334, '128,000 × $2.50 / 1M = $0.32', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      sub(200, 372, 'gpt-4o 입력 단가 기준', fade(u, 2.1)); return; }
    // k6: Claude 는 다른 사전
    card(150, 150, 200, 60, { rx: 10, text: 'tiktoken', fs: 16, mono: true, stroke: GRID, color: OFF }); cross(150, 150, 18, pop(u, 0.4));
    note(40, 214, 'Claude 토큰 수와 맞지 않는다', fade(u, 0.7), { fill: BAD });
    pill(200, 290, 'client.messages.count_tokens(...)', ACC, pop(u, 1.1), { mono: true, fs: 13.5 });
    note(40, 350, 'Anthropic API가 직접 세어 준다', fade(u, 1.6), { fill: ACC }); }

  // ---------- 윈도우 막대 (3·4·5 장면 공용) ----------
  const SEGC = { 'System': INFO, '대화 이력': ACC, '요약된 이력': ACC, '도구 결과': WARN, 'RAG 청크': WARN, '현재 질문': GOOD, '응답 공간': BAD };
  function winBar(c, x, y, w, max, o) { o = o || {}; const b = c.beat, p = c.prev || {}, U = b.usage || [], P = p.usage || [];
    el('rect', { x, y, width: w, height: 46, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    let acc = 0;
    U.forEach((s, i) => { const old = P.find((q) => q.label === s.label), v = c.k === 0 && !old ? s.size * E(c.u, 0.2, 1.0) : tween(old ? old.size : 0, s.size, c.u);
      const x0 = x + (acc / max) * w, ww = (v / max) * w, col = SEGC[s.label] || MUT;
      el('rect', { x: x0, y: y + 3, width: Math.max(0, Math.min(ww, x + w + (o.over || 0) - x0)), height: 40, rx: 3, fill: col, opacity: s.label === '응답 공간' ? 0.45 : 0.8, stroke: s.label === '응답 공간' ? BAD : 'none', 'stroke-dasharray': '4 3' });
      if (ww > tw(fmt(s.size), 13.5) + 12) mono(x0 + ww / 2, y + 29, fmt(v), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: PANEL });
      acc += v; });
    // 범례: 이번 beat 에 있는 조각
    if (o.legend !== false) { let lx = x; U.forEach((s) => { const col = SEGC[s.label] || MUT, label = s.label + ' ' + fmt(s.size), isNew = !P.find((q) => q.label === s.label && q.size === s.size);
        el('rect', { x: lx, y: y + 60, width: 14, height: 14, rx: 3, fill: col, opacity: isNew ? fade(c.u, 0.6) : 1 });
        tx(lx + 20, y + 72, label, { 'font-size': 13.5, 'font-weight': isNew ? 800 : 500, fill: isNew ? INK : MUT, opacity: isNew ? fade(c.u, 0.6) : 1 }); lx += tw(label, 13.5) + 44; }); }
    return acc; }

  // ---------- 3. 컨텍스트 윈도우 ----------
  function s3(t, c) { const { k, u } = c, b = c.beat;
    const X = 60, W = 840;
    tx(X, 64, 'gpt-4o 컨텍스트 윈도우 = 입력 + 출력 ≤ 128,000', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
    // 전체 128K 막대 (작게) + 확대 막대
    const tot = (b.usage || []).reduce((a, s) => a + s.size, 0);
    el('rect', { x: X, y: 80, width: W, height: 22, rx: 5, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: k === 0 ? fade(u, 0.3) : 1 });
    el('rect', { x: X, y: 80, width: W * tween(((c.prev && c.prev.usage) || []).reduce((a, s) => a + s.size, 0), tot, u) / 128000, height: 22, rx: 5, fill: ACC });
    mono(X + W, 120, '128,000', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT });
    if (k === 0) { mono(X, 120, '사용 0', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
      note(X, 190, '여기에 system · 대화 · 도구 결과 · 질문 · 답변 자리가 모두 들어가야 한다', fade(u, 1.0)); return; }
    if (k === 1) { const M = [['GPT-4o', 128000], ['Claude 3.5', 200000], ['Gemini 1.5', 1000000]];
      M.forEach(([nm, v], i) => { const y = 170 + i * 66, s = E(u, 0.2 + i * 0.3, 1.2 + i * 0.3);
        tx(X, y + 22, nm, { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: X + 130, y, width: (W - 230) * (v / 1e6) * s, height: 30, rx: 4, fill: [ACC, INFO, GOOD][i], opacity: 0.8 });
        mono(X + 140 + (W - 230) * (v / 1e6) * s, y + 21, fmt(v), { 'font-size': 14, 'font-weight': 700, opacity: s }); }); return; }
    // 확대 막대 0~5,000
    tx(X, 170, '앞부분 확대 (0 ~ 5,000 토큰)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    el('line', { x1: X, y1: 102, x2: X, y2: 184, stroke: GRID, 'stroke-dasharray': '3 3' }); el('line', { x1: X + W * 5000 / 128000, y1: 102, x2: X + W, y2: 184, stroke: GRID, 'stroke-dasharray': '3 3' });
    const acc = winBar(c, X, 186, W, 5000);
    if (k === 5) { mono(X, 310, '합계 5,000 / 128,000 = 3.9%', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) });
      note(X, 344, '아직 여유가 많다', fade(u, 1.2), { fill: MUT }); }
    if (k === 6) { mono(X, 306, '다 채우면 128,000 × $2.50/1M = $0.32 / 요청', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      // Lost in the Middle (개념 그림)
      const x0 = 560, y0 = 330, w = 330, pts = []; for (let i = 0; i <= 20; i++) { const f = i / 20; pts.push([x0 + f * w, y0 + 60 - 60 * (Math.pow(2 * f - 1, 2))]); }
      const ln = E(u, 0.8, 2.0), m = Math.max(2, Math.round(pts.length * ln));
      el('polyline', { points: pts.slice(0, m).map((p) => p.join(',')).join(' '), fill: 'none', stroke: WARN, 'stroke-width': 3 });
      mono(x0, 410, '앞', { 'font-size': 13.5, fill: MUT }); mono(x0 + w, 410, '끝', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); mono(x0 + w / 2, 410, '가운데', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700 });
      note(X, 350, '가운데 정보는 놓치기 쉽다 (Lost in the Middle)', fade(u, 1.4), { fill: WARN });
      note(X, 380, '중요한 지시는 앞이나 끝에 둔다', fade(u, 1.8));
      sub(x0 + w / 2, 318, '정보 활용도 · 개념 그림', fade(u, 1.0)); } }

  // ---------- 4. overflow ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    const X = 60, W = 760, MAX = 140000, LX = X + W * 128000 / MAX;
    tx(X, 64, '요청 크기 (0 ~ 140,000)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    const acc = winBar(c, X, 80, W, MAX, { over: 60 });
    if (b.overflow) { const xe = X + W * acc / MAX; el('rect', { x: LX, y: 76, width: Math.max(0, xe - LX), height: 54, rx: 4, fill: BADBG, stroke: BAD, 'stroke-width': 2.5, opacity: 0.7 }); }
    if (k >= 2) { el('line', { x1: LX, y1: 70, x2: LX, y2: 136, stroke: BAD, 'stroke-width': 3, opacity: k === 2 ? fade(u, 1.0) : 1 });
      mono(LX, 60, 'limit 128,000', { 'font-size': 13.5, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 1.2) : 1 }); }
    const accNow = (b.usage || []).reduce((a, s) => a + s.size, 0);
    mono(X + W + 70, 110, fmt(tween(((c.prev && c.prev.usage) || []).reduce((a, s) => a + s.size, 0), accNow, u)), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: b.overflow ? BAD : INK });
    if (k === 0) { [1, 2, 3, 4, 5].forEach((i) => { const s = pop(u, 0.3 + i * 0.25); card(110 + i * 130, 260, 110, 50, { rx: 8, text: 'tool #' + i, fs: 14.5, mono: true, stroke: WARN, color: WARN, fill: WARNBG, s }); });
      note(X, 340, '도구 결과가 부를 때마다 대화에 그대로 쌓인다', fade(u, 1.8)); return; }
    if (k === 1) { mono(X, 230, 'total = Σ count_tokens(m) + max_response', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
      note(X, 270, '보낼 메시지 합 + 응답 예약분 = 실제 요청 크기', fade(u, 1.2), { fill: MUT }); return; }
    if (k === 2) { note(X, 250, '도구 결과 70,000 — 검색 결과·PDF·로그가 통째로 들어왔다', fade(u, 0.4)); return; }
    if (k === 3) { banner(480, 240, '133,000 > 128,000 · 5,000 초과', pop(u, 1.4));
      mono(X, 310, 'raise ContextOverflowError(...)', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { terminal(60, 190, 840, 150, [['openai.BadRequestError: Error code: 400', '#f87171'], "This model's maximum context length is 128000 tokens.", 'However, your messages resulted in 133013 tokens.', 'Please reduce the length of the messages.'], lerp(0, 4, E(u, 0.2, 1.6)), { title: '예시 에러', fs: 14 });
      note(X, 380, '요청이 실행조차 되지 않는다 · 비용은 안 나가지만 답도 없다', fade(u, 1.9)); return; }
    if (k === 5) { // 조용한 잘라내기: k=10 창
      const n = 12, cw = 62, x0 = 70;
      for (let i = 0; i < n; i++) { const gone = i < 2, drop = gone ? E(u, 0.8 + i * 0.2, 1.6 + i * 0.2) : 0;
        card(x0 + i * cw + 26, 250 + drop * 70, 52, 40, { rx: 6, text: 'm' + (i + 1), fs: 14.5, mono: true, stroke: gone ? BAD : GRID, color: gone ? BAD : INK, op: 1 - drop * 0.8 }); }
      el('rect', { x: x0 + 2 * cw - 6, y: 222, width: 10 * cw + 2, height: 56, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      mono(x0 + 2 * cw, 212, 'ConversationBufferWindowMemory(k=10)', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
      note(x0, 380, '"왜 갑자기 약속을 까먹지?" — m1·m2가 말없이 사라졌다', fade(u, 1.9), { fill: BAD }); return; }
    banner(480, 250, '오래 도는 Agent일수록 overflow는 기본값', pop(u, 0.3));
    note(X, 330, '윈도우 관리는 나중 문제가 아니라 설계 단계에서 정한다', fade(u, 1.0)); }

  // ---------- 5. 대처 전략 ----------
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const X = 60, W = 840;
    tx(X, 64, '요청 크기 (0 ~ 6,000 확대)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    const acc = winBar(c, X, 80, W, 6000);
    if (k === 0) { el('rect', { x: X, y: 200, width: 840, height: 40, rx: 5, fill: SOFT, stroke: INK, 'stroke-width': 1.5, opacity: fade(u, 0.4) });
      note(X, 270, '긴 문서는 통째로 넣지 않는다', fade(u, 0.9)); mono(X, 300, 'RecursiveCharacterTextSplitter', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.3) }); return; }
    if (k === 1) { const cw = 140, ov = 14;
      for (let i = 0; i < 6; i++) { const s = clamp((u - 0.2) * 3 - i * 0.35); if (s <= 0) continue; const x = X + i * (cw - ov);
        el('rect', { x, y: 200 + (i % 2) * 14, width: cw, height: 40, rx: 5, fill: i % 2 ? INFOBG : ACCBG, stroke: i % 2 ? INFO : ACC, 'stroke-width': 2, opacity: s });
        mono(x + cw / 2, 226 + (i % 2) * 14, '1000', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: s }); }
      note(X, 300, 'chunk_size 1000 · chunk_overlap 100', fade(u, 1.8), { class: 'mono' });
      sub(500, 330, '겹친 100토큰 덕분에 경계에서 문맥이 끊기지 않는다', fade(u, 2.1)); return; }
    if (k === 2) { const ax = { x: X, y: 200 }; el('rect', { x: X, y: 210, width: 600, height: 34, rx: 5, fill: SOFT, stroke: GRID });
      el('rect', { x: X, y: 210, width: 600 * 0.3 * E(u, 0.2, 1.0), height: 34, rx: 5, fill: GOOD, opacity: 0.7 });
      el('line', { x1: X + 600 * 4000 / 10000, y1: 200, x2: X + 600 * 4000 / 10000, y2: 254, stroke: WARN, 'stroke-width': 3 });
      mono(X + 240, 194, '4,000', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      note(X, 290, '4,000 미만이면 그대로 둔다 · 요약도 LLM 호출 비용이 든다', fade(u, 1.2)); return; }
    if (k === 3) { const w0 = 600, w1 = 600 * 1500 / 45000, ww = lerp(w0, w1, E(u, 0.5, 1.8));
      el('rect', { x: X, y: 210, width: ww, height: 40, rx: 5, fill: ACC, opacity: 0.8 });
      mono(X + ww + 10, 236, fmt(lerp(45000, 1500, E(u, 0.5, 1.8))), { 'font-size': 16, 'font-weight': 800, fill: ACC });
      note(X, 290, '오래된 대화 45,000 → 요약 5문장 1,500', fade(u, 1.8));
      mono(X, 320, '{"role": "system", "content": "이전 요약: …"}', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { dbIcon(160, 270, '벡터 DB', {});
      for (let i = 0; i < 9; i++) el('rect', { x: 260 + (i % 3) * 30, y: 230 + Math.floor(i / 3) * 26, width: 24, height: 18, rx: 3, fill: i === 1 || i === 4 || i === 8 ? WARN : SOFT, stroke: GRID });
      pill(560, 210, 'similarity_search(query, k=3)', INFO, pop(u, 0.4), { mono: true, fs: 13.5 });
      [0, 1, 2].forEach((i) => fly(320, 250 + i * 20, 640 + i * 90, 300, seg(u, 0.9 + i * 0.25, 1.8 + i * 0.25), '청크 ' + (i + 1), { fill: WARN, stay: true }));
      note(560, 360, '질문과 가까운 3개만 · 3,000 토큰', fade(u, 2.1)); return; }
    if (k === 5 || k === 6) { const rows = [['system', 'SYSTEM_PROMPT', 500, INFO], ['system', '이전 요약: …', 1500, ACC], ['user', '{RAG 청크 3개}\\n\\nQ: …', 3200, GOOD]];
      rows.forEach(([r, ct, v, col], i) => { const y = 200 + i * 50, s = k === 5 ? 1 : pop(u, 0.2 + i * 0.25);
        card(X + 60, y, 110, 36, { rx: 18, text: r, fs: 14, mono: true, stroke: col, color: col, s });
        mono(X + 130, y + 5, ct, { 'font-size': 14.5, opacity: s }); mono(X + 560, y + 5, fmt(v), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: s }); });
      sub(X + 700, 360, k === 5 ? '질문 200은 user 메시지 끝에' : '+ 응답 예약 800', 1); return; }
    // k7
    const sc = E(u, 0.3, 1.5);
    tx(X, 230, '전략 전', { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: X + 90, y: 214, width: 700, height: 26, rx: 4, fill: BAD, opacity: 0.75 }); mono(X + 800, 233, '133,000', { 'font-size': 14, 'font-weight': 700 });
    tx(X, 280, '전략 후', { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: X + 90, y: 264, width: Math.max(3, 700 * 6000 / 133000 * sc), height: 26, rx: 4, fill: GOOD }); mono(X + 130 + 700 * 6000 / 133000, 283, '6,000', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: sc });
    mono(X, 340, '6,000 / 128,000 = 4.7%', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: 'o200k_base로 "strawberry"를 encode하면 토큰은 몇 개인가?',
      o: ['1개, 흔한 단어라서', '10개, 글자마다 하나', '3개, st · raw · berry'], a: 2,
      why: '사전에 통째로 없는 단어는 subword 조각으로 잘린다. 같은 단어도 cl100k에서는 str · aw · berry로 달리 잘린다.' },
    { q: 'tiktoken.encoding_for_model("gpt-4o")가 고르는 인코더는 무엇인가?',
      o: ['o200k_base', 'cl100k_base', 'Claude 토크나이저'], a: 0,
      why: '모델마다 쓰는 사전이 다르다. gpt-4o는 200,019개짜리 o200k_base, gpt-4와 gpt-3.5는 cl100k_base를 쓴다.' },
    { q: '컨텍스트 윈도우 128K 안에 들어가야 하는 것은 무엇인가?',
      o: ['user 질문만', 'system·이력·도구 결과·질문과 응답 예약분까지 전부', '응답만'], a: 1,
      why: '윈도우는 입력과 출력을 합친 상한이다. 이 장의 예에서 다섯 조각 합 5,000이 128K의 3.9%를 차지했다.' },
    { q: '프레임워크가 오래된 메시지를 말없이 잘라낼 때 생기는 증상은 무엇인가?',
      o: ['API가 400 에러를 낸다', '응답 속도가 빨라질 뿐 문제는 없다', '앞에서 정한 사실이나 약속을 모델이 잊는다'], a: 2,
      why: '잘린 메시지는 모델 시야에서 사라진다. 에러가 나지 않아 사용자는 잘린 줄 모른다.' },
    { q: '45,000 토큰짜리 대화 이력을 줄이는 이 장의 방법은 무엇인가?',
      o: ['LLM으로 요약해 1,500 토큰 system 메시지로 바꾼다', '이력을 전부 지운다', 'max_tokens를 키운다'], a: 0,
      why: '요약은 오래된 대화를 몇 문장으로 압축한다. RAG 청크 3,000과 합쳐도 요청이 6,000으로 128K의 4.7%다.' },
  ];

  const summary = [
    'LLM은 글자도 단어도 아닌 토큰 단위로 읽고, 같은 뜻이라도 한국어가 토큰을 더 쓴다.',
    '토큰 수는 모델의 사전으로 세야 정확하고, gpt-4o는 tiktoken의 o200k_base를 쓴다.',
    '윈도우에는 system·이력·도구 결과·질문·응답 예약이 모두 들어가며 넘으면 거부되거나 잘린다.',
    '청킹·요약·RAG를 섞으면 133,000짜리 요청이 6,000으로 줄어든다.',
  ];
  const review = [
    { q: '오래 대화한 Agent가 처음에 들은 사용자 이름을 갑자기 모른다. 에러 로그는 없다. 먼저 의심할 것은?',
      o: ['tokenizer가 이름을 잘못 잘랐다', '메모리 창이 오래된 메시지를 잘라냈다', 'temperature가 너무 낮다'], a: 1,
      why: '윈도우를 지키려고 오래된 메시지를 조용히 지우면 그 안의 사실도 사라진다. 요약으로 남기거나 system에 고정해야 한다.' },
    { q: 'PDF 검색 도구를 붙인 뒤부터 400 context length 에러가 난다. 가장 알맞은 조치는?',
      o: ['검색 결과를 청크로 나눠 질문과 가까운 top-k만 넣는다', 'max_tokens를 두 배로 늘린다', '모든 PDF를 system 메시지에 붙인다'], a: 0,
      why: '도구 결과가 통째로 들어와 윈도우를 넘긴 것이다. 필요한 청크만 넣으면 요청이 한도 안으로 들어온다.' },
    { q: '한국어 서비스 비용을 미리 어림하려 한다. 이 장 기준으로 안전한 방법은?',
      o: ['영어처럼 글자 수 ÷ 4로 잡는다', '띄어 쓴 단어 수를 그대로 토큰 수로 쓴다', '글자 수 × 1.5로 잡고 정확한 값은 tiktoken으로 센다'], a: 2,
      why: '÷ 4는 영어용 어림이다. 한국어는 넉넉히 × 1.5로 잡고, 실제 청구에 가까운 수는 모델 사전으로 직접 센다.' },
  ];

  R.page({ title: '토큰과 윈도우 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
