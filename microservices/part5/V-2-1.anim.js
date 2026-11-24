/* V-2-1 MSA 안티패턴 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 테이블 단위로 쪼개진 서비스와 함께 끌려가는 배포, 호출 폭포수(지연 합), worker pool 칸과 서킷 상태, 공유 테이블과 owner, 6단계 로드맵 간트.
 * 지연 합은 페이지 코드 주석(원격 호출 30ms, get_many 40ms)대로 더한 값이다: N+1 990ms, Batch 130ms, BFF 70ms, BFF+캐시 60ms.
 *   같은 코드를 asyncio.sleep 가짜 서비스로 돌려 잰 값은 1086 / 143 / 76 / 65ms (윈도우 타이머 오차만큼 길다).
 * 서킷 그림은 circuitbreaker 2.1.3 으로 페이지 코드를 1/10 시간으로 돌린 결과: 5번 2초 timeout → 열림, 6~8번은 즉시 CircuitBreakerError,
 *   30초 뒤 반열림 → 시험 호출 성공 → 닫힘.  worker 100 → 40 은 "초당 20건" 을 가정한 Little 의 법칙 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, clock, meters, axes, line, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  function head(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 17, 'font-weight': 800, opacity: op ?? 1 }, a || {})); }
  function svc(cx, cy, name, o) { o = o || {}; return card(cx, cy, o.w || 110, o.h || 50, { rx: 10, stroke: o.col || INK, sw: 2.4, fill: o.fill, s: o.s, op: o.op, text: name, mono: true, fs: o.fs || 15, fw: 800, color: o.col || INK }); }

  // ---------- 1. Distributed Monolith ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      const Q = ['다른 서비스와 함께 배포해야 했나', '같은 테이블을 직접 SELECT/UPDATE 하나', '공통 라이브러리를 다 같이 올려야 하나', '한 곳 장애가 바로 남의 5XX가 되나', 'API를 바꾸면 클라이언트 PR도 같이 내나'];
      Q.forEach((q, i) => { const y = 70 + i * 56, f = pop(u, 0.3 + i * 0.3);
        el('rect', { x: 60, y: y - 18, width: 26, height: 26, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 2 }); if (u > 0.3 + i * 0.3) check(73, y - 5, 9, f);
        tx(100, y, q, { 'font-size': 16.5, 'font-weight': 600, opacity: fade(u, 0.1 + i * 0.3) }); mono(560, y, 'yes', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.4 + i * 0.3) }); });
      const s = pop(u, 2.0);
      card(780, 200, 230, 110, { rx: 14, stroke: BAD, sw: 4, s, fill: 'var(--badbg)' });
      tx(780, 192, '5 / 5', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 2.1) });
      tx(780, 222, '분산 모놀리스', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); return; }
    if (k === 1) {
      const sp = E(u, 0.6, 1.4), T = ['orders', 'items', 'users'];
      tx(480, 56, '도메인이 아니라 DB 테이블을 기준으로 잘랐다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      if (sp < 0.98) el('rect', { x: 250, y: 90, width: 460, height: 130, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2.5, opacity: 1 - sp });
      T.forEach((n, i) => { const cx = lerp(330 + i * 150, 220 + i * 260, sp);
        card(cx, 155, 140, 74, { rx: 10, stroke: sp > 0.5 ? BAD : INK, sw: 2.4, fill: PANEL });
        mono(cx, 148, n + ' 테이블', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
        mono(cx, 172, sp > 0.5 ? 'svc-' + 'ABC'[i] : '', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
        grow(cx, 194, 480, 296, E(u, 1.5 + i * 0.15, 2.0 + i * 0.15), BAD, { plain: true, sw: 2 }); });
      card(480, 316, 340, 46, { rx: 10, stroke: BAD, sw: 2.5, text: '공통 라이브러리 강제 · 같은 DB', fs: 15.5, fw: 800, color: BAD, s: pop(u, 1.6) });
      tx(480, 380, '경계 분석 없이 자르면 줄이 그대로 남는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) {
      const S6 = ['A', 'B', 'C', 'D', 'E', 'F'];
      S6.forEach((n, i) => { const x = 110 + i * 112, hot = i === 0, on = i > 0 && u > 0.6 + i * 0.2;
        svc(x, 110, 'svc-' + n, { col: hot ? ACC : on ? BAD : INK, fill: on ? 'var(--badbg)' : null, w: 96 });
        if (i > 0) grow(x - 104 + 48, 110, x - 50, 110, E(u, 0.4 + i * 0.2, 0.6 + i * 0.2), BAD); });
      pill(110, 50, '배포 1건', ACC, pop(u, 0.2), { fs: 14 });
      tx(400, 170, '하나를 내보내려면 다섯이 함께 간다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      meters(60, 220, 840, [{ name: '배포 빈도', val: '↓ 느려짐', hot: true }, { name: '장애 격리', val: '안 됨', hot: true }, { name: '팀 자율성', val: '사라짐', hot: true }, { name: '운영 복잡도', val: 'N배', hot: true }].map((m, i) => (u > 1.8 + i * 0.15 ? m : Object.assign({}, m, { val: '' }))), { h: 80 });
      tx(480, 360, 'MSA 비용은 다 내고 장점은 못 받는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 3) {
      const F = ['도메인 재분석 (Bounded Context)', 'DB 분리 · API만 노출', 'API 계약 우선 (OpenAPI/Protobuf)', '하위 호환 변경 (deprecated 거치기)', 'consumer-driven contract test', '공유 라이브러리 최소화'];
      F.forEach((s, i) => { const x = 70 + i * 70, y = 360 - i * 52, f = pop(u, 0.2 + i * 0.3);
        el('rect', { x, y: y - 20, width: 380, height: 40, rx: 8, fill: i < 2 ? 'var(--newbg)' : PANEL, stroke: i < 2 ? ACC : INK, 'stroke-width': 2, opacity: Math.min(1, f) });
        mono(x + 16, y + 6, String(i + 1), { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.3) });
        tx(x + 42, y + 6, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); });
      tx(560, 380, '도메인부터 다시 보지 않으면', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); tx(560, 404, 'DB만 나눠도 다시 묶인다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k4: 회복 신호
    ['A', 'B', 'C'].forEach((n, i) => { const x = 170 + i * 220;
      zone(x - 90, 80, 180, 200, null, { stroke: GOOD, dash: i === 0 ? null : '6 5' });
      svc(x, 140, 'svc-' + n, { col: i === 0 ? ACC : INK });
      dbIcon(x, 230, null, { s: 0.6 });
      if (i === 0) pill(x, 66, 'v2 배포', ACC, pop(u, 0.4), { fs: 14 }); else tx(x, 66, '모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9 + i * 0.2) }); });
    const ripple = E(u, 0.5, 1.4); el('circle', { cx: 170, cy: 140, r: 20 + 60 * ripple, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: 1 - ripple });
    [['옆 팀이 내 배포를 몰라도 된다'], ['새 팀이 묻지 않고 배포한다'], ['장애가 한 서비스에 갇힌다']].forEach(([s], i) => { const y = 340, x = 70 + i * 290; check(x, y - 6, 8, pop(u, 1.4 + i * 0.3)); tx(x + 16, y, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.5 + i * 0.3), 'text-anchor': 'start' }); }); }

  // ---------- 2. Chatty — 호출 폭포수 ----------
  const RW = { order: 0, items: 1, cat: 2, user: 3 }, NAMES = ['orders.get', 'orders.items', 'catalog', 'user.get'];
  function fall(D, bars, o) { o = o || {}; const x0 = 200, W = 700, X = (ms) => x0 + ms / D * W, Y = (r) => 90 + r * 62;
    NAMES.forEach((n, r) => mono(x0 - 14, Y(r) + 6, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: MUT }));
    const ticks = D > 500 ? [0, 250, 500, 750, 1000] : [0, 50, 100, 150]; ticks.forEach((v) => { if (v > D) return; el('line', { x1: X(v), y1: 64, x2: X(v), y2: 318, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(X(v), 338, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    bars.forEach(([r, a, b, col, op]) => { if (b <= a) return; el('rect', { x: X(a), y: Y(r) - 13, width: Math.max(1.5, X(b) - X(a) - (b - a > 20 ? 1 : 0)), height: 26, rx: 3, fill: col || INFO, opacity: op ?? 0.85 }); });
    return { X, Y }; }
  function total(x, ms, col, op) { mono(x, 390, '합계 ' + Math.round(ms) + 'ms', { 'font-size': 20, 'font-weight': 800, fill: col || INK, 'text-anchor': 'end', opacity: op ?? 1 }); }
  function catN(n, start, dur) { const out = []; for (let i = 0; i < n; i++) out.push([2, start + i * dur, start + (i + 1) * dur, i % 2 ? BAD : WARN]); return out; }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const g = E(u, 0.2, 1.4);
      fall(1000, [[0, 0, Math.min(30, 60 * g), INFO], [1, 30, Math.min(60, 60 * g), INFO]]);
      total(900, 60 * g); tx(200, 50, '원격 호출 하나 = 30ms', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.5) }); return; }
    if (k === 1 || k === 2) { const n = k === 1 ? Math.floor(lerp(0, 8, E(u, 0.2, 2.0))) : Math.floor(lerp(8, 30, E(u, 0.1, 1.4)));
      const f = fall(1000, [[0, 0, 30, INFO], [1, 30, 60, INFO]].concat(catN(n, 60, 30)).concat(k === 2 && u > 1.6 ? [[3, 960, 990, INFO]] : []));
      mono(200, 50, 'for it in items:  await catalog_svc.get(…)', { 'font-size': 15.5, 'font-weight': 700, fill: BAD });
      mono(900, 50, '호출 ' + (2 + n) + '회', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: BAD });
      if (k === 2) { const op = fade(u, 1.4); el('path', { d: `M${f.X(60)},${f.Y(2) + 22} L${f.X(60)},${f.Y(2) + 32} L${f.X(960)},${f.Y(2) + 32} L${f.X(960)},${f.Y(2) + 22}`, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: op });
        mono(f.X(510), f.Y(2) + 52, '30 × 30ms = 900ms', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: op }); }
      total(900, k === 1 ? 60 + n * 30 : u > 1.6 ? 990 : 60 + n * 30, BAD); return; }
    if (k === 3) { const sh = E(u, 0.3, 1.2), D = lerp(1000, 160, E(u, 1.4, 2.2)), catEnd = lerp(960, 100, sh);
      const bars = [[0, 0, 30, INFO], [1, 30, 60, INFO]];
      if (sh < 0.5) bars.push(...catN(30, 60, (catEnd - 60) / 30)); else bars.push([2, 60, catEnd, ACC]);
      bars.push([3, catEnd, catEnd + 30, INFO]); fall(D, bars);
      mono(200, 50, 'products = await catalog_svc.get_many(ids)', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      mono(900, 50, '호출 4회', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: ACC, opacity: fade(u, 1.0) });
      total(900, catEnd + 30, ACC); return; }
    if (k === 4) {
      tx(80, 80, 'catalog 구간만 비교', { 'font-size': 16, 'font-weight': 800 });
      [['N+1 (30회)', 900, BAD], ['Batch (1회)', 40, ACC]].forEach(([n, v, col], i) => { const y = 150 + i * 80, g = E(u, 0.2 + i * 0.4, 1.2 + i * 0.4);
        tx(80, y + 8, n, { 'font-size': 16, 'font-weight': 700 }); el('rect', { x: 240, y: y - 16, width: Math.max(3, 600 * v / 900 * g), height: 32, rx: 5, fill: col, opacity: 0.85 });
        mono(250 + Math.max(3, 600 * v / 900 * g), y + 7, v + 'ms', { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.8 + i * 0.4) }); });
      mono(480, 340, '900 → 40ms · 22.5배 · −95%', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) });
      tx(480, 380, '알고리즘이 아니라 호출 횟수를 줄였을 뿐이다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k5~8: BFF · 캐시 · gRPC (축 160ms)
    const mv = k === 5 ? E(u, 0.3, 1.2) : 1, it0 = lerp(30, 0, mv);
    let bars, tot;
    if (k === 5) { bars = [[0, 0, 30, INFO], [1, it0, it0 + 30, ACC], [2, it0 + 30, it0 + 70, INFO], [3, it0 + 70, it0 + 100, INFO]]; tot = it0 + 100; }
    else { const uu = k === 6 ? E(u, 0.3, 1.2) : 1, us = lerp(70, 30, uu), cat = k >= 7 ? lerp(40, 0, k === 7 ? E(u, 0.3, 1.2) : 1) : 40;
      bars = [[0, 0, 30, INFO], [1, 0, 30, INFO], [2, 30, 30 + cat, k >= 7 ? GOOD : INFO], [3, us, us + 30, k === 6 ? ACC : INFO]]; tot = Math.max(30 + cat, us + 30); }
    const f = fall(160, bars);
    if (k === 8) { [[0, 0, 30], [1, 0, 30], [3, 30, 60]].forEach(([r, a, b]) => el('rect', { x: f.X(a + (b - a) * 0.5), y: f.Y(r) - 13, width: f.X(b) - f.X(a + (b - a) * 0.5), height: 26, fill: PANEL, opacity: 0.55 * fade(u, 0.5) }));
      tx(200, 50, 'gRPC: HTTP/2 재사용 + protobuf · 30~50% 더 (흐린 부분, 예시 폭)', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) }); }
    else mono(200, 50, k === 5 ? 'await asyncio.gather(order_task, items_task)' : k === 6 ? 'await asyncio.gather(products_task, user_task)' : 'Redis 5분 TTL · get_many ≈ 0ms', { 'font-size': 15.5, 'font-weight': 700, fill: k === 7 ? GOOD : ACC, opacity: fade(u, 0.2) });
    total(900, tot, k >= 6 ? GOOD : ACC);
    if (k >= 6) mono(560, 390, '990 → 130 → ' + (k >= 7 ? '70 → 60' : '70') + 'ms', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.5) }); }

  // ---------- 3. Synchronous Storm ----------
  const CH = ['checkout', 'auth', 'orders', 'payments', 'inventory'];
  function chain(o) { o = o || {}; CH.forEach((n, i) => { const y = 60 + i * 72, col = (o.col && o.col(i)) || INK;
      svc(120, y, n, { col, w: 150, h: 46, fs: 14.5 });
      if (i < 4) { el('line', { x1: 120, y1: y + 23, x2: 120, y2: y + 49, stroke: GRID, 'stroke-width': 2.5 }); if (o.lab) { const s = o.lab(i); if (s) mono(134, y + 42, s, { 'font-size': 13.5, 'font-weight': 700, fill: o.labCol ? o.labCol(i) : MUT }); } } }); }
  function grid100(x, y, nBusy, col, o) { o = o || {}; const cs = 25;
    for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), c2 = i % 10, on = i < nBusy, fenced = o.fence && i < o.fence;
      el('rect', { x: x + c2 * cs, y: y + r * cs, width: cs - 4, height: cs - 4, rx: 3, fill: on ? col : fenced ? 'var(--warnbg)' : SOFT, stroke: fenced ? WARN : 'none', 'stroke-width': 1.2, opacity: on ? 0.85 : 1 }); }
    tx(x, y - 12, o.title || 'worker pool', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    mono(x + 246, y - 12, Math.round(nBusy) + ' / 100', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: nBusy >= 99 ? BAD : INK }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { chain({ lab: (i) => (u > 0.4 + i * 0.3 ? 'timeout 없음 · ∞' : ''), labCol: () => BAD, col: (i) => (i === 3 ? WARN : INK) });
      tx(330, 120, '네 단계를 줄줄이 기다린다', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.2) });
      tx(330, 150, '어느 한 곳도 기다림에 상한이 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      tx(330, 250, 'payments는 외부 결제에 의존', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { chain({ col: (i) => (i === 3 ? BAD : i < 3 && u > 1.0 ? WARN : INK), lab: (i) => (i === 2 ? '5초 대기' : ''), labCol: () => BAD });
      grid100(560, 90, 100 * E(u, 0.3, 2.0), BAD);
      for (let i = 0; i < 6; i++) dot([[560, 360], [470, 400]], seg(u, 2.0 + i * 0.08, 2.5 + i * 0.08), BAD, 5);
      mono(760, 380, '새 요청 → 503', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      tx(330, 120, '동시 100건 × 5초', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4) });
      tx(330, 148, '= worker 전부 점유', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); return; }
    if (k === 2) { chain({ col: (i) => (i === 3 ? ACC : INK) });
      card(560, 130, 380, 62, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.3), text: 'PAYMENT_TIMEOUT = 2.0', mono: true, fs: 18, fw: 800, color: ACC });
      card(560, 230, 380, 62, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.8), text: '@circuit(5회 실패 → 30초 차단)', mono: true, fs: 16, fw: 800, color: ACC });
      tx(560, 320, '값을 상수로 드러내 운영 중 조정한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { chain({ col: (i) => (i === 3 ? ACC : INK), lab: (i) => (i === 2 ? 'wait_for 2.0s' : ''), labCol: () => ACC });
      const X = (s) => 300 + s * 120; tx(300, 70, 'payments 응답 기다리는 시간', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      el('rect', { x: X(0), y: 86, width: (X(5) - X(0)) * E(u, 0.2, 1.0), height: 28, rx: 5, fill: OFF });
      el('rect', { x: X(0), y: 86, width: (X(2) - X(0)) * E(u, 1.0, 1.4), height: 28, rx: 5, fill: ACC });
      [0, 1, 2, 3, 4, 5].forEach((s) => mono(X(s), 134, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      el('line', { x1: X(2), y1: 76, x2: X(2), y2: 124, stroke: BAD, 'stroke-width': 3.5, 'stroke-dasharray': '6 3', opacity: fade(u, 1.0) }); mono(X(2) + 6, 72, '여기서 자른다', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) });
      const busy = lerp(100, 40, E(u, 1.5, 2.3)); grid100(560, 190, busy, BAD, { title: 'worker 점유 · 예시' });
      tx(330, 250, '20건/초 × 5초 = 100', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, class: 'mono', opacity: fade(u, 1.5) });
      tx(330, 276, '20건/초 × 2초 = 40', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 2.0) }); return; }
    if (k === 4) {
      // circuitbreaker 2.1.3 실측: 1~5번 2초 timeout, 6~8번 즉시 열림 오류
      tx(60, 56, 'charge_with_breaker를 8번 부르면 (실제로 돌린 결과)', { 'font-size': 15.5, 'font-weight': 700, fill: MUT });
      const X = (s) => 230 + s * 150;
      for (let i = 0; i < 8; i++) { const y = 84 + i * 30, f = E(u, 0.1 + i * 0.18, 0.3 + i * 0.18), open = i >= 5;
        mono(80, y + 5, 'call ' + (i + 1), { 'font-size': 14, fill: MUT, opacity: f > 0 ? 1 : 0 });
        el('rect', { x: X(0), y: y - 10, width: Math.max(4, (X(open ? 0.03 : 2) - X(0)) * f), height: 20, rx: 3, fill: open ? WARN : BAD, opacity: f > 0 ? 0.85 : 0 });
        mono(X(open ? 0.1 : 2) + 10, y + 5, open ? 'CircuitBreakerError · 즉시' : 'PaymentTimeout · 2.0s', { 'font-size': 14, 'font-weight': 700, fill: open ? WARN : BAD, opacity: fade(u, 0.2 + i * 0.18) }); }
      const st = u < 1.1 ? 0 : u < 2.2 ? 1 : 2; [['닫힘', GOOD], ['열림', BAD], ['반열림', WARN]].forEach(([s, col], i) => { const x = 300 + i * 170, on = i === st;
        el('circle', { cx: x, cy: 370, r: 30, fill: on ? col : PANEL, stroke: col, 'stroke-width': 3 }); tx(x, 376, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: on ? PANEL : col });
        if (i < 2) grow(x + 34, 370, x + 132, 370, 1, MUT); });
      mono(385, 352, '5회 실패', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(555, 352, '30초 뒤', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      tx(810, 376, '시험 성공 → 닫힘', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) }); return; }
    if (k === 5) {
      const B5 = [['auth', 0.5], ['orders', 1.0], ['payments', 2.0], ['inventory', 0.5]], X = (s) => 120 + s * 170; let acc = 0;
      tx(120, 80, '단계별 timeout 예산', { 'font-size': 17, 'font-weight': 800 });
      B5.forEach(([n, s], i) => { const a = acc; acc += s; const f = E(u, 0.2 + i * 0.35, 0.6 + i * 0.35);
        el('rect', { x: X(a), y: 120, width: Math.max(0, (X(acc) - X(a)) * f - 3), height: 44, rx: 5, fill: [INFO, INFO, ACC, INFO][i], opacity: 0.8 });
        mono(X(a + s / 2), 148, n, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: f > 0.9 ? 1 : 0 });
        mono(X(a + s / 2), 190, s + 's', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.35) }); });
      [0, 1, 2, 3, 4].forEach((s) => mono(X(s), 224, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      mono(480, 290, '최악 대기 = 0.5 + 1.0 + 2.0 + 0.5 = 4.0초', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.8) });
      tx(480, 330, '전에는 ∞ 였다 · 이제 계산할 수 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 6) { chain({ col: (i) => (i === 3 ? BAD : INK) });
      cross(210, 276, 12, pop(u, 0.3));
      grow(200, 260, 420, 210, E(u, 0.5, 1.0), ACC);
      el('rect', { x: 430, y: 180, width: 240, height: 56, rx: 8, fill: PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.5) });
      for (let i = 0; i < 6; i++) el('rect', { x: 442 + i * 36, y: 192, width: 28, height: 32, rx: 4, fill: ACC, opacity: (i < 1 + Math.floor(5 * E(u, 0.8, 1.6))) ? 0.7 : 0.12 });
      tx(550, 260, 'pay_queue', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 0.6) });
      pill(560, 330, 'order.status = "PAYMENT_PENDING"', GOOD, pop(u, 1.6), { mono: true, fs: 14.5 });
      tx(560, 390, '결제는 나중에, 주문 접수는 지금', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k7: Bulkhead
    grid100(140, 90, 20 * E(u, 0.3, 1.2), WARN, { fence: 20, title: 'worker pool' });
    el('rect', { x: 136, y: 86, width: 254, height: 54, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: fade(u, 0.2) });
    mono(400, 120, 'Semaphore(20)', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
    for (let i = 0; i < 5; i++) dot([[40, 250], [130, 250 - 20 + i * 8]], seg(u, 1.0 + i * 0.2, 1.6 + i * 0.2), GOOD, 5);
    tx(640, 200, 'payments가 아무리 느려도', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
    tx(640, 228, '최대 20칸만 잡는다', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) });
    tx(640, 280, '나머지 80칸은 다른 요청 몫', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); }

  // ---------- 4. Shared Database ----------
  function tbl(cx, cy, name, cols, o) { o = o || {}; const w = o.w || 200;
    el('rect', { x: cx - w / 2, y: cy - 18, width: w, height: 36 + cols.length * 26, rx: 6, fill: PANEL, stroke: o.col || INK, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    el('rect', { x: cx - w / 2, y: cy - 18, width: w, height: 30, rx: 6, fill: o.col || INK, opacity: (o.op ?? 1) * 0.85 });
    mono(cx, cy + 3, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: o.op ?? 1 });
    cols.forEach(([s, col], i) => mono(cx - w / 2 + 14, cy + 34 + i * 26, s, { 'font-size': 14, fill: col || INK, opacity: o.op ?? 1 })); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) {
      svc(200, 80, 'orders'); svc(760, 80, 'inventory', { col: u > 1.8 ? BAD : INK, w: 130 });
      const add = u > 0.9;
      tbl(480, 230, 'products', [['id'], ['name'], ['stock'], ...(add ? [['+ new_col', WARN]] : [])], { w: 220 });
      grow(240, 106, 380, 210, 1, MUT); grow(720, 106, 590, 210, 1, MUT);
      mono(140, 160, 'ALTER TABLE products', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.4) }); mono(140, 182, 'ADD COLUMN …', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
      if (u > 1.8) { cross(840, 160, 12, pop(u, 1.8)); mono(820, 200, 'ORM 매핑 깨짐', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
      pill(760, 30, '503', BAD, pop(u, 2.1), { mono: true, fs: 15 });
      tx(480, 400, '남의 DDL 한 줄이 내 서비스 배포가 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 1) {
      [['스키마가 문서 없는 인터페이스가 된다', 'implicit 계약'], ['직접 SQL 이라 감시·감사가 안 된다', '누가 읽는지 모름'], ['DB 부하를 나눌 수 없다', '한 인스턴스가 다 받음'], ['도메인 경계가 흐려진다', '코드도 따라 흐려짐']].forEach(([a, d], i) => {
        const y = 80 + i * 76, s = pop(u, 0.2 + i * 0.35); card(330, y, 520, 60, { rx: 10, stroke: BAD, sw: 2, s });
        tx(90, y - 2, a, { 'font-size': 16.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); tx(90, y + 20, d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.35) }); });
      dbIcon(780, 200, '공유 DB 하나', { stroke: BAD, s: 1.2 });
      tx(780, 320, '서비스는 나뉘었는데 DB는 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    // k2~: 두 테이블 + owner
    if (k === 2 || k === 3) {
      svc(170, 90, 'orders', { col: ACC }); svc(790, 90, 'inventory', { col: INFO, w: 130 });
      tbl(380, 250, 'orders', [['id'], ['status']], { col: ACC }); tbl(600, 250, 'products', [['id'], ['stock']], { col: INFO });
      pill(380, 340, 'owner: orders', ACC, pop(u, k === 2 ? 0.5 : 0), { fs: 14 }); pill(600, 340, 'owner: inventory', INFO, pop(u, k === 2 ? 0.8 : 0), { fs: 14 });
      tx(480, 400, k === 2 ? '테이블마다 owner는 하나 (배정은 예시)' : '읽기는 API로, 쓰기 권한은 끊는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      if (k === 2) { grow(200, 116, 360, 230, 1, MUT); grow(230, 110, 560, 230, 1, OFF, { dash: '5 5' }); grow(760, 116, 620, 230, 1, MUT); return; }
      grow(200, 116, 360, 230, 1, ACC); grow(760, 116, 620, 230, 1, INFO);
      const sw = E(u, 0.3, 1.0); el('line', { x1: 230, y1: 110, x2: 560, y2: 230, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: 1 - sw });
      grow(240, 80, 720, 80, E(u, 0.8, 1.4), ACC); mono(480, 70, 'GET /stock (API)', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      lock(520, 180, true, BAD, pop(u, 1.6)); mono(545, 186, 'INSERT/UPDATE 권한 회수', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) }); return; }
    if (k === 4) {
      const sp = E(u, 0.2, 1.4); ['같은 인스턴스 · 다른 schema', '같은 클러스터 · 다른 DB', '별도 인스턴스'].forEach((s, i) => { const on = Math.floor(sp * 2.99) === i;
        pill(170 + i * 310, 50, s, on ? ACC : MUT, 1, { fs: 14, fill: on ? 'var(--newbg)' : null }); if (i < 2) grow(170 + i * 310 + 110, 50, 170 + i * 310 + 200, 50, sp > (i + 1) / 3 ? 1 : 0, MUT); });
      const gap = lerp(0, 260, sp); dbIcon(480 - 80 - gap / 2, 170, 'orders DB', { stroke: ACC, s: 0.9 }); dbIcon(480 + 80 + gap / 2, 170, 'inventory DB', { stroke: INFO, s: 0.9 });
      card(300, 320, 140, 44, { rx: 8, stroke: ACC, sw: 2, text: 'outbox', mono: true, fs: 15, fw: 800, color: ACC, s: pop(u, 1.5) });
      card(520, 320, 120, 44, { rx: 8, stroke: INK, sw: 2, text: 'CDC', mono: true, fs: 15, fw: 800, s: pop(u, 1.7) });
      card(740, 320, 160, 44, { rx: 8, stroke: INFO, sw: 2, text: 'read store', mono: true, fs: 15, fw: 800, color: INFO, s: pop(u, 1.9) });
      for (let i = 0; i < 3; i++) dot([[370, 320], [460, 320], [580, 320], [660, 320]], seg(u, 2.0 + i * 0.15, 2.6 + i * 0.15), ACC, 6); return; }
    if (k === 5) {
      el('rect', { x: 60, y: 50, width: 840, height: 300, rx: 10, fill: INK });
      mono(84, 86, '=# SELECT usename, query FROM pg_stat_activity', { 'font-size': 15, fill: PANEL });
      mono(84, 110, "   WHERE query LIKE '%FROM products%';", { 'font-size': 15, fill: PANEL });
      mono(84, 150, ' usename       | query', { 'font-size': 15, fill: 'var(--term)', opacity: fade(u, 0.6) });
      mono(84, 172, '---------------+---------------------------------', { 'font-size': 15, fill: 'var(--term)', opacity: fade(u, 0.6) });
      [['inventory_svc', 'SELECT stock FROM products …', 1], ['report_job', 'SELECT * FROM products …', 1], ['orders_svc', 'SELECT name FROM products …', 0]].forEach(([n, q, ext], i) => {
        const op = fade(u, 0.9 + i * 0.3); mono(84, 200 + i * 28, ' ' + n.padEnd(14) + '| ' + q, { 'font-size': 15, fill: ext ? '#fca5a5' : 'var(--term)', opacity: op }); });
      tx(480, 390, '예시 결과 · 순간 사진이므로 여러 번 찍거나 pg_stat_statements로 누적을 본다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 6) {
      [['"JOIN이 필요해"', 'read store 비정규화'], ['"트랜잭션이 필요해"', 'Saga 또는 도메인 재설계'], ['"성능이 떨어져"', '캐시 + 알맞은 API 모양']].forEach(([a, b], i) => {
        const y = 100 + i * 100; card(230, y, 300, 60, { rx: 30, stroke: BAD, sw: 2, s: pop(u, 0.2 + i * 0.4), text: a, fs: 16, fw: 700, color: BAD });
        grow(390, y, 520, y, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), GOOD);
        card(680, y, 300, 60, { rx: 10, stroke: GOOD, sw: 2.4, s: pop(u, 0.9 + i * 0.4), text: b, fs: 16, fw: 800, color: GOOD }); }); return; }
    // k7: 회복
    [['orders', ACC], ['inventory', INFO], ['catalog', INK]].forEach(([n, col], i) => { const x = 180 + i * 300;
      zone(x - 110, 70, 220, 260, null, { stroke: col });
      svc(x, 120, n, { col, w: 140 }); dbIcon(x, 230, null, { stroke: col, s: 0.75 }); });
    pill(180, 330, 'ALTER TABLE', WARN, pop(u, 0.4), { mono: true, fs: 14 });
    [480, 780].forEach((x, i) => { check(x, 300, 12, pop(u, 1.0 + i * 0.3)); });
    tx(480, 390, '스키마 변경은 내 팀 일 · owner 외에는 SELECT 권한도 없다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  // ---------- 5. 처방전 · 6단계 로드맵 ----------
  const STG = [['진단', 0, 0.5, '1-2주', ['의존성 그래프 (Kiali, OTel)', '배포 빈도 · 리드타임 측정', 'DB 직접 접근 SQL 감사']],
    ['응급 처방', 0.5, 1.5, '1개월', ['모든 외부 호출에 timeout', '깊은 체인에 서킷브레이커', 'N+1 핫스팟은 Batch']],
    ['DB 정리', 1.5, 4.5, '2-3개월', ['테이블별 owner 지정', '외부 SELECT → API', '점진적 권한 분리']],
    ['API 계약', 1.5, 4.5, '병행', ['OpenAPI/Protobuf 표준화', 'consumer-driven contract test', 'breaking change 정책']],
    ['Async 전환', 4.5, 8.5, '3-4개월', ['비핵심 동작은 이벤트로', 'Outbox + Kafka', 'Saga가 필요한 곳 식별']],
    ['회복 점검', 8.5, 10, '지속', ['카오스 엔지니어링', 'Game Day 정례화', '회고 → 자동화 보강']]];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) {
      const cols = [['안티패턴', 140], ['1차 처방', 370], ['2차 처방', 590], ['도구', 800]];
      const rows = [['Distributed Monolith', 'Bounded Context 재정의', 'API 계약 안정화', 'DDD · Pact'], ['Chatty', 'Batch API', 'BFF + 캐시', 'gRPC · Redis'], ['Cascading', 'Timeout + CB', 'Bulkhead + Async', 'resilience4j'], ['Shared DB', 'Owner 명시', 'DB 분리 + 이벤트', 'Outbox · Debezium']];
      cols.forEach(([h, x]) => tx(x, 66, h, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT }));
      rows.forEach((r, i) => { const y = 112 + i * 70; r.forEach((v, j) => { const f = pop(u, 0.2 + i * 0.3 + j * 0.12);
        card(cols[j][1], y, j === 0 ? 210 : 200, 52, { rx: 8, stroke: j === 0 ? BAD : j === 3 ? GRID : GOOD, sw: 2, s: f, fill: j === 0 ? 'var(--badbg)' : null });
        tx(cols[j][1], y + 5, v, { 'text-anchor': 'middle', 'font-size': j === 0 ? 14 : 14.5, 'font-weight': j === 0 ? 800 : 600, fill: j === 0 ? BAD : INK, opacity: fade(u, 0.3 + i * 0.3 + j * 0.12) }); }); });
      tx(480, 405, '안티패턴은 같이 오므로 처방도 세트로', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k <= 6) {
      const X = (m) => 250 + m * 62, cur = k - 1;
      [0, 2, 4, 6, 8, 10].forEach((m) => { el('line', { x1: X(m), y1: 50, x2: X(m), y2: 316, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(X(m), 44, m + '개월', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      STG.forEach(([n, a, b, d], i) => { if (i > cur) return; const y = 76 + i * 44, g = i === cur ? E(u, 0.2, 1.0) : 1, on = i === cur, col = i === 3 ? INFO : i === 5 ? GOOD : ACC;
        mono(60, y + 5, 'Stage ' + (i + 1), { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(140, y + 5, n, { 'font-size': 15, 'font-weight': on ? 800 : 600 });
        el('rect', { x: X(a), y: y - 14, width: (X(b) - X(a)) * g - 2, height: 28, rx: 5, fill: col, opacity: on ? 0.9 : 0.4, 'stroke-dasharray': i === 3 ? '6 4' : null, stroke: i === 3 ? INFO : 'none' });
        if (i === 5 && g > 0.9) grow(X(b) - 2, y, X(b) + 26, y, 1, GOOD);
        mono(X(b) + (i === 5 ? 32 : 8), y + 5, d, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, i === cur ? 0.9 : 0) }); });
      const it = STG[cur][4]; it.forEach((s, j) => { const x = 80 + j * 290; check(x, 360, 9, pop(u, 1.1 + j * 0.3)); tx(x + 18, 366, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2 + j * 0.3) }); });
      if (cur === 2) tx(560, 405, '가장 오래 걸리므로 가장 먼저 시작한다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) });
      if (cur === 0) tx(560, 405, '막대 길이는 문서 기간의 상한, 순서대로 잇는다고 본 그림', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k7: DORA
    [['Deployment Frequency', '배포 빈도', '↑'], ['Lead Time for Changes', '변경 리드타임', '↓'], ['MTTR', '복구 시간', '↓'], ['Change Failure Rate', '변경 실패율', '↓']].forEach(([a, b, d], i) => {
      const x = 130 + i * 233, s = pop(u, 0.2 + i * 0.3); card(x, 180, 210, 170, { rx: 12, stroke: ACC, sw: 2.2, s });
      tx(x, 136, b, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) });
      tx(x, 162, a, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) });
      tx(x, 230, d, { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6 + i * 0.3) }); });
    tx(480, 330, 'DORA 4지표로 개선을 증명한다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.8) });
    tx(480, 362, '다음 장 V-2-2의 48항목 체크리스트로 이어진다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: '분산 모놀리스가 생기는 가장 흔한 뿌리는 무엇인가?',
      o: ['서비스 수가 너무 적어서', '도메인이 아니라 DB 테이블 단위로 서비스를 나눠서', '컨테이너를 쓰지 않아서'], a: 1,
      why: '테이블 단위로 자르면 경계가 아니라 저장소만 쪼갠 것이다. 그래서 배포와 장애가 계속 함께 움직인다.' },
    { q: '원격 호출 하나가 30ms일 때 items 30개를 루프 안에서 하나씩 조회하면 catalog 구간은 얼마인가?',
      o: ['30ms', '900ms', '40ms'], a: 1,
      why: '30 × 30ms = 900ms다. get_many로 한 번에 모으면 40ms로 줄어든다.' },
    { q: '서킷브레이커(5회 실패 → 30초 차단)가 열린 뒤 6번째 결제 호출은 어떻게 되는가?',
      o: ['2초를 기다린 뒤 PaymentTimeout이 난다', 'payments를 부르지 않고 즉시 CircuitBreakerError가 난다', '30초 동안 기다린다'], a: 1,
      why: '열림 상태에서는 호출 자체를 막아 즉시 실패시킨다. 실제로 돌려 보니 6~8번째 호출은 0초에 끝났다.' },
    { q: '공유 테이블을 분리할 때 가장 먼저 하는 일은 무엇인가?',
      o: ['별도 DB 인스턴스로 옮긴다', '테이블마다 owner 서비스를 하나 정한다', 'Outbox와 CDC를 붙인다'], a: 1,
      why: '물리 분리 전에 소유권부터 선언한다. 그다음 읽기를 API로 옮기고 쓰기 권한을 끊는다.' },
    { q: '6단계 로드맵에서 timeout·서킷브레이커·Batch를 넣는 단계는 무엇인가?',
      o: ['Stage 2 응급 처방', 'Stage 3 DB 정리', 'Stage 5 Async 전환'], a: 0,
      why: '한 달 안에 끝낼 수 있는 지혈이라 근본 처방보다 먼저 한다.' },
  ];
  const summary = [
    '서비스를 테이블 단위로 쪼개면 배포와 장애가 함께 움직이는 분산 모놀리스가 된다.',
    '루프 안 원격 호출은 30개면 900ms를 쓴다. Batch로 모으면 40ms가 된다.',
    '깊은 동기 체인은 기다림에 상한을 두고, 막히면 빨리 실패하고, 느린 의존성은 칸을 나눠 가둔다.',
    '공유 DB는 owner 지정, 읽기 API 전환, 쓰기 권한 회수, 물리 분리 순서로 푼다.',
  ];
  const review = [
    { q: '외부 결제가 5초씩 느려지자 상품 조회까지 503이 났다. 먼저 의심할 것은?',
      o: ['상품 DB 인덱스', 'timeout 없는 동기 결제 호출이 worker를 다 잡은 것', 'CDN 캐시 설정'], a: 1,
      why: '결제를 기다리는 요청이 worker를 붙잡으면 새 요청을 받을 자리가 없다. 상한과 Bulkhead가 먼저다.' },
    { q: 'inventory 팀이 배포하지 않았는데 orders 팀 배포 직후 inventory가 5XX를 냈다. 두 안티패턴 중 어느 쪽 증상인가?',
      o: ['Chatty Services', 'Shared Database', 'Cascading Failure만'], a: 1,
      why: 'orders의 ALTER TABLE이 inventory의 ORM 매핑을 깨뜨린 모양이다. 스키마를 공유하면 남의 DDL이 내 배포가 된다.' },
    { q: '주문 요약 API가 990ms 걸린다. 코드를 보니 catalog를 30번 부른다. 고칠 순서로 알맞은 것은?',
      o: ['get_many로 모은 뒤 BFF에서 gather로 병렬화한다', 'gRPC로만 바꾼다', '서버를 두 배로 늘린다'], a: 0,
      why: 'Batch로 990ms가 130ms가 되고, 서로 기다릴 필요 없는 호출을 병렬로 돌리면 70ms가 된다. gRPC는 그 뒤에 남은 몫을 줄인다.' },
  ];

  R.page({ title: '안티패턴 진단', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
