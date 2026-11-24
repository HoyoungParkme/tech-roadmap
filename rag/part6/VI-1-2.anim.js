/* VI-1-2 CRAG — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 문서·점수·판정은 페이지 STEPS 의 docs / evaluator / webResults / finalAnswer 를 읽는다. 답변 문장과 재작성 쿼리는 예시 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, dot, cross, check, dbIcon, browser, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const LCOL = { Correct: GOOD, Ambiguous: WARN, Incorrect: BAD };
  const LBG = { Correct: GOODBG, Ambiguous: WARNBG, Incorrect: BADBG };
  const scol = (v) => (v >= 0.7 ? GOOD : v >= 0.5 ? WARN : BAD);
  const hsh = (i) => { const s = Math.sin((i + 1) * 91.17) * 43758.5453; return s - Math.floor(s); };

  function bubble(x, y, s, o) { o = o || {}; const fs = o.fs || 15, w = tw(s, fs) + 30, h = fs + 20, g = G(x, y, o.s, o.op);
    el('path', { d: `M18,${h / 2 - 3} l-8,12 l20,-10`, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: 0, y: -h / 2, width: w, height: h, rx: h / 2, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2 }, g);
    tx(15, fs * 0.36, s, { 'font-size': fs, 'font-weight': 700, fill: o.color || INK, class: o.mono ? 'mono' : null }, g); return w; }
  // 문서 한 줄: id · 제목 · 점수 막대 · (판정)
  function row(cx, cy, d, o) { o = o || {}; const w = o.w || 400, h = 50, g = G(cx, cy, o.s, o.op), lab = o.label === undefined ? d.evalLabel : o.label;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.gone ? SOFT : PANEL, stroke: lab ? LCOL[lab] : GRID, 'stroke-width': lab ? 2.4 : 1.8 }, g);
    mono(-w / 2 + 12, 6, d.id, { 'font-size': 14.5, 'font-weight': 800, fill: d.id[0] === 'w' ? INFO : ACC }, g);
    tx(-w / 2 + 44, -3, d.title.length > 18 ? d.title.slice(0, 17) + '…' : d.title, { 'font-size': 14.5, 'font-weight': 700, fill: o.gone ? MUT : INK }, g);
    if (d.score != null) { const bw = 120; el('rect', { x: -w / 2 + 44, y: 9, width: bw, height: 7, rx: 3, fill: SOFT }, g);
      el('rect', { x: -w / 2 + 44, y: 9, width: bw * d.score * (o.bar ?? 1), height: 7, rx: 3, fill: scol(d.score) }, g);
      mono(-w / 2 + 52 + bw, 17, d.score.toFixed(2), { 'font-size': 13.5, 'font-weight': 800, fill: scol(d.score) }, g); }
    if (lab && o.tag !== false) card(w / 2 - 54, 0, 92, 26, { rx: 13, text: lab, fs: 13.5, fw: 800, stroke: 'none', fill: LCOL[lab], color: PANEL, p: g });
    if (o.gone) el('line', { x1: -w / 2 + 8, y1: 0, x2: w / 2 - 8, y2: 0, stroke: BAD, 'stroke-width': 2.2 }, g);
    return g; }
  const Q = '대한민국의 최신 AI 규제법은?';

  // ---------- 1. 검색 ----------
  const SP = { x: 20, y: 70, w: 440, h: 320 }, QP = [240, 220], DP = { d1: [300, 175], d2: [340, 300], d3: [90, 330] };
  function space(u) { zone(SP.x, SP.y, SP.w, SP.h, '임베딩 공간 (2D로 줄여 그림)', {});
    for (let i = 0; i < 34; i++) { const s = clamp(u * 34 - i); if (s <= 0) continue; const x = SP.x + 24 + hsh(i) * (SP.w - 48), y = SP.y + 44 + hsh(i + 50) * (SP.h - 64);
      if (Math.hypot(x - QP[0], y - QP[1]) < 40) continue; el('circle', { cx: x, cy: y, r: 4.5 * s, fill: OFF }); } }
  function s1(t, c) { const { k, u } = c, docs = c.beat.docs, pn = c.prev ? c.prev.docs.length : 0;
    bubble(20, 32, Q, { s: k === 0 ? pop(u, 0.1) : 1 });
    space(k === 0 ? E(u, 0.3, 1.8) : 1);
    tx(560, 74, `후보 top-3`, { 'font-size': 15, 'font-weight': 800 }); mono(940, 74, `${docs.length} / 3`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: docs.length ? ACC : MUT });
    if (k === 0) { [0, 1, 2].forEach((i) => card(735, 120 + i * 66, 400, 50, { rx: 8, stroke: GRID, dash: '5 5', fill: SOFT, op: fade(u, 1.6) })); return; }
    // 질문 점
    const qs = k === 1 ? pop(u, 0.1) : 1; el('circle', { cx: QP[0], cy: QP[1], r: 10 * qs, fill: INFO }); lbl(QP[0], QP[1] + 30, 'q', qs, { fill: INFO, 'font-size': 16 });
    docs.forEach((d, i) => { const fresh = i >= pn, a = fresh ? E(u, 0.5 + (i - pn) * 0.4, 1.3 + (i - pn) * 0.4) : 1, p = DP[d.id];
      el('line', { x1: QP[0], y1: QP[1], x2: lerp(QP[0], p[0], a), y2: lerp(QP[1], p[1], a), stroke: scol(d.score), 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
      el('circle', { cx: p[0], cy: p[1], r: 8, fill: scol(d.score) }); mono(p[0] + 12, p[1] - 10, d.id, { 'font-size': 14.5, 'font-weight': 800, fill: scol(d.score) });
      if (a >= 1) mono((QP[0] + p[0]) / 2 + 8, (QP[1] + p[1]) / 2 + 18, d.score.toFixed(2), { 'font-size': 14, 'font-weight': 800, fill: scol(d.score), opacity: fresh ? fade(u, 1.3 + (i - pn) * 0.4) : 1 });
      const f = fresh ? E(u, 1.4 + (i - pn) * 0.4, 2.2 + (i - pn) * 0.4) : 1; if (f > 0) row(lerp(Math.max(p[0], 250), 735, f), lerp(p[1], 120 + i * 66, f), d, { s: 0.6 + 0.4 * f }); });
    for (let i = docs.length; i < 3; i++) card(735, 120 + i * 66, 400, 50, { rx: 8, stroke: GRID, dash: '5 5', fill: SOFT });
    if (k === 3) { const a = fade(u, 0.3);
      grow(735, 220 + 30, 735, 318, E(u, 0.2, 0.7), MUT);
      card(735, 340, 260, 40, { rx: 20, text: '바로 답변 생성 (일반 RAG)', fs: 14.5, stroke: MUT, color: MUT, op: a }); cross(880, 340, 10, pop(u, 0.9));
      card(735, 396, 300, 38, { rx: 10, text: 'Retrieval Evaluator 로 넘긴다', fs: 15, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.5) }); } }

  // ---------- 2. Evaluator ----------
  const BINS = [['Correct', '직접 매칭 · 핵심 정보 포함', 92], ['Ambiguous', '부분 매칭 · 추가 검증 필요', 200], ['Incorrect', '무관하거나 오답', 308]];
  function s2(t, c) { const { k, u } = c, docs = c.beat.docs, pd = c.prev ? c.prev.docs : docs;
    bubble(20, 32, Q, { fs: 14.5 });
    // 오른쪽 세 칸
    BINS.forEach(([n, why, y], i) => { const sc = k === 0 ? pop(u, 0.3 + i * 0.3) : 1;
      card(770, y, 320, 88, { rx: 12, stroke: LCOL[n], sw: 2.4, fill: LBG[n], s: sc });
      tx(624, y - 18, n, { 'font-size': 17, 'font-weight': 800, fill: LCOL[n], class: 'mono', opacity: sc });
      tx(624, y + 34, why, { 'font-size': 13.5, fill: MUT, opacity: k === 0 ? 0 : k === 1 ? fade(u, 0.4 + i * 0.3) : 1 }); });
    if (k === 0) { mono(30, 400, 'label: Literal["Correct", "Ambiguous", "Incorrect"]', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.5) }); }
    // 평가기
    const on = c.beat.evaluator && c.beat.evaluator.active;
    card(470, 200, 120, 60, { rx: 30, text: 'Evaluator', fs: 15, fw: 800, stroke: on ? ACC : GRID, color: on ? ACC : MUT, fill: on ? ACCBG : SOFT, s: k === 1 ? pop(u, 0.2) : 1 });
    if (on) mono(470, 248, 'gpt-4o-mini', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    docs.forEach((d, i) => { const y = 120 + i * 70, lab = d.evalLabel, fresh = lab && !(pd[i] && pd[i].evalLabel), order = docs.slice(0, i).filter((x, j) => x.evalLabel && !(pd[j] && pd[j].evalLabel)).length;
      const a = fresh ? E(u, 0.3 + order * 0.7, 1.1 + order * 0.7) : lab ? 1 : 0;
      row(215, y, d, { w: 390, label: a >= 1 ? lab : null });
      if (lab && a > 0) { const by = BINS.find((b) => b[0] === lab)[2], slot = docs.slice(0, i).filter((x) => x.evalLabel === lab).length;
        if (a < 1) dot([[410, y], [470, 200], [690, by]], a, LCOL[lab], 7);
        else card(722 + slot * 62, by + 6, 54, 30, { rx: 15, text: d.id, mono: true, fs: 14, fw: 800, stroke: 'none', fill: LCOL[lab], color: PANEL, s: fresh ? pop(u, 1.1 + order * 0.7, 0.4) : 1 }); } });
    if (k === 4) { const rules = [['Correct ≥ 2 ?', '1개', false], ['Incorrect ≥ 2 ?', '1개', false]];
      rules.forEach(([a, b, ok], i) => { const y = 340 + i * 30, op = fade(u, 0.3 + i * 0.5); mono(30, y, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(200, y, b, { 'font-size': 15, fill: MUT, opacity: op }); cross(262, y - 5, 7, op); });
      card(470, 372, 190, 40, { rx: 20, text: '→ Ambiguous', fs: 16, fw: 800, stroke: 'none', fill: WARN, color: PANEL, s: pop(u, 1.5) }); } }

  // ---------- 3. Correct ----------
  function fork(active, u0) { const xs = { correct: 220, ambiguous: 480, incorrect: 740 }, names = { correct: 'Correct · 내부만', ambiguous: 'Ambiguous · 결합', incorrect: 'Incorrect · 웹만' }, cols = { correct: GOOD, ambiguous: WARN, incorrect: BAD };
    Object.keys(xs).forEach((key) => { const on = key === active; card(xs[key], 30, 220, 34, { rx: 17, text: names[key], fs: 14.5, fw: 800, stroke: on ? cols[key] : GRID, fill: on ? cols[key] : SOFT, color: on ? PANEL : OFF, s: on ? u0 : 1 }); }); }
  const FRAG = { d1: ['인공지능 사업자 의무', '고위험 AI 정의', '영향평가 절차'], d2: ['자동화 처리 거부권', '프로파일링 설명 의무'], d3: ['EO 14110 핵심 조치', '각 부처 보고 의무'] };
  function s3(t, c) { const { k, u } = c, docs = c.beat.docs;
    fork('correct', k === 0 ? pop(u, 0.2) : 1);
    if (k === 0) tx(940, 72, '가정: Correct 다수', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    // 문서 → 조각
    docs.forEach((d, i) => { const y = 110 + i * 100, sp = k === 0 ? E(u, 1.0, 2.2) : 1;
      if (sp < 0.5) row(240, y, d, { w: 400, tag: false, op: 1 - sp * 2 });
      if (sp <= 0.5) return;
      mono(30, y - 22, d.id, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: sp });
      FRAG[d.id].forEach((f, j) => { const drop = d.id === 'd3' && k >= 1, fu = drop ? (k === 1 ? E(u, 0.4 + j * 0.2, 1.4 + j * 0.2) : 1) : 0;
        const x = 30 + j * 150, w = tw(f, 13.5) + 18;
        card(x + w / 2, y + 8 + fu * 40, w, 30, { rx: 6, text: f, fs: 13.5, fw: 600, stroke: drop ? BAD : d.refined || k >= 2 ? GOOD : GRID, color: drop ? MUT : INK, fill: drop ? SOFT : PANEL, op: (1 - fu * 0.7) * sp, s: 0.8 + 0.2 * sp }); });
      if (d.id === 'd3' && k >= 1) tx(330, y + 70, '대한민국 질문과 무관 → 버린다', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.6) : 1 }); });
    if (k >= 2) { const a = k === 2 ? fade(u, 0.2) : 1;
      card(745, 140, 360, 96, { rx: 10, stroke: INK, op: a });
      mono(580, 116, 'ANSWER_PROMPT', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: a });
      tx(580, 146, '정제된 내부 문서만 근거로', { 'font-size': 15.5, 'font-weight': 700, opacity: a }); tx(580, 172, '한국어로 답하라', { 'font-size': 15.5, 'font-weight': 700, opacity: a });
      if (k === 2) { dot([[480, 120], [565, 140]], seg(u, 0.8, 1.6), GOOD, 7); dot([[340, 220], [565, 160]], seg(u, 1.2, 2.0), GOOD, 7); } }
    if (k >= 3 && c.beat.finalAnswer) { const fa = c.beat.finalAnswer, a = k === 3 ? fade(u, 0.3) : 1;
      tx(580, 222, '최종 답변 (예시 출력)', { 'font-size': 13.5, fill: MUT, opacity: a });
      card(745, 282, 360, 84, { rx: 10, stroke: GOOD, sw: 2, fill: GOODBG, op: a });
      tx(580, 270, '고위험 AI 사업자에게 영향평가 의무,', { 'font-size': 14.5, 'font-weight': 700, opacity: a }); tx(580, 294, '자동화 처리 거부권 보장', { 'font-size': 14.5, 'font-weight': 700, opacity: a });
      fa.citations.forEach((ci, i) => card(600 + i * 60, 346, 50, 24, { rx: 12, text: ci, mono: true, fs: 13.5, fw: 800, stroke: 'none', fill: ACC, color: PANEL, s: k === 3 ? pop(u, 1.0 + i * 0.2) : 1 })); }
    if (k === 4) { card(745, 395, 360, 36, { rx: 18, text: '웹 0회 · LLM 4회 (정제 3 + 답 1)', fs: 15, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 0.3) }); } }

  // ---------- 4. Incorrect ----------
  function s4(t, c) { const { k, u } = c, docs = c.beat.docs, web = c.beat.webResults || [], pw = (c.prev && c.prev.webResults) || [];
    fork('incorrect', k === 0 ? pop(u, 0.2) : 1);
    if (k === 0) tx(940, 72, '가정: Incorrect 다수', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    // 버린 내부 문서
    if (k < 6) docs.forEach((d, i) => { const a = k === 0 ? E(u, 0.4 + (2 - i) * 0.5, 1.0 + (2 - i) * 0.5) : 1;
      row(lerp(240, 170, a), lerp(110 + i * 62, 280 + i * 54, a), d, { w: lerp(400, 300, a), gone: a > 0.5, tag: false, op: 1 - a * 0.45, s: 1 }); });
    if (k < 6) tx(30, 246, '내부 문서 폐기', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: k === 0 ? fade(u, 1.6) : 1 });
    // 쿼리 재작성
    if (k >= 1) { const a = k === 1 ? E(u, 0.3, 1.6) : 1;
      bubble(30, 100, Q, { fs: 14.5, op: 1 - a * 0.5 });
      grow(140, 124, 140, 158, a, MUT);
      bubble(30, 186, '대한민국 AI 기본법 최신', { fs: 15, fill: ACCBG, stroke: ACC, s: k === 1 ? pop(u, 1.3) : 1 });
      tx(300, 222, '재작성 쿼리 (예시)', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 1.6) : 1 }); }
    if (k === 0) { card(745, 200, 360, 90, { rx: 10, stroke: INK, s: pop(u, 1.4) }); mono(580, 180, 'REWRITE_PROMPT', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      tx(580, 210, '조사·접속사 빼고 핵심 명사 위주', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.7) }); tx(580, 234, '최신성 키워드 추가', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // 웹 검색
    if (k >= 2) { browser(745, 150, 380, 150, 'Tavily 웹 검색 · top-3', { s: k === 2 ? pop(u, 0.1) : 1 });
      if (k === 2) dot([[260, 186], [555, 150]], seg(u, 0.3, 0.9), INFO, 7);
      web.forEach((w, i) => { const fresh = i >= pw.length, a = fresh ? E(u, 0.8 + (i - pw.length) * 0.4, 1.4 + (i - pw.length) * 0.4) : 1; if (a <= 0) return;
        row(745, 118 + i * 44, w, { w: 350, bar: a, tag: false }); }); }
    if (k >= 4) { const a = k === 4 ? fade(u, 0.2) : 1;
      card(745, 290, 380, 50, { rx: 10, stroke: INFO, op: a }); tx(570, 296, '웹 결과만 근거로 · 출처 표기', { 'font-size': 15, 'font-weight': 700, opacity: a }); }
    if (k >= 5 && c.beat.finalAnswer) { const a = k === 5 ? fade(u, 0.3) : 1;
      tx(560, 340, '최종 답변 (예시 출력)', { 'font-size': 13.5, fill: MUT, opacity: a });
      tx(560, 366, '2024년 12월 AI 기본법 국회 통과', { 'font-size': 15, 'font-weight': 700, opacity: a });
      c.beat.finalAnswer.citations.forEach((ci, i) => card(580 + i * 62, 396, 52, 26, { rx: 13, text: ci, mono: true, fs: 13.5, fw: 800, stroke: 'none', fill: INFO, color: PANEL, s: k === 5 ? pop(u, 1.0 + i * 0.2) : 1 })); }
    if (k === 6) banner(240, 320, '낡은 인덱스 대신 웹으로 바로잡는다', pop(u, 0.3)); }

  // ---------- 5. Ambiguous ----------
  function s5(t, c) { const { k, u } = c, docs = c.beat.docs, web = c.beat.webResults || [], pw = (c.prev && c.prev.webResults) || [];
    if (k <= 3) { fork('ambiguous', k === 0 ? pop(u, 0.2) : 1);
      // 내부 막대 + 0.5 임계선
      const x0 = 150, bw = 260, X = (v) => x0 + bw * v;
      tx(30, 84, '[내부] 점수 ≥ 0.5 만', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      docs.forEach((d, i) => { const y = 108 + i * 40, out = k >= 1 && d.score < 0.5;
        mono(30, y + 15, d.id, { 'font-size': 14.5, 'font-weight': 800, fill: out ? MUT : ACC }); el('rect', { x: x0, y, width: bw, height: 20, rx: 4, fill: SOFT });
        el('rect', { x: x0, y, width: bw * d.score, height: 20, rx: 4, fill: out ? OFF : scol(d.score) }); mono(X(1) + 8, y + 16, d.score.toFixed(2), { 'font-size': 14, 'font-weight': 800, fill: out ? MUT : INK });
        if (out) cross(X(1) + 66, y + 10, 8, k === 1 ? pop(u, 1.4) : 1); });
      if (k >= 1) { const a = k === 1 ? E(u, 0.3, 1.1) : 1; el('line', { x1: X(0.5), y1: 98, x2: X(0.5), y2: lerp(98, 236, a), stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); mono(X(0.5), 250, '0.5', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: a }); }
      // 웹 막대
      tx(540, 84, '[웹] k=2 보강', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k >= 2 ? 1 : 0.35 });
      if (k >= 2) web.forEach((w, i) => { const fresh = i >= pw.length, a = fresh ? E(u, 0.3 + i * 0.4, 1.1 + i * 0.4) : 1, y = 108 + i * 40;
        mono(540, y + 15, w.id, { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: a > 0 ? 1 : 0 }); el('rect', { x: 580, y, width: 260, height: 20, rx: 4, fill: SOFT });
        el('rect', { x: 580, y, width: 260 * w.score * a, height: 20, rx: 4, fill: INFO }); if (a >= 1) mono(848, y + 16, w.score.toFixed(2), { 'font-size': 14, 'font-weight': 800 }); });
      else if (k < 2) card(710, 128, 300, 50, { rx: 8, stroke: GRID, dash: '5 5', fill: SOFT });
      // 결합 프롬프트
      const pa = k === 0 ? pop(u, 0.6) : 1;
      card(480, 330, 880, 112, { rx: 12, stroke: INK, s: pa });
      mono(56, 296, 'COMBINED_PROMPT', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: pa });
      tx(230, 296, '두 소스를 함께 쓰고, 충돌하면 최신 웹 우선', { 'font-size': 14.5, 'font-weight': 700, opacity: pa });
      [['[내부]', GOOD, 140, ['d1', 'd2']], ['[웹]', INFO, 520, ['w1', 'w2']]].forEach(([n, col, x, ids], j) => {
        card(x + 150, 348, 340, 44, { rx: 8, stroke: col, dash: '5 4', fill: SOFT, op: pa }); mono(x - 6, 354, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: pa });
        const fill = j === 0 ? (k >= 1 ? (k === 1 ? E(u, 1.6, 2.4) : 1) : 0) : (k >= 2 ? (k === 2 ? E(u, 1.6, 2.4) : 1) : 0);
        ids.forEach((id, i) => { if (fill > 0) card(x + 90 + i * 70, 348, 58, 28, { rx: 14, text: id, mono: true, fs: 14, fw: 800, stroke: 'none', fill: col, color: PANEL, s: clamp(fill * 2 - i * 0.5) }); }); });
      if (k === 3) { card(480, 404, 600, 30, { rx: 15, text: '답 (예시): AI 기본법 초안이 2024년 12월 국회를 통과했다', fs: 14, fw: 700, stroke: WARN, fill: WARNBG, s: pop(u, 0.4) }); }
      return; }
    // k4, k5: crag() 디스패처
    bubble(20, 60, Q, { fs: 14.5 });
    card(330, 60, 150, 40, { text: 'retrieve k=3', mono: true, fs: 14, stroke: INK }); card(330, 130, 150, 40, { text: 'evaluate ×3', mono: true, fs: 14, stroke: INK });
    grow(330, 82, 330, 106, 1, MUT);
    const dia = (x, y, s) => { const g = G(x, y, s); el('path', { d: 'M0,-34 L80,0 L0,34 L-80,0 Z', fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }, g); mono(0, 5, 'aggregate', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }, g); };
    dia(330, 220, k === 4 ? pop(u, 0.2) : 1); grow(330, 152, 330, 184, k === 4 ? E(u, 0.2, 0.6) : 1, MUT);
    const OUT = [['Correct', 'answer_correct()', 290], ['Ambiguous', 'answer_ambiguous()', 340], ['Incorrect', 'answer_incorrect()', 390]];
    OUT.forEach(([n, f, y], i) => { const a = k === 4 ? E(u, 0.6 + i * 0.3, 1.2 + i * 0.3) : 1;
      el('path', { d: `M410,220 C470,220 470,${y} ${lerp(410, 530, a)},${y}`, fill: 'none', stroke: LCOL[n], 'stroke-width': 2.2, opacity: a > 0 ? 1 : 0 });
      if (a >= 1) { mono(540, y + 5, n, { 'font-size': 14.5, 'font-weight': 800, fill: LCOL[n] }); mono(660, y + 5, f, { 'font-size': 14.5 }); } });
    if (k === 4) return;
    // k5: 라벨 조합에 따라 자동으로 갈린다 (aggregate 를 실제로 돌린 결과)
    const ex = [[['C', 'C', 'I'], 'Correct'], [['C', 'A', 'I'], 'Ambiguous'], [['I', 'I', 'A'], 'Incorrect']];
    tx(560, 74, 'labels', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(800, 74, '분기', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    ex.forEach(([ls, out], i) => { const y = 112 + i * 50, a = fade(u, 0.3 + i * 0.5);
      ls.forEach((l, j) => { const n = { C: 'Correct', A: 'Ambiguous', I: 'Incorrect' }[l]; card(580 + j * 46, y, 38, 30, { rx: 6, text: l, mono: true, fs: 14.5, fw: 800, stroke: 'none', fill: LCOL[n], color: PANEL, op: a }); });
      grow(722, y, 770, y, a, MUT); mono(780, y + 5, out, { 'font-size': 15, 'font-weight': 800, fill: LCOL[out], opacity: a }); }); }

  const quiz = [
    { q: 'CRAG가 검색 직후 일반 RAG와 다르게 하는 일은 무엇인가?',
      o: ['후보를 바로 LLM에 넣어 답을 만든다', '검색을 생략하고 웹으로 간다', '답을 만들기 전에 Evaluator에게 후보 품질을 판정받는다'], a: 2,
      why: '후보 3건(0.82, 0.65, 0.41)이 모여도 품질은 모른다. CRAG는 생성으로 가기 전에 평가 단계를 넣는다.' },
    { q: '라벨이 [Correct, Ambiguous, Incorrect]로 갈렸을 때 aggregate의 결정은 무엇인가?',
      o: ['Correct', 'Ambiguous', 'Incorrect'], a: 1,
      why: 'Correct도 Incorrect도 2개 이상이 아니므로 마지막 줄의 Ambiguous가 돌아온다.' },
    { q: 'Correct 분기에서 웹 검색은 몇 번 호출되는가?',
      o: ['0번', '1번', '문서 수만큼'], a: 0,
      why: '내부 문서를 문장 단위로 정제한 뒤 바로 답한다. 외부 호출이 없어 가장 빠르고 싸다.' },
    { q: 'Incorrect 분기에서 웹 검색 전에 질문을 다시 쓰는 이유는 무엇인가?',
      o: ['내부 인덱스에 다시 넣으려고', '웹 검색에 맞는 핵심 명사·최신성 키워드 형태로 바꾸려고', '답변 길이를 줄이려고'], a: 1,
      why: '조사·접속사를 빼고 검색 친화적인 키워드로 바꾸면 웹 검색 결과가 좋아진다.' },
    { q: 'Ambiguous 분기에서 d3(0.41)가 결합 컨텍스트에서 빠지는 이유는 무엇인가?',
      o: ['score 0.5 미만이라서', '웹 결과와 내용이 충돌해서', 'Correct 판정을 받아서'], a: 0,
      why: 'answer_ambiguous는 score ≥ 0.5인 내부 문서만 남긴다. d1(0.82)과 d2(0.65)만 웹 결과와 합쳐진다.' },
  ];

  const summary = [
    '일반 RAG는 검색 결과를 의심하지 않고 그대로 답에 쓴다.',
    'CRAG는 문서마다 Correct, Ambiguous, Incorrect를 매기고 그 결과로 갈 길을 정한다.',
    'Correct면 내부 문서만 정제해 쓰고, Incorrect면 내부를 버리고 웹으로 검색한다.',
    'Ambiguous면 점수 0.5 이상 내부 문서와 웹 2건을 합치며 비용이 가장 크다.',
  ];
  const review = [
    { q: '사내 인덱스가 1년 전에 멈췄는데 최신 법령 질문이 들어왔다. 평가가 Incorrect 다수로 나오면 CRAG는 무엇을 하나?',
      o: ['낡은 내부 문서로 그대로 답한다', '내부 문서를 버리고 쿼리를 재작성해 웹 검색으로 답한다', '사용자에게 답할 수 없다고만 한다'], a: 1,
      why: 'Incorrect 분기는 내부 결과를 폐기하고 재작성 쿼리로 웹 top-3을 받아 답한다.' },
    { q: 'CRAG 운영 비용이 예상보다 크다. 로그를 보니 거의 모든 질문이 Ambiguous로 간다. 먼저 손볼 곳은?',
      o: ['Evaluator의 판정 기준과 집계 규칙', '웹 검색 결과 개수 k=2', '답변 프롬프트의 문장 수'], a: 0,
      why: 'Ambiguous는 내부 정제와 웹 검색을 모두 해서 가장 비싸다. 판정이 한쪽으로 쏠리면 평가 기준부터 봐야 한다.' },
    { q: '세 문서가 모두 Correct로 판정됐지만 그중 하나는 다른 나라 법 이야기다. CRAG에서 이것을 걸러 내는 장치는?',
      o: ['쿼리 재작성', '웹 검색 보강', 'Knowledge Refinement의 문장 정제'], a: 2,
      why: 'Correct 분기도 문서를 문장 단위로 쪼개 질문과 무관한 문장을 버린 뒤 답한다.' },
  ];

  R.page({ title: 'CRAG 평가와 세 갈래', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
