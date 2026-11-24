/* V-1-1 MSA 구조 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 서비스 목록·상태(ok/slow/down)·통신 방식·배지는 STEPS 의 cluster·services·queue 를 읽는다.
 * 이미지 크기(5~15MB, 200MB+)와 포트·주소·타임아웃(8081, payment-svc:50051, 300ms)은 페이지 코드·설명의 값이다. 지연 막대 길이는 비율만 보이는 그림이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, person, server, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const STC = { ok: GOOD, slow: WARN, down: BAD }, STBG = { ok: PANEL, slow: WARNBG, down: BADBG };
  const PCOL = { REST: INFO, gRPC: ACC, MQ: WARN };
  // 서비스 상자: 상태 점 + 이름 (+ 통신 방식)
  function svc(cx, cy, s, o) { o = o || {}; const w = o.w || 190, h = o.h || 44, col = STC[s.st] || GOOD;
    card(cx, cy, w, h, { rx: 10, fill: STBG[s.st] || PANEL, stroke: col, sw: 2.2, s: o.s, op: o.op });
    if ((o.s ?? 1) < 0.5) return;
    el('circle', { cx: cx - w / 2 + 16, cy, r: 6, fill: col, opacity: o.op ?? 1 });
    mono(cx - w / 2 + 30, cy + 5, s.name, { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1 });
    if (o.proto && s.proto) mono(cx + w / 2 - 10, cy + 5, s.proto, { 'font-size': 13.5, 'font-weight': 700, fill: PCOL[s.proto], 'text-anchor': 'end', opacity: o.op ?? 1 }); }
  function miniDb(cx, cy, col, s) { const g = R.G(cx, cy, s ?? 1);
    el('path', { d: 'M-14,-9 V9 A14,5 0 0 0 14,9 V-9', fill: PANEL, stroke: col || INK, 'stroke-width': 2 }, g); el('ellipse', { cx: 0, cy: -9, rx: 14, ry: 5, fill: PANEL, stroke: col || INK, 'stroke-width': 2 }, g); }
  function binIcon(cx, cy, s) { const g = R.G(cx, cy, s ?? 1);
    el('path', { d: 'M-34,-44 H16 L34,-26 V44 H-34 Z', fill: ACCBG, stroke: ACC, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M16,-44 V-26 H34', fill: 'none', stroke: ACC, 'stroke-width': 2 }, g);
    ['0110', '1011', '0010'].forEach((b, i) => tx(0, -10 + i * 18, b, { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', fill: ACC, 'font-weight': 700 }, g)); }

  // ---------- 1. 모놀리스 → Go 로 나누기 ----------
  function mono1(b, k, u) { const m = b.mono;
    zone(30, 40, 230, 260, m.name + ' · 프로세스 1개', { fill: SOFT, stroke: GRID, color: INK });
    m.mods.forEach((s, i) => { const gone = k === 4 && u > 0.4 + i * 0.3;
      card(145, 96 + i * 50, 190, 40, { rx: 8, text: s, fs: 15, fill: PANEL, stroke: gone ? GRID : MUT, color: gone ? OFF : INK, dash: gone ? '5 5' : null }); });
    tx(30, 324, m.note, { 'font-size': 14, fill: MUT, 'font-weight': 600 }); }
  function cluster1(b, p, u, k) { const np = p.cluster ? p.cluster.length : 0;
    zone(690, 40, 250, 260, 'MSA · 서비스마다 따로', { fill: 'none', stroke: ACC, dash: '6 5', color: ACC });
    b.cluster.forEach((s, i) => { const isNew = i >= np && k !== 4; svc(815, 96 + i * 50, s, { w: 210, h: 40, s: isNew ? pop(u, 0.4) : k === 4 ? pop(u, 0.9 + i * 0.3) : 1 }); }); }
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    mono1(b, k, u); cluster1(b, p, u, k);
    ['단일 바이너리', '작은 이미지', '즉시 시작', 'goroutine'].forEach((w, i) => { const on = i <= k, cur = i === k;
      card(150 + i * 220, 390, 196, 38, { rx: 19, text: (on ? '✓ ' : '') + w, fs: 14.5, fw: 700, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, color: on ? ACC : OFF, s: cur ? pop(u, 0.2) : 1 }); });
    tx(30, 360, 'Go로 나누면 가벼운 이유', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (k === 0) { terminal(290, 44, 380, 70, ['$ CGO_ENABLED=0 go build -o app'], 0.1 + E(u, 0.2, 1.3) * 0.9, { fs: 13.5 });
      binIcon(420, 200, pop(u, 1.4)); mono(420, 272, 'app', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      pill(580, 170, '런타임 동봉', MUT, pop(u, 1.9), { fs: 13.5 }); el('line', { x1: 520, y1: 170, x2: 640, y2: 170, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 2.1) });
      sub(580, 210, '파일 하나만 복사하면 돈다', fade(u, 2.2)); return; }
    if (k === 1) { tx(290, 70, '컨테이너 이미지 크기', { 'font-size': 15, 'font-weight': 700 });
      const W = 360, g = E(u, 0.3, 1.5);
      tx(290, 112, 'JVM 계열', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); el('rect', { x: 290, y: 122, width: W * g, height: 26, rx: 5, fill: OFF });
      mono(290 + W - 6, 140, '200MB+', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      tx(290, 186, 'Go · FROM scratch', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
      const g2 = E(u, 1.5, 2.0); el('rect', { x: 290, y: 196, width: W * 15 / 200 * g2, height: 26, rx: 5, fill: ACC, opacity: 0.45 }); el('rect', { x: 290, y: 196, width: W * 5 / 200 * g2, height: 26, rx: 5, fill: ACC });
      mono(290 + W * 15 / 200 + 10, 214, '5~15MB', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      sub(470, 262, '같은 노드에 서비스를 훨씬 많이 올린다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 2) { tx(290, 70, '새 인스턴스가 요청을 받기까지', { 'font-size': 15, 'font-weight': 700 });
      tx(290, 112, 'JVM', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: 340, y: 98, width: 220 * E(u, 0.3, 1.6), height: 22, rx: 4, fill: OFF }); sub(450, 140, '워밍업', fade(u, 0.9));
      el('rect', { x: 560, y: 98, width: 80 * E(u, 1.6, 2.0), height: 22, rx: 4, fill: GOOD });
      tx(290, 182, 'Go', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      el('rect', { x: 340, y: 168, width: 300 * E(u, 0.3, 1.0), height: 22, rx: 4, fill: GOOD }); sub(380, 210, '곧바로 받는다', fade(u, 0.9), { fill: GOOD, 'font-weight': 700 });
      [0, 1, 2].forEach((i) => card(380 + i * 90, 262, 70, 34, { rx: 8, text: 'pod', fs: 13.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4 + i * 0.25) }));
      sub(640, 268, '오토스케일', fade(u, 2.0), { 'font-weight': 700, fill: ACC }); return; }
    if (k === 3) { card(470, 170, 260, 150, { rx: 12, stroke: ACC, sw: 2.2 }); mono(470, 116, 'order-svc', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      const n = Math.floor(E(u, 0.2, 2.0) * 40);
      for (let i = 0; i < n; i++) { const a = i * 2.4, rr = 14 + (i % 5) * 11; el('circle', { cx: 470 + Math.cos(a) * rr * 1.7, cy: 182 + Math.sin(a) * rr * 0.9, r: 4, fill: ACC, opacity: 0.85 }); }
      for (let j = 0; j < 6; j++) dot([[290, 182 + (j - 2.5) * 16], [350, 182]], ((t * 0.8 + j / 6) % 1), INFO, 4);
      sub(470, 278, '요청 하나 = goroutine 하나', fade(u, 1.2), { 'font-size': 14, 'font-weight': 700, fill: INK }); return; }
    // k4: 모놀리스에서 떼어 낸다
    b.mono.mods.forEach((s, i) => { const f = seg(u, 0.4 + i * 0.3, 1.0 + i * 0.3); if (f > 0 && f < 1) fly(145, 96 + i * 50, 815, 96 + i * 50, f, s, { fill: ACC }); });
    grow(290, 170, 650, 170, E(u, 0.2, 1.0), ACC);
    sub(470, 150, '경계가 보이면 그때 나눈다', fade(u, 0.6), { 'font-size': 14, 'font-weight': 700, fill: ACC });
    pill(470, 240, '경계 전에 나누면 분산 모놀리스', WARN, pop(u, 2.0), { fs: 14, fill: PANEL }); }

  // ---------- 2. 서비스 경계 ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 2) {
      card(470, 205, 380, 330, { rx: 14, stroke: ACC, sw: 2.4 });
      mono(296, 64, 'order-svc', { 'font-size': 16, 'font-weight': 800, fill: ACC }); tx(400, 64, 'package main', { 'font-size': 13.5, fill: MUT });
      ['"log"', '"net/http"'].forEach((s, i) => pill(330 + i * 120, 100, s, INFO, k === 0 ? pop(u, 0.3 + i * 0.3) : 1, { mono: true, fs: 13.5, fill: PANEL }));
      if (k === 0) { pill(470, 160, '외부 프레임워크', MUT, pop(u, 1.2), { fs: 13.5 }); el('line', { x1: 405, y1: 160, x2: 535, y2: 160, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.5) });
        sub(470, 220, '표준 라이브러리만으로 서비스 하나가 선다', fade(u, 1.8), { 'font-size': 14 }); }
      const rows = [['GET /orders/{id}', 'getOrder'], ['POST /orders', 'createOrder'], ['GET /healthz', 'healthz']];
      if (k >= 1) { tx(296, 150, 'mux 라우팅 표', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
        rows.slice(0, k === 1 ? 2 : 3).forEach(([pth, h], i) => { const y = 180 + i * 46, s = (k === 1 || i === 2) ? pop(u, 0.3 + (k === 1 ? i * 0.35 : 0)) : 1;
          card(470, y, 340, 38, { rx: 8, fill: i === 2 ? GOODBG : SOFT, stroke: i === 2 ? GOOD : GRID, sw: 1.6, s });
          mono(312, y + 5, pth, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s) }); mono(628, y + 5, h, { 'font-size': 14.5, fill: ACC, 'text-anchor': 'end', opacity: clamp(s) }); }); }
      if (k === 1) { tx(700, 100, '다른 도메인 경로', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
        ['결제', '재고', '유저'].forEach((s, i) => { const y = 140 + i * 50; pill(780, y, s + ' 경로', MUT, pop(u, 1.3 + i * 0.2), { fs: 13.5 }); el('line', { x1: 730, y1: y, x2: 830, y2: y, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.6 + i * 0.2) }); });
        sub(780, 300, '여기엔 없다', fade(u, 2.2), { 'font-size': 14 }); }
      if (k === 2) { card(470, 330, 200, 40, { rx: 20, text: ':8081 listening', fs: 15, mono: true, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 0.6) });
        server(140, 200, '오케스트레이터', {});
        grow(200, 260, 290, 272, seg(u, 0.9, 1.3), MUT);
        dot([[200, 262], [300, 272]], seg(u, 1.0, 1.6), INFO, 6); dot([[300, 288], [200, 278]], seg(u, 1.7, 2.3), GOOD, 6);
        pill(140, 330, 'GET /healthz → 200', GOOD, pop(u, 2.2), { mono: true, fs: 13.5, fill: PANEL });
        sub(780, 200, '오케스트레이터는', fade(u, 1.2), { 'font-size': 14 }); sub(780, 222, '이 경로만 본다', fade(u, 1.3), { 'font-size': 14 }); }
      return; }
    // k3: 게이트웨이 앞에 선다
    person(60, 210, '클라이언트', {});
    card(230, 210, 150, 120, { rx: 12, stroke: INK, sw: 2.4, s: pop(u, 0.2) });
    tx(230, 180, 'API', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); tx(230, 200, 'Gateway', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    ['인증', '라우팅', '레이트리밋'].forEach((s, i) => sub(230, 226 + i * 18, s, fade(u, 0.5 + i * 0.1)));
    grow(90, 210, 152, 210, seg(u, 0.2, 0.6), MUT);
    b.services.forEach((s, i) => { const y = 66 + i * 96, sc = pop(u, 0.6 + i * 0.2);
      grow(306, 210, 480, y, seg(u, 0.7 + i * 0.2, 1.2 + i * 0.2), i === 0 ? ACC : MUT);
      svc(580, y, s, { w: 200, s: sc }); sub(580, y + 38, s.tag, fade(u, 1.0 + i * 0.2));
      grow(682, y, 760, y, seg(u, 1.4 + i * 0.15, 1.8 + i * 0.15), GRID, { plain: true }); miniDb(790, y, INK, pop(u, 1.6 + i * 0.15));
      mono(820, y + 5, 'DB', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.7 + i * 0.15) }); });
    mono(380, 116, '/api/orders/*', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    dot([[90, 210], [306, 210], [480, 66]], seg(u, 1.4, 2.4), ACC, 7);
    note(700, 400, '서비스마다 DB도 따로', fade(u, 2.2), { 'font-size': 14 }); }

  // ---------- 3. 동기 vs 비동기 (시간 축) ----------
  const LN = [['order-svc', 72], ['payment-svc', 142], ['inventory-svc', 212], ['큐 (MQ)', 282], ['notify-svc', 352]];
  const LY = Object.fromEntries(LN.map(([n, y]) => [n, y]));
  function lanes(b, u, k) { const names = b.services.map((s) => s.name);
    LN.forEach(([n, y]) => { const on = n === '큐 (MQ)' ? !!b.queue : names.includes(n), s = b.services.find((x) => x.name === n);
      const op = on ? 1 : 0.25; mono(30, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, fill: on ? (s ? STC[s.st] === GOOD ? INK : STC[s.st] : WARN) : OFF, opacity: 1 });
      el('line', { x1: 170, y1: y, x2: 930, y2: y, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': on ? null : '4 6', opacity: op });
      if (s) mono(930, y - 10, s.proto, { 'font-size': 13.5, fill: PCOL[s.proto], 'text-anchor': 'end', 'font-weight': 700 }); }); }
  function block(x1, x2, y, col, u0, label, o) { o = o || {}; if (u0 <= 0) return; const w = (x2 - x1) * u0;
    el('rect', { x: x1, y: y - 12, width: w, height: 24, rx: 5, fill: col, opacity: o.op ?? 0.85 });
    if (label && u0 > 0.6) tx(x1 + 8, y + 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: o.tc || PANEL }); }
  function vArrow(x, y1, y2, u0, col, label) { grow(x, y1, x, y2, u0, col); if (label && u0 >= 1) mono(x + 6, (y1 + y2) / 2 + 4, label, { 'font-size': 13.5, fill: col, 'font-weight': 700 }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k < 4) lanes(b, u, k);
    if (k < 4) tx(180, 30, '시간 →', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (k === 0 || k === 2) { const sp = k === 0 ? 1 : 3;
      block(190, 240, LY['order-svc'], INFO, E(u, 0.1, 0.3 * sp / sp), '');
      vArrow(240, 84, 128, seg(u, 0.3, 0.6), ACC, 'Charge()');
      block(240, 420, LY['payment-svc'], ACC, E(u, 0.6, 1.4), '결제 승인');
      block(240, 420, LY['order-svc'], WARN, E(u, 0.6, 1.4), '기다림', { op: 0.6, tc: INK });
      vArrow(420, 128, 86, seg(u, 1.4, 1.7), GOOD, 'Approved');
      if (k === 0) { note(470, 76, '응답이 올 때까지 이 요청은 멈춘다', fade(u, 1.8), { 'font-size': 14 }); return; }
      block(420, 450, LY['order-svc'], INFO, E(u, 1.7, 1.8), '');
      vArrow(450, 84, 270, seg(u, 1.8, 2.2), WARN, '');
      if (u > 2.2) pill(530, 250, 'order.created', WARN, 1, { mono: true, fs: 13.5, fill: PANEL });
      block(450, 490, LY['order-svc'], GOOD, E(u, 2.2, 2.4), '');
      [0, 1, 2].forEach((i) => card(640 + i * 34, 282, 28, 24, { rx: 4, fill: WARNBG, stroke: WARN, sw: 1.5, s: pop(u, 2.1 + i * 0.1) }));
      block(760, 900, LY['notify-svc'], WARN, E(u, 2.3, 2.9), '알림 처리', { tc: INK, op: 0.5 });
      return; }
    if (k === 1) { block(190, 240, LY['order-svc'], INFO, 1, '');
      vArrow(240, 84, 128, 1, ACC, 'Charge()');
      block(240, 840, LY['payment-svc'], BAD, E(u, 0.2, 2.0), '느림 · 실패', { op: 0.75 });
      block(240, 840, LY['order-svc'], BAD, E(u, 0.2, 2.0), '붙잡혀 기다림', { op: 0.5, tc: INK });
      if (u > 2.0) pill(880, 104, '402', BAD, pop(u, 2.0), { mono: true, fs: 14, fill: PANEL });
      return; }
    if (k === 3) { block(190, 230, LY['order-svc'], INFO, 1, '');
      vArrow(230, 84, 128, 1, ACC, ''); block(230, 380, LY['payment-svc'], ACC, E(u, 0.1, 0.5), '결제');
      vArrow(380, 84, 198, seg(u, 0.5, 0.7), ACC, ''); block(380, 520, LY['inventory-svc'], ACC, E(u, 0.7, 1.1), '재고 차감');
      block(230, 520, LY['order-svc'], WARN, E(u, 0.1, 1.1), '기다림', { op: 0.5, tc: INK });
      vArrow(540, 84, 270, seg(u, 1.1, 1.3), WARN, '');
      pill(600, 72, '201', GOOD, pop(u, 1.4), { mono: true, fs: 14, fill: PANEL });
      el('path', { d: 'M190,44 V36 H560 V44', fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.6) });
      tx(380, 28, '응답 시간 = 동기 홉의 합', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      block(680, 860, LY['notify-svc'], WARN, E(u, 1.8, 2.6), '알림 (응답 뒤)', { tc: INK, op: 0.5 }); return; }
    // k4: 원칙
        tx(200, 90, '동기 홉이 길면', { 'font-size': 15, 'font-weight': 800, fill: BAD });
    ['결제', '재고', '알림', '집계'].forEach((s, i) => block(200 + i * 150, 345 + i * 150, 130, i < 2 ? ACC : BAD, E(u, 0.2 + i * 0.2, 0.5 + i * 0.2), s, { op: 0.8 }));
    tx(200, 220, '지금 답이 필요한 것만 동기로', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
    ['결제', '재고'].forEach((s, i) => block(200 + i * 150, 345 + i * 150, 260, ACC, E(u, 1.3 + i * 0.2, 1.6 + i * 0.2), s, { op: 0.8 }));
    pill(560, 260, '응답', GOOD, pop(u, 1.8), { fs: 14, fill: PANEL });
    ['알림', '집계'].forEach((s, i) => card(700 + i * 110, 330, 96, 34, { rx: 8, text: s + ' → 큐', fs: 13.5, fill: WARNBG, stroke: WARN, s: pop(u, 2.0 + i * 0.2) }));
    sub(560, 380, '나중에 해도 되는 일은 큐로 던지고 잊는다', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 4. 설정 · 디스커버리 ----------
  const F4 = [['Port', 'PORT', '"8081"'], ['PaymentAddr', 'PAYMENT_ADDR', '"payment-svc:50051"'], ['DBUrl', 'DB_URL', '""']];
  function cfgStruct(k, u) {
    zone(300, 40, 360, 210, 'type Config struct', { fill: PANEL, stroke: ACC, color: ACC });
    F4.forEach(([f, , v], i) => { const y = 92 + i * 52, filled = k >= i + 1 && k <= 3 ? (k === i + 1 ? seg(u, 1.0, 1.4) : 1) : k === 4 ? 1 : 0, empty = i === 2;
      mono(316, y + 5, f, { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 440, y: y - 16, width: 204, height: 32, rx: 6, fill: filled ? (empty ? BADBG : ACCBG) : PANEL, stroke: filled ? (empty ? BAD : ACC) : GRID, 'stroke-width': 1.8, 'stroke-dasharray': filled ? null : '5 4' });
      if (filled) mono(452, y + 5, v, { 'font-size': 13.5, 'font-weight': 700, fill: empty ? BAD : ACC, opacity: filled }); }); }
  function envPanel(k, u) { zone(30, 40, 240, 210, '환경변수 (ENV)', { fill: SOFT, color: MUT });
    F4.forEach(([, e], i) => { const y = 92 + i * 52, on = k === i + 1; mono(46, y + 5, e, { 'font-size': 14.5, 'font-weight': 700, fill: on ? WARN : INK });
      if (on) { mono(46, y + 25, '비어 있으면 기본값', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) }); grow(250, y, 296, y, seg(u, 0.6, 1.0), WARN); dot([[250, y], [440, y]], seg(u, 0.6, 1.3), WARN, 6); } }); }
  function s4(t, c) { const { k, u } = c, b = c.beat;
    envPanel(k, u); cfgStruct(k, u);
    if (k === 0) { pill(810, 120, 'IP 하드코딩', MUT, pop(u, 0.8), { fs: 14 }); el('line', { x1: 750, y1: 120, x2: 870, y2: 120, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.1) });
      sub(810, 170, '값은 코드 밖에서 들어온다', fade(u, 1.4), { 'font-size': 14 });
      note(30, 300, '이 서비스가 무엇에 의존하는지 구조체 하나에 다 보인다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 1) { pill(810, 92, 'PORT = 8081', ACC, pop(u, 1.6), { mono: true, fs: 14, fill: PANEL });
      note(30, 300, 'PORT를 안 주면 기본값 8081로 뜬다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { card(800, 110, 200, 44, { rx: 22, text: 'payment-svc', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      sub(800, 264, '이름 → 실제 인스턴스', fade(u, 1.6));
      [0, 1, 2].forEach((i) => { const x = 720 + i * 80; grow(800, 134, x, 196, seg(u, 1.6 + i * 0.1, 1.9 + i * 0.1), ACC); card(x, 216, 66, 36, { rx: 8, text: 'pod', fs: 13.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.8 + i * 0.15) }); });
      dot([[660, 144], [800, 132], [720 + (Math.floor(t * 1.5) % 3) * 80, 198]], u > 2.0 ? (t * 1.5) % 1 : 0, ACC, 5);
      note(30, 300, '인스턴스가 3개든 30개든 코드는 그대로다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 3) { [['order-svc', 0], ['payment-svc', 1], ['inventory-svc', 2]].forEach(([n, i]) => { const y = 340, x = 140 + i * 240;
        svc(x, y, { name: n, st: 'ok' }, { w: 180, h: 40, s: pop(u, 0.8 + i * 0.2) }); grow(x, y + 20, x, y + 46, seg(u, 1.2, 1.5), GRID, { plain: true }); miniDb(x, y + 62, INK, pop(u, 1.4 + i * 0.15)); });
      pill(810, 130, 'DB_URL을 꼭 주입', BAD, pop(u, 1.6), { fs: 14, fill: PANEL });
      sub(810, 172, '기본값이 없으면 붙을 곳도 없다', fade(u, 1.8), { 'font-size': 14 });
      tx(720, 340, 'DB 공유 금지', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); return; }
    // k4: env() 폴백 + 같은 이미지
    const fy = 300;
    card(150, fy, 220, 44, { rx: 8, text: 'os.Getenv(k)', fs: 15, mono: true, stroke: INK, s: pop(u, 0.2) });
    grow(262, fy, 330, fy - 30, seg(u, 0.5, 0.8), GOOD); grow(262, fy, 330, fy + 30, seg(u, 0.7, 1.0), WARN);
    mono(340, fy - 26, '값이 있으면 v', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.8) });
    mono(340, fy + 40, '"" 이면 def', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
    card(780, 70, 190, 44, { rx: 8, text: '같은 이미지', fs: 15, stroke: ACC, color: ACC, s: pop(u, 1.2) });
    ['dev', 'staging', 'prod'].forEach((s, i) => { const x = 690 + i * 90; grow(780, 92, x, 150, seg(u, 1.4 + i * 0.1, 1.8 + i * 0.1), MUT); card(x, 172, 80, 40, { rx: 8, text: s, fs: 14, mono: true, s: pop(u, 1.7 + i * 0.15) }); });
    sub(780, 220, 'ENV만 바뀐다', fade(u, 2.2), { 'font-size': 14, 'font-weight': 700, fill: INK }); }

  // ---------- 5. 부분 장애 · 격리 ----------
  const N5 = { gw: [100, 220], order: [330, 220], pay: [600, 110], inv: [600, 220], mq: [600, 330] };
  function topo5(b, k, u, t) { const S = Object.fromEntries(b.services.map((s) => [s.name, s]));
    const gwHot = k === 0 && u > 1.6;
    card(N5.gw[0], N5.gw[1], 140, 50, { rx: 10, text: 'Gateway', fs: 15, fw: 800, stroke: gwHot ? BAD : INK, fill: gwHot ? BADBG : PANEL });
    grow(170, 220, 236, 220, 1, MUT);
    svc(N5.order[0], N5.order[1], S['order-svc'], { w: 180 });
    [['pay', 'payment-svc'], ['inv', 'inventory-svc']].forEach(([key, n]) => { const p = N5[key]; grow(420, 220, p[0] - 100, p[1], 1, k >= 2 && key === 'pay' ? OFF : MUT); svc(p[0], p[1], S[n], { w: 200 }); });
    if (S['payment-svc'].st === 'down') cross(712, 110, 9, 1);
    grow(420, 220, 500, 330, 1, WARN, { dash: '5 4' });
    card(N5.mq[0], N5.mq[1], 200, 44, { rx: 8, fill: WARNBG, stroke: WARN, sw: 2 }); tx(512, 335, '큐', { 'font-size': 15, 'font-weight': 800, fill: WARN });
    for (let i = 0; i < 4; i++) el('rect', { x: 560 + i * 30, y: 320, width: 24, height: 20, rx: 3, fill: WARN, opacity: 0.7 });
    grow(700, 330, 776, 330, 1, WARN); svc(860, 330, S['notify-svc'], { w: 160 }); }
  function panel(title, col) { el('rect', { x: 730, y: 40, width: 210, height: 230, rx: 12, fill: SOFT }); tx(746, 66, title, { 'font-size': 14, 'font-weight': 800, fill: col || INK }); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    topo5(b, k, u, t);
    if (k === 0) { const n = Math.floor(E(u, 0.2, 2.2) * 14);
      for (let i = 0; i < n; i++) el('circle', { cx: 252 + (i % 7) * 26, cy: 268 + Math.floor(i / 7) * 18, r: 6, fill: WARN });
      for (let i = 0; i < Math.max(0, n - 7); i++) el('circle', { cx: 50 + (i % 7) * 16, cy: 266 + Math.floor(i / 7) * 16, r: 5, fill: BAD });
      for (let j = 0; j < 3; j++) dot([[420, 214], [500, 110]], ((t * 0.7 + j / 3) % 1) * 0.9, WARN, 5);
      sub(330, 316, '기다리는 goroutine이 쌓인다', fade(u, 0.8), { fill: WARN, 'font-weight': 700 });
      sub(110, 316, '앞쪽까지 번진다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { panel('요청마다 최대 300ms', WARN);
      clock(460, 150, 22, ((t * 0.9) % 1), WARN, ''); mono(460, 194, '300ms', { 'font-size': 14, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      [0, 1, 2, 3].forEach((i) => { const y = 100 + i * 38, f = E(u, 0.3 + i * 0.4, 0.7 + i * 0.4); el('rect', { x: 746, y: y, width: 140 * f, height: 20, rx: 4, fill: WARN, opacity: 0.8 }); if (f >= 1) cross(904, y + 10, 7, 1); });
      sub(835, 262, '무한 대기는 없지만 매번 잃는다', fade(u, 2.0)); return; }
    if (k === 2) { panel('차단기 열림', GOOD);
      el('line', { x1: 450, y1: 165, x2: 478, y2: 140, stroke: BAD, 'stroke-width': 4, 'stroke-linecap': 'round' }); el('circle', { cx: 450, cy: 165, r: 5, fill: INK }); el('circle', { cx: 486, cy: 152, r: 5, fill: INK });
      for (let j = 0; j < 3; j++) { const f = ((t * 0.8 + j / 3) % 1); dot([[420, 214], [446, 168], [420, 214]], u > 0.8 ? f : 0, GOOD, 5); }
      [0, 1, 2, 3].forEach((i) => { const y = 100 + i * 38; el('rect', { x: 746, y, width: 6, height: 20, rx: 2, fill: GOOD, opacity: fade(u, 0.5 + i * 0.3) }); mono(762, y + 15, 'ErrPaymentUnavailable', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 0.5 + i * 0.3) }); });
      sub(835, 262, '호출 안 함 · 대기 0', fade(u, 1.8), { fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 3) { panel('breaker.Record(err)', INK);
      for (let i = 0; i < 5; i++) el('rect', { x: 748 + i * 36, y: 84, width: 30, height: 22, rx: 4, fill: i < Math.floor(E(u, 0.2, 1.2) * 5.99) ? BAD : PANEL, stroke: GRID });
      sub(835, 124, '연속 실패를 센다', fade(u, 0.5));
      [['닫힘', INK, 150], ['열림', BAD, 190], ['반열림', WARN, 230]].forEach(([s, col, y], i) => { card(800, y, 120, 30, { rx: 15, text: s, fs: 14, fw: 800, stroke: col, color: col, s: pop(u, 1.0 + i * 0.4) }); });
      sub(900, 196, '시간 뒤', fade(u, 2.0)); sub(900, 236, '조금씩', fade(u, 2.2)); return; }
    // k4: trace id
    panel('trace 한 개', ACC);
    [['gateway', 0, 190], ['order-svc', 10, 170], ['payment-svc', 30, 110]].forEach(([n, x, w], i) => { const y = 92 + i * 52, f = E(u, 0.3 + i * 0.4, 0.8 + i * 0.4);
      mono(746, y, n, { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.4) });
      el('rect', { x: 746 + x, y: y + 8, width: w * f, height: 14, rx: 3, fill: i === 2 ? BAD : ACC, opacity: 0.85 }); });
    mono(835, 256, 'trace id가 홉을 잇는다', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) });
    for (let i = 0; i < 3; i++) el('rect', { x: 680 + i * 30, y: 320, width: 24, height: 20, rx: 3, fill: WARN, opacity: fade(u, 1.0 + i * 0.3) });
    sub(600, 380, '급하지 않은 일은 큐가 붙잡고 있다', fade(u, 2.0), { 'font-size': 14 }); }

  const quiz = [
    { q: '팀이 작고 도메인 경계가 아직 흐릴 때 알맞은 출발점은 무엇인가?',
      o: ['처음부터 서비스 수십 개로 나눈다', '모놀리스로 시작하고 경계가 보이면 나눈다', '서비스마다 언어를 다르게 고른다'], a: 1,
      why: '나누는 순간 네트워크·배포·관측 비용이 곱해진다. 경계 전에 나누면 서로 묶여 따로 배포도 못 하는 분산 모놀리스가 된다.' },
    { q: 'order-svc의 mux에 등록돼야 하는 경로는 무엇인가?',
      o: ['/orders 조회·생성과 /healthz', '/orders와 결제 승인 경로', '모든 도메인의 경로'], a: 0,
      why: '한 서비스는 자기 도메인 경로만 갖는다. 결제·재고 경로는 각자의 서비스에 있고, 게이트웨이가 경로를 보고 나눠 보낸다.' },
    { q: '주문 생성에서 알림을 큐로 던지면 사용자 응답 시간은 어떻게 되나?',
      o: ['알림 처리 시간만큼 늘어난다', '큐가 비워질 때까지 기다린다', '동기 홉(결제·재고)의 합만 남는다'], a: 2,
      why: '응답 시간은 동기 홉의 합이다. 이벤트는 발행만 하고 201을 바로 돌려주므로 알림 처리는 응답 뒤에 일어난다.' },
    { q: '결제 서비스 주소를 payment-svc:50051처럼 이름으로 쓰는 이유는 무엇인가?',
      o: ['디스커버리가 이름으로 실제 인스턴스를 찾아 주니 개수가 바뀌어도 코드가 그대로라서', 'IP보다 통신이 빨라서', 'gRPC는 IP를 받지 않아서'], a: 0,
      why: 'k8s 안에서는 서비스 이름이 DNS다. 인스턴스가 3개든 30개든 같은 이름으로 부르고, 값은 PAYMENT_ADDR 환경변수로 바꿀 수 있다.' },
    { q: 'payment-svc가 죽었을 때 서킷브레이커가 열리면 order-svc는 어떻게 되나?',
      o: ['300ms씩 기다렸다가 실패한다', '호출하지 않고 바로 실패해 지연이 사라진다', '결제가 돌아올 때까지 큐에 쌓는다'], a: 1,
      why: '타임아웃만 있으면 여전히 300ms씩 잃는다. 차단기가 열리면 호출 자체를 건너뛰어 대기가 0이 되고 장애가 앞으로 번지지 않는다.' },
  ];

  const summary = [
    '서비스를 나누면 네트워크·배포·관측 비용이 늘어서, 경계가 보일 때까지는 모놀리스가 빠르다.',
    'Go는 5~15MB 단일 바이너리, 빠른 시작, goroutine 덕에 잘게 나눠도 가볍다.',
    '즉답이 필요한 호출만 동기로 두고 나머지는 큐로 던져야 응답 시간이 짧다.',
    '타임아웃과 서킷브레이커로 빨리 실패시키고 trace id로 느린 홉을 찾는다.',
  ];
  const review = [
    { q: '결제 서비스가 느려지자 게이트웨이까지 응답이 멈췄다. 먼저 넣을 것은?',
      o: ['결제 호출에 타임아웃과 서킷브레이커', '게이트웨이 인스턴스 수 늘리기', '알림 서비스를 동기 호출로 바꾸기'], a: 0,
      why: 'order-svc가 결제를 붙잡고 기다리면 대기가 앞으로 번진다. 상한을 걸고 연속 실패 때 호출을 끊어야 전파가 멈춘다.' },
    { q: '주문 하나를 고치려면 주문·결제·재고 세 서비스를 함께 배포해야 한다. 무엇이 문제인가?',
      o: ['서비스 수가 너무 적다', 'gRPC 대신 REST를 써서', '함께 바뀌는 것을 다른 서비스로 잘못 갈랐다'], a: 2,
      why: '경계는 함께 바뀌는 것끼리 묶어야 한다. 잘못 자르면 나뉘었지만 묶여 있는 분산 모놀리스가 된다.' },
    { q: 'staging에서는 되던 order-svc가 prod에서 DB에 못 붙는다. 먼저 확인할 것은?',
      o: ['Go 버전', 'prod에 DB_URL 환경변수를 넣었는지', '/healthz 응답 본문'], a: 1,
      why: 'DB_URL은 기본값이 빈 문자열이라 주입하지 않으면 붙을 곳이 없다. 같은 이미지가 ENV만 바꿔 돌기 때문에 환경별 값부터 본다.' },
  ];

  R.page({ title: 'MSA 구조', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
