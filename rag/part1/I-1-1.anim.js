/* I-1-1 LLM의 한계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 학습 데이터 타임라인과 마감선(지식 단절), 학습 데이터 원 밖의 사내 PDF(도메인), 다음 토큰을 고르는 막대(환각),
 *       멈춘 사진과 넘어가는 달력(정적), 네 한계 카드가 RAG 로 초록이 되는 모습(해결).
 * LLM 답변 글은 모두 "예시"다(실제 호출 결과가 아니다). 막대 높이처럼 숫자가 없는 모양도 예시로 표시한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, card, mono, sub, lbl, pill, grow, dot, cross, check, lock, person, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 ----------
  const at = (c) => (kk, a, d = 0.6) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a, a + d) : 0);
  function wrap(s, maxW, fs) { const out = []; let line = '';
    for (const w of String(s).split(' ')) { const t = line ? line + ' ' + w : w; if (tw(t, fs) > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line); return out; }
  // 말풍선: 글은 폭에 맞춰 줄바꿈. o.tag 가 있으면 오른쪽 위에 작은 표(예: '예시')
  function bubble(x, y, w, text, o) { o = o || {}; const fs = o.fs || 15, lines = wrap(text, w - 28, fs), h = lines.length * (fs + 7) + 20, op = o.op ?? 1;
    if (op <= 0.01) return h; const g = R.G(0, 0, 1, op);
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2 }, g);
    lines.forEach((l, i) => tx(x + 14, y + 14 + fs * 0.85 + i * (fs + 7), l, { 'font-size': fs, fill: o.color || INK, 'font-weight': o.fw || 500 }, g));
    if (o.tag) { const tw2 = tw(o.tag, 13.5) + 16; el('rect', { x: x + w - tw2 - 8, y: y - 12, width: tw2, height: 22, rx: 11, fill: o.tagFill || WARNBG, stroke: o.tagCol || WARN, 'stroke-width': 1.5 }, g);
      tx(x + w - tw2 / 2 - 8, y + 4, o.tag, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.tagCol || WARN }, g); }
    return h; }
  // 모델 칩: 둥근 사각형 + 양옆 핀
  function chip(cx, cy, name, o) { o = o || {}; const w = o.w || 150, h = o.h || 54, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.stroke || INK;
    for (let i = 0; i < 4; i++) { const yy = -h / 2 + 10 + i * ((h - 20) / 3); el('line', { x1: -w / 2 - 8, y1: yy, x2: -w / 2, y2: yy, stroke: col, 'stroke-width': 2.5 }, g); el('line', { x1: w / 2, y1: yy, x2: w / 2 + 8, y2: yy, stroke: col, 'stroke-width': 2.5 }, g); }
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    tx(0, 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g); return g; }
  // 문서 한 장 (접힌 모서리 + 회색 줄)
  function paper(cx, cy, w, h, title, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.stroke || INK, f = 14;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - f} L${w / 2},${-h / 2 + f} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2 }, g);
    el('path', { d: `M${w / 2 - f},${-h / 2} V${-h / 2 + f} H${w / 2}`, fill: 'none', stroke: col, 'stroke-width': 1.5 }, g);
    const n = o.lines ?? 3; for (let i = 0; i < n; i++) el('line', { x1: -w / 2 + 10, y1: -h / 2 + 26 + i * 9, x2: w / 2 - 12 - (i % 2) * 14, y2: -h / 2 + 26 + i * 9, stroke: OFF, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    if (title) tx(0, h / 2 + 20, title, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.color || col }, g); return g; }

  // 위쪽 한계 4칸 — 페이지 데이터 cardStatus 를 그대로 그린다 (idle 회색 / limit 빨강 / fixed 초록)
  const LIM = [['cutoff', '지식 단절'], ['domain', '도메인'], ['halluc', '환각'], ['static', '정적']];
  function status(c) { const b = c.beat, pv = c.prev;
    if (c.k === 0 && c.steps[1].activeId !== 'cutoff') mono(30, 31, 'client = OpenAI()  같은 클라이언트', { 'font-size': 14, fill: MUT, opacity: fade(c.u, 0.2) });
    tx(546, 31, '한계', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    LIM.forEach(([id, name], i) => { const st = b.cardStatus[id], was = pv ? pv.cardStatus[id] : st, ch = st !== was && c.u < 0.8;
      const s0 = ch ? was : st, col = s0 === 'limit' ? BAD : s0 === 'fixed' ? GOOD : MUT, sc = st !== was && !ch ? pop(c.u, 0.8) : 1, x = 600 + i * 100;
      pill(x, 26, name, col, sc, { fs: 14, fill: s0 === 'limit' ? BADBG : s0 === 'fixed' ? GOODBG : PANEL, color: s0 === 'idle' ? MUT : col });
      if (b.activeId === id) el('line', { x1: x - 30, y1: 47, x2: x + 30, y2: 47, stroke: ACC, 'stroke-width': 3, 'stroke-linecap': 'round' }); }); }

  // =========================================================
  // 1. 지식 단절 — 학습 데이터는 마감선에서 끝난다
  // =========================================================
  const YX = (y) => 80 + (y - 2023) * 200;   // 연도 → x
  function s1(t, c) { const { k, u } = c, p = at(c); status(c);
    const g0 = k === 0 ? E(u, 0.9, 2.1) : 1, cut = YX(2025.25), q = YX(2026.25);
    chip(170, 100, 'gpt-4o-mini', { s: k === 0 ? pop(u, 0.2) : 1 });
    mono(170, 152, 'client = OpenAI()', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.5) : 1 });
    // 타임라인
    el('line', { x1: 80, y1: 250, x2: 880, y2: 250, stroke: MUT, 'stroke-width': 1.8 });
    [2023, 2024, 2025, 2026, 2027].forEach((y) => { el('line', { x1: YX(y), y1: 250, x2: YX(y), y2: 256, stroke: MUT }); mono(YX(y), 274, String(y), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    el('rect', { x: 80, y: 204, width: (cut - 80) * g0, height: 32, rx: 6, fill: ACC, opacity: 0.85 });
    if (g0 > 0.5) tx(100, 226, '학습 데이터', { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: fade(g0, 0.5, 0.3) });
    const cf = k === 0 ? fade(u, 2.0) : 1, wall = p(3, 0.3);
    el('line', { x1: cut, y1: 184, x2: cut, y2: 262, stroke: wall > 0 ? BAD : INK, 'stroke-width': 2 + 3 * wall, 'stroke-dasharray': wall > 0.5 ? null : '5 4', opacity: cf });
    tx(cut, 176, '학습 마감 (예: 2025-04)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: cf, fill: wall > 0 ? BAD : INK });
    el('rect', { x: cut + 4, y: 204, width: 880 - cut - 4, height: 32, rx: 6, fill: SOFT, stroke: GRID, 'stroke-dasharray': '4 4', opacity: cf });
    tx(cut + 18, 226, '학습 이후 — 본 적 없음', { 'font-size': 14, fill: MUT, opacity: cf });
    // 질문 + 핀
    const qa = p(1, 0.2);
    if (qa > 0) { person(850, 96, null, { s: qa });
      bubble(480, 70, 330, '2026년 4월에 출시된 iPhone 18 가격?', { op: qa, stroke: INFO });
      const pin = p(1, 1.2); if (pin > 0) { el('line', { x1: q, y1: 108, x2: q, y2: lerp(108, 250, pin), stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
        if (pin > 0.95) { el('circle', { cx: q, cy: 250, r: 8, fill: INFO }); tx(q, 300, 'iPhone 18 · 2026-04', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO }); } } }
    // 답 (예시)
    const an = p(2, 0.3);
    if (an > 0) { bubble(40, 322, 440, '"죄송합니다. 학습 데이터가 2025년 4월까지라 해당 정보가 없습니다."', { op: k >= 4 ? 0.35 : an, stroke: BAD, tag: '답변 예시 · FAIL', tagCol: BAD, tagFill: BADBG }); }
    // 가중치 동결
    if (wall > 0) { lock(cut, 136, true, BAD, wall); tx(cut + 22, 142, '가중치 동결', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: wall });
      sub(390, 300, '이후의 출시·발표는 추론으로도 못 만든다', fade(wall, 0.5), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    // 해결 예고: 최신 문서를 찾아 prompt 에 첨부
    const rf = p(4, 0.2);
    if (rf > 0) { paper(560, 378, 50, 58, null, { s: pop(u, 0.2), stroke: INFO, lines: 2 });
      grow(592, 378, 660, 378, E(u, 0.7, 1.1), INFO); card(712, 378, 96, 40, { text: 'prompt', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.0) });
      grow(762, 378, 812, 378, E(u, 1.4, 1.8), ACC); pill(860, 378, 'RAG', ACC, pop(u, 1.8), { fs: 16, fill: ACCBG });
      tx(560, 345, '최신 문서 검색', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.4) }); } }

  // =========================================================
  // 2. 도메인 지식 부족 — 사내 PDF 는 학습 데이터 원 밖에 있다
  // =========================================================
  const DOTS = Array.from({ length: 46 }, (_, i) => { const a = i * 2.39996, r = 22 + 108 * Math.sqrt((i + 0.5) / 46); return [250 + Math.cos(a) * r, 232 + Math.sin(a) * r * 0.8]; });
  function s2(t, c) { const { k, u } = c, p = at(c); status(c);
    if (k === 4) return s2mistake(t, c);
    const fill = k === 0 ? u / 2.2 : 1;
    el('ellipse', { cx: 250, cy: 232, rx: 150, ry: 122, fill: SOFT, stroke: GRID, 'stroke-width': 2 });
    DOTS.forEach(([x, y], i) => { const s = clamp(fill * 46 - i); if (s > 0) el('circle', { cx: x, cy: y, r: 4.5 * s, fill: OFF }); });
    [['공개 웹', 200, 190], ['서적', 300, 230], ['논문', 215, 285]].forEach(([s, x, y], i) => card(x, y, tw(s, 15) + 22, 30, { rx: 15, text: s, fs: 15, stroke: INK, s: k === 0 ? pop(u, 0.4 + i * 0.4) : 1 }));
    lbl(250, 92, 'LLM 학습 데이터', k === 0 ? fade(u, 0.2) : 1, { 'font-size': 15.5 });
    // 사내 PDF (잠김)
    paper(700, 230, 130, 150, null, { lines: 5 });
    lock(745, 172, true, INK, 1);
    tx(700, 330, '인사규정.pdf', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    const hit = p(2, 1.2);
    card(700, 256, 120, 34, { rx: 6, text: '5년 근속 → 7일', fs: 14.5, stroke: hit > 0 ? ACC : GRID, color: hit > 0 ? ACC : MUT, fill: hit > 0 ? ACCBG : PANEL, sw: 1.5 });
    sub(700, 352, '사내 위키 · 내규 · 고객 데이터', 1, { 'font-size': 13.5 });
    const qa = p(1, 0.2);
    if (qa > 0) { bubble(500, 64, 300, '우리 회사 리프레시 휴가 규정?', { op: qa, stroke: INFO }); grow(650, 104, 680, 150, p(1, 0.8), INFO); }
    const an = p(2, 0.2);
    if (an > 0) bubble(60, 358, 420, '"근로기준법상 1년 이상 근속 시 연차 15일이 부여됩니다."', { op: an, stroke: BAD, tag: '답변 예시 · 일반론', tagCol: BAD, tagFill: BADBG });
    const why = p(3, 0.2);
    if (why > 0) { el('line', { x1: 410, y1: 232, x2: lerp(410, 630, why), y2: 232, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
      if (why > 0.9) { cross(520, 232, 13, pop(u, 0.9)); sub(520, 210, '학습에 들어간 적 없음', fade(u, 1.1), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); } } }
  // 흔한 실수: 규정 전부를 system prompt 에 넣기 vs 관련 조항만 검색해 넣기
  function s2mistake(t, c) { const { u } = c;
    const L = { x: 90, y: 90, w: 330, h: 250 }, Rr = { x: 540, y: 90, w: 330, h: 250 };
    [[L, 'system prompt 에 규정 전부', BAD], [Rr, '관련 조항만 검색해 첨부', GOOD]].forEach(([b, name, col], j) => {
      el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2.5, opacity: fade(u, 0.2 + j * 1.1) });
      lbl(b.x + b.w / 2, b.y - 14, name, fade(u, 0.2 + j * 1.1), { fill: col }); });
    const nL = Math.floor(clamp((u - 0.4) / 0.8) * 14);
    for (let i = 0; i < nL; i++) { const r = Math.floor(i / 2), cc = i % 2; el('rect', { x: L.x + 16 + cc * 152, y: L.y + 16 + r * 32, width: 146, height: 24, rx: 4, fill: BADBG, stroke: BAD, 'stroke-width': 1.2 });
      tx(L.x + 26 + cc * 152, L.y + 33 + r * 32, `제${i + 1}조`, { 'font-size': 13.5, fill: BAD, 'font-weight': 600 }); }
    if (u > 1.2) { sub(L.x + L.w / 2, L.y + L.h + 26, '질문마다 전체가 따라붙어 토큰 폭증', fade(u, 1.2), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); cross(L.x + L.w - 10, L.y + 6, 14, pop(u, 1.3)); }
    if (u > 1.4) { el('rect', { x: Rr.x + 16, y: Rr.y + 16, width: 298, height: 34, rx: 4, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5, opacity: fade(u, 1.5) });
      tx(Rr.x + 28, Rr.y + 38, '3장 2절 · 리프레시 휴가', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      grow(Rr.x + Rr.w / 2, Rr.y + 110, Rr.x + Rr.w / 2, Rr.y + 60, E(u, 1.7, 2.1), GOOD);
      card(Rr.x + Rr.w / 2, Rr.y + 140, 150, 40, { text: '검색 = RAG', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 1.9) });
      sub(Rr.x + Rr.w / 2, Rr.y + Rr.h + 26, '질문에 맞는 일부만 붙는다', fade(u, 2.1), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); } }

  // =========================================================
  // 3. 환각 — 사실 확인 없이 그럴듯한 다음 토큰을 잇는다
  // =========================================================
  const TOK = ['2024년 3월', 'Google이', '슈퍼노바 칩으로', '1만 큐비트를', '달성했습니다'];
  function s3(t, c) { const { k, u } = c, p = at(c); status(c);
    chip(130, 110, 'gpt-4o-mini', { w: 140 });
    // 토큰 자리
    let x = 70; const xs = TOK.map((s) => { const w = tw(s, 15) + 22, cx = x + w / 2; x += w + 10; return [cx, w]; });
    const gen = k === 2 ? clamp((u - 0.3) / 1.6) * TOK.length : k > 2 ? TOK.length : 0;
    xs.forEach(([cx, w], i) => { const s = clamp(gen - i);
      el('rect', { x: cx - w / 2, y: 224, width: w, height: 36, rx: 6, fill: s > 0 ? BADBG : PANEL, stroke: s > 0 ? BAD : GRID, 'stroke-width': 1.8, 'stroke-dasharray': s > 0 ? null : '4 4' });
      if (s > 0) tx(cx, 248, TOK[i], { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: s }); });
    tx(70, 212, '생성되는 토큰', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const qa = p(1, 0.2);
    if (qa > 0) { bubble(300, 70, 330, "양자 컴퓨팅 '슈퍼노바' 칩 알려줘", { op: qa, stroke: INFO });
      card(800, 110, 190, 64, { rx: 10, text: '실제 세계\n그런 칩은 없다', fs: 14.5, stroke: GRID, color: MUT, dash: '5 4', s: p(1, 1.0) }); }
    if (k === 2 && u > 2.0) pill(740, 242, '전부 가짜', BAD, pop(u, 2.0), { fs: 15, fill: BADBG });
    if (k > 2) pill(740, 242, '전부 가짜', BAD, 1, { fs: 15, fill: BADBG });
    if (k === 2) tx(70, 300, '답변 예시 — 자신감 있는 문장', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
    // 다음 토큰 후보 막대 (모양은 예시)
    const why = p(3, 0.2);
    if (why > 0 && k === 3) { const cand = [['1만 큐비트를', 0.9, true], ['100 큐비트를', 0.45], ['정보가 없습니다', 0.12]];
      tx(70, 302, '"Google이 슈퍼노바 칩으로" 다음 후보', { 'font-size': 14, 'font-weight': 700, fill: INK, opacity: why });
      cand.forEach(([s, v, pick], i) => { const y = 318 + i * 30, len = 220 * v * E(u, 0.4 + i * 0.15, 1.2 + i * 0.15);
        tx(230, y + 15, s, { 'font-size': 14, 'text-anchor': 'end', fill: pick ? BAD : MUT, 'font-weight': pick ? 700 : 500 });
        el('rect', { x: 240, y: y + 2, width: len, height: 18, rx: 4, fill: pick ? BAD : OFF }); });
      sub(360, 410, '확률이 높은 쪽을 고를 뿐 (막대 길이는 예시)', fade(u, 1.4), { 'font-size': 13.5 });
      card(720, 350, 200, 46, { rx: 10, text: '사실 검증 단계', fs: 15, stroke: MUT, color: MUT, dash: '5 4', s: pop(u, 1.6) }); cross(720, 350, 18, pop(u, 2.0)); }
    // 위험 시나리오 + 해결
    if (k === 4) { [['의료 봇', '없는 약을 처방'], ['법률 봇', '없는 판례 인용'], ['회사 봇', '"환불 가능" 거짓 약속']].forEach(([a, b], i) => {
        const s = pop(u, 0.2 + i * 0.35), cx = 170 + i * 250; card(cx, 330, 220, 62, { rx: 10, text: `${a}\n${b}`, fs: 14.5, stroke: BAD, color: BAD, fill: BADBG, s }); });
      pill(480, 400, '해결: 외부 문서로 grounding · 출처 없으면 "모릅니다"', GOOD, pop(u, 1.6), { fs: 14.5, fill: GOODBG }); } }

  // =========================================================
  // 4. 정적 — 사진은 멈췄고 달력은 넘어간다
  // =========================================================
  function s4(t, c) { const { k, u } = c, p = at(c); status(c);
    // 멈춘 사진
    const ph = k === 0 ? pop(u, 0.2) : 1, g = R.G(200, 210, ph);
    el('rect', { x: -130, y: -110, width: 260, height: 230, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }, g);
    el('rect', { x: -112, y: -92, width: 224, height: 160, rx: 4, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 }, g);
    tx(0, -48, 'USD/KRW', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, class: 'mono' }, g);
    tx(0, -6, '≈ 1,350원', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: INK, class: 'mono' }, g);
    tx(0, 30, '학습 시점 값', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }, g);
    tx(0, 100, '가중치 = 멈춘 사진', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }, g);
    // 달력: 날짜가 넘어간다
    const flips = k === 0 ? Math.floor(clamp((u - 0.8) / 1.6) * 6) : 6 + k;
    for (let i = 0; i < 3; i++) { const x = 560 + i * 18, y = 100 - i * 6; el('rect', { x, y, width: 150, height: 150, rx: 8, fill: PANEL, stroke: i === 2 ? INK : GRID, 'stroke-width': 2 }); }
    el('rect', { x: 596, y: 88, width: 150, height: 34, rx: 8, fill: ACC });
    tx(671, 111, '오늘', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL });
    mono(671, 190, `D+${flips}`, { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    sub(671, 270, '세상은 매일 바뀐다', k === 0 ? fade(u, 1.2) : 1, { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
    const qa = p(1, 0.2);
    if (qa > 0 && k < 3) bubble(560, 300, 300, '오늘 환율 USD/KRW 알려줘', { op: qa, stroke: INFO });
    const an = p(2, 0.2);
    if (an > 0 && k === 2) bubble(60, 352, 470, '"학습 시점 환율은 약 1,350원이었습니다. 현재 시세는 알 수 없습니다."', { op: an, stroke: BAD, tag: '답변 예시', tagCol: BAD, tagFill: BADBG });
    if (k === 3) { // 재학습 비용
      el('rect', { x: 60, y: 350, width: 840, height: 60, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: fade(u, 0.2) });
      tx(80, 386, '재학습 1회', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      el('rect', { x: 180, y: 368, width: 380 * E(u, 0.5, 1.5), height: 24, rx: 4, fill: BAD });
      tx(570, 386, 'GPT-4 추정 수천만 달러 이상 · 수개월', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
      pill(860, 330, '매일은 불가', BAD, pop(u, 2.0), { fs: 14.5, fill: PANEL }); }
    if (k === 4) { // 6~12개월 사이에 쌓이는 변화
      el('line', { x1: 380, y1: 380, x2: 900, y2: 380, stroke: MUT, 'stroke-width': 1.8 });
      [[390, '모델 v1'], [890, '모델 v2']].forEach(([x, s], i) => { el('circle', { cx: x, cy: 380, r: 8, fill: INK }); tx(x, 408, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': i ? 'end' : 'start' }); });
      tx(640, 408, '6~12개월', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: INK, opacity: fade(u, 0.3) });
      ['환율', '뉴스', '신제품', '법령'].forEach((s, i) => { const y = lerp(328, 352, E(u, 0.5 + i * 0.3, 1.0 + i * 0.3)); if (u > 0.5 + i * 0.3) pill(470 + i * 115, y, s, WARN, 1, { fs: 14, fill: WARNBG }); });
      pill(650, 300, '해결: 실시간 데이터를 prompt 에 첨부 = RAG', GOOD, pop(u, 2.0), { fs: 14.5, fill: GOODBG }); } }

  // =========================================================
  // 5. RAG 가 해결 — 네 한계 카드가 차례로 초록이 된다
  // =========================================================
  const FIX = { cutoff: ['최신 문서 색인', INFO], domain: ['사내 DB 임베딩', INFO], halluc: ['출처 없으면 거부', INFO], static: ['매 질의 실시간 조회', INFO] };
  function s5(t, c) { const { k, u } = c, b = c.beat, pv = c.prev;
    if (k >= 5) return s5def(t, c);
    // 위: 두 길
    const ga = k === 0 ? 1 : 0.4;
    card(240, 70, 300, 44, { rx: 10, text: '가중치 재학습', fs: 15, stroke: BAD, color: BAD, op: ga, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k > 0 || u > 0.7) cross(400, 70, 12, k === 0 ? pop(u, 0.7) : 1);
    card(650, 70, 340, 44, { rx: 10, text: '질의 시점 검색 + prompt 첨부', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: k === 0 ? pop(u, 1.1) : 1 });
    if (k > 0 || u > 1.6) check(835, 70, 12, k === 0 ? pop(u, 1.6) : 1);
    // 아래: 한계 카드 4장
    LIM.forEach(([id, name], i) => { const st = b.cardStatus[id], was = pv ? pv.cardStatus[id] : st, flip = st !== was, f = flip ? E(u, 0.4, 1.0) : 1;
      const cx = 135 + i * 230, cy = 250, fixed = st === 'fixed' && (!flip || f > 0.5), sx = flip ? Math.abs(Math.cos(f * Math.PI)) : 1, col = fixed ? GOOD : BAD;
      const g = R.G(cx, cy, 1); g.setAttribute('transform', `translate(${cx} ${cy}) scale(${Math.max(0.05, sx)} 1)`);
      el('rect', { x: -100, y: -70, width: 200, height: 140, rx: 12, fill: fixed ? GOODBG : BADBG, stroke: col, 'stroke-width': 2.5 }, g);
      tx(0, -32, name, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
      tx(0, 2, fixed ? 'FIXED' : 'LIMIT', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, class: 'mono' }, g);
      if (fixed) tx(0, 40, FIX[id][0], { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INK }, g);
      if (flip && st === 'fixed') { // 해결 재료가 카드로 날아든다
        R.fly(cx, 150, cx, 230, E(u, 0.1, 0.5), FIX[id][0]); } });
    const n = LIM.filter(([id]) => b.cardStatus[id] === 'fixed').length, n0 = pv ? LIM.filter(([id]) => pv.cardStatus[id] === 'fixed').length : n;
    mono(480, 370, `${Math.round(R.tween(n0, n, u))} / 4 해결`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: n === 4 ? GOOD : INK });
    if (k === 0) sub(480, 404, '아직 네 칸 모두 한계 상태', fade(u, 2.0), { 'font-size': 14.5 }); }
  function s5def(t, c) { const { k, u } = c;
    if (k === 5) { // R · A · G
      [['R', 'Retrieval', '검색', '질문을 임베딩해 vector DB 에서 찾기'], ['A', 'Augmented', '증강', '찾은 top-k 문서를 prompt 에 붙이기'], ['G', 'Generation', '생성', '그 문서에 근거해서만 답하기']].forEach(([L, en, ko, d], i) => {
        const s = pop(u, 0.2 + i * 0.6), cx = 170 + i * 310;
        card(cx, 140, 110, 110, { rx: 16, text: L, fs: 54, fw: 900, stroke: ACC, color: ACC, fill: ACCBG, s });
        lbl(cx, 225, `${en} · ${ko}`, fade(u, 0.4 + i * 0.6));
        wrap(d, 240, 14.5).forEach((ln, j) => sub(cx, 256 + j * 22, ln, fade(u, 0.6 + i * 0.6), { 'font-size': 14.5, fill: INK }));
        if (i < 2) grow(cx + 62, 140, cx + 248, 140, E(u, 0.6 + i * 0.6, 1.0 + i * 0.6), ACC); });
      pill(480, 370, '네 질문 모두 근거 문서를 붙여 다시 답한다', GOOD, pop(u, 2.1), { fs: 15, fill: GOODBG }); return; }
    if (k === 6) { const lines = ['def rag_answer(question):', '    docs = retriever.search(question, k=3)   # 1) 검색', '    prompt = build_prompt(question, docs)    # 2) 증강', '    return llm.invoke(prompt)                # 3) 생성'];
      snippet(110, 90, lines, { fs: 15.5, op: fade(u, 0.2) });
      const row = Math.min(3, 1 + Math.floor(clamp((u - 0.5) / 1.8) * 3)); el('rect', { x: 112, y: 90 + 10 + row * 23.5, width: 700, height: 24, rx: 4, fill: ACC, opacity: 0.16 });
      [['retriever', INFO], ['prompt', WARN], ['llm', ACC]].forEach(([s, col], i) => { const cx = 220 + i * 260; card(cx, 300, 170, 50, { rx: 25, text: s, mono: true, fs: 16, stroke: col, color: col, s: pop(u, 0.5 + i * 0.6) });
        if (i < 2) grow(cx + 88, 300, cx + 170, 300, E(u, 0.9 + i * 0.6, 1.3 + i * 0.6), MUT); });
      dot([[135, 300], [825, 300]], clamp((u - 0.4) / 2.1), ACC, 7);
      sub(480, 360, '뼈대는 세 줄 — 검색 · 증강 · 생성', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 다음 단계
    lbl(480, 80, '이어서 볼 장', fade(u, 0.2), { 'font-size': 16 });
    [['I-1-2', 'RAG란 무엇인가'], ['I-1-3', 'RAG 파이프라인 전체 흐름'], ['I-2-2', 'RAG vs Fine-tuning']].forEach(([id, s], i) => {
      const y = 140 + i * 78, sc = pop(u, 0.4 + i * 0.4);
      card(480, y, 460, 58, { rx: 12, stroke: i === 0 ? ACC : GRID, fill: i === 0 ? ACCBG : PANEL, s: sc });
      if (sc > 0.3) { mono(290, y + 6, id, { 'font-size': 16, 'font-weight': 800, fill: ACC }); tx(370, y + 6, s, { 'font-size': 16, 'font-weight': 700 }); } });
    sub(480, 390, '다음 장에서 검색 · 증강 · 생성을 한 단계씩 연다', fade(u, 1.8), { 'font-size': 14.5 }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '학습이 2025년 4월에 끝난 모델이 2026년 출시 제품 가격을 모르는 까닭은 무엇인가?',
      o: ['질문이 너무 짧아서', '가중치가 학습 종료 시점에 멈춰 그 뒤 사실이 없어서', '모델이 영어 질문만 이해해서'], a: 1,
      why: '가중치는 학습이 끝난 순간 동결된다. 마감선 뒤에 생긴 사건은 추론으로도 만들어 낼 수 없다.' },
    { q: '사내 리프레시 휴가 규정을 물었을 때 LLM이 근로기준법 일반론만 답하는 원인은 무엇인가?',
      o: ['사내 인사규정 PDF가 학습 데이터에 들어간 적이 없어서', 'temperature가 너무 높아서', '질문에 회사 이름을 안 넣어서'], a: 0,
      why: '학습 데이터는 공개 웹·서적·논문이다. 회사 고유의 5년 근속 7일 같은 규정은 모델이 본 적이 없다.' },
    { q: '없는 슈퍼노바 칩을 물었는데 1만 큐비트 달성이라고 답한 것은 어떤 동작 때문인가?',
      o: ['검색 결과를 잘못 읽어서', '사실을 검증한 뒤 틀린 값을 골라서', '다음 토큰 확률만 따라 그럴듯한 말을 이어서'], a: 2,
      why: 'LLM은 다음 토큰 확률 분포를 따라 문장을 잇고 사실 확인 단계가 없다. 그래서 모르는 것도 자신 있게 지어낸다.' },
    { q: '오늘 환율을 알게 하려고 모델을 매일 재학습하지 않는 이유는 무엇인가?',
      o: ['재학습 1회에 수천만 달러 이상과 수개월이 들어서', '재학습하면 환율 정보가 지워져서', '환율은 학습 데이터로 쓸 수 없어서'], a: 0,
      why: 'GPT-4 규모 학습은 추정 수천만 달러 이상, 기간은 수개월이다. 그래서 모델은 6~12개월 주기로만 바뀐다.' },
    { q: 'RAG가 네 한계를 한꺼번에 푸는 방법은 무엇인가?',
      o: ['질문마다 가중치를 조금씩 다시 학습한다', '질문 시점에 외부 문서를 검색해 prompt에 붙인다', '답변을 여러 번 만들어 다수결로 고른다'], a: 1,
      why: '가중치는 그대로 두고 최신 문서·사내 DB·출처·실시간 데이터를 그때그때 찾아 붙인다. 검색, 증강, 생성의 세 단계다.' },
  ];

  const summary = [
    'LLM은 학습이 끝난 시점에 가중치가 멈춰 그 뒤 사실을 모른다.',
    '사내 규정처럼 공개되지 않은 문서는 학습한 적이 없어 일반론만 답한다.',
    '사실 확인 없이 다음 토큰 확률을 따르므로 없는 것도 그럴듯하게 지어낸다.',
    '재학습 대신 질문할 때 문서를 검색해 prompt에 붙이면 네 한계가 함께 풀린다.',
  ];
  const review = [
    { q: '사내 챗봇이 작년 휴가 규정으로 답하고, 없는 조항까지 지어냈다. 먼저 손댈 것은?',
      o: ['모델을 더 큰 것으로 바꿔 지식을 늘린다', '최신 규정을 검색해 붙이고 출처 없으면 답하지 않게 한다', 'temperature를 높여 답을 더 다양하게 만든다'], a: 1,
      why: '낡은 정보는 지식 단절과 정적 한계, 지어낸 조항은 환각이다. 최신 문서 검색과 출처 기반 답변이 두 문제를 함께 다룬다.' },
    { q: '규정 문서 전체를 매번 system prompt에 넣기로 했다. 가장 먼저 부딪힐 문제는?',
      o: ['질문마다 전체 규정이 붙어 토큰과 비용이 는다', '모델이 긴 문서를 전혀 읽지 못한다', '가중치가 바뀌어 매번 다른 답을 한다'], a: 0,
      why: '모든 질문에 전체 문서가 붙으니 토큰이 폭증하고 규정이 바뀔 때마다 prompt도 고쳐야 한다. 관련 조항만 검색해 붙이는 것이 RAG다.' },
    { q: '네 한계 가운데 모델을 바꾸지 않고 출처 확인만으로 줄일 수 있는 것은?',
      o: ['지식 단절', '정적', '환각'], a: 2,
      why: '근거 문서에만 기대어 답하게 하고 출처가 없으면 모른다고 하게 하면 지어내기가 줄어든다. 지식 단절과 정적은 새 문서를 가져와야 풀린다.' },
  ];

  R.page({ title: 'LLM의 네 가지 한계', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
