/* III-1-2 transforms·증강 파이프라인 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 픽셀 (200, 150, 100) → /255 → Normalize → 역정규화 왕복, 채널별 범위 -2.12 ~ 2.64 는 venv torch 로 계산한 값.
 *       그림 속 8×8 그림, 에폭별 변형, bbox 좌표(40~120)는 설명용 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, snippet, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 8×8 그림: '#' 집(ACC), 's' 해(WARN), '.' 하늘. 좌우가 달라 뒤집기가 보인다
  const PIC = ['s s.....', ' s .....', '.....#..', '....###.', '...#####', '...#.#.#', '...#####', '########'].map((r) => r.replace(/ /g, 's'));
  // 그림 그리기: o.flip, o.crop=[r0,c0,n] (그 부분을 8칸으로 키움), o.lum 밝기(0.4~1.3), o.erase=[r,c,h,w], o.mono 회색, o.sel=[r,c]
  function pic(x, y, cs, o) { o = o || {}; const op = o.op ?? 1, [r0, c0, n] = o.crop || [0, 0, 8], lum = o.lum ?? 1;
    el('rect', { x: x - 2, y: y - 2, width: cs * 8 + 4, height: cs * 8 + 4, rx: 4, fill: PANEL, stroke: o.frame || GRID, 'stroke-width': 2, opacity: op });
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const si = Math.min(7, r0 + Math.floor((i * n) / 8)), sjr = Math.min(7, c0 + Math.floor((j * n) / 8)), sj = o.flip ? 7 - sjr : sjr, ch = PIC[si][sj];
      const er = o.erase && i >= o.erase[0] && i < o.erase[0] + o.erase[2] && j >= o.erase[1] && j < o.erase[1] + o.erase[3];
      const col = er ? OFF : o.mono ? (ch === '.' ? SOFT : MUT) : ch === '#' ? ACC : ch === 's' ? WARN : INFOBG;
      el('rect', { x: x + j * cs, y: y + i * cs, width: cs - 1, height: cs - 1, fill: col, opacity: op * (er ? 1 : clamp((ch === '.' ? 1 : 0.85) * lum, 0.15, 1)) }); }
    if (o.sel) el('rect', { x: x + o.sel[1] * cs - 2, y: y + o.sel[0] * cs - 2, width: cs + 3, height: cs + 3, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: op }); }
  // 채널 판 세 장 (C, H, W): 겹친 정도 sp 0→1 로 벌어진다
  function planes(x, y, s, sp, o) { o = o || {}; const op = o.op ?? 1, cols = [BAD, GOOD, INFO], names = ['R', 'G', 'B'];
    for (let c = 2; c >= 0; c--) { const dx = c * lerp(10, 46, sp), dy = c * lerp(-10, -14, sp);
      el('rect', { x: x + dx, y: y + dy, width: s, height: s, rx: 4, fill: PANEL, stroke: cols[c], 'stroke-width': 2.2, opacity: op });
      el('rect', { x: x + dx + 4, y: y + dy + 4, width: s - 8, height: s - 8, rx: 3, fill: cols[c], opacity: 0.18 * op });
      if (sp > 0.5) tx(x + dx + s / 2, y + dy + s / 2 + 6, names[c], { 'font-size': 16, 'font-weight': 800, fill: cols[c], 'text-anchor': 'middle', opacity: op * fade(sp, 0.5, 0.3) }); }
    if (o.shape) mono(x + s / 2 + 46, y + s + 26, o.shape, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: op }); }
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: 'M-24,-30 L12,-30 L24,-18 L24,30 L-24,30 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M12,-30 L12,-18 L24,-18', fill: 'none', stroke: INK, 'stroke-width': 1.8 }, g);
    el('rect', { x: -14, y: -10, width: 28, height: 22, rx: 2, fill: ACCBG, stroke: ACC, 'stroke-width': 1.2 }, g);
    if (name) tx(0, 50, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono' }, g); }

  // =========================================================
  // 1. 조립 라인 — Compose
  // =========================================================
  const ST = [['Resize', '(224, 224)', 330], ['ToTensor', 'PIL → Tensor', 520], ['Normalize', '(x-μ)/σ', 710]];
  function belt(u0, o) { o = o || {}; const y = 200;
    el('line', { x1: 140, y1: y + 40, x2: lerp(140, 880, u0), y2: y + 40, stroke: MUT, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.55 });
    const order = o.order || [0, 1, 2];
    order.forEach((si, pos) => { const [a, b] = ST[si], x = ST[pos][2], s = o.st ? o.st(pos) : 1; if (s <= 0) return;
      const bad = o.bad && o.bad(pos);
      card(x, y, 140, 58, { rx: 10, stroke: bad ? BAD : ACC, fill: bad ? BADBG : ACCBG, sw: 2.2, s });
      tx(x, y - 4, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: bad ? BAD : ACC, opacity: clamp(s) });
      mono(x, y + 17, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) });
      mono(x - 58, y - 38, String(pos + 1), { 'font-size': 15, 'font-weight': 800, fill: INK, opacity: clamp(s) }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['from PIL import Image', INFO, '사진 열기'], ['from torch.utils.data import Dataset', INK, '샘플 하나 꺼내기'], ['from torchvision import transforms', ACC, '변환 함수 묶음']].forEach(([s, col, d], i) => {
        pill(400, 100 + i * 80, s, col, pop(u, 0.3 + i * 0.4), { mono: true, fs: 14.5 }); tx(740, 105 + i * 80, d, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.5 + i * 0.4) }); });
      sub(480, 370, '아직 파이프라인은 없다 · 재료만 준비', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    fileIcon(70, 230, 'cat.jpg', {}); sub(70, 300, '디스크', 1);
    belt(k === 1 ? E(u, 0.1, 0.8) : 1, { st: k === 1 ? (p) => pop(u, 0.7 + p * 0.45) : null, order: k === 5 ? [0, 2, 1] : null, bad: k === 5 ? (p) => p === 1 && u > 0.9 : null });
    if (k === 1) { el('path', { d: 'M250,140 L240,140 L240,260 L250,260 M790,140 L800,140 L800,260 L790,260', fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 2.0) });
      mono(520, 120, 'transforms.Compose([ … ])', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      sub(520, 320, '리스트 순서 = 실행 순서', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { card(520, 340, 380, 60, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) });
      mono(370, 346, 'ImageDataset(paths, labels,', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      pill(640, 346, 'transform=', ACC, pop(u, 0.6), { mono: true, fs: 14 });
      grow(520, 272, 640, 326, E(u, 0.9, 1.5), ACC);
      pill(870, 320, 'train_tf', ACC, pop(u, 1.6), { mono: true, fs: 14 }); pill(870, 370, 'val_tf', WARN, pop(u, 1.9), { mono: true, fs: 14 });
      sub(520, 90, '변환을 안에서 만들지 않고 생성자로 받는다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { // 꺼낼 때마다 즉석 변환
      const p = E(u, 0.3, 2.4), x = lerp(110, 860, p), stage = x < 330 ? 0 : x < 520 ? 1 : x < 710 ? 2 : 3;
      if (stage < 2) pic(x - 28, 100, stage === 0 ? 6 : 7, {}); else planes(x - 30, 110, 46, 0, { op: 1 });
      mono(x, 96 - (stage >= 2 ? 16 : 0), ['PIL (W, H)', 'PIL 224×224', 'Tensor [0,1]', 'Tensor 정규화'][stage], { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: stage >= 2 ? ACC : INFO });
      pill(150, 360, '__getitem__(idx) 마다', INK, pop(u, 0.2), { fs: 14 });
      note(330, 366, '원본 cat.jpg 는 디스크에 그대로 남는다', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 4) { planes(790, 290, 60, 1, { shape: '' });
      mono(560, 106, 'x.shape', { 'font-size': 15, opacity: fade(u, 0.3) });
      mono(560, 136, 'torch.Size([3, 224, 224])', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      [['C', 3, 0.9], ['H', 224, 1.2], ['W', 224, 1.5]].forEach(([a, b, d], i) => pill(640 + i * 110, 380, `${a} = ${b}`, ACC, pop(u, d), { mono: true, fs: 14 }));
      sub(400, 380, 'ds[0] 하나만 꺼내도 라인이 돈다', fade(u, 1.9), { 'font-size': 14.5, fill: INK }); return; }
    // k5: 순서를 뒤집으면
    cross(520, 290, 16, pop(u, 1.0));
    mono(520, 330, 'TypeError: Normalize 는 텐서만 받는다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
    sub(520, 360, 'PIL 이미지가 Normalize 에 먼저 들어갔다', fade(u, 1.6), { 'font-size': 14.5 });
    pill(520, 100, '크기 맞추기 → 텐서화 → 정규화', GOOD, pop(u, 2.0), { fs: 15 }); }

  // =========================================================
  // 2. ToTensor · Normalize — 픽셀 하나 따라가기
  // =========================================================
  const PX = [200, 150, 100], P01 = [0.784, 0.588, 0.392], MEAN = [0.485, 0.456, 0.406], STD = [0.229, 0.224, 0.225];
  const NRM = [1.307, 0.590, -0.062], LO = [-2.118, -2.036, -1.804], HI = [2.249, 2.429, 2.640], CC = [BAD, GOOD, INFO];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { pic(60, 70, 30, { sel: [5, 5], op: 1 }); mono(180, 340, 'img.size = (W, H)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      grow(220, 236, 470, 200, E(u, 0.9, 1.4), MUT);
      cells(490, 176, PX.map(String), { w: 62, h: 46, fs: 17, style: (i) => ({ stroke: CC[i], color: CC[i], s: pop(u, 1.3 + i * 0.2) }) });
      mono(490, 160, '픽셀 (H, W, C) · uint8', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) });
      sub(640, 290, '값은 0 ~ 255 정수 · 축은 높이 · 너비 · 채널 순', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { const sp = E(u, 0.4, 1.6);
      tx(90, 90, 'HWC', { 'font-size': 18, 'font-weight': 800, opacity: 1 - sp * 0.6 }); tx(560, 90, 'CHW', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      planes(lerp(90, 520, sp), 150, 110, sp, {});
      card(330, 330, 200, 50, { rx: 10, text: 'ToTensor()', fs: 16, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      [['÷ 255', 1.6], ['축 재배치', 1.9]].forEach(([s, d], i) => pill(560 + i * 140, 330, s, ACC, pop(u, d), { fs: 14.5 }));
      return; }
    if (k === 2) { [['t.shape', '[3, 224, 224]'], ['t.dtype', 'torch.float32'], ['범위', '0.0 ~ 1.0']].forEach(([a, b], i) => {
        card(170, 110 + i * 80, 260, 60, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 0.2 + i * 0.3) }); mono(60, 106 + i * 80, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) });
        mono(60, 128 + i * 80, b, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) }); });
      PX.forEach((v, i) => { const y = 120 + i * 70; mono(520, y, String(v), { 'font-size': 18, 'font-weight': 700, fill: CC[i], 'text-anchor': 'end', opacity: fade(u, 1.0) });
        grow(536, y - 6, 640, y - 6, E(u, 1.2 + i * 0.2, 1.6 + i * 0.2), MUT); mono(590, y - 16, '÷255', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
        mono(660, y, P01[i].toFixed(3), { 'font-size': 18, 'font-weight': 800, fill: CC[i], opacity: fade(u, 1.5 + i * 0.2) }); });
      sub(620, 360, '세 줄만 찍어 봐도 ToTensor 가 한 일이 다 보인다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3) { tx(120, 70, 'ImageNet 채널 통계', { 'font-size': 16, 'font-weight': 800 });
      ['R', 'G', 'B'].forEach((ch, i) => { const y = 120 + i * 80;
        tx(120, y + 22, ch, { 'font-size': 18, 'font-weight': 800, fill: CC[i] });
        R.hbar(170, y, 300, MEAN[i], 1, { u: E(u, 0.3 + i * 0.25, 1.0 + i * 0.25), col: CC[i], text: `μ ${MEAN[i]}` });
        R.hbar(170, y + 26, 300, STD[i], 1, { u: E(u, 0.9 + i * 0.25, 1.6 + i * 0.25), col: OFF, text: `σ ${STD[i]}` }); });
      card(760, 210, 280, 110, { rx: 12, stroke: WARN, sw: 2, s: pop(u, 1.9) });
      tx(760, 196, '임의값이 아니다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) });
      sub(760, 226, '사전학습 백본이 본 입력 분포', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 4) { // 수직선 세 개: [0,1] 값이 (x-μ)/σ 자리로
      const mv = E(u, 0.6, 1.8);
      ['R', 'G', 'B'].forEach((ch, i) => { const y = 100 + i * 100, X = (v) => 200 + ((v + 2.5) / 5.5) * 620;
        el('line', { x1: X(-2.5), y1: y, x2: X(3), y2: y, stroke: GRID, 'stroke-width': 2 });
        el('rect', { x: X(LO[i]), y: y - 6, width: (X(HI[i]) - X(LO[i])) * fade(u, 0.2, 0.6), height: 12, rx: 6, fill: CC[i], opacity: 0.16 });
        [0, 1].forEach((v) => { el('line', { x1: X(v), y1: y - 9, x2: X(v), y2: y + 9, stroke: MUT, 'stroke-width': 1.5 }); mono(X(v), y + 28, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
        mono(X(LO[i]), y - 16, LO[i].toFixed(2), { 'font-size': 13.5, fill: CC[i], 'text-anchor': 'middle', opacity: fade(u, 2.0) });
        mono(X(HI[i]), y - 16, HI[i].toFixed(2), { 'font-size': 13.5, fill: CC[i], 'text-anchor': 'middle', opacity: fade(u, 2.0) });
        const v = lerp(P01[i], NRM[i], mv); el('circle', { cx: X(v), cy: y, r: 9, fill: CC[i] });
        mono(X(v), y - 18, v.toFixed(3), { 'font-size': 14, 'font-weight': 800, fill: CC[i], 'text-anchor': 'middle' });
        tx(150, y + 6, ch, { 'font-size': 18, 'font-weight': 800, fill: CC[i] }); });
      sub(480, 400, '음수가 생긴다 · 전체 범위는 약 -2.1 ~ 2.6', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: train/val 같은 통계
    const ax = axes(120, 90, 560, 230, { x: [-3, 3], y: [0, 1], xt: [-2, 0, 2], xl: '입력값' });
    const bell = (m) => Array.from({ length: 41 }, (_, i) => { const x = -3 + i * 0.15; return [x, Math.exp(-((x - m) ** 2) / 0.6)]; });
    R.line(ax, bell(0), E(u, 0.2, 1.0), ACC, { sw: 3 }); tx(ax.X(0), ax.Y(1.06), '백본이 배운 입력', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    R.line(ax, bell(1.6), E(u, 1.2, 2.0), BAD, { sw: 3, dash: '7 5' }); tx(ax.X(1.8), ax.Y(0.7), '통계를 빼먹은 val', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    card(820, 160, 210, 90, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 2.0) }); tx(820, 152, '에러는 안 난다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    sub(820, 178, '성능만 조용히 떨어진다', fade(u, 2.2), { 'font-size': 14 }); }

  // =========================================================
  // 3. 증강 — 매 에폭 다른 변형
  // =========================================================
  const VAR = [{ crop: [1, 2, 6], lum: 1 }, { crop: [0, 0, 7], flip: true, lum: 1.25 }, { crop: [2, 1, 6], lum: 0.6 }];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 90, 360, 60, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) });
      mono(480, 86, 'IMAGENET_MEAN · IMAGENET_STD', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      sub(480, 108, '한 번만 정의한 상수', fade(u, 0.4));
      [['train_tf', ACC, 240], ['val_tf', WARN, 720]].forEach(([s, col, x], i) => { grow(480 + (i ? 60 : -60), 122, x, 220, E(u, 0.7 + i * 0.3, 1.3 + i * 0.3), col);
        card(x, 260, 220, 70, { rx: 12, stroke: col, sw: 2.2, s: pop(u, 1.2 + i * 0.3) }); mono(x, 266, s, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 1.3 + i * 0.3) }); });
      sub(480, 370, '정규화 통계만큼은 두 파이프라인이 반드시 같다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { pic(40, 120, 18, {}); sub(112, 290, '원본', 1, { 'font-weight': 700, fill: INK });
      VAR.forEach((v, i) => { const x = 280 + i * 220, s = seg(u, 0.4 + i * 0.5, 0.9 + i * 0.5); if (s <= 0) return;
        pic(x, 120, 18, Object.assign({ op: s }, v)); mono(x + 72, 100, `에폭 ${i}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
        sub(x + 72, 290, ['크롭', '크롭 + 좌우 반전 + 밝게', '크롭 + 어둡게'][i], s, { 'font-size': 14 }); });
      sub(480, 370, 'RandomResizedCrop · RandomHorizontalFlip · ColorJitter · 부를 때마다 새 난수 (그림은 예시)', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    if (k === 2) { ['ToTensor', 'Normalize', 'RandomErasing'].forEach((s, i) => { pill(150 + i * 200, 80, s, i === 2 ? WARN : ACC, pop(u, 0.2 + i * 0.3), { mono: true, fs: 14 }); if (i) grow(150 + i * 200 - 130, 80, 150 + i * 200 - 76, 80, E(u, 0.3 + i * 0.3, 0.6 + i * 0.3), MUT); });
      pic(200, 140, 24, { crop: [1, 2, 6], erase: u > 1.3 ? [2, 3, Math.round(lerp(1, 3, E(u, 1.3, 2.0))), 3] : null });
      sub(296, 360, '텐서 일부를 지운다 · 가림에 강해진다', fade(u, 1.6), { 'font-size': 14.5, fill: INK });
      card(720, 230, 300, 120, { rx: 12, stroke: BAD, sw: 2, dash: '6 4', s: pop(u, 1.6) });
      tx(720, 214, 'ToTensor 앞에 두면', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.7) });
      sub(720, 244, 'PIL 이미지를 받아 그대로 에러', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 3) { // val: Resize(256) → CenterCrop(224)
      const s = 220, x = 120, y = 90, inner = s * 224 / 256, off = (s - inner) / 2;
      el('rect', { x, y, width: s, height: s, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.2) }); mono(x + s / 2, y - 12, 'Resize(256)', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 0.2) });
      el('rect', { x: x + off, y: y + off, width: inner * E(u, 0.8, 1.4), height: inner, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.8) });
      mono(x + s / 2, y + s + 26, 'CenterCrop(224) · 항상 가운데', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
      [0, 1, 2].forEach((i) => { pic(450 + i * 160, 150, 15, { crop: [1, 1, 6], op: fade(u, 1.5 + i * 0.25) }); check(510 + i * 160, 300, 11, pop(u, 1.7 + i * 0.25)); });
      sub(690, 360, '몇 번을 꺼내도 같은 결과 · 랜덤 0개', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4·k5: 두 번 꺼내서 차이 재기
    const val = k === 5, A = val ? { crop: [1, 1, 6] } : VAR[0], Bv = val ? { crop: [1, 1, 6] } : VAR[1];
    mono(60, 80, val ? 'val_tf(img)' : 'a = train_tf(img)', { 'font-size': 15, 'font-weight': 700, fill: val ? WARN : ACC }); pic(60, 100, 18, Object.assign({ op: fade(u, 0.2) }, A));
    mono(300, 80, val ? 'val_tf(img)' : 'b = train_tf(img)', { 'font-size': 15, 'font-weight': 700, fill: val ? WARN : ACC }); pic(300, 100, 18, Object.assign({ op: fade(u, 0.6) }, Bv));
    // 차이 칸
    mono(560, 80, '|a − b|', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const d = val ? 0 : ((i * 7 + j * 3) % 5 === 0 ? 0.2 : 0.75 * ((i + j) % 3 ? 1 : 0.5)), s = seg(u, 1.0 + (i * 8 + j) * 0.012, 1.3 + (i * 8 + j) * 0.012);
      el('rect', { x: 560 + j * 18, y: 100 + i * 18, width: 17, height: 17, fill: d ? BAD : SOFT, opacity: s * (d ? d : 1) }); }
    mono(632, 290, val ? 'tensor(0.)' : 'tensor(True)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: val ? WARN : ACC, opacity: fade(u, 2.0) });
    sub(632, 314, val ? '차이 합 = 0' : '차이 합 > 0', fade(u, 2.1), { 'font-size': 14 });
    note(800, 200, val ? '검증 점수가' : '증강이', fade(u, 2.2), { 'font-size': 16 }); note(800, 226, val ? '흔들리지 않는다' : '살아 있다', fade(u, 2.3), { 'font-size': 16, fill: val ? WARN : ACC }); }

  // =========================================================
  // 4. v2 API 와 변환 위치
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const m = E(u, 0.6, 1.4);
      pill(480, 130, 'from torchvision import transforms', OFF, 1 - m * 0.4, { mono: true, fs: 15, color: MUT });
      pill(480, 200, 'from torchvision.transforms import v2', ACC, pop(u, 1.0), { mono: true, fs: 15 });
      grow(480, 150, 480, 180, E(u, 0.6, 1.0), ACC);
      sub(480, 290, '이름과 인자가 거의 같다 · 임포트만 바꿔도 대부분 돈다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { tx(80, 100, 'uint8 텐서', { 'font-size': 15, 'font-weight': 700, fill: INFO });
      cells(80, 116, ['200', '150', '100'], { w: 70, h: 46, fs: 16, style: (i) => ({ stroke: [BAD, GOOD, INFO][i], s: pop(u, 0.2 + i * 0.1) }) });
      card(480, 140, 270, 54, { rx: 10, text: 'v2.ToDtype(scale=True)', fs: 15, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.8) });
      grow(300, 140, 342, 140, E(u, 0.7, 1.0), MUT); grow(618, 140, 660, 140, E(u, 1.2, 1.5), ACC);
      tx(680, 100, 'float32 [0, 1]', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      cells(680, 116, ['0.784', '0.588', '0.392'], { w: 80, h: 46, fs: 15, style: (i) => ({ stroke: [BAD, GOOD, INFO][i], s: pop(u, 1.5 + i * 0.1) }) });
      sub(480, 250, 'ToTensor 자리를 대신한다 · PIL 을 거치지 않고 텐서에서 바로', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
      sub(480, 280, 'v2.Compose([RandomResizedCrop, RandomHorizontalFlip, ToDtype, Normalize])', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 2) { const fl = E(u, 0.9, 1.6), W = 224, sc = 1.3, X0 = 80, X1 = 520, Y = 90;
      [[X0, false], [X1, true]].forEach(([x, f], i) => { if (i && fl <= 0) return;
        pic(x, Y, 28, { flip: f, op: i ? fl : 1 });
        const b = f ? [W - 120, W - 40] : [40, 120], bx = x + b[0] * sc * 224 / 224 * (224 / W) * 0.78, bw = (b[1] - b[0]) * 0.78 * sc;
        el('rect', { x: x + b[0] * 1.0, y: Y + 40, width: (b[1] - b[0]) * 1.0, height: 110, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: i ? fl : 1 });
        mono(x + 112, Y + 252, `x: ${b[0]} ~ ${b[1]}`, { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: i ? fade(u, 1.6) : 1 }); });
      grow(330, 200, 500, 200, E(u, 0.5, 0.9), MUT); mono(415, 186, 'detect_tf(img, boxes)', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      sub(640, 390, '좌우 반전에 맞춰 박스 좌표도 함께 바뀐다 (폭 224, 예시)', fade(u, 2.0), { 'font-size': 14.5, fill: INK });
      sub(640, 412, 'boxes 는 tv_tensors.BoundingBoxes 로 감싸야 같이 변환된다', fade(u, 2.3), { 'font-size': 13.5, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 3) { tx(60, 66, 'num_workers=8 · pin_memory · persistent_workers', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      for (let w = 0; w < 4; w++) { tx(60, 112 + w * 36, `워커 ${w * 2 + 1}·${w * 2 + 2}`, { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
        for (let q = 0; q < 3; q++) { const x = 170 + w * 60 + q * 220, s = seg(u, 0.2 + w * 0.15 + q * 0.4, 0.6 + w * 0.15 + q * 0.4); if (s > 0) el('rect', { x, y: 96 + w * 36, width: 150 * s, height: 24, rx: 4, fill: INFO, opacity: 0.7 }); } }
      tx(60, 282, 'GPU', { 'font-size': 14, 'font-weight': 800, fill: GOOD });
      const g = E(u, 0.8, 2.6); el('rect', { x: 170, y: 264, width: 700 * g, height: 28, rx: 4, fill: GOOD, opacity: 0.8 });
      sub(520, 340, '워커가 다음 배치를 변환하는 동안 GPU 는 이전 배치를 학습한다', fade(u, 1.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { zone(40, 70, 300, 250, 'CPU', { fill: SOFT });
      card(190, 180, 200, 60, { rx: 10, text: 'loader', fs: 16, mono: true, s: pop(u, 0.2) });
      zone(400, 70, 520, 250, 'GPU', { fill: GOODBG, color: GOOD });
      fly(290, 180, 520, 180, seg(u, 0.4, 1.2), 'x.cuda(non_blocking=True)', { mono: true });
      card(560, 190, 150, 120, { rx: 8, stroke: ACC, sw: 2, s: pop(u, 1.0) }); mono(560, 194, '[64, 3, 224, 224]', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      grow(636, 190, 690, 190, E(u, 1.3, 1.6), ACC); card(790, 190, 190, 60, { rx: 10, text: 'gpu_aug(x)', fs: 16, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.5) });
      sub(790, 250, 'Flip · ColorJitter (Kornia)', fade(u, 1.8), { 'font-size': 14 });
      sub(480, 370, '샘플 하나씩이 아니라 배치를 통째로 · 대신 GPU 메모리를 더 쓴다', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
    // k5: 병목 진단
    tx(80, 90, 'GPU 사용률', { 'font-size': 15, 'font-weight': 700 });
    const lv = Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? 0.9 : 0.15 + 0.1 * ((i * 7) % 3)));
    lv.forEach((v, i) => { const s = seg(u, 0.2 + i * 0.04, 0.4 + i * 0.04); el('rect', { x: 80 + i * 22, y: 250 - 130 * v * s, width: 16, height: 130 * v * s, rx: 3, fill: v > 0.5 ? GOOD : BAD, opacity: 0.75 }); });
    el('line', { x1: 76, y1: 250, x2: 610, y2: 250, stroke: MUT, 'stroke-width': 1.8 }); sub(345, 276, '대부분의 시간에 낮다 = 데이터를 기다린다 (그림은 예시)', fade(u, 1.2), { 'font-size': 14 });
    [['num_workers ↑', INFO], ['pin_memory=True', ACC], ['증강을 GPU 로', GOOD]].forEach(([s, col], i) => pill(790, 120 + i * 60, s, col, pop(u, 1.5 + i * 0.25), { fs: 15 }));
    sub(480, 370, '무엇을 고를지는 프로파일링으로 정한다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 5. 실무 레시피 — 커스텀 변환 · 역정규화
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['MEAN', MEAN], ['STD', STD]].forEach(([n, v], i) => { mono(330, 90 + i * 80, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 0.2 + i * 0.3) });
        cells(350, 66 + i * 80, v.map(String), { w: 76, h: 44, fs: 15, style: (j) => ({ stroke: CC[j], s: pop(u, 0.3 + i * 0.3 + j * 0.08) }) }); });
      mono(470, 210, 'torch.tensor (3,)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      grow(420, 230, 250, 310, E(u, 1.3, 1.8), ACC); grow(520, 230, 690, 310, E(u, 1.5, 2.0), WARN);
      pill(230, 340, 'Normalize', ACC, pop(u, 1.8), { mono: true, fs: 15 }); pill(710, 340, 'denormalize', WARN, pop(u, 2.0), { mono: true, fs: 15 });
      return; }
    if (k === 1 || k === 2) { card(260, 200, 380, 200, { rx: 12, stroke: INK, sw: 2, s: k === 1 ? pop(u, 0.2) : 1 });
      mono(90, 130, 'class AddGaussianNoise:', { 'font-size': 15, 'font-weight': 800 });
      mono(110, 170, 'def __init__(self, std=0.05):', { 'font-size': 14, opacity: k === 1 ? fade(u, 0.6) : 1 });
      mono(130, 196, 'self.std = std', { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 0.9) : 1 });
      if (k === 1) { pill(260, 340, '상속 X · 데코레이터 X', GOOD, pop(u, 1.4), { fs: 14 }); sub(720, 200, '세기를 인자로 받는 평범한 클래스', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      el('rect', { x: 100, y: 222, width: 320, height: 64, rx: 8, fill: GOODBG, opacity: fade(u, 0.2) });
      mono(110, 246, 'def __call__(self, x):', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
      mono(130, 272, 'return x + randn_like(x) * self.std', { 'font-size': 13.5, fill: GOOD });
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const jit = (Math.sin((i * 5 + j) * 12.9898 + Math.floor(t * 3)) * 0.5) * E(u, 0.8, 1.4);
        el('rect', { x: 560 + j * 32, y: 120 + i * 32, width: 30, height: 30, rx: 3, fill: ACC, opacity: clamp(0.45 + jit * 0.5, 0.1, 1) }); }
      sub(640, 300, '부를 수 있는 객체면 Compose 가 받는다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const L = ['RandomResizedCrop', 'RandomHorizontalFlip', 'ToTensor', 'Normalize', 'AddGaussianNoise(0.03)'];
      L.forEach((s, i) => { const y = 70 + i * 56, hot = i === 4; card(400, y, hot ? 300 : 260, 42, { rx: 8, text: s, fs: 14.5, mono: true, stroke: hot ? ACC : GRID, color: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, s: pop(u, hot ? 1.2 : 0.2 + i * 0.12) }); });
      tx(600, 248, '← PIL', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.8) }); tx(600, 296, '← 텐서', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9) });
      sub(780, 300, '텐서를 받으니 Normalize 뒤', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { // 역정규화 왕복
      [['정규화 값', NRM.map((v) => v.toFixed(3)), 0.2], ['x·σ + μ', P01.map((v) => v.toFixed(3)), 1.0], ['× 255', PX.map(String), 1.8]].forEach(([n, vals, d], r) => {
        tx(60, 108 + r * 100, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, d) });
        cells(220, 82 + r * 100, vals, { w: 90, h: 46, fs: 16, style: (j) => ({ stroke: CC[j], color: CC[j], s: pop(u, d + j * 0.1) }) });
        if (r) grow(355, 132 + (r - 1) * 100, 355, 178 + (r - 1) * 100, E(u, d - 0.4, d), MUT); });
      pic(640, 90, 22, { op: fade(u, 2.0), sel: [5, 5] }); sub(728, 300, 'clamp(0, 1) 후 사람이 볼 수 있는 그림', fade(u, 2.2), { 'font-size': 14 });
      return; }
    // k5: 눈 확인
    const T = [{ crop: [1, 2, 6] }, { crop: [0, 0, 7], flip: true }, { crop: [0, 0, 3] }, { crop: [1, 1, 6], lum: 0.7 }];
    T.forEach((o, i) => { const x = 120 + (i % 2) * 200, y = 70 + Math.floor(i / 2) * 170; pic(x, y, 17, Object.assign({ op: fade(u, 0.2 + i * 0.2) }, o));
      if (i === 2) { el('circle', { cx: x + 68, cy: y + 68, r: 84, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: fade(u, 1.4) }); } });
    mono(250, 400, 'debug_aug.png', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
    note(560, 190, '크롭이 집을 다 잘라 냈다', fade(u, 1.6), { fill: BAD, 'font-size': 16 });
    note(560, 220, '손실 곡선은 이 실수를 알려 주지 않는다', fade(u, 2.0), { 'font-size': 15 });
    note(560, 250, '학습 전에 한 번 눈으로 본다', fade(u, 2.3), { 'font-size': 15, fill: ACC }); }

  const quiz = [
    { q: 'Compose([Resize, ToTensor, Normalize]) 에서 Normalize 를 맨 앞으로 옮기면 어떻게 되는가?',
      o: ['순서와 상관없이 같은 결과가 나온다', 'PIL 이미지가 Normalize 에 들어가 에러가 난다', '정규화만 건너뛰고 계속 돈다'], a: 1,
      why: '리스트 순서가 실행 순서다. Normalize 는 텐서만 받으므로 ToTensor 보다 앞에 오면 PIL 이미지를 받고 TypeError 가 난다.' },
    { q: '픽셀 R 값 200 이 ToTensor 와 Normalize(mean 0.485, std 0.229) 를 지나면 대략 얼마가 되는가?',
      o: ['1.307', '0.784', '200'], a: 0,
      why: 'ToTensor 가 200/255 = 0.784 로 내리고, Normalize 가 (0.784 - 0.485) / 0.229 = 1.307 로 옮긴다.' },
    { q: 'val 파이프라인에 넣으면 안 되는 변환은 무엇인가?',
      o: ['CenterCrop(224)', 'Normalize(IMAGENET_MEAN, IMAGENET_STD)', 'RandomHorizontalFlip()'], a: 2,
      why: 'val 은 결정적이어야 한다. 랜덤 변환이 섞이면 같은 모델을 평가할 때마다 점수가 달라진다.' },
    { q: 'GPU 사용률이 낮고 데이터 대기가 길 때 먼저 의심할 것은 무엇인가?',
      o: ['모델이 너무 커서 생긴 연산 병목', '변환을 CPU 가 못 따라가는 입력 병목', '학습률이 너무 높은 것'], a: 1,
      why: 'GPU 가 놀고 있다면 데이터가 늦게 오는 것이다. num_workers 를 늘리거나 증강을 GPU 배치로 옮긴다.' },
    { q: '정규화된 텐서를 그대로 이미지로 저장하면 거의 까맣게 보인다. 왜 그런가?',
      o: ['값에 음수가 섞여 있고 범위가 [0, 1] 이 아니라서', 'ToTensor 가 채널을 지워서', '저장 함수가 텐서를 못 읽어서'], a: 0,
      why: '정규화 뒤 값은 약 -2.1 ~ 2.6 이다. x·std + mean 으로 되돌리고 [0, 1] 로 잘라야 사람이 볼 수 있다.' },
  ];

  const summary = [
    'transforms 는 __getitem__ 이 샘플을 꺼낼 때마다 그 자리에서 돈다. 원본은 디스크에 그대로 둔다.',
    'ToTensor 는 0~255 를 0~1 로 내리고 축을 CHW 로 바꾼다. 픽셀 200 은 0.784 가 된다.',
    'Normalize 는 채널마다 평균을 빼고 표준편차로 나눈다. train 과 val 에 같은 통계를 쓴다.',
    '랜덤 증강은 train 에만 넣고, 학습 전에 역정규화한 결과를 눈으로 확인한다.',
  ];
  const review = [
    { q: '전이학습 모델이 train 정확도는 높은데 val 에서만 크게 떨어졌다. 에러는 없다. 먼저 볼 곳은?',
      o: ['val_tf 에 Normalize 가 빠졌거나 통계가 다른지', 'num_workers 수', 'drop_last 설정'], a: 0,
      why: '통계가 어긋나면 에러 없이 입력 분포만 옮겨 간다. 백본은 ImageNet 통계로 정규화된 입력에 맞춰져 있다.' },
    { q: '검증 점수가 같은 체크포인트로 평가할 때마다 조금씩 다르게 나온다. 가장 먼저 의심할 것은?',
      o: ['Normalize 의 std 값', 'val_tf 에 Random 으로 시작하는 변환이 들어 있다', 'Resize 크기가 256 이다'], a: 1,
      why: '결정적 파이프라인이라면 같은 입력에 대해 차이가 정확히 0 이다. 랜덤 변환이 섞여야 결과가 매번 달라진다.' },
    { q: '탐지 데이터에 v2.RandomHorizontalFlip 을 걸었더니 이미지는 뒤집혔는데 박스 좌표가 그대로다. 원인은?',
      o: ['v2 는 박스를 지원하지 않는다', 'ToDtype 을 빼먹었다', 'boxes 를 일반 텐서로 넘겨서 변환 대상이 아니었다'], a: 2,
      why: 'v2 는 tv_tensors.BoundingBoxes 로 감싼 값만 박스로 알아보고 함께 바꾼다. 일반 텐서는 이미지가 따로 있으면 그대로 통과한다.' },
  ];

  R.page({ title: '변환 조립 라인 — transforms', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
