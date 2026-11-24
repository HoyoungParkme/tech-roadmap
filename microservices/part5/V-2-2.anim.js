/* V-2-2 MSA 출항 체크리스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 오른쪽: 네 축 × 12칸 점수판(페이지 데이터 scores 를 앞 beat 값에서 이어 채운다). 왼쪽: 그 beat 의 점검 항목이 가리키는 실제 대상
 *   (경계·팀·배포 정렬, 의존성 그래프와 순환, 게이트웨이·디스커버리, 계약 테스트, mTLS·호출 깊이, Outbox lag, RPO/RTO, trace 폭포수, 점수 구간).
 * 점수는 페이지가 정한 예시 팀의 값이다(축마다 10/12, 합계 40/48). 이벤트 이름·팀 수 같은 그림 속 예는 "예시"로 적었다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, clock, axes, line, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const AX = [['boundaries', '경계'], ['communication', '통신'], ['data', '데이터'], ['operations', '운영']];
  const T = (x, y, s, a) => tx(x, y, s, Object.assign({ 'font-size': 15 }, a || {}));
  const svc = (cx, cy, name, o) => { o = o || {}; return card(cx, cy, o.w || 104, o.h || 44, { rx: 10, stroke: o.col || INK, sw: 2.2, fill: o.fill, s: o.s, op: o.op, text: name, mono: o.mono !== false, fs: o.fs || 14.5, fw: 800, color: o.col || INK }); };

  // ---------- 오른쪽 점수판 ----------
  function board(c, act) { const b = c.beat, p = c.prev || {}; let sum = 0;
    el('rect', { x: 628, y: 34, width: 316, height: 372, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    AX.forEach(([key, name], i) => { const y = 74 + i * 78, v = tween(p.scores ? p.scores[key] : null, b.scores[key], c.u), on = key === act; sum += v;
      T(644, y, name, { 'font-weight': 800, fill: on ? ACC : MUT });
      mono(930, y, Math.round(v) + ' / 12', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: on ? ACC : INK });
      for (let j = 0; j < 12; j++) { const f = clamp(v - j);
        el('rect', { x: 644 + j * 24, y: y + 12, width: 20, height: 26, rx: 4, fill: SOFT });
        if (f > 0) el('rect', { x: 644 + j * 24, y: y + 12, width: 20, height: 26, rx: 4, fill: on ? ACC : GOOD, opacity: 0.25 + 0.65 * f }); } });
    T(644, 392, '합계', { 'font-weight': 700, fill: MUT });
    mono(930, 392, Math.round(sum) + ' / 48', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end' }); }
  function list(x, y, items, u, o) { o = o || {}; items.forEach((s, i) => { const yy = y + i * (o.gap || 40), a = (o.at || 0.3) + i * (o.step || 0.25);
    if (o.bad) cross(x + 8, yy - 5, 8, pop(u, a)); else if (o.warn) { el('path', { d: `M${x},${yy + 4} L${x + 9},${yy - 13} L${x + 18},${yy + 4} Z`, fill: WARN, opacity: fade(u, a) }); } else check(x + 8, yy - 5, 9, pop(u, a));
    T(x + 28, yy, s, { 'font-size': o.fs || 15.5, 'font-weight': 700, opacity: fade(u, a + 0.05) }); }); }

  // ---------- 1. 경계 ----------
  function s1(t, c) { const { k, u } = c; board(c, 'boundaries');
    if (k === 0) {
      const BC = ['주문', '결제', '재고'];
      ['코드', '팀', '배포'].forEach((r, ri) => T(40, 120 + ri * 90, r, { 'font-weight': 700, fill: MUT }));
      BC.forEach((n, i) => { const x = 170 + i * 150, s = pop(u, 0.2 + i * 0.3);
        zone(x - 62, 70, 124, 290, n + ' 컨텍스트', { stroke: ACC, op: fade(u, 0.1 + i * 0.3) });
        svc(x, 116, n.length ? 'repo' : '', { s, w: 90 });
        if (s > 0.1) person(x, 210, null, { s: s * 0.8 });
        card(x, 300, 90, 36, { rx: 8, stroke: INK, sw: 2, text: 'CI/CD', mono: true, fs: 14, s: pop(u, 0.5 + i * 0.3) }); });
      grow(232, 116, 258, 116, E(u, 1.6, 1.9), ACC); grow(232, 130, 408, 130, E(u, 1.8, 2.1), ACC);
      T(320, 390, '코드·팀·배포가 같은 선에서 갈라진다 · 의존은 한 방향(DAG)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 1) {
      T(40, 70, '이벤트 카탈로그 (이름은 예시)', { 'font-weight': 800 });
      [['OrderPlaced', '주문'], ['PaymentCompleted', '결제'], ['StockReserved', '재고']].forEach(([e, o], i) => { const y = 120 + i * 64, s = pop(u, 0.3 + i * 0.3);
        card(220, y, 340, 50, { rx: 8, stroke: INK, sw: 2, s }); mono(70, y + 5, e, { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.3) });
        pill(470, y, 'owner: ' + o, ACC, pop(u, 1.2 + i * 0.25), { fs: 13.5 }); });
      list(40, 340, ['API는 도메인 언어로', '내부 구현이 밖으로 새지 않는다'], u, { at: 1.9, step: 0.2, gap: 32, fs: 14.5 }); return; }
    if (k === 2) {
      T(40, 70, '팀 4개일 때 (예시)', { 'font-weight': 800 });
      for (let i = 0; i < 4; i++) person(80 + i * 64, 130, null, { s: pop(u, 0.2 + i * 0.1) });
      const X = (n) => 60 + n * 38; for (let n = 0; n <= 14; n += 2) mono(X(n), 300, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      el('rect', { x: X(0), y: 230, width: (X(12) - X(0)) * E(u, 0.6, 1.4), height: 40, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.5 });
      el('rect', { x: X(12), y: 230, width: (X(14) - X(12)) * E(u, 1.4, 1.7), height: 40, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 1.5 });
      el('line', { x1: X(8), y1: 220, x2: X(8), y2: 280, stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) });
      mono(X(8), 214, '×2 = 8', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(X(12), 214, '×3 = 12', { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      T(60, 330, '서비스 수 상한 · 넘으면 운영이 먼저 무너진다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      T(60, 370, 'Conway의 법칙: 시스템은 조직 구조를 닮는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3 || k === 5) {
      const N = [[110, 120, 'gateway'], [280, 90, 'orders'], [280, 230, 'payments'], [460, 120, 'inventory'], [460, 270, 'notify']];
      const Ed = [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4]], cyc = k === 5;
      if (cyc) Ed.push([4, 1]);
      Ed.forEach(([a, b2], i) => { const A = N[a], B2 = N[b2], isC = cyc && i === 5, cut = isC && u > 1.4;
        if (!(cut && u > 1.8)) grow(A[0] + (B2[0] - A[0]) * 0.2, A[1] + (B2[1] - A[1]) * 0.2, B2[0] - (B2[0] - A[0]) * 0.2, B2[1] - (B2[1] - A[1]) * 0.2, k === 3 ? E(u, 0.4 + i * 0.2, 0.8 + i * 0.2) : 1, isC ? BAD : MUT, { dash: cut ? '4 4' : null, sw: isC ? 3 : 2.2 }); });
      N.forEach(([x, y, n], i) => svc(x, y, n, { s: k === 3 ? pop(u, 0.1 + i * 0.12) : 1, w: 112, col: cyc && (i === 1 || i === 4) && u < 1.8 ? BAD : INK }));
      if (k === 3) { for (let i = 0; i < 4; i++) dot([[110, 120], [280, 90], [460, 120], [460, 270]], seg(u, 1.0 + i * 0.25, 2.2 + i * 0.25), ACC, 5);
        T(40, 360, 'Kiali가 실제 호출로 그린 의존성 그래프', { 'font-weight': 700, opacity: fade(u, 1.6) }); T(40, 388, 'C4 · EventStorming으로 그린 그림과 맞춰 본다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
      if (u > 1.8) cross(380, 196, 12, pop(u, 1.8));
      ['그래프 그리기', '순환 끊기', '팀:서비스 1:1', '점진 분해'].forEach((s, i) => pill(80 + i * 148, 370, (i + 1) + '. ' + s, i === 1 ? BAD : ACC, pop(u, 0.3 + i * 0.25), { fs: 13.5 }));
      T(40, 56, 'notify → orders가 순환을 만든다', { 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) }); return; }
    // k4 함정
    [['DB 테이블 기준으로 분해', '결국 분산 모놀리스'], ['모든 도메인을 한꺼번에 MSA로', '운영 폭발'], ['팀은 그대로, 서비스만 분해', '책임이 모호해진다']].forEach(([a, d], i) => { const y = 100 + i * 92, s = pop(u, 0.3 + i * 0.4);
      card(310, y, 540, 70, { rx: 12, stroke: BAD, sw: 2.2, s, fill: 'var(--badbg)' }); cross(70, y, 11, s);
      T(100, y - 4, a, { 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) }); T(100, y + 20, d, { 'font-size': 14, fill: BAD, opacity: fade(u, 0.4 + i * 0.4) }); }); }

  // ---------- 2. 통신 ----------
  function s2(t, c) { const { k, u } = c; board(c, 'communication');
    if (k === 0) {
      svc(90, 120, 'orders'); svc(470, 120, 'payments');
      el('line', { x1: 145, y1: 120, x2: 415, y2: 120, stroke: GRID, 'stroke-width': 3 });
      clock(220, 70, 18, E(u, 0.3, 1.0), WARN); mono(244, 76, 'timeout', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.4) });
      card(370, 70, 64, 30, { rx: 6, stroke: BAD, sw: 2, text: 'CB', mono: true, fs: 14, fw: 800, color: BAD, s: pop(u, 0.7) });
      T(40, 210, '재시도: 멱등 API 에만, 간격은 jitter', { 'font-weight': 800, opacity: fade(u, 1.1) });
      const R4 = [0, 1.0, 2.7, 6.1]; R4.forEach((v, i) => { const x = 60 + v * 70; el('circle', { cx: x, cy: 260, r: 9 * pop(u, 1.3 + i * 0.2), fill: i === 3 ? GOOD : WARN }); mono(x, 290, i === 0 ? '1차' : '+' + i, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3 + i * 0.2) }); });
      sub(300, 320, '간격은 모양만 보인 예시', fade(u, 2.0));
      T(40, 380, 'Sync/Async 선택 기준을 먼저 적어 둔다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 1) {
      person(60, 200, '클라이언트', {});
      card(220, 200, 130, 120, { rx: 12, stroke: ACC, sw: 2.6, s: pop(u, 0.2) }); T(220, 170, 'API Gateway', { 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      pill(220, 205, '인증', ACC, pop(u, 0.5), { fs: 13.5 }); pill(220, 240, 'rate limit', ACC, pop(u, 0.7), { fs: 13.5 });
      grow(90, 200, 152, 200, E(u, 0.3, 0.6), MUT);
      card(400, 80, 200, 50, { rx: 8, stroke: INFO, sw: 2, text: 'k8s DNS / Consul', fs: 14.5, fw: 800, color: INFO, s: pop(u, 1.0) });
      ['orders', 'payments', 'inventory'].forEach((n, i) => { svc(470, 180 + i * 70, n, { w: 120, s: pop(u, 1.2 + i * 0.15) }); grow(288, 200, 408, 180 + i * 70, E(u, 1.5 + i * 0.1, 1.9 + i * 0.1), MUT); });
      mono(330, 128, 'orders.shop.svc', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 1.4) });
      T(40, 400, '주소 찾기도, 입구 정책도 한 방식으로', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) {
      svc(90, 130, 'consumer', { w: 120 }); svc(500, 130, 'producer', { w: 120 });
      card(295, 130, 150, 80, { rx: 8, stroke: ACC, sw: 2.4, s: pop(u, 0.3) }); mono(295, 122, 'contract', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) }); mono(295, 146, 'v1 · OpenAPI', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
      grow(150, 130, 218, 130, E(u, 0.5, 0.8), ACC); grow(372, 130, 438, 130, E(u, 0.7, 1.0), ACC);
      T(40, 240, 'producer가 필드를 지우면', { 'font-weight': 700, opacity: fade(u, 1.1) });
      card(200, 300, 300, 56, { rx: 10, stroke: BAD, sw: 2.4, s: pop(u, 1.4), fill: 'var(--badbg)' }); cross(80, 300, 11, pop(u, 1.5));
      mono(110, 306, 'CI · Pact 검증 실패', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      T(40, 390, '배포 전에 깨져야 API가 진짜 계약이 된다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3) {
      const D = ['gw', 'a', 'b', 'c', 'd'];
      D.forEach((n, i) => { const x = 70 + i * 120, bad = i === 4; svc(x, 130, n, { w: 70, col: bad ? BAD : INK, s: pop(u, 0.2 + i * 0.2) });
        if (i < 4) { grow(x + 36, 130, x + 84, 130, E(u, 0.3 + i * 0.2, 0.5 + i * 0.2), i === 3 ? BAD : MUT); lock(x + 60, 100, true, GOOD, pop(u, 1.1 + i * 0.1)); } });
      el('line', { x1: 70, y1: 190, x2: 430, y2: 190, stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.5) }); mono(250, 214, '깊이 3-4단까지', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(550, 214, '5단', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      T(40, 300, '자물쇠 = 메시가 자동으로 거는 mTLS', { 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      T(40, 340, '동기 호출은 단마다 실패 확률이 곱해진다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 4) {
      list(40, 90, ['카오스로 지연 주입 → timeout이 실제로 자르나', 'contract test가 CI에서 깨지나', 'Kiali / OTel로 호출 그래프 확인', '평문 요청 → mTLS가 거부하나'], u, { gap: 52 });
      const f = E(u, 1.4, 2.2); el('rect', { x: 60, y: 320, width: 480, height: 20, rx: 6, fill: SOFT }); el('rect', { x: 60, y: 320, width: 480 * f, height: 20, rx: 6, fill: WARN, opacity: 0.7 });
      el('line', { x1: 60 + 480 * 0.4, y1: 310, x2: 60 + 480 * 0.4, y2: 350, stroke: BAD, 'stroke-width': 3 }); mono(60 + 480 * 0.4 + 8, 370, '여기서 잘려야 통과', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); return; }
    if (k === 5) { list(40, 100, ['timeout 없는 외부 호출', '동기 호출 5단 이상', 'consumer·producer가 다른 OpenAPI', '라이브러리로만 묶인 암묵적 계약'], u, { warn: true, gap: 60, step: 0.35 });
      T(40, 370, '하나라도 보이면 그 자리가 다음 사고 자리다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    // k6 선택 권고
    [['짧은 응답이 중요', 'gRPC', 'sync'], ['비즈니스 후속 작업', '이벤트', 'pub/sub'], ['응답이 필요 없음', '큐', 'fire-and-forget']].forEach(([a, b2, d], i) => { const y = 100 + i * 100;
      T(40, y + 5, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) });
      grow(230, y, 340, y, E(u, 0.4 + i * 0.4, 0.8 + i * 0.4), ACC);
      card(450, y, 190, 60, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 0.6 + i * 0.4) }); T(450, y - 2, b2, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7 + i * 0.4) }); mono(450, y + 20, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.7 + i * 0.4) });
      }); }

  // ---------- 3. 데이터 ----------
  function s3(t, c) { const { k, u } = c; board(c, 'data');
    if (k === 0) {
      ['orders', 'payments', 'inventory'].forEach((n, i) => { const x = 110 + i * 190; svc(x, 100, n, { w: 120, s: pop(u, 0.2 + i * 0.2) }); dbIcon(x, 230, null, { s: 0.7 * pop(u, 0.4 + i * 0.2) }); grow(x, 124, x, 190, E(u, 0.6 + i * 0.2, 0.9 + i * 0.2), MUT); });
      el('line', { x1: 160, y1: 110, x2: 280, y2: 220, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 5', opacity: fade(u, 1.2) }); lock(226, 165, true, BAD, pop(u, 1.6));
      T(40, 340, '남의 DB는 권한으로 막는다', { 'font-weight': 800, opacity: fade(u, 1.8) }); T(40, 370, '선언만으로는 지켜지지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) {
      svc(90, 110, 'orders'); dbIcon(90, 240, null, { s: 0.75 });
      card(250, 240, 140, 56, { rx: 8, stroke: ACC, sw: 2.4, text: 'outbox 테이블', fs: 14.5, fw: 800, color: ACC, s: pop(u, 0.3) });
      mono(170, 300, '같은 트랜잭션', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      card(420, 240, 120, 50, { rx: 8, stroke: INK, sw: 2.2, text: 'Relay/CDC', mono: true, fs: 14, fw: 800, s: pop(u, 0.8) });
      card(540, 120, 100, 46, { rx: 8, stroke: INFO, sw: 2.2, text: 'broker', mono: true, fs: 14, fw: 800, color: INFO, s: pop(u, 1.0) });
      for (let i = 0; i < 3; i++) dot([[320, 240], [360, 240], [480, 240], [540, 143]], seg(u, 1.0 + i * 0.3, 2.0 + i * 0.3), ACC, 6);
      T(40, 380, 'DB 커밋과 이벤트 발행이 함께 남는다 · Saga 대상은 따로 식별', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) {
      dbIcon(90, 140, '쓰기 DB', { s: 0.8 }); card(450, 140, 150, 60, { rx: 10, stroke: INFO, sw: 2.4, text: 'read store', mono: true, fs: 15, fw: 800, color: INFO });
      for (let i = 0; i < 4; i++) dot([[140, 140], [375, 140]], ((t * 0.35 + i / 4) % 1), ACC, 5);
      mono(260, 118, '이벤트 · 지연 있음', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle' });
      browserish(); function browserish() { R.browser(300, 300, 300, 110, null, { s: pop(u, 0.9) }); T(300, 322, '주문 반영 중이에요', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) }); }
      T(40, 400, 'Eventual Consistency는 UI 문구까지 바꾼다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3) {
      const X = (h) => 300 + h * 60; el('line', { x1: 60, y1: 200, x2: 580, y2: 200, stroke: INK, 'stroke-width': 2.5 });
      el('rect', { x: X(-3), y: 170, width: (X(0) - X(-3)) * E(u, 0.4, 1.0), height: 26, rx: 4, fill: BAD, opacity: 0.6 });
      el('rect', { x: X(0), y: 204, width: (X(4) - X(0)) * E(u, 1.0, 1.6), height: 26, rx: 4, fill: INFO, opacity: 0.6 });
      bolt(X(0), 200); function bolt(x, y) { el('path', { d: `M${x + 4},${y - 34} L${x - 10},${y - 4} L${x},${y - 4} L${x - 6},${y + 22} L${x + 12},${y - 10} L${x + 2},${y - 10} Z`, fill: WARN, stroke: INK, 'stroke-width': 1.2 }); }
      mono(X(-3), 160, '마지막 백업', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) }); mono(X(-1.5), 188, 'RPO', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(X(2), 222, 'RTO', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      T(60, 290, 'RPO = 잃어도 되는 데이터 양 · RTO = 다시 서기까지 시간', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      T(60, 330, '둘 다 숫자로 적고, 스키마 변경은 Flyway/Alembic으로', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) });
      T(60, 370, '복원해 보지 않은 백업은 백업이 아니다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) }); return; }
    if (k === 4) {
      el('rect', { x: 50, y: 70, width: 520, height: 150, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      [['name', '홍길동', '***'], ['phone', '010-1234-5678', '***-****-5678'], ['email', 'a@b.com', 'a***@b.com']].forEach(([f, v, m], i) => { const y = 108 + i * 38, mk = u > 0.8 + i * 0.25;
        mono(70, y, f, { 'font-size': 15, 'font-weight': 700, fill: MUT }); mono(200, y, mk ? m : v, { 'font-size': 15, 'font-weight': 700, fill: mk ? GOOD : INK }); if (mk) lock(530, y - 6, true, GOOD, pop(u, 0.8 + i * 0.25)); });
      sub(310, 238, '값은 예시', 1);
      list(50, 290, ['보존 기간이 지나면 지운다 (GDPR/PIPA)', '캐시는 TTL·Tag로 무효화한다'], u, { at: 1.6, gap: 40, fs: 15 }); return; }
    if (k === 5) {
      const ax = axes(80, 80, 460, 220, { x: [0, 10], y: [0, 8], xt: [0, 5, 10], yt: [0, 5], xl: '분 (예시 신호)', yl: 'Outbox lag (분)' });
      el('line', { x1: ax.X(0), y1: ax.Y(5), x2: ax.X(10), y2: ax.Y(5), stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '7 5' });
      line(ax, [[0, 0.5], [3, 0.6], [5, 2], [7, 4.5], [8, 5.6], [10, 7]], E(u, 0.2, 1.6), WARN, { sw: 3 });
      if (u > 1.4) { el('circle', { cx: ax.X(7.6), cy: ax.Y(5), r: 9 * pop(u, 1.4), fill: BAD }); T(ax.X(7.6) - 10, ax.Y(5) - 18, '알람', { 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); }
      T(60, 380, '조용한 유실이 가장 위험 · row count 비교와 복원 리허설도', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 6) {
      el('line', { x1: 70, y1: 150, x2: 560, y2: 150, stroke: INK, 'stroke-width': 3 });
      [['강한 일관성', '모놀리스 트랜잭션', 90], ['Eventual 수용', 'MSA + Outbox', 540]].forEach(([a, b2, x], i) => { el('circle', { cx: x, cy: 150, r: 10 * pop(u, 0.2 + i * 0.4), fill: i ? ACC : INFO });
        T(x, 120, a, { 'text-anchor': i ? 'end' : 'start', 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.4) }); T(x, 190, b2, { 'text-anchor': i ? 'end' : 'start', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
      card(315, 290, 360, 64, { rx: 12, stroke: WARN, sw: 2.4, s: pop(u, 1.3), text: '둘 다 필요하면 → 도메인 재정의', fs: 16, fw: 800, color: WARN });
      T(315, 380, '나누지 않는 것도 정답일 수 있다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); return; }
    list(50, 120, ['DB 변경이 다른 팀과 분리됐다', 'owner 외에는 권한이 없다', '이벤트로 채워지는 read store가 분명하다'], u, { gap: 70, step: 0.4, fs: 17 }); }

  // ---------- 4. 운영 ----------
  function s4(t, c) { const { k, u } = c; board(c, 'operations');
    if (k === 0) {
      [['SLO / SLI', 'Prometheus로 측정'], ['Error Budget', '예산이 배포를 정한다'], ['Multi-burn-rate 알람', 'Fast · Slow · Ticket']].forEach(([a, d], i) => { const y = 100 + i * 90, s = pop(u, 0.2 + i * 0.4);
        card(300, y, 500, 70, { rx: 12, stroke: ACC, sw: 2.2, s }); T(80, y - 4, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.4) }); T(80, y + 20, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
      T(50, 390, 'SLO가 없으면 "괜찮다"의 기준도 없다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 1) {
      const SP = [['gateway', 0, 220], ['orders', 20, 180], ['payments', 60, 120], ['inventory', 130, 30]], X = (ms) => 160 + ms * 1.8;
      mono(40, 70, 'trace_id=4bf9…', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      SP.forEach(([n, a, d], i) => { const y = 110 + i * 46, f = E(u, 0.3 + i * 0.3, 0.8 + i * 0.3);
        mono(150, y + 5, n, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: MUT });
        el('rect', { x: X(a), y: y - 12, width: Math.max(0, (X(a + d) - X(a)) * f), height: 24, rx: 4, fill: i === 2 ? WARN : INFO, opacity: 0.8 }); });
      el('rect', { x: 40, y: 310, width: 540, height: 40, rx: 6, fill: INK, opacity: fade(u, 1.6) });
      mono(56, 336, '{"level":"error","trace_id":"4bf9…","svc":"payments"}', { 'font-size': 13.5, fill: PANEL, opacity: fade(u, 1.7) });
      T(40, 390, '로그와 span이 같은 trace_id로 이어진다 (값은 예시)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) {
      ['Test', 'Build', 'Deploy'].forEach((s, i) => { card(90 + i * 150, 90, 120, 44, { rx: 8, stroke: INK, sw: 2.2, text: s, mono: true, fs: 15, fw: 800, s: pop(u, 0.2 + i * 0.2) }); if (i < 2) grow(150 + i * 150, 90, 180 + i * 150, 90, E(u, 0.3 + i * 0.2, 0.5 + i * 0.2), MUT); });
      const ax = axes(80, 170, 440, 150, { x: [0, 10], y: [0, 4], xl: '배포 후 (분, 예시 신호)', yl: '오류율' });
      el('line', { x1: ax.X(0), y1: ax.Y(2), x2: ax.X(10), y2: ax.Y(2), stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      line(ax, [[0, 0.4], [3, 0.5], [4, 2.8], [5, 3.1], [6, 0.5], [10, 0.4]], E(u, 0.8, 2.0), WARN, { sw: 2.8 });
      if (u > 1.6) { pill(ax.X(5.5), ax.Y(3.6), 'auto-rollback', GOOD, pop(u, 1.6), { fs: 13.5 }); }
      T(40, 400, 'Rolling · Blue-Green · Canary 중 고르고, 메트릭이 먼저 되돌린다', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) {
      const cx = 200, cy = 200; for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + i * Math.PI / 2; person(cx + 100 * Math.cos(a), cy + 90 * Math.sin(a), null, { s: pop(u, 0.2 + i * 0.2), stroke: i === Math.floor(t * 1.5) % 4 ? ACC : INK }); }
      T(cx, cy + 6, 'on-call 순번', { 'text-anchor': 'middle', 'font-weight': 800 });
      card(470, 130, 170, 60, { rx: 8, stroke: INK, sw: 2.2, text: 'Runbook (최신)', fs: 15, fw: 800, s: pop(u, 1.0) });
      card(470, 220, 170, 50, { rx: 8, stroke: WARN, sw: 2.2, text: '카오스 · 분기 1회', fs: 14.5, fw: 700, color: WARN, s: pop(u, 1.3) });
      card(470, 300, 170, 50, { rx: 8, stroke: INFO, sw: 2.2, text: 'DR · Game Day', fs: 14.5, fw: 700, color: INFO, s: pop(u, 1.6) });
      T(40, 400, '한 명에게 몰린 on-call은 휴가가 곧 위험이다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 4) {
      [['배포 빈도', 'Deployment Frequency'], ['리드타임', 'Lead Time for Changes'], ['MTTR', 'Mean Time to Restore'], ['변경 실패율', 'Change Failure Rate']].forEach(([a, d], i) => { const x = 160 + (i % 2) * 300, y = 120 + Math.floor(i / 2) * 140, s = pop(u, 0.2 + i * 0.3);
        card(x, y, 270, 110, { rx: 12, stroke: ACC, sw: 2.2, s }); T(x, y - 6, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) }); T(x, y + 22, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      T(310, 400, 'MSA 전환이 이득인지 보여 주는 숫자', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { list(40, 100, ['알람은 많은데 의미 있는 건 적다', 'runbook이 낡아 쓸 수 없다', 'on-call이 한 명에게 몰렸다', '카오스를 한 번 하고 끝냈다'], u, { bad: true, gap: 62, step: 0.35 }); return; }
    ['핵심 서비스 SLO', 'OTel trace_id', 'multi-burn 알람', '분기 Game Day', 'DORA 측정'].forEach((s, i) => { const x = 70 + i * 22, y = 360 - i * 64, f = pop(u, 0.2 + i * 0.3);
      el('rect', { x, y: y - 22, width: 380, height: 44, rx: 8, fill: i === 0 ? 'var(--newbg)' : PANEL, stroke: ACC, 'stroke-width': 2, opacity: Math.min(1, f) });
      mono(x + 16, y + 6, String(i + 1), { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.3) }); T(x + 42, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); }); }

  // ---------- 5. 종합 ----------
  const ZN = [[0, 20.5, '보류', BAD], [20.5, 30.5, '시작', WARN], [30.5, 39.5, '운영 가능', INFO], [39.5, 44.5, '성숙', GOOD], [44.5, 48, '모범', ACC]];
  function scoreBar(y, total, u, hi, big) { const X = (v) => 60 + v * 17.5;
    ZN.forEach(([a, b2, n, col], i) => { el('rect', { x: X(a) + 1, y, width: X(b2) - X(a) - 2, height: big ? 44 : 26, rx: 5, fill: col, opacity: hi == null || hi === i ? 0.75 : 0.2 });
      T((X(a) + X(b2)) / 2, y + (big ? 70 : 46), n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: hi == null || hi === i ? 1 : 0.4 }); });
    [[0, 0], [20.5, 21], [30.5, 31], [39.5, 40], [44.5, 45], [48, 48]].forEach(([v, n]) => mono(X(v), y - 8, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    if (total != null) { const x = X(total * E(u, 0.3, 1.4)); el('path', { d: `M${x},${y + (big ? 48 : 30)} l-9,16 l18,0 Z`, fill: INK }); if (big) mono(x, y + 104, total + ' / 48', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); } }
  function s5(t, c) { const { k, u } = c, tot = c.beat.total;
    if (k === 0) { scoreBar(120, tot, u, null, true);
      T(480, 320, '네 축 모두 10/12 · 합계 40 = 성숙 구간', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      T(480, 356, '20점 이하라면 MSA 도입 자체를 다시 본다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k <= 3) { const P = { 1: [1, '≤30 위기 모드', ['timeout 없는 호출 전부 찾아 추가', 'shared DB 직접 접근 차단', 'SLO 1개라도 측정 시작', 'on-call runbook 1장']], 2: [2, '31-39 안정화', ['OTel 분산 트레이싱', '배포 Rolling → Canary', 'multi-burn-rate 알람', 'consumer-driven contract test']], 3: [3, '40+ 진화', ['카오스 분기 1회', 'Game Day 정례화', 'DR · region failover 실습', 'Operator로 운영 자동화']] }[k];
      scoreBar(60, null, u, k === 1 ? null : P[0]);
      if (k === 1) { el('rect', { x: 60, y: 60, width: 30.5 * 17.5, height: 26, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 3 }); }
      T(60, 170, P[1], { 'font-size': 19, 'font-weight': 800, fill: k === 1 ? BAD : k === 2 ? INFO : GOOD, opacity: fade(u, 0.3) });
      P[2].forEach((s, i) => { const x = 60 + (i % 2) * 430, y = 230 + Math.floor(i / 2) * 80, f = pop(u, 0.6 + i * 0.3);
        card(x + 200, y, 400, 60, { rx: 10, stroke: GRID, sw: 2, s: f }); mono(x + 20, y + 6, String(i + 1), { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7 + i * 0.3) }); T(x + 46, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.3) }); }); return; }
    if (k === 4) {
      const cx = 250, cy = 215, Rr = 150, ang = (i) => -Math.PI / 2 + i * Math.PI / 2, P = (v, i) => [cx + Rr * v / 12 * Math.cos(ang(i)), cy + Rr * v / 12 * Math.sin(ang(i))];
      [4, 8, 12].forEach((v) => el('polygon', { points: [0, 1, 2, 3].map((i) => P(v, i).join(',')).join(' '), fill: 'none', stroke: GRID, 'stroke-width': 1.5 }));
      el('polygon', { points: [0, 1, 2, 3].map((i) => P(7, i).join(',')).join(' '), fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 0.4) });
      const sk = [2, 2, 3, 12], g = E(u, 0.8, 1.4); el('polygon', { points: sk.map((v, i) => P(v * g, i).join(',')).join(' '), fill: BAD, opacity: 0.18 * fade(u, 0.8), stroke: BAD, 'stroke-width': 2 });
      const g2 = E(u, 1.6, 2.2); el('polygon', { points: [10, 10, 10, 10].map((v, i) => P(v * g2, i).join(',')).join(' '), fill: GOOD, opacity: 0.25, stroke: GOOD, 'stroke-width': 2.5 });
      AX.forEach(([, n], i) => { const [x, y] = P(13.6, i); T(x, y + 5, n, { 'text-anchor': 'middle', 'font-weight': 800 }); });
      T(520, 120, '점선 = 축마다 최소 7/12', { 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
      T(520, 170, '빨강: 운영만 좋다 → 모래성 (예시 모양)', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      T(520, 220, '초록: 지금 팀 10 · 10 · 10 · 10', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      T(520, 290, '한 축이 낮으면 그 축에서 사고가 난다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 5) {
      T(480, 120, 'MSA는 모놀리스를 N 개로 나누는 것이 아니라', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, opacity: fade(u, 0.2) });
      T(480, 160, '독립 진화하는 시스템들의 협업을 만드는 것', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      ['측정', '자동화', '회고'].forEach((s, i) => { const x = 300 + i * 180; card(x, 280, 150, 70, { rx: 35, stroke: ACC, sw: 2.6, s: pop(u, 1.4 + i * 0.25), text: s, fs: 19, fw: 800, color: ACC }); if (i < 2) grow(x + 78, 280, x + 102, 280, E(u, 1.7 + i * 0.25, 1.9 + i * 0.25), ACC); }); return; }
    const PT = [['I', '기초'], ['II', '통신'], ['III', '데이터'], ['IV', '배포/운영'], ['V', '모니터링/안정성']];
    PT.forEach(([r, n], i) => { const x = 110 + i * 185, s = pop(u, 0.2 + i * 0.3);
      el('circle', { cx: x, cy: 160, r: 40 * s, fill: i === 4 ? ACC : 'var(--goodbg)', stroke: i === 4 ? ACC : GOOD, 'stroke-width': 3 });
      mono(x, 168, r, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: i === 4 ? PANEL : GOOD, opacity: fade(u, 0.3 + i * 0.3) });
      T(x, 230, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) });
      if (i < 4) grow(x + 44, 160, x + 140, 160, E(u, 0.4 + i * 0.3, 0.6 + i * 0.3), GOOD); });
    T(480, 310, '20개 챕터 끝 · 이 체크리스트를 분기 회고에 쓴다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.9) }); }

  const quiz = [
    { q: '서비스 경계가 "진짜 경계"라고 말할 수 있는 조건은 무엇인가?',
      o: ['서비스마다 저장소가 따로 있다', '코드·팀·배포 세 곳에서 경계가 함께 맞는다', '서비스 수가 팀 수보다 많다'], a: 1,
      why: '정렬 4항목의 핵심이다. 코드만 나뉘고 팀과 배포가 묶여 있으면 경계는 문서에만 있다.' },
    { q: '통신 축에서 재시도를 허용하는 조건은 무엇인가?',
      o: ['모든 API에 기본으로 켠다', '멱등이 보장된 API에만, jitter를 섞어서', 'timeout이 없는 호출에만'], a: 1,
      why: '멱등하지 않은 호출을 재시도하면 같은 일이 두 번 일어난다. jitter는 재시도가 한꺼번에 몰리는 것을 막는다.' },
    { q: '데이터 축 점검에서 Outbox lag에 알람을 거는 기준은 얼마인가?',
      o: ['5분 이상', '5초 이상', '하루 이상'], a: 0,
      why: 'Outbox lag이 5분을 넘으면 알람을 건다. 이벤트가 조용히 밀리는 유실이 가장 위험하기 때문이다.' },
    { q: '운영 축에서 MSA 전환이 실제로 이득인지 보여 주는 지표 묶음은 무엇인가?',
      o: ['CPU·메모리·디스크·네트워크', 'DORA 4지표', '알람 개수'], a: 1,
      why: '배포 빈도, 리드타임, MTTR, 변경 실패율 네 가지로 전환 전후를 비교한다.' },
    { q: '네 축이 모두 10/12인 팀의 합계와 구간은 무엇인가?',
      o: ['40/48, 성숙', '48/48, 모범 사례', '30/48, 시작 단계'], a: 0,
      why: '10 × 4 = 40이고 40-44는 성숙 구간이다. 다음 단계는 카오스와 Game Day로 더 깨 보는 것이다.' },
  ];
  const summary = [
    'MSA 점검은 경계, 통신, 데이터, 운영 네 축에 12항목씩 모두 48항목이다.',
    '경계는 코드·팀·배포가 함께 맞아야 하고, 모든 외부 호출에는 timeout을 건다.',
    'DB는 권한으로 나누고 Outbox lag이 5분을 넘으면 알람을 건다.',
    '네 축이 10/12씩이면 40점 성숙 구간이다. 한 축이라도 7 아래면 그 축부터 채운다.',
  ];
  const review = [
    { q: '총점은 34인데 데이터 축만 3/12다. 다음 분기에 먼저 할 일은?',
      o: ['카오스 엔지니어링 도입', '데이터 축부터 7/12 이상으로 올리기', '서비스를 더 잘게 나누기'], a: 1,
      why: '총점보다 균형이 중요하다. 축마다 7/12 이상을 권하므로 가장 낮은 데이터 축이 먼저다.' },
    { q: '팀은 4개인데 서비스가 20개로 늘었고 장애 대응이 점점 느려진다. 어느 축의 어떤 항목이 깨졌나?',
      o: ['경계 축의 서비스 수가 팀 수의 2-3배 이내', '통신 축의 mTLS 자동 활성', '데이터 축의 PII 암호화'], a: 0,
      why: '팀 4개면 서비스는 8~12개가 상한이다. 그 이상은 운영이 먼저 무너진다.' },
    { q: '점수가 28점인 팀이 Operator 자동화부터 하겠다고 한다. 체크리스트대로라면?',
      o: ['그대로 진행한다', 'timeout 추가, shared DB 차단, SLO 1개 측정부터 한다', 'Game Day부터 연다'], a: 1,
      why: '30점 이하는 위기 모드다. 완벽한 설계보다 timeout 하나와 SLO 하나가 먼저다.' },
  ];

  R.page({ title: 'MSA 4축 × 12 = 48 점검', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
