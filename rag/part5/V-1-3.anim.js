/* V-1-3 Citation & 출처 표시 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * chunk 본문·metadata 는 페이지의 RAW_CHUNKS, 답 조각은 ANSWER_TOKENS, 출처 카드·신뢰도는 beat 데이터를 읽는다.
 * LLM 응답과 "체감 신뢰도" 는 예시값이다. [N] 위치(29·49·63번째 글자)는 extract-cite.py 를 그대로 돌린 결과. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, grow, dot, check, cross, person, snippet, dbIcon, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const D = () => (typeof RAW_CHUNKS === 'undefined' ? null : RAW_CHUNKS);
  function wrap(s, w, fs) { const out = []; let cur = '';
    String(s).split(/(\s+)/).forEach((wd) => { if (!wd) return;
      if (tw(cur + wd, fs) <= w) { cur += wd; return; }
      if (cur.trim()) out.push(cur.trim()); cur = wd.trimStart(); });
    if (cur.trim()) out.push(cur.trim()); return out; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const metaStr = (m) => `${m.doc} ${m.section} · p.${m.page}`;

  // ---------- 왼쪽: 검색된 chunk 세 장 ----------
  const CY = [74, 166, 258], CXL = 30, CWL = 300;
  function chunkDoc(i, o) { o = o || {}; const d = D(); if (!d) return; const ch = d[i], y = CY[i], s = o.s ?? 1;
    const hot = o.hot, g = card(CXL + CWL / 2, y, CWL, 80, { rx: 8, stroke: hot ? ACC : GRID, fill: hot ? ACCBG : PANEL, sw: hot ? 2.6 : 1.5, s, op: o.op });
    wrap(ch.text, CWL - (o.id ? 64 : 28), 13.5).slice(0, 2).forEach((ln, k) => tx(-CWL / 2 + (o.id ? 50 : 14), -16 + k * 19, k === 1 && wrap(ch.text, CWL - 64, 13.5).length > 2 ? ln.slice(0, -1) + '…' : ln, { 'font-size': 13.5 }, g));
    if (o.meta !== 0) tx(-CWL / 2 + (o.id ? 50 : 14), 30, metaStr(ch.metadata), { 'font-size': 13.5, 'font-weight': 700, fill: o.metaCol || MUT, opacity: o.meta ?? 1, 'text-decoration': o.metaGone ? 'line-through' : null }, g);
    if (o.id) card(-CWL / 2 + 22, -10, 34, 30, { rx: 6, text: `[${i + 1}]`, fs: 14, mono: true, fw: 800, fill: ACC, stroke: 'none', color: PANEL, p: g, s: o.id }); }
  function chunks(o) { o = o || {}; [0, 1, 2].forEach((i) => chunkDoc(i, { s: o.s ? o.s(i) : 1, id: o.id ? (typeof o.id === 'function' ? o.id(i) : 1) : 0, hot: o.hot && o.hot(i), meta: o.meta, metaGone: o.metaGone, metaCol: o.metaCol })); }

  // ---------- 가운데 위: 답 (조각 + [N] 칩) ----------
  const AX = 370, AY = 40, AW = 560;
  function answer(mode, u, o) { o = o || {}; const T = typeof ANSWER_TOKENS === 'undefined' ? [] : ANSWER_TOKENS;
    el('rect', { x: AX, y: AY, width: AW, height: 128, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.s ?? 1 });
    tx(AX + 16, AY + 22, o.title || 'LLM 응답 (예시)', { 'font-size': 13.5, 'font-weight': 800, fill: MUT, opacity: o.s ?? 1 });
    // 줄 배치: a [1] / b [2] c [3] / d — 칩은 앞 글이 다 찍힌 뒤에 나온다
    const rows = [[T[0], 1], [T[1], 2, T[2], 3], [T[3]]], total = T.reduce((a2, q) => a2 + q.text.length, 0), lim = total * clamp(u), chips = [];
    let shown = 0;
    rows.forEach((r, ri) => { let x = AX + 16; const y = AY + 54 + ri * 30;
      r.forEach((q) => { if (!q) return;
        if (typeof q === 'number') { const n = q; if (mode === 'plain') return; chips[n] = { x: x + 17, y: y - 5 };
          if (lim + 0.5 < shown) { x += 38; return; }
          const hot = o.hotChip === n, sc = o.chipS ? o.chipS(n) : 1;
          card(x + 17, y - 5, 30, 24, { rx: 5, text: `[${n}]`, fs: 13.5, mono: true, fw: 800, fill: hot ? ACC : mode === 'extract' ? WARNBG : ACCBG, stroke: mode === 'extract' ? WARN : ACC, color: hot ? PANEL : mode === 'extract' ? WARN : ACC, sw: 1.6, s: sc });
          x += 38; return; }
        const part = q.text.slice(0, Math.max(0, Math.round(lim - shown))); shown += q.text.length;
        const e = tx(x, y, q.text, { 'font-size': 15, 'font-weight': 600, style: 'white-space:pre' }); let w = tw(q.text, 15) * 0.97;
        try { const m = e.getComputedTextLength(); if (m > 0) w = m; } catch (err) { /* 측정 불가 */ }
        e.textContent = part; x += w + 6; }); });
    return chips; }

  // ---------- 출처 카드 ----------
  const KX = (i) => 370 + i * 190, KY = 214;
  function citeCard(i, cd, o) { o = o || {}; const x = KX(i) + 88, s = o.s ?? 1, hot = o.hot;
    const g = card(x, KY + 64, 176, 128, { rx: 9, stroke: hot ? ACC : GOOD, fill: hot ? ACCBG : PANEL, sw: hot ? 2.8 : 1.8, s });
    mono(-76, -38, `[${cd.id}]`, { 'font-size': 15, 'font-weight': 800, fill: ACC }, g);
    tx(-42, -38, cd.doc, { 'font-size': 14.5, 'font-weight': 800 }, g);
    mono(-76, -16, `${cd.section} · p.${cd.page}`, { 'font-size': 13.5, fill: MUT }, g);
    wrap(cd.snippet, 156, 13.5).slice(0, 2).forEach((ln, k) => tx(-76, 8 + k * 19, k === 1 ? ln.slice(0, -1) + '…' : ln, { 'font-size': 13.5 }, g));
    if (o.score && cd.score != null) mono(76, 52, `score ${cd.score.toFixed(2)}`, { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'end', 'font-weight': 700 }, g);
    return g; }

  // ---------- 체감 신뢰도 (예시) ----------
  function trust(c, y) { const v = tween(c.prev ? c.prev.trustLevel : c.beat.trustLevel, c.beat.trustLevel, c.u), yy = y || 340;
    tx(CXL, yy, '사용자 체감 신뢰도 (예시)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    el('rect', { x: CXL, y: yy + 10, width: 240, height: 14, rx: 7, fill: SOFT });
    el('rect', { x: CXL, y: yy + 10, width: 240 * v / 100, height: 14, rx: 7, fill: v < 40 ? BAD : v < 70 ? WARN : GOOD });
    mono(CXL + 252, yy + 22, String(Math.round(v)), { 'font-size': 16, 'font-weight': 800, fill: v < 40 ? BAD : v < 70 ? WARN : GOOD }); }

  // ---------- 1. 출처 없음 ----------
  function s1(t, c) { const { k, u } = c;
    trust(c);
    if (k === 0) { dbIcon(180, 150, 'retriever  k = 3', { s: pop(u, 0.2) });
      card(AX + 150, 150, 200, 64, { rx: 10, text: 'llm\ngpt-4o-mini', fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.8) });
      sub(650, 260, '인용 장치는 아무것도 없다', fade(u, 1.6), { 'font-size': 15 }); return; }
    chunks({ s: (i) => (k === 1 ? pop(u, 0.2 + i * 0.25) : 1), meta: k === 1 ? 1 - E(u, 1.4, 2.4) : 0.35, metaGone: k >= 1 && (k > 1 || u > 1.6), metaCol: BAD });
    if (k === 1) { for (let i = 0; i < 3; i++) dot([[CXL + CWL, CY[i]], [AX + 40, 104]], seg(u, 0.9 + i * 0.2, 1.8 + i * 0.2), ACC, 6);
      card(AX + 280, 104, 520, 50, { rx: 8, text: 'context = "\\n\\n".join(page_content)', fs: 14.5, mono: true, stroke: GRID, fill: SOFT, s: pop(u, 1.2) });
      note(AX + 20, 200, '본문만 이어 붙이며 어느 문서였는지는 버려진다', fade(u, 1.9), { fill: BAD }); return; }
    answer('plain', k === 2 ? E(u, 0.3, 2.0) : 1, { s: k === 2 ? pop(u, 0.1) : 1 });
    if (k === 2) { note(AX, 210, '답변 문자열 하나만 돌아온다', fade(u, 2.1)); return; }
    person(860, 290, '사용자', { s: pop(u, 0.2) });
    card(690, 250, 220, 44, { rx: 22, text: '이거 진짜야? 환각 아냐?', fs: 14.5, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.6) });
    if (k === 3) { tx(AX, 214, '[N] 도 없고 출처 카드도 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); return; }
    tx(AX, 214, '확인하려면 문서를 직접 열어야 한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
    card(560, 330, 260, 48, { rx: 8, text: '법무·인사 RAG 탈락', fs: 17, fw: 800, stroke: BAD, color: BAD, sw: 3, s: pop(u, 1.2) }); }

  // ---------- 2. chunk 에 ID ----------
  function s2(t, c) { const { k, u } = c;
    trust(c);
    chunks({ s: (i) => (k === 0 ? pop(u, 0.2 + i * 0.25) : 1), id: k >= 1 ? (i) => (k === 1 ? pop(u, 0.4 + i * 0.35) : 1) : 0, meta: 1, metaCol: k >= 1 ? ACC : MUT });
    if (k === 0) { note(AX, 80, 'docs 3건 · 이름표가 아직 없다', fade(u, 1.0)); return; }
    if (k === 1) { snippet(AX, 50, ['for i, doc in enumerate(docs, start=1):', '    numbered.append({"id": i,', '        "text": ..., "metadata": ...})'], { op: fade(u, 0.2) });
      note(AX, 200, 'metadata(문서·절·쪽)도 같이 들고 간다', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 2) { el('rect', { x: AX, y: 40, width: AW, height: 128, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      tx(AX + 16, 62, 'context (prompt 에 들어갈 글)', { 'font-size': 13.5, 'font-weight': 800, fill: MUT });
      const d = D(); if (d) d.forEach((ch, i) => { const line = `[${i + 1}] ${ch.text}`, n = Math.round(30 * E(u, 0.3 + i * 0.6, 0.9 + i * 0.6));
        dot([[CXL + CWL, CY[i]], [AX + 10, 88 + i * 28]], seg(u, 0.1 + i * 0.6, 0.5 + i * 0.6), ACC, 5);
        mono(AX + 16, 92 + i * 28, line.slice(0, n) + (n >= 30 ? '…' : ''), { 'font-size': 14 }); });
      note(AX, 210, 'LLM 이 볼 문맥과 chunk 주소가 같은 번호를 쓴다', fade(u, 2.2)); return; }
    answer('plain', k === 3 ? E(u, 0.3, 1.8) : 1, { s: k === 3 ? pop(u, 0.1) : 1 });
    if (k === 3) { note(AX, 214, '답변은 Step 1 과 똑같다', fade(u, 2.0)); return; }
    for (let i = 0; i < 3; i++) { grow(CXL + CWL + 4, CY[i], AX - 6, 80 + i * 30, E(u, 0.3 + i * 0.2, 1.0 + i * 0.2), OFF, { dash: '5 5', plain: true });
      tx(AX - 22, 84 + i * 30, '?', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.1 + i * 0.2), 'text-anchor': 'middle' }); }
    note(AX, 214, '주소는 생겼지만 답 속에는 아직 [N] 이 없다', fade(u, 1.6), { fill: WARN }); }

  // ---------- 3. prompt 에 [N] 지시 ----------
  const RULES = ['1. 각 사실이 끝나는 자리에 [N]', '2. [N] 은 context 번호와 일치', '3. 여럿이면 [1][2] 처럼 나열', '4. 모르면 "문서에 없음"'];
  function s3(t, c) { const { k, u } = c;
    trust(c);
    chunks({ id: 1, hot: k === 5 ? (i) => u > 0.6 + i * 0.3 : null, meta: 1, metaCol: ACC });
    if (k <= 3) { el('rect', { x: AX, y: 36, width: AW, height: 300, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      tx(AX + 16, 58, 'CITE_PROMPT', { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: INFO });
      RULES.forEach((r, i) => tx(AX + 24, 86 + i * 24, r, { 'font-size': 14.5, 'font-weight': 600, opacity: k === 0 ? fade(u, 0.4 + i * 0.35) : 1, fill: k === 0 ? ACC : INK }));
      if (k >= 1) { const op = k === 1 ? fade(u, 0.3) : 1; tx(AX + 24, 196, '예시  Q. 점심시간은?', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: op });
        mono(AX + 24, 220, '[1] 점심시간은 12:00~13:00 이다.', { 'font-size': 14, opacity: k === 1 ? fade(u, 0.8) : 1 });
        tx(AX + 24, 244, 'A. 점심시간은 12:00 ~ 13:00 입니다', { 'font-size': 14.5, opacity: k === 1 ? fade(u, 1.3) : 1 });
        card(AX + 296, 239, 30, 24, { rx: 5, text: '[1]', fs: 13.5, mono: true, fw: 800, fill: ACC, stroke: 'none', color: PANEL, s: k === 1 ? pop(u, 1.8) : 1 }); }
      if (k >= 2) ['문맥: {context}', '질문: {question}'].forEach((s0, i) => card(AX + 100 + i * 240, 296, 210, 34, { rx: 6, text: s0, fs: 14, mono: true, stroke: k === 3 && i === 0 ? ACC : INFO, color: INFO, dash: k === 2 ? '5 4' : null, s: k === 2 ? pop(u, 0.4 + i * 0.4) : 1 }));
      if (k === 3) for (let i = 0; i < 3; i++) fly(CXL + CWL, CY[i], AX + 100, 296, seg(u, 0.3 + i * 0.5, 1.2 + i * 0.5), `[${i + 1}]`, { mono: true });
      return; }
    const chips = answer('inline', k === 4 ? E(u, 0.3, 2.0) : 1, { s: k === 4 ? pop(u, 0.1) : 1, chipS: (n) => (k === 4 ? pop(u, 0.6 + n * 0.45) : 1) });
    if (k === 5) [1, 2, 3].forEach((n) => { const p = chips[n]; if (!p) return; grow(p.x, p.y + 12, CXL + CWL + 4, CY[n - 1], E(u, 0.4 + n * 0.3, 1.0 + n * 0.3), ACC, { sw: 2 }); });
    note(AX, 214, k === 4 ? '답 문자열 안에 [1][2][3] 이 박혔다' : '사실마다 근거 chunk 가 보인다', fade(u, k === 4 ? 2.1 : 1.8), { fill: ACC }); }

  // ---------- 4. [N] 추출 → metadata 매핑 ----------
  const POS = [29, 49, 63];   // extract-cite.py 를 돌린 m.start() — 답 문자열 안 [N] 위치
  function s4(t, c) { const { k, u } = c, cards = c.beat.citationCards || [];
    if (k === 0) { chunks({ id: 1, meta: 1, metaCol: ACC });
      snippet(AX, 40, ['CITE_PATTERN = re.compile(r"\\[(\\d+)\\]")'], { op: fade(u, 0.3) });
      tx(AX, 130, 'Citation 카드 한 장의 모양', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
      ['id: int', 'doc: str', 'section: str', 'page: int', 'snippet: str'].forEach((f, i) => pill(AX + 60 + (i % 3) * 170, 166 + Math.floor(i / 3) * 40, f, INFO, pop(u, 1.1 + i * 0.2), { mono: true, fs: 13.5 })); trust(c); return; }
    chunks({ id: 1, hot: k === 2 ? (i) => u > 0.8 + i * 0.3 : null, meta: 1, metaCol: ACC });
    const chips = answer('extract', 1, { title: 'answer 문자열' });
    if (k === 1) { const scan = E(u, 0.2, 2.0); el('rect', { x: AX + 12, y: AY + 34, width: (AW - 24) * scan, height: 90, rx: 4, fill: WARN, opacity: 0.08 });
      tx(AX, 214, 'finditer 로 [N] 을 찾는다', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [1, 2, 3].forEach((n, i) => { const on = scan > (i + 1) / 3.4; if (!on) return; const p = chips[n];
        grow(p.x, p.y + 13, AX + 90 + i * 70, 256, 1, WARN, { sw: 1.6 });
        card(AX + 90 + i * 70, 274, 56, 34, { rx: 6, text: String(n), fs: 16, mono: true, fw: 800, stroke: WARN, color: WARN, s: pop(u, 0.4 + (i + 1) / 3.4 * 1.8) });
        mono(AX + 90 + i * 70, 312, `@${POS[i]}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      mono(AX + 330, 280, 'used_ids = [1, 2, 3]', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.2) }); trust(c); return; }
    if (k === 2) { tx(AX, 214, 'by_id = { 번호: chunk }', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: INFO, opacity: fade(u, 0.3) });
      [1, 2, 3].forEach((n, i) => { const x = AX + i * 190, s = pop(u, 0.6 + i * 0.3);
        card(x + 30, 262, 44, 36, { rx: 6, text: String(n), fs: 16, mono: true, fw: 800, stroke: INFO, color: INFO, s });
        grow(x + 54, 262, x + 92, 262, E(u, 0.9 + i * 0.3, 1.3 + i * 0.3), MUT);
        card(x + 140, 262, 90, 36, { rx: 6, text: 'chunk', fs: 14, stroke: GRID, s }); });
      note(AX, 320, '번호로 chunk 를 바로 꺼낸다', fade(u, 2.0)); trust(c); return; }
    // k3~5: 카드가 하나씩
    cards.forEach((cd, i) => citeCard(i, cd, { s: i === k - 3 ? pop(u, 0.4) : 1 }));
    const i = k - 3; if (cards[i]) dot([[CXL + CWL, CY[i]], [KX(i) + 88, KY + 2]], seg(u, 0.1, 0.6), ACC, 6);
    if (k === 5) mono(AX, 372, 'return answer, citations   # 3장', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
    trust(c, 360); }

  // ---------- 5. UI 출처 카드 ----------
  function s5(t, c) { const { k, u } = c, cards = c.beat.citationCards || [];
    trust(c, 372);
    if (k === 0) { snippet(40, 40, ['class Citation(BaseModel):', '    id: int', '    doc: str', '    section: str', '    page: int', '    snippet: str', '    score: float'], { op: fade(u, 0.2) });
      cards.forEach((cd, i) => citeCard(i, cd, { s: pop(u, 0.9 + i * 0.3), score: true }));
      note(370, 380, '프론트가 그대로 그릴 수 있게 score 까지 싣는다', fade(u, 1.9)); return; }
    if (k === 1) { snippet(40, 40, ['class RagResponse(BaseModel):', '    answer: str', '    citations: list[Citation]'], { op: fade(u, 0.2) });
      el('rect', { x: 470, y: 40, width: 450, height: 250, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.6) });
      [['{', 0], ['  "answer": "…15일이 부여됩니다 [1]. …",', 1], ['  "citations": [', 2], ['    {"id": 1, "doc": "인사규정", "page": 23, …},', 3], ['    {"id": 2, "doc": "복리후생 안내", "page": 12, …},', 4], ['    {"id": 3, "doc": "복리후생 안내", "page": 15, …}', 5], ['  ]', 6], ['}', 7]].forEach(([s0, i]) =>
        mono(488, 70 + i * 27, s0, { 'font-size': 13.5, fill: i === 1 ? ACC : i >= 3 && i <= 5 ? GOOD : INK, opacity: fade(u, 0.8 + i * 0.18) }));
      return; }
    if (k === 2 || k === 3) { const steps = [['retriever.invoke', '검색'], ['[N] 번호 붙이기', 'Step 2'], ['CITE_PROMPT → llm', 'Step 3'], ['extract_citations', 'Step 4'], ['RagResponse', '반환']];
      tx(40, 52, 'POST /rag/ask', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO });
      steps.forEach(([a, b], i) => { const on = i < 2 || k === 3, x = 110 + i * 182, s = k === 2 ? (i < 2 ? pop(u, 0.3 + i * 0.4) : 0) : i < 2 ? 1 : pop(u, 0.3 + (i - 2) * 0.45);
        if (!on || s <= 0) return; card(x, 150, 160, 70, { rx: 10, text: a + '\n' + b, fs: 14, mono: false, stroke: i >= 2 ? ACC : INFO, color: INK, s });
        if (i > 0) grow(x - 101, 150, x - 82, 150, 1, MUT); });
      if (k === 3) note(40, 260, '번호 붙이기 · 인용 지시 · 추출이 엔드포인트 하나에서 이어진다', fade(u, 1.8));
      return; }
    // k4~5: 화면 모양
    const chips = answer('inline', 1, { title: '화면 · 답변', hotChip: k >= 4 && u > 0.9 ? 2 : null });
    cards.forEach((cd, i) => citeCard(i, cd, { score: true, hot: i === 1 && u > 1.0 }));
    if (k === 4) { const p = chips[2]; if (p) { el('circle', { cx: p.x + 6, cy: p.y + 6, r: 9 * pop(u, 0.5), fill: 'none', stroke: INK, 'stroke-width': 2 });
        grow(p.x, p.y + 14, KX(1) + 88, KY, E(u, 0.9, 1.6), ACC); }
      note(CXL, 214, '[2] 를 누르면 카드 2 가 켜진다', fade(u, 1.6), { fill: ACC }); return; }
    // k5: 카드 → 원문 쪽 점프
    const s = pop(u, 0.6); grow(KX(1) + 88, KY + 128, 200, 300, E(u, 0.2, 0.8), ACC);
    const g = card(150, 290, 200, 112, { rx: 4, stroke: INK, sw: 2, s });
    tx(-88, -36, '복리후생 안내 · p.12', { 'font-size': 13.5, 'font-weight': 800 }, g);
    [0, 1, 2].forEach((i) => el('rect', { x: -88, y: -20 + i * 22, width: 176, height: 12, rx: 3, fill: i === 1 ? WARN : SOFT, opacity: i === 1 ? 0.55 : 1 }, g));
    tx(-88, 46, '리프레시 휴가는 연 3일', { 'font-size': 13.5, 'font-weight': 700, fill: WARN }, g);
    tx(CXL, 214, '카드를 누르면 원문 위치로 간다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); }

  const quiz = [
    { q: '출처 없는 RAG 답이 내용이 맞는데도 실무에서 탈락하는 이유는 무엇인가?',
      o: ['답이 너무 짧아서', '사용자가 문서를 직접 열기 전에는 맞는지 확인할 수 없어서', 'LLM 호출 비용이 커서'], a: 1,
      why: 'context를 이어 붙일 때 문서 이름이 버려져 답만 남는다. 검증 수단이 없으니 법무·인사처럼 정확성이 중요한 곳에서는 쓸 수 없다.' },
    { q: 'chunk에 [1][2][3] 번호를 붙였는데 답에는 아직 [N]이 안 보인다. 왜인가?',
      o: ['LLM이 [N]을 답에 넣으라는 지시를 받지 못해서', '번호가 0부터 시작해서', 'metadata를 버려서'], a: 0,
      why: '번호는 context에만 붙었다. 주소는 생겼지만 답에 그 주소를 쓰라는 규칙은 다음 단계의 CITE_PROMPT가 준다.' },
    { q: 'CITE_PROMPT의 규칙 중 답 속 [N]과 chunk를 정확히 이어 주는 것은?',
      o: ['"알 수 없는 내용은 문서에 없음"', '"여러 chunk면 [1][2]처럼 나열"', '"[N]은 context의 chunk 번호와 정확히 일치"'], a: 2,
      why: '답에 붙은 번호가 context 번호와 같아야 나중에 그 번호로 chunk와 metadata를 찾을 수 있다. 예시 Q-A도 같은 표기를 보여 준다.' },
    { q: '정규식 \\[(\\d+)\\]로 답에서 꺼낸 used_ids가 [1, 2, 3]일 때 다음 단계는?',
      o: ['by_id로 번호마다 chunk를 찾아 doc·section·page·snippet 카드로 만든다', '답에서 [N]을 지운다', '새로 검색한다'], a: 0,
      why: 'by_id = {번호: chunk}로 바로 꺼내 metadata를 카드 dict로 옮긴다. 이 예에서는 인사규정 p.23, 복리후생 안내 p.12와 p.15 세 장이 나온다.' },
    { q: '답변 화면에서 [2]를 누르면 무슨 일이 일어나게 만드나?',
      o: ['답이 다시 생성된다', '2번 출처 카드가 강조되고, 카드를 누르면 원문 위치로 간다', '검색 결과가 2개로 줄어든다'], a: 1,
      why: '[N]을 버튼으로 바꾸고 카드와 이어 둔다. 여기서는 [2]가 복리후생 안내 p.12 카드로, 그 카드는 원문 쪽으로 이어진다.' },
  ];

  const summary = [
    '출처 없는 답은 맞아도 사용자가 확인할 방법이 없어 실무에서 쓰기 어렵다.',
    'chunk마다 번호를 붙이고 context에도 같은 번호를 써야 답과 문서를 이을 수 있다.',
    'prompt로 사실마다 [N]을 달게 하고, 정규식으로 꺼내 metadata 카드로 바꾼다.',
    '화면에서 [N]을 누르면 카드가 켜지고, 카드는 원문 쪽 위치로 이어진다.',
  ];
  const review = [
    { q: '답에 [4]가 찍혔는데 검색된 chunk는 3개뿐이라 by_id[4]에서 오류가 났다. 먼저 손볼 곳은?',
      o: ['정규식을 \\d{2}로 바꾼다', '추출할 때 by_id에 없는 번호를 거른다', 'chunk 수를 4개로 늘린다'], a: 1,
      why: '[N]은 context 번호와 정확히 일치해야 한다는 규칙이 있다. LLM이 어길 수 있으니 extract 단계에서 by_id에 없는 번호는 버리는 방어도 함께 둔다.' },
    { q: '답에는 [1][2]가 잘 붙는데 카드에 문서 이름이 비어 나온다. 어디를 의심해야 하나?',
      o: ['CITE_PROMPT의 예시', 'Pydantic 모델의 score 타입', '번호를 붙일 때 metadata를 함께 보관하지 않았다'], a: 2,
      why: '카드의 doc·section·page는 Step 2에서 chunk와 함께 보관한 metadata에서 나온다. 그 자리에서 버리면 번호는 맞아도 카드가 빈다.' },
    { q: '같은 질문에 답은 맞지만 사용자가 "정말 규정 맞아?"라고 계속 묻는다. 가장 직접적인 개선은?',
      o: ['[N]마다 출처 카드와 원문을 잇는다', '답을 더 길게 쓰게 한다', '모델을 더 큰 것으로 바꾼다'], a: 0,
      why: '의심은 답이 틀려서가 아니라 확인할 길이 없어서 생긴다. 번호, 추출, 카드, 원문 이동이 이어져야 사용자가 스스로 확인할 수 있다.' },
  ];

  R.page({ title: 'Citation — 답의 [N]을 문서까지 잇기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
