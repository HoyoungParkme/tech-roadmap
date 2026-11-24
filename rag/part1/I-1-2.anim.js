/* I-1-2 RAG란 무엇인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 위쪽 띠: 페이지 데이터 pipeline(activeNodes·activeEdges)을 그대로 점등한다.
 * 아래: 닫힌 책 답변 → 벡터 KB 에서 top-3 회수(코사인 점수) → 템플릿 슬롯 채우기(토큰 수) → 생성 → 출처와 근거 일치.
 * 점수 0.95/0.87/0.61, 정확도 18%/94%, LLM 답변은 페이지의 예시 값이다(실제 호출 결과가 아니다).
 * 98 tok 는 tiktoken o200k_base(gpt-4o-mini 토크나이저)로 조립된 prompt 본문을 직접 센 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cross, check, lock, person, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 ----------
  const at = (c) => (kk, a, d = 0.6) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a, a + d) : 0);
  function wrap(s, maxW, fs) { const out = []; let line = '';
    for (const w of String(s).split(' ')) { const t = line ? line + ' ' + w : w; if (tw(t, fs) > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out; }
  function bubble(x, y, w, text, o) { o = o || {}; const fs = o.fs || 15, lines = wrap(text, w - 28, fs), h = lines.length * (fs + 7) + 20, op = o.op ?? 1;
    if (op <= 0.01) return h; const g = R.G(0, 0, 1, op);
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2 }, g);
    lines.forEach((l, i) => tx(x + 14, y + 14 + fs * 0.85 + i * (fs + 7), l, { 'font-size': fs, fill: o.color || INK, 'font-weight': o.fw || 500 }, g));
    if (o.tag) { const tw2 = tw(o.tag, 13.5) + 16; el('rect', { x: x + w - tw2 - 8, y: y - 12, width: tw2, height: 22, rx: 11, fill: o.tagFill || WARNBG, stroke: o.tagCol || WARN, 'stroke-width': 1.5 }, g);
      tx(x + w - tw2 / 2 - 8, y + 4, o.tag, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.tagCol || WARN }, g); }
    return h; }
  function chip(cx, cy, name, o) { o = o || {}; const w = o.w || 150, h = o.h || 54, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.stroke || INK;
    for (let i = 0; i < 4; i++) { const yy = -h / 2 + 10 + i * ((h - 20) / 3); el('line', { x1: -w / 2 - 8, y1: yy, x2: -w / 2, y2: yy, stroke: col, 'stroke-width': 2.5 }, g); el('line', { x1: w / 2, y1: yy, x2: w / 2 + 8, y2: yy, stroke: col, 'stroke-width': 2.5 }, g); }
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    tx(0, 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g); return g; }
  // 정확도 게이지 (페이지 예시 값)
  function gauge(x, y, w, v0, v1, u, label) { const v = tween(v0, v1, u), col = v >= 90 ? GOOD : BAD;
    tx(x, y - 10, label, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('rect', { x, y, width: w, height: 18, rx: 9, fill: SOFT }); el('rect', { x, y, width: w * v / 100, height: 18, rx: 9, fill: col });
    mono(x + w + 10, y + 15, `${Math.round(v)}%`, { 'font-size': 17, 'font-weight': 800, fill: col }); }

  // ---------- 위쪽 파이프라인 띠 ----------
  const NODES = [['question', '질문', 70], ['retriever', 'Retriever', 215], ['kb', 'KB', 350], ['context', 'Context', 490], ['llm', 'LLM', 640], ['answer', '답변', 800]];
  const NX = Object.fromEntries(NODES.map(([id, , x]) => [id, x]));
  function strip(c) { const p = c.beat.pipeline, pv = c.prev ? c.prev.pipeline : null, Y = 30;
    const isNew = (id, arr) => pv && !pv[arr].includes(id), on = (id) => p.activeEdges.includes(id), lit = (id) => p.activeNodes.includes(id);
    const seg = (a, b, id) => { const nw = isNew(id, 'activeEdges'), f = on(id) ? (nw ? E(c.u, 0.2, 0.9) : 1) : 0;
      el('line', { x1: NX[a] + 40, y1: Y, x2: NX[b] - 40, y2: Y, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': p.ragOff && id !== 'llm-a' ? '4 4' : null });
      if (f > 0) el('line', { x1: NX[a] + 40, y1: Y, x2: lerp(NX[a] + 40, NX[b] - 40, f), y2: Y, stroke: ACC, 'stroke-width': 3 }); };
    seg('question', 'retriever', 'q-retriever'); seg('retriever', 'kb', 'retriever-kb'); seg('kb', 'context', 'retriever-context'); seg('context', 'llm', 'context-llm'); seg('llm', 'answer', 'llm-a');
    if (p.activeEdges.includes('q-llm')) { const f = isNew('q-llm', 'activeEdges') ? E(c.u, 0.2, 1.0) : 1;
      el('path', { d: `M${NX.question + 30},${Y - 12} Q${(NX.question + NX.llm) / 2},${Y - 42} ${NX.llm - 30},${Y - 12}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': `${f * 700} 700` }); }
    NODES.forEach(([id, name, x]) => { const L = lit(id), nw = isNew(id, 'activeNodes'), off = p.ragOff && ['retriever', 'kb', 'context'].includes(id);
      pill(x, Y, name, L ? ACC : MUT, nw ? 0.6 + 0.4 * R.pop(c.u, 0.4) : 1, { fs: 14, fill: L ? ACCBG : PANEL, color: L ? ACC : off ? OFF : MUT }); });
    if (p.ragOff) mono(940, 36, 'rag=OFF', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700 }); }
  const QTEXT = '우리 회사의 2026년 연봉 인상률은?';
  const DOCS = (c) => c.beat.kb ? c.beat.kb.retrieved : [];

  // =========================================================
  // 1. 닫힌 책 — 질문만 LLM 에 보낸다
  // =========================================================
  function s1(t, c) { const { k, u } = c, p = at(c); strip(c);
    bubble(50, 90, 360, QTEXT, { stroke: INFO, op: k === 0 ? fade(u, 0.2) : 1, fs: 16 });
    mono(60, 158, 'question = "..."', { 'font-size': 14, fill: MUT, opacity: k === 0 ? fade(u, 0.7) : 1 });
    // 오른쪽: 실제 답이 있는 사내 KB — 닫혀 있다
    const kbx = 770, kby = 170; el('rect', { x: kbx - 110, y: kby - 70, width: 220, height: 140, rx: 12, fill: SOFT, stroke: GRID, 'stroke-dasharray': '6 5', 'stroke-width': 2, opacity: k === 0 ? fade(u, 1.0) : 1 });
    lock(kbx, kby - 20, true, MUT, k === 0 ? pop(u, 1.2) : 1);
    tx(kbx, kby + 22, '사내 보상 정책', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 1.2) : 1 });
    tx(kbx, kby + 46, '학습에 없음', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 1.4) : 1 });
    // LLM 에 그대로
    const go = p(1, 0.2, 1.0);
    chip(480, 230, 'gpt-4o-mini', { op: k === 0 ? 0.25 : 1 });
    if (k === 1) fly(230, 140, 480, 200, E(u, 0.3, 1.4), '질문만', { fill: INFO });
    if (go > 0) { const g = R.G(480, 300, 1, go); el('path', { d: 'M-46,-16 L0,-6 L46,-16 L46,18 L0,28 L-46,18 Z', fill: PANEL, stroke: INK, 'stroke-width': 2 }, g); el('line', { x1: 0, y1: -6, x2: 0, y2: 28, stroke: INK, 'stroke-width': 2 }, g);
      tx(480, 348, '클로즈드 북 — 외부 정보 없음', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: go }); }
    // 답 (예시) + 정확도 게이지
    const an = p(2, 0.3);
    if (an > 0) { bubble(560, 260, 370, '"일반적으로 한국 기업 평균은 3~5% 입니다."', { op: an, stroke: BAD, tag: '답변 예시', tagCol: BAD, tagFill: BADBG });
      pill(745, 340, '실제 정책은 4.5%', BAD, k === 2 ? pop(u, 1.4) : 1, { fs: 14.5, fill: BADBG });
      gauge(560, 392, 280, k === 2 ? 0 : 18, 18, k === 2 ? u - 0.8 : 3, '정확도 (예시)'); }
    if (k === 3) { ['cutoff 이후 내용', '사내 비공개 데이터', 'long-tail 사실'].forEach((s, i) => pill(140, 260 + i * 44, `${i + 1}) ${s}`, BAD, pop(u, 0.2 + i * 0.4), { fs: 14.5, fill: BADBG }));
      grow(880, 245, 880, 125, E(u, 1.6, 2.2), GOOD);
      tx(kbx, kby - 82, '이 KB 를 함께 보낸다 = RAG', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) }); } }

  // =========================================================
  // 2. Retrieval — 12,480건 벡터 KB 에서 가까운 3건
  // =========================================================
  const GC = 26, GR = 10;
  function kbGrid(x0, y0, o) { o = o || {}; const fill = o.fill ?? 1, hi = o.hi || [];
    for (let r = 0; r < GR; r++) for (let q = 0; q < GC; q++) { const i = r * GC + q, s = clamp(fill * GC * GR - i); if (s <= 0) continue; const h = hi.indexOf(i);
      el('rect', { x: x0 + q * 14, y: y0 + r * 14, width: 11, height: 11, rx: 2, fill: h >= 0 ? ACC : o.dim ? GRID : OFF, opacity: h >= 0 ? 1 : (o.dim ? 0.6 : 0.85) * s }); } }
  const HIT = [57, 113, 190];
  function s2(t, c) { const { k, u } = c, p = at(c); strip(c);
    if (k >= 3) return s2hits(t, c);
    const fill = k === 0 ? E(u, 0.3, 2.0) : 1;
    kbGrid(540, 110, { fill });
    lbl(722, 268, '벡터 KB · FAISS', 1, {});
    mono(722, 296, `${Math.round(12480 * fill).toLocaleString()} docs`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    sub(722, 322, '칸 하나 ≈ 문서 48건', fade(fill, 0.9, 0.1), { 'font-size': 13.5 });
    const rt = p(1, 0.2);
    if (rt > 0) { card(220, 150, 300, 96, { rx: 12, stroke: INFO, fill: INFOBG, s: k === 1 ? pop(u, 0.2) : 1 });
      if (rt > 0.5) { lbl(220, 132, 'Retriever', 1, { fill: INFO }); mono(220, 160, 'search_type="similarity"', { 'font-size': 14, 'text-anchor': 'middle' }); mono(220, 184, 'k = 3', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO }); } }
    if (k === 2) { bubble(70, 240, 330, QTEXT, { stroke: INFO, op: fade(u, 0.1) });
      const v = [0.6, 0.25, 0.9, 0.4, 0.7, 0.15]; v.forEach((h, i) => { const s = fade(u, 0.7 + i * 0.1); el('rect', { x: 110 + i * 30, y: 350 - 40 * h, width: 22, height: 40 * h, rx: 3, fill: INFO, opacity: s }); });
      mono(290, 345, '… 1536차원', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.3) });
      sub(205, 380, '질문 임베딩 (text-embedding-3-small)', fade(u, 1.0), { 'font-size': 13.5 });
      dot([[300, 330], [420, 300], [540, 200]], clamp((u - 1.4) / 1.0), INFO, 8); } }
  function s2hits(t, c) { const { k, u } = c, docs = DOCS(c);
    if (k === 3) { // 임베딩 공간: 질문 벡터와 문서 벡터 사이 각도 = 점수(코사인)
      const O = [90, 360], L = 250, qa = 50 * Math.PI / 180;
      el('line', { x1: O[0], y1: O[1], x2: O[0] + 330, y2: O[1], stroke: GRID, 'stroke-width': 1.5 }); el('line', { x1: O[0], y1: O[1], x2: O[0], y2: O[1] - 300, stroke: GRID, 'stroke-width': 1.5 });
      const ray = (ang, len, col, f, w) => el('line', { x1: O[0], y1: O[1], x2: O[0] + Math.cos(ang) * len * f, y2: O[1] - Math.sin(ang) * len * f, stroke: col, 'stroke-width': w || 3, 'stroke-linecap': 'round' });
      ray(qa, L + 20, INFO, E(u, 0.2, 0.7), 4); if (u > 0.7) tx(O[0] + Math.cos(qa) * (L + 30), O[1] - Math.sin(qa) * (L + 30) - 4, '질문', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      const side = [-1, 1, -1];
      docs.forEach((d, i) => { const ang = qa + side[i] * Math.acos(d.score), f = E(u, 0.6 + i * 0.35, 1.1 + i * 0.35), col = i < 2 ? ACC : MUT;
        ray(ang, L - 10 * i, col, f); if (f > 0.9) tx(O[0] + Math.cos(ang) * (L - 10 * i + 12), O[1] - Math.sin(ang) * (L - 10 * i + 12) + 5, `#${i + 1}`, { 'font-size': 15, 'font-weight': 800, fill: col }); });
      sub(220, 400, '각도가 좁을수록 점수(코사인)가 높다', fade(u, 1.8), { 'font-size': 14 }); }
    else { kbGrid(70, 120, { dim: true, hi: HIT });
      lbl(252, 280, '12,480건 중 3건', fade(u, 0.3), { 'font-size': 16, fill: ACC });
      sub(252, 306, '전부 읽지 않고 가까운 것만', fade(u, 0.8), { 'font-size': 14.5 }); }
    // 오른쪽: 결과 목록 (점수 = 페이지 예시 값)
    tx(470, 100, 'top-3 결과 (점수는 예시 값)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    docs.forEach((d, i) => { const y = 118 + i * 92, s = k === 3 ? fade(u, 0.7 + i * 0.35) : 1, col = i < 2 ? ACC : MUT;
      el('rect', { x: 470, y, width: 450, height: 78, rx: 10, fill: PANEL, stroke: i < 2 ? ACC : GRID, 'stroke-width': 1.8, opacity: s });
      tx(486, y + 26, d.title, { 'font-size': 15, 'font-weight': 800, fill: INK, opacity: s });
      tx(486, y + 50, d.snippet, { 'font-size': 14, fill: MUT, opacity: s });
      const bw = 140 * d.score * (k === 3 ? E(u, 0.9 + i * 0.35, 1.6 + i * 0.35) : 1);
      el('rect', { x: 740, y: y + 58, width: 140, height: 10, rx: 5, fill: SOFT, opacity: s }); el('rect', { x: 740, y: y + 58, width: bw, height: 10, rx: 5, fill: col, opacity: s });
      mono(905, y + 30, d.score.toFixed(2), { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: s }); });
    if (k === 4) for (let i = 0; i < 3; i++) { const q = HIT[i] % GC, r = Math.floor(HIT[i] / GC); fly(70 + q * 14, 120 + r * 14, 470, 157 + i * 92, E(u, 0.2 + i * 0.25, 1.0 + i * 0.25), `#${i + 1}`, { fill: ACC }); } }

  // =========================================================
  // 3. Augmented — 템플릿 슬롯에 자료와 질문을 끼운다
  // =========================================================
  const TPL = ['아래 [참고 자료]에 근거해서만 답하세요.', '자료에 없으면 "정보 없음"이라고 답하세요.', '', '[참고 자료]', '{context}', '', '[질문] {question}'];
  function s3(t, c) { const { k, u } = c, p = at(c), ctx = c.beat.context; strip(c);
    const X = 60, Y = 80, W = 480;
    el('rect', { x: X, y: Y, width: W, height: 300, rx: 12, fill: PANEL, stroke: k >= 1 ? WARN : GRID, 'stroke-width': k >= 1 ? 2.5 : 1.5 });
    if (k >= 1) { const s = k === 1 ? pop(u, 0.3) : 1; pill(X + W - 110, Y, 'ChatPromptTemplate', WARN, s, { fs: 13.5, fill: WARNBG, mono: true }); }
    const typed = k === 0 ? clamp((u - 0.2) / 1.8) * TPL.length : TPL.length;
    TPL.forEach((ln, i) => { const s = clamp(typed - i); if (s <= 0 || !ln) return; const y = Y + 34 + i * 34;
      if (ln === '{context}') { const filled = k === 3 ? E(u, 0.9, 1.5) : 0;
        el('rect', { x: X + 18, y: y - 22, width: W - 36, height: 32 + (filled > 0 ? 34 * filled : 0), rx: 6, fill: filled > 0 ? GOODBG : SOFT, stroke: filled > 0 ? GOOD : WARN, 'stroke-dasharray': filled > 0.99 ? null : '5 4', 'stroke-width': 1.5 });
        if (filled < 0.5) mono(X + 30, y, '{context}', { 'font-size': 15, 'font-weight': 700, fill: WARN });
        else ctx.docs.forEach((d, j) => tx(X + 30, y + j * 30, d.length > 30 ? d.slice(0, 30) + '…' : d, { 'font-size': 14, fill: GOOD, 'font-weight': 600, opacity: fade(filled, 0.5, 0.4) }));
        return; }
      if (ln.startsWith('[질문]')) { const filled = k === 3 ? E(u, 1.4, 1.9) : 0, yy = y + (k === 3 ? 34 * E(u, 0.9, 1.5) : 0);
        tx(X + 18, yy, '[질문]', { 'font-size': 15, 'font-weight': 700, opacity: s });
        if (filled < 0.5) mono(X + 78, yy, '{question}', { 'font-size': 15, 'font-weight': 700, fill: WARN }); else tx(X + 78, yy, QTEXT, { 'font-size': 14.5, fill: GOOD, 'font-weight': 600 });
        return; }
      tx(X + 18, y, ln, { 'font-size': 15, fill: ln.startsWith('[') ? INK : MUT, 'font-weight': ln.startsWith('[') ? 700 : 500, opacity: s }); });
    // 오른쪽: 검색된 문서 3건 → 0.61 은 잘린다
    if (k >= 2) DOCS(c).forEach((d, i) => { const y = 100 + i * 82, cut = d.used === false, cf = k === 2 ? E(u, 0.8, 1.4) : 1, gone = k === 3 && !cut ? E(u, 0.3, 0.9) : 0;
      const g = R.G(0, 0, 1, cut ? 1 - 0.6 * cf : 1 - 0.75 * gone);
      el('rect', { x: 600, y, width: 320, height: 64, rx: 10, fill: PANEL, stroke: cut ? GRID : ACC, 'stroke-width': 1.8 }, g);
      tx(616, y + 26, d.title, { 'font-size': 15, 'font-weight': 800 }, g); mono(904, y + 26, d.score.toFixed(2), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: cut ? MUT : ACC }, g);
      tx(616, y + 50, d.snippet, { 'font-size': 14, fill: MUT }, g);
      if (cut && cf > 0) { el('line', { x1: 596, y1: y + 32, x2: lerp(596, 924, cf), y2: y + 32, stroke: BAD, 'stroke-width': 3 }); }
      if (k === 3 && !cut) fly(600, y + 32, X + 200, Y + 170, E(u, 0.2 + i * 0.2, 1.0 + i * 0.2), `[${i + 1}]`, { fill: GOOD }); });
    if (k === 2) sub(760, 370, 'docs[:2] — 0.61 짜리는 컷', fade(u, 1.4), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
    if (k === 3) { fly(760, 360, X + 140, Y + 270, E(u, 1.2, 1.8), '질문', { fill: INFO });
      mono(760, 360, `${Math.round(tween(0, ctx.tokens, u - 0.9))} tok`, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
      sub(760, 392, 'o200k_base 로 센 prompt 본문', fade(u, 2.0), { 'font-size': 13.5 }); }
    if (k === 0) sub(780, 230, '규칙 + 빈 슬롯 두 개', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 1) sub(780, 230, '객체가 됐지만 슬롯은 아직 비어 있다', fade(u, 0.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 4. Generation — 오픈북으로 답을 쓴다
  // =========================================================
  function s4(t, c) { const { k, u } = c, p = at(c); strip(c);
    if (k === 4) { // 세 가지 효과
      [['정확도 급상승', '자기 기억이 아니라 prompt 자료를 읽음'], ['환각 감소', '"정보 없음"도 정직하게 말할 수 있음'], ['최신성 확보', 'KB 만 갱신하면 재학습 불필요']].forEach(([a, b], i) => {
        const y = 110 + i * 90, s = pop(u, 0.2 + i * 0.5); check(110, y, 14, s); tx(140, y + 6, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.5) }); tx(300, y + 6, b, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); });
      pill(480, 390, 'temperature=0 — 자료에 붙어 일관되게 답한다', INFO, pop(u, 1.9), { fs: 14.5, fill: INFOBG }); return; }
    // 체인: prompt | llm | parser
    const parts = [['prompt', WARN, 150], ['llm', ACC, 400], ['StrOutputParser', INFO, 680]], ch = p(1, 0.2);
    parts.forEach(([s, col, x], i) => { const on = i === 1 || ch > 0, sc = i === 1 ? (k === 0 ? pop(u, 0.2) : 1) : k === 1 ? pop(u, 0.2 + i * 0.3) : 1;
      if (on) card(x, 140, i === 2 ? 210 : 150, 54, { rx: 12, text: s, mono: true, fs: 16, stroke: col, color: col, s: sc, op: i !== 1 && ch === 0 ? 0 : 1 });
      if (i < 2 && ch > 0) mono(x + (i === 0 ? 125 : 147), 147, '|', { 'font-size': 26, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: ch }); });
    // temperature 다이얼
    const dg = R.G(400, 230, 1); el('path', { d: 'M-40,0 A40,40 0 0 1 40,0', fill: 'none', stroke: GRID, 'stroke-width': 6 }, dg);
    const ang = Math.PI; el('line', { x1: 0, y1: 0, x2: Math.cos(ang) * 34, y2: -Math.sin(ang) * 34, stroke: ACC, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, dg);
    mono(400, 256, 'temperature = 0', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    if (k === 0) sub(400, 300, '모델만 준비됨 — 아직 호출 전, 답변 칸은 비어 있다', fade(u, 0.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k === 1) sub(400, 300, '세 조각이 파이프로 이어져 rag_chain 이 된다', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    if (k >= 2) { for (let i = 0; i < 4; i++) dot([[150, 168], [150, 200], [330, 200], [400, 168]], k === 2 ? clamp((u - 0.2 - i * 0.3) / 1.2) : 0, WARN, 6);
      if (k === 2) { sub(400, 300, '자료가 박힌 prompt 가 LLM 으로 흘러간다', fade(u, 0.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }
    if (k >= 3) { const typed = k === 3 ? clamp((u - 0.2) / 1.4) : 1, A = c.beat.answer, shown = A.slice(0, Math.round(A.length * typed));
      el('rect', { x: 60, y: 290, width: 560, height: 70, rx: 12, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 });
      wrap(shown, 530, 15).forEach((ln, i) => tx(76, 318 + i * 24, ln, { 'font-size': 15, fill: INK, 'font-weight': 600 }));
      pill(560, 290, '답변 예시', WARN, 1, { fs: 13.5, fill: WARNBG });
      gauge(660, 330, 200, k === 3 ? 18 : 94, 94, k === 3 ? u - 1.0 : 3, '정확도 (예시)'); } }

  // =========================================================
  // 5. 출처 — 답의 숫자가 어느 문서에서 왔는지 잇는다
  // =========================================================
  function s5(t, c) { const { k, u } = c, p = at(c), cit = c.beat.citations || []; strip(c);
    const docs = DOCS(c).filter((d) => d.used);
    if (k <= 2) { // 문서에 [1] [2] 번호
      docs.forEach((d, i) => { const y = 92 + i * 70; el('rect', { x: 60, y, width: 380, height: 56, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 1.8 });
        const s = k === 0 ? pop(u, 0.4 + i * 0.4) : 1; card(88, y + 28, 40, 34, { rx: 6, text: `[${i + 1}]`, mono: true, fs: 15, fill: ACC, stroke: ACC, color: PANEL, s });
        tx(118, y + 24, d.title, { 'font-size': 15, 'font-weight': 800 }); tx(118, y + 46, d.snippet, { 'font-size': 14, fill: MUT }); });
      if (k === 0) sub(250, 260, 'format_docs_with_id — 출처 표기의 재료', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 1 || k === 2) { // 두 갈래: context 는 답변 생성으로, docs 는 그대로 보관
      const f = k === 1 ? E(u, 0.3, 1.4) : 1;
      grow(450, 120, 450 + 160 * f, 120, 1, ACC, { plain: true }); grow(450, 190, 450 + 160 * f, 190, 1, INFO, { plain: true });
      card(700, 120, 170, 44, { rx: 10, text: '"context" → 답변', fs: 14.5, stroke: ACC, color: ACC, s: k === 1 ? pop(u, 1.2) : 1 });
      card(700, 190, 170, 44, { rx: 10, text: '"docs" 원본 보관', fs: 14.5, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 1.5) : 1 });
      if (k === 1) for (let i = 0; i < 2; i++) dot([[450, 120 + i * 70], [615, 120 + i * 70]], clamp((u - 1.4 - i * 0.2) / 0.8), i ? INFO : ACC, 6); }
    if (k === 2) { // 결과 딕셔너리
      const keys = [['question', INK], ['context', ACC], ['docs', INFO], ['answer', GOOD]];
      el('rect', { x: 520, y: 250, width: 380, height: 150, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 }); mono(536, 272, 'result = {', { 'font-size': 15, fill: MUT });
      keys.forEach(([kk, col], i) => { const s = i === 3 ? fade(u, 1.0) : 1; mono(556 + (i % 2) * 170, 304 + Math.floor(i / 2) * 32, `"${kk}"`, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); });
      if (u > 1.0) pill(840, 380, '+ assign', GOOD, pop(u, 1.0), { fs: 13.5, fill: GOODBG });
      mono(536, 388, '}', { 'font-size': 15, fill: MUT }); sub(250, 330, 'RunnablePassthrough.assign(answer=…)', fade(u, 0.6), { 'font-size': 14, fill: INK, class: 'mono' }); }
    if (k >= 3) { // 답변 + 출처 + 근거 일치
      const A1 = '2026년 기본 연봉 인상률은 ', A2 = '4.5%', A3 = '이며, 성과 등급에 따라 ', A4 = '0~3%', A5 = '가 추가로 적용됩니다.';
      el('rect', { x: 50, y: 90, width: 860, height: 66, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      R.spans(70, 130, [[A1, { fill: INK }], [A2, { fill: ACC, 'font-weight': 800 }], [A3, { fill: INK }], [A4, { fill: INFO, 'font-weight': 800 }], [A5, { fill: INK }]], { 'font-size': 16, class: null, style: 'white-space:pre' });
      pill(860, 90, '답변 예시', WARN, 1, { fs: 13.5, fill: WARNBG });
      const x2 = 70 + tw(A1, 16) + tw(A2, 16) / 2, x4 = 70 + tw(A1 + A2 + A3, 16) + tw(A4, 16) / 2;
      cit.forEach((ci, i) => { const nw = !(c.prev && c.prev.citations && c.prev.citations.length > i), s = nw ? pop(u, 0.3) : 1, y = 240 + i * 82, col = i ? INFO : ACC, src = i ? x4 : x2;
        card(260, y, 420, 64, { rx: 10, stroke: col, s });
        if (s > 0.5) { mono(70, y + 6, `[${ci.id}]`, { 'font-size': 17, 'font-weight': 800, fill: col }); tx(110, y - 6, ci.title, { 'font-size': 15, 'font-weight': 800 }); mono(110, y + 18, ci.source, { 'font-size': 13.5, fill: MUT }); }
        const lf = k === 4 ? E(u, 0.9 + i * 0.4, 1.5 + i * 0.4) : 0; if (lf > 0) { el('path', { d: `M${src},160 C${src},200 ${lerp(src, 480, 0.5)},${y - 10} 470,${y}`, fill: 'none', stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': `${lf * 600} 600` }); } });
      if (k === 3) sub(720, 250, '근거 문서를 직접 열어 볼 수 있다', fade(u, 1.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      if (k === 4) { mono(800, 300, `근거 일치 ${u > 1.9 ? 2 : u > 1.5 ? 1 : 0} / 2`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: u > 1.9 ? GOOD : INK });
        sub(800, 330, '답의 숫자마다 출처 문서가 있다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); pill(800, 380, '추적 가능 · traceable', GOOD, pop(u, 2.1), { fs: 15, fill: GOODBG }); } } }

  const quiz = [
    { q: '사내 연봉 인상률을 LLM 단독으로 물었을 때 생기는 일은 무엇인가?',
      o: ['학습한 적 없는 사실이라 일반론을 지어내거나 모른다고 한다', '사내 KB를 스스로 찾아 정확히 답한다', '질문을 거부하고 오류를 낸다'], a: 0,
      why: '외부 정보 없이 질문만 보내는 닫힌 책 상태다. 실제 정책 4.5% 대신 평균 3~5% 같은 일반론이 나온다.' },
    { q: 'Retriever가 12,480건 KB에서 3건만 돌려주는 기준은 무엇인가?',
      o: ['문서가 최근에 저장된 순서', '질문 벡터와 문서 벡터가 가까운 정도(유사도 점수)', '문서 제목의 글자 수'], a: 1,
      why: '질문을 같은 임베딩 모델로 벡터로 바꾸고 가장 가까운 top-k를 고른다. 예시에서는 0.95, 0.87, 0.61 순이었다.' },
    { q: 'augment 단계에서 템플릿에 실제로 채워 넣는 두 가지는 무엇인가?',
      o: ['모델 이름과 temperature', '임베딩 벡터와 점수', '검색된 자료(context)와 사용자 질문(question)'], a: 2,
      why: '템플릿에는 근거 규칙과 {context}·{question} 두 슬롯이 있다. 점수 0.61 문서는 잘라 내고 상위 2건만 넣었다.' },
    { q: 'RAG 체인에서 LLM이 답을 만들 때 근거로 삼는 것은 무엇인가?',
      o: ['prompt 안에 끼워 넣은 참고 자료', '학습 때 외운 일반 지식만', '이전 대화의 답변'], a: 0,
      why: 'prompt | llm | parser 체인은 자료가 박힌 prompt를 LLM에 넘긴다. 그래서 4.5%와 0~3%가 그대로 답에 나온다.' },
    { q: '답변에 [1], [2] 출처를 붙이면 무엇이 좋아지는가?',
      o: ['답변 생성 속도가 두 배가 된다', '사용자가 답의 근거 문서를 직접 열어 확인할 수 있다', '모델이 더 이상 검색하지 않아도 된다'], a: 1,
      why: 'docs를 따로 보관해 답 옆에 출처를 붙인다. 숫자마다 근거 문서가 있으니 의심될 때 추적할 수 있다.' },
  ];

  const summary = [
    'LLM에게 질문만 보내면 학습하지 않은 사내 정보는 일반론으로 답한다.',
    '질문을 벡터로 바꿔 KB에서 가장 가까운 문서 몇 건만 찾아온다.',
    '찾은 자료와 질문을 템플릿 슬롯에 넣어 근거만 보고 답하라고 지시한다.',
    '자료를 읽고 만든 답에 출처 번호를 붙이면 근거를 따라가 확인할 수 있다.',
  ];
  const review = [
    { q: 'RAG를 붙였는데도 답에 엉뚱한 매출 이야기가 섞였다. 먼저 의심할 것은?',
      o: ['temperature가 0이라서', '점수가 낮은 문서까지 context에 들어갔다', '출처 번호를 붙이지 않아서'], a: 1,
      why: '관련도가 낮은 0.61짜리 경영실적 문서가 context에 들어가면 답에 섞일 수 있다. 상위 문서만 남기면 줄어든다.' },
    { q: '규정이 바뀌어 새 공지를 KB에 넣었다. 답이 새 규정으로 바뀌려면 무엇이 필요한가?',
      o: ['모델을 다시 학습시킨다', 'prompt 템플릿 문구를 고친다', '새 문서가 임베딩되어 KB에서 검색되면 된다'], a: 2,
      why: 'RAG의 답은 검색된 자료에서 나온다. KB만 갱신하면 재학습 없이 다음 질문부터 새 문서가 context로 들어간다.' },
    { q: '감사팀이 답의 4.5%가 어디서 왔는지 묻는다. 체인을 어떻게 만들어야 하나?',
      o: ['검색된 docs를 답과 함께 남겨 출처로 보여 준다', '답변만 돌려주고 검색 로그는 지운다', '자료 없이 질문만 다시 보내 확인한다'], a: 0,
      why: 'docs 키로 원본을 보관하고 answer를 assign으로 더하면 답과 출처가 한 결과에 담긴다. 숫자와 문서를 이어 확인할 수 있다.' },
  ];

  R.page({ title: 'RAG — 검색·증강·생성', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
