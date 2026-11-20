/* III-2-1 LSTM·GRU 게이트 해부 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 기억 칸 값·게이트 값·감쇠 표·기울기 생존율·GRU 비교표는 STEPS 의 slots · decay · grad · gru · remain 을 그대로 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, cross, check, dot, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const sigm = (z) => 1 / (1 + Math.exp(-z));
  // 작은 함수 그래프: f 를 [-5, 5] 에서 그린다. lo~hi 는 세로 범위
  function fplot(x, y, w, h, f, lo, hi, u, col, o) { o = o || {}; const X = (z) => x + ((z + 5) / 10) * w, Y = (v) => y + h - ((v - lo) / (hi - lo)) * h;
    el('line', { x1: x, y1: Y(0), x2: x + w, y2: Y(0), stroke: GRID, 'stroke-width': 1.5 }); el('line', { x1: X(0), y1: y, x2: X(0), y2: y + h, stroke: GRID, 'stroke-width': 1.5 });
    [lo, hi].forEach((v) => mono(x - 6, Y(v) + 5, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }));
    el('line', { x1: x, y1: Y(hi), x2: x + w, y2: Y(hi), stroke: GRID, 'stroke-dasharray': '3 4' }); el('line', { x1: x, y1: Y(lo), x2: x + w, y2: Y(lo), stroke: GRID, 'stroke-dasharray': '3 4' });
    const p = []; for (let i = 0; i <= 60 * clamp(u); i++) { const z = -5 + i / 6; p.push([X(z), Y(f(z))]); }
    if (p.length > 1) el('polyline', { points: p.map((q) => q.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 3 });
    if (o.name) mono(x + w, y + 14, o.name, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: clamp(u * 2 - 1) }); }
  // 밸브(게이트) 계기: 세로 막대가 v 만큼 차 있다
  function valve(cx, cy, v, col, o) { o = o || {}; const h = o.h || 46, w = 20, s = o.s ?? 1; if (s <= 0) return;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 4, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: s });
    el('rect', { x: cx - w / 2 + 3, y: cy + h / 2 - 3 - (h - 6) * clamp(v), width: w - 6, height: (h - 6) * clamp(v), rx: 2, fill: col, opacity: 0.85 * s });
    if (o.label) mono(cx, cy + h / 2 + 18, o.label, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); }
  // 기억 막대 (0~1)
  function mem(x, y, w, v, col, o) { o = o || {}; el('rect', { x, y, width: w, height: 16, rx: 4, fill: SOFT, opacity: o.op ?? 1 });
    el('rect', { x, y, width: Math.max(2, w * clamp(v)), height: 16, rx: 4, fill: col, opacity: (o.op ?? 1) * 0.9 });
    if (o.text !== false) mono(x + w + 8, y + 13, o.text ?? v.toFixed(2), { 'font-size': 14.5, 'font-weight': 800, fill: o.tcol || INK, opacity: o.op ?? 1 }); }

  // ---------- 1. 아이디어 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    // 왼쪽: 두 노선
    tx(20, 30, 'RNN — 기억 h 가 매 스텝 tanh(W·) 를 통과', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 0 ? fade(u, 0.2) : 1 });
    const NX = [50, 170, 290, 410, 530];
    NX.forEach((x, i) => { const v = Math.pow(0.9, i), s = k === 0 ? pop(u, 0.3 + i * 0.12) : 1;
      el('circle', { cx: x, cy: 90, r: 24 * s, fill: BADBG, stroke: BAD, 'stroke-width': 2.2, opacity: clamp(0.35 + v) });
      mono(x, 95, v.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
      if (i) { const bx = x - 60; card(bx, 90, 50, 30, { rx: 5, text: 'tanh', fs: 13.5, mono: true, fill: PANEL, stroke: BAD, color: BAD, s }); } });
    tx(20, 178, 'LSTM — 기억 전용 통로 C 가 변환 밖으로 직진', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: k === 0 ? fade(u, 1.0) : 1 });
    const hw = k === 0 ? E(u, 1.2, 2.2) : 1;
    el('line', { x1: 30, y1: 220, x2: lerp(30, 556, hw), y2: 220, stroke: GOOD, 'stroke-width': 7, 'stroke-linecap': 'round' });
    NX.forEach((x, i) => { if (hw * 556 < x - 20) return; mono(x, 248, '1.00', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' }); });
    mono(560, 226, 'C', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: hw });
    // 통로 위 밸브 (k ≥ 3)
    if (k >= 3) [['f', 170, WARN], ['i', 290, INFO], ['o', 410, ACC]].forEach(([s, x, col], j) => { const sc = k === 3 ? pop(u, 0.6 + j * 0.3) : 1; if (sc <= 0) return;
      el('circle', { cx: x - 60, cy: 220, r: 15 * sc, fill: PANEL, stroke: col, 'stroke-width': 2.6 }); mono(x - 60, 226, s, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: sc }); });
    if (k === 0) { sub(290, 300, '같은 문장, 두 노선 — 기억이 어디로 지나가나', fade(u, 2.3), { 'font-size': 15 }); return; }
    // 오른쪽 작업대
    if (k === 1) { mono(600, 60, 'h_t = tanh(W_h @ h_prev', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(640, 86, '+ W_x @ x + b)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.4) });
      fplot(640, 120, 260, 150, Math.tanh, -1, 1, E(u, 0.6, 1.8), BAD, { name: 'tanh' });
      note(600, 320, '지키고 싶은 기억도 예외 없이 짓눌린다', fade(u, 2.0), { fill: BAD });
      dot([[50, 90], [110, 90], [170, 90]], E(u, 0.4, 1.6), BAD, 7); return; }
    if (k === 2) { const rows = (b.decay && b.decay.rows) || [], ax = R.axes(640, 50, 270, 220, { x: [0, 20], y: [0, 1], xt: [0, 5, 10, 20], yt: [0, 0.5, 1], grid: true, xl: '스텝 t' });
      const lu = E(u, 0.3, 1.9), pts = []; for (let i = 0; i <= 20; i++) pts.push([i, Math.pow(0.9, i)]);
      R.line(ax, pts, lu, BAD); const p5 = []; for (let i = 0; i <= 20; i++) p5.push([i, Math.pow(0.5, i)]); R.line(ax, p5, lu, BAD, { dash: '5 4', sw: 2 });
      R.line(ax, [[0, 1], [20, 1]], lu, GOOD, { sw: 3 });
      rows.forEach((r, i) => { const tt = +String(r.t).replace('t=', ''), at = 0.6 + i * 0.35; el('circle', { cx: ax.X(tt), cy: ax.Y(r.rnn), r: 5, fill: BAD, opacity: fade(u, at) });
        mono(ax.X(tt) + 4, ax.Y(r.rnn) - 10, r.rnn.toFixed(2), { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, at) }); });
      mono(ax.X(20), ax.Y(0.5) + 46, '0.5^20 ≈ 0.000001', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      mono(ax.X(20), ax.Y(1) - 10, 'C 1.00', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      note(600, 360, '0.9 배씩만 잃어도 20스텝 뒤 12%', fade(u, 2.2)); return; }
    if (k === 3) { note(600, 80, '기억은 통로 위로 — 변환 없이 직진', fade(u, 0.2), { fill: GOOD });
      note(600, 120, '드나드는 것만 0~1 밸브로 막는다', fade(u, 1.4));
      [0, 0.5, 1].forEach((v, i) => valve(660 + i * 90, 210, v, ACC, { s: pop(u, 1.6 + i * 0.2), label: v.toFixed(1) }));
      sub(750, 300, '0 = 막음 · 1 = 활짝', fade(u, 2.3), { 'font-size': 15 }); return; }
    const G = b.gates || [];
    if (k === 4) { G.forEach((g, j) => { const y = 70 + j * 90, s = pop(u, 0.3 + j * 0.5), col = [WARN, INFO, ACC][j];
        el('circle', { cx: 620, cy: y, r: 22 * s, fill: PANEL, stroke: col, 'stroke-width': 2.6 }); mono(620, y + 6, g.sym, { 'font-size': 18, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
        tx(656, y - 4, g.name, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s }); tx(656, y + 20, g.question, { 'font-size': 15, fill: INK, opacity: s }); });
      sub(760, 340, 'Step 2 · 3 · 4 에서 하나씩 연다', fade(u, 2.1), { 'font-size': 15 }); return; }
    // k5: 질문이 바뀐다
    const sw = E(u, 0.6, 1.4);
    card(760, 110, 330, 52, { rx: 10, text: '기억을 어떻게 잘 변환할까?', fs: 16, stroke: BAD, color: BAD, op: 1 - 0.6 * sw });
    if (sw > 0.5) el('line', { x1: 610, y1: 110, x2: lerp(610, 910, (sw - 0.5) * 2), y2: 110, stroke: BAD, 'stroke-width': 3 });
    grow(760, 145, 760, 200, E(u, 1.2, 1.6), MUT);
    card(760, 238, 330, 52, { rx: 10, text: '기억을 변환에서 어떻게 빼낼까?', fs: 16, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.6) });
    sub(760, 310, '다음: forget 문', fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 2. forget 게이트 ----------
  const SLOT_Y = [236, 296, 356];
  function s2(t, c) { const { k, u } = c, S = c.beat.slots || [], P = (c.prev && c.prev.slots) || S;
    // 위 왼쪽: 시그모이드
    fplot(70, 30, 220, 130, sigm, 0, 1, k === 0 ? E(u, 0.2, 1.4) : 1, WARN, { name: 'σ' });
    if (k === 0) { note(330, 70, '출력이 언제나 0~1', fade(u, 1.2)); note(330, 104, '→ "얼마나" 를 곱셈 계수로 바로 쓴다', fade(u, 1.8), { fill: WARN }); return; }
    // 위 오른쪽: z = [h_prev, x] → W_f → σ → f
    const zop = k === 1 ? 1 : 1, a1 = k === 1 ? pop(u, 0.2) : 1, a2 = k === 1 ? pop(u, 0.6) : 1;
    R.cells(360, 40, ['', '', '', ''], { w: 22, h: 22, gap: 2, style: () => ({ fill: INFOBG, stroke: INFO, s: a1 }) });
    R.cells(460, 40, ['', ''], { w: 22, h: 22, gap: 2, style: () => ({ fill: ACCBG, stroke: ACC, s: a2 }) });
    mono(406, 86, 'h_prev', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: a1 }); mono(484, 86, 'x', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: a2 });
    grow(520, 51, 570, 51, k === 1 ? E(u, 1.0, 1.4) : 1, MUT);
    card(620, 51, 90, 34, { rx: 7, text: 'W_f · z', fs: 14.5, mono: true, s: k === 1 ? pop(u, 1.3) : 1 });
    grow(668, 51, 710, 51, k === 1 ? E(u, 1.6, 1.9) : 1, MUT);
    card(740, 51, 50, 34, { rx: 17, text: 'σ', fs: 17, mono: true, stroke: WARN, color: WARN, s: k === 1 ? pop(u, 1.9) : 1 });
    if (k === 1) { note(360, 130, '문맥(h_prev)과 현재 단어(x)를 함께 본다', fade(u, 2.2)); return; }
    // f 칸 (3개)
    const fv = S.map((s, i) => tween(P[i] ? P[i].f : s.f, s.f, u));
    grow(768, 51, 810, 51, 1, MUT);
    R.cells(820, 34, fv.map((v) => (k >= 4 ? v.toFixed(2) : '?')), { w: 38, h: 34, gap: 3, fs: 13.5, style: () => ({ stroke: WARN, color: WARN, fill: WARNBG }) });
    mono(880, 96, 'f (칸마다)', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
    if (k === 2) { note(360, 140, '한 번 곱해 σ 를 통과 → 칸마다 다른 0~1', fade(u, 0.8)); return; }
    // 기억 3칸 (cell state 컨베이어)
    const belt = k === 3 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: 14, y: 200, width: lerp(0, 930, belt), height: 196, rx: 12, fill: GOODBG, opacity: 0.5 });
    tx(26, 222, 'cell state C (컨베이어)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: belt });
    S.forEach((s, i) => { const y = SLOT_Y[i], op = k === 3 ? fade(u, 0.6 + i * 0.4) : 1;
      tx(30, y + 20, s.name, { 'font-size': 15, 'font-weight': 700, opacity: op });
      mem(200, y + 6, 160, s.old, GOOD, { op });
      if (k >= 4) { const vs = k === 4 ? pop(u, 0.3 + i * 0.3) : 1; valve(450, y + 14, fv[i], WARN, { s: vs, h: 40 }); mono(478, y + 20, '× ' + fv[i].toFixed(2), { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: vs }); }
      if (k >= 5) { const g = k === 5 ? E(u, 0.4 + i * 0.4, 1.0 + i * 0.4) : 1, after = lerp(s.old, s.after, g);
        grow(550, y + 14, 600, y + 14, g, MUT); mem(610, y + 6, 160, after, s.wiped ? BAD : GOOD, { tcol: s.wiped ? BAD : INK, op: g > 0 ? 1 : 0 });
        if (g >= 1) tx(860, y + 20, s.wiped ? '지워짐' : '보존', { 'font-size': 15, 'font-weight': 800, fill: s.wiped ? BAD : GOOD, opacity: k === 5 ? fade(u, 1.8 + i * 0.1) : 1 }); } });
    if (k === 4) { pill(560, 140, '토큰 "지혜는" — 새 주어', ACC, pop(u, 0.2), { fs: 14 }); note(360, 186, '학습된 W_f 가 주어 칸에만 0.10', fade(u, 1.4), { fill: WARN }); }
    if (k === 5) mono(560, 150, 'C_prev ⊙ f', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
    if (k === 6) { // 연속 조절
      el('line', { x1: 380, y1: 150, x2: 700, y2: 150, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
      const pos = 0.5 + 0.45 * Math.sin(E(u, 0.2, 2.4) * Math.PI * 2);
      el('circle', { cx: lerp(380, 700, pos), cy: 150, r: 11, fill: WARN });
      mono(380, 182, '0 지움', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(540, 182, '0.5 반쯤', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700 }); mono(700, 182, '1 보존', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      note(730, 156, '스위치가 아니라 손잡이', fade(u, 0.6)); } }

  // ---------- 3. input 게이트 + 후보 ----------
  function s3(t, c) { const { k, u } = c, S = c.beat.slots || [], P = (c.prev && c.prev.slots) || S;
    // 위: 두 부품
    const pa = k === 0 ? pop(u, 0.3) : 1, pb = k === 0 ? pop(u, 1.0) : 1;
    card(150, 46, 260, 50, { rx: 10, text: '무엇을 — 후보 C̃ (tanh)', fs: 15, stroke: ACC, color: ACC, s: pa });
    card(450, 46, 260, 50, { rx: 10, text: '얼마나 — 게이트 i (σ)', fs: 15, stroke: INFO, color: INFO, s: pb });
    if (k === 0) { R.hbar(40, 100, 220, 1, 1, { col: ACC, label: false, u: E(u, 0.6, 1.2) }); mono(40, 140, '−1 ~ 1 (부호까지)', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) });
      R.hbar(340, 100, 220, 1, 1, { col: INFO, label: false, u: E(u, 1.3, 1.9) }); mono(340, 140, '0 ~ 1 (세기)', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.7) });
      note(40, 210, '새기기 = 내용 × 세기 — 둘을 나눠 만든다', fade(u, 2.1)); return; }
    // 오른쪽 위: 함수 그림
    if (k === 1) fplot(660, 26, 220, 110, Math.tanh, -1, 1, E(u, 0.2, 1.2), ACC, { name: 'tanh' });
    else if (k === 2) fplot(660, 26, 220, 110, sigm, 0, 1, E(u, 0.2, 1.2), INFO, { name: 'σ' });
    else { mono(620, 52, 'C_t = f⊙C_prev + i⊙C̃', { 'font-size': 18, 'font-weight': 800, opacity: k === 3 ? fade(u, 0.2) : 1 });
      if (k === 3) { el('circle', { cx: 778, cy: 46, r: 16, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.0) }); note(620, 100, '곱셈 변환이 아니라 덧셈 갱신', fade(u, 1.4), { fill: GOOD }); } }
    // 기억 3칸 행: keep + i × C̃ = next
    tx(200, 186, '지운 뒤 C', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(420, 186, 'i × C̃', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); if (k >= 3) tx(690, 186, '새 C_t', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    S.forEach((s, i) => { const y = SLOT_Y[i] - 20, pv = P[i] || s, hot = s.changed;
      tx(30, y + 20, s.name, { 'font-size': 15, 'font-weight': 700 });
      mem(200, y + 6, 120, s.keep, GOOD);
      mono(380, y + 21, '+', { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      if (k >= 1) { const cv = k === 1 ? fade(u, 0.6 + i * 0.3) : 1; mono(420, y + 20, s.cand, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: cv }); }
      if (k >= 2) { const iv = tween(pv.i, s.i, u); valve(560, y + 14, iv, INFO, { h: 40, s: k === 2 ? pop(u, 0.3 + i * 0.3) : 1 }); mono(584, y + 20, iv.toFixed(2), { 'font-size': 14.5, 'font-weight': 800, fill: INFO }); }
      if (k >= 4) { mono(420, y + 40, `${s.i.toFixed(2)}×${s.candV.toFixed(2)}`, { 'font-size': 13.5, fill: MUT, opacity: k === 4 ? fade(u, 0.4 + i * 0.3) : 1 }); }
      if (k >= 3) { const g = k === 3 ? E(u, 1.0 + i * 0.3, 1.8 + i * 0.3) : 1, nv = lerp(s.keep, s.next, g);
        mono(660, y + 21, '=', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
        mem(690, y + 6, 140, nv, hot ? ACC : GOOD, { tcol: hot ? ACC : INK }); }
      if (k === 6) mono(690, y + 44, `${s.keep.toFixed(2)} + ${s.add.toFixed(2)} = ${s.next.toFixed(2)}`, { 'font-size': 14, 'font-weight': 700, fill: hot ? ACC : MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
    if (k === 4) note(30, 404, '후보 [0.95, 0.10, 0.05] · 세기 [0.90, 0.20, 0.10]', fade(u, 1.6));
    if (k === 5) { banner(480, 404, '새 cell state ≈ [0.95, 0.74, 0.57]', pop(u, 0.8)); }
    if (k === 6) note(30, 404, '주어 칸만 교체 · 시제와 장소는 거의 그대로', fade(u, 1.8), { fill: ACC });
    if (k === 7) { card(250, 404, 380, 30, { rx: 15, text: '"내용은 강하지만 지금은 조금만" 이 가능', fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 0.3) });
      card(700, 404, 300, 30, { rx: 15, text: '복선: C 는 곱해지지 않고 더해진다', fs: 14.5, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.2) }); } }

  // ---------- 4. LSTM 셀 한 스텝 ----------
  function cell(k, u) { // 셀 그림: 위 C 선, 아래 h 선, 가운데 문 넷
    const x0 = 40, x1 = 520, cy = 80, hy = 300, op0 = k === 0 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: 110, y: 50, width: 340, height: 280, rx: 16, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op0 });
    el('line', { x1: x0, y1: cy, x2: lerp(x0, x1, op0), y2: cy, stroke: GOOD, 'stroke-width': 6 });
    mono(x0, cy - 14, 'C_prev', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: op0 }); mono(x1, cy - 14, 'C_t', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: op0 });
    el('line', { x1: x0, y1: hy, x2: 150, y2: hy, stroke: INFO, 'stroke-width': 4, opacity: op0 });
    mono(x0, hy + 26, 'h_prev', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: op0 });
    mono(150, 392, 'x', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: op0 }); grow(150, 376, 150, 314, op0, ACC, { plain: true });
    return { cy, hy }; }
  const GATES = [['f', 'σ', 190, WARN], ['i', 'σ', 260, INFO], ['C̃', 'tanh', 330, ACC], ['o', 'σ', 400, GOOD]];
  function s4(t, c) { const { k, u } = c, S = c.beat.slots || [], b = c.beat;
    const { cy, hy } = cell(k, u);
    if (k === 0) { note(560, 90, '상태가 둘이다', fade(u, 1.0)); note(560, 130, 'C = 장기 기억 고속도로', fade(u, 1.4), { fill: GOOD }); note(560, 166, 'h = 지금 쓰는 작업 기억', fade(u, 1.8), { fill: INFO }); return; }
    // z = [h_prev, x]
    const zz = k === 1 ? E(u, 0.2, 1.0) : 1;
    el('line', { x1: 150, y1: hy, x2: lerp(150, 400, zz), y2: hy, stroke: MUT, 'stroke-width': 2.5 });
    mono(150, hy - 12, 'z', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: zz });
    GATES.forEach(([nm, fn, x, col], j) => { const s = k === 1 ? pop(u, 1.0 + j * 0.2) : 1, on = k >= 2 || j < 3, hot = k === 2 && j === 3;
      grow(x, hy, x, 222, s, MUT, { plain: true });
      card(x, 200, 54, 40, { rx: 7, text: fn, fs: fn === 'tanh' ? 13.5 : 17, mono: true, stroke: col, color: col, fill: hot ? GOODBG : PANEL, sw: hot ? 3 : 2, s, op: on ? 1 : 0.35 });
      mono(x, 160, nm, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s * (on ? 1 : 0.35) }); });
    if (k === 1) { note(560, 120, '문 넷이 같은 입력 z = [h_prev, x]', fade(u, 1.8)); return; }
    // C 선의 ⊗ f, ⊕ i·C̃
    const op2 = k === 2 ? fade(u, 0.8) : 1;
    [[190, '×', WARN], [295, '+', GOOD]].forEach(([x, s, col]) => { el('circle', { cx: x, cy, r: 15, fill: PANEL, stroke: col, 'stroke-width': 2.6, opacity: op2 }); mono(x, cy + 6, s, { 'font-size': 18, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op2 }); });
    el('line', { x1: 190, y1: 180, x2: 190, y2: cy + 15, stroke: WARN, 'stroke-width': 2, opacity: op2 }); el('path', { d: `M260,180 V130 H295 V${cy + 15}`, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: op2 }); el('path', { d: `M330,180 V130 H295`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: op2 });
    if (k === 2) { note(560, 100, 'f · i · o 는 σ (0~1)', fade(u, 1.0)); note(560, 136, '후보 C̃ 만 tanh (−1~1)', fade(u, 1.5), { fill: ACC }); note(560, 172, 'output 문 o 가 새로 열린다', fade(u, 2.0), { fill: GOOD });
      S.forEach((s, i) => { valve(600 + i * 90, 260, s.o, GOOD, { s: pop(u, 1.8 + i * 0.2), label: 'o=' + s.o.toFixed(2), h: 44 }); }); return; }
    // h = o ⊙ tanh(C)
    el('path', { d: `M470,${cy} V250`, fill: 'none', stroke: GOOD, 'stroke-width': 2 }); card(470, 250, 50, 28, { rx: 6, text: 'tanh', fs: 13.5, mono: true, stroke: GOOD, color: GOOD });
    el('circle', { cx: 470, cy: hy, r: 15, fill: PANEL, stroke: GOOD, 'stroke-width': 2.6 }); mono(470, hy + 6, '×', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
    el('line', { x1: 400, y1: 220, x2: 400, y2: hy, stroke: GOOD, 'stroke-width': 2 }); el('line', { x1: 400, y1: hy, x2: 455, y2: hy, stroke: GOOD, 'stroke-width': 2 }); el('line', { x1: 485, y1: hy, x2: 530, y2: hy, stroke: INFO, 'stroke-width': 4 });
    mono(530, hy + 26, 'h_t', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'end' });
    if (k === 3) { tx(580, 60, 'h = o ⊙ tanh(C)', { 'font-size': 17, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2) });
      S.forEach((s, i) => { const y = 100 + i * 70, op = fade(u, 0.5 + i * 0.4);
        tx(580, y + 12, s.name, { 'font-size': 14.5, 'font-weight': 700, opacity: op });
        mono(580, y + 40, `C ${s.c.toFixed(2)} × o ${s.o.toFixed(2)} →`, { 'font-size': 14, fill: MUT, opacity: op });
        mem(790, y + 28, 70, s.h, s.need ? INFO : OFF, { op, text: s.h.toFixed(2) }); });
      note(580, 330, '장소 칸: h 로는 0.10 만, C 엔 0.57 그대로', fade(u, 2.0), { fill: GOOD }); return; }
    // 역전파 (k ≥ 4)
    const bu = k === 4 ? E(u, 0.3, 1.8) : 1;
    if (bu > 0) { el('line', { x1: 520, y1: cy + 22, x2: lerp(520, 40, bu), y2: cy + 22, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5', 'marker-end': 'url(#ra-ahr)' }); }
    if (k === 4) { mono(560, 70, 'dC_t / dC_prev = f_t', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      note(560, 110, '원소곱 하나뿐 — W 행렬이 끼지 않는다', fade(u, 1.6)); note(560, 146, '통행료 = f', fade(u, 2.1), { fill: WARN }); return; }
    if (k === 5 || k === 6) { const rows = (b.grad && b.grad.rows) || [];
      tx(580, 60, '20스텝 거슬러 간 기울기', { 'font-size': 15, 'font-weight': 700 });
      rows.forEach((r, i) => { const y = 92 + i * 62, at = k === 5 ? 0.3 + i * 0.5 : 0, lu = k === 5 ? E(u, at, at + 0.7) : 1;
        tx(580, y, r.path, { 'font-size': 14, fill: r.ok ? GOOD : MUT, 'font-weight': 700 });
        hbar(580, y + 10, 260, r.value, 1, { col: r.ok ? GOOD : BAD, u: lu, text: r.value < 0.001 ? '≈0' : r.value.toFixed(2), h: 16 }); }); }
    if (k === 6) { // ResNet
      card(700, 330, 90, 34, { rx: 7, text: 'F(x)', fs: 15, mono: true, s: pop(u, 0.4) }); el('path', { d: 'M600,330 H655 M745,330 H800', stroke: MUT, 'stroke-width': 2.2, fill: 'none', opacity: fade(u, 0.5) });
      el('path', { d: 'M620,330 V385 H815 V345', stroke: GOOD, 'stroke-width': 3, fill: 'none', opacity: fade(u, 0.9) });
      el('circle', { cx: 815, cy: 330, r: 14, fill: PANEL, stroke: GOOD, 'stroke-width': 2.6, opacity: fade(u, 0.9) }); mono(815, 336, '+', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      mono(840, 336, 'y = F(x) + x', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.4) });
      note(580, 410, 'ResNet skip 과 같은 덧셈 통로', fade(u, 1.9), { fill: GOOD }); } }

  // ---------- 5. GRU 와 선택 ----------
  function gru(k, u) { const hy = 100, op = k === 0 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: 100, y: 60, width: 330, height: 250, rx: 16, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    el('line', { x1: 30, y1: hy, x2: lerp(30, 500, op), y2: hy, stroke: INFO, 'stroke-width': 6 });
    mono(30, hy - 14, 'h_prev', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: op }); mono(500, hy - 14, 'h_t', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: op });
    mono(140, 400, 'x', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: op }); grow(140, 384, 140, 290, op, ACC, { plain: true });
    return hy; }
  function s5(t, c) { const { k, u } = c, b = c.beat; const hy = gru(k, u);
    const zs = k === 0 ? pop(u, 0.8) : 1, rs = k === 0 ? pop(u, 1.1) : 1;
    card(190, 230, 54, 40, { rx: 7, text: 'σ', fs: 17, mono: true, stroke: WARN, color: WARN, s: zs }); mono(190, 196, 'z', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: zs });
    card(270, 230, 54, 40, { rx: 7, text: 'σ', fs: 17, mono: true, stroke: INFO, color: INFO, s: rs }); mono(270, 196, 'r', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: rs });
    if (k === 0) { note(560, 90, '문은 둘 — update z · reset r', fade(u, 1.2)); note(560, 130, 'cell state C 가 없다', fade(u, 1.7), { fill: BAD }); note(560, 166, 'h 한 줄이 기억을 모두 싣는다', fade(u, 2.1)); return; }
    // z, r 계산
    const zu = k === 1 ? E(u, 0.2, 1.0) : 1; el('line', { x1: 140, y1: 290, x2: lerp(140, 350, zu), y2: 290, stroke: MUT, 'stroke-width': 2.5 }); [190, 270].forEach((x) => grow(x, 290, x, 252, zu, MUT, { plain: true }));
    if (k === 1) { note(560, 100, '[h_prev, x] → σ 두 번', fade(u, 1.0)); note(560, 136, 'LSTM 과 같은 방식으로 뽑는다', fade(u, 1.6)); return; }
    // 후보 h̃ = tanh(W [r⊙h_prev, x])
    const hu = k === 2 ? pop(u, 0.4) : 1;
    card(350, 230, 60, 40, { rx: 7, text: 'tanh', fs: 14, mono: true, stroke: ACC, color: ACC, s: hu }); mono(350, 196, 'h̃', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: hu });
    el('path', { d: `M270,210 V160 H330 V210`, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: hu }); el('circle', { cx: 300, cy: 160, r: 11, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: hu }); mono(300, 165, '×', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: hu });
    el('line', { x1: 300, y1: hy, x2: 300, y2: 149, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: hu });
    if (k === 2) { mono(560, 100, 'h̃ = tanh(W [r⊙h_prev, x])', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) }); note(560, 140, 'reset 으로 옛 문맥을 얼마나 볼지 거른다', fade(u, 1.6)); return; }
    // 보간: (1-z) h_prev + z h̃
    const iu = k === 3 ? E(u, 0.2, 1.0) : 1;
    el('circle', { cx: 190, cy: hy, r: 15, fill: PANEL, stroke: WARN, 'stroke-width': 2.6, opacity: iu }); mono(190, hy + 6, '×', { 'font-size': 17, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: iu });
    el('circle', { cx: 350, cy: hy, r: 15, fill: PANEL, stroke: GOOD, 'stroke-width': 2.6, opacity: iu }); mono(350, hy + 6, '+', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: iu });
    el('line', { x1: 190, y1: 210, x2: 190, y2: hy + 15, stroke: WARN, 'stroke-width': 2, opacity: iu }); mono(204, 160, '1−z', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: iu });
    el('line', { x1: 350, y1: 210, x2: 350, y2: hy + 15, stroke: ACC, 'stroke-width': 2, opacity: iu });
    if (k === 3) { const zv = ((b.gates || [])[0] || {}).value ?? 0.7;
      mono(560, 70, 'h_t = (1−z)⊙h_prev + z⊙h̃', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
      // 저울
      const tilt = (zv - 0.5) * 0.6 * E(u, 1.0, 1.8), cx = 740, cy = 190;
      el('line', { x1: cx, y1: cy, x2: cx, y2: cy + 70, stroke: INK, 'stroke-width': 3 });
      el('line', { x1: cx - 120 * Math.cos(tilt), y1: cy - 120 * Math.sin(tilt), x2: cx + 120 * Math.cos(tilt), y2: cy + 120 * Math.sin(tilt), stroke: INK, 'stroke-width': 4 });
      mono(cx - 120, cy - 120 * Math.sin(tilt) - 14, `옛 것 1−z`, { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(cx + 120, cy + 120 * Math.sin(tilt) - 14, `새 것 z`, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      note(560, 320, '지우기와 새기기를 저울 하나로 — 덧셈 계열 갱신', fade(u, 2.0), { fill: GOOD }); return; }
    // 실전 (k ≥ 4): 오른쪽 텐서
    if (k === 4 || k === 5) { const a = k === 4 ? pop(u, 0.2) : 1;
      card(640, 60, 160, 40, { rx: 8, text: 'x (32, 50, 64)', fs: 14.5, mono: true, s: a });
      [['nn.LSTM(64, 128)', 610, ACC], ['nn.GRU(64, 128)', 830, INFO]].forEach(([s, x, col], j) => { const sc = k === 4 ? pop(u, 0.6 + j * 0.4) : 1;
        grow(640, 82, x, 128, k === 4 ? E(u, 0.5, 0.9) : 1, MUT); card(x, 150, 170, 40, { rx: 8, text: s, fs: 14.5, mono: true, stroke: col, color: col, s: sc }); });
      if (k === 4) { note(560, 230, '같은 인자로 세운다 — 직접 구현할 이유 없음', fade(u, 1.8)); return; }
      const r1 = pop(u, 0.4), r2 = pop(u, 1.0);
      grow(610, 172, 610, 210, E(u, 0.2, 0.5), ACC); grow(830, 172, 830, 210, E(u, 0.8, 1.1), INFO);
      card(610, 236, 200, 34, { rx: 8, text: 'h_n (1, 32, 128)', fs: 14, mono: true, stroke: ACC, color: ACC, s: r1 });
      card(610, 280, 200, 34, { rx: 8, text: 'c_n (1, 32, 128)', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: r1 });
      card(830, 236, 200, 34, { rx: 8, text: 'h_g (1, 32, 128)', fs: 14, mono: true, stroke: INFO, color: INFO, s: r2 });
      note(560, 340, 'out 은 둘 다 (32, 50, 128) — 상태 개수만 다르다', fade(u, 1.8)); return; }
    if (k === 6) { tx(560, 80, '파라미터 수 (hidden 128)', { 'font-size': 15, 'font-weight': 700 });
      tx(560, 124, 'LSTM', { 'font-size': 15, 'font-weight': 800, fill: ACC }); hbar(630, 110, 220, 99328, 99328, { col: ACC, text: '99,328', u: E(u, 0.3, 1.0), h: 20 });
      tx(560, 168, 'GRU', { 'font-size': 15, 'font-weight': 800, fill: INFO }); hbar(630, 154, 220, 74496, 99328, { col: INFO, text: '74,496', u: E(u, 0.8, 1.5), h: 20 });
      mono(560, 220, '4 × 24,832  vs  3 × 24,832', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.7) });
      note(560, 262, '문 하나 덜 → 약 25% 가볍다', fade(u, 2.1), { fill: INFO }); return; }
    // k7: 선택 기준과 남은 벽
    card(700, 70, 300, 34, { rx: 17, text: '기본: GRU 먼저', fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.2) });
    card(700, 116, 300, 34, { rx: 17, text: '아주 긴 의존성 → LSTM 도 비교', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.6) });
    tx(560, 186, '남는 벽: 순차 처리', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
    for (let i = 0; i < 5; i++) { const x = 580 + i * 72, s = pop(u, 1.1 + i * 0.15); card(x, 230, 52, 34, { rx: 7, text: 't=' + (i + 1), fs: 14, mono: true, stroke: BAD, color: BAD, s }); if (i) grow(x - 46, 230, x - 26, 230, s, BAD); }
    note(560, 290, '토큰을 하나씩 — 시간축 병렬화 불가', fade(u, 1.9), { fill: BAD });
    pill(720, 340, '다음: seq2seq + attention', GOOD, pop(u, 2.2), { fs: 14.5 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "LSTM이 RNN의 망각 문제를 푸는 방식은 무엇인가?",
      o: ["tanh를 더 강한 비선형 함수로 바꾼다", "기억 전용 통로(cell state)를 변환 밖에 두고, 출입만 0~1 게이트로 막는다", "h의 크기를 키워 더 많이 저장한다"], a: 1,
      why: "RNN은 h가 매 스텝 tanh(W·)를 통과해, 스텝당 0.9배만 잃어도 20스텝 뒤 12%만 남는다. LSTM은 cell state를 변환 없이 직진시키고 드나드는 것만 밸브로 제어한다." },
    { q: "새 주어 \"지혜는\"이 나타났을 때 forget 게이트는 무슨 일을 하나?",
      o: ["cell state 전체를 0으로 비운다", "모든 칸에 똑같이 0.5를 곱한다", "주어 칸의 f만 0.10으로 낮춰 그 칸만 골라 지운다"], a: 2,
      why: "f는 칸마다 따로 계산되는 0~1 값이다. 주어 칸은 0.90 → 0.09로 지워지고 시제·장소는 0.72·0.56으로 거의 남는다." },
    { q: "input 쪽에서 후보 C̃와 게이트 i가 맡는 역할로 맞는 것은?",
      o: ["C̃는 무엇을 쓸지(tanh, -1~1), i는 얼마나 쓸지(sigmoid, 0~1)", "C̃는 얼마나 쓸지(0~1), i는 무엇을 쓸지(-1~1)", "둘 다 옛 기억을 얼마나 지울지 정한다"], a: 0,
      why: "내용과 세기를 나눈 뒤 곱해서 지운 기억에 더한다(C_t = f⊙C_prev + i⊙C̃). 그래서 주어 칸은 0.09 + 0.86 = 0.95로 교체된다." },
    { q: "LSTM의 C 경로에서 기울기가 20스텝을 거슬러 가도 살아남는 이유는 무엇인가?",
      o: ["output 게이트가 기울기를 증폭해서", "C가 덧셈으로 갱신돼 dC_t/dC_prev = f_t뿐이고, W 곱셈 연쇄가 없어서", "h를 매 스텝 tanh에 통과시켜서"], a: 1,
      why: "C 경로의 통행료는 f 원소곱 하나다. f=0.98이면 20스텝 뒤에도 0.98^20 ≈ 0.67이 남아, RNN의 0.12보다 5배 이상 크다." },
    { q: "GRU를 LSTM과 비교한 설명으로 맞는 것은?",
      o: ["문이 하나 더 늘어 더 정밀하다", "순차 처리 병목이 사라져 병렬 학습이 된다", "문 2개(update·reset)와 h 하나로 기억하고, 파라미터가 약 25% 적다"], a: 2,
      why: "update 게이트 z가 forget과 input을 합치고 cell state가 없다. hidden 128 기준 LSTM 99,328개, GRU 74,496개이며, 순차 처리 병목은 둘 다 남는다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'RNN은 기억이 든 h가 매 스텝 tanh(W·)를 거치므로, 지키고 싶은 기억까지 뭉개진다.',
    'LSTM은 cell state를 변환 없이 직진시키고, forget·input·output 세 게이트로 출입만 막는다.',
    '갱신이 C = f⊙C_prev + i⊙C̃라는 덧셈이라, 역전파 때 곱해지는 건 f 하나뿐이다.',
    'GRU는 게이트를 2개로 줄여 파라미터가 약 25% 적고 성능은 비슷하다. 순차 처리 병목은 남는다.',
  ];
  const review = [
    { q: 'LSTM으로 긴 로그를 학습하는데 먼 과거 기억이 계속 사라진다. 먼저 확인할 값은?',
      o: ['forget 게이트 f가 0 근처로 닫혀 있는지', 'output 게이트 o가 1 근처로 열려 있는지', '후보 C̃가 음수인지'], a: 0,
      why: 'C 경로를 거슬러 갈 때 곱해지는 건 f뿐이다. f가 작은 칸은 기억과 기울기가 함께 끊기고, f가 1에 가까워야 멀리 간다.' },
    { q: 'output 게이트가 어떤 칸을 0으로 닫았다. 그 칸의 기억은 어떻게 되나?',
      o: ['cell state에서 지워진다', '다음 스텝에 후보 C̃로 다시 계산된다', 'C에는 남고, 이번 스텝 h로만 나가지 않는다'], a: 2,
      why: 'o는 h_t = o⊙tanh(C_t)에서 꺼내는 양만 정한다. 지우는 일은 forget 게이트가 맡으므로 C에는 기억이 그대로 남는다.' },
    { q: '데이터가 많지 않은 센서 이상탐지 과제에 순환 모델을 쓴다. 가장 맞는 출발점은?',
      o: ['순정 RNN, 구조가 가장 단순해서', 'GRU, 파라미터가 적어 과적합에 유리해서', 'LSTM, 문이 많을수록 늘 더 정확해서'], a: 1,
      why: 'GRU는 LSTM과 성능이 대체로 비슷하면서 파라미터가 약 25% 적다. 순정 RNN은 긴 문맥에서 기울기가 사라진다.' },
  ];

  RA.page({ title: 'LSTM 셀 해부실 — 기억 고속도로와 세 개의 문', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
