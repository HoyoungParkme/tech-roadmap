/* III-2-1 체크포인트 저장·재개 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 venv torch(CPU)로 돌린 값이다: 파라미터 101,770 · model.pt 409,289 바이트 · whole.pt 410,185 바이트 ·
 * Adam 상태 203,540 개 · 초기값/로드값 · strict=False 결과 · 재개 실험 손실(옵티마이저 복원 vs 새로 만들기).
 * best.pt 장면의 val_acc 는 III-2-2 조기 종료 실험(시드 0)의 실행값을 빌려 쓴 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, snippet, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };
  const KEYS = [['fc1.weight', '(128, 784)', '100,352'], ['fc1.bias', '(128,)', '128'], ['fc2.weight', '(10, 128)', '1,280'], ['fc2.bias', '(10,)', '10']];

  // 파라미터 덩어리: 가로 w × 세로 h 칸 무늬. fill 0→1 이면 난수 값이 채워진다
  function block(x, y, w, h, fillU, o) { o = o || {}; const n = Math.max(1, Math.round(w / 12)), m = Math.max(1, Math.round(h / 12)), cw = w / n, ch = h / m;
    el('rect', { x, y, width: w, height: h, rx: 3, fill: PANEL, stroke: o.stroke || ACC, 'stroke-width': 1.8, 'stroke-dasharray': fillU > 0 ? null : '5 4', opacity: o.op ?? 1 });
    if (fillU > 0) for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) { const s = clamp(fillU * 1.6 - (i * n + j) / (n * m)); if (s <= 0) continue;
      el('rect', { x: x + j * cw + 0.5, y: y + i * ch + 0.5, width: cw - 1, height: ch - 1, fill: hsh(i * 31 + j + (o.seed || 0)) > 0.5 ? ACC : WARN, opacity: (0.15 + 0.55 * hsh(i * 17 + j * 3 + (o.seed || 0))) * s * (o.op ?? 1) }); } }
  // Net 의 네 파라미터를 왼쪽에 그린다. show(i) 0→1 등장, fillU 값 채움
  const BL = [[70, 80, 300, 50, 'fc1.weight'], [390, 80, 14, 50, 'fc1.bias'], [70, 200, 120, 20, 'fc2.weight'], [210, 200, 10, 20, 'fc2.bias']];
  function params(show, fillU, o) { o = o || {};
    BL.forEach(([x, y, w, h, nm], i) => { const s = show(i); if (s <= 0) return; block(x, y, w, h, fillU, { op: s, seed: i * 7 });
      if (!o.nolab) mono(x, y - 10, nm, { 'font-size': 13.5, 'font-weight': 700, fill: i % 2 ? WARN : ACC, opacity: s, 'text-anchor': i === 1 ? 'middle' : 'start', ...(i === 1 ? { x: x + 7 } : {}) }); }); }
  function fileIcon(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || INK;
    el('path', { d: 'M-30,-38 L14,-38 L30,-22 L30,38 L-30,38 Z', fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M14,-38 L14,-22 L30,-22', fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    if (name) tx(0, 60, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: col }, g); return g; }
  function dictTable(x, y, rows, o) { o = o || {}; const rh = 40, w = o.w || 400;
    el('rect', { x, y, width: w, height: rh * rows.length + 34, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 14, y + 22, o.title || 'state_dict', { 'font-size': 14, 'font-weight': 800, fill: o.tcol || ACC, opacity: o.op ?? 1 });
    rows.forEach((r, i) => { const s = o.rowS ? o.rowS(i) : 1; if (s <= 0) return; const yy = y + 34 + i * rh;
      if (o.hot && o.hot(i)) el('rect', { x: x + 6, y: yy + 3, width: w - 12, height: rh - 6, rx: 6, fill: o.hot(i), opacity: 0.6 * s });
      mono(x + 16, yy + 25, r[0], { 'font-size': 15, 'font-weight': 700, opacity: s, fill: r[3] || INK });
      if (r[1]) mono(x + w * 0.5, yy + 25, r[1], { 'font-size': 14, opacity: s, fill: MUT });
      if (r[2]) mono(x + w - 14, yy + 25, r[2], { 'font-size': 14, 'font-weight': 700, opacity: s, 'text-anchor': 'end', fill: r[4] || INK }); }); }

  // =========================================================
  // 1. state_dict 의 정체
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { pill(320, 140, 'import torch', INK, pop(u, 0.3), { mono: true, fs: 16 }); tx(470, 146, 'torch.save · torch.load', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      pill(320, 220, 'import torch.nn as nn', INK, pop(u, 0.9), { mono: true, fs: 16 }); tx(470, 226, '모델 정의', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      sub(480, 330, '체크포인트에 필요한 라이브러리는 이 둘뿐이다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const show = (i) => (k === 1 ? (i < 2 ? pop(u, 0.4 + i * 0.5) : 0) : k === 2 ? (i < 2 ? 1 : pop(u, 0.3 + (i - 2) * 0.4)) : 1);
    const fillU = k < 3 ? 0 : k === 3 ? E(u, 0.3, 1.6) : 1;
    params(show, fillU);
    if (k === 1) { mono(70, 170, 'nn.Linear(784, 128)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(560, 100, 'weight [128, 784] = 100,352', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      mono(560, 130, 'bias   [128]      = 128', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      sub(480, 330, 'Linear 한 줄이 파라미터 두 개를 만든다 · 이름이 곧 키가 된다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { mono(560, 210, 'fc2: [10, 128] + [10]', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      const y = 320; [['x', 120], ['fc1', 260], ['relu', 400], ['fc2', 540], ['출력', 680]].forEach(([s, x], i) => { card(x, y, 90, 40, { rx: 20, text: s, fs: 15, mono: true, stroke: i % 4 ? INK : MUT, s: pop(u, 1.0 + i * 0.15) }); if (i) grow(x - 95, y, x - 47, y, E(u, 1.0 + i * 0.15, 1.3 + i * 0.15), MUT); });
      el('rect', { x: 60, y: 286, width: 680, height: 70, rx: 12, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.9) });
      tx(760, 326, 'forward = 계산 순서', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); tx(760, 348, '코드에만 있다', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { mono(70, 290, 'model = Net()', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      mono(70, 330, 'fc1.weight[0, :4]', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      cells(70, 342, ['-0.0003', '0.0192', '-0.0294', '-0.0263'], { w: 92, h: 38, fs: 14, style: (i) => ({ stroke: ACC, s: pop(u, 1.3 + i * 0.12) }) });
      note(560, 210, '아직 학습 전 난수', fade(u, 1.6), { 'font-size': 16 }); mono(560, 240, '균등분포 ±1/√784 = ±0.0357', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    // k4~k7: 사전
    const rows = KEYS.map(([a, b, n]) => [a, k >= 5 ? b : '', k >= 5 ? n : '', null]);
    if (k === 4) BL.forEach(([x, y, w, h], i) => grow(x + w + 4, y + h / 2, 530, 150 + i * 40, E(u, 0.3 + i * 0.2, 0.9 + i * 0.2), ACC, { sw: 1.6 }));
    if (k <= 6) { dictTable(530, 100, rows, { rowS: k === 4 ? (i) => seg(u, 0.8 + i * 0.25, 1.1 + i * 0.25) : null, w: 400, title: k === 6 ? "<class 'collections.OrderedDict'>" : 'sd = model.state_dict()' });
      if (k === 5) { mono(930, 326, `총 ${Math.round(tween(0, 101770, u, 1.5)).toLocaleString('en-US')}`, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
        sub(480, 380, '키 목록만 찍어 봐도 어느 층이 빠졌는지 보인다', fade(u, 1.9), { 'font-size': 15, fill: INK }); }
      if (k === 4) sub(480, 380, '모델을 복사하지 않는다 · 같은 텐서를 이름으로 묶어 보여 준다', fade(u, 2.0), { 'font-size': 15, fill: INK });
      if (k === 6) { note(530, 330, '순서 있는 평범한 사전', fade(u, 0.6), { 'font-size': 16 }); sub(730, 366, '키를 고르거나 이름을 바꿔 끼울 수 있다', fade(u, 1.4), { 'font-size': 14.5 }); }
      return; }
    // k7: 구조 + 값 = 모델
    card(640, 120, 220, 120, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) }); mono(640, 106, 'class Net', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    sub(640, 136, '구조 · 계산 순서', fade(u, 0.4), { 'font-size': 14 });
    tx(790, 130, '+', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
    card(640, 300, 220, 100, { rx: 12, stroke: ACC, sw: 2, fill: ACCBG, s: pop(u, 0.8) }); mono(640, 292, 'state_dict', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    sub(640, 320, '학습된 값', fade(u, 1.0), { 'font-size': 14 });
    banner(480, 395, '저장할 것은 값 뭉치 하나 · 구조는 코드가 맡는다', pop(u, 1.7)); }

  // =========================================================
  // 2. 저장의 정석
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    if (k === 0 || k === 1) { mono(60, 44, 'torch.save(model.state_dict(), "model.pt")', { 'font-size': 16, 'font-weight': 700, fill: GOOD });
      params(() => 1, 1, { nolab: true });
      fileIcon(760, 180, 'model.pt', { s: k === 0 ? pop(u, 0.9) : 1, col: GOOD });
      for (let i = 0; i < 4; i++) fly(240, 120 + i * 30, 760, 180, k === 0 ? seg(u, 0.3 + i * 0.15, 1.1 + i * 0.15) : 0, '텐서', { fill: ACC });
      mono(760, 270, '409,289 바이트', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.5) : 1 });
      if (k === 0) { sub(480, 370, '파일 안에는 텐서 값과 키 이름뿐 (101,770 × 4바이트 + 머리글)', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
      // 저울
      const tilt = E(u, 0.5, 1.5) * 6;
      el('line', { x1: 260, y1: 330 - tilt, x2: 700, y2: 330 + tilt, stroke: INK, 'stroke-width': 3 }); el('path', { d: 'M480,330 L466,360 L494,360 Z', fill: INK });
      card(300, 300 - tilt, 220, 44, { rx: 10, text: '이식성 · 버전 안정성', fs: 14.5, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3) });
      card(660, 300 + tilt, 220, 44, { rx: 10, text: '로드할 때 클래스 필요', fs: 14.5, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 0.6) });
      sub(480, 400, '단점처럼 보이는 오른쪽이 오히려 안정성의 근원이다', fade(u, 1.9), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2 || k === 3) { mono(60, 80, 'torch.save(model, "whole.pt")', { 'font-size': 16, 'font-weight': 700, fill: WARN });
      fileIcon(160, 210, 'whole.pt', { col: WARN, s: k === 2 ? pop(u, 0.3) : 1 }); mono(160, 300, '410,185 바이트', { 'font-size': 14, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.6) : 1 });
      card(470, 190, 300, 110, { rx: 12, stroke: WARN, sw: 2, s: k === 2 ? pop(u, 0.7) : 1 });
      mono(340, 170, 'pickle', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: k === 2 ? fade(u, 0.8) : 1 });
      mono(340, 200, '클래스 위치: __main__.Net', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: k === 2 ? fade(u, 1.1) : 1 });
      mono(340, 226, '+ 텐서 값 전부', { 'font-size': 14, opacity: k === 2 ? fade(u, 1.3) : 1 });
      if (k === 2) { sub(480, 370, '한 줄이 더 짧고 당장은 잘 열린다 · 문제는 몇 달 뒤에 드러난다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
      [['클래스 이동·이름 변경', '로드 실패'], ['PyTorch·파이썬 버전', '다른 환경에서 취약'], ['남이 준 pickle', '임의 코드 실행 위험']].forEach(([a, b], i) => { const s = pop(u, 0.3 + i * 0.4);
        card(820, 110 + i * 92, 220, 74, { rx: 10, stroke: BAD, sw: 2, s }); tx(720, 104 + i * 92, a, { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) });
        tx(720, 128 + i * 92, b, { 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.5 + i * 0.4) }); });
      return; }
    if (k === 4) { fileIcon(150, 180, 'model.pt', { col: GOOD }); fileIcon(150, 330, 'model.pth', { col: GOOD, s: 0.8 });
      tx(150, 400, '같은 zip', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
      const L = ['model/data.pkl', 'model/.format_version', 'model/.storage_alignment', 'model/byteorder', 'model/data/0', 'model/data/1', 'model/data/2', 'model/data/3'];
      el('rect', { x: 320, y: 70, width: 400, height: 300, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.3) });
      L.forEach((s, i) => mono(340, 102 + i * 34, s, { 'font-size': 14.5, fill: i >= 4 ? ACC : INK, 'font-weight': i >= 4 ? 700 : 500, opacity: fade(u, 0.4 + i * 0.18) }));
      sub(830, 260, 'data/0~3 = 텐서 4개', fade(u, 1.9), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      sub(830, 290, '확장자는 관례일 뿐', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5) { card(250, 170, 300, 120, { rx: 12, stroke: GOOD, sw: 2.5, fill: GOODBG, s: pop(u, 0.2) }); mono(250, 160, 'torch.save(', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.3) });
      mono(250, 188, 'model.state_dict())', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.3) }); check(250, 240, 14, pop(u, 0.6));
      card(710, 170, 300, 120, { rx: 12, stroke: OFF, sw: 2, dash: '6 5', s: pop(u, 0.8) }); mono(710, 174, 'torch.save(model)', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      cross(710, 240, 14, pop(u, 1.2));
      banner(480, 350, '구조는 코드로, 값은 사전으로', pop(u, 1.7)); return; }
    // k6: torch 2.6+ 의 weights_only 기본값
    mono(60, 80, 'torch.load("whole.pt")', { 'font-size': 16, 'font-weight': 700 });
    fileIcon(140, 200, 'whole.pt', { col: WARN });
    grow(200, 200, 330, 200, E(u, 0.3, 0.8), BAD); cross(380, 200, 15, pop(u, 0.8));
    mono(440, 180, 'UnpicklingError:', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
    mono(440, 206, 'Weights only load failed.', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.2) });
    pill(520, 290, 'PyTorch 2.6 부터 weights_only=True 가 기본', WARN, pop(u, 1.6), { fs: 14.5 });
    mono(520, 350, 'torch.load("whole.pt", weights_only=False)  # 믿는 파일만', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    sub(520, 390, 'state_dict 파일(model.pt)은 기본값 그대로 열린다', fade(u, 2.4), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); }

  // =========================================================
  // 3. 불러오기 3단계
  // =========================================================
  function s3(t, c) { const { k, u } = c;
    const stepPill = (n, s, on) => card(110 + n * 260, 28, 230, 36, { rx: 20, text: `${n + 1}) ${s}`, fs: 14.5, stroke: on ? ACC : GRID, color: on ? ACC : MUT, fill: on ? ACCBG : PANEL });
    if (k <= 2) { stepPill(0, 'model = Net()', k >= 0); stepPill(1, 'load_state_dict', k >= 1); stepPill(2, 'eval()', k >= 2); }
    if (k === 0 || k === 1) { params(() => 1, k === 0 ? E(u, 0.3, 1.2) : 1, { nolab: false });
      const v = k === 0 ? '-0.0259' : u < 1.3 ? '-0.0259' : '-0.0003', newv = k === 1 && u >= 1.3;
      mono(70, 290, 'model.fc1.weight[0, 0]', { 'font-size': 14.5, fill: MUT });
      cells(330, 268, [v], { w: 110, h: 40, fs: 16, style: () => ({ stroke: newv ? GOOD : WARN, color: newv ? GOOD : WARN, s: k === 0 ? pop(u, 1.3) : 1 + (newv ? R.bump(u, 1.3) : 0) }) });
      if (k === 0) { sub(250, 360, '구조는 같고 값은 난수 · 빈 그릇', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      fileIcon(780, 200, 'model.pt', { col: GOOD });
      for (let i = 0; i < 4; i++) fly(760, 200, BL[i][0] + BL[i][2] / 2, BL[i][1] + BL[i][3] / 2, seg(u, 0.3 + i * 0.15, 1.2 + i * 0.15), '값', { fill: GOOD });
      mono(620, 360, '<All keys matched successfully>', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const run = (y, lab, on) => { mono(80, y + 26, lab, { 'font-size': 15, 'font-weight': 700 });
        for (let r = 0; r < 2; r++) for (let j = 0; j < 8; j++) { const off = on && hsh(j * 13 + r * 5 + Math.floor(t * 2.5)) < 0.5;
          el('rect', { x: 260 + r * 320 + j * 34, y, width: 30, height: 40, rx: 4, fill: off ? SOFT : ACC, stroke: off ? OFF : ACC, opacity: off ? 1 : 0.7 }); } };
      run(130, 'model.train()', true); run(250, 'model.eval()', false);
      mono(390, 120, '실행 1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(710, 120, '실행 2', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      note(260, 210, 'Dropout 이 매번 다른 뉴런을 끈다 → 결과가 다르다', fade(u, 0.8), { fill: BAD, 'font-size': 14.5 });
      note(260, 330, '꺼지는 칸 없음 → 두 번 돌려도 같다', fade(u, 1.5), { fill: GOOD, 'font-size': 14.5 });
      sub(480, 390, 'eval() 을 빼먹으면 에러 없이 결과만 흔들린다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { zone(60, 80, 320, 220, 'GPU 머신에서 저장', { fill: GOODBG, color: GOOD }); zone(580, 80, 320, 220, 'GPU 없는 머신', { fill: SOFT });
      fileIcon(220, 190, null, { col: GOOD }); pill(220, 260, "device='cuda:0'", GOOD, 1, { mono: true, fs: 13.5 });
      fly(270, 190, 700, 190, seg(u, 0.3, 1.2), 'model.pt', { mono: true, stay: true });
      const ok = u > 1.4; pill(740, 260, ok ? "device='cpu'" : "device='cuda:0'", ok ? ACC : WARN, 1, { mono: true, fs: 13.5 });
      mono(480, 350, 'torch.load("model.pt", map_location="cpu")', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      sub(480, 390, '없으면 CUDA 를 찾다가 로드가 실패한다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    // k4~k6: strict=False
    const ck = [['fc1.weight', 1], ['fc1.bias', 1], ['fc2.weight', 2], ['fc2.bias', 2]], md = [['fc1.weight', 1], ['fc1.bias', 1], [k === 6 ? 'fc2.weight' : 'head.weight', k === 6 ? 3 : 2], [k === 6 ? 'fc2.bias' : 'head.bias', k === 6 ? 3 : 2]];
    tx(80, 74, '체크포인트 (784-128-10)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); tx(560, 74, k === 6 ? '새 모델 fc2 = Linear(128, 5)' : '새 모델 head = Linear(128, 5)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    ck.forEach(([s, m], i) => { const y = 92 + i * 52; card(200, y + 18, 240, 40, { rx: 8, stroke: m === 1 ? GOOD : WARN, sw: 2, fill: m === 1 ? GOODBG : PANEL });
      mono(100, y + 24, s, { 'font-size': 14.5, 'font-weight': 700, fill: m === 1 ? GOOD : k === 6 ? INK : WARN }); });
    md.forEach(([s, m], i) => { const y = 92 + i * 52; card(680, y + 18, 240, 40, { rx: 8, stroke: m === 1 ? GOOD : m === 3 ? BAD : INFO, sw: 2, fill: m === 1 ? GOODBG : PANEL, s: pop(u, 0.2 + i * 0.1) });
      mono(580, y + 24, s, { 'font-size': 14.5, 'font-weight': 700, fill: m === 1 ? GOOD : m === 3 ? BAD : INFO, opacity: fade(u, 0.3 + i * 0.1) });
      if (m === 1) grow(322, y + 18, 558, y + 18, E(u, 0.6 + i * 0.2, 1.1 + i * 0.2), GOOD); });
    if (k === 4) { sub(480, 340, 'strict=False · 이름이 같은 키만 채우고 나머지는 건너뛴다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 370, '오타로 키가 어긋나도 조용히 넘어가므로 반환값을 꼭 본다', fade(u, 2.1), { 'font-size': 14.5, fill: WARN }); return; }
    if (k === 5) { mono(80, 330, "missing    = ['head.weight', 'head.bias']", { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      mono(80, 362, "unexpected = ['fc2.weight', 'fc2.bias']", { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
      sub(800, 346, '의도한 층만 비었는지 확인', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    grow(322, 214, 558, 214, E(u, 0.5, 1.0), BAD); cross(440, 214, 12, pop(u, 1.0));
    mono(80, 334, 'RuntimeError: size mismatch for fc2.weight:', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    mono(80, 360, 'checkpoint [10, 128]  ↔  model [5, 128]', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 1.5) });
    sub(480, 400, '이름이 같고 모양만 다르면 strict=False 도 멈춘다 · 그 키를 사전에서 지우고 로드', fade(u, 2.0), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 4. 학습 재개 — 옵티마이저 state 까지
  // =========================================================
  const SHARED = [3.2449, 1.7509, 1.4797, 1.2685, 1.0367, 0.6113, 0.2471, 0.105, 0.0678, 0.0476];
  const FULLS = [0.038, 0.034, 0.046, 0.031, 0.041, 0.036, 0.029, 0.049, 0.041, 0.049, 0.045, 0.034];
  const FRESH = [0.038, 0.129, 0.136, 0.105, 0.115, 0.068, 0.083, 0.102, 0.074, 0.088, 0.044, 0.072];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { card(560, 200, 260, 90, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 0.2) }); mono(560, 206, 'save_ckpt(path, …)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      [['model', ACC], ['optimizer', WARN], ['scheduler', INFO], ['epoch', INK]].forEach(([s, col], i) => { const y = 90 + i * 74; pill(150, y, s, col, pop(u, 0.5 + i * 0.25), { mono: true, fs: 15 });
        grow(220, y, 424, 200 + (i - 1.5) * 16, E(u, 0.7 + i * 0.25, 1.2 + i * 0.25), col); });
      sub(560, 290, '모델 하나만 받는 함수로는 재개할 수 없다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { dictTable(60, 70, [['"epoch"', '', '9'], ['"model"', 'state_dict', ''], ['"optimizer"', 'state_dict', '', WARN], ['"scheduler"', 'state_dict', '']], { w: 380, title: 'last.pt', tcol: INK, rowS: (i) => seg(u, 0.2 + i * 0.2, 0.5 + i * 0.2), hot: (i) => (i === 2 ? WARNBG : null) });
      tx(520, 96, '저장되는 숫자 개수 (784-128-10, Adam)', { 'font-size': 14.5, 'font-weight': 700 });
      R.hbar(520, 120, 260, 101770, 203540, { u: E(u, 0.8, 1.4), col: ACC, text: '101,770' }); tx(520, 160, '모델 파라미터', { 'font-size': 13.5, fill: MUT });
      R.hbar(520, 186, 260, 203540, 203540, { u: E(u, 1.2, 1.8), col: WARN, text: '203,540' }); tx(520, 226, 'Adam 의 exp_avg + exp_avg_sq', { 'font-size': 13.5, fill: WARN });
      sub(680, 300, '옵티마이저 상태가 모델의 두 배다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(680, 328, '이걸 빼면 재개가 아니라 재시작', fade(u, 2.3), { 'font-size': 14.5, fill: BAD }); return; }
    if (k === 2) { fileIcon(160, 200, 'last.pt', {}); grow(210, 200, 380, 200, E(u, 0.3, 0.8), MUT);
      mono(400, 120, 'ckpt = torch.load(path, map_location="cpu")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      dictTable(400, 150, [['"epoch"', '', '9'], ['"model"', '', ''], ['"optimizer"', '', ''], ['"scheduler"', '', '']], { w: 300, title: 'ckpt', tcol: INK, rowS: (i) => seg(u, 0.8 + i * 0.15, 1.1 + i * 0.15) });
      sub(820, 260, '일단 CPU 로 읽고', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); sub(820, 284, '각 객체에 붓는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3) { dictTable(60, 100, [['"model"', '', ''], ['"optimizer"', '', ''], ['"scheduler"', '', ''], ['"epoch"', '', '9']], { w: 260, title: 'ckpt', tcol: INK });
      [['model', ACC], ['optimizer', WARN], ['scheduler', INFO]].forEach(([s, col], i) => { const y = 154 + i * 40; grow(326, y, 560, y, E(u, 0.3 + i * 0.3, 0.8 + i * 0.3), col);
        pill(660, y, `${s}.load_state_dict`, col, pop(u, 0.8 + i * 0.3), { mono: true, fs: 13.5 }); });
      mono(330, 280, 'return ckpt["epoch"] + 1', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      cells(400, 300, ['9', '10'], { w: 60, h: 44, fs: 17, style: (i) => ({ stroke: i ? GOOD : MUT, color: i ? GOOD : MUT, s: pop(u, 1.8 + i * 0.3) }) });
      sub(700, 330, '+1 을 빼면 같은 에폭을 두 번 돈다', fade(u, 2.2), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 4) { card(200, 200, 220, 70, { rx: 12, text: 'last.pt 있나?', fs: 16, s: pop(u, 0.2) });
      grow(310, 180, 520, 120, E(u, 0.6, 1.1), GOOD); grow(310, 220, 520, 290, E(u, 0.9, 1.4), MUT);
      card(640, 120, 240, 54, { rx: 10, text: '있다 → start_epoch = 10', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.1) });
      card(640, 290, 240, 54, { rx: 10, text: '없다 → start_epoch = 0', fs: 15, s: pop(u, 1.4) });
      sub(480, 380, '크래시 뒤에도 같은 명령을 다시 실행하기만 하면 된다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: 실험 — 재개 직후 12 스텝
    const ax = axes(110, 70, 520, 260, { x: [0, 11], y: [0, 0.15], xt: [0, 4, 8, 11], yt: [0, 0.05, 0.1, 0.15], xl: '재개 후 스텝', yl: '배치 손실', grid: true });
    R.line(ax, FULLS.map((v, i) => [i, v]), E(u, 0.2, 1.4), GOOD, { sw: 3 }); R.line(ax, FRESH.map((v, i) => [i, v]), E(u, 0.8, 2.0), BAD, { sw: 3, dash: '7 5' });
    tx(680, 110, '에폭 10 평균 손실', { 'font-size': 14.5, 'font-weight': 700 });
    mono(680, 150, '0.0375', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); tx(780, 150, '전부 복원', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.2) });
    mono(680, 190, '0.0730', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) }); tx(780, 190, '옵티마이저 새로', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
    sub(780, 250, '0.038 → 0.129 로 튄 뒤', fade(u, 2.1), { 'font-size': 14 }); sub(780, 274, '몇 에폭에 걸쳐 따라온다', fade(u, 2.2), { 'font-size': 14 });
    sub(480, 400, '실험: 20→64→1 MLP, Adam lr 0.01, 10 에폭 뒤 저장하고 재개 (torch 실행값)', fade(u, 2.4), { 'font-size': 13.5 }); }

  // =========================================================
  // 5. 실무 체계 — best/last · 안전 저장 · 메타
  // =========================================================
  const VACC = [0.678, 0.715, 0.72, 0.726, 0.729, 0.731, 0.737, 0.737, 0.743, 0.745, 0.744, 0.745];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // 쓰다가 죽어도 이전 정상본은 산다
      fileIcon(160, 170, 'last.pt', { col: GOOD }); sub(160, 260, '이전 정상본', 1, { fill: GOOD, 'font-weight': 700 });
      const w = E(u, 0.2, 1.2) * 0.6; fileIcon(460, 170, 'last.pt.tmp', { col: WARN });
      el('rect', { x: 432, y: 116, width: 56, height: 8, rx: 4, fill: SOFT }); el('rect', { x: 432, y: 116, width: 56 * w, height: 8, rx: 4, fill: WARN });
      if (u > 1.3) { cross(460, 170, 16, pop(u, 1.3)); sub(460, 270, '쓰던 중 크래시', fade(u, 1.3), { fill: BAD, 'font-weight': 700 }); }
      check(160, 300, 12, pop(u, 1.7));
      mono(740, 140, 'torch.save(obj, tmp)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(740, 180, 'os.replace(tmp, path)', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      sub(740, 214, '바꿔치기는 한 번에 일어난다', fade(u, 0.9), { 'font-size': 14 });
      sub(480, 370, '다 쓴 뒤에만 이름을 바꾸므로 반쯤 쓰인 파일이 원본을 덮지 않는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1 || k === 2) { dictTable(80, 70, [['"epoch"', '', ''], ['"model"', 'state_dict', ''], ['"optimizer"', 'state_dict', ''], ['"torch_version"', '', '', k === 2 ? ACC : INK], ['"arch"', '', '', k === 2 ? ACC : INK]], { w: 420, title: 'payload', tcol: INK, rowS: (i) => (k === 1 ? (i < 3 ? seg(u, 0.2 + i * 0.3, 0.5 + i * 0.3) : 0) : i < 3 ? 1 : seg(u, 0.2 + (i - 3) * 0.4, 0.5 + (i - 3) * 0.4)), hot: (i) => (k === 2 && i >= 3 ? ACCBG : null) });
      if (k === 1) { sub(720, 200, 'best 든 last 든 같은 payload', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(720, 228, '저장 시점만 다르다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
      mono(520, 200, 'torch.__version__', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.6) }); mono(520, 240, '"Net(784-128-10)"', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.0) });
      sub(810, 200, '몇 달 뒤 이 파일이 무엇인지', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); sub(810, 226, '알려 주는 유일한 단서', fade(u, 1.7), { 'font-size': 14.5 }); return; }
    const ax = axes(110, 80, 560, 220, { x: [0, 11], y: [0.67, 0.75], xt: [0, 3, 6, 9, 11], yt: [0.68, 0.72, 0.75], xl: '에폭', yl: 'val_acc', grid: true });
    if (k === 3) { const e = Math.min(11, Math.floor(E(u, 0.2, 2.4) * 12));
      for (let i = 0; i <= 11; i++) el('rect', { x: ax.X(i) - 9, y: 316, width: 18, height: 10, rx: 2, fill: i <= e ? OFF : SOFT });
      fileIcon(ax.X(e), 352, null, { s: 0.35, col: WARN }); mono(ax.X(e), 392, 'last.pt', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
      sub(830, 160, '조건 없이 매 에폭 덮어쓴다', fade(u, 0.8), { 'font-size': 14.5, fill: INK, 'font-weight': 700 });
      sub(830, 188, '가장 최근 = 재개용', fade(u, 1.2), { 'font-size': 14.5, fill: WARN });
      sub(830, 216, '가장 좋은 것은 아니다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    // k4~k6: best.pt
    R.line(ax, VACC.map((v, i) => [i, v]), k === 4 ? E(u, 0.2, 2.2) : 1, ACC, { sw: 2.6 });
    let best = 0; VACC.forEach((v, i) => { const shown = k === 4 ? E(u, 0.2, 2.2) * 11 >= i : true; if (!shown) return;
      const up = v > best; if (up) best = v; el('circle', { cx: ax.X(i), cy: ax.Y(v), r: up ? 7 : 5, fill: up ? GOOD : PANEL, stroke: up ? GOOD : MUT, 'stroke-width': 2 }); });
    const nSave = VACC.reduce((a, v, i) => { if (v > a.b) { a.b = v; a.n++; } return a; }, { b: 0, n: 0 }).n;
    if (k === 4) { sub(830, 150, '초록 점 = best.pt 저장', fade(u, 1.0), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 });
      sub(830, 178, `12 에폭 중 ${nSave}번`, fade(u, 2.2), { 'font-size': 14.5 }); sub(830, 206, '같거나 낮으면 건너뛴다', fade(u, 2.3), { 'font-size': 14.5 });
      sub(390, 390, 'val_acc 는 예시 학습의 실행값 · 배포는 best, 재개는 last', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    if (k === 5) { pill(830, 150, `best_acc = ${best}`, GOOD, pop(u, 0.3), { mono: true, fs: 15 });
      grow(830, 176, 830, 250, E(u, 0.8, 1.3), GOOD); card(830, 280, 220, 54, { rx: 10, text: '다음 에폭의 비교 기준', fs: 14.5, s: pop(u, 1.3) });
      sub(830, 350, '전역 변수 대신 주고받는다', fade(u, 1.9), { 'font-size': 14 }); return; }
    // k6: 주기 저장본은 최근 k 개만
    ['epoch_5.pt', 'epoch_10.pt', 'epoch_15.pt', 'epoch_20.pt', 'epoch_25.pt'].forEach((s, i) => { const gone = i < 2 && u > 1.2 + i * 0.3;
      card(820, 100 + i * 52, 180, 40, { rx: 8, text: s, fs: 14, mono: true, stroke: gone ? OFF : INFO, color: gone ? OFF : INFO, s: pop(u, 0.2 + i * 0.15) });
      if (gone) cross(925, 100 + i * 52, 9, 1); });
    sub(820, 380, '최근 k 개만 남긴다 (k=3)', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'model.state_dict() 에 들어 있지 않은 것은 무엇인가?',
      o: ['fc1.weight 텐서', 'forward 의 계산 순서', 'fc2.bias 텐서'], a: 1,
      why: 'state_dict 는 이름 → 텐서 사전이다. 계산 순서는 Net 클래스 코드에만 있어서, 로드할 때 클래스가 꼭 필요하다.' },
    { q: 'torch.save(model, "whole.pt") 방식이 위험한 가장 큰 이유는 무엇인가?',
      o: ['pickle 이 클래스 위치를 굳혀 코드 이동·이름 변경에 깨져서', '파일이 state_dict 보다 몇 배 커서', 'GPU 에서만 열려서'], a: 0,
      why: '크기는 거의 같다(410,185 대 409,289 바이트). 문제는 pickle 이 __main__.Net 같은 경로를 함께 저장한다는 점이다.' },
    { q: '로드한 모델로 추론했더니 같은 입력에 결과가 매번 다르다. 빠진 한 줄은 무엇인가?',
      o: ['torch.load(..., map_location="cpu")', 'load_state_dict(..., strict=False)', 'model.eval()'], a: 2,
      why: 'train 모드에서는 Dropout 이 매번 다른 뉴런을 끈다. eval() 로 바꿔야 결과가 고정된다.' },
    { q: '재개할 때 옵티마이저를 새로 만들면 무슨 일이 생기는가?',
      o: ['아무 차이 없이 이어진다', 'Adam 의 누적 모멘트가 0 이 되어 손실이 잠시 튄다', '모델 가중치가 난수로 돌아간다'], a: 1,
      why: '실험에서 재개 직후 배치 손실이 0.038 에서 0.129 로 튀었고, 에폭 평균도 0.0375 대신 0.0730 이 됐다.' },
    { q: '저장 도중 프로세스가 죽어도 이전 체크포인트를 지키는 방법은 무엇인가?',
      o: ['임시 파일에 다 쓴 뒤 os.replace 로 바꿔치기', '확장자를 .pth 로 바꾸기', '매 배치마다 저장하기'], a: 0,
      why: '다 쓴 뒤에만 이름을 바꾸므로 반쯤 쓰인 파일이 원본을 덮지 않는다.' },
  ];

  const summary = [
    '모델의 학습된 값은 state_dict 에 있고, 계산 순서는 클래스 코드에 있다.',
    '저장은 torch.save(model.state_dict()) 가 표준이다. 통째 저장은 클래스 경로에 묶인다.',
    '불러오기는 Net() 생성, load_state_dict, eval() 순서로 한다.',
    '재개용 파일에는 옵티마이저 상태까지 넣는다. 빼면 재개 직후 손실이 튄다.',
  ];
  const review = [
    { q: '클래스 Net 을 models/net.py 로 옮겼더니 예전에 저장한 파일이 안 열린다. 어떤 저장 방식이었을까?',
      o: ['torch.save(model.state_dict(), ...)', 'torch.save(model, ...)', 'os.replace 로 저장'], a: 1,
      why: '통째 저장은 pickle 이 __main__.Net 같은 클래스 위치를 굳힌다. state_dict 파일이었다면 새 위치의 Net() 에 값을 부으면 된다.' },
    { q: '분류층을 10개에서 5개 클래스로 바꾸고 strict=False 로 로드했더니 size mismatch 가 났다. 어떻게 하나?',
      o: ['strict=True 로 바꾼다', 'map_location="cpu" 를 준다', '모양이 다른 fc2 키를 사전에서 지우고 로드한다'], a: 2,
      why: 'strict=False 는 이름이 어긋난 키만 건너뛴다. 이름이 같고 모양이 다르면 여전히 멈추므로 그 키를 빼고 넣는다.' },
    { q: '밤새 학습이 12에폭에서 죽었다. last.pt 에 model 만 있고 optimizer 가 없다. 다시 돌리면 예상되는 모습은?',
      o: ['처음 몇 스텝 손실이 튀었다가 따라온다', '0에폭부터 다시 시작한다', '손실이 전혀 변하지 않는다'], a: 0,
      why: '모델 값은 이어받지만 Adam 의 모멘트가 0 에서 다시 쌓인다. 이 장의 실험처럼 손실이 잠시 튀었다가 회복된다.' },
  ];

  R.page({ title: '체크포인트 — state_dict 저장·재개', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
