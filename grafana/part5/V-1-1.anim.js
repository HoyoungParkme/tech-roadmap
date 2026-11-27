/* V-1-1 Organization & Team — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, person, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 지역 도우미 ----------
  const LV = { View: INFO, Edit: WARN, Admin: BAD, Query: GOOD };
  const perm = (cx, cy, s, lvl, sc, o) => pill(cx, cy, s, LV[lvl] || INK, sc, Object.assign({ fs: 13.5 }, o || {}));
  // HTTP 요청 한 줄 (왼쪽 기준). 메서드 칸 + 경로
  function req(x, y, m, path, sc, o) { o = o || {}; const fs = o.fs || 14, mw = tw(m, fs) + 16, pw = tw(path, fs) + 18, h = fs + 14;
    const col = m === 'GET' ? INFO : m === 'POST' ? ACC : WARN, g = G(x, y, sc ?? 1, o.op);
    el('rect', { x: 0, y: -h / 2, width: mw + pw, height: h, rx: 7, fill: PANEL, stroke: col, 'stroke-width': 1.8 }, g);
    el('rect', { x: 0, y: -h / 2, width: mw, height: h, rx: 7, fill: col }, g);
    mono(mw / 2, fs * 0.36, m, { 'font-size': fs, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g);
    mono(mw + 9, fs * 0.36, path, { 'font-size': fs, fill: INK }, g); return mw + pw; }
  // 대시보드 타일: 머리 띠 + 막대 세 개
  function dash(cx, cy, w, h, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 1.8, 'stroke-dasharray': o.dash }, g);
    if (o.empty) { tx(0, 5, o.empty, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
    el('line', { x1: -w / 2, y1: -h / 2 + 18, x2: w / 2, y2: -h / 2 + 18, stroke: GRID, 'stroke-width': 1.5 }, g);
    [0.45, 0.8, 0.6].forEach((v, i) => { const bw = (w - 30) / 3, bh = Math.max(2, (h - 30) * v); el('rect', { x: -w / 2 + 8 + i * (bw + 7), y: h / 2 - 6 - bh, width: bw, height: bh, rx: 2, fill: o.bar || ACC, opacity: 0.75 }, g); });
    if (name) tx(0, h / 2 + 18, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 600, fill: o.color || INK }, g); return g; }
  // 폴더 모양
  function folder(cx, cy, w, h, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.stroke || WARN;
    el('path', { d: `M${-w / 2},${-h / 2} h${w * 0.38} l10,10 h${w * 0.62 - 10} v${h - 10} h${-w} z`, fill: o.fill || C.WARNBG, stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    if (name) tx(0, 10, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: INK, class: o.mono ? 'mono' : null }, g); return g; }
  const mini = (cx, cy, s, col, op) => person(cx, cy, null, { s, stroke: col || INK, op });

  // ---------- 1. Organization ----------
  // 조직 상자 하나: 대시보드 두 장 · 데이터소스 · 사용자
  function org(x, name, o) { o = o || {}; const y = 64, w = 268, h = 312, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 14, fill: o.cur ? ACCBG : SOFT, stroke: o.cur ? ACC : GRID, 'stroke-width': o.cur ? 3 : 1.5, opacity: op });
    tx(x + 16, y + 28, name, { 'font-size': 16, 'font-weight': 800, opacity: op });
    if (o.id) pill(x + w - 50, y + 22, 'orgId ' + o.id, o.idCol || MUT, o.idS ?? 1, { fs: 13.5, mono: true });
    const s = o.s ?? 1;
    if (o.empty) { dash(x + 72, y + 98, 104, 62, null, { dash: '5 5', stroke: OFF, empty: '비어 있음', op: op * s });
      dash(x + 196, y + 98, 104, 62, null, { dash: '5 5', stroke: OFF, empty: '비어 있음', op: op * s }); }
    else { dash(x + 72, y + 98, 104, 62, '대시보드', { op }); dash(x + 196, y + 98, 104, 62, '대시보드', { op }); }
    if (!o.empty || o.ds) { dbIcon(x + 72, y + 196, null, { s: 0.62 * (o.ds ?? 1), op, stroke: o.dsCol }); tx(x + 72, y + 246, 'Prometheus', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 600, opacity: op * (o.ds ?? 1) }); }
    else dash(x + 72, y + 200, 104, 62, null, { dash: '5 5', stroke: OFF, empty: '비어 있음', op: op * s });
    if (!o.empty) { [-26, 0, 26].forEach((d) => mini(x + 196 + d, y + 196, 0.62, INK, op)); tx(x + 196, y + 246, '사용자', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 600, opacity: op }); }
    else dash(x + 196, y + 200, 104, 62, null, { dash: '5 5', stroke: OFF, empty: '비어 있음', op: op * s }); }
  function s1(t, c) { const { k, u } = c;
    zone(14, 14, 588, 392, 'Grafana 인스턴스 하나 · localhost:3000');
    const sw = k === 4 ? E(u, 0.8, 1.8) : k > 4 ? 1 : 0;
    org(30, 'Main Org.', { id: 1, cur: k === 4 && sw < 0.5, op: k >= 4 ? lerp(1, 0.4, sw) : 1 });
    if (k >= 1) org(316, 'Acme Corp', { empty: true, s: k === 1 ? pop(u, 0.9) : 1, op: k === 1 ? fade(u, 0.8) : 1, cur: k >= 4 && sw >= 0.5,
      id: k >= 2 ? 2 : null, idCol: ACC, idS: k === 2 ? pop(u, 1.2) : 1, ds: k >= 5 ? (k === 5 ? pop(u, 1.6) : 1) : 0, dsCol: ACC });
    if (k === 1) { const f = seg(u, 1.3, 2.4); if (f > 0) { dash(lerp(102, 300, E(f, 0, 1)), 162, 104, 62, null, { op: 0.5 }); if (f >= 1) cross(300, 162, 14); }
      sub(300, 398, '자산은 안 따라온다', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); }
    if (k === 5) { const wl = E(u, 0.1, 0.9); el('line', { x1: 309, y1: 64, x2: 309, y2: 64 + 312 * wl, stroke: BAD, 'stroke-width': 4, 'stroke-dasharray': '8 6' });
      const f = seg(u, 0.9, 1.6); if (f > 0) { dbIcon(lerp(102, 286, E(f, 0, 1)), 260, null, { s: 0.45, op: 0.5 }); if (f >= 1) cross(296, 260, 13); }
      sub(450, 352, '같은 Prometheus를 다시 등록', fade(u, 1.8), { fill: ACC, 'font-weight': 700 }); }
    if (k >= 4) { const px = lerp(164, 450, sw); mini(px, 398, 0.7, ACC); }
    // 오른쪽 터미널: 이 장면의 호출이 쌓인다
    const L = [['$ GRAFANA=http://admin:admin@', null], ['        localhost:3000', null]];
    if (k >= 1) L.push(['$ curl -X POST $GRAFANA/api/orgs', null], ["  -d '{\"name\":\"Acme Corp\"}'", null]);
    if (k >= 2) L.push(['{"orgId":"2",', null], [' "message":"Organization created"}', null]);
    if (k >= 3) L.push(['$ curl $GRAFANA/api/orgs | jq', null], ['{id:1, name:"Main Org."}', null], ['{id:2, name:"Acme Corp"}', null]);
    if (k >= 4) L.push(['$ curl -X POST …/api/user/using/2', null]);
    if (k >= 5) L.push(['# 조직 사이 공유는 막혀 있다', 'var(--off)']);
    const prevN = [2, 4, 6, 9, 10, 11][Math.max(0, k - 1)] * (k > 0 ? 1 : 0), shown = lerp(k ? prevN : 0, L.length, E(u, 0.1, 1.2));
    terminal(616, 14, 330, 392, L, shown, { title: 'org-create.sh', fs: 13.5, lh: 23 });
    if (k === 3) { lock(860, 320, true, WARN, pop(u, 1.4)); tx(860, 360, 'server admin만', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) }); }
 }

  // ---------- 2. Team ----------
  const USERS = [['Dana', 3], ['Sam', 4], ['Lee', 5], ['Kim', 6], ['Park', 7]];
  function s2(t, c) { const { k, u } = c;
    zone(14, 14, 932, 392, 'org: Acme Corp  (지금 세션의 현재 조직)', { fill: ACCBG, stroke: ACC, sw: 2, color: ACC });
    // 조직 멤버 풀
    tx(40, 70, '조직 멤버', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const inTeam = (n) => (n === 'Dana' && k >= 3) || (n === 'Lee' && k >= 4);
    USERS.forEach(([n, id], i) => { const y = 112 + i * 56; if (inTeam(n)) { mini(70, y, 0.7, OFF, 0.5); tx(98, y + 5, n, { 'font-size': 14, fill: OFF }); return; }
      mini(70, y, 0.7, INK); tx(98, y + 5, n, { 'font-size': 14.5, 'font-weight': 700 }); mono(150, y + 5, 'userId ' + id, { 'font-size': 13.5, fill: MUT }); });
    if (k === 0) { card(560, 210, 300, 120, { dash: '6 6', stroke: BAD, fill: 'none', s: pop(u, 0.6) });
      tx(560, 200, '조직 밖으로 걸친 팀', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      sub(560, 226, '만들 수 없다', fade(u, 1), { fill: BAD }); el('line', { x1: 700, y1: 210, x2: 955, y2: 210, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 1.2) }); cross(560, 290, 16, pop(u, 1.4)); return; }
    // Platform 팀 상자
    const TX = 470, TY = 90, TW = 300, TH = 230, ts = k === 1 ? pop(u, 0.5) : 1;
    const g = G(TX + TW / 2, TY + TH / 2, ts); el('rect', { x: -TW / 2, y: -TH / 2, width: TW, height: TH, rx: 14, fill: PANEL, stroke: WARN, 'stroke-width': 2.5 }, g);
    tx(-TW / 2 + 16, -TH / 2 + 28, 'Platform 팀', { 'font-size': 17, 'font-weight': 800 }, g);
    if (k === 1) req(TX - 220, 48, 'POST', '/api/teams', 1, { op: fade(u, 0.1) });
    if (k >= 2) { pill(TX + TW - 60, TY + 26, 'teamId 1', ACC, k === 2 ? pop(u, 0.4) : 1, { mono: true, fs: 13.5 });
      if (k === 2) { mono(TX + 12, TY + TH + 34, '$ echo "created team: $TEAM_ID"', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) }); mono(TX + 12, TY + TH + 58, 'created team: 1', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); } }
    // 멤버 들어가기
    if (k === 3) { req(TX - 240, 48, 'POST', '/api/teams/1/members', 1, { op: fade(u, 0.1) }); const f = seg(u, 0.4, 1.4);
      if (f > 0 && f < 1) mini(lerp(70, TX + 70, E(f, 0, 1)), lerp(112, TY + 110, E(f, 0, 1)), 0.7, ACC);
      mini(330, 380, 0.7, BAD); tx(352, 385, '조직 밖 사용자', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.4) }); const b = seg(u, 1.4, 2.2); grow(360, 360, 440, 300, b < 1 ? b : 1, BAD, { plain: true }); if (b >= 1) cross(450, 292, 12); }
    if (k >= 3 && !(k === 3 && u < 1.4)) { mini(TX + 70, TY + 110, 0.75, ACC); tx(TX + 70, TY + 150, 'Dana', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }); }
    if (k >= 4) { if (k === 4) req(TX - 240, 48, 'PUT', '/api/teams/1/members', 1, { op: fade(u, 0.1) });
      const f = k === 4 ? seg(u, 0.4, 1.3) : 1; if (f < 1) mini(lerp(70, TX + 170, E(f, 0, 1)), lerp(224, TY + 110, E(f, 0, 1)), 0.7, ACC);
      else { mini(TX + 170, TY + 110, 0.75, INK); tx(TX + 170, TY + 150, 'Lee', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }); pill(TX + 170, TY + 182, 'member', MUT, 1, { fs: 13.5 }); }
      pill(TX + 70, TY + 182, 'admin', BAD, k === 4 ? pop(u, 1.4) : 1, { fs: 13.5 });
      if (k === 4) sub(TX + 150, TY + TH + 36, 'admins의 dana가 멤버를 직접 넣고 뺀다', fade(u, 1.8), { fill: INK, 'font-weight': 700 }); }
    if (k === 5) { // 권한은 팀에 걸리고, 사람은 갈아끼운다
      folder(870, 150, 120, 74, 'Team-Platform', { fs: 13.5 }); grow(TX + TW, 150, 806, 150, E(u, 0.1, 0.7), WARN); perm(800, 120, 'Edit', 'Edit', pop(u, 0.6));
      const out = seg(u, 0.9, 1.8); if (out > 0 && out < 1) mini(lerp(TX + 170, TX + 170, out), lerp(TY + 110, 400, E(out, 0, 1)), 0.7, OFF);
      sub(TX + 150, TY + TH + 36, '사람이 바뀌어도 팀의 Edit 권한은 그대로', fade(u, 1.8), { fill: INK, 'font-weight': 700 });
      card(870, 300, 130, 56, { rx: 10, stroke: GRID, text: 'On-call 팀', fs: 14, s: pop(u, 2.0) }); grow(TX + 82, TY + 130, 806, 300, seg(u, 2.0, 2.5), MUT, { dash: '4 4' }); } }

  // ---------- 3. Folder ----------
  const ITEMS = [['teamId 1', 'Platform 팀', 2, 'Edit'], ['teamId 2', 'Payment 팀', 1, 'View'], ['role Viewer', 'Viewer 전원', 1, 'View']];
  const DASH3 = ['Service Health', 'Latency', 'K8s Nodes'];
  function s3(t, c) { const { k, u } = c;
    const FX = 170, FY = 96;
    folder(FX, FY, 220, 96, 'Team-Platform', { s: k === 0 ? pop(u, 0.3) : 1, fs: 17 });
    mono(FX, FY + 70, 'uid: team-platform', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.8) : 1 });
    // URL 이 조립된다
    const url = k === 0 ? '/api/folders' : '/api/folders/team-platform/permissions';
    req(380, 48, 'POST', url, 1, { op: k <= 1 ? fade(u, 0.2) : 1 });
    if (k === 0) { fly(FX, FY + 70, 600, 48, seg(u, 1.2, 2.2), 'team-platform', { mono: true }); return; }
    // 대시보드 세 장 + 상속 선
    DASH3.forEach((d, i) => { const cx = 90 + i * 150, cy = 250, a = k === 1 ? seg(u, 0.4 + i * 0.25, 1.0 + i * 0.25) : 1;
      grow(FX, FY + 78, cx, cy - 40, a, MUT, { plain: true }); dash(cx, cy, 116, 66, d, { op: a });
      const got = ITEMS.slice(0, Math.max(0, k - 1)); got.forEach(([, who, , lv], j) => { const lab = j === 0 ? 'Platform' : j === 1 ? 'Payment' : 'Viewer';
        const a2 = k - 2 === j ? seg(u, 1.2 + i * 0.2, 1.6 + i * 0.2) : 1; perm(cx, cy + 78 + j * 30, lab + ' ' + lv, lv, a2); }); });
    if (k >= 2 && k <= 4) { const j = k - 2; for (let i = 0; i < 3; i++) dot([[FX, FY + 78], [90 + i * 150, 217]], seg(u, 0.6, 1.4), LV[ITEMS[j][3]], 6); }
    // 오른쪽: items 목록
    zone(560, 84, 380, 220, 'items  (POST 본문)');
    ITEMS.forEach(([id, who, n, lv], j) => { if (k < 2 + j) return; const y = 132 + j * 54, a = k === 2 + j ? pop(u, 0.2) : 1;
      card(750, y, 350, 44, { rx: 8, stroke: LV[lv], sw: 2, s: a });
      mono(588, y + 5, id, { 'font-size': 14.5, 'font-weight': 700, opacity: a }); tx(718, y + 5, who, { 'font-size': 13.5, fill: MUT, opacity: a });
      mono(890, y + 5, 'permission ' + n, { 'font-size': 13.5, 'font-weight': 700, fill: LV[lv], 'text-anchor': 'end', opacity: a }); });
    if (k === 1) sub(750, 200, '아직 비어 있다', fade(u, 0.6));
    if (k === 2) { [['1', 'View'], ['2', 'Edit'], ['4', 'Admin']].forEach(([n, lv], i) => { const x = 620 + i * 110; card(x, 346, 96, 40, { rx: 8, stroke: LV[lv], sw: n === '2' ? 3 : 1.5, text: n + ' = ' + lv, fs: 14, mono: true, s: pop(u, 1.4 + i * 0.15) }); }); }
    if (k === 5) { card(750, 340, 370, 52, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.4) });
      mono(588, 345, 'userId 9', { 'font-size': 14.5, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 0.6) }); tx(690, 345, '개인 부여는 팀·역할로 바꾼다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      const f = seg(u, 1.4, 2.2); perm(720, 396, '대시보드에서 Platform View로 낮추기', 'View', f, { op: f }); if (f >= 1) cross(880, 396, 11); } }

  // ---------- 4. 초대 · 역할 ----------
  const ROLES = ['Viewer', 'Editor', 'Admin'];
  function ladder(x, y, at, o) { o = o || {}; // 아래에서 위로 Viewer · Editor · Admin
    ROLES.forEach((r, i) => { const yy = y - i * 58, on = Math.round(at) === i; card(x, yy, 150, 46, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 3 : 1.5, fill: on ? ACCBG : PANEL, text: r, fs: 16, color: on ? ACC : MUT }); });
    const yy = y - at * 58; el('path', { d: `M${x - 98},${yy - 10} L${x - 82},${yy} L${x - 98},${yy + 10} Z`, fill: ACC }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { // 초대 카드 + 조직 문
      const doorOpen = k >= 2 ? (k === 2 ? E(u, 1.6, 2.4) : 1) : 0;
      el('rect', { x: 700, y: 60, width: 200, height: 300, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 2 }); tx(800, 90, 'org: Acme Corp', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 740, y: 120, width: 120 * (1 - doorOpen * 0.85), height: 210, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
      if (doorOpen < 0.5) lock(800, 225, true, BAD, k === 0 ? pop(u, 0.8) : 1); else { dash(820, 190, 70, 50, null, { s: 0.9 }); dash(820, 270, 70, 50, null, { s: 0.9 }); }
      if (k === 0) { req(40, 52, 'POST', '/api/org/invites', 1, { op: fade(u, 0.1) }); tx(800, 390, '초대 전에는 화면이 없다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); }
      // 초대 본문
      const F = [['loginOrEmail', '"dana@acme.io"'], ['name', '"Dana Kim"'], ['role', '"Editor"'], ['sendEmail', 'true']];
      zone(40, 90, 420, 230, 'POST /api/org/invites  본문');
      F.forEach(([kk, v], i) => { const need = i < 2 ? 1 : 2, y = 140 + i * 44; if (k < need) return; const a = k === need ? fade(u, 0.2 + (i % 2) * 0.4) : 1;
        mono(64, y, kk, { 'font-size': 15, fill: MUT, opacity: a }); mono(214, y, v, { 'font-size': 15, 'font-weight': 700, fill: i === 2 ? ACC : INK, opacity: a }); });
      if (k >= 2) { const f = k === 2 ? seg(u, 0.8, 1.7) : 1; // 메일이 날아간다
        if (f < 1) { const ex = lerp(470, 690, E(f, 0, 1)), ey = lerp(250, 200, E(f, 0, 1)); el('rect', { x: ex - 22, y: ey - 15, width: 44, height: 30, rx: 3, fill: PANEL, stroke: ACC, 'stroke-width': 2 }); el('path', { d: `M${ex - 22},${ey - 15} L${ex},${ey + 3} L${ex + 22},${ey - 15}`, fill: 'none', stroke: ACC, 'stroke-width': 2 }); }
        else { mini(800, 360, 0.7, ACC); tx(830, 365, 'Dana', { 'font-size': 14, 'font-weight': 700 }); } }
      if (k === 3) { req(40, 52, 'PATCH', '/api/org/users/5', 1, { op: fade(u, 0.1) }); }
      if (k >= 2) { const at = k === 3 ? lerp(1, 0, E(u, 0.6, 1.6)) : 1; ladder(560, 330, at); if (k === 3) tx(560, 140, 'Editor → Viewer', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); }
      return; }
    if (k === 4) { // 역할별로 할 수 있는 일
      const cols = ['대시보드 보기', '대시보드 생성·편집', '사용자·팀·DS 관리'], can = [[1, 0, 0], [1, 1, 0], [1, 1, 1]];
      cols.forEach((s, j) => tx(390 + j * 200, 70, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT }));
      ROLES.forEach((r, i) => { const y = 130 + i * 80; card(130, y, 150, 56, { rx: 10, text: r, fs: 17, stroke: [INFO, WARN, BAD][i], sw: 2.5 });
        can[i].forEach((v, j) => { const a = pop(u, 0.2 + (i * 3 + j) * 0.12); card(390 + j * 200, y, 150, 56, { rx: 10, stroke: v ? GOOD : GRID, fill: v ? C.GOODBG : PANEL, sw: 1.5, s: a }); if (v) check(390 + j * 200, y, 12, a); else cross(390 + j * 200, y, 9, a); }); });
      tx(480, 380, 'Editor도 권한이 열린 폴더 안에서만 편집한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    // 5. 전원 Editor 의 함정
    dash(480, 160, 200, 110, 'prod 운영 대시보드', { stroke: BAD, sw: 2.5 });
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, x = 480 + Math.cos(a) * 260, y = 160 + Math.sin(a) * 115, f = seg(u, 0.1 + i * 0.08, 0.6 + i * 0.08);
      mini(x, y, 0.6, INK, f); if (f > 0) pill(x, y + 36, 'Editor', WARN, f, { fs: 13.5 }); grow(x, y, lerp(x, 480, 0.55), lerp(y, 160, 0.55), seg(u, 0.9, 1.4), BAD, { plain: true }); }
    const lk = seg(u, 1.6, 2.2); if (lk > 0) { folder(480, 374, 300, 54, '폴더 권한으로 잠근다', { s: lk, stroke: GOOD, fill: C.GOODBG }); lock(310, 376, true, GOOD, lk); } }

  // ---------- 5. 격리냐 공유냐 ----------
  function s5(t, c) { const { k, u } = c;
    // 왼쪽: Organization 격리 (고객사 A / B)
    tx(240, 36, 'Organization으로 격리', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC });
    tx(720, 36, '단일 Org + Team + Folder', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INK, opacity: k >= 2 ? 1 : 0.35 });
    el('line', { x1: 480, y1: 20, x2: 480, y2: 290, stroke: GRID, 'stroke-width': 1.5 });
    ['고객사 A', '고객사 B'].forEach((n, i) => { const x = 30 + i * 220, a = k === 0 ? pop(u, 0.2 + i * 0.4) : 1;
      const g = G(x + 100, 160, a); el('rect', { x: -100, y: -105, width: 200, height: 210, rx: 12, fill: SOFT, stroke: ACC, 'stroke-width': 2 }, g); tx(-84, -80, n, { 'font-size': 15, 'font-weight': 700 }, g);
      dash(x + 100, 115, 120, 56, null, { op: a });
      if (k >= 1) { const d = k === 1 ? pop(u, 0.4 + i * 0.5) : 1; dbIcon(x + 100, 205, null, { s: 0.55 * d, stroke: k === 1 ? WARN : INK }); tx(x + 100, 250, 'Prometheus', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: d }); } });
    if (k === 0) { const w = E(u, 0.9, 1.6); el('line', { x1: 240, y1: 55, x2: 240, y2: 55 + 210 * w, stroke: BAD, 'stroke-width': 4, 'stroke-dasharray': '8 6' }); tx(240, 290, '서로 절대 안 보인다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    else el('line', { x1: 240, y1: 55, x2: 240, y2: 265, stroke: BAD, 'stroke-width': 4, 'stroke-dasharray': '8 6' });
    if (k === 1) tx(240, 290, '조직 수만큼 데이터소스를 다시 등록', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
    // 오른쪽: 한 조직 + 팀 폴더
    if (k >= 2) { const a = k === 2 ? fade(u, 0.1) : 1; el('rect', { x: 500, y: 55, width: 440, height: 220, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: a }); tx(516, 80, 'org: Acme Corp', { 'font-size': 15, 'font-weight': 700, opacity: a });
      [['Team-Platform', 600], ['Team-Payment', 840]].forEach(([n, x], i) => { const s = k === 2 ? pop(u, 0.4 + i * 0.4) : 1; folder(x, 130, 170, 64, n, { s, fs: 14, dash: '5 4' }); perm(x, 176, i ? 'Payment Edit' : 'Platform Edit', 'Edit', s); });
      if (k === 2) tx(720, 300, '폴더 권한이 경계, 부분 격리', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k >= 3) { const a = k === 3 ? pop(u, 0.3) : 1; dbIcon(720, 232, null, { s: 0.55 * a, stroke: GOOD }); tx(780, 240, '공용 Prometheus', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: a });
      [[600, 210], [840, 210]].forEach(([x, y]) => { grow(700, 228, x, y - 10, k === 3 ? seg(u, 0.7, 1.3) : 1, GOOD, { plain: true }); if (k === 3) for (let i = 0; i < 2; i++) dot([[720, 225], [x, y - 10]], ((t * 0.7 + i / 2) % 1), GOOD, 5); });
      if (k === 3) tx(720, 300, '대신 폴더 권한을 꼼꼼히 설계해야 한다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); }
    // 아래: 갈림길 · 처음에 정하라
    if (k === 4) { const q = pop(u, 0.2); card(480, 330, 230, 46, { rx: 23, fill: INK, stroke: 'none', text: '외부 고객끼리 격리?', fs: 15, color: PANEL, s: q });
      grow(366, 330, 250, 330, seg(u, 0.8, 1.4), ACC); grow(594, 330, 700, 330, seg(u, 1.2, 1.8), INK);
      tx(200, 302, '예', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) }); tx(760, 302, '아니오', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.7) });
      pill(170, 336, 'Organization', ACC, pop(u, 1.4), { fs: 14 }); pill(800, 336, '단일 Org + Team', INK, pop(u, 1.8), { fs: 14 }); }
    if (k === 5) { el('line', { x1: 60, y1: 340, x2: 900, y2: 340, stroke: GRID, 'stroke-width': 3 });
      [[110, '처음: 구조 결정', GOOD], [520, '운영 중', MUT], [820, '나중: 조직 이관', BAD]].forEach(([x, s, col], i) => { el('circle', { cx: x, cy: 340, r: 8, fill: col, opacity: fade(u, 0.2 + i * 0.4) }); tx(x, 372, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.4) }); });
      for (let i = 0; i < 4; i++) { const f = seg(u, 1.2 + i * 0.25, 2.0 + i * 0.25); if (f > 0 && f < 1) dash(lerp(700, 900, f), 312 - i * 4, 40, 28, null, { op: 0.8 }); }
      tx(820, 402, 'export / import 대공사', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.8) }); } }

  const quiz = [
    { q: 'Main Org.에 있는 Prometheus를 새로 만든 Acme Corp 조직에서 쓰려면 무엇을 해야 하나?',
      o: ['아무것도 안 해도 된다. 같은 서버라 자동으로 보인다', 'Acme Corp 조직에 데이터소스를 다시 등록한다', 'POST /api/user/using/1로 조직을 바꾼 채 쿼리한다'], a: 1,
      why: '조직은 완전히 격리된 테넌트라 데이터소스도 따라오지 않는다. 새 조직은 백지에서 시작하므로 조직마다 다시 등록해야 한다.' },
    { q: 'Dana가 Platform 팀에서 On-call 팀으로 옮겼을 때 권한을 팀에 걸어 둔 구조에서 할 일은 무엇인가?',
      o: ['Dana의 팀 멤버십만 바꾼다', '폴더마다 Dana의 개인 권한을 고친다', 'Dana를 다른 조직으로 옮긴다'], a: 0,
      why: '권한은 사람이 아니라 teamId에 걸려 있다. 멤버십만 갈아끼우면 권한이 따라온다.' },
    { q: 'team-platform 폴더의 permissions에 POST로 items 두 개만 보냈다. 원래 있던 세 번째 항목은 어떻게 되나?',
      o: ['지워진다', '그대로 남는다', '안의 대시보드에만 남는다'], a: 0,
      why: '폴더 권한 POST는 목록을 통째로 바꾼다. 본문에 없는 항목은 지워지므로 남길 항목도 함께 보내야 한다.' },
    { q: '모두를 Editor로 초대한 조직에서 운영 대시보드를 아무나 고치고 있다. 막는 방법은 무엇인가?',
      o: ['초대 메일을 다시 보낸다', '조직을 하나 더 만든다', '그 폴더 권한에서 편집할 팀을 좁힌다'], a: 2,
      why: '조직 역할은 상한일 뿐이고 실제 편집은 폴더 권한이 정한다. 폴더 단위로 잠가야 Editor도 그 폴더를 못 고친다.' },
    { q: '한 회사 안의 Platform 팀과 Payment 팀이 같은 Prometheus를 보면서 대시보드를 나눠 관리하려 한다. 맞는 구조는?',
      o: ['팀마다 Organization을 하나씩 만든다', '단일 조직에 팀과 팀별 폴더를 둔다', '팀마다 Grafana 서버를 따로 띄운다'], a: 1,
      why: '사내 팀 분리는 단일 조직 + 팀 + 폴더 권한이 정석이다. 같은 조직이라 데이터소스를 공용으로 쓸 수 있다.' },
  ];

  const summary = [
    '조직은 완전히 격리된 테넌트라 대시보드와 데이터소스가 조직 밖으로 나가지 않는다.',
    '팀은 조직 안의 사용자 묶음이고, 권한을 팀에 걸면 사람이 바뀌어도 멤버십만 고치면 된다.',
    '폴더에 건 권한은 안의 대시보드에 그대로 내려가고, 대시보드에서 낮출 수는 없다.',
    '외부 고객끼리 격리하면 조직을 나누고, 사내 팀 분리는 단일 조직에 팀과 폴더를 쓴다.',
  ];
  const review = [
    { q: '고객사 세 곳에 SaaS로 대시보드를 주려고 단일 조직에 팀 셋을 만들었다. 가장 먼저 걱정할 것은?',
      o: ['폴더 권한 실수 하나로 다른 고객사 화면이 보일 수 있다', '데이터소스를 세 번 등록해야 한다', '팀이 셋이면 사용자 초대가 안 된다'], a: 0,
      why: '팀과 폴더는 부분 격리라 설정 실수가 곧 유출이다. 고객사끼리 절대 보면 안 되면 Organization으로 나눠야 한다.' },
    { q: '신입 Park을 Viewer로 초대했는데 team-platform 폴더 대시보드를 고칠 수 있다. 먼저 볼 곳은?',
      o: ['Park의 조직 역할', 'Park이 속한 팀이 그 폴더에 받은 권한', 'Grafana 서버 버전'], a: 1,
      why: '조직 역할은 기본값이고 폴더 권한이 그 위에 얹힌다. Park이 Edit 권한을 받은 팀에 들어 있으면 그 폴더에서는 편집이 된다.' },
    { q: 'Platform 팀 관리자 dana가 휴가를 가 팀원 추가가 막혔다. 조직 Admin에게 매번 부탁하지 않으려면?',
      o: ['팀원 모두를 조직 Admin으로 올린다', '팀을 지우고 새로 만든다', '팀 admins 목록에 한 사람을 더 넣는다'], a: 2,
      why: 'admins 목록에 든 사람은 팀 안에서 멤버를 넣고 뺄 수 있다. 다만 이 호출은 목록을 통째로 바꾸므로 기존 멤버도 함께 적는다.' },
  ];

  R.page({ title: '조직 · 팀 · 폴더 구조', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
