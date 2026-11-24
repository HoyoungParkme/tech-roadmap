/* V-2-1 remote_write — 외부 장기 저장 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, clock, dbIcon, browser } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (x, y, s, frac, a) => { const n = Math.round(s.length * clamp(frac)); if (n > 0) mono(x, y, s.slice(0, n), a); };
  function prom(cx, cy, name, o) { o = o || {}; const w = o.w || 170, h = o.h || 62, g = G(cx, cy, o.s, o.op), col = o.dead ? BAD : ACC;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: o.dead ? BADBG : PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    el('circle', { cx: -w / 2 + 18, cy: 0, r: 6.5, fill: col }, g); tx(-w / 2 + 32, 6, name, { 'font-size': 16, 'font-weight': 800, fill: o.dead ? BAD : INK }, g); return g; }
  function remote(cx, cy, name, o) { o = o || {}; card(cx, cy, o.w || 220, o.h || 66, { rx: 12, stroke: INFO, sw: 2.5, fill: INFOBG, s: o.s, op: o.op });
    tx(cx, cy - (o.sub ? 4 : -6), name, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: INFO, opacity: o.op ?? 1 });
    if (o.sub) mono(cx, cy + 18, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); }

  // ── 1. 로컬 TSDB 의 한계 — 15일 칸
  const PX = 120, PY = 170, CX0 = 300, CW = 40;
  function days(k, u, o) { o = o || {}; for (let i = 0; i < 15; i++) { const x = CX0 + i * CW, show = o.fill == null ? 1 : clamp(o.fill * 15 - (14 - i));
      if (show <= 0) continue; el('rect', { x, y: PY - 20, width: CW - 4, height: 40, rx: 4, fill: o.col || ACC, opacity: (o.op ?? 0.85) * show }); }
    mono(CX0, PY + 40, '15d 전', { 'font-size': 13.5, fill: MUT }); mono(CX0 + 15 * CW - 4, PY + 40, '지금', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  function s1(t, c) { const { k, u } = c;
    const dead = k === 1 && u > 1.5;
    prom(PX, PY, 'Prometheus', { dead });
    if (k === 0) { pill(330, 50, '--storage.tsdb.retention.time=15d', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); pill(740, 50, 'retention.size=50GB', WARN, pop(u, 0.5), { mono: true, fs: 13.5 });
      days(k, u, { fill: E(u, 0.6, 1.8) });
      el('rect', { x: CX0, y: 268, width: 596, height: 20, rx: 5, fill: SOFT, stroke: GRID }); el('rect', { x: CX0, y: 268, width: 596 * 0.55 * E(u, 1.2, 2.2), height: 20, rx: 5, fill: WARN, opacity: 0.8 });
      mono(CX0 + 596, 306, '50GB 상한', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 1.8) }); tx(CX0, 258, '디스크', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      sub(480, 380, '둘 중 먼저 닿는 쪽에서 오래된 블록부터 지운다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { days(k, u, { op: dead ? 0.85 * (1 - E(u, 1.6, 2.4)) : 0.85 });
      if (!dead) { el('rect', { x: CX0 - 210, y: PY - 20, width: 200, height: 40, rx: 4, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
        sub(CX0 - 110, PY - 30, '더 늘려도 수주가 한계', fade(u, 0.5), { fill: INK, 'font-weight': 700 }); }
      if (dead) { cross(PX, PY, 20, pop(u, 1.5)); sub(CX0 + 300, PY + 80, '노드가 죽으면 그 기간 지표도 함께 사라진다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); } return; }
    days(k, u, {});
    if (k === 2) { const g = E(u, 0.2, 1.4); el('line', { x1: CX0 + 596, y1: 300, x2: lerp(CX0 + 596, 60, g), y2: 300, stroke: INK, 'stroke-width': 2.2 });
      el('rect', { x: CX0, y: 286, width: 596, height: 28, rx: 4, fill: ACCBG, opacity: g });
      mono(60, 330, '수년 전', { 'font-size': 13.5, fill: MUT, opacity: g }); mono(CX0 - 40, 330, '수개월 전', { 'font-size': 13.5, fill: MUT, opacity: g, 'text-anchor': 'middle' });
      pill(150, 370, '작년 대비 추세?', BAD, pop(u, 1.4), { fs: 14 }); el('rect', { x: 60, y: 286, width: CX0 - 64, height: 28, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.5) });
      sub(560, 370, '감사·SLA 보고는 수개월~수년치를 요구한다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { pill(PX, PY + 62, 'cluster: prod-seoul', ACC, pop(u, 0.3), { mono: true, fs: 13.5 }); pill(PX, PY + 98, 'replica: A', ACC, pop(u, 0.7), { mono: true, fs: 13.5 });
      for (let i = 0; i < 3; i++) { const x = CX0 + 140 + i * 160; fly(PX + 90, PY + 62, x, 330, seg(u, 1.0 + i * 0.3, 1.9 + i * 0.3), 'cluster·replica', { stay: true, fill: ACC, mono: true }); }
      sub(560, 380, '원격으로 보낼 샘플마다 출처 라벨이 붙는다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); return; }
    // k4: 로컬은 최근, 장기는 밖으로
    card(CX0 + 298, PY - 52, 230, 30, { rx: 15, text: '로컬 = 빠른 최근 조회', fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 0.2) });
    grow(PX + 40, PY + 32, 640, 330, E(u, 0.6, 1.5), ACC, {}); mono(330, 300, 'remote_write', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
    remote(760, 340, '외부 장기 스토리지', { sub: '수개월~수년', s: pop(u, 1.4) }); }

  // ── 2. remote_write 설정 — 같은 샘플을 두 곳에
  const TG = [72, 210], PR = [290, 210], LO = [560, 340], RM = [790, 110];
  function s2(t, c) { const { k, u } = c;
    card(TG[0], TG[1], 110, 44, { rx: 8, text: 'api:8080', fs: 14, mono: true, stroke: GRID });
    prom(PR[0], PR[1], 'Prometheus', { w: 180 });
    card(LO[0], LO[1], 170, 52, { rx: 10, text: '로컬 TSDB', fs: 15.5, fw: 800, stroke: INK });
    remote(RM[0], RM[1], 'Mimir', { sub: k >= 1 ? '/api/v1/push' : '원격 저장소', op: k === 0 ? 0.4 : 1, s: k === 1 ? pop(u, 0.2) : 1 });
    const sIn = [[TG[0] + 56, TG[1]], [PR[0] - 90, PR[1]]], sLo = [[PR[0] + 40, PR[1] + 31], [LO[0] - 86, LO[1]]], sRm = [[PR[0] + 90, PR[1] - 10], [RM[0] - 110, RM[1] + 10]];
    el('line', { x1: sIn[0][0], y1: sIn[0][1], x2: sIn[1][0], y2: sIn[1][1], stroke: GRID, 'stroke-width': 2 });
    el('line', { x1: sLo[0][0], y1: sLo[0][1], x2: sLo[1][0], y2: sLo[1][1], stroke: INK, 'stroke-width': 2.2 });
    const rg = k === 1 ? E(u, 0.2, 1.0) : 1; el('line', { x1: sRm[0][0], y1: sRm[0][1], x2: lerp(sRm[0][0], sRm[1][0], k === 0 ? 1 : rg), y2: lerp(sRm[0][1], sRm[1][1], k === 0 ? 1 : rg), stroke: k === 0 ? OFF : INFO, 'stroke-width': 2.4, 'stroke-dasharray': k === 0 ? '6 6' : null });
    for (let i = 0; i < 3; i++) { dot(sIn, ((t * 0.5 + i / 3) % 1), ACC, 5); dot(sLo, ((t * 0.5 + i / 3) % 1), ACC, 5); }
    if (k === 0) { sub(LO[0] + 40, LO[1] + 46, '로컬 저장은 그대로', fade(u, 0.8), { 'font-weight': 700, fill: INK }); sub(560, 130, '같은 샘플을 원격에도?', fade(u, 1.4), { 'font-weight': 700, fill: MUT }); return; }
    const pkt = (txt, col) => { for (let i = 0; i < 2; i++) { const pu = ((t * 0.35 + i / 2) % 1); if (k === 1 && u < 1.0) continue; fly(sRm[0][0], sRm[0][1], sRm[1][0], sRm[1][1], pu, txt, { fill: col || INFO, mono: true }); } };
    if (k === 1) { pkt('샘플'); typed(390, 70, 'url: https://mimir.internal/api/v1/push', seg(u, 0.4, 1.6), { 'font-size': 14, 'font-weight': 700, fill: INFO }); return; }
    if (k === 2) { pkt('샘플'); lock(RM[0] - 140, RM[1] + 40, true, INFO, pop(u, 0.3)); mono(390, 70, 'basic_auth: prom-prod', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      sub(560, 280, 'password_file 에서 비밀번호를 읽는다', fade(u, 1.2), { fill: MUT }); return; }
    if (k === 3) { pkt('team-payments', WARN); mono(390, 70, 'X-Scope-OrgID: team-payments', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      ['team-payments', 'team-search'].forEach((s, i) => pill(RM[0] + (i - 0.5) * 120, RM[1] + 62, s, i === 0 ? WARN : MUT, pop(u, 0.9 + i * 0.3), { mono: true, fs: 13.5 }));
      sub(RM[0], RM[1] + 100, '헤더를 보고 테넌트를 정한다', fade(u, 1.6)); return; }
    if (k === 4) { const names = [['go_goroutines', true], ['http_requests_total', false], ['go_gc_duration_seconds', true], ['process_cpu_seconds_total', false]];
      names.forEach(([n, drop], i) => { const y = 286 + i * 30, a = seg(u, 0.3 + i * 0.4, 1.2 + i * 0.4);
        mono(60, y, n, { 'font-size': 14, fill: drop ? BAD : INK, 'font-weight': 700, opacity: fade(u, 0.1 + i * 0.1), 'text-decoration': drop && a > 0.6 ? 'line-through' : null });
        if (!drop && a > 0 && a < 1) dot([[PR[0] + 90, PR[1] - 10], [RM[0] - 110, RM[1] + 10]], a, INFO, 6); });
      card(640, 210, 220, 44, { rx: 8, text: 'regex: "go_.*" → drop', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.4) });
      sub(LO[0] + 40, LO[1] + 46, '로컬에는 전부 남는다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    // k5: 압축
    const sh = E(u, 0.6, 1.6); for (let i = 0; i < 2; i++) { const pu = ((t * 0.35 + i / 2) % 1), x = lerp(sRm[0][0], sRm[1][0], E(pu, 0, 1)), y = lerp(sRm[0][1], sRm[1][1], E(pu, 0, 1)), w = lerp(70, 34, sh);
      el('rect', { x: x - w / 2, y: y - w / 3, width: w, height: w * 0.66, rx: 4, fill: INFO }); }
    pill(560, 70, 'Protobuf + Snappy (기본)', INFO, pop(u, 0.3), { fs: 14 }); pill(560, 280, 'send_exemplars: true (선택)', MUT, pop(u, 1.4), { mono: true, fs: 13.5 });
    sub(560, 104, '보내기 전에 묶고 압축한다', fade(u, 1.0)); }

  // ── 3. WAL → 큐 → 샤드 → 원격
  const LANE_X = 320, LANE_W = 360, RMX = 830;
  function wal(t, u, on) { el('rect', { x: 30, y: 60, width: 190, height: 40, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    for (let i = 0; i < 6; i++) el('rect', { x: 38 + i * 30, y: 66, width: 24, height: 28, rx: 3, fill: ACC, opacity: 0.35 + 0.1 * i });
    tx(30, 50, 'WAL', { 'font-size': 15, 'font-weight': 800 }); if (on) dot([[220, 80], [LANE_X - 10, 160]], (t * 0.6) % 1, ACC, 6); }
  function lanes(n, fills, o) { o = o || {}; const h = 26, gap = 8, y0 = 150;
    for (let i = 0; i < n; i++) { const y = y0 + i * (h + gap); el('rect', { x: LANE_X, y, width: LANE_W, height: h, rx: 5, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: LANE_X, y, width: LANE_W * clamp(fills[i] ?? fills[0]), height: h, rx: 5, fill: (fills[i] ?? fills[0]) >= 0.999 ? BAD : ACC, opacity: 0.75 });
      mono(LANE_X - 10, y + 18, 'S' + (i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      if (o.flow) dot([[LANE_X + LANE_W, y + h / 2], [RMX - 90, 220]], ((o.t * 0.5 + i * 0.17) % 1), INFO, 5); } }
  function s3(t, c) { const { k, u } = c;
    remote(RMX, 220, '원격', { w: 160, sub: 'mimir.internal', op: k === 4 ? 1 : 1 });
    if (k === 0) { wal(t, u, true); lanes(1, [0.3 * E(u, 0.6, 2.0)], {}); pill(LANE_X + LANE_W / 2, 110, 'queue_config:', ACC, pop(u, 0.4), { mono: true });
      sub(480, 380, '곧바로 보내지 않고 WAL 을 읽어 큐에 쌓는다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { wal(t, u, u < 1.8); const f = E(u, 0.2, 1.8); lanes(1, [f], {});
      mono(LANE_X + LANE_W, 140, 'capacity: 10000', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
      mono(LANE_X, 140, Math.round(f * 10000).toLocaleString('en-US'), { 'font-size': 14.5, 'font-weight': 700, fill: f >= 0.999 ? BAD : INK });
      if (u > 1.8) { card(125, 150, 190, 40, { rx: 8, text: '가득 차면 WAL 읽기 멈춤', fs: 13.5, stroke: BAD, color: BAD, s: pop(u, 1.8) }); }
      sub(480, 380, '샘플을 버리지 않고 WAL 쪽에서 기다린다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { wal(t, u, true); const n = Math.max(1, Math.round(lerp(1, 6, E(u, 0.3, 1.8)))); lanes(n, [0.85, 0.6, 0.5, 0.4, 0.35, 0.3], { flow: true, t });
      mono(LANE_X, 134, `min_shards: 1  →  max_shards: 50`, { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
      sub(LANE_X + LANE_W / 2, 372, '그림은 6개까지, 실제 상한은 50', fade(u, 1.8));
      mono(480, 402, '50 샤드 × 10,000 = 최대 500,000 샘플 대기', { 'font-size': 14.5, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    if (k === 3) { wal(t, u, true); const y = 170, bw = LANE_W / 5;
      for (let i = 0; i < 5; i++) { const on = i < 4 || u > 1.8; el('rect', { x: LANE_X + i * bw + 2, y, width: bw - 4, height: 34, rx: 4, fill: i === 4 ? WARN : ACC, opacity: on ? (i === 4 ? 0.45 : 0.75) : 0.12 });
        if (i < 4) mono(LANE_X + i * bw + bw / 2, y + 22, '2000', { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700 }); }
      mono(LANE_X, 150, 'max_samples_per_send: 2000', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
      for (let i = 0; i < 4; i++) fly(LANE_X + i * bw + bw / 2, y + 17, RMX - 80, 220, seg(u, 0.4 + i * 0.25, 1.1 + i * 0.25), '2000', { mono: true });
      clock(LANE_X + 4.5 * bw, 270, 24, E(u, 0.4, 2.2), WARN, '5s'); if (u > 2.2) fly(LANE_X + 4.5 * bw, y + 17, RMX - 80, 220, seg(u, 2.2, 2.9), '덜 찬 배치', { fill: WARN, mono: false });
      sub(480, 380, 'capacity 10000 = 2000 × 5 (권장 3~10배)', fade(u, 1.6), { 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { const seq = ['30ms', '60ms', '120ms', '240ms', '480ms', '960ms', '1.92s', '3.84s', '5s'];
      cross(RMX - 100, 160, 12, pop(u, 0.2)); mono(RMX, 160, '5xx', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', x: RMX - 60, opacity: fade(u, 0.3) });
      seq.forEach((s, i) => { const x = 60 + i * 76, s2 = pop(u, 0.4 + i * 0.18); card(x + 32, 90, 66, 32, { rx: 16, text: s, fs: 13.5, mono: true, stroke: i === 8 ? BAD : WARN, color: i === 8 ? BAD : INK, s: s2 });
        if (i < 8 && s2 > 0.8) mono(x + 70, 76, '×2', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      tx(60, 48, '재시도 간격 (min_backoff 30ms → max_backoff 5s)', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      // 2시간 WAL
      const g = E(u, 1.4, 2.6); el('rect', { x: 60, y: 300, width: 640, height: 26, rx: 5, fill: SOFT, stroke: GRID }); el('rect', { x: 60, y: 300, width: 640 * g, height: 26, rx: 5, fill: g >= 0.999 ? BAD : ACC, opacity: 0.7 });
      tx(60, 290, '원격이 막힌 시간', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(700, 290, '2h', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end' });
      sub(380, 356, g < 0.999 ? '2시간 안이면 WAL 에 남아 다시 보낸다' : 'WAL 이 정리되며 못 보낸 샘플은 사라진다', 1, { 'font-weight': 700, fill: g < 0.999 ? GOOD : BAD }); return; }
    // k5: 감시 지표 — 모양만 (값은 환경마다 다르다)
    const M = [['prometheus_remote_storage_samples_pending', '큐 적체', [0, 0, 1, 2, 4, 7, 9, 10], WARN], ['prometheus_remote_storage_shards', '샤드 수', [1, 1, 1, 3, 3, 6, 6, 6], ACC], ['…_samples_failed_total', '실패 누적', [0, 0, 0, 0, 1, 1, 2, 2], BAD]];
    M.forEach(([n, d, v, col], i) => { const y = 70 + i * 110, s = pop(u, 0.2 + i * 0.4); card(330, y + 20, 600, 88, { rx: 10, stroke: GRID, sw: 1.5, s });
      if (s < 0.6) return; mono(48, y + 4, n, { 'font-size': 14, 'font-weight': 700, fill: INK }); tx(48, y + 36, d, { 'font-size': 14, fill: col, 'font-weight': 700 });
      const g = E(u, 0.5 + i * 0.4, 1.6 + i * 0.4), pts = v.map((a, j) => [440 + j * 26, y + 44 - a * 4]); el('polyline', { points: pts.slice(0, Math.max(2, Math.round(pts.length * g))).map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.6 }); });
    sub(780, 400, '선 모양은 예시', fade(u, 1.8)); }

  // ── 4. 백엔드 고르기 — url 만 바뀐다
  const BK = [['Mimir', 70, INFO], ['VictoriaMetrics', 162, GOOD], ['Cortex', 254, INFO], ['Thanos', 346, WARN]];
  function s4(t, c) { const { k, u } = c, PX4 = [120, 208];
    BK.forEach(([n, y, col], i) => card(760, y, 210, 60, { rx: 10, text: n, fs: 16, fw: 800, stroke: col, color: col, s: k === 0 ? pop(u, 0.3 + i * 0.2) : 1 }));
    if (k === 4) { [['운영 단순함', 1], ['대규모·멀티테넌트', 0], ['대규모·멀티테넌트', 2], ['기존 Prometheus 재활용', 3]].forEach(([s, j], i) => { const y = BK[j][1];
        if (i !== 2) tx(80, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); grow(320, i === 2 ? BK[0][1] + 8 : y, 650, y, E(u, 0.5 + i * 0.3, 1.1 + i * 0.3), BK[j][2], {}); });
      sub(330, 400, '저장 비용은 S3·GCS 같은 오브젝트 스토리지 백엔드로 줄인다', fade(u, 1.9), { 'font-weight': 700, fill: INK }); return; }
    prom(PX4[0], PX4[1], 'Prometheus', { w: 180 });
    const to = k === 1 ? 0 : k === 2 ? 1 : k === 3 ? 2 : -1;
    if (k === 0) { el('line', { x1: PX4[0] + 90, y1: PX4[1], x2: 460, y2: PX4[1], stroke: INK, 'stroke-width': 2.4 }); el('circle', { cx: 466, cy: PX4[1], r: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.4 });
      sub(330, PX4[1] - 18, '표준 remote_write 프로토콜', fade(u, 0.8), { 'font-weight': 700, fill: INK }); sub(330, PX4[1] + 32, '꽂을 곳(url)만 고른다', fade(u, 1.4)); return; }
    const y = BK[to][1], g = E(u, 0.2, 1.0); el('path', { d: `M${PX4[0] + 90},${PX4[1]} H420 L${lerp(420, 655, g)},${lerp(PX4[1], y, g)}`, fill: 'none', stroke: BK[to][2], 'stroke-width': 2.6 });
    if (g > 0.95) dot([[PX4[0] + 90, PX4[1]], [420, PX4[1]], [655, y]], (t * 0.5) % 1, BK[to][2], 6);
    const urls = ['https://mimir.internal/api/v1/push', 'http://vminsert:8480/insert/0/prometheus/api/v1/write', 'https://cortex.internal/api/prom/push'];
    typed(40, 330, 'url: ' + urls[to], seg(u, 0.6, 1.8), { 'font-size': 14, 'font-weight': 700, fill: BK[to][2] });
    if (k === 1) pill(330, 370, 'X-Scope-OrgID: team-payments', WARN, pop(u, 1.6), { mono: true, fs: 13.5 });
    if (k === 2) sub(300, 370, '단일 바이너리 · 설정 방식은 같고 경로만 다르다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
    if (k === 3) { card(PX4[0], 110, 120, 34, { rx: 8, text: 'sidecar', fs: 14, stroke: WARN, color: WARN, s: pop(u, 1.0) });
      for (let i = 0; i < 3; i++) fly(PX4[0] + 60, 110, 650, BK[3][1], seg(u, 1.3 + i * 0.35, 2.2 + i * 0.35), '2h 블록', { fill: WARN });
      sub(300, 370, 'Thanos 기본형은 블록 업로드 (Receive 는 remote_write 수신)', fade(u, 2.0), { 'font-weight': 700, fill: INK }); } }

  // ── 5. remote_read 와 함정
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const x0 = 80, x1 = 880, xs = 640;
      el('rect', { x: x0, y: 180, width: xs - x0 - 4, height: 50, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 }); el('rect', { x: xs, y: 180, width: x1 - xs, height: 50, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 });
      tx((x0 + xs) / 2, 211, '과거 · 원격 스토리지에만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO }); tx((xs + x1) / 2, 211, '최근 · 로컬 TSDB', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC });
      browser(480, 70, 220, 70, null, {}); tx(480, 82, 'Grafana 질의 (긴 구간)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 });
      const g = k === 0 ? E(u, 0.3, 1.2) : 1; el('path', { d: `M${lerp(480, x0, g)},150 H${lerp(480, x1, g)}`, stroke: INK, 'stroke-width': 2.2, fill: 'none' });
      remote(250, 330, '원격 스토리지', { sub: '/prometheus/api/v1/read', w: 260, s: k === 0 ? pop(u, 0.8) : 1 });
      const r1 = k === 0 ? E(u, 1.2, 2.0) : 1; grow(250, 296, 250, lerp(296, 236, r1), r1, INFO, {}); mono(268, 272, 'remote_read', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: r1 });
      if (k === 1) { lock(370, 330, true, INFO, pop(u, 0.3)); mono(400, 335, 'basic_auth', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.4) });
        card(760, 330, 220, 46, { rx: 8, text: 'read_recent: false', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.9) }); grow(760, 306, 760, 236, E(u, 1.3, 1.9), GOOD, {});
        sub(760, 380, '최근 구간은 로컬이 답한다', fade(u, 1.9), { 'font-weight': 700, fill: INK }); } return; }
    if (k === 2) { tx(60, 52, '함정 1 · 백프레셔', { 'font-size': 18, 'font-weight': 800, fill: WARN });
      const f = E(u, 0.2, 1.6); el('rect', { x: 60, y: 110, width: 520, height: 34, rx: 6, fill: SOFT, stroke: GRID }); el('rect', { x: 60, y: 110, width: 520 * f, height: 34, rx: 6, fill: f > 0.98 ? BAD : WARN, opacity: 0.8 });
      tx(60, 100, '큐 (samples_pending ↑)', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); remote(780, 127, '느린 원격', { w: 180 });
      dot([[580, 127], [690, 127]], (t * 0.15) % 1, INFO, 6);
      const g = E(u, 1.4, 2.6); el('line', { x1: 60, y1: 240, x2: 60 + 640 * g, y2: 240, stroke: g > 0.99 ? BAD : INK, 'stroke-width': 3 }); mono(700, 228, '2h', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end' });
      tx(60, 228, '밀린 시간', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      sub(380, 290, g < 0.99 ? '지표가 늦게 도착한다' : '2시간을 넘기면 못 보낸 샘플이 사라진다', 1, { 'font-weight': 700, fill: g < 0.99 ? WARN : BAD });
      pill(380, 350, '대응: max_shards ↑, max_samples_per_send 조정', ACC, pop(u, 2.0), { fs: 14 }); return; }
    if (k === 3) { tx(60, 52, '함정 2 · 카디널리티가 곧 비용', { 'font-size': 18, 'font-weight': 800, fill: WARN });
      const names = ['http_requests_total', 'go_goroutines', 'process_cpu_seconds_total', 'go_memstats_alloc_bytes', 'node_load1', 'process_open_fds'];
      names.forEach((n, i) => { const drop = /^(go_|process_)/.test(n), y = 100 + i * 40, d = drop ? E(u, 1.0 + i * 0.12, 1.6 + i * 0.12) : 0;
        mono(60, y, n, { 'font-size': 14.5, 'font-weight': 700, fill: drop ? BAD : INK, opacity: 1 - d * 0.65, 'text-decoration': d > 0.5 ? 'line-through' : null });
        if (!drop) { el('rect', { x: 360, y: y - 14, width: 300, height: 18, rx: 4, fill: INFO, opacity: 0.7 }); } else el('rect', { x: 360, y: y - 14, width: 300 * (1 - d), height: 18, rx: 4, fill: BAD, opacity: 0.5 }); });
      card(800, 200, 210, 70, { rx: 10, text: 'drop\ngo_.* | process_.*', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.6) });
      sub(510, 360, '막대 = 원격으로 보내는 샘플 (모양만)', fade(u, 1.8)); return; }
    // k4: 인증 · 비용
    tx(60, 52, '함정 3·4 · 인증과 비용', { 'font-size': 18, 'font-weight': 800, fill: WARN });
    prom(150, 150, 'Prometheus', { w: 180 }); remote(760, 150, 'Mimir', { w: 180 });
    fly(240, 150, 670, 150, seg(u, 0.2, 1.0), '헤더·인증 없음', { fill: BAD }); if (u > 1.0) { pill(620, 104, '401 / 403', BAD, pop(u, 1.0), { mono: true }); fly(670, 170, 240, 170, seg(u, 1.1, 1.8), '거부', { fill: BAD }); }
    tx(60, 290, '요금 = 샘플 수에 비례', { 'font-size': 16, 'font-weight': 800 });
    const g = E(u, 1.6, 2.5); el('rect', { x: 60, y: 310, width: 600, height: 26, rx: 5, fill: SOFT }); el('rect', { x: 60, y: 310, width: 600 * lerp(1, 0.55, g), height: 26, rx: 5, fill: g > 0.5 ? GOOD : BAD, opacity: 0.75 });
    sub(360, 370, '보내기 전에 골라 내는 것이 기본', fade(u, 2.2), { 'font-weight': 700, fill: INK }); }

  const quiz = [
    { q: '로컬 TSDB 만으로 부족한 이유로 이 장에서 든 것은 무엇인가?',
      o: ['원격 저장소보다 질의가 느려서', '수주가 한계이고 노드와 함께 사라져서', '15d를 넘기는 설정이 아예 없어서'], a: 1,
      why: '기본 보관은 15d이고 늘려도 디스크·성능이 막는다. 단일 노드라 노드가 죽으면 그 기간 지표도 같이 없어진다.' },
    { q: 'remote_write를 켜면 로컬 TSDB 저장은 어떻게 되는가?',
      o: ['그대로 두고 같은 샘플을 원격에도 보낸다', '원격으로 옮기고 로컬에서는 지운다', '원격이 성공한 샘플만 로컬에 남긴다'], a: 0,
      why: '두 곳에 동시에 쓴다. 그래서 최근 데이터 조회는 로컬이 빠르게 답하고 장기 보관은 원격이 맡는다.' },
    { q: '원격이 느려 샤드 큐가 capacity 10000까지 찼을 때 Prometheus는 무엇을 하는가?',
      o: ['넘친 샘플을 바로 버린다', 'remote_write를 잠시 끈다', 'WAL 읽기를 멈추고 기다린다'], a: 2,
      why: '큐가 가득 차면 WAL에서 더 읽지 않는다. 원격이 2시간 넘게 막혀 WAL이 정리되면 그때 못 보낸 샘플이 사라진다.' },
    { q: 'Prometheus의 remote_write 백엔드를 Mimir에서 VictoriaMetrics로 바꿀 때 주로 고치는 것은 무엇인가?',
      o: ['스크랩 설정 전체', 'remote_write의 url', 'TSDB 블록 크기'], a: 1,
      why: '대부분의 백엔드가 표준 remote_write 프로토콜을 받는다. vminsert 경로처럼 url만 바뀌고 설정 방식은 같다.' },
    { q: 'remote_read에 read_recent: false를 두는 까닭은 무엇인가?',
      o: ['원격 인증을 건너뛰려고', '과거 구간을 로컬에서 지우려고', '로컬에 있는 최근 구간은 원격에 묻지 않으려고'], a: 2,
      why: '최근 구간은 로컬 TSDB가 완전한 데이터를 갖고 있다. 원격에는 로컬에 없는 과거 구간만 묻는다.' },
  ];

  const summary = [
    '로컬 TSDB 보관은 기본 15d이고 늘려도 수주가 한계다. 노드가 죽으면 그 기간 지표도 같이 사라진다.',
    'remote_write는 로컬에 쓰는 샘플을 원격에도 보낸다. url 하나로 시작하고 인증과 테넌트 헤더를 붙인다.',
    'WAL을 읽어 샤드 큐에 쌓고 병렬로 보낸다. 실패는 30ms에서 5s까지 늘려 가며 다시 보낸다.',
    '원격이 2시간 넘게 막히면 못 보낸 샘플은 사라진다. go_* 같은 불필요한 지표는 보내기 전에 거른다.',
  ];
  const review = [
    { q: '원격 Mimir가 2시간보다 길게 점검을 했더니 그 구간 지표가 원격에 비어 있다. 가장 알맞은 설명은?',
      o: ['capacity가 10000이라 넘친 샘플을 버렸다', 'WAL은 약 2시간만 남아 그 뒤 못 보낸 샘플이 사라졌다', 'read_recent가 false라 안 보인다'], a: 1,
      why: '큐가 차면 Prometheus는 기다릴 뿐 버리지 않는다. 다만 2시간이 지나 WAL이 정리되면 보내지 못한 샘플은 남지 않는다.' },
    { q: 'remote_write를 붙인 뒤 원격 요금이 예상보다 크게 나온다. 먼저 손볼 곳은?',
      o: ['write_relabel_configs로 go_*·process_* 같은 지표 걸러 내기', 'min_backoff를 늘리기', 'retention.time을 줄이기'], a: 0,
      why: '요금은 보내는 샘플 수에 비례한다. 필요 없는 지표를 원격 전송에서 떨어뜨리면 로컬은 그대로 두고 비용만 준다.' },
    { q: 'remote_write 응답이 계속 401이고 prometheus_remote_storage_samples_pending이 쌓인다. 무엇부터 확인하는가?',
      o: ['max_shards를 200으로 올린다', 'scrape_interval을 늘린다', 'basic_auth와 X-Scope-OrgID 헤더 설정'], a: 2,
      why: '401/403은 인증·헤더 누락에서 온다. 샤드를 늘려도 전부 거부되므로 먼저 인증을 고쳐야 큐가 빠진다.' },
  ];

  R.page({ title: 'remote_write — 외부 장기 저장', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
