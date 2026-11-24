/* III-1-2 Embedding 모델 비교 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 모델 차원·MTEB·가격·응답 시간은 페이지의 MODELS 를 읽는다. 응답 시간은 환경마다 다른 예시값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, check, cross, hbar, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const M = (key) => (typeof MODELS === 'undefined' ? null : MODELS.find((m) => m.key === key));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const KEYS = ['openai', 'bge', 'e5', 'cohere'], KCOL = { openai: INFO, bge: GOOD, e5: ACC, cohere: WARN }, SHORT = { openai: 'OpenAI 3-small', bge: 'BGE-large', e5: 'E5-mistral-7b', cohere: 'Cohere v3' };

  // 위쪽 후보 줄: 지금 모델만 진하게
  function chips(active, u0) { KEYS.forEach((k, i) => { const on = k === active; pill(140 + i * 225, 30, SHORT[k], on ? KCOL[k] : GRID, on ? 1 : 0.92, { fs: 14, color: on ? KCOL[k] : MUT, fill: on ? PANEL : SOFT, op: on ? 1 : 0.8 }); }); }
  // 회사 경계선: x 왼쪽이 회사 안
  function wall(x, o) { o = o || {}; el('line', { x1: x, y1: 64, x2: x, y2: 404, stroke: o.col || MUT, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' });
    tx(x - 12, 84, '회사 안', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' }); tx(x + 12, 84, '회사 밖', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  // 벡터 길이 막대: 4096차원 = 640px, 128차원마다 눈금
  const VW = 640 / 4096;
  function vecBar(x, y, dims, u, col, o) { o = o || {}; const w = dims * VW * clamp(u);
    el('rect', { x, y, width: Math.max(1, w), height: 22, rx: 4, fill: col, opacity: o.op ?? 0.9 });
    for (let d = 128; d < dims * clamp(u); d += 128) el('line', { x1: x + d * VW, y1: y, x2: x + d * VW, y2: y + 22, stroke: PANEL, 'stroke-width': 1, opacity: 0.6 });
    if (u >= 1 && o.label !== false) mono(x + w + 10, y + 16, (o.text || dims + 'd'), { 'font-size': 15, 'font-weight': 800, fill: col }); }
  // 지표 카드 세 장
  function stats(key, u0, y) { const m = M(key); if (!m) return; y = y || 330;  // 카드 3장: x 25~505
    [['MTEB', String(m.mteb), INK], ['100만 토큰당', m.costPerM ? '$' + m.costPerM.toFixed(2) : '$0', m.costPerM ? INK : GOOD], ['응답 (예시)', m.speed + 'ms', INK]].forEach(([n, v, col], i) => {
      const cx = 100 + i * 165, s = pop(u0, 0.2 + i * 0.25); card(cx, y, 150, 70, { rx: 10, stroke: GRID, sw: 1.5, s });
      tx(cx - 62, y - 10, n, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: s }); mono(cx - 62, y + 22, v, { 'font-size': 23, 'font-weight': 800, fill: col, opacity: s }); }); }

  // ---------- 1. OpenAI ----------
  function s1(t, c) { const { k, u } = c, m = M('openai'); if (!m) return; chips(k === 0 ? (u > 0.8 ? 'openai' : null) : 'openai');
    wall(520, { col: k === 4 ? BAD : MUT });
    server(170, 170, '내 서버', {});
    card(760, 170, 210, 80, { rx: 14, stroke: INFO, fill: INFOBG, text: 'OpenAI API\ntext-embedding-3-small', fs: 14.5, s: k === 0 ? pop(u, 0.9) : 1 });
    if (k === 0) { pill(170, 280, 'OPENAI_API_KEY', INFO, pop(u, 1.4), { mono: true, fs: 14 }); grow(240, 170, 650, 170, E(u, 1.7, 2.4), INFO);
      note(40, 370, '모델 이름 한 줄과 API 키면 준비가 끝난다', fade(u, 2.2)); return; }
    if (k === 1) { const s = '연차 휴가 정책을 알려주세요';
      dot([[230, 150], [655, 150]], seg(u, 0.2, 1.0), ACC, 7); if (u > 0.2 && u < 1.0) card(lerp(260, 600, E(u, 0.2, 1.0)), 120, 230, 30, { rx: 15, fill: ACC, stroke: 'none', text: s, fs: 13.5, color: PANEL });
      dot([[655, 195], [230, 195]], seg(u, 1.1, 1.7), INFO, 7); if (u >= 1.0) pill(380, 228, s, ACC, 1, { fs: 13.5 });
      tx(40, 270, 'vector', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.6) }); vecBar(110, 255, 1536, E(u, 1.7, 2.5), INFO);
      sub(110 + 320, 310, '눈금 하나 = 128차원', fade(u, 2.4)); return; }
    if (k === 2) { ['1년 이상 근속 시 연차 15일 부여', '급여는 매월 25일에 지급된다', '재택근무는 주 2회까지 가능'].forEach((d, i) => {
        card(170, 262 + i * 42, 300, 34, { rx: 8, text: d, fs: 13.5, s: pop(u, 0.1 + i * 0.15) }); });
      const g = E(u, 0.8, 1.7); card(lerp(330, 600, g), 140, 120, 46, { rx: 8, stroke: INFO, fill: PANEL, text: '문서 3건\n한 번에', fs: 13.5, op: u > 0.8 && u < 1.75 ? 1 : 0 });
      [0, 1, 2].forEach((i) => vecBar(570, 262 + i * 42 - 11, 1536, E(u, 1.8 + i * 0.15, 2.4 + i * 0.15), INFO, { text: '1536d' }));
      note(570, 230, 'embed_documents = 호출 1번', fade(u, 1.9), { fill: INFO }); return; }
    if (k === 3) { const cut = E(u, 0.6, 1.6);
      tx(40, 280, '기본', { 'font-size': 15, 'font-weight': 700 }); vecBar(140, 265, 1536, 1, OFF);
      tx(40, 340, 'dimensions=512', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: INFO, opacity: fade(u, 0.3) });
      vecBar(180, 325, 1536 - 1024 * cut, 1, INFO, { label: cut >= 1, text: '512d' });
      if (cut > 0 && cut < 1) el('rect', { x: 180 + (1536 - 1024 * cut) * VW, y: 325, width: 1024 * cut * VW, height: 22, rx: 4, fill: OFF, opacity: 0.35 * (1 - cut) });
      note(560, 380, '저장 · 검색 비용 1/3', fade(u, 1.8), { fill: INFO }); return; }
    stats('openai', u, 300);
    const lk = E(u, 1.0, 1.8); dot([[230, 150], [655, 150]], ((t * 0.5) % 1), BAD, 6);
    card(760, 270, 220, 60, { rx: 10, stroke: BAD, fill: BADBG, text: '질문 · 문서 원문이\nOpenAI 서버로 간다', fs: 14, s: pop(u, 1.2) });
    note(40, 400, '무난한 첫 선택. 보안 검토가 먼저 필요하다', fade(u, 2.0), { opacity: lk }); }

  // ---------- 2. BGE ----------
  function gpu(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op);
    el('rect', { x: -80, y: -42, width: 160, height: 84, rx: 8, fill: PANEL, stroke: o.col || GOOD, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < 6; i++) el('rect', { x: -66 + i * 22, y: -28, width: 16, height: 40, rx: 2, fill: o.col || GOOD, opacity: o.load != null ? (i < o.load * 6 ? 0.8 : 0.15) : 0.3 }, g);
    [-56, -28, 0, 28, 56].forEach((x) => el('line', { x1: x, y1: 42, x2: x, y2: 52, stroke: o.col || GOOD, 'stroke-width': 3 }, g));
    if (name) tx(0, 74, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }, g); }
  function s2(t, c) { const { k, u } = c, m = M('bge'); if (!m) return; chips('bge'); wall(640);
    server(120, 170, '내 서버', {});
    gpu(380, 170, 'GPU (cuda)', { s: k === 0 ? pop(u, 0.2) : 1, load: k === 2 ? E(u, 0.3, 1.2) : k === 0 ? E(u, 0.5, 1.5) : 0.3 });
    if (k === 0) { pill(380, 270, 'BAAI/bge-large-en-v1.5', GOOD, pop(u, 1.0), { mono: true, fs: 14 });
      pill(380, 316, 'normalize_embeddings=True', GOOD, pop(u, 1.5), { mono: true, fs: 13.5 });
      note(60, 380, '벡터 길이를 1로 맞춰 cosine 검색에 쓴다', fade(u, 2.1)); return; }
    grow(180, 170, 296, 170, 1, MUT);
    if (k === 1) { dot([[180, 155], [300, 155]], seg(u, 0.2, 0.9), ACC, 7); pill(240, 120, '"annual leave policy"', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      const n = 0; card(800, 170, 200, 76, { rx: 12, stroke: GOOD, sw: 2.5, s: pop(u, 1.0) }); tx(720, 160, '외부 API 호출', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      mono(720, 192, n + '회', { 'font-size': 24, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.1) });
      vecBar(60, 290, 1024, E(u, 1.2, 2.0), GOOD); note(60, 360, '모든 계산이 회사 안 GPU에서 끝난다', fade(u, 2.2)); return; }
    if (k === 2) { [0, 1].forEach((i) => { card(120, 280 + i * 46, 210, 36, { rx: 8, text: ['Employees get 15 days…', 'Salary is paid on the 25th'][i], fs: 13.5, s: pop(u, 0.1 + i * 0.2) });
        vecBar(300, 269 + i * 46, 1024, E(u, 1.2 + i * 0.25, 1.9 + i * 0.25), GOOD); });
      card(800, 170, 200, 76, { rx: 12, stroke: GOOD, sw: 2.5, s: pop(u, 1.4) }); tx(720, 160, '임베딩 비용', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      mono(720, 192, '$0', { 'font-size': 24, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); sub(800, 232, '대신 GPU 운영비', fade(u, 2.0)); return; }
    if (k === 3) { card(120, 300, 210, 46, { rx: 8, stroke: GOOD, text: 'HuggingFaceBgeEmbeddings', fs: 13.5, mono: true, s: pop(u, 0.2) });
      card(120, 360, 210, 46, { rx: 8, stroke: INFO, text: 'SentenceTransformer', fs: 13.5, mono: true, s: pop(u, 0.7) });
      grow(226, 300, 320, 220, E(u, 0.4, 1.0), GOOD); grow(226, 360, 340, 225, E(u, 0.9, 1.5), INFO);
      note(360, 330, 'LangChain을 거치든 직접 부르든', fade(u, 1.5)); note(360, 358, '같은 가중치, 같은 벡터', fade(u, 1.8), { fill: GOOD }); return; }
    // k4: OpenAI 와 점수 비교
    const o = M('openai'); [['BGE-large', m.mteb, GOOD], ['OpenAI 3-small', o.mteb, INFO]].forEach(([n, v, col], i) => { const y = 280 + i * 44;
      tx(40, y + 16, n, { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 200, y, width: 300, height: 24, rx: 4, fill: SOFT });
      el('rect', { x: 200, y, width: 300 * (v - 55) / 15 * E(u, 0.2 + i * 0.2, 1.0 + i * 0.2), height: 24, rx: 4, fill: col }); mono(510, y + 17, 'MTEB ' + v, { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 1.0 + i * 0.2) }); });
    sub(350, 384, '막대는 55점부터', fade(u, 1.2));
    note(700, 290, 'VRAM 약 4GB', fade(u, 1.5)); note(700, 318, '응답 80ms (예시)', fade(u, 1.7)); note(700, 360, '한국어는 BGE-M3', fade(u, 2.1), { fill: WARN }); }

  // ---------- 3. E5-mistral ----------
  function s3(t, c) { const { k, u } = c, m = M('e5'); if (!m) return; chips('e5');
    if (k === 0) { gpu(200, 190, 'GPU', { col: ACC, load: E(u, 0.3, 1.8) });
      tx(380, 140, 'Mistral 7B 기반 임베딩', { 'font-size': 17, 'font-weight': 800 });
      mono(380, 180, '70억 파라미터 × 2바이트(fp16)', { 'font-size': 15, opacity: fade(u, 0.6) });
      mono(380, 212, '≈ 14GB  →  VRAM 16GB+', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      el('rect', { x: 380, y: 250, width: 480, height: 26, rx: 5, fill: SOFT, stroke: GRID }); el('rect', { x: 380, y: 250, width: 420 * E(u, 1.2, 2.2), height: 26, rx: 5, fill: ACC });
      tx(864, 296, '16GB', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', class: 'mono' });
      note(380, 340, 'float32로 올리면 두 배가 필요하다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 1) { const parts = [['Instruct: ', MUT], ['Given a web search query, retrieve relevant passages', INK], ['\\n', MUT], ['Query: ', MUT], ['연차 휴가 정책', ACC]];
      tx(40, 100, '쿼리 앞에 할 일(task)을 붙인다', { 'font-size': 17, 'font-weight': 800 });
      [[0, 1, 150], [3, 4, 230]].forEach(([a, b, y], r) => { const op = fade(u, 0.3 + r * 0.8);
        R.spans(60, y, [[parts[a][0], { fill: parts[a][1], 'font-weight': 800 }], [parts[b][0], { fill: parts[b][1], 'font-weight': 700 }]], { 'font-size': 15, opacity: op }); });
      card(200, 330, 260, 52, { rx: 10, stroke: GRID, text: '문서: 접두어 없이 본문 그대로', fs: 14.5, s: pop(u, 1.8) });
      note(400, 335, '쿼리만 지시문을 단다 (모델 카드 규칙)', fade(u, 2.1), { fill: ACC }); return; }
    if (k === 2) { tx(40, 100, '쿼리 벡터 길이', { 'font-size': 17, 'font-weight': 800 });
      [['E5-mistral', 4096, ACC], ['OpenAI 3-small', 1536, INFO], ['BGE · Cohere', 1024, GOOD]].forEach(([n, d, col], i) => { const y = 140 + i * 60;
        tx(40, y + 16, n, { 'font-size': 15, 'font-weight': 700 }); vecBar(200, y, d, E(u, 0.3 + i * 0.3, 1.3 + i * 0.3), col); });
      note(200, 360, '4종 중 가장 길다. 벡터 1개 = 4096 × 4B = 16KB', fade(u, 2.0)); return; }
    if (k === 3) { tx(40, 100, '같은 뜻, 세 언어', { 'font-size': 17, 'font-weight': 800 });
      [['KO', '1년 근속 시 15일 연차 부여', false], ['EN', 'Annual leave is 15 days after 1 year', true], ['JA', '1年勤務で年休15日付与', false]].forEach(([lang, s, ok], i) => { const y = 150 + i * 62, op = fade(u, 0.2 + i * 0.3);
        pill(70, y, lang, ok ? GOOD : WARN, pop(u, 0.2 + i * 0.3), { fs: 14 }); tx(110, y + 5, s, { 'font-size': 15, opacity: op });
        if (ok) check(480, y, 10, pop(u, 1.2)); else tx(480, y + 6, '?', { 'font-size': 20, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); });
      card(730, 200, 300, 120, { rx: 12, stroke: WARN, fill: WARNBG, s: pop(u, 1.6) });
      tx(600, 178, '모델 카드 권고', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.7) }); tx(600, 206, '주로 영어로 학습 → 영어 전용 권장', { 'font-size': 14, opacity: fade(u, 1.8) });
      tx(600, 234, '다국어는 multilingual-e5-large', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      note(40, 380, '다국어 점수는 직접 재 보고 쓴다', fade(u, 2.3), { fill: MUT }); return; }
    // k4: MTEB 1위, 응답 시간
    tx(40, 90, 'MTEB', { 'font-size': 16, 'font-weight': 800 }); tx(500, 90, '응답 시간 (예시)', { 'font-size': 16, 'font-weight': 800 });
    KEYS.forEach((key, i) => { const mm = M(key), y = 120 + i * 58, on = key === 'e5', col = on ? ACC : OFF;
      tx(40, y + 16, SHORT[key], { 'font-size': 14, 'font-weight': on ? 800 : 600 });
      el('rect', { x: 190, y, width: 220 * (mm.mteb - 60) / 8 * E(u, 0.2, 1.0), height: 22, rx: 4, fill: col }); mono(196 + 220 * (mm.mteb - 60) / 8, y + 16, String(mm.mteb), { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.0) });
      el('rect', { x: 500, y, width: 300 * mm.speed / 240 * E(u, 1.0, 1.8), height: 22, rx: 4, fill: on ? BAD : OFF }); mono(508 + 300 * mm.speed / 240, y + 16, mm.speed + 'ms', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) }); });
    sub(300, 368, 'MTEB 막대는 60점부터', fade(u, 1.0)); note(500, 380, '정확도 1위의 값: A10/A100급 GPU', fade(u, 2.1), { fill: BAD }); }

  // ---------- 4. Cohere ----------
  function s4(t, c) { const { k, u } = c, m = M('cohere'); if (!m) return; chips('cohere');
    card(260, 120, 270, 54, { rx: 10, stroke: WARN, fill: WARNBG, text: 'embed-multilingual-v3.0', fs: 15, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    const doorQ = [150, 210], doorD = [370, 210];
    [[doorQ, 'search_query', 0.7], [doorD, 'search_document', 1.1]].forEach(([[x, y], n, d]) => { const s = k === 0 ? pop(u, d) : 1; card(x, y, 190, 40, { rx: 8, stroke: WARN, text: n, fs: 14, mono: true, s }); });
    if (k === 0) { note(40, 300, '같은 모델에 문이 두 개', fade(u, 1.6)); note(40, 328, '짧은 질문용과 긴 문서용을 따로 학습했다', fade(u, 1.9), { fill: MUT }); return; }
    // 오른쪽 공간
    zone(520, 70, 410, 300, '검색 공간 (그림용)', { fill: SOFT });
    const qp = [640, 210], dps = [[700, 180], [720, 250], [850, 320], [580, 320]];
    if (k >= 1) { const g = k === 1 ? E(u, 0.3, 1.3) : 1; if (k <= 2) pill(150, 260, '"연차 휴가 며칠 받을 수 있어?"', ACC, k === 1 ? pop(u, 0.1) : 1, { fs: 13.5 });
      dot([doorQ, [doorQ[0], 330], [qp[0], 330], qp], k === 1 ? seg(u, 0.4, 1.4) : 0, ACC, 6);
      el('circle', { cx: qp[0], cy: qp[1], r: 9, fill: ACC, opacity: g }); tx(qp[0] - 14, qp[1] - 14, '질문', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: g, 'text-anchor': 'end' }); }
    if (k === 1) { note(40, 390, '질문은 search_query 문으로 들어간다', fade(u, 1.8)); return; }
    if (k >= 2) { dps.forEach(([x, y], i) => { const s = k === 2 ? E(u, 0.4 + i * 0.2, 0.9 + i * 0.2) : 1; el('rect', { x: x - 8, y: y - 8, width: 16, height: 16, rx: 3, fill: i < 2 ? GOOD : OFF, opacity: s }); });
      tx(728, 176, '15일 부여', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: k === 2 ? fade(u, 1.4) : 1 }); tx(748, 256, '5년 이상 20일', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: k === 2 ? fade(u, 1.6) : 1 });
      if (k === 2) { dot([doorD, [doorD[0], 300], [700, 300], [700, 188]], seg(u, 0.2, 1.0), GOOD, 6);
        grow(qp[0], qp[1], 692, 182, E(u, 1.8, 2.3), GOOD, { plain: true, dash: '5 4' }); grow(qp[0], qp[1], 712, 246, E(u, 1.9, 2.4), GOOD, { plain: true, dash: '5 4' });
        note(40, 300, '문서는 search_document 문으로', fade(u, 0.5)); note(40, 330, '짧은 질문과 긴 문서가 잘 만난다', fade(u, 2.1), { fill: GOOD }); return; } }
    if (k === 3) {       tx(40, 270, 'float32 한 칸 = 4바이트', { 'font-size': 15, 'font-weight': 700 });
      const sh = E(u, 0.6, 1.6); for (let i = 0; i < 4; i++) el('rect', { x: 40 + i * 50 * (1 - sh * 0.75), y: 285, width: 46 * (1 - sh * 0.75) + (i === 0 ? 0 : 0), height: 40, rx: 4, fill: i === 0 ? WARN : OFF, opacity: i === 0 ? 1 : 1 - sh });
      tx(40, 360, 'int8 한 칸 = 1바이트', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      mono(260, 312, '1024 × 4B = 4KB  →  1KB', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) });
      note(260, 392, '저장 4배 절감 · 검색 품질 손실 약 1%', fade(u, 2.1), { fill: WARN }); return; }
        const o = M('openai'); tx(40, 270, '100만 토큰당 가격', { 'font-size': 15, 'font-weight': 700 });
    [['Cohere v3', m.costPerM, WARN], ['OpenAI 3-small', o.costPerM, INFO]].forEach(([n, v, col], i) => { const y = 290 + i * 40;
      tx(40, y + 16, n, { 'font-size': 14, 'font-weight': 700 }); el('rect', { x: 170, y, width: 300 * v / 0.1 * E(u, 0.3 + i * 0.2, 1.1 + i * 0.2) + 2, height: 22, rx: 4, fill: col });
      mono(178 + 300 * v / 0.1 * E(u, 0.3 + i * 0.2, 1.1 + i * 0.2), y + 16, '$' + v.toFixed(2), { 'font-size': 14, 'font-weight': 800, opacity: fade(u, 1.2) }); });
    note(40, 400, '5배 비싸다 · MTEB ' + m.mteb + ' · 한국어 질문 ↔ 영어 문서', fade(u, 1.8)); }

  // ---------- 5. 비교 정리 ----------
  const SC = (ax, key) => { const m = M(key); return [ax.X(m.speed), ax.Y(m.mteb)]; };
  function scatterAll(hi, u0) { const ax = R.axes(110, 70, 440, 280, { x: [0, 260], y: [61, 68], xt: [0, 100, 200], yt: [62, 64, 66, 68], xl: '응답 ms (예시)', yl: 'MTEB', grid: true });
    KEYS.forEach((key) => { const [x, y] = SC(ax, key), on = hi.includes(key), col = KCOL[key];
      el('circle', { cx: x, cy: y, r: on ? 11 : 8, fill: on ? col : PANEL, stroke: col, 'stroke-width': 2.5 });
      const self = M(key).hosting === 'Self'; if (self) el('rect', { x: x - 16, y: y - 16, width: 32, height: 32, rx: 6, fill: 'none', stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' });
      tx(x + (key === 'e5' ? -22 : 22), y + (key === 'cohere' ? 22 : -10), SHORT[key], { 'font-size': 14, 'font-weight': on ? 800 : 600, fill: on ? col : MUT, 'text-anchor': key === 'e5' ? 'end' : 'start' }); });
    sub(330, 398, '점선 네모 = 셀프호스팅 (GPU 필요)', 1); return ax; }
  function treeBox(x, y, s, col, sc) { return card(x, y, tw(s, 14) + 26, 40, { rx: 8, stroke: col || INK, text: s, fs: 14, s: sc }); }
  function s5(t, c) { const { k, u } = c; if (!M('e5')) return;
    if (k === 0) { tx(40, 70, 'MTEB 평균 (56개 과제)', { 'font-size': 17, 'font-weight': 800 });
      const order = ['e5', 'bge', 'cohere', 'openai'];
      order.forEach((key, i) => { const m = M(key), y = 110 + i * 64, w = 560 * (m.mteb - 60) / 8 * E(u, 0.2 + i * 0.25, 1.0 + i * 0.25);
        tx(40, y + 20, (i + 1) + '. ' + SHORT[key], { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: 240, y, width: 560, height: 30, rx: 5, fill: SOFT }); el('rect', { x: 240, y, width: Math.max(2, w), height: 30, rx: 5, fill: KCOL[key] });
        mono(250 + w, y + 21, String(m.mteb), { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0 + i * 0.25) }); });
      sub(520, 390, '막대는 60점부터 · 1위와 4위 차이 4.3점', fade(u, 2.0)); return; }
    if (k === 1 || k === 2) { const hi = k === 1 ? ['openai', 'e5'] : ['bge', 'cohere']; scatterAll(hi);
      const rows = k === 1 ? [['빨리 시작', 'OpenAI 3-small', INFO, 'API 키만 있으면 5분'], ['최고 정확도', 'E5-mistral-7b', ACC, 'GPU 16GB + 240ms']] : [['외부 전송 불가', 'BGE-large / BGE-M3', GOOD, '금융 · 의료 · 법률'], ['다국어 + 질문/문서 분리', 'Cohere v3', WARN, 'search_query / document']];
      rows.forEach(([a, b, col, d], i) => { const y = 130 + i * 120, s = pop(u, 0.4 + i * 0.6);
        card(760, y, 330, 96, { rx: 12, stroke: col, sw: 2.2, s }); tx(610, y - 20, a, { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: s });
        tx(610, y + 6, b, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: s }); tx(610, y + 32, d, { 'font-size': 14, opacity: s }); });
      return; }
    if (k === 3 || k === 4) { const q1 = treeBox(170, 90, '① 외부 전송 가능?', INK, k === 3 ? pop(u, 0.1) : 1);
      grow(170, 112, 170, 190, k === 3 ? E(u, 0.4, 0.8) : 1, BAD); tx(180, 160, 'NO', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: k === 3 ? fade(u, 0.7) : 1 });
      treeBox(170, 214, '셀프호스팅 BGE / E5', GOOD, k === 3 ? pop(u, 0.8) : 1);
      grow(278, 90, 470, 90, k === 3 ? E(u, 1.0, 1.4) : 1, GOOD); tx(350, 80, 'YES', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: k === 3 ? fade(u, 1.3) : 1 });
      treeBox(570, 90, '② 다국어 필요?', INK, k === 3 ? pop(u, 1.4) : 1);
      grow(570, 112, 570, 190, k === 3 ? E(u, 1.7, 2.1) : 1, MUT); tx(580, 160, 'YES', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: k === 3 ? fade(u, 2.0) : 1 });
      treeBox(570, 214, 'Cohere v3 · multilingual-e5', WARN, k === 3 ? pop(u, 2.1) : 1);
      grow(662, 90, 760, 90, k === 3 ? E(u, 2.1, 2.4) : 1, MUT); tx(690, 80, 'NO', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: k === 3 ? fade(u, 2.3) : 1 });
      treeBox(850, 90, 'OpenAI small', INFO, k === 3 ? pop(u, 2.4) : 1);
      if (k === 3) return;
      treeBox(300, 320, '③ GPU 인프라가 있나?', INK, pop(u, 0.2));
      grow(210, 320, 120, 320, E(u, 0.6, 1.0), GOOD); treeBox(80, 370, 'BGE / E5', GOOD, pop(u, 1.0)); tx(140, 310, '있다', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
      grow(390, 320, 520, 320, E(u, 1.2, 1.6), INFO); treeBox(610, 320, 'OpenAI / Cohere API', INFO, pop(u, 1.6)); tx(430, 310, '없다', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.5) });
      note(300, 400, 'GPU가 있으면 임베딩 비용이 0이 된다', fade(u, 2.1), { fill: MUT }); return; }
    // k5: 모델을 바꾸면 전량 재임베딩
    zone(40, 70, 380, 300, 'OpenAI 1536d로 만든 DB', { fill: SOFT }); zone(520, 70, 400, 300, 'BGE 1024d로 바꾼 질문', { fill: SOFT });
    for (let i = 0; i < 6; i++) { const y = 110 + i * 40, done = E(u, 1.2 + i * 0.15, 1.6 + i * 0.15);
      el('rect', { x: 60, y, width: 340, height: 26, rx: 4, fill: done > 0 ? GOOD : INFO, opacity: 0.25 + 0.6 * (done > 0 ? done : 1) });
      mono(70, y + 18, done >= 1 ? 'chunk ' + (i + 1) + ' · 1024d' : 'chunk ' + (i + 1) + ' · 1536d', { 'font-size': 13.5, 'font-weight': 700 }); }
    vecBar(540, 140, 1024, 1, GOOD, { text: '1024d 질문' });
    cross(720, 220, 14, pop(u, 0.3)); tx(720, 262, '1536d DB와 비교 불가', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    tx(720, 300, '→ 모든 청크를 다시 임베딩', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
    note(40, 400, 'PoC는 OpenAI small, 운영 전환 때 BGE/E5로 옮기는 계획을 미리 세운다', fade(u, 2.2)); }

  const quiz = [
    { q: 'text-embedding-3-small을 쓸 때 보안 검토가 먼저 필요한 까닭은 무엇인가?',
      o: ['벡터 차원이 1536으로 너무 커서', '질문과 문서 원문이 OpenAI 서버로 전송되어서', 'MTEB 점수가 4종 중 가장 낮아서'], a: 1,
      why: 'API 임베딩은 원문을 회사 밖으로 보내야 계산된다. 가격($0.02/1M)과 점수(62.3)는 무난해도 데이터 반출은 따로 따져야 한다.' },
    { q: 'BGE-large-en-v1.5를 로컬 GPU에 올렸을 때 얻는 것은 무엇인가?',
      o: ['외부 API 호출 0회, 임베딩 비용 $0', '한국어 성능이 가장 좋아진다', '벡터가 4096차원으로 커진다'], a: 0,
      why: '모든 계산이 회사 안 GPU에서 끝나 데이터가 나가지 않는다. 대신 GPU 운영 부담이 생기고, 영어 중심이라 한국어는 BGE-M3를 권한다.' },
    { q: 'E5-mistral-7b-instruct로 검색할 때 쿼리에 붙여야 하는 것은 무엇인가?',
      o: ['"passage: " 접두어', '"Instruct: {task}\\nQuery: " 지시문', '아무것도 붙이지 않는다'], a: 1,
      why: '이 모델은 쿼리 앞에 할 일을 적은 지시문을 붙이도록 학습됐다. 문서는 접두어 없이 본문 그대로 넣는다.' },
    { q: 'Cohere embed-multilingual-v3가 질문과 문서를 다른 input_type으로 넣게 한 이유는 무엇인가?',
      o: ['짧은 질문과 긴 문서가 잘 만나도록 따로 학습해서', '문서를 int8로 압축하려고', '질문만 무료로 처리하려고'], a: 0,
      why: 'search_query와 search_document를 나눠 학습한 비대칭 모델이다. 그래서 짧은 질문이 긴 문서 쪽으로 잘 찾아간다.' },
    { q: '운영 중에 임베딩 모델을 OpenAI에서 BGE로 바꾸면 반드시 해야 하는 일은 무엇인가?',
      o: ['질문만 새 모델로 임베딩한다', 'Vector DB의 metric만 바꾼다', '저장된 모든 청크를 새 모델로 다시 임베딩한다'], a: 2,
      why: '모델마다 공간과 차원이 다르다. 1536d로 만든 DB에 1024d 질문을 비교할 수 없으므로 전량 재임베딩이 필요하다.' },
  ];

  const summary = [
    '임베딩 모델은 점수만으로 고르지 않고 비용, 속도, 데이터 반출, 언어를 같이 본다.',
    'OpenAI small은 바로 쓸 수 있지만 원문이 회사 밖으로 나간다.',
    'BGE와 E5는 회사 안 GPU에서 돌아 비용이 0이지만 GPU를 직접 운영해야 한다.',
    '모델을 바꾸면 모든 청크를 다시 임베딩하므로 처음 고를 때 운영 계획까지 세운다.',
  ];
  const review = [
    { q: '병원 진료 기록으로 RAG를 만든다. GPU 서버가 한 대 있다. 먼저 고를 모델은?',
      o: ['OpenAI text-embedding-3-small', 'BGE 계열을 회사 안 GPU에서 돌린다', 'Cohere embed-multilingual-v3'], a: 1,
      why: '진료 기록은 외부 전송이 어렵다. 셀프호스팅 BGE는 외부 호출 0회로 임베딩하고, GPU가 있으니 비용도 0이다.' },
    { q: 'E5-mistral로 바꿨더니 정확도는 올랐는데 응답이 240ms로 느려지고 GPU 비용이 늘었다. 이 결과에서 배울 점은?',
      o: ['MTEB 1위가 늘 가장 좋은 선택은 아니다', 'E5는 쿼리 지시문을 빼면 빨라진다', 'GPU를 쓰면 무조건 느려진다'], a: 0,
      why: '66.6점은 4종 중 가장 높지만 7B 모델이라 VRAM 16GB 이상과 느린 응답을 대가로 낸다. 정확도와 비용을 같이 저울질한다.' },
    { q: '한국어 질문으로 영어 매뉴얼을 찾아야 하고 GPU가 없다. 체크리스트대로라면 어디로 가는가?',
      o: ['BGE-large-en-v1.5', 'OpenAI small', 'Cohere embed-multilingual-v3'], a: 2,
      why: '외부 전송이 가능하고 다국어가 필요하며 GPU가 없으니 API 쪽 다국어 모델이 맞다. Cohere v3는 한국어 질문과 영어 문서를 같은 공간에서 잇는다.' },
  ];

  R.page({ title: '임베딩 모델 고르기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
