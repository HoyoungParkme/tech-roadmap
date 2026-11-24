/* V-2-1 RBAC — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, person, cross, check, lock, crowd } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 지역 도우미 ----------
  function req(x, y, m, path, o) { o = o || {}; const fs = o.fs || 14, mw = tw(m, fs) + 16, pw = tw(path, fs) + 18, h = fs + 14;
    const col = m === 'GET' ? INFO : m === 'POST' ? ACC : WARN, g = G(x, y, 1, o.op);
    el('rect', { x: 0, y: -h / 2, width: mw + pw, height: h, rx: 7, fill: PANEL, stroke: col, 'stroke-width': 1.8 }, g);
    el('rect', { x: 0, y: -h / 2, width: mw, height: h, rx: 7, fill: col }, g);
    mono(mw / 2, fs * 0.36, m, { 'font-size': fs, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g);
    mono(mw + 9, fs * 0.36, path, { 'font-size': fs, fill: INK }, g); return mw + pw; }
  function dash(cx, cy, w, h, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 1.8 }, g);
    el('line', { x1: -w / 2, y1: -h / 2 + 14, x2: w / 2, y2: -h / 2 + 14, stroke: GRID, 'stroke-width': 1.5 }, g);
    [0.45, 0.8, 0.6].forEach((v, i) => { const bw = (w - 30) / 3, bh = Math.max(2, (h - 26) * v); el('rect', { x: -w / 2 + 8 + i * (bw + 7), y: h / 2 - 6 - bh, width: bw, height: bh, rx: 2, fill: o.bar || OFF, opacity: 0.8 }, g); }); return g; }
  const mini = (cx, cy, s, col, op) => person(cx, cy, null, { s, stroke: col || INK, op });
  // action:scope 칩 (왼쪽 기준)
  function chip(x, y, action, scope, o) { o = o || {}; const fs = 13.5, aw = tw(action, fs) + 18, sw = scope ? tw(scope, fs) + 18 : 0, h = 30, g = G(x, y, o.s ?? 1, o.op), col = o.col || ACC;
    el('rect', { x: 0, y: -h / 2, width: aw + sw, height: h, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': o.dash }, g);
    el('rect', { x: 0, y: -h / 2, width: aw, height: h, rx: 6, fill: o.fill || ACCBG }, g);
    mono(9, 5, action, { 'font-size': fs, 'font-weight': 700, fill: col, 'text-decoration': o.strike ? 'line-through' : null }, g);
    if (scope) mono(aw + 9, 5, scope, { 'font-size': fs, fill: MUT }, g); return aw + sw; }

  // ---------- 1. 기본 역할 3칸 ----------
  const RES = ['dashboards', 'datasources', 'users · org'];
  const DR = [['Viewer', INFO, [1, 1, 0], ['read', 'query', 'none']], ['Editor', WARN, [2, 1, 0], ['read|write', 'query', 'none']], ['Admin', BAD, [3, 3, 3], ['all', 'all', 'all']]];
  function drawer(i, open, o) { o = o || {}; const [n, col, lv, lab] = DR[i], cx = 170 + i * 310, top = 96, w = 270, op = o.op ?? 1;
    el('rect', { x: cx - w / 2, y: top, width: w, height: 290, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 2, opacity: op });
    el('rect', { x: cx - w / 2 + 10, y: top + 10, width: w - 20, height: 52, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 2.5, opacity: op });
    tx(cx, top + 43, n, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: op });
    el('rect', { x: cx - 24, y: top + 66, width: 48, height: 6, rx: 3, fill: MUT, opacity: op });
    if (open <= 0) { tx(cx, top + 170, '?', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: OFF, opacity: op }); return; }
    RES.forEach((r, j) => { const y = top + 110 + j * 62, f = clamp(open * 3 - j);
      tx(cx - w / 2 + 18, y, r, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op * f });
      for (let b = 0; b < 3; b++) el('rect', { x: cx - w / 2 + 18 + b * 46, y: y + 10, width: 40, height: 16, rx: 4, fill: b < lv[j] ? col : PANEL, stroke: b < lv[j] ? 'none' : GRID, 'stroke-width': 1.5, opacity: op * (b < lv[j] ? f : 1) });
      mono(cx + w / 2 - 18, y + 23, lab[j], { 'font-size': 14, 'font-weight': 700, fill: lv[j] ? INK : OFF, 'text-anchor': 'end', opacity: op * f });
      if (o.mark && o.mark[j]) el('rect', { x: cx - w / 2 + 10, y: y - 18, width: w - 20, height: 52, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': o.mark[j] === 'gap' ? '6 4' : null, opacity: o.markOp ?? 1 }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { DR.forEach((_, i) => drawer(i, 0, { op: fade(u, 0.2 + i * 0.35) })); tx(480, 50, '조직마다 기본 역할은 딱 세 칸', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.4) }); return; }
    if (k <= 3) { DR.forEach((_, i) => drawer(i, i < k - 1 ? 1 : i === k - 1 ? E(u, 0.2, 1.6) : 0, { op: i === k - 1 ? 1 : 0.55 }));
      const note = ['데이터는 볼 수만 있다', 'datasources 는 여기서 멈춘다', '사용자·조직까지 다 열린다'][k - 1];
      tx(170 + (k - 1) * 310, 60, note, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: DR[k - 1][1], opacity: fade(u, 1.6) }); return; }
    // k4: 결제팀이 원하는 것과 비교
    card(480, 40, 520, 46, { rx: 23, fill: INK, stroke: 'none', text: '결제팀이 원하는 것: datasources 수정만', fs: 16, color: PANEL, s: pop(u, 0.2) });
    drawer(0, 1, { op: 0.35 });
    drawer(1, 1, { mark: [0, 'gap', 0], markOp: fade(u, 0.8) }); drawer(2, 1, { mark: [0, 0, 'over'], markOp: fade(u, 1.4) });
    pill(480, 404, '부족', BAD, pop(u, 1.0), { fs: 15 }); pill(790, 404, '과함', BAD, pop(u, 1.6), { fs: 15 });
    tx(170, 404, '딱 맞는 칸이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) }); }

  // ---------- 2. action + scope ----------
  const DS = [['prod-db', 470], ['staging-db', 650], ['logs-db', 830]];
  function world(k, u, lit) { // 오른쪽 자원 지도
    tx(380, 70, 'dashboards', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); tx(380, 186, 'datasources', { 'font-size': 13.5, 'font-weight': 700, fill: MUT }); tx(380, 316, 'users', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    [460, 580, 700, 820].forEach((x, i) => { const on = lit.dash; dash(x, 112, 100, 54, { stroke: on ? INFO : GRID, sw: on ? 2.5 : 1.5, bar: on ? INFO : OFF, op: 1 }); if (on && lit.dashNew) el('circle', { cx: x + 44, cy: 88, r: 5, fill: INFO, opacity: lit.dashNew(i) }); });
    DS.forEach(([n, x], i) => { const w = lit.write && lit.write(n), r = lit.read && lit.read(n); dbIcon(x, 226, null, { s: 0.55, stroke: w ? WARN : r ? INFO : GRID });
      mono(x, 276, n, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: w ? WARN : r ? INFO : MUT });
      if (w) pill(x + 52, 204, 'write', WARN, w, { fs: 13 }); if (r && !w) pill(x + 52, 204, 'read', INFO, r, { fs: 13 }); });
    for (let i = 0; i < 5; i++) mini(470 + i * 95, 350, 0.65, lit.users ? BAD : GRID, 1); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { const sp = E(u, 0.6, 1.5) * 90;
      card(480 - sp, 150, 260, 80, { rx: 12, stroke: ACC, sw: 3, text: 'action', fs: 22, color: ACC, mono: true });
      card(480 + sp, 150, 260, 80, { rx: 12, stroke: INFO, sw: 3, text: 'scope', fs: 22, color: INFO, mono: true });
      tx(480 - sp, 230, '무엇을 하나 (자원:동사)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(480 + sp, 230, '어디에 적용하나 (범위)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
      mono(480, 310, 'permission = action + scope', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.9) });
      tx(480, 350, '역할은 이런 permission 의 묶음이다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    const perms = b.perms || [], np = perms.length, pp = (c.prev && c.prev.perms) ? c.prev.perms.length : 0;
    tx(30, 60, 'permissions', { 'font-size': 15, 'font-weight': 800 });
    perms.forEach((p, i) => { const isNew = i >= pp || (k === 5 && i === 2), s = isNew ? pop(u, 0.3) : 1;
      chip(30, 96 + i * 48, p.action, p.scope, { s, col: p.action.startsWith('users') ? BAD : p.action.endsWith('write') ? WARN : INFO, fill: SOFT }); });
    const fr = (u0) => (k === 1 ? fade(u, u0) : 1);
    const has = (a) => perms.some((p) => p.action === a);
    world(k, u, { dash: k >= 1, dashNew: (i) => (k === 1 ? fade(u, 0.8 + i * 0.2) : 1),
      write: (n) => (has('datasources:write') && n === 'prod-db' ? (k === 2 ? pop(u, 1.0) : 1) : 0),
      read: (n) => (has('datasources:read') ? (k === 3 ? fade(u, 0.9 + DS.findIndex((d) => d[0] === n) * 0.25) : 1) : 0),
      users: has('users:create') });
    if (k === 2) tx(650, 300, 'uid 로 하나만 겨냥', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
    if (k === 1) tx(640, 160, '* = 대시보드 전체', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.6) });
    if (k === 3) tx(650, 300, 'read 와 write 는 다른 action', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) });
    if (k >= 4) { tx(30, 262, 'fixed role (미리 만든 묶음)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: k === 4 ? fade(u, 0.2) : 1 });
      (b.fixedRoles || []).forEach((f, i) => { const x = lerp(-200, 30, k === 4 ? E(u, 0.3 + i * 0.2, 0.9 + i * 0.2) : 1); pill(x + tw(f, 13.5) / 2 + 13, 292 + i * 32, f, MUT, 1, { fs: 13.5, mono: true, color: INK }); }); }
    if (k === 5) { const sp = E(u, 0.8, 1.6) * 18; mono(700 - sp, 404, 'users', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); mono(700, 404, ':', { 'font-size': 16, 'text-anchor': 'middle', opacity: 1 - E(u, 0.8, 1.2) * 0.5 }); mono(700 + sp, 404, 'create', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      tx(700 - sp - 60, 404, '자원', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.6) }); tx(700 + sp + 70, 404, '동사', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) }); } }

  // ---------- 3. 커스텀 역할 정의 ----------
  function s3(t, c) { const { k, u } = c, r = c.beat.customRole || {}, pr = (c.prev && c.prev.customRole) || {};
    const X = 40, Y = 54, W = 470, H = 340;
    el('rect', { x: X, y: Y, width: W, height: H, rx: 16, fill: k >= 1 ? PANEL : SOFT, stroke: k >= 1 ? ACC : GRID, 'stroke-width': k >= 1 ? 3 : 2, 'stroke-dasharray': k >= 1 ? null : '8 6' });
    if (k === 0) { mono(X + 24, Y + 40, 'apiVersion: 2', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.3) }); mono(X + 24, Y + 66, 'roles:', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.7) });
      tx(X + W / 2, Y + 190, '파일로 정의하면 Git 으로 관리된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    if (k >= 1) { const nm = r.name || '', show = k === 1 ? Math.round(nm.length * E(u, 0.2, 1.2)) : nm.length;
      mono(X + 24, Y + 40, nm.slice(0, show), { 'font-size': 18, 'font-weight': 800, fill: ACC });
      mono(X + 24, Y + 68, 'version 1 · orgId 1', { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 1.3) : 1 });
      if (k === 1) { mono(620, 120, 'fixed:my-role', { 'font-size': 16, 'font-weight': 700, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.6) }); cross(760, 114, 11, pop(u, 1.8));
        tx(700, 160, 'fixed: 는 고정 역할 전용', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
        tx(700, 230, '내용을 바꾸면 version 을 올린다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.2) }); } }
    if (k >= 2) { const a = k === 2 ? fade(u, 0.4) : 1; tx(X + 24, Y + 104, r.displayName === '—' ? '' : 'Datasource Editor', { 'font-size': 16, 'font-weight': 700, opacity: a }); pill(X + W - 90, Y + 98, 'Data Platform', MUT, k === 2 ? pop(u, 1.0) : 1, { fs: 13.5, color: INK }); el('line', { x1: X + 20, y1: Y + 124, x2: X + W - 20, y2: Y + 124, stroke: GRID, 'stroke-width': 1.5 }); }
    if (k === 2) tx(700, 200, 'displayName · group 은 화면 표시용', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
    const P = r.permissions || [], np = (pr.permissions || []).length;
    if (k >= 3) tx(X + 24, Y + 152, 'permissions', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    P.forEach((p, i) => { const isNew = k >= 3 && i >= np, f = isNew ? seg(u, 0.3, 1.2) : 1, y = Y + 186 + i * 44;
      if (f < 1) chip(lerp(640, X + 24, E(f, 0, 1)), lerp(300, y, E(f, 0, 1)), p.action, p.scope, { col: p.action.endsWith('write') ? WARN : INFO, fill: SOFT });
      else chip(X + 24, y, p.action, p.scope, { col: p.action.endsWith('write') ? WARN : INFO, fill: SOFT }); });
    // 오른쪽: 이 역할이 닿는 곳
    if (k >= 3) { const zs = [['datasources', 620, 300, true], ['dashboards', 800, 140, false], ['users', 800, 300, false]];
      zs.forEach(([n, x, y, inside]) => { el('rect', { x: x - 80, y: y - 44, width: 160, height: 88, rx: 10, fill: inside ? C.WARNBG : SOFT, stroke: inside ? WARN : GRID, 'stroke-width': inside ? 2.5 : 1.5 }); mono(x, y + 5, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: inside ? WARN : OFF }); if (!inside && k === 6) lock(x + 60, y - 30, true, MUT, pop(u, 1.4)); });
      if (k === 3) tx(620, 230, 'scope: datasources:*', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: WARN, opacity: fade(u, 1.4) }); }
    if (k === 5) tx(700, 60, 'UID → ID 조회 보조', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) });
    if (k === 6) { const f = seg(u, 0.2, 1.0), bx = lerp(640, 520, E(f, 0, 1)) + (f >= 1 ? Math.sin(seg(u, 1.0, 1.6) * Math.PI) * 40 : 0);
      chip(bx, 60, 'datasources:delete', null, { col: BAD, fill: C.BADBG, strike: u > 1.2 }); if (u > 1.2) cross(bx + 180, 60, 11);
      tx(X + W / 2, Y + H + 22, '필요한 action 만 + scope 한정 = 최소 권한', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); } }

  // ---------- 4. 역할 할당 ----------
  function s4(t, c) { const { k, u } = c;
    const live = k >= 1, rs = live ? 1 : 0.45;
    card(480, 70, 330, 56, { rx: 12, stroke: ACC, sw: 3, fill: live ? ACCBG : SOFT, text: 'custom:datasource-editor', fs: 16, mono: true, color: ACC, op: rs });
    if (k === 0) tx(480, 128, '정의만 하면 아직 아무 효력이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8) });
    // 셋의 자리 (k4 에서는 시상대로)
    const P0 = { basic: [160, 290], team: [480, 290], user: [800, 290] }, P1 = { team: [480, 270], basic: [230, 300], user: [730, 320] }, m = k === 4 ? E(u, 0.3, 1.3) : 0;
    const pos = (n) => [lerp(P0[n][0], P1[n][0], m), lerp(P0[n][1], P1[n][1], m)];
    const [bx, by] = pos('basic'), [tx0, ty0] = pos('team'), [ux, uy] = pos('user');
    crowd(bx, by - 20, 14, null); tx(bx, by + 46, '기본 역할 Editor 전원', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: k >= 1 ? 1 : 0.45 });
    card(tx0, ty0 - 18, 170, 70, { rx: 12, stroke: WARN, sw: 2.5, op: k >= 2 ? 1 : 0.45 }); [-40, 0, 40].forEach((d) => mini(tx0 + d, ty0 - 18, 0.55, INK, k >= 2 ? 1 : 0.45)); tx(tx0, ty0 + 46, 'Team: Data Platform', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: k >= 2 ? 1 : 0.45 });
    mini(ux, uy - 18, 0.9, k >= 3 ? INK : OFF); tx(ux, uy + 46, 'User: alice@corp', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: k >= 3 ? 1 : 0.45 });
    if (k >= 1 && k < 4) { grow(400, 98, bx + 20, by - 70, k === 1 ? seg(u, 0.3, 1.1) : 1, ACC); if (k === 1) { tx(220, 150, 'from + permissions 로 넓힘', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); tx(bx, by + 76, '모든 Editor 가 DS 수정 가능', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) }); } }
    if (k >= 2 && k < 4) { grow(480, 98, tx0, ty0 - 58, k === 2 ? seg(u, 0.3, 1.1) : 1, ACC); if (k === 2) { tx(560, 160, 'teams: 블록 · 또는 API', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); for (let i = 0; i < 2; i++) dot([[480, 98], [480, 230]], ((t * 0.8 + i / 2) % 1), ACC, 5); } }
    if (k === 3) { grow(560, 98, ux - 20, uy - 60, seg(u, 0.3, 1.1), MUT, { dash: '6 5' }); pill(ux, uy + 80, '감사 대상', WARN, pop(u, 1.3), { fs: 13.5 }); mono(ux - 10, 150, 'POST …/users/:userId/roles', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 4) { const h = (n) => ({ team: 110, basic: 70, user: 40 })[n] * m; [['team', 1, GOOD], ['basic', 2, WARN], ['user', 3, MUT]].forEach(([n, rk, col]) => { const [x] = pos(n), base = 418;
        el('rect', { x: x - 90, y: base - h(n), width: 180, height: h(n), rx: 6, fill: col, opacity: 0.25 }); if (m > 0.6) tx(x, base - 10, rk + '순위', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col }); }); } }

  // ---------- 5. 요청 판정 ----------
  function s5(t, c) { const { k, u } = c, b = c.beat, pv = c.prev || {};
    mini(70, 92, 0.9, INK); tx(110, 86, 'alice@corp', { 'font-size': 15, 'font-weight': 800 }); tx(110, 108, 'Team: Data Platform', { 'font-size': 13.5, fill: MUT });
    // 역할 상자 두 개 + 합집합 테두리
    card(220, 180, 360, 80, { rx: 10, stroke: WARN, sw: 2 }); tx(52, 158, '기본 Editor', { 'font-size': 13.5, 'font-weight': 700, fill: WARN });
    chip(52, 190, 'dashboards:read', null, { col: INFO, fill: SOFT }); chip(214, 190, 'dashboards:write', null, { col: WARN, fill: SOFT });
    if (k >= 1) { const a = k === 1 ? pop(u, 0.4) : 1; card(220, 290, 360, 104, { rx: 10, stroke: ACC, sw: 2, s: a }); tx(52, 258, 'custom:datasource-editor (팀으로 받음)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: a });
      chip(52, 288, 'datasources:read', null, { col: INFO, fill: SOFT, op: a }); chip(216, 288, 'datasources:write', null, { col: WARN, fill: SOFT, op: a }); chip(52, 322, 'datasources.id:read', null, { col: INFO, fill: SOFT, op: a });
      const ua = k === 1 ? fade(u, 1.3) : 1; el('rect', { x: 26, y: 128, width: 388, height: 284, rx: 16, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 6', opacity: ua });
      tx(420, 404, '∪', { 'font-size': 22, 'font-weight': 800, opacity: ua }); }
    if (k === 5) { const a = pop(u, 0.4); chip(52, 384, 'users:create', '(예시: 넓은 역할 하나)', { col: BAD, fill: C.BADBG, dash: '5 4', s: a }); }
    // 오른쪽: 요청 판정
    if (k >= 2) { if (k === 2) req(460, 60, 'GET', '/api/access-control/users/:id/permissions', { op: fade(u, 0.1), fs: 13 }); else tx(460, 66, '유효 권한으로 요청 판정', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const rq = b.requests || [], pn = (pv.requests || []).length;
      rq.forEach((r, i) => { const y = 120 + i * 66, isNew = i >= pn, a = isNew ? pop(u, 0.5) : 1, flip = k === 5 && r.action === 'users:create', ok = r.allowed || (flip && u > 1.4);
        card(700, y, 480, 54, { rx: 10, stroke: ok ? GOOD : BAD, sw: 2, fill: ok ? C.GOODBG : C.BADBG, s: a });
        mono(476, y - 3, r.action, { 'font-size': 14.5, 'font-weight': 700, opacity: a }); mono(476, y + 17, r.scope, { 'font-size': 13.5, fill: MUT, opacity: a });
        if (ok) check(910, y, 11, a); else cross(910, y, 10, a);
        if (r.action === 'datasources:delete' && k === 4) pill(800, y + 40, 'Enterprise · Cloud 전용', MUT, pop(u, 1.4), { fs: 13, color: INK }); }); }
    if (k === 5) tx(700, 402, '한 곳만 넓어도 제한이 무너진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
    if (k === 0) tx(700, 220, '아직 커스텀 역할이 반영되지 않았다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8) }); }

  const quiz = [
    { q: '결제팀에 데이터소스 수정만 주려 할 때 기본 역할이 안 맞는 이유는 무엇인가?',
      o: ['Viewer는 데이터소스를 아예 쿼리할 수 없어서', 'Editor는 데이터소스를 고칠 수 없고 Admin은 사용자·조직까지 열려서', 'Admin은 데이터소스를 고칠 수 없어서'], a: 1,
      why: 'Editor의 datasources는 query까지라 부족하고, Admin은 datasources와 함께 users·org도 all이라 과하다.' },
    { q: 'datasources:write를 scope datasources:uid:prod-db로 주면 어떻게 되나?',
      o: ['모든 데이터소스를 고칠 수 있다', 'prod-db 하나만 고칠 수 있다', 'prod-db를 읽기만 할 수 있다'], a: 1,
      why: 'scope는 어디에 적용되는지를 정한다. uid로 지정하면 그 자원 하나만 겨냥하고, 읽기는 datasources:read를 따로 줘야 한다.' },
    { q: 'roles.yaml에서 custom:datasource-editor의 permissions를 고쳤는데 반영되지 않았다. 가장 먼저 의심할 것은?',
      o: ['version을 올리지 않았다', '이름이 custom:으로 시작한다', 'scope가 datasources:*이다'], a: 0,
      why: '저장된 역할보다 version이 커야 변경이 적용된다. 고칠 때마다 1씩 올린다.' },
    { q: '입·퇴사가 잦은 Data Platform 조직에 커스텀 역할을 붙이는 가장 좋은 대상은?',
      o: ['사용자 한 명씩', 'Team: Data Platform', '기본 역할 Viewer 전원'], a: 1,
      why: '팀에 붙이면 사람이 들고 날 때 팀 멤버십만 바꾸면 된다. 사용자 직접 할당은 예외, 기본 역할 확장은 범위가 넓다.' },
    { q: 'alice는 기본 Editor와 custom:datasource-editor를 가졌다. datasources:delete 요청은 어떻게 되나?',
      o: ['허용된다. Editor가 데이터소스를 지울 수 있어서', '거부된다. 어느 역할도 그 action을 주지 않아서', '허용된다. datasources:write에 delete가 들어 있어서'], a: 1,
      why: '유효 권한은 역할들의 합집합이고 delete는 어디에도 없다. 커스텀 역할에서 일부러 뺐기 때문이다.' },
  ];

  const summary = [
    '기본 역할 세 칸으로는 데이터소스 수정만 주는 식의 좁은 권한을 만들 수 없다.',
    'RBAC의 permission은 action과 scope 두 조각이고, 역할은 그 묶음이다.',
    '커스텀 역할에는 필요한 action만 넣고, 고칠 때마다 version을 올린다.',
    '할당은 팀을 먼저 쓰고, 유효 권한은 모든 역할의 합집합이라 한 곳만 넓어도 위험하다.',
  ];
  const review = [
    { q: '팀에 좁은 커스텀 역할을 줬는데 팀원 하나가 사용자를 만들 수 있다. 먼저 볼 곳은?',
      o: ['그 사람이 받은 다른 역할을 유효 권한 API로 확인', '커스텀 역할의 version', '데이터소스 scope'], a: 0,
      why: '유효 권한은 기본·고정·커스텀 역할의 합집합이다. 다른 곳에서 받은 넓은 역할이 있으면 커스텀 역할의 제한은 의미가 없다.' },
    { q: '모든 Editor에게 datasources:write를 더하려고 basic_editor를 넓혔다. 이 방식의 위험은?',
      o: ['Editor가 된 사람 전원이 데이터소스를 고치게 된다', 'Editor가 대시보드를 못 보게 된다', 'version을 올릴 수 없다'], a: 0,
      why: '기본 역할 확장은 그 역할 전원에게 적용되어 범위가 넓다. 필요한 사람만이라면 팀에 커스텀 역할을 주는 편이 좁다.' },
    { q: '고정 역할 fixed:datasources:writer로 충분한지 먼저 보는 이유는?',
      o: ['Grafana가 미리 만든 묶음이라 직접 정의하고 관리할 일이 줄어서', '고정 역할은 OSS에서만 동작해서', '커스텀 역할은 permission을 하나만 담을 수 있어서'], a: 0,
      why: '자주 쓰는 조합은 fixed role로 이미 있다. 맞는 것이 없을 때만 custom 역할을 만들어 version까지 관리한다.' },
  ];

  R.page({ title: 'RBAC 역할과 판정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
