/* V-1-2 보안 (SASL / TLS / ACL) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 가운데 broker 둘레에 켜진 보안 계층(TLS · 인증 · ACL)을 고리로 그리고, 네 클라이언트의 접속 결과는 beat 의 clients[].status 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, lock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const mid = (x, y, s, op, a) => note(x, y, s, op, Object.assign({ 'text-anchor': 'middle' }, a || {}));
  const BX = 480, BYc = 186;                                   // broker 가운데
  const RING = { tls: [300, 244, INFO, 'TLS'], auth: [236, 190, ACC, ''], acl: [176, 140, WARN, 'ACL'] };
  const SLOT = [[122, 112], [122, 268], [838, 112], [838, 268]];   // 클라이언트 자리 (데이터 순서)
  const nm = (c) => c.name.replace(/^[✓✗?]\s*/, '');
  const short = (r) => (r.includes('—') ? r.split('—').pop().trim() : r);
  const COL = { ok: GOOD, warn: WARN, blocked: BAD, leak: BAD };

  function ring(key, u, label, o) { if (u <= 0) return; o = o || {}; const [w, h, col, name] = RING[key];
    el('rect', { x: BX - w / 2, y: BYc - h / 2, width: w, height: h, rx: 26, fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-dasharray': o.dash ? '8 6' : null, opacity: u });
    const s = label || name; if (s) pill(BX, BYc - h / 2, s, col, u, { fs: 13.5, fill: PANEL, mono: true }); }
  function rings(L, o) { o = o || {};
    if (L.tls) ring('tls', o.tls ?? 1, o.tlsLabel);
    if (L.auth && L.auth !== 'none') ring('auth', o.auth ?? 1, L.auth); else if (o.authDash) ring('auth', o.authDash, '인증 자리 (아직 없음)', { dash: true });
    if (L.acl) ring('acl', o.acl ?? 1); }
  // 어느 고리에서 막히는가: blocked/warn 를 그 고리 바깥 가장자리에서 멈춘다
  function edgeX(side, key) { const w = key ? RING[key][0] : 112; return side < 0 ? BX - w / 2 : BX + w / 2; }
  function client(i, c, o) { o = o || {}; const [x, y] = SLOT[i], side = x < BX ? -1 : 1, st = c.status, col = COL[st] || INK, s = o.s ?? 1;
    if (s <= 0) return;
    const x0 = x - side * 100, stopKey = o.stop || null;
    const xEnd = st === 'blocked' || (st === 'warn' && o.warnStops) ? edgeX(side, stopKey) : BX + side * 56;
    const yEnd = lerp(y, BYc, Math.abs(xEnd - x0) / Math.abs(BX + side * 56 - x0));
    el('line', { x1: x0, y1: y, x2: lerp(x0, xEnd, o.line ?? 1), y2: lerp(y, yEnd, o.line ?? 1), stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': st === 'ok' ? null : '7 5', opacity: s });
    if ((o.line ?? 1) >= 1) { if (st === 'blocked' || (st === 'warn' && o.warnStops)) cross(xEnd, yEnd, 10, s);
      if (st === 'ok') for (let j = 0; j < 3; j++) dot([[x0, y], [BX + side * 56, BYc]], ((o.t || 0) * 0.5 + j / 3) % 1, GOOD, 4.5);
      if (st === 'leak') for (let j = 0; j < 3; j++) dot([[BX + side * 56, BYc], [x0, y]], ((o.t || 0) * 0.5 + j / 3) % 1, BAD, 5); }
    card(x, y, 200, 46, { rx: 10, text: nm(c), fs: 15, fw: 800, mono: true, stroke: col, fill: st === 'ok' ? GOODBG : st === 'leak' || st === 'blocked' ? BADBG : PANEL, s });
    tx(x, y + 44, o.label || short(c.reason), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: s * (o.lop ?? 1) }); }
  function broker(o) { o = o || {}; server(BX, BYc - 6, 'broker', { lamp: o.lamp || ACC }); }
  function listener(s, sc, col) { pill(BX, 34, s, col || INK, sc ?? 1, { mono: true, fs: 14, fill: PANEL }); }
  function bottom(s1, s2, u1, u2, c1, c2) { if (s1) mid(480, 372, s1, u1, { fill: c1 || INK }); if (s2) mid(480, 404, s2, u2, { fill: c2 || MUT, 'font-weight': 500 }); }
  // 패킷: 선 위에 떠 있는 작은 상자 (plain 이면 내용이 보이고, 아니면 암호문)
  function packet(x, y, plain, s) { card(x, y, plain ? 236 : 120, 30, { rx: 6, text: plain ? 'email=kim@… card=4518…' : '▒▒ 7f3a e91c ▒▒', fs: 13.5, mono: true, fw: 700, fill: plain ? BADBG : INFOBG, stroke: plain ? BAD : INFO, color: plain ? BAD : INFO, s }); }

  // ---------- 1. 보안 없는 Kafka ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k === 3) {   // 네 계층 로드맵
      const L = [['Step 2', 'TLS', '채널 암호화 · 도청 차단', INFO], ['Step 3', 'SASL/PLAIN', 'id/pw 인증', ACC], ['Step 4', 'SASL/SCRAM', '해시로 저장하는 인증', ACC], ['Step 5', 'ACL', '리소스별 최소 권한', WARN]];
      L.forEach(([st, a, d, col], i) => { const y = 330 - i * 66, s = E(u, 0.2 + i * 0.4, 0.7 + i * 0.4);
        if (s <= 0) return; el('rect', { x: 260, y: y - 26, width: 440 * s, height: 52, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.5 });
        mono(282, y + 6, st, { 'font-size': 14, fill: MUT, opacity: s }); tx(370, y + 6, a, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: s }); tx(510, y + 6, d, { 'font-size': 15, opacity: s }); });
      mid(480, 400, '앞 단계 위에 하나씩 쌓는다 · 먼저 채널 암호화부터', fade(u, 2.1)); return; }
    broker(); listener(b.listener, k === 0 ? pop(u, 0.1) : 1, BAD);
    b.clients.forEach((cl, i) => client(i, cl, { s: k === 0 ? pop(u, 0.5 + i * 0.25) : 1, t, line: k === 1 && i === 2 ? E(u, 0.2, 0.9) : 1,
      label: k === 0 ? short(cl.reason) : null }));
    if (k === 0) { card(BX, 292, 220, 44, { rx: 8, text: '# 보안 옵션 없음', fs: 14.5, mono: true, color: MUT, stroke: GRID, s: pop(u, 1.6) });
      bottom('9092에 TCP만 닿으면 누구나 붙는다', '"사내라서 괜찮다" 는 가정 하나에 기대고 있다', fade(u, 2.0), fade(u, 2.3)); return; }
    if (k === 1) { pill(BX + 200, 196, 'user-events 통째로', BAD, pop(u, 1.0), { fs: 13.5 });
      bottom('계정이 없어도 들어온다 · 토픽 권한도 없다', 'admin API까지 열려 있다', fade(u, 1.6), fade(u, 2.0), BAD); return; }
    // k2: 평문 sniff
    const px = 345, py = 124;
    packet(px, py - 26, true, pop(u, 0.3));
    fly(px, py - 26, SLOT[3][0] - 40, SLOT[3][1] - 30, seg(u, 0.9, 1.8), '복사', { fill: BAD });
    bottom('평문이라 패킷만 잡으면 이메일·결제번호가 보인다 (예시 값)', '같은 네트워크에 있다는 것만으로 충분하다', fade(u, 1.9), fade(u, 2.2), BAD); }

  // ---------- 2. TLS ----------
  function s2(t, c) { const { k, u } = c, b = c.beat;
    broker(); rings(b.layers, { tls: k === 0 ? E(u, 0.6, 1.1) : 1 });
    if (k === 0) { pill(BX - 140, 34, 'PLAINTEXT://9092', BAD, 1, { mono: true, fs: 13.5, op: 1 - E(u, 0.2, 0.6) * 0.6 }); cross(BX - 140, 34, 10, pop(u, 0.4));
      pill(BX + 130, 34, 'SSL://9093', INFO, pop(u, 0.6), { mono: true, fs: 14 }); }
    else listener(b.listener.replace(' (broker.keystore.jks)', '').replace(' (ssl.client.auth=none)', ''), 1, INFO);
    b.clients.forEach((cl, i) => client(i, cl, { t, stop: 'tls', warnStops: cl.reason.includes('불일치') || cl.reason.includes('CA 없음'), s: 1, lop: 1 }));
    if (k >= 1) { const s = k === 1 ? pop(u, 0.3) : 1; card(BX + 92, BYc + 58, 96, 30, { rx: 6, text: '인증서', fs: 13.5, fw: 800, fill: INFOBG, stroke: INFO, color: INFO, s }); }
    if (k === 0) bottom('평문 포트를 닫고 SSL만 남긴다 · 옛 설정의 앱도 같이 끊긴다', 'inter.broker.listener.name도 SSL로 바꿔야 브로커끼리 붙는다', fade(u, 1.6), fade(u, 2.0));
    if (k === 1) bottom('keystore = 내가 내밀 인증서 · truststore = 상대를 검증할 CA', '클라이언트 truststore에 CA가 없어 아직 검증 실패', fade(u, 1.2), fade(u, 1.8));
    if (k === 2) { packet(lerp(SLOT[3][0] - 100, BX + 150, 0.5), lerp(SLOT[3][1], BYc, 0.5) + 26, false, pop(u, 0.3));
      card(SLOT[2][0], SLOT[2][1] - 52, 64, 28, { rx: 14, text: '신원 ?', fs: 13.5, fw: 800, stroke: WARN, color: WARN, s: pop(u, 0.9) });
      bottom('ssl.client.auth=none · 채널만 잠그고 신원은 묻지 않는다', 'CA만 알면 intern03도 그대로 들어온다', fade(u, 1.4), fade(u, 1.9), INK, WARN); }
    if (k === 3) { [0, 1].forEach((i) => fly(BX, 300, SLOT[i][0], SLOT[i][1] + 18, seg(u, 0.2 + i * 0.2, 1.0 + i * 0.2), 'CA', { fill: INFO }));
      bottom('클라이언트에 truststore를 배포하자 운영 앱이 붙는다', '이제 회원 이메일이 평문으로 떠다니지 않는다', fade(u, 1.4), fade(u, 1.9), GOOD); }
    if (k === 4) { pill(330, 350, 'broker가 진짜인가 ✓', GOOD, pop(u, 0.3), { fs: 14 }); pill(630, 350, '클라이언트가 누구인가 ?', WARN, pop(u, 0.8), { fs: 14 });
      mid(480, 404, '도청은 막았다 · 인증은 비어 있다', fade(u, 1.6), { fill: MUT, 'font-weight': 500 }); } }

  // ---------- 3. SASL/PLAIN ----------
  function jaas(x, y, s, hot) { const rows = ['user_admin="admin-secret"', 'user_app-prod="prod-pw-1234"', 'user_etl-job="etl-pw-5678"'];
    card(x, y, 340, 104, { rx: 10, stroke: hot ? BAD : GRID, fill: hot ? BADBG : SOFT, s });
    if (s < 0.9) return; mono(x - 156, y - 32, 'jaas 계정 목록', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    rows.forEach((r, i) => mono(x - 156, y - 8 + i * 22, r, { 'font-size': 13.5, fill: hot ? BAD : INK, 'font-weight': 700 })); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    broker(); listener(b.listener.replace(/\s+\(.*\)$/, ''), k === 0 ? pop(u, 0.1) : 1, ACC);
    rings(b.layers, { authDash: k === 0 ? E(u, 0.5, 1.0) : 0, auth: k === 1 ? E(u, 0.2, 0.7) : 1 });
    const stop = k === 0 ? 'tls' : 'auth';
    b.clients.forEach((cl, i) => client(i, cl, { t, stop, warnStops: cl.status === 'warn', s: 1 }));
    if (k === 0) bottom('SSL 위에 SASL을 얹은 SASL_SSL로 바꾼다', 'SASL_PLAINTEXT로 쓰면 pw가 평문으로 나간다', fade(u, 1.3), fade(u, 1.8), INK, BAD);
    if (k === 1) bottom('PLAIN을 켜는 순간 id/pw가 없으면 전부 거절된다', '계정 배포와 켜는 순서를 맞춰야 한다', fade(u, 1.2), fade(u, 1.8));
    if (k === 2) { jaas(BX, 368, pop(u, 0.3));
      note(SLOT[2][0] - 96, SLOT[2][1] + 88, '목록에 intern03 없음', fade(u, 1.4), { fill: BAD, 'font-size': 14 }); }
    if (k === 3) { [0, 1].forEach((i) => fly(SLOT[i][0] + 100, SLOT[i][1], BX - 120, lerp(SLOT[i][1], BYc, 0.6), seg(u, 0.2 + i * 0.3, 1.0 + i * 0.3), i ? 'etl-job / ***' : 'app-prod / ***', { mono: true }));
      bottom('id/pw를 낸 운영 앱만 통과한다', '이제 누가 붙었는지 안다 · 계정 없는 접속은 핸드셰이크에서 끊긴다', fade(u, 1.6), fade(u, 2.0), GOOD); }
    if (k === 4) { jaas(BX, 368, 1, u > 0.6);
      dot([[BX + 170, 368], [SLOT[2][0], SLOT[2][1] + 24]], seg(u, 0.8, 1.6), BAD, 6);
      note(BX + 182, 410, '파일 유출 = pw 유출 · 회전하려면 재배포', fade(u, 1.6), { fill: BAD, 'font-size': 14 }); } }

  // ---------- 4. SASL/SCRAM ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k === 5) {   // PLAIN vs SCRAM
      const rows = [['저장 형태', '평문 pw', 'salt + 해시 (iterations)'], ['파일 유출 시', 'pw 즉시 유출', '원본 pw 복원 불가'], ['pw 회전', 'jaas.conf 재배포', 'kafka-configs 한 줄']];
      tx(470, 70, 'PLAIN', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD }); tx(730, 70, 'SCRAM-SHA-512', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD });
      rows.forEach(([a, p, s], r) => { const y = 130 + r * 74, sc = pop(u, 0.2 + r * 0.4);
        card(240, y, 170, 54, { rx: 8, text: a, fs: 15, fw: 700, fill: SOFT, stroke: GRID, s: sc });
        card(470, y, 230, 54, { rx: 8, text: p, fs: 15, stroke: BAD, s: sc }); card(730, y, 250, 54, { rx: 8, text: s, fs: 15, stroke: GOOD, s: sc }); });
      mid(480, 390, '보안은 운영할 수 있어야 실제로 지켜진다', fade(u, 1.9)); return; }
    broker(); listener('SASL_SSL://0.0.0.0:9094', 1, ACC); rings(b.layers, { auth: k === 0 ? E(u, 0.2, 0.7) : 1 });
    b.clients.forEach((cl, i) => client(i, cl, { t, stop: 'auth', warnStops: cl.status === 'warn', s: 1 }));
    if (k === 0) bottom('listener는 그대로 · mechanism만 SCRAM-SHA-512로 바꾼다', 'PLAIN 설정의 클라이언트는 메커니즘이 맞지 않아 끊긴다', fade(u, 1.2), fade(u, 1.8));
    if (k === 1) { const y = 372;
      card(220, y, 170, 40, { rx: 8, text: 'prod-pw-1234', fs: 14, mono: true, fw: 700, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      grow(310, y, 370, y, E(u, 0.6, 0.9), MUT);
      card(480, y, 200, 40, { rx: 8, text: 'salt + 4096회 해시', fs: 14, fw: 700, stroke: ACC, color: ACC, s: pop(u, 0.9) });
      grow(585, y, 645, y, E(u, 1.3, 1.6), MUT);
      card(740, y, 170, 40, { rx: 8, text: 'stored_key', fs: 14, mono: true, fw: 700, stroke: GOOD, color: GOOD, s: pop(u, 1.6) });
      sub(740, y + 38, '메타데이터에 저장 · 재시작 없음', fade(u, 1.9), { 'font-size': 13.5 }); }
    if (k === 2) { terminal(170, 330, 620, 86, ['$ kafka-configs.sh --describe --entity-name app-prod', 'SCRAM-SHA-512=iterations=4096'], lerp(0, 2, E(u, 0.2, 1.4)), { fs: 14 });
      pill(SLOT[2][0], SLOT[2][1] - 52, '파일을 훔쳐도 pw 복원 불가', GOOD, pop(u, 1.6), { fs: 13.5 }); }
    if (k === 3) { const y0 = 340;
      [['client', 'nonce', 0.2], ['broker', 'salt · iterations 4096', 0.7], ['client', 'proof (pw로 계산)', 1.2]].forEach(([who, s, a], j) => { const l2r = who === 'client';
        grow(l2r ? 250 : 710, y0 + j * 26, l2r ? 710 : 250, y0 + j * 26, E(u, a, a + 0.4), l2r ? GOOD : ACC);
        tx(480, y0 + j * 26 - 6, s, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: l2r ? GOOD : ACC, opacity: fade(u, a + 0.3) }); });
      note(40, 345, 'client', fade(u, 0.2), { 'font-size': 14 }); note(860, 345, 'broker', fade(u, 0.2), { 'font-size': 14 }); }
    if (k === 4) { pill(300, 352, 'password=prod-pw-1234', BAD, 1, { mono: true, fs: 13.5 }); el('line', { x1: 200, y1: 352, x2: lerp(200, 400, E(u, 0.3, 0.8)), y2: 352, stroke: BAD, 'stroke-width': 3 });
      pill(640, 352, 'password=new-prod-pw', GOOD, pop(u, 0.9), { mono: true, fs: 13.5 });
      mid(480, 404, '--alter 한 줄 · 파일 재배포도 재시작도 없다', fade(u, 1.6), { fill: MUT, 'font-weight': 500 }); } }

  // ---------- 5. ACL ----------
  const COLS = [['Topic', 'orders'], ['Topic', 'user-events'], ['Group', 'etl-cg']], ROWS = ['app-prod', 'etl-job', 'admin'];
  const CX = (j) => 260 + j * 120, RY = (r) => 130 + r * 66;
  function grid(m, fresh, u) {
    COLS.forEach(([a, b], j) => { tx(CX(j), 66, a, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(CX(j), 88, b, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800 }); });
    ROWS.forEach((r, i) => { mono(180, RY(i) + 5, r, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800 });
      COLS.forEach((_, j) => { const v = m[i][j], isNew = fresh && fresh(i, j), s = isNew ? pop(u, 0.4) : 1;
        if (i === 2) { card(CX(j), RY(i), 108, 50, { rx: 8, text: 'super.users', fs: 13.5, fw: 700, stroke: GOOD, fill: GOODBG, color: GOOD }); return; }
        card(CX(j), RY(i), 108, 50, { rx: 8, text: v || '거부', fs: v ? 14 : 13.5, fw: v ? 800 : 600, mono: !!v, stroke: v ? GOOD : GRID, fill: v ? GOODBG : SOFT, color: v ? GOOD : OFF, s: v ? s : 1 }); }); }); }
  function attempts(list, u, fresh) { list.forEach((cl, i) => { const y = 92 + i * 62, ok = cl.status === 'ok', s = fresh ? pop(u, 0.9 + i * 0.12) : 1;
    card(760, y, 330, 48, { rx: 10, stroke: ok ? GOOD : cl.status === 'warn' ? WARN : BAD, fill: PANEL, s });
    if (s < 0.9) return; mono(610, y - 3, nm(cl), { 'font-size': 14, 'font-weight': 800 }); tx(610, y + 16, cl.detail, { 'font-size': 13.5, fill: MUT });
    if (ok) check(900, y, 10); else cross(900, y, 9); }); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const M = [
      [[null, null, null], [null, null, null], [1, 1, 1]],
      [['Write', null, null], [null, null, null], [1, 1, 1]],
      [['Write', null, null], ['Read', 'Read', null], [1, 1, 1]],
      [['Write', null, null], ['Read', 'Read', 'Read'], [1, 1, 1]]][Math.min(k, 3)];
    const fresh = k === 1 ? (i, j) => i === 0 && j === 0 : k === 2 ? (i, j) => i === 1 && j < 2 : k === 3 ? (i, j) => i === 1 && j === 2 : null;
    if (k === 0) pill(330, 30, 'allow.everyone.if.no.acl.found=false', BAD, pop(u, 0.1), { mono: true, fs: 13.5 });
    else pill(330, 30, 'StandardAuthorizer · 기본 거부', INK, 1, { fs: 13.5 });
    grid(M, fresh, u);
    if (k <= 3) { attempts(b.clients, u, true);
      const msg = ['ACL이 없으면 전부 거부 · admin만 super.users로 면제', 'Write를 주면 Describe도 따라 허용 · Delete는 주지 않는다', '토픽 Read만으로는 consumer group에 들어가지 못한다', '토픽 Read + group Read가 함께 있어야 consume 된다'][k];
      mid(480, 360, msg, fade(u, 1.6), { fill: k === 2 ? WARN : INK });
      if (k === 0) mid(480, 394, 'ACL을 먼저 만들고 authorizer를 켠다', fade(u, 2.1), { fill: MUT, 'font-weight': 500 });
      return; }
    if (k === 4) { terminal(560, 64, 380, 170, ['$ kafka-acls.sh --list --topic orders', 'User:app-prod  Allow Write,Describe', 'User:etl-job   Allow Read,Describe'], lerp(0, 3, E(u, 0.2, 1.6)), { fs: 13.5 });
      mid(480, 360, '정기적으로 --list를 떠서 권한이 늘어나지 않았는지 본다', fade(u, 1.8)); return; }
    // k5: 거부 로그 + 완성된 계층
    terminal(560, 64, 380, 110, ['app-prod DELETE orders', 'TopicAuthorizationException'], lerp(0, 2, E(u, 0.2, 1.0)), { fs: 13.5 });
    [['TLS', INFO], ['SASL/SCRAM', ACC], ['ACL', WARN], ['감사 로그', MUT]].forEach(([s, col], i) => pill(170 + i * 190, 360, s, col, pop(u, 1.1 + i * 0.25), { fs: 15 }));
    mid(480, 404, '기본 거부 · 최소 권한 · 거부 로그 모니터링', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); }

  const quiz = [
    { q: 'PLAINTEXT 9092 로만 띄운 클러스터에서, 같은 네트워크의 공격자가 할 수 있는 일은 무엇인가?',
      o: ['패킷을 잡아 메시지 내용을 그대로 읽는다', 'broker 인증서를 위조해야만 읽을 수 있다', 'ACL이 막아서 아무것도 못 한다'], a: 0,
      why: '평문 전송이라 캡처만 하면 내용이 보이고, 인증도 없어 9092에 붙기만 하면 토픽을 읽는다.' },
    { q: 'TLS를 켜고 ssl.client.auth=none으로 두었다. 이때도 막히지 않는 것은 무엇인가?',
      o: ['같은 네트워크에서의 도청', 'CA를 아는 아무 클라이언트의 접속', '평문 9092 포트 접속'], a: 1,
      why: 'TLS는 채널을 암호화하고 broker 신원만 확인한다. 클라이언트 신원은 묻지 않아 CA만 알면 들어온다.' },
    { q: 'SASL/PLAIN을 SASL_SSL(TLS 위)로 써야 하는 이유는 무엇인가?',
      o: ['PLAIN은 SSL 없이는 켜지지 않는다', '포트 번호 규칙 때문이다', 'PLAIN은 pw를 그대로 보내 TLS가 없으면 네트워크에 노출된다'], a: 2,
      why: 'PLAIN은 이름 그대로 평문 pw를 보낸다. TLS가 감싸지 않으면 도청으로 pw가 샌다.' },
    { q: 'SCRAM 사용자에 kafka-configs.sh --describe를 하면 보이는 것은 무엇인가?',
      o: ['SCRAM-SHA-512=iterations=4096 같은 메커니즘과 반복 횟수', '원본 pw', 'jaas.conf에 적힌 계정 목록'], a: 0,
      why: 'SCRAM은 salt와 4096회 해시에서 나온 값만 메타데이터에 두고 원본 pw는 저장하지 않는다. 조회도 메커니즘과 iterations만 보여 준다.' },
    { q: 'etl-job에 orders 토픽 Read를 줬는데도 consume이 안 된다. 더 필요한 것은 무엇인가?',
      o: ['orders 토픽 Write 권한', 'consumer group etl-cg의 Read 권한', 'super.users 등록'], a: 1,
      why: 'consumer는 토픽과 consumer group 두 리소스를 쓴다. group Read가 없으면 GroupAuthorizationException으로 막힌다.' },
  ];

  const summary = [
    '평문 9092 클러스터는 네트워크에 닿는 누구나 읽고 쓰며, 패킷을 잡으면 내용이 그대로 보인다.',
    'TLS는 도청을 막고 broker 신원을 확인하지만, 클라이언트가 누구인지는 묻지 않는다.',
    'SCRAM-SHA-512는 원본 pw 없이 salt와 4096회 해시 값만 저장하고, 회전도 명령 한 줄이다.',
    'ACL은 기본 거부로 두고 토픽 권한과 consumer group 권한을 따로 준다.',
  ];
  const review = [
    { q: 'ssl.client.auth=none인 TLS 클러스터에서 외주 계정이 여전히 토픽을 읽는다. 먼저 더할 것은?',
      o: ['SASL 인증을 얹어 계정 없는 접속을 끊는다', 'TLS 버전을 1.3 으로만 제한한다', '포트를 9093에서 다른 번호로 바꾼다'], a: 0,
      why: 'TLS는 채널만 잠근다. 누가 붙는지 확인하려면 SASL 같은 인증 계층이 따로 있어야 한다.' },
    { q: 'authorizer를 켜자마자 운영 producer와 consumer가 전부 막혔다. 원인은?',
      o: ['SCRAM pw가 자동으로 바뀌었다', 'ACL을 만들기 전에 켜서 기본 거부가 적용됐다', 'TLS 인증서가 만료됐다'], a: 1,
      why: 'allow.everyone.if.no.acl.found=false면 규칙이 없는 요청은 전부 거부된다. ACL을 먼저 준비하고 켜야 한다.' },
    { q: 'broker 서버의 설정 파일 백업이 통째로 유출됐다. PLAIN과 SCRAM 중 피해가 작은 쪽은?',
      o: ['PLAIN, jaas 파일이 짧아서', '둘 다 같다, 둘 다 pw를 파일에 저장해서', 'SCRAM, broker 쪽에는 해시에서 나온 값만 있어서'], a: 2,
      why: 'PLAIN은 jaas 설정에 pw 원본이 그대로 있다. SCRAM은 salt와 해시 값만 메타데이터에 두어 원본 pw를 되살릴 수 없다.' },
  ];

  R.page({ title: '보안 계층 쌓기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
