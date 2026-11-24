/* III-2-2 MapReduce Chain — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 청크 5개의 쪽·토큰 수는 페이지 데이터(가상의 100쪽 사업계획서)다. 요약 문장은 예시 출력이다.
 * 확인한 것 (langchain 0.3.27 · langchain-text-splitters 0.3.11 · tiktoken o200k_base, 가짜 LLM):
 *  - 페이지 Document 100개에 split_documents(chunk_size=8000자) → 100개. 이은 문자열을 토큰 기준(10,500)으로 자르면 5개
 *  - load_summarize_chain 의 LLM 호출 수: stuff 1 · map_reduce 5+1 · refine 5(직렬) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const CH = [
    { id: 'c1', pages: 'p.1-20', tok: 10240, sum: '제품 개요와 시장 분석' },
    { id: 'c2', pages: 'p.21-40', tok: 10100, sum: '경쟁사 비교 및 차별점' },
    { id: 'c3', pages: 'p.41-60', tok: 9980, sum: '기술 아키텍처 설명' },
    { id: 'c4', pages: 'p.61-80', tok: 10300, sum: '수익 모델과 가격 전략' },
    { id: 'c5', pages: 'p.81-100', tok: 9870, sum: '로드맵 및 향후 계획' },
  ];
  const TOTAL = 50490;
  const n0 = (v) => Math.round(v).toLocaleString('en-US');
  const trunc = (s, w, fs) => { s = String(s); if (tw(s, fs) <= w) return s; while (s.length && tw(s + '…', fs) > w) s = s.slice(0, -1); return s + '…'; };
  const wrapW = (s, w, fs) => { const out = []; let line = '';
    String(s).split(' ').forEach((word) => { const cand = line ? line + ' ' + word : word; if (tw(cand, fs) > w && line) { out.push(line); line = word; } else line = cand; });
    if (line) out.push(line); return out; };
  const ST = { idle: [GRID, PANEL, INK], overflow: [BAD, BADBG, BAD], mapping: [INFO, INFOBG, INFO], mapped: [GOOD, GOODBG, GOOD],
    refining: [WARN, WARNBG, WARN], refined: [GOOD, GOODBG, GOOD], merged: [ACC, ACCBG, ACC] };
  const stOf = (c, i) => (c.beat.chunkStates && c.beat.chunkStates[i] ? c.beat.chunkStates[i].state : 'idle');
  // 청크 상자 (가운데 기준)
  function chunk(cx, cy, w, h, d, state, o) { o = o || {}; const [stroke, fill, col] = ST[state] || ST.idle;
    const g = card(cx, cy, w, h, { rx: 8, stroke, fill, sw: state === 'idle' ? 1.8 : 2.4, s: o.s, op: o.op });
    tx(0, o.tok === false ? 5 : -4, `Chunk ${d.id.slice(1)}`, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: col }, g);
    if (o.tok !== false) mono(0, 16, o.pages ? d.pages : n0(d.tok), { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  function llm(cx, cy, s, o) { o = o || {}; return card(cx, cy, o.w || 74, 34, { rx: 17, text: o.text || 'LLM', fs: 14, fw: 800, stroke: o.stroke || INK, fill: o.fill || PANEL, color: o.color || o.stroke || INK, s, op: o.op }); }
  function codePill(cx, cy, s, sc, col) { return pill(cx, cy, s, col || ACC, sc, { fs: 13.5, mono: true, fill: PANEL }); }
  // 프롬프트 틀 (왼쪽 위 기준): lines 는 문자열, 마지막에 슬롯 하나
  function tmpl(x, y, w, lines, slot, o) { o = o || {}; const op = o.op ?? 1, sh = o.slotH || 40;
    const h = 34 + lines.length * 24 + sh + 16;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    tx(x + 14, y + 22, o.title || 'ChatPromptTemplate', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op });
    lines.forEach((s, i) => tx(x + 14, y + 50 + i * 24, s, { 'font-size': 14.5, opacity: op * (o.lf ? clamp(o.lf * lines.length - i) : 1) }));
    const sy = y + 34 + lines.length * 24 + 6, f = o.fill || 0;
    el('rect', { x: x + 14, y: sy, width: w - 28, height: sh, rx: 8, fill: f > 0 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': f >= 1 ? null : '6 5', opacity: op });
    if (f <= 0) mono(x + w / 2, sy + sh / 2 + 5, slot, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: op });
    return { sx: x + 14, sy, sw: w - 28, sh, h }; }

  // ---------- 1. Stuff ----------
  const BX = 80, BW = 820, KMAX = 128000, KX = (v) => BX + (BW * v) / KMAX;
  function ctxBar(y, fillTok, o) { o = o || {};
    el('rect', { x: BX, y, width: BW, height: 34, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 1.8 });
    el('rect', { x: KX(8000), y: y - 6, width: KX(16000) - KX(8000), height: 46, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', opacity: o.band ?? 1 });
    if (fillTok > 0) el('rect', { x: BX, y: y + 4, width: KX(fillTok) - BX, height: 26, rx: 4, fill: o.col || WARN, opacity: 0.85 });
    [[0, '0'], [16000, '16K'], [50490, '50K'], [128000, '128K']].forEach(([v, s]) => mono(KX(v), y + 56, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': v === 0 ? 'start' : v === 128000 ? 'end' : 'middle', opacity: o.ticks ?? 1 }));
    tx(KX(12000), y - 14, '안정 구간 8K~16K (경험칙)', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: o.band ?? 1 });
    tx(BX + BW, y - 14, 'gpt-4o-mini 컨텍스트 128K', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700, opacity: o.ticks ?? 1 }); }
  function pagesGrid(x, y, n, o) { o = o || {}; for (let i = 0; i < 100; i++) { const r = Math.floor(i / 20), q = i % 20, s = clamp(n - i); if (s <= 0) continue;
      el('rect', { x: x + q * 22, y: y + r * 28, width: 18, height: 24, rx: 2, fill: PANEL, stroke: o.col || MUT, 'stroke-width': 1.3, opacity: s * (o.op ?? 1) }); } }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const n = 100 * E(u, 0.3, 2.0);
      for (let i = 4; i >= 0; i--) el('rect', { x: 70 + i * 6, y: 120 - i * 6, width: 110, height: 140, rx: 4, fill: PANEL, stroke: INK, 'stroke-width': 1.8 });
      mono(125, 200, 'PDF', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' }); lbl(125, 300, 'business-plan.pdf', 1);
      pagesGrid(260, 110, n); grow(200, 190, 248, 190, E(u, 0.1, 0.4), MUT);
      mono(480, 290 + 0, `len(docs) = ${Math.round(n)}`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      sub(480, 324, '쪽 하나가 Document 하나. 아직 자르지도 합치지도 않았다', fade(u, 2.1), { 'font-size': 15 });
      sub(480, 390, '(쪽 수·토큰 수는 이 페이지의 가상 데이터)', fade(u, 2.3), { 'font-size': 13.5 });
      return; }
    const tok = k === 1 ? tween(0, TOTAL, u, 1.6) : TOTAL;
    ctxBar(120, tok, { col: k >= 3 ? BAD : WARN, band: k === 1 ? fade(u, 1.8) : 1 });
    if (k === 1) { mono(KX(tok) + 10, 144, `${n0(tok)} tok`, { 'font-size': 18, 'font-weight': 800, fill: WARN });
      pill(480, 270, '들어는 간다', GOOD, pop(u, 2.0), { fs: 15 }); sub(480, 310, '하지만 안정 구간의 3배가 넘는 길이', fade(u, 2.3), { 'font-size': 15 }); return; }
    mono(KX(TOTAL) + 10, 144, '50,490 tok', { 'font-size': 18, 'font-weight': 800, fill: k >= 3 ? BAD : WARN });
    // 한 prompt 안의 다섯 덩어리
    const px = 80, pw = 560, sw = pw / 5, py = 250;
    const go = k === 2 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: px - 8, y: py - 34, width: pw + 16, height: 98, rx: 12, fill: 'none', stroke: k >= 3 ? BAD : INK, 'stroke-width': 2.2, opacity: go });
    tx(px, py - 42, 'prompt 1개', { 'font-size': 14.5, 'font-weight': 800, opacity: go });
    CH.forEach((d, i) => { const lost = k === 3 && i >= 1 && i <= 3 ? E(u, 1.2, 2.0) : 0, st = k >= 3 ? 'overflow' : 'idle';
      chunk(px + sw * i + sw / 2, py + 14, sw - 8, 50, d, st, { s: k === 2 ? pop(u, 0.4 + i * 0.12) : 1, op: 1 - lost * 0.6 });
      if (lost > 0) mono(px + sw * i + sw / 2, py + 82, '?', { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: lost }); });
    if (k === 2) { codePill(480, 380, 'load_summarize_chain(llm, chain_type="stuff")', pop(u, 1.2)); sub(800, 270, '분할 단계가 없다', fade(u, 1.8), { 'font-size': 15, fill: WARN }); return; }
    llm(820, 264, 1, { stroke: k === 3 ? BAD : INK });
    if (k === 3) { grow(648, 264, 780, 264, E(u, 0.2, 0.7), BAD); sub(714, 252, '호출 1번', fade(u, 0.5), { 'font-size': 14, fill: BAD });
      // lost in the middle: 위치별로 답에 쓰이는 정도 (개념도, 숫자 없음)
      const pts = []; for (let i = 0; i <= 40; i++) { const xx = i / 40; pts.push([px + pw * xx, 396 - 40 * (Math.pow(2 * xx - 1, 2))]); }
      const f = E(u, 0.6, 1.6), cut = Math.max(2, Math.round(pts.length * f));
      el('polyline', { points: pts.slice(0, cut).map((p) => p.join(',')).join(' '), fill: 'none', stroke: BAD, 'stroke-width': 2.4 });
      tx(px + pw + 16, 384, '쪽 위치별 활용 (개념도)', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(px + pw + 16, 406, '중간이 가장 약하다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    // k4: 6K 이하면 stuff, 아니면 자른다
    grow(KX(6000), 112, KX(6000), 186, E(u, 0.2, 0.6), ACC, { plain: true, sw: 3 }); pill(260, 202, '≲ 6K 면 stuff', ACC, pop(u, 0.6), { fs: 13.5 });
    [1, 2, 3, 4].forEach((i) => grow(px + sw * i, py - 30, px + sw * i, py + 60, E(u, 1.0 + i * 0.2, 1.4 + i * 0.2), WARN, { plain: true, dash: '6 4', sw: 2.5 }));
    pill(820, 340, '5조각으로 나눈다', WARN, pop(u, 2.1), { fs: 15 });
  }

  // ---------- 2. Map ----------
  const CW = 160, CG = 20, CX = (i) => 40 + i * (CW + CG) + CW / 2;
  function s2(t, c) { const { k, u } = c;
    // 위: 이어 붙인 50,490 토큰 → 5청크
    const open = k === 0 ? E(u, 0.6, 1.6) : 1;
    if (k === 0) { const f = E(u, 0.1, 0.5); el('rect', { x: 40, y: 92, width: Math.max(0.1, 880 * f), height: 50, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: 1 - open });
      mono(480, 124, 'full : 50,490 tok (페이지 100개를 이은 문자열)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: (1 - open) * f }); }
    CH.forEach((d, i) => { if (k === 0 && open <= 0) return; chunk(lerp(480, CX(i), open), 117, CW, 50, d, stOf(c, i), { op: k === 0 ? open : 1 }); });
    if (k === 0) { [0, 1, 2, 3].forEach((i) => { const x = CX(i) + CW / 2 + CG / 2; el('rect', { x: x - 14, y: 96, width: 28, height: 42, rx: 4, fill: WARN, opacity: 0.25 * fade(u, 1.8) }); });
      mono(480, 172, 'overlap 400 tok', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      codePill(480, 230, 'from_tiktoken_encoder(chunk_size=10_500, chunk_overlap=400)', pop(u, 1.9), INFO);
      tx(130, 300, 'split_documents(docs) 를 그대로 쓰면', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) });
      mono(560, 300, '→ 100개 (쪽마다 따로)', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); cross(800, 294, 10, pop(u, 2.4));
      tx(130, 340, '토큰 수로 자르면 한글 글자 수와 상관없이 크기가 맞는다', { 'font-size': 15, fill: ACC, opacity: fade(u, 2.4) }); return; }
    if (k === 1) { const tm = tmpl(80, 190, 470, ['다음 발췌본을 5문장 이내로 요약해줘.'], '{text}', { title: 'map_prompt', lf: E(u, 0.2, 0.8) });
      ['map_prompt', 'llm', 'StrOutputParser()'].forEach((s, i) => card([620, 736, 864][i], 318, [120, 64, 150][i], 38, { rx: 9, text: s, fs: 13.5, fw: 700, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 1.0 + i * 0.2) }));
      mono(694, 324, '|', { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); mono(782, 324, '|', { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(560, 274, 'map_chain =', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.9) });
      sub(315, 380, '청크 하나 → 요약 하나', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k ≥ 2: 청크마다 LLM 한 대, 동시에
    CH.forEach((d, i) => { const x = CX(i), go = k === 2 ? seg(u, 0.4, 1.4) : 1;
      if (k === 2 && go < 1) dot([[x, 142], [x, 212]], go, INFO, 6);
      llm(x, 230, k === 2 ? pop(u, 0.2) : 1, { stroke: INFO, fill: k === 2 && u < 1.6 ? INFOBG : PANEL });
      if (k >= 3) { const s = k === 3 ? pop(u, 0.3 + i * 0.15) : 1; grow(x, 248, x, 280, k === 3 ? E(u, 0.2 + i * 0.15, 0.5 + i * 0.15) : 1, GOOD);
        if (k === 3) { card(x, 316, CW, 58, { rx: 8, stroke: GOOD, fill: GOODBG, sw: 2, s });
          const ln = wrapW(d.sum, CW - 16, 13.5); ln.slice(0, 2).forEach((l, j) => tx(x, 312 + j * 18 - (ln.length > 1 ? 4 : -4), l, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 600, opacity: clamp(s) })); } } });
    if (k === 2) { codePill(480, 180, 'map_chain.batch(…, config={"max_concurrency": 5})', pop(u, 0.1), INFO);
      // 시간 막대: 다섯 호출이 같은 시각에 시작
      const x0 = 160, unit = 300; tx(x0 - 12, 300, '시간 →', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      CH.forEach((d, i) => el('rect', { x: x0, y: 290 + i * 22, width: unit * E(u, 1.4, 2.4), height: 16, rx: 4, fill: INFO, opacity: 0.75 }));
      tx(x0 + unit + 20, 346, '5개가 동시에 돈다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { sub(480, 380, '부분 요약 5개, 각 ~200 tok (요약 문장은 예시)', fade(u, 1.6), { 'font-size': 15 }); return; }
    // k4: 순차 vs 병렬 시간
    const x0 = 160, unit = 140, y1 = 304, y2 = 360;
    tx(x0 - 14, y1 + 12, '순차', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(x0 - 14, y2 + 12, '병렬', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: INFO });
    CH.forEach((d, i) => { const f = E(u, 0.2 + i * 0.25, 0.45 + i * 0.25); if (f > 0) el('rect', { x: x0 + i * unit, y: y1, width: (unit - 4) * f, height: 18, rx: 4, fill: MUT, opacity: 0.7 });
      const g = E(u, 0.2, 0.45); el('rect', { x: x0, y: y2 - 6 + i * 4, width: (unit - 4) * g, height: 6, rx: 2, fill: INFO }); });
    grow(x0 + unit, 392, x0 + 5 * unit, 392, E(u, 1.6, 2.1), ACC, { plain: true, dash: '4 4' });
    mono(x0 + 3 * unit, 412, '이상적이면 최대 5배 짧다 (rate limit 이 있으면 덜)', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
  }

  // ---------- 3. Reduce ----------
  function sums(op, hide) { CH.forEach((d, i) => { const y = 106 + i * 62, h = hide ? hide(i) : 0; if (h >= 1) return;
      card(140, y, 220, 50, { rx: 8, stroke: GOOD, fill: GOODBG, sw: 2, op: (op ?? 1) * (1 - h) });
      mono(44, y - 6, `부분 ${i + 1}`, { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: (op ?? 1) * (1 - h) });
      tx(44, y + 14, trunc(d.sum, 200, 14), { 'font-size': 14, opacity: (op ?? 1) * (1 - h) }); }); }
  function s3(t, c) { const { k, u } = c;
    const fillJ = k === 2 ? E(u, 0.4, 1.6) : k > 2 ? 1 : 0;
    sums(k >= 2 ? 0.35 : 1);
    const tm = tmpl(290, 74, 646, ['아래는 한 사업 계획서의 부분 요약들이다.', '이 요약들을 통합하여 임원용 한 단락 최종 요약을 작성하라.'], '{partial_summaries}',
      { title: 'reduce_prompt', fill: fillJ, slotH: 112, lf: k === 0 ? E(u, 0.2, 1.2) : 1 });
    if (fillJ > 0) CH.forEach((d, i) => mono(tm.sx + 12, tm.sy + 22 + i * 19, `[부분 ${i + 1}] ${d.sum}`, { 'font-size': 13.5, opacity: clamp(fillJ * 5 - i) }));
    if (k === 2) CH.forEach((d, i) => fly(250, 106 + i * 62, tm.sx + 150, tm.sy + 18 + i * 19, seg(u, 0.2 + i * 0.15, 0.9 + i * 0.15), `부분 ${i + 1}`, { fill: GOOD }));
    if (k === 0) { sub(613, 320, '{partial_summaries} 자리에 Map 결과가 들어간다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { ['reduce_prompt', 'llm', 'StrOutputParser()'].forEach((s, i) => card([430, 560, 700][i], 330, [130, 64, 160][i], 38, { rx: 9, text: s, fs: 13.5, fw: 700, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 0.3 + i * 0.25) }));
      [507, 607].forEach((x, i) => mono(x, 336, '|', { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.25) }));
      sub(613, 386, 'Map 체인과 같은 모양의 LCEL 파이프', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 2) { // 입력 크기 비교
      tx(300, 316, 'Map 입력 합계', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) }); hbar(440, 302, 360, TOTAL, TOTAL, { col: INFO, text: '50,490', u: E(u, 1.4, 2.0) });
      tx(300, 356, 'Reduce 입력', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); hbar(440, 342, 360, 1000, TOTAL, { col: GOOD, text: '~1,000', u: E(u, 1.8, 2.4) });
      sub(613, 400, '요약만 모으니 프롬프트가 작다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 3) { grow(613, 270, 613, 296, E(u, 0.1, 0.4), ACC); llm(613, 314, pop(u, 0.3), { stroke: ACC, fill: ACCBG });
      const lines = wrapW((c.beat.finalText || '').replace(/^"|"$/g, ''), 620, 14), f = E(u, 0.8, 2.2), tot = lines.join('').length; let left = Math.round(tot * f);
      el('rect', { x: 290, y: 340, width: 646, height: 22 + lines.length * 21, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.7) });
      lines.forEach((l, i) => { const part = l.slice(0, Math.max(0, left)); left -= l.length; if (part) tx(304, 362 + i * 21, part, { 'font-size': 14 }); });
      tx(936, 334, '최종 요약 (예시 출력)', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.8) }); return; }
    // k4: 토큰 결산
    el('rect', { x: 290, y: 298, width: 646, height: 114, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    const rows = [['Stuff', '50,490 × 1번', TOTAL, BAD], ['Map', '~10,100 × 5번', TOTAL, INFO], ['Reduce', '~1,000 × 1번', 1000, GOOD], ['Map+Reduce', '≈ 51,500', 51500, ACC]];
    rows.forEach(([a, b, v, col], i) => { const y = 320 + i * 26, op = fade(u, 0.2 + i * 0.35);
      tx(306, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, opacity: op, fill: col }); mono(410, y + 5, b, { 'font-size': 14, opacity: op });
      hbar(560, y - 9, 290, v, 51500, { col, u: E(u, 0.3 + i * 0.35, 0.9 + i * 0.35), label: false, h: 14 });
      mono(926, y + 5, n0(v), { 'font-size': 13.5, 'text-anchor': 'end', fill: col, opacity: op }); });
  }

  // ---------- 4. Refine ----------
  const RX = (i) => 100 + i * 190;
  function s4(t, c) { const { k, u } = c;
    CH.forEach((d, i) => chunk(RX(i), 108, 150, 50, d, stOf(c, i), { s: k === 0 ? pop(u, 0.2 + i * 0.12) : 1 }));
    if (k === 0) { [0, 1, 2, 3].forEach((i) => grow(RX(i) + 78, 108, RX(i + 1) - 78, 108, E(u, 1.0 + i * 0.2, 1.3 + i * 0.2), WARN));
      CH.forEach((d, i) => mono(RX(i), 158, `${i + 1}번째`, { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.2) }));
      codePill(480, 230, 'load_summarize_chain(llm, chain_type="refine", return_intermediate_steps=True)', pop(u, 1.8), WARN);
      sub(480, 290, '청크를 앞에서부터 하나씩 흡수하며 요약을 고쳐 쓴다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // 현재 흡수 중인 청크 번호
    const cur = (c.beat.chunkStates || []).findIndex((s) => s.state === 'refining');
    const vx = RX(Math.max(0, cur)), vprev = RX(Math.max(0, cur - 1));
    if (k === 1 || k === 2 || k === 4 || k === 5) {
      const sx = k === 1 ? vx : lerp(vprev, vx, E(u, 0.2, 1.0));
      if (k === 1 || k === 2 || k === 4) { dot([[vx, 134], [vx, 206]], seg(u, 0.3, 1.0), WARN, 6); llm(vx, 222, 1, { stroke: WARN, fill: WARNBG }); }
      if (k >= 2) { el('path', { d: `M${sx - 70},300 Q${sx - 120},260 ${vx - 40},226`, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: k === 2 ? fade(u, 1.0) : 0.6, 'marker-end': 'url(#ra-ah)' }); }
      const ver = cur + 1, s = k === 1 ? pop(u, 1.2) : 1;
      card(sx, 300, 130, 44, { rx: 22, text: `요약 v${ver}`, fs: 15, fw: 800, stroke: GOOD, fill: GOODBG, color: GOOD, s });
      if (k === 2) sub(vx + 10, 352, '기존 요약 + 새 청크를 함께 보낸다', fade(u, 1.2), { 'font-size': 14.5 }); }
    if (k === 1) { sub(480, 380, '첫 청크는 그냥 요약한다 (Write a concise summary…)', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { const txt = (c.beat.finalText || '').replace(/^"|"$/g, ''); tx(60, 396, trunc(txt, 840, 14), { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { // refine_prompt 두 칸
      llm(RX(2), 222, 1, { stroke: WARN, fill: WARNBG });
      el('rect', { x: 60, y: 252, width: 840, height: 160, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      tx(76, 276, 'refine_prompt (기본 변수: existing_answer · text)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      [['[기존 요약]', '{existing_answer}', '요약 v2', GOOD], ['[새 본문]', '{text}', 'Chunk 3', WARN]].forEach(([h, slot, v, col], i) => { const y = 296 + i * 56, f = E(u, 0.5 + i * 0.5, 1.1 + i * 0.5);
        tx(76, y + 26, h, { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: 190, y, width: 690, height: 40, rx: 8, fill: f > 0.5 ? (i ? WARNBG : GOODBG) : PANEL, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': f >= 1 ? null : '6 5' });
        mono(206, y + 26, f > 0.5 ? (i ? 'Chunk 3 본문 (p.41-60)' : 'v2: 제품 개요와 시장 분석에 경쟁 차별점을 보강 중…') : slot, { 'font-size': 14, fill: col, 'font-weight': 700 }); });
      return; }
    if (k === 4) { // 앞 청크일수록 더 여러 번 다시 쓰인다
      tx(20, 196, '끝날 때까지 다시 고쳐 쓰이는 횟수', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      CH.forEach((d, i) => { const n = 4 - i; mono(RX(i), 160, i <= cur ? `다시 쓰기 ${n}번` : '', { 'font-size': 13.5, fill: n >= 3 ? BAD : MUT, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.15) }); });
      const x0 = 210, unit = 120, y1 = 372; tx(x0 - 14, y1 + 13, 'Refine', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: WARN, opacity: fade(u, 1.8) });
      CH.forEach((d, i) => { const f = E(u, 1.9 + i * 0.12, 2.1 + i * 0.12); if (f > 0) el('rect', { x: x0 + i * unit, y: y1, width: (unit - 4) * f, height: 18, rx: 4, fill: WARN, opacity: 0.8 }); });
      tx(x0 - 14, y1 + 43, 'MapReduce', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 2.3) });
      [0, 1].forEach((i) => el('rect', { x: x0 + i * unit, y: y1 + 30, width: (unit - 4) * E(u, 2.3, 2.5), height: 18, rx: 4, fill: ACC, opacity: 0.8 }));
      return; }
    // k5: 맞는 곳 / 안 맞는 곳
    [[250, '순서가 뜻을 가진 글', ['시간 순 회의록', '장편 소설', '사건 보고서·로그'], GOOD, true], [710, '서로 독립인 묶음', ['뉴스 기사 모음', '독립 보고서들', '→ MapReduce가 낫다'], BAD, false]].forEach(([x, h, items, col, ok], j) => { const s = pop(u, 0.2 + j * 0.5);
      card(x, 300, 400, 170, { rx: 14, stroke: col, sw: 2.2, s }); if (ok) check(x - 170, 240, 12, s); else cross(x - 170, 240, 11, s);
      tx(x - 146, 246, h, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + j * 0.5) });
      items.forEach((it, i) => tx(x - 170, 286 + i * 30, it, { 'font-size': 15, opacity: fade(u, 0.6 + j * 0.5 + i * 0.2) })); });
  }

  // ---------- 5. 비교 ----------
  const COLX = [380, 590, 800], COLN = ['Stuff', 'MapReduce', 'Refine'], COLC = [BAD, ACC, WARN];
  function header(op) { COLN.forEach((s, i) => { card(COLX[i], 96, 180, 40, { rx: 10, text: s, fs: 16, fw: 800, stroke: COLC[i], fill: i === 1 ? ACCBG : PANEL, color: COLC[i], op }); }); }
  function rowsTable(rows, u, t0) { rows.forEach(([name, vals, extra], r) => { const y = 160 + r * 58, op = fade(u, t0 + r * 0.4);
      el('line', { x1: 40, y1: y + 22, x2: 910, y2: y + 22, stroke: GRID, 'stroke-width': 1, opacity: op });
      tx(48, y + 6, name, { 'font-size': 15, 'font-weight': 700, opacity: op });
      vals.forEach((v, i) => { if (extra === 'steps') { const n = +v; for (let j = 0; j < n; j++) el('rect', { x: COLX[i] - 70 + j * 28, y: y - 10, width: 22, height: 20, rx: 4, fill: COLC[i], opacity: op * 0.85 }); mono(COLX[i] + 84, y + 6, v, { 'font-size': 15, 'font-weight': 800, fill: COLC[i], 'text-anchor': 'end', opacity: op }); }
        else mono(COLX[i], y + 6, v, { 'font-size': 15, 'font-weight': i === 1 ? 800 : 600, 'text-anchor': 'middle', fill: i === 1 ? ACC : INK, opacity: op }); }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { header(k === 0 ? fade(u, 0.1) : 1);
      if (k === 0) rowsTable([['LLM 호출 수', ['1', '5 + 1', '5']], ['입력 합계 (tok)', ['50,490', '≈51,500', '≈54,200']], ['호출당 최대 (tok)', ['50,490', '≈10,300', '누적 증가']], ['직렬 단계 수', ['1', '2', '5'], 'steps']], u, 0.3);
      else rowsTable([['품질', ['△', '◎', '○']], ['잃는 정보', ['중간 부분', '청크 경계 소량', '앞쪽 청크 약화']], ['병렬', ['―', 'batch', '불가 (직렬)']]], u, 0.2);
      sub(480, 406, k === 0 ? 'Refine 입력 합계는 예시 값' : '품질 기호는 이 페이지의 정리 (측정값 아님)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 2) { // 고르는 순서
      const n1 = [200, 120], n2 = [520, 240];
      card(n1[0], n1[1], 230, 50, { rx: 25, text: '문서 ≲ 6K 토큰?', fs: 16, fw: 800, s: pop(u, 0.2) });
      grow(n1[0], 146, n1[0], 280, E(u, 0.6, 1.0), BAD); tx(n1[0] + 10, 210, '예', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      card(n1[0], 306, 150, 46, { rx: 10, text: 'Stuff', fs: 17, fw: 800, stroke: BAD, color: BAD, s: pop(u, 1.0) });
      grow(316, 120, n2[0] - 20, n2[1] - 26, E(u, 1.0, 1.4), MUT); tx(400, 160, '아니오', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      card(n2[0], n2[1], 230, 50, { rx: 25, text: '청크끼리 독립?', fs: 16, fw: 800, s: pop(u, 1.4) });
      grow(636, 240, 740, 160, E(u, 1.8, 2.1), ACC); tx(668, 186, '예', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      card(830, 140, 190, 52, { rx: 10, text: 'MapReduce', fs: 17, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 2.0) }); sub(830, 186, '대부분은 여기', fade(u, 2.2), { 'font-size': 14 });
      grow(636, 250, 740, 330, E(u, 2.0, 2.3), WARN); tx(760, 300, '아니오 (순서 의존)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      card(830, 350, 160, 48, { rx: 10, text: 'Refine', fs: 17, fw: 800, stroke: WARN, color: WARN, s: pop(u, 2.3) }); return; }
    if (k === 3) { // chain_type 다이얼
      const cx = 220, cy = 240, r = 110, pos = [-150, -90, -30], f = E(u, 0.2, 2.2) * 2, a = f <= 1 ? lerp(pos[0], pos[1], E(f, 0, 1)) : lerp(pos[1], pos[2], E(f - 1, 0, 1));
      el('circle', { cx, cy, r, fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
      ['stuff', 'map_reduce', 'refine'].forEach((s, i) => { const ra = (pos[i] * Math.PI) / 180; el('circle', { cx: cx + Math.cos(ra) * (r - 16), cy: cy + Math.sin(ra) * (r - 16), r: 6, fill: COLC[i] });
        mono(cx + Math.cos(ra) * (r + 18), cy + Math.sin(ra) * (r + 18) + 5, s, { 'font-size': 14, 'font-weight': 700, fill: COLC[i], 'text-anchor': i === 0 ? 'end' : i === 1 ? 'middle' : 'start' }); });
      const ra = (a * Math.PI) / 180; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(ra) * (r - 24), y2: cy + Math.sin(ra) * (r - 24), stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }); el('circle', { cx, cy, r: 9, fill: INK });
      const cur = f < 0.5 ? 0 : f < 1.5 ? 1 : 2;
      mono(400, 210, 'load_summarize_chain(', { 'font-size': 17 }); mono(430, 244, 'llm,', { 'font-size': 17 });
      mono(430, 278, `chain_type="${['stuff', 'map_reduce', 'refine'][cur]}"`, { 'font-size': 17, 'font-weight': 800, fill: COLC[cur] }); mono(400, 312, ')', { 'font-size': 17 });
      sub(620, 372, '인자 하나만 바꿔 세 전략을 비교해 볼 수 있다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 4) { // 튜닝: map 은 작은 모델 여러 개, reduce 는 큰 모델 하나
      CH.forEach((d, i) => { const y = 110 + i * 56; chunk(110, y, 120, 44, d, 'mapped', { tok: false, s: pop(u, 0.2 + i * 0.1) }); grow(172, y, 250, y, E(u, 0.5, 0.8), INFO); llm(296, y, pop(u, 0.6 + i * 0.1), { text: 'mini', stroke: INFO, w: 80 }); grow(338, y, 470, 222, E(u, 1.1, 1.5), GOOD, { plain: true, sw: 1.6 }); });
      llm(530, 222, pop(u, 1.5), { text: '상위 모델', w: 120, stroke: ACC, fill: ACCBG });
      tx(300, 410, 'map ×5', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); tx(530, 268, 'reduce ×1', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      [['chunk_size', '모델별 안정 구간에 맞춘다 (경험칙)'], ['chunk_overlap', '200~400 토큰으로 경계 보존'], ['map 단계', '항상 batch + max_concurrency'], ['비용', '많이 도는 map 은 작은 모델']].forEach(([a, b], i) => { const y = 120 + i * 62, op = fade(u, 1.8 + i * 0.15);
        mono(650, y, a, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op }); tx(650, y + 22, b, { 'font-size': 14, fill: MUT, opacity: op }); });
      return; }
    // k5: 기본값은 MapReduce
    header(1);
    [['50,490', 'lost in the middle', '50K 한 번'], ['≈51,500', '병렬 · 품질 안정', '기본 선택'], ['≈54,200', '순서 보존 · 느림', '시계열 글']].forEach(([a, b, d], i) => { const s = pop(u, 0.3 + i * 0.3);
      card(COLX[i], 220, 190, 120, { rx: 12, stroke: COLC[i], sw: i === 1 ? 3.5 : 2, fill: i === 1 ? ACCBG : PANEL, s });
      mono(COLX[i], 200, a, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: COLC[i], opacity: fade(u, 0.4 + i * 0.3) });
      tx(COLX[i], 228, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5 + i * 0.3) });
      tx(COLX[i], 256, d, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: COLC[i], opacity: fade(u, 0.6 + i * 0.3) }); });
    tx(48, 226, '입력 합계', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
    R.banner(590, 350, '50K 문서의 기본값은 MapReduce', pop(u, 1.6));
  }

  const quiz = [
    { q: '50,490 토큰 문서를 stuff로 한 번에 보낼 때 가장 큰 문제는 무엇인가?',
      o: ['128K 컨텍스트를 넘어서 호출이 실패한다', '들어는 가지만 길어서 중간 내용을 놓치기 쉽다', '입력 토큰 비용이 나눠 보낼 때의 50배가 된다'], a: 1,
      why: '50,490은 128K 안에 들어간다. 입력 합계도 MapReduce(≈51,500)와 비슷하다. 한 호출이 너무 길어 중간 정보를 놓치기 쉬운 것이 문제다.' },
    { q: 'PyPDFLoader로 읽은 100쪽 docs를 5개 청크로 나누려면 어떻게 해야 하나?',
      o: ['쪽을 한 문자열로 이은 뒤 토큰 기준 splitter로 자른다', 'split_documents(docs)에 chunk_size=8000을 준다', 'docs[:5]처럼 앞의 다섯 쪽만 쓴다'], a: 0,
      why: 'split_documents는 쪽마다 따로 자르므로 100개가 나온다. 이은 문자열을 chunk_size=10,500 토큰으로 자르면 5개가 된다.' },
    { q: 'Reduce 단계의 프롬프트가 작은 이유는 무엇인가?',
      o: ['원문 대신 Map이 만든 요약 5개(~1,000 tok)만 받기 때문이다', 'Reduce는 작은 모델을 쓰기 때문이다', 'Reduce가 청크 하나만 골라 보기 때문이다'], a: 0,
      why: 'Map 입력 합계는 50,490이지만 Reduce는 부분 요약만 이어 붙인 ~1,000 토큰을 받는다.' },
    { q: 'Refine이 MapReduce보다 느린 까닭은 무엇인가?',
      o: ['청크마다 더 큰 모델을 쓰기 때문이다', '청크 수가 더 많기 때문이다', '앞 요약이 나와야 다음 호출을 할 수 있어 5번을 차례로 기다리기 때문이다'], a: 2,
      why: 'Refine은 기존 요약 + 새 청크를 넣는 직렬 루프라 5단계를 차례로 거친다. MapReduce는 map 병렬 1단계 + reduce 1단계다.' },
    { q: '청크끼리 서로 독립인 30K 토큰 보고서 묶음이라면 무엇을 고르나?',
      o: ['Stuff', 'MapReduce', 'Refine'], a: 1,
      why: '6K를 넘으니 stuff는 아니고, 순서 의존이 없으니 refine일 이유도 없다. 독립 청크면 병렬로 도는 MapReduce가 기본이다.' },
  ];

  const summary = [
    '50,490 토큰을 stuff로 한 번에 보내면 들어는 가지만 중간 내용을 놓치기 쉽다.',
    '쪽을 이어 토큰 기준으로 자르면 5개 청크가 되고, map은 batch로 동시에 돈다.',
    'Reduce는 부분 요약 ~1,000 토큰만 받아 최종 요약을 만든다. 입력 합계는 stuff와 비슷하다.',
    'Refine은 순서를 지키지만 5번을 차례로 돈다. 독립 청크라면 MapReduce가 기본이다.',
  ];
  const review = [
    { q: 'map 단계를 batch로 바꿨는데 순차 실행과 시간이 거의 같다. 먼저 의심할 것은?',
      o: ['max_concurrency가 1이거나 API rate limit에 막혔다', 'chunk_overlap이 너무 작다', 'reduce_prompt가 너무 길다'], a: 0,
      why: '병렬 이득은 동시에 몇 개를 보낼 수 있느냐에 달렸다. 동시 호출 수가 1로 묶이면 5개가 차례로 돈다.' },
    { q: '시간 순 회의록을 MapReduce로 요약했더니 결정이 뒤바뀐 순서로 정리됐다. 무엇으로 바꿔 볼까?',
      o: ['Stuff로 바꾸고 chunk_size를 키운다', 'Refine으로 바꿔 앞에서부터 차례로 흡수한다', 'reduce만 상위 모델로 바꾼다'], a: 1,
      why: 'MapReduce는 청크를 따로 요약해 순서 정보가 약해진다. Refine은 기존 요약에 다음 청크를 이어 붙여 고쳐 쓴다.' },
    { q: '팀원이 "stuff는 토큰 비용이 50배라 안 된다"고 했다. 맞는 답은?',
      o: ['맞다. 한 호출이 길면 단가가 오른다', '틀리다. stuff가 MapReduce보다 5배 싸다', '틀리다. 입력 합계는 stuff 50,490, MapReduce ≈51,500으로 비슷하다'], a: 2,
      why: 'MapReduce도 원문 전체를 map에서 한 번씩 읽는다. 차이는 비용보다 호출 하나의 길이와 품질, 병렬 여부에 있다.' },
  ];

  R.page({ title: '긴 문서 요약 전략', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
