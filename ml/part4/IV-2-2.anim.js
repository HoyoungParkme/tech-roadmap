/* IV-2-2 정책 경사·PPO — RLHF까지 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, spans, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, cross, check, lock, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  const TW = (a, b, u, s = 0.1, d = 1.2) => (a == null ? b : lerp(a, b, E(u, s, s + d)));
  const f2 = (v) => v.toFixed(2);
  const sgn = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v);
  const path = (pts, a) => el('path', Object.assign({ d: 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L'), fill: 'none' }, a));

  // 작은 신경망: layers [{n, x, dots?}] 노드 세로 간격 sp, 진행 u(0→1) 로 층이 차례로 나타남
  function mlp(layers, cy, sp, u, o) { o = o || {}; const pos = layers.map((L) => Array.from({ length: L.n }, (_, i) => [L.x, cy + (i - (L.n - 1) / 2) * sp]));
    const nl = layers.length;
    for (let l = 0; l < nl - 1; l++) { const p = clamp(u * nl - l - 0.5); if (p <= 0) continue;
      pos[l].forEach((a) => pos[l + 1].forEach((b) => el('line', { x1: a[0], y1: a[1], x2: lerp(a[0], b[0], p), y2: lerp(a[1], b[1], p), stroke: OFF, 'stroke-width': 1.2, opacity: 0.7 }))); }
    layers.forEach((L, l) => { const s = clamp(u * nl - l); if (s <= 0) return;
      pos[l].forEach(([x, y], i) => { const mid = L.dots && i === Math.floor(L.n / 2);
        if (mid) tx(x, y + 6, '⋮', { 'text-anchor': 'middle', 'font-size': 18, fill: MUT, opacity: s });
        else el('circle', { cx: x, cy: y, r: (o.r || 9) * (0.5 + 0.5 * s), fill: L.fill || PANEL, stroke: L.col || INK, 'stroke-width': 2, opacity: s }); }); });
    return pos; }

  // =========================================================
  // 1. Q 가 막히는 두 벽 → 정책망 πθ
  // =========================================================
  const BAR1 = { x: 474, bx: 612, w: 250, y0: 304, dy: 36 };
  function probRows(acts, prevActs, u, o) { o = o || {};
    acts.forEach((a, i) => { const y = BAR1.y0 + i * BAR1.dy, pv = prevActs && prevActs[i] ? prevActs[i].prob : null, p = TW(pv, a.prob, u, 0.2, 1.2);
      const hot = o.pick === i;
      tx(BAR1.x, y + 16, a.name, { 'font-size': 15, 'font-weight': 600, fill: hot ? ACC : INK });
      hbar(BAR1.bx, y, BAR1.w, p, 1, { h: 22, col: hot ? ACC : INFO, text: o.unknown ? '?' : f2(p) });
      if (hot) el('rect', { x: BAR1.bx - 4, y: y - 4, width: BAR1.w + 8, height: 30, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5 }); }); }
  function bell(x0, x1, base, h, cx, sd, p, op) { const pts = []; for (let i = 0; i <= 80 * p; i++) { const x = lerp(x0, x1, i / 80); pts.push([x, base - h * Math.exp(-((x - cx) ** 2) / (2 * sd * sd))]); }
    if (pts.length > 1) { el('path', { d: 'M' + x0 + ',' + base + ' L' + pts.map((q) => q.join(',')).join(' L') + ' L' + pts[pts.length - 1][0] + ',' + base + ' Z', fill: ACCBG, opacity: 0.8 * op });
      path(pts, { stroke: ACC, 'stroke-width': 2.6, opacity: op }); } }
  function s1(t, c) { const { k, u } = c, b = c.beat, pb = b.policyBars, prev = c.prev ? c.prev.policyBars : null;
    // 벽 ① 연속 행동
    zone(20, 20, 420, 180, '벽 ① 연속 행동 — 로봇 관절 각도');
    const n = k === 0 ? Math.round(lerp(3, 90, E(u, 0.3, 1.8))) : 90;
    el('line', { x1: 60, y1: 150, x2: 400, y2: 150, stroke: INK, 'stroke-width': 2 });
    for (let i = 0; i < n; i++) { const x = 60 + 340 * (i / (n - 1)); el('line', { x1: x, y1: 142, x2: x, y2: 158, stroke: k >= 4 ? OFF : INK, 'stroke-width': 1, opacity: 0.7 }); }
    mono(60, 178, '-180.0°', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(230, 178, '0°', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(400, 178, '+180.0°', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    const fixed = k >= 4;
    mono(40, 70, 'argmax Q(s, a) ?', { 'font-size': 15, 'font-weight': 700, fill: fixed ? OFF : INK, opacity: k === 0 ? fade(u, 0.9) : 1, 'text-decoration': fixed ? 'line-through' : null });
    if (!fixed) pill(372, 66, '후보 ∞ · Q 불가', BAD, k === 0 ? pop(u, 1.8) : 1, { fs: 13.5 });
    if (fixed) { bell(60, 400, 150, 66, 230, 48, k === 4 ? E(u, 0.3, 1.6) : 1, 1);
      mono(330, 112, 'Normal(μ, σ)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 4 ? fade(u, 1.4) : 1 });
      pill(372, 66, '분포로 해결', GOOD, k === 4 ? pop(u, 1.9) : 1, { fs: 13.5 }); }

    // 벽 ② 확률적 정책
    if (k >= 1) { const op = k === 1 ? fade(u, 0.9) : 1;
      zone(20, 215, 420, 190, '벽 ② 확률적 정책 — 가위바위보', { op });
      const names = ['바위', '보', '가위'], base = 360, sc = 90;
      tx(120, 262, '최적: 1/3씩 섞기', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: op });
      names.forEach((nm, i) => { const x = 70 + i * 50, h = sc / 3 * (k === 1 ? E(u, 1.1, 1.7) : 1);
        el('rect', { x: x - 17, y: base - h, width: 34, height: h, rx: 3, fill: GOOD, opacity: op * 0.85 });
        mono(x, base - h - 8, '1/3', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, opacity: op });
        sub(x, 382, nm, op); });
      tx(330, 247, 'argmax → 항상 바위', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 1 ? fade(u, 1.6) : 1 });
      names.forEach((nm, i) => { const x = 270 + i * 45, h = i === 0 ? sc * (k === 1 ? E(u, 1.7, 2.2) : 1) : 0;
        if (h > 0) { el('rect', { x: x - 16, y: base - h, width: 32, height: h, rx: 3, fill: BAD, opacity: 0.75 }); mono(x, base - h - 8, '1', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD }); }
        else el('line', { x1: x - 16, y1: base, x2: x + 16, y2: base, stroke: BAD, 'stroke-width': 2, opacity: op });
        sub(x, 382, nm, op); });
      if (k >= 3) { check(205, 300, 12, k === 3 ? pop(u, 2.0) : 1); }
      else cross(330, 315, 14, k === 1 ? pop(u, 2.3) : 1); }

    // 오른쪽: k0 두 갈래, 그 뒤 정책망
    if (k === 0) {
      lbl(475, 62, '가치 기반', fade(u, 0.2), { 'text-anchor': 'start', fill: MUT });
      [[510, 'S'], [640, 'Q(s, a) 전부'], [790, 'argmax'], [905, '하나']].forEach(([x, s], i) => {
        const op = fade(u, 0.3 + i * 0.25); if (i === 0) { el('circle', { cx: x, cy: 110, r: 18, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op }); mono(x, 116, 's', { 'text-anchor': 'middle', 'font-size': 16, opacity: op }); }
        else card(x, 110, i === 1 ? 140 : 96, 40, { text: s, fs: 15, mono: true, op, stroke: i === 2 ? BAD : INK, color: i === 2 ? BAD : INK });
        if (i) grow(i === 1 ? 530 : i === 2 ? 712 : 840, 110, i === 1 ? 568 : i === 2 ? 740 : 855, 110, E(u, 0.3 + i * 0.25, 0.5 + i * 0.25)); });
      sub(690, 158, '행동이 무한하면 나열부터 불가', fade(u, 1.1), { fill: BAD });
      lbl(475, 212, '정책 기반', fade(u, 1.3), { 'text-anchor': 'start', fill: ACC });
      [[510, 's'], [640, 'πθ(a|s)'], [790, ''], [905, '샘플링']].forEach(([x, s], i) => {
        const op = fade(u, 1.4 + i * 0.25); if (i === 0) { el('circle', { cx: x, cy: 260, r: 18, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: op }); mono(x, 266, 's', { 'text-anchor': 'middle', 'font-size': 16, opacity: op }); }
        else if (i === 2) [0.34, 0.33, 0.33].forEach((p, j) => el('rect', { x: 760 + j * 22, y: 280 - p * 100 * op, width: 16, height: p * 100 * op, rx: 2, fill: ACC, opacity: op }));
        else card(x, 260, i === 1 ? 120 : 96, 40, { text: s, fs: 15, mono: i === 1, op, stroke: ACC, color: ACC, fill: i === 1 ? ACCBG : PANEL });
        if (i) grow(i === 1 ? 530 : i === 2 ? 702 : 830, 260, i === 1 ? 578 : i === 2 ? 752 : 855, 260, E(u, 1.4 + i * 0.25, 1.6 + i * 0.25), ACC); });
      sub(700, 316, '분포를 바로 출력 → 고르는 방법까지 정책이 갖는다', fade(u, 2.2), { fill: ACC });
      return; }
    zone(460, 20, 490, 240, 'class DiscretePolicy(nn.Module)', { stroke: ACC, fill: PANEL, op: k === 1 ? fade(u, 0.2) : 1, color: ACC });
    if (k === 1) tx(705, 145, 'softmax 로 행동 분포를 내는 것이 유일한 역할', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) });
    if (k >= 2) {
      const pos = mlp([{ n: 4, x: 530 }, { n: 7, x: 660, dots: true }, { n: 3, x: 790, col: ACC, fill: ACCBG }], 140, 24, k === 2 ? E(u, 0.2, 1.8) : 1);
      const lop = k === 2 ? fade(u, 1.6) : 1;
      sub(530, 240, 's (4차원)', lop); sub(660, 240, '은닉 64 · ReLU', lop); sub(790, 240, '로짓 3개', lop, { fill: ACC, 'font-weight': 700 });
      if (k >= 3) { const op = k === 3 ? pop(u, 0.3) : 1; grow(802, 140, 828, 140, k === 3 ? E(u, 0.2, 0.5) : 1, ACC);
        pill(885, 140, 'Categorical', ACC, op, { mono: true, fs: 13.5 }); }
      if (k >= 4) { pill(885, 192, 'Normal(μ, σ)', ACC, k === 4 ? pop(u, 0.4) : 1, { mono: true, fs: 13.5, fill: ACCBG }); sub(885, 222, '연속이면', k === 4 ? fade(u, 0.7) : 1); }
      if (k === 5) { mono(530, 66, 'torch.randn(1, 4)', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        dot([[470, 140], [530, 140], [660, 140], [790, 140], [826, 140]], seg(u, 0.4, 1.6), INFO, 7);
        fly(885, 155, 760, 290, seg(u, 1.6, 2.3), 'dist = πθ(·|s)', { mono: true, fill: INFO }); }
      if (k === 6) { fly(700, 272, 740, BAR1.y0 + 2 * BAR1.dy + 11, seg(u, 0.2, 0.9), 'sample()', { mono: true });
        fly(740, BAR1.y0 + 2 * BAR1.dy + 11, 650, 283, seg(u, 1.4, 2.0), 'log_prob', { mono: true, fill: WARN, stay: true });
        tx(705, 288, '→ 다음 단계 학습 재료', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) }); }
      // 막대
      tx(BAR1.x, 287, 'πθ(a|s) 출력', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.8) : 1 });
      if (k === 2) { probRows(pb.actions, null, u, { unknown: true }); sub(705, 296, '로짓은 아직 확률이 아니다', fade(u, 2.0), { fill: WARN, 'text-anchor': 'start' }); }
      else probRows(pb.actions, prev && prev.actions.length ? prev.actions : null, u, { pick: k === 6 && u > 0.9 ? 2 : null }); }
  }

  // =========================================================
  // 2. REINFORCE — 보상만큼 확률을 밀어 올린다
  // =========================================================
  const ACTS = ['→', '→', '·', '→', '←', '→', '→', '·'], TX0 = 120, TDX = 58;
  const ROWS = { t: 46, a: 84, lp: 122, r: 160, g: 198 };
  function tape(o) { const T = ACTS.length;
    [['시점 t', 't'], ['행동 a', 'a'], ['log π', 'lp'], ['보상 r', 'r'], ['G', 'g']].forEach(([s, key]) => tx(28, ROWS[key] + 5, s, { 'font-size': 14, 'font-weight': 700, fill: o.rowHi === key ? ACC : MUT }));
    for (let i = 0; i < T; i++) { const x = TX0 + i * TDX;
      mono(x, ROWS.t + 5, String(i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      const pa = clamp(o.play * T - i);
      el('rect', { x: x - 24, y: ROWS.a - 15, width: 48, height: 30, rx: 5, fill: pa > 0 ? ACCBG : PANEL, stroke: GRID });
      if (pa > 0) tx(x, ROWS.a + 6, ACTS[i], { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: pa });
      el('rect', { x: x - 24, y: ROWS.lp - 15, width: 48, height: 30, rx: 5, fill: pa > 0 ? 'var(--warnbg)' : PANEL, stroke: o.rowHi === 'lp' ? WARN : GRID, 'stroke-width': o.rowHi === 'lp' ? 2 : 1 });
      if (pa > 0) el('rect', { x: x - 14, y: ROWS.lp - 5, width: 28 * pa, height: 10, rx: 3, fill: WARN, opacity: 0.8 });
      el('rect', { x: x - 24, y: ROWS.r - 15, width: 48, height: 30, rx: 5, fill: SOFT, stroke: GRID });
      mono(x, ROWS.r + 5, 'r' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      const pg = clamp(o.ret * T - (T - 1 - i));
      el('rect', { x: x - 24, y: ROWS.g - 15, width: 48, height: 30, rx: 5, fill: PANEL, stroke: o.rowHi === 'g' ? GOOD : GRID, 'stroke-width': o.rowHi === 'g' ? 2 : 1 });
      if (pg > 0) { const h = 24 * (T - i) / T * pg; el('rect', { x: x - 8, y: ROWS.g + 12 - h, width: 16, height: h, rx: 2, fill: GOOD, opacity: 0.8 }); } }
    if (o.head != null) { const x = TX0 + clamp(o.head) * (T - 1) * TDX; el('line', { x1: x, y1: ROWS.t - 14, x2: x, y2: ROWS.g + 18, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); } }
  const VB = { x: [705, 800, 895], base: 212, sc: 210 };
  function vbars(acts, prevActs, u, o) { o = o || {};
    tx(660, 36, 'πθ(a|s) — 행동 확률', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const lab = ['← 왼쪽', '· 그대로', '→ 오른쪽'];
    acts.forEach((a, i) => { const pv = prevActs ? prevActs[i].prob : null, p = TW(pv, a.prob, u, 0.3, 1.4), x = VB.x[i], h = (p + (o.wob ? o.wob[i] : 0)) * VB.sc;
      el('rect', { x: x - 28, y: VB.base - h, width: 56, height: h, rx: 4, fill: i === 2 ? ACC : INFO, opacity: 0.85 });
      mono(x, VB.base - p * VB.sc - 8 - (o.wob ? 22 : 0), f2(p), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      tx(x, VB.base + 22, lab[i], { 'font-size': 14, 'font-weight': 600, 'text-anchor': 'middle' });
      if (o.delta && a.delta) mono(x, VB.base + 44, (a.delta > 0 ? '+' : '−') + f2(Math.abs(a.delta)), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: a.delta > 0 ? GOOD : BAD, opacity: fade(u, 1.4) }); });
    el('line', { x1: 665, y1: VB.base, x2: 935, y2: VB.base, stroke: MUT, 'stroke-width': 1.5 }); }
  function s2(t, c) { const { k, u } = c, pb = c.beat.policyBars, pp = c.prev ? c.prev.policyBars : null;
    const wob = k === 6 ? (() => { const s = Math.sin(t * 5) * 0.06 * E(u, 1.2, 1.6); return [-s / 2, -s / 2, s]; })() : null;
    vbars(pb.actions, k === 5 ? pp.actions : null, u, { delta: k >= 5, wob });
    if (k === 0) {
      spans(320, 120, [['loss = ', {}], ['−log πθ(a|s)', { fill: WARN, 'font-weight': 700 }], [' × ', {}], ['G', { fill: GOOD, 'font-weight': 700 }]], { 'font-size': 24, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      spans(320, 180, [['지도학습: ', { fill: MUT }], ['−log p(정답 라벨)', { fill: MUT }]], { 'font-size': 17, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      grow(450, 132, 450, 222, E(u, 1.5, 1.9), GOOD);
      pill(450, 248, '가중치 = 보상 G (정답 라벨이 아님)', GOOD, pop(u, 1.9), { fs: 15 });
      sub(320, 300, '보상이 큰 행동일수록 강한 정답 취급', fade(u, 2.3), { 'font-size': 15 });
      return; }
    if (k === 1) {
      [['GAMMA = 0.99', 0.2], ['policy = DiscretePolicy(4, 3)', 0.6], ['Adam(policy.parameters(), lr=1e-3)', 1.0]].forEach(([s, a], i) => pill(310, 70 + i * 52, s, ACC, pop(u, a), { mono: true, fs: 15 }));
      [['리플레이 버퍼', 190], ['타깃망', 410]].forEach(([s, x]) => { pill(x, 255, s, OFF, fade(u, 1.5), { fs: 15 }); cross(x, 255, 12, pop(u, 1.8)); });
      sub(310, 310, 'DQN 과 달리 갱신 대상은 정책망 하나', fade(u, 2.1), { 'font-size': 15 });
      return; }
    // k >= 2: 에피소드 테이프
    const play = k === 2 ? 0 : k === 3 ? E(u, 0.2, 2.2) : 1, ret = k === 2 ? E(u, 0.5, 2.2) : 1;
    tape({ play, ret, head: k === 3 && u < 2.3 ? play : null, rowHi: k === 2 ? 'g' : k === 4 ? (u < 1.2 ? 'lp' : 'g') : null });
    pill(500, 240, '에피소드 총보상 +87', GOOD, k === 2 ? pop(u, 2.0) : 1, { fs: 14.5 });
    if (k === 2) { const T = ACTS.length, i = Math.min(T - 1, Math.floor(ret * T)), x = TX0 + (T - 1 - i) * TDX;
      if (u > 0.5 && u < 2.3) grow(x + 22, ROWS.g + 26, x - 22, ROWS.g + 26, 1, GOOD);
      mono(220, 300, 'g = r + γ · g', { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.3) });
      sub(220, 330, '뒤에서부터 누적 (γ = 0.99)', fade(u, 0.6), { 'font-size': 15 });
      sub(220, 360, '이 G 가 그대로 학습 가중치', fade(u, 1.4), { 'font-size': 15, fill: GOOD }); }
    if (k === 3) { mono(220, 300, 'action = dist.sample()', { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(220, 330, 'log_probs.append(…)  rewards.append(…)', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.8) });
      sub(220, 370, '끝날 때까지 갱신 없음 — 정책은 그대로', fade(u, 2.2), { 'font-size': 15, fill: WARN }); }
    if (k === 4) { tx(TX0 + 7 * TDX + 44, (ROWS.lp + ROWS.g) / 2 + 8, '×', { 'font-size': 26, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9), 'text-anchor': 'middle' });
      for (let i = 0; i < ACTS.length; i++) dot([[TX0 + i * TDX, ROWS.g + 16], [300, 284]], seg(u, 1.2 + i * 0.06, 1.9 + i * 0.06), ACC, 4);
      card(300, 300, 340, 42, { text: 'loss = −(Σ log π · G)', fs: 17, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.9) });
      sub(300, 350, '앞의 − : 최대화할 목적 → 최소화할 손실', fade(u, 2.2), { 'font-size': 15 }); }
    if (k === 5) { ['zero_grad', 'backward', 'step'].forEach((s, i) => { pill(130 + i * 170, 300, s + '()', ACC, pop(u, 0.2 + i * 0.3), { mono: true, fs: 15 }); if (i) grow(130 + (i - 1) * 170 + 62, 300, 130 + i * 170 - 62, 300, E(u, 0.3 + i * 0.3, 0.5 + i * 0.3), ACC); });
      sub(300, 350, '합은 1 — 하나가 오르면 나머지는 내려간다', fade(u, 1.8), { 'font-size': 15 }); }
    if (k === 6) { const ax = { X: (v) => 60 + v * 120, Y: (v) => 366 - v * 0.65 }, G = [87, -12, 140];
      el('line', { x1: 60, y1: ax.Y(0), x2: 420, y2: ax.Y(0), stroke: MUT, 'stroke-width': 1.5 });
      G.forEach((g, i) => { const s = E(u, 0.3 + i * 0.5, 0.8 + i * 0.5), x = ax.X(i + 0.5), y0 = ax.Y(0), y1 = ax.Y(g * s);
        el('rect', { x: x - 26, y: Math.min(y0, y1), width: 52, height: Math.abs(y1 - y0), rx: 3, fill: g >= 0 ? GOOD : BAD, opacity: 0.8 });
        mono(x + 34, g >= 0 ? y1 + 12 : y0 + 16, 'G=' + sgn(g), { 'font-size': 14, 'font-weight': 700, fill: g >= 0 ? GOOD : BAD, opacity: s }); });
      tx(60, 262, '에피소드마다 G', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      pill(560, 330, '경사도 같이 요동 → 분산 문제', BAD, pop(u, 1.9), { fs: 15 }); }
  }

  // =========================================================
  // 3. Advantage · Actor-Critic
  // =========================================================
  function s3(t, c) { const { k, u } = c, adv = c.beat.advBox, pa = c.prev ? c.prev.advBox : null;
    const V = TW(pa ? pa.baseline : null, adv.baseline, u, 0.4, 1.4);
    const ax = axes(80, 50, 360, 270, { x: [0, 3], y: [0, 150], yt: [0, 50, 100, 150], grid: true, yl: 'G (에피소드 보상)' });
    adv.rows.forEach((r, i) => { const x = ax.X(i + 0.5), top = ax.Y(r.g);
      el('rect', { x: x - 28, y: top, width: 56, height: ax.Y(0) - top, rx: 4, fill: INFO, opacity: 0.75 });
      mono(x, top - 8, 'G=' + r.g, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      tx(x, 344, r.ep, { 'font-size': 14, 'font-weight': 600, 'text-anchor': 'middle', fill: MUT });
      const A = Math.round(r.g - V), col = adv.baseline === 0 ? WARN : A > 10 ? GOOD : A < -10 ? BAD : MUT, show = k >= 6 || adv.baseline === 0;
      if (show) { const ap = k === 6 ? E(u, 0.3 + i * 0.4, 0.8 + i * 0.4) : 1, y0 = ax.Y(V), y1 = lerp(y0, top, ap);
        if (Math.abs(y1 - y0) > 3) el('line', { x1: x + 38, y1: y0, x2: x + 38, y2: y1, stroke: col, 'stroke-width': 3, 'marker-end': col === BAD ? 'url(#ra-ahr)' : null });
        mono(x + 32, Math.min(y0, top) - 6 - (i === 0 ? 0 : 0), 'A=' + (A > 0 ? '+' : A < 0 ? '−' : '') + Math.abs(A), { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: ap, 'text-anchor': 'start' });
        const verdict = adv.baseline === 0 ? '↑ 강화' : A > 10 ? '↑ 강화' : A < -10 ? '↓ 확률 하락' : '· 거의 그대로';
        tx(x, 372, verdict, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: k === 6 ? fade(u, 1.8) : 1 }); } });
    if (V > 0.5) { el('line', { x1: 80, y1: ax.Y(V), x2: 440, y2: ax.Y(V), stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      mono(444, ax.Y(V) + 5, 'V(s)=' + Math.round(V), { 'font-size': 14, 'font-weight': 700, fill: WARN }); }
    if (k === 0) pill(260, 404, '양수면 무엇이든 강화 — 좋고 그저 그런 행동이 구분 안 됨', WARN, pop(u, 1.4), { fs: 13.5 });

    // 오른쪽: Actor · Critic
    card(615, 110, 180, 76, { text: 'Actor πθ(a|s)\n행동 분포 → 샘플링', fs: 15, stroke: ACC, fill: ACCBG, color: INK });
    if (k === 0) { card(840, 110, 180, 76, { text: 'Critic 없음', fs: 15, stroke: OFF, dash: '6 5', color: OFF }); return; }
    card(840, 110, 180, 76, { text: 'Critic Vφ(s)\n이 상태의 평균 성적', fs: 15, stroke: WARN, fill: 'var(--warnbg)', s: k === 1 ? pop(u, 0.3) : 1 });
    if (k === 1) sub(840, 175, 'Actor 와 같은 평범한 신경망', fade(u, 1.2), { 'font-size': 14 });
    if (k >= 2) { mlp([{ n: 4, x: 775 }, { n: 5, x: 845, dots: true }, { n: 1, x: 912, col: WARN, fill: 'var(--warnbg)' }], 232, 21, k === 2 ? E(u, 0.2, 1.8) : 1, { r: 8 });
      const lop = k === 2 ? fade(u, 1.7) : 1; sub(775, 300, '4', lop); sub(845, 300, '64 · ReLU', lop); sub(912, 300, '1 = V(s)', lop, { fill: WARN, 'font-weight': 700 }); }
    if (k === 3) { pill(600, 340, '[T, 1]', MUT, pop(u, 0.3), { mono: true, fs: 15 }); grow(642, 340, 690, 340, E(u, 0.7, 1.1), ACC);
      pill(730, 340, '[T]', ACC, pop(u, 1.1), { mono: true, fs: 15 }); sub(665, 316, 'squeeze(-1)', fade(u, 0.7), { 'font-size': 14 });
      tx(850, 345, '= returns [T]', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.7) });
      sub(720, 385, '모양이 같아야 G − V 뺄셈이 맞다', fade(u, 2.1)); }
    if (k >= 4) { const p = k === 4 ? E(u, 0.2, 1.0) : 1; el('path', { d: `M525,62 V${62 - 22 * p} H930 V62`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: p });
      mono(728, 32, 'Adam([*actor, *critic], lr=1e-3)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 4 ? fade(u, 1.0) : 1 }); }
    if (k === 4) sub(728, 360, '두 망을 한 옵티마이저로 함께 갱신', fade(u, 1.5), { 'font-size': 15 });
    if (k === 5) { grow(770, 152, 520, ax.Y(60) - 4, E(u, 0.2, 1.0), WARN); mono(640, 360, 'values = critic(states)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 6) { mono(640, 345, 'A = G − V(s).detach()', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      el('line', { x1: 770, y1: 152, x2: 640, y2: 210, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.2) });
      cross(705, 181, 10, pop(u, 1.4)); sub(640, 236, 'detach: Critic 쪽 경사 차단', fade(u, 1.5), { fill: BAD }); }
    if (k === 7) { mono(640, 345, 'actor_loss = −(log π · A).sum()', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      adv.rows.forEach((r, i) => { const A = r.g - adv.baseline, y = 190 + i * 34, col = A > 10 ? GOOD : A < -10 ? BAD : MUT;
        tx(540, y + 5, r.ep, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.3) });
        tx(600, y + 5, A > 10 ? '확률 ↑' : A < -10 ? '확률 ↓' : '그대로', { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.6 + i * 0.3) }); });
      sub(620, 300, 'G 자리에 A — 코드 차이는 이것 하나', fade(u, 1.9), { 'font-size': 14 }); }
    if (k === 8) { adv.rows.forEach((r, i) => { const x = ax.X(i + 0.5) - 38; el('line', { x1: x, y1: ax.Y(adv.baseline), x2: x, y2: ax.Y(r.g), stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '3 3', opacity: fade(u, 0.3) }); });
      mono(640, 330, 'critic_loss = MSE(V, G)', { 'font-size': 15, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.4) });
      mono(640, 362, 'loss = actor + 0.5 · critic', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(640, 396, '남은 문제: 한 번에 확 바뀌는 정책 → PPO', fade(u, 2.0), { fill: BAD }); }
  }

  // =========================================================
  // 4. PPO 클리핑
  // =========================================================
  const clip = (r, e) => Math.max(1 - e, Math.min(1 + e, r));
  function ppoAxes(neg, op) { const yt = neg ? [-2, -1, 0] : [0, 1, 2];
    return axes(80, 40, 440, 270, { x: [0, 2], y: neg ? [-2, 0] : [0, 2], yt, yl: neg ? '목적 L (A < 0)' : '목적 L (A > 0)', xl: 'ratio = π_new / π_old' }); }
  function curve(ax, f, p, col, o) { const pts = []; for (let i = 0; i <= 100; i++) { const r = i / 50; pts.push([r, f(r)]); } line(ax, pts, p, col, o); }
  function marker(ax, r, f, col, lab) { const x = ax.X(r), y = ax.Y(f(r));
    el('circle', { cx: x, cy: y, r: 8, fill: col || INFO, stroke: PANEL, 'stroke-width': 2 });
    if (lab) mono(x, y - 16, lab, { 'font-size': 14, 'font-weight': 700, fill: col || INFO, 'text-anchor': 'middle' }); }
  function s4(t, c) { const { k, u } = c, b = c.beat.ppoClip, pv = c.prev ? c.prev.ppoClip : null, neg = /A < 0/.test(b.title || '');
    const eps = TW(pv ? pv.epsilon : null, b.epsilon, u, 0.3, 1.4), dim = k === 2 ? 0.35 : 1;
    const ax = ppoAxes(neg);
    // 허용 폭
    el('rect', { x: ax.X(1 - eps), y: 40, width: ax.X(1 + eps) - ax.X(1 - eps), height: 270, fill: ACCBG, opacity: 0.55 * dim });
    [1 - eps, 1, 1 + eps].forEach((v) => { el('line', { x1: ax.X(v), y1: 310, x2: ax.X(v), y2: 316, stroke: MUT }); mono(ax.X(v), 332, v.toFixed(1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: v === 1 ? INK : ACC, 'font-weight': 700 }); });
    mono(ax.X(1), 30, '허용 1±' + eps.toFixed(1), { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    const A = neg ? -1 : 1, s1f = (r) => r * A, s2f = (r) => clip(r, eps) * A, Lf = (r) => Math.min(s1f(r), s2f(r));
    if (k === 4) { // 갈라지는 구간
      [[0, 1 - eps], [1 + eps, 2]].forEach(([a, z]) => el('rect', { x: ax.X(a), y: 40, width: ax.X(z) - ax.X(a), height: 270, fill: 'var(--badbg)', opacity: 0.6 * fade(u, 1.6) }));
      curve(ax, s1f, E(u, 0.2, 1.0), MUT, { dash: '7 6' }); curve(ax, s2f, E(u, 0.8, 1.6), WARN, { sw: 3 });
      tx(ax.X(1.6), 60, '위험 구간', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    else { if (k >= 5 || k <= 1) curve(ax, s1f, k === 5 ? 1 : 1, OFF, { dash: '7 6', sw: 2 });
      curve(ax, Lf, k === 0 ? E(u, 0.2, 1.4) : k === 5 || k === 6 ? E(u, 0.2, 1.4) : 1, ACC, { sw: 4, op: k === 2 ? 0.35 : 1 }); }
    // 오른쪽 패널
    const RX = 740;
    if (k === 0) { mono(RX, 80, 'ε = 0.5', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.2) });
      const r = lerp(1, 1.5, E(u, 1.2, 2.2)); marker(ax, r, Lf, BAD); sub(RX, 130, '평평해지는 지점이 멀다', fade(u, 1.0), { 'font-size': 15 });
      pill(RX, 190, '한 배치가 정책을 멀리 민다', BAD, pop(u, 2.0), { fs: 14.5 }); }
    if (k === 1) { mono(RX, 80, 'CLIP_EPS = 0.2', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
      mono(RX, 125, 'clip(ratio, 0.8, 1.2)', { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(RX, 165, 'ε 0.5 → 0.2 — 폭이 좁아졌다', fade(u, 1.6), { 'font-size': 15 }); sub(RX, 195, '관례: 0.1 ~ 0.3', fade(u, 2.0), { 'font-size': 15 }); }
    if (k === 2) { const ins = [['new_log_probs', ACC], ['old_log_probs', WARN], ['advantages', INFO]];
      ins.forEach(([s, col], i) => { const a = 0.2 + i * 0.35; pill(640, 70 + i * 55, s, col, pop(u, a), { mono: true, fs: 14 }); grow(720, 70 + i * 55, 800, 125, E(u, a + 0.6, a + 1.0), col === ACC ? ACC : MUT); });
      card(860, 125, 110, 50, { text: 'ppo_loss', fs: 15, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.6) });
      sub(745, 260, '옛 정책이 있어야 "얼마나 바뀌었나"를 잰다', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 3) { mono(RX, 80, 'ratio = exp(new − old)', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(RX, 116, '= π_new / π_old', fade(u, 0.7), { 'font-size': 15 });
      const r = 1 + 0.3 * Math.sin(Math.PI * 2 * seg(u, 1.4, 2.6)) * (u > 1.4 ? 1 : 0); marker(ax, r, Lf, INFO, u < 1.4 ? '1' : null);
      pill(RX, 170, 'ratio = 1 → 정책 그대로', INFO, pop(u, 1.0), { fs: 14.5 }); sub(RX, 215, '1에서 멀수록 크게 바뀐 것', fade(u, 1.6), { 'font-size': 15 }); }
    if (k === 4) { el('line', { x1: 610, y1: 80, x2: 650, y2: 80, stroke: MUT, 'stroke-width': 2.5, 'stroke-dasharray': '7 6', opacity: fade(u, 0.2) }); mono(662, 85, 'surr1 = ratio · A', { 'font-size': 15, opacity: fade(u, 0.2) });
      el('line', { x1: 610, y1: 120, x2: 650, y2: 120, stroke: WARN, 'stroke-width': 3.5, opacity: fade(u, 0.8) }); mono(662, 125, 'surr2 = clip(ratio) · A', { 'font-size': 15, opacity: fade(u, 0.8) });
      sub(RX, 175, '1±ε 밖에서 두 값이 갈라진다', fade(u, 1.8), { 'font-size': 15, fill: BAD }); }
    if (k === 5 || k === 6) { const r0 = 1, r1 = neg ? 0.5 : 1.5, r = lerp(r0, r1, E(u, 1.2, 2.2)); marker(ax, r, Lf, BAD);
      const fx = neg ? ax.X(0.4) : ax.X(1.6), fy = ax.Y(Lf(neg ? 0.4 : 1.6)) - 30;
      if (u > 2.0) { el('line', { x1: fx - 40, y1: fy + 14, x2: fx + 40, y2: fy + 14, stroke: BAD, 'stroke-width': 3 }); tx(fx, fy, '경사 0', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
      mono(RX, 80, k === 5 ? '−min(surr1, surr2).mean()' : 'A < 0 : 거울처럼 뒤집힌다', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(RX, 120, k === 5 ? '보수적인 쪽을 고른다' : '이번엔 ratio 를 낮추는 쪽이 이득', fade(u, 0.7), { 'font-size': 15 });
      pill(RX, 170, k === 5 ? 'ratio > 1.2 → 평평 = 경사 0' : 'ratio < 0.8 → 평평 = 경사 0', ACC, pop(u, 1.4), { fs: 14.5 }); }
    if (k === 7) { lock(640, 80, true, WARN, pop(u, 0.2)); mono(670, 86, 'old_log_probs 고정', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      sub(RX, 120, 'no_grad 스냅샷 — ratio 의 기준', fade(u, 0.6), { 'font-size': 14.5 });
      const raw = [0.3, 0.9, 1.4, 2.1, 2.6, 3.4], m = 1.783, sd = 1.0745, p = E(u, 1.2, 2.2);
      el('line', { x1: 590, y1: 230, x2: 930, y2: 230, stroke: MUT, 'stroke-width': 1.5, opacity: fade(u, 1.0) });
      el('line', { x1: 760, y1: 220, x2: 760, y2: 240, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.0) }); mono(760, 258, '0', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      raw.forEach((v, i) => { const xr = 760 + v * 45, xn = 760 + ((v - m) / sd) * 45; el('circle', { cx: lerp(xr, xn, p), cy: 230, r: 7, fill: INFO, opacity: fade(u, 1.0 + i * 0.05) }); });
      pill(RX, 300, 'advantage: 평균 0 · 표준편차 1', INFO, pop(u, 2.1), { fs: 14.5 }); }
    if (k === 8) { const ep = Math.min(4, Math.floor(seg(u, 0.2, 2.4) * 4.999)); for (let i = 0; i < 4; i++) pill(620 + i * 82, 80, 'epoch ' + (i + 1), i < ep ? ACC : OFF, i < ep ? 1 : 0.6, { fs: 14 });
      const r = Math.min(1.2 + 0.08 * Math.max(0, ep - 3), [1, 1.07, 1.14, 1.2, 1.28][ep]); marker(ax, r, Lf, INFO);
      sub(RX, 130, '같은 배치를 4번 재사용', fade(u, 0.4), { 'font-size': 15 }); sub(RX, 160, '1.2 를 넘으면 더 밀 이득이 없다', fade(u, 2.0), { 'font-size': 15, fill: ACC }); }
    if (k === 9) { const r = lerp(1, 1.75, E(u, 0.3, 1.6)); marker(ax, r, Lf, BAD); grow(ax.X(1.0), 290, ax.X(1.75), 290, E(u, 0.3, 1.6), BAD);
      tx(ax.X(1.4), 280, '폭주 배치', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      banner(RX, 90, '경사 0 = 더 이상 못 민다', pop(u, 1.7)); sub(RX, 140, '배치 하나가 정책을 무너뜨리지 못한다', fade(u, 2.0), { 'font-size': 15 }); }
  }

  // =========================================================
  // 5. RLHF — 선호 비교 → 보상 모델 → PPO
  // =========================================================
  const TOK = ['데코레이터는', '함수를', '감싸서', '…'];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { lbl(300, 70, 'LLM 쪽', fade(u, 0.1), { fill: ACC }); lbl(660, 70, '강화학습 쪽', fade(u, 0.1), { fill: MUT });
      [['LLM', '정책 πθ'], ['다음 토큰 선택', '행동 a'], ['RM 점수', '보상 r']].forEach(([a, b], i) => { const y = 130 + i * 80, s = 0.3 + i * 0.6;
        pill(300, y, a, ACC, pop(u, s), { fs: 16 }); grow(380, y, 580, y, E(u, s + 0.2, s + 0.6), ACC); pill(660, y, b, INK, pop(u, s + 0.5), { fs: 16, mono: b !== '행동 a' && false }); });
      sub(480, 390, '새 알고리즘이 아니라 앞 단계 도구를 언어 모델에 얹는다', fade(u, 2.2), { 'font-size': 15 });
      return; }
    // ① 선호 데이터
    zone(20, 20, 280, 320, '① 선호 데이터', { stroke: k === 1 ? ACC : 'none' });
    const o1 = k === 1 ? fade(u, 0.2) : 1;
    card(160, 70, 250, 34, { text: '파이썬 데코레이터 설명해줘', fs: 14, op: o1, stroke: GRID });
    card(160, 135, 230, 44, { text: '데코레이터는 함수를 감싸서...', fs: 13.5, stroke: GOOD, op: k === 1 ? fade(u, 0.6) : 1 });
    card(160, 200, 230, 44, { text: '그건 검색하면 나옵니다.', fs: 13.5, stroke: BAD, op: k === 1 ? fade(u, 0.9) : 1 });
    person(70, 278, null, { op: k === 1 ? fade(u, 1.2) : 1 });
    check(285, 135, 9, k === 1 ? pop(u, 1.6) : 1); cross(285, 200, 8, k === 1 ? pop(u, 1.8) : 1);
    tx(110, 278, 'chosen > rejected', { 'font-size': 15, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.9) : 1 });
    tx(110, 304, '점수 대신 비교', { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 2.2) : 1 });
    if (k < 2) return;
    // ② 보상 모델
    zone(320, 20, 300, 320, '② 보상 모델 (RM)', { stroke: k === 2 || k === 3 ? ACC : 'none' });
    card(470, 70, 170, 38, { text: 'RM(prompt, answer)', fs: 13.5, mono: true, stroke: WARN, fill: 'var(--warnbg)', s: k === 2 ? pop(u, 0.2) : 1 });
    if (k === 2) { grow(276, 135, 384, 78, E(u, 0.5, 1.0), GOOD); grow(276, 200, 384, 84, E(u, 0.7, 1.2), BAD); }
    const hw = k === 2 ? 46 * E(u, 1.2, 1.8) : k === 3 ? lerp(46, 75, E(u, 0.8, 2.2)) : 75, hl = k === 2 ? 40 * E(u, 1.2, 1.8) : k === 3 ? lerp(40, 18, E(u, 0.8, 2.2)) : 18;
    el('rect', { x: 400, y: 190 - hw, width: 44, height: hw, rx: 4, fill: GOOD, opacity: 0.85 }); el('rect', { x: 496, y: 190 - hl, width: 44, height: hl, rx: 4, fill: BAD, opacity: 0.85 });
    el('line', { x1: 380, y1: 190, x2: 560, y2: 190, stroke: MUT, 'stroke-width': 1.5 });
    mono(422, 210, 's_win', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 }); mono(518, 210, 's_lose', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
    if (k >= 3) { const op = k === 3 ? fade(u, 0.2) : 1;
      mono(470, 108, '−log σ(s_win − s_lose)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: op });
      const ax = axes(370, 236, 200, 66, { x: [-4, 4], y: [0, 1], yt: [0, 1] }); const pts = []; for (let i = 0; i <= 40; i++) { const d = -4 + i * 0.2; pts.push([d, 1 / (1 + Math.exp(-d))]); }
      line(ax, pts, k === 3 ? E(u, 0.3, 1.0) : 1, WARN, { sw: 2.4 });
      const d = k === 3 ? lerp(0, 3, E(u, 0.8, 2.2)) : 3; el('circle', { cx: ax.X(d), cy: ax.Y(1 / (1 + Math.exp(-d))), r: 6, fill: GOOD, opacity: op });
      tx(470, 330, 'σ(차이) — 이긴 쪽 확률 ↑', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
    if (k < 4) { const mp = [['LLM = πθ'], ['토큰 = 행동'], ['RM 점수 = 보상']]; mp.forEach(([s], i) => pill(705 + 0 * i, 90 + i * 50, s, OFF, 1, { fs: 14 })); return; }
    // ③ PPO 미세조정
    zone(640, 20, 300, 320, '③ PPO 미세조정', { stroke: k >= 4 && k <= 7 ? ACC : 'none' });
    card(790, 66, 170, 36, { text: 'LLM = 정책 πθ', fs: 14.5, stroke: ACC, fill: ACCBG, color: ACC, s: k === 4 ? pop(u, 0.2) : 1 });
    const nTok = k === 4 ? Math.floor(lerp(0, 4.99, E(u, 0.4, 2.2))) : 4; let x = 655;
    TOK.forEach((s, i) => { const w = tw(s, 14) + 16; if (i < nTok) { card(x + w / 2, 122, w, 32, { text: s, fs: 14, stroke: INFO, fill: 'var(--infobg)' }); sub(x + w / 2, 156, '행동', 1); } x += w + 6; });
    if (k >= 4) sub(790, 180, '답변 1개 = 에피소드 1개', k === 4 ? fade(u, 2.2) : 1, { 'font-weight': 700, fill: INK });
    if (k >= 5) { const op = k === 5 ? fade(u, 0.2) : 1; if (k === 5) grow(556, 74, 650, 116, E(u, 0.2, 0.8), WARN);
      const full = 240, pen = k >= 6 ? 60 * (k === 6 ? E(u, 1.2, 2.0) : 1) : 0, rlen = full * (k === 5 ? E(u, 0.8, 1.6) : 1);
      tx(660, 212, '보상 r = RM 점수', { 'font-size': 14, 'font-weight': 700, opacity: op });
      el('rect', { x: 660, y: 222, width: rlen - pen, height: 20, rx: 4, fill: GOOD, opacity: 0.85 });
      if (pen > 0) el('rect', { x: 660 + rlen - pen, y: 222, width: pen, height: 20, rx: 4, fill: 'var(--badbg)', stroke: BAD, 'stroke-dasharray': '4 3' }); }
    if (k >= 6) { const op = k === 6 ? fade(u, 0.4) : 1;
      mono(660, 268, '− 0.1 · (log πθ − log π_ref)', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: op });
      const ref = [0.5, 0.3, 0.2], cur = [0.5, 0.3, 0.2].map((v, i) => lerp(v, [0.2, 0.2, 0.6][i], k === 6 ? E(u, 0.5, 1.6) : 1));
      ref.forEach((v, i) => { const bx = 668 + i * 66; el('rect', { x: bx, y: 325 - v * 50, width: 22, height: v * 50, fill: OFF, opacity: op }); el('rect', { x: bx + 24, y: 325 - cur[i] * 50, width: 22, height: cur[i] * 50, fill: ACC, opacity: op }); });
      tx(932, 300, 'π_ref', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); tx(932, 318, 'πθ', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end', 'font-weight': 700, opacity: op }); }
    // 아래 띠
    if (k === 7) { mono(250, 380, 'advantages = rewards − rewards.mean()', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      grow(450, 375, 530, 375, E(u, 0.9, 1.3), ACC); card(640, 375, 200, 40, { text: 'ppo_loss(…)', fs: 15, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.3) });
      sub(830, 380, 'Step 4 그대로', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: ACC }); }
    if (k === 8) { const chain = ['REINFORCE', '+Advantage', '+클리핑 (PPO)', '+KL (RLHF)']; let xx = 30;
      chain.forEach((s, i) => { const w = tw(s, 15) + 30, a = 0.2 + i * 0.4; pill(xx + w / 2, 375, s, i === 3 ? ACC : INK, pop(u, a), { fs: 15 }); if (i) grow(xx - 26, 375, xx - 4, 375, E(u, a, a + 0.2)); xx += w + 30; });
      tx(940, 380, '→ llmops · ai-agent', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }
    if (k >= 4 && k <= 6) { const mp = k === 4 ? '토큰 하나하나 = 행동' : k === 5 ? '환경 점수판 자리에 RM' : 'KL: 원본에서 멀어진 만큼 감점'; pill(480, 378, mp, k === 6 ? BAD : ACC, pop(u, 0.3), { fs: 15 }); }
  }

  RA.page({ title: '정책 학습실 — πθ 를 직접 민다', scenes: [s1, s2, s3, s4, s5] });
})();
