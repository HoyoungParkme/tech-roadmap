/* I-1-2 메시지 큐란 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 발행 수·쌓인 수·처리 수·속도는 STEPS 의 producer · broker · consumer, 키 해시는 keys, 효과 목록은 decoupleBox 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, cross, check, clock, meters, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const num = (s) => parseFloat(String(s)) || 0;
  const pv = (c, f, g) => (c.prev ? (g ? c.prev[f][g] : c.prev[f]) : null);
  function curve(d, u, col, o) { o = o || {}; if (u <= 0) return; const p = el('path', { d, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 100, opacity: o.op ?? 1 });
    p.setAttribute('stroke-dasharray', u >= 1 ? (o.dash || 'none') : `${u * 100} 100`); }
  // 칸 하나 (로그의 레코드)
  const cell = (x, y, w, h, s, st) => { st = st || {}; if (s <= 0) return; card(x + w / 2, y + h / 2, w, h, { rx: 4, stroke: st.stroke || ACC, fill: st.fill || ACCBG, sw: 1.8, s, text: st.text, fs: 13.5, mono: true, color: st.color, op: st.op }); };
  // 아래 계기판: 발행 · 로그에 남은 것 · 처리
  function counters(c, y) { const b = c.beat, u = c.u;
    meters(150, y, 660, [
      { name: '발행 (Producer)', val: String(Math.round(tween(pv(c, 'producer', 'total'), b.producer.total, u))) },
      { name: '로그에 남은 것 (lag)', val: String(Math.round(tween(pv(c, 'broker', 'queued'), b.broker.queued, u))) },
      { name: '처리 (Consumer)', val: String(Math.round(tween(pv(c, 'consumer', 'total'), b.consumer.total, u))), good: b.consumer.total > 0 },
    ], { h: 64 }); }

  // ================= 1. Producer 가 발행한다 =================
  const LX1 = 236, LW1 = 56, LG1 = 6;
  function s1(t, c) { const { k, u } = c, n = c.beat.producer.total, n0 = pv(c, 'producer', 'total') ?? n;
    server(95, 120, 'order-service', { lamp: n > 0 || k >= 1 ? ACC : OFF });
    zone(LX1 - 16, 70, 8 * (LW1 + LG1) + 26, 96, 'orders-topic', { fill: SOFT });
    for (let i = 0; i < 8; i++) { const x = LX1 + i * (LW1 + LG1);
      el('rect', { x, y: 100, width: LW1, height: 40, rx: 4, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4' });
      mono(x + LW1 / 2, 158, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (i < n) { const fresh = i >= n0, a = fresh ? seg(u, 0.3 + (i - n0) * 0.5, 0.9 + (i - n0) * 0.5) : 1;
        if (fresh && a < 1) fly(160, 110, x + LW1 / 2, 120, a, 'msg-' + (i + 1), { mono: true });
        else cell(x, 100, LW1, 40, 1, { text: 'msg-' + (i + 1) }); } }
    // Consumer 는 그림에 있지만 Producer 설정에는 없다
    card(865, 120, 150, 62, { rx: 10, stroke: OFF, dash: '6 5', text: 'email-service', fs: 15, color: MUT });
    if (k === 0) { curve(`M150,92 C180,40 ${LX1},40 ${LX1 + 10},68`, seg(u, 0.3, 1.1), ACC, { sw: 2.4 });
      pill(400, 36, 'bootstrap_servers=["broker:9092"]', ACC, pop(u, 1.0), { mono: true, fs: 13.5, fill: PANEL });
      curve('M150,150 C400,260 700,260 830,152', seg(u, 1.4, 2.1), OFF, { dash: '6 6' }); cross(490, 237, 10, pop(u, 2.0));
      tx(490, 272, '설정 어디에도 email-service 주소는 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 1) { const lines = ['event = {', '  "order_id": 1,', '  "amount": 10000,', '  "event": "order-created",', '}'];
      card(480, 248, 330, 128, { rx: 10, fill: SOFT, stroke: GRID, s: pop(u, 0.2) });
      lines.forEach((s, i) => mono(340, 204 + i * 22, s, { 'font-size': 14.5, fill: i === 3 ? ACC : INK, 'font-weight': i === 3 ? 700 : 400, opacity: fade(u, 0.5 + i * 0.3) })); }
    if (k === 2) pill(400, 210, 'send("orders-topic", event) → flush()', ACC, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
    if (k === 4) { mono(300, 250, '발행 5', { 'font-size': 26, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      mono(660, 250, '처리 0', { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(480, 250, '≠', { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(480, 286, 'send는 broker가 받았다는 뜻일 뿐이다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    counters(c, 328); }

  // ================= 2. Broker 가 저장한다 =================
  const PX = 250, PW = 40, PG = 4, PY = [104, 164, 224];
  const rowOf = (i) => i % 3, posOf = (i) => Math.floor(i / 3);   // msg-(i+1) 을 번갈아 담은 예
  function partitions(n, o) { o = o || {};
    PY.forEach((y, p) => { tx(PX - 14, y + 26, 'p' + p, { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'end', opacity: o.op ?? 1 }); });
    for (let i = 0; i < n; i++) { const s = o.s ? o.s(i) : 1; cell(PX + posOf(i) * (PW + PG), PY[rowOf(i)], PW, 38, s, { text: o.noText ? null : String(i + 1), op: o.op }); } }
  function s2(t, c) { const { k, u } = c, n = c.beat.broker.queued, n0 = pv(c, 'broker', 'queued') ?? n;
    server(95, 160, 'order-service', { lamp: ACC }); card(865, 160, 150, 62, { rx: 10, stroke: OFF, dash: '6 5', text: 'email-service', fs: 15, color: MUT });
    zone(PX - 46, 70, 560, 220, 'orders-topic', { fill: SOFT });
    if (k <= 1) { // 아직 한 줄로 쌓이는 모습
      for (let i = 0; i < n; i++) { const fresh = i >= n0, s = fresh ? pop(u, 0.3 + (i - n0) * 0.3) : 1; cell(PX - 20 + i * (PW + PG), 140, PW, 40, s, { text: String(i + 1) }); }
      if (k === 0) { clock(160, 270, 18, E(u, 0.2, 1.0), ACC, null); tx(185, 276, '넣을 때', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4) });
        clock(700, 330, 18, E(u, 1.2, 2.2), INFO, null); tx(725, 336, '가져갈 때 (나중에)', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
        tx(480, 380, '보내는 쪽과 받는 쪽이 같은 순간에 있을 필요가 없다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
      if (k === 1) ['수신', '저장', '순서보장', '배달', '복제'].forEach((s, i) => pill(258 + i * 112, 236, s, ACC, pop(u, 0.4 + i * 0.3), { fs: 15, fill: PANEL }));
      if (k === 1) tx(480, 340, '배달은 밀어 주기가 아니라 가져갈 때까지 보관이다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) });
      return; }
    if (k === 2) { // 한 줄이 세 줄로 갈라진다
      const g = E(u, 0.3, 1.5);
      for (let i = 0; i < n; i++) { const x0 = PX - 20 + Math.min(i, 11) * (PW + PG), y0 = 140, x1 = PX + posOf(i) * (PW + PG), y1 = PY[rowOf(i)];
        const s = i >= n0 ? pop(u, 1.6 + (i - n0) * 0.2) : 1; cell(lerp(x0, x1, g), lerp(y0, y1, g), PW, 38, s, { text: String(i + 1) }); }
      PY.forEach((y, p) => tx(PX - 14, y + 26, 'p' + p, { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'end', opacity: g }));
      tx(480, 320, '키 없는 메시지를 흩어 담은 예 · 순서는 한 파티션 안에서만', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { partitions(n, { op: 0.4, noText: true });
      const ks = c.beat.keys || [], extra = [0, 0, 0];
      ks.forEach((kk, j) => { const a = 0.2 + j * 0.6, here = u >= a, done = u >= a + 0.5, slot = Math.ceil((n - kk.p) / 3) + extra[kk.p];
        const x = PX + slot * (PW + PG) + 8 + extra[kk.p] * 28, y = PY[kk.p];
        if (done) card(x + 32, y + 19, 64, 38, { rx: 4, stroke: INFO, fill: INFOBG, sw: 2, text: kk.key, fs: 13.5, mono: true, color: INFO, s: pop(u, a + 0.5, 0.4) });
        else if (here) fly(150, 160, x + 32, y + 19, seg(u, a, a + 0.5), kk.key, { fill: INFO, mono: true });
        extra[kk.p]++; });
      const j = clamp(Math.floor((u - 0.2) / 0.6), 0, ks.length - 1), kk = ks[j];
      if (kk && u > 0.2) { const m = kk.hash & 0x7fffffff;
        mono(480, 330, `murmur2("${kk.key}") = ${kk.hash}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
        mono(480, 356, `& 0x7fffffff = ${m}  →  % 3 = ${kk.p}`, { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' }); }
      tx(480, 396, '같은 키는 언제나 같은 파티션 · 다른 키가 같은 칸을 나눠 쓰기도 한다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 4) { const off = seg(u, 0.3, 0.8), on = seg(u, 1.4, 2.0), op = u < 1.4 ? 1 - off * 0.9 : 0.1 + on * 0.9;
      partitions(n, { op, s: (i) => (i >= n0 ? pop(u, 2.0 + (i - n0) * 0.15) : 1) });
      card(480, 330, 300, 44, { rx: 10, stroke: u > 0.3 && u < 1.6 ? BAD : GOOD, text: u > 0.3 && u < 1.6 ? 'broker 재시작 중…' : 'broker 다시 떴다', fs: 15, color: u > 0.3 && u < 1.6 ? BAD : GOOD });
      mono(480, 384, 'orders-topic-0/00000000000000000000.log', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      tx(480, 406, '디스크의 세그먼트 파일에 남아 있다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); return; }
    // k5: 들어오는 속도와 나가는 속도의 차이
    partitions(n, { s: (i) => (i >= n0 ? pop(u, 0.3 + (i - n0) * 0.3) : 1) });
    for (let i = 0; i < 6; i++) dot([[150, 160], [PX - 46, 160]], (t * 0.7 + i / 6) % 1, ACC, 5);
    mono(175, 140, '5 msg/s', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    mono(820, 230, '0 msg/s', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    mono(480, 336, 'lag ' + Math.round(tween(n0, n, u)), { 'font-size': 24, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    tx(480, 370, '속도 차이가 로그 길이로 나타난다. 그게 버퍼다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) }); }

  // ================= 3. Consumer 가 자기 속도로 =================
  const SX = 200, SW = 18;
  const ox = (o) => SX + o * SW;
  function strip(n, done) { zone(SX - 16, 78, 30 * SW + 32, 104, null, { fill: SOFT }); tx(SX + 30 * SW + 8, 100, 'orders-topic', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    for (let i = 0; i < 30; i++) { const on = i < n; el('rect', { x: ox(i) + 1, y: 112, width: SW - 2, height: 34, rx: 2, fill: !on ? 'none' : i < done ? OFF : ACCBG, stroke: on ? (i < done ? OFF : ACC) : GRID, 'stroke-width': 1.4, 'stroke-dasharray': on ? null : '3 3' }); }
    [0, 5, 10, 15, 20, 25, 30].forEach((v) => mono(ox(v), 166, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' })); }
  function cursor(o, col, lab, up) { const x = ox(o); el('path', { d: up ? `M${x - 7},${100} l7,10 l7,-10 z` : `M${x - 7},${158} l7,-10 l7,10 z`, fill: col }); if (lab) mono(x, up ? 94 : 190, lab, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, n = b.producer.total, done = b.consumer.total, d0 = pv(c, 'consumer', 'total') ?? done;
    server(80, 130, 'order-service', { lamp: ACC, s: 0.8 });
    card(865, 130, 150, 62, { rx: 10, stroke: INFO, sw: 2.2, text: 'email-service', fs: 15 });
    if (k === 0) { strip(n, 0); grow(790, 120, 760, 120, seg(u, 0.4, 0.9), INFO); curve('M790,140 C770,140 770,140 762,140', 0, INFO);
      pill(826, 192, 'group_id="email-service"', INFO, pop(u, 0.8), { mono: true, fs: 13.5 });
      pill(600, 232, 'poll()로 가져간다', INFO, pop(u, 1.3), { fs: 14 });
      tx(480, 300, '같은 그룹의 Consumer 들이 파티션을 나눠 맡고, 위치는 그룹 단위로 기억된다', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); counters(c, 336); return; }
    if (k === 1) { strip(n, 0); cursor(0, INFO, 'earliest → 0', true);
      const sw = 1 - E(u, 1.0, 1.5); el('rect', { x: 600, y: 222, width: 52, height: 26, rx: 13, fill: sw > 0.5 ? GOOD : OFF }); el('circle', { cx: 613 + 26 * sw, cy: 235, r: 10, fill: PANEL });
      tx(664, 241, 'enable_auto_commit=False', { 'font-size': 14, class: 'mono', 'font-weight': 700 });
      tx(480, 300, '처리에 성공한 것만 직접 커밋한다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); counters(c, 336); return; }
    if (k === 2) { strip(n, 0); cursor(0, INFO, 'next 0', true);
      const cyc = (u * 0.8) % 1; fly(ox(0) + 9, 129, 800, 130, clamp(cyc * 2), 'order', { fill: INFO });
      clock(865, 250, 26, clamp(cyc * 2 - 1), WARN, '0.5초 / 건');
      mono(480, 250, '1 ÷ 0.5초 = 2 msg/s', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.8) });
      tx(480, 290, 'Producer가 아무리 빨라도 이 속도는 코드가 정한다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); counters(c, 336); return; }
    if (k === 3) { const cur = tween(d0, done, u, 2.0); strip(n, Math.floor(cur)); cursor(cur, INFO, 'next ' + Math.round(cur), true); cursor(cur, GOOD, 'commit ' + Math.round(cur), false);
      el('path', { d: `M${ox(cur)},${212} l0,8 L${ox(n)},${220} l0,-8`, fill: 'none', stroke: WARN, 'stroke-width': 2 });
      mono((ox(cur) + ox(n)) / 2, 244, 'lag ' + Math.round(n - cur), { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      tx(480, 296, '발행 5 msg/s · 처리 2 msg/s, 차이는 로그가 받는다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); counters(c, 336); return; }
    // k4: offset 13 실패 → commit 안 함 → seek(13) → 다시 받아 성공
    const ph = u < 0.8 ? 0 : u < 1.6 ? 1 : u < 2.2 ? 2 : 3, cur = ph === 0 ? 12 + seg(u, 0.1, 0.6) : ph === 1 ? 14 : ph === 2 ? 13 : 14, com = ph < 3 ? 13 : 14;
    strip(n, com); cursor(cur, INFO, 'next ' + Math.round(cur), true); cursor(com, GOOD, 'commit ' + com, false);
    if (ph >= 1) { cross(ox(13) + 9, 129, 9); }
    if (ph === 1) tx(480, 250, 'offset 13 처리 실패 → commit 하지 않는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' });
    if (ph >= 2) curve(`M${ox(14)},${100} C${ox(14)},${70} ${ox(13) + 2},${70} ${ox(13) + 4},${98}`, seg(u, 1.6, 2.0), INFO, { sw: 2 });
    if (ph === 2) tx(480, 250, 'seek(13)으로 되감는다', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
    if (ph === 3) { tx(480, 250, '다시 받아 성공 → commit 14', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' }); check(ox(13) + 9, 200, 8); }
    tx(480, 290, '잃지 않는 대신 두 번 받을 수 있다 (at-least-once)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.3) }); counters(c, 336); }

  // ================= 4. 폭주를 로그가 받는다 =================
  const TX = 200, TY = 80, TW = 130, TH = 170, CAP = 800;
  function s4(t, c) { const { k, u } = c, b = c.beat, inR = tween(num(pv(c, 'producer', 'rate')), num(b.producer.rate), u), outR = tween(num(pv(c, 'consumer', 'rate')), num(b.consumer.rate), u);
    const q = tween(pv(c, 'broker', 'queued'), b.broker.queued, u, 1.8);
    server(70, 160, 'order-service', { lamp: inR > 20 ? BAD : ACC, s: 0.8 });
    const pin = 4 + inR * 0.18; el('rect', { x: 118, y: 165 - pin / 2, width: TX - 118, height: pin, fill: ACC, opacity: 0.7 });
    mono(160, 140 - pin / 2, Math.round(inR) + ' msg/s', { 'font-size': 14, 'font-weight': 800, fill: inR > 20 ? BAD : ACC, 'text-anchor': 'middle' });
    // 로그를 물탱크처럼: 높이 = lag
    el('rect', { x: TX, y: TY, width: TW, height: TH, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    const hgt = TH * clamp(q / CAP); el('rect', { x: TX + 2, y: TY + TH - hgt, width: TW - 4, height: Math.max(0, hgt - 2), rx: 6, fill: WARN, opacity: 0.45 });
    mono(TX + TW / 2, TY + TH + 24, 'lag ' + Math.round(q), { 'font-size': 18, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    tx(TX + TW / 2, TY - 10, 'orders-topic', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    const nc = b.consumers || 1, act = b.active || 1, ys = nc > 1 ? [70, 125, 180, 235] : [160];
    const pout = 3 + outR * 0.6; el('rect', { x: TX + TW, y: 165 - pout / 2, width: 40, height: pout, fill: INFO, opacity: 0.7 });
    mono(400, 296, '처리 ' + Math.round(outR) + ' msg/s', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
    ys.forEach((y, i) => { const idle = i >= act, s = nc > 1 && k === 4 ? pop(u, 0.2 + i * 0.25) : 1, ghost = k === 3;
      card(440, y, 104, 40, { rx: 8, stroke: idle ? OFF : INFO, fill: idle ? SOFT : PANEL, dash: ghost ? '5 4' : null, text: nc > 1 ? 'c' + (i + 1) : 'email', fs: 14.5, color: idle ? MUT : INFO, s, op: ghost ? 0.45 : 1 });
      if (nc > 1 && !idle) { curve(`M${TX + TW + 40},165 C${380},165 ${370},${y} ${386},${y}`, nc > 1 && k === 4 ? seg(u, 0.8 + i * 0.2, 1.3 + i * 0.2) : 1, INFO, { sw: 1.6 }); tx(372, y - 6, 'p' + i, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: k === 4 ? fade(u, 1.3 + i * 0.2) : 1 }); }
      if (idle) tx(500, y + 5, '놀고 있음', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: k === 4 ? fade(u, 1.5) : 1 }); });
    if (k === 1) { zone(30, 300, 460, 108, '직접 호출이었다면', { fill: BADBG });
      card(90, 368, 90, 36, { rx: 8, text: 'order', fs: 14, stroke: BAD }); card(400, 368, 100, 36, { rx: 8, text: 'email', fs: 14, stroke: BAD, color: BAD });
      for (let i = 0; i < 10; i++) dot([[136, 368], [348, 368]], (t * 1.1 + i / 10) % 1, BAD, 4);
      cross(400, 368, 22, pop(u, 1.0)); tx(250, 400, '100 msg/s를 바로 받아야 한다', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 }); }
    if (k === 2) { check(440, 220, 10, pop(u, 0.6)); tx(458, 226, '무사', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
      tx(260, 330, '지연만 늘고 시스템은 산다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 3) tx(260, 330, '받을 사람이 없어도 일단 저장한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
    if (k === 4) tx(260, 330, '파티션 3개 → 일하는 Consumer는 3개', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.6) });
    if (k === 5) tx(260, 330, '기울기 = 발행 5 − 처리 6 = −1 건/초', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.4) });
    // 오른쪽: lag 그래프 (이 장면 beat 들의 broker.queued)
    const ax = axes(610, 70, 300, 250, { x: [0, 5], y: [0, CAP], yt: [0, 200, 400, 600, 800], grid: true, yl: 'lag (건)', xl: '시간 →' });
    const pts = c.steps.map((s, i) => [i, s.broker.queued]);
    line(ax, pts.slice(0, k + 1), k === 0 ? 1 : 1, WARN, { sw: 2.4 });
    if (k > 0) { const a = pts[k - 1], bb = pts[k], f = E(u, 0.1, 1.9); line(ax, [a, [lerp(a[0], bb[0], f), lerp(a[1], bb[1], f)]], 1, WARN, { sw: 2.4 }); }
    pts.slice(0, k + 1).forEach(([x, y], i) => { const op = i < k ? 1 : fade(u, 1.8); el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 5, fill: WARN, opacity: op });
      mono(ax.X(x), ax.Y(y) - 12, String(y), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); });
    if (k === 5) tx(ax.X(4.5), ax.Y(560) + 40, '60초', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2) }); }

  // ================= 5. Consumer 가 죽어도 =================
  const BX5 = 220, BW5 = 480, MAXO = 60, bx = (o) => BX5 + (o / MAXO) * BW5;
  function logBar(end, com, o) { o = o || {};
    zone(BX5 - 14, 70, BW5 + 28, 96, 'orders-topic', { fill: SOFT });
    el('rect', { x: bx(0), y: 104, width: bx(com) - bx(0), height: 30, fill: OFF });
    el('rect', { x: bx(com), y: 104, width: Math.max(0, bx(end) - bx(com)), height: 30, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 });
    for (let i = 1; i < end; i++) el('line', { x1: bx(i), y1: 104, x2: bx(i), y2: 134, stroke: PANEL, 'stroke-width': 1 });
    el('rect', { x: bx(end), y: 104, width: Math.max(0, bx(MAXO) - bx(end)), height: 30, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4' });
    [0, 20, 40, 60].forEach((v) => mono(bx(v), 154, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    el('path', { d: `M${bx(com) - 7},${96} l7,10 l7,-10 z`, fill: GOOD }); mono(bx(com), 90, 'commit ' + Math.round(com), { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle' });
    mono((bx(com) + bx(end)) / 2, 124, 'lag ' + Math.round(end - com), { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); }
  function chips5(c) { const f = (c.beat.decoupleBox || { features: [] }).features, pf = c.prev && c.prev.decoupleBox ? c.prev.decoupleBox.features.length : 0;
    f.forEach((s, i) => { const name = s.split(' — ')[0], x = 104 + i * 188, sc = i >= pf ? pop(c.u, 0.5 + (i - pf) * 0.3) : 1;
      card(x, 398, 170, 32, { rx: 16, stroke: GOOD, fill: GOODBG, sw: 1.8, s: sc }); if (sc > 0.5) { check(x - 56, 398, 7); tx(x - 42, 403, name, { 'font-size': 14, 'font-weight': 700 }); } }); }
  function s5(t, c) { const { k, u } = c, b = c.beat, down = b.consumer.status === 'down';
    if (k === 0) { server(140, 170, 'order-service', { stroke: u > 1.6 ? BAD : INK, lamp: u > 1.6 ? BAD : ACC });
      card(800, 170, 160, 62, { rx: 10, stroke: BAD, text: 'email-service', fs: 15, color: BAD, op: 0.6 }); cross(800, 170, 20, pop(u, 0.2));
      grow(200, 160, 716, 160, seg(u, 0.3, 0.9), INK); mono(460, 148, 'POST /email', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      dot([[716, 182], [200, 182]], seg(u, 1.0, 1.6), BAD, 7);
      pill(140, 260, '타임아웃 · 에러', BAD, pop(u, 1.7), { fs: 14 });
      tx(480, 320, 'Consumer의 죽음이 그대로 Producer로 옮는다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    const e0 = pv(c, 'producer', 'total') ?? b.producer.total;
    const endT = tween(e0, b.producer.total, u, 1.6), com = tween(pv(c, 'consumer', 'total'), b.consumer.total, u, 1.6);
    server(90, 120, 'order-service', { lamp: ACC, s: 0.75 });
    for (let i = 0; i < 4; i++) dot([[136, 119], [bx(endT), 119]], (t * 0.6 + i / 4) % 1, ACC, 5);
    logBar(endT, com);
    card(850, 120, 150, 58, { rx: 10, stroke: down ? BAD : INFO, text: 'email-service', fs: 15, color: down ? BAD : INFO, op: down ? 0.6 : 1 });
    if (down) cross(850, 120, 18); else check(850, 165, 9, k === 4 ? pop(u, 0.2) : 1);
    if (k === 1) tx(480, 230, 'Producer는 broker 응답만 기다린다. 발행은 계속된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    if (k === 2) { const rows = [['Consumer 다운', 'Producer 에러', '큐만 증가'], ['Consumer 배포', '다운타임', '무중단'], ['Consumer 부활', '복구 어려움', 'offset부터 재생'], ['트래픽 폭주', 'Consumer 폭사', '큐가 흡수']];
      tx(400, 206, '직접 호출', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); tx(640, 206, '메시지 큐', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      rows.forEach(([a, x1, x2], i) => { const y = 236 + i * 34, op = fade(u, 0.3 + i * 0.35);
        tx(260, y, a, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
        cross(310, y - 5, 6, op); tx(326, y, x1, { 'font-size': 14, fill: BAD, opacity: op }); check(560, y - 5, 7, op); tx(576, y, x2, { 'font-size': 14, fill: GOOD, opacity: op }); }); }
    if (k === 3) ['시간', '위치', '속도', '실패'].forEach((s, i) => { const y = 214 + i * 38, cut = E(u, 0.6 + i * 0.35, 1.0 + i * 0.35), gap = cut * 30;
      el('line', { x1: 200, y1: y, x2: 480 - gap, y2: y, stroke: INK, 'stroke-width': 3 }); el('line', { x1: 480 + gap, y1: y, x2: 760, y2: y, stroke: INK, 'stroke-width': 3, opacity: 1 - cut * 0.5 });
      tx(190, y + 5, s + ' 결합', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' });
      if (cut > 0.2) tx(480, y + 5, '✂', { 'font-size': 16, 'text-anchor': 'middle', fill: ACC, opacity: cut }); });
    if (k === 4) { tx(480, 236, '커밋한 offset 20부터 이어서 읽는다. 잃은 메시지는 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      grow(bx(20), 172, bx(30), 172, seg(u, 0.3, 1.6), GOOD); }
    chips5(c); }

  const quiz = [
    { q: 'producer.send()가 성공적으로 끝났다는 것은 무엇을 뜻하는가?',
      o: ['email-service가 이메일을 보냈다', 'broker가 메시지를 받아 orders-topic에 넣었다', 'Consumer가 offset을 커밋했다'], a: 1,
      why: 'send는 broker까지만 책임진다. 그림에서 발행은 5건인데 처리는 0건인 것처럼, 발행 완료와 처리 완료는 다르다.' },
    { q: '파티션이 3개인 토픽에 키 user-1로 메시지를 여러 번 보내면 어디에 쌓이나?',
      o: ['매번 다른 파티션에 번갈아', '보낼 때마다 무작위 파티션에', '언제나 같은 파티션 2에'], a: 2,
      why: 'murmur2("user-1") & 0x7fffffff를 3으로 나눈 나머지가 2이므로 늘 파티션 2로 간다. 그래서 같은 키끼리는 순서가 지켜진다.' },
    { q: '이메일 1건 처리에 0.5초가 걸리는 Consumer의 처리 속도는?',
      o: ['Producer가 보내는 속도와 같다', '2 msg/s', '5 msg/s'], a: 1,
      why: '1초에 0.5초짜리 일을 두 번 할 수 있으니 2 msg/s다. Consumer 속도는 Producer가 아니라 처리 코드가 정한다.' },
    { q: '파티션 3개인 토픽에서 lag가 커져 같은 그룹 Consumer를 4개로 늘렸다. 실제로 일하는 Consumer는 몇 개인가?',
      o: ['3개', '4개', '1개'], a: 0,
      why: '한 그룹 안에서 파티션 하나는 Consumer 하나만 맡는다. 파티션이 3개뿐이라 4번째는 배정받을 파티션이 없어 논다.' },
    { q: 'email-service가 죽어 있는 동안 발행된 메시지는 Consumer가 살아난 뒤 어디서부터 읽히나?',
      o: ['토픽의 맨 처음 offset 0부터', '살아난 뒤 새로 들어온 메시지부터', '마지막으로 커밋한 offset 20부터'], a: 2,
      why: '그룹이 커밋한 위치는 브로커에 남아 있다. 살아나면 그 위치부터 읽어 밀린 40건을 따라잡는다.' },
  ];

  const summary = [
    'Producer는 broker 주소만 알고 orders-topic에 넣으면 끝이며, 발행 완료는 처리 완료가 아니다.',
    'broker는 메시지를 파티션별 디스크 로그에 쌓고, 같은 키는 murmur2 해시로 늘 같은 파티션에 간다.',
    'Consumer는 1건에 0.5초씩 자기 속도로 읽고, 성공한 것만 커밋해 실패한 메시지를 다시 받는다.',
    '발행이 처리보다 빠르면 lag가 쌓이고, 처리 속도가 발행을 넘어야 줄며 Consumer는 파티션 수까지만 일한다.',
  ];
  const review = [
    { q: '폭주 중에 Consumer를 3개에서 6개로 늘렸는데 lag 증가 속도가 그대로다. 먼저 확인할 것은?',
      o: ['토픽의 파티션 수가 3개인지', 'Producer의 acks 설정', 'broker 디스크 용량'], a: 0,
      why: '같은 그룹에서 파티션 하나는 Consumer 하나만 맡는다. 파티션이 3개면 늘린 3개는 놀고 처리 속도는 그대로다.' },
    { q: 'email-service가 10분간 죽었다가 살아났다. 처리 중 실패해 커밋 못 한 주문 메일은 어떻게 되나?',
      o: ['broker가 10분 뒤 지워서 사라진다', '커밋 위치부터 다시 읽어 다시 처리된다', 'Producer가 다시 보내야만 처리된다'], a: 1,
      why: '메시지는 로그에 남고 그룹은 커밋한 위치부터 읽는다. 처리는 했는데 커밋 전에 죽었다면 같은 메일이 한 번 더 갈 수 있어 멱등하게 짜야 한다.' },
    { q: '같은 사용자의 주문 이벤트 순서가 뒤섞여 처리됐다. 가장 먼저 의심할 것은?',
      o: ['Consumer의 처리 속도가 느려서', 'broker가 디스크에 저장하지 않아서', '메시지를 키 없이 보내 여러 파티션으로 흩어져서'], a: 2,
      why: '순서는 한 파티션 안에서만 지켜진다. 사용자 ID를 키로 주면 같은 사용자의 메시지가 늘 같은 파티션에 쌓인다.' },
  ];

  R.page({ title: 'Producer · Broker · Consumer', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
