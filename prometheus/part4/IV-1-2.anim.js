/* IV-1-2 blackbox_exporter — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 대상 3개(example.com · api.myshop.io/health · checkout.myshop.io)와 성공/소요/인증서 값은 예전 패널의 예시 데이터,
 * 30일 가용성 99.93% 는 파이썬으로 계산(15초 간격 172800번 중 120번 실패, 예시). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, clock, terminal, spans, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, k0, a) => (c.k > k0 ? 1 : c.k === k0 ? pop(c.u, a ?? 0.2) : 0);
  const fa = (c, k0, a) => (c.k > k0 ? 1 : c.k === k0 ? fade(c.u, a ?? 0.2) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const bbox = (cx, cy, s, o) => { o = o || {}; card(cx, cy, 190, 64, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, s });
    tx(cx, cy - 4, 'blackbox_exporter', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono', opacity: s > 0.3 ? 1 : 0 });
    mono(cx, cy + 18, ':9115', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: s > 0.3 ? 1 : 0 }); };
  const TG = [['https://example.com', 1, 0.24, 62], ['https://api.myshop.io/health', 1, 0.41, 11], ['https://checkout.myshop.io', 0, 5.0, 3]];

  // ---------- 1. black-box ----------
  const P = { x: 100, y: 210 }, BB = { x: 420, y: 210 };
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      person(110, 200, '밖의 사용자', { s: pop(u, 0.2) });
      card(420, 200, 100, 60, { rx: 10, text: 'LB', fs: 17, fw: 800, s: pop(u, 0.4) });
      zone(590, 70, 340, 260, 'checkout 앱 (안)', { stroke: GRID, sw: 1.5, op: fade(u, 0.5) });
      grow(140, 200, 368, 200, E(u, 0.9, 1.4), MUT);
      el('line', { x1: 472, y1: 200, x2: 590, y2: 200, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.2) });
      cross(531, 200, 13, pop(u, 1.4));
      [['up = 1', 120], ['오류율 0', 160], ['/metrics 정상', 200]].forEach(([s, y], i) => { check(630, y, 9, pop(u, 0.7 + i * 0.15)); mono(652, y + 5, s, { 'font-size': 15, opacity: fade(u, 0.8 + i * 0.15) }); });
      note(610, 300, 'white-box: 안에서 보면 멀쩡하다', fade(u, 1.6), { fill: GOOD });
      note(40, 300, 'black-box: 밖에서 접속해 보면', fade(u, 1.9), { fill: BAD }); note(40, 326, '바로 드러난다', fade(u, 2.1), { fill: BAD }); return; }
    server(P.x, P.y, 'Prometheus', { lamp: ACC });
    bbox(BB.x, BB.y, at(c, 1));
    if (k === 1) { card(420, 330, 230, 40, { rx: 6, text: 'blackbox.yml', fs: 14, mono: true, stroke: WARN, fill: WARNBG, s: pop(u, 0.6) });
      grow(420, 310, 420, 246, E(u, 1.0, 1.5), WARN);
      mono(420, 70, 'prom/blackbox-exporter:v0.25.0', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      note(620, 200, '독립 프로세스 하나가', fade(u, 1.6)); note(620, 228, '대상 대신 찔러 준다', fade(u, 1.8)); return; }
    if (k === 2) {
      spans(130, 70, [['GET /probe?', { fill: INK, 'font-weight': 700 }], ['module=http_2xx', { fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) }], ['&', { fill: MUT, opacity: fade(u, 0.8) }], ['target=https://example.com', { fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) }]], { 'font-size': 17 });
      tx(240, 100, '찌르는 방법', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(560, 100, '찌를 대상', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.1) });
      card(800, 210, 220, 54, { rx: 10, text: 'example.com', fs: 15, mono: true, stroke: INFO, s: pop(u, 1.1) });
      dot([[P.x + 58, P.y], [BB.x - 96, BB.y]], seg(u, 1.3, 1.8), INFO, 7);
      dot([[BB.x + 96, BB.y], [690, 210]], seg(u, 1.8, 2.3), ACC, 7);
      dot([[690, 210], [BB.x + 96, BB.y], [BB.x - 96, BB.y], [P.x + 58, P.y]], seg(u, 2.3, 2.9), GOOD, 7); return; }
    if (k === 3) { const PR = [['http', 'https://example.com', 70], ['tcp', 'db:5432', 160], ['icmp', '10.0.0.1 (ping)', 250], ['dns', 'example.com A 레코드', 340]];
      PR.forEach(([p, d, y], i) => { const s = pop(u, 0.3 + i * 0.35), g = E(u, 0.3 + i * 0.35, 0.8 + i * 0.35);
        grow(BB.x + 96, BB.y, 610, y, g, i === 2 ? WARN : ACC);
        pill(660, y, p, i === 2 ? WARN : ACC, s, { mono: true, fs: 14 });
        mono(712, y + 5, d, { 'font-size': 14, opacity: s > 0.3 ? 1 : 0 }); });
      lock(930, 250, true, WARN, pop(u, 1.6)); tx(930, 290, 'CAP_NET_RAW', { 'font-size': 13.5, 'text-anchor': 'end', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.7), class: 'mono' });
      note(40, 360, '무엇으로 찌를지는 module 이 고른다', fade(u, 2.0)); return; }
    // k4: 결과는 메트릭으로 돌아온다
    card(800, 210, 220, 54, { rx: 10, text: 'example.com', fs: 15, mono: true, stroke: GOOD });
    dot([[BB.x + 96, BB.y], [690, 210]], seg(u, 0.1, 0.5), ACC, 7);
    el('rect', { x: 40, y: 290, width: 600, height: 110, rx: 10, fill: INK, opacity: fade(u, 0.5) });
    [['probe_success', '1', GOOD], ['probe_duration_seconds', '0.24', 'var(--term)'], ['probe_http_status_code', '200', 'var(--term)']].forEach(([n, v, col], i) => {
      const op = fade(u, 0.9 + i * 0.4); mono(60, 322 + i * 28, n, { 'font-size': 15, fill: 'var(--term)', opacity: op }); mono(420, 322 + i * 28, v, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); });
    fly(BB.x, BB.y + 34, P.x + 40, 290, seg(u, 0.5, 1.2), 'probe_*', { mono: true, fill: GOOD });
    note(670, 330, '성공 1 / 실패 0', fade(u, 2.0), { fill: GOOD }); note(670, 360, '값은 예시', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); }

  // ---------- 2. module 정의 ----------
  const MODS = [['http_2xx', 1, 'prober: http · timeout 5s'], ['http_health', 4, '본문 정규식 검사'], ['tcp_connect', 5, 'prober: tcp'], ['icmp_ping', 6, 'prober: icmp']];
  function s2(t, c) { const { k, u } = c;
    el('rect', { x: 20, y: 30, width: 320, height: 370, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    tx(36, 56, 'blackbox.yml', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    mono(36, 88, 'modules:', { 'font-size': 15, 'font-weight': 700, fill: INFO });
    MODS.forEach(([n, k0, d], i) => { if (k < k0 - (i === 0 ? 0 : 0)) return; const s = at(c, k0 === 1 ? 1 : k0), y = 120 + i * 62;
      card(180, y, 280, 50, { rx: 8, stroke: k === k0 ? ACC : GRID, sw: k === k0 ? 2.5 : 1.5, s });
      mono(52, y - 2, n, { 'font-size': 15, 'font-weight': 800, fill: k === k0 ? ACC : INK, opacity: s > 0.3 ? 1 : 0 });
      tx(52, y + 17, d, { 'font-size': 13.5, fill: MUT, opacity: s > 0.3 ? 1 : 0 }); });
    if (k === 0) { const g = fade(u, 0.8); mono(52, 140, 'targets: …', { 'font-size': 15, fill: BAD, opacity: g });
      if (E(u, 1.0, 1.4) > 0) el('line', { x1: 48, y1: 135, x2: 48 + 110 * E(u, 1.0, 1.4), y2: 135, stroke: BAD, 'stroke-width': 3 });
      card(520, 150, 300, 70, { rx: 10, text: 'module = 찌르는 방법\n여기 blackbox.yml 에 둔다', fs: 15, stroke: ACC, s: pop(u, 1.3) });
      card(760, 290, 300, 70, { rx: 10, text: 'target = 찌를 대상\nPrometheus 가 URL 로 넘긴다', fs: 15, stroke: INFO, s: pop(u, 1.8) }); return; }
    const RX = 640;
    if (k === 1) { clock(RX, 170, 46, E(u, 0.3, 2.6), WARN); mono(RX, 250, 'timeout 5s', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.5) });
      mono(RX, 290, Math.min(5, Math.floor(E(u, 0.3, 2.6) * 5 + 0.0001)) + 's 째', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT });
      note(470, 360, '5초 안에 답이 없으면 실패로 친다', fade(u, 2.0)); return; }
    if (k === 2) { // 리다이렉트를 따라가 2xx 판정
      card(430, 90, 150, 46, { rx: 8, text: 'GET /', fs: 15, mono: true, stroke: INFO });
      card(640, 90, 150, 46, { rx: 8, text: '301 → /home', fs: 14, mono: true, stroke: WARN, s: pop(u, 0.5) });
      card(850, 90, 150, 46, { rx: 8, text: '200 OK', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.0) });
      grow(505, 90, 563, 90, E(u, 0.3, 0.5), MUT); grow(715, 90, 773, 90, E(u, 0.8, 1.0), MUT);
      [['HTTP/1.1 · HTTP/2.0 만', 1.3], ['상태 코드 2xx (비우면 기본)', 1.6], ['method GET', 1.9], ['follow_redirects: true', 2.2]].forEach(([s, a], i) => {
        check(440, 180 + i * 50, 10, pop(u, a)); tx(462, 186 + i * 50, s, { 'font-size': 15, opacity: fade(u, a), class: i >= 2 ? 'mono' : null }); }); return; }
    if (k === 3) { // fail_if_not_ssl · preferred_ip_protocol
      tx(380, 70, 'fail_if_not_ssl', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC });
      card(480, 120, 200, 44, { rx: 8, text: 'http://…  (평문)', fs: 14, mono: true, stroke: GRID, s: pop(u, 0.3) });
      card(760, 120, 200, 44, { rx: 8, text: 'https://…', fs: 14, mono: true, stroke: GRID, s: pop(u, 0.5) });
      tx(480, 170, 'true 면 실패', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(760, 170, '통과', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(380, 230, 'preferred_ip_protocol (기본 ip6)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.1) });
      card(480, 290, 200, 50, { rx: 8, text: 'AAAA → IPv6', fs: 14, mono: true, stroke: BAD, s: pop(u, 1.3) }); cross(580, 268, 9, pop(u, 1.6));
      card(760, 290, 200, 50, { rx: 8, text: 'A → IPv4', fs: 14, mono: true, stroke: GOOD, s: pop(u, 1.8) }); check(860, 268, 9, pop(u, 2.0));
      note(380, 370, 'ip4 로 고정하면 IPv6 경로 문제로 헛도는 일이 없다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { // 본문 정규식
      mono(380, 70, '"status"\\s*:\\s*"ok"', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      [['200  {"status":"ok"}', GOOD, 1], ['200  {"status":"down"}', BAD, 0]].forEach(([s, col, ok], i) => { const y = 150 + i * 110, sc = pop(u, 0.5 + i * 0.6);
        card(600, y, 400, 60, { rx: 10, text: s, fs: 16, mono: true, stroke: col, s: sc });
        if (ok) check(830, y, 12, pop(u, 1.2)); else cross(830, y, 12, pop(u, 1.8)); });
      note(380, 370, '200 이어도 본문이 틀리면 probe_success 0', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 5) { // TCP 연결만
      card(450, 200, 140, 60, { rx: 10, text: 'blackbox', fs: 15, mono: true, stroke: ACC });
      card(830, 200, 150, 60, { rx: 10, text: 'db:5432', fs: 15, mono: true, stroke: INK });
      fly(520, 170, 755, 170, seg(u, 0.3, 1.0), 'SYN', { mono: true, fill: INFO }); fly(755, 230, 520, 230, seg(u, 1.0, 1.7), 'SYN-ACK', { mono: true, fill: GOOD });
      check(830, 280, 12, pop(u, 1.8)); note(470, 340, '포트가 열려 있으면 성공 — HTTP 는 없다', fade(u, 2.0)); return; }
    // k6: icmp
    card(450, 200, 140, 60, { rx: 10, text: 'blackbox', fs: 15, mono: true, stroke: ACC });
    card(830, 200, 150, 60, { rx: 10, text: '10.0.0.1', fs: 15, mono: true, stroke: INK });
    fly(520, 170, 755, 170, seg(u, 0.3, 1.0), 'echo request', { mono: true, fill: INFO }); fly(755, 230, 520, 230, seg(u, 1.0, 1.7), 'echo reply', { mono: true, fill: GOOD });
    check(830, 280, 12, pop(u, 1.8)); lock(450, 130, true, WARN, pop(u, 1.6)); mono(480, 136, 'CAP_NET_RAW', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
    note(400, 340, '컨테이너면 이 권한을 줘야 ping 을 보낼 수 있다', fade(u, 2.0)); }

  // ---------- 3. relabel 3단 ----------
  const ROWS = ['job', '__metrics_path__', '__param_module', '__address__', '__param_target', 'instance'];
  function s3(t, c) { const { k, u } = c;
    tx(30, 34, '대상 하나가 가진 라벨 (relabel 전 → 후)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const Y = (i) => 70 + i * 52, VX = 280;
    const fin = k === 5 ? E(u, 1.6, 2.2) : 0;
    ROWS.forEach((r, i) => { const meta = r.startsWith('__'), op = meta ? 1 - 0.75 * fin : 1;
      el('rect', { x: 24, y: Y(i) - 20, width: 540, height: 42, rx: 6, fill: i % 2 ? PANEL : SOFT, opacity: op });
      mono(36, Y(i) + 6, r, { 'font-size': 15, 'font-weight': 700, fill: meta ? MUT : INK, opacity: op }); });
    const val = (i, s, col, o) => mono(VX, Y(i) + 6, s, Object.assign({ 'font-size': 15, 'font-weight': 700, fill: col || INK }, o || {}));
    val(0, '"blackbox_http"');
    if (k === 0) { val(1, '/metrics', MUT, { opacity: 1 - fade(u, 0.6), 'text-decoration': 'line-through' }); val(1, '/probe', ACC, { opacity: fade(u, 0.9) });
      val(2, 'http_2xx', ACC, { opacity: fade(u, 1.4) }); note(600, 130, 'metrics_path: /probe', fade(u, 0.9), { class: 'mono' }); note(600, 170, 'params → __param_module', fade(u, 1.4), { class: 'mono' }); }
    else { val(1, '/probe', ACC); val(2, 'http_2xx', ACC); }
    if (k === 0) return;
    // __address__
    const addr4 = k >= 4, ov = k === 4 ? E(u, 0.4, 1.2) : addr4 ? 1 : 0;
    if (!addr4 || ov < 1) val(3, 'https://example.com', INK, { opacity: k === 1 ? fade(u, 0.3) : 1 - ov });
    if (addr4) val(3, 'blackbox:9115', ACC, { opacity: ov });
    if (k === 1) { tx(600, 70, 'targets 에 적은 것 = 찌를 URL', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      TG.forEach(([url], i) => { pill(760, 120 + i * 50, url, INFO, pop(u, 0.8 + i * 0.3), { mono: true, fs: 13.5 }); });
      note(600, 300, '대상마다 이런 표가 하나씩 생긴다', fade(u, 2.0), { fill: MUT }); return; }
    // 1단: __address__ → __param_target
    if (k === 2) fly(VX + 80, Y(3), VX + 80, Y(4), seg(u, 0.4, 1.3), 'https://example.com', { mono: true, fill: INFO });
    if (k >= 3 || (k === 2 && u > 1.3)) val(4, 'https://example.com', INFO);
    if (k === 3) fly(VX + 80, Y(4), VX + 80, Y(5), seg(u, 0.4, 1.3), 'https://example.com', { mono: true, fill: INFO });
    if (k >= 4 || (k === 3 && u > 1.3)) val(5, 'https://example.com', INFO);
    const stepTxt = [null, null, ['1단', '__address__ → __param_target', '?target= 로 실려 간다'], ['2단', '__param_target → instance', '그래프에서 어느 URL 인지 보인다'], ['3단', '__address__ ← blackbox:9115', '실제 접속할 곳은 exporter']][k];
    if (stepTxt) { banner(760, 110, stepTxt[0], pop(u, 0.2)); mono(600, 180, stepTxt[1], { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) }); note(600, 214, stepTxt[2], fade(u, 1.4), { fill: MUT }); }
    if (k === 4) { cross(VX + 120, Y(3), 10, pop(u, 0.3)); }
    if (k === 5) { // 완성된 요청 URL
      el('rect', { x: 590, y: 60, width: 356, height: 150, rx: 10, fill: INK, opacity: fade(u, 0.2) });
      [['http://blackbox:9115', ACC], ['  /probe', ACC], ['  ?module=http_2xx', 'var(--term)'], ['  &target=https://example.com', 'var(--term)']].forEach(([s, col], i) =>
        mono(606, 92 + i * 30, s, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.25) }));
      tx(600, 252, '__ 로 시작하는 라벨은 끝나면 사라진다', { 'font-size': 14.5, fill: MUT, 'font-weight': 600, opacity: fade(u, 1.6) });
      spans(600, 300, [['probe_success', { 'font-weight': 700 }], ['{instance=', { fill: INFO }]], { 'font-size': 14.5, opacity: fade(u, 2.0) });
      spans(600, 326, [['  "https://example.com",', { fill: INFO }]], { 'font-size': 14.5, opacity: fade(u, 2.1) });
      spans(600, 352, [['  job="blackbox_http"}', { fill: INFO }], [' 1', { fill: GOOD, 'font-weight': 800 }]], { 'font-size': 14.5, opacity: fade(u, 2.2) }); } }

  // ---------- 4. probe_success · SLO ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const T = [['groups:', 0], ['- name: blackbox', 1], ['rules:', 2], ['- alert: EndpointDown', 3]];
      T.forEach(([s, d], i) => { const x = 80 + d * 60, y = 90 + i * 70, sc = pop(u, 0.3 + i * 0.4);
        if (i) { const px = 80 + (d - 1) * 60 + 20; el('path', { d: `M${px},${y - 48} V${y} H${x - 10}`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: sc > 0.3 ? 1 : 0 }); }
        card(x + tw(s, 15) * 0.5 + 16, y, tw(s, 15) + 32, 42, { rx: 8, text: s, fs: 15, mono: true, stroke: i === 3 ? ACC : GRID, color: i === 3 ? ACC : INK, s: sc }); });
      note(560, 200, 'probe_success 를 그대로', fade(u, 1.9)); note(560, 230, '알람 식으로 쓴다', fade(u, 2.1)); return; }
    if (k === 1 || k === 2) { // for: 5m — pending → firing (평가 1분 간격 가정, 예시)
      const x0 = 80, w = 800, X = (m) => x0 + (m / 8) * w, yS = 120, yA = 230;
      tx(40, 50, 'probe_success  (checkout.myshop.io, 15초 간격)', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      const n = k === 1 ? Math.floor(E(u, 0.2, 2.2) * 33) : 33;
      for (let i = 0; i < n; i++) { const m = i * 0.25, ok = m < 0.5; el('circle', { cx: X(m), cy: ok ? yS - 26 : yS + 10, r: 4.5, fill: ok ? GOOD : BAD }); }
      mono(x0 - 12, yS - 21, '1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); mono(x0 - 12, yS + 15, '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      for (let m = 0; m <= 8; m++) mono(X(m), 290, m + 'm', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      const cur = k === 1 ? E(u, 0.2, 2.2) * 8 : 8;
      [[0, 1, '정상', GOOD], [1, 6, 'pending', WARN], [6, 8, 'firing', BAD]].forEach(([a, b, s, col]) => { const e = Math.min(b, cur); if (e <= a) return;
        el('rect', { x: X(a), y: yA - 22, width: X(e) - X(a) - 2, height: 44, rx: 6, fill: col, opacity: 0.85 });
        if (e - a > 0.6) tx((X(a) + X(e)) / 2, yA + 6, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL }); });
      tx(40, 340, '0 이 된 뒤 첫 평가에서 pending, 5분 내내 0 이면 firing (평가 1분 간격, 예시)', { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 2.2) : 1 });
      if (k === 2) { card(480, 384, 560, 52, { rx: 10, stroke: BAD, fill: BADBG, sw: 2, s: pop(u, 0.3) });
        spans(214, 380, [['EndpointDown ', { 'font-weight': 800, fill: BAD }], ['severity=page', { fill: INK }]], { 'font-size': 14.5, opacity: fade(u, 0.5) });
        tx(214, 400, '프로브 실패: https://checkout.myshop.io', { 'font-size': 14, opacity: fade(u, 1.0), class: 'mono' }); }
      return; }
    if (k === 3) { // 30일 가용성
      tx(40, 50, 'avg_over_time(probe_success[30d])', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
      for (let d = 0; d < 30; d++) { const s = clamp(E(u, 0.2, 1.4) * 30 - d); el('rect', { x: 40 + d * 29, y: 90, width: 25, height: 60, rx: 3, fill: d === 17 ? WARN : GOOD, opacity: 0.2 + 0.7 * s }); }
      el('rect', { x: 40 + 17 * 29, y: 90, width: 25, height: 60 * 0.02 + 2, fill: BAD, opacity: fade(u, 1.3) });
      tx(40 + 17 * 29 + 12, 172, '30분 실패', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
      const L = [['30일 × 86400 ÷ 15초 = 172800번', 1.5], ['실패 120번 (예시)', 1.8], ['(172800 − 120) ÷ 172800', 2.1]];
      L.forEach(([s, a], i) => mono(40, 230 + i * 34, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, a) }));
      mono(640, 300, '99.93%', { 'font-size': 40, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) });
      note(640, 340, '1 과 0 의 평균 = 성공 비율', fade(u, 2.4), { fill: MUT }); return; }
    if (k === 4) { // 전체 소요
      tx(40, 50, 'probe_duration_seconds (예시)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      TG.forEach(([url, ok, d], i) => { const y = 110 + i * 80; mono(40, y + 14, url, { 'font-size': 14.5, 'font-weight': 700, fill: ok ? INK : BAD });
        hbar(40, y + 26, 640, d, 5, { col: ok ? ACC : BAD, text: d.toFixed(2) + 's', u: E(u, 0.3 + i * 0.3, 1.2 + i * 0.3), h: 22 }); });
      note(40, 384, 'checkout 은 5초 timeout 에 걸렸다 — success 0', fade(u, 2.0), { fill: BAD }); return; }
    if (k === 5) { // phase 분해
      tx(40, 50, 'probe_http_duration_seconds{phase=…}  example.com (예시)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      const PH = [['resolve', 0.012, 'DNS'], ['connect', 0.031, 'TCP'], ['tls', 0.078, 'TLS'], ['processing', 0.104, '서버 처리'], ['transfer', 0.015, '본문 전송']];
      const W = 840 / 0.24; let x = 60;
      PH.forEach(([p, v, d], i) => { const g = E(u, 0.2 + i * 0.35, 0.6 + i * 0.35), w = v * W * g, col = [INFO, GOOD, WARN, ACC, OFF][i];
        if (w > 0) el('rect', { x, y: 120, width: Math.max(1, w - 2), height: 60, rx: 4, fill: col, opacity: 0.9 });
        const cxm = x + (v * W) / 2, low = i % 2;
        mono(cxm, low ? 230 : 210, p, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: g });
        mono(cxm, low ? 252 : 104, v.toFixed(3), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: g });
        x += v * W; });
      mono(900, 300, '합 0.24s', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 2.0) });
      note(40, 340, '느릴 때 DNS 인지 TLS 인지 서버인지 바로 좁힌다', fade(u, 2.2)); return; }
    // k6: 상태 코드
    card(250, 150, 300, 70, { rx: 10, text: 'HTTP/1.1 503', fs: 20, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.3) });
    mono(470, 120, 'probe_http_status_code 503', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.8) });
    mono(470, 150, '>= 500  → 서버 오류', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
    mono(470, 210, 'probe_success 0', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
    tx(470, 236, '→ 다운인 것만 안다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.7) });
    note(40, 330, '성공 코드를 넓게 잡은 모듈은 5xx 를 성공으로 넘길 수 있다', fade(u, 2.0));
    note(40, 360, '상태 코드를 따로 보면 원인까지 보인다', fade(u, 2.3), { fill: GOOD }); }

  // ---------- 5. 인증서 만료 · 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const x0 = 80, w = 800, X = (d) => x0 + (d / 70) * w, y = 200;
      el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: MUT, 'stroke-width': 2 });
      el('circle', { cx: X(0), cy: y, r: 9, fill: INFO }); mono(X(0), y + 34, 'time()', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
      const e = pop(u, 0.5); el('circle', { cx: X(62), cy: y, r: 9 * e, fill: WARN }); mono(X(62), y + 34, 'cert_expiry', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      const g = E(u, 1.0, 2.0); el('line', { x1: X(0), y1: y - 40, x2: X(lerp(0, 62, g)), y2: y - 40, stroke: ACC, 'stroke-width': 4 });
      mono(X(31), y - 54, Math.round(lerp(0, 5356800, g)) + ' 초', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(X(31), 330, 'example.com — 62일 남음 (예시)', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 2.1) });
      mono(40, 50, 'probe_ssl_earliest_cert_expiry − time()', { 'font-size': 17, 'font-weight': 800 }); return; }
    if (k <= 3) { // 남은 일수 막대 + 14일 문턱
      const x0 = 330, W = 560, X = (d) => x0 + (d / 70) * W;
      mono(40, 46, '< 14 * 24 * 3600   for: 1h', { 'font-size': 16, 'font-weight': 800, fill: k === 1 ? BAD : INK });
      TG.forEach(([url, , , d], i) => { const y = 100 + i * 80, hot = d < 14;
        mono(40, y + 6, url.replace('https://', ''), { 'font-size': 14.5, 'font-weight': 700, fill: hot ? BAD : INK });
        const g = k === 1 ? E(u, 0.2 + i * 0.25, 1.0 + i * 0.25) : 1;
        el('rect', { x: x0, y: y - 12, width: W, height: 24, rx: 4, fill: SOFT });
        el('rect', { x: x0, y: y - 12, width: (X(d) - x0) * g + 0.01, height: 24, rx: 4, fill: hot ? BAD : GOOD });
        mono(X(d) + 8, y + 6, d + '일', { 'font-size': 14.5, 'font-weight': 800, fill: hot ? BAD : GOOD, opacity: g });
        if (hot && k >= 2) { const s = k === 2 ? pop(u, 0.4 + i * 0.3) : 1; pill(X(50), y, 'warning', WARN, s, { fs: 13.5 }); } });
      el('line', { x1: X(14), y1: 70, x2: X(14), y2: 300, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      mono(X(14), 320, '14일', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      if (k === 1) note(40, 380, '두 곳이 14일 밑 — 1시간 이어지면 경보 (값은 예시)', fade(u, 2.0), { fill: BAD });
      if (k === 2) note(40, 380, '예고된 사고 — 호출(page)이 아니라 warning 으로 충분하다', fade(u, 1.4));
      if (k === 3) { const g = E(u, 0.3, 1.8);
        mono(40, 370, Math.round(lerp(950400, 11, g)) + (g < 1 ? ' …' : ''), { 'font-size': 18, 'font-weight': 800, fill: INFO });
        mono(40, 400, '(cert_expiry − time()) / 86400 = 11 일', { 'font-size': 15, fill: INK, opacity: fade(u, 1.9) }); }
      return; }
    if (k === 4) { // 프로브 위치
      el('rect', { x: 466, y: 40, width: 28, height: 330, rx: 4, fill: WARN, opacity: 0.85 }); tx(480, 396, '방화벽', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN });
      zone(20, 40, 430, 330, '사내망', { op: 1 }); zone(510, 40, 430, 330, '밖 (다른 리전 · 외부망)', { op: 1 });
      card(230, 210, 150, 56, { rx: 10, text: 'checkout 앱', fs: 15, stroke: INK });
      card(120, 110, 150, 46, { rx: 8, text: 'blackbox (안)', fs: 14, stroke: MUT, s: pop(u, 0.2) });
      grow(140, 134, 200, 182, E(u, 0.4, 0.9), GOOD); check(110, 160, 10, pop(u, 0.9)); mono(60, 300, 'success 1', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) });
      card(760, 110, 170, 46, { rx: 8, text: 'blackbox (밖)', fs: 14, stroke: ACC, s: pop(u, 1.2) });
      grow(680, 120, 310, 200, E(u, 1.4, 2.0), BAD); cross(560, 147, 12, pop(u, 2.0)); mono(620, 300, 'success 0', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) });
      note(620, 330, '사용자가 겪는 것은 이쪽', fade(u, 2.3), { fill: BAD, 'font-size': 14.5 }); return; }
    if (k === 5) { // timeout · relabel 누락
      tx(40, 50, '실제 기다리는 시간 = 둘 중 짧은 쪽', { 'font-size': 16, 'font-weight': 800 });
      [['module timeout', 15, WARN], ['scrape_timeout (기본)', 10, INFO]].forEach(([n, v, col], i) => { const y = 92 + i * 52;
        tx(40, y + 16, n, { 'font-size': 14.5, 'font-weight': 700 }); hbar(260, y, 420, v, 15, { col, text: v + 's' + (i ? '' : ' (예시)'), u: E(u, 0.3 + i * 0.3, 1.0 + i * 0.3), h: 22 }); });
      note(40, 222, '10초보다 느린 대상은 module timeout 을 늘려도 실패', fade(u, 1.3), { fill: BAD, 'font-size': 14.5 });
      el('line', { x1: 20, y1: 250, x2: 940, y2: 250, stroke: GRID, 'stroke-width': 1.5 });
      tx(40, 284, 'relabel 3단을 빼먹으면', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.5) });
      mono(40, 322, 'GET https://example.com/probe?module=http_2xx', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.8) });
      tx(40, 356, '3단이 없으면 exporter 가 아니라 대상 URL 을 직접 긁는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) });
      tx(40, 384, '1단이 없으면 target 파라미터가 비어 프로브가 실패한다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) }); return; }
    // k6: 권한 · IP
    card(250, 160, 380, 150, { rx: 12, stroke: WARN, s: pop(u, 0.2) }); lock(110, 130, true, WARN, pop(u, 0.4));
    tx(140, 138, 'icmp_ping', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.4) });
    tx(90, 186, 'CAP_NET_RAW 없으면', { 'font-size': 15, opacity: fade(u, 0.7), class: 'mono' }); tx(90, 212, '항상 success 0', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
    card(700, 160, 380, 150, { rx: 12, stroke: INFO, s: pop(u, 1.2) });
    tx(540, 138, 'preferred_ip_protocol', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 1.4) });
    tx(540, 186, '안 정하면 기본 ip6 부터', { 'font-size': 15, opacity: fade(u, 1.6) }); mono(540, 212, '"ip4" 로 고정', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
    note(60, 380, '둘 다 설정은 맞아 보이는데 조용히 실패하는 함정', fade(u, 2.2)); }

  const quiz = [
    { q: 'blackbox_exporter가 white-box exporter와 다른 점은 무엇인가?',
      o: ['대상 안에 들어가 내부 수치를 더 많이 읽는다', '대상 내부를 모른 채 밖에서 접속해 응답·지연을 잰다', 'Prometheus 없이 혼자 알람을 보낸다'], a: 1,
      why: '내부 /metrics가 멀쩡해도 LB가 깨지면 사용자는 접속하지 못한다. 밖에서 찔러 보는 프로브가 그것을 잡는다.' },
    { q: 'blackbox.yml에 들어가지 않는 것은 무엇인가?',
      o: ['찌를 대상(target) 주소', 'prober와 timeout', '성공으로 볼 상태 코드'], a: 0,
      why: 'blackbox.yml에는 찌르는 방법(module)만 둔다. 대상은 Prometheus가 ?target= 파라미터로 넘긴다.' },
    { q: 'relabel 3단의 마지막 단계가 하는 일은 무엇인가?',
      o: ['URL을 instance 라벨로 복사한다', 'URL을 __param_target으로 옮긴다', '__address__를 blackbox:9115로 덮어쓴다'], a: 2,
      why: '실제로 접속할 곳은 exporter다. 앞의 두 단계로 URL은 ?target= 과 instance에 남겨 두고 주소만 바꾼다.' },
    { q: '15초 간격으로 30일 동안 172800번 프로브했고 120번 실패했다. avg_over_time(probe_success[30d])는 얼마인가?',
      o: ['99.93%', '120', '0.07%'], a: 0,
      why: 'probe_success는 1과 0이라 평균이 곧 성공 비율이다. (172800 − 120) ÷ 172800 = 99.93%다.' },
    { q: 'module timeout을 15초로 늘렸는데 12초 걸리는 대상이 계속 실패한다. 무엇 때문인가?',
      o: ['preferred_ip_protocol이 ip4라서', '실제 한도가 scrape_timeout(기본 10초) 쪽으로 잘려서', '인증서가 14일 안에 만료돼서'], a: 1,
      why: '프로브가 기다리는 시간은 module timeout과 scrape_timeout 중 짧은 쪽이다. scrape_timeout도 함께 늘려야 한다.' },
  ];

  const summary = [
    '안쪽 지표가 멀쩡해도 밖에서 접속이 안 될 수 있다. blackbox_exporter가 밖에서 찔러 본다.',
    'blackbox.yml에는 찌르는 방법만 두고, 대상은 Prometheus가 ?target= 으로 넘긴다.',
    'relabel 3단이 URL을 __param_target과 instance로 옮기고 주소를 blackbox:9115로 바꾼다.',
    'probe_success 평균이 가용성이 되고, 인증서는 만료 14일 전에 warning으로 알린다.',
  ];
  const review = [
    { q: 'blackbox job을 추가했는데 모든 대상의 instance가 blackbox:9115로 똑같이 보인다. 빠진 것은?',
      o: ['1단 __address__ → __param_target', '2단 __param_target → instance 복사', 'params의 module 지정'], a: 1,
      why: '3단에서 __address__를 exporter로 바꾸므로, URL을 instance로 복사해 두지 않으면 모든 대상이 같은 주소로 보인다.' },
    { q: '인증서가 만료돼 전 서비스가 멈췄다. 같은 일을 막으려면 어떤 식을 경보로 걸어야 하나?',
      o: ['probe_duration_seconds > 5', 'avg_over_time(probe_success[30d]) < 0.999', 'probe_ssl_earliest_cert_expiry − time() < 14 * 24 * 3600'], a: 2,
      why: '만료 시각에서 현재 시각을 빼면 남은 초가 된다. 14일 밑으로 1시간 이어지면 warning을 올려 갱신할 시간을 번다.' },
    { q: '사내망에 둔 blackbox는 success 1 인데 고객은 접속이 안 된다고 한다. 먼저 바꿀 것은?',
      o: ['프로브를 방화벽 밖의 다른 리전·외부망에 둔다', 'for를 5m에서 1m로 줄인다', 'http_2xx 대신 tcp_connect를 쓴다'], a: 0,
      why: '방화벽 안에서 찌르면 내부 경로만 본다. 사용자와 같은 바깥에서 찔러야 진짜 black-box다.' },
  ];

  R.page({ title: 'blackbox 프로빙', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
