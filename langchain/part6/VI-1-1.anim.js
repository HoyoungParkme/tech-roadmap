/* VI-1-1 RAG 챗봇 (문서 Q&A) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자 출처: 42쪽·128청크·500/50·1536차원은 페이지 시나리오 값, 유사도 점수와 벡터 값·LLM 답변은 예시.
 * 단계별 값의 모양(dict → ChatPromptValue → AIMessage → str), 출처 문자열 "p.4, p.9, p.21",
 * retriever 2회 호출은 langchain-core 1.8.4 + 가짜 retriever·모델로 실행해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cells, dbIcon, check, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const SAMPLE = [
    { id: 'c-007', page: 4, text: '연차 신청은 HR 포털 > 근태관리 > 연차신청 메뉴…' },
    { id: 'c-018', page: 9, text: '재택근무는 주 2회까지 신청 가능하며…' },
    { id: 'c-042', page: 21, text: '경조사 휴가는 본인 결혼 5일…' },
  ];
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 14, fill: MUT, opacity: op ?? 1 }, a || {}));
  // 종이 한 장 (모서리 접힘)
  function sheet(x, y, w, h, o) { o = o || {}; const f = 12;
    el('path', { d: `M${x},${y} H${x + w - f} L${x + w},${y + f} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, opacity: o.op ?? 1 });
    el('path', { d: `M${x + w - f},${y} V${y + f} H${x + w}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    if (o.lines) for (let i = 0; i < o.lines; i++) el('line', { x1: x + 8, y1: y + 18 + i * 9, x2: x + w - 10 - (i % 3) * 8, y2: y + 18 + i * 9, stroke: GRID, 'stroke-width': 2, opacity: o.op ?? 1 }); }
  // 왼쪽에 늘 있는 PDF 묶음
  function pdf(cx, cy, op, label) {
    for (let i = 4; i >= 0; i--) sheet(cx - 48 + i * 6, cy - 66 + i * 6, 84, 110, { lines: 8, op, stroke: i ? GRID : INK });
    mono(cx, cy + 74, 'company_manual.pdf', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: op });
    if (label) sub(cx, cy + 96, label, op); }

  // ---------- 1. Ingest: PDF → 페이지 → 청크 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat.ingest, p = (c.prev && c.prev.ingest) || {};
    pdf(110, 180, 1, '42쪽');
    if (k === 0) { // 페이지 42장이 한 장씩 Document 가 된다
      const n = Math.round(lerp(0, 42, E(u, 0.3, 2.0)));
      lbl(600, 60, 'loader.load()  →  Document 42개', fade(u, 0.2), { 'font-size': 16 });
      for (let i = 0; i < n; i++) { const r = Math.floor(i / 14), q = i % 14; sheet(268 + q * 46, 92 + r * 78, 34, 48, { lines: 3, stroke: INK }); mono(285 + q * 46, 158 + r * 78, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
      dot([[170, 180], [262, 180]], seg(u, 0.2, 2.2), ACC, 6);
      mono(600, 372, `len(pages) = ${n}`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      sub(600, 400, '청크는 아직 0개', fade(u, 2.0)); return; }
    if (k === 1) { // 자로 잰 분할 규칙: 500자 창 두 개가 50자 겹친다
      const X = (v) => 270 + v * 0.62, y = 190, g1 = E(u, 0.2, 1.0), g2 = E(u, 0.9, 1.7);
      lbl(600, 56, 'RecursiveCharacterTextSplitter', 1, { 'font-size': 17 });
      el('rect', { x: X(0), y: y - 14, width: X(1000) - X(0), height: 28, rx: 4, fill: SOFT, stroke: GRID });
      for (let i = 0; i <= 10; i++) el('line', { x1: X(i * 100), y1: y + 14, x2: X(i * 100), y2: y + 22, stroke: MUT });
      el('rect', { x: X(0), y: y - 60, width: (X(500) - X(0)) * g1, height: 34, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      el('rect', { x: X(450), y: y + 30, width: (X(950) - X(450)) * g2, height: 34, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
      if (g1 > 0.9) mono(X(250), y - 38, '청크 1 · 500자', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC });
      if (g2 > 0.9) mono(X(700), y + 52, '청크 2 · 500자', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO });
      const ov = fade(u, 1.8); el('rect', { x: X(450), y: y - 64, width: X(500) - X(450), height: 132, fill: WARN, opacity: 0.25 * ov });
      mono(X(475), y + 96, 'overlap 50', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: ov });
      ['0', '450', '500', '950'].forEach((v) => mono(X(+v), y - 72, v, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: v === '450' || v === '500' ? ov : 1 }));
      note(270, 352, '자르는 순서', fade(u, 2.1), { 'font-weight': 700 });
      ['"\\n\\n"', '"\\n"', '". "', '" "'].forEach((s, i) => pill(390 + i * 92, 347, s, MUT, pop(u, 2.1 + i * 0.1), { mono: true, fs: 13.5 }));
      sub(600, 400, '경계에 걸친 문장이 두 청크에 모두 남는다', fade(u, 2.4)); return; }
    // k ≥ 2: 128칸 격자
    const n = Math.round(tween(p.chunks, b.chunks, u, 1.6)), X0 = 280, Y0 = 70, cw = 34, ch = 30;
    lbl(560, 46, 'splitter.split_documents(pages)', 1, { 'font-size': 16, class: 'mono' });
    for (let i = 0; i < 128; i++) { const r = Math.floor(i / 16), q = i % 16, on = i < n, hot = k === 3 && i === 7;
      el('rect', { x: X0 + q * cw, y: Y0 + r * ch, width: cw - 5, height: ch - 5, rx: 4, fill: hot ? ACC : on ? ACCBG : PANEL, stroke: hot ? ACC : on ? ACC : GRID, 'stroke-width': hot ? 2.5 : 1.2, opacity: k === 3 && !hot ? 0.45 : 1 }); }
    if (k === 2) { grow(170, 180, 272, 180, E(u, 0.1, 0.6), ACC);
      mono(885, 120, String(n), { 'font-size': 40, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      sub(885, 146, '청크', 1, { 'font-size': 15 });
      mono(885, 210, '42 → 128', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      sub(885, 236, '쪽 → 청크', fade(u, 1.8));
      sub(560, 340, '한 칸 = 청크 하나 (500자 이하)', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k === 3: chunks[7] 열어 보기 + 견본 3개
    const sx = X0 + 7 * cw + cw / 2, op = E(u, 0.2, 0.9);
    grow(sx, Y0 + 30, 520, 318, op, ACC, { plain: true });
    const cy = lerp(Y0 + 15, 318, op);
    card(520, cy + 34, 470 * Math.max(0.2, op), 76, { rx: 10, stroke: ACC, sw: 2.5, fill: PANEL, op: Math.max(0.2, op) });
    if (op > 0.95) { mono(300, 338, 'chunks[7].page_content', { 'font-size': 13.5, fill: MUT });
      tx(300, 362, SAMPLE[0].text, { 'font-size': 15, 'font-weight': 600 });
      mono(300, 386, 'metadata = {source: "company_manual.pdf", page: 4}', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 }); }
    SAMPLE.forEach((s, i) => { const y = 80 + i * 70, sc = pop(u, 1.4 + i * 0.3);
      card(890, y, 124, 54, { rx: 8, stroke: i ? GRID : ACC, sw: 2, s: sc });
      mono(890, y - 4, s.id, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: i ? INK : ACC, opacity: sc });
      mono(890, y + 17, 'page ' + s.page, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: sc }); }); }

  // ---------- 2. Store: 청크 → 벡터 → Chroma ----------
  const VEC = { 'c-007': [0.013, -0.082, 0.144, 0.025], 'c-018': [-0.041, 0.117, -0.063, 0.091], 'c-042': [0.085, 0.024, -0.156, -0.011] };
  function vecRow(x, y, id, u0, u, o) { o = o || {}; const v = VEC[id], vals = [v[0], v[1], v[2], '…', v[3]];
    if (!o.noId) mono(x - 12, y + 26, id, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', fill: o.col || INK, opacity: fade(u, u0) });
    const n = Math.round(lerp(0, 5, E(u, u0, u0 + 0.8)));
    cells(x, y, vals.slice(0, n).map((a) => (typeof a === 'number' ? a.toFixed(3) : a)), { w: 72, h: 38, gap: 4, fs: 14, style: (i, a) => ({ stroke: a === '…' ? GRID : typeof a === 'string' && a[0] === '-' ? INFO : ACC, color: a === '…' ? MUT : INK }) }); }
  function s2(t, c) { const { k, u } = c, b = c.beat.store, p = (c.prev && c.prev.store) || {};
    // 왼쪽: 청크 묶음 · 가운데: 임베딩 모델 · 오른쪽: chroma_db
    for (let i = 0; i < 6; i++) el('rect', { x: 50 + (i % 2) * 44, y: 70 + Math.floor(i / 2) * 36, width: 38, height: 30, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.2 });
    sub(94, 196, '청크 128', 1, { 'font-size': 14.5, 'font-weight': 700, fill: INK });
    const ms = k === 0 ? pop(u, 0.2) : 1;
    card(400, 130, 250, 76, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2.5, s: ms });
    mono(400, 124, 'text-embedding-3-small', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: ms });
    mono(400, 150, '텍스트 → 1536차원', { 'font-size': 14, 'text-anchor': 'middle', opacity: ms });
    const ds = k === 0 ? pop(u, 0.8) : 1, nv = Math.round(tween(p.vectors, b.vectors, u, 1.8));
    dbIcon(760, 128, 'chroma_db', { s: ds, stroke: nv > 0 ? ACC : INK });
    mono(760, 216, `${nv} 건`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: nv ? ACC : MUT, opacity: ds });
    el('line', { x1: 150, y1: 130, x2: 272, y2: 130, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: 528, y1: 130, x2: 712, y2: 130, stroke: GRID, 'stroke-width': 2.5 });
    if (k === 0) { sub(400, 196, 'dim = 1536', fade(u, 1.2), { 'font-size': 15, fill: INFO, 'font-weight': 700 }); note(330, 300, '아직 아무것도 저장되지 않았다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { for (let i = 0; i < 8; i++) { const ph = (t * 0.7 + i / 8) % 1; dot([[150, 130], [272, 130]], ph < 0.45 ? ph / 0.45 : 0, ACC, 5); dot([[528, 130], [712, 130]], ph > 0.55 ? (ph - 0.55) / 0.45 : 0, INFO, 5); }
      mono(400, 300, 'Chroma.from_documents(chunks, embeddings,', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(400, 326, '                      persist_directory="./chroma_db")', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      sub(760, 248, '디스크에 남는다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) { // 한 청크가 벡터가 되는 과정
      zone(40, 254, 880, 150, '청크마다 반복', { op: fade(u, 0.1) });
      tx(60, 304, SAMPLE[0].text, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.2) });
      mono(60, 334, 'embed_query(c-007)', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.6) });
      grow(240, 330, 290, 330, E(u, 0.7, 1.0), INFO);
      vecRow(300, 312, 'c-007', 1.0, u, { noId: true });
      mono(690, 380, '→ chroma.add(id, vector, metadata)', { 'font-size': 14.5, 'text-anchor': 'end', fill: ACC, 'font-weight': 700, opacity: fade(u, 2.0) });
      note(720, 334, '1536개 중 4개 · 값은 예시', fade(u, 1.8)); return; }
    // k === 3: count() 확인 + 견본 벡터 3개
    banner(400, 236, 'vectorstore._collection.count() → 128', pop(u, 0.2)); check(760, 270, 12, pop(u, 0.6));
    ['c-007', 'c-018', 'c-042'].forEach((id, i) => vecRow(330, 272 + i * 46, id, 0.6 + i * 0.4, u));
    note(740, 318, '청크 128 = 벡터 128', fade(u, 1.8), { 'font-weight': 700, fill: GOOD, 'font-size': 15 });
    note(740, 344, '벡터 값은 예시', fade(u, 2.0)); }

  // ---------- 3. Retrieve: 질문 벡터 주변 top-3 ----------
  const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const SP = { x: 40, y: 50, w: 520, h: 340 }, Q = [300, 200];
  const NEAR = [{ id: 'c-007', p: [334, 180], s: 0.89 }, { id: 'c-042', p: [232, 262], s: 0.71 }, { id: 'c-018', p: [400, 286], s: 0.58 }];
  function space(n, u) { zone(SP.x, SP.y, SP.w, SP.h, 'chroma_db  · 벡터 128개 (2차원 모식도)');
    for (let i = 0; i < n; i++) { const x = SP.x + 20 + rnd(i) * (SP.w - 40), y = SP.y + 40 + rnd(i + 300) * (SP.h - 60);
      if (Math.hypot(x - Q[0], y - Q[1]) < 120) continue;   // 질문 자리 둘레는 아래 NEAR 만
      el('circle', { cx: x, cy: y, r: 4, fill: OFF, opacity: clamp(u * 128 - i) }); } }
  function s3(t, c) { const { k, u } = c, r = c.beat.retrieve;
    const n = k === 0 ? 128 : 128, su = k === 0 ? E(u, 0.3, 1.8) : 1; space(n, su);
    NEAR.forEach((d) => el('circle', { cx: d.p[0], cy: d.p[1], r: 4, fill: OFF, opacity: su }));
    if (k === 0) { dbIcon(760, 150, './chroma_db', { s: pop(u, 0.2) });
      dot([[700, 150], [560, 200]], seg(u, 0.4, 1.6), ACC, 7);
      mono(760, 270, '128 벡터 재로드', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
      mono(760, 300, '임베딩 계산 0회', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // 오른쪽: Retriever 판
    const rs = k === 1 ? pop(u, 0.2) : 1;
    card(760, 92, 340, 66, { rx: 10, stroke: INFO, fill: INFOBG, sw: 2.2, s: rs });
    mono(760, 86, 'as_retriever(k=3)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: rs });
    mono(760, 110, 'search_type="similarity"', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: rs });
    const got = k === 3 ? r.retrieved : [];
    [0, 1, 2].forEach((i) => { const y = 166 + i * 62, it = got[i], show = it ? E(u, 0.6 + i * 0.4, 1.1 + i * 0.4) : 0;
      el('rect', { x: 600, y, width: 320, height: 50, rx: 8, fill: PANEL, stroke: it && show > 0 ? ACC : GRID, 'stroke-width': 1.8, 'stroke-dasharray': it ? null : '5 5', opacity: rs });
      if (!it) { mono(616, y + 31, `${i + 1}위 · 비어 있음`, { 'font-size': 13.5, fill: OFF, opacity: rs }); return; }
      mono(614, y + 22, `${it.id} · p.${it.page}`, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: show });
      R.hbar(614, y + 30, 210, it.score * show, 1, { h: 12, text: it.score.toFixed(2) }); });
    if (k === 1) { note(600, 380, '질문이 오면 가장 가까운 3개를 채운다', fade(u, 1.2), { 'font-size': 15 }); return; }
    // 질문
    const qs = k === 2 ? E(u, 0.3, 1.4) : 1;
    if (k === 2) fly(760, 380, Q[0], Q[1], seg(u, 0.2, 1.3), `"${r.query}"`, {});
    if (qs >= 1 || k === 3) { el('circle', { cx: Q[0], cy: Q[1], r: 9, fill: ACC }); mono(Q[0] - 14, Q[1] - 12, 'q_vec', { 'text-anchor': 'end',  'font-size': 14.5, 'font-weight': 800, fill: ACC }); }
    if (k === 2) { pill(760, 380, `"${r.query}"`, ACC, 1 - fade(u, 0.2, 0.3), {});
      mono(600, 384, 'embed_query 1회 · LLM 호출 0회', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); return; }
    // k === 3: 가까운 셋에 선
    NEAR.forEach((d, i) => { const g = E(u, 0.3 + i * 0.4, 0.8 + i * 0.4);
      el('line', { x1: Q[0], y1: Q[1], x2: lerp(Q[0], d.p[0], g), y2: lerp(Q[1], d.p[1], g), stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
      el('circle', { cx: d.p[0], cy: d.p[1], r: 7, fill: g >= 1 ? ACC : OFF });
      if (g >= 1) mono(d.p[0] + (i === 1 ? -12 : 12), d.p[1] + (i === 0 ? -12 : 22), d.id, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': i === 1 ? 'end' : 'start' }); });
    note(600, 380, '점수는 예시 값 · 출처는 metadata.page', fade(u, 2.0)); }

  // ---------- 4. Generate: LCEL 파이프 ----------
  function template(x, y, ctxFill, qFill, op) {
    el('rect', { x, y, width: 420, height: 196, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op });
    mono(x + 14, y + 22, 'ChatPromptTemplate', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    tx(x + 14, y + 50, '아래 회사 매뉴얼 컨텍스트만 참고해서 답해.', { 'font-size': 14.5, opacity: op });
    tx(x + 14, y + 72, '없는 내용은 "매뉴얼에 없습니다"라고 답할 것.', { 'font-size': 14.5, fill: BAD, 'font-weight': 600, opacity: op });
    tx(x + 14, y + 100, '컨텍스트:', { 'font-size': 14.5, opacity: op });
    el('rect', { x: x + 86, y: y + 84, width: 318, height: 26, rx: 5, fill: ctxFill ? ACCBG : 'none', stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': ctxFill ? null : '5 4', opacity: op });
    mono(x + 96, y + 102, ctxFill || '{context}', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: op });
    tx(x + 14, y + 140, '질문:', { 'font-size': 14.5, opacity: op });
    el('rect', { x: x + 60, y: y + 124, width: 344, height: 26, rx: 5, fill: qFill ? ACCBG : 'none', stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': qFill ? null : '5 4', opacity: op });
    tx(x + 70, y + 142, qFill || '{question}', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, class: qFill ? null : 'mono', opacity: op });
    tx(x + 14, y + 178, '답변:', { 'font-size': 14.5, opacity: op }); }
  const STAGES = [['{context, question}', 'dict'], ['prompt', 'ChatPromptValue'], ['model', 'AIMessage'], ['StrOutputParser()', 'str']];
  const SX = [160, 400, 610, 820], SY = 150;
  function chain(k, u, flowU) {
    mono(18, SY + 5, 'str', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    STAGES.forEach(([name, out], i) => { const s = k === 2 ? pop(u, 0.2 + i * 0.35) : 1, w = i === 0 ? 190 : i === 3 ? 180 : 130;
      card(SX[i], SY, w, 54, { rx: 10, text: name, fs: 15, mono: true, stroke: i === 2 ? INFO : ACC, fill: i === 2 ? INFOBG : ACCBG, sw: 2.2, s });
      mono(SX[i], SY + 52, '→ ' + out, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 2 ? fade(u, 0.6 + i * 0.35) : 1 });
      if (i) mono((SX[i - 1] + SX[i]) / 2 + (i === 1 ? 20 : i === 3 ? -14 : 0), SY + 8, '|', { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', fill: INK, opacity: k === 2 ? fade(u, 0.3 + i * 0.35) : 1 }); });
    // dict 의 두 가지
    const bo = k === 2 ? fade(u, 1.6) : 1;
    mono(160, SY - 62, 'context: retriever | format_docs', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: bo });
    mono(160, SY - 40, 'question: RunnablePassthrough()', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: bo });
    if (flowU > 0 && flowU < 1) dot([[40, SY - 20], [SX[0], SY - 20], [SX[1], SY - 20], [SX[2], SY - 20], [SX[3], SY - 20], [930, SY - 20]], flowU, BAD, 7); }
  function s4(t, c) { const { k, u } = c, g = c.beat.generate || {};
    if (k === 0) { template(270, 110, null, null, fade(u, 0.1, 0.5));
      [[476, 197], [430, 237]].forEach(([x, y], i) => { const s = pop(u, 1.0 + i * 0.4); el('circle', { cx: x + 210, cy: y, r: 12 * s, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }); });
      note(270, 340, '빈 칸 두 개를 채워야 프롬프트가 된다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 1) { // format_docs: 3건 → 문자열 하나
      [SAMPLE[0], SAMPLE[2], SAMPLE[1]].forEach((d, i) => {
        const y0 = 80 + i * 56, g = E(u, 0.5 + i * 0.25, 1.4 + i * 0.25), op = 1 - fade(u, 1.7, 0.3);
        if (op > 0) card(lerp(150, 140 + i * 186, g), lerp(y0, 282, g), 150, 40, { rx: 8, text: d.id + ' · p.' + d.page, fs: 14, mono: true, stroke: ACC, op }); });
      const jo = fade(u, 1.7);
      el('rect', { x: 60, y: 260, width: 520, height: 44, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: jo });
      mono(76, 288, 'c-007 본문 \\n\\n c-042 본문 \\n\\n c-018 본문', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: jo });
      mono(60, 330, 'format_docs(docs) → str 하나', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      const ms = pop(u, 1.0); card(790, 160, 250, 88, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2.5, s: ms });
      mono(790, 150, 'ChatOpenAI', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: ms });
      mono(790, 176, 'gpt-4o-mini · temperature=0', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: ms }); return; }
    if (k === 2) { chain(k, u, 0); banner(480, 300, 'dict | prompt | model | parser', pop(u, 2.0));
      note(480, 350, '| 왼쪽의 출력이 오른쪽의 입력이 된다', fade(u, 2.2), { 'text-anchor': 'middle', 'font-size': 15 }); return; }
    // k === 3: invoke 한 번에 값이 흐른다
    chain(k, u, seg(u, 0.1, 1.5));
    const shown = ['"연차 신청 어떻게 해?"', '{context: "c-007 본문…", question: …}', 'Human: 아래 회사 매뉴얼 컨텍스트만…', 'AIMessage(content="HR 포털 > …")'];
    shown.forEach((s, i) => mono(60, 266 + i * 26, s, { 'font-size': 13.5, fill: i === 3 ? INFO : MUT, opacity: fade(u, 0.3 + i * 0.3) }));
    const ao = fade(u, 1.6);
    card(700, 326, 470, 96, { rx: 12, stroke: GOOD, fill: GOODBG, sw: 2.2, op: ao });
    tx(486, 312, 'HR 포털 > 근태관리 > 연차신청 메뉴에서', { 'font-size': 15, 'font-weight': 600, opacity: ao });
    tx(486, 336, '신청하시면 됩니다. 승인권자는 직속 팀장입니다.', { 'font-size': 15, 'font-weight': 600, opacity: ao });
    note(486, 362, 'str · 답변 문장은 예시', ao); }

  // ---------- 5. Chat UI: RunnableParallel → chat_fn → Gradio ----------
  function bubble(x, y, w, lines, o) { o = o || {}; const h = lines.length * 22 + 16 + (o.cite ? 24 : 0), right = o.user;
    el('rect', { x: right ? x - w : x, y, width: w, height: h, rx: 10, fill: right ? ACC : PANEL, stroke: right ? 'none' : GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    lines.forEach((s, i) => tx((right ? x - w : x) + 12, y + 24 + i * 22, s, { 'font-size': 14.5, fill: right ? PANEL : INK, 'font-weight': right ? 700 : 500, opacity: o.op ?? 1 }));
    if (o.cite) mono(x + 12, y + h - 12, o.cite, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: o.op ?? 1 });
    return h; }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // 입력 하나가 두 갈래로
      pill(110, 200, 'message', INK, pop(u, 0.1), { mono: true });
      card(450, 120, 230, 56, { rx: 10, text: 'answer = rag_chain', fs: 15, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 0.4) });
      card(450, 280, 230, 56, { rx: 10, text: 'sources = retriever', fs: 15, mono: true, stroke: INFO, fill: INFOBG, s: pop(u, 0.6) });
      grow(170, 190, 330, 128, E(u, 0.5, 1.0), ACC); grow(170, 210, 330, 272, E(u, 0.7, 1.2), INFO);
      dot([[170, 190], [330, 128], [570, 128], [700, 190]], seg(u, 1.0, 2.2), ACC, 6); dot([[170, 210], [330, 272], [570, 272], [700, 210]], seg(u, 1.0, 2.2), INFO, 6);
      const oo = fade(u, 2.0); el('rect', { x: 700, y: 150, width: 230, height: 100, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: oo });
      mono(716, 182, '{ answer: str,', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: oo });
      mono(716, 210, '  sources: [Document×3] }', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: oo });
      note(450, 370, 'retriever는 두 번 불린다 (rag_chain 안에서 한 번, sources에서 한 번)', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { // 쪽 번호 → 집합 → 정렬 → 출처 문자열
      tx(60, 60, 'chat_fn 안에서', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      mono(60, 104, 'd.metadata["page"]', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      cells(300, 80, [4, 21, 9], { w: 56, h: 40, style: () => ({ stroke: INFO }), fs: 16 });
      mono(60, 164, 'sorted({...})', { 'font-size': 14.5, opacity: fade(u, 0.8) });
      const sg = E(u, 0.9, 1.6); [4, 9, 21].forEach((v, i) => { const from = [0, 2, 1][i]; card(lerp(328 + from * 62, 328 + i * 62, sg), lerp(100, 160, sg), 56, 40, { rx: 6, text: String(v), fs: 16, mono: true, stroke: ACC, op: fade(u, 0.9) }); });
      const co = fade(u, 1.8); mono(60, 230, '출처: p.4, p.9, p.21', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: co });
      bubble(520, 260, 400, ['HR 포털 > 근태관리 > 연차신청 메뉴에서', '신청하시면 됩니다. 승인권자는 직속 팀장입니다.'], { cite: '출처: p.4, p.9, p.21', op: fade(u, 2.1) });
      note(60, 330, '검색된 3건의 쪽 번호가 모두 붙는다', fade(u, 2.2), { 'font-size': 15 });
      note(60, 356, '답변 문장은 예시', fade(u, 2.2)); return; }
    // k ≥ 2: Gradio 화면
    const W = 640, H = 380, cx = 480, cy = 210, top = cy - H / 2, left = cx - W / 2;
    browser(cx, cy, W, H, null, { s: k === 2 ? 0.9 + 0.1 * E(u, 0, 0.4) : 1 });
    mono(left + 70, top + 18, k === 3 ? 'localhost:7860' : '', { 'font-size': 13.5, fill: MUT });
    el('rect', { x: left + 2, y: top + 28, width: W - 4, height: 34, fill: ACC });
    tx(left + 16, top + 51, '사내 매뉴얼 챗봇', { 'font-size': 15, 'font-weight': 800, fill: PANEL });
    tx(left + 150, top + 51, '회사 매뉴얼 기반 자연어 Q&A, 출처 포함', { 'font-size': 13.5, fill: PANEL });
    bubble(left + W - 16, top + 74, 200, ['연차 신청 어떻게 해?'], { user: true });
    bubble(left + 16, top + 120, 420, ['HR 포털 > 근태관리 > 연차신청 메뉴에서 신청하시면', '됩니다. 승인권자는 직속 팀장입니다.'], { cite: '출처: p.4, p.9, p.21' });
    if (k === 2) { const ty = '재택은 며칠까지 돼?', n = Math.round(lerp(0, ty.length, E(u, 1.0, 2.2)));
      ['연차 신청 어떻게 해?', '재택은 며칠까지 돼?'].forEach((s, i) => pill(left + 200 + i * 190, top + 262, s, MUT, pop(u, 0.3 + i * 0.2), { fs: 13.5 }));
      sub(left + 60, top + 266, 'examples', fade(u, 0.3), { 'text-anchor': 'middle' });
      el('rect', { x: left + 16, y: top + 300, width: W - 110, height: 36, rx: 18, fill: SOFT, stroke: GRID });
      tx(left + 34, top + 323, n ? ty.slice(0, n) : '메시지를 입력하세요…', { 'font-size': 14.5, fill: n ? INK : OFF });
      pill(left + W - 50, top + 318, '전송', ACC, 1, { fs: 13.5, fill: ACCBG }); return; }
    // k === 3: 두 번째 턴
    bubble(left + W - 16, top + 232, 190, ['재택은 며칠까지 돼?'], { user: true, op: fade(u, 0.2) });
    bubble(left + 16, top + 278, 470, ['재택근무는 주 2회까지 신청 가능하며, 사전에 팀장', '승인이 필요합니다.'], { cite: '출처: p.9 …', op: fade(u, 0.9) });
    card(870, 340, 170, 60, { rx: 10, text: 'history 안 씀\n앞 대화 기억 X', fs: 14, stroke: WARN, fill: WARNBG, color: INK, s: pop(u, 1.8) });
    note(870, 398, '답변은 예시', fade(u, 2.0), { 'text-anchor': 'middle' }); }

  const quiz = [
    { q: 'chunk_overlap=50을 주는 까닭은 무엇인가?',
      o: ['청크 개수를 절반으로 줄이려고', '청크 경계에 걸친 문장이 양쪽 청크에 함께 남게 하려고', '임베딩 차원을 50만큼 늘리려고'], a: 1,
      why: '500자 창이 50자씩 겹치면 경계에서 잘린 문장이 두 청크 모두에 들어간다. 그래서 42쪽이 128개 청크로 나뉘어도 문맥이 덜 끊긴다.' },
    { q: 'persist_directory에 저장해 두면 다음 실행에서 무엇이 달라지나?',
      o: ['임베딩을 다시 계산하지 않고 128개 벡터를 그대로 읽는다', '벡터 차원이 1536에서 줄어든다', '청크 분할을 다시 해야 한다'], a: 0,
      why: './chroma_db에 벡터가 남아 있어 Chroma(persist_directory=...)로 다시 열기만 하면 된다. 임베딩 비용이 다시 들지 않는다.' },
    { q: 'retriever.invoke("연차 신청 어떻게 해?")를 부를 때 LLM 호출은 몇 번인가?',
      o: ['1번, 답을 만들어야 하니까', '3번, 청크마다 한 번씩', '0번, 질문 임베딩 1회와 벡터 검색만 한다'], a: 2,
      why: '검색 단계는 질문을 벡터로 바꾼 뒤 가까운 벡터 3개를 고르는 일이다. LLM은 Generate 단계에서야 처음 불린다.' },
    { q: 'rag_chain에서 model 단계가 내보내는 값은 무엇인가?',
      o: ['AIMessage', '문자열(str)', 'ChatPromptValue'], a: 0,
      why: 'model은 AIMessage를 내고, 마지막 StrOutputParser가 그것을 문자열로 바꾼다. 가짜 모델로 실행해 단계별 타입을 확인했다.' },
    { q: 'chat_fn이 첫 질문의 답에 붙이는 출처는 무엇인가?',
      o: ['p.4 하나, 답에 쓰인 쪽만', 'p.4, p.9, p.21, 검색된 3건 전부', '출처는 LLM이 직접 써 넣는다'], a: 1,
      why: 'chat_fn은 sources로 받은 문서 3건의 page를 모아 정렬할 뿐이다. 그래서 답에 쓰이지 않은 p.9, p.21도 함께 붙는다.' },
  ];

  const summary = [
    'PDF 42쪽을 500자, 50자 겹침 규칙으로 잘라 청크 128개를 만든다.',
    '청크마다 1536차원 벡터를 만들어 chroma_db에 저장하고, 다음 실행부터는 다시 읽기만 한다.',
    '질문도 벡터로 바꿔 가장 가까운 청크 3개를 찾는다. 이 단계에는 LLM 호출이 없다.',
    'LCEL 파이프로 검색 결과를 프롬프트 빈칸에 넣고 모델과 파서를 거쳐 답과 출처를 돌려준다.',
  ];
  const review = [
    { q: '매뉴얼에 있는 내용인데 챗봇이 "매뉴얼에 없습니다"라고 답했다. 먼저 확인할 것은?',
      o: ['retriever가 돌려준 청크 3건에 그 내용이 들어 있는지', 'temperature를 1로 올렸는지', 'Gradio 서버 포트가 7860인지'], a: 0,
      why: 'LLM은 {context}에 들어온 청크만 읽고 답한다. 검색이 엉뚱한 청크를 가져오면 프롬프트 규칙대로 없다고 답한다.' },
    { q: '답변 아래 출처에 질문과 관계없는 p.21이 늘 섞여 나온다. 가장 그럴듯한 까닭은?',
      o: ['LLM이 출처를 지어냈다', 'chat_fn이 검색된 k=3건의 쪽 번호를 모두 붙이기 때문이다', '임베딩 차원이 너무 작다'], a: 1,
      why: '출처는 sources로 받은 문서의 page를 모은 것이다. 실제로 쓰인 청크만 보이려면 점수 임계치를 두거나 k를 줄인다.' },
    { q: '두 번째 질문에서 "그럼 그건 며칠 전에 내야 해?"라고 물었더니 엉뚱한 답이 나왔다. 까닭은?',
      o: ['청크 overlap이 50자라서', 'Chroma가 128건까지만 저장해서', 'chat_fn이 history를 버려 "그건"이 무엇인지 모른다'], a: 2,
      why: 'chat_fn은 message만 검색하고 history는 버린다. 앞 대화를 이어 받으려면 memory를 붙이거나 질문을 다시 써 주는 단계를 넣는다.' },
  ];

  R.page({ title: '사내 매뉴얼 RAG 챗봇', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
