/* IV-2-2 Resource requests · limits — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * Pod 별 CPU(m)·메모리(Mi) 의 사용량·request·limit, QoS, 상태는 STEPS 의 pods 를, 노드 메시지는 nodeWarning 을 읽는다.
 * 노드는 4 core / 8 GiB (페이지의 NODE_CPU_TOTAL · NODE_MEM_TOTAL). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    cross, check, terminal, meters, hbar, axes } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const NC = () => (typeof NODE_CPU_TOTAL !== 'undefined' ? NODE_CPU_TOTAL : 4000), NM = () => (typeof NODE_MEM_TOTAL !== 'undefined' ? NODE_MEM_TOTAL : 8192);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const QC = { BestEffort: BAD, Burstable: WARN, Guaranteed: GOOD };
  const STAT = { running: ['실행 중', GOOD], starving: ['CPU 굶는 중', WARN], oomkilled: ['OOMKilled · Exit 137', BAD], 'evict-first': ['evict 1순위', BAD] };
  const pct = (a, b) => Math.round((a / b) * 100);

  // 막대 하나: x, y, 폭 w, 눈금 최대 max. r = {req, lim, use}, pr = 앞 beat 값
  function rbar(x, y, w, max, r, pr, u, unit, o) { o = o || {};
    const sc = (v) => x + w * clamp(v / max), use = tween(pr ? pr.use : r.use, r.use, u), over = r.lim && use >= r.lim - 1;
    el('rect', { x, y, width: w, height: 22, rx: 4, fill: SOFT });
    el('rect', { x, y, width: Math.max(2, sc(use) - x), height: 22, rx: 4, fill: over && o.oom ? BAD : o.col || ACC, opacity: 0.85 });
    if (r.req) { const rx = sc(tween(pr ? pr.req || r.req : r.req, r.req, u)); el('line', { x1: rx, y1: y - 8, x2: rx, y2: y + 30, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: pr && !pr.req ? fade(u, 0.4) : 1 }); }
    if (r.lim) { const lx = sc(r.lim); el('line', { x1: lx, y1: y - 10, x2: lx, y2: y + 32, stroke: BAD, 'stroke-width': 3.5, opacity: pr && !pr.lim ? fade(u, 0.5) : 1 }); }
    const f = (v) => (v ? Math.round(v) + unit : '—');
    mono(x, y - 12, `use ${f(use)}  req ${f(r.req)}  lim ${f(r.lim)}`, { 'font-size': 13.5, fill: MUT });
    if (use > max) mono(x + w + 6, y + 17, '▶', { 'font-size': 14, fill: BAD }); }
  // Pod 세 줄
  function rows(c, sc, o) { o = o || {}; const { u } = c, pods = c.beat.pods, prev = c.prev ? c.prev.pods : null;
    tx(200, 52, 'CPU  (눈금 ' + sc[0] + 'm)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); tx(590, 52, '메모리  (눈금 ' + sc[1] + 'Mi)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    pods.forEach((p, i) => { const y = 70 + i * 104, pp = prev && prev.find((q) => q.name === p.name), s = pp ? 1 : pop(u, 0.2 + i * 0.2);
      tx(40, y + 36, p.name, { 'font-size': 20, 'font-weight': 800, opacity: clamp(s * 1.4) });
      const qChanged = pp && pp.qos !== p.qos, q = o.qosUnknown ? 'QoS ?' : p.qos;
      pill(100, y + 64, q, o.qosUnknown ? OFF : QC[p.qos], qChanged ? pop(u, 0.5) : clamp(s * 1.4), { fs: 13.5 });
      const [st, col] = o.role ? o.role[i] : STAT[p.status] || STAT.running;
      tx(40, y + 96, st, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: (pp && pp.status !== p.status) || o.role ? fade(u, 0.8) : clamp(s * 1.4) });
      rbar(200, y + 44, 330, sc[0], p.cpu, pp && pp.cpu, u, 'm');
      rbar(590, y + 44, 330, sc[1], p.mem, pp && pp.mem, u, 'Mi', { oom: p.oom, col: INFO });
      if (o.extra) o.extra(p, i, y); }); }
  function footer(c) { const w = c.beat.nodeWarning || '', tone = w.startsWith('✓') ? GOOD : w.startsWith('🚨') ? BAD : WARN;
    tx(480, 404, w.replace(/^[^\w가-힣]+/, ''), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: tone, opacity: fade(c.u, 1.4) }); }
  function nodeHead(c) { const pods = c.beat.pods, cu = pods.reduce((a, p) => a + p.cpu.use, 0), mu = pods.reduce((a, p) => a + p.mem.use, 0);
    const pc = c.prev ? c.prev.pods.reduce((a, p) => a + p.cpu.use, 0) : cu, pm = c.prev ? c.prev.pods.reduce((a, p) => a + p.mem.use, 0) : mu;
    const a = tween(pc, cu, c.u), b = tween(pm, mu, c.u);
    mono(920, 24, `node-1  CPU ${Math.round(a)}m (${pct(a, NC())}%) · Mem ${Math.round(b)}Mi (${pct(b, NM())}%)`, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: pct(b, NM()) >= 85 ? BAD : MUT }); }

  // ---------- 1. 미설정 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 4) { const pods = c.beat.pods, cu = pods.reduce((a, p) => a + p.cpu.use, 0), mu = pods.reduce((a, p) => a + p.mem.use, 0);
      meters(60, 40, 840, [{ name: 'node-1 CPU', val: `${cu}m / ${NC()}m`, bar: pct(cu, NC()), hot: true }, { name: 'node-1 메모리', val: `${mu}Mi / ${NM()}Mi`, bar: pct(mu, NM()), hot: true }], { h: 80 });
      terminal(60, 150, 840, 176, ['$ kubectl describe node node-1', '  MemoryPressure   True', '  DiskPressure     False', '$ kubectl get events --sort-by=.lastTimestamp', ['  SystemOOM   killed process web pid=1234', '#f87171'], ['  Evicted     The node was low on resource: memory', '#f87171']], 1 + E(u, 0.2, 2.2) * 5, { fs: 14, lh: 22 });
      banner(480, 366, 'Pod 하나 때문에 노드 전체가 위험하다', pop(u, 2.2)); return; }
    nodeHead(c);
    rows(c, [NC(), NM()], { qosUnknown: k === 0 });
    if (k === 1) c.beat.pods.forEach((p, i) => mono(470, 70 + i * 104 + 96, '예약 0m / 0Mi', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.2), 'text-anchor': 'end' }));
    footer(c); }

  // ---------- 2. requests ----------
  function seats(x, y, cols, n, filled, size, label, total, unit, u) { // filled: [[name, count, color]]
    tx(x, y - 14, label, { 'font-size': 14, 'font-weight': 700 });
    let idx = 0; const marks = []; filled.forEach(([nm, cnt, col]) => { for (let j = 0; j < cnt; j++) marks.push(col); });
    for (let i = 0; i < n; i++) { const col = marks[i], s = col ? clamp(u * marks.length * 0.7 - i * 0.7 + 0.5) : 1;
      el('rect', { x: x + (i % cols) * (size + 4), y: y + Math.floor(i / cols) * (size + 4), width: size, height: size, rx: 3, fill: col && s > 0 ? col : PANEL, stroke: col && s > 0 ? 'none' : GRID, 'stroke-width': 1.2, opacity: col ? 0.4 + 0.6 * clamp(s) : 1 }); }
    const used = filled.reduce((a, [, cnt]) => a + cnt, 0); idx = used; return idx; }
  function s2(t, c) { const { k, u } = c;
    if (k === 2 || k === 4) { const pods = c.beat.pods, col = [ACC, INFO, WARN];
      // CPU: 1칸 = 50m (80칸), 메모리: 1칸 = 128Mi (64칸)
      seats(60, 70, 16, 80, pods.map((p, i) => [p.name, p.cpu.req / 50, col[i]]), 22, 'CPU allocatable · 한 칸 = 50m', NC(), 'm', k === 2 ? E(u, 0.2, 1.8) : 1);
      seats(520, 70, 16, 64, pods.map((p, i) => [p.name, p.mem.req / 128, col[i]]), 22, '메모리 · 한 칸 = 128Mi', NM(), 'Mi', k === 2 ? E(u, 0.2, 1.8) : 1);
      pods.forEach((p, i) => { pill(150 + i * 170, 232, `${p.name} ${p.cpu.req}m`, col[i], pop(u, k === 2 ? 1.0 + i * 0.2 : -1), { mono: true, fs: 13.5 });
        pill(600 + i * 150, 232, `${p.mem.req}Mi`, col[i], pop(u, k === 2 ? 1.0 + i * 0.2 : -1), { mono: true, fs: 13.5 }); });
      const cs = pods.reduce((a, p) => a + p.cpu.req, 0), ms = pods.reduce((a, p) => a + p.mem.req, 0);
      mono(60, 286, `예약 합 ${cs}m / ${NC()}m`, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 1.8) : 1 });
      mono(520, 286, `예약 합 ${ms}Mi / ${NM()}Mi`, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 1.8) : 1 });
      if (k === 2) { note(60, 340, '스케줄러는 남은 칸과 requests를 비교해 노드를 고른다', fade(u, 2.0)); note(60, 368, '어느 노드에도 칸이 모자라면 Pod는 Pending으로 남는다', fade(u, 2.2), { fill: WARN }); }
      else { terminal(60, 318, 840, 92, ['$ kubectl describe node node-1 | grep -A 5 Allocated', `  cpu      550m (${Math.floor(550 / NC() * 100)}%)     memory   896Mi (${Math.floor(896 / NM() * 100)}%)   ← 예시 출력`], E(u, 0.2, 1.4) * 2, { fs: 14 }); }
      return; }
    nodeHead(c); rows(c, [1600, 2048]);
    if (k === 3) { const w = c.beat.pods[0].cpu; mono(530, 92, `${(w.use / w.req).toFixed(1)}× request`, { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.4) }); }
    footer(c); }

  // ---------- 3. limits ----------
  function s3(t, c) { const { k, u } = c;
    nodeHead(c);
    rows(c, [600, 1200], { extra: (p, i, y) => {
      if (k === 2 && p.name === 'cron') { for (let j = 0; j < 6; j++) { const x = 200 + 330 * 190 / 600 - 30 + j * 8; el('path', { d: `M${x},${y + 80} l4,-8 l4,8`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.0) }); }
        mono(530, y + 26, 'throttle', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.2) }); }
      if (k === 3 && p.name === 'web') { const fl = u > 1.3 ? 0.5 + 0.5 * Math.sin(u * 14) : 0;
        el('rect', { x: 586, y: y + 40, width: 338, height: 30, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fl });
        pill(800, y + 92, 'SIGKILL · Exit 137', BAD, pop(u, 1.4), { mono: true, fs: 13.5 }); }
      if (k === 4 && p.name === 'web') mono(920, y + 96, 'Restart 1 · logs --previous', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.0) }); } });
    footer(c); }

  // ---------- 4. QoS ----------
  function s4(t, c) { const { k, u } = c;
    nodeHead(c);
    const role = k === 3 ? [['DB·결제·인증', GOOD], ['일반 web·worker', WARN], ['임시 cron·debug', MUT]] : null;
    rows(c, [1200, 2400], { role, extra: (p, i, y) => {
      if (k === 1 && p.name === 'db') mono(920, y + 20, 'req = lim', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      if (k === 2) { const order = { cron: 1, web: 2, db: 3 }[p.name], s = pop(u, 0.4 + (order - 1) * 0.4);
        R.card(170, y + 30, 34, 34, { rx: 17, text: String(order), fs: 16, fw: 800, fill: order === 1 ? BAD : PANEL, color: order === 1 ? PANEL : INK, stroke: order === 1 ? BAD : GRID, s }); } } });
    if (k === 2) tx(480, 404, '노드가 부족하면: requests를 넘겨 쓰는 Pod부터, 우선순위와 초과량 순', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    else footer(c); }

  // ---------- 5. 측정해서 정하기 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { terminal(40, 40, 470, 150, ['$ kubectl top pod --containers', 'NAME           CPU    MEMORY', '  web-7f...      380m   700Mi', '  worker-3a...   250m   500Mi', '  db-0           850m   1700Mi'], 1 + E(u, 0.2, 1.4) * 4, { fs: 13.5 });
      sub(275, 210, '예시 출력', fade(u, 1.4));
      [['web CPU', 380, 250, 'm', 600], ['web 메모리', 700, 512, 'Mi', 1200], ['worker 메모리', 500, 256, 'Mi', 1200]].forEach(([n, use, req, un, mx], i) => { const y = 260 + i * 50, s = fade(u, 1.0 + i * 0.3);
        tx(40, y + 16, n, { 'font-size': 15, 'font-weight': 700, opacity: s });
        hbar(200, y, 420, use, mx, { u: E(u, 1.0 + i * 0.3, 1.8 + i * 0.3), text: use + un + ' 사용', h: 22, col: WARN });
        const rx = 200 + 420 * req / mx; el('line', { x1: rx, y1: y - 6, x2: rx, y2: y + 28, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: s });
        mono(rx - 4, y - 8, 'req ' + req + un, { 'font-size': 13.5, fill: INFO, 'text-anchor': 'end', opacity: s }); });
      note(560, 90, '감으로 정한 request를', fade(u, 1.8)); note(560, 116, '실사용이 넘는다', fade(u, 1.9), { fill: WARN }); return; }
    if (k === 1 || k === 2) { const ax = axes(120, 70, 660, 50, { x: [0, 600], y: [0, 1], xt: [0, 100, 200, 300, 400, 500, 600], xl: 'CPU (m)' });
      const P = [['web', 270, 480, ACC, 0], ['worker', 180, 330, INFO, 1]];
      P.forEach(([n, p50, p95, col, i]) => { const y = 82 + i * 22, f = k === 1 ? E(u, 0.3 + i * 0.4, 1.3 + i * 0.4) : 1;
        el('line', { x1: ax.X(p50), y1: y, x2: ax.X(lerp(p50, p95, f)), y2: y, stroke: col, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.6 });
        el('circle', { cx: ax.X(p50), cy: y, r: 6, fill: col }); if (f > 0.95) el('circle', { cx: ax.X(p95), cy: y, r: 6, fill: PANEL, stroke: col, 'stroke-width': 3 });
        tx(ax.X(p95) + 12, y + 5, `${n} P50 ${p50} · P95 ${p95}`, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: f }); });
      if (k === 1) { note(120, 200, 'top은 한 순간 값이다. 2주치 분포에서 P50과 P95를 뽑는다', fade(u, 1.6)); mono(120, 236, 'rate(container_cpu_usage_seconds_total[5m])', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
      const F = [['web request', '270 × 1.1', '297', '300m', ACC], ['web limit', '480 × 1.2', '576', '600m', ACC], ['worker request', '180 × 1.1', '198', '200m', INFO], ['worker limit', '330 × 1.2', '396', '400m', INFO]];
      F.forEach(([n, f, v, r, col], i) => { const y = 200 + i * 50, s = pop(u, 0.2 + i * 0.35);
        tx(120, y, n, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) });
        mono(300, y, f + ' = ' + v, { 'font-size': 16, opacity: fade(u, 0.3 + i * 0.35) });
        grow(500, y - 5, 560, y - 5, fade(u, 0.6 + i * 0.35), MUT);
        mono(580, y, r, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.7 + i * 0.35) }); });
      sub(780, 290, '쓰기 좋은 값으로 올림', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 3) { tx(60, 60, 'VPA 권장값과 대조 (web)', { 'font-size': 16, 'font-weight': 800 });
      [['CPU request', 300, 290, 600, 'm'], ['메모리 request', 512, 660, 1200, 'Mi']].forEach(([n, mine, vpa, mx, un], i) => { const y = 120 + i * 120, g = E(u, 0.3 + i * 0.5, 1.3 + i * 0.5);
        tx(60, y, n, { 'font-size': 15, 'font-weight': 700 });
        hbar(240, y - 14, 420, mine, mx, { u: g, text: '내 값 ' + mine + un, h: 18, col: MUT });
        hbar(240, y + 14, 420, vpa, mx, { u: g, text: 'VPA ' + vpa + un, h: 18, col: ACC });
        const d = Math.round(Math.abs(vpa - mine) / mine * 1000) / 10;
        mono(240, y + 62, `차이 ${d}%`, { 'font-size': 16, 'font-weight': 800, fill: d <= 5 ? GOOD : WARN, opacity: fade(u, 1.4 + i * 0.4) }); });
      note(520, 362, '메모리 request 512Mi는 낮다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 4) { nodeHead(c); rows(c, [1200, 2400], { role: [['SLO 99.9%+', GOOD], ['일반 서비스', WARN], ['일반 서비스', WARN]] }); footer(c); return; }
    // k5
    tx(480, 56, '하지 말아야 할 세 가지', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800 });
    [['모든 Pod 미설정', 'Step 1의 노드 독점이 다시 난다'], ['request = limit를 무조건 적용', '쓰지 않는 자원까지 예약해 클러스터가 빈다'], ['limit만 설정', 'request가 limit과 같게 잡혀 예약이 커진다']].forEach(([a, b], i) => {
      const y = 120 + i * 84, s = pop(u, 0.2 + i * 0.35); card(480, y, 700, 68, { rx: 12, stroke: BAD, sw: 2, s }); cross(170, y, 12, s);
      tx(200, y - 4, a, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); tx(200, y + 20, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); });
    footer(c); }

  const quiz = [
    { q: 'resources를 하나도 적지 않은 Pod의 QoS 클래스는 무엇인가?',
      o: ['BestEffort', 'Burstable', 'Guaranteed'], a: 0,
      why: 'requests도 limits도 없으면 BestEffort다. 예약이 0이라 web이 7400Mi까지 먹어도 막을 장치가 없다.' },
    { q: '스케줄러가 Pod를 노드에 놓을지 정할 때 비교하는 값은 무엇인가?',
      o: ['컨테이너의 지금 사용량', 'requests 합계와 노드의 남은 allocatable', 'limits 합계와 노드 capacity'], a: 1,
      why: '스케줄러는 예약(requests)만 본다. 550m, 896Mi를 예약해도 4 core, 8 GiB 노드에는 자리가 충분하다.' },
    { q: 'web 컨테이너 메모리가 limit 1Gi에 닿으면 어떻게 되는가?',
      o: ['느려지기만 하고 계속 돈다', '노드 전체가 재부팅된다', 'OOMKilled로 그 컨테이너만 종료되고 재시작된다'], a: 2,
      why: 'CPU는 throttle 되지만 메모리는 넘는 순간 SIGKILL이다. Exit Code 137이 남고 worker, cron은 무사하다.' },
    { q: 'db Pod를 Guaranteed로 만들려면 무엇을 해야 하는가?',
      o: ['requests만 크게 잡는다', '모든 컨테이너에서 CPU·메모리 requests와 limits를 같게 적는다', 'limits를 requests의 두 배로 둔다'], a: 1,
      why: '1 core / 2Gi를 requests와 limits에 똑같이 적어야 Guaranteed다. 노드가 부족해도 가장 늦게 쫓겨난다.' },
    { q: 'P50이 270m, P95가 480m인 web의 CPU request와 limit은 경험칙으로 얼마인가?',
      o: ['request 300m, limit 600m', 'request 480m, limit 270m', 'request 250m, limit 500m'], a: 0,
      why: 'request = P50 × 1.1 = 297, limit = P95 × 1.2 = 576이라 300m, 600m으로 올려 잡는다.' },
  ];

  const summary = [
    'requests와 limits가 없으면 한 Pod가 노드 메모리 90%를 먹고 이웃 Pod까지 굶긴다.',
    'requests는 스케줄러가 자리를 잡는 예약값이고, limits는 넘을 수 없는 상한이다.',
    'CPU는 limit을 넘으면 느려지고, 메모리는 넘는 순간 OOMKilled로 컨테이너가 재시작된다.',
    '값은 실측 P50과 P95로 정하고, DB 같은 중요한 Pod만 requests와 limits를 같게 둔다.',
  ];
  const review = [
    { q: 'kubectl describe pod에 Reason: OOMKilled, Restart Count: 3이 보인다. 먼저 의심할 것은?',
      o: ['CPU limit이 너무 낮다', '메모리 사용이 limit을 반복해서 넘는다(누수나 낮은 limit)', '노드의 CPU가 부족하다'], a: 1,
      why: 'OOMKilled는 메모리 limit을 넘었다는 뜻이다. 재시작이 반복되면 누수를 보거나 실측 P99로 limit을 다시 잡는다.' },
    { q: '새 Pod가 계속 Pending이다. 노드 사용률은 낮은데 describe에 Insufficient cpu가 뜬다. 원인은?',
      o: ['다른 Pod 들의 requests 합이 allocatable을 거의 다 예약했다', '컨테이너 이미지가 너무 크다', 'limits가 requests보다 크다'], a: 0,
      why: '스케줄러는 실제 사용량이 아니라 requests 합계로 자리를 센다. 쓰지 않는 예약이 많으면 노드가 한가해도 꽉 찬 것으로 본다.' },
    { q: '노드 메모리가 모자라 Pod 하나를 쫓아내야 한다. db(Guaranteed), web(Burstable, request 아래 사용), cron(BestEffort) 중 먼저 나가는 것은?',
      o: ['db', 'web', 'cron'], a: 2,
      why: 'request가 0인 cron은 쓰는 양이 늘 request를 넘는다. kubelet은 request를 넘겨 쓰는 Pod부터 내보낸다.' },
  ];

  R.page({ title: 'requests · limits와 QoS', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
