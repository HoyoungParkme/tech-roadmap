/* I-1-1 동기 호출의 한계 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 서비스 상태·지연(ms)·합계·도미노 로그·큐 메시지는 STEPS 의 services · totalLatency · dominoLog · queueBox · resilienceBox 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, person, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const NAMES = ['Order', 'Payment', 'Stock', 'Shipping'];
  const ST = { pending: GRID, ok: GOOD, slow: WARN, fail: BAD, queued: INFO };
  const ms = (v) => Math.round(v).toLocaleString('en-US') + ' ms';
  // 선이 자라는 곡선 (u 0→1)
  function curve(d, u, col, o) { o = o || {}; if (u <= 0) return; const p = el('path', { d, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 100, opacity: o.op ?? 1 });
    p.setAttribute('stroke-dasharray', u >= 1 ? (o.dash || 'none') : `${u * 100} 100`); }
  // 서비스 카드: 이름 + 아래 작은 글
  function svcCard(x, y, name, small, o) { o = o || {};
    card(x, y, o.w || 150, o.h || 60, { rx: 10, stroke: o.stroke || INK, sw: 2.2, fill: o.fill || PANEL, s: o.s, op: o.op });
    if ((o.s ?? 1) > 0.3) { tx(x, small ? y - 4 : y + 6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.color || INK, opacity: o.op ?? 1 });
      if (small) mono(x, y + 17, small, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); } }
  // 카프카 로그 칸 한 줄: offsets 배열, o.mark(i) → {fill, stroke, color}
  function logRow(x, y, offs, o) { o = o || {}; const w = o.w || 70, h = o.h || 40, g = 4;
    offs.forEach((off, i) => { const st = (o.mark && o.mark(i, off)) || {}, s = o.s ? o.s(i) : 1; if (s <= 0) return;
      card(x + i * (w + g) + w / 2, y, w, h, { rx: 5, stroke: st.stroke || INK, fill: st.fill || PANEL, sw: 2, s, text: st.text, fs: 13.5, mono: true, color: st.color });
      mono(x + i * (w + g) + w / 2, y + h / 2 + 18, String(off), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: Math.min(1, s) }); });
    return (i) => x + i * (w + g) + w / 2; }

  // ================= 1. 동기 REST 체인 =================
  const X1 = [200, 400, 600, 800], Y1 = 168, WX = 150, WS = 2.4;   // 폭포 그림: x0=150, 1ms = 2.4px
  const HOST = ['', 'payment-svc:8001', 'stock-svc:8002', 'shipping-svc:8003'];
  function waterfall(c, y) { const sv = c.beat.services, pv = (c.prev && c.prev.services) || sv; let t0 = 0;
    el('line', { x1: WX, y1: y + 22, x2: WX + 300 * WS, y2: y + 22, stroke: MUT, 'stroke-width': 1.6 });
    [0, 100, 200, 300].forEach((v) => { el('line', { x1: WX + v * WS, y1: y + 22, x2: WX + v * WS, y2: y + 27, stroke: MUT }); mono(WX + v * WS, y + 44, v + ' ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    tx(WX - 12, y + 5, '응답 시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 });
    sv.forEach((s, i) => { if (!s.latencyMs) return; const fresh = !pv[i].latencyMs, g = fresh ? E(c.u, 0.7, 1.7) : 1, w = s.latencyMs * WS * g;
      el('rect', { x: WX + t0 * WS, y: y - 12, width: Math.max(1, w - 2), height: 28, rx: 4, fill: [MUT, ACC, INFO, WARN][i], opacity: 0.85 });
      if (g > 0.95) { mono(WX + t0 * WS + w / 2 - 1, y + 7, String(s.latencyMs), { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' });
        tx(WX + t0 * WS + w / 2, y - 20, NAMES[i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 }); }
      t0 += s.latencyMs; });
    const tot = tween(c.prev ? c.prev.totalLatency : 0, c.beat.totalLatency, c.u, 1.6);
    mono(905, y + 7, ms(tot), { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: INK }); }
  function s1(t, c) { const { k, u } = c, sv = c.beat.services;
    // 위: 서비스 4개. Order 가 다른 세 곳의 주소를 쥐고 있다
    X1.forEach((x, i) => { const on = i === 0 || sv[i].status !== 'pending' || k === 0;
      svcCard(x, Y1, NAMES[i], i === 0 ? '주문 수신' : sv[i].role, { stroke: i === 0 ? INK : sv[i].status === 'pending' ? OFF : ST[sv[i].status], s: k === 0 ? pop(u, 0.1 + i * 0.12) : 1, op: on ? 1 : 0.55 }); });
    HOST.forEach((h, i) => { if (!i) return; const x = X1[i], gu = k === 0 ? seg(u, 0.6 + i * 0.35, 1.3 + i * 0.35) : 1;
      curve(`M${X1[0] + 40},${Y1 - 30} Q${(X1[0] + x) / 2},${18 + i * 6} ${x},${Y1 - 72}`, gu, k === 0 ? ACC : GRID, { sw: k === 0 ? 2.4 : 1.6 });
      if (gu >= 1) pill(x, Y1 - 58, h, k === 0 ? ACC : MUT, 1, { mono: true, fs: 13.5, fill: PANEL }); });
    // 사용자 → Order
    person(55, Y1, k >= 1 ? '사용자' : null, { s: 0.8, op: k >= 1 ? 1 : 0 });
    if (k === 1) { dot([[80, Y1], [X1[0] - 76, Y1]], seg(u, 0.2, 0.8), ACC, 7); pill(X1[0], Y1 + 62, 'timeout=5.0s', WARN, pop(u, 1.0), { mono: true, fs: 13.5 }); }
    // 지금 부르는 서비스로 점이 간다, Order 워커는 그동안 기다린다
    const hop = k >= 2 && k <= 4 ? k - 1 : 0;
    if (hop) { dot([[X1[0] + 76, Y1 + 8], [X1[hop] - 76, Y1 + 8]], seg(u, 0.1, 0.7), ACC, 7);
      card(X1[0], Y1 + 62, 132, 30, { rx: 8, stroke: WARN, fill: WARNBG, sw: 1.8, text: '워커 응답 대기', fs: 13.5, color: WARN, s: pop(u, 0.3) }); }
    if (k === 2) sub(X1[1], Y1 + 52, '200 아니면 502', fade(u, 1.6), { fill: BAD, 'font-weight': 700 });
    if (k >= 3) pill(X1[1], Y1 + 52, '₩ 결제됨', GOOD, k === 3 ? pop(u, 0.4) : 1, { fs: 13.5 });
    if (k === 3) sub(X1[2], Y1 + 60, '여기서 죽으면 환불은?', fade(u, 1.7), { fill: BAD, 'font-weight': 700 });
    if (k >= 4) pill(X1[2], Y1 + 52, '재고 −1', GOOD, k === 4 ? pop(u, 0.4) : 1, { fs: 13.5 });
    if (k === 4) sub(X1[3], Y1 + 60, '실패하면 두 곳을 되돌린다', fade(u, 1.7), { fill: BAD, 'font-weight': 700 });
    if (k === 5) { dot([[X1[3] - 76, Y1 + 8], [X1[0] + 76, Y1 + 8], [80, Y1 + 8]], seg(u, 0.1, 0.9), INK, 7);
      pill(X1[0], Y1 + 62, '200 {"status": "ok"}', GOOD, pop(u, 0.8), { mono: true, fs: 13.5 });
      ['한 곳 죽으면 5xx', '지연은 4곳의 합', '하나 느리면 전부', '결제·재고 정합성', '폭증 시 함께 다운'].forEach((s, i) => {
        const x = 104 + i * 188; pill(x, 398, (i + 1) + ' ' + s, BAD, pop(u, 1.2 + i * 0.22), { fs: 13.5, fill: BADBG }); }); }
    waterfall(c, 300); }

  // ================= 2. 응답 시간이 쌓인다 =================
  const BX = 150, BW = 680;
  function s2(t, c) { const { k, u } = c, sv = c.beat.services, pv = (c.prev && c.prev.services) || sv;
    const tot = c.beat.totalLatency, ptot = c.prev ? c.prev.totalLatency : tot;
    const max = tween(Math.max(ptot, 300) * 1.08, Math.max(tot, 300) * 1.08, u, 1.4), S = (v) => (v / max) * BW, y = 120;
    const step = max > 2000 ? 500 : max > 900 ? 250 : 50;
    tx(BX, 54, c.beat.chainMode === 'async' ? '사용자가 기다리는 시간 (큐였다면)' : k === 2 ? '각 서비스 p99를 더하면' : '사용자가 기다리는 시간 = 4곳의 합', { 'font-size': 16, 'font-weight': 800 });
    el('line', { x1: BX, y1: y + 34, x2: BX + BW, y2: y + 34, stroke: MUT, 'stroke-width': 1.6 });
    for (let v = 0; v <= max; v += step) { el('line', { x1: BX + S(v), y1: y + 34, x2: BX + S(v), y2: y + 39, stroke: MUT }); mono(BX + S(v), y + 56, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    mono(BX + BW, y + 76, 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    let x = 0; const async = c.beat.chainMode === 'async';
    sv.forEach((s, i) => { const lat = async && i > 0 ? 0 : tween(pv[i].latencyMs, s.latencyMs, u, 1.4), g = k === 0 ? E(u, 0.2 + i * 0.45, 0.6 + i * 0.45) : 1, w = S(lat) * g;
      const col = s.status === 'slow' ? BAD : [MUT, ACC, INFO, WARN][i];
      if (w > 1) el('rect', { x: BX + x, y: y - 14, width: Math.max(1, w - 2), height: 36, rx: 4, fill: col, opacity: 0.88 });
      if (w > 34) mono(BX + x + w / 2, y + 9, String(Math.round(lat)), { 'font-size': 14, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' });
      if (w > 56) tx(BX + x + w / 2, y - 22, NAMES[i], { 'font-size': 13.5, 'font-weight': 700, fill: s.status === 'slow' ? BAD : MUT, 'text-anchor': 'middle' });
      x += w; });
    mono(BX + x + 10, y + 10, ms(tween(ptot, tot, u, 1.4)), { 'font-size': 20, 'font-weight': 800, fill: tot >= 900 ? BAD : INK, opacity: k === 0 ? fade(u, 1.9) : 1 });
    if (k === 1) { pill(480, 250, 'Payment 하나만 120 → 820 ms', BAD, pop(u, 1.4), { fs: 14 });
      ['Order', 'Stock', 'Shipping'].forEach((n, i) => { check(330 + i * 140, 312, 9, pop(u, 1.8 + i * 0.15)); tx(346 + i * 140, 317, n + ' 정상', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8 + i * 0.15) }); });
      mono(480, 370, '990 ÷ 290 ≈ 3.4배', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.2) }); }
    if (k === 2) { tx(480, 236, '네 곳이 한꺼번에 느릴 때의 위쪽 어림값', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) });
      NAMES.forEach((n, i) => { const cx = 210 + i * 120, cy = 310, s = pop(u, 1.5 + i * 0.15);
        el('circle', { cx, cy, r: 26 * s, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
        if (s > 0.5) { el('path', { d: `M${cx},${cy} L${cx},${cy - 26} A26,26 0 0 1 ${cx + 26 * Math.sin(0.0628 * 4)},${cy - 26 * Math.cos(0.0628 * 4)} Z`, fill: BAD });
          tx(cx, cy + 46, n, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } });
      mono(700, 300, '1 − 0.99⁴', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(700, 326, '≈ 3.9%', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) });
      tx(700, 352, '한 곳이라도 꼬리에 걸린다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) }); }
    if (k === 3) { const px = BX + S(60), pw = S(2400);
      grow(px + pw / 2, y + 112, px + pw / 2, y + 30, seg(u, 1.2, 1.8), BAD);
      card(px + pw / 2, y + 140, 300, 50, { rx: 10, stroke: BAD, fill: BADBG, text: '가장 느린 한 곳이 상한을 정한다', fs: 15, color: BAD, s: pop(u, 1.6) });
      tx(480, 330, '체인이 길수록 최악값도 길어진다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k === 4) { // 나머지 셋은 사용자 화면 밖, 큐 뒤 줄로 내려간다
      const drop = E(u, 0.2, 1.4), y2 = lerp(y, 290, drop);
      tx(BX, 250, '큐 뒤에서 각자 처리 (사용자는 안 기다림)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0) });
      let x2 = 0; [120, 80, 60].forEach((v, i) => { const w = v * 2.0; el('rect', { x: BX + x2, y: y2 - 14, width: w - 2, height: 30, rx: 4, fill: [ACC, INFO, WARN][i], opacity: 0.35 + 0.2 * (1 - drop), 'stroke-dasharray': '4 3', stroke: [ACC, INFO, WARN][i] });
        tx(BX + x2 + w / 2, y2 + 6, NAMES[i + 1], { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); x2 += w + 12; });
      pill(480, 372, '2,780 → 30 ms', GOOD, pop(u, 1.8), { mono: true, fs: 15 }); } }

  // ================= 3. 도미노 =================
  const X3 = [140, 370, 600, 830], Y3 = 74;
  function pool(x, y, status, fillN, o) { o = o || {}; // 워커 풀 8칸
    for (let i = 0; i < 8; i++) { const on = i < fillN, col = status === 'fail' ? BAD : status === 'slow' ? WARN : GOOD;
      el('rect', { x: x - 64 + (i % 4) * 33, y: y + Math.floor(i / 4) * 30, width: 28, height: 25, rx: 4, fill: on ? col : PANEL, stroke: on ? 'none' : GRID, 'stroke-width': 1.5, opacity: on ? 0.85 : 1 }); } }
  function services3(c, o) { o = o || {}; const sv = c.beat.services, pv = (c.prev && c.prev.services) || sv, { k, u } = c;
    sv.forEach((s, i) => { const x = X3[i], ch = pv[i].status !== s.status;
      svcCard(x, Y3, NAMES[i], null, { w: 150, h: 46, stroke: ST[s.status], color: ST[s.status] === GRID ? INK : ST[s.status] });
      const n = s.status === 'ok' ? 2 : 8, n0 = pv[i].status === 'ok' ? 2 : 8, fillN = ch ? Math.round(lerp(n0, n, E(u, 0.3 + i * 0.3, 1.3 + i * 0.3))) : n;
      pool(x, Y3 + 36, s.status, fillN);
      const lat = tween(pv[i].latencyMs, s.latencyMs, u, 1.6);
      if (o.lat !== false) mono(x, Y3 + 120, ms(lat), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: s.status === 'ok' ? INK : ST[s.status] });
      if (s.status === 'fail') pill(x + 66, Y3 - 26, '503', BAD, 1, { mono: true, fs: 13.5, fill: BADBG }); });
    if (o.total !== false) { tx(40, Y3 + 156, '4곳 지연 합', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      mono(150, Y3 + 156, ms(tween(c.prev ? c.prev.totalLatency : c.beat.totalLatency, c.beat.totalLatency, u, 1.6)), { 'font-size': 17, 'font-weight': 800, fill: BAD }); } }
  function dlog(c, y) { const L = c.beat.dominoLog || [], pl = (c.prev && c.prev.dominoLog) || [], same = pl.length === L.length;
    L.forEach((s, i) => { const op = same || i < pl.length ? 1 : fade(c.u, 0.5 + (i - pl.length) * 0.45);
      const [tm, ...rest] = s.split('  ');
      mono(70, y + i * 27, tm, { 'font-size': 14, fill: MUT, opacity: op });
      tx(170, y + i * 27, rest.join(' '), { 'font-size': 14.5, fill: /다운|마비|거절|503/.test(s) ? BAD : INK, opacity: op, 'font-weight': 600 }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { services3(c); for (let i = 0; i < 14; i++) dot([[10, Y3], [X3[0] - 76, Y3]], (t * 0.9 + i / 14) % 1, BAD, 4.5);
      mono(18, Y3 - 30, '주문 ×10', { 'font-size': 14, 'font-weight': 800, fill: BAD });
      if (k === 0) X3.slice(0, 1).forEach(() => { for (let i = 0; i < 4; i++) curve(`M${X3[0] - 48 + i * 33},${Y3 + 49} Q${(X3[0] + X3[1]) / 2},${Y3 + 150} ${X3[1] - 30},${Y3 + 80}`, seg(u, 1.0 + i * 0.15, 1.6 + i * 0.15), WARN, { sw: 1.6, op: 0.8 }); });
      dlog(c, 278); return; }
    if (k === 2) { // 확대: Order 워커가 Payment 응답을 붙잡고 기다린다
      services3(c, { total: false, lat: false });
      for (let i = 0; i < 8; i++) { const sx = X3[0] - 50 + (i % 4) * 33, sy = Y3 + 49 + Math.floor(i / 4) * 30;
        curve(`M${sx},${sy} C${sx + 60},${300} ${X3[1] - 60},${300} ${X3[1] - 50 + (i % 4) * 33},${Y3 + 62 + Math.floor(i / 4) * 30}`, seg(u, 0.2 + i * 0.12, 0.9 + i * 0.12), WARN, { sw: 1.8, op: 0.75 }); }
      clock(250, 320, 26, E(u, 0.6, 2.6), WARN, '최대 5초');
      card(560, 320, 360, 64, { rx: 10, stroke: WARN, fill: WARNBG, text: 'Order 워커 8개가 전부\nPayment 응답을 기다리며 묶였다', fs: 15, s: pop(u, 1.4) }); return; }
    if (k === 3) { services3(c, { total: false });
      grow(X3[1] - 80, Y3 + 156, X3[0] + 80, Y3 + 156, seg(u, 0.2, 0.9), BAD); tx((X3[0] + X3[1]) / 2, Y3 + 182, '부하가 호출자 쪽으로 거꾸로', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8) });
      grow(X3[0] + 80, Y3 + 166, X3[2] - 80, Y3 + 166, seg(u, 0.6, 1.3), BAD, { dash: '6 5' });
      ['워커 묶임', '풀 포화', '신규 요청 거절', '옆 서비스로 전염'].forEach((s, i) => { const x = 130 + i * 233;
        card(x, 345, 190, 54, { rx: 10, stroke: BAD, fill: i === 3 ? BADBG : PANEL, text: s, fs: 15, color: i === 3 ? BAD : INK, s: pop(u, 1.0 + i * 0.35) });
        if (i < 3) grow(x + 98, 345, x + 135, 345, seg(u, 1.25 + i * 0.35, 1.5 + i * 0.35), BAD); }); return; }
    if (k === 4) { services3(c);
      const back = seg(u, 0.2, 0.9), rush = seg(u, 1.0, 2.3);
      pill(X3[1], Y3 + 170, '재시작', GOOD, pop(u, 0.2), { fs: 14 });
      for (let i = 0; i < 16; i++) dot([[X3[0] + 20, 300], [X3[1] - 40, Y3 + 60]], clamp(rush * 1.6 - i * 0.04), BAD, 5);
      if (rush > 0.1) tx(X3[0] + 10, 330, '밀린 요청이 한꺼번에 쏟아진다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
      ['Payment 재시작', 'Order 재시작', '트래픽 제한'].forEach((s, i) => { const x = 620 + 0, y = 290 + i * 38; cross(x, y, 8, pop(u, 1.6 + i * 0.25));
        tx(x + 18, y + 5, s + (i === 2 ? ' → 정상 사용자도 막힘' : ' → 다시 다운'), { 'font-size': 14.5, opacity: fade(u, 1.6 + i * 0.25) }); }); return; }
    services3(c);
    banner(480, 300, '기다림이 호출자의 자원을 먹는다', pop(u, 0.3));
    tx(480, 360, '한 곳의 장애가 모든 곳의 장애가 된다', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.1) }); }

  // ================= 4. 메시지 큐로 분리 =================
  const LX = 330, OFFS = [8821, 8822, 8823, 8824], CX = 830, CY = [110, 210, 310];
  // 그룹마다 다음에 읽을 offset (beat 안 그림용)
  const CUR = { 1: [8821, 8821, 8821], 2: [8822, 8822, 8821], 3: [8822, 8823, 8823], 4: [8822, 8822, 8821] };
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const xs = [70, 250, 430, 610, 790];
      ['Client', 'Order', 'Payment', 'Stock', 'Shipping'].forEach((n, i) => { svcCard(xs[i], 170, n, null, { w: 130, h: 50, s: pop(u, 0.1 + i * 0.12) }); if (i) grow(xs[i - 1] + 66, 170, xs[i] - 66, 170, seg(u, 0.3 + i * 0.15, 0.6 + i * 0.15), INK); });
      mono(480, 250, '290 ms 누적 · 한 곳 죽으면 5xx', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      const sx = (xs[1] + xs[2]) / 2, s = pop(u, 1.6);
      el('path', { d: `M${sx - 12},${120} L${sx + 12},${220} M${sx + 12},${120} L${sx - 12},${220}`, stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: s });
      tx(sx, 108, '여기를 끊는다', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: s }); return; }
    if (k === 3) { tx(480, 46, '사용자가 기다리는 시간', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      [['평소', 290, '290 ms'], ['Payment 느림', 990, '990 ms'], ['Payment 다운', 1200, '5xx']].forEach(([n, v, s], i) => { const y = 110 + i * 95, g = E(u, 0.2 + i * 0.4, 1.0 + i * 0.4);
        tx(170, y + 16, n, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end' });
        el('rect', { x: 190, y: y - 8, width: Math.max(2, 560 * v / 1200 * g), height: 22, rx: 4, fill: v >= 1200 ? BAD : OFF });
        mono(200 + 560 * v / 1200 * g, y + 9, s, { 'font-size': 14, 'font-weight': 700, fill: v >= 1200 ? BAD : INK, opacity: fade(u, 0.8 + i * 0.4) });
        el('rect', { x: 190, y: y + 20, width: Math.max(2, 560 * 35 / 1200 * g), height: 22, rx: 4, fill: ACC });
        mono(200 + 560 * 35 / 1200 * g, y + 37, '35 ms', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8 + i * 0.4) }); });
      tx(790, 400, '회색 동기 체인 · 초록 큐', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2) }); return; }
    // 새 구조: Client → Order → [orders 로그] → 소비자 셋
    const qb = c.beat.queueBox || { messages: [] }, nMsg = qb.messages.length, pn = c.prev && c.prev.queueBox ? c.prev.queueBox.messages.length : 0;
    person(50, 210, 'Client', { s: 0.8 }); svcCard(170, 210, 'Order', 'publish', { w: 120, h: 56 });
    zone(LX - 14, 132, 4 * 74 + 24, 140, 'Kafka 토픽 orders', { fill: SOFT });
    const X = logRow(LX, 214, OFFS, { w: 70, h: 40, s: (i) => (i < nMsg ? (i >= pn ? pop(u, 0.5 + (i - pn) * 0.3) : 1) : 0), mark: (i) => ({ text: 'ord-' + (1042 + i), stroke: ACC, fill: ACCBG }) });
    for (let i = nMsg; i < 4; i++) el('rect', { x: X(i) - 35, y: 194, width: 70, height: 40, rx: 5, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4' });
    if (k === 1) { fly(232, 200, X(0), 214, seg(u, 0.3, 1.0), 'ord-1042', { mono: true }); dot([[110, 232], [80, 232]], seg(u, 1.1, 1.5), INK, 6);
      pill(150, 290, '응답 35 ms', GOOD, pop(u, 1.4), { mono: true, fs: 14 }); }
    const ZR = LX - 14 + 4 * 74 + 24;
    NAMES.slice(1).forEach((n, j) => { const y = CY[j], cur = (CUR[k] || CUR[4])[j], idx = OFFS.indexOf(cur), op = k === 1 ? fade(u, 1.6 + j * 0.2) : 1;
      svcCard(CX, y, n, 'group ' + n.toLowerCase() + '-svc', { w: 190, h: 56, stroke: INFO });
      el('line', { x1: CX - 96, y1: y, x2: ZR + 4, y2: lerp(y, 216, 0.6), stroke: INFO, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', opacity: op * 0.7 });
      const cx = X(idx) + (j - 1) * 18;
      el('path', { d: `M${cx - 7},${181} l7,10 l7,-10 z`, fill: INFO, opacity: op });
      tx(cx, 177, n[0] + n[1], { 'font-size': 13.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: op }); });
    if (nMsg) tx(ZR - 10, 292, 'P·St·Sh = 그룹별 읽을 위치', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: k === 1 ? fade(u, 2.2) : 1 });
    if (k === 2) { tx(LX, 330, '시간 결합 끊김', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      tx(LX, 354, '셋이 같은 순간에 살아 있을 필요가 없다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7) });
      tx(LX, 386, '공간 결합 끊김', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      tx(LX, 410, 'Order는 토픽 이름 orders만 안다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 4) { [['디스크 영속', '읽어도 남는다'], ['offset 되감기', '다시 처리'], ['팬아웃', '그룹마다 따로 읽음'], ['백프레셔 완충', '폭증은 로그가 받음']].forEach(([a, b], i) => {
        const x = 110 + i * 200, s = pop(u, 0.3 + i * 0.35); card(x + 40, 370, 180, 58, { rx: 10, stroke: ACC, sw: 2, s });
        if (s > 0.5) { tx(x + 40, 364, a, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); tx(x + 40, 386, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } });
      curve(`M${X(3)},${236} C${X(3)},${290} ${X(0)},${290} ${X(0)},${238}`, seg(u, 0.9, 1.7), ACC, { sw: 2 }); } }

  // ================= 5. 결합도 ↓ 회복력 ↑ =================
  const L5 = 290, W5 = 48;
  function s5(t, c) { const { k, u } = c, sv = c.beat.services, feats = (c.beat.resilienceBox || { features: [] }).features, pf = c.prev && c.prev.resilienceBox ? c.prev.resilienceBox.features.length : 0;
    // 아래: 함정과 답 (화살표 앞 말만)
    feats.forEach((f, i) => { const name = f.split(' → ')[0], x = 105 + i * 188, s = i >= pf ? pop(u, 0.4 + (i - pf) * 0.35) : 1;
      card(x, 398, 172, 34, { rx: 17, stroke: GOOD, fill: GOODBG, sw: 1.8, s }); if (s > 0.5) { check(x - 66, 398, 7); tx(x - 52, 403, name, { 'font-size': 13.5, 'font-weight': 700 }); } });
    svcCard(120, 150, 'Order', 'publisher', { w: 140, h: 56, stroke: sv[0].status === 'ok' ? GOOD : INK });
    zone(L5 - 12, 96, 8 * (W5 + 4) + 20, 116, null, { fill: SOFT }); tx(L5 + 8 * (W5 + 4) - 4, 226, 'orders 로그', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
    const nLog = k === 0 ? Math.round(lerp(3, 8, E(u, 0.3, 2.2))) : k >= 3 ? 7 : 6;
    for (let i = 0; i < 8; i++) { const on = i < nLog, x = L5 + i * (W5 + 4);
      el('rect', { x, y: 132, width: W5, height: 38, rx: 5, fill: on ? ACCBG : 'none', stroke: on ? ACC : GRID, 'stroke-width': on ? 2 : 1.2, 'stroke-dasharray': on ? null : '4 4' });
      mono(x + W5 / 2, 188, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    const px = 820; svcCard(px, 150, 'Payment', 'group payment-svc', { w: 170, h: 56, stroke: k === 0 ? BAD : INFO, op: k === 0 ? 0.6 : 1 });
    const cursorAt = (i, col, lab, op) => { const x = L5 + i * (W5 + 4) + W5 / 2; el('path', { d: `M${x - 8},${108} l8,12 l8,-12 z`, fill: col, opacity: op ?? 1 }); if (lab) mono(x, 103, lab, { 'font-size': 13.5, fill: col, 'text-anchor': 'middle', 'font-weight': 700, opacity: op ?? 1 }); };
    if (k === 0) { for (let i = 0; i < 3; i++) dot([[190, 150], [L5 + (3 + i) * (W5 + 4), 150]], seg(u, 0.3 + i * 0.6, 0.9 + i * 0.6), ACC, 6);
      cross(px, 150, 18, pop(u, 0.2)); cursorAt(3, BAD, 'commit 3');
      tx(px, 222, 'consumer 다운', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
      pill(120, 230, '응답 35 ms', GOOD, pop(u, 0.8), { mono: true, fs: 14 });
      tx(L5, 250, '메시지는 로그에 남아 복구를 기다린다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { const back = E(u, 1.0, 2.0); cursorAt(lerp(5, 2, back), INFO, back > 0.9 ? 'seek → 2' : 'offset 5');
      curve(`M${L5 + 5 * (W5 + 4) + 20},${126} C${L5 + 5 * (W5 + 4)},${70} ${L5 + 2 * (W5 + 4) + 40},${70} ${L5 + 2 * (W5 + 4) + 30},${118}`, seg(u, 0.4, 1.0), INFO, { sw: 2 });
      card(120, 268, 200, 70, { rx: 10, stroke: GRID, s: pop(u, 0.2) });
      mono(40, 260, 'PAYMENT_URL', { 'font-size': 14, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 0.3) });
      mono(40, 286, 'topic = "orders"', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(L5, 258, '잘못 처리했으면 offset을 되감아 다시 읽는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { card(470, 290, 470, 104, { rx: 10, fill: SOFT, stroke: GRID, s: pop(u, 0.2) });
      ['producer = KafkaProducer(', '    bootstrap_servers="kafka:9092",', '    value_serializer=JSON 바이트)'].forEach((s, i) => mono(250, 262 + i * 24, s, { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.3) }));
      mono(40, 250, 'PAYMENT_URL', { 'font-size': 14, fill: BAD, opacity: 1 - fade(u, 1.6, 0.6) + 0.35 });
      el('line', { x1: 36, y1: 245, x2: lerp(36, 156, seg(u, 1.6, 2.2)), y2: 245, stroke: BAD, 'stroke-width': 2.5 });
      return; }
    if (k === 3) { fly(190, 150, L5 + 6 * (W5 + 4) + W5 / 2, 151, seg(u, 0.2, 1.0), 'send("orders")', { mono: true });
      person(40, 262, null, { s: 0.7 });
      fly(120, 186, 150, 262, seg(u, 1.2, 1.9), '"queued" 35 ms', { fill: GOOD, mono: true, stay: true });
      tx(L5, 262, 'flush 후 바로 return, 기다리는 대상이 없다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      ['Payment', 'Stock', 'Shipping'].forEach((n, i) => pill(560 + i * 120, 320, n + ' 대기', INFO, pop(u, 2.0 + i * 0.12), { fs: 13.5 })); return; }
    if (k === 4) { const a = pop(u, 0.3); cursorAt(0, INFO, '0 (earliest)', a);
      grow(px - 88, 150, L5 + 7 * (W5 + 4) + 8, 150, seg(u, 0.2, 0.8), INFO);
      tx(L5, 254, '커밋한 위치가 없다 → 가장 오래된 0번부터', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) });
      pill(px, 232, 'enable_auto_commit=False', INFO, pop(u, 1.5), { mono: true, fs: 13.5 }); return; }
    // k5: 꺼내서 처리하고 커밋
    const cyc = Math.min(3, Math.floor(u / 0.85)), f = (u % 0.85) / 0.85, pos = cyc;
    cursorAt(pos, INFO, 'next ' + pos);
    el('path', { d: `M${L5 + pos * (W5 + 4) - 2},${178} l0,16`, stroke: GOOD, 'stroke-width': 3 });
    mono(L5 + pos * (W5 + 4) - 6, 212, 'commit ' + pos, { 'font-size': 13.5, fill: GOOD, 'font-weight': 700 });
    if (cyc < 3) fly(L5 + pos * (W5 + 4) + W5 / 2, 151, px - 60, 150, clamp(f * 1.6), 'offset ' + pos, { fill: INFO, mono: true });
    tx(px, 222, '처리 45 ms → commit', { 'font-size': 14.5, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700 });
    tx(L5, 262, '처리 중 죽으면 커밋 전 위치부터 다시 받는다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) }); }

  const quiz = [
    { q: '동기 체인에서 Stock 호출이 실패했을 때 바로 생기는 문제는 무엇인가?',
      o: ['결제만 되고 주문은 실패해 환불이 필요해진다', 'Payment가 자동으로 결제를 취소해 준다', 'Shipping이 대신 재고를 차감한다'], a: 0,
      why: 'Payment 호출이 끝난 뒤에 Stock을 부르므로, Stock이 죽으면 돈은 빠져나갔는데 주문은 502로 끝난다. 되돌릴 책임이 Order에 남는다.' },
    { q: 'Payment만 120 ms에서 820 ms로 느려졌다. 사용자 응답은 몇 ms가 되나?',
      o: ['820 ms', '990 ms', '290 ms'], a: 1,
      why: '동기 체인의 응답은 네 곳의 합이다. 30 + 820 + 80 + 60 = 990 ms로, 평소 290 ms의 약 3.4배다.' },
    { q: 'Payment가 느려졌는데 Order까지 새 요청을 거절하게 된 이유는 무엇인가?',
      o: ['Order 코드에 같은 버그가 있어서', 'Order의 워커가 Payment 응답을 기다리며 묶여 풀이 가득 차서', 'Stock이 Order로 요청을 되돌려 보내서'], a: 1,
      why: '동기 호출은 응답이 올 때까지 호출자의 워커를 붙잡는다. 워커가 다 묶이면 정상 요청도 받을 수 없다.' },
    { q: 'Order가 orders 토픽에 publish만 하게 바꾼 뒤, 사용자 응답 시간을 정하는 것은 무엇인가?',
      o: ['네 서비스 응답 시간의 합', '가장 느린 consumer의 처리 시간', 'Order가 메시지를 토픽에 넣는 시간'], a: 2,
      why: 'Order는 publish한 순간 응답하므로 사용자는 약 35 ms만 기다린다. Payment가 느리든 죽든 이 값은 변하지 않는다.' },
    { q: 'Payment consumer가 처리 중에 죽었다. 커밋을 성공 뒤에만 하면 다시 살아났을 때 어떻게 되나?',
      o: ['커밋하지 못한 그 메시지부터 다시 받는다', '죽기 전 메시지는 모두 사라진다', 'Order가 같은 주문을 다시 보내야 한다'], a: 0,
      why: '메시지는 로그에 남아 있고 그룹의 커밋 위치는 처리 전 그대로다. 다시 붙으면 그 위치부터 읽으므로 잃는 메시지가 없다.' },
  ];

  const summary = [
    '동기 체인에서는 Order가 Payment, Stock, Shipping을 차례로 부르고 응답은 네 곳의 합인 290 ms다.',
    'Payment 하나가 820 ms로 느려지면 전체가 990 ms가 되고, 다운되면 워커가 묶여 네 곳이 함께 무너진다.',
    'Order가 orders 토픽에 publish만 하면 사용자 응답은 약 35 ms로 고정되고 나머지는 각자 속도로 읽는다.',
    'consumer가 죽어도 메시지는 로그에 남고, 성공한 뒤에만 커밋하면 살아난 뒤 그 자리부터 다시 처리한다.',
  ];
  const review = [
    { q: '블랙프라이데이에 Payment만 503을 내는데 주문 화면 전체가 멈췄다. 구조에서 먼저 의심할 것은?',
      o: ['Order가 Payment를 동기로 부르며 응답을 기다리는 것', 'Shipping 서버의 디스크 용량', '사용자 브라우저의 캐시'], a: 0,
      why: '동기 호출은 Payment가 느려지면 Order의 워커를 붙잡는다. 워커 풀이 차면 다른 정상 요청까지 거절된다.' },
    { q: '큐로 바꾼 뒤 Payment consumer가 30분 동안 죽어 있었다. 그 사이 들어온 주문은 어떻게 되나?',
      o: ['Order가 모두 502로 실패시켰다', '로그에 남아 있다가 커밋 위치부터 처리된다', '브로커가 30분 뒤 자동으로 지운다'], a: 1,
      why: 'Order는 토픽에만 쓰고 바로 응답했다. 메시지는 보존 기간 동안 로그에 남으므로 Payment가 붙으면 이어서 읽는다.' },
    { q: 'consumer를 기본 설정(자동 커밋)으로 두고 처리 실패를 잡아서 넘겼다. 생길 수 있는 일은?',
      o: ['실패한 메시지가 영원히 반복된다', '브로커가 실패를 감지해 메시지를 되돌린다', '실패한 메시지 위치까지 커밋되어 다시 받지 못할 수 있다'], a: 2,
      why: '자동 커밋은 처리 결과와 상관없이 읽은 위치를 주기적으로 커밋한다. 성공 뒤에만 커밋하려면 자동 커밋을 끄고 직접 commit 해야 한다.' },
  ];

  R.page({ title: '동기 체인과 메시지 큐', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
