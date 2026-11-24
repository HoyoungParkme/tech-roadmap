/* V-1-2 Zipkin — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 재료: 서비스별 로그 파일 조각, Zipkin 컨테이너(:9411)와 저장소, span JSON 과 parentId 트리, 폭포수(self/대기).
 * 숫자: 로그 시각(01.011~01.331), TRACE_SPANS(start·dur), span.json, trace-analysis.json. self 는 dur − 자식 dur 로 다시 셌다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, dbIcon, browser, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 폭포수 데이터 (페이지 TRACE_SPANS 와 같은 값)
  const SP = [
    { n: 'gateway GET /api/orders/42', s: 'gateway', st: 0, d: 320, p: null, col: INFO },
    { n: 'order-service getOrder', s: 'order', st: 18, d: 288, p: 0, col: ACC },
    { n: 'catalog-service getProduct', s: 'catalog', st: 40, d: 45, p: 1, col: GOOD },
    { n: 'payment-service charge', s: 'payment', st: 95, d: 190, p: 1, col: WARN },
    { n: 'db INSERT payment', s: 'payment', st: 120, d: 150, p: 3, col: BAD },
  ];
  // self 구간 = 자기 구간에서 자식 구간을 뺀 나머지
  function selfSegs(i) { const me = SP[i]; let segs = [[me.st, me.st + me.d]];
    SP.forEach((c) => { if (c.p !== i) return; const a = c.st, b = c.st + c.d, out = [];
      segs.forEach(([x, y]) => { if (b <= x || a >= y) out.push([x, y]); else { if (a > x) out.push([x, a]); if (b < y) out.push([b, y]); } }); segs = out; });
    return segs; }
  const SELF = SP.map((_, i) => selfSegs(i).reduce((s, [a, b]) => s + b - a, 0));   // [32, 53, 45, 40, 150]
  function head(s) { tx(40, 40, s, { 'font-size': 17, 'font-weight': 800 }); }

  // ---------- 1. 흩어진 로그 조각 ----------
  const FILES = [
    ['gateway.log', ['01.011  spanId=001  GET /api/orders/42', '01.331  spanId=001  elapsed=320ms'], 320, INFO],
    ['order-service.log', ['01.029  spanId=002  getOrder(42)', '01.317  spanId=002  elapsed=288ms'], 288, ACC],
    ['payment-service.log', ['01.106  spanId=004  charge(42)', '01.296  spanId=004  elapsed=190ms'], 190, WARN],
  ];
  const BX = 530, BW = 360, BMS = (ms) => ms / 320 * BW;
  function fileCard(i, y, open) { const [n, ls, , col] = FILES[i], h = 34 + 58 * open;
    el('rect', { x: 40, y, width: 420, height: h, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 2 });
    mono(56, y + 22, n, { 'font-size': 14.5, 'font-weight': 700, fill: col });
    if (open > 0.6) ls.forEach((l, j) => mono(56, y + 52 + j * 24, l, { 'font-size': 13.5, fill: j ? INK : MUT, 'font-weight': j ? 700 : 400 })); }
  function s1(t, c) { const { k, u } = c;
    head('traceId 하나로 파일 세 개를 grep 한다');
    tx(BX, 76, '머릿속 조립', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    el('line', { x1: BX, y1: 86, x2: BX + BW, y2: 86, stroke: GRID, 'stroke-width': 1.5 });
    const nOpen = Math.min(k, 2) + 1;
    for (let i = 0; i < 3; i++) { if (i > k && k < 3) continue; const now = i === k, y = 74 + i * 108, op = now ? E(u, 0.1, 0.6) : 1;
      fileCard(i, y, op);
      if (i < nOpen) { const yy = 112 + i * 42, f = now ? E(u, 0.9, 1.5) : 1, w = BMS(FILES[i][2]), xo = k === 4 ? BMS(SP[[0, 1, 3][i]].st) * E(u, 0.2, 0.9) : 0;
        if (now) fly(300, y + 76, BX + w / 2, yy, seg(u, 0.6, 1.0), FILES[i][2] + 'ms', { fill: FILES[i][3], mono: true });
        el('rect', { x: BX + xo, y: yy - 11, width: w * f, height: 22, rx: 5, fill: FILES[i][3], opacity: 0.85 });
        if (f > 0.9) mono(BX + xo + w + 8, yy + 5, FILES[i][2] + 'ms', { 'font-size': 14, 'font-weight': 700 }); } }
    if (k <= 2) { pill(820, 40, `grep ${k + 1}/3`, BAD, pop(u, 0.2), { fs: 14, mono: true });
      if (k > 0) sub(BX + 180, 260, '시작 위치는 몰라서 전부 왼쪽에 붙였다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 3) {
      el('rect', { x: BX + BMS(120), y: 227, width: BMS(150), height: 22, rx: 5, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      mono(BX, 243, 'db INSERT ?', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.3) });
      [['파일이 흩어짐', 0], ['spanId 수동 매칭', 1], ['그림이 없음', 2], ['하위 구간 누락', 3]].forEach(([s, i]) =>
        pill(BX + 90 + (i % 2) * 200, 310 + Math.floor(i / 2) * 46, s, BAD, pop(u, 0.8 + i * 0.25), { fs: 14 })); return; }
    // k4: 조각을 한 곳으로
    card(BX + BW / 2, 330, 300, 52, { rx: 10, stroke: INFO, sw: 2.5, fill: INFOBG, text: 'Zipkin · 한 곳에 모은다', color: INFO, s: pop(u, 0.2) });
    sub(BX + BW / 2, 390, '조각을 실제 시작 시각에 놓으면 폭포수가 된다', fade(u, 1.0), { 'font-size': 15 });
    [0, 1, 3].forEach((j, i) => grow(BX + BMS(SP[j].st) + BMS(SP[j].d) / 2, 124 + i * 42, BX + BW / 2, 302, E(u, 0.6 + i * 0.2, 1.2 + i * 0.2), INFO, { sw: 1.8 })); }

  // ---------- 2. Zipkin 서버 ----------
  const ZC = [520, 220];
  function container(o) { o = o || {}; el('rect', { x: ZC[0] - 170, y: ZC[1] - 80, width: 340, height: 160, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    mono(ZC[0] - 154, ZC[1] - 56, 'openzipkin/zipkin', { 'font-size': 15, 'font-weight': 700, opacity: o.op ?? 1 });
    card(ZC[0] - 170, ZC[1], 74, 36, { rx: 8, stroke: INFO, sw: 2.5, fill: INFOBG, text: ':9411', mono: true, color: INFO, fs: 14, op: o.op }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 44, '$ docker run -d -p 9411:9411 openzipkin/zipkin'.slice(0, Math.round(46 * E(u, 0.1, 0.9))), { 'font-size': 15, 'font-weight': 700 });
      container({ op: fade(u, 0.9) });
      browser(140, 130, 150, 90, '브라우저 → UI', { s: pop(u, 1.2) }); server(140, 300, null, { s: pop(u, 1.4) * 0.8 });
      tx(140, 370, '앱 → POST /api/v2/spans', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      grow(220, 150, ZC[0] - 212, ZC[1] - 8, E(u, 1.6, 2.1), INFO); grow(200, 290, ZC[0] - 212, ZC[1] + 8, E(u, 1.8, 2.3), ACC);
      for (let i = 0; i < 3; i++) dot([[200, 290], [ZC[0] - 212, ZC[1] + 8], [ZC[0] + 80, ZC[1] + 30]], seg(u, 2.0 + i * 0.15, 2.6 + i * 0.15), ACC, 5);
      sub(ZC[0] + 10, 340, '포트 하나가 UI와 수집 창구를 겸한다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 1) { container();
      const wipe = seg(u, 0.8, 1.2), es = E(u, 1.3, 1.8);
      card(ZC[0] + 60, ZC[1] + 20, 150, 70, { rx: 8, stroke: OFF, sw: 2, dash: '6 5', fill: SOFT });
      mono(ZC[0] + 60, ZC[1] - 4, 'mem', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      for (let i = 0; i < 6; i++) el('circle', { cx: ZC[0] + 15 + i * 18, cy: ZC[1] + 30, r: 5, fill: ACC, opacity: 1 - wipe });
      pill(ZC[0] + 60, ZC[1] - 110, '재시작 → 사라짐', BAD, pop(u, 0.9), { fs: 14 });
      dbIcon(840, ZC[1] + 10, 'Elasticsearch', { s: es, stroke: GOOD });
      for (let i = 0; i < 6; i++) el('circle', { cx: 815 + (i % 3) * 25, cy: ZC[1] + 6 + Math.floor(i / 3) * 18, r: 5, fill: ACC, opacity: fade(u, 1.9 + i * 0.05) });
      grow(ZC[0] + 172, ZC[1], 790, ZC[1], E(u, 1.5, 1.9), GOOD);
      mono(40, 44, 'STORAGE_TYPE=elasticsearch  ES_HOSTS=http://elasticsearch:9200', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(660, 390, '데모는 mem, 운영은 재시작해도 남는 저장소', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { head('저장소 고르기');
      [['mem', '재시작하면 소실', '데모', BAD], ['elasticsearch', '검색 · 보존', '운영 권장', GOOD], ['mysql', 'RDB에 저장', '기존 DB 활용', INFO]].forEach(([n, a, b, col], i) => {
        const x = 180 + i * 300, s = pop(u, 0.3 + i * 0.4); dbIcon(x, 160, null, { s, stroke: col });
        mono(x, 250, n, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.4) });
        tx(x, 280, a, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) });
        tx(x, 306, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5 + i * 0.4) }); });
      cross(180 + 46, 140, 9, pop(u, 1.8));
      sub(480, 370, '재시작 뒤에도 남아야 하면 mem은 후보에서 빠진다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3) { head('span을 보내는 길 세 가지');
      server(100, 220, '앱', { s: 0.8 });
      card(860, 220, 130, 200, { rx: 12, stroke: INFO, sw: 2.5, fill: INFOBG, text: 'Zipkin', color: INFO });
      const L = [['HTTP', 110, INFO, null], ['RabbitMQ', 220, WARN, 'queue'], ['Kafka', 330, ACC, 'log']];
      L.forEach(([n, y, col, mid], i) => { const at = 0.2 + i * 0.5, f = E(u, at, at + 0.5);
        el('path', { d: `M160,220 C230,220 230,${y} 300,${y} H${lerp(300, 790, f)}`, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: f > 0 ? 1 : 0 });
        tx(310, y - 14, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, at) });
        if (mid) { for (let j = 0; j < 6; j++) el('rect', { x: 460 + j * 34, y: y - 15, width: 30, height: 30, rx: 4, fill: j < 4 ? col : PANEL, stroke: col, 'stroke-width': 1.5, opacity: fade(u, at + 0.3) * (j < 4 ? 0.7 : 1) });
          tx(560, y + 34, mid === 'queue' ? '앱은 큐에 발행만' : '대용량 수집', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, at + 0.4) }); }
        for (let j = 0; j < 2; j++) dot([[300, y], [790, y]], seg(u, at + 0.6 + j * 0.4, at + 1.5 + j * 0.4), col, 6); });
      return; }
    // k4: 살아 있는지 확인
    container(); el('circle', { cx: ZC[0] + 150, cy: ZC[1] - 60, r: 8 * pop(u, 1.6), fill: GOOD });
    terminal(60, 34, 560, 96, ['$ curl -s http://localhost:9411/health', '{"status":"UP", ...}'], E(u, 0.2, 1.4) * 2, { title: 'bash', fs: 15 });
    check(ZC[0] + 120, ZC[1] + 30, 16, pop(u, 1.8));
    sub(ZC[0], ZC[1] + 120, '수집 창구가 열렸다 · 이제 앱 쪽을 설정한다', fade(u, 2.0), { 'font-size': 15 }); }

  // ---------- 3. 앱에서 export ----------
  const AX = 210, ZX = 760;
  function app3(name) { card(AX, 140, 280, 80, { rx: 12, stroke: INK, sw: 2.5 }); mono(AX, 134, name || 'app', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: name ? ACC : MUT });
    tx(AX, 160, 'Micrometer Tracing + Brave', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function zipkin3(o) { o = o || {}; card(ZX, 200, 300, 230, { rx: 12, stroke: o.down ? BAD : INFO, sw: 2.5, fill: PANEL });
    mono(ZX - 136, 108, 'Zipkin :9411', { 'font-size': 15, 'font-weight': 700, fill: o.down ? BAD : INFO }); }
  function slider(x, y, w, v, label) { el('rect', { x, y: y - 4, width: w, height: 8, rx: 4, fill: SOFT });
    el('rect', { x, y: y - 4, width: w * v / 100, height: 8, rx: 4, fill: ACC }); el('circle', { cx: x + w * v / 100, cy: y, r: 10, fill: PANEL, stroke: ACC, 'stroke-width': 3 });
    mono(x, y - 18, label, { 'font-size': 14, fill: MUT }); mono(x + w + 16, y + 5, Math.round(v) + '%', { 'font-size': 16, 'font-weight': 800, fill: ACC }); }
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    head('application.yml 몇 줄로 span을 보낸다');
    app3(k === 0 ? (fade(u, 0.6) > 0.5 ? 'order-service' : null) : 'order-service'); zipkin3({ down: k === 3 && u > 0.9 && u < 2.2 });
    if (k === 0) { pill(AX, 230, 'spring.application.name', ACC, pop(u, 0.2), { fs: 14, mono: true });
      fly(AX + 140, 140, ZX - 60, 150, seg(u, 1.0, 1.8), 'order-service', { fill: ACC, mono: true, stay: true });
      tx(ZX, 200, '서비스 목록의 이름표가 된다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    const sm = tween(p.sampling, b.sampling, c.u);
    slider(80, 270, 230, sm, 'sampling.probability');
    if (k === 1) { for (let i = 0; i < 10; i++) { const on = sm >= (i + 1) * 10 - 0.5; card(80 + i * 26, 340, 20, 20, { rx: 4, stroke: on ? ACC : OFF, sw: 2, fill: on ? ACC : PANEL }); }
      tx(80, 382, '요청 10개 중 추적되는 것', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
      tx(ZX, 200, '0이면 아무 span도 안 나간다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); return; }
    // span 이 Zipkin 에 도착한 폭포수
    const wf = (n) => [0, 1].slice(0, n).forEach((j) => { const y = 150 + j * 34, w = SP[j].d / 320 * 240;
      el('rect', { x: ZX - 130 + SP[j].st / 320 * 240, y, width: w, height: 20, rx: 4, fill: SP[j].col, opacity: 0.85 }); mono(ZX - 126 + SP[j].st / 320 * 240, y + 15, SP[j].d + 'ms', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700 }); });
    const pipe = (via) => { el('line', { x1: AX + 140, y1: 140, x2: ZX - 150, y2: 140, stroke: INFO, 'stroke-width': 2.5, opacity: via ? 0.25 : 1 });
      mono(470, 128, ':9411/api/v2/spans', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: via ? 0.3 : 1 }); };
    if (k === 2) { const f = E(u, 0.2, 0.8); el('line', { x1: AX + 140, y1: 140, x2: lerp(AX + 140, ZX - 150, f), y2: 140, stroke: INFO, 'stroke-width': 2.5 });
      mono(470, 128, ':9411/api/v2/spans', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      fly(AX + 140, 140, ZX - 150, 140, seg(u, 0.9, 1.5), 'span', { fill: INFO }); fly(AX + 140, 140, ZX - 150, 140, seg(u, 1.2, 1.8), 'span', { fill: ACC });
      if (u > 1.6) wf(u > 1.9 ? 2 : 1);
      mono(ZX, 260, 'trace 320ms', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(470, 210, '+ bridge-brave · zipkin-reporter-brave', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); return; }
    wf(2);
    if (k === 3) { pipe(true);
      card(470, 220, 150, 60, { rx: 10, stroke: WARN, sw: 2.5, fill: WARNBG, s: pop(u, 0.2) }); mono(470, 214, 'RabbitMQ', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      grow(AX + 100, 182, 395, 214, E(u, 0.4, 0.8), WARN); grow(545, 214, ZX - 152, 214, E(u, 0.5, 0.9), WARN);
      const held = Math.round(clamp((u - 0.9) / 1.3) * 4), dr = seg(u, 2.2, 2.7);
      for (let i = 0; i < 4; i++) el('rect', { x: 412 + i * 30, y: 230, width: 24, height: 12, rx: 3, fill: WARN, opacity: i < held ? 1 - dr : 0 });
      if (u > 0.9 && u < 2.2) { cross(ZX, 260, 16, 1); tx(ZX, 300, 'Zipkin 잠시 다운', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 }); }
      sub(470, 290, '큐에 쌓였다가 살아나면 가져간다', fade(u, 1.2), { 'font-size': 14 }); return; }
    // k4: 1.0 과 0.1 의 비용
    pipe(false);
    tx(80, 330, '저장 · 전송량', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    [['1.0', 1, BAD], ['0.1', 0.1, GOOD]].forEach(([n, v, col], i) => { const y = 352 + i * 32;
      mono(80, y + 6, n, { 'font-size': 15, 'font-weight': 800, fill: col }); el('rect', { x: 120, y: y - 9, width: 300 * v * E(u, 0.3 + i * 0.5, 1.0 + i * 0.5), height: 18, rx: 4, fill: col }); });
    mono(440, 390, '1/10', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
    tx(ZX, 370, '자주 나는 병목은 10% 표본에도 잡힌다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }

  // ---------- 4. span JSON → 트리 ----------
  const J1 = ['"traceId": "a1b2c3d4e5f60718"', '"id": "…0002"', '"parentId": "…0001"', '"duration": 288000'];
  const J1b = ['"kind": "SERVER"', '"serviceName": "order-service"', '"http.status_code": "200"'];
  const J2 = ['"traceId": "a1b2c3d4e5f60718"', '"id": "…0004"', '"parentId": "…0002"', '"duration": 190000'];
  const NODE = { 1: [640, 110, '…0001', 'gateway', 320], 2: [700, 200, '…0002', 'order', 288], 4: [760, 290, '…0004', 'charge', 190] };
  function node(id, s, o) { o = o || {}; const [x, y, sid, n, d] = NODE[id];
    card(x, y, 230, 52, { rx: 10, stroke: o.red ? BAD : o.ghost ? OFF : ACC, sw: 2.5, fill: o.red ? BADBG : PANEL, s });
    mono(x - 102, y - 4, sid, { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: s }); tx(x - 30, y - 4, n, { 'font-size': 15, 'font-weight': 700, opacity: s });
    mono(x - 102, y + 17, d + 'ms', { 'font-size': 13.5, fill: MUT, opacity: s }); }
  function edge(a, b, f) { const A = NODE[a], B = NODE[b]; if (f <= 0) return; el('path', { d: `M${A[0] - 90},${A[1] + 26} V${lerp(A[1] + 26, B[1], f)} H${lerp(A[0] - 90, B[0] - 115, f > 0.5 ? (f - 0.5) * 2 : 0)}`, fill: 'none', stroke: MUT, 'stroke-width': 2.2 }); }
  function json(x, y, lines, shown, hi) { el('rect', { x, y, width: 400, height: 30 + lines.length * 26, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    lines.forEach((l, i) => { if (i >= shown) return; mono(x + 16, y + 30 + i * 26, l, { 'font-size': 14, fill: hi && hi(i) ? ACC : INK, 'font-weight': hi && hi(i) ? 700 : 400 }); }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    head('span JSON 한 조각이 트리 한 칸이 된다');
    R.spans(940, 40, [['도착한 span ', { fill: MUT }], [String(Math.round(tween(p.spansShown, b.spansShown, u))), { fill: ACC, 'font-weight': 800 }]], { 'font-size': 15, 'text-anchor': 'end' });
    node(1, 1, { ghost: true });
    if (k === 0) { json(40, 80, J1, E(u, 0.1, 1.0) * 4 + 0.01, (i) => i === 2 && u > 1.3);
      const f = E(u, 1.4, 2.0); edge(1, 2, f); node(2, pop(u, 1.9));
      sub(240, 250, 'parentId가 가리키는 span 아래에 매달린다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    edge(1, 2, 1); node(2, 1, { red: k === 4 && u > 1.6 });
    if (k === 1) { json(40, 80, J1b, E(u, 0.1, 0.8) * 3 + 0.01);
      [['SERVER', MUT], ['order-service', ACC], ['200', GOOD]].forEach(([s, col], i) => pill(620 + i * 110 - (i === 1 ? 10 : 0) + (i === 2 ? 40 : 0), 250, s, col, pop(u, 1.0 + i * 0.3), { fs: 13.5, mono: true }));
      sub(480, 330, 'tags는 검색 조건이 된다 · status_code=500으로 거를 수 있다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) { json(40, 80, J2, E(u, 0.1, 1.0) * 4 + 0.01, (i) => i === 2 && u > 1.2);
      edge(2, 4, E(u, 1.3, 1.9)); node(4, pop(u, 1.9));
      sub(240, 250, '…0002의 자식 · 트리 깊이 +1', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    edge(2, 4, 1); node(4, 1);
    if (k === 3) { json(40, 80, ['"serviceName": "payment-service"', '"peer.service": "payment-db"'], E(u, 0.1, 0.7) * 2 + 0.01, (i) => i === 1);
      const f = E(u, 1.0, 1.5); el('line', { x1: 875, y1: 290, x2: lerp(875, 880, f), y2: lerp(290, 360, f), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      dbIcon(860, 380, null, { s: 0.45 * pop(u, 1.5) }); mono(800, 386, 'payment-db', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.6) });
      sub(240, 200, '어느 상대와 통신했는지까지 남는다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    // k4: 단위와 error 태그
    mono(60, 120, '288000 µs ÷ 1000', { 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.2) });
    mono(60, 160, '= 288 ms', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
    pill(160, 230, 'error=true', BAD, pop(u, 1.3), { fs: 15, mono: true });
    grow(230, 230, 580, 210, E(u, 1.4, 1.8), BAD);
    sub(240, 290, '예: error=true 태그가 붙으면 붉게 표시된다', fade(u, 1.9), { 'font-size': 14.5 }); }

  // ---------- 5. 폭포수로 병목 찾기 ----------
  const W = { x0: 330, x1: 880, y0: 116, rh: 48 }, WX = (ms) => W.x0 + ms / 320 * (W.x1 - W.x0);
  function wfAxis(u0) { el('line', { x1: W.x0, y1: W.y0 - 36, x2: lerp(W.x0, W.x1, u0), y2: W.y0 - 36, stroke: GRID, 'stroke-width': 1.5 });
    [0, 80, 160, 240, 320].forEach((v) => mono(WX(v), W.y0 - 44, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: u0 > 0.9 ? 1 : 0 })); }
  function wfBar(i, o) { o = o || {}; const s = SP[i], y = W.y0 + i * W.rh, f = o.f ?? 1, lab = s.n.replace('-service', '');
    mono(40 + [0, 12, 24, 24, 36][i], y + 5, lab.length > 24 ? lab.slice(0, 23) + '…' : lab, { 'font-size': 14, 'font-weight': 700, fill: o.dim ? OFF : INK });
    if (f <= 0) return; const col = o.red ? BAD : s.col;
    el('rect', { x: WX(s.st), y: y - 12, width: (WX(s.st + s.d) - WX(s.st)) * f, height: 24, rx: 4, fill: col, opacity: o.split ? 0.25 : o.dim ? 0.25 : 0.85 });
    if (o.split) selfSegs(i).forEach(([a, b]) => el('rect', { x: WX(a), y: y - 12, width: (WX(b) - WX(a)) * o.split, height: 24, rx: 3, fill: col, opacity: 0.95 }));
    if (f > 0.95 && !o.noLabel) mono(WX(s.st + s.d) + 8, y + 5, o.self ? `self ${SELF[i]}ms` : s.d + 'ms', { 'font-size': 14, 'font-weight': 700, fill: o.red ? BAD : INK }); }
  function s5(t, c) { const { k, u } = c;
    head('Zipkin 폭포수 · traceId a1b2c3d4e5f60718');
    pill(860, 40, 'sampling ' + c.beat.sampling + '%', MUT, 1, { fs: 13.5, mono: true });
    wfAxis(k === 0 ? E(u, 0.1, 0.6) : 1);
    if (k === 0) { SP.forEach((_, i) => wfBar(i, i === 0 ? { f: E(u, 0.5, 1.3) } : { dim: true, noLabel: true }));
      mono(WX(160), W.y0 + 5 * W.rh + 20, '전체 320ms를 기준으로 비중을 잰다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { SP.forEach((_, i) => wfBar(i, { split: E(u, 0.4 + i * 0.25, 0.9 + i * 0.25), self: u > 1.0 + i * 0.25 }));
      tx(480, 392, '진한 칸 = self (자식 구간을 뺀 자기 시간) · 옅은 칸 = 자식 기다림', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); return; }
    SP.forEach((_, i) => wfBar(i, { split: 1, self: true, red: i === 4 && k >= 2 }));
    if (k === 2) { const y = 392, f = E(u, 0.5, 1.4);
      el('rect', { x: W.x0, y: y - 12, width: W.x1 - W.x0, height: 22, rx: 5, fill: SOFT });
      el('rect', { x: W.x0, y: y - 12, width: (W.x1 - W.x0) * 150 / 320 * f, height: 22, rx: 5, fill: BAD });
      tx(W.x0 - 14, y + 5, 'self 150 / 320', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' });
      mono(W.x0 + (W.x1 - W.x0) * 150 / 320 + 10, y + 5, '47%', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); return; }
    if (k === 3) { [[0, '대기'], [1, '대기'], [4, '실작업']].forEach(([i, s], j) => { const y = W.y0 + i * W.rh;
        pill(i === 4 ? WX(195) : WX(160), y, s, i === 4 ? BAD : MUT, pop(u, 0.4 + j * 0.4), { fs: 14, fill: PANEL }); });
      tx(480, 392, 'dur가 큰 위쪽 막대는 아래를 기다렸을 뿐이다', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k4: 진단 절차 3단계
    [['① minDuration=300ms로 검색', 140], ['② 가장 긴 막대 클릭', 450], ['③ self 큰 span 확정', 760]].forEach(([s, x], i) => {
      pill(x, 392, s, i === 2 ? BAD : INK, pop(u, 0.3 + i * 0.6), { fs: 14 }); if (i < 2) grow(x + 120, 392, x + 190, 392, E(u, 0.7 + i * 0.6, 1.0 + i * 0.6), MUT); });
    el('rect', { x: WX(0) - 4, y: W.y0 - 16, width: WX(320) - WX(0) + 8, height: 32, rx: 6, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.9) * (1 - fade(u, 1.5)) });
    el('rect', { x: WX(120) - 4, y: W.y0 + 4 * W.rh - 16, width: WX(270) - WX(120) + 8, height: 32, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: 'Zipkin 없이 이 trace를 보려면 무엇을 해야 했나?',
      o: ['서비스마다 로그 파일을 열어 같은 traceId로 grep하고 손으로 잇는다', 'gateway 로그 한 곳만 보면 된다', 'traceId 없이 시각만으로 맞춘다'], a: 0,
      why: '조각이 gateway.log, order-service.log, payment-service.log에 흩어져 있어 grep을 세 번 했다. 로그에 없던 db INSERT 구간은 끝내 안 보였다.' },
    { q: '운영에서 Zipkin 저장소로 mem을 쓰면 생기는 문제는 무엇인가?',
      o: ['검색이 느려진다', '9411 포트를 하나 더 열어야 한다', '재시작하면 모은 span이 사라진다'], a: 2,
      why: 'mem은 인메모리라 데모용이다. 보존이 필요하면 STORAGE_TYPE=elasticsearch처럼 영속 저장소를 붙인다.' },
    { q: 'probability를 0으로 두고 endpoint만 맞게 적으면 어떻게 되나?',
      o: ['모든 span이 Zipkin으로 간다', 'span이 하나도 나가지 않는다', '10%만 나간다'], a: 1,
      why: 'endpoint는 어디로 보낼지, probability는 얼마나 보낼지다. 0이면 보낼 대상이 없다.' },
    { q: 'Zipkin이 두 span을 부모-자식으로 잇는 근거는 무엇인가?',
      o: ['timestamp가 가까워서', '자식 span의 parentId가 부모 span의 id와 같아서', 'serviceName이 같아서'], a: 1,
      why: 'charge의 parentId …0002가 order span의 id와 같아 그 아래로 매달린다. traceId는 같은 요청인지만 알려 준다.' },
    { q: '이 trace에서 먼저 고쳐야 할 구간은 무엇인가?',
      o: ['gateway (dur 320ms)', 'order getOrder (dur 288ms)', 'db INSERT payment (self 150ms)'], a: 2,
      why: 'gateway와 order는 dur가 커도 self가 32ms, 53ms로 대부분 자식을 기다린 시간이다. db INSERT의 self 150ms가 전체의 47%다.' },
  ];

  const summary = [
    'traceId가 있어도 로그가 서비스마다 흩어져 있으면 사람이 grep으로 이어야 한다.',
    'Zipkin은 9411 포트 하나로 화면과 span 수집 창구를 함께 연다. 운영 저장소는 mem 대신 ES를 쓴다.',
    '앱은 endpoint로 보낼 곳을, probability로 보낼 비율을 정한다. 운영은 0.1부터 시작한다.',
    '폭포수에서는 dur보다 self를 본다. 이 trace의 범인은 self 150ms인 db INSERT 였다.',
  ];
  const review = [
    { q: '느린 요청을 Zipkin에서 열었더니 gateway 막대가 가장 길었다. 바로 gateway를 튜닝하려는 동료에게 할 말은?',
      o: ['gateway의 self를 먼저 보자, 대부분 하위 대기일 수 있다', 'gateway가 가장 기니 맞다', 'sampling을 1.0으로 올려야 정확하다'], a: 0,
      why: '맨 위 막대의 dur에는 자식 span 시간이 다 들어 있다. self가 큰 깊은 막대가 실제로 시간을 쓴 곳이다.' },
    { q: '배포 뒤 Zipkin에 order-service의 span만 보이고 payment-service는 없다. 먼저 확인할 것은?',
      o: ['Zipkin 저장소가 elasticsearch 인지', 'payment-service의 zipkin endpoint와 reporter 의존성', 'gateway의 serviceName'], a: 1,
      why: '같은 trace가 한 트리로 모이려면 모든 서비스가 같은 Zipkin으로 보내야 한다. 빠진 서비스의 전송 설정부터 본다.' },
    { q: 'Zipkin이 가끔 재시작될 때마다 그 사이 span이 비어 있다. 앱 응답 시간에는 영향을 주지 않으면서 줄일 방법은?',
      o: ['sampling을 0으로 낮춘다', 'span 전송을 RabbitMQ 같은 큐로 바꾼다', '앱이 Zipkin 응답을 기다리게 한다'], a: 1,
      why: '큐를 끼우면 앱은 발행만 하고, Zipkin이 다시 뜨면 쌓인 span을 가져간다. 전송 실패를 큐가 흡수한다.' },
  ];

  R.page({ title: 'Zipkin 수집과 폭포수', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
