/* V-1-1 SavedModel·서명 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 파일 크기·변수 shape·서명 이름·연산 이름은 venv(TF 2.21, Keras 3.15)에서 이 페이지 코드를 다시 돌려 얻은 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, terminal, server, person, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공용 그림 ----------
  // 문서 아이콘 (모서리 접힘)
  function doc(cx, cy, w, h, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), f = Math.min(w, h) * 0.3, c = o.stroke || INK;
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - f} L${w / 2},${-h / 2 + f} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: c, 'stroke-width': o.sw || 2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: `M${w / 2 - f},${-h / 2} V${-h / 2 + f} H${w / 2}`, fill: 'none', stroke: c, 'stroke-width': o.sw || 2 }, g); return g; }
  // 폴더 아이콘
  function folder(cx, cy, w, h, o) { o = o || {}; const g = R.G(cx, cy, o.s, o.op), c = o.stroke || INK, t = h * 0.22;
    el('path', { d: `M${-w / 2},${-h / 2 + t} V${h / 2} H${w / 2} V${-h / 2 + t} H${-w / 2 + w * 0.42} L${-w / 2 + w * 0.34},${-h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: c, 'stroke-width': o.sw || 2, 'stroke-linejoin': 'round' }, g); return g; }
  const chipC = { arch: ['구조', INFO, INFOBG], w: ['가중치', ACC, ACCBG], opt: ['옵티마이저', WARN, WARNBG], graph: ['그래프', GOOD, GOODBG], sig: ['서명', GOOD, GOODBG] };
  function chip(cx, cy, key, o) { o = o || {}; const [t, col, bg] = chipC[key], w = o.w || 96;
    if (o.empty) return card(cx, cy, w, 26, { rx: 6, fill: PANEL, stroke: GRID, dash: '5 4', sw: 1.6, text: t, fs: 13.5, fw: 600, color: OFF, op: o.op });
    return card(cx, cy, w, 26, { rx: 6, fill: bg, stroke: col, sw: 2, text: o.text || t, fs: 13.5, fw: 700, color: col, s: o.s, op: o.op }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const veil = (op) => el('rect', { x: 0, y: 0, width: 960, height: 420, fill: PANEL, opacity: op });

  // ---------- 1. 저장 형식 지도 ----------
  const SX = 760, SW = 330, SH = 84;
  const SL = [
    { y: 92, name: 'iris.keras', size: '18,895 B', call: 'model.save("iris.keras")', holds: ['arch', 'w', 'opt'], dir: false },
    { y: 222, name: 'iris_savedmodel/', size: '디렉토리', call: 'model.export("iris_savedmodel/")', holds: ['graph', 'w', 'sig'], dir: true },
    { y: 352, name: 'iris.weights.h5', size: '17,216 B', call: 'model.save_weights(...)', holds: ['w'], miss: ['arch', 'opt'], dir: false },
  ];
  const chipX = (i) => SX - SW / 2 + 16 + i * 104 + 48;
  function slot(i, prog, o) { o = o || {}; const sl = SL[i], on = prog > 0, x0 = SX - SW / 2;
    mono(x0, sl.y - SH / 2 - 9, sl.call, { 'font-size': 13.5, fill: on ? INK : MUT, opacity: o.callOp ?? 1 });
    card(SX, sl.y, SW, SH, { rx: 10, stroke: on ? INK : GRID, dash: on ? null : '6 5', sw: on ? 2.2 : 1.6 });
    if (sl.dir) folder(x0 + 22, sl.y - 16, 22, 17, { stroke: on ? INK : OFF }); else doc(x0 + 22, sl.y - 16, 16, 21, { stroke: on ? INK : OFF });
    mono(x0 + 40, sl.y - 11, sl.name, { 'font-size': 15, 'font-weight': 700, fill: on ? INK : OFF });
    if (on) mono(SX + SW / 2 - 14, sl.y - 11, sl.size, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(prog, 0.95, 0.05) });
    const keys = sl.holds.concat(sl.miss || []);
    keys.forEach((kk, j) => { const miss = (sl.miss || []).includes(kk), f = prog <= 0 ? 0 : o.fill ? o.fill(j) : (prog >= 1 ? 1 : 0);
      if (miss) { if (prog >= 1) { chip(chipX(j), sl.y + 20, kk, { empty: true }); cross(chipX(j), sl.y + 20, 8, 1); } else chip(chipX(j), sl.y + 20, kk, { empty: true }); return; }
      if (f >= 1) chip(chipX(j), sl.y + 20, kk, { s: o.bump ? pop(o.bump(j), 0) : 1 }); else chip(chipX(j), sl.y + 20, kk, { empty: true }); }); }
  // 왼쪽: 메모리 위 모델 (Input 4 → Dense 16 → Dense 3)
  const NX = [96, 212, 328], NY = 168;
  const nodeY = (L, i) => { const n = [4, 16, 3][L], gap = L === 1 ? 13.5 : 38; return NY + (i - (n - 1) / 2) * gap; };
  function net(gu, op) { op = op ?? 1;
    for (let L = 0; L < 2; L++) { const a = [4, 16, 3][L], b = [4, 16, 3][L + 1];
      for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) { if ((i * b + j) % 3) continue;
        el('line', { x1: NX[L], y1: nodeY(L, i), x2: lerp(NX[L], NX[L + 1], clamp(gu * 2 - L)), y2: lerp(nodeY(L, i), nodeY(L + 1, j), clamp(gu * 2 - L)), stroke: GRID, 'stroke-width': 1, opacity: op }); } }
    [4, 16, 3].forEach((n, L) => { for (let i = 0; i < n; i++) el('circle', { cx: NX[L], cy: nodeY(L, i), r: L === 1 ? 5 : 8, fill: L === 2 ? ACC : PANEL, stroke: INK, 'stroke-width': 1.6, opacity: op * clamp(gu * 3 - L * 0.7) }); });
    [['Input 4', ''], ['Dense 16', '80'], ['Dense 3', '51']].forEach(([a, p], L) => { tx(NX[L], 296, a, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: op * clamp(gu * 3 - L * 0.7) });
      if (p) mono(NX[L], 316, p + '개', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op * clamp(gu * 3 - L * 0.7) }); }); }
  const LCH = [['arch', 90, '구조'], ['w', 212, '가중치 131'], ['opt', 334, 'Adam 상태']];
  function chunks(op, s) { LCH.forEach(([kk, x, t], i) => chip(x, 360, kk, { text: t, w: 112, op, s: s ? s(i) : 1 })); }
  function s1(t, c) { const { k, u } = c;
    zone(20, 20, 388, 380, 'model 객체 (메모리 위)', { fill: SOFT });
    if (k === 0) {
      card(214, 210, 170, 64, { rx: 10, text: 'model', fs: 18, fw: 800, mono: true, s: pop(u, 0.2) });
      ['save', 'export', 'save_weights'].forEach((m, i) => { const y = SL[i].y, gu = E(u, 0.6 + i * 0.4, 1.2 + i * 0.4);
        grow(300, 210, SX - SW / 2 - 8, y, gu, MUT, { dash: '5 5' });
        if (gu > 0.5) pill(lerp(300, SX - SW / 2, 0.5) - 20, lerp(210, y, 0.5) + (i === 1 ? -16 : 0), '.' + m + '()', ACC, pop(u, 1 + i * 0.4), { mono: true, fs: 13.5, fill: PANEL }); });
      SL.forEach((_, i) => slot(i, 0, { callOp: fade(u, 0.8 + i * 0.4) }));
      note(214, 296, '저장 API 는 모두 모델 객체의 메서드', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT, 'font-size': 14 }); return; }
    const dim = k === 5 ? 0.12 : 1;
    net(k === 1 ? E(u, 0.2, 1.4) : 1, dim);
    if (k === 1) { chunks(1, (i) => pop(u, 1.5 + i * 0.3)); mono(214, 342 - 4, '', {}); }
    else chunks(dim);
    // 오른쪽 저장 칸
    const prog = [k >= 2 ? (k === 2 ? seg(u, 0.3, 2.0) : 1) : 0, k >= 3 ? (k === 3 ? seg(u, 0.3, 2.0) : 1) : 0, k >= 4 ? (k === 4 ? seg(u, 0.3, 1.6) : 1) : 0];
    SL.forEach((_, i) => slot(i, prog[i], { fill: (j) => (k === i + 2 ? clamp(seg(u, 0.4 + j * 0.45, 1.0 + j * 0.45) * 1.01) : 1) }));
    if (k === 2) LCH.forEach(([kk, x, t], j) => fly(x, 360, chipX(j), SL[0].y + 20, seg(u, 0.4 + j * 0.45, 1.0 + j * 0.45), t, { fill: chipC[kk][1] }));
    if (k === 3) { [[0, 0, '구조'], [1, 1, '가중치']].forEach(([from, to, t], j) => fly(LCH[from][1], 360, chipX(to), SL[1].y + 20, seg(u, 0.4 + j * 0.45, 1.0 + j * 0.45), t, { fill: chipC[LCH[from][0]][1] }));
      const b = seg(u, 1.4, 2.2); if (b > 0 && b < 1) fly(334, 360, lerp(334, 560, b < 0.5 ? b * 2 : 1), lerp(360, 300, b < 0.5 ? b * 2 : 2 - b * 2), 0.999, 'Adam 상태', { fill: WARN, stay: true });
      if (u > 1.4) { cross(560, 300, 11, pop(u, 1.9)); note(560, 330, '옵티마이저는 안 담긴다', fade(u, 2.0), { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN }); } }
    if (k === 4) fly(212, 360, chipX(0), SL[2].y + 20, seg(u, 0.4, 1.0), '가중치', { fill: ACC });
    if (k === 5) {
      server(126, 104, '서빙 엔진', { s: pop(u, 0.2) * 0.8 });
      grow(190, 104, SX - SW / 2 - 6, SL[0].y, E(u, 0.4, 1.1), BAD, { dash: '6 5', plain: true });
      if (u > 1.1) { cross(lerp(190, SX - SW / 2, 0.5), lerp(104, SL[0].y, 0.5), 11, pop(u, 1.1)); note(lerp(190, SX - SW / 2, 0.5), 140, '파이썬 재구성 필요', fade(u, 1.2), { 'text-anchor': 'middle', fill: BAD, 'font-size': 14 }); }
      pill(130, 236, '학습 재개 .fit()', INK, pop(u, 1.3), { mono: true, fs: 14, fill: PANEL });
      grow(214, 236, SX - SW / 2 - 6, SL[1].y, E(u, 1.5, 2.1), BAD, { dash: '6 5', plain: true });
      if (u > 2.1) { cross(lerp(214, SX - SW / 2, 0.5), lerp(236, SL[1].y, 0.5), 11, pop(u, 2.1)); note(lerp(214, SX - SW / 2, 0.5), 262, '옵티마이저 상태 없음', fade(u, 2.2), { 'text-anchor': 'middle', fill: BAD, 'font-size': 14 }); } } }

  // ---------- 2. SavedModel 해부 ----------
  const TREE = [
    { n: 'iris_savedmodel/', d: 0, dir: true, size: '' },
    { n: 'saved_model.pb', d: 1, size: '32,970 B', key: true },
    { n: 'variables/', d: 1, dir: true, size: '' },
    { n: 'variables.data-00000-of-00001', d: 2, size: '2,102 B' },
    { n: 'variables.index', d: 2, size: '582 B' },
    { n: 'assets/', d: 1, dir: true, size: '비어 있음' },
    { n: 'fingerprint.pb', d: 1, size: '97 B' },
  ];
  const TY = (i) => 74 + i * 44;
  function tree(show, o) { o = o || {}; zone(20, 30, 456, 350, 'iris_savedmodel/ (export 결과)', { fill: SOFT, op: o.op });
    TREE.forEach((r, i) => { const s = show(i); if (s <= 0) return; const y = TY(i), x = 44 + r.d * 26, hi = o.hi && o.hi(i), op = (o.op ?? 1) * s;
      if (hi) el('rect', { x: 30, y: y - 18, width: 436, height: 36, rx: 6, fill: hi === 'w' ? ACCBG : hi === 'g' ? GOODBG : INFOBG, opacity: op });
      if (r.dir) folder(x + 9, y, 18, 14, { op }); else doc(x + 8, y, 13, 17, { op, stroke: r.key ? GOOD : INK });
      mono(x + 26, y + 5, r.n, { 'font-size': 14, 'font-weight': r.key || r.d === 0 ? 700 : 500, opacity: op, fill: r.key ? GOOD : INK });
      if (r.size) mono(462, y + 5, r.size, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { tree((i) => (i === 0 ? pop(u, 0.2) : 0));
      mono(248, 150, 'root = pathlib.Path("iris_savedmodel")', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
      note(248, 190, '압축 파일이 아니라 평범한 디렉토리다', fade(u, 1.0), { 'text-anchor': 'middle' });
      zone(500, 60, 436, 300, null, { fill: PANEL, stroke: GRID, sw: 1.5, op: fade(u, 1.2) });
      doc(610, 170, 54, 70, { s: pop(u, 1.4) }); mono(610, 240, 'model.pt', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); sub(610, 266, 'PyTorch: 파일 하나', fade(u, 1.5));
      folder(820, 168, 80, 62, { s: pop(u, 1.8) }); [0, 1, 2].forEach((j) => doc(800 + j * 20, 176, 14, 18, { s: pop(u, 2.0 + j * 0.1) }));
      mono(820, 240, 'SavedModel/', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); sub(820, 266, 'TF: 열어 볼 수 있는 폴더', fade(u, 1.9)); return; }
    if (k === 1) { const sc = E(u, 0.3, 2.2) * TREE.length;
      tree((i) => clamp(sc - i + 1));
      if (sc < TREE.length) el('rect', { x: 30, y: TY(Math.min(TREE.length - 1, Math.floor(sc))) - 18, width: 436, height: 36, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      const L = ['$ python saved_model.py', 'assets', 'fingerprint.pb', 'saved_model.pb', 'variables', 'variables/variables.data-00000-of-00001', 'variables/variables.index'];
      terminal(500, 60, 436, 220, L, 1 + E(u, 0.4, 2.3) * 6, { title: 'rglob("*") 출력', fs: 13.5 }); return; }
    if (k === 2) { tree(() => 1, { hi: (i) => (i === 1 ? 'g' : i === 3 || i === 4 ? 'w' : null) });
      tx(500, 70, '파일 크기 (실측)', { 'font-size': 15, 'font-weight': 700 });
      [['saved_model.pb', 32970, '그래프 + 서명', GOOD], ['variables.data…', 2102, '가중치 값', ACC], ['variables.index', 582, '이름 → 위치', ACC], ['fingerprint.pb', 97, '무결성 지문', MUT]].forEach(([n, v, role, col], i) => {
        const y = 100 + i * 66, s = E(u, 0.3 + i * 0.35, 1.1 + i * 0.35);
        mono(500, y + 14, n, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) });
        hbar(660, y, 180, v * s, 32970, { col, h: 18, text: v.toLocaleString('en-US') + ' B' });
        sub(500, y + 38, role, fade(u, 0.5 + i * 0.35), { 'text-anchor': 'start', fill: col }); });
      note(500, 388, '계산 방법(그래프)이 숫자보다 크다', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 3) { tree(() => 1, { hi: (i) => (i === 3 || i === 4 ? 'w' : null) });
      tx(500, 70, 'variables.index 가 가리키는 텐서', { 'font-size': 15, 'font-weight': 700 });
      const V = [['variables/0', '(4, 16)', 64], ['variables/1', '(16,)', 16], ['variables/2', '(16, 3)', 48], ['variables/3', '(3,)', 3]];
      let acc = 0; const X0 = 520, W = 400, Y = 330;
      V.forEach(([n, sh, cnt], i) => { const y = 100 + i * 44, s = fade(u, 0.3 + i * 0.3);
        mono(510, y + 5, n, { 'font-size': 14, 'font-weight': 700, opacity: s }); mono(640, y + 5, sh, { 'font-size': 14, fill: MUT, opacity: s });
        const x = X0 + (acc / 131) * W, w = (cnt / 131) * W, gu = E(u, 0.5 + i * 0.3, 1.0 + i * 0.3); acc += cnt;
        grow(712, y, x + w / 2, Y - 14, gu, MUT, { sw: 1.4 });
        el('rect', { x, y: Y - 12, width: Math.max(3, w - 2), height: 26, rx: 3, fill: ACC, opacity: 0.25 + 0.6 * clamp(gu * 2 - 1) });
        if (u > 1.2 + i * 0.3) mono(i === 3 ? x + 12 : x + w / 2, Y + 36, String(cnt), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': i === 3 ? 'start' : 'middle', fill: ACC }); });
      mono(X0, Y + 62, 'variables.data — float32 131개', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { tree(() => 1, { op: 0.3 });
      zone(496, 40, 440, 350, 'PyTorch 로 옮겨 보면', { fill: PANEL, stroke: GRID, sw: 1.5 });
      doc(570, 150, 70, 88, { s: pop(u, 0.2) }); for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) el('rect', { x: 546 + q * 16, y: 124 + r * 15, width: 12, height: 10, rx: 2, fill: ACC, opacity: fade(u, 0.4 + (r * 3 + q) * 0.04) * 0.7 });
      mono(570, 216, 'state_dict', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); sub(570, 236, '숫자만 담긴다', fade(u, 0.6));
      grow(620, 150, 700, 150, E(u, 0.8, 1.2), MUT); pill(770, 150, 'torch.load', INK, pop(u, 1.1), { mono: true, fs: 14 });
      card(715, 300, 300, 58, { rx: 10, dash: '6 5', stroke: BAD, text: 'class Net(nn.Module): ?', fs: 14.5, mono: true, color: BAD, s: pop(u, 1.6) });
      grow(770, 172, 770, 266, E(u, 1.5, 1.9), BAD, { dash: '4 4' }); cross(860, 222, 11, pop(u, 2.1));
      note(715, 372, '클래스 정의가 없으면 로드할 수 없다', fade(u, 2.2), { 'text-anchor': 'middle', fill: BAD, 'font-size': 14 }); return; }
    // k5: saved_model.pb 를 열면 연산 그래프
    tree(() => 1, { hi: (i) => (i === 1 ? 'g' : null), op: 0.55 });
    zone(496, 40, 440, 350, 'saved_model.pb 안 (serving_default)', { fill: PANEL, stroke: GOOD, sw: 2 });
    const NODES = [['x (None,4)', 560, 110], ['MatMul', 690, 110], ['BiasAdd', 820, 110], ['Relu', 820, 200], ['MatMul', 690, 200], ['BiasAdd', 560, 200], ['Softmax', 560, 290], ['probs (None,3)', 760, 290]];
    NODES.forEach(([n, x, y], i) => { const s = pop(u, 0.2 + i * 0.16), io = i === 0 || i === 7;
      card(x, y, io ? 124 : 104, 36, { rx: io ? 18 : 6, text: n, fs: 13.5, mono: true, fw: 700, stroke: io ? INK : GOOD, fill: io ? PANEL : GOODBG, color: io ? INK : GOOD, s });
      if (i > 0) { const [, px, py] = NODES[i - 1]; const gx = Math.sign(x - px), gy = Math.sign(y - py);
        grow(px + gx * (i === 1 || i === 7 ? 64 : 54), py + gy * 19, x - gx * (io ? 64 : 54), y - gy * 19, E(u, 0.1 + i * 0.16, 0.3 + i * 0.16), GOOD, { sw: 1.8 }); } });
    const route = NODES.map(([, x, y]) => [x, y]); dot(route, seg(u, 1.6, 2.7), ACC, 7);
    note(716, 350, '파이썬 코드 0줄로 이 그래프를 재생한다', fade(u, 1.8), { 'text-anchor': 'middle', fill: GOOD, 'font-size': 14.5 }); check(512, 345, 9, pop(u, 2.0)); }

  // ---------- 3. 서명 ----------
  function tgrid(x, y, cols, rows, cs, o) { o = o || {}; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const s = o.s ? o.s(r, q) : 1; if (s <= 0) continue; el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 4, height: cs - 4, rx: 4, fill: o.fill || INFOBG, stroke: o.col || INFO, 'stroke-width': 1.6, opacity: s }); }
    if (o.more) mono(x + cols * cs / 2 - 2, y + rows * cs + 14, '⋮', { 'text-anchor': 'middle', 'font-size': 18, fill: o.col || INFO }); }
  const CLI0 = ['$ saved_model_cli show --dir iris_savedmodel \\', '    --tag_set serve --signature_def serving_default'];
  const CLI1 = [["inputs['keras_tensor'] tensor_info:", null], '    dtype: DT_FLOAT', '    shape: (-1, 4)'];
  const CLI2 = [["outputs['output_0'] tensor_info:", null], '    dtype: DT_FLOAT', '    shape: (-1, 3)'];
  const VOC = ['"low"', '"mid"', '"high"'];
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) {
      const L = CLI0.concat(k >= 1 ? CLI1 : [], k >= 2 ? CLI2 : []), shown = k === 0 ? E(u, 0.2, 1.6) * 2 : (k === 1 ? 2 + E(u, 0.2, 1.4) * 3 : 5 + E(u, 0.2, 1.4) * 3);
      terminal(20, 40, 460, 240, L, shown, { title: '계약 꺼내 보기', fs: 13.5 });
      card(718, 206, 210, 44, { rx: 22, text: 'serving_default', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 1.4) : 1 });
      if (k === 0) { [0, 1, 2, 3].forEach((q) => card(658 + q * 40, 110, 34, 34, { rx: 4, text: '?', fs: 15, dash: '4 4', stroke: GRID, color: OFF, op: fade(u, 1.8) }));
        note(718, 300, '무엇을 넣고 무엇이 나오나', fade(u, 2.0), { 'text-anchor': 'middle', fill: MUT }); return; }
      const gi = k === 1 ? (r, q) => fade(u, 0.6 + (r * 4 + q) * 0.06) : () => 1;
      tgrid(638, 74, 4, 2, 40, { s: gi, more: true });
      mono(560, 104, '-1', { 'font-size': 18, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.3) : 1 }); sub(560, 124, '배치 (가변)', k === 1 ? fade(u, 1.3) : 1);
      mono(718, 60, '4 특성 (고정)', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.5) : 1 });
      mono(880, 104, 'float32', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.7) : 1 });
      grow(718, 186 - 2, 718, 186, 1, MUT);
      if (k === 1) return;
      grow(718, 230, 718, 262, E(u, 0.4, 0.8), MUT);
      tgrid(658, 270, 3, 2, 40, { s: (r, q) => fade(u, 0.7 + (r * 3 + q) * 0.08), col: GOOD, fill: GOODBG, more: true });
      mono(880, 316, 'output_0', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); sub(880, 336, '클래스 3개 확률', fade(u, 1.2));
      // 원본 문자열이 들어오면?
      const f = seg(u, 1.6, 2.3); if (f > 0) { const x = lerp(540, 556, f), y = lerp(340, 206, f); pill(x, y, '"high"', WARN, 1, { mono: true, fs: 14, fill: WARNBG }); if (f >= 1) cross(556, 236, 10, pop(u, 2.3)); }
      note(540, 390, '원본이 들어오면 계약 밖이다 (skew)', fade(u, 2.4), { fill: WARN, 'font-size': 14 }); return; }
    // k3 ~ : 전처리를 서명 안으로
    person(84, 200, '클라이언트', {});
    zone(196, 40, 740, 250, '@tf.function serving_raw — 그래프 안', { fill: SOFT, stroke: GOOD, dash: '7 5', sw: 2 });
    const cellsVOC = (hi, op) => VOC.forEach((v, i) => card(372 + i * 92, 118, 84, 36, { rx: 6, text: v, fs: 14, mono: true, fw: 700, stroke: hi === i ? GOOD : INK, fill: hi === i ? GOODBG : PANEL, color: hi === i ? GOOD : INK, op: op ?? 1, s: k === 3 ? pop(u, 0.4 + i * 0.25) : 1 }));
    mono(372 - 42, 88, 'VOCAB = tf.constant([...])', { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 1.2) : 1 });
    card(720, 232, 120, 46, { rx: 8, text: 'model', fs: 15, mono: true, fw: 800, op: k === 3 ? fade(u, 1.6) * 0.5 : 1 });
    if (k === 3) { note(560, 330, '전처리 재료를 텐서 상수로 두어 그래프와 함께 저장한다', fade(u, 1.9), { 'text-anchor': 'middle', 'font-size': 14.5 }); cellsVOC(null); return; }
    // 입구 교체
    card(196, 200, 150, 40, { rx: 8, text: 'raw_text', fs: 14, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: k === 4 ? pop(u, 0.3) : 1 });
    mono(196, 236, 'string (None,)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: k === 4 ? fade(u, 0.7) : 1 });
    grow(112, 200, 118, 200, k === 4 ? E(u, 0.9, 1.2) : 1, ACC);
    if (k === 4) { cellsVOC(null); note(560, 330, '입구가 float32 (None,4) 에서 문자열로 바뀌었다', fade(u, 1.6), { 'text-anchor': 'middle', 'font-size': 14.5 }); return; }
    // k5, k6: "high" 가 흘러 들어가 전처리 → 모델
    const v = k === 5 ? u : 3;
    const f1 = seg(v, 0.2, 0.8); if (f1 < 1) pill(lerp(84, 280, f1), lerp(150, 118, f1), '"high"', ACC, 1, { mono: true, fs: 14, fill: ACCBG }); else pill(280, 118, '"high"', ACC, 1, { mono: true, fs: 14, fill: ACCBG });
    const cmp = Math.min(2, Math.floor(seg(v, 0.8, 1.3) * 3)); cellsVOC(v > 0.8 ? cmp : null);
    const bools = [0, 0, 1]; bools.forEach((b, i) => { const s = fade(v, 1.0 + i * 0.12); card(372 + i * 92, 168, 40, 28, { rx: 4, text: String(b), fs: 14, mono: true, fw: 800, stroke: b ? GOOD : GRID, color: b ? GOOD : MUT, op: s }); });
    mono(660, 174, 'argmax → 2', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(v, 1.4) });
    const oh = [0, 0, 1, 0]; oh.forEach((b, i) => card(300 + i * 46, 236, 40, 36, { rx: 4, text: String(b), fs: 14, mono: true, fw: 800, stroke: b ? ACC : GRID, fill: b ? ACCBG : PANEL, color: b ? ACC : MUT, s: pop(v, 1.6 + i * 0.08) }));
    mono(300 - 20, 274, 'one_hot(depth=4)', { 'font-size': 13.5, fill: MUT, opacity: fade(v, 1.7) });
    grow(486, 236, 656, 236, E(v, 1.9, 2.2), MUT);
    grow(782, 236, 812, 236, E(v, 2.2, 2.4), MUT);
    [0.3, 0.45, 0.25].forEach((h, i) => el('rect', { x: 826 + i * 30, y: 256 - 50 * h * E(v, 2.3, 2.7), width: 22, height: 50 * h * E(v, 2.3, 2.7), rx: 3, fill: GOOD, opacity: 0.8 }));
    mono(870, 278, 'probs', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(v, 2.4) });
    if (k === 5) return;
    terminal(196, 300, 740, 112, ['$ saved_model_cli show --dir iris_serve ...', ["inputs['raw_text']   DT_STRING  shape: (-1)", null], ["outputs['probs']     DT_FLOAT   shape: (-1, 3)", null]], 1 + E(u, 0.3, 1.6) * 2, { title: 'tf.saved_model.save 로 저장한 결과', fs: 13.5 });
    check(84, 330, 12, pop(u, 1.9)); note(84, 370, 'skew 차단', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); }

  // ---------- 4. 로드와 추론 ----------
  function lane(y, icon, name, api, col, gu) {
    if (icon === 'doc') doc(70, y, 40, 52, {}); else folder(70, y, 56, 44, {});
    mono(70, y + 46, name, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 });
    grow(108, y, 196, y, gu, MUT); if (gu > 0.3) pill(316, y, api, col, pop(gu, 0.3, 0.7), { mono: true, fs: 13.5, fill: PANEL });
    grow(438, y, 520, y, clamp(gu * 2 - 1), MUT); }
  function s4(t, c) { const { k, u } = c;
    if (k >= 4) return versions(k, u);
    // 위 갈래: .keras → Keras 객체
    if (k === 1) { lane(115, 'doc', 'custom.keras', 'keras.models.load_model', INFO, 1);
      const fix = seg(u, 1.5, 2.1);
      card(726, 115, 400, 130, { rx: 10, stroke: fix >= 1 ? GOOD : BAD, sw: 2.2 });
      mono(546, 82, 'AddPositionalEncoding', { 'font-size': 14.5, 'font-weight': 800, fill: fix >= 1 ? GOOD : BAD, opacity: fade(u, 0.2) });
      mono(546, 112, fix >= 1 ? '클래스를 찾아 층을 다시 만든다' : 'TypeError: Could not locate class', { 'font-size': 13.5, fill: fix >= 1 ? GOOD : BAD, opacity: fade(u, 0.6) });
      if (fix < 1) cross(900, 82, 10, pop(u, 0.7));
      fly(316, 196, 316, 136, fix, 'custom_objects={...}', { fill: INFO, mono: true });
      if (fix >= 1) { pill(640, 152, 'custom_objects={...}', INFO, 1, { mono: true, fs: 13.5, fill: INFOBG }); check(900, 82, 10, pop(u, 2.1)); }
      sub(316, 250, '표준 층만 썼다면 필요 없다', fade(u, 2.3), { 'font-size': 14 }); return; }
    const topGu = k === 0 ? E(u, 0.2, 1.2) : 1;
    lane(115, 'doc', 'iris.keras', 'keras.models.load_model', INFO, topGu);
    card(726, 115, 400, 130, { rx: 10, stroke: INFO, sw: 2, op: k === 0 ? fade(u, 1.0) : 1 });
    tx(542, 76, 'Keras 모델 객체', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: k === 0 ? fade(u, 1.0) : 1 });
    if (k === 0) { [['dense', '(None, 16)', '80'], ['dense_1', '(None, 3)', '51'], ['Total params', '', '131']].forEach(([a, b, p], i) => { const op = fade(u, 1.2 + i * 0.25), y = 104 + i * 24;
        mono(546, y, a, { 'font-size': 14, 'font-weight': i === 2 ? 800 : 500, opacity: op }); mono(700, y, b, { 'font-size': 14, fill: MUT, opacity: op }); mono(906, y, p, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); });
      pill(830, 76, '.fit() 가능', GOOD, pop(u, 2.0), { fs: 13.5 }); return; }
    mono(546, 112, 'summary() · layers · .fit()', { 'font-size': 14 }); mono(546, 140, '커스텀 층이면 custom_objects', { 'font-size': 13.5, fill: MUT });
    // 아래 갈래: SavedModel → 실행 전용 객체
    const botGu = k === 2 ? E(u, 0.2, 1.2) : 1;
    lane(300, 'dir', 'iris_savedmodel/', 'tf.saved_model.load', GOOD, botGu);
    card(726, 300, 400, 136, { rx: 10, stroke: GOOD, sw: 2, op: k === 2 ? fade(u, 1.0) : 1 });
    tx(542, 258, '실행 전용 객체', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: k === 2 ? fade(u, 1.0) : 1 });
    if (k === 2) { mono(546, 290, '.signatures', { 'font-size': 14, opacity: fade(u, 1.2) });
      pill(690, 290, "'serve'", MUT, pop(u, 1.4), { mono: true, fs: 13.5 }); pill(830, 290, "'serving_default'", GOOD, pop(u, 1.6), { mono: true, fs: 13.5, fill: GOODBG });
      mono(546, 332, 'infer = signatures["serving_default"]', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.9) });
      pill(880, 260, '.fit()', BAD, pop(u, 2.2), { mono: true, fs: 13.5 }); cross(880, 260, 9, pop(u, 2.3)); return; }
    if (k === 3) { const f = E(u, 0.3, 1.0);
      tgrid(552, 278, 4, 2, 24, { s: (r, q) => fade(u, 0.2 + (r * 4 + q) * 0.05) }); mono(598, 346, 'x (2, 4)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.5) });
      grow(654, 300, 690, 300, f, MUT); pill(730, 300, 'infer', GOOD, pop(u, 0.9), { mono: true, fs: 14, fill: GOODBG }); grow(770, 300, 800, 300, E(u, 1.2, 1.6), MUT);
      tgrid(812, 278, 3, 2, 24, { s: (r, q) => fade(u, 1.6 + (r * 3 + q) * 0.08), col: GOOD, fill: GOODBG }); mono(846, 346, "output_0 (2, 3)", { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.9) });
      note(546, 400, '모델 클래스 코드 0줄로 추론', fade(u, 2.2), { fill: GOOD, 'font-size': 14.5 }); return; }
    return; }
  // k4, k5: 버전 디렉토리 (s4 에서 부른다)
  function versions(k, u) {
    folder(250, 110, 110, 80, { s: k === 4 ? pop(u, 0.4) : 1 }); mono(250, 124, 'iris/', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    const v2 = k === 5 ? seg(u, 0.3, 1.1) : 0, cur = k === 5 ? E(u, 1.3, 2.0) : 0;
    folder(180, 290, 90, 64, { s: k === 4 ? pop(u, 0.8) : 1, stroke: cur > 0.5 ? OFF : GOOD }); mono(180, 300, '1/', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: cur > 0.5 ? OFF : GOOD });
    grow(230, 150, 190, 252, k === 4 ? E(u, 0.6, 0.9) : 1, GRID, { plain: true });
    if (k === 5) { if (v2 < 1) folder(lerp(330, 330, v2), lerp(20, 290, E(v2, 0, 1)), 90, 64, { stroke: ACC }); else { folder(330, 290, 90, 64, { stroke: cur > 0.5 ? GOOD : ACC }); mono(330, 300, '2/', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: cur > 0.5 ? GOOD : ACC }); grow(270, 150, 320, 252, 1, GRID, { plain: true }); } }
    server(720, 200, 'TF Serving', { s: k === 4 ? pop(u, 1.0) : 1, lamp: GOOD });
    const tx0 = lerp(180, 330, cur); grow(660, 220, tx0 + 40, 280, k === 4 ? E(u, 1.4, 1.9) : 1, GOOD);
    if (k === 4) { note(720, 330, '서빙 중: v1', fade(u, 1.9), { 'text-anchor': 'middle', fill: GOOD }); sub(720, 360, '서버는 iris/ 를 감시한다', fade(u, 2.1), { 'font-size': 14 }); return; }
    note(720, 330, cur >= 1 ? '서빙 중: v2' : '2/ 감지', fade(u, 0.9), { 'text-anchor': 'middle', fill: cur >= 1 ? GOOD : ACC });
    sub(720, 360, '더 큰 번호를 무중단으로 올린다', fade(u, 2.1), { 'font-size': 14 }); }

  // ---------- 5. 배포 패턴 ----------
  const ST = [['학습 끝', 120], ['서명 정의', 360], ['저장 iris_app/1/', 600], ['CLI 검증', 840]];
  function stations(lit, half) { ST.forEach(([n, x], i) => { const on = i < lit, hf = i === lit && half;
      if (i > 0) el('line', { x1: ST[i - 1][1] + 18, y1: 56, x2: x - 18, y2: 56, stroke: on ? ACC : GRID, 'stroke-width': 3 });
      el('circle', { cx: x, cy: 56, r: 15, fill: on ? ACC : hf ? ACCBG : PANEL, stroke: on || hf ? ACC : GRID, 'stroke-width': 2.5 });
      mono(x, 61, String(i + 1), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? PANEL : MUT });
      tx(x, 96, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? INK : MUT }); }); }
  const RAW = [5.1, 3.5, 1.4, 0.2], MEAN = [5.8, 3.0, 3.7, 1.2], STD = [0.8, 0.4, 1.7, 0.7], NORM = ['-0.875', '1.250', '-1.353', '-1.429'];
  function row(y, name, vals, o) { o = o || {}; tx(176, y + 5, name, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: o.col || INK, opacity: o.op ?? 1, class: 'mono' });
    vals.forEach((v, i) => { const s = o.s ? o.s(i) : 1; if (s <= 0) return; card(232 + i * 86, y, 78, 34, { rx: 5, text: String(v), fs: 14.5, mono: true, fw: 700, stroke: o.col || INK, fill: o.fill || PANEL, color: o.col || INK, s }); }); }
  function s5(t, c) { const { k, u } = c;
    stations([1, 1, 2, 3, 4, 4][k], k === 1);
    if (k === 0) { card(480, 250, 260, 100, { rx: 12, sw: 2.5, s: pop(u, 0.3) });
      mono(480, 236, 'model', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); sub(480, 266, '가중치 131개 확정', fade(u, 0.8), { 'font-size': 14 });
      R.lock(620, 214, true, ACC, pop(u, 1.3)); note(480, 350, '여기서부터 배포 절차가 시작된다', fade(u, 1.8), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k <= 2) {
      row(212, 'norm_mean', MEAN, { s: (i) => (k === 1 ? pop(u, 0.3 + i * 0.12) : 1), col: MUT });
      row(256, 'norm_std', STD, { s: (i) => (k === 1 ? pop(u, 0.8 + i * 0.12) : 1), col: MUT });
      card(760, 260, 150, 70, { rx: 10, text: 'model', fs: 17, mono: true, fw: 800, op: k === 1 ? 0.5 : 1 });
      if (k === 1) { note(232 - 39, 316, '학습 때 쓴 통계 그대로 tf.constant 로', fade(u, 1.6), { fill: WARN }); return; }
      zone(16, 110, 920, 280, 'serve(raw_features) — 서명 안', { fill: 'none', stroke: GOOD, dash: '7 5', sw: 2, op: fade(u, 0.1) });
      row(168, 'raw', RAW, { s: (i) => pop(u, 0.2 + i * 0.1), col: INFO, fill: INFOBG });
      row(332, 'x', NORM, { s: (i) => pop(u, 0.9 + i * 0.25), col: ACC, fill: ACCBG });
      [0, 1, 2, 3].forEach((i) => grow(232 + i * 86, 275, 232 + i * 86, 313, E(u, 0.8 + i * 0.25, 1.0 + i * 0.25), ACC, { sw: 1.6 }));
      mono(580, 338, '(raw − mean) / std', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.9) });
      grow(600, 330, 682, 284, E(u, 2.0, 2.3), MUT); grow(838, 260, 900, 260, E(u, 2.3, 2.5), MUT); mono(906, 236, 'probs', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: GOOD, opacity: fade(u, 2.5) }); return; }
    if (k === 3) { folder(480, 260, 260, 170, { s: pop(u, 0.3), stroke: ACC });
      mono(480, 230, 'iris_app/1/', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      pill(480, 270, 'saved_model.pb (serve 포함)', GOOD, pop(u, 0.9), { fs: 13.5, fill: GOODBG }); pill(480, 308, 'variables/', ACC, pop(u, 1.2), { mono: true, fs: 13.5 });
      mono(480, 390, 'tf.saved_model.save(model, "iris_app/1/", signatures=...)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { terminal(60, 130, 640, 190, ['$ saved_model_cli show --dir iris_app/1 \\', '    --tag_set serve --signature_def serving_default', ["inputs['raw_features']  DT_FLOAT  (-1, 4)", null], "outputs['probs']        DT_FLOAT  (-1, 3)"], E(u, 0.2, 1.8) * 4, { title: '배포 전 마지막 확인', fs: 13.5 });
      check(780, 200, 16, pop(u, 1.9)); note(800, 250, '입구가 원본을 받는다', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); return; }
    // k5: 개발 단계별 형식
    grow(70, 270, 900, 270, E(u, 0.2, 0.9), MUT, { sw: 3 }); tx(900, 300, '개발 단계', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.8) });
    [['학습 도중', '체크포인트 (가중치)', '중단·복구용으로 자주', WARN, 180], ['학습 끝 · 연구', '.keras', '옵티마이저까지 보존', INFO, 470], ['실제 배포', 'SavedModel/', '파이썬 없이 실행', GOOD, 760]].forEach(([w, f, why, col, x], i) => {
      const s = pop(u, 0.9 + i * 0.45); el('circle', { cx: x, cy: 270, r: 9 * s, fill: col });
      tx(x, 320, w, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9 + i * 0.45) });
      card(x, 200, 220, 70, { rx: 10, stroke: col, sw: 2.2, s });
      mono(x, 194, f, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 1.0 + i * 0.45) }); sub(x, 218, why, fade(u, 1.0 + i * 0.45)); });
    note(480, 380, '셋은 하나를 고르는 문제가 아니라 단계별 도구다', fade(u, 2.3), { 'text-anchor': 'middle' }); }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '학습을 나중에 그대로 이어 가려고 옵티마이저 상태까지 남겨야 할 때 고를 형식은 무엇인가?',
      o: ['.weights.h5', '.keras', 'SavedModel 디렉토리'], a: 1,
      why: '.keras는 구조·가중치·옵티마이저 상태를 한 파일(이 예에서 18,895 B)에 담는다. .weights.h5는 가중치만, SavedModel은 그래프·가중치·서명을 담는다.' },
    { q: 'SavedModel을 파이썬 모델 클래스 없이 실행할 수 있는 이유는 무엇인가?',
      o: ['variables/ 에 가중치가 압축돼 있어서', 'fingerprint.pb가 클래스 코드를 기억해서', 'saved_model.pb에 계산 그래프가 통째로 들어 있어서'], a: 2,
      why: 'saved_model.pb에 MatMul·BiasAdd·Relu·Softmax 같은 연산 그래프가 직렬화돼 있다. variables/ 에는 131개 가중치 값만 있다.' },
    { q: '학습 때는 문자열을 인덱스로 바꿨는데 서빙에는 원본 문자열이 들어온다. 이 사고를 막는 방법은 무엇인가?',
      o: ['전처리를 서명 함수 안에 넣어 그래프와 함께 저장한다', '클라이언트 문서에 전처리 규칙을 적어 둔다', '입력 shape를 (-1, 4)로 고정한다'], a: 0,
      why: 'VOCAB 상수와 one_hot을 serving_raw 안에 넣으면 입구가 raw_text 문자열이 되고, 클라이언트는 원본만 보내면 된다.' },
    { q: '커스텀 층이 든 custom.keras를 custom_objects 없이 load_model 하면 어떻게 되는가?',
      o: ['커스텀 층을 건너뛰고 나머지만 로드된다', 'TypeError로 클래스를 찾지 못했다고 멈춘다', '자동으로 SavedModel로 바뀌어 로드된다'], a: 1,
      why: '.keras 복원은 저장된 설정으로 층을 다시 만든다. AddPositionalEncoding 클래스를 모르면 Could not locate class 오류가 난다.' },
    { q: 'Keras 3에서 전처리를 넣은 serve 함수를 serving_default로 저장할 때 써야 하는 것은 무엇인가?',
      o: ['model.export(path, signatures=...)', 'model.save_weights(path)', 'tf.saved_model.save(model, path, signatures=...)'], a: 2,
      why: 'model.export는 signatures 인자를 오류 없이 무시해 기본 서명이 남는다. tf.saved_model.save로 저장하면 CLI에 inputs[\'raw_features\']가 찍힌다.' },
  ];

  const summary = [
    '.keras는 구조와 가중치, 옵티마이저 상태까지 담아 학습을 이어 갈 때 쓴다.',
    'SavedModel은 saved_model.pb에 계산 그래프를 담아 파이썬 클래스 없이 실행된다.',
    '서명은 입출력 계약이다. 전처리를 서명 안에 넣으면 서빙에 원본만 보내도 된다.',
    'Keras 3에서 커스텀 서명은 tf.saved_model.save로 저장하고 CLI로 입구를 확인한다.',
  ];
  const review = [
    { q: '서빙 서버에 .keras 파일을 올렸더니 커스텀 층 때문에 로드가 실패했다. 먼저 바꿀 것은?',
      o: ['서버가 tf.saved_model.load로 읽을 SavedModel을 올린다', 'save_weights로 가중치만 다시 저장해 올린다', '옵티마이저를 SGD로 바꿔 다시 저장한다'], a: 0,
      why: '.keras 복원은 파이썬 클래스가 있어야 한다. SavedModel은 그래프를 통째로 담아 클래스 없이 서명을 호출할 수 있다.' },
    { q: 'serve 함수를 signatures로 넘겨 model.export 했는데 CLI에 inputs[\'keras_tensor\']가 찍혔다. 먼저 의심할 것은?',
      o: ['input_signature의 shape가 틀렸다', 'model.export가 signatures 인자를 무시했다', 'norm_std에 0이 들어 있다'], a: 1,
      why: 'Keras 3의 model.export는 signatures를 쓰지 않아 기본 서명이 남는다. tf.saved_model.save로 저장하면 raw_features 입구가 찍힌다.' },
    { q: '학습 도중 자주 중간 저장을 하고, 끝나면 서버에 배포하려 한다. 알맞은 조합은?',
      o: ['도중에도 끝나고도 SavedModel만 쓴다', '도중엔 .weights.h5, 배포엔 .keras를 쓴다', '도중엔 체크포인트, 배포엔 SavedModel을 쓴다'], a: 2,
      why: '중간 저장은 가볍게 자주 남기는 체크포인트가 맞고, 배포는 파이썬 없이 도는 SavedModel이 맞다. 형식은 단계별 도구다.' },
  ];

  R.page({ title: 'SavedModel 저장·서명·로드', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
