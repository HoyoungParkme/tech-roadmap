/* III-2-1 Consumer Lag 모니터링 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, clock, terminal, axes, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  const strip = (s) => String(s || '').replace(/^[^\s가-힣A-Za-z0-9"]+\s*/, '');
  const ST = { healthy: ['정상', GOOD], warning: ['주의', WARN], danger: ['위험', BAD], critical: ['CRITICAL', BAD] };
  const lagCol = (v, th) => (v >= (th || 1000) ? BAD : v >= (th || 1000) / 2 ? WARN : GOOD);
  // 지금 beat 의 latest / committed / lag (앞 beat 에서 이어진다)
  function vals(c) { const b = c.beat, p = c.prev || {};
    return { L: tween(p.topicLatest, b.topicLatest, c.u), Cm: tween(p.consumerOffset, b.consumerOffset, c.u), lag: tween(p.lag, b.lag, c.u) }; }

  // 파티션 로그를 칸으로: 커밋까지(처리됨) · 커밋~latest(Lag) · 그 뒤(아직 없음)
  function offsetLog(x, y, w, lo, hi, cm, lt, o) { o = o || {}; const n = o.n || 32, cw = w / n, X = (v) => x + clamp((v - lo) / (hi - lo)) * w;
    for (let i = 0; i < n; i++) { const a = lo + (i / n) * (hi - lo), b2 = lo + ((i + 1) / n) * (hi - lo);
      const st = b2 <= cm ? 'done' : a >= lt ? 'none' : 'lag';
      el('rect', { x: x + i * cw + 1, y, width: cw - 2, height: 34, rx: 3, fill: st === 'done' ? OFF : st === 'lag' ? (o.hot ? BAD : ACC) : 'none', opacity: st === 'lag' ? 0.75 : st === 'done' ? 0.55 : 1, stroke: st === 'none' ? GRID : 'none', 'stroke-dasharray': '3 3' }); }
    const xc = X(cm), xl = X(lt);
    el('line', { x1: xl, y1: y - 30, x2: xl, y2: y + 40, stroke: INK, 'stroke-width': 2.5 });
    mono(xl, y - 36, 'latest ' + fmt(lt), { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': xl > x + w - 80 ? 'end' : 'middle' });
    el('line', { x1: xc, y1: y - 6, x2: xc, y2: y + 62, stroke: INFO, 'stroke-width': 2.5 });
    mono(xc, y + 80, 'committed ' + fmt(cm), { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': xc < x + 90 ? 'start' : 'middle' });
    return { X }; }
  // lagHistory 꺾은선 + 임계선
  function spark(x, y, w, h, hist, th, u, o) { o = o || {}; const mx = Math.max(th * 1.25, ...hist) * 1.05;
    const ax = axes(x, y, w, h, { x: [0, hist.length - 1], y: [0, mx], yt: o.yt || [0, th], yl: o.yl || 'Lag' });
    el('line', { x1: x, y1: ax.Y(th), x2: x + w, y2: ax.Y(th), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '6 5' });
    tx(x + w + 6, ax.Y(th) + 5, '임계 ' + fmt(th), { 'font-size': 13.5, 'font-weight': 700, fill: BAD });
    line(ax, hist.map((v, i) => [i, v]), u, hist[hist.length - 1] >= th ? BAD : ACC);
    return ax; }

  // 1. Lag = latest − committed
  function s1(t, c) { const { k, u } = c, b = c.beat, v = k === 5 ? { L: b.topicLatest, Cm: b.consumerOffset, lag: b.lag } : vals(c);
    tx(40, 40, b.group + ' · ' + b.topic + ' · partition ' + b.partition, { 'font-size': 15, 'font-weight': 700, fill: MUT });
    if (k === 4) {   // 표: 09:00 ~ 09:03
      const rows = [['09:00', 10000, 9985], ['09:01', 11000, 10800], ['09:02', 12000, 10900], ['09:03', 13000, 10950]];
      ['시간', 'latest', 'committed', 'Lag'].forEach((h, i) => tx([60, 170, 300, 440][i], 92, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
      rows.forEach(([tm, a, cm], i) => { const y = 132 + i * 62, s = pop(u, 0.2 + i * 0.4), lg = a - cm;
        mono(60, y, tm, { 'font-size': 15, opacity: clamp(s) }); mono(170, y, fmt(a), { 'font-size': 15, opacity: clamp(s) }); mono(300, y, fmt(cm), { 'font-size': 15, fill: INFO, opacity: clamp(s) });
        hbar(440, y - 15, 380, lg, 2050, { u: E(u, 0.3 + i * 0.4, 1.0 + i * 0.4), col: lagCol(lg, b.threshold), text: fmt(lg) }); });
      el('line', { x1: 440 + 380 * 1000 / 2050, y1: 100, x2: 440 + 380 * 1000 / 2050, y2: 330, stroke: BAD, 'stroke-dasharray': '5 4', 'stroke-width': 1.6 });
      sub(440 + 380 * 1000 / 2050, 352, '임계 1,000', 1, { fill: BAD, 'font-weight': 700 });
      tx(480, 398, '3분 사이 latest는 +3,000, committed는 +965', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2) }); return; }
    const lo = 9900, hi = 10800;
    offsetLog(60, 110, 840, lo, hi, v.Cm, v.L, { hot: b.lag >= b.threshold });
    // 공식
    const fy = 262, col = lagCol(v.lag, b.threshold);
    spans(140, fy, [['Lag = ', { 'font-weight': 700 }], [fmt(v.L), { 'font-weight': 800 }], [' − ', {}], [fmt(v.Cm), { fill: INFO, 'font-weight': 800 }], [' = ', {}], [fmt(v.lag), { fill: col, 'font-weight': 800 }]], { 'font-size': 24, opacity: k === 0 ? fade(u, 0.3) : 1 });
    if (k === 1) sub(480, fy + 34, 'Producer가 쌓으면 latest만 오른다', fade(u, 0.8), { 'font-weight': 700 });
    if (k === 2) sub(480, fy + 34, 'Consumer가 처리·커밋하면 committed가 따라간다', fade(u, 0.8), { 'font-weight': 700, fill: INFO });
    if (k === 3) { const [n, cl] = ST[b.status]; pill(810, fy - 8, n, cl, pop(u, 1.2), { fs: 15 });
      spark(590, 300, 260, 90, b.lagHistory, b.threshold, E(u, 0.2, 1.6), { yt: [0, 1000] }); sub(300, fy + 34, '값보다 계속 커지는가가 신호다', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); }
    if (k === 5) ['Consumer 성능 저하', 'Consumer 다운', '무한 루프'].forEach((s, i) => pill(220 + i * 260, 350, s + ' 를 먼저 잡는다', INK, pop(u, 0.4 + i * 0.35), { fs: 14 }));
    if (k === 0) sub(480, fy + 34, '두 값이 같으면 0, 완전 실시간', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 }); }
  const spans = R.spans;

  // 2. CLI: kafka-consumer-groups.sh --describe
  function s2(t, c) { const { k, u } = c, b = c.beat, v = vals(c);
    const L = [['$ BROKER="kafka-1.internal:9092"'], ['$ GROUP="order-processor"']];
    if (k >= 1) L.push(['$ kafka-consumer-groups.sh --list'], ['order-processor'], ['payment-processor'], ['notification-sender']);
    if (k >= 2) L.push(['$ kafka-consumer-groups.sh --group $GROUP --describe']);
    if (k >= 3) L.push(['TOPIC  PART  CURRENT  LOG-END   LAG', 'var(--off)'], ['orders 0     11200    12000   800'], ['orders 1     11195    12010   815', 'var(--warn)'], ['orders 2     11210    11995   785']);
    if (k >= 4) L.push(['$ … --describe | awk "NR>1 {sum+=$6} …"'], ['2400']);
    if (k >= 5) L.push(['$ [ "$TOTAL_LAG" -gt 1000 ] && echo 경고'], ['order-processor 전체 Lag = 2400 > 1000', 'var(--warn)']);
    const before = [0, 2, 6, 7, 11, 13][k];
    terminal(30, 50, 560, 340, L.map((x) => (x[1] ? [x[0], x[1]] : x[0])), before + Math.min(L.length - before, E(u, 0.2, 1.8) * (L.length - before)), { title: 'bash', fs: 13.5 });
    // 오른쪽: 지금 보고 있는 파티션의 Lag
    const [n, cl] = ST[b.status];
    tx(620, 70, 'partition ' + b.partition + ' 의 Lag', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    mono(620, 112, fmt(v.lag), { 'font-size': 34, 'font-weight': 800, fill: cl }); pill(880, 98, n, cl, 1, { fs: 13.5 });
    if (k >= 3) { [['p0', 800], ['p1', 815], ['p2', 785]].forEach(([p, lg], i) => { const y = 160 + i * 44;
        mono(620, y + 14, p, { 'font-size': 15, 'font-weight': 700 }); hbar(656, y, 210, lg, 1000, { u: k === 3 ? E(u, 0.8 + i * 0.25, 1.6 + i * 0.25) : 1, col: i === 1 ? WARN : ACC, text: String(lg) }); }); }
    if (k >= 4) { el('line', { x1: 620, y1: 296, x2: 920, y2: 296, stroke: GRID, 'stroke-width': 1.5 });
      mono(620, 324, '합계', { 'font-size': 15, 'font-weight': 700 }); mono(920, 324, k === 4 ? fmt(tween(0, 2400, seg(u, 0.6, 1.4), 0.6)) : '2,400', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'end', fill: BAD }); }
    if (k === 5) { person(660, 370, null, { s: 0.7 }); clock(720, 372, 16, E(u, 0.5, 2.5), WARN);
      tx(748, 378, '사람이 매번 친다, 추세는 없다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1) }); } }

  // 3. kafka-exporter → Prometheus
  function s3(t, c) { const { k, u } = c, b = c.beat, v = vals(c);
    const nodes = [['Kafka 브로커', 90, 0], ['kafka-exporter', 300, 2], ['Prometheus', 520, 0], ['Alertmanager', 740, 1]];
    nodes.forEach(([n, x, from]) => { const s = k === from ? pop(u, 0.3) : k > from ? 1 : 0; if (s <= 0) return;
      if (n === 'Kafka 브로커') server(x, 96, n, { s: 0.85 * s });
      else { card(x, 96, 170, 56, { rx: 10, stroke: n === 'Prometheus' ? ACC : INK, sw: 2.3, s, text: n, fs: 15 });
        mono(x, 140, { 'kafka-exporter': ':9308', Prometheus: ':9090', Alertmanager: ':9093' }[n], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: clamp(s) }); } });
    if (k >= 2) { grow(435, 96, 385, 96, k === 2 ? seg(u, 0.6, 1.0) : 1, ACC); grow(215, 96, 150, 96, k === 2 ? seg(u, 1.0, 1.4) : 1, MUT);
      sub(410, 54, 'scrape 15s', 1, { fill: ACC, 'font-weight': 700 }); sub(180, 54, 'Lag 조회', 1); }
    if (k >= 1) { grow(605, 96, 655, 96, k === 1 ? seg(u, 0.6, 1.0) : 1, MUT); sub(630, 54, '알람', k === 1 ? fade(u, 0.8) : 1); }
    if (k >= 0) { const pulse = (t * 1.6) % 1; el('circle', { cx: 520, cy: 96, r: 30 + pulse * 30, fill: 'none', stroke: ACC, 'stroke-width': 1.5, opacity: (1 - pulse) * 0.6 }); }
    // 아래: 15초마다 찍히는 시계열
    const ax = spark(90, 220, 430, 150, b.lagHistory, b.threshold, E(u, 0.2, 1.8), { yt: [0, 1000], yl: 'Lag (15초마다 한 점)' });
    b.lagHistory.forEach((y, i) => { if (i / 9 <= E(u, 0.2, 1.8) + 0.001) el('circle', { cx: ax.X(i), cy: ax.Y(y), r: 3.5, fill: y >= b.threshold ? BAD : ACC }); });
    mono(600, 226, '지금 ' + fmt(v.lag), { 'font-size': 20, 'font-weight': 800, fill: lagCol(v.lag, b.threshold) });
    if (k === 0) sub(720, 290, '하루 86,400초 ÷ 15 = 5,760점', fade(u, 1.2), { 'font-weight': 700 });
    if (k === 1) sub(720, 290, '규칙 파일은 15초마다 평가', fade(u, 1.2), { 'font-weight': 700 });
    if (k === 3) ['kafka_consumergroup_lag', 'kafka_consumergroup_current_offset', 'kafka_topic_partition_current_offset'].forEach((m, i) => {
      mono(560, 280 + i * 30, m, { 'font-size': 14, 'font-weight': 700, fill: i === 0 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.3) }); });
    if (k === 3) sub(740, 380, '라벨: consumergroup · topic · partition', fade(u, 1.4), { 'font-weight': 700 });
    if (k === 4) [['sum by (consumergroup)', '총 Lag'], ['topk(10, …)', '상위 파티션'], ['deriv(…[5m])', '초당 증가 속도'], ['rate(consumer offset)', '처리량 out'], ['rate(topic offset)', '입력량 in']].forEach(([q, d], i) => {
      mono(560, 274 + i * 26, q, { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.25) }); tx(940, 274 + i * 26, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.2 + i * 0.25) }); });
    if (k === 5) { card(740, 320, 200, 56, { rx: 10, stroke: OFF, sw: 2, dash: '6 4', text: 'Grafana :3000', fs: 15, color: MUT, s: pop(u, 0.6) });
      sub(740, 372, '숫자만으로는 한눈에 안 보인다', fade(u, 1), { fill: WARN, 'font-weight': 700 }); } }

  // 4. Grafana 대시보드 4패널
  function s4(t, c) { const { k, u } = c, b = c.beat, v = vals(c);
    const fr = k === 0 ? E(u, 0.1, 0.8) : 1;
    zone(20, 20, 920, 390, '', { fill: PANEL, stroke: GRID, sw: 1.5, op: fr });
    tx(36, 46, 'Kafka Consumer Lag — order-processor', { 'font-size': 15, 'font-weight': 800, opacity: fr });
    mono(924, 46, '⟳ 30s · now-1h', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fr });
    const P = [[36, 62, 240, 150], [292, 62, 632, 150], [36, 228, 440, 170], [492, 228, 432, 170]];
    const names = ['총 Lag (Stat)', 'Lag 시간 추이 (1시간)', 'Partition별 Lag', 'Producer 입력 vs Consumer 처리'];
    P.forEach(([x, y, w, h], i) => { el('rect', { x, y, width: w, height: h, rx: 8, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: fr }); });
    const show = [1, 3, 5, 6], on = (i) => k >= show[i], first = (i) => k === show[i];
    // 패널 1: 큰 숫자 + 색 단계
    if (on(0)) { const [x, y] = P[0], lv = v.lag, col = lv >= 5000 ? BAD : lv >= 1000 ? WARN : lv >= 500 ? C.HL : GOOD, s = first(0) ? pop(u, 0.3) : 1;
      tx(x + 12, y + 22, names[0], { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: clamp(s) });
      mono(x + 120, y + 84, fmt(lv), { 'font-size': 40, 'font-weight': 800, 'text-anchor': 'middle', fill: k >= 2 ? (lv >= 1000 ? WARN : col) : INK, opacity: clamp(s) });
      if (k >= 2) { const steps = [[0, GOOD, '0'], [500, C.HL, '500'], [1000, WARN, '1000'], [5000, BAD, '5000']], sx = x + 12, sw = 216, bk = [0, 500, 1000, 5000, 8000],
          Xs = (q) => { q = Math.min(q, 8000); let j = 0; while (j < 3 && q >= bk[j + 1]) j++; return sx + (j + (q - bk[j]) / (bk[j + 1] - bk[j])) * sw / 4; };
        steps.forEach(([q, cl, lab], j) => { const nx = j < 3 ? steps[j + 1][0] : 8000, sc = k === 2 ? E(u, 0.2 + j * 0.3, 0.5 + j * 0.3) : 1;
          el('rect', { x: Xs(q), y: y + 108, width: (Xs(nx) - Xs(q)) * sc, height: 10, fill: cl }); mono(Xs(q), y + 136, lab, { 'font-size': 13.5, fill: MUT, opacity: sc }); });
        el('path', { d: `M${Xs(lv)},${y + 104} l-6,-9 h12 z`, fill: INK }); } }
    // 패널 2: 추이 + 알람 조건
    if (on(1)) { const [x, y, w] = P[1]; tx(x + 12, y + 22, names[1], { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const hist = b.lagHistory, mx = Math.max(...hist, 1000) * 1.1, ax = axes(x + 60, y + 36, w - 90, 90, { x: [0, hist.length - 1], y: [0, mx], yt: [0, 1000] });
      line(ax, hist.map((q, i) => [i, q]), first(1) ? E(u, 0.2, 1.6) : 1, hist[9] >= 1000 ? BAD : ACC);
      if (k >= 4) { el('line', { x1: x + 60, y1: ax.Y(1000), x2: x + w - 30, y2: ax.Y(1000), stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: k === 4 ? fade(u, 0.2) : 1 });
        const s = k === 4 ? E(u, 0.6, 1.6) : 1; el('rect', { x: x + w - 30 - 170 * s, y: y + 34, width: 170 * s, height: 96, fill: BADBG, opacity: 0.6 });
        mono(x + w - 40, y + 52, 'avg > 1000, for 5m', { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: k === 4 ? fade(u, 1.4) : 1 }); } }
    // 패널 3: 파티션 히트맵 (describe 출력 예의 값)
    if (on(2)) { const [x, y] = P[2]; tx(x + 12, y + 22, names[2] + ' · describe 출력 예', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      [['p0', 800], ['p1', 815], ['p2', 785]].forEach(([p, lg], i) => { const s = first(2) ? pop(u, 0.3 + i * 0.3) : 1;
        card(x + 80 + i * 130, y + 96, 116, 70, { rx: 6, stroke: 'none', fill: WARN, s, op: 0.35 + 0.6 * (lg - 700) / 120 });
        mono(x + 80 + i * 130, y + 90, p, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(s) });
        mono(x + 80 + i * 130, y + 112, String(lg), { 'font-size': 14, 'text-anchor': 'middle', opacity: clamp(s) }); });
      sub(x + 220, y + 158, '셋이 고르게 밀림 → 쏠림이 아니라 처리 부족', first(2) ? fade(u, 1.4) : 1, { 'font-weight': 700 }); }
    // 패널 4: 입력 vs 처리 (모양 예시)
    if (on(3)) { const [x, y, w] = P[3]; tx(x + 12, y + 22, names[3], { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const ax = axes(x + 40, y + 40, w - 70, 100, { x: [0, 9], y: [0, 10] }), uu = E(u, 0.2, 1.6);
      line(ax, [[0, 7], [3, 7.5], [6, 7.2], [9, 7.6]], uu, BAD); line(ax, [[0, 6], [3, 5.4], [6, 5.6], [9, 5.2]], uu, ACC);
      mono(x + w - 36, y + 54, 'in', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      mono(x + w - 36, y + 104, 'out', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.4) });
      sub(x + w / 2, y + 162, '모양 예시 · in이 위에 있으면 Lag은 쌓인다', fade(u, 1.6), { 'font-weight': 700 }); }
    if (k === 0) tx(480, 230, '빈 대시보드: 패널 4개 자리', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1) }); }

  // 5. 알람 규칙 → Alertmanager → Slack
  function s5(t, c) { const { k, u } = c, b = c.beat, v = vals(c);
    zone(30, 36, 490, 360, 'kafka-consumer-lag · interval 30s', { fill: PANEL, stroke: GRID, sw: 1.5 });
    // 오른쪽: Lag 게이지
    const gx = 560, gy = 60, gh = 320, max = 6000, Y = (q) => gy + gh - (Math.min(q, max) / max) * gh;
    el('rect', { x: gx, y: gy, width: 46, height: gh, rx: 8, fill: SOFT, stroke: GRID });
    el('rect', { x: gx, y: Y(v.lag), width: 46, height: gy + gh - Y(v.lag), rx: 8, fill: v.lag >= 5000 ? BAD : v.lag >= 1000 ? WARN : ACC });
    [[1000, WARN, 'warning'], [5000, BAD, 'critical']].forEach(([q, cl, n]) => { if (k < (q === 1000 ? 1 : 3)) return;
      el('line', { x1: gx - 8, y1: Y(q), x2: gx + 56, y2: Y(q), stroke: cl, 'stroke-width': 2.2 }); mono(gx - 12, Y(q) + 5, fmt(q), { 'font-size': 13.5, fill: cl, 'text-anchor': 'end', 'font-weight': 700 }); });
    mono(gx + 23, gy - 10, fmt(v.lag), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: v.lag >= 5000 ? BAD : WARN });
    // 왼쪽: 규칙 카드
    const rules = [['KafkaConsumerLagWarning', 'Lag > 1000 · for 5m', WARN, 1], ['KafkaConsumerLagCritical', 'Lag > 5000 · for 5m · page', BAD, 3], ['KafkaConsumerLagSpike', 'deriv × 60 > 50 · for 10m', INFO, 4]];
    rules.forEach(([n, cond, cl, from], i) => { if (k < from) return; const s = k === from ? pop(u, 0.3) : 1, y = 104 + i * 74;
      card(275, y, 460, 60, { rx: 8, stroke: cl, sw: 2, s }); mono(60, y - 4, n, { 'font-size': 14.5, 'font-weight': 800, fill: cl, opacity: clamp(s) });
      mono(60, y + 18, cond, { 'font-size': 13.5, opacity: clamp(s) });
      const fire = (i === 0 && b.lag > 1000) || (i === 1 && b.lag >= 5000) || (i === 2 && k >= 4);
      el('circle', { cx: 486, cy: y, r: 8, fill: fire ? cl : GRID, opacity: clamp(s) }); });
    if (k === 0) tx(275, 150, '규칙이 비어 있으면 알림은 오지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
    if (k === 2) ['severity: warning', 'team: data-platform', 'runbook_url'].forEach((s, i) => pill(110 + i * 150, 160, s, MUT, pop(u, 0.3 + i * 0.3), { mono: true, fs: 13.5 }));
    if (k === 4) { sub(275, 330, '분당 50 이상 늘면 1000 전에 미리 알린다', fade(u, 1), { fill: INFO, 'font-weight': 700 }); }
    if (k >= 5) { const y = 330; zone(50, y - 26, 450, 70, '', { fill: SOFT });
      mono(66, y, 'group_by: alertname, consumergroup', { 'font-size': 13.5, opacity: k === 5 ? fade(u, 0.2) : 1 });
      mono(66, y + 26, 'group_wait 30s · repeat_interval 4h', { 'font-size': 13.5, 'font-weight': 700, opacity: k === 5 ? fade(u, 0.5) : 1 }); }
    // Slack
    if (k === 6 && b.slack) { const s = pop(u, 0.6); card(790, 220, 280, 150, { rx: 10, stroke: BAD, sw: 2.2, s });
      mono(668, 170, 'Slack ' + b.slack.channel, { 'font-size': 14, 'font-weight': 800, opacity: clamp(s) });
      pill(880, 166, b.slack.severity, BAD, s, { mono: true, fs: 13 });
      const msg = b.slack.message.replace(/^\S+\s/, ''), parts = [msg.slice(0, msg.indexOf('Lag')), msg.slice(msg.indexOf('Lag'), msg.indexOf('(')), msg.slice(msg.indexOf('('))];
      parts.forEach((p, i) => tx(668, 204 + i * 26, p.trim(), { 'font-size': 13.5, 'font-weight': i === 1 ? 800 : 600, fill: i === 1 ? BAD : INK, opacity: fade(u, 0.9 + i * 0.2) }));
      dot([[606, 220], [650, 220]], seg(u, 0.1, 0.6), BAD, 6); }
    if (k === 5) sub(790, 240, '같은 알람은 4시간에 한 번만 다시', fade(u, 1), { 'font-weight': 700 }); }

  const quiz = [
    { q: 'latest가 10,000이고 committed가 9,985일 때 Lag은 무엇인가?',
      o: ['15', '9,985', '19,985'], a: 0,
      why: 'Lag은 latest에서 committed를 뺀 값이다. 10,000 − 9,985 = 15건이 아직 처리되지 않았다.' },
    { q: 'describe 출력에서 p0 800, p1 815, p2 785가 나왔다. awk로 LAG 칼럼을 더하면 무엇이 나오나?',
      o: ['815', '800', '2,400'], a: 2,
      why: '6번째 칼럼 LAG를 모두 더하면 800 + 815 + 785 = 2,400이다. 그룹 전체가 그만큼 밀려 있다.' },
    { q: 'kafka-exporter를 Prometheus가 15초마다 scrape하면 CLI보다 무엇이 나아지는가?',
      o: ['Lag 값이 더 정확해진다', '지난 값이 시계열로 쌓여 추세와 증가 속도를 볼 수 있다', 'Consumer 처리 속도가 빨라진다'], a: 1,
      why: '15초 간격이면 하루 5,760점이 남는다. deriv나 rate로 얼마나 빨리 늘고 있는지 계산할 수 있다.' },
    { q: 'Grafana 알람 조건에 for 5m을 붙이는 이유는 무엇인가?',
      o: ['대시보드를 5분마다 새로 고치려고', '순간적으로 튄 값에 알람이 울리지 않게 하려고', 'Lag을 5분 평균으로 줄여 보이게 하려고'], a: 1,
      why: '5분 동안 계속 1,000을 넘을 때만 울린다. 잠깐 튀는 false positive를 거른다.' },
    { q: 'deriv(kafka_consumergroup_lag[5m])는 무엇의 단위로 값을 돌려주는가?',
      o: ['분당 증가량', '5분 동안의 총 증가량', '초당 증가량'], a: 2,
      why: 'PromQL deriv는 초당 변화율이다. 그래서 분당 50을 보려고 60을 곱해 > 50과 비교한다.' },
  ];

  const summary = [
    'Lag은 latest offset에서 committed offset을 뺀 값이고, 계속 커지면 Consumer가 못 따라간다는 뜻이다.',
    'kafka-consumer-groups.sh --describe로 파티션별 Lag을 바로 보지만 사람이 매번 쳐야 한다.',
    'exporter와 Prometheus로 15초마다 모으면 추세와 증가 속도를 볼 수 있다.',
    'Lag이 1,000을 5분 넘게 넘으면 warning, 5,000을 넘으면 critical로 Slack에 알린다.',
  ];
  const review = [
    { q: '대시보드 heatmap에서 p1 하나만 빨갛고 나머지 파티션은 0에 가깝다. 먼저 의심할 것은?',
      o: ['Consumer 전체 수가 부족하다', '특정 키가 p1에 몰리는 데이터 쏠림', 'Prometheus scrape 주기가 길다'], a: 1,
      why: '전체가 고르게 밀리면 처리량 부족이고, 한 파티션만 튀면 키 쏠림일 가능성이 높다.' },
    { q: '총 Lag이 900에서 멈춰 있는데 Producer 입력 rate가 Consumer 처리 rate보다 계속 위에 있다. 어떻게 될까?',
      o: ['Lag은 900에서 그대로 머문다', 'Lag은 계속 쌓여 결국 warning 임계 1,000을 넘는다', 'Lag은 저절로 0이 된다'], a: 1,
      why: '들어오는 양이 처리하는 양보다 많으면 차이만큼 Lag이 계속 늘어난다.' },
    { q: 'Lag 경고가 밤새 30초마다 Slack에 쏟아졌다. 먼저 손볼 설정은?',
      o: ['Alertmanager의 repeat_interval', 'kafka-exporter의 포트', 'Grafana refresh 주기'], a: 0,
      why: 'repeat_interval 4h를 두면 같은 알람은 4시간에 한 번만 다시 보낸다. group_wait 30s로 묶어서 보낸다.' },
  ];

  R.page({ title: 'Consumer Lag 모니터링', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
