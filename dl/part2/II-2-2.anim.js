/* II-2-2 전이학습 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 왼쪽 = ResNet50 층 스택(아래 conv1 → 위 fc). 층마다 상태 아이콘이 바뀐다
 *   (무작위 = 흐트러진 가중치 칸, 동결 = 자물쇠, 해동 = 불꽃, 교체 = NEW). 오른쪽 = 같은 500장의 검증 정확도 곡선.
 * 곡선 값은 페이지의 CURVE_* 배열(예시 곡선)을 그대로 옮겼다. 파라미터 수(25,557,032 / 4,098 / 3,407,872)는 torch·산수로 확인한 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, grow, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 페이지 CURVE_* 와 같은 값 (에폭 0~12, 검증 정확도 %)
  const CV = {
    scratchTrain: { d: [10, 34, 55, 72, 84, 91, 95, 97, 98, 99, 99, 99, 99], col: MUT, dash: '6 5', name: '밑바닥 train' },
    scratchVal: { d: [10, 22, 33, 42, 48, 52, 54, 55, 54, 53, 53, 52, 52], col: BAD, name: '밑바닥 val' },
    feat: { d: [31, 58, 71, 78, 81, 83, 84, 85, 85, 86, 86, 86, 86], col: INFO, name: '특징 추출' },
    fine: { d: [31, 58, 71, 78, 81, 83, 84, 85, 87, 89, 90, 91, 92], col: ACC, name: '파인튜닝' },
  };
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 700, opacity: op }, a || {}));
  const on = (c, kk, at, d) => (c.k > kk ? 1 : c.k === kk ? E(c.u, at, at + (d || 0.5)) : 0);

  // ---------- 층 스택 ----------
  const SX = 175, SW = 270, SY = (i) => 365 - i * 50;
  const ST = { random: [OFF, PANEL], frozen: [INFO, INFOBG], thaw: [WARN, WARNBG], new: [GOOD, GOODBG] };
  function flame(x, y, s, op) { el('path', { d: `M${x},${y + 9 * s} C${x - 9 * s},${y + 4 * s} ${x - 7 * s},${y - 4 * s} ${x - 1 * s},${y - 11 * s} C${x},${y - 4 * s} ${x + 5 * s},${y - 5 * s} ${x + 4 * s},${y - 10 * s} C${x + 10 * s},${y - 2 * s} ${x + 8 * s},${y + 5 * s} ${x},${y + 9 * s} Z`, fill: WARN, opacity: op }); }
  function noise(x, y, i, op) { for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { const v = ((i * 7 + r * 5 + q * 3) % 5) / 4; el('rect', { x: x - 10 + q * 7, y: y - 10 + r * 7, width: 6, height: 6, fill: v > 0.5 ? MUT : OFF, opacity: op * (0.35 + 0.65 * v) }); } }
  function icon(st, x, y, i, s) { if (s <= 0.02) return; if (st === 'random') noise(x, y, i, s); else if (st === 'frozen') lock(x, y + 2, true, INFO, s); else if (st === 'thaw') flame(x, y, s, 1); else if (st === 'new') card(x, y, 40, 22, { rx: 11, fill: GOOD, stroke: 'none', text: 'NEW', fs: 13.5, color: PANEL, s }); }
  // o.layers 로 덮어쓸 수 있다. 바뀐 층은 위에서부터(or 아래부터) 차례로 바뀐다
  function stack(c, o) { o = o || {}; const L = o.layers || c.beat.layers || [], P = o.prev !== undefined ? o.prev : (c.prev && c.prev.layers) || [], u = c.u;
    if (!L.length && o.slots) { for (let i = 0; i < 6; i++) el('rect', { x: SX - SW / 2, y: SY(i) - 20, width: SW, height: 40, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }); return; }
    tx(SX - SW / 2, 62, 'ResNet50 (위 = 출력)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    L.forEach((l, i) => { const p = P[i], ord = o.down ? (L.length - 1 - i) : i, at = (o.at ?? 0.3) + ord * 0.2;
      const born = !p, ch = born || p.state !== l.state || p.name !== l.name || p.role !== l.role;
      const f = ch ? E(u, at, at + 0.4) : 1, st = ch && f < 0.5 && !born ? p.state : l.state, [sc, fl] = ST[st] || ST.frozen;
      const s = born ? pop(u, at) : 1, y = SY(i);
      card(SX, y, SW, 40, { rx: 8, stroke: sc, fill: fl, sw: ch && !born && f > 0.3 && f < 0.9 ? 3.5 : 2, s });
      if (s > 0.3) { mono(SX - SW / 2 + 12, y + 5, l.name, { 'font-size': 14.5, 'font-weight': 800, fill: INK });
        tx(SX - SW / 2 + 80, y + 5, (ch && f < 0.5 && !born ? p.role : l.role), { 'font-size': 13.5, fill: MUT });
        icon(st, SX + SW / 2 - 22, y, i, ch && !born ? Math.abs(f - 0.5) * 2 : s); }
      const lr = l.lr, plr = p && p.lr; if (lr) { const a = plr === lr ? 1 : E(u, at + 0.2, at + 0.6); pill(SX + SW / 2 + 42, y, lr, WARN, a, { mono: true, fs: 14 }); } });
    if (L.length > 1) grow(SX - SW / 2 - 16, SY(0) + 16, SX - SW / 2 - 16, SY(L.length - 1) - 16, 1, GRID, { sw: 2 }); }

  // ---------- 정확도 곡선 ----------
  function chart(c, o) { o = o || {}; const keys = o.keys || c.beat.curves || [], pk = (c.prev && c.prev.curves) || [];
    const ax = R.axes(500, 80, 360, 220, { x: [0, 12], y: [0, 100], xt: [0, 4, 8, 12], yt: [0, 50, 100], grid: true, xl: '에폭', yl: '정확도 %' });
    const ends = [];
    keys.forEach((key, j) => { const s = CV[key], fresh = o.fresh ? o.fresh.includes(key) : !pk.includes(key), uu = fresh ? E(c.u, o.at ?? 0.4, (o.at ?? 0.4) + 1.6) : 1;
      const pts = s.d.map((v, i) => [i, v]); R.line(ax, key === 'fine' ? pts.slice(8) : pts, uu, s.col, { dash: s.dash, sw: 3 });
      if (key === 'fine') R.line(ax, pts.slice(0, 9), 1, s.col, { sw: 3, op: 0.35 });
      if (uu > 0.97) ends.push([s.d[12], s]); });
    ends.sort((a, b) => b[0] - a[0]); let lastY = -1e9;
    ends.forEach(([v, s]) => { let y = ax.Y(v) + 5; if (y - lastY < 18) y = lastY + 18; lastY = y;
      mono(ax.X(12) + 8, y, `${v}`, { 'font-size': 14.5, 'font-weight': 800, fill: s.col }); });
    if (!o.noLegend) { let xx = 500; keys.forEach((key) => { const s = CV[key]; el('line', { x1: xx, y1: 352, x2: xx + 18, y2: 352, stroke: s.col, 'stroke-width': 3, 'stroke-dasharray': s.dash });
      tx(xx + 24, 357, s.name, { 'font-size': 13.5, fill: INK }); xx += 40 + tw(s.name, 13.5); }); }
    sub(860, 400, '예시 곡선 (가상의 500장)', 1, { 'text-anchor': 'end', 'font-size': 13.5 });
    return ax; }

  // ---------- 1. 밑바닥 학습 ----------
  function dataset(x, y, n, u, at, cols) { cols = cols || 25; for (let i = 0; i < n; i++) { const f = clamp((u - at) * 3 - i / n * 2); if (f <= 0) continue;
      el('rect', { x: x + (i % cols) * 13, y: y + Math.floor(i / cols) * 12, width: 10, height: 10, rx: 2, fill: i % 9 === 0 ? BAD : INFO, opacity: 0.25 + 0.6 * f }); } }
  function s1(t, c) { const { k, u } = c;
    if (k <= 4) { if (k === 0) stack(c, { slots: true });
      if (k <= 2) { dataset(520, 92, 500, k === 0 ? u : 9, 0.3); note(520, 360, '라벨 데이터 500장 — 불량은 원래 희귀하다', k === 0 ? fade(u, 1.5) : 1); sub(520, 388, '(사진 한 칸 = 1장)', k === 0 ? fade(u, 1.8) : 1, { 'text-anchor': 'start' }); }
      if (k === 0) { mono(520, 62, 'from torchvision import models', { 'font-size': 15, opacity: fade(u, 0.6) }); note(175, 62, '아직 모델도 가중치도 없다', fade(u, 1.2), { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT }); }
      if (k === 1) mono(520, 60, 'resnet50(weights=None)', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
      if (k === 2) mono(520, 60, 'model.fc = nn.Linear(2048, 2)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      if (k === 3 || k === 4) { const g = k === 3 ? E(u, 0.3, 1.2) : 1;
        el('rect', { x: 520, y: 80, width: 340 * g, height: 160, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 2 });
        mono(530, 110, `파라미터 ${fmt(25557032 * g)}`, { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: g });
        el('rect', { x: 520, y: 262, width: 4, height: 22, fill: INFO, opacity: k === 3 ? fade(u, 1.3) : 1 });
        mono(534, 280, '데이터 500장', { 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: k === 3 ? fade(u, 1.4) : 1 });
        if (k === 3) note(520, 330, '파라미터가 데이터의 약 5만 배', fade(u, 2.0)); }
      if (k === 4) { pill(690, 375, 'Adam(model.parameters(), lr=1e-3)', ACC, pop(u, 0.2), { mono: true, fs: 14 });
        [0, 1, 2, 3, 4, 5].forEach((i) => grow(560, 360, SX + SW / 2 + 6, SY(i), E(u, 0.8 + i * 0.12, 1.2 + i * 0.12), ACC, { sw: 1.6 })); }
      if (k >= 1) stack(c, { at: 0.4 });
      return; }
    stack(c);
    if (k === 5) chart(c, { keys: ['scratchTrain'], fresh: ['scratchTrain'] });
    if (k === 6 || k === 7) { const ax = chart(c, { fresh: k === 6 ? ['scratchVal'] : [] });
      const g = k === 6 ? E(u, 2.0, 2.4) : 1; el('line', { x1: ax.X(12) - 30, y1: ax.Y(99), x2: ax.X(12) - 30, y2: ax.Y(99) + (ax.Y(52) - ax.Y(99)) * g, stroke: BAD, 'stroke-width': 3, 'marker-end': g > 0.95 ? 'url(#ra-ahr)' : null });
      mono(ax.X(12) - 40, ax.Y(76), '격차 47%p', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: g }); }
    if (k === 7) { const B = [[0, 1, '범용 ◎', GOOD], [2, 3, '재사용 ○', INFO], [4, 5, '교체 대상 △', BAD]];
      B.forEach(([a, b, s, col], i) => { const x = SX + SW / 2 + 14, f = fade(u, 0.4 + i * 0.5);
        el('path', { d: `M${x},${SY(a) + 18} L${x + 8},${SY(a) + 18} L${x + 8},${SY(b) - 18} L${x},${SY(b) - 18}`, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: f });
        tx(x + 14, (SY(a) + SY(b)) / 2 + 5, s, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: f }); });
      note(500, 386, '아래층 엣지·질감은 ImageNet 이 이미 배웠다', fade(u, 2.0), { 'font-size': 14.5 }); }
  }

  // ---------- 2. 특징 추출 ----------
  function counter(x, y, label, v, col, op) { tx(x, y, label, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op ?? 1 }); mono(x, y + 34, fmt(v), { 'font-size': 26, 'font-weight': 800, fill: col, opacity: op ?? 1 }); }
  function s2(t, c) { const { k, u } = c;
    stack(c, { down: k === 2 || k === 1 });
    if (k <= 5) { const v = k <= 1 ? 25557032 : k === 2 ? tween(25557032, 0, u, 1.6) : k === 3 ? tween(0, 4098, u, 1.0) : 4098;
      if (k !== 4) counter(520, 80, '학습 대상 파라미터', v, k >= 3 ? GOOD : k === 2 ? INFO : BAD);
      if (k === 0) { R.axes(520, 170, 340, 150, { x: [0, 12], y: [0, 100], yt: [0, 52, 100], grid: true });
        el('line', { x1: 520, y1: 170 + 150 * 0.48, x2: 860, y2: 170 + 150 * 0.48, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': `${340 * E(u, 0.4, 1.2)} 999` });
        note(540, 215, '기준선 val 52% — 어디까지 올릴까?', fade(u, 1.4), { 'font-size': 14.5 }); }
      if (k === 1) { card(690, 220, 260, 56, { rx: 10, stroke: ACC, fill: ACCBG, text: 'ImageNet 120만 장으로 배운 가중치', fs: 14.5, s: pop(u, 0.2) });
        [0, 1, 2, 3, 4, 5].forEach((i) => R.dot([[560, 220], [SX + SW / 2 + 4, SY(i)]], seg(u, 0.4 + i * 0.12, 1.0 + i * 0.12), ACC, 6));
        mono(520, 300, 'weights=IMAGENET1K_V2', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); }
      if (k === 2) { mono(520, 200, 'p.requires_grad = False', { 'font-size': 17, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) }); sub(520, 236, '백본은 순전파 전용 특징 추출기', fade(u, 2.0), { 'text-anchor': 'start', 'font-size': 15 }); }
      if (k === 3) { mono(520, 200, 'model.fc = nn.Linear(2048, 2)', { 'font-size': 17, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
        sub(520, 236, '동결 다음에 교체 — 새 층만 requires_grad=True', fade(u, 1.6), { 'text-anchor': 'start', 'font-size': 14.5 }); }
      if (k === 4) { tx(520, 90, '학습할 파라미터', { 'font-size': 15, 'font-weight': 700, fill: MUT });
        [['밑바닥 v0', 25557032, BAD, '25,557,032'], ['특징 추출 v1', 4098, GOOD, '4,098']].forEach(([nm, v, col, s], i) => { tx(520, 130 + i * 60, nm, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.6) });
          R.hbar(520, 140 + i * 60, 250, v, 25557032, { u: E(u, 0.4 + i * 0.6, 1.0 + i * 0.6), col, text: s }); });
        pill(640, 290, '0.016% · 약 6,000분의 1', GOOD, pop(u, 1.8), { fs: 15 }); }
      if (k === 5) { pill(690, 230, 'Adam(trainable, lr=1e-3)', ACC, pop(u, 0.3), { mono: true, fs: 14.5 }); grow(600, 230, SX + SW / 2 + 6, SY(5), E(u, 0.8, 1.3), ACC);
        sub(520, 290, '동결 파라미터는 옵티마이저 상태(모멘텀)에서도 빠진다', fade(u, 1.6), { 'text-anchor': 'start', 'font-size': 14 }); }
      return; }
    // k6, k7: 역전파는 fc 에서 멈추고 곡선이 오른다
    chart(c, { at: 0.9 });
    if (k === 6) { const g = E(u, 0.2, 0.9); R.dot([[SX, 30], [SX, SY(5)]], g, BAD, 7);
      tx(SX + 30, 40, 'loss.backward()', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: BAD, opacity: fade(u, 0.2) });
      if (u > 0.9) { el('line', { x1: SX - 60, y1: SY(5) + 24, x2: SX + 60, y2: SY(5) + 24, stroke: BAD, 'stroke-width': 4, opacity: fade(u, 0.9) }); cross(SX + 80, SY(5) + 24, 7, pop(u, 1.0)); } }
    if (k === 7) { const ax = { X: (v) => 500 + v * 30, Y: (v) => 300 - v * 2.2 }; pill(ax.X(7), ax.Y(17), 'train 0.91 / val 0.86 — 틈 5%p', GOOD, pop(u, 0.4), { fs: 14.5 }); }
  }

  // ---------- 3. 파인튜닝 ----------
  function grid22(c, n, x, y) { const rows = [['적음 × 유사', '동결 — fc만', GOOD], ['적음 × 다름', '위 1~2블록 해동', WARN], ['많음 × 유사', '위쪽 절반 해동', GOOD], ['많음 × 다름', '전층 해동 (낮은 lr)', WARN]];
    tx(x, y - 12, '데이터 양 × 도메인 유사도', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.slice(0, n).forEach(([a, b, col], i) => { const cx = x + (i % 2) * 190 + 90, cy = y + Math.floor(i / 2) * 64 + 28, prevN = c.k === 7 ? 2 : 0, s = i < prevN ? 1 : pop(c.u, 0.4 + (i - prevN) * 0.3);
      card(cx, cy, 180, 56, { rx: 8, stroke: col, s }); tx(cx, cy - 4, a, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 }); tx(cx, cy + 17, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, opacity: s > 0.5 ? 1 : 0 }); }); }
  function s3(t, c) { const { k, u } = c; stack(c, { down: k === 2 || k === 3 });
    if (k === 0) { const ax = chart(c); el('rect', { x: ax.X(8), y: ax.Y(90), width: ax.X(12) - ax.X(8), height: ax.Y(82) - ax.Y(90), rx: 4, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.6) });
      note(ax.X(3), ax.Y(22), '86% 에서 평평 — 동결 백본은 금속 표면을 모른다', fade(u, 1.2), { 'font-size': 14 }); return; }
    if (k <= 4) { const msg = [null, ['사전학습 로드 + fc 교체 — 전층 학습 가능', WARN], ['일단 전부 동결 — 해동 기준선', INFO], ['layer4·layer3·fc 만 requires_grad=True', WARN], ['녹였으면 보폭을 줄여라', WARN]][k];
      note(520, 70, msg[0], fade(u, 0.2), { fill: msg[1], 'font-size': 15 });
      if (k === 3) { sub(520, 110, 'conv1~layer2 (엣지·질감) 는 보존', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 14.5 });
        [['layer3', 7098368], ['layer4', 14964736], ['fc', 4098]].forEach(([nm, v], i) => { tx(520, 160 + i * 44, nm, { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.0 + i * 0.3) });
          R.hbar(590, 146 + i * 44, 200, v, 14964736, { u: E(u, 1.0 + i * 0.3, 1.5 + i * 0.3), col: i === 2 ? GOOD : WARN, text: fmt(v), h: 18 }); });
        sub(520, 300, '해동된 파라미터 수 (torch 로 센 값)', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 13.5 }); }
      if (k === 4) { const ax = R.axes(540, 110, 300, 200, { x: [0, 3], y: [-5.5, -2.5], yt: [-5, -4, -3], yl: 'log₁₀ lr' });
        [['layer3', -5], ['layer4', -4], ['fc', -3]].forEach(([nm, v], i) => { const f = E(u, 0.4 + i * 0.4, 0.9 + i * 0.4), h = (ax.Y(-5.5) - ax.Y(v)) * f;
          el('rect', { x: ax.X(i + 0.5) - 32, y: ax.Y(-5.5) - h, width: 64, height: h, rx: 4, fill: i === 2 ? GOOD : WARN });
          mono(ax.X(i + 0.5), ax.Y(-5.5) - h - 8, `1e${v}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: f });
          tx(ax.X(i + 0.5), ax.Y(-5.5) + 22, nm, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); });
        sub(690, 365, '아래로 갈수록 10배씩 작게', fade(u, 1.9), { 'font-size': 15 }); }
      return; }
    if (k === 5 || k === 6) { const ax = chart(c, { at: 0.4 });
      if (k === 5) { el('line', { x1: ax.X(8), y1: ax.Y(0), x2: ax.X(8), y2: ax.Y(100), stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 0.2) }); sub(ax.X(8), ax.Y(100) - 8, '해동 시작 (에폭 8)', fade(u, 0.3), { fill: ACC }); }
      if (k === 6) { pill(ax.X(6), ax.Y(24), 'val 0.86 → 0.92', ACC, pop(u, 0.4), { mono: true, fs: 15 }); sub(ax.X(6), ax.Y(9), '위층이 금속 표면에 적응', fade(u, 0.9), { 'font-size': 14.5 }); }
      return; }
    if (k === 7) { grid22(c, 4, 500, 90);
      card(690, 330, 380, 56, { rx: 10, stroke: BAD, fill: BADBG, text: '전층 lr=1e-3 로 해동 → 지식 파괴, 70%대로 추락', fs: 14.5, color: BAD, s: pop(u, 1.6) });
      sub(690, 384, '(코드 주석의 경고 — 예시 수치)', fade(u, 2.0), { 'font-size': 13.5 }); }
  }

  // ---------- 4. 실전 레시피 ----------
  function phases(c) { const P = [['0. 데이터', ['증강', 'ImageNet 정규화'], 1, 125], ['1. 워밍업', ['동결', 'fc만 lr 1e-3'], 4, 125], ['2. 파인튜닝', ['판별적 lr · 코사인', '조기 종료'], 6, 170]];
    P.forEach(([h, lines, kk, w], i) => { const x = 500 + i * 135, f = on(c, kk, 1.6, 0.4);
      el('rect', { x, y: 330, width: w, height: 70, rx: 8, fill: f > 0.5 ? ACCBG : PANEL, stroke: f > 0.5 ? ACC : OFF, 'stroke-width': 2, 'stroke-dasharray': f > 0.5 ? null : '6 5' });
      tx(x + 10, 352, h, { 'font-size': 14.5, 'font-weight': 800, fill: f > 0.5 ? ACC : MUT });
      if (f > 0.5) lines.forEach((s, j) => tx(x + 10, 372 + j * 19, s, { 'font-size': 13.5, opacity: f })); }); }
  const cosLr = (e) => (1 + Math.cos(Math.PI * e / 20)) / 2;
  function s4(t, c) { const { k, u } = c; stack(c, { down: k === 4 }); phases(c);
    if (k === 0) { note(500, 90, '모델이 아니라 "순서와 디테일" 이 주인공', fade(u, 0.3)); mono(500, 130, 'from torchvision import models, transforms', { 'font-size': 14.5, opacity: fade(u, 0.9) });
      sub(500, 170, '아래 세 칸이 차례로 채워진다', fade(u, 1.6), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    if (k === 1) { const pic = (cx, cy, s, flip, z, br, op) => { const g = R.G(cx, cy, 1, op); el('rect', { x: -s / 2, y: -s / 2, width: s, height: s, rx: 6, fill: br ? WARNBG : SOFT, stroke: INK, 'stroke-width': 2 }, g);
        el('line', { x1: -s * 0.3 * z * (flip ? -1 : 1), y1: -s * 0.25 * z, x2: s * 0.25 * z * (flip ? -1 : 1), y2: s * 0.2 * z, stroke: BAD, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
        el('circle', { cx: s * 0.22 * (flip ? -1 : 1), cy: -s * 0.22, r: s * 0.08, fill: MUT }, g); };
      pic(560, 160, 100, false, 1, false, fade(u, 0.2)); sub(560, 230, '원본 (스크래치)', fade(u, 0.3), { 'font-size': 14 });
      [['RandomResizedCrop', false, 1.35, false], ['HorizontalFlip', true, 1, false], ['ColorJitter', false, 1, true]].forEach(([nm, fl, z, br], i) => { const y = 110 + i * 72, f = pop(u, 0.6 + i * 0.4);
        grow(615, 160, 655, y, E(u, 0.5 + i * 0.4, 0.8 + i * 0.4), OFF, { plain: true }); pic(700, y, 60, fl, z, br, f > 0.05 ? 1 : 0);
        mono(745, y + 5, nm, { 'font-size': 14, fill: ACC, opacity: fade(u, 0.8 + i * 0.4) }); });
      return; }
    if (k === 2) { tx(500, 80, 'Normalize — ImageNet 통계 그대로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['R', 0.485, 0.229, BAD], ['G', 0.456, 0.224, GOOD], ['B', 0.406, 0.225, INFO]].forEach(([nm, m, s, col], i) => { const y = 120 + i * 56, f = E(u, 0.4 + i * 0.35, 0.9 + i * 0.35);
        tx(500, y + 15, nm, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: f });
        el('rect', { x: 530, y, width: 300, height: 22, rx: 4, fill: SOFT, opacity: f }); el('rect', { x: 530 + 300 * (m - s), y, width: 300 * 2 * s, height: 22, rx: 4, fill: col, opacity: 0.3 * f });
        el('line', { x1: 530 + 300 * m, y1: y - 4, x2: 530 + 300 * m, y2: y + 26, stroke: col, 'stroke-width': 3, opacity: f });
        mono(840, y + 16, `${m} ± ${s}`, { 'font-size': 14, 'font-weight': 700, opacity: f }); });
      note(500, 300, '내 데이터로 다시 계산하면 이어받은 지식이 어긋난다', fade(u, 1.9), { fill: WARN, 'font-size': 14.5 }); return; }
    if (k === 3) { mono(500, 90, 'resnet50(IMAGENET1K_V2) + fc(2048→2)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      R.dot([[SX, SY(5)], [SX, SY(0)]], seg(u, 1.2, 2.4), BAD, 7);
      note(500, 150, 'fc 가 무작위인 채로 해동하면', fade(u, 1.0), { fill: WARN }); note(500, 180, '큰 초기 그래디언트가 백본까지 흐른다', fade(u, 1.5), { fill: BAD }); return; }
    // 5~8: 에폭 자 + 코사인 lr
    const ax = R.axes(500, 90, 360, 160, { x: [0, 25], y: [0, 1.1], xt: [0, 5, 10, 15, 20, 25], xl: '에폭', yl: 'lr (최댓값 대비)' });
    el('rect', { x: ax.X(0), y: ax.Y(1.1), width: (ax.X(5) - ax.X(0)) * (k === 4 ? E(u, 0.5, 1.5) : 1), height: ax.Y(0) - ax.Y(1.1), fill: INFOBG });
    tx(ax.X(2.5), ax.Y(1.0), '워밍업', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: k === 4 ? fade(u, 1.2) : 1 });
    if (k === 4) { sub(ax.X(12), ax.Y(0.5), '백본 동결 · fc 만 lr 1e-3 로 5에폭', fade(u, 1.7), { 'font-size': 14.5 }); return; }
    if (k === 5) { el('line', { x1: ax.X(5), y1: ax.Y(0), x2: ax.X(5), y2: ax.Y(1.1), stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.3) }); flame(ax.X(5) + 16, ax.Y(0.95), 1.2, fade(u, 0.5));
      sub(ax.X(14), ax.Y(0.5), '5에폭 후 layer4·layer3 해동', fade(u, 1.2), { 'font-size': 14.5, fill: WARN }); return; }
    const pts = []; for (let e = 0; e <= 20; e++) pts.push([5 + e, cosLr(e)]);
    R.line(ax, pts, k === 6 ? E(u, 0.4, 1.8) : 1, ACC, { sw: 3 });
    if (k === 6) sub(ax.X(15), ax.Y(1.0) + 4, 'CosineAnnealingLR(T_max=20)', fade(u, 1.4), { 'font-size': 14, fill: ACC });
    if (k === 7) { const e = 20 * E(u, 0.3, 2.4); el('circle', { cx: ax.X(5 + e), cy: ax.Y(cosLr(e)), r: 8, fill: ACC }); mono(ax.X(5 + e), ax.Y(cosLr(e)) - 14, `ep ${Math.round(e)}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC }); sub(ax.X(12), ax.Y(0.15), '매 에폭 sched.step()', fade(u, 0.6), { 'font-size': 14 }); }
    if (k === 8) { [1, 2, 3].forEach((p, i) => card(540 + i * 50, 300, 40, 32, { rx: 6, stroke: i === 2 ? BAD : WARN, text: String(p), fs: 15, mono: true, s: pop(u, 0.3 + i * 0.35) }));
      tx(680, 306, 'patience 3 → break', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 1.4) });
      [['52', BAD], ['86', INFO], ['92', ACC]].forEach(([v, col], i) => mono(680 + i * 62, 112, `${v}%`, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 1.8 + i * 0.2) }));
      tx(680, 138, '같은 500장 · 최종', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.4) }); }
  }

  // ---------- 5. 생태계 · LoRA ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { // 허브 창고 → ConvNeXt 하나
      for (let i = 0; i < 40; i++) { const x = 60 + (i % 10) * 40, y = 90 + Math.floor(i / 10) * 40, pick = i === 13, f = k === 0 ? clamp((u - 0.3) * 3 - i / 40 * 2) : 1;
        el('rect', { x, y, width: 32, height: 32, rx: 5, fill: pick && k >= 1 ? ACC : SOFT, stroke: pick && k >= 1 ? ACC : GRID, 'stroke-width': 1.5, opacity: f }); }
      tx(60, 72, 'Hugging Face 허브 · timm — 사전학습 백본 창고', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: k === 0 ? fade(u, 0.2) : 1 });
      if (k === 0) { mono(60, 290, 'import timm', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
      mono(60, 280, 'timm.create_model("convnext_tiny.fb_in22k",', { 'font-size': 14.5, opacity: k === 1 ? fade(u, 0.3) : 1 });
      mono(60, 304, '    pretrained=True, num_classes=2)', { 'font-size': 14.5, opacity: k === 1 ? fade(u, 0.6) : 1 });
      const L = [['stem', 'frozen'], ['stages 0', 'frozen'], ['stages 1', 'frozen'], ['stages 2', 'frozen'], ['stages 3', 'frozen'], ['head (→2)', 'new']];
      L.forEach(([nm, st], i) => { const y = 360 - i * 52, frozen = k === 2 ? E(u, 0.4 + (5 - i) * 0.15, 0.7 + (5 - i) * 0.15) : 0, isHead = i === 5, s = k === 1 ? pop(u, 0.8 + i * 0.12) : 1;
        const [sc, fl] = isHead ? ST.new : frozen > 0.5 ? ST.frozen : [ACC, PANEL];
        card(680, y, 200, 40, { rx: 8, stroke: sc, fill: fl, s, text: nm, fs: 14.5, mono: true });
        if (isHead) icon('new', 815, y, i, s); else if (frozen > 0) lock(800, y, true, INFO, frozen); });
      if (k === 2) mono(500, 400, 'requires_grad = name.startswith("head")', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
      return; }
    if (k === 3) { tx(60, 72, 'meta-llama/Llama-3.1-8B — 디코더 블록 32개', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      for (let i = 0; i < 32; i++) { const f = E(u, 0.3 + i * 0.04, 0.5 + i * 0.04); el('rect', { x: 60, y: 380 - i * 9, width: 200, height: 6.5, rx: 2, fill: INFO, opacity: f * 0.8 }); }
      [['ResNet50', '첫 베이스라인'], ['EfficientNet', '엣지·모바일'], ['ViT · Swin', '데이터 풍부'], ['ConvNeXt', 'CNN 편의 + 최신']].forEach(([a, b], i) => { const y = 110 + i * 62, s = pop(u, 1.0 + i * 0.25);
        card(560, y, 300, 50, { rx: 8, stroke: GRID, s }); tx(430, y + 5, a, { 'font-size': 15, 'font-weight': 800, opacity: s > 0.5 ? 1 : 0 }); tx(570, y + 5, b, { 'font-size': 14, fill: MUT, opacity: s > 0.5 ? 1 : 0 }); });
      tx(410, 72, '비전 백본 지도', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
      sub(160, 412, '파라미터 80억 — 전부 학습하면 GPU 수십 장', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 4 || k === 5) { // W (동결) + B·A (학습)
      const W0 = 90, Y0 = 110, S = 170, a = k === 4 ? E(u, 0.8, 1.4) : 1;
      el('rect', { x: W0, y: Y0, width: S, height: S, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5 }); lock(W0 + S / 2, Y0 + S / 2, true, INFO, 1.6);
      mono(W0 + S / 2, Y0 - 12, 'W  4096×4096', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO });
      tx(W0 + S + 26, Y0 + S / 2 + 8, '+', { 'font-size': 26, 'font-weight': 800, opacity: a });
      el('rect', { x: W0 + S + 60, y: Y0, width: 14, height: S * a, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); mono(W0 + S + 67, Y0 + S + 22, 'B', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: a });
      el('rect', { x: W0 + S + 84, y: Y0, width: S * a, height: 14, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); mono(W0 + S + 84 + S / 2, Y0 - 12, 'A', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: a });
      mono(W0 + S + 84, Y0 + 50, 'r = 8', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, k === 4 ? 1.5 : 0) });
      mono(90, 330, 'y = W·x + B·A·x', { 'font-size': 18, 'font-weight': 800, opacity: k === 4 ? fade(u, 1.8) : 1 });
      if (k === 4) { sub(90, 370, 'target_modules = q_proj · v_proj — 백본은 손대지 않는다', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 14.5 }); return; }
      // k5: 학습 파라미터 계산
      const rows = [['q_proj  4096→4096', '8×(4096+4096)', '65,536'], ['v_proj  4096→1024', '8×(4096+1024)', '40,960'], ['층당 합 × 32층', '', '3,407,872']];
      rows.forEach(([a1, b1, c1], i) => { const y = 120 + i * 36, f = fade(u, 0.3 + i * 0.4); mono(560, y, a1, { 'font-size': 14, opacity: f }); mono(900, y, c1, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', fill: i === 2 ? GOOD : INK, opacity: f }); });
      [['ResNet50 fc', 4098 / 25557032, '4,098 / 25,557,032 = 0.016%', INFO], ['Llama LoRA', 3407872 / 8033669120, '3,407,872 / 8,033,669,120 = 0.042%', GOOD]].forEach(([nm, r, s, col], i) => { const y = 260 + i * 62, f = E(u, 1.5 + i * 0.4, 1.9 + i * 0.4);
        tx(560, y, nm, { 'font-size': 14.5, 'font-weight': 700, opacity: f }); el('rect', { x: 560, y: y + 8, width: 340, height: 16, rx: 3, fill: SOFT, opacity: f }); el('rect', { x: 560, y: y + 8, width: Math.max(3, 340 * r * 20), height: 16, rx: 3, fill: col, opacity: f });
        mono(560, y + 44, s, { 'font-size': 13.5, fill: col, opacity: f }); });
      sub(730, 400, '(막대는 20배 확대)', fade(u, 2.3), { 'font-size': 13.5 }); return; }
    if (k === 6) { [['이어받는다', '남이 배운 백본', ACC], ['줄인다', '동결 · 작은 새 층', GOOD], ['지킨다', '낮은 학습률', WARN]].forEach(([h, d, col], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.6);
        el('circle', { cx: x, cy: 180, r: 62 * s, fill: PANEL, stroke: col, 'stroke-width': 4 });
        tx(x, 175, `${i + 1}`, { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s > 0.5 ? 1 : 0 });
        tx(x, 205, h, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 });
        sub(x, 280, d, fade(u, 0.6 + i * 0.6), { 'font-size': 15 }); });
      note(480, 360, '밑바닥 학습은 거의 고르지 않는 선택지가 됐다', fade(u, 2.2), { 'text-anchor': 'middle' }); }
  }

  RA.page({ title: '층 스택 — 얼리고·녹이고·바꾸기', scenes: [s1, s2, s3, s4, s5] });
})();
