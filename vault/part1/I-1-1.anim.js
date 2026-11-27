/* I-1-1 secret engine (KV vs dynamic) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 값(.env 줄, KV 버전, 동적 사용자 이름, TTL)은 페이지 STEPS 의 view 와 코드 블록에서 가져온 것이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 그림 부품 ----------
  // 금고(Vault 서버): 왼쪽 위 기준. 오른쪽 위에 다이얼
  function safe(x, y, w, h, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 3, opacity: o.op ?? 1 });
    const dx = x + w - 28, dy = y + 26, a = o.dial || 0;
    el('circle', { cx: dx, cy: dy, r: 14, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    for (let i = 0; i < 8; i++) { const t = (i / 8) * Math.PI * 2; el('line', { x1: dx + Math.cos(t) * 10, y1: dy + Math.sin(t) * 10, x2: dx + Math.cos(t) * 14, y2: dy + Math.sin(t) * 14, stroke: MUT, 'stroke-width': 1.5, opacity: o.op ?? 1 }); }
    el('line', { x1: dx, y1: dy, x2: dx + Math.cos(a) * 9, y2: dy + Math.sin(a) * 9, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: o.op ?? 1 });
    tx(x + 16, y + 31, o.name || 'Vault 서버', { 'font-size': 16, 'font-weight': 800, opacity: o.op ?? 1 }); }
  // 엔진을 꽂는 자리: 경로 이름 + 엔진 종류. g(0→1) 만큼 왼쪽에서 밀려 들어온다
  function slot(x, y, w, path, type, g, o) { o = o || {}; if (g <= 0) return; const xx = x - (1 - g) * 40, col = o.col || ACC;
    el('rect', { x: xx, y, width: w, height: 38, rx: 8, fill: o.hot ? ACCBG : PANEL, stroke: col, 'stroke-width': o.hot ? 2.6 : 1.8, opacity: g });
    el('rect', { x: xx - 10, y: y + 12, width: 10, height: 14, rx: 2, fill: col, opacity: g });
    mono(xx + 14, y + 25, path, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: g });
    if (type) tx(xx + w - 12, y + 25, type, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 600, opacity: g }); }
  // 문서(.env 파일): 접힌 모서리
  function doc(x, y, w, h, name, o) { o = o || {};
    el('path', { d: `M${x},${y} H${x + w - 22} L${x + w},${y + 22} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    el('path', { d: `M${x + w - 22},${y} V${y + 22} H${x + w}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 14, y + 26, name, { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1 }); }
  // 열쇠 아이콘 (시크릿 한 개)
  function key(cx, cy, col, s) { const g = R.G(cx, cy, s ?? 1);
    el('circle', { cx: -8, cy: 0, r: 7, fill: 'none', stroke: col || WARN, 'stroke-width': 3 }, g);
    el('path', { d: 'M-1,0 H14 M9,0 V6 M14,0 V5', fill: 'none', stroke: col || WARN, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); }
  // 버전 카드 한 장
  function verCard(x, y, w, v, text, o) { o = o || {};
    el('rect', { x, y, width: w, height: 40, rx: 8, fill: o.hot ? ACCBG : PANEL, stroke: o.hot ? ACC : GRID, 'stroke-width': o.hot ? 2.6 : 1.6, opacity: o.op ?? 1 });
    card(x + 26, y + 20, 38, 26, { rx: 6, text: v, fs: 13.5, mono: true, fw: 800, fill: o.hot ? ACC : SOFT, stroke: 'none', color: o.hot ? PANEL : MUT, op: o.op });
    mono(x + 54, y + 25, text, { 'font-size': 14, fill: o.gone ? OFF : INK, opacity: o.op ?? 1, 'text-decoration': o.gone ? 'line-through' : null }); }
  const V = (c) => (c.beat && c.beat.view) || {};

  // ---------- 1. 시크릿을 어디에 둘 것인가 ----------
  const ENV = ['DB_PASSWORD=prod-super-secret-2024', 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE', 'STRIPE_KEY=sk_live_xxxxxxxxxxxx'];
  function s1(t, c) { const { k, u } = c, vw = V(c);
    const small = k >= 1;
    doc(40, 50, 370, small ? 150 : 190, '.env');
    ENV.forEach((ln, i) => { const show = k === 0 ? clamp((u - 0.2 - i * 0.6) / 0.55) : 1; if (show <= 0) return;
      key(66, 94 + i * 34, WARN, 0.8);
      mono(86, 99 + i * 34, ln.slice(0, Math.round(ln.length * show)), { 'font-size': 14, fill: INK }); });
    if (k === 0) {
      zone(560, 50, 360, 190, '중앙 시크릿 저장소', { fill: 'none', stroke: GRID, dash: '6 6' });
      tx(740, 152, (vw.right && vw.right.empty) || '아직 없다', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 0.4) });
      [0, 1, 2].forEach((i) => { const x = 110 + i * 120, s = pop(u, 1.8 + i * 0.2); person(x, 330, null, { s });
        grow(x, 302, x + 20, 246, E(u, 2.0 + i * 0.15, 2.5 + i * 0.15), WARN, { dash: '4 4', plain: true }); });
      tx(500, 340, '파일을 열 수 있으면 누구나 읽는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      return; }
    // 원격 저장소
    const RX = 560, RY = 50;
    zone(RX, RY, 360, 150, 'GitHub 원격 저장소', { fill: SOFT, stroke: INK, sw: 2 });
    if (k === 1) { grow(415, 120, RX - 8, 120, E(u, 0.2, 0.9), ACC, { sw: 3 }); mono(487, 108, 'git push', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) }); }
    const cg = k === 1 ? E(u, 0.8, 1.6) : 1;
    if (cg > 0) { card(RX + 180, RY + 72, 320, 40, { rx: 8, text: 'commit "fix config" · .env 포함', fs: 14, mono: true, stroke: BAD, color: k >= 2 ? OFF : INK, op: cg });
      if (k >= 2) el('line', { x1: RX + 28, y1: RY + 72, x2: RX + 332, y2: RY + 72, stroke: BAD, 'stroke-width': 2.5, opacity: E(u, 0.2, 0.8) }); }
    if (k === 1) { const b = R.bump(u, 1.8); card(RX + 180, RY + 128, 230, 34, { rx: 17, text: 'Secret Scanner 경보', fs: 14.5, fill: BAD, stroke: 'none', color: PANEL, s: pop(u, 1.7) + b });
      tx(225, 260, '이력에 남은 순간 이미 공개된 값이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.1) }); }
    if (k === 2) { pill(RX + 180, RY + 128, 'rebase + force push', MUT, pop(u, 0.2), { mono: true, fs: 13.5 });
      const L = (vw.left && vw.left.rows) || [];
      L.forEach((r, i) => { const x = 160 + i * 300, y = 330, s = pop(u, 0.9 + i * 0.3);
        dot([[RX + 180, RY + 150], [RX + 180, 250], [x, 250], [x, y - 30]], seg(u, 0.6 + i * 0.3, 1.5 + i * 0.3), BAD, 6);
        card(x, y, 220, 58, { rx: 10, text: r.k + '\n' + r.v, fs: 14.5, stroke: BAD, s }); });
      tx(740, 232, '원본만 지워지고 사본은 남는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 3) {
      const L = (vw.left && vw.left.rows) || [], Rr = (vw.right && vw.right.rows) || [];
      L.forEach((r, i) => { const y = 252 + i * 46, op = fade(u, 0.2 + i * 0.3);
        tx(60, y, r.k, { 'font-size': 15.5, 'font-weight': 700, opacity: op }); tx(220, y, r.v, { 'font-size': 15, fill: BAD, opacity: op }); });
      Rr.forEach((r, i) => { const cx = 560 + i * 132, s = pop(u, 1.0 + i * 0.35);
        card(cx + 50, 300, 118, 74, { rx: 12, text: r.k + '\n' + r.v, fs: 15, stroke: ACC, fill: ACCBG, color: INK, s }); });
      tx(740, 365, 'secret engine이 맡는 일', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // ---------- 2. KV v2 ----------
  const KV = { v1: 'username=app · password=p@ss123', v2: 'username=app · password=rotate-2026' };
  const TERM2 = [
    [['$ vault secrets enable -path=secret kv-v2', PANEL], ['Success! Enabled the kv-v2 secrets', null], ['engine at: secret/', null]],
    [['$ vault kv put secret/app/db \\', PANEL], ['    username=app password="p@ss123"', PANEL], ['version            1', null]],
    [['$ vault kv put secret/app/db \\', PANEL], ['    ... password="rotate-2026"', PANEL], ['version            2', null]],
    [['$ vault kv get secret/app/db', PANEL], ['password    rotate-2026', null], ['username    app', null]],
    [['$ vault kv rollback -version=1 \\', PANEL], ['    secret/app/db', PANEL], ['version            3', null]],
  ];
  function s2(t, c) { const { k, u } = c;
    terminal(24, 34, 410, 150, TERM2[k], lerp(0, 3, E(u, 0.1, 1.3)), { title: 'kv-v2.sh', fs: 14 });
    safe(470, 24, 466, 380, { dial: t * 0.8 });
    slot(500, 64, 400, 'secret/', 'kv-v2', k === 0 ? E(u, 0.6, 1.4) : 1, { hot: k === 0 });
    if (k === 0) { tx(700, 160, '경로에 엔진을 꽂는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(700, 186, '다른 경로에는 다른 엔진을 꽂을 수 있다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    mono(512, 132, '└ app/db', { 'font-size': 15, 'font-weight': 800, opacity: k === 1 ? fade(u, 0.3) : 1 });
    // 버전 더미: 최신이 맨 위
    const vers = [['v1', KV.v1]]; if (k >= 2) vers.unshift(['v2', KV.v2]); if (k >= 4) vers.unshift(['v3', KV.v1 + '  (= v1)']);
    const isNew = (i) => (k === 1 && i === 0) || (k === 2 && i === 0) || (k === 4 && i === 0);
    vers.forEach(([v, txt], i) => { const ny = 148 + i * 50, oy = isNew(i) ? null : 148 + Math.max(0, i - 1) * 50;
      const y = isNew(i) ? ny : (k === 2 || k === 4) && oy != null ? lerp(oy, ny, E(u, 0.2, 0.9)) : ny;
      if (isNew(i)) { const g = E(u, 0.8, 1.7); if (g <= 0) return;
        if (g < 1) { fly(430, 120, 700, ny + 20, g, v, { mono: true }); return; } }
      verCard(504, y, 402, v, txt, { hot: i === 0, op: i === 0 ? 1 : 0.75 }); });
    if (k === 2) tx(705, 270, '덮어써도 v1은 지워지지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
    if (k === 3) { [0, 1, 2].forEach((i) => { const y = 238 + i * 58, g = seg(u, 0.4 + i * 0.35, 1.3 + i * 0.35);
        server(80, y + 6, null, { s: 0.42, lamp: g >= 1 ? ACC : OFF });
        if (g > 0 && g < 1) fly(500, 168, 300, y + 6, g, 'rotate-2026', { mono: true });
        if (g >= 1) card(270, y + 6, 190, 32, { rx: 16, text: 'password=rotate-2026', fs: 13.5, mono: true, stroke: INFO, color: INFO }); });
      tx(705, 290, '누가 읽어도 같은 값', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
      tx(705, 316, '그래서 정적(static) 시크릿이다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 4) tx(705, 352, '롤백도 새 버전 v3으로 쌓인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }

  // ---------- 3. 정적의 한계 ----------
  const GX = 44, GY = 70, CS = 26;   // 인스턴스 100개 = 10×10
  function grid100(fn) { for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), q = i % 10, st = fn(i) || {};
    el('rect', { x: GX + q * CS, y: GY + r * CS, width: CS - 5, height: CS - 5, rx: 4, fill: st.fill || WARNBG, stroke: st.stroke || WARN, 'stroke-width': 1.5, opacity: st.op ?? 1 });
    if (st.mark) tx(GX + q * CS + 10.5, GY + r * CS + 16, st.mark, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: st.col || BAD, opacity: st.op ?? 1 }); } }
  function s3(t, c) { const { k, u } = c;
    tx(GX, 52, '앱 인스턴스 100개', { 'font-size': 15, 'font-weight': 700 });
    if (k === 0) {
      grid100((i) => ({ op: clamp(u * 3 - i / 50) }));
      key(170, 358, WARN, 1); mono(192, 363, 'password=rotate-2026', { 'font-size': 14.5, fill: WARN, opacity: fade(u, 0.8) });
      dbIcon(760, 120, 'PostgreSQL', {});
      for (let i = 0; i < 8; i++) dot([[GX + 260, GY + 20 + (i % 5) * 50], [700, 120]], ((t * 0.7 + i / 8) % 1), WARN, 4.5);
      zone(600, 200, 320, 160, 'DB 접속 로그', { fill: SOFT });
      const n = Math.floor(lerp(0, 5, E(u, 0.6, 2.2)));
      for (let i = 0; i < n; i++) mono(620, 250 + i * 22, 'LOG: connection user=app', { 'font-size': 14, fill: INK });
      return; }
    if (k === 1) {
      const leak = 37;
      grid100((i) => ({ mark: u > 1.3 ? '?' : null, stroke: i === leak && u < 1.3 ? BAD : WARN }));
      card(760, 110, 260, 70, { rx: 16, text: 'Slack 제보\n비밀번호가 돌아다닌다', fs: 15, stroke: BAD, s: pop(u, 0.2) });
      fly(GX + 7 * CS, GY + 3 * CS, 700, 120, seg(u, 0.4, 1.2), '••••••', { fill: BAD });
      tx(760, 230, '어느 인스턴스에서 샜나?', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      tx(760, 258, '100개가 같은 값이라 가릴 수 없다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    if (k === 2) {
      const sweep = lerp(0, 100, E(u, 0.9, 2.6));
      grid100((i) => (i < sweep ? { fill: BADBG, stroke: BAD, mark: '↻', col: BAD } : {}));
      ['DB 비밀번호 변경', 'vault kv put 새 값', '인스턴스 100개 재시작'].forEach((s, i) => {
        card(720, 80 + i * 56, 300, 42, { rx: 10, text: (i + 1) + '. ' + s, fs: 15, stroke: i === 2 ? BAD : GRID, color: i === 2 ? BAD : INK, s: pop(u, 0.2 + i * 0.25) }); });
      el('rect', { x: 580, y: 290, width: 280, height: 18, rx: 4, fill: SOFT });
      el('rect', { x: 580, y: 290, width: 280 * clamp(sweep / 100), height: 18, rx: 4, fill: BAD });
      tx(720, 334, '재배포 동안 요청 실패 (다운타임)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      return; }
    grid100((i) => ({ op: 0.35 }));
    const props = (V(c).right && V(c).right.rows) || [];
    props.forEach((r, i) => { const y = 100 + i * 80, s = pop(u, 0.3 + i * 0.4);
      card(720, y, 330, 60, { rx: 12, stroke: ACC, fill: ACCBG, s }); check(580, y, 11, s);
      tx(606, y + 6, r.k + ' · ' + r.v, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.4) }); });
    tx(720, 360, '사용마다 다른 자격을 그 자리에서 발급한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); }

  // ---------- 4. dynamic engine ----------
  const USER = 'v-token-app-7Ab1…';
  function dbTable(x, y, rows) { el('rect', { x, y, width: 260, height: 40 + rows.length * 34, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(x + 14, y + 24, 'PostgreSQL 사용자', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const yy = y + 36 + i * 34, op = r.op ?? 1;
      if (r.hot) el('rect', { x: x + 6, y: yy, width: 248, height: 30, rx: 6, fill: r.gone ? BADBG : ACCBG, opacity: op });
      mono(x + 16, yy + 21, r.name, { 'font-size': 14.5, 'font-weight': 700, fill: r.gone ? OFF : r.hot ? ACC : INK, opacity: op, 'text-decoration': r.gone ? 'line-through' : null });
      if (r.tag) tx(x + 246, yy + 21, r.tag, { 'font-size': 13.5, 'font-weight': 700, fill: r.gone ? BAD : MUT, 'text-anchor': 'end', opacity: op }); }); }
  function s4(t, c) { const { k, u } = c;
    server(90, 150, 'app-1', { lamp: k >= 3 ? ACC : OFF, s: 0.9 });
    safe(230, 40, 330, 320, { dial: t * 0.8 });
    slot(256, 80, 280, 'database/', 'database', k === 0 ? E(u, 0.2, 0.9) : 1, { hot: k === 0 });
    dbIcon(790, 90, null, { s: 0.8 });
    tx(790, 156, 'PostgreSQL', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
    const lg = k === 0 ? E(u, 0.9, 1.7) : 1;
    el('line', { x1: 560, y1: 100, x2: lerp(560, 748, lg), y2: 100, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
    if (lg > 0.9) { lock(650, 86, true, INK, 0.8); mono(654, 128, 'vault-admin', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    if (k === 0) mono(396, 146, '└ config/my-pg', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.6) });
    // role 템플릿
    if (k >= 1) { const g = k === 1 ? E(u, 0.2, 0.9) : 1;
      mono(262, 146, '└ roles/app', { 'font-size': 14.5, 'font-weight': 800, fill: k === 1 ? ACC : INK, opacity: g });
      const lines = ['CREATE ROLE "{{name}}" WITH LOGIN', "  PASSWORD '{{password}}'", "  VALID UNTIL '{{expiration}}';", 'GRANT SELECT ON ALL TABLES …'];
      lines.forEach((s, i) => mono(266, 176 + i * 22, s, { 'font-size': 13.5, fill: i === 3 ? INFO : INK, opacity: k === 1 ? fade(u, 0.6 + i * 0.3) : 0.55 })); }
    if (k === 1) tx(395, 290, 'SELECT만 주면 그 이상은 못 한다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.0) });
    if (k === 2) { const x0 = 262, w = 270;
      tx(x0, 288, 'default_ttl', { 'font-size': 14, 'font-weight': 700 }); tx(x0, 334, 'max_ttl', { 'font-size': 14, 'font-weight': 700 });
      R.hbar(x0, 296, w - 50, 1, 24, { u: E(u, 0.3, 1.0), text: '1h', col: ACC });
      R.hbar(x0, 342, w - 50, 24, 24, { u: E(u, 0.8, 1.8), text: '24h', col: WARN }); }
    // 사용자 표
    const rows = [{ name: 'vault-admin', tag: '관리자' }];
    if (k === 3) { const g = seg(u, 1.0, 1.6); if (g > 0) rows.push({ name: USER, tag: 'CREATE ROLE', hot: true, op: g }); }
    if (k === 4) rows.push({ name: USER, tag: 'DROP ROLE', hot: true, gone: u > 1.3 });
    dbTable(660, 180, rows);
    if (k === 3) { dot([[140, 150], [256, 200]], seg(u, 0.1, 0.6), ACC, 7);
      dot([[540, 210], [660, 250]], seg(u, 0.5, 1.0), ACC, 7);
      const g = seg(u, 1.6, 2.4);
      if (g > 0 && g < 1) fly(400, 240, 110, 262, g, 'lease 1h', { mono: true });
      if (g >= 1) { card(120, 262, 200, 66, { rx: 10, stroke: ACC, fill: ACCBG }); mono(32, 252, 'lease_id …/Hk9…', { 'font-size': 13.5, fill: ACC });
        mono(32, 276, USER, { 'font-size': 13.5, 'font-weight': 700 }); }
      clock(120, 360, 20, 0.02, WARN, null); mono(150, 366, 'TTL 1h', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 4) { const f = E(u, 0.1, 1.2);
      clock(120, 360, 20, f, WARN, null); mono(150, 366, f >= 1 ? '만료' : 'TTL 1h', { 'font-size': 14, fill: f >= 1 ? BAD : WARN, 'font-weight': 700 });
      card(120, 262, 200, 66, { rx: 10, stroke: OFF, op: 1 - E(u, 1.3, 2.0) }); mono(32, 276, USER, { 'font-size': 13.5, fill: OFF, opacity: 1 - E(u, 1.3, 2.0), 'text-decoration': 'line-through' });
      if (u > 1.2) dot([[540, 210], [660, 250]], seg(u, 1.2, 1.7), BAD, 7);
      tx(395, 300, 'Vault가 스스로 회수한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      tx(395, 326, 'lease_id로 발급·회수 이력이 남는다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); } }

  // ---------- 5. 역할 분담 ----------
  const MOUNTS = [['secret/', 'kv', '정적', INFO], ['database/', 'database', '동적', GOOD], ['aws/', 'aws', '동적', GOOD], ['transit/', 'transit', '서비스', WARN], ['pki/', 'pki', '동적', GOOD]];
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { const vw = V(c), L = (vw.left && vw.left.rows) || [], Rr = (vw.right && vw.right.rows) || [];
      [[L, 'KV v2에 두는 것', INFO, 70], [Rr, 'dynamic으로 받는 것', GOOD, 500]].forEach(([rows, title, col, x], j) => {
        tx(x, 64, title, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + j * 0.6) });
        rows.forEach((r, i) => { const y = 92 + i * 74, s = pop(u, 0.4 + j * 0.6 + i * 0.2);
          card(x + 180, y + 28, 360, 58, { rx: 10, stroke: col, s });
          tx(x + 18, y + 34, r.k, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5 + j * 0.6 + i * 0.2) });
          tx(x + 342, y + 34, r.v, { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.5 + j * 0.6 + i * 0.2) }); }); });
      tx(480, 362, '사람이 정하는 값은 보관하고, 만들 수 있는 자격은 발급한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      return; }
    safe(330, 20, 300, 380, { dial: t * 0.8, name: 'vault secrets list' });
    MOUNTS.forEach(([p, ty, tag, col], i) => { const g = k === 0 ? E(u, 0.2 + i * 0.3, 0.8 + i * 0.3) : 1, hot = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i === 2);
      slot(356, 62 + i * 64, 250, p, ty, g, { col: hot ? ACC : col, hot });
      if (k === 0 && g > 0.9) pill(684, 81 + i * 64, tag, col, pop(u, 0.6 + i * 0.3), { fs: 13.5 }); });
    if (k === 1) { [0, 1, 2].forEach((i) => { const y = 90 + i * 100, g = seg(u, 0.3 + i * 0.4, 1.2 + i * 0.4);
        server(80, y, null, { s: 0.42, lamp: g >= 1 ? ACC : OFF });
        if (g > 0 && g < 1) fly(356, 81, 140, y, g, 'sk_live_…', { mono: true });
        if (g >= 1) card(220, y, 170, 32, { rx: 16, text: 'sk_live_…', fs: 14, mono: true, stroke: INFO, color: INFO }); });
      tx(780, 220, '매번 같은 값', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) });
      tx(780, 248, 'Stripe 키는 Vault가 만들 수 없다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 2) { ['v-token-app-7Ab1…', 'v-token-app-…', 'v-token-app-…'].forEach((s, i) => { const y = 90 + i * 100, g = seg(u, 0.3 + i * 0.4, 1.2 + i * 0.4);
        server(80, y, null, { s: 0.42, lamp: g >= 1 ? ACC : OFF });
        if (g > 0 && g < 1) fly(356, 145, 140, y, g, 'TTL 1h', { mono: true });
        if (g >= 1) card(220, y, 180, 32, { rx: 16, text: s, fs: 13.5, mono: true, stroke: GOOD, color: GOOD }); });
      tx(780, 220, '요청마다 다른 사용자', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 3) { const g = seg(u, 0.3, 1.2);
      server(80, 160, null, { s: 0.42, lamp: g >= 1 ? ACC : OFF });
      if (g > 0 && g < 1) fly(356, 209, 140, 160, g, 'STS', { mono: true });
      if (g >= 1) { card(185, 230, 270, 100, { rx: 10, stroke: GOOD });
        [['access_key', 'ASIA…'], ['secret_key', 'wJalrXUt…'], ['security_token', 'FQoDYXdz…']].forEach(([a, b], i) => {
          mono(64, 206 + i * 24, a, { 'font-size': 13.5, fill: MUT }); mono(306, 206 + i * 24, b, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end' }); }); }
      clock(160, 330 + 34, 18, E(u, 1.4, 2.8) * 0.3, WARN, null); mono(188, 370, 'lease_duration 3600s', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(780, 220, '영구 IAM 키를 두지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '.env를 git에 올린 뒤 rebase와 force push로 이력을 지웠다. 그래도 남는 문제는 무엇인가?',
      o: ['이미 클론한 봇·포크·CI 캐시에 값이 남아 키를 모두 회전해야 한다', '원격 저장소 크기가 커진다', '다른 개발자의 로컬 브랜치가 깨진다'], a: 0,
      why: '원본 이력만 지워질 뿐, 그 사이 가져간 사본은 그대로다. 그래서 노출된 키는 회전하는 수밖에 없다.' },
    { q: 'KV v2의 secret/app/db에 값을 두 번 쓰고 rollback -version=1을 하면 최신 버전 번호는 무엇인가?',
      o: ['1', '2', '3'], a: 2,
      why: '덮어쓰기로 v2가 생기고, 롤백은 v1 값을 복사해 새 버전 v3으로 쌓는다. 이력이 끊기지 않는다.' },
    { q: '인스턴스 100개가 같은 DB 비밀번호를 쓸 때 유출 제보가 오면 왜 출처를 찾기 어려운가?',
      o: ['DB 로그가 저장되지 않아서', '모든 접속이 user=app 하나로 찍혀 구분되지 않아서', 'Vault가 읽기 기록을 지워서'], a: 1,
      why: '값이 하나면 로그의 사용자도 하나다. 누가 가져갔는지 자격 자체로는 가릴 수 없다.' },
    { q: 'database 엔진에서 vault read database/creds/app을 하면 DB에는 무슨 일이 생기나?',
      o: ['미리 만든 공용 계정의 비밀번호만 알려 준다', '아무 변화 없이 Vault 안의 값만 읽는다', 'role의 creation_statements로 새 사용자가 만들어지고, TTL 1h 뒤 Vault가 지운다'], a: 2,
      why: '동적 엔진은 요청마다 CREATE ROLE을 실행해 새 사용자를 만들고, lease가 끝나면 DROP ROLE로 회수한다.' },
    { q: 'Stripe가 발급한 API 키는 어디에 두는 것이 맞나?',
      o: ['KV v2에 보관한다', 'database 엔진으로 동적 발급한다', 'transit 엔진으로 매번 새로 만든다'], a: 0,
      why: '외부 서비스가 만든 키는 Vault가 대신 만들 수 없다. 이런 값은 KV에 버전 관리하며 보관한다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    '.env에 적어 git에 올린 시크릿은 이력을 지워도 회수되지 않고 누가 봤는지도 모른다.',
    'KV v2는 경로에 값을 보관하고 덮어쓰거나 롤백할 때마다 새 버전을 쌓는다.',
    '정적 값은 모두가 같은 자격을 쓰니 유출 출처를 못 찾고, 바꾸려면 전부 재배포해야 한다.',
    'database 엔진은 요청마다 DB 사용자를 만들고 TTL 1h가 지나면 스스로 지운다.',
  ];
  const review = [
    { q: '퇴사자가 운영 DB 비밀번호를 알고 있다는 사실이 드러났다. 앱이 KV에서 같은 비밀번호를 읽고 있다면 먼저 할 일은?',
      o: ['KV 값을 v1로 롤백한다', 'DB 비밀번호를 바꾸고 새 값을 KV에 쓴 뒤 앱을 다시 띄운다', '퇴사자의 Vault 계정만 지운다'], a: 1,
      why: '정적 값은 사람이 이미 알고 있으면 그대로 쓸 수 있다. 값 자체를 바꾸고 모든 인스턴스가 새 값을 받게 해야 한다.' },
    { q: 'DB 접속 로그에 v-token-app-7Ab1…로 이상한 쿼리가 찍혔다. 이 자격의 출처를 찾는 데 쓸 것은?',
      o: ['그 사용자를 발급한 lease_id와 발급 기록', 'KV v2의 버전 이력', '.env 파일의 수정 시각'], a: 0,
      why: '동적 사용자는 요청마다 따로 만들어지므로, lease_id로 언제 누가 받아 갔는지 거슬러 갈 수 있다.' },
    { q: 'KV에 둔 DB 비밀번호를 매일 바꾸느라 배포가 잦다. 가장 알맞은 개선은?',
      o: ['KV 버전 수를 늘린다', '비밀번호를 .env로 다시 옮긴다', 'database 엔진으로 옮겨 짧은 TTL의 자격을 받게 한다'], a: 2,
      why: 'DB는 Vault가 사용자를 직접 만들고 지울 수 있는 백엔드다. 동적 발급으로 바꾸면 회전과 회수를 Vault가 맡는다.' },
  ];

  R.page({ title: 'Vault 서버 상태', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
