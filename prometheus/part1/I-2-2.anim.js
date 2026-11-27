/* I-2-2 Job과 relabel — 장면 4개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const JOBS = [{ name: 'api', col: ACC, iv: '15s', inst: ['api-1:9090', 'api-2:9090', 'api-3:9090'] }, { name: 'db', col: INFO, iv: '30s', inst: ['db-1:9187', 'db-2:9187'] }];
  const tag = (cx, cy, s, col, sc) => pill(cx, cy, s, col || GOOD, sc, { mono: true, fs: 13.5 });
  // job 상자: x, y, w, h, 진행 s(0→1)
  function box(x, y, w, h, s, col, name) { if (s <= 0) return;
    el('rect', { x, y, width: w * clamp(s), height: h, rx: 14, fill: SOFT, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': '8 5' });
    if (s > 0.8 && name) tag(x + tw(name, 13.5) / 2 + 30, y, name, col, 1); }
  function inst(cx, cy, n, s) { if (s <= 0) return; server(cx, cy, null, { s: 0.5 * s, lamp: GOOD }); if (s > 0.6) mono(cx, cy + 44, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }); }

  // ───────── 1. Job = 같은 종류 target 묶음 ─────────
  function s1(t, c) { const { k, u } = c;
    mono(40, 40, 'scrape_configs:', { 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { [0, 1].forEach((i) => el('rect', { x: 60 + i * 450, y: 70, width: 410 * E(u, 0.6 + i * 0.4, 1.2 + i * 0.4), height: 200, rx: 14, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 6' }));
      tx(480, 320, '이 아래에 job 목록이 배열로 들어간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    const sA = k === 1 ? E(u, 0.2, 0.9) : 1; box(60, 70, 410, 200, sA, ACC, 'job="api"');
    if (sA > 0.8) pill(400, 70, 'interval 15s', ACC, k === 1 ? pop(u, 1.0) : 1, { mono: true, fs: 13.5 });
    if (k >= 2) JOBS[0].inst.forEach((n, i) => inst(130 + i * 135, 160, n, k === 2 ? pop(u, 0.3 + i * 0.35) : 1));
    if (k >= 3) { const sB = k === 3 ? E(u, 0.2, 0.9) : 1; box(510, 70, 410, 200, sB, INFO, 'job="db"');
      if (sB > 0.8) { pill(850, 70, 'interval 30s', INFO, 1, { mono: true, fs: 13.5 }); JOBS[1].inst.forEach((n, i) => inst(630 + i * 170, 160, n, k === 3 ? pop(u, 0.6 + i * 0.35) : 1)); } }
    if (k === 2) tx(480, 320, 'targets 주소 하나 = instance 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
    if (k === 4) { let r = 0; JOBS.forEach((j) => j.inst.forEach((n) => { const y = 300 + r * 24, s = E(u, 0.2 + r * 0.3, 0.6 + r * 0.3), x = r < 3 ? 60 : 510, yy = r < 3 ? 300 + r * 26 : 300 + (r - 3) * 26;
      if (s > 0) spans(x, yy, [['{job=', { fill: MUT }], [`"${j.name}"`, { fill: j.col, 'font-weight': 800 }], [', instance=', { fill: MUT }], [`"${n}"`, { fill: GOOD, 'font-weight': 700 }], ['}', { fill: MUT }]], { 'font-size': 14, opacity: s }); r++; }));
      mono(720, 390, '시계열 5개를 가린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }
    if (k === 5) [['interval', '15s', '30s'], ['metrics_path', '/metrics', '/metrics'], ['scheme · TLS', 'http', 'http'], ['SD 방식', 'static', 'static']].forEach(([nm, a, b], i) => {
      const y = 306 + i * 28, op = fade(u, 0.3 + i * 0.35); tx(480, y, nm, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: op });
      mono(265, y, a, { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: op }); mono(715, y, b, { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: op }); }); }

  // ───────── 2. job label 로 나누기 ─────────
  const SER = [['api', 'api-1:9090', 1, '200'], ['api', 'api-2:9090', 1, '200'], ['api', 'api-3:9090', 1, '200'], ['db', 'db-1:9187', 1], ['db', 'db-2:9187', 0]];
  function srow(x, y, r, o) { o = o || {}; const op = o.op ?? 1, col = r[0] === 'api' ? ACC : INFO;
    el('rect', { x, y, width: o.w || 440, height: 36, rx: 6, fill: o.fill || PANEL, stroke: GRID, opacity: op });
    spans(x + 10, y + 24, [[o.name || 'http_requests_total', { 'font-weight': 700 }], ['{job=', { fill: MUT }], [`"${r[0]}"`, { fill: col, 'font-weight': 800 }], [`,instance="${r[1]}"}`, { fill: MUT }], [o.val != null ? '  ' + o.val : '', { fill: o.valCol || ACC, 'font-weight': 800 }]], { 'font-size': 13.5, opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { SER.forEach((r, i) => { const s = k === 0 ? E(u, 0.2 + i * 0.25, 0.5 + i * 0.25) : 1, keep = k === 0 || r[0] === 'api' || u < 0.8; if (s <= 0) return;
        srow(30, 70 + i * 50, r, { op: (keep ? 1 : 0.25) * s, name: r[0] === 'db' ? 'db_queries_total' : 'http_requests_total', fill: k === 1 && keep ? ACCBG : null }); });
      if (k === 0) { tx(720, 150, 'job_name에서 온 job 라벨이', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.5) }); tx(720, 176, '모든 시계열에 붙어 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); }
      if (k === 1) { mono(720, 150, '{job="api"}', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) }); sub(720, 186, '가장 먼저 거는 필터 · db는 빠진다', fade(u, 1.2), { 'font-size': 15 }); }
      return; }
    if (k === 2) { const m = E(u, 0.4, 1.4);
      if (m < 0.95) SER.slice(0, 3).forEach((r, i) => srow(30, lerp(70 + i * 50, 120, m), r, { op: 1 - m * 0.7 }));
      if (m > 0.95) { el('rect', { x: 30, y: 120, width: 440, height: 36, rx: 6, fill: ACCBG, stroke: ACC }); spans(40, 144, [['{job=', { fill: MUT }], ['"api"', { fill: ACC, 'font-weight': 800 }], ['}  312.4', { fill: ACC, 'font-weight': 800 }]], { 'font-size': 15 }); }
      mono(720, 110, 'sum by (job) (rate(…[5m]))', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      tx(720, 160, 'instance 3줄 → job 1줄', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.5) });
      sub(720, 190, '(312.4는 코드의 예시 출력)', fade(u, 1.8)); return; }
    if (k === 3) { SER.forEach((r, i) => srow(30, 60 + i * 46, r, { name: 'up', val: String(r[2]), valCol: r[2] ? GOOD : BAD, op: fade(u, 0.1 + i * 0.1) }));
      [['api', '(1+1+1)/3 = 1.0', GOOD, 120], ['db', '(1+0)/2 = 0.5', BAD, 230]].forEach(([j, s, col, y], i) => { const sc = pop(u, 1.0 + i * 0.5);
        card(720, y, 340, 60, { rx: 10, stroke: col, sw: 2.2, s: sc }); if (sc > 0.6) { mono(720, y - 4, `{job="${j}"}`, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); mono(720, y + 18, s, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col }); } });
      sub(720, 300, 'db는 2대 중 1대가 죽었다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 4) { mono(30, 50, 'sum by (job, status) (rate(http_requests_total[5m]))', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      card(160, 160, 220, 50, { rx: 10, stroke: ACC, sw: 2, text: '{job="api"}', fs: 15, mono: true });
      [['200', GOOD], ['500', BAD]].forEach(([s, col], i) => { const y = 120 + i * 90, f = E(u, 0.5 + i * 0.3, 1.1 + i * 0.3);
        grow(270, 160, 270 + 130 * f, y, f, MUT, { plain: true });
        if (f > 0.9) card(560, y, 300, 50, { rx: 10, stroke: col, sw: 2, text: `{job="api", status="${s}"}`, fs: 14.5, mono: true }); });
      tx(480, 330, 'by에 라벨을 하나 더 넣으면 결과 줄이 늘어난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k5 에러율
    mono(480, 80, 'sum by (job) (rate(…{status=~"5.."}[5m]))', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.2) });
    el('line', { x1: 160, y1: 110, x2: 160 + 640 * E(u, 0.6, 1.2), y2: 110, stroke: INK, 'stroke-width': 2.5 });
    mono(480, 146, 'sum by (job) (rate(…[5m]))', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
    [['분자', '{job="api"}', BAD, 230], ['분모', '{job="api"}', ACC, 290]].forEach(([nm, j, col, y], i) => { tx(220, y, nm, { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.3 + i * 0.2) });
      mono(300, y, j, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.3 + i * 0.2) }); });
    grow(470, 236, 600, 260, E(u, 1.7, 2.1), MUT); grow(470, 284, 600, 262, E(u, 1.7, 2.1), MUT);
    card(720, 260, 220, 56, { rx: 10, stroke: GOOD, sw: 2.2, s: pop(u, 2.1), text: 'job별 에러율', fs: 16 });
    sub(480, 370, '양쪽 다 by (job)이라 같은 job끼리 저절로 짝지어진다', fade(u, 2.3), { 'font-size': 15 }); }

  // ───────── 3. relabel ─────────
  const L0 = [['__meta_kubernetes_namespace', '"prod"'], ['__meta_kubernetes_pod_name', '"api-7f8"'], ['__meta_kubernetes_pod_annotation_prometheus_io_scrape', '"true"'], ['__meta_kubernetes_pod_label_app', '"api"'], ['job', '"api"']];
  const PODS = [['api-7f8', 'prod', 'true'], ['worker-2c1', 'prod', 'false'], ['coredns-5d9', 'kube-system', 'true']];
  // 라벨 카드: rows [[k, v, o]] o = {hi, add, gone}
  function labels(x, y, rows, o) { o = o || {}; el('rect', { x, y, width: 560, height: 30 + rows.length * 30, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 14, y + 20, o.title || 'target api-7f8의 라벨', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    rows.forEach(([kk, v, ro], i) => { ro = ro || {}; const yy = y + 30 + i * 30, s = ro.s ?? 1; if (s <= 0) return;
      if (ro.hi || ro.add) el('rect', { x: x + 6, y: yy + 2, width: 548 * clamp(s), height: 26, rx: 5, fill: ro.add ? C.GOODBG : ACCBG });
      spans(x + 14, yy + 21, [[kk, { fill: ro.gone ? OFF : ro.add ? GOOD : kk.startsWith('__') ? MUT : INK, 'font-weight': ro.add || !kk.startsWith('__') ? 700 : 400 }], ['=' + v, { fill: ro.gone ? OFF : INFO }]], { 'font-size': 13.5, opacity: s, 'text-decoration': ro.gone ? 'line-through' : null }); }); }
  function pods(k, u) { PODS.forEach(([n, ns, sc], i) => { const y = 90 + i * 88, gone = (i === 1 && k >= 2) || (i === 2 && k >= 6), justGone = (i === 1 && k === 2) || (i === 2 && k === 6);
      const op = gone ? (justGone ? 1 - 0.7 * E(u, 1.2, 2.0) : 0.3) : 1;
      card(800, y, 250, 68, { rx: 10, stroke: i === 0 ? ACC : GRID, sw: 2, op });
      mono(690, y - 8, n, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(690, y + 18, `ns=${ns} · scrape=${sc}`, { 'font-size': 13.5, fill: MUT, opacity: op });
      if (gone && (!justGone || u > 1.0)) cross(905, y, 11); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const st = ['SD', 'relabel', 'scrape', 'metric_relabel', '저장'], xs = st.map((_, i) => 110 + i * 185);
      st.forEach((s, i) => card(xs[i], 160, 160, 60, { rx: 12, stroke: i === 1 ? ACC : GRID, sw: i === 1 ? 2.8 : 1.8, s: pop(u, 0.2 + i * 0.25), text: s, fs: 16, mono: true, color: i === 1 ? ACC : INK }));
      dot(xs.map((x) => [x, 160]), seg(u, 1.4, 2.6), ACC, 8);
      tx(xs[1], 230, '여기서 target 라벨을 가공', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      sub(480, 320, 'scrape 전에 target을 고르고 라벨을 바꾼다', fade(u, 2.0), { 'font-size': 15 }); return; }
    pods(k, u);
    tx(800, 380, '(Pod 이름은 예시)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    const rows = L0.map(([a, b], i) => [a, b, { s: k === 1 ? E(u, 0.3 + i * 0.25, 0.7 + i * 0.25) : 1, hi: (k === 2 && i === 2) || (k === 3 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 3), gone: k === 7 && a.startsWith('__') }]);
    const add = [];
    if (k >= 3) add.push(['ns', '"prod"', { add: true, s: k === 3 ? E(u, 0.8, 1.3) : 1, hi: k === 6 }]);
    if (k >= 4) add.push(['pod', '"api-7f8"', { add: true, s: k === 4 ? E(u, 0.8, 1.3) : 1 }]);
    if (k >= 5) add.push(['app', '"api"', { add: true, s: k === 5 ? E(u, 0.8, 1.3) : 1 }]);
    if (k === 7) { const fin = [['job', '"api"', {}], ...add.map(([a, b]) => [a, b, { add: true }])];
      labels(40, 40, rows, { title: 'relabel 전 → 회색 줄은 저장되지 않는다' });
      labels(40, 250, fin.map(([a, b, o], i) => [a, b, { ...o, s: E(u, 0.8 + i * 0.25, 1.2 + i * 0.25) }]), { title: '저장되는 라벨 (instance는 __address__에서 온다)' }); return; }
    labels(40, 40, rows.concat(add));
    const rule = { 1: ['kubernetes_sd_configs', '라벨 __meta_* 가 딸려 온다', MUT], 2: ['① action: keep  regex: "true"', 'scrape=false인 Pod는 통째로 버린다', ACC], 3: ['② replace → target_label: ns', 'namespace 값을 ns로 복사', GOOD],
      4: ['③ action 생략 = replace → pod', 'pod 이름이 pod 라벨로', GOOD], 5: ['④ labelmap  __meta_kubernetes_pod_label_(.+)', '캡처한 이름 그대로 app 라벨', GOOD], 6: ['⑤ source_labels: [ns]  drop', '②가 만든 ns를 다시 읽어 kube-system 제외', BAD] }[k];
    mono(40, 330, rule[0], { 'font-size': 15, 'font-weight': 800, fill: rule[2], opacity: fade(u, 0.2) });
    tx(40, 360, rule[1], { 'font-size': 15, fill: INK, opacity: fade(u, 0.6) }); }

  // ───────── 4. job 나누기 가이드 ─────────
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { box(40, 60, 880, 260, k === 0 ? E(u, 0.2, 0.9) : 1, ACC, 'job="api"');
      const T = [['api-prod-1:9090', 'prod'], ['api-prod-2:9090', 'prod'], ['api-staging-1:9090', 'staging']];
      T.forEach(([n, env], i) => { const cx = 170 + i * 300 + (i === 2 ? 40 : 0); inst(cx, 160, n, k === 0 ? pop(u, 0.8 + i * 0.3) : 1);
        if (k === 1) tag(cx, 250, `env="${env}"`, env === 'prod' ? GOOD : WARN, pop(u, 0.3 + i * 0.3)); });
      if (k === 1) el('line', { x1: 660, y1: 90, x2: 660, y2: 300, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
      tx(480, 370, k === 0 ? '같은 앱이 환경만 다르면 job은 하나로 둔다' : 'job은 그대로, env 라벨로 차원만 늘린다 · sum by (job) 유지', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k <= 3) { box(40, 60, 420, 220, k === 2 ? E(u, 0.2, 0.9) : 1, INFO, 'job="node"');
      ['node-1:9100', 'node-2:9100'].forEach((n, i) => inst(150 + i * 200, 160, n, k === 2 ? pop(u, 0.8 + i * 0.3) : 1));
      if (k === 2) tx(480, 340, '수집 대상의 종류가 다르면 job을 따로 뺀다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      if (k === 3) { box(500, 60, 420, 220, E(u, 0.2, 0.9), WARN, 'job="cadvisor"');
        ['node-1:8080', 'node-2:8080'].forEach((n, i) => inst(610 + i * 200, 160, n, pop(u, 0.8 + i * 0.3)));
        tx(480, 330, '같은 node-1 호스트라도 포트 9100과 8080은', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.6) });
        tx(480, 356, '메트릭 종류가 달라 job이 다르다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 4) { box(40, 60, 520, 260, E(u, 0.2, 0.9), WARN, 'job="external-https"');
      inst(300, 150, 'external.example.com', pop(u, 0.6));
      [['scheme: https', 0.9], ['metrics_path: /probe', 1.2], ['tls_config.ca_file', 1.5]].forEach(([s, a], i) => pill(760, 110 + i * 70, s, WARN, pop(u, a), { mono: true, fs: 15 }));
      tx(480, 370, '이 셋은 job 단위 설정이라, 다르면 job을 나눌 수밖에 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { box(40, 60, 880, 240, E(u, 0.2, 0.9), BAD, 'job="everything"');
      [['api-1:9090', 130], ['node-1:9100', 330], ['db-1:9187', 530], ['external…', 730]].forEach(([n, x], i) => inst(x + 30, 150, n, pop(u, 0.6 + i * 0.2)));
      [['interval 하나뿐', 0], ['path 하나뿐', 1], ['TLS 하나뿐', 2]].forEach(([s, i]) => { const sc = pop(u, 1.4 + i * 0.25); pill(220 + i * 260, 260, s, BAD, sc, { fs: 14.5 }); });
      tx(480, 360, '설정을 나눌 수 없고 job 라벨도 뜻을 잃는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    // k6 인스턴스마다 job
    ['api-1', 'api-2', 'api-3'].forEach((n, i) => { const x = 40 + i * 300; box(x, 60, 270, 170, pop(u, 0.2 + i * 0.25), BAD, `job="${n}"`); inst(x + 135, 140, n + ':9090', pop(u, 0.5 + i * 0.25)); });
    mono(250, 290, 'sum by (job) → 3줄', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3), 'text-anchor': 'middle' });
    sub(250, 316, '묶음이 사라져 합칠 것이 없다', fade(u, 1.5), { 'font-size': 14.5 });
    mono(700, 290, '알람 룰 × 3', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8), 'text-anchor': 'middle' });
    sub(700, 316, '인스턴스가 늘 때마다 룰도 는다', fade(u, 2.0), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'job "api"의 targets에 주소 3개를 적었다. 이 job에서 생기는 instance는 몇 개인가?',
      o: ['1개', '3개', '주소 수와 상관없이 job마다 2개'], a: 1,
      why: 'targets에 적은 주소 하나가 instance 하나다. 세 대 모두 job="api"를 공유하고 instance 라벨로 갈린다.' },
    { q: 'avg by (job) (up) 결과가 {job="db"} 0.5로 나왔다. 무슨 뜻인가?',
      o: ['db job 2대 중 1대가 죽었다', 'db의 응답이 0.5초 걸렸다', 'db job의 scrape 주기가 절반이다'], a: 0,
      why: 'up은 대마다 1 또는 0이므로 평균이 살아 있는 비율이다. (1 + 0) / 2 = 0.5다.' },
    { q: 'relabel_configs의 ⑤ drop 규칙이 source_labels: [ns]를 읽을 수 있는 이유는 무엇인가?',
      o: ['ns가 Kubernetes가 원래 주는 라벨이라서', '규칙이 아래에서 위로 실행되어서', '앞의 ② replace가 이미 ns를 만들어 두었고 규칙은 위에서 아래로 쌓이기 때문이다'], a: 2,
      why: 'relabel 규칙은 순서대로 적용되고 앞 규칙이 만든 라벨을 뒤 규칙이 읽는다. ns는 ②가 namespace에서 복사한 것이다.' },
    { q: '같은 node-1 호스트의 node exporter(9100)와 cadvisor(8080)를 어떻게 묶나?',
      o: ['호스트가 같으니 job 하나로 묶는다', '메트릭 종류가 다르니 job을 나눈다', 'instance마다 job을 하나씩 만든다'], a: 1,
      why: '같은 호스트라도 내보내는 메트릭이 다르면 다른 종류의 target이다. node와 cadvisor를 별도 job으로 둔다.' },
  ];

  const summary = [
    'job은 같은 종류의 target 묶음이고, 그 안의 주소 하나하나가 instance다.',
    '모든 시계열에 job이 붙어서 {job="api"} 필터와 sum by (job) 집계가 바로 된다.',
    'relabel_configs는 scrape 전에 규칙을 위에서 아래로 적용하고, __meta_ 라벨은 저장하지 않는다.',
    '환경 차이는 라벨로 나누고, 종류나 scheme·path·TLS가 다르면 job을 나눈다.',
  ];
  const review = [
    { q: 'prod와 staging의 api를 job "api-prod"와 "api-staging"으로 나눴더니 대시보드 쿼리가 두 배로 늘었다. 더 나은 방법은?',
      o: ['job "api" 하나에 static_configs를 나누고 env 라벨을 붙인다', '두 환경을 instance 하나로 합친다', 'relabel로 job 라벨을 지운다'], a: 0,
      why: '같은 앱이면 job은 하나로 두고 env 라벨로 가른다. sum by (job)은 그대로 쓰고 필요할 때만 env로 쪼갠다.' },
    { q: 'Kubernetes에서 kube-system Pod까지 수집되어 시계열이 너무 많다. relabel_configs에 넣을 규칙은?',
      o: ['labelmap으로 Pod 라벨을 전부 복사한다', 'namespace를 담은 라벨이 kube-system이면 action: drop', 'scrape_interval을 60s로 늘린다'], a: 1,
      why: 'drop은 regex에 맞는 target을 scrape 전에 버린다. 주기를 늘려도 시계열 수 자체는 줄지 않는다.' },
    { q: '저장된 메트릭에서 __meta_kubernetes_pod_name으로 필터하려 했더니 결과가 비었다. 이유는?',
      o: ['Pod 이름이 바뀌었기 때문이다', 'PromQL은 밑줄로 시작하는 이름을 못 읽기 때문이다', '__로 시작하는 라벨은 relabel이 끝나면 지워져 저장되지 않기 때문이다'], a: 2,
      why: '__meta_ 라벨은 relabel 단계에서만 쓸 수 있다. 남기려면 replace로 pod 같은 일반 라벨에 복사해 둬야 한다.' },
  ];

  R.page({ title: 'Job과 relabel', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
