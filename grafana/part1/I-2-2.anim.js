/* I-2-2 Data Source 개념 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 저장소 없는 Grafana 와 바깥 백엔드(Prometheus·Loki·PostgreSQL), 요청이 지나는 길(proxy/direct),
 *       소스마다 다른 쿼리 언어가 공통 data frame 으로 모이는 모습, Mixed 패널과 datasource 변수.
 * "Successfully queried the Prometheus API." 는 Grafana Prometheus 문서에 적힌 Save & test 성공 문구다.
 * dev·staging 소스 이름과 로그 줄은 설명용 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, grow, dot, fly, cross, check, lock, dbIcon, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const SRC = { prom: ['Prometheus', 'PromQL', BAD], loki: ['Loki', 'LogQL', WARN], sql: ['PostgreSQL', 'SQL', INFO] };
  const SER = [0.3, 0.42, 0.38, 0.5, 0.46, 0.6, 0.55, 0.7, 0.62, 0.68];   // 그림용 모양
  function gbox(cx, cy, o) { o = o || {}; card(cx, cy, o.w || 170, o.h || 70, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: o.s, op: o.op });
    tx(cx, cy + (o.sub ? -4 : 6), 'Grafana', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: o.op ?? (o.s ?? 1) > 0.05 ? 1 : 0 });
    if (o.sub) sub(cx, cy + 20, o.sub, 1, { 'font-size': 13.5 }); }
  function src(key, cx, cy, o) { o = o || {}; const [n, lang, col] = SRC[key]; dbIcon(cx, cy, n, { stroke: o.off ? OFF : col, s: o.s ?? 1, op: o.op });
    if (o.lang) pill(cx, cy - 52, lang, col, o.s ?? 1, { mono: true, fs: 13.5 }); }
  function panelBox(x, y, w, h, title, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    tx(x + 10, y + 21, title, { 'font-size': 14.5, 'font-weight': 700, opacity: o.op ?? 1 }); }
  function spark(x, y, w, h, u, col, o) { o = o || {}; if (u <= 0) return; const n = SER.length - 1, P = SER.filter((_, i) => i / n <= u).map((v, i) => [x + (i / n) * w, y + h - v * h]);
    if (P.length > 1) el('polyline', { points: P.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.5, 'stroke-linejoin': 'round', opacity: o.op ?? 1 }); }
  function note(x, y, s, op, a) { tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 700, opacity: op }, a || {})); }

  // ========== 1. Data Source 란 ==========
  function s1(t, c) { const { k, u } = c, G0 = [480, 200];
    // yaml 목록
    card(120, 70, 200, 70, { rx: 8, stroke: INK, s: k === 0 ? pop(u, 0.2) : 1 }); mono(34, 62, 'datasources:', { 'font-size': 14.5, 'font-weight': 700 }); mono(34, 88, k >= 1 ? '  - name: Prometheus' : '  # 아직 없음', { 'font-size': 13.5, fill: k >= 1 ? ACC : OFF });
    gbox(G0[0], G0[1], { s: k === 0 ? pop(u, 0.5) : 1, sub: k === 0 ? null : 'view layer' });
    if (k === 0) { dbIcon(G0[0], G0[1] + 120, null, { s: 0.55 * pop(u, 1.1), stroke: MUT }); cross(G0[0], G0[1] + 120, 22, pop(u, 1.5));
      note(G0[0] + 60, G0[1] + 128, '자체 저장소 없음', fade(u, 1.7), { fill: BAD });
      sub(780, 120, 'yaml은 "무엇을 붙일지" 적는 목록', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // Prometheus 연결
    const PS = [800, 200]; src('prom', PS[0], PS[1], { s: k === 1 ? pop(u, 0.3) : 1 });
    if (k === 1) { const g = E(u, 0.7, 1.4); el('line', { x1: G0[0] + 86, y1: G0[1], x2: lerp(G0[0] + 86, PS[0] - 50, g), y2: PS[1], stroke: BAD, 'stroke-width': 3 });
      card(650, G0[1] + 44, 170, 36, { rx: 6, text: 'type: prometheus', fs: 13.5, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.3) });
      sub(650, 290, '플러그인이 PromQL을 대신 말한다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    el('line', { x1: G0[0] + 86, y1: G0[1], x2: PS[0] - 50, y2: PS[1], stroke: BAD, 'stroke-width': 3 });
    const BR = [150, 290];
    if (k === 2) { browser(BR[0], BR[1], 150, 90, '브라우저', { s: pop(u, 0.2) });
      const route = [[BR[0] + 75, BR[1]], [G0[0] - 86, G0[1] + 10], [G0[0] + 86, G0[1]], [PS[0] - 50, PS[1]]]; dot(route, seg(u, 0.6, 2.0), ACC, 7);
      [['uid', 'prom-default'], ['access', 'proxy'], ['url', 'http://prometheus:9090']].forEach(([a, v], i) => { mono(560, 300 + i * 30, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); mono(640, 300 + i * 30, v, { 'font-size': 14.5, 'font-weight': 700, fill: i === 1 ? ACC : INK, opacity: fade(u, 0.4 + i * 0.4) }); });
      return; }
    if (k === 3) { panelBox(80, 250, 280, 130, '새 패널', { stroke: ACC });
      card(220, 320, 230, 38, { rx: 6, text: 'Prometheus ★ default', fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 0.6) });
      grow(PS[0] - 30, PS[1] + 70, 340, 320, E(u, 0.3, 1.0), ACC, { dash: '5 4' }); mono(640, 300, 'isDefault: true', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      sub(640, 340, '새 패널에 자동으로 골라진다', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 4) { browser(BR[0], BR[1] - 10, 150, 90, '브라우저', {});
      const pr = [[BR[0] + 75, BR[1] - 10], [G0[0] - 86, G0[1] + 10], [G0[0] + 86, G0[1]], [PS[0] - 50, PS[1]]]; dot(pr, seg(u, 0.2, 1.3), GOOD, 7);
      note(260, 110, 'proxy', fade(u, 0.3), { fill: GOOD, class: 'mono' }); sub(400, 136, '주소·인증은 서버 안에', fade(u, 0.6), { 'font-size': 14 });
      const g = E(u, 1.4, 2.2); el('path', { d: `M${BR[0] + 75},${BR[1] + 20} Q${480},${380} ${PS[0] - 40},${PS[1] + 50}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': `${g * 700} 900` });
      note(420, 372, 'direct: 브라우저가 직접 호출', fade(u, 1.6), { fill: BAD }); cross(640, 330, 11, pop(u, 2.2)); sub(780, 372, '주소·인증 노출', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); return; }
    // k5 uid 로 가리킨다
    const ren = E(u, 0.6, 1.2); tx(PS[0], PS[1] + 90, ren > 0.5 ? 'name: Prom-Main' : 'name: Prometheus', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ren > 0.5 ? WARN : INK });
    panelBox(60, 260, 300, 120, '패널 JSON'); mono(76, 312, '"datasource": {', { 'font-size': 14 }); mono(92, 340, '"uid": "prom-default" }', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    grow(360, 330, PS[0] - 45, PS[1] + 40, E(u, 1.3, 2.0), ACC); check(PS[0] + 70, PS[1] - 10, 12, pop(u, 2.1));
    sub(620, 400, '이름이 바뀌어도 uid 연결은 그대로', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // ========== 2. 연결 설정과 Test ==========
  function s2(t, c) { const { k, u } = c, G0 = [430, 150], PS = [800, 110], DB = [800, 300];
    gbox(G0[0], G0[1], {}); src('prom', PS[0], PS[1]); el('line', { x1: G0[0] + 86, y1: G0[1], x2: PS[0] - 50, y2: PS[1], stroke: BAD, 'stroke-width': 2.5 });
    const tested = k >= 1 && !(k === 1 && u < 1.8);
    // Save & Test 버튼 + 결과
    card(160, 70, 200, 44, { rx: 8, text: 'Save & test', fs: 16, stroke: tested ? GOOD : OFF, color: tested ? GOOD : MUT });
    if (k === 0) { mono(60, 140, 'url만 있다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(60, 168, '인증·timeout 없음', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.7) });
      tx(160, 230, '?', { 'font-size': 48, 'font-weight': 800, 'text-anchor': 'middle', fill: OFF, opacity: fade(u, 1.0) }); sub(160, 270, '도달하는지 아직 모른다', fade(u, 1.4), { 'font-size': 15 }); return; }
    if (k === 1) { dot([[G0[0] + 86, G0[1]], [PS[0] - 50, PS[1]]], seg(u, 0.4, 1.0), ACC, 7); dot([[PS[0] - 50, PS[1]], [G0[0] + 86, G0[1]]], seg(u, 1.1, 1.7), GOOD, 7);
      mono(60, 150, 'httpMethod: POST', { 'font-size': 14.5, opacity: fade(u, 0.2) }); mono(60, 176, 'timeout: 30   # 초', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.4) });
      if (u > 1.8) { el('circle', { cx: 60, cy: 230, r: 9, fill: GOOD }); mono(78, 235, 'Successfully queried', { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); mono(78, 257, 'the Prometheus API.', { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
      return; }
    el('circle', { cx: 60, cy: 230, r: 9, fill: GOOD }); tx(78, 235, '연결 확인됨', { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
    src('sql', DB[0], DB[1], { s: k === 2 ? pop(u, 0.3) : 1 });
    const gl = k === 2 ? E(u, 0.7, 1.3) : 1; el('line', { x1: G0[0] + 80, y1: G0[1] + 20, x2: lerp(G0[0] + 80, DB[0] - 50, gl), y2: lerp(G0[1] + 20, DB[1], gl), stroke: INFO, 'stroke-width': 2.5 });
    if (k === 2) { mono(560, 380, 'name: AppDB · type: postgres · url: postgres:5432', { 'font-size': 14, opacity: fade(u, 1.0) }); sub(160, 330, '연결 소스 1 → 2', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { R.person(330, 330, null, { s: 0.7 * pop(u, 0.2) }); mono(360, 326, 'user: grafana_ro', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      pill(420, 362, '읽기 전용', GOOD, pop(u, 0.7), { fs: 13.5 }); pill(520, 362, 'INSERT', BAD, pop(u, 1.0), { mono: true, fs: 13.5 }); cross(580, 362, 9, pop(u, 1.3));
      lock(DB[0] - 80, DB[1] + 10, true, INFO, pop(u, 1.6)); mono(DB[0] - 60, DB[1] + 92, 'sslmode: require', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.6), 'text-anchor': 'middle' });
      sub(160, 330, 'database: app', fade(u, 1.9), { class: 'mono', 'font-size': 14 }); return; }
    if (k === 4) { card(140, 340, 220, 50, { rx: 8, text: 'env APP_DB_PASSWORD', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.2) });
      fly(250, 340, G0[0] - 20, G0[1] + 40, seg(u, 0.5, 1.3), '••••••', { fill: WARN, stay: true });
      lock(G0[0] + 60, G0[1] + 54, true, ACC, pop(u, 1.4)); sub(G0[0], G0[1] + 84, 'secureJsonData로 암호화 저장', fade(u, 1.5), { 'font-size': 14 });
      card(560, 400 - 14, 300, 30, { rx: 6, text: 'API: secureJsonFields.password = true', fs: 13.5, mono: true, stroke: GRID, s: pop(u, 2.0) }); return; }
    // k5 함정 두 가지
    el('rect', { x: 30, y: 280, width: 300, height: 110, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.2) });
    mono(46, 310, 'git commit', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3) }); mono(46, 338, 'password: hunter2', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) }); sub(180, 372, '평문 비밀번호 = 유출 (예시)', fade(u, 0.8), { fill: BAD, 'font-weight': 700, 'font-size': 14 });
    const lim = 300; el('line', { x1: 380 + lim, y1: 280, x2: 380 + lim, y2: 380, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) }); mono(380 + lim, 272, 'timeout', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    el('rect', { x: 380, y: 310, width: Math.min(lim, 420 * E(u, 1.2, 2.4)), height: 26, rx: 4, fill: WARN, opacity: 0.85 }); tx(380, 360, '무거운 쿼리', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2) });
    if (u > 2.2) { cross(380 + lim + 20, 323, 10, pop(u, 2.2)); sub(560, 400, '짧으면 매번 실패', 1, { fill: BAD, 'font-weight': 700, 'font-size': 14 }); } }

  // ========== 3. 쿼리 언어 추상화 ==========
  const Q3 = [['prom', 'rate(http_requests_total[5m])', '지표 (Prometheus)'], ['loki', '{app="api"} |= "error"', '로그 (Loki)'], ['sql', 'SELECT $__timeGroup(…) AS time …', '주문 수 (PostgreSQL)']];
  function frame(x, y, op) { el('rect', { x, y, width: 150, height: 108, rx: 6, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: op });
    mono(x + 12, y + 22, 'time', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: op }); mono(x + 84, y + 22, 'value', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: op });
    el('line', { x1: x + 6, y1: y + 32, x2: x + 144, y2: y + 32, stroke: GRID, opacity: op }); [0, 1, 2].forEach((r) => mono(x + 12, y + 56 + r * 20, '…', { 'font-size': 14, fill: MUT, opacity: op })); }
  function s3(t, c) { const { k, u } = c, n = k <= 1 ? 1 : k === 2 ? 2 : 3;
    Q3.forEach(([key, q, title], i) => { if (i >= n) return; const y = 80 + i * 115, fresh = (i === 0 && k === 0) || (i === 1 && k === 2) || (i === 2 && k === 3), s0 = fresh ? pop(u, 0.2) : 1;
      src(key, 90, y + 10, { s: s0 * 0.85 });
      const showQ = i > 0 || k >= 1, qa = i === 0 && k === 1 ? fade(u, 0.3) : fresh ? fade(u, 0.6) : 1;
      if (showQ) { pill(260, y - 18, SRC[key][1], SRC[key][2], qa, { mono: true, fs: 13.5 }); mono(190, y + 18, q, { 'font-size': 13.5, opacity: qa }); }
      panelBox(640, y - 30, 290, 92, title, { stroke: fresh ? ACC : GRID }); spark(660, y + 6, 250, 46, k >= 4 ? 1 : fresh ? E(u, 1.4, 2.4) : (i === 0 && k === 0 ? 0 : 1), SRC[key][2]);
      if (k === 0 && i === 0) { mono(650, y + 30, 'uid: "prom-default"', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.8) }); grow(630, y + 10, 150, y + 10, E(u, 1.2, 1.9), ACC, { dash: '5 4' }); }
      if (k === 1 && i === 0) dot([[150, y + 10], [460, y + 10], [640, y]], seg(u, 1.0, 2.0), ACC, 7);
      if (k === 2 && i === 1) { ['level=error msg="db timeout"', 'level=error msg="502 upstream"'].forEach((ln, j) => mono(190, y + 44 + j * 20, ln, { 'font-size': 13.5, fill: WARN, opacity: fade(u, 0.8 + j * 0.3) })); }
      if (k === 3 && i === 2) mono(190, y + 44, 'format: time_series · rawSql', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.9) }); });
    if (k === 4) { frame(470, 150, fade(u, 0.3)); Q3.forEach((_, i) => { const y = 80 + i * 115 + 10; dot([[150, y], [470, 204]], seg(u, 0.4 + i * 0.2, 1.2 + i * 0.2), SRC[Q3[i][0]][2], 6); grow(622, 204, 638, 80 + i * 115 + 16, E(u, 1.4, 1.8), MUT, { plain: true }); });
      sub(545, 290, '공통 data frame', fade(u, 0.8), { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      sub(480, 406, '패널은 소스가 무엇이든 같은 표를 받는다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // ========== 4. Mixed ==========
  function s4(t, c) { const { k, u } = c, PX = 380, PY = 50, PW = 540, PH = 220;
    panelBox(PX, PY, PW, PH, '배포 상관관계 패널', { stroke: k <= 1 ? ACC : GRID });
    mono(PX + PW - 12, PY + 21, 'timeseries', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (k === 0) { tx(PX + PW / 2, PY + PH / 2 + 10, '소스 미지정 · 데이터 없음', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: OFF, opacity: fade(u, 0.5) }); return; }
    pill(PX + PW / 2, PY + PH + 22, '-- Mixed --', INK, k === 1 ? pop(u, 0.3) : 1, { mono: true, fs: 14.5, fill: SOFT });
    const TA = [150, 110], TB = [150, 330];
    if (k === 1) { ['target A', 'target B'].forEach((s0, i) => card([TA, TB][i][0] + 60, [TA, TB][i][1] + (i ? 0 : 20), 130, 36, { rx: 6, text: s0, fs: 14, mono: true, stroke: MUT, color: MUT, dash: '5 4', s: pop(u, 1.4 + i * 0.2) }));
      grow(PX + PW / 2 - 60, PY + PH + 30, TA[0] + 80, TA[1] + 20, E(u, 0.9, 1.5), MUT, { dash: '5 4' }); grow(PX + PW / 2 - 60, PY + PH + 34, TB[0] + 80, TB[1], E(u, 1.1, 1.7), MUT, { dash: '5 4' });
      sub(PX + PW / 2, PY + PH / 2, '소스 선택권이 target으로 넘어간다', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const gx = PX + 20, gy = PY + 40, gw = PW - 40, gh = PH - 60;
    src('prom', TA[0] - 70, TA[1], { s: k === 2 ? pop(u, 0.2) : 1 }); card(TA[0] + 60, TA[1], 130, 36, { rx: 6, text: 'A · PromQL', fs: 14, mono: true, stroke: BAD, color: BAD });
    spark(gx, gy, gw, gh, k === 2 ? E(u, 0.8, 2.0) : 1, BAD);
    if (k === 2) { dot([[TA[0] + 125, TA[1]], [gx, gy + 40]], seg(u, 0.4, 0.9), BAD, 6); return; }
    src('sql', TB[0] - 70, TB[1], { s: k === 3 ? pop(u, 0.2) : 1 }); card(TB[0] + 60, TB[1], 130, 36, { rx: 6, text: 'B · SQL', fs: 14, mono: true, stroke: INFO, color: INFO });
    const DP = [0.33, 0.72];
    DP.forEach((f, i) => { const x = gx + gw * f, sh = k === 3 ? E(u, 0.8 + i * 0.4, 1.2 + i * 0.4) : 1; el('line', { x1: x, y1: gy + gh, x2: x, y2: gy + gh - gh * sh, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
      el('circle', { cx: x, cy: gy + gh - gh * sh, r: 5, fill: INFO, opacity: sh }); });
    if (k === 3) { mono(380, 400, 'SELECT deployed_at AS time, 1 AS deploy …', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.4) }); sub(PX + PW / 2, 345, '배포 직후 지표가 바뀌는지 한 그래프에서', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4 가장 느린 쿼리
    [['A', 0.25, BAD], ['B', 1, INFO]].forEach(([r, len, col], i) => { const y = 330 + i * 40, g = E(u, 0.2, 2.2), w = 300 * Math.min(1, g / len);
      mono(380, y + 18, r, { 'font-size': 15, 'font-weight': 800, fill: col }); el('rect', { x: 410, y, width: 300, height: 24, rx: 4, fill: SOFT }); el('rect', { x: 410, y, width: w, height: 24, rx: 4, fill: col, opacity: 0.8 });
      if (g >= len) check(730, y + 12, 9, 1); });
    if (u < 2.2) { el('rect', { x: gx, y: gy, width: gw, height: gh, fill: PANEL, opacity: 0.8 }); tx(PX + PW / 2, PY + PH / 2 + 10, '모든 target을 기다리는 중', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT }); }
    sub(840, 400, '가장 느린 B가 로딩 시간을 정한다', fade(u, 1.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }

  // ========== 5. datasource 변수 ==========
  const ENV = ['Prometheus dev', 'Prometheus staging', 'Prometheus prod'];
  function s5(t, c) { const { k, u } = c;
    // 보드 머리줄 + 변수 드롭다운
    el('rect', { x: 30, y: 24, width: 900, height: 44, rx: 6, fill: INK });
    tx(46, 52, 'Service Health', { 'font-size': 15, 'font-weight': 700, fill: PANEL });
    if (k === 0) { mono(300, 51, 'templating.list: []', { 'font-size': 14.5, fill: OFF, opacity: fade(u, 0.3) }); sub(480, 200, '변수가 없으면 드롭다운도 없다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const cur = k === 1 ? null : k === 3 && u > 1.5 ? 1 : k === 5 ? 2 : 2;
    mono(300, 51, 'ds', { 'font-size': 15, fill: OFF, 'font-weight': 700 });
    el('rect', { x: 330, y: 32, width: 230, height: 28, rx: 5, fill: 'none', stroke: k === 2 ? ACC : OFF, 'stroke-width': k === 2 ? 2.4 : 1.4 });
    mono(342, 51, cur == null ? '선택 ▾' : ENV[cur] + ' ▾', { 'font-size': 14, fill: PANEL });
    // 소스들
    const SX = [180, 480, 780];
    ENV.forEach((n, i) => { const on = cur === i; dbIcon(SX[i], 330, n, { stroke: on ? BAD : k >= 1 ? INK : OFF, s: 0.8 }); });
    if (k === 1) { const L = [['Prometheus dev', 1], ['Prometheus staging', 1], ['Prometheus prod', 1], ['Loki', 0], ['AppDB (postgres)', 0]];
      L.forEach(([n, ok], i) => { const y = 92 + i * 30, op = fade(u, 0.3 + i * 0.2); el('rect', { x: 330, y, width: 230, height: 28, fill: ok ? PANEL : SOFT, stroke: GRID, opacity: op });
        mono(342, y + 19, n, { 'font-size': 14, fill: ok ? INK : OFF, opacity: op, 'text-decoration': ok ? null : 'line-through' }); });
      mono(600, 120, 'type: datasource', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) }); mono(600, 148, 'query: prometheus', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.8) });
      sub(720, 190, '후보는 prometheus 타입만', fade(u, 1.8), { 'font-size': 15 }); return; }
    // 패널
    panelBox(330, 100, 300, 120, '요청량'); mono(346, 150, 'uid: "${ds}"', { 'font-size': 15, 'font-weight': 800, fill: k === 3 ? ACC : INK });
    mono(346, 182, 'rate(http_requests_total[5m])', { 'font-size': 13.5, fill: k === 4 ? ACC : MUT, 'font-weight': k === 4 ? 700 : 400 });
    if (k === 2) { sub(780, 130, 'current = Prometheus prod', fade(u, 0.4), { class: 'mono', 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); sub(780, 160, '지금 보는 환경', fade(u, 0.9), { 'font-size': 14.5 }); return; }
    const tgt = cur, from = [480, 220];
    if (k === 3) { const prev = u > 1.5 ? 2 : 2, g = E(u, 0.3, 0.9); if (u <= 1.5) grow(from[0], from[1], SX[2], 280, g, ACC); else grow(from[0], from[1], SX[1], 280, E(u, 1.5, 2.1), ACC);
      sub(780, 130, '드롭다운만 바꾸면 소스가 바뀐다', fade(u, 0.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); sub(780, 160, '환경별 보드 복제가 필요 없다', fade(u, 1.0), { 'font-size': 14.5 }); return; }
    if (k === 4) { [2, 1, 0].forEach((i, j) => fly(from[0], from[1], SX[i], 280, seg(u, 0.2 + j * 0.6, 0.8 + j * 0.6), 'rate(…)', { mono: true }));
      sub(780, 130, '쿼리는 그대로, 소스만 바뀐다', fade(u, 0.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); sub(780, 160, '지표 이름이 환경마다 같아야 한다', fade(u, 1.0), { 'font-size': 14.5 }); return; }
    // k5 권한
    grow(from[0], from[1], SX[2], 280, 1, BAD); lock(SX[2] + 60, 300, true, BAD, pop(u, 0.4));
    el('rect', { x: 332, y: 196, width: 296, height: 22, fill: PANEL }); mono(346, 212, 'No data', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
    sub(780, 130, '전환은 됐지만 조회 권한이 없다', fade(u, 1.2), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); sub(780, 160, '변수와 소스 권한을 같이 점검', fade(u, 1.8), { 'font-size': 14.5 }); }

  const quiz = [
    { q: 'access: proxy로 둔 데이터 소스에 패널이 쿼리하면 요청은 어떤 길로 가는가?',
      o: ['브라우저가 백엔드에 바로 간다', '브라우저 → Grafana 서버 → 백엔드', 'Grafana가 저장해 둔 사본을 읽는다'], a: 1,
      why: 'proxy는 Grafana 서버가 대신 호출하는 방식이라 백엔드 주소와 인증이 브라우저에 드러나지 않는다. Grafana는 데이터를 저장하지 않는다.' },
    { q: 'PostgreSQL 비밀번호를 provisioning 파일에 넣는 올바른 방법은 무엇인가?',
      o: ['secureJsonData에 환경변수 ${APP_DB_PASSWORD}로 넣는다', 'jsonData에 평문으로 넣는다', 'url에 user:password@host로 붙인다'], a: 0,
      why: 'secureJsonData는 암호화 저장되고 API로도 값이 다시 나오지 않는다. 값은 환경변수로 주입해 git에 남지 않게 한다.' },
    { q: 'Prometheus·Loki·PostgreSQL 패널이 같은 시각화 코드로 그려지는 이유는 무엇인가?',
      o: ['세 백엔드가 같은 쿼리 언어를 써서', 'Grafana가 데이터를 한곳에 복사해 두어서', '각 결과가 공통 data frame으로 바뀌어 패널에 들어가서'], a: 2,
      why: '쿼리 언어는 PromQL·LogQL·SQL로 다르지만 플러그인이 결과를 시간·값 표인 data frame으로 바꿔 넘긴다.' },
    { q: 'Mixed 패널에서 A는 빨리 끝나고 B가 느리면 패널은 언제 그려지는가?',
      o: ['B까지 끝난 뒤', 'A가 끝나자마자 A만', 'B는 건너뛰고 A만 영구히'], a: 0,
      why: 'Mixed 소스는 모든 target 결과가 모인 뒤에 한꺼번에 패널로 넘긴다. 그래서 가장 느린 B가 로딩 시간을 정한다.' },
    { q: 'datasource 변수 ds를 만들었을 때 패널의 datasource uid 자리에 넣는 값은 무엇인가?',
      o: ['"prom-default"', '"${ds}"', '"-- Mixed --"'], a: 1,
      why: 'uid를 하드코딩하지 않고 ${ds}로 두면 보드 위 드롭다운에서 고른 소스로 바뀐다.' },
  ];

  const summary = [
    'Grafana는 데이터를 저장하지 않고, 바깥 백엔드를 플러그인으로 연결해 그린다.',
    '연결은 URL과 인증으로 정하고, Save & test가 초록으로 끝나야 도달이 확인된다.',
    '비밀번호는 secureJsonData와 환경변수로 넣고 대시보드 계정은 읽기 전용으로 둔다.',
    '소스마다 쿼리 언어는 달라도 결과는 같은 data frame이 되어 패널에 들어간다.',
  ];
  const review = [
    { q: 'staging을 고르면 그래프가 잘 나오는데 prod를 고르면 빈 패널이 뜬다. 쿼리는 같다. 먼저 의심할 것은?',
      o: ['PromQL 문법 오류', 'prod 소스에 대한 조회 권한', 'gridPos 크기'], a: 1,
      why: '같은 쿼리가 다른 환경에서는 동작하므로 문법 문제는 아니다. 소스 전환은 되어도 권한이 없으면 데이터가 비어 보인다.' },
    { q: '보드를 다른 Grafana로 옮겼더니 패널마다 소스를 못 찾는다. 소스 이름은 같다. 원인으로 가장 그럴듯한 것은?',
      o: ['패널이 소스를 이름이 아니라 uid로 가리키는데 uid가 달라서', 'isDefault가 false라서', 'timeout이 30초라서'], a: 0,
      why: '대시보드 JSON은 datasource의 uid를 참조한다. provisioning에서 uid를 같은 값으로 고정하면 옮겨도 연결이 유지된다.' },
    { q: '지표 그래프에 배포 시각을 겹치려고 PostgreSQL 쿼리를 PromQL 패널 target에 그대로 붙였더니 에러가 났다. 바른 방법은?',
      o: ['쿼리를 PromQL로 다시 쓴다', 'timeout을 늘린다', '패널 소스를 Mixed로 두고 그 target만 PostgreSQL로'], a: 2,
      why: '한 소스에는 그 소스의 언어만 통한다. Mixed로 두면 target마다 자기 소스와 언어를 따로 고를 수 있다.' },
  ];

  R.page({ title: 'Grafana 데이터 소스', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
