/* II-2-2 DaemonSet & Job & CronJob — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 노드·Job 칸·CronJob 기록은 각 beat 의 daemonset / job / cronjob 데이터에서 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, terminal, meters, clock, lock, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 노드 ----------
  // 노드 상자: 이름, 가운데 Pod 자리, 아래 /var/log 폴더
  function node(cx, cy, id, o) { o = o || {}; const w = o.w || 170, h = 150;
    const g = card(cx, cy, w, h, { rx: 10, stroke: o.isNew ? ACC : INK, fill: SOFT, sw: 2.2, dash: o.isNew && !o.ready ? '7 5' : null, s: o.s, op: o.op });
    mono(-w / 2 + 12, -h / 2 + 22, id, { 'font-size': 15, 'font-weight': 800 }, g);
    if (o.tag) tx(w / 2 - 12, -h / 2 + 22, o.tag, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: ACC }, g);
    el('path', { d: `M${-w / 2 + 14},${h / 2 - 34} h22 l6,6 h40 v22 h-68 z`, fill: PANEL, stroke: o.logHot ? WARN : GRID, 'stroke-width': 1.8 }, g);
    mono(-w / 2 + 92, h / 2 - 15, '/var/log', { 'font-size': 13.5, fill: o.logHot ? WARN : MUT }, g);
    return g; }
  function agent(cx, cy, o) { o = o || {}; return card(cx, cy, 120, 40, { rx: 8, stroke: GOOD, fill: GOODBG, sw: 2.2, text: o.text || 'fluentd', fs: 14.5, mono: true, color: INK, s: o.s, dash: o.dash }); }
  function dsCard(s) { const g = card(480, 46, 420, 50, { rx: 10, stroke: INFO, fill: INFOBG, sw: 2.4, s });
    tx(-196, 6, 'DaemonSet', { 'font-size': 16, 'font-weight': 800, fill: INFO }, g); mono(-96, 6, 'log-collector · kube-system', { 'font-size': 14.5 }, g); }
  function dsMeters(n, op) { if (op <= 0) return; meters(250, 336, 460, [{ name: 'DESIRED', val: String(n) }, { name: 'CURRENT', val: String(n) }, { name: 'READY', val: String(n), good: true }], { h: 62 }); }

  // ---------- 1. DaemonSet ----------
  const NX3 = [220, 480, 740];
  function s1(t, c) { const { k, u } = c, nodes = c.beat.daemonset.nodes;
    dsCard(k === 0 ? pop(u, 0.2) : 1);
    if (k === 0) { pill(820, 46, 'replicas', MUT, pop(u, 0.9), { mono: true, fs: 14 }); el('line', { x1: 770, y1: 46, x2: 870, y2: 46, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.3) });
      tx(480, 112, '개수를 적지 않는다 · 노드 수가 곧 Pod 수', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.6) }); }
    const nodeOp = k === 0 ? 0.45 * fade(u, 0.5) : k === 2 ? 0.5 : 1;
    if (k !== 2) nodes.forEach((n, i) => node(NX3[i], 215, n.id, { op: nodeOp, logHot: k === 3 }));
    if (k === 1) { pill(300, 112, 'selector app=log-collector', INFO, pop(u, 0.3), { mono: true, fs: 13.5 });
      card(720, 112, 160, 40, { rx: 8, stroke: GOOD, dash: '6 4', sw: 2, fill: 'none', s: pop(u, 0.9) }); mono(720, 117, 'template', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) });
      tx(480, 322, '노드마다 이 Pod를 하나씩 찍는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
    if (k === 2) { // taint 와 toleration
      card(480, 215, 300, 160, { rx: 12, stroke: WARN, fill: WARNBG, sw: 2.4, s: pop(u, 0.2) });
      mono(480, 160, 'control-plane 노드', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      mono(480, 186, 'taint NoSchedule', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.6) });
      const open = u > 1.6; lock(480, 228, !open, open ? GOOD : WARN, pop(u, 0.5));
      fly(220, 340, 480, 262, seg(u, 0.8, 1.6), 'toleration', { fill: GOOD, mono: true, stay: true });
      tx(480, 318, open ? '있으면 거기에도 올린다' : '', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD }); }
    if (k === 3) { agent(NX3[0], 205, { dash: '6 4', s: pop(u, 0.3) });
      grow(NX3[0], 226, NX3[0] - 40, 262, E(u, 0.8, 1.4), WARN);
      tx(NX3[0] + 98, 150, 'hostPath', { 'font-size': 14, 'font-weight': 800, fill: WARN, class: 'mono', opacity: fade(u, 1.3) });
      tx(480, 330, '노드의 /var/log를 그대로 읽으려면 그 노드 위에 있어야 한다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
    if (k === 4) { nodes.forEach((n, i) => { const g = seg(u, 0.2 + i * 0.35, 0.9 + i * 0.35); fly(480, 70, NX3[i], 205, g, 'fluentd', { fill: GOOD, mono: true }); if (g >= 1) agent(NX3[i], 205); });
      dsMeters(3, fade(u, 1.6)); } }

  // ---------- 2. 노드 추가 ----------
  const NX4 = [140, 350, 560, 790];
  function s2(t, c) { const { k, u } = c, nodes = c.beat.daemonset.nodes;
    nodes.forEach((n, i) => { const isNew = n.id === 'node-4', sx = isNew && k === 1 ? lerp(860, NX4[3], E(u, 0.2, 1.2)) : NX4[i];
      node(sx, 230, n.id, { isNew, ready: k >= 2, tag: isNew && k >= 2 ? 'Ready 12s' : null, op: isNew && k === 1 ? fade(u, 0.1, 0.6) : 1 });
      if (n.hasPod) { if (isNew && k === 3) { fly(560, 40, NX4[3], 220, seg(u, 0.6, 1.5), 'fluentd', { fill: GOOD, mono: true }); if (u > 1.5) agent(NX4[3], 220); } else agent(NX4[i], 220, { text: k === 4 ? ['aa11', 'bb22', 'cc33', 'dd44'][i] : 'fluentd' }); } });
    if (k === 0) terminal(140, 22, 600, 92, ['$ kubeadm token create --print-join-command', ['kubeadm join 10.0.0.1:6443 --token abc.xyz ...', 'var(--term)']], E(u, 0.1, 1.3) * 2, { title: 'control-plane' });
    const nN = nodes.length, nP = nodes.filter((n) => n.hasPod).length;
    if (k >= 1) { const bad = nN !== nP; mono(140, 70, `노드 ${nN}`, { 'font-size': 22, 'font-weight': 800 }); mono(270, 70, bad ? '≠' : '=', { 'font-size': 22, 'font-weight': 800, fill: bad ? BAD : GOOD });
      mono(310, 70, `Pod ${k === 3 ? (u > 1.5 ? 4 : 3) : nP}`, { 'font-size': 22, 'font-weight': 800, fill: bad && !(k === 3 && u > 1.5) ? WARN : GOOD }); }
    if (k === 3) { mono(560, 70, `DESIRED ${u > 0.5 ? 4 : 3}`, { 'font-size': 20, 'font-weight': 800, fill: ACC }); tx(560, 96, '사람이 손대지 않았다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) tx(560, 70, 'DaemonSet 컨트롤러가 노드 목록을 지켜본다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) });
    if (k === 4) tx(560, 70, '노드를 빼면 그 노드의 Pod도 정리된다', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
    if (k === 4) mono(140, 400, 'get pods -o wide · log-collector-aa11 … dd44가 노드마다 하나', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) }); }

  // ---------- 3. Job 한 번 ----------
  const JSTATE = { pending: [OFF, PANEL, 'Pending'], running: [WARN, WARNBG, 'Running'], succeeded: [GOOD, GOODBG, 'Completed'], failed: [BAD, BADBG, 'Failed'] };
  function s3(t, c) { const { k, u } = c, j = c.beat.job;
    const jg = card(200, 60, 300, 50, { rx: 10, stroke: INFO, fill: INFOBG, sw: 2.4, s: k === 0 ? pop(u, 0.2) : 1 });
    tx(-134, 6, 'Job', { 'font-size': 16, 'font-weight': 800, fill: INFO }, jg); mono(-90, 6, 'db-migration', { 'font-size': 15 }, jg);
    const sl = j.slots[0];
    if (!sl) { card(200, 210, 220, 96, { rx: 12, stroke: GRID, dash: '6 5', fill: 'none' }); tx(200, 216, '실행 칸 없음', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) }); }
    else { const [col, bg, word] = JSTATE[sl.state]; card(200, 210, 220, 96, { rx: 12, stroke: col, fill: bg, sw: 2.6, dash: sl.state === 'pending' ? '6 5' : null, s: k === 1 ? pop(u, 0.3) : 1 });
      mono(200, 200, 'migrate', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); tx(200, 226, word, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col });
      if (sl.state === 'running') { const a = t * 3; el('path', { d: `M ${200 + 70 * Math.cos(a)},${210 + 70 * Math.sin(a) * 0.62} A 70 43 0 0 1 ${200 + 70 * Math.cos(a + 1.4)},${210 + 70 * Math.sin(a + 1.4) * 0.62}`, fill: 'none', stroke: WARN, 'stroke-width': 4, 'stroke-linecap': 'round' }); }
      if (sl.state === 'succeeded') check(296, 176, 12, k === 3 ? pop(u, 0.3) : 1);
      mono(200, 296, `${j.succeeded} / ${j.completions}`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: j.succeeded ? GOOD : MUT }); }
    if (k === 1) [['completions', '1', '한 번 성공하면 끝'], ['parallelism', '1', '동시에 하나'], ['backoffLimit', '3', '실패하면 다시 시도'], ['ttlSecondsAfterFinished', '3600', '끝나고 1시간 뒤 정리']].forEach(([a, v, d], i) => {
        const y = 60 + i * 64, op = fade(u, 0.4 + i * 0.35); mono(440, y, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(900, y, v, { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: op }); tx(440, y + 24, d, { 'font-size': 13.5, fill: MUT, opacity: op }); });
    if (k === 2) { snippet(440, 120, ['restartPolicy: OnFailure', 'command: ["python", "manage.py", "migrate"]'], { fs: 14.5, op: fade(u, 0.3) }); }
    if (k === 3) { card(690, 210, 320, 150, { rx: 12, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 0.8) });
      tx(560, 162, 'Deployment 였다면', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      const a = t * 2.5; el('circle', { cx: 620, cy: 225, r: 30, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '120 70', transform: `rotate(${(a * 180) / Math.PI} 620 225)`, opacity: fade(u, 1.1) });
      tx(668, 220, '끝나도 다시 시작', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) }); tx(668, 244, 'restartPolicy Always', { 'font-size': 13.5, fill: MUT, class: 'mono', opacity: fade(u, 1.3) }); }
    if (k === 4) terminal(430, 110, 500, 150, ['$ kubectl logs job/db-migration', ['Running migration 0042_add_user_email...', 'var(--term)'], ['Running migration 0043_create_orders...', 'var(--term)'], ['All migrations applied. Done in 38.2s', 'var(--term)']], E(u, 0.1, 2.0) * 4, { title: 'bash' }); }

  // ---------- 4. 병렬 Job (Indexed) ----------
  const T0 = 200, TW = 640, TS = (s) => T0 + (s / 78) * TW;   // 시간축 0 ~ 1m18s
  function s4(t, c) { const { k, u } = c, j = c.beat.job, p = (c.prev && c.prev.job) || {};
    tx(40, 46, '청크 (completions 6)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    j.slots.forEach((sl, i) => { const [col, bg] = JSTATE[sl.state]; card(250 + i * 90, 84, 74, 46, { rx: 8, stroke: col, fill: bg, sw: 2.2, dash: sl.state === 'pending' ? '5 4' : null, text: 'idx ' + i, fs: 14, mono: true, s: k === 0 ? pop(u, 0.2 + i * 0.12) : 1 }); });
    const done = tween(p.succeeded, j.succeeded, u);
    mono(860, 92, `${Math.round(done)}/6`, { 'font-size': 22, 'font-weight': 800, fill: j.succeeded === 6 ? GOOD : ACC, 'text-anchor': 'middle' });
    // 워커 줄 3개 (parallelism 3)
    for (let w = 0; w < 3; w++) { const y = 170 + w * 56; tx(40, y + 6, `워커 ${w + 1}`, { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.9 + w * 0.2) : 1 });
      el('line', { x1: T0, y1: y, x2: T0 + TW, y2: y, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' });
      const bar = (a, b, idx, g, col) => { if (g <= 0) return; el('rect', { x: TS(a), y: y - 17, width: (TS(b) - TS(a)) * g, height: 34, rx: 6, fill: col, opacity: 0.85 }); if (g > 0.3) mono(TS(a) + 12, y + 5, 'JOB_INDEX=' + idx, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL }); };
      const g1 = k === 1 ? E(u, 0.4, 2.4) * 0.6 : k >= 2 ? 1 : 0, g2 = k === 2 ? E(u, 0.8, 2.4) * 0.6 : k === 3 ? lerp(0.6, 1, E(u, 0.2, 1.4)) : 0;
      bar(0, 42, w, g1, k >= 2 ? GOOD : WARN); bar(42, 78, w + 3, g2, k === 3 && u > 1.4 ? GOOD : WARN); }
    const ax = { y: 330 }; el('line', { x1: T0, y1: ax.y, x2: T0 + TW, y2: ax.y, stroke: MUT, 'stroke-width': 1.8 });
    [[0, '0s'], [42, '42s'], [78, '1m18s']].forEach(([s, l]) => { el('line', { x1: TS(s), y1: ax.y, x2: TS(s), y2: ax.y + 6, stroke: MUT }); mono(TS(s), ax.y + 24, l, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    if (k === 0) tx(480, 390, '동시에 도는 것은 언제나 3개까지', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) });
    if (k === 2) tx(480, 390, '3개가 끝난 42s에 빈 줄로 다음 청크가 들어간다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    if (k === 3) banner(480, 392, 'completions 6을 채우면 Job이 스스로 끝난다', pop(u, 1.6)); }

  // ---------- 5. CronJob ----------
  // 24시간 시계: 표시할 시각들 [h, 색, 이름]
  function dial(cx, cy, r, marks, op) { el('circle', { cx, cy, r, fill: PANEL, stroke: GRID, 'stroke-width': 2.2, opacity: op });
    for (let h = 0; h < 24; h += 6) { const a = (h / 24) * Math.PI * 2 - Math.PI / 2; mono(cx + Math.cos(a) * (r + 18), cy + Math.sin(a) * (r + 18) + 5, String(h), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
    marks.forEach(([h, col, s, g]) => { if (g <= 0) return; const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
      el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * r * 0.85 * g, y2: cy + Math.sin(a) * r * 0.85 * g, stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round' });
      if (g >= 1) tx(cx + Math.cos(a) * (r + 44), cy + Math.sin(a) * (r + 40) + 5, s, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }); }
  function s5(t, c) { const { k, u } = c;
    const g = card(480, 46, 400, 50, { rx: 10, stroke: INFO, fill: INFOBG, sw: 2.4, s: k === 0 ? pop(u, 0.2) : 1 });
    tx(-184, 6, 'CronJob', { 'font-size': 16, 'font-weight': 800, fill: INFO }, g); mono(-100, 6, 'nightly-db-backup', { 'font-size': 15 }, g);
    if (k === 0) { dial(480, 240, 90, [], fade(u, 0.5)); tx(480, 245, '스케줄 없음', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) }); }
    if (k === 1) { const F = [['0', '분'], ['2', '시'], ['*', '일'], ['*', '월'], ['*', '요일']];
      F.forEach(([v, l], i) => { const x = 110 + i * 62, s = pop(u, 0.2 + i * 0.25); card(x, 170, 50, 56, { rx: 8, stroke: i < 2 ? ACC : GRID, fill: i < 2 ? ACCBG : PANEL, text: v, fs: 22, mono: true, s }); tx(x, 220, l, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.25) }); });
      tx(110 - 25, 270, '매일 02시 00분에 Job 하나', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
      dial(700, 230, 100, [[2, ACC, '02:00', E(u, 1.4, 2.0)]], 1); }
    if (k === 2) { dial(700, 230, 100, [[2, ACC, 'KST 02:00', 1], [11, WARN, 'KST 11:00', E(u, 0.6, 1.3)]], 1);
      mono(80, 160, 'timeZone: "Asia/Seoul"', { 'font-size': 16, 'font-weight': 700, fill: ACC }); tx(80, 190, '→ 한국 시각 02:00에 돈다', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      tx(80, 250, '없으면 kube-controller-manager 시간대', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) }); tx(80, 276, '그곳이 UTC면 한국 시각 11:00', { 'font-size': 14.5, fill: WARN, opacity: fade(u, 1.4) });
      mono(80, 320, 'Kubernetes 1.27부터 정식 기능', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 3) { // 보관 한도와 Forbid
      tx(60, 130, '보관', { 'font-size': 15, 'font-weight': 800 });
      for (let i = 0; i < 3; i++) card(150 + i * 54, 125, 44, 34, { rx: 6, stroke: GOOD, fill: GOODBG, text: '성공', fs: 13.5, s: pop(u, 0.2 + i * 0.15) });
      card(330, 125, 44, 34, { rx: 6, stroke: BAD, fill: BADBG, text: '실패', fs: 13.5, s: pop(u, 0.7) });
      mono(380, 130, '3 / 1', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.9) });
      const X = (d) => 120 + d * 220, y = 260; el('line', { x1: 100, y1: y + 30, x2: 860, y2: y + 30, stroke: MUT, 'stroke-width': 1.8 });
      ['1일 02:00', '2일 02:00', '3일 02:00'].forEach((l, d) => { el('line', { x1: X(d), y1: y + 22, x2: X(d), y2: y + 38, stroke: MUT, 'stroke-width': 2 }); tx(X(d), y + 60, l, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
      el('rect', { x: X(0), y: y - 6, width: (X(1) - X(0)) * 1.35 * E(u, 0.9, 1.9), height: 26, rx: 5, fill: WARN, opacity: 0.8 });
      tx(X(0) + 8, y + 12, '지난 회차가 아직 도는 중', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: fade(u, 1.5) });
      cross(X(1), y - 30, 12, pop(u, 2.0)); tx(X(1) + 22, y - 25, 'Forbid · 이번 회차 건너뜀', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); }
    if (k === 4) { card(200, 210, 230, 70, { rx: 10, stroke: INFO, dash: '7 5', fill: 'none', s: pop(u, 0.2) }); tx(200, 216, 'jobTemplate', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      fly(320, 210, 560, 210, seg(u, 0.7, 1.4), 'Job', { fill: INFO, stay: true });
      grow(600, 210, 680, 210, E(u, 1.4, 1.8), MUT); card(770, 210, 160, 60, { rx: 10, stroke: GOOD, fill: GOODBG, text: 'backup-tool:v3', fs: 14, mono: true, s: pop(u, 1.8) });
      mono(480, 310, 'args --target s3://backup/db --retention 30d', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 5) { [['SCHEDULE', '0 2 * * *'], ['LAST SCHEDULE', '12h ago'], ['ACTIVE', '0']].forEach(([h, v], i) => { const x = 220 + i * 260;
        tx(x, 170, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.3) }); mono(x, 210, v, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 2 ? GOOD : INK, opacity: fade(u, 0.4 + i * 0.3) }); });
      tx(480, 290, '등록만 된 상태 · 다음 02:00을 기다린다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); } }

  // ---------- 6. 회차 기록 ----------
  const DUR = { '4m12s': 252, '0m18s': 18, '4m38s': 278, '2m12s': 132 };
  const DAYX = { '5/4': 250, '5/5': 420, '5/6': 590, '5/7': 760 };
  function s6(t, c) { const { k, u } = c, cj = c.beat.cronjob, prevN = c.prev ? c.prev.cronjob.history.length : 0;
    const base = 330; el('line', { x1: 160, y1: base, x2: 860, y2: base, stroke: MUT, 'stroke-width': 1.8 });
    // 막대 높이는 걸린 시간(최대 5분 = 140px)
    cj.history.slice().reverse().forEach((h, i) => { const day = h.ts.split(' ')[0], x = DAYX[day], fresh = i >= prevN && k <= 2;
      const g = fresh ? E(u, 0.3 + (i - prevN) * 0.5, 1.2 + (i - prevN) * 0.5) : 1, hh = (DUR[h.dur] / 300) * 140 * g, col = h.state === 'success' ? GOOD : h.state === 'failed' ? BAD : WARN;
      el('rect', { x: x - 34, y: base - hh, width: 68, height: hh, rx: 6, fill: col, opacity: 0.85 });
      if (g > 0.95) mono(x, base - hh - 10, h.state === 'running' ? h.dur + '…' : h.dur, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col });
      tx(x, base + 24, day, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: g > 0 ? 1 : 0 });
      mono(x, base + 46, '-' + h.name.split('-').pop(), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: g > 0 ? 1 : 0 });
      if (h.state === 'failed') mono(x, base + 66, '0/1', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD }); });
    tx(160, base + 46, 'Job 이름 끝', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (k === 0) tx(480, 60, '이름 끝 숫자 = 예정 시각 (유닉스 분)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) });
    if (k === 2) { [['5/4', '5/5'], ['5/5', '5/6'], ['5/6', '5/7']].forEach(([a, b], i) => mono((DAYX[a] + DAYX[b]) / 2, base + 86, '+1440', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.3 + i * 0.2) })); }
    if (k === 3) terminal(160, 20, 640, 120, ['$ kubectl logs job/nightly-db-backup-29631900', ['connecting to s3://backup/db ...', 'var(--term)'], ['ERROR: AccessDenied — IAM policy missing s3:PutObject', '#fca5a5'], ['exit code 1', 'var(--term)']], E(u, 0.1, 1.8) * 4, { title: 'bash' });
    if (k === 4) { snippet(160, 24, ['expr: kube_job_failed{job_name=~"nightly-.*"} > 0', 'for: 1m'], { fs: 14.5 });
      const fire = u > 1.6; pill(800, 60, fire ? 'CronJobFailed 발동' : '1분 지켜보는 중', fire ? BAD : WARN, 1, { fs: 14 }); }
    if (k === 5) { card(300, 70, 280, 64, { rx: 10, stroke: BAD, fill: BADBG, sw: 2.2, s: pop(u, 0.2) });
      tx(300, 64, '야간 백업 실패 · IAM 확인', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) }); mono(300, 88, 'runbook: wiki/runbook/cronjob-failed', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
      grow(440, 60, 600, 46, E(u, 0.8, 1.3), BAD); grow(440, 80, 600, 100, E(u, 1.1, 1.6), BAD);
      pill(690, 46, '#ops-alerts', INFO, pop(u, 1.3), { mono: true, fs: 14 }); pill(690, 100, 'PagerDuty', WARN, pop(u, 1.6), { fs: 14 }); } }

  const quiz = [
    { q: 'DaemonSet 매니페스트에 replicas가 없는 이유는 무엇인가?',
      o: ['Pod 수가 노드 수로 정해지기 때문', '기본값 1이 들어가기 때문', 'HPA가 대신 정하기 때문'], a: 0,
      why: '노드마다 하나씩 올리는 것이 규칙이라 노드가 3개면 Pod도 3개다. 그래서 DESIRED가 노드 수를 따라간다.' },
    { q: 'node-4가 클러스터에 합류하면 log-collector에 일어나는 일은 무엇인가?',
      o: ['사람이 replicas를 4로 올려야 한다', '아무 일도 없다', 'DaemonSet이 알아서 node-4에 Pod를 하나 올린다'], a: 2,
      why: 'DaemonSet 컨트롤러가 노드 목록 변화를 보고 DESIRED를 3에서 4로 올린 뒤 새 노드에 Pod를 놓는다.' },
    { q: 'db-migration Job의 Pod가 성공하면 어떻게 되는가?',
      o: ['Completed로 남아 로그를 볼 수 있다', '곧바로 다시 시작한다', '바로 삭제된다'], a: 0,
      why: 'Job은 끝이 있는 일이라 성공한 Pod를 Completed로 남긴다. 이 예는 ttlSecondsAfterFinished 3600이라 1시간 뒤 정리된다.' },
    { q: 'completions 6, parallelism 3인 Job에서 동시에 도는 Pod는 최대 몇 개인가?',
      o: ['6개', '3개', '2개'], a: 1,
      why: 'parallelism이 동시 실행 상한이다. 3개가 끝나면 빈자리에 다음 인덱스가 들어가 총 6번 성공을 채운다.' },
    { q: 'schedule "0 2 * * *"에 timeZone이 없고 kube-controller-manager가 UTC로 돌면 한국 시각 몇 시에 실행되는가?',
      o: ['02:00', '17:00', '11:00'], a: 2,
      why: 'timeZone이 없으면 컨트롤러가 도는 곳의 시간대를 쓴다. UTC 02:00은 한국 시각 11:00이다.' },
    { q: '5/5 백업이 18초 만에 0/1로 끝난 원인은 무엇이었나?',
      o: ['스케줄 문법 오류', 'IAM 정책에 s3:PutObject 권한이 없어서', 'concurrencyPolicy Forbid 때문에'], a: 1,
      why: '로그에 AccessDenied가 찍혔다. 코드가 아니라 권한 문제였고 CronJobFailed 알람이 이를 알려 준다.' },
  ];

  const summary = [
    'DaemonSet은 replicas 없이 노드마다 Pod 하나를 두고, 노드가 늘면 Pod도 따라 는다.',
    'Job은 성공하면 끝나고 Pod를 Completed로 남겨 로그를 읽을 수 있다.',
    'completions 6, parallelism 3이면 동시에 3개씩 돌며 6번 성공할 때까지 이어 간다.',
    'CronJob은 정해진 시각마다 Job을 만들고, timeZone을 빼면 컨트롤러 시간대를 따른다.',
  ];
  const review = [
    { q: '노드마다 붙어 디스크 사용량을 모으는 에이전트를 띄우려 한다. 알맞은 것은?',
      o: ['replicas를 노드 수로 맞춘 Deployment', 'DaemonSet', 'completions를 노드 수로 둔 Job'], a: 1,
      why: 'Deployment는 노드가 늘어도 개수가 그대로이고 한 노드에 몰릴 수도 있다. DaemonSet은 노드가 늘면 Pod도 따라 는다.' },
    { q: '매일 02:00 백업 CronJob이 어느 날 4시간 넘게 돌았고 다음 날 회차가 생기지 않았다. 먼저 볼 설정은?',
      o: ['successfulJobsHistoryLimit', 'parallelism', 'concurrencyPolicy Forbid'], a: 2,
      why: 'Forbid는 앞 회차가 안 끝났으면 이번 회차를 건너뛴다. 오래 걸리는 작업이면 시간 제한이나 정책을 다시 정해야 한다.' },
    { q: 'DB 마이그레이션을 Deployment로 돌렸더니 Pod가 계속 재시작했다. 이유와 대안으로 맞는 것은?',
      o: ['Deployment는 끝난 컨테이너도 다시 띄우므로 Job으로 바꾼다', '이미지가 커서 그렇다, replicas를 줄인다', 'readinessProbe가 없어서 그렇다'], a: 0,
      why: 'Deployment Pod는 restartPolicy Always라 일이 끝나도 다시 시작한다. 끝이 있는 일은 Job이 Completed로 남긴다.' },
  ];

  R.page({ title: '노드마다 · 한 번만 · 정해진 시각에', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
