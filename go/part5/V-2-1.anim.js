/* V-2-1 운영 — 로깅/메트릭/헬스체크 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 세 기둥·로그 줄·지표·프로브 상태·종료 단계·함정은 STEPS 의 pillars·logs·metrics·health·shutdown·traps 를 읽는다.
 * slog JSON 모양(time·level·msg 다음 속성)과 DefBuckets(.005~10)는 Go·client_golang 문서 값이다.
 * 지표 값(1,284 · 7 · 0.21s), 히스토그램 분포, 진행 중 요청 3건, span 시간(320ms·300ms)은 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, server, dbIcon, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const LVC = { DEBUG: OFF, INFO: INFO, WARN: WARN, ERROR: BAD };
  const ex = (x, y, op) => pill(x, y, '예시', MUT, 1, { fs: 13.5, op: op ?? 1 });

  // ---------- 1. 왜 관측 가능성인가 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 1) {
      card(150, 130, 220, 120, { rx: 12, stroke: INK, sw: 2.2 }); mono(60, 92, 'handler', { 'font-size': 15, 'font-weight': 800 });
      card(150, 140, 160, 36, { rx: 8, text: 'findUser(r)', fs: 14.5, mono: true, stroke: WARN, color: WARN });
      if (k === 0) for (let j = 0; j < 3; j++) dot([[20, 140], [70, 140]], ((t * 0.6 + j / 3) % 1), INFO, 5);
      clock(150, 210, 14, (t * 0.5) % 1, WARN, '');
      zone(380, 40, 550, 230, k === 1 ? '컨테이너 (재시작됨)' : '컨테이너 stdout', { fill: SOFT, stroke: k === 1 ? BAD : GRID, color: k === 1 ? BAD : MUT });
      const n = k === 0 ? Math.floor(E(u, 0.2, 1.6) * 4.99) : 4, wipe = k === 1 ? E(u, 0.3, 1.0) : 0;
      for (let i = 0; i < n; i++) mono(400, 90 + i * 36, '요청 처리됨', { 'font-size': 15, fill: INK, opacity: 1 - wipe });
      if (k === 0) { ['누가?', '몇 ms?', '어느 경로?'].forEach((s, i) => pill(640 + i * 95, 128, s, MUT, pop(u, 1.6 + i * 0.2), { fs: 13.5 }));
        sub(760, 180, '남는 건 똑같은 문자열뿐이다', fade(u, 2.2), { 'font-size': 14 }); return; }
      if (u > 0.9) { el('path', { d: 'M640,130 a24,24 0 1 1 -8,-18', fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.9) }); }
      const gone = ['재시작하면 로그가 사라진다', '"user 42 요청만" 골라낼 수 없다', 'p99 · 초당 요청수를 모른다', 'LB가 이 인스턴스 상태를 모른다'];
      gone.forEach((s, i) => { const y = 312 + i * 26; cross(48, y - 5, 6, pop(u, 1.0 + i * 0.3)); tx(66, y, s, { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.0 + i * 0.3) }); }); return; }
    // k2: 세 기둥이 선다
    b.pillars.forEach((p, i) => { const cx = 190 + i * 290, h = 220 * E(u, 0.2 + i * 0.3, 1.0 + i * 0.3), top = 380 - h;
      el('rect', { x: cx - 130, y: 380, width: 260, height: 10, rx: 3, fill: INK });
      el('rect', { x: cx - 112, y: top, width: 224, height: h, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      el('rect', { x: cx - 126, y: top - 14, width: 252, height: 14, rx: 3, fill: ACC, opacity: h > 4 ? 1 : 0 });
      const op = fade(u, 1.0 + i * 0.3);
      lbl(cx, 196, p.name, op, { fill: ACC, 'font-size': 16 }); sub(cx, 230, p.q, op, { fill: INK });
      mono(cx, 280, p.tool, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: op }); }); }

  // ---------- 2. slog ----------
  function store(logs, u, fresh, o) { o = o || {}; zone(30, 286, 900, 124, '수집기 (Loki · ELK)', { fill: SOFT, color: MUT });
    (logs || []).forEach((l, i) => { const y = 326 + i * 28, op = i === fresh ? fade(u, o.at ?? 1.8) : 1, hit = o.hit && o.hit(l), dim = o.hit && !hit;
      if (hit) el('rect', { x: 40, y: y - 18, width: 880, height: 26, rx: 5, fill: WARNBG, opacity: op });
      mono(50, y, l.level, { 'font-size': 14, 'font-weight': 800, fill: LVC[l.level], opacity: op * (dim ? 0.4 : 1) });
      mono(120, y, l.msg, { 'font-size': 14, 'font-weight': 700, opacity: op * (dim ? 0.4 : 1) });
      mono(300, y, l.fields, { 'font-size': 14, fill: MUT, opacity: op * (dim ? 0.4 : 1) });
      if (l.level === 'ERROR') { ex(880, y - 5, op); } }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { const gx = 420;
      el('rect', { x: gx - 8, y: 40, width: 16, height: 330, rx: 4, fill: INK }); mono(gx, 30, 'Level: INFO', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle' });
      ['DEBUG', 'INFO', 'WARN', 'ERROR'].forEach((lv, i) => { const y = 80 + i * 80, go = seg(u, 0.3 + i * 0.3, 1.2 + i * 0.3), blocked = i === 0;
        const x = blocked ? lerp(120, gx - 70, Math.min(go * 2, 1)) - (go > 0.5 ? (go - 0.5) * 60 : 0) : lerp(120, 700, go);
        card(x, y, 110, 36, { rx: 18, text: lv, fs: 14, mono: true, fw: 800, stroke: LVC[lv], color: LVC[lv], op: blocked && go > 0.5 ? 1 - (go - 0.5) : go > 0 ? 1 : 0.35 }); });
      tx(200, 130, '걸러짐', { 'font-size': 14, fill: OFF, 'font-weight': 700, opacity: fade(u, 1.3) });
      sub(820, 380, 'os.Stdout으로 JSON이 나간다', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 1) { [['slog.Logger', 140, INK], ['JSONHandler', 470, INFO], ['os.Stdout', 790, MUT]].forEach(([s, x, col], i) => {
        card(x, 120, 200, 56, { rx: 10, text: s, fs: 15, mono: true, fw: 800, stroke: col, color: col, s: pop(u, 0.2 + i * 0.4) });
        if (i) grow(x - 230, 120, x - 102, 120, seg(u, 0.4 + i * 0.4, 0.8 + i * 0.4), MUT); });
      pill(140, 200, 'log := setupLogger()', ACC, pop(u, 1.5), { mono: true, fs: 14, fill: PANEL });
      sub(470, 250, 'main에서 한 번 만들어 내려보낸다', fade(u, 1.8), { 'font-size': 14 });
      store([], u, -1); mono(480, 360, '아직 남긴 로그 없음', { 'font-size': 14, fill: OFF, 'text-anchor': 'middle' }); return; }
    if (k === 2) { const kv = [['"method"', '"GET"'], ['"path"', '"/users"'], ['"status"', '200'], ['"dur_ms"', '12']];
      mono(40, 50, 'log.Info("request handled", …)', { 'font-size': 15, 'font-weight': 700 });
      kv.forEach(([a, v], i) => { const y = 96 + i * 40, f = seg(u, 0.4 + i * 0.25, 1.2 + i * 0.25);
        if (f < 1) card(lerp(140, 290, E(f, 0, 1)), lerp(y, 195, E(f, 0, 1)), 190, 32, { rx: 16, text: a + ': ' + v, fs: 13.5, mono: true, fw: 700, stroke: INFO, color: INFO }); });
      const js = '{"time":"…","level":"INFO","msg":"request handled",', js2 = ' "method":"GET","path":"/users","status":200,"dur_ms":12}';
      el('rect', { x: 400, y: 150, width: 530, height: 90, rx: 8, fill: INK, opacity: fade(u, 0.3) });
      mono(412, 184, js.slice(0, Math.round(js.length * E(u, 0.3, 1.2))), { 'font-size': 13.5, fill: PANEL });
      mono(412, 212, js2.slice(0, Math.round(js2.length * E(u, 1.2, 2.2))), { 'font-size': 13.5, fill: 'var(--term)' });
      store(b.logs, u, 0, { at: 2.2 }); return; }
    if (k === 3) { card(150, 90, 220, 50, { rx: 10, text: 'log', fs: 15, mono: true, fw: 800 });
      grow(150, 116, 150, 178, seg(u, 0.2, 0.6), ACC); mono(160, 150, '.With("req_id", "a1b2")', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.4) });
      card(150, 205, 220, 50, { rx: 10, text: 'reqLog', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      pill(150, 252, 'req_id=a1b2', WARN, pop(u, 0.9), { mono: true, fs: 13.5, fill: PANEL });
      card(640, 110, 420, 50, { rx: 25, fill: PANEL, stroke: INK, sw: 2, s: pop(u, 1.4) }); mono(450, 116, '검색: req_id = "a1b2"', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(640, 180, 'With로 만든 로거가 남긴 줄에만 붙는다', fade(u, 2.0), { 'font-size': 14 });
      store(b.logs, u, 1, { at: 1.1, hit: u > 1.6 ? (l) => /req_id=a1b2/.test(l.fields) : null }); return; }
    // k4: 민감정보
    card(300, 110, 520, 120, { rx: 12, stroke: BAD, sw: 2.4, fill: BADBG, s: pop(u, 0.2) });
    mono(60, 96, '{"level":"ERROR","msg":"db timeout",', { 'font-size': 14.5, opacity: fade(u, 0.4) });
    mono(60, 124, ' "user_id":42,"password":"…"}', { 'font-size': 14.5, opacity: fade(u, 0.6) });
    el('line', { x1: 165, y1: 119, x2: 330, y2: 119, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.2) });
    ex(500, 160, fade(u, 0.4));
    dbIcon(760, 140, '영구 저장', { stroke: BAD, s: pop(u, 1.0) });
    dot([[560, 120], [700, 130]], seg(u, 1.0, 1.6), BAD, 6);
    store(b.logs, u, 2, { at: 1.6 });
    ['password', 'token', '카드번호', '주민번호'].forEach((s, i) => pill(110 + i * 120, 262, s, BAD, pop(u, 1.8 + i * 0.15), { fs: 13.5, fill: PANEL })); }

  // ---------- 3. 메트릭 ----------
  const BUCKETS = ['.005', '.01', '.025', '.05', '.1', '.25', '.5', '1', '2.5', '5', '10', '+Inf'];
  const HIST = [1, 3, 6, 9, 11, 8, 4, 2, 1, 0, 0, 0];   // 예시 분포 (그림용)
  function counterBox(x, y, v, s) { card(x, y, 260, 74, { rx: 10, stroke: INFO, sw: 2.2, s }); if ((s ?? 1) < 0.5) return;
    mono(x - 118, y - 14, 'http_requests_total', { 'font-size': 14, 'font-weight': 800, fill: INFO }); tx(x + 118, y - 14, 'Counter', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    mono(x - 118, y + 20, String(v), { 'font-size': 22, 'font-weight': 800 }); tx(x + 118, y + 20, '↑ 늘기만', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
  function histBox(x, y, u0, s) { card(x + 200, y + 70, 420, 170, { rx: 10, stroke: ACC, sw: 2.2, s }); if ((s ?? 1) < 0.5) return;
    mono(x + 6, y + 6, 'request_duration_seconds', { 'font-size': 14, 'font-weight': 800, fill: ACC }); tx(x + 400, y + 6, 'Histogram', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    BUCKETS.forEach((bk, i) => { const bx = x + 8 + i * 33, h = HIST[i] * 9 * u0;
      el('rect', { x: bx, y: y + 126 - h, width: 26, height: h, rx: 3, fill: ACC, opacity: 0.8 });
      if (i % 2 === 0) mono(bx + 13, y + 146, bk, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }); }
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { counterBox(250, 120, Math.floor(E(u, 0.3, 2.4) * 6), pop(u, 0.2));
      ['method', 'route', 'status'].forEach((s, i) => pill(170 + i * 90, 200, s, INFO, pop(u, 1.0 + i * 0.2), { mono: true, fs: 13.5, fill: PANEL }));
      for (let j = 0; j < 6; j++) { const f = seg(u, 0.3 + j * 0.35, 0.65 + j * 0.35); dot([[600, 120], [385, 120]], f, INFO, 6); }
      note(560, 60, '요청이 올 때마다 +1', fade(u, 0.6), { 'font-size': 14 });
      sub(250, 250, '라벨은 값이 몇 개 안 되는 것만', fade(u, 1.8), { 'font-size': 14 });
      note(520, 300, '초당 증가율(rate)은 Prometheus가 계산한다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k === 1) { counterBox(250, 90, '', 1); histBox(480, 40, E(u, 0.4, 2.0), pop(u, 0.2));
      for (let j = 0; j < 5; j++) dot([[700, 20], [600 + j * 40, 140]], ((t * 0.7 + j / 5) % 1), ACC, 4);
      tx(482, 250, 'le (초) 버킷 = prometheus.DefBuckets', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      ex(870, 250, fade(u, 1.0));
      note(40, 300, '평균 하나가 아니라 분포를 남긴다', fade(u, 1.6), { 'font-size': 14.5 });
      note(40, 334, '버킷을 모아 p50 · p99를 계산한다', fade(u, 2.0), { 'font-size': 14.5, fill: ACC }); return; }
    if (k === 2) { zone(360, 220, 560, 170, 'prometheus.MustRegister → 기본 레지스트리', { fill: SOFT, stroke: GRID });
      const f1 = seg(u, 0.4, 1.2), f2 = seg(u, 0.8, 1.6);
      card(lerp(160, 510, E(f1, 0, 1)), lerp(80, 300, E(f1, 0, 1)), 260, 50, { rx: 10, text: 'http_requests_total', fs: 14, mono: true, fw: 800, stroke: INFO, color: INFO });
      card(lerp(160, 780, E(f2, 0, 1)), lerp(160, 300, E(f2, 0, 1)), 260, 50, { rx: 10, text: 'request_duration_seconds', fs: 13.5, mono: true, fw: 800, stroke: ACC, color: ACC });
      note(40, 300, '등록해야', fade(u, 1.8), { 'font-size': 14.5 }); note(40, 330, '/metrics에 나온다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 3) { server(110, 150, 'Prometheus', { lamp: ACC });
      card(330, 150, 150, 50, { rx: 10, text: 'GET /metrics', fs: 14, mono: true, fw: 800, stroke: ACC, color: ACC });
      for (let j = 0; j < 2; j++) dot([[175, 150], [252, 150]], ((t * 0.5 + j / 2) % 1), ACC, 5);
      sub(210, 210, '주기적으로 긁어 간다', fade(u, 0.4));
      const lines = ['http_requests_total{method="GET",route="/users",status="200"} 1284', 'in_flight_requests 7', 'request_duration_seconds_bucket{route="/users",le="0.25"} …'];
      el('rect', { x: 420, y: 40, width: 510, height: 86, rx: 8, fill: INK, opacity: fade(u, 0.5) });
      lines.forEach((s, i) => mono(430, 62 + i * 24, s, { 'font-size': 13.5, fill: i ? 'var(--term)' : PANEL, opacity: fade(u, 0.6 + i * 0.3) }));
      ex(880, 145, fade(u, 0.8));
      R.meters(420, 180, 510, b.metrics.map((m) => ({ name: m.type, val: m.val })), { h: 70 });
      sub(670, 278, b.metrics.map((m) => m.name.replace('request_duration_seconds ', '')).join(' · '), fade(u, 1.2));
      note(40, 330, 'RED는 서비스용, USE는 리소스용 지표 틀이다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // k4: 카디널리티
    tx(40, 50, 'method × route × status', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    for (let i = 0; i < 18; i++) el('rect', { x: 40 + (i % 6) * 26, y: 70 + Math.floor(i / 6) * 26, width: 22, height: 22, rx: 3, fill: GOOD, opacity: fade(u, 0.2 + i * 0.02) });
    sub(118, 170, '조합마다 시계열 1개', fade(u, 0.6));
    tx(330, 50, '… × user_id × 전체 URL', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
    const n = Math.floor(E(u, 1.1, 2.5) * 360);
    for (let i = 0; i < n; i++) el('rect', { x: 330 + (i % 30) * 20, y: 64 + Math.floor(i / 30) * 20, width: 17, height: 17, rx: 2, fill: BAD, opacity: 0.75 });
    note(40, 330, 'user_id처럼 끝이 없는 값을 라벨로 쓰면', fade(u, 1.6), { 'font-size': 14.5 });
    note(40, 360, '시계열이 값의 개수만큼 곱해져 터진다', fade(u, 1.9), { 'font-size': 14.5, fill: BAD }); }

  // ---------- 4. liveness vs readiness ----------
  function s4(t, c) { const { k, u } = c, b = c.beat, H = Object.fromEntries(b.health.map((h) => [h.path, h]));
    const rz = H['/readyz'], dbDown = rz && rz.status === 'down';
    server(100, 230, 'kubelet', {});
    card(170 + 300, 50, 230, 50, { rx: 25, text: 'Service · LB', fs: 15, fw: 800, stroke: INFO, color: INFO });
    zone(300, 130, 340, 250, 'pod', { fill: PANEL, stroke: INK, color: INK });
    const traffic = !dbDown;
    if (k >= 1) { if (traffic) { for (let j = 0; j < 3; j++) dot([[470, 75], [470, 140]], ((t * 0.7 + j / 3) % 1), INFO, 5); el('line', { x1: 470, y1: 75, x2: 470, y2: 130, stroke: INFO, 'stroke-width': 2.5 }); }
      else { el('line', { x1: 470, y1: 75, x2: 470, y2: 130, stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '5 5' }); cross(470, 104, 10, pop(u, 0.9)); } }
    [['/healthz', 190], ['/readyz', 290]].forEach(([pth, y]) => { const h = H[pth]; if (!h) { if (pth === '/readyz') { el('rect', { x: 320, y: y - 24, width: 300, height: 48, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5' }); } return; }
      const col = h.status === 'ok' ? GOOD : BAD, fresh = (k === 0 && pth === '/healthz') || (k === 1 && pth === '/readyz');
      card(470, y, 300, 48, { rx: 8, fill: h.status === 'ok' ? GOODBG : BADBG, stroke: col, sw: 2, s: fresh ? pop(u, 0.2) : 1 });
      mono(336, y + 5, pth, { 'font-size': 15, 'font-weight': 800 }); tx(430, y + 5, h.label, { 'font-size': 13.5, fill: MUT });
      mono(604, y + 5, h.status === 'ok' ? '200' : '503', { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'end' }); });
    // 프로브
    const pr = (y, a, col) => dot([[150, 230], [320, y]], ((t * 0.6 + a) % 1), col, 6);
    pr(190, 0, GOOD); if (rz) pr(290, 0.5, INFO);
    dbIcon(820, 290, 'DB', { stroke: dbDown ? BAD : INK, s: k === 0 ? 1 : 1, op: k === 0 ? 0.35 : 1 });
    if (k === 0) { sub(820, 380, '건드리지 않는다', fade(u, 1.2), { 'font-weight': 700 }); note(40, 410, '죽었으면 재시작, 그래서 가벼워야 한다', fade(u, 1.8), { 'font-size': 14 }); return; }
    const pingCol = dbDown ? BAD : GOOD;
    grow(620, 290, 770, 290, k === 1 ? seg(u, 0.6, 1.0) : 1, pingCol);
    mono(695, 278, 'PingContext', { 'font-size': 13.5, 'text-anchor': 'middle', fill: pingCol, 'font-weight': 700 });
    if (k === 1) { clock(695, 330, 16, E(u, 1.0, 2.6), WARN, ''); mono(722, 336, '1s', { 'font-size': 14, 'font-weight': 800, fill: WARN }); return; }
    if (k === 2) { cross(820, 290, 14, pop(u, 0.3)); note(40, 410, '트래픽에서만 빠진다. /healthz는 200이라 재시작은 없다', fade(u, 1.4), { 'font-size': 14 }); return; }
    note(40, 410, 'DB가 돌아오면 200, LB가 다시 보낸다', fade(u, 1.0), { 'font-size': 14, fill: GOOD }); }

  // ---------- 5. Graceful shutdown ----------
  function s5(t, c) { const { k, u } = c, b = c.beat;
    // 오른쪽: 단계 목록
    zone(640, 40, 290, 230, '종료 순서', { fill: SOFT });
    b.shutdown.forEach((ph, i) => { const y = 86 + i * 48, done = ph.done, was = c.prev && c.prev.shutdown[i].done, sc = done && !was ? pop(u, 0.4 + i * 0.3) : done ? 1 : 0;
      el('circle', { cx: 668, cy: y, r: 10, fill: done ? GOOD : PANEL, stroke: done ? GOOD : GRID, 'stroke-width': 2 }); if (sc) check(668, y, 6, sc);
      tx(688, y + 5, ph.phase.replace(' (새 요청 차단)', '').replace('진행 중 요청 3건 완료 대기', '진행 중 요청 완료 대기'), { 'font-size': 13.5, fill: done ? INK : MUT, 'font-weight': done ? 700 : 500 }); });
    // 왼쪽: goroutine 두 줄
    mono(30, 85, 'main', { 'font-size': 14.5, 'font-weight': 800 }); mono(30, 165, 'srv', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
    el('line', { x1: 90, y1: 80, x2: 600, y2: 80, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': k === 1 && u < 1.4 ? '6 6' : null });
    const split = k === 0 ? E(u, 0.3, 1.0) : 1;
    el('path', { d: `M130,80 Q150,160 ${lerp(170, 600, split)},160`, fill: 'none', stroke: ACC, 'stroke-width': 3 });
    if (k === 0) { mono(150, 128, 'go srv.ListenAndServe()', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
      for (let j = 0; j < 3; j++) dot([[600, 230], [400, 165]], u > 1.0 ? ((t * 0.6 + j / 3) % 1) : 0, INFO, 5);
      sub(320, 250, 'main은 신호를 기다릴 수 있다', fade(u, 1.8), { 'font-size': 14 }); return; }
    // 채널
    const ch = [300, 40]; el('rect', { x: ch[0] - 22, y: ch[1] - 14, width: 44, height: 28, rx: 5, fill: PANEL, stroke: WARN, 'stroke-width': 2 }); mono(ch[0] + 32, ch[1] + 5, 'stop (버퍼 1)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
    if (k === 1) { const f = seg(u, 0.3, 1.1); if (f > 0 && f < 1) fly(80, 20, ch[0], ch[1], f, 'SIGTERM', { fill: WARN }); if (f >= 1) card(ch[0], ch[1], 40, 24, { rx: 4, fill: WARN, stroke: 'none' });
      mono(320, 104, '<-stop', { 'font-size': 14, 'font-weight': 800, fill: u > 1.4 ? GOOD : WARN });
      sub(330, 250, u > 1.4 ? '신호가 오면 깨어난다' : '여기서 막혀 기다린다', 1, { 'font-size': 14, 'font-weight': 700 }); return; }
    // k2·k3: 25초 시한 + 진행 중 요청
    const dl = k === 2 ? E(u, 0.2, 2.6) * 0.3 : 0.3 + E(u, 0.2, 1.6) * 0.15;
    tx(30, 222, 'ctx 25s', { 'font-size': 14, 'font-weight': 800, fill: WARN }); el('rect', { x: 100, y: 208, width: 500, height: 16, rx: 4, fill: SOFT, stroke: GRID }); el('rect', { x: 100, y: 208, width: 500 * dl, height: 16, rx: 4, fill: WARN, opacity: 0.8 });
    tx(30, 270, '진행 중', { 'font-size': 14, 'font-weight': 700 }); ex(126, 265);
    [0.55, 0.75, 0.9].forEach((need, i) => { const y = 300 + i * 34, prog = k === 2 ? lerp(0.15 + i * 0.1, need - 0.1, E(u, 0.2, 2.6)) : Math.min(1, lerp(need - 0.1, 1.1, E(u, 0.2 + i * 0.3, 1.0 + i * 0.4)));
      el('rect', { x: 100, y: y - 10, width: 500, height: 20, rx: 4, fill: SOFT }); el('rect', { x: 100, y: y - 10, width: 500 * Math.min(1, prog), height: 20, rx: 4, fill: prog >= 1 ? GOOD : INFO });
      mono(90, y + 5, '요청 ' + (i + 1), { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); if (prog >= 1) check(620, y, 7, 1); });
    if (k === 2) { for (let j = 0; j < 2; j++) { const f = (t * 0.6 + j / 2) % 1; dot([[720, 340], [640, 300], [720, 290]], f, BAD, 5); }
      sub(780, 370, '새 연결은 받지 않는다', fade(u, 0.8), { fill: BAD, 'font-weight': 700 }); return; }
    pill(780, 330, '유실 0건 · 종료', GOOD, pop(u, 1.8), { fs: 15, fill: PANEL }); }

  // ---------- 6. 분산 추적 ----------
  function s6(t, c) { const { k, u } = c, b = c.beat;
    if (k === 3) { // 세 기둥 + trace_id + 함정
      b.pillars.forEach((p, i) => { const x = 170 + i * 310; card(x, 70, 250, 56, { rx: 10, text: p.name + '\n' + p.tool, fs: 14, stroke: ACC, color: INK, s: pop(u, 0.2 + i * 0.2) }); });
      el('line', { x1: 170, y1: 112, x2: 790, y2: 112, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 0.9) });
      mono(480, 136, 'trace_id로 엮는다', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.0) });
      (b.traps || []).forEach((s, i) => { const [h, d] = s.split(' — '), x = 40 + (i % 2) * 450, y = 190 + Math.floor(i / 2) * 104, sc = pop(u, 1.2 + i * 0.25);
        card(x + 210, y + 34, 420, 88, { rx: 10, stroke: BAD, sw: 1.8, s: sc }); cross(x + 26, y + 12, 7, sc);
        tx(x + 44, y + 18, h, { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3 + i * 0.25) });
        tx(x + 16, y + 48, d.length > 30 ? d.slice(0, d.lastIndexOf(' ', 30)) : d, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3 + i * 0.25) });
        if (d.length > 30) tx(x + 16, y + 68, d.slice(d.lastIndexOf(' ', 30) + 1), { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3 + i * 0.25) }); });
      return; }
    // 폭포수: 0~320ms 축
    const X = (ms) => 200 + ms * 2.0;
    pill(480, 40, k === 2 ? 'trace_id=7f3a' : 'trace_id 생성', ACC, k === 0 ? pop(u, 0.3) : 1, { mono: true, fs: 14, fill: PANEL });
    if (k === 2) ex(600, 40);
    mono(40, 114, 'handleOrder', { 'font-size': 14.5, 'font-weight': 800 }); tx(40, 134, 'order-service', { 'font-size': 13.5, fill: MUT });
    const w1 = k === 0 ? E(u, 0.5, 2.6) * 120 : k === 1 ? 120 + E(u, 0.2, 2.6) * 120 : 320;
    el('rect', { x: X(0), y: 104, width: w1 * 2.0, height: 28, rx: 5, fill: INFO, opacity: 0.85 });
    if (k === 0) { mono(X(0) + 8, 160, 'defer span.End()', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) }); sub(480, 260, 'End가 불려야 구간이 닫혀 Jaeger에 나타난다', fade(u, 2.0), { 'font-size': 14 }); return; }
    mono(40, 194, 'charge', { 'font-size': 14.5, 'font-weight': 800 }); tx(40, 214, 'payment-service', { 'font-size': 13.5, fill: MUT });
    grow(X(10), 134, X(10), 182, k === 1 ? seg(u, 0.2, 0.6) : 1, ACC); mono(X(10) + 8, 162, 'ctx', { 'font-size': 13.5, fill: ACC, 'font-weight': 800 });
    const w2 = k === 1 ? E(u, 0.5, 2.6) * 220 : 300;
    el('rect', { x: X(15), y: 184, width: w2 * 2.0, height: 28, rx: 5, fill: k === 2 ? BAD : ACC, opacity: 0.85 });
    if (k === 1) { tx(40, 290, 'context.Background()를 넘기면', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
      el('rect', { x: X(15), y: 300, width: 200, height: 24, rx: 5, fill: 'none', stroke: BAD, 'stroke-dasharray': '5 4', opacity: fade(u, 1.6) }); mono(X(15) + 210, 318, '다른 trace · 끊김', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.7) }); return; }
    [0, 100, 200, 320].forEach((ms) => { el('line', { x1: X(ms), y1: 232, x2: X(ms), y2: 240, stroke: MUT }); mono(X(ms), 258, ms + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    mono(X(320) + 10, 124, '320ms', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.5) });
    mono(X(315) + 10, 204, '300ms', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
    note(40, 320, '전체 320ms 중 300ms가 payment 쪽이다', fade(u, 1.4), { 'font-size': 15 });
    note(40, 352, '어느 서비스가 느린지 추측할 필요가 없다', fade(u, 1.9), { 'font-size': 14.5, fill: MUT }); }

  const quiz = [
    { q: 'fmt.Println("요청 처리됨")만 남긴 서버에서 장애가 나면 답할 수 없는 질문은 무엇인가?',
      o: ['프로그램이 컴파일됐는가', '어느 요청이 얼마나 걸렸고 누가 보냈는가', 'Go 버전이 무엇인가'], a: 1,
      why: '문자열 한 줄에는 요청자·경로·소요 시간이 없다. 컨테이너가 재시작하면 그 줄마저 사라진다.' },
    { q: 'log.With("req_id", "a1b2")로 만든 reqLog를 쓰면 무엇이 달라지나?',
      o: ['reqLog로 남긴 모든 줄에 req_id가 자동으로 붙는다', '모든 로거의 레벨이 WARN으로 바뀐다', '로그가 파일로 저장된다'], a: 0,
      why: 'With는 속성을 품은 자식 로거를 만든다. 그 로거로 남긴 WARN 줄에는 req_id=a1b2가 붙고, 부모 log로 남긴 INFO 줄에는 붙지 않는다.' },
    { q: 'http_requests_total의 라벨로 넣으면 안 되는 것은 무엇인가?',
      o: ['method', 'status', 'user_id'], a: 2,
      why: '라벨 값 조합마다 시계열이 하나씩 생긴다. user_id처럼 끝없는 값을 넣으면 시계열이 그 수만큼 곱해져 터진다.' },
    { q: 'DB가 잠깐 죽었을 때 /readyz가 503을 돌려주면 생기는 일은 무엇인가?',
      o: ['LB가 이 파드를 트래픽에서 잠시 뺀다', 'kubelet이 컨테이너를 재시작한다', '/healthz도 함께 503이 된다'], a: 0,
      why: 'readiness 실패는 잠깐 빼 달라는 뜻이다. /healthz는 DB를 보지 않아 200이므로 재시작은 일어나지 않는다.' },
    { q: 'srv.Shutdown(ctx)가 하는 일은 무엇인가?',
      o: ['진행 중 요청을 즉시 끊고 종료한다', 'SIGTERM을 무시하고 계속 서빙한다', '새 연결을 막고 진행 중 요청이 끝날 때까지 기다린다'], a: 2,
      why: 'Shutdown은 리스너를 닫고 활성 연결이 끝나기를 기다린다. 25초 ctx를 줘서 느린 요청 하나가 종료를 영원히 붙잡지 못하게 한다.' },
    { q: 'handleOrder가 charge를 부를 때 ctx 대신 context.Background()를 넘기면 어떻게 되나?',
      o: ['charge가 더 빨라진다', 'charge의 span이 다른 trace로 떨어져 추적이 끊긴다', 'span.End가 자동으로 불린다'], a: 1,
      why: 'trace_id는 ctx에 실려 내려간다. 새 빈 context를 넘기면 자식 span이 부모를 잃고 따로 기록된다.' },
  ];

  const summary = [
    'print 문자열 로그로는 누가, 얼마나 걸렸는지 알 수 없고 재시작하면 사라진다.',
    'slog JSON 로그는 필드로 검색되고, With로 req_id를 붙이면 한 요청의 줄이 묶인다.',
    '메트릭 라벨은 값이 적은 것만 쓰고, /healthz는 가볍게, /readyz는 DB까지 확인한다.',
    'SIGTERM을 받으면 Shutdown으로 진행 중 요청을 끝내고, trace_id로 느린 구간을 찾는다.',
  ];
  const review = [
    { q: 'DB가 몇 초 느려질 때마다 파드가 재시작을 반복한다. 먼저 의심할 것은?',
      o: ['liveness 프로브가 DB까지 확인하고 있다', '메트릭 라벨이 너무 많다', 'slog 레벨이 INFO다'], a: 0,
      why: 'liveness가 실패하면 재시작이다. DB 확인은 readiness에 두어야 잠깐 빠졌다가 돌아오고, 재시작 폭풍이 생기지 않는다.' },
    { q: '배포할 때마다 사용자 몇 명이 500을 본다. 빠진 것은 무엇일 가능성이 큰가?',
      o: ['Histogram 버킷', 'SIGTERM을 받아 srv.Shutdown(ctx)를 부르는 처리', 'req_id 필드'], a: 1,
      why: '즉시 종료하면 처리 중인 요청이 잘린다. 신호를 채널로 받아 Shutdown으로 진행 중 요청을 끝내야 유실이 없다.' },
    { q: 'Prometheus 메모리가 갑자기 몇 배로 늘었다. 최근 바뀐 코드에서 먼저 볼 곳은?',
      o: ['/healthz 응답 본문', 'span.End 호출 위치', '지표에 새로 붙인 라벨'], a: 2,
      why: '라벨 값 조합마다 시계열이 생긴다. user_id나 전체 URL 같은 라벨이 들어오면 시계열 수가 폭발한다.' },
  ];

  R.page({ title: '관측성 · 운영', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
