/* V-1-1 Monitoring (Prometheus) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 지표 값(ready 12·120, publish 48·60, 사고 시나리오 3,400 등)은 페이지 데이터의 설명용 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, terminal, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const num = (v) => Math.round(v).toLocaleString('en-US');
  // 노드 옆 포트 소켓: 열린 포트는 실선, 닫힌 포트는 점선 + 자물쇠
  function port(x, y, name, open, o) { o = o || {}; const col = open ? (o.col || INK) : OFF;
    el('line', { x1: 206, y1: y, x2: x, y2: y, stroke: col, 'stroke-width': 3, 'stroke-dasharray': open ? null : '6 6' });
    card(x + 92, y, 184, 38, { rx: 8, stroke: col, sw: 2, fill: open && o.hot ? ACCBG : PANEL, dash: open ? null : '6 5' });
    mono(x + 12, y + 5, name, { 'font-size': 14.5, 'font-weight': 700, fill: open ? (o.col || INK) : MUT });
    if (!open) lock(x + 166, y + 2, true, MUT, 0.7); }
  // RabbitMQ 노드 + 세 포트 (15692 는 open 인자)
  function nodePorts(open15692, o) { o = o || {};
    server(150, 190, 'rabbit-1', { lamp: ACC });
    port(260, 120, ':5672  AMQP', true);
    port(260, 190, ':15672 UI·API', true);
    port(260, 260, ':15692 /metrics', open15692, { col: ACC, hot: o.hot }); }
  // 작은 진행 칩 (enable · 노출 · curl)
  function progress(k) { [['enable', 1], [':15692 노출', 1], ['curl 검증', 2]].forEach(([s, at], i) => {
    const done = k >= at; pill(560 + i * 130, 395, (done ? '✓ ' : '') + s, done ? GOOD : OFF, 1, { fs: 13.5 }); }); }

  // ---------- 1. 플러그인 → /metrics ----------
  function s1(t, c) { const { k, u } = c;
    const open = k >= 2 || (k === 1 && u > 1.6);
    nodePorts(open, { hot: k === 1 && u > 1.6 });
    if (k === 0) { lbl(720, 70, '이 스크립트가 할 일', fade(u, 0.1));
      ['① 플러그인 enable', '② :15692 로 노출', '③ curl 로 검증'].forEach((s, i) => { const y = 120 + i * 62, sc = pop(u, 0.4 + i * 0.4);
        card(720, y, 300, 46, { rx: 10, stroke: INK, sw: 2, s: sc }); el('rect', { x: 590, y: y - 10, width: 20, height: 20, rx: 4, fill: PANEL, stroke: MUT, 'stroke-width': 2, opacity: sc });
        tx(624, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) }); });
      pill(720, 330, 'set -euo pipefail', INFO, pop(u, 1.8), { mono: true, fs: 14 });
      sub(720, 366, '한 줄이라도 실패하면 거기서 멈춘다', fade(u, 2.1)); return; }
    if (k === 1) { terminal(540, 60, 400, 150, ['$ rabbitmq-plugins enable rabbitmq_prometheus', '$ rabbitmq-plugins list | grep prom', ['[E*] rabbitmq_prometheus', '#4ade80']], lerp(0, 3, E(u, 0.2, 1.5)), { title: 'rabbit-1' });
      if (u > 1.6) { lock(476, 262, false, ACC, 0.7 * pop(u, 1.6)); }
      note(560, 262, '재시작 없이 바로 열린다', fade(u, 1.9), { fill: ACC });
      progress(1); return; }
    if (k === 2) { const r = [[476, 260], [520, 260], [520, 160], [540, 160]];
      for (let i = 0; i < 4; i++) dot(r, seg(u, 0.2 + i * 0.25, 1.1 + i * 0.25), ACC, 5);
      terminal(540, 50, 400, 190, ['$ curl -s :15692/metrics | grep messages', ['# TYPE rabbitmq_queue_messages_ready gauge', '#a8a29e'], 'rabbitmq_queue_messages_ready 12', 'rabbitmq_queue_messages_unacked 3'], lerp(0, 4, E(u, 0.4, 2.2)), { title: '응답 예시 (OpenMetrics 텍스트)' });
      note(560, 280, '사람이 아니라 기계가 읽는 평문 텍스트', fade(u, 2.2));
      progress(2); return; }
    if (k === 3) { // /metrics 는 집계 몇 줄, /metrics/detailed 는 큐마다 한 줄
      lbl(600, 60, '/metrics', 1, { 'text-anchor': 'middle', class: 'mono' }); sub(600, 82, '집계 · 가볍다');
      ['messages_ready 12', 'messages_unacked 3', 'consumers 4'].forEach((s, i) => { const sc = pop(u, 0.2 + i * 0.2);
        card(600, 118 + i * 40, 180, 32, { rx: 6, text: s, fs: 13.5, mono: true, stroke: ACC, s: sc }); });
      lbl(820, 60, '/metrics/detailed', 1, { 'text-anchor': 'middle', class: 'mono' }); sub(820, 82, '큐·노드마다 한 줄씩 · 무겁다', 1, { fill: WARN });
      const n = Math.round(lerp(0, 18, E(u, 0.4, 1.6))), filt = E(u, 1.9, 2.5);
      for (let i = 0; i < n; i++) { const keep = i % 4 === 0;
        el('rect', { x: 740, y: 100 + i * 13, width: 160, height: 9, rx: 3, fill: filt > 0 && keep ? ACC : WARN, opacity: filt > 0 && !keep ? 1 - 0.75 * filt : 0.8 }); }
      if (filt > 0) pill(820, 360, '?family=queue_coarse_metrics', ACC, pop(u, 1.9), { mono: true, fs: 13.5 });
      sub(820, 398, '필요한 묶음만 골라 긁는다', fade(u, 2.2)); return; }
    if (k === 4) { // 매일 보는 지표 (접두사 rabbitmq_ 생략)
      sub(720, 40, '접두사 rabbitmq_ 생략 · 값은 예시', 1);
      [['적체', 'queue_messages_ready 12 · _unacked 3', INK], ['소비', 'queue_consumers 4', INK], ['누수', 'connections 9 · channels 14', INK], ['자원', 'alarms_*_watermark 0 / 0', BAD]].forEach(([g, s, col], i) => {
        const y = 82 + i * 70, sc = pop(u, 0.2 + i * 0.4); card(720, y, 430, 56, { rx: 10, stroke: i === 3 ? BAD : GRID, sw: 2, s: sc });
        tx(522, y + 6, g, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) });
        mono(570, y + 6, s, { 'font-size': 14, opacity: fade(u, 0.4 + i * 0.4) }); });
      note(520, 390, 'watermark 가 1 이 되면 publish 가 막힌다', fade(u, 2.1), { fill: BAD }); return; }
    // k5: 공식 이미지는 기본 enable, enabled_plugins 를 덮어쓰면 빠진다
    const fileCard = (cx, title, lines, ok, at) => { const sc = pop(u, at);
      card(cx, 170, 200, 130, { rx: 8, stroke: ok ? GOOD : BAD, sw: 2, s: sc }); tx(cx, 92, title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, at) });
      mono(cx - 88, 128, 'enabled_plugins', { 'font-size': 13.5, fill: MUT, opacity: fade(u, at) });
      lines.forEach((s, i) => mono(cx - 88, 160 + i * 24, s, { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, at + 0.2) }));
      (ok ? check : cross)(cx - 30, 270, 12, pop(u, at + 0.6)); mono(cx - 10, 276, ok ? ':15692 열림' : ':15692 닫힘', { 'font-size': 14, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, at + 0.6) }); };
    fileCard(640, '공식 이미지 기본', ['[rabbitmq_management,', ' rabbitmq_prometheus].'], true, 0.2);
    fileCard(850, '파일을 직접 덮어씀', ['[rabbitmq_management].'], false, 1.1);
    note(540, 340, '덮어쓸 때는 목록에 prometheus 를 꼭 넣는다', fade(u, 2.0), { fill: WARN }); }

  // ---------- 2. Prometheus scrape ----------
  const PX = 150, PY = 200;
  function prom(o) { o = o || {};
    card(PX, PY, 190, 86, { rx: 12, stroke: INFO, sw: 2.5, fill: INFOBG });
    tx(PX, PY - 6, 'Prometheus', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO });
    mono(PX, PY + 20, ':9090', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
    if (o.tag) pill(PX, PY - 66, o.tag, INFO, 1, { mono: true, fs: 13.5 });
    if (o.targets != null) mono(PX, PY + 74, 'targets ' + o.targets, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.tcol || INK }); }
  function rnode(cx, cy, name, o) { o = o || {}; server(cx, cy, null, { s: 0.62, lamp: o.dead ? BAD : ACC, stroke: o.dead ? BAD : INK, op: o.op });
    mono(cx + 46, cy + 5, name, { 'font-size': 14.5, 'font-weight': 700, opacity: o.op ?? 1, fill: o.dead ? BAD : INK }); }
  function s2(t, c) { const { k, u, beat } = c;
    if (k === 0) { prom({ targets: 0, tcol: BAD }); rnode(740, PY, 'rabbit-1:15692');
      grow(250, PY - 14, 696, PY - 14, E(u, 0.3, 1.2), ACC); pill(470, PY - 44, 'GET /metrics', ACC, pop(u, 0.9), { mono: true, fs: 13.5 });
      dot([[696, PY - 14], [250, PY - 14]], seg(u, 1.3, 2.2), ACC, 7);
      el('line', { x1: 696, y1: PY + 30, x2: 252, y2: PY + 30, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.6) });
      cross(474, PY + 30, 10, pop(u, 1.8)); sub(474, PY + 62, '브로커가 밀어 보내지 않는다 (push 아님)', fade(u, 1.9));
      note(PX - 90, 380, 'pull: 언제 긁을지는 Prometheus 가 정한다', fade(u, 2.2)); return; }
    if (k === 1) { prom({ tag: '15s', targets: 0, tcol: BAD });
      const X = (s) => 300 + s * 9, y1 = 120, y2 = 250;
      lbl(300, 70, '0 ~ 60초 타임라인', 1, { 'text-anchor': 'start' });
      el('line', { x1: X(0), y1: 320, x2: X(60), y2: 320, stroke: MUT, 'stroke-width': 1.8 });
      [0, 15, 30, 45, 60].forEach((s, i) => { const on = seg(u, 0.2 + i * 0.3, 0.5 + i * 0.3);
        mono(X(s), 344, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
        if (on <= 0) return;
        el('rect', { x: X(s), y: y1 - 12, width: 9 * 10 * on, height: 24, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.2 });
        el('circle', { cx: X(s), cy: y1, r: 8, fill: ACC });
        el('circle', { cx: X(s), cy: y2, r: 7, fill: INFO, opacity: fade(u, 0.4 + i * 0.3) }); });
      tx(290, y1 + 5, 'scrape', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC });
      tx(290, y2 + 5, '룰 평가', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: INFO });
      note(X(0), y1 + 46, '주황 칸 = scrape_timeout 10s (간격 15s 보다 짧게)', fade(u, 1.8), { fill: WARN, 'font-size': 14 });
      note(X(0), y2 + 40, 'evaluation_interval 15s 마다 경보 규칙을 계산', fade(u, 2.0), { fill: INFO, 'font-size': 14 });
      note(PX - 90, 400, 'Prometheus 자체 기본값은 1분, RabbitMQ 권장 최소는 15초', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 2) { prom({ tag: '15s', targets: 0, tcol: BAD });
      const gu = E(u, 0.3, 1.1), gu2 = E(u, 1.0, 1.8);
      grow(PX + 40, PY + 44, 440, 330, gu, MUT); card(530, 330, 190, 50, { rx: 8, text: 'alert.rules.yml', mono: true, fs: 14.5, stroke: INK, s: pop(u, 0.9) });
      sub(530, 376, 'rule_files: 규칙을 읽는다', fade(u, 1.1));
      grow(250, PY, 640, 120, gu2, BAD); card(760, 110, 220, 56, { rx: 10, text: 'Alertmanager\n:9093', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 1.6) });
      sub(760, 160, '규칙이 firing 이면 여기로 보낸다', fade(u, 1.9));
      note(560, 250, '규칙 파일이 없으면 Prometheus 가 안 뜬다', fade(u, 2.3), { fill: WARN, 'font-size': 14 }); return; }
    if (k === 3) { prom({ tag: '15s', targets: 0, tcol: WARN });
      card(560, 110, 400, 92, { rx: 10, stroke: INK, s: pop(u, 0.2) });
      mono(380, 100, '- job_name: "rabbitmq"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(380, 128, '  metrics_path: /metrics/per-object', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      const lu = fade(u, 1.0); tx(360, 210, '긁어 온 시계열 한 줄', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: lu });
      R.spans(360, 246, [['rabbitmq_queue_messages_ready{', {}], ['job="rabbitmq"', { fill: ACC, 'font-weight': 800 }], [',', {}]], { 'font-size': 15, opacity: lu });
      R.spans(390, 274, [['queue="order.events"', { fill: INFO, 'font-weight': 800, opacity: fade(u, 1.6) }], ['} 35', { opacity: fade(u, 1.6) }]], { 'font-size': 15 });
      note(360, 320, 'job_name 은 모든 시계열에 붙는 라벨이 된다', fade(u, 1.9), { fill: ACC, 'font-size': 14.5 });
      note(360, 350, '기본 /metrics 는 큐를 합친 값이라 queue 라벨이 없다', fade(u, 2.2), { fill: INFO, 'font-size': 14.5 }); return; }
    // k4, k5: 노드 3대
    const ns = [[730, 90, 'rabbit-1'], [730, 200, 'rabbit-2'], [730, 310, 'rabbit-3']];
    const tg = k === 4 ? Math.round(tween(0, 3, u, 1.4)) : 3;
    prom({ tag: '15s', targets: tg, tcol: tg === 3 ? GOOD : WARN });
    ns.forEach(([x, y, n], i) => { const sc = k === 4 ? pop(u, 0.2 + i * 0.3) : 1; if (sc <= 0) return;
      rnode(x, y, n + ':15692', { op: clamp(sc) }); if (k === 5) return;
      grow(248, PY + (i - 1) * 20, x - 40, y, k === 4 ? E(u, 0.4 + i * 0.3, 1.0 + i * 0.3) : 1, ACC, { plain: true, sw: 2 });
      dot([[x - 40, y], [248, PY + (i - 1) * 20]], ((t * 0.45 + i / 3) % 1), ACC, 5); });
    if (k === 4) { pill(500, 380, 'labels: cluster="prod-rabbit"', ACC, pop(u, 1.6), { mono: true, fs: 13.5 }); return; }
    // k5: Targets 화면
    zone(330, 34, 340, 196, 'Status > Targets', { fill: SOFT });
    [['rabbit-1:15692', 'rabbitmq'], ['rabbit-2:15692', 'rabbitmq'], ['rabbit-3:15692', 'rabbitmq'], ['localhost:9090', 'prometheus']].forEach(([n, j], i) => {
      const y = 82 + i * 36, sc = fade(u, 0.2 + i * 0.3); mono(346, y + 5, n, { 'font-size': 14, opacity: sc });
      pill(560, y, 'UP', GOOD, sc, { fs: 13 }); mono(600, y + 5, 'up=1', { 'font-size': 13.5, fill: MUT, opacity: sc }); });
    note(330, 270, 'up{job="rabbitmq"} = 1 이면 수집 성공', fade(u, 1.8), { 'font-size': 14.5 });
    note(330, 298, '죽은 노드는 up = 0 으로 남는다', fade(u, 2.2), { fill: BAD, 'font-size': 14.5 }); }

  // ---------- 3. Grafana ----------
  // 오른쪽 위 작은 지도: 지금 보는 패널 위치
  function minimap(i) { [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([q, r], j) => el('rect', { x: 870 + q * 34, y: 18 + r * 22, width: 30, height: 18, rx: 3, fill: j === i ? ACC : SOFT, stroke: GRID })); }
  function qtube(x, y, w, nReady, nUn, u) { // 큐 그림: 왼쪽 ready(회색) → 오른쪽 unacked(주황, 컨슈머 손에)
    el('rect', { x, y: y - 26, width: w, height: 52, rx: 26, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    const n = Math.round(nReady * u); for (let i = 0; i < n; i++) el('rect', { x: x + w - 140 - i * 22, y: y - 12, width: 18, height: 24, rx: 3, fill: OFF });
    for (let i = 0; i < nUn; i++) el('rect', { x: x + w - 110 + i * 26, y: y - 12, width: 20, height: 24, rx: 3, fill: ACC, opacity: fade(u, 0.6) }); }
  function s3(t, c) { const { k, u, beat, prev } = c;
    if (k === 0) { ['Queue depth', 'publish · deliver', 'consumers · 연결', '자원 알람'].forEach((s, i) => { const x = 40 + (i % 2) * 450, y = 40 + Math.floor(i / 2) * 190;
        el('rect', { x, y, width: 430, height: 170, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }); if (i % 2 === 0) tx(x + 14, y + 24, s, { 'font-size': 14, fill: MUT, 'font-weight': 700 }); });
      card(480, 210, 440, 220, { rx: 12, stroke: INK, sw: 2.5, s: pop(u, 0.2) });
      tx(290, 140, 'Import dashboard', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3) });
      const typ = (s, a, b) => s.slice(0, Math.round(s.length * E(u, a, b)));
      card(400, 190, 200, 40, { rx: 6, stroke: ACC, fill: ACCBG, op: fade(u, 0.5) }); mono(312, 196, typ('ID 10991', 0.5, 1.0), { 'font-size': 16, 'font-weight': 800, fill: ACC });
      tx(520, 196, 'RabbitMQ-Overview', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      card(400, 240, 200, 40, { rx: 6, stroke: ACC, fill: ACCBG, op: fade(u, 1.2) }); mono(312, 246, typ('ID 10992', 1.2, 1.7), { 'font-size': 16, 'font-weight': 800, fill: ACC });
      tx(520, 246, 'Erlang-Distribution', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      pill(380, 292, '데이터소스: Prometheus', INFO, pop(u, 1.9), { fs: 14 }); return; }
    if (k === 1) { const n = tween(0, 2, u, 1.6);
      card(220, 200, 330, 200, { rx: 10, stroke: INK, s: pop(u, 0.1) });
      mono(70, 130, 'grafana-dashboards.yml', { 'font-size': 14, 'font-weight': 800, fill: ACC });
      mono(70, 160, 'folder: "RabbitMQ"', { 'font-size': 14 }); mono(70, 188, 'path: /var/lib/', { 'font-size': 14 }); mono(70, 210, '      grafana/dashboards', { 'font-size': 14 });
      ['10991.json', '10992.json'].forEach((s, i) => { mono(90, 246 + i * 26, s, { 'font-size': 14, fill: MUT });
        fly(150, 240 + i * 26, 690, 180 + i * 46, seg(u, 0.6 + i * 0.4, 1.5 + i * 0.4), s, { mono: true, stay: true }); });
      zone(570, 100, 300, 180, '📁 RabbitMQ 폴더', { fill: SOFT });
      mono(720, 320, '대시보드 ' + Math.round(n) + '개', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: n >= 1.99 ? GOOD : INK });
      note(570, 370, '컨테이너를 새로 띄워도 그대로 돌아온다', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 2) { minimap(0); lbl(60, 50, 'Queue depth', 1, { 'text-anchor': 'start' });
      sub(60, 74, 'sum by (queue) (…messages_ready / _unacked)', 1, { 'text-anchor': 'start', class: 'mono' });
      qtube(80, 160, 640, 18, 3, E(u, 0.2, 1.4)); for (let i = 0; i < 3; i++) person(790, 92 + i * 52, null, { s: 0.55 });
      tx(790, 240, 'consumer', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      sub(330, 210, '기다리는 메시지 (ready)', fade(u, 1.0), { fill: INK, 'font-weight': 700 }); sub(650, 210, '처리 중 (unacked)', fade(u, 1.0), { fill: ACC, 'font-weight': 700 });
      const rd = tween(prev && prev.metrics ? 35 : 35, 120, u, 1.4);
      tx(80, 296, 'ready', { 'font-size': 15, 'font-weight': 700 }); hbar(170, 282, 560, rd, 140, { col: WARN, text: num(rd), h: 20 });
      tx(80, 340, 'unacked', { 'font-size': 15, 'font-weight': 700 }); hbar(170, 326, 560, 18, 140, { col: ACC, text: '18', h: 20, u: E(u, 0.4, 1.4) });
      note(80, 396, 'ready 가 늘고 unacked 는 그대로면 소비가 못 따라가는 중', fade(u, 2.1), { fill: WARN }); return; }
    if (k === 3) { minimap(1); lbl(60, 50, 'publish vs deliver (rate 5m, msg/s)', 1, { 'text-anchor': 'start' });
      const ax = axes(110, 90, 560, 250, { x: [0, 10], y: [0, 80], xt: [0, 5, 10], yt: [0, 20, 40, 60, 80], grid: true, xl: '분' });
      const P = [[0, 48], [5, 48], [5.5, 60], [10, 60]], D = [[0, 46], [5, 46], [5.5, 44], [10, 44]], lu = E(u, 0.2, 1.6);
      if (lu > 0.55) { const a = clamp((lu - 0.55) / 0.45); el('polygon', { points: [[5.5, 60], [5.5 + 4.5 * a, 60], [5.5 + 4.5 * a, 44], [5.5, 44]].map(([x, y]) => ax.X(x) + ',' + ax.Y(y)).join(' '), fill: WARNBG }); }
      line(ax, P, lu, ACC); line(ax, D, lu, INFO);
      tx(700, 120, 'publish 60', { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono', opacity: fade(u, 1.6) });
      tx(700, 175, 'deliver 44', { 'font-size': 15, 'font-weight': 800, fill: INFO, class: 'mono', opacity: fade(u, 1.6) });
      tx(700, 250, '초당 16건씩', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); tx(700, 274, '큐에 쌓인다', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { minimap(2); lbl(60, 50, 'consumers · connections · channels', 1, { 'text-anchor': 'start' });
      for (let i = 0; i < 3; i++) person(110 + i * 60, 130, null, { s: 0.7 * pop(u, 0.2 + i * 0.2) });
      mono(110, 196, 'consumers 3', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8) });
      const sh = (x, y, pts, col, title, lu) => { const ax = axes(x, y, 280, 110, { x: [0, 10], y: [0, 10] }); line(ax, pts, lu, col); tx(x, y - 14, title, { 'font-size': 14.5, 'font-weight': 700, fill: col }); };
      sh(380, 100, [[0, 3], [1.5, 6], [2, 3], [3.5, 6], [4, 3], [5.5, 6], [6, 3], [7.5, 6], [8, 3], [10, 5]], GOOD, '정상: 톱니처럼 열고 닫힘', E(u, 0.6, 1.8));
      sh(380, 280, [[0, 1], [2, 2.6], [4, 4.2], [6, 5.8], [8, 7.6], [10, 9.4]], BAD, '누수 의심: 계속 오르기만', E(u, 1.0, 2.2));
      mono(110, 300, 'connections 11', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(110, 328, 'channels 19', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(380, 412, '그래프 모양은 예시', 1, { 'text-anchor': 'start' }); return; }
    minimap(3); lbl(60, 50, '자원 알람 · watermark', 1, { 'text-anchor': 'start' });
    // 메모리 막대 + 워터마크 선, 지금 값 0 → 알람 꺼짐. 1 이 되면 publish 문이 닫힌다
    el('rect', { x: 80, y: 110, width: 520, height: 34, rx: 6, fill: SOFT, stroke: GRID });
    el('rect', { x: 80, y: 110, width: 520 * 0.45 * E(u, 0.2, 1.0), height: 34, rx: 6, fill: INFO, opacity: 0.75 });
    el('line', { x1: 80 + 520 * 0.8, y1: 96, x2: 80 + 520 * 0.8, y2: 158, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '5 4' });
    tx(80 + 520 * 0.8, 88, 'watermark', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); tx(80, 172, '메모리 사용 (그림은 예시)', { 'font-size': 13.5, fill: MUT });
    mono(640, 134, 'memory_used_watermark 0', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
    const g = fade(u, 1.4); person(130, 290, 'producer', { s: 0.8, op: g }); grow(170, 290, 420, 290, E(u, 1.5, 2.0), MUT);
    card(470, 290, 90, 70, { rx: 8, text: '브로커', fs: 15, op: g, stroke: BAD });
    el('rect', { x: 412, y: 254, width: 8, height: 72, rx: 2, fill: BAD, opacity: fade(u, 2.0) }); cross(300, 262, 10, pop(u, 2.1));
    note(560, 286, '값이 1 이면 publish 가 막힌다', fade(u, 2.0), { fill: BAD }); note(560, 314, '대시보드보다 경보로 먼저 알아야 한다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 4. 경보 규칙 ----------
  const ST = { inactive: [OFF, 'inactive'], pending: [WARN, 'pending'], firing: [BAD, 'firing'] };
  function stateRow(y, title, segs, u) { // segs: [[start, end, true/false]] 0~10, 상태 칸
    tx(60, y - 34, title, { 'font-size': 15, 'font-weight': 700 });
    const X = (v) => 200 + v * 60; el('line', { x1: X(0), y1: y, x2: X(10), y2: y, stroke: GRID, 'stroke-width': 2 });
    tx(190, y + 5, 'expr', { 'font-size': 14, 'text-anchor': 'end', fill: MUT, class: 'mono' });
    tx(190, y + 45, '상태', { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
    segs.forEach(([a, b, st], i) => { const s = clamp((u * 10 - a) / (b - a)), w = (b - a) * 60 * clamp(s); if (w <= 0) return;
      if (st !== 'inactive') el('rect', { x: X(a), y: y - 10, width: Math.min(w, (b - a) * 60), height: 20, rx: 4, fill: ACC, opacity: 0.8 });
      el('rect', { x: X(a), y: y + 30, width: Math.min(w, (b - a) * 60) - 2, height: 24, rx: 5, fill: ST[st][0], opacity: 0.85 });
      if (s >= 1 && (b - a) >= 1.2) tx(X(a) + (b - a) * 30, y + 47, ST[st][1], { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }); }); }
  function exch(cx, cy, name, o) { o = o || {}; const r = 34, pts = [0, 1, 2, 3, 4, 5].map((i) => [cx + r * Math.cos(Math.PI / 3 * i), cy + r * Math.sin(Math.PI / 3 * i)]);
    el('polygon', { points: pts.map((p) => p.join(',')).join(' '), fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5 }); if (name) lbl(cx, cy + 56, name, o.op); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const fu = E(u, 0.2, 2.3);
      stateRow(110, '짧은 스파이크 (for 를 못 채움)', [[0, 2, 'inactive'], [2, 3.2, 'pending'], [3.2, 10, 'inactive']], fu);
      stateRow(290, '조건이 계속 참 (for 5m 채움)', [[0, 2, 'inactive'], [2, 5, 'pending'], [5, 10, 'firing']], fu);
      if (fu > 0.5) { const X = (v) => 200 + v * 60; el('line', { x1: X(2), y1: 236, x2: X(5), y2: 236, stroke: WARN, 'stroke-width': 2.5 }); tx(X(3.5), 228, 'for', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' }); }
      if (u > 2.0) { grow(800, 334, 880, 334, E(u, 2.0, 2.5), BAD); tx(890, 310, 'Alert-', { 'font-size': 14, 'font-weight': 700, fill: BAD }); tx(890, 328, 'manager', { 'font-size': 14, 'font-weight': 700, fill: BAD }); }
      return; }
    if (k === 1) { const ax = axes(110, 70, 560, 260, { x: [0, 15], y: [0, 2000], xt: [0, 5, 10, 15], yt: [0, 1000, 2000], xl: '분', yl: 'messages_ready' });
      el('line', { x1: ax.X(0), y1: ax.Y(1000), x2: ax.X(15), y2: ax.Y(1000), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.2) });
      tx(ax.X(15) + 6, ax.Y(1000) + 5, '> 1000', { 'font-size': 14, 'font-weight': 800, fill: BAD, class: 'mono' });
      line(ax, [[0, 120], [4, 120], [5, 1400], [7, 1350], [8, 130], [15, 120]], E(u, 0.3, 1.9), WARN);
      const X1 = ax.X(4.75), X2 = ax.X(7.6); if (u > 1.6) { el('line', { x1: X1, y1: ax.Y(1600), x2: X2, y2: ax.Y(1600), stroke: WARN, 'stroke-width': 2.5 }); tx((X1 + X2) / 2, ax.Y(1600) - 8, '약 3분 < for 5m', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' }); }
      note(700, 150, '배치 유입 스파이크', fade(u, 1.8)); note(700, 176, '→ 발사하지 않는다', fade(u, 2.0), { fill: GOOD });
      card(780, 280, 230, 54, { rx: 10, stroke: GOOD, s: pop(u, 2.1) }); mono(780, 276, 'ready 120', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      tx(780, 297, '지금은 inactive', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      sub(110, 412, '곡선 모양은 예시', 1, { 'text-anchor': 'start' }); return; }
    if (k === 2) { const cols = ['consumers == 0', 'ready > 0', '경보'], rows = [['유휴 큐', '0', '0', false, false], ['정상 큐', '3', '120', false, true], ['장애 큐', '0', '3,400', true, true]];
      cols.forEach((s, j) => tx(380 + j * 200, 70, s, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', class: j < 2 ? 'mono' : null }));
      rows.forEach(([n, cs, rd, a, b], i) => { const y = 130 + i * 90, at = 0.2 + i * 0.55, on = a && b;
        tx(90, y + 6, n, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, at) });
        mono(200, y + 6, `c=${cs} r=${rd}`, { 'font-size': 13.5, fill: MUT, opacity: fade(u, at) });
        [a, b].forEach((v, j) => { card(380 + j * 200, y, 150, 56, { rx: 8, stroke: v ? GOOD : GRID, s: pop(u, at + 0.15 * j) }); (v ? check : cross)(380 + j * 200, y, 11, pop(u, at + 0.15 * j)); });
        card(780, y, 150, 56, { rx: 8, stroke: on ? BAD : GRID, fill: on ? BADBG : PANEL, text: on ? 'critical' : '조용', fs: 15, color: on ? BAD : MUT, s: pop(u, at + 0.35) }); });
      note(90, 405, '두 조건을 and 로 묶어 유휴 큐의 헛경보를 없앤다', fade(u, 2.2)); return; }
    if (k === 3) { lbl(60, 50, '규칙별 for (지속 시간)', 1, { 'text-anchor': 'start' });
      [['QueueBacklog', 5, 'warning', WARN], ['NoConsumers', 3, 'critical', BAD], ['ResourceAlarm', 1, 'critical', BAD], ['NodeDown', 1, 'critical', BAD]].forEach(([n, m, sv, col], i) => {
        const y = 100 + i * 58, hot = i === 2; mono(60, y + 15, n, { 'font-size': 15, 'font-weight': hot ? 800 : 600, fill: hot ? BAD : INK });
        hbar(250, y, 420, m, 5, { col, text: m + 'm', h: 22, u: E(u, 0.2 + i * 0.3, 1.0 + i * 0.3) }); tx(760, y + 16, sv, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.3) }); });
      card(480, 366, 600, 50, { rx: 10, stroke: BAD, fill: BADBG, s: pop(u, 1.9) });
      mono(480, 372, 'memory_used_watermark == 1 or free_disk_space… == 1', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { const die = E(u, 0.6, 1.0), X0 = 300, X1 = 760;
      ['rabbit-1', 'rabbit-2', 'rabbit-3'].forEach((n, i) => { const y = 100 + i * 100, dead = i === 1 && die > 0;
        rnode(110, y, null, { dead }); mono(160, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, fill: dead ? BAD : INK });
        const end = i === 1 ? lerp(X0 + 20, X1, 0) + (X1 - X0) * 0.35 : X0 + (X1 - X0) * E(u, 0.1, 2.0);
        const pts = []; for (let x = X0; x <= (i === 1 ? X0 + (X1 - X0) * Math.min(0.35, E(u, 0.1, 2.0)) : end); x += 20) pts.push(x + ',' + (y - 8 + Math.sin(x / 23 + i) * 8));
        if (pts.length > 1) el('polyline', { points: pts.join(' '), fill: 'none', stroke: dead ? BAD : ACC, 'stroke-width': 2.5 });
        if (i === 1 && u > 1.2) { el('line', { x1: X0 + (X1 - X0) * 0.36, y1: y, x2: X1, y2: y, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 6' }); sub(X0 + (X1 - X0) * 0.68, y - 14, '지표가 끊겼다', fade(u, 1.3), { fill: BAD, 'font-weight': 700 }); } });
      if (die > 0) cross(110, 200, 16, die);
      pill(530, 370, 'up{instance="rabbit-2:15692"} == 0', BAD, pop(u, 1.8), { mono: true, fs: 14 }); sub(530, 404, '브로커 지표는 사라지고 up 만 남는다', fade(u, 2.2)); return; }
    // k5: 바인딩 없는 exchange → 메시지가 버려진다
    person(100, 150, 'producer', { s: 0.85 }); exch(380, 150, 'exchange', {});
    grow(140, 150, 340, 150, E(u, 0.1, 0.5), MUT);
    for (let i = 0; i < 3; i++) { const a = 0.4 + i * 0.55, fu = seg(u, a, a + 0.5), du = seg(u, a + 0.5, a + 1.0);
      if (fu > 0 && fu < 1) card(lerp(150, 360, E(fu, 0, 1)), 150, 30, 22, { rx: 4, fill: ACC, stroke: 'none' });
      if (du > 0 && du < 1) card(400, 180 + du * 120, 30, 22, { rx: 4, fill: BAD, stroke: 'none', op: 1 - du }); }
    el('line', { x1: 420, y1: 150, x2: 600, y2: 150, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 6' }); tx(620, 155, '바인딩 0개 · 갈 큐가 없다', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const cnt = Math.min(3, Math.floor(seg(u, 0.9, 2.5) * 3 + (u > 2.5 ? 1 : 0)));
    mono(440, 330, 'unroutable_dropped_total ' + cnt, { 'font-size': 16, 'font-weight': 800, fill: BAD });
    note(440, 362, 'rate(…[5m]) > 0 이면 warning', fade(u, 1.6), { fill: WARN });
    pill(790, 300, 'warning → Slack', WARN, pop(u, 2.0), { fs: 14 }); pill(790, 344, 'critical → PagerDuty', BAD, pop(u, 2.2), { fs: 14 }); }

  // ---------- 5. 사고 대응 ----------
  // 위 왼쪽: ready 곡선 (단계별, 값은 예시), 오른쪽: 그 단계의 도구 화면
  const PH = ['정상', '3분', '조회', '재확인', '롤백', '회복', '해소'];
  const PV = [120, 3400, 3550, 3700, 3850, 1200, 35];
  function chart(upto, u) { const ax = axes(80, 60, 430, 210, { x: [0, 6], y: [0, 4000], yt: [0, 1000, 2000, 3000, 4000], grid: true, yl: 'messages_ready (예시)' });
    PH.forEach((p, i) => tx(ax.X(i), 296, p, { 'font-size': 13.5, fill: i <= upto ? INK : OFF, 'text-anchor': 'middle', 'font-weight': 600 }));
    el('line', { x1: ax.X(0), y1: ax.Y(1000), x2: ax.X(6), y2: ax.Y(1000), stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
    const pts = PV.slice(0, upto + 1).map((v, i) => [i, v]); line(ax, pts.slice(0, -1), 1, BAD);
    if (pts.length > 1) line(ax, pts.slice(-2), E(u, 0.2, 1.4), upto >= 5 ? GOOD : BAD);
    const lv = pts[pts.length - 1]; if (u > 1.2 || pts.length === 1) mono(ax.X(lv[0]) + 8, ax.Y(lv[1]) - 10, upto >= 2 && upto <= 4 ? '3,400+' : num(lv[1]), { 'font-size': 15, 'font-weight': 800, fill: upto >= 5 ? GOOD : BAD });
    return ax; }
  function crew(n, dead, u) { for (let i = 0; i < 4; i++) { const on = i < n; person(110 + i * 62, 360, null, { s: 0.6, stroke: on ? INK : OFF, op: on ? 1 : 0.5 }); if (!on && dead) cross(110 + i * 62, 356, 10, pop(u, 0.2 + i * 0.15)); } mono(110, 412, 'consumers ' + n, { 'font-size': 15, 'font-weight': 800, fill: n ? GOOD : BAD }); }
  function alertPill(x, y, s, col, sc) { pill(x, y, s, col, sc, { fs: 14 }); }
  function s5(t, c) { const { k, u } = c;
    const upto = [1, 2, 3, 4, 5, 6][k]; chart(upto, k === 0 ? u : u);
    if (k === 0) { crew(0, true, u); alertPill(730, 90, 'NoConsumers · critical · FIRING', BAD, pop(u, 1.4)); alertPill(730, 140, 'QueueBacklog · pending', WARN, pop(u, 1.8));
      note(560, 210, 'for 3m 을 채운 순간 PagerDuty 호출', fade(u, 2.1), { fill: BAD, 'font-size': 14.5 }); note(560, 240, '120 → 3,400 (3분, 분당 약 1,100)', fade(u, 2.3), { 'font-size': 14, class: 'mono' }); return; }
    if (k === 1) { crew(0, false, u); terminal(540, 40, 400, 210, ['$ curl prometheus:9090/api/v1/query \\', '  --data-urlencode \'query=', '  consumers == 0 and ready > 0\'', '  | jq …', ['{ "queue": "order.events" }', '#4ade80']], lerp(0, 5, E(u, 0.2, 2.0)), { title: '경보와 같은 PromQL (출력 예시)', fs: 13.5 });
      note(560, 290, '대시보드를 열기 전에 API 로 바로 특정', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { crew(0, false, u); lbl(735, 60, 'rabbitmqctl list_queues', 1, { class: 'mono' });
      const cols = ['name', 'ready', 'unacked', 'consumers'], xs = [560, 700, 780, 870];
      cols.forEach((s, j) => mono(xs[j], 100, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': j ? 'middle' : 'start' }));
      el('rect', { x: 550, y: 116, width: 380, height: 34, rx: 6, fill: BADBG, opacity: fade(u, 0.6) });
      ['order.events', '3400', '0', '0'].forEach((s, j) => mono(xs[j], 139, s, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': j ? 'middle' : 'start', opacity: fade(u, 0.5 + j * 0.15) }));
      pill(640, 196, "awk '$4==0 && $2>0'", INFO, pop(u, 1.3), { mono: true, fs: 13.5 }); check(800, 196, 11, pop(u, 1.6));
      note(560, 250, '지표와 실측이 같다 → 브로커는 정상', fade(u, 1.9), { 'font-size': 14.5 }); note(560, 276, 'unacked 0 → 컨슈머가 완전히 죽었다', fade(u, 2.2), { fill: BAD, 'font-size': 14.5 }); return; }
    if (k === 3) { const back = E(u, 0.6, 1.6); crew(back > 0.5 ? 4 : 0, false, u);
      card(640, 90, 170, 50, { rx: 10, text: '새 버전', fs: 15, stroke: BAD, color: BAD, s: 1 }); cross(705, 90, 10, pop(u, 0.2));
      card(840, 90, 170, 50, { rx: 10, text: '직전 버전', fs: 15, stroke: GOOD, color: GOOD, s: pop(u, 0.5) });
      grow(725, 90, 752, 90, E(u, 0.4, 0.8), GOOD); mono(740, 140, 'rollout undo', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      alertPill(700, 200, 'NoConsumers · 풀림', GOOD, pop(u, 1.7)); alertPill(720, 246, 'QueueBacklog · FIRING', WARN, pop(u, 2.0));
      note(560, 290, '적체가 1000 아래로 빠져야 Backlog 도 풀린다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 4) { crew(4, false, u); const d = tween(0, 52, u, 1.4);
      tx(560, 80, 'deliver rate (rate 1m)', { 'font-size': 15, 'font-weight': 700 }); mono(560, 128, Math.round(d) + ' msg/s', { 'font-size': 30, 'font-weight': 800, fill: GOOD });
      hbar(560, 150, 300, d, 60, { col: GOOD, label: false, h: 14 });
      note(560, 220, '소비가 살아났다는 증거는 이 숫자다', fade(u, 1.8), { 'font-size': 14.5 }); alertPill(720, 270, 'QueueBacklog · 해소 중', WARN, pop(u, 2.1)); return; }
    crew(4, false, u); alertPill(700, 70, 'RESOLVED', GOOD, pop(u, 0.2)); mono(700, 118, 'ready 35 · deliver 48 msg/s', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.4) });
    ['노출', '수집', '대시보드', '경보', '런북'].forEach((s, i) => { const x = 590 + i * 74, y = 200 + (i % 2) * 64, sc = pop(u, 0.6 + i * 0.3);
      card(x, y, 66, 44, { rx: 8, text: s, fs: 14, stroke: ACC, fill: ACCBG, color: ACC, s: sc }); if (i < 4) grow(x + 33, y + (i % 2 ? -10 : 10), x + 41, y + (i % 2 ? -50 : 50), E(u, 0.9 + i * 0.3, 1.1 + i * 0.3), ACC, { plain: true }); });
    note(560, 330, '다섯 단계가 한 절차로 이어진다', fade(u, 2.3)); }

  const quiz = [
    { q: 'rabbitmq_prometheus 플러그인을 켜면 지표를 내보내는 곳은 어디인가?',
      o: [':15672/api/overview', ':15692/metrics', ':5672/metrics'], a: 1,
      why: '플러그인은 노드마다 15692 포트에 /metrics를 연다. 15672는 Management UI·API, 5672는 AMQP 포트다.' },
    { q: 'Prometheus가 RabbitMQ 지표를 모으는 방식은 무엇인가?',
      o: ['Prometheus가 target의 /metrics를 정해진 주기마다 가져간다', '브로커가 15초마다 Prometheus로 지표를 밀어 보낸다', 'Grafana가 브로커에서 읽어 Prometheus에 넣어 준다'], a: 0,
      why: 'Prometheus는 pull 방식이다. scrape_interval 15s마다 target 세 대의 /metrics를 HTTP GET 한다.' },
    { q: 'messages_ready가 120으로 늘었는데 messages_unacked는 18 그대로라면 무엇을 뜻하는가?',
      o: ['브로커 메모리 알람이 켜졌다', '컨슈머가 ack를 보내지 않아 메시지가 잠겨 있다', '아무도 가져가지 않은 메시지가 쌓이며 소비가 못 따라간다'], a: 2,
      why: 'ready는 아직 아무도 가져가지 않은 메시지, unacked는 처리 중인 메시지다. ready만 늘면 소비 속도가 유입을 못 따라가는 것이다.' },
    { q: 'RabbitMQNoConsumers 규칙에 ready > 0 조건을 and로 붙인 까닭은 무엇인가?',
      o: ['consumers 지표가 가끔 음수로 나와서', '메시지가 없는 유휴 큐에서 헛경보가 울리지 않게 하려고', 'for 3m 조건을 빼려고'], a: 1,
      why: '소비자가 0이어도 쌓인 메시지가 없으면 문제가 아니다. 두 조건을 함께 걸어야 컨슈머 장애만 잡힌다.' },
    { q: '컨슈머를 롤백한 뒤 복구가 끝났다고 판단할 근거는 무엇인가?',
      o: ['kubectl rollout undo 명령이 성공했다', 'NoConsumers 경보가 더 오지 않는다', 'deliver rate가 0에서 52 msg/s로 오르고 ready가 줄어든다'], a: 2,
      why: '재기동만으로는 알 수 없다. deliver rate가 살아나고 ready가 1000 아래로 내려가야 QueueBacklog까지 resolved 된다.' },
  ];

  const summary = [
    'rabbitmq_prometheus를 켜면 노드마다 15692 포트에 /metrics가 열린다.',
    'Prometheus가 15초마다 노드 세 대를 긁어 가고, 큐별 라벨은 /metrics/per-object에서 나온다.',
    'ready는 아무도 안 가져간 메시지, unacked는 처리 중인 메시지라서 따로 봐야 한다.',
    '경보는 조건이 for 동안 이어져야 울린다. consumers 0과 ready>0을 묶으면 컨슈머 장애가 잡힌다.',
  ];
  const review = [
    { q: 'Grafana에서 한 노드의 큐 지표만 갑자기 비었다. 먼저 볼 것은?',
      o: ['그 노드의 up{job="rabbitmq"}가 0인지', '대시보드 ID가 10991인지', 'messages_unacked가 0인지'], a: 0,
      why: 'scrape가 실패하면 그 노드 지표가 통째로 사라지고 up이 0이 된다. 노드 다운 경보도 이 값을 쓴다.' },
    { q: '큐별 적체 경보를 만들었는데 알림의 queue 자리가 비어서 온다. 의심할 것은?',
      o: ['for 5m이 너무 짧다', 'Alertmanager 주소가 틀렸다', '기본 /metrics를 긁고 있어 queue 라벨이 없다'], a: 2,
      why: '기본 /metrics는 모든 큐를 합친 집계값이라 queue 라벨이 없다. metrics_path를 /metrics/per-object로 바꾸면 큐마다 시계열이 생긴다.' },
    { q: '배포 뒤 consumers가 0이 되고 ready가 3분 만에 3,400이 됐다. 가장 먼저 할 일은?',
      o: ['원인 코드를 찾을 때까지 그대로 둔다', '컨슈머를 직전 버전으로 롤백한다', 'RabbitMQ 노드를 재시작한다'], a: 1,
      why: '지표와 list_queues가 같으면 브로커는 정상이고 컨슈머가 문제다. 분석보다 복구가 먼저라 롤백하고 deliver rate로 회복을 확인한다.' },
  ];

  R.page({ title: 'Prometheus 관측 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
