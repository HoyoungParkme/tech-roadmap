/* III-2-2 Replication — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, lock, clock, terminal, cells, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const tone = (s) => (s === 'emerald' || s === 'good' ? GOOD : s === 'amber' || s === 'warn' ? WARN : s === 'rose' || s === 'danger' ? BAD : INK);

  // 노드: 서버 그림(0.72배) + 아래 이름표 (이름표는 배율 밖에서 그려 15px 유지)
  function node(cx, cy, name, o) { o = o || {}; const s = o.s ?? 1;
    server(cx, cy, null, { s: 0.72 * s, stroke: o.stroke, lamp: o.lamp, op: o.op });
    if (name && s > 0.3) mono(cx, cy + 52, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.stroke || INK, opacity: (o.op ?? 1) * clamp(s) });
    if (o.tag && s > 0.3) pill(cx, cy - 46, o.tag, o.tagCol || ACC, clamp(s), { fs: 13.5 }); }

  // =====================================================================
  // 1. replicaof — 왼쪽 토폴로지, 오른쪽 터미널
  const P1 = [110, 200], RR = [[380, 104], [380, 300]];
  function s1(t, c) { const { k, u } = c;
    const repS = k === 1 ? (i) => pop(u, 0.2 + i * 0.3) : () => (k >= 1 ? 1 : 0);
    // 링크
    RR.forEach(([x, y], i) => { const s = repS(i); if (s <= 0) return;
      const up = k >= 4, col = up ? GOOD : k === 5 ? GOOD : MUT;
      grow(P1[0] + 44, P1[1] + (i ? 16 : -16), x - 46, y, k === 1 ? E(u, 0.3 + i * 0.3, 0.8 + i * 0.3) : 1, col, { plain: true, sw: 2.5 });
      if (k === 3) mono((P1[0] + x) / 2 + 30, (P1[1] + y) / 2 + (i ? 18 : -8), 'lag ' + i, { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.4 + i * 0.2) });
      if (k === 4) mono((P1[0] + x) / 2 + 30, (P1[1] + y) / 2 + (i ? 18 : -8), 'up', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0 + i * 0.2) }); });
    node(P1[0], P1[1], 'primary :6379', { s: k === 0 ? pop(u, 0.2) : 1, stroke: ACC, lamp: ACC, tag: k >= 3 ? 'role:master' : null });
    RR.forEach(([x, y], i) => node(x, y, `replica${i + 1} :${6380 + i}`, { s: repS(i), lamp: GOOD, tag: k === 4 ? 'role:slave' : null, tagCol: INFO }));
    if (k === 0) sub(P1[0], P1[1] + 80, '복제 설정 없음', fade(u, 0.8), { 'font-weight': 700 });
    if (k === 1) { [0, 1].forEach((i) => { const [x, y] = RR[i];
        fly(P1[0] + 40, P1[1], x - 40, y, seg(u, 0.9 + i * 0.3, 1.7 + i * 0.3), 'RDB 전체', { fill: INK });
        for (let j = 0; j < 3; j++) if (u > 2.0) dot([[P1[0] + 44, P1[1] + (i ? 16 : -16)], [x - 46, y]], (t * 0.9 + j / 3) % 1, ACC, 5); }); }
    if (k >= 2 && k <= 3) RR.forEach(([x, y], i) => lock(x + 56, y - 24, true, MUT, k === 2 ? pop(u, 0.9 + i * 0.2) : 0.9));
    if (k === 2) { el('path', { d: `M${RR[0][0] - 60},${RR[0][1] - 30} Q${P1[0] + 40},${RR[0][1] - 40} ${P1[0] + 10},${P1[1] - 66}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.8) });
      tx(200, 60, 'NO ONE → primary 승격', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) }); }

    const T = { x: 520, y: 40, w: 420, h: 300 }, lines = {
      0: ['$ docker run -d --name redis-primary \\', '    -p 6379:6379 redis:7'],
      1: ['$ docker run -d --name redis-replica1 \\', '    -p 6380:6379 redis:7 \\', '    redis-server --replicaof redis-primary 6379', '$ docker run -d --name redis-replica2 \\', '    -p 6381:6379 redis:7 \\', '    redis-server --replicaof redis-primary 6379'],
      2: ['# redis.conf', 'replicaof redis-primary 6379', 'replica-read-only yes', '', '$ redis-cli REPLICAOF NO ONE', 'OK'],
      3: ['$ redis-cli INFO replication', 'role:master', 'connected_slaves:2', 'slave0:...offset=1234,lag=0', 'slave1:...offset=1234,lag=1'],
      4: ['$ redis-cli INFO replication', 'role:slave', 'master_host:redis-primary', 'master_link_status:up', 'master_last_io_seconds_ago:0'],
      5: ['$ redis-cli -h primary SET foo bar', 'OK', '$ redis-cli -h replica GET foo', '"bar"', '$ redis-cli -h replica SET k v', '(error) READONLY'],
    }[k];
    terminal(T.x, T.y, T.w, T.h, lines, lerp(0, lines.length, E(u, 0.2, 2.0)), { fs: 13.5 });
    if (k === 1) pill(380, 400, 'connected_slaves:2', GOOD, pop(u, 2.2), { mono: true, fs: 13.5 });
    if (k === 5) { dot([[P1[0] - 90, P1[1]], [P1[0] - 50, P1[1]]], seg(u, 0.2, 0.6), ACC, 7);
      dot([[RR[0][0] + 110, RR[0][1]], [RR[0][0] + 50, RR[0][1]]], seg(u, 0.9, 1.3), GOOD, 7);
      if (u > 1.3) pill(RR[0][0], RR[0][1] - 52, 'GET foo → "bar"', GOOD, pop(u, 1.3), { mono: true, fs: 13.5 });
      if (u > 1.8) { pill(RR[1][0], RR[1][1] - 52, 'SET → READONLY', BAD, pop(u, 1.8), { mono: true, fs: 13.5 }); cross(RR[1][0] + 100, RR[1][1] - 52, 8, pop(u, 1.9)); } } }

  // =====================================================================
  // 2. 비동기 복제 — replica 별 lag 자 (0 ~ 35초)
  const LX0 = 330, LX1 = 900, lx = (s) => lerp(LX0, LX1, Math.min(s, 35) / 35);
  function lagRows(c, y0, o) { o = o || {}; const rows = c.beat.viz.rows, pr = c.prev && c.prev.viz.rows, same = pr && pr.length === rows.length, rh = o.rh || 44;
    const ay = y0 + (rows.length - 1) * rh + 30; [0, 10, 20, 30].forEach((s) => mono(lx(s), ay, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }));
    rows.forEach((r, i) => { const y = y0 + i * rh, lag = same ? tween(pr[i].lag, r.lag, c.u) : r.lag * E(c.u, 0.2 + i * 0.2, 1.0 + i * 0.2), col = o.col ? o.col(r, lag) : tone(r.color), op = o.op ?? 1;
      mono(LX0 - 16, y + 6, r.node, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
      el('line', { x1: LX0, y1: y, x2: LX1, y2: y, stroke: GRID, 'stroke-width': 3, opacity: op });
      el('line', { x1: LX0, y1: y, x2: lx(lag), y2: y, stroke: col, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: op });
      el('circle', { cx: lx(lag), cy: y, r: 8, fill: col, opacity: op });
      mono(lx(lag) + 14, y - 10, 'lag=' + Math.round(lag), { 'font-size': 14, 'font-weight': 800, fill: col, opacity: op }); }); }
  function threshold(s, label, col, op, y0, y1) { el('line', { x1: lx(s), y1: y0, x2: lx(s), y2: y1, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: op });
    tx(lx(s), y1 + 20, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, opacity: op }); }

  function s2(t, c) { const { k, u } = c;
    if (k === 0) { tx(40, 50, 'primary 에서 INFO replication', { 'font-size': 15, 'font-weight': 800 }); lagRows(c, 120, { rh: 70 });
      sub(lx(15), 330, '15초 뒤처짐 = 이미 문제', fade(u, 1.6), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 1) { tx(40, 50, 'replica 쪽에서 보면', { 'font-size': 15, 'font-weight': 800 }); lagRows(c, 110, { rh: 50, op: 0.35 });
      meters(40, 290, 880, [{ name: 'master_link_status', val: 'up', good: true }, { name: 'master_last_io_seconds_ago', val: '0', good: true }, { name: 'master_sync_in_progress', val: '0' }].map((m, i) => ({ ...m, val: u > 0.4 + i * 0.4 ? m.val : '' })), { h: 74 });
      return; }
    if (k === 2) { tx(40, 46, 'lag 이 생기는 이유', { 'font-size': 15, 'font-weight': 800 }); lagRows(c, 100, { rh: 66 });
      [['—', 1], ['AOF fsync 부하', 2], ['쓰기 burst · backlog 부족', 3], ['cross-region 10~100ms', 4]].forEach(([s, i]) => { if (i === 1) return;
        tx(LX0 + 4, 100 + (i - 1) * 66 - 14, s, { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: fade(u, 1.0 + i * 0.25) }); });
      return; }
    if (k === 3) { // backlog + PSYNC
      tx(40, 46, 'primary 의 replication backlog (원형 버퍼, 기본 1MB)', { 'font-size': 15, 'font-weight': 800 });
      const bx = 60, bw = 840, n = 12, cw = bw / n;
      for (let i = 0; i < n; i++) { const kept = i >= 4; el('rect', { x: bx + i * cw + 2, y: 70, width: cw - 4, height: 40, rx: 4, fill: kept ? ACCBG : SOFT, stroke: kept ? ACC : GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1 + i * 0.03) }); }
      mono(bx, 132, '밀려난 구간', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) }); mono(bx + 4 * cw, 132, '← backlog 에 남은 구간 →', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(bx + bw, 132, 'master offset', { 'font-size': 13.5, fill: INK, 'text-anchor': 'end', opacity: fade(u, 0.5) });
      // A: offset 이 backlog 안
      const ax = bx + 7 * cw; el('line', { x1: ax, y1: 62, x2: ax, y2: 118, stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.7) });
      card(220, 220, 340, 86, { rx: 10, stroke: GOOD, s: pop(u, 0.7) });
      mono(70, 204, 'PSYNC <replid> <offset>', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.9) });
      mono(70, 234, '+CONTINUE', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) }); tx(180, 234, '빠진 부분만 보낸다', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.2) });
      grow(ax, 120, 260, 176, E(u, 0.8, 1.2), GOOD, { dash: '5 4' });
      // B: offset 이 밀려남
      const bxx = bx + 2 * cw; el('line', { x1: bxx, y1: 62, x2: bxx, y2: 118, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.5) });
      card(700, 220, 380, 86, { rx: 10, stroke: BAD, s: pop(u, 1.5) });
      mono(530, 204, 'PSYNC <replid> <offset>', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.7) });
      mono(530, 234, '+FULLRESYNC', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) }); tx(660, 234, 'RDB 전체를 다시', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
      grow(bxx, 120, 640, 176, E(u, 1.6, 2.0), BAD, { dash: '5 4' });
      pill(480, 330, 'repl-backlog-size 1mb (기본값)', ACC, pop(u, 2.2), { mono: true, fs: 14 });
      sub(480, 372, '쓰기 burst 가 backlog 를 넘기면 짧은 끊김도 전체 동기화가 된다', fade(u, 2.4), { 'font-size': 14 }); return; }
    if (k === 4) { // WAIT
      terminal(30, 30, 420, 150, ['127.0.0.1:6379> SET key value', 'OK', '127.0.0.1:6379> WAIT 2 100', '(integer) 2'], u < 2.0 ? lerp(0, 3, E(u, 0.1, 0.9)) : 4, { fs: 14 });
      clock(520, 100, 34, E(u, 0.9, 2.0) * 0.6, WARN, '100ms');
      lagRows(c, 250, { rh: 42 });
      [0, 1].forEach((i) => { if (u > 1.2 + i * 0.3) check(LX0 - 160, 250 + i * 42, 9, pop(u, 1.2 + i * 0.3)); });
      tx(600, 110, '반환 = 복제된 replica 수', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { lagRows(c, 70, { rh: 52, col: (r, lag) => (lag >= 10 ? BAD : GOOD) });
      threshold(10, 'max-lag 10s', WARN, fade(u, 0.6), 50, 262);
      terminal(30, 296, 560, 112, ['min-replicas-to-write 1', 'min-replicas-max-lag 10', '127.0.0.1:6379> SET k v', '(error) NOREPLICAS Not enough good replicas'], lerp(0, 4, E(u, 1.0, 2.4)), { fs: 13.5, lh: 18 });
      pill(780, 340, '쓰기 거부', BAD, pop(u, 2.3), { fs: 15 }); return; }
    // 6. 알람 임계치
    lagRows(c, 80, { rh: 60, col: (r, lag) => (lag > 30 ? BAD : lag > 5 ? WARN : GOOD) });
    threshold(5, '> 5s 경고', WARN, fade(u, 0.4), 60, 300); threshold(30, '> 30s 위급', BAD, fade(u, 0.8), 60, 300);
    pill(480, 370, 'replica down → 즉시 alert', BAD, pop(u, 1.6), { fs: 14.5 }); }

  // =====================================================================
  // 3. Sentinel — 아래 데이터 노드, 위 오른쪽 Sentinel 3대
  const NP = [[170, 300], [480, 300], [790, 300]], SP = [[560, 70], [700, 70], [840, 70]];
  function sentinel(cx, cy, s, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s);
    el('circle', { cx: 0, cy: 0, r: 26, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-15,0 Q0,-12 15,0 Q0,12 -15,0 Z', fill: PANEL, stroke: o.stroke || INFO, 'stroke-width': 2 }, g); el('circle', { cx: 0, cy: 0, r: 4.5, fill: o.stroke || INFO }, g);
    if (o.name) tx(0, 46, o.name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INFO }, g); }
  function s3(t, c) { const { k, u } = c, nodes = c.beat.viz.nodes, nS = c.beat.viz.sentinels, pS = c.prev ? c.prev.viz.sentinels : 0;
    const pDown = k >= 2, prom = k >= 3, rewire = k === 3 ? E(u, 1.2, 1.9) : k > 3 ? 1 : 0;
    // 복제 링크
    [1, 2].forEach((i) => { const from = i === 2 && rewire > 0 ? NP[1] : NP[0];
      if (!(prom && i === 1)) el('line', { x1: from[0] + 46, y1: NP[i][1] - 6, x2: NP[i][0] - 46, y2: NP[i][1] - 6, stroke: pDown && from === NP[0] ? OFF : GOOD, 'stroke-width': 2.5, 'stroke-dasharray': pDown && from === NP[0] ? '5 5' : null }); });
    if (rewire > 0) el('path', { d: `M${NP[1][0] + 40},${NP[1][1] + 72} Q${(NP[1][0] + NP[2][0]) / 2},${NP[1][1] + 118} ${lerp(NP[1][0] + 40, NP[2][0] - 40, rewire)},${NP[2][1] + 72}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
    nodes.forEach((n, i) => { const [x, y] = NP[i], down = n.status === 'down', isP = n.role === 'primary' && !down;
      const dying = k === 2 && i === 0 ? fade(u, 0.2) : down ? 1 : 0;
      node(x, y, n.label.replace(' (master_for)', '').replace(' (slave_for)', ''), { stroke: dying > 0.5 ? OFF : isP ? ACC : INK, lamp: dying > 0.5 ? OFF : isP ? ACC : GOOD, tag: n.promoted ? (k === 3 && u < 1.0 ? null : 'primary') : i === 0 && !down ? 'primary' : null });
      if (dying > 0) cross(x, y, 20, k === 2 ? pop(u, 0.2) : 1); });
    if (k === 3) pill(NP[1][0], NP[1][1] - 92, 'REPLICAOF NO ONE', ACC, pop(u, 0.3), { mono: true, fs: 13.5 });
    // Sentinel
    for (let i = 0; i < 3; i++) { const on = i < nS, fresh = i >= pS && on, s = !on ? 0 : fresh ? pop(u, 0.3 + (i - pS) * 0.3) : 1;
      sentinel(SP[i][0], SP[i][1], s, { name: 's' + (i + 1), stroke: k >= 2 && i === 0 && u > 1.9 ? ACC : INFO }); }
    if (nS === 3 && k === 1) { for (let i = 0; i < 3; i++) { const a = SP[i], b = SP[(i + 1) % 3]; if (i === 2) continue; grow(a[0] + 28, a[1], b[0] - 28, b[1], E(u, 1.0 + i * 0.2, 1.4 + i * 0.2), INFO, { plain: true, dash: '4 4' }); }
      sub(700, 150, '홀수 3대 — 다수결이 갈리지 않는다', fade(u, 1.6), { 'font-weight': 700, fill: INFO, 'font-size': 14.5 }); }
    // PING
    if (k <= 1) { for (let i = 0; i < nS; i++) dot([[SP[i][0] - 20, SP[i][1] + 20], [NP[0][0] + 30, NP[0][1] - 40]], (t * 0.8 + i * 0.3) % 1, INFO, 5); }
    if (k === 0) { pill(200, 60, 'sentinel monitor mymaster 10.0.0.1 6379 2', INFO, pop(u, 0.4), { mono: true, fs: 13.5 });
      pill(200, 110, 'down-after-milliseconds 5000', WARN, pop(u, 0.8), { mono: true, fs: 13.5 });
      sub(200, 150, '1초마다 PING · 5초 무응답 → 의심', fade(u, 1.2), { 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 1) pill(200, 70, 'quorum 2 / Sentinel 3', INFO, pop(u, 0.2), { fs: 15 });
    if (k === 2) { for (let i = 0; i < 3; i++) if (u > 0.5 + i * 0.3) pill(SP[i][0], SP[i][1] + 62, 'sdown', WARN, pop(u, 0.5 + i * 0.3), { mono: true, fs: 13.5 });
      if (u > 1.4) banner(240, 80, 'quorum 2 동의 → odown', pop(u, 1.4));
      if (u > 1.9) { pill(SP[0][0], SP[0][1] - 44, '리더', ACC, pop(u, 1.9), { fs: 13.5 }); } }
    if (k === 3) sub(740, 176, '나머지 replica 는 새 primary 를 따른다', fade(u, 1.9), { 'font-weight': 700, fill: ACC, 'font-size': 14.5 });
    if (k === 4) { card(150, 80, 230, 54, { rx: 10, stroke: INK, text: 'app (redis-py)', fs: 15, s: pop(u, 0.2) });
      mono(150, 140, '10.0.0.1:6379', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 0.3) });
      fly(270, 80, SP[0][0] - 30, SP[0][1], seg(u, 0.5, 1.2), 'master_for("mymaster")', { mono: true, fill: INFO });
      fly(SP[0][0] - 30, SP[0][1] + 20, 270, 100, seg(u, 1.3, 1.9), 'replica1', { mono: true, fill: ACC });
      grow(180, 110, NP[1][0] - 20, NP[1][1] - 60, E(u, 2.0, 2.5), ACC); }
    if (k === 5) terminal(30, 24, 470, 160, ['$ redis-cli -p 26379 SENTINEL primaries', ['name=mymaster  → replica1', 'var(--term)'], '$ redis-cli -p 26379 SENTINEL replicas mymaster', '$ redis-cli -p 26379 SENTINEL failover mymaster'], lerp(0, 4, E(u, 0.2, 2.0)), { fs: 13.5 }); }

  // =====================================================================
  // 4. 모니터링 — 위: 수집 파이프라인, 아래: INFO 지표
  function metricsPanel(c, y0) { const ms = c.beat.viz.metrics, pm = c.prev && c.prev.viz.metrics;
    el('rect', { x: 30, y: y0, width: 900, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    ms.forEach((m, i) => { const col = i % 2, row = Math.floor(i / 2), x = 50 + col * 450, y = y0 + 34 + row * 42, pv = pm && pm[i].value, changed = pv != null && pv !== m.value;
      const tc = m.tone === 'danger' ? BAD : m.tone === 'warn' ? WARN : GOOD;
      mono(x, y, m.name, { 'font-size': 13.5, fill: MUT });
      let v = m.value; const nv = parseFloat(v), npv = pv != null ? parseFloat(pv) : NaN;
      if (changed && !isNaN(nv) && !isNaN(npv) && /^\d+$/.test(String(v).split(' ')[0])) v = String(Math.round(tween(npv, nv, c.u))) + String(v).slice(String(nv).length);
      if (changed) el('rect', { x: x + 238, y: y - 17, width: tw(m.value, 14) + 12, height: 24, rx: 4, fill: C.HL, opacity: 1 - seg(c.u, 1.6, 2.6) });
      mono(x + 244, y, v, { 'font-size': 14, 'font-weight': 800, fill: tc }); }); }
  function box(cx, cy, w, h, title, sub2, o) { o = o || {}; card(cx, cy, w, h, { rx: 10, stroke: o.stroke || INK, s: o.s, fill: o.fill });
    if ((o.s ?? 1) > 0.3) { tx(cx, cy - (sub2 ? 4 : -6), title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.stroke || INK, opacity: clamp(o.s ?? 1) });
      if (sub2) mono(cx, cy + 18, sub2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: clamp(o.s ?? 1) }); } }
  function s4(t, c) { const { k, u } = c;
    const pDown = k === 5;
    box(100, 70, 150, 56, 'redis-primary', ':6379', { s: k === 0 ? pop(u, 0.2) : 1, stroke: pDown ? BAD : ACC });
    box(100, 170, 150, 56, 'redis-replica', 'replicaof', { s: k === 0 ? pop(u, 0.5) : 1 });
    grow(100, 98, 100, 140, k === 0 ? E(u, 0.8, 1.2) : 1, pDown ? OFF : GOOD);
    if (pDown) cross(166, 50, 9, pop(u, 0.2));
    const ex = k >= 1, pr = k >= 2;
    if (ex) { box(330, 120, 170, 64, 'redis_exporter', ':9121', { s: k === 1 ? pop(u, 0.2) : 1, stroke: INFO });
      grow(176, 70, 244, 108, k === 1 ? E(u, 0.5, 0.9) : 1, INFO); }
    if (k === 1) { mono(330, 184, 'INFO → 메트릭', { 'text-anchor': 'middle', 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) }); }
    if (pr) { box(560, 120, 160, 64, 'prometheus', k >= 3 ? 'job: redis' : '수집·저장', { s: k === 2 ? pop(u, 0.2) : 1, stroke: WARN }); }
    if (pr) { const gs = k === 2 ? pop(u, 0.5) : 1; card(820, 120, 220, 140, { rx: 10, stroke: INK, s: gs });
      if (gs > 0.3) { tx(720, 72, 'grafana', { 'font-size': 14.5, 'font-weight': 800 });
        const gx = 722, gy = 86, gw = 196, gh = 90; el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: GRID, 'stroke-width': 1.5 });
        if (k === 4) { el('line', { x1: gx, y1: gy + 38, x2: gx + gw, y2: gy + 38, stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }); mono(gx + gw, gy + 32, '1MB', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end' }); }
        const p = k >= 4 ? E(u, 0.2, 1.8) : 1, pts = [];
        for (let i = 0; i <= 20; i++) { if (i / 20 > p) break; const x = gx + i * gw / 20;
          const y = k === 4 ? gy + gh - 8 - (i > 8 ? Math.min(70, (i - 8) * 9) : 4 + (i % 3) * 2) : k === 5 ? (i < 10 ? gy + 20 : gy + gh - 4) : gy + gh - 8 - (i % 3) * 2;
          pts.push(`${x},${y}`); }
        if (pts.length > 1) el('polyline', { points: pts.join(' '), fill: 'none', stroke: k === 4 ? WARN : k === 5 ? BAD : GOOD, 'stroke-width': 2.5 });
        if (k === 4 && u > 1.6) { el('rect', { x: gx + gw * 0.6, y: gy, width: gw * 0.4, height: gh, fill: BAD, opacity: 0.12 }); mono(gx + gw * 0.8, gy + gh - 10, 'for: 1m', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: BAD }); }
        if (k === 5) mono(gx + 4, gy + 14, 'redis_up', { 'font-size': 13.5, fill: MUT }); }
      grow(640, 120, 706, 120, k === 2 ? E(u, 0.8, 1.2) : 1, MUT); }
    if (k >= 3) { grow(474, 132, 418, 132, 1, WARN, { plain: true }); for (let i = 0; i < 3; i++) dot([[415, 108], [478, 108]], (t * 0.7 + i / 3) % 1, WARN, 5);
      if (k === 3) pill(450, 216, 'targets: ["redis_exporter_primary:9121"]', WARN, pop(u, 0.3), { mono: true, fs: 13.5 }); }
    if (k === 4) pill(470, 216, 'RedisReplicaLagHigh · FIRING', BAD, pop(u, 2.0), { mono: true, fs: 14 });
    if (k === 5) pill(470, 216, 'RedisPrimaryDown · for 30s · FIRING', BAD, pop(u, 1.8), { mono: true, fs: 14 });
    metricsPanel(c, 250); }

  // =====================================================================
  // 5. 읽기 분산 — app 에서 노드 4대로
  const NY = [70, 170, 265, 360], NX = 560;
  function s5(t, c) { const { k, u } = c, st = c.beat.viz.stats, ps = c.prev && c.prev.viz.stats;
    const names = ['primary', 'replica1', 'replica2', 'replica3'];
    card(120, 215, 170, 70, { rx: 10, stroke: INK, s: k === 0 ? pop(u, 0.1) : 1 }); tx(120, 210, 'app', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    mono(120, 232, 'redis-py', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    names.forEach((n, i) => { const s = k === 0 ? pop(u, 0.3 + i * 0.2) : 1, isP = i === 0;
      card(NX, NY[i], 170, 56, { rx: 10, stroke: isP ? ACC : INK, fill: isP ? ACCBG : null, s, sw: 2.2 });
      if (s > 0.3) mono(NX, NY[i] + 6, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: isP ? ACC : INK });
      el('line', { x1: 205, y1: 215, x2: NX - 85, y2: NY[i], stroke: GRID, 'stroke-width': 2, opacity: clamp(s) });
      // 부하 막대
      const cur = isP ? st.primary : st.replicas[i - 1], prv = ps ? (isP ? ps.primary : ps.replicas[i - 1]) : null;
      const reads = tween(prv ? prv.reads : 0, cur.reads, u), writes = isP ? cur.writes : 0, bx = NX + 100, sc = 220 / 1000;
      if (isP) { el('rect', { x: bx, y: NY[i] - 22, width: Math.max(2, writes * sc), height: 16, rx: 3, fill: WARN, opacity: clamp(s) });
        mono(bx + writes * sc + 8, NY[i] - 9, 'W ' + writes, { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: clamp(s) }); }
      el('rect', { x: bx, y: NY[i] + (isP ? 2 : -8), width: Math.max(2, reads * sc), height: 16, rx: 3, fill: INFO, opacity: clamp(s) });
      mono(bx + reads * sc + 8, NY[i] + (isP ? 15 : 5), 'R ' + Math.round(reads), { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: clamp(s) });
      if (!isP && cur.lag) mono(NX, NY[i] + 44, 'lag ' + cur.lag, { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700 }); });
    const route = (i) => [[205, 215], [NX - 85, NY[i]]];
    if (k === 0) sub(120, 290, 'primary 1 + replicas 3', fade(u, 1.2), { 'font-weight': 700, 'font-size': 14.5 });
    if (k === 1) { for (let j = 0; j < 4; j++) dot(route(0), seg(u, 0.2 + j * 0.3, 0.9 + j * 0.3), WARN, 6);
      pill(120, 140, 'write() → primary.set', WARN, pop(u, 0.3), { mono: true, fs: 13.5 });
      grow(205, 230, NX - 100, NY[1] + 4, E(u, 1.4, 1.9), BAD, { dash: '5 4' }); if (u > 1.9) pill(380, 140 + 26, 'READONLY', BAD, pop(u, 1.9), { mono: true, fs: 13.5 }); }
    if (k === 2 || k === 5 || k === 4) { for (let j = 0; j < 9; j++) { const i = 1 + (j % 3); dot(route(i), (t * 0.7 + j / 9) % 1, INFO, 5); } }
    if (k === 2) pill(120, 140, 'random.choice(replicas).get', INFO, pop(u, 0.3), { mono: true, fs: 13.5 });
    if (k === 3) { card(120, 70, 170, 50, { rx: 10, stroke: INFO, text: 'Sentinel', fs: 15, color: INFO, s: pop(u, 0.2) });
      grow(120, 98, 120, 176, E(u, 0.4, 0.8), INFO);
      pill(NX - 170, NY[0] - 30, 'foo = "bar"', ACC, pop(u, 1.0), { mono: true, fs: 13.5 });
      dot(route(2), seg(u, 1.2, 1.8), INFO, 7);
      fly(NX - 90, NY[2], 210, 250, seg(u, 1.8, 2.5), 'GET foo → (nil)', { mono: true, fill: WARN });
      if (u > 2.4) sub(120, 300, '아직 안 넘어온 값', 1, { fill: WARN, 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 4) { [['쓰기 직후 · 잔고 · 락', 0, ACC], ['인기 글 · 검색 결과', 3, INFO]].forEach(([s, i, col], j) => {
        pill(120, 100 + j * 210, s, col, pop(u, 0.3 + j * 0.4), { fs: 14 }); dot([[120, 120 + j * 170], [NX - 85, NY[i]]], seg(u, 0.8 + j * 0.4, 1.6 + j * 0.4), col, 7); }); }
    if (k === 5) { const on = u < 1.4; card(120, 330, 210, 46, { rx: 23, stroke: on ? INFO : ACC, sw: 2.5 });
      mono(120, 336, 'eventually_consistent=' + (on ? 'True' : 'False'), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: on ? INFO : ACC });
      if (!on) dot(route(0), seg(u, 1.5, 2.2), ACC, 8); } }

  R.page({ title: '복제 시뮬레이션', scenes: [s1, s2, s3, s4, s5] });
})();
