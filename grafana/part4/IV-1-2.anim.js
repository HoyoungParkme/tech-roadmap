/* IV-1-2 Datasource provisioning — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 데이터소스 목록(datasources: name·type·url·status·isDefault·secret·env)은 페이지 STEPS 의 beat 데이터를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, dbIcon, server, browser, tokens } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 지역 도우미 ──
  function code(x, y, w, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = o.lh || fs + 11, n = o.n ?? lines.length;
    el('rect', { x, y, width: w, height: lines.length * lh + 18, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    for (let i = 0; i < lines.length; i++) { const vis = clamp(n - i); if (vis <= 0) break; let s = lines[i]; if (vis < 1) s = s.slice(0, Math.max(1, Math.round(s.length * vis)));
      const yy = y + 9 + i * lh;
      if (o.hl && o.hl.includes(i)) el('rect', { x: x + 5, y: yy + 1, width: w - 10, height: lh - 2, rx: 5, fill: o.hlc || ACCBG });
      spans(x + 14, yy + lh / 2 + fs * 0.36, tokens(s), { 'font-size': fs, opacity: o.rowOp ? o.rowOp(i) : 1 }); }
    return (i) => y + 9 + i * lh + lh / 2; }
  function fileCard(cx, cy, name, sub2, o) { o = o || {}; const w = o.w || 190, h = 64, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('path', { d: `M${-w / 2},${-h / 2} H${w / 2 - 14} L${w / 2},${-h / 2 + 14} V${h / 2} H${-w / 2} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, 'stroke-dasharray': o.dash }, g);
    mono(-w / 2 + 12, -4, name, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || INK }, g);
    if (sub2) mono(-w / 2 + 12, 18, sub2, { 'font-size': 13.5, fill: MUT }, g); return g; }
  const TC = { prometheus: ACC, loki: INFO, postgres: WARN };
  // Connections › Data sources 목록 (beat.datasources)
  function dsList(x, y, w, c, o) { o = o || {}; const list = c.beat.datasources || [], prev = (c.prev && c.prev.datasources) || [];
    el('rect', { x, y, width: w, height: o.h || 300, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 });
    el('rect', { x, y, width: w, height: 34, rx: 10, fill: INK }); el('rect', { x, y: y + 24, width: w, height: 10, fill: INK });
    tx(x + 14, y + 23, 'Connections › Data sources', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL });
    if (!list.length) sub(x + w / 2, y + 120, '등록된 데이터소스 없음', 1, { 'font-size': 14.5 });
    list.forEach((d, i) => { const p = prev.find((q) => q.name === d.name), isNew = !p, yy = y + 46 + i * (o.rh || 82), s = isNew ? pop(c.u, 0.3) : 1;
      const changed = p && (p.url !== d.url || p.status !== d.status || p.isDefault !== d.isDefault), col = TC[d.type] || INK;
      const g = R.G(x + w / 2, yy + 34, s);
      el('rect', { x: -w / 2 + 12, y: -34, width: w - 24, height: 68, rx: 8, fill: d.status === 'live' ? GOODBG : SOFT, stroke: changed || isNew ? ACC : GRID, 'stroke-width': changed || isNew ? 2.2 : 1.4 }, g);
      el('rect', { x: -w / 2 + 12, y: -34, width: 7, height: 68, rx: 3, fill: col }, g);
      tx(-w / 2 + 30, -8, d.name, { 'font-size': 15, 'font-weight': 800 }, g);
      if (o.compact) { if (d.isDefault) mono(w / 2 - 20, -8, '★', { 'font-size': 15, fill: ACC, 'text-anchor': 'end' }, g); mono(-w / 2 + 30, 18, d.url, { 'font-size': 13.5 }, g); return; }
      mono(-w / 2 + 30 + tw(d.name, 15) + 10, -8, d.type, { 'font-size': 13.5, fill: MUT }, g);
      mono(-w / 2 + 30, 18, d.url, { 'font-size': 13.5, fill: d.url.startsWith('(') ? MUT : INK }, g);
      const tags = []; if (d.isDefault) tags.push(['default', ACC]); if (d.status === 'manual') tags.push(['UI 수동', WARN]); if (d.secret && !d.env) tags.push(['평문 비번', BAD]); if (d.env) tags.push(['env', GOOD]); if (d.status === 'live') tags.push(['등록 완료', GOOD]);
      let tx0 = w / 2 - 20; tags.slice().reverse().forEach(([s2, cc]) => { const tw2 = tw(s2, 13.5) + 18; card(tx0 - tw2 / 2, -10, tw2, 24, { rx: 12, text: s2, fs: 13.5, stroke: cc, color: cc, sw: 1.6, p: g }); tx0 -= tw2 + 6; }); }); }

  // 1. UI 수동 등록의 함정
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { // 브라우저 폼
      el('rect', { x: 40, y: 46, width: 420, height: 290, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }); el('line', { x1: 40, y1: 76, x2: 460, y2: 76, stroke: INK, 'stroke-width': 2 });
      [0, 14, 28].forEach((d) => el('circle', { cx: 56 + d, cy: 61, r: 4, fill: OFF })); tx(110, 66, 'Add data source', { 'font-size': 14.5, 'font-weight': 700 });
      const url = 'http://localhost:9090', typed = k === 0 ? url.slice(0, Math.round(url.length * E(u, 0.9, 2.2))) : url;
      [['① 종류', 'Prometheus', k === 0 ? fade(u, 0.3) : 1], ['② URL', typed + (k === 0 && u < 2.3 && u > 0.9 ? '▏' : ''), k === 0 ? fade(u, 0.8) : 1], ['   인증', 'No Authentication', k === 0 ? fade(u, 1.8) : 1]].forEach(([a, v, op], i) => {
        const y = 110 + i * 62; tx(62, y, a, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op }); el('rect', { x: 62, y: y + 8, width: 376, height: 32, rx: 6, fill: SOFT, stroke: GRID, opacity: op }); mono(74, y + 30, v, { 'font-size': 14.5, opacity: op }); });
      card(370, 306, 120, 34, { rx: 8, text: '③ Save & test', fs: 14, stroke: ACC, color: PANEL, fill: ACC, s: k === 0 ? pop(u, 2.2) : 1 });
      el('circle', { cx: k === 0 ? lerp(120, 360, E(u, 0.2, 2.3)) : 360, cy: k === 0 ? lerp(130, 300, E(u, 0.2, 2.3)) : 300, r: 7, fill: WARN, opacity: 0.9 });
      if (k === 0) sub(250, 380, '전부 사람 손으로 입력', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 1) { dot([[430, 306], [560, 220], [650, 190]], seg(u, 0.2, 1.0), ACC, 8); dbIcon(700, 180, 'grafana.db', { s: 1 });
        card(700, 290, 240, 40, { rx: 8, text: 'Prometheus · UI 수동', fs: 14, stroke: WARN, color: INK, s: pop(u, 1.0) });
        fileCard(700, 380, 'datasources.yaml', '없음', { w: 200, dash: '6 5', stroke: MUT, op: fade(u, 1.5) }); cross(810, 370, 10, pop(u, 1.8)); }
      return; }
    if (k === 2) { // 컨테이너 재생성 → 소실
      const re = E(u, 0.3, 1.2); zone(60, 60, 300, 230, 'grafana 컨테이너 (old)', { stroke: BAD, dash: '6 5', op: 1 - re * 0.5 }); dbIcon(210, 180, 'grafana.db', { op: 1 - re * 0.6 });
      cross(210, 170, 26, pop(u, 1.0)); grow(370, 175, 470, 175, E(u, 1.0, 1.5), MUT);
      zone(480, 60, 300, 230, 'grafana 컨테이너 (new)', { stroke: INK, op: fade(u, 1.2) }); sub(630, 180, '데이터소스 0개', fade(u, 1.5), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      [['재생성하면 사라짐', BAD], ['환경마다 다를 수 있음', WARN], ['Git 이력 없음', WARN], ['오타·누락이 조용히', WARN]].forEach(([s, col], i) => pill(140 + i * 220, 340, s, col, pop(u, 1.6 + i * 0.2), { fs: 14 }));
      return; }
    if (k === 3) { fileCard(170, 170, 'datasources.yaml', 'name · type · url', { w: 230, s: pop(u, 0.2), stroke: ACC });
      grow(290, 170, 520, 170, E(u, 0.6, 1.3), ACC); pill(405, 145, '부팅 때 읽는다', ACC, pop(u, 0.9), { fs: 14 });
      server(640, 165, 'Grafana', { lamp: E(u, 1.3, 1.6) > 0.5 ? GOOD : OFF }); fly(520, 170, 800, 170, seg(u, 1.6, 2.6), 'Prometheus 등록', { stay: true });
      sub(480, 320, '클릭 대신 선언', fade(u, 2.0), { 'font-size': 16, fill: INK, 'font-weight': 800 }); return; }
    if (k === 4) { const segs = ['/etc', '/grafana', '/provisioning', '/datasources', '/*.yaml'];
      let x = 120; segs.forEach((s, i) => { const w = tw(s, 17) + 18, op = fade(u, 0.2 + i * 0.35); el('rect', { x, y: 150, width: w, height: 44, rx: 6, fill: i >= 3 ? ACCBG : SOFT, stroke: i >= 3 ? ACC : GRID, opacity: op });
        mono(x + 9, 178, s, { 'font-size': 17, 'font-weight': 700, fill: i >= 3 ? ACC : INK, opacity: op }); x += w + 4; });
      sub(480, 250, 'Grafana 가 부팅할 때 반드시 훑는 고정 경로', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    // k5 IaC: Git 이력 + 환경 간 동일
    el('line', { x1: 80, y1: 120, x2: lerp(80, 520, E(u, 0.2, 1.4)), y2: 120, stroke: MUT, 'stroke-width': 3 });
    ['add prometheus', 'add loki', 'tls on'].forEach((s, i) => { const x = 130 + i * 160, op = fade(u, 0.4 + i * 0.35); el('circle', { cx: x, cy: 120, r: 9, fill: ACC, opacity: op }); mono(x, 100, s, { 'font-size': 13.5, 'text-anchor': 'middle', opacity: op }); });
    sub(300, 160, '커밋 메시지는 예시', fade(u, 1.0));
    fileCard(300, 270, 'datasources.yaml', '진실의 원천', { w: 220, stroke: ACC, s: pop(u, 1.2) });
    ['staging', 'prod'].forEach((n, i) => { const y = 200 + i * 130; grow(412, 270, 640, y, E(u, 1.5, 2.1), ACC); zone(650, y - 40, 250, 80, n, { stroke: GOOD, op: fade(u, 1.8) }); mono(670, y + 22, 'Prometheus · Loki', { 'font-size': 14, opacity: fade(u, 2.0) }); check(870, y, 10, pop(u, 2.2)); }); }

  // 2. YAML 기본 구조
  const CORE = ['apiVersion: 1', 'datasources:', '  - name: Prometheus', '    type: prometheus', '    uid: prom-main', '    access: proxy', '    url: http://prometheus:9090', '    isDefault: true', '    editable: false', '  - name: Loki', '    type: loki', '    url: http://loki:3100'];
  function s2(t, c) { const { k, u } = c;
    if (k === 5) { // proxy vs direct
      tx(40, 46, 'access 두 가지', { 'font-size': 16, 'font-weight': 800 });
      browser(120, 150, 150, 100, '브라우저'); browser(120, 320, 150, 100, '브라우저');
      server(470, 150, 'Grafana 서버', {}); dbIcon(800, 150, 'Prometheus'); dbIcon(800, 320, 'Prometheus');
      grow(198, 150, 410, 150, E(u, 0.2, 0.8), ACC); grow(530, 150, 752, 150, E(u, 0.8, 1.4), ACC); dot([[198, 150], [410, 150], [530, 150], [752, 150]], seg(u, 1.4, 2.4), ACC, 7);
      pill(300, 122, 'proxy (권장)', GOOD, pop(u, 0.3), { fs: 14 }); sub(640, 194, '인증 정보는 서버에만', fade(u, 1.2), { fill: GOOD, 'font-weight': 700 });
      grow(198, 320, 752, 320, E(u, 1.0, 1.8), BAD); pill(470, 292, 'direct', BAD, pop(u, 1.0), { fs: 14 }); sub(470, 356, 'CORS 설정 필요 · 주소·인증이 브라우저에 노출', fade(u, 1.8), { fill: BAD, 'font-weight': 700, 'font-size': 14 });
      return; }
    const hlMap = [[0, 1], [2, 3, 4], [5, 6], [7, 8], [9, 10, 11], [], [4]], when = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4];
    const rowOp = (i) => (when[i] < k || (k === 6) ? 1 : when[i] === k ? fade(u, 0.2 + (i % 3) * 0.3) : 0.12);
    code(40, 44, 430, CORE, { fs: 14.5, lh: 27, hl: hlMap[k], rowOp });
    if (k < 6) dsList(510, 44, 410, c, { h: 300 });
    if (k === 1) pill(715, 370, 'uid: prom-main — 대시보드가 붙잡는 고정 키', ACC, pop(u, 1.0), { fs: 13.5 });
    if (k === 2) pill(715, 370, 'Grafana 서버가 이 주소로 대신 호출', INFO, pop(u, 1.0), { fs: 14 });
    if (k === 3) { lock(890, 186, true, INK, pop(u, 1.0)); sub(800, 190, 'UI 수정 잠금', fade(u, 1.1), { 'font-size': 14 }); pill(715, 370, '새 패널의 기본값 · UI 수정 잠금', ACC, pop(u, 0.8), { fs: 14 }); }
    if (k === 6) { // uid 로 참조
      code(520, 60, 400, ['"datasource": {', '  "type": "prometheus",', '  "uid": "prom-main"', '}'], { fs: 14.5, lh: 28, hl: [2] });
      card(720, 260, 300, 70, { rx: 10, stroke: ACC, sw: 2.4, s: pop(u, 0.4) }); el('rect', { x: 576, y: 230, width: 7, height: 60, rx: 3, fill: ACC, opacity: fade(u, 0.5) });
      const rn = E(u, 1.2, 1.8); mono(590, 255, 'Prometheus', { 'font-size': 15, 'font-weight': 800, fill: rn > 0.3 ? MUT : INK, 'text-decoration': rn > 0.3 ? 'line-through' : null }); mono(690, 255, '→ Metrics (예시)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: rn });
      mono(600, 280, 'uid prom-main', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      grow(700, 150, 720, 222, E(u, 0.5, 1.0), ACC); check(845, 282, 10, pop(u, 2.0)); sub(720, 330, '이름이 바뀌어도 패널은 그대로 연결', fade(u, 2.1), { fill: INK, 'font-size': 14.5 }); } }

  // 3. jsonData vs secureJsonData
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { fileCard(150, 120, 'core.yaml', 'Prometheus · Loki', { w: 210 }); fileCard(150, 250, 'postgres.yaml', 'Postgres', { w: 210, s: pop(u, 0.3), stroke: ACC });
      grow(258, 120, 440, 180, E(u, 0.6, 1.3), MUT); grow(258, 250, 440, 190, E(u, 0.8, 1.5), ACC);
      zone(450, 110, 220, 150, 'datasources/ 폴더', { stroke: INK }); mono(470, 170, '모든 *.yaml', { 'font-size': 15, opacity: fade(u, 1.2) }); mono(470, 200, '→ 합쳐서 로드', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
      dsList(700, 60, 240, c, { h: 300, rh: 82, compact: true }); return; }
    // 공통: 왼쪽 Postgres 카드, 가운데 두 상자, 오른쪽 Grafana/API
    card(150, 80, 220, 76, { rx: 10, stroke: WARN, sw: 2.2, s: k === 1 ? pop(u, 0.2) : 1 }); tx(56, 70, 'Postgres', { 'font-size': 16, 'font-weight': 800, fill: WARN }); mono(56, 96, 'db:5432 · grafana_ro', { 'font-size': 13.5, opacity: k === 1 ? fade(u, 0.6) : 1 });
    if (k === 1) { sub(150, 150, 'user 는 노출돼도 되는 값', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); dsList(510, 60, 410, c, { h: 300, rh: 80 }); return; }
    const JD = ['database: orders', 'sslmode: require', 'maxOpenConns: 10', 'postgresVersion: 1500', 'timescaledb: false'];
    zone(40, 140, 300, 220, 'jsonData — 평문', { stroke: INFO }); JD.forEach((s, i) => mono(60, 180 + i * 34, s, { 'font-size': 14.5, opacity: k === 2 ? fade(u, 0.3 + i * 0.25) : 1 }));
    if (k >= 3) { zone(370, 140, 260, 220, 'secureJsonData — 비밀', { stroke: BAD }); lock(500, 290, true, BAD, pop(u, k === 3 ? 1.4 : 0));
      const enc = k === 3 ? E(u, 1.0, 1.8) : 1; mono(390, 190, 'password:', { 'font-size': 14.5 }); mono(490, 190, enc < 0.5 ? 'CHANGE_ME' : '●●●●●●', { 'font-size': 14.5, fill: enc < 0.5 ? BAD : MUT });
      if (k === 3) sub(500, 240, '한 번 읽고 암호화 저장', fade(u, 1.8), { fill: INK, 'font-size': 14 }); }
    if (k === 2) sub(190, 390, 'API 로 그대로 조회되는 값만 둔다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 });
    if (k >= 4) { const leak = k === 5, L = leak ? ['GET /api/datasources/uid/pg-orders', '"jsonData": {', '  "database": "orders",', '  "password": "CHANGE_ME"', '},'] : ['GET /api/datasources/uid/pg-orders', '"jsonData": {', '  "database": "orders", …', '},', '"secureJsonFields": { "password": true }'];
      code(650, 60, 290, L, { fs: 13.5, lh: 26, hl: leak ? [3] : [4], hlc: leak ? BADBG : GOODBG, rowOp: (i) => fade(u, 0.2 + i * 0.25) });
      if (k === 4) sub(795, 230, '값이 아니라 "있다"만 돌려준다', fade(u, 1.6), { fill: GOOD, 'font-weight': 700, 'font-size': 14 });
      if (k === 5) { el('rect', { x: 48, y: 180 + 5 * 34 - 22, width: 284, height: 30, rx: 6, fill: BADBG, stroke: BAD, opacity: fade(u, 0.4) }); mono(60, 180 + 5 * 34, 'password: CHANGE_ME', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.4) });
        sub(795, 230, '평문이 그대로 새어 나간다', fade(u, 1.6), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); }
      return; }
    if (k === 3) { server(800, 200, 'Grafana', { lamp: GOOD }); dot([[630, 190], [740, 200]], seg(u, 0.3, 1.0), BAD, 7); } }

  // 4. 시크릿을 env 로
  const VARS = [['PG_HOST', 'db'], ['PG_PORT', '"5432"'], ['PG_USER', 'grafana_ro'], ['PG_DB', 'orders'], ['PG_PASSWORD', '${PG_PASSWORD}']];
  function s4(t, c) { const { k, u } = c;
    const yl = ['url: ${PG_HOST}:${PG_PORT}', 'user: ${PG_USER}', 'jsonData:', '  database: ${PG_DB}', '  sslmode: require', 'secureJsonData:', '  password: ${PG_PASSWORD}'];
    if (k <= 4) { const when = [0, 0, 1, 1, 1, 2, 2], hl = k === 0 ? [0, 1] : k === 1 ? [3] : k === 2 ? [6] : [];
      const row = code(40, 50, 420, yl, { fs: 15, lh: 34, hl, rowOp: (i) => (when[i] < k ? 1 : when[i] === k ? fade(u, 0.2 + i * 0.1) : 0.15) });
      if (k === 2) { const g = E(u, 0.2, 0.9); mono(470, row(6) + 5, 'CHANGE_ME', { 'font-size': 15, fill: BAD, opacity: 1 - g * 0.7, 'text-decoration': 'line-through' }); sub(240, 330, 'YAML 에는 변수 이름만 남는다', fade(u, 1.2), { fill: INK, 'font-size': 15, 'font-weight': 700 }); }
      if (k === 1) sub(240, 330, 'sslmode 는 어디서나 같아 상수로 둔다', fade(u, 1.0), { fill: INK, 'font-size': 14.5 });
      if (k === 0) sub(240, 330, '환경마다 다른 값은 변수로 뺀다', fade(u, 1.0), { fill: INK, 'font-size': 14.5 });
      if (k >= 3) { zone(560, 46, 360, 230, 'compose environment', { stroke: INK }); VARS.forEach(([n, v], i) => { const op = k === 3 ? fade(u, 0.3 + i * 0.25) : 1, y = 92 + i * 38;
          mono(580, y, n + ':', { 'font-size': 14.5, 'font-weight': 700, opacity: op }); mono(730, y, v, { 'font-size': 14.5, fill: i === 4 ? WARN : INK, opacity: op }); });
        if (k === 3) sub(740, 306, '값은 런타임이 안다', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); }
      if (k === 4) { const res = ['url: db:5432', 'user: grafana_ro', 'database: orders', 'password: ●●●●●● (.env 에서)'];
        [[0, 0], [1, 0], [2, 1], [3, 3], [4, 6]].forEach(([vi, li], j) => grow(560, 92 + vi * 38 - 5, 462, row(li), E(u, 0.2 + j * 0.2, 0.6 + j * 0.2), ACC));
        zone(560, 290, 360, 118, '치환된 결과', { stroke: GOOD, op: fade(u, 1.4) }); res.forEach((s, i) => mono(580, 330 + i * 22, s, { 'font-size': 14, fill: i === 3 ? MUT : INK, opacity: fade(u, 1.5 + i * 0.2) })); }
      return; }
    if (k === 5) { zone(60, 80, 330, 200, '호스트', { stroke: INK }); fileCard(225, 170, './provisioning/', 'datasources/*.yaml', { w: 250 });
      zone(570, 80, 340, 200, 'grafana 컨테이너', { stroke: ACC }); el('rect', { x: 590, y: 145, width: 300, height: 50, rx: 8, fill: ACCBG, stroke: ACC, opacity: fade(u, 1.2) }); mono(604, 176, '/etc/grafana/provisioning', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      grow(352, 170, 588, 170, E(u, 0.4, 1.2), ACC); pill(470, 140, 'volumes', ACC, pop(u, 0.4), { mono: true, fs: 14 });
      sub(480, 340, '이 마운트가 없으면 Grafana 는 yaml 을 보지 못한다', fade(u, 1.6), { fill: INK, 'font-size': 15 }); return; }
    // k6 공개 저장소 vs secret store
    zone(60, 60, 380, 260, 'Git 저장소 (공개해도 안전)', { stroke: GOOD }); fileCard(250, 150, 'postgres.yaml', 'password: ${PG_PASSWORD}', { w: 300 }); check(250, 240, 14, pop(u, 0.8));
    sub(250, 290, '비밀이 한 글자도 없다', fade(u, 0.9), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 });
    zone(520, 60, 380, 260, 'secret store', { stroke: BAD }); ['Vault', 'K8s Secret', '.env (git 제외)'].forEach((s, i) => { card(710, 120 + i * 60, 240, 44, { rx: 8, text: s, fs: 15, stroke: BAD, s: pop(u, 1.0 + i * 0.3) }); });
    lock(860, 300, true, BAD, pop(u, 1.8)); }

  // 5. 부팅 시 자동 로드
  function s5(t, c) { const { k, u } = c;
    zone(40, 46, 420, 330, 'grafana:11.3.0  ·  3000:3000', { stroke: k >= 3 ? GOOD : INK });
    // env 칸
    VARS.forEach(([n], i) => { const show = k >= 1, op = k === 1 ? fade(u, 0.2 + i * 0.2) : show ? 1 : 0.12; card(110 + (i % 3) * 120, 100 + Math.floor(i / 3) * 40, 112, 30, { rx: 6, text: n, fs: 13.5, mono: true, stroke: show ? INK : GRID, color: show ? INK : MUT, sw: 1.4, op }); });
    // 마운트
    const mu = k === 2 ? E(u, 0.2, 1.0) : k > 2 ? 1 : 0; el('rect', { x: 60, y: 190, width: 380, height: 44, rx: 8, fill: mu ? ACCBG : SOFT, stroke: mu ? ACC : GRID, 'stroke-dasharray': mu ? null : '6 5' });
    mono(74, 218, mu ? './provisioning → /etc/grafana/provisioning' : '(마운트 없음)', { 'font-size': 13.5, fill: mu ? ACC : MUT, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.6) : 1 });
    // 부팅 막대
    const bp = k === 3 ? E(u, 0.2, 1.8) : k > 3 ? 1 : 0; el('rect', { x: 60, y: 270, width: 380, height: 16, rx: 8, fill: SOFT }); el('rect', { x: 60, y: 270, width: 380 * bp, height: 16, rx: 8, fill: GOOD });
    mono(60, 312, k < 3 ? (k === 0 ? 'docker compose up -d 전' : '부팅 대기') : 'datasources/*.yaml 읽음', { 'font-size': 14, fill: k >= 3 ? GOOD : MUT, 'font-weight': 700 });
    if (k === 0) sub(250, 350, '정의만으로는 아무것도 등록되지 않는다', fade(u, 0.6), { fill: INK, 'font-size': 14 });
    dsList(500, 46, 420, c, { h: 290, rh: 80 });
    if (k === 4) { card(710, 375, 400, 40, { rx: 10, text: '파일 수정 → 재시작 또는 POST …/datasources/reload', fs: 14, stroke: WARN, s: pop(u, 0.3) });
      card(250, 395, 400, 34, { rx: 10, text: 'isDefault: true 둘 → 로드 실패', fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.0) }); }
    if (k === 5) { card(710, 378, 400, 40, { rx: 10, text: 'url 은 ${ENV} · editable: false', fs: 14.5, mono: true, stroke: GOOD, s: pop(u, 0.3) }); lock(250, 392, true, GOOD, pop(u, 0.8)); } }

  const quiz = [
    { q: 'UI에서 Save & test로 등록한 데이터소스 설정은 어디에만 남나?',
      o: ['Grafana 내부 DB(grafana.db)', '/etc/grafana/provisioning 아래 yaml 파일', 'Git 저장소'], a: 0,
      why: 'UI 저장은 grafana.db에만 들어가고 파일이 남지 않는다. 컨테이너를 새로 띄우면 다시 클릭해야 한다.' },
    { q: 'access: proxy로 둔 데이터소스는 누가 백엔드를 호출하나?',
      o: ['사용자의 브라우저', 'Grafana 서버', 'Prometheus가 Grafana를 호출한다'], a: 1,
      why: 'proxy면 Grafana 서버가 url로 대신 호출해 주소와 인증이 브라우저에 드러나지 않는다.' },
    { q: 'Postgres 비밀번호를 넣어야 할 블록은 무엇인가?',
      o: ['jsonData', 'datasources 최상위의 user 옆', 'secureJsonData'], a: 2,
      why: 'secureJsonData는 한 번 읽고 암호화 저장되어 API가 값을 돌려주지 않는다. jsonData에 넣으면 /api/datasources 응답에 평문으로 나온다.' },
    { q: 'YAML에 password: ${PG_PASSWORD}라고 쓰면 실제 비밀번호는 어디서 오나?',
      o: ['Grafana 컨테이너의 환경변수(.env·secret에서 주입)', 'YAML 파일 맨 아래 주석', 'grafana.db에 미리 넣어 둔 값'], a: 0,
      why: 'provisioning은 $VAR와 ${VAR}를 환경변수로 치환한다. 파일에는 이름만 남아 Git에 올려도 안전하다.' },
    { q: '컨테이너를 띄운 뒤 datasources yaml의 url을 고쳤다. 바로 반영되나?',
      o: ['30초마다 다시 읽어 곧 반영된다', '반영되지 않는다. 재시작하거나 reload API를 불러야 한다', '저장하는 순간 반영된다'], a: 1,
      why: '데이터소스 provisioning은 부팅할 때 읽는다. 재시작이나 POST /api/admin/provisioning/datasources/reload가 필요하다.' },
  ];

  const summary = [
    'UI에서 클릭으로 등록한 데이터소스는 grafana.db에만 남아 재현도 리뷰도 안 된다.',
    'datasources/*.yaml에 name, type, uid, url, access: proxy를 적으면 부팅 때 자동 등록된다.',
    '평문 설정은 jsonData, 비밀번호는 secureJsonData에 두고 값은 ${PG_PASSWORD} 같은 환경변수로 넣는다.',
    '파일을 고치면 재시작이나 reload API가 필요하고, isDefault는 조직마다 하나만 둔다.',
  ];
  const review = [
    { q: '새로 띄운 Grafana에 Postgres 데이터소스가 보이지만 연결 테스트에서 인증 실패가 난다. 먼저 확인할 것은?',
      o: ['컨테이너에 PG_PASSWORD 환경변수가 실제로 주입됐는지', 'isDefault가 true인지', 'access를 direct로 바꿨는지'], a: 0,
      why: 'YAML의 ${PG_PASSWORD}는 환경변수 값으로 바뀐다. 값이 비어 있으면 데이터소스는 등록돼도 접속에 실패한다.' },
    { q: '보안 점검에서 /api/datasources 응답에 DB 비밀번호가 보였다. 어디를 고쳐야 하나?',
      o: ['access를 proxy로 바꾼다', 'uid를 새로 정한다', 'password를 jsonData에서 secureJsonData로 옮긴다'], a: 2,
      why: 'jsonData는 평문으로 조회된다. secureJsonData로 옮기면 응답에는 secureJsonFields의 password: true만 남는다.' },
    { q: 'Prometheus와 Loki를 둘 다 isDefault: true로 provisioning했더니 Grafana가 데이터소스를 등록하지 않았다. 이유는?',
      o: ['Loki는 provisioning을 지원하지 않는다', '조직마다 기본 데이터소스는 하나만 둘 수 있어 설정 전체가 거절됐다', 'uid가 너무 짧다'], a: 1,
      why: 'Grafana는 한 조직에 default가 둘 이상이면 설정 파일을 잘못된 것으로 보고 로드를 멈춘다.' },
  ];

  R.page({ title: 'Datasource provisioning', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
