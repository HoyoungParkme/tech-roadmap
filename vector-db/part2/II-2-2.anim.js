/* II-2-2 FAISS 최적화 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 속도 막대는 beat.speedBars, 메모리는 beat.memGauge, 압축은 beat.compress, 정확도 점은 beat.tradeoff.points 를 읽는다.
 * CPU 100만 개 검색은 이 실습 PC 1스레드에서 38~46 ms 로 다시 재 보았다(페이지 값 50.2 ms 는 i9-13900K 기준).
 * GPU 시간과 recall 값은 GPU·코퍼스가 없어 재현하지 못한 페이지 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const fmtN = (v) => Math.round(v).toLocaleString('en-US');
  // 칩 그림: cores 칸이 켜진다. lit(i) → 0~1
  function chip(x, y, w, h, name, cols, rows, lit, o) { o = o || {}; const col = o.col || INK;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5 });
    for (let i = 0; i < 6; i++) { const px = x + 14 + i * (w - 28) / 5; el('line', { x1: px, y1: y, x2: px, y2: y - 9, stroke: col, 'stroke-width': 2 }); el('line', { x1: px, y1: y + h, x2: px, y2: y + h + 9, stroke: col, 'stroke-width': 2 }); }
    const cw = (w - 24) / cols, ch = (h - 44) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, v = lit ? lit(i) : 0;
      el('rect', { x: x + 12 + c * cw, y: y + 34 + r * ch, width: cw - 2, height: ch - 2, rx: 2, fill: v > 0 ? (o.hot || ACC) : SOFT, opacity: v > 0 ? 0.3 + 0.7 * v : 1 }); }
    tx(x + 12, y + 22, name, { 'font-size': 14.5, 'font-weight': 800, fill: col }); }
  // 게이지 (memGauge)
  function gauge(x, y, w, used, total, label, o) { o = o || {}; const over = used > total;
    tx(x, y - 10, label, { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    el('rect', { x, y, width: w, height: 22, rx: 5, fill: SOFT, stroke: GRID });
    el('rect', { x, y, width: Math.max(2, w * clamp(used / total)), height: 22, rx: 5, fill: over ? BAD : (o.col || ACC) });
    mono(x + w, y - 10, (used < 1 ? used.toFixed(2) : used.toFixed(used < 10 ? 1 : 0)) + ' / ' + total + ' GB', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'end', fill: over ? BAD : INK }); }
  // 로그 눈금 속도 막대 (speedBars)
  function speed(x, y, bars, o) { o = o || {}; const W = o.w || 420, lo = Math.log10(0.05), hi = Math.log10(60), u = o.u ?? 1;
    tx(x, y - 14, '검색 1회 (ms, 로그 눈금)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    bars.forEach((b, i) => { const yy = y + i * 40; tx(x, yy + 15, b.label, { 'font-size': 14.5, 'font-weight': 700, fill: b.highlight ? ACC : INK });
      el('rect', { x: x + 200, y: yy, width: W - 200, height: 22, rx: 4, fill: SOFT });
      if (b.value == null) { mono(x + 210, yy + 16, '—', { 'font-size': 14, fill: OFF }); return; }
      const f = (Math.log10(b.value) - lo) / (hi - lo), g = o.grow && o.grow(i) != null ? o.grow(i) : 1;
      el('rect', { x: x + 200, y: yy, width: Math.max(3, (W - 200) * f * g), height: 22, rx: 4, fill: b.highlight ? ACC : MUT });
      mono(x + W + 8, yy + 16, b.value + ' ms', { 'font-size': 14.5, 'font-weight': 700, fill: b.highlight ? ACC : INK, opacity: g }); }); }

  // ---------- 1. CPU baseline ----------
  function s1(t, c) { const { k, u } = c, mg = c.beat.memGauge, pm = (c.prev && c.prev.memGauge) || mg;
    if (k === 0) { [['faiss', ACC], ['numpy', INFO], ['time', WARN]].forEach(([n, col], i) => pill(300 + i * 180, 190, 'import ' + n, col, pop(u, 0.3 + i * 0.35), { mono: true, fs: 16 }));
      note(480, 260, '아직 아무것도 재지 않았다', fade(u, 1.6), { 'text-anchor': 'middle', fill: MUT }); return; }
    // 벡터 띠 (100만 개)
    const fill = k === 1 ? E(u, 0.2, 1.6) : 1;
    tx(40, 44, 'vectors (1,000,000 × 128) float32', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    for (let i = 0; i < 40; i++) { if (i / 40 > fill) break; el('rect', { x: 40 + i * 12, y: 60, width: 10, height: 200, rx: 2, fill: INFO, opacity: 0.35 }); }
    const used = tween(pm.used, mg.used, u); gauge(40, 300, 470, used, mg.total, mg.label);
    if (k === 1) { mono(40, 360, '1,000,000 × 128 × 4 byte = 488 MB', { 'font-size': 15.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) }); return; }
    // CPU 칩 (코어 1개만 일한다)
    const scan = k === 3 ? E(u, 0.2, 2.4) : k > 3 ? 1 : 0;
    chip(620, 50, 300, 190, 'CPU', 4, 2, (i) => (i === 0 && k >= 3 ? 1 : 0), { hot: BAD });
    mono(620, 270, k === 2 ? 'IndexFlatL2 · ntotal 1,000,000' : 'index.search(query, k=10)', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: k === 2 ? fade(u, 0.3) : 1 });
    if (k === 2) { note(620, 300, '학습 없이 add 하면 끝', fade(u, 1.0), { fill: MUT }); return; }
    if (scan > 0) { const sx = 40 + scan * 480; el('line', { x1: sx, y1: 52, x2: sx, y2: 268, stroke: BAD, 'stroke-width': 3 }); el('rect', { x: 40, y: 60, width: sx - 40, height: 200, fill: BAD, opacity: 0.08 }); }
    if (k === 3) { mono(620, 320, (50.2 * scan).toFixed(1) + ' ms', { 'font-size': 30, 'font-weight': 800, fill: BAD });
      note(620, 356, '100만 개와 전부 거리를 잰다', fade(u, 1.0)); sub(770, 386, '이 PC 1스레드 실측 38~46 ms', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k 4: 초당 20건 상한
    mono(620, 316, '1000 ms ÷ 50 ms = 20 QPS', { 'font-size': 17, 'font-weight': 800, fill: BAD });
    for (let i = 0; i < 26; i++) { const done = i < 20, x = 620 + (i % 13) * 23, y = 340 + Math.floor(i / 13) * 22, a = clamp(E(u, 0.2, 2.0) * 26 - i);
      el('circle', { cx: x + 8, cy: y + 8, r: 7, fill: done ? GOOD : BAD, opacity: a }); }
    mono(40, 400, '1억 개로 늘리면 쿼리당 약 5초', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }

  // ---------- 2. GPU ----------
  function s2(t, c) { const { k, u } = c, mg = c.beat.memGauge, pm = (c.prev && c.prev.memGauge) || mg;
    // 왼쪽: CPU + RAM, 오른쪽: GPU + VRAM
    const gpuOn = k >= 0;
    chip(40, 40, 260, 150, 'CPU + RAM', 4, 2, () => 0);
    if (k >= 1) { el('rect', { x: 60, y: 210, width: 220, height: 60, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: k === 1 ? fade(u, 0.3) : 1 });
      mono(170, 246, 'cpu_index 100만', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: k === 1 ? fade(u, 0.3) : 1 }); }
    const lit = (i) => (k === 4 ? (u > 0.8 && u < 2.4 ? 1 : 0) : k === 5 ? 0.4 : 0);
    chip(500, 40, 420, 230, 'GPU (RTX 4090)', 24, 8, lit, { col: gpuOn ? ACC : OFF });
    const used = tween(pm.used, mg.used, u); gauge(500, 310, 420, used, mg.total, 'VRAM (GB)');
    if (k === 0) { mono(40, 330, 'pip install faiss-gpu', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      note(40, 362, 'CUDA 가 깔린 기계라야 한다', fade(u, 1.0), { fill: WARN }); return; }
    if (k === 1) { note(40, 330, 'CPU 에서 먼저 만들고', fade(u, 1.0)); note(40, 356, '나중에 GPU 로 옮긴다', fade(u, 1.3), { fill: MUT }); return; }
    if (k === 2) { el('rect', { x: 512, y: 250, width: 60 * E(u, 0.3, 1.2), height: 14, fill: WARN, opacity: 0.8 }); mono(40, 330, 'res = StandardGpuResources()', { 'font-size': 15, 'font-weight': 700, fill: WARN });
      note(40, 362, 'GPU 작업용 메모리 풀을 잡는다', fade(u, 1.0)); return; }
    // 복사 (PCIe)
    el('line', { x1: 300, y1: 240, x2: 500, y2: 240, stroke: GRID, 'stroke-width': 10 }); tx(400, 226, 'PCIe', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (k === 3) { for (let i = 0; i < 8; i++) { const a = seg(u, 0.2 + i * 0.2, 0.9 + i * 0.2); if (a > 0 && a < 1) el('rect', { x: lerp(290, 490, a), y: 233, width: 14, height: 14, fill: INFO }); }
      mono(40, 330, 'gpu_index = index_cpu_to_gpu(res, 0, cpu_index)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); return; }
    if (k === 4) { const bars = c.beat.speedBars.slice(0, 2).map((b, i) => ({ ...b, highlight: i === 1 }));
      speed(40, 322, bars, { w: 330, grow: (i) => (i === 1 ? E(u, 1.0, 1.8) : 1) });
      banner(710, 200, '같은 search · 100배', pop(u, 2.0)); return; }
    // k 5: 멀티 GPU
    ['샤드 1', '샤드 2', '샤드 3', '샤드 4'].forEach((n, i) => card(80 + i * 105, 340, 96, 40, { rx: 6, text: n, fs: 14, stroke: ACC, color: ACC, s: pop(u, 0.3 + i * 0.2) }));
    mono(40, 410, 'index_cpu_to_all_gpus(cpu_index)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
  }

  // ---------- 3. 메모리 벽 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { // 128 × 100만 → 768 × 1억
      const g = E(u, 0.4, 2.0);
      el('rect', { x: 60, y: 300, width: 30, height: 30, fill: INFO, opacity: 0.6 }); mono(60, 352, '128 × 100만', { 'font-size': 14.5, fill: INFO, 'font-weight': 700 });
      el('rect', { x: 200, y: lerp(300, 60, g), width: lerp(30, 180, g), height: lerp(30, 270, g), fill: BAD, opacity: 0.25, stroke: BAD, 'stroke-width': 2 });
      mono(200, 352, '768 × 1억', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      note(460, 140, '차원 × 6', fade(u, 0.8), { 'font-size': 18 }); note(460, 176, '개수 × 100', fade(u, 1.2), { 'font-size': 18 }); note(460, 220, 'BERT base 임베딩 규모', fade(u, 1.8), { fill: MUT }); return; }
    // 공통: 286 GB 막대 + 카드 한계선
    const H = 300, Y0 = 380, sc = (gb) => H * gb / 700;
    const need = k === 1 ? 286 * E(u, 0.6, 1.8) : 286;
    el('rect', { x: 80, y: Y0 - sc(need), width: 120, height: sc(need), rx: 4, fill: BAD, opacity: 0.8 });
    mono(140, Y0 - sc(need) - 10, Math.round(need) + ' GB', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); lbl(140, Y0 + 22, '필요량', 1, { 'font-size': 15 });
    el('line', { x1: 60, y1: Y0, x2: 920, y2: Y0, stroke: MUT, 'stroke-width': 2 });
    if (k === 1) { mono(300, 120, '768 × 4 byte = 3,072 byte', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(300, 156, '× 1억 = 286 GB', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) }); return; }
    const cards = [['RTX 4090', 24], ['A100', 80], ['H100', 80]];
    cards.forEach(([n, gb], i) => { const s = k === 2 ? E(u, 0.2 + i * 0.35, 0.9 + i * 0.35) : 1, x = 280 + i * 130;
      el('rect', { x, y: Y0 - sc(gb) * s, width: 90, height: sc(gb) * s, rx: 4, fill: ACC, opacity: 0.75 }); mono(x + 45, Y0 - sc(gb) * s - 8, gb + ' GB', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: s }); lbl(x + 45, Y0 + 22, n, s, { 'font-size': 14.5 }); });
    if (k === 2) { note(680, 120, '어떤 카드 한 장도', fade(u, 1.6)); note(680, 146, '286 GB 를 못 담는다', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 3) { const x = 690, s = E(u, 0.2, 1.6); for (let i = 0; i < 8; i++) { const h = sc(80); if (i / 8 < s) el('rect', { x, y: Y0 - h * (i + 1), width: 110, height: h - 2, rx: 2, fill: GOOD, opacity: 0.7 }); }
      mono(745, Y0 - sc(640) * s - 10, Math.round(640 * s) + ' GB', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); lbl(745, Y0 + 22, 'A100 × 8', 1, { 'font-size': 14.5 });
      note(670, 120, '월 $20,000+', fade(u, 1.8), { fill: BAD, 'text-anchor': 'end' }); return; }
    if (k === 4) { // 디스크 ↔ PCIe ↔ GPU
      zone(690, 60, 240, 300, null, { fill: PANEL, stroke: GRID });
      card(810, 110, 180, 50, { rx: 8, text: '디스크', fs: 15 }); card(810, 300, 180, 50, { rx: 8, text: 'GPU (24 GB)', fs: 15, stroke: ACC, color: ACC });
      el('line', { x1: 810, y1: 135, x2: 810, y2: 275, stroke: WARN, 'stroke-width': 4 }); for (let i = 0; i < 3; i++) dot([[810, 140], [810, 272]], ((t * 0.4 + i / 3) % 1), WARN, 5);
      mono(822, 200, 'PCIe ~32 GB/s', { 'font-size': 14, 'font-weight': 700, fill: WARN }); mono(822, 222, '286 GB ≈ 9초', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      note(700, 390, 'GPU 는 기다리기만 한다', fade(u, 1.8), { fill: BAD }); return; }
    // k 5: MemoryError
    terminal(560, 60, 370, 160, [['>>> cpu_index.add(np.empty((n, d), "float32"))', null], ['MemoryError', 'var(--bad)'], ['RAM 부족 — float32로는 불가능', null]], E(u, 0.2, 1.6) * 3, { title: 'python' });
    banner(745, 280, '답은 압축(quantization)', pop(u, 1.8)); }

  // ---------- 4. PQ + GPU ----------
  function s4(t, c) { const { k, u } = c, mg = c.beat.memGauge, pm = (c.prev && c.prev.memGauge) || mg;
    // 768칸 → 96조각 → 96 byte
    const X0 = 40, W = 880;
    tx(X0, 40, '벡터 1개: 768차원 float32 = 3,072 byte', { 'font-size': 15, 'font-weight': 700 });
    const split = k === 0 ? E(u, 0.5, 1.6) : 1;
    for (let i = 0; i < 96; i++) { const w = W / 96; el('rect', { x: X0 + i * w + (split * (i % 2)) * 0, y: 54, width: w - split * 2, height: 30, fill: i % 2 ? INFO : ACC, opacity: 0.45 }); }
    if (split > 0.3) mono(X0 + W, 104, '8차원 조각 × 96 (m=96)', { 'font-size': 14.5, 'text-anchor': 'end', fill: MUT, opacity: split });
    const codes = k === 0 ? E(u, 1.4, 2.4) : 1;
    for (let i = 0; i < 96; i++) { if (i / 96 > codes) break; const w = W / 96; el('rect', { x: X0 + i * w, y: 128, width: w - 2, height: 14, fill: WARN }); }
    if (codes > 0) mono(X0, 166, '조각마다 256개 중 하나의 번호 (nbits=8) → 96 byte', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: codes });
    if (k === 0) { mono(X0, 210, 'nlist = 4096 (IVF 셀)', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { const s = E(u, 0.2, 1.4); // 3,072 → 96 블록
      tx(X0, 220, '압축률', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 32; i++) el('rect', { x: X0 + i * 18, y: 236, width: 16, height: 30, fill: INFO, opacity: 0.5 * (1 - s * (i > 0 ? 1 : 0)) + 0.1 });
      el('rect', { x: X0, y: 236, width: 16, height: 30, fill: WARN }); mono(X0 + 600, 258, '32 : 1', { 'font-size': 22, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      mono(X0, 310, 'IndexIVFPQ(quantizer, 768, 4096, 96, 8)', { 'font-size': 15, 'font-weight': 700, fill: ACC }); mono(X0, 340, 'index.train(train)  # 학습 샘플 100만', { 'font-size': 15, fill: MUT }); return; }
    const used = tween(pm.used, mg.used, u);
    if (k === 2) { for (let i = 0; i < 20; i++) { const a = seg(u, 0.1 + i * 0.1, 0.6 + i * 0.1); if (a > 0 && a < 1) el('rect', { x: lerp(40, 460, a), y: 220 + (i % 4) * 16, width: 22, height: 12, fill: INFO, opacity: 0.7 }); }
      mono(X0, 320, 'for chunk in load_chunks(chunk=1_000_000): index.add(chunk)', { 'font-size': 14, fill: INK });
      const gb = lerp(286, 9, E(u, 0.4, 2.0)); mono(560, 250, Math.round(gb) + ' GB', { 'font-size': 32, 'font-weight': 800, fill: gb > 24 ? BAD : GOOD });
      note(560, 284, '100만 개씩 끊어 RAM 피크를 낮춘다', fade(u, 1.0), { fill: MUT }); return; }
    gauge(40, 220, 420, used, mg.total, mg.label || 'VRAM (GB)', { col: GOOD });
    if (k === 3) { mono(40, 300, 'gpu_index = index_cpu_to_gpu(res, 0, index)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC }); mono(40, 330, 'gpu_index.nprobe = 10', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) }); return; }
    if (k === 4) { speed(500, 230, c.beat.speedBars, { w: 300, grow: (i) => (i === 3 ? E(u, 0.6, 1.6) : 1) }); note(40, 310, 'IVF 로 셀을 좁히고', fade(u, 0.4)); note(40, 336, 'PQ 코드로 거리를 근사한다', fade(u, 0.8)); sub(240, 380, 'GPU 값은 페이지 예시 (재현 안 함)', 1, { 'font-size': 13.5 }); return; }
    // k 5: 정산
    const parts = [['PQ 코드 8.9', 8.94, WARN], ['id 0.75', 0.75, INFO]]; let x = 520;
    tx(520, 214, 'VRAM 24 GB 안', { 'font-size': 14.5, 'font-weight': 700 });
    parts.forEach(([n, v, col], i) => { const w = 400 * v / 24 * E(u, 0.2 + i * 0.4, 0.9 + i * 0.4); el('rect', { x, y: 226, width: w, height: 30, fill: col, opacity: 0.8 }); mono(x + 4, 276 + i * 22, n + ' GB', { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.4) }); x += w; });
    el('rect', { x: 520, y: 226, width: 400, height: 30, fill: 'none', stroke: INK, 'stroke-width': 2 });
    note(520, 350, '합계 약 9.7 GB · 같은 설정으로 약 2억 개까지', fade(u, 1.8), { fill: GOOD }); }

  // ---------- 5. 정확도 손실 ----------
  function s5(t, c) { const { k, u } = c, pts = (c.beat.tradeoff && c.beat.tradeoff.points) || [], prevN = (c.prev && c.prev.tradeoff && c.prev.tradeoff.points.length) || 0;
    if (k === 0) { for (let i = 0; i < 20; i++) el('rect', { x: 60 + (i % 10) * 34, y: 100 + Math.floor(i / 10) * 34, width: 30, height: 30, rx: 4, fill: INFO, opacity: clamp(E(u, 0.2, 1.6) * 20 - i) * 0.6 });
      mono(60, 210, 'queries (1000, 768)', { 'font-size': 16, 'font-weight': 800, fill: INFO }); note(60, 250, '이번에는 속도가 아니라 정답률을 잰다', fade(u, 1.6)); return; }
    if (k === 4) { // recall 정의: 두 집합의 겹침
      const s = E(u, 0.2, 1.2); el('circle', { cx: 330, cy: 210, r: 120, fill: GOOD, opacity: 0.15 * s, stroke: GOOD, 'stroke-width': 2 }); el('circle', { cx: 470, cy: 210, r: 120, fill: ACC, opacity: 0.15 * s, stroke: ACC, 'stroke-width': 2 });
      lbl(260, 80, '정답 top-10', s, { fill: GOOD }); lbl(540, 80, '검색 top-10', s, { fill: ACC });
      for (let i = 0; i < 9; i++) el('circle', { cx: 385 + (i % 3) * 16, cy: 185 + Math.floor(i / 3) * 22, r: 6, fill: INK, opacity: fade(u, 0.8 + i * 0.08) });
      el('circle', { cx: 260, cy: 210, r: 6, fill: GOOD, opacity: fade(u, 1.6) }); el('circle', { cx: 540, cy: 210, r: 6, fill: ACC, opacity: fade(u, 1.6) });
      mono(680, 190, 'recall@10 = 9 / 10', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.8) }); mono(680, 226, '= 0.9 (한 쿼리 예)', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
      mono(60, 390, '교집합 합계 / (쿼리 수 × k)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    // 산점도: x = 검색 ms (로그), y = recall
    const ax = R.axes(110, 50, 560, 300, { x: [-1.5, 2], y: [0.8, 1.02], yt: [0.85, 0.9, 0.95, 1.0], grid: true });
    [0.05, 0.1, 0.5, 5, 50].forEach((v) => mono(ax.X(Math.log10(v)), 372, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    tx(670, 400, '검색 ms (로그)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 }); tx(110, 38, 'recall@10', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    const show = k === 7 ? pts : pts;
    show.forEach((p, i) => { const fresh = i >= prevN, o = fresh ? pop(u, 0.3 + (i - prevN) * 0.35) : 1; if (o <= 0) return;
      const x = ax.X(Math.log10(p.speed)), y = ax.Y(p.recall), col = /OPQ/.test(p.label) ? GOOD : /PQ/.test(p.label) ? (p.active ? BAD : WARN) : /IVF/.test(p.label) ? INFO : MUT;
      el('circle', { cx: x, cy: y, r: 8 * o, fill: col });
      const OFF2 = { 'IndexFlatL2 (CPU)': [-12, -12], 'IndexFlatL2 (GPU)': [12, -12], 'IVF (nprobe=10)': [-12, 5] }, d = OFF2[p.label] || [12, 5];
      mono(x + d[0], y + d[1], p.label + ' ' + p.recall.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': d[0] < 0 ? 'end' : 'start', opacity: o }); });
    sub(820, 404, 'recall·GPU 값은 출력 예시', 1, { 'font-size': 13.5 });
    const RX = 700;
    if (k === 1) note(RX, 100, 'Flat = 정답 그 자체', fade(u, 1.0), { fill: MUT });
    if (k === 2) note(RX, 100, 'IVF 만 쓰면 0.97', fade(u, 1.0), { fill: INFO });
    if (k === 3) { note(RX, 100, 'PQ 를 얹으면 0.92', fade(u, 1.0), { fill: BAD }); }
    if (k === 5) note(RX, 100, '후보 6개가 모였다', fade(u, 1.4));
    if (k === 6) { [['m=96', '-8%p', WARN], ['m=48', '-15%p', BAD], ['OPQ m=96', '-5%p', GOOD]].forEach(([a, b, col], i) => { const o = fade(u, 0.3 + i * 0.4); mono(RX, 110 + i * 34, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: o }); mono(930, 110 + i * 34, b, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: o }); });
      note(RX, 240, '압축할수록 잃는다', fade(u, 1.8), { fill: MUT }); }
    if (k === 7) { const T = [[815, 80, '속도', 'GPU · nprobe'], [720, 250, '메모리', 'm'], [910, 250, '정확도', 'm · OPQ · nprobe']], s = E(u, 0.2, 1.2);
      el('path', { d: `M${T[0][0]},${T[0][1] + 18} L${T[1][0] + 10},${T[1][1] - 18} L${T[2][0] - 10},${T[2][1] - 18} Z`, fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: s });
      T.forEach(([x, y, a, b], i) => { const o = fade(u, 0.5 + i * 0.3); tx(x, y, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: o }); tx(x, y + 22, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, opacity: o }); }); } }

  const quiz = [
    { q: 'IndexFlatL2로 100만 개에서 한 번 검색하는 데 50 ms가 걸린다면, 한 프로세스가 감당하는 검색량은 얼마인가?',
      o: ['초당 약 20건', '초당 약 2,000건', '초당 약 500건'], a: 0,
      why: '1000 ms ÷ 50 ms = 20 QPS다. 메모리 488 MB는 넉넉해도 시간이 먼저 병목이 된다.' },
    { q: 'faiss-gpu에서 인덱스를 GPU로 보내는 표준 순서는 무엇인가?',
      o: ['GPU에서 바로 IndexFlatL2를 만들고 CPU로 복사한다', 'CPU에서 인덱스를 만들고 StandardGpuResources와 index_cpu_to_gpu로 옮긴다', 'search를 부를 때마다 벡터를 GPU로 보낸다'], a: 1,
      why: 'CPU 인덱스를 먼저 만들고, 리소스 핸들을 잡은 뒤 device 0으로 복사한다. 이후 search API는 그대로다.' },
    { q: '768차원 float32 벡터 1억 개를 원본 그대로 담는 데 필요한 메모리는 대략 얼마인가?',
      o: ['약 24 GB', '약 80 GB', '약 286 GB'], a: 2,
      why: '768 × 4 = 3,072 byte에 1억을 곱하면 286 GB다. 24 GB 카드는 물론 80 GB H100에도 안 들어간다.' },
    { q: 'IndexIVFPQ(768, nlist=4096, m=96, nbits=8)에서 벡터 하나는 몇 byte로 저장되는가?',
      o: ['96 byte', '768 byte', '3,072 byte'], a: 0,
      why: '8차원 조각 96개마다 256개 중 하나의 번호(1 byte)만 남긴다. 그래서 1억 개 코드가 약 9 GB다.' },
    { q: 'IVFPQ m=96의 recall@10이 0.92로 떨어졌을 때, 압축률을 유지하면서 정확도를 되찾는 방법으로 페이지가 든 것은 무엇인가?',
      o: ['m을 48로 줄인다', '앞에 OPQ 회전을 붙인다', 'GPU를 한 장 더 쓴다'], a: 1,
      why: '예시 측정에서 OPQ m=96은 0.95로 회복했다. m=48은 더 압축하는 대신 0.85로 더 떨어진다.' },
  ];

  const summary = [
    '100만 개 Flat 검색은 CPU에서 한 번에 약 50 ms라 초당 20건이 한계다.',
    'GPU로 옮기면 같은 search가 0.5 ms가 되지만 VRAM 크기를 넘는 데이터는 못 올린다.',
    '768차원 1억 개는 원본으로 286 GB라 PQ로 벡터당 96 byte까지 줄여야 GPU 한 장에 들어간다.',
    'PQ는 recall을 깎으므로 m, OPQ, nprobe를 바꿔 가며 내 데이터로 정확도를 잰다.',
  ];
  const review = [
    { q: '검색 요청이 초당 20건을 넘기 시작했는데 IndexFlatL2 하나로 버티고 있다. 먼저 무엇을 볼까?',
      o: ['GPU로 옮기거나 IVF 계열로 바꿔 검색 한 번의 시간을 줄인다', 'RAM을 두 배로 늘린다', 'k를 10에서 5로 줄인다'], a: 0,
      why: '50 ms짜리 전수 검색은 초당 20건이 상한이다. 메모리는 이미 넉넉하니 한 번의 계산량이나 계산 장치를 바꿔야 한다.' },
    { q: 'GPU 한 장에 인덱스를 올리려다 메모리 부족이 났다. 벡터는 768차원 1억 개다. 알맞은 다음 걸음은?',
      o: ['nprobe를 낮춘다', 'IVFPQ로 벡터당 96 byte 정도로 압축한 뒤 올린다', '쿼리를 배치로 묶는다'], a: 1,
      why: '원본은 286 GB라 어떤 카드에도 안 들어간다. 저장하는 벡터 자체를 줄여야 하고, nprobe나 배치는 메모리와 무관하다.' },
    { q: 'IVFPQ로 바꾼 뒤 빨라졌지만 고객이 결과가 덜 정확하다고 한다. 가장 먼저 해 볼 측정은?',
      o: ['VRAM 사용량을 다시 잰다', 'CPU Flat 속도를 다시 잰다', 'Flat 정답과 비교해 m·OPQ·nprobe 조합별 recall@10을 잰다'], a: 2,
      why: 'Flat 결과가 recall 1.00 기준선이다. 압축 설정마다 그 정답을 얼마나 되찾는지 재야 어디서 손실이 나는지 안다.' },
  ];

  R.page({ title: 'FAISS 속도·메모리·정확도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
