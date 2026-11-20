/* II-1-2 패딩·스트라이드·풀링 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 출력 크기 = 창의 좌상단이 "밟을 수 있는 발자국" 개수. 발자국(점)을 세면 공식이 된다.
 * 격자·계산기·풀링·shape 표 숫자는 페이지 STEPS 의 viz 데이터와 코드 실행 출력(벤브 torch 로 확인)에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, cross, check, heat } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, WARNBG, INFO, INFOBG, HL } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 700, opacity: op }, a || {}));
  const V = (c) => (c && c.beat && c.beat.viz) || {};

  // ---------- 공통: 입력 격자 (패딩 테두리 + 커널 창 + 발자국 점) ----------
  function anchorsOf(g) { const tot = g.size + 2 * g.pad, A = []; for (let r = 0; r <= tot - g.kernel; r += g.stride) for (let c = 0; c <= tot - g.kernel; c += g.stride) A.push([r, c]); return A; }
  function grid(x, y, g, cs, o) { o = o || {}; const tot = g.size + 2 * g.pad, [kr, kc] = o.kp || g.kernelPos, hot = g.tone === 'rose' ? ACC : INK, A = anchorsOf(g);
    for (let r = 0; r < tot; r++) for (let c = 0; c < tot; c++) { const pad = r < g.pad || c < g.pad || r >= tot - g.pad || c >= tot - g.pad, op = o.cellOp ? o.cellOp(r, c, pad) : 1;
      if (op <= 0) continue;
      el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 3, fill: pad ? WARNBG : PANEL, stroke: pad ? WARN : GRID, 'stroke-width': 1.5, 'stroke-dasharray': pad ? '3 3' : null, opacity: op });
      if (pad && cs >= 24) mono(x + c * cs + (cs - 3) / 2, y + r * cs + cs / 2 + 3, '0', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: op });
      if (o.lost && o.lost(r, c)) el('rect', { x: x + c * cs + 2, y: y + r * cs + 2, width: cs - 7, height: cs - 7, rx: 2, fill: 'var(--badbg)', stroke: BAD, 'stroke-width': 2, opacity: op }); }
    if (o.dots !== false) A.forEach(([r, c], i) => el('circle', { cx: x + c * cs + (cs - 3) / 2, cy: y + r * cs + (cs - 3) / 2, r: 3.5, fill: hot, opacity: o.dotOp != null ? o.dotOp(i) : 0.7 }));
    if (o.win !== false) el('rect', { x: x + kc * cs - 3, y: y + kr * cs - 3, width: g.kernel * cs + 3, height: g.kernel * cs + 3, rx: 5, fill: hot, 'fill-opacity': 0.16, stroke: hot, 'stroke-width': 3.5 });
    return { A, tot }; }
  function outGrid(x, y, n, cs, filled, col) { for (let i = 0; i < n * n; i++) { const r = Math.floor(i / n), c = i % n, on = i < filled;
      el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 3, fill: on ? col : PANEL, 'fill-opacity': on ? 0.75 : 1, stroke: on ? col : OFF, 'stroke-dasharray': on ? null : '3 3', 'stroke-width': 1.5 }); } }
  function panel(x, g, cs, ocs, o) { o = o || {}; const { A, tot } = grid(x, 80, g, cs, o), col = g.tone === 'rose' ? ACC : INK;
    lbl(x + (tot * cs) / 2, 62, g.label, o.lop ?? 1, { fill: col, 'font-size': 15 });
    const ox = x + tot * cs + 30, oy = 80 + (tot * cs - g.out * ocs) / 2; grow(ox - 24, 80 + (tot * cs) / 2, ox - 6, 80 + (tot * cs) / 2, 1, MUT, { sw: 1.8 });
    outGrid(ox, oy, g.out, ocs, o.filled ?? g.out * g.out, col); mono(ox + (g.out * ocs) / 2, oy + g.out * ocs + 20, `${g.out}×${g.out}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col });
    sub(x + (tot * cs) / 2 + 60, 80 + tot * cs + 50, g.note, o.nop ?? 1, { 'font-size': 14 }); return A; }

  // ---------- 1. 패딩 ----------
  function s1(t, c) { const { k, u } = c, G = V(c).grids || [];
    if (k === 3) { // valid 로 깊게: 5 → 3 → 1 → ✗
      [[5, 0.2], [3, 0.8], [1, 1.4]].forEach(([n, a], i) => { const x = 80 + i * 230, s = pop(u, a), cs = 26;
        for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) el('rect', { x: x + q * cs + (5 - n) * cs / 2, y: 120 + r * cs + (5 - n) * cs / 2, width: cs - 3, height: cs - 3, rx: 3, fill: PANEL, stroke: INK, 'stroke-width': 1.5, opacity: s });
        mono(x + 64, 280, `${n}×${n}`, { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); mono(x + 64, 306, `layer ${i}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: i ? s : 0 });
        if (i < 2) grow(x + 150, 185, x + 205, 185, E(u, a + 0.3, a + 0.6), MUT); });
      const s4 = pop(u, 2.0); el('rect', { x: 770, y: 146, width: 75, height: 75, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '5 4', opacity: s4 }); el('rect', { x: 796, y: 172, width: 23, height: 23, rx: 3, fill: PANEL, stroke: INK, 'stroke-width': 1.5, opacity: s4 });
      cross(808, 128, 12, s4); sub(808, 260, '3×3 커널이 1×1 에 안 들어간다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD });
      note(80, 370, '층마다 −2 → 두 층 만에 1×1, 세 번째 층은 불가', fade(u, 2.3), { fill: BAD }); return; }
    if (k === 4) { R.terminal(80, 60, 520, 170, [['$ python cnn_shapes.py', null], ['torch.Size([1, 8, 3, 3])', null], ['torch.Size([1, 8, 5, 5])', null], ['layer 1: (3, 3)', null], ['layer 2: (1, 1)', null]], 1 + 4 * E(u, 0.3, 1.8), { title: 'output' });
      card(780, 140, 230, 54, { rx: 10, stroke: BAD, text: '다음 층 → 불가', fs: 18, color: BAD, s: pop(u, 2.0) });
      sub(340, 280, '"kernel size can\'t be greater than actual input size"', fade(u, 2.2), { 'font-size': 14.5, class: 'mono', fill: BAD }); return; }
    if (k === 5) { // 커널이 각 픽셀을 밟는 횟수: valid vs same (공식으로 센 값)
      const cnt = (n, pad) => Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, q) => { const f = (i) => { let m = 0; for (let a = 0; a <= n + 2 * pad - 3; a++) if (a <= i + pad && i + pad <= a + 2) m++; return m; }; return f(r) * f(q); }));
      const A = cnt(5, 0), B = cnt(5, 1);
      heat(70, 80, A, 50, { max: 9, fs: 16 }); lbl(195, 62, 'valid — 몇 번 밟히나', fade(u, 0.2));
      heat(560, 80, B, 50, { max: 9, fs: 16, col: INFO }); lbl(685, 62, 'same (P=1)', fade(u, 1.2), { fill: INFO });
      el('rect', { x: 66, y: 76, width: 55, height: 55, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: pop(u, 0.8) });
      el('rect', { x: 556, y: 76, width: 55, height: 55, rx: 6, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: pop(u, 1.6) });
      sub(195, 360, '모서리 1번 · 중앙 9번', fade(u, 0.9), { 'font-size': 15.5, fill: BAD }); sub(685, 360, '모서리 4번 · 중앙 9번', fade(u, 1.7), { 'font-size': 15.5, fill: INFO });
      note(330, 400, '패딩이 가장자리 손해를 줄인다', fade(u, 2.2), { fill: ACC }); return; }
    const two = G.length > 1;
    G.forEach((g, i) => { const x = two ? 14 + i * 470 : 200, isNew = !(c.prev && V(c.prev).grids && V(c.prev).grids[i]) || k === 0;
      let kp = g.kernelPos, filled, cellOp, nop = 1, lop = 1;
      if (k === 0) { cellOp = (r, q) => pop(u, 0.2 + (r + q) * 0.08); filled = 0; nop = fade(u, 1.8); }
      if (k === 1 && i === 0) { const p = clamp((u - 0.3) / 2.0) * 8.999, j = Math.floor(p); kp = [Math.floor(j / 3), j % 3]; filled = j + 1; }
      if (k === 2 && i === 1) { cellOp = (r, q, pad) => (pad ? pop(u, 0.3 + ((r * 7 + q) % 9) * 0.06) : 1); filled = Math.round(25 * E(u, 1.2, 2.2)); lop = fade(u, 0.2); nop = fade(u, 2.2); }
      panel(x, g, two ? 30 : 44, two ? 20 : 34, { kp, filled, cellOp, nop, lop }); });
    if (k === 0) sub(480, 400, '(batch, channel, H, W) = (1, 1, 5, 5)', fade(u, 2.0), { 'font-size': 15, class: 'mono' });
    if (k === 1) sub(480, 400, '좌상단이 밟는 마지막 자리 = (2,2) → 3×3', fade(u, 2.3), { 'font-size': 15 });
    if (k === 2) sub(480, 400, 'K=3 이면 P=(K−1)/2=1 이 same', fade(u, 2.3), { 'font-size': 15, fill: ACC }); }

  // ---------- 2. 스트라이드 ----------
  function strideBars(rows, u, isNewRow) { tx(640, 290, '연산량 (stride=1 = 100%)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const y = 306 + i * 34, f = isNewRow(r) ? E(u, 0.8, 1.6) : 1; mono(640, y + 16, `s=${r.s}`, { 'font-size': 14, 'font-weight': 700, opacity: f > 0 ? 1 : 0 });
      R.hbar(692, y, 160, r.cost, 100, { u: f, col: r.s === 1 ? INK : ACC, text: `${r.cost}%` }); }); }
  function s2(t, c) { const { k, u } = c, vz = V(c), G = vz.grids || [], rows = (vz.strideBar || {}).rows || [], prow = ((V(c.prev).strideBar || {}).rows || []);
    const isNewRow = (r) => !prow.some((q) => q.s === r.s);
    if (k === 3) { // 7×7, stride 2 — 나눠떨어져 끝까지 덮는다
      const g = { label: '7×7 · stride=2', size: 7, pad: 0, kernel: 3, stride: 2, kernelPos: [0, 0], out: 3, tone: 'rose', note: '(7−3)/2 = 2 · 딱 맞음' };
      const p = clamp((u - 0.3) / 1.8) * 8.999, j = Math.floor(p), kp = [2 * Math.floor(j / 3), 2 * (j % 3)];
      const cov = (r, q) => { for (let a = 0; a <= j; a++) { const ar = 2 * Math.floor(a / 3), ac = 2 * (a % 3); if (r >= ar && r < ar + 3 && q >= ac && q < ac + 3) return true; } return false; };
      grid(60, 80, g, 34, { kp, cellOp: () => 1 }); for (let r = 0; r < 7; r++) for (let q = 0; q < 7; q++) if (cov(r, q)) el('rect', { x: 60 + q * 34 + 4, y: 80 + r * 34 + 4, width: 23, height: 23, rx: 3, fill: ACC, opacity: 0.18 });
      lbl(179, 62, g.label, 1, { fill: ACC }); outGrid(370, 130, 3, 34, j + 1, ACC);
      mono(400, 330, 'print(s2(x7).shape) → [1, 8, 3, 3]', { 'font-size': 15, opacity: fade(u, 1.6) });
      note(400, 370, '(7−3)/2+1 = 3 — 끝 열까지 모든 칸이 창에 들어간다', fade(u, 2.2), { fill: GOOD }); return; }
    const two = G.length > 1;
    G.forEach((g, i) => { const x = two ? 20 + i * 330 : 60; let kp = g.kernelPos, filled, lost, dotOp;
      if (k === 0) dotOp = (a) => fade(u, 0.4 + a * 0.1);
      if (k === 1 && i === 0) { const p = clamp((u - 0.3) / 2.0) * 3.999; kp = [0, Math.floor(p)]; filled = Math.floor(p) + 1; }
      if (k === 2 && i === 1) { const p = clamp((u - 0.3) / 1.6) * 3.999, j = Math.floor(p); kp = [2 * Math.floor(j / 2), 2 * (j % 2)]; filled = j + 1; }
      if ((k === 4 || k === 5) && g.stride === 2) lost = (r, q) => (r === 5 || q === 5) && (k === 5 || fade(u, 0.8) > 0.5);
      const { tot } = grid(x, 80, g, 30, { kp, dotOp, lost }), col = g.tone === 'rose' ? ACC : INK;
      lbl(x + 90, 62, g.label, 1, { fill: col, 'font-size': 14.5 });
      outGrid(x + 200, 110, g.out, g.out > 2 ? 26 : 36, filled ?? g.out * g.out, col); mono(x + 200 + (g.out > 2 ? 52 : 36), 240, `${g.out}×${g.out}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col });
      sub(x + 140, 280, g.note, 1, { 'font-size': 13.5 }); });
    if (rows.length) strideBars(rows, u, isNewRow);
    if (k === 0) note(60, 330, '점 = 창의 좌상단이 놓일 수 있는 자리', fade(u, 1.6));
    if (k === 1) mono(60, 330, '(6 − 3) / 1 + 1 = 4  → 16곳', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
    if (k === 2) mono(60, 330, '(6 − 3) / 2 + 1 = 2  → 4곳', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
    if (k === 4) { note(40, 330, '6×6 · stride 2: (6−3)/2 = 1.5 → floor', fade(u, 0.6), { fill: BAD }); sub(250, 360, '빨간 칸 = 어떤 창에도 안 들어가는 6번째 행·열', fade(u, 1.2), { 'font-size': 14.5, fill: BAD });
      sub(250, 390, 's=3 은 (6−3)/3 = 1 로 딱 맞아 버리는 칸 없음', fade(u, 1.9), { 'font-size': 14 }); }
    if (k === 5) { note(40, 330, '출력 위치 수 16 → 4', fade(u, 0.4)); note(40, 362, '= 그 층의 곱셈-덧셈도 약 1/4', fade(u, 1.0), { fill: ACC }); } }

  // ---------- 3. 출력 크기 공식 ----------
  const TERMS = ['I + 2P', '− K', '÷ S', '+ 1'];
  function s3(t, c) { const { k, u } = c, vz = V(c), cv = vz.calc || {}, pv = V(c.prev).calc || cv, fb = (vz.formulaBox || {}).rows || [];
    const I = cv.I, K = cv.K, P = cv.P, S = cv.S, span = I + 2 * P - K, ok = span >= 0, exact = ok && span % S === 0, O = ok ? Math.floor(span / S) + 1 : null;
    const ch = pv.I !== I || pv.K !== K || pv.P !== P || pv.S !== S;
    // 공식 머리: 항이 하나씩 켜진다
    const n = fb.length; let x = 70; mono(x, 64, 'O =', { 'font-size': 22, 'font-weight': 800 }); x += 60;
    ['(', 'I + 2P', ' − K', ')', ' / S', ' + 1'].forEach((s, i) => { const ti = s.includes('2P') ? 0 : s.includes('K') ? 1 : s.includes('S') ? 2 : s.includes('1') ? 3 : -1, on = ti < 0 ? n >= 1 : ti < n, hot = ti === n - 1 && k <= 4;
      mono(x, 64, s, { 'font-size': 22, 'font-weight': 800, fill: hot ? ACC : on ? INK : OFF, opacity: hot && k === n - 1 ? 0.4 + 0.6 * fade(u, 0.3) : 1 }); x += tw(s, 22) + 2; });
    if (fb.length && k <= 4) { const r = fb[fb.length - 1]; tx(560, 58, r.mean, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) }); tx(560, 82, r.why, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) }); }
    // 1차원 띠: 패딩 + 입력, 창의 좌상단 발자국
    const tot = I + 2 * P, cw = Math.min(30, 860 / Math.max(tot, K)), x0 = 480 - (tot * cw) / 2, y0 = 130, g = ch ? E(u, 0.2, 0.9) : 1;
    for (let i = 0; i < tot; i++) { const pad = i < P || i >= tot - P; el('rect', { x: x0 + i * cw, y: y0, width: cw - 2, height: 30, rx: 3, fill: pad ? WARNBG : PANEL, stroke: pad ? WARN : GRID, 'stroke-dasharray': pad ? '3 3' : null, 'stroke-width': 1.5, opacity: g }); }
    mono(480, y0 - 10, `I=${I}  K=${K}  P=${P}  S=${S}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ch ? ACC : MUT });
    if (!ok) { el('rect', { x: x0, y: y0 + 40, width: K * cw - 2, height: 26, rx: 4, fill: 'var(--badbg)', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.8) });
      mono(x0 + K * cw + 12, y0 + 59, `창 K=${K} > 폭 ${tot}`, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); }
    else { const steps = Math.floor(span / S), f = clamp((u - 0.9) / 1.4) * (steps + 0.999), j = Math.min(steps, Math.floor(f));
      el('rect', { x: x0 + j * S * cw - 1, y: y0 - 3, width: K * cw, height: 36, rx: 5, fill: ACC, 'fill-opacity': 0.15, stroke: ACC, 'stroke-width': 3 });
      for (let a = 0; a <= j; a++) el('circle', { cx: x0 + a * S * cw + cw / 2 - 1, cy: y0 + 50, r: 4.5, fill: ACC });
      if (!exact) for (let i = (steps * S) + K; i < tot; i++) el('rect', { x: x0 + i * cw + 2, y: y0 + 2, width: cw - 6, height: 26, rx: 2, fill: 'var(--badbg)', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 2.0) });
      mono(480, y0 + 84, `발자국 ${j + 1} / ${O}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }); }
    // 계산 줄
    const eq = `O = (${I} + 2·${P} − ${K}) / ${S} + 1 = ${ok ? O : '불가'}`;
    card(480, 266, tw(eq, 19) + 40, 50, { rx: 12, stroke: !ok ? BAD : !exact ? WARN : ACC, text: eq, fs: 19, mono: true, color: !ok ? BAD : INK, s: pop(u, 0.4) });
    const flag = !ok ? ['ValueError: kernel > input', BAD] : !exact ? [`[warn] (${I}+2*${P}-${K})%${S}!=0 — 끝자락 버림`, WARN] : K === 3 && P === 1 && S === 1 ? ['same 조합: 출력 = 입력', GOOD] : null;
    if (flag) pill(480, 320, flag[0], flag[1], pop(u, 1.4), { fs: 14.5, mono: !ok || !exact });
    if (k >= 5) { const AS = [[5, 3, 0, 1, 3], [5, 3, 1, 1, 5], [6, 3, 0, 2, 2], [7, 3, 0, 2, 3], [28, 3, 1, 1, 28]], show = k === 5 ? 3 : 5;
      AS.slice(0, show).forEach(([i, kk, p, s, o], q) => { const a = k === 5 ? 0.6 + q * 0.4 : q < 3 ? 0 : 0.6 + (q - 3) * 0.5;
        mono(60 + q * 180, 375, `conv_out(${i},${kk},${p},${s})=${o}`, { 'font-size': 13.5, opacity: a ? fade(u, a) : 1 }); check(60 + q * 180 + 170, 392, 7, a ? pop(u, a + 0.2) : 1); }); } }

  // ---------- 4. 풀링 ----------
  const QC = [ACC, INFO, GOOD, WARN];
  function s4(t, c) { const { k, u } = c, pl = V(c).pool || {}, IN = pl.input || [[0]], MX = pl.maxOut || [[0]], AV = pl.avgOut || [[0]];
    const ix = 60, iy = 80, cs = 58, q = (r, cc) => Math.floor(r / 2) * 2 + Math.floor(cc / 2), isMax = (r, cc) => IN[r][cc] === MX[Math.floor(r / 2)][Math.floor(cc / 2)];
    if (k !== 4 && k !== 5) {
      IN.forEach((row, r) => row.forEach((v, cc) => { const s = k === 0 ? pop(u, 0.2 + (r * 4 + cc) * 0.07) : 1, mx = k >= 2 && isMax(r, cc), col = QC[q(r, cc)];
        let val = v; if (k === 3 && r >= 2 && cc >= 2) { const pos = Math.floor(clamp((u - 0.4) / 1.6) * 3.999), QV = [9, 4, 8, 3], ring = [[2, 2], [2, 3], [3, 3], [3, 2]], idx = ring.findIndex(([a, b]) => a === r && b === cc); val = QV[(idx - pos + 4) % 4]; }
        card(ix + cc * cs + 27, iy + r * cs + 27, cs - 4, cs - 4, { rx: 5, fill: PANEL, stroke: col, sw: mx || (k === 3 && val === 9) ? 3.5 : 1.8, text: String(val), fs: 18, mono: true, color: (k === 3 ? val === 9 : mx) ? col : INK, s }); }));
      lbl(ix + 115, iy - 16, '입력 4×4 (색 = 풀링 구역)', 1);
      if (k === 0) { sub(ix + 115, iy + 262, 'torch.tensor (1, 1, 4, 4)', fade(u, 1.6), { 'font-size': 14.5, class: 'mono' }); note(420, 190, '색이 다른 2×2 구역 네 개', fade(u, 1.8)); return; }
      if (k === 1) { const j = Math.floor(clamp((u - 0.3) / 1.8) * 3.999); el('rect', { x: ix + 2 * cs * (j % 2) - 4, y: iy + 2 * cs * Math.floor(j / 2) - 4, width: 2 * cs + 4, height: 2 * cs + 4, rx: 7, fill: 'none', stroke: INK, 'stroke-width': 4 });
        mono(420, 150, 'MaxPool2d(kernel_size=2, stride=2)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(420, 180, 'AvgPool2d(kernel_size=2, stride=2)', { 'font-size': 16, opacity: fade(u, 0.6) });
        mono(420, 250, 'O = (4 + 0 − 2) / 2 + 1 = 2 = I/2', { 'font-size': 17, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); sub(620, 290, '창 = 보폭 → 겹침 0', fade(u, 2.0), { 'font-size': 15 }); return; }
      const out = (x, y, M, title, strong, a) => { lbl(x + 58, y - 14, title, fade(u, a), { fill: strong ? ACC : MUT });
        M.forEach((row, r) => row.forEach((v, cc) => card(x + cc * 60 + 28, y + r * 60 + 28, 56, 56, { rx: 5, fill: strong ? ACCBG : PANEL, stroke: QC[r * 2 + cc], sw: 2.5, text: String(v), fs: strong ? 20 : 17, mono: true, color: strong ? INK : MUT, s: k === 2 ? pop(u, a + (r * 2 + cc) * 0.15) : 1 }))); };
      grow(310, 196, 390, 196, 1, MUT);
      out(420, 90, MX, 'max — 최댓값', true, 0.3);
      if (k === 2) { out(690, 90, AV, 'avg — 평균', false, 1.2); sub(690 + 58, 248, '(9+4+3+8)/4 = 6.0', fade(u, 2.0), { 'font-size': 14.5, class: 'mono' }); return; }
      if (k === 3) { note(420, 290, '9 가 구역 안 어디에 있든', fade(u, 0.5)); note(420, 320, 'max 출력은 그대로 9', fade(u, 1.6), { fill: ACC }); sub(560, 360, '(9 의 자리를 옮겨 본 예시) → 1~2px 이동에 불변', fade(u, 2.0), { 'font-size': 14 }); return; } }
    if (k === 4) { // 파라미터 0 — conv 와 나란히
      card(240, 150, 260, 120, { rx: 14, stroke: ACC, text: 'MaxPool2d(2)', fs: 18, mono: true, color: ACC, s: pop(u, 0.2) });
      mono(240, 250, 'parameters: 0', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) });
      heat(600, 100, [[0.3, -0.6, 0.2], [0.8, 0.1, -0.4], [-0.2, 0.5, 0.7]], 40, { max: 1, fmt: () => 'w', col: INFO }); lbl(658, 86, 'Conv 3×3', fade(u, 1.2), { fill: INFO });
      mono(658, 250, '학습할 가중치가 있다', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      note(160, 340, '풀링은 배울 게 없는 순수 요약 — 공간 1/4 를 공짜로', fade(u, 2.0)); return; }
    // k5 stride=2 conv 로 대체
    const g = { label: 'Conv2d(1,1,3, stride=2, padding=1)', size: 4, pad: 1, kernel: 3, stride: 2, kernelPos: [0, 0], out: 2, tone: 'rose', note: '' };
    const j = Math.floor(clamp((u - 0.3) / 1.6) * 3.999); grid(80, 80, g, 40, { kp: [2 * Math.floor(j / 2), 2 * (j % 2)] }); lbl(200, 62, g.label, 1, { fill: ACC, class: 'mono' });
    outGrid(400, 140, 2, 50, j + 1, ACC); mono(450, 270, '(4 + 2 − 3) / 2 + 1 = 2', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    note(560, 160, '풀링처럼 2×2 로 줄이지만', fade(u, 1.2)); note(560, 196, '"어떻게 줄일지" 가중치를 학습한다', fade(u, 1.7), { fill: ACC }); sub(720, 250, 'print(down(x).shape) → [1, 1, 2, 2]', fade(u, 2.1), { 'font-size': 14, class: 'mono' }); }

  // ---------- 5. 미니 CNN ----------
  const BX = [40, 165, 290, 405, 530, 640, 735, 840];
  function block(i, row, op, hot) { const x = BX[i], sh = String(row.shape).split('×').map(Number);
    if (sh.length === 3) { const [chn, h] = sh, side = h * 3.4, n = Math.min(5, Math.max(1, Math.round(chn / 12))), cy = 150;
      for (let s = n - 1; s >= 0; s--) el('rect', { x: x + s * 4, y: cy - side / 2 - s * 4, width: side, height: side, rx: 3, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : INK, 'stroke-width': hot ? 2.4 : 1.5, opacity: op }); }
    else { const n = sh[0], h = Math.min(190, 30 + Math.log2(n) * 14); el('rect', { x: x + 20, y: 150 - h / 2, width: 16, height: h, rx: 3, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : INK, 'stroke-width': hot ? 2.4 : 1.5, opacity: op }); }
    mono(x + 30, 268, row.shape, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: hot ? ACC : INK, opacity: op });
    if (row.params) mono(x + 30, 290, row.params.toLocaleString(), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
  const SHORT = ['입력', 'conv1', 'pool1', 'conv2', 'pool2', 'flatten', 'fc1', 'fc2'];
  function s5(t, c) { const { k, u } = c, fl = V(c).flow || {}, rows = fl.rows || [], prev = ((V(c.prev).flow || {}).rows || []).length;
    rows.forEach((r, i) => { const nw = i >= prev && k <= 4, op = nw ? fade(u, 0.3 + (i - prev) * 0.4) : 1; block(i, r, op, nw);
      tx(BX[i] + 30, 46, SHORT[i], { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: op });
      if (i) grow(BX[i - 1] + 66, 300, BX[i] - 6, 300, nw ? E(u, 0.2 + (i - prev) * 0.4, 0.5 + (i - prev) * 0.4) : 1, OFF, { sw: 1.5, plain: true }); });
    if (k <= 4) { const r = rows[rows.length - 1]; mono(60, 345, `${r.layer}`, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(60, 375, `${r.formula}  →  ${r.shape}`, { 'font-size': 15, fill: ACC, opacity: fade(u, 1.3) });
      const tot = fl.total || 0; mono(900, 375, `합계 ${tot.toLocaleString()}`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.8) });
      if (k === 3) sub(700, 345, 'Linear 한 줄 = 전체의 95%', fade(u, 2.0), { 'font-size': 15, fill: BAD }); return; }
    if (k === 5) { const d = E(u, 0.4, 2.4) * 7; el('circle', { cx: BX[Math.min(7, Math.floor(d))] + 30 + (d % 1) * 100, cy: 330, r: 8, fill: ACC });
      mono(60, 375, 'model = MiniCNN();  x = torch.randn(1, 1, 28, 28)', { 'font-size': 15, opacity: fade(u, 0.3) }); return; }
    if (k === 6 || k === 7) { const L = [' 0 Conv2d    (1, 32, 28, 28)', ' 1 ReLU      (1, 32, 28, 28)', ' 2 MaxPool2d (1, 32, 14, 14)', ' 3 Conv2d    (1, 64, 14, 14)', ' 4 ReLU      (1, 64, 14, 14)', ' 5 MaxPool2d (1, 64, 7, 7)'];
      R.terminal(470, 296, 470, 124, L.map((s, i) => [s, k === 7 && i === 5 ? 'var(--newbg)' : null]), k === 6 ? 1 + 5 * E(u, 0.3, 2.2) : 6, { lh: 14, fs: 13.5 });
      if (k === 6) { mono(40, 345, 'for name, layer in', { 'font-size': 14.5, opacity: fade(u, 0.2) }); mono(40, 368, '    model.features.named_children():', { 'font-size': 14.5, opacity: fade(u, 0.2) }); mono(40, 391, '    h = layer(h); print(name, h.shape)', { 'font-size': 14.5, opacity: fade(u, 0.4) }); }
      else { mono(40, 350, '64 × 7 × 7 = 3136', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) }); check(270, 344, 10, pop(u, 1.0)); sub(200, 384, '= Linear(3136, 128) 의 입력 폭', fade(u, 1.4), { 'font-size': 14.5 }); }
      return; }
    // k8 파라미터 합계
    const P = [['conv 2층', 18816, MUT], ['Linear 3136→128', 401536, BAD], ['Linear 128→10', 1290, INFO]], tot = 421642; let x = 60;
    P.forEach(([n, v, col], i) => { const w = Math.max(4, 840 * v / tot * E(u, 0.3 + i * 0.3, 0.9 + i * 0.3)); el('rect', { x, y: 322, width: w, height: 30, fill: col, opacity: 0.8 }); x += 840 * v / tot; });
    mono(60, 378, 'conv 18,816', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) }); mono(480, 345, 'Linear(3136→128) 401,536 = 95%', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    mono(900, 400, 'total params: 421,642', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.8) }); }

  RA.page({ title: '출력 크기 산수 — 발자국 세기', scenes: [s1, s2, s3, s4, s5] });
})();
