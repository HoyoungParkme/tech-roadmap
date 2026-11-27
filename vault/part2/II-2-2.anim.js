/* II-2-2 revocation — 즉시 회수 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: lease 와 실제 DB 계정을 잇는 사슬, 활성 lease 표에서 표적 하나 지우기, 경로 나무(database/creds/app…)를 가지째 자르기,
 *       마운트 전체를 끄는 비상 스위치, 부모 token 에서 자식 token·lease 로 번지는 연쇄 폐기.
 * 숫자(47분, 12분, 55분, 47개)와 이름(Hk9, Qr3, Zx8, 8fH2)은 페이지 코드·STEPS 데이터에서 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    server, dbIcon, person, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function vault(cx, cy, w, h, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    const dx = -w / 2 + 26, dy = -h / 2 + 26;
    el('circle', { cx: dx, cy: dy, r: 13, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + (o.spin || 0); el('line', { x1: dx, y1: dy, x2: dx + Math.cos(a) * 9, y2: dy + Math.sin(a) * 9, stroke: ACC, 'stroke-width': 2 }, g); }
    tx(dx + 22, dy + 6, 'Vault', { 'font-size': 17, 'font-weight': 800, fill: ACC }, g); return g; }
  function cmd(x, y, s, u, o) { o = o || {}; const w = o.w || tw('$ ' + s, 14) + 28; el('rect', { x, y: y - 20, width: w, height: 30, rx: 7, fill: INK });
    mono(x + 12, y, '$ ' + s.slice(0, Math.round(s.length * clamp(u ?? 1))), { 'font-size': 14, fill: PANEL }); }
  // 활성 lease 세 줄: [경로, id, 남은 분, 사정]
  const LS = [['database/creds/app', 'Hk9', 47, '유출 의심'], ['aws/creds/deploy', 'Qr3', 12, '퇴사자 발급'], ['database/creds/batch', 'Zx8', 55, '폭주 배치']];
  function leaseRow(x, y, i, o) { o = o || {}; const [p, id, m, why] = LS[i], op = o.op ?? 1, dead = o.dead;
    el('rect', { x, y, width: 600, height: 46, rx: 8, fill: o.hot ? BADBG : PANEL, stroke: o.hot ? BAD : GRID, 'stroke-width': o.hot ? 2.2 : 1.5, opacity: op });
    mono(x + 14, y + 29, `${p}/${id}…`, { 'font-size': 14.5, 'font-weight': 700, fill: dead ? OFF : INK, opacity: op, 'text-decoration': dead ? 'line-through' : null });
    if (!dead && o.bar !== false) { const w = 120 * (m / 60); el('rect', { x: x + 330, y: y + 17, width: 120, height: 12, rx: 4, fill: SOFT, opacity: op }); el('rect', { x: x + 330, y: y + 17, width: w * (o.f ?? 1), height: 12, rx: 4, fill: m < 20 ? WARN : ACC, opacity: op });
      mono(x + 460, y + 29, `${m}m`, { 'font-size': 14, 'font-weight': 700, opacity: op }); }
    if (o.tag) tx(x + 590, y + 29, o.tag[0], { 'font-size': 14, 'font-weight': 700, fill: o.tag[1], 'text-anchor': 'end', opacity: op }); }
  function pgTable(x, y, rows) { el('rect', { x, y, width: 300, height: 34 + rows.length * 30, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 22, 'pg_roles', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    rows.forEach(([n, st], i) => { st = st || {}; mono(x + 14, y + 52 + i * 30, n, { 'font-size': 14, 'font-weight': 700, fill: st.col || GOOD, 'text-decoration': st.gone ? 'line-through' : null, opacity: st.op ?? 1 }); }); }

  // ---------- 1. 왜 회수인가 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) {
      vault(150, 120, 220, 130);
      const s = k === 0 ? pop(u, 0.3) : 1;
      card(490, 120, 320, 110, { rx: 10, stroke: ACC, sw: 2.2, s });
      mono(345, 92, 'lease', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: s });
      [['lease_id', '…/app/Hk9aB2…'], ['lease_duration', '1h'], ['username', 'v-token-app-7Ab1…']].forEach(([a, b], i) => {
        mono(345, 122 + i * 24, a, { 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.6 + i * 0.3) : 1 }); mono(480, 122 + i * 24, b, { 'font-size': 13.5, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.6 + i * 0.3) : 1 }); });
      grow(262, 120, 330, 120, k === 0 ? E(u, 0.1, 0.5) : 1, ACC);
      if (k === 0) { tx(40, 290, '읽을 때마다 lease_id와 TTL 1h가 함께 나온다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
      dbIcon(820, 120, 'PostgreSQL');
      // 사슬: lease 카드 → 실제 계정
      const g = E(u, 0.2, 1.2); for (let i = 0; i < 5; i++) { const f = (i + 0.5) / 5; if (f > g) break; el('ellipse', { cx: lerp(662, 770, f), cy: 120, rx: 11, ry: 6, fill: 'none', stroke: ACC, 'stroke-width': 3 }); }
      pgTable(620, 210, [['v-token-app-7Ab1…', { op: fade(u, 1.2) }]]);
      tx(40, 300, 'lease 하나 뒤에 진짜 DB 계정 하나', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.5) });
      tx(40, 330, 'lease를 폐기하면 DROP ROLE로 계정도 사라진다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { LS.forEach((_, i) => leaseRow(40, 60 + i * 62, i, { op: fade(u, 0.2 + i * 0.3), f: 1 - 0.02 * E(u, 0.5, 2.8), tag: [['유출 의심', BAD], ['퇴사자 발급', BAD], ['폭주 배치', WARN]][i], hot: i === 0 }));
      tx(40, 290, 'TTL이 끝날 때까지 기다리면', { 'font-size': 16, opacity: fade(u, 1.4) });
      tx(40, 320, '47분 동안 누구든 이 계정으로 접속할 수 있다', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      person(820, 300, '외부인', { stroke: BAD, op: fade(u, 1.6) }); return; }
    // k3: 지금 폐기
    LS.forEach((_, i) => leaseRow(40, 60 + i * 62, i, { hot: i === 0, tag: i === 0 ? ['지금 끊는다', BAD] : null }));
    const s = pop(u, 0.4); el('circle', { cx: 790, cy: 300, r: 58 * s, fill: BAD });
    tx(790, 308, 'revoke', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: PANEL, opacity: s, class: 'mono' });
    tx(40, 300, 'TTL 자동 만료로는 늦다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) });
    tx(40, 330, '사고 순간 바로 폐기할 수 있어야 피해가 멈춘다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) }); }

  // ---------- 2. 단건 revoke ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0 || k === 1 || k === 5) {
      cmd(40, 40, k === 1 ? 'vault lease revoke database/creds/app/Hk9aB2cD3…' : 'vault list sys/leases/lookup/database/creds/app', k === 5 ? 1 : E(u, 0.1, 0.8));
      LS.forEach((_, i) => { const target = i === 0, cut = k === 1 ? E(u, 1.0, 1.6) : k === 5 ? 1 : 0;
        leaseRow(40, 90 + i * 62, i, { op: k === 0 ? fade(u, 0.8 + i * 0.2) : 1, hot: target && k === 0, dead: target && cut > 0.5, bar: !(target && cut > 0.5),
          tag: target ? (k === 0 ? ['표적', BAD] : cut > 0.5 ? ['폐기', BAD] : null) : (k >= 1 ? ['유지', GOOD] : null) });
        if (target && k === 1) el('line', { x1: 50, y1: 113, x2: 50 + 580 * cut, y2: 113, stroke: BAD, 'stroke-width': 2.5 }); });
      if (k === 0) tx(40, 310, '지우기 전에 무엇이 살아 있는지부터 본다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      if (k === 1) { mono(40, 310, 'All revocation operations queued successfully!', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
        tx(40, 345, '표적 하나만 지우고 나머지는 그대로', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); }
      if (k === 5) tx(40, 310, '평소에는 -force 없이. 회수 실패는 원인부터 본다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
      return; }
    vault(150, 130, 220, 140);
    dbIcon(800, 120, 'PostgreSQL', { stroke: k === 3 ? OFF : INK });
    if (k === 2) { fly(262, 120, 750, 120, seg(u, 0.2, 1.0), 'DROP ROLE "v-token-app-7Ab1…"', { fill: BAD, mono: true });
      pgTable(620, 210, [['v-token-app-7Ab1…', { gone: u > 1.0, col: u > 1.0 ? OFF : GOOD }]]);
      server(100, 330, null, { s: 0.6 }); grow(150, 330, lerp(150, 600, E(u, 1.3, 2.0)), 330, 1, INK, { plain: true });
      if (u > 2.0) cross(610, 330, 12, pop(u, 2.0)); mono(170, 316, 'psql user=v-token-app-7Ab1…', { 'font-size': 13.5, opacity: fade(u, 1.3) });
      tx(40, 400, '그 username/password는 이제 어디서도 안 통한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { cross(800, 120, 16, pop(u, 0.2)); tx(800, 200, '응답 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      for (let i = 0; i < 3; i++) { const a = 0.5 + i * 0.7; dot([[262, 120], [740, 120]], seg(u, a, a + 0.5), WARN, 7); mono(500, 160 + i * 26, `재시도 ${i + 1}`, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, a + 0.4) }); }
      tx(40, 330, '정상 revoke는 취소가 끝날 때까지 Vault가 다시 시도한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k4: -force
    cmd(40, 260, 'vault lease revoke -force -prefix database/creds/app/Hk9aB2cD3…', E(u, 0.1, 0.8));
    const g = E(u, 1.0, 1.5);
    card(150, 140, 160, 40, { rx: 8, stroke: g > 0.5 ? OFF : ACC, sw: 2, fill: PANEL });
    mono(150, 145, 'lease Hk9…', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: g > 0.5 ? OFF : ACC, 'text-decoration': g > 0.5 ? 'line-through' : null });
    pgTable(620, 190, [['v-token-app-7Ab1…', { col: BAD }]]);
    tx(770, 290, '계정은 남아 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    mono(40, 300, 'Warning! Force-removing leases can cause Vault', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
    mono(40, 324, 'to become out of sync with secret engines!', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
    tx(40, 372, '-force는 최후의 수단. 남은 계정은 사람이 지운다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  // ---------- 3·4. 경로 나무 ----------
  // 노드: [이름, x, y, 부모]
  const N = { db: ['database/', 120, 120], creds: ['creds/', 300, 120], app: ['app', 480, 70], batch: ['batch', 480, 140], report: ['report', 480, 210], aws: ['aws/', 120, 300], awsc: ['creds/', 300, 300], dep: ['deploy', 480, 300], kv: ['secret/ (KV)', 120, 380] };
  const EDGE = [['db', 'creds'], ['creds', 'app'], ['creds', 'batch'], ['creds', 'report'], ['aws', 'awsc'], ['awsc', 'dep']];
  function tree(st) { // st(name) → { dead, hot }
    EDGE.forEach(([a, b]) => { const A = N[a], B = N[b], d = st(b).dead; el('path', { d: `M${A[1] + 46},${A[2]} C${A[1] + 100},${A[2]} ${B[1] - 80},${B[2]} ${B[1] - 40},${B[2]}`, fill: 'none', stroke: d ? OFF : MUT, 'stroke-width': 2, 'stroke-dasharray': d ? '5 5' : null }); });
    Object.keys(N).forEach((n) => { const [s, x, y] = N[n], o = st(n);
      pill(x, y, s, o.dead ? OFF : o.hot ? BAD : n === 'kv' ? MUT : INK, 1, { mono: true, fs: 14, fill: o.hot ? BADBG : PANEL, color: o.dead ? OFF : null }); }); }
  function leaves(x, y, n, alive, col) { for (let i = 0; i < n; i++) { const cx = x + (i % 12) * 22, cy = y + Math.floor(i / 12) * 22;
      el('circle', { cx, cy, r: 7, fill: i < alive ? (col || ACC) : 'none', stroke: i < alive ? 'none' : OFF, 'stroke-width': 1.5 }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0 || k === 1 || k === 4) {
      const cut = k === 1 ? E(u, 0.8, 2.0) : k === 4 ? 1 : 0;
      tree((n) => ({ dead: n === 'app' && cut > 0.5, hot: n === 'app' && k === 0 }));
      const alive = Math.round(47 * (1 - cut)); leaves(560, 50, 47, alive, ACC);
      mono(560, 150, `활성 ${alive} / 47`, { 'font-size': 15, 'font-weight': 800, fill: alive ? ACC : BAD });
      leaves(560, 172, 6, 6, INFO); leaves(560, 242, 4, 4, INFO); leaves(560, 300, 3, 3, INFO);
      if (k === 0) tx(560, 380, '하나씩 지우기엔 사고 때 너무 느리다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      if (k === 1) { cmd(560, 390, 'vault lease revoke -prefix database/creds/app', E(u, 0.1, 0.7), { w: 390 }); }
      if (k === 4) { [172, 242, 300].forEach((y) => check(850, y + 4, 9)); tx(560, 380, '다른 role과 aws/ 세션은 그대로 산다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) }); }
      return; }
    if (k === 2) { tree((n) => ({ dead: n === 'app' }));
      el('rect', { x: 560, y: 60, width: 380, height: 150, rx: 8, fill: INK });
      ['curl -s \\', '  --header "X-Vault-Token: $VAULT_TOKEN" \\', '  --request PUT \\', '  …/v1/sys/leases/revoke-prefix/', '     database/creds/app'].forEach((s, i) =>
        mono(574, 88 + i * 26, s.slice(0, Math.round(s.length * E(u, 0.2 + i * 0.3, 0.6 + i * 0.3))), { 'font-size': 13.5, fill: i >= 3 ? 'var(--hl)' : PANEL }));
      tx(560, 260, '런북과 자동화 스크립트는', { 'font-size': 15, opacity: fade(u, 1.8) }); tx(560, 286, 'CLI 대신 이 API를 부른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k3: 범위 세 단계
    tree(() => ({}));
    const B = [['app role만', 455, 45, 70, 50, GOOD, '권장'], ['이 엔진의 모든 role', 270, 40, 260, 195, WARN, '넓음'], ['마운트 전체', 60, 30, 490, 220, BAD, '최후']];
    B.forEach(([n, x, y, w, h, col, tag], i) => { const op = fade(u, 0.3 + i * 0.6);
      el('rect', { x, y, width: w, height: h, rx: 10, fill: 'none', stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: op });
      tx(640, 110 + i * 60, n, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op }); tx(640, 134 + i * 60, tag, { 'font-size': 14, fill: MUT, opacity: op }); });
    tx(640, 340, '범위가 곧 장애 범위다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) }); }

  function s4(t, c) { const { k, u } = c;
    if (k === 0 || k === 4) {
      const off = k === 0 ? E(u, 0.6, 1.6) : 1, awsOff = k === 4 ? E(u, 0.6, 1.4) : 0;
      tree((n) => ({ dead: (['db', 'creds', 'app', 'batch', 'report'].includes(n) && off > 0.5) || (['aws', 'awsc', 'dep'].includes(n) && awsOff > 0.5) }));
      check(240, 380, 9, fade(u, 0.3)); tx(260, 386, 'lease 없음, 영향 없음', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.3) });
      if (k === 0) { cmd(560, 60, 'vault lease revoke -prefix database/', E(u, 0.1, 0.6), { w: 360 });
        tx(560, 130, 'app·batch·report 모든 role의', { 'font-size': 15, opacity: fade(u, 1.6) }); tx(560, 156, '세션이 끊긴다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); return; }
      // k4: 체크리스트
      [['영향 범위 확인', 0.4], ['팀에 공지', 0.9], ['그다음 실행', 1.4]].forEach(([s, a], i) => { const y = 90 + i * 56;
        el('rect', { x: 600, y: y - 22, width: 32, height: 32, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2 }); check(616, y - 6, 10, pop(u, a + 0.3));
        tx(648, y, s, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, a) }); });
      tx(600, 290, '마운트 전체 회수는', { 'font-size': 15, opacity: fade(u, 2.0) }); tx(600, 316, '대규모 장애를 각오하는 일', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { tree((n) => ({ dead: ['db', 'creds', 'app', 'batch', 'report'].includes(n) }));
      el('rect', { x: 560, y: 60, width: 380, height: 124, rx: 8, fill: INK });
      ['curl -s \\', '  --header "X-Vault-Token: $VAULT_TOKEN" \\', '  --request PUT \\', '  …/v1/sys/leases/revoke-prefix/database/'].forEach((s, i) =>
        mono(574, 88 + i * 26, s.slice(0, Math.round(s.length * E(u, 0.2 + i * 0.3, 0.6 + i * 0.3))), { 'font-size': 13.5, fill: i === 3 ? 'var(--hl)' : PANEL }));
      tx(560, 240, '이 URL은 런북에 미리 적어 둔다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(560, 266, '사고 중에는 찾을 시간이 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { vault(150, 110, 220, 120); dbIcon(800, 110, 'PostgreSQL', { stroke: OFF }); cross(800, 110, 14, 1);
      const g = E(u, 0.5, 1.5);
      [['lease …/app/…', 0], ['lease …/batch/…', 1], ['lease …/report/…', 2]].forEach(([s, i]) => mono(70, 200 + i * 28, s, { 'font-size': 14, 'font-weight': 700, fill: g > 0.3 + i * 0.2 ? OFF : ACC, 'text-decoration': g > 0.3 + i * 0.2 ? 'line-through' : null }));
      pgTable(620, 190, [['v-token-app-…', { col: BAD }], ['v-token-batch-…', { col: BAD }], ['v-token-report-…', { col: BAD }]]);
      tx(770, 340, '실제 계정은 남는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      mono(40, 310, 'PUT …/sys/leases/revoke-force/database/', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(40, 360, '백엔드까지 죽었을 때만. 복구 뒤 수동 정리가 따른다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k3: sudo 정책
    el('rect', { x: 40, y: 50, width: 560, height: 92, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    ['path "sys/leases/revoke-prefix/*" {', '  capabilities = ["update", "sudo"] }'].forEach((s, i) => mono(56, 84 + i * 30, s, { 'font-size': 14.5, 'font-weight': i ? 800 : 500, fill: i ? BAD : INK, opacity: fade(u, 0.2 + i * 0.3) }));
    person(300, 220, 'ops (sudo)', { op: fade(u, 0.8) });
    person(300, 330, 'app-read', { op: fade(u, 1.0) });
    el('circle', { cx: 760, cy: 270, r: 52, fill: BAD, opacity: fade(u, 0.6) }); tx(760, 277, '회수 버튼', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PANEL, opacity: fade(u, 0.6) });
    grow(330, 214, 705, 250, E(u, 1.3, 1.9), GOOD); if (u > 1.9) check(670, 210, 10);
    grow(330, 326, 620, 326, E(u, 1.6, 2.1), BAD, { dash: '6 5', plain: true }); if (u > 2.1) cross(634, 326, 9);
    tx(40, 410, '비상 버튼은 소수 운영자 정책에만 열어 둔다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); }

  // ---------- 5. token 연쇄 폐기와 런북 ----------
  const TK = [['token app-1', 120, 100, 'root'], ['lease …/app', 360, 60, 'l'], ['child token', 360, 160, 'c'], ['lease …/app', 600, 130, 'l2'], ['lease …/batch', 600, 200, 'l3']];
  function tokens(dead) { // dead(i) → 0..1
    [[0, 1], [0, 2], [2, 3], [2, 4]].forEach(([a, b]) => { const A = TK[a], Bn = TK[b], d = dead(b) > 0.5;
      el('path', { d: `M${A[1] + 80},${A[2]} C${A[1] + 130},${A[2]} ${Bn[1] - 120},${Bn[2]} ${Bn[1] - 80},${Bn[2]}`, fill: 'none', stroke: d ? OFF : MUT, 'stroke-width': 2, 'stroke-dasharray': d ? '5 5' : null }); });
    TK.forEach(([s, x, y, kind], i) => { const d = dead(i) > 0.5, isTok = kind === 'root' || kind === 'c';
      card(x, y, 160, 40, { rx: isTok ? 20 : 6, stroke: d ? OFF : isTok ? INFO : ACC, fill: d ? SOFT : PANEL, sw: 2 });
      mono(x, y + 5, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: d ? OFF : INK, 'text-decoration': d ? 'line-through' : null }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tokens(() => 0);
      cmd(40, 270, 'vault token lookup -accessor 8fH2kLmN…', E(u, 0.1, 0.7));
      [['display_name', 'app-1'], ['policies', '[app-read]']].forEach(([a, b], i) => { mono(40, 310 + i * 28, a, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0 + i * 0.3) }); mono(200, 310 + i * 28, b, { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 1.0 + i * 0.3) }); });
      pill(120, 52, 'accessor 8fH2…', INFO, pop(u, 1.6), { mono: true, fs: 13.5 });
      tx(560, 330, '토큰 값 없이 accessor로 찾고 끊는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { const at = [0.3, 0.8, 0.8, 1.3, 1.3]; tokens((i) => E(u, at[i], at[i] + 0.3));
      cmd(40, 270, 'vault token revoke -accessor 8fH2kLmN…', E(u, 0.0, 0.3));
      mono(40, 310, 'Success! Revoked token (if it existed)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      tx(40, 350, '부모 하나를 끊으면 자식 token과 그 lease까지 함께 폐기된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(40, 380, '이 앱 인스턴스를 통째로 막을 때 쓰는 방법', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { tx(40, 50, '/var/log/vault_audit.log', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, class: 'mono' });
      el('rect', { x: 40, y: 64, width: 880, height: 90, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      const L = ['{"type":"request","auth":{"display_name":"ops"},', ' "request":{"path":"sys/leases/revoke-prefix/database/"}}'];
      L.forEach((s, i) => mono(56, 98 + i * 30, s.slice(0, Math.round(s.length * E(u, 0.2 + i * 0.5, 0.8 + i * 0.5))), { 'font-size': 14.5 }));
      [['누가', 'ops', 240], ['무엇을', 'revoke-prefix/database/', 520]].forEach(([a, b, x], i) => { const op = fade(u, 1.6 + i * 0.3);
        el('line', { x1: x, y1: 160, x2: x, y2: 210, stroke: ACC, 'stroke-width': 2, opacity: op }); pill(x, 228, `${a}: ${b}`, ACC, op > 0 ? 1 : 0, { fs: 14 }); });
      tx(40, 320, '사후 보고서의 근거가 감사 로그에서 나온다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
      sub(700, 320, '시각은 로그 time 필드에', fade(u, 2.3)); return; }
    if (k === 3) { [['범위 판단', 'lease? role? 마운트?'], ['좁은 prefix부터', '필요하면 넓힌다'], ['token 회수', '연쇄 폐기'], ['감사·회전', '로그 확보, 키 교체']].forEach(([a, b], i) => {
        const x = 130 + i * 230, s = pop(u, 0.2 + i * 0.45);
        el('circle', { cx: x, cy: 120, r: 26 * s, fill: INK }); mono(x, 128, String(i + 1), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: PANEL, opacity: s });
        tx(x, 190, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: s }); tx(x, 218, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: s });
        if (i < 3) grow(x + 36, 120, x + 194, 120, E(u, 0.5 + i * 0.45, 0.8 + i * 0.45), MUT); });
      tx(480, 330, '사고 때 떠올리는 게 아니라 미리 문서로 박아 둔다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k4: 평소 설계가 회수 범위를 줄인다
    [['넓은 권한 · 긴 TTL', 120, BAD], ['최소 권한 · 짧은 TTL', 50, GOOD]].forEach(([n, r, col], i) => { const cx = 260 + i * 420, s = E(u, 0.3 + i * 0.6, 1.0 + i * 0.6);
      el('circle', { cx, cy: 200, r: r * s, fill: col, opacity: 0.18 }); el('circle', { cx, cy: 200, r: r * s, fill: 'none', stroke: col, 'stroke-width': 2.5 });
      tx(cx, 360, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: s }); tx(cx, 206, '회수할 범위', { 'text-anchor': 'middle', 'font-size': 14, opacity: s }); });
    tx(480, 400, '즉시 회수는 그 위에 얹는 안전망이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'TTL이 47분 남은 lease를 지금 폐기해야 하는 이유로 가장 알맞은 것은 무엇인가?',
      o: ['47분 뒤에는 lease를 다시 읽을 수 없어서', '유출이 의심되는 계정이 그동안 계속 접속에 쓰일 수 있어서', 'revoke를 해야 TTL이 다시 1h로 차서'], a: 1,
      why: 'lease 뒤에는 실제 DB 계정이 있다. 만료를 기다리면 그 47분 동안 누구든 그 계정으로 들어올 수 있다.' },
    { q: 'vault lease revoke -force를 쓰면 무엇이 일어나는가?',
      o: ['백엔드 취소를 건너뛰고 Vault 기록만 지워 실제 DB 계정이 남을 수 있다', '모든 lease가 한 번에 회수된다', 'DB가 응답할 때까지 무한히 기다린다'], a: 0,
      why: '-force는 -prefix와 함께 쓰는 복구용 옵션이다. Vault와 DB가 어긋날 수 있어 남은 계정은 사람이 지워야 한다.' },
    { q: 'app role 하나만 오염됐을 때 알맞은 회수 범위는 무엇인가?',
      o: ['database/', 'database/creds', 'database/creds/app'], a: 2,
      why: '-prefix는 그 경로 아래를 전부 지운다. app 경로만 끊으면 47개 세션만 정리되고 batch, report, aws/ 세션은 산다.' },
    { q: 'sys/leases/revoke-prefix와 revoke-force를 호출하려면 정책에 무엇이 있어야 하는가?',
      o: ['read capability', 'update와 sudo capability', 'list capability'], a: 1,
      why: '두 경로는 sudo가 필요한 경로다. 그래서 소수 운영자 정책에만 열어 둔다.' },
    { q: 'app-1 token을 revoke 하면 그 token의 자식 token이 발급받은 lease는 어떻게 되는가?',
      o: ['그대로 남아 TTL을 다 쓴다', '자식 token만 남고 lease는 폐기된다', '자식 token과 함께 폐기된다'], a: 2,
      why: '부모 token을 지우면 자식 token과 그 lease까지 연쇄로 폐기된다. 인스턴스 하나를 통째로 막을 때 쓴다.' },
  ];

  const summary = [
    'lease 하나 뒤에는 실제 DB 계정이나 AWS 키가 하나씩 물려 있다.',
    'revoke는 그 lease를 바로 지우고 백엔드에서 DROP ROLE 같은 취소까지 실행한다.',
    '-prefix는 경로 아래를 통째로 회수하니 database/creds/app처럼 좁게 시작한다.',
    'token을 revoke 하면 자식 token과 lease까지 함께 폐기되고 기록은 감사 로그에 남는다.',
  ];
  const review = [
    { q: 'DB가 다운된 사이 revoke가 끝나지 않는다. 팀원이 -force를 제안했다. 먼저 따질 것은?',
      o: ['-force 뒤에 남는 DB 계정의 정리 계획', 'TTL을 더 길게 잡을지', 'KV 버전을 되돌릴지'], a: 0,
      why: '정상 revoke는 백엔드가 살아나면 다시 시도한다. -force는 Vault 기록만 지우므로 남은 계정 정리 계획이 먼저다.' },
    { q: '유출 범위를 모른 채 database/ 전체를 회수했더니 batch와 report까지 멈췄다. 다음에 바꿀 순서는?',
      o: ['처음부터 revoke-force를 쓴다', 'secret/ KV도 함께 지운다', 'database/creds/app부터 끊고 필요할 때 넓힌다'], a: 2,
      why: '범위가 곧 장애 범위다. 좁은 prefix로 시작해야 무고한 세션이 산다.' },
    { q: '앱 인스턴스 하나가 탈취됐다. 그 인스턴스가 받은 lease를 하나씩 찾기 어렵다. 가장 빠른 방법은?',
      o: ['aws/ 마운트를 통째로 회수한다', '그 인스턴스 token을 accessor로 revoke 한다', 'pg_roles를 직접 비운다'], a: 1,
      why: 'token을 revoke 하면 그 token과 자식 token이 받은 lease가 연쇄로 폐기된다. 토큰 값 없이 accessor로 할 수 있다.' },
  ];

  R.page({ title: 'lease 회수 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
