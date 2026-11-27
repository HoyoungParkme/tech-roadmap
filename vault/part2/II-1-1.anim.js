/* II-1-1 database secret (PostgreSQL 동적 사용자) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 인스턴스마다 붙은 DB 계정, Vault 금고와 PostgreSQL 사이의 관리자 연결, CREATE ROLE 틀에 값이 채워지는 모습,
 *       pg_roles 표에 임시 계정이 생기고 지워지는 모습. 숫자는 페이지 코드 주석·설명(100개, 137개, 1h, 24h)에서만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, server, person, cross, check, lock, clock, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO } = C;

  // ---------- 공통 부품 ----------
  // Vault 금고: 다이얼이 달린 판. o.paths 는 안에 마운트된 경로
  function vault(cx, cy, w, h, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    const dx = -w / 2 + 26, dy = -h / 2 + 26;
    el('circle', { cx: dx, cy: dy, r: 13, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + (o.spin || 0); el('line', { x1: dx, y1: dy, x2: dx + Math.cos(a) * 9, y2: dy + Math.sin(a) * 9, stroke: ACC, 'stroke-width': 2 }, g); }
    tx(dx + 22, dy + 6, 'Vault', { 'font-size': 17, 'font-weight': 800, fill: ACC }, g);
    return g; }
  // 표: cols [[머리, 폭]], rows [[칸...], {style}]. 칸 하나 높이 rh
  function table(x, y, cols, rows, o) { o = o || {}; const rh = o.rh || 30, w = cols.reduce((a, c) => a + c[1], 0);
    el('rect', { x, y, width: w, height: rh * (rows.length + 1) + 6, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    if (o.title) tx(x, y - 10, o.title, { 'font-size': 14, 'font-weight': 700, fill: MUT });
    let cx = x; cols.forEach(([h, cw]) => { mono(cx + 12, y + rh * 0.68, h, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); cx += cw; });
    el('line', { x1: x + 6, y1: y + rh + 2, x2: x + w - 6, y2: y + rh + 2, stroke: GRID, 'stroke-width': 1.5 });
    rows.forEach(([cells, st], i) => { st = st || {}; const yy = y + rh * (i + 1) + 4, op = st.op ?? 1; if (op <= 0.01) return;
      if (st.hot) el('rect', { x: x + 4, y: yy + 1, width: w - 8, height: rh - 3, rx: 5, fill: st.bg || ACCBG, opacity: op });
      let xx = x; cells.forEach((v, j) => { mono(xx + 12, yy + rh * 0.66, v, { 'font-size': 14, 'font-weight': j === 0 ? 700 : 500, fill: st.col || INK, opacity: op, 'text-decoration': st.gone ? 'line-through' : null }); xx += cols[j][1]; });
      if (st.gone) el('line', { x1: x + 8, y1: yy + rh / 2, x2: x + 8 + (w - 16) * (st.cut ?? 1), y2: yy + rh / 2, stroke: BAD, 'stroke-width': 2.2, opacity: op }); });
    return { w, h: rh * (rows.length + 1) + 6 }; }
  // 한 줄 명령 (터미널 한 줄 모양). u 0→1 만큼 타이핑
  function cmd(x, y, s, u, o) { o = o || {}; const w = o.w || tw('$ ' + s, 14) + 28; el('rect', { x, y: y - 20, width: w, height: 30, rx: 7, fill: INK, opacity: o.op ?? 1 });
    mono(x + 12, y, '$ ' + s.slice(0, Math.round(s.length * clamp(u ?? 1))), { 'font-size': 14, fill: PANEL, opacity: o.op ?? 1 }); }

  // ---------- 1. 공유 계정의 문제 ----------
  const BX = (i) => 400 + (i % 5) * 112, BY = (i) => 70 + Math.floor(i / 5) * 84;
  const NAMES = ['app-1', 'app-2', 'app-3', 'app-4', 'app-5', 'app-6', '…', 'app-98', 'app-99', 'app-100'];
  function boxes(tag, o) { o = o || {};
    NAMES.forEach((n, i) => { const x = BX(i), y = BY(i), st = (o.style && o.style(i)) || {};
      card(x, y, 100, 62, { rx: 8, stroke: st.stroke || INK, sw: st.sw || 2, fill: st.fill, s: st.s });
      tx(x, y - 9, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: st.s ?? 1 });
      if (n !== '…') { const t = typeof tag === 'function' ? tag(i) : tag; if (t) mono(x, y + 17, t[0], { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: t[1] || BAD, opacity: t[2] ?? 1 }); } }); }
  function envFile(x, y, u) {
    el('rect', { x, y, width: 300, height: 128, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 24, 'app/.env', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    ['DB_HOST=db.internal', 'DB_USER=app', 'DB_PASSWORD=prod-super-secret'].forEach((s, i) =>
      mono(x + 14, y + 56 + i * 26, s, { 'font-size': 14.5, fill: i ? BAD : INK, 'font-weight': i ? 700 : 500, opacity: u == null ? 1 : fade(u, 0.2 + i * 0.3) })); }
  function s1(t, c) { const { k, u } = c;
    envFile(40, 40, k === 0 ? u : null);
    const copied = (i) => (k === 0 ? fade(u, 1.3 + i * 0.12, 0.3) : 1);
    if (k === 0) NAMES.forEach((n, i) => { if (n !== '…') dot([[340, 120], [BX(i), BY(i) + 12]], seg(u, 0.8 + i * 0.12, 1.3 + i * 0.12), BAD, 6); });
    boxes(k === 3 ? null : (i) => ['user=app', BAD, copied(i)], {
      style: (i) => k === 2 && i === 8 ? { stroke: BAD, sw: 3, fill: BADBG } : k === 3 ? { stroke: ACC, fill: ACCBG } : {} });
    if (k === 0) tx(680, 250, '인스턴스 100개가 같은 값을 들고 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
    if (k === 1) { // pg_stat_activity: 137 접속이 모두 app
      const n = Math.round(lerp(0, 137, E(u, 0.6, 2.0)));
      table(40, 210, [['usename', 150], ['count', 150]], [[['app', String(n)], { hot: true, bg: BADBG, col: BAD, op: fade(u, 0.5) }]], { title: 'pg_stat_activity', rh: 32 });
      for (let i = 0; i < 40; i++) { const x0 = 70 + (i % 20) * 12, y0 = 312 + Math.floor(i / 20) * 16; el('circle', { cx: x0, cy: y0, r: 4.5, fill: BAD, opacity: fade(u, 0.6 + i * 0.035, 0.15) }); }
      tx(40, 370, '접속 137개가 전부 user=app', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(680, 262, '누가 무엇을 했는지 구분할 수 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 2) { // 유출: 어느 인스턴스인지 모른다, 회수는 전부 재배포
      person(860, 330, '외부인', { stroke: BAD });
      fly(BX(8), BY(8) + 20, 830, 320, seg(u, 0.2, 1.0), 'prod-super-secret', { fill: BAD, mono: true, stay: true });
      NAMES.forEach((n, i) => { if (n !== '…') tx(BX(i) + 40, BY(i) - 22, '?', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.0 + i * 0.05) }); });
      const p = E(u, 1.3, 2.6); tx(40, 236, '회수 = 비밀번호 변경 + 전 서비스 재배포', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      el('rect', { x: 40, y: 252, width: 300, height: 20, rx: 5, fill: SOFT }); el('rect', { x: 40, y: 252, width: 300 * p, height: 20, rx: 5, fill: WARN });
      mono(40, 296, `재배포 ${Math.round(100 * p)} / 100`, { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
      tx(40, 322, '그동안 장애', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 3) { // 대안: 요청마다 전용 계정
      NAMES.forEach((n, i) => { if (n === '…') return; const s = pop(u, 0.3 + i * 0.1);
        mono(BX(i), BY(i) + 17, 'v-…' + 'abcdefghij'[i] + (i + 1), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: s }); });
      tx(40, 236, '요청마다 그 요청 전용 계정', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      tx(40, 262, '짧게 살고, 이름으로 출처가 보인다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
      banner(680, 300, 'database secret engine', pop(u, 1.9)); } }

  // ---------- 2. connection ----------
  const VX = 230, VY = 210, DX = 820;
  function s2(t, c) { const { k, u } = c;
    vault(VX, VY, 260, 220, { spin: k === 0 ? E(u, 0.2, 1.4) * 2 : 2 });
    dbIcon(DX, VY, 'PostgreSQL');
    if (k === 0) cmd(40, 40, 'vault secrets enable database', E(u, 0.1, 1.0));
    pill(VX, VY - 50, 'database/', ACC, k === 0 ? pop(u, 1.2) : 1, { mono: true, fs: 15 });
    if (k === 0) { sub(VX, VY + 10, '엔진만 켠 상태', fade(u, 1.6)); tx(DX, VY + 100, 'Vault는 아직 이 DB를 모른다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // 연결 선: Vault ↔ DB (관리자 계정)
    const lu = k === 1 ? E(u, 1.6, 2.4) : 1;
    grow(VX + 130, VY + 80, DX - 50, VY + 80, lu, ACC);
    if (lu > 0.9) { lock(560, VY + 58, true, ACC); mono(588, VY + 64, 'vault-admin', { 'font-size': 14, 'font-weight': 700, fill: ACC }); }
    if (k === 1) { // config 카드
      const rows = [['plugin', 'postgresql'], ['url', '…@db:5432/app'], ['username', 'vault-admin'], ['password', '••••••••']];
      tx(410, 52, 'database/config/my-postgres', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
      el('rect', { x: 400, y: 62, width: 330, height: 132, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      rows.forEach(([a, b], i) => { const op = k === 1 ? fade(u, 0.2 + i * 0.3) : 1;
        mono(414, 90 + i * 30, a, { 'font-size': 14, fill: MUT, opacity: op }); mono(520, 90 + i * 30, b, { 'font-size': 14, 'font-weight': 700, opacity: op }); });
      sub(VX, VY + 10, '관리자 자격은 Vault 안에만', fade(u, 1.8)); }
    if (k === 2) { // 자리표시자 + allowed_roles 관문
      spans(400, 70, [['postgresql://', {}], ['{{username}}', { fill: ACC, 'font-weight': 700 }], [':', {}], ['{{password}}', { fill: ACC, 'font-weight': 700 }], ['@db:5432/app', {}]], { 'font-size': 14.5, opacity: fade(u, 0.2) });
      tx(400, 98, '두 자리는 Vault가 연결할 때 채운다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      tx(400, 150, 'allowed_roles = my-role', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.9) });
      fly(430, 190, 700, 190, seg(u, 1.2, 2.2), 'my-role', { mono: true, stay: true }); if (u > 2.2) check(760, 190, 10);
      const r2 = E(u, 1.4, 2.2); pill(lerp(430, 560, r2), 232, 'other-role', BAD, r2 > 0 ? 1 : 0, { mono: true, fs: 13.5 });
      if (r2 >= 1) cross(640, 232, 9);
      sub(VX, VY + 10, '이 연결을 쓸 role을 좁힌다', fade(u, 1.8)); }
    if (k === 3) { // 다시 읽어 보면 비밀번호는 없다
      cmd(400, 52, 'vault read database/config/my-postgres', E(u, 0.1, 0.8), { w: 470 });
      table(400, 84, [['Key', 150], ['Value', 210]], [
        [['allowed_roles', '[my-role]'], { op: fade(u, 0.9) }],
        [['connection_url', '…@db:5432/app'], { op: fade(u, 1.1) }],
        [['password', '(응답에 없음)'], { op: fade(u, 1.4), gone: true, col: OFF, cut: E(u, 1.6, 2.2) }]], { rh: 30 });
      sub(VX, VY + 10, '등록한 값은 다시 못 읽는다', fade(u, 2.0)); }
    if (k === 4) { // 앱은 관리자 계정을 모른다
      card(560, 110, 250, 60, { rx: 10, stroke: INK, sw: 2, text: '앱\n관리자 계정을 모른다', fs: 15, s: pop(u, 0.2) });
      grow(560, 140, VX + 135, VY - 20, E(u, 0.6, 1.3), INK);
      grow(660, 140, DX - 30, VY - 50, E(u, 1.0, 1.6), BAD, { dash: '6 6', plain: true }); if (u > 1.6) cross(745, 155, 10, pop(u, 1.6));
      sub(VX, VY + 10, 'DB에 임시 계정을 대신 만든다', fade(u, 1.8));
      banner(480, 380, 'Vault ↔ PostgreSQL 연결 완료', pop(u, 2.1)); } }

  // ---------- 3. role: CREATE ROLE 틀 ----------
  const SQL = [['CREATE ROLE "', '{{name}}', '"'], ['  WITH LOGIN PASSWORD \'', '{{password}}', '\''], ['  VALID UNTIL \'', '{{expiration}}', '\';']];
  const FILL = ['v-token-my-role-Ab12', 'A1!xYz9LpQrStU', '발급 + 1h'];
  function sqlCard(x, y, filled, o) { o = o || {};
    el('rect', { x, y, width: 470, height: 128, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 24, 'creation_statements', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    SQL.forEach(([a, ph, b], i) => { const f = filled ? filled[i] : 0, v = f > 0.5 ? FILL[i] : ph;
      spans(x + 14, y + 56 + i * 26, [[a, {}], [v, { fill: f > 0.5 ? GOOD : ACC, 'font-weight': 700 }], [b, {}]], { 'font-size': 14.5, opacity: o.op ? o.op[i] : 1 }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { sqlCard(30, 40, null, { op: [fade(u, 0.2), fade(u, 0.5), fade(u, 0.8)] });
      [['{{name}}', '임시 사용자명'], ['{{password}}', '임의 비밀번호'], ['{{expiration}}', '만료 시각']].forEach(([a, b], i) => { const s = pop(u, 1.2 + i * 0.3);
        pill(640, 70 + i * 50, a, ACC, s, { mono: true, fs: 14 }); tx(740, 75 + i * 50, b, { 'font-size': 15, opacity: fade(u, 1.3 + i * 0.3) }); });
      tx(30, 230, 'creds 요청이 올 때마다 Vault가 세 자리를 채워 실행한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    const filled = k === 1 ? [E(u, 0.3, 0.9), E(u, 0.8, 1.4), E(u, 1.3, 1.9)] : [1, 1, 1];
    sqlCard(30, 40, filled);
    // 만들어진 계정 카드
    const acc = k === 1 ? pop(u, 2.0) : 1, gone = k === 3 ? E(u, 1.2, 2.0) : 0;
    card(740, 104, 380 - 120, 100, { rx: 10, stroke: gone > 0.5 ? OFF : GOOD, sw: 2.5, fill: gone > 0.5 ? SOFT : GOODBG, s: acc });
    mono(625, 90, 'v-token-my-role-Ab12', { 'font-size': 14, 'font-weight': 800, fill: gone > 0.5 ? OFF : GOOD, opacity: acc, 'text-decoration': gone > 0.5 ? 'line-through' : null });
    tx(625, 116, 'LOGIN · 발급 + 1h에 만료', { 'font-size': 14, fill: gone > 0.5 ? OFF : INK, opacity: acc });
    if (k === 1) tx(30, 230, 'VALID UNTIL: DB 계정 자체도 만료 시각을 안다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
    if (k === 2) { // 권한 칸: SELECT 만
      const P = [['SELECT', true], ['INSERT', false], ['UPDATE', false], ['DELETE', false], ['DROP', false]];
      mono(30, 214, 'GRANT SELECT ON ALL TABLES IN SCHEMA public', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      P.forEach(([n, ok], i) => { const x = 60 + i * 150, s = pop(u, 0.6 + i * 0.25);
        card(x + 50, 280, 128, 50, { rx: 8, stroke: ok ? GOOD : GRID, fill: ok ? GOODBG : PANEL, sw: 2, text: n, fs: 15, mono: true, color: ok ? GOOD : OFF, s });
        if (ok) check(x + 50, 330, 10, s); else cross(x + 50, 330, 8, s); });
      tx(30, 384, '유출돼도 읽기 이상은 못 한다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }
    if (k === 3) { // revocation_statements
      el('rect', { x: 30, y: 196, width: 470, height: 70, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: fade(u, 0.2) });
      mono(44, 220, 'revocation_statements (선택)', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      mono(44, 248, 'DROP ROLE IF EXISTS "{{name}}";', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) });
      fly(500, 230, 700, 130, seg(u, 0.7, 1.3), 'DROP ROLE', { fill: WARN, mono: true });
      tx(625, 180, '만료 때 실행된다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
      tx(30, 300, '비워 두면 플러그인의 기본 회수 동작을 쓴다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 4) { // TTL 두 값: 1h / 24h
      const ax = R.axes(80, 240, 780, 70, { x: [0, 24], y: [0, 1], xt: [0, 1, 6, 12, 18, 24], xl: '발급 후 시간 (h)' });
      const g1 = E(u, 0.3, 1.0), g2 = E(u, 1.0, 2.0);
      el('rect', { x: ax.X(0), y: 254, width: (ax.X(1) - ax.X(0)) * g1, height: 22, rx: 4, fill: ACC });
      mono(ax.X(1) + 10, 271, 'default_ttl 1h', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      el('rect', { x: ax.X(0), y: 284, width: (ax.X(24) - ax.X(0)) * g2, height: 16, rx: 4, fill: WARN, opacity: 0.35 });
      el('line', { x1: ax.X(24), y1: 230, x2: ax.X(24), y2: 310, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.9) });
      mono(ax.X(24), 222, 'max_ttl 24h', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      tx(80, 380, 'TTL은 짧게, 권한은 최소로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // ---------- 4. 발급: database/creds ----------
  const AX = 90, A1 = 120, A2 = 290, QX = 460, QY = 150, PX = 810;
  const ROLES = [['v-token-my-role-Ab12…', 'LOGIN'], ['v-token-my-role-Cd34…', 'LOGIN']];
  function pgRoles(n, o) { o = o || {}; const rows = [[['vault-admin', 'CREATEROLE'], {}]];
    for (let i = 0; i < n; i++) rows.push([ROLES[i], { hot: true, bg: GOODBG, col: GOOD, op: o.op ? o.op[i] : 1 }]);
    table(600, 270, [['rolname', 230], ['attr', 120]], rows, { title: 'pg_roles', rh: 30 }); }
  function s4(t, c) { const { k, u } = c;
    vault(QX, QY, 230, 190);
    dbIcon(PX, 120, 'PostgreSQL');
    server(AX, A1, 'app-1', { s: 0.8 });
    if (k === 0) { const s = pop(u, 0.2);
      card(QX, QY + 10, 200, 100, { rx: 8, stroke: ACC, sw: 2, s });
      mono(QX - 88, QY - 18, 'roles/my-role', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: s });
      ['db_name=my-postgres', 'default_ttl=1h', 'max_ttl=24h'].forEach((r, i) => mono(QX - 88, QY + 8 + i * 22, r, { 'font-size': 13.5, opacity: fade(u, 0.6 + i * 0.3) }));
      fly(QX, 370, QX, QY + 50, seg(u, 0.3, 1.2), 'role-statements.sql', { fill: INK, mono: true });
      pgRoles(0); tx(40, 380, 'connection과 role이 갖춰졌다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    mono(QX - 90, QY + 2, 'roles/my-role', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    if (k === 1) {
      dot([[AX + 50, A1], [QX - 115, A1]], seg(u, 0.2, 0.9), ACC, 7);
      pill(215, 66, 'read database/creds/my-role', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      fly(QX + 115, QY, PX - 50, 130, seg(u, 1.1, 2.1), 'CREATE ROLE', { mono: true });
      pgRoles(1, { op: [fade(u, 2.1)] });
      tx(40, 380, '요청 순간 DB에 계정이 생긴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    const resp = (op) => { el('rect', { x: 30, y: 256, width: 380, height: 132, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      [['lease_id', 'database/creds/my-role/Hk9aB…'], ['lease_duration', '1h'], ['username', 'v-token-my-role-Ab12…'], ['password', 'A1!xYz9LpQrStU']].forEach(([a, b], i) => {
        mono(44, 282 + i * 28, a, { 'font-size': 13.5, fill: MUT, opacity: op }); mono(170, 282 + i * 28, b, { 'font-size': 13.5, 'font-weight': 700, fill: i < 2 ? ACC : INK, opacity: op }); }); };
    if (k === 2) { fly(QX - 115, QY + 20, AX + 40, A1 + 40, seg(u, 0.2, 1.0), 'lease + 계정', { mono: false });
      resp(fade(u, 0.9)); pgRoles(1); clock(QX + 80, QY + 40, 20, 1 - E(u, 1.4, 2.8) * 0.08, WARN, '1h'); return; }
    if (k === 3) { resp(1);
      const g = E(u, 0.2, 1.4); el('path', { d: `M${AX + 40},${A1 - 30} Q${QX},${-20} ${PX - 46},${100}`, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '1200', 'stroke-dashoffset': 1200 * (1 - g) });
      pill(QX, 34, 'user=v-token-my-role-Ab12', GOOD, pop(u, 1.3), { mono: true, fs: 13.5 });
      pgRoles(1); tx(600, 226, 'DB 로그에도 이 이름이 찍힌다', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k4: app-2 는 다른 계정
    server(AX, A2, 'app-2', { s: 0.8, op: pop(u, 0.2) });
    dot([[AX + 50, A2], [QX - 60, QY + 95]], seg(u, 0.4, 1.0), ACC, 7);
    fly(QX + 115, QY + 40, PX - 50, 150, seg(u, 1.0, 1.7), 'CREATE ROLE', { mono: true });
    pgRoles(2, { op: [1, fade(u, 1.7)] });
    [['Hk9aB…', 'app-1'], ['Lm3…', 'app-2']].forEach(([id, who], i) => { const op = i ? fade(u, 1.8) : 1;
      mono(180, 330 + i * 30, `lease ${id}`, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op }); mono(320, 330 + i * 30, `TTL 1h · ${who}`, { 'font-size': 14, opacity: op }); });
    tx(180, 400, '같은 명령, 다른 계정', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ---------- 5. lease 생애: renew · revoke · 만료 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) {
      const ax = R.axes(70, 60, 500, 130, { x: [0, 3], y: [0, 1], xt: [0, 1, 2, 3], xl: '발급 후 시간 (h)' });
      tx(ax.X(3), 48, '상한 max_ttl 24h →', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' });
      // Ab12: 1h 로 발급, 50분에 renew 하면 끝이 그 시점 + 1h 로 밀린다. Cd34: 5분 뒤 발급, renew 없음
      const end = k === 0 ? lerp(1, 1.83, E(u, 1.0, 1.8)) : 1.83, now = k === 0 ? lerp(0, 0.83, E(u, 0.2, 1.0)) : 0.83;
      el('rect', { x: ax.X(0), y: 84, width: ax.X(end) - ax.X(0), height: 26, rx: 4, fill: ACC, opacity: k >= 1 ? 0.3 : 1 });
      mono(ax.X(0) + 8, 102, 'Ab12', { 'font-size': 14, 'font-weight': 700, fill: k >= 1 ? INK : PANEL });
      const cEnd = k === 2 ? 1.08 : lerp(0.08, 1.08, k === 0 ? 1 : 1);
      el('rect', { x: ax.X(0.08), y: 124, width: ax.X(cEnd) - ax.X(0.08), height: 26, rx: 4, fill: INFO, opacity: k === 2 ? 1 - 0.7 * E(u, 1.4, 2.0) : 1 });
      mono(ax.X(0.08) + 8, 142, 'Cd34', { 'font-size': 14, 'font-weight': 700, fill: PANEL });
      if (k === 2) { const nx = lerp(0.83, 1.08, E(u, 0.2, 1.4)); el('line', { x1: ax.X(nx), y1: 116, x2: ax.X(nx), y2: 158, stroke: BAD, 'stroke-width': 2.5 }); }
      if (k === 0) el('line', { x1: ax.X(now), y1: 76, x2: ax.X(now), y2: 118, stroke: INK, 'stroke-width': 2.5 });
      if (k === 0) { tx(ax.X(now), 70, 'renew', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.0) });
        cmd(40, 250, 'vault lease renew database/creds/my-role/Hk9aB…', E(u, 0.1, 0.9), { w: 560 });
        mono(40, 290, 'lease_duration   1h  (지금부터 다시)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
        tx(40, 330, '계정은 그대로, 기한만 민다. 상한은 max_ttl', { 'font-size': 15, opacity: fade(u, 2.0) }); }
      const rows = [[['v-token-my-role-Ab12…'], { hot: true, bg: GOODBG, col: GOOD }], [['v-token-my-role-Cd34…'], { hot: true, bg: GOODBG, col: GOOD }]];
      if (k >= 1) { rows[0][1] = { gone: true, col: OFF, cut: k === 1 ? E(u, 1.2, 1.8) : 1 }; }
      if (k === 2) rows[1][1] = { gone: true, col: OFF, cut: E(u, 1.4, 2.0), op: 1 - E(u, 2.1, 2.6) };
      table(640, 70, [['rolname', 290]], rows, { title: 'pg_roles (v-token%)', rh: 32 });
      if (k === 1) { cmd(40, 250, 'vault lease revoke database/creds/my-role/Hk9aB…', E(u, 0.1, 0.8), { w: 560 });
        fly(600, 250, 760, 130, seg(u, 0.8, 1.4), 'DROP ROLE', { fill: BAD, mono: true });
        mono(40, 290, 'Success! Revoked lease', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
        tx(40, 330, '유출이 의심되면 만료를 기다리지 않는다', { 'font-size': 15, opacity: fade(u, 1.9) }); }
      if (k === 2) { const f = 1 - E(u, 0.2, 1.4); clock(440, 300, 34, f, WARN, f > 0.01 ? `${Math.round(60 * f)}m 남음` : 'TTL 0');
        tx(40, 270, '아무것도 안 해도 TTL이 끝나면', { 'font-size': 15, opacity: fade(u, 0.2) });
        tx(40, 296, 'Vault가 DROP ROLE을 실행한다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
        mono(640, 210, '(0 rows)', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.4) }); }
      return; }
    if (k === 3) { // 감사 로그
      tx(40, 50, 'audit log (file/)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const L = [['09:00', 'app-1', 'read  database/creds/my-role', ACC], ['09:05', 'app-2', 'read  database/creds/my-role', ACC], ['09:50', 'app-1', 'renew  …/Hk9aB…', INFO], ['10:20', 'ops', 'revoke …/Hk9aB…', BAD]];
      L.forEach(([tm, who, what, col], i) => { const y = 90 + i * 52, op = fade(u, 0.3 + i * 0.4, 0.3), dx = lerp(30, 0, E(u, 0.3 + i * 0.4, 0.7 + i * 0.4));
        el('rect', { x: 40 + dx, y: y - 22, width: 760, height: 38, rx: 6, fill: SOFT, opacity: op });
        mono(56 + dx, y + 3, tm, { 'font-size': 14, fill: MUT, opacity: op }); mono(130 + dx, y + 3, who, { 'font-size': 14, 'font-weight': 700, opacity: op }); mono(230 + dx, y + 3, what, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: op }); });
      sub(420, 330, '시각은 예시', fade(u, 2.0));
      tx(420, 370, '발급·갱신·회수가 lease_id와 함께 남는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k4: 정적 vs 동적
    [['정적 공유 계정', BAD, ['계정 1개를 100개가 공유', '수명 무기한', '출처 추적 불가']], ['동적 임시 계정', GOOD, ['요청마다 새 계정', 'TTL 1h, 상한 24h', 'lease_id로 추적']]].forEach(([h, col, rows], j) => {
      const x = 70 + j * 430, s = pop(u, 0.2 + j * 0.6);
      card(x + 180, 200, 380, 250, { rx: 12, stroke: col, sw: 2.5, s });
      tx(x + 180, 110, h, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: s });
      rows.forEach((r, i) => { const op = fade(u, 0.4 + j * 0.6 + i * 0.2); (j ? check : cross)(x + 40, 160 + i * 52, 9, op); tx(x + 64, 166 + i * 52, r, { 'font-size': 16, opacity: op }); }); });
    tx(480, 380, '만료와 회수 때 DROP ROLE이 자동으로 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: '여러 서비스가 DB 계정 app 하나를 공유할 때 생기는 문제는 무엇인가?',
      o: ['DB 접속 수가 137개로 제한된다', '유출돼도 어느 인스턴스에서 샜는지 알 수 없고 회수하려면 전부 재배포해야 한다', 'app 계정은 SELECT만 할 수 있다'], a: 1,
      why: 'DB 로그에는 137개 접속이 모두 user=app으로 찍힌다. 비밀번호를 바꾸면 100개 인스턴스를 다시 배포해야 한다.' },
    { q: 'database/config/my-postgres에 등록한 vault-admin 계정은 누가 쓰는가?',
      o: ['Vault만 쓴다. 임시 계정을 만들고 지우는 데 쓴다', '앱이 DB에 접속할 때 쓴다', 'allowed_roles에 적힌 사람이 쓴다'], a: 0,
      why: '관리자 자격은 Vault 안에만 있고 다시 읽어도 password는 돌아오지 않는다. 앱은 Vault가 만들어 준 임시 계정만 받는다.' },
    { q: 'creation_statements의 {{expiration}} 자리에는 무엇이 들어가는가?',
      o: ['max_ttl 24h 뒤의 시각', '임의로 만든 비밀번호', 'default_ttl을 기준으로 한 만료 시각'], a: 2,
      why: 'Vault가 발급할 때 default_ttl(1h)로 만료 시각을 계산해 VALID UNTIL에 넣는다. 그래서 DB 계정 스스로도 언제 끝나는지 안다.' },
    { q: '두 인스턴스가 같은 vault read database/creds/my-role을 실행하면 어떻게 되는가?',
      o: ['같은 계정을 나눠 받는다', '각자 다른 계정과 다른 lease_id를 받는다', '두 번째 요청은 거부된다'], a: 1,
      why: '요청마다 CREATE ROLE이 새로 실행된다. app-1은 Ab12, app-2는 Cd34처럼 계정이 달라 출처를 가릴 수 있다.' },
    { q: 'lease를 renew 하면 무엇이 바뀌는가?',
      o: ['계정은 그대로이고 만료 시각만 밀린다', '새 사용자명과 비밀번호가 나온다', 'max_ttl이 24h에서 48h로 늘어난다'], a: 0,
      why: 'renew는 같은 계정의 TTL을 다시 채운다. 다만 발급 후 max_ttl 24h를 넘길 수는 없다.' },
  ];

  const summary = [
    '계정 하나를 100개 인스턴스가 나눠 쓰면 유출돼도 출처를 모르고 회수하려면 전부 재배포해야 한다.',
    'Vault를 관리자 계정으로 PostgreSQL에 연결해 두면 앱 대신 임시 계정을 만들고 지운다.',
    'role에는 CREATE ROLE 틀과 최소 권한, default_ttl 1h와 max_ttl 24h를 적는다.',
    'creds를 읽을 때마다 새 계정이 생기고 TTL이 끝나거나 revoke 하면 DROP ROLE로 사라진다.',
  ];
  const review = [
    { q: '임시 계정 비밀번호가 로그에 찍혔다. TTL은 아직 남아 있다. 가장 먼저 할 일은?',
      o: ['TTL이 끝날 때까지 기다린다', '그 lease_id를 revoke 한다', 'vault-admin 비밀번호를 바꾼다'], a: 1,
      why: 'revoke 하면 Vault가 곧바로 DROP ROLE을 실행해 그 계정이 사라진다. 다른 인스턴스의 계정은 그대로 남는다.' },
    { q: 'pg_stat_activity에 접속이 모두 user=app으로 보인다. 이 상태에서 빠진 것은?',
      o: ['인스턴스마다 다른 계정을 발급하는 database creds 요청', '더 큰 커넥션 풀', 'GRANT ALL 권한'], a: 0,
      why: '공유 계정이면 누가 접속했는지 구분할 수 없다. creds를 요청마다 받으면 v-token-my-role-Ab12처럼 이름이 갈린다.' },
    { q: '임시 계정이 유출돼 누군가 테이블을 지우려 했지만 실패했다. 막아 준 설정은?',
      o: ['allowed_roles', 'max_ttl 24h', 'creation_statements의 GRANT SELECT'], a: 2,
      why: 'role의 SQL이 SELECT만 주었기 때문에 쓰기와 DROP은 처음부터 권한이 없다. TTL은 수명을, GRANT는 피해 범위를 줄인다.' },
  ];

  R.page({ title: '동적 DB 사용자 생명주기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
