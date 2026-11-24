/* II-1-3 Embeddings — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 문장 → 임베딩 모델 → 숫자 띠(벡터). 띠 길이는 차원 수에 비례한다(1차원 = 0.27px).
 * 띠 칸의 색과 앞 4개 값은 예시다(API 키 없이 실제 벡터를 뽑지 않았다). 차원·가격·저장 용량·월 비용 계산은 코드와 같은 식으로 다시 셈했다.
 * MTEB 점수는 모델 공개 수치(3-small 62.3, 3-large 64.6, MiniLM 약 56, mpnet 약 58, 3-large 1024차원 64.1). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, hbar, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const TEXT = '인공지능은 미래를 바꾼다', PXD = 0.27;
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const v = (i, seed) => Math.sin(i * 12.9898 + seed * 78.233) * 0.5 + Math.sin(i * 3.7 + seed) * 0.5;   // 띠 칸 색용 예시 값
  // 벡터 띠: dims 에 비례한 길이, f 만큼 그려짐
  function strip(x, y, dims, o) { o = o || {}; const w = dims * PXD, h = o.h || 26, f = o.f ?? 1, n = Math.max(6, Math.round(w / 7)), cw = w / n;
    el('rect', { x, y, width: w, height: h, rx: 3, fill: PANEL, stroke: o.ghost ? GRID : INK, 'stroke-width': 1.4, 'stroke-dasharray': o.ghost ? '5 4' : null, opacity: o.op ?? 1 });
    if (!o.ghost) for (let i = 0; i < n * f; i++) { const a = v(i, o.seed || 1); el('rect', { x: x + i * cw + 0.5, y: y + 2, width: cw - 1, height: h - 4, fill: a < 0 ? BAD : ACC, opacity: (0.15 + 0.7 * Math.abs(a)) * (o.op ?? 1) }); }
    const L = o.label || `${dims}차원`, out = x + w + 14 + tw(L, 14.5) > 950;
    if (o.label !== false) mono(out ? x + w : x + w + 10, out ? y - 8 : y + h / 2 + 5, L, { 'font-size': 14.5, 'font-weight': 800, fill: o.col || INK, opacity: o.op ?? 1, 'text-anchor': out ? 'end' : 'start' }); return w; }
  function sentence(cx, cy, o) { o = o || {}; card(cx, cy, tw(TEXT, 15) + 34, 40, { rx: 20, stroke: INK, sw: 2, text: o.text || TEXT, fs: 15, s: o.s, op: o.op }); }
  function modelBox(cx, cy, name, sub2, col, o) { o = o || {}; const w = o.w || Math.max(tw(name, 15), tw(sub2 || '', 13.5)) + 36;
    const g = card(cx, cy, w, sub2 ? 60 : 44, { rx: 10, stroke: col, fill: o.fill || PANEL, sw: o.sw || 2.2, s: o.s, op: o.op });
    tx(0, sub2 ? -4 : 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g);
    if (sub2) tx(0, 17, sub2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return w; }
  function cloud(cx, cy, label, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: 'M-50,18 Q-70,18 -66,-2 Q-62,-24 -38,-18 Q-30,-40 -4,-36 Q22,-44 30,-20 Q58,-24 60,0 Q64,18 44,18 Z', fill: INFOBG, stroke: INFO, 'stroke-width': 2.4 }, g);
    if (label) tx(0, 4, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: INFO }, g); }
  function headVals(x, y, vals, op) { mono(x, y, '[' + vals.join(', ') + ', …]', { 'font-size': 14, fill: INK, opacity: op }); mono(x, y + 22, '앞 4개 값은 예시', { 'font-size': 13.5, fill: MUT, opacity: op }); }

  // ---------- 1. OpenAIEmbeddings ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { sentence(190, 150, { s: pop(u, 0.2) }); cloud(560, 150, 'OpenAI API', { s: pop(u, 0.7) });
      strip(80, 280, 1536, { ghost: true, op: fade(u, 1.2), label: '벡터 아직 없음', col: MUT });
      pill(560, 225, 'from langchain_openai import OpenAIEmbeddings', INFO, pop(u, 1.4), { mono: true, fs: 13.5 }); return; }
    if (k === 1) { modelBox(250, 110, 'text-embedding-3-small', '1536차원 · 기본 권장', ACC, { fill: ACCBG, sw: 3, s: pop(u, 0.2) });
      modelBox(690, 110, 'text-embedding-3-large', '3072차원', MUT, { op: fade(u, 0.6) });
      check(400, 82, 10, pop(u, 0.6));
      strip(80, 210, 1536, { f: E(u, 0.8, 1.8), seed: 1 }); strip(80, 270, 3072, { f: E(u, 1.0, 2.0), seed: 2, op: 0.45, label: false });
      mono(80 + 3072 * PXD - 4, 260, '3072', { 'font-size': 14, 'font-weight': 800, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      sub(480, 340, '3-large 는 차원이 2배라 저장·검색 비용도 2배', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 2) { sentence(170, 90); cloud(560, 90, 'embed_query');
      dot([[290, 90], [500, 90]], seg(u, 0.2, 0.9), ACC, 7);
      dot([[620, 110], [620, 170], [100, 170], [100, 205]], seg(u, 0.9, 1.6), INFO, 7);
      const n = Math.round(tween(0, 1536, u > 1.4 ? u - 1.3 : 0, 0.9));
      strip(80, 215, 1536, { f: E(u, 1.5, 2.4), seed: 1, label: `len = ${n}`, col: ACC });
      headVals(80, 290, ['0.0234', '-0.0156', '0.0421', '-0.0089'], fade(u, 2.1));
      sub(700, 300, '문장 하나 = 실수 1536개', fade(u, 2.3), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { ['문서1 내용', '문서2 내용', '문서3 내용'].forEach((s, i) => { const y = 80 + i * 70;
        card(120, y + 13, 140, 36, { rx: 18, stroke: INK, sw: 1.8, text: s, fs: 14, s: pop(u, 0.2 + i * 0.2) });
        grow(196, y + 13, 236, y + 13, E(u, 0.5 + i * 0.2, 0.8 + i * 0.2), ACC);
        strip(250, y, 1536, { f: E(u, 0.7 + i * 0.25, 1.5 + i * 0.25), seed: 3 + i, label: false }); });
      mono(480, 310, 'doc_vecs.shape = (3, 1536)', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      sub(480, 340, 'embed_documents 한 번에 여러 문서를', fade(u, 2.1), { 'font-size': 15 }); return; }
    // k4 비용·조건
    card(250, 130, 360, 120, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 0.2) });
    mono(250, 120, '$0.02 / 1M 토큰', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
    sub(250, 160, '100만 토큰에 약 27원', fade(u, 0.6), { 'font-size': 15 });
    card(700, 130, 360, 120, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 0.6) });
    mono(700, 120, '~50ms / query', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.7) });
    sub(700, 160, '네트워크 왕복 포함 (대략)', fade(u, 0.9), { 'font-size': 15 });
    [['인터넷 필수', BAD], ['API key 관리', WARN], ['rate limit', WARN], ['데이터가 밖으로 나간다', BAD]].forEach(([s, col], i) => pill(150 + i * 220, 290, s, col, pop(u, 1.3 + i * 0.2), { fs: 15 }));
    sub(480, 350, '싸고 무난하지만, 밖에 있는 서비스라는 조건이 붙는다', fade(u, 2.2), { 'font-size': 15 }); }

  // ---------- 2. HuggingFaceEmbeddings ----------
  function laptop(cx, cy, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1);
    el('rect', { x: -70, y: -50, width: 140, height: 90, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2.4 }, g);
    el('path', { d: 'M-90,40 H90 L80,56 H-80 Z', fill: SOFT, stroke: INK, 'stroke-width': 2.2 }, g);
    tx(0, 0, o.text || '내 서버', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }, g); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { laptop(250, 170, { s: pop(u, 0.2) });
      mono(250, 270, '$0', { 'font-size': 30, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(250, 300, 'API 요금 없음', fade(u, 1.0), { 'font-size': 15 });
      pill(650, 150, 'HuggingFaceEmbeddings', GOOD, pop(u, 1.2), { mono: true, fs: 15 }); sub(650, 190, 'sentence-transformers 모델을 직접 돌린다', fade(u, 1.5), { 'font-size': 14.5 }); return; }
    if (k === 1) { [['all-MiniLM-L6-v2', 384, '가장 가벼움 · 영어 위주'], ['all-mpnet-base-v2', 768, '균형 · 영어 상위권'], ['jhgan/ko-sroberta-multitask', 768, '한국어 특화']].forEach(([n, d, s], i) => { const y = 80 + i * 100;
        tx(60, y, n, { 'font-size': 15.5, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2 + i * 0.4) }); sub(60, y + 22, s, fade(u, 0.3 + i * 0.4), { 'text-anchor': 'start' });
        strip(440, y - 18, d, { f: E(u, 0.3 + i * 0.4, 1.0 + i * 0.4), seed: 5 + i, col: GOOD }); });
      return; }
    if (k === 2) { modelBox(240, 90, 'all-mpnet-base-v2', '768차원', GOOD, { fill: GOODBG, s: pop(u, 0.2) });
      const f = E(u, 0.4, 2.0); el('rect', { x: 520, y: 70, width: 360, height: 26, rx: 5, fill: SOFT, stroke: GRID }); el('rect', { x: 520, y: 70, width: 360 * f, height: 26, rx: 5, fill: GOOD });
      mono(700, 60, `~/.cache/huggingface  ${Math.round(420 * f)}MB / 420MB`, { 'font-size': 14, 'text-anchor': 'middle' });
      sub(700, 120, '첫 호출 때 한 번만 받는다', fade(u, 1.0));
      mono(120, 220, 'model_kwargs={"device": "cuda"}', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(120, 256, 'encode_kwargs={"normalize_embeddings": True}', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 320, 'GPU 에서 돌리고, 길이 1로 정규화해 코사인 비교를 쉽게', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3) { sentence(170, 90); laptop(500, 100, { text: 'mpnet' });
      el('line', { x1: 290, y1: 90, x2: 420, y2: 90, stroke: GRID, 'stroke-width': 2 }); dot([[290, 90], [420, 90]], seg(u, 0.2, 0.8), GOOD, 7);
      tx(700, 90, '네트워크 왕복 없음', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
      strip(80, 220, 1536, { ghost: true, label: '1536 (OpenAI)', col: MUT, op: fade(u, 0.9) });
      strip(80, 260, 768, { f: E(u, 1.0, 1.9), seed: 6, col: GOOD });
      headVals(80, 330, ['0.0876', '-0.0432', '0.0654', '-0.0234'], fade(u, 2.0));
      sub(700, 340, 'embed_query 이름과 쓰는 법은 똑같다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k4 무료의 조건
    const ax = R.axes(160, 90, 420, 120, { x: [0, 160], xt: [0, 50, 100, 150], xl: 'mpnet 한 문장 (ms, 대략)' });
    hbar(160, 110, ax.X(30) - 160, 30, 30, { h: 26, u: E(u, 0.2, 0.8), col: GOOD, text: 'GPU 30ms' });
    hbar(160, 160, ax.X(150) - 160, 150, 150, { h: 26, u: E(u, 0.5, 1.1), col: WARN, text: 'CPU 150ms' });
    [['$0 · 로컬', GOOD], ['사내망·의료·금융', GOOD], ['배포 이미지 +500MB~2GB', WARN], ['GPU 없으면 느림', WARN]].forEach(([s, col], i) => pill(170 + (i % 2) * 400, 290 + Math.floor(i / 2) * 50, s, col, pop(u, 1.2 + i * 0.2), { fs: 15 })); }

  // ---------- 3. CohereEmbeddings ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { pill(260, 140, 'CohereEmbeddings', WARN, pop(u, 0.2), { mono: true, fs: 16 }); cloud(620, 140, 'Cohere API', { s: pop(u, 0.6) });
      mono(620, 230, 'COHERE_API_KEY', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.2) });
      sub(620, 256, 'OpenAI 키와 별도로 발급', fade(u, 1.4), { 'font-size': 14.5 }); return; }
    if (k === 1) { [['embed-english-v3.0', 1024, '영어 전용'], ['embed-multilingual-v3.0', 1024, '100+ 언어'], ['embed-multilingual-light', 384, '경량 · 빠름']].forEach(([n, d, s], i) => { const y = 80 + i * 100;
        tx(60, y, n, { 'font-size': 15.5, 'font-weight': 800, class: 'mono', fill: i === 1 ? WARN : INK, opacity: fade(u, 0.2 + i * 0.4) }); sub(60, y + 22, s, fade(u, 0.3 + i * 0.4), { 'text-anchor': 'start' });
        strip(440, y - 18, d, { f: E(u, 0.3 + i * 0.4, 1.0 + i * 0.4), seed: 9 + i, col: WARN }); });
      return; }
    if (k === 2) { modelBox(480, 90, 'embed-multilingual-v3.0', '1024차원', WARN, { fill: WARNBG, s: pop(u, 0.2) });
      card(250, 230, 300, 90, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.6) });
      tx(250, 220, '검색 질문', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.7) }); mono(250, 246, 'search_query', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) });
      card(710, 230, 300, 90, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.0) });
      tx(710, 220, '저장할 문서', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.1) }); mono(710, 246, 'search_document', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) });
      grow(420, 120, 300, 185, E(u, 0.6, 1.0), INFO); grow(540, 120, 660, 185, E(u, 1.0, 1.4), GOOD);
      sub(480, 330, 'input_type 으로 질문과 문서를 다르게 임베딩한다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 3) { sentence(170, 90); cloud(560, 90, 'Cohere');
      dot([[290, 90], [500, 90]], seg(u, 0.2, 0.9), WARN, 7);
      strip(80, 200, 1536, { ghost: true, label: '1536 (OpenAI)', col: MUT, op: fade(u, 0.8) });
      strip(80, 240, 1024, { f: E(u, 1.0, 1.9), seed: 10, col: WARN });
      headVals(80, 310, ['0.0345', '-0.0289', '0.0512', '-0.0167'], fade(u, 2.0));
      sub(720, 320, '1024 / 1536 = 저장 용량 2/3', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4 가격
    const ax = R.axes(260, 90, 520, 130, { x: [0, 0.12], xt: [0, 0.02, 0.06, 0.1], xl: '$ / 1M 토큰' });
    hbar(260, 110, ax.X(0.02) - 260, 0.02, 0.02, { h: 30, u: E(u, 0.2, 0.8), col: ACC, text: '$0.02' }); tx(250, 131, 'OpenAI 3-small', { 'font-size': 14.5, 'text-anchor': 'end', 'font-weight': 700 });
    hbar(260, 170, ax.X(0.10) - 260, 0.1, 0.1, { h: 30, u: E(u, 0.6, 1.4), col: WARN, text: '$0.10' }); tx(250, 191, 'Cohere multi', { 'font-size': 14.5, 'text-anchor': 'end', 'font-weight': 700 });
    tx(480, 300, '5배 비싸다', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
    sub(480, 332, '한·영·일·중이 섞인 검색이 아니면 OpenAI 가 낫다', fade(u, 2.0), { 'font-size': 15 }); }

  // ---------- 4. 차원 비교 ----------
  const DIMS = [[384, 'MiniLM', GOOD], [768, 'mpnet', GOOD], [1024, 'Cohere', WARN], [1536, '3-small', ACC], [3072, '3-large', ACC]];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 56, '1억 문서 × 차원 × 4바이트 (float32)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      DIMS.forEach(([d, n, col], i) => { const y = 84 + i * 58, gb = d * 4e8 / 1e9;
        mono(150, y + 18, `${d}d`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
        hbar(170, y, 620, gb, 1228.8, { h: 26, u: E(u, 0.2 + i * 0.3, 0.9 + i * 0.3), col, text: gb >= 1000 ? `${Math.round(gb)} GB (1.23 TB)` : `${Math.round(gb)} GB` }); });
      return; }
    if (k === 1) { const ax = R.axes(140, 70, 640, 250, { x: [0, 3400], y: [54, 66], xt: [384, 768, 1536, 3072], yt: [56, 60, 64], xl: '차원', yl: 'MTEB 영어 평균', grid: true });
      const P = [[384, 56.3, 'MiniLM', GOOD], [768, 57.8, 'mpnet', GOOD], [1536, 62.3, '3-small', ACC], [3072, 64.6, '3-large', ACC]];
      P.forEach(([d, s, n, col], i) => { const sc = pop(u, 0.3 + i * 0.35); el('circle', { cx: ax.X(d), cy: ax.Y(s), r: 8 * clamp(sc), fill: col });
        mono(ax.X(d) + (i === 3 ? -12 : 12), ax.Y(s) - 10, `${n} ${s}`, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': i === 3 ? 'end' : 'start', opacity: fade(u, 0.4 + i * 0.35) }); });
      R.line(ax, P.map(([d, s]) => [d, s]), E(u, 1.6, 2.3), MUT, { dash: '5 5', sw: 1.6 });
      sub(480, 400, '점수는 차원보다 모델이 정한다 · 커질수록 오르는 폭은 줄어든다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { sentence(480, 90, { s: pop(u, 0.2) });
      [['langchain_huggingface', GOOD], ['langchain_cohere', WARN], ['langchain_openai', ACC]].forEach(([s, col], i) => pill(200 + i * 280, 200, s, col, pop(u, 0.6 + i * 0.3), { mono: true, fs: 14.5 }));
      sub(480, 280, '같은 문장을 다섯 모델에 똑같이 넣어 본다', fade(u, 1.8), { 'font-size': 15.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3 || k === 4) { mono(60, 60, 'models = {', { 'font-size': 15, fill: MUT });
      DIMS.forEach(([d, n, col], i) => { const show = i < 3 || k === 4; if (!show) return; const y = 100 + i * 52, s = (k === 3 || i >= 3) ? pop(u, 0.2 + (i % 3) * 0.3) : 1;
        card(250, y, 280, 40, { rx: 8, stroke: col, sw: 2, s, text: `"${['minilm', 'mpnet', 'cohere', 'oai_s', 'oai_l'][i]}": ${n}`, fs: 14.5, mono: true, color: col }); });
      mono(60, 100 + (k === 4 ? 5 : 3) * 52, '}', { 'font-size': 15, fill: MUT });
      tx(700, 200, k === 4 ? '5개 모델이 모였다' : '로컬 2개 + Cohere 1개', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.2) }); return; }
    if (k === 5) { DIMS.forEach(([d, n, col], i) => { const y = 64 + i * 64;
        mono(36, y + 18, `${['minilm', 'mpnet', 'cohere', 'oai_s', 'oai_l'][i]}`, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.3) });
        strip(100, y, d, { f: E(u, 0.3 + i * 0.3, 0.9 + i * 0.3), seed: 20 + i, label: `dim=${d}`, col }); });
      return; }
    // k6 sweet spot
    const ax = R.axes(100, 150, 760, 40, { x: [0, 3200], xt: [384, 768, 1536, 3072], xl: '차원' });
    el('rect', { x: ax.X(768), y: 120, width: (ax.X(1536) - ax.X(768)) * E(u, 0.2, 1.0), height: 70, fill: GOOD, opacity: 0.3 });
    tx(ax.X(1152), 108, '768~1536d', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) });
    tx(ax.X(384), 110, '초대형 인덱스', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) });
    tx(ax.X(3072) - 20, 110, '최고 정확도', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) });
    const sh = E(u, 1.4, 2.4); strip(100, 290, lerp(3072, 1024, sh), { seed: 2, label: `dimensions=${Math.round(lerp(3072, 1024, sh))}`, col: ACC });
    sub(480, 360, '3-large 는 dimensions 로 줄여도 MTEB 64.6 → 64.1', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ---------- 5. 선택과 비용 ----------
  function q(cx, cy, s, sc) { card(cx, cy, tw(s, 15) + 36, 46, { rx: 23, stroke: INK, sw: 2.2, fill: SOFT, text: s, fs: 15, s: sc }); }
  function leaf(cx, cy, s, col, sc, star) { card(cx, cy, tw(s, 14.5) + 30, 42, { rx: 8, stroke: col, sw: star ? 3 : 2, fill: star ? ACCBG : PANEL, text: s, fs: 14.5, color: col, mono: true, s: sc }); }
  function tree(k, u) { const a = (kk, t0) => (k > kk ? 1 : k === kk ? pop(u, t0) : 0);
    q(260, 60, '데이터를 밖으로 보낼 수 있나?', a(0, 0.2)); leaf(680, 60, 'HF mpnet / ko-sroberta', GOOD, a(0, 0.9));
    if (k >= 0) { grow(420, 60, 560, 60, k > 0 ? 1 : E(u, 0.6, 1.0), GOOD); tx(490, 50, 'NO', { 'font-size': 13.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: k > 0 ? 1 : fade(u, 0.8) }); }
    if (k >= 1) { grow(260, 84, 260, 126, k > 1 ? 1 : E(u, 0.1, 0.4), MUT); tx(276, 110, 'YES', { 'font-size': 13.5, 'font-weight': 800, fill: MUT });
      q(260, 150, '다국어(한·영·일·중)가 핵심인가?', a(1, 0.3)); grow(430, 150, 560, 150, k > 1 ? 1 : E(u, 0.8, 1.2), WARN); leaf(690, 150, 'Cohere multilingual-v3', WARN, a(1, 1.1)); }
    if (k >= 2) { grow(260, 174, 260, 216, k > 2 ? 1 : E(u, 0.1, 0.4), MUT); tx(276, 200, 'NO', { 'font-size': 13.5, 'font-weight': 800, fill: MUT });
      q(260, 240, '정확도 0.1점이 매출·생명에 직결?', a(2, 0.3)); grow(440, 240, 560, 240, k > 2 ? 1 : E(u, 0.8, 1.2), ACC); leaf(680, 240, '3-large (3072d)', ACC, a(2, 1.0));
      grow(260, 264, 260, 306, k > 2 ? 1 : E(u, 1.3, 1.6), ACC); leaf(260, 330, '3-small (1536d) ★ 기본', ACC, a(2, 1.6), true); } }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { tree(k, u); return; }
    if (k === 3) { tx(60, 60, '가정: 문서 200토큰 · 질문 30토큰', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const ax = R.axes(200, 100, 600, 150, { x: [0, 6.5], xt: [0, 3, 6.3], xl: '월 토큰 (십억)' });
      hbar(200, 120, ax.X(6.0) - 200, 6, 6, { h: 34, u: E(u, 0.2, 1.0), col: ACC, text: '60억' }); tx(190, 143, '인덱싱', { 'font-size': 15, 'text-anchor': 'end', 'font-weight': 700 });
      sub(500, 175, '30일 × 100만 문서 × 200토큰', fade(u, 0.8), { class: 'mono' });
      hbar(200, 195, Math.max(4, ax.X(0.3) - 200), 0.3, 0.3, { h: 34, u: E(u, 1.0, 1.4), col: INFO, text: '3억' }); tx(190, 218, '검색', { 'font-size': 15, 'text-anchor': 'end', 'font-weight': 700 });
      mono(480, 320, 'monthly_total = 63억 토큰', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
      sub(480, 350, '1000만 검색 × 30토큰 = 3억', fade(u, 2.1), { class: 'mono' }); return; }
    const P = [['openai_small', 0.02, ACC], ['openai_large', 0.13, ACC], ['cohere_multi', 0.10, WARN], ['hf_mpnet', 0, GOOD]];
    if (k === 4) { P.forEach(([n, p, col], i) => { const y = 80 + i * 66;
        card(330, y + 10, 400, 50, { rx: 8, stroke: col, sw: 2, s: pop(u, 0.2 + i * 0.3) });
        mono(150, y + 16, n, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); mono(510, y + 16, p ? `$${p.toFixed(2)} / 1M` : '$0 (로컬)', { 'font-size': 15.5, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.3) }); });
      tx(720, 290, 'GPU 서버 비용은 따로', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 5) { const ax = R.axes(220, 70, 560, 250, { x: [0, 900], xt: [0, 300, 600, 900], xl: '$ / 월 (63억 토큰)' });
      P.forEach(([n, p, col], i) => { const y = 84 + i * 58, cost = 6300 * p;
        mono(210, y + 20, n, { 'font-size': 14.5, 'text-anchor': 'end', 'font-weight': 700 });
        hbar(220, y, 560, cost, 900, { h: 30, u: E(u, 0.2 + i * 0.3, 0.9 + i * 0.3), col, text: p ? `$${Math.round(cost)}` : '$0 + GPU' }); });
      sub(480, 400, '6300M 토큰 × 단가 — 같은 일에 월 수백 달러 차이', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k6 결론
    banner(480, 90, '기본값은 OpenAI text-embedding-3-small', pop(u, 0.2));
    [['사내망 필수', 'HF 로컬', GOOD], ['다국어 핵심', 'Cohere multi', WARN], ['정확도 최우선', '3-large', ACC]].forEach(([a, b, col], i) => { const x = 180 + i * 300, s = pop(u, 0.8 + i * 0.3);
      card(x, 210, 250, 80, { rx: 10, stroke: col, sw: 2, s }); tx(x, 202, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.9 + i * 0.3) });
      mono(x, 228, b, { 'text-anchor': 'middle', 'font-size': 14.5, fill: col, opacity: fade(u, 0.9 + i * 0.3) }); });
    sub(480, 310, '특수한 요구가 있을 때만 다른 모델로 바꾼다', fade(u, 1.9), { 'font-size': 15.5, fill: INK, 'font-weight': 700 });
    mono(480, 350, 'OpenAIEmbeddings(model="text-embedding-3-large", dimensions=1024)', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'text-embedding-3-small 대신 3-large를 쓰면 벡터 저장 공간은 어떻게 되나?',
      o: ['그대로다', '약 2배가 된다', '절반으로 줄어든다'], a: 1,
      why: '3-small은 1536차원, 3-large는 3072차원이다. 저장 공간은 차원에 비례하므로 2배가 된다.' },
    { q: 'HuggingFaceEmbeddings로 all-mpnet-base-v2를 쓸 때 드는 비용으로 맞는 것은?',
      o: ['API 요금은 없고, 첫 호출에 약 420MB 모델을 받고 GPU나 CPU에서 직접 돌린다', '토큰당 $0.02를 낸다', '인터넷이 계속 연결돼 있어야 한다'], a: 0,
      why: '모델이 내 서버에서 돌아 API 요금은 0원이다. 대신 모델 다운로드와 추론 자원은 직접 챙긴다.' },
    { q: 'Cohere embed-multilingual-v3.0이 OpenAI 3-small보다 나은 선택이 되는 경우는?',
      o: ['영어 문서만 싸게 임베딩할 때', '인터넷 없는 사내망에서 돌릴 때', '한·영·일·중이 섞인 문서를 한 검색에서 다룰 때'], a: 2,
      why: 'Cohere 다국어 모델은 100개 넘는 언어를 한 벡터 공간에 둔다. 가격은 $0.10/1M로 5배라 다국어가 핵심일 때 쓴다.' },
    { q: '1억 문서를 1536차원 float32로 저장하면 대략 얼마나 드나?',
      o: ['약 154GB', '약 614GB', '약 1.23TB'], a: 1,
      why: '1억 × 1536 × 4바이트 = 614.4GB다. 384차원이면 154GB, 3072차원이면 1.23TB다.' },
    { q: '고객 데이터를 외부 API로 보낼 수 없는 회사가 고를 임베딩은?',
      o: ['HuggingFace 로컬 모델 (mpnet, ko-sroberta)', 'OpenAI 3-small', 'Cohere multilingual'], a: 0,
      why: '결정 트리의 첫 질문이 데이터를 밖으로 보낼 수 있느냐다. 못 보내면 로컬에서 도는 HuggingFace 모델만 남는다.' },
  ];

  const summary = [
    '임베딩은 문장을 실수 배열로 바꾸고, 모델마다 차원이 384에서 3072까지 다르다.',
    '저장 공간은 차원에 비례해 1억 문서면 384차원 154GB, 3072차원 1.23TB가 든다.',
    '정확도는 차원보다 모델이 정한다. MTEB 영어 평균은 3-small 62.3, 3-large 64.6이다.',
    '외부 전송이 안 되면 HuggingFace, 다국어면 Cohere, 그 밖에는 3-small이 기본이다.',
  ];
  const review = [
    { q: '병원 상담 기록으로 RAG를 만드는데 보안팀이 외부 전송을 막았다. 월 토큰도 많다. 가장 알맞은 조합은?',
      o: ['Cohere multilingual + 클라우드 벡터 DB', 'HuggingFace 로컬 모델 + GPU 서버', 'OpenAI 3-large + dimensions=1024'], a: 1,
      why: '외부 전송이 막히면 API 모델은 쓸 수 없다. 로컬 모델은 API 요금이 0원이라 토큰이 많아도 GPU 비용만 든다.' },
    { q: '3-large(3072d)로 1억 문서를 저장하려니 1.23TB가 필요하다. 정확도를 크게 잃지 않고 줄이는 방법은?',
      o: ['dimensions=1024로 줄여 받는다', 'chunk_overlap을 늘린다', 'MiniLM(384d)으로 바꾼다'], a: 0,
      why: '3-large는 dimensions로 차원을 줄일 수 있고 1024차원에서도 MTEB가 64.6에서 64.1로 조금만 내려간다. 저장은 1/3이 된다.' },
    { q: '한국어와 일본어 문서를 섞어 검색해야 하는 글로벌 챗봇에서 OpenAI 3-small 대비 Cohere를 고를 때 따져 볼 비용은?',
      o: ['차원이 1536에서 3072로 늘어난다', '로컬 GPU가 필요해진다', '토큰 단가가 $0.02에서 $0.10으로 5배가 된다'], a: 2,
      why: 'Cohere 다국어 모델은 $0.10/1M 토큰이다. 63억 토큰이면 월 $126 대신 $630이라 다국어 이점이 그 차이를 넘어야 한다.' },
  ];

  R.page({ title: '문장 → 숫자 띠(벡터)', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
