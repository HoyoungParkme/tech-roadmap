/* III-1-2 기울기 소실 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 문장 토큰·기울기 배율·실측 기울기는 페이지의 TOKENS · VANISH_FACTOR · EXPLODE_FACTOR · OBS_GRAD 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, cross, check, dot, heat, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const D = () => (typeof TOKENS === 'undefined' ? null : { T: TOKENS, VF: VANISH_FACTOR, XF: EXPLODE_FACTOR, OG: OBS_GRAD });
  const fx = (v) => { if (v === 0) return '0'; const e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e); return `${m.toFixed(1)}e${e >= 0 ? '+' : ''}${e}`; };
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 문장 칩 (두 줄: 0~11 / 12~22) ----------
  const CW = 76, PITCH = 78;
  const chipPos = (i) => (i < 12 ? { x: 24 + i * PITCH + CW / 2, y: 49 } : { x: 24 + (i - 12) * PITCH + CW / 2, y: 121 });
  function chips(d, o) { o = o || {};
    d.T.forEach((t, i) => { const p = chipPos(i), s = o.s ? o.s(i) : 1; if (s <= 0) return;
      const role = t.role, op = o.op ? o.op(i) : 1, hot = o.hot === i;
      const st = role === 'clue' ? { fill: ACC, stroke: ACC, color: PANEL } : role === 'trap' ? { fill: WARNBG, stroke: WARN, color: INK } : role === 'blank' ? { fill: PANEL, stroke: ACC, color: ACC, dash: '5 4' } : { fill: PANEL, stroke: GRID, color: INK };
      card(p.x, p.y, CW, 34, { rx: 7, text: t.w, fs: 13.5, fw: role === 'filler' ? 500 : 800, fill: hot ? INFOBG : st.fill, stroke: hot ? INFO : st.stroke, color: st.color, dash: st.dash, sw: hot ? 3 : 2, s, op }); });
    if (o.tags) { const tg = (i, s, col) => { const p = chipPos(i); tx(p.x, 22, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: o.tags }); };
      d.T.forEach((t, i) => { if (t.role === 'clue') tg(i, '단수!', ACC); if (t.role === 'trap') tg(i, '복수?', WARN); }); } }
  // cat ↔ ___ 의존성 곡선 (두 줄 사이 틈)
  function arch(d, u, o) { o = o || {}; if (u <= 0) return; const a = chipPos(1), b = chipPos(21);
    const pth = el('path', { d: `M${a.x},${a.y + 17} C${a.x},${a.y + 60} ${b.x},${b.y - 62} ${b.x},${b.y - 17}`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: o.op ?? 1, pathLength: 100 });
    if (u < 1) pth.setAttribute('stroke-dasharray', `${u * 100} 100`);
    if (u >= 1) pill(446, 85, '거리 20 — is/are 는 cat 이 정한다', ACC, 1, { fs: 13.5, fill: PANEL }); }

  // ---------- 1. 장거리 의존성 ----------
  const IDS = [2, 7, 0, 18, 4, 17, 9, 8, 16, 12, 14, 5, 3, 17, 11, 13, 17, 15, 6, 19, 0, 1, 10];   // 코드 L18–19 의 vocab id (sorted set)
  function idStrip(op, u) { const x0 = 40, w = 34, g = 4;
    tx(x0, 176, 'ids : (1, 23)', { 'font-size': 15, 'font-weight': 700, opacity: op });
    IDS.forEach((v, i) => { const s = clamp(u * 23 - i); if (s <= 0) return; const x = x0 + 120 + i * (w + g) * 0.86;
      card(x + 14, 171, 28, 28, { rx: 4, text: String(v), fs: 13.5, mono: true, fw: 700, stroke: i === 1 ? ACC : GRID, color: i === 1 ? ACC : INK, s: 0.6 + 0.4 * s, op: op * s }); }); }
  function archi(u0, op, flick) { // 임베딩 → hidden 64 → head
    const y = 290;
    card(90, y, 120, 64, { rx: 8, text: 'Embedding\n20 × 32', fs: 14, op, s: pop(u0, 0) });
    grow(152, y, 202, y, op > 0 ? clamp(u0 * 2) : 0, MUT);
    // hidden 64 = 8×8 칸
    for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) { const i = r * 8 + q, v = flick == null ? 0.25 : 0.15 + 0.7 * hsh(i + flick * 64);
      el('rect', { x: 212 + q * 15, y: y - 60 + r * 15, width: 13, height: 13, rx: 2, fill: INFO, opacity: op * v * clamp(u0 * 3 - 0.6) }); }
    tx(272, y + 78, 'hidden h (64)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: op * clamp(u0 * 3 - 0.6) });
    grow(338, y, 378, y, clamp(u0 * 3 - 1.2), MUT);
    card(428, y, 96, 64, { rx: 8, text: 'head\n64 → 2', fs: 14, op: op * clamp(u0 * 3 - 1.4) }); }
  function s1(t, c) { const { k, u } = c, d = D(); if (!d) return;
    chips(d, { s: (i) => (k === 0 ? pop(u, 0.2 + i * 0.07, 0.5) : 1), tags: k === 0 ? fade(u, 1.9) : 1,
      hot: k === 3 ? Math.min(20, Math.floor(E(u, 0.3, 2.3) * 21)) : null });
    if (k === 0) { note(40, 200, '토큰 23개 — 주어 cat 과 빈칸 사이에 관계절 19단어', fade(u, 2.0)); return; }
    idStrip(1, k === 1 ? E(u, 0.3, 1.8) : 1);
    if (k === 1) { sub(480, 230, '정수 id 에는 "cat 이 주어" 라는 정보도, 단어 사이 거리도 없다', fade(u, 2.0), { 'font-size': 15 }); return; }
    const reading = k === 3 ? Math.min(20, Math.floor(E(u, 0.3, 2.3) * 21)) : null;
    archi(k === 2 ? E(u, 0.2, 1.6) : 1, 1, reading);
    if (k === 2) { note(40, 404, '문장 전체가 64칸짜리 h 하나에 눌려 담긴다', fade(u, 2.0), { fill: WARN }); return; }
    arch(d, k === 3 ? E(u, 0.3, 1.4) : 1);
    if (k === 3) { mono(560, 240, `t = ${reading} / 20`, { 'font-size': 20, 'font-weight': 800, fill: INFO });
      note(560, 280, '한 단어씩 읽을 때마다 h 를 덮어쓴다', fade(u, 0.8));
      note(560, 316, '빈칸 직전 h 로 예측', fade(u, 2.2), { fill: ACC }); return; }
    // k ≥ 4: 예측 막대 (학습 전)
    const pi = tween(c.prev && c.prev.pred ? c.prev.pred.is : 0.5, c.beat.pred.is, k === 4 ? u : 3), pa = 1 - pi;
    if (k === 4) { grow(478, 290, 530, 290, E(u, 0.1, 0.4), MUT);
      tx(550, 236, 'softmax (학습 전 · 무작위 가중치)', { 'font-size': 15, 'font-weight': 700 });
      tx(550, 284, 'is', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); hbar(590, 270, 260, pi, 1, { col: GOOD, text: pi.toFixed(2), h: 20 });
      tx(550, 326, 'are', { 'font-size': 16, 'font-weight': 800, fill: BAD }); hbar(590, 312, 260, pa, 1, { col: BAD, text: pa.toFixed(2), h: 20 });
      cross(930, 322, 9, pop(u, 1.6)); mono(590, 372, '정답은 is — 확률 자체엔 아직 뜻이 없다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k 5, 6: 거리별 정확도 (예시 값)
    const ax = R.axes(580, 218, 330, 150, { x: [0, 22], y: [40, 100], xt: [3, 8, 14, 20], yt: [50, 75, 100], xl: '', yl: '' });
    tx(520, 205, '정확도 %', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); tx(910, 410, 'gap (단어)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    el('line', { x1: ax.X(0), y1: ax.Y(50), x2: ax.X(22), y2: ax.Y(50), stroke: BAD, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
    const A = [[3, 96], [8, 81], [14, 63], [20, 52]], lu = k === 5 ? E(u, 0.3, 1.8) : 1;
    A.forEach(([g, v], i) => { const s = clamp(lu * 4 - i); if (s <= 0) return; const bx = ax.X(g) - 16, top = ax.Y(40 + (v - 40) * s);
      el('rect', { x: bx, y: top, width: 32, height: ax.Y(40) - top, rx: 3, fill: g === 20 ? BAD : INFO, opacity: 0.85 });
      mono(ax.X(g), top - 7, v + '%', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: g === 20 ? BAD : INK }); });
    tx(ax.X(22) - 4, ax.Y(50) + 18, '동전 50%', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', opacity: fade(u, k === 5 ? 1.9 : 0) });
    tx(540, 404, '예시 값', { 'font-size': 13.5, fill: MUT, opacity: 1 });
    if (k === 6) { const s = pop(u, 0.3), s2 = pop(u, 0.8);
      card(170, 207, 150, 34, { rx: 17, text: '모델 키우기', fs: 14.5, stroke: MUT, color: MUT, s }); cross(170, 207, 14, s);
      card(340, 207, 150, 34, { rx: 17, text: '데이터 늘리기', fs: 14.5, stroke: MUT, color: MUT, s: s2 }); cross(340, 207, 14, s2);
    } }
  // k6 의 hidden 그림은 그대로 두고, 아래쪽에 "다음 단서" 를 덧붙인다
  const s1x = (t, c) => { s1(t, c); if (c.k === 6) { const u = c.u; banner(270, 404, '원인은 용량이 아니라 학습 신호의 전달', pop(u, 1.5)); } };

  // ---------- 2. 연쇄곱 ----------
  function logChart() { const x = 560, y = 40, w = 360, h = 250, lo = -9, hi = 6;
    const X = (k) => x + (k / 20) * w, Y = (lg) => y + h - ((lg - lo) / (hi - lo)) * h;
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.8 }); el('line', { x1: x, y1: y, x2: x, y2: y + h, stroke: MUT, 'stroke-width': 1.8 });
    [-8, -4, 0, 4].forEach((v) => { el('line', { x1: x - 5, y1: Y(v), x2: x, y2: Y(v), stroke: MUT }); mono(x - 9, Y(v) + 5, `1e${v}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    [0, 5, 10, 15, 20].forEach((v) => mono(X(v), y + h + 20, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    tx(x + w, y + h + 40, '거슬러 간 스텝 k', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    tx(x, y - 14, '|grad| (로그)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    el('line', { x1: x, y1: Y(0), x2: x + w, y2: Y(0), stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    return { X, Y, x, y, w, h }; }
  function curve(ch, f, u, col) { const n = Math.floor(u * 20); const pts = [];
    for (let k = 0; k <= 20; k++) { if (k > u * 20) break; pts.push([ch.X(k), ch.Y(Math.max(-9, Math.min(6, k * Math.log10(f))))]); }
    if (pts.length > 1) el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-linejoin': 'round' });
    pts.forEach((p, i) => { if (i % 5 === 0) el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: col }); }); return n; }
  function tanhPlot(x, y, w, h, u, op) { const X = (z) => x + ((z + 4) / 8) * w, Y = (v) => y + h - ((v + 1) / 2) * h;
    el('line', { x1: x, y1: Y(0), x2: x + w, y2: Y(0), stroke: GRID, 'stroke-width': 1.5, opacity: op }); el('line', { x1: X(0), y1: y, x2: X(0), y2: y + h, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    const ln = (f, col, sw) => { const p = []; for (let i = 0; i <= 60 * u; i++) { const z = -4 + (8 * i) / 60; p.push([X(z), Y(f(z))]); } if (p.length > 1) el('polyline', { points: p.map((q) => q.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': sw, opacity: op }); };
    ln(Math.tanh, INK, 2.4); ln((z) => 1 / Math.cosh(z) ** 2, ACC, 3);
    mono(x + w, Y(-0.75), 'tanh', { 'font-size': 14, 'text-anchor': 'end', fill: INK, opacity: op * clamp(u * 2 - 1) });
    mono(X(0) + 10, Y(1) + 14, "tanh′ ≤ 1", { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op * clamp(u * 2 - 1) });
    return { X, Y }; }
  function s2(t, c) { const { k, u } = c, d = D(); if (!d) return;
    // 왼쪽 위: 식
    card(250, 52, 440, 66, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(48, 48, "∂L/∂h_(t−k) ∝ ∏ W_h·diag(tanh′)", { 'font-size': 17, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.4) : 1 });
    mono(48, 74, '≈ (|W_h|·tanh′)^k', { 'font-size': 15, fill: MUT, opacity: k === 0 ? fade(u, 0.9) : 1 });
    if (k === 0) { note(40, 150, '배율 < 1  →  지수적 소멸', fade(u, 1.4), { fill: INFO, 'font-size': 17 }); note(40, 186, '배율 > 1  →  지수적 폭주', fade(u, 1.9), { fill: BAD, 'font-size': 17 });
      sub(250, 230, '중간 지대가 없다', fade(u, 2.3), { 'font-size': 15 }); return; }
    // W_h (직교 × scale)
    const wOp = 1, Wm = []; for (let r = 0; r < 6; r++) { Wm.push([]); for (let q = 0; q < 6; q++) Wm[r].push(hsh(r * 6 + q + 3) - 0.5); }
    heat(40, 128, Wm, 22, { fmt: () => '', max: 0.5 });
    tx(40, 278, 'W_h = Q × 0.9', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: wOp });
    if (k === 1) { note(40, 306, 'Q: 무작위 직교 행렬', fade(u, 0.6)); note(40, 334, '특잇값 전부 = 0.9', fade(u, 1.2), { fill: ACC }); note(40, 362, '→ |W_h| 가 정확히 scale', fade(u, 1.8)); return; }
    // tanh 곡선
    tanhPlot(220, 122, 260, 140, k === 2 ? E(u, 0.2, 1.4) : 1, 1);
    const zq = Math.acosh(1 / Math.sqrt(0.45));
    const tp = { X: (z) => 220 + ((z + 4) / 8) * 260, Y: (v) => 262 - ((v + 1) / 2) * 140 };
    el('line', { x1: 220, y1: tp.Y(0.45), x2: 480, y2: tp.Y(0.45), stroke: ACC, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', opacity: k === 2 ? fade(u, 1.5) : 1 });
    mono(480, tp.Y(0.45) - 6, '0.45', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 1.6) : 1 });
    // g 벡터 막대
    const gOp = k === 2 ? fade(u, 1.9) : 1;
    tx(40, 316, 'g', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: gOp }); hbar(80, 302, 300, 1, 1, { col: INK, text: '‖g‖ = 1', u: gOp, h: 18 });
    if (k === 2) return;
    const g1 = k === 3 ? E(u, 0.4, 1.8) : 1, cur = lerp(1, d.VF, g1);
    tx(40, 358, "W·tanh′·g", { 'font-size': 14.5, 'font-weight': 700, class: 'mono' }); hbar(150, 344, 230, cur, 1, { col: ACC, text: cur.toFixed(3), h: 18 });
    if (k === 3) { mono(150, 400, '×0.405 = 0.9 × 0.45', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); return; }
    // 오른쪽: 로그 그래프
    const ch = logChart();
    curve(ch, d.VF, k === 4 ? E(u, 0.2, 2.2) : 1, INFO);
    if (k === 4) { mono(ch.X(20), ch.Y(4.5), 'scale = 0.9', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 0.3) }); return; }
    if (k === 5) [[1, 0.6], [10, 1.2], [20, 1.8]].forEach(([kk, at]) => { const v = Math.pow(d.VF, kk);
      el('circle', { cx: ch.X(kk), cy: ch.Y(Math.log10(v)), r: 7, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, at) });
      mono(ch.X(kk) + (kk === 20 ? -10 : 10), ch.Y(Math.log10(v)) + (kk === 20 ? -14 : -12), fx(v), { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': kk === 20 ? 'end' : 'start', opacity: fade(u, at) }); });
    if (k >= 6) { curve(ch, d.XF, k === 6 ? E(u, 0.2, 2.0) : 1, BAD);
      mono(ch.X(20) - 6, ch.Y(Math.log10(Math.pow(d.XF, 20))) - 10, fx(Math.pow(d.XF, 20)), { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: k === 6 ? fade(u, 2.0) : 1 });
      mono(ch.X(20) - 6, ch.Y(Math.log10(Math.pow(d.VF, 20))) - 10, fx(Math.pow(d.VF, 20)), { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'end' });
      if (k === 6) mono(ch.X(1), ch.Y(5.2), 'scale = 4.0 → ×1.8', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4) }); }
    if (k === 7) { for (let i = 1; i <= 20; i++) { const x = ch.X(i), s = pop(u, 0.2 + i * 0.07, 0.4); if (s <= 0) continue;
        card(x, 368, 15, 22, { rx: 3, fill: ACCBG, stroke: ACC, sw: 1.5, s }); }
      tx(ch.x, 404, '20칸 전부 같은 W_h — 벗어난 만큼이 매번 같은 방향으로 쌓인다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); } }

  // ---------- 3. 시점별 기울기 관측 ----------
  const TX = (t) => 70 + t * 38.5;
  function s3(t, c) { const { k, u } = c, d = D(); if (!d) return; const lo = -8, CY = 170, CH = 150, Y = (lg) => CY + CH - ((lg - lo) / (0 - lo)) * CH;
    // 임베딩 출력 x : (1, T, 32) — 시점마다 한 열
    tx(20, 62, 'x', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
    for (let t2 = 0; t2 < 23; t2++) for (let r = 0; r < 4; r++) el('rect', { x: TX(t2) - 15, y: 70 + r * 12, width: 30, height: 10, rx: 2, fill: d.T[t2].role === 'clue' ? ACC : INFO, opacity: 0.15 + 0.5 * hsh(t2 * 4 + r) });
    tx(20, 135, '(1, 23, 32)', { 'font-size': 13.5, fill: MUT, class: 'mono' });
    // hook
    const hk = k === 0 ? fade(u, 1.0) : 1;
    if (k === 0) { note(84, 30, 'save_grad(): 지나가는 기울기를 버퍼에 저장', fade(u, 0.3)); }
    if (k >= 1) { const hu = k === 1 ? E(u, 0.3, 1.3) : 1; el('path', { d: `M${lerp(40, 54, hu)},${lerp(12, 46, hu)} v14 a8,8 0 1 0 16,0`, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-linecap': 'round' });
      mono(84, 30, 'x.register_hook(save_grad)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 1.0) : 1 }); }
    if (k === 0) el('path', { d: 'M40,12 v14 a8,8 0 1 0 16,0', fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: hk });
    if (k === 0 || k === 1) { sub(480, 220, k === 0 ? '기울기는 눈에 안 보인다 — hook 으로 가로챈다' : 'backward 때 23개 시점의 기울기가 한꺼번에 들어온다', k === 0 ? fade(u, 1.6) : fade(u, 1.8), { 'font-size': 15.5 }); return; }
    // 손실 (k ≥ 2)
    const lu = k === 2 ? 1 : 1, ly = 30;
    const parts = [['out[0, 20]', 560], ['head', 680], ['CE(정답 is)', 790]];
    parts.forEach(([s, x], i) => { const sc = k === 2 ? pop(u, 0.2 + i * 0.4) : 1; card(x, ly, tw(s, 14) + 20, 30, { rx: 6, text: s, fs: 14, mono: true, s: sc, stroke: i === 2 ? BAD : INK, color: i === 2 ? BAD : INK });
      if (i) grow(parts[i - 1][1] + tw(parts[i - 1][0], 14) / 2 + 12, ly, x - tw(s, 14) / 2 - 12, ly, k === 2 ? E(u, 0.4 + i * 0.4, 0.7 + i * 0.4) : 1, MUT); });
    mono(870, ly + 5, '= 0.98', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: k === 2 ? fade(u, 1.8) : 1 });
    if (k === 2) { el('path', { d: `M${TX(20)},68 Q${TX(20)},40 ${560 - 44},${ly}`, fill: 'none', stroke: MUT, 'stroke-width': 1.8, 'stroke-dasharray': '4 4', opacity: fade(u, 0.3) });
      sub(480, 230, '"틀렸다" 는 신호가 여기서 만들어진다', fade(u, 2.0), { 'font-size': 15.5 }); return; }
    // 차트 축 (k ≥ 3)
    el('line', { x1: 52, y1: CY + CH, x2: 944, y2: CY + CH, stroke: MUT, 'stroke-width': 1.8 });
    [-8, -4, 0].forEach((v) => { mono(48, Y(v) + 5, `1e${v}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); el('line', { x1: 52, y1: Y(v), x2: 944, y2: Y(v), stroke: GRID, 'stroke-dasharray': '3 4' }); });
    // 역전파 점: t=20 → t=0
    const back = k === 3 ? E(u, 0.2, 2.4) : 1, pos = 20 - back * 20;
    if (k === 3) { const cx = TX(pos), lg = Math.log10(d.OG[Math.max(0, Math.round(pos))] || 1e-8), r = clamp(3 + (lg + 8) * 1.4, 3, 14);
      el('circle', { cx, cy: 104, r, fill: BAD, opacity: 0.9 }); grow(TX(20) + 20, 150, TX(pos) + 20, 150, back, BAD, { plain: true }); mono(TX(20), 160, 'backward', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.3) }); }
    // 토큰 이름 (기울어진 글자) — 받은 신호가 작을수록 흐림
    for (let t2 = 0; t2 < 23; t2++) { const reached = k > 3 || t2 >= pos, g = d.OG[t2], lg = g > 0 ? Math.log10(g) : -9;
      const op = reached && k >= 3 ? clamp(0.3 + (lg + 8) / 8 * 0.7, 0.3, 1) : 1;
      tx(TX(t2) + 5, 334, d.T[t2].w, { 'font-size': 13.5, 'font-weight': d.T[t2].role === 'clue' ? 800 : 600, fill: d.T[t2].role === 'clue' ? ACC : d.T[t2].role === 'blank' ? MUT : INK, 'text-anchor': 'end', transform: `rotate(-90 ${TX(t2) + 5} 334)`, opacity: op }); }
    if (k === 3) return;
    // 막대 (k ≥ 4)
    for (let t2 = 0; t2 < 23; t2++) { const g = d.OG[t2]; if (!(g > 0)) { mono(TX(t2), CY + CH - 6, '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); continue; }
      const s = k === 4 ? E(u, 0.2 + (20 - t2) * 0.08, 0.7 + (20 - t2) * 0.08) : 1, top = Y(lo + (Math.log10(g) - lo) * s);
      el('rect', { x: TX(t2) - 13, y: top, width: 26, height: CY + CH - top, rx: 3, fill: t2 === 1 ? ACC : INFO, opacity: 0.85 }); }
    if (k === 4) { mono(944, CY - 8, '세로: |grad| 로그 눈금', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) }); return; }
    if (k === 5) [[20, 0.3], [19, 0.6], [14, 0.9], [7, 1.2], [1, 1.5]].forEach(([t2, at], i) => { const g = d.OG[t2], y = Y(Math.log10(g)) - 10 - (i % 2) * 20;
      mono(TX(t2), y, fx(g), { 'font-size': 14, 'font-weight': 800, fill: t2 === 1 ? ACC : INK, 'text-anchor': t2 >= 19 ? 'end' : 'middle', opacity: fade(u, at) }); });
    if (k === 6) { const ratio = d.OG[1] / d.OG[20];
      mono(TX(1) + 18, Y(Math.log10(d.OG[1])) - 12, `cat ${fx(d.OG[1])}`, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      note(70, 192, `cat 이 받는 신호 = 빈칸 직전의 ${fx(ratio)} 배 → 업데이트 ≈ 0`, fade(u, 1.0), { fill: BAD });
      pill(170, 226, '→ Step 1 의 52%', ACC, pop(u, 2.0), { fs: 14 }); } }

  // ---------- 4. 폭주와 클리핑 ----------
  function lossChart(op) { const x = 70, y = 50, w = 360, h = 230, Y = (lg) => y + h - (lg / 4.5) * h, X = (s) => x + (s / 6) * w;
    el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.8, opacity: op }); el('line', { x1: x, y1: y, x2: x, y2: y + h, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [0, 2, 4].forEach((v) => mono(x - 8, Y(v) + 5, `1e${v}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }));
    [0, 3, 5].forEach((v) => mono(X(v), y + h + 20, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }));
    tx(x, y - 14, 'loss (로그) · 예시 값', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: op }); tx(x + w, y + h + 40, 'step', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: op });
    return { X, Y }; }
  function s4(t, c) { const { k, u } = c, d = D(); if (!d) return;
    if (k === 0) { const g = E(u, 0.4, 1.6), Wm = []; for (let r = 0; r < 8; r++) { Wm.push([]); for (let q = 0; q < 8; q++) Wm[r].push((hsh(r * 8 + q + 40) - 0.5) * lerp(1, 3, g)); }
      heat(80, 70, Wm, 34, { fmt: () => '', max: 1.6 });
      mono(80, 52, 'weight_hh_l0.mul_(3.0)', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
      tx(560, 140, '스펙트럼 노름 ‖W_h‖₂', { 'font-size': 16, 'font-weight': 700 });
      mono(560, 190, lerp(1.06, 3.3, g).toFixed(2), { 'font-size': 34, 'font-weight': 800, fill: g > 0.5 ? BAD : INK });
      sub(700, 240, '기본 초기화 1.06 → 약 3.3', fade(u, 1.8), { 'font-size': 15 });
      note(560, 300, '스텝당 배율 |W_h|·tanh′ 이 1 을 넘기 쉽다', fade(u, 2.1), { fill: BAD }); return; }
    const lc = lossChart(1);
    // 폭주 곡선 (예시 값: step 0 2.31, step 3 8.7e3, step 5 nan)
    const P1 = [[0, Math.log10(2.31)], [3, Math.log10(8.7e3)]], lu = k === 1 ? E(u, 0.4, 2.2) : 1;
    const ex = lerp(P1[0][0], P1[1][0], lu), ey = lerp(P1[0][1], P1[1][1], lu);
    el('line', { x1: lc.X(0), y1: lc.Y(P1[0][1]), x2: lc.X(ex), y2: lc.Y(ey), stroke: BAD, 'stroke-width': 3 });
    el('circle', { cx: lc.X(0), cy: lc.Y(P1[0][1]), r: 5, fill: BAD }); mono(lc.X(0) + 10, lc.Y(P1[0][1]) + 20, '2.31', { 'font-size': 14, 'font-weight': 700, fill: BAD });
    if (lu >= 1) { el('circle', { cx: lc.X(3), cy: lc.Y(P1[1][1]), r: 5, fill: BAD }); mono(lc.X(3) - 10, lc.Y(P1[1][1]) - 10, '8.7e+3', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' }); }
    if (k === 1) { mono(470, 110, 'SGD(lr=0.1)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); note(470, 146, '클리핑 없음', fade(u, 0.5), { fill: BAD }); return; }
    const nu = k === 2 ? E(u, 0.3, 1.0) : 1;
    el('line', { x1: lc.X(3), y1: lc.Y(P1[1][1]), x2: lc.X(lerp(3, 5, nu)), y2: lc.Y(lerp(P1[1][1], 4.6, nu)), stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '4 4' });
    if (nu >= 1) { cross(lc.X(5), lc.Y(4.6) + 8, 9, k === 2 ? pop(u, 1.0) : 1); mono(lc.X(5) + 16, lc.Y(4.6) + 14, 'nan', { 'font-size': 16, 'font-weight': 800, fill: BAD }); }
    if (k === 2) { note(470, 150, '파라미터가 한 번에 궤도를 벗어난다', fade(u, 1.5), { fill: BAD }); sub(640, 190, '수직 상승 후 침묵 = 폭주의 지문', fade(u, 2.1), { 'font-size': 15 }); return; }
    // 오른쪽: 순서 (k ≥ 3)
    const seq = [['backward()', 560], ['clip', 700], ['opt.step()', 840]];
    seq.forEach(([s, x], i) => { const sc = k === 3 ? pop(u, 0.2 + i * 0.5) : 1, hot = i === 1;
      card(x, 380, tw(s, 15) + 26, 36, { rx: 8, text: s, fs: 15, mono: true, stroke: hot ? GOOD : INK, color: hot ? GOOD : INK, fill: hot ? GOODBG : PANEL, sw: hot ? 2.6 : 2, s: sc });
      if (i) grow(seq[i - 1][1] + 52, 380, x - 50, 380, k === 3 ? E(u, 0.4 + i * 0.5, 0.7 + i * 0.5) : 1, MUT); });
    if (k === 3) { note(470, 330, '자르는 자리: backward 다음, step 앞', fade(u, 1.8), { fill: GOOD }); return; }
    // 기울기 벡터와 상한 원 (k ≥ 4)
    const ox = 640, oy = 200, rr = 70;
    el('circle', { cx: ox, cy: oy, r: rr, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
    mono(ox, oy + rr + 22, 'max_norm = 1.0', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' });
    const ang = -0.45, dx = Math.cos(ang), dy = Math.sin(ang);
    if (k >= 4 && k !== 6 && k !== 7 || k === 7) { const sh = k === 4 ? E(u, 0.9, 1.9) : 1, L = lerp(300, rr, sh);
      el('line', { x1: ox, y1: oy, x2: ox + dx * L, y2: oy + dy * L, stroke: sh < 1 ? BAD : GOOD, 'stroke-width': 4, 'marker-end': sh < 1 ? 'url(#ra-ahr)' : 'url(#ra-ah)' });
      if (k === 4) { mono(ox + dx * 300 - 10, oy + dy * 300 + 30, '‖g‖ = 1.3e+5 (축척 생략)', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: 1 - fade(u, 1.0) });
        mono(ox + dx * rr + 14, oy + dy * rr - 8, '→ 1.0 · 방향 그대로', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); } }
    if (k === 5) { note(470, 60, '클리핑 후 loss (예시)', fade(u, 0.2), { fill: GOOD });
      [2.31, 1.87, 1.52].forEach((v, i) => { tx(740, 68 + i * 30, i === 0 ? '처음' : i === 1 ? '다음' : '그다음', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) });
        hbar(790, 54 + i * 30, 100, v, 2.5, { col: GOOD, u: E(u, 0.4 + i * 0.4, 0.9 + i * 0.4), h: 18 }); });
      note(470, 330, 'total = 클리핑 "전" 노름 → 폭주 감시 로그', fade(u, 1.8)); }
    if (k >= 6) { // 소실 기울기: 원 안의 점
      el('circle', { cx: ox, cy: oy, r: 4, fill: INFO });
      mono(ox + 12, oy + 30, '1.4e-08', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k === 6 ? fade(u, 0.3) : 1 });
      if (k === 6) { const lg = (v) => clamp((Math.log10(v) + 9) / 15);
        tx(470, 330, '전', { 'font-size': 14, fill: MUT }); hbar(500, 318, 300, 1, 1, { col: INFO, u: lg(1.4e-8) * E(u, 0.6, 1.2), text: '1.4e-08', h: 16 });
        tx(470, 358, '후', { 'font-size': 14, fill: MUT }); hbar(500, 346, 300, 1, 1, { col: INFO, u: lg(1.4e-8) * E(u, 1.3, 1.9), text: '1.4e-08', h: 16 });
        note(470, 60, '상한 아래 → 손대지 않는다', fade(u, 2.0), { fill: BAD }); } }
    if (k === 7) { card(830, 90, 210, 64, { rx: 10, text: '폭주 1.3e+5 → 1.0', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3) }); check(950, 90, 10, pop(u, 0.5));
      card(830, 290, 210, 64, { rx: 10, text: '소실 1.4e-8 → 1.4e-8', fs: 15, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.9) }); cross(948, 290, 10, pop(u, 1.1));
      banner(250, 404, '소실은 구조를 바꿔야 한다', pop(u, 1.8)); } }

  // ---------- 5. 덧셈 통로 ----------
  const MUL = [1, 0.405, 0.164, 0.066, 0.027];
  function lanes(k, u) { const x0 = 60, pitch = 92;
    tx(20, 34, '곱셈 연쇄  ∂h_t/∂h_(t−1) = W_h·tanh′', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 0 ? fade(u, 0.2) : 1 });
    tx(20, 182, '덧셈 통로  ∂c_t/∂c_(t−1) = 1', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: k === 0 ? fade(u, 1.1) : 1 });
    MUL.forEach((v, i) => { const s = k === 0 ? pop(u, 0.3 + i * 0.15) : 1, s2 = k === 0 ? pop(u, 1.2 + i * 0.15) : 1, x = x0 + i * pitch;
      card(x, 80, 64, 50, { rx: 7, text: 'h\n' + v.toFixed(3), fs: 13.5, mono: true, stroke: BAD, color: BAD, op: clamp(0.3 + v), s });
      card(x, 228, 64, 50, { rx: 7, text: 'c\n1.000', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, s: s2 });
      if (i) { mono(x - pitch / 2, 86, '×', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: s });
        mono(x - pitch / 2, 234, '+', { 'font-size': 20, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: s2 }); } }); }
  function s5(t, c) { const { k, u } = c, d = D(); if (!d) return;
    lanes(k, u);
    if (k === 0) return;
    // 오른쪽 위: 실험 준비
    if (k <= 3) { const op = k === 1 ? fade(u, 0.2) : 1, Wm = []; for (let r = 0; r < 6; r++) { Wm.push([]); for (let q = 0; q < 6; q++) Wm[r].push(hsh(r * 6 + q + 90) - 0.5); }
      heat(560, 60, Wm, 22, { fmt: () => '', max: 0.5 });
      mono(710, 80, 'W = randn × 0.05', { 'font-size': 15, 'font-weight': 700, opacity: op });
      mono(710, 110, 'g = ones(64)/8', { 'font-size': 15, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.8) : 1 });
      mono(710, 140, '‖g‖ = 1, 20스텝', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 1.4) : 1 }); }
    if (k === 2 || k === 3) { const a = k === 2 ? fade(u, 0.3) : 1, b = k === 2 ? fade(u, 1.1) : 1;
      mono(520, 128 + 70, 'g = (W @ g) × 0.45', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: a });
      mono(520, 228 + 30, 'g = g × 1.0 + (W @ g) × 0.1', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: b }); }
    if (k === 1) return;
    if (k === 2) { sub(700, 330, '차이는 한 줄 — g 를 넘기느냐, 갈아치우느냐', fade(u, 2.0), { 'font-size': 15 }); return; }
    // 결과 막대 (로그) — 왼쪽 아래
    const lg = (v) => clamp((Math.log10(v) + 16) / 17);
    if (k < 6) { tx(20, 300, '20스텝 뒤 ‖g‖ (로그)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    tx(20, 334, '곱셈', { 'font-size': 15, 'font-weight': 700, fill: BAD }); hbar(70, 320, 300, 1, 1, { col: BAD, u: lg(4.7e-16) * (k === 3 ? E(u, 0.3, 1.2) : 1), text: '4.7e-16', h: 18 });
    tx(20, 370, '덧셈', { 'font-size': 15, 'font-weight': 700, fill: GOOD }); hbar(70, 356, 300, 1, 1, { col: GOOD, u: lg(1.41) * (k === 3 ? E(u, 0.8, 1.7) : 1), text: '1.41', h: 18 }); }
    if (k === 3) { note(20, 406, '열여섯 자리 차이', fade(u, 2.0), { fill: ACC }); return; }
    // LSTM cell state (오른쪽 위, k ≥ 4)
    const cu = k === 4 ? E(u, 0.2, 1.4) : 1, cy = 100;
    el('line', { x1: 520, y1: cy, x2: lerp(520, 930, cu), y2: cy, stroke: GOOD, 'stroke-width': 5 });
    mono(510, cy + 5, 'c_(t−1)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: 0 });
    const gate = (x, sym, col, at) => { const s = k === 4 ? pop(u, at) : 1; el('circle', { cx: x, cy, r: 18 * s, fill: PANEL, stroke: col, 'stroke-width': 2.6 }); mono(x, cy + 7, sym, { 'font-size': 20, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); };
    gate(640, '×', WARN, 0.8); gate(790, '+', GOOD, 1.1);
    mono(640, cy + 46, 'f_t', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.0) : 1 });
    mono(790, cy + 46, 'i_t·g_t', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.3) : 1 });
    mono(540, 40, 'c_t = f_t·c_(t−1) + i_t·g_t', { 'font-size': 17, 'font-weight': 800, opacity: k === 4 ? fade(u, 1.7) : 1 });
    if (k === 4) { sub(725, 190, '덧셈 통로에 밸브(게이트)를 단 것 = LSTM', fade(u, 2.2), { 'font-size': 15 }); return; }
    // 학습 곡선 (예시, k ≥ 5)
    const ax = R.axes(580, 200, 320, 150, { x: [0, 55], y: [40, 100], xt: [5, 20, 50], yt: [50, 75, 100], grid: true });
    tx(520, 192, '정확도 % · 예시 값', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); tx(900, 404, 'epoch', { 'font-size': 14, fill: MUT, 'font-weight': 600, 'text-anchor': 'end' });
    const lu = k === 5 ? E(u, 0.3, 1.9) : 1;
    R.line(ax, [[5, 51], [20, 52], [50, 52]], lu, BAD); R.line(ax, [[5, 58], [20, 84], [50, 97]], lu, GOOD, { sw: 3 });
    if (lu >= 1) { mono(ax.X(50) + 6, ax.Y(52) + 18, 'RNN 52%', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); mono(ax.X(50) - 6, ax.Y(97) - 8, 'LSTM 97%', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' }); }
    if (k === 5) return;
    // 연대기 (왼쪽 아래를 덮는다, k ≥ 6) — 결과 막대 위에 판을 깐다
    const TL = [['1997', 'LSTM'], ['2011~', 'ReLU'], ['2015', 'ResNet'], ['2017', 'Transformer']], tu = k === 6 ? E(u, 0.2, 1.6) : 1;
    grow(30, 350, lerp(30, 480, tu), 350, 1, MUT, { plain: true });
    TL.forEach(([y, n], i) => { const x = 70 + i * 120, s = k === 6 ? pop(u, 0.4 + i * 0.35) : 1;
      el('circle', { cx: x, cy: 350, r: 7 * s, fill: i === 0 ? ACC : INFO });
      mono(x, 330, y, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: s });
      tx(x, 380, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 0 ? ACC : INK, opacity: s }); });
    tx(20, 306, '전부 같은 통찰: 곱하지 말고 더하라', { 'font-size': 15, 'font-weight': 700, opacity: k === 6 ? fade(u, 1.9) : 1 });
    if (k === 7) banner(260, 408, '다음: III-2 LSTM — 게이트를 연다', pop(u, 0.4)); }

  RA.page({ title: '기울기 관측소 — ∂L/∂h ∝ ∏(W_h·tanh′)', scenes: [s1x, s2, s3, s4, s5] });
})();
