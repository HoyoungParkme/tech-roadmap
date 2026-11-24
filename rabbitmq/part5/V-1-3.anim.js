/* V-1-3 vhost · 사용자 권한 · TLS · SASL — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 아래 게이트 줄(TLS → SASL → vhost → 큐)의 상태는 페이지 STEPS 의 gates 데이터를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, browser, cross, check, lock, terminal, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const GS = { idle: [OFF, PANEL], active: [ACC, ACCBG], success: [GOOD, GOODBG], warn: [WARN, WARNBG], error: [BAD, BADBG] };
  // 아래 게이트 줄: beat.gates 의 상태 색. 이름은 짧게
  function gates(c, y) { const g = (c.beat && c.beat.gates) || []; y = y || 392; const names = ['TLS', 'SASL', 'vhost 권한', '큐 접근'];
    g.forEach((q, i) => { const [col, bg] = GS[q.state] || GS.idle, x = 150 + i * 220;
      card(x, y, 170, 36, { rx: 18, stroke: col, fill: bg, sw: 2, text: names[i] || q.name, fs: 14.5, color: q.state === 'idle' ? MUT : col });
      if (i < g.length - 1) el('line', { x1: x + 88, y1: y, x2: x + 132, y2: y, stroke: GRID, 'stroke-width': 2.5 }); }); }
  function queue(x, y, w, name, n, o) { o = o || {};
    el('rect', { x, y: y - 18, width: w, height: 36, rx: 18, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2, opacity: o.op ?? 1 });
    for (let i = 0; i < (n || 0); i++) el('rect', { x: x + w - 24 - i * 16, y: y - 9, width: 12, height: 18, rx: 2, fill: o.fill || OFF, opacity: o.op ?? 1 });
    if (name) mono(x + 12, y + 5, name, { 'font-size': 14, 'font-weight': 700, opacity: o.op ?? 1 }); }
  function certCard(cx, cy, cn, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -70, y: -36, width: 140, height: 72, rx: 6, fill: PANEL, stroke: o.col || GOOD, 'stroke-width': 2.2 }, g);
    el('circle', { cx: 48, cy: 18, r: 10, fill: o.col || GOOD, opacity: 0.8 }, g);
    tx(-58, -12, o.title || '인증서', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }, g); tx(-58, 12, cn, { 'font-size': 14.5, 'font-weight': 800, class: 'mono' }, g); return g; }

  // ---------- 1. vhost ----------
  const VH = [['/', WARN], ['/prod', GOOD], ['/staging', INFO], ['/analytics', INFO]];
  function broker(k, u, o) { o = o || {}; zone(40, 40, 880, 300, 'RabbitMQ 브로커 (노드 하나)', { fill: SOFT });
    VH.forEach(([n, col], i) => { const x = 60 + i * 215, sc = o.grow ? E(u, 0.2 + i * 0.35, 0.7 + i * 0.35) : 1; if (i > 0 && sc <= 0) return;
      el('rect', { x, y: 80, width: 200 * (i === 0 ? 1 : sc), height: 240, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': i === 0 ? '6 5' : null });
      if (sc > 0.9) mono(x + 14, 108, n, { 'font-size': 17, 'font-weight': 800, fill: col }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { broker(k, u, { grow: true }); sub(160, 300, '기본 vhost', 1, { fill: WARN });
      note(60, 384, 'add_vhost 한 줄마다 독립된 네임스페이스가 생긴다', fade(u, 1.8)); return; }
    broker(k, u);
    if (k === 1) { pill(375, 150, 'production', GOOD, pop(u, 0.3), { fs: 14 }); pill(590, 150, 'non-production', INFO, pop(u, 0.8), { fs: 14 });
      sub(160, 150, '태그 없음 · 용도 불명', fade(u, 1.2), { fill: WARN });
      note(60, 384, '태그는 표시용 메타데이터 · 권한은 바뀌지 않는다', fade(u, 1.8)); return; }
    if (k === 2) { terminal(240, 120, 480, 180, ['$ rabbitmqctl list_vhosts name tracing', 'name        tracing', '/           false', '/prod       false', '/staging    false', '/analytics  false'], lerp(0, 6, E(u, 0.2, 2.0)), { fs: 14 });
      note(60, 384, '만든 4개가 다 보이는지 눈으로 확인한다', fade(u, 2.1)); return; }
    if (k === 3) { el('rect', { x: 60, y: 80, width: 200, height: 240, rx: 10, fill: WARNBG, opacity: 0.6 * fade(u, 0.2) });
      for (let i = 0; i < 5; i++) el('rect', { x: 90 + (i % 3) * 50, y: 150 + Math.floor(i / 3) * 40, width: 36, height: 24, rx: 4, fill: OFF, opacity: fade(u, 0.3 + i * 0.1) });
      sub(160, 250, '예제·테스트 잔재', fade(u, 0.9), { fill: WARN, 'font-weight': 700 });
      mono(300, 384, '# rabbitmqctl delete_vhost /', { 'font-size': 16, fill: MUT, opacity: fade(u, 1.2) }); lock(620, 380, true, WARN, pop(u, 1.6));
      note(650, 386, '주석 · 실행 안 함', fade(u, 1.7), { fill: WARN }); return; }
    // k4: 같은 이름, 다른 큐
    queue(285, 200, 180, 'orders.queue', 3, { stroke: GOOD }); queue(500, 200, 180, 'orders.queue', 1, { stroke: INFO }); queue(715, 200, 180, 'events.queue', 2, {});
    person(375, 290, null, { s: 0.55 }); person(590, 290, null, { s: 0.55 });
    dot([[375, 270], [375, 222]], seg(u, 0.3, 1.0), GOOD, 6); dot([[590, 270], [590, 222]], seg(u, 0.5, 1.2), INFO, 6);
    if (u > 1.3) { el('path', { d: 'M590,268 Q520,230 400,215', fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.3) }); cross(490, 236, 10, pop(u, 1.6)); }
    card(480, 384, 430, 40, { rx: 20, stroke: ACC, text: '큐 식별자 = (vhost, 큐 이름)', fs: 16, color: ACC, s: pop(u, 2.0) }); }

  // ---------- 2. 사용자 · 권한 정규식 ----------
  const PERM = ['configure', 'write', 'read'];
  function userCard(x, y, name, tag, regs, o) { o = o || {}; card(x + 200, y + 110, 400, 220, { rx: 12, stroke: o.col || INK, sw: 2.5, s: o.s ?? 1 });
    person(x + 40, y + 36, null, { s: 0.6, stroke: o.col || INK }); mono(x + 74, y + 42, name, { 'font-size': 18, 'font-weight': 800 });
    pill(x + 320, y + 36, tag ? 'tag: ' + tag : 'tag 없음', tag ? INFO : MUT, 1, { fs: 13.5 });
    PERM.forEach((p, i) => { const yy = y + 96 + i * 44; mono(x + 24, yy + 5, p, { 'font-size': 15, fill: MUT });
      card(x + 270, yy, 200, 34, { rx: 6, stroke: regs[i] ? ACC : GRID, dash: regs[i] ? null : '5 4', fill: regs[i] ? ACCBG : PANEL });
      mono(x + 186, yy + 5, regs[i] || '(없음)', { 'font-size': 15, 'font-weight': 800, fill: regs[i] ? INK : MUT }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { userCard(60, 60, 'app_prod', null, [null, null, null], { s: pop(u, 0.2) });
      browser(720, 150, 200, 120, 'Management UI', { op: fade(u, 0.9) }); cross(720, 160, 16, pop(u, 1.3));
      note(560, 300, 'tag 가 없으면 UI 로그인 불가', fade(u, 1.5)); note(560, 330, '권한이 없으니 아무것도 못 만진다', fade(u, 1.9), { fill: WARN }); return; }
    if (k === 1) { const ty = (s, a) => s.slice(0, Math.round(s.length * E(u, a, a + 0.5)));
      userCard(60, 60, 'app_prod', null, [ty('^$', 0.2) || ' ', ty('^orders\\.', 0.8) || ' ', ty('^orders\\.', 1.4) || ' ']);
      mono(560, 120, 'set_permissions -p /prod app_prod', { 'font-size': 14.5, 'font-weight': 700 });
      mono(560, 150, '"^$" "^orders\\." "^orders\\."', { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      note(560, 210, '인자 순서 = configure, write, read', fade(u, 2.0), { fill: WARN }); note(560, 240, '순서를 바꾸면 정반대 권한이 열린다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 2) { // 리소스 이름을 정규식에 대 본다
      const rows = [['configure', '^$', 'orders.queue', false], ['write', '^orders\\.', 'orders.queue', true], ['read', '^orders\\.', 'orders.dlq', true], ['read', '^orders\\.', 'payments.queue', false]];
      ['권한', '정규식', '리소스', '판정'].forEach((h, j) => tx([80, 240, 440, 700][j], 70, h, { 'font-size': 14.5, fill: MUT, 'font-weight': 700 }));
      rows.forEach(([p, re, res, ok], i) => { const y = 120 + i * 62, a = 0.2 + i * 0.5;
        mono(80, y + 5, p, { 'font-size': 15, opacity: fade(u, a) }); mono(240, y + 5, re, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, a) });
        card(510, y, 150, 34, { rx: 6, text: res, fs: 14, mono: true, stroke: ok ? GOOD : BAD, s: pop(u, a + 0.15) });
        (ok ? check : cross)(710, y, 11, pop(u, a + 0.35)); tx(735, y + 5, ok ? '허용' : i === 0 ? '선언 거부' : 'ACCESS_REFUSED', { 'font-size': 14.5, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, a + 0.35), class: ok || i === 0 ? null : 'mono' }); });
      note(80, 392, '^$ 는 빈 이름에만 맞는다 · 사실상 전면 금지', fade(u, 2.3)); return; }
    if (k === 3) { userCard(60, 60, 'ops_view', 'monitoring', ['^$', '^$', '^$'], { col: INFO, s: pop(u, 0.2) });
      browser(720, 130, 200, 120, 'UI 조회 가능', { op: fade(u, 0.8), stroke: GOOD });
      R.line(R.axes(640, 95, 160, 70, { x: [0, 6], y: [0, 6] }), [[0, 1], [1, 3], [2, 2], [3, 4], [4, 3], [5, 5]], E(u, 0.9, 1.6), GOOD);
      person(600, 310, null, { s: 0.55, op: fade(u, 1.4) }); grow(630, 310, 760, 310, E(u, 1.5, 1.9), MUT); cross(700, 310, 10, pop(u, 1.9));
      tx(780, 316, 'publish·consume 불가', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    terminal(60, 50, 520, 230, ['$ rabbitmqctl list_permissions -p /prod', 'user      configure  write      read', 'app_prod  ^$         ^orders\\.  ^orders\\.', 'ops_view  ^$         ^$         ^$', '$ rabbitmqctl list_users', 'app_prod  []', 'ops_view  [monitoring]'], lerp(0, 7, E(u, 0.2, 2.0)), { fs: 14 });
    note(620, 110, 'tag 는 UI 범위', fade(u, 1.4), { fill: INFO }); note(620, 140, '권한 정규식은 AMQP 리소스', fade(u, 1.6), { fill: ACC });
    note(620, 200, '앱 계정 열에 .* 가 보이면', fade(u, 2.0), { fill: WARN }); note(620, 228, '바로 좁힌다', fade(u, 2.1), { fill: WARN }); }

  // ---------- 3. TLS ----------
  function s3(t, c) { const { k, u } = c; gates(c);
    const CL = [110, 170], BR = [800, 170];
    if (k === 0) { person(CL[0], CL[1], 'client', { s: 0.85 }); server(BR[0], BR[1], 'broker', { s: 0.8 });
      const cut = E(u, 1.5, 2.0);
      el('line', { x1: 150, y1: 170, x2: 740, y2: 170, stroke: cut > 0 ? OFF : MUT, 'stroke-width': 3, 'stroke-dasharray': cut > 0 ? '6 6' : null });
      if (cut <= 0) { fly(150, 150, 740, 150, seg(u, 0.2, 1.3), 'password: S3cure-Pass!', { mono: true, fill: BAD }); }
      el('circle', { cx: 450, cy: 240, r: 16, fill: PANEL, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.6) }); el('circle', { cx: 450, cy: 240, r: 6, fill: BAD, opacity: fade(u, 0.6) });
      tx(480, 246, '도청자에게 그대로 보인다 (5672 평문)', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.7) });
      pill(450, 310, 'listeners.tcp = none', ACC, pop(u, 1.5), { mono: true, fs: 14 }); if (cut > 0) cross(720, 170, 12, cut); return; }
    if (k === 1) { person(CL[0], CL[1], 'client', { s: 0.85 }); server(BR[0], BR[1], null, { s: 0.8 }); mono(BR[0], 240, ':5671 amqps', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      ['ca_certificate.pem', 'server_certificate.pem', 'server_key.pem'].forEach((f, i) => fly(800, 230, [250, 470, 700][i], 300, seg(u, 0.2 + i * 0.3, 0.8 + i * 0.3), f, { mono: true, fill: INFO, stay: true }));
      mono(560, 60, '3개 파일 · CA · 서버 인증서 · 개인키', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.3) });
      [['1 ClientHello', 140], ['2 서버 인증서 → CA 로 검증', 200], ['4 암호화 채널', 260]].forEach(([s, y], i) => { const a = 1.3 + i * 0.35;
        grow(i === 1 ? 740 : 150, y, i === 1 ? 160 : 740, y, E(u, a, a + 0.35), i === 1 ? GOOD : ACC); tx(450, y - 8, s, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, a + 0.2) }); });
      sub(450, 350, '단방향 TLS · 클라이언트 인증서는 아직 안 본다', fade(u, 2.3)); return; }
    if (k === 2) { server(BR[0], 170, 'broker :5671', { s: 0.8 });
      person(110, 100, null, { s: 0.7 }); certCard(250, 100, 'CN=app_prod', { s: pop(u, 0.2) }); grow(322, 100, 740, 150, E(u, 0.5, 1.2), GOOD); check(560, 110, 12, pop(u, 1.2));
      person(110, 260, null, { s: 0.7 }); tx(160, 266, '인증서 없음', { 'font-size': 15, fill: BAD, 'font-weight': 700 }); grow(260, 260, 560 * 1, 230, E(u, 1.2, 1.8), BAD, { plain: true }); cross(580, 228, 13, pop(u, 1.8));
      tx(600, 270, 'fail_if_no_peer_cert', { 'font-size': 14.5, class: 'mono', fill: BAD, opacity: fade(u, 1.9) }); tx(600, 294, '핸드셰이크에서 끊긴다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) });
      pill(450, 340, 'verify = verify_peer', ACC, pop(u, 2.2), { mono: true, fs: 14 }); return; }
    if (k === 3) { [['TLS 1.3', true, 'versions.1'], ['TLS 1.2', true, 'versions.2'], ['TLS 1.1', false, '목록에 없음'], ['TLS 1.0', false, '목록에 없음']].forEach(([v, ok, d], i) => {
        const y = 70 + i * 72, a = 0.2 + i * 0.4; card(300, y, 260, 52, { rx: 10, stroke: ok ? GOOD : BAD, fill: ok ? GOODBG : BADBG, s: pop(u, a) });
        mono(200, y + 6, v, { 'font-size': 18, 'font-weight': 800, fill: ok ? GOOD : BAD, opacity: fade(u, a) }); (ok ? check : cross)(400, y, 11, pop(u, a + 0.2));
        tx(480, y + 6, d, { 'font-size': 15, fill: ok ? INK : MUT, class: ok ? 'mono' : null, opacity: fade(u, a + 0.2) }); });
      note(480, 350, '목록에 없는 버전은 협상 자체가 실패한다', fade(u, 2.1)); return; }
    // k4: UI 도 HTTPS
    [[':5671', 'AMQP + TLS', GOOD, true], [':15671', 'UI HTTPS', GOOD, true], [':5672', '닫힘', BAD, false], [':15672', '사용 중단 대상', WARN, false]].forEach(([p, d, col, ok], i) => {
      const x = 140 + (i % 2) * 360, y = 90 + Math.floor(i / 2) * 120, a = 0.2 + i * 0.35; card(x + 110, y, 300, 70, { rx: 12, stroke: col, s: pop(u, a), dash: ok ? null : '6 5' });
      mono(x - 20, y + 6, p, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, a) }); tx(x + 100, y + 6, d, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) });
      if (ok) lock(x + 230, y + 4, true, GOOD, 0.8 * pop(u, a + 0.2)); });
    note(120, 330, 'AMQP 만 암호화하면 절반 · UI 비밀번호도 TLS 로', fade(u, 2.0)); }

  // ---------- 4. SASL ----------
  function tunnel(u0) { el('rect', { x: 150, y: 140, width: 590, height: 60, rx: 30, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: u0 }); tx(445, 132, 'TLS 채널 (이미 성립)', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: u0 }); }
  function s4(t, c) { const { k, u } = c; gates(c);
    if (k === 0) { tunnel(1); person(100, 170, 'client', { s: 0.8 }); server(810, 170, 'broker', { s: 0.75 });
      [['EXTERNAL', GOOD, '1순위'], ['PLAIN', WARN, '백업'], ['AMQPLAIN', OFF, '제시 안 함']].forEach(([m, col, d], i) => { const y = 260 + i * 0, x = 300 + i * 190, a = 0.3 + i * 0.4;
        card(x, 270, 170, 56, { rx: 10, stroke: col, dash: i === 2 ? '6 5' : null, s: pop(u, a) }); mono(x, 266, m, { 'font-size': 15, 'font-weight': 800, fill: col === OFF ? MUT : col, 'text-anchor': 'middle', opacity: fade(u, a) });
        tx(x, 288, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, a) }); });
      fly(760, 170, 200, 170, seg(u, 1.6, 2.4), '[EXTERNAL, PLAIN]', { mono: true, fill: INFO }); return; }
    if (k === 1) { certCard(200, 170, 'CN=app_prod', { s: pop(u, 0.2), title: 'client.pem' }); grow(280, 170, 520, 170, E(u, 0.6, 1.2), GOOD);
      pill(400, 140, 'ssl_cert_login_from = common_name', GOOD, pop(u, 0.8), { mono: true, fs: 13 });
      person(600, 170, null, { s: 0.8, op: fade(u, 1.2) }); mono(640, 176, 'user: app_prod', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.3) });
      pill(450, 270, 'rabbitmq_auth_mechanism_ssl 플러그인 필요', WARN, pop(u, 1.8), { fs: 14 }); note(240, 330, '비밀번호가 오가지 않는다 · 인증서가 곧 신원', fade(u, 2.1)); return; }
    if (k === 2) { server(800, 170, 'broker', { s: 0.75 });
      person(120, 110, null, { s: 0.6 }); mono(160, 116, 'guest@localhost', { 'font-size': 14, opacity: 1 }); grow(330, 110, 740, 150, E(u, 0.2, 0.8), MUT); sub(560, 110, '기본값은 여기서만 된다', fade(u, 0.8));
      person(120, 230, null, { s: 0.6 }); mono(160, 236, 'guest@원격', { 'font-size': 14, fill: BAD }); grow(290, 230, 560, 205, E(u, 0.8, 1.3), BAD, { plain: true }); cross(580, 200, 11, pop(u, 1.3));
      card(420, 310, 400, 46, { rx: 10, stroke: BAD, dash: '6 5', s: pop(u, 1.6) }); mono(240, 316, 'loopback_users = none', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      tx(450, 316, '→ 원격 guest 허용 (X)', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) });
      pill(760, 316, 'delete_user guest', GOOD, pop(u, 2.1), { mono: true, fs: 14 }); return; }
    if (k === 3) { card(330, 190, 300, 210, { rx: 12, stroke: INFO, s: pop(u, 0.1) }); mono(200, 110, 'ssl.SSLContext', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      [['ca.pem', '서버를 검증할 CA', 0.3], ['client.pem', 'CN=app_prod 인증서', 0.9], ['client.key', '개인키 · 유출되면 신원 도난', 1.5]].forEach(([f, d, a], i) => {
        fly(760, 120 + i * 70, 260, 150 + i * 50, seg(u, a, a + 0.5), f, { mono: true, fill: i === 2 ? WARN : INFO, stay: true });
        tx(560, 126 + i * 70, d, { 'font-size': 14, fill: i === 2 ? WARN : MUT, opacity: fade(u, a) }); });
      sub(330, 320, 'load_cert_chain(client.pem, client.key)', fade(u, 2.1), { class: 'mono' }); return; }
    // k4: 비밀번호 없이 접속
    tunnel(1); person(100, 170, null, { s: 0.8 }); server(810, 170, null, { s: 0.75 });
    card(240, 270, 300, 92, { rx: 10, fill: SOFT, stroke: GRID, s: pop(u, 0.2) });
    mono(100, 252, 'port=5671, virtual_host="/prod"', { 'font-size': 13.5, opacity: fade(u, 0.3) }); mono(100, 278, 'credentials=', { 'font-size': 13.5, opacity: fade(u, 0.4) }); mono(110, 302, 'ExternalCredentials()', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) });
    fly(160, 170, 740, 170, seg(u, 0.9, 2.0), 'CN=app_prod', { mono: true, fill: GOOD });
    note(580, 260, 'user · password 인자가 없다', fade(u, 1.8)); note(580, 290, 'TLS 인증서가 신원을 대신한다', fade(u, 2.0), { fill: GOOD }); }

  // ---------- 5. 점검 체크리스트 ----------
  const CK = ['guest 삭제', '5672 닫힘', 'mTLS 설정', 'vhost 분리', '최소 권한', 'admin 남용 없음'];
  function checklist(k, u) { zone(660, 30, 280, 330, '점검 진행', { fill: SOFT });
    CK.forEach((s, i) => { const y = 78 + i * 46, done = i < k || (i === k && u > 1.8);
      el('rect', { x: 680, y: y - 13, width: 24, height: 24, rx: 5, fill: done ? GOOD : PANEL, stroke: done ? GOOD : GRID, 'stroke-width': 2 });
      if (done) check(692, y - 1, 7, i === k ? pop(u, 1.8) : 1); tx(716, y + 5, s, { 'font-size': 15, 'font-weight': i === k ? 800 : 600, fill: done ? INK : MUT }); }); }
  function s5(t, c) { const { k, u } = c; checklist(k, u); gates(c);
    const T = (lines, title) => terminal(40, 40, 590, 250, lines, lerp(0, lines.length, E(u, 0.2, 1.7)), { fs: 13.5, title });
    if (k === 0) { T(['$ rabbitmqctl list_users | grep "^guest"', ['(출력 없음)', '#a8a29e'], ['[OK] guest 계정 없음', '#4ade80']], 'hardening_check.sh 1'); return; }
    if (k === 1) { T(['$ rabbitmq-diagnostics listeners', 'port: 25672, protocol: clustering', 'port: 5671, protocol: amqp/ssl', 'port: 15671, protocol: https', ['grep "port: 5672," → 없음 [OK]', '#4ade80']], '출력 예시');
      if (u > 1.9) { el('rect', { x: 50, y: 90, width: 112, height: 24, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.5 }); note(40, 330, 'grep "5672" 였다면 25672 에 걸려 늘 FAIL', fade(u, 2.0), { fill: BAD, 'font-size': 14.5 }); } return; }
    if (k === 2) { T(['$ rabbitmq-diagnostics tls_versions', ['tlsv1.3', '#a8a29e'], ['tlsv1.2', '#a8a29e'], '$ grep -E "verify_peer|fail_if_no_peer_cert" …', 'ssl_options.verify = verify_peer', 'ssl_options.fail_if_no_peer_cert = true', ['[OK] mTLS 설정 존재', '#4ade80']], '출력 예시'); return; }
    if (k === 3) { T(['$ rabbitmqctl list_vhosts name | grep -E "prod|staging"', '/prod', '/staging', ['[OK] 환경별 vhost 분리됨', '#4ade80']], '출력 예시'); return; }
    if (k === 4) { T(['$ rabbitmqctl list_permissions -p /prod', 'app_prod  ^$  ^orders\\.  ^orders\\.', 'ops_view  ^$  ^$  ^$'], '출력 예시');
      note(40, 330, 'configure · write · read 가 .* 인 앱 계정이 없다', fade(u, 1.9)); return; }
    T(['$ rabbitmqctl list_users | grep administrator', ['(사람 운영자만 남아야 한다)', '#a8a29e'], ['[DONE] 3중 게이트 점검 완료', '#4ade80']], 'hardening_check.sh 6');
    note(40, 330, '앱 계정은 administrator 를 갖지 않는다', fade(u, 1.9)); }

  const quiz = [
    { q: '/prod의 orders.queue와 /staging의 orders.queue는 어떤 관계인가?',
      o: ['같은 큐를 두 이름으로 부르는 것이다', '이름만 같은 서로 다른 큐다', '나중에 만든 쪽이 앞의 큐를 덮어쓴다'], a: 1,
      why: '큐는 (vhost, 이름)으로 구별된다. 환경을 vhost로 나누면 같은 이름이어도 사고가 서로 번지지 않는다.' },
    { q: 'set_permissions -p /prod app_prod "^$" "^orders\\." "^orders\\." 에서 payments.queue를 consume하면 어떻게 되는가?',
      o: ['허용된다', 'configure 권한이 없어 선언부터 실패한다', 'read 정규식에 맞지 않아 ACCESS_REFUSED가 난다'], a: 2,
      why: '세 번째 인자 read가 consume 권한이다. ^orders\\.는 payments.queue에 맞지 않아 거부된다.' },
    { q: 'ssl_options.fail_if_no_peer_cert = true일 때 인증서가 없는 클라이언트는 어디서 막히는가?',
      o: ['TLS 핸드셰이크 단계', 'SASL 인증 단계', 'vhost 권한 검사 단계'], a: 0,
      why: 'verify_peer와 함께 쓰면 브로커가 클라이언트 인증서를 요구하고, 없으면 핸드셰이크에서 연결을 끊는다.' },
    { q: 'loopback_users = none을 넣으면 guest 계정은 어떻게 되는가?',
      o: ['어디서도 로그인할 수 없다', '원격에서도 로그인할 수 있게 된다', 'EXTERNAL로만 로그인된다'], a: 1,
      why: 'loopback_users는 localhost에서만 로그인되는 사용자 목록이다. none으로 비우면 guest의 제한이 풀린다. 막으려면 guest를 지운다.' },
    { q: 'rabbitmq-diagnostics listeners | grep -q "5672"로 평문 포트를 검사하면 생기는 문제는 무엇인가?',
      o: ['클러스터링 포트 25672에도 걸려 5672를 닫아도 FAIL이 난다', '5671에도 걸려 TLS를 끄게 된다', 'grep이 아무 줄도 찾지 못한다'], a: 0,
      why: '"5672"는 25672와 15672에도 들어 있다. "port: 5672," 처럼 정확히 맞춰야 한다.' },
  ];

  const summary = [
    'vhost는 큐·exchange·권한을 나누는 이름 공간이라 같은 이름의 큐도 환경마다 따로 산다.',
    '권한은 vhost마다 configure, write, read 정규식 세 개로 주고 ^$에서 시작해 넓힌다.',
    '5672를 닫고 5671에 TLS를 걸면 인증서가 없는 연결은 핸드셰이크에서 끊긴다.',
    'EXTERNAL은 인증서 CN을 사용자로 써서 비밀번호를 보내지 않는다. guest는 지운다.',
  ];
  const review = [
    { q: '앱 계정 권한을 ".*" ".*" ".*"로 줬더니 앱 버그로 남의 큐가 지워졌다. 먼저 고칠 것은?',
      o: ['configure를 ^$로, write·read를 쓰는 이름의 접두사로 좁힌다', 'TLS 버전을 1.3만 남긴다', 'vhost 태그를 production으로 바꾼다'], a: 0,
      why: '큐 삭제는 configure 권한이다. ^$로 잠그고 필요한 리소스만 ^orders\\. 처럼 열어야 한다.' },
    { q: '컨테이너로 띄운 브로커에 원격에서 guest/guest로 로그인됐다. 설정 파일에서 먼저 볼 것은?',
      o: ['auth_mechanisms 순서', 'loopback_users = none이 들어 있는지', 'ssl_options.versions 목록'], a: 1,
      why: 'none은 guest의 localhost 제한을 풀어 버린다. 이 줄을 지우고 guest 계정 자체를 삭제한다.' },
    { q: 'EXTERNAL 인증을 켰는데 클라이언트가 "mechanism not supported"로 실패한다. 의심할 것은?',
      o: ['vhost /prod가 없다', 'monitoring 태그가 없다', 'rabbitmq_auth_mechanism_ssl 플러그인이 꺼져 있다'], a: 2,
      why: 'EXTERNAL은 이 플러그인이 있어야 제시된다. 플러그인과 ssl_cert_login_from 설정은 항상 같이 간다.' },
  ];

  R.page({ title: 'vhost · 권한 · TLS · SASL', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
