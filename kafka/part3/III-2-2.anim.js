/* III-2-2 Consumer Group Rebalance — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, lock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const strip = (s) => String(s || '').replace(/^[^\s가-힣A-Za-z0-9"]+\s*/, '');
  const COL = { C1: ACC, C2: INFO, C3: WARN };
  const cid = (s) => String(s).split(' ')[0].replace(/\(.*$/, '');
  const colOf = (id) => COL[cid(id)] || MUT;
  const PY = (i) => 128 + i * 46;           // 파티션 줄 y
  const LX = 96, LW = 34;                   // 파티션 로그 칸

  // 파티션 P0~P5: 오프셋 칸 4개짜리 append-only 로그. fill(i) = 채운 칸 수(쌓인 메시지)
  function partitions(o) { o = o || {};
    for (let i = 0; i < 6; i++) { const y = PY(i), n = o.fill ? o.fill(i) : 2;
      mono(LX - 14, y + 22, 'P' + i, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: o.hi && o.hi(i) ? BAD : INK });
      for (let j = 0; j < 4; j++) el('rect', { x: LX + j * (LW + 3), y: y + 4, width: LW, height: 28, rx: 4,
        fill: j < n ? (o.hot ? WARN : OFF) : 'none', opacity: j < n ? 0.7 : 1, stroke: j < n ? 'none' : GRID, 'stroke-dasharray': '3 3' }); } }
  const pEnd = (i) => [LX + 4 * (LW + 3) + 4, PY(i) + 18];
  // 컨슈머 카드들: 세로로 고르게
  function cPos(n, i) { const top = n > 4 ? 110 : 140, gap = n > 4 ? 44 : 84; return [790, top + i * gap]; }
  function consumers(list, o) { o = o || {}; const n = list.length;
    list.forEach((cn, i) => { const [x, y] = cPos(n, i), st = cn.state, col = colOf(cn.id), h = n > 4 ? 36 : 60;
      const stroke = st === 'stopped' ? BAD : st === 'joining' ? WARN : st === 'idle' ? OFF : st === 'restarting' ? INFO : col;
      const s = o.pop && o.pop(cn) != null ? o.pop(cn) : 1;
      card(x, y, 190, h, { rx: 9, stroke, sw: 2.4, dash: st === 'joining' || st === 'restarting' ? '6 4' : null, fill: st === 'stopped' ? BADBG : PANEL, s });
      tx(x - 82, y + (n > 4 ? 6 : -4), cid(cn.id), { 'font-size': 15, 'font-weight': 800, fill: stroke, opacity: clamp(s) });
      const tag = (cn.id.match(/id: ([^)]+)/) || [])[1];
      if (tag && n <= 4) mono(x - 82, y + 18, tag, { 'font-size': 13.5, fill: MUT, opacity: clamp(s) });
      const lab = { running: cn.partitions.join(' '), joining: '합류 중', stopped: '정지', restarting: '재시작 중', idle: '배정 0개 · 논다' }[st] || '';
      tx(x + 86, y + (n > 4 ? 6 : 6), lab, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: st === 'running' ? INK : stroke, class: st === 'running' ? 'mono' : null, opacity: clamp(s) }); }); }
  // 파티션 → 주인 선. 흐르는 점은 처리 중이라는 뜻
  function links(c, o) { o = o || {}; const b = c.beat, list = b.consumers, n = list.length;
    b.partitions.forEach((p, i) => { const own = String(p.owner); if (own === '?') return;
      const k2 = list.findIndex((x) => cid(x.id) === cid(own)); if (k2 < 0) return;
      const [x2, y2] = cPos(n, k2), [x1, y1] = pEnd(i), res = /예약/.test(own), col = colOf(own), prog = o.prog ? o.prog(i) : 1;
      if (prog <= 0) return;
      el('line', { x1, y1, x2: lerp(x1, x2 - 96, prog), y2: lerp(y1, y2, prog), stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': res || o.wait ? '6 5' : null, opacity: 0.8 });
      if (res) lock((x1 + x2 - 96) / 2, (y1 + y2) / 2, true, INFO, 0.8);
      if (!res && !o.wait && prog >= 1 && list[k2].state === 'running') dot([[x1, y1], [x2 - 96, y2]], ((c.u * 0.5 + i * 0.17) % 1), col, 4.5); }); }
  function lagBox(c, o) { o = o || {}; const p = c.prev || {}, v = tween(p.lag, c.beat.lag, c.u, 1.6);
    tx(940, 40, 'Lag', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    mono(940, 70, fmt(v), { 'font-size': o.big ? 30 : 24, 'font-weight': 800, 'text-anchor': 'end', fill: v >= 5000 ? BAD : v >= 1000 ? WARN : INK }); }

  // 1. 합류·이탈이 rebalance 를 부른다
  function s1(t, c) { const { k, u } = c, b = c.beat;
    lagBox(c);
    if (k === 0) ['새 Consumer 합류', '정상 종료', '비정상 종료', 'heartbeat 누락', '파티션 수 변경'].forEach((s, i) => pill(110 + i * 150, 46, s, INK, pop(u, 0.2 + i * 0.3), { fs: 14 }));
    if (k >= 1 && k <= 2) { server(480, 52, null, { s: 0.6 }); tx(560, 46, 'GroupCoordinator', { 'font-size': 15, 'font-weight': 700 }); }
    partitions({ fill: (i) => (k >= 1 && k <= 2 ? 3 : 2), hot: k >= 1 && k <= 2 });
    if (k === 3) { links(c); consumers(b.consumers);
      el('rect', { x: 260, y: 104, width: 440, height: 290, rx: 12, fill: PANEL, opacity: 0.96, stroke: GRID });
      tx(480, 136, 'Consumer 100개 그룹', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
      for (let i = 0; i < 100; i++) { const cx = 300 + (i % 20) * 19, cy = 170 + Math.floor(i / 20) * 34, d = Math.hypot(i % 20 - 7, Math.floor(i / 20) - 2);
        const hit = seg(u, 0.6 + d * 0.06, 0.8 + d * 0.06); el('circle', { cx, cy, r: 6.5, fill: i === 47 ? (u > 0.3 ? BAD : GOOD) : hit > 0.5 ? WARN : GOOD }); }
      tx(480, 370, '배포로 1개 재시작 → 100개가 함께 rebalance', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    links(c, { wait: k >= 1 && k <= 2, prog: k === 5 ? (i) => E(u, 0.6 + i * 0.12, 1.0 + i * 0.12) : null });
    consumers(b.consumers, { pop: (cn) => (k === 1 && cid(cn.id) === 'C3') || (k === 5 && +cid(cn.id).slice(1) > 3) ? pop(u, 0.3) : null });
    if (k === 1) { b.consumers.forEach((cn, i) => { const [x, y] = cPos(b.consumers.length, i); dot([[x - 40, y - 30], [520, 70]], seg(u, 0.8 + i * 0.2, 1.5 + i * 0.2), WARN, 6); });
      sub(480, 108, 'JoinGroup — 전원이 다시 줄을 선다', fade(u, 1.2), { fill: WARN, 'font-weight': 700 }); }
    if (k === 2) { const [x, y] = cPos(3, 0); pill(x - 40, y - 46, 'leader가 배정 계산', ACC, pop(u, 0.3), { fs: 13.5 });
      b.consumers.forEach((cn, i) => { const [cx, cy] = cPos(3, i); dot([[520, 70], [cx - 40, cy - 30]], seg(u, 1.0 + i * 0.2, 1.7 + i * 0.2), ACC, 6); });
      sub(480, 108, 'SyncGroup 응답 전까지 아무도 소비하지 않는다', fade(u, 1), { fill: ACC, 'font-weight': 700 }); }
    if (k === 4) banner(480, 60, 'rebalance가 도는 동안 나머지 Consumer는 무엇을 하나?', pop(u, 0.3));
    if (k === 5) { tx(480, 60, '컨슈머 7개 · 파티션 6개', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      sub(480, 88, '병렬도의 상한 = 파티션 수', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); } }

  // 2. eager rebalance = Stop-The-World
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    lagBox(c, { big: true });
    server(480, 52, null, { s: 0.6 }); tx(560, 46, 'GroupCoordinator', { 'font-size': 15, 'font-weight': 700 });
    const lagV = tween(p.lag, b.lag, u, 1.6);
    partitions({ fill: (i) => Math.min(4, 1 + Math.floor(lagV / 12000)), hot: true });
    consumers(b.consumers);
    if (k >= 3 || k === 1) for (let i = 0; i < 6; i++) dot([[8, PY(i) + 18], [58, PY(i) + 18]], ((t * 1.3 + i * 0.23) % 1), WARN, 4.5);
    if (k === 0) for (let i = 0; i < 6; i++) { const f = seg(u, 0.2 + i * 0.1, 0.9 + i * 0.1); if (f < 1) el('line', { x1: pEnd(i)[0], y1: PY(i) + 18, x2: lerp(pEnd(i)[0], 694, 1 - f), y2: PY(i) + 18 + (1 - f) * ((i < 3 ? 140 : 224) - PY(i) - 18), stroke: BAD, 'stroke-width': 2, opacity: 1 - f });
      cross(276, PY(i) + 18, 7, pop(u, 1.0 + i * 0.1)); }
    // 시간선 0 ~ 4.5초
    const tx0 = 300, tw0 = 400, X = (s) => tx0 + (s / 4.5) * tw0, Y0 = 404;
    el('line', { x1: tx0, y1: Y0, x2: tx0 + tw0, y2: Y0, stroke: MUT, 'stroke-width': 1.8 });
    [0, 1, 2, 3, 4, 4.5].forEach((s) => mono(X(s), Y0 - 8, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    const nowS = [0.1, 3.0, 4.5, 4.5, 4.5, 4.5][k], prevS = [0, 0.1, 3.0, 4.5, 4.5, 4.5][k], cur = lerp(prevS, nowS, E(u, 0.2, 1.6));
    el('rect', { x: X(0.1), y: Y0 - 36, width: Math.max(0, X(cur) - X(0.1)), height: 10, rx: 3, fill: BAD, opacity: 0.75 });
    tx(X(0.1), Y0 - 44, '소비 0건', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: k >= 1 ? 1 : fade(u, 1) });
    if (k === 1) sub(480, 108, '모든 멤버의 JoinGroup을 기다린다 (100개면 2~5초)', fade(u, 0.6), { fill: WARN, 'font-weight': 700 });
    if (k === 2) banner(480, 250, '4.5초 동안 소비 0건', pop(u, 1.4));
    if (k === 3) { tx(18, 104, 'Producer TPS 10,000', { 'font-size': 14, 'font-weight': 800, fill: WARN });
      banner(480, 250, '4.5초 × 10,000 = 45,000건이 밀린다', pop(u, 1.2)); }
    if (k === 4) ['미커밋 record 재처리 (중복)', '주인이 바뀌어 캐시 무효화', '동시 fetch로 브로커 부하', 'rebalance 중 또 timeout'].forEach((s, i) => {
      const y = 140 + i * 56, sc = pop(u, 0.2 + i * 0.35); card(480, y, 340, 44, { rx: 8, stroke: BAD, sw: 2, s: sc, fill: PANEL, text: (i + 1) + '. ' + s, fs: 15 }); });
    if (k === 5) [['timeout 튜닝', 'Step 3'], ['static membership', 'Step 4'], ['cooperative 배정', 'Step 5']].forEach(([a, r], i) => {
      const y = 150 + i * 66, sc = pop(u, 0.3 + i * 0.4); card(480, y, 320, 50, { rx: 25, stroke: GOOD, sw: 2.2, s: sc, fill: PANEL });
      tx(350, y + 6, a, { 'font-size': 16, 'font-weight': 800, opacity: clamp(sc) }); mono(620, y + 6, r, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: clamp(sc) }); }); }

  // 3. session.timeout / heartbeat 튜닝
  function hbLine(y, hb, sess, pause, u, o) { o = o || {}; const x0 = 90, w = 780, max = 44, X = (s) => x0 + (s / max) * w;
    el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: MUT, 'stroke-width': 1.6 });
    [0, 10, 20, 30, 40].forEach((s) => mono(X(s), y + 20, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    el('rect', { x: X(pause[0]), y: y - 30, width: X(pause[1]) - X(pause[0]), height: 30, fill: SOFT, stroke: OFF, 'stroke-dasharray': '4 3' });
    tx((X(pause[0]) + X(pause[1])) / 2, y - 36, '멈춤 14초 (예)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    const beats = []; for (let s = 0; s <= max; s += hb) { if (s > pause[0] && s < pause[1]) continue; beats.push(s); }
    beats.forEach((s, i) => { const v = seg(u, 0.2 + (s / max) * 1.6, 0.3 + (s / max) * 1.6); if (v <= 0) return; el('rect', { x: X(s) - 3, y: y - 22, width: 6, height: 22 * v, rx: 2, fill: ACC }); });
    const last = Math.max(...beats.filter((s) => s <= pause[0])), dead = last + sess;
    const dl = E(u, 0.9, 2.0); el('line', { x1: X(last), y1: y - 6, x2: X(last) + (Math.min(X(dead), x0 + w) - X(last)) * dl, y2: y - 6, stroke: dead < pause[1] ? BAD : GOOD, 'stroke-width': 3 });
    if (dead < pause[1]) { cross(X(dead), y - 14, 10, pop(u, 2.0)); tx(X(dead) + 16, y - 52, '죽은 것으로 판정 → rebalance', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); }
    else { check(X(pause[1]), y - 14, 10, pop(u, 2.0)); tx(Math.min(X(pause[1]) + 16, 700), y - 52, 'session 안에 돌아옴 → 그대로', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) }); }
    tx(x0 - 10, y - 8, o.label || '', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end' }); }
  function tuneTable(c) { const rows = c.beat.tuning || [], pv = (c.prev && c.prev.tuning) || [];
    zone(30, 236, 560, 176, '설정 값 (전 → 후)', { fill: PANEL, stroke: GRID, sw: 1.5 });
    rows.forEach((r, i) => { const y = 284 + i * 32, s = i >= pv.length ? pop(c.u, 0.3) : 1;
      mono(46, y, r.key, { 'font-size': 14, 'font-weight': 700, opacity: clamp(s) }); mono(330, y, r.before, { 'font-size': 13.5, fill: MUT, opacity: clamp(s) });
      mono(570, y, r.after, { 'font-size': 14.5, 'font-weight': 800, fill: r.after !== r.before.split(' ')[0] ? ACC : INK, 'text-anchor': 'end', opacity: clamp(s) }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    lagBox(c);
    if (k <= 2) { const [hb, sess, lab] = [[3, 10, 'hb 3s · session 10s'], [3, 30, 'hb 3s · session 30s'], [10, 30, 'hb 10s · session 30s']][k];
      hbLine(170, hb, sess, [12, 26], u); tx(90, 64, lab, { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: k === 0 ? BAD : ACC });
      if (k === 0) sub(640, 64, 'Kafka 2.x 기본값 (3.0+ session 기본은 45s)', fade(u, 0.4), { 'font-weight': 700 });
      if (k === 2) sub(640, 64, 'heartbeat = session의 1/3', fade(u, 0.4), { 'font-weight': 700, fill: ACC }); }
    if (k === 3 || k === 4) { const x0 = 90, w = 760, X = (m) => x0 + (m / 6) * w, y = 150;
      el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: MUT, 'stroke-width': 1.6 }); [0, 1, 2, 3, 4, 5, 6].forEach((m) => mono(X(m), y + 20, m + '분', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      el('line', { x1: X(5), y1: y - 70, x2: X(5), y2: y + 4, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' }); tx(X(5) + 6, y - 58, 'max.poll.interval 5분', { 'font-size': 14, 'font-weight': 800, fill: BAD });
      const recs = k === 3 ? 500 : lerp(500, 100, E(u, 0.3, 1.5)), len = recs / 500 * 4.2;   // 처리 시간은 가져온 건수에 비례한다고 본 그림
      tx(x0, 64, 'poll() 한 번 → 처리 → 다음 poll()', { 'font-size': 15, 'font-weight': 800 });
      el('rect', { x: X(0), y: y - 34, width: X(len) - X(0), height: 26, rx: 5, fill: k === 4 ? ACC : WARN, opacity: 0.8 });
      mono(X(0) + 10, y - 16, 'max.poll.records = ' + Math.round(recs), { 'font-size': 14, 'font-weight': 800, fill: PANEL });
      sub(X(2.5), y + 50, k === 3 ? '처리가 5분을 넘으면 그룹에서 빠진다' : '덜 가져오면 poll 사이가 짧아진다', fade(u, 1.2), { 'font-weight': 700, fill: k === 3 ? BAD : ACC }); }
    if (k === 5) { [['heartbeat 10s', '≤', 'session 30s ÷ 3'], ['session 30s', '<', 'max.poll.interval 300s']].forEach(([a, op, r2], i) => { const y = 100 + i * 66, s = pop(u, 0.3 + i * 0.5);
        card(470, y, 600, 52, { rx: 26, stroke: GOOD, sw: 2.2, s }); mono(470, y + 7, a + '  ' + op + '  ' + r2, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(s) }); });
      sub(470, 212, '짧으면 헛 rebalance, 길면 진짜 장애 감지가 늦다', fade(u, 1.5), { 'font-weight': 700, fill: WARN }); }
    tuneTable(c); }

  // 4. static membership
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    lagBox(c);
    partitions();
    links(c); consumers(b.consumers, { pop: () => null });
    if (k === 0) sub(480, 70, 'StatefulSet의 pod 이름은 재시작해도 그대로다', fade(u, 0.5), { 'font-weight': 700, fill: ACC });
    if (k === 1) { R.snippet(240, 30, ['env: POD_NAME ← fieldRef: metadata.name', 'pod_name = os.environ["POD_NAME"]'], { op: fade(u, 0.3), fs: 14 }); }
    if (k === 2) sub(480, 70, 'group_instance_id=pod_name → P2, P3는 C2 자리로 예약', fade(u, 0.5), { 'font-weight': 700, fill: INFO });
    if (k >= 3) { const [x, y] = cPos(3, 1); clock(x - 140, y, 22, k === 3 ? E(u, 0.2, 2.4) * 0.5 : 0.5, INFO, 'session 30s');
      if (k === 3) sub(480, 70, '30초 안에 돌아오면 자리를 지킨다 (pod 재시작은 보통 5~15초)', fade(u, 0.5), { 'font-weight': 700, fill: INFO }); }
    if (k === 4 || k === 5) { const dyn = k === 4, n = dyn ? Math.round(lerp(0, 2, E(u, 0.4, 2.0))) : 0;
      zone(250, 20, 420, 74, '', { fill: dyn ? BADBG : GOODBG, stroke: dyn ? BAD : GOOD });
      tx(270, 50, dyn ? '동적 멤버십이었다면' : '정적 멤버십', { 'font-size': 15, 'font-weight': 800, fill: dyn ? BAD : GOOD });
      tx(270, 76, dyn ? '나갈 때 1번 + 새 멤버로 올 때 1번' : '같은 ID로 복귀 → 예약 파티션 그대로', { 'font-size': 13.5, fill: MUT });
      mono(650, 70, 'rebalance ' + n + '회', { 'font-size': 22, 'font-weight': 800, fill: dyn ? BAD : GOOD, 'text-anchor': 'end' });
      if (dyn) [0.6, 1.6].forEach((a) => { const f = seg(u, a, a + 0.5); if (f > 0 && f < 1) el('rect', { x: 260, y: 104, width: 440, height: 300, fill: BAD, opacity: 0.12 * (1 - f) }); }); } }

  // 5. cooperative sticky
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) {   // 같은 출발(C1 P0~P2, C2 P3~P5)에서 C3 합류 시 세 배정기의 결과 (python 으로 재현)
      const before = { P0: 'C1', P1: 'C1', P2: 'C1', P3: 'C2', P4: 'C2', P5: 'C2' };
      const R3 = [['Range (eager)', { C1: ['P0', 'P1'], C2: ['P2', 'P3'], C3: ['P4', 'P5'] }, '6개 모두 멈춤'], ['RoundRobin (eager)', { C1: ['P0', 'P3'], C2: ['P1', 'P4'], C3: ['P2', 'P5'] }, '6개 모두 멈춤'],
        ['CooperativeSticky', { C1: ['P0', 'P1'], C2: ['P3', 'P4'], C3: ['P2', 'P5'] }, '옮길 2개만 멈춤']];
      tx(480, 40, 'C1 [P0 P1 P2] · C2 [P3 P4 P5]에 C3가 합류하면', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      R3.forEach(([name, asg, stop], j) => { const x = 170 + j * 310, s = pop(u, 0.3 + j * 0.5), moved = Object.entries(asg).reduce((n, [cc, ps]) => n + ps.filter((q) => before[q] !== cc).length, 0);
        zone(x - 140, 70, 280, 300, '', { fill: j === 2 ? GOODBG : SOFT, stroke: j === 2 ? GOOD : GRID, op: clamp(s) });
        tx(x, 100, name, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: j === 2 ? GOOD : INK, opacity: clamp(s) });
        ['C1', 'C2', 'C3'].forEach((cc, r) => { const y = 146 + r * 56; tx(x - 118, y + 6, cc, { 'font-size': 15, 'font-weight': 800, fill: COL[cc], opacity: clamp(s) });
          asg[cc].forEach((q, qi) => { const mv = before[q] !== cc; card(x - 40 + qi * 76, y, 64, 36, { rx: 6, text: q, fs: 14, mono: true, stroke: mv ? BAD : INK, fill: mv ? BADBG : PANEL, color: mv ? BAD : INK, s: pop(u, 0.5 + j * 0.5 + r * 0.1) }); }); });
        mono(x, 330, '주인 바뀜 ' + moved + '개', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: moved > 2 ? BAD : GOOD, opacity: fade(u, 1.2 + j * 0.4) });
        tx(x, 356, stop, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3 + j * 0.4) }); });
      sub(480, 400, '빨간 칸 = 주인이 바뀐 파티션', fade(u, 2.2), { 'font-weight': 700, fill: BAD }); return; }
    lagBox(c);
    partitions({ hi: (i) => k >= 4 && k <= 5 && (i === 2 || i === 5) });
    const moving = (i) => i === 2 || i === 5;
    links(c, { prog: k === 5 ? (i) => (moving(i) ? E(u, 0.4, 1.4) : 1) : null });
    consumers(b.consumers);
    if (k === 4) [2, 5].forEach((i, j) => { cross(330, PY(i) + 18, 9, pop(u, 0.4 + j * 0.4)); });
    if (k >= 1 && k <= 3) { const L = [[], ['"group.instance.id": pod_name,'], ['"partition.assignment.strategy":', '    "cooperative-sticky",'], ['"session.timeout.ms": 30000,', '"heartbeat.interval.ms": 10000,', '"max.poll.interval.ms": 300000,']][k];
      R.snippet(250, 14, L, { op: fade(u, 0.3), fs: 14 }); }
    if (k === 4) sub(480, 70, '① revoke: P2, P5만 내놓는다 — 나머지 넷은 계속 흐른다', fade(u, 0.8), { 'font-weight': 700, fill: BAD });
    if (k === 5) sub(480, 70, '② assign: P2, P5 → C3', fade(u, 0.6), { 'font-weight': 700, fill: WARN });
    if (k === 6) { el('rect', { x: 250, y: 96, width: 432, height: 270, rx: 12, fill: PANEL, opacity: 0.97, stroke: GRID });
      [['멈춘 파티션', 6, 2], ['주인이 바뀐 파티션', 3, 2]].forEach(([n, e, co], i) => { const y = 140 + i * 110;
        tx(270, y, n, { 'font-size': 15, 'font-weight': 800 });
        mono(270, y + 34, 'eager', { 'font-size': 13.5, fill: MUT }); hbar(360, y + 20, 250, e, 6, { u: E(u, 0.2 + i * 0.4, 1.0 + i * 0.4), col: BAD, text: e + '개' });
        mono(270, y + 66, 'coop', { 'font-size': 13.5, fill: MUT }); hbar(360, y + 52, 250, co, 6, { u: E(u, 0.4 + i * 0.4, 1.2 + i * 0.4), col: GOOD, text: co + '개' }); });
      sub(466, 350, 'range 배정과 sticky 배정을 python으로 재현한 값', fade(u, 1.8)); } }

  const quiz = [
    { q: 'C1, C2가 파티션 6개를 나눠 처리하던 그룹에 C3가 JoinGroup을 보냈다. 바로 다음에 일어나는 일은?',
      o: ['C3만 남는 파티션을 받아 바로 시작한다', 'Coordinator가 모든 멤버의 JoinGroup을 기다리며 rebalance를 시작한다', 'C1과 C2는 아무 영향 없이 계속 처리한다'], a: 1,
      why: '구성원이 바뀌면 GroupCoordinator가 rebalance를 연다. SyncGroup으로 새 배정을 받기 전까지 그룹은 소비를 멈춘다.' },
    { q: 'eager rebalance가 4.5초 걸리고 Producer가 초당 10,000건을 넣는다. 그사이 밀리는 양은?',
      o: ['45,000건', '4,500건', '0건, Producer도 멈추니까'], a: 0,
      why: '멈추는 건 Consumer뿐이다. 4.5초 × 10,000 = 45,000건이 Lag으로 쌓인다.' },
    { q: 'session.timeout.ms를 30초로 둘 때 heartbeat.interval.ms로 알맞은 값은?',
      o: ['30초', '60초', '10초 이하'], a: 2,
      why: '공식 문서는 heartbeat를 session의 1/3 이하로 두라고 한다. 30초의 1/3인 10초까지다.' },
    { q: 'group.instance.id를 준 pod가 재시작 후 20초 만에 돌아왔다(session 30초). 결과는?',
      o: ['나갈 때와 올 때 rebalance가 2번 일어난다', '예약된 P2, P3를 그대로 받고 rebalance는 없다', 'P2, P3가 다른 Consumer에게 영구히 넘어간다'], a: 1,
      why: '정적 멤버는 session 안에 같은 ID로 돌아오면 자리를 지킨다. 동적 멤버십이었다면 2번 rebalance가 났다.' },
    { q: 'C1 [P0 P1 P2], C2 [P3 P4 P5]에 C3가 합류할 때 cooperative-sticky가 옮기는 파티션은?',
      o: ['P2, P4, P5', 'P0~P5 전부', 'P2, P5'], a: 2,
      why: 'sticky는 각자 2개까지 그대로 두고 남는 P2, P5만 C3에게 준다. range였다면 P2, P4, P5의 주인이 바뀐다.' },
  ];

  const summary = [
    'Consumer가 들어오거나 나가거나 heartbeat가 끊기면 그룹 전체의 rebalance가 시작된다.',
    'eager 방식은 모두가 파티션을 내놓고 멈춰서, 4.5초면 TPS 10,000에서 45,000건이 밀린다.',
    'heartbeat는 session의 1/3 이하로 두고, group.instance.id로 재시작 때 rebalance를 피한다.',
    'cooperative-sticky는 옮길 파티션만 거둬서, C3 합류 때 P2와 P5 두 개만 멈춘다.',
  ];
  const review = [
    { q: '배포 때마다 Lag이 수만 건씩 튄다. Consumer는 StatefulSet pod 50개다. 먼저 해 볼 것은?',
      o: ['pod 이름을 group.instance.id로 주는 정적 멤버십', 'max.poll.records를 500에서 1,000으로 늘리기', '파티션 수를 줄이기'], a: 0,
      why: '재시작한 pod가 session 안에 같은 ID로 돌아오면 rebalance가 일어나지 않는다. 배포로 생기는 멈춤이 사라진다.' },
    { q: 'Consumer를 6개에서 10개로 늘렸는데 처리량이 그대로다. 토픽 파티션은 6개다. 왜인가?',
      o: ['heartbeat 주기가 너무 짧다', '파티션 수보다 많은 Consumer 4개는 받을 파티션이 없어 논다', 'cooperative 배정을 안 써서다'], a: 1,
      why: '한 파티션은 그룹 안에서 한 Consumer만 읽는다. 병렬도의 상한은 파티션 수 6이다.' },
    { q: '처리 로직이 느려져 poll 사이가 5분을 넘기자 Consumer가 계속 그룹에서 빠진다. 알맞은 조치는?',
      o: ['session.timeout.ms만 크게 늘린다', 'max.poll.records를 줄여 poll 한 번의 처리 시간을 줄인다', 'heartbeat.interval.ms를 session보다 크게 한다'], a: 1,
      why: 'poll 사이 간격은 max.poll.interval.ms가 본다. 한 번에 덜 가져오면 처리 시간이 줄어 5분 안에 다음 poll이 온다.' },
  ];

  R.page({ title: 'Consumer Group Rebalance', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
