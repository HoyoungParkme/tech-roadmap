/* II-2-2 Replication — Leader · Follower · ISR — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   기본값(replica.lag.time.max.ms=30000, replica.fetch.wait.max.ms=500, unclean.leader.election.enable=false)은 Kafka 4.0 broker 설정 문서로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  const X = [260, 520, 780], SY = 100, LY = 206, CW = 19;
  const PR = [86, 360];
  const isLeader = (b) => b.role === 'leader';
  const inIsr = (b) => b.role === 'leader' || b.role === 'follower-isr';
  // broker 한 대: 서버, 이름, 역할, 로그 칸, lag
  function broker(i, b, pb, u, o) { o = o || {}; const x = X[i], dead = b.status === 'down';
    const lamp = dead ? OFF : b.status === 'lagging' ? WARN : b.status === 'syncing' ? INFO : isLeader(b) ? ACC : GOOD;
    server(x, SY, `broker-${b.id}`, { stroke: dead ? OFF : INK, lamp, s: o.s });
    if (o.s != null && o.s < 0.3) return;
    const role = isLeader(b) ? 'Leader' : b.role === 'replica' ? 'replica' : dead ? '다운' : 'Follower';
    if (!o.noRole) pill(x, 184, role, isLeader(b) ? ACC : dead ? BAD : MUT, o.roleS ?? 1, { fs: 14, fill: isLeader(b) ? ACCBG : null });
    const n = b.messages.length, pn = pb && pb.status !== 'down' ? pb.messages.length : n, x0 = x - (11 * (CW + 2)) / 2;
    for (let j = 0; j < 11; j++) { const cx = x0 + j * (CW + 2);
      if (j < n) { const fresh = j >= pn, s = fresh ? pop(u, (o.at ?? 0.6) + (j - pn) * 0.3) : 1;
        if (s > 0.02) { el('rect', { x: cx, y: LY + (1 - s) * 13, width: CW, height: 26 * s, rx: 3, fill: fresh ? ACC : (o.cellCol || INFO), opacity: dead ? 0.3 : fresh ? 1 : 0.75 });
          if (s > 0.6) mono(cx + CW / 2, LY + 18, String(j + 1), { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700 }); } }
      else if ((o.slots && j < 5) || (j < (o.ghost || 0))) el('rect', { x: cx, y: LY, width: CW, height: 26, rx: 3, fill: 'none', stroke: o.ghostCol || GRID, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }); }
    if (!dead && o.lag !== false && b.role !== 'replica' && !isLeader(b)) { const lag = tween(pb && typeof pb.lag === 'number' ? pb.lag : b.lag, b.lag, u);
      mono(x, LY + 52, `lag ${Math.round(lag)}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: b.lag ? WARN : GOOD }); }
    if (dead) cross(x, SY, 28, o.crossS ?? 1); }
  function brokers(c, o) { o = o || {}; const b = c.beat, p = c.prev; b.brokers.forEach((bb, i) => broker(i, bb, p && p.brokers[i], c.u, typeof o === 'function' ? o(i) : o)); }
  function isrBand(members, f) { // members: broker index 배열
    if (!members.length) return; const a = X[Math.min(...members)] - 128, bb = X[Math.max(...members)] + 128;
    zone(a, 34, (bb - a) * (f ?? 1), 262, 'ISR', { fill: C.GOODBG, stroke: GOOD, dash: '7 5', sw: 2, color: GOOD, op: 0.9 }); }
  function producer(o) { o = o || {}; card(PR[0], PR[1], 112, 50, { text: 'Producer', fs: 15, stroke: o.col || INK, sw: 2.2, s: o.s }); }
  const toB = (i) => [[PR[0] + 56, PR[1] - 10], [X[i] - 30, LY + 40]];

  // 1. RF=3
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { b.brokers.forEach((bb, i) => broker(i, bb, null, u, { s: pop(u, 0.2 + i * 0.3), slots: true, noRole: true, lag: false }));
      card(480, 330, 420, 44, { rx: 10, text: '--partitions 1 --replication-factor 3', mono: true, fs: 14.5, stroke: INK, s: pop(u, 1.3) });
      sub(480, 378, 'P0를 담을 자리가 broker 3 곳에 생긴다', fade(u, 1.7)); return; }
    brokers(c, (i) => ({ slots: true, lag: false, at: 0.3 + i * 0.25, crossS: k === 2 ? pop(u, 0.3) : 1 }));
    if (k === 1) card(480, 330, 360, 44, { rx: 10, text: 'Replicas: 1,2,3   Isr: 1,2,3', mono: true, fs: 15, stroke: GOOD, fill: C.GOODBG, s: pop(u, 1.4) });
    if (k === 2) { card(480, 330, 440, 44, { rx: 10, text: 'broker-3이 죽어도 사본 2벌이 남는다', fs: 15, stroke: GOOD, s: pop(u, 1.0) });
      sub(480, 378, 'RF=3이면 2대까지 잃어도 데이터는 산다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    if (k === 3) { card(480, 330, 440, 44, { rx: 10, text: 'RF=3 + min.insync.replicas=2', mono: true, fs: 15, stroke: ACC, fill: ACCBG, s: pop(u, 0.8) });
      sub(480, 378, '운영 표준 조합 · RF가 클수록 디스크·네트워크 비용도 는다', fade(u, 1.4)); } }

  // 2. Leader 하나
  function s2(t, c) { const { k, u } = c, b = c.beat;
    brokers(c, (i) => ({ roleS: k === 0 ? pop(u, 1.0 + i * 0.15) : 1, lag: k === 3 ? undefined : false, ghost: k === 3 && i > 0 ? 4 : 0, ghostCol: BAD, at: 0.9 }));
    if (k === 0) { pill(90, 40, 'Controller', INK, pop(u, 0.2), { fs: 14 }); grow(150, 46, X[0] - 60, SY - 30, E(u, 0.4, 1.0), ACC);
      sub(480, 330, '사본 셋 중 하나만 Leader · 데이터는 셋 다 같다', fade(u, 1.5), { 'font-weight': 700, fill: INK }); return; }
    producer();
    if (k === 1) { grow(PR[0] + 56, PR[1] - 16, X[2] - 30, LY + 40, E(u, 0.2, 0.9), MUT, { dash: '5 5' }); sub(560, 300, 'metadata?', fade(u, 0.6), { class: 'mono', fill: MUT, 'font-weight': 700 });
      fly(X[2] - 30, LY + 60, PR[0] + 70, PR[1] - 66, seg(u, 1.0, 1.7), 'P0 Leader = broker-1', { mono: true, fill: INK, stay: true });
      grow(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, E(u, 1.8, 2.5), ACC); return; }
    grow(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, 1, ACC);
    if (k === 2) { fly(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, seg(u, 0.1, 0.7), 'msg-004', { mono: true });
      sub(X[0], LY + 60, 'offset 3을 붙여 먼저 기록', fade(u, 1.1), { fill: ACC, 'font-weight': 700 }); }
    if (k === 3) { [1, 2].forEach((i) => { grow(PR[0] + 56, PR[1], X[i] - 40, LY + 50, 0.85, BAD, { dash: '5 5', plain: true }); });
      cross(470, 300, 10, pop(u, 0.4)); sub(560, 330, 'Follower는 쓰기를 받지 않는다 · 순서는 Leader가 정한다', fade(u, 0.8), { fill: BAD, 'font-weight': 700 }); } }

  // 3. Follower 가 당겨 간다
  function s3(t, c) { const { k, u } = c, b = c.beat;
    brokers(c, () => ({ at: k === 2 ? 1.0 : 0.6 }));
    producer({ s: k === 0 ? 1 : 1 });
    if (k === 0) fly(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, seg(u, 0.1, 0.6), 'msg-005', { mono: true });
    if (k === 1 || k === 2) { [[1, 'fetch offset 4'], [2, 'fetch offset 3']].forEach(([i, s], j) => {
        const from = X[i] - 60, to = X[0] + 130;
        if (k === 1) { fly(from, 30 + j * 30, to, 30 + j * 30, seg(u, 0.3 + j * 0.4, 1.1 + j * 0.4), s, { mono: true, fill: INFO, stay: true }); }
        else { dot([[X[0] + 60, SY + 10 + j * 12], [X[i] - 60, SY + 10 + j * 12]], seg(u, 0.2, 1.0), ACC, 7); } });
      if (k === 1) sub(480, 330, 'Leader가 밀어 주지 않는다 · Follower가 당겨 간다 (Pull)', fade(u, 1.6), { 'font-weight': 700, fill: INK });
      if (k === 2) sub(480, 330, '새 데이터가 없으면 fetch는 최대 500ms 기다린다 (replica.fetch.wait.max.ms)', fade(u, 1.6)); }
    if (k === 3) { fly(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, seg(u, 0.1, 0.5), 'msg-006·007', { mono: true });
      sub(480, 330, 'lag = Leader 마지막 번호 − Follower 마지막 번호 · 7 − 4 = 3', fade(u, 1.4), { fill: WARN, 'font-weight': 700 });
      sub(480, 352, '줄지 않고 커지면 네트워크·디스크를 의심한다', fade(u, 1.8)); } }

  // 4. ISR
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    const mem = b.brokers.map((bb, i) => (inIsr(bb) ? i : -1)).filter((i) => i >= 0);
    const pmem = p ? p.brokers.map((bb, i) => (inIsr(bb) ? i : -1)).filter((i) => i >= 0) : mem;
    if (k === 2 && pmem.length > mem.length) { const f = E(u, 0.8, 1.6), a = X[0] - 128, full = X[2] + 128 - a, small = X[1] + 128 - a;
      zone(a, 34, lerp(full, small, f), 262, 'ISR', { fill: C.GOODBG, stroke: GOOD, dash: '7 5', sw: 2, color: GOOD, op: 0.9 }); }
    else isrBand(mem, k === 0 ? E(u, 0.2, 1.0) : 1);
    brokers(c, () => ({ at: 0.5 }));
    const st = b.brokers[2].stall;
    if (st != null) { const ps = p && p.brokers[2].stall != null ? p.brokers[2].stall : 0, v = tween(ps, st, u);
      clock(X[2] + 96, 290, 20, Math.min(v / 30, 1), v >= 30 ? BAD : WARN); mono(X[2] + 96, 330, `${Math.round(v)}s / 30s`, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: v >= 30 ? BAD : WARN }); }
    const isr = mem.map((i) => b.brokers[i].id).join(',');
    card(520, 330, 360, 44, { rx: 10, text: `Replicas: 1,2,3   Isr: ${isr}`, mono: true, fs: 15, stroke: mem.length < 3 ? WARN : GOOD, fill: mem.length < 3 ? C.WARNBG : C.GOODBG });
    if (k === 1) sub(520, 378, 'lag은 2 건뿐 · 판정은 건수가 아니라 시간', fade(u, 1.2), { 'font-weight': 700, fill: INK });
    if (k === 2) sub(520, 378, 'broker-3은 이제 Leader 후보가 아니다', fade(u, 1.6), { 'font-weight': 700, fill: BAD });
    if (k === 3) { producer(); grow(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, 1, ACC);
      fly(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, seg(u, 0.1, 0.5), 'acks=all', { mono: true });
      sub(520, 378, 'ISR 2 ≥ min.insync 2 · 쓰기 통과, 한 대만 더 빠지면 거부', fade(u, 1.6), { 'font-weight': 700, fill: WARN }); } }

  // 5. Leader 장애 → ISR 에서 승격
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const mem = b.brokers.map((bb, i) => (inIsr(bb) ? i : -1)).filter((i) => i >= 0);
    isrBand(mem);
    brokers(c, () => ({ at: 0.6, crossS: k === 1 ? pop(u, 0.3) : 1, roleS: k === 2 ? 1 : 1 }));
    const lead = b.brokers.findIndex(isLeader);
    producer({ col: k === 1 ? BAD : INK });
    if (k === 0) { grow(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, 1, ACC); sub(560, 340, '세 로그가 같다 · 지금 Leader가 죽어도 잃을 것이 없다', fade(u, 0.8), { 'font-weight': 700, fill: INK }); }
    if (k === 1) { grow(PR[0] + 30, PR[1] - 25, X[0] - 30, LY + 40, 0.75, BAD, { dash: '5 5', plain: true }); cross(160, 300, 10, pop(u, 0.8));
      sub(560, 340, 'Controller가 세션 만료로 감지 · 이 partition의 읽기·쓰기 잠시 멈춤', fade(u, 1.0), { fill: BAD, 'font-weight': 700 }); }
    if (k === 2) { fly(X[0], 24, X[1], 24, seg(u, 0.3, 1.2), 'Leader', { fill: ACC });
      pill(90, 40, 'Controller', INK, 1, { fs: 14 }); sub(560, 340, 'ISR [2, 3] 안에서 broker-2를 뽑는다', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 3) { grow(PR[0] + 56, PR[1] - 20, X[1] - 30, LY + 40, E(u, 0.1, 0.6), ACC);
      fly(PR[0] + 56, PR[1] - 20, X[1] - 30, LY + 40, seg(u, 0.6, 1.1), 'msg-011', { mono: true });
      banner(560, 342, 'metadata 다시 받아 broker-2로 · 잃은 메시지 0', pop(u, 1.6)); }
    if (lead < 0 && k === 1) sub(X[0], 290, 'Leader 공석', fade(u, 0.6), { fill: BAD, 'font-weight': 800 }); }

  const quiz = [
    { q: 'RF=3인 토픽에서 broker 몇 대까지 죽어도 데이터가 남는가?',
      o: ['1대', '3대', '2대'], a: 2,
      why: '같은 partition의 사본이 세 broker에 하나씩 있다. 두 대가 죽어도 한 벌이 남는다.' },
    { q: 'Producer는 P0의 Leader가 어느 broker인지 어떻게 아는가?',
      o: ['세 broker에 모두 보내 보고 응답한 곳을 쓴다', '아무 broker에나 metadata를 물어 받는다', '항상 broker-1이 Leader다'], a: 1,
      why: '어느 broker든 metadata를 알려 준다. "P0의 Leader는 broker-1"이라는 답을 받고 그곳에 바로 쓴다.' },
    { q: 'Follower가 Leader의 새 메시지를 받는 방식은 무엇인가?',
      o: ['Follower가 "offset 4부터" 하고 fetch로 당겨 간다', 'Leader가 쓰자마자 Follower에게 밀어 준다', 'Producer가 Follower에도 직접 보낸다'], a: 0,
      why: 'Pull 방식이다. Follower가 자기 다음 offset을 적어 FetchRequest를 보내고 받은 것을 로그 끝에 붙인다.' },
    { q: 'broker-3의 lag이 2건뿐인데 ISR에서 빠졌다. 이유로 맞는 것은?',
      o: ['lag이 1건을 넘으면 바로 빠진다', '30초(replica.lag.time.max.ms) 넘게 따라잡지 못했다', 'Leader보다 메시지가 많아졌다'], a: 1,
      why: 'ISR 판정은 건수가 아니라 시간이다. 35초 동안 fetch를 못 해 기준 30초를 넘겼다.' },
    { q: 'Leader broker-1이 죽었다. ISR은 [1, 2, 3], broker-3은 정상이다. 새 Leader가 될 수 있는 broker는?',
      o: ['broker-2나 broker-3', '아무도 없다', 'broker-1이 돌아올 때까지 기다린다'], a: 0,
      why: 'Controller는 살아 있는 ISR 멤버 중에서 고른다. 이 장의 예에서는 broker-2가 뽑혔다.' },
  ];

  const summary = [
    'RF=3이면 같은 partition의 사본이 broker 세 곳에 있어 두 대가 죽어도 데이터가 남는다.',
    '쓰기와 읽기는 Leader 하나가 받고, Follower는 fetch로 당겨 가며 뒤처진 만큼이 lag이다.',
    '30초 넘게 따라오지 못한 Follower는 ISR에서 빠지고 Leader 후보에서도 제외된다.',
    'Leader가 죽으면 Controller가 ISR 안에서 새 Leader를 뽑아 메시지를 잃지 않는다.',
  ];
  const review = [
    { q: 'UnderReplicatedPartitions가 계속 0보다 크고 한 broker의 lag이 줄지 않는다. 먼저 의심할 것은?',
      o: ['그 broker의 네트워크나 디스크', 'Producer의 acks 값', 'consumer 그룹 수'], a: 0,
      why: 'Follower가 fetch를 못 따라가면 lag이 커지고 결국 ISR에서 빠진다. 복제 경로인 네트워크와 디스크를 먼저 본다.' },
    { q: 'ISR에 Leader broker-1만 남은 채 broker-1이 죽었다. 뒤처진 broker-2, 3은 살아 있다. 빨리 살리려고 unclean.leader.election.enable을 켜면?',
      o: ['데이터 손실 없이 바로 원래 상태로 복구된다', 'Controller가 broker-1을 자동으로 다시 켠다', '뒤처진 broker가 Leader가 되어 그 차이만큼 메시지를 잃을 수 있다'], a: 2,
      why: 'ISR 밖 replica는 Leader보다 뒤처져 있다. 그 replica를 Leader로 세우면 못 따라온 메시지가 사라지므로 기본값 false를 유지한다.' },
    { q: 'RF=3, min.insync.replicas=2, acks=all로 운영한다. broker 한 대를 점검으로 내리면 어떻게 되는가?',
      o: ['쓰기가 바로 거부된다', 'ISR 2개로 쓰기는 계속되고 한 대가 더 빠지면 거부된다', '데이터가 1벌만 남는다'], a: 1,
      why: 'ISR이 2개면 기준을 채운다. 한 대를 더 잃어 ISR이 1이 될 때 쓰기를 막아 사본 없는 기록을 피한다.' },
  ];

  R.page({ title: 'orders P0 복제', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
