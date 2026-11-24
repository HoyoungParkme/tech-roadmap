/* III-1-1 BLEU/ROUGE 한계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * BLEU·ROUGE 값은 nltk 3.10 / rouge-score 0.1.2 로 다시 계산한 값, 연구 수치는 G-Eval 논문(Liu et al., 2023) 표 1·2. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, cross, check, dot, hbar, axes, scatter, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const f2 = (v) => v.toFixed(2);

  // 토큰 줄: 칸 너비는 글자 수에 맞춘다. 돌려준 배열 = 칸 가운데 x
  function toks(x, y, words, o) { o = o || {}; const fs = o.fs || 15, gap = o.gap ?? 8, xs = []; let cx = x;
    words.forEach((w, i) => { const cw = Math.max(o.min || 54, tw(w, fs) + 22), st = (o.style && o.style(i, w)) || {};
      xs.push(cx + cw / 2);
      if ((st.s ?? 1) > 0) card(cx + cw / 2, y, cw, 40, { rx: 7, text: w, fs, fw: 700, stroke: st.stroke || GRID, fill: st.fill || PANEL, color: st.color || INK, sw: st.sw || 2, s: st.s, op: st.op });
      cx += cw + gap; });
    return xs; }
  function tag(x, y, s, op, col) { tx(x, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: col || MUT, 'text-anchor': 'end', opacity: op ?? 1 }); }
  // 점수 판: 이름 + 큰 숫자
  function scoreBox(cx, cy, name, val, o) { o = o || {};
    card(cx, cy, o.w || 170, 84, { rx: 12, stroke: o.col || ACC, sw: 2.5, fill: o.fill || PANEL, s: o.s, op: o.op });
    tx(cx, cy - 16, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    mono(cx, cy + 22, val, { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: o.col || ACC, opacity: o.op ?? 1 }); }

  // ---------- 1. BLEU 의 원리 ----------
  const KREF = ['고양이가', '매트', '위에', '있다'];
  const EREF = ['the', 'cat', 'is', 'on', 'the', 'mat'], ECAND = ['the', 'cat', 'sat', 'on', 'the', 'mat'];
  const LADDER_KO = [[4, 4], [3, 3], [2, 2], [1, 1]], LADDER_EN = [[5, 6], [3, 5], [1, 4], [0, 3]];
  function ladder(rows, prevRows, u, y0, live) {
    rows.forEach(([a, b], i) => { const y = y0 + i * 40, v = a / b, pv = prevRows ? prevRows[i][0] / prevRows[i][1] : 0;
      const cur = live ? tween(pv, v, u) : v, col = v === 0 ? BAD : v === 1 ? GOOD : WARN;
      tx(150, y + 14, `${i + 1}-gram`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      hbar(170, y, 360, cur, 1, { h: 20, col, text: `${a}/${b}` }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      tag(150, 60, 'reference', 1); tag(150, 140, 'candidate', 1);
      const xr = toks(170, 60, KREF, { min: 90 });
      const xc = toks(170, 140, KREF, { min: 90, style: (i) => ({ s: k === 0 ? pop(u, 0.4 + i * 0.3) : 1, stroke: k >= 1 ? GOOD : GRID }) });
      if (k === 0) { note(170, 200, '같은 방식으로 자른 단어 목록 두 개', fade(u, 1.8)); return; }
      xr.forEach((x, i) => grow(x, 82, xc[i], 118, k === 1 ? E(u, 0.2 + i * 0.25, 0.8 + i * 0.25) : 1, GOOD, { plain: true, sw: 2.5 }));
      scoreBox(800, 100, 'sentence_bleu', f2(k === 1 ? E(u, 1.2, 2.2) : 1), { col: GOOD, s: k === 1 ? pop(u, 1.0) : 1 });
      if (k === 1) { note(170, 210, '네 토큰이 모두 같다 → 1.00', fade(u, 2.0)); return; }
      ladder(LADDER_KO, null, u, 210, false);
      LADDER_KO.forEach((_, i) => { const s = seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3); el('rect', { x: 170, y: 210 + i * 40, width: 360 * s, height: 20, rx: 4, fill: GOOD }); });
      card(760, 290, 300, 92, { rx: 12, stroke: INK, sw: 2, s: pop(u, 1.6) });
      note(625, 272, '네 일치율의 기하 평균', fade(u, 1.8)); note(625, 298, '× 길이 벌점(BP)', fade(u, 1.9)); mono(625, 324, '= 1.00', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
      return; }
    // k ≥ 3: 영어 예시
    const op = k === 4 ? 0.35 : 1;
    tag(150, 60, 'ref', op); tag(150, 128, 'cand', op);
    toks(170, 60, EREF, { min: 62, style: (i) => ({ op, stroke: i === 2 ? WARN : GRID }) });
    toks(170, 128, ECAND, { min: 62, style: (i) => ({ op, stroke: i === 2 ? BAD : GRID, fill: i === 2 ? BADBG : PANEL, color: i === 2 ? BAD : INK }) });
    if (k === 3) {
      ladder(LADDER_EN, LADDER_KO, u, 200, true);
      tx(590, 334, '4-gram 0개', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      scoreBox(790, 120, '기본 BLEU', '≈ 0', { col: BAD, s: pop(u, 1.4) });
      scoreBox(790, 250, 'method1 보정', '0.25', { col: WARN, s: pop(u, 2.0) });
      note(170, 392, '단어 하나가 2·3·4-gram을 한꺼번에 깨뜨린다', fade(u, 2.2), { fill: MUT });
      return; }
    // k = 4: 왜 이렇게 설계했나
    [['LLM 호출 0번', '계산만 한다'], ['같은 입력 → 같은 점수', null], ['번역의 전제', '같은 단어 ≈ 정답에 가깝다']].forEach(([a, b], i) => {
      const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.5);
      card(cx, 290, 280, 130, { rx: 12, stroke: i === 2 ? WARN : GOOD, sw: 2, s });
      tx(cx, 255, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.5) });
      if (b) tx(cx, 300, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) });
      if (i === 1) [0, 1, 2].forEach((j) => mono(cx - 80 + j * 80, 305, '0.25', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9 + j * 0.25) })); });
    note(480, 392, '빠르고 공짜이고 재현된다 — 그래서 표준이 됐다', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT }); }

  // ---------- 2. paraphrase 실패 ----------
  const CASES = [['원문 그대로', '고양이가 매트 위에 있다', 1.00, 1], ['비슷한 의미', '고양이가 매트 위에 누워있다', 0.40, 1], ['같은 의미, 다른 단어', '야옹이가 매트에 자리 잡았다', 0.00, 1],
    ['어순 변경', '매트 위에 고양이가 있다', 0.20, 1], ['번역', 'The cat is on the mat', 0.00, 1], ['단어 하나만 다름', '강아지가 매트 위에 있다', 0.40, 0]];
  const RY = (i) => 96 + i * 48;
  function s2(t, c) { const { k, u } = c;
    card(480, 34, 420, 40, { rx: 20, fill: INK, stroke: 'none', text: '정답: 고양이가 매트 위에 있다', fs: 15, color: PANEL });
    tx(640, 76, '사람', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: k >= 4 ? 1 : 0 });
    tx(700, 76, 'BLEU (method1)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: k >= 3 ? 1 : 0 });
    CASES.forEach(([d, s, v, ok], i) => {
      const vis = i < 3 ? (k === 0 ? E(u, 0.2 + i * 0.4, 0.7 + i * 0.4) : 1) : (k === 0 ? 0 : k === 1 ? E(u, 0.2 + (i - 3) * 0.5, 0.7 + (i - 3) * 0.5) : 1);
      if (vis <= 0) return; const y = RY(i), x0 = lerp(60, 0, vis), dim = k === 5 ? 0.45 : 1;
      const hot = k === 4 && (i === 2 || i === 5);
      if (hot) el('rect', { x: 20, y: y - 20, width: 920, height: 40, rx: 8, fill: i === 5 ? BADBG : GOODBG, opacity: fade(u, 0.6) });
      card(x0 + 100, y, 170, 32, { rx: 16, text: d, fs: 13.5, fw: 700, stroke: i === 5 ? BAD : GRID, color: i === 5 ? BAD : MUT, op: vis * dim });
      if (i === 5) { tx(x0 + 205, y + 5, '강아지가', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: vis * dim }); tx(x0 + 278, y + 5, ' 매트 위에 있다', { 'font-size': 15, 'font-weight': 600, opacity: vis * dim }); }
      else tx(x0 + 205, y + 5, s, { 'font-size': 15, 'font-weight': 600, opacity: vis * dim });
      if (k === 2) { const sc = E(u, 0.2, 2.4) * 6; if (sc > i) mono(700, y + 5, '…', { 'font-size': 16, fill: MUT }); }
      if (k >= 3) { const g = k === 3 ? E(u, 0.2 + i * 0.25, 0.9 + i * 0.25) : 1, col = v === 1 ? GOOD : v === 0 ? BAD : WARN;
        hbar(700, y - 10, 170, v * g, 1, { h: 20, col: i === 5 ? BAD : col, text: f2(v * g), u: 1 }); }
      if (k >= 4) { const s = k === 4 ? pop(u, 0.2 + i * 0.12) : 1; (ok ? check : cross)(640, y, 9, s); } });
    if (k === 2) { const sc = E(u, 0.2, 2.4) * 6, i = Math.min(5, Math.floor(sc)); el('rect', { x: 20, y: RY(i) - 20, width: 920, height: 40, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.5 }); }
    if (k === 4) { const p = el('path', { d: `M 910 ${RY(2)} C 950 ${RY(2) + 40}, 950 ${RY(5) - 40}, 910 ${RY(5)}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.2) });
      pill(600, 392, '맞는 답 0.00 < 틀린 답 0.40 — 순서가 뒤집혔다', BAD, pop(u, 1.6), { fs: 14, fill: PANEL }); }
    if (k === 5) banner(480, 392, 'LLM은 같은 뜻을 매번 다른 말로 쓴다 — 정답 한 줄과 단어 맞추기로는 못 잰다', pop(u, 0.4)); }

  // ---------- 3. ROUGE ----------
  const KC = ['고양이가', '매트에', '누웠다'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 110, 520, 120, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.1) });
      mono(240, 72, 'RougeScorer(', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      [['rouge1', '단어 1개 일치'], ['rouge2', '연속 2단어 일치'], ['rougeL', '최장 공통 부분수열']].forEach(([a, b], i) => {
        const cx = 320 + i * 160, s = pop(u, 0.6 + i * 0.4); pill(cx, 120, a, ACC, s, { mono: true, fs: 15 }); sub(cx, 156, b, fade(u, 0.8 + i * 0.4)); });
      [['P', '후보 중 정답에 있는 비율'], ['R', '정답 중 후보에 있는 비율'], ['F', 'P와 R의 조화 평균']].forEach(([a, b], i) => {
        const y = 240 + i * 44; mono(300, y, a, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6 + i * 0.25) }); note(330, y, b, fade(u, 1.7 + i * 0.25)); });
      return; }
    if (k === 1) { const sent = '고양이가 매트 위에 있다';
      card(170, 110, 230, 44, { rx: 8, text: sent, fs: 15, s: pop(u, 0.1) });
      grow(290, 110, 380, 110, E(u, 0.4, 0.8), MUT);
      card(470, 110, 170, 54, { rx: 10, text: '기본 토크나이저\n[a-z0-9] 만 남김', fs: 13.5, stroke: BAD, color: BAD, s: pop(u, 0.6) });
      grow(560, 110, 640, 110, E(u, 0.9, 1.2), BAD);
      mono(690, 116, '[ ]', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); note(730, 116, '토큰 0개 → 셋 다 0.00', fade(u, 1.3), { fill: BAD });
      grow(170, 136, 170, 210, E(u, 1.6, 2.0), GOOD);
      card(300, 236, 230, 44, { rx: 10, text: 'SpaceTokenizer (str.split)', fs: 13.5, stroke: GOOD, color: GOOD, s: pop(u, 1.8) });
      toks(440, 236, KREF, { min: 80, style: (i) => ({ s: pop(u, 2.0 + i * 0.12), stroke: GOOD }) });
      note(160, 330, '점수가 전부 0이면 지표보다 토크나이저를 먼저 본다', fade(u, 2.3), { fill: MUT });
      return; }
    tag(150, 60, 'reference', 1); tag(150, 140, 'candidate', 1);
    const xr = toks(170, 60, KREF, { min: 90, style: (i) => ({ stroke: k === 4 ? INFO : GRID, fill: k === 4 ? INFOBG : PANEL }) });
    const xc = toks(170, 140, KC, { min: 90, style: (i) => ({ s: k === 2 ? pop(u, 0.3 + i * 0.3) : 1, stroke: k === 4 ? WARN : GRID, fill: k === 4 ? WARNBG : PANEL }) });
    if (k === 2) { note(170, 210, '띄어쓰기로 자른 토큰끼리 비교한다', fade(u, 1.5)); return; }
    if (k <= 4) { grow(xr[0], 82, xc[0], 118, k === 3 ? E(u, 0.2, 0.8) : 1, GOOD, { plain: true, sw: 2.5 });
      const nm = k === 3 ? fade(u, 0.9) : 1; tx(xr[1] + 30, 106, '매트 ≠ 매트에', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: nm }); }
    if (k === 3) { const rows = [['rouge1', 1 / 3, 1 / 4, 0.29], ['rouge2', 0, 0, 0], ['rougeL', 1 / 3, 1 / 4, 0.29]];
      ['P', 'R', 'F'].forEach((h, j) => tx(770 + j * 62, 210, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' }));
      rows.forEach(([n, P, Rr, F], i) => { const y = 248 + i * 40, o = fade(u, 0.9 + i * 0.4);
        mono(660, y, n, { 'font-size': 15, 'font-weight': 700, opacity: o });
        [P, Rr, F].forEach((v, j) => mono(770 + j * 62, y, f2(v), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: v === 0 ? BAD : INK, opacity: o })); });
      note(170, 248, '겹치는 토큰은 "고양이가" 하나', fade(u, 0.6)); note(170, 280, '연속 두 단어 일치는 없다 → rouge2 = 0', fade(u, 1.6), { fill: BAD });
      return; }
    if (k === 4) { // 같은 일치 1개, 분모가 다르다
      [[180, 'BLEU처럼 precision', '1 / 3', '후보 토큰 3개가 분모', WARN, '쓸데없는 말을 벌한다'], [560, 'ROUGE는 recall', '1 / 4', '정답 토큰 4개가 분모', INFO, '빠뜨린 핵심을 벌한다']].forEach(([x, a, fr, d, col, m], i) => {
        const s = pop(u, 0.3 + i * 0.8);
        card(x + 110, 290, 300, 150, { rx: 12, stroke: col, sw: 2.5, s });
        tx(x + 110, 246, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.8) });
        mono(x + 110, 292, fr, { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.8) });
        sub(x + 110, 322, d, fade(u, 0.6 + i * 0.8)); tx(x + 110, 350, m, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.8) }); });
      return; }
    if (k === 5) { // LCS
      const A = ['A', 'B', 'C', 'D'], B2 = ['A', 'C', 'B', 'D'], pair = [[0, 0], [1, 2], [3, 3]];
      el('rect', { x: 120, y: 200, width: 720, height: 200, rx: 12, fill: SOFT });
      const xa = A.map((_, i) => 330 + i * 90), xb = B2.map((_, i) => 330 + i * 90);
      A.forEach((s, i) => card(xa[i], 240, 56, 40, { rx: 7, text: s, fs: 17, mono: true, fw: 800, stroke: pair.some((p) => p[0] === i) ? ACC : GRID }));
      B2.forEach((s, i) => card(xb[i], 340, 56, 40, { rx: 7, text: s, fs: 17, mono: true, fw: 800, stroke: pair.some((p) => p[1] === i) ? ACC : GRID }));
      tag(290, 240, 'reference', 1); tag(290, 340, 'candidate', 1);
      pair.forEach(([a, b], i) => grow(xa[a], 262, xb[b], 318, E(u, 0.3 + i * 0.4, 0.8 + i * 0.4), ACC, { plain: true, sw: 2.8 }));
      mono(720, 296, 'LCS = ABD', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      mono(720, 324, '길이 3 / 4', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(480, 384, '붙어 있지 않아도 순서만 맞으면 센다 — 어순 변화에 조금 관대하다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) });
      return; }
    // k = 6: 남은 쓸모
    [[250, '추출 요약', '본문 단어를 그대로 가져온다', GOOD, true], [710, '생성 요약 (LLM)', '같은 뜻을 새 단어로 쓴다', BAD, false]].forEach(([x, a, b, col, ok], i) => {
      const s = pop(u, 0.3 + i * 0.7); card(x, 300, 380, 150, { rx: 12, stroke: col, sw: 2.5, s });
      (ok ? check : cross)(x - 150, 262, 11, s); tx(x - 128, 268, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.7) });
      tx(x - 150, 306, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.7) });
      tx(x - 150, 340, ok ? 'ROUGE 쓸 만하다' : 'paraphrase·사실 검증 못 함', { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.7 + i * 0.7) }); }); }

  // ---------- 4. 사람 평가와 상관 ----------
  const SAMP = [{ q: '환불 정책?', a: '구매 후 7일 이내 미개봉 상품만 환불됩니다.', h: 5, b: 0.03, j: 4.8 }, { q: '배송 기간?', a: '보통 1~2일 안에 도착합니다.', h: 5, b: 0.08, j: 4.9 },
    { q: '교환 기간?', a: '교환은 30일 안에 영수증이 있으면…', h: 1, b: 0.54, j: 1.2 }];
  function sampleCard(cx, s, u0, o) { o = o || {}; const op = o.op ?? 1;
    card(cx, 170, 420, 250, { rx: 12, stroke: s.h === 1 ? BAD : GOOD, sw: 2, s: o.s, op });
    tx(cx - 190, 76, 'Q. ' + s.q, { 'font-size': 15, 'font-weight': 800, opacity: op });
    tx(cx - 190, 106, s.a, { 'font-size': 14, fill: s.h === 1 ? BAD : INK, opacity: op });
    if (o.exp) tx(cx - 190, 130, o.exp, { 'font-size': 13.5, fill: MUT, opacity: op });
    [['사람', s.h, 5, INK], ['BLEU', s.b, 1, s.h === 1 ? BAD : WARN], ['judge (예시)', s.j, 5, INFO]].forEach(([n, v, mx, col], i) => {
      const y = 166 + i * 44, g = E(u0, 0.3 + i * 0.35, 1.0 + i * 0.35);
      tx(cx - 190, y + 14, n, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
      if (g > 0) hbar(cx - 90, y, 200, v * g, mx, { h: 18, col, text: (mx === 1 ? f2(v * g) : (v * g).toFixed(1)) + ' / ' + mx }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { sampleCard(250, SAMP[0], k === 0 ? u : 3, { s: k === 0 ? pop(u, 0.1) : 1, op: k === 1 ? 0.45 : 1, exp: '정답: 환불은 7일 안에 미개봉만 가능' });
      if (k === 0) { note(250, 330, '좋은 답인데 BLEU만 혼자 낮다', fade(u, 2.0), { 'text-anchor': 'middle', fill: WARN }); return; }
      sampleCard(710, SAMP[2], u, { s: pop(u, 0.1), exp: '정답: 교환은 14일 안에 …' });
      note(710, 330, '틀린 답인데 BLEU가 가장 높다', fade(u, 2.0), { 'text-anchor': 'middle', fill: BAD }); return; }
    if (k === 2) { [['human', SAMP.map((s) => String(s.h))], ['bleu', SAMP.map((s) => f2(s.b))], ['judge', SAMP.map((s) => s.j.toFixed(1))]].forEach(([n, vs], i) => {
        const y = 90 + i * 100; mono(180, y + 28, n + ' =', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 0.2 + i * 0.5) });
        vs.forEach((v, j) => { const g = E(u, 0.3 + i * 0.5 + j * 0.12, 0.8 + i * 0.5 + j * 0.12); if (g <= 0) return;
          card(lerp(700, 260 + j * 110, g), y + 22, 96, 44, { rx: 7, text: v, fs: 17, mono: true, fw: 800, stroke: i === 1 ? WARN : i === 2 ? INFO : INK }); }); });
      note(600, 200, '세 건 각각의 점수를', fade(u, 2.0), { fill: MUT }); note(600, 226, '사람 순서대로 줄 세운다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 3) { [[40, 'BLEU', (s) => s.b, [0, 0.6], [0, 0.3, 0.6], WARN, '-1.00'], [500, 'judge (예시)', (s) => s.j, [0, 5], [0, 2.5, 5], INFO, '1.00']].forEach(([x, n, f, yr, yt, col, r], i) => {
        const ax = axes(x + 70, 60, 300, 250, { x: [0, 6], y: yr, xt: [1, 5], yt, xl: '사람 점수', yl: n });
        scatter(ax, SAMP.map((s) => [s.h, f(s), col]), { u: E(u, 0.2 + i * 0.6, 0.9 + i * 0.6), r: 7 });
        line(ax, [[1, f(SAMP[2])], [5, (f(SAMP[0]) + f(SAMP[1])) / 2]], E(u, 1.0 + i * 0.6, 1.6 + i * 0.6), col, { dash: '6 5' });
        mono(i ? x + 100 : x + 370, 90, 'r = ' + r, { 'font-size': 20, 'font-weight': 800, fill: col, 'text-anchor': i ? 'start' : 'end', opacity: fade(u, 1.5 + i * 0.6) }); });
      note(480, 404, '세 건뿐이라 값은 극단적이지만 방향은 정반대다', fade(u, 2.3), { 'text-anchor': 'middle', fill: MUT }); return; }
    // k ≥ 4: G-Eval 표 1·2
    const G = [['요약 SummEval · Spearman', [['ROUGE-1', 0.192], ['ROUGE-L', 0.165], ['G-Eval-4', 0.514]]], ['대화 Topical-Chat · Pearson', [['BLEU-4', 0.189], ['ROUGE-L', 0.243], ['G-Eval-4', 0.575]]]];
    const op = k === 5 ? 0.4 : 1;
    G.forEach(([title, rows], gi) => { const y0 = 56 + gi * 160;
      tx(60, y0, title, { 'font-size': 15, 'font-weight': 800, opacity: op });
      rows.forEach(([n, v], i) => { const y = y0 + 18 + i * 38, g = k === 4 ? E(u, 0.2 + gi * 0.7 + i * 0.2, 0.9 + gi * 0.7 + i * 0.2) : 1, judge = n.startsWith('G-');
        tx(190, y + 14, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: judge ? INFO : INK, opacity: op });
        hbar(205, y, 560, v * g, 1, { h: 20, col: judge ? INFO : WARN, text: v.toFixed(3), u: 1 }); }); });
    sub(830, 404, 'Liu et al., 2023 (G-Eval) 표 1·2', op);
    if (k === 5) { banner(400, 384, '사람 대신 쓸 평가 — n-gram은 탈락, LLM-as-Judge로', pop(u, 0.3)); } }

  // ---------- 5. 새 지표가 필요하다 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['Paraphrase 무력', '야옹이가 매트에 자리 잡았다 → 0.00'], ['사실 검증 불가', '강아지가 매트 위에 있다 → 0.40'], ['다양한 정답 처리 못 함', '정답 한 줄과만 비교한다'], ['사람과 상관 약함', '0.17~0.24']].forEach(([a, b], i) => {
        const cx = 250 + (i % 2) * 460, cy = 120 + Math.floor(i / 2) * 170, s = pop(u, 0.2 + i * 0.4);
        card(cx, cy, 420, 130, { rx: 12, stroke: BAD, sw: 2, s }); mono(cx - 185, cy - 30, String(i + 1), { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3 + i * 0.4) });
        tx(cx - 155, cy - 30, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.4) });
        tx(cx - 185, cy + 16, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); });
      return; }
    if (k === 1) { const need = ['의미 이해', '사실 검증', '일관성', '형식 준수', '유해성'];
      tx(560, 56, 'n-gram 매칭', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
      need.forEach((n, i) => { const y = 96 + i * 58; card(300, y, 300, 46, { rx: 23, stroke: INFO, sw: 2, text: n, fs: 16, fw: 800, s: pop(u, 0.1 + i * 0.2) });
        cross(560, y, 12, pop(u, 1.2 + i * 0.2)); });
      note(660, 230, '다섯 가지 모두', fade(u, 2.2), { fill: BAD }); note(660, 258, '단어 겹침으로는 못 잰다', fade(u, 2.3), { fill: BAD }); return; }
    if (k === 2) { const ax = { x: 120, y: 50, w: 720, h: 300 };
      el('line', { x1: ax.x, y1: ax.y + ax.h, x2: ax.x + ax.w, y2: ax.y + ax.h, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' });
      el('line', { x1: ax.x, y1: ax.y + ax.h, x2: ax.x, y2: ax.y, stroke: MUT, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)' });
      tx(ax.x + ax.w, ax.y + ax.h + 28, '비용 →', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
      tx(ax.x + 10, ax.y + 4, '의미·사실 판단 ↑', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      [['BLEU', 170, 320, 0], ['ROUGE', 250, 296, 0], ['임베딩 유사도', 330, 220, 0], ['LLM-as-Judge', 560, 120, 1], ['RAGAS', 620, 170, 1], ['사람', 790, 80, 1]].forEach(([n, x, y, ok], i) => {
        const s = pop(u, 0.2 + i * 0.25); el('circle', { cx: x, cy: y, r: 8 * s, fill: ok ? GOOD : OFF });
        tx(x + 14, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: ok ? INK : MUT, opacity: fade(u, 0.3 + i * 0.25) });
        if (!ok) el('line', { x1: x - 8, y1: y + 2, x2: x + 14 + tw(n, 15), y2: y + 2, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.8) }); });
      sub(480, 396, '임베딩은 의미까지는 가지만 사실 검증은 못 한다 (위치는 개념 그림)', fade(u, 2.2)); return; }
    if (k === 3) { [['CI 빠른 점검', '5초 안 sanity check'], ['추출 요약', '본문 단어를 그대로'], ['번역 시스템 비교', '전통 NMT']].forEach(([a, b], i) => {
        const cx = 170 + i * 310, s = pop(u, 0.2 + i * 0.4); card(cx, 130, 270, 100, { rx: 12, stroke: GOOD, sw: 2, s });
        check(cx - 105, 112, 10, s); tx(cx - 86, 118, a, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.4) }); tx(cx - 110, 152, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); });
      card(480, 290, 520, 90, { rx: 12, stroke: BAD, sw: 2, s: pop(u, 1.6) }); cross(270, 290, 11, pop(u, 1.6));
      tx(296, 284, 'LLM 생성 답변 · 열린 질문 · 대화', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.7) }); tx(296, 310, '여기서만 빠지면 된다 — 폐기가 아니라 역할 축소', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    // k = 4
    [['표면 일치', 'BLEU / ROUGE', '빠르고 공짜', WARN], ['의미 평가', 'LLM-as-Judge', '느리고 돈이 들지만 뜻을 본다', INFO]].forEach(([a, b, d, col], i) => {
      const y = 110 + i * 130, g = E(u, 0.2 + i * 0.6, 1.0 + i * 0.6);
      el('rect', { x: 60, y: y - 44, width: 840 * g, height: 88, rx: 14, fill: i ? INFOBG : WARNBG });
      tx(90, y - 8, a, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.4 + i * 0.6) });
      tx(90, y + 22, b, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.6) });
      tx(870, y + 8, d, { 'font-size': 14.5, 'text-anchor': 'end', opacity: fade(u, 0.7 + i * 0.6) }); });
    pill(480, 370, '다음: III-1-2 LLM-as-Judge 작동 방식', ACC, pop(u, 2.0), { fs: 14 }); }

  const quiz = [
    { q: '"the cat is on the mat"을 정답으로 두고 "the cat sat on the mat"을 sentence_bleu(보정 없음)로 채점하면 어떻게 되는가?',
      o: ['약 0.83, 여섯 단어 중 다섯이 같아서', '거의 0, 4-gram 일치가 하나도 없어서', '0.50, 한 단어가 틀려 절반이 깎여서'], a: 1,
      why: '1~4-gram 일치율이 5/6, 3/5, 1/4, 0/3이고 기하 평균이라 하나가 0이면 전체가 0에 가깝다. method1 보정을 넣어도 0.25다.' },
    { q: '정답 "고양이가 매트 위에 있다"에 대해 BLEU가 가장 높게 준 틀린 답은 무엇인가?',
      o: ['강아지가 매트 위에 있다 (0.40)', '야옹이가 매트에 자리 잡았다 (0.40)', 'The cat is on the mat (0.20)'], a: 0,
      why: '"강아지가"만 바뀌어 나머지 단어가 같으니 0.40이다. 뜻이 같은 "야옹이가…"는 0.00이라 순서가 뒤집힌다.' },
    { q: 'rouge_score에 한국어 문장을 기본 설정 그대로 넣었더니 세 지표가 모두 0.00이다. 원인은 무엇인가?',
      o: ['두 문장에 겹치는 단어가 정말 하나도 없어서', '기본 토크나이저가 영문·숫자만 남겨 토큰이 0개라서', 'use_stemmer=True가 한국어 어미를 모두 잘라서'], a: 1,
      why: '기본 토크나이저는 [a-z0-9]만 남긴다. 띄어쓰기로 자르는 토크나이저를 넘기면 rouge1 R=0.25가 나온다.' },
    { q: 'G-Eval 논문에서 요약 평가(SummEval)의 사람 점수와 상관이 가장 높았던 것은 무엇인가?',
      o: ['ROUGE-1 (0.192)', 'ROUGE-L (0.165)', 'G-Eval-4 (0.514)'], a: 2,
      why: 'GPT-4로 채점한 G-Eval-4가 0.514로 ROUGE 계열의 약 2~3배였다. 대화 평가에서도 0.575 대 0.189~0.243이었다.' },
    { q: 'LLM 시대에도 BLEU를 계속 써도 되는 자리는 어디인가?',
      o: ['CI에서 몇 초 안에 끝내는 빠른 점검', '챗봇 답변의 사실 정확도 평가', '열린 질문에 대한 답변 품질 비교'], a: 0,
      why: 'BLEU는 빠르고 공짜이고 결정론적이다. 의미를 볼 필요가 없는 점검이나 추출 요약에는 여전히 쓸 만하다.' },
  ];

  const summary = [
    'BLEU는 정답과 후보가 같은 n-gram을 얼마나 공유하는지 보고, 한 단어만 달라도 4-gram이 깨져 0에 가까워진다.',
    '같은 뜻의 다른 말은 0.00, 뜻이 반대인 강아지 문장은 0.40이었다. 점수 순서가 뒤집힌다.',
    'ROUGE는 정답 쪽에서 세는 recall이고, 한국어는 토크나이저를 따로 넘겨야 점수가 나온다.',
    'G-Eval 논문에서 n-gram 지표는 사람과 상관 0.17~0.24, GPT-4 judge는 0.51~0.58이었다.',
  ];
  const review = [
    { q: '챗봇 답변을 BLEU로 채점했더니 사실이 틀린 답이 맞는 답보다 점수가 높게 나왔다. 가장 먼저 의심할 것은?',
      o: ['보정 함수를 안 넣어서 생긴 우연', 'BLEU가 단어 겹침만 보고 뜻을 보지 않는다는 점', '정답 문장이 너무 짧다는 점'], a: 1,
      why: '사실 하나만 바뀐 답은 단어가 거의 같아 BLEU가 높다. 뜻이 같은 다른 표현은 오히려 0에 가깝다.' },
    { q: '요약 모델을 ROUGE로 재는데 한국어 결과가 모두 0.00이다. 무엇부터 고칠까?',
      o: ['scorer에 띄어쓰기나 형태소 단위 토크나이저를 넘긴다', 'rouge2 대신 rougeL만 본다', 'use_stemmer를 켠다'], a: 0,
      why: '기본 토크나이저가 한국어를 지워 토큰이 0개라서 생긴 일이다. 토큰을 만들 수 있어야 어떤 변형이든 점수가 나온다.' },
    { q: '팀이 BLEU를 버릴지 묻는다. 가장 알맞은 결정은?',
      o: ['전부 버리고 LLM-as-Judge만 쓴다', '사람 상관이 낮으니 사람 평가로 모두 바꾼다', 'CI 점검에는 남기고 답변 품질은 LLM-as-Judge로 잰다'], a: 2,
      why: 'BLEU는 빠르고 공짜라 점검용으로는 쓸 만하다. 다만 사람과 상관이 0.17~0.24라 답변 품질 판단은 judge에 맡긴다.' },
  ];

  R.page({ title: 'BLEU · ROUGE 채점 실험', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
