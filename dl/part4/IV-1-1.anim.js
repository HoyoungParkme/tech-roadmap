/* IV-1-1 어텐션의 등장 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 인코더 상태 = 원문 메모 카드(4칸 텐서). seq2seq 는 마지막 카드 하나만 들고 가고,
 *           어텐션은 카드를 전부 펼쳐 두고 매 스텝 "응시선"(굵기 = α)으로 다시 본다.
 * 숫자: 페이지의 ENC_H · DEC_S 로 attend()(dot → softmax(×4) → 가중합)를 여기서 똑같이 계산한다.
 *       BLEU 곡선은 페이지가 "Bahdanau 2014 경향 재구성"이라 밝힌 예시값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, fly, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 데이터 (페이지 ENC_H / DEC_S 와 같다) ----------
  const SRC = ['나는', '학생', '이다'], TGT = ['I', 'am', 'a', 'student'];
  const H = [[0.9, 0.1, 0.2, 0.0], [0.1, 0.8, 0.1, 0.3], [0.2, 0.1, 0.9, 0.1]];
  const S = [[1.0, 0.0, 0.1, 0.0], [0.1, 0.0, 1.0, 0.1], [0.1, 0.6, 0.3, 0.2], [0.0, 1.0, 0.1, 0.2]];
  const dotp = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const smax = (xs) => { const m = Math.max(...xs), e = xs.map((x) => Math.exp(x - m)), z = e.reduce((a, b) => a + b, 0); return e.map((v) => v / z); };
  const ATT = S.map((s) => { const sc = H.map((h) => dotp(s, h)), w = smax(sc.map((x) => x * 4)); return { sc, w, ctx: [0, 1, 2, 3].map((d) => H.reduce((a, h, i) => a + w[i] * h[d], 0)) }; });
  const f2 = (v) => v.toFixed(2), f1 = (v) => v.toFixed(1);

  // ---------- 부품 ----------
  // 4칸 텐서(가로). 진하기 = |값|. o: cw, ch, num(숫자 표기), op, col, hot(테두리)
  function vec(cx, cy, vals, o) { o = o || {}; const cw = o.cw || 30, ch = o.ch || 28, gap = 3, n = vals.length, w = n * cw + (n - 1) * gap, op = o.op ?? 1, s = o.s ?? 1;
    if (op <= 0.01 || s <= 0.01) return w; const g = R.G(cx, cy, s, op);
    vals.forEach((v, i) => { const x = -w / 2 + i * (cw + gap), a = clamp(Math.abs(v));
      el('rect', { x, y: -ch / 2, width: cw, height: ch, rx: 4, fill: PANEL, stroke: o.hot || GRID, 'stroke-width': o.hot ? 2 : 1.2 }, g);
      el('rect', { x, y: -ch / 2, width: cw, height: ch, rx: 4, fill: o.col || ACC, opacity: 0.08 + 0.8 * a }, g);
      if (o.num) mono(x + cw / 2, 5, o.fmt ? o.fmt(v) : f1(v), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: a > 0.55 ? PANEL : INK }, g); });
    return w; }
  // 세로 텐서 (열벡터)
  function col(cx, y0, vals, o) { o = o || {}; const cs = o.cs || 40, op = o.op ?? 1;
    vals.forEach((v, i) => { const a = clamp(Math.abs(v) / (o.max || 1)), y = y0 + i * (cs + 3), on = o.show ? o.show(i) : 1; if (on <= 0.01) return;
      el('rect', { x: cx - (o.w || 56) / 2, y, width: o.w || 56, height: cs, rx: 5, fill: PANEL, stroke: o.hi && o.hi(i) ? INK : GRID, 'stroke-width': o.hi && o.hi(i) ? 2.5 : 1.2, opacity: op * on });
      el('rect', { x: cx - (o.w || 56) / 2, y, width: o.w || 56, height: cs, rx: 5, fill: o.col || ACC, opacity: (0.08 + 0.75 * a) * op * on });
      mono(cx, y + cs / 2 + 5, o.fmt ? o.fmt(v) : f2(v), { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: a > 0.6 ? PANEL : INK, opacity: op * on }); }); }
  function tok(cx, cy, s, o) { o = o || {}; return card(cx, cy, Math.max(56, tw(s, 15) + 22), 32, { rx: 8, text: s, fs: 15, fw: 700, stroke: o.stroke || INK, fill: o.fill, color: o.color, s: o.s, op: o.op, sw: o.sw }); }
  function cell(cx, cy, s, o) { o = o || {}; return card(cx, cy, o.w || 84, o.h || 40, { rx: 8, text: s, fs: 15, mono: true, stroke: o.stroke || INK, fill: o.fill || SOFT, s: o.s, op: o.op }); }
  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op }, a || {})); }
  function strike(x, y, w, u, colr) { if (u <= 0) return; el('line', { x1: x, y1: y, x2: x + w * clamp(u), y2: y, stroke: colr || BAD, 'stroke-width': 3, 'stroke-linecap': 'round' }); }
  // 응시선: 굵기 = α
  function gaze(x1, y1, x2, y2, a, u, o) { o = o || {}; if (u <= 0) return; el('line', { x1, y1, x2: lerp(x1, x2, clamp(u)), y2: lerp(y1, y2, clamp(u)), stroke: o.col || ACC, 'stroke-width': Math.max(1.2, a * 14), opacity: 0.25 + 0.75 * a, 'stroke-linecap': 'round' }); }

  // ---------- 1. 병목 ----------
  const EX = [110, 250, 390], HY = 200;
  const DX = [690, 800, 910];
  function encoder(u, k) {
    SRC.forEach((w, i) => { const at = k === 0 ? 0.4 + i * 0.6 : -9;
      tok(EX[i], 375, w, { s: k === 0 ? pop(u, 0.2 + i * 0.1) : 1 });
      grow(EX[i], 357, EX[i], 324, k === 0 ? E(u, at, at + 0.2) : 1, MUT, { plain: true });
      cell(EX[i], 300, 'RNN', { s: k === 0 ? pop(u, at + 0.1) : 1 });
      if (i < 2) grow(EX[i] + 44, 300, EX[i + 1] - 46, 300, k === 0 ? E(u, at + 0.4, at + 0.6) : 1, MUT);
      grow(EX[i], 278, EX[i], 218, k === 0 ? E(u, at + 0.2, at + 0.4) : 1, MUT, { plain: true }); }); }
  function hs(u, k, o) { o = o || {};
    H.forEach((h, i) => { const at = 0.7 + i * 0.6, s = k === 0 ? pop(u, at) : 1, op = o.op ? o.op(i) : 1;
      vec(EX[i], HY, h, { s, op });
      lbl(EX[i], HY - 26, `h${i + 1}`, Math.min(op, k === 0 ? fade(u, at) : 1), { class: 'mono' }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 5) return lengthScene(u);
    encoder(u, k);
    const dropped = k >= 2;
    hs(u, k, { op: (i) => (dropped && i < 2 ? 1 - 0.7 * (k === 2 ? E(u, 0.5, 1.0) : 1) : 1) });
    if (k === 0) { mono(520, 120, 'h ← tanh(x + 0.5·h)', { 'font-size': 18, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) });
      sub(640, 160, '단어마다 상태가 하나씩 남는다', fade(u, 2.4), { 'font-size': 15 }); return; }
    if (k === 1) { const g = E(u, 0.2, 0.9);
      el('rect', { x: 40, y: HY - 52, width: 420 * g, height: 76, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '7 5' });
      mono(520, 130, 'hs = [h1, h2, h3]', { 'font-size': 19, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      note(520, 180, '3단어 → 상태 3개', fade(u, 1.3));
      sub(640, 225, 'korean_embeddings 를 모두 읽었다', fade(u, 1.8), { 'font-size': 15 });
      sub(640, 255, '단어 50개면 상태도 50개', fade(u, 2.3), { 'font-size': 15 }); return; }
    // k >= 2 : h1·h2 폐기, h3 만 context 로
    [0, 1].forEach((i) => cross(EX[i], HY, 16, k === 2 ? pop(u, 0.6 + i * 0.2) : 1));
    const m = k === 2 ? E(u, 1.0, 1.8) : 1, cxx = lerp(EX[2], 545, m), cyy = lerp(HY, 120, m);
    if (k === 2 && u > 1.0) vec(cxx, cyy, H[2], { hot: BAD });
    if (k > 2 || u > 1.8) { vec(545, 120, H[2], { hot: BAD }); lbl(545, 88, 'context = hs[-1]', 1, { class: 'mono', fill: BAD }); }
    if (k === 2) { pill(545, 175, '4차원 벡터 하나', BAD, pop(u, 2.1), { fs: 15 });
      tx(40, 120, 'h1(나는) · h2(학생) 폐기', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
      note(520, 260, '길이가 5든 50이든 통로는 이 하나', fade(u, 2.4)); return; }
    // 디코더
    const nDec = k === 3 ? 1 : 3;
    grow(600, 132, DX[0] - 10, 278, k === 3 ? E(u, 0.2, 0.7) : 1, BAD);
    for (let j = 0; j < nDec; j++) { const at = k === 4 ? 0.3 + j * 0.6 : 0.6;
      const sv = [0, 1, 2, 3].map((d) => { let v = H[2][d]; for (let q = 0; q <= j; q++) v = Math.tanh(0.7 * v); return v; });
      const sc = k === 4 && j > 0 ? pop(u, at) : k === 3 ? pop(u, 0.7) : 1;
      cell(DX[j], 300, 'DEC', { s: sc });
      vec(DX[j], 220, sv, { cw: 22, ch: 24, s: sc });
      if (j > 0) grow(DX[j - 1] + 44, 300, DX[j] - 46, 300, k === 4 ? E(u, at - 0.2, at) : 1, MUT);
      if (k === 4) tok(DX[j], 375, `y${j + 1}`, { s: pop(u, at + 0.3), stroke: MUT, color: MUT }); }
    if (k === 3) { mono(620, 380, 'decode(context)', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.9) });
      el('path', { d: `M${DX[0] - 30},330 Q 560 420 ${EX[2] + 40},${HY + 30}`, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.4) });
      cross(560, 386, 13, pop(u, 1.7));
      sub(810, 175, '인자 목록에 hs 가 없다', fade(u, 2.0), { 'font-size': 15, fill: BAD }); return; }
    mono(640, 175, 's ← tanh(0.7·s)', { 'font-size': 17, 'font-weight': 700, fill: INK, opacity: fade(u, 1.6) });
    tx(420, 40, '재료는 s 자신뿐 — 원문 재조회 경로 없음', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
  function lengthScene(u) {
    const rows = [{ y: 115, n: 10, w: 18, gap: 6, name: '10단어', ok: true }, { y: 285, n: 50, w: 10, gap: 4, name: '50단어', ok: false }];
    rows.forEach((r, ri) => { const at = 0.3 + ri * 0.9;
      lbl(60, r.y - 52, r.name, fade(u, at), { 'text-anchor': 'start' });
      const per = r.n > 25 ? 25 : r.n;
      for (let i = 0; i < r.n; i++) { const x = 60 + (i % per) * (r.w + r.gap), y = r.y - 22 + Math.floor(i / per) * (r.w + 8), lost = !r.ok && i < 30 ? E(u, at + 0.9, at + 1.6) : 0;
        el('rect', { x, y, width: r.w, height: r.w, rx: 2, fill: lost > 0 ? OFF : INK, opacity: fade(u, at + i * 0.008) * (1 - 0.6 * lost) }); }
      const fx = 420; el('path', { d: `M${fx},${r.y - 36} L${fx + 80},${r.y - 12} L${fx + 80},${r.y + 12} L${fx},${r.y + 36} Z`, fill: SOFT, stroke: MUT, 'stroke-width': 1.5, opacity: fade(u, at + 0.3) });
      grow(fx + 84, r.y, 556, r.y, E(u, at + 0.4, at + 0.7), MUT);
      vec(620, r.y, H[2], { s: pop(u, at + 0.6) });
      pill(820, r.y, r.ok ? 'BLEU 양호' : 'BLEU 급락', r.ok ? GOOD : BAD, pop(u, at + 0.9), { fs: 15 }); });
    sub(660, 160, '같은 크기 벡터', fade(u, 1.2), { 'font-size': 14 });
    sub(240, 340, '앞부분 정보부터 뭉개진다', fade(u, 2.0), { 'font-size': 15, fill: BAD });
    note(480, 395, '기억력이 아니라 구조 — "다시 볼 수 없다"', fade(u, 2.4), { 'text-anchor': 'middle' }); }

  // ---------- 2. 어텐션 아이디어 ----------
  const X2 = [150, 340, 530], Y2 = 92, DX2 = [140, 280, 420, 560], DY2 = 372;
  function encTop(o) { o = o || {};
    H.forEach((h, i) => { const s = o.pop ? o.pop(i) : 1; tok(X2[i], 40, SRC[i], { s });
      vec(X2[i], Y2, h, { s, hot: o.hot && o.hot(i) }); lbl(X2[i] - 82, Y2 + 5, `h${i + 1}`, s > 0.5 ? 1 : 0, { class: 'mono', 'font-size': 15 }); }); }
  function decRow(cur, done, u0) {
    TGT.forEach((w, j) => { const on = j < done, now = j === cur;
      card(DX2[j], DY2, 104, 40, { rx: 8, text: on || now ? w : '·', fs: 16, fw: 700, stroke: now ? ACC : on ? GOOD : GRID, fill: now ? ACCBG : PANEL, color: now ? ACC : on ? INK : MUT, sw: now ? 2.6 : 1.6 }); }); }
  function gazeTo(j, u, at, labels) { ATT[j].w.forEach((a, i) => { gaze(X2[i], Y2 + 16, DX2[j], DY2 - 22, a, E(u, at, at + 0.6));
      if (labels) mono(X2[i] + 52, Y2 + 44, `α=${f2(a)}`, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, at + 0.5) }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { encTop({ pop: (i) => pop(u, 0.2 + i * 0.25), hot: () => ACC });
      el('rect', { x: 40, y: Y2 - 24, width: 590 * E(u, 1.0, 1.6), height: 48, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5' });
      mono(700, 200, 'context = hs[-1]', { 'font-size': 18, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) }); strike(696, 194, 178, E(u, 1.2, 1.7));
      pill(790, 260, 'hs 전체 보관', GOOD, pop(u, 1.8), { fs: 16 });
      sub(790, 305, '버리는 상태 0개', fade(u, 2.2), { 'font-size': 15 }); return; }
    encTop();
    if (k === 1) { el('rect', { x: 40, y: Y2 - 24, width: 590, height: 48, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5' });
      card(350, DY2, 600, 52, { rx: 12, stroke: ACC, fill: PANEL, s: pop(u, 0.3) });
      mono(350, DY2 + 6, 'decode_with_attention(hs)', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      grow(340, Y2 + 26, 340, DY2 - 30, E(u, 0.8, 1.4), ACC);
      sub(470, 230, '루프 안에서 hs 를 다시 볼 수 있다', fade(u, 1.5), { 'font-size': 15 });
      const m = E(u, 1.6, 2.3); vec(lerp(X2[2], 830, m), lerp(Y2, 250, m), H[2], { cw: 24, ch: 24, op: fade(u, 1.6) });
      sub(830, 290, 's ← hs[-1] (시작 상태)', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 2) { decRow(0, 0); gazeTo(0, u, 0.4, true);
      mono(660, 190, 'alphas = attention_weights(s, hs)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.4) });
      note(660, 240, '"I" 를 만들 때 → "나는" 을 응시', fade(u, 1.9), { fill: ACC }); return; }
    if (k === 3) { decRow(0, 0); gazeTo(0, 3, 0, true);
      H.forEach((h, i) => { const m = E(u, 0.3 + i * 0.25, 1.2 + i * 0.25); if (m > 0 && m < 1) vec(lerp(X2[i], 820, m), lerp(Y2, 210, m), h, { cw: 22, ch: 22, op: 0.3 + 0.7 * ATT[0].w[i] }); });
      if (u > 1.6) { vec(820, 210, ATT[0].ctx, { num: true, cw: 44, ch: 32, fmt: f2, s: pop(u, 1.6) }); }
      lbl(820, 170, 'context = Σ αᵢ·hᵢ', fade(u, 1.7), { class: 'mono', fill: ACC });
      sub(820, 255, 'h1 쪽으로 기운 맞춤형 벡터', fade(u, 2.2), { 'font-size': 14.5 });
      sub(820, 280, '스텝마다 새로 만든다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 4) { if (u < 1.5) decRow(0, 0); else decRow(-1, 1); gazeTo(0, 3, 0, false);
      vec(820, 130, ATT[0].ctx, { cw: 26, ch: 24 }); sub(820, 105, 'context', 1, { 'font-size': 14 });
      card(820, 205, 190, 40, { rx: 8, text: 'update_state(s, ctx)', fs: 14, mono: true, s: pop(u, 0.3) }); grow(820, 145, 820, 182, E(u, 0.3, 0.6), MUT);
      card(820, 280, 190, 40, { rx: 8, text: 'predict_word(s, ctx)', fs: 14, mono: true, s: pop(u, 0.8), stroke: ACC, color: ACC }); grow(820, 226, 820, 257, E(u, 0.8, 1.1), MUT);
      el('path', { d: `M720,280 Q ${DX2[0] + 60},${DY2 - 60} ${DX2[0] + 30},${DY2 - 22}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.2), 'marker-end': 'url(#ra-ahb)' });
      el('path', { d: `M920,280 Q 950,${DY2} 700,${DY2}`, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 2.0) });
      sub(800, 405, '다시 ① 로 — 다음 단어', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 5) { const d = Math.min(3, 1 + Math.floor(Math.max(0, u - 0.2) / 0.8)), uu = u - 0.2 - (d - 1) * 0.8;
      decRow(d, d); gazeTo(d, uu, 0, true);
      const lines = [['am → "이다" (3번째)', 1], ['a → 여기저기 분산', 2], ['student → "학생"', 3]];
      lines.forEach(([s, j], i) => tx(680, 170 + i * 40, s, { 'font-size': 16, 'font-weight': 700, fill: j === d ? ACC : MUT, opacity: d >= j ? 1 : 0 }));
      sub(800, 310, 'α 는 스텝마다 다시 계산된다', fade(u, 2.3), { 'font-size': 15 }); return; }
    // k6: 정렬
    decRow(-1, 4);
    TGT.forEach((_, j) => { const i = ATT[j].w.indexOf(Math.max(...ATT[j].w)); gaze(X2[i], Y2 + 16, DX2[j], DY2 - 22, ATT[j].w[i], E(u, 0.3 + j * 0.3, 0.8 + j * 0.3)); });
    note(680, 170, '응시의 방향 = 정렬(alignment)', fade(u, 1.6), { fill: ACC });
    sub(800, 215, 'am 선이 student 선과 엇갈린다', fade(u, 1.9), { 'font-size': 15 });
    pill(800, 280, 'α 는 누가 계산하나? → Step 3', WARN, pop(u, 2.3), { fs: 15 }); }

  // ---------- 3. 3박자 계산 ----------
  const HM = { x: 70, y: 110, cs: 46 };
  function Hmat(o) { o = o || {}; R.heat(HM.x, HM.y, H, HM.cs, { max: 1, fmt: f1, cols: ['d1', 'd2', 'd3', 'd4'], rows: o.rows || ['h1', 'h2', 'h3'], hi: o.hi }); }
  function sCol(x, o) { o = o || {}; col(x, HM.y - 20, S[0], { cs: 34, w: 50, fmt: f1, show: o.show, hi: o.hi }); lbl(x, HM.y - 34, 's', 1, { class: 'mono' }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { Hmat(); lbl(HM.x + 92, HM.y + 160, 'H  (3, 4)', 1, { class: 'mono' });
      const sx = k === 1 ? 470 : 330;
      tx(282, 190, '@', { 'font-size': 26, 'font-weight': 800, fill: MUT });
      if (k === 1) { const g = pop(u, 0.3); const W4 = [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]];
        if (g > 0.02) { const gg = R.G(390, 170, g); W4.forEach((r, i) => r.forEach((_, j) => el('rect', { x: -60 + j * 30, y: -60 + i * 30, width: 27, height: 27, rx: 4, fill: WARN, opacity: 0.25 + 0.12 * ((i * 3 + j) % 4) }, gg))); }
        lbl(390, 100, 'W (학습)', fade(u, 0.6), { fill: WARN }); tx(438, 190, '@', { 'font-size': 22, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.5) });
        sCol(sx);
        mono(570, 120, 'H @ (W @ s)', { 'font-size': 19, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
        sub(700, 170, 'W 가 차원을 이어 준다', fade(u, 1.5), { 'font-size': 15 });
        sub(700, 200, '(d_h × d_s) 달라도 된다', fade(u, 1.8), { 'font-size': 15 });
        pill(700, 260, '학습 파라미터 + W', WARN, pop(u, 2.2), { fs: 15 });
        sub(700, 310, '3박자 구조는 그대로', fade(u, 2.4), { 'font-size': 15 }); return; }
      sCol(sx, { show: (i) => fade(u, 0.2 + i * 0.1) });
      tx(372, 190, '=', { 'font-size': 26, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.6) });
      col(450, HM.y, ATT[0].sc, { cs: 43, w: 64, show: (i) => fade(u, 0.8 + i * 0.4), max: 1 });
      [0, 1, 2].forEach((i) => { const a = seg(u, 0.8 + i * 0.4, 1.2 + i * 0.4); if (a > 0 && a < 1) el('rect', { x: HM.x - 3, y: HM.y + i * HM.cs - 3, width: 4 * HM.cs + 3, height: HM.cs + 3, rx: 6, fill: 'none', stroke: INK, 'stroke-width': 2.5 }); });
      lbl(450, HM.y + 160, 'scores (3,)', fade(u, 2.0), { class: 'mono' });
      mono(560, 120, 'score_dot = H @ s', { 'font-size': 19, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      sub(700, 170, '방향이 비슷할수록 큰 값', fade(u, 2.2), { 'font-size': 15 });
      pill(700, 230, '학습 파라미터 0개', GOOD, pop(u, 2.4), { fs: 15 }); return; }
    if (k === 2) { // additive (Bahdanau) — 작은 신경망
      const sx = 110, hx = 110, y1 = 130, y2 = 290;
      vec(sx, y1, S[0], { cw: 26, ch: 26, s: pop(u, 0.2) }); lbl(sx, y1 - 26, 's', fade(u, 0.2), { class: 'mono' });
      vec(hx, y2, H[0], { cw: 26, ch: 26, s: pop(u, 0.3) }); lbl(hx, y2 + 40, 'hᵢ', fade(u, 0.3), { class: 'mono' });
      const NX = 400, ny = [150, 200, 250, 300];
      [[y1, 'W₁'], [y2, 'W₂']].forEach(([yy, nm], q) => { ny.forEach((n, j) => { const g = E(u, 0.5 + q * 0.3, 0.9 + q * 0.3); if (g > 0) el('line', { x1: sx + 60, y1: yy, x2: lerp(sx + 60, NX - 16, g), y2: lerp(yy, n, g), stroke: q ? INFO : ACC, 'stroke-width': 1.6, opacity: 0.7 }); });
        mono(250, q ? 290 : 140, nm, { 'font-size': 16, 'font-weight': 700, fill: q ? INFO : ACC, opacity: fade(u, 0.7 + q * 0.3) }); });
      ny.forEach((n, j) => { el('circle', { cx: NX, cy: n, r: 15, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.1) }); });
      lbl(NX, 345, 'tanh', fade(u, 1.2), { class: 'mono' });
      ny.forEach((n) => grow(NX + 16, n, 560, 225, E(u, 1.4, 1.8), MUT, { plain: true }));
      mono(480, 198, 'v', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      el('circle', { cx: 576, cy: 225, r: 17, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.8) }); mono(606, 230, 'score', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
      mono(660, 110, 'vᵀ tanh(W₁s + W₂hᵢ)', { 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      tx(660, 150, 'Bahdanau 2014 = additive', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(660, 290, 'dot · general', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.3) });
      sub(800, 318, '= Luong 2015, 더 가볍다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 3) { const sc = ATT[0].sc, x4 = sc.map((v) => v * 4), w = ATT[0].w;
      const colsX = [130, 400, 680], heads = ['scores', '× 4', 'softmax → α'], vals = [sc, x4, w], mx = [1, 4, 1];
      colsX.forEach((x, q) => { const at = 0.3 + q * 0.7; lbl(x + 80, 92, heads[q], fade(u, at), { class: 'mono', fill: q === 2 ? ACC : INK });
        vals[q].forEach((v, i) => { tx(x - 14, 135 + i * 62, SRC[i], { 'font-size': 15, 'text-anchor': 'end', fill: MUT, opacity: fade(u, at) });
          R.hbar(x, 122 + i * 62, 150, v, mx[q], { h: 22, u: E(u, at, at + 0.5), col: q === 2 ? ACC : q === 1 ? WARN : INFO, text: f2(v) }); });
        if (q < 2) grow(x + 210, 185, colsX[q + 1] - 70, 185, E(u, at + 0.4, at + 0.7), MUT); });
      mono(680, 340, 'Σα = 1.00', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
      sub(330, 340, 'exp(x − max) 로 오버플로 방지', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 4) { card(480, 210, 220, 110, { rx: 14, stroke: ACC, sw: 3, fill: ACCBG, s: pop(u, 0.2) });
      mono(480, 205, 'attend(s, H)', { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      sub(480, 235, '① → ② → ③', fade(u, 0.5), { 'font-size': 15 });
      vec(150, 150, S[0], { s: pop(u, 0.6) }); mono(150, 115, 's  (d,)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      R.heat(90, 245, H.map((r) => r.map(() => 0.5)), 30, { max: 1, fmt: () => '', fs: 13.5 }); mono(150, 360, 'H  (T, d)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      grow(220, 150, 368, 190, E(u, 0.8, 1.2), MUT); grow(215, 290, 368, 235, E(u, 1.0, 1.4), MUT);
      grow(592, 190, 730, 150, E(u, 1.5, 1.9), ACC); grow(592, 235, 730, 290, E(u, 1.7, 2.1), ACC);
      vec(820, 150, ATT[0].ctx, { s: pop(u, 1.9) }); mono(820, 115, 'context (d,)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      vec(820, 290, ATT[0].w, { s: pop(u, 2.1), col: WARN }); mono(820, 255, 'weights (T,)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.1) });
      sub(820, 335, '→ 나중에 어텐션 맵', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 5) { const rows = [['① scores  = H @ s', `[${ATT[0].sc.map(f2).join(', ')}]`, INFO], ['② weights = softmax(4·scores)', `[${ATT[0].w.map(f2).join(', ')}]`, ACC], ['③ context = weights @ H', '(d,) 가중합', GOOD]];
      rows.forEach(([a, b, colr], i) => { const at = 0.3 + i * 0.7, y = 110 + i * 95;
        card(260, y, 420, 56, { rx: 10, stroke: colr, sw: 2.4, s: pop(u, at) }); mono(70, y + 6, a, { 'font-size': 16, 'font-weight': 700, fill: colr, opacity: fade(u, at) });
        mono(510, y + 6, b, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, at + 0.3) });
        if (i < 2) grow(260, y + 30, 260, y + 64, E(u, at + 0.4, at + 0.7), MUT); });
      note(510, 380, '세 줄이면 어텐션 한 스텝', fade(u, 2.4), { fill: ACC }); return; }
    if (k === 6) { Hmat({ rows: SRC, hi: (r, cc) => cc === 0 && u > 1.4 });
      lbl(HM.x + 92, HM.y + 160, 'H  (3, 4)', 1, { class: 'mono' });
      sCol(330, { hi: (i) => i === 0 && u > 1.4, show: (i) => fade(u, 0.4 + i * 0.1) });
      sub(330, HM.y + 190, '"I" 직전 상태 s1', fade(u, 0.8), { 'font-size': 14.5 });
      note(450, 150, 's1 은 1번 축이 크다 (1.0)', fade(u, 1.4)); note(450, 190, 'h1 도 1번 축이 크다 (0.9)', fade(u, 1.7));
      pill(620, 260, '→ h1 점수가 클 것', ACC, pop(u, 2.2), { fs: 15 }); return; }
    if (k === 7) { SRC.forEach((w, i) => { tx(150, 120 + i * 50, w, { 'font-size': 15, 'text-anchor': 'end', fill: MUT });
        R.hbar(165, 106 + i * 50, 220, ATT[0].w[i], 1, { h: 22, u: E(u, 0.3, 1.0), text: f2(ATT[0].w[i]) }); });
      mono(90, 80, 'w =', { 'font-size': 16, 'font-weight': 700, fill: ACC });
      lbl(640, 92, 'ctx  vs  h1', fade(u, 1.0), { class: 'mono' });
      vec(640, 140, ATT[0].ctx, { num: true, fmt: f2, cw: 50, ch: 32, s: pop(u, 1.1) }); mono(490, 145, 'ctx', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1), 'text-anchor': 'end' });
      vec(640, 190, H[0], { num: true, fmt: f2, cw: 50, ch: 32, s: pop(u, 1.5), col: INFO }); mono(490, 195, 'h1', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5), 'text-anchor': 'end' });
      note(510, 270, 'ctx ≈ h1 방향', fade(u, 2.0), { fill: ACC });
      sub(270, 290, 'print(w) → [0.893 0.035 0.072]', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k8: 역전파
    const st = [['s, H', 90], ['① dot', 270], ['② softmax', 450], ['③ Σαh', 630], ['loss', 820]];
    st.forEach(([s, x], i) => card(x, 170, i === 4 ? 100 : 130, 50, { rx: 10, text: s, fs: 16, mono: true, stroke: i === 4 ? BAD : INK, s: pop(u, 0.2 + i * 0.12) }));
    st.slice(1).forEach(([, x], i) => grow(st[i][1] + 66, 170, x - 68, 170, E(u, 0.5 + i * 0.1, 0.8 + i * 0.1), MUT));
    for (let i = 4; i > 0; i--) { const a = 1.2 + (4 - i) * 0.25; el('path', { d: `M${st[i][1]},${200} Q ${(st[i][1] + st[i - 1][1]) / 2},${270} ${st[i - 1][1] + 10},${202}`, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: fade(u, a), 'marker-end': 'url(#ra-ahr)' }); }
    for (let i = 0; i < 3; i++) R.dot([[820, 200], [720, 260], [540, 260], [360, 260], [180, 260], [100, 205]], seg(u, 1.4 + i * 0.25, 2.5 + i * 0.05), BAD, 6);
    mono(480, 300, '∂L/∂(점수 함수) 까지 흐른다', { 'font-size': 16, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    note(480, 360, '"어디를 볼지"도 역전파로 학습된다', fade(u, 2.4), { 'text-anchor': 'middle' }); }

  // ---------- 4. 어텐션 맵 ----------
  const MP = { x: 150, y: 90, cs: 70 };
  function mapCells(o) { o = o || {};
    ATT.forEach((a, r) => a.w.forEach((v, cc) => { const vis = o.row ? o.row(r) : 1; if (vis <= 0.01) return; const x = MP.x + cc * MP.cs, y = MP.y + r * MP.cs, dim = o.dim ? o.dim(r, cc) : 1;
      el('rect', { x, y, width: MP.cs - 4, height: MP.cs - 4, rx: 6, fill: PANEL, stroke: GRID, opacity: vis });
      el('rect', { x, y, width: MP.cs - 4, height: MP.cs - 4, rx: 6, fill: ACC, opacity: vis * dim * (0.06 + 0.85 * v) });
      if (o.hi && o.hi(r, cc)) el('rect', { x: x - 2, y: y - 2, width: MP.cs, height: MP.cs, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 3 });
      const nOp = o.num ? o.num(r, cc) : 1; if (nOp > 0.01) mono(x + MP.cs / 2 - 2, y + MP.cs / 2 + 4, f2(v), { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: v > 0.55 ? PANEL : INK, opacity: vis * nOp * (0.4 + 0.6 * dim) }); }));
    SRC.forEach((s, cc) => lbl(MP.x + cc * MP.cs + MP.cs / 2 - 2, MP.y - 14, s, 1, { 'font-size': 15 }));
    TGT.forEach((s, r) => tx(MP.x - 14, MP.y + r * MP.cs + MP.cs / 2 + 4, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: o.row ? Math.min(1, o.row(r) * 2) : 1 })); }
  const ARG = ATT.map((a) => a.w.indexOf(Math.max(...a.w)));
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { mapCells({ row: (r) => E(u, 0.6 + r * 0.45, 0.9 + r * 0.45) });
      TGT.forEach((_, r) => { const at = 0.3 + r * 0.45; R.fly(720, 130 + r * 40, MP.x + 105, MP.y + r * MP.cs + 33, seg(u, at, at + 0.4), `attend(s${r + 1}, H)[1]`, { mono: true }); });
      TGT.forEach((_, r) => mono(590, 135 + r * 40, `s${r + 1}`, { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) }));
      mono(560, 340, 'attn_map  (4, 3)', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { mapCells({ num: (r, cc) => fade(u, 0.3 + (r * 3 + cc) * 0.08) });
      TGT.forEach((_, r) => mono(MP.x + 3 * MP.cs + 10, MP.y + r * MP.cs + 39, '→ Σ = 1', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5 + r * 0.15) }));
      tx(520, 140, '행 = 출력 단어', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(520, 175, '열 = 입력 단어', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(640, 230, '행 하나 = 그 단어의 관심 배분', fade(u, 2.4), { 'font-size': 15 }); return; }
    if (k === 2) { mapCells({ dim: (r) => (r === 0 ? 1 : 1 - 0.75 * E(u, 0.3, 0.8)), hi: (r, cc) => r === 0 && cc === 0 && u > 0.9 });
      note(520, 140, 'I → "나는"  0.89', fade(u, 1.0), { fill: ACC }); sub(640, 190, '주어는 어순이 같아 대각선', fade(u, 1.7), { 'font-size': 15 }); return; }
    if (k === 3) { const ph = Math.min(3, 1 + Math.floor(Math.max(0, u - 0.2) / 0.75));
      mapCells({ dim: (r) => (r === ph ? 1 : 0.3), hi: (r, cc) => r === ph && (r === 2 || cc === ARG[r]) });
      [['am → "이다" 0.89 (점프)', 1, ACC], ['a → 0.14 / 0.60 / 0.26 (분산)', 2, WARN], ['student → "학생" 0.89 (회귀)', 3, ACC]].forEach(([s, r, colr], i) => tx(510, 140 + i * 44, s, { 'font-size': 16, 'font-weight': 700, fill: r === ph ? colr : MUT, opacity: r <= ph ? 1 : 0 }));
      sub(680, 300, '대응어가 없으면 가중치가 퍼진다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 4) { mapCells({ dim: () => 0.6 });
      const cxy = (r, cc) => [MP.x + cc * MP.cs + 33, MP.y + r * MP.cs + 33];
      el('line', { x1: cxy(0, 0)[0], y1: cxy(0, 0)[1], x2: cxy(2, 2)[0], y2: cxy(2, 2)[1], stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      const pts = ARG.map((cc, r) => cxy(r, cc)); R.dot(pts, seg(u, 0.6, 1.8), ACC, 8);
      const g = E(u, 0.6, 1.8), n = pts.length - 1, kk = g * n, i0 = Math.floor(kk), ps = pts.slice(0, i0 + 1); if (i0 < n) ps.push([lerp(pts[i0][0], pts[i0 + 1][0], kk - i0), lerp(pts[i0][1], pts[i0 + 1][1], kk - i0)]);
      if (g > 0) el('polyline', { points: ps.map((p) => p.join(',')).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 4, 'stroke-linejoin': 'round' });
      sub(MP.x + 105, MP.y + 300, '점선 = 완전한 대각선', fade(u, 0.4), { 'font-size': 14 });
      // 두 언어 어순
      SRC.forEach((s, i) => tok(560 + i * 120, 130, s, { s: pop(u, 1.4 + i * 0.1) }));
      TGT.forEach((s, j) => tok(520 + j * 110, 250, s, { s: pop(u, 1.6 + j * 0.1), stroke: ACC, color: ACC }));
      TGT.forEach((_, j) => { if (j === 2) return; grow(560 + ARG[j] * 120, 148, 520 + j * 110, 232, E(u, 1.9 + j * 0.1, 2.3 + j * 0.1), ACC, { plain: true }); });
      note(560, 330, '한국어 서술어는 끝 → 선이 꺾인다', fade(u, 2.4)); return; }
    if (k === 5) { mapCells({ num: () => 0 });
      const bx = 450, by = MP.y; for (let i = 0; i < 20; i++) el('rect', { x: bx, y: by + i * 13.6, width: 22, height: 14, fill: ACC, opacity: (0.06 + 0.85 * (1 - i / 19)) * fade(u, 0.5) });
      [['1.0', 0], ['0.5', 0.5], ['0.0', 1]].forEach(([s, f]) => mono(bx + 30, by + f * 266 + 5, s, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.7) }));
      mono(560, 150, 'imshow(vmin=0, vmax=1)', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.0) });
      sub(700, 200, '밝기 기준을 고정해야', fade(u, 1.6), { 'font-size': 15 }); sub(700, 228, '그림끼리 비교할 수 있다', fade(u, 1.8), { 'font-size': 15 });
      note(560, 300, '축 라벨 = 실제 단어', fade(u, 2.3)); return; }
    if (k === 6) { mapCells({ num: (r, cc) => fade(u, 0.8 + (r * 3 + cc) * 0.1), hi: (r, cc) => (r === 0 && cc === 2) || (r === 3 && cc === 0) ? u > 0.3 && u < 2.0 : false });
      note(510, 150, '0.04 와 0.07 — 색만으론 구분 불가', fade(u, 0.3));
      mono(510, 210, 'ax.text(j, i, f"{v:.2f}")', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      sub(680, 270, '해석용 그림은 색 + 숫자', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k7: 정렬은 부산물
    mapCells({ dim: () => fade(u, 1.2, 0.8) });
    card(720, 120, 230, 52, { rx: 10, text: 'loss = 번역 손실 하나', fs: 16, stroke: BAD, color: BAD, s: pop(u, 0.2) });
    el('path', { d: 'M640,140 Q 560,170 400,180', fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4', opacity: fade(u, 0.6), 'marker-end': 'url(#ra-ahr)' });
    card(720, 220, 230, 46, { rx: 10, text: '정렬 정답표: 없음', fs: 15, stroke: MUT, color: MUT, s: pop(u, 0.9) });
    pill(720, 300, '정렬 = 부산물', GOOD, pop(u, 2.0), { fs: 16 });
    sub(720, 350, '모델 내부를 들여다보는 창', fade(u, 2.4), { 'font-size': 15 }); }

  // ---------- 5. PyTorch 실전판 · 파장 ----------
  function slab(x, y, B, T, d, o) { o = o || {}; const cw = o.cw || 18, off = o.off || 12;
    for (let b = B - 1; b >= 0; b--) { const ox = x + b * off, oy = y - b * off;
      for (let i = 0; i < T; i++) for (let j = 0; j < d; j++) el('rect', { x: ox + j * cw, y: oy + i * cw, width: cw - 2, height: cw - 2, rx: 2, fill: o.col || ACC, opacity: (o.op ?? 1) * (0.2 + 0.12 * ((i + j + b) % 3)) }); } }
  function neurons(x, n, y0, gap, colr, op) { for (let i = 0; i < n; i++) el('circle', { cx: x, cy: y0 + i * gap, r: 10, fill: PANEL, stroke: colr || INK, 'stroke-width': 2, opacity: op }); }
  function links(x1, n1, y1, g1, x2, n2, y2, g2, u, colr) { if (u <= 0) return; for (let i = 0; i < n1; i++) for (let j = 0; j < n2; j++) el('line', { x1: x1 + 10, y1: y1 + i * g1, x2: lerp(x1 + 10, x2 - 10, u), y2: lerp(y1 + i * g1, y2 + j * g2, u), stroke: colr || MUT, 'stroke-width': 1, opacity: 0.45 }); }
  const BLEU = { len: [10, 20, 30, 40, 60], plain: [26, 23, 16, 10, 5], attn: [27, 27, 26, 26, 24] };
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(330, 210, 440, 250, { rx: 14, stroke: ACC, sw: 2.4, fill: PANEL, s: pop(u, 0.2) });
      mono(130, 115, 'class LuongAttention(nn.Module)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      neurons(220, 4, 160, 40, INK, fade(u, 0.7)); neurons(440, 4, 160, 40, WARN, fade(u, 0.9));
      links(220, 4, 160, 40, 440, 4, 160, 40, E(u, 1.0, 1.6), WARN);
      mono(330, 318, 'W = Linear(d, d, bias=False)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.5) });
      sub(220, 140, 's', fade(u, 0.7), { 'font-size': 15 }); sub(440, 140, 'W·s', fade(u, 0.9), { 'font-size': 15 });
      note(600, 150, '학습 대상은 W 하나', fade(u, 1.9), { fill: WARN });
      sub(740, 200, 'numpy 의 score_general 이', fade(u, 2.2), { 'font-size': 15 }); sub(740, 228, '그대로 레이어가 됐다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 1) { slab(80, 170, 3, 3, 4, { op: fade(u, 0.2) }); mono(130, 280, 'H  (B, T, d)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      slab(360, 170, 3, 4, 1, { col: WARN, op: fade(u, 0.6) }); mono(370, 280, 'W(s)  (B, d, 1)', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.7) });
      tx(300, 205, '×', { 'font-size': 26, fill: MUT, 'font-weight': 800, opacity: fade(u, 0.6) });
      grow(450, 200, 560, 200, E(u, 1.0, 1.4), MUT); mono(470, 186, 'bmm', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
      slab(600, 170, 3, 3, 1, { col: INFO, op: fade(u, 1.4) }); mono(600, 280, 'scores  (B, T, 1)', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      note(80, 360, '배치 B 개를 한 번에 — 수식은 그대로, 차원만 늘었다', fade(u, 2.2)); return; }
    if (k === 2) { slab(70, 170, 3, 3, 1, { col: INFO }); mono(60, 280, 'scores', { 'font-size': 15, 'font-weight': 700, fill: INFO });
      grow(130, 205, 220, 205, E(u, 0.3, 0.6), MUT); mono(140, 190, 'softmax', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) }); mono(140, 232, 'dim=1 (T)', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      slab(240, 170, 3, 3, 1, { col: ACC, op: fade(u, 0.6) }); mono(230, 280, 'weights (B, T)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
      tx(340, 205, '×', { 'font-size': 24, fill: MUT, 'font-weight': 800, opacity: fade(u, 1.0) });
      slab(380, 170, 3, 3, 4, { op: fade(u, 1.0) }); mono(400, 280, 'H', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      grow(500, 205, 600, 205, E(u, 1.3, 1.6), MUT); mono(520, 190, 'bmm', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      slab(630, 190, 3, 1, 4, { col: GOOD, op: fade(u, 1.7) }); mono(620, 280, 'context (B, d)', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      pill(480, 350, 'return context, weights', ACC, pop(u, 2.2), { fs: 15, mono: true }); return; }
    if (k === 3 || k === 4) { const LX = [120, 330, 540, 760];
      const ln = [['s ; ctx', 6, INK], ['combine', 3, ACC], ['tanh', 3, WARN], ['out → vocab', 5, INFO]];
      if (k === 3) { [['attn', 'LuongAttention(d)', 0.3], ['combine', 'Linear(2d → d)', 0.9], ['out', 'Linear(d → vocab)', 1.5]].forEach(([n, d, at], i) => {
          card(170 + i * 290, 160, 240, 70, { rx: 12, stroke: i === 1 ? ACC : INK, sw: i === 1 ? 3 : 2, s: pop(u, at) });
          mono(170 + i * 290, 152, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 1 ? ACC : INK, opacity: fade(u, at) });
          mono(170 + i * 290, 178, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, at + 0.1) });
          if (i < 2) grow(292 + i * 290, 160, 336 + i * 290, 160, E(u, at + 0.3, at + 0.5), MUT); });
        note(170, 280, '입력 = [상태 d ; 컨텍스트 d] = 2d', fade(u, 2.0), { fill: ACC });
        sub(480, 330, 'AttnDecoderStep — 디코더 한 스텝', fade(u, 2.3), { 'font-size': 15 }); return; }
      // k4: 결합 후 예측
      vec(120, 110, S[0], { cw: 24, ch: 24, s: pop(u, 0.2) }); vec(120, 150, ATT[0].ctx, { cw: 24, ch: 24, col: GOOD, s: pop(u, 0.3) });
      mono(30, 115, 's', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(20, 155, 'ctx', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) });
      neurons(LX[1], 4, 100, 40, ACC, fade(u, 0.7)); links(LX[0] + 50, 2, 110, 40, LX[1], 4, 100, 40, E(u, 0.5, 0.9), ACC);
      mono(LX[1], 285, 'combine', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.7) });
      // tanh 곡선
      const ax = R.axes(430, 110, 140, 120, { x: [-3, 3], y: [-1, 1] }); const tp = []; for (let i = 0; i <= 30; i++) { const xv = -3 + i * 0.2; tp.push([xv, Math.tanh(xv)]); }
      R.line(ax, tp, E(u, 1.0, 1.5), WARN); mono(500, 285, 'tanh', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) });
      grow(350, 170, 420, 170, E(u, 0.9, 1.1), MUT); grow(585, 170, 650, 170, E(u, 1.5, 1.7), MUT);
      const lg = [0.2, 0.9, 0.35, 0.15, 0.5]; lg.forEach((v, i) => { const h = 110 * v * E(u, 1.7, 2.2); el('rect', { x: 680 + i * 46, y: 240 - h, width: 34, height: h, rx: 3, fill: INFO, opacity: 0.85 }); });
      mono(790, 270, 'logits (B, vocab)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.8) });
      sub(790, 296, '막대 높이는 모양만 (예시)', fade(u, 2.0), { 'font-size': 13.5 });
      note(60, 360, '원문 정보(ctx)가 예측 직전까지 살아 있다', fade(u, 2.4), { fill: GOOD }); return; }
    if (k === 5) { const ax = R.axes(90, 70, 470, 270, { x: [0, 65], y: [0, 30], xt: [10, 20, 30, 40, 60], yt: [0, 10, 20, 30], xl: '문장 길이 (단어)', yl: 'BLEU', grid: true });
      R.line(ax, BLEU.len.map((x, i) => [x, BLEU.plain[i]]), E(u, 0.3, 1.3), MUT, { sw: 3 }); R.line(ax, BLEU.len.map((x, i) => [x, BLEU.attn[i]]), E(u, 0.9, 1.9), ACC, { sw: 3.4 });
      R.scatter(ax, BLEU.len.map((x, i) => [x, BLEU.plain[i], MUT]), { u: E(u, 0.3, 1.3), r: 5 }); R.scatter(ax, BLEU.len.map((x, i) => [x, BLEU.attn[i], ACC]), { u: E(u, 0.9, 1.9), r: 5 });
      tx(ax.X(60) + 12, ax.Y(5) + 5, 'seq2seq', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.3) });
      tx(ax.X(60) + 12, ax.Y(24) + 5, '+ 어텐션', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
      note(690, 170, '길이가 더는 벌이 아니다', fade(u, 2.1), { fill: ACC });
      sub(780, 215, '예시 — Bahdanau 2014 경향 재구성', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k6: RNN 은 왜?
    const words = ['나는', '학생', '이다', '.'];
    words.forEach((w, i) => { tok(120 + i * 100, 120, w); if (i < 3) grow(150 + i * 100, 150, 190 + i * 100, 150, 1, MUT); });
    lbl(270, 75, 'RNN: 한 칸씩 순서대로', 1, { fill: MUT });
    cross(270, 190, 18, pop(u, 0.6)); sub(270, 236, '병렬화를 막는다', fade(u, 0.8), { 'font-size': 15, fill: BAD });
    const cx = 720, cy = 210, rr = 110, P = words.map((_, i) => [cx + rr * Math.cos(-Math.PI / 2 + i * Math.PI / 2), cy + rr * Math.sin(-Math.PI / 2 + i * Math.PI / 2)]);
    let q = 0; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const g = E(u, 1.2 + q * 0.12, 1.5 + q * 0.12); if (g > 0) el('line', { x1: P[i][0], y1: P[i][1], x2: lerp(P[i][0], P[j][0], g), y2: lerp(P[i][1], P[j][1], g), stroke: ACC, 'stroke-width': 2.2, opacity: 0.7 }); q++; }
    words.forEach((w, i) => tok(P[i][0], P[i][1], w, { s: pop(u, 1.0 + i * 0.05), stroke: ACC, color: ACC }));
    lbl(720, 60, '단어끼리 서로 어텐션?', fade(u, 1.0), { fill: ACC });
    pill(480, 385, 'Attention Is All You Need (2017) → 다음 장', WARN, pop(u, 2.3), { fs: 15 }); }

  RA.page({ title: '어텐션 — "나는 학생 이다" → "I am a student"', scenes: [s1, s2, s3, s4, s5] });
})();
