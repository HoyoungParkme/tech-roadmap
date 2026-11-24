/* V-2-2 디버깅 실전 — shape·NaN·OOM 처방전 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   숫자 출처: venv torch 2.15(CPU)에서 코드 블록을 다시 돌린 값 — 에러 문구, 2704, -18.42, 2633 → 1.0(clip 예),
   seed 42 의 randn, 범인 층 6, preflight 의 (32, 10)·loss 2.3403·grad_norm 6.649(seed 0).
   OOM 메시지(2.00 / 8.00 / 7.30 GiB)는 페이지의 예시 값이고, 메모리 막대는 모양을 보이는 그림이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, pill, grow, dot, fly, cells, zone, check, cross, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // =========================================================
  // 1. shape mismatch — 모양이 줄어드는 길
  // =========================================================
  // 특징 맵 덩어리: 채널 n 장을 겹쳐 그린다 (한 변 size px)
  function fmap(cx, cy, size, n, col, s, label) { const g = R.G(cx, cy, s ?? 1), k = Math.min(n, 6);
    for (let i = k - 1; i >= 0; i--) el('rect', { x: -size / 2 + i * 6, y: -size / 2 - i * 6, width: size, height: size, rx: 3, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: 1 - i * 0.08 }, g);
    if (label) mono(0, size / 2 + 24, label, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col }, g); return g; }
  const SH = { inX: 90, convX: 260, poolX: 410, fcX: 820, y: 170 };
  function pipe(k, u) {
    fmap(SH.inX, SH.y, 84, 3, INFO, 1, '(32,3,28,28)');
    if (k >= 1) { const a = k === 1 ? 0.2 : 0; grow(SH.inX + 60, SH.y, SH.convX - 60, SH.y, k === 1 ? E(u, a, a + 0.4) : 1, MUT);
      fmap(SH.convX, SH.y, 78, 16, INK, k === 1 ? pop(u, 0.5) : 1, '(32,16,26,26)');
      grow(SH.convX + 70, SH.y, SH.poolX - 50, SH.y, k === 1 ? E(u, 1.0, 1.4) : 1, MUT);
      fmap(SH.poolX, SH.y, 40, 16, INK, k === 1 ? pop(u, 1.4) : 1, '(32,16,13,13)');
      mono((SH.inX + SH.convX) / 2, SH.y - 92, 'Conv2d(3,16,3)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 1 ? fade(u, 0.4) : 1 });
      mono((SH.convX + SH.poolX) / 2 + 20, SH.y - 92, 'MaxPool2d(2)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 1 ? fade(u, 1.2) : 1 }); }
    if (k >= 2) { const bad = k < 7; card(SH.fcX, SH.y, 170, 56, { rx: 10, text: bad ? 'Linear(500, 10)' : 'Linear(2704, 10)', mono: true, fs: 15, stroke: bad ? BAD : GOOD, color: bad ? BAD : GOOD, fill: bad ? BADBG : GOODBG, s: k === 2 ? pop(u, 0.3) : 1 }); } }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { el('rect', { x: 60, y: 90, width: 840, height: 170, rx: 14, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.2) });
      mono(74, 80, 'class Net(nn.Module)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      sub(480, 180, '레이어 0개 — 에러를 재현할 가장 작은 모델부터', fade(u, 0.9), { 'font-size': 15, fill: INK });
      sub(480, 330, '큰 모델에서 잡지 않는다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    pipe(k, u);
    if (k === 1) { sub(480, 330, '28 → 26 (커널 3) → 13 (반으로), 채널 3 → 16', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { mono(SH.fcX, SH.y + 54, '# 주석: 16 * 13 * 13 = 2704', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.8) });
      mono(SH.fcX, SH.y + 80, 'in_features = 500', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 800, opacity: fade(u, 1.3) });
      sub(480, 360, '이 한 글자가 뒤에서 터진다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { dot([[SH.inX, SH.y], [SH.convX, SH.y], [SH.poolX, SH.y]], seg(u, 0.2, 1.4), ACC, 8);
      check(SH.poolX, SH.y - 60, 10, pop(u, 1.5)); sub(480, 330, 'conv → relu → pool 통과 — 아직 에러 없음', fade(u, 1.7), { 'font-size': 15, fill: INK }); return; }
    // k4~: flatten 막대
    const fl = k === 4 ? E(u, 0.6, 1.6) : 1;
    el('rect', { x: 470, y: SH.y - 14, width: 240 * fl, height: 28, rx: 4, fill: ACC, opacity: 0.75 });
    mono(590, SH.y + 42, '(32, 2704)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: k === 4 ? fade(u, 1.4) : 1 });
    if (k === 4) { terminal(80, 280, 520, 72, ['after pool: torch.Size([32, 16, 13, 13])'], lerp(0, 1, E(u, 0.2, 0.9)), { title: 'print(x.shape)' });
      sub(590, SH.y - 40, 'x.flatten(1) — 16·13·13 = 2704', fade(u, 1.0), { 'font-size': 14.5, fill: INK, class: 'mono' }); return; }
    if (k === 5 || k === 6) { const gx = 760;
      el('line', { x1: gx - 30, y1: SH.y - 50, x2: gx - 30, y2: SH.y + 50, stroke: WARN, 'stroke-width': 5, opacity: k === 5 ? fade(u, 0.3) : 1 });
      mono(gx - 30, SH.y - 60, 'assert', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: k === 5 ? fade(u, 0.3) : 1 });
      if (k === 5) { mono(590, 300, 'x.shape[1]  ==  fc.in_features', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8) });
        mono(500, 336, '2704', { 'font-size': 20, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) }); mono(590, 336, '≠', { 'font-size': 20, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.5) }); mono(690, 336, '500', { 'font-size': 20, 'text-anchor': 'middle', 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); return; }
      dot([[480, SH.y], [gx - 34, SH.y]], seg(u, 0.1, 0.5), ACC, 8); if (u > 0.5) cross(gx - 30, SH.y, 14, pop(u, 0.5));
      terminal(60, 255, 840, 110, [['AssertionError: flatten=2704 != fc.in=500', BADBG], '# assert 가 없으면 Linear 에서:', ['RuntimeError: mat1 and mat2 shapes cannot be multiplied (32x2704 and 500x10)', C.HL]], lerp(0, 3, E(u, 0.7, 2.2)), { title: 'python debug_playbook.py', fs: 13.5 });
      sub(480, 395, '안쪽 두 숫자 2704 와 500 이 범인이다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k7: 처방
    dot([[480, SH.y], [SH.fcX, SH.y]], seg(u, 0.2, 0.9), GOOD, 8);
    card(330, 310, 300, 50, { rx: 10, text: 'nn.Linear(16*13*13, 10)', mono: true, fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 0.6) });
    card(680, 310, 300, 50, { rx: 10, text: 'nn.LazyLinear(10)', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.1) });
    sub(680, 355, '첫 forward 뒤 in_features → 2704', fade(u, 1.6), { 'font-size': 14 }); mono(505, 316, '또는', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }

  // =========================================================
  // 2. NaN — 번지기 전에 잡는다
  // =========================================================
  function vec(x, y, vals, cols, s, label) { cells(x, y, vals, { w: 84, h: 40, fs: 15, style: (i) => ({ stroke: cols[i], color: cols[i], fill: cols[i] === BAD ? BADBG : PANEL, s }) });
    if (label) mono(x - 12, y + 25, label, { 'font-size': 14.5, 'text-anchor': 'end', 'font-weight': 700 }); }
  function params(x, y, bad, u) { for (let i = 0; i < 24; i++) { const r = Math.floor(i / 6), c = i % 6, red = i < bad * 24 * clamp(u ?? 1);
      el('rect', { x: x + c * 26, y: y + r * 26, width: 22, height: 22, rx: 3, fill: red ? BAD : GOOD, opacity: red ? 0.8 : 0.35 }); }
    tx(x, y - 10, '모델 파라미터', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const vals = ['0.12', '-0.40', '1.30', 'nan', '0.08', '0.77'];
      cells(170, 150, vals, { w: 90, h: 46, fs: 15, style: (i, v) => ({ stroke: v === 'nan' ? BAD : GRID, color: v === 'nan' ? BAD : INK, fill: v === 'nan' && u > 1.4 ? BADBG : PANEL }) });
      const scan = E(u, 0.3, 1.4); el('rect', { x: 170 + scan * 3 * 96, y: 140, width: 92, height: 66, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: u < 1.6 ? 1 : 0 });
      mono(470, 110, 'torch.isfinite(t).all()', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700 });
      card(470, 280, 420, 46, { rx: 10, text: 'RuntimeError: NaN/Inf 발견: loss', mono: true, fs: 15, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.6) });
      sub(470, 340, '이름표를 달아 처음 물든 자리를 특정한다', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { const N = [[180, 'SumBackward0'], [440, 'MulBackward0'], [700, 'LogBackward0']];
      N.forEach(([x, s], i) => { card(x, 170, 190, 44, { rx: 8, text: s, mono: true, fs: 14.5, stroke: i === 2 ? BAD : INK, s: pop(u, 0.3 + i * 0.3) }); if (i) grow(N[i - 1][0] + 96, 170, x - 97, 170, E(u, 0.4 + i * 0.3, 0.7 + i * 0.3), MUT); });
      pill(480, 90, 'torch.autograd.set_detect_anomaly(True)', WARN, pop(u, 0.1), { mono: true, fs: 15 });
      dot(N.map(([x]) => [x, 170]), seg(u, 1.2, 2.0), BAD, 7);
      terminal(120, 240, 720, 80, [["RuntimeError: Function 'LogBackward0' returned nan values in its 0th output.", BADBG]], lerp(0, 1, E(u, 1.8, 2.6)), { title: 'backward()', fs: 13.5 });
      sub(480, 370, '느리니 버그 잡을 때만 켠다', fade(u, 2.4), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2 || k === 3) { const fix = k === 3;
      vec(250, 70, fix ? ['0 + eps', '1 + eps'] : ['0.0', '1.0'], [fix ? GOOD : INK, INK], 1, 'p');
      grow(340, 118, 340, 150, 1, MUT); mono(360, 140, fix ? 'log(p + eps)' : 'log(p)', { 'font-size': 14.5, fill: MUT });
      vec(250, 160, fix ? ['-18.42', '0.00'] : ['-inf', '0.0'], [fix ? GOOD : BAD, INK], k === 2 ? pop(u, 0.6) : pop(u, 0.4), '');
      grow(340, 208, 340, 240, k === 2 ? E(u, 1.0, 1.3) : E(u, 0.8, 1.1), MUT); mono(360, 230, 'p * …', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
      vec(250, 250, fix ? ['0.00', '0.00'] : ['nan', '0.0'], [fix ? GOOD : BAD, INK], pop(u, 1.3), '');
      mono(560, 275, fix ? 'sum → 유한' : 'sum → nan', { 'font-size': 18, 'font-weight': 800, fill: fix ? GOOD : BAD, opacity: fade(u, 1.8) });
      tx(560, 120, fix ? 'eps = 1e-8 을 더하면' : '0 × log(0) = 0 × -inf', { 'font-size': 15, 'font-weight': 700, fill: fix ? GOOD : BAD, opacity: fade(u, 0.3) });
      sub(700, 360, fix ? '분류 손실은 BCEWithLogitsLoss 같은 안정판' : '-inf 가 다음 연산에서 nan 이 된다', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
    // k4~6: 학습 스텝 트랙
    const ST = [['zero_grad', INK], ['forward', INK], ['loss', INK], ['backward', INK], ['step', INK]], sx = (i) => 110 + i * 150;
    ST.forEach(([s], i) => { card(sx(i), 90, 120, 44, { rx: 8, text: s, mono: true, fs: 14.5, stroke: INK, s: k === 4 ? pop(u, 0.2 + i * 0.25) : 1 }); if (i) grow(sx(i - 1) + 60, 90, sx(i) - 62, 90, k === 4 ? E(u, 0.3 + i * 0.25, 0.5 + i * 0.25) : 1, MUT); });
    if (k === 4) { params(560, 220, 0, 1); sub(260, 260, '방어선이 아직 없다', fade(u, 1.8), { 'font-size': 15, fill: INK }); return; }
    if (k === 5) { const gx = (sx(2) + sx(3)) / 2; el('line', { x1: gx, y1: 60, x2: gx, y2: 125, stroke: WARN, 'stroke-width': 5, opacity: fade(u, 0.2) });
      mono(gx, 150, 'assert_finite("loss")', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 800, opacity: fade(u, 0.3) });
      tx(60, 215, '검사 없이 backward', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) }); params(60, 240, 1, E(u, 0.8, 2.0));
      tx(560, 215, '검사로 멈춤', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) }); params(560, 240, 0, 1);
      sub(480, 395, 'nan 이 gradient 를 타고 모델 전체로 퍼지기 전에 멈춘다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 6) { tx(60, 200, 'clip_grad_norm_(max_norm=1.0)', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      const L = (v) => 40 + Math.log10(v + 1) * 200, g = E(u, 0.3, 1.0), sh = E(u, 1.3, 2.0);
      el('line', { x1: 80, y1: 280, x2: 80 + L(lerp(2633, 1, sh)) * g, y2: 280, stroke: sh > 0.5 ? GOOD : BAD, 'stroke-width': 6, 'stroke-linecap': 'round' });
      mono(100 + L(lerp(2633, 1, sh)) * g, 286, `grad norm ${sh > 0.98 ? '1.0' : Math.round(lerp(2633, 1, sh))}`, { 'font-size': 16, 'font-weight': 800, fill: sh > 0.5 ? GOOD : BAD, opacity: fade(u, 0.6) });
      sub(480, 350, '예: 입력을 50배 키운 실행에서 2633 → 1.0 (방향은 그대로, 길이만)', fade(u, 2.1), { 'font-size': 14, fill: INK });
      tx(60, 240, '길이 (로그 눈금)', { 'font-size': 13.5, fill: MUT }); return; }
    // k7: 수색 순서
    [['1', 'learning rate 과대', 'lr ÷ 10 · clip'], ['2', 'log(0) · ÷0', '+eps · 안정 손실'], ['3', 'fp16 overflow', 'GradScaler 동반'], ['4', '데이터 오염', 'isfinite · 정규화']].forEach(([n, a, b], i) => { const y = 200 + i * 54, s = pop(u, 0.3 + i * 0.4);
      card(150, y, 44, 44, { rx: 22, text: n, fs: 17, fw: 800, stroke: BAD, color: PANEL, fill: BAD, s });
      tx(190, y + 6, a, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) }); tx(520, y + 6, '→ ' + b, { 'font-size': 15, fill: GOOD, opacity: fade(u, 0.5 + i * 0.4) }); });
    tx(150, 170 - 4, '확률 높은 순으로 내려간다', { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.1) }); }

  // =========================================================
  // 3. OOM — 메모리 막대와 처방 사다리
  // =========================================================
  const MX = 80, MW = 760, GB = (g) => MW * g / 8;
  function memBar(y, used, req, o) { o = o || {}; el('rect', { x: MX, y, width: MW, height: 40, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    el('rect', { x: MX, y, width: GB(used), height: 40, rx: 6, fill: INK, opacity: 0.7 });
    if (req) { el('rect', { x: MX + GB(used), y: y - 4, width: GB(req), height: 48, rx: 6, fill: BAD, opacity: 0.55 * (o.rq ?? 1) }); }
    mono(MX, y - 10, o.title || 'GPU 0 메모리 8.00 GiB', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 7) { if (k === 0) { memBar(130, 7.3 * E(u, 0.2, 1.0), 2.0, { rq: fade(u, 1.2) });
        mono(MX + GB(3.6), 156, '사용 7.30 GiB', { 'font-size': 15, fill: PANEL, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
        mono(MX + GB(8.3), 120, '요청 2.00', { 'font-size': 15, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
        terminal(80, 230, 760, 70, [['CUDA out of memory. Tried to allocate 2.00 GiB (GPU 0; 8.00 GiB total; 7.30 GiB already allocated)', BADBG]], lerp(0, 1, E(u, 1.4, 2.4)), { title: '예시 메시지', fs: 13.5 });
        sub(460, 350, '여유 0.7 GiB < 요청 2.0 GiB — 메시지가 진단서다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      // k7: 파편화
      el('rect', { x: MX, y: 130, width: MW, height: 40, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 2 }); mono(MX, 120, 'torch.cuda.memory_summary() (그림)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 12; i++) { const x = MX + i * 63; el('rect', { x: x + 2, y: 132, width: 44, height: 36, rx: 3, fill: INK, opacity: 0.65 * fade(u, 0.1 + i * 0.08) }); el('rect', { x: x + 48, y: 132, width: 13, height: 36, fill: GOOD, opacity: 0.6 * fade(u, 1.1) }); }
      sub(460, 220, '빈칸을 다 더하면 충분해도 한 덩어리로 이어진 곳이 없다', fade(u, 1.4), { 'font-size': 15, fill: INK });
      el('rect', { x: 380, y: 260, width: 160, height: 36, rx: 6, fill: BAD, opacity: 0.6 * fade(u, 1.8) }); mono(460, 284, '큰 요청', { 'font-size': 14.5, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(460, 340, '파편화 — 총량이 아니라 연속 여유가 관건', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { const ax = R.axes(110, 80, 500, 230, { x: [0, 10], y: [0, 10], xl: '스텝 →', yl: '메모리 (그림)' });
      const n = Math.floor(E(u, 0.2, 2.4) * 10); for (let i = 0; i < n; i++) el('rect', { x: ax.X(i) + 4, y: ax.Y(i + 1), width: 36, height: ax.Y(0) - ax.Y(i + 1), fill: BAD, opacity: 0.35 });
      R.line(ax, [[0, 1], [10, 1]], E(u, 0.4, 2.4), GOOD, { sw: 3.5 });
      mono(650, 120, 'losses.append(loss)', { 'font-size': 15, fill: BAD, 'font-weight': 700 }); tx(650, 146, '그래프가 통째로 남아 계단처럼 샌다', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.8) });
      mono(650, 230, 'losses.append(loss.item())', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) }); tx(650, 256, '스칼라만 — 평평하다', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { [['fp32 activation', 1, INK], ['fp16 (AMP)', 0.5, ACC]].forEach(([s, f, col], i) => { const y = 120 + i * 100, w = 600 * f * (i ? lerp(2, 1, E(u, 0.6, 1.6)) : 1);
        tx(80, y - 12, s, { 'font-size': 15, 'font-weight': 700, fill: col }); el('rect', { x: 80, y, width: w, height: 40, rx: 6, fill: col, opacity: 0.6 }); });
      mono(400, 300, 'scaler = GradScaler("cuda")', { 'font-size': 15, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(380, 350, '처방 2 — activation 이 대략 절반', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k >= 3 && k <= 5) { const bx = (i) => 95 + i * 110;
      for (let i = 0; i < 8; i++) { const a = k === 3 ? 0.2 + i * 0.12 : 0; el('rect', { x: bx(i) - 40, y: 110, width: 80, height: 40, rx: 6, fill: INFO, opacity: 0.6 * fade(u, a) }); mono(bx(i), 136, `i=${i}`, { 'font-size': 14, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700, opacity: fade(u, a) }); }
      tx(70, 96, '작은 배치 (메모리는 이만큼만)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      if (k === 3) { mono(480, 230, 'ACCUM = 4', { 'font-size': 22, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
        sub(480, 270, '유효 배치 = 실제 배치 × 4', fade(u, 1.7), { 'font-size': 15, fill: INK }); return; }
      if (k === 4) { mono(480, 210, 'with autocast("cuda"):', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 0.2) });
        mono(480, 250, 'loss = loss_fn(model(x), y) / ACCUM', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
        sub(480, 300, '4번 더하면 큰 배치 하나의 평균 손실과 같은 크기가 된다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); return; }
      // k5: step 은 i = 3, 7
      for (let i = 0; i < 8; i++) { const a = 0.2 + i * 0.25; grow(bx(i), 152, bx(i), 200, E(u, a, a + 0.2), MUT, { plain: true });
        el('rect', { x: bx(i) - 30, y: 200, width: 60, height: 10 + 10 * ((i % 4) + 1) * fade(u, a), fill: WARN, opacity: 0.6 }); }
      mono(70, 260, 'grad 누적', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
      [3, 7].forEach((i, j) => { const a = 1.2 + j * 0.8; pill(bx(i), 300, 'scaler.step', GOOD, pop(u, a), { mono: true, fs: 14 }); mono(bx(i), 335, 'zero_grad', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, a + 0.2) }); });
      sub(480, 385, '(i + 1) % 4 == 0 일 때만 — 8 스텝에 step 2번', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    // k6: checkpointing
    ['block 1', 'block 2', 'block 3', 'block 4'].forEach((s, i) => { const x = 140 + i * 200; card(x, 120, 140, 44, { rx: 8, text: s, mono: true, fs: 14.5, stroke: INK });
      el('rect', { x: x - 50, y: 170, width: 100, height: 30, rx: 4, fill: i === 0 ? ACC : 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': i === 0 ? null : '5 4', opacity: fade(u, 0.3 + i * 0.2) }); });
    tx(60, 230, '저장하는 activation — 처음 하나만, 나머지는 버린다', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
    el('rect', { x: 80, y: 280, width: 400 * E(u, 1.2, 1.8), height: 30, rx: 4, fill: INFO, opacity: 0.6 }); el('rect', { x: 480, y: 280, width: 180 * E(u, 1.8, 2.3), height: 30, rx: 4, fill: WARN, opacity: 0.7 });
    tx(80, 340, 'backward 시간', { 'font-size': 14, fill: MUT }); tx(490, 340, '+ 다시 계산', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
    sub(480, 395, '메모리를 시간과 맞바꾸는 마지막 카드', fade(u, 2.3), { 'font-size': 15, fill: INK }); }

  // =========================================================
  // 4. 재현과 격리 — 범인 층 찾기
  // =========================================================
  const LX = (i) => 70 + i * 86;
  function layers(o) { o = o || {}; for (let i = 0; i < 10; i++) { const bad = o.badFrom != null && i >= o.badFrom, hit = o.hit === i;
      card(LX(i), 200, 70, 70, { rx: 8, text: 'L' + i, mono: true, fs: 15, stroke: hit ? BAD : bad ? BAD : o.ok && i < o.ok ? GOOD : INK, fill: bad ? BADBG : PANEL, sw: hit ? 3.5 : 2, s: o.s ? o.s(i) : 1, color: bad ? BAD : INK });
      if (i) grow(LX(i - 1) + 36, 200, LX(i) - 36, 200, o.s ? clamp(o.s(i) * 1.2) : 1, MUT); } }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [0, 1].forEach((r) => { const y = 130 + r * 110; mono(80, y + 26, `실행 ${r + 1}`, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + r * 0.8) });
        mono(200, y + 26, 'manual_seed(42); randn(3) →', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + r * 0.8) });
        cells(500, y, ['0.3367', '0.1288', '0.2345'], { w: 100, h: 40, fs: 15, style: () => ({ stroke: GOOD, color: INK, s: pop(u, 0.6 + r * 0.8) }) }); });
      sub(480, 370, '같은 seed 면 같은 난수 — 버그가 매번 같은 자리에서 난다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { card(250, 160, 280, 50, { rx: 10, text: 'cuDNN 빠른 경로 (비결정)', fs: 15, stroke: OFF, color: OFF, dash: '6 4', s: pop(u, 0.2) }); if (u > 0.9) cross(400, 140, 12, pop(u, 0.9));
      card(250, 250, 280, 50, { rx: 10, text: '결정 알고리즘만', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 0.7) });
      pill(700, 200, 'use_deterministic_algorithms(True)', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      sub(480, 360, '결정 버전이 없는 연산은 에러가 나 완전 재현에는 한계가 있다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2) { layers({ s: (i) => pop(u, 0.2 + i * 0.15) }); for (let i = 0; i < 10; i++) if (u > 1.0 + i * 0.12) el('circle', { cx: LX(i), cy: 260, r: 6, fill: WARN });
      sub(480, 320, '층마다 출력을 받아 검사할 자리가 생긴다', fade(u, 2.2), { 'font-size': 15, fill: INK }); mono(480, 110, 'for i, layer in enumerate(layers): x = layer(x)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 0.1) }); return; }
    if (k === 3) { layers({ ok: 10 }); mono(480, 110, 'if not torch.isfinite(x).all(): return i', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700 });
      tx(480, 310, '층이 많으면 절반씩 — 10층은 4번 안쪽', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) });
      [[0, 9], [5, 9], [5, 7], [6, 6]].forEach(([a, b], j) => { const op = fade(u, 1.3 + j * 0.3); el('rect', { x: LX(a) - 38, y: 340 + j * 0, width: LX(b) - LX(a) + 76, height: 8, rx: 4, fill: INFO, opacity: op * (0.25 + j * 0.2) }); });
      sub(480, 380, '끝까지 멀쩡하면 -1', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { const p = E(u, 0.3, 1.8) * 10; layers({ ok: Math.min(6, Math.floor(p)), badFrom: p > 6.5 ? 6 : null, hit: p > 6.5 ? 6 : null });
      dot([[LX(0), 200], [LX(6), 200]], seg(u, 0.3, 1.5), ACC, 7);
      mono(LX(6), 120, 'bias[0] = nan (심은 버그)', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.1) });
      terminal(260, 280, 440, 70, ['범인 층: 6'], lerp(0, 1, E(u, 1.9, 2.4)), { title: 'python debug_playbook.py' });
      sub(480, 385, '랜덤 텐서 1개 · Linear 10개 — 데이터로더도 학습 루프도 없다', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 5 || k === 6) { const sync = k === 5 && u > 1.5;
      tx(60, 70, k === 5 ? 'CUDA 는 비동기 — 에러가 엉뚱한 줄에서 보인다' : '.cpu() 로 내리면 그 줄에서 바로', { 'font-size': 15, 'font-weight': 700 });
      ['line 41: out = model(x)', 'line 42: loss = …', 'line 43: print(loss)'].forEach((s, i) => mono(80, 130 + i * 40, s, { 'font-size': 15, fill: INK }));
      const errLine = k === 6 || sync ? 0 : 2; el('rect', { x: 70, y: 110 + errLine * 40, width: 300, height: 30, rx: 4, fill: BAD, opacity: 0.18 * fade(u, k === 5 && sync ? 1.6 : 0.6) });
      mono(390, 135 + errLine * 40, '← 에러 보고', { 'font-size': 14.5, fill: BAD, 'font-weight': 800, opacity: fade(u, k === 5 && sync ? 1.6 : 0.6) });
      if (k === 5) { mono(560, 136, 'GPU 커널', { 'font-size': 14, fill: MUT }); el('rect', { x: 650, y: 120, width: 220 * E(u, 0.2, 1.2), height: 22, rx: 4, fill: ACC, opacity: 0.6 });
        pill(700, 300, 'CUDA_LAUNCH_BLOCKING=1', WARN, pop(u, 1.3), { mono: true, fs: 15 }); sub(700, 340, '커널마다 기다려 진짜 줄을 가리킨다', fade(u, 1.8), { 'font-size': 14 }); return; }
      card(720, 170, 340, 56, { rx: 10, text: 'model.cpu() · x.cpu()', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.2) });
      card(720, 260, 340, 56, { rx: 10, text: '읽을 수 있는 메시지 + 정확한 줄', fs: 15, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.0) });
      sub(480, 390, 'CUDA 버그를 만나면 일단 CPU 로 내려 본다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k7: 최소 재현
    const sq = E(u, 0.4, 1.6);
    [['DataLoader', 0], ['전체 모델', 1], ['학습 루프', 2], ['로깅·설정', 3]].forEach(([s, i]) => card(lerp(140 + i * 190, 480, sq), lerp(140, 200, sq), 160, 50, { rx: 10, text: s, fs: 15, stroke: GRID, color: MUT, op: 1 - sq }));
    card(380, 230, 200, 50, { rx: 10, text: 'torch.randn(4, 8)', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.6) });
    card(600, 230, 180, 50, { rx: 10, text: '의심 레이어 1개', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.9) });
    sub(480, 330, '버그가 벌거벗는다', fade(u, 2.3), { 'font-size': 16, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 5. preflight — 학습 첫 줄의 점검
  // =========================================================
  const CHK = [['1호 shape', 'shape OK: (32, 10)', INFO], ['2호 loss', 'loss = 2.3403 (유한)', WARN], ['2호 grad', 'grad_norm: 6.649 (27,498개)', WARN], ['3호 메모리', 'cuda 일 때만 peak MB', BAD]];
  const PARTS = [['Ⅰ', '텐서와 자동미분'], ['Ⅱ', '모델을 만드는 두 방식'], ['Ⅲ', '데이터와 학습 관리'], ['Ⅳ', '실전 모델링'], ['Ⅴ', '프로덕션']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 4) { card(480, 60, 600, 46, { rx: 10, text: 'preflight_check(model, x, y, loss_fn, device)', mono: true, fs: 15, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      if (k === 0) { ['model', 'x', 'y'].forEach((s, i) => fly(200, 130 + i * 45, 640, 130 + i * 45, seg(u, 0.6 + i * 0.3, 1.4 + i * 0.3), s, { mono: true, stay: true }));
        card(800, 175, 120, 60, { rx: 10, text: 'device', mono: true, fs: 15, stroke: INFO, s: pop(u, 0.4) }); sub(480, 300, '본 학습 전 딱 한 번 — 3대 사망 원인을 한 번에', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
      CHK.slice(0, k).forEach(([a, b, col], i) => { const y = 140 + i * 62, fresh = i === k - 1, s = fresh ? pop(u, 0.3) : 1;
        card(250, y, 220, 48, { rx: 10, text: a, fs: 15.5, stroke: col, color: col, s });
        mono(400, y + 6, b, { 'font-size': 16, 'font-weight': 700, opacity: fresh ? fade(u, 0.8) : 1, fill: i === 3 ? MUT : INK });
        if (i < 3 && (!fresh || u > 1.2)) check(860, y, 11, fresh ? pop(u, 1.2) : 1); });
      if (k === 4) pill(480, 400, '✅ preflight 통과 — CPU 실행이라 메모리 줄은 건너뜀', GOOD, pop(u, 1.4), { fs: 14.5 });
      if (k === 1) sub(480, 400, 'seed 0, 고친 Net 에 (32, 3, 28, 28) 을 넣은 실행값', fade(u, 1.8), { 'font-size': 14 });
      return; }
    // k5: 졸업 지도
    PARTS.forEach(([n, s], i) => { const x = 100 + i * 190, a = 0.2 + i * 0.25; card(x, 110, 170, 64, { rx: 12, text: `Part ${n}\n${s}`, fs: 14, stroke: GOOD, color: INK, fill: GOODBG, s: pop(u, a) }); if (i) grow(x - 105, 110, x - 87, 110, E(u, a, a + 0.2), GOOD); });
    tx(480, 190, 'PyTorch 20장 — 만들고, 돌리고, 고칠 수 있다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    [['dl', '원리를 더 깊이'], ['tensorflow', '다른 프레임워크와 비교'], ['mlops · llmops', '배포·운영']].forEach(([a, b], i) => { const x = 200 + i * 280, a2 = 1.6 + i * 0.3;
      grow(480, 205, x, 280, E(u, a2, a2 + 0.3), INFO, { plain: true });
      card(x, 310, 230, 60, { rx: 12, text: a + '\n' + b, fs: 14.5, stroke: INFO, color: INK, s: pop(u, a2 + 0.2) }); }); }

  const quiz = [
    { q: '"mat1 and mat2 shapes cannot be multiplied (32x2704 and 500x10)" 에서 먼저 읽을 것은 무엇인가?',
      o: ['배치 크기 32', '안쪽 두 숫자 2704와 500 — flatten 크기와 Linear 입력이 다르다', '출력 크기 10'], a: 1,
      why: '행렬곱은 앞의 열과 뒤의 행이 같아야 한다. 16×13×13 = 2704 인데 Linear에 500을 넣은 것이 원인이다.' },
    { q: 'p = [0.0, 1.0]일 때 (p * torch.log(p)).sum()이 nan이 되는 이유는 무엇인가?',
      o: ['log(0)이 -inf가 되고 0 × -inf가 nan이 되어서', 'p의 dtype이 정수라서', 'sum이 너무 큰 값을 만들어서'], a: 0,
      why: 'log(0) = -inf가 다음 곱셈에서 nan이 된다. eps를 더하면 log(1e-8) = -18.42로 유한하게 남는다.' },
    { q: 'loss를 매 스텝 losses.append(loss)로 모았더니 메모리가 조금씩 늘다 OOM이 났다. 처방은?',
      o: ['배치 크기를 두 배로 늘린다', 'losses.append(loss.item())로 스칼라만 담는다', 'GradScaler를 끈다'], a: 1,
      why: 'loss 텐서를 그대로 두면 계산 그래프가 통째로 살아남는다. .item()으로 숫자만 떼어 담으면 메모리가 평평해진다.' },
    { q: '10층 중 어디서 NaN이 생기는지 찾을 때 find_bad_layer가 하는 일은?',
      o: ['층마다 출력을 검사해 처음 유한하지 않은 층 번호를 돌려준다', '모든 층의 가중치를 다시 초기화한다', 'NaN을 0으로 바꿔 학습을 이어 간다'], a: 0,
      why: '층을 하나씩 통과시키며 isfinite를 본다. 6번 층 bias에 nan을 심은 실행에서 "범인 층: 6" 이 나왔다.' },
    { q: 'preflight_check를 언제 부르는가?',
      o: ['학습이 끝난 뒤 한 번', '매 스텝마다', '본 학습을 시작하기 전에 한 번'], a: 2,
      why: 'shape·loss·grad·메모리를 한 스텝으로 미리 확인해 세 가지 사망 원인을 학습 전에 걸러 낸다.' },
  ];

  const summary = [
    'shape 에러는 메시지의 안쪽 두 숫자를 읽고, Linear 앞에 assert로 경계를 지킨다.',
    'NaN은 lr, log(0)·÷0, fp16, 데이터 순으로 찾고 backward 전에 loss를 검사한다.',
    'OOM은 배치를 줄이고 AMP, accumulation, checkpointing 순으로 내려간다.',
    'seed를 고정하고 랜덤 텐서와 의심 층만 남겨 재현하면 범인 층이 드러난다.',
  ];
  const review = [
    { q: '학습 중 loss가 갑자기 nan이 됐다. 데이터를 뒤지기 전에 먼저 해 볼 것은?',
      o: ['데이터셋을 처음부터 다시 만든다', 'learning rate를 1/10로 줄이고 clip_grad_norm_을 건다', '배치 크기를 키운다'], a: 1,
      why: 'NaN의 1순위 원인은 lr 과대로 인한 gradient 폭발이다. 확률 높은 순으로 수색해야 시간이 덜 든다.' },
    { q: 'GPU에서 에러가 엉뚱한 print 줄에서 났다고 나온다. 가장 먼저 할 일은?',
      o: ['print 줄을 지운다', 'GPU 드라이버를 다시 설치한다', 'CUDA_LAUNCH_BLOCKING=1로 돌리거나 모델을 CPU로 내려 다시 돌린다'], a: 2,
      why: 'CUDA 커널은 비동기라 에러가 늦게 보고된다. 동기 실행이나 CPU 실행이면 진짜 줄과 읽을 수 있는 메시지가 나온다.' },
    { q: '배치를 줄였더니 OOM은 사라졌지만 학습이 불안정해졌다. 메모리는 그대로 두고 큰 배치 효과를 내려면?',
      o: ['gradient accumulation으로 작은 배치 여러 번을 모아 한 번 step 한다', 'loss를 리스트에 그대로 쌓는다', 'set_detect_anomaly를 켠다'], a: 0,
      why: 'ACCUM=4면 작은 배치 네 번의 grad를 더한 뒤 step 한다. 메모리는 작은 배치만큼, 유효 배치는 네 배다.' },
  ];

  R.page({ title: '디버깅 처방전', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
