/* II-2-1 아키텍처 진화 LeNet→ResNet — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 텐서가 층을 지날 때마다 특징맵 더미의 크기(해상도)와 장 수(채널)가 바뀐다.
 *   위쪽 띠 = CNN 10년 연대기. 시대마다 "부족했던 재료 / 새로 생긴 부품"이 쌓인다.
 * 숫자는 페이지 데이터·코드 주석과 torch 로 센 파라미터 수(61,706 / 61,100,840 / 138,357,544 / 25,557,032)에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // k 번째 beat 의 at 초에 나타남 (지난 beat 는 그대로 보임)
  const on = (c, kk, at, d) => (c.k > kk ? 1 : c.k === kk ? E(c.u, at, at + (d || 0.5)) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 700, opacity: op }, a || {}));

  // ---------- 연대기 띠 ----------
  const TL = [['1998', 'LeNet-5'], ['2012', 'AlexNet'], ['2014', 'VGG'], ['2015', 'ResNet'], ['2019+', 'EffNet·ViT']];
  function timeline(gi) {
    const x0 = 150, dx = 165, y = 22;
    el('line', { x1: x0, y1: y, x2: x0 + dx * 4, y2: y, stroke: GRID, 'stroke-width': 3 });
    el('line', { x1: x0, y1: y, x2: x0 + dx * gi, y2: y, stroke: ACC, 'stroke-width': 3 });
    TL.forEach(([yr, nm], i) => { const a = i === gi, p = i < gi;
      el('circle', { cx: x0 + i * dx, cy: y, r: a ? 8 : 6, fill: a || p ? ACC : PANEL, stroke: a || p ? ACC : OFF, 'stroke-width': 2 });
      mono(x0 + i * dx + 13, y + 5, yr, { 'font-size': 13.5, 'font-weight': a ? 800 : 500, fill: a ? INK : MUT });
      tx(x0 + i * dx + 13 + tw(yr, 13.5) + 6, y + 5, nm, { 'font-size': 13.5, 'font-weight': a ? 800 : 500, fill: a ? ACC : MUT }); });
  }

  // ---------- 그림 부품 ----------
  // 특징맵 더미: 가운데 (cx, cy), 한 장의 변 s(px), 장 수 n (최대 5장만 겹쳐 그림)
  function fmap(cx, cy, s, n, o) { o = o || {}; const m = Math.min(n, 5), off = o.off ?? 6, op = o.op ?? 1; if (op <= 0.01) return;
    for (let i = m - 1; i >= 0; i--) {
      el('rect', { x: cx - s / 2 + i * off - (m - 1) * off / 2, y: cy - s / 2 - i * off + (m - 1) * off / 2, width: s, height: s, rx: 2,
        fill: i === 0 ? (o.fill || ACCBG) : PANEL, stroke: o.col || ACC, 'stroke-width': 1.8, opacity: op }); }
    if (o.label) mono(cx, cy + s / 2 + (m - 1) * off / 2 + 20, o.label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op, fill: o.lc || INK });
    if (o.top) tx(cx, cy - s / 2 - (m - 1) * off / 2 - 12, o.top, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op, fill: o.tc || MUT }); }
  // 뉴런 열: n 개 원을 세로로
  function neurons(cx, cy, n, gap, o) { o = o || {}; const op = o.op ?? 1; if (op <= 0.01) return;
    for (let i = 0; i < n; i++) { const y = cy + (i - (n - 1) / 2) * gap, dead = o.drop && o.drop.includes(i);
      el('circle', { cx, cy: y, r: o.r || 7, fill: dead ? PANEL : (o.hot === i ? ACC : o.fill || PANEL), stroke: dead ? OFF : o.col || INK, 'stroke-width': 2, 'stroke-dasharray': dead ? '3 3' : null, opacity: op });
      if (dead) el('path', { d: `M${cx - 5},${y - 5} L${cx + 5},${y + 5} M${cx + 5},${y - 5} L${cx - 5},${y + 5}`, stroke: BAD, 'stroke-width': 2, opacity: op }); }
    if (o.label) mono(cx, cy + (n - 1) / 2 * gap + 26, o.label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); }
  // 함수 곡선: f 를 [a, b] 에서 그려 u 만큼
  function curve(ax, f, a, b, u, col, o) { const pts = []; for (let i = 0; i <= 60; i++) { const x = a + (b - a) * i / 60; pts.push([x, f(x)]); } R.line(ax, pts, u, col, o); }
  // 손글씨 숫자 7 입력 그림
  function digit(cx, cy, s, op) { el('rect', { x: cx - s / 2, y: cy - s / 2, width: s, height: s, rx: 4, fill: INK, opacity: op });
    el('path', { d: `M${cx - s * 0.28},${cy - s * 0.28} L${cx + s * 0.28},${cy - s * 0.28} L${cx - s * 0.06},${cy + s * 0.32}`, fill: 'none', stroke: PANEL, 'stroke-width': s * 0.09, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op }); }
  function chips(x, y, sp, op) { if (!sp || op <= 0.01) return; const items = [['층수', `${sp.layers}층`], ['파라미터', sp.params], ['성적', sp.err]];
    let xx = x; items.forEach(([k, v]) => { const s = `${k} ${v}`, w = tw(s, 14) + 24; card(xx + w / 2, y, w, 30, { rx: 15, stroke: GRID, sw: 1.5, text: s, fs: 14, fw: 700, op }); xx += w + 8; }); }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  // ---------- 1. LeNet-5 ----------
  const L1 = { img: 70, c1: 200, p1: 305, c2: 395, p2: 470, f1: 560, f2: 625, f3: 690 }, LY = 175;
  const side = (r) => 18 + r * 2.3;
  function lenet(c, o) { o = o || {}; const k = c.k, dim = o.dim ?? 1;
    digit(L1.img, LY, side(32), dim);
    tx(L1.img, LY + side(32) / 2 + 22, '32×32×1', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', opacity: dim });
    const a1 = o.all ? 1 : on(c, 2, 0.3, 0.8), a2 = o.all ? 1 : on(c, 2, 1.4, 0.6), a3 = o.all ? 1 : on(c, 3, 0.3, 0.8), a4 = o.all ? 1 : on(c, 3, 1.3, 0.6), a5 = o.all ? 1 : on(c, 4, 0.3, 1.2);
    if (a1 > 0) { grow(L1.img + 52, LY, L1.c1 - 52, LY, a1, MUT); fmap(L1.c1, LY, side(28) * (0.3 + 0.7 * a1), 6, { label: '6@28×28', top: 'Conv 5×5', op: dim }); }
    if (a2 > 0) { grow(L1.c1 + 56, LY, L1.p1 - 34, LY, a2, MUT); fmap(L1.p1, LY, side(14) * (0.3 + 0.7 * a2), 6, { label: '6@14', top: 'Pool', col: INFO, fill: INFOBG, op: dim }); }
    if (a3 > 0) { grow(L1.p1 + 36, LY, L1.c2 - 32, LY, a3, MUT); fmap(L1.c2, LY, side(10) * (0.3 + 0.7 * a3), 16, { label: '16@10', top: 'Conv', op: dim }); }
    if (a4 > 0) { grow(L1.c2 + 32, LY, L1.p2 - 26, LY, a4, MUT); fmap(L1.p2, LY, side(5) * (0.3 + 0.7 * a4), 16, { label: '16@5', top: 'Pool', col: INFO, fill: INFOBG, op: dim }); }
    if (a5 > 0) { grow(L1.p2 + 26, LY, L1.f1 - 14, LY, a5, MUT);
      neurons(L1.f1, LY, 7, 18, { op: dim * clamp(a5 * 3), label: '120', col: WARN }); neurons(L1.f2, LY, 5, 18, { op: dim * clamp(a5 * 3 - 1), label: '84', col: WARN });
      neurons(L1.f3, LY, 10, 13, { op: dim * clamp(a5 * 3 - 2), r: 5.5, label: '10', col: WARN, hot: o.hot });
      tx(L1.f2, LY - 92, 'FC', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: dim * a5 }); }
  }
  function s1(t, c) { const { k, u } = c; timeline(0);
    const sp = c.beat.specs;
    if (k === 0) { digit(L1.img + 90, LY, side(32) * pop(u, 0.3), 1);
      mono(L1.img + 90, LY + 72, '32×32×1 흑백', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      tx(L1.img + 90, LY - 70, '✉️ 우편번호 손글씨', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      mono(330, 150, 'import torch', { 'font-size': 16, opacity: fade(u, 1.0) }); mono(330, 180, 'import torch.nn as nn', { 'font-size': 16, opacity: fade(u, 1.3) });
      el('rect', { x: 330, y: 220, width: 420, height: 80, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: fade(u, 1.8) });
      sub(540, 266, '아직 층이 없다 — 모델 자리만 비어 있다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k <= 6) lenet(c, { hot: k >= 5 ? 7 : null });
    if (k === 1) { el('rect', { x: 140, y: 70, width: 600, height: 210, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 6', opacity: fade(u, 0.3) });
      mono(156, 92, 'class LeNet5(nn.Module)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      ['Conv', 'Pool', 'Conv', 'Pool', 'FC'].forEach((s, i) => { const x = 200 + i * 115; card(x, 180, 86, 50, { rx: 8, stroke: s === 'FC' ? WARN : s === 'Pool' ? INFO : ACC, dash: '5 4', text: s, fs: 15, s: pop(u, 0.9 + i * 0.25) }); if (i) grow(x - 72, 180, x - 45, 180, E(u, 1.0 + i * 0.25, 1.3 + i * 0.25), OFF); });
      sub(440, 250, '[Conv → Pool] 반복 → FC 로 분류', fade(u, 2.2), { 'font-size': 15, fill: INK }); }
    if (k === 2) { const g = E(u, 0.3, 1.2); // 5×5 커널이 입력을 훑는다
      const s = side(32), kx = L1.img - s / 2 + 4 + g * (s - 26), ky = LY - s / 2 + 4 + g * (s - 26);
      el('rect', { x: kx, y: ky, width: 22, height: 22, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: 1 - E(u, 1.3, 1.6) });
      const ax = R.axes(110, 300, 150, 80, { x: [-3, 3], y: [-1, 1] });
      curve(ax, Math.tanh, -3, 3, E(u, 1.4, 2.0), MUT, { sw: 2.4 });
      tx(275, 318, 'tanh', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(345, 344, '양 끝은 평평 → 기울기 ≈ 0', fade(u, 2.0), { 'text-anchor': 'start', 'font-size': 14.5, fill: WARN }); }
    if (k === 3) note(110, 330, '반복할수록 해상도는 작게, 채널은 많게 — 특징이 추상화된다', fade(u, 1.9));
    if (k === 4) note(110, 330, '특징 추출은 conv, 판단은 FC', fade(u, 1.8));
    if (k === 5) { const g = E(u, 0.3, 2.2); R.dot([[L1.img, LY], [L1.c1, LY], [L1.p1, LY], [L1.c2, LY], [L1.p2, LY], [L1.f1, LY], [L1.f2, LY], [L1.f3, LY + 32.5]], g, ACC, 8);
      mono(110, 330, 'return self.classifier(self.features(x))', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.4) });
      tx(L1.f3 + 16, LY + 32.5 + 5, '→ "7"', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) }); }
    if (k === 6) { const n = tween(0, 61706, u, 1.6);
      mono(110, 330, `params = ${fmt(n)}`, { 'font-size': 22, 'font-weight': 800, fill: ACC });
      R.hbar(520, 300, 230, 2572, 61706, { u: E(u, 1.2, 1.8), col: ACC, text: 'conv 2,572' }); R.hbar(520, 330, 230, 59134, 61706, { u: E(u, 1.4, 2.0), col: WARN, text: 'FC 59,134' });
      sub(635, 370, 'CPU 로도 학습되는 크기', fade(u, 2.2), { 'font-size': 14.5 }); }
    if (k === 7) { lenet(c, { all: true, dim: 0.35 });
      const items = [['대규모 라벨셋', 'MNIST 학습용 6만 장뿐'], ['GPU', 'CPU 로 몇 달'], ['죽지 않는 활성화', 'tanh 포화 → 기울기 소실']];
      items.forEach(([h, d], i) => { const x = 190 + i * 250, y = 340, s = pop(u, 0.4 + i * 0.6);
        card(x, y, 220, 70, { rx: 10, stroke: BAD, fill: PANEL, s });
        tx(x, y - 6, h, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.6) });
        tx(x, y + 18, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6 + i * 0.6) });
        cross(x + 100, y - 30, 9, pop(u, 0.8 + i * 0.6)); });
      note(780, 120, '모델은 맞았다', fade(u, 2.2), { 'text-anchor': 'middle' }); note(780, 146, '재료가 없었다', fade(u, 2.4), { 'text-anchor': 'middle', fill: BAD }); return; }
    chips(560, 395, sp, k >= 2 ? (c.prev && c.prev.specs ? 1 : fade(u, 0.3)) : 0);
  }

  // ---------- 2. AlexNet ----------
  const ING = [['GPU 2장', 2], ['ReLU', 2], ['Dropout 0.5', 4], ['데이터 증강', 6]];
  function slots(c) { ING.forEach(([s, kk], i) => { const x = 130 + i * 233, y = 388, f = on(c, kk, 1.6 + (i % 2) * 0.4, 0.4);
    card(x, y, 210, 40, { rx: 10, stroke: f > 0.5 ? GOOD : OFF, dash: f > 0.5 ? null : '6 5', fill: f > 0.5 ? GOODBG : PANEL, text: f > 0.5 ? `${i + 1}  ${s}` : `재료 ${i + 1}`, fs: 15, color: f > 0.5 ? GOOD : MUT, s: f > 0 && f < 1 ? 0.9 + 0.1 * f : 1 }); }); }
  function s2(t, c) { const { k, u } = c; timeline(1); slots(c);
    if (k === 0) { // LeNet 미니 → AlexNet
      ['Conv', 'Pool', 'Conv', 'Pool', 'FC'].forEach((s, i) => card(110 + i * 80, 120, 66, 38, { rx: 6, stroke: OFF, text: s, fs: 14, color: MUT, s: pop(u, 0.2 + i * 0.1) }));
      tx(70, 82, 'LeNet-5 (1998)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      grow(300, 160, 300, 205, E(u, 0.9, 1.3), ACC);
      ['Conv', 'Pool', 'Conv', 'Pool', 'Conv×3', 'Pool', 'FC'].forEach((s, i) => card(90 + i * 72, 250, 62, 38, { rx: 6, stroke: ACC, text: s, fs: 13.5, s: pop(u, 1.3 + i * 0.1) }));
      tx(70, 300, 'AlexNet (2012) — 같은 문법, 더 크게', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) });
      note(640, 170, '승부는 구조가 아니라', fade(u, 2.0)); note(640, 200, '아래 네 가지 "재료"', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 1) { const g = E(u, 0.8, 1.8);
      el('rect', { x: 120, y: 280 - 21, width: 21, height: 21, fill: INK, opacity: fade(u, 0.3) }); mono(130, 300, '32×32×1', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      const s = 21 + (147 - 21) * g; ['var(--bad)', 'var(--good)', 'var(--info)'].forEach((col, i) => el('rect', { x: 260 + i * 8, y: 280 - s - i * 8, width: s, height: s, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: fade(u, 0.7) }));
      mono(260 + s / 2 + 8, 300, '224×224×3', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      note(520, 160, '입력 면적 49배 (컬러 3채널)', fade(u, 1.8)); sub(620, 200, '1000 클래스 · 120만 장', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 2) { const ax = R.axes(110, 80, 320, 220, { x: [-3, 3], y: [-1.2, 3], xt: [-2, 0, 2], yt: [-1, 0, 1, 2, 3], xl: 'x' });
      curve(ax, Math.tanh, -3, 3, E(u, 0.2, 0.8), MUT, { sw: 2.6 }); curve(ax, (x) => Math.max(0, x), -3, 3, E(u, 0.8, 1.4), ACC, { sw: 3.2 });
      tx(ax.X(2.2), ax.Y(1.2) + 6, 'tanh', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.7) });
      tx(ax.X(1.2), ax.Y(2.4), 'ReLU', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
      note(480, 120, "tanh' → 0 (양 끝 포화)", fade(u, 1.0), { fill: MUT }); note(480, 160, "ReLU' = 1 (x > 0)", fade(u, 1.5), { fill: ACC });
      sub(480, 200, '깊어져도 신호가 산다 · 수렴 6배', fade(u, 1.9), { 'text-anchor': 'start', 'font-size': 15 });
      card(640, 270, 260, 50, { rx: 8, stroke: INK, text: 'GPU 2장 → 6천만 개를 일주일에', fs: 15, s: pop(u, 1.7) }); return; }
    if (k === 3 || k === 4 || k === 5) { // conv 5층 채널 막대 + FC
      const CH = [[64, '11×11'], [192, '5×5'], [384, '3×3'], [256, '3×3'], [256, '3×3']], fc = k >= 4;
      tx(60, 70, 'features', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      CH.forEach(([ch, ks], i) => { const x = 70 + i * 62, h = ch / 384 * 200, f = k === 3 ? E(u, 0.3 + i * 0.3, 0.7 + i * 0.3) : 1;
        el('rect', { x, y: 300 - h * f, width: 40, height: h * f, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
        mono(x + 20, 296 - h * f - 8, String(ch), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: f });
        mono(x + 20, 322, ks, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: f }); });
      sub(200, 346, '모든 conv 뒤에 ReLU', k === 3 ? fade(u, 1.9) : 1, { 'font-size': 14.5 });
      if (k === 3) { mono(420, 150, `conv 파라미터 ${fmt(tween(0, 2469696, u, 1.4))}`, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
        sub(420, 186, '≈ 250만 — 의외로 가볍다', fade(u, 2.0), { 'text-anchor': 'start', 'font-size': 15 }); }
      if (fc) { const a = k === 4 ? E(u, 0.2, 0.8) : 1;
        tx(420, 70, 'classifier', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: a });
        neurons(450, 190, 9, 18, { op: a, col: WARN, label: '9216' }); neurons(540, 190, 8, 20, { op: a, col: WARN, drop: k === 4 && u > 1.0 ? [1, 4, 6] : k === 5 ? [1, 4, 6] : null, label: '4096' });
        neurons(630, 190, 8, 20, { op: a, col: WARN, drop: k === 4 && u > 1.2 ? [0, 3, 5] : k === 5 ? [0, 3, 5] : null, label: '4096' }); neurons(710, 190, 6, 22, { op: a, col: WARN, label: '1000' });
        if (k === 4) { sub(590, 92, 'Dropout 0.5 — 매번 절반을 끈다', fade(u, 1.0), { 'font-size': 14.5, fill: BAD });
          R.hbar(780, 140, 110, 2469696, 61100840, { u: E(u, 1.6, 2.0), col: ACC, text: 'conv 4%', h: 16 });
          R.hbar(780, 175, 110, 58631144, 61100840, { u: E(u, 1.8, 2.3), col: WARN, text: 'FC 96%', h: 16 });
          tx(780, 125, '파라미터 몫', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) }); } }
      if (k === 5) { mono(420, 330, 'self.classifier(self.features(x))', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
        R.dot([[90, 300], [330, 300], [450, 190], [710, 190]], E(u, 0.4, 1.8), ACC, 8);
        card(840, 140, 190, 76, { rx: 10, stroke: OFF, s: pop(u, 1.4) }); tx(840, 132, 'LeNet 5층 · 6만', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) });
        tx(840, 158, 'AlexNet 8층 · 6,110만', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
        sub(840, 210, '문법은 같은 두 줄', fade(u, 2.2), { 'font-size': 14.5 }); }
      return; }
    if (k === 6) { // 증강: 같은 사진의 변형
      const pic = (cx, cy, s, flip, zoom, op, id) => { const g = R.G(cx, cy, 1, op); el('rect', { x: -s / 2, y: -s / 2, width: s, height: s, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 2 }, g);
        const cp = el('clipPath', { id }, g); el('rect', { x: -s / 2 + 2, y: -s / 2 + 2, width: s - 4, height: s - 4, rx: 5 }, cp);
        const z = zoom || 1, sx = flip ? -1 : 1; const w = R.G(0, 0, 1, 1, g); w.setAttribute('clip-path', `url(#${id})`); const h = R.G(0, 0, 1, 1, w); h.setAttribute('transform', `scale(${sx * z} ${z})`);
        el('circle', { cx: -s * 0.12, cy: s * 0.05, r: s * 0.2, fill: WARN, opacity: 0.85 }, h); el('path', { d: `M${s * 0.05},${-s * 0.2} L${s * 0.32},${s * 0.25} L${-s * 0.2},${s * 0.25} Z`, fill: INFO, opacity: 0.85 }, h); return g; };
      pic(140, 190, 130, false, 1, fade(u, 0.2), 'ra221p0'); mono(140, 280, '원본 1장', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
      [[false, 1.5, 'crop'], [true, 1, 'flip'], [true, 1.4, 'crop+flip'], [false, 1.25, 'crop']].forEach(([fl, z, nm], i) => { const x = 330 + i * 140, s = pop(u, 0.7 + i * 0.35);
        const g = pic(x, 190, 100, fl, z, s > 0.02 ? 1 : 0, 'ra221p' + (i + 1)); g.setAttribute('transform', `translate(${x} 190) scale(${s})`);
        mono(x, 262, nm, { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9 + i * 0.35) }); });
      note(330, 320, '매 배치마다 새로 뽑는다 → 120만 장이 사실상 수천만 장', fade(u, 2.2)); return; }
    if (k === 7) { const ax = R.axes(160, 80, 360, 220, { x: [0, 2], y: [0, 30], yt: [0, 10, 20, 30], yl: 'top-5 오류율 %', grid: true });
      [[0.5, 26.2, '2위 (2012)', OFF], [1.5, 15.3, 'AlexNet', ACC]].forEach(([x, v, nm, col], i) => { const f = E(u, 0.3 + i * 0.6, 0.9 + i * 0.6), h = (ax.Y(0) - ax.Y(v)) * f;
        el('rect', { x: ax.X(x) - 45, y: ax.Y(0) - h, width: 90, height: h, rx: 4, fill: col });
        mono(ax.X(x), ax.Y(0) - h - 10, `${v}%`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: f });
        tx(ax.X(x), ax.Y(0) + 22, nm, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: f }); });
      grow(ax.X(0.5) + 50, ax.Y(26.2), ax.X(1.5) - 50, ax.Y(15.3), E(u, 1.4, 1.9), BAD);
      note(580, 150, '한 번에 약 11%p', fade(u, 1.8), { fill: BAD, 'font-size': 18 }); sub(580, 186, '매년 1~2%p 다투던 대회', fade(u, 2.1), { 'text-anchor': 'start', 'font-size': 15 });
      note(580, 250, '→ 딥러닝 부흥의 방아쇠', fade(u, 2.4)); }
  }

  // ---------- 3. VGG ----------
  function kgrid(x, y, n, cs, o) { o = o || {}; const op = o.op ?? 1; for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) { const hi = o.hi && o.hi(r, q);
    el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 2, height: cs - 2, rx: 2, fill: hi ? (o.hc || ACC) : o.fill || SOFT, opacity: op * (hi ? 0.85 : 1), stroke: GRID, 'stroke-width': 1 }); } }
  function vblocks(c, all) { const RES = [224, 112, 56, 28, 14, 7], CHS = [3, 64, 128, 256, 512, 512];
    RES.forEach((r, i) => { const x = 90 + i * 140, s = 14 + Math.sqrt(r) * 7, f = all ? 1 : E(c.u, 0.2 + i * 0.3, 0.5 + i * 0.3);
      if (f <= 0) return; fmap(x, 190, s * (0.4 + 0.6 * f), Math.min(5, 1 + i), { label: `${r}`, top: i ? `${CHS[i]}ch` : 'RGB', op: f, tc: i ? ACC : MUT });
      if (i) mono(x, 305, i < 3 ? '3×3 ×2' : '3×3 ×3', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: f }); });
  }
  function s3(t, c) { const { k, u } = c; timeline(2);
    if (k === 0) { [[11, 'AlexNet 11×11', 120], [5, '5×5', 330]].forEach(([n, s, x], i) => { const cs = n === 11 ? 12 : 20;
        kgrid(x - n * cs / 2, 120, n, cs, { op: fade(u, 0.2 + i * 0.3), fill: SOFT }); tx(x, 112, s, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.3) });
        cross(x, 120 + n * cs / 2, 22, pop(u, 1.2 + i * 0.2)); });
      kgrid(560 - 45, 140, 3, 30, { hi: () => true, op: pop(u, 1.4) }); tx(560, 128, '3×3 만', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      note(680, 170, '커널은 3×3 하나,', fade(u, 1.9)); note(680, 200, '대신 깊게 쌓는다', fade(u, 2.2), { fill: ACC }); return; }
    if (k === 1) { mono(80, 90, 'def vgg_block(in_ch, out_ch, n_convs):', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      const parts = [['3×3 conv', ACC], ['ReLU', GOOD], ['3×3 conv', ACC], ['ReLU', GOOD], ['MaxPool', INFO]];
      parts.forEach(([s, col], i) => { const x = 140 + i * 140; card(x, 190, 110, 54, { rx: 8, stroke: col, text: s, fs: 15, s: pop(u, 0.6 + i * 0.25) }); if (i) grow(x - 125, 190, x - 57, 190, E(u, 0.7 + i * 0.25, 0.9 + i * 0.25), MUT); });
      el('path', { d: 'M85,240 L85,252 L615,252 L615,240', fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.9) });
      tx(350, 276, '× n_convs', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.9) });
      note(80, 340, '망 = 이 블록의 나열 — 설계가 "규칙" 이 된다', fade(u, 2.3)); return; }
    if (k === 2 || k === 5) { // 수용 영역: 입력 7×7 → 층1 5×5 → 층2 1칸
      const cs = 26, X0 = 70, Y0 = 110, X1 = 330, X2 = 560, a0 = k === 2 ? E(u, 0.3, 0.8) : 1, a1 = k === 2 ? E(u, 1.0, 1.5) : 1;
      kgrid(X0, Y0, 7, cs, { hi: (r, q) => a1 > 0.5 && r >= 1 && r <= 5 && q >= 1 && q <= 5, hc: WARN });
      kgrid(X1, Y0 + cs, 5, cs, { hi: (r, q) => a0 > 0.5 && r >= 1 && r <= 3 && q >= 1 && q <= 3 });
      kgrid(X2, Y0 + 3 * cs, 1, cs, { hi: () => true });
      tx(X0 + 3.5 * cs, Y0 - 12, '입력', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); tx(X1 + 2.5 * cs, Y0 + cs - 12, '3×3 한 번 뒤', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); tx(X2 + cs / 2, Y0 + 3 * cs - 12, '두 번 뒤', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      if (a0 > 0) { grow(X2 - 4, Y0 + 3.5 * cs, X1 + 5 * cs + 4, Y0 + 3.5 * cs, a0, ACC, { plain: true }); }
      if (a1 > 0) { grow(X1 - 4, Y0 + 3.5 * cs, X0 + 7 * cs + 4, Y0 + 3.5 * cs, a1, WARN, { plain: true }); }
      if (k === 2) { note(70, 340, '3×3 두 번 = 5×5 수용 영역', fade(u, 1.8), { fill: WARN }); sub(70, 370, 'padding=1 이라 conv 로는 해상도가 줄지 않는다', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 14.5 }); return; }
      // k===5: 파라미터 정산
      tx(650, 110, '같은 5×5 시야의 값', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      [['5×5 한 번', 25, OFF, '25C²'], ['3×3 두 번', 18, ACC, '18C²']].forEach(([nm, v, col, s], i) => { tx(650, 150 + i * 50, nm, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
        R.hbar(650, 160 + i * 50, 200, v, 25, { u: E(u, 0.5 + i * 0.4, 1.0 + i * 0.4), col, text: s }); });
      pill(750, 275, '파라미터 −28%', GOOD, pop(u, 1.6), { fs: 15 });
      pill(750, 320, 'ReLU 1회 → 2회', ACC, pop(u, 2.0), { fs: 15 }); note(70, 370, '"작게 여러 번" 의 승리', fade(u, 2.3)); return; }
    if (k === 3) { const g = E(u, 0.4, 1.4); fmap(220, 190, 160 - 70 * g, 3, { label: g > 0.5 ? '112×112' : '224×224', top: '64ch' });
      grow(330, 190, 420, 190, E(u, 0.2, 0.5), INFO); tx(375, 175, 'MaxPool(2)', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      kgrid(470, 140, 2, 50, { hi: (r, q) => r === 0 && q === 1, op: fade(u, 0.6), hc: INFO }); grow(580, 190, 640, 190, E(u, 1.0, 1.3), MUT); kgrid(660, 165, 1, 50, { hi: () => true, hc: INFO, op: fade(u, 1.2) });
      sub(560, 260, '2×2 칸에서 가장 큰 값 하나', fade(u, 1.3), { 'font-size': 14.5 });
      mono(470, 330, `블록 1 파라미터 ${fmt(tween(0, 38720, u, 1.0))}`, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); sub(560, 362, '≈ 4만 — 3×3 ×2 + Pool', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { vblocks(c, false);
      note(90, 360, `conv 13층 · ${fmt(tween(0, 14714688, u, 2.0))} 파라미터 (≈1,470만)`, fade(u, 2.0)); return; }
    if (k === 6) { const ax = R.axes(110, 90, 420, 200, { x: [0, 30], y: [0, 1], xt: [0, 8, 16, 19, 30], xl: '층 수' });
      [[8, 'AlexNet', OFF], [16, 'VGG-16', ACC], [19, 'VGG-19', ACC]].forEach(([d, nm, col], i) => { const f = pop(u, 0.3 + i * 0.3); el('circle', { cx: ax.X(d), cy: ax.Y(0.55), r: 9 * f, fill: col }); tx(ax.X(d) + (d === 16 ? -6 : d === 19 ? 6 : 0), ax.Y(0.55) + (d === 19 ? 32 : -18), nm, { 'font-size': 14, 'font-weight': 700, 'text-anchor': d === 8 ? 'middle' : 'end', opacity: f }); });
      const w = E(u, 1.2, 1.6); el('rect', { x: ax.X(20.2), y: ax.Y(1), width: 16 * w, height: 200, fill: BAD, opacity: 0.85 });
      tx(ax.X(21.6), ax.Y(0.75), '19층의 벽', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      sub(ax.X(21.6), ax.Y(0.3), '그냥 쌓으면 기울기 소실', fade(u, 1.8), { 'font-size': 14, 'text-anchor': 'start' });
      card(760, 130, 250, 54, { rx: 10, stroke: INK, text: 'top-5 오류 7.3%', fs: 17, mono: true, s: pop(u, 0.5) });
      tx(660, 210, '파라미터 1.38억', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 1.9) });
      R.hbar(660, 222, 200, 123642856, 138357544, { u: E(u, 2.0, 2.4), col: WARN, text: 'FC 89%', h: 16 });
      sub(760, 280, 'FC 4096 ×2 가 비대', fade(u, 2.3), { 'font-size': 14.5 }); }
  }

  // ---------- 4. ResNet ----------
  const DC = { x: 700, y: 82, w: 170 };
  function depthChart(c) { const rows = c.beat.depthChart ? c.beat.depthChart.rows : [], prevN = c.prev && c.prev.depthChart ? c.prev.depthChart.rows.length : 0;
    tx(DC.x - 10, DC.y - 14, 'CIFAR-10 오류율', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const y = DC.y + i * 40, f = i < prevN ? 1 : E(c.u, 0.3 + (i - prevN) * 0.4, 0.9 + (i - prevN) * 0.4); if (f <= 0) return;
      tx(DC.x - 10, y + 14, r.name.replace('층', ''), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: r.kind === 'res' ? ACC : MUT, opacity: f });
      R.hbar(DC.x, y, DC.w, r.err, 15, { u: f, col: r.bad ? BAD : r.kind === 'res' ? ACC : OFF, text: `${r.err}%` }); }); }
  // 블록 그림: x 입력 → F(x) 상자 → ⊕ → 출력, 위로 지름길 호
  const BK = { x: 60, xF: 150, wF: 300, xP: 500, y: 250 };
  function block(c, o) { o = o || {}; const y = BK.y;
    tx(BK.x - 6, y + 6, 'x', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: o.op ?? 1 });
    grow(BK.x + 10, y, BK.xF - 4, y, o.a ?? 1, MUT);
    el('rect', { x: BK.xF, y: y - 40, width: BK.wF, height: 80, rx: 10, fill: o.fill || PANEL, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': o.parts ? null : '6 5', opacity: o.a ?? 1 });
    if (!o.parts) tx(BK.xF + BK.wF / 2, y + 6, 'F(x)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', opacity: o.a ?? 1 });
    grow(BK.xF + BK.wF + 2, y, BK.xP - 18, y, o.a ?? 1, MUT);
    const sk = o.skip ?? 1; if (sk > 0) { el('path', { d: `M${BK.x + 14},${y - 6} C${BK.x + 40},${y - 140} ${BK.xP - 30},${y - 140} ${BK.xP - 4},${y - 18}`, fill: 'none', stroke: ACC, 'stroke-width': 3.5, 'stroke-dasharray': 600, 'stroke-dashoffset': 600 * (1 - sk) });
      tx((BK.x + BK.xP) / 2, y - 122, o.skipLbl || '+ x  (지름길)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: sk }); }
    el('circle', { cx: BK.xP, cy: y, r: 16, fill: PANEL, stroke: o.plus ? ACC : INK, 'stroke-width': 2.5, opacity: o.a ?? 1 });
    tx(BK.xP, y + 6, '+', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: o.a ?? 1, fill: o.plus ? ACC : INK });
    if (o.out) { grow(BK.xP + 18, y, BK.xP + 50, y, o.out, MUT); mono(BK.xP + 58, y + 6, 'H(x)', { 'font-size': 16, 'font-weight': 800, opacity: o.out }); } }
  const PARTS = [['conv 3×3', ACC], ['BN+ReLU', INFO], ['conv 3×3', ACC], ['BN', INFO]];
  function parts(f) { PARTS.forEach(([s, col], i) => { const x = BK.xF + 40 + i * 73; card(x, BK.y, 66, 46, { rx: 6, stroke: col, text: s.replace('+', '\n+'), fs: 13.5, s: f(i) }); }); }
  function s4(t, c) { const { k, u } = c; timeline(3); depthChart(c);
    if (k === 0) { // 20층 vs 56층 쌓기
      [[20, 90, 'plain-20'], [56, 300, 'plain-56']].forEach(([n, x, nm], j) => { for (let i = 0; i < n; i++) { const f = E(u, 0.2 + j * 0.6 + i * 0.012, 0.4 + j * 0.6 + i * 0.012);
          el('rect', { x, y: 330 - i * 4.4, width: 150, height: 3.2, rx: 1, fill: j ? BAD : OFF, opacity: f }); }
        tx(x + 75, 356, nm, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4 + j * 0.6) }); });
      note(480, 300, '더 깊은 쪽이', fade(u, 1.6), { fill: BAD }); note(480, 326, '학습 오차부터 더 나쁘다', fade(u, 1.8), { fill: BAD });
      sub(480, 360, '과적합 ✗ → 최적화 실패 (degradation)', fade(u, 2.1), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    if (k === 1) { block(c, { a: E(u, 0.2, 0.7), skip: E(u, 0.9, 1.6), out: E(u, 1.6, 2.0) });
      mono(70, 90, 'H(x) = F(x) + x', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      sub(70, 370, '블록은 잔차 F 만 배운다 — x 는 그대로 더해진다', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    if (k === 2) { block(c, { parts: true }); parts((i) => pop(u, 0.3 + i * 0.35));
      tx(BK.xF + BK.wF / 2, BK.y - 54, 'F(x) 경로', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(70, 360, 'bias=False — 뒤따르는 BN 이 평행이동을 맡는다', fade(u, 1.9), { 'text-anchor': 'start', 'font-size': 14.5 });
      mono(70, 390, '블록당 73,984 (64채널 기준)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { block(c, { parts: true, skip: E(u, 0.3, 1.0), skipLbl: 'nn.Identity()  · 파라미터 0' }); parts(() => 1);
      card(275, 370, 360, 40, { rx: 8, stroke: WARN, dash: '6 4', text: '모양이 다를 때만 1×1 conv + BN', fs: 14.5, s: pop(u, 1.5) }); return; }
    if (k === 4) { block(c, { parts: true }); parts(() => 1);
      const g1 = E(u, 0.3, 1.2), g2 = E(u, 1.0, 2.2);
      if (g1 < 1) R.dot([[BK.x + 14, BK.y - 6], [140, BK.y - 110], [380, BK.y - 110], [BK.xP - 22, BK.y - 30]], g1, ACC, 8); else el('circle', { cx: BK.xP - 22, cy: BK.y - 30, r: 8, fill: ACC });
      if (g2 < 1) R.dot([[BK.x + 10, BK.y], [BK.xP - 30, BK.y]], g2, WARN, 8); else el('circle', { cx: BK.xP - 30, cy: BK.y, r: 8, fill: WARN });
      mono(70, 90, 'residual = self.shortcut(x)', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      mono(70, 380, 'out = bn2(conv2(relu(bn1(conv1(x)))))', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
      sub(560, 330, '아직 더하기 전', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 5) { block(c, { parts: true, plus: true, out: E(u, 1.2, 1.7) }); parts(() => 1);
      el('circle', { cx: BK.xP, cy: BK.y, r: 16 + 10 * Math.sin(Math.PI * seg(u, 0.6, 1.2)), fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: 1 - seg(u, 1.0, 1.4) });
      mono(70, 90, 'out = out + residual', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      sub(70, 370, '덧셈 하나 — 순전파는 쉬워지고 역전파엔 지름길', fade(u, 2.0), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    if (k === 6) { const z1 = E(u, 0.6, 1.0), z2 = E(u, 1.05, 1.5); block(c, { parts: true, fill: z2 > 0.5 ? SOFT : PANEL, out: 1 });
      if (z1 < 1) parts(() => 1 - z1); else PARTS.forEach((p, i) => card(BK.xF + 40 + i * 73, BK.y, 66, 46, { rx: 6, stroke: OFF, text: 'w→0', fs: 13.5, color: MUT, s: 0.4 + 0.6 * z2, op: z2 }));
      mono(70, 90, 'F = H − x', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      mono(BK.xP + 58, BK.y + 30, '= x', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) });
      sub(70, 370, '필요 없는 층은 F→0 — 공짜 항등', fade(u, 1.9), { 'text-anchor': 'start', 'font-size': 15 });
      note(600, 370, 'plain 은 깊을수록 나쁘고, ResNet 은 좋아진다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 7) { // 기울기 고속도로 (예시: 층마다 ×0.8)
      const D = [0, 20, 40, 60, 80, 100, 120, 152], ax = { X: (i) => 120 + i * 52 };
      tx(70, 92, '역전파 기울기 크기 (예시: 층마다 ×0.8)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      [['plain', (d) => Math.pow(0.8, d), BAD, 200], ['ResNet', () => 1, ACC, 340]].forEach(([nm, f, col, base], j) => {
        tx(70, base - 30, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + j * 0.9) });
        D.forEach((d, i) => { const g = E(u, 0.4 + j * 0.9 + i * 0.08, 0.6 + j * 0.9 + i * 0.08), h = Math.max(1.5, 70 * f(d)) * g;
          el('rect', { x: ax.X(i) - 14 + 40, y: base - h, width: 28, height: h, rx: 3, fill: col, opacity: g ? 1 : 0 });
          if (j === 1) mono(ax.X(i) + 40, base + 20, `L${d === 0 ? 1 : d}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: g }); }); });
      mono(400, 226, '0.8¹⁵² ≈ 0', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      mono(70, 400, '∂H/∂x = ∂F/∂x + 1', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      card(800, 340, 230, 56, { rx: 10, stroke: GOOD, fill: GOODBG, text: 'ResNet-152 top-5 3.57%\n사람(~5%) 추월', fs: 14.5, color: GOOD, s: pop(u, 2.2) }); }
  }

  // ---------- 5. 백본 선택 ----------
  const ZOO = [['AlexNet', '2012', 61.1, '8층'], ['VGG-16', '2014', 138.4, '16층'], ['ResNet-50', '2015', 25.6, '50층'], ['EfficientNet-B0', '2019', 5.3, ''], ['ViT-B/16', '2020', 86.6, '']];
  const STG = [['conv1', 9408], ['layer1', 215808], ['layer2', 1219584], ['layer3', 7098368], ['layer4', 14964736]];
  function zoo(c, nBars, pBars) { const { k, u } = c;
    ZOO.forEach(([nm, yr, p, d], i) => { const y = 92 + i * 52, f = k === 2 ? pop(u, 0.3 + i * 0.25) : 1;
      card(150, y, 190, 40, { rx: 8, stroke: k >= 2 ? INK : OFF, dash: k >= 2 ? null : '6 5', s: f, text: k >= 2 ? `${nm}` : '', fs: 15 });
      if (k >= 2) mono(262, y + 5, yr, { 'font-size': 13.5, fill: MUT, opacity: f });
      if (i < nBars) { const a = i < pBars ? 1 : E(u, 0.4 + (i - pBars) * 0.3, 0.9 + (i - pBars) * 0.3);
        R.hbar(310, y - 10, 300, p, 140, { u: a, col: i === 1 ? WARN : i === 3 ? GOOD : ACC, text: `${p}M`, h: 20 });
        if (d) mono(700, y + 6, d, { 'font-size': 14, fill: MUT, opacity: a }); } }); }
  function backbone(c, st) { // st: 'thaw' | 'frozen' ; fc 상태 'old' | 'new'
    const { k, u } = c, x = 90;
    STG.forEach(([nm], i) => { const y = 370 - i * 50; card(x + 60, y, 140, 40, { rx: 8, stroke: st.frozen > 0.5 ? INFO : ACC, fill: st.frozen > 0.5 ? INFOBG : PANEL, text: nm, fs: 15 });
      if (st.frozen > 0) lock(x + 150, y, true, INFO, st.frozen); });
    const fy = 120;
    if (st.fc === 'old' || st.swap < 1) card(x + 60 - 60 * (st.swap || 0), fy, 140, 40, { rx: 8, stroke: st.frozen > 0.5 ? INFO : WARN, fill: st.frozen > 0.5 ? INFOBG : PANEL, text: 'fc 2048→1000', fs: 14, mono: true, op: 1 - (st.swap || 0) });
    if (st.swap > 0) card(x + 60 + 200 * (1 - st.swap), fy, 140, 40, { rx: 8, stroke: GOOD, fill: GOODBG, text: 'fc 2048→5', fs: 14, mono: true, color: GOOD, sw: 2.5 }); }
  function s5(t, c) { const { k, u } = c; timeline(4);
    if (k <= 4) { const NB = [0, 0, 1, 2, 5];
      zoo(c, NB[k], k ? NB[k - 1] : 0);
      if (k === 0) { mono(320, 110, 'from torchvision import models', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
        card(560, 220, 200, 50, { rx: 10, stroke: OFF, text: '직접 설계', fs: 16, color: MUT, s: pop(u, 1.0) }); cross(560, 220, 18, pop(u, 1.5));
        note(470, 300, '여기부터는 짓는 코드가 아니라 고르는 코드', fade(u, 2.0)); }
      if (k === 1) { mono(320, 110, 'Σ p.numel() / 1e6  →  M', { 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
        const ax = R.axes(310, 300, 300, 0.01, { x: [0, 140], y: [0, 1], xt: [0, 50, 100, 140] }); mono(640, 325, 'M', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
        sub(460, 370, '백본 비교의 공통 척도', fade(u, 1.8), { 'font-size': 15 }); }
      if (k === 2) sub(460, 370, 'weights="DEFAULT" — 사전학습 가중치까지 한 줄', fade(u, 1.8), { 'font-size': 15 });
      if (k === 3) note(320, 370, 'VGG-16: 16층인데 138.4M — FC 가 무게 대부분', fade(u, 1.6), { fill: WARN });
      if (k === 4) { note(320, 370, 'ResNet-50 은 50층인데 25.6M — 깊이 ≠ 무게', fade(u, 1.6));
        [['BatchNorm 표준화', INFO], ['EfficientNet 1/8 파라미터', GOOD], ['ViT 16×16 패치 → Part Ⅳ', ACC]].forEach(([s, col], i) => pill(840, 120 + i * 60, s, col, pop(u, 1.9 + i * 0.2), { fs: 14 })); }
      return; }
    // k 5~8: ResNet-50 하나를 골라 전이학습 준비
    const fr = k === 5 ? 0 : k === 6 ? E(u, 0.3, 1.2) : 1, sw = k < 7 ? 0 : k === 7 ? E(u, 0.4, 1.4) : 1;
    tx(80, 72, 'backbone = resnet50(weights="DEFAULT")', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: k === 5 ? fade(u, 0.2) : 1 });
    if (k === 5) { STG.forEach(([nm], i) => card(150, 370 - i * 50, 140, 40, { rx: 8, stroke: ACC, text: nm, fs: 15, s: pop(u, 0.4 + i * 0.15) })); card(150, 120, 140, 40, { rx: 8, stroke: WARN, text: 'fc 2048→1000', fs: 14, mono: true, s: pop(u, 1.2) }); }
    else backbone(c, { frozen: fr, fc: sw > 0 ? 'new' : 'old', swap: sw });
    const tr = k === 5 ? 25557032 : k === 6 ? tween(25557032, 0, u, 1.2) : k === 7 ? tween(0, 10245, u, 1.2) : 10245;
    tx(470, 130, '학습 대상 파라미터', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    mono(470, 172, fmt(tr), { 'font-size': 30, 'font-weight': 800, fill: k >= 7 ? GOOD : k === 6 ? INFO : ACC });
    if (k === 5) sub(470, 220, 'ImageNet 특징을 내 문제의 출발점으로', fade(u, 1.6), { 'text-anchor': 'start', 'font-size': 15 });
    if (k === 6) { mono(470, 230, 'p.requires_grad = False', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) }); sub(470, 266, '역전파 비용이 거의 사라진다', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 15 }); }
    if (k === 7) { mono(470, 230, 'backbone.fc = nn.Linear(2048, 5)', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); sub(470, 266, '불량 5종 — 새 층만 requires_grad=True', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 15 }); }
    if (k === 8) { tx(470, 240, '전체 23,518,277 중', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      el('rect', { x: 470, y: 256, width: 420, height: 22, rx: 4, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5, opacity: fade(u, 0.5) });
      el('rect', { x: 470, y: 256, width: 3 * fade(u, 1.0), height: 22, fill: GOOD });
      mono(470, 302, '0.04% 만 학습', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      note(470, 350, '수천 장으로도 과적합 없이 —', fade(u, 1.8)); note(470, 378, '백본은 고르는 것, 설계하는 것이 아니다', fade(u, 2.2), { fill: ACC }); }
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: 'LeNet-5(1998) 이후 CNN이 14년간 주류가 되지 못한 이유는?',
      o: ['대규모 라벨 데이터·GPU 같은 재료가 없어서', 'conv-pool 구조 자체가 틀려서', '파라미터가 너무 많아 학습할 수 없어서'], a: 0,
      why: 'conv → pool 반복 → FC 문법은 1998년에 이미 완성됐고 파라미터도 약 6만 개였다. 부족했던 건 데이터·GPU, 그리고 죽지 않는 활성화였다.' },
    { q: 'AlexNet이 top-5 오류율을 26.2%에서 15.3%로 낮춘 핵심은?',
      o: ['완전히 새로운 층 구조', 'GPU·ReLU·드롭아웃·데이터 증강 같은 학습 공학', '3×3 커널만 깊게 쌓은 설계'], a: 1,
      why: '구조는 LeNet의 확장판이다. GPU 2장, tanh 대신 ReLU, Dropout 0.5, 크롭·반전 증강이 승부를 갈랐다. 3×3만 깊게 쌓은 것은 VGG다.' },
    { q: 'VGG가 5×5 한 번 대신 3×3 두 번을 쓰는 이유는?',
      o: ['수용 영역이 더 넓어져서', '파라미터가 늘어 모델이 커져서', '같은 시야에 파라미터는 28% 적고 ReLU가 하나 더 들어가서'], a: 2,
      why: '3×3 두 번은 5×5 한 번과 수용 영역이 같지만 파라미터는 18C² 대 25C²로 28% 싸고, 사이에 비선형이 한 번 더 끼어 표현력은 오히려 커진다.' },
    { q: '56층 plain 망이 20층보다 학습 오차부터 나쁜 문제에 대한 ResNet의 처방은?',
      o: ['드롭아웃을 더 강하게 건다', '블록 출력을 H(x) = F(x) + x 로 해서 입력을 그대로 더한다', '19층 이하로만 쌓는다'], a: 1,
      why: '과적합이 아니라 최적화 실패라서, 층이 잔차 F만 배우게 하고 +x 경로로 기울기가 감쇠 없이 흐르게 했다(dH/dx = dF/dx + 1). 결과는 152층 학습 성공이다.' },
    { q: '이 장이 내리는 실무의 결론은?',
      o: ['검증된 백본을 골라 전이학습한다', '문제마다 백본을 새로 설계한다', '깊을수록 무거우니 얕은 모델을 쓴다'], a: 0,
      why: '백본은 고르는 것이지 설계하는 것이 아니다. ResNet-50은 50층인데 25.6M으로 VGG-16(138M)보다 가볍다 — 깊이와 무게는 비례하지 않는다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    'LeNet-5가 1998년에 conv와 pool 구조를 만들었지만, 데이터와 GPU가 없어 퍼지지 못했다.',
    'AlexNet은 GPU, ReLU, 드롭아웃, 증강을 더해 top-5 오류율을 26%에서 15%로 낮췄다.',
    'VGG는 3×3 커널만 깊게 쌓아 표준이 됐지만, 19층에서 학습이 막혔다.',
    'ResNet은 입력 x를 그대로 더해 152층을 학습시켰다. 실무에선 이런 검증된 백본을 골라 쓴다.',
  ];
  const review = [
    { q: 'plain CNN을 더 깊게 쌓았더니 얕은 버전보다 학습 오차부터 높다. 맞는 판단과 대응은?',
      o: ['과적합이니 드롭아웃을 더 건다', '최적화 실패이니 skip 경로를 둔다', '데이터 부족이니 증강을 더 늘린다'], a: 1,
      why: '과적합이라면 학습 오차는 낮아야 한다. 학습 오차부터 나쁘면 최적화 실패이고, +x 경로가 기울기를 그대로 흘려 이를 푼다.' },
    { q: 'AlexNet의 ReLU와 ResNet의 skip connection이 공통으로 풀려던 문제는?',
      o: ['입력 이미지 해상도가 낮은 문제', 'FC층 파라미터가 많은 문제', '깊어질수록 기울기가 약해지는 문제'], a: 2,
      why: 'ReLU는 양수 구간 기울기 1로, ResNet은 기울기 1인 +x 경로로 신호가 층을 거슬러 살아남게 했다. 둘 다 깊은 망을 학습 가능하게 만든 장치다.' },
    { q: 'VGG처럼 깊이만 늘리는 방식이 벽에 부딪힌 뒤, EfficientNet이 택한 방향은?',
      o: ['깊이, 너비, 해상도를 한 계수로 함께 키운다', 'skip connection을 빼고 더 깊게 쌓는다', '커널을 키워 층 수를 줄인다'], a: 0,
      why: 'EfficientNet은 세 축을 하나의 복합 계수로 같이 늘려 같은 정확도를 1/8 파라미터로 냈다. 한 축만 키우는 것보다 효율이 좋다.' },
  ];

  RA.page({ title: 'CNN 10년 — 특징맵과 부품의 진화', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
