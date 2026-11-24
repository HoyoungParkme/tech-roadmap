/* V-2-2 실전 운영 체크리스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   protobuf 바이트·reserved 에러 문구는 grpcio-tools 1.85(protoc)와 protobuf 7.36 으로,
   재시도 4번·RESOURCE_EXHAUSTED 문구·deadline 2.01s·health 상태는 python grpcio 1.85 로 직접 돌려 얻은 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, clock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // User{id:"u-42", name:"Alice", email:"alice@acme.io"} 옛 스키마로 직렬화한 28바이트
  const OLD = '0a 04 75 2d 34 32 12 05 41 6c 69 63 65 1a 0d 61 6c 69 63 65 40 61 63 6d 65 2e 69 6f'.split(' ');
  function bytes(x, y, arr, n, o) { o = o || {}; const w = o.w || 28, h = 28;
    arr.forEach((b, i) => { const s = clamp(n - i); if (s <= 0) return; const cx = x + i * (w + 2), tag = [0, 6, 13].includes(i), hot = (o.hot || []).includes(i);
      el('rect', { x: cx, y, width: w, height: h, rx: 4, fill: hot ? C.BADBG : tag ? ACCBG : PANEL, stroke: hot ? BAD : tag ? ACC : GRID, 'stroke-width': 1.5, opacity: s });
      mono(cx + w / 2, y + 19, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: hot ? BAD : tag ? ACC : INK, 'font-weight': tag ? 700 : 400, opacity: s }); }); }
  function row(x, y, w, l, r, o) { o = o || {}; el('rect', { x, y, width: w, height: 38, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.5, opacity: o.op ?? 1, 'stroke-dasharray': o.dash });
    mono(x + 14, y + 25, l, { 'font-size': 15, fill: o.color || INK, 'font-weight': 700, opacity: o.op ?? 1, 'text-decoration': o.strike ? 'line-through' : null });
    if (r) tx(x + w - 14, y + 25, r, { 'font-size': 14, fill: o.rcol || MUT, 'text-anchor': 'end', opacity: o.op ?? 1 }); }

  // ───────── 1. 계약
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { zone(60, 60, 380, 300, 'buf 모듈  (modules: - path: proto)', { fill: SOFT, stroke: ACC, op: fade(u, 0.1) });
      ['proto/user/v1/user.proto', 'proto/order/v1/order.proto', 'proto/pay/v1/pay.proto'].forEach((f, i) => card(250, 140 + i * 70, 320, 44, { rx: 8, text: f, mono: true, fs: 14, s: pop(u, 0.3 + i * 0.3) }));
      tx(680, 100, 'git 기록 = 계약의 이력', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      el('line', { x1: 540, y1: 200, x2: lerp(540, 880, E(u, 1.4, 2.2)), y2: 200, stroke: MUT, 'stroke-width': 3 });
      ['v1', 'v2', 'main'].forEach((s, i) => { const x = 570 + i * 140; el('circle', { cx: x, cy: 200, r: 12, fill: i === 2 ? ACC : PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.5 + i * 0.25) }); mono(x, 236, s, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.5 + i * 0.25) }); });
      sub(680, 290, '비교할 기준이 생긴다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { tx(60, 70, 'buf lint  (use: STANDARD)', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      [['message 이름 PascalCase', 1], ['필드 이름 lower_snake_case', 1], ['enum 0번은 _UNSPECIFIED', 1], ['패키지가 디렉터리와 같다', 1], ['PACKAGE_VERSION_SUFFIX', 0]].forEach(([s, on], i) => { const y = 92 + i * 52, a = fade(u, 0.2 + i * 0.35);
        row(60, y, 560, s, on ? '검사' : 'except 로 제외', { op: a, strike: !on, color: on ? INK : MUT, rcol: on ? GOOD : WARN });
        if (on) check(650, y + 19, 10, pop(u, 0.3 + i * 0.35)); });
      card(800, 200, 220, 110, { rx: 12, stroke: INFO, s: pop(u, 2.0), text: '사고를 막기보다\n리뷰 시간을 줄인다', fs: 15 }); return; }
    if (k === 2) { tx(480, 60, 'email 을 mail 로 이름만 바꾸면', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      [['WIRE', 'wire 바이트', '1a 0d 61 6c …', '번호 3 그대로', GOOD, true], ['WIRE_JSON', 'JSON 키', '"email" → "mail"', 'JSON 소비자 깨짐', BAD, false]].forEach(([n, a, b, d, col, ok], i) => { const x = 250 + i * 460, t0 = 0.3 + i * 0.9;
        card(x, 220, 400, 220, { rx: 14, stroke: col, s: pop(u, t0) }); mono(x, 140, n, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, t0 + 0.1) });
        tx(x, 190, a, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, t0 + 0.2) }); mono(x, 225, b, { 'font-size': 17, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, t0 + 0.3) });
        (ok ? check : cross)(x, 275, 13, pop(u, t0 + 0.5)); tx(x, 312, d, { 'font-size': 14.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: fade(u, t0 + 0.6) }); });
      sub(480, 380, 'WIRE 만 쓰면 이름 변경이 통과한다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 3) { const st = [['buf lint', GOOD], ['buf breaking --against main', BAD], ['배포', OFF]];
      st.forEach(([s, col], i) => { const x = 150 + i * 330, a = pop(u, 0.2 + i * 0.5); card(x, 160, i === 1 ? 300 : 200, 64, { rx: 12, text: s, mono: true, fs: 14.5, stroke: col, color: i === 2 ? MUT : col, s: a, dash: i === 2 ? '6 5' : null });
        if (i) grow(x - 330 + (i === 2 ? 150 : 100), 160, x - (i === 1 ? 150 : 100), 160, seg(u, 0.3 + i * 0.5, 0.6 + i * 0.5), i === 2 ? BAD : MUT); });
      if (u > 1.4) cross(645, 160, 14, pop(u, 1.4));
      terminal(200, 245, 560, 134, [['$ buf breaking --against ".git#branch=main"', null], ['user.proto: field 3 was deleted without reserving', '#fca5a5'], ['exit 1', '#fca5a5']], lerp(0, 3, E(u, 1.5, 2.4)), { fs: 14, lh: 24 });
      sub(480, 405, '출력 문구는 예시', fade(u, 2.4), { 'font-size': 13.5 }); return; }
    if (k === 4) { mono(60, 64, 'message User {', { 'font-size': 16, 'font-weight': 700 });
      [['string id = 1;', 0], ['string name = 2;', 0], ['reserved 3;', 1], ['reserved "email";', 1], ['string phone = 4;', 2]].forEach(([s, kind], i) => { const y = 80 + i * 48, a = fade(u, 0.2 + i * 0.3);
        row(80, y, 420, s, kind === 1 ? '봉인' : kind === 2 ? '새 번호로 추가' : '', { op: a, fill: kind === 1 ? SOFT : kind === 2 ? ACCBG : PANEL, stroke: kind === 1 ? MUT : kind === 2 ? ACC : GRID, dash: kind === 1 ? '5 4' : null, color: kind === 1 ? MUT : INK, rcol: kind === 2 ? ACC : MUT }); });
      mono(60, 336, '}', { 'font-size': 16, 'font-weight': 700 });
      card(740, 150, 360, 56, { rx: 10, text: 'string nickname = 3;', mono: true, fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.6) });
      terminal(560, 200, 380, 120, [['$ protoc user.proto', null], ['Field "nickname" uses', '#fca5a5'], ['reserved number 3.', '#fca5a5']], lerp(0, 3, E(u, 1.9, 2.6)), { fs: 14, lh: 24 });
      sub(750, 350, 'protoc 실제 에러 문구', fade(u, 2.5), { 'font-size': 13.5 }); return; }
    // k5: 바이트로 본 위반
    mono(40, 58, '옛 User 28바이트', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
    bytes(40, 66, OLD, lerp(0, 28, E(u, 0.1, 0.8)), { w: 30 });
    [['0a', 0, 'id = 1'], ['12', 6, 'name = 2'], ['1a', 13, 'email = 3']].forEach(([h, i, s]) => mono(40 + i * 32, 118, h + ' → ' + s, { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.8) }));
    const cases = [['int64 id = 1  로 타입 변경', 'id = 0, "u-42" 사라짐', BAD], ['string phone = 3  로 번호 재사용', 'phone = "alice@acme.io"', BAD], ['int64 age = 3  으로 번호 재사용', 'age = 0, 값 조용히 사라짐', BAD]];
    cases.forEach(([a, b, col], i) => { const y = 160 + i * 74, t0 = 1.0 + i * 0.45;
      card(480, y + 26, 880, 60, { rx: 10, stroke: col, s: pop(u, t0) }); mono(60, y + 32, a, { 'font-size': 15, opacity: fade(u, t0 + 0.1) });
      mono(900, y + 32, b, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, t0 + 0.2) }); });
    sub(480, 405, '새 스키마로 옛 바이트를 읽어 본 실제 결과. 에러 없이 틀린 값이 된다', fade(u, 2.4), { 'font-size': 13.5 }); }

  // ───────── 2. 안정성
  function s2(t, c) { const { k, u } = c;
    if (k === 0 || k === 6) { const cli = k === 6; tx(60, 60, cli ? '클라이언트 keepalive  Time 20s · Timeout 10s' : '서버 keepalive  Time 30s · Timeout 10s', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      const x0 = 80, W = 800, T = cli ? 80 : 50, X = (s) => x0 + (s / T) * W;
      el('line', { x1: x0, y1: 200, x2: x0 + W * E(u, 0.2, 2.0), y2: 200, stroke: MUT, 'stroke-width': 3 });
      (cli ? [0, 20, 40, 60, 80] : [0, 30, 40, 50]).forEach((s) => mono(X(s), 236, s + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.2 + s / T * 1.8) }));
      if (!cli) { el('rect', { x: X(0), y: 170, width: (X(30) - X(0)) * E(u, 0.2, 1.1), height: 18, rx: 4, fill: SOFT, stroke: GRID }); tx(X(15), 160, '아무 활동 없음', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.6) });
        pill(X(30), 130, 'ping', WARN, pop(u, 1.2), { mono: true }); el('rect', { x: X(30), y: 192, width: (X(40) - X(30)) * E(u, 1.3, 1.8), height: 16, rx: 4, fill: C.WARNBG, stroke: WARN });
        tx(X(35), 270, '10s 답 없음', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.7) });
        if (u > 1.9) cross(X(40), 200, 14, pop(u, 1.9)); tx(X(40), 310, '죽은 연결로 보고 닫는다', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
      [20, 40, 60].forEach((s, i) => pill(X(s), 150, 'ping', ACC, pop(u, 0.6 + i * 0.5), { mono: true }));
      card(480, 330, 360, 60, { rx: 10, text: '방화벽: 유휴 연결을 끊는다', fs: 15, stroke: WARN, s: pop(u, 1.8) });
      tx(480, 290, 'ping 이 오가는 연결은 유휴가 아니다', { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { person(100, 200, '클라이언트', {}); server(780, 200, '서버', {});
      [0, 1, 2, 3].forEach((i) => fly(150, 180, 720, 180, seg(u, 0.2 + i * 0.35, 0.5 + i * 0.35), 'ping', { mono: true, fill: WARN }));
      mono(430, 140, '5초마다 ping (예시)', { 'font-size': 14.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.4) });
      card(780, 320, 300, 60, { rx: 10, text: 'MinTime 15s 보다 잦다', fs: 15, stroke: INFO, s: pop(u, 1.5) });
      fly(720, 230, 160, 230, seg(u, 1.8, 2.5), 'GOAWAY', { mono: true, fill: BAD }); sub(430, 290, '서버가 연결을 끊어 ping flood 를 막는다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    if (k === 2) { const x0 = 80, W = 640, X = (mb) => x0 + (mb / 8) * W;
      el('rect', { x: x0, y: 120, width: (X(5) - x0) * E(u, 0.2, 0.9), height: 40, rx: 6, fill: ACC, opacity: 0.8 }); mono(x0 + 10, 146, '응답 5MB (5,242,890 B)', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.8) });
      [[4, BAD, '기본 한도 4MB', 0.9], [8, GOOD, '명시한 한도 8MB', 1.8]].forEach(([mb, col, s, t0]) => { el('line', { x1: X(mb), y1: 100, x2: X(mb), y2: 180, stroke: col, 'stroke-width': 3, opacity: fade(u, t0) }); mono(X(mb), 94, s, { 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: fade(u, t0) }); });
      card(400, 250, 720, 60, { rx: 10, stroke: BAD, fill: C.BADBG, s: pop(u, 1.2) });
      mono(60, 246, 'RESOURCE_EXHAUSTED', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) }); mono(60, 268, 'Received message larger than max (5242890 vs. 4194304)', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.4) });
      card(400, 340, 720, 50, { rx: 10, stroke: GOOD, s: pop(u, 2.0) }); mono(60, 346, '8MB 로 받으면 5242890 바이트 정상 수신', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.1) });
      sub(860, 405, '파이썬 실행 결과', fade(u, 2.3)); return; }
    if (k === 3) { [['GetUser', '여러 번 불러도 결과가 같다', GOOD, 1], ['CreatePayment', '두 번 실행되면 두 번 결제', BAD, 0]].forEach(([m, d, col, ok], i) => { const y = 110 + i * 170, t0 = 0.2 + i * 1.0;
        card(150, y, 200, 56, { rx: 10, text: m, mono: true, fs: 16, stroke: col, s: pop(u, t0) });
        fly(250, y, 560, y, seg(u, t0 + 0.2, t0 + 0.6), '시도 1', { fill: INK }); fly(250, y + 30, 560, y + 30, seg(u, t0 + 0.5, t0 + 0.9), '재시도', { fill: col });
        server(620, y + 10, null, { s: 0.6 }); tx(700, y + 6, d, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: fade(u, t0 + 0.8) });
        if (!ok) { ['₩ 결제 1', '₩ 결제 2'].forEach((s, j) => pill(740 + j * 110, y + 50, s, BAD, pop(u, t0 + 1.0 + j * 0.2), { fs: 14 })); } else check(700, y + 44, 11, pop(u, t0 + 0.9)); }); return; }
    if (k === 4) { tx(60, 60, 'maxAttempts 4 · initialBackoff 0.2s · ×2 · maxBackoff 3s', { 'font-size': 15.5, 'font-weight': 700, class: 'mono' });
      const xs = [70, 290, 510, 730]; xs.forEach((x, i) => { const t0 = 0.2 + i * 0.5;
        card(x + 70, 160, 140, 50, { rx: 8, text: `시도 ${i + 1}`, fs: 15, stroke: BAD, s: pop(u, t0) }); mono(x + 70, 206, 'UNAVAILABLE', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, t0 + 0.1) });
        if (i < 3) { grow(x + 142, 160, x + 218, 160, seg(u, t0 + 0.2, t0 + 0.4), MUT); mono(x + 180, 140, '≤' + ['0.2', '0.4', '0.8'][i] + 's', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, t0 + 0.3) }); } });
      card(480, 290, 620, 80, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 2.1) });
      tx(480, 284, '서버가 받은 시도 4번 = 첫 시도 + 재시도 3', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(480, 310, '대기는 상한 안에서 무작위 · 3s 를 넘지 않는다 · 시도 수는 파이썬 실행 값', fade(u, 2.3), { 'font-size': 13.5 }); return; }
    if (k === 5) { snippet(60, 80, ['grpc.NewClient(addr,', '    grpc.WithDefaultServiceConfig(retryPolicy),', ')'], { fs: 16, op: fade(u, 0.2) });
      grow(300, 190, 300, 240, seg(u, 0.8, 1.2), ACC);
      card(300, 300, 300, 90, { rx: 12, stroke: ACC, s: pop(u, 1.2) }); mono(300, 290, 'ClientConn', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.3) });
      pill(300, 322, 'GetUser: retryPolicy', ACC, pop(u, 1.6), { fs: 13.5, mono: true });
      card(720, 300, 300, 90, { rx: 12, text: '코드 수정 없이\n설정으로 주입', fs: 15, stroke: INFO, s: pop(u, 2.0) }); return; }
    // k7: deadline
    [['ctx 2s deadline', true, 120], ['deadline 없음', false, 300]].forEach(([n, dl, y], i) => { const t0 = 0.2 + i * 1.0;
      tx(60, y - 40, n, { 'font-size': 16, 'font-weight': 700, fill: dl ? INK : BAD, opacity: fade(u, t0) });
      const x0 = 60, W = 600, X = (s) => x0 + s / 3 * W;
      el('rect', { x: x0, y: y - 18, width: W * E(u, t0, t0 + 0.8), height: 26, rx: 5, fill: SOFT, stroke: GRID }); mono(x0 + W + 10, y + 2, '서버 3s', { 'font-size': 14, fill: MUT, opacity: fade(u, t0 + 0.5) });
      if (dl) { el('line', { x1: X(2), y1: y - 30, x2: X(2), y2: y + 20, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.6) }); card(800, y - 5, 260, 50, { rx: 8, stroke: BAD, s: pop(u, 0.9) });
        mono(800, y - 10, 'DEADLINE_EXCEEDED', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); mono(800, y + 12, '2.01s 에 끊음 (실행 값)', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
      else { for (let j = 0; j < 12; j++) el('circle', { cx: 745 + (j % 6) * 28, cy: y - 10 + Math.floor(j / 6) * 30, r: 9, fill: BAD, opacity: fade(u, t0 + 0.4 + j * 0.06) * 0.8 });
        tx(790, y + 52, '고루틴이 계속 쌓인다', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) }); } }); }

  // ───────── 3. 보안
  function cert(cx, cy, name, col, s, o) { o = o || {}; card(cx, cy, 120, 80, { rx: 6, stroke: col, s, fill: o.fill });
    mono(cx, cy - 10, name, { 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 });
    if (o.sub) tx(cx, cy + 18, o.sub, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s > 0.5 ? 1 : 0 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { cert(180, 200, 'ca.pem', INFO, pop(u, 0.2), { sub: 'CA 인증서' });
      grow(250, 200, 420, 200, seg(u, 0.7, 1.1), INFO); mono(335, 186, 'ReadFile', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) });
      card(600, 200, 340, 120, { rx: 12, stroke: ACC, s: pop(u, 1.1) }); mono(600, 160, 'x509.CertPool', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      cert(600, 215, 'CA', INFO, pop(u, 1.6) * 0.7);
      sub(480, 330, '클라이언트 인증서를 이 CA 로 검증한다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 1) { person(110, 220, '서비스 A', {}); server(830, 220, '서비스 B', {});
      fly(170, 160, 760, 160, seg(u, 0.2, 0.9), '서버 인증서 ←', { fill: INFO }); fly(170, 200, 760, 200, seg(u, 0.9, 1.6), '클라 인증서 →', { fill: ACC });
      if (u > 0.9) check(190, 140, 10, pop(u, 0.9)); if (u > 1.6) check(780, 250, 10, pop(u, 1.6));
      lock(480, 290, true, GOOD, pop(u, 1.8) * 1.4); mono(480, 345, 'RequireAndVerifyClientCert · TLS 1.3', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 380, '양쪽이 서로를 증명한다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 2) { const x0 = 80, W = 760;
      el('line', { x1: x0, y1: 140, x2: x0 + W, y2: 140, stroke: MUT, 'stroke-width': 3 }); tx(x0 + W, 120, '시간', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      el('rect', { x: x0, y: 160, width: 460 * E(u, 0.2, 0.8), height: 30, rx: 5, fill: INFO, opacity: 0.7 }); mono(x0 + 10, 181, 'server.crt  v1', { 'font-size': 14, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.6) });
      el('rect', { x: x0 + 380, y: 200, width: 380 * E(u, 0.9, 1.5), height: 30, rx: 5, fill: ACC, opacity: 0.8 }); mono(x0 + 390, 221, 'server.crt  v2 (cert-manager)', { 'font-size': 14, fill: PANEL, 'font-weight': 700, opacity: fade(u, 1.3) });
      [[x0 + 200, 'v1'], [x0 + 430, 'v2'], [x0 + 640, 'v2']].forEach(([x, v], i) => { el('line', { x1: x, y1: 250, x2: x, y2: 290, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.5 + i * 0.25) }); mono(x, 310, '핸드셰이크 → ' + v, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 1.5 + i * 0.25) }); });
      pill(480, 370, 'GetCertificate 가 매번 디스크에서 읽는다 · 재시작 없음', GOOD, pop(u, 2.2)); return; }
    if (k >= 3 && k <= 5) { const gx = 430;
      el('rect', { x: gx - 20, y: 80, width: 40, height: 260, rx: 6, fill: k === 5 ? GOOD : WARN, opacity: 0.85 }); mono(gx, 70, 'authInterceptor', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700 });
      card(780, 210, 200, 90, { rx: 12, text: 'handler', mono: true, fs: 16, stroke: k === 5 ? GOOD : GRID, color: k === 5 ? INK : MUT });
      if (k === 3) { fly(80, 160, 400, 160, seg(u, 0.2, 0.9), 'GetUser · 토큰 없음', { fill: INK });
        if (u > 0.9) { cross(gx, 160, 13, pop(u, 0.9)); fly(400, 230, 80, 230, seg(u, 1.1, 1.8), 'UNAUTHENTICATED (16)', { fill: BAD, mono: true }); }
        mono(70, 300, 'md.Get("authorization") == []', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.9) }); sub(780, 290, '닿지 않는다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      if (k === 4) { const parts = [['eyJhbGc', '헤더'], ['eyJzdWIi', '페이로드 (exp)'], ['SflKxw', '서명']];
        parts.forEach(([s, d], i) => { const x = 60 + i * 115; card(x + 50, 150, 105, 40, { rx: 6, text: s, mono: true, fs: 13.5, stroke: [INFO, WARN, ACC][i], s: pop(u, 0.2 + i * 0.2) }); tx(x + 50, 190, d, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3 + i * 0.2) }); });
        [['서명 검증', true], ['만료 검사', false]].forEach(([s, ok], i) => { const y = 250 + i * 50; tx(80, y, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.4) }); (ok ? check : cross)(220, y - 6, 10, pop(u, 1.1 + i * 0.4)); });
        fly(400, 330, 80, 370, seg(u, 1.9, 2.5), 'UNAUTHENTICATED · 토큰 무효', { fill: BAD }); return; }
      fly(80, 210, 400, 210, seg(u, 0.2, 0.8), '토큰 OK', { fill: GOOD });
      card(575, 210, 170, 70, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.9) }); mono(575, 205, 'ctx', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) }); mono(575, 228, 'userKey = "u-42"', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      grow(460, 210, 503, 210, seg(u, 0.9, 1.1), ACC); grow(662, 210, 678, 210, seg(u, 1.4, 1.7), ACC);
      sub(780, 290, '토큰은 다시 보지 않고 "누가" 만 안다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // k6: 서버에 붙이기
    zone(120, 60, 720, 320, 'grpc.Creds(mtlsCreds)', { fill: SOFT, stroke: GOOD, sw: 2.5, op: fade(u, 0.2), color: GOOD });
    lock(810, 85, true, GOOD, pop(u, 0.4));
    card(330, 230, 220, 120, { rx: 12, stroke: WARN, s: pop(u, 0.8) }); mono(330, 200, 'ChainUnary', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) }); mono(330, 222, 'Interceptor', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.9) });
    mono(330, 258, 'authInterceptor', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.1) });
    ['GetUser', 'UpdateUser', 'ListUsers'].forEach((m, i) => { grow(442, 230, 560, 150 + i * 80, seg(u, 1.3 + i * 0.2, 1.6 + i * 0.2), MUT); card(660, 150 + i * 80, 180, 50, { rx: 8, text: m, mono: true, fs: 14, s: pop(u, 1.5 + i * 0.2) }); });
    sub(480, 405, '전송은 mTLS, 신원은 인터셉터 한 곳', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ───────── 4. 관측
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const x0 = 120, W = 700;
      el('rect', { x: x0, y: 150, width: W * E(u, 0.2, 1.6), height: 120, rx: 14, fill: SOFT, stroke: INFO, 'stroke-width': 2 }); mono(x0 + 14, 174, 'logInterceptor', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      el('rect', { x: x0 + 180, y: 190, width: 340 * E(u, 0.8, 1.6), height: 60, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(x0 + 350, 226, 'handler(ctx, req)', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      pill(x0 + 90, 300, 'start := time.Now()', INFO, pop(u, 0.6), { mono: true, fs: 13.5 }); pill(x0 + W - 110, 300, 'time.Since(start)', INFO, pop(u, 1.8), { mono: true, fs: 13.5 });
      sub(480, 370, '핸들러 앞뒤를 감싸 걸린 시간을 잰다', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 1) { terminal(60, 90, 840, 150, [['{"level":"INFO","msg":"rpc",', null], ['  "method":"/user.v1.UserService/GetUser",', null], ['  "code":"OK","ms":3}', null]], lerp(0, 3, E(u, 0.2, 1.4)), { fs: 15, lh: 28, title: 'slog JSON' });
      [['method', 230], ['code', 470], ['ms', 690]].forEach(([s, x], i) => pill(x, 300, s + ' 로 거른다', ACC, pop(u, 1.6 + i * 0.25), { fs: 14 }));
      sub(480, 360, 'ms 값은 예시', fade(u, 2.3), { 'font-size': 13.5 }); return; }
    if (k === 2) { const layers = [['StatsHandler (otelgrpc)', 'trace + metrics', ACC, 380], ['logInterceptor', '구조화 로그', INFO, 280], ['handler', '', INK, 180]];
      layers.forEach(([n, d, col, w], i) => { card(480, 220, w + 300, 260 - i * 80, { rx: 16, stroke: col, fill: i === 2 ? PANEL : SOFT, sw: 2.2, s: pop(u, 0.2 + i * 0.4) });
        mono(480, 110 + i * 40, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.3 + i * 0.4) });
        if (d) tx(480 + (w + 300) / 2 - 20, 110 + i * 40, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.4 + i * 0.4) }); });
      dot([[60, 230], [480, 230]], seg(u, 1.4, 2.2), WARN, 7); sub(480, 390, '요청 하나가 두 겹을 지나며 trace·metrics·log 를 남긴다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k >= 3 && k <= 5) { server(720, 200, null, { lamp: k === 5 ? BAD : GOOD });
      card(720, 320, 300, 50, { rx: 25, text: 'grpc.health.v1.Health', mono: true, fs: 14.5, stroke: ACC, s: k === 3 ? pop(u, 0.3) : 1 });
      if (k !== 4) card(170, 200, 200, 60, { rx: 10, text: k === 5 ? 'LB' : 'LB · k8s 프로브', fs: 15 });
      if (k === 3) { fly(270, 180, 650, 180, seg(u, 0.8, 1.5), 'Check(service="")', { mono: true, fill: INK }); fly(650, 220, 270, 220, seg(u, 1.6, 2.3), 'SERVING', { mono: true, fill: GOOD });
        sub(480, 400, '직접 만들지 않고 표준 서비스를 등록한다', fade(u, 2.3), { 'font-size': 14.5 }); return; }
      if (k === 4) { [['""  (서버 전체)', 'SERVING', GOOD], ['"user.v1.UserService"', 'SERVING', GOOD], ['등록 안 한 이름', 'NOT_FOUND', WARN]].forEach(([a, b, col], i) => { const y = 60 + i * 44;
          row(60, y - 20, 470, a, b, { op: fade(u, 0.3 + i * 0.4), rcol: col }); });
        sub(300, 230, '마지막 줄은 파이썬 health 서버에 물어 본 실제 응답', fade(u, 1.8), { 'font-size': 13.5 }); return; }
      fly(270, 180, 650, 180, seg(u, 0.2, 0.7), 'Check', { mono: true, fill: INK }); fly(650, 220, 270, 220, seg(u, 0.7, 1.2), 'NOT_SERVING', { mono: true, fill: BAD });
      if (u > 1.3) { cross(470, 300, 13, pop(u, 1.3)); } dot([[60, 300], [460, 300]], seg(u, 1.4, 2.0), INK, 7);
      tx(470, 360, '새 요청을 다른 인스턴스로', { 'font-size': 15, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k6: k8s 프로브
    snippet(60, 80, ['readinessProbe:', '  grpc:', '    port: 50051'], { fs: 17, op: fade(u, 0.2) });
    zone(560, 80, 340, 260, 'Pod', { fill: SOFT, op: fade(u, 0.4) }); server(730, 210, ':50051', { s: 0.9, lamp: GOOD });
    card(300, 300, 220, 56, { rx: 10, text: 'kubelet', fs: 16, stroke: INFO, s: pop(u, 0.8) });
    [0, 1, 2].forEach((i) => fly(410, 290, 660, 220, seg(u, 1.0 + i * 0.5, 1.4 + i * 0.5), 'probe', { mono: true, fill: INFO }));
    sub(300, 380, '내장 gRPC 프로브 또는 grpc_health_probe', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ───────── 5. 운영 + 체크리스트
  const CHECK = [['계약', 'buf lint · breaking 통과'], ['계약', '번호 재사용·타입 변경 없음'], ['안정', '모든 RPC 에 deadline'], ['안정', '재시도는 멱등만, 백오프 상한'], ['안정', 'keepalive · 메시지 크기'], ['보안', 'TLS/mTLS'], ['보안', '인증 인터셉터 · 인증서 회전'],
    ['관측', 'OTel + 구조화 로그'], ['관측', 'health 등록 + 프로브'], ['운영', 'round_robin / 메시 분산'], ['운영', 'graceful + 리소스 제한'], ['운영', 'reflection 은 프로덕션에서 끔']];
  function s5(t, c) { const { k, u } = c;
    if (k === 7 || k === 8) { const half = k === 7 ? [0, 7] : [7, 12];
      CHECK.forEach(([cat, s], i) => { const col = i < 6 ? 0 : 1, y = 44 + (i % 6) * 54, x = 40 + col * 450, inHalf = i >= half[0] && i < half[1], done = i < half[1];
        const a = inHalf ? E(u, 0.2 + (i - half[0]) * 0.28, 0.5 + (i - half[0]) * 0.28) : done ? 1 : 0;
        el('rect', { x, y, width: 430, height: 46, rx: 8, fill: a > 0.5 ? ACCBG : PANEL, stroke: a > 0.5 ? ACC : GRID, 'stroke-width': 1.5 });
        mono(x + 14, y + 29, cat, { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(x + 64, y + 29, s, { 'font-size': 15 });
        if (a > 0.5) check(x + 405, y + 23, 9, a); });
      const n = k === 7 ? Math.round(lerp(0, 7, E(u, 0.2, 2.2))) : Math.round(lerp(7, 12, E(u, 0.2, 1.6)));
      mono(480, 400, `${n} / 12 통과`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: n === 12 ? GOOD : ACC }); return; }
    if (k === 0) { server(480, 190, null, { s: 1.2, lamp: OFF }); card(480, 320, 220, 50, { rx: 25, text: 'net.Listen :50051', mono: true, fs: 15, stroke: ACC, s: pop(u, 0.4) });
      tx(480, 390, '기동과 종료 사이의 경계에서 운영 품질이 갈린다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 1) { zone(40, 60, 420, 330, '연결 하나', { fill: SOFT });
      const n = Math.round(lerp(0, 40, E(u, 0.2, 1.6))); for (let i = 0; i < 40; i++) el('rect', { x: 60 + (i % 10) * 38, y: 100 + Math.floor(i / 10) * 40, width: 30, height: 30, rx: 4, fill: i < n ? ACC : PANEL, stroke: GRID, opacity: 0.85 });
      mono(250, 300, 'MaxConcurrentStreams(1000)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) }); sub(250, 330, '이 연결의 동시 스트림 상한', fade(u, 1.4), { 'font-size': 14 });
      zone(500, 60, 420, 330, '처리 워커', { fill: SOFT, op: fade(u, 1.4) });
      for (let i = 0; i < 64; i++) el('circle', { cx: 530 + (i % 16) * 24, cy: 110 + Math.floor(i / 16) * 30, r: 8, fill: INFO, opacity: fade(u, 1.5 + i * 0.01) });
      mono(710, 300, 'NumStreamWorkers(64)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { [['ENV=staging', true], ['ENV=production', false]].forEach(([env, on], i) => { const x = 250 + i * 460, t0 = 0.2 + i * 1.0;
        zone(x - 210, 60, 420, 320, env, { fill: SOFT, op: fade(u, t0) });
        terminal(x - 190, 100, 380, 130, on ? ['$ grpcurl host:50051 list', ['grpc.health.v1.Health', null], ['user.v1.UserService', null]] : ['$ grpcurl host:50051 list', ['server does not support', '#fca5a5'], ['the reflection API', '#fca5a5']], lerp(0, 3, E(u, t0 + 0.2, t0 + 0.8)), { fs: 14, lh: 26 });
        (on ? check : cross)(x, 290, 14, pop(u, t0 + 0.8)); tx(x, 340, on ? '스키마 없이 디버깅' : '서비스 목록을 숨긴다', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, fill: on ? GOOD : BAD, opacity: fade(u, t0 + 0.9) }); });
      sub(480, 405, 'grpcurl 출력 문구는 예시', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    // k3~k6: 기동·종료 시간선
    const x0 = 60, W = 840, X = (f) => x0 + f * W;
    el('line', { x1: x0, y1: 120, x2: x0 + W, y2: 120, stroke: MUT, 'stroke-width': 3 });
    const marks = [[0.08, 'SERVING', GOOD, 3], [0.14, 'Serve()', INK, 3], [0.45, 'SIGTERM', BAD, 4], [0.5, 'NOT_SERVING', WARN, 5], [0.62, '+2s', WARN, 5], [0.64, 'GracefulStop', ACC, 6], [0.95, '30s 상한', BAD, 6]];
    marks.forEach(([f, s, col, kk], i) => { if (k < kk) return; const a = k === kk ? fade(u, 0.2 + (i % 2) * 0.6) : 1;
      const ly = i % 2 ? 64 : 92; el('line', { x1: X(f), y1: ly + 6, x2: X(f), y2: 140, stroke: col, 'stroke-width': 3, opacity: a }); mono(X(f), ly, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: a }); });
    // 요청 막대들
    const reqs = [[0.16, 0.3], [0.22, 0.4], [0.3, 0.52], [0.38, 0.7], [0.42, 0.85], [0.55, 0.6], [0.66, 0.7]];
    reqs.forEach(([a, b], i) => { const y = 170 + i * 30, refused = a > 0.5, cut = k >= 6 ? 0.95 : k >= 4 ? 1 : 0.5;
      if (k < 4 && a > 0.45) return; if (k === 3 && a > 0.4) return;
      const end = Math.min(b, k === 3 ? 0.45 : 1), g = k === 3 ? E(u, 0.2 + i * 0.2, 0.8 + i * 0.2) : 1;
      if (refused && k >= 5) { cross(X(a), y + 8, 8, k === 5 ? pop(u, 0.8 + i * 0.1) : 1); mono(X(a) + 16, y + 13, '다른 인스턴스로', { 'font-size': 13.5, fill: MUT, opacity: k === 5 ? fade(u, 1.0) : 1 }); return; }
      if (refused) return;
      el('rect', { x: X(a), y, width: (X(end) - X(a)) * g, height: 18, rx: 4, fill: k >= 6 ? GOOD : ACC, opacity: 0.8 }); });
    if (k === 3) sub(480, 400, 'health 를 올린 뒤 Serve 를 고루틴으로', fade(u, 1.8), { 'font-size': 14.5 });
    if (k === 4) { pill(X(0.45), 380, 'k8s 가 SIGTERM 을 먼저 보낸다', BAD, pop(u, 0.6)); }
    if (k === 5) sub(480, 400, 'LB 가 프로브 실패를 볼 2초를 준다', fade(u, 1.6), { 'font-size': 14.5 });
    if (k === 6) sub(480, 400, '진행 중 RPC 는 끝까지, 30s 를 넘기면 Stop()', fade(u, 1.0), { 'font-size': 14.5 }); }

  const quiz = [
    { q: '지운 필드 번호 3을 다른 string 필드에 다시 쓰면 옛 클라이언트가 보낸 바이트는 어떻게 읽히는가?',
      o: ['에러가 나서 요청이 거절된다', '옛 email 값이 새 필드에 그대로 들어간다', '새 필드는 항상 빈 값이 된다'], a: 1,
      why: '태그 0x1a는 "필드 3, 길이형" 이라는 뜻뿐이다. 새 스키마로 읽어 보니 phone = "alice@acme.io" 가 되었다. 그래서 reserved로 번호를 봉인한다.' },
    { q: 'retryPolicy의 maxAttempts 4는 서버에 몇 번까지 닿을 수 있다는 뜻인가?',
      o: ['첫 시도를 포함해 4번', '재시도만 4번, 모두 5번', '무한히, 백오프 상한까지'], a: 0,
      why: '늘 UNAVAILABLE을 내는 서버로 세어 보니 4번이었다. 대기 상한은 0.2s에서 두 배씩 늘고 3s를 넘지 않는다.' },
    { q: '인증을 인터셉터 한 곳에서 처리하면 핸들러는 무엇을 받는가?',
      o: ['원본 JWT 문자열', 'TLS 인증서 파일 경로', 'context에 담긴 검증된 사용자 ID'], a: 2,
      why: '토큰이 없거나 무효면 핸들러에 닿기 전에 UNAUTHENTICATED로 끊고, 통과하면 userID를 ctx에 넣어 넘긴다.' },
    { q: '인스턴스를 내리기 전에 health를 NOT_SERVING으로 바꾸는 까닭은 무엇인가?',
      o: ['로그를 남기기 위해', 'LB·프로브가 이 인스턴스로 새 요청을 보내지 않게 하려고', '메모리를 비우기 위해'], a: 1,
      why: 'grpc.health.v1 Check가 NOT_SERVING을 돌려주면 LB가 이 인스턴스를 빼고 새 요청을 다른 곳으로 보낸다.' },
    { q: 'GracefulStop에 30초 상한을 두는 까닭은 무엇인가?',
      o: ['길게 끝나지 않는 RPC가 있으면 종료가 끝없이 늦어져 배포가 멈추기 때문', 'GracefulStop이 새 요청까지 받기 때문', '30초가 지나면 인증서가 만료되기 때문'], a: 0,
      why: 'GracefulStop은 진행 중 RPC를 기다린다. 스트림처럼 안 끝나는 호출이 있으면 기다림도 끝나지 않으니 30s 뒤 Stop()으로 끊는다.' },
  ];

  const summary = [
    '.proto의 번호를 다시 쓰면 옛 바이트가 에러 없이 엉뚱한 필드로 읽히니 reserved로 묻고 buf breaking을 CI에 건다.',
    '모든 호출에 deadline을 걸고, 재시도는 멱등 메서드에만 백오프와 함께 준다.',
    '전송은 mTLS로, 사용자 인증은 인터셉터 한 곳에서 하고 인증서는 재시작 없이 바꾼다.',
    '내릴 때는 health를 NOT_SERVING으로 바꿔 트래픽을 빼고 GracefulStop에 30초 상한을 둔다.',
  ];
  const review = [
    { q: '배포 직후 일부 클라이언트에서 사용자 나이가 전부 0으로 보인다. 어제 .proto에서 지운 email = 3 자리에 int64 age = 3을 넣었다. 먼저 할 일은?',
      o: ['age를 새 번호로 옮기고 3을 reserved로 묻는다', '클라이언트 캐시를 비운다', 'max 메시지 크기를 늘린다'], a: 0,
      why: '옛 클라이언트는 3 번에 문자열을 보내고, 새 스키마는 int64로 읽으려다 값을 버려 0이 된다. buf breaking을 CI에 걸었다면 배포 전에 막혔다.' },
    { q: '결제 생성 API에서 가끔 같은 결제가 두 번 들어간다. service config에서 먼저 볼 것은?',
      o: ['keepalive Time', 'CreatePayment에 retryPolicy가 걸려 있는지', 'MaxConcurrentStreams 값'], a: 1,
      why: '비멱등 호출을 재시도하면 서버가 이미 처리한 요청이 한 번 더 실행된다. 재시도는 GetUser처럼 몇 번 불러도 같은 메서드에만 건다.' },
    { q: '롤링 배포 때마다 몇 초 동안 UNAVAILABLE이 튄다. 서버 종료 순서에서 빠졌을 가능성이 큰 것은?',
      o: ['reflection을 끄는 것', 'MaxRecvMsgSize를 늘리는 것', 'SIGTERM을 받자마자 NOT_SERVING으로 바꾸고 잠시 기다리는 것'], a: 2,
      why: 'health를 먼저 내려야 LB가 새 요청을 다른 인스턴스로 돌린다. 바로 멈추면 그 사이 들어온 요청이 실패한다.' },
  ];

  R.page({ title: '프로덕션 점검', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
