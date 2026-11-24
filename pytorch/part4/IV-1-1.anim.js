/* IV-1-1 CIFAR-10 CNN 분류기 (캡스톤) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 모양·파라미터 수·배치 수·seed 42 의 randperm 값은 torch 2.15 CPU 로 코드를 다시 돌린 값이다.
 *       학습 곡선·혼동행렬·개선 정확도·labels[:8] 은 페이지의 예시 값이다(그림에 "예시" 로 적는다). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const PAL = [ACC, INFO, GOOD, WARN, BAD];
  const CLASSES = ['plane', 'car', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck'];

  // 8×8 칸으로 그린 "사진" (CIFAR 32×32 를 줄여 그린 것). o.flip 0→1 이면 좌우가 뒤집힌다
  function photo(x, y, sz, seed, o) { o = o || {}; const n = 8, cs = sz / n, op = o.op ?? 1; if (op <= 0) return;
    const fl = o.flip ?? 0, sx = Math.cos(fl * Math.PI), cx = x + sz / 2;
    const g = el('g', { transform: `translate(${cx} 0) scale(${Math.abs(sx) < 0.04 ? 0.04 : sx} 1) translate(${-cx} 0)`, opacity: op });
    const bg = o.mono || PAL[seed % 5], fgc = o.mono || PAL[(seed + 2) % 5], ox = (seed * 7) % 3 - 1, oy = (seed * 3) % 2;
    el('rect', { x, y, width: sz, height: sz, rx: 3, fill: PANEL }, g);
    for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) { const d = Math.hypot(q - 3.5 - ox, (r - 4 - oy) * 1.2), obj = d < 2.6;
      el('rect', { x: x + q * cs + 0.5, y: y + r * cs + 0.5, width: cs - 1, height: cs - 1, fill: obj ? fgc : bg, opacity: obj ? 0.5 + 0.45 * hsh(seed * 64 + r * 8 + q) : 0.1 + 0.25 * hsh(seed * 91 + r * 8 + q) }, g); }
    el('rect', { x, y, width: sz, height: sz, rx: 3, fill: 'none', stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5 }, g); }

  // 위쪽 프로젝트 길잡이: 데이터 → 모델 → 학습 → 분석
  const PIPE = ['데이터', '모델', '학습', '분석'];
  function strip(active) { PIPE.forEach((s, i) => { const x = 646 + i * 80, on = i === active, done = i < active || active > 3;
    if (i) el('line', { x1: x - 46, y1: 22, x2: x - 34, y2: 22, stroke: done || on ? ACC : GRID, 'stroke-width': 2 });
    card(x, 22, 68, 26, { rx: 13, text: s, fs: 13.5, fw: 700, fill: on ? ACC : done ? ACCBG : PANEL, stroke: on || done ? ACC : GRID, color: on ? PANEL : done ? ACC : MUT, sw: 1.5 }); }); }

  // ---------- 1. 데이터 파이프라인 ----------
  const ST = [250, 440, 630, 820];
  function stage(cx, cy, title, o) { o = o || {};
    card(cx, cy, 160, 124, { rx: 10, fill: o.off ? SOFT : PANEL, stroke: o.off ? GRID : o.col || INK, sw: o.off ? 1.5 : 2, dash: o.off ? '6 5' : null, s: o.s, op: o.op });
    mono(cx, cy - 44, title, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.off ? MUT : INK, opacity: o.op ?? 1 }); }
  function tfRow(cy, kind, u, live) {      // kind 'train' | 'val'
    const tr = kind === 'train', ap = (i) => (live ? pop(u, 0.15 + i * 0.35) : 1);
    tx(30, cy - 6, tr ? 'train_tf' : 'val_tf', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: tr ? ACC : INFO });
    tx(30, cy + 18, tr ? '증강 O' : '증강 X', { 'font-size': 15, 'font-weight': 700, fill: tr ? ACC : INFO });
    const names = ['RandomCrop(32, 4)', 'HorizontalFlip', 'ToTensor', 'Normalize'];
    names.forEach((n, i) => { const off = !tr && i < 2; stage(ST[i], cy, off ? '— 없음 —' : n, { off, s: ap(i), col: tr ? ACC : INFO });
      if (i) grow(ST[i - 1] + 80, cy, ST[i] - 82, cy, live ? seg(u, 0.3 + i * 0.35, 0.6 + i * 0.35) : 1, MUT); });
    const t1 = live ? seg(u, 0.5, 2.4) : 1;
    // 1) RandomCrop: 4픽셀 덧댄 판 위에서 32×32 창이 움직인다
    if (tr) { const x0 = ST[0] - 40, y0 = cy - 30;
      el('rect', { x: x0, y: y0, width: 80, height: 80, rx: 3, fill: SOFT, stroke: MUT, 'stroke-dasharray': '3 3' });
      const ox = 8 + 7 * Math.sin(t1 * 6.3), oy = 8 + 7 * Math.cos(t1 * 4.1); photo(x0 + 8, y0 + 8, 64, 4, { op: 0.35 });
      el('rect', { x: x0 + ox, y: y0 + oy, width: 64, height: 64, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      // 2) Flip
      photo(ST[1] - 32, cy - 22, 64, 4, { flip: live ? E(u, 1.0, 1.8) : 1 }); }
    else { [0, 1].forEach((i) => { cross(ST[i], cy + 8, 13, live ? pop(u, 0.4 + i * 0.3) : 1); }); }
    // 3) ToTensor: 채널 3장
    [2, 1, 0].forEach((j) => { const x = ST[2] - 30 + j * 8, y = cy - 22 - j * 6; el('rect', { x, y, width: 48, height: 48, rx: 3, fill: [BAD, GOOD, INFO][j], opacity: 0.25, stroke: [BAD, GOOD, INFO][j], 'stroke-width': 1.5 }); });
    mono(ST[2], cy + 50, '[3, 32, 32]', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    // 4) Normalize: 0 을 가운데로 모은 분포
    const b = ST[3]; el('line', { x1: b - 56, y1: cy + 30, x2: b + 56, y2: cy + 30, stroke: MUT, 'stroke-width': 1.5 }); el('line', { x1: b, y1: cy - 26, x2: b, y2: cy + 34, stroke: GRID, 'stroke-width': 1.5 });
    const pts = []; for (let i = 0; i <= 24; i++) { const z = -2.4 + i * 0.2; pts.push([b + z * 22, cy + 30 - 52 * Math.exp(-z * z / 1.2)]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: tr ? ACC : INFO, 'stroke-width': 2.5 });
    mono(b, cy + 50, '(x − μ) / σ', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    if (live) dot([[ST[0] - 80, cy - 70], [ST[3] + 80, cy - 70]], seg(u, 0.4, 2.5), tr ? ACC : INFO, 6); }

  function s1(t, c) { const { k, u } = c; strip(0);
    if (k === 0) {   // 정규화 상수
      photo(40, 90, 150, 3); lbl(115, 270, '32 × 32 컬러 사진', fade(u, 0.2));
      const M = ['0.4914', '0.4822', '0.4465'], S = ['0.2470', '0.2435', '0.2616'], CH = ['R', 'G', 'B'], CC = [BAD, GOOD, INFO];
      CH.forEach((ch, i) => { const sp = E(u, 0.3 + i * 0.2, 1.2 + i * 0.2), x = lerp(65, 250 + i * 125, sp), y = lerp(115, 100, sp);
        photo(x, y, 100, 3, { mono: CC[i], op: 0.25 + 0.75 * sp });
        lbl(x + 50, y - 10, ch + ' 채널', sp, { fill: CC[i] });
        mono(x + 50, 228, 'mean ' + M[i], { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.3 + i * 0.2) });
        mono(x + 50, 252, 'std  ' + S[i], { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4 + i * 0.2) }); });
      card(480, 330, 520, 56, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 1.9) });
      mono(480, 336, "x' = (x − mean) / std   채널마다 따로", { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(480, 388, 'CIFAR-10 학습셋에서 잰 값이라 다른 데이터셋에 그대로 쓰지 않는다', fade(u, 2.3)); return; }
    if (k === 1 || k === 2) { tfRow(125, 'train', u, k === 1); if (k === 2) tfRow(300, 'val', u, true);
      if (k === 1) note(30, 300, '같은 사진도 에폭마다 다른 자리·방향으로 보인다', fade(u, 2.3), { fill: ACC });
      return; }
    if (k === 3) {   // 50,000 → 섞기 → 45k / 5k
      tx(60, 76, 'CIFAR-10 학습셋 50,000장', { 'font-size': 16, 'font-weight': 700 });
      mono(900, 76, 'idx = torch.randperm(50000)', { 'font-size': 14.5, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.3) });
      const W = 16.8, sh = E(u, 0.3, 1.3), sp = E(u, 1.5, 2.4);
      for (let i = 0; i < 50; i++) { const p = Math.floor(hsh(i * 3 + 1) * 50 * 1000) % 50, pos = (i * 37 + 11) % 50;   // 섞인 자리
        const x1 = 60 + i * W, x2 = 60 + pos * W, isVal = pos < 5;
        const xa = lerp(x1, x2, sh), ya = 92;
        const xb = isVal ? 60 + pos * W : 60 + (pos - 5) * W, yb = isVal ? 310 : 210;
        const x = lerp(xa, xb, sp), y = lerp(ya, yb, sp), col = sp > 0.5 ? (isVal ? INFO : ACC) : OFF;
        el('rect', { x: x + 1, y, width: W - 2, height: 40, rx: 2, fill: col, opacity: 0.35 + 0.5 * hsh(p + i) }); }
      mono(60, 280, 'train_set = Subset(full, idx[5000:])', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 2.2) });
      lbl(828, 236, '45,000', fade(u, 2.3), { fill: ACC, 'font-size': 18, class: 'mono', 'text-anchor': 'start' });
      mono(160, 336, 'val_set = Subset(val_full, idx[:5000])', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 2.3) });
      lbl(160, 380, '5,000', fade(u, 2.4), { fill: INFO, 'font-size': 18, class: 'mono', 'text-anchor': 'start' });
      sub(560, 380, '같은 인덱스로 나누되 val 쪽은 val_tf 를 붙인다', fade(u, 2.5), { 'text-anchor': 'start' }); return; }
    if (k === 4) {   // DataLoader 가 배치로 자른다
      const row = (y, col, label, bs, nb, last, shuf, a0) => {
        tx(40, y - 8, label, { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: col });
        tx(40, y + 16, `batch ${bs} · shuffle ${shuf ? 'O' : 'X'}`, { 'font-size': 14, fill: MUT });
        for (let i = 0; i < 7; i++) { const s = pop(u, a0 + i * 0.16), x = 270 + i * 82, isLast = i === 6;
          if (i === 5) { tx(x + 20, y + 6, '…', { 'font-size': 22, 'font-weight': 800, fill: MUT, opacity: s }); continue; }
          [2, 1, 0].forEach((j) => el('rect', { x: x + j * 5, y: y - 24 - j * 5, width: 56, height: 44, rx: 4, fill: PANEL, stroke: col, 'stroke-width': 1.8, opacity: s }));
          mono(x + 28, y + 4, isLast ? String(last) : String(bs), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: s });
          mono(x + 28, y + 42, isLast ? '#' + nb : '#' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); }
        mono(880, y + 4, `${nb} 배치`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, a0 + 1.2) }); };
      row(120, ACC, 'train_loader', 128, 352, 72, true, 0.2);
      row(290, INFO, 'val_loader', 256, 20, 136, false, 1.0);
      sub(480, 390, '마지막 배치는 남은 장수만 담는다 (45,000 − 351×128 = 72)', fade(u, 2.2)); return; }
    // k5: 배치 하나 확인
    for (let j = 5; j >= 0; j--) photo(60 + j * 14, 110 - j * 10, 120, [6, 9, 9, 4, 1, 1][j] + j);
    mono(60, 290, 'images.shape', { 'font-size': 15, fill: MUT });
    mono(60, 316, 'torch.Size([128, 3, 32, 32])', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
    const B = ['B', 'C', 'H', 'W'], V = ['128', '3', '32', '32'];
    B.forEach((b, i) => pill(90 + i * 74, 360, `${b} ${V[i]}`, i ? MUT : ACC, pop(u, 0.5 + i * 0.15), { mono: true, fs: 13.5 }));
    tx(440, 110, 'labels[:8]', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    const L = [6, 9, 9, 4, 1, 1, 2, 7];
    L.forEach((v, i) => { const x = 470 + i * 56, s = pop(u, 0.8 + i * 0.12);
      card(x, 150, 46, 40, { rx: 6, text: String(v), mono: true, fs: 17, s, stroke: ACC, color: ACC });
      tx(x, 196, CLASSES[v], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2 + i * 0.1) }); });
    sub(668, 228, '예시 값 · shuffle 이라 꺼낼 때마다 다르다', fade(u, 1.8));
    check(470, 300, 14, pop(u, 2.1)); note(496, 306, '모양과 라벨이 맞다 — 학습 전 점검 통과', fade(u, 2.2), { fill: GOOD }); }

  // ---------- 2. 모델 설계 ----------
  // 특징 맵 상자: 앞면 크기 = H, 깊이 = 채널. (cx, by) = 앞면 아래 가운데
  function vol(cx, by, Cc, H, o) { o = o || {}; const f = H * 3.2, d = 4 + Math.sqrt(Cc) * 5, dx = d * 0.75, dy = d * 0.5, col = o.col || ACC, op = o.op ?? 1, s = o.s ?? 1;
    if (s <= 0.01 || op <= 0.01) return; const g = G(cx, by, s, op);
    el('path', { d: `M${-f / 2},${-f} L${-f / 2 + dx},${-f - dy} L${f / 2 + dx},${-f - dy} L${f / 2},${-f} Z`, fill: col, opacity: 0.18, stroke: col, 'stroke-width': 1.5 }, g);
    el('path', { d: `M${f / 2},${-f} L${f / 2 + dx},${-f - dy} L${f / 2 + dx},${-dy} L${f / 2},0 Z`, fill: col, opacity: 0.32, stroke: col, 'stroke-width': 1.5 }, g);
    el('rect', { x: -f / 2, y: -f, width: f, height: f, fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
    el('rect', { x: -f / 2, y: -f, width: f, height: f, fill: col, opacity: 0.12 }, g);
    if (o.label !== false) mono(dx / 2, 24, `[${Cc},${H},${H}]`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: o.lc || INK }, g); }
  const CH = [{ x: 90, c: 3, h: 32 }, { x: 250, c: 32, h: 16 }, { x: 400, c: 64, h: 8 }, { x: 530, c: 128, h: 4 }], BY = 262, PAR = ['', '960', '18,624', '74,112'];
  function chain(k, u, live) { CH.forEach((v, i) => { const s = live ? pop(u, 0.2 + i * 0.4) : 1;
      vol(v.x, BY, v.c, v.h, { s, col: i ? ACC : MUT });
      if (i) { grow(CH[i - 1].x + CH[i - 1].h * 1.6 + 30, BY - 30, v.x - v.h * 1.6 - 10, BY - 30, live ? seg(u, 0.1 + i * 0.4, 0.4 + i * 0.4) : 1, MUT);
        mono(v.x + 10, BY + 46, PAR[i] + '개', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: live ? fade(u, 0.5 + i * 0.4) : 1 });
        tx((CH[i - 1].x + v.x) / 2 + 8, BY - 46, 'block' + i, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: live ? fade(u, 0.4 + i * 0.4) : 1 }); } }); }
  const FB = { x: 650, y0: 86, n: 40, h: 6 };
  function flatBar(op, drop, fromU) {
    for (let i = 0; i < FB.n; i++) { const y = FB.y0 + i * FB.h, gone = drop > 0 && hsh(i * 5 + 2) < 0.3;
      const sx = lerp(530 - 8 + (i % 4) * 4, FB.x, fromU), sy = lerp(BY - 13 + Math.floor(i / 10) * 3, y, fromU);
      el('rect', { x: sx - 7, y: sy, width: 14, height: FB.h - 1, fill: gone && drop > 0 ? OFF : ACC, opacity: (gone ? 1 - 0.6 * drop : 0.75) * op });
      if (gone && drop > 0.5) el('line', { x1: sx - 9, y1: sy + 2.5, x2: sx + 9, y2: sy + 2.5, stroke: BAD, 'stroke-width': 1.6, opacity: op }); }
    mono(FB.x, FB.y0 + FB.n * FB.h + 20, '[2048]', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op * fromU }); }
  function fcNodes(u, live, hot) { for (let i = 0; i < 10; i++) { const y = 84 + i * 26, s = live ? pop(u, 0.6 + i * 0.06) : 1;
      for (let j = 0; j < 5; j++) { const yb = FB.y0 + 20 + j * 50; el('line', { x1: FB.x + 8, y1: yb, x2: 812, y2: y, stroke: ACC, 'stroke-width': 0.8, opacity: 0.25 * (live ? fade(u, 0.3 + j * 0.1) : 1) }); }
      el('circle', { cx: 820, cy: y, r: 8 * s, fill: hot === i ? ACC : PANEL, stroke: ACC, 'stroke-width': 2 });
      tx(836, y + 5, CLASSES[i], { 'font-size': 13.5, fill: MUT, opacity: s }); } }
  function s2(t, c) { const { k, u } = c; strip(1);
    if (k === 0) {
      vol(150, 300, 3, 32, { s: pop(u, 0.2), col: MUT }); lbl(160, 350, '입력 이미지', fade(u, 0.4));
      card(600, 120, 460, 60, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s: pop(u, 0.5) });
      mono(390, 127, 'def conv_block(in_ch, out_ch):', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.6) });
      ['Conv', 'BN', 'ReLU', 'Pool'].forEach((s, i) => pill(450 + i * 92, 200, s, ACC, pop(u, 0.9 + i * 0.15), { fs: 14 }));
      ['conv_block(3, 32)', 'conv_block(32, 64)', 'conv_block(64, 128)'].forEach((s, i) => mono(400, 270 + i * 34, s, { 'font-size': 15, fill: ACC, opacity: fade(u, 1.6 + i * 0.25) }));
      note(640, 304, '같은 모양 세 번', fade(u, 2.3), { fill: MUT }); note(640, 330, '→ 한 곳만 고친다', fade(u, 2.4), { fill: MUT }); return; }
    if (k === 1) {   // 블록 한 개의 속
      const gx = [40, 300, 560], cs = 21, gy = 96;
      const grid = (x, val, op) => { for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) { const v = val(r, q);
        el('rect', { x: x + q * cs, y: gy + r * cs, width: cs - 2, height: cs - 2, rx: 2, fill: v < 0 ? BAD : v === 0 ? OFF : ACC, opacity: op * (v === 0 ? 0.35 : 0.2 + 0.6 * Math.abs(v)) }); } };
      const raw = (r, q) => Math.sin(r * 1.3 + q * 0.7) * 0.9;
      grid(gx[0], (r, q) => 0.3 + 0.5 * hsh(r * 8 + q), 1);
      const kp = Math.floor(E(u, 0.2, 1.4) * 35), kr = Math.floor(kp / 6), kq = kp % 6;
      el('rect', { x: gx[0] + kq * cs - 1, y: gy + kr * cs - 1, width: cs * 3, height: cs * 3, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
      mono(gx[0] + 84, gy - 14, '3×3, padding=1', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      grow(gx[0] + 176, gy + 84, gx[1] - 12, gy + 84, seg(u, 0.4, 0.9), MUT); tx((gx[0] + 176 + gx[1]) / 2, gy + 70, 'Conv+BN', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle' });
      grid(gx[1], raw, fade(u, 0.6));
      grow(gx[1] + 176, gy + 84, gx[2] - 12, gy + 84, seg(u, 1.2, 1.6), MUT); tx((gx[1] + 176 + gx[2]) / 2, gy + 70, 'ReLU', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      grid(gx[2], (r, q) => Math.max(0, raw(r, q)), fade(u, 1.4));
      grow(gx[2] + 176, gy + 84, 818, gy + 84, seg(u, 1.8, 2.2), MUT); tx(797, gy + 60, 'Pool(2)', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { let m = 0; for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) m = Math.max(m, raw(r * 2 + a, q * 2 + b));
        el('rect', { x: 826 + q * cs, y: gy + 42 + r * cs, width: cs - 2, height: cs - 2, rx: 2, fill: m <= 0 ? OFF : ACC, opacity: fade(u, 2.0) * (m <= 0 ? 0.35 : 0.2 + 0.6 * m) }); }
      ['H × W', 'H × W', 'H × W', 'H/2 × W/2'].forEach((s, i) => mono([128, 388, 648, 868][i], 300, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: i === 3 ? ACC : INK, opacity: fade(u, [0.2, 0.7, 1.5, 2.1][i]) }));
      sub(260, 340, '음수 칸 = 빨강, ReLU 뒤 0', fade(u, 1.5), { 'font-size': 14 });
      note(520, 360, 'padding=1 은 크기를 지키고, 줄이는 일은 MaxPool 만 한다', fade(u, 2.3)); return; }
    // k ≥ 2: 블록 세 개 사슬
    chain(k, u, k === 2);
    if (k === 2) { note(40, 360, '채널 3 → 32 → 64 → 128, 크기 32 → 16 → 8 → 4', fade(u, 1.9)); return; }
    const fu = k === 3 ? E(u, 0.2, 1.3) : 1;
    flatBar(1, k === 3 ? E(u, 1.6, 2.4) : 1, fu);
    tx(FB.x, 66, 'Flatten', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, k === 3 ? 0.3 : 0) });
    if (k === 3) { mono(700, 200, '128 × 4 × 4', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(700, 226, '= 2048', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      mono(700, 270, 'Dropout(0.3)', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.7) }); sub(760, 296, '학습 때 30% 를 끈다', fade(u, 1.9)); return; }
    const hot = k >= 5 ? 3 : null;
    fcNodes(u, k === 4, k === 6 ? 3 : null);
    if (k === 4) { mono(760, 380, 'Linear(2048, 10)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      mono(760, 404, '2048×10 + 10 = 20,490개', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); return; }
    // 두 덩어리 표시
    el('path', { d: 'M40,330 L40,342 L585,342 L585,330', fill: 'none', stroke: INK, 'stroke-width': 1.8 }); tx(312, 366, 'self.features', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle' });
    el('path', { d: 'M615,368 L615,380 L900,380 L900,368', fill: 'none', stroke: INK, 'stroke-width': 1.8 }); tx(758, 404, 'self.classifier', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle' });
    if (k === 5) { dot([[40, 220], [190, 220], [350, 230], [500, 240], [FB.x, 200], [812, 162]], seg(u, 0.2, 2.4), INK, 7); return; }
    // k6: 더미로 검증
    card(150, 60, 220, 34, { rx: 17, text: 'dummy [2, 3, 32, 32]', fs: 14.5, mono: true, stroke: INK, s: pop(u, 0.2) });
    dot([[40, 220], [190, 220], [350, 230], [500, 240], [FB.x, 200], [812, 162]], seg(u, 0.5, 1.8), INK, 7);
    card(420, 60, 230, 34, { rx: 17, text: 'torch.Size([2, 10])', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.9) }); check(552, 60, 10, pop(u, 2.1)); }

  // ---------- 3. 학습 루프 ----------
  function chart(c, live) { const b = c.beat.curve, p = c.prev && c.prev.curve;
    const ax = R.axes(560, 70, 360, 240, { x: [0, 31], y: [0.3, 1.0], xt: [1, 10, 20, 30], yt: [0.4, 0.6, 0.8, 1.0], grid: true, xl: 'epoch', yl: '정확도' });
    const n1 = b.epochs.length, n0 = p && p.epochs.length > 1 ? p.epochs.length : 1, f = live ? lerp(n0 - 1, n1 - 1, E(c.u, 0.2, 1.6)) : n1 - 1;
    const pt = (arr) => b.epochs.map((e, i) => [e, arr[i]]);
    const fr = n1 > 1 ? f / (n1 - 1) : 1;
    if (n1 > 1) { R.line(ax, pt(b.train), fr, ACC, { sw: 3 }); R.line(ax, pt(b.val), fr, INFO, { sw: 3, dash: '7 5' }); }
    b.epochs.forEach((e, i) => { if (i > f + 0.01) return; el('circle', { cx: ax.X(e), cy: ax.Y(b.train[i]), r: 4.5, fill: ACC }); el('circle', { cx: ax.X(e), cy: ax.Y(b.val[i]), r: 4.5, fill: INFO }); });
    const li = Math.min(n1 - 1, Math.floor(f + 0.001));
    mono(930, ax.Y(b.train[li]) - 10, 'train ' + b.train[li].toFixed(2), { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end' });
    mono(930, ax.Y(b.val[li]) + 24, 'val ' + b.val[li].toFixed(2), { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'end' });
    tx(560, 400, '예시 곡선', { 'font-size': 13.5, fill: MUT }); return ax; }
  function chipBox(x, y, o) { o = o || {}; const g = G(x, y, o.s ?? 1, o.op);
    el('rect', { x: -46, y: -46, width: 92, height: 92, rx: 8, fill: o.fill || SOFT, stroke: INK, 'stroke-width': 2.2 }, g);
    for (let i = 0; i < 5; i++) { const d = -32 + i * 16; [[d, -46, d, -56], [d, 46, d, 56], [-46, d, -56, d], [46, d, 56, d]].forEach(([a, b, c2, e]) => el('line', { x1: a, y1: b, x2: c2, y2: e, stroke: INK, 'stroke-width': 2 }, g)); }
    tx(0, 6, o.text || 'device', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono' }, g); }
  function modeBox(x, title, train, op) {
    card(x + 150, 150, 290, 190, { rx: 12, stroke: train ? ACC : INFO, sw: 2, op });
    tx(x + 20, 82, title, { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: train ? ACC : INFO, opacity: op });
    tx(x + 20, 116, 'Dropout', { 'font-size': 14, 'font-weight': 700, opacity: op });
    for (let i = 0; i < 6; i++) { const cx = x + 120 + i * 28, off = train && (i === 1 || i === 4);
      el('circle', { cx, cy: 111, r: 9, fill: off ? OFF : train ? ACC : INFO, opacity: op * (off ? 0.5 : 0.8) }); if (off) cross(cx, 111, 7, op); }
    tx(x + 20, 160, 'BatchNorm', { 'font-size': 14, 'font-weight': 700, opacity: op });
    tx(x + 120, 160, train ? '이 배치의 평균·분산' : '누적 평균·분산', { 'font-size': 14, fill: train ? ACC : INFO, opacity: op });
    tx(x + 20, 204, '결과', { 'font-size': 14, 'font-weight': 700, opacity: op });
    tx(x + 120, 204, train ? '부를 때마다 조금씩 다름' : '같은 입력 → 같은 답', { 'font-size': 14, fill: MUT, opacity: op }); }
  function cycle(cx, cy, r, u, live) { const A = [-90, 30, 150], names = ['① zero_grad', '② backward', '③ step'];
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3 });
    A.forEach((a, i) => { const x = cx + r * Math.cos(a * Math.PI / 180), y = cy + r * Math.sin(a * Math.PI / 180);
      card(x, y, 132, 34, { rx: 17, text: names[i], fs: 14.5, mono: true, fill: PANEL, stroke: ACC, color: ACC, s: live ? pop(u, 0.2 + i * 0.3) : 1 }); });
    const ph = live ? (u * 0.8) % 1 : 0.999; const a = (-90 + ph * 360) * Math.PI / 180;
    if (live) el('circle', { cx: cx + r * Math.cos(a), cy: cy + r * Math.sin(a), r: 7, fill: INK });
    mono(cx, cy - 4, 'loss =', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); mono(cx, cy + 18, 'criterion(model(x), y)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); return ph; }
  function s3(t, c) { const { k, u } = c; strip(2);
    if (k === 0) {
      chipBox(200, 210, { s: pop(u, 0.2), text: 'cuda/cpu' }); lbl(200, 296, 'device', fade(u, 0.3));
      const mv = E(u, 0.6, 1.4); vol(lerp(60, 200, mv), lerp(170, 236, mv), 32, 8, { s: lerp(1, 0.7, mv), label: false });
      if (u > 0.6) mono(110, 120, '.to(device)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      [['criterion', 'CrossEntropyLoss()'], ['optimizer', 'Adam(lr=1e-3)'], ['writer', 'SummaryWriter("runs/cifar_cnn")']].forEach(([a, b], i) => {
        const y = 120 + i * 70, s = pop(u, 1.1 + i * 0.35); card(640, y, 520, 50, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5, s });
        mono(400, y + 6, a + ' = ', { 'font-size': 15, 'font-weight': 700, opacity: s }); mono(520, y + 6, b, { 'font-size': 15, fill: ACC, opacity: s }); });
      note(400, 380, '모델과 데이터가 같은 device 에 있어야 한다', fade(u, 2.3), { fill: WARN }); return; }
    if (k === 1) {
      const sw = E(u, 0.3, 1.0); modeBox(30, 'model.train()', true, lerp(1, 0.45, sw)); modeBox(500, 'model.eval()', false, lerp(0.45, 1, sw));
      grow(345, 150, 475, 150, seg(u, 0.4, 1.0), INFO);
      card(480, 300, 600, 44, { rx: 22, fill: INFOBG, stroke: INFO, sw: 2, s: pop(u, 1.4) });
      mono(480, 306, '@torch.no_grad()  →  계산 그래프를 기록하지 않는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.5) });
      ['x', 'conv', 'fc', 'loss'].forEach((s, i) => { const x = 300 + i * 120; card(x, 372, 74, 30, { rx: 6, text: s, fs: 14, mono: true, stroke: OFF, color: OFF, dash: '4 4', op: fade(u, 1.8) });
        if (i) grow(x - 83, 372, x - 39, 372, fade(u, 1.9), OFF, { dash: '4 4', plain: true }); });
      cross(660, 372, 12, pop(u, 2.2)); return; }
    if (k === 2) {   // argmax → 맞은 수 (예시 배치 8장)
      const Y = [6, 9, 3, 4, 1, 5, 2, 7], P = [6, 9, 5, 4, 1, 3, 2, 7];
      tx(40, 66, 'pred = model(x).argmax(1)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      Y.forEach((y, i) => { const x0 = 60 + i * 108, s = clamp(E(u, 0.2, 1.6) * 8 - i);
        for (let j = 0; j < 10; j++) { const h = j === P[i] ? 70 : 8 + 40 * hsh(i * 10 + j); el('rect', { x: x0 + j * 8, y: 210 - h * s, width: 6, height: h * s, fill: j === P[i] ? ACC : OFF }); }
        mono(x0 + 38, 236, CLASSES[P[i]], { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: s });
        mono(x0 + 38, 262, CLASSES[y], { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s });
        const ok = y === P[i]; (ok ? check : cross)(x0 + 38, 292, 10, pop(u, 1.0 + i * 0.12)); });
      const n = Math.round(clamp(E(u, 1.0, 2.2) * 8)), ok = Y.slice(0, n).filter((y, i) => y === P[i]).length;
      mono(480, 356, `correct ${ok} / total ${n}`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
      sub(480, 390, '예시 배치 8장 · 위 줄 = 예측, 아래 줄 = 정답 · 끝나면 correct / total 을 돌려준다', fade(u, 2.0)); return; }
    const ax = chart(c, true);
    if (k === 3) { const ep = 1; card(250, 150, 220, 100, { rx: 12, stroke: ACC, sw: 2, s: pop(u, 0.2) });
      mono(250, 146, 'epoch ' + ep + ' / 30', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      mono(250, 178, 'best_val = 0.0', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
      card(250, 290, 300, 46, { rx: 23, text: 'model.train()  ← 에폭마다', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.0) });
      sub(250, 340, 'evaluate() 가 eval 로 바꿔 두기 때문', fade(u, 1.6)); return; }
    if (k === 4) { const ph = cycle(250, 210, 120, u, true);
      const g = ph < 0.33 ? 0 : ph < 0.66 ? (ph - 0.33) / 0.33 : 1; mono(60, 380, 'grad', { 'font-size': 14, fill: MUT });
      el('rect', { x: 110, y: 368, width: 280, height: 14, rx: 4, fill: SOFT }); el('rect', { x: 110, y: 368, width: 280 * g, height: 14, rx: 4, fill: WARN }); return; }
    if (k === 5) { cycle(250, 180, 100, u, false);
      card(250, 330, 280, 40, { rx: 20, text: 'evaluate(val_loader) → val_acc', fs: 14, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.4) });
      ['acc/val', 'loss/train'].forEach((s, i) => fly(420, 330, 780 - i * 150, 340, seg(u, 1.0 + i * 0.4, 2.0 + i * 0.4), s, { mono: true, fill: i ? ACC : INFO }));
      sub(250, 380, 'TensorBoard 에 에폭마다 기록', fade(u, 1.6)); return; }
    // k6: best 만 저장
    const b = c.beat.curve; let best = 0; b.epochs.forEach((e, i) => { const s = pop(u, 0.2 + i * 0.25); if (b.val[i] > best) { best = b.val[i];
      el('path', { d: `M${ax.X(e)},${ax.Y(b.val[i]) - 18} l4,8 l9,1 l-7,6 l2,9 l-8,-5 l-8,5 l2,-9 l-7,-6 l9,-1 z`, fill: WARN, opacity: s }); } });
    const nb = b.epochs.length, bi = Math.min(nb - 1, Math.floor(E(u, 0.2, 2.0) * nb));
    card(250, 150, 260, 90, { rx: 12, stroke: WARN, sw: 2 });
    mono(250, 142, 'best_val = ' + b.val[bi].toFixed(2), { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
    mono(250, 172, 'epoch ' + b.epochs[bi] + ' → best.pt', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT });
    el('line', { x1: ax.X(30) + 12, y1: ax.Y(0.93), x2: ax.X(30) + 12, y2: ax.Y(0.83), stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 2.0) });
    note(60, 290, 'val 이 오를 때만 저장한다', fade(u, 1.0));
    note(60, 320, 'train 0.93 · val 0.83 : 벌어지기 시작', fade(u, 2.0), { fill: BAD });
    sub(250, 360, '곡선이 꺾이면 마지막 모델 ≠ 최고 모델', fade(u, 2.3)); }

  // ---------- 4. 결과 분석 ----------
  const CML = ['plane', 'car', 'cat', 'deer', 'dog', 'ship'];
  const CM = [[90, 1, 1, 1, 1, 6], [2, 92, 1, 1, 1, 3], [2, 1, 68, 5, 21, 3], [3, 1, 6, 79, 8, 3], [1, 1, 19, 7, 69, 3], [5, 2, 1, 1, 1, 90]];
  function improveBars(c, x, y, live) { const rows = c.beat.improve, prev = (c.prev && c.prev.improve) || [];
    tx(x, y - 14, 'val 정확도 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    rows.forEach((r, i) => { const yy = y + i * 36, isNew = live && i >= prev.length, g = isNew ? E(c.u, 0.4, 1.4) : 1;
      tx(x, yy + 15, r.label, { 'font-size': 14, 'font-weight': 600, opacity: isNew ? fade(c.u, 0.3) : 1 });
      el('rect', { x: x + 150, y: yy + 2, width: 180, height: 18, rx: 4, fill: SOFT });
      el('rect', { x: x + 150, y: yy + 2, width: Math.max(2, 180 * (r.acc - 0.7) / 0.3 * g), height: 18, rx: 4, fill: r.tone === 'good' ? GOOD : MUT });
      mono(x + 340, yy + 16, Math.round(r.acc * 100) + '%', { 'font-size': 14, 'font-weight': 800, fill: r.tone === 'good' ? GOOD : INK, opacity: g }); }); }
  function cmat(x, y, cs, zero, hi, op) {
    CM.forEach((row, r) => row.forEach((v, q) => { const diag = r === q, vv = diag ? lerp(v, 0, zero) : v, a = clamp(vv / 90), h = hi && hi(r, q);
      el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 4, fill: diag && zero > 0.5 ? OFF : ACC, opacity: op * (0.1 + 0.8 * a) });
      if (h) el('rect', { x: x + q * cs - 2, y: y + r * cs - 2, width: cs + 1, height: cs + 1, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: op });
      mono(x + q * cs + (cs - 3) / 2, y + r * cs + cs / 2 + 3, String(Math.round(vv)), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: a > 0.55 ? PANEL : INK, opacity: op }); }));
    CML.forEach((s, i) => { tx(x - 8, y + i * cs + cs / 2 + 3, s, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: op });
      tx(x + i * cs + cs / 2, y - 10, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); });
    tx(x - 8, y - 30, '실제 ↓  예측 →', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); }
  function gal(x, y, seed, t1, p1, s) { photo(x - 32, y - 32, 64, seed, { op: s });
    mono(x, y + 50, t1, { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: s }); mono(x, y + 72, '→ ' + p1, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: s }); }
  function s4(t, c) { const { k, u } = c; strip(3);
    if (k === 0) { CLASSES.forEach((s, i) => { const x = 110 + (i % 5) * 150, y = 110 + Math.floor(i / 5) * 70;
        card(x, y, 130, 44, { rx: 8, stroke: GRID, sw: 1.5, s: pop(u, 0.2 + i * 0.1) }); mono(x - 50, y + 5, String(i), { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.1) });
        tx(x + 8, y + 5, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.1) }); });
      sub(480, 236, 'CLASSES[i] — 인덱스를 사람이 읽는 이름으로', fade(u, 1.4)); improveBars(c, 300, 310, false); return; }
    if (k === 1) { const f = E(u, 0.3, 1.4);
      card(170, 200, 130, 150, { rx: 10, stroke: WARN, sw: 2.5, s: pop(u, 0.1) }); mono(170, 206, 'best.pt', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      for (let i = 0; i < 6; i++) dot([[230, 200], [560, 200]], clamp(f * 1.6 - i * 0.12), WARN, 5);
      [5, 4, 3].forEach((j, i) => vol(560 + i * 110, 260, [32, 64, 128][i], [16, 8, 4][i], { label: false, col: f > 0.9 ? WARN : MUT }));
      mono(640, 120, 'load_state_dict(...)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      card(640, 330, 200, 40, { rx: 20, text: 'model.eval()', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.6) });
      sub(170, 300, '마지막 에폭 모델이 아니다', fade(u, 1.0)); return; }
    if (k === 2) { tx(60, 90, 'with torch.no_grad():  for x, y in val_loader', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      const nb = Math.floor(E(u, 0.2, 2.2) * 20);
      for (let i = 0; i < 20; i++) el('rect', { x: 60 + i * 42, y: 120, width: 38, height: 30, rx: 4, fill: i < nb ? INFO : SOFT, opacity: i < nb ? 0.75 : 1 });
      mono(900, 175, `${nb} / 20 배치`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: INFO });
      const n = Math.min(5000, nb * 256);
      [['y_true', INK], ['y_pred', ACC]].forEach(([s, col], i) => { const y = 240 + i * 56; mono(60, y + 6, s, { 'font-size': 16, 'font-weight': 800, fill: col });
        el('rect', { x: 170, y: y - 14, width: 560, height: 28, rx: 4, fill: SOFT }); el('rect', { x: 170, y: y - 14, width: 560 * n / 5000, height: 28, rx: 4, fill: col, opacity: 0.6 });
        mono(750, y + 6, n.toLocaleString('en-US') + '개', { 'font-size': 15, 'font-weight': 700, fill: col }); });
      sub(480, 380, '.cpu() 로 내려 리스트에 이어 붙인다 (sklearn 은 GPU 텐서를 못 받는다)', fade(u, 1.6)); return; }
    if (k === 3) { tx(60, 76, 'if t != p:  wrong.append((img, t, p))', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      [[200, 3, 'cat', 'dog'], [400, 5, 'dog', 'cat'], [600, 7, 'horse', 'deer']].forEach(([x, sd, a, b], i) => gal(x, 170, sd, a, b, pop(u, 0.3 + i * 0.4)));
      card(800, 200, 150, 140, { rx: 12, stroke: BAD, sw: 2.5, dash: '6 5', s: pop(u, 1.4) }); lbl(800, 150, 'wrong', fade(u, 1.5), { fill: BAD, class: 'mono' });
      for (let i = 0; i < 3; i++) fly([200, 400, 600][i], 170, 800, 200 + (i - 1) * 34, seg(u, 1.6 + i * 0.25, 2.4 + i * 0.2), ['cat', 'dog', 'horse'][i], { fill: BAD, stay: true, mono: true });
      note(60, 360, '이미지째 모아 둬야 라벨 오류인지 어려운 사진인지 눈으로 가른다', fade(u, 2.2)); return; }
    if (k === 4 || k === 5) { const zero = k === 5 ? E(u, 0.3, 1.2) : 0;
      cmat(120, 90, 50, zero, (r, q) => (k === 5 && u > 1.3 && ((r === 2 && q === 4) || (r === 4 && q === 2))) || (k === 4 && r === q && u > 1.2), k === 4 ? fade(u, 0.2) : 1);
      sub(270, 400, '예시 값 · 10개 중 6개 클래스만', 1);
      if (k === 4) { note(500, 140, 'cm = confusion_matrix(y_true, y_pred)', fade(u, 0.6), { class: 'mono', 'font-size': 14.5 });
        note(500, 190, '행 = 실제, 열 = 예측', fade(u, 1.0)); note(500, 224, '대각선 = 맞힌 수', fade(u, 1.4), { fill: ACC }); note(500, 258, '볼 곳은 대각선 바깥', fade(u, 2.0), { fill: BAD }); return; }
      note(500, 140, 'np.fill_diagonal(off, 0)', fade(u, 0.3), { class: 'mono', 'font-size': 14.5 }); note(500, 174, 'off.argmax() → 최다 혼동', fade(u, 1.0), { class: 'mono', 'font-size': 14.5 });
      card(690, 260, 300, 70, { rx: 12, stroke: BAD, sw: 2.5, s: pop(u, 1.5) }); mono(690, 254, 'cat → dog  21', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
      mono(690, 282, 'dog → cat  19', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 6) { const names = ['RandomCrop', 'Flip', 'ColorJitter', 'ToTensor', 'Normalize'], ins = E(u, 0.3, 1.2);
      tx(40, 70, 'train_tf.transforms.insert(2, ColorJitter(0.2, 0.2, 0.2))', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      names.forEach((n, i) => { const isNew = i === 2, slot = i < 2 ? i : i - 1, x0 = 110 + slot * 200, x1 = 100 + i * 170, x = isNew ? x1 : lerp(x0, x1, ins);
        card(x, isNew ? lerp(40, 140, ins) : 140, 150, 50, { rx: 10, text: n, fs: 14.5, mono: true, stroke: isNew ? ACC : GRID, color: isNew ? ACC : INK, sw: isNew ? 3 : 1.8, op: isNew ? ins : 1 }); });
      [0, 1, 2].forEach((i) => photo(200 + i * 100, 200, 70, 3, { op: fade(u, 1.3 + i * 0.2), mono: [ACC, WARN, INFO][i] }));
      sub(335, 296, '같은 고양이를 밝기·대비·채도만 바꿔 보여 준다', fade(u, 1.6));
      improveBars(c, 520, 236, true); return; }
    // k7: CosineAnnealingLR
    const ax = R.axes(80, 90, 380, 220, { x: [0, 30], y: [0, 1.0], xt: [0, 10, 20, 30], yt: [0, 0.5, 1.0], xl: 'epoch', yl: 'lr (×1e-3)', grid: true });
    const P = []; for (let e = 0; e <= 30; e++) P.push([e, (1 + Math.cos(Math.PI * e / 30)) / 2]);
    R.line(ax, P, E(u, 0.2, 1.6), ACC, { sw: 3 });
    mono(100, 376, 'CosineAnnealingLR(T_max=30)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) });
    improveBars(c, 520, 160, true); }

  // ---------- 5. 프로젝트 구조화 ----------
  const FILES = [['data.py', 'get_loaders()', INFO], ['model.py', 'class CifarCNN', ACC], ['train.py', 'fit() · main()', GOOD], ['utils.py', 'set_seed()', WARN]];
  function fileCard(x, y, name, role, col, o) { o = o || {}; card(x, y, 170, 62, { rx: 8, stroke: col, sw: o.hot ? 3 : 2, fill: o.hot ? SOFT : PANEL, s: o.s, op: o.op });
    const to = (o.op ?? 1) * (o.top ?? 1); if (to > 0.05) { mono(x - 72, y - 4, name, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: to }); mono(x - 72, y + 20, role, { 'font-size': 13.5, fill: MUT, opacity: to }); } }
  const FX = [100, 290, 480, 670], FY = 90;
  function tree(u, live, hot) { const sp = live ? E(u, 0.3, 1.4) : 1;
    FILES.forEach(([n, r, col], i) => { const x = lerp(170, FX[i], sp), y = lerp(230, FY, sp); fileCard(x, y, n, r, col, { s: live ? 0.6 + 0.4 * sp : 1, top: live ? clamp((sp - 0.7) / 0.3) : 1, hot: hot === i }); }); }
  function s5(t, c) { const { k, u } = c; strip(4);
    const cfgCard = (x, y, s) => { card(x, y, 180, 140, { rx: 10, fill: SOFT, stroke: INK, sw: 2, s });
      mono(x - 76, y - 44, 'config.yaml', { 'font-size': 15, 'font-weight': 800, opacity: s });
      ['lr: 1e-3', 'batch_size: 128', 'epochs: 30', 'seed: 42'].forEach((l, i) => mono(x - 76, y - 12 + i * 23, l, { 'font-size': 14.5, fill: ACC, opacity: s })); };
    if (k === 0) { card(200, 230, 220, 250, { rx: 10, stroke: WARN, sw: 2 }); mono(110, 130, 'notebook.ipynb', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      for (let i = 0; i < 7; i++) el('rect', { x: 110, y: 150 + i * 30, width: 180 - (i % 3) * 30, height: 18, rx: 3, fill: WARN, opacity: i === 2 ? 0.15 + 0.5 * (1 - E(u, 0.4, 1.2)) : 0.2 });
      fly(250, 210, 640, 230, seg(u, 0.4, 1.3), 'lr · batch · epochs', { fill: ACC });
      cfgCard(640, 230, pop(u, 1.3));
      note(500, 370, '실험 값을 바꿀 때 소스를 열지 않는다', fade(u, 2.0)); return; }
    cfgCard(860, 160, 1);
    if (k === 1) { const sh = E(u, 0.2, 0.9);
      if (sh < 1) { card(170, 240, 200, 230, { rx: 10, stroke: WARN, sw: 2, op: 1 - sh }); for (let i = 0; i < 7; i++) el('rect', { x: 90 + (hsh(i) - 0.5) * 80 * sh, y: 150 + i * 28 + (hsh(i + 9) - 0.5) * 60 * sh, width: 150, height: 16, rx: 3, fill: WARN, opacity: 0.3 * (1 - sh) }); }
      tree(u, true);
      note(40, 300, '바뀌는 이유가 다른 것끼리 파일을 나눈다', fade(u, 2.0)); return; }
    tree(u, false, k === 2 || k === 3 ? 3 : k >= 4 && k <= 6 ? 2 : null);
    if (k === 2) { card(400, 250, 640, 60, { rx: 10, fill: SOFT, stroke: WARN, sw: 2, s: pop(u, 0.3) });
      mono(100, 256, 'def set_seed(seed: int = 42) -> None:', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.4) });
      grow(670, 218, 670, 126, seg(u, 0.8, 1.2), WARN); sub(400, 310, '무작위를 쓰는 곳을 한 함수에 모은다', fade(u, 1.5)); return; }
    if (k === 3) { const D = ['random', 'numpy', 'torch', 'cuda'];
      D.forEach((d, i) => { const x = 130 + i * 150, y = 270, a = (-200 + 220 * E(u, 0.3 + i * 0.3, 1.0 + i * 0.3)) * Math.PI / 180;
        el('circle', { cx: x, cy: y, r: 32, fill: PANEL, stroke: WARN, 'stroke-width': 2.5 }); el('line', { x1: x, y1: y, x2: x + 24 * Math.cos(a), y2: y + 24 * Math.sin(a), stroke: WARN, 'stroke-width': 3, 'stroke-linecap': 'round' });
        mono(x, y - 44, d, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); mono(x + 40, y + 6, '42', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9 + i * 0.3) }); });
      sub(355, 350, 'cuda 를 빼면 GPU 에서 재현이 깨진다', fade(u, 2.2), { fill: BAD, 'font-size': 15 }); return; }
    if (k === 4) { [0, 1, 3].forEach((i, j) => { const x0 = FX[i]; el('path', { d: `M${x0},124 C${x0},${190 + j * 14} ${FX[2]},${190 + j * 14} ${FX[2] + (j - 1) * 20},126`, fill: 'none', stroke: FILES[i][2], 'stroke-width': 2.4, 'stroke-dasharray': '4 4', opacity: fade(u, 0.3 + j * 0.4) }); });
      mono(60, 280, 'from data import get_loaders', { 'font-size': 15, fill: INFO, opacity: fade(u, 0.5) }); mono(60, 308, 'from model import CifarCNN', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.9) });
      mono(60, 336, 'from utils import set_seed', { 'font-size': 15, fill: WARN, opacity: fade(u, 1.3) });
      note(520, 308, 'train.py 는 로직 없이 조립만 한다', fade(u, 1.8)); return; }
    if (k === 5) { const S = ['cfg 읽기', 'set_seed', 'get_loaders', 'CifarCNN()', 'fit(...)'];
      S.forEach((s, i) => { const x = 100 + i * 170; card(x, 280, 140, 42, { rx: 21, text: s, fs: 14.5, mono: true, stroke: i === 1 ? WARN : GOOD, color: i === 1 ? WARN : INK, s: pop(u, 0.2 + i * 0.25) });
        if (i) grow(x - 98, 280, x - 72, 280, fade(u, 0.3 + i * 0.25), MUT); });
      dot([[30, 245], [780, 245]], seg(u, 1.4, 2.6), GOOD, 6); sub(320, 340, '시드부터 심어야 randperm 도 같아진다', fade(u, 1.8), { fill: WARN, 'font-size': 15 }); return; }
    if (k === 6) { const L = [['$ python train.py', null], ['idx[:5] = [37542, 44491, 216, 43688, 41558]', 'var(--term)'], ['$ python train.py', null], ['idx[:5] = [37542, 44491, 216, 43688, 41558]', 'var(--term)']];
      terminal(40, 200, 600, 130, L, Math.min(4, E(u, 0.2, 2.2) * 4), { title: 'seed 42 로 두 번 (torch 2.15 CPU)', lh: 22, fs: 14 });
      check(680, 270, 13, pop(u, 2.3)); note(700, 276, '두 번 다 같은 분할', fade(u, 2.3), { fill: GOOD }); return; }
    // k7: 다음 장 예고
    card(250, 280, 420, 136, { rx: 12, stroke: GRID, sw: 1.5, s: pop(u, 0.2) });
    mono(60, 252, 'CifarCNN   114,186개', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.3) }); sub(270, 276, '처음부터 학습', fade(u, 0.3), { 'text-anchor': 'start' });
    mono(60, 304, 'ResNet50   25,557,032개', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) }); sub(60, 328, '학습된 채로 받고 fc 만 교체', fade(u, 0.8), { 'text-anchor': 'start' });
    banner(700, 290, '다음 장 IV-1-2 · 전이학습', pop(u, 1.5)); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'val_tf에 RandomCrop과 Flip을 넣지 않는 이유는 무엇인가?',
      o: ['검증 사진이 5,000장뿐이라 증강할 시간이 없어서', '채점 기준이 매번 흔들리지 않게 순정 사진으로 재려고', 'ToTensor와 함께 쓰면 오류가 나서'], a: 1,
      why: '증강은 train에서 다양한 변형을 보여 주려는 장치다. val에 넣으면 같은 모델도 채점할 때마다 점수가 달라진다.' },
    { q: '3블록 CNN에서 nn.Linear의 in_features가 2048인 까닭은 무엇인가?',
      o: ['풀링 세 번으로 32가 4가 되고 채널이 128이라 128×4×4 = 2048 이어서', '배치 크기 128에 16을 곱한 값이라서', 'CIFAR-10 클래스 10개에 맞춘 값이라서'], a: 0,
      why: '크기는 32 → 16 → 8 → 4, 채널은 3 → 32 → 64 → 128이다. 펴면 128×4×4 = 2048이고, 이 숫자가 틀리면 shape mismatch가 난다.' },
    { q: '에폭을 시작할 때마다 model.train()을 다시 부르는 이유는 무엇인가?',
      o: ['옵티마이저의 학습률을 되돌리려고', '기울기를 0으로 비우려고', '바로 앞 evaluate()가 모델을 eval 모드로 바꿔 두어서'], a: 2,
      why: 'evaluate() 안의 model.eval()은 Dropout을 끄고 BN을 누적 통계로 바꾼다. 다시 train()을 부르지 않으면 그 상태로 학습이 이어진다.' },
    { q: '혼동행렬에서 개선 방향을 찾을 때 먼저 볼 곳은 어디인가?',
      o: ['대각선 바깥에서 값이 가장 큰 칸', '대각선에서 값이 가장 큰 칸', '모든 칸의 합'], a: 0,
      why: '대각선은 맞힌 수다. 대각선을 0으로 지우고 최댓값을 찾으면 cat → dog(21)처럼 가장 자주 헷갈린 쌍이 나온다.' },
    { q: 'set_seed()에서 torch.cuda.manual_seed_all까지 묶는 이유는 무엇인가?',
      o: ['CPU 학습 속도를 높이려고', 'GPU 쪽 난수까지 같아야 GPU에서도 같은 결과가 나와서', 'config.yaml을 읽으려면 필요해서'], a: 1,
      why: '무작위는 random·numpy·torch CPU·torch CUDA 네 곳에서 나온다. 하나라도 빠지면 그쪽 결과가 실행마다 달라진다.' },
  ];

  const summary = [
    '모델보다 데이터부터 본다. 증강은 train_tf 에만 넣고 val은 순정으로 채점한다.',
    'Conv에서 Linear로 넘어가는 경계가 함정이다. 128×4×4 = 2048을 손으로 따라간다.',
    '학습 루프는 zero_grad, backward, step에 검증과 best 체크포인트를 붙여 완성한다.',
    '혼동행렬에서 가장 헷갈린 쌍을 찾고 그 원인을 겨냥해 증강이나 lr 스케줄을 고친다.',
  ];
  const review = [
    { q: '학습 곡선에서 train 정확도는 계속 오르는데 val은 멈췄다. 지금 할 일로 맞는 것은?',
      o: ['마지막 에폭 가중치로 혼동행렬을 그린다', 'best.pt를 불러와 혼동행렬로 어디서 틀리는지 본다', 'val에도 RandomCrop을 넣어 val 점수를 올린다'], a: 1,
      why: '벌어지는 곡선은 과적합 신호라 마지막 모델이 최고 모델이 아닐 수 있다. 저장해 둔 best로 분석해야 개선 방향이 맞게 나온다.' },
    { q: 'nn.Linear(128 * 4 * 4, 10) 줄에서 shape mismatch가 났다. 원인으로 가장 그럴듯한 것은?',
      o: ['풀링 횟수나 입력 크기가 바뀌어 펼친 길이가 2048이 아니다', 'CrossEntropyLoss 앞에 Softmax를 안 붙였다', 'val_loader의 batch_size가 256이다'], a: 0,
      why: '펼친 길이는 채널×높이×너비다. 블록을 하나 더 쌓거나 입력 크기를 바꾸면 이 값이 달라지므로 더미 텐서로 흘려 확인한다.' },
    { q: '어제 88%가 나온 코드를 오늘 돌렸더니 다른 점수가 나왔다. 먼저 확인할 것은?',
      o: ['epochs를 더 늘렸는지', 'ColorJitter의 값을 키웠는지', 'set_seed가 데이터 분할보다 먼저 불렸는지'], a: 2,
      why: 'randperm으로 나눈 train/val도 시드에 따라 달라진다. 시드를 가장 먼저 심어야 분할과 가중치 초기값이 매번 같다.' },
  ];

  R.page({ title: 'CIFAR-10 프로젝트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
