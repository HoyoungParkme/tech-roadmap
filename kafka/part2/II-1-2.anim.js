/* II-1-2 Producer — acks 옵션 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   o-101 이 가는 partition 은 Java/kafka-python 기본 파티셔너(murmur2 & 0x7fffffff % 3)를 python 으로 재현해 계산했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── 공통 ─────────────────────────────────────────────
  // 속도·안전 별점 (페이지 데이터 speed, safety: 0~5)
  function rating(x, y, name, v, pv, u, col) { const val = tween(pv, v, u);
    tx(x, y + 5, name, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 5; i++) { const f = clamp(val - i); el('circle', { cx: x + 52 + i * 20, cy: y, r: 7, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      if (f > 0) el('circle', { cx: x + 52 + i * 20, cy: y, r: 7 * f, fill: col }); } }
  function ratings(c, x, y) { const b = c.beat, p = c.prev || {};
    rating(x, y, '속도', b.speed, p.speed, c.u, ACC); rating(x, y + 24, '안전', b.safety, p.safety, c.u, GOOD); }
  // acks 다이얼: 0 · 1 · all 세 자리. v = 0 | 1 | 2
  function dial(cx, cy, v, pv, u, s) { const g = R.G(cx, cy, s ?? 1); const ang = (i) => Math.PI + (i / 2) * Math.PI;
    el('path', { d: 'M-58,0 A58,58 0 0 1 58,0', fill: 'none', stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
    ['0', '1', 'all'].forEach((t, i) => { const a = ang(i); tx(Math.cos(a) * 80, Math.sin(a) * 80 + 6, t, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: i === v ? ACC : MUT }, g); });
    const a = ang(tween(pv ?? v, v, u)); el('line', { x1: 0, y1: 0, x2: Math.cos(a) * 52, y2: Math.sin(a) * 52, stroke: ACC, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: 0, cy: 0, r: 7, fill: ACC }, g); tx(0, 26, 'acks', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }, g); }

  // 1. KafkaProducer 생성 — 설정 한 줄씩
  const CFG = ['bootstrap_servers=["broker:9092"]', 'key/value_serializer=…', 'acks=1', 'retries=3', 'request_timeout_ms=30_000', 'linger_ms=5', 'batch_size=16_384'];
  const CFG_AT = [0, 1, 2, 3, 3, 4, 4];
  function s1(t, c) { const { k, u } = c;
    zone(24, 40, 380, 340, 'KafkaProducer(', { fill: SOFT, stroke: GRID, sw: 1.5 });
    CFG.forEach((s, i) => { const at = CFG_AT[i]; if (at > k) return; const now = at === k && k < 5;
      if (now) el('rect', { x: 36, y: 64 + i * 40, width: 356, height: 32, rx: 6, fill: ACCBG, opacity: fade(u, 0.1) });
      mono(48, 86 + i * 40, s, { 'font-size': 15, 'font-weight': now ? 800 : 500, fill: now ? ACC : INK, opacity: now ? fade(u, 0.2) : 1 }); });
    mono(40, 366, ')', { 'font-size': 16, 'font-weight': 700, fill: MUT });
    const X = 680;
    if (k === 0) { server(X + 100, 190, 'broker:9092', { s: pop(u, 0.2) });
      card(X - 160, 190, 110, 46, { text: 'Producer', fs: 15, s: pop(u, 0.2) });
      grow(X - 104, 180, X + 40, 180, E(u, 0.6, 1.3), ACC); sub(X - 30, 168, '첫 접속', fade(u, 0.9), { fill: ACC, 'font-weight': 700 });
      fly(X + 60, 214, X - 40, 262, seg(u, 1.5, 2.4), 'metadata: leader 주소', { fill: INK, stay: true });
      sub(X + 10, 320, '실제 전송은 metadata가 알려 준 leader로 간다', fade(u, 2.2)); }
    if (k === 1) { card(X, 110, 430, 44, { rx: 8, text: '{"id": "o-101", "user_id": "u-7", "amount": 12900}', mono: true, fs: 13.5, stroke: INK, s: pop(u, 0.2) });
      grow(X, 136, X, 176, E(u, 0.7, 1.1), ACC); pill(X + 90, 156, 'json.dumps → encode', ACC, pop(u, 0.8), { fs: 13.5, mono: true });
      mono(X, 210, '7b 22 69 64 22 3a 20 22 6f 2d 31 30 …', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
      sub(X, 236, 'value = 50 bytes', fade(u, 1.5), { class: 'mono', 'font-size': 14 });
      mono(X, 290, 'key "o-101" → 6f 2d 31 30 31', { 'font-size': 15, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.9) });
      sub(X, 330, 'Kafka는 bytes만 안다', fade(u, 2.2), { 'font-weight': 700, fill: INK }); }
    if (k === 2) { dial(X, 210, 1, 0, u, pop(u, 0.2)); sub(X, 290, '여기서는 1로 직접 적었다', fade(u, 1.2), { 'font-weight': 700, fill: INK });
      sub(X, 316, '생략하면 Kafka 3.0 이후 클라이언트는 all', fade(u, 1.7), { fill: WARN, 'font-weight': 700 }); }
    if (k === 3) { const ax = 500, aw = 380; el('line', { x1: ax, y1: 200, x2: ax + aw * E(u, 0.2, 0.8), y2: 200, stroke: MUT, 'stroke-width': 2 });
      ['1차', '재시도 1', '재시도 2', '재시도 3'].forEach((s, i) => { const x = ax + 20 + i * 115, f = pop(u, 0.5 + i * 0.35);
        card(x, 200, 22, 22, { rx: 11, stroke: i ? WARN : INK, fill: i ? C.WARNBG : PANEL, s: f }); sub(x, 236, s, fade(u, 0.6 + i * 0.35), { 'font-weight': 700, fill: i ? WARN : INK }); });
      clock(X, 110, 30, E(u, 0.5, 2.4), INFO, '요청 1건 최대 30s'); sub(X, 300, '일시적 실패는 3번까지 다시 보낸다', fade(u, 2.0)); }
    if (k === 4) { const bx = 520, bw = 320, fill = E(u, 0.3, 2.0);
      card(bx + bw / 2, 150, bw + 16, 64, { rx: 10, stroke: ACC, sw: 2.2, fill: 'none' });
      el('rect', { x: bx, y: 126, width: bw * fill * 0.62, height: 48, rx: 6, fill: ACC, opacity: 0.35 });
      for (let i = 0; i < Math.floor(fill * 9); i++) el('rect', { x: bx + 6 + i * 22, y: 134, width: 18, height: 32, rx: 3, fill: ACC });
      mono(bx + bw / 2, 104, 'batch (최대 16,384 bytes)', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC });
      clock(bx + 60, 270, 26, E(u, 0.3, 2.0), WARN, 'linger 5ms');
      sub(bx + 220, 262, '5ms를 기다리거나', fade(u, 1.0), { 'font-weight': 700, fill: INK }); sub(bx + 220, 286, 'batch가 차면 한 번에 보낸다', fade(u, 1.3), { 'font-weight': 700, fill: INK }); }
    if (k === 5) { card(X, 150, 300, 70, { rx: 12, stroke: ACC, sw: 2.4, fill: ACCBG, text: '버퍼 (RecordAccumulator)', fs: 15, s: pop(u, 0.2) });
      const a = t * 2.4; el('circle', { cx: X, cy: 270, r: 34, fill: 'none', stroke: GRID, 'stroke-width': 3 });
      el('circle', { cx: X + Math.cos(a) * 34, cy: 270 + Math.sin(a) * 34, r: 7, fill: ACC, opacity: fade(u, 0.5) });
      lbl(X, 276, 'Sender', fade(u, 0.5), { 'font-size': 15 }); sub(X, 330, '객체가 생기면 이 스레드가 바로 돈다 · 끝낼 때 close()', fade(u, 1.2)); } }

  // 2. send() — 직렬화 → 버퍼 → 배치 전송
  const ST = { app: [70, 200], ser: [210, 200], par: [350, 200], acc: [520, 200], snd: [690, 200], brk: [860, 200] };
  const QY = [130, 200, 270];
  function pipe(k, u) {
    card(ST.app[0], 200, 96, 48, { text: 'send()', mono: true, fs: 15 });
    card(ST.ser[0], 200, 110, 48, { text: 'serializer', fs: 14.5, stroke: k === 1 ? ACC : INK });
    card(ST.par[0], 200, 110, 48, { text: 'partitioner', fs: 14.5, stroke: k === 2 ? ACC : INK });
    zone(440, 92, 160, 216, 'RecordAccumulator', { fill: SOFT, stroke: GRID, sw: 1.5 });
    QY.forEach((y, i) => { mono(452, y + 6, 'P' + i, { 'font-size': 14, 'font-weight': 700, fill: MUT }); el('rect', { x: 482, y: y - 16, width: 106, height: 32, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); });
    card(ST.snd[0], 200, 96, 48, { text: 'Sender', fs: 15, stroke: k >= 3 ? ACC : INK });
    server(ST.brk[0], 190, 'Leader (P2)', { s: 0.8, lamp: k >= 3 ? ACC : OFF });
    [[ST.app, ST.ser], [ST.ser, ST.par], [ST.par, [440, 200]], [[600, 200], ST.snd], [ST.snd, [ST.brk[0] - 50, 200]]].forEach(([a, b2]) =>
      el('line', { x1: a[0] + (a === ST.app || a === ST.ser || a === ST.par || a === ST.snd ? 52 : 0), y1: 200, x2: b2[0] - (b2 === ST.ser || b2 === ST.par || b2 === ST.snd ? 56 : 0), y2: 200, stroke: GRID, 'stroke-width': 2 })); }
  function s2(t, c) { const { k, u } = c;
    pipe(k, u);
    const inBuf = k === 1 ? seg(u, 1.6, 1.7) : k === 2 || k === 3 ? 1 : 0;
    if (k === 0) { [['① 직렬화', ST.ser[0]], ['② 버퍼 적재', 520], ['③ 배치 전송', ST.snd[0]]].forEach(([s, x], i) => pill(x, 50, s, ACC, pop(u, 0.3 + i * 0.5), { fs: 14 }));
      sub(520, 340, '버퍼는 아직 비어 있다', fade(u, 1.8)); }
    if (k === 1) { fly(ST.app[0], 150, ST.ser[0], 150, seg(u, 0.2, 0.7), 'o-101 dict', { mono: true, fill: INK });
      fly(ST.ser[0], 150, 535, QY[2], seg(u, 0.8, 1.6), 'bytes', { mono: true });
      sub(ST.ser[0], 252, 'dict → JSON bytes', fade(u, 0.8), { 'font-weight': 700, fill: ACC }); }
    if (inBuf > 0) el('rect', { x: 486, y: QY[2] - 12, width: 30, height: 24, rx: 4, fill: ACC, opacity: inBuf });
    if (k === 2) { mono(330, 262, 'murmur2("o-101")', { 'font-size': 14, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.2) });
      mono(330, 286, '& 0x7fffffff = 1412154713', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.7) });
      mono(330, 312, '% 3 = 2 → P2', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      grow(392, 308, 482, QY[2] + 10, E(u, 1.4, 1.9), ACC);
      card(ST.ser[0], 110, 210, 40, { rx: 8, stroke: BAD, fill: C.BADBG, text: '직렬화 실패는 send()에서 바로 예외', fs: 13.5, color: BAD, s: pop(u, 2.0) }); }
    if (k === 3) { fly(ST.app[0], 250, ST.app[0], 300, seg(u, 0.1, 0.5), 'Future', { mono: true, fill: INFO, stay: true });
      dot([[600, QY[2]], [ST.snd[0], 200], [ST.brk[0] - 50, 200]], seg(u, 0.7, 1.8), ACC, 8);
      if (u > 1.8) el('rect', { x: 486, y: QY[2] - 12, width: 30, height: 24, rx: 4, fill: PANEL, opacity: 1 });
      clock(ST.app[0], 360, 18, E(u, 1.0, 2.6), WARN); sub(260, 366, '.get(timeout=10)을 부를 때만 기다린다', fade(u, 1.2), { fill: WARN, 'font-weight': 700 }); }
    if (k === 4) { [0, 1, 2].forEach((i) => { const y = QY[i]; const gone = seg(u, 0.6 + i * 0.25, 1.2 + i * 0.25);
        if (gone < 1) el('rect', { x: 486, y: y - 12, width: 30 + (i === 1 ? 26 : 0), height: 24, rx: 4, fill: ACC, opacity: 1 - gone });
        dot([[600, y], [ST.snd[0], 200], [ST.brk[0] - 50, 200]], seg(u, 0.6 + i * 0.25, 1.6 + i * 0.25), ACC, 7); });
      pill(ST.app[0] + 40, 120, 'flush()', ACC, pop(u, 0.2), { mono: true, fs: 15 }); pill(ST.app[0] + 40, 300, 'close()', INK, pop(u, 2.0), { mono: true, fs: 15 });
      sub(520, 340, '남은 배치를 모두 내보내고 닫는다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); } }

  // 3~5 공통: Producer · Leader · Follower 2
  const PP = [90, 210], LD = [440, 200], F1 = [770, 110], F2 = [770, 300];
  function cluster(o) { o = o || {};
    card(PP[0], PP[1], 120, 54, { text: 'Producer', fs: 15, stroke: o.pStroke || INK, sw: 2.2 });
    el('line', { x1: LD[0] + 60, y1: LD[1] - 20, x2: F1[0] - 60, y2: F1[1], stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': o.f1Out ? '5 6' : null });
    el('line', { x1: LD[0] + 60, y1: LD[1] + 20, x2: F2[0] - 60, y2: F2[1], stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': o.f2Out ? '5 6' : null });
    if (o.isr) { const w = o.isr === 1 ? 170 : 520; zone(LD[0] - 80, 34, w, 350, 'ISR', { fill: 'none', stroke: GOOD, dash: '7 5', sw: 2, color: GOOD }); }
    server(LD[0], LD[1], o.leadName || 'Leader', { stroke: o.lDead ? OFF : INK, lamp: o.lDead ? OFF : ACC });
    server(F1[0], F1[1], 'Follower 1', { stroke: o.f1Out ? OFF : INK, lamp: o.f1Lamp || OFF });
    server(F2[0], F2[1], 'Follower 2', { stroke: o.f2Out ? OFF : INK, lamp: o.f2Lamp || OFF }); }
  const toL = [[PP[0] + 60, PP[1]], [LD[0] - 60, LD[1]]];
  const fromL = toL.slice().reverse();
  const toF1 = [[LD[0] + 60, LD[1] - 20], [F1[0] - 60, F1[1]]], toF2 = [[LD[0] + 60, LD[1] + 20], [F2[0] - 60, F2[1]]];
  const ACKS = { 0: 0, 1: 1, 2: 2 };

  // 3. acks=0
  function s3(t, c) { const { k, u } = c;
    cluster({});
    dial(150, 105, 0, k === 0 ? 1 : 0, u); ratings(c, 24, 340);
    if (k === 0) { dot(toL, seg(u, 0.3, 1.2), ACC, 8);
      grow(LD[0] - 64, LD[1] + 24, PP[0] + 64, PP[1] + 24, E(u, 1.3, 2.0), MUT, { dash: '5 5', plain: true }); cross(265, 222, 11, pop(u, 2.0));
      sub(265, 256, 'ack를 기다리지 않는다', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); }
    if (k === 1) { pill(PP[0] + 30, 290, 'retries 3 → 0', WARN, pop(u, 0.3), { mono: true, fs: 14 });
      sub(265, 160, '실패해도 알 길이 없으니', fade(u, 0.9), { 'font-weight': 700, fill: INK }); sub(265, 182, '다시 보낼 근거도 없다', fade(u, 1.2), { 'font-weight': 700, fill: INK }); }
    if (k === 2) { dot(toL, seg(u, 0.5, 1.6), ACC, 8); check(PP[0] + 74, PP[1] - 40, 10, pop(u, 0.3)); sub(PP[0] + 74, PP[1] - 58, '끝!', fade(u, 0.3), { fill: GOOD, 'font-weight': 800 });
      pill(265, 290, 'Future → offset = -1', INFO, pop(u, 1.4), { mono: true, fs: 14 }); sub(265, 322, '"보냈다" 와 "도착했다" 가 갈라진다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); }
    if (k === 3) { for (let i = 0; i < 10; i++) dot(toL, (t * 1.4 + i / 10) % 1, ACC, 5);
      const n = Math.round(lerp(0, 1000, E(u, 0.2, 2.2)));
      mono(265, 150, `${n.toLocaleString('en-US')} / 1,000`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      sub(265, 178, 'app-metrics로 루프 발행', 1, { class: 'mono' }); sub(265, 300, 'flush()는 버퍼를 비웠다는 뜻일 뿐', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); }
    if (k === 4) { for (let i = 0; i < 6; i++) { const f = (t * 1.2 + i / 6) % 1; if (f < 0.75) dot(toL, f, ACC, 5); }
      if (u > 0.6) cross(LD[0], LD[1], 26, pop(u, 0.6));
      [['맞는 곳', ['메트릭', 'debug 로그', '클릭스트림'], GOOD, 290], ['쓰면 안 되는 곳', ['결제', '주문', '정산'], BAD, 350]].forEach(([h, list, col, y], j) => { const x = 288;
        card(x, y, 220, 52, { rx: 10, stroke: col, sw: 2, fill: j ? C.BADBG : C.GOODBG, s: pop(u, 1.2 + j * 0.4) });
        tx(x, y - 5, h, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, opacity: fade(u, 1.3 + j * 0.4) });
        tx(x, y + 16, list.join(' · '), { 'text-anchor': 'middle', 'font-size': 14, fill: INK, opacity: fade(u, 1.3 + j * 0.4) }); });
      sub(265, 160, 'Leader가 죽어도 producer는 모른다', fade(u, 0.9), { fill: BAD, 'font-weight': 700 }); } }

  // 4. acks=1
  function logCells(x, y, n, o) { o = o || {}; for (let i = 0; i < n; i++) { const last = i === n - 1 && o.hiLast;
    el('rect', { x: x + i * 26 - (n * 26) / 2, y, width: 22, height: 20, rx: 3, fill: last ? (o.col || ACC) : OFF, opacity: last ? (o.op ?? 1) : 1, stroke: o.dash && last ? BAD : 'none', 'stroke-dasharray': o.dash && last ? '3 3' : null }); } }
  function s4(t, c) { const { k, u } = c;
    const lead = k === 5 && u > 1.2;
    cluster({ f1Lamp: k >= 2 && k <= 4 ? WARN : OFF, lDead: lead, pStroke: k === 4 && u > 1.6 ? BAD : INK });
    dial(150, 105, 1, k === 0 ? 0 : 1, u); ratings(c, 24, 340);
    const lc = k >= 2 ? 4 : 3;
    logCells(LD[0], 274, lead ? 0 : lc, { hiLast: k >= 2 }); logCells(F1[0], 184, k >= 3 && k !== 5 ? 4 : 3, { hiLast: k >= 3 && k !== 5, col: WARN }); logCells(F2[0], 374, 3, {});
    if (k === 0) { dot(toL, seg(u, 0.3, 1.1), ACC, 8); grow(LD[0] - 64, LD[1] + 26, PP[0] + 64, PP[1] + 26, E(u, 1.3, 2.0), GOOD); sub(265, 262, 'Leader 기록 ack', fade(u, 1.8), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 1) { const ax = 170, y = 290; ['보냄', '200ms', '200ms', '200ms'].forEach((s, i) => { const x = ax + i * 60, f = pop(u, 0.3 + i * 0.4);
        card(x, y, 18, 18, { rx: 9, stroke: i ? WARN : INK, fill: i ? C.WARNBG : PANEL, s: f }); sub(x, y - 18, i ? `재시도 ${i}` : '1차', fade(u, 0.3 + i * 0.4), { 'font-weight': 700, fill: i ? WARN : INK });
        if (i) sub(x - 30, y + 30, s, fade(u, 0.3 + i * 0.4), { class: 'mono' }); });
      sub(290, 152, '실패를 알 수 있어 재시도가 의미를 가진다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); }
    if (k === 2) { dot(toL, seg(u, 0.2, 0.9), ACC, 8); dot(toF1, seg(u, 1.2, 2.4), WARN, 7); sub(F2[0], 236, '아직 시작 전', fade(u, 1.4)); sub(LD[0], 316, '로컬 log에 기록', fade(u, 1.0), { fill: ACC, 'font-weight': 700 }); }
    if (k === 3) { dot(toF1, (t * 0.5) % 1, WARN, 7); fly(LD[0] - 60, LD[1] + 40, PP[0] + 40, PP[1] + 50, seg(u, 0.3, 1.2), 'partition · offset', { mono: true, fill: GOOD, stay: true });
      sub(F1[0], 236, '복제 중 · 안 기다린다', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); }
    if (k === 4) { dot(toL, seg(u, 0.2, 0.9), ACC, 8); if (u > 1.0) cross(265, 200, 11, pop(u, 1.0));
      pill(PP[0] + 20, 290, 'KafkaError → raise', BAD, pop(u, 1.6), { mono: true, fs: 14 }); sub(PP[0] + 20, 322, '운영 알람을 건다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
    if (k === 5) { if (lead) cross(LD[0], LD[1], 26, pop(u, 1.2));
      if (!lead) grow(LD[0] - 64, LD[1] + 26, PP[0] + 64, PP[1] + 26, E(u, 0.2, 0.8), GOOD);
      sub(LD[0], 316, lead ? 'ack 직후 Leader 다운' : 'ack를 보냈다', 1, { fill: lead ? BAD : GOOD, 'font-weight': 700 });
      if (u > 1.8) { pill(F1[0], 40, '새 Leader', ACC, pop(u, 1.8), { fs: 14 }); el('rect', { x: F1[0] + 3 * 26 - 52, y: 184, width: 22, height: 20, rx: 3, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '3 3' });
        sub(F1[0] + 30, 228, '마지막 메시지가 없다 → 잃는다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); } } }

  // 5. acks=all
  function s5(t, c) { const { k, u } = c;
    if (k === 6) { // 세 모드 비교 (페이지 데이터의 속도·안전 별점)
      const rows = [['acks=0', 5, 1], ['acks=1', 3, 3], ['acks=all', 2, 5]];
      tx(480, 50, '속도와 안전, 둘 다 가질 수는 없다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      rows.forEach(([n, sp, sa], i) => { const y = 110 + i * 92, g = E(u, 0.2 + i * 0.35, 1.0 + i * 0.35);
        mono(200, y + 22, n, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: INK });
        tx(230, y + 8, '속도', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); el('rect', { x: 280, y: y - 6, width: 80 * sp * g, height: 18, rx: 4, fill: ACC });
        tx(230, y + 40, '안전', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); el('rect', { x: 280, y: y + 26, width: 80 * sa * g, height: 18, rx: 4, fill: GOOD });
        mono(290 + 80 * sp * g, y + 8, String(sp), { 'font-size': 14, 'font-weight': 700, opacity: g }); mono(290 + 80 * sa * g, y + 40, String(sa), { 'font-size': 14, 'font-weight': 700, opacity: g }); });
      sub(480, 400, '별점은 이 장의 비교용 값 (5점 만점)', fade(u, 1.8)); return; }
    const outs = k === 5;
    cluster({ isr: outs ? (u > 0.8 ? 1 : 2) : 2, f1Out: outs && u > 0.8, f2Out: outs && u > 0.8, f1Lamp: k >= 3 && !outs ? GOOD : OFF, f2Lamp: k >= 3 && !outs ? GOOD : OFF, pStroke: outs && u > 1.8 ? BAD : INK });
    dial(150, 105, 2, k === 0 ? 1 : 2, u); ratings(c, 24, 340);
    const lc = k >= 3 && !outs ? 4 : 3;
    logCells(LD[0], 274, lc, { hiLast: k >= 3 && !outs }); logCells(F1[0], 184, k >= 4 && !outs ? 4 : 3, { hiLast: k >= 4 && !outs, col: GOOD }); logCells(F2[0], 374, k >= 4 && !outs ? 4 : 3, { hiLast: k >= 4 && !outs, col: GOOD });
    if (k === 0) { sub(LD[0] + 180, 408, 'ISR 안의 사본이 모두 써야 성공', fade(u, 1.0), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 1) { fly(PP[0] + 60, 160, LD[0] - 70, 160, seg(u, 0.2, 0.9), 'PID·seq 5', { mono: true, stay: true });
      if (u > 1.0) { cross(265, 222, 10, pop(u, 1.0)); sub(265, 300, 'ack 유실', fade(u, 1.0), { fill: BAD, 'font-weight': 700 }); }
      fly(PP[0] + 60, 262, LD[0] - 70, 262, seg(u, 1.3, 2.0), 'seq 5 재시도', { mono: true, fill: WARN });
      if (u > 2.0) { sub(LD[0], 96, '같은 seq → 버린다', fade(u, 2.0), { fill: GOOD, 'font-weight': 800 }); }
      sub(265, 322, 'seq 번호는 예시', fade(u, 1.5)); }
    if (k === 2) { for (let i = 0; i < 5; i++) card(170 + i * 38, 300, 28, 28, { rx: 5, stroke: ACC, fill: ACCBG, s: pop(u, 0.3 + i * 0.2), text: String(i + 1), fs: 13.5, mono: true });
      sub(246, 274, 'in-flight 요청 최대 5', fade(u, 0.3), { fill: ACC, 'font-weight': 700 }); pill(290, 160, 'retries=10', INK, pop(u, 1.3), { mono: true, fs: 14 }); }
    if (k === 3) { dot(toL, seg(u, 0.2, 0.9), ACC, 8); dot(toF1, seg(u, 1.0, 2.0), GOOD, 7); dot(toF2, seg(u, 1.0, 2.0), GOOD, 7);
      clock(PP[0], 300, 18, E(u, 0.9, 2.6), WARN); sub(PP[0] + 70, 306, '기다리는 중', fade(u, 1.0), { fill: WARN, 'font-weight': 700 }); }
    if (k === 4) { dot(toF1.slice().reverse(), seg(u, 0.2, 0.9), GOOD, 7); dot(toF2.slice().reverse(), seg(u, 0.2, 0.9), GOOD, 7);
      grow(LD[0] - 64, LD[1] + 26, PP[0] + 64, PP[1] + 26, E(u, 1.1, 1.8), GOOD); pill(265, 292, 'durable ok', GOOD, pop(u, 1.8), { mono: true, fs: 14 }); }
    if (outs) { if (u > 0.8) { cross(F1[0], F1[1], 22, pop(u, 0.8)); cross(F2[0], F2[1], 22, pop(u, 0.8)); }
      dot(toL, seg(u, 0.9, 1.5), ACC, 8);
      card(LD[0], 340, 230, 44, { rx: 8, stroke: BAD, fill: C.BADBG, text: 'ISR 1 < min.insync 2', mono: true, fs: 14.5, color: BAD, s: pop(u, 1.5) });
      pill(PP[0] + 40, 290, 'NotEnoughReplicas', BAD, pop(u, 1.9), { mono: true, fs: 13.5 }); } }

  const quiz = [
    { q: 'KafkaProducer를 만들 때 bootstrap.servers에 적은 broker 주소는 무슨 일을 하는가?',
      o: ['메시지를 항상 이 broker로만 보낸다', '처음 붙어 metadata를 받아 오는 입구다', 'Follower 목록을 정한다'], a: 1,
      why: 'bootstrap 주소는 첫 접속용이다. 거기서 받은 metadata로 partition별 leader를 알아내 실제 전송은 leader로 간다.' },
    { q: 'producer.send()를 부른 직후 일어나는 일은 무엇인가?',
      o: ['버퍼에 넣고 Future를 바로 돌려준다', 'Leader의 ack를 받을 때까지 멈춘다', '메시지를 곧장 디스크에 쓴다'], a: 0,
      why: 'send()는 비동기다. o-101은 murmur2 % 3 = 2라 P2 버퍼에 들어가고, 실제 전송은 Sender 스레드가 배치로 한다.' },
    { q: 'acks=0으로 보낸 메시지의 Future에서 얻을 수 있는 offset은 무엇인가?',
      o: ['broker가 붙인 실제 offset', '보낸 순번', '늘 -1'], a: 2,
      why: 'acks=0이면 broker 응답을 받지 않으므로 offset은 늘 -1이다. 도착했는지도 알 수 없다.' },
    { q: 'acks=1에서 메시지를 잃는 경우는 어떤 때인가?',
      o: ['Follower 하나가 느릴 때', 'Leader가 ack를 보낸 직후 복제 전에 죽을 때', 'Producer가 재시도할 때'], a: 1,
      why: 'Leader만 기록하고 ack를 보낸 상태라 그 직후 Leader가 죽으면 복제되지 않은 메시지는 새 Leader에 없다.' },
    { q: 'RF=3, min.insync.replicas=2인 토픽에 acks=all로 보낼 때 발행이 거부되는 때는?',
      o: ['Follower 하나가 ISR에서 빠졌을 때', 'Leader가 ack를 늦게 보낼 때', 'Follower 둘이 모두 빠져 ISR이 Leader 하나뿐일 때'], a: 2,
      why: 'ISR이 2개면 아직 기준을 채운다. Leader 혼자 남아 ISR 1이 되면 NotEnoughReplicas로 거부한다.' },
  ];

  const summary = [
    'KafkaProducer는 버퍼와 Sender 스레드를 가진 송신기다. send()는 버퍼에 넣고 바로 돌아온다.',
    'key는 murmur2 % partition 수로 갈 곳이 정해진다. o-101은 3개 중 P2로 간다.',
    'acks=0은 offset -1만 돌려받고, acks=1은 Leader가 ack 직후 죽으면 잃을 수 있다.',
    'acks=all과 idempotence를 쓰면 ISR이 하나라도 살아 있는 한 잃지 않고 중복도 없다.',
  ];
  const review = [
    { q: '결제 이벤트가 가끔 두 번 처리된다. producer는 acks=1, retries=3이다. 먼저 바꿀 설정은?',
      o: ['acks=0으로 낮춘다', 'linger_ms를 0으로 줄인다', 'acks=all과 enable.idempotence를 켠다'], a: 2,
      why: 'ack를 못 받아 재시도하면 같은 메시지가 두 번 쌓일 수 있다. idempotence가 같은 seq를 버려 중복을 막고, acks=all이 유실도 막는다.' },
    { q: '처리량을 높이려고 매 send() 뒤에 .get()을 부르던 코드를 살펴본다. 처리량이 낮았던 이유는?',
      o: ['건마다 ack를 기다려 배치가 모이지 못했다', 'serializer가 느려서', 'partition이 너무 많아서'], a: 0,
      why: 'send()는 버퍼에 쌓아 linger·batch 조건으로 묶어 보낸다. 매번 .get()으로 막으면 배치가 한 건짜리가 된다.' },
    { q: 'broker 3대 중 2대가 점검으로 내려갔더니 결제 발행이 NotEnoughReplicas로 실패한다. 설정은 acks=all, min.insync.replicas=2다. 맞는 해석은?',
      o: ['설정 충돌로 생긴 producer 쪽 버그다', 'ISR이 1개라 일부러 거부한 것으로, 조용히 잃는 것보다 낫다', 'acks=0으로 바꾸면 안전하게 해결된다'], a: 1,
      why: 'Leader 혼자서는 기준 2를 못 채운다. 거부는 사본 없이 받아 두었다가 잃는 일을 막는 의도된 동작이다.' },
  ];

  R.page({ title: 'Producer 송신 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
