/* III-2-1 RAG Chain — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 사내 문서 5개(CORPUS)·질문·검색 결과는 페이지 데이터와 같다. 점수와 LLM 답변 문장은 예시다.
 * 체인 모양(단계별 타입, RunnableParallel → RunnableAssign, 결과 dict 키)은 langchain-core 0.3.86 에서 가짜 LLM 으로 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, person, cross, check, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const DOCS = [
    { id: 'D1', src: '휴가정책.pdf', page: 3, text: '정규직 연차는 연 15일, 반차/반반차로 분할 사용 가능하다.' },
    { id: 'D2', src: '휴가정책.pdf', page: 7, text: '입사 1년 미만 직원은 매월 1일씩 연차가 발생한다.' },
    { id: 'D3', src: '복리후생.pdf', page: 2, text: '근속 3년 차부터 리프레시 휴가 3일이 별도 부여된다.' },
    { id: 'D4', src: '취업규칙.pdf', page: 11, text: '경조 휴가는 사유에 따라 1~5일 별도로 신청한다.' },
    { id: 'D5', src: '복리후생.pdf', page: 9, text: '식대 보조는 월 15만원, 야근 시 별도 식권을 지급한다.' },
  ];
  const Q = '우리 회사 휴가 정책이 뭐야?';
  const SCORE = { D1: 0.92, D2: 0.87, D3: 0.74 };

  // ---------- 지역 도우미 ----------
  const trunc = (s, w, fs) => { s = String(s); if (tw(s, fs) <= w) return s; while (s.length && tw(s + '…', fs) > w) s = s.slice(0, -1); return s + '…'; };
  const wrapW = (s, w, fs) => { const out = []; let line = '';
    String(s).split(' ').forEach((word) => { const cand = line ? line + ' ' + word : word; if (tw(cand, fs) > w && line) { out.push(line); line = word; } else line = cand; });
    if (line) out.push(line); return out; };
  // 왼쪽 위 기준 말풍선. o.f(0→1) 만큼 글자가 찍힌다
  function bubble(x, y, w, text, o) { o = o || {}; const fs = o.fs || 14.5, lines = wrapW(text, w - 28, fs), op = o.op ?? 1;
    const h = lines.length * (fs + 7) + 20 + (o.title ? 24 : 0);
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    let yy = y + 10; if (o.title) { tx(x + 14, yy + 15, o.title, { 'font-size': 13.5, 'font-weight': 800, fill: o.stroke || INK, opacity: op }); yy += 24; }
    let left = Math.round(lines.join('').length * clamp(o.f ?? 1));
    lines.forEach((ln, i) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length; if (part) tx(x + 14, yy + fs + 2 + i * (fs + 7), part, { 'font-size': fs, fill: o.color || INK, opacity: op }); });
    return h; }
  // 문서 조각 카드 (왼쪽 위 기준)
  function docCard(x, y, w, d, o) { o = o || {}; const h = o.h || 56, op = o.op ?? 1, hot = o.hot, col = hot ? ACC : o.dim ? OFF : INK;
    const g = el('g', { transform: `translate(${x + (o.dx || 0)} ${y})`, opacity: op });
    el('path', { d: `M0,0 H${w - 14} L${w},14 V${h} H0 Z`, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.5 : 1.6 }, g);
    el('path', { d: `M${w - 14},0 V14 H${w}`, fill: 'none', stroke: hot ? ACC : GRID, 'stroke-width': 1.6 }, g);
    if (o.badge !== false) { el('rect', { x: 8, y: 8, width: 36, height: 22, rx: 5, fill: hot ? ACC : SOFT }, g);
      mono(26, 24, d.id, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: hot ? PANEL : MUT }, g); }
    const x0 = o.badge === false ? 10 : 52;
    mono(x0, 24, `${d.src} · p.${d.page}`, { 'font-size': 13.5, fill: hot ? ACC : MUT }, g);
    tx(x0, 46, trunc(d.text, w - x0 - 10, 14), { 'font-size': 14, fill: col }, g);
    return g; }
  function star(cx, cy, r, col, s) { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; pts.push([cx + Math.cos(a) * rr * s, cy + Math.sin(a) * rr * s]); }
    el('polygon', { points: pts.map((p) => p.join(',')).join(' '), fill: col, stroke: PANEL, 'stroke-width': 1.5 }); }
  function llmBox(cx, cy, o) { o = o || {}; const g = card(cx, cy, o.w || 190, o.h || 78, { rx: 14, stroke: o.stroke || INK, sw: 2.5, fill: o.fill || PANEL, s: o.s, op: o.op });
    tx(0, -6, 'LLM', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: o.stroke || INK }, g);
    mono(0, 18, o.sub || 'ChatOpenAI · gpt-4o-mini', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  // 맨 위 파이프라인 띠: 질문 → Retriever → Context → LLM → Source
  const ST = ['질문', 'Retriever', 'Context', 'LLM', 'Source'];
  function strip(lit, cur, closed, op) { op = op ?? 1;
    ST.forEach((s, i) => { const x = 110 + i * 175, off = closed && (i === 1 || i === 2 || i === 4), on = lit.includes(i), now = cur === i;
      card(x, 30, 124, 32, { rx: 16, text: s, fs: 14, fw: 700, dash: off ? '5 4' : null, sw: 1.8, op,
        stroke: off ? OFF : on ? ACC : GRID, fill: now ? ACC : on ? ACCBG : PANEL, color: off ? OFF : now ? PANEL : on ? ACC : MUT });
      if (i < 4) el('line', { x1: x + 68, y1: 30, x2: x + 107, y2: 30, stroke: lit.includes(i + 1) && on ? ACC : GRID, 'stroke-width': 2, opacity: op, 'marker-end': lit.includes(i + 1) && on ? 'url(#ra-ahb)' : 'url(#ra-ah)' }); }); }
  const upto = (n) => [...Array(n + 1).keys()];
  // 프롬프트 틀: 줄 목록 [text, {hl, warn}] 과 {context}/{question} 칸
  function slotBox(x, y, w, h, name, f, op) { el('rect', { x, y, width: w, height: h, rx: 8, fill: f > 0 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': f >= 1 ? null : '6 5', opacity: op ?? 1 });
    if (f <= 0) mono(x + w / 2, y + h / 2 + 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: op ?? 1 }); }

  // ---------- 1. 클로즈드북 ----------
  function closedBook(cx, cy, s, op) { const g = el('g', { transform: `translate(${cx} ${cy}) scale(${s})`, opacity: op });
    el('rect', { x: -56, y: -72, width: 112, height: 144, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 2.5 }, g);
    el('line', { x1: -42, y1: -72, x2: -42, y2: 72, stroke: INK, 'stroke-width': 2 }, g);
    tx(8, 6, '교과서', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }, g); }
  function openBook(cx, cy, s, op) { const g = el('g', { transform: `translate(${cx} ${cy}) scale(${s})`, opacity: op });
    el('path', { d: 'M0,-60 Q-60,-76 -120,-60 V70 Q-60,56 0,70 Z', fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M0,-60 Q60,-76 120,-60 V70 Q60,56 0,70 Z', fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }, g);
    [-30, -6, 18, 42].forEach((y) => { el('line', { x1: -104, y1: y, x2: -18, y2: y, stroke: GRID, 'stroke-width': 3 }, g); el('line', { x1: 18, y1: y, x2: 104, y2: y, stroke: y === -6 ? ACC : GRID, 'stroke-width': y === -6 ? 5 : 3 }, g); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 4) { // 오픈북 예고
      const f = E(u, 0.2, 1.6); strip(upto(4).filter((i) => f * 5 > i), null, false);
      closedBook(220, 190, 1, 1); cross(262, 112, 20, pop(u, 0.3)); lbl(220, 290, '클로즈드북: 기억만으로', 1, { fill: BAD });
      openBook(560, 180, pop(u, 0.5), 1); lbl(560, 290, '오픈북: 펼쳐 보고 답한다', fade(u, 0.7), { fill: ACC });
      [['1', '질문 받기'], ['2', '사내 문서에서 관련 쪽 검색'], ['3', '그 쪽을 펼쳐 보고 답 쓰기']].forEach(([n, s], i) => { const y = 330 + i * 28, op = fade(u, 1.0 + i * 0.35);
        el('circle', { cx: 434, cy: y - 5, r: 11, fill: ACC, opacity: op }); tx(434, y, n, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: PANEL, opacity: op });
        tx(454, y, s, { 'font-size': 15, 'font-weight': 600, opacity: op }); });
      pill(840, 180, 'RAG', ACC, pop(u, 2.2), { fs: 18 }); sub(840, 222, 'Retrieval-Augmented', fade(u, 2.3)); sub(840, 242, 'Generation', fade(u, 2.3));
      return; }
    strip(k >= 1 ? [0, 3] : [3], k === 1 ? 0 : 3, true);
    person(100, 196, '사용자', {});
    llmBox(470, 196, { s: k === 0 ? pop(u, 0.2) : 1 });
    // 사내 문서 더미 (LLM 이 닿지 않는 곳)
    const dop = k === 0 ? fade(u, 0.8) : 1;
    ['취업규칙.pdf', '복리후생.pdf', '휴가정책.pdf'].forEach((s, i) => { const x = 760 + i * 14, y = 140 + i * 28;
      el('path', { d: `M${x},${y} h118 l14,14 v66 h-132 z`, fill: PANEL, stroke: GRID, 'stroke-width': 1.8, opacity: dop }); mono(x + 10, y + 20, s, { 'font-size': 13.5, fill: MUT, opacity: dop }); });
    lbl(836, 262, '사내 문서', dop, { fill: MUT });
    grow(675, 146, 675, 268, k === 0 ? E(u, 1.2, 2.0) : 1, OFF, { dash: '6 6', plain: true, sw: 2.5 });
    if (k <= 1) sub(675, 288, '연결 없음', k === 0 ? fade(u, 1.9) : 1, { 'font-size': 14 });
    if (k === 0) { sub(470, 280, '검색 단계 없이 모델 한 대만 세운다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // 질문이 곧장 LLM 으로
    if (k === 1) { fly(150, 150, 400, 150, seg(u, 0.3, 1.5), Q, { stay: true });
      if (u < 0.3) pill(255, 150, Q, ACC, 1, { fs: 13.5 });
      cross(840, 200, 22, pop(u, 1.9)); sub(840, 290, '참고 문서 0개', fade(u, 2.0), { fill: BAD, 'font-size': 14.5, 'font-weight': 700 }); return; }
    if (k === 2) { pill(470, 120, Q, ACC, 1, { fs: 13.5, fill: ACCBG });
      grow(470, 236, 470, 282, E(u, 0.1, 0.4), BAD);
      bubble(250, 288, 440, c.beat.answer, { stroke: BAD, fill: BADBG, title: 'LLM 답변 (예시 출력)', f: E(u, 0.4, 2.0), fs: 14 });
      pill(800, 330, '일반론 · 근거 없음', BAD, pop(u, 2.2), { fs: 14 }); return; }
    // k3: 왜 모르나 — 학습 범위와 시점
    const f = E(u, 0.2, 1.3), x0 = 120, xc = 600, y = 352;
    el('line', { x1: x0, y1: y, x2: 900, y2: y, stroke: MUT, 'stroke-width': 1.8 });
    el('rect', { x: x0, y: y - 30, width: (xc - x0) * f, height: 30, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 });
    tx(x0 + 12, y - 9, '공개 텍스트 (학습 시점까지)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
    grow(xc, y - 46, xc, y + 10, E(u, 1.2, 1.5), INK, { plain: true, sw: 2.5 }); sub(xc, y + 28, '학습 마감', fade(u, 1.3), { fill: INK, 'font-weight': 700, 'font-size': 14 });
    pill(740, y - 15, '최신 뉴스', BAD, pop(u, 1.6), { fs: 14 }); sub(740, y + 28, '마감 뒤라 모른다', fade(u, 1.7), { 'font-size': 14 });
    [['사내 PDF', 620], ['사내 위키', 730], ['개인 메일', 840]].forEach(([s, x], i) => pill(x, 92, s, BAD, pop(u, 2.0 + i * 0.15), { fs: 13.5 }));
    sub(730, 124, '공개된 적이 없어 학습에도 없다', fade(u, 2.3), { 'font-size': 14, fill: BAD });
  }

  // ---------- 2. Retriever ----------
  const PT = { D1: [590, 205], D2: [690, 262], D3: [560, 318], D4: [790, 140], D5: [880, 352] }, QP = [640, 228];
  function s2(t, c) { const { k, u } = c;
    strip(k >= 3 ? [0, 1] : k === 2 ? [0] : [], k >= 3 ? 1 : k === 2 ? 0 : null, false);
    const top3 = k >= 4;
    DOCS.forEach((d, i) => { const s = k === 0 ? E(u, 0.2 + i * 0.3, 0.7 + i * 0.3) : 1, hit = top3 && SCORE[d.id];
      if (s <= 0) return;
      docCard(24, 78 + i * 67, 332, d, { dx: (1 - s) * -60, op: s * (top3 && !hit ? 0.4 : 1), hot: hit });
      if (top3) { if (hit) pill(386, 106 + i * 67, `${i + 1}위`, ACC, pop(u, 1.4 + i * 0.2), { fs: 13.5 });
        else sub(386, 112 + i * 67, '탈락', fade(u, 1.6), { 'font-size': 14, 'font-weight': 700 }); } });
    if (k === 0) { zone(420, 120, 510, 200, null, { fill: SOFT, op: fade(u, 1.6) });
      mono(675, 196, 'Document(', { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      mono(675, 224, '  page_content = "본문…",', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      mono(675, 252, '  metadata = {source, page})', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 2.1) });
      return; }
    // 벡터 공간
    zone(420, 74, 516, 332, 'FAISS 벡터 스토어 (임베딩 공간)', { fill: SOFT, op: k === 1 ? fade(u, 0.1) : 1 });
    DOCS.forEach((d, i) => { const [px, py] = PT[d.id], arrive = k === 1 ? seg(u, 0.4 + i * 0.25, 1.1 + i * 0.25) : 1, hit = top3 && SCORE[d.id];
      if (k === 1 && arrive < 1) dot([[356, 106 + i * 67], [px, py]], arrive, ACC, 5);
      if (arrive >= 1) { el('circle', { cx: px, cy: py, r: 8, fill: hit ? ACC : top3 ? OFF : INK });
        mono(px + 13, py + 5, d.id, { 'font-size': 14, 'font-weight': 700, fill: hit ? ACC : top3 ? OFF : INK }); } });
    if (k === 1) { pill(560, 386, 'OpenAIEmbeddings', INFO, pop(u, 1.9), { fs: 13.5 }); pill(790, 386, 'as_retriever(k=3)', ACC, pop(u, 2.2), { fs: 13.5, mono: true }); return; }
    // 질문 벡터
    if (k === 2) { pill(680, 110, Q, ACC, pop(u, 0.2), { fs: 13.5 }); if (u > 1.0) star(QP[0], QP[1], 15, ACC, pop(u, 1.0));
      grow(680, 128, QP[0] + 6, QP[1] - 18, E(u, 0.6, 1.0), ACC); sub(678, 392, '질문도 같은 방식으로 벡터가 된다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    star(QP[0], QP[1], 15, ACC, 1); mono(QP[0], QP[1] - 22, 'Q', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    if (k === 3) { [0, 1, 2].forEach((j) => { const r = 130 * E(u, 0.2 + j * 0.4, 1.4 + j * 0.4); if (r > 1) el('circle', { cx: QP[0], cy: QP[1], r, fill: 'none', stroke: ACC, 'stroke-width': 1.5, opacity: 0.6 * (1 - r / 140) }); });
      DOCS.forEach((d, i) => { const [px, py] = PT[d.id]; grow(QP[0], QP[1], px, py, E(u, 0.8 + i * 0.15, 1.6 + i * 0.15), MUT, { plain: true, dash: '4 4', sw: 1.6 }); });
      pill(780, 386, 'retriever.invoke(질문)', ACC, pop(u, 2.0), { fs: 13.5, mono: true }); return; }
    // k4: top-3 와 점수(예시)
    DOCS.forEach((d) => { const [px, py] = PT[d.id], hit = SCORE[d.id];
      el('line', { x1: QP[0], y1: QP[1], x2: px, y2: py, stroke: hit ? ACC : OFF, 'stroke-width': hit ? 3 : 1.4, 'stroke-dasharray': hit ? null : '4 4', opacity: hit ? E(u, 0.2, 0.8) : 0.6 });
      if (hit) { const mx = (QP[0] + px) / 2, my = (QP[1] + py) / 2; pill(mx + (d.id === 'D3' ? -40 : d.id === 'D2' ? 4 : -6), my + (d.id === 'D1' ? -24 : d.id === 'D2' ? 30 : 10), hit.toFixed(2), ACC, pop(u, 0.8 + (hit === 0.92 ? 0 : hit === 0.87 ? 0.25 : 0.5)), { fs: 13.5, mono: true, fill: PANEL }); } });
    sub(780, 392, '점수는 예시 · LLM은 아직 부르지 않았다', fade(u, 2.2), { 'font-size': 14 });
  }

  // ---------- 3. context 주입 ----------
  const CTX3 = DOCS.slice(0, 3).map((d) => `[${d.src} p.${d.page}] ${d.text}`);
  function template3(k, u, fillCtx, fillQ) {
    zone(24, 70, 430, 336, 'ChatPromptTemplate', { fill: SOFT });
    const L = [['아래 context만 참고하여 질문에 답하세요.', INK], ['context에 없는 내용은 "모릅니다"로 답하세요.', WARN]];
    L.forEach(([s, col], i) => { const f = k === 0 ? E(u, 0.2 + i * 0.6, 0.8 + i * 0.6) : 1; tx(40, 124 + i * 28, s.slice(0, Math.round(s.length * f)), { 'font-size': 15, 'font-weight': i ? 700 : 500, fill: col }); });
    if (k === 0) { const f = E(u, 1.6, 2.2); el('line', { x1: 40, y1: 158, x2: 40 + 374 * f, y2: 158, stroke: WARN, 'stroke-width': 2.5 }); }
    const sop = k === 0 ? fade(u, 1.4) : 1;
    tx(40, 196, 'context:', { 'font-size': 15, 'font-weight': 700, opacity: sop });
    slotBox(40, 206, 398, 112, '{context}', fillCtx, sop);
    if (fillCtx > 0) CTX3.forEach((s, i) => mono(52, 236 + i * 30, trunc(s, 374, 13.5), { 'font-size': 13.5, opacity: clamp(fillCtx * 3 - i) }));
    tx(40, 356, 'question:', { 'font-size': 15, 'font-weight': 700, opacity: sop });
    slotBox(126, 334, 312, 36, '{question}', fillQ, sop);
    if (fillQ > 0) tx(140, 358, Q, { 'font-size': 14.5, opacity: clamp(fillQ * 2) }); }
  function s3(t, c) { const { k, u } = c;
    strip(k >= 3 ? [0, 1, 2] : [0, 1], k >= 3 ? 2 : 1, false);
    const filled = k === 3 ? E(u, 0.9, 1.5) : k > 3 ? 1 : 0, filledQ = k === 3 ? E(u, 1.3, 1.8) : k > 3 ? 1 : 0;
    template3(k, u, filled, filledQ);
    if (k === 0) { pill(700, 190, '모르면 모른다고', WARN, pop(u, 2.0), { fs: 15 }); sub(700, 226, '근거 없는 답을 막는 한 줄', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1 || k === 2) { // Document → format_docs → 문자열
      const gone = k === 2 ? E(u, 0.2, 0.9) : 0;
      DOCS.slice(0, 3).forEach((d, i) => { const s = k === 1 ? pop(u, 0.2 + i * 0.25) : 1; if (s > 0.05) docCard(480, 82 + i * 62, 236, d, { op: (1 - gone) * Math.min(1, s), badge: false }); });
      card(830, 140, 150, 64, { rx: 12, text: 'format_docs()', fs: 15, fw: 800, mono: true, stroke: ACC, fill: ACCBG, s: k === 1 ? pop(u, 0.6) : 1, op: 1 - gone });
      CTX3.forEach((s, i) => { const at = k === 1 ? 1.0 + i * 0.45 : -1;
        if (k === 1) dot([[716, 110 + i * 62], [760, 140], [905, 140], [905, 214], [700, 280 + i * 34]], seg(u, at, at + 0.6), ACC, 5);
        const op = k === 1 ? fade(u, at + 0.6) : 1; mono(484, 292 + i * 34, trunc(s, 448, 13.5), { 'font-size': 13.5, opacity: op, fill: k === 2 ? INK : ACC }); });
      if (k === 2) { const f = E(u, 0.5, 1.3); el('rect', { x: 474, y: 270, width: 462, height: 106 * f, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: f });
        mono(484, 398, 'context_str : str', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
        spans(500, 170, [['list[Document] ', { fill: MUT }], ['3개', { fill: INK, 'font-weight': 800 }], ['  →  str ', { fill: MUT }], ['1개', { fill: ACC, 'font-weight': 800 }]], { 'font-size': 18, opacity: fade(u, 1.1) }); }
      return; }
    if (k === 3) { // 칸 채우고 LLM 으로
      if (filled < 1) { const f = E(u, 0.1, 0.9); el('rect', { x: lerp(474, 40, f), y: lerp(270, 206, f), width: lerp(462, 398, f), height: lerp(106, 112, f), rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: 1 - filled }); }
      fly(700, 110, 280, 352, seg(u, 0.8, 1.5), Q);
      grow(454, 240, 640, 240, E(u, 1.8, 2.2), ACC); mono(548, 228, 'prompt.invoke', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
      llmBox(780, 240, { s: pop(u, 2.0), stroke: ACC, fill: ACCBG });
      sub(780, 318, '사내 청크를 보면서 답한다', fade(u, 2.4), { 'font-size': 14.5, fill: ACC }); return; }
    // k4: grounded 답 + 손으로 4번 호출
    bubble(476, 76, 460, '정규직은 연 15일의 연차가 부여되며 반차/반반차로 나눠 쓸 수 있습니다. 입사 1년 미만은 매월 1일씩 발생합니다.', { stroke: GOOD, fill: GOODBG, title: 'LLM 답변 (예시 출력)', f: E(u, 0.2, 1.0), fs: 14 });
    ['retriever.invoke(question)', 'format_docs(retrieved)', 'prompt.invoke({...})', 'llm.invoke(filled_prompt)'].forEach((s, i) => { const y = 246 + i * 34, op = fade(u, 1.0 + i * 0.3);
      el('circle', { cx: 492, cy: y - 5, r: 11, fill: WARN, opacity: op }); tx(492, y, String(i + 1), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: PANEL, opacity: op });
      mono(512, y, s, { 'font-size': 14.5, opacity: op }); });
    tx(476, 396, '질문마다 이 네 줄을 손으로 이어 부른다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) });
  }

  // ---------- 4. LCEL 파이프 ----------
  const PARTS = { // 조립 위치 [x, y], 흩어진 위치 [x, y]
    ret: [[150, 186], [150, 120]], fmt: [[278, 186], [380, 330]], pass: [[214, 288], [720, 120]],
    prm: [[452, 238], [540, 236]], llm: [[586, 238], [230, 312]], par: [[742, 238], [820, 306]] };
  const PLABEL = { ret: 'retriever', fmt: 'format_docs', pass: 'RunnablePassthrough', prm: 'prompt', llm: 'llm', par: 'StrOutputParser' };
  function s4(t, c) { const { k, u } = c;
    strip(k === 0 ? [0, 1] : k === 1 ? [0, 1, 2] : upto(3), k === 0 ? 1 : k === 1 ? 2 : 3, false);
    const asm = k === 0 ? 0 : k === 1 ? E(u, 0.3, 1.6) : 1;
    // dict 틀
    if (k >= 1) { const op = k === 1 ? fade(u, 1.2) : 1;
      el('rect', { x: 84, y: 132, width: 286, height: 202, rx: 14, fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '7 5', opacity: op });
      mono(98, 154, '{ dict → RunnableParallel }', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: op });
      mono(98, 228, '"context"', { 'font-size': 13.5, fill: MUT, opacity: op }); mono(98, 328, '"question"', { 'font-size': 13.5, fill: MUT, opacity: op });
      [[394, 238], [520, 238], [654, 238]].forEach(([x, y], i) => mono(x, y + 8, '|', { 'font-size': 30, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: k === 1 ? pop(u, 1.7 + i * 0.15) : 1 }));
      mono(214, 190, '|', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: k === 1 ? pop(u, 1.7) : 1 }); }
    Object.keys(PARTS).forEach((key, i) => { const [[ax, ay], [sx, sy]] = PARTS[key], x = lerp(sx, ax, asm), y = lerp(sy, ay, asm), s = k === 0 ? pop(u, 0.2 + i * 0.25) : 1;
      const lit = k >= 2 && ((key === 'prm' || key === 'ret' || key === 'fmt' || key === 'pass') || (key === 'llm') || (key === 'par' && k === 4));
      const w = key === 'pass' ? 200 : key === 'par' ? 150 : key === 'prm' || key === 'llm' ? 96 : 108;
      card(x, y, w, 40, { rx: 10, text: PLABEL[key], fs: 14, fw: 700, mono: true, s, stroke: lit ? ACC : INK, fill: lit ? ACCBG : PANEL }); });
    if (k === 0) { sub(480, 400, '부품은 Step 3과 같다. 아직 서로 연결되지 않았다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // 단계별 값의 타입 (실행 확인)
    const TYPES = [[227, 'dict'], [452, 'ChatPromptValue'], [586, 'AIMessage'], [742, 'str']];
    if (k === 1) { sub(480, 400, '파이프( | ) 하나하나가 "앞 출력 = 뒤 입력"이다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 2) { pill(227, 92, Q, ACC, pop(u, 0.1), { fs: 13.5 }); mono(227, 120, 'str', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      dot([[227, 108], [227, 238], [452, 238], [586, 238]], seg(u, 0.4, 2.0), ACC, 7);
      TYPES.slice(0, 3).forEach(([x, s], i) => mono(x, 372, s, { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.5) }));
      if (u > 2.0) el('circle', { cx: 586, cy: 238, r: 30 + 6 * Math.sin(u * 8), fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: 0.6 });
      return; }
    TYPES.slice(0, 3).forEach(([x, s]) => mono(x, 372, s, { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' }));
    if (k === 3) { // dict 안: 위는 검색·문자열화, 아래는 그대로 통과
      ['D1', 'D2', 'D3'].forEach((id, i) => { const f = seg(u, 0.3 + i * 0.2, 1.2 + i * 0.2); if (f > 0 && f < 1) card(lerp(150, 278, f), 108, 36, 22, { rx: 5, text: id, fs: 13.5, mono: true, fill: ACC, stroke: 'none', color: PANEL }); });
      pill(227, 112, 'context: "정규직 연차는 연 15일…"', ACC, pop(u, 1.6), { fs: 13.5, fill: PANEL });
      fly(100, 288, 330, 288, seg(u, 0.4, 1.8), '질문', { fill: INFO });
      pill(227, 404, 'question: "우리 회사 휴가 정책이 뭐야?"', INFO, pop(u, 2.0), { fs: 13.5, fill: PANEL });
      return; }
    // k4: 파서 → 문자열 답, 그리고 같은 체인의 다른 호출법
    mono(742, 372, 'str', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    dot([[586, 238], [742, 238], [850, 238], [850, 206]], seg(u, 0.2, 1.0), ACC, 7);
    bubble(540, 62, 396, c.beat.answer || '', { stroke: GOOD, fill: GOODBG, f: E(u, 0.9, 1.8), fs: 13.5, title: '답 (예시 출력)' });
    ['.invoke()', '.batch()', '.stream()', '.ainvoke()'].forEach((s, i) => pill(70 + i * 112, 76, s, INFO, pop(u, 1.9 + i * 0.12), { fs: 13.5, mono: true }));
    sub(240, 112, '같은 체인에 그대로 붙는 호출 방식', fade(u, 2.4), { 'font-size': 14 });
  }

  // ---------- 5. 출처 인용 ----------
  const ANS5 = [['정규직은 연 15일 연차', 'D1', ','], ['입사 1년 미만은 매월 1일 발생', 'D2', ','], ['근속 3년 차부터 리프레시 3일', 'D3', '이 별도 부여됩니다.']];
  function dictBox(x, y, w, rows, o) { o = o || {}; const rh = 40;
    el('rect', { x, y, width: w, height: rh * rows.length + 34, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 12, y + 22, o.title || 'result : dict', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    rows.forEach(([key, val, ro], i) => { ro = ro || {}; const yy = y + 34 + i * rh, op = (o.op ?? 1) * (ro.op ?? 1);
      if (ro.hot) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: rh - 4, rx: 6, fill: ACCBG, opacity: op });
      mono(x + 14, yy + 26, `"${key}"`, { 'font-size': 14, 'font-weight': 700, fill: ro.hot ? ACC : INK, opacity: op });
      mono(x + 124, yy + 26, val, { 'font-size': 14, fill: ro.col || INK, opacity: op }); }); }
  function s5(t, c) { const { k, u } = c;
    strip(k >= 4 ? upto(4) : upto(3), k >= 4 ? 4 : 3, false);
    if (k <= 2) { // 인용 지시 prompt + [Dn] 라벨 + answer_chain
      zone(24, 70, 430, 336, 'ChatPromptTemplate', { fill: SOFT, op: k === 2 ? 0.45 : 1 });
      tx(40, 124, '아래 context만 참고해서 답하고,', { 'font-size': 15, opacity: k === 2 ? 0.45 : 1 });
      const hf = k === 0 ? E(u, 0.4, 1.4) : 1; el('rect', { x: 34, y: 136, width: 412 * hf, height: 30, rx: 6, fill: ACCBG, opacity: k === 2 ? 0.45 : 1 });
      tx(40, 157, '인용한 청크 번호를 [Dn] 형식으로 표기하세요.', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: (k === 0 ? fade(u, 0.5) : 1) * (k === 2 ? 0.45 : 1) });
      tx(40, 200, 'context:', { 'font-size': 15, 'font-weight': 700, opacity: k === 2 ? 0.45 : 1 }); slotBox(40, 210, 398, 100, '{context}', 0, k === 2 ? 0.45 : 1);
      tx(40, 350, 'question:', { 'font-size': 15, 'font-weight': 700, opacity: k === 2 ? 0.45 : 1 }); slotBox(126, 328, 312, 36, '{question}', 0, k === 2 ? 0.45 : 1);
      if (k === 0) { pill(700, 230, '답 속에 [D1] [D2] [D3]', ACC, pop(u, 1.8), { fs: 16 }); sub(700, 268, '어느 청크를 썼는지 답이 스스로 밝힌다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
      DOCS.slice(0, 3).forEach((d, i) => { const y = 112 + i * 52, s = k === 1 ? pop(u, 0.9 + i * 0.35) : 1;
        el('rect', { x: 476, y: y - 24, width: 460, height: 38, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
        mono(536, y, trunc(d.text, 390, 13.5), { 'font-size': 13.5 });
        if (s > 0.02) card(504, y - 5, 46, 26, { rx: 5, text: `[${d.id}]`, fs: 13.5, mono: true, fill: ACC, stroke: 'none', color: PANEL, s }); });
      if (k === 1) { mono(476, 290, 'f"[D{i+1}] {d.page_content}"', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.3) }); mono(476, 318, 'for i, d in enumerate(docs)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5) }); return; }
      ['prompt', 'llm', 'parser'].forEach((s, i) => { card(560 + i * 140, 300, 104, 42, { rx: 10, text: s, fs: 15, fw: 700, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 0.3 + i * 0.25) });
        if (i < 2) mono(630 + i * 140, 308, '|', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.25) }); });
      mono(476, 260, 'answer_chain =', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      sub(700, 366, 'Step 4의 prompt | llm | parser 그대로', fade(u, 1.4), { 'font-size': 14.5 });
      return; }
    if (k === 3 || k === 4) { // RunnableParallel → assign
      pill(110, 230, Q, ACC, 1, { fs: 13.5 });
      grow(200, 220, 300, 140, E(u, 0.2, 0.8), ACC); grow(200, 240, 300, 320, E(u, 0.2, 0.8), INFO);
      card(360, 140, 120, 36, { rx: 8, text: 'retriever', fs: 14, mono: true, fw: 700, stroke: ACC, fill: ACCBG });
      card(380, 320, 200, 36, { rx: 8, text: 'RunnablePassthrough', fs: 14, mono: true, fw: 700, stroke: INFO, fill: INFOBG });
      DOCS.slice(0, 3).forEach((d, i) => card(380, 196 + i * 30, 214, 26, { rx: 5, text: `Document · ${d.src}`, fs: 13.5, mono: true, stroke: GRID, s: k === 3 ? pop(u, 0.9 + i * 0.2) : 1 }));
      sub(380, 290, 'metadata 그대로 보존', k === 3 ? fade(u, 1.6) : 1, { 'font-size': 14, fill: ACC });
      grow(490, 210, 600, 210, k === 3 ? E(u, 1.4, 1.9) : 1, ACC); grow(480, 320, 600, 268, k === 3 ? E(u, 1.4, 1.9) : 1, INFO);
      const rows = [['context', '[Document × 3]', { col: ACC }], ['question', '"우리 회사 휴가…"', { col: INFO }]];
      if (k === 4) rows.push(['answer', u > 2.0 ? '"정규직은 연 15일…[D1]…"' : '…', { hot: true, op: fade(u, 0.3) }]);
      dictBox(608, 150, 328, rows, { op: k === 3 ? fade(u, 1.8) : 1 });
      if (k === 4) { // assign(answer=lambda … | answer_chain)
        card(700, 360, 200, 36, { rx: 8, text: 'lambda → answer_chain', fs: 13.5, mono: true, fw: 700, stroke: ACC, fill: ACCBG, s: pop(u, 0.6) });
        dot([[930, 210], [930, 360], [800, 360], [700, 360], [610, 360], [610, 300], [640, 290]], seg(u, 0.9, 2.0), ACC, 6);
        mono(608, 128, '.assign(answer = …)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) }); }
      return; }
    // k5, k6: 결과 dict 와 출처 카드
    zone(24, 70, 912, k === 6 ? 182 : 300, 'result (예시 출력)', { fill: SOFT });
    mono(44, 120, '"question":', { 'font-size': 14.5, fill: MUT }); tx(180, 120, Q, { 'font-size': 14.5 });
    mono(44, 152, '"context": ', { 'font-size': 14.5, fill: MUT }); mono(180, 152, '[Document(D1), Document(D2), Document(D3)]', { 'font-size': 14.5, fill: ACC });
    mono(44, 184, '"answer":  ', { 'font-size': 14.5, fill: MUT });
    const ends = [];
    ANS5.forEach(([a, id, tail], i) => { const y = 184 + i * 26, f = k === 5 ? E(u, 0.4 + i * 0.4, 0.9 + i * 0.4) : 1; if (f <= 0) return;
      const parts = [[a, {}], [`[${id}]`, { fill: ACC, 'font-weight': 800 }], [tail, {}]];
      const e = spans(180, y, parts, { 'font-size': 14.5, class: null, opacity: f });
      let x0 = 180 + tw(a, 14.5), x1 = x0 + 36; try { x0 = e.getStartPositionOfChar(a.length).x; x1 = e.getEndPositionOfChar(a.length + 3).x; } catch (err) { /* 측정 불가 */ }
      ends.push([x0, y, x1 - x0]); });
    if (k === 5) { sub(700, 330, 'question · context · answer 가 한 dict 로 돌아온다', fade(u, 2.0), { 'font-size': 15 }); return; }
    DOCS.slice(0, 3).forEach((d, i) => { const x = 30 + i * 306, s = pop(u, 0.5 + i * 0.3);
      card(x + 145, 330, 290, 104, { rx: 12, stroke: ACC, sw: 2, fill: PANEL, s });
      const op = fade(u, 0.6 + i * 0.3);
      el('rect', { x: x + 12, y: 292, width: 46, height: 26, rx: 5, fill: ACC, opacity: op }); mono(x + 35, 310, `[${d.id}]`, { 'font-size': 13.5, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: op });
      mono(x + 68, 310, `${d.src} · p.${d.page}`, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op });
      tx(x + 12, 346, trunc(d.text, 266, 14), { 'font-size': 14, fill: MUT, opacity: op });
      if (ends[i]) el('rect', { x: ends[i][0] - 3, y: ends[i][1] - 17, width: ends[i][2] + 6, height: 23, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.6 + i * 0.3) }); });
  }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: '검색 없이 LLM에 "우리 회사 휴가 정책이 뭐야?"만 보냈을 때 일반론만 돌아온 이유는 무엇인가?',
      o: ['temperature가 높아서 답이 흔들렸다', '사내 PDF·위키는 공개된 적이 없어 학습 데이터에 없다', '질문이 너무 짧아서 모델이 이해하지 못했다'], a: 1,
      why: 'LLM은 학습 시점까지의 공개 텍스트만 안다. 사내 규정은 학습에 없으니 "회사마다 다릅니다" 수준으로만 답한다.' },
    { q: 'retriever.invoke(질문)이 돌려주는 것은 무엇인가?',
      o: ['LLM이 만든 답변 문자열', '사내 문서 5개 전부를 점수순으로', '질문 벡터와 가까운 Document 3개 (k=3)'], a: 2,
      why: '질문을 임베딩해 벡터 공간에서 가까운 청크 k개만 가져온다. 이 단계에서는 LLM을 부르지 않는다.' },
    { q: 'Step 3에서 format_docs가 하는 일은 무엇인가?',
      o: ['Document 3개를 프롬프트의 {context}에 넣을 문자열 하나로 합친다', '검색 점수가 낮은 문서를 지운다', 'LLM 답변에서 출처를 뽑아낸다'], a: 0,
      why: '프롬프트 칸에는 문자열이 들어간다. list[Document] 3개를 "[휴가정책.pdf p.3] 본문" 줄들로 이어 str 1개로 만든다.' },
    { q: 'rag_chain에서 dict 안의 "question": RunnablePassthrough()가 하는 일은 무엇인가?',
      o: ['질문을 임베딩해 벡터로 바꾼다', '질문을 요약해 짧게 만든다', '들어온 질문 문자열을 그대로 다음 단계로 넘긴다'], a: 2,
      why: 'dict의 두 칸은 같은 입력을 받는다. context 칸은 검색과 문자열화를 거치고, question 칸은 입력을 바꾸지 않고 통과시킨다.' },
    { q: '답변과 함께 "휴가정책.pdf p.3" 같은 출처를 보여 주려면 체인이 무엇을 남겨야 하는가?',
      o: ['StrOutputParser가 만든 답 문자열만', '검색된 원본 Document 리스트(metadata 포함)', 'LLM에 보낸 프롬프트 전문'], a: 1,
      why: '문자열로 바꾸면 source·page 정보가 사라진다. RunnableParallel로 원본 Document를 context 키에 보존하고, assign으로 answer를 덧붙인다.' },
  ];

  const summary = [
    '검색 없이 질문만 보내면 LLM은 사내 규정을 몰라 일반론으로 답한다.',
    'Retriever는 질문을 벡터로 바꿔 가까운 문서 k개를 고른다. 이때 LLM은 부르지 않는다.',
    '검색 결과를 문자열로 이어 {context}에 넣고, 없으면 모른다고 답하라고 적는다.',
    'LCEL 파이프로 묶으면 invoke 한 번에 검색부터 답까지 이어지고, 원본 Document를 남기면 출처도 낼 수 있다.',
  ];
  const review = [
    { q: 'RAG 챗봇이 사내 문서에 없는 질문에 그럴듯한 숫자를 지어냈다. 먼저 볼 곳은?',
      o: ['retriever의 k 값을 5로 늘렸는지', '프롬프트에 context에 없으면 모른다고 하라는 줄이 있는지', 'StrOutputParser를 뺐는지'], a: 1,
      why: '검색은 늘 무언가를 가져온다. 관련 없는 청크만 왔을 때 답을 멈추게 하는 것은 프롬프트의 지시다.' },
    { q: '출처 카드를 붙이려고 rag_chain 끝의 답 문자열에서 source를 찾으려 했더니 없었다. 왜인가?',
      o: ['format_docs와 parser를 거치며 metadata가 문자열 밖으로 빠졌다', 'FAISS가 metadata를 저장하지 않는다', 'LLM이 출처를 일부러 지웠다'], a: 0,
      why: 'Step 4 체인은 Document를 본문 문자열로 바꾸고 마지막에 str만 돌려준다. 원본 Document를 따로 남기는 RunnableParallel이 필요하다.' },
    { q: '휴가 질문에 D4(경조 휴가)가 top-3에서 빠졌다. 이 결과를 만든 단계는?',
      o: ['LLM이 답을 쓰면서 D4를 버렸다', 'StrOutputParser가 D4를 걸렀다', 'Retriever가 질문 벡터와의 거리로 3개만 골랐다'], a: 2,
      why: '어떤 청크가 프롬프트에 들어갈지는 검색 단계에서 이미 정해진다. LLM은 받은 3개만 본다.' },
  ];

  R.page({ title: 'RAG 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
