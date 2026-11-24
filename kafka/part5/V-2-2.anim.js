/* V-2-2 실전 체크리스트 (운영 출항 점검표) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 아래 48칸 점검판은 beat 의 accumulated(누적 통과 수)를 앞 beat 값에서 이어 채운다. 위쪽은 그 beat 의 설정이 Kafka 안에서 하는 일을 그린다.
 * 그래프의 시계열 값은 알람 규칙(for: 5m · 1m · 2m · 10m)을 보여 주려고 만든 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, lock, clock, meters, terminal, snippet, axes, line, hbar, person } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const mid = (x, y, s, op, a) => note(x, y, s, op, Object.assign({ 'text-anchor': 'middle' }, a || {}));
  const AX = [['Reliability', BAD], ['Throughput', WARN], ['Observability', INFO], ['Security', ACC]];

  // 48칸 점검판 (4축 × 12)
  function board(c, o) { o = o || {}; const b = c.beat, p = c.prev, n = tween(p ? p.accumulated : Math.floor((b.accumulated - 1) / 12) * 12, b.accumulated, c.u, 1.0);
    const y = 392;
    AX.forEach(([name, col], g) => { const x0 = 32 + g * 232;
      const got = clamp(n - g * 12, 0, 12);
      tx(x0, y - 10, `${name} ${Math.round(got)}/12`, { 'font-size': 13.5, 'font-weight': 700, fill: got > 0 ? col : OFF });
      for (let i = 0; i < 12; i++) { const f = clamp(got - i);
        el('rect', { x: x0 + i * 18, y, width: 16, height: 16, rx: 3, fill: f > 0 ? col : PANEL, stroke: f > 0 ? col : GRID, 'stroke-width': 1.5, opacity: f > 0 ? 0.35 + 0.65 * f : 1 }); } });
    mono(940, y - 10, `${Math.round(n)} / 48`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: n >= 48 ? GOOD : INK }); }

  // ---------- 1. Reliability ----------
  function s1(t, c) { const { k, u } = c; board(c);
    const BXs = [330, 520, 710], BY = 92;
    if (k === 0) {
      BXs.forEach((x, i) => { server(x, BY, null, { s: pop(u, 0.2 + i * 0.2) * 0.62, lamp: GOOD });
        tx(x, BY + 44, 'rack ' + 'abc'[i], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
        card(x, BY + 82, 84, 32, { rx: 8, text: i ? 'follower' : 'leader', fs: 13.5, fw: 800, fill: i ? PANEL : ACC, stroke: ACC, color: i ? ACC : PANEL, s: pop(u, 0.7 + i * 0.15) }); });
      el('path', { d: `M${BXs[0] - 60},${BY + 108} V${BY + 118} H${BXs[2] + 60} V${BY + 108}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, opacity: fade(u, 1.2) });
      mid(520, BY + 142, 'replication.factor=3 · ISR 최소 min.insync.replicas=2', fade(u, 1.2), { fill: GOOD });
      note(120, 290, 'unclean.leader.election.enable=false', fade(u, 1.8), { class: 'mono', 'font-size': 14 }); note(560, 290, 'ISR 밖 replica는 leader가 못 된다', fade(u, 1.8), { fill: MUT, 'font-weight': 500, 'font-size': 14 });
      note(120, 326, 'auto.create.topics.enable=false', fade(u, 2.2), { class: 'mono', 'font-size': 14 }); note(560, 326, '오타 토픽이 RF 1로 생기는 일을 막는다', fade(u, 2.2), { fill: MUT, 'font-weight': 500, 'font-size': 14 });
      return; }
    if (k === 1) { const P = [90, BY + 60];
      card(P[0], P[1], 120, 46, { rx: 10, text: 'producer', fs: 15, fw: 800 });
      BXs.forEach((x, i) => card(x, BY + 60, 100, 40, { rx: 8, text: i ? 'follower' : 'leader', fs: 14, fw: 800, fill: i ? PANEL : ACC, stroke: ACC, color: i ? ACC : PANEL }));
      fly(P[0] + 60, P[1], BXs[0] - 50, BY + 60, seg(u, 0.2, 0.7), 'seq 7', { mono: true });
      [1, 2].forEach((i) => dot([[BXs[0] + 50, BY + 60], [BXs[i] - 50, BY + 60]], seg(u, 0.7 + i * 0.15, 1.2 + i * 0.15), ACC, 6));
      dot([[BXs[0], BY + 82], [BXs[0], BY + 120], [P[0], BY + 120], [P[0], P[1] + 24]], seg(u, 1.5, 2.0), GOOD, 7);
      note(BXs[0] - 40, BY + 140, 'acks=all · ISR 모두 받은 뒤 성공', fade(u, 1.8), { fill: GOOD, 'font-size': 14 });
      card(220, 280, 220, 40, { rx: 8, text: '재시도한 seq 7', fs: 14, mono: false, stroke: WARN, s: pop(u, 2.0) });
      cross(350, 280, 10, pop(u, 2.2)); note(370, 285, 'enable.idempotence=true · PID+seq로 중복을 버린다', fade(u, 2.2), { 'font-size': 14 });
      note(220, 336, 'Kafka 3.0부터 acks=all과 idempotence=true가 기본값이지만 설정 파일에 적어 둔다', fade(u, 2.5), { fill: MUT, 'font-weight': 500, 'font-size': 13.5, 'text-anchor': 'start' });
      return; }
    if (k === 2) { const x0 = 220, w = 70;
      const row = (y, label, commitAt, crashFrom, col) => { note(40, y + 26, label, 1, { 'font-size': 14, fill: col });
        for (let i = 0; i < 8; i++) { const processed = i < 4, lost = crashFrom != null && i >= crashFrom && i < commitAt;
          card(x0 + i * w, y + 20, 60, 40, { rx: 6, text: String(i), fs: 14, mono: true, fw: 700, fill: lost ? BADBG : processed ? GOODBG : PANEL, stroke: lost ? BAD : processed ? GOOD : GRID, color: lost ? BAD : INK }); }
        const cx = x0 + (commitAt - 0.5) * w, a = E(u, 0.4, 1.2);
        el('line', { x1: cx, y1: y - 6, x2: cx, y2: lerp(y - 6, y + 46, a), stroke: col, 'stroke-width': 3 });
        tx(cx, y - 12, 'commit ' + commitAt, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: col, 'font-weight': 800, opacity: a }); };
      row(70, '자동 commit', 7, 4, BAD);
      row(200, '수동 commit', 4, null, GOOD);
      cross(x0 + 3.5 * w, 160, 12, pop(u, 1.4)); note(x0 + 3.5 * w + 20, 166, '처리 중 장애 → 4~6은 commit 됐는데 처리 안 됨', fade(u, 1.5), { fill: BAD, 'font-size': 14 });
      note(x0, 300, 'enable.auto.commit=false · 처리 끝난 뒤 commit', fade(u, 2.0), { fill: GOOD, 'font-size': 14 });
      note(x0, 330, '트랜잭션을 쓰면 isolation.level=read_committed', fade(u, 2.3), { fill: MUT, 'font-weight': 500, 'font-size': 14 }); return; }
    const steps = ['consume', 'process', 'produce', 'commit offsets'];
    el('rect', { x: 120, y: 120, width: lerp(0, 720, E(u, 0.2, 0.8)), height: 110, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': '8 5' });
    pill(480, 120, 'transactional.id = order-proc-1 (예시)', ACC, pop(u, 0.6), { mono: true, fs: 13.5, fill: PANEL });
    steps.forEach((s, i) => { card(200 + i * 186, 178, 150, 46, { rx: 10, text: s, fs: 14.5, mono: true, fw: 800, s: pop(u, 0.9 + i * 0.25) }); if (i) grow(200 + (i - 1) * 186 + 76, 178, 200 + i * 186 - 76, 178, E(u, 1.0 + i * 0.25, 1.3 + i * 0.25), MUT); });
    mid(480, 280, '넷이 함께 성공하거나 함께 취소된다 · exactly-once', fade(u, 2.0), { fill: ACC });
    mid(480, 316, 'RF=3 + min.insync=2 + acks=all + idempotence가 무손실의 기본 세트', fade(u, 2.4), { fill: MUT, 'font-weight': 500, 'font-size': 14 }); }

  // ---------- 2. Throughput ----------
  function s2(t, c) { const { k, u } = c; board(c);
    if (k === 0) { const fillN = Math.floor(lerp(0, 16, E(u, 0.2, 1.6)));
      card(160, 90, 160, 70, { rx: 10, stroke: GRID, s: 1 }); tx(160, 64, '전: 16KB · 바로 전송', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      for (let i = 0; i < 4; i++) el('rect', { x: 92 + i * 34, y: 78, width: 28, height: 24, rx: 4, fill: OFF });
      el('rect', { x: 330, y: 50, width: 340, height: 120, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2.4 });
      tx(500, 42, 'batch.size=65536 (64KB)', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', 'font-weight': 800, fill: ACC });
      for (let i = 0; i < fillN; i++) el('rect', { x: 346 + (i % 8) * 40, y: 66 + Math.floor(i / 8) * 46, width: 34, height: 38, rx: 5, fill: ACC, opacity: 0.8 });
      clock(720, 110, 24, E(u, 0.2, 1.6), WARN, 'linger.ms=10');
      const z = E(u, 1.8, 2.3); if (z > 0) { card(860, 110, lerp(120, 70, z), 50, { rx: 8, text: 'lz4', fs: 15, fw: 800, mono: true, stroke: GOOD, color: GOOD }); grow(780, 110, 815, 110, z, GOOD); }
      mid(480, 240, '최대 10ms 모아 한 요청으로 보낸다 · 요청 수가 줄어든다', fade(u, 1.7));
      mid(480, 276, '압축은 CPU를 조금 써서 네트워크와 디스크를 아낀다 · buffer.memory=64MB', fade(u, 2.2), { fill: MUT, 'font-weight': 500, 'font-size': 14 }); return; }
    if (k === 1) { const got = lerp(0, 16, E(u, 0.2, 1.6));
      el('rect', { x: 120, y: 80, width: 400, height: 50, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: 120, y: 80, width: 400 * got / 16, height: 50, rx: 8, fill: INFO, opacity: 0.75 });
      mono(320, 112, `${got.toFixed(0)}KB / fetch.min.bytes 16KB`, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: got > 8 ? PANEL : INK });
      clock(600, 105, 24, E(u, 0.2, 1.6) * 0.8, WARN, 'fetch.max.wait.ms=200');
      fly(560, 160, 820, 160, seg(u, 1.7, 2.3), '응답', { fill: INFO }); person(860, 140, 'consumer', {});
      mid(420, 240, '16KB가 모이거나 200ms가 지나면 응답한다 · poll 횟수가 준다', fade(u, 1.8));
      mid(420, 276, 'max.poll.records=500 · 그만큼을 max.poll.interval 안에 처리해야 한다', fade(u, 2.2), { fill: MUT, 'font-weight': 500, 'font-size': 14 }); return; }
    if (k === 2) { const lanes = (x, n, label, col, a) => { tx(x, 60, label, { 'font-size': 14, 'font-weight': 800, class: 'mono', fill: col, opacity: fade(u, a) });
        for (let i = 0; i < n; i++) el('rect', { x: x + i * (n > 8 ? 14 : 26), y: 74, width: n > 8 ? 10 : 20, height: 120 * E(u, a, a + 0.5), rx: 3, fill: col, opacity: 0.7 }); };
      lanes(80, 8, 'num.network.threads=8', INFO, 0.2); lanes(370, 16, 'num.io.threads=16', ACC, 0.6); lanes(680, 4, 'num.replica.fetchers=4', WARN, 1.0);
      for (let j = 0; j < 5; j++) dot([[90, 140], [580, 140]], ((t * 0.5 + j / 5) % 1) * (u > 1.2 ? 1 : 0), INK, 5);
      mid(480, 240, '코어 수에 맞추고, RequestHandlerAvgIdle이 떨어지면 io 스레드를 늘린다', fade(u, 1.6), { 'font-size': 14 });
      mid(480, 276, 'socket 버퍼 1MB · log.segment.bytes=1GB (기본값)', fade(u, 2.0), { fill: MUT, 'font-weight': 500, 'font-size': 14 }); return; }
    const A = [['t / p = 200 / 25', 8], ['t / c = 200 / 20', 10]];
    A.forEach(([s, v], i) => { const y = 70 + i * 50; mono(60, y + 14, s, { 'font-size': 15, 'font-weight': 700 }); hbar(250, y, 300, v, 10, { u: E(u, 0.2 + i * 0.4, 0.8 + i * 0.4), text: String(v), col: i ? ACC : OFF }); });
    for (let i = 0; i < 10; i++) card(660 + (i % 5) * 52, 80 + Math.floor(i / 5) * 46, 44, 38, { rx: 6, text: 'p' + i, fs: 13.5, mono: true, fw: 700, stroke: ACC, s: pop(u, 1.2 + i * 0.06) });
    mid(790, 190, 'max(8, 10) = 10 partitions', fade(u, 1.6), { class: 'mono', fill: ACC });
    el('rect', { x: 120, y: 236, width: 180, height: 40, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.9) });
    el('rect', { x: 300, y: 236, width: 540 * E(u, 2.0, 2.5), height: 40, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
    mid(210, 261, 'JVM heap 6~8GB', fade(u, 1.9), { 'font-size': 14 }); mid(570, 261, '나머지 메모리는 OS page cache', fade(u, 2.3), { 'font-size': 14, fill: INFO });
    mid(480, 320, '로그 읽기·쓰기는 page cache가 받아 준다', fade(u, 2.5), { fill: MUT, 'font-weight': 500, 'font-size': 14 }); }

  // ---------- 3. Observability ----------
  function series(x, y, w, h, pts, thr, forFrom, forTo, u, col, lab) {
    const ax = axes(x, y, w, h, { x: [0, 12], y: [0, lab.max], xt: [0, 6, 12], yt: [0, lab.max] });
    el('line', { x1: ax.X(0), y1: ax.Y(thr), x2: ax.X(12), y2: ax.Y(thr), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' });
    line(ax, pts, E(u, 0.2, 1.6), col);
    if (forFrom != null) { const a = E(u, 1.6, 2.0); el('rect', { x: ax.X(forFrom), y, width: (ax.X(forTo) - ax.X(forFrom)) * a, height: h, fill: BAD, opacity: 0.1 });
      if (a >= 1) pill(ax.X(forTo), y - 2, lab.fire, BAD, pop(u, 2.0), { fs: 13.5 }); }
    tx(x, y - 14, lab.name, { 'font-size': 14, 'font-weight': 800, class: 'mono' }); return ax; }
  function s3(t, c) { const { k, u } = c; board(c);
    if (k === 0) { const rows = [['ReplicaManager · UnderReplicatedPartitions', 'kafka_under_replicated_partitions'], ['KafkaController · ActiveControllerCount', 'kafka_active_controller_count'], ['KafkaController · OfflinePartitionsCount', 'kafka_offline_partitions_count']];
      tx(230, 52, 'broker JMX MBean', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: MUT }); tx(730, 52, 'Prometheus 메트릭', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: MUT });
      rows.forEach(([a, b], i) => { const y = 92 + i * 62, s = pop(u, 0.2 + i * 0.35); card(230, y, 400, 44, { rx: 8, text: a, fs: 13.5, fw: 700, s });
        grow(436, y, 516, y, E(u, 0.5 + i * 0.35, 0.8 + i * 0.35), ACC); card(730, y, 400, 44, { rx: 8, text: b, fs: 13.5, mono: true, fw: 700, stroke: ACC, color: ACC, s: pop(u, 0.8 + i * 0.35) }); });
      mid(480, 310, 'jmx_prometheus_javaagent 규칙 · 수집이 없으면 알람도 없다', fade(u, 1.8)); return; }
    if (k === 1) { series(90, 70, 620, 220, [[0, 0], [2, 0], [2.5, 3], [3, 0], [6, 0], [6.5, 4], [12, 4]], 0.5, 6.5, 11.5, u, BAD,
        { max: 5, name: 'kafka_under_replicated_partitions  (분, 예시)', fire: 'critical · for 5m' });
      note(770, 130, '3분의 짧은 튐', fade(u, 1.4), { 'font-size': 14, fill: MUT }); note(770, 156, '→ 무시', fade(u, 1.4), { 'font-size': 14, fill: MUT });
      note(770, 230, '5분 넘게 > 0', fade(u, 2.0), { 'font-size': 14, fill: BAD }); note(770, 256, '→ 사람을 깨운다', fade(u, 2.0), { 'font-size': 14, fill: BAD }); return; }
    if (k === 2) { series(70, 80, 360, 190, [[0, 0], [5, 0], [5.5, 2], [12, 2]], 0.5, 5.5, 6.5, u, BAD, { max: 3, name: 'offline_partitions', fire: 'for 1m' });
      series(530, 80, 360, 190, [[0, 1], [7, 1], [7.5, 0], [12, 0]], 1, 7.5, 9.5, u, WARN, { max: 2, name: 'sum(active_controller)', fire: '!= 1 · for 2m' });
      mid(480, 330, 'leader 없는 partition은 이미 장애다 · controller는 정확히 1개', fade(u, 2.2), { fill: BAD, 'font-size': 14 }); return; }
    if (k === 3) { series(90, 70, 620, 220, [[0, 2000], [3, 12000], [4, 3000], [6, 4000], [8, 12000], [12, 16000]], 10000, 8, 12, u, WARN,
        { max: 20000, name: 'kafka_consumergroup_lag  (분, 예시)', fire: 'warning · for 10m' });
      note(770, 150, 'lag > 10000', fade(u, 0.6), { class: 'mono', 'font-size': 14, fill: BAD });
      note(770, 200, '배치성 튐은 넘긴다', fade(u, 1.6), { 'font-size': 14, fill: MUT }); note(770, 226, '추세를 본다', fade(u, 1.6), { 'font-size': 14, fill: MUT }); return; }
    if (k === 4) { meters(60, 70, 840, [{ name: 'URP', val: '0', good: true }, { name: 'Offline', val: '0', good: true }, { name: 'Controller', val: '1', good: true }], { h: 76 });
      meters(60, 170, 840, [{ name: 'handler idle', val: '> 30%', bar: 45 }, { name: 'disk 사용', val: '< 80%', bar: 62 }, { name: 'consumer lag', val: '추세', bar: 20 }], { h: 76 });
      mid(480, 300, '알람은 사고를 알리고, 대시보드는 원인을 알려 준다 (막대는 예시)', fade(u, 1.4)); return; }
    [['Grafana', 'broker · topic · group 대시보드', INFO], ['로그 중앙 수집', 'ELK 또는 Loki', ACC], ['SLI / SLO', 'p99 지연 · lag 목표', WARN]].forEach(([a, b, col], i) => { const x = 190 + i * 290, s = pop(u, 0.2 + i * 0.4);
      card(x, 150, 250, 110, { rx: 12, stroke: col, sw: 2.4, s }); if (s > 0.9) { tx(x, 140, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col }); tx(x, 170, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); } });
    mid(480, 270, 'JMX + lag exporter + 네 알람(URP · Offline · Controller · Lag)', fade(u, 1.8), { 'font-size': 14 }); }

  // ---------- 4. Security ----------
  function s4(t, c) { const { k, u } = c; board(c);
    if (k === 0) { server(480, 140, 'broker', {});
      pill(480, 46, 'listeners=SASL_SSL://:9093', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      pill(200, 46, 'PLAINTEXT', BAD, 1, { mono: true, fs: 13.5, op: 1 - E(u, 0.4, 0.8) * 0.5 }); cross(200, 46, 10, pop(u, 0.6));
      card(160, 230, 230, 56, { rx: 10, text: 'secret store', fs: 15, fw: 800, stroke: GOOD, s: pop(u, 1.0) });
      fly(275, 230, 430, 170, seg(u, 1.3, 2.0), '${KAFKA_KEYSTORE_PASS}', { fill: GOOD, mono: true });
      note(600, 230, '비밀번호는 파일에 박지 않고 주입한다', fade(u, 1.9), { 'font-size': 14 }); note(600, 256, '설정 파일은 git에 남는다', fade(u, 2.1), { 'font-size': 14, fill: MUT }); return; }
    if (k === 1) { card(220, 130, 180, 60, { rx: 10, text: 'client\n인증서', fs: 15, fw: 800, stroke: ACC, s: pop(u, 0.2) }); card(740, 130, 180, 60, { rx: 10, text: 'broker\n인증서', fs: 15, fw: 800, stroke: INFO, s: pop(u, 0.2) });
      grow(320, 116, 640, 116, E(u, 0.5, 1.0), INFO); grow(640, 146, 320, 146, E(u, 1.0, 1.5), ACC);
      mid(480, 106, '서버가 증명', fade(u, 0.8), { 'font-size': 13.5, fill: INFO }); mid(480, 172, '클라이언트도 증명 · ssl.client.auth=required', fade(u, 1.3), { 'font-size': 13.5, fill: ACC });
      [['TLS 1.1', false], ['TLS 1.2', true], ['TLS 1.3', true]].forEach(([s, ok], i) => { const x = 330 + i * 150; pill(x, 250, s, ok ? GOOD : BAD, pop(u, 1.6 + i * 0.15), { mono: true, fs: 14 }); if (!ok) cross(x, 250, 10, pop(u, 1.9)); });
      mid(480, 310, 'ssl.enabled.protocols=TLSv1.2,TLSv1.3', fade(u, 2.2), { class: 'mono', 'font-size': 14, fill: MUT }); return; }
    if (k === 2) { el('rect', { x: 400, y: 50, width: 160, height: 200, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.2) });
      mid(480, 150, 'SCRAM-SHA-512', fade(u, 0.3), { class: 'mono', fill: ACC, 'font-size': 14 });
      tx(120, 82, 'super.users', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.8) });
      card(200, 130, 200, 40, { rx: 8, text: 'User:admin', fs: 14, mono: true, fw: 800, stroke: GOOD, s: pop(u, 1.0) }); check(320, 130, 9, pop(u, 1.2));
      card(200, 190, 200, 40, { rx: 8, text: 'User:app-orders', fs: 14, mono: true, fw: 800, stroke: BAD, color: BAD, s: pop(u, 1.5) }); cross(320, 190, 9, pop(u, 1.7));
      note(620, 140, '애플리케이션 계정을 넣으면', fade(u, 1.9), { 'font-size': 14 }); note(620, 166, 'ACL 검사를 건너뛴다', fade(u, 2.1), { 'font-size': 14, fill: BAD }); return; }
    if (k === 3) { const P = [['User:app-orders', 120], ['User:app-billing', 230]];
      P.forEach(([s, y], i) => card(170, y, 220, 46, { rx: 10, text: s, fs: 14, mono: true, fw: 800, s: pop(u, 0.2 + i * 0.2) }));
      card(720, 120, 200, 46, { rx: 10, text: 'Topic orders', fs: 14, mono: true, fw: 800, stroke: ACC, s: pop(u, 0.5) });
      card(720, 230, 200, 46, { rx: 10, text: 'Group billing-group', fs: 14, mono: true, fw: 800, stroke: WARN, s: pop(u, 0.7) });
      grow(282, 120, 618, 120, E(u, 0.9, 1.3), ACC); mid(450, 110, '--producer (Write · Describe)', fade(u, 1.2), { 'font-size': 13.5, fill: ACC, class: 'mono' });
      grow(282, 222, 618, 130, E(u, 1.4, 1.8), ACC); grow(282, 236, 618, 230, E(u, 1.6, 2.0), WARN); mid(450, 262, '--consumer (Read · Describe + group Read)', fade(u, 1.9), { 'font-size': 13.5, fill: WARN, class: 'mono' });
      mid(480, 320, 'group 권한을 빼먹으면 남의 offset을 건드릴 여지가 생긴다', fade(u, 2.3), { 'font-size': 14 }); return; }
    zone(60, 50, 360, 200, 'client 망', { stroke: GRID, sw: 1.5 }); zone(540, 50, 360, 200, 'controller 전용 망', { stroke: INFO, sw: 2, fill: INFOBG });
    server(240, 150, 'broker', { s: 0.8 }); server(720, 150, 'controller', { s: 0.8 });
    el('line', { x1: 430, y1: 70, x2: 430, y2: 240, stroke: BAD, 'stroke-width': 4, 'stroke-dasharray': '10 6', opacity: fade(u, 0.5) }); mid(480, 272, '방화벽 · 포트 화이트리스트', fade(u, 0.6), { 'font-size': 13.5, fill: BAD });
    clock(880, 312, 20, E(u, 1.2, 2.2) * 0.92, WARN); note(600, 318, '인증서 만료 30일 전 알람', fade(u, 1.4), { 'font-size': 14 });
    note(90, 318, 'audit log · CVE 패치 · Connect도 TLS+ACL', fade(u, 1.8), { 'font-size': 14, fill: MUT }); }

  // ---------- 5. 48 항목 종합 ----------
  function s5(t, c) { const { k, u } = c; board(c);
    if (k === 0) { const owners = [['플랫폼팀', 'server.properties · client 설정'], ['플랫폼팀', 'jstat · iostat · perf-test'], ['SRE', 'JMX exporter · Prometheus · Grafana'], ['SecOps', 'TLS · SASL · ACL · audit log']];
      AX.forEach(([name, col], i) => { const y = 66 + i * 64, s = pop(u, 0.2 + i * 0.3);
        card(170, y, 200, 48, { rx: 10, text: name, fs: 15, fw: 800, stroke: col, color: col, s }); mono(320, y + 5, '12/12', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.4 + i * 0.3) });
        tx(400, y + 5, owners[i][0], { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.3) }); tx(520, y + 5, owners[i][1], { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.3) }); });
      return; }
    if (k === 1) { const T = ['토픽 생성 PR', '분기 회고', '사고 직후', 'broker 투입 · 버전 업'], cx = 480, cy = 180, r = 120;
      el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
      dot([[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy], [cx, cy - r]], (t * 0.3) % 1, ACC, 7);
      mid(cx, cy + 6, '점검표 다시 열기', fade(u, 0.3), { 'font-size': 16, 'font-weight': 800 });
      T.forEach((s, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; pill(cx + Math.cos(a) * (r + 80), cy + Math.sin(a) * (r + 14), s, ACC, pop(u, 0.4 + i * 0.3), { fs: 14, fill: PANEL }); });
      return; }
    if (k === 2) { const a = E(u, 0.6, 1.2);
      card(300, 150, 220, 70, { rx: 10, text: 'TBD', fs: 22, fw: 800, mono: true, stroke: BAD, color: BAD, op: 1 - a * 0.5 }); if (a > 0) el('line', { x1: 200, y1: 150, x2: lerp(200, 400, a), y2: 150, stroke: BAD, 'stroke-width': 3 });
      grow(420, 150, 520, 150, E(u, 1.2, 1.5), MUT);
      card(660, 150, 240, 90, { rx: 10, text: 'Owner: 김OO (예시)\nDue: 분기 말', fs: 15, fw: 700, stroke: GOOD, s: pop(u, 1.5) });
      mid(480, 270, '통과 못한 항목은 사람과 날짜를 적는다 · 점검표는 git으로 관리', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 3) { const O = [['Reliability', BAD, 300], ['Security', ACC, 240], ['Observability', INFO, 180], ['Throughput', WARN, 120]];
      O.forEach(([s, col, h], i) => { const x = 170 + i * 200, a = E(u, 0.2 + i * 0.3, 0.7 + i * 0.3), top = 330 - h * 0.85 * a;
        el('rect', { x: x - 70, y: top, width: 140, height: 330 - top, rx: 8, fill: col, opacity: 0.25 }); el('rect', { x: x - 70, y: top, width: 140, height: 4, fill: col });
        tx(x, top - 10, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: a }); if (i) tx(x - 100, 300, '>', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: MUT, opacity: a }); });
      mid(480, 360, '처리량은 나중에 올릴 수 있어도 잃은 메시지는 못 되찾는다', fade(u, 1.8), { 'font-size': 14 }); return; }
    const n = 48; for (let i = 0; i < 6; i++) { const x = 560 + i * 26, a = E(u, 0.8 + i * 0.15, 1.1 + i * 0.15);
      el('rect', { x, y: 200, width: 20, height: 20, rx: 4, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: a }); }
    el('rect', { x: 120, y: 200, width: 420, height: 20, rx: 4, fill: GOOD, opacity: 0.35 });
    mono(330, 190, `${n} 항목 = 최소 기준선`, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    tx(640, 250, '+ 운영하며 늘어난다', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) });
    tx(330, 250, '쓸모없어진 항목은 뺀다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 2.0) });
    mid(480, 320, '체크하지 않은 항목이 곧 다음 사고 시나리오다', fade(u, 2.3), { fill: BAD }); }

  const quiz = [
    { q: 'RF=3, min.insync.replicas=2인 토픽에 producer가 acks=1로 보내면 어떤 위험이 남는가?',
      o: ['leader만 받으면 성공이라 leader가 죽으면 메시지를 잃을 수 있다', '세 replica가 모두 확인해 위험이 없다', 'idempotence가 대신 복제를 확인해 준다'], a: 0,
      why: 'acks=all 이어야 ISR이 받은 뒤 성공으로 친다. RF만 3으로 올려도 확인 없이 보낸 메시지는 leader 장애 때 사라질 수 있다.' },
    { q: 'linger.ms=10을 주면 무엇이 달라지는가?',
      o: ['모든 메시지가 정확히 10ms 늦게 저장된다', '최대 10ms 모아 batch로 보내 요청 수가 준다', '10ms마다 압축을 껐다 켠다'], a: 1,
      why: '짧게 기다리는 대가로 같은 batch에 더 많이 담는다. 지연 10ms와 처리량을 맞바꾸는 설정이다.' },
    { q: 'URP 알람에 for: 5m를 붙인 이유는 무엇인가?',
      o: ['5분마다 한 번만 지표를 수집하려고', '5분 안에 Kafka가 스스로 고치게 하려고', '5분 넘게 0보다 클 때만 울려 순간 튐을 거르려고'], a: 2,
      why: '복제가 잠깐 밀리는 일은 흔하다. 5분 넘게 이어지면 broker 하나만 더 죽어도 데이터가 위험하니 그때 사람을 부른다.' },
    { q: 'super.users에 애플리케이션 계정을 넣으면 어떻게 되는가?',
      o: ['그 계정은 ACL 검사를 건너뛰어 최소 권한이 무의미해진다', 'TLS 인증서가 필요 없어진다', '그 계정의 처리량이 올라간다'], a: 0,
      why: 'super.users는 모든 ACL 검사에서 빠진다. 관리자 계정만 남겨야 토픽·group 단위 권한이 의미를 가진다.' },
    { q: '네 축의 요구가 충돌할 때 이 점검표가 정한 우선순위는 무엇인가?',
      o: ['Throughput > Observability > Security > Reliability', 'Reliability > Security > Observability > Throughput', 'Security > Reliability > Throughput > Observability'], a: 1,
      why: '처리량은 나중에 올릴 수 있지만 잃은 메시지는 되찾지 못한다. 그래서 Reliability가 맨 앞이다.' },
  ];

  const summary = [
    '메시지를 잃지 않으려면 RF=3, min.insync.replicas=2, acks=all, idempotence를 함께 건다.',
    '처리량은 batch와 linger, 압축, 파티션 수로 올리고 heap은 6~8GB로 작게 둔다.',
    'URP, Offline, Controller, lag 네 지표에 알람을 걸고 대시보드로 원인을 본다.',
    '48개 항목은 최소 기준선이라 PR과 분기, 사고 뒤마다 다시 열어 고친다.',
  ];
  const review = [
    { q: 'RF=3 토픽인데 broker 하나가 죽은 뒤 메시지 일부가 사라졌다. producer 설정에서 먼저 볼 것은?',
      o: ['acks가 all 인지', 'batch.size 크기', 'compression.type 종류'], a: 0,
      why: 'acks=1이면 leader만 받고 성공 처리된다. follower로 복제되기 전에 leader가 죽으면 그 메시지는 남지 않는다.' },
    { q: '밤사이 URP가 몇 시간째 0보다 컸는데 아무도 몰랐다. 먼저 고칠 것은?',
      o: ['linger.ms를 늘린다', 'URP를 수집해 5분 넘게 0보다 크면 알람을 보낸다', 'partition 수를 늘린다'], a: 1,
      why: '지표를 모으고 알람을 걸어야 사람이 안다. JMX exporter로 URP를 수집하고 for: 5m critical 규칙을 둔다.' },
    { q: '처리량을 올리려고 acks=1로 바꾸자는 제안이 나왔다. 이 점검표의 우선순위로 본 판단은?',
      o: ['처리량이 가장 앞이니 받아들인다', '보안과 상관없으니 바로 적용한다', 'Reliability가 Throughput보다 앞이라 받아들이지 않는다'], a: 2,
      why: 'Reliability가 첫째다. 처리량은 batch, linger, 압축, partition 수로 따로 올릴 수 있다.' },
  ];

  R.page({ title: '운영 출항 점검표', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
