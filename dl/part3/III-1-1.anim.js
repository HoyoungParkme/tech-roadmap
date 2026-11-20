/* III-1-1 RNN 기초 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 토큰이 한 칸씩 셀에 들어가고, 셀 사이를 은닉 상태 h(게이지 2칸)가 들고 다닌다.
 *   역전파는 같은 사슬을 오른쪽 끝(손실)에서 왼쪽으로 거슬러 가는 빨간 흐름이다.
 * 숫자: h·확률은 페이지 코드와 같은 Wx·Wh 로 여기서 다시 계산한다(numpy 실행 결과와 일치: 0.08/0.05 … 0.88).
 *   0.55 감쇠는 페이지의 가정값, 0.35·0.12·0.07 은 이 예제로 실제 계산한 |dL/dh_t| 비율. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, grow, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 700, opacity: op }, a || {}));

  // ---------- 실계산 미니 RNN (페이지 코드와 같은 값) ----------
  const TOK = [['영화가', 0.1], ['정말', 0.4], ['재미', 0.9], ['있었다', 0.6]];
  const WX = [0.8, 0.5], WH = [[0.6, -0.2], [0.1, 0.7]], V = [1.5, 1.5];
  const H = [[0, 0]]; TOK.forEach(([, x]) => { const p = H[H.length - 1]; H.push([0, 1].map((i) => Math.tanh(WX[i] * x + WH[i][0] * p[0] + WH[i][1] * p[1]))); });
  const P = 1 / (1 + Math.exp(-(V[0] * H[4][0] + V[1] * H[4][1])));
  const f2 = (v) => (v >= 0 ? '+' : '') + v.toFixed(2);

  // ---------- 셀 사슬 ----------
  const CX = (t) => 130 + (t - 1) * 165, CY = 200, CW = 120, CH = 112;   // t = 1..4
  const OUTX = 790;
  function gauge(x, y, v, act, op) { el('rect', { x, y, width: 90, height: 12, rx: 6, fill: SOFT, opacity: op }); el('rect', { x, y, width: 90 * clamp(Math.abs(v)), height: 12, rx: 6, fill: act ? ACC : INFO, opacity: op * (act ? 1 : 0.6) }); }
  // st(t) → { done 0..1, act, grad 0..1 } ; o.gauges: 숫자 표시 여부
  function chain(st, o) { o = o || {};
    for (let t = 1; t <= 4; t++) { const s = st(t), x = CX(t), done = s.done ?? 0, op = s.op ?? 1;
      if (t > 1) { grow(CX(t - 1) + CW / 2 + 2, CY - 18, x - CW / 2 - 4, CY - 18, s.arrow ?? 1, done > 0.5 ? ACC : OFF);
        if (o.hLabel !== false) mono((CX(t - 1) + x) / 2, CY - 28, 'h', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
      card(x, CY, CW, CH, { rx: 10, stroke: s.grad > 0.5 ? BAD : s.act ? ACC : done > 0.5 ? INK : OFF, fill: s.grad > 0.5 ? BADBG : s.act ? ACCBG : PANEL, sw: s.act || s.grad > 0.5 ? 3 : 2, op });
      mono(x, CY - CH / 2 + 18, `t=${t}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op });
      const h = done > 0.5 ? H[t] : H[0];
      [0, 1].forEach((d) => gauge(x - 45, CY - 22 + d * 22, h[d] * Math.min(1, done * 2), s.act, op));
      if (o.gauges !== false && done > 0.5) mono(x, CY + 36, `[${f2(h[0])}, ${f2(h[1])}]`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: s.act ? ACC : INK, opacity: op * clamp(done * 2 - 1) });
      if (o.tokens !== false) { const ta = s.tok ?? 1; card(x, CY + CH / 2 + 26, tw(TOK[t - 1][0], 15) + 22, 30, { rx: 15, fill: s.act ? WARNBG : PANEL, stroke: WARN, sw: 1.8, text: TOK[t - 1][0], fs: 15, op: ta });
        mono(x, CY + CH / 2 + 62, `x=${TOK[t - 1][1]}`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: ta }); } } }

  // ---------- 1. 순서가 정보다 ----------
  function sent(x, y, words, col, op, o) { o = o || {}; let xx = x; words.forEach((w, i) => { const wd = tw(w, 16) + 26; card(xx + wd / 2, y, wd, 38, { rx: 8, stroke: col, text: w, fs: 16, op: o.ops ? o.ops[i] : op });
      if (o.idx) mono(xx + wd / 2, y - 26, String(i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); xx += wd + 10; }); return xx; }
  function vec(x, y, vals, col, op, label) { if (label) mono(x - 12, y + 25, label, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
    vals.forEach((v, i) => { card(x + 26 + i * 56, y + 20, 50, 40, { rx: 6, stroke: col, fill: PANEL, text: String(v), fs: 17, mono: true, op }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['MLP · CNN 의 가정', ['고정 크기 입력', '순서 없음'], INFO, 250], ['시퀀스의 현실', ['길이가 매번 다름', '순서가 곧 의미'], WARN, 710]].forEach(([h, items, col, x], i) => {
        card(x, 200, 340, 190, { rx: 12, stroke: col, s: pop(u, 0.3 + i * 0.7) }); tx(x, 135, h, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.4 + i * 0.7) });
        items.forEach((s, j) => tx(x, 195 + j * 40, s, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.7 + j * 0.2) })); });
      tx(480, 210, '≠', { 'font-size': 44, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
      note(480, 360, '정면으로 어긋난다 — 왜 전용 구조가 필요한가', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    const A = ['개가', '사람을', '물었다'], B = ['사람이', '개를', '물었다'];
    if (k === 1) { tx(60, 110, 'A', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) }); sent(100, 105, A, INFO, fade(u, 0.3), { idx: true });
      tx(60, 230, 'B', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.0) }); sent(100, 225, B, BAD, fade(u, 1.1), { idx: true });
      note(520, 112, '→ 개가 가해자 (흔한 일)', fade(u, 0.7)); note(520, 232, '→ 사람이 가해자 (뉴스감)', fade(u, 1.5), { fill: BAD });
      note(100, 330, '단어 구성은 같고, 차이는 순서뿐', fade(u, 2.1)); return; }
    if (k === 2) { const g = E(u, 0.5, 1.4);
      [[A, INFO, 110], [B, BAD, 200]].forEach(([W, col, y]) => { let xx = 100; W.forEach((w) => { const base = w.replace(/[가이를을]$/, '').replace('물었다', '물었다'), stem = w === '물었다' ? w : w.slice(0, -1), suf = w === '물었다' ? '' : w.slice(-1);
          const wd = tw(stem, 16) + 26; card(xx + wd / 2, y, wd, 38, { rx: 8, stroke: col, text: stem, fs: 16 });
          if (suf) tx(xx + wd + 4, y + 6 + 40 * g, suf, { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: 1 - g }); xx += wd + 34; }); });
      tx(560, 120, 'vocab =', { 'font-size': 16, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.5) });
      ['개', '사람', '물었다'].forEach((w, i) => pill(660 + i * 80, 160, w, ACC, pop(u, 1.6 + i * 0.2), { fs: 15 }));
      sub(560, 330, '조사(가·이·를·을)를 떼고 어휘 3개로 줄인다', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    // 3~5: 주머니에 넣고 세기
    const bag = (op) => { el('path', { d: 'M560,150 L540,330 Q540,360 570,360 L790,360 Q820,360 820,330 L800,150 Z', fill: SOFT, stroke: INK, 'stroke-width': 2.5, opacity: op }); mono(680, 140, 'bag_of_words()', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); };
    if (k === 3) { bag(fade(u, 0.2)); sent(60, 140, A, INFO, 1); sent(60, 250, B, BAD, 1);
      sub(680, 390, '"순서를 버리고 빈도만 센다" — docstring 그대로', fade(u, 1.4), { 'font-size': 15 });
      A.forEach((w, i) => R.fly(120 + i * 95, 140, 680, 300, seg(u, 1.0 + i * 0.25, 1.8 + i * 0.25), w, { fill: INFO })); return; }
    if (k === 4) { bag(1); ['개', '사람', '물었다'].forEach((w, i) => { const x = 590 + i * 75, n = u > 0.8 + i * 0.5 ? 1 : 0;
        card(x + 22, 300, 64, 50, { rx: 6, stroke: ACC, text: String(n), fs: 20, mono: true }); tx(x + 22, 262, w, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); });
      A.forEach((w, i) => R.fly(120 + i * 95, 160, 612 + i * 75, 300, seg(u, 0.3 + i * 0.5, 0.8 + i * 0.5), w, { fill: INFO }));
      mono(60, 120, 'vec[i] += 1', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      tx(60, 200, '위치 i 는?', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); cross(220, 194, 11, pop(u, 2.1));
      sub(60, 240, '어디에도 저장되지 않는다', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    if (k === 5) { sent(100, 100, A, INFO, 1); sent(100, 240, B, BAD, 1);
      vec(600, 80, [1, 1, 1], INFO, fade(u, 0.4), 'A →'); vec(600, 220, [1, 1, 1], BAD, fade(u, 0.9), 'B →');
      tx(686, 190, '=', { 'font-size': 36, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.5) });
      note(100, 360, '입력이 같으면 출력도 같다 — 어떤 가중치로도 구분 불가', fade(u, 1.9), { fill: BAD }); return; }
    if (k === 6) { const items = [['① 순서 소실', '"누가 누구를" 이 사라진다'], ['② 길이 가변', '3단어 vs 300단어'], ['③ 시계열 전반', '주가 · 센서 · 로그']];
      items.forEach(([h, d], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.6); card(x, 120, 270, 74, { rx: 10, stroke: BAD, s }); tx(x, 114, h, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s > 0.5 ? 1 : 0 }); tx(x, 140, d, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s > 0.5 ? 1 : 0 }); });
      // ② 그림: 고정 입력층 vs 길이가 다른 시퀀스
      const g = E(u, 1.2, 1.9); for (let i = 0; i < 3; i++) el('rect', { x: 330 + i * 26, y: 230, width: 22, height: 22, rx: 3, fill: WARN, opacity: g });
      for (let i = 0; i < 24; i++) el('rect', { x: 330 + i * 18, y: 280, width: 15, height: 22, rx: 3, fill: WARN, opacity: g * (i < 23 ? 1 : 0.4) });
      mono(330 + 24 * 18 + 6, 297, '… 300', { 'font-size': 14, fill: MUT, opacity: g });
      el('rect', { x: 330, y: 330, width: 26 * 5, height: 24, rx: 3, fill: 'none', stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.8) });
      tx(330 + 140, 348, '고정 크기 입력층 (5칸)', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.8) }); cross(300, 290, 10, pop(u, 2.2)); return; }
    if (k === 7) { const ws = ['개가', '사람을', '물었다'];
      ws.forEach((w, i) => { const x = 200 + i * 230, g = E(u, 0.3 + i * 0.6, 0.8 + i * 0.6);
        card(x, 210, 110, 80, { rx: 10, stroke: g > 0.5 ? ACC : OFF, fill: g > 0.5 ? ACCBG : PANEL, text: 'cell', fs: 16, mono: true });
        card(x, 300, tw(w, 15) + 24, 32, { rx: 16, stroke: WARN, text: w, fs: 15, op: fade(u, 0.2 + i * 0.6) }); grow(x, 282, x, 252, g, WARN);
        if (i < 2) { grow(x + 57, 210, x + 170, 210, E(u, 0.8 + i * 0.6, 1.1 + i * 0.6), ACC); mono(x + 115, 198, 'h', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: g }); } });
      note(100, 100, '한 번에 다 넣지 말고, 하나씩 읽으며', fade(u, 0.2)); note(100, 128, '지금까지의 요약(기억 h)을 들고 다닌다', fade(u, 1.8), { fill: ACC }); }
  }

  // ---------- 2. 순환 구조 ----------
  function formula(x, y, op, hi) { R.spans(x, y, [['h', { 'font-weight': 800 }], ['ₜ = tanh( ', {}], ['Wx·xₜ', { fill: hi === 1 ? WARN : INK, 'font-weight': 800 }], [' + ', {}], ['Wh·hₜ₋₁', { fill: hi === 2 ? ACC : INK, 'font-weight': 800 }], [' + b )', {}]], { 'font-size': 24, opacity: op }); }
  function mat(x, y, m, cs, col, op, label) { m.forEach((row, r) => row.forEach((v, q) => card(x + q * cs + cs / 2, y + r * cs + cs / 2, cs - 4, cs - 4, { rx: 4, stroke: col, fill: PANEL, text: String(v), fs: 15, mono: true, op })));
    if (label) mono(x + m[0].length * cs / 2, y - 10, label, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { formula(150, 140, fade(u, 0.2), u > 1.0 ? (u > 1.7 ? 2 : 1) : 0);
      sub(330, 200, '새 입력 반영', fade(u, 1.0), { fill: WARN, 'font-size': 15 }); sub(500, 200, '직전 기억 반영', fade(u, 1.7), { fill: ACC, 'font-size': 15 });
      note(150, 300, '두 항을 더해 tanh 로 누르는 것 — RNN 의 전부', fade(u, 2.3)); return; }
    if (k === 1) { mono(100, 110, 'H_DIM, X_DIM = 2, 1', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.2) });
      mat(200, 180, [[0.1]], 50, WARN, fade(u, 0.8), 'x (1,)'); mat(420, 180, [['h₀'], ['h₁']], 50, ACC, fade(u, 1.2), 'h (2,)');
      [0, 1].forEach((d) => gauge(520, 196 + d * 50, H[2][d], true, fade(u, 1.6)));
      sub(565, 320, '게이지 두 칸 = h 의 두 성분', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2 || k === 3 || k === 4) { mat(100, 120, [[0.8], [0.5]], 50, WARN, k === 2 ? fade(u, 0.2) : 1, 'Wx (2,1)'); mat(210, 120, [[0.6, -0.2], [0.1, 0.7]], 50, ACC, k === 2 ? fade(u, 0.7) : 1, 'Wh (2,2)'); mat(370, 120, [[0], [0]], 50, MUT, k === 2 ? fade(u, 1.2) : 1, 'b');
      if (k === 2) { note(100, 290, '파라미터는 이 셋이 전부 — 2 + 4 + 2 = 8개', fade(u, 1.7)); sub(100, 320, 'Wh 는 정사각: 기억을 받아 같은 크기의 기억으로', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 14.5 }); return; }
      // rnn_cell 상자
      const bx = 700, by = 200; card(bx, by, 160, 90, { rx: 12, stroke: INK, text: 'rnn_cell', fs: 17, mono: true, s: k === 3 ? pop(u, 0.2) : 1 });
      grow(bx, by + 110, bx, by + 47, k === 3 ? E(u, 0.6, 1.0) : 1, WARN); mono(bx, by + 128, k === 4 ? 'x_t (1,)' : 'x_t', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: k === 3 ? fade(u, 0.7) : 1 });
      grow(bx - 170, by, bx - 82, by, k === 3 ? E(u, 0.9, 1.3) : 1, ACC); mono(bx - 175, by + 5, k === 4 ? 'h_prev (2,)' : 'h_prev', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: ACC, opacity: k === 3 ? fade(u, 1.0) : 1 });
      grow(bx + 82, by, bx + 160, by, k === 3 ? E(u, 1.2, 1.6) : 1, ACC); mono(bx + 120, by - 12, k === 4 ? 'h (2,)' : 'h', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: k === 3 ? fade(u, 1.3) : 1 });
      if (k === 3) { tx(560, 330, '시점 t 인자가 없다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); sub(560, 360, '어느 시점이든 같은 함수', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 15 }); }
      if (k === 4) { const g = E(u, 0.8, 1.8); el('path', { d: `M${bx + 160},${by} C${bx + 230},${by} ${bx + 230},${by - 120} ${bx},${by - 120} C${bx - 200},${by - 120} ${bx - 220},${by - 40} ${bx - 170},${by - 8}`, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': 900, 'stroke-dashoffset': 900 * (1 - g) });
        note(100, 340, '입력 h 와 출력 h 의 모양이 같다 (2,) → 자기 출력을 다시 넣을 수 있다', fade(u, 1.9), { 'font-size': 14.5 }); }
      return; }
    if (k === 5) { mono(100, 100, 'return np.tanh(Wx @ x_t + Wh @ h_prev + b)', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      const ax = R.axes(160, 150, 320, 180, { x: [-3, 3], y: [-1, 1], xt: [-3, 0, 3], yt: [-1, 0, 1], grid: true });
      const pts = []; for (let i = 0; i <= 60; i++) { const x = -3 + i / 10; pts.push([x, Math.tanh(x)]); } R.line(ax, pts, E(u, 0.6, 1.6), ACC, { sw: 3 });
      note(540, 200, '값을 −1 ~ 1 로 누른다', fade(u, 1.5)); sub(540, 236, '기억이 발산하지 않는다 —', fade(u, 1.9), { 'text-anchor': 'start', 'font-size': 15 }); sub(540, 262, '대신 Step 4 기울기 소실의 씨앗', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 15, fill: BAD }); return; }
    if (k === 6 || k === 7) { // 접힌 셀 → 펼친 사슬
      const g = k === 6 ? E(u, 0.9, 1.9) : 1;
      if (g < 1) { const x = 130, y = CY; card(x, y, CW, CH, { rx: 10, stroke: ACC, fill: ACCBG, text: 'RNN', fs: 18, op: 1 - g });
        el('path', { d: `M${x + 40},${y - 56} C${x + 40},${y - 110} ${x - 40},${y - 110} ${x - 40},${y - 60}`, fill: 'none', stroke: ACC, 'stroke-width': 3, 'marker-end': 'url(#ra-ahb)', opacity: (1 - g) * fade(u, 0.2) });
        mono(x, y - 104, 'h (자기 자신에게)', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: (1 - g) * fade(u, 0.3) }); }
      if (g > 0) chain((tt) => ({ done: 1, op: clamp(g * 4 - (tt - 1)) , arrow: clamp(g * 4 - (tt - 1)) }), { gauges: false });
      if (k === 6) { tx(520, 90, 'unfold — 시간축으로 펼친다', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) }); return; }
      for (let tt = 1; tt <= 4; tt++) pill(CX(tt), CY - 86, 'Wx · Wh', ACC, pop(u, 0.3 + tt * 0.2), { fs: 13.5, mono: true });
      note(110, 390, '셀은 하나 · 출력 h = 다음 입력 · 파라미터 8개는 길이와 무관', fade(u, 1.6), { 'font-size': 15 }); }
  }

  // ---------- 3. forward 실계산 ----------
  function weightsLine(op) { mono(70, 405, 'Wx=[0.8, 0.5]   Wh=[[0.6,−0.2],[0.1,0.7]]   v=[1.5, 1.5]   — 모든 셀이 공유', { 'font-size': 14, fill: MUT, opacity: op }); }
  function outBox(on, op) { card(OUTX + 40, CY, 110, CH, { rx: 10, stroke: on ? GOOD : OFF, fill: on ? GOODBG : PANEL, sw: 2.5, op });
    tx(OUTX + 40, CY - 26, '출력 ŷ', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: op });
    mono(OUTX + 40, CY + 10, on ? P.toFixed(2) : '—', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: on ? GOOD : OFF, opacity: op });
    tx(OUTX + 40, CY + 36, '긍정 확률', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) { chain(() => ({ done: 0, op: 0.55, tok: k === 2 ? fade(u, 0.4) : 1 }), { gauges: false, tokens: k >= 2 }); outBox(false, 0.55);
      if (k === 0) { note(70, 80, '"영화가 정말 재미 있었다" 를 한 단어씩', fade(u, 0.3)); sub(70, 110, '게이지 숫자 = 코드가 출력하는 값', fade(u, 1.0), { 'text-anchor': 'start', 'font-size': 15 }); }
      if (k >= 1) weightsLine(k === 1 ? fade(u, 0.3) : 1);
      if (k === 1) pill(OUTX + 40, CY + 92, 'v 추가', GOOD, pop(u, 1.4), { fs: 14 });
      if (k === 2) note(70, 80, '"재미" 의 x 가 가장 크다 (0.9)', fade(u, 1.4), { fill: WARN });
      if (k === 3) { card(40, CY, 60, 60, { rx: 8, stroke: ACC, text: 'h₀', fs: 17, mono: true, s: pop(u, 0.3) }); mono(40, CY + 50, '[0, 0]', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); grow(72, CY - 18, CX(1) - CW / 2 - 4, CY - 18, E(u, 0.8, 1.2), ACC);
        mono(70, 80, 'history = [h₀]', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.3) }); sub(70, 110, 'Step 4 의 BPTT 가 이 기록을 재사용한다', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 15 }); }
      return; }
    weightsLine(1);
    if (k === 4) { const tick = clamp((u - 0.3) / 0.55, 0, 4); // 0.3s 부터 0.55s 마다 한 칸
      chain((tt) => ({ done: tick >= tt ? 1 : clamp(tick - tt + 1) * 0.4, act: Math.floor(tick) === tt || (tick >= 4 && tt === 4), op: 1 }));
      outBox(false, 0.55); mono(70, 80, 'for word, x in tokens:  h = tanh(Wx@[x] + Wh@h)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) }); return; }
    if (k === 5) { chain((tt) => ({ done: 1, act: tt === 3 || (tt === 1 && u < 1.2) }));
      outBox(false, 0.55);
      note(70, 80, '"영화가" 에서는 거의 0', fade(u, 0.3)); note(400, 80, '"재미" 에서 [+0.71, +0.57] 로 점프', fade(u, 1.3), { fill: ACC });
      grow(CX(3), 92, CX(3), CY - CH / 2 - 6, E(u, 1.5, 1.9), ACC); return; }
    if (k === 6) { chain(() => ({ done: 1 })); const g = E(u, 0.3, 1.0); grow(CX(4) + CW / 2 + 2, CY - 18, OUTX - 18, CY - 18, g, GOOD); outBox(u > 1.0, 1);
      mono(70, 80, `sigmoid(v · h₄) = ${P.toFixed(2)}`, { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      sub(70, 110, '마지막 h 하나가 문장 전체의 요약 — many-to-one', fade(u, 1.9), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    if (k === 7) { chain(() => ({ done: 1 }), { }); outBox(true, 1);
      card(480, 70, 260, 44, { rx: 10, stroke: ACC, fill: ACCBG, text: 'Wx · Wh 한 벌', fs: 16, mono: true, s: pop(u, 0.3) });
      for (let tt = 1; tt <= 4; tt++) grow(480, 92, CX(tt), CY - CH / 2 - 4, E(u, 0.8 + tt * 0.2, 1.1 + tt * 0.2), ACC, { sw: 1.8 });
      sub(820, 80, '셀마다 다른 가중치 ✗', fade(u, 2.0), { fill: BAD, 'font-size': 14.5 }); }
  }

  // ---------- 4. BPTT ----------
  const DEC = [0.55 ** 3, 0.55 ** 2, 0.55, 1];       // 페이지 가정: t=1..4 기여 배율
  const REAL = [0.065, 0.121, 0.350, 1];             // 이 예제로 실제 계산한 |dL/dh_t| / |dL/dh_4|
  function lossBox(op, hot) { card(OUTX + 40, CY, 110, CH, { rx: 10, stroke: BAD, fill: hot ? BADBG : PANEL, sw: 2.5, op }); tx(OUTX + 40, CY - 10, '손실 L', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: op }); mono(OUTX + 40, CY + 20, '∇L', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: op }); }
  function back(g, o) { o = o || {}; // 빨간 흐름: g 0→1 이 손실 → t=1
    const xs = [OUTX + 40 - 55, CX(4), CX(3), CX(2), CX(1)];
    for (let i = 0; i < 4; i++) { const a = clamp(g * 4 - i); if (a <= 0) break; grow(xs[i] - (i ? CW / 2 + 4 : 2), CY + 18, xs[i + 1] + CW / 2 + 2, CY + 18, a, BAD, { sw: 3 }); } }
  function s4(t, c) { const { k, u } = c;
    const grad = (tt, g) => ({ done: 1, grad: clamp(g * 4 - (4 - tt)) , op: 1 });
    if (k <= 3) { chain(() => ({ done: 1 }), { tokens: k !== 3 }); lossBox(1, k >= 2);
      if (k === 0) { mono(70, 80, 'dL/dWh = Σₜ (시점 t 의 기여)', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3) }); back(E(u, 1.0, 2.4)); sub(70, 112, '한 칸 거슬러 갈 때마다 Wh.T·tanh′ 이 한 번 더 곱해진다', fade(u, 1.6), { 'text-anchor': 'start', 'font-size': 15 }); }
      if (k === 1) { mono(70, 80, 'def bptt(xs, history, dL_dh_last, Wx, Wh)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
        for (let tt = 0; tt <= 4; tt++) card(110 + tt * 70, 380, 60, 32, { rx: 6, stroke: ACC, text: `h${'₀₁₂₃₄'[tt]}`, fs: 15, mono: true, s: pop(u, 0.8 + tt * 0.15) });
        tx(470, 386, '← forward 가 남긴 history 를 그대로 쓴다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      if (k === 2) { el('circle', { cx: OUTX + 40, cy: CY + 70, r: 10 * pop(u, 0.3), fill: BAD }); mono(OUTX + 40, CY + 100, 'dL_dh_last', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.5) });
        note(70, 80, '출발점은 오른쪽 끝 — 손실이 마지막 h 에 준 기울기', fade(u, 1.0)); sub(70, 110, '나오는 것: 전 시점을 합산한 dWx, dWh', fade(u, 1.7), { 'text-anchor': 'start', 'font-size': 15 }); }
      if (k === 3) { mat(80, 345, [[0], [0]], 34, WARN, fade(u, 0.3)); mono(97, 336, 'dWx', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.3) });
        mat(150, 345, [[0, 0], [0, 0]], 34, ACC, fade(u, 0.6)); mono(184, 336, 'dWh', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
        R.fly(OUTX + 40, CY + 70, OUTX + 40, CY + 70, 0.5, 'dh = 책임', { fill: BAD, stay: true }); mono(70, 80, 'dh = dL_dh_last   # 지금 손에 든 "책임"', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); }
      return; }
    if (k === 4) { chain((tt) => grad(tt, tt === 4 ? E(u, 0.3, 0.6) : 0), { tokens: false }); lossBox(1, true); back(E(u, 0.2, 0.5) / 4);
      const g = fade(u, 0.9); mono(CX(4), CY + CH / 2 + 28, `1−h²`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: g });
      mono(CX(4), CY + CH / 2 + 50, `[${(1 - H[4][0] ** 2).toFixed(2)}, ${(1 - H[4][1] ** 2).toFixed(2)}]`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.3) });
      mono(70, 80, 'for t in reversed(range(len(xs))):   # T → 1', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.2) });
      note(70, 380, 'tanh 미분 (1 − h²) 은 항상 1 이하 — 통과할 때마다 줄어든다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 5) { const g = E(u, 0.3, 2.2); chain((tt) => grad(tt, g), { tokens: false }); lossBox(1, true); back(g);
      [[80, [[1], [1]], WARN, 'dWx'], [150, [[1, 1], [1, 1]], ACC, 'dWh']].forEach(([x, m, col, nm]) => { const fill = Math.min(4, Math.floor(g * 4 + 0.01));
        m.forEach((row, r) => row.forEach((_, q) => el('rect', { x: x + q * 34, y: 345 + r * 34, width: 30, height: 30, rx: 4, fill: col, opacity: 0.12 + 0.18 * fill, stroke: col })));
        mono(x + m[0].length * 17, 336, nm, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); });
      mono(250, 372, '+=', { 'font-size': 22, 'font-weight': 800, fill: ACC }); tx(300, 372, '공유 가중치 → 시점마다 기여를 더한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); return; }
    if (k === 6) { chain((tt) => grad(tt, 1), { tokens: false }); lossBox(1, true); back(1);
      for (let tt = 1; tt <= 4; tt++) { const a = fade(u, 0.3 + (4 - tt) * 0.45), x = CX(tt);
        el('rect', { x: x - 45, y: CY + CH / 2 + 14, width: 90, height: 14, rx: 4, fill: SOFT, opacity: a }); el('rect', { x: x - 45, y: CY + CH / 2 + 14, width: 90 * DEC[tt - 1], height: 14, rx: 4, fill: BAD, opacity: a });
        mono(x, CY + CH / 2 + 48, `∇×${DEC[tt - 1].toFixed(2)}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: a }); }
      mono(70, 80, 'dh = Wh.T @ da   # ★ 한 칸 과거로', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      sub(70, 112, '한 칸마다 |Wh.T·tanh′| ≈ 0.55 가 곱해진다고 가정', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    if (k === 7) { const ax = R.axes(110, 90, 420, 230, { x: [0, 30], y: [0, 1], xt: [0, 3, 10, 20, 30], yt: [0, 0.5, 1], xl: '거슬러 간 칸 수', yl: '기여 배율' });
      const pts = []; for (let i = 0; i <= 30; i++) pts.push([i, Math.pow(0.55, i)]); R.line(ax, pts, E(u, 0.3, 1.5), BAD, { sw: 3 });
      R.scatter(ax, [[3, 0.55 ** 3, BAD]], { u: fade(u, 1.0), r: 7 });
      mono(ax.X(3) + 14, ax.Y(0.166) - 10, '0.55³ ≈ 0.17', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      mono(ax.X(30), ax.Y(0) - 14, '0.55³⁰ ≈ 1.6×10⁻⁸', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      tx(600, 120, '이 예제로 실제 계산하면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      [3, 2, 1].forEach((tt, i) => { mono(600, 156 + i * 30, `t=${tt}`, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9 + i * 0.15) }); R.hbar(660, 143 + i * 30, 180, REAL[tt - 1], 1, { col: BAD, text: REAL[tt - 1].toFixed(2), u: E(u, 1.9 + i * 0.15, 2.3 + i * 0.15), h: 16 }); });
      sub(720, 270, '|dL/dh_t| ÷ |dL/dh_4| — 가정(0.55)보다 더 빨리 준다', fade(u, 2.3), { 'font-size': 13.5 });
      note(600, 330, '20~30 칸 넘는 문맥은 순정 RNN 으로 못 배운다', fade(u, 2.4), { 'font-size': 14.5, fill: BAD }); return; }
    if (k === 8) { tx(70, 80, 'history 를 전부 들고 있어야 한다 → 메모리 ∝ 시퀀스 길이', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      [[4, 'T=4'], [30, 'T=30'], [100, 'T=100']].forEach(([n, s], i) => { const y = 130 + i * 56, w = E(u, 0.5 + i * 0.4, 1.0 + i * 0.4);
        mono(70, y + 20, s, { 'font-size': 15, 'font-weight': 700, opacity: w }); for (let j = 0; j < Math.min(n, 50); j++) el('rect', { x: 150 + j * 11, y: y + 4, width: 9, height: 22, rx: 2, fill: ACC, opacity: w * (j < 49 || n <= 50 ? 0.8 : 0.3) });
        if (n > 50) mono(150 + 50 * 11 + 8, y + 20, `… ${n}`, { 'font-size': 14, fill: MUT, opacity: w }); });
      card(700, 340, 360, 56, { rx: 12, stroke: GOOD, fill: GOODBG, text: '다음 장: 게이트로 소실을 막는 LSTM / GRU', fs: 15, color: GOOD, s: pop(u, 2.0) }); }
  }

  // ---------- 5. 활용 지도 ----------
  function cube(x, y, w, h, d, col, op, label, dims) { // 앞면 왼쪽 위 (x, y)
    el('path', { d: `M${x},${y} L${x + d},${y - d * 0.6} L${x + w + d},${y - d * 0.6} L${x + w},${y} Z`, fill: col, opacity: 0.25 * op, stroke: col, 'stroke-width': 1.5 });
    el('path', { d: `M${x + w},${y} L${x + w + d},${y - d * 0.6} L${x + w + d},${y + h - d * 0.6} L${x + w},${y + h} Z`, fill: col, opacity: 0.4 * op, stroke: col, 'stroke-width': 1.5 });
    el('rect', { x, y, width: w, height: h, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    if (label) mono(x + w / 2, y + h / 2 + 6, label, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: op });
    if (dims) mono(x + w / 2, y + h + 22, dims, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); }
  function mini(cx, cy, ins, outs, op, o) { o = o || {}; const n = 4, gap = 52, x0 = cx - (n - 1) * gap / 2;
    for (let i = 0; i < n; i++) { const x = x0 + i * gap, a = o.seq ? clamp(op * 4 - i) : op;
      card(x, cy, 40, 32, { rx: 6, stroke: ACC, fill: ACCBG, text: 'h', fs: 14, mono: true, op: a });
      if (i) grow(x - gap + 21, cy, x - 22, cy, a, ACC, { sw: 1.8 });
      if (ins[i]) { card(x, cy + 54, 34, 26, { rx: 5, stroke: WARN, text: 'x', fs: 14, mono: true, op: a }); grow(x, cy + 40, x, cy + 18, a, WARN, { sw: 1.8 }); }
      if (outs[i]) { card(x, cy - 54, 34, 26, { rx: 5, stroke: GOOD, fill: GOODBG, text: 'y', fs: 14, mono: true, op: a }); grow(x, cy - 17, x, cy - 40, a, GOOD, { sw: 1.8 }); }
      if (o.feed && i < n - 1) el('path', { d: `M${x + 17},${cy - 54} C${x + 40},${cy - 54} ${x + 40},${cy + 54} ${x + gap - 17},${cy + 54}`, fill: 'none', stroke: GOOD, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', opacity: a }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const g = E(u, 0.8, 1.8); for (let tt = 1; tt <= 4; tt++) card(lerp(CX(tt), 480, g), CY, CW, CH * (1 - 0.4 * g), { rx: 10, stroke: OFF, op: 1 - g, text: g < 0.4 ? 'cell' : '', fs: 15, mono: true });
      card(480, CY, 260, 80, { rx: 12, stroke: ACC, fill: ACCBG, text: 'nn.RNN(...)', fs: 20, mono: true, color: ACC, s: pop(u, 1.6) });
      note(480, 360, '직접 짠 forward 루프 = 라이브러리 한 줄', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { mono(70, 80, 'nn.RNN(input_size=16, hidden_size=32, batch_first=True)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      el('rect', { x: 120, y: 140, width: 16 * 5, height: 32 * 5, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.7) }); mono(160, 330, 'W_ih 32×16', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.8) });
      el('rect', { x: 260, y: 140, width: 32 * 5, height: 32 * 5, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.1) }); mono(340, 330, 'W_hh 32×32', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      note(500, 190, 'input_size = 입력 폭 (Wx)', fade(u, 1.5)); note(500, 230, 'hidden_size = h 차원 (Wh)', fade(u, 1.8), { fill: ACC });
      sub(500, 272, 'batch_first=True → (B, T, F) 순서', fade(u, 2.2), { 'text-anchor': 'start', 'font-size': 15 }); return; }
    if (k === 2 || k === 3) { cube(80, 160, 110, 140, 60, WARN, k === 2 ? fade(u, 0.2) : 1, 'x', '(8, 20, 16)'); sub(165, 345, 'batch · 길이 · 특징', k === 2 ? fade(u, 0.4) : 1, { 'font-size': 14 });
      card(400, 210, 130, 60, { rx: 10, stroke: ACC, fill: ACCBG, text: 'rnn', fs: 18, mono: true, s: k === 2 ? pop(u, 0.6) : 1 }); grow(260, 220, 334, 220, k === 2 ? E(u, 0.8, 1.2) : 1, MUT);
      const a = k === 2 ? E(u, 1.4, 2.0) : 1; grow(466, 200, 560, 150, a, ACC); grow(466, 230, 560, 300, a, ACC);
      cube(580, 110, 120, 100, 60, ACC, a, 'out', k === 3 ? '(8, 20, 32)' : null); cube(580, 280, 120, 40, 18, INFO, a, 'h_n', k === 3 ? '(1, 8, 32)' : null);
      if (k === 2) sub(480, 400, '길이 20 = 셀을 20번 호출한 결과', fade(u, 2.2), { 'font-size': 15 });
      if (k === 3) { mono(780, 160, '= history[1:]', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) }); sub(830, 186, '모든 스텝의 h', fade(u, 0.8), { 'font-size': 14 });
        mono(760, 306, '= history[-1]', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.3) }); sub(820, 332, '마지막 h', fade(u, 1.5), { 'font-size': 14 }); }
      return; }
    const M = [['many-to-one', [1, 1, 1, 1], [0, 0, 0, 1], '감성 분석 · 주가 예측', 'clf(h_n.squeeze(0))', ''],
      ['many-to-many', [1, 1, 1, 1], [1, 1, 1, 1], '품사 태깅 · 번역', 'tagger(out)', '→ (8, 20, 10)'],
      ['one-to-many', [1, 0, 0, 0], [1, 1, 1, 1], '캡셔닝 · 작곡', '출력을 다음 입력으로', '']];
    if (k >= 4 && k <= 6) { const j = k - 4;
      M.forEach(([nm, ins, outs, ex, code, sh], i) => { if (i > j) return; const cx = 170 + i * 310, cur = i === j, op = cur ? E(u, 0.2, 1.4) : 1;
        tx(cx, 80, nm, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: cur ? ACC : INK, opacity: cur ? fade(u, 0.2) : 0.75 });
        mini(cx, 210, ins, outs, op, { seq: cur, feed: i === 2 });
        tx(cx, 310, ex, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: cur ? fade(u, 1.5) : 0.75 });
        mono(cx, 340, code, { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: cur ? fade(u, 1.8) : 0.75 });
        if (sh) mono(cx, 364, sh, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: cur ? fade(u, 2.1) : 0.75 }); });
      return; }
    if (k === 7) { card(250, 190, 360, 200, { rx: 12, stroke: BAD, s: pop(u, 0.2) }); tx(250, 120, '① 기울기 소실', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) });
      mono(250, 190, '0.55³⁰ ≈ 1.6×10⁻⁸', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); sub(250, 230, '20~30 스텝 이상은 사실상 학습 불가', fade(u, 0.9), { 'font-size': 15 });
      card(710, 190, 360, 200, { rx: 12, stroke: WARN, s: pop(u, 1.2) }); tx(710, 120, '② 순차 계산', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.3) });
      for (let i = 0; i < 6; i++) { const a = clamp((u - 1.5) * 5 - i); el('rect', { x: 580 + i * 44, y: 175, width: 36, height: 30, rx: 5, fill: a > 0.99 ? WARN : SOFT, stroke: WARN, 'stroke-width': 1.5, opacity: fade(u, 1.4) }); }
      sub(710, 236, 'h_t 는 h_t−1 을 기다린다 — 병렬화 불가', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 8) { const g = E(u, 0.5, 1.4); card(480, 180, 300, 80, { rx: 12, stroke: OFF, text: 'nn.RNN', fs: 22, mono: true, color: MUT, op: 1 - g, s: 1 - 0.3 * g });
      card(480, 180, 300, 80, { rx: 12, stroke: GOOD, fill: GOODBG, text: 'nn.LSTM', fs: 22, mono: true, color: GOOD, op: g, s: 0.7 + 0.3 * g });
      sub(480, 250, '인자가 호환 — 그대로 갈아끼운다', fade(u, 1.5), { 'font-size': 15 });
      note(480, 330, '먼저 그린다: 입력이 시퀀스인가, 출력이 시퀀스인가', fade(u, 1.9), { 'text-anchor': 'middle' }); note(480, 362, '실무 기본값은 LSTM / GRU — 다음 장', fade(u, 2.3), { 'text-anchor': 'middle', fill: GOOD }); }
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '"개가 사람을 물었다"와 "사람이 개를 물었다"를 Bag-of-Words 빈도 벡터로 바꾸면?',
      o: ['서로 다른 벡터가 된다', '둘 다 [1, 1, 1]로 똑같아진다', '길이가 달라 비교할 수 없다'], a: 1,
      why: '빈도 표현은 위치를 기록하지 않아 순서가 사라진다. 입력이 같으면 어떤 모델을 얹어도 두 문장을 구분할 수 없다.' },
    { q: 'RNN을 시간축으로 펼쳤을 때 보이는 셀 4개는 무엇인가?',
      o: ['같은 Wx·Wh를 쓰는 셀 함수 하나를 네 번 부른 것', '서로 다른 가중치를 가진 층 4개', '시점 t를 인자로 받는 서로 다른 함수 4개'], a: 0,
      why: 'h_t = tanh(Wx·x_t + Wh·h_{t−1} + b)의 출력 h가 다음 호출의 h_prev로 되먹여진다. 그래서 파라미터 수는 시퀀스 길이와 무관하다.' },
    { q: '"영화가 정말 재미 있었다"를 읽을 때 은닉 상태 h가 크게 뛰는 곳과 그 이유는?',
      o: ['"영화가" — 첫 단어를 그대로 저장해서', '"있었다" — 마지막 단어만 반영해서', '"재미" — h가 읽은 내용의 누적 요약이라서'], a: 2,
      why: '중립어 "영화가"에서는 [+0.08, +0.05]로 거의 0이고 긍정어 "재미"에서 [+0.71, +0.57]로 뛴다. 마지막 h 하나로 긍정 확률 0.88을 낸다.' },
    { q: 'BPTT에서 한 칸 과거로 거슬러 갈 때마다 기울기에 일어나는 일은?',
      o: ['Wh.T·tanh′ 이 한 번 더 곱해진다', '기울기가 1로 다시 초기화된다', 'Wx 가 한 번 더 더해진다'], a: 0,
      why: 'dh = Wh.T @ da 로 곱셈 사슬이 쌓인다. 배율이 0.55라면 3칸 전 기여는 0.17배, 30칸이면 1.6e-8로 사실상 0이다.' },
    { q: 'nn.RNN의 두 출력 중 감성 분석(many-to-one)에 쓰는 것은?',
      o: ['out — 모든 스텝의 h', 'h_n — 마지막 스텝의 h', '입력 텐서를 그대로'], a: 1,
      why: 'h_n은 (1, 8, 32)로 마지막 h(history[-1])다. 이걸 Linear에 넣으면 문장 하나를 분류하고, out을 통째로 쓰면 스텝마다 태그를 내는 many-to-many가 된다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '단어 빈도 벡터는 순서를 버린다. 어순만 다른 두 문장이 똑같은 입력이 된다.',
    'RNN은 새 입력과 직전 h를 섞어 새 h를 만들고, 그 h를 다음 스텝에 다시 넣는다.',
    '모든 스텝이 같은 Wx, Wh를 쓴다. 마지막 h 하나로 문장 전체의 감성을 판정할 수 있다.',
    '학습은 BPTT로 한다. 한 칸 거슬러 갈 때마다 Wh·tanh′가 곱해져 먼 과거의 기울기가 줄어든다.',
  ];
  const review = [
    { q: 'RNN의 마지막 h를 문장 표현으로 쓰면 빈도 벡터와 달리 어순을 구분할 수 있다. 그 이유는?',
      o: ['h가 단어를 위치별 칸에 따로 저장해서', 'h가 읽는 순서대로 갱신되어 순서가 결과에 섞여서', '어휘 수를 줄여 벡터가 짧아져서'], a: 1,
      why: '같은 단어라도 어떤 h 위에 들어오느냐에 따라 새 h가 달라진다. h는 단어를 칸별로 저장하지 않고, 읽은 순서까지 섞인 요약을 들고 다닌다.' },
    { q: '300단어 리뷰로 감성 분류 RNN을 학습했더니 첫머리의 결정적 단어를 반영하지 못한다. 먼저 의심할 것은?',
      o: ['먼 시점까지 곱셈이 쌓여 기울기가 거의 0이 됐다', '파라미터 수가 문장 길이만큼 늘어나 과적합됐다', 'tanh가 h를 −1~1로 눌러 마지막 h가 너무 작아졌다'], a: 0,
      why: 'BPTT에서 먼 시점일수록 곱해지는 항이 늘어나 기울기가 기하급수로 줄어든다. 가중치를 공유하므로 파라미터 수는 길이와 무관하다.' },
    { q: 'nn.RNN에 3단어 문장과 300단어 문장을 각각 넣었다. 맞는 설명은?',
      o: ['300단어 쪽 모델의 파라미터가 훨씬 많다', 'h_n의 크기가 문장 길이에 비례해 커진다', '파라미터 수는 같고, out의 시간 축 길이만 다르다'], a: 2,
      why: '셀 하나를 길이만큼 반복 호출하므로 가중치 수는 같다. out은 스텝마다 h를 모아 길이가 달라지고, h_n은 마지막 h 하나라 크기가 일정하다.' },
  ];

  RA.page({ title: 'RNN — 셀 사슬과 은닉 상태 h', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
