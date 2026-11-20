/* V-2-1 GPU·혼합정밀·배치 크기 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: GPU 메모리 = 오른쪽에 세운 "VRAM 기둥"(24GB 선), 덩어리(파라미터·기울기·Adam·활성값)가 쌓였다 빠진다.
 * 숫자는 STEPS 데이터(mem.segs, gauges, batchTable, flow, compare)와 caption 에서만 읽는다.
 * 가동률·처리량(img/s)·행렬곱 ms 는 페이지의 예시 시나리오 값이라 그림에도 "예시"로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone, cross, check, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const SEGC = [ACC, WARN, INFO, GOOD];   // 파라미터 · 기울기 · Adam 상태 · 활성값
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op }, a || {}));
  const tag = (x, y, s, op) => tx(x, y, s, { 'font-size': 13.5, fill: MUT, opacity: op, 'font-style': 'italic' });

  // ---------- VRAM 기둥: segs 를 아래부터 쌓는다. 앞 beat 값에서 이어진다 ----------
  function vram(segs, prev, u, o) { o = o || {};
    const x = o.x ?? 870, y = o.y ?? 56, h = o.h ?? 300, W = o.w ?? 56, MAX = o.max ?? 30, cap = o.cap ?? 24, base = y + h, sc = (g) => (g / MAX) * h;
    el('rect', { x, y, width: W, height: h, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    let acc = 0; const labs = [];
    (segs || []).forEach((s, i) => { const p = prev && prev[i] ? prev[i].gb : o.from0 ? 0 : s.gb, g = Math.max(0, tween(p, s.gb, u)), hh = sc(Math.min(g, MAX - acc));
      if (hh > 0.4) el('rect', { x: x + 3, y: base - sc(acc) - hh, width: W - 6, height: hh, rx: 3, fill: SEGC[i % 4], opacity: 0.85 });
      if (g > 0.05 || s.gb > 0.05) labs.push({ y: base - sc(acc + g / 2), s: `${s.name} ${g.toFixed(1)}`, col: SEGC[i % 4], op: g > 0.05 ? 1 : 0.45 });
      acc += g; });
    // 이름표: 아래부터, 18px 간격 이상 벌린다
    let last = 1e9; labs.forEach((L) => { const yy = Math.min(L.y + 5, last - 18); last = yy; tx(x - 10, yy, L.s, { 'font-size': 13.5, 'font-weight': 700, fill: L.col, 'text-anchor': 'end', opacity: L.op }); });
    const cy = base - sc(cap); el('line', { x1: x - 6, y1: cy, x2: x + W + 6, y2: cy, stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
    mono(x + W / 2, base + 22, `${cap}GB`, { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
    const over = acc > cap + 0.01;
    if (over) el('rect', { x: x - 2, y: base - sc(Math.min(acc, MAX)), width: W + 4, height: sc(Math.min(acc, MAX)) - sc(cap), rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 3 });
    mono(x + W / 2, y - 12, `${acc.toFixed(1)} GB`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: over ? BAD : INK });
    if (o.title) tx(x + W / 2, base + 42, o.title, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 });
    return acc; }
  const memOf = (b) => (b && b.mem ? b.mem.segs : null);
  const gauge = (b, re) => ((b && b.gauges) || []).find((g) => re.test(g.label));

  // 작은 텐서 격자 (파라미터·기울기·m·v 를 같은 모양으로 그린다)
  function grid(x, y, cols, rows, col, u, o) { o = o || {}; const cs = o.cs || 14, n = cols * rows;
    for (let i = 0; i < n; i++) { const s = o.all ? 1 : clamp(u * n - i); if (s <= 0) continue; const r = Math.floor(i / cols), cc = i % cols;
      el('rect', { x: x + cc * cs, y: y + r * cs, width: cs - 2, height: cs - 2, rx: 2, fill: col, opacity: (o.op ?? 0.85) * s }); } }

  // =========================================================
  // 1. 왜 GPU 인가 — 행렬곱과 PCIe 다리
  // =========================================================
  function matmul(u, b) {
    const cpu = gauge(b, /CPU/), gpu = gauge(b, /GPU\)/);
    [[60, 'CPU · 16코어', INK], [520, 'GPU · 16,384코어', ACC]].forEach(([x0, name, col], side) => {
      zone(x0, 40, 380, 300, null, { fill: side ? ACCBG : SOFT, op: fade(u, 0.1 + side * 0.2) });
      lbl(x0 + 190, 70, name, fade(u, 0.2 + side * 0.2), { fill: col, 'font-size': 17 });
      const gx = x0 + 98, gy = 88, cs = 23;
      for (let i = 0; i < 64; i++) { const r = Math.floor(i / 8), cc = i % 8;
        const on = side ? E(u, 0.6, 0.9) : clamp((seg(u, 0.5, 2.5) * 64 - i) * 1.0);
        el('rect', { x: gx + cc * cs, y: gy + r * cs, width: cs - 3, height: cs - 3, rx: 3, fill: on > 0 ? col : PANEL, stroke: GRID, 'stroke-width': 1, opacity: on > 0 ? 0.25 + 0.6 * on : 1 }); }
      if (!side) { const i = Math.min(63, Math.floor(seg(u, 0.5, 2.5) * 64)); if (u > 0.5 && u < 2.5) el('rect', { x: gx + (i % 8) * cs - 2, y: gy + Math.floor(i / 8) * cs - 2, width: cs + 1, height: cs + 1, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.5 }); }
      const gv = side ? gpu : cpu; if (gv) hbar(x0 + 40, 306, 250, gv.value, gv.max, { h: 18, col: side ? GOOD : BAD, u: E(u, 0.8 + side * 0.2, 2.0), text: `${gv.value} ms` }); });
    sub(250, 296, '원소를 차례로 계산', fade(u, 0.7)); sub(710, 296, '모든 원소를 한꺼번에', fade(u, 0.9));
    pill(480, 190, `${Math.floor(cpu.value / gpu.value)}배`, ACC, pop(u, 1.9), { fs: 18, fill: PANEL });
    note(480, 372, 'C = A·B 의 각 원소는 서로 독립 → 동시에 계산할 수 있다', fade(u, 2.2), { 'text-anchor': 'middle' });
    tag(480, 400, '행렬곱 4096² 소요 시간 (예시 수치)', fade(u, 2.3)); }

  // 타임라인 패턴: [lane, 시작, 길이] (단위 시간). lane 0 CPU 준비 · 1 H2D · 2 GPU 연산
  function pattern(k) { const out = [];
    if (k === 2) for (let c0 = 0; c0 < 220; c0 += 100) out.push([0, c0, 40], [1, c0 + 40, 20], [2, c0 + 60, 40]);
    else if (k === 3) for (let c0 = 0; c0 < 220; c0 += 65) out.push([0, c0, 60], [1, c0, 25], [2, c0 + 25, 40]);
    else if (k === 4) for (let c0 = 0; c0 < 220; c0 += 56) out.push([0, c0, 52], [1, c0, 16], [2, c0 + 16, 40]);
    else for (let c0 = 0; c0 < 220; c0 += 43) out.push([0, c0, 40], [1, c0 + 20, 16], [2, c0, 40]);
    return out; }
  function timeline(k, u) { const X0 = 150, W = 600, Y0 = 318, LH = 26, sweep = E(u, 0.3, 2.4) * 200;
    ['CPU 준비', 'H2D 전송', 'GPU 연산'].forEach((s, i) => { tx(X0 - 12, Y0 + i * LH + 16, s, { 'font-size': 13.5, 'font-weight': 700, fill: [INK, WARN, ACC][i], 'text-anchor': 'end' });
      el('line', { x1: X0, y1: Y0 + i * LH + 11, x2: X0 + W, y2: Y0 + i * LH + 11, stroke: GRID, 'stroke-width': 1 }); });
    pattern(k).forEach(([ln, a, d]) => { if (a >= sweep || a >= 200) return; const len = Math.min(d, sweep - a, 200 - a);
      el('rect', { x: X0 + (a / 200) * W, y: Y0 + ln * LH + 2, width: (len / 200) * W - 1.5, height: LH - 8, rx: 3, fill: [INK, WARN, ACC][ln], opacity: ln === 0 ? 0.35 : 0.8 }); });
    if (u < 2.4) el('line', { x1: X0 + (sweep / 200) * W, y1: Y0 - 4, x2: X0 + (sweep / 200) * W, y2: Y0 + 3 * LH, stroke: INK, 'stroke-width': 1.5 }); }
  function utilGauge(v, pv, u) { const x = 850, y = 70, h = 190, W = 48;
    el('rect', { x, y, width: W, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    if (v == null) { mono(x + W / 2, y - 14, '—', { 'font-size': 18, 'text-anchor': 'middle', fill: MUT }); }
    else { const val = tween(pv, v, u), col = val >= 90 ? GOOD : val >= 60 ? WARN : BAD;
      el('rect', { x: x + 4, y: y + h - (h - 8) * val / 100 - 4, width: W - 8, height: (h - 8) * val / 100, rx: 5, fill: col, opacity: 0.85 });
      mono(x + W / 2, y - 14, `${Math.round(val)}%`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }
    tx(x + W / 2, y + h + 22, 'GPU 가동률', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    tag(x + W / 2 - 18, y + h + 42, '(예시)', 1); }
  function hw(k, u, b, prev) {
    // CPU 쪽
    zone(20, 40, 270, 250, 'CPU · RAM', { fill: SOFT });
    zone(520, 40, 270, 250, 'GPU · RTX 4090 · 24GB', { fill: ACCBG, color: ACC });
    // 데이터셋 더미
    [0, 1, 2].forEach((i) => el('rect', { x: 40 + i * 5, y: 80 + i * 5, width: 58, height: 44, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 1.6 }));
    sub(74, 150, '데이터셋', 1, { fill: INK });
    // 워커
    const nW = k >= 3 ? 4 : 1;
    if (k >= 2) { for (let i = 0; i < nW; i++) { const s = k === 3 ? pop(u, 0.3 + i * 0.2) : 1, cx = nW === 1 ? 200 : 140 + i * 40;
        card(cx, 100, nW === 1 ? 120 : 34, 32, { rx: 6, stroke: nW === 1 ? WARN : INK, s, text: nW === 1 ? '메인 프로세스' : `w${i}`, fs: 13.5, mono: nW > 1 }); }
      sub(200, 136, nW === 1 ? 'num_workers=0 (기본값)' : 'num_workers=4', k === 2 ? fade(u, 0.5) : 1, { fill: nW === 1 ? WARN : INK, 'font-weight': 700 }); }
    // 배치 대기열 (+ pinned 영역)
    if (k >= 2) { const pinned = k >= 3, n = pinned ? 3 : 1;
      if (pinned) { el('rect', { x: 36, y: 168, width: 238, height: 64, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k === 3 ? fade(u, 0.9) : 1 });
        tx(46, 250, 'pinned 메모리 (DMA 가능)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 1.0) : 1 }); }
      for (let i = 0; i < n; i++) card(80 + i * 70, 200, 60, 40, { rx: 5, text: 'b32', mono: true, fs: 14, stroke: INK, s: k === 2 ? pop(u, 0.6) : k === 3 ? pop(u, 1.1 + i * 0.15) : 1 }); }
    // PCIe 다리
    el('rect', { x: 290, y: 176, width: 230, height: 40, fill: PANEL, stroke: MUT, 'stroke-width': 2 });
    for (let i = 0; i < 6; i++) el('line', { x1: 300 + i * 38, y1: 196, x2: 318 + i * 38, y2: 196, stroke: OFF, 'stroke-width': 3 });
    tx(405, 168, 'PCIe 다리 (H2D)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    // GPU 코어 격자: 가동률만큼 켜진다
    const ug = gauge(b, /가동률|적용 후/) && (((b.gauges || [])[3]) || ((b.gauges || [])[2])), util = ug ? ug.value : null;
    const pg = prev && prev.gauges ? (prev.gauges[3] || prev.gauges[2]) : null, utilNow = util == null ? 0 : tween(pg ? pg.value : null, util, u);
    for (let i = 0; i < 60; i++) { const r = Math.floor(i / 12), cc = i % 12, lit = ((i * 37 + Math.floor((k * 3 + u) * 5) * 11) % 100) < utilNow;
      el('rect', { x: 540 + cc * 19, y: 76 + r * 19, width: 15, height: 15, rx: 2, fill: lit ? ACC : PANEL, stroke: GRID, 'stroke-width': 1, opacity: lit ? 0.85 : 1 }); }
    sub(655, 186, '연산 코어 (켜진 칸 = 일하는 중)', 1);
    // 배치가 다리를 건넌다
    if (k >= 2) { const per = k === 5 || k === 6 ? 0.55 : k === 2 ? 1.2 : 0.8;
      for (let j = 0; j < 3; j++) { const a = 0.4 + j * per, f = seg(u, a, a + (k === 2 ? 1.0 : 0.6)); if (f > 0 && f < 1) card(lerp(250, 560, E(f, 0, 1)), 196, 44, 26, { rx: 5, fill: WARN, stroke: 'none', text: 'b32', fs: 13.5, color: PANEL, mono: true }); } }
    // 모델 파라미터
    if (k >= 4) { const f = k === 4 ? E(u, 0.3, 1.3) : 1;
      card(lerp(160, 655, f), lerp(270, 240, f), 170, 34, { rx: 6, fill: ACCBG, stroke: ACC, text: 'model 파라미터', fs: 14, color: ACC });
      if (k === 4) { pill(655, 276, '.to(device) — 루프 밖 1회', ACC, pop(u, 1.5), { fs: 13.5, mono: false, fill: PANEL }); } }
    // device 선택 (k1)
    if (k === 1) { pill(405, 100, 'device = cuda:0', ACC, pop(u, 0.3), { mono: true, fs: 15, fill: PANEL });
      grow(470, 100, 530, 100, E(u, 0.8, 1.2), ACC); grow(340, 100, 280, 100, E(u, 1.4, 1.8), MUT, { dash: '5 4' });
      sub(405, 136, 'cuda 없으면 cpu 로', fade(u, 1.7)); mono(655, 270, 'NVIDIA GeForce RTX 4090', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.0) });
      note(150, 345, '코드 전체에서 device 는 단 한 번 정한다', fade(u, 2.2)); }
    // 타임라인 + 가동률
    if (k >= 2) timeline(k, u);
    utilGauge(util, pg ? pg.value : null, u);
    if (k === 5) { pill(450, 303, 'non_blocking=True → 전송과 연산이 겹친다', GOOD, pop(u, 1.6), { fs: 13.5, fill: PANEL }); } }
  function mistakes(u) { // k6: 그림 위에 덮는 판
    el('rect', { x: 40, y: 40, width: 740, height: 250, rx: 12, fill: PANEL, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.2) });
    lbl(445, 84, '조용히 느려지는 실수 3가지', fade(u, 0.3), { fill: BAD, 'font-size': 17 });
    [['루프 안 .item() · .cpu()', '매 스텝 강제 동기화', 0.5], ['num_workers=0 (기본값)', 'GPU 가 CPU 전처리를 기다림', 1.0], ['pin_memory 없이 non_blocking', '조용히 무시됨 — 효과 0', 1.5]].forEach(([a, b2, at], i) => {
      const y = 130 + i * 50; cross(160, y - 5, 9, pop(u, at));
      mono(185, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, at) }); tx(500, y, b2, { 'font-size': 14.5, fill: MUT, opacity: fade(u, at + 0.1) }); });
    note(445, 280, '진단 시작점: nvidia-smi 의 GPU-Util', fade(u, 2.1), { 'text-anchor': 'middle', fill: ACC }); }
  function s1(t, c) { const { k, u, beat, prev } = c;
    if (k === 0) { matmul(u, beat); return; }
    if (k === 6) { mistakes(u); timeline(6, u); const g = beat.gauges[3]; utilGauge(g.value, prev.gauges[3].value, u); return; }
    hw(k, u, beat, prev); }

  // =========================================================
  // 2. GPU 메모리 해부 — 네 덩어리의 합
  // =========================================================
  const PARTS = [['params', '파라미터', ACC], ['grads', '기울기', WARN], ['optimizer', 'Adam m·v', INFO], ['activations', '활성값', GOOD]];
  function s2(t, c) { const { k, u, beat, prev } = c, segs = memOf(beat), ps = k > 0 ? memOf(prev) : null;
    const total = k === 7 ? 26.8 : vram(segs, ps, u, { from0: k === 0, title: '1.3B 학습 (FP32)' });
    if (k === 0) {
      PARTS.forEach(([en, ko, col], i) => { const x = 95 + i * 160, s = pop(u, 0.3 + i * 0.3);
        card(x, 84, 136, 54, { rx: 10, stroke: col, sw: 2.5, s, text: ko, fs: 16, color: col, fill: PANEL });
        if (i) mono(x - 80, 90, '+', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.3) });
        mono(x, 128, en, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.3) }); });
      grid(60, 170, 24, 6, ACC, E(u, 1.4, 2.2), { cs: 15 });
      mono(60, 290, '1.3B 개 × 4 byte (FP32)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(60, 330, '= 5.2 GB', { 'font-size': 26, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
      sub(330, 380, 'OOM 은 버그가 아니라 이 네 덩어리의 덧셈이다', fade(u, 2.3), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) {
      const rows = [['n_params', '1.3e9', 0.3], ['bytes_per_param', null, 0.8], ['optimizer', '"adam" → m·v 두 벌', 1.3], ['activation_gb', '6.0 (실측해서 넣는다)', 1.8]];
      rows.forEach(([nm, v, at], i) => { const y = 90 + i * 70; mono(60, y, nm, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, at) });
        if (v) mono(300, y, v, { 'font-size': 15.5, opacity: fade(u, at + 0.2) });
        else { [['FP32', 4, 0], ['FP16·BF16', 2, 1]].forEach(([nm2, nb, j]) => { const yy = y - 16 + j * 34; tx(300, yy + 17, nm2, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, at + j * 0.3) });
            for (let q = 0; q < nb; q++) card(420 + q * 34, yy + 12, 30, 26, { rx: 4, text: 'B', fs: 13.5, mono: true, stroke: j ? GOOD : INK, color: j ? GOOD : INK, s: pop(u, at + j * 0.3 + q * 0.08) });
            mono(570, yy + 17, `${nb} byte`, { 'font-size': 14, fill: j ? GOOD : INK, opacity: fade(u, at + 0.3 + j * 0.3) }); }); } });
      note(60, 375, '4 → 2 byte 로 바꾸면 이 산수 전체가 절반이 된다 (→ AMP)', fade(u, 2.3), { fill: GOOD }); return; }
    if (k === 2) {
      lbl(150, 72, '파라미터 W', 1, { fill: ACC }); grid(60, 90, 12, 10, ACC, 1, { all: true, cs: 15 });
      lbl(480, 72, '기울기 ∂L/∂W', fade(u, 0.8), { fill: WARN }); grid(390, 90, 12, 10, WARN, E(u, 0.8, 1.8), { cs: 15 });
      for (let i = 0; i < 3; i++) { const a = 0.5 + i * 0.25; grow(250, 130 + i * 40, 380, 130 + i * 40, E(u, a, a + 0.5), WARN); }
      mono(60, 280, 'params = 5.2 GB', { 'font-size': 17, 'font-weight': 800, fill: ACC }); mono(390, 280, 'grads = params', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      note(60, 340, '역전파를 켜는 순간 같은 크기의 버퍼가 하나 더 생긴다', fade(u, 2.1)); return; }
    if (k === 3) {
      [['W', ACC, 60, 1], ['∇W', WARN, 220, 1], ['m (1차 모멘트)', INFO, 380, 0.4], ['v (2차 모멘트)', INFO, 540, 0.9]].forEach(([nm, col, x, at]) => {
        const s = at < 1 ? E(u, at, at + 0.8) : 1; grid(x, 100, 8, 8, col, s, { cs: 16, all: at >= 1 });
        tx(x, 86, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: at < 1 ? fade(u, at) : 1 }); });
      el('path', { d: 'M380,248 Q500,276 668,248', fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: fade(u, 1.5) });
      mono(524, 300, 'opt_state = params × 2 = 10.4 GB', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(524, 326, 'SGD+momentum 이면 × 1', fade(u, 1.9), { 'font-size': 14.5 });
      note(60, 376, `소계 ${total.toFixed(1)} GB — 앉아만 있어도 파라미터의 4배`, fade(u, 2.2)); return; }
    if (k === 4) {
      mono(60, 74, 'return {', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      const vals = [segs[0].gb, segs[1].gb, segs[2].gb, 0];
      PARTS.forEach(([en, ko, col], i) => { const y = 112 + i * 42, at = 0.4 + i * 0.3;
        mono(90, y, `"${en}":`, { 'font-size': 16, fill: col, 'font-weight': 700, opacity: fade(u, at) });
        mono(300, y, vals[i].toFixed(1), { 'font-size': 16, 'font-weight': 800, opacity: fade(u, at + 0.1) });
        hbar(370, y - 14, 250, vals[i], 12, { h: 16, col, u: E(u, at, at + 0.6), label: false }); });
      mono(90, 288, '"total":', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.7) }); mono(300, 288, '20.8', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      mono(60, 322, '}', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      note(60, 370, '항목별로 받아야 어느 덩어리를 줄일지 보인다', fade(u, 2.2)); return; }
    if (k === 5) {
      // 활성값 = 층마다 쌓이는 중간 결과
      for (let i = 0; i < 6; i++) { const at = 0.3 + i * 0.2, x = 70 + i * 92;
        card(x + 30, 130, 60, 70, { rx: 6, stroke: INK, s: 1, text: `층${i + 1}`, fs: 14 });
        const f = E(u, at, at + 0.4); el('rect', { x: x + 6, y: 180 + 70 * (1 - f) - 0 + 10, width: 48, height: 70 * f, rx: 4, fill: GOOD, opacity: 0.75 });
        if (i < 5) grow(x + 62, 130, x + 88, 130, E(u, at, at + 0.2), MUT); }
      tx(70, 290, '순전파 중간 결과를 역전파 때까지 들고 있는다 (batch 32)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(70, 330, '5.2 + 5.2 + 10.4 + 6.0 = 26.8 GB', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.7) });
      if (u > 2.0) { card(560, 380, 210, 42, { rx: 8, fill: BAD, stroke: 'none', text: '💥 OOM — 24GB 초과', fs: 16, color: PANEL, s: pop(u, 2.0) }); } return; }
    if (k === 6) {
      const ax = axes(150, 80, 480, 200, { x: [0, 120], y: [0, 4], xt: [0, 24, 56, 80, 112], xl: 'GB' });
      [['파라미터', 28, ACC], ['기울기', 28, WARN], ['Adam m·v', 56, INFO]].forEach(([nm, gb, col], i) => { const y = ax.Y(3.4 - i * 0.95), at = 0.3 + i * 0.4;
        const x0 = i === 0 ? 0 : i === 1 ? 28 : 56; el('rect', { x: ax.X(x0), y: y - 12, width: (ax.X(x0 + gb) - ax.X(x0)) * E(u, at, at + 0.5), height: 28, rx: 4, fill: col, opacity: 0.85 });
        tx(ax.x - 10, y + 7, nm, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, at) });
        mono(ax.X(x0 + gb) + 6, y + 7, `${gb} GB`, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, at + 0.4) }); });
      [[24, 'RTX 4090'], [80, 'A100 80GB']].forEach(([v, nm], i) => { el('line', { x1: ax.X(v), y1: ax.y - 6, x2: ax.X(v), y2: ax.y + ax.h, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.5 + i * 0.2) });
        tx(ax.X(v), ax.y - 12, nm, { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5 + i * 0.2) }); });
      lbl(390, 50, '7B 모델 · FP32 · Adam (활성값 제외)', fade(u, 0.1), { 'font-size': 16 });
      mono(390, 350, '7B × 16 byte = 112 GB', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
      sub(390, 380, 'A100 80GB 한 장으로도 학습 불가', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k7: 실측 — 현재 점유 vs 피크
    const ax = axes(90, 70, 560, 250, { x: [0, 10], y: [0, 30], yt: [0, 12, 24], xl: '한 스텝 안의 시간 →', yl: 'GB' });
    el('line', { x1: ax.X(0), y1: ax.Y(24), x2: ax.X(10), y2: ax.Y(24), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    const need = [[0, 20.8], [1, 20.8], [5, 26.8], [5.4, 26.8], [9, 20.8], [10, 20.8]];
    line(ax, need, E(u, 0.3, 1.6), MUT, { dash: '6 5', sw: 2 });
    line(ax, [[0, 20.8], [1, 20.8], [3, 24]], E(u, 0.3, 1.0), ACC, { sw: 3.2 });
    tx(ax.X(5.4) + 8, ax.Y(26.8) - 6, '필요 26.8', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.3) });
    tx(ax.X(0.2), ax.Y(20.8) + 22, '정적 20.8 (파라미터+기울기+Adam)', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
    if (u > 1.1) { cross(ax.X(3), ax.Y(24), 10, pop(u, 1.1)); tx(ax.X(3) + 16, ax.Y(24) + 24, 'CUDA out of memory', { 'font-size': 14, 'font-weight': 800, fill: BAD, class: 'mono' }); }
    mono(670, 120, 'memory_allocated()', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) }); sub(760, 142, '지금 점유', fade(u, 1.8));
    mono(670, 190, 'max_memory_allocated()', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); sub(770, 212, '피크 — 추정과 대조', fade(u, 2.1));
    tag(90, 400, '그림의 곡선은 개념도 (실측은 memory_summary() 로)', fade(u, 2.3)); }

  // =========================================================
  // 3. 혼합 정밀 — FP16 의 좁은 범위와 손실 스케일
  // =========================================================
  // 비트 막대: [부호, 지수, 가수]
  function bits(x, y, name, parts, op, o) { o = o || {}; const bw = o.bw || 12; let i = 0;
    tx(x - 12, y + 17, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: op });
    [[parts[0], INK], [parts[1], ACC], [parts[2], INFO]].forEach(([n, col]) => { for (let j = 0; j < n; j++, i++) el('rect', { x: x + i * bw, y, width: bw - 2, height: 24, rx: 2, fill: col, opacity: 0.8 * op }); });
    mono(x + i * bw + 10, y + 17, `${parts.join('·')}`, { 'font-size': 13.5, fill: MUT, opacity: op }); }
  function s3(t, c) { const { k, u, beat, prev } = c, segs = memOf(beat), ps = k > 0 ? memOf(prev) : null;
    vram(segs, ps, u, { title: '1.3B · batch 32' });
    const thr = (re) => gauge(beat, re);
    if (k === 0) { const N = [['autocast\nFP16 순전파', ACC], ['loss × S\n스케일 ↑', WARN], ['backward\n역전파', WARN], ['÷ S\n복원', INFO], ['FP32\n업데이트', GOOD]];
      const P = [[120, 110], [360, 80], [600, 150], [480, 300], [200, 300]];
      N.forEach(([s, col], i) => { const [x, y] = P[i], [x2, y2] = P[(i + 1) % 5], at = 0.3 + i * 0.4; card(x, y, 150, 56, { rx: 10, text: s, fs: 14, stroke: col, color: col, s: pop(u, at), fill: PANEL });
        if (i < 4) grow(x + (x2 - x) * 0.32, y + (y2 - y) * 0.32, x2 - (x2 - x) * 0.32, y2 - (y2 - y) * 0.32, E(u, at + 0.2, at + 0.5), MUT); });
      const g = thr(/FP32 처리량/); mono(380, 210, `FP32 ${g.value} img/s`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); tag(330, 236, '(예시)', fade(u, 2.2));
      note(30, 390, '출발점: FP32 그대로면 26.8 GB → 24GB 초과', fade(u, 2.4), { fill: BAD }); return; }
    if (k === 1) { bits(110, 90, 'FP32', [1, 8, 23], fade(u, 0.3));
      tx(110, 150, '모든 텐서가 4 byte — 순전파·역전파·저장 전부', { 'font-size': 14.5, opacity: fade(u, 0.7) });
      pill(220, 210, 'AdamW(lr=3e-4)', INK, pop(u, 1.0), { mono: true, fs: 15 });
      card(500, 220, 170, 70, { rx: 10, stroke: OFF, sw: 2.5, text: '텐서코어', fs: 17, color: MUT, s: pop(u, 1.4) });
      const g = thr(/텐서코어/); mono(500, 282, `가동률 ${g ? g.value : 0}%`, { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      note(30, 360, 'FP32 연산은 텐서코어(FP16/BF16 전용)를 못 쓴다', fade(u, 2.1)); return; }
    if (k === 2) { // 수직선: log10 -10 ~ 5
      const X = (lg) => 60 + (lg + 10) * 40, Y = 190;
      el('rect', { x: X(-7.22), y: Y - 26, width: X(4.82) - X(-7.22), height: 52, rx: 6, fill: GOODBG, opacity: fade(u, 0.3) });
      tx(X(-1.2), Y - 36, 'FP16 이 표현하는 범위', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      el('line', { x1: X(-10), y1: Y, x2: X(5), y2: Y, stroke: INK, 'stroke-width': 2 });
      [-10, -8, -6, -4, -2, 0, 2, 4].forEach((lg) => { el('line', { x1: X(lg), y1: Y - 5, x2: X(lg), y2: Y + 5, stroke: INK, 'stroke-width': 1.5 }); mono(X(lg), Y + 44, lg === 0 ? '1' : `1e${lg}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      mono(X(-7.22), Y + 66, '6e-8', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.5) }); mono(X(4.82), Y + 66, '65504', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.5) });
      // 기울기 1e-8: 범위 밖 → 0
      const fall = E(u, 0.9, 1.4); el('circle', { cx: X(-8), cy: Y - 60 + 60 * fall, r: 8, fill: BAD, opacity: fade(u, 0.6) });
      mono(X(-8), Y - 76, '∇ = 1e-8', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      if (u > 1.4) mono(X(-8), Y + 92, '→ FP16 에선 0', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      // × 65536 → 6.6e-4
      const f = E(u, 1.7, 2.3); if (u > 1.7) { el('path', { d: `M${X(-8)},${Y - 20} Q${(X(-8) + X(-3.18)) / 2},${Y - 110} ${lerp(X(-8), X(-3.18), f)},${Y - 20}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
        mono((X(-8) + X(-3.18)) / 2, Y - 80, '× 65536', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); }
      if (f > 0.95) { el('circle', { cx: X(-3.18), cy: Y, r: 8, fill: ACC }); mono(X(-3.18) + 14, Y - 14, '6.6e-4 ✓', { 'font-size': 14, 'font-weight': 800, fill: ACC }); }
      note(60, 390, 'GradScaler: 손실에 큰 수를 곱했다가 업데이트 직전 되돌린다', fade(u, 2.4)); return; }
    if (k === 3) { lbl(170, 78, '.grad 버퍼', 1, { fill: WARN });
      const gone = E(u, 0.8, 1.6); grid(80, 96, 12, 8, WARN, 1, { all: true, cs: 15, op: 0.85 * (1 - gone) });
      if (gone > 0.5) mono(170, 160, 'None', { 'font-size': 22, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: gone });
      card(470, 110, 250, 46, { rx: 8, stroke: MUT, text: 'zero_grad(): 0 으로 덮어쓰기', fs: 14, color: MUT, s: pop(u, 0.4) }); cross(612, 110, 8, pop(u, 0.7));
      card(470, 180, 250, 46, { rx: 8, stroke: GOOD, text: 'set_to_none=True: 버퍼 해제', fs: 14, color: GOOD, s: pop(u, 1.0) }); check(612, 180, 9, pop(u, 1.3));
      mono(80, 290, '26.8 → 21.6 GB', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      sub(330, 340, '0 채우기 커널이 사라지고 메모리도 비워진다 (backward 가 다시 만든다)', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 4) { lbl(330, 62, 'with torch.autocast(dtype=float16):', fade(u, 0.2), { class: 'mono', 'font-size': 15 });
      [['conv · matmul (Linear)', 'FP16 · 텐서코어', ACC, 0.5], ['softmax · loss', 'FP32', INFO, 0.9], ['BatchNorm · LayerNorm', 'FP32', INFO, 1.3]].forEach(([op, dt, col, at], i) => { const y = 108 + i * 52;
        card(170, y, 250, 40, { rx: 8, stroke: INK, text: op, fs: 14.5, s: pop(u, at) }); grow(298, y, 386, y, E(u, at + 0.2, at + 0.5), col); pill(480, y, dt, col, pop(u, at + 0.4), { fs: 14.5, fill: PANEL }); });
      const g = thr(/텐서코어/), pg0 = gauge(prev, /텐서코어/); hbar(80, 290, 380, tween(pg0 ? pg0.value : 0, g.value, u), 100, { h: 20, col: ACC, text: `텐서코어 ${Math.round(tween(pg0 ? pg0.value : 0, g.value, u))}%` });
      tag(80, 340, '(가동률은 예시)', fade(u, 1.8)); note(80, 390, '활성값이 FP16 으로 저장돼 6.0 → 3.0 GB', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 5) { for (let i = 0; i < 4; i++) { const x = 90 + i * 140; card(x + 50, 130, 100, 60, { rx: 8, stroke: INK, text: `층 ${i + 1}`, fs: 15 }); }
      card(675, 130, 90, 60, { rx: 8, stroke: WARN, text: 'loss\n× 65536', fs: 14, color: WARN, s: pop(u, 0.3) });
      for (let i = 3; i >= 0; i--) { const at = 0.6 + (3 - i) * 0.35, x1 = i === 3 ? 630 : 90 + (i + 1) * 140, x2 = 90 + i * 140 + 100;
        grow(x1 - 4, 166, x2 + 4, 166, E(u, at, at + 0.3), BAD); mono((x1 + x2) / 2, 192, '∇×S', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, at + 0.2) }); }
      tx(90, 220, '기울기가 거꾸로 흐르며 FP16 범위 안에 머문다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) });
      const a = thr(/FP32 처리량/), b = thr(/AMP/);
      tx(90, 286, 'FP32', { 'font-size': 14, 'font-weight': 700, fill: MUT }); hbar(160, 272, 380, a.value, b.max, { h: 18, col: MUT, text: `${a.value} img/s` });
      tx(90, 326, 'AMP', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); hbar(160, 312, 380, b.value, b.max, { h: 18, col: ACC, u: E(u, 1.2, 2.0), text: `${b.value} img/s` });
      tag(90, 360, '(처리량은 예시 수치)', fade(u, 1.5)); note(90, 395, '로깅은 복원 뒤에 — 지금 loss 는 65536배 큰 값이다', fade(u, 2.3), { fill: WARN }); return; }
    if (k === 6) { const S = [['÷ 65536\n복원', INFO, 0.3], ['inf / nan\n검사', WARN, 0.8]];
      S.forEach(([s, col, at], i) => { card(110 + i * 190, 120, 150, 60, { rx: 10, stroke: col, color: col, text: s, fs: 15, s: pop(u, at), fill: PANEL }); if (i) grow(190, 120, 225, 120, E(u, at, at + 0.3), MUT); });
      grow(385, 110, 450, 80, E(u, 1.2, 1.5), GOOD); grow(385, 130, 450, 180, E(u, 1.2, 1.5), BAD);
      card(540, 76, 170, 44, { rx: 8, stroke: GOOD, color: GOOD, text: '통과 → step()', fs: 14.5, s: pop(u, 1.4) });
      card(540, 184, 170, 44, { rx: 8, stroke: BAD, color: BAD, text: 'inf → 건너뜀', fs: 14.5, s: pop(u, 1.6) });
      const g = thr(/스케일/), pg0 = gauge(prev, /스케일/), v = tween(pg0 ? pg0.value : null, g.value, u, 0.8);
      tx(110, 280, '손실 스케일 S', { 'font-size': 15, 'font-weight': 800 }); hbar(110, 292, 440, v, 65536, { h: 22, col: WARN, u: 1, text: Math.round(v).toLocaleString() });
      sub(330, 345, 'inf 가 나오면 스케일 ½ · 안정되면 서서히 키운다', fade(u, 2.0), { 'font-size': 15 });
      note(110, 390, 'FP32 마스터 웨이트만 갱신된다', fade(u, 2.3)); return; }
    // k7: BF16
    bits(110, 76, 'FP32', [1, 8, 23], fade(u, 0.2), { bw: 11 }); bits(110, 126, 'FP16', [1, 5, 10], fade(u, 0.6), { bw: 11 }); bits(110, 176, 'BF16', [1, 8, 7], fade(u, 1.0), { bw: 11 });
    el('rect', { x: 118, y: 70, width: 8 * 11 + 4, height: 136, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.3) });
    tx(110, 236, '지수(초록) 8비트 = FP32 와 같은 범위 → GradScaler 불필요', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
    const a = thr(/FP32 처리량/), b = thr(/AMP/);
    mono(110, 300, `26.8 → ${segs.reduce((s, x) => s + x.gb, 0).toFixed(1)} GB`, { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
    mono(110, 340, `${a.value} → ${b.value} img/s (${(b.value / a.value).toFixed(1)}배, 예시)`, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
    sub(330, 385, '옵티마이저 상태는 FP32 그대로 — 절약은 활성값, 선물은 속도', fade(u, 2.4), { 'font-size': 15, fill: INK }); }

  // =========================================================
  // 4. 배치 크기의 과학 — 누적과 lr
  // =========================================================
  function batchBars(b, prev, u) { const rows = b.batchTable.rows, pn = prev && prev.batchTable ? prev.batchTable.rows.length : 0;
    const ax = axes(70, 70, 330, 250, { x: [0, 1], y: [0, 30], yt: [0, 12, 24], yl: 'GB' }), bw = 50, gap = (330 - rows.length * bw) / (rows.length + 1);
    el('line', { x1: ax.x, y1: ax.Y(24), x2: ax.x + ax.w, y2: ax.Y(24), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    tx(ax.x + ax.w, ax.Y(24) - 6, '24GB', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' });
    rows.forEach((r, i) => { const isNew = !prev || i >= pn || (prev.batchTable.rows[i] || {}).batch !== r.batch, at = 0.3 + (isNew ? i * 0.15 : 0), g = isNew ? E(u, at, at + 0.6) : 1;
      const x = ax.x + gap + i * (bw + gap), v = Math.min(r.mem, 30), col = r.oom ? BAD : /누적/.test(r.batch) ? ACC : INFO;
      el('rect', { x, y: ax.Y(v * g), width: bw, height: ax.Y(0) - ax.Y(v * g), rx: 4, fill: col, opacity: 0.8 });
      mono(x + bw / 2, ax.Y(v * g) - 8, r.mem.toFixed(1), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, at + 0.4) });
      mono(x + bw / 2, ax.Y(0) + 20, r.batch.replace('누적', ''), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: isNew ? fade(u, at) : 1 });
      mono(x + bw / 2, ax.Y(0) + 40, r.oom ? 'OOM' : `${r.thr}/s`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: r.oom ? BAD : MUT, opacity: isNew ? fade(u, at + 0.3) : 1 }); });
    tx(70, 410, 'batch · 메모리 · 처리량(예시)', { 'font-size': 13.5, fill: MUT }); }
  function tiles(x, y, n, cols, col, u, a) { for (let i = 0; i < n; i++) { const s = a == null ? 1 : clamp(seg(u, a, a + 0.6) * n - i); if (s <= 0) continue;
      el('rect', { x: x + (i % cols) * 14, y: y + Math.floor(i / cols) * 14, width: 12, height: 12, rx: 2, fill: col, opacity: 0.85 * s }); } }
  function s4(t, c) { const { k, u, beat, prev } = c;
    batchBars(beat, k > 0 ? prev : null, u);
    const RX = 480;
    if (k === 0) { tiles(RX, 90, 64, 8, INFO, u, 0.3); mono(RX + 56, 230, 'batch 64', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      tiles(RX + 180, 90, 32, 8, INFO, u, 0.6); mono(RX + 236, 230, 'batch 32', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      note(RX, 290, '배치를 키우면 활성값만 커진다', fade(u, 1.4)); sub(RX + 180, 318, '파라미터·기울기·옵티마이저는 그대로', fade(u, 1.7), { 'font-size': 14.5 });
      if (u > 2.0) card(RX + 56, 160, 120, 40, { rx: 8, fill: BAD, stroke: 'none', text: 'OOM', fs: 17, color: PANEL, s: pop(u, 2.0) }); return; }
    if (k === 1) { for (let j = 0; j < 4; j++) { tiles(RX + j * 110, 100, 16, 4, j % 2 ? INFO : ACC, u, 0.3 + j * 0.3); mono(RX + 28 + j * 110, 180, '16', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.5 + j * 0.3) }); if (j) mono(RX - 26 + j * 110, 130, '+', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.4 + j * 0.3) }); }
      mono(RX, 240, 'ACCUM_STEPS = 4', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      mono(RX, 276, '유효 배치 = 16 × 4 = 64', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.9) });
      sub(RX + 200, 320, '메모리는 micro-batch 16 만큼만 (22.3 GB)', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { tx(RX, 110, 'BASE_LR', { 'font-size': 15, 'font-weight': 800, fill: MUT }); hbar(RX + 90, 96, 270, 3, 12, { h: 20, col: MUT, text: '3e-4' });
      tx(RX, 160, 'lr', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) }); hbar(RX + 90, 146, 270, 12, 12, { h: 20, col: ACC, u: E(u, 0.6, 1.6), text: '1.2e-3' });
      mono(RX, 230, 'lr = 3e-4 × 4', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.4) });
      note(RX, 280, 'linear scaling rule', fade(u, 1.8), { fill: ACC }); sub(RX + 200, 310, '유효 배치가 k배면 lr 도 k배', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3) { const ax = axes(RX + 40, 90, 380, 200, { x: [0, 700], y: [0, 1.3], xt: [0, 500], yt: [0.12, 1.2], xl: '옵티마이저 step', yl: 'lr (×1e-3)' });
      const pts = [[0, 0.12], [500, 1.2], [700, 1.2]]; line(ax, pts, E(u, 0.4, 1.8), ACC);
      el('line', { x1: ax.X(500), y1: ax.y, x2: ax.X(500), y2: ax.y + ax.h, stroke: GRID, 'stroke-dasharray': '4 4' });
      mono(ax.X(0) + 8, ax.Y(0.12) - 10, '1.2e-4 (×0.1)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      sub(ax.X(250), ax.Y(0.95), 'LinearLR 워밍업', fade(u, 1.2), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      note(RX, 380, '큰 lr 로 바로 시작하면 초반에 발산한다', fade(u, 2.1)); return; }
    if (k === 4 || k === 6) { // 8 micro-step 타임라인: zero_grad 는 4번에 1번
      const bucket = (cx, lvl, col) => { el('path', { d: `M${cx - 50},150 L${cx - 40},250 L${cx + 40},250 L${cx + 50},150`, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
        const h = 96 * lvl; if (h > 0) el('path', { d: `M${cx - 40 - 10 * (h / 100)},${250 - h} L${cx - 40},250 L${cx + 40},250 L${cx + 40 + 10 * (h / 100)},${250 - h} Z`, fill: col, opacity: 0.7 }); };
      if (k === 4) { mono(RX, 90, 'optimizer.zero_grad()', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); sub(RX + 100, 112, '루프 밖에서 한 번', fade(u, 0.5));
        for (let i = 0; i < 8; i++) { const x = RX + 10 + i * 52, at = 0.6 + i * 0.15; card(x + 20, 170, 40, 34, { rx: 6, text: `${i + 1}`, mono: true, fs: 14, stroke: INK, s: pop(u, at) });
          if (i % 4 === 3) { el('line', { x1: x + 46, y1: 145, x2: x + 46, y2: 200, stroke: GOOD, 'stroke-width': 3, opacity: fade(u, at + 0.1) }); } }
        sub(RX + 220, 226, '초록 선 = 업데이트 후 비우기 (4번에 1번)', fade(u, 1.9), { 'font-size': 14.5, fill: GOOD });
        note(RX, 290, '루프 안에서 매번 비우면', fade(u, 2.1), { fill: BAD }); note(RX, 318, '그냥 batch 16 학습이 된다', fade(u, 2.2), { fill: BAD }); return; }
      const step = Math.min(4, Math.floor(seg(u, 0.3, 2.3) * 4.999)), fired = u > 2.3;
      bucket(RX + 120, fired ? 0 : step / 4, WARN);
      tx(RX + 120, 280, '.grad 누적', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      for (let i = 0; i < 4; i++) { const a = 0.3 + i * 0.5; fly(RX + 120, 70, RX + 120, 160, seg(u, a, a + 0.45), `∇ micro ${i + 1}`, { fill: WARN }); }
      mono(RX + 120, 320, `${Math.min(step, 4)} / 4`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      if (fired) { card(RX + 320, 200, 180, 46, { rx: 10, fill: GOOD, stroke: 'none', text: 'optimizer.step()', fs: 15, color: PANEL, mono: true, s: pop(u, 2.3) }); }
      sub(RX + 320, 260, '나머지 3번은 누적만', fade(u, 1.0), { 'font-size': 14.5 });
      sub(RX + 320, 286, '역전파가 끝나면 활성값 해제 (1.5 → 0.2 GB)', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 5) { for (let i = 0; i < 4; i++) { const at = 0.3 + i * 0.3, x = RX + i * 105;
        card(x + 40, 120, 80, 40, { rx: 8, stroke: WARN, color: WARN, text: `L${i + 1} ÷ 4`, fs: 15, mono: true, s: pop(u, at) });
        grow(x + 40, 142, RX + 200, 210, E(u, at + 0.6, at + 1.0), MUT); }
      card(RX + 200, 236, 230, 48, { rx: 10, stroke: ACC, color: ACC, text: 'Σ = 배치 64 의 평균 손실', fs: 15, s: pop(u, 1.9) });
      note(RX, 320, '나누지 않으면 기울기가 4배', fade(u, 2.2), { fill: BAD }); sub(RX + 200, 348, '= 실질 lr 4배 → 조용히 발산', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    // k7: BN 통계와 속도
    tiles(RX, 90, 16, 4, ACC, u, 0.2); mono(RX + 28, 168, '16', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
    tx(RX + 90, 120, 'BatchNorm 평균·분산 =', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) }); tx(RX + 90, 146, 'micro-batch 16 기준', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.7) });
    sub(RX + 200, 190, 'BN 많은 모델 → GroupNorm / LayerNorm', fade(u, 1.0), { 'font-size': 14.5 });
    const r16 = beat.batchTable.rows.find((r) => r.batch === '16'), ra = beat.batchTable.rows.find((r) => /누적/.test(r.batch));
    tx(RX, 252, 'batch 16', { 'font-size': 14, 'font-weight': 700, fill: INFO }); hbar(RX + 100, 238, 260, r16.thr, 1100, { h: 18, col: INFO, u: E(u, 1.2, 1.8), text: `${r16.thr}/s` });
    tx(RX, 292, '16×4 누적', { 'font-size': 14, 'font-weight': 700, fill: ACC }); hbar(RX + 100, 278, 260, ra.thr, 1100, { h: 18, col: ACC, u: E(u, 1.4, 2.0), text: `${ra.thr}/s` });
    note(RX, 340, '속도 이득 없음 — 목적은 메모리', fade(u, 2.2)); }

  // =========================================================
  // 5. 실전 처방전 — OOM 사다리 · 병목 진단 · DDP
  // =========================================================
  const RUNG = ['lr 재조정 · 비용 0', '활성값 ½ · 속도↑', '유효 배치 유지', '재계산 · 속도 -25%'];
  function ladder(b, prev, u, o) { o = o || {}; const nodes = (b.flow && b.flow.nodes) || [], pn = prev && prev.flow ? prev.flow.nodes.length : 0, Y = o.y ?? 380;
    nodes.forEach((n, i) => { const x = 40 + i * 165, y = Y - i * 34, isNew = i >= pn, s = isNew ? pop(u, 0.3 + (i - pn) * 0.3) : 1, col = [GOOD, WARN, WARN, BAD][i];
      card(x + 75, y - 18, 150, 40, { rx: 6, stroke: col, sw: 2.2, fill: PANEL, text: n.label.replace(/ \(FP16\/BF16\)/, '').replace('gradient accumulation', 'grad 누적').replace('activation checkpointing', '체크포인팅'), fs: 14, color: col, s });
      tx(x + 75, y + 18, RUNG[i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: isNew ? fade(u, 0.5 + (i - pn) * 0.3) : 1 }); });
    if (nodes.length) { grow(40, Y + 30, 700, Y + 30, 1, OFF, { plain: true }); tx(700, Y + 30 - 6, '비용 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } }
  function gpuCard(cx, cy, rank, o) { o = o || {}; card(cx, cy, 120, 120, { rx: 10, stroke: o.stroke || ACC, fill: PANEL, sw: 2.2, s: o.s, op: o.op });
    tx(cx, cy - 40, `GPU ${rank}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: o.op ?? 1 });
    const v = o.mem ?? 21.4, h = 60; el('rect', { x: cx - 16, y: cy - 22, width: 32, height: h, rx: 4, fill: SOFT, stroke: GRID, opacity: o.op ?? 1 });
    el('rect', { x: cx - 13, y: cy - 22 + h * (1 - v / 24), width: 26, height: h * v / 24, rx: 3, fill: ACC, opacity: 0.75 * (o.op ?? 1) });
    mono(cx, cy + 54, o.memText || `${v}GB`, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
  const GX = [140, 330, 520, 710];
  function s5(t, c) { const { k, u, beat, prev } = c;
    if (k <= 2) { vram(memOf(beat), k > 0 ? memOf(prev) : null, u, { title: 'AMP + 누적' }); ladder(beat, k > 0 ? prev : null, u, { y: k === 2 ? 392 : 380 }); }
    if (k === 0) { lbl(360, 70, 'OOM 이 나면 — 싼 처방부터', fade(u, 0.2), { 'font-size': 18 });
      card(360, 140, 300, 56, { rx: 10, fill: BADBG, stroke: BAD, text: 'CUDA out of memory', fs: 16, mono: true, color: BAD, s: pop(u, 0.4) });
      note(360, 232, '배치↓ → AMP → 누적 → 체크포인팅 → DDP', fade(u, 1.8), { 'text-anchor': 'middle', 'font-size': 15 }); return; }
    if (k === 1) { [['checkpoint_sequential', '재계산'], ['DistributedDataParallel', '분산 래퍼'], ['DistributedSampler', '데이터 분할']].forEach(([a, b2], i) => {
        card(220 + (i % 2) * 280, 80 + Math.floor(i / 2) * 70, 260, 46, { rx: 8, stroke: INK, text: a, fs: 14.5, mono: true, s: pop(u, 0.3 + i * 0.3) });
        sub(220 + (i % 2) * 280, 118 + Math.floor(i / 2) * 70, b2, fade(u, 0.5 + i * 0.3), { 'font-size': 14 }); });
      note(470, 232, 'import 만으로는 메모리가 그대로다', fade(u, 1.8), { fill: MUT, 'font-size': 15 }); return; }
    if (k === 2) { // 체크포인팅: 8층, 4구간 경계만 저장
      for (let i = 0; i < 8; i++) { const x = 60 + i * 82, keep = i % 2 === 0, at = 0.3 + i * 0.12;
        card(x + 30, 90, 60, 44, { rx: 6, stroke: INK, text: `층${i + 1}`, fs: 13.5, s: pop(u, at) });
        if (i < 7) grow(x + 61, 90, x + 81, 90, E(u, at, at + 0.2), MUT);
        const a = keep ? 1 : 1 - E(u, 1.0, 1.4); el('rect', { x: x + 10, y: 124, width: 40, height: 26, rx: 4, fill: keep ? GOOD : PANEL, stroke: keep ? GOOD : OFF, 'stroke-width': 1.5, 'stroke-dasharray': keep ? null : '3 3', opacity: keep ? 0.8 * fade(u, at) : 0.8 });
        if (!keep && u > 1.6) el('path', { d: `M${x - 22},154 Q${x + 4},180 ${x + 28},154`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.6), 'marker-end': 'url(#ra-ah)' }); }
      tx(60, 196, '초록 = 저장한 활성값 (구간 경계 4곳) · 점선 = 버렸다가 역전파 때 재계산', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(60, 236, '활성값 1.5 → 0.6 GB · 속도 -25%', { 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { // 프로파일러
      lbl(330, 62, 'profile(CPU + CUDA) — 20 스텝만', fade(u, 0.2), { 'font-size': 16 });
      ['CPU', 'CUDA'].forEach((s, j) => { tx(110, 112 + j * 44, s, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end', fill: j ? ACC : INK });
        for (let i = 0; i < 20; i++) { const s0 = clamp(seg(u, 0.4, 1.8) * 20 - i); if (s0 <= 0) continue; const w = j ? 16 : 8 + ((i * 7) % 5);
          el('rect', { x: 122 + i * 28 + (j ? 6 : 0), y: 96 + j * 44, width: w, height: 22, rx: 3, fill: j ? ACC : INK, opacity: (j ? 0.75 : 0.35) * s0 }); } });
      mono(330, 222, 'key_averages().table(sort_by="cuda_time_total")', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      el('rect', { x: 110, y: 240, width: 440, height: 110, rx: 8, fill: PANEL, stroke: GRID, opacity: fade(u, 2.0) });
      [['Name', 'CUDA total'], ['aten::convolution / gemm', '…'], ['DataLoader 대기', '…']].forEach(([a, b2], i) => { mono(126, 268 + i * 30, a, { 'font-size': 14, 'font-weight': i ? 400 : 700, opacity: fade(u, 2.1 + i * 0.1) }); mono(530, 268 + i * 30, b2, { 'font-size': 14, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 2.1 + i * 0.1) }); });
      note(580, 300, '추측 대신 측정', fade(u, 2.4), { fill: ACC }); vram(memOf(beat), memOf(prev), u, { title: '체크포인팅 후' }); return; }
    if (k === 4) { const X0 = 100, W = 560, X = (v) => X0 + (v / 100) * W;
      el('rect', { x: X0, y: 110, width: W, height: 28, rx: 6, fill: SOFT, stroke: GRID });
      el('rect', { x: X0, y: 110, width: X(50) - X0, height: 28, rx: 6, fill: WARN, opacity: 0.45 * fade(u, 0.4) });
      el('rect', { x: X(90), y: 110, width: X(100) - X(90), height: 28, rx: 6, fill: ACC, opacity: 0.55 * fade(u, 0.7) });
      [0, 50, 100].forEach((v) => mono(X(v), 160, `${v}%`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      lbl(X(50), 92, 'nvidia-smi · GPU-Util', fade(u, 0.2)); mono(X(90), 104, '90%', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.7) });
      const cmp = beat.compare; [[cmp.left, WARN, 0.9, 220], [cmp.right, ACC, 1.4, 500]].forEach(([col, cc, at, cx]) => {
        card(cx, 250, 250, 132, { rx: 10, stroke: cc, s: pop(u, at), fill: PANEL });
        tx(cx, 210, col.name, { 'font-size': 16, 'font-weight': 800, fill: cc, 'text-anchor': 'middle', opacity: fade(u, at + 0.1) });
        col.items.forEach((s, i) => tx(cx, 240 + i * 26, s, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, at + 0.2 + i * 0.15) })); });
      grow(X(25), 142, 220, 182, E(u, 0.9, 1.2), WARN); grow(X(95), 142, 500, 182, E(u, 1.4, 1.7), ACC);
      vram(memOf(beat), memOf(prev), u, { title: '진단 중에도 21.4' }); return; }
    // k5~8: DDP 4장
    const cmp = beat.compare;
    if (k === 5) { GX.forEach((x, i) => gpuCard(x, 170, i, { s: pop(u, 0.3 + i * 0.2) }));
      for (let i = 0; i < 4; i++) { const a = GX[i], b2 = GX[(i + 1) % 4]; if (i < 3) grow(a + 62, 150, b2 - 62, 150, E(u, 1.2 + i * 0.15, 1.5 + i * 0.15), INFO, { plain: true }); }
      el('path', { d: `M${GX[3]},232 Q${(GX[0] + GX[3]) / 2},300 ${GX[0]},232`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, 1.7) });
      mono(425, 290, 'init_process_group("nccl")', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.8) });
      sub(425, 330, 'torchrun --nproc_per_node=4 · GPU 당 프로세스 1개 (LOCAL_RANK)', fade(u, 2.0), { 'font-size': 14.5 });
      note(425, 380, '모델은 카드마다 통째로 복제 — 카드당 21.4 GB', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k === 6) { const cols = [ACC, WARN, INFO, GOOD];
      for (let i = 0; i < 4; i++) { el('rect', { x: 230 + i * 100, y: 50, width: 96, height: 30, rx: 4, fill: cols[i], opacity: 0.75 * fade(u, 0.2) }); fly(278 + i * 100, 80, GX[i], 110, seg(u, 0.5 + i * 0.12, 1.2 + i * 0.12), `조각 ${i}`, { fill: cols[i] }); }
      tx(220, 70, 'DistributedSampler', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 0.2) });
      GX.forEach((x, i) => gpuCard(x, 190, i, { stroke: cols[i] }));
      for (let i = 0; i < 3; i++) { grow(GX[i] + 62, 196, GX[i + 1] - 62, 196, E(u, 1.4, 1.8), BAD); grow(GX[i + 1] - 62, 212, GX[i] + 62, 212, E(u, 1.6, 2.0), BAD); }
      mono(425, 290, '기울기만 all-reduce 로 평균', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) });
      mono(425, 330, '유효 배치 = 16 × 4 GPU = 64', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      sub(425, 370, '샘플러가 없으면 4장이 같은 배치를 학습한다', fade(u, 2.3), { 'font-size': 14.5, fill: WARN }); return; }
    if (k === 7) { const P0 = [3, 7, 1, 5, 0, 6, 2, 4], P1 = [6, 2, 4, 0, 7, 1, 5, 3];
      [['epoch 0', P0, 0.3], ['epoch 1 · set_epoch(1)', P1, 1.0], ['epoch 1 · set_epoch 없음', P0, 1.7]].forEach(([nm, P, at], r) => { const y = 90 + r * 80;
        tx(60, y + 26, nm, { 'font-size': 14.5, 'font-weight': 700, fill: r === 2 ? BAD : INK, opacity: fade(u, at) });
        P.forEach((v, i) => card(330 + i * 46, y + 20, 40, 36, { rx: 6, text: String(v), mono: true, fs: 15, stroke: r === 2 ? BAD : r ? GOOD : INK, color: r === 2 ? BAD : INK, s: pop(u, at + i * 0.05) })); });
      if (u > 2.0) cross(730, 270, 10, pop(u, 2.0));
      sub(530, 345, '데이터 순서 (인덱스)', fade(u, 0.5));
      note(60, 390, 'set_epoch 를 안 부르면 매 에폭 같은 순서 = 셔플이 꺼진 상태', fade(u, 2.2), { fill: BAD }); return; }
    // k8: FSDP/ZeRO
    lbl(425, 56, '7B · FP32 · Adam = 112 GB (활성값 제외)', fade(u, 0.2), { 'font-size': 16 });
    const sp = E(u, 0.9, 1.7);
    for (let i = 0; i < 4; i++) { const x0 = lerp(225 + i * 100, GX[i] - 50, sp), y0 = lerp(80, 150, sp); el('rect', { x: x0, y: y0, width: 100 - 4, height: 34, rx: 4, fill: [ACC, WARN, INFO, INFO][i], opacity: 0.8 });
      if (sp > 0.95) mono(GX[i], 210, '112 ÷ 4 = 28 GB', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); }
    if (sp > 0.95) GX.forEach((x, i) => tx(x, 240, `GPU ${i}`, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }));
    note(425, 296, 'FSDP / ZeRO: 상태를 GPU 수만큼 나눠 든다', fade(u, 1.9), { 'text-anchor': 'middle', fill: ACC });
    sub(425, 330, 'DDP 는 복제, FSDP 는 분할 — 유효 배치가 커진 만큼 lr 도 스케일', fade(u, 2.1), { 'font-size': 14.5 });
    pill(425, 376, '배포·서빙·대형 분산 → mlops 로드맵', INK, pop(u, 2.3), { fs: 14.5 }); }

  RA.page({ title: 'GPU 메모리와 처리량', scenes: [s1, s2, s3, s4, s5] });
})();
