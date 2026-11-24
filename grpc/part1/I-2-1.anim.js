/* I-2-1 HTTP/2 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 연결(파이프)과 그 위의 스트림·프레임, 9바이트 프레임 머리, 수신 창, ALPN 협상, L4/L7 분산.
 * 실측: Node http2 클라이언트 → Python grpcio 1.85 서버를 TCP 중계로 엿본 프레임(스트림 1·3·5, HEADERS 62→28B, 응답 순서 3·5·1),
 *       Python 채널 하나로 1000 RPC 를 보냈을 때 서버가 본 클라이언트 주소 1개, openssl s_client -alpn 출력. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, server, person, cross, check, lock, terminal, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const SC = { 1: ACC, 3: WARN, 5: INFO };     // 스트림 색

  // ---------- 1. HTTP/1.1 의 벽 ----------
  const T0 = 190, T1 = 920;                      // 시간축
  function pipeRow(y, name, o) { o = o || {};
    el('rect', { x: T0 - 6, y: y - 16, width: T1 - T0 + 12, height: 32, rx: 16, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': 1.5, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    tx(T0 - 18, y + 5, name, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: o.col || INK, opacity: o.op ?? 1 }); }
  function bar(x0, x1, y, f, text, col, o) { o = o || {}; if (f <= 0) return; const w = (x1 - x0) * clamp(f);
    el('rect', { x: x0, y: y - 11, width: w, height: 22, rx: 6, fill: col, opacity: o.op ?? 0.9 });
    if (text && f > 0.5) tx(x0 + 10, y + 5, text, { 'font-size': 14, 'font-weight': 700, fill: PANEL, class: o.mono ? 'mono' : null }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { const y = 150; pipeRow(y, 'TCP 연결 #1');
      bar(T0 + 4, 430, y, k === 0 ? E(u, 0.3, 2.2) : 1, 'GET /a', ACC, { mono: true });
      tx(560, 92, '한 번에 한 요청만 흐른다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: k === 0 ? fade(u, 1.0) : 1 });
      if (k === 1) { [['GET /b', 440, 620, 240], ['GET /c', 630, 800, 300]].forEach(([s, a, b, yy], i) => { const at = 0.3 + i * 0.5;
          tx(T0 - 18, yy + 5, s, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, at) });
          el('line', { x1: T0 + 4, y1: yy, x2: lerp(T0 + 4, a, E(u, at, at + 0.8)), y2: yy, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 5' });
          if (u > at + 0.8) { bar(a, b, yy, E(u, at + 0.8, at + 1.4), '', WARN); grow(a, yy - 14, a, y + 18, 1, MUT, { plain: true, dash: '3 4' }); }
          tx((T0 + a) / 2, yy - 16, '대기', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, at + 0.3) }); });
        banner(560, 380, 'Head-of-Line Blocking: 앞이 끝나야 뒤가 간다', pop(u, 2.0)); }
      return; }
    const n = 6, ys = Array.from({ length: n }, (_, i) => 56 + i * 54), hs = k >= 3;
    ys.forEach((y, i) => { const at = k === 2 ? 0.2 + i * 0.12 : -9; pipeRow(y, `연결 #${i + 1}`, { op: k === 2 ? fade(u, at) : 1 });
      let x = T0 + 4;
      if (hs) { const f = k === 3 ? E(u, 0.3, 1.2) : 1; bar(x, x + 70, y, f, 'TCP', MUT); bar(x + 74, x + 190, y, k === 3 ? E(u, 0.9, 1.9) : 1, 'TLS', WARN); x += 196; }
      bar(x, x + 230, y, k === 2 ? E(u, at + 0.3, at + 1.3) : k === 3 ? E(u, 1.8, 2.6) : 1, '요청', ACC); });
    if (k === 2) tx(T1, 30, '도메인당 6개 안팎을 동시에 연다', { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) });
    if (k === 3) tx(T1, 30, '연결마다 handshake와 slow-start를 다시 한다', { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
    if (k >= 4) { const y = 56 + 6 * 54 + 8; pipeRow(y, k === 4 ? '7번째 요청' : '그다음 요청들', { dash: '6 5', stroke: BAD, fill: BADBG, col: BAD });
      if (k === 4) { el('line', { x1: T0 + 4, y1: y, x2: lerp(T0 + 4, 700, E(u, 0.3, 1.8)), y2: y, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 5' });
        tx(T1, 30, '소켓 · 메모리 · FD를 연결 수만큼 쓴다', { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) }); }
      else { for (let i = 0; i < 28; i++) el('circle', { cx: T0 + 14 + i * 24, cy: y, r: 6, fill: BAD, opacity: fade(u, 0.1 + i * 0.03) });
        banner(560, 26, '초당 수천 RPC면 그대로 지연과 CPU, 해법은 HTTP/2 멀티플렉싱', pop(u, 1.4)); } } }

  // ---------- 2. 한 연결, 여러 스트림 ----------
  const P = { x1: 170, x2: 770, y: 214 };
  function conn(op) { el('rect', { x: P.x1, y: P.y - 28, width: P.x2 - P.x1, height: 56, rx: 28, fill: SOFT, stroke: INK, 'stroke-width': 2.5, opacity: op });
    person(96, P.y + 4, '클라이언트', { op }); server(860, P.y - 6, 'gRPC 서버', { s: 0.85, op }); }
  function frame(x, y, s, kind, o) { o = o || {}; card(x, y, 50, 34, { rx: 6, fill: SC[s] || MUT, stroke: 'none', text: kind + s, fs: 14, fw: 800, color: PANEL, mono: true, s: o.s, op: o.op }); }
  function stream(fs, u, t0, dur) {   // 프레임이 왼쪽에서 들어와 보낸 순서대로 파이프 안에 줄을 선다 (맨 앞 프레임이 서버 쪽)
    fs.forEach((f, i) => { const p = seg(u, t0 + i * 0.18, t0 + i * 0.18 + dur); if (p <= 0) return; const x = lerp(P.x1 + 34, P.x2 - 40 - i * 58, E(p, 0, 1)); frame(x, P.y, f.s, f.k); }); }
  function s2(t, c) { const { k, u } = c, fr = c.beat.frames || [];
    conn(k === 0 ? fade(u, 0.1) : 1);
    if (k === 0) { grow(P.x1, P.y, P.x2, P.y, E(u, 0.3, 1.4), ACC, { plain: true });
      tx(470, 130, 'TCP 연결은 딱 하나', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.2) });
      sub(470, 290, '이 연결 위에 RPC를 스트림으로 쌓는다', fade(u, 1.6)); return; }
    if (k === 1) { [['SETTINGS', 'S→C', 1], ['WINDOW_UPDATE', 'S→C', 1], ['SETTINGS', 'C→S', 0]].forEach(([s, d, back], i) => { const at = 0.3 + i * 0.75;
        fly(back ? P.x2 - 60 : P.x1 + 60, P.y, back ? P.x1 + 80 : P.x2 - 80, P.y, seg(u, at, at + 0.65), s, { fill: MUT, mono: true }); });
      mono(470, 130, 'grpc.NewClient("localhost:50051", …)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(470, 290, '연결 설정은 처음 한 번만 (실측: SETTINGS · WINDOW_UPDATE 교환)', fade(u, 1.8)); return; }
    card(96, 120, 170, 34, { rx: 8, stroke: ACC, fill: ACCBG, text: 'UserServiceClient', fs: 14, mono: true, s: k === 2 ? pop(u, 0.2) : 1 });
    if (k === 2) { stream(fr, u, 0.7, 1.2); tx(470, 300, 'RPC 1건 = 스트림 1개 (stream 1)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); return; }
    if (k === 3 || k === 4) { [1, 3, 5].forEach((s, i) => pill(330 + i * 140, 128, 'stream ' + s, SC[s], k === 3 ? pop(u, 0.2 + i * 0.25) : 1, { mono: true, fs: 14 }));
      stream(fr, u, 0.6, 1.1);
      if (k === 3) sub(470, 300, '호출마다 새 스트림 ID, 클라이언트가 여는 ID는 홀수', fade(u, 1.5));
      if (k === 4) { [1, 3, 5].forEach((s, i) => { const y = 300 + i * 34, got = fr.filter((f, j) => f.s === s && u > 0.6 + j * 0.18 + 1.1).length;
          tx(600, y + 5, `stream ${s}`, { 'font-size': 14, class: 'mono', 'font-weight': 700, fill: SC[s], 'text-anchor': 'end' });
          for (let j = 0; j < got; j++) el('rect', { x: 612 + j * 30, y: y - 10, width: 26, height: 20, rx: 4, fill: SC[s] }); });
        tx(330, 330, '스트림 ID로 다시 조립', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
        sub(330, 356, '실측 응답 순서: 3 → 5 → 1', fade(u, 1.6)); }
      return; }
    if (k === 5) { for (let i = 0; i < 12; i++) { const f = ((t * 0.45 + i / 12) % 1), s = [1, 3, 5][i % 3]; frame(lerp(P.x1 + 34, P.x2 - 34, f), P.y, s, i % 2 ? 'D' : 'H'); }
      const n = Math.round(tween(0, 1000, u, 1.6));
      mono(470, 130, `${n} RPC`, { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      card(470, 318, 380, 50, { rx: 10, stroke: GOOD, fill: GOODBG, text: '서버가 본 클라이언트 주소: 1개', fs: 16, s: pop(u, 1.9) });
      sub(470, 362, 'Python 채널 하나로 1000건 실측, 새 TCP 연결 없음', fade(u, 2.2)); return; }
    // k6: 안티패턴
    for (let i = 0; i < 5; i++) { const y = 300 + i * 22; el('rect', { x: P.x1, y: y - 8, width: (P.x2 - P.x1) * E(u, 0.2 + i * 0.15, 0.8 + i * 0.15), height: 16, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 1.5 });
      if (u > 0.5 + i * 0.15) mono(P.x1 + 8, y + 5, 'handshake', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 }); }
    mono(470, 130, 'for … { grpc.NewClient(addr) }', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.2) });
    cross(700, 130, 14, pop(u, 1.6)); tx(470, 410, 'conn은 앱 시작 때 하나(또는 소수) 만들어 재사용', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); }

  // ---------- 3. 프레임과 HPACK ----------
  const HDR = ['00', '00', '3E', '01', '04', '00', '00', '00', '01'];
  const GRPS = [[0, 3, 'Length', '62', INFO], [3, 4, 'Type', 'HEADERS', ACC], [4, 5, 'Flags', 'END_HEADERS', WARN], [5, 9, 'R + Stream ID', '1', GOOD]];
  function hdrBytes(k, u) { const w = 66, gap = 8, x0 = (960 - 9 * (w + gap) + gap) / 2, y = 90;
    tx(480, 50, '실측 HEADERS 프레임의 머리 9바이트 (stream 1)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 });
    GRPS.forEach(([a, b, name, val, col], g) => { const on = k === 0 ? g < 3 : g === 3, at = k === 0 ? 0.3 + g * 0.45 : 0.3, op = (k === 0 && g < 3) || (k === 1 && g === 3) ? fade(u, at) : 0.35;
      for (let i = a; i < b; i++) card(x0 + i * (w + gap) + w / 2, y + 22, w, 44, { rx: 6, stroke: on ? col : GRID, fill: on ? PANEL : SOFT, sw: on ? 2.5 : 1.5, text: HDR[i], fs: 18, mono: true, fw: 800, color: on ? INK : MUT, s: k === 0 && g < 3 ? pop(u, at) : 1 });
      const xa = x0 + a * (w + gap), xb = x0 + b * (w + gap) - gap;
      el('path', { d: `M${xa},${y + 54} v8 H${xb} v-8`, fill: 'none', stroke: col, 'stroke-width': 2, opacity: op });
      tx((xa + xb) / 2, y + 86, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: op });
      mono((xa + xb) / 2 + (g === 2 ? 24 : g === 1 ? -14 : 0), y + 108 + (g === 2 ? 22 : 0), val, { 'text-anchor': 'middle', 'font-size': 15, opacity: op }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { hdrBytes(k, u);
      if (k === 0) sub(480, 290, '길이 3B + 타입 1B + 플래그 1B, 받는 쪽이 경계를 바로 안다', fade(u, 2.0));
      if (k === 1) { const bits = '0' + '0000000'; [...bits].forEach((b, i) => card(330 + i * 34, 300, 30, 36, { rx: 4, stroke: i ? GOOD : MUT, fill: i ? GOODBG : SOFT, text: b, fs: 16, mono: true, s: pop(u, 0.6 + i * 0.05) }));
        tx(330, 344, 'R(예약)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); tx(560, 344, '+ 31비트 스트림 ID …', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, opacity: fade(u, 1.0) });
        sub(480, 390, '이 번호로 섞여 온 프레임을 제 스트림에 돌려놓는다', fade(u, 1.6)); }
      return; }
    if (k === 2) { const T = [['DATA', '0x0', '본문 (gRPC 메시지 바이트)', ACC], ['HEADERS', '0x1', '헤더·트레일러 (HPACK)', ACC], ['RST_STREAM', '0x3', '스트림 하나만 취소', BAD], ['SETTINGS', '0x4', '연결 설정 협상', INK], ['PING', '0x6', 'keepalive · 왕복 측정', INK], ['GOAWAY', '0x7', '연결 종료 예고', INK], ['WINDOW_UPDATE', '0x8', '흐름 제어 창 회복', INFO]];
      T.forEach(([n, code, m, col], i) => { const y = 54 + i * 50, s = pop(u, 0.2 + i * 0.2);
        card(200, y, 190, 38, { rx: 19, stroke: col, sw: 2.2, text: n, fs: 15, mono: true, fw: 800, color: col, s }); mono(330, y + 6, code, { 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3 + i * 0.2) });
        tx(400, y + 6, m, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.2) }); });
      sub(780, 220, 'RST_STREAM 덕에 연결은 두고', fade(u, 1.8), { 'font-weight': 700, fill: BAD }); sub(780, 244, '호출 하나만 끊을 수 있다', fade(u, 1.9)); return; }
    if (k === 3) { const cx = 90, sx = 870, rows = [['→', 'HEADERS', ':path=/user.v1.UserService/GetUser', ACC], ['→', 'DATA 10B', '00 00 00 00 05 0A 03 75 2D 31', ACC], ['←', 'HEADERS', ':status=200  content-type=application/grpc', GOOD], ['←', 'DATA 19B', '00 00 00 00 0E 0A 03 75 2D 31 12 05 …', GOOD], ['←', 'HEADERS', 'grpc-status=0   (트레일러, END_STREAM)', WARN]];
      el('line', { x1: cx, y1: 40, x2: cx, y2: 380, stroke: INK, 'stroke-width': 3 }); el('line', { x1: sx, y1: 40, x2: sx, y2: 380, stroke: INK, 'stroke-width': 3 });
      tx(cx, 30, '클라', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); tx(sx, 30, '서버', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      rows.forEach(([d, n, m, col], i) => { const y = 74 + i * 66, at = 0.2 + i * 0.45, f = E(u, at, at + 0.4), right = d === '→';
        grow(right ? cx : sx, y + 14, right ? lerp(cx, sx, f) : lerp(sx, cx, f), y + 14, f, col === WARN ? ACC : col === GOOD ? MUT : ACC);
        tx(cx + 20, y, `stream 1  ${n}`, { 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono', opacity: fade(u, at + 0.2) });
        mono(cx + 220, y, m, { 'font-size': 14, opacity: fade(u, at + 0.3) }); });
      tx(480, 410, '상태 코드는 응답 헤더가 아니라 마지막 트레일러에 실린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.4) }); return; }
    if (k === 4) { const x = 260, max = 520, top = 78;
      tx(480, 40, '같은 연결에서 HEADERS 프레임 길이 (실측)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 });
      [['요청', [['stream 1', 62], ['stream 3', 28], ['stream 5', 28]], 80], ['응답', [['첫 응답', 78], ['둘째', 3], ['셋째', 3]], 250]].forEach(([g, rows, y0], gi) => {
        tx(60, y0 + 34, g, { 'font-size': 16, 'font-weight': 800, fill: gi ? GOOD : ACC });
        rows.forEach(([n, v], i) => { const y = y0 + i * 40, f = E(u, 0.3 + gi * 0.8 + i * 0.2, 1.0 + gi * 0.8 + i * 0.2);
          tx(x - 12, y + 18, n, { 'font-size': 14.5, 'text-anchor': 'end', class: 'mono' }); el('rect', { x, y, width: Math.max(2, max * v / top * f), height: 24, rx: 4, fill: gi ? GOOD : ACC, opacity: 0.85 });
          mono(x + 10 + max * v / top * f, y + 18, v + ' B', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.8 + gi * 0.8 + i * 0.2) }); }); });
      sub(480, 405, '처음 본 헤더는 동적 테이블에 등록되고, 다음부터는 인덱스만 간다', fade(u, 2.2)); return; }
    // k5: 홀짝
    tx(480, 70, '스트림 ID', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700 });
    for (let i = 1; i <= 8; i++) { const x = 160 + (i - 1) * 92, odd = i % 2 === 1, s = pop(u, 0.2 + i * 0.12);
      card(x, 160, 70, 60, { rx: 10, stroke: odd ? ACC : GRID, fill: odd ? ACCBG : SOFT, text: String(i), fs: 24, mono: true, fw: 800, color: odd ? ACC : OFF, s });
      if (!odd) cross(x, 160, 12, pop(u, 1.4 + i * 0.05)); }
    tx(300, 240, '홀수: 클라이언트가 연 스트림', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
    tx(660, 240, '짝수: 서버 푸시, gRPC는 쓰지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
    sub(480, 300, '그래서 gRPC 프레임 로그에는 1, 3, 5 …만 보인다', fade(u, 2.0)); }

  // ---------- 4. 흐름 제어 + 양방향 ----------
  const UP = 150, DN = 240, LX1 = 200, LX2 = 760;
  function lanesBidi(op) { [UP, DN].forEach((y, i) => { el('line', { x1: LX1, y1: y, x2: LX2, y2: y, stroke: GRID, 'stroke-width': 18, 'stroke-linecap': 'round', opacity: op });
      tx(LX1 + 4, y - 16, i ? '← 서버 DATA' : '클라 DATA →', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); });
    person(110, 198, '클라', {}); server(850, 192, '서버', { s: 0.8 });
    el('rect', { x: LX1 - 20, y: UP - 30, width: LX2 - LX1 + 40, height: DN - UP + 60, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: op });
    mono(LX2 + 16, UP - 34, 'stream 1', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); }
  function gauge(c, o) { o = o || {}; const b = c.beat.flow || { used: 0 }, p = (c.prev && c.prev.flow) || b, v = tween(p.used, b.used, c.u), x = 300, y = 340, w = 360;
    tx(x - 14, y + 17, '수신 창', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
    el('rect', { x, y, width: w, height: 24, rx: 6, fill: SOFT, stroke: GRID }); el('rect', { x, y, width: w * v / 100, height: 24, rx: 6, fill: o.bad ? BAD : v > 80 ? WARN : INFO, opacity: 0.85 });
    tx(x + w + 14, y + 17, o.note || '받고 아직 처리 못 한 데이터', { 'font-size': 14, fill: MUT }); }
  function upF(u, a, n, col) { for (let i = 0; i < n; i++) { const p = seg(u, a + i * 0.3, a + i * 0.3 + 0.8); if (p > 0 && p < 1) el('rect', { x: lerp(LX1, LX2 - 30, p), y: UP - 9, width: 30, height: 18, rx: 4, fill: col || ACC }); } }
  function dnF(u, a, n) { for (let i = 0; i < n; i++) { const p = seg(u, a + i * 0.3, a + i * 0.3 + 0.8); if (p > 0 && p < 1) el('rect', { x: lerp(LX2 - 30, LX1, p), y: DN - 9, width: 30, height: 18, rx: 4, fill: GOOD }); } }
  function s4(t, c) { const { k, u } = c;
    if (k === 4 || k === 5) {
      if (k === 4) { [['초기 창이 작으면', 120, [[0, 0.5], [1.1, 1.6], [2.2, 2.6]], WARN], ['창을 1MB / 2MB로', 270, [[0, 2.6]], GOOD]].forEach(([s, y, runs, col], gi) => {
          tx(70, y - 30, s, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, gi * 0.3) }); el('line', { x1: 70, y1: y, x2: 890, y2: y, stroke: GRID, 'stroke-width': 2 });
          runs.forEach(([a, b], i) => { const f = E(u, 0.2 + a * 0.85, 0.2 + b * 0.85), x0 = 70 + a * 310; el('rect', { x: x0, y: y - 13, width: (b - a) * 310 * f, height: 26, rx: 4, fill: col === GOOD ? GOOD : ACC, opacity: 0.85 }); });
          if (!gi) [[0.5, 1.1], [1.6, 2.2]].forEach(([a, b], i) => { const x = 70 + a * 310, op = fade(u, 0.7 + a * 0.85);
            el('rect', { x: x + 4, y: y - 13, width: (b - a) * 310 - 8, height: 26, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: op });
            tx(x + (b - a) * 155, y + 5, 'WINDOW_UPDATE 대기', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: op }); }); });
        mono(480, 370, 'grpc.InitialWindowSize(1<<20)  InitialConnWindowSize(1<<21)', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
      tx(480, 70, '창을 무작정 키우면', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['적당한 창', 150, 0.4, GOOD], ['너무 큰 창', 230, 1.0, BAD]].forEach(([s, y, v, col], i) => { tx(280, y + 18, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.5) });
        el('rect', { x: 300, y, width: 480, height: 28, rx: 6, fill: SOFT, stroke: GRID }); el('rect', { x: 300, y, width: 480 * v * E(u, 0.4 + i * 0.5, 1.4 + i * 0.5), height: 28, rx: 6, fill: col, opacity: 0.8 }); });
      tx(780, 296, '수신 버퍼(메모리)가 커지고 백프레셔가 약해진다', { 'font-size': 14, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      banner(480, 340, '기준: 링크 대역폭 × RTT', pop(u, 2.1)); return; }
    lanesBidi(k === 0 ? fade(u, 0.2) : 1);
    mono(480, 44, 'rpc Chat(stream Msg) returns (stream Msg);', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 0 ? fade(u, 0.1) : 1 });
    gauge(c);
    if (k === 0) { upF(u, 0.8, 3); dnF(u, 1.2, 3); sub(480, 300, '스트림 하나에 두 방향 차선, 새 프로토콜이 아니다', fade(u, 2.0)); return; }
    if (k === 1) { card(850, 290, 200, 34, { rx: 8, stroke: ACC, fill: ACCBG, text: 'stream ChatServer', fs: 14, mono: true, s: pop(u, 0.4) });
      pill(640, 300, 'req *Msg', BAD, pop(u, 1.0), { mono: true, fs: 14 }); cross(640, 300, 11, pop(u, 1.3));
      sub(480, 410, '핸들러는 값이 아니라 스트림을 받고, Recv · Send 시점을 직접 고른다', fade(u, 1.7)); return; }
    if (k === 2) { upF(u, 0.3, 3); const eof = fade(u, 1.8); el('rect', { x: LX2 - 70, y: UP - 13, width: 60, height: 26, rx: 4, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: eof });
      tx(LX2 - 40, UP + 40, 'END_STREAM = io.EOF', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, class: 'mono', opacity: eof });
      sub(480, 300, 'Recv 한 번에 메시지 하나, EOF는 클라가 보내기만 끝낸 반쯤 닫힘', fade(u, 2.1)); return; }
    upF(u, 0.2, 6); dnF(u, 0.5, 6); sub(480, 300, '요청을 다 받기 전에도 같은 스트림으로 Send 한다', fade(u, 1.5)); }

  // ---------- 5. ALPN · 실무 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const cx = 150, sx = 810;
      [[cx, '클라이언트'], [sx, '서버']].forEach(([x, s]) => { el('line', { x1: x, y1: 70, x2: x, y2: 380, stroke: INK, 'stroke-width': 3 }); tx(x, 54, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); });
      grow(cx, 140, sx, 170, E(u, 0.3, 1.0), ACC); spans(220, 132, [['ClientHello  ', { 'font-weight': 700 }], ['ALPN = [h2, http/1.1]', { fill: ACC }]], { 'font-size': 15, opacity: fade(u, 0.4) });
      grow(sx, 230, cx, 260, E(u, 1.2, 1.9), GOOD); spans(380, 222, [['ServerHello  ', { 'font-weight': 700 }], ['ALPN = h2', { fill: GOOD, 'font-weight': 800 }]], { 'font-size': 15, opacity: fade(u, 1.4) });
      card(480, 330, 400, 44, { rx: 10, stroke: ACC, fill: ACCBG, text: '이후 모든 바이트는 HTTP/2 프레임', fs: 15, s: pop(u, 2.1) }); lock(480, 92, true, INK, pop(u, 0.2)); return; }
    if (k === 1) { terminal(80, 50, 800, 150, ['$ openssl s_client -alpn h2 -connect localhost:8443', 'ALPN protocol: h2'], E(u, 0.3, 1.2) * 2, { title: '로컬 TLS 서버로 실측' });
      terminal(80, 220, 800, 150, ['$ openssl s_client -alpn http/1.1 -connect localhost:8444', 'ALPN protocol: http/1.1'], E(u, 1.3, 2.2) * 2, { title: 'h2를 못 고르면' });
      sub(480, 400, 'http/1.1이 나오면 gRPC는 붙지 않는다', fade(u, 2.3), { 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { const L = ['C→S SETTINGS      stream=0', 'S→C SETTINGS      stream=0 len=24', 'S→C WINDOW_UPDATE stream=0', 'C→S HEADERS       stream=1 len=62', 'C→S HEADERS       stream=3 len=28', 'C→S DATA          stream=1 len=10', 'S→C PING          stream=0', 'S→C HEADERS       stream=3 len=78', 'S→C DATA          stream=3 len=19'];
      terminal(80, 34, 800, 330, L, E(u, 0.2, 2.2) * L.length, { title: 'nghttp -nv 같은 프레임 로그 (중계 프로그램으로 실측)', lh: 30 });
      sub(480, 395, '프레임 타입과 스트림 ID가 그대로 보인다', fade(u, 2.3)); return; }
    if (k === 3) { [['TLS + ALPN → h2', 130, true, GOOD, '공개 트래픽'], ['평문 h2c', 280, false, WARN, '사내망 · 사이드카만']].forEach(([s, y, lk, col, note], i) => { const op = fade(u, 0.2 + i * 0.6);
        el('rect', { x: 200, y: y - 26, width: 560, height: 52, rx: 26, fill: i ? WARNBG : GOODBG, stroke: col, 'stroke-width': 2.5, opacity: op });
        lock(250, y + 4, lk, col, op); tx(290, y + 6, s, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: op }); tx(740, y + 6, note, { 'font-size': 15, 'text-anchor': 'end', opacity: op }); });
      mono(480, 380, '$ grpcurl -plaintext localhost:50051 list', { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 4) { const y = 190; el('rect', { x: 160, y: y - 26, width: 640, height: 52, rx: 26, fill: SOFT, stroke: INK, 'stroke-width': 2.5 }); person(90, y + 4, '', {}); server(870, y - 4, '', { s: 0.8 });
      for (let i = 0; i < 4; i++) { const at = 0.3 + i * 0.6; fly(200, y, 760, y, seg(u, at, at + 0.5), 'PING', { fill: INFO, mono: true }); }
      tx(480, 120, '쉬는 동안에도 PING으로 연결을 살려 둔다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(480, 290, 'keepalive.ClientParameters{Time: 30 * time.Second}', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      pill(480, 350, '재연결 handshake', BAD, pop(u, 1.8), { fs: 14 }); cross(560, 350, 11, pop(u, 2.0)); return; }
    if (k === 5) { [['L4 로드밸런서', 240, false], ['L7 (HTTP/2를 안다)', 720, true]].forEach(([s, cx, l7], i) => { const op = fade(u, 0.1 + i * 0.9);
        card(cx, 140, 200, 40, { rx: 8, stroke: l7 ? GOOD : BAD, fill: l7 ? GOODBG : BADBG, text: s, fs: 15, op });
        person(cx, 60, '', { s: 0.7, op });
        ['A', 'B', 'C'].forEach((b, j) => { const bx = cx - 130 + j * 130; card(bx, 320, 90, 44, { rx: 8, stroke: INK, text: '백엔드 ' + b, fs: 14, op });
          el('line', { x1: cx, y1: 160, x2: bx, y2: 298, stroke: GRID, 'stroke-width': 2, opacity: op }); });
        for (let n = 0; n < 6; n++) { const tgt = l7 ? n % 3 : 0, p = ((t * 0.6 + n / 6) % 1); if (u > 0.3 + i * 0.9) dot([[cx, 160], [cx - 130 + tgt * 130, 298]], p, l7 ? GOOD : BAD, 5); } });
      tx(240, 380, '연결 하나가 A에 붙어 스트림이 전부 A로', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(720, 380, '스트림(요청) 단위로 고르게 나눈다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.9) });
      el('line', { x1: 480, y1: 40, x2: 480, y2: 390, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' }); return; }
    tx(480, 70, 'HTTP/2가 gRPC를 떠받친다', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, opacity: fade(u, 0.2) });
    [['멀티플렉싱', '연결 1 · 스트림 N'], ['프레임', '9바이트 머리'], ['HPACK', '62B → 28B'], ['흐름 제어', 'WINDOW_UPDATE'], ['ALPN', 'h2 협상']].forEach(([a, b], i) => { const cx = 120 + i * 180, s = pop(u, 0.5 + i * 0.25);
      card(cx, 200, 160, 84, { rx: 12, stroke: ACC, sw: 2.2, s }); tx(cx, 194, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6 + i * 0.25) });
      tx(cx, 220, b, { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', opacity: fade(u, 0.7 + i * 0.25) }); });
    sub(480, 320, '연결은 소수로 오래 쓰고, RPC는 스트림으로 태운다', fade(u, 2.0), { 'font-size': 15.5, 'font-weight': 700, fill: INK }); }

  const quiz = [
    { q: 'HTTP/1.1에서 GET /a 응답이 느릴 때 같은 연결의 GET /b는 어떻게 되는가?',
      o: ['/a와 번갈아 조금씩 보내진다', '/a 응답이 끝날 때까지 기다린다', '자동으로 새 스트림을 열어 먼저 간다'], a: 1,
      why: 'HTTP/1.1 연결은 한 번에 한 요청만 흐르는 한 줄 파이프다. 앞이 끝나야 뒤가 가는 것이 Head-of-Line blocking이다.' },
    { q: '채널 하나로 RPC 1000건을 동시에 보내면 TCP 연결은 몇 개가 쓰이는가?',
      o: ['1개', '1000개', '도메인당 6개'], a: 0,
      why: 'RPC 1건이 HTTP/2 스트림 1개가 되어 한 연결 위에 쌓인다. 실측에서도 서버가 본 클라이언트 주소는 1개였다.' },
    { q: 'gRPC 호출의 성공·실패 상태 grpc-status는 어느 프레임에 실리는가?',
      o: ['요청 HEADERS', '응답 DATA의 앞 5바이트', '응답 끝의 트레일러 HEADERS'], a: 2,
      why: '응답은 HEADERS(:status=200), DATA, 트레일러 HEADERS 순서이고 grpc-status=0은 마지막 트레일러에 들어 있다.' },
    { q: '서버가 Recv에서 io.EOF를 받았다. 무슨 뜻인가?',
      o: ['TCP 연결이 끊겼다', '클라이언트가 보내기를 끝냈고 서버는 아직 Send 할 수 있다', '흐름 제어 창이 가득 찼다'], a: 1,
      why: 'io.EOF는 클라이언트 쪽 차선의 END_STREAM, 곧 반쯤 닫힘이다. 서버 쪽 차선은 아직 열려 있어 응답을 더 보낼 수 있다.' },
    { q: 'gRPC 앞에 L4 로드밸런서를 두었더니 백엔드 하나만 바쁘다. 까닭은 무엇인가?',
      o: ['L4는 연결 단위로만 나눠 한 연결의 스트림이 모두 한 백엔드로 간다', 'L4가 HTTP/2를 막아 HTTP/1.1로 떨어졌다', 'ALPN 협상이 실패했다'], a: 0,
      why: 'gRPC는 연결 하나를 오래 쓰므로 L4가 처음 고른 백엔드에 모든 스트림이 몰린다. 스트림 단위로 나누려면 HTTP/2를 아는 L7이 필요하다.' },
  ];

  const summary = [
    'HTTP/1.1은 한 연결에 한 요청씩이라 병렬을 위해 연결을 여러 개 연다.',
    'HTTP/2는 한 연결에 스트림을 여럿 두고, gRPC 호출 하나가 스트림 하나다.',
    '프레임은 9바이트 머리에 스트림 ID를 싣고, HPACK이 반복 헤더를 62바이트에서 28바이트로 줄였다.',
    '연결은 TLS ALPN으로 h2를 고르고, 소수로 오래 쓰며 분산은 L7에서 한다.',
  ];
  const review = [
    { q: '요청마다 grpc.NewClient를 새로 만드는 서비스의 지연이 높다. 먼저 고칠 것은?',
      o: ['서버 스레드를 늘린다', '앱 시작 때 만든 conn 하나를 재사용한다', '메시지를 JSON으로 바꾼다'], a: 1,
      why: '새 conn마다 TCP와 TLS handshake, SETTINGS 교환을 다시 한다. 한 conn 위에 스트림으로 태우면 그 비용이 처음 한 번으로 끝난다.' },
    { q: '대용량 파일을 bidi 스트림으로 올리는데 처리량이 링크 속도보다 한참 낮고 중간중간 멈춘다. 먼저 의심할 것은?',
      o: ['프레임 머리 9바이트가 너무 커서', '스트림 ID가 짝수라서', '흐름 제어 창이 작아 WINDOW_UPDATE를 기다린다'], a: 2,
      why: '창을 다 쓰면 WINDOW_UPDATE가 올 때까지 보내지 못한다. 대역폭 × RTT를 기준으로 초기 창을 키운다.' },
    { q: 'openssl s_client -alpn h2로 서버를 보니 "ALPN protocol: http/1.1"이 나왔다. 이 서버에 gRPC 호출을 하면?',
      o: ['HTTP/2를 못 골랐으니 gRPC가 붙지 않는다', 'gRPC가 알아서 HTTP/1.1로 바꿔 보낸다', 'h2c로 자동 전환되어 평문으로 붙는다'], a: 0,
      why: 'gRPC는 HTTP/2 프레임과 트레일러가 있어야 돈다. TLS 위에서는 ALPN으로 h2가 골라져야 한다.' },
  ];

  R.page({ title: '한 연결 위의 스트림과 프레임', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
