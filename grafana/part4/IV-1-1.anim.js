/* IV-1-1 Dashboard as JSON — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 필드판(fields)·diff 줄(diff)·함정 목록(traps)은 페이지 STEPS 의 beat 데이터를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, clock, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 지역 도우미 ──
  // 코드 상자: lines 를 n 줄까지(소수면 마지막 줄 타이핑), hl 줄은 띠로 강조
  function code(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 11, n = o.n ?? lines.length;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    for (let i = 0; i < lines.length; i++) { const vis = clamp(n - i); if (vis <= 0) break; let s = lines[i]; if (vis < 1) s = s.slice(0, Math.max(1, Math.round(s.length * vis)));
      const yy = y + 9 + i * lh;
      if (o.hl && o.hl.includes(i)) el('rect', { x: x + 5, y: yy + 1, width: w - 10, height: lh - 2, rx: 5, fill: o.hlc || ACCBG });
      spans(x + 14, yy + lh / 2 + fs * 0.36, tokens(s), { 'font-size': fs, opacity: o.rowOp ? o.rowOp(i) : o.dim && o.dim.includes(i) ? 0.35 : 1 }); }
    return (i) => y + 9 + i * lh + lh / 2; }
  // Grafana 대시보드 틀: 어두운 머리띠(제목) + 몸통
  function board(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8 });
    el('rect', { x, y, width: w, height: 34, rx: 10, fill: INK }); el('rect', { x, y: y + 24, width: w, height: 10, fill: INK });
    tx(x + 14, y + 23, title, { 'font-size': 15, 'font-weight': 700, fill: PANEL });
    if (o.right) mono(x + w - 12, y + 23, o.right, { 'font-size': 13.5, fill: PANEL, 'text-anchor': 'end', opacity: 0.85 }); }
  // 패널 하나: kind = line | bars | stat | gauge
  function panel(x, y, w, h, title, kind, o) { o = o || {}; const g = R.G(x + w / 2, y + h / 2, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 7, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6 }, g);
    tx(-w / 2 + 10, -h / 2 + 20, title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tc || INK }, g);
    const bx = -w / 2 + 12, by = -h / 2 + 30, bw = w - 24, bh = h - 40, u = o.u ?? 1;
    if (kind === 'line') { const ys = [0.6, 0.5, 0.65, 0.4, 0.45, 0.3, 0.35, 0.2], k = Math.max(2, Math.ceil(ys.length * u));
      el('polyline', { points: ys.slice(0, k).map((v, i) => `${bx + (i / (ys.length - 1)) * bw},${by + v * bh}`).join(' '), fill: 'none', stroke: o.col || ACC, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g); }
    if (kind === 'bars') [0.5, 0.7, 0.45, 0.85, 0.6, 0.75].forEach((v, i) => el('rect', { x: bx + i * (bw / 6) + 3, y: by + bh * (1 - v * u), width: bw / 6 - 6, height: bh * v * u, rx: 2, fill: INFO, opacity: 0.75 }, g));
    if (kind === 'stat') { el('rect', { x: bx, y: by + bh * 0.25, width: bw, height: bh * 0.5, rx: 5, fill: o.statCol || GOODBG }, g); }
    if (kind === 'gauge') { const r = Math.min(bw, bh * 1.6) / 2.2, cx = 0, cy = by + bh - 4;
      el('path', { d: `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`, fill: 'none', stroke: SOFT, 'stroke-width': 10 }, g);
      const a = Math.PI * (1 - 0.62 * u); el('path', { d: `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r * Math.cos(a)},${cy - r * Math.sin(a)}`, fill: 'none', stroke: WARN, 'stroke-width': 10 }, g); }
    return g; }
  function fileCard(cx, cy, name, sub2, o) { o = o || {}; const w = o.w || 190, h = 64, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    mono(-w / 2 + 12, -4, name, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || INK }, g);
    if (sub2) mono(-w / 2 + 12, 18, sub2, { 'font-size': 13.5, fill: MUT }, g); return g; }

  // 1. UI 편집 = JSON 문서
  const S1J = ['{', '  "title": "Service Health",', '  "uid": "service-health",', '  "schemaVersion": 39,', '  "version": 7,', '  "panels": [ … ],', '  "templating": { "list": [] },', '  "time": { "from": "now-6h", "to": "now" }', '}'];
  function s1(t, c) { const { k, u } = c, BX = 40, BY = 56, BW = 400, BH = 270;
    board(BX, BY, BW, BH, 'Service Health', { right: k >= 2 ? 'env ▾   Last 6 hours' : '' });
    [['p99 Latency', 'line'], ['RPS', 'bars'], ['Error Rate', 'stat'], ['CPU', 'gauge']].forEach(([n, kind], i) => {
      const s = k === 0 ? pop(u, 0.2 + i * 0.18) : 1; panel(BX + 14 + (i % 2) * 192, BY + 46 + Math.floor(i / 2) * 110, 180, 100, n, kind, { s, stroke: k === 2 ? ACC : GRID }); });
    const n = k === 0 ? lerp(0, S1J.length, E(u, 1.4, 2.6)) : S1J.length;
    const hl = k === 1 ? [1, 2, 3, 4] : k === 2 ? [5, 6, 7] : [];
    const row = code(500, BY, 430, S1J, { n, hl, fs: 14.5, lh: 29 });
    if (k === 0) { pill(BX + BW / 2, BY + BH + 34, '저장 (Save)', ACC, pop(u, 1.0), { fs: 14 }); dot([[BX + BW, BY + 140], [500, BY + 140]], seg(u, 1.1, 1.7), ACC, 7); }
    if (k === 1) [['제목', 1], ['영구 식별자', 2], ['모델 버전', 3], ['저장마다 +1', 4]].forEach(([s, i], j) => pill(842, row(i), s, INFO, pop(u, 0.3 + j * 0.3), { fs: 13.5 }));
    if (k === 2) { grow(500, row(5), BX + BW - 10, BY + 120, E(u, 0.2, 0.9), ACC);
      grow(500, row(6), BX + BW - 150, BY + 40, E(u, 0.9, 1.6), ACC); grow(500, row(7), BX + BW - 50, BY + 40, E(u, 1.6, 2.3), ACC);
      sub(470, BY + BH + 40, '보이는 모든 것은 이 세 필드에서 나온다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
    if (k === 3) { [['⚙ Settings › JSON Model', 0.2], ['Share › Export', 0.9]].forEach(([s, a], j) => { const y = BY + BH + 30 + j * 0; pill(150 + j * 220, y + 8, s, INK, pop(u, a), { fs: 14 }); });
      fly(BX + BW / 2, BY + 140, 715, BY + 140, seg(u, 1.4, 2.4), 'dashboard.json', { mono: true }); }
    if (k === 4) { [['diff', '− 0.05  + 0.02', BAD], ['리뷰', 'PR에 댓글', INFO], ['롤백', 'git revert', GOOD]].forEach(([a, b, col], j) => {
        const cx = 560 + j * 130, s = pop(u, 0.3 + j * 0.4); card(cx, 375, 120, 54, { rx: 10, stroke: col, sw: 2.2, s });
        tx(cx, 370, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + j * 0.4) });
        mono(cx, 391, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + j * 0.4) }); });
      sub(240, 375, '텍스트라서 가능한 일', fade(u, 0.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // 2. 최상위 뼈대 + gridPos
  function s2(t, c) { const { k, u } = c, b = c.beat, pf = (c.prev && c.prev.fields) || [], fields = b.fields || [];
    tx(40, 44, 'JSON 최상위 필드', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    fields.forEach((f, i) => { const isNew = !pf.find((p) => p.key === f.key), y = 62 + i * 52, sl = isNew ? E(u, 0.2, 0.9) : 1;
      const hot = (k === 5 && (f.key === 'panels' || f.key === 'templating')) || (isNew && k < 5);
      const g = R.G(lerp(-30, 0, sl), 0, 1, sl);
      el('rect', { x: 40, y, width: 400, height: 42, rx: 8, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.2 : 1.5 }, g);
      mono(56, y + 27, f.key, { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : INK }, g);
      mono(186, y + 27, f.label, { 'font-size': 14.5, fill: INK }, g);
      tx(428, y + 27, f.hint, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g); });
    // 오른쪽: 24칸 격자 위의 대시보드
    const GX = 500, GY = 56, GW = 420, col = GW / 24, rowH = 17;
    board(GX, GY, GW, 300, 'Service Health', { right: '/d/service-health' });
    if (k === 0) sub(GX + GW / 2, GY + 170, 'panels가 아직 비어 있다', fade(u, 0.8), { 'font-size': 14.5 });
    if (k >= 1) { const by = GY + 100; el('line', { x1: GX + 10, y1: by - 12, x2: GX + GW - 10, y2: by - 12, stroke: GRID, 'stroke-width': 1.5 });
      [0, 12, 24].forEach((v) => { el('line', { x1: GX + v * col, y1: by - 17, x2: GX + v * col, y2: by - 7, stroke: MUT, 'stroke-width': 1.5 }); mono(GX + v * col + (v === 24 ? -4 : v === 0 ? 4 : 0), by - 22, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': v === 24 ? 'end' : v === 0 ? 'start' : 'middle' }); });
      const gw = k === 1 ? lerp(1, 12, E(u, 0.3, 1.4)) : 12, gh = k === 1 ? lerp(1, 8, E(u, 0.3, 1.4)) : 8;
      panel(GX + 4, by, gw * col - 8, gh * rowH, gw > 6 ? 'p99 Latency' : '', 'line', { u: k >= 2 ? (k === 2 ? E(u, 1.0, 2.4) : 1) : 0, stroke: k === 1 || k === 2 ? ACC : GRID });
      mono(GX + 12 * col + 14, by + 22, 'gridPos', { 'font-size': 14, 'font-weight': 700, fill: k === 1 ? ACC : MUT, opacity: k === 1 ? fade(u, 1.2) : 1 });
      mono(GX + 12 * col + 14, by + 44, 'x 0 · y 0', { 'font-size': 14, fill: INK, opacity: k === 1 ? fade(u, 1.3) : 1 });
      mono(GX + 12 * col + 14, by + 66, 'w 12 · h 8', { 'font-size': 14, fill: INK, opacity: k === 1 ? fade(u, 1.4) : 1 });
      if (k === 1) sub(GX + GW / 2, GY + 290, '한 줄 = 24칸, 패널은 왼쪽 절반', fade(u, 1.8)); }
    if (k === 2) { fly(GX + 100, GY + 200, GX + 330, GY + 262, seg(u, 0.2, 1.0), 'refId A', { mono: true, stay: true });
      mono(GX + 14, GY + 290, 'histogram_quantile(0.99, … [5m])', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.9) }); }
    if (k >= 3) { const op = k === 3 ? fade(u, 0.2) : 1; card(GX + 62, GY + 54, 110, 26, { rx: 6, text: 'env: prod ▾', fs: 13.5, mono: true, stroke: k === 3 ? ACC : GRID, sw: 1.8, op });
      if (k === 3) ['prod', 'staging', 'dev'].forEach((s, i) => card(GX + 166 + i * 88, GY + 54, 80, 26, { rx: 4, text: s, fs: 13.5, mono: true, stroke: GRID, sw: 1.2, fill: i === 0 ? ACCBG : PANEL, s: pop(u, 0.6 + i * 0.25) }));
      if (k === 3) mono(GX + 14, GY + 290, '{env="$env"} → {env="prod"}', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k >= 4) { const op = k === 4 ? fade(u, 0.2) : 1; card(GX + 360, GY + 54, 96, 26, { rx: 6, text: 'now-6h', fs: 13.5, mono: true, stroke: k === 4 ? ACC : GRID, sw: 1.8, op });
      if (k === 4) { const x0 = GX + 20, x1 = GX + GW - 20, yy = GY + 290; el('line', { x1: x0, y1: yy, x2: lerp(x0, x1, E(u, 0.4, 1.6)), y2: yy, stroke: ACC, 'stroke-width': 4, 'stroke-linecap': 'round' });
        mono(x0, yy - 12, 'now-6h', { 'font-size': 13.5, fill: MUT }); mono(x1, yy - 12, 'now', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.5) }); } }
    if (k === 5) banner(GX + GW / 2, GY + 290, 'targets = 쿼리 · templating = 변수', pop(u, 0.4)); }

  // 3. Export → Git diff → PR
  function s3(t, c) { const { k, u } = c, b = c.beat, pd = (c.prev && c.prev.diff) || [], diff = b.diff || [];
    const DX = 40, DY = 50, DW = 540;
    el('rect', { x: DX, y: DY, width: DW, height: 36, rx: 8, fill: INK });
    mono(DX + 14, DY + 24, 'PR #142 · service-health.json', { 'font-size': 14, fill: PANEL });
    const ver = k === 0 ? tween(7, 8, u) : 8; mono(DX + DW - 14, DY + 24, `version ${Math.round(ver)}`, { 'font-size': 14, 'font-weight': 700, fill: k === 0 ? 'var(--warn)' : PANEL, 'text-anchor': 'end' });
    if (k === 0) { card(760, 150, 220, 110, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 0.2) }); tx(760, 128, 'version', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.3) });
      mono(760, 172, ver >= 7.5 ? '7 → 8' : '7', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      mono(DX + 14, DY + 70, 'uid: service-health', { 'font-size': 15, fill: INK, opacity: fade(u, 0.2) }); sub(DX + 380, DY + 70, '같은 보드, 커밋 하나', fade(u, 1.2), { fill: INK, 'font-size': 14.5 }); }
    diff.forEach((d, i) => { const isNew = i >= pd.length, y = DY + 44 + i * 40, o = isNew ? E(u, 0.3, 1.0) : 1;
      const bg = d.sign === '+' ? GOODBG : d.sign === '-' ? BADBG : PANEL, fc = d.sign === '+' ? GOOD : d.sign === '-' ? BAD : MUT;
      el('rect', { x: DX, y, width: DW * o, height: 34, fill: bg, stroke: GRID, 'stroke-width': 1 });
      if (o > 0.6) mono(DX + 10, y + 22, (d.sign + ' ' + d.text.trim()).replace(/\s+/g, ' '), { 'font-size': 13.5, fill: fc, 'font-weight': d.sign === ' ' ? 400 : 700 }); });
    if (k === 1) { panel(616, 50, 304, 150, 'Error Rate (stat)', 'stat', { stroke: ACC, sw: 2.2, s: pop(u, 0.6) });
      mono(768, 182, 'id 3 · type stat', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      grow(DX + DW, DY + 61, 612, 125, E(u, 1.2, 1.9), ACC); }
    if (k === 2) ['fieldConfig', 'defaults', 'thresholds', 'steps'].forEach((s, i) => pill(DX + 70 + i * 132, DY + 186, s, INFO, pop(u, 0.9 + i * 0.25), { mono: true, fs: 13.5 }));
    // 오른쪽: Error Rate stat 패널의 색 임계값
    if (k >= 2 && k <= 3) { const PX = 616, PY = 50, PW = 304, thr = k === 3 ? tween(0.05, 0.02, u) : 0.05, X = (v) => PX + 20 + (v / 0.06) * (PW - 40);
      panel(PX, PY, PW, 150, 'Error Rate (stat)', null, { stroke: k === 3 ? BAD : GRID, sw: 2 });
      el('rect', { x: X(0), y: PY + 70, width: X(thr) - X(0), height: 22, fill: GOOD, opacity: 0.8 }); el('rect', { x: X(thr), y: PY + 70, width: X(0.06) - X(thr), height: 22, fill: BAD, opacity: 0.8 });
      [0, 0.02, 0.05].forEach((v) => { el('line', { x1: X(v), y1: PY + 94, x2: X(v), y2: PY + 102, stroke: MUT }); mono(X(v), PY + 118, (v * 100) + '%', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      mono(X(thr), PY + 62, 'red ≥ ' + thr.toFixed(2), { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
      sub(PX + PW / 2, PY + 176, '색이 바뀌는 기준 (경보 규칙과 별개)', 1, { 'font-size': 13.5 }); }
    if (k >= 4) { const y = 330, xs = [80, 250, 420, 590, 760], lab = ['main', 'branch', 'commit', 'PR 리뷰', 'merge'];
      el('line', { x1: 60, y1: y, x2: lerp(60, 880, k === 4 ? E(u, 0.1, 2.2) : 1), y2: y, stroke: MUT, 'stroke-width': 3 });
      const bu = k === 4 ? E(u, 0.5, 1.8) : 1; el('path', { d: `M${xs[0]},${y} C${xs[0] + 80},${y} ${xs[1] - 60},${y - 50} ${xs[1]},${y - 50} L${lerp(xs[1], xs[3], bu)},${y - 50}`, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: bu > 0 ? 1 : 0 });
      if (bu >= 1) el('path', { d: `M${xs[3]},${y - 50} C${xs[3] + 80},${y - 50} ${xs[4] - 60},${y} ${xs[4]},${y}`, fill: 'none', stroke: ACC, 'stroke-width': 3 });
      xs.forEach((x, i) => { const yy = i >= 1 && i <= 3 ? y - 50 : y, s = k === 4 ? pop(u, 0.3 + i * 0.4) : 1; el('circle', { cx: x, cy: yy, r: 9 * s, fill: i === 4 ? GOOD : i ? ACC : PANEL, stroke: i ? 'none' : INK, 'stroke-width': 2.5 });
        tx(x, yy + (i >= 1 && i <= 3 ? -18 : 30), lab[i], { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: k === 4 ? fade(u, 0.4 + i * 0.4) : 1 }); });
      if (k === 5) [['commit', '변경 이력'], ['PR review', '책임 추적'], ['revert', '한 줄 롤백']].forEach(([a, b2], i) => { const cx = 700, cy = 80 + i * 66, s = pop(u, 0.2 + i * 0.35);
        card(cx, cy, 220, 54, { rx: 10, stroke: GOOD, sw: 2, s }); mono(cx - 96, cy + 5, a, { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3 + i * 0.35) });
        tx(cx + 98, cy + 5, b2, { 'font-size': 14.5, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.35) }); }); } }

  // 4. Import → 다른 환경
  const BODY = ['{', '  "dashboard": {', '    "uid": "service-health",', '    "panels": [ … Git 정의 … ]', '  },', '  "folderUid": "team-platform",', '  "overwrite": true,', '  "message": "deploy from git @a1b2c3d"', '}'];
  function inst(x, y, name, boards, o) { o = o || {}; el('rect', { x, y, width: 240, height: 56 + boards.length * 54, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 2 });
    tx(x + 14, y + 24, name, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INK });
    boards.forEach(([t2, uid, st], i) => { const s = st && st.s != null ? st.s : 1, yy = y + 36 + i * 54; const g = R.G(x + 120, yy + 24, s);
      el('rect', { x: -108, y: -23, width: 216, height: 46, rx: 6, fill: (st && st.fill) || SOFT, stroke: (st && st.stroke) || 'none', 'stroke-width': 1.8 }, g);
      tx(-98, -3, t2, { 'font-size': 14, 'font-weight': 700 }, g); mono(-98, 16, 'uid ' + uid, { 'font-size': 13.5, fill: MUT }, g); }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) {
      fileCard(130, 110, 'service-health.json', 'Git · uid 고정', { w: 196 });
      const when = [0, 0, 1, 1, 0, 2, 2, 2, 0], rowOp = (i) => (when[i] < k ? 1 : when[i] === k ? fade(u, 0.4 + (i % 4) * 0.3) : 0);
      const row = code(250, 140, 380, BODY, { fs: 13.5, lh: 24, rowOp, hl: k === 1 ? [2, 3] : k === 2 ? [5, 6, 7] : [] });
      pill(440, 118, 'POST /api/dashboards/db', ACC, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
      if (k === 0) grow(228, 110, 300, 118, E(u, 0.5, 1.2), ACC);
      inst(680, 60, 'staging', k >= 1 ? [['Service Health', 'service-health', { s: k === 1 ? pop(u, 0.8) : 1 }]] : [], {});
      inst(680, 196, 'prod', k >= 3 ? [['Service Health', 'service-health', { s: pop(u, 1.6), stroke: GOOD, fill: GOODBG }]] : [], { stroke: k === 3 ? GOOD : null });
      if (k === 1) mono(620, row(2) + 5, '← 열쇠', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      if (k === 3) { pill(440, 400, 'curl -H "Authorization: Bearer $GRAFANA_TOKEN"', INK, pop(u, 0.2), { mono: true, fs: 13.5 });
        dot([[630, 260], [655, 260], [680, 262]], seg(u, 0.6, 1.5), ACC, 7); check(898, 216, 10, pop(u, 2.0)); sub(800, 330, '사람이 클릭할 자리가 없다', fade(u, 2.1), { 'font-size': 14, fill: INK }); }
      return; }
    if (k === 4) { tx(40, 46, 'Import 할 때 uid가 정하는 결과', { 'font-size': 16, 'font-weight': 800 });
      [['같은 uid + overwrite:true', '기존 보드를 덮어쓴다', 'service-health', GOOD], ['새 uid', '보드가 하나 더 생긴다', 'service-health-v2', INFO], ['uid 생략', '랜덤 uid → 환경마다 다름', 'uid ?', BAD]].forEach(([a, b2, uid, col], i) => {
        const y = 100 + i * 96, s = pop(u, 0.2 + i * 0.6); card(200, y, 300, 56, { rx: 10, text: a, fs: 15, mono: true, stroke: col, sw: 2.2, s });
        grow(356, y, 520, y, E(u, 0.5 + i * 0.6, 1.0 + i * 0.6), col === BAD ? BAD : col === GOOD ? ACC : MUT);
        card(690, y, 300, 56, { rx: 10, stroke: col, fill: PANEL, sw: 2, s: pop(u, 0.9 + i * 0.6) });
        tx(560, y - 4, b2, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.6) }); mono(560, y + 17, uid, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0 + i * 0.6) }); });
      return; }
    // k5 라이브러리 패널
    tx(480, 46, '라이브러리 패널 — 정의는 한 곳, 쓰는 곳은 여럿', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
    panel(390, 90, 180, 110, 'Error Rate', 'stat', { s: pop(u, 0.2), stroke: ACC, sw: 2.4 });
    ['Service Health', 'Checkout', 'Nodes'].forEach((n2, i) => { const cx = 170 + i * 310, cy = 320;
      grow(480, 202, cx, cy - 46, E(u, 0.6 + i * 0.3, 1.3 + i * 0.3), ACC, { dash: '6 5' });
      board(cx - 120, cy - 44, 240, 110, n2, {}); el('rect', { x: cx - 100, y: cy, width: 90, height: 44, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6, opacity: fade(u, 1.2 + i * 0.3) });
      tx(cx - 55, cy + 27, '참조', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.3) }); });
    sub(480, 412, '패널 하나만 고치면 세 보드가 함께 바뀐다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); }

  // 5. 실무 함정 — 위는 그 beat 의 사고, 아래는 쌓이는 함정 목록(traps)
  function trapRow(c) { const b = c.beat, pt = (c.prev && c.prev.traps) || [], traps = b.traps || [];
    traps.forEach((tr, i) => { const isNew = i >= pt.length, s = isNew ? pop(c.u, 0.3) : 1, cx = 130 + i * 233;
      card(cx, 382, 218, 50, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s, text: tr.name, fs: 15, color: BAD }); }); }
  function s5(t, c) { const { k, u } = c;
    trapRow(c);
    if (k === 0) { fileCard(130, 150, 'dashboards.yml', 'provider', { w: 180 });
      const yl = ['providers:', '  - name: team-platform', '    folderUid: team-platform', '    type: file'];
      code(260, 70, 330, yl, { n: lerp(0, 4, E(u, 0.2, 1.4)), fs: 14, lh: 28 });
      grow(595, 140, 690, 140, E(u, 1.4, 2.0), ACC); zone(700, 90, 220, 110, 'Grafana 폴더', { stroke: ACC, op: fade(u, 1.8) });
      mono(714, 150, 'Team-Platform', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { board(60, 50, 420, 220, 'Service Health', { right: 'provisioned' }); panel(76, 98, 190, 100, 'Error Rate', 'stat', {}); panel(276, 98, 190, 100, 'RPS', 'bars', {});
      card(410, 236, 90, 34, { rx: 8, text: 'Save', fs: 15, stroke: INK, sw: 2, s: 1 }); el('circle', { cx: lerp(300, 410, E(u, 0.1, 0.6)), cy: lerp(300, 240, E(u, 0.1, 0.6)), r: 7, fill: ACC, opacity: 1 - fade(u, 0.8) });
      cross(466, 236, 12, pop(u, 0.7));
      card(720, 150, 360, 120, { rx: 12, stroke: BAD, sw: 2.5, s: pop(u, 0.9) });
      tx(720, 130, 'Cannot save provisioned dashboard', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) });
      tx(720, 160, 'allowUiUpdates: false', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', fill: INK, opacity: fade(u, 1.3) });
      tx(720, 186, 'JSON을 복사해 파일에 반영하라', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 2) { fileCard(140, 150, 'platform/*.json', '/etc/grafana/dashboards', { w: 230 });
      clock(480, 150, 40, E(u, 0.2, 2.6), ACC, 'updateIntervalSeconds: 30'); grow(258, 150, 432, 150, E(u, 0.2, 0.7), MUT); grow(528, 150, 690, 150, E(u, 0.7, 1.2), ACC);
      board(700, 92, 220, 120, 'Team-Platform', {}); [0, 1].forEach((i) => panel(712 + i * 102, 136, 94, 66, i ? 'Error' : 'p99', i ? 'stat' : 'line', { s: pop(u, 1.3 + i * 0.2) }));
      sub(480, 250, '파일이 바뀌면 30초 안에 보드가 바뀐다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { // 왼쪽: 드리프트, 오른쪽: uid 충돌
      tx(230, 46, '드리프트', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD });
      fileCard(120, 110, 'Git JSON', 'red 0.02', { w: 150 }); card(330, 110, 150, 64, { rx: 8, stroke: WARN, sw: 2.2, text: 'UI 수정\n(파일에 없음)', fs: 14 });
      grow(197, 110, 253, 110, E(u, 0.6, 1.4), BAD); cross(398, 80, 11, pop(u, 1.5)); sub(230, 200, '다음 배포 때 UI 수정이 조용히 사라진다', fade(u, 1.6), { 'font-size': 13.5, fill: INK });
      tx(720, 46, 'uid 충돌', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD });
      fileCard(620, 110, 'checkout.json', 'uid: board-1', { w: 170 }); fileCard(820, 110, 'refund.json', 'uid: board-1', { w: 170 });
      grow(620, 144, 710, 200, E(u, 0.9, 1.5), BAD); grow(820, 144, 730, 200, E(u, 0.9, 1.5), BAD); card(720, 222, 130, 40, { rx: 8, stroke: BAD, sw: 2.2, text: '보드 한 칸', fs: 14, s: pop(u, 1.6) });
      sub(720, 270, '복붙한 uid는 서로를 덮어쓴다 (예시)', fade(u, 1.9), { 'font-size': 13.5, fill: INK }); return; }
    if (k === 4) { fileCard(140, 120, 'old.json', 'schemaVersion 낮음', { w: 200 }); grow(244, 120, 380, 120, E(u, 0.2, 0.8), ACC);
      card(470, 120, 160, 56, { rx: 10, stroke: ACC, sw: 2, text: '자동 마이그레이션', fs: 14, s: pop(u, 0.7) }); grow(552, 120, 680, 120, E(u, 1.0, 1.5), ACC);
      fileCard(790, 120, 'Export', 'schemaVersion 39', { w: 200, s: pop(u, 1.4) });
      [['chore: schemaVersion 상향', WARN], ['feat: 임계값 5% → 2%', ACC]].forEach(([s, col], i) => { const y = 220 + i * 46; el('circle', { cx: 300, cy: y, r: 8, fill: col, opacity: fade(u, 1.7 + i * 0.4) });
        mono(320, y + 5, s, { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.7 + i * 0.4) }); });
      el('line', { x1: 300, y1: 228, x2: 300, y2: 258, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 2.1) }); sub(700, 245, '커밋을 둘로 나눈다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 5) { const L = ['{', '  "title": "Error Rate"', '  "type": "stat",', '}'];
      code(80, 70, 380, L, { fs: 15, lh: 32, hl: [1], hlc: BADBG });
      mono(312, 128, '← , 빠짐', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
      card(700, 100, 300, 50, { rx: 10, text: 'UI에서 편집', fs: 15, stroke: GOOD, sw: 2, s: pop(u, 1.0) }); grow(700, 126, 700, 176, E(u, 1.3, 1.7), ACC);
      card(700, 200, 300, 50, { rx: 10, text: 'Export → 파일 덮어쓰기', fs: 15, stroke: GOOD, sw: 2, s: pop(u, 1.6) });
      sub(270, 250, 'JSON을 손으로 고치면 괄호·쉼표가 깨지기 쉽다', fade(u, 0.9), { fill: INK, 'font-size': 14 }); return; }
    // k6: 진실은 Git
    const P = [[170, 160, 'UI 편집'], [400, 80, 'Export'], [630, 160, 'Git (진실)'], [400, 260, 'provisioning']];
    P.forEach(([x, y, s], i) => card(x, y, 170, 52, { rx: 26, text: s, fs: 15, stroke: i === 2 ? ACC : INK, color: i === 2 ? ACC : INK, sw: i === 2 ? 3 : 2, fill: i === 2 ? ACCBG : PANEL, s: pop(u, 0.2 + i * 0.3) }));
    const route = [[170, 134], [330, 80], [630, 134], [470, 260], [170, 186]]; dot(route, (t * 0.35) % 1, ACC, 8);
    [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([a, b2], i) => { const [x1, y1] = P[a], [x2, y2] = P[b2]; grow(x1 + (x2 - x1) * 0.28, y1 + (y2 - y1) * 0.28, x1 + (x2 - x1) * 0.72, y1 + (y2 - y1) * 0.72, E(u, 0.4 + i * 0.3, 0.9 + i * 0.3), ACC); });
    card(830, 210, 170, 64, { rx: 10, text: '운영 반영은\n파일로만', fs: 15, stroke: GOOD, sw: 2, s: pop(u, 1.8) }); }

  const quiz = [
    { q: 'UI에서 패널을 옮기고 저장하면 실제로 바뀌는 것은 무엇인가?',
      o: ['Grafana 서버의 그림 파일', '대시보드 JSON 문서의 내용', '브라우저 쿠키'], a: 1,
      why: 'UI는 JSON을 편하게 만지는 편집기다. 저장하면 panels·gridPos 같은 필드가 바뀌고 version이 1 오른다.' },
    { q: '패널이 화면 어디에 얼마나 크게 놓일지 정하는 필드는 무엇인가?',
      o: ['targets', 'templating', 'gridPos'], a: 2,
      why: 'gridPos의 x·y·w·h가 24칸 격자 위 자리와 크기다. 예제의 w 12는 화면 폭의 절반이다.' },
    { q: 'PR diff에서 red 값이 0.05에서 0.02로 바뀌었다. 무엇이 달라지나?',
      o: ['Error Rate 패널이 빨갛게 바뀌는 기준이 5%에서 2%로 내려간다', '대시보드 uid가 바뀐다', '쿼리의 [5m] 범위가 2분으로 줄어든다'], a: 0,
      why: 'thresholds.steps는 패널 색 기준이다. percentunit이라 0.02는 2%를 뜻한다.' },
    { q: 'uid를 빼고 POST /api/dashboards/db로 Import하면 어떻게 되나?',
      o: ['기존 보드를 덮어쓴다', '랜덤 uid의 새 보드가 생겨 환경마다 주소가 달라진다', '요청이 거절된다'], a: 1,
      why: '같은 uid와 overwrite:true일 때만 기존 보드를 업데이트한다. uid가 없으면 새 보드가 랜덤 uid로 만들어진다.' },
    { q: 'provider에 allowUiUpdates: false를 걸면 UI에서 Save를 누를 때 무슨 일이 생기나?',
      o: ['저장되고 30초 뒤 되돌아간다', '저장되고 Git에 자동 커밋된다', 'Cannot save provisioned dashboard 창이 뜨고 저장되지 않는다'], a: 2,
      why: 'provisioned 보드는 UI 저장이 막힌다. 바꾸려면 JSON을 파일에 반영해 provisioning 경로로 내보낸다.' },
  ];

  const summary = [
    'UI에서 패널을 끌고 저장하는 일은 대시보드 JSON 한 장을 고치는 일이다.',
    'JSON을 열면 uid와 panels를 먼저 보고, 쿼리는 targets, 자리는 gridPos에서 찾는다.',
    'JSON을 Git에 두면 임계값 0.05를 0.02로 바꾼 한 줄도 PR에서 리뷰된다.',
    '같은 uid로 Import하면 어느 환경이든 같은 보드가 되고, UI 저장은 allowUiUpdates:false로 막는다.',
  ];
  const review = [
    { q: '운영자가 급히 UI에서 임계값을 고쳤는데 다음 배포 뒤 원래 값으로 돌아갔다. 먼저 의심할 것은?',
      o: ['Git의 JSON이 진실이라 배포가 파일 내용으로 덮어썼다', 'schemaVersion이 낮아서 값이 지워졌다', '브라우저 캐시가 옛 값을 보여 준다'], a: 0,
      why: 'UI 수정이 파일에 반영되지 않은 드리프트다. 고친 내용을 Export해 PR로 올려야 다음 배포에도 남는다.' },
    { q: 'staging 보드를 prod로 옮겼더니 prod에 같은 이름의 보드가 둘 생겼다. 가장 그럴듯한 원인은?',
      o: ['overwrite:true를 줘서', 'JSON에서 uid를 빼고 보냈거나 다른 uid를 보냈다', 'message 필드를 비워서'], a: 1,
      why: 'Import는 uid로 같은 보드를 찾는다. uid가 없거나 다르면 기존 보드를 두고 새 보드를 만든다.' },
    { q: 'Grafana를 올린 뒤 옛 보드를 Export했더니 diff가 수십 줄 생겼다. 어떻게 커밋하나?',
      o: ['임계값 변경과 한 커밋에 묶는다', 'diff가 지저분하니 커밋하지 않는다', 'schemaVersion 상향 커밋과 내용 변경 커밋을 나눈다'], a: 2,
      why: '낮은 schemaVersion은 자동으로 39까지 올라가며 많은 줄을 바꾼다. 마이그레이션을 따로 커밋해야 실제 변경이 리뷰에 보인다.' },
  ];

  R.page({ title: 'Dashboard as JSON', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
