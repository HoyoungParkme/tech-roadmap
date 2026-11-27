/* V-2-2 Thanos vs Cortex vs Mimir — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (x, y, s, frac, a) => { const n = Math.round(s.length * clamp(frac)); if (n > 0) mono(x, y, s.slice(0, n), a); };
  function prom(cx, cy, name, o) { o = o || {}; const w = o.w || 170, h = o.h || 56, g = G(cx, cy, o.s, o.op), col = o.col || ACC;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    el('circle', { cx: -w / 2 + 17, cy: 0, r: 6, fill: col }, g); tx(-w / 2 + 30, 6, name, { 'font-size': 15.5, 'font-weight': 800 }, g); return g; }
  // 오브젝트 스토리지 버킷
  function bucket(cx, cy, label, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('path', { d: 'M-62,-34 L-50,34 Q0,46 50,34 L62,-34', fill: WARNBG, stroke: WARN, 'stroke-width': 2.5 }, g); el('ellipse', { cx: 0, cy: -34, rx: 62, ry: 12, fill: PANEL, stroke: WARN, 'stroke-width': 2.5 }, g);
    tx(0, 8, label || 'S3', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN }, g);
    if (o.sub) tx(0, 64, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  function box(cx, cy, s, col, o) { o = o || {}; return card(cx, cy, o.w || tw(s, 15) + 34, o.h || 46, { rx: 10, text: s, fs: o.fs || 15, fw: 800, stroke: col || INK, color: col || INK, s: o.s, op: o.op, mono: o.mono, dash: o.dash }); }

  // ── 1. 단일 Prometheus 의 벽
  function s1(t, c) { const { k, u } = c, P = [150, 110];
    prom(P[0], P[1], 'Prometheus', { s: k === 0 ? pop(u, 0.1) : 1 });
    if (k >= 1) { pill(P[0], P[1] + 52, 'region: ap-northeast-2', ACC, k === 1 ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 }); pill(P[0], P[1] + 88, 'replica: A', ACC, k === 1 ? pop(u, 0.6) : 1, { mono: true, fs: 13.5 }); }
    if (k === 0) { [['장기 저장', '15일이 지나면 지운다', 80], ['글로벌 뷰', '리전마다 따로 안다', 200], ['수평 확장', '한 대의 한계가 곧 상한', 320]].forEach(([a, b, y], i) => {
        const s = pop(u, 0.4 + i * 0.4); grow(P[0] + 86, P[1], 470, y, E(u, 0.3 + i * 0.4, 0.8 + i * 0.4), MUT, { plain: true });
        card(640, y, 330, 70, { rx: 10, stroke: BAD, sw: 2, s }); if (s > 0.6) { tx(500, y - 4, a, { 'font-size': 16, 'font-weight': 800, fill: BAD }); tx(500, y + 20, b, { 'font-size': 14, fill: MUT }); cross(780, y, 11, s); } }); return; }
    if (k === 1) { ['A', 'B'].forEach((r, i) => typed(400, 120 + i * 40, `up{region="ap-northeast-2", replica="${r}"}`, seg(u, 0.8 + i * 0.5, 1.6 + i * 0.5), { 'font-size': 15, 'font-weight': 700, fill: i ? INFO : ACC }));
      sub(640, 230, '나중에 리전을 합치고 replica 중복을 지우는 열쇠', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { const x0 = 340, cw = 38, sh = E(u, 0.8, 1.8);
      for (let i = 0; i < 16; i++) { const x = x0 + (i - sh) * cw, gone = i === 0, op = gone ? 1 - sh : (i === 15 ? sh : 1); if (x < x0 - cw - 2) continue;
        el('rect', { x, y: gone ? 140 + sh * 50 : 140, width: cw - 4, height: 36, rx: 4, fill: gone ? BAD : ACC, opacity: 0.8 * op }); }
      mono(x0, 200, '15d 전', { 'font-size': 13.5, fill: MUT }); mono(x0 + 15 * cw - 4, 200, '지금', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      mono(x0 + 300, 120, 'retention time: 15d', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      sub(x0 + 10, 256, '하루가 지나면 가장 오래된 칸이 삭제된다', fade(u, 1.6), { 'text-anchor': 'start', fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { ['10.0.1.10:8080', '10.0.1.11:8080'].forEach((s, i) => { const y = 60 + i * 0; card(560 + i * 220, 60, 190, 40, { rx: 8, text: s, fs: 14, mono: true, stroke: GRID, s: pop(u, 0.2 + i * 0.2) });
        grow(560 + i * 220, 82, P[0] + 86, P[1], E(u, 0.5 + i * 0.2, 1.1 + i * 0.2), ACC, { plain: true }); });
      ['스크랩', '메모리', '디스크'].forEach((n, i) => { const y = 200 + i * 44, f = E(u, 0.9 + i * 0.25, 2.2 + i * 0.25);
        tx(470, y + 15, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' }); el('rect', { x: 490, y, width: 380, height: 20, rx: 5, fill: SOFT, stroke: GRID });
        el('rect', { x: 490, y, width: 380 * f, height: 20, rx: 5, fill: f > 0.97 ? BAD : WARN, opacity: 0.8 }); });
      sub(680, 350, '한 프로세스가 다 맡는다. 한 대의 한계가 곧 상한', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    // k4: HA 두 대 → 시계열 두 벌
    prom(P[0], 330, 'Prometheus', { s: pop(u, 0.2) }); pill(P[0], 378, 'replica: B', INFO, pop(u, 0.4), { mono: true, fs: 13.5 });
    const ax = 430, aw = 440, ay = 150, line = (off, col, op, g) => { const pts = Array.from({ length: 12 }, (_, i) => [ax + i * aw / 11, ay + 60 - 34 * Math.sin(i * 0.6) + off]);
      el('polyline', { points: pts.slice(0, Math.max(2, Math.round(12 * g))).map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.6, opacity: op }); };
    const g = E(u, 0.6, 1.6), m = E(u, 1.9, 2.5); line(-4 * (1 - m), ACC, 1, g); line(4 * (1 - m), INFO, 1 - m, g);
    tx(ax, ay - 10, 'up — replica A·B 두 벌', { 'font-size': 14, 'font-weight': 700, fill: MUT }); if (m > 0.9) pill(ax + aw / 2, ay + 140, '조회 때 dedup 해서 한 줄로', GOOD, pop(u, 2.4), { fs: 14 }); }

  // ── 2. Thanos — 사이드카 + 오브젝트 스토리지 + Querier
  const TP = [140, 86], SC = [140, 210], S3P = [470, 330], SG = [770, 330], QR = [840, 200];
  function s2(t, c) { const { k, u } = c;
    prom(TP[0], TP[1], 'Prometheus');
    if (k === 0) { sub(TP[0], TP[1] + 48, '설정·스크랩은 그대로', fade(u, 0.4), { 'font-weight': 700, fill: INK }); box(SC[0], SC[1], 'sidecar ?', MUT, { dash: '6 5', op: fade(u, 0.9) }); return; }
    // 2시간 블록 띠
    const bx = 320, bw = 92;
    if (k >= 1) { const n = k === 1 ? Math.floor(lerp(0, 4.99, E(u, 0.3, 2.0))) : 4;
      el('line', { x1: TP[0] + 86, y1: TP[1], x2: bx - 6, y2: TP[1], stroke: GRID, 'stroke-width': 2 });
      for (let i = 0; i < 4; i++) { const on = i < n, up = k >= 3 && i < 3;
        el('rect', { x: bx + i * (bw + 6), y: TP[1] - 20, width: bw, height: 40, rx: 6, fill: up ? OFF : ACC, opacity: on ? 0.85 : 0.1, 'stroke-dasharray': on ? null : '4 4', stroke: on ? 'none' : MUT });
        if (on) mono(bx + i * (bw + 6) + bw / 2, TP[1] + 6, '2h', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); }
      el('rect', { x: bx + 4 * (bw + 6), y: TP[1] - 20, width: 60, height: 40, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 }); mono(bx + 4 * (bw + 6) + 30, TP[1] + 6, 'head', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC });
      if (k === 1) mono(bx, TP[1] + 48, 'min/max-block-duration=2h', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) }); }
    if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1; box(SC[0], SC[1], 'thanos sidecar', WARN, { s });
      el('line', { x1: SC[0], y1: SC[1] - 23, x2: TP[0], y2: TP[1] + 28, stroke: WARN, 'stroke-width': 2.5 });
      if (k === 2) { mono(SC[0] - 120, SC[1] + 48, '--tsdb.path=/prometheus', { 'font-size': 13.5, fill: INK, opacity: fade(u, 0.8) }); mono(SC[0] - 120, SC[1] + 72, '--prometheus.url=…:9090', { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.2) }); } }
    if (k >= 3) { bucket(S3P[0], S3P[1], 'S3', { s: k === 3 ? pop(u, 0.2) : 1, sub: '오브젝트 스토리지' });
      if (k === 3) for (let i = 0; i < 3; i++) fly(SC[0] + 40, SC[1] + 10, S3P[0] - 20, S3P[1] - 30, seg(u, 0.6 + i * 0.5, 1.5 + i * 0.5), '2h 블록', { fill: ACC });
      if (k === 3) sub(S3P[0] + 150, S3P[1] - 70, '여기서 장기 보관이 시작된다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); }
    if (k >= 4) { box(QR[0], QR[1], 'Querier', INFO, { s: k === 4 ? pop(u, 0.2) : 1 }); box(SG[0], SG[1], 'Store Gateway', INFO, { s: k === 4 ? pop(u, 0.4) : 1 });
      el('line', { x1: S3P[0] + 62, y1: S3P[1], x2: SG[0] - 80, y2: SG[1], stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      const g = k === 4 ? E(u, 0.6, 1.3) : 1; [[SC[0] + 80, SC[1]], [SG[0], SG[1] - 23]].forEach((p) => { el('line', { x1: QR[0], y1: QR[1] + 23, x2: lerp(QR[0], p[0], g), y2: lerp(QR[1] + 23, p[1], g), stroke: INFO, 'stroke-width': 2.2 });
        if (k === 4 && u > 1.3) dot([p, [QR[0], QR[1] + 23]], seg(u, 1.3, 2.1), INFO, 6); });
      if (k === 4) { const m = E(u, 1.9, 2.6); if (m < 0.9) pill(QR[0] - 50 + m * 50, QR[1] - 64, 'replica=A', ACC, 1 - m * 0.99, { mono: true, fs: 13.5 }); if (m < 0.9) pill(QR[0] + 50 - m * 50, QR[1] - 64, 'replica=B', INFO, 1 - m * 0.99, { mono: true, fs: 13.5 });
        if (m > 0.95) pill(QR[0], QR[1] - 64, 'dedup → 1', GOOD, pop(u, 2.6), { fs: 14 }); } }
    if (k === 5) { box(270, 376, 'Compactor', WARN, { s: pop(u, 0.2), fs: 14 });
      [['원본', 14], ['5m', 6], ['1h', 3]].forEach(([n, d], i) => { const x = 110 + i * 100, y = 272, s = pop(u, 0.7 + i * 0.4); if (s <= 0) return;
        card(x, y, 90, 50, { rx: 6, stroke: WARN, sw: 2, s }); for (let j = 0; j < d; j++) el('circle', { cx: x - 36 + (j + 0.5) * (72 / d), cy: y - 4, r: 3.5, fill: WARN, opacity: Math.min(1, s) });
        mono(x, y + 18, n, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 800, fill: INK, opacity: Math.min(1, s) }); if (i < 2) grow(x + 46, y, x + 54, y, fade(u, 1.0 + i * 0.4), WARN, {}); });
      sub(270, 322, '오래된 블록을 다운샘플링해 장기 조회를 가볍게', fade(u, 2.0), { 'font-weight': 700, fill: INK }); } }

  // ── 3. Cortex / Mimir — push 로 밀어 넣는다
  const AG = [[100, 80], [100, 200], [100, 320]], DS = [370, 200], IG = [[620, 90], [620, 200], [620, 310]], S3C = [860, 200];
  function s3(t, c) { const { k, u } = c;
    AG.forEach((p, i) => prom(p[0], p[1], 'agent', { w: 130, s: k === 0 ? pop(u, 0.1 + i * 0.15) : 1 }));
    if (k === 0) { AG.forEach((p, i) => { grow(p[0] + 66, p[1], DS[0] - 90, DS[1], E(u, 0.6 + i * 0.2, 1.3 + i * 0.2), ACC, {}); });
      box(DS[0], DS[1], 'Mimir', INFO, { s: pop(u, 1.2) }); sub(330, 380, '로컬에서는 긁기만 하고 샘플은 중앙으로 push 한다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      return; }
    const toD = AG.map((p) => [[p[0] + 66, p[1]], [DS[0] - 90, DS[1]]]);
    toD.forEach(([a, b]) => el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: ACC, 'stroke-width': 2 }));
    if (k <= 3) box(DS[0], DS[1], 'Mimir', INFO);
    if (k === 1) { typed(170, 40, 'remote_write url: http://mimir:8080/api/v1/push', seg(u, 0.3, 1.6), { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      toD.forEach(([a, b], i) => fly(a[0], a[1], b[0], b[1], ((t * 0.4 + i * 0.33) % 1), '샘플', { fill: ACC })); return; }
    if (k === 2) { toD.forEach(([a, b], i) => { if (i === 2) return; fly(a[0], a[1], b[0], b[1], ((t * 0.4 + i * 0.5) % 1), 'team-payments', { fill: WARN, mono: true }); });
      fly(toD[2][0][0], toD[2][0][1], toD[2][1][0] - 30, toD[2][1][1] + 20, seg(u, 0.4, 1.4), '헤더 없음', { fill: BAD }); if (u > 1.4) { cross(DS[0] - 100, DS[1] + 44, 11, pop(u, 1.4)); pill(DS[0], DS[1] + 80, '수집 거부', BAD, pop(u, 1.5), { fs: 14 }); }
      mono(170, 40, 'X-Scope-OrgID: team-payments', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) }); return; }
    if (k === 3) { const n = Math.round(lerp(1, 5, E(u, 0.4, 1.6)));
      AG.forEach((p) => { for (let j = 0; j < n; j++) el('line', { x1: p[0] + 66, y1: p[1] - 10 + j * 5, x2: DS[0] - 90, y2: DS[1] - 10 + j * 5, stroke: ACC, 'stroke-width': 1.5, opacity: 0.6 }); });
      mono(170, 40, 'max_shards: 200   capacity: 10000', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      sub(370, 280, '중앙이 밀릴 때를 대비해 병렬 전송을 넓혀 둔다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    // k4·k5: Distributor 해시 링 → Ingester
    const RC = [DS[0], DS[1]], rr = 62, col = [ACC, INFO, GOOD];
    for (let i = 0; i < 12; i++) { const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
      el('path', { d: `M${RC[0] + rr * Math.cos(a0)},${RC[1] + rr * Math.sin(a0)} A${rr},${rr} 0 0 1 ${RC[0] + rr * Math.cos(a1)},${RC[1] + rr * Math.sin(a1)}`, fill: 'none', stroke: col[i % 3], 'stroke-width': 9, opacity: k === 4 ? fade(u, 0.1 + i * 0.05) : 1 }); }
    tx(RC[0], RC[1] - 4, 'Distributor', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800 }); sub(RC[0], RC[1] + 16, '해시 링', 1);
    IG.forEach((p, i) => { box(p[0], p[1], 'Ingester ' + (i + 1), col[i], { s: k === 4 ? pop(u, 0.5 + i * 0.2) : 1, fs: 14 }); });
    if (k === 4) { const a = -Math.PI / 2 + E(u, 0.9, 1.6) * Math.PI * 2 * (5.5 / 12); el('circle', { cx: RC[0] + rr * Math.cos(a), cy: RC[1] + rr * Math.sin(a), r: 8, fill: INK });
      if (u > 1.6) dot([[RC[0] + rr * Math.cos(a), RC[1] + rr * Math.sin(a)], [IG[2][0] - 60, IG[2][1]]], seg(u, 1.6, 2.4), GOOD, 7);
      sub(RC[0], 370, '시계열 해시가 링 위 자리를 정하고 그 자리 주인에게 간다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    // k5: 3벌 복제 + 블록 flush
    IG.forEach((p, i) => dot([[RC[0] + rr, RC[1]], [p[0] - 60, p[1]]], seg(u, 0.2 + i * 0.1, 1.0 + i * 0.1), INK, 6));
    mono(470, 40, 'replication_factor: 3', { 'font-size': 14.5, 'font-weight': 800, fill: INK, opacity: fade(u, 0.3) });
    bucket(S3C[0], S3C[1], 'S3', { s: pop(u, 1.0), sub: 'mimir-blocks' });
    IG.forEach((p, i) => grow(p[0] + 60, p[1], S3C[0] - 62, S3C[1], E(u, 1.2 + i * 0.15, 1.8 + i * 0.15), WARN, {}));
    sub(480, 398, '최근은 Ingester 메모리, 과거는 S3 블록에서 Querier가 합친다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); }

  // ── 4. 공통점 — 같은 목적지
  function s4(t, c) { const { k, u } = c, TH = [190, 70], MI = [770, 70], BK = [480, 320];
    box(TH[0], TH[1], 'Thanos', WARN, { s: k === 0 ? pop(u, 0.1) : 1, w: 170 }); box(MI[0], MI[1], 'Cortex / Mimir', INFO, { s: k === 0 ? pop(u, 0.3) : 1, w: 190 });
    if (k === 4) { // Mimir 는 Cortex 포크
      const y0 = 190, gx = E(u, 0.2, 1.2); el('line', { x1: 230, y1: y0, x2: lerp(230, 730, gx), y2: y0, stroke: INFO, 'stroke-width': 4 }); tx(230, y0 - 14, 'Cortex', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      const gf = E(u, 1.0, 1.9); el('path', { d: `M430,${y0} Q480,${y0 + 46} ${lerp(480, 730, gf)},${y0 + 46}`, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: gf > 0 ? 1 : 0 }); if (gf > 0.9) tx(740, y0 + 52, 'Mimir', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      sub(480, 330, '차이는 누가 데이터를 옮기나, 멀티테넌시가 필수인가', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    bucket(BK[0], BK[1], 'S3', { s: k === 0 ? pop(u, 0.6) : 1, sub: 'S3 · GCS · MinIO' });
    const g = k === 0 ? E(u, 0.9, 1.6) : 1; grow(TH[0], TH[1] + 24, lerp(TH[0], BK[0] - 70, g), lerp(TH[1] + 24, BK[1] - 30, g), g, WARN, { plain: g < 0.98 }); grow(MI[0], MI[1] + 24, lerp(MI[0], BK[0] + 70, g), lerp(MI[1] + 24, BK[1] - 30, g), g, INFO, { plain: g < 0.98 });
    if (k === 0) { sub(480, 140, '경로는 달라도 장기 저장소는 같다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { const x0 = 300, x1 = 660, xs = 540;
      el('rect', { x: x0, y: 168, width: xs - x0 - 4, height: 40, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: fade(u, 0.2) }); el('rect', { x: xs, y: 168, width: x1 - xs, height: 40, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: fade(u, 0.4) });
      tx((x0 + xs) / 2, 193, '과거 · 블록', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) }); tx((xs + x1) / 2, 193, '최근 · 빠른 층', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      pill(480, 130, 'query fan-out → PromQL 결과 하나', INK, pop(u, 1.0), { fs: 14 }); pill(800, 250, 'replica 라벨로 dedup', GOOD, pop(u, 1.6), { fs: 14 }); return; }
    const bul = (x, items, col) => items.forEach((s, i) => { const o = fade(u, 0.3 + i * 0.4); tx(x, 290 + i * 30, s, { 'font-size': 15, 'font-weight': 700, fill: i === items.length - 1 && col === WARN ? BAD : INK, opacity: o }); el('circle', { cx: x - 12, cy: 285 + i * 30, r: 4, fill: col, opacity: o }); });
    if (k === 2) { bul(50, ['pull · 사이드카가 블록 업로드', '기존 Prometheus 유지', '멀티테넌시는 약하다'], WARN); return; }
    if (k === 3) { bul(620, ['push · remote_write', 'Prometheus는 agent로', '컴포넌트별 수평 확장', '멀티테넌시 기본 (X-Scope-OrgID)'], INFO); return; }
  }

  // ── 5. 선택 기준과 함정
  const PICK = [['기존 Prometheus 유지 + 장기 보관·글로벌 뷰만', 'Thanos', WARN], ['여러 팀 멀티테넌트 + 대규모 수평 확장', 'Cortex / Mimir', INFO], ['신규 도입 · 운영성 우선', 'Mimir', ACC]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const O = [480, 230]; [['규모', -150, -120], ['조직 (팀·테넌트)', 150, -120], ['운영 여력', 0, 150]].forEach(([n, dx, dy], i) => { const g = E(u, 0.2 + i * 0.4, 1.0 + i * 0.4);
        grow(O[0], O[1], O[0] + dx * g, O[1] + dy * g, g, INK, {}); if (g > 0.9) lbl(O[0] + dx * 1.25, O[1] + dy * 1.15 + (dy > 0 ? 8 : 0), n, 1, { 'font-size': 16 }); });
      el('circle', { cx: O[0], cy: O[1], r: 7, fill: INK }); return; }
    if (k <= 3) { PICK.forEach(([cnd, p, col], i) => { if (i >= k) return; const y = 80 + i * 100, on = i === k - 1, s = on ? pop(u, 0.2) : 1;
        card(330, y, 560, 64, { rx: 10, stroke: on ? col : GRID, sw: on ? 2.5 : 1.5, s }); if (s > 0.6) tx(70, y + 6, cnd, { 'font-size': 15.5, 'font-weight': 700 });
        grow(620, y, 680, y, on ? E(u, 0.8, 1.3) : 1, col, {}); if (!on || u > 1.2) box(790, y, p, col, { s: on ? pop(u, 1.2) : 1, w: 200 }); });
      if (k === 1) sub(330, 380, '사이드카만 얹으면 된다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      if (k === 3) sub(330, 380, 'Mimir는 운영성을 다듬은 Cortex 포크', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { const comps = ['distributor', 'ingester', 'querier', 'store gateway', 'compactor'];
      comps.forEach((s, i) => box(110 + (i % 3) * 170, 90 + Math.floor(i / 3) * 70, s, MUT, { s: pop(u, 0.2 + i * 0.2), fs: 14, mono: true, w: 150 }));
      tx(40, 40, '소규모인데 도입하면', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.1) });
      bucket(770, 120, 'S3', { s: pop(u, 1.2), sub: '요청·전송 비용' }); const g = E(u, 1.4, 2.4);
      el('rect', { x: 60, y: 290, width: 560, height: 24, rx: 5, fill: SOFT }); el('rect', { x: 60, y: 290, width: 560 * g, height: 24, rx: 5, fill: BAD, opacity: 0.7 });
      tx(60, 280, '다운샘플링 없이 쌓이는 원본', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); sub(340, 352, '상시 운영 부담 + 청구서', fade(u, 2.2), { 'font-weight': 700, fill: BAD }); return; }
    if (k === 5) { [['1', 'retention time을 30~90d로', ACC], ['2', 'remote_write 한 곳만 붙여 검증', INFO], ['3', '글로벌 뷰·멀티테넌트가 진짜 필요할 때 확장', GOOD]].forEach(([n, s, col], i) => {
        const x = 70 + i * 110, y = 300 - i * 90, sc = pop(u, 0.2 + i * 0.5); el('rect', { x, y, width: 820 - i * 110, height: 70, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: Math.min(1, sc) });
        if (sc > 0.6) { mono(x + 22, y + 44, n, { 'font-size': 22, 'font-weight': 800, fill: col }); tx(x + 56, y + 42, s, { 'font-size': 16, 'font-weight': 700 }); } });
      const g = E(u, 0.6, 1.6); el('rect', { x: 560, y: 320, width: 60, height: 30, rx: 4, fill: ACC, opacity: 0.85 }); el('rect', { x: 624, y: 320, width: 240 * g, height: 30, rx: 4, fill: ACC, opacity: 0.4 });
      mono(590, 340, '15d', { 'font-size': 13.5, fill: PANEL, 'text-anchor': 'middle', 'font-weight': 800 }); return; }
    // k6: 완주
    const M = ['metric 모델', '수집', 'PromQL', 'HA · Federation · remote_write', '장기 저장'], xs = [90, 250, 390, 590, 830];
    el('line', { x1: xs[0], y1: 210, x2: lerp(xs[0], xs[4], E(u, 0.2, 2.0)), y2: 210, stroke: ACC, 'stroke-width': 4 });
    M.forEach((s, i) => { const s2 = pop(u, 0.3 + i * 0.4); el('circle', { cx: xs[i], cy: 210, r: 11 * s2, fill: i === 4 ? ACC : PANEL, stroke: ACC, 'stroke-width': 3 });
      if (s2 > 0.5) tx(xs[i], i % 2 ? 260 : 176, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); });
    banner(480, 350, 'Prometheus 완주', pop(u, 2.3)); }

  const quiz = [
    { q: 'HA로 같은 타깃을 replica A·B 두 대가 긁을 때 조회에서 생기는 문제는 무엇인가?',
      o: ['같은 시계열이 두 벌이라 dedup이 필요하다', '데이터가 15d보다 일찍 지워진다', '타깃이 스크랩을 거부한다'], a: 0,
      why: '두 서버가 같은 시계열을 각자 저장한다. 그래서 external_labels의 replica가 나중에 중복을 지우는 열쇠가 된다.' },
    { q: 'Thanos에서 Prometheus 블록 크기를 2시간으로 고정하는 까닭은 무엇인가?',
      o: ['스크랩을 빠르게 하려고', '사이드카가 완성된 블록을 올릴 수 있게 하려고', '멀티테넌시를 켜려고'], a: 1,
      why: 'min·max-block-duration을 2h로 두어 로컬 압축을 막는다. 사이드카는 완성된 2h 블록을 S3 같은 오브젝트 스토리지로 올린다.' },
    { q: 'Mimir에 X-Scope-OrgID 헤더 없이 remote_write 하면 어떻게 되는가?',
      o: ['기본 테넌트로 저장된다', '샤드 수가 늘어난다', '수집이 거부된다'], a: 2,
      why: '멀티테넌시가 켜져 있으면 모든 요청이 테넌트를 밝혀야 한다. 헤더가 빠진 요청은 받지 않는다.' },
    { q: 'Thanos와 Cortex·Mimir가 공통으로 하는 일은 무엇인가?',
      o: ['오브젝트 스토리지 장기 보관과 replica dedup', 'Prometheus를 agent로만 쓴다', '사이드카로 블록을 올린다'], a: 0,
      why: '경로는 pull과 push로 다르지만 목적지는 같다. 과거는 블록, 최근은 빠른 층에서 읽어 팬아웃으로 합친다.' },
    { q: '작은 팀이 장기 보관이 필요할 때 먼저 해 볼 것은 무엇인가?',
      o: ['Mimir 컴포넌트를 모두 띄운다', 'Federation을 여러 단으로 쌓는다', 'retention을 늘리고 remote_write 한 곳을 붙인다'], a: 2,
      why: '규모가 작은데 분산 저장소를 들이면 컴포넌트와 S3 비용, 운영 부담만 는다. 작게 검증한 뒤 필요할 때 확장한다.' },
  ];

  const summary = [
    '단일 Prometheus는 15d 보관, 리전마다 따로인 데이터, 한 대의 한계라는 세 벽에 막힌다.',
    'Thanos는 Prometheus를 두고 사이드카가 2시간 블록을 S3에 올린다. Querier가 모아서 replica로 중복을 지운다.',
    'Cortex·Mimir는 Prometheus를 agent로 두고 remote_write로 밀어 넣는다. 테넌트 헤더와 3벌 복제가 기본이다.',
    '작은 규모라면 retention을 늘리고 remote_write 한 곳을 붙여 보는 것부터 시작한다.',
  ];
  const review = [
    { q: 'Thanos를 붙였는데 S3에 블록이 하나도 올라가지 않는다. 먼저 확인할 것은?',
      o: ['Prometheus의 min·max-block-duration이 2h로 고정됐는지', 'X-Scope-OrgID 헤더가 있는지', 'replication_factor가 3인지'], a: 0,
      why: '사이드카는 완성된 2h 블록만 올린다. 블록 크기를 고정하지 않으면 로컬 압축이 블록을 합쳐 올릴 대상이 어긋난다.' },
    { q: '팀마다 데이터를 나누고 수평 확장도 해야 하는 새 플랫폼이다. 가장 맞는 선택은?',
      o: ['Prometheus 한 대의 retention을 늘린다', 'Mimir로 테넌트별 remote_write를 받는다', 'Thanos 사이드카만 붙인다'], a: 1,
      why: '멀티테넌시와 컴포넌트별 확장이 필요하면 Cortex·Mimir 쪽이고, 신규라면 운영성이 다듬어진 Mimir가 무난하다.' },
    { q: 'Querier 대시보드의 같은 그래프에 선이 두 줄씩 겹쳐 나온다. 의심할 곳은?',
      o: ['S3 버킷 이름', 'Compactor의 다운샘플링', 'Querier의 replica 라벨 설정'], a: 2,
      why: 'HA 두 대가 같은 시계열을 올리므로 replica 라벨로 묶어 지워야 한 줄이 된다. --query.replica-label이 그 키다.' },
  ];

  R.page({ title: 'Thanos vs Cortex vs Mimir', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
