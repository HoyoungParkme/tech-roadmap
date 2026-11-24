/* V-1-1 Context Stuffing — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * chunk 토큰·score·주목도·prompt 크기는 STEPS 의 beat 데이터(chunks / prompt / answer)를 읽는다.
 * 주목도 92·74·38·60·88 은 페이지의 예시값, LLM 응답은 모두 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, dot, dbIcon, check, cross, snippet, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const short = (ch) => (ch.title.includes(' — ') ? ch.title.split(' — ')[1] : ch.title);
  const impCol = (ch) => (ch.importance === 'critical' ? ACC : ch.importance === 'mid' ? WARN : OFF);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // chunk 카드: id·score / 제목 / 토큰. 테두리 색 = 중요도(핵심 ACC · 보통 WARN · 낮음 회색)
  function chunkCard(cx, cy, ch, o) { o = o || {}; const w = o.w || 140, h = o.h || 70, col = impCol(ch);
    const st = o.bad ? { stroke: BAD, fill: BADBG, dash: '6 4' } : o.lost ? { stroke: OFF, fill: SOFT, dash: '4 4' } : { stroke: col, fill: ch.importance === 'critical' ? ACCBG : PANEL };
    const g = card(cx, cy, w, h, { rx: 9, stroke: st.stroke, fill: st.fill, dash: st.dash, sw: ch.importance === 'critical' ? 2.6 : 1.8, s: o.s, op: o.op });
    const op = o.lost ? 0.55 : 1;
    tx(-w / 2 + 10, -h / 2 + 20, ch.id, { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: o.bad ? BAD : INK, opacity: op }, g);
    mono(w / 2 - 10, -h / 2 + 20, ch.score.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: op }, g);
    tx(-w / 2 + 10, 6, short(ch), { 'font-size': 13.5, 'font-weight': 600, opacity: op, 'text-decoration': o.bad ? 'line-through' : null }, g);
    mono(-w / 2 + 10, h / 2 - 9, ch.tokens + ' tok', { 'font-size': 13.5, fill: MUT, opacity: op }, g);
    if (ch.importance === 'critical' && !o.noTag) tx(w / 2 - 10, h / 2 - 9, '핵심', { 'font-size': 13.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: op }, g);
    return g; }

  // 토큰 막대: segs [{id, tok, col, u}] 를 앞에서부터 쌓는다. limit 선 = 윈도우 한계
  function tokBar(x, y, w, max, limit, segs, o) { o = o || {}; const h = o.h || 30, X = (v) => x + (v / max) * w;
    el('rect', { x, y, width: w, height: h, rx: 5, fill: SOFT, stroke: GRID, 'stroke-width': 1.2 });
    let acc = 0;
    segs.forEach((s) => { const len = s.tok * clamp(s.u ?? 1); if (len <= 0) { return; }
      const x0 = X(acc), x1 = X(acc + len), over = acc + len > limit;
      el('rect', { x: x0 + 1, y: y + 2, width: Math.max(0, x1 - x0 - 2), height: h - 4, rx: 3, fill: s.col || ACC, opacity: s.dim ? 0.35 : 0.85 });
      if ((s.u ?? 1) >= 1 && x1 - x0 > 34) mono((x0 + x1) / 2, y + h / 2 + 5, s.id, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: PANEL });
      acc += len; });
    const lx = X(limit);
    el('line', { x1: lx, y1: y - 10, x2: lx, y2: y + h + 8, stroke: INK, 'stroke-width': 2.2, 'stroke-dasharray': '5 3' });
    if (o.limitLabel !== false) mono(lx, y + h + 24, `윈도우 ${limit}`, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': lx > x + w - 60 ? 'end' : 'middle' });
    return { X, used: acc }; }

  // LLM 응답 상자 (예시). u 만큼 타이핑
  function answerBox(y, ans, u, o) { o = o || {}; const ok = ans.ok, w = o.w || 820, x = 480 - w / 2;
    card(480, y, w, 60, { rx: 10, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, sw: 2, s: o.s });
    tx(x + 16, y - 9, ok ? 'LLM 응답 (예시) ✓' : 'LLM 응답 (예시) ✗', { 'font-size': 13.5, 'font-weight': 800, fill: ok ? GOOD : BAD, opacity: o.s ?? 1 });
    const t = ans.text.replace(/\s*\(←.*\)$/, ''), n = Math.round(t.length * clamp(u));
    tx(x + 16, y + 17, t.slice(0, n), { 'font-size': 15, 'font-weight': 600, opacity: o.s ?? 1 }); }

  // ---------- 1. Naive stuffing ----------
  const CX1 = [290, 460, 630];
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    pill(480, 32, '질문: 연차 휴가 며칠 쓸 수 있나요?', INK, k === 0 ? pop(u, 0.2) : 1, { fs: 14 });
    dbIcon(90, 128, 'vectorstore', { s: 0.85 });
    pill(90, 206, 'k = 3', ACC, k === 0 ? pop(u, 0.6) : 1, { mono: true });
    card(868, 128, 116, 64, { rx: 10, text: 'LLM\ngpt-4o-mini', fs: 14, stroke: INFO, color: INFO, s: k === 0 ? pop(u, 1.0) : 1 });
    const chs = b.chunks || [];
    chs.forEach((ch, i) => { const s = k === 1 ? pop(u, 0.5 + i * 0.35) : 1;
      if (k === 1) dot([[130, 128], [CX1[i] - 70, 128]], seg(u, 0.1 + i * 0.35, 0.6 + i * 0.35), ACC, 6);
      chunkCard(CX1[i], 128, ch, { s });
      if (k === 4 && ch.importance === 'critical') check(CX1[i] + 58, 84, 10, pop(u, 1.4 + i * 0.3)); });
    // 토큰 막대 0 → 780 → 900
    tx(120, 238, 'prompt 토큰 윈도우 (1k)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const segs = chs.map((ch, i) => ({ id: ch.id, tok: ch.tokens, col: ACC, u: k === 2 ? E(u, 0.3 + i * 0.5, 0.8 + i * 0.5) : k > 2 ? 1 : 0 }));
    if (k >= 3) segs.push({ id: '지시+질문', tok: 120, col: INFO, u: k === 3 ? E(u, 0.3, 1.2) : 1 });
    if (k === 2) chs.forEach((ch, i) => dot([[CX1[i], 163], [CX1[i], 250]], seg(u, 0.1 + i * 0.5, 0.5 + i * 0.5), ACC, 6));
    tokBar(120, 250, 720, 1000, 1000, segs, {});
    const used = Math.round(tween(p.prompt ? p.prompt.used : 0, k === 2 ? 780 : b.prompt.used, u));
    mono(840, 238, `${used} / 1000 tok`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: used > 1000 ? BAD : INK });
    if (k === 3) sub(700, 330, '남은 자리 100 tok', fade(u, 1.4), { 'font-size': 14, 'font-weight': 700, fill: GOOD });
    if (k === 4) answerBox(356, b.answer, E(u, 0.4, 2.2), { s: pop(u, 0.2) });
    else if (k < 3) sub(480, 356, k === 0 ? '검색 전: chunk 도 prompt 도 비어 있다' : k === 1 ? 'score 순으로 3개가 돌아왔다' : 'score 순 그대로 join → context 780 tok', fade(u, 1.6), { 'font-size': 15 }); }

  // ---------- 2. Token overflow ----------
  const pos8 = (i) => ({ x: 150 + (i % 4) * 220, y: 64 + Math.floor(i / 4) * 76 });
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {}, chs = b.chunks;
    chs.forEach((ch, i) => { const q = pos8(i), over = ch.state === 'overflow';
      chunkCard(q.x, q.y, ch, { w: 190, h: 64, s: k === 0 ? pop(u, 0.2 + i * 0.18) : 1, bad: over && (k > 2 || (k === 2 && u > 0.4 + (i - 3) * 0.25)) }); });
    if (k === 2) pill(pos8(6).x, 188, 'C7: "5일 연속" 단서도 밖', WARN, pop(u, 1.8), { fs: 13.5, fill: WARNBG });
    if (k === 3) pill(pos8(6).x, 188, 'C7: "5일 연속" 단서도 밖', WARN, 1, { fs: 13.5, fill: WARNBG });
    tx(100, 186, 'k = 3 → 8', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: k === 0 ? fade(u, 1.8) : 1 });
    const fill = k === 0 ? 0 : k === 1 ? E(u, 0.2, 2.2) : 1;
    let acc = 0; const segs = chs.map((ch) => { const s0 = acc / 1960; acc += ch.tokens; const s1 = acc / 1960;
      return { id: ch.id, tok: ch.tokens, col: ch.state === 'overflow' && k >= 2 ? BAD : ACC, u: clamp((fill - s0) / (s1 - s0)) }; });
    segs.unshift({ id: '지시', tok: 120, col: INFO, u: k === 0 ? 0 : 1 });
    const bar = tokBar(100, 214, 760, 2100, 1000, segs, {});
    const used = Math.round(k === 0 ? 0 : k === 1 ? 120 + 1960 * fill : b.prompt.used);
    mono(860, 202, `${used} / 1000 tok`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: used > 1000 ? BAD : INK });
    if (k >= 1 && used > 1000) { const x0 = bar.X(1000), x1 = bar.X(used);
      el('rect', { x: x0, y: 210, width: x1 - x0, height: 38, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.4 });
      if (k >= 2 || u > 2.2) mono((x0 + x1) / 2, 272, `초과 +${used - 1000} tok`, { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 2.2) : 1 }); }
    if (k === 1) sub(281, 272, '120 + 1960 = 2080', fade(u, 1.6), { 'font-size': 14, 'font-weight': 700, fill: INK });
    if (k === 2) sub(281, 272, 'C1~C3 만 안전선 안', fade(u, 0.4), { 'font-size': 14, 'font-weight': 700, fill: GOOD });
    if (k === 3) { terminal(60, 292, 520, 116, [['>>> llm.invoke(prompt)', null], ['openai.BadRequestError:', BAD], ["maximum context length is 1000 tokens,", null], ['however you requested 2080 tokens.', null]], E(u, 0.1, 1.4) * 4, { fs: 13.5 });
      [['(a) k 를 3~5 로 줄인다', ACC], ['(b) chunk_size 를 줄인다', ACC], ['(c) 압축·재정렬 (IV-2)', ACC], ['(d) Map-Reduce / Refine', ACC]].forEach(([s, col], i) =>
        note(610, 312 + i * 26, s, fade(u, 1.4 + i * 0.25), { fill: col })); } }

  // ---------- 3·4 공통: 다섯 자리 + 예시 주목도 ----------
  const SX = (i) => 160 + i * 160, POSN = ['시작', '1/4', '중간', '3/4', '끝'], CY = 104, BASE = 268;
  function slots(c, o) { o = o || {}; const { k, u } = c, chs = c.beat.chunks, prev = c.k > 0 && c.prev ? c.prev.chunks : null;
    POSN.forEach((s, i) => tx(SX(i), 52, s, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
    const m = o.move ? E(u, 0.3, 1.6) : 1;
    chs.forEach((ch, i) => { const j = prev ? prev.findIndex((x) => x.id === ch.id) : i, from = j < 0 ? i : j;
      const x = lerp(SX(from), SX(i), m), y = CY - (from !== i ? Math.sin(Math.PI * m) * 34 : 0);
      chunkCard(x, y, ch, { s: k === 0 ? pop(u, 0.2 + i * 0.2) : 1, lost: o.lost && ch.state === 'low-attn' && ch.importance === 'critical' }); }); }
  function attnBars(c, u0, o) { o = o || {}; const chs = c.beat.chunks;
    const att = chs.map((ch, i) => ch.attention ?? [92, 74, 38, 60, 88][i]);
    tx(80, 292, o.title || '위치별 주목도 (예시값)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    const pts = [];
    att.forEach((a, i) => { const g = E(u0, i * 0.12, 0.5 + i * 0.12), h = a * 0.82 * g, x = SX(i), lo = a < 50;
      el('rect', { x: x - 26, y: BASE - h, width: 52, height: h, rx: 4, fill: lo ? OFF : ACC, opacity: (o.op ?? 1) * (lo ? 0.6 : 0.8) });
      if (g > 0.6) mono(x, BASE - h - 8, a + '%', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: lo ? BAD : INK, opacity: o.op ?? 1 });
      pts.push([x, BASE - a * 0.82]); });
    el('line', { x1: 80, y1: BASE, x2: 880, y2: BASE, stroke: GRID, 'stroke-width': 1.5 });
    if (u0 > 0.7 && !o.noCurve) { const n = clamp((u0 - 0.7) / 0.5) * (pts.length - 1), seg0 = Math.floor(n);
      const ps = pts.slice(0, seg0 + 1); if (seg0 < pts.length - 1) ps.push([lerp(pts[seg0][0], pts[seg0 + 1][0], n - seg0), lerp(pts[seg0][1], pts[seg0 + 1][1], n - seg0)]);
      el('polyline', { points: ps.map((q) => q.join(',')).join(' '), fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: o.op ?? 1 }); }
    return att; }

  // ---------- 3. Lost in the middle ----------
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    slots(c, { move: k === 1, lost: k >= 2 });
    if (k <= 1) { tx(120, 234, 'prompt 토큰 윈도우', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      if (k === 0) pill(330, 229, '1k → 2k 모델', WARN, pop(u, 0.9), { fs: 13.5, fill: WARNBG });
      let acc = 0; const fill = k === 1 ? E(u, 0.6, 2.2) : 0;
      const segs = [{ id: '지시', tok: 120, col: INFO, u: k === 1 ? clamp(fill * 1370 / 120) : 0 }].concat(b.chunks.map((ch) => { const s0 = (acc += 0, 120 + acc); acc += ch.tokens; return { id: ch.id, tok: ch.tokens, col: ACC, u: clamp((fill * 1370 - s0) / ch.tokens) }; }));
      tokBar(120, 250, 720, 2000, 2000, segs, {});
      const used = Math.round(k === 1 ? 1370 * fill : 0);
      mono(840, 234, `${used} / 2000 tok`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
      if (k === 0) sub(480, 340, 'score 내림차순 C1 ~ C5 · 120 + 1250 = 1370 tok 이라 2k 에 들어간다', fade(u, 1.4), { 'font-size': 15 });
      if (k === 1) { sub(480, 340, '실험: 정답 chunk C1(연 15일)을 가운데에 놓는다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: ACC });
        grow(SX(0), 152, SX(2) - 6, 152, E(u, 0.4, 1.4), ACC, { plain: true }); }
      return; }
    const att = attnBars(c, k === 2 ? E(u, 0.2, 1.6) : 1);
    if (k === 2) { pill(SX(2), 166, 'C1 LOST · 38%', BAD, pop(u, 1.9), { fs: 13.5, fill: BADBG }); return; }
    pill(SX(2), 166, 'C1 LOST · 38%', BAD, 1, { fs: 13.5, fill: BADBG });
    answerBox(352, b.answer, E(u, 0.3, 1.8), { s: pop(u, 0.1) });
    if (u > 2.0) tx(872, 369, '"15일" 없음', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }

  // ---------- 4. Priority sort ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    slots(c, { move: k === 1 || k === 2 });
    if (k === 0) { pill(SX(4), 166, 'score 꼴찌인데 단서 있음', WARN, pop(u, 1.4), { fs: 13.5, fill: WARNBG });
      sub(480, 230, '테두리 초록 = 핵심(critical) · 주황 = 보통 · 회색 = 낮음', fade(u, 1.8), { 'font-size': 14 });
      sub(480, 300, 'score 순서와 실제 중요도는 다르다', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { attnBars(c, 1, { op: fade(u, 1.6) * 0.5, title: '이대로 넣으면 (예시 주목도)', noCurve: true });
      pill(SX(2), 166, 'C7 이 38% 자리로', BAD, pop(u, 2.0), { fs: 13.5, fill: BADBG }); return; }
    attnBars(c, k === 2 ? E(u, 0.9, 2.3) : 1);
    if (k >= 2) b.chunks.forEach((ch, i) => { if (ch.importance === 'critical' && ch.attention >= 70) check(SX(i) + 52, 66, 9, k === 2 ? pop(u, 2.2) : 1); });
    if (k === 2) { sub(480, 300, 'u_shape_arrange: 0·2·4번째는 앞에서, 1·3번째는 뒤에서부터', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3) { const fill = E(u, 0.3, 2.0); tx(120, 320, 'prompt 1420 / 2000 tok', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      let acc = 120; const segs = [{ id: '지시', tok: 120, col: INFO, u: fill > 0 ? 1 : 0 }].concat(b.chunks.map((ch) => { const s0 = acc; acc += ch.tokens; return { id: ch.id, tok: ch.tokens, col: ch.importance === 'critical' ? ACC : OFF, u: clamp((120 + fill * 1300 - s0) / ch.tokens) }; }));
      tokBar(120, 330, 720, 2000, 2000, segs, { limitLabel: false });
      sub(480, 392, '재료는 Step 3 과 같고 순서만 다르다', fade(u, 1.8), { 'font-size': 15 }); return; }
    answerBox(352, b.answer, E(u, 0.3, 2.0), { s: pop(u, 0.1) }); }

  // ---------- 5. Map-Reduce / Refine ----------
  const PART = ['연 15일', '7일 전 결재', '휴양소 가능', '해당 없음', '해당 없음', '휴직은 별도', '5일 연속 가능', '경조사 별도'];
  const CY5 = (i) => 58 + i * 42, MX = 296, PX = 470, RX = 680, FX = 850;
  function chips(chs, s) { chs.forEach((ch, i) => card(92, CY5(i), 150, 32, { rx: 7, text: `${ch.id} ${short(ch)}`, fs: 13.5, stroke: impCol(ch), fill: ch.importance === 'critical' ? ACCBG : PANEL, sw: 1.8, s: s ? s(i) : 1 })); }
  function diagram(k, u, show) { // show: 0~1 화살표 자라기
    for (let i = 0; i < 8; i++) { const y = CY5(i), g = E(show, i * 0.06, 0.5 + i * 0.06);
      grow(168, y, MX - 30, y, g, MUT, { sw: 1.6 });
      card(MX, y, 56, 26, { rx: 6, text: 'LLM', fs: 13.5, stroke: INFO, color: INFO, sw: 1.6, op: clamp(g * 2) });
      grow(MX + 30, y, PX - 58, y, E(show, 0.3 + i * 0.06, 0.8 + i * 0.06), MUT, { sw: 1.6 }); }
    tx(MX, 28, 'map ×8', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(show * 3, 0.2) });
    tx(RX, 140, 'reduce ×1', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(show * 3, 1.5) });
    card(RX, 205, 104, 56, { rx: 10, text: 'LLM\nreduce', fs: 14, stroke: INFO, color: INFO, sw: 2.2, op: clamp(show * 3 - 1.5) }); }
  function s5(t, c) { const { k, u } = c, chs = c.beat.chunks;
    chips(chs, (i) => (k === 0 ? pop(u, 0.2 + i * 0.12) : 1));
    if (k === 0) { tx(300, 120, '8개 = 1960 tok + 지시 120 = 2080 tok', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      let acc = 0; const segs = [{ id: '지시', tok: 120, col: INFO, u: fade(u, 1.3) }].concat(chs.map((ch) => { acc += ch.tokens; return { id: ch.id, tok: ch.tokens, col: ACC, u: E(u, 1.3, 2.3) }; }));
      tokBar(300, 150, 560, 2100, 1000, segs, {});
      note(300, 260, '1k 윈도우 한 장에 다 못 넣는다', fade(u, 2.2), { fill: BAD });
      note(300, 292, 'stuffing 대신 나눠서 부른다', fade(u, 2.4)); return; }
    if (k === 2) { const m = snippet(300, 40, ['map_prompt = """다음 chunk 만 보고', '질문에 부분 답을 작성하시오.', '{chunk}', '질문: {question}"""'], { op: fade(u, 0.2) });
      const r = snippet(300, 236, ['reduce_prompt = """아래는 여러 부분 답이다.', '이를 종합해 최종 답을 작성하시오.', '{partial_answers}', '질문: {question}"""'], { op: fade(u, 1.1) });
      grow(170, CY5(1), 296, 112, E(u, 0.5, 1.1), ACC); tx(310 + m.w, 112, 'chunk 하나씩 · 8번', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      tx(310 + r.w, 308, '부분 답 8개를 한 번에', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); return; }
    diagram(k, u, k === 1 ? E(u, 0.2, 1.8) : 1);
    pill(840, 34, 'LLM 호출 8 + 1 = 9회', WARN, k === 1 ? pop(u, 2.0) : 1, { fs: 14, fill: WARNBG });
    // 부분 답 칸
    for (let i = 0; i < 8; i++) { const y = CY5(i), s = k === 1 ? 0 : k === 3 ? pop(u, 0.5 + i * 0.22) : 1, label = PART[i];
      if (k === 1) card(PX + 8, y, 120, 26, { rx: 13, stroke: GRID, dash: '4 4', sw: 1.4, op: fade(u, 1.0) });
      if (k === 3) dot([[168, y], [MX, y], [PX - 58, y]], seg(u, 0.1 + i * 0.22, 0.7 + i * 0.22), ACC, 5);
      if (k >= 3) card(PX + 8, y, tw(label, 13.5) + 24, 26, { rx: 13, text: label, fs: 13.5, fw: 700, stroke: label === '해당 없음' ? OFF : ACC, color: label === '해당 없음' ? MUT : ACC, sw: 1.6, s }); }
    if (k === 1) { for (let i = 0; i < 8; i++) grow(PX + 70, CY5(i), RX - 54, 205, E(u, 1.5, 2.3), GRID, { plain: true, sw: 1.2 }); sub(PX + 8, 400, '부분 답 자리', fade(u, 1.2)); }
    if (k === 3) { tx(PX + 8, 400, '부분 답 8개 (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 4) { for (let i = 0; i < 8; i++) dot([[PX + 40, CY5(i)], [RX - 52, 205]], seg(u, 0.3 + i * 0.12, 1.1 + i * 0.12), ACC, 5);
      const s = pop(u, 1.6); card(FX, 205, 190, 150, { rx: 10, stroke: GOOD, fill: GOODBG, sw: 2.2, s });
      grow(RX + 54, 205, FX - 96, 205, E(u, 1.4, 1.8), GOOD);
      ['최종 답 (예시)', '연 15일 (1년 이상 근속)', '7일 전 결재', '최대 5일 연속 사용'].forEach((ln, i) => tx(FX - 82, 160 + i * 28, ln, { 'font-size': i ? 14.5 : 13.5, 'font-weight': i ? 700 : 800, fill: i ? INK : GOOD, opacity: fade(u, 1.9 + i * 0.15) }));
      note(560, 404, 'Refine: C1 → C2 → … → C8 순서로 답을 고쳐 쓴다 (8회, 차례대로)', fade(u, 2.3), { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle' }); } }

  const quiz = [
    { q: 'top-3 chunk를 score 순으로 붙인 prompt가 900 토큰이었다. 이 900은 무엇으로 이루어졌나?',
      o: ['chunk 3개 780 토큰과 지시·질문 120 토큰', 'chunk 3개만 900 토큰', 'LLM 응답 토큰까지 합친 값'], a: 0,
      why: 'C1 280 + C2 260 + C3 240 = 780이고, 시스템 지시와 질문 120을 더해 900이 된다. 1k 윈도우에 100이 남는다.' },
    { q: 'k를 8로 늘렸더니 2080 토큰이 되었다. 1k 윈도우 모델에서 생기는 일은?',
      o: ['LLM이 알아서 중요한 chunk만 골라 읽는다', '호출이 거부되거나 뒤쪽 chunk가 잘려 C7의 단서도 사라진다', '토큰이 많을수록 답이 더 정확해진다'], a: 1,
      why: '1080 토큰이 넘쳐 context_length_exceeded가 난다. 잘라 넣으면 C4부터 밖으로 밀려 "5일 연속" 단서를 가진 C7도 빠진다.' },
    { q: 'Lost in the Middle 실험에서 같은 C1을 넣었는데 "15일"이 답에서 빠진 이유는?',
      o: ['C1의 score가 낮아서', '토큰이 윈도우를 넘어서', 'C1이 주목도가 가장 낮은 가운데 자리에 놓여서'], a: 2,
      why: '1370 토큰으로 2k 윈도우에는 들어갔지만, 예시 주목도 38%인 가운데 자리에 놓인 chunk를 LLM이 놓쳤다.' },
    { q: 'importance로 정렬한 [C1, C2, C7, C3, C5]를 u_shape_arrange에 넣으면 가운데에는 무엇이 오나?',
      o: ['C7', 'C5', 'C2'], a: 1,
      why: '짝수 번째(C1·C7·C5)를 앞에, 홀수 번째(C2·C3)를 뒤집어 뒤에 붙여 C1·C7·C5·C3·C2가 된다. 가운데는 low인 C5다.' },
    { q: 'chunk 8개를 Map-Reduce로 처리할 때 LLM은 모두 몇 번 호출되나?',
      o: ['1번', '8번', '9번'], a: 2,
      why: 'chunk마다 map 1번씩 8번, 부분 답을 모으는 reduce 1번을 더해 9번이다. 토큰 한계는 피하지만 호출 비용이 는다.' },
  ];

  const summary = [
    'top-3 chunk를 score 순으로 붙이면 900 토큰으로 1k 윈도우에 들어가고 답도 맞는다.',
    'k를 8로 늘리면 2080 토큰이 되어 호출이 거부되거나 뒤쪽 chunk가 잘린다.',
    '윈도우 안에 들어가도 가운데에 놓인 chunk는 놓치기 쉬워서 핵심을 앞과 끝에 둔다.',
    '한 prompt에 다 못 넣으면 Map-Reduce로 나눠 부르고, 호출은 chunk 수 + 1번이 된다.',
  ];
  const review = [
    { q: 'k=5로 바꿔 토큰 문제는 없어졌는데, 정답 chunk가 들어 있어도 답이 자꾸 빠진다. 먼저 의심할 것은?',
      o: ['정답 chunk가 가운데 자리에 있다', '윈도우가 아직 모자라다', 'retriever의 k가 너무 작다'], a: 0,
      why: '토큰이 들어가도 가운데 자리는 덜 본다. 중요도 순으로 정렬한 뒤 핵심을 앞과 끝으로 옮기는 재배치를 먼저 해 본다.' },
    { q: '규정 문서 300개를 모두 근거로 써야 하는 요약 작업이다. 어떤 방식이 맞나?',
      o: ['k=300으로 한 prompt에 전부 넣는다', 'top-3만 넣고 나머지는 버린다', 'Map-Reduce로 부분 답을 모아 합친다'], a: 2,
      why: '한 prompt에 넣으면 윈도우를 넘고, top-3만 쓰면 근거가 빠진다. Map-Reduce는 호출이 늘지만 모든 문서를 반영한다.' },
    { q: 'score가 0.61로 가장 낮은 C7에 "최대 5일 연속" 단서가 있었다. 이 사실이 알려 주는 것은?',
      o: ['score가 낮으면 늘 버려도 된다', '유사도와 실제 중요도는 다를 수 있다', 'k를 줄이면 정답이 늘 들어온다'], a: 1,
      why: '유사도는 질문과 비슷한 정도일 뿐 답에 필요한 정도가 아니다. 그래서 Step 4는 rerank 점수로 다시 정렬한 뒤 배치한다.' },
  ];

  R.page({ title: 'Context Stuffing — 토큰 윈도우와 배치', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
