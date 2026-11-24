/* III-1-1 Embedding이란 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 단어 좌표는 페이지의 WORD_DB(2D 그림용 배치)를 읽는다. 문장 임베딩 점수는 API 실측이 아닌 예시값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, check, cross } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 숫자 칸 띠 (벡터). vals 를 u 비율만큼 왼쪽부터 채운다
  function strip(x, y, vals, u, o) { o = o || {}; const w = o.w || 64, h = o.h || 34, n = vals.length;
    vals.forEach((v, i) => { const s = clamp(u * n - i); const cx = x + i * (w + 4) + w / 2;
      el('rect', { x: cx - w / 2, y, width: w, height: h, rx: 5, fill: s > 0 ? (o.fill || PANEL) : SOFT, stroke: s > 0 ? (o.col || INK) : GRID, 'stroke-width': 1.6 });
      if (s > 0) mono(cx, y + h / 2 + 5, String(v), { 'font-size': o.fs || 13.5, 'text-anchor': 'middle', fill: o.col || INK, opacity: s }); });
    if (o.more) mono(x + n * (w + 4) + 6, y + h / 2 + 5, o.more, { 'font-size': 13.5, fill: MUT, opacity: clamp(u * n - n + 1) }); }

  // ---------- 1. 단어 → 좌표 ----------
  const GCOL = { 'royal-male': ACC, 'royal-female': ACC, 'common-male': INFO, 'common-female': INFO, animal: WARN, fruit: GOOD };
  const W = () => (typeof WORD_DB === 'undefined' ? null : WORD_DB);
  const PX = (p) => 60 + p * 4.7, PY = (p) => 44 + p * 3.4;
  function wordMap(on, hl, op) { const D = W(); if (!D) return;
    zone(30, 30, 520, 368, '2D로 줄여 본 의미 공간 (그림용 배치)', { fill: SOFT });
    el('line', { x1: 290, y1: 52, x2: 290, y2: 388, stroke: GRID, 'stroke-dasharray': '3 5' }); el('line', { x1: 44, y1: 214, x2: 536, y2: 214, stroke: GRID, 'stroke-dasharray': '3 5' });
    Object.entries(D).forEach(([k, w]) => { const a = on(k), x = PX(w.x), y = PY(w.y), col = GCOL[w.group] || MUT;
      const big = hl.includes(k);
      el('circle', { cx: x, cy: y, r: big ? 9 : 7, fill: a > 0.5 ? col : OFF, opacity: (0.35 + 0.65 * a) * (op ?? 1), stroke: big ? INK : 'none', 'stroke-width': 2 });
      tx(x + 13, y + 5, w.text, { 'font-size': 15, 'font-weight': 700, fill: a > 0.5 ? col : MUT, opacity: (0.4 + 0.6 * a) * (op ?? 1) }); }); }
  function s1(t, c) { const { k, u } = c, D = W(); if (!D) return;
    const shown = { 0: [], 1: ['king', 'queen'], 2: ['king', 'queen', 'man', 'woman'] }[Math.min(k, 2)];
    const on = (key) => (shown.includes(key) ? (k === 1 && (key === 'king' || key === 'queen') ? E(u, 0.2 + (key === 'queen' ? 0.4 : 0), 0.8 + (key === 'queen' ? 0.4 : 0)) : k === 2 && (key === 'man' || key === 'woman') ? E(u, 0.2, 0.8) : 1) : 0);
    wordMap(on, (c.beat.highlight || []));
    const P = (key) => [PX(D[key].x), PY(D[key].y)];
    // 오른쪽 설명 칸
    if (k === 0) { const rows = Math.floor(E(u, 0.3, 2.0) * 9);
      tx(580, 70, 'wv = KeyedVectors', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      sub(580, 96, 'GoogleNews 사전학습 · 단어마다 300개 숫자', 1, { 'text-anchor': 'start' });
      for (let i = 0; i < 9; i++) { const y = 120 + i * 26, s = i < rows ? 1 : 0;
        el('rect', { x: 580, y, width: 120, height: 20, rx: 4, fill: s ? ACCBG : SOFT, stroke: s ? ACC : GRID, 'stroke-width': 1.2 });
        el('rect', { x: 708, y, width: 220 * s, height: 20, rx: 4, fill: OFF, opacity: 0.5 }); }
      note(580, 372, '아직 아무 단어도 조회하지 않았다', fade(u, 2.1), { fill: MUT });
      return; }
    if (k === 1) { tx(580, 64, 'wv["king"][:5]', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: ACC });
      strip(580, 76, ['0.23', '-0.45', '0.12', '0.89', '-0.33'], E(u, 0.3, 1.3), { w: 62, col: ACC, more: '…' });
      tx(580, 150, 'wv["queen"][:5]', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: ACC, opacity: fade(u, 1.2) });
      strip(580, 162, ['0.27', '-0.43', '0.10', '0.85', '-0.30'], E(u, 1.3, 2.3), { w: 62, col: ACC, more: '…' });
      sub(580, 230, '(설명용 예시값 · 실제 300개 중 앞 5개)', fade(u, 2.2), { 'text-anchor': 'start' });
      note(580, 280, '숫자 줄이 비슷하다', fade(u, 2.3)); note(580, 306, '= 공간에서 가깝다', fade(u, 2.4), { fill: ACC });
      return; }
    const [kx, ky] = P('king'), [mx, my] = P('man'), [wx, wy] = P('woman'), [qx, qy] = P('queen'), dx = wx - mx, dy = wy - my;
    if (k === 2) { // man→woman 화살표를 king 끝으로 옮겨 붙이면 queen 에 닿는다
      grow(mx, my, wx, wy, E(u, 0.9, 1.4), INFO, { sw: 2.6 });
      const m = E(u, 1.5, 2.3); grow(lerp(mx, kx, m), lerp(my, ky, m), lerp(wx, kx + dx, m), lerp(wy, ky + dy, m), m > 0 ? 1 : 0, ACC, { sw: 2.6, dash: '6 4' });
      spansEq(580, 80, fade(u, 0.3));
      if (u > 2.3) pill(740, 190, 'queen  0.7118', ACC, pop(u, 2.3), { mono: true, fs: 15 });
      sub(740, 232, 'most_similar 1위', fade(u, 2.4)); return; }
    grow(mx, my, wx, wy, 1, INFO, { sw: 2.6 }); grow(kx, ky, qx, qy, 1, ACC, { sw: 2.6 });
    if (k === 3) { tx(580, 64, '같은 모양의 관계', { 'font-size': 16, 'font-weight': 800 });
      [['Paris − France + Italy', '≈ Rome'], ['Tokyo − Japan + Korea', '≈ Seoul'], ['big − bigger + smaller', '≈ small']].forEach(([a, b], i) => {
        const y = 110 + i * 64, s = E(u, 0.3 + i * 0.5, 0.9 + i * 0.5);
        mono(580, y, a.slice(0, Math.round(a.length * s)), { 'font-size': 15 });
        mono(800, y, b, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9 + i * 0.5) }); });
      note(580, 330, '수도 · 비교급도 좌표 차이로 표현된다', fade(u, 2.1)); return; }
    // k4: 평행사변형
    const d = E(u, 0.2, 1.0);
    el('line', { x1: kx, y1: ky, x2: lerp(kx, mx, d), y2: lerp(ky, my, d), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
    el('line', { x1: qx, y1: qy, x2: lerp(qx, wx, d), y2: lerp(qy, wy, d), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
    if (u > 1.0) el('polygon', { points: `${mx},${my} ${kx},${ky} ${qx},${qy} ${wx},${wy}`, fill: ACC, opacity: 0.08 * fade(u, 1.0) });
    tx(580, 90, 'queen − king', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.2) });
    tx(580, 124, '≈ woman − man', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: INFO, opacity: fade(u, 1.5) });
    note(580, 180, '두 화살표가 평행하다', fade(u, 1.8));
    note(580, 206, '"성별"이라는 관계가 한 방향이 된다', fade(u, 2.1), { fill: MUT }); }
  function spansEq(x, y, op) { R.spans(x, y, [['king', { fill: ACC, 'font-weight': 800 }], [' − ', {}], ['man', { fill: INFO, 'font-weight': 800 }], [' + ', {}], ['woman', { fill: INFO, 'font-weight': 800 }]], { 'font-size': 18, opacity: op });
    tx(x, y + 34, '남자→여자 화살표를 왕 끝에 붙인다', { 'font-size': 14, fill: MUT, opacity: op }); }

  // ---------- 2. 문장 → 벡터 ----------
  const MP = { q: [150, 250], d1: [205, 290], d2: [330, 210], d3: [400, 350], q2: [118, 300], q3: [440, 330] };   // 그림용 배치 (가까울수록 비슷)
  function mapPts(show) { zone(30, 162, 450, 242, '2D로 본 문장 위치 (그림용)', { fill: SOFT });
    const P = [['q', '질문 q', ACC], ['d1', '연차 문서 (정답)', GOOD], ['d2', '재택 문서', MUT], ['d3', '점심 문장', MUT], ['q2', 'q2 같은 뜻', INFO], ['q3', 'q3 다른 뜻', WARN]];
    P.forEach(([id, name, col]) => { const s = show[id] || 0; if (s <= 0) return; const [x, y] = MP[id];
      el('circle', { cx: x, cy: y, r: 8 * (0.5 + 0.5 * s), fill: col, opacity: s });
      tx(x + 13, y + 5, name, { 'font-size': 14, 'font-weight': 700, fill: col === MUT ? INK : col, opacity: s, 'text-anchor': id === 'q3' || id === 'd3' ? 'end' : 'start', dx: id === 'q3' || id === 'd3' ? -26 : 0, dy: id === 'q3' ? -14 : 0 }); }); }
  function s2(t, c) { const { k, u } = c;
    // 위: 문장 → 모델 → 1536칸
    const mOp = k === 0 ? pop(u, 0.2) : 1;
    card(400, 74, 200, 64, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, s: mOp, text: 'text-embedding-3-small\n출력 1536d', fs: 14, color: INK });
    const qv = ['0.012', '-0.034', '0.071', '-0.018', '0.045'];
    if (k === 0) { strip(530, 57, ['', '', '', '', ''], 0, { w: 60, more: '… 1536칸' }); note(530, 130, '어떤 문장이든 같은 길이로 나온다', fade(u, 1.2), { fill: MUT }); return; }
    const typed = k === 1 ? E(u, 0.1, 0.8) : 1, s = '연차 휴가는 며칠인가요?';
    card(150, 74, 230, 46, { rx: 8, stroke: ACC, text: s.slice(0, Math.round(s.length * typed)), fs: 15 });
    if (k === 1) dot([[266, 74], [300, 74]], seg(u, 0.8, 1.2), ACC, 7);
    strip(530, 57, qv, k === 1 ? E(u, 1.2, 2.2) : 1, { w: 60, col: ACC, more: '… 1536개' });
    sub(530 + 160, 118, 'vec (예시값)', k === 1 ? fade(u, 2.2) : 1);
    if (k === 1) { note(40, 200, 'embed_query 한 번 = 문장 하나가 벡터 하나', fade(u, 2.3)); return; }
    // 아래: 문서 3건 → 점
    const docs = k === 2 ? (id) => E(u, 0.3 + ['d1', 'd2', 'd3'].indexOf(id) * 0.45, 0.8 + ['d1', 'd2', 'd3'].indexOf(id) * 0.45) : () => 1;
    mapPts({ q: 1, d1: docs('d1'), d2: docs('d2'), d3: docs('d3'), q2: k === 3 ? E(u, 0.4, 1.0) : k > 3 ? 1 : 0, q3: k === 3 ? E(u, 1.2, 1.8) : k > 3 ? 1 : 0 });
    if (k === 2) { [['연차는 입사 1년 후 15일 부여됩니다.', GOOD], ['재택근무는 팀장 승인 후 가능합니다.', INK], ['오늘 점심은 김치찌개였다.', INK]].forEach(([d, col], i) => {
        const y = 190 + i * 54, o = fade(u, 0.3 + i * 0.45); tx(520, y, d, { 'font-size': 14, fill: col, opacity: o, 'font-weight': 600 });
        strip(520, y + 10, ['', '', '', '', ''], 0, { w: 40, h: 22 }); el('rect', { x: 520, y: y + 10, width: 216 * E(u, 0.5 + i * 0.45, 1.2 + i * 0.45), height: 22, rx: 5, fill: col === GOOD ? GOOD : OFF, opacity: 0.35 }); });
      mono(520, 370, 'vectors : 3 × 1536', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { tx(520, 210, 'q2 "휴가 일수 알려주세요"', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
      sub(520, 234, '단어는 달라도 뜻이 같다 → q 옆에 놓인다', fade(u, 0.8), { 'text-anchor': 'start' });
      tx(520, 290, 'q3 "오늘 메뉴 추천해줘"', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
      sub(520, 314, '뜻이 다르다 → 점심 문장 쪽으로 간다', fade(u, 1.6), { 'text-anchor': 'start' }); return; }
    // k4: cosine 점수 (예시값)
    const [qx, qy] = MP.q;
    [['q2', 0.84, INFO], ['d1', 0.78, GOOD], ['q3', 0.11, WARN]].forEach(([id, v, col], i) => { const [x, y] = MP[id];
      grow(qx, qy, x, y, E(u, 0.2 + i * 0.3, 0.7 + i * 0.3), col, { plain: true, dash: '5 4' });
      const by = 200 + i * 56; tx(520, by, ['sim(q, q2)', 'sim(q, docs[0])', 'sim(q, q3)'][i], { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      R.hbar(520, by + 10, 300, v, 1, { u: E(u, 0.5 + i * 0.35, 1.5 + i * 0.35), col, text: v.toFixed(2), h: 20 }); });
    sub(700, 384, 'API 실측이 아닌 설명용 예시값', fade(u, 2.0)); }

  // ---------- 3. 차원 ----------
  const DIMS = [['bge-small-en-v1.5', 384], ['bge-base-en-v1.5', 768], ['E5-large-v2', 1024], ['text-embedding-3-small', 1536], ['text-embedding-3-large', 3072]];
  function dimBars(u, hi, o) { o = o || {}; const x0 = 250, w = 470;
    DIMS.forEach(([name, d], i) => { const y = 70 + i * 48, g = o.grow ? E(u, 0.2 + i * 0.25, 0.9 + i * 0.25) : 1, on = hi === d;
      tx(x0 - 12, y + 15, name, { 'font-size': 14, 'font-weight': on ? 800 : 600, 'text-anchor': 'end', class: 'mono', fill: on ? ACC : INK, opacity: g > 0 ? 1 : 0.3 });
      if (o.cut && d === 3072) { const keep = w * 512 / 3072, cu = o.cut;
        el('rect', { x: x0, y, width: w, height: 22, rx: 4, fill: OFF, opacity: 1 - 0.7 * cu });
        el('rect', { x: x0, y, width: keep, height: 22, rx: 4, fill: ACC });
        el('line', { x1: x0 + keep, y1: y - 8, x2: x0 + keep, y2: y + 30, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: cu });
        mono(x0 + w + 10, y + 16, cu > 0.5 ? '3072 → 512' : '3072', { 'font-size': 14, 'font-weight': 800, fill: ACC }); return; }
      el('rect', { x: x0, y, width: w, height: 22, rx: 4, fill: SOFT });
      el('rect', { x: x0, y, width: Math.max(2, w * d / 3072 * g), height: 22, rx: 4, fill: on ? ACC : hi ? OFF : INFO, opacity: on || !hi ? 1 : 0.8 });
      if (on) el('rect', { x: x0 - 4, y: y - 4, width: w * d / 3072 + 8, height: 30, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2 });
      mono(x0 + w * d / 3072 * g + 10, y + 16, String(d), { 'font-size': 14, 'font-weight': 700, opacity: g > 0.2 ? 1 : 0 }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(220, 110, 280, 80, { rx: 12, stroke: INFO, text: 'OpenAIEmbeddings\nAPI 호출 · 서버 밖으로 전송', fs: 15, s: pop(u, 0.2) });
      card(220, 260, 280, 80, { rx: 12, stroke: GOOD, text: 'HuggingFaceEmbeddings\n내 서버에서 실행', fs: 15, s: pop(u, 0.5) });
      grow(365, 110, 520, 180, E(u, 0.9, 1.4), MUT); grow(365, 260, 520, 195, E(u, 1.0, 1.5), MUT);
      card(680, 188, 300, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'embed_query("연차 정책")\n→ 숫자 벡터', fs: 15, s: pop(u, 1.5) });
      note(530, 300, '어느 쪽이든 쓰는 법은 같다', fade(u, 2.1)); return; }
    if (k === 1) { tx(40, 40, '모델마다 정해진 차원 (벡터 길이)', { 'font-size': 16, 'font-weight': 800 }); dimBars(u, null, { grow: true });
      note(250, 340, '차원 = 의미를 담는 칸 수. 많을수록 세밀하다', fade(u, 2.0)); return; }
    if (k === 2) { dimBars(u, 1536); mono(250, 340, 'len(v_oai)  # 1536', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      note(250, 376, 'RAG를 처음 만들 때 흔히 쓰는 크기', fade(u, 1.2), { fill: MUT }); return; }
    if (k === 3) { dimBars(u, 768); mono(250, 340, 'len(v_bge)  # 768', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      const h = E(u, 0.8, 1.8); el('rect', { x: 600, y: 322, width: 120, height: 60, rx: 4, fill: OFF, opacity: 0.6 }); el('rect', { x: 600, y: 322, width: 60 * h + 0.01, height: 60, rx: 4, fill: ACC });
      sub(660, 400, '1536칸 중 768칸', fade(u, 1.6)); note(740, 358, '저장량 절반', fade(u, 1.9), { fill: ACC }); return; }
    if (k === 4) { dimBars(u, null, { cut: E(u, 0.4, 1.4) });
      mono(250, 340, 'dimensions=512', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      note(250, 376, '3-large는 앞부분만 잘라 써도 의미가 크게 상하지 않는다', fade(u, 1.6)); return; }
    // k5: 10만 chunk 저장량 (float32 실측 계산) · 검색 시간(예시)
    tx(40, 44, '청크 10만 개를 float32로 저장할 때', { 'font-size': 16, 'font-weight': 800 });
    [[384, '154MB', '8ms'], [768, '307MB', '14ms'], [1536, '614MB', '26ms'], [3072, '1.23GB', '50ms']].forEach(([d, mb, ms], i) => { const y = 80 + i * 60, g = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3);
      mono(150, y + 16, d + 'd', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: d === 1536 ? ACC : INK });
      el('rect', { x: 170, y, width: 520, height: 24, rx: 4, fill: SOFT }); el('rect', { x: 170, y, width: 520 * d / 3072 * g + 2, height: 24, rx: 4, fill: d === 1536 ? ACC : INFO });
      mono(180 + 520 * d / 3072 * g, y + 17, mb, { 'font-size': 14, 'font-weight': 700, opacity: g });
      mono(820, y + 17, ms, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) }); });
    sub(780, 66, '검색 시간(예시)', fade(u, 1.6));
    note(170, 345, '차원이 4배면 저장량도 4배', fade(u, 2.0)); note(170, 375, '입문 1536d · 한국어 BGE-M3/KURE · 정밀 3072d', fade(u, 2.3), { fill: MUT }); }

  // ---------- 4. 정규화 ----------
  const RO = [90, 360], RS = 27, NO = [500, 360], NS = 250;
  const rp = (x, y) => [RO[0] + x * RS, RO[1] - y * RS], np_ = (x, y) => [NO[0] + x * NS, NO[1] - y * NS];
  function rawPanel(o) { o = o || {}; zone(40, 36, 380, 372, '정규화 전', { fill: SOFT });
    el('line', { x1: RO[0], y1: RO[1], x2: RO[0] + 300, y2: RO[1], stroke: MUT, 'stroke-width': 1.5 }); el('line', { x1: RO[0], y1: RO[1], x2: RO[0], y2: RO[1] - 290, stroke: MUT, 'stroke-width': 1.5 });
    const [ax, ay] = rp(3, 4), [bx, by] = rp(6, 8);
    grow(RO[0], RO[1], bx, by, o.b ?? 1, WARN, { sw: 5 }); grow(RO[0], RO[1], ax, ay, o.a ?? 1, ACC, { sw: 3 });
    tx(ax + 14, ay + 18, 'a [3, 4]  길이 5', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: o.a ?? 1 });
    tx(bx + 14, by + 6, 'b [6, 8]  길이 10', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: o.b ?? 1 }); }
  function normPanel(o) { o = o || {}; zone(450, 36, 330, 372, '정규화 후 (길이 1)', { fill: SOFT });
    el('line', { x1: NO[0], y1: NO[1], x2: NO[0] + 270, y2: NO[1], stroke: MUT, 'stroke-width': 1.5 }); el('line', { x1: NO[0], y1: NO[1], x2: NO[0], y2: NO[1] - 280, stroke: MUT, 'stroke-width': 1.5 });
    const cu = o.circle ?? 1; if (cu > 0) { const a = (Math.PI / 2) * cu; el('path', { d: `M${NO[0] + NS},${NO[1]} A${NS},${NS} 0 0 0 ${NO[0] + NS * Math.cos(a)},${NO[1] - NS * Math.sin(a)}`, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); }
    const [ux, uy] = np_(0.6, 0.8);
    grow(NO[0], NO[1], ux, uy, o.v ?? 1, WARN, { sw: 6 }); grow(NO[0], NO[1], ux, uy, o.v ?? 1, ACC, { sw: 2.5 });
    if ((o.v ?? 1) > 0.9) tx(560, 300, 'a, b → [0.6, 0.8]', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC }); }
  function metric(x, y, name, v, col, op) { card(x, y, 150, 56, { rx: 10, stroke: col, sw: 2, op });
    tx(x - 62, y - 6, name, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: op }); mono(x - 62, y + 18, v, { 'font-size': 19, 'font-weight': 800, fill: col, opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    rawPanel({ a: k === 0 ? E(u, 0.2, 1.0) : 1, b: k === 0 ? E(u, 1.0, 1.8) : 1 });
    if (k === 0) { note(460, 120, '방향은 똑같고', fade(u, 1.9)); note(460, 150, '길이만 두 배 다르다', fade(u, 2.2), { fill: WARN }); return; }
    if (k <= 2) { const a = E(u, 0.2, 0.8);
      if (k === 1) { el('path', { d: `M${RO[0] + 50},${RO[1]} A50,50 0 0 0 ${RO[0] + 30},${RO[1] - 40}`, fill: 'none', stroke: INK, 'stroke-width': 1.5, opacity: a });
        tx(RO[0] + 58, RO[1] - 18, 'θ = 0°', { 'font-size': 14, 'font-weight': 700, opacity: a }); }
      tx(460, 90, 'cosine = a·b / (‖a‖‖b‖)', { 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: k === 1 ? fade(u, 0.4) : 1 });
      mono(460, 122, '= 50 / (5 × 10)', { 'font-size': 16, opacity: k === 1 ? fade(u, 1.0) : 1 });
      metric(540, 180, 'cosine', '1.0', GOOD, k === 1 ? fade(u, 1.6) : 1);
      if (k === 2) { const [ax, ay] = rp(3, 4), [bx, by] = rp(6, 8), g = E(u, 0.3, 1.2);
        el('line', { x1: ax + 6, y1: ay + 4, x2: lerp(ax, bx, g) + 6, y2: lerp(ay, by, g) + 4, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
        metric(540, 260, 'L2 거리', '5.0', BAD, fade(u, 1.3)); cross(640, 260, 9, pop(u, 1.6));
        note(460, 330, '같은 방향인데 거리 5 → 다른 문서처럼 보인다', fade(u, 1.9), { fill: BAD }); }
      return; }
    if (k <= 4) { normPanel({ circle: k === 3 ? E(u, 0.1, 0.9) : 1, v: k === 3 ? E(u, 0.9, 1.7) : 1 });
      if (k === 3) { mono(800, 90, 'a / 5', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); mono(800, 120, 'b / 10', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
        note(800, 170, '자기 길이로', fade(u, 1.8)); note(800, 194, '나눈다', fade(u, 1.9)); return; }
      metric(865, 100, 'L2 거리', '0.0', GOOD, fade(u, 0.3)); metric(865, 180, 'cosine', '1.0', GOOD, fade(u, 0.7));
      mono(800, 262, 'cos = 1 − L2²/2', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) });
      note(800, 300, '두 방식이', fade(u, 1.8)); note(800, 324, '같은 답', fade(u, 1.9), { fill: GOOD }); return; }
    // k5: 실무 체크
    tx(460, 70, '실무에서 확인할 것', { 'font-size': 17, 'font-weight': 800 });
    [['OpenAI text-embedding-3', '이미 길이 1로 나온다'], ['BGE · E5 (HuggingFace)', 'normalize_embeddings=True'], ['정규화된 벡터라면', 'Vector DB는 cosine · dot 둘 다 OK']].forEach(([a, b], i) => {
      const y = 130 + i * 84, s = pop(u, 0.2 + i * 0.45); card(690, y, 440, 66, { rx: 10, stroke: GOOD, sw: 2, s }); check(500, y, 11, s);
      tx(526, y - 5, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.45) }); tx(526, y + 19, b, { 'font-size': 14, fill: MUT, class: i === 1 ? 'mono' : null, opacity: fade(u, 0.3 + i * 0.45) }); }); }

  // ---------- 5. 활용 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { zone(30, 40, 450, 360, '같은 공간의 질문과 사규 문단', { fill: SOFT });
      const D = [[260, 200, 1], [300, 250, 2], [205, 255, 3], [400, 120, 0], [110, 120, 0], [420, 330, 0], [120, 340, 0], [350, 340, 0]], q = [250, 240];
      D.forEach(([x, y, r], i) => { el('circle', { cx: x, cy: y, r: 7, fill: r ? GOOD : OFF, opacity: fade(u, 0.1 + i * 0.05) }); });
      const ring = E(u, 0.6, 1.5); el('circle', { cx: q[0], cy: q[1], r: 66 * ring, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      el('circle', { cx: q[0], cy: q[1], r: 9, fill: ACC }); tx(q[0], 336, '질문 "휴가 며칠?"', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
      D.filter((d) => d[2]).forEach(([x, y, r]) => { tx(x + 11, y - 8, String(r), { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: GOOD, opacity: fade(u, 1.5 + r * 0.2) }); });
      tx(520, 90, '① 의미 검색 (RAG의 중심)', { 'font-size': 17, 'font-weight': 800 });
      mono(520, 130, 'similarity_search_by_vector(q, k=3)', { 'font-size': 14, opacity: fade(u, 0.4) });
      card(720, 190, 400, 52, { rx: 10, stroke: GOOD, text: '1위  연차는 입사 1년 후 15일 부여', fs: 15, s: pop(u, 1.8) });
      note(520, 260, '"휴가"와 "연차"처럼 단어가 달라도', fade(u, 2.1)); note(520, 286, '뜻이 가까우면 찾아낸다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 1) { zone(30, 40, 450, 360, '라벨마다 대표 벡터(평균)', { fill: SOFT });
      const pos = [[110, 120], [150, 160], [100, 190], [170, 110]], neg = [[360, 300], [400, 260], [330, 340], [410, 330]], cp = [133, 145], cn = [375, 308], nw = [215, 205];
      pos.forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 7, fill: GOOD, opacity: fade(u, 0.1 + i * 0.08) }));
      neg.forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 7, fill: BAD, opacity: fade(u, 0.1 + i * 0.08) }));
      [[cp, GOOD, '긍정'], [cn, BAD, '부정']].forEach(([[x, y], col, n]) => { const s = pop(u, 0.7);
        el('path', { d: `M${x},${y - 11} L${x + 11},${y} L${x},${y + 11} L${x - 11},${y} Z`, fill: PANEL, stroke: col, 'stroke-width': 3, opacity: s });
        tx(x, n === '긍정' ? 90 : 382, n + ' 중심 ◇', { 'font-size': 14, 'font-weight': 800, fill: col, opacity: s, 'text-anchor': 'middle' }); });
      const a = E(u, 1.2, 1.8); el('circle', { cx: nw[0], cy: nw[1], r: 9, fill: INK, opacity: a }); tx(nw[0] + 14, nw[1] + 22, '새 리뷰', { 'font-size': 14, 'font-weight': 700, opacity: a });
      grow(nw[0], nw[1], cp[0] + 8, cp[1] + 8, E(u, 1.6, 2.1), GOOD, { plain: true }); grow(nw[0], nw[1], cn[0] - 8, cn[1] - 8, E(u, 1.6, 2.1), OFF, { plain: true, dash: '5 4' });
      tx(520, 90, '② zero-shot 분류', { 'font-size': 17, 'font-weight': 800 });
      note(520, 140, '라벨별 문장들의 평균 = 대표 벡터', fade(u, 0.6)); note(520, 172, '새 문서는 가장 가까운 대표에 붙인다', fade(u, 1.5));
      pill(640, 240, '→ 긍정', GOOD, pop(u, 2.2), { fs: 15 }); note(520, 300, '학습 데이터가 거의 없어도 된다', fade(u, 2.4), { fill: MUT }); return; }
    if (k === 2) { zone(30, 40, 450, 175, '③ 추천: 본 작품 평균 = 취향', { fill: SOFT });
      const seen = [[90, 110], [130, 150], [80, 170]], tv = [100, 143], cat = [[160, 120], [380, 90], [420, 170], [190, 175]];
      seen.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 7, fill: INFO }));
      cat.forEach(([x, y], i) => { const near = i === 0 || i === 3; el('circle', { cx: x, cy: y, r: 7, fill: near ? ACC : OFF, opacity: near ? fade(u, 1.2) * 0.8 + 0.2 : 1 }); });
      const s = pop(u, 0.5); el('path', { d: `M${tv[0]},${tv[1] - 12} L${tv[0] + 4},${tv[1] - 4} L${tv[0] + 12},${tv[1] - 3} L${tv[0] + 6},${tv[1] + 3} L${tv[0] + 8},${tv[1] + 12} L${tv[0]},${tv[1] + 7} L${tv[0] - 8},${tv[1] + 12} L${tv[0] - 6},${tv[1] + 3} L${tv[0] - 12},${tv[1] - 3} L${tv[0] - 4},${tv[1] - 4} Z`, fill: WARN, opacity: s });
      grow(tv[0] + 12, tv[1], 150, 124, E(u, 1.0, 1.5), ACC, { plain: true }); grow(tv[0] + 12, tv[1] + 6, 180, 172, E(u, 1.1, 1.6), ACC, { plain: true });
      tx(250, 140, '가까운 작품 top-N', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      zone(30, 228, 450, 172, '④ 중복 제거: 거의 같은 방향끼리 묶기', { fill: SOFT });
      const pr = [[150, 320], [162, 328]], other = [[330, 300], [400, 350], [260, 370]];
      other.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 7, fill: OFF })); pr.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 7, fill: INFO }));
      el('circle', { cx: 156, cy: 324, r: 26 * E(u, 1.6, 2.2) + 0.01, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      tx(195, 330, 'cosine ≥ 0.95 → 한 건으로', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) });
      tx(520, 110, '추천', { 'font-size': 17, 'font-weight': 800, fill: INFO }); note(520, 140, '취향 벡터와 가까운 것을 고른다', fade(u, 0.8));
      tx(520, 290, '중복 제거', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.5) }); note(520, 320, '뉴스 수만 건의 같은 기사 묶기', fade(u, 1.8));
      return; }
    // k3, k4: RAG 파이프라인 속 위치
    const Y1 = 120, Y2 = 290, xs = [90, 260, 450, 660], names = ['PDF', 'chunks', 'embed', 'Vector DB'];
    names.forEach((n, i) => { const star = n === 'embed'; card(xs[i], Y1, star ? 140 : 120, 56, { rx: 10, stroke: star ? ACC : INK, fill: star ? ACCBG : PANEL, sw: star ? 3 : 2, text: n, fs: 15, mono: true, s: k === 3 ? pop(u, 0.1 + i * 0.2) : 1 });
      if (i) grow(xs[i - 1] + (i === 3 ? 72 : 62), Y1, xs[i] - (star ? 72 : 62), Y1, k === 3 ? E(u, 0.3 + i * 0.2, 0.6 + i * 0.2) : 1, MUT); });
    if (k === 3) tx(450, Y1 - 44, '★ 이 장의 자리', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    card(90, Y2, 120, 56, { rx: 10, text: '질문', fs: 15, s: k === 3 ? pop(u, 1.0) : 1 });
    card(300, Y2, 180, 56, { rx: 10, stroke: ACC, fill: ACCBG, text: 'embed_query', fs: 15, mono: true, s: k === 3 ? pop(u, 1.2) : 1 });
    grow(152, Y2, 208, Y2, k === 3 ? E(u, 1.2, 1.5) : 1, MUT);
    grow(392, Y2, 600, Y1 + 32, k === 3 ? E(u, 1.5, 1.9) : 1, ACC);
    tx(520, 245, 'cosine top-k', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: ACC, opacity: k === 3 ? fade(u, 1.8) : 1 });
    card(850, 205, 130, 64, { rx: 10, text: 'LLM\n→ 답변', fs: 15, s: k === 3 ? pop(u, 2.0) : 1 }); grow(722, Y1 + 10, 790, 190, k === 3 ? E(u, 2.0, 2.3) : 1, MUT);
    if (k === 3) { dot([[150, Y1], [660, Y1]], seg(u, 0.6, 1.6), INK, 6); dot([[150, Y2], [392, Y2], [600, Y1 + 32]], seg(u, 1.4, 2.4), ACC, 6); return; }
    pill(450, Y1 + 56, '어떤 모델로? III-1-2', ACC, pop(u, 0.3), { fs: 14 });
    pill(660, Y1 - 52, '어디에 담나? III-2-1', INFO, pop(u, 0.9), { fs: 14 });
    note(40, 380, '한 모델로 만든 벡터가 검색 · 분류 · 추천 · 중복 제거를 모두 받친다', fade(u, 1.6)); }

  const quiz = [
    { q: 'King − Man + Woman 연산이 queen을 1위로 돌려주는 까닭은 무엇인가?',
      o: ['두 단어의 철자가 비슷해서', '남자에서 여자로 가는 좌표 차이와 왕에서 여왕으로 가는 차이가 거의 같아서', 'Word2Vec이 queen을 따로 외워 두어서'], a: 1,
      why: '성별 관계가 두 쌍에서 같은 화살표로 나타난다. 그래서 왕 끝에 그 화살표를 붙이면 여왕 근처에 닿고, most_similar 1위가 queen(0.7118)이다.' },
    { q: '"연차 휴가는 며칠인가요?"와 "휴가 일수 알려주세요"의 임베딩은 어떻게 놓이는가?',
      o: ['겹치는 단어가 적어 멀리 떨어진다', '뜻이 같아서 가까이 놓인다', '문장 길이가 달라 차원 수가 달라진다'], a: 1,
      why: '문장 임베딩은 단어가 아니라 뜻을 좌표로 만든다. 예시에서 두 질문의 cosine은 0.84로, 무관한 문장의 0.11보다 훨씬 높다.' },
    { q: '청크 10만 개를 1536d에서 768d 모델로 바꾸면 저장량은 어떻게 되는가?',
      o: ['약 614MB에서 약 307MB로 절반이 된다', '그대로다', '두 배로 는다'], a: 0,
      why: 'float32 한 칸이 4바이트라 저장량은 차원에 비례한다. 10만 × 1536 × 4B ≈ 614MB, 768d면 약 307MB다.' },
    { q: 'a=[3,4]와 b=[6,8]을 정규화하지 않고 L2 거리로 비교하면 어떤 문제가 생기는가?',
      o: ['같은 방향인데 거리 5.0이 나와 다른 문서처럼 보인다', 'cosine보다 계산이 느리다', '음수 거리가 나온다'], a: 0,
      why: 'L2는 길이 차이까지 거리로 센다. 둘 다 [0.6, 0.8]로 정규화하면 L2는 0.0이 되어 cosine 1.0과 같은 판단을 내린다.' },
    { q: '라벨별 평균 벡터를 만들어 두고 새 문서를 가장 가까운 평균에 붙이는 응용은 무엇인가?',
      o: ['의미 검색', '중복 제거', 'zero-shot 분류'], a: 2,
      why: '라벨 대표 벡터(centroid)와의 거리로 라벨을 정하므로 학습 데이터가 거의 없어도 분류가 된다.' },
  ];

  const summary = [
    '임베딩은 텍스트를 숫자 벡터로 바꿔 뜻이 비슷하면 좌표도 가깝게 놓는다.',
    '단어 사이 관계도 좌표 차이로 남아서 왕 − 남자 + 여자 계산이 여왕에 닿는다.',
    '차원이 클수록 세밀하지만 저장량도 같이 커진다. 청크 10만 개면 1536d가 약 614MB다.',
    '정규화하면 길이 차이가 사라져 cosine과 L2가 같은 판단을 내린다.',
  ];
  const review = [
    { q: '사내 문서를 L2 거리로 검색했더니 짧은 문단만 위로 올라온다. 먼저 의심할 것은?',
      o: ['임베딩 차원이 너무 작아 뜻을 다 담지 못했다', '벡터를 정규화하지 않아 길이 차이가 거리에 섞였다', '질문 문장이 짧아 키워드가 부족했다'], a: 1,
      why: 'L2는 방향이 같아도 길이가 다르면 멀다고 본다. 길이 1로 정규화하거나 cosine을 쓰면 뜻만으로 비교한다.' },
    { q: '청크 10만 개를 text-embedding-3-large(3072d)로 저장하려니 메모리가 부족하다. 모델을 바꾸지 않고 줄이는 방법은?',
      o: ['dimensions=512로 앞부분만 받아 저장한다', '벡터를 float64로 바꿔 정밀도를 높인다', '거리 계산을 L2로 바꿔 메모리를 아낀다'], a: 0,
      why: '3-large는 앞쪽 차원만 잘라 써도 뜻이 대부분 남도록 학습됐다. 512d면 저장량이 3072d의 1/6이 된다.' },
    { q: '"휴가 며칠?"을 검색했는데 "연차는 입사 1년 후 15일 부여" 문단이 1위로 나왔다. 키워드 검색과 무엇이 달랐나?',
      o: ['두 문장에 같은 단어가 많아서 찾았다', '문단이 가장 짧아서 길이 점수가 높았다', '질문과 문단을 같은 공간에 놓고 뜻이 가까운 것을 골랐다'], a: 2,
      why: '"휴가"와 "연차"는 글자가 달라 키워드로는 놓치기 쉽다. 임베딩은 뜻을 좌표로 바꾸므로 cosine top-k로 이 문단을 찾는다.' },
  ];

  R.page({ title: '임베딩 공간', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
