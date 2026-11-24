/* IV-2-3 pgvector 운영 튜닝 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, cross, check, clock, meters, snippet, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- RAM 16GB 막대 ----------
  const RX = 60, RW = 840, GB = RW / 16;
  function ram(y, segs, o) { o = o || {};
    tx(RX, y - 10, 'RAM 16GB', { 'font-size': 15, 'font-weight': 700 });
    el('rect', { x: RX, y, width: RW, height: 44, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    for (let g = 1; g < 16; g++) el('line', { x1: RX + g * GB, y1: y + 4, x2: RX + g * GB, y2: y + 40, stroke: GRID, 'stroke-width': 1 });
    let x = RX; segs.forEach(([gb, col, lab, hot]) => { const w = Math.max(3, gb * GB); el('rect', { x, y: y + 2, width: w, height: 40, rx: 5, fill: col, opacity: 0.85, stroke: hot ? INK : 'none', 'stroke-width': 2.5 });
      if (lab && w > tw(lab, 13.5) + 12) mono(x + 8, y + 27, lab, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL }); x += w; });
    if (o.ecs != null) { const w = o.ecs * GB; el('path', { d: `M${RX},${y + 54} L${RX},${y + 62} L${RX + w},${y + 62} L${RX + w},${y + 54}`, fill: 'none', stroke: INFO, 'stroke-width': 2.2 });
      mono(RX + w / 2, y + 80, `effective_cache_size = ${o.ecsLab}`, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: o.ecsOp ?? 1 }); } }
  function disk(x, y, s, lab) { const g = el('g', { opacity: s });
    el('rect', { x: x - 70, y: y - 34, width: 140, height: 68, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
    el('circle', { cx: x + 44, cy: y + 18, r: 6, fill: OFF }, g); tx(x, y + 4, lab || '디스크', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }, g); }

  // 1. 공장 출하 설정 — 인덱스가 RAM 에 못 들어간다
  function s1(t, c) { const { k, u } = c;
    const sb = [0.125, WARN, '', k === 0], mw = [0.0625, INFO, '', k === 1], wm = [0.004, ACC, '', k === 2];
    ram(70, k === 0 ? [sb] : k === 1 ? [sb, mw] : [sb, mw, wm], k >= 3 ? { ecs: 4, ecsLab: '4GB', ecsOp: k === 3 ? fade(u, 0.4) : 1 } : {});
    const labs = [['shared_buffers 128MB', WARN], ['maintenance_work_mem 64MB', INFO], ['work_mem 4MB', ACC]];
    labs.forEach(([s, col], i) => { if (i > k) return; mono(RX + 4, 146 + i * 22 + (k >= 3 ? 30 : 0), s, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: i === k ? fade(u, 0.3) : 1 }); });
    if (k === 0) { const s0 = pop(u, 0.5); card(240, 300, 300, 70, { rx: 10, text: 'HNSW 인덱스 ~6GB\n(1536차원 × 100만 행)', fs: 15, stroke: ACC, fill: ACCBG, color: ACC, s: s0 });
      disk(640, 300, fade(u, 0.9)); grow(390, 300, 568, 300, E(u, 1.2, 1.7), MUT);
      tx(480, 400, '128MB 칸에 6GB 가 안 들어간다 → 검색마다 디스크 I/O', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 1) { card(250, 300, 260, 64, { rx: 10, text: 'HNSW 빌드 중 그래프', fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.4) });
      el('rect', { x: 120, y: 268, width: 30, height: 64, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 0.9) });
      mono(135, 360, '64MB', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) });
      tx(640, 300, '그래프가 메모리를 넘치면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(640, 326, '빌드가 크게 느려진다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { [0, 1, 2, 3, 4, 5].forEach((i) => { const g = E(u, 0.3 + i * 0.15, 0.8 + i * 0.15); el('rect', { x: 140 + i * 36, y: 270, width: 30, height: 30, rx: 4, fill: i < 1 ? ACC : WARN, opacity: g }); });
      el('rect', { x: 136, y: 264, width: 40, height: 42, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5 }); mono(156, 326, '4MB', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700 });
      tx(140, 360, '큰 정렬·해시는 넘친 만큼 임시 파일로', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); disk(700, 290, fade(u, 1.2), '임시 파일');
      sub(700, 360, 'LIMIT 이 있는 top-N 정렬은 작게 끝난다', fade(u, 2.0)); return; }
    if (k === 3) { card(260, 320, 300, 70, { rx: 10, text: '플래너: "캐시가 4GB 뿐이면\n인덱스 스캔은 비싸다"', fs: 14.5, stroke: INFO, s: pop(u, 0.8) });
      grow(420, 320, 560, 320, E(u, 1.3, 1.7), BAD); pill(660, 320, 'Seq Scan 선택', BAD, pop(u, 1.8), { fs: 15 });
      sub(480, 400, 'OS 파일 캐시를 과소평가하게 만든다', fade(u, 2.1)); return; }
    meters(130, 280, 700, [{ name: 'p99 지연', val: Math.round(220 * E(u, 0.1, 1.2)) + 'ms', hot: true, bar: 100 }, { name: '처리량', val: '50 qps', bar: 4.5 }, { name: 'SLO', val: '50ms', hot: false }]);
    tx(480, 400, '세 값이 모두 모자라 인덱스가 디스크에 머문다 · SLO 미달', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }

  // 2. 메모리 튜닝 — 막대가 자라고 지연 곡선이 내려온다
  const QPS2 = [90, 120, 150, 165, 175, 180];
  function s2(t, c) { const { k, u } = c, b = c.beat || {};
    const sbG = k === 0 ? lerp(0.125, 4, E(u, 0.2, 1.2)) : 4, mwG = k === 1 ? lerp(0.0625, 2, E(u, 0.2, 1.2)) : k >= 1 ? 2 : 0.0625, wmG = k === 2 ? lerp(0.004, 0.25, E(u, 0.2, 1.2)) : k >= 2 ? 0.25 : 0.004;
    const ecs = k === 3 ? lerp(4, 12, E(u, 0.2, 1.2)) : k >= 3 ? 12 : 4;
    ram(60, [[sbG, WARN, 'shared_buffers 4GB', k === 0], [mwG, INFO, k === 4 ? '세션 4GB' : 'maint 2GB', k === 1 || k === 4], [wmG, ACC, '', k === 2]], { ecs, ecsLab: k >= 3 ? '12GB (75%)' : '4GB' });
    if (k === 4) el('rect', { x: RX + (4 + 2) * GB, y: 62, width: 2 * GB, height: 40, rx: 5, fill: INFO, opacity: 0.45 * E(u, 0.2, 0.8) });
    if (k === 2) mono(RX + 6.3 * GB, 54, 'work_mem 256MB (정렬·해시 하나당)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
    if (k === 0) fly(240, 330, RX + 2 * GB, 82, seg(u, 0.4, 1.4), '인덱스 페이지', { mono: false });
    // 아래 왼쪽: p99 곡선 (끝값만 숫자, 중간은 모양)
    const ax = axes(80, 200, 360, 150, { x: [0, 6], y: [0, 240], xt: [], yt: [0, 50, 220], grid: true, yl: 'p99 (ms)' });
    const pts = [[0, 220], [1, 155], [2, 118], [3, 90], [4, 71], [5, 52], [6, 35]];
    el('line', { x1: ax.X(0), y1: ax.Y(50), x2: ax.X(6), y2: ax.Y(50), stroke: GOOD, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' }); mono(ax.X(6), ax.Y(50) - 6, 'SLO', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'end' });
    line(ax, pts.slice(0, k + 2), k === 5 ? 1 : (k + E(u, 0.2, 1.4)) / (k + 1), BAD, { sw: 3 });
    mono(ax.X(0) + 8, ax.Y(220) + 4, '220', { 'font-size': 13.5, 'font-weight': 700, fill: BAD });
    if (k === 5) mono(ax.X(6) - 4, ax.Y(35) + 20, '35', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.6) });
    // 아래 오른쪽: 처리량
    const prev = k > 0 ? QPS2[k - 1] : 50, q = tween(prev, QPS2[k], u);
    if (k === 4) { tx(520, 214, 'REINDEX CONCURRENTLY idx_docs_hnsw', { 'font-size': 14, 'font-weight': 700, class: 'mono' });
      [['기본 설정', 45, OFF], ['세션 4GB', 8, ACC]].forEach(([n, m, col], i) => { const g = E(u, 0.4 + i * 0.5, 1.2 + i * 0.5), y = 240 + i * 46;
        tx(520, y + 19, n, { 'font-size': 14, 'font-weight': 700 }); el('rect', { x: 620, y, width: 260 * (m / 45) * g, height: 28, rx: 4, fill: col });
        mono(628 + 260 * (m / 45) * g, y + 19, `${m}분`, { 'font-size': 14.5, 'font-weight': 800, opacity: g }); });
      sub(700, 350, '서비스를 멈추지 않고 다시 만든다', fade(u, 1.8)); return; }
    meters(520, 230, 380, [{ name: '처리량', val: Math.round(q) + ' qps', bar: (q / 180) * 100, good: k === 5 }, { name: 'p99', val: k === 5 ? '35ms' : '내려가는 중', good: k === 5 }]);
    if (k === 5) tx(710, 340, '220ms → 35ms · 50 → 180 qps', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    else sub(710, 340, ['인덱스 페이지가 RAM 에 상주한다', 'HNSW 그래프가 메모리 안에서 지어진다', '과하게 올리면 동시 접속 × 작업 수만큼 잡힌다', '플래너가 인덱스 스캔을 고르게 하는 힌트'][k], fade(u, 1.2)); }

  // 3. 인덱스 파라미터 — 구역 수 · probes · m · ef
  const QPS3 = [190, 210, 235, 255, 270, 280];
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { // IVFFlat 1000 구역 격자
      tx(40, 50, k === 0 ? 'lists ≈ rows / 1000 → 100만 행이면 1000 구역' : `idx_docs_ivf · lists=1000 · probes=${k === 2 ? 32 : 1}`, { 'font-size': 15, 'font-weight': 800 });
      const shown = k === 0 ? Math.round(1000 * E(u, 0.2, 2.0)) : 1000, open = k === 1 ? 1 : k === 2 ? Math.round(lerp(1, 32, E(u, 0.3, 1.4))) : 0;
      for (let i = 0; i < shown; i++) { const x = 40 + (i % 50) * 10, y = 70 + Math.floor(i / 50) * 13;         el('rect', { x, y, width: 8, height: 10, rx: 1.5, fill: k >= 1 && rankOf(i) < open ? ACC : OFF, opacity: k >= 1 && rankOf(i) < open ? 1 : 0.55 }); }
      mono(40, 350, k === 0 ? '10만 → 100 · 100만 → 1000 · 1000만 → 3162 (√)' : `열어 보는 구역 ${open} / 1000`, { 'font-size': 14.5, 'font-weight': 700, fill: k ? ACC : MUT });
      if (k >= 1) { const rc = k === 1 ? 70 : tween(70, 94, u);
        tx(620, 120, 'IVFFlat recall', { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 620, y: 132, width: 280, height: 26, rx: 4, fill: SOFT });
        el('rect', { x: 620, y: 132, width: 280 * rc / 100, height: 26, rx: 4, fill: k === 2 ? ACC : WARN }); mono(628, 151, Math.round(rc) + '%', { 'font-size': 15, 'font-weight': 800, fill: PANEL });
        if (k === 2) { mono(620, 196, 'SET ivfflat.probes = 32;', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) }); sub(760, 226, '√1000 ≈ 32 · 12ms', fade(u, 1.4), { 'font-weight': 700 }); }
        else sub(760, 196, 'probes 기본값 1 → recall 이 낮다', fade(u, 0.8)); }
      qpsTag(k, u); return; }
    if (k <= 4) { // HNSW
      tx(40, 50, k === 3 ? 'idx_docs_hnsw · m=16 · ef_construction 64 → 128' : 'SET hnsw.ef_search = 100;  (기본 40)', { 'font-size': 15, 'font-weight': 800, class: k === 4 ? 'mono' : null });
      const N = [[120, 150], [200, 110], [280, 160], [180, 220], [260, 250], [350, 200], [100, 280], [330, 300], [420, 140], [430, 260], [380, 90], [150, 340]];
      const Q = [270, 230];
      N.forEach((p, i) => N.slice(i + 1).forEach((q2, j) => { const d = Math.hypot(p[0] - q2[0], p[1] - q2[1]); if (d < 110) el('line', { x1: p[0], y1: p[1], x2: q2[0], y2: q2[1], stroke: INFO, 'stroke-width': 1.4, opacity: 0.6 }); }));
      N.forEach((p) => el('circle', { cx: p[0], cy: p[1], r: 7, fill: INFO }));
      const r0 = k === 3 ? lerp(60, 110, E(u, 0.4, 1.4)) : lerp(70, 130, E(u, 0.4, 1.4));
      el('circle', { cx: Q[0], cy: Q[1], r: r0, fill: k === 3 ? INFO : ACC, opacity: 0.1, stroke: k === 3 ? INFO : ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      mono(Q[0], Q[1] + r0 + 20, k === 3 ? 'ef_construction 후보 범위' : 'ef_search 후보 범위', { 'font-size': 13.5, 'font-weight': 700, fill: k === 3 ? INFO : ACC, 'text-anchor': 'middle' });
      tx(620, 120, 'HNSW recall', { 'font-size': 15, 'font-weight': 700 }); const rc = k === 4 ? tween(92, 98, u) : 92;
      el('rect', { x: 620, y: 132, width: 280, height: 26, rx: 4, fill: SOFT }); el('rect', { x: 620, y: 132, width: 280 * rc / 100, height: 26, rx: 4, fill: k === 4 ? GOOD : INFO }); mono(628, 151, Math.round(rc) + '%', { 'font-size': 15, 'font-weight': 800, fill: PANEL });
      tx(620, 190, 'IVFFlat recall 94% (probes=32)', { 'font-size': 13.5, fill: MUT });
      if (k === 3) sub(760, 230, '빌드 때 넓게 볼수록 링크 품질 ↑ · 빌드는 느려진다', fade(u, 1.2));
      if (k === 4) { mono(760, 230, '9ms', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); sub(760, 256, '검색 때 후보를 넓게 → recall ↑ · 지연 ↑', fade(u, 1.4)); }
      qpsTag(k, u); return; }
    // k5: 매트릭스
    const M = [['10만', '100', '16 / 64'], ['100만', '1,000', '16 / 128'], ['500만', '2,236', '24 / 200'], ['1000만', '3,162', '32 / 256']];
    tx(80, 60, '행 수별 권장 (1536차원)', { 'font-size': 16, 'font-weight': 800 });
    ['행 수', 'IVFFlat lists', 'HNSW m / ef_cons'].forEach((h, j) => tx(100 + j * 220, 100, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
    M.forEach((r, i) => { const y = 120 + i * 52, s0 = pop(u, 0.3 + i * 0.25), hot = i === 1;
      el('rect', { x: 80, y, width: 640, height: 44, rx: 8, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': hot ? 2.2 : 1.2, opacity: clamp(s0) });
      r.forEach((v, j) => mono(100 + j * 220, y + 28, v, { 'font-size': 15, 'font-weight': hot ? 800 : 600, fill: hot ? ACC : INK, opacity: clamp(s0) })); });
    tx(80, 360, '지금 조합 = 100만 행 줄', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
    qpsTag(k, u); }
  function rankOf(i) { return RANK[i]; }
  const RANK = (() => { const a = []; for (let i = 0; i < 1000; i++) a.push([Math.hypot((i % 50) - 24.5, (Math.floor(i / 50) - 9.5) * 1.3), i]); a.sort((x, y) => x[0] - y[0]); const r = []; a.forEach(([_, i], n) => (r[i] = n)); return r; })();
  function qpsTag(k, u) { const prev = k > 0 ? QPS3[k - 1] : 180, q = tween(prev, QPS3[k], u); card(830, 380, 160, 44, { rx: 22, text: Math.round(q) + ' qps', fs: 16, mono: true, fw: 800, stroke: GOOD, color: GOOD }); }

  // 4. Read Replica — 읽기를 나눠 받는다
  const NODES = [[430, 'Primary'], [575, 'Replica 1'], [720, 'Replica 2'], [865, 'Replica 3']];
  const QP4 = [[280], [150, 350], [100, 350, 350], [50, 350, 350, 350], [50, 350, 350, 350]];
  const TOT = [280, 500, 800, 1100, 1100];
  function s4(t, c) { const { k, u } = c, n = QP4[k].length;
    tx(40, 44, 'CloudNativePG · instances: 4 · pgvector/pgvector:pg16', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
    NODES.forEach(([x, name], i) => { const on = i < n, s0 = i === n - 1 && k > 0 && k < 4 ? pop(u, 0.3) : 1;
      if (!on) { el('rect', { x: x - 58, y: 92, width: 116, height: 84, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5' }); mono(x, 140, '예정', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); return; }
      server(x, 132, name, { s: s0, lamp: i === 0 ? WARN : GOOD, stroke: i === 0 ? WARN : INK });
      const v = QP4[k][i], pv = k > 0 && QP4[k - 1][i] != null ? QP4[k - 1][i] : 0, q = tween(pv, v, u);
      el('rect', { x: x - 20, y: 330 - q * 0.26, width: 40, height: q * 0.26, rx: 4, fill: i === 0 ? WARN : ACC, opacity: 0.85 });
      mono(x, 350, Math.round(q) + '', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      if (k >= 2 && i < n) { el('rect', { x: x - 34, y: 210, width: 68, height: 18, rx: 4, fill: SOFT, stroke: GRID, opacity: k === 2 ? fade(u, 0.8) : 1 }); mono(x, 224, '200Gi', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 2 ? fade(u, 0.8) : 1 }); } });
    const tot = tween(k > 0 ? TOT[k - 1] : 280, TOT[k], u);
    tx(40, 300, '합계', { 'font-size': 15, 'font-weight': 700 }); mono(40, 328, Math.round(tot) + ' qps', { 'font-size': 22, 'font-weight': 800, fill: GOOD });
    if (k === 1) sub(250, 380, "hot_standby: 'on' → Replica 가 읽기를 받는다", fade(u, 1.0), { 'font-weight': 700, fill: INK });
    if (k === 2) sub(250, 380, '스토리지는 노드 수만큼 · 인덱스가 커지면 여기부터 찬다', fade(u, 1.2));
    if (k >= 3) { // PgBouncer 라우팅
      card(170, 132, 150, 60, { rx: 10, text: 'PgBouncer', fs: 15, stroke: INFO, color: INFO, s: k === 3 ? pop(u, 0.2) : 1 });
      mono(170, 186, 'rw / ro', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (k === 3) { for (let i = 0; i < 9; i++) { const tgt = NODES[1 + (i % 3)][0]; dot([[245, 132], [tgt - 60, 132]], (t * 0.6 + i / 9) % 1, ACC, 5); }
        dot([[245, 118], [372, 118]], (t * 0.4) % 1, WARN, 6);
        tx(170, 250, 'INSERT → vectordb_rw', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700 }); tx(170, 272, 'SELECT → vectordb_ro', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700 }); }
      if (k === 4) { fly(245, 118, 372, 118, seg(u, 0.1, 0.6), 'INSERT', { fill: WARN });
        grow(488, 160, 517, 160, E(u, 0.7, 1.0), MUT, { dash: '4 4' }); clock(648, 250, 20, E(u, 0.7, 2.4), WARN, '1~5초');
        cross(300, 255, 9, pop(u, 1.5)); tx(170, 290, '쓰자마자 Replica 를 읽으면', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
        tx(170, 312, '방금 행이 안 보인다', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); } } }

  // 5. 한계 — 행 수 눈금 위의 갈림길
  const LX = (r) => 80 + (Math.log10(r) - 6) * 260;   // 100만=80, 1000만=340, 1억=600, 10억=860
  function scaleAxis(k, u) { el('line', { x1: 70, y1: 330, x2: 880, y2: 330, stroke: MUT, 'stroke-width': 2 });
    [[1e6, '100만'], [1e7, '1000만'], [1e8, '1억'], [1e9, '10억']].forEach(([r, s]) => { el('line', { x1: LX(r), y1: 324, x2: LX(r), y2: 336, stroke: MUT, 'stroke-width': 2 }); mono(LX(r), 356, s, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: MUT }); });
    el('rect', { x: LX(1e6), y: 300, width: LX(1e7) - LX(1e6), height: 22, rx: 4, fill: GOOD, opacity: 0.35 });
    el('rect', { x: LX(1e7), y: 300, width: LX(1e8) - LX(1e7), height: 22, rx: 4, fill: WARN, opacity: 0.35 });
    el('rect', { x: LX(1e8), y: 300, width: LX(1e9) - LX(1e8), height: 22, rx: 4, fill: BAD, opacity: 0.35 });
    tx(LX(3e6), 316, 'pgvector 충분', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle' }); tx(LX(3e7), 316, '한계 임박', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle' }); tx(LX(3e8), 316, '갈아탈 시점', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle' }); }
  function s5(t, c) { const { k, u } = c;
    scaleAxis(k, u);
    const hereR = [1e7, 5e6, 5e7, 2e8, 2e8, 1e8][k]; const mx = LX(hereR); el('path', { d: `M${mx},${292} l-8,-12 l16,0 z`, fill: INK, opacity: fade(u, 0.2) });
    if (k === 0) { const pts = []; for (let i = 0; i <= 30; i++) { const r = 6 + i * 0.1, x = 80 + (r - 6) * 260; pts.push([x, 270 - 200 * Math.pow((r - 6) / 3, 2.4)]); }
      const g = E(u, 0.2, 1.8), m = Math.round(30 * g); el('polyline', { points: pts.slice(0, m + 1).map((p) => p.join(',')).join(' '), fill: 'none', stroke: BAD, 'stroke-width': 3 });
      tx(80, 60, '지연 곡선 (모양만)', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      tx(480, 120, '1000만 행까지는 지금 구성으로 넉넉하다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 1) { [['shared_buffers 4~8GB', 'maint 2~4GB'], ['HNSW m=16 → 24', 'ef_construction 128 → 200'], ['Read Replica 2~3대', '월별 파티셔닝 검토']].forEach(([a, b], i) => {
        const s0 = pop(u, 0.3 + i * 0.35); card(200 + i * 280, 150, 250, 80, { rx: 10, text: a + '\n' + b, fs: 15, stroke: GOOD, s: s0 }); });
      tx(480, 70, '100만 ~ 1000만 행', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD }); return; }
    if (k === 2) { tx(480, 56, '1000만 ~ 1억 행', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
      const parts = ['2025-01', '2025-02', '2025-03', '2025-04', '…']; el('rect', { x: 80, y: 80, width: 380, height: 40, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: 1 - E(u, 0.4, 1.0) });
      parts.forEach((p, i) => { const g = E(u, 0.6 + i * 0.15, 1.0 + i * 0.15); card(80 + 40 + i * 80, 160, 72, 40, { rx: 6, text: p, fs: 13.5, mono: true, stroke: WARN, op: g }); });
      sub(270, 214, '파티셔닝 필수 (월별 / 카테고리별)', fade(u, 1.4), { 'font-weight': 700, fill: INK });
      card(720, 150, 260, 90, { rx: 10, text: '인덱스 50GB+\n→ RAM 64GB+ 서버\nREINDEX 정책 · Replica 5대+', fs: 14.5, stroke: WARN, s: pop(u, 1.6) }); return; }
    if (k === 3) { tx(480, 56, '옵션 A · Citus 수평 샤딩', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      card(480, 110, 200, 46, { rx: 10, text: 'coordinator', fs: 15, mono: true, stroke: INFO, s: pop(u, 0.3) });
      [0, 1, 2, 3].forEach((i) => { const x = 210 + i * 180, g = E(u, 0.6 + i * 0.2, 1.0 + i * 0.2); grow(480, 134, x, 196, g, INFO, { plain: true });
        card(x, 220, 140, 46, { rx: 8, text: `worker ${i + 1}`, fs: 14, mono: true, stroke: INFO, op: g }); });
      sub(480, 272, '샤드 키(user_id 등) 설계가 핵심 · pgvector 지원은 부분적', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { tx(480, 56, '옵션 B · 전용 vector DB', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      [['Milvus', '대규모 검증'], ['Qdrant', '단일 노드 성능'], ['Pinecone', '운영 부담 최소']].forEach(([n, d], i) => { const s0 = pop(u, 0.3 + i * 0.3);
        card(210 + i * 270, 140, 230, 76, { rx: 10, text: n + '\n' + d, fs: 15, stroke: ACC, s: s0 }); });
      cross(330, 240, 9, pop(u, 1.5)); tx(350, 246, 'SQL 한 쿼리로 메타데이터를 JOIN 하던 편함은 잃는다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); return; }
    // k5: 갈아탈 시점
    tx(480, 56, '결론 · 1억 행에서 차종을 바꾼다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
    card(LX(3e6), 150, 220, 80, { rx: 12, text: '세단\nPostgreSQL + pgvector', fs: 15, stroke: GOOD, s: pop(u, 0.3) });
    grow(LX(3e6) + 115, 150, LX(3e8) - 125, 150, E(u, 0.8, 1.4), MUT);
    card(LX(3e8), 150, 240, 96, { rx: 12, text: '트럭 · 스포츠카\nCitus / vector DB\nFAISS GPU 캐시', fs: 15, stroke: BAD, s: pop(u, 1.4) }); }

  const quiz = [
    { q: '기본 설정(shared_buffers 128MB)에서 100만 행 벡터 검색의 p99가 220ms까지 튀는 가장 큰 이유는 무엇인가?',
      o: ['약 6GB 인덱스가 공유 버퍼에 안 들어가 검색마다 디스크를 읽어서', '거리 연산자를 잘못 골라서', 'work_mem이 너무 커서'], a: 0,
      why: '128MB 칸에 6GB 인덱스는 들어가지 않는다. 인덱스 페이지가 디스크에 머물러 매 검색이 I/O를 기다린다.' },
    { q: 'shared_buffers를 RAM 16GB의 25%인 4GB로 올리면 무엇이 달라지는가?',
      o: ['인덱스가 더 작아진다', '인덱스 페이지가 RAM에 상주해 지연이 내려간다', '복제 지연이 사라진다'], a: 1,
      why: '메모리 네 값을 손본 결과 p99는 220ms에서 35ms, 처리량은 50에서 180 qps가 됐다.' },
    { q: '100만 행에서 IVFFlat lists=1000으로 만든 뒤 recall이 70%에 머문다. 먼저 바꿀 값은 무엇인가?',
      o: ['lists를 10으로 줄인다', 'm을 32로 올린다', 'ivfflat.probes를 √1000 ≈ 32로 올린다'], a: 2,
      why: 'probes 기본값 1은 1000구역 중 하나만 본다. 32로 올리면 recall 94%, 12ms가 된다.' },
    { q: 'Replica 3대를 붙여 1100 qps가 됐다. 이때 생기는 주의점은 무엇인가?',
      o: ['Replica는 1~5초 늦어서 방금 INSERT한 행을 Replica에서 바로 못 볼 수 있다', 'Primary가 쓰기를 못 받는다', '인덱스를 Replica마다 따로 만들어야 한다'], a: 0,
      why: 'PgBouncer가 쓰기는 Primary로, 읽기는 Replica로 보낸다. 복제는 비동기라 쓰기 직후 읽기는 rw 쪽으로 보내야 한다.' },
    { q: '1억 행을 넘길 때 이 장이 권하는 길이 아닌 것은 무엇인가?',
      o: ['Citus 수평 샤딩', 'shared_buffers를 계속 키워 단일 서버로 버틴다', '전용 vector DB 또는 FAISS GPU 캐시'], a: 1,
      why: '1억 행부터는 인덱스 크기·빌드 시간·지연이 단일 PostgreSQL의 한계에 닿는다. 페이지는 Citus, 전용 vector DB, FAISS GPU 셋을 든다.' },
  ];
  const summary = [
    '기본 128MB 공유 버퍼에는 6GB 인덱스가 안 들어가 p99가 220ms까지 튄다.',
    '메모리 네 값을 RAM에 맞추자 p99는 35ms, 처리량은 50에서 180 qps가 됐다.',
    'lists와 probes, m과 ef_search를 행 수에 맞추면 recall과 지연이 함께 맞춰진다.',
    'Replica로 읽기를 나누면 1100 qps까지 가고, 1억 행부터는 다른 도구를 본다.',
  ];
  const review = [
    { q: 'shared_buffers를 4GB로 올렸는데도 p99가 그대로다. SHOW shared_buffers가 128MB로 나온다. 원인은?',
      o: ['ALTER SYSTEM 뒤 재시작을 하지 않았다', 'work_mem이 너무 작다', 'probes가 1이다'], a: 0,
      why: 'shared_buffers는 pg_reload_conf로 바뀌지 않고 서버 재시작이 필요하다. 적용 여부는 SHOW로 확인한다.' },
    { q: '검색 recall이 92%라 98%로 올리고 싶다. HNSW를 다시 빌드할 시간은 없다. 무엇을 바꾸는가?',
      o: ['ef_construction을 200으로 올린다', '검색 시점의 hnsw.ef_search를 40에서 100으로 올린다', 'm을 24로 올린다'], a: 1,
      why: 'ef_construction과 m은 빌드 때 정해진다. ef_search는 SET으로 바로 바뀌고 예시에서 recall 98%, 9ms였다.' },
    { q: '문서를 저장하자마자 "방금 쓴 글이 검색에 안 나온다"는 문의가 들어온다. Read Replica를 쓰는 구성이다. 먼저 의심할 것은?',
      o: ['임베딩 차원이 틀렸다', '1~5초의 복제 지연 동안 ro 풀이 아직 그 행을 못 받았다', 'HNSW 인덱스가 깨졌다'], a: 1,
      why: '쓰기는 Primary에 먼저 반영되고 Replica는 늦게 따라온다. 쓰기 직후 확인은 vectordb_rw로 읽게 한다.' },
  ];

  R.page({ title: 'pgvector 운영 튜닝', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
