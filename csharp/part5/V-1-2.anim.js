/* V-1-2 의존성 주입 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   인스턴스 번호(#1 #2 …)와 예외 메시지는 .NET 10 SDK 의 Microsoft.Extensions.DependencyInjection 으로 직접 돌려 받은 실제 출력이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly,
    server, person, cross, check, lock, zone, spans, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function jbox(x, y, lines, o) { o = o || {}; const fs = o.fs || 14, lh = fs + 8, w = o.w || Math.max(...lines.map((l) => tw(l, fs))) + 28, h = lines.length * lh + 14, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.6, opacity: op });
    if (o.title) tx(x + 2, y - 8, o.title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    lines.forEach((l, i) => mono(x + 14, y + 7 + lh * i + lh / 2 + fs * 0.36, l, { 'font-size': fs, fill: o.color || INK, opacity: op })); return { w, h }; }
  function obj(x, y, w, title, fields, o) { o = o || {}; const rh = 30, h = 34 + fields.length * rh + 6, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    el('rect', { x: x + 1, y: y + 1, width: w - 2, height: 29, rx: 9, fill: o.head || ACCBG, opacity: op });
    mono(x + 12, y + 20, title, { 'font-size': 14.5, 'font-weight': 800, fill: o.hc || ACC, opacity: op });
    fields.forEach(([n, v, f], i) => { const yy = y + 34 + i * rh, ff = f ?? 1;
      mono(x + 12, yy + 19, n, { 'font-size': 14, fill: MUT, opacity: op });
      if (ff > 0.02 && v != null) { el('rect', { x: x + w * 0.45, y: yy + 3, width: (w * 0.55 - 8) * ff, height: rh - 6, rx: 5, fill: o.vbg || GOODBG, opacity: op });
        mono(x + w - 14, yy + 19, v, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: o.vc || INK, opacity: op * ff }); } });
    return h; }
  // 구현체 = 플러그 (위로 두 개의 핀), 계약 = 소켓 (점선 틀 + 두 구멍)
  function plug(cx, cy, name, col, s, o) { o = o || {}; if ((s ?? 1) <= 0.01) return; const g = R.G(cx, cy, s ?? 1, o.op ?? 1), w = tw(name, 14.5) + 30;
    [-20, 12].forEach((dx) => el('rect', { x: dx, y: -36, width: 8, height: 16, rx: 2, fill: col }, g));
    el('rect', { x: -w / 2, y: -21, width: w, height: 42, rx: 9, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': o.dash }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: col }, g); }
  function socket(cx, cy, w, label, col, op) { const g = R.G(cx, cy, 1, op ?? 1);
    el('rect', { x: -w / 2, y: -24, width: w, height: 48, rx: 10, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }, g);
    [-20, 12].forEach((dx) => el('rect', { x: dx, y: 14, width: 8, height: 10, rx: 2, fill: col, opacity: 0.6 }, g));
    if (label) tx(0, 4, label, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: col }, g); }
  function envelope(cx, cy, s, col) { const g = R.G(cx, cy, s ?? 1); el('rect', { x: -16, y: -11, width: 32, height: 22, rx: 3, fill: PANEL, stroke: col || INK, 'stroke-width': 2 }, g);
    el('path', { d: 'M-16,-11 L0,3 L16,-11', fill: 'none', stroke: col || INK, 'stroke-width': 2 }, g); }
  const shake = (u, a) => { const v = seg(u, a, a + 0.6); return v > 0 && v < 1 ? Math.sin(v * Math.PI * 5) * (1 - v) * 14 : 0; };

  // ---------- 1. 직접 new 하면 못 박힌다 ----------
  function s1(t, c) { const { k, u } = c, BX = 560, BY = 200;
    const inside = k >= 1, mv = k === 1 ? E(u, 0.5, 1.4) : 1;
    if (k >= 1) { card(BX, BY, 340, 200, { rx: 14, stroke: INK, sw: 2.4, s: k === 1 ? pop(u, 0.2) : 1 });
      mono(BX - 156, BY - 74, 'OrderService', { 'font-size': 16, 'font-weight': 800 }); }
    const sx = inside ? lerp(220, BX, mv) : 220, sy = inside ? lerp(180, BY + 14, mv) : 180;
    if (k !== 3) { card(sx, sy, 230, 58, { rx: 10, stroke: k === 4 ? BAD : INK, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
      envelope(sx - 88, sy, k === 0 ? pop(u, 0.4) : 1); mono(sx - 64, sy - 4, 'SmtpEmailSender', { 'font-size': 14.5, 'font-weight': 700 }); mono(sx - 64, sy + 17, 'Send(to, body)', { 'font-size': 13.5, fill: MUT }); }
    if (k === 0) { sub(220, 250, '메일을 보내는 콘크리트 클래스', fade(u, 1.0)); sub(220, 274, '아직 아무도 쓰지 않는다', fade(u, 1.4)); return; }
    if (k >= 1 && k !== 3) { lock(BX + 142, BY + 14, true, BAD, k === 1 ? pop(u, 1.5) : 1);
      mono(BX - 156, BY - 46, 'new SmtpEmailSender()', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.2) : 1 }); }
    if (k === 1) { pill(BX, 350, '교체 불가', BAD, pop(u, 2.0), { fill: BADBG }); return; }
    if (k === 2) { person(110, BY, 'Place("alice")', {}); server(860, BY - 10, 'SMTP 서버', { lamp: BAD });
      dot([[140, BY], [BX - 170, BY], [BX - 60, BY + 14]], seg(u, 0.2, 0.9), ACC, 8);
      dot([[BX + 60, BY + 14], [BX + 170, BY], [800, BY - 10]], seg(u, 0.9, 1.5), BAD, 8);
      if (u > 1.5) { envelope(860, 100 - 20 * E(u, 1.5, 2.0), 1, BAD); mono(860, 64, '[SMTP] alice: 주문 완료', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) }); }
      pill(BX, 350, '테스트를 돌려도 진짜 메일이 나간다', BAD, pop(u, 2.1), { fill: BADBG }); return; }
    if (k === 3) { el('rect', { x: BX - 150, y: BY - 34, width: 300, height: 120, rx: 10, fill: SOFT, opacity: E(u, 0.3, 1.0) });
      mono(BX, BY + 46, '?', { 'font-size': 54, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      card(BX, 50, 280, 42, { rx: 9, text: 'new OrderService()', mono: true, fs: 16, fw: 700, s: pop(u, 0.5) });
      el('rect', { x: BX + 63, y: 36, width: 24, height: 28, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.3) });
      tx(BX + 190, 56, '비어 있다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(BX, 345, '생성자만 봐서는 무엇이 필요한지 알 수 없다', fade(u, 1.8), { 'font-size': 15 }); return; }
    // k4: SendGrid 를 끼우려 해도 튕겨 나간다
    const gx = 880 + shake(u, 0.9) - 60 * E(u, 0.2, 0.9);
    plug(gx, 110, 'SendGridSender', INFO, pop(u, 0.2)); cross(gx, 160, 12, pop(u, 1.0));
    ['교체 불가', '테스트 지옥', '의존 은닉'].forEach((s, i) => pill(330 + i * 150, 360, s, BAD, pop(u, 1.4 + i * 0.3), { fill: BADBG })); }

  // ---------- 2. 인터페이스를 생성자로 받는다 ----------
  const SLOT = [640, 312];
  function s2(t, c) { const { k, u } = c;
    socket(480, 66, 250, 'IEmailSender', ACC, k === 0 ? fade(u, 0.2) : 1);
    mono(480, 112, 'void Send(to, body)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { sub(480, 170, '무엇을 하는가만 적은 약속', fade(u, 1.4), { 'font-size': 15 }); sub(480, 196, '어떻게 하는지는 여기 없다', fade(u, 1.8)); return; }
    // 구현 후보들
    const sm = k === 5 ? [lerp(SLOT[0], 270, E(u, 0.3, 1.0)), lerp(SLOT[1], 196, E(u, 0.3, 1.0))] : k >= 3 ? [lerp(270, SLOT[0], k === 3 ? E(u, 0.8, 1.7) : 1), lerp(196, SLOT[1], k === 3 ? E(u, 0.8, 1.7) : 1)] : [270, 196];
    const sg = k === 5 ? [lerp(700, SLOT[0], E(u, 1.0, 1.8)), lerp(196, SLOT[1], E(u, 1.0, 1.8))] : [700, 196];
    if (k >= 1) { [[270, 'SmtpEmailSender'], [700, 'SendGridSender']].forEach(([x], i) => grow(x, 168, lerp(x, 480, 0.55), 100, k === 1 ? E(u, 0.9 + i * 0.3, 1.5 + i * 0.3) : 1, OFF, { plain: true, dash: '4 4' }));
      if (k <= 2) tx(480, 236, '둘 다 : IEmailSender', { 'font-size': 14, fill: MUT, class: 'mono', 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 1.6) : 1 }); }
    if (k >= 2) { card(480, 312, 560, 110, { rx: 14, stroke: INK, sw: 2.4, s: k === 2 ? pop(u, 0.2) : 1 });
      mono(220, 282, k >= 3 ? 'OrderService(IEmailSender sender)' : 'OrderService', { 'font-size': 15, 'font-weight': 800, fill: k === 3 ? ACC : INK });
      mono(220, 312, '_sender : IEmailSender', { 'font-size': 14.5, fill: MUT });
      if (k === 2) { mono(220, 342, 'new SmtpEmailSender()', { 'font-size': 14, fill: OFF, opacity: 1 - fade(u, 1.0) });
        el('line', { x1: 216, y1: 337, x2: lerp(216, 400, E(u, 0.6, 1.0)), y2: 337, stroke: BAD, 'stroke-width': 2.5, opacity: 1 - fade(u, 1.0) }); }
      socket(SLOT[0], SLOT[1] + 8, 200, null, ACC, k === 2 ? fade(u, 1.1) : 1); }
    if (k === 2) sub(480, 400, '클래스 안의 new 가 사라졌다', fade(u, 1.6), { 'font-size': 15 });
    plug(sm[0], sm[1], 'SmtpEmailSender', ACC, k === 1 ? pop(u, 0.3) : 1);
    plug(sg[0], sg[1], 'SendGridSender', INFO, k === 1 ? pop(u, 0.6) : 1);
    if (k === 3) { grow(40, 250, 140, 250, E(u, 0.2, 0.8), ACC); tx(40, 236, '조립부가 넣어 준다', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      sub(800, 400, '생성 책임이 밖으로 = 제어 역전', fade(u, 1.9), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }
    if (k === 4) { plug(880, 196, 'FakeSender', WARN, pop(u, 0.3), { dash: '5 3' }); tx(880, 246, '테스트용', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
      dot([[300, 330], [SLOT[0] - 60, 330], [SLOT[0], 300]], seg(u, 1.0, 1.9), ACC, 8); sub(330, 400, '_sender.Send(…) 만 부른다', fade(u, 1.4)); }
    if (k === 5) { card(860, 400, 180, 34, { rx: 17, text: '수정한 줄: 0', fs: 15, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.9) }); check(780, 400, 10, pop(u, 2.0)); } }

  // ---------- 3. 컨테이너와 세 수명 ----------
  const REG = [['IClock', 'SystemClock', 'Singleton', ACC], ['IOrderRepository', 'OrderRepository', 'Scoped', INFO], ['IEmailSender', 'SmtpEmailSender', 'Transient', WARN], ['OrderService', 'OrderService', 'Scoped', INFO]];
  function regTable(k, u) { const x = 24, y = 34, w = 540, rh = 34, n = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : 4;
    zone(x, y, w, 48 + 4 * rh, 'DI 컨테이너  builder.Services', { fill: SOFT });
    ['서비스', '구현', '수명'].forEach((h, i) => tx(x + [16, 200, 400][i], y + 46, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }));
    if (!n) mono(x + 16, y + 84, '(비어 있음)', { 'font-size': 14.5, fill: OFF });
    REG.slice(0, n).forEach(([a, b, l, col], i) => { const fresh = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i >= 2), op = fresh ? fade(u, 0.3 + (i === 3 ? 0.6 : 0)) : 1, yy = y + 70 + i * rh;
      const dx = fresh ? lerp(-30, 0, E(u, 0.3 + (i === 3 ? 0.6 : 0), 0.9 + (i === 3 ? 0.6 : 0))) : 0;
      mono(x + 16 + dx, yy, a, { 'font-size': 14, 'font-weight': 700, opacity: op }); mono(x + 200 + dx, yy, b, { 'font-size': 14, opacity: op });
      pill(x + 440 + dx, yy - 5, l, col, op, { fs: 13.5 }); });
    return y + 48 + 4 * rh; }
  function lanes(k, u) { const x0 = 600, x1 = 940, ys = [104, 138, 172];
    tx(x0, 56, '요청 1', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(790, 56, '요청 2', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    el('line', { x1: 770, y1: 44, x2: 770, y2: 190, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    if (k >= 1) { const g = k === 1 ? E(u, 0.8, 1.8) : 1; el('rect', { x: x0, y: ys[0] - 10, width: (x1 - x0) * g, height: 20, rx: 10, fill: ACC, opacity: 0.8 }); }
    if (k >= 2) [[x0, 760], [780, x1]].forEach(([a, b], i) => { const g = k === 2 ? E(u, 0.8 + i * 0.5, 1.4 + i * 0.5) : 1; el('rect', { x: a, y: ys[1] - 10, width: (b - a) * g, height: 20, rx: 10, fill: INFO, opacity: 0.8 }); });
    if (k >= 3) for (let i = 0; i < 6; i++) { const cx = [620, 670, 720, 800, 850, 900][i], s = k === 3 ? pop(u, 0.8 + i * 0.18) : 1; el('circle', { cx, cy: ys[2], r: 9 * s, fill: WARN, opacity: 0.85 }); } }
  function s3(t, c) { const { k, u } = c;
    const bottom = regTable(k, u); lanes(k, u);
    if (k === 0) { sub(780, 120, '인터페이스 → 구현 + 수명', fade(u, 0.8), { 'font-size': 15 }); sub(780, 146, '이 표를 채워야 주입된다', fade(u, 1.3)); return; }
    if (k <= 3) { const msg = ['', '앱이 끝날 때까지 하나', '요청마다 하나', '꺼낼 때마다 새로'][k], col = [0, ACC, INFO, WARN][k];
      tx(770, 230, msg, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.6) });
      if (k === 3) sub(300, 300, 'OrderService 도 요청 단위로 등록했다', fade(u, 1.9)); return; }
    if (k === 4) { lock(560, 52, true, INK, pop(u, 0.4)); banner(300, 280, 'builder.Build() — 등록 마감', pop(u, 0.6));
      card(480, 360, 860, 58, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 1.4) });
      mono(70, 354, 'Build 뒤에 AddScoped →', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      mono(70, 376, 'InvalidOperationException: The service collection cannot be modified because it is read-only.', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 5) { // 생성자를 읽고 재귀로 조립
      const N = [['POST /orders', 110, 330, MUT], ['OrderService', 360, 330, INFO], ['OrderRepository', 640, 290, INFO], ['SmtpEmailSender', 640, 370, WARN]];
      grow(190, 330, 280, 330, E(u, 0.3, 0.7), MUT); grow(440, 322, 540, 292, E(u, 0.8, 1.2), INFO); grow(440, 338, 540, 368, E(u, 1.0, 1.4), WARN);
      N.forEach(([s, x, y, col], i) => card(x, y, tw(s, 14.5) + 30, 38, { rx: 9, text: s, mono: true, fs: 14.5, fw: 700, stroke: col, color: col === MUT ? INK : col, s: pop(u, [0.1, 0.6, 1.1, 1.3][i]) }));
      tx(360, 372, '생성자를 읽는다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      R.check(790, 330, 12, pop(u, 1.9)); tx(812, 336, '200 OK', { 'font-size': 15, 'font-weight': 800, fill: GOOD, class: 'mono', opacity: fade(u, 2.0) }); return; }
    // k6: 실제 인스턴스 번호
    const cols = [['Singleton', ACC, ['#1 #1', '#1 #1']], ['Scoped', INFO, ['#2 #2', '#5 #5']], ['Transient', WARN, ['#3 #4', '#6 #7']]];
    tx(40, 272, '같은 스코프에서 두 번씩 꺼낸 인스턴스 번호 (실제 출력)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.1) });
    ['요청 1', '요청 2'].forEach((r, j) => tx(60, 330 + j * 50, r, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }));
    cols.forEach(([h, col, v], i) => { const x = 280 + i * 220; tx(x, 300, h, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.2) });
      v.forEach((s, j) => card(x, 325 + j * 50, 150, 36, { rx: 8, text: s, mono: true, fs: 16, fw: 800, stroke: col, color: col, fill: PANEL, s: pop(u, 0.6 + i * 0.35 + j * 0.2) })); }); }

  // ---------- 4. 테스트에서 갈아 끼우기 · 옵션 ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { const cnt = k === 2 ? Math.round(tween(0, 1, u, 0.3)) : 0, ins = k === 0 ? 0 : k === 1 ? E(u, 0.5, 1.4) : 1;
      if (k >= 1) { card(640, 150, 360, 120, { rx: 14, stroke: INK, sw: 2.4, s: k === 1 ? pop(u, 0.2) : 1 }); mono(476, 112, 'OrderService', { 'font-size': 15, 'font-weight': 800 });
        socket(700, 176, 200, null, ACC); mono(476, 300, 'var svc = new OrderService(fake);', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.3) : 1 }); }
      plug(lerp(240, 700, ins), lerp(170, 168, ins), 'FakeEmailSender', WARN, k === 0 ? pop(u, 0.3) : 1);
      obj(150, 250, 190, 'fake', [['SentCount', String(cnt), 1]], { vbg: k === 2 && u > 1 ? GOODBG : SOFT, head: WARNBG, hc: WARN, op: k === 0 ? fade(u, 0.9) : 1 });
      if (k === 0) { sub(560, 120, '같은 계약을 지키되 네트워크 대신 횟수만 센다', fade(u, 1.4), { 'font-size': 15 }); return; }
      server(880, 330, 'SMTP 서버', { op: 0.45 }); cross(880, 320, 16, k === 1 ? pop(u, 1.6) : 1);
      if (k === 2) { dot([[480, 150], [620, 150], [700, 170], [300, 285]], seg(u, 0.2, 1.1), ACC, 8); mono(476, 345, 'svc.Place("alice");', { 'font-size': 14.5, opacity: fade(u, 0.1) });
        mono(476, 380, 'Assert.Equal(1, fake.SentCount);', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); check(778, 376, 11, pop(u, 1.9)); }
      return; }
    // 옵션 패턴
    jbox(30, 70, ['{', '  "Email": {', '    "Host": "...",', '    "Retries": 3', '  }', '}'], { title: 'appsettings.json', op: k === 3 ? fade(u, 0.2) : 1 });
    const ga = k === 3 ? E(u, 0.6, 1.2) : 1; grow(250, 140, 400, 140, ga, ACC); mono(325, 124, 'Configure<T>', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: ga });
    obj(410, 90, 250, 'EmailOptions', [['Host', '"..."', k === 3 ? E(u, 1.1, 1.6) : 1], ['Retries', '3', k === 3 ? E(u, 1.4, 1.9) : 1]]);
    if (k === 3) { sub(330, 300, '설정 한 섹션이 타입 하나로 묶인다', fade(u, 2.0), { 'font-size': 15 }); return; }
    grow(660, 140, 720, 140, E(u, 0.3, 0.8), ACC);
    card(830, 140, 210, 92, { rx: 12, stroke: INK, sw: 2.2, s: pop(u, 0.6) }); mono(830, 124, 'Svc(', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8) });
    mono(830, 150, 'IOptions<EmailOptions>', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9) }); mono(830, 172, 'opt)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) });
    [['appsettings.Development.json', 260], ['appsettings.Production.json', 330]].forEach(([s, y], i) => pill(250, y, s, INFO, pop(u, 1.3 + i * 0.3), { mono: true, fs: 13.5, fill: INFOBG }));
    grow(420, 295, 520, 200, E(u, 1.8, 2.3), INFO, { dash: '4 4' });
    tx(600, 320, '환경마다 값만 갈아 끼우고, 서비스는 파일을 모른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ---------- 5. 지뢰: 수명 불일치 · 우회 · 로케이터 · 순환 ----------
  function timeline(k, u) { const x0 = 140, x1 = 920;
    tx(24, 96, 'Singleton', { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); tx(24, 196, '요청 (Scoped)', { 'font-size': 14.5, 'font-weight': 800, fill: INFO });
    const g = k === 0 ? E(u, 0.2, 0.9) : 1; el('rect', { x: x0, y: 80, width: (x1 - x0) * g, height: 26, rx: 13, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
    mono(x0 + 14, 98, 'CacheService', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: g });
    [[150, 360], [400, 640], [680, 910]].forEach(([a, b], i) => { const s = k === 0 ? E(u, 0.7 + i * 0.25, 1.1 + i * 0.25) : 1;
      el('rect', { x: a, y: 180, width: (b - a) * s, height: 26, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      mono(a + 12, 198, 'AppDb #' + (i + 1) + ' 이어야 할 자리', { 'font-size': 13.5, fill: INFO, opacity: s * 0.8 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { timeline(k, u);
      const cg = k === 0 ? E(u, 1.4, 2.4) : 1; el('rect', { x: 150, y: 132, width: 770 * cg, height: 26, rx: 8, fill: BAD, opacity: 0.85 });
      mono(164, 150, 'AppDb #1 이 붙들려 앱 내내 하나', { 'font-size': 14, 'font-weight': 700, fill: PANEL, opacity: cg > 0.5 ? 1 : 0 });
      if (k === 0) { sub(480, 260, '검증을 끈 채 돌리면 다른 요청도 같은 AppDb 를 받았다 (실제 실행)', fade(u, 2.2), { 'font-size': 14.5 }); return; }
      if (k === 1) { card(480, 300, 880, 74, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 0.3) });
        mono(60, 292, 'InvalidOperationException:', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.6) });
        mono(60, 318, "Cannot consume scoped service 'AppDb' from singleton 'CacheService'.", { 'font-size': 14, fill: BAD, opacity: fade(u, 0.9) });
        sub(480, 380, '개발 환경에서는 컨테이너가 조립할 때 이렇게 막는다', fade(u, 1.7), { 'font-size': 15 }); return; }
      // k2: 검증을 켜면 오류가 기동 시점으로 당겨진다
      [['ValidateScopes', 50], ['ValidateOnBuild', 290]].forEach(([s, x], i) => { const on = E(u, 0.3 + i * 0.4, 0.7 + i * 0.4);
        el('rect', { x, y: 250, width: 52, height: 28, rx: 14, fill: on > 0.5 ? GOOD : OFF }); el('circle', { cx: x + lerp(14, 38, on), cy: 264, r: 10, fill: PANEL });
        mono(x + 62, 270, s + ' = true', { 'font-size': 14.5, 'font-weight': 700, fill: on > 0.5 ? GOOD : MUT }); });
      el('line', { x1: 60, y1: 340, x2: 920, y2: 340, stroke: MUT, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' });
      [['기동', 120], ['첫 요청', 420], ['운영 중', 800]].forEach(([s, x]) => { el('line', { x1: x, y1: 332, x2: x, y2: 348, stroke: MUT, 'stroke-width': 2 }); tx(x, 372, s, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); });
      const ex = lerp(800, 120, E(u, 1.2, 2.2)); cross(ex, 314, 11, 1); tx(ex, 296, '오류', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); return; }
    if (k === 3) { zone(40, 60, 520, 200, '컨테이너가 만든 객체', { fill: SOFT, stroke: GRID, sw: 1.5 });
      const chain = [['컨테이너', 110], ['OrderService', 280], ['IEmailSender', 460]];
      chain.forEach(([s, x], i) => { card(x, 150, tw(s, 14) + 26, 36, { rx: 8, text: s, mono: true, fs: 14, s: pop(u, 0.2 + i * 0.2) }); if (i) grow(chain[i - 1][1] + 60, 150, x - 62, 150, E(u, 0.4 + i * 0.2, 0.8 + i * 0.2), INK); });
      card(760, 150, 300, 44, { rx: 9, text: 'new OrderService(new Smtp…)', mono: true, fs: 14, stroke: BAD, color: BAD, dash: '6 4', s: pop(u, 1.2) });
      tx(760, 206, '컨테이너 밖에 생긴 객체', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      ['수명 관리 없음', '교체 안 됨'].forEach((s, i) => pill(680 + i * 160, 270, s, BAD, pop(u, 1.8 + i * 0.2), { fill: BADBG }));
      sub(300, 300, '테스트에서 손으로 넣는 것과는 다른 일이다', fade(u, 2.1)); return; }
    if (k === 4) { card(480, 210, 380, 170, { rx: 14, stroke: INK, sw: 2.4, s: pop(u, 0.2) }); mono(310, 152, 'OrderService()', { 'font-size': 16, 'font-weight': 800 });
      mono(310, 200, 'var s = provider', { 'font-size': 14.5, opacity: fade(u, 0.5) }); mono(330, 224, '.GetService<IEmailSender>();', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.7) });
      el('rect', { x: 296, y: 180, width: 368, height: 110, rx: 10, fill: SOFT, opacity: E(u, 1.2, 1.8) });
      mono(480, 260, '?', { 'font-size': 50, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 340, '의존이 다시 클래스 안으로 숨는다', fade(u, 1.9), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    // k5: 순환 의존 + 지뢰 넷
    const r = 70, cx = 220, cy = 160, s = pop(u, 0.2);
    card(cx - r, cy, 70, 48, { rx: 10, text: 'A', mono: true, fs: 20, fw: 800, stroke: BAD, color: BAD, s }); card(cx + r, cy, 70, 48, { rx: 10, text: 'B', mono: true, fs: 20, fw: 800, stroke: BAD, color: BAD, s });
    el('path', { d: `M${cx - r + 20},${cy - 28} Q${cx},${cy - 90} ${cx + r - 20},${cy - 28}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'marker-end': 'url(#ra-ahr)', opacity: fade(u, 0.5) });
    el('path', { d: `M${cx + r - 20},${cy + 28} Q${cx},${cy + 90} ${cx - r + 20},${cy + 28}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'marker-end': 'url(#ra-ahr)', opacity: fade(u, 0.8) });
    mono(380, 140, "A circular dependency was detected", { 'font-size': 14, fill: BAD, opacity: fade(u, 1.1) }); mono(380, 164, "for the service of type 'A'.", { 'font-size': 14, fill: BAD, opacity: fade(u, 1.1) });
    mono(380, 190, 'A -> B -> A', { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.3) });
    [['수명 불일치', '수명을 맞춘다'], ['new 우회', '컨테이너로 받는다'], ['서비스 로케이터', '생성자로 받는다'], ['순환 의존', '설계를 나눈다']].forEach(([a, b], i) => {
      const x = 130 + i * 233, sc = pop(u, 1.5 + i * 0.15); pill(x, 300, a, BAD, sc, { fill: BADBG, fs: 14 }); tx(x, 344, b, { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7 + i * 0.15) }); }); }

  const quiz = [
    { q: 'OrderService 안에서 new SmtpEmailSender()를 직접 만들 때 생기지 않는 문제는 무엇인가?',
      o: ['SendGrid로 바꾸려면 OrderService를 고쳐야 한다', '테스트 중에도 진짜 메일이 나간다', '컴파일이 되지 않는다'], a: 2,
      why: '코드는 잘 돈다. 문제는 교체 불가, 테스트 때 진짜 SMTP 호출, 생성자에 드러나지 않는 숨은 의존 세 가지다.' },
    { q: '제어 역전(IoC)이 가리키는 변화는 무엇인가?',
      o: ['구현을 클래스가 직접 만들던 것을 밖에서 받아 쓰게 된다', '인터페이스를 구현이 상속하게 된다', '메서드 호출 순서가 거꾸로 된다'], a: 0,
      why: 'OrderService(IEmailSender sender)처럼 생성자로 받으면 무엇을 넣을지는 조립부가 정한다. 그래서 구현을 바꿔도 OrderService는 0줄 수정이다.' },
    { q: '요청 두 번에서 Scoped 서비스를 두 번씩 꺼냈을 때 실제로 나온 번호는 무엇인가?',
      o: ['#1 #1 | #1 #1', '#2 #2 | #5 #5', '#3 #4 | #6 #7'], a: 1,
      why: 'Scoped는 한 요청 안에서는 같은 객체, 새 요청이면 새 객체다. #1 #1은 Singleton, #3 #4는 Transient의 결과였다.' },
    { q: 'new OrderService(fake)로 테스트할 때 얻는 것은 무엇인가?',
      o: ['컨테이너 없이도 의존을 바꿔 끼워 발송 호출만 검증한다', 'SMTP 서버가 더 빨리 응답한다', 'OrderService의 코드가 자동으로 바뀐다'], a: 0,
      why: 'Fake는 같은 계약을 지키며 횟수만 센다. Place 한 번 뒤 SentCount가 1인지 보면 네트워크 없이 검증이 끝난다.' },
    { q: 'Singleton CacheService가 Scoped AppDb를 생성자로 받으면 개발 환경에서 무슨 일이 생기는가?',
      o: ['조용히 잘 돈다', "Cannot consume scoped service 예외가 난다", 'AppDb가 Transient로 바뀐다'], a: 1,
      why: '검증이 켜져 있으면 컨테이너가 조립 시점에 막는다. 검증을 끄면 다른 요청도 같은 AppDb를 받는 것을 실제로 확인했다.' },
  ];

  const summary = [
    '클래스 안에서 new로 의존을 만들면 교체도 테스트도 막히고 무엇이 필요한지도 숨는다.',
    '인터페이스에 의존하고 생성자로 받으면 무엇을 넣을지는 조립부가 정한다.',
    'Singleton은 앱에 하나, Scoped는 요청마다 하나, Transient는 꺼낼 때마다 새로 만든다.',
    'Singleton에 Scoped를 넣거나 new와 GetService로 컨테이너를 우회하면 DI가 무너진다.',
  ];
  const review = [
    { q: '주문 저장 로직만 검증하고 싶은데 테스트를 돌릴 때마다 실제 메일이 나간다. 먼저 바꿀 것은?',
      o: ['테스트 환경의 SMTP 서버 주소를 바꾼다', 'OrderService가 IEmailSender를 생성자로 받게 하고 테스트에서 Fake를 넣는다', '메일 발송 코드를 try/catch로 감싼다'], a: 1,
      why: '의존을 생성자로 받으면 테스트에서 new OrderService(fake) 한 줄로 바꿔 끼울 수 있다. 그러면 SentCount만으로 호출을 검증한다.' },
    { q: '요청마다 깨끗해야 할 DbContext에 이전 요청의 데이터가 남아 있다. 등록 코드에서 먼저 의심할 것은?',
      o: ['DbContext를 받는 서비스가 Singleton으로 등록되어 있다', 'DbContext가 Scoped로 등록되어 있다', 'Transient 서비스가 너무 많다'], a: 0,
      why: 'Singleton이 Scoped를 붙들면 그 객체가 앱 내내 하나로 굳는다. ValidateScopes를 켜 두면 조립 시점에 예외로 드러난다.' },
    { q: '메일 발송기를 SendGrid로 바꿨더니 OrderService 파일은 그대로인데 Program.cs 한 줄만 바뀌었다. 이렇게 된 까닭은?',
      o: ['SendGrid가 SmtpEmailSender를 상속했기 때문이다', 'Transient로 등록하면 자동으로 바뀌기 때문이다', 'OrderService가 IEmailSender 계약만 알고 구현은 컨테이너 등록이 정하기 때문이다'], a: 2,
      why: '구현 선택은 AddTransient<IEmailSender, …> 등록 한 곳에 모여 있다. 서비스는 계약만 부르니 고칠 곳이 없다.' },
  ];

  R.page({ title: '의존성 주입 — 플러그와 컨테이너', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
