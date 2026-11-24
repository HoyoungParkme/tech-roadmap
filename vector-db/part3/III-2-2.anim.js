/* III-2-2 Chroma 와 프레임워크 통합 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 손으로 잇는 4단 파이프(문자열 → 임베딩 API → add 의 네 배열 → query) · Document 봉투와 from_documents 상자 ·
 *       Retriever 손잡이 · LlamaIndex 층 쌓기 · embedding 소켓에 꽂히는 세 모델과 차원 막대 · 차원 불일치.
 * 숫자: 직접 호출 줄 수는 코드 블록에서 빈 줄·주석·독스트링을 뺀 실제 줄 수(18 → 13, STEPS 의 directLines/abstractLines).
 *   1536/1024/384 차원과 가격은 페이지의 모델 표. 차원 불일치 에러 문구는 chromadb 1.5.9 에서 실제로 낸 것이다.
 *   벡터 막대 모양과 RAG 답변은 그림용(예시)이다 — OpenAI·Cohere API 는 이 장에서 호출하지 않았다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, dbIcon, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 ----------
  function cloud(cx, cy, s, label, col) { if (s <= 0.02) return; const g = R.G(cx, cy, s);
    el('path', { d: 'M-60,22 Q-82,22 -78,2 Q-76,-20 -50,-18 Q-42,-44 -10,-40 Q16,-58 38,-34 Q70,-36 68,-8 Q90,2 72,22 Z', fill: PANEL, stroke: col || INFO, 'stroke-width': 2.4 }, g);
    tx(0, 6, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col || INFO }, g); }
  // 차원 막대: 길이가 차원 수에 비례 (1536 → w)
  function dimBar(x, y, dim, f, col, o) { o = o || {}; const w = (o.w || 300) * dim / 1536 * clamp(f);
    el('rect', { x, y, width: (o.w || 300) * dim / 1536, height: 16, rx: 3, fill: SOFT, stroke: GRID });
    for (let i = 0; i < w; i += 6) el('rect', { x: x + i, y, width: 4, height: 16, fill: col || ACC, opacity: 0.35 + 0.5 * Math.abs(Math.sin(i * 0.37 + dim)) });
    if (o.label !== false) mono(x + (o.w || 300) * dim / 1536 + 10, y + 13, dim + '-d', { 'font-size': 14, 'font-weight': 800, fill: col || ACC, opacity: clamp(f * 2 - 1) }); }
  // 손으로 쓴 줄 수 계기
  function meter(c, o) { o = o || {}; const b = c.beat, p = c.prev || {};
    const d = b.directLines != null ? tween(p.directLines, b.directLines, c.u) : null, a = b.abstractLines != null ? tween(p.abstractLines, b.abstractLines, c.u) : null;
    const x = 640, y = o.y || 330;
    tx(x, y, '사람이 쓴 코드 줄 (빈 줄·주석 제외)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    if (d != null) { tx(x, y + 28, '직접 호출', { 'font-size': 14, 'font-weight': 700 }); R.hbar(x + 80, y + 15, 160, d, 18, { col: BAD, text: Math.round(d) + '줄' }); }
    if (a != null) { tx(x, y + 58, 'LangChain', { 'font-size': 14, 'font-weight': 700, fill: GOOD }); R.hbar(x + 80, y + 45, 160, a, 18, { col: GOOD, text: Math.round(a) + '줄' }); } }

  // ---------- 1. 직접 호출 ----------
  const ST = [[90, '문자열 docs'], [250, 'OpenAI API'], [410, 'col.add'], [560, 'col.query']];
  function pipe(k, act) { ST.forEach(([x, n], i) => { const on = act > i, col = on ? (i === 1 ? INFO : ACC) : GRID;
      el('circle', { cx: x, cy: 46, r: 9, fill: on ? col : PANEL, stroke: col, 'stroke-width': 2 }); tx(x, 74, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? INK : OFF });
      if (i) el('line', { x1: ST[i - 1][0] + 12, y1: 46, x2: x - 12, y2: 46, stroke: act > i ? MUT : GRID, 'stroke-width': 2 }); }); }
  const DOC2 = ['AI 기초 가이드', 'ML 실전 튜토리얼'];
  function s1(t, c) { const { k, u } = c;
    pipe(k, [0, 0, 1, 2, 3, 4][k]); meter(c);
    if (k <= 1) { // 서로 다른 두 라이브러리
      card(170, 220, 220, 120, { rx: 12, stroke: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.3) : 1 }); mono(170, 200, 'import chromadb', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.5) : 1 });
      tx(170, 228, '벡터 저장 · 검색', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.6) : 1 });
      cloud(450, 220, k === 0 ? pop(u, 0.8) : 1, 'openai'); tx(450, 290, '임베딩 생성', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.0) : 1 });
      if (k === 0) sub(310, 360, '저장과 임베딩이 다른 라이브러리로 갈라져 있다', fade(u, 1.6), { 'font-weight': 700, fill: INK });
      if (k === 1) { ['chroma', 'col', 'oai'].forEach((n, i) => pill([120, 220, 450][i], 330, n, i < 2 ? ACC : INFO, pop(u, 0.3 + i * 0.4), { mono: true, fs: 15 }));
        mono(120, 386, 'PersistentClient(path="./chroma_direct")', { 'font-size': 13.5, opacity: fade(u, 1.6) }); } return; }
    if (k === 2) { DOC2.forEach((d, i) => card(130, 150 + i * 56, 200, 42, { rx: 6, stroke: ACC, text: '"' + d + '"', fs: 14.5, s: pop(u, 0.3 + i * 0.3) }));
      card(400, 178, 220, 98, { rx: 10, stroke: BAD, dash: '6 5', text: '메타데이터 자리\n없음', fs: 15, color: BAD, s: pop(u, 1.2) });
      sub(270, 290, 'docs는 문자열 리스트일 뿐이다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { cloud(330, 170, 1, 'embeddings.create'); DOC2.forEach((d, i) => { fly(90, 130 + i * 50, 300, 170, seg(u, 0.2 + i * 0.3, 1.0 + i * 0.3), d, { fill: ACC });
        mono(60, 270 + i * 34, 'v' + (i + 1), { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4 + i * 0.2) }); dimBar(90, 257 + i * 34, 1536, E(u, 1.4 + i * 0.2, 2.2 + i * 0.2), INFO, { w: 420 }); });
      pill(330, 106, 'model="text-embedding-3-small"', WARN, pop(u, 1.0), { mono: true, fs: 13.5 }); sub(500, 106, '코드에 박힘', fade(u, 1.4), { fill: WARN, 'font-weight': 700, 'text-anchor': 'start' }); return; }
    if (k === 4) { const cols = [['ids', '"d1"', '"d2"'], ['documents', '"AI 기초…"', '"ML 실전…"'], ['embeddings', '[1536]', '[1536]'], ['metadatas', '{AI}', '{ML}']];
      [0, 1].forEach((i) => { el('rect', { x: 30, y: 128 + i * 50, width: 560 * E(u, 1.4 + i * 0.3, 2.0 + i * 0.3), height: 44, rx: 8, fill: WARNBG }); mono(18, 156 + i * 50, String(i), { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4 + i * 0.3) }); });
      cols.forEach(([h, a, b], j) => { const x = 40 + j * 140, s = pop(u, 0.2 + j * 0.3); mono(x, 120, h, { 'font-size': 14.5, 'font-weight': 800, fill: [INFO, ACC, INFO, WARN][j], opacity: s });
        [a, b].forEach((v, i) => card(x + 60, 150 + i * 50, 124, 38, { rx: 6, stroke: GRID, text: v, fs: 13.5, mono: true, s })); });
      sub(310, 270, '네 배열의 길이와 순서를 사람이 맞춘다', fade(u, 2.0), { 'font-weight': 700, fill: BAD }); return; }
    // k5: 질의도 손으로
    cloud(200, 170, 1, 'embeddings.create'); card(60, 120, 100, 40, { rx: 6, stroke: WARN, text: '"딥러닝 입문"', fs: 13.5, s: pop(u, 0.2) });
    dot([[110, 120], [150, 160]], seg(u, 0.4, 0.9), WARN, 6);
    dimBar(60, 240, 1536, E(u, 0.9, 1.5), WARN, { w: 240, label: false }); mono(60, 280, 'q_vec', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0) });
    dbIcon(470, 200, null, { s: 0.8 }); dot([[310, 248], [430, 210]], seg(u, 1.4, 2.0), WARN, 6);
    pill(470, 280, 'top-2', ACC, pop(u, 2.0), { mono: true, fs: 14 });
    sub(300, 320, '문서와 같은 모델인지는 사람이 챙긴다', fade(u, 2.2), { 'font-weight': 700, fill: BAD }); }

  // ---------- 2. LangChain ----------
  function envelope(cx, cy, s, text, meta) { if (s <= 0.02) return; const g = R.G(cx, cy, s);
    el('rect', { x: -110, y: -34, width: 220, height: 68, rx: 8, fill: PANEL, stroke: GOOD, 'stroke-width': 2.2 }, g);
    tx(-98, -12, 'Document', { 'font-size': 13.5, 'font-weight': 800, fill: GOOD }, g);
    tx(-98, 10, text, { 'font-size': 14, 'font-weight': 700 }, g); mono(-98, 28, meta, { 'font-size': 13.5, fill: WARN }, g); }
  function s2(t, c) { const { k, u } = c; meter(c);
    if (k === 0) { ['Chroma', 'OpenAIEmbeddings', 'Document'].forEach((n, i) => { const s = pop(u, 0.3 + i * 0.35); card(110 + i * 200, 170, 180, 56, { rx: 10, stroke: GOOD, fill: GOODBG, text: n, fs: 15, mono: true, color: GOOD, s }); });
      el('rect', { x: 10, y: 120, width: 610, height: 100, rx: 14, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
      tx(24, 112, 'LangChain 규약 하나 아래', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); return; }
    const envs = (o) => DOC2.forEach((d, i) => envelope(140, 120 + i * 84, o, d, `{"category": "${i ? 'ML' : 'AI'}"}`));
    if (k === 1) { envs(1 * pop(u, 0.3)); sub(140, 300, '본문과 메타가 한 객체에', fade(u, 1.4), { 'font-weight': 700, fill: INK }); return; }
    // from_documents 상자
    const bx = 470, by = 160, open = k === 2 ? fade(u, 1.0) : 1;
    envs(1); [0, 1].forEach((i) => dot([[250, 120 + i * 84], [bx - 120, by]], k === 2 ? seg(u, 0.3 + i * 0.3, 1.0 + i * 0.3) : 0, GOOD, 6));
    card(bx, by, 240, 150, { rx: 12, stroke: INK, sw: 2.6, fill: SOFT }); mono(bx, by - 52, 'Chroma.from_documents', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    ['embed_documents()', 'collection.add()'].forEach((s, i) => mono(bx, by - 12 + i * 30, s, { 'font-size': 14, fill: OFF, 'text-anchor': 'middle', opacity: open }));
    tx(bx, by + 60, '안에서 알아서 부른다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: open });
    if (k >= 3) { const s = k === 3 ? pop(u, 0.3) : 1; pill(bx - 40, by + 106, 'embedding=OpenAIEmbeddings()', INFO, s, { mono: true, fs: 13.5 });
      pill(bx - 40, by + 144, 'persist_directory="./chroma_langchain"', MUT, k === 3 ? pop(u, 0.8) : 1, { mono: true, fs: 13.5 });
      if (k === 3) sub(140, 330, '값만 바꾸면 다른 모델 · 다른 폴더', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 4) { fly(470, 20, bx, by - 70, seg(u, 0.2, 0.8), 'similarity_search("딥러닝 입문", k=2)', { fill: WARN, mono: true });
      [0, 1].forEach((i) => pill(800, 110 + i * 40, 'Document', GOOD, pop(u, 1.4 + i * 0.3), { fs: 14 })); sub(800, 200, '질의 임베딩도 안에서', fade(u, 2.0)); }
    if (k === 5) { ['resp = oai.embeddings.create(…)', 'vectors = [d.embedding …]', 'q_vec = oai.embeddings.create(', '    model=…, input=[…]', ').data[0].embedding'].forEach((s, i) => {
        mono(650, 70 + i * 28, s, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2 + i * 0.15) }); el('line', { x1: 646, y1: 65 + i * 28, x2: lerp(646, 900, E(u, 0.8 + i * 0.15, 1.2 + i * 0.15)), y2: 65 + i * 28, stroke: BAD, 'stroke-width': 2 }); });
      tx(650, 230, '사라진 임베딩 호출 5줄', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); } }

  // ---------- 3. Retriever ----------
  function knob(cx, cy, name, val, rot, s) { if (s <= 0.02) return; el('circle', { cx, cy, r: 26 * s, fill: PANEL, stroke: INK, 'stroke-width': 2.4 });
    el('line', { x1: cx, y1: cy, x2: cx + 20 * s * Math.cos(rot), y2: cy + 20 * s * Math.sin(rot), stroke: ACC, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    tx(cx, cy + 46, name, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); mono(cx, cy + 66, val, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: s }); }
  function retr(cx, cy, s) { if (s <= 0.02) return; const g = R.G(cx, cy, s);
    el('rect', { x: -110, y: -50, width: 220, height: 100, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.6 }, g);
    tx(0, -18, 'Retriever', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }, g); tx(0, 6, '질문 → Document 들', { 'font-size': 14, 'text-anchor': 'middle' }, g);
    tx(0, 30, '(안에 Chroma vectorstore)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g);
    el('circle', { cx: -110, cy: 0, r: 7, fill: ACC }, g); el('circle', { cx: 110, cy: 0, r: 7, fill: ACC }, g); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { dbIcon(200, 200, 'vectorstore', { s: pop(u, 0.3) }); card(620, 150, 220, 56, { rx: 10, stroke: INFO, text: 'RetrievalQA', fs: 15, mono: true, color: INFO, s: pop(u, 0.8) });
      card(620, 240, 220, 56, { rx: 10, stroke: INFO, text: 'ChatOpenAI', fs: 15, mono: true, color: INFO, s: pop(u, 1.1) });
      sub(620, 310, '검색 결과를 받아 답을 만드는 쪽', fade(u, 1.6)); sub(200, 310, '검색하는 쪽', fade(u, 1.0)); return; }
    retr(250, 200, k === 1 ? pop(u, 0.3) : 1);
    if (k === 1) { mono(250, 110, 'vectorstore.as_retriever(...)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); sub(620, 200, 'Chroma 전용 객체가 표준 부품이 된다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2 || k === 5) { const tw5 = k === 5 ? E(u, 0.3, 1.4) : 0;
      knob(180, 330, 'search_type', tw5 > 0.5 ? '"mmr"' : '"similarity"', -2.4 + 1.6 * tw5, k === 2 ? pop(u, 0.3) : 1);
      knob(330, 330, 'k', tw5 > 0.5 ? '10' : '4', -2.0 + 1.2 * tw5, k === 2 ? pop(u, 0.6) : 1);
      if (k === 5) knob(480, 330, 'score_threshold', '추가', -1.0, pop(u, 1.2));
      if (k === 2) sub(650, 200, '검색 동작을 바꾸는 손잡이는 여기뿐', fade(u, 1.4), { 'font-weight': 700, fill: INK });
      if (k === 5) { card(720, 200, 200, 90, { rx: 10, stroke: INFO, text: 'RetrievalQA\n체인 코드', fs: 15, color: INFO }); lock(800, 160, true, INFO, pop(u, 1.6)); sub(720, 280, '한 줄도 안 바뀐다', fade(u, 1.9), { 'font-weight': 700, fill: INK }); } return; }
    if (k === 3) { fly(30, 120, 140, 200, seg(u, 0.2, 0.8), '"딥러닝 입문"', { fill: WARN });
      DOC2.forEach((d, i) => card(560, 150 + i * 60, 220, 44, { rx: 8, stroke: GOOD, text: 'Document · ' + d, fs: 14, s: pop(u, 1.0 + i * 0.3) }));
      sub(560, 290, '저장된 문서가 2건이라 k=4 여도 2건', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    // k4: 체인에 끼운다
    const X = [100, 250, 450, 640, 820], f = E(u, 0.2, 2.2);
    fly(30, 120, 140, 200, seg(u, 0.1, 0.5), '질문', { fill: WARN });
    card(640, 200, 150, 70, { rx: 10, stroke: INFO, text: 'ChatOpenAI', fs: 15, mono: true, color: INFO, s: pop(u, 0.3) });
    dot([[360, 200], [565, 200]], seg(u, 0.7, 1.3), GOOD, 7); dot([[715, 200], [850, 200]], seg(u, 1.5, 2.0), INFO, 7);
    card(860, 270, 160, 44, { rx: 8, stroke: INFO, fill: INFOBG, text: 'answer (예시)', fs: 14, s: pop(u, 2.0) });
    el('rect', { x: 120, y: 120, width: 610, height: 170, rx: 14, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: fade(u, 0.5) });
    tx(134, 112, 'RetrievalQA(llm, retriever)', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, class: 'mono', opacity: fade(u, 0.6) }); }

  // ---------- 4. LlamaIndex ----------
  const LAY = [['chromadb.PersistentClient + collection', 'chromadb', MUT], ['ChromaVectorStore', '래퍼', INFO], ['StorageContext', '전달 통로', INFO], ['VectorStoreIndex', 'Document → 임베딩 → 저장', ACC], ['QueryEngine', '검색 + LLM 응답', GOOD]];
  function s4(t, c) { const { k, u } = c, upTo = [0, 1, 3, 4, 5, 5][k];
    LAY.forEach(([n, d, col], i) => { const y = 360 - i * 64, on = i < upTo, s = on ? ((k === 1 && i === 0) || (k === 2 && i > 0 && i < 3) || (k === 3 && i === 3) || (k === 4 && i === 4) ? pop(u, 0.3 + (i % 2) * 0.3) : 1) : 0;
      if (!on && k > 0) { el('rect', { x: 60, y: y - 26, width: 420, height: 52, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5' }); return; }
      if (k === 0) { el('rect', { x: 60, y: y - 26, width: 420, height: 52, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5', opacity: fade(u, 0.2 + i * 0.25) });
        tx(76, y + 6, n, { 'font-size': 14.5, fill: OFF, class: 'mono', opacity: fade(u, 0.3 + i * 0.25) }); return; }
      card(270, y, 420, 52, { rx: 8, stroke: col, sw: 2.2, s, fill: PANEL }); mono(76, y + 6, n, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: s });
      tx(470, y + 6, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); });
    if (k === 0) { sub(720, 200, '벡터스토어 위에 Index 층이 하나 더', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { dbIcon(620, 360, null, { s: 0.7 * pop(u, 0.6) }); mono(670, 366, './chroma_llama', { 'font-size': 14, opacity: fade(u, 0.9) }); sub(720, 300, '저장 위치와 이름은 내가 정한다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { sub(720, 260, '이 위로는 Chroma를 몰라도 된다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { DOC2.forEach((d, i) => { fly(700, 60 + i * 40, 300, 104, seg(u, 0.4 + i * 0.3, 1.3 + i * 0.3), d, { fill: ACC }); });
      dot([[300, 120], [300, 340]], seg(u, 1.5, 2.3), ACC, 7); sub(720, 300, '임베딩 호출 코드는 보이지 않는다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { fly(860, 40, 480, 104, seg(u, 0.2, 0.8), 'query("AI 기초를 설명해줘")', { fill: WARN });
      pill(720, 180, 'response.response (예시 답)', GOOD, pop(u, 1.4), { fs: 14 }); pill(720, 230, 'response.source_nodes', INFO, pop(u, 1.7), { mono: true, fs: 14 });
      mono(720, 290, 'similarity_top_k=4', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k5: 두 프레임워크 비교
    [['LangChain', ['Retriever', 'RetrievalQA 체인'], INFO], ['LlamaIndex', ['QueryEngine 하나'], GOOD]].forEach(([n, parts, col], j) => { const x = 590 + j * 190, s = pop(u, 0.3 + j * 0.6);
      tx(x + 80, 46, n, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
      parts.forEach((p, i) => card(x + 80, 96 + i * (parts.length > 1 ? 60 : 0) + (parts.length > 1 ? 0 : 30), 170, parts.length > 1 ? 48 : 108, { rx: 8, stroke: col, text: p, fs: 14.5, s })); });
    sub(750, 230, '같은 Chroma, 다른 조립법', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }

  // ---------- 5. 임베딩 교체 ----------
  const MODELS = [['OpenAI', 'text-embedding-3-small', 1536, '$0.02 / 1M', INFO], ['Cohere', 'embed-multilingual-v3.0', 1024, '다국어', WARN], ['HuggingFace', 'all-MiniLM-L6-v2', 384, '무료 · 로컬', GOOD]];
  function s5(t, c) { const { k, u } = c, pick = [-1, 0, 1, 2, 0, 0, 2, 2][k];
    MODELS.forEach(([n, m, d, cost, col], i) => { const y = 60 + i * 80, on = i === pick, seen = k >= i + 1 || k >= 4, s = seen ? (k === i + 1 ? pop(u, 0.2) : 1) : 0;
      if (s <= 0.02) { card(150, y, 260, 62, { rx: 10, stroke: GRID, dash: '6 5' }); return; }
      card(150, y, 260, 62, { rx: 10, stroke: on ? col : GRID, sw: on ? 2.8 : 1.6, s, fill: on ? PANEL : SOFT });
      tx(32, y - 6, n, { 'font-size': 15, 'font-weight': 800, fill: on ? col : MUT, opacity: s }); tx(268, y - 6, cost, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s });
      mono(32, y + 18, m, { 'font-size': 13.5, fill: on ? INK : MUT, opacity: s }); });
    // 소켓
    const sx = 440, sy = 60 + Math.max(0, pick) * 80;
    card(560, 150, 200, 60, { rx: 10, stroke: INK, sw: 2.4, fill: SOFT }); mono(560, 156, 'embedding = ?', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: pick < 0 ? MUT : INK });
    if (pick >= 0 && k !== 7) { const f = k <= 3 ? E(u, 0.2, 0.8) : 1; el('path', { d: `M282,${sy} C${sx - 60},${sy} ${sx - 40},150 ${lerp(282, 460, f)},150`, fill: 'none', stroke: MODELS[pick][4], 'stroke-width': 3 });
      dimBar(470, 200, MODELS[pick][2], k <= 3 ? E(u, 0.8, 1.6) : 1, MODELS[pick][4], { w: 330 }); }
    if (k === 0) { mono(560, 60, 'from langchain_community.vectorstores import Chroma', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); sub(560, 230, '임베딩은 골라 끼울 자리로 비워 둔다', fade(u, 1.2), { 'font-weight': 700, fill: INK }); }
    if (k >= 1 && k <= 3) sub(640, 260, ['', '호출당 과금', '다국어에 강하다', 'API 비용 0 · 내 컴퓨터에서'][k], fade(u, 1.6), { 'font-weight': 700, fill: INK });
    // 고정된 아래 코드
    if (k >= 4 && k <= 6) { el('rect', { x: 460, y: 250, width: 460, height: 150, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      ['vectorstore = Chroma.from_documents(', '    documents=docs,', '    embedding=embedding,', '    persist_directory="./chroma_swap")', 'retriever = vectorstore.as_retriever(…)'].forEach((s, i) => mono(476, 278 + i * 26, s, { 'font-size': 13.5, fill: i === 2 ? ACC : INK, 'font-weight': i === 2 ? 800 : 400 }));
      lock(895, 270, true, GOOD, k === 4 ? pop(u, 0.6) : 1); }
    if (k === 4) sub(690, 236, 'A·B·C 무엇이든 이 줄들은 같다', fade(u, 1.2), { 'font-weight': 700, fill: INK });
    if (k === 5) {
      card(140, 330, 240, 70, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 0.3) }); mono(140, 322, 'embed_documents()', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.5) });
      mono(140, 346, 'embed_query()', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.7) }); sub(140, 390, '세 구현체 모두 같은 두 메서드', fade(u, 1.4), { 'font-weight': 700, fill: INK }); }
    if (k === 6) { card(140, 340, 260, 70, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 0.3) }); mono(140, 334, 'Settings.embed_model =', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.5) });
      mono(140, 356, 'HuggingFaceEmbedding(…)', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.7) }); sub(140, 395, 'LlamaIndex는 전역 한 줄', fade(u, 1.4), { 'font-weight': 700, fill: INK }); }
    if (k === 7) { // 저장된 1536-d 와 새 384-d 질의
      tx(470, 230, '저장된 컬렉션 (OpenAI로 적재)', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
      for (let i = 0; i < 3; i++) dimBar(470, 244 + i * 22, 1536, 1, INFO, { w: 330, label: i === 0 });
      tx(470, 334, '새 질의 (HuggingFace)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) }); dimBar(470, 344, 384, E(u, 0.7, 1.2), GOOD, { w: 330 });
      cross(900, 300, 16, pop(u, 1.5));
      mono(20, 395, 'InvalidArgumentError: Collection expecting embedding with dimension of 1536, got 384', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.8) }); } }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: '직접 호출 코드에서 임베딩 모델이 문서용과 질의용으로 어긋나지 않게 막는 것은 무엇인가?',
      o: ['chromadb가 자동으로 확인한다', '아무 장치도 없다. 사람이 두 곳의 모델 이름을 맞춘다', 'OpenAI API가 에러를 낸다'], a: 1,
      why: '직접 호출은 embeddings.create를 문서용과 질의용으로 따로 부르고, 두 곳에 모델 이름을 각각 적는다. 맞추는 일은 코드를 쓴 사람 몫이다.' },
    { q: 'LangChain으로 바꾸자 18줄이 13줄이 되었다. 사라진 것은 주로 무엇인가?',
      o: ['import 문', 'persist_directory 설정', '임베딩 API를 직접 부르던 코드'], a: 2,
      why: 'from_documents와 similarity_search가 문서·질의 임베딩을 안에서 처리한다. resp·vectors·q_vec를 만들던 5줄이 통째로 빠졌다.' },
    { q: 'retriever의 k를 4에서 10으로 바꿀 때 RetrievalQA 체인 코드는 어떻게 되는가?',
      o: ['그대로 둔다. search_kwargs만 바꾼다', '체인도 k=10에 맞게 고친다', 'vectorstore를 다시 만든다'], a: 0,
      why: '검색 동작은 as_retriever의 search_type·search_kwargs 로만 정한다. 체인은 retriever를 받기만 해서 손댈 곳이 없다.' },
    { q: 'LlamaIndex에서 질문 한 번에 답과 근거 문서를 함께 돌려주는 것은 무엇인가?',
      o: ['ChromaVectorStore', 'StorageContext', 'index.as_query_engine()'], a: 2,
      why: 'QueryEngine이 검색과 LLM 응답을 묶는다. response.response에 답이, response.source_nodes에 검색된 문서가 담긴다.' },
    { q: 'OpenAI(1536차원)로 적재한 컬렉션을 그대로 두고 embedding만 HuggingFace(384차원)로 바꿔 질의하면 어떻게 되는가?',
      o: ['차원 불일치 에러가 난다', '자동으로 다시 임베딩된다', '정확도만 조금 떨어진다'], a: 0,
      why: '저장된 벡터는 옛 모델 것이다. Chroma는 "expecting embedding with dimension of 1536, got 384" 에러를 내므로 새 모델로 다시 적재해야 한다.' },
  ];

  const summary = [
    '직접 호출은 임베딩 API와 add, query를 손으로 이어서 18줄이 들고 모델 맞추기도 사람 몫이다.',
    'LangChain의 Document와 from_documents를 쓰면 임베딩 호출이 안으로 들어가 13줄로 준다.',
    'as_retriever는 검색 손잡이를 분리하고, LlamaIndex는 QueryEngine 하나로 검색과 답을 묶는다.',
    'embedding 인자만 바꾸면 모델이 바뀌지만, 저장된 벡터는 새 모델로 다시 적재해야 한다.',
  ];
  const review = [
    { q: '한국어 검색이 약해 OpenAI 임베딩을 Cohere 다국어 모델로 바꿨더니 기존 컬렉션 검색이 에러를 낸다. 먼저 할 일은 무엇인가?',
      o: ['retriever의 k를 늘린다', '새 모델로 문서를 다시 임베딩해 새 컬렉션에 적재한다', '체인 코드를 Cohere 용으로 다시 쓴다'], a: 1,
      why: '1536차원으로 쌓인 컬렉션에 1024차원 질의가 들어가 차원이 맞지 않는다. 코드는 그대로 두고 데이터만 새 모델로 다시 만든다.' },
    { q: 'RAG 답이 엉뚱해서 원인을 좁히려 한다. 체인을 건드리지 않고 검색만 확인하는 방법은 무엇인가?',
      o: ['retriever.invoke(질문)으로 돌아온 Document를 본다', 'ChatOpenAI의 temperature를 0으로 바꾼다', 'persist_directory를 지운다'], a: 0,
      why: 'Retriever는 체인과 떨어진 부품이라 혼자 불러 볼 수 있다. 검색 결과가 맞는지 먼저 보면 문제가 검색인지 생성인지 갈린다.' },
    { q: '팀이 같은 Chroma 데이터로 LangChain 서비스와 LlamaIndex 실험을 함께 한다. 맞는 설명은 무엇인가?',
      o: ['두 프레임워크는 서로 다른 DB 형식을 써서 공유할 수 없다', 'LlamaIndex는 Chroma를 쓰려면 LangChain이 필요하다', '같은 Chroma 컬렉션 위에 조립법만 다른 래퍼를 얹는다'], a: 2,
      why: 'LangChain은 Chroma vectorstore로, LlamaIndex는 ChromaVectorStore로 같은 컬렉션을 감싼다. 임베딩 모델만 같으면 같은 데이터를 쓴다.' },
  ];

  R.page({ title: 'Chroma 위에 프레임워크 얹기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
