/* III-1-2 LLM-as-Judge — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * judge 의 출력(점수·이유·분포·카테고리 빈도)은 페이지 코드의 예시 값이다. 승수 175/280/45, 비용 표는 코드·문서의 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, cross, check, dot, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ex = (x, y, op) => pill(x, y, '예시', WARN, 1, { fs: 13.5, op });

  function model(cx, cy, name, role, col, o) { o = o || {};
    card(cx, cy, 190, 74, { rx: 14, stroke: col, sw: 2.5, fill: o.fill || PANEL, s: o.s, op: o.op });
    tx(cx, cy - 4, name, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, class: 'mono', opacity: (o.op ?? 1) * clamp(o.s ?? 1) });
    tx(cx, cy + 20, role, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: (o.op ?? 1) * clamp(o.s ?? 1) });
    if (o.lamp) el('circle', { cx: cx + 80, cy: cy - 22, r: 6, fill: o.lamp }); }
  // 1~hi 눈금자. 돌려준 X(v)
  function ruler(x, y, w, hi, o) { o = o || {}; const X = (v) => x + ((v - 1) / (hi - 1)) * w, op = o.op ?? 1;
    el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: INK, 'stroke-width': 2.5, opacity: op });
    for (let v = 1; v <= hi; v++) { el('line', { x1: X(v), y1: y - 7, x2: X(v), y2: y + 7, stroke: INK, 'stroke-width': 2, opacity: op });
      mono(X(v), y + 28, String(v), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); }
    return X; }

  // ---------- 1. 기본 아이디어 ----------
  const RUB5 = [['5', '정확 · 친절 · 컨텍스트 충실'], ['4', '정확하지만 친절도 부족'], ['3', '부분 정확'], ['2', '부정확한 부분'], ['1', '사실과 다름']];
  function s1(t, c) { const { k, u } = c;
    const A = { x: 140, y: 96 }, J = { x: 820, y: 96 };
    model(A.x, A.y, 'gpt-3.5', '답변 모델 (actor)', INFO, { s: k === 0 ? pop(u, 0.2) : 1 });
    model(J.x, J.y, 'gpt-4', '채점 모델 (judge)', ACC, { s: k === 0 ? pop(u, 0.8) : 1, lamp: k === 5 ? (Math.floor(t * 4) % 2 ? ACC : OFF) : null });
    if (k === 0) { el('line', { x1: 480, y1: 40, x2: 480, y2: 380, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.2) });
      note(240, 220, '답을 쓰는 쪽', fade(u, 1.4), { 'text-anchor': 'middle', fill: INFO }); note(720, 220, '채점하는 쪽', fade(u, 1.5), { 'text-anchor': 'middle', fill: ACC });
      note(480, 300, '처음부터 두 모델을 나눈다 — 자기 답을 자기가 채점하면 편향', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT }); return; }
    // 답변
    const ansY = 250;
    if (k === 1) { fly(140, 380, A.x, A.y + 40, seg(u, 0.1, 0.9), '질문: 환불 정책 알려주세요');
      fly(140, 330, A.x, A.y + 40, seg(u, 0.5, 1.3), '컨텍스트: 7일 이내 · 미개봉만', { fill: INK }); }
    const typed = k === 1 ? E(u, 1.4, 2.6) : 1, ans = '"구매 후 7일 이내, 미개봉 상품에 한해 환불 가능합니다."';
    if (typed > 0) { const ax = k >= 2 ? 120 : 30; card(ax + 130, ansY - 6, 260, 92, { rx: 12, stroke: INFO, sw: 2, fill: INFOBG, op: k >= 4 ? 0.5 : 1 });
      tx(ax + 14, ansY - 22, 'answer', { 'font-size': 13.5, 'font-weight': 700, fill: INFO }); ex(ax + 220, ansY - 30, 1);
      tx(ax + 14, ansY + 4, ans.slice(0, Math.round(16 * typed)), { 'font-size': 14 }); if (typed > 0.5) tx(ax + 14, ansY + 26, ans.slice(16, 16 + Math.round(ans.length * (typed - 0.5) * 2)), { 'font-size': 14 }); }
    if (k === 1) return;
    // JUDGE_PROMPT 종이
    const px = 360, py = 40, pw = 260, ph = 330, mv = k === 5 ? E(u, 0.3, 1.6) : k === 6 ? 1 : 0;
    const ox = lerp(0, 330, mv), sc = lerp(1, 0.35, mv), opP = k === 6 ? 0 : 1 - mv * 0.6;
    if (opP > 0) { const g = R.G(px + ox, py + mv * 40, sc, opP);
      el('rect', { x: 0, y: 0, width: pw, height: ph, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 }, g);
      el('rect', { x: 0, y: 0, width: pw, height: 34, rx: 8, fill: INK }, g);
      tx(14, 23, 'JUDGE_PROMPT', { 'font-size': 14.5, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
      tx(14, 58, '1~5점으로 평가하라', { 'font-size': 14, 'font-weight': 700 }, g);
      if (k >= 3) RUB5.forEach(([n, d], i) => { const o = k === 3 ? fade(u, 0.2 + i * 0.35) : 1;
        el('rect', { x: 12, y: 72 + i * 30, width: 26, height: 24, rx: 5, fill: i === 0 ? GOOD : i === 4 ? BAD : SOFT, opacity: o }, g);
        mono(25, 89 + i * 30, n, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 0 || i === 4 ? PANEL : INK, opacity: o }, g);
        tx(46, 89 + i * 30, d, { 'font-size': 13.5, opacity: o }, g); });
      if (k >= 4) { ['{context}', '{question}', '{answer}'].forEach((s, i) => { const o = k === 4 ? pop(u, 0.2 + i * 0.3) : 1;
          const gg = R.G(50 + i * 82, 240, o, 1, g); el('rect', { x: -38, y: -14, width: 76, height: 28, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 }, gg);
          tx(0, 5, s, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, class: 'mono' }, gg); });
        tx(14, 292, '출력 JSON', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: k === 4 ? fade(u, 1.4) : 1 }, g);
        tx(14, 314, '{"score": int, "reason": str}', { 'font-size': 13.5, class: 'mono', opacity: k === 4 ? fade(u, 1.6) : 1 }, g); } }
    if (k === 2) { grow(380, ansY - 6, px - 6, ansY - 6, E(u, 0.3, 1.0), INFO); note(480, 400, '채점도 결국 프롬프트 한 장으로 시작한다', fade(u, 1.6), { 'text-anchor': 'middle', fill: MUT }); }
    if (k === 4) dot([[380, ansY - 6], [px + 214, 280]], seg(u, 0.4, 1.3), INFO, 7);
    if (k === 5) { pill(700, 220, 'response_format = json_object', ACC, pop(u, 1.6), { mono: true, fs: 13.5 }); }
    if (k === 6) { card(700, 280, 420, 120, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.2) });
      mono(510, 256, '{"score": 5,', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      mono(510, 284, ' "reason": "정확하고 컨텍스트 충실"}', { 'font-size': 15, opacity: fade(u, 0.7) }); ex(860, 236, fade(u, 0.5));
      for (let i = 0; i < 5; i++) el('circle', { cx: 530 + i * 26, cy: 316, r: 9 * pop(u, 0.9 + i * 0.12), fill: GOOD });
      tx(680, 322, '약 1초 · 약 $0.01 / 회', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); } }

  // ---------- 2. 1~10점 + 이유 ----------
  const CATS = [['perfect', '완벽', GOOD], ['minor_issue', '사소한 표현 문제', INFO], ['hallucination', '컨텍스트에 없는 사실', BAD], ['tone_issue', '무례 / 너무 격식', WARN], ['format_issue', 'JSON 형식 위반', WARN], ['wrong_answer', '명백히 틀림', BAD], ['refusal', '답을 거부', MUT]];
  const BANDS = [[1, 2, '매우 나쁨', BAD], [3, 4, '나쁨', WARN], [5, 6, '보통', OFF], [7, 8, '좋음', INFO], [9, 10, '완벽', GOOD]];
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) { const hi = k === 0 ? Math.round(lerp(5, 10, E(u, 0.4, 1.6))) : 10;
      const X = ruler(120, 80, 720, hi);
      if (k === 0) { mono(120, 40, 'score: int = Field(ge=1, le=10)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
        card(480, 250, 520, 120, { rx: 12, stroke: ACC, sw: 2, s: pop(u, 1.8) });
        mono(260, 236, 'reason: str', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
        note(260, 268, '점수만 있으면 왜 떨어졌는지 모른다 — 이유가 필수', fade(u, 2.1)); return; }
      if (k === 3) BANDS.forEach(([a, b, n, col], i) => { const g = E(u, 0.2 + i * 0.3, 0.7 + i * 0.3); if (g <= 0) return;
        el('rect', { x: X(a) - 18, y: 124, width: (X(b) - X(a) + 36) * g, height: 34, rx: 6, fill: col, opacity: 0.85 });
        tx((X(a) + X(b)) / 2, 147, n, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 0.6 + i * 0.3) }); });
      const opC = k === 3 ? 0.35 : 1;
      CATS.forEach(([n], i) => { const s = k === 1 ? pop(u, 0.2 + i * 0.22) : 1, cx = 170 + (i % 4) * 210, cy = 210 + Math.floor(i / 4) * 56;
        pill(cx, cy, n, CATS[i][2], s, { mono: true, fs: 14, op: opC }); });
      if (k >= 2) { ['high', 'medium', 'low'].forEach((n, i) => pill(260 + i * 140, 348, n, INK, k === 2 ? pop(u, 0.3 + i * 0.25) : 1, { mono: true, fs: 14, op: opC }));
        tx(120, 353, 'confidence', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: opC });
        if (k === 2) note(640, 353, '확신이 낮은 채점은 따로 검토', fade(u, 1.4), { fill: MUT }); }
      if (k === 1) note(120, 330, '이유를 라벨로도 받는다 — 나중에 셀 수 있게', fade(u, 1.9), { fill: MUT });
      return; }
    if (k === 4) { tx(480, 40, '프롬프트에 라벨의 뜻도 적는다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      CATS.forEach(([n, d, col], i) => { const y = 82 + i * 44, s = pop(u, 0.15 + i * 0.2);
        pill(250, y, n, col, s, { mono: true, fs: 14 }); grow(345, y, 420, y, E(u, 0.3 + i * 0.2, 0.6 + i * 0.2), GRID, { plain: true });
        tx(432, y + 5, d, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.2) }); });
      return; }
    if (k === 5) { card(480, 200, 560, 240, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.1) }); ex(720, 104, fade(u, 0.3));
      [['score', '8'], ['reason', '"…구체적 이유 한 문장…"'], ['category', '"위 7가지 중 하나"'], ['confidence', '"high|medium|low"']].forEach(([a, b], i) => {
        const y = 140 + i * 44, o = fade(u, 0.4 + i * 0.4); mono(240, y, `"${a}":`, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: o }); mono(400, y, b, { 'font-size': 16, opacity: o }); });
      note(480, 380, '스키마와 프롬프트의 필드 4개가 정확히 같다', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 6) { const X = ruler(120, 200, 720, 10), m = 7.8, sd = 1.5, g = E(u, 0.3, 1.5);
      el('rect', { x: X(m - sd * g), y: 140, width: X(m + sd * g) - X(m - sd * g), height: 44, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 });
      el('line', { x1: X(m), y1: 130, x2: X(m), y2: 210, stroke: INFO, 'stroke-width': 3, opacity: fade(u, 0.3) });
      mono(X(m), 120, 'mean 7.8', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      mono(X(m + sd), 168, '±1.5', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      mono(120, 60, 'df["score"].describe()  →  count 100', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); ex(800, 54, 1);
      note(480, 320, '한 건이 아니라 분포로 봐야 품질 변화가 보인다', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT }); return; }
    // k = 7: 카테고리 빈도
    const V = [['perfect', 45, GOOD], ['minor_issue', 25, INFO], ['tone_issue', 18, WARN], ['hallucination', 8, BAD], ['wrong_answer', 4, BAD]];
    ex(860, 40, 1); mono(120, 46, 'df["category"].value_counts()', { 'font-size': 15, 'font-weight': 700 });
    V.forEach(([n, v, col], i) => { const y = 80 + i * 52, g = E(u, 0.2 + i * 0.2, 1.0 + i * 0.2), hot = n === 'tone_issue';
      if (hot) el('rect', { x: 40, y: y - 10, width: 880, height: 42, rx: 8, fill: WARNBG, opacity: fade(u, 1.4) });
      mono(250, y + 15, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      hbar(270, y, 520, v * g, 50, { h: 22, col, text: String(Math.round(v * g)) }); });
    note(480, 372, '점수만 봤으면 몰랐을 원인 — 새 프롬프트의 톤 문제', fade(u, 1.8), { 'text-anchor': 'middle', fill: WARN }); }

  // ---------- 3. 일관성 ----------
  const RUNS = [8, 7, 9, 7, 8];
  const ACCY = [[10, 100, '정답 + 추가 가치'], [9, 100, '정답과 같은 사실'], [8, 95], [7, 90], [6, 80], [5, 70], [4, 60], [3, 50], [2, 30], [1, 10, '또는 거부']];
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const X = ruler(120, 230, 720, 10);
      const stack = {}; RUNS.forEach((v, i) => { const n = stack[v] = (stack[v] || 0) + 1, d = k === 0 ? E(u, 0.2 + i * 0.25, 0.6 + i * 0.25) : 1;
        if (d > 0) el('circle', { cx: X(v), cy: lerp(40, 222 - n * 26, d), r: 11, fill: ACC, opacity: k === 1 ? 1 - E(u, 0.2, 1.0) * 0.75 : 1 }); });
      const sd = k === 0 ? 0.8 : tween(0.8, 0.3, u), op = k === 0 ? fade(u, 1.8) : 1;
      el('rect', { x: X(7.8 - sd), y: 290, width: X(7.8 + sd) - X(7.8 - sd), height: 26, rx: 6, fill: k === 0 ? BADBG : GOODBG, stroke: k === 0 ? BAD : GOOD, 'stroke-width': 1.5, opacity: op });
      mono(X(7.8 + sd) + 12, 309, `std ${sd.toFixed(1)}`, { 'font-size': 15, 'font-weight': 800, fill: k === 0 ? BAD : GOOD, opacity: op });
      if (k === 0) { mono(120, 60, '같은 질문·답변을 5번 채점', { 'font-size': 15, 'font-weight': 700 }); mono(120, 86, '[8, 7, 9, 7, 8]', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) }); ex(330, 80, fade(u, 1.5)); return; }
      // 온도 손잡이
      const tv = tween(1, 0, u); el('line', { x1: 120, y1: 370, x2: 420, y2: 370, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
      el('circle', { cx: 120 + tv * 300, cy: 370, r: 12, fill: INK }); mono(440, 376, `temperature = ${tv.toFixed(1)}`, { 'font-size': 15, 'font-weight': 800 });
      ex(700, 370, fade(u, 1.2)); note(120, 60, '무작위성을 줄이면 흔들림이 준다', 1); sub(120, 86, 'temperature=0도 완전한 결정론은 아니다', fade(u, 1.6), { 'text-anchor': 'start' }); return; }
    if (k <= 3) { const x0 = 150, bw = 62, base = 330, hh = 230;
      el('line', { x1: x0 - 20, y1: base, x2: x0 + 10 * (bw + 6), y2: base, stroke: MUT, 'stroke-width': 1.8 });
      tx(x0 - 20, 70, '점수 ↔ 정확도', { 'font-size': 15, 'font-weight': 800 });
      ACCY.forEach(([s, a, d], i) => { const lo = s <= 5, show = !lo || k === 3; if (!show) return;
        const j = 10 - s, x = x0 + (9 - j) * (bw + 6), g = k === 2 && !lo ? E(u, 0.2 + j * 0.25, 0.7 + j * 0.25) : k === 3 && lo ? E(u, 0.2 + (j - 5) * 0.2, 0.7 + (j - 5) * 0.2) : 1;
        const h = hh * a / 100 * g, col = s >= 9 ? GOOD : s >= 6 ? INFO : s >= 3 ? WARN : BAD;
        el('rect', { x, y: base - h, width: bw, height: h, rx: 4, fill: col, opacity: 0.85 });
        mono(x + bw / 2, base + 22, String(s), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
        if (g > 0.9) mono(x + bw / 2, base - h - 8, s >= 9 ? '정답' : a + '%', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col }); });
      if (k === 2) note(150, 120, '"좋음" 대신 숫자로 적는다', fade(u, 1.8), { fill: MUT });
      if (k === 3) { const xb = x0 + 4 * (bw + 6) + bw + 3; el('line', { x1: xb, y1: 110, x2: xb, y2: base, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.4) });
        grow(xb - 6, 140, xb - 110, 140, E(u, 1.6, 2.2), BAD); tx(xb - 10, 126, '애매하면 낮은 쪽', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.8) }); }
      return; }
    if (k <= 5) { const FS = [['A: 7일', 9, '정확, 친절도 부족', GOOD], ['A: 환불은 어렵습니다', 2, '사실 회피', WARN], ['A: 무조건 30일', 1, '사실 오류, 환각', BAD]];
      tx(480, 44, 'Few-shot — Q: 환불 기간?   Expected: 7일', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      FS.forEach(([a, s, d, col], i) => { if (k === 4 && i > 0) return; const cx = 170 + i * 310, sc = (k === 4 && i === 0) || (k === 5 && i > 0) ? pop(u, 0.2 + (i - (k === 5 ? 1 : 0)) * 0.6) : 1;
        card(cx, 210, 270, 220, { rx: 14, stroke: col, sw: 2.5, s: sc });
        tx(cx - 115, 140, a, { 'font-size': 15, 'font-weight': 700, opacity: sc });
        mono(cx, 232, String(s), { 'font-size': 54, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: sc });
        tx(cx, 290, d, { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: sc }); });
      note(480, 380, k === 4 ? '말로 된 기준을 실제 사례로 한 번 보여 준다' : '나쁜 답의 예시가 있어야 judge가 관대해지지 않는다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 6) { const runs = [8, 7, 9], sorted = [7, 8, 9];
      tx(120, 60, 'robust_score — 3번 채점', { 'font-size': 16, 'font-weight': 800 });
      runs.forEach((v, i) => card(200 + i * 90, 130, 70, 56, { rx: 8, text: String(v), fs: 22, mono: true, fw: 800, stroke: ACC, s: pop(u, 0.2 + i * 0.25) }));
      grow(480, 130, 560, 130, E(u, 1.0, 1.3), MUT); mono(520, 112, 'sorted', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sorted.forEach((v, i) => { const mid = i === 1; card(620 + i * 90, 130, 70, 56, { rx: 8, text: String(v), fs: 22, mono: true, fw: 800, stroke: mid ? GOOD : GRID, fill: mid ? GOODBG : PANEL, sw: mid ? 3 : 2, s: pop(u, 1.3 + i * 0.15) }); });
      mono(710, 196, 'sorted(scores)[1] = 8', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 290, '값은 앞의 다섯 번 채점 중 처음 세 번', fade(u, 2.1));
      note(480, 340, '튀는 한 번은 양 끝으로 밀려나 자동으로 버려진다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    // k = 7: kappa
    const x0 = 120, w = 720, X = (v) => x0 + v * w;
    el('rect', { x: x0, y: 170, width: w, height: 40, rx: 8, fill: SOFT });
    [[0.7, 0.9, '좋음', INFO], [0.9, 1.0, '매우 좋음', GOOD]].forEach(([a, b, n, col], i) => { const g = E(u, 0.3 + i * 0.5, 0.9 + i * 0.5);
      el('rect', { x: X(a), y: 170, width: (X(b) - X(a)) * g, height: 40, rx: 6, fill: col, opacity: 0.8 });
      tx((X(a) + X(b)) / 2, 196, n, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 0.8 + i * 0.5) }); });
    [0, 0.5, 0.7, 0.9, 1].forEach((v) => mono(X(v), 236, String(v), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }));
    tx(x0, 140, 'Cohen의 kappa — 두 judge가 우연을 넘어 얼마나 일치하나', { 'font-size': 15, 'font-weight': 800 });
    const hb = E(u, 1.6, 2.2); el('rect', { x: X(0.7), y: 268, width: (X(0.8) - X(0.7)) * hb, height: 22, rx: 5, fill: WARN, opacity: 0.85 });
    tx(X(0.7) - 10, 284, '사람 평가자끼리 보통 0.7~0.8', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.8) }); }

  // ---------- 4. Pairwise ----------
  function ansCard(cx, cy, name, col, o) { o = o || {}; card(cx, cy, 200, 110, { rx: 12, stroke: col, sw: 2.5, s: o.s, op: o.op });
    tx(cx, cy - 18, '답변 ' + name, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col, opacity: (o.op ?? 1) * clamp(o.s ?? 1) });
    tx(cx, cy + 16, o.sub || '', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: (o.op ?? 1) * clamp(o.s ?? 1) }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { ansCard(200, 120, 'A', INFO, { s: k === 0 ? pop(u, 0.2) : 1, sub: k >= 2 ? 'prompt_v1' : '' }); ansCard(460, 120, 'B', ACC, { s: k === 0 ? pop(u, 0.5) : 1, sub: k >= 2 ? 'prompt_v2' : '' });
      if (k === 0) { ['A', 'B', 'tie'].forEach((w, i) => pill(330 + i * 100 - 100, 290, w, i === 2 ? MUT : i ? ACC : INFO, pop(u, 1.0 + i * 0.25), { mono: true, fs: 16 }));
        note(330, 350, '점수 대신 승자만 받는다 — 무승부도 허용', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT });
        model(790, 120, 'judge', '어느 쪽이 나은가?', INK, { s: pop(u, 0.8) }); return; }
      model(790, 120, 'judge', k === 1 ? '비교 기준 3가지' : 'winner + reason', INK, {});
      ['사실 정확성 (컨텍스트 충실)', '친절함 / 톤', '명확함 / 간결함'].forEach((s, i) => { const y = 238 + i * 40, o = k === 1 ? fade(u, 0.3 + i * 0.4) : 0.45;
        check(110, y, 9, k === 1 ? pop(u, 0.3 + i * 0.4) : 0.6); tx(130, y + 5, s, { 'font-size': 15, 'font-weight': 700, opacity: o }); });
      if (k === 2) { [[200, INFO], [460, ACC]].forEach(([x, col], i) => dot([[x, 176], [x, 200], [700, 200], [700, 150]], seg(u, 0.3 + i * 0.4, 1.4 + i * 0.4), col, 7));
        card(790, 270, 260, 70, { rx: 10, stroke: INK, s: pop(u, 1.6) }); mono(790, 266, '{"winner": "A"|"B"|"tie",', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
        mono(790, 288, ' "reason": str}', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
      return; }
    if (k <= 4) { // 동전 + 순서
      const coin = k === 3 ? Math.cos(E(u, 0.1, 1.0) * Math.PI * 4) : 1;
      el('ellipse', { cx: 120, cy: 120, rx: 34 * Math.abs(coin) + 2, ry: 34, fill: k === 3 ? WARN : INK });
      mono(120, 126, k === 3 ? '<0.5' : '≥0.5', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: Math.abs(coin) > 0.5 ? 1 : 0 });
      sub(120, 180, 'random()', 1);
      tx(330, 60, '1번 자리', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }); tx(560, 60, '2번 자리', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
      const sw = k === 4 ? E(u, 0.3, 1.2) : 0;
      ansCard(lerp(330, 560, sw), 130, 'A', INFO, {}); ansCard(lerp(560, 330, sw), 130, 'B', ACC, {});
      if (k === 3) { note(330, 260, '절반은 원래 순서 그대로 묻는다', fade(u, 1.3)); note(330, 290, 'judge는 앞에 온 답을 편애하기 때문', fade(u, 1.6), { fill: MUT }); return; }
      // 뒤집어 받은 판정을 되돌린다
      card(760, 130, 150, 60, { rx: 10, stroke: INK, s: pop(u, 1.3) }); mono(760, 136, 'winner "A"', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(760, 180, '= 1번 자리 = 실제 B', fade(u, 1.6));
      [['"A"', '"B"'], ['"B"', '"A"'], ['"tie"', '"tie"']].forEach(([a, b], i) => { const y = 260 + i * 40, o = fade(u, 1.8 + i * 0.15);
        mono(580, y, a, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: o }); grow(595, y - 5, 680, y - 5, E(u, 1.8 + i * 0.15, 2.2 + i * 0.15), ACC);
        mono(690, y, b, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: o }); });
      note(120, 300, '편향을 못 없애면', fade(u, 2.0)); note(120, 328, '대칭으로 상쇄한다', fade(u, 2.1)); return; }
    if (k === 5) { const done = E(u, 0.1, 2.3), n = Math.round(500 * done);
      el('rect', { x: 120, y: 60, width: 720, height: 22, rx: 6, fill: SOFT }); el('rect', { x: 120, y: 60, width: 720 * done, height: 22, rx: 6, fill: ACC });
      mono(840, 50, `${n} / 500 케이스`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
      [['A (v1)', 175, INFO], ['B (v2)', 280, ACC], ['tie', 45, MUT]].forEach(([w, v, col], i) => { const cx = 220 + i * 260;
        card(cx, 230, 200, 150, { rx: 14, stroke: col, sw: 2.5 }); tx(cx, 190, w, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col });
        mono(cx, 250, String(Math.round(v * done)), { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: col }); });
      note(480, 360, 'wins[r.winner] += 1', fade(u, 0.4), { 'text-anchor': 'middle', class: 'mono', fill: MUT }); return; }
    if (k === 6) { const x0 = 120, w = 720, parts = [['A 175', 175, INFO], ['B 280', 280, ACC], ['tie 45', 45, OFF]]; let x = x0;
      tx(x0, 60, '500건 승수', { 'font-size': 15, 'font-weight': 800 });
      parts.forEach(([n, v, col], i) => { const ww = w * v / 500, g = E(u, 0.2 + i * 0.3, 0.8 + i * 0.3); el('rect', { x, y: 80, width: ww * g, height: 54, fill: col, opacity: 0.9 });
        if (g > 0.9) tx(x + ww / 2, 113, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL }); x += ww; });
      mono(x0 + w * 455 / 500 / 2 + 150, 166, 'B = 280 / 500 = 56%', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(480, 196, 'tie 제외: 280 / 455 = 62%', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      // ELO 사다리 (개념 그림)
      ['모델 A', '모델 B', '모델 C'].forEach((m, i) => { const y = 260 + i * 44, s = pop(u, 1.9 + i * 0.15); card(480, y, 220, 36, { rx: 18, stroke: i === 0 ? ACC : GRID, text: m, fs: 14.5, s }); });
      tx(620, 310, '승패를 쌓으면 ELO 순위', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k = 7: N×N
    const n = Math.round(tween(2, 5, u)), cs = 46, gx = 160, gy = 70, M = ['M1', 'M2', 'M3', 'M4', 'M5'];
    for (let r = 0; r < 5; r++) for (let q = 0; q < 5; q++) { const on = r < n && q < n, diag = r === q, upper = q > r;
      el('rect', { x: gx + q * cs, y: gy + r * cs, width: cs - 4, height: cs - 4, rx: 5, fill: !on ? 'none' : diag ? SOFT : upper ? ACC : ACCBG, stroke: on ? 'none' : GRID, opacity: on ? 0.9 : 0.6 }); }
    M.forEach((m, i) => { tx(gx + i * cs + 21, gy - 10, m, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); tx(gx - 10, gy + i * cs + 27, m, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); });
    mono(520, 120, `모델 ${n}개`, { 'font-size': 20, 'font-weight': 800 });
    mono(520, 160, `쌍 ${n * (n - 1) / 2}개`, { 'font-size': 18, 'font-weight': 800, fill: ACC });
    mono(520, 196, `순서 뒤집기까지 ${n * (n - 1)}번`, { 'font-size': 16, 'font-weight': 700, fill: MUT });
    note(520, 260, '장점 — 절대 점수 편향이 사라지고 랭킹이 된다', fade(u, 1.6), { fill: GOOD }); note(520, 292, '단점 — 비교 횟수가 N×N으로 늘어난다', fade(u, 1.9), { fill: BAD }); }

  // ---------- 5. 한계 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [[0, 'A', 'B'], [1, 'B', 'A']].forEach(([i, a, b]) => { const y = 100 + i * 150, s = pop(u, 0.2 + i * 0.7);
        card(200, y, 120, 70, { rx: 10, text: '답변 ' + a, fs: 16, stroke: a === 'A' ? INFO : ACC, color: a === 'A' ? INFO : ACC, s });
        card(340, y, 120, 70, { rx: 10, text: '답변 ' + b, fs: 16, stroke: b === 'A' ? INFO : ACC, color: b === 'A' ? INFO : ACC, s });
        grow(410, y, 520, y, E(u, 0.5 + i * 0.7, 0.9 + i * 0.7), MUT);
        pill(600, y, '1번 자리 승', WARN, pop(u, 0.9 + i * 0.7), { fs: 14 }); mono(700, y + 5, '→ ' + a, { 'font-size': 17, 'font-weight': 800, fill: a === 'A' ? INFO : ACC, opacity: fade(u, 1.0 + i * 0.7) }); });
      cross(780, 175, 14, pop(u, 2.0)); note(810, 182, '판정이 바뀐다', fade(u, 2.1), { fill: BAD });
      sub(480, 370, '측정법 — 같은 두 답의 순서만 바꿔 판정이 바뀌는 비율을 잰다', fade(u, 2.2)); return; }
    if (k === 1) { [['짧은 답', '7일 이내, 미개봉만.', 0.55, 120], ['같은 사실 + 덧붙인 말', '7일 이내, 미개봉만 … 감사합니다 …', 0.85, 300]].forEach(([n, a, v, w], i) => {
        const y = 100 + i * 120, s = pop(u, 0.2 + i * 0.5); card(260, y, 360, 84, { rx: 10, stroke: GRID, s });
        tx(95, y - 12, n, { 'font-size': 14.5, 'font-weight': 800, opacity: s }); tx(95, y + 18, a, { 'font-size': 14, fill: MUT, opacity: s });
        el('rect', { x: 500, y: y - 14, width: 360 * v * E(u, 0.8 + i * 0.4, 1.6 + i * 0.4), height: 28, rx: 5, fill: i ? WARN : INFO }); });
      tx(500, 64, 'judge 점수 (개념 그림)', { 'font-size': 13.5, fill: MUT });
      pill(480, 350, '완화 — rubric에 "간결함" 명시', GOOD, pop(u, 2.0), { fs: 14.5 }); return; }
    if (k === 2) { model(250, 110, 'gpt-4', 'judge', ACC, { s: pop(u, 0.2) });
      ansCard(560, 110, 'gpt-4', ACC, { s: pop(u, 0.5), sub: '같은 계열' }); ansCard(800, 110, '다른 vendor', INFO, { s: pop(u, 0.7) });
      grow(350, 100, 450, 100, E(u, 0.9, 1.3), ACC); el('path', { d: 'M560,190 l-10,-10 a7,7 0 0 1 10,-8 a7,7 0 0 1 10,8 z', fill: BAD, opacity: fade(u, 1.3) });
      card(480, 300, 760, 100, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 1.5) });
      tx(120, 288, 'G-Eval 논문의 관찰', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      tx(120, 316, '사람이 사람 요약을 더 낫다고 한 경우에도 GPT-4 judge는 GPT-3.5 요약에 더 높은 점수', { 'font-size': 14, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) { [['4) 친숙도 편향', '흔한 표현을 좋아한다', '도메인 용어를 쓰는 정확한 답이 손해', 'rubric에 도메인 용어 허용 명시'], ['5) 장황함 선호', '자세하면 좋은 답으로 본다', '같은 사실, 다른 길이로 비교해 잰다', 'rubric에 "간결" 항목 명시']].forEach(([a, b, d, m], i) => {
        const cx = 250 + i * 460, s = pop(u, 0.2 + i * 0.6); card(cx, 190, 420, 250, { rx: 14, stroke: WARN, sw: 2, s });
        tx(cx - 185, 100, a, { 'font-size': 18, 'font-weight': 800, opacity: s }); tx(cx - 185, 140, b, { 'font-size': 15, opacity: fade(u, 0.4 + i * 0.6) });
        tx(cx - 185, 176, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.6) });
        pill(cx, 270, m, GOOD, pop(u, 1.2 + i * 0.5), { fs: 13.5 }); });
      note(480, 390, '편향 다섯 개 중 넷은 rubric 문장으로 완화된다', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 4) { // 비용 — 로그 막대
      const rows = [['100 케이스', [['LLM-judge', 1, '$1 · 100초'], ['사람', 250, '$250 · 50시간']]], ['1K 케이스', [['LLM-judge', 10, '$10 · 17분'], ['사람', 2500, '$2,500 · 500시간']]], ['100K 케이스', [['LLM-judge', 1000, '$1,000 · 28시간'], ['사람', 250000, '$250K · 5만 시간']]]];
      const L = (v) => (Math.log10(v) + 0.3) / 5.7 * 470;
      tx(220, 46, '비용 (로그 눈금) — BLEU는 모두 $0', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      rows.forEach(([n, bars], i) => { const y0 = 76 + i * 108; tx(200, y0 + 32, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
        bars.forEach(([who, v, lab], j) => { const y = y0 + j * 38, g = E(u, 0.2 + i * 0.4 + j * 0.15, 0.9 + i * 0.4 + j * 0.15);
          el('rect', { x: 220, y, width: L(v) * g, height: 28, rx: 5, fill: j ? WARN : ACC, opacity: 0.9 });
          mono(228 + L(v) * g, y + 19, '  ' + who + '  ' + lab, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.4 + j * 0.15) }); }); });
      return; }
    if (k === 5) { const st = [['CI', 'BLEU 5초'], ['PR', 'judge 100건 · $1'], ['Release', 'judge 500건 · $5'], ['분기', '사람 100건'], ['매월', '다른 vendor로 편향 체크']];
      st.forEach(([a, b], i) => { const cx = 110 + i * 185, s = pop(u, 0.2 + i * 0.35);
        card(cx, 170, 165, 120, { rx: 12, stroke: i === 3 ? WARN : i === 0 ? OFF : ACC, sw: 2.5, s });
        tx(cx, 150, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: s }); tx(cx, 186, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s });
        if (i < 4) grow(cx + 84, 170, cx + 100, 170, E(u, 0.5 + i * 0.35, 0.7 + i * 0.35), MUT); });
      note(480, 320, '지표는 하나를 고르는 게 아니라 단계마다 배치한다', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    // k = 6
    const g = E(u, 0.2, 1.4);
    el('rect', { x: 120, y: 120, width: 720 * 0.9 * g, height: 70, rx: 8, fill: ACC }); el('rect', { x: 120 + 648, y: 120, width: 72 * E(u, 1.2, 1.8), height: 70, rx: 8, fill: WARN });
    tx(120 + 324, 162, '90% LLM-judge 자동 평가', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: PANEL, opacity: fade(u, 0.9) });
    tx(804, 162, '10%', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.6) });
    tx(804, 220, '최종 검증은 사람', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
    note(480, 320, 'LLM-judge는 사람 평가의 대체가 아니라 보조다', fade(u, 2.1), { 'text-anchor': 'middle' }); }

  const quiz = [
    { q: 'gpt-3.5가 만든 답을 채점할 때 judge로 gpt-4를 따로 두는 이유는 무엇인가?',
      o: ['gpt-4가 JSON 출력만 지원해서', '자기 답을 자기가 채점하면 편향이 생기고, 채점자가 더 강해야 해서', 'gpt-3.5는 temperature를 바꿀 수 없어서'], a: 1,
      why: '답을 쓰는 모델과 채점하는 모델을 나눠야 자기 편향을 피한다. 보통 채점자를 답변 모델보다 강한 모델로 둔다.' },
    { q: '점수 평균이 그대로인데 품질 불만이 늘었다. 1~10점 스키마에서 원인을 찾게 해 주는 필드는 무엇인가?',
      o: ['category와 reason', 'confidence', 'score의 범위 ge=1, le=10'], a: 0,
      why: '예시 출력에서 tone_issue가 18건으로 튀었다. 라벨과 이유가 있어야 셀 수 있고 원인이 드러난다.' },
    { q: '같은 답을 세 번 채점해 [8, 7, 9]가 나왔다. robust_score가 돌려주는 값은 무엇인가?',
      o: ['8, 평균이라서', '9, 가장 높은 값이라서', '8, 정렬한 뒤 가운데 값이라서'], a: 2,
      why: 'sorted(scores)[1]은 중앙값이다. 튀는 한 번은 양 끝으로 밀려나 자동으로 버려진다.' },
    { q: 'pairwise 500건 결과가 A 175, B 280, tie 45다. 무승부를 빼고 본 B의 승률은 얼마인가?',
      o: ['56%', '62%', '65%'], a: 1,
      why: '무승부를 빼면 280 / 455 = 61.5%로 약 62%다. 무승부를 포함하면 280 / 500 = 56%다.' },
    { q: '두 답의 순서만 바꿔 다시 물었더니 judge의 판정이 바뀌었다. 무엇이 드러난 것인가?',
      o: ['위치 편향 (position bias)', '길이 편향 (length bias)', '자기 편향 (self-bias)'], a: 0,
      why: '앞에 놓인 답을 선호하는 위치 편향이다. 그래서 pairwise에서는 순서를 무작위로 뒤집어 상쇄한다.' },
  ];

  const summary = [
    'LLM-as-Judge는 질문, 답, 컨텍스트를 채점 프롬프트에 넣어 점수와 이유를 JSON으로 받는다.',
    '점수만 받으면 원인을 모른다. 카테고리와 이유를 함께 받아야 tone_issue 같은 회귀가 보인다.',
    '같은 답도 채점마다 흔들린다. rubric, few-shot, temperature=0, 3회 중앙값으로 줄인다.',
    'pairwise는 승자만 받고 순서를 뒤집어 위치 편향을 상쇄한다. 비교 횟수는 N×N으로 는다.',
  ];
  const review = [
    { q: '새 프롬프트를 PR로 올렸더니 judge 평균 점수가 매번 0.3씩 오르내린다. 먼저 손볼 것은?',
      o: ['judge를 더 비싼 모델로 바꾼다', '평가셋을 절반으로 줄인다', 'temperature=0, 구체적인 rubric, 3회 중앙값을 적용한다'], a: 2,
      why: '흔들림의 원인은 무작위성과 모호한 기준이다. 세 가지를 같이 쓰면 같은 답에 같은 점수가 나오기 쉬워진다.' },
    { q: 'prompt_v1과 v2를 비교하는데 judge가 늘 더 긴 답을 이기게 한다. 어떻게 할까?',
      o: ['rubric에 간결함을 적고, 순서를 뒤집어 pairwise로 비교한다', '긴 답이 원래 더 좋으니 그대로 둔다', 'BLEU로 바꿔 길이 영향을 없앤다'], a: 0,
      why: '길이 편향은 rubric 문장으로 줄이고, pairwise에서 순서를 섞으면 위치 편향도 함께 상쇄된다.' },
    { q: '평가셋 10만 건을 매 PR마다 judge로 돌리자는 제안이 나왔다. 가장 알맞은 답은?',
      o: ['사람 평가보다 훨씬 싸니 그대로 매 PR마다 돌린다', '$1,000·28시간짜리라 PR은 100건, 큰 평가는 릴리스로 나눈다', '편향이 걱정되니 judge 대신 사람 평가로 바꾼다'], a: 1,
      why: '싸다는 말은 규모를 정해야 의미가 있다. 단계마다 크기를 달리 배치하는 것이 이 장의 운영 가이드다.' },
  ];

  R.page({ title: 'LLM-as-Judge 채점실', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
