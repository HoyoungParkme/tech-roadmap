/* V-1-2 Permission — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    dbIcon, person, cross, check, lock, crowd, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 지역 도우미 ----------
  const LV = { View: INFO, Edit: WARN, Admin: BAD, Query: GOOD };
  const RANK = { View: 1, Edit: 2, Admin: 4 };
  const perm = (cx, cy, s, lvl, sc, o) => pill(cx, cy, s, LV[lvl] || INK, sc, Object.assign({ fs: 13.5 }, o || {}));
  function req(x, y, m, path, o) { o = o || {}; const fs = o.fs || 14, mw = tw(m, fs) + 16, pw = tw(path, fs) + 18, h = fs + 14;
    const col = m === 'GET' ? INFO : m === 'POST' ? ACC : WARN, g = G(x, y, 1, o.op);
    el('rect', { x: 0, y: -h / 2, width: mw + pw, height: h, rx: 7, fill: PANEL, stroke: col, 'stroke-width': 1.8 }, g);
    el('rect', { x: 0, y: -h / 2, width: mw, height: h, rx: 7, fill: col }, g);
    mono(mw / 2, fs * 0.36, m, { 'font-size': fs, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g);
    mono(mw + 9, fs * 0.36, path, { 'font-size': fs, fill: INK }, g); return mw + pw; }
  function dash(cx, cy, w, h, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 1.8, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: -w / 2, y1: -h / 2 + Math.min(18, h * 0.3), x2: w / 2, y2: -h / 2 + Math.min(18, h * 0.3), stroke: GRID, 'stroke-width': 1.5 }, g);
    [0.45, 0.8, 0.6].forEach((v, i) => { const bw = (w - 30) / 3, bh = Math.max(2, (h - Math.min(18, h * 0.3) - 12) * v); el('rect', { x: -w / 2 + 8 + i * (bw + 7), y: h / 2 - 6 - bh, width: bw, height: bh, rx: 2, fill: o.bar || ACC, opacity: 0.75 }, g); });
    if (name) tx(0, h / 2 + 18, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 600, fill: o.color || INK, class: o.mono ? 'mono' : null }, g); return g; }
  function folder(cx, cy, w, h, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.stroke || WARN;
    el('path', { d: `M${-w / 2},${-h / 2} h${w * 0.38} l10,10 h${w * 0.62 - 10} v${h - 10} h${-w} z`, fill: o.fill || C.WARNBG, stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash }, g);
    if (name) tx(0, 10, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: INK, class: o.mono ? 'mono' : null }, g); return g; }
  const mini = (cx, cy, s, col, op) => person(cx, cy, null, { s, stroke: col || INK, op });
  // 켜고 끄는 스위치 (on 0→1)
  function toggle(cx, cy, on, col) { el('rect', { x: cx - 28, y: cy - 14, width: 56, height: 28, rx: 14, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    el('rect', { x: cx - 28, y: cy - 14, width: 56, height: 28, rx: 14, fill: col || GOOD, opacity: on });
    el('circle', { cx: lerp(cx - 14, cx + 14, on), cy, r: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); }

  // ---------- 1. 조직 역할 ----------
  const ROLES = ['Viewer', 'Editor', 'Admin'], RCOL = [INFO, WARN, BAD];
  const SW = [['canView', '대시보드 조회'], ['canEdit', '대시보드 생성·수정·삭제'], ['canAdmin', '사용자·데이터소스·권한 관리']];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { mini(480, 70, 0.9, ACC); tx(480, 120, 'kim', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      [['orgId 1 · acme-corp', 'Viewer', 250], ['orgId 2 · 다른 조직', 'Editor', 710]].forEach(([n, r, x], i) => { const a = pop(u, 0.3 + i * 0.5);
        const g = G(x, 270, a); el('rect', { x: -190, y: -100, width: 380, height: 200, rx: 14, fill: SOFT, stroke: GRID, 'stroke-width': 2 }, g); tx(-170, -70, n, { 'font-size': 15, 'font-weight': 700 }, g);
        grow(480, 100, x, 170, seg(u, 0.6 + i * 0.5, 1.2 + i * 0.5), MUT, { plain: true }); mini(x - 60, 280, 0.8, INK, a); perm(x + 50, 282, r, r === 'Viewer' ? 'View' : 'Edit', pop(u, 1.2 + i * 0.5), { fs: 15 }); });
      tx(480, 405, '같은 사람이라도 조직마다 역할이 따로다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2) }); return; }
    tx(40, 40, 'org: acme-corp  (orgId 1)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const act = { 1: null, 2: 0, 3: 1, 4: 2, 5: 0 }[k];
    // 왼쪽: 역할 칸 세 개 (아래에서 위로 Viewer < Editor < Admin)
    ROLES.forEach((r, i) => { const y = 320 - i * 90, on = act === i; card(150, y, 170, 62, { rx: 12, text: r, fs: 18, stroke: on ? RCOL[i] : GRID, sw: on ? 3.5 : 1.5, color: on ? RCOL[i] : MUT, fill: on ? PANEL : SOFT }); });
    if (k === 1) { const p = clamp(u / 2.4) * 2.99, i = Math.floor(p); el('circle', { cx: 60, cy: 320 - i * 90, r: 11, fill: ACC });
      tx(150, 390, '역할 토큰은 언제나 하나', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) }); }
    else if (act != null) el('circle', { cx: 60, cy: 320 - act * 90, r: 11, fill: RCOL[act] });
    // 오른쪽: 세 스위치
    zone(300, 70, 640, 230, '이 역할이 주는 것');
    SW.forEach(([kk, d], i) => { const y = 120 + i * 62, base = act == null ? 0 : i <= act ? 1 : 0;
      const on = act == null ? 0 : (i === act && k >= 2 && k <= 4 ? E(u, 0.5, 1.2) : base);
      mono(330, y + 5, kk, { 'font-size': 15, 'font-weight': 700, fill: on > 0.5 ? INK : MUT }); tx(470, y + 5, d, { 'font-size': 14.5, fill: on > 0.5 ? INK : MUT });
      toggle(880, y, on, [INFO, WARN, BAD][i]); });
    if (k === 2) { dash(470, 360, 150, 70, null, { op: fade(u, 1.2) }); card(620, 360, 90, 34, { rx: 8, text: '저장', fs: 14, stroke: GRID, color: OFF, op: fade(u, 1.4) }); cross(620, 360, 12, pop(u, 1.8));
      tx(700, 365, '저장 버튼이 없다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.9) }); }
    if (k === 3) { dash(470, 360, 150, 70, null, {}); pill(620, 360, '✎ 편집', WARN, pop(u, 1.3), { fs: 14 }); mini(760, 360, 0.6, OFF); cross(760, 360, 12, pop(u, 1.7)); tx(790, 365, '사람·권한은 못 건드림', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { [['사용자', 0], ['데이터소스', 1], ['권한', 2]].forEach(([n, j]) => { const x = 440 + j * 170, a = pop(u, 1.2 + j * 0.25);
      if (j === 0) mini(x, 352, 0.7, BAD, a); else if (j === 1) dbIcon(x, 358, null, { s: 0.45 * a, stroke: BAD }); else lock(x, 358, true, BAD, a);
      tx(x + 30, 364, n, { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: a }); }); }
    if (k === 5) { mono(330, 340, '[users] auto_assign_org_role = Viewer', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      for (let i = 0; i < 3; i++) { const f = seg(u, 0.6 + i * 0.4, 1.3 + i * 0.4), x = 420 + i * 130; if (f <= 0) continue; mini(lerp(960, x, E(f, 0, 1)), 386, 0.6, INK); if (f >= 1) perm(x + 46, 388, 'Viewer', 'View', 1); } } }

  // ---------- 2. 두 개의 축 ----------
  const COLS = ['team-platform', 'team-payment', 'shared'], CX = [380, 590, 800];
  function cellRow(y, vals, o) { o = o || {}; CX.forEach((x, i) => { const v = vals[i], a = o.a ? o.a(i) : 1;
      el('rect', { x: x - 90, y: y - 30, width: 180, height: 60, rx: 10, fill: v ? PANEL : SOFT, stroke: v ? LV[v] : GRID, 'stroke-width': v ? 2.2 : 1.5, 'stroke-dasharray': v ? null : '5 5', opacity: o.op ?? 1 });
      if (v) { for (let b = 0; b < RANK[v]; b++) el('rect', { x: x - 76 + b * 16, y: y - 12, width: 12, height: 24, rx: 3, fill: LV[v], opacity: a });
        tx(x + 40, y + 6, v, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: LV[v], opacity: a }); }
      else if (o.none) tx(x, y + 5, o.none, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: o.noneOp ?? 1 }); }); }
  function s2(t, c) { const { k, u } = c;
    COLS.forEach((n, i) => folder(CX[i], 46, 170, 44, n, { fs: 14, mono: true }));
    tx(40, 132, '축 1 · 조직 역할', { 'font-size': 15, 'font-weight': 700 }); mono(40, 154, 'kim.dev = Viewer', { 'font-size': 13.5, fill: MUT });
    cellRow(140, ['View', 'View', 'View'], { a: (i) => (k === 0 ? fade(u, 0.3 + i * 0.4) : 1) });
    if (k === 0) { tx(590, 230, '아무 설정이 없으면 어디서도 편집할 수 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); return; }
    tx(40, 232, '축 2 · 리소스 권한', { 'font-size': 15, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.2) : 1 }); mono(40, 254, 'resourcePermissions', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 0.2) : 1 });
    const r2 = k >= 2 && !(k === 2 && u < 1.2) ? ['Edit', null, null] : [null, null, null];
    cellRow(240, r2, { op: k === 1 ? fade(u, 0.3) : 1, none: k >= 3 ? '없음' : '', noneOp: k === 3 ? fade(u, 0.5) : 1 });
    if (k === 2) fly(380, 96, 380, 240, seg(u, 0.3, 1.2), 'Edit', { fill: WARN });
    if (k === 2) mono(470, 300, 'assignedTo: kim.dev', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
    if (k === 3) pill(820, 300, '개별 권한 1건', ACC, pop(u, 1.0), { fs: 14 });
    if (k >= 4) { tx(40, 352, '유효 권한', { 'font-size': 15, 'font-weight': 800, fill: ACC }); mono(40, 374, '높은 쪽이 이긴다', { 'font-size': 13.5, fill: MUT });
      CX.forEach((x, i) => { grow(x, 170, x, 318, k === 4 ? seg(u, 0.2 + i * 0.2, 0.8 + i * 0.2) : 1, MUT, { plain: true, dash: '3 4' }); });
      cellRow(350, ['Edit', 'View', 'View'], { a: (i) => (k === 4 ? fade(u, 1.0 + i * 0.3) : 1) }); }
    if (k === 5) banner(590, 404, '기본은 낮게, 필요한 폴더만 올린다 · least-privilege', pop(u, 0.4)); }

  // ---------- 3. 폴더 권한 상속 ----------
  function grid12(fill) { for (let i = 0; i < 12; i++) { const r = Math.floor(i / 3), cc = i % 3, x = 700 + cc * 84, y = 150 + r * 62, f = fill ? fill(i) : 0;
      dash(x, y, 70, 44, null, { stroke: f > 0.5 ? WARN : GRID, sw: f > 0.5 ? 2.2 : 1.5, bar: f > 0.5 ? WARN : OFF }); } }
  function s3(t, c) { const { k, u } = c;
    folder(784, 76, 250, 56, 'team-platform', { fs: 15, mono: true });
    const fillAt = k === 5 ? (i) => seg(u, 0.4 + Math.floor(i / 3) * 0.35, 0.6 + Math.floor(i / 3) * 0.35) : k > 5 ? () => 1 : () => 0;
    grid12(fillAt);
    if (k === 0) { // set -euo pipefail
      [['set -euo pipefail', 70], ['set 없음', 250]].forEach(([n, y], row) => { mono(40, y - 16, n, { 'font-size': 15, 'font-weight': 700, fill: row ? MUT : ACC });
        ['1단계', '2단계 실패', '3단계'].forEach((s, i) => { const x = 110 + i * 170, f = seg(u, 0.3 + i * 0.5, 0.7 + i * 0.5), bad = i === 1, skip = !row && i === 2;
          card(x, y + 30, 140, 46, { rx: 8, text: s, fs: 14, stroke: bad ? BAD : skip ? GRID : row && i === 2 ? WARN : GOOD, color: skip ? OFF : INK, dash: skip ? '5 4' : null, op: skip ? 0.6 : f }); if (i < 2) grow(x + 72, y + 30, x + 98, y + 30, f, MUT); });
        if (!row) tx(450, y + 100, '실패하면 거기서 멈춘다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        else tx(450, y + 100, '실패를 삼키고 다음 줄을 실행한다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); });
      return; }
    if (k === 1) [['GRAFANA', 'https://grafana.acme.internal'], ['FOLDER_UID', 'team-platform'], ['PLATFORM_TEAM_ID', '12']].forEach(([n, v], i) => { const y = 110 + i * 86, a = pop(u, 0.3 + i * 0.45);
      card(300, y, 520, 60, { rx: 10, stroke: i ? ACC : GRID, sw: 2, s: a }); mono(60, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: a }); mono(250, y + 5, '= ' + v, { 'font-size': 15, opacity: a }); });
    if (k === 1) grow(560, 196, 650, 86, seg(u, 1.6, 2.3), ACC);
    if (k === 2) { [['1', 'View'], ['2', 'Edit'], ['4', 'Admin']].forEach(([n, lv], i) => { const y = 120 + i * 90, on = i === 1;
        card(260, y, 360, 66, { rx: 12, stroke: LV[lv], sw: on ? 3.5 : 1.5, fill: on ? PANEL : SOFT, s: pop(u, 0.2 + i * 0.2) }); mono(120, y + 7, 'permission ' + n, { 'font-size': 17, 'font-weight': 800, fill: LV[lv] }); tx(340, y + 7, lv, { 'font-size': 17, 'font-weight': 700 }); });
      const y = lerp(120, 210, E(u, 1.1, 1.8)); el('path', { d: `M50,${y - 12} L70,${y} L50,${y + 12} Z`, fill: WARN }); }
    if (k === 3) { req(40, 60, 'POST', '/api/folders/team-platform/permissions', { op: fade(u, 0.1) });
      mono(40, 110, '-H "Authorization: Bearer $GRAFANA_TOKEN"', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) });
      dot([[330, 76], [650, 76]], seg(u, 0.8, 1.8), ACC, 8); sub(330, 160, '권한 변경도 API 호출 한 번', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 }); }
    if (k === 4) { zone(40, 60, 560, 250, 'items');
      [['teamId 12', 'Platform 팀', 'permission 2', 'Edit'], ['role Viewer', '조직 Viewer 전원', 'permission 1', 'View']].forEach(([a1, b1, c1, lv], i) => { const y = 112 + i * 62, a = pop(u, 0.3 + i * 0.5);
        card(320, y, 520, 48, { rx: 8, stroke: LV[lv], sw: 2, s: a }); mono(74, y + 5, a1, { 'font-size': 15, 'font-weight': 700, opacity: a }); tx(230, y + 5, b1, { 'font-size': 14, fill: MUT, opacity: a }); mono(565, y + 5, c1, { 'font-size': 14, 'font-weight': 700, fill: LV[lv], 'text-anchor': 'end', opacity: a }); });
      card(320, 236, 520, 48, { rx: 8, stroke: GRID, dash: '5 5', fill: 'none', op: fade(u, 1.5) }); mono(74, 241, 'userId …', { 'font-size': 15, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.5) });
      tx(250, 241, '개인 부여 없음 → 퇴사자 권한이 남을 자리가 없다', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 5) { for (let i = 0; i < 4; i++) dot([[784, 104], [784, 150 + i * 62]], seg(u, 0.2 + i * 0.35, 0.6 + i * 0.35), WARN, 6);
      tx(330, 200, '보드가 100개여도', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, opacity: fade(u, 1.2) });
      tx(330, 240, '관리 지점은 폴더 한 곳', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6) });
      perm(330, 300, 'Platform 팀 Edit 상속', 'Edit', pop(u, 2.0), { fs: 15 }); } }

  // ---------- 4. 대시보드 개별 권한 ----------
  const DROWS = [['lee.pay', 'userId 21', 'Edit'], ['park.pay', 'userId 22', 'Edit'], ['role Viewer', '', 'View']];
  function s4(t, c) { const { k, u } = c;
    const moved = k === 5 ? E(u, 1.9, 2.7) : 0;
    if (k < 6) { folder(200, 70, 300, 60, 'team-platform', { fs: 15, mono: true });
      perm(200, 126, '상속: Platform 팀 Edit', 'Edit', 1);
      grow(200, 142, 200, 186, k === 0 ? seg(u, 0.4, 1.0) : 1, WARN);
      if (k === 0) dot([[200, 142], [200, 196]], seg(u, 0.6, 1.4), WARN, 7);
      if (moved > 0) folder(790, 330, 280, 110, null, { stroke: GOOD, fill: C.GOODBG, op: fade(u, 1.7) });
      dash(lerp(200, 790, moved), lerp(240, 322, moved), lerp(170, 110, moved), lerp(84, 56, moved), moved > 0.95 ? null : 'prod-billing', { stroke: BAD, sw: 2.5, mono: true });
      if (moved > 0.95) mono(790, 380, 'billing-restricted', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
      if (k === 0) tx(200, 330, '결제 담당 두 명만 고치게 하고 싶다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k >= 1 && k < 6) { const a = k === 1 ? fade(u, 0.1) : 1;
      if (k === 1) req(400, 40, 'POST', '/api/dashboards/uid/prod-billing/permissions', { op: a, fs: 13.5 });
      zone(500, 74, 440, 200, '이 보드에 직접 건 items', { op: a });
      if (k === 1) { tx(720, 180, '비어 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: a }); tx(200, 380, '상속 권한은 그대로 남는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); }
      DROWS.forEach(([n, id, lv], i) => { if (k < 2 + i) return; const y = 124 + i * 50, s = k === 2 + i ? pop(u, 0.3) : 1;
        card(720, y, 410, 40, { rx: 8, stroke: LV[lv], sw: 2, s }); mono(530, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: s }); mono(680, y + 5, id, { 'font-size': 13.5, fill: MUT, opacity: s });
        mono(910, y + 5, lv, { 'font-size': 15, 'font-weight': 800, fill: LV[lv], 'text-anchor': 'end', opacity: s }); }); }
    if (k === 5) { // 팀원 dana 의 유효 권한
      mini(80, 380, 0.7, INK); tx(110, 372, 'Platform 팀원', { 'font-size': 14, 'font-weight': 700 });
      mono(110, 394, 'max(상속 Edit, 보드 없음) = Edit', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) });
      const er = seg(u, 0.9, 1.3); if (er > 0 && moved < 0.1) { card(720, 306, 420, 44, { rx: 8, stroke: BAD, sw: 2.5, fill: C.BADBG, s: er }); mono(530, 311, 'Platform 팀 → View', { 'font-size': 14.5, opacity: er }); tx(910, 311, '낮출 수 없음', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: er }); }
      if (u > 2.7) tx(560, 406, '좁히려면 폴더를 나눈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD }); }
    if (k === 6) { // 개별 권한이 여기저기 붙은 모습
      for (let i = 0; i < 8; i++) { const x = 110 + (i % 4) * 240, y = 110 + Math.floor(i / 4) * 170, a = pop(u, 0.1 + i * 0.12), many = i % 3 !== 2;
        dash(x, y, 140, 74, null, { s: a, stroke: many ? BAD : GRID }); if (many) for (let j = 0; j < 3; j++) { el('rect', { x: x + 50, y: y - 46 + j * 14, width: 26, height: 10, rx: 2, fill: [WARN, INFO, BAD][j], opacity: a }); } }
      for (let i = 0; i < 6; i++) { const a = [110 + (i % 4) * 240, 110 + Math.floor(i / 4) * 170], b = [110 + ((i + 2) % 4) * 240, 280 - Math.floor(i / 4) * 170]; grow(a[0], a[1], b[0], b[1], seg(u, 1.0 + i * 0.1, 1.6 + i * 0.1), OFF, { plain: true, dash: '3 4' }); }
      banner(480, 395, '왜 되고 왜 안 되는지 아무도 설명 못 한다', pop(u, 1.8)); } }

  // ---------- 5. 데이터소스 권한 ----------
  function s5(t, c) { const { k, u } = c;
    const L = [['Viewer 역할', 110], ['결제팀 (34)', 230], ['Platform 팀', 340]];
    L.forEach(([n, y], i) => { if (i === 0) crowd(110, y - 10, 10, null); else mini(110, y - 6, 0.8, i === 1 && k >= 1 ? ACC : INK); tx(110, y + 44, n, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: i === 1 && k >= 1 ? ACC : INK }); });
    dbIcon(820, 110, null, { s: 0.7 }); tx(820, 166, 'prom-shared', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
    dbIcon(820, 290, null, { s: 0.7, stroke: k >= 1 ? BAD : INK }); tx(820, 346, 'pg-billing-prod', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: k >= 1 ? BAD : INK });
    if (k >= 1) lock(880, 262, true, BAD, k === 1 ? pop(u, 0.4) : 1);
    if (k === 0) { dash(470, 110, 150, 80, '결제 대시보드', {}); grow(160, 100, 390, 108, seg(u, 0.2, 0.8), INFO); tx(270, 84, '보드 보기', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, opacity: fade(u, 0.6) });
      grow(545, 110, 760, 270, seg(u, 1.0, 1.6), MUT, { dash: '6 5' }); card(650, 196, 150, 40, { rx: 8, stroke: WARN, text: '쿼리 권한?', fs: 14, color: WARN, s: pop(u, 1.4) });
      tx(470, 400, '보드를 볼 수 있어도 소스를 쿼리할 권한은 따로다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    // 쿼리 선: Viewer → 두 소스, 결제팀, Platform
    const vCut = k >= 2 ? (k === 2 ? seg(u, 1.0, 1.6) : 1) : 0;
    grow(160, 100, 760, 108, 1, GOOD, { plain: true }); if (k >= 5) for (let i = 0; i < 3; i++) dot([[160, 100], [760, 108]], ((t * 0.6 + i / 3) % 1), GOOD, 5);
    if (vCut < 1) grow(160, 106, 760, 282, 1, GOOD, { plain: true, op: 1 - vCut * 0.7 }); else { el('line', { x1: 160, y1: 106, x2: 450, y2: 192, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); }
    if (k === 2) { cross(460, 195, 14, pop(u, 1.4)); req(300, 400, 'POST', '…/datasources/pg-billing-prod/builtInRoles/Viewer', { op: fade(u, 0.1), fs: 13 }); }
    if (k === 1) { pill(110, 300, 'PAYMENT_TEAM_ID=34', ACC, pop(u, 0.8), { mono: true, fs: 13.5 }); tx(700, 400, '민감 소스부터 목록으로 뽑는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); }
    // pg 의 권한 목록
    if (k >= 2) { zone(480, 220, 230, 110, 'pg-billing-prod 권한', { fill: SOFT });
      const gone = k === 3 ? E(u, 0.4, 1.2) : k > 3 ? 1 : 0;
      mono(500, 272, 'Viewer: Query', { 'font-size': 14, fill: gone > 0.5 ? OFF : GOOD, 'text-decoration': gone > 0.5 ? 'line-through' : null });
      if (k === 3) { mono(500, 300, 'permission: ""', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); tx(595, 360, '빈 문자열 = 삭제', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
      if (k >= 4) mono(500, 300, '결제팀: Query', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: k === 4 ? fade(u, 1.2) : 1 }); }
    if (k >= 4) { grow(150, 226, 760, 286, k === 4 ? seg(u, 0.3, 1.1) : 1, GOOD); if (k === 4) { req(300, 400, 'POST', '…/datasources/pg-billing-prod/teams/34', { op: fade(u, 0.1), fs: 13 }); for (let i = 0; i < 2; i++) dot([[150, 226], [760, 286]], ((t * 0.7 + i / 2) % 1), GOOD, 5); } }
    if (k === 5) { pill(260, 380, 'Explore 임의 쿼리', WARN, pop(u, 0.3), { fs: 13.5 }); const f = seg(u, 0.6, 1.6); grow(150, 336, lerp(150, 740, f), lerp(336, 300, f), f < 1 ? 1 : 1, BAD, { plain: true });
      if (f >= 1) cross(745, 300, 14); tx(620, 400, 'Platform 팀은 결제 DB를 못 건드린다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); } }

  // ---------- 6. 감사 ----------
  const TRAPS = ['Editor 과다', '개인 권한', '공개 대시보드', 'General 보드'];
  function s6(t, c) { const { k, u } = c;
    zone(20, 20, 330, 380, '분기 감사 · audit-permissions.sh');
    TRAPS.forEach((n, i) => { const y = 84 + i * 66, st = k === 5 || k > i + 1 ? 'done' : k === i + 1 ? 'run' : 'wait';
      card(185, y, 290, 50, { rx: 10, stroke: st === 'run' ? ACC : st === 'done' ? GOOD : GRID, sw: st === 'run' ? 3 : 1.8, fill: st === 'run' ? ACCBG : PANEL });
      tx(50, y + 5, '함정 ' + (i + 1), { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(110, y + 5, n, { 'font-size': 15, 'font-weight': 700 });
      if (st === 'done') check(305, y, 10); else if (st === 'run') el('circle', { cx: 305, cy: y, r: 7, fill: ACC, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 4)) }); else tx(305, y + 5, '대기', { 'text-anchor': 'middle', 'font-size': 13.5, fill: OFF }); });
    if (k === 0) { lock(420, 200, true, ACC, pop(u, 0.2)); mono(380, 400, 'H=(-H "Authorization: Bearer …")  토큰 하나, 조회 네 번', { 'font-size': 14, fill: ACC, opacity: fade(u, 0.4) });
      ['/api/org/users', '/api/folders/…/permissions', '/api/dashboards/public-dashboards', '/api/search?folderIds=0'].forEach((p, i) => { const y = 80 + i * 90 - (i > 1 ? 0 : 0);
        grow(440, 215, 560, y + 2, seg(u, 0.8 + i * 0.25, 1.3 + i * 0.25), ACC); req(570, y, 'GET', p, { op: fade(u, 1.0 + i * 0.25), fs: 13 }); }); return; }
    const X = 380;
    if (k === 1) { tx(X, 56, 'GET /api/org/users  (예시 응답)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['admin', 'Admin'], ['kim.dev', 'Viewer'], ['dana', 'Editor']].forEach(([n, r], i) => { const y = 100 + i * 46, hit = r !== 'Viewer', f = fade(u, 0.8 + i * 0.2);
        card(X + 180, y, 360, 38, { rx: 8, stroke: hit && u > 1.2 ? BAD : GRID, sw: hit && u > 1.2 ? 2.5 : 1.5 }); mono(X + 20, y + 5, n, { 'font-size': 14.5 }); mono(X + 330, y + 5, r, { 'font-size': 14.5, 'font-weight': 700, fill: hit ? BAD : MUT, 'text-anchor': 'end', opacity: f }); });
      terminal(X, 260, 540, 130, [['$ … | jq -r \'.[] | select(.role != "Viewer") …\'', null], ['admin -> Admin', null], ['dana -> Editor', null]], lerp(0, 3, E(u, 1.3, 2.4)), { fs: 13.5, title: 'Editor 이상' }); }
    if (k === 2) { tx(X, 56, 'GET /api/folders/team-platform/permissions  (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['teamId 12', 'userId 0'], ['role Viewer', 'userId 0'], ['old.user', 'userId 9']].forEach(([n, id], i) => { const y = 100 + i * 46, hit = i === 2;
        card(X + 180, y, 360, 38, { rx: 8, stroke: hit && u > 1.2 ? BAD : GRID, sw: hit && u > 1.2 ? 2.5 : 1.5 }); mono(X + 20, y + 5, n, { 'font-size': 14.5 }); mono(X + 330, y + 5, id, { 'font-size': 14.5, 'font-weight': 700, fill: hit ? BAD : MUT, 'text-anchor': 'end', opacity: fade(u, 0.6) }); });
      terminal(X, 260, 540, 130, [['$ … | jq -r \'.[] | select(.userId > 0) …\'', null], ['old.user', null], ['# 팀·역할 항목은 userId 0', 'var(--off)']], lerp(0, 3, E(u, 1.3, 2.4)), { fs: 13.5, title: '개인 부여' }); }
    if (k === 3) { const cx = 650, cy = 180, a = pop(u, 0.2); el('circle', { cx, cy, r: 70 * a, fill: 'none', stroke: INFO, 'stroke-width': 3 }); el('ellipse', { cx, cy, rx: 30 * a, ry: 70 * a, fill: 'none', stroke: INFO, 'stroke-width': 2 }); el('line', { x1: cx - 70 * a, y1: cy, x2: cx + 70 * a, y2: cy, stroke: INFO, 'stroke-width': 2 });
      tx(cx, 290, '로그인 없이 누구나 보는 보드', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
      mono(cx, 340, '.publicDashboards[]  →  (없음)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) }); check(cx + 170, 336, 12, pop(u, 1.6));
      tx(cx, 380, '목록이 비어 있는 것이 정상이다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 4) { folder(780, 300, 240, 120, 'team-platform', { fs: 15, mono: true });
      ['Cost', 'Latency', 'Old test'].forEach((n, i) => { const f = seg(u, 1.0 + i * 0.35, 1.8 + i * 0.35), x0 = 430 + i * 150, y0 = 110;
        dash(lerp(x0, 720 + i * 60, E(f, 0, 1)), lerp(y0, 300, E(f, 0, 1)), 110, 64, f < 0.3 ? n : null, { stroke: f < 1 ? BAD : WARN, s: lerp(1, 0.4, f) }); });
      tx(580, 210, 'General (폴더 없음) · 상속받을 권한도 없다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: 1 - fade(u, 1.6) }); }
    if (k === 5) [['기본은 Viewer', INFO], ['부여는 팀·폴더', WARN], ['개별 권한·공개는 예외', BAD]].forEach(([n, col], i) => { const y = 110 + i * 100, a = pop(u, 0.3 + i * 0.4);
      card(650, y, 470, 70, { rx: 12, stroke: col, sw: 2.5, s: a }); tx(650, y + 7, n, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: a }); }); }

  const quiz = [
    { q: '신규 입사자의 기본 조직 역할로 Viewer가 안전한 이유는 무엇인가?',
      o: ['Viewer는 데이터소스를 쿼리할 수 없어서', '조회만 가능해 운영 보드를 실수로 망가뜨릴 여지가 없어서', 'Viewer는 폴더 권한을 받을 수 없어서'], a: 1,
      why: 'Viewer는 canView만 켜져 있어 저장 버튼 자체가 없다. 필요한 사람만 나중에 올리면 된다.' },
    { q: '조직 역할이 Viewer인 kim.dev가 team-platform 폴더에서만 편집할 수 있는 까닭은 무엇인가?',
      o: ['조직 역할이 자동으로 Editor로 바뀌어서', '그 폴더에 개별 Edit 권한이 있고, 두 축 중 높은 쪽이 적용되어서', '폴더 권한이 조직 역할을 지워서'], a: 1,
      why: '유효 권한은 조직 역할과 리소스 권한 중 더 높은 쪽이다. team-platform 안에서는 Edit, 그 밖에서는 View가 된다.' },
    { q: '보드가 100개인 폴더에서 Platform 팀 권한을 관리하는 가장 좋은 방법은 무엇인가?',
      o: ['폴더에 teamId 12 Edit을 한 번 건다', '보드 100개에 팀원 이름을 하나씩 건다', '팀원 모두를 조직 Editor로 올린다'], a: 0,
      why: '폴더 권한은 안의 모든 대시보드에 상속된다. 관리 지점이 폴더 한 곳이고, 사람 변화는 팀 멤버십으로 처리한다.' },
    { q: 'team-platform 폴더(Platform 팀 Edit) 안의 prod-billing에 lee.pay·park.pay Edit을 추가했다. Platform 팀의 다른 사람은 이 보드에서 어떻게 되나?',
      o: ['View로 내려간다', '여전히 Edit이다', '아예 볼 수 없다'], a: 1,
      why: 'Grafana는 가장 높은 권한을 적용하므로 대시보드 권한으로 상속된 Edit을 낮출 수 없다. 좁히려면 보드를 다른 폴더로 옮긴다.' },
    { q: 'pg-billing-prod에서 Viewer 기본 역할의 쿼리권을 없애려면 builtInRoles/Viewer에 무엇을 보내나?',
      o: ['{"permission": "Query"}', '{"permission": ""}', '{"permission": "Admin"}'], a: 1,
      why: 'permission을 빈 문자열로 보내면 그 대상의 권한이 지워진다. 그다음 teams/34에 Query를 줘 결제팀만 연다.' },
    { q: '감사 스크립트에서 폴더 권한의 개인 부여만 골라내는 jq 조건은 무엇인가?',
      o: ['select(.userId != null)', 'select(.userId > 0)', 'select(.teamId > 0)'], a: 1,
      why: '팀·역할 항목도 userId 필드를 0으로 갖고 있어서 != null은 모두 걸린다. 0보다 큰 항목만 실제 개인 부여다.' },
  ];

  const summary = [
    '조직 역할은 Viewer, Editor, Admin 중 하나이고 신규 사용자 기본값은 Viewer가 안전하다.',
    '폴더나 대시보드에 건 권한이 조직 역할 위에 얹히고, 둘 중 높은 쪽이 적용된다.',
    '폴더에 팀 권한을 걸면 안의 보드가 모두 물려받고, 보드에서 그 권한을 낮출 수는 없다.',
    '데이터소스 쿼리 권한은 따로 관리하므로 민감한 소스는 기본 역할 권한을 걷고 팀에만 연다.',
  ];
  const review = [
    { q: '결제팀만 고쳐야 할 prod-billing 보드를 Platform 팀원이 계속 고친다. 가장 먼저 할 일은?',
      o: ['보드에 Platform 팀 View를 추가한다', '보드를 Platform 팀 권한이 없는 폴더로 옮긴다', 'Platform 팀원의 조직 역할을 Viewer로 바꾼다'], a: 1,
      why: '폴더에서 받은 Edit은 보드 권한으로 낮출 수 없다. 조직 역할을 낮춰도 폴더의 팀 Edit이 남으므로 폴더를 나눠야 한다.' },
    { q: 'Viewer인 직원이 결제 대시보드는 못 보는데 Explore에서 결제 DB를 쿼리했다. 빠진 설정은?',
      o: ['결제 폴더에 Viewer View 추가', 'pg-billing-prod의 기본 역할 쿼리권 회수', '대시보드 개별 권한 추가'], a: 1,
      why: '대시보드 권한과 데이터소스 쿼리 권한은 서로 다른 축이다. Explore는 대시보드를 거치지 않으므로 소스 쪽을 잠가야 한다.' },
    { q: '분기 감사에서 폴더 권한에 old.user 개인 항목이 나왔다. 가장 알맞은 조치는?',
      o: ['그 항목을 지우고 필요한 권한은 팀으로 다시 준다', '그대로 두고 메모만 남긴다', '조직을 새로 만든다'], a: 0,
      why: '개인에게 건 권한은 퇴사자 권한으로 남기 쉽다. 팀에 걸면 멤버십만 관리하면 되어 같은 문제가 다시 생기지 않는다.' },
  ];

  R.page({ title: '권한 두 축과 상속', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
