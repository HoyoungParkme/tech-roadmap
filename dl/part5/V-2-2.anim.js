/* V-2-2 파인튜닝→서빙 파이프라인 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 노트북의 모델이 "배포 상자"에 담겨 → 작게 눌리고(INT8) → 서버에 상주하며 요청을 받고 → 지연 분포로 관찰되고 → 루프로 닫힌다.
 * 숫자는 STEPS 의 pane 데이터(gauges, latency, registry, batching …)와 caption 에서만 읽는다.
 * 크기·PyTorch 지연은 실측(ResNet50, CPU 1스레드), ONNX 행·정확도·p50/p99 는 예시 값이라 그림에도 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op }, a || {}));
  const tag = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 13.5, fill: MUT, opacity: op, 'font-style': 'italic' }, a || {}));
  const P = (c) => (c && c.pane) || {};

  // 상단 파이프라인 띠 (pane.pipeline: done / active / todo)
  function strip(pl, u) { if (!pl) return; const w = 168, gap = 18, x0 = (960 - (5 * w + 4 * gap)) / 2;
    pl.forEach((st, i) => { const x = x0 + i * (w + gap), col = st.state === 'active' ? ACC : st.state === 'done' ? GOOD : OFF;
      el('rect', { x, y: 8, width: w, height: 30, rx: 15, fill: st.state === 'active' ? ACCBG : PANEL, stroke: col, 'stroke-width': st.state === 'active' ? 2.4 : 1.5 });
      tx(x + w / 2, 28, (st.state === 'done' ? '✓ ' : '') + st.name, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: st.state === 'todo' ? MUT : col });
      if (i < 4) el('line', { x1: x + w + 3, y1: 23, x2: x + w + gap - 3, y2: 23, stroke: OFF, 'stroke-width': 2 }); }); }
  // 파일 아이콘 (모서리 접힌 종이)
  function file(cx, cy, name, col, s, o) { o = o || {}; const g = R.G(cx, cy, s ?? 1, o.op);
    el('path', { d: 'M-30,-36 H14 L30,-20 V36 H-30 Z', fill: PANEL, stroke: col || INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M14,-36 V-20 H30', fill: 'none', stroke: col || INK, 'stroke-width': 2 }, g);
    for (let i = 0; i < 3; i++) el('line', { x1: -20, y1: -12 + i * 12, x2: 18, y2: -12 + i * 12, stroke: GRID, 'stroke-width': 3 }, g);
    tx(0, 56, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', fill: col || INK }, g); return g; }
  // 사진 한 장 (가로 w × 세로 h, 가운데 정렬) — 전처리 단계 그림
  function photo(cx, cy, w, h, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 3, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2, opacity: op });
    el('path', { d: `M${cx - w / 2 + 4},${cy + h / 2 - 4} L${cx - w * 0.1},${cy - h * 0.05} L${cx + w * 0.12},${cy + h * 0.18} L${cx + w * 0.28},${cy + h * 0.02} L${cx + w / 2 - 4},${cy + h / 2 - 4} Z`, fill: o.stroke || INFO, opacity: 0.35 * op });
    el('circle', { cx: cx + w * 0.25, cy: cy - h * 0.22, r: Math.min(w, h) * 0.08, fill: WARN, opacity: 0.7 * op }); }

  // =========================================================
  // 1. 배포 패키지 — state_dict · 전처리 동봉 · eval+no_grad
  // =========================================================
  function box(x, y, n, u0) { // 열린 상자 + 그 안의 파일들
    el('path', { d: `M${x},${y} L${x + 20},${y + 250} L${x + 360},${y + 250} L${x + 380},${y}`, fill: SOFT, stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
    tx(x + 190, y + 276, '배포 패키지', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); }
  const FILES = [['model.pt', ACC], ['preprocess.py', INFO], ['config.json', WARN], ['requirements.txt', MUT]];
  function s1(t, c) { const { k, u } = c, p = P(c.beat), pp = k > 0 ? P(c.prev) : {};
    strip(p.pipeline, u);
    const items = p.packageBox.items.map((it) => it.name), prevN = k > 0 ? pp.packageBox.items.length : 0;
    if (k >= 2) { box(550, 70, items.length); items.forEach((nm, i) => { const col = (FILES.find((f) => f[0] === nm) || [0, INK])[1], isNew = i >= prevN;
        file(650 + (i % 2) * 180, 130 + Math.floor(i / 2) * 120, nm, col, isNew ? pop(u, 0.4 + (i - prevN) * 0.3) : 1); }); }
    if (k === 0) { [['state_dict 만 저장', ACC, 0.3], ['전처리를 함께 넣는다', INFO, 0.8], ['추론은 eval + no_grad', GOOD, 1.3]].forEach(([s, col, at], i) => {
        card(250, 110 + i * 78, 340, 56, { rx: 12, stroke: col, sw: 2.5, text: `${i + 1}. ${s}`, fs: 17, color: col, s: pop(u, at), fill: PANEL }); });
      file(700, 160, 'fine_tune.ipynb', INK, pop(u, 0.2)); sub(700, 250, '검증 94% — 하지만 아직 서비스가 아니다', fade(u, 1.8), { 'font-size': 14.5 });
      note(480, 390, '노트북 속 .pt 를 서버가 그대로 읽을 수 있는 묶음으로', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { [['import json', '설정 → 파일로 주고받기', WARN], ['import torch', '텐서 · 저장/로드', ACC], ['from torchvision import models, transforms', '모델 뼈대 · 전처리', INFO]].forEach(([s, d, col], i) => {
        const at = 0.3 + i * 0.5; mono(70, 110 + i * 70, s, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, at) }); sub(70, 134 + i * 70, d, fade(u, at + 0.2), { 'text-anchor': 'start', 'font-size': 14.5 }); });
      card(760, 200, 220, 120, { rx: 12, stroke: OFF, dash: '7 5', text: '패키지는 아직 비어 있다', fs: 15, color: MUT, s: pop(u, 1.6) });
      note(70, 380, 'json 을 들인 이유: 숫자를 코드에 적지 않고 파일로 넘긴다', fade(u, 2.1)); return; }
    if (k === 2) { // 모델 객체 vs state_dict
      card(150, 110, 220, 70, { rx: 10, stroke: BAD, dash: '6 4', text: 'torch.save(model)\n클래스·경로·버전에 묶임', fs: 14, color: BAD, s: pop(u, 0.3) }); cross(275, 92, 9, pop(u, 0.6));
      mono(40, 220, 'model.state_dict()', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      [['conv1.weight', '(64, 3, 7, 7)'], ['layer1.0.conv1.weight', '(64, 64, 1, 1)'], ['…', ''], ['fc.weight', '(클래스 수, 2048)']].forEach(([a, b], i) => {
        const at = 1.0 + i * 0.25; mono(52, 252 + i * 28, a, { 'font-size': 14, opacity: fade(u, at) }); mono(300, 252 + i * 28, b, { 'font-size': 14, fill: MUT, opacity: fade(u, at) }); });
      grow(430, 300, 590, 230, E(u, 1.8, 2.3), ACC); return; }
    if (k === 3) { el('rect', { x: 40, y: 80, width: 470, height: 250, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2 });
      mono(56, 106, 'config.json', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      [['"classes"', 'class_names'], ['"input_size"', '224'], ['"mean"', '[0.485, 0.456, 0.406]'], ['"std"', '[0.229, 0.224, 0.225]']].forEach(([a, b], i) => {
        const at = 0.3 + i * 0.35; mono(66, 150 + i * 44, a + ':', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, at) }); mono(220, 150 + i * 44, b, { 'font-size': 15, opacity: fade(u, at + 0.1) }); });
      note(40, 380, '서빙은 이 값을 "복사"하지 않고 "읽는다"', fade(u, 2.0)); return; }
    if (k === 4) { // 서버에서 뼈대 + 가중치
      lbl(150, 82, 'models.resnet50()', 1, { class: 'mono', 'font-size': 15 });
      const fill = E(u, 0.8, 1.8); for (let i = 0; i < 6; i++) { const y = 100 + i * 34; el('rect', { x: 70, y, width: 160, height: 26, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 1.6 });
        el('rect', { x: 72, y: y + 2, width: 156 * clamp(fill * 6 - i), height: 22, rx: 4, fill: ACC, opacity: 0.7 }); }
      tx(240, 288, 'fc → Linear(2048, 클래스 수)', { 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.5) });
      fly(560, 200, 260, 170, seg(u, 0.5, 1.2), 'load_state_dict', { fill: ACC, mono: true });
      pill(150, 340, 'model.eval()', GOOD, pop(u, 1.9), { mono: true, fs: 15 });
      sub(150, 380, 'Dropout off · BatchNorm 은 이동평균', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 5) { // 전처리 파이프라인: 500×375 → 341×256 → 224×224
      const S = 0.32, st = [[90, 500, 375, '원본 500×375', 0.2], [250, 341, 256, 'Resize(256)\n341×256', 0.7], [400, 224, 224, 'CenterCrop(224)', 1.2]];
      st.forEach(([cx, w, h, s, at], i) => { photo(cx, 200, w * S, h * S, { op: fade(u, at) }); tx(cx, 282, s.split('\n')[0], { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, at) });
        if (s.includes('\n')) mono(cx, 302, s.split('\n')[1], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, at) }); if (i) grow(st[i - 1][0] + 60, 200, cx - w * S / 2 - 6, 200, E(u, at - 0.3, at), MUT); });
      el('rect', { x: 400 - 224 * S * 0.5, y: 200 - 224 * S * 0.5, width: 224 * S, height: 224 * S, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.3) });
      note(40, 350, 'ToTensor → Normalize(mean, std) — 값은 config.json 에서', fade(u, 1.8), { 'font-size': 15 });
      sub(250, 385, '학습 때와 같은 순서, 같은 숫자', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    // k6: predict + skew
    const sh = [['x', '(1, 3, 224, 224)', INFO, 0.2], ['logits', '(1, 클래스 수)', ACC, 0.9], ['argmax → 이름', '"cat"', GOOD, 1.4]];
    sh.forEach(([a, b, col, at], i) => { card(80 + i * 160, 110, 140, 56, { rx: 8, stroke: col, color: col, text: `${a}\n${b}`, fs: 13.5, mono: true, s: pop(u, at) }); if (i) grow(80 + (i - 1) * 160 + 72, 110, 80 + i * 160 - 72, 110, E(u, at - 0.2, at), MUT); });
    el('rect', { x: 130, y: 72, width: 220, height: 78, rx: 12, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.6) });
    mono(240, 66, 'torch.no_grad()', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
    tx(40, 236, '학습', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); mono(100, 236, 'Resize(256)→Crop(224)→Normalize', { 'font-size': 14, opacity: fade(u, 1.6) });
    tx(40, 268, '서빙', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); mono(100, 268, 'Resize(224)→정규화 생략', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
    mono(40, 320, '검증 94% → 실서비스 71%', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); tag(300, 320, '(예시)', fade(u, 2.1));
    sub(240, 356, '에러는 없다 — 숫자만 다르다', fade(u, 2.3), { 'font-size': 15, fill: INK }); }

  // =========================================================
  // 2. 최적화 — INT8 · ONNX 와 비교표
  // =========================================================
  function compare(rows, prevRows, u) { // 오른쪽 비교표: 크기 막대 + 지연 막대
    const x = 560, n = rows.length, pn = prevRows ? prevRows.length : 0;
    tx(x, 66, '크기 MB', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); tx(x + 200, 66, '지연 ms', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const y = 84 + i * 74, isNew = i >= pn, a = isNew ? 0.4 + (i - pn) * 0.3 : 0, col = r.tone === 'best' ? GOOD : r.tone === 'good' ? ACC : MUT;
      const pr = prevRows && prevRows[i] && prevRows[i].name === r.name ? prevRows[i] : null, lat = tween(pr ? pr.latency : null, r.latency, u);
      tx(x, y + 14, `${r.name}${/ONNX/.test(r.name) ? ' (예시)' : ''}`, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: isNew ? fade(u, a) : 1 });
      tx(x + 380, y + 14, `acc ${r.acc}%`, { 'font-size': 13.5, class: 'mono', 'text-anchor': 'end', fill: MUT, opacity: isNew ? fade(u, a) : 1 });
      hbar(x, y + 24, 130, r.size, 98, { h: 16, col, u: isNew ? E(u, a, a + 0.6) : 1, text: `${r.size}` });
      hbar(x + 200, y + 24, 130, lat, 120, { h: 16, col, u: isNew ? E(u, a, a + 0.6) : 1, text: `${Math.round(lat)}` }); }); }
  function s2(t, c) { const { k, u } = c, p = P(c.beat), pp = k > 0 ? P(c.prev) : null;
    strip(p.pipeline, u); compare(p.gauges.rows, pp ? pp.gauges.rows : null, u);
    if (k === 0) { const N = [['변환', ACC], ['재측정', WARN], ['비교표', GOOD]];
      N.forEach(([s, col], i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 3, cx = 260 + 120 * Math.cos(a), cy = 220 + 110 * Math.sin(a); card(cx, cy, 110, 46, { rx: 23, stroke: col, color: col, text: s, fs: 16, s: pop(u, 0.3 + i * 0.4), fill: PANEL });
        const b = a + 2 * Math.PI / 3; if (u > 0.6 + i * 0.4) el('path', { d: `M${260 + 120 * Math.cos(a + 0.45)},${220 + 110 * Math.sin(a + 0.45)} A120,110 0 0 1 ${260 + 120 * Math.cos(b - 0.45)},${220 + 110 * Math.sin(b - 0.45)}`, fill: 'none', stroke: MUT, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' }); });
      note(70, 385, '최적화의 결과물은 모델이 아니라 비교표다', fade(u, 2.0)); return; }
    if (k === 1) { file(150, 170, 'model.pt', ACC, pop(u, 0.2)); grow(200, 170, 330, 170, E(u, 0.5, 0.9), MUT);
      card(410, 170, 140, 56, { rx: 10, stroke: INK, text: 'load_model()', fs: 15, mono: true, s: pop(u, 0.8) });
      sub(410, 222, 'v1 의 로드 코드 재사용', fade(u, 1.1), { 'font-size': 14.5 });
      note(70, 310, '기준선: FP32 · eval() 완료', fade(u, 1.5)); tag(70, 340, 'CPU 1스레드 · 이미지 1장 기준', fade(u, 1.8)); return; }
    if (k === 2) { // 정적 양자화: float → int8 눈금
      lbl(270, 72, 'float32 가중치 → int8 (-128 … 127)', fade(u, 0.2), { 'font-size': 15 });
      const W0 = 60, W1 = 480, X = (v) => W0 + ((v + 0.5) / 1) * (W1 - W0);
      el('line', { x1: W0, y1: 120, x2: W1, y2: 120, stroke: INK, 'stroke-width': 2 }); mono(W0, 106, '-0.5', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(W1, 106, '+0.5', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      const vals = [-0.41, -0.27, -0.12, -0.05, 0.03, 0.09, 0.18, 0.33, 0.44];   // 그림용 가중치 점 (예시)
      vals.forEach((v, i) => { const q = Math.round(v / (0.5 / 127)), f = E(u, 0.5 + i * 0.08, 1.1 + i * 0.08), xq = X(q * 0.5 / 127);
        el('circle', { cx: X(v), cy: 120, r: 5, fill: INFO, opacity: 1 - 0.5 * f }); el('line', { x1: X(v), y1: 126, x2: lerp(X(v), xq, f), y2: lerp(126, 170, f), stroke: ACC, 'stroke-width': 1.5, opacity: f }); });
      for (let i = 0; i <= 16; i++) el('line', { x1: W0 + i * (W1 - W0) / 16, y1: 166, x2: W0 + i * (W1 - W0) / 16, y2: 176, stroke: ACC, 'stroke-width': 1.5, opacity: fade(u, 0.4) });
      el('line', { x1: W0, y1: 171, x2: W1, y2: 171, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.4) }); mono(W0, 196, '-128', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); mono(W1, 196, '127', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      for (let i = 0; i < 4; i++) fly(60, 250, 230, 250, seg(u, 1.2 + i * 0.2, 1.7 + i * 0.2), 'calib', { fill: INFO });
      card(320, 250, 160, 44, { rx: 8, stroke: INFO, color: INFO, text: '활성값 범위 측정', fs: 14.5, s: pop(u, 1.2) });
      mono(60, 320, '4 byte → 1 byte : 98 → 25 MB', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      tx(60, 356, '동적 양자화(Linear 만)는 ResNet50 에서 98 → 92 MB, 지연 그대로 (실측)', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.2) });
      tag(60, 390, '눈금 위 점은 그림용 예시 가중치', fade(u, 2.3)); return; }
    if (k === 3 || k === 4) { // ONNX 그래프 추적
      const nodes = ['Conv', 'Relu', 'MaxPool', '…', 'GlobalAvgPool', 'Gemm'];
      nodes.forEach((s, i) => { const y = 92 + i * 46, at = 0.4 + i * 0.2; card(300, y, 150, 34, { rx: 6, stroke: INK, text: s, fs: 14, mono: true, s: k === 3 ? pop(u, at) : 1 });
        if (i) grow(300, y - 29, 300, y - 18, k === 3 ? E(u, at - 0.1, at) : 1, MUT); });
      if (k === 3) { dot([[300, 60], [300, 92], [300, 322]], seg(u, 0.3, 1.8), WARN, 7); mono(80, 92, 'dummy', { 'font-size': 15, 'font-weight': 700, fill: WARN }); mono(80, 116, '(1, 3, 224, 224)', { 'font-size': 14, fill: WARN });
        file(470, 300, 'model.onnx', ACC, pop(u, 2.0)); sub(150, 380, '더미 입력을 한 번 흘려 그래프를 굳힌다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
      pill(300, 52, 'input "image"', INFO, pop(u, 0.3), { mono: true, fs: 14, fill: PANEL }); pill(300, 360, 'output "logits"', ACC, pop(u, 0.6), { mono: true, fs: 14, fill: PANEL });
      [1, 8, 32].forEach((b, i) => { const a = 1.0 + i * 0.35; for (let j = 0; j < Math.min(b, 6); j++) el('rect', { x: 50 + j * 6, y: 140 + i * 70 - j * 4, width: 46, height: 40, rx: 3, fill: INFOBG, stroke: INFO, opacity: fade(u, a) });
        mono(150, 166 + i * 70, `batch=${b}`, { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, a) }); });
      tx(40, 400, 'dynamic_axes: 0번 축(batch) 가변 · opset 17', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 5) { // 벤치마크: 워밍업 5 + 측정 50
      lbl(270, 76, 'benchmark(fn, x, n=50)', fade(u, 0.2), { class: 'mono' });
      for (let i = 0; i < 5; i++) { const h = i === 0 ? 120 : 50 + (i === 1 ? 8 : 0); el('rect', { x: 50 + i * 16, y: 300 - h * E(u, 0.4 + i * 0.1, 0.6 + i * 0.1), width: 12, height: h * E(u, 0.4 + i * 0.1, 0.6 + i * 0.1), fill: OFF }); }
      for (let i = 0; i < 25; i++) { const a = 1.0 + i * 0.04; el('rect', { x: 140 + i * 13, y: 300 - 50 * E(u, a, a + 0.2), width: 10, height: 50 * E(u, a, a + 0.2), fill: ACC, opacity: 0.8 }); }
      tx(50, 326, '워밍업 5회', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) }); tx(140, 326, '측정 50회 → 평균 (그림은 25칸)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      tx(56, 160, '첫 호출 = 초기화 비용', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8) });
      note(50, 385, '첫 호출은 지연이 아니다 — 걷어내고 잰다', fade(u, 2.2)); return; }
    if (k === 6) { const rows = p.gauges.rows, a = rows[0], b = rows[1];
      lbl(270, 80, 'torch.no_grad() 안에서 같은 조건으로', fade(u, 0.2), { 'font-size': 15 });
      [[a, MUT, 0.4], [b, ACC, 0.9]].forEach(([r, col, at], i) => { tx(60, 150 + i * 60, r.name, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, at) });
        hbar(60, 160 + i * 60, 360, r.latency, 120, { h: 22, col, u: E(u, at, at + 0.8), text: `${r.latency} ms` }); });
      mono(60, 300, `${a.latency} → ${b.latency} ms`, { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      tag(60, 330, '이 PC CPU 1스레드 실측 · ONNX+INT8 41ms 는 예시', fade(u, 2.0));
      note(60, 380, '지연이 절반 이하로', fade(u, 2.3), { fill: GOOD }); return; }
    // k7: 정확도
    const rows = p.gauges.rows;
    lbl(270, 76, '검증셋 정확도 재평가', fade(u, 0.2), { 'font-size': 16 });
    const ax = axes(110, 110, 360, 190, { x: [0, 4], y: [92, 95], yt: [92, 93, 94, 95], yl: 'acc %' });
    rows.forEach((r, i) => { const x = ax.X(i + 0.5) - 26, h = (ax.Y(92) - ax.Y(r.acc)) * E(u, 0.4 + i * 0.25, 0.9 + i * 0.25);
      el('rect', { x, y: ax.Y(92) - h, width: 52, height: h, rx: 4, fill: r.tone === 'best' ? GOOD : r.tone === 'good' ? ACC : MUT, opacity: 0.8 });
      mono(x + 26, ax.Y(r.acc) - 8, String(r.acc), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.25) }); });
    tag(110, 345, '정확도는 예시 값 (검증셋이 있어야 잰다) · y축은 92% 부터', fade(u, 1.9));
    note(110, 385, '0.5~0.7%p 를 내주고 크기 1/4 · 지연 1/3', fade(u, 2.2)); }

  // =========================================================
  // 3. 서빙 — FastAPI + 시작 시 1회 로드 + 동적 배칭
  // =========================================================
  const SV = { x: 400, y: 70, w: 300, h: 290 };
  function server(on, title) { el('rect', { x: SV.x, y: SV.y, width: SV.w, height: SV.h, rx: 14, fill: on ? ACCBG : SOFT, stroke: on ? ACC : OFF, 'stroke-width': 2.5, 'stroke-dasharray': on ? null : '7 5' });
    tx(SV.x + 16, SV.y + 26, title || 'FastAPI · uvicorn :8000', { 'font-size': 14.5, 'font-weight': 800, fill: on ? ACC : MUT }); }
  function session(op, s) { card(SV.x + 150, SV.y + 190, 200, 54, { rx: 10, stroke: INFO, color: INFO, fill: PANEL, text: 'ort.InferenceSession\nmodel.onnx', fs: 13.5, mono: true, op, s }); }
  function reqs(list, u, o) { o = o || {}; list.forEach((r, i) => { const y = 110 + i * 56; card(110, y, 120, 36, { rx: 18, stroke: INFO, color: INFO, fill: PANEL, text: r, fs: 13.5, mono: true, s: o.pop ? pop(u, o.pop + i * 0.15) : 1 }); }); }
  function s3(t, c) { const { k, u } = c, p = P(c.beat), pp = k > 0 ? P(c.prev) : null, rq = p.batching.requests;
    strip(p.pipeline, u);
    const on = k >= 4;
    if (k !== 5) server(on || k === 3, k < 3 ? '서버 (아직 없음)' : null);
    if (k === 0) { reqs(rq, u, { pop: 0.3 }); grow(172, 110, 390, 110, E(u, 0.6, 1.2), OFF, { dash: '5 4' }); if (u > 1.2) cross(300, 110, 9, pop(u, 1.2));
      mono(SV.x + 150, 190, 'uvicorn serve_model:app', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(SV.x + 150, 216, '--host 0.0.0.0 --port 8000', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.7) });
      note(60, 395, '구조: 로드는 시작 시 1회, 핸들러는 추론만', fade(u, 2.2)); return; }
    if (k === 1) { reqs(rq, u); [['onnxruntime', INFO], ['FastAPI', ACC], ['PIL · numpy', WARN]].forEach(([s, col], i) => pill(SV.x + 150, SV.y + 80 + i * 50, s, col, pop(u, 0.4 + i * 0.35), { fs: 15, fill: PANEL }));
      pill(SV.x + 150, SV.y + 250, 'torch', MUT, pop(u, 1.6), { mono: true, fs: 15 }); if (u > 1.9) cross(SV.x + 196, SV.y + 250, 9, pop(u, 1.9));
      note(780, 200, '서버에', fade(u, 2.1), { 'text-anchor': 'middle' }); note(780, 226, 'PyTorch 불필요', fade(u, 2.2), { 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 2) { reqs(rq, u); card(SV.x + 150, SV.y + 130, 180, 70, { rx: 10, stroke: INK, text: 'state = { }', fs: 18, mono: true, s: pop(u, 0.4), fill: PANEL });
      sub(SV.x + 150, SV.y + 196, '모델·설정이 들어갈 자리', fade(u, 1.0), { 'font-size': 14.5 });
      note(60, 395, '요청마다 만들지 않고 앱에 하나만 둔다', fade(u, 1.8)); return; }
    if (k === 3) { reqs(rq, u); file(800, 150, 'model.onnx', ACC, 1); file(800, 290, 'config.json', WARN, 1);
      fly(800, 150, SV.x + 150, SV.y + 190, seg(u, 0.4, 1.1), 'load 1회', { fill: ACC }); if (u > 1.1) session(1, pop(u, 1.1));
      fly(800, 290, SV.x + 150, SV.y + 110, seg(u, 0.8, 1.4), 'json', { fill: WARN }); if (u > 1.4) card(SV.x + 150, SV.y + 100, 160, 40, { rx: 8, stroke: WARN, color: WARN, fill: PANEL, text: 'state["cfg"]', fs: 14, mono: true, s: pop(u, 1.4) });
      tx(SV.x + 16, SV.y + 268, 'yield 이전 = startup · 이후 = shutdown', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) });
      note(60, 395, '요청마다 로드 = 지연 수 초 + 메모리 폭주', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 5) { // 전처리 (서버 안 확대)
      const S = 0.34, st = [[90, 500, 375, '업로드 500×375'], [250, 341, 256, '짧은 변 256'], [400, 224, 224, '가운데 224']];
      st.forEach(([cx, w, h, s], i) => { const at = 0.3 + i * 0.4; photo(cx, 180, w * S, h * S, { op: fade(u, at) }); tx(cx, 266, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, at) }); if (i) grow(st[i - 1][0] + 62, 180, cx - w * S / 2 - 6, 180, E(u, at - 0.2, at), MUT); });
      grow(450, 180, 520, 180, E(u, 1.3, 1.6), MUT);
      for (let j = 2; j >= 0; j--) el('rect', { x: 540 + j * 12, y: 130 - j * 12, width: 84, height: 84, rx: 4, fill: [WARN, GOOD, INFO][j], opacity: 0.55 * fade(u, 1.5 + (2 - j) * 0.1) });
      mono(600, 262, '(1, 3, 224, 224)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); mono(600, 286, 'float32', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(60, 330, '(x − mean) / std — mean·std 는 config.json 에서', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tag(60, 360, '224 로 바로 줄이면 Step 1 의 skew 가 그대로 재현된다', fade(u, 2.2)); return; }
    session(1); if (k >= 4) card(SV.x + 150, SV.y + 100, 160, 40, { rx: 8, stroke: WARN, color: WARN, fill: PANEL, text: 'state["cfg"]', fs: 14, mono: true });
    if (k === 4) { reqs(rq, u, { pop: 0.5 }); mono(SV.x + 150, SV.y + 58, 'FastAPI(lifespan=lifespan)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      rq.forEach((r, i) => dot([[172, 110 + i * 56], [SV.x, 160]], seg(u, 1.0 + i * 0.2, 1.6 + i * 0.2), INFO));
      tx(760, 180, '이 한 줄이 있어야', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.8) }); tx(760, 206, 'startup 훅이 돈다', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 6 || k === 7) { reqs(rq, u); pill(SV.x + 150, SV.y + 56, 'POST /predict', ACC, 1, { mono: true, fs: 14.5, fill: PANEL });
      rq.forEach((r, i) => { const a = 0.3 + i * 0.5; dot([[172, 110 + i * 56], [SV.x + 50, SV.y + 56], [SV.x + 150, SV.y + 160]], seg(u, a, a + 0.5), INFO);
        if (k === 7) fly(SV.x + SV.w, SV.y + 190, 820, 110 + i * 56, seg(u, a + 0.5, a + 0.9), '{label, score}', { fill: GOOD, stay: true }); });
      if (k === 6) { tx(SV.x + 150, SV.y + 266, '읽기 → 전처리 → session.run', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        note(740, 200, `요청 ${rq.length}건 → forward ${rq.length}번`, fade(u, 2.0)); }
      else { tx(SV.x + 150, SV.y + 266, 'argmax → classes[idx]', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.4) });
        tag(60, 400, 'score 는 softmax 전 로짓 값', fade(u, 2.3)); } return; }
    // k8: 동적 배칭
    reqs(rq, u); const W = E(u, 0.3, 1.2);
    el('rect', { x: 250, y: 84, width: 120, height: 220, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.2) });
    tx(310, 324, `${p.batching.windowMs}ms 창`, { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    rq.forEach((r, i) => { const y = lerp(110 + i * 56, 140 + i * 36, W); el('rect', { x: lerp(176, 266, W), y: y - 12, width: 88, height: 24, rx: 12, fill: INFO, opacity: 0.8 * fade(u, 0.3) }); });
    fly(370, 190, SV.x + 150, SV.y + 190, seg(u, 1.3, 1.8), `batch=${rq.length}`, { fill: WARN, mono: true });
    if (u > 1.8) mono(SV.x + 150, SV.y + 250, `forward ×1`, { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
    note(720, 380, `처리량 ${rq.length}배 · 지연 +${p.batching.windowMs}ms`, fade(u, 2.1), { fill: GOOD });
    tag(60, 400, 'GPU 는 1장이나 32장이나 forward 시간이 비슷하다 (Triton·TorchServe 내장)', fade(u, 2.3)); }

  // =========================================================
  // 4. 운영 — p99 · 워밍업 · 버전 · 안전한 배포
  // =========================================================
  function latBars(rows, prevRows, u) { const x = 60, W = 360;
    tx(x, 70, '응답 지연 (ms) · 예시', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const y = 90 + i * 52, pr = (prevRows || []).find((q) => q.name === r.name), isNew = !pr, col = r.tone === 'bad' ? BAD : r.tone === 'warn' ? WARN : GOOD;
      tx(x, y + 14, r.name, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: isNew ? fade(u, 0.3 + i * 0.2) : 1 });
      hbar(x, y + 22, W, r.ms, 1000, { h: 16, col, u: isNew ? E(u, 0.3 + i * 0.2, 0.9 + i * 0.2) : 1, text: `${r.ms}` }); }); }
  function registry(rows, prevRows, u) { const x = 520, y = 66;
    tx(x, y + 4, '모델 레지스트리', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const pr = (prevRows || []).find((q) => q.ver === r.ver), isNew = !pr, yy = y + 24 + i * 46, op = isNew ? fade(u, 0.4 + i * 0.2) : 1;
      const col = r.status === 'production' ? GOOD : /A\/B/.test(r.status) ? INFO : /섀도/.test(r.status) ? ACC : MUT;
      el('rect', { x, y: yy, width: 410, height: 38, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 1.8, opacity: op });
      mono(x + 12, yy + 25, r.ver, { 'font-size': 14.5, 'font-weight': 800, opacity: op });
      tx(x + 130, yy + 25, r.status, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op });
      const tr = parseFloat(r.traffic), ptr = pr ? parseFloat(pr.traffic) : tr, v = tween(ptr, tr, u);
      el('rect', { x: x + 270, y: yy + 12, width: 80, height: 14, rx: 4, fill: SOFT, opacity: op }); el('rect', { x: x + 270, y: yy + 12, width: 80 * v / 100, height: 14, rx: 4, fill: col, opacity: op });
      mono(x + 400, yy + 25, `${Math.round(v)}%`, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); }); }
  function s4(t, c) { const { k, u } = c, p = P(c.beat), pp = k > 0 ? P(c.prev) : null;
    strip(p.pipeline, u); latBars(p.latency.rows, pp ? pp.latency.rows : null, u); registry(p.registry.rows, pp ? pp.registry.rows : null, u);
    const by = 270;
    if (k === 0) { [['평균 말고 p99', BAD], ['배포 직후 워밍업', WARN], ['롤백은 1분 안에', GOOD]].forEach(([s, col], i) => pill(150 + i * 230, by + 50, s, col, pop(u, 0.8 + i * 0.4), { fs: 15, fill: PANEL }));
      sub(480, by + 110, '첫 요청이 920ms — 100명 중 1명은 매번 1초를 기다린다', fade(u, 2.1), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { el('rect', { x: 60, y: by + 10, width: 840, height: 44, rx: 8, fill: INK, opacity: fade(u, 0.3) });
      mono(76, by + 38, 'INFO serving path=/predict ms=43.8 model=v1.2.0', { 'font-size': 14.5, fill: PANEL, opacity: fade(u, 0.5) }); tag(560, by + 38, '(예시 로그 줄)', fade(u, 0.6), { fill: OFF });
      pill(260, by + 96, 'X-Model-Version: v1.2.0', ACC, pop(u, 1.3), { mono: true, fs: 14.5, fill: PANEL });
      sub(640, by + 100, '로그 · 응답 헤더 · 레지스트리에 같은 문자열', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { mono(60, by + 20, 'warmup(session, n=10)', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      for (let i = 0; i < 10; i++) { const a = 0.5 + i * 0.12; card(80 + i * 46, by + 64, 38, 38, { rx: 4, fill: SOFT, stroke: WARN, text: '0', fs: 14, mono: true, s: pop(u, a) }); }
      tx(560, by + 70, 'np.zeros((1, 3, 224, 224))', { 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 1.2) });
      sub(480, by + 122, 'lazy 초기화 · 메모리 할당 비용을 첫 사용자 대신 치른다', fade(u, 1.9), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { const seq = [['InferenceSession', INFO], ['warmup()', WARN], ['yield → 트래픽', GOOD]];
      seq.forEach(([s, col], i) => { card(180 + i * 280, by + 60, 210, 46, { rx: 10, stroke: col, color: col, text: s, fs: 15, mono: true, s: pop(u, 0.3 + i * 0.4), fill: PANEL }); if (i) grow(180 + (i - 1) * 280 + 106, by + 60, 180 + i * 280 - 106, by + 60, E(u, 0.4 + i * 0.4, 0.7 + i * 0.4), MUT); });
      sub(480, by + 120, 'p99 920 → 180 ms (예시) — SLO 200ms 이내', fade(u, 1.9), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 4) { // 요청 점들이 수집기로
      card(800, by + 64, 150, 50, { rx: 10, stroke: INFO, color: INFO, text: '수집기\np50 · p99', fs: 14, s: pop(u, 0.3), fill: PANEL });
      for (let i = 0; i < 12; i++) { const a = 0.4 + i * 0.13, y0 = by + 30 + ((i * 37) % 70); dot([[70, y0], [720, by + 64]], seg(u, a, a + 0.7), i % 11 === 10 ? BAD : ACC, 5); }
      mono(70, by + 128, 'ms = (perf_counter() − t0) × 1000', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(300, by + 20, '요청마다 숫자 하나', fade(u, 0.6)); return; }
    if (k === 5) { const ab = p.registry.rows.find((r) => /A\/B/.test(r.status));
      el('rect', { x: 60, y: by + 40, width: 760 * 0.9, height: 36, rx: 6, fill: GOOD, opacity: 0.75 * fade(u, 0.3) }); el('rect', { x: 60 + 760 * 0.9, y: by + 40, width: 760 * 0.1 * E(u, 0.8, 1.4), height: 36, rx: 6, fill: INFO, opacity: 0.85 });
      tx(70, by + 64, 'v1.2.0 · 90%', { 'font-size': 14.5, 'font-weight': 800, fill: PANEL, opacity: fade(u, 0.4) }); tx(60 + 760 * 0.9 + 6, by + 30, `${ab.ver} · 10%`, { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.3) });
      sub(480, by + 112, '헤더의 버전으로 "그 느린 응답이 어느 모델이었나" 를 되짚는다', fade(u, 1.9), { 'font-size': 15, fill: INK }); return; }
    // k6: 섀도 → A/B → 점진 확대 → 롤백
    [['섀도', '몰래 추론 · 로그만', ACC], ['A/B 10%', '실트래픽 지표 비교', INFO], ['점진 확대', '이상 없으면 넓힌다', GOOD], ['롤백', 'v1.1.0 대기', BAD]].forEach(([a, b, col], i) => {
      const x = 130 + i * 230, at = 0.3 + i * 0.4; card(x, by + 50, 170, 46, { rx: 10, stroke: col, color: col, text: a, fs: 16, s: pop(u, at), fill: PANEL }); sub(x, by + 96, b, fade(u, at + 0.2), { 'font-size': 14 });
      if (i && i < 3) grow(x - 230 + 88, by + 50, x - 88, by + 50, E(u, at - 0.1, at + 0.1), MUT); });
    tag(60, by + 140, '+ 입력 분포 드리프트 상시 감시 (ml V-2-2) → 재학습', fade(u, 2.1), { 'font-style': 'normal', fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 5. MLOps 루프 — 조각을 엮어 닫는다
  // =========================================================
  const RING = { cx: 300, cy: 225, rx: 220, ry: 150 };
  const NODE_POS = (i, n) => { const a = -Math.PI / 2 + (i / n) * 2 * Math.PI; return [RING.cx + RING.rx * Math.cos(a), RING.cy + RING.ry * Math.sin(a)]; };
  function s5(t, c) { const { k, u } = c, p = P(c.beat), pp = k > 0 ? P(c.prev) : null, nodes = p.loop.nodes, pn = pp ? pp.loop.nodes.length : 0;
    const names = nodes.map((s) => s.replace(/^\S+\s/, '')), N = 6;
    // 루프 원
    if (nodes.length > 1) el('ellipse', { cx: RING.cx, cy: RING.cy, rx: RING.rx, ry: RING.ry, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': k >= 6 ? null : '6 6' });
    const hl = { 2: -1, 3: [0, 1], 4: [2], 5: [3, 4], 6: [5, 0] }[k] || [];
    names.forEach((s, i) => { const [x, y] = nodes.length === 1 ? [300, 225] : NODE_POS(i, N), isNew = i >= pn, on = Array.isArray(hl) && hl.includes(i);
      card(x, y, 116, 44, { rx: 22, stroke: on ? ACC : INK, sw: on ? 3 : 2, color: on ? ACC : INK, text: s, fs: 15, s: isNew ? pop(u, 0.3 + (i - pn) * 0.2) : 1, fill: on ? ACCBG : PANEL }); });
    if (k === 0) { mono(300, 300, 'pipeline.py', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      sub(300, 330, '데이터 → 학습 → 평가 → 최적화 → 서빙 → 모니터링 → 재학습', fade(u, 1.2), { 'font-size': 14.5 });
      note(300, 390, p.loop.back, fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); }
    if (k === 1) { ['dataset', 'fine_tune (II-2-2)', 'evaluate', 'optimize (Step 2)', 'registry', 'monitor (ml V-2-2)'].forEach((m, i) => { const [x, y] = NODE_POS(i, N);
        mono(x, y + (y < RING.cy ? -30 : 40), m, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2 + i * 0.12) }); }); }
    if (k >= 2) { // 품질 게이트: 평가 → 최적화 사이
      const [x1, y1] = NODE_POS(2, N), [x2, y2] = NODE_POS(3, N), gx = (x1 + x2) / 2 + 14, gy = (y1 + y2) / 2 + 14, blocked = k === 4 && u > 1.6;
      el('rect', { x: gx - 8, y: gy - 22, width: 16, height: 44, rx: 4, fill: blocked ? BAD : WARN, opacity: k === 2 ? fade(u, 0.5) : 1 });
      mono(gx + 16, gy + 6, 'ACC_GATE 0.93', { 'font-size': 13.5, 'font-weight': 800, fill: blocked ? BAD : WARN, opacity: k === 2 ? fade(u, 0.7) : 1 }); }
    const RX = 600;
    if (k === 2) { mono(RX, 100, 'def run_pipeline(version):', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); sub(RX + 150, 128, '스케줄러/CI 가 이 함수를 돈다', fade(u, 1.3), { 'font-size': 14.5 });
      note(RX, 200, '게이트를 상수로 →', fade(u, 1.8)); note(RX, 226, '"이번만 예외" 가 리뷰에 걸린다', fade(u, 2.0)); }
    if (k === 3) { const [x0, y0] = NODE_POS(0, N), [x1, y1] = NODE_POS(1, N);
      for (let i = 0; i < 5; i++) dot([[x0 + 40, y0 + 10], [x1 - 20, y1 - 22]], seg(u, 0.4 + i * 0.25, 1.0 + i * 0.25), ACC, 5);
      mono(RX, 110, 'load_dataset("s3://data/latest")', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(RX, 150, 'train_model(train_ds, epochs=5)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.0) });
      sub(RX + 160, 190, '신고·피드백까지 반영된 최신 데이터', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (k === 4) { mono(RX, 110, 'acc = evaluate(model, val_ds)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(RX, 150, 'if acc < ACC_GATE:', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) }); mono(RX + 20, 178, 'raise RuntimeError(...)', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.1) });
      if (u > 1.6) { const [x1, y1] = NODE_POS(2, N), [x2, y2] = NODE_POS(3, N); cross((x1 + x2) / 2 - 22, (y1 + y2) / 2 + 14, 11, pop(u, 1.6)); }
      note(RX, 240, '배포하는 줄보다', fade(u, 2.0)); note(RX, 266, '배포를 막는 줄이 중요하다', fade(u, 2.1), { fill: BAD }); }
    if (k === 5) { [['quantize_and_export', 0.3], ['register(version, …)', 0.8], ['promote(stage="shadow")', 1.3]].forEach(([s, at], i) => { mono(RX, 110 + i * 40, s, { 'font-size': 14.5, 'font-weight': 700, fill: [ACC, INFO, GOOD][i], opacity: fade(u, at) }); });
      sub(RX + 160, 250, 'production 직행 금지 — 섀도부터', fade(u, 1.9), { 'font-size': 15, fill: INK }); }
    if (k === 6) { const [x5, y5] = NODE_POS(5, N), [x0, y0] = NODE_POS(0, N), f = E(u, 0.5, 1.6);
      if (f > 0) el('path', { d: `M${x5},${y5 - 24} Q${RING.cx - 230},${RING.cy - 210} ${lerp(x5, x0 - 60, f)},${lerp(y5 - 24, y0, f)}`, fill: 'none', stroke: BAD, 'stroke-width': 3, 'marker-end': f > 0.97 ? 'url(#ra-ahr)' : null });
      mono(RX, 120, 'if drift_detected(window="7d"):', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) }); mono(RX + 20, 150, 'run_pipeline("v1.4.0")', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      note(RX, 230, '직선 파이프라인 → 닫힌 루프', fade(u, 1.9), { fill: GOOD }); }
    if (k === 7) { // 과정 지도 + 다음 경로
      const cm = p.courseMap.rows; cm.forEach((r, i) => { const y = 74 + i * 40; card(RX + 70, y, 140, 32, { rx: 6, stroke: GOOD, color: GOOD, text: r.part.replace('Part ', 'P'), fs: 13.5, s: pop(u, 0.2 + i * 0.15), fill: PANEL }); if (i) el('line', { x1: RX + 70, y1: y - 24, x2: RX + 70, y2: y - 16, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.2 + i * 0.15) }); });
      check(RX + 160, 274, 9, pop(u, 1.1)); tx(RX + 176, 280, '완주', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.1) });
      p.nextPaths.rows.forEach((r, i) => pill(RX + 245, 90 + i * 50, r.name, ACC, pop(u, 1.4 + i * 0.2), { mono: true, fs: 15, fill: PANEL }));
      sub(RX + 245, 300, '다음 갈림길 4개', fade(u, 2.2), { 'font-size': 14.5 }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "학습한 모델을 서빙용으로 저장하는 올바른 방법은 무엇인가?",
      o: ["torch.save(model)로 모델 객체를 통째로 저장한다", "state_dict(가중치)만 저장하고, 전처리 설정을 config.json으로 함께 넣는다", "전처리는 서빙 코드에서 새로 구현한다"], a: 1,
      why: "모델 객체는 클래스 정의·디렉터리 구조·torch 버전에 묶여 서버에서 깨진다. 전처리를 따로 재구현하면 train-serve skew로 정확도만 조용히 떨어진다." },
    { q: "ResNet50에 INT8 정적 양자화를 적용한 결과로 맞는 것은?",
      o: ["크기는 그대로고 정확도만 오른다", "크기 98→92MB, 지연은 그대로다", "크기 약 1/4, 지연 120→47ms, 정확도 94.1→93.6%(예시)"], a: 2,
      why: "가중치와 활성값을 8비트 정수로 바꿔 크기를 줄이고 CPU 추론을 가속한다. 98→92MB에 그친 것은 Linear만 바꾸는 동적 양자화의 결과다. 변환마다 정확도·지연을 다시 재 비교표를 남긴다." },
    { q: "FastAPI로 모델을 서빙할 때 모델은 언제 로드해야 하나?",
      o: ["앱 시작 시(lifespan) 한 번 로드해 메모리에 둔다", "요청이 올 때마다 새로 로드한다", "첫 요청이 들어왔을 때 로드한다"], a: 0,
      why: "로드에 수 초가 걸리므로 요청마다 로드하면 지연 5초에 메모리 폭주가 따라온다. 핸들러는 전처리와 추론만 한다." },
    { q: "배포 직후 더미 입력으로 워밍업 추론을 돌리는 이유는 무엇인가?",
      o: ["모델 정확도를 높이려고", "첫 요청의 lazy 초기화 비용(콜드 페널티)을 사용자에게 떠넘기지 않으려고", "드리프트를 감지하려고"], a: 1,
      why: "0으로 채운 입력을 10회 흘려 초기화와 메모리 할당 비용을 미리 치르면 p99가 920ms에서 180ms로 내려간다. 운영은 평균이 아니라 p99를 본다." },
    { q: "자동 재학습 파이프라인에서 \"가장 중요한 줄\"로 꼽은 것은 무엇인가?",
      o: ["홀드아웃 정확도가 0.93 미만이면 배포를 막는 품질 게이트", "모델을 production으로 바로 올리는 줄", "데이터 스냅샷을 고정하는 줄"], a: 0,
      why: "게이트를 상수로 두면 나쁜 모델이 자동으로 나가는 길이 막힌다. 통과한 모델도 바로 production이 아니라 섀도 단계로 올리고, 드리프트가 잡히면 루프를 다시 돈다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '서빙은 state_dict와 학습 때 쓴 전처리 설정을 한 패키지로 묶는 데서 시작한다.',
    'INT8 양자화와 ONNX로 모델을 작고 빠르게 만든다. 변환할 때마다 정확도와 지연을 다시 잰다.',
    '모델은 앱 시작 때 한 번 로드한다. GPU라면 요청을 모아 배치로 추론해 처리량을 채운다.',
    '운영은 평균 대신 p99를 본다. 새 모델은 섀도와 A/B를 거쳐 내보내고, 문제가 생기면 롤백한다.',
  ];
  const review = [
    { q: '서버에 올린 모델의 정확도가 검증 때보다 조용히 낮다. 에러 로그는 없다. 먼저 의심할 것은?',
      o: ['요청이 몰려 p99 지연이 늘었다', '서빙 코드의 전처리가 학습 때와 다르다', '모델을 앱 시작 때 한 번만 로드했다'], a: 1,
      why: '리사이즈나 정규화 값이 학습 때와 다르면 모델은 멀쩡해도 입력이 달라진다. 이 train-serve skew는 에러 없이 정확도만 떨어뜨린다.' },
    { q: '양자화한 중소형 모델을 꾸준하지만 완만한 트래픽으로 서빙한다. 가장 알맞은 선택은?',
      o: ['GPU 서버에 동적 배칭', '요청마다 모델을 로드하는 구조', 'CPU 서버'], a: 2,
      why: '양자화한 모델은 CPU에서도 빠르고, 트래픽이 완만하면 GPU를 채울 배치가 모이지 않는다. 요청마다 로드하면 매번 수 초가 걸린다.' },
    { q: '새 모델이 오프라인 평가를 통과했다. 실트래픽에 올리는 순서로 맞는 것은?',
      o: ['섀도로 같이 돌려 본 뒤 A/B로 일부만 넘긴다', '바로 100% 전환하고 문제가 생기면 다시 학습한다', '구모델을 레지스트리에서 지우고 새 모델만 남긴다'], a: 0,
      why: '섀도는 응답에 영향 없이 실트래픽으로 검증하고, A/B는 일부 사용자로 지표를 확인한다. 구버전이 레지스트리에 남아 있어야 바로 롤백할 수 있다.' },
  ];

  RA.page({ title: '서빙 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
