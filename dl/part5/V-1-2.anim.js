/* V-1-2 데이터 증강과 클래스 불균형 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 원본 이미지 한 장(고양이 그림)에 변환을 걸어 "같은 라벨의 다른 모습"을 만들고,
 *   불량 1% 데이터는 10×10 와플(칸 1개 = 1%)로, 손실은 정답 확률 p 에 대한 실제 곡선 (1−p)^γ·(−log p) 로 그린다.
 * 숫자는 페이지 데이터·코드에서만. 혼동행렬 수치(12% → 60% → 86%)는 페이지의 예시 시나리오라 '예시'로 표시한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op ?? 1 }, a || {})); }

  // ---------- 그림 부품: 이미지 판 + 고양이 / 강아지 ----------
  let clipN = 0;
  function frame(cx, cy, S, o) { o = o || {}; const g = el('g', { transform: `translate(${cx} ${cy})`, opacity: o.op ?? 1 });
    el('rect', { x: -S / 2, y: -S / 2, width: S, height: S, rx: 6, fill: o.bg || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2 }, g);
    const id = 'v12c' + (clipN++), cp = el('clipPath', { id }, g); el('rect', { x: -S / 2, y: -S / 2, width: S, height: S, rx: 6 }, cp);
    const inner = el('g', { 'clip-path': `url(#${id})` }, g); return inner; }
  function cat(p, s, o) { o = o || {}; const g = el('g', { transform: o.tf || '', opacity: o.op ?? 1 }, p), col = o.col || WARN, fill = o.fill || WARNBG;
    el('path', { d: `M${-26 * s},${-12 * s} L${-22 * s},${-38 * s} L${-6 * s},${-24 * s} Z M${26 * s},${-12 * s} L${22 * s},${-38 * s} L${6 * s},${-24 * s} Z`, fill, stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: 0, cy: 0, r: 28 * s, fill, stroke: col, 'stroke-width': 2.4 }, g);
    el('circle', { cx: -10 * s, cy: -4 * s, r: 3.6 * s, fill: INK }, g); el('circle', { cx: 10 * s, cy: -4 * s, r: 3.6 * s, fill: INK }, g);
    el('path', { d: `M${-4 * s},${6 * s} L${4 * s},${6 * s} L0,${10 * s} Z`, fill: col }, g);
    el('path', { d: `M${-8 * s},${12 * s} L${-30 * s},${8 * s} M${-8 * s},${15 * s} L${-30 * s},${18 * s} M${8 * s},${12 * s} L${30 * s},${8 * s} M${8 * s},${15 * s} L${30 * s},${18 * s}`, stroke: col, 'stroke-width': 1.4 }, g);
    el('circle', { cx: 18 * s, cy: -20 * s, r: 4 * s, fill: col, opacity: 0.8 }, g);   // 비대칭 표지 (뒤집힘이 보이게)
    return g; }
  function dog(p, s, o) { o = o || {}; const g = el('g', { transform: o.tf || '', opacity: o.op ?? 1 }, p), col = o.col || INFO, fill = o.fill || INFOBG;
    el('ellipse', { cx: -27 * s, cy: 0, rx: 9 * s, ry: 20 * s, fill: col, opacity: 0.85 }, g); el('ellipse', { cx: 27 * s, cy: 0, rx: 9 * s, ry: 20 * s, fill: col, opacity: 0.85 }, g);
    el('circle', { cx: 0, cy: 0, r: 26 * s, fill, stroke: col, 'stroke-width': 2.4 }, g);
    el('circle', { cx: -9 * s, cy: -5 * s, r: 3.6 * s, fill: INK }, g); el('circle', { cx: 9 * s, cy: -5 * s, r: 3.6 * s, fill: INK }, g);
    el('ellipse', { cx: 0, cy: 9 * s, rx: 7 * s, ry: 5 * s, fill: INK }, g); return g; }
  function lab(cx, y, s, col, op) { mono(cx, y, s, { 'font-size': 14, 'font-weight': 700, fill: col || GOOD, 'text-anchor': 'middle', opacity: op ?? 1 }); }

  // ---------- 1. 기본 증강 ----------
  const TFS = [['좌우 플립', 'scale(-1 1)', null, '뒤집어도 고양이'], ['랜덤 크롭', 'translate(14 10) scale(1.6)', null, '일부만 보여도'], ['회전 ±15°', 'rotate(-14)', null, '기울여도'], ['색상 지터', '', { col: INFO, fill: INFOBG }, '조명이 달라도']];
  function tile(i, x, y, s0) { const [nm, tf, cl, why] = TFS[i]; const p = frame(x, y, 96, { op: s0 }); cat(p, 1.15, Object.assign({ tf }, cl || {}));
    tx(x + 60, y - 22, nm, { 'font-size': 15, 'font-weight': 800, opacity: s0 }); tx(x + 60, y + 2, why, { 'font-size': 13.5, fill: MUT, opacity: s0 }); mono(x + 60, y + 26, 'label: cat ✓', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: s0 }); }
  function s1(t, c) { const { k, u } = c;
    const orig = (op) => { const p = frame(120, 170, 150, { op }); cat(p, 1.7); lbl(120, 270, '원본', op); lab(120, 292, 'label: cat', GOOD, op); };
    if (k <= 4) { orig(k === 0 ? fade(u, 0.2) : 1);
      if (k === 0) { note(300, 120, '증강본은 디스크에 저장하지 않는다', fade(u, 0.8)); sub(520, 160, 'DataLoader 가 매 에폭 무작위로 적용', fade(u, 1.3), { 'font-size': 15 });
        ['epoch 1', 'epoch 2', 'epoch 3'].forEach((e, i) => { const op = fade(u, 1.7 + i * 0.25), x = 360 + i * 170; const p = frame(x, 280, 90, { op }); cat(p, 1.0, { tf: ['scale(-1 1)', 'rotate(10)', 'translate(-8 6) scale(1.4)'][i] }); mono(x, 344, e, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
        sub(530, 396, '같은 원본 → 매번 다른 모습', fade(u, 2.4), { 'font-size': 15 }); return; }
      grow(205, 170, 270, 170, 1, MUT);
      for (let i = 0; i < k; i++) { const x = 350 + (i % 2) * 300, y = 110 + Math.floor(i / 2) * 150, s0 = i === k - 1 ? fade(u, 0.3) : 1; tile(i, x, y, s0); }
      const extra = { 1: ['RandomHorizontalFlip(p=0.5)', '절반은 원본 그대로 나온다'], 2: ['RandomResizedCrop(224, scale=(0.6, 1.0))', '원본의 60~100% 영역을 잘라 224 로'], 3: ['RandomRotation(degrees=15)', '위성 사진이면 360° 도 허용'], 4: ['ColorJitter(0.3, 0.3, 0.3, hue=0.05)', '네 변환 모두 label: cat 유지'] }[k];
      mono(40, 380, extra[0], { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); sub(700, 405, extra[1], fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 5) { for (let i = 0; i < 4; i++) { const p = frame(70 + i * 110, 110, 86); cat(p, 1.0, Object.assign({ tf: TFS[i][1] }, TFS[i][2] || {})); }
      tx(40, 186, '무작위 변환 4종', { 'font-size': 15, 'font-weight': 700 });
      grow(480, 110, 560, 110, E(u, 0.3, 0.6), MUT); mono(520, 96, 'ToTensor', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      for (let ch = 2; ch >= 0; ch--) el('rect', { x: 600 + ch * 12, y: 60 - ch * 12, width: 110, height: 110, rx: 4, fill: [WARNBG, GOODBG, INFOBG][ch], stroke: [WARN, GOOD, INFO][ch], 'stroke-width': 2, opacity: fade(u, 0.6 + (2 - ch) * 0.15) });
      mono(680, 196, '(3, 224, 224)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(60, 270, 'Normalize(mean=[0.485, 0.456, 0.406],', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); mono(160, 296, 'std=[0.229, 0.224, 0.225])', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 344, '채널별 ImageNet 통계 — 사전학습 가중치가 기대하는 값', fade(u, 1.9), { 'font-size': 15 });
      sub(480, 380, '순서: 무작위 변환 → 텐서화 → 정규화(결정적)', fade(u, 2.3), { 'font-size': 15, fill: ACC }); return; }
    if (k === 6) { orig(1); grow(205, 170, 270, 170, 1, MUT); mono(300, 120, 'Resize(256) → CenterCrop(224)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [0, 1, 2].forEach((i) => { const x = 360 + i * 180, op = fade(u, 0.6 + i * 0.4); const p = frame(x, 230, 110, { op }); cat(p, 1.25); mono(x, 310, `평가 ${i + 1}회`, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
      note(480, 370, '무작위성 0 — 몇 번을 돌려도 같은 점수', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 7) { const rows = [['train_ds', 'data/train', 'train_tf · 무작위', ACC, true], ['val_ds', 'data/val', 'val_tf · 결정적', GOOD, false]];
      rows.forEach(([nm, dir, tfn, col, rnd], r) => { const y = 120 + r * 160, op = fade(u, 0.3 + r * 0.8);
        mono(40, y - 30, `${nm} = ImageFolder("${dir}")`, { 'font-size': 15, 'font-weight': 700, opacity: op });
        pill(130, y + 20, tfn, col, op > 0.5 ? 1 : 0, { fs: 14 });
        [0, 1, 2, 3].forEach((i) => { const x = 330 + i * 140, p = frame(x, y + 20, 96, { op }); cat(p, 1.1, rnd ? Object.assign({ tf: TFS[i][1] }, TFS[i][2] || {}) : {}); }); });
      sub(560, 404, '구조가 같아도 transform 인자는 절대 공유하지 않는다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k 8: 라벨을 깨는 변환
    const p1 = frame(110, 130, 100); tx(0, 26, '6', { 'font-size': 76, 'font-weight': 800, 'text-anchor': 'middle', fill: INK, class: 'mono' }, p1);
    grow(170, 130, 230, 130, E(u, 0.3, 0.6), BAD); mono(200, 112, 'VFlip', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) });
    const p2 = frame(290, 130, 100, { op: fade(u, 0.5) }); tx(0, 26, '6', { 'font-size': 76, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, class: 'mono', transform: 'rotate(180) translate(0 -2)' }, p2);
    tx(370, 124, '6 → 9 · 라벨 파괴', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) }); tx(370, 148, 'MNIST 상하반전 금지', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
    const chest = (cx, side, op, col) => { const p = frame(cx, 300, 120, { op }); el('ellipse', { cx: 0, cy: 4, rx: 44, ry: 50, fill: 'none', stroke: MUT, 'stroke-width': 2 }, p);
      for (let i = 0; i < 4; i++) el('path', { d: `M-40,${-30 + i * 18} Q0,${-20 + i * 18} 40,${-30 + i * 18}`, fill: 'none', stroke: GRID, 'stroke-width': 2 }, p);
      el('ellipse', { cx: 16 * side, cy: 18, rx: 16, ry: 20, fill: col, opacity: 0.85 }, p); };
    chest(110, 1, fade(u, 1.2), WARN); grow(170, 300, 230, 300, E(u, 1.4, 1.7), BAD); mono(200, 282, 'HFlip', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.4) }); chest(290, -1, fade(u, 1.6), BAD);
    tx(370, 294, '흉부 X-ray 좌우반전', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); tx(370, 318, '심장이 반대쪽 — 비현실 데이터', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) });
    pill(800, 130, '위성 사진: 360° OK', GOOD, pop(u, 2.1), { fs: 14.5 }); note(640, 230, '먼저 물어라:', fade(u, 2.3), { 'font-size': 15 }); note(640, 256, '이 변환 후에도 라벨이 같은가?', fade(u, 2.4), { 'font-size': 15, fill: ACC }); }

  // ---------- 2. Mixup · CutMix · RandAugment ----------
  function mixImg(cx, cy, S, lam, o) { o = o || {}; const p = frame(cx, cy, S, o); cat(p, S / 90, { op: lam }); dog(p, S / 90, { op: 1 - lam }); return p; }
  function softBars(x, y, lam, op, pl) { [['cat', lam, WARN], ['dog', 1 - lam, INFO]].forEach(([nm, v, col], i) => { mono(x, y + i * 34 + 15, nm, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
      R.hbar(x + 44, y + i * 34, 200, tween(pl != null ? (i ? 1 - pl : pl) : null, v, 1, 0.01), 1, { h: 20, col, text: v.toFixed(2), label: op > 0.5 }); }); }
  function s2(t, c) { const { k, u } = c, mb = c.beat.mixBox || {}, lam = mb.lam ?? 0.5, plam = c.prev && c.prev.mixBox ? c.prev.mixBox.lam : lam, L = tween(plam, lam, u), ra = mb.randaug || {};
    if (k === 0) { const pa = frame(130, 160, 130); cat(pa, 1.45); lab(130, 250, 'cat'); const pb = frame(330, 160, 130, { op: fade(u, 0.4) }); dog(pb, 1.45); lab(330, 250, 'dog', INFO, fade(u, 0.4));
      grow(410, 160, 480, 160, E(u, 0.9, 1.2), MUT); mixImg(570, 160, 130, 0.5, { op: fade(u, 1.2) }); mono(570, 250, `λ = ${lam}`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      softBars(660, 120, 0.5, fade(u, 1.6)); sub(480, 330, 'Mixup: 픽셀과 라벨을 선형 혼합', fade(u, 2.0), { 'font-size': 15 }); sub(480, 360, 'CutMix: 패치 교체 + 면적 비율 라벨', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 1 || k === 2) { const ops = ra.ops || [], pick = ra.pick || [];
      tx(60, 80, 'RandAugment — 14종 변환 풀 (8개 표시)', { 'font-size': 16, 'font-weight': 800 });
      ops.forEach((s, i) => { const x = 110 + (i % 4) * 200, y = 140 + Math.floor(i / 4) * 64, on = pick.includes(i), newOn = on && !(((c.prev && c.prev.mixBox && c.prev.mixBox.randaug.pick) || []).includes(i));
        pill(x, y, s, on ? ACC : MUT, newOn ? pop(u, 0.6) : 1, { fs: 15, fill: on ? ACCBG : PANEL }); });
      mono(60, 300, k === 1 ? 'from torchvision.transforms import RandAugment' : 'RandAugment(num_ops=2, magnitude=9)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      if (k === 2) { pill(640, 300, 'N = 2', ACC, pop(u, 1.4), { fs: 15, mono: true }); pill(760, 300, 'M = 9', ACC, pop(u, 1.6), { fs: 15, mono: true });
        sub(480, 350, '튜닝할 것은 (N, M) 두 개뿐 — 매 배치 2개를 무작위로', fade(u, 1.9), { 'font-size': 15 });
        sub(480, 384, '텍스트: 역번역·동의어 치환·랜덤 삭제', fade(u, 2.3), { 'font-size': 14, fill: MUT }); }
      else sub(480, 360, '변환 정책을 손으로 튜닝하던 시대를 끝낸 도구', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 3) { card(480, 70, 560, 46, { rx: 8, stroke: INK, text: 'mixup(x, y, num_classes, alpha=0.2)', fs: 16, mono: true, s: pop(u, 0.2) });
      mono(150, 126, 'x: (B, C, H, W)   y: (B,)', { 'font-size': 14.5, opacity: fade(u, 0.6) }); mono(560, 126, '→ mixed_x, soft label', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.8) });
      const ax = R.axes(240, 170, 420, 170, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1], xl: 'λ', yl: 'Beta(0.2, 0.2) 밀도 (모양)' });
      const pts = []; for (let i = 1; i < 60; i++) { const x = i / 60, f = Math.pow(x, -0.8) * Math.pow(1 - x, -0.8); pts.push([x, Math.min(1, f / 12)]); }
      R.line(ax, pts, E(u, 1.0, 2.0), ACC, { sw: 3 });
      sub(800, 230, 'α 가 작으면 λ 가', fade(u, 1.8), { 'font-size': 15 }); sub(800, 256, '0 이나 1 근처', fade(u, 2.0), { 'font-size': 15 }); sub(800, 282, '→ 원본에 가깝다', fade(u, 2.2), { 'font-size': 15, fill: ACC }); return; }
    if (k === 4 || k === 5) { const pa = frame(110, 150, 110); cat(pa, 1.2); mono(110, 228, `× ${L.toFixed(1)}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      tx(195, 158, '+', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle' }); const pb = frame(280, 150, 110); dog(pb, 1.2); mono(280, 228, `× ${(1 - L).toFixed(1)}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      tx(365, 158, '=', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle' }); mixImg(460, 150, 130, L, { stroke: ACC, sw: 3 });
      mono(60, 300, k === 4 ? 'mixed_x = lam * x + (1 - lam) * x[idx]' : 'mixed_y = lam * y1 + (1 - lam) * y2', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      if (k === 4) { sub(260, 340, 'idx = randperm — 같은 배치 안에서 짝을 섞는다', fade(u, 1.2), { 'font-size': 14.5 }); mono(740, 120, `λ = ${lam}`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); sub(740, 150, '(Beta 에서 뽑은 예)', fade(u, 0.5)); }
      if (k === 5) { tx(600, 100, 'soft label', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) }); softBars(600, 120, L, 1); note(600, 230, '정답이 100% 확신에서 벗어난다', fade(u, 1.6), { 'font-size': 15 });
        sub(260, 340, '픽셀과 라벨을 같은 λ 로 — 한쪽만 섞으면 틀린 정답', fade(u, 2.0), { 'font-size': 14.5 }); } return; }
    if (k === 6 || k === 7) { const S = 180, H = S, rh = H * Math.sqrt(1 - lam), cx0 = 200, cy0 = 210;
      const p = frame(cx0, cy0, S, { stroke: ACC, sw: 3 }); cat(p, 2.0);
      const pw = rh * (k === 6 ? E(u, 0.3, 1.0) : 1);
      if (k === 6) { el('rect', { x: cx0 + S / 2 - pw, y: cy0 + S / 2 - pw, width: pw, height: pw, fill: 'none', stroke: INFO, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
        mono(470, 110, `λ = ${lam}`, { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
        mono(470, 160, 'rh = H·√(1−λ)', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(470, 196, `   = ${Math.sqrt(1 - lam).toFixed(2)}·H`, { 'font-size': 17, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) });
        sub(600, 250, `패치 면적 = 1 − λ = ${(1 - lam).toFixed(2)}`, fade(u, 1.5), { 'font-size': 15 }); sub(600, 284, 'λ 가 클수록 패치가 작다', fade(u, 2.0), { 'font-size': 15 }); return; }
      // k 7: 경계에 걸려 잘린 패치 — 실제 면적으로 λ 재계산
      const a = 1 - lam, side = Math.sqrt(a) * S, w = side, hh = Math.min(side * 1.25, S), ww = a * S * S / hh;
      const p2 = el('g', { 'clip-path': null }); const g = E(u, 0.3, 1.0);
      el('rect', { x: cx0 + S / 2 - ww, y: cy0 - S / 2, width: ww, height: hh * g, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5 });
      const pd = el('g', { transform: `translate(${cx0 + S / 2 - ww / 2} ${cy0 - S / 2 + hh / 2})`, opacity: g });
      dog(pd, Math.min(ww, hh) / 70);
      mono(470, 110, 'x[:, :, y1:y2, x1:x2] = x[idx, ...]', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      note(470, 170, '이미지 경계에서 잘린다', fade(u, 1.1)); mono(470, 214, 'lam = 1 − 패치 면적 / (H·W)', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      tx(470, 260, 'soft label', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); softBars(470, 274, lam, fade(u, 1.9)); return; }
    // k 8: soft label 손실 + 다른 도메인
    mono(60, 80, 'loss = -(y_soft * log_softmax(logits)).sum(1).mean()', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
    mixImg(130, 190, 120, lam); softBars(230, 160, lam, fade(u, 0.6));
    const oth = mb.others || []; oth.forEach((o, i) => { const op = fade(u, 1.1 + i * 0.35); tx(560, 160 + i * 44, o.domain.replace(/^\S+\s/, ''), { 'font-size': 15, 'font-weight': 800, opacity: op }); tx(640, 160 + i * 44, o.method.split(' — ')[0].split(',')[0], { 'font-size': 14, fill: MUT, opacity: op }); });
    note(480, 340, '더 어렵고 애매한 문제 → 100% 확신 암기 불가', fade(u, 2.2), { 'text-anchor': 'middle' }); sub(480, 372, '증강이 곧 정규화인 이유', fade(u, 2.4), { 'font-size': 15 }); }

  // ---------- 3. 불균형 ----------
  function waffle(x, y, nBad, cs, op, o) { o = o || {}; for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), cc = i % 10, bad = i >= 100 - nBad;
      el('rect', { x: x + cc * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 3, fill: bad ? BAD : (o.gray || OFF), opacity: op * (bad ? 0.9 : 0.6) }); } }
  // 혼동행렬 2×2: 행 = 실제(정상/불량), 열 = 예측(정상/불량)
  function conf(x, y, m, op, cs) { cs = cs || 70; const ch = 44, cells = [['TN', m.tn, GOOD], ['FP', m.fp, WARN], ['FN', m.fn, BAD], ['TP', m.tp, ACC]];
    cells.forEach(([nm, v, col], i) => { const cx = x + (i % 2) * cs, cy = y + Math.floor(i / 2) * ch; el('rect', { x: cx, y: cy, width: cs - 4, height: ch - 4, rx: 6, fill: PANEL, stroke: col, 'stroke-width': nm === 'FN' ? 3 : 1.8, opacity: op });
      mono(cx + (cs - 4) / 2, cy + 27, v.toLocaleString(), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: op }); });
    mono(x - 6, y + 26, '정상', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); mono(x - 6, y + ch + 26, '불량', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op });
    mono(x + cs / 2 - 2, y - 8, '정상', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); mono(x + cs * 1.5 - 2, y - 8, '불량', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
  function s3(t, c) { const { k, u } = c, im = c.beat.imbalance || {}, bars = im.bars || [];
    const balanced = bars[1] && bars[1].pct === 50, pb = c.prev && c.prev.imbalance && c.prev.imbalance.bars[1] ? c.prev.imbalance.bars[1].pct : bars[1] ? bars[1].pct : 1;
    const nBad = Math.round(tween(pb, bars[1] ? bars[1].pct : 1, u, 1.4));
    const showWaffle = k !== 6 && k !== 7;
    if (showWaffle) { waffle(60, 60, nBad, 26, k === 0 ? fade(u, 0.2) : 1);
      tx(60, 345, balanced ? '배치 구성 — 리샘플링 후' : '10,000장 — 칸 1개 = 1%', { 'font-size': 15, 'font-weight': 700 });
      mono(60, 372, `정상 ${bars[0] ? bars[0].count.toLocaleString() : ''} · 불량 ${bars[1] ? bars[1].count.toLocaleString() : ''}`, { 'font-size': 15, fill: MUT });
      mono(60, 396, balanced ? '(10,000 추출 기준 기대값)' : '', { 'font-size': 13.5, fill: MUT }); }
    const RX = 380;
    if (k === 0) { note(RX, 110, '불량 1%', fade(u, 0.8), { fill: BAD }); note(RX, 146, '배치 경사의 99%가 정상에서 나온다', fade(u, 1.3));
      sub(RX + 250, 196, '모델은 불량을 무시하도록 "올바르게" 최적화된다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 1) { mono(RX, 90, 'Counter(labels) → {0: 9900, 1: 100}', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(RX, 130, '"전부 정상" 깡통 모델 — 행 실제 · 열 예측', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.6) }); conf(RX + 50, 176, im.dummy.matrix, fade(u, 0.8), 76);
      mono(RX + 260, 200, '정확도 99%', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); mono(RX + 260, 240, '재현율 0%', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
      sub(RX + 250, 330, '불량을 한 장도 못 잡는데 지표는 최고점', fade(u, 2.3), { 'font-size': 14.5, fill: BAD }); return; }
    if (k === 2) { mono(RX, 90, 'sample_weights = 1 / counts[y]', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(RX, 140, '정상 1장', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) }); R.hbar(RX + 90, 126, 300, 1, 99, { h: 20, col: OFF, text: '1/9900', u: E(u, 0.5, 1.0) });
      tx(RX, 184, '불량 1장', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) }); R.hbar(RX + 90, 170, 300, 99, 99, { h: 20, col: BAD, text: '1/100', u: E(u, 0.9, 1.6) });
      note(RX, 250, '불량 한 장이 정상 한 장보다 99배 자주 뽑힌다', fade(u, 1.8), { 'font-size': 15 }); sub(RX + 250, 290, '클래스 합계로는 9900·(1/9900) = 100·(1/100) → 반반', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 3) { mono(RX, 90, 'WeightedRandomSampler(', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(RX + 30, 116, 'num_samples=len(labels),  # 10,000', { 'font-size': 14.5, opacity: fade(u, 0.5) }); mono(RX + 30, 142, 'replacement=True)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8) });
      for (let i = 0; i < 8; i++) { const f = seg(u, 1.0 + i * 0.15, 1.4 + i * 0.15); if (f <= 0) continue; const isBad = i % 2 === 0, x = RX + 20 + i * 62;
        card(x, 220, 52, 40, { rx: 6, stroke: isBad ? BAD : OFF, fill: isBad ? BADBG : PANEL, text: isBad ? ['#17', '#17', '#42', '#17'][i / 2] : '정상', fs: 13.5, mono: true, color: isBad ? BAD : MUT, s: f }); }
      sub(RX + 250, 290, '같은 불량(#17)이 또 뽑힌다 — 중복 허용이 전제 (번호는 예시)', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 4) { mono(RX, 90, 'DataLoader(train_ds, batch_size=64, sampler=sampler)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      note(RX, 150, '배치 구성 99:1 → 대략 50:50', fade(u, 0.8)); sub(RX + 250, 196, '이제 불량도 경사에 목소리를 갖는다', fade(u, 1.5), { 'font-size': 15, fill: GOOD });
      pill(RX + 150, 260, 'sampler 쓰면 shuffle 금지', BAD, pop(u, 2.0), { fs: 14.5 }); return; }
    if (k === 5) { for (let i = 0; i < 6; i++) { const x = RX + 20 + i * 92, op = fade(u, 0.2 + i * 0.2), p = frame(x + 40, 140, 76, { op, stroke: BAD });
        el('circle', { cx: 6, cy: -4, r: 12, fill: BAD, opacity: 0.7 }, p); el('path', { d: 'M-24,14 L20,-20', stroke: INK, 'stroke-width': 2.5 }, p);
 }
      tx(RX, 210, '같은 불량 100장이 계속 나온다 → 그 100장을 외운다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
      for (let i = 0; i < 6; i++) { const x = RX + 60 + i * 92, op = fade(u, 1.6 + i * 0.12), tfm = ['scale(-1 1)', 'rotate(12)', 'translate(4 4) scale(1.3)', 'rotate(-10)', 'scale(-1 1) rotate(8)', ''][i];
        const p = frame(x, 290, 76, { op, stroke: GOOD }); const g = el('g', { transform: tfm }, p); el('circle', { cx: 6, cy: -4, r: 12, fill: BAD, opacity: 0.7 }, g); el('path', { d: 'M-24,14 L20,-20', stroke: INK, 'stroke-width': 2.5 }, g); }
      tx(RX, 360, '증강과 묶으면 매번 다른 모습으로 반복', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { const S = im.strategies || []; S.forEach((s, i) => { const x = 170 + i * 310, op = fade(u, 0.2 + i * 0.5); card(x, 170, 280, 170, { rx: 12, stroke: [ACC, WARN, INFO][i], op });
        tx(x, 118, s.name, { 'font-size': 17, 'font-weight': 800, fill: [ACC, WARN, INFO][i], 'text-anchor': 'middle', opacity: op });
        wrap(x, 150, s.how, 16, 14.5, op, INK); wrap(x, 214, s.cost, 17, 13.5, op, MUT); });
      note(480, 330, '가장 싼 것부터: 임계값 조정은 재학습이 필요 없다', fade(u, 2.0), { 'text-anchor': 'middle', 'font-size': 15 }); sub(480, 366, 'SMOTE(테이블)·언더샘플링(정보 손실 큼)도 같은 축', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k 7: 지표 교체
    card(220, 140, 260, 70, { rx: 10, stroke: BAD, text: 'accuracy 99%', fs: 22, mono: true, color: BAD, s: pop(u, 0.2) }); cross(220, 140, 26, pop(u, 0.6));
    grow(370, 140, 470, 140, E(u, 0.8, 1.1), MUT);
    ['재현율 (recall)', '정밀도 (precision)', 'PR-AUC'].forEach((s, i) => pill(640, 90 + i * 52, s, GOOD, pop(u, 1.0 + i * 0.3), { fs: 15.5 }));
    note(480, 300, '지표부터 바꾸지 않으면 개선도 보이지 않는다', fade(u, 2.0), { 'text-anchor': 'middle' }); sub(480, 336, '(ml I-2-2 의 그 함정)', fade(u, 2.2), { 'font-size': 14.5 }); }
  function wrap(cx, y, s, n, fs, op, col) { const words = s.split(' '), lines = []; let cur = ''; words.forEach((w) => { if ((cur + ' ' + w).trim().length > n) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }); if (cur.trim()) lines.push(cur.trim());
    lines.forEach((l, i) => tx(cx, y + i * (fs + 6), l, { 'font-size': fs, 'text-anchor': 'middle', fill: col, opacity: op })); }

  // ---------- 4. 가중 손실 · Focal ----------
  const FL = (p, g) => Math.pow(1 - p, g) * -Math.log(p);
  const GCOL = { 0: MUT, 1: WARN, 2: BAD };
  function lossPlot(curves, u, k) { const ax = R.axes(70, 60, 400, 260, { x: [0, 1], y: [0, 4], xt: [0, 0.5, 1], yt: [0, 1, 2, 3, 4], xl: '정답 확률 p', yl: '손실' });
    el('rect', { x: ax.X(0.6), y: 60, width: ax.X(1) - ax.X(0.6), height: 260, fill: WARNBG, opacity: 0.7 }); tx(ax.X(0.8), 80, '쉬운 예제', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
    curves.forEach((cv) => { const pts = []; for (let i = 0; i <= 60; i++) { const p = 0.02 + 0.97 * i / 60; pts.push([p, Math.min(4, FL(p, cv.gamma))]); }
      R.line(ax, pts, cv.u ?? 1, GCOL[cv.gamma], { sw: cv.gamma === 2 ? 3.2 : 2.6 });
      const ly = { 0: 110, 1: 134, 2: 158 }[cv.gamma]; const op = (cv.u ?? 1) > 0.9 ? 1 : 0;
      el('line', { x1: ax.X(0.3), y1: ly - 5, x2: ax.X(0.3) + 26, y2: ly - 5, stroke: GCOL[cv.gamma], 'stroke-width': 3, opacity: op });
      mono(ax.X(0.3) + 34, ly, cv.gamma === 0 ? 'CE (γ=0)' : `Focal γ=${cv.gamma}`, { 'font-size': 14, 'font-weight': 700, fill: GCOL[cv.gamma], opacity: op }); });
    return ax; }
  function s4(t, c) { const { k, u } = c, lb = c.beat.lossBox || {}, cf = lb.confusion || {}, gams = (lb.curves || []).map((x) => x.gamma), pg = c.prev && c.prev.lossBox ? c.prev.lossBox.curves.map((x) => x.gamma) : [];
    const curves = gams.map((g) => ({ gamma: g, u: pg.includes(g) ? 1 : E(u, 0.3, 1.4) }));
    const ax = lossPlot(curves, u, k);
    const RX = 520;
    if (k === 7) { const vals = [[0, 1.0], [1, 0.1], [2, 0.01]]; el('line', { x1: ax.X(0.9), y1: 60, x2: ax.X(0.9), y2: 320, stroke: INK, 'stroke-width': 1.8, 'stroke-dasharray': '4 4', opacity: fade(u, 0.3) });
      mono(ax.X(0.9), 340, 'p=0.9', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(RX, 90, 'p = 0.9 인 쉬운 예제의 손실 배율 (1−p)^γ', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.4) });
      vals.forEach(([g, v], i) => { const y = 120 + i * 50; mono(RX, y + 16, `γ=${g}`, { 'font-size': 15, 'font-weight': 700, fill: GCOL[g], opacity: fade(u, 0.7 + i * 0.4) }); R.hbar(RX + 60, y, 260, v, 1, { h: 22, col: GCOL[g], text: v.toFixed(2), u: E(u, 0.7 + i * 0.4, 1.2 + i * 0.4) }); });
      sub(RX + 190, 300, 'γ 를 1 올릴 때마다 한 자릿수씩 준다', fade(u, 2.0), { 'font-size': 15 }); sub(RX + 190, 330, '−log 0.9 = 0.105 → 0.0105 → 0.00105', fade(u, 2.3), { 'font-size': 14, class: 'mono' }); return; }
    if (k === 1 || k === 2) { mono(RX, 90, 'n_total, n_neg, n_pos = 10_000, 9_900, 100', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      if (k === 1) { tx(RX, 140, '가중치 = 전체 / (클래스 수 × 빈도)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); sub(RX + 190, 190, '곡선 모양이 아니라 높이를 바꾼다', fade(u, 1.5), { 'font-size': 15 }); }
      if (k === 2) { tx(RX, 140, '정상', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) }); R.hbar(RX + 60, 126, 260, 0.505, 50, { h: 20, col: OFF, text: '0.505', u: E(u, 0.4, 0.9) });
        tx(RX, 184, '불량', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) }); R.hbar(RX + 60, 170, 260, 50, 50, { h: 20, col: BAD, text: '50.0', u: E(u, 0.8, 1.5) });
        sub(RX + 190, 240, '비율 50.0 / 0.505 = 99', fade(u, 1.8), { 'font-size': 15, class: 'mono' }); } }
    if (k === 4 || k === 5) { mono(RX, 90, k === 4 ? 'FL(p) = −α·(1−p)^γ·log(p)' : 'FocalLoss(alpha=0.25, gamma=2.0)', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      if (k === 4) { sub(RX + 190, 130, 'γ (focusing): 쉬운 예제를 누른다', fade(u, 1.0), { 'font-size': 15 }); sub(RX + 190, 158, 'α (balance): 클래스 가중', fade(u, 1.4), { 'font-size': 15 }); }
      else { sub(RX + 190, 130, 'RetinaNet 기본값 — 양성 α, 음성 1−α', fade(u, 1.0), { 'font-size': 15 }); sub(RX + 190, 158, 'γ=2 곡선은 쉬운 구간에서 거의 0', fade(u, 1.4), { 'font-size': 15, fill: BAD }); } }
    if (k === 6) { mono(RX, 90, 'p_t = exp(−ce)', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(RX, 120, 'loss = α_t · (1−p_t)^γ · ce', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
      sub(RX + 190, 154, 'softmax 를 다시 계산하지 않는 요령', fade(u, 1.0), { 'font-size': 14.5 }); }
    if (k === 8) { tx(RX, 100, '어느 쪽을 고를까', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      pill(RX + 110, 150, '1:10 → class weight', INK, pop(u, 0.6), { fs: 15 }); pill(RX + 130, 200, '1:1000 · 검출 → Focal', BAD, pop(u, 1.0), { fs: 15 });
      sub(RX + 190, 236, '축이 달라 함께 쓸 수 있다 (α-balanced Focal)', fade(u, 1.5), { 'font-size': 14.5 }); }
    if (k === 0) { tx(RX, 100, '보통 CE = −log p', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); sub(RX + 190, 136, 'p 가 높아도 손실이 0 이 되지 않는다', fade(u, 1.4), { 'font-size': 15 }); sub(RX + 190, 164, '쉬운 예제 수만 개가 경사를 점령', fade(u, 1.8), { 'font-size': 15, fill: WARN }); }
    // 혼동행렬 전 → 후 (예시)
    if (k !== 7 && cf.before) { const y0 = 300; tx(RX, y0 - 34, '혼동행렬 (예시 수치) — 행 실제 · 열 예측', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      conf(RX + 40, y0, cf.before, 1, 68); mono(RX + 106, y0 + 110, `재현율 ${cf.before.recall}%`, { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
      const prevR = c.prev && c.prev.lossBox ? c.prev.lossBox.confusion.after.recall : cf.before.recall, chg = prevR !== cf.after.recall;
      grow(RX + 182, y0 + 40, RX + 222, y0 + 40, 1, MUT);
      if (cf.after) { const op = chg ? fade(u, 1.6) : 1; conf(RX + 270, y0, cf.after, op, 68);
        mono(RX + 336, y0 + 110, `재현율 ${Math.round(chg ? tween(prevR, cf.after.recall, u - 1.4, 0.8) : cf.after.recall)}%`, { 'font-size': 14, 'font-weight': 700, fill: cf.after.recall >= 70 ? GOOD : cf.after.recall > 12 ? WARN : BAD, 'text-anchor': 'middle', opacity: op }); } } }

  // ---------- 5. 실무 레시피 ----------
  function prCurve(ax, u, col) { const pts = []; for (let i = 0; i <= 40; i++) { const r = i / 40; pts.push([r, 0.95 - 0.7 * Math.pow(r, 3)]); } R.line(ax, pts, u, col || ACC, { sw: 3 }); return pts; }
  function s5(t, c) { const { k, u } = c, rc = c.beat.recipe || {}, pipe = rc.pipeline || [], ppipe = c.prev && c.prev.recipe ? c.prev.recipe.pipeline.length : 0;
    // 위: 작업 순서 파이프라인 (5칸)
    const ALL = ['데이터 수집·분포 확인', '증강 설계 (train만)', '리샘플링/가중 손실', 'PR-AUC로 평가', '임계값을 비용으로 결정'];
    ALL.forEach((s, i) => { const x = 100 + i * 190, on = i < pipe.length, isNew = on && i >= ppipe;
      card(x, 40, 176, 40, { rx: 8, stroke: on ? ACC : GRID, fill: on ? ACCBG : PANEL, text: s, fs: 13.5, color: on ? ACC : OFF, s: isNew ? pop(u, 0.3) : 1 });
      if (i) grow(x - 102, 40, x - 90, 40, 1, on ? ACC : GRID, { plain: true }); });
    const Y = 110;
    if (k === 0) { ['증강은 train 만', '평가는 PR-AUC', '수집 > 증강 > 가중치'].forEach((s, i) => { const op = fade(u, 0.6 + i * 0.5); el('rect', { x: 180, y: Y + 30 + i * 70, width: 600, height: 54, rx: 10, fill: SOFT, opacity: op }); tx(210, Y + 64 + i * 70, `${i + 1}. ${s}`, { 'font-size': 18, 'font-weight': 800, opacity: op }); });
      sub(480, 400, '체크리스트를 코드 위에 적어 두면 어긴 곳이 바로 보인다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 1 || k === 6 || k === 7) { const ax = R.axes(110, Y + 30, 360, 230, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1], yt: [0, 0.5, 1], xl: '재현율 (recall)', yl: '정밀도 (precision)' });
      const pts = prCurve(ax, k === 1 ? E(u, 0.3, 1.4) : 1);
      if (k !== 7) { const area = el('polygon', { points: [[0, 0], ...pts, [1, 0]].map(([a, b]) => `${ax.X(a)},${ax.Y(b)}`).join(' '), fill: ACCBG, opacity: k === 1 ? 0.8 * fade(u, 1.4) : 0.8 }); area.parentNode.insertBefore(area, area.parentNode.firstChild); }
      sub(290, 404, '(곡선 모양은 개념도)', 1, { 'font-size': 13.5 });
      if (k === 1) { mono(530, Y + 60, 'average_precision_score', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); sub(700, Y + 92, '= PR 곡선 아래 넓이 (PR-AUC)', fade(u, 1.4), { 'font-size': 15 });
        mono(530, Y + 150, 'precision_recall_curve', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) }); sub(700, Y + 182, '= 임계값별 (정밀도, 재현율)', fade(u, 2.1), { 'font-size': 15 }); }
      if (k === 6) { const ax2 = R.axes(560, Y + 40, 320, 150, { x: [0, 30], y: [0, 1], xt: [0, 15, 30], xl: 'epoch', yl: 'PR-AUC' });
        R.line(ax2, Array.from({ length: 31 }, (_, e) => [e, 0.2 + 0.55 * (1 - Math.exp(-e / 8))]), E(u, 0.3, 1.8), ACC, { sw: 3 });
        mono(530, Y + 268, 'print(f"epoch {epoch}  PR-AUC {pr_auc:.3f}")', { 'font-size': 14, opacity: fade(u, 1.6) }); sub(720, Y + 296, '임계값과 무관한 요약 한 줄 (곡선은 개념도)', fade(u, 2.0), { 'font-size': 14 }); }
      if (k === 7) { const r = lerp(0.5, 0.95, E(u, 0.4, 1.6)), pr = 0.95 - 0.7 * Math.pow(r, 3);
        el('circle', { cx: ax.X(r), cy: ax.Y(pr), r: 8, fill: BAD }); el('line', { x1: ax.X(0.95), y1: Y + 30, x2: ax.X(0.95), y2: Y + 260, stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: fade(u, 1.6) });
        mono(ax.X(0.95), Y + 22, 'recall 95%', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
        tx(540, Y + 70, '불량 유출 = 재검사의 20배 비용 (예)', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.3) });
        sub(700, Y + 110, '→ 재현율 95% 를 만족하는', fade(u, 1.2), { 'font-size': 15 }); sub(700, Y + 136, '최대 정밀도 지점의 thr', fade(u, 1.4), { 'font-size': 15 });
        pill(700, Y + 200, '0.5 는 기본값일 뿐', WARN, pop(u, 2.0), { fs: 15 }); sub(700, Y + 250, '임계값은 모델이 아니라 사업이 정한다', fade(u, 2.3), { 'font-size': 14.5 }); }
      return; }
    if (k === 2) { [['train_ds', 'train_tf_v2', true, ACC], ['val_ds', 'val_tf', false, GOOD]].forEach(([nm, tfn, rnd, col], r) => { const y = Y + 60 + r * 140, op = fade(u, 0.3 + r * 0.8);
        mono(60, y, `${nm} ← ${tfn}`, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
        [0, 1, 2, 3].forEach((i) => { const x = 380 + i * 130, p = frame(x, y + 4, 90, { op }); cat(p, 1.0, rnd ? Object.assign({ tf: TFS[i][1] }, TFS[i][2] || {}) : {}); }); });
      sub(480, 404, 'val 에 무작위 변환이 하나라도 있으면 그 점수는 못 믿는다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD }); return; }
    if (k === 3) { mono(60, Y + 40, 'train_loader = DataLoader(train_ds, batch_size=64, sampler=sampler)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      mono(60, Y + 80, 'val_loader   = DataLoader(val_ds, batch_size=64, shuffle=False)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.7) });
      waffle(120, Y + 120, 50, 16, fade(u, 1.0)); sub(200, Y + 290, 'train 배치 ≈ 50:50', fade(u, 1.2), { 'font-size': 14 });
      waffle(560, Y + 120, 1, 16, fade(u, 1.5)); sub(640, Y + 290, 'val 은 원래 분포 그대로 99:1', fade(u, 1.7), { 'font-size': 14 }); return; }
    if (k === 4) { mono(60, Y + 40, 'x, y_soft = mixup(x, y, num_classes=2, alpha=0.2)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      for (let i = 0; i < 5; i++) { const lam = [0.9, 0.15, 0.6, 0.97, 0.3][i], op = fade(u, 0.6 + i * 0.2), x = 120 + i * 150, p = frame(x, Y + 130, 100, { op }); cat(p, 1.1, { op: lam }); const g = el('g', { opacity: 1 - lam }, p); el('circle', { cx: 0, cy: 0, r: 30, fill: BADBG, stroke: BAD, 'stroke-width': 2 }, g); mono(x, Y + 200, `λ ${lam}`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
      mono(60, Y + 250, 'loss = -(y_soft * F.log_softmax(logits, 1)).sum(1).mean()', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      sub(480, Y + 290, 'Mixup 은 transform 이 아니라 배치 단위 · λ 는 예시', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 5) { mono(60, Y + 40, 'model.eval()  ·  with torch.no_grad():', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
      for (let i = 0; i < 6; i++) { const op = fade(u, 0.5 + i * 0.15), x = 90 + i * 70; const p = frame(x, Y + 120, 56, { op }); cat(p, 0.62); }
      grow(500, Y + 120, 560, Y + 120, E(u, 1.2, 1.5), MUT);
      const ps = [0.12, 0.05, 0.81, 0.33, 0.02, 0.64]; ps.forEach((v, i) => { const op = fade(u, 1.5 + i * 0.1); el('rect', { x: 590 + i * 46, y: Y + 160 - 110 * v, width: 32, height: 110 * v, rx: 3, fill: BAD, opacity: op * 0.8 }); });
      el('line', { x1: 580, y1: Y + 160, x2: 870, y2: Y + 160, stroke: MUT, 'stroke-width': 1.5 });
      mono(590, Y + 186, 'probs: 불량 확률 (막대는 예시)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) });
      sub(480, Y + 260, '확률을 모아 두면 임계값을 나중에 자유롭게 바꿔 본다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k 8: 우선순위
    [[1, '진짜 소수 샘플 수집', 170, GOOD], [2, '증강', 120, ACC], [3, '리샘플링·가중 손실·임계값', 80, WARN]].forEach(([n, s, h, col], i) => { const x = [330, 160, 500][i], op = fade(u, 0.3 + i * 0.4), y = 340 - h * E(u, 0.3 + i * 0.4, 0.9 + i * 0.4);
      el('rect', { x: x - 80, y, width: 160, height: 340 - y, rx: 6, fill: col, opacity: 0.25 * op }); mono(x, 340 - h + 34, String(n), { 'font-size': 26, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op }); tx(x, 364, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); });
    ['val/test 무작위 증강', 'accuracy 자축'].forEach((s, i) => { const op = fade(u, 1.8 + i * 0.3); card(770, 160 + i * 80, 260, 48, { rx: 8, stroke: BAD, fill: BADBG, text: s, fs: 15, color: BAD, op }); cross(640, 160 + i * 80, 9, op); });
    tx(770, 120, '금지', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }

  RA.page({ title: '증강과 불균형 — 같은 라벨의 다른 모습, 소수 클래스의 목소리', scenes: [s1, s2, s3, s4, s5] });
})();
