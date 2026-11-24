/* V-2-2 프로덕션 운영 체크리스트 — 장면 4개 (../../anim/engine.js 규칙을 따른다)
 * 왼쪽 48칸 고리는 각 beat 의 progress(done/48) · axisStates 를 읽는다. 임계값은 페이지 코드(monitor.yaml · backup.sh · scale.md · security.md)의 값.
 * 계산으로 확인한 값: 3h22m = 202분, 1024차원 float32 = 4,096바이트 → 5천만 건 205GB, 128GiB 의 70% 에 약 2,350만 건.
 * ef_search 곡선은 faiss-cpu 1.16.0 IndexHNSWFlat(M=16, efConstruction=64), 10만 개 · 768차원(24차원 잠재 구조 합성 데이터), 1스레드 실측. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, lock, dbIcon, hbar, axes, line, snippet, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const AX = [['monitoring', 'Monitoring', INFO], ['backup', 'Backup', ACC], ['scaling', 'Scaling', WARN], ['security', 'Security', GOOD]];
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 왼쪽: 48칸 고리 ----------
  function ring(c) { const cx = 125, cy = 170, r0 = 70, r1 = 100, b = c.beat, p = c.prev, done = tween(p ? p.progress.done : 0, b.progress.done, c.u);
    for (let i = 0; i < 48; i++) { const a0 = -Math.PI / 2 + (i / 48) * 2 * Math.PI + 0.012, a1 = -Math.PI / 2 + ((i + 1) / 48) * 2 * Math.PI - 0.012, col = AX[Math.floor(i / 12)][2], on = i < done - 0.001;
      const pt = (r, a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      el('path', { d: `M${pt(r0, a0)} L${pt(r1, a0)} A${r1},${r1} 0 0 1 ${pt(r1, a1)} L${pt(r0, a1)} A${r0},${r0} 0 0 0 ${pt(r0, a0)} Z`, fill: on ? col : SOFT, stroke: on ? 'none' : GRID, 'stroke-width': 0.8, opacity: on ? 0.9 : 1 }); }
    mono(cx, cy + 4, Math.round(done) + '/48', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle' });
    mono(cx, cy + 28, Math.round(done / 48 * 100) + '%', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    AX.forEach(([key, name, col], i) => { const y = 310 + i * 26, st = b.axisStates[key], focus = b.focus === key;
      el('rect', { x: 30, y: y - 13, width: 14, height: 14, rx: 3, fill: st === 'done' ? col : focus ? 'none' : SOFT, stroke: col, 'stroke-width': 2 });
      tx(52, y, name, { 'font-size': 15, 'font-weight': focus ? 800 : 600, fill: focus ? col : st === 'done' ? INK : MUT });
      if (st === 'done') tx(222, y, '12/12', { 'font-size': 13.5, 'text-anchor': 'end', class: 'mono', fill: col, 'font-weight': 700 }); });
    el('line', { x1: 250, y1: 20, x2: 250, y2: 405, stroke: GRID, 'stroke-width': 1.5 }); }
  const X0 = 280;

  // ---------- 1. Monitoring ----------
  const LGX = (ms) => X0 + 30 + ((Math.log10(ms) - Math.log10(5)) / 2) * 560;   // 5 ~ 500ms
  function msAxis(op) { el('line', { x1: X0 + 20, y1: 240, x2: 900, y2: 240, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [5, 10, 25, 50, 100, 250, 500].forEach((v) => { el('line', { x1: LGX(v), y1: 240, x2: LGX(v), y2: 100, stroke: GRID, 'stroke-dasharray': '3 4', opacity: op }); mono(LGX(v), 262, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); });
    tx(900, 286, '검색 지연 ms (로그 축)', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: op }); }
  function s1(t, c) { const { k, u } = c; ring(c);
    if (k <= 1) { msAxis(1); tx(X0 + 20, 60, 'histogram_buckets_ms', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.1) });
      if (k === 0) { [5, 10, 25, 50, 100, 250, 500].forEach((v, i) => { const s = pop(u, 0.3 + i * 0.18); card(LGX(v), 210, 34, 30, { rx: 5, text: String(i + 1), fs: 13.5, mono: true, stroke: INFO, s }); });
        ['p50', 'p95', 'p99'].forEach((s, i) => pill(420 + i * 120, 330, s, INFO, pop(u, 1.8 + i * 0.2), { fs: 15, mono: true }));
        tx(X0 + 20, 380, '버킷 7개에 쌓인 개수로 세 백분위를 계산한다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
      [[50, 'p95 SLO 50ms', WARN, 0.3], [100, 'p99 100ms → PagerDuty', BAD, 1.0]].forEach(([v, s, col, a]) => { const f = E(u, a, a + 0.6);
        el('line', { x1: LGX(v), y1: 240, x2: LGX(v), y2: 240 - 150 * f, stroke: col, 'stroke-width': 3 }); tx(LGX(v) + (v === 100 ? 8 : -8), 104 + (v === 100 ? 26 : 0), s, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': v === 100 ? 'start' : 'end', opacity: fade(u, a + 0.5) }); });
      el('rect', { x: LGX(100), y: 100, width: 900 - LGX(100), height: 140, fill: BAD, opacity: 0.08 * fade(u, 1.6) });
      tx(X0 + 20, 340, 'p95 는 경고, p99 는 사람을 깨운다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { const ax = axes(X0 + 60, 80, 480, 230, { x: [0, 1], y: [0.85, 1.0], yt: [0.85, 0.9, 0.95, 1.0] });
      tx(X0 + 30, 64, 'recall@10 (golden 질의 500개, 매일)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      const l1 = E(u, 0.3, 1.0), l2 = E(u, 1.0, 1.7);
      el('line', { x1: ax.X(0), y1: ax.Y(0.95), x2: ax.X(l1), y2: ax.Y(0.95), stroke: GOOD, 'stroke-width': 3 }); tx(ax.X(1) + 10, ax.Y(0.95) + 5, 'target 0.95', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
      el('line', { x1: ax.X(0), y1: ax.Y(0.92), x2: ax.X(l2), y2: ax.Y(0.92), stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5' }); tx(ax.X(1) + 10, ax.Y(0.92) + 5, '0.92 알람', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      el('rect', { x: ax.X(0), y: ax.Y(0.92), width: 480, height: ax.Y(0.85) - ax.Y(0.92), fill: BAD, opacity: 0.08 * fade(u, 1.7) });
      tx(X0 + 60, 370, '0.95 − 3%p = 0.92 · 인덱스·임베딩이 바뀌면 조용히 떨어진다', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { tx(X0 + 30, 70, 'error_rate', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      el('rect', { x: X0 + 30, y: 100, width: 520 * E(u, 0.2, 0.8), height: 44, rx: 8, fill: BAD, opacity: 0.25 }); mono(X0 + 560, 128, '1.0%', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
      const f = E(u, 1.0, 1.8); [['5xx', 0], ['timeout', 1]].forEach(([s, i]) => { const y = lerp(100, 190 + i * 64, f); el('rect', { x: X0 + 30 + i * 260 * (1 - f), y, width: 260, height: 44, rx: 8, fill: i ? WARN : BAD, opacity: 0.5 });
        mono(X0 + 50 + i * 260 * (1 - f), y + 28, s, { 'font-size': 15, 'font-weight': 800 }); mono(X0 + 300, y + 28, '0.5%', { 'font-size': 15, 'font-weight': 800, fill: i ? WARN : BAD, opacity: f }); });
      tx(X0 + 30, 350, '서버 오류와 시간 초과는 원인이 달라 따로 본다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { tx(X0 + 30, 64, 'embedding_queue (redis-stream)', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      const n = Math.floor(E(u, 0.2, 2.0) * 14); for (let i = 0; i < 14; i++) el('rect', { x: X0 + 30 + i * 32, y: 100, width: 26, height: 40, rx: 4, fill: i < n ? (i >= 10 ? WARN : INFO) : SOFT, stroke: GRID });
      el('line', { x1: X0 + 30 + 10 * 32 - 3, y1: 88, x2: X0 + 30 + 10 * 32 - 3, y2: 152, stroke: WARN, 'stroke-width': 2.4 }); mono(X0 + 30 + 10 * 32, 170, 'depth_warn 1000', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
      tx(X0 + 30, 170, '한 칸 ≈ 100건 (그림)', { 'font-size': 13.5, fill: MUT });
      clock(X0 + 560, 120, 30, E(u, 0.5, 2.4), BAD, 'lag 10s → 알람');
      card(X0 + 190, 260, 300, 56, { rx: 10, text: '방금 올린 문서\n아직 검색에 안 잡힌다', fs: 14.5, stroke: BAD, s: pop(u, 1.6) }); return; }
    if (k === 5) { tx(X0 + 30, 70, '인덱스 메모리', { 'font-size': 15, 'font-weight': 800 });
      el('rect', { x: X0 + 30, y: 90, width: 560, height: 40, rx: 8, fill: SOFT }); el('rect', { x: X0 + 30, y: 90, width: 560 * 0.7 * E(u, 0.2, 1.2), height: 40, rx: 8, fill: INFO, opacity: 0.7 });
      el('line', { x1: X0 + 30 + 560 * 0.7, y1: 80, x2: X0 + 30 + 560 * 0.7, y2: 140, stroke: WARN, 'stroke-width': 3 }); mono(X0 + 30 + 560 * 0.7, 160, '70%', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      mono(X0 + 30, 230, 'qps_concurrency_track: true', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(X0 + 30, 260, 'QPS 와 동시 요청 수를 같은 그래프에 둔다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 6) { [['vector-db-overview', 4], ['vector-db-recall', 1]].forEach(([n, pn], i) => { const x = X0 + 30 + i * 330, s = pop(u, 0.3 + i * 0.5);
        card(x + 140, 180, 280, 180, { rx: 10, stroke: INK, s }); mono(x + 14, 112, n, { 'font-size': 14, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.5) });
        for (let j = 0; j < pn; j++) { const px = pn === 4 ? x + 14 + (j % 2) * 128 : x + 14, py = pn === 4 ? 128 + Math.floor(j / 2) * 64 : 128, w = pn === 4 ? 120 : 252, h = pn === 4 ? 56 : 120;
          el('rect', { x: px, y: py, width: w, height: h, rx: 5, fill: SOFT, stroke: GRID, opacity: fade(u, 0.6 + i * 0.5 + j * 0.1) }); } });
      tx(X0 + 30, 320, '패널 4개짜리 개요와 recall 드리프트 전용, 두 장', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // k7: 알림 라우팅
    [['critical', 'p99 · 5xx · queue lag', BAD, ['PagerDuty', 'Slack']], ['warning', 'p95 · recall 드리프트', WARN, ['Slack']]].forEach(([sev, what, col, chs], i) => { const y = 110 + i * 130;
      card(X0 + 110, y, 190, 70, { rx: 10, text: sev + '\n' + what, fs: 14, stroke: col, s: pop(u, 0.2 + i * 0.5) });
      chs.forEach((ch, j) => { const ty = y - 22 + j * 46 + (chs.length === 1 ? 22 : 0); grow(X0 + 205, y, X0 + 410, ty, E(u, 0.6 + i * 0.5, 1.1 + i * 0.5), col); card(X0 + 480, ty, 130, 36, { rx: 8, text: ch, fs: 14.5, stroke: col, s: pop(u, 1.0 + i * 0.5 + j * 0.15) }); }); });
    tx(X0 + 30, 380, '사람을 깨우는 알림과 낮에 보는 알림을 가른다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ---------- 2. Backup & Recovery ----------
  const TL = (h) => X0 + 30 + (h / 48) * 600;   // 이틀(48시간) 타임라인
  function days(op) { el('line', { x1: TL(0), y1: 200, x2: TL(48), y2: 200, stroke: MUT, 'stroke-width': 2, opacity: op });
    [0, 24, 48].forEach((h, i) => mono(TL(h), 226, ['D-1 00:00', 'D 00:00', 'D+1 00:00'][i], { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op })); }
  function s2(t, c) { const { k, u } = c; ring(c);
    if (k === 0) { const L = ['set -euo pipefail', 'aws rds create-db-snapshot …', 'aws s3api get-bucket-replication …  ✕ 실패', 'faiss_index_backup.py …', 'restore_drill.sh …'];
      L.forEach((s, i) => { const y = 90 + i * 44, fail = i === 2, after = i > 2, op = after ? 1 - 0.7 * E(u, 1.4, 1.9) : fade(u, 0.2 + i * 0.25);
        mono(X0 + 40, y, s, { 'font-size': 14.5, 'font-weight': i === 0 ? 800 : 600, fill: fail ? BAD : i === 0 ? ACC : INK, opacity: op }); });
      tx(X0 + 40, 340, '중간에 실패하면 거기서 멈춘다 · 실패를 성공처럼 지나치지 않는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 1 || k === 2) { days(1); [3, 27].forEach((h, i) => { const s = k === 1 ? pop(u, 0.3 + i * 0.6) : 1; card(TL(h), 200, 18, 34, { rx: 4, fill: ACC, stroke: ACC, s });
        mono(TL(h), 166 - i * 0, 'snap 03:00', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.5 + i * 0.6) : 1 }); });
      if (k === 1) { tx(X0 + 30, 300, '하루 한 번 스냅샷만 있으면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(X0 + 30, 326, '최악에는 거의 24시간을 잃는다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) }); return; }
      const n = Math.floor(E(u, 0.2, 2.0) * 44); for (let i = 0; i < n; i++) el('rect', { x: TL(3) + 12 + i * 12.6, y: 236, width: 9, height: 12, rx: 2, fill: INFO, opacity: 0.6 });
      mono(X0 + 30, 290, 'archive_mode = on → s3://wal/', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      tx(X0 + 30, 330, '스냅샷 사이를 WAL 이 메워 잃는 범위가 분 단위로 준다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { card(X0 + 120, 130, 190, 80, { rx: 10, text: 'ap-northeast-2\n(서울)', fs: 14.5, stroke: ACC }); card(X0 + 500, 130, 190, 80, { rx: 10, text: 'ap-southeast-2\n(시드니)', fs: 14.5, stroke: ACC, s: pop(u, 0.6) });
      for (let i = 0; i < 3; i++) dot([[X0 + 215, 130], [X0 + 405, 130]], ((t * 0.6 + i / 3) % 1), ACC, 5);
      tx(X0 + 310, 100, '스냅샷 cross-region 복제', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
      const g = R.G(X0 + 140, 290, pop(u, 1.4)); el('path', { d: 'M-15,-20 H7 L15,-12 V20 H-15 Z', fill: PANEL, stroke: WARN, 'stroke-width': 2 }, g);
      mono(X0 + 170, 286, 'FAISS 인덱스 파일', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) }); mono(X0 + 170, 308, '→ s3://vector-db/faiss/ (따로)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); return; }
    if (k === 4) { tx(X0 + 30, 80, 'rebuild_hnsw.py --rows 5_000_000', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      const W = 560, sc = (m) => (m / 240) * W; el('rect', { x: X0 + 30, y: 120, width: W, height: 40, rx: 8, fill: SOFT });
      el('rect', { x: X0 + 30, y: 120, width: sc(202) * E(u, 0.3, 1.8), height: 40, rx: 8, fill: ACC, opacity: 0.75 });
      el('line', { x1: X0 + 30 + W, y1: 108, x2: X0 + 30 + W, y2: 172, stroke: BAD, 'stroke-width': 3 }); mono(X0 + 30 + W, 194, 'SLO 4h = 240분', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
      mono(X0 + 30, 194, 'real 3h22m', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(X0 + 30, 250, '3 × 60 + 22 = 202분 ≤ 240분 ✓', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
      tx(X0 + 30, 290, '인덱스는 백업이 아니라 다시 만드는 것 · 그 시간을 재 둔다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { el('line', { x1: X0 + 30, y1: 200, x2: X0 + 630, y2: 200, stroke: MUT, 'stroke-width': 2 });
      const CR = X0 + 330; const g = R.G(CR, 200, pop(u, 0.2)); el('path', { d: 'M4,-22 L-8,2 H2 L-4,22 L10,-4 H0 Z', fill: BAD }, g);
      const rp = E(u, 0.6, 1.3), rt = E(u, 1.3, 2.2); el('rect', { x: CR - 90 * rp, y: 170, width: 90 * rp, height: 60, fill: BAD, opacity: 0.15 }); el('rect', { x: CR, y: 170, width: 230 * rt, height: 60, fill: WARN, opacity: 0.15 });
      mono(CR - 45, 160, 'RPO 5min', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) }); tx(CR - 45, 258, '잃어도 되는 데이터', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.1) });
      mono(CR + 115, 160, 'RTO 1h', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.8) }); tx(CR + 115, 258, '서비스가 멈춰도 되는 시간', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) });
      tx(X0 + 30, 330, 'tier-1 기준 · 숫자로 적어야 복구 설계를 검증할 수 있다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 6) { dbIcon(X0 + 100, 150, 'prod 스냅샷', { stroke: ACC }); grow(X0 + 150, 150, X0 + 380, 150, E(u, 0.4, 1.2), ACC); dbIcon(X0 + 440, 150, 'staging', { stroke: INFO, s: pop(u, 1.0) });
      mono(X0 + 265, 132, 'restore_drill.sh', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) }); check(X0 + 520, 120, 14, pop(u, 1.8));
      tx(X0 + 30, 290, '분기마다 실제로 복구해 본다', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.6) }); tx(X0 + 30, 316, '해 본 적 없는 복구 절차는 믿지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 7) { tx(X0 + 30, 70, 'backup vault Retention = 30', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      const sh = E(u, 1.2, 2.2); for (let i = 0; i < 31; i++) { const x = X0 + 30 + i * 19 - sh * 19, out = i === 0, op = out ? 1 - sh : i === 30 ? sh : 1;
        el('rect', { x, y: 110, width: 15, height: 36, rx: 3, fill: out ? OFF : ACC, opacity: 0.7 * op }); }
      tx(X0 + 30, 190, '하루가 더해지면 가장 오래된 하루가 지워진다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    [['docs/runbook/restore.md', 0.3], ['dr_drill_metrics.py --quarter Q1', 0.7]].forEach(([s, a], i) => { card(X0 + 250, 120 + i * 80, 460, 56, { rx: 10, text: s, fs: 15, mono: true, stroke: ACC, s: pop(u, a) }); check(X0 + 500, 120 + i * 80, 10, pop(u, a + 0.5)); });
    banner(X0 + 250, 320, 'Backup 축 12/12 · 누적 24/48', pop(u, 1.6)); }

  // ---------- 3. Scaling ----------
  const HNSW = [[40, 0.824, 0.218], [80, 0.937, 0.406], [120, 0.969, 0.677]];   // ef_search, recall@10, ms/질의 (실측)
  function s3(t, c) { const { k, u } = c; ring(c);
    if (k === 0) { [['메모리 임계', '70% · 85% · 노드 한계'], ['sharding 시점', '500만 건 · 샤드 키'], ['read replica', 'QPS 200 · lag 1s'], ['HNSW + 캐시', 'ef_search · hit 60%']].forEach(([a, b], i) => { const x = X0 + 160 + (i % 2) * 330, y = 120 + Math.floor(i / 2) * 120, s = pop(u, 0.3 + i * 0.3);
        card(x, y, 300, 90, { rx: 12, stroke: WARN, sw: 2, s }); tx(x, y - 6, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.4 + i * 0.3) }); tx(x, y + 22, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); }); return; }
    if (k === 1) { const W = 560; el('rect', { x: X0 + 30, y: 70, width: W, height: 36, rx: 8, fill: SOFT }); el('rect', { x: X0 + 30, y: 70, width: W * 0.9 * E(u, 0.2, 1.4), height: 36, rx: 8, fill: INFO, opacity: 0.65 });
      [[0.7, '70% 알람', WARN], [0.85, '85% scale-up', BAD]].forEach(([f, s, col], i) => { el('line', { x1: X0 + 30 + W * f, y1: 60, x2: X0 + 30 + W * f, y2: 116, stroke: col, 'stroke-width': 3 }); tx(X0 + 30 + W * f, 136 + i * 20, s, { 'font-size': 13.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); });
      mono(X0 + 30, 210, '1024차원 × 4B = 4,096B / 벡터', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      mono(X0 + 30, 240, '128GiB × 0.7 ÷ 4,096B ≈ 2,350만 건', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
      mono(X0 + 30, 270, '5천만 건 = 205GB > 128GiB (r6i.4xlarge)', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      tx(X0 + 30, 306, 'float32 원본만 계산 · HNSW 그래프는 메모리를 더 쓴다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const one = E(u, 0.2, 1.0), sp = E(u, 1.3, 2.2);
      card(X0 + 160 - 80 * sp, 140, 220 - 60 * sp, 90, { rx: 10, text: sp < 0.5 ? '단일 인덱스\n500만 건' : 'tenant_id', fs: 15, stroke: WARN, s: pop(u, 0.2) });
      if (sp > 0) card(X0 + 160 + 90 * sp, 140, 160, 90, { rx: 10, text: 'created_at', fs: 15, stroke: WARN, op: sp });
      tx(X0 + 30, 250, '검토 시점: 500만 건 도달 · 빌드 4시간 초과', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(X0 + 30, 280, '샤드 키: 멀티테넌트면 tenant_id, 시계열이면 created_at', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
      tx(X0 + 30, 310, 'consistent hashing 으로 재분배 비용을 줄인다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { dbIcon(X0 + 120, 150, 'primary', { stroke: INFO }); [0, 1].forEach((i) => { const s = pop(u, 0.6 + i * 0.6); dbIcon(X0 + 420, 90 + i * 130, 'replica', { stroke: INFO, s }); grow(X0 + 170, 150, X0 + 370, 90 + i * 130, E(u, 0.8 + i * 0.6, 1.3 + i * 0.6), INFO, { dash: '5 4' }); });
      card(X0 + 120, 280, 160, 40, { rx: 8, text: 'PgBouncer', fs: 15, mono: true, stroke: MUT, s: pop(u, 1.8) });
      tx(X0 + 30, 340, 'QPS 200 초과 → replica 추가 · replay_lag ≤ 1s 감시', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { const ax = axes(X0 + 70, 90, 300, 220, { x: [0.2, 0.7], y: [0.8, 1.0], xt: [0.2, 0.4, 0.6], yt: [0.8, 0.9, 1.0], grid: true });
      tx(X0 + 30, 70, 'recall@10', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 }); tx(X0 + 370, 350, 'ms / 질의', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      line(ax, HNSW.map(([, r, ms]) => [ms, r]), E(u, 0.3, 1.8), WARN);
      HNSW.forEach(([ef, r, ms], i) => { const op = clamp(E(u, 0.3, 1.8) * 2.2 - i + 0.4); if (op <= 0) return; el('circle', { cx: ax.X(ms), cy: ax.Y(r), r: 6, fill: WARN, opacity: op });
        mono(ax.X(ms) + (i === 2 ? -10 : 10), ax.Y(r) + 22, 'ef ' + ef + ' · ' + r.toFixed(3), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': i === 2 ? 'end' : 'start', opacity: op }); });
      tx(X0 + 30, 392, '실측: 10만 개 · 768차원 합성 데이터 · HNSW M=16', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) });
      tx(X0 + 430, 220, 'ef_search 를 키우면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(X0 + 430, 246, 'recall 이 오르고 느려진다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(X0 + 430, 300, 'Redis 캐시 hit ≥ 60%', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) }); tx(X0 + 430, 326, '부하 테스트 5000 RPS 분기 1회', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.3) }); return; }
    const SX = (n) => X0 + 30 + ((Math.log10(n) - 4) / 4) * 600;   // 1만 ~ 1억
    el('line', { x1: SX(1e4), y1: 300, x2: SX(1e8), y2: 300, stroke: MUT, 'stroke-width': 1.8 });
    [[1e5, '10만'], [1e6, '100만'], [5e6, '500만'], [1e7, '1000만']].forEach(([n, s]) => mono(SX(n), 322, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }));
    [[1e4, 1e5, 'Stage 0', '단일 · 기본'], [1e5, 1e6, 'Stage 1', 'HNSW 튜닝'], [1e6, 5e6, 'Stage 2', 'replica + PgBouncer'], [5e6, 1e7, 'Stage 3', '샤딩 + 캐시'], [1e7, 1e8, 'Stage 4', 'FAISS + pgvector']].forEach(([a, b, n, s], i) => { const f = E(u, 0.2 + i * 0.35, 0.6 + i * 0.35); if (f <= 0) return; const y = 90 + i * 40;
      el('rect', { x: SX(a), y: y - 15, width: (SX(b) - SX(a)) * f, height: 30, rx: 6, fill: WARN, opacity: 0.15 + i * 0.12 }); tx(SX(a) + 6, y + 5, n, { 'font-size': 13.5, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.35) });
      const sx = Math.max(SX(b) + 8, SX(a) + 72), over = sx > 900; tx(over ? SX(a) - 8 : sx, y + 5, s, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.35), 'text-anchor': over ? 'end' : 'start' }); }); }

  // ---------- 4. Security ----------
  function s4(t, c) { const { k, u } = c; ring(c);
    if (k === 0) { [['PII 차단', 'presidio 마스킹'], ['Access Control', 'RBAC · tenant scope'], ['Encryption', 'TLS 1.3 · KMS'], ['Audit Log', '90일 · 변조 불가']].forEach(([a, b], i) => { const x = X0 + 160 + (i % 2) * 330, y = 120 + Math.floor(i / 2) * 120, s = pop(u, 0.3 + i * 0.3);
        card(x, y, 300, 90, { rx: 12, stroke: GOOD, sw: 2, s }); tx(x, y - 6, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.4 + i * 0.3) }); tx(x, y + 22, b, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.3) }); }); return; }
    if (k === 1) { const m = E(u, 0.8, 1.6);
      const parts = [['홍길동', '<PERSON>'], ['hong@example.com', '<EMAIL>'], ['010-1234-5678', '<PHONE>']]; let x = X0 + 30;
      parts.forEach(([a, b], i) => { const s = m > 0.5 ? b : a, w = R.tw(s, 15) + 20; card(x + w / 2, 90, w, 36, { rx: 6, text: s, fs: 15, mono: true, stroke: m > 0.5 ? GOOD : BAD, fill: m > 0.5 ? GOODBG : BADBG }); x += w + 12; });
      tx(X0 + 30, 140, '예시 문장 · presidio-analyzer 가 찾아 바꾼다', { 'font-size': 13.5, fill: MUT });
      grow(X0 + 150, 160, X0 + 150, 220, E(u, 1.6, 2.0), GOOD); card(X0 + 150, 246, 200, 44, { rx: 8, text: '마스킹본 → 임베딩', fs: 14.5, stroke: GOOD, s: pop(u, 1.9) });
      grow(X0 + 440, 160, X0 + 440, 220, E(u, 1.8, 2.2), INFO); card(X0 + 440, 246, 200, 44, { rx: 8, text: '원본 → KMS 컬럼', fs: 14.5, stroke: INFO, s: pop(u, 2.1) }); lock(X0 + 560, 246, true, INFO, pop(u, 2.2));
      tx(X0 + 30, 320, '임베딩에서 원문을 거꾸로 복원할 수 있으니 원본은 넣지 않는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 2) { dbIcon(X0 + 330, 150, null, { stroke: INK });
      [['search_svc', 'SELECT', GOOD, 140], ['indexer', 'INSERT · UPDATE', WARN, 520]].forEach(([r, p, col, x], i) => { card(X0 + x - 50, 120 + i * 0, 150, 44, { rx: 8, text: r, fs: 15, mono: true, stroke: col, s: pop(u, 0.3 + i * 0.4) });
        grow(X0 + x + (i ? -125 : 25), 120, X0 + (i ? 385 : 275), 140, E(u, 0.7 + i * 0.4, 1.2 + i * 0.4), col); mono(X0 + x - 50, 166, p, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.9 + i * 0.4) }); });
      mono(X0 + 30, 280, 'WHERE tenant_id = $current_tenant', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      tx(X0 + 30, 310, 'API 키가 정하는 tenant 범위 밖은 볼 수 없다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { card(X0 + 90, 120, 120, 50, { rx: 8, text: '앱', fs: 15 }); dbIcon(X0 + 520, 120, null, { stroke: INFO });
      el('line', { x1: X0 + 150, y1: 120, x2: X0 + 470, y2: 120, stroke: GOOD, 'stroke-width': 6, opacity: 0.35 }); for (let i = 0; i < 3; i++) dot([[X0 + 150, 120], [X0 + 470, 120]], ((t * 0.6 + i / 3) % 1), GOOD, 5);
      lock(X0 + 310, 100, true, GOOD, pop(u, 0.4)); mono(X0 + 310, 150, 'TLS 1.3', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.5) });
      mono(X0 + 520, 196, 'at-rest: KMS', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) });
      clock(X0 + 150, 280, 32, E(u, 1.3, 2.6), INFO, 'key rotation 90일'); tx(X0 + 230, 285, 'RDS · EBS · S3 모두 KMS 키', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    // k4: 감사 로그
    const n = Math.floor(E(u, 0.2, 1.6) * 6); for (let i = 0; i < 6; i++) { if (i >= n) break; mono(X0 + 40, 90 + i * 30, `audit_log(user, query, ts, vector_id_hash)`, { 'font-size': 13.5, fill: i === n - 1 ? GOOD : MUT }); }
    el('rect', { x: X0 + 20, y: 66, width: 400, height: 190, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 2 }); lock(X0 + 440, 90, true, GOOD, pop(u, 1.4));
    tx(X0 + 460, 96, 'S3 Object Lock (compliance)', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); tx(X0 + 460, 122, '90일 보관 · 지우거나 고칠 수 없다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
    banner(X0 + 330, 320, '네 축 48/48 · 출항 점검 끝', pop(u, 2.0)); }

  const quiz = [
    { q: 'monitor.yaml에서 recall 드리프트 알람이 울리는 기준은 무엇인가?',
      o: ['recall@10이 0.95에서 3%p 떨어진 0.92 아래', 'p95가 50ms를 넘을 때', '임베딩 큐가 1,000건을 넘을 때'], a: 0,
      why: 'target 0.95에 drift_alert_pp 3을 두었다. golden 질의 500개로 매일 재서 0.92 아래로 내려가면 알린다.' },
    { q: 'HNSW 재빌드를 실측해 둔 이유로 맞는 것은?',
      o: ['스냅샷 크기를 줄이려고', '복구 때 인덱스를 다시 만드는 데 3h22m이 걸려 4시간 SLO 안인지 확인하려고', 'WAL 아카이빙을 끄려고'], a: 1,
      why: '인덱스는 복구 후 다시 만들어야 할 수 있다. 202분이 240분 안이라는 걸 숫자로 확인해야 RTO 계획이 선다.' },
    { q: '1024차원 float32 벡터 5천만 건을 r6i.4xlarge(128GiB) 한 대에 올릴 수 있나?',
      o: ['원본만 205GB라 한 대를 넘으므로 샤딩이나 큰 노드가 필요하다', '200GB면 128GiB에 압축되어 들어간다', 'HNSW 그래프가 메모리를 줄여 줘서 넉넉하다'], a: 0,
      why: '1024 × 4바이트 × 5천만 = 205GB다. 70% 임계로 보면 한 대에 약 2,350만 건이 한계다.' },
    { q: '임베딩하기 전에 PII를 마스킹하는 이유는?',
      o: ['임베딩 차원을 줄이려고', '검색 속도를 높이려고', '임베딩에서 원문이 복원될 수 있어서'], a: 2,
      why: '벡터도 원문 정보를 담고 있어 역추론 위험이 있다. 마스킹본만 임베딩하고 원본은 KMS로 암호화한 컬럼에 따로 둔다.' },
  ];
  const summary = [
    '검색 p95 50ms와 recall@10 0.95를 SLO로 두고, p99 100ms를 넘거나 큐 지연이 10초를 넘으면 사람을 깨운다.',
    '스냅샷과 WAL 아카이빙으로 RPO 5분을 지키고, 복구와 HNSW 재빌드 202분을 실제로 재 둔다.',
    '메모리 70%에서 알리고 500만 건이나 빌드 4시간을 넘으면 샤딩을 검토한다.',
    'PII는 마스킹한 뒤 임베딩하고, 권한·암호화·감사 로그까지 채워야 48개 항목이 끝난다.',
  ];
  const review = [
    { q: '새로 올린 문서가 몇 분째 검색되지 않는데 latency와 error rate는 정상이다. 먼저 볼 지표는?',
      o: ['recall@10 드리프트', '임베딩 큐 depth와 lag', 'KMS 키 교체 주기'], a: 1,
      why: '문서는 임베딩 큐를 거쳐야 인덱스에 들어간다. lag가 10초를 넘으면 신규 문서가 검색에 안 잡히는 것이 바로 이 증상이다.' },
    { q: '데이터가 4천만 건으로 늘자 메모리가 85%를 넘고 HNSW 빌드도 4시간을 넘었다. 무엇을 할 때인가?',
      o: ['ef_search를 120으로 올린다', 'read replica를 하나 더 붙인다', '샤드 키를 정해 샤딩하고 재분배 계획을 세운다'], a: 2,
      why: '500만 건과 빌드 4시간은 샤딩 검토 기준이고 85%는 확장 신호다. replica는 읽기 QPS를 나눌 뿐 한 노드의 메모리 한계는 그대로다.' },
    { q: '장애 뒤 스냅샷 복구는 성공했는데 검색이 몇 시간째 안 된다. 체크리스트에서 놓친 항목은?',
      o: ['인덱스 재빌드 시간 측정과 분기 복구 drill', 'TLS 1.3 강제', 'Grafana 대시보드 두 장'], a: 0,
      why: 'DB를 살려도 인덱스를 다시 만드는 시간이 남는다. 재빌드 시간을 재고 staging에서 복구를 연습해야 RTO 1시간을 믿을 수 있다.' },
  ];

  R.page({ title: '운영 체크리스트 48항목', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
