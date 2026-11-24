/* III-1-1 Dataset·DataLoader — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 891행·배치 27개·자투리 27개·[32, 3]·패딩 [4, 7]·713/178 은 venv torch 로 돌린 값,
 *       타이타닉 앞 5행은 train.csv 실제 값, 워커 실측(초)은 이 장비(12코어 Windows)에서 4ms 짜리 가짜 로딩으로 잰 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    dbIcon, cross, check, clock, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const B = R.BEAT;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 91.17) * 43758.5453; return s - Math.floor(s); };

  // 텐서 격자: r×c 칸, 칸 크기 cs. o.fill(r,c) 색, o.val(r,c) 글자, o.shape 위에 모양 표기
  function grid(x, y, r, c, cs, o) { o = o || {}; const op = o.op ?? 1;
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) { const s = o.s ? o.s(i, j) : 1; if (s <= 0) continue;
      el('rect', { x: x + j * cs, y: y + i * cs, width: cs - 2, height: cs - 2, rx: 3, fill: o.fill ? o.fill(i, j) : ACCBG, stroke: o.stroke || ACC, 'stroke-width': 1.2, opacity: op * clamp(s) });
      const v = o.val && o.val(i, j); if (v != null) mono(x + j * cs + (cs - 2) / 2, y + i * cs + cs / 2 + 4, String(v), { 'font-size': o.fs || 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: op * clamp(s), fill: o.color || INK }); }
    if (o.shape) mono(x, y - 9, o.shape, { 'font-size': 15, 'font-weight': 800, fill: o.scol || ACC, opacity: op }); }
  // 서랍장 (Dataset): n 칸, hot 번째가 튀어나온다
  function cabinet(cx, cy, n, hot, o) { o = o || {}; const w = o.w || 92, h = 22, top = cy - (n * h) / 2, op = o.op ?? 1;
    el('rect', { x: cx - w / 2 - 6, y: top - 6, width: w + 12, height: n * h + 12, rx: 8, fill: SOFT, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    for (let i = 0; i < n; i++) { const out = i === hot ? (o.out ?? 1) * 22 : 0;
      el('rect', { x: cx - w / 2 + out, y: top + i * h + 2, width: w, height: h - 4, rx: 4, fill: i === hot ? ACCBG : PANEL, stroke: i === hot ? ACC : GRID, 'stroke-width': 1.5, opacity: op });
      mono(cx - w / 2 + 12 + out, top + i * h + 15, o.lab ? o.lab(i) : String(i), { 'font-size': 13.5, fill: i === hot ? ACC : MUT, 'font-weight': 700, opacity: op }); } }
  // 배치 쟁반 (DataLoader): 쌓인 판 n 장
  function tray(cx, cy, n, o) { o = o || {}; const op = o.op ?? 1;
    for (let i = 0; i < n; i++) el('rect', { x: cx - 52 + i * 5, y: cy - 22 - i * 9, width: 92, height: 34, rx: 6, fill: i === n - 1 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 1.8, opacity: op });
    el('path', { d: `M${cx - 66},${cy + 16} L${cx + 66},${cy + 16} L${cx + 56},${cy + 30} L${cx - 56},${cy + 30} Z`, fill: ACC, opacity: 0.85 * op }); }
  function folderIcon(cx, cy, s, op, col) { const g = R.G(cx, cy, s ?? 1, op ?? 1), c = col || INK;
    el('path', { d: 'M-34,-20 L-12,-20 L-6,-13 L34,-13 L34,22 L-34,22 Z', fill: PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    [[-24, -4], [-4, -4], [16, -4]].forEach(([x, y]) => el('rect', { x, y, width: 14, height: 18, rx: 2, fill: c === INK ? OFF : ACCBG, stroke: c, 'stroke-width': 1 }, g)); return g; }
  function csvIcon(cx, cy, s, op, col) { const g = R.G(cx, cy, s ?? 1, op ?? 1), c = col || INK;
    el('rect', { x: -34, y: -22, width: 68, height: 44, rx: 4, fill: PANEL, stroke: c, 'stroke-width': 2.2 }, g);
    [-10, 2, 14].forEach((y) => el('line', { x1: -34, y1: y, x2: 34, y2: y, stroke: GRID, 'stroke-width': 1.5 }, g));
    [-11, 12].forEach((x) => el('line', { x1: x, y1: -22, x2: x, y2: 22, stroke: GRID, 'stroke-width': 1.5 }, g)); return g; }

  // =========================================================
  // 1. 소스는 제각각, 학습 루프는 하나
  // =========================================================
  const SX = 92, DX = 330, LX = 560, TX = 812, PY = 150;
  function s1(t, c) { const { k, u } = c;
    // 소스 세 가지
    const srcOp = k === 0 ? 0.55 : k === 5 ? 1 : 0.8, swap = k === 5 ? E(u, 0.3, 1.3) : 0;
    folderIcon(SX, 62, 1, k === 5 ? 0.55 + 0.45 * swap : srcOp, k === 5 && swap > 0.5 ? ACC : INK); sub(SX, 100, '이미지 폴더', 1, { fill: k === 5 && swap > 0.5 ? ACC : MUT, 'font-weight': 700 });
    csvIcon(SX, 150, 1, k === 5 ? 1 - 0.5 * swap : srcOp, k === 5 ? (swap > 0.5 ? OFF : ACC) : INK); sub(SX, 189, 'CSV', 1, { fill: MUT, 'font-weight': 700 });
    dbIcon(SX, 236, null, { s: 0.42, op: srcOp }); sub(SX, 274, 'DB · API', 1, { fill: MUT, 'font-weight': 700 });
    // 소스 → Dataset
    const from = k === 5 ? lerp(150, 62, swap) : 150;
    el('line', { x1: SX + 40, y1: from, x2: DX - 62, y2: PY, stroke: ACC, 'stroke-width': 2.2, opacity: k === 0 ? fade(u, 0.3) : 1 });
    cabinet(DX, PY, 6, k === 0 ? Math.floor(seg(u, 0.4, 2.4) * 6) % 6 : k === 5 ? 2 : -1, { op: k === 0 ? pop(u, 0.2) : 1, stroke: k === 5 ? ACC : INK });
    lbl(DX, PY + 92, 'Dataset', k === 0 ? fade(u, 0.4) : 1); sub(DX, PY + 112, 'i번째 하나 꺼내기', k === 0 ? fade(u, 0.5) : 1);
    grow(DX + 62, PY, LX - 72, PY, k === 0 ? E(u, 0.9, 1.4) : 1, ACC);
    tray(LX, PY + 8, 3, { op: k === 0 ? fade(u, 1.1) : 1 });
    lbl(LX, PY + 92, 'DataLoader', k === 0 ? fade(u, 1.3) : 1); sub(LX, PY + 112, '배치로 묶기 · 섞기', k === 0 ? fade(u, 1.4) : 1);
    if (k === 0) { banner(480, 360, 'from torch.utils.data import Dataset, DataLoader', pop(u, 1.9)); return; }
    // 학습 함수
    const tb = card(TX, PY, 190, 96, { rx: 12, stroke: GOOD, sw: 2.5, fill: GOODBG, s: k === 1 ? pop(u, 0.2) : 1 });
    tx(0, -18, 'train(loader, …)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: GOOD }, tb);
    tx(0, 8, 'for xb, yb in loader:', { 'font-size': 13.5, 'text-anchor': 'middle', class: 'mono' }, tb);
    tx(0, 30, '학습 루프', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, tb);
    grow(LX + 70, PY, TX - 100, PY, k === 1 ? E(u, 0.5, 1.0) : 1, GOOD);
    if (k === 1) { el('path', { d: `M${TX},${PY + 50} C${TX},${PY + 150} ${SX + 60},${PY + 160} ${SX + 44},${PY + 90}`, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.2) });
      cross(470, PY + 140, 13, pop(u, 1.6)); note(500, PY + 146, 'train() 은 파일 경로도 DB 접속도 모른다', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 2) { for (let i = 0; i < 3; i++) fly(LX + 30, PY - 30, TX - 40, PY - 70, seg(u, 0.2 + i * 0.7, 0.9 + i * 0.7), '(xb, yb)', { mono: true });
      const n = Math.min(3, Math.floor(seg(u, 0.5, 2.6) * 3 + (u > 0.9 ? 1 : 0)));
      mono(TX, PY + 76, n ? `배치 ${n}번째` : '', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      note(480, 360, '루프는 받기만 한다 · 묶고 섞는 일은 loader 가 끝냈다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    // 아래 띠: 배치 하나로 하는 일
    const Y = 300;
    if (k === 3) { grid(60, Y, 4, 3, 22, { shape: 'xb [32, 3]', s: (i) => seg(u, 0.2 + i * 0.12, 0.5 + i * 0.12) });
      mono(126, Y + 104, '…32행', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      grow(140, Y + 40, 220, Y + 40, E(u, 0.7, 1.0), MUT); card(270, Y + 40, 90, 46, { rx: 10, text: 'model', fs: 15, mono: true, s: pop(u, 0.8) });
      grow(318, Y + 40, 390, Y + 40, E(u, 1.1, 1.4), MUT); grid(400, Y + 18, 2, 2, 22, { shape: 'pred', s: () => seg(u, 1.3, 1.6) });
      grow(450, Y + 40, 540, Y + 40, E(u, 1.6, 1.9), MUT); pill(470, Y + 80, 'yb [32]', INFO, pop(u, 1.6), { mono: true, fs: 13.5 });
      card(610, Y + 40, 120, 46, { rx: 10, text: 'loss_fn', fs: 15, mono: true, s: pop(u, 1.8) });
      grow(672, Y + 40, 740, Y + 40, E(u, 2.0, 2.3), ACC); card(790, Y + 40, 86, 46, { rx: 23, text: 'loss', fs: 15, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.2) });
      return; }
    if (k === 4) { const W = [0.42, -0.17, 0.88, 0.05], G1 = [0.31, -0.08, 0.12, 0.27];
      const z = E(u, 0.3, 0.8), bk = E(u, 1.0, 1.5), st = E(u, 1.8, 2.3);
      tx(60, Y + 4, 'w', { 'font-size': 15, 'font-weight': 800, class: 'mono' }); tx(60, Y + 64, 'grad', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN });
      cells(120, Y - 18, W.map((w, i) => (w - 0.1 * G1[i] * st).toFixed(2)), { w: 70, h: 34, style: () => ({ stroke: st > 0 ? ACC : INK, fill: st > 0.5 ? ACCBG : PANEL }) });
      cells(120, Y + 42, G1.map((g) => (bk > 0.5 ? g.toFixed(2) : z > 0.5 ? '0' : '?')), { w: 70, h: 34, style: () => ({ stroke: WARN, fill: bk > 0.5 ? WARNBG : PANEL, color: bk > 0.5 ? WARN : MUT }) });
      [['zero_grad()', 0.3, MUT], ['backward()', 1.0, WARN], ['step()', 1.8, ACC]].forEach(([s, a, col], i) => pill(600 + i * 120, Y + 20, s, col, pop(u, a), { mono: true, fs: 13.5 }));
      sub(720, Y + 70, 'II-2-1 의 3박자 그대로', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k5: 소스만 교체
    pill(SX + 150, 30, 'CSV → 이미지 폴더', ACC, pop(u, 0.3), { fs: 13.5 });
    check(LX, PY - 70, 12, pop(u, 1.4)); check(TX, PY - 70, 12, pop(u, 1.6));
    note(480, 330, '바뀐 것: Dataset 하나', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC, 'font-size': 17 });
    note(480, 360, 'DataLoader · train() 은 0줄 변경', fade(u, 2.1), { 'text-anchor': 'middle', 'font-size': 16 }); }

  // =========================================================
  // 2. 커스텀 Dataset — __len__ · __getitem__
  // =========================================================
  const ROWS = [[22, 7.25, 3, 0], [38, 71.2833, 1, 1], [26, 7.925, 3, 1], [35, 53.1, 1, 1], [35, 8.05, 3, 0]];
  const COLS = ['age', 'fare', 'pclass', 'survived'], CX = [70, 150, 240, 330];
  function csvTable(o) { o = o || {}; const y0 = 76, rh = 32;
    el('rect', { x: 30, y: y0 - 26, width: 370, height: rh * 7 + 6, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(40, y0 - 34, 'titanic.csv', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    COLS.forEach((h, j) => { const hot = o.colHot && o.colHot(j);
      if (hot) el('rect', { x: CX[j] - 34, y: y0 - 22, width: 76, height: rh * 6 + 2, rx: 6, fill: j === 3 ? INFOBG : ACCBG, opacity: hot });
      mono(CX[j], y0, h, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: j === 3 ? INFO : INK }); });
    el('line', { x1: 36, y1: y0 + 10, x2: 394, y2: y0 + 10, stroke: GRID, 'stroke-width': 1.5 });
    ROWS.forEach((r, i) => { const s = o.rowS ? o.rowS(i) : 1; if (s <= 0) return; const y = y0 + 34 + i * rh, hot = o.hot === i;
      if (hot) el('rect', { x: 34, y: y - 21, width: 362, height: rh - 2, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      mono(18, y, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
      r.forEach((v, j) => mono(CX[j], y, String(v), { 'font-size': 14, 'text-anchor': 'middle', opacity: s, fill: hot ? ACC : INK, 'font-weight': hot ? 800 : 500 })); });
    mono(215, y0 + 34 + 5 * rh, '… 891행', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: o.more ?? 1 }); }
  function klass(slots, o) { o = o || {}; const x = 450, y = 46, w = 480;
    el('rect', { x, y, width: w, height: 330, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 16, y + 26, 'class TitanicDataset(Dataset):', { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1 });
    [['__init__(self, csv_path)', 70], ['__len__(self)', 170], ['__getitem__(self, i)', 250]].forEach(([s, yy], i) => { const st = slots[i]; if (st == null) return;
      el('rect', { x: x + 16, y: y + yy - 26, width: w - 32, height: i === 0 ? 92 : 70, rx: 8, fill: st > 0 ? (i ? GOODBG : SOFT) : PANEL, stroke: st > 0 ? (i ? GOOD : INK) : OFF, 'stroke-width': 1.8, 'stroke-dasharray': st > 0 ? null : '6 5' });
      mono(x + 30, y + yy - 4, 'def ' + s, { 'font-size': 14, 'font-weight': 700, fill: st > 0 ? (i ? GOOD : INK) : MUT });
      if (i) tx(x + w - 30, y + yy - 4, '계약 ' + (i === 1 ? '①' : '②'), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: st > 0 ? GOOD : MUT }); }); }
  function s2(t, c) { const { k, u } = c;
    csvTable({ rowS: k === 0 ? (i) => seg(u, 0.3 + i * 0.25, 0.6 + i * 0.25) : null, more: k === 0 ? fade(u, 1.6) : 1,
      colHot: k === 2 ? (j) => (j < 3 ? fade(u, 0.3) : fade(u, 1.2)) : null, hot: k >= 4 ? 3 : null });
    if (k === 0) { pill(560, 110, 'import pandas as pd', INFO, pop(u, 1.0), { mono: true, fs: 14 }); pill(640, 170, 'from torch.utils.data import Dataset', ACC, pop(u, 1.5), { mono: true, fs: 14 });
      note(670, 260, '지킬 약속은 두 메서드뿐', fade(u, 2.1), { 'text-anchor': 'middle', 'font-size': 17 }); return; }
    klass([k >= 1 ? 1 : 0, k >= 3 ? 1 : 0, k >= 4 ? 1 : 0], { op: k === 1 ? fade(u, 0.1, 0.5) : 1 });
    if (k === 1) { mono(480, 146, 'df = pd.read_csv(csv_path)', { 'font-size': 14, opacity: fade(u, 1.0) });
      sub(690, 178, '여기는 가볍게 · 경로와 메타만', fade(u, 1.6), { 'font-size': 14, fill: WARN, 'font-weight': 700 }); return; }
    // __init__ 안: self.X · self.y
    const sx = k === 2 ? E(u, 0.6, 1.3) : 1, sy = k === 2 ? E(u, 1.4, 2.1) : 1;
    if (k === 2) { fly(190, 210, 560, 150, seg(u, 0.4, 1.3), 'age · fare · pclass', { mono: true }); fly(330, 210, 790, 150, seg(u, 1.2, 2.1), 'survived', { mono: true, fill: INFO }); }
    if (sx >= 1) { mono(480, 146, 'self.X', { 'font-size': 15, 'font-weight': 800 }); pill(610, 141, '(891, 3)', ACC, k === 2 ? pop(u, 1.3) : 1, { mono: true, fs: 14 }); }
    if (sy >= 1) { mono(700, 146, 'self.y', { 'font-size': 15, 'font-weight': 800, fill: INFO }); pill(820, 141, '(891,)', INFO, k === 2 ? pop(u, 2.1) : 1, { mono: true, fs: 14 }); }
    if (k === 2) return;
    // __len__
    const n = k === 3 ? Math.round(tween(0, 891, u, 1.6)) : 891;
    mono(480, 244, 'return len(self.y)', { 'font-size': 14, fill: MUT }); mono(890, 246, `→ ${n}`, { 'font-size': 22, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' });
    if (k === 3) { sub(670, 400, 'DataLoader 는 이 값으로 0 ~ 890 인덱스를 만든다', fade(u, 1.8), { 'font-size': 14 }); return; }
    // __getitem__(3)
    const a = k === 4 ? E(u, 0.4, 1.4) : 1;
    mono(480, 326, 'i = 3', { 'font-size': 14, fill: MUT });
    if (k === 4) fly(200, 220, 640, 320, seg(u, 0.3, 1.3), 'row 3', { mono: true });
    if (a >= 1 || k === 5) { cells(540, 308, ['35.0', '53.1', '1.0'], { w: 58, h: 30, fs: 14, style: () => ({ stroke: ACC, fill: ACCBG, s: k === 4 ? pop(u, 1.4) : 1 }) });
      cells(740, 308, ['1'], { w: 40, h: 30, fs: 14, style: () => ({ stroke: INFO, fill: INFOBG, s: k === 4 ? pop(u, 1.7) : 1 }) });
      mono(540, 364, 'x: float32 [3]', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 4 ? fade(u, 1.9) : 1 });
      mono(740, 364, 'y: long', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 4 ? fade(u, 2.1) : 1 }); }
    if (k === 5) { banner(215, 340, 'len(ds) → 891   ds[3] → (x, y)', pop(u, 0.3)); check(215, 388, 12, pop(u, 1.2));
      note(30, 412, '배치도 셔플도 모르는 채로 "하나"만 책임진다', fade(u, 1.6), { 'font-size': 14 }); } }

  // =========================================================
  // 3. DataLoader 해부
  // =========================================================
  const NB = 28;   // 891 = 27×32 + 27
  function bar(y, o) { o = o || {}; const x0 = 40, W = 800, cw = W / (891 / 32);
    for (let b = 0; b < NB; b++) { const n = b < 27 ? 32 : 27, x = x0 + b * cw + (o.split ? b * 3 * o.split : 0), w = cw * n / 32 - 2, last = b === 27;
      const gone = last && o.drop ? o.drop : 0;
      for (let q = 0; q < 4; q++) { const lab = o.mix ? (hsh(b * 4 + q) > 0.5 ? 1 : 0) : (b * 4 + q < 62 ? 0 : 1);
        el('rect', { x, y: y + q * 9, width: w * (1 - 0.0), height: 8, fill: lab ? GOOD : BAD, opacity: (o.mix != null ? 0.75 : 0.55) * (1 - gone * 0.8) }); }
      if (last && gone > 0.5) cross(x + w / 2, y + 18, 11, 1); } }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const sp = k === 0 ? E(u, 0.8, 1.8) : 1;
      tx(40, 66, 'ds  ·  891 샘플', { 'font-size': 15, 'font-weight': 700 }); pill(820, 60, 'batch_size=32', ACC, k === 0 ? pop(u, 0.4) : 1, { mono: true, fs: 14 });
      bar(90, { split: sp, mix: k === 1 ? null : null });
      if (k === 0) { sub(480, 150, '32개씩 자르면 27묶음 + 자투리 27개', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 });
        note(40, 210, '빨강 = 라벨 0, 초록 = 라벨 1 (파일이 라벨 순으로 정렬돼 있다면)', fade(u, 2.2), { 'font-size': 14, fill: MUT }); return; }
      // k1: shuffle + drop_last
      tx(40, 196, 'shuffle=True', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      if (u > 0.4) bar(216, { split: 1, mix: true, drop: E(u, 1.5, 2.1) });
      sub(480, 278, '에폭마다 순서를 새로 섞는다 · 순서를 외우지 못하게', fade(u, 0.9), { 'font-size': 14.5, fill: INK });
      pill(780, 330, 'drop_last=True → 27개 버림', WARN, pop(u, 1.6), { fs: 14 }); pill(300, 330, '배치 27개 / 에폭', ACC, pop(u, 2.1), { fs: 14 });
      sub(480, 390, 'shuffle 은 train 에서만 · val/test 는 False', fade(u, 2.4), { 'font-size': 14, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 2) { // 샘플 32개 → torch.stack → [32, 3]
      for (let i = 0; i < 6; i++) { const s = seg(u, 0.2 + i * 0.18, 0.5 + i * 0.18), y0 = 70 + i * 44, y1 = 90 + i * 26;
        const x = lerp(90, 560, E(u, 0.9 + i * 0.12, 1.5 + i * 0.12)), y = lerp(y0, y1, E(u, 0.9 + i * 0.12, 1.5 + i * 0.12));
        if (s > 0) { cells(x, y, ['', '', ''], { w: 26, h: 22, style: () => ({ stroke: ACC, fill: ACCBG, op: s }) }); if (x < 300) mono(x - 12, y + 16, `[3]`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); } }
      mono(650, 278, '⋮ 32행', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      card(400, 200, 130, 44, { rx: 10, text: 'torch.stack', fs: 15, mono: true, stroke: INK, s: pop(u, 0.7) });
      mono(560, 70, 'xb.shape', { 'font-size': 15, opacity: fade(u, 2.0) }); mono(560, 312, 'torch.Size([32, 3])', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) });
      sub(480, 390, '모양이 같아야 쌓인다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 가변 길이
    const SEQ = [[3, 1, 4, 1, 5], [9, 2, 6], [5, 3, 5, 8, 9, 7, 9], [3, 2]];
    const pad = k >= 4 ? (k === 4 ? E(u, 0.3, 1.2) : 1) : 0;
    SEQ.forEach((s, i) => { const vals = s.concat(Array(7 - s.length).fill(0)), n = s.length;
      cells(120, 70 + i * 52, vals.slice(0, k >= 4 ? 7 : n), { w: 40, h: 40, fs: 15, style: (j) => j < n ? ({ stroke: ACC, fill: ACCBG, s: k === 3 ? pop(u, 0.2 + i * 0.2) : 1 }) : ({ stroke: OFF, fill: SOFT, color: MUT, dash: '4 3', op: clamp(pad * 7 - (j - n)) }) });
      mono(100, 98 + i * 52, `len ${n}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    if (k === 3) { card(660, 150, 220, 50, { rx: 10, text: 'torch.stack(seqs)', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.1) });
      cross(660, 214, 13, pop(u, 1.5)); mono(660, 258, 'RuntimeError: stack expects each', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      mono(660, 280, 'tensor to be equal size, but got', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(660, 302, '[5] at entry 0 and [3] at entry 1', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 400, '기본 collate 는 길이가 다르면 그대로 멈춘다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    mono(120, 56, 'padded', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: pad }); mono(420, 56, '[4, 7]', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: pad });
    if (k === 4) { mono(470, 152, 'lengths', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      cells(470, 166, ['5', '3', '7', '2'], { w: 44, h: 36, style: () => ({ stroke: INFO, fill: INFOBG, s: pop(u, 1.5) }) });
      sub(700, 300, '0 은 빈자리 · 원래 길이를 같이 넘겨야', fade(u, 1.9), { 'font-size': 14.5, fill: INK });
      sub(700, 322, '모델이 패딩을 무시할 수 있다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    // k5: collate_fn 을 로더에
    card(620, 110, 260, 48, { rx: 10, text: 'collate_fn=pad_collate', fs: 15, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
    grow(620, 136, 620, 180, E(u, 0.6, 1.0), ACC);
    [['padded', '[16, Lmax]', ACC], ['ys', '[16]', INFO], ['lengths', '[16]', WARN]].forEach(([a, b, col], i) => { const s = pop(u, 1.0 + i * 0.3);
      card(620, 210 + i * 50, 240, 40, { rx: 8, stroke: col, sw: 2, s }); mono(520, 216 + i * 50, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.1 + i * 0.3) });
      mono(720, 216 + i * 50, b, { 'font-size': 15, 'text-anchor': 'end', opacity: fade(u, 1.1 + i * 0.3) }); });
    sub(620, 380, 'batch_size=16 · 배치마다 이 규칙으로 조립', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); }

  // =========================================================
  // 4. num_workers — GPU 를 굶기지 마라
  // =========================================================
  const MEAS = [[0, 2.24, 2.21], [2, 3.85, 1.12], [4, 3.72, 0.56], [8, 5.47, 0.30]];
  function lane(x, y, w, cellsArr, u0, o) { o = o || {}; const n = cellsArr.length, cw = w / n;
    cellsArr.forEach((kd, i) => { const s = seg(u0, i / n, (i + 1) / n); if (s <= 0 || !kd) return;
      const col = kd === 'load' ? INFO : kd === 'gpu' ? GOOD : BAD;
      el('rect', { x: x + i * cw + 1, y, width: (cw - 2) * s, height: 28, rx: 4, fill: col, opacity: kd === 'idle' ? 0.35 : 0.8 });
      if (s > 0.9 && !o.nolab) tx(x + i * cw + cw / 2, y + 19, kd === 'load' ? '준비' : kd === 'gpu' ? 'GPU' : '유휴', { 'font-size': 13.5, 'font-weight': 700, fill: kd === 'idle' ? BAD : PANEL, 'text-anchor': 'middle' }); }); }
  function stopwatch(cx, cy, r, frac) { el('rect', { x: cx - 6, y: cy - r - 12, width: 12, height: 8, rx: 2, fill: INK }); clock(cx, cy, r, frac, ACC); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { stopwatch(860, 90, 34, E(u, 0.3, 2.4));
      tx(60, 110, 'num_workers=0', { 'font-size': 15, 'font-weight': 800, class: 'mono' }); sub(130, 132, '메인 프로세스 혼자', 1);
      lane(260, 92, 520, ['load', 'gpu', 'idle', 'load', 'gpu', 'idle', 'load', 'gpu'], E(u, 0.3, 2.4) * 1.0);
      grow(260, 150, 780, 150, E(u, 0.3, 2.4), MUT); sub(790, 172, '시간', 1, { 'text-anchor': 'end' });
      note(480, 260, 'GPU 가 데이터를 기다리는 칸이 생긴다', fade(u, 2.0), { 'text-anchor': 'middle', fill: BAD, 'font-size': 17 });
      sub(480, 300, '적정 워커 수는 이론이 아니라 실측으로 정한다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { tx(60, 60, 'num_workers=4', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      for (let w = 0; w < 4; w++) { tx(80, 104 + w * 40, `워커 ${w + 1}`, { 'font-size': 14, 'font-weight': 700, fill: INFO });
        const arr = Array(8).fill(null); arr[w] = 'load'; arr[w + 4] = 'load'; lane(160, 86 + w * 40, 520, arr, E(u, 0.2, 2.2), { nolab: true }); }
      tx(80, 284, 'GPU', { 'font-size': 14, 'font-weight': 800, fill: GOOD });
      lane(160, 266, 520, [null, 'gpu', 'gpu', 'gpu', 'gpu', 'gpu', 'gpu', 'gpu'], E(u, 0.6, 2.4));
      card(820, 170, 150, 92, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.8) }); tx(820, 150, '준비된 배치 큐', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.9) });
      for (let q = 0; q < Math.floor(seg(u, 0.9, 2.2) * 3); q++) el('rect', { x: 770 + q * 34, y: 170, width: 28, height: 36, rx: 4, fill: INFO, opacity: 0.7 });
      pill(820, 330, 'pin_memory=True', ACC, pop(u, 1.9), { mono: true, fs: 14 }); sub(820, 362, 'GPU 복사를 빠르게 (Step 5)', fade(u, 2.1));
      return; }
    if (k === 2) { snippet(60, 70, ['t0 = time.time()', 'for xb, yb in loader:', '    pass        # 모델 없음', 'return time.time() - t0'], { op: fade(u, 0.2) });
      card(560, 128, 130, 50, { rx: 10, text: 'model', fs: 16, mono: true, stroke: OFF, color: MUT, dash: '6 4', s: pop(u, 0.6) }); cross(560, 128, 16, pop(u, 1.0));
      stopwatch(800, 140, 44, E(u, 1.0, 2.4));
      note(480, 300, '학습을 빼고 재야 병목이 로딩인지 GPU 인지 갈린다', fade(u, 1.6), { 'text-anchor': 'middle', 'font-size': 16 });
      sub(480, 336, '실험: 샘플 512개, __getitem__ 마다 4ms 걸리는 가짜 로딩, batch_size=64', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 3) { // spawn 재 import
      card(150, 110, 170, 54, { rx: 10, text: 'python main.py', fs: 15, mono: true, s: pop(u, 0.2) });
      [0, 1].forEach((i) => { const x = 420, y = 70 + i * 84; grow(236, 110, x - 82, y + 6, E(u, 0.5 + i * 0.2, 1.0 + i * 0.2), MUT);
        card(x, y + 6, 160, 46, { rx: 10, text: `워커 ${i + 1}: import main`, fs: 14, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.9 + i * 0.2) }); });
      // 가드 없음
      zone(560, 50, 370, 150, '가드 없으면', { fill: BADBG, color: BAD });
      for (let i = 0; i < 8; i++) { const s = seg(u, 1.2 + i * 0.12, 1.5 + i * 0.12); if (s > 0) el('circle', { cx: 600 + (i % 4) * 80, cy: 110 + Math.floor(i / 4) * 50, r: 13 * s, fill: BAD, opacity: 0.75 }); }
      sub(745, 190, '워커가 또 워커를 띄운다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 });
      zone(560, 220, 370, 150, '가드 있으면', { fill: GOODBG, color: GOOD });
      mono(590, 282, 'if __name__ == "__main__":', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) });
      mono(610, 312, '    for n in [0, 2, 4, 8]: …', { 'font-size': 14, opacity: fade(u, 2.0) }); check(890, 340, 12, pop(u, 2.2));
      sub(300, 300, 'Windows · macOS 는 spawn 방식', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(300, 324, '리눅스(fork)에선 안 터져서 더 헷갈린다', fade(u, 1.6), { 'font-size': 14 }); return; }
    // k4: 실측 막대
    const ax = R.axes(150, 70, 560, 260, { x: [0, 1], y: [0, 6], yt: [0, 2, 4, 6], yl: '초', grid: true });
    MEAS.forEach(([n, e1, e2], i) => { const cx = 150 + 70 + i * 140, g1 = E(u, 0.3 + i * 0.2, 1.0 + i * 0.2), g2 = E(u, 1.0 + i * 0.2, 1.7 + i * 0.2);
      el('rect', { x: cx - 44, y: ax.Y(e1 * g1), width: 40, height: ax.Y(0) - ax.Y(e1 * g1), rx: 3, fill: OFF });
      el('rect', { x: cx + 4, y: ax.Y(e2 * g2), width: 40, height: ax.Y(0) - ax.Y(e2 * g2), rx: 3, fill: ACC });
      mono(cx - 24, ax.Y(e1) - 8, e1.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0 + i * 0.2) });
      mono(cx + 24, ax.Y(e2) - 8, e2.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7 + i * 0.2) });
      mono(cx, 352, `w=${n}`, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 }); });
    el('rect', { x: 740, y: 90, width: 14, height: 12, rx: 2, fill: OFF }); tx(762, 101, '첫 에폭 (워커 띄우기 포함)', { 'font-size': 13.5, fill: MUT });
    el('rect', { x: 740, y: 118, width: 14, height: 12, rx: 2, fill: ACC }); tx(762, 129, '둘째 에폭', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 });
    note(740, 200, '0 → 8 에서 2.21초 → 0.30초', fade(u, 2.1), { 'font-size': 14.5 });
    note(740, 226, '첫 에폭은 spawn 비용이 더 크다', fade(u, 2.3), { 'font-size': 14.5, fill: WARN });
    sub(480, 400, '이 장비(12코어 Windows) 실측 예시 · CPU 디코딩이면 코어 수 근처에서 더 안 빨라진다', fade(u, 2.4), { 'font-size': 13.5 }); }

  // =========================================================
  // 5. 실무 카탈로그
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['MNIST', '손글씨 숫자'], ['CIFAR10', '작은 사진 10종'], ['ImageNet', '대규모 분류']].forEach(([a, b], i) => { const s = pop(u, 0.3 + i * 0.3);
        card(200 + i * 280, 150, 220, 110, { rx: 12, stroke: ACC, sw: 2, s }); mono(200 + i * 280, 140, `datasets.${a}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4 + i * 0.3) });
        sub(200 + i * 280, 170, b, fade(u, 0.5 + i * 0.3), { 'font-size': 14 }); });
      pill(480, 280, 'from torchvision import datasets, transforms', INK, pop(u, 1.5), { mono: true, fs: 14 });
      pill(480, 330, 'from torch.utils.data import random_split', INK, pop(u, 1.8), { mono: true, fs: 14 });
      sub(480, 390, '흔한 형태면 Dataset 을 손으로 짤 필요가 없다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { const tree = [['data/train/', 0, INK], ['cats/', 1, WARN], ['001.jpg  002.jpg …', 2, MUT], ['dogs/', 1, INFO], ['101.jpg  102.jpg …', 2, MUT]];
      tree.forEach(([s, d, col], i) => mono(60 + d * 30, 90 + i * 40, s, { 'font-size': 15, 'font-weight': d < 2 ? 800 : 500, fill: col, opacity: fade(u, 0.2 + i * 0.2) }));
      card(560, 150, 220, 50, { rx: 10, text: 'ImageFolder(...)', fs: 15, mono: true, s: pop(u, 1.1) }); grow(340, 150, 446, 150, E(u, 1.0, 1.3), MUT);
      mono(560, 236, "classes = ['cats', 'dogs']", { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.6) });
      pill(500, 290, 'cats → 0', WARN, pop(u, 1.9), { mono: true, fs: 14 }); pill(640, 290, 'dogs → 1', INFO, pop(u, 2.0), { mono: true, fs: 14 });
      sub(560, 340, '폴더 이름 = 라벨 (이름순으로 번호)', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { const W = 760, x0 = 100, sp = E(u, 0.8, 1.6);
      tx(x0, 90, 'full', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      let nt = 0, nv = 0;
      for (let i = 0; i < 40; i++) { const toVal = hsh(i * 3 + 1) < 0.2, xi = x0 + i * (W / 40), r = toVal ? nv++ : nt++;
        const tx_ = toVal ? lerp(xi, 640 + r * 20, sp) : lerp(xi, x0 + r * 15, sp), ty = lerp(104, 240, sp);
        el('rect', { x: tx_, y: ty, width: lerp(W / 40 - 4, 12, sp), height: 26, rx: 3, fill: toVal && sp > 0.5 ? WARN : ACC, opacity: 0.75 }); }
      tx(x0, 228, 'train_ds', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.6) });
      tx(640, 228, 'val_ds', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN, opacity: fade(u, 1.6) });
      mono(x0, 300, 'n_val = int(len(full) * 0.2)', { 'font-size': 15, opacity: fade(u, 1.8) });
      sub(480, 350, '예: 891개면 713 / 178 · 무작위로 갈라 겹치는 샘플이 없다', fade(u, 2.1), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { zone(40, 70, 260, 230, 'CPU 메모리', { fill: SOFT });
      for (let w = 0; w < 4; w++) card(110, 120 + w * 44, 110, 32, { rx: 6, text: `워커 ${w + 1}`, fs: 13.5, stroke: INFO, color: INFO, s: pop(u, 0.2 + w * 0.15) });
      zone(320, 70, 260, 230, '고정(pinned) 메모리', { fill: ACCBG, color: ACC, op: fade(u, 0.8) });
      for (let q = 0; q < 3; q++) el('rect', { x: 370 + q * 60, y: 160, width: 46, height: 60, rx: 5, fill: ACC, opacity: 0.6 * fade(u, 1.0 + q * 0.2) });
      zone(640, 70, 280, 230, 'GPU', { fill: GOODBG, color: GOOD, op: fade(u, 1.3) });
      for (let i = 0; i < 3; i++) dot([[250, 190], [400, 190], [720, 190], [840, 190]], ((t * 0.7 + i / 3) % 1) * (u > 1.4 ? 1 : 0), ACC, 7);
      pill(480, 350, 'shuffle=True · num_workers=4 · pin_memory=True', ACC, pop(u, 1.8), { mono: true, fs: 14 });
      sub(480, 395, 'pin_memory 는 CUDA 로 보낼 때만 의미가 있다 (I-2-2)', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k4: val 은 섞지 않는다
    tx(60, 100, 'train_loader', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC });
    tx(60, 220, 'val_loader', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN });
    const order = [5, 0, 7, 2, 9, 3, 1, 8, 4, 6];
    cells(220, 76, order.map(String), { w: 50, h: 38, style: (i) => ({ stroke: ACC, fill: ACCBG, s: pop(u, 0.2 + i * 0.06) }) });
    cells(220, 196, order.map((_, i) => String(i)), { w: 50, h: 38, style: (i) => ({ stroke: WARN, fill: WARNBG, s: pop(u, 0.9 + i * 0.06) }) });
    sub(480, 140, 'shuffle=True · 매 에폭 다른 순서', fade(u, 0.7), { 'font-size': 14 }); sub(480, 260, 'shuffle=False · 매번 같은 순서', fade(u, 1.5), { 'font-size': 14, fill: WARN, 'font-weight': 700 });
    banner(480, 330, 'print(len(train_ds), len(val_ds))  # 8 : 2', pop(u, 2.0)); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '데이터 소스를 CSV에서 이미지 폴더로 바꿀 때 새로 짜야 하는 것은 무엇인가?',
      o: ['train() 학습 루프', 'Dataset 클래스', 'DataLoader와 train() 둘 다'], a: 1,
      why: '소스를 아는 것은 Dataset 하나뿐이다. DataLoader와 for xb, yb in loader 루프는 그대로 쓴다.' },
    { q: 'Dataset이 반드시 구현해야 하는 두 메서드는 무엇인가?',
      o: ['__len__과 __getitem__', '__init__과 __iter__', 'shuffle과 batch'], a: 0,
      why: '__len__은 샘플 수(891)를, __getitem__(i)는 i번째 (특징, 라벨) 한 쌍을 돌려준다. 배치와 셔플은 DataLoader 몫이다.' },
    { q: '891개를 batch_size=32, drop_last=True로 묶으면 한 에폭의 배치 수는 무엇인가?',
      o: ['28개', '32개', '27개'], a: 2,
      why: '891 = 32×27 + 27이다. drop_last가 마지막 자투리 27개를 버리므로 배치는 27개다.' },
    { q: 'Windows에서 num_workers=4로 돌렸더니 프로세스가 끝없이 늘었다. 빠진 것은 무엇인가?',
      o: ['pin_memory=True', 'if __name__ == "__main__": 가드', 'persistent_workers=True'], a: 1,
      why: 'spawn 방식에서는 워커가 스크립트를 다시 import 한다. 실행 코드가 가드 밖에 있으면 워커가 또 워커를 띄운다.' },
    { q: 'val_loader에 shuffle=False를 주는 이유는 무엇인가?',
      o: ['검증은 학습이 아니라 순서를 섞을 이유가 없고 결과 비교가 쉬워서', '셔플하면 검증 데이터가 학습에 섞여서', 'False 여야 pin_memory가 켜져서'], a: 0,
      why: '셔플은 학습할 때 순서를 외우지 못하게 하려는 것이다. 검증은 같은 순서로 돌려야 실행끼리 비교하기 쉽다.' },
  ];

  const summary = [
    '데이터 소스가 무엇이든 학습 루프는 for xb, yb in loader 한 줄로 받는다.',
    'Dataset은 __len__과 __getitem__ 두 메서드로 샘플 하나만 책임진다.',
    'DataLoader는 891개를 32개씩 묶고 섞으며, drop_last면 자투리 27개를 버린다.',
    '길이가 다른 샘플은 collate_fn에서 패딩하고, 워커 수는 직접 재서 고른다.',
  ];
  const review = [
    { q: '문장 데이터를 DataLoader로 묶자 stack expects each tensor to be equal size 오류가 났다. 먼저 손볼 곳은?',
      o: ['batch_size를 1로 줄이기', 'pad_sequence로 길이를 맞추는 collate_fn 넘기기', '__len__ 반환값 고치기'], a: 1,
      why: '기본 collate는 torch.stack으로 쌓으므로 길이가 다르면 멈춘다. collate_fn에서 0으로 패딩하고 원래 길이를 함께 넘긴다.' },
    { q: '이미지 수십만 장 Dataset의 __init__에서 모든 사진을 미리 열었더니 메모리가 터졌다. 어떻게 고치나?',
      o: ['num_workers를 0으로 둔다', 'batch_size를 키운다', '__init__에는 경로만 두고 __getitem__에서 한 장씩 연다'], a: 2,
      why: '__init__은 가볍게 메타만 들고, 무거운 로딩은 샘플을 꺼낼 때 한다. 그래야 메모리에 한 배치 분량만 올라간다.' },
    { q: 'Windows에서 num_workers를 0에서 8로 올렸는데 첫 에폭이 오히려 느려졌다. 가장 그럴듯한 이유는?',
      o: ['워커 프로세스를 띄우는 비용이 첫 에폭에 들어가서', 'drop_last가 꺼져 있어서', 'shuffle이 순서를 망가뜨려서'], a: 0,
      why: '이 장의 실측에서 첫 에폭은 2.24초에서 5.47초로 늘었지만 둘째 에폭은 2.21초에서 0.30초로 줄었다. persistent_workers로 워커를 살려 두면 띄우는 비용은 한 번만 든다.' },
  ];

  R.page({ title: '데이터 배관 — Dataset · DataLoader', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
