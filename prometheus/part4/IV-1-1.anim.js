/* IV-1-1 node_exporter — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: 코드 블록의 curl 출력(918273.4 · 6.12e+09 · 4.21e+10), 나머지는 "예시"로 표시하고
 * rate·predict_linear 값은 Prometheus 규칙(외삽 포함)을 파이썬으로 재현해 맞췄다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, terminal, axes, scatter, line, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // k0 번째 beat 에 등장하고 그 뒤로는 그대로 남는다
  const at = (c, k0, a) => (c.k > k0 ? 1 : c.k === k0 ? pop(c.u, a ?? 0.2) : 0);
  const fa = (c, k0, a) => (c.k > k0 ? 1 : c.k === k0 ? fade(c.u, a ?? 0.2) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 노출 형식 한 줄: 이름{라벨} 값
  function expo(x, y, name, labels, val, o) { o = o || {};
    return spans(x, y, [[name, { 'font-weight': 700, fill: o.col || INK }], [labels || '', { fill: INFO }], [val != null ? ' ' + val : '', { fill: ACC, 'font-weight': 700 }]], { 'font-size': o.fs || 15, opacity: o.op ?? 1 }); }

  // ---------- 1. /metrics 노출 ----------
  const KF = [['/proc/stat', 110], ['/proc/meminfo', 160], ['/proc/loadavg', 210], ['/sys/class/net', 260]];
  const EX = { x: 290, y: 185 };
  const TERM = ['$ curl -s localhost:9100/metrics | grep …',
    'node_cpu_seconds_total{cpu="0",mode="idle"} 918273.4',
    'node_cpu_seconds_total{cpu="0",mode="user"} 12034.1',
    'node_memory_MemAvailable_bytes 6.12e+09',
    'node_filesystem_avail_bytes{mountpoint="/"} 4.21e+10'];
  function s1(t, c) { const { k, u } = c;
    zone(16, 28, 390, 362, 'Linux 호스트');
    if (k === 0) {
      card(211, 82, 360, 40, { rx: 8, text: 'node_exporter-1.8.2.linux-amd64.tar.gz', fs: 13.5, mono: true, fw: 600, stroke: GRID, op: 1 - 0.6 * E(u, 1.0, 1.6), s: pop(u, 0.2) });
      fly(211, 100, EX.x, EX.y, seg(u, 0.9, 1.7), 'tar xzf', { mono: true, fill: INK });
      card(EX.x, EX.y, 160, 62, { rx: 10, text: 'node_exporter', fs: 16, fw: 800, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.6) });
      sub(EX.x - 70, 300, '실행 파일 하나', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      [['JVM', 560], ['Python', 690], ['apt 패키지', 830]].forEach(([s, x], i) => { const sc = pop(u, 1.9 + i * 0.15);
        card(x, 200, 120, 44, { rx: 8, text: s, fs: 15, stroke: GRID, color: MUT, s: sc }); cross(x + 56, 178, 9, sc); });
      note(560, 150, '설치할 런타임이 없다', fade(u, 1.9), { fill: MUT });
      return; }
    // 커널 파일 → node_exporter
    KF.forEach(([s, y], i) => { const sc = k === 1 ? pop(u, 0.2 + i * 0.2) : 1;
      card(100, y, 150, 36, { rx: 6, text: s, fs: 13.5, mono: true, fw: 600, stroke: GRID, s: sc });
      grow(176, y, EX.x - 82, EX.y + (y - 185) * 0.25, k === 1 ? E(u, 0.9 + i * 0.1, 1.5 + i * 0.1) : 1, GRID, { plain: true });
      if (k === 1) dot([[176, y], [EX.x - 82, EX.y + (y - 185) * 0.25]], (u * 0.7 + i * 0.25) % 1, ACC, 4.5); });
    card(EX.x, EX.y, 160, 62, { rx: 10, text: 'node_exporter', fs: 16, fw: 800, mono: true, stroke: ACC, fill: ACCBG, color: ACC });
    pill(EX.x, 240, ':9100/metrics', ACC, at(c, 1, 1.4), { mono: true, fs: 14 });
    if (k === 1) note(56, 340, '커널 수치를 읽어 텍스트로 내놓는다', fade(u, 2.0));
    if (k < 2) return;
    // 터미널
    const shown = k === 2 ? E(u, 0.2, 1.4) : k === 3 ? 1 + E(u, 0.2, 2.0) * 4 : 5;
    terminal(426, 28, 518, 196, TERM, shown, { title: 'bash', fs: 13.5 });
    if (k === 2) { dot([[600, 230], [600, 240], [EX.x + 70, 240]], seg(u, 1.4, 2.0), INFO, 6); dot([[EX.x + 70, 240], [600, 240], [600, 230]], seg(u, 2.0, 2.6), ACC, 6);
      note(456, 290, 'HTTP GET 한 번이면 지금 값이 보인다', fade(u, 1.5)); note(456, 320, '형식은 사람이 읽는 텍스트', fade(u, 1.9), { fill: MUT }); }
    if (k === 3) { const y = 290, x = 440, cw = 9; const op = fade(u, 1.6);
      expo(x, y, 'node_cpu_seconds_total', '{cpu="0",mode="idle"}', '918273.4', { op });
      [['메트릭 이름', x, x + 22 * cw, INK], ['라벨', x + 22 * cw, x + 43 * cw, INFO], ['값', x + 44 * cw, x + 52 * cw, ACC]].forEach(([s, a, b, col], i) => { const g = E(u, 1.8 + i * 0.15, 2.3 + i * 0.15);
        el('line', { x1: a + 2, y1: y + 12, x2: lerp(a + 2, b - 2, g), y2: y + 12, stroke: col, 'stroke-width': 3 });
        tx((a + b) / 2, y + 34, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: g }); });
      note(440, 378, 'counter: mode별 누적초 · 메모리·디스크는 bytes', fade(u, 2.3), { fill: MUT, 'font-size': 14 }); }
    if (k === 4) {
      pill(EX.x, 130, 'systemd · enable --now', GOOD, pop(u, 0.2), { mono: true, fs: 13.5 });
      sub(EX.x, 286, 'User=node_exporter (전용 계정)', fade(u, 0.6), { 'font-size': 14, fill: INK });
      note(56, 340, '재부팅해도 다시 뜬다', fade(u, 0.9), { fill: GOOD });
      server(820, 316, 'Prometheus', { s: pop(u, 1.0), lamp: ACC });
      const route = [[762, 316], [600, 316], [600, 252], [EX.x + 78, 252]];
      el('polyline', { points: route.map((p) => p.join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 2.2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.3) });
      dot(route, seg(u, 1.4, 2.0), INFO, 6); dot(route.slice().reverse(), seg(u, 2.0, 2.6), ACC, 6);
      tx(480, 350, '15초마다 당겨 간다 (pull)', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) }); } }

  // ---------- 2. scrape_config ----------
  const TG = [['web-01', '10.0.1.11:9100', 80], ['web-02', '10.0.1.12:9100', 150], ['db-01', '10.0.1.21:9100', 220]];
  const PS = { x: 130, y: 175 };
  function s2(t, c) { const { k, u } = c;
    server(PS.x, PS.y, 'Prometheus', { lamp: k >= 2 ? ACC : OFF });
    clock(PS.x, 58, 24, k === 0 ? E(u, 0.3, 2.6) : (t % 3) / 3, ACC); mono(PS.x + 34, 64, '15s', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 0) { const x0 = 120, w = 720, y = 330;
      el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: MUT, 'stroke-width': 1.8 });
      for (let i = 0; i <= 8; i++) { const x = x0 + (w * i) / 8, s = pop(u, 0.3 + i * 0.22, 0.4);
        mono(x, y + 24, (i * 15) + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
        el('circle', { cx: x, cy: y, r: 8 * s, fill: ACC }); }
      note(120, 290, 'scrape 한 번 = 점 하나', fade(u, 0.6));
      note(120, 400, '짧으면 부하·저장량이 늘고, 길면 장애를 늦게 안다', fade(u, 2.1), { fill: MUT, 'font-size': 14.5 });
      note(560, 70, 'global 값이 모든 job 의 기본', fade(u, 1.0), { fill: MUT, 'font-size': 14.5 }); return; }
    zone(560, 30, 384, 262, 'job="node"', { stroke: ACC, dash: '6 5', fill: ACCBG, color: ACC, op: fa(c, 1) });
    if (k >= 2) TG.forEach(([n, a, y], i) => { const s = k === 2 ? pop(u, 0.3 + i * 0.3) : 1;
      grow(PS.x + 58, PS.y, 584, y + 14, k === 2 ? E(u, 0.3 + i * 0.3, 1.0 + i * 0.3) : 1, GRID, { plain: true });
      card(750, y + 14, 340, 52, { rx: 10, stroke: GRID, s });
      const up = k === 5 ? fade(u, 0.4 + i * 0.35) : 0;
      el('circle', { cx: 598, cy: y + 14, r: 7, fill: up > 0.5 ? GOOD : OFF, opacity: s });
      tx(614, y + 19, n, { 'font-size': 15, 'font-weight': 700, opacity: s });
      mono(680, y + 19, a, { 'font-size': 14, opacity: s, fill: k >= 4 ? INFO : INK });
      if (k >= 3) pill(870, y + 14, 'env=prod', WARN, k === 3 ? pop(u, 0.4 + i * 0.2) : 1, { mono: true, fs: 13.5 });
      if (k === 2 || k === 5) dot([[PS.x + 58, PS.y], [584, y + 14]], ((t * 0.6 + i * 0.3) % 1), ACC, 5); });
    if (k === 5) tx(750, 280, 'Status → Targets : 3/3 UP', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, class: 'mono', opacity: fade(u, 1.5) });
    // 아래: 시계열 하나의 라벨이 모인다
    tx(40, 330, '시계열 하나의 이름표', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const jobOp = fa(c, 1, 0.8), envOp = fa(c, 3, 1.2), insOp = fa(c, 4, 0.4);
    spans(40, 368, [['up', { 'font-weight': 700 }], ['{', { fill: INFO }], ['job="node"', { fill: ACC, opacity: jobOp }],
      [', instance="10.0.1.11:9100"', { fill: INFO, opacity: insOp }], [', env="prod"', { fill: WARN, opacity: envOp }], ['}', { fill: INFO }],
      [k === 5 ? '  1' : '', { fill: GOOD, 'font-weight': 800 }]], { 'font-size': 16 });
    if (k === 4) { note(40, 404, 'host:port 는 손대지 않아도 instance 로 붙는다', fade(u, 0.8), { fill: INFO, 'font-size': 14.5 });
      note(600, 330, '서버가 수백 대라면', fade(u, 1.6), { fill: MUT, 'font-size': 14.5 }); note(600, 356, '→ Service Discovery (IV-2)', fade(u, 1.9), { fill: INK, 'font-size': 14.5 }); }
    if (k === 5) note(40, 404, 'up 은 Prometheus 가 스스로 만드는 시계열 (1 = 성공)', fade(u, 2.0), { fill: GOOD, 'font-size': 14.5 }); }

  // ---------- 3. collector ----------
  const MODS = [['cpu', 1, 'node_cpu_*'], ['meminfo', 1, 'node_memory_*'], ['filesystem', 1, 'node_filesystem_*'], ['netdev', 1, 'node_network_*'],
    ['loadavg', 1, 'node_load*'], ['diskstats', 1, 'node_disk_*'], ['nfs', 1, 'node_nfs_*'], ['infiniband', 1, 'node_infiniband_*'],
    ['zfs', 1, 'node_zfs_*'], ['textfile', 1, 'node_textfile_*'], ['systemd', 0, 'node_systemd_*'], ['wifi', 0, 'node_wifi_*']];
  const WL = ['cpu', 'meminfo', 'filesystem', 'netdev', 'loadavg'];
  function modState(k, name, def, u) {   // 0 → 1 사이 값(스위치 위치)
    if (k <= 0) return def;
    if (k === 1) return ['nfs', 'infiniband', 'zfs'].includes(name) ? 1 - E(u, 0.4, 1.2) : def;
    const after1 = ['nfs', 'infiniband', 'zfs'].includes(name) ? 0 : def;
    if (k === 2 || k === 3) return name === 'systemd' ? (k === 2 ? E(u, 0.4, 1.2) : 1) : after1;
    const off = 1 - E(u, 0.3, 0.9), on = E(u, 1.0 + WL.indexOf(name) * 0.18, 1.4 + WL.indexOf(name) * 0.18);
    const before = name === 'systemd' ? 1 : after1;
    return WL.includes(name) ? Math.max(before * off, on) : before * off; }
  function s3(t, c) { const { k, u } = c;
    zone(14, 28, 566, 230, 'node_exporter 안의 collector 모듈');
    MODS.forEach(([n, def, fam], i) => { const col = i % 4, row = Math.floor(i / 4), cx = 90 + col * 136, cy = 82 + row * 60, v = modState(k, n, def, u);
      const hot = (k === 3 && n === 'filesystem') || (k === 2 && n === 'systemd') || (k === 1 && ['nfs', 'infiniband', 'zfs'].includes(n));
      const s = k === 0 ? pop(u, 0.1 + i * 0.08, 0.4) : 1;
      card(cx, cy, 128, 50, { rx: 8, stroke: hot ? ACC : GRID, sw: hot ? 2.6 : 1.6, fill: v > 0.5 ? PANEL : SOFT, s });
      mono(cx - 54, cy + 5, n, { 'font-size': 13.5, 'font-weight': 700, fill: v > 0.5 ? INK : MUT, opacity: s });
      el('rect', { x: cx + 22, y: cy - 9, width: 34, height: 18, rx: 9, fill: v > 0.5 ? GOOD : OFF, opacity: s });
      el('circle', { cx: cx + 31 + 16 * v, cy, r: 7, fill: PANEL, opacity: s }); });
    if (k === 0) { tx(560, 274, '초록 = 기본 ON · 회색 = 기본 off', { 'text-anchor': 'end', 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); }
    // 아래: 이번 beat 의 플래그
    const FL = ['node_exporter --log.level=debug  # 켜진 목록 확인', 'node_exporter --no-collector.zfs --no-collector.nfs …', 'node_exporter --collector.systemd', '', 'node_exporter --collector.disable-defaults --collector.cpu …'];
    if (FL[k]) { el('rect', { x: 14, y: 300, width: 566, height: 44, rx: 8, fill: INK, opacity: fade(u, 0.2) });
      mono(30, 328, FL[k].slice(0, Math.round(FL[k].length * E(u, 0.2, 1.2))), { 'font-size': 13.5, fill: 'var(--term)' }); }
    if (k === 1) note(14, 380, '끈 만큼 노출 계열이 사라진다', fade(u, 1.6));
    if (k === 2) note(14, 380, 'systemd 는 기본 off — 필요할 때 켠다', fade(u, 1.6));
    if (k === 4) note(14, 380, '전부 끄고 다섯 개만: 무엇이 나가는지 확실해진다', fade(u, 1.8));
    if (k === 3) { // 마운트 → 시계열 수 (예시)
      const keep = ['/', '/boot', '/data'], drop = ['tmpfs /run', 'overlay × 40'];
      tx(14, 296, '컨테이너 호스트의 마운트 (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      keep.forEach((m, i) => pill(50 + i * 80, 330, m, GOOD, pop(u, 0.2 + i * 0.1), { mono: true, fs: 13.5 }));
      drop.forEach((m, i) => { const x = 330 + i * 140, f = E(u, 1.4, 1.8); pill(x, 330, m, BAD, pop(u, 0.5 + i * 0.1), { mono: true, fs: 13.5 });
        if (f > 0) el('line', { x1: x - 56, y1: 330, x2: x - 56 + 112 * f, y2: 330, stroke: BAD, 'stroke-width': 3 }); });
      note(14, 384, 'mount-points-exclude · fs-types-exclude 로 가상 마운트를 뺀다', fade(u, 1.6), { 'font-size': 14 });
      // 오른쪽 막대
      const base = 380, top = 110, H = base - top, a = 301, b = 21, g = E(u, 0.4, 1.4), g2 = E(u, 1.6, 2.4);
      el('line', { x1: 620, y1: base, x2: 930, y2: base, stroke: MUT, 'stroke-width': 1.8 });
      el('rect', { x: 650, y: base - H * g, width: 90, height: H * g, rx: 4, fill: BAD, opacity: 0.85 });
      el('rect', { x: 800, y: base - H * (b / a) * g2, width: 90, height: H * (b / a) * g2, rx: 4, fill: GOOD });
      mono(695, base - H * g - 10, '301', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: g });
      mono(845, base - H * (b / a) * g2 - 10, '21', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: g2 });
      tx(695, 404, '43 마운트 × 7', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: g });
      tx(845, 404, '3 마운트 × 7', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: g2 });
      tx(780, 52, 'node_filesystem 시계열 수 (지표 7종)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INK }); return; }
    // 오른쪽: 노출되는 계열 목록
    tx(612, 46, '/metrics 에 나가는 계열', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    MODS.forEach(([n, def, fam], i) => { const v = modState(k, n, def, u), y = 76 + i * 28.5, on = v > 0.5;
      const changed = (k === 1 && ['nfs', 'infiniband', 'zfs'].includes(n)) || (k === 2 && n === 'systemd') || (k === 4 && (WL.includes(n) || on !== !!def));
      mono(612, y, fam, { 'font-size': 14, 'font-weight': changed ? 800 : 500, fill: on ? (changed ? ACC : INK) : OFF, 'text-decoration': on ? null : 'line-through', opacity: k === 0 ? fade(u, 0.3 + i * 0.08) : 1 }); }); }

  // ---------- 4. 대표 쿼리 ----------
  const CPU0 = Array.from({ length: 20 }, (_, i) => [5 + 15 * i, 918096.7 + 9.3 * i]);
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) {
      const ax = axes(110, 56, 440, 250, { x: [0, 300], y: [918080, 918290], xt: [0, 60, 120, 180, 240, 300], yt: [918100, 918200], xl: '초 (5m 창)' });
      tx(30, 36, 'node_cpu_seconds_total{cpu="0",mode="idle"}', { 'font-size': 14, fill: MUT, 'font-weight': 600, class: 'mono' });
      scatter(ax, CPU0.map(([x, y]) => [x, y, INK]), { u: k === 0 ? E(u, 0.2, 2.0) : 1, r: 4.5 });
      if (k === 0) { note(600, 120, '15초마다 찍힌 값', fade(u, 0.6));
        mono(600, 170, Math.round(lerp(918096.7, 918273.4, E(u, 0.2, 2.0)) * 10) / 10 + '', { 'font-size': 26, 'font-weight': 800, fill: INK });
        note(600, 214, '부팅 후 쌓인 idle 초 — 오르기만 한다', fade(u, 1.4), { fill: MUT });
        note(600, 300, '값 그 자체엔 뜻이 없다', fade(u, 2.1), { fill: BAD }); return; }
      // k1: 기울기
      const g = E(u, 0.2, 0.9), x0 = ax.X(5), x1 = ax.X(290), y0 = ax.Y(918096.7), y1 = ax.Y(918273.4);
      el('line', { x1: x0, y1: y0, x2: lerp(x0, x1, g), y2: y0, stroke: ACC, 'stroke-width': 2.5 });
      el('line', { x1: x1, y1: y0, x2: x1, y2: lerp(y0, y1, E(u, 0.8, 1.3)), stroke: ACC, 'stroke-width': 2.5 });
      mono((x0 + x1) / 2, y0 + 22, '285초', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: g });
      mono(x1 - 8, (y0 + y1) / 2, '176.7', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      const L = [['176.7 ÷ 285 = 0.62 /초', INK, 1.3], ['cpu1 은 0.58 /초', MUT, 1.6], ['평균 0.60 → 100 − 60', INK, 1.9]];
      L.forEach(([s, col, a]) => mono(590, 100 + L.findIndex((q) => q[0] === s) * 36, s, { 'font-size': 15.5, 'font-weight': 700, fill: col, opacity: fade(u, a) }));
      mono(590, 228, 'CPU 사용률 40%', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) });
      R.hbar(590, 246, 300, 40, 100, { u: E(u, 2.2, 2.8), label: false });
      note(590, 300, 'rate 는 창 끝까지 외삽해도 같은 0.62', fade(u, 2.3), { fill: MUT, 'font-size': 14 }); return; }
    if (k <= 3) { // 메모리(위) · 디스크(아래)
      const bar = (y, total, part, title, lab, pct, op, gg) => { tx(60, y - 16, title, { 'font-size': 15, 'font-weight': 700, opacity: op });
        el('rect', { x: 60, y, width: 760, height: 40, rx: 6, fill: SOFT, stroke: GRID, opacity: op });
        el('rect', { x: 60, y, width: 760 * (part / total) * gg, height: 40, rx: 6, fill: ACC, opacity: op * 0.9 });
        mono(70 + 760 * (part / total) * gg, y + 26, lab, { 'font-size': 14, 'font-weight': 700, opacity: op * gg });
        mono(900, y + 27, pct, { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: op * gg }); };
      const mOp = k === 3 ? 0.45 : 1;
      bar(80, 1.6e10, 6.12e9, 'MemAvailable / MemTotal', '6.12e+09 / 1.6e+10', '38.3%', mOp, k === 2 ? E(u, 0.3, 1.3) : 1);
      if (k === 2) { note(60, 160, 'MemFree 만 보면 회수할 수 있는 캐시를 빼먹는다', fade(u, 1.6), { fill: BAD });
        note(60, 196, 'MemTotal 1.6e+10 은 예시 값', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); }
      if (k === 3) { ['/', '/boot', '/data'].forEach((m, i) => pill(90 + i * 90, 210, m, i === 0 ? ACC : GRID, pop(u, 0.2 + i * 0.1), { mono: true, fs: 14, color: i === 0 ? ACC : MUT }));
        tx(330, 215, 'mountpoint="/" 만 고른다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
        bar(280, 2.0e11, 4.21e10, 'avail_bytes / size_bytes  (mountpoint="/")', '4.21e+10 / 2.0e+11', '21.1%', 1, E(u, 0.8, 1.8));
        note(60, 360, 'size 2.0e+11 은 예시 값 — avail 은 curl 출력 그대로', fade(u, 2.0), { fill: MUT, 'font-size': 14 }); }
      return; }
    // k4: predict_linear
    const ax = axes(90, 46, 520, 280, { x: [-6, 4], y: [-15, 120], xt: [-6, -4, -2, 0, 2, 4], yt: [0, 50, 100], xl: '시간 (h)', grid: true });
    tx(30, 30, 'avail_bytes{mountpoint="/"}  (GB, 예시)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    el('line', { x1: ax.X(-6), y1: ax.Y(0), x2: ax.X(4), y2: ax.Y(0), stroke: BAD, 'stroke-width': 2 });
    el('line', { x1: ax.X(0), y1: ax.Y(120), x2: ax.X(0), y2: ax.Y(-15), stroke: MUT, 'stroke-width': 1.4, 'stroke-dasharray': '4 4' });
    tx(ax.X(0) + 6, ax.Y(115), '지금', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const P = [-6, -5, -4, -3, -2, -1, 0].map((h) => [h, 42.1 - 12 * h]);
    scatter(ax, P.map(([x, y]) => [x, y, INK]), { u: E(u, 0.2, 1.0), r: 5 });
    line(ax, [[-6, 114.1], [0, 42.1]], E(u, 0.9, 1.3), INK, { sw: 2 });
    line(ax, [[0, 42.1], [4, -5.9]], E(u, 1.3, 2.0), BAD, { dash: '7 6', sw: 2.6 });
    if (fade(u, 2.0) > 0) { el('circle', { cx: ax.X(4), cy: ax.Y(-5.9), r: 7, fill: BAD });
      mono(ax.X(4) - 10, ax.Y(-5.9) - 12, '−5.9', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); }
    const L = [['최근 6h 직선 맞추기', INK, 0.8], ['기울기 −12 GB/h', INK, 1.2], ['4h 뒤 −5.9 GB', BAD, 1.9], ['< 0 → 곧 가득 찬다', BAD, 2.3]];
    L.forEach(([s, col, a], i) => tx(650, 110 + i * 40, s, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, a), class: i ? 'mono' : null }));
    note(650, 300, '일이 터지기 전에 경보', fade(u, 2.5), { fill: GOOD }); }

  // ---------- 5. textfile collector ----------
  const FILE = ['# HELP backup_last_success_timestamp_seconds 마지막 백업 완료 시각', '# TYPE backup_last_success_timestamp_seconds gauge', 'backup_last_success_timestamp_seconds 1723000000',
    '# HELP backup_size_bytes 마지막 백업 크기', '# TYPE backup_size_bytes gauge', 'backup_size_bytes 42000000000'];
  function s5(t, c) { const { k, u } = c;
    if (k === 6) { // 멈춘 배치 잡아내기
      const x0 = 80, w = 800, y = 250, X = (h) => x0 + (h / 30) * w;
      tx(40, 46, 'time() − backup_last_success_timestamp_seconds > 25 × 3600', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: MUT, 'stroke-width': 2 });
      [0, 5, 10, 15, 20, 25, 30].forEach((h) => mono(X(h), y + 26, h + 'h', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      el('circle', { cx: X(0), cy: y, r: 8, fill: GOOD }); tx(X(0), y - 22, '마지막 성공 1723000000', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
      el('rect', { x: X(25), y: y - 70, width: X(30) - X(25), height: 70, fill: BADBG, opacity: fade(u, 0.4) });
      el('line', { x1: X(25), y1: y - 80, x2: X(25), y2: y + 8, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.4) });
      tx(X(25) - 6, y - 86, '25h 문턱 = 90000초', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 0.5) });
      const now = lerp(0, 26, E(u, 0.6, 2.0)); el('line', { x1: X(0), y1: y, x2: X(now), y2: y, stroke: INFO, 'stroke-width': 5 });
      el('circle', { cx: X(now), cy: y, r: 8, fill: now > 25 ? BAD : INFO });
      mono(X(now), y + 56, 'now', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
      mono(480, 340, '경과 ' + Math.round(now * 3600) + '초', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: now > 25 ? BAD : INK });
      if (now > 25) banner(480, 388, '93600 > 90000 → 백업이 멈췄다 (예시)', pop(u, 2.1)); return; }
    // 위: cron · 디렉터리 · node_exporter
    zone(200, 24, 330, 186, '/var/lib/node_exporter', { stroke: GRID, sw: 1.5 });
    card(720, 92, 210, 56, { rx: 10, text: 'node_exporter', fs: 16, fw: 800, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: at(c, 0) });
    mono(720, 146, '--collector.textfile.directory', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fa(c, 0, 0.6) });
    el('line', { x1: 532, y1: 100, x2: 612, y2: 92, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fa(c, 0, 1.0) });
    tx(572, 80, '*.prom 감시', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fa(c, 0, 1.2) });
    if (k === 0) note(220, 250, '이 디렉터리의 *.prom 을 /metrics 에 합친다', fade(u, 1.6));
    if (k >= 1) { // OUT · TMP
      const moved = k >= 5 ? E(c.k === 5 ? u : 3, 0.3, 1.2) : 0;
      card(365, 80, 240, 40, { rx: 6, text: 'backup.prom', fs: 14, mono: true, fw: 700, stroke: moved > 0.99 ? GOOD : GRID, dash: moved > 0.99 ? null : '6 4', color: moved > 0.99 ? GOOD : MUT, s: at(c, 1) });
      if (moved < 0.99) card(365, lerp(150, 80, moved), 240, 40, { rx: 6, text: 'backup.prom.$$', fs: 14, mono: true, fw: 700, stroke: WARN, fill: WARNBG, s: at(c, 1, 0.6) });
      if (k === 1) note(220, 250, '임시 파일도 같은 디렉터리에 (.prom 이 아니라 안 읽힌다)', fade(u, 1.2), { 'font-size': 14.5 }); }
    if (k >= 2) { card(96, 90, 150, 56, { rx: 10, text: 'cron\nbackup_metrics.sh', fs: 13.5, stroke: INK, s: at(c, 2) });
      pill(96, 152, 'SIZE=4.2e10', INFO, at(c, 2, 0.8), { mono: true, fs: 13.5 }); pill(96, 190, 'NOW=1723000000', INFO, at(c, 2, 1.2), { mono: true, fs: 13.5 });
      if (k === 2) note(30, 250, '값은 스크립트가 직접 구한다 (값은 예시)', fade(u, 1.6)); }
    if (k >= 3 && k <= 4) grow(172, 120, 244, 150, k === 3 ? E(u, 0.2, 0.6) : 1, WARN);
    if (k >= 3) { // 아래 왼쪽: 임시 파일 내용
      const n = k === 3 ? E(u, 0.3, 2.0) * 3 : k === 4 ? 3 + E(u, 0.3, 1.8) * 3 : 6;
      el('rect', { x: 14, y: 236, width: 516, height: 174, rx: 8, fill: SOFT, stroke: k >= 5 ? GOOD : WARN, 'stroke-width': 1.5 });
      tx(26, 256, k >= 5 ? 'backup.prom' : 'backup.prom.$$ 에 쓰는 중', { 'font-size': 13.5, 'font-weight': 700, fill: k >= 5 ? GOOD : WARN, class: 'mono' });
      FILE.forEach((s, i) => { if (i >= Math.ceil(n)) return; const part = i === Math.ceil(n) - 1 && n % 1 ? s.slice(0, Math.round(s.length * (n % 1))) : s;
        mono(26, 282 + i * 22, part, { 'font-size': 13.5, fill: s.startsWith('#') ? MUT : INK, 'font-weight': s.startsWith('#') ? 400 : 700 }); }); }
    if (k === 5) { // mv — 반쯤 쓰인 파일은 읽히지 않는다
      el('rect', { x: 548, y: 236, width: 396, height: 174, rx: 8, fill: INK });
      tx(562, 258, 'curl :9100/metrics', { 'font-size': 13.5, fill: OFF, class: 'mono' });
      [['node_cpu_seconds_total{…} 918273.4', 0], ['backup_last_success_timestamp_seconds', 1], ['  1723000000', 1], ['backup_size_bytes 42000000000', 1]].forEach(([s, nw], i) =>
        mono(562, 288 + i * 26, s, { 'font-size': 13.5, fill: nw ? 'var(--term)' : OFF, opacity: nw ? fade(u, 1.4 + i * 0.2) : 1 }));
      note(560, 216, 'rename 은 한 번에 바뀐다', fade(u, 1.2), { fill: GOOD, 'font-size': 14.5 }); } }

  // ---------- 6. 익스포터 패턴 · USE ----------
  const ROWS = ['CPU', 'Memory', 'Disk', 'Network'], COLS = [['U', '사용률'], ['S', '포화 · 대기'], ['E', '오류']];
  const CELL = { '0,0': ['100 − idle%', '40%', 1], '0,1': ['load1 ÷ 코어 수', '6.0 ÷ 4 = 1.5', 2], '1,0': ['1 − Avail/Total', '61.8%', 3], '1,1': ['Swap Total − Free', '> 0 이면 포화', 3],
    '2,1': ['io_time_weighted', '대기열 길이', 4], '3,2': ['receive_errs', '초당 에러', 4] };
  function s6(t, c) { const { k, u } = c;
    tx(40, 34, 'USE — 자원마다 세 칸을 채운다', { 'font-size': 17, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.1) : 1 });
    const cx = (j) => 330 + j * 230, cy = (i) => 128 + i * 66;
    COLS.forEach(([a, b], j) => { const s = k === 0 ? pop(u, 0.3 + j * 0.3) : 1;
      card(cx(j), 72, 214, 40, { rx: 8, fill: INK, stroke: 'none', s }); tx(cx(j), 79, a + '  ' + b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL, opacity: s }); });
    ROWS.forEach((r, i) => { const s = k === 0 ? pop(u, 1.2 + i * 0.15) : 1; card(120, cy(i), 150, 56, { rx: 8, text: r, fs: 16, fw: 800, stroke: GRID, s });
      COLS.forEach((_, j) => { const key = i + ',' + j, cell = CELL[key], on = cell && k >= cell[2], now = cell && k === cell[2];
        const sc = now ? pop(u, 0.3 + j * 0.4) : 1, bad = key === '0,1';
        if (!on) { el('rect', { x: cx(j) - 107, y: cy(i) - 28, width: 214, height: 56, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 5', opacity: k === 0 ? fade(u, 1.4) : 1 }); return; }
        card(cx(j), cy(i), 214, 56, { rx: 8, stroke: bad ? BAD : ACC, fill: bad ? BADBG : ACCBG, sw: 2, s: sc });
        mono(cx(j), cy(i) - 5, cell[0], { 'font-size': 14, 'text-anchor': 'middle', fill: INK, opacity: sc > 0.3 ? 1 : 0 });
        mono(cx(j), cy(i) + 17, cell[1], { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: bad ? BAD : ACC, opacity: sc > 0.3 ? 1 : 0 }); }); });
    if (k === 0) note(40, 404, '사용률만 보면 기다림(포화)과 오류를 놓친다', fade(u, 2.0), { fill: MUT });
    if (k === 1) note(40, 404, '앞 장면의 CPU 사용률 40% 가 U 칸에 들어간다', fade(u, 1.4), { fill: MUT });
    if (k === 2) banner(480, 398, 'U 40% 인데 S 1.5 — 여유 있어 보여도 느리다 (예시)', pop(u, 1.6));
    if (k === 3) note(40, 404, '메모리 여유 38.3% → 사용률 61.8% · 스왑을 쓰기 시작하면 포화', fade(u, 1.6), { fill: MUT });
    if (k === 4) note(40, 404, '빈 칸이 남아도 된다 — 볼 축을 빠뜨리지 않는 것이 목적', fade(u, 1.8), { fill: MUT }); }

  const quiz = [
    { q: 'node_exporter가 /metrics에 내놓는 node_cpu_seconds_total 값은 어떤 성격인가?',
      o: ['지금 이 순간의 CPU 사용률(%)', 'mode별로 부팅 뒤 쌓인 누적초(counter)', '최근 5분 평균 부하'], a: 1,
      why: 'curl 출력의 918273.4는 idle 상태로 쌓인 초다. 가공 전 원본이라 쓰려면 rate로 바꿔야 한다.' },
    { q: 'static_configs에 10.0.1.11:9100을 적으면 그 시계열에 자동으로 붙는 라벨은 무엇인가?',
      o: ['env="prod"', 'region="ap-northeast-2"', 'instance="10.0.1.11:9100"'], a: 2,
      why: 'host:port는 손대지 않아도 instance 라벨이 된다. job_name은 job 라벨이 되고 env는 labels로 따로 붙였다.' },
    { q: '컨테이너 호스트에서 filesystem 시계열이 수백 개로 불어날 때 먼저 손볼 것은 무엇인가?',
      o: ['mount-points-exclude·fs-types-exclude로 가상 마운트 빼기', 'scrape_interval을 1분으로 늘리기', 'systemd collector 켜기'], a: 0,
      why: 'overlay·tmpfs 마운트마다 시계열이 생긴다. 예시에서 43개 마운트의 301개가 필터 뒤 21개로 줄었다.' },
    { q: '5분 동안 cpu0의 idle이 176.7초 늘었고 그 사이 간격이 285초다. cpu0의 idle 비율은 얼마인가?',
      o: ['0.62 /초', '176.7 /초', '0.38 /초'], a: 0,
      why: '176.7 ÷ 285 = 0.62다. cpu1의 0.58과 평균하면 0.60이고 100 − 60 = 40%가 CPU 사용률이다.' },
    { q: 'textfile collector 용 파일을 임시 파일에 쓴 뒤 mv로 바꾸는 까닭은 무엇인가?',
      o: ['파일 크기를 줄이려고', 'node_exporter가 반쯤 쓰인 파일을 읽지 않게 하려고', 'HELP·TYPE 줄을 자동으로 붙이려고'], a: 1,
      why: '같은 디렉터리 안 rename은 한 번에 바뀐다. 쓰는 도중에 scrape가 와도 옛 파일이나 새 파일 중 하나만 보인다.' },
    { q: 'CPU 사용률은 40% 인데 load1 ÷ 코어 수가 1.5다. USE로 보면 무엇이 문제인가?',
      o: ['사용률(U)이 너무 높다', '오류(E)가 쌓이고 있다', '포화(S): 실행을 기다리는 작업이 밀려 있다'], a: 2,
      why: '사용률만 보면 여유 있어 보이지만 run-queue가 코어 수보다 길다. 포화 칸을 따로 봐야 잡힌다.' },
  ];

  const summary = [
    '앱은 호스트의 CPU·메모리·디스크를 모른다. node_exporter가 :9100/metrics에 대신 내놓는다.',
    'Prometheus는 등록된 target을 15초마다 당겨 가고 job·instance 라벨을 붙인다.',
    '노출값은 원본이라 counter는 rate로, 메모리·디스크는 비율로 바꿔서 본다.',
    'collector와 마운트를 걸러 시계열 수를 관리하고, 자원마다 U·S·E를 함께 본다.',
  ];
  const review = [
    { q: 'node_exporter를 띄웠는데 Prometheus 그래프에 아무 값도 없다. 먼저 확인할 것은?',
      o: ['collector를 전부 켰는지', 'prometheus.yml의 targets에 이 주소가 등록돼 있는지', 'textfile 디렉터리가 있는지'], a: 1,
      why: '익스포터는 노출만 한다. target으로 등록돼야 Prometheus가 15초마다 긁어 간다.' },
    { q: 'node_cpu_seconds_total을 그대로 그래프에 그렸더니 우상향 직선만 보인다. 고칠 방법은?',
      o: ['100 − avg(rate(…idle[5m])) × 100으로 바꾼다', 'scrape_interval을 줄인다', 'MemAvailable로 나눈다'], a: 0,
      why: '누적초 counter는 오르기만 한다. rate로 초당 증가율을 구하고 idle을 100에서 빼야 사용률이 된다.' },
    { q: '매일 새벽 백업 스크립트가 backup.prom을 쓰는데 어느 날부터 경보가 울린다. 경보 식이 time() − ts > 25 × 3600일 때 가장 먼저 의심할 것은?',
      o: ['디스크 소진 예측이 틀렸다', 'collector가 너무 많이 켜져 있다', '백업이 25시간 넘게 성공하지 못해 시각이 갱신되지 않았다'], a: 2,
      why: '스크립트가 성공할 때만 timestamp를 새로 쓴다. 갱신이 멈추면 경과 시간이 90000초를 넘어 경보가 난다.' },
  ];

  R.page({ title: 'node_exporter 흐름', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
