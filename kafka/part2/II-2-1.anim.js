/* II-2-1 Consumer Group — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   배정 결과(Range, Sticky 비교)와 key 이동은 python 으로 배정 전략과 murmur2 파티셔너를 재현해 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── 공통: 왼쪽 partition 로그, 오른쪽 그룹 ───────────────
  const RX = 74, CW = 38, NC = 6;
  function rowsY(n) { return n > 4 ? Array.from({ length: n }, (_, i) => 46 + i * 44) : Array.from({ length: n }, (_, i) => 70 + i * 82); }
  function topic(b, o) { o = o || {}; const n = b.partitions.length, ys = rowsY(n), h = n > 4 ? 32 : 40;
    zone(20, 20, 360, n > 4 ? 380 : 360, 'topic  orders', { fill: ACCBG, stroke: ACC, sw: 2, color: ACC });
    ys.forEach((y, i) => { const fresh = o.freshFrom != null && i >= o.freshFrom, s = fresh ? pop(o.u, 0.3 + (i - o.freshFrom) * 0.2) : 1; if (s <= 0.02) return;
      mono(RX - 12, y + h / 2 + 5, 'P' + i, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      for (let j = 0; j < NC; j++) el('rect', { x: RX + j * (CW + 4), y: y + (1 - s) * h / 2, width: CW, height: h * s, rx: 4, fill: (o.cellFill && o.cellFill(i, j)) || PANEL, stroke: INK, 'stroke-width': 1.6 }); });
    return { ys: ys.map((y) => y + h / 2), end: RX + NC * (CW + 4) }; }
  // 그룹 상자와 consumer 카드. list = [{id, partitions, idle}] → {id: [x, y]}
  function group(list, box, title, col, o) { o = o || {}; const [x, y, w, h] = box, pos = {};
    zone(x, y, w, h, title, { fill: o.fill || SOFT, stroke: col, sw: 2, color: col, op: o.op ?? 1 });
    const n = list.length, gap = Math.min(78, (h - 40) / Math.max(n, 1));
    list.forEach((cn, i) => { const cy = y + 40 + gap * (i + 0.5) - (n === 1 ? 0 : 0), cx = x + w / 2, fresh = o.prevIds && !o.prevIds.includes(cn.id);
      const s = fresh ? pop(o.u, 0.3 + i * 0.1) : 1, idle = cn.idle || (o.idleEmpty && cn.partitions.length === 0);
      card(cx, cy, 104, Math.min(46, gap - 8), { text: idle ? cn.id + ' · idle' : cn.id, fs: 15, stroke: idle ? MUT : col, dash: idle ? '6 5' : null, color: idle ? MUT : INK, s });
      pos[cn.id] = [cx - 52, cy]; });
    return pos; }
  const ownerOf = (list) => { const m = {}; (list || []).forEach((cn) => cn.partitions.forEach((p) => { m[p] = cn.id; })); return m; };
  // 배정선: 바뀐 것만 u 에 맞춰 자란다
  function links(T, list, prevList, pos, col, u, o) { o = o || {}; const now = ownerOf(list), was = ownerOf(prevList);
    Object.keys(now).forEach((p) => { const id = now[p], to = pos[id]; if (!to || T.ys[p] == null) return;
      const changed = was[p] !== id, f = o.all != null ? o.all : changed ? E(u, o.at ?? 0.8, (o.at ?? 0.8) + 0.8) : 1;
      grow(T.end + 8, T.ys[p], to[0] - 4, to[1], f, col, { plain: true, sw: 2.4 }); }); }

  const GA = [560, 30, 330, 340];

  // 1. group_id 로 그룹에 합류
  function s1(t, c) { const { k, u } = c, b = c.beat;
    const T = topic(b);
    if (k === 0) { card(725, 210, 230, 56, { rx: 10, text: "KafkaConsumer('orders')", mono: true, fs: 14, stroke: MUT, dash: '6 5', s: pop(u, 0.3) });
      sub(725, 262, '그룹이 없으면 아직 배정도 없다', fade(u, 1.0)); return; }
    const gw = k === 1 ? E(u, 0.2, 1.0) : 1;
    const pos = gw > 0.6 ? group(b.groupA, GA, 'group_id = "order-service"', ACC, { prevIds: k === 1 ? [] : null, u: u - 0.6 }) : {};
    if (gw <= 0.6) zone(GA[0] + GA[2] / 2 * (1 - gw), GA[1], GA[2] * gw, GA[3], '', { fill: SOFT, stroke: ACC, sw: 2 });
    if (k === 1) sub(725, 400, '그룹을 만드는 API는 없다 · 이름만 맞추면 합류', fade(u, 1.5), { 'font-weight': 700, fill: INK });
    links(T, b.groupA, k === 2 ? [] : b.groupA, pos, ACC, u, { at: 0.3 });
    if (k === 3) { for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) dot([[T.end + 8, T.ys[i]], pos.C1], (t * 0.7 + i * 0.13 + j * 0.5) % 1, ACC, 5);
      const q = Math.round(lerp(1, 7, E(u, 0.2, 2.2))); for (let i = 0; i < q; i++) el('rect', { x: pos.C1[0] + 112 + (i % 2) * 14, y: pos.C1[1] + 10 - Math.floor(i / 2) * 14, width: 11, height: 11, rx: 2, fill: WARN });
      card(725, 330, 280, 74, { rx: 8, fill: INK, stroke: 'none', s: pop(u, 0.4) });
      ['P0 offset=12 b\'order#1001\'', 'P2 offset=7 b\'order#1002\'', 'P1 offset=15 b\'order#1003\''].forEach((s, i) => mono(598, 312 + i * 20, s, { 'font-size': 13.5, fill: PANEL, opacity: fade(u, 0.6 + i * 0.3) }));
      sub(725, 274, '네 줄의 메시지가 C1 하나로 몰린다', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); } }

  // 2. partition 분배 (Range)
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    const T = topic(b);
    const pos = group(b.groupA, GA, 'group_id = "order-service"', ACC, { prevIds: p ? p.groupA.map((x) => x.id) : null, u });
    links(T, b.groupA, p ? p.groupA : b.groupA, pos, ACC, u, { at: 0.9 });
    if (k === 0) banner(470, 400, 'C2 합류 → rebalance 시작', pop(u, 0.9));
    if (k === 1) { card(470, 402, 330, 32, { rx: 8, stroke: INFO, fill: C.INFOBG, text: 'Range: 4 ÷ 2 = 2 개씩 번호 순서대로', fs: 14.5, s: pop(u, 1.6) }); }
    if (k === 2) { T.ys.forEach((y, i) => { card(T.end + 30, y - 24, 30, 22, { rx: 11, text: '1', mono: true, fs: 13.5, stroke: GOOD, color: GOOD, fill: C.GOODBG, s: pop(u, 0.3 + i * 0.2) }); });
      grow(T.end + 8, T.ys[0] + 10, pos.C2[0] - 4, pos.C2[1] - 10, E(u, 1.2, 1.9), BAD, { dash: '5 5', plain: true }); cross(470, (T.ys[0] + pos.C2[1]) / 2 + 2, 11, pop(u, 1.9));
      sub(470, 404, 'partition마다 주인은 그룹 안에서 한 명', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
    if (k === 3) { [0, 1].forEach((i) => { const cy = 160 + i * 70; card(725, 250 + i * 64, 104, 46, { rx: 10, text: i ? 'C4 ?' : 'C3 ?', fs: 15, stroke: MUT, dash: '6 5', color: MUT, s: pop(u, 0.4 + i * 0.3) }); });
      sub(725, 400, 'partition 4개 → 최대 4명까지 의미 있다', fade(u, 1.3), { fill: ACC, 'font-weight': 700 }); } }

  // 3. consumer 추가 → rebalance
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    if (k === 3) { // rebalance 비용: 잦은 rebalance 와 전략 비교
      tx(40, 50, '배포가 잦으면 rebalance마다 소비가 멈춘다', { 'font-size': 16, 'font-weight': 800 });
      const x0 = 60, w = 840; el('line', { x1: x0, y1: 110, x2: x0 + w * E(u, 0.1, 0.8), y2: 110, stroke: GOOD, 'stroke-width': 10, 'stroke-linecap': 'round' });
      [0.15, 0.4, 0.6, 0.85].forEach((f, i) => { const s = pop(u, 0.6 + i * 0.25); el('rect', { x: x0 + w * f - 18, y: 98, width: 36 * s, height: 24, rx: 4, fill: BAD });
        sub(x0 + w * f, 146, `배포 ${i + 1}`, fade(u, 0.6 + i * 0.25), { 'font-weight': 700, fill: BAD }); });
      [['Range (eager)', 'C1:P0 C2:P1 C3:P2 C4:P3', 'P1·P2·P3 주인이 바뀜', BAD, 250], ['Sticky', 'C1:P0 C2:P2 C3:P1 C4:P3', 'P1·P3만 옮김', GOOD, 700]].forEach(([n, a, m, col, cx], i) => {
        const s = pop(u, 1.4 + i * 0.4); card(cx, 270, 380, 130, { rx: 12, stroke: col, sw: 2.2, s });
        tx(cx, 236, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.5 + i * 0.4) });
        mono(cx, 272, a, { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.6 + i * 0.4) });
        tx(cx, 306, m, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.7 + i * 0.4) }); });
      sub(480, 380, 'C1·C2 (2:2)에 C3·C4가 들어올 때 · 넉넉한 max.poll.interval.ms도 함께', fade(u, 2.2)); return; }
    const T = topic(b);
    const pos = group(b.groupA, GA, 'group_id = "order-service"', ACC, { prevIds: p ? p.groupA.map((x) => x.id) : null, u });
    if (k === 1) { const f = 1 - E(u, 0.2, 1.0); links(T, p.groupA, p.groupA, pos, ACC, u, { all: f });
      el('rect', { x: 452, y: 170, width: 12, height: 44, rx: 3, fill: WARN, opacity: fade(u, 1.0) }); el('rect', { x: 474, y: 170, width: 12, height: 44, rx: 3, fill: WARN, opacity: fade(u, 1.0) });
      sub(470, 240, '전원 반납 · 소비 멈춤', fade(u, 1.2), { fill: WARN, 'font-weight': 800, 'font-size': 15 }); return; }
    links(T, b.groupA, p ? p.groupA : b.groupA, pos, ACC, u, { at: 0.6 });
    if (k === 0) banner(470, 400, '주문 폭증 · 같은 group_id로 C3, C4 배포', pop(u, 1.0));
    if (k === 2) { T.ys.forEach((y, i) => dot([[T.end + 8, y], pos['C' + (i + 1)]], (t * 0.8 + i * 0.2) % 1, ACC, 5));
      sub(470, 404, '4 : 4 · consumer 하나에 partition 하나', fade(u, 1.6), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); } }

  // 4. consumer 가 partition 보다 많으면
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    const n = b.partitions.length, grew = p && p.partitions.length < n;
    const T = topic(b, { freshFrom: grew ? p.partitions.length : null, u });
    const pos = group(b.groupA, GA, 'group_id = "order-service"', ACC, { prevIds: p ? p.groupA.map((x) => x.id) : null, u, idleEmpty: k === 1 });
    links(T, b.groupA, p ? p.groupA : b.groupA, pos, ACC, u, { at: 1.0 });
    if (k === 0) sub(470, 404, 'C5도 join은 된다 · 남은 partition이 있나?', fade(u, 1.0), { fill: INK, 'font-weight': 700 });
    if (k === 1) { const [x, y] = pos.C5; for (let i = 0; i < 2; i++) { const f = (t * 0.6 + i * 0.5) % 1; el('circle', { cx: x + 104 + 40 * f, cy: y, r: 5, fill: MUT, opacity: 1 - f }); }
      sub(470, 404, 'C5는 heartbeat만 보내며 대기 · 천장은 partition 수', fade(u, 0.8), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); }
    if (k === 2) { pill(492, 14, '--alter --partitions 8', INK, pop(u, 0.2), { mono: true, fs: 14 });
      card(725, 398, 300, 34, { rx: 8, stroke: INFO, fill: C.INFOBG, text: 'Range: 8 ÷ 5 = 1 … 나머지 3', fs: 14, mono: true, s: pop(u, 1.8) }); }
    if (k === 3) { card(200, 402, 300, 32, { rx: 8, stroke: BAD, fill: C.BADBG, text: 'partition은 늘리기만 된다', fs: 15, color: BAD, s: pop(u, 0.3) });
      card(725, 398, 290, 34, { rx: 8, stroke: WARN, fill: C.WARNBG, text: 'u-102 : 4개면 P1, 8개면 P5', fs: 14, mono: true, s: pop(u, 1.0) }); } }

  // 5. 다른 그룹은 같은 메시지를 따로 읽는다
  const GA5 = [560, 20, 330, 250], GB5 = [560, 286, 330, 124];
  function s5(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    const ptrA = 5, ptrB = 2;
    const T = topic(b);
    const pa = group(b.groupA, GA5, 'order-service (결제)', ACC);
    const showB = b.groupB.length > 0;
    let pb = {};
    if (showB) pb = group(b.groupB, GB5, 'analytics-service (통계)', INFO, { prevIds: p ? p.groupB.map((x) => x.id) : null, u });
    else if (k === 0) { zone(GB5[0], GB5[1], GB5[2], GB5[3], '', { fill: 'none', stroke: GRID, dash: '6 6' }); sub(725, 352, '다른 서비스도 orders를 읽고 싶다', fade(u, 0.8)); }
    links(T, b.groupA, b.groupA, pa, ACC, u);
    if (showB) links(T, b.groupB, p ? p.groupB : b.groupB, pb, INFO, u, { at: 0.5 });
    if (k === 2) sub(200, 404, '한 partition에 그룹마다 주인이 하나씩', fade(u, 1.6), { fill: INK, 'font-weight': 700 });
    if (k === 3) { // 그룹별로 따로 기억하는 읽은 위치
      T.ys.forEach((y, i) => { [[ptrA, ACC, -1], [ptrB, INFO, 1]].forEach(([at, col, sgn]) => { const x = RX + at * (CW + 4) + CW / 2, yy = y + sgn * 28;
        el('path', { d: sgn < 0 ? `M${x - 7},${yy - 4} L${x + 7},${yy - 4} L${x},${yy + 6} Z` : `M${x - 7},${yy + 4} L${x + 7},${yy + 4} L${x},${yy - 6} Z`, fill: col, opacity: fade(u, 0.3 + i * 0.15) }); }); });
      dot([[T.end + 8, T.ys[2]], pa.C3], seg(u, 1.0, 2.0), ACC, 7); dot([[T.end + 8, T.ys[2]], pb.D1], seg(u, 1.0, 2.0), INFO, 7);
      sub(200, 404, '▼ order-service  ▲ analytics-service · 위치는 예시', fade(u, 1.2), { 'font-weight': 700, fill: INK }); } }

  const quiz = [
    { q: 'consumer를 하나의 그룹으로 묶으려면 무엇을 해야 하는가?',
      o: ['그룹 생성 API를 먼저 호출한다', '같은 group_id를 주고 접속한다', '같은 client_id를 준다'], a: 1,
      why: '그룹을 만드는 API는 없다. group_id="order-service"로 접속한 consumer들이 자동으로 한 그룹이 된다.' },
    { q: 'RangeAssignor가 partition 4개를 C1, C2에게 나누면 결과는 무엇인가?',
      o: ['C1: P0, P2 / C2: P1, P3', 'C1, C2 모두 P0~P3', 'C1: P0, P1 / C2: P2, P3'], a: 2,
      why: 'Range는 번호 순서대로 4 ÷ 2 = 2개씩 잘라 준다. 돌아가며 나누는 P0·P2 / P1·P3은 RoundRobin 결과다.' },
    { q: 'eager 방식 rebalance가 진행되는 동안 그룹에서 일어나는 일은 무엇인가?',
      o: ['모든 consumer가 partition을 반납하고 소비가 잠시 멈춘다', '새 consumer만 멈추고 나머지는 계속 읽는다', '메시지가 두 consumer에게 동시에 간다'], a: 0,
      why: 'eager 방식은 전원이 배정을 내려놓았다가 다시 받는다. 그래서 잦은 배포는 소비 중단을 반복시킨다.' },
    { q: 'partition 4개인 토픽에 C5를 추가하면 처리량은 어떻게 되는가?',
      o: ['5/4배로 늘어난다', '줄어든다. C5가 다른 consumer의 몫을 뺏는다', '늘지 않는다. C5는 idle이다'], a: 2,
      why: '한 partition은 그룹 안에서 한 consumer만 읽는다. 남는 partition이 없어 C5는 heartbeat만 보낸다.' },
    { q: '같은 orders 토픽을 group_id가 다른 두 그룹이 읽으면 메시지 한 건은 몇 번 읽히는가?',
      o: ['한 번. 먼저 읽은 그룹만 가져간다', '그룹마다 한 번씩 두 번', '두 그룹이 partition을 나눠 반씩'], a: 1,
      why: '그룹마다 배정과 offset을 따로 가진다. 그래서 같은 메시지가 결제 그룹에서 한 번, 통계 그룹에서 한 번 읽힌다.' },
  ];

  const summary = [
    'group_id가 같은 consumer는 한 그룹이 되어 partition을 나눠 읽는다.',
    '그룹 안에서 partition 하나는 consumer 한 명만 읽고, 배정은 Range 같은 전략이 정한다.',
    'consumer가 드나들면 rebalance가 일어나 잠시 소비가 멈추고, Sticky는 옮기는 양을 줄인다.',
    'partition 4개에 consumer 5명이면 한 명은 논다. 다른 group_id는 같은 메시지를 따로 읽는다.',
  ];
  const review = [
    { q: 'LAG이 쌓여 consumer를 4명에서 8명으로 늘렸는데 처리량이 그대로다. partition은 4개다. 먼저 의심할 것은?',
      o: ['broker 디스크가 느리다', 'group_id가 서로 달라졌다', '늘린 4명이 배정받을 partition이 없어 놀고 있다'], a: 2,
      why: '그룹 안의 병렬성은 partition 수가 천장이다. 늘려야 할 것은 consumer가 아니라 partition이다.' },
    { q: '배포할 때마다 몇 초씩 주문 처리가 멈춘다. 배포 방식은 인스턴스를 하나씩 재시작하는 것이다. 맞는 대응은?',
      o: ['CooperativeSticky 배정으로 바꿔 옮기는 partition만 멈추게 한다', 'partition을 1개로 줄여 rebalance 대상을 없앤다', 'group_id를 인스턴스마다 다르게 주어 그룹을 나눈다'], a: 0,
      why: '재시작마다 rebalance가 일어나고 eager 방식은 전원이 반납한다. Sticky 계열은 2:2에서 4명이 될 때 P1·P3만 옮긴다.' },
    { q: '통계 서비스를 붙였더니 결제 서비스가 일부 주문을 못 받는다는 신고가 왔다. 코드를 보니 통계 쪽도 group_id="order-service"다. 원인은?',
      o: ['토픽의 보존 기간이 짧아서', '같은 그룹이라 partition을 나눠 가져갔다', 'acks 설정이 달라서'], a: 1,
      why: '같은 group_id면 한 그룹으로 묶여 메시지를 나눠 읽는다. 따로 다 받으려면 analytics-service처럼 다른 group_id를 줘야 한다.' },
  ];

  R.page({ title: 'Consumer Group 배정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
