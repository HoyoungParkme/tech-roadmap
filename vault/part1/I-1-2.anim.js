/* I-1-2 auth method (token / userpass / approle / kubernetes) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * token 값·정책·TTL 은 페이지 코드 블록의 출력(예시 값)과 STEPS 의 items 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, clock, terminal, kvTable, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 부품 ----------
  function safe(x, y, w, h, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 3 });
    const dx = x + w - 28, dy = y + 26, a = o.dial || 0;
    el('circle', { cx: dx, cy: dy, r: 14, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    el('line', { x1: dx, y1: dy, x2: dx + Math.cos(a) * 9, y2: dy + Math.sin(a) * 9, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round' });
    tx(x + 16, y + 31, o.name || 'Vault', { 'font-size': 16, 'font-weight': 800 }); }
  // 인증 창구(auth mount): 문 모양. g 만큼 열린다
  function door(x, y, w, path, desc, o) { o = o || {}; const g = o.g ?? 1; if (g <= 0) return; const col = o.col || INK;
    el('rect', { x, y, width: w, height: 46, rx: 8, fill: o.hot ? ACCBG : PANEL, stroke: o.hot ? ACC : col, 'stroke-width': o.hot ? 2.6 : 1.8, opacity: g });
    el('rect', { x: x + 8, y: y + 8, width: 22, height: 30, rx: 3, fill: o.hot ? ACC : SOFT, stroke: o.hot ? ACC : MUT, 'stroke-width': 1.5, opacity: g });
    el('circle', { cx: x + 25, cy: y + 24, r: 2.2, fill: o.hot ? PANEL : MUT, opacity: g });
    mono(x + 40, y + 29, path, { 'font-size': 15, 'font-weight': 800, fill: o.hot ? ACC : INK, opacity: g });
    if (desc) tx(x + w - 12, y + 29, desc, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: g }); }
  // token 표: 가운데 기준. o = { id, pol, ttl(0~1), ttlText, col, s, op, dead }
  function ticket(cx, cy, o) { const w = o.w || 270, h = 78, x = cx - w / 2, y = cy - h / 2, col = o.dead ? OFF : o.col || ACC, g = R.G(0, 0, 1, o.op ?? 1);
    const s = o.s ?? 1; if (s <= 0) return; const G2 = R.G(cx, cy, s, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: o.dead ? SOFT : o.fill || ACCBG, stroke: col, 'stroke-width': 2.4 }, G2);
    el('circle', { cx: -w / 2, cy: 0, r: 8, fill: PANEL, stroke: col, 'stroke-width': 2.4 }, G2); el('circle', { cx: w / 2, cy: 0, r: 8, fill: PANEL, stroke: col, 'stroke-width': 2.4 }, G2);
    el('line', { x1: -w / 2 + 44, y1: -h / 2 + 6, x2: -w / 2 + 44, y2: h / 2 - 6, stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, G2);
    tx(-w / 2 + 22, 6, 'T', { 'font-size': 18, 'font-weight': 900, fill: col, 'text-anchor': 'middle' }, G2);
    tx(-w / 2 + 56, -h / 2 + 22, o.id, { 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: o.dead ? OFF : INK, 'text-decoration': o.dead ? 'line-through' : null }, G2);
    tx(-w / 2 + 56, -h / 2 + 44, o.pol, { 'font-size': 13.5, class: 'mono', fill: o.dead ? OFF : MUT }, G2);
    if (o.ttl != null) { const bw = w - 120, bx = -w / 2 + 56;
      el('rect', { x: bx, y: h / 2 - 22, width: bw, height: 8, rx: 4, fill: PANEL, stroke: GRID }, G2);
      el('rect', { x: bx, y: h / 2 - 22, width: bw * clamp(o.ttl), height: 8, rx: 4, fill: o.dead ? OFF : WARN }, G2);
      tx(w / 2 - 14, h / 2 - 14, o.ttlText || '', { 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: o.dead ? OFF : WARN, 'text-anchor': 'end' }, G2); }
    if (o.dead) { el('line', { x1: -w / 2 + 10, y1: -h / 2 + 10, x2: w / 2 - 10, y2: h / 2 - 10, stroke: BAD, 'stroke-width': 3, opacity: 0.8 }, G2); } }
  // 파드 아이콘
  function pod(cx, cy, name, o) { o = o || {};
    el('rect', { x: cx - 40, y: cy - 26, width: 80, height: 52, rx: 12, fill: o.fill || GOODBG, stroke: o.col || GOOD, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    tx(cx, cy + 6, name || 'Pod', { 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: o.col || GOOD, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
  // 퍼즐 조각 (approle 의 두 조각)
  function piece(x, y, w, h, side, col, label, val, o) { o = o || {}; const m = y + h / 2, op = o.op ?? 1;
    const d = side === 'L' ? `M${x},${y} H${x + w} V${m - 12} A12,12 0 0 1 ${x + w},${m + 12} V${y + h} H${x} Z`
                           : `M${x},${y} H${x + w} V${y + h} H${x} V${m + 12} A12,12 0 0 0 ${x},${m - 12} Z`;
    el('path', { d, fill: o.fill || PANEL, stroke: o.dead ? OFF : col, 'stroke-width': 2.5, opacity: op });
    tx(x + (side === 'L' ? 14 : 22), y + 24, label, { 'font-size': 15, 'font-weight': 800, fill: o.dead ? OFF : col, opacity: op });
    mono(x + (side === 'L' ? 14 : 22), y + 46, val, { 'font-size': 13.5, fill: o.dead ? OFF : INK, opacity: op, 'text-decoration': o.dead ? 'line-through' : null }); }
  const IT = (c) => (c.beat && c.beat.items) || [];

  // Vault 자리 (오른쪽)
  const VX = 600, VY = 30, VW = 330, VH = 360, DX = VX + 24, DW = VW - 48;

  // ---------- 1. 누가 들어올 수 있는가 ----------
  function s1(t, c) { const { k, u } = c;
    safe(VX, VY, VW, VH, { dial: t * 0.6 });
    if (k <= 1) {
      // 문 하나만 크게
      el('rect', { x: VX - 6, y: 150, width: 12, height: 110, rx: 4, fill: k === 0 ? BAD : ACC });
      if (k === 0) { person(110, 200, '익명 요청', {});
        pill(330, 150, 'vault kv get secret/app/db', INK, pop(u, 0.2), { mono: true, fs: 13.5 });
        dot([[150, 200], [VX - 10, 200]], seg(u, 0.5, 1.3), INK, 7);
        cross(VX - 34, 200, 14, pop(u, 1.3));
        mono(330, 252, 'missing client token', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
        tx(330, 278, '(permission denied)', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        tx(VX + VW / 2, 220, 'token 없는 요청은', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
        tx(VX + VW / 2, 246, '아무것도 돌려받지 못한다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
        return; }
      person(110, 200, '신원 증명', {}); card(150, 214, 40, 28, { rx: 4, fill: INFOBG, stroke: INFO, sw: 2 });
      dot([[150, 200], [VX - 10, 200]], seg(u, 0.2, 0.9), INFO, 7);
      tx(VX + VW / 2, 200, 'auth method로 로그인', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      check(VX + VW / 2, 236, 12, pop(u, 0.9));
      const g = E(u, 1.2, 2.2); ticket(lerp(VX + 80, 330, g), lerp(290, 300, g), { id: 'token', pol: '정책이 붙은 출입증', s: pop(u, 1.2), w: 230 });
      return; }
    if (k === 2) { const it = IT(c);
      it.forEach((r, i) => door(DX, 78 + i * 64, DW, r.who, r.what.split(' — ')[0], { g: E(u, 0.2 + i * 0.35, 0.8 + i * 0.35), hot: i === 0 }));
      terminal(30, 60, 520, 172, [['$ vault auth list', PANEL], ['Path         Type', null], ...it.map((r) => [r.who.padEnd(13) + r.who.replace('/', ''), null])], lerp(0, 6, E(u, 0.1, 1.8)), { title: 'why-auth.sh', fs: 14 });
      tx(290, 270, '창구마다 다른 mount path', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.0) });
      tx(290, 298, '여러 개를 동시에 켜 둔다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    // k3: 주체 → 창구
    const doors = [['userpass/', '사람'], ['approle/', '앱 · CI'], ['kubernetes/', '파드']];
    doors.forEach(([p, d], i) => door(DX, 92 + i * 90, DW, p, d, { hot: true }));
    const subs = [['사람 (개발자)', 0], ['앱 / 서비스', 1], ['CI 파이프라인', 1], ['k8s 파드', 2]];
    subs.forEach(([name, di], i) => { const y = 70 + i * 84, s = pop(u, 0.2 + i * 0.25);
      if (i === 0) person(70, y + 4, null, { s: s * 0.8 }); else if (i === 3) pod(70, y, 'Pod', { op: s }); else server(70, y, null, { s: s * 0.5 });
      tx(124, y + 6, name, { 'font-size': 15, 'font-weight': 700, opacity: s });
      grow(270, y, DX - 6, 115 + di * 90, E(u, 0.9 + i * 0.25, 1.5 + i * 0.25), ACC, { sw: 2.2 }); }); }

  // ---------- 2. token ----------
  const ROOT = 'hvs.rootXXXX…', CHILD = 'hvs.a1B2c3d4E5f6';
  function s2(t, c) { const { k, u } = c;
    const rootDead = k === 4;
    ticket(180, 80, { id: ROOT, pol: 'policies ["root"]', col: BAD, fill: BADBG, s: k === 0 ? pop(u, 0.2) : 1, dead: rootDead });
    if (k === 0) { tx(180, 150, 'TTL 없음 · 모든 권한', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
      terminal(360, 40, 560, 110, [['$ vault login hvs.rootXXXX…', PANEL], ['token_policies   ["root"]', null]], lerp(0, 2, E(u, 0.1, 1.0)), { fs: 14 });
      banner(480, 260, '초기 설정에만 쓰고 곧 폐기한다', pop(u, 1.6)); return; }
    if (rootDead) tx(180, 150, '설정 후 폐기', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    // 자식 token
    const lg = k === 1 ? E(u, 0.2, 0.8) : 1;
    el('path', { d: `M180,119 V${lerp(119, 200, lg)}`, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', fill: 'none' });
    let ttl = 1, dead = false, txt = '1h';
    if (k === 3) { ttl = u < 1.0 ? lerp(1, 0.25, E(u, 0.1, 0.9)) : u < 1.5 ? lerp(0.25, 1, E(u, 1.0, 1.4)) : 1; txt = u > 1.0 && u < 1.6 ? 'renew' : '1h'; dead = u > 1.9; }
    if (k === 4) { ttl = 59 / 60; txt = '59m'; }
    ticket(180, 240, { id: CHILD, pol: '["default" "app-read"]', ttl, ttlText: txt, s: k === 1 ? pop(u, 0.7) : 1, dead });
    if (k === 1) terminal(360, 40, 560, 140, [['$ vault token create \\', PANEL], ['    -policy=app-read -ttl=1h', PANEL], ['token            hvs.a1B2c3d4E5f6', null], ['token_duration   1h', null]], lerp(0, 4, E(u, 0.1, 1.6)), { fs: 14 });
    if (k === 2) { card(640, 110, 520, 96, { rx: 10, stroke: INFO, fill: INFOBG });
      mono(398, 96, 'GET /v1/secret/data/app/db', { 'font-size': 15, 'font-weight': 700 });
      mono(398, 126, 'X-Vault-Token: ' + CHILD, { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.4) });
      dot([[310, 240], [380, 240], [380, 150]], seg(u, 0.2, 0.8), INFO, 7);
      safe(700, 220, 230, 150, { dial: t * 0.6 }); grow(640, 160, 760, 214, E(u, 0.9, 1.5), INFO);
      check(815, 300, 13, pop(u, 1.6)); tx(815, 345, '정책대로 응답', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(520, 330, '요청마다 token이 함께 간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) }); }
    if (k === 3) { el('path', { d: 'M180,279 V320 H330', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', fill: 'none' });
      card(420, 320, 170, 40, { rx: 8, text: '하위 token', fs: 14, mono: true, stroke: dead ? OFF : ACC, color: dead ? OFF : INK, fill: dead ? SOFT : ACCBG });
      if (dead) el('line', { x1: 340, y1: 306, x2: 500, y2: 334, stroke: BAD, 'stroke-width': 3 });
      mono(620, 110, 'vault token renew', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
      tx(620, 136, 'TTL을 다시 채운다 (max_ttl까지)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      mono(620, 200, 'vault token revoke', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      tx(620, 226, '즉시 무효 + 하위 token도 함께', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) terminal(360, 160, 560, 120, [['$ vault token lookup', PANEL], ['policies    ["default" "app-read"]', null], ['ttl         59m', null]], lerp(0, 3, E(u, 0.1, 1.4)), { fs: 14 }); }

  // ---------- 3. userpass ----------
  function s3(t, c) { const { k, u } = c;
    safe(VX, VY, VW, VH, { dial: t * 0.6 });
    door(DX, 80, DW, 'userpass/', '사람용', { g: k === 0 ? E(u, 0.4, 1.1) : 1, hot: k === 0 || k === 2 });
    if (k === 0) { terminal(30, 70, 520, 110, [['$ vault auth enable userpass', PANEL], ['Success! Enabled userpass auth', null], ['method at: userpass/', null]], lerp(0, 3, E(u, 0.1, 1.4)), { fs: 14 });
      tx(290, 250, '로그인은 auth/userpass/ 아래로 들어온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // 사용자 표 (Vault 안)
    const users = [['alice', '****  → dev-team', { hot: k === 1 || k === 2 }], ['bob', '****  → readonly', {}]];
    kvTable(DX, 146, DW, users.map((r, i) => [r[0], r[1], Object.assign({ op: k === 1 ? fade(u, 0.3 + i * 0.4) : 1 }, r[2])]), { title: 'auth/userpass/users', kw: 90 });
    if (k === 1) { tx(290, 160, 'alice를 등록하며', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
      tx(290, 188, '정책 dev-team을 미리 매핑한다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
      mono(290, 236, 'token_ttl=1h', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, opacity: fade(u, 1.7) }); return; }
    if (k === 2) { person(90, 120, 'alice', {});
      fly(130, 110, DX, 103, seg(u, 0.2, 1.0), 'alice / s3cr3t-pw', { mono: true, fill: INFO });
      const g = E(u, 1.3, 2.2); ticket(lerp(DX - 140, 300, g), lerp(260, 280, g), { id: 'hvs.Zx9AbCdEfGh', pol: '["default" "dev-team"]', ttl: 1, ttlText: '1h', s: pop(u, 1.2) });
      tx(300, 360, '인증(누구)과 인가(무엇)가 여기서 이어진다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { const segs = ['v1', 'auth', 'userpass', 'login', 'alice'];
      tx(30, 74, 'POST', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      cells(84, 54, segs, { w: 92, h: 36, gap: 8, fs: 14, style: (i) => ({ s: pop(u, 0.2 + i * 0.2), stroke: i === 4 ? ACC : i === 2 ? INFO : GRID, fill: i === 4 ? ACCBG : null, color: i === 4 ? ACC : INK }) });
      tx(84 + 4 * 100 + 46, 116, '사용자명', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(84 + 2 * 100 + 46, 116, 'mount path', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      mono(84, 168, 'body  {"password":"s3cr3t-pw"}', { 'font-size': 14.5, opacity: fade(u, 1.5) });
      mono(84, 222, '"auth": { "client_token": "hvs.Zx9...",', { 'font-size': 14, fill: GOOD, opacity: fade(u, 2.0) });
      mono(84, 246, '          "policies": ["default","dev-team"] }', { 'font-size': 14, fill: GOOD, opacity: fade(u, 2.1) });
      return; }
    // k4: 실무 — SSO
    person(90, 200, '사람', {});
    [['로컬 · 학습', 'userpass', MUT, 130], ['실무', 'OIDC / LDAP (회사 SSO)', ACC, 280]].forEach(([a, b, col, y], i) => {
      grow(130, 200, 250, y, E(u, 0.2 + i * 0.5, 0.8 + i * 0.5), col, { plain: true });
      card(400, y, 290, 52, { rx: 10, stroke: col, s: pop(u, 0.5 + i * 0.5) });
      tx(270, y + 5, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.5) }); tx(538, y + 5, b, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.5) });
      grow(546, y, DX - 6, 103, E(u, 1.0 + i * 0.5, 1.5 + i * 0.5), col, { dash: i === 0 ? '5 4' : null }); }); }

  // ---------- 4. approle ----------
  const ROLE_ID = 'db02a1c9-…', SECRET_ID = '5f3b8e2a-…';
  function s4(t, c) { const { k, u } = c;
    safe(VX, VY, VW, VH, { dial: t * 0.6 });
    door(DX, 80, DW, 'approle/', '앱 · 배치 · CI', { g: k === 0 ? E(u, 0.4, 1.1) : 1, hot: k === 0 || k === 4 });
    if (k === 0) { server(250, 200, '사람이 없는 주체', { s: 0.9 }); grow(320, 190, DX - 6, 103, E(u, 1.2, 1.9), ACC);
      tx(290, 330, '비밀번호를 칠 사람이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    const rows = [['token_policies', 'app-read'], ['token_ttl', '20m'], ['token_max_ttl', '1h'], ['secret_id_ttl', '10m'], ['secret_id_num_uses', '1']];
    kvTable(DX, 146, DW, rows.map((r, i) => [r[0], r[1], { op: k === 1 ? fade(u, 0.3 + i * 0.3) : 0.8, hot: k === 1 && i >= 3 }]), { title: 'role/app', kw: 200, rh: 30 });
    if (k === 1) { tx(290, 180, 'role이 정한다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) });
      tx(290, 210, '이 앱이 무엇을, 얼마나 오래', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) }); return; }
    // 조각 위치
    const LP = [70, 120], RP = [282, 120];
    const joinG = k === 4 ? E(u, 0.2, 1.0) : 0;
    const lx = lerp(LP[0], 250, joinG), rx = lerp(RP[0], 410, joinG);
    if (k === 2 || k === 3) { zone(40, 220, 210, 130, 'app.conf (설정)', { fill: SOFT }); zone(270, 220, 250, 130, 'CI 파이프라인', { fill: SOFT }); }
    const rShow = k === 2 ? pop(u, 0.3) : 1;
    if (rShow > 0) piece(lx, k === 2 ? lerp(240, LP[1], E(u, 0.3, 1.2)) : LP[1], 160, 62, 'L', INFO, 'role_id', ROLE_ID, { op: Math.min(1, rShow) });
    if (k === 2) { tx(145, 330, '공개 · 설정에 둔다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) }); return; }
    const used = k === 5;
    piece(rx, k === 3 ? lerp(250, RP[1], E(u, 0.3, 1.2)) : RP[1], 170, 62, 'R', WARN, 'secret_id', SECRET_ID, { dead: used && u > 0.8, op: used ? 1 - 0.5 * E(u, 0.8, 1.6) : 1 });
    if (k === 3) { clock(330, 318, 16, E(u, 1.2, 2.8) * 0.2, WARN, null); mono(354, 323, 'TTL 10m · 1회용', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
      return; }
    if (k === 4) { const g = E(u, 1.3, 2.2); ticket(lerp(DX - 160, 300, g), 290, { id: 'hvs.Qp7RsTuVwX', pol: '["default" "app-read"]', ttl: 1, ttlText: '20m', s: pop(u, 1.2) });
      return; }
    ticket(300, 290, { id: 'hvs.Qp7RsTuVwX', pol: '["default" "app-read"]', ttl: 1, ttlText: '20m' });
    mono(rx + 85, RP[1] + 90, 'num_uses 1 → 0', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
    tx(300, 370, 'secret_id는 이미 소진 · 다시 못 쓴다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) }); }

  // ---------- 5. kubernetes ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { const rows = [['사람', 'OIDC / userpass'], ['앱 / CI', 'approle'], ['파드', 'kubernetes']];
      rows.forEach(([a, b], i) => { const y = 80 + i * 86, s = pop(u, 0.2 + i * 0.35);
        if (i === 0) person(90, y + 4, null, { s: s * 0.8 }); else if (i === 1) server(90, y, null, { s: s * 0.5 }); else pod(90, y, 'Pod', { op: s });
        tx(150, y + 6, a, { 'font-size': 16, 'font-weight': 800, opacity: s });
        grow(250, y, 380, y, E(u, 0.5 + i * 0.35, 0.9 + i * 0.35), ACC);
        door(390, y - 23, 250, b, null, { g: s, hot: true });
        grow(650, y, 720, 190, E(u, 1.2 + i * 0.2, 1.6 + i * 0.2), MUT, { plain: true }); });
      ticket(830, 190, { id: 'token', pol: '+ 매핑된 정책', w: 190, s: pop(u, 1.9) });
      tx(830, 258, '결과는 언제나 token', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) });
      return; }
    // 왼쪽 Vault, 오른쪽 클러스터
    safe(30, 30, 300, 360, { dial: t * 0.6 });
    door(52, 80, 256, 'kubernetes/', '파드', { g: k === 0 ? E(u, 0.2, 0.8) : 1, hot: k !== 1 });
    zone(400, 30, 530, 360, 'k8s 클러스터', { fill: INFOBG, stroke: INFO, sw: 2, color: INFO });
    card(820, 82, 180, 50, { rx: 8, text: 'kube-apiserver', fs: 14.5, mono: true, stroke: INFO });
    const cg = k === 0 ? E(u, 0.9, 1.6) : 1;
    el('line', { x1: 330, y1: 103, x2: lerp(330, 728, cg), y2: 82 + 0 * cg + 21 * (1 - cg) + 0, stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
    if (k === 0) { mono(530, 130, 'kubernetes_host=https://…:443', { 'font-size': 14, fill: INFO, opacity: fade(u, 1.4) });
      tx(665, 260, 'Vault가 TokenReview API를 부를 수 있게', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    // 네임스페이스
    zone(430, 170, 230, 190, 'ns: prod', { fill: PANEL, stroke: GOOD, sw: 2, color: GOOD });
    zone(680, 170, 230, 190, 'ns: dev', { fill: PANEL, stroke: GRID, sw: 1.5 });
    pod(545, 250, 'web', {}); mono(545, 300, 'sa=web-app', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD });
    pod(795, 250, 'web', { col: OFF, fill: SOFT }); mono(795, 300, 'sa=web-app', { 'font-size': 13.5, 'text-anchor': 'middle', fill: OFF });
    if (k === 1) { const rows = [['bound SA', 'web-app'], ['bound ns', 'prod'], ['policies', 'web-secrets'], ['ttl', '1h']];
      kvTable(52, 150, 256, rows.map((r, i) => [r[0], r[1], { op: fade(u, 0.2 + i * 0.3), hot: i < 2 }]), { title: 'role/web', kw: 110 });
      grow(310, 190, 440, 250, E(u, 1.4, 2.0), GOOD); cross(795, 340, 10, pop(u, 2.0));
      return; }
    // JWT 제출
    mono(545, 334, '/var/run/secrets/…/token', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    if (k === 2) { fly(545, 224, 330, 150, seg(u, 0.5, 1.6), 'role=web + SA JWT', { mono: true, fill: GOOD });
      tx(180, 200, 'JWT는 이미 파드 안에 있다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(180, 226, '미리 넣어 둘 비밀이 없다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    // k3: TokenReview → token
    dot([[330, 110], [728, 90]], seg(u, 0.1, 0.7), INFO, 7);
    pill(800, 140, 'TokenReview ✓ prod · web-app', GOOD, pop(u, 0.8), { fs: 13.5 });
    dot([[728, 100], [330, 120]], seg(u, 1.0, 1.5), GOOD, 7);
    const g = E(u, 1.6, 2.4); ticket(lerp(180, 545, g), lerp(220, 125, g), { id: 'hvs.Kj4…', pol: '["default" "web-secrets"]', ttl: 1, ttlText: '1h', w: 240, s: pop(u, 1.5) }); }

  const quiz = [
    { q: 'token 없이 vault kv get secret/app/db를 보내면 어떻게 되나?',
      o: ['읽기 전용으로 값을 돌려준다', 'permission denied로 거부된다', '자동으로 userpass 로그인 창이 열린다'], a: 1,
      why: 'Vault는 token이 없는 요청에는 아무것도 돌려주지 않는다. 먼저 auth method로 로그인해 token을 받아야 한다.' },
    { q: '부모 token을 vault token revoke로 폐기하면 그 token으로 만든 하위 token은 어떻게 되나?',
      o: ['함께 폐기된다', '그대로 살아남는다', 'TTL이 1h로 초기화된다'], a: 0,
      why: 'revoke는 그 token에서 만든 하위 token까지 함께 무효로 만든다. 그래서 root token도 설정이 끝나면 폐기한다.' },
    { q: 'alice가 userpass로 로그인해 받은 token에 dev-team 정책이 붙는 이유는 무엇인가?',
      o: ['비밀번호에 정책 이름이 들어 있어서', '로그인할 때 alice가 정책을 골라서', '사용자를 등록할 때 dev-team을 매핑해 두어서'], a: 2,
      why: 'auth/userpass/users/alice에 token_policies=dev-team을 적어 두었고, 로그인에 성공하면 그 정책이 token에 붙는다.' },
    { q: 'approle에서 secret_id_num_uses=1로 발급한 secret_id로 로그인한 뒤 같은 secret_id를 다시 쓰면?',
      o: ['다시 로그인된다', '이미 소진돼 로그인할 수 없다', 'role_id만 있으면 되므로 상관없다'], a: 1,
      why: 'secret_id는 1회용으로 발급됐다. 한 번 쓰면 소진되므로 유출돼도 다시 쓸 수 없다.' },
    { q: 'kubernetes auth에서 Vault는 파드가 prod 네임스페이스의 web-app SA라는 것을 어떻게 확인하나?',
      o: ['파드가 보낸 SA JWT를 TokenReview API로 검증한다', '파드 IP 대역을 본다', '파드에 미리 넣어 둔 secret_id를 확인한다'], a: 0,
      why: '파드에 자동 마운트된 SA JWT를 클러스터의 TokenReview API에 물어 소속을 확인하고, role/web의 bound 조건과 맞으면 token을 준다.' },
  ];
  const summary = [
    'Vault는 token 없는 요청을 거부하므로 먼저 auth method로 신원을 증명해 token을 받는다.',
    'root token은 초기 설정에만 쓰고, 평소에는 정책과 TTL이 붙은 하위 token을 쓴다.',
    '사람은 userpass나 OIDC, 앱과 CI는 role_id와 1회용 secret_id를 나눈 approle을 쓴다.',
    '파드는 SA JWT를 TokenReview로 검증받아 web-secrets 정책이 붙은 token을 받는다.',
  ];
  const review = [
    { q: 'CI 로그에 approle의 role_id가 찍힌 것을 발견했다. 가장 먼저 확인할 것은?',
      o: ['role_id를 바로 새로 만든다', 'secret_id가 1회용·짧은 TTL로 발급되고 있는지', 'kubernetes auth로 모두 옮긴다'], a: 1,
      why: 'role_id는 공개를 전제로 한 절반의 신원이다. 로그인을 막는 것은 secret_id이므로 그쪽이 단기·1회용인지가 핵심이다.' },
    { q: '파드 300개에 Vault 접근이 필요하다. approle 대신 kubernetes auth를 고르는 이유로 맞는 것은?',
      o: ['파드마다 secret_id를 미리 넣지 않아도 SA JWT로 증명할 수 있다', 'kubernetes auth token은 만료되지 않는다', 'kubernetes auth는 정책이 필요 없다'], a: 0,
      why: '파드에는 SA JWT가 자동으로 들어 있어 따로 비밀을 주입할 필요가 없다. 결과는 똑같이 정책이 붙은 token이다.' },
    { q: '설정을 마친 뒤에도 운영자가 root token으로 매일 작업하고 있다. 바로잡는 방법은?',
      o: ['root token의 TTL을 늘린다', 'root token을 여러 명에게 나눠 준다', '사람은 userpass나 OIDC로 로그인해 필요한 정책만 붙은 token을 쓰고 root token은 폐기한다'], a: 2,
      why: 'root token은 모든 권한을 가진다. 평소 작업은 auth method로 받은 정책 token으로 하고, root token은 설정 후 폐기하는 것이 원칙이다.' },
  ];

  R.page({ title: 'Vault 인증 창구 — 신원 증명 → token 발급', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
