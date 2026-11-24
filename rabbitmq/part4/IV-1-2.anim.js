/* IV-1-2 Quorum Queue (Raft 복제) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 노드마다 Raft 로그 한 줄을 그린다. 로그 길이·커밋 위치·ack 수는 beat 의 cluster[].index · commit 에서 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    person, cross, check, clock, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ROLE = { leader: ['LEADER', ACC], follower: ['follower', INFO], candidate: ['candidate', WARN], down: ['DOWN', BAD], mirror: ['mirror', MUT] };
  // ---------- Raft 로그 한 줄 ----------
  const RY = [62, 122, 182], CX0 = 300, CW = 46;
  const cellX = (i) => CX0 + i * (CW + 6);              // i = 0 → idx 1
  function row(r, name, role, n, o) { o = o || {}; const y = RY[r], down = role === 'down', [rl, rc] = ROLE[role] || ROLE.follower;
    mono(30, y + 6, name, { 'font-size': 15, 'font-weight': 700, fill: down ? MUT : INK, opacity: o.op ?? 1 });
    if (o.roleS !== 0) pill(222, y, rl, rc, o.roleS ?? 1, { fs: 13.5, mono: true, fill: role === 'leader' ? ACCBG : PANEL });
    const max = o.max || 7;
    for (let i = 0; i < max; i++) { const x = cellX(i), have = i < n, com = i < (o.commit ?? 0), s = o.cellS ? o.cellS(i) : 1;
      if (!have || s <= 0) { el('rect', { x, y: y - 18, width: CW, height: 36, rx: 6, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: o.op ?? 1 }); continue; }
      const fill = down ? SOFT : o.unknown ? WARNBG : com ? ACC : ACCBG, col = down ? MUT : com && !o.unknown ? PANEL : INK;
      card(x + CW / 2, y, CW, 36, { rx: 6, fill, stroke: down ? OFF : o.unknown ? WARN : ACC, sw: 2, text: o.unknown ? '?' : String(i + 1), fs: 14.5, mono: true, fw: 700, color: col, s: 0.6 + 0.4 * s, op: (o.op ?? 1) * s }); }
    if (down) cross(cellX(0) - 30, y, 11, o.downS ?? 1); }
  function commitLine(n, op) { if (op <= 0 || n <= 0) return; const x = cellX(n) - 3;
    el('line', { x1: x, y1: RY[0] - 30, x2: x, y2: RY[2] + 28, stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: op });
    mono(x, RY[0] - 36, `commit ${n}`, { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: op }); }
  // beat 의 cluster 로 세 줄 (o.idx(r) 로 길이를 덮어쓸 수 있다)
  function rows(c, o) { o = o || {}; const b = c.beat, p = c.prev || {}, cm = b.commit || {}, pcm = p.commit || {};
    b.cluster.forEach((nd, r) => { const name = nd.name.replace('rabbit@', ''), n = o.idx ? o.idx(r, nd) : nd.index;
      row(r, name, nd.role, typeof n === 'number' ? n : 0, { commit: o.commit ?? cm.committed, cellS: o.cellS ? (i) => o.cellS(r, i) : null, downS: o.downS }); });
    const cn = o.commit ?? Math.round(tween(pcm.committed, cm.committed, c.u)); commitLine(cn, o.commitOp ?? 1); }
  function table(x, y, head, rws, op, colx) { colx = colx || head.map((_, i) => i * 150);
    head.forEach((h, i) => mono(x + colx[i], y, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op(0) }));
    rws.forEach((rw, r) => rw.forEach((v, i) => { const [s, col] = Array.isArray(v) ? v : [v, INK]; mono(x + colx[i], y + 26 + r * 24, s, { 'font-size': 14, fill: col, 'font-weight': col === INK ? 500 : 800, opacity: op(r + 1) }); })); }

  // ---------- 1. 옛 방식: Classic Mirrored Queue ----------
  function s1(t, c) { const { k, u } = c;
    const lag = [1, 0.55, 0.3];   // 미러가 따라오는 정도는 정해져 있지 않다 (그림의 비율은 예시)
    c.beat.cluster.forEach((nd, r) => { const name = nd.name.replace('rabbit@', ''), n = k === 1 ? Math.round(5 * lag[r] * E(u, 0.3, 2.2)) + (r === 0 ? 0 : 0) : Math.round(5 * lag[r]);
      row(r, name, 'mirror', r === 0 ? 5 : n, { unknown: r > 0, roleS: 0 });
      pill(222, RY[r], r === 0 ? 'master' : 'mirror', r === 0 ? WARN : MUT, 1, { fs: 13.5, mono: true }); });
    mono(cellX(5) + 20, RY[1] + 6, '커밋 시점 없음', { 'font-size': 14.5, 'font-weight': 800, fill: WARN });
    if (k === 0) { // 타임라인
      const x0 = 120, x1 = 840, y = 300, g = E(u, 0.3, 2.0);
      el('line', { x1: x0, y1: y, x2: lerp(x0, x1, g), y2: y, stroke: MUT, 'stroke-width': 3 });
      [[0, '3.x', 'Classic Mirrored Queue', INK], [0.5, '2021', 'deprecated', WARN], [1, '4.0', '완전 제거', BAD]].forEach(([f, a, b, col], i) => { const x = lerp(x0, x1, f), s = g >= f - 0.01 ? 1 : 0;
        el('circle', { cx: x, cy: y, r: 8, fill: col, opacity: s }); mono(x, y - 18, a, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s });
        tx(x, y + 30, b, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: s }); });
      note(120, 390, '복제는 하지만 언제 확정되는지 규약이 없다', fade(u, 2.2), { fill: WARN }); return; }
    if (k === 1) { mono(60, 270, 'set_policy ha-all "^orders\\."', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      [['ha-mode', 'exactly'], ['ha-params', '3'], ['ha-sync-mode', 'automatic']].forEach(([a, b], i) => pill(150 + i * 250, 314, `${a}: ${b}`, i === 2 ? WARN : INFO, pop(u, 0.3 + i * 0.3), { mono: true, fs: 13.5 }));
      const sy = E(u, 1.4, 2.6); el('rect', { x: 60, y: 356, width: 400, height: 18, rx: 4, fill: SOFT });
      el('rect', { x: 60, y: 356, width: 400 * sy, height: 18, rx: 4, fill: WARN, opacity: 0.8 });
      note(480, 371, '큰 큐가 동기화되는 동안 그 큐가 멈춘다', fade(u, 1.5), { fill: WARN }); return; }
    if (k === 2) { const y = 290;
      mono(60, y - 26, '$ rabbitmqctl list_queues name type policy', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.1) });
      table(60, y, ['name', 'type', 'policy'], [['orders.queue', 'classic', ['ha-all', WARN]]], (r) => fade(u, 0.3 + r * 0.4), [0, 190, 330]);
      const s = pop(u, 1.3); card(640, y + 14, 220, 44, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s });
      tx(640, y + 20, 'deprecated 경고', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      note(60, 380, '4.0으로 올리면 이 정책은 더 이상 먹지 않는다 · 이전 계획부터', fade(u, 2.0), { fill: BAD }); return; }
    // k3: 이전 4단계
    const st = [['① 새 Quorum Queue 선언', ACC], ['② shovel로 메시지 이전', INFO], ['③ 프로듀서·컨슈머 전환', INFO], ['④ 옛 mirrored queue 삭제', BAD]];
    st.forEach(([s, col], i) => { const x = 130 + i * 235, sc = pop(u, 0.2 + i * 0.45); card(x, 310, 215, 52, { rx: 12, stroke: col, sw: 2.2, text: s, fs: 14.5, s: sc });
      if (i < 3) grow(x + 108, 310, x + 126, 310, seg(u, 0.5 + i * 0.45, 0.7 + i * 0.45), MUT); });
    for (let m = 0; m < 4; m++) dot([[cellX(0) + 20, RY[2] + 26], [365, 284]], ((t * 0.6 + m / 4) % 1), INFO, 5);
    note(60, 390, '신규 시스템은 처음부터 Quorum Queue', fade(u, 2.2), { fill: ACC }); }

  // ---------- 2. 선언 ----------
  function s2(t, c) { const { k, u } = c;
    if (k >= 3) rows(c, { idx: () => 0, commitOp: 0 });
    else c.beat.cluster.forEach((nd, r) => { mono(30, RY[r] + 6, nd.name.replace('rabbit@', ''), { 'font-size': 15, 'font-weight': 700, fill: MUT }); mono(200, RY[r] + 6, 'replica 없음', { 'font-size': 14, fill: OFF }); });
    if (k === 0) { const s = pop(u, 0.3);
      card(480, 310, 470, 96, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s });
      mono(270, 296, 'arguments = { "x-queue-type": "quorum" }', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      mono(270, 330, 'durable = True', { 'font-size': 16, 'font-weight': 800, fill: INK, opacity: fade(u, 1.0) });
      note(270, 398, '필요한 것은 이 둘뿐이다', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 1) { person(70, 320, '앱 (pika)', {});
      const g = E(u, 0.3, 1.3); el('rect', { x: 110, y: 296, width: 500 * g, height: 48, rx: 24, fill: 'none', stroke: INK, 'stroke-width': 2.5 });
      if (g > 0.3) mono(130, 289, 'connection  localhost:5672', { 'font-size': 14, fill: MUT });
      const g2 = E(u, 1.3, 2.0); el('rect', { x: 140, y: 308, width: 440 * g2, height: 24, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      if (g2 > 0.5) mono(160, 325, 'channel', { 'font-size': 14, 'font-weight': 800, fill: ACC });
      grow(612, 320, 690, 320, E(u, 1.5, 1.9), MUT); mono(700, 325, 'node1', { 'font-size': 15, 'font-weight': 700 });
      note(130, 390, '평범한 AMQP 연결이다 · 어느 노드에 붙어도 된다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 2) { dbIcon(200, 310, 'durable=True', { s: pop(u, 0.2) }); check(270, 280, 12, pop(u, 0.8));
      card(620, 310, 300, 64, { rx: 12, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 1.1) });
      mono(620, 304, 'durable=False', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(620, 328, '선언 거부', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      note(60, 404, 'Quorum은 항상 디스크 기반 · 메모리 전용은 없다', fade(u, 2.0)); return; }
    if (k === 3) { // replica 3벌 배치 + 과반수 2
      mono(60, 280, 'x-quorum-initial-group-size = 3', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.2) });
      [0, 1, 2].forEach((i) => { const on = i < 2, s = pop(u, 0.8 + i * 0.3); el('circle', { cx: 120 + i * 50, cy: 330, r: 17, fill: on ? GOOD : PANEL, stroke: GOOD, 'stroke-width': 2.5, opacity: s }); });
      mono(290, 337, '과반수 = 2', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      note(500, 337, '3노드: 2 · 5노드: 3 → 홀수 권장', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 4) { // exchange 바인딩
      card(150, 320, 150, 50, { rx: 10, stroke: INFO, sw: 2.5, fill: INFOBG, text: 'orders\n(direct)', fs: 14, s: pop(u, 0.2) });
      const g = E(u, 0.6, 1.4); el('line', { x1: 225, y1: 320, x2: lerp(225, 540, g), y2: 320, stroke: INFO, 'stroke-width': 2.5 });
      if (g > 0.5) pill(380, 296, 'order.created', INFO, 1, { mono: true, fs: 13.5 });
      card(620, 320, 160, 44, { rx: 10, stroke: ACC, sw: 2.5, text: 'orders.quorum', fs: 14, mono: true, s: pop(u, 1.3) });
      note(60, 400, 'exchange·binding은 메타데이터 · 복제할 것은 메시지 쪽', fade(u, 2.0), { fill: MUT }); return; }
    // k5: 제약
    [['non-durable', false], ['exclusive', false], ['auto-delete', false]].forEach(([a], i) => { const x = 150 + i * 230, s = pop(u, 0.2 + i * 0.3);
      card(x, 300, 200, 46, { rx: 23, stroke: BAD, sw: 2, text: a, fs: 15, mono: true, color: BAD, s }); cross(x + 82, 300, 9, s); });
    card(380, 372, 480, 44, { rx: 12, stroke: GOOD, sw: 2, fill: GOODBG, s: pop(u, 1.3) });
    tx(380, 378, '대신 디스크 복제로 메시지 안정성을 얻는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); }

  // ---------- 3. 과반수 ack 로 커밋 ----------
  const PR = [90, 330];
  function s3(t, c) { const { k, u } = c, b = c.beat, cm = b.commit;
    if (k <= 2) rows(c);
    person(PR[0], PR[1], '프로듀서', {});
    if (k === 0) { banner(520, 320, 'publisher confirm = 과반수 복제가 끝났다는 신호', pop(u, 0.4));
      note(170, 400, 'waitForConfirmsOrDie로 그 신호를 기다린다', fade(u, 1.6), { fill: MUT }); return; }
    if (k === 1) { const a = ['x-queue-type', 'quorum'], ys = [300, 356];
      mono(180, ys[0], 'queueDeclare(같은 인자)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); check(470, ys[0] - 5, 11, pop(u, 0.6)); mono(495, ys[0], '그대로 통과', { 'font-size': 15, fill: GOOD, 'font-weight': 800, opacity: fade(u, 0.7) });
      mono(180, ys[1], 'queueDeclare(다른 인자)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); cross(470, ys[1] - 5, 10, pop(u, 1.5)); mono(495, ys[1], 'PRECONDITION_FAILED', { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.6) });
      return; }
    if (k === 2) { const on = E(u, 0.5, 1.0); el('rect', { x: 180, y: 306, width: 72, height: 34, rx: 17, fill: on > 0.5 ? ACC : OFF });
      el('circle', { cx: lerp(197, 235, on), cy: 323, r: 13, fill: PANEL });
      mono(270, 329, 'ch.confirmSelect()', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      note(270, 372, '이 채널의 발행마다 커밋 확인이 돌아온다 (채널 단위)', fade(u, 1.4), { fill: MUT }); return; }
    // k3, k4: idx5 를 쓰고 과반수로 커밋
    const leaderAppend = k === 3 ? pop(u, 0.9) : 1;
    const fol = (r) => (k === 3 ? 0 : seg(u, 0.6 + (r - 1) * 0.5, 1.0 + (r - 1) * 0.5));
    rows(c, { idx: (r) => (r === 0 ? 5 : k === 3 ? 4 : 5), cellS: (r, i) => (i < 4 ? 1 : r === 0 ? leaderAppend : fol(r)), commit: k === 3 ? 4 : (u > 1.1 ? 5 : 4) });
    if (k === 3) { dot([[PR[0] + 30, PR[1] - 20], [cellX(4) + 20, RY[0] + 20]], seg(u, 0.1, 0.8), ACC, 7);
      pill(PR[0] + 160, PR[1] + 6, 'basicPublish (persistent)', ACC, pop(u, 0.1), { mono: true, fs: 13.5 }); }
    else [1, 2].forEach((r) => dot([[cellX(4) + 23, RY[0] + 18], [cellX(4) + 23, RY[r] - 18]], seg(u, 0.1 + (r - 1) * 0.5, 0.6 + (r - 1) * 0.5), ACC, 6));
    const acks = k === 3 ? 1 : Math.min(3, 1 + (u > 0.6 + 0.4 ? 1 : 0) + (u > 1.1 + 0.4 ? 1 : 0));
    card(720, 320, 230, 70, { rx: 12, stroke: acks >= 2 ? GOOD : WARN, sw: 2.5 });
    tx(620, 308, 'ack (리더 포함)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    mono(620, 340, `${acks} / 3`, { 'font-size': 22, 'font-weight': 800, fill: acks >= 2 ? GOOD : WARN });
    mono(740, 340, `과반수 ${cm.quorum}`, { 'font-size': 16, 'font-weight': 700, fill: MUT });
    if (k === 3) { note(180, 400, '아직 리더 한 표뿐 · 여기서 리더가 죽으면 idx 5는 없던 일', fade(u, 1.6), { fill: WARN }); return; }
    if (u > 1.4) fly(cellX(4) + 23, RY[2] + 44, PR[0] + 60, PR[1] - 40, seg(u, 1.4, 2.4), 'confirm', { fill: GOOD });
    note(180, 400, '과반수 2를 채운 순간 커밋 → confirm이 돌아온다', fade(u, 2.2), { fill: GOOD }); }

  // ---------- 4. 리더 장애와 재선출 ----------
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    rows(c, { downS: k === 2 ? pop(u, 0.2) : 1, idx: k === 5 ? (r, nd) => (r === 0 ? (u > 1.4 ? 5 : 4) : nd.index) : null, cellS: k === 5 ? (r, i) => (r === 0 && i === 4 ? pop(u, 1.4) : 1) : null });
    const online = b.cluster.filter((n) => n.role !== 'down').length, pon = p.cluster ? p.cluster.filter((n) => n.role !== 'down').length : online;
    mono(930, 300, `online ${Math.round(tween(pon, online, u))} / 3`, { 'font-size': 17, 'font-weight': 800, fill: online < 3 ? WARN : GOOD, 'text-anchor': 'end' });
    if (k === 0) { [1, 2].forEach((r) => { for (let m = 0; m < 2; m++) dot([[cellX(0) - 40, RY[0] + 14], [cellX(0) - 40, RY[r] - 14]], ((t * 0.5 + m / 2) % 1), ACC, 5); });
      note(40, 300, '리더가 하트비트를 보낸다', fade(u, 0.4), { fill: ACC });
      note(40, 340, '앱은 리더 위치를 고정으로 알면 안 된다', fade(u, 1.6), { fill: MUT }); return; }
    if (k === 1) { mono(40, 272, '$ rabbitmqctl list_queues name type leader members online', { 'font-size': 14, fill: MUT });
      table(40, 304, ['name', 'type', 'leader', 'online'], [['orders.quorum', 'quorum', ['rabbit@node1', ACC], ['3', GOOD]]], (r) => fade(u, 0.3 + r * 0.5), [0, 170, 280, 460]);
      note(40, 400, 'online이 members보다 작으면 replica가 빠진 것', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 2) { clock(140, 320, 34, E(u, 0.5, 2.2), WARN, 'election timeout');
      note(220, 305, 'node1 하트비트 끊김 → node2가 후보로', fade(u, 0.8), { fill: WARN });
      note(220, 340, '남은 2노드로 과반수 2는 그대로 채운다', fade(u, 1.6));
      note(220, 375, '재선출 동안 쓰기는 잠시 멈춘다 · 잃지는 않는다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 3) { dot([[cellX(0) - 40, RY[2] - 14], [cellX(0) - 40, RY[1] + 14]], seg(u, 0.3, 1.0), INFO, 7);
      pill(560, 300, 'term 2', ACC, pop(u, 1.2), { mono: true, fs: 15 });
      note(40, 300, 'node3의 표 + 자기 표 = 2', fade(u, 0.9), { fill: INFO });
      note(40, 345, '커밋된 idx 5는 과반수에 있어 그대로 이어받는다', fade(u, 1.8), { fill: GOOD }); return; }
    if (k === 4) { mono(40, 272, '$ rabbitmqctl quorum_status orders.quorum', { 'font-size': 14, fill: MUT });
      [['Leader:', 'rabbit@node2', ACC], ['Followers:', '[rabbit@node3]', INFO], ['Down:', '[rabbit@node1]', BAD]].forEach(([a, v, col], i) => {
        mono(40, 304 + i * 30, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) }); mono(170, 304 + i * 30, v, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) }); });
      note(470, 360, '하나 더 빠지면 과반수 2를 못 채워 큐가 멈춘다', fade(u, 2.0), { fill: WARN }); return; }
    // k5: 재합류 후 따라잡기
    note(40, 300, 'node1은 follower로 돌아와', fade(u, 0.3));
    note(40, 340, '밀린 로그(idx 5)를 스스로 따라잡는다', fade(u, 1.2), { fill: GOOD });
    note(40, 380, '유실 0 · 리더는 node2 그대로', fade(u, 2.0), { fill: MUT }); }

  // ---------- 5. poison message 와 선택 기준 ----------
  const Q = [190, 200], CS = [560, 200], DL = [820, 330];
  function qtube(n, op) { el('rect', { x: Q[0] - 110, y: Q[1] - 20, width: 220, height: 40, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: op ?? 1 });
    for (let i = 0; i < n; i++) el('rect', { x: Q[0] + 82 - i * 22, y: Q[1] - 12, width: 16, height: 24, rx: 3, fill: ACC, opacity: op ?? 1 });
    mono(Q[0], Q[1] + 42, 'orders.quorum', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: op ?? 1 }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { // Classic vs Quorum
      [['Classic', '처리량 최우선', ['로그 · 메트릭성 트래픽', '유실을 조금 허용', '복제 없음 · 빠르다'], MUT, 250], ['Quorum', '유실 불가', ['결제 · 주문', '과반수 복제 · ack도 복제', '디스크 비용이 더 든다'], ACC, 710]].forEach(([n, h, items, col, x], j) => {
        const s = pop(u, 0.2 + j * 0.6); card(x, 210, 380, 270, { rx: 14, stroke: col, sw: 2.5, fill: j ? ACCBG : PANEL, s });
        tx(x, 112, n, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + j * 0.6) });
        tx(x, 142, h, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + j * 0.6) });
        items.forEach((it, i) => tx(x - 150, 196 + i * 44, '· ' + it, { 'font-size': 15, opacity: fade(u, 0.5 + j * 0.6 + i * 0.2) })); });
      note(250, 400, '요구사항으로 고른다', fade(u, 2.2), { fill: MUT }); return; }
    qtube(k === 3 ? 2 : 3);
    person(CS[0], CS[1], 'consumer', {});
    el('line', { x1: Q[0] + 112, y1: Q[1], x2: CS[0] - 34, y2: Q[1], stroke: GRID, 'stroke-width': 2.5 });
    if (k === 0) { // 상한이 없으면 무한 반복
      const lap = (t * 0.45) % 1, n = Math.floor(t * 0.45) + 1;
      dot([[Q[0] + 90, Q[1]], [CS[0] - 34, Q[1]], [CS[0] - 34, Q[1] + 90], [Q[0] + 90, Q[1] + 90], [Q[0] + 90, Q[1] + 22]], lap, BAD, 8);
      mono(380, Q[1] + 112, '처리 실패 → requeue', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
      mono(740, 205, `배달 ${n}회 …`, { 'font-size': 18, 'font-weight': 800, fill: BAD });
      note(60, 395, '상한이 없으면 실패한 메시지 하나가 컨슈머를 영원히 붙잡는다', fade(u, 1.8), { fill: WARN }); return; }
    if (k === 1) { [['producer', '선언 인자'], ['consumer', '선언 인자']].forEach(([a], i) => { const y = 310 + i * 44;
        mono(60, y, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) });
        mono(180, y, 'quorum · group 3 · limit 5 · dlx.exchange', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.3 + i * 0.4) }); });
      check(660, 326, 12, pop(u, 1.3)); note(690, 332, '같다 → 통과', fade(u, 1.4), { fill: GOOD }); return; }
    // DLX 상자
    card(DL[0], DL[1], 200, 56, { rx: 10, stroke: WARN, sw: 2.5, fill: WARNBG, s: k === 2 ? pop(u, 0.8) : 1 });
    tx(DL[0], DL[1] - 3, 'dlx.exchange', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN });
    tx(DL[0], DL[1] + 18, '초과분 보관', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    if (k === 2) { pill(Q[0], 110, 'x-delivery-limit: 5', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      pill(Q[0], 70, 'x-dead-letter-exchange', WARN, pop(u, 0.6), { mono: true, fs: 13.5 });
      grow(Q[0] + 40, Q[1] + 30, DL[0] - 100, DL[1], E(u, 1.0, 1.8), WARN);
      note(60, 400, 'drop만 하면 왜 실패했는지 영영 모른다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 3) { // 성공: ack → 큐에서 빠지고 ack 도 로그에
      dot([[Q[0] + 90, Q[1]], [CS[0] - 34, Q[1]]], seg(u, 0.2, 0.9), ACC, 8);
      mono(CS[0] + 50, Q[1] - 30, 'x-delivery-count = 0', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.8) });
      pill(CS[0] + 130, Q[1] + 8, 'basic_ack', GOOD, pop(u, 1.2), { mono: true, fs: 14 });
      [6, 7].forEach((ix, i) => card(140 + i * 52, 330, 46, 36, { rx: 6, fill: i ? (u > 1.8 ? ACC : ACCBG) : ACC, stroke: ACC, text: String(ix), fs: 14.5, mono: true, fw: 700, color: i && u <= 1.8 ? INK : PANEL, s: i ? pop(u, 1.6) : 1 }));
      mono(60, 336, 'log', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 }); note(260, 336, 'ack도 Raft 로그에 기록·복제된다 (idx 7)', fade(u, 1.8), { fill: GOOD }); return; }
    // k4: 실패 → nack requeue, 6번째 실패 뒤 DLX (규칙 재현: 반납 횟수 > 5)
    pill(CS[0] + 150, Q[1] - 50, 'prefetch_count = 20', INFO, 1, { mono: true, fs: 13.5 });
    const step = Math.min(6, Math.floor(E(u, 0.1, 2.2) * 6.99));
    const cnt = Math.min(step, 5);
    mono(CS[0] + 70, Q[1] + 10, `x-delivery-count = ${cnt}`, { 'font-size': 15, 'font-weight': 800, fill: step >= 6 ? BAD : WARN });
    for (let i = 0; i < 6; i++) el('circle', { cx: CS[0] + 80 + i * 26, cy: Q[1] + 40, r: 9, fill: i < step ? (i === 5 && step >= 6 ? BAD : WARN) : 'none', stroke: WARN, 'stroke-width': 2 });
    mono(CS[0] + 80, Q[1] + 68, '배달 1 … 6', { 'font-size': 13.5, fill: MUT });
    if (step < 6) dot([[Q[0] + 90, Q[1]], [CS[0] - 34, Q[1]], [CS[0] - 34, Q[1] + 60], [Q[0] + 90, Q[1] + 60], [Q[0] + 90, Q[1] + 22]], (E(u, 0.1, 2.2) * 6.99) % 1, WARN, 7);
    else fly(CS[0], Q[1] + 30, DL[0] + 40, DL[1] - 58, seg(u, 2.2, 2.9), 'poison', { fill: BAD, stay: true });
    note(60, 400, 'basic_nack(requeue=True) 여도 6번째 실패 뒤 DLX로 빠진다', fade(u, 1.0), { fill: WARN }); }

  const quiz = [
    { q: 'Classic Mirrored Queue를 떠나야 하는 가장 직접적인 이유는 무엇인가?',
      o: ['처리량이 Quorum보다 낮아서', '노드를 2대까지만 쓸 수 있어서', '2021년에 deprecated 되었고 4.0에서 제거되어서'], a: 2,
      why: '복제 규약이 느슨해 분단 시 유실·불일치가 잦았고, 결국 4.0에서 기능 자체가 사라졌다. 이전 대상은 Quorum Queue다.' },
    { q: '3노드에 x-quorum-initial-group-size=3으로 선언했다. 커밋에 필요한 표는 몇 개인가?',
      o: ['1개', '2개', '3개'], a: 1,
      why: '과반수는 3노드에서 2, 5노드에서 3이다. 홀수로 두면 과반수 계산이 명확하다.' },
    { q: '리더가 idx 5를 자기 로그에만 쓴 순간, 프로듀서가 받은 것은 무엇인가?',
      o: ['아직 아무 확인도 없다', 'publisher confirm', 'PRECONDITION_FAILED'], a: 0,
      why: '리더 한 표로는 과반수 2를 못 채운다. 팔로워 ack가 더해져 커밋된 뒤에야 confirm이 돌아온다.' },
    { q: '리더 node1이 죽은 뒤 이미 커밋된 idx 5는 어떻게 되나?',
      o: ['node1이 돌아올 때까지 읽을 수 없다', '프로듀서가 다시 보내야 한다', '새 리더 node2가 그대로 이어받는다'], a: 2,
      why: '커밋된 항목은 과반수 노드에 이미 있다. 그중 하나가 새 리더가 되므로 유실이 없다.' },
    { q: 'x-delivery-limit=5인 큐에서 처리가 계속 실패하는 메시지는 어떻게 되나?',
      o: ['requeue=True라서 끝없이 되돌아온다', '상한을 넘으면 dlx.exchange로 빠진다', '첫 실패에서 바로 버려진다'], a: 1,
      why: '반납 횟수가 5를 넘으면 큐에서 빠진다. DLX를 걸어 두면 그 메시지를 나중에 들여다볼 수 있다.' },
  ];

  const summary = [
    'Classic Mirrored Queue는 복제 규약이 느슨해 2021년에 deprecated, 4.0에서 제거됐다.',
    'x-queue-type=quorum으로 선언하면 replica 3벌에 리더 1, 팔로워 2가 생긴다.',
    '리더가 쓴 항목은 과반수 2가 ack해야 커밋되고, 그때 publisher confirm이 돌아온다.',
    '리더가 죽으면 남은 과반수가 새 리더를 뽑고, x-delivery-limit은 poison 메시지를 DLX로 뺀다.',
  ];
  const review = [
    { q: '3노드 quorum 큐에서 두 노드가 동시에 내려갔다. 발행은 어떻게 되나?',
      o: ['남은 리더 혼자 커밋한다', '과반수 2를 못 채워 그 큐가 멈춘다', 'Classic 큐로 자동 전환된다'], a: 1,
      why: '커밋에는 과반수 2표가 필요하다. 한 노드만 남으면 확정할 수 없어 쓰기가 멈춘다.' },
    { q: '컨슈머를 배포했더니 queue_declare에서 채널이 닫혔다. 먼저 의심할 것은?',
      o: ['prefetch_count가 너무 크다', '리더가 재선출 중이다', '프로듀서와 선언 인자가 달라 PRECONDITION_FAILED가 났다'], a: 2,
      why: '같은 큐를 다른 인자로 다시 선언하면 거부된다. 인자를 한 곳에 상수로 모아 프로듀서·컨슈머가 함께 쓴다.' },
    { q: '결제 큐와 접속 로그 큐를 새로 만든다. 맞는 배치는?',
      o: ['결제는 Quorum, 로그는 Classic', '둘 다 Classic', '결제는 Classic, 로그는 Quorum'], a: 0,
      why: '유실이 치명적인 결제는 과반수 복제를 쓰고, 처리량이 우선이고 유실을 조금 허용하는 로그는 Classic으로 둔다.' },
  ];

  R.page({ title: 'Quorum Queue 복제', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
