/* V-2-1 Prometheus + Grafana 모니터링 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── 지표 패널 (페이지 데이터 metrics 의 series·value·threshold·state 를 그대로 그린다) ──
  const MET = [['cpu', 'CPU', 100], ['mem', '메모리', 100], ['rps', '요청/초', 700], ['err', '5xx 에러율', 5]];
  const SC = { good: GOOD, info: INFO, warn: WARN, crit: BAD, unknown: OFF };
  const fmt = (key, v) => (typeof v !== 'number' ? '?' : key === 'rps' ? String(Math.round(v)) : key === 'err' ? (Math.round(v * 100) / 100).toFixed(v < 1 && Math.round(v * 100) % 10 ? 2 : 1) + '%' : Math.round(v) + '%');
  function panel(x, y, w, h, key, c, o) { o = o || {}; const [, name, max] = MET.find((m) => m[0] === key), m = c.beat.metrics[key], pm = c.prev && c.prev.metrics[key], u = c.u;
    const none = m.visibility === 'none', col = SC[m.state] || INK;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: none ? (m.state === 'unknown' ? GRID : col) : col === GOOD || col === INFO ? GRID : col, 'stroke-width': none ? 1.8 : col === BAD ? 2.6 : 1.8, 'stroke-dasharray': none ? '6 5' : null });
    tx(x + 12, y + 22, name, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const pv = pm && typeof pm.value === 'number' && typeof m.value === 'number' ? pm.value : null, v = typeof m.value === 'number' ? tween(pv, m.value, u) : m.value;
    mono(x + w - 12, y + 24, fmt(key, v), { 'font-size': o.big ? 22 : 18, 'font-weight': 800, fill: none ? (m.state === 'unknown' ? OFF : col) : col, 'text-anchor': 'end' });
    const gx = x + 12, gw = w - 24, gy = y + 36, gh = h - 46;
    if (none) { el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 5' }); return; }
    const was = pm && pm.visibility !== 'none' ? pm.series : null, grow0 = was ? 1 : E(u, o.at ?? 0.2, (o.at ?? 0.2) + 1.4);
    const ser = m.series.map((s, i) => (was ? lerp(was[i], s, E(u, 0.1, 1.3)) : s));
    const X = (i) => gx + (gw * i) / (ser.length - 1), Y = (v) => gy + gh - gh * clamp(v / max);
    if (m.threshold != null) { el('line', { x1: gx, y1: Y(m.threshold), x2: gx + gw, y2: Y(m.threshold), stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: 0.8 }); }
    const n = Math.max(2, Math.ceil(ser.length * grow0)), p = ser.slice(0, n).map((v, i) => `${X(i)},${Y(v)}`).join(' ');
    el('polyline', { points: p, fill: 'none', stroke: col === OFF ? INK : col, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }); }
  // 아래 줄 패널 4개
  function row4(c, y, h, o) { o = o || {}; const w = 214, g = 14, x0 = 480 - (4 * w + 3 * g) / 2;
    MET.forEach(([k], i) => panel(x0 + i * (w + g), y, w, h, k, c, { at: (o.at || 0.2) + (o.stag ? i * 0.3 : 0) })); }

  // 1. 모니터링 부재
  function s1(t, c) { const { k, u } = c;
    row4(c, 26, 120);
    if (k === 0) { terminal(40, 178, 520, 200, ['$ kubectl top nodes', ['error: Metrics API not available', 'var(--bad)'], '', '$ kubectl top pods', ['error: Metrics API not available', 'var(--bad)']], 1 + 4 * E(u, 0.2, 1.8), { title: 'zsh', fs: 14 });
      tx(740, 260, '수집기가 없으면', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) }); tx(740, 290, '지표 자체가 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); return; }
    // 시간축 09:30 ~ 10:05 (페이지의 신고 시각과 T+30분)
    const ax = 70, aw = 820, ay = 330, T = (m) => ax + aw * (m - 30) / 35;
    if (k <= 2) { el('line', { x1: ax, y1: ay, x2: ax + aw, y2: ay, stroke: MUT, 'stroke-width': 2 });
      [30, 35, 40, 45, 50, 55, 60, 65].forEach((m) => { el('line', { x1: T(m), y1: ay - 4, x2: T(m), y2: ay + 4, stroke: MUT }); mono(T(m), ay + 22, m < 60 ? `09:${m}` : `10:0${m - 60}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      [[32, '사이트 너무 느려요'], [35, '500 에러 떠요'], [40, '결제가 안 돼요']].forEach(([m, s], i) => { const sc = k === 1 ? pop(u, 0.3 + i * 0.5) : 1, y = 200 + i * 34;
        person(T(m), ay - 30, null, { s: 0.55 * sc }); card(T(m) + 14 + tw(s, 14) / 2, y, tw(s, 14) + 24, 28, { rx: 14, stroke: WARN, sw: 1.8, text: s, fs: 14, s: sc }); el('line', { x1: T(m), y1: ay - 46, x2: T(m) + 10, y2: y + 14, stroke: WARN, 'stroke-width': 1.5, opacity: sc }); }); }
    if (k === 2) { const d = T(62), o = T(57);
      el('rect', { x: T(32), y: ay - 8, width: lerp(0, d - T(32), E(u, 0.2, 1.4)), height: 8, rx: 3, fill: BAD, opacity: 0.5 });
      mono((T(32) + d) / 2, ay - 16, '30분', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      pill(d, 186, 'describe', INK, pop(u, 1.4), { mono: true, fs: 13.5 }); el('line', { x1: d, y1: 200, x2: d, y2: ay, stroke: INK, 'stroke-width': 1.5, opacity: fade(u, 1.4) });
      pill(o - 10, 236, 'OOMKilled', BAD, pop(u, 1.8), { mono: true, fs: 13.5 }); el('line', { x1: o, y1: 250, x2: o, y2: ay, stroke: BAD, 'stroke-width': 1.5, opacity: fade(u, 1.8) }); }
    if (k === 3) { [['CPU', '노드 100% 점유?'], ['메모리', 'OOM 직전?'], ['요청/초', '트래픽 폭주?'], ['5xx 에러율', '5xx 비율 급등?']].forEach(([a, b], i) => {
        const x = 128 + i * 228, s = pop(u, 0.2 + i * 0.3); card(x, 250, 200, 90, { rx: 12, stroke: ACC, sw: 2.2, s });
        tx(x, 240, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: s }); tx(x, 266, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: s }); });
      tx(480, 360, '이 네 개가 있었으면 30분 먼저 알았다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); } }

  // 2. Prometheus 도입 — Pull 로 긁는다
  const PX = 470, PY = 120;
  function prom(o) { o = o || {}; card(PX, PY, 170, 56, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, text: 'Prometheus', fs: 16, color: ACC, s: o.s });
    dbIcon(PX + 150, PY + 6, null, { s: 0.5, stroke: INFO, op: o.s }); tx(PX + 150, PY + 52, 'TSDB', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: o.s ?? 1 }); }
  function s2(t, c) { const { k, u } = c;
    row4(c, 268, 136, { stag: k === 1 || k === 2 });
    if (k === 0) { zone(60, 26, 840, 210, 'namespace monitoring  ·  helm install prom kube-prometheus-stack', { fill: SOFT });
      ['Prometheus Operator', 'Prometheus 서버', 'Alertmanager', 'Grafana', 'node-exporter', 'kube-state-metrics'].forEach((s, i) => { const x = 210 + (i % 3) * 270, y = 104 + Math.floor(i / 3) * 76;
        card(x, y, 230, 52, { rx: 10, stroke: i === 1 ? ACC : GRID, sw: 2, text: s, fs: 15, s: pop(u, 0.3 + i * 0.25) }); });
      return; }
    prom({});
    if (k === 1) { ['node-1', 'node-2', 'node-3'].forEach((n, i) => { const x = 130 + i * 0, y = 40 + i * 66; card(x, y + 20, 160, 48, { rx: 8, stroke: GRID, sw: 1.8, text: n + ' · exporter', fs: 13.5, mono: true });
        grow(212, y + 20, PX - 88, PY, E(u, 0.2 + i * 0.2, 0.8 + i * 0.2), MUT); });
      tx(780, 110, 'TSDB 보관 (차트 기본 10일)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1) });
      tx(780, 140, '노드 CPU · 메모리부터', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    if (k === 2) { card(150, 120, 190, 70, { rx: 10, stroke: INK, sw: 2, text: '앱 Pod\nGET /metrics', fs: 14.5 });
      el('rect', { x: 620, y: 30, width: 320, height: 104, rx: 8, fill: SOFT, stroke: GRID });
      ['http_requests_total{status="200"} 14392', 'http_requests_total{status="500"} 17', 'process_resident_memory_bytes …'].forEach((s, i) => mono(632, 58 + i * 28, s, { 'font-size': 13.5, fill: i === 1 ? BAD : INK, opacity: fade(u, 0.4 + i * 0.3) }));
      tx(780, 160, '/metrics 응답 예시 (텍스트)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
      grow(PX - 88, PY, 248, 120, E(u, 0.2, 0.8), ACC); }
    if (k === 3) { const pods = [[130, 50], [130, 120], [130, 190]];
      pods.forEach(([x, y], i) => { card(x, y, 150, 44, { rx: 8, stroke: i === 2 ? BAD : INK, sw: 2, text: 'Pod :9100', fs: 14, mono: true });
        const pr = [[PX - 88, PY], [x + 78, y]], ph = (t * 0.6 + i * 0.33) % 1;
        el('line', { x1: PX - 88, y1: PY, x2: x + 78, y2: y, stroke: GRID, 'stroke-width': 2 });
        if (i < 2) { dot(pr, ph < 0.5 ? ph * 2 : -1, ACC, 6); dot(pr.slice().reverse(), ph >= 0.5 ? (ph - 0.5) * 2 : -1, INFO, 6); } });
      cross(130 + 92, 190, 10, pop(u, 0.8)); tx(780, 110, 'Prometheus가 직접 GET', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      tx(780, 140, '긁기 실패도 기록되는 신호다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, opacity: fade(u, 1) });
      tx(780, 196, 'scrape 주기: 차트 기본 30s', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono', opacity: fade(u, 1.4) }); } }

  // 3. ServiceMonitor — 라벨로 찾는다
  function s3(t, c) { const { k, u } = c;
    row4(c, 300, 104);
    // 왼쪽: ServiceMonitor
    card(150, 120, 230, 150, { rx: 12, stroke: ACC, sw: 2.5, fill: PANEL });
    tx(50, 66, 'ServiceMonitor', { 'font-size': 15, 'font-weight': 800, fill: ACC }); mono(50, 92, 'web-monitor', { 'font-size': 14 });
    const fl = [['release: prom', 0, WARN], ['matchLabels app: web', 1, ACC], ['port: metrics · 15s', 2, INFO]];
    fl.forEach(([s, kk, col], i) => { if (k < kk) return; pill(150, 124 + i * 40, s, col, k === kk ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 }); });
    if (k === 0) { card(150, 250, 210, 44, { rx: 22, stroke: WARN, sw: 2, text: 'Operator가 발견', fs: 14.5, s: pop(u, 0.9) }); grow(150, 228, 150, 150, E(u, 1.1, 1.6), WARN);
      tx(600, 140, '라벨 release: prom이 없으면', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.4) }); tx(600, 168, '조용히 무시된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); return; }
    // 오른쪽: 네임스페이스와 Service
    const NS = [['default', [['web', 'app: web', true], ['api', 'app: api', false]]], ['prod', [['web', 'app: web', true]]]];
    let row = 0; const pts = [];
    NS.forEach(([ns, svcs], j) => { const y0 = 34 + j * 136; zone(330, y0, 600, svcs.length * 56 + 34, 'namespace ' + ns, { fill: SOFT });
      svcs.forEach(([n, l, ok], i) => { const y = y0 + 52 + i * 56, on = ok && k >= 1;
        card(450, y, 170, 42, { rx: 8, stroke: on ? GOOD : GRID, sw: 2, text: 'Service ' + n, fs: 14, color: ok ? INK : MUT });
        pill(610, y, l, on ? GOOD : OFF, k === 3 && ok ? 1 + 0.1 * Math.sin(t * 6) : 1, { mono: true, fs: 13.5 });
        const np = ok ? (k === 4 ? Math.round(lerp(2, 9, E(u, 0.3, 2))) : 2) : 2;
        for (let p = 0; p < np; p++) { const px = 700 + (p % 9) * 24, on2 = ok && k >= 2;
          el('circle', { cx: px, cy: y, r: 8, fill: on2 ? ACCBG : PANEL, stroke: on2 ? ACC : GRID, 'stroke-width': 2, opacity: k === 4 && p >= 2 ? fade(u, 0.3 + p * 0.2) : 1 }); }
        if (ok) pts.push([365, y]); else if (k >= 1) cross(372, y, 8, pop(u, 0.8)); }); });
    if (k >= 1) pts.forEach(([x, y], i) => { el('path', { d: `M265,${120 + 40 * 1} C 300,${120 + 40} 320,${y} ${x},${y}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, pathLength: 1, 'stroke-dasharray': `${k === 1 ? E(u, 0.3 + i * 0.3, 1 + i * 0.3) : 1} 1` }); });
    if (k === 2) { for (let i = 0; i < 4; i++) dot([[265, 204], [700, 86 + (i % 2) * 136]], (t * 0.5 + i / 4) % 1, INFO, 5); }
    if (k === 3) { el('rect', { x: 560, y: 34, width: 0, height: 0 }); mono(560, 278, 'Service 쪽에도 app: web 라벨과 이름이 metrics인 포트(9100)', { 'font-size': 13.5, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); }
    if (k === 4) mono(560, 278, 'Pod가 2개든 200개든 ServiceMonitor는 하나', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1) }); }

  // 4. PromQL
  function s4(t, c) { const { k, u } = c;
    row4(c, 300, 104);
    const box = (s) => { el('rect', { x: 40, y: 22, width: 880, height: 40, rx: 8, fill: INK }); mono(56, 48, s, { 'font-size': 14.5, fill: 'var(--term)' }); };
    if (k === 0) { box('sum(rate(http_requests_total[5m])) by (service)');
      const a1 = R.axes(80, 96, 300, 150, { x: [0, 10], y: [0, 10], xl: '시간', yl: '누적 카운터' }), cum = [[0, 0.5], [2, 2], [4, 3.6], [6, 5.6], [8, 7.6], [10, 9.6]];
      R.line(a1, cum, E(u, 0.2, 1.2), INK);
      grow(420, 170, 520, 170, E(u, 1.2, 1.6), ACC); pill(470, 150, 'rate()', ACC, pop(u, 1.3), { mono: true, fs: 14 });
      const a2 = R.axes(580, 96, 300, 150, { x: [0, 10], y: [0, 10], xl: '시간', yl: '초당 증가량' });
      R.line(a2, [[0, 4], [2, 4.6], [4, 4.2], [6, 5.4], [8, 5.6], [10, 6.4]], E(u, 1.6, 2.5), ACC);
      sub(480, 290, '그래프 모양은 설명용 예시', fade(u, 2), {}); return; }
    if (k === 1) { box('sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(…[5m])) * 100');
      for (let i = 0; i < 18; i++) { const bad = i % 9 === 4; dot([[80, 120 + (i % 3) * 30], [400, 160]], (t * 0.4 + i / 18) % 1, bad ? BAD : OFF, 5); }
      card(470, 160, 140, 50, { rx: 10, stroke: INK, sw: 2, text: '5xx ÷ 전체', fs: 15 });
      const v = tween(c.prev.metrics.err.value, c.beat.metrics.err.value, u), bx = 580, bw = 320, max = 2;
      el('rect', { x: bx, y: 148, width: bw, height: 24, rx: 6, fill: SOFT }); el('rect', { x: bx, y: 148, width: bw * v / max, height: 24, rx: 6, fill: WARN });
      el('line', { x1: bx + bw / 2, y1: 136, x2: bx + bw / 2, y2: 184, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 3' }); mono(bx + bw / 2, 204, '임계 1%', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle' });
      mono(bx + bw * v / max, 130, fmt('err', v), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
      tx(480, 260, '비율이라 트래픽이 늘어도 같은 기준으로 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { box('sum(rate(container_cpu_usage_seconds_total{namespace="prod", container!=""}[5m])) by (pod)');
      const S = [['pod="web-aa1", container="app"', true], ['pod="web-aa1", container=""', false], ['pod="web-bb2", container="app"', true], ['pod="web-bb2", container=""', false]];
      S.forEach(([s, ok], i) => { const y = 100 + i * 42; mono(60, y, '{' + s + '}', { 'font-size': 13.5, fill: ok ? INK : OFF, opacity: fade(u, 0.2 + i * 0.15), 'text-decoration': ok ? null : 'line-through' });
        if (ok) grow(400, y - 5, 560, 120 + (i > 1 ? 90 : 0), E(u, 0.9 + i * 0.1, 1.5 + i * 0.1), ACC); });
      ['web-aa1', 'web-bb2'].forEach((p, i) => card(660, 120 + i * 90, 190, 48, { rx: 10, stroke: ACC, sw: 2, text: 'by pod: ' + p, fs: 14, mono: true, s: pop(u, 1.4 + i * 0.2) }));
      sub(230, 280, 'container="" 는 Pod 전체 합계 줄이라 빼야 두 번 안 센다', fade(u, 0.8), { 'font-size': 13.5 }); return; }
    if (k === 3) { box('sum(container_memory_working_set_bytes{namespace="prod", container!=""}) by (pod) / 1024 / 1024');
      card(180, 160, 220, 70, { rx: 10, stroke: INK, sw: 2, text: 'working set\n지금 쓰는 양 (게이지)', fs: 14.5 }); pill(180, 230, 'rate() 없이 그대로', MUT, pop(u, 0.6), { fs: 13.5 });
      grow(300, 160, 420, 160, E(u, 0.6, 1.1), ACC); mono(560, 150, 'bytes ÷ 1024 ÷ 1024', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1) }); mono(560, 182, '= Mi', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(800, 160, '카운터만 rate()', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { box('histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))');
      const bins = [30, 26, 18, 10, 6, 3, 2, 1.5, 1, 0.8], bx = 90, bw = 60;
      bins.forEach((h, i) => { const hh = 160 * (h / 30) * E(u, 0.2 + i * 0.08, 0.8 + i * 0.08); el('rect', { x: bx + i * (bw + 8), y: 260 - hh, width: bw, height: hh, rx: 4, fill: i >= 8 ? BAD : ACC, opacity: 0.75 }); });
      el('line', { x1: bx + 2 * (bw + 8), y1: 80, x2: bx + 2 * (bw + 8), y2: 266, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '4 3', opacity: fade(u, 1.2) }); mono(bx + 2 * (bw + 8), 76, '평균', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) });
      el('line', { x1: bx + 8.5 * (bw + 8), y1: 80, x2: bx + 8.5 * (bw + 8), y2: 266, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.6) }); mono(bx + 8.5 * (bw + 8), 76, 'p99', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      tx(bx, 288, '응답 시간 →  (bucket 분포는 설명용 예시)', { 'font-size': 13.5, fill: MUT }); return; }
    [['rate()', '카운터 → 초당 증가율'], ['sum() by ()', '라벨로 묶어 합치기'], ['histogram_quantile()', 'bucket → 백분위']].forEach(([a, b], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3);
      card(x, 150, 280, 100, { rx: 12, stroke: ACC, sw: 2.2, s }); mono(x, 140, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: s }); tx(x, 170, b, { 'text-anchor': 'middle', 'font-size': 14.5, opacity: s }); });
    tx(480, 262, '대시보드 대부분이 이 셋으로 그려진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); }

  // 5. Grafana 대시보드 — gridPos 24칸
  function s5(t, c) { const { k, u } = c;
    const fx = 40, fy = 58, fw = 880, fh = 340, cw = fw / 24, rh = fh / 16;
    el('rect', { x: fx - 10, y: 14, width: fw + 20, height: fh + 56, rx: 12, fill: SOFT });
    tx(fx, 40, 'K8s Production Overview', { 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.2) : 1 });
    pill(fx + fw - 80, 34, '⟳ 30s', INFO, k === 0 ? pop(u, 0.6) : 1, { mono: true, fs: 13.5 });
    for (let i = 0; i <= 24; i += 2) { const op = k === 0 ? fade(u, 0.8 + i * 0.03) : 0.6; el('line', { x1: fx + i * cw, y1: fy, x2: fx + i * cw, y2: fy + fh, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '2 4', opacity: op }); if (k === 0 && i % 6 === 0) mono(fx + i * cw, fy + fh + 18, 'x=' + i, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
    if (k === 0) { tx(480, 230, '가로 24칸 · 패널마다 gridPos {x, y, w, h}', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    const P = [['cpu', 0, 0, 1], ['mem', 12, 0, 3], ['rps', 0, 8, 4], ['err', 12, 8, 5]];
    P.forEach(([key, gx, gy, kk]) => { if (k < kk) return; const s = k === kk ? E(u, 0.1, 0.6) : 1, x = fx + gx * cw + 4, y = fy + gy * rh + 4, w = 12 * cw - 8, h = 8 * rh - 8;
      el('g', {}); panel(x, y + (1 - s) * 30, w, h, key, c, { big: true, at: 0.4 });
      if (k === kk) mono(x + w / 2, y + h / 2 + 20, `{x:${gx}, y:${gy}, w:12, h:8}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: 1 - fade(u, 1.6) }); });
    if (k === 2) { const x = fx + 4 + 12, w = 12 * cw - 32, y0 = fy + 4 + 36, h = 8 * rh - 8 - 46, Y = (v) => y0 + h - h * v / 100;
      [[0, 70, GOOD], [70, 80, WARN], [80, 100, BAD]].forEach(([a, b, col], i) => el('rect', { x, y: Y(b), width: w * E(u, 0.3 + i * 0.3, 0.9 + i * 0.3), height: Y(a) - Y(b), fill: col, opacity: 0.1 }));
      [[70, WARN, 14], [80, BAD, -2]].forEach(([v, col, dy], i) => mono(x + w + 6, Y(v) + dy, String(v), { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: fade(u, 1 + i * 0.3) })); } }

  // 6. Alertmanager
  function s6(t, c) { const { k, u } = c, m = c.beat.metrics;
    row4(c, 316, 92);
    if (k === 0) { card(300, 150, 420, 200, { rx: 12, stroke: ACC, sw: 2.5 });
      ['kind: PrometheusRule', 'metadata.name: web-alerts', 'spec.groups[web].rules:', '  (아직 비어 있다)'].forEach((s, i) => mono(110, 100 + i * 32, s, { 'font-size': 15, fill: i === 3 ? MUT : INK, 'font-weight': i === 0 ? 800 : 500, opacity: fade(u, 0.2 + i * 0.3) }));
      tx(720, 150, '규칙도 CRD로 선언한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 1 || k === 3) { const isCpu = k === 1, dur = isCpu ? 5 : 3, ax = R.axes(90, 70, 520, 190, { x: [0, 8], y: isCpu ? [0, 100] : [0, 5], xt: [0, 2, 4, 6, 8], xl: '분', yt: isCpu ? [0, 80] : [0, 1, 5] });
      const thr = isCpu ? 80 : 1, ser = (isCpu ? m.cpu : m.err).series.slice(-9).map((v, i) => [i, v]);
      el('line', { x1: ax.X(0), y1: ax.Y(thr), x2: ax.X(8), y2: ax.Y(thr), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' });
      R.line(ax, ser, E(u, 0.2, 1.4), isCpu ? INK : BAD);
      const first = ser.findIndex(([, v]) => v > thr), fx = first < 0 ? 0 : first;
      el('rect', { x: ax.X(fx), y: 264, width: (ax.X(Math.min(8, fx + dur)) - ax.X(fx)) * E(u, 1.2, 2.4), height: 12, rx: 4, fill: WARN, opacity: 0.8 });
      mono(ax.X(fx), 296, `for: ${dur}m`, { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
      const stt = u < 1.2 ? 'Inactive' : u < 2.4 ? 'Pending' : 'Firing';
      tx(780, 110, isCpu ? 'HighCPU' : 'HighErrorRate', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      mono(780, 140, isCpu ? 'expr: … > 0.8' : 'expr: 5xx 비율 > 0.01', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      ['Inactive', 'Pending', 'Firing'].forEach((s, i) => pill(700 + i * 0, 180 + i * 40, s, s === stt ? (i === 2 ? BAD : i === 1 ? WARN : INK) : OFF, s === stt ? 1.08 : 1, { mono: true, fs: 14 }));
      tx(780, 300, isCpu ? '넘는 순간이 아니라 5분 내내 넘어야' : 'CPU보다 짧게: 사용자 영향에 빨리', { 'text-anchor': 'middle', 'font-size': 14, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { card(260, 160, 400, 150, { rx: 12, stroke: ACC, sw: 2.2 }); tx(80, 112, 'annotations', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      mono(80, 150, 'summary: "CPU > 80% (5min)"', { 'font-size': 14.5, opacity: fade(u, 0.4) }); mono(80, 184, 'runbook: https://wiki/runbook/HighCPU', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.8) });
      person(700, 160, '새벽에 깬 사람', { s: pop(u, 1.2) }); grow(470, 184, 660, 170, E(u, 1.4, 2), MUT);
      tx(700, 250, '무엇부터 볼지 정해 준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k4 ~ k6: 라우팅 나무
    const rx = 130, ry = 160;
    card(rx, ry, 170, 56, { rx: 10, stroke: INK, sw: 2.5, text: 'route\ngroup_by', fs: 14.5 });
    const RT = [['severity="critical"', 'pagerduty', BAD, 90], ['severity="warning"', 'slack-ops', WARN, 236]];
    RT.forEach(([mt, rc, col, y], i) => { const g = k === 4 ? E(u, 0.3 + i * 0.4, 0.9 + i * 0.4) : 1;
      el('path', { d: `M${rx + 86},${ry} C${rx + 140},${ry} ${rx + 140},${y} ${rx + 200},${y}`, fill: 'none', stroke: col, 'stroke-width': 2.4, pathLength: 1, 'stroke-dasharray': `${g} 1` });
      pill(rx + 300, y, mt, col, k === 4 ? pop(u, 0.6 + i * 0.4) : 1, { mono: true, fs: 13.5 });
      if (!(k === 6 && i === 0)) card(700, y, 190, 52, { rx: 10, stroke: col, sw: 2.2, text: rc, fs: 15, mono: true, s: k === 4 ? pop(u, 1 + i * 0.4) : 1 });
      grow(rx + 390, y, 600, y, k === 4 ? E(u, 1, 1.5) : 1, col); });
    if (k === 5) { tx(820, 140, 'service_key', { 'font-size': 13.5, fill: MUT, class: 'mono', opacity: fade(u, 0.4) }); tx(820, 286, '#ops-alerts', { 'font-size': 13.5, fill: MUT, class: 'mono', opacity: fade(u, 0.6) });
      sub(480, 300, '알림 제목 = annotations의 summary', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
    if (k === 6) { const sh = Math.sin(t * 30) * 3 * (u > 0.6 ? 1 : 0);
      card(700 + sh, 90, 190, 52, { rx: 10, stroke: BAD, sw: 3, fill: 'var(--badbg)', text: 'PagerDuty 호출', fs: 15, color: BAD });
      el('rect', { x: 40, y: 250, width: 520, height: 56, rx: 8, fill: INK, opacity: fade(u, 0.8) });
      mono(56, 274, '[ALERT] HighCPU · severity=critical', { 'font-size': 14, fill: 'var(--bad)', 'font-weight': 700, opacity: fade(u, 0.9) }); mono(56, 296, 'avg(cpu)=0.94 (threshold 0.8, 5min sustained)', { 'font-size': 13.5, fill: PANEL, opacity: fade(u, 1.1) });
      sub(700, 300, '화면을 보는 사람이 없어도 울린다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); } }

  const quiz = [
    { q: '메트릭 수집기가 없는 클러스터에서 장애를 처음 알게 되는 경로는 무엇인가?',
      o: ['Grafana 경보', '사용자 신고', 'kubectl top 결과'], a: 1,
      why: 'kubectl top도 Metrics API가 없어 실패한다. 이 장면에서는 09:32 사용자 신고가 첫 신호였고 원인 확인은 30분 뒤였다.' },
    { q: 'Prometheus가 지표를 모으는 방식은 무엇인가?',
      o: ['각 Pod의 /metrics를 주기적으로 직접 GET한다', '앱이 Prometheus로 지표를 밀어 넣는다', 'etcd에서 읽어 온다'], a: 0,
      why: 'Pull 방식이다. Prometheus가 Pod IP:port/metrics를 긁어 TSDB에 넣고, 긁기에 실패한 것도 신호로 남는다.' },
    { q: 'ServiceMonitor가 긁을 Service를 고르는 기준은 무엇인가?',
      o: ['Service 이름', 'Pod IP 목록', 'selector.matchLabels의 라벨'], a: 2,
      why: 'app: web 라벨이 맞는 Service를 찾고 그 뒤의 Pod를 모두 긁는다. Pod가 2개에서 200개가 돼도 ServiceMonitor는 하나면 된다.' },
    { q: 'http_requests_total 같은 누적 카운터로 초당 요청 수를 그리려면 무엇을 씌우나?',
      o: ['histogram_quantile()', '/ 1024 / 1024', 'rate()'], a: 2,
      why: 'rate()가 5분 창의 초당 증가율로 바꾼다. working set 같은 게이지는 rate() 없이 그대로 합친다.' },
    { q: 'Grafana 패널의 gridPos가 {x:12, y:0, w:12, h:8}이면 어디에 놓이나?',
      o: ['왼쪽 위 절반', '오른쪽 위 절반', '오른쪽 아래 절반'], a: 1,
      why: '가로는 24칸이다. x 12부터 12칸이면 오른쪽 절반이고, y가 0이면 맨 윗줄이다.' },
    { q: 'HighCPU 규칙에 for: 5m가 붙어 있으면 언제 발화하나?',
      o: ['80%를 5분 동안 계속 넘었을 때', '80%를 넘는 순간', '5분마다 한 번씩'], a: 0,
      why: 'for는 조건이 그 시간만큼 이어져야 Pending에서 Firing으로 넘긴다. 잠깐 튀는 값은 걸러진다.' },
  ];

  const summary = [
    '수집기가 없으면 kubectl top도 안 되고, 사용자 신고를 받고 30분 뒤에야 원인을 찾는다.',
    'Prometheus는 Pod의 /metrics를 직접 긁고, ServiceMonitor가 라벨로 대상을 찾아 준다.',
    'rate, sum by, histogram_quantile 세 함수로 CPU·메모리·요청 수·에러율 그래프를 만든다.',
    '임계를 넘은 상태가 for 시간만큼 이어지면 Alertmanager가 severity에 맞춰 사람을 부른다.',
  ];
  const review = [
    { q: '새 서비스를 띄웠는데 Grafana에 그 서비스 지표가 안 나온다. ServiceMonitor는 그대로다. 먼저 볼 것은?',
      o: ['새 Service에 app: web 라벨과 이름이 metrics인 포트가 있는지', 'Grafana 새로고침 주기', 'Alertmanager의 receivers'], a: 0,
      why: 'ServiceMonitor는 라벨로 Service를 고르고 이름 붙은 포트를 긁는다. 둘 중 하나라도 다르면 조용히 빠진다.' },
    { q: 'CPU가 1분 동안만 95%로 튀었는데 HighCPU 알림이 오지 않았다. 이유는?',
      o: ['Prometheus가 고장 났다', 'for: 5m라서 5분 동안 계속 넘어야 발화한다', 'Grafana 임계선이 70이라서'], a: 1,
      why: '규칙은 넘는 순간이 아니라 for 시간 내내 넘어야 발화한다. 1분짜리 튐은 Pending에서 끝난다.' },
    { q: '트래픽이 두 배가 되자 5xx 건수도 두 배가 됐다. 장애인지 판단하려면 어느 값을 보나?',
      o: ['5xx 건수 그대로', 'CPU 사용률', '5xx를 전체 요청으로 나눈 에러율'], a: 2,
      why: '비율로 봐야 트래픽 증가와 실제 오류 증가를 가를 수 있다. 이 장의 규칙도 에러율 1% 초과를 기준으로 삼았다.' },
  ];

  R.page({ title: '클러스터 건강 검진', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
