/* III-2-1 SSH OTP — 일회용 비밀번호 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
   cidr 검사(10.0.1.0/24 = 주소 256개), UUID OTP 발급, verify 한 번 뒤 삭제는 python 으로 규칙을 재현해 확인했다.
   lease_duration 768h 는 Vault 시스템 기본 TTL(2764800초)이다. OTP 값(a1b2c3d4-…, 4f7a9c2e-…)은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const cmd = (x, y, s, f, o) => { o = o || {}; spans(x, y, [['$ ', { fill: MUT }], [typed(s, f), { fill: INK, 'font-weight': 600 }]], { 'font-size': o.fs || 14.5, opacity: o.op ?? 1 }); };
  const OTP = 'a1b2c3d4-e5f6-…';

  function keyIcon(cx, cy, s, col, o) { o = o || {}; const g = G(cx, cy, s, o.op), c = col || ACC;
    el('circle', { cx: -14, cy: 0, r: 9, fill: PANEL, stroke: c, 'stroke-width': 3.5 }, g);
    el('line', { x1: -5, y1: 0, x2: 20, y2: 0, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    [11, 18].forEach((x) => el('line', { x1: x, y1: 0, x2: x, y2: 7, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g)); return g; }
  // 입장권 모양 OTP: 양옆에 반원 홈, tear(0→1)면 가운데가 찢겨 벌어진다
  function ticket(cx, cy, text, o) { o = o || {}; const w = o.w || 230, h = 50, col = o.col || ACC, s = o.s ?? 1, tear = o.tear || 0;
    [-1, 1].forEach((side) => { if (!tear && side === 1) return; const g = G(cx + (tear ? side * tear * 16 : 0), cy + (tear ? side * tear * 8 : 0), s, o.op);
      const clip = tear ? (side < 0 ? `M${-w / 2},${-h / 2} H0 L-8,0 L0,${h / 2} H${-w / 2} Z` : `M0,${-h / 2} H${w / 2} V${h / 2} H0 L-8,0 Z`) : null;
      el('path', { d: clip || `M${-w / 2},${-h / 2} H${w / 2} V${-8} A8,8 0 0 0 ${w / 2},8 V${h / 2} H${-w / 2} V8 A8,8 0 0 0 ${-w / 2},-8 Z`, fill: tear ? OFF : PANEL, stroke: col, 'stroke-width': 2.2, opacity: tear ? 0.6 : 1 }, g);
      if (!tear) mono(0, 5, text, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: col }, g); }); }
  function vaultBox(cx, cy, w, h, name, o) { o = o || {}; const g = card(cx, cy, w, h, { rx: 12, sw: 2.5, stroke: o.stroke || INK, s: o.s });
    tx(-w / 2 + 14, -h / 2 + 24, name, { 'font-size': 14.5, 'font-weight': 800, fill: o.stroke || INK }, g); return g; }
  // 10.0.1.0/24: 16×16 칸. hot 은 강조할 마지막 옥텟
  function cidrGrid(x, y, cs, f, o) { o = o || {}; const n = Math.floor(256 * clamp(f));
    for (let i = 0; i < 256; i++) { if (i >= n) break; const r = Math.floor(i / 16), q = i % 16, hot = o.hot === i;
      el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 2, height: cs - 2, rx: 2, fill: hot ? ACC : o.col || GOOD, opacity: hot ? 1 : 0.35 }); }
    if (o.label) mono(x, y - 10, o.label, { 'font-size': 14.5, 'font-weight': 700, fill: o.col || GOOD }); }
  function kv(x, y, rows, f, o) { o = o || {}; const w = o.w || 420; el('rect', { x, y, width: w, height: 24 + rows.length * 30, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    rows.forEach(([a, b, hot], i) => { const op = clamp(f * rows.length - i); mono(x + 14, y + 32 + i * 30, a, { 'font-size': 14, fill: MUT, opacity: op });
      mono(x + (o.kw || 150), y + 32 + i * 30, b, { 'font-size': 14.5, 'font-weight': 700, fill: hot ? ACC : INK, opacity: op }); }); }

  // 1. 고정 키와 공유 계정
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { person(110, 150, '운영자', {}); keyIcon(170, 186, 1.1, BAD); mono(196, 214, 'id_rsa', { 'font-size': 14, fill: BAD, 'font-weight': 700 });
      server(800, 160, '10.0.1.23', {}); grow(200, 150, 730, 150, k === 0 ? E(u, 0.8, 1.6) : 1, MUT);
      if (k === 0) { cmd(60, 46, 'ssh -i ~/.ssh/id_rsa ubuntu@10.0.1.23', E(u, 0.1, 0.8)); mono(480, 136, '만료: 없음 (∞)', { 'font-size': 16, 'text-anchor': 'middle', fill: BAD, 'font-weight': 800, opacity: fade(u, 1.7) }); }
      if (k === 1) { [0, 1, 2].forEach((i) => { const x = 260 + i * 150, y = 330, f = seg(u, 0.3 + i * 0.4, 1.0 + i * 0.4);
          if (f > 0 && f < 1) { const kx = lerp(170, x, f), ky = lerp(186, y - 50, f); keyIcon(kx, ky, 0.9, BAD); }
          person(x, y, ['팀원 A', '팀원 B', '팀원 C'][i], { s: pop(u, 0.2 + i * 0.4) }); if (f >= 1) keyIcon(x + 40, y - 30, 0.8, BAD); });
        pill(140, 380, 'DM으로 id_rsa 전달', BAD, pop(u, 1.6), { fs: 14 });
        pill(760, 300, 'root 공유 계정 password=ops2024', BAD, pop(u, 2.0), { mono: true, fs: 13.5 }); }
      return; }
    if (k === 2) { tx(70, 50, '서버마다 authorized_keys에서 옛 키 지우기', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 12; i++) { const x = 140 + (i % 6) * 135, y = 120 + Math.floor(i / 6) * 150, done = seg(u, 0.3 + i * 0.15, 0.5 + i * 0.15) >= 1, miss = i === 9;
        server(x, y, null, { s: 0.6, stroke: done && miss ? BAD : INK, lamp: done ? (miss ? BAD : GOOD) : OFF });
        if (done) { if (miss) cross(x, y + 44, 9, 1); else check(x, y + 44, 9, 1); } }
      sub(480, 400, '한 대라도 빠지면 그 서버는 옛 키로 열린다', fade(u, 2.3), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { const x = 120, y = 90; el('rect', { x, y, width: 520, height: 230, rx: 10, fill: INK });
      mono(x + 16, y + 26, '/var/log/auth.log', { 'font-size': 13.5, fill: OFF });
      for (let i = 0; i < 5; i++) { const op = fade(u, 0.3 + i * 0.3); mono(x + 16, y + 62 + i * 34, 'Accepted password for ubuntu', { 'font-size': 14.5, fill: 'var(--term)', opacity: op });
        tx(x + 440, y + 62 + i * 34, '누구?', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.6 + i * 0.1) }); }
      card(800, 200, 220, 110, { rx: 12, stroke: BAD, sw: 2.5, s: pop(u, 1.9) }); tx(800, 192, '모두 user=ubuntu', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      sub(800, 220, '사람을 특정할 수 없다', fade(u, 2.1)); return; }
    if (u <= 1.4) ticket(480, 160, 'OTP · 접속 1회', { s: pop(u, 0.2) });
    if (u > 1.4) ticket(480, 160, '', { tear: E(u, 1.4, 2.0) });
    sub(480, 220, u > 1.4 ? '쓰고 나면 무효' : '접속할 때마다 새로 뽑는다', 1, { 'font-weight': 700, fill: u > 1.4 ? MUT : ACC });
    banner(480, 320, 'SSH secret engine의 OTP 모드', pop(u, 2.0)); }

  // 2. 엔진과 role
  function s2(t, c) { const { k, u } = c;
    vaultBox(230, 220, 380, 300, 'Vault', {});
    pill(140, 118, 'ssh/', ACC, k === 0 ? pop(u, 0.9) : 1, { mono: true, fs: 15, fill: ACCBG });
    if (k === 0) { cmd(60, 46, 'vault secrets enable ssh', E(u, 0.1, 0.7)); sub(330, 124, '마운트 완료', fade(u, 1.3), { fill: ACC, 'font-weight': 700 }); }
    if (k >= 1) { const vals = k >= 2 ? ['otp', 'ubuntu', '10.0.1.0/24'] : ['?', '?', '?'], what = ['모드', '발급 계정', '허용 대역'];
      mono(70, 168, 'ssh/roles/my-role', { 'font-size': 14.5, 'font-weight': 800, opacity: k === 1 ? fade(u, 0.2) : 1 });
      ['key_type', 'default_user', 'cidr_list'].forEach((a, i) => { const y = 210 + i * 56, s = k === 1 ? pop(u, 0.4 + i * 0.4) : 1;
        card(230, y, 330, 44, { rx: 8, stroke: k >= 2 ? GOOD : GRID, sw: 2, s });
        mono(80, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, opacity: clamp(s) });
        mono(240, y + 5, vals[i], { 'font-size': 15, 'font-weight': 800, fill: k >= 2 ? GOOD : MUT, opacity: k === 2 ? fade(u, 0.3 + i * 0.3) : clamp(s) });
        if (k === 1) tx(470, y + 5, what[i], { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8 + i * 0.4) }); }); }
    if (k === 2) { cidrGrid(560, 90, 17, E(u, 0.6, 1.8), { hot: 23, label: '10.0.1.0/24 · 주소 256개' });
      sub(700, 390, '이 대역 밖 IP에는 발급하지 않는다', fade(u, 2.0), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 3) { cmd(470, 80, 'vault read ssh/roles/my-role', E(u, 0.1, 0.6));
      kv(470, 110, [['key_type', 'otp'], ['default_user', 'ubuntu'], ['cidr_list', '10.0.1.0/24']], E(u, 0.6, 1.6));
      sub(680, 260, '규칙이 서버 곳곳이 아니라 Vault 한 곳에', fade(u, 1.9), { 'font-weight': 700 }); }
    if (k === 4) { person(800, 200, '운영자', { s: pop(u, 0.2) }); grow(760, 200, 424, 200, E(u, 0.5, 1.3), ACC);
      pill(600, 160, 'ssh/creds/my-role', ACC, pop(u, 1.3), { mono: true, fs: 14 });
      sub(600, 250, '접속 직전마다 여기서 OTP를 받는다', fade(u, 1.7), { 'font-weight': 700, fill: ACC }); } }

  // 3. OTP 발급과 접속
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { cmd(40, 46, 'vault write ssh/creds/my-role ip=10.0.1.23', E(u, 0.1, 0.7));
      cidrGrid(120, 110, 15, 1, { hot: E(u, 0.8, 1.4) >= 1 ? 23 : -1, label: 'my-role · 10.0.1.0/24' });
      const f = E(u, 0.6, 1.4); pill(lerp(800, 560, f), lerp(220, 132, f), 'ip=10.0.1.23', ACC, 1, { mono: true, fs: 13.5 }); grow(500, 132, 240, 132, E(u, 1.4, 1.8), ACC, { sw: 1.8 });
      check(660, 132, 12, pop(u, 1.8)); tx(684, 138, '대역 안', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      mono(600, 330, 'ip=10.0.2.5 였다면', { 'font-size': 14.5, opacity: fade(u, 1.9) }); cross(790, 324, 10, pop(u, 2.1)); tx(810, 330, '거부', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 1) { kv(60, 60, [['lease_id', 'ssh/creds/my-role/8Hk2…'], ['lease_duration', '768h'], ['key', OTP, true], ['key_type', 'otp'], ['port', '22'], ['username', 'ubuntu'], ['ip', '10.0.1.23']], E(u, 0.2, 1.6), { w: 460, kw: 170 });
      ticket(760, 160, OTP, { s: pop(u, 1.6) }); sub(760, 214, '이번 접속 한 번분', fade(u, 1.9), { fill: ACC, 'font-weight': 700 }); return; }
    if (k === 2 || k === 4) { const lines = k === 2 ? ['$ ssh ubuntu@10.0.1.23', ['Password: ' + OTP, 'var(--term)'], ['ubuntu@10.0.1.23:~$', '#4ade80']]
      : ['$ ssh ubuntu@10.0.1.23', ['Password: ' + OTP, 'var(--term)'], ['Permission denied', '#f87171']];
      terminal(60, 70, 480, 200, lines, lerp(0.5, 3, E(u, 0.2, 1.8)), { title: 'ubuntu@laptop' });
      server(780, 150, '10.0.1.23', { lamp: k === 2 ? GOOD : BAD });
      if (k === 2) { ticket(780, 300, OTP, { s: 1 }); sub(780, 350, '비밀번호 칸에 OTP', fade(u, 0.6), { 'font-weight': 700 }); }
      else { ticket(780, 300, '', { tear: 1 }); cross(780, 300, 14, pop(u, 1.8)); sub(780, 350, '이미 쓴 OTP로는 다시 못 들어간다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
      return; }
    // k3: vault ssh 한 줄이 두 일을 합친다
    cmd(60, 60, 'vault ssh -role my-role -mode otp ubuntu@10.0.1.23', E(u, 0.1, 0.8));
    [['OTP 발급', 'ssh/creds/my-role'], ['ssh 접속', 'Password 입력']].forEach(([a, b], i) => { const x = 280 + i * 400, s = pop(u, 0.9 + i * 0.4);
      card(x, 180, 260, 80, { rx: 12, stroke: ACC, sw: 2.5, s }); tx(x, 175, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: clamp(s) }); mono(x, 200, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) }); });
    grow(412, 180, 548, 180, E(u, 1.5, 1.9), ACC);
    zone(130, 250, 700, 70, null, { fill: SOFT }); tx(480, 282, 'sshpass가 깔려 있으면 비밀번호 입력까지 대신한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
    sub(480, 306, '없으면 OTP를 화면에 보여 주고 붙여 넣게 한다', fade(u, 2.2)); }

  // 4. 대상 서버의 vault-ssh-helper
  function s4(t, c) { const { k, u } = c;
    zone(30, 30, 560, 370, '대상 서버 10.0.1.23', { fill: SOFT });
    if (k === 0) { const L = ['vault_addr = "https://vault.internal:8200"', 'ssh_mount_point = "ssh"', 'tls_skip_verify = false', 'allowed_roles = "my-role"'];
      mono(56, 84, '/etc/vault-ssh-helper.d/config.hcl', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      L.forEach((s, i) => mono(56, 124 + i * 32, typed(s, E(u, 0.2 + i * 0.4, 0.6 + i * 0.4)), { 'font-size': 14.5, fill: i === 3 ? ACC : INK, 'font-weight': i === 3 ? 700 : 400 }));
      sub(310, 300, 'allowed_roles로 이 서버가 받을 role을 제한', fade(u, 2.0), { 'font-weight': 700 }); }
    if (k >= 1) { const layers = [['sshd', INK], ['PAM · auth requisite pam_exec', INFO], ['vault-ssh-helper', ACC]];
      layers.forEach(([s, col], i) => { const y = 90 + i * 80, sc = k === 1 ? pop(u, 0.2 + i * 0.4) : 1; card(310, y, 420, 54, { rx: 10, stroke: col, sw: 2.5, text: s, fs: 15, color: col, s: sc, mono: i > 0 });
        if (i < 2) grow(310, y + 28, 310, y + 52, k === 1 ? E(u, 0.5 + i * 0.4, 0.8 + i * 0.4) : 1, MUT); });
      if (k === 1) { ticket(110, 330, OTP, { s: pop(u, 1.4), w: 160 }); dot([[200, 330], [520, 330], [520, 250]], seg(u, 1.6, 2.6), ACC, 7);
        mono(310, 380, 'expose_authtok: 입력값을 helper에게', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); } }
    if (k === 2) { const rows = [['ChallengeResponseAuthentication', 'yes', true], ['UsePAM', 'yes', true], ['PasswordAuthentication', 'no', false]];
      rows.forEach(([a, b, on], i) => { const x = 640, y = 110 + i * 70, f = fade(u, 0.3 + i * 0.5);
        mono(x, y, a, { 'font-size': 13.5, opacity: f }); mono(x, y + 26, b, { 'font-size': 16, 'font-weight': 800, fill: on ? GOOD : BAD, opacity: f });
        if (on) check(x + 60, y + 20, 8, pop(u, 0.5 + i * 0.5)); else cross(x + 50, y + 20, 8, pop(u, 0.5 + i * 0.5)); });
      card(780, 350, 280, 54, { rx: 10, stroke: BAD, sw: 2, text: '고정 비밀번호 문 닫힘', fs: 15, color: BAD, s: pop(u, 2.0) }); }
    if (k === 3) { // OTP 검증 흐름: helper → Vault ssh/verify → 통과 + 삭제
      const V = [800, 170]; vaultBox(V[0], V[1], 230, 220, 'Vault · ssh/', { stroke: ACC });
      mono(V[0] - 96, V[1] - 50, 'OTP 목록', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const gone = E(u, 1.8, 2.3);
      mono(V[0] - 96, V[1] - 20, OTP, { 'font-size': 14, fill: gone > 0.5 ? OFF : ACC, 'font-weight': 700, 'text-decoration': gone > 0.5 ? 'line-through' : null });
      mono(V[0] - 96, V[1] + 8, '9e81…', { 'font-size': 14, fill: MUT });
      dot([[520, 250], [600, 250], [690, 150]], seg(u, 0.2, 1.0), ACC, 7); pill(620, 200, 'POST ssh/verify', ACC, pop(u, 0.5), { mono: true, fs: 13.5 });
      dot([[690, 190], [600, 280], [520, 280]], seg(u, 1.1, 1.8), GOOD, 7); check(560, 330, 11, pop(u, 1.8)); tx(580, 336, '접속 허용', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      sub(V[0], V[1] + 80, '확인 즉시 삭제', fade(u, 2.2), { fill: BAD, 'font-weight': 700 });
      mono(640, 380, 'audit: verify · ubuntu · 10.0.1.23', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.4) }); } }

  // 5. 실무 정리
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { cmd(60, 60, 'vault ssh -role my-role -mode otp ubuntu@10.0.1.23', E(u, 0.1, 0.8));
      mono(60, 96, 'OTP for the session is: 4f7a9c2e-…', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.9) });
      if (u <= 1.9) ticket(480, 210, '4f7a9c2e-…', { s: pop(u, 1.1) }); if (u > 1.9) ticket(480, 210, '', { tear: E(u, 1.9, 2.4) });
      sub(480, 270, '접속 성공과 동시에 무효', fade(u, 2.2), { 'font-weight': 700 }); return; }
    if (k === 1) { cmd(60, 60, 'vault audit enable file file_path=/var/log/vault-audit.log', E(u, 0.1, 0.8), { fs: 14 });
      const x = 60, y = 100; el('rect', { x, y, width: 840, height: 220, rx: 10, fill: SOFT, stroke: GRID });
      ['누가 (토큰)', '언제', 'role', '대상 IP'].forEach((h, i) => tx(x + 20 + i * 210, y + 30, h, { 'font-size': 14.5, 'font-weight': 800, fill: MUT }));
      [['운영자 alice', '요청 시각', 'my-role', '10.0.1.23'], ['운영자 bob', '요청 시각', 'db-team', '10.0.2.5']].forEach((r, j) => r.forEach((s, i) =>
        mono(x + 20 + i * 210, y + 76 + j * 46, s, { 'font-size': 14.5, opacity: fade(u, 0.8 + j * 0.6 + i * 0.1) })));
      sub(480, 360, 'OTP 발급 요청 자체가 기록이다. 계정을 같이 써도 사람이 남는다', fade(u, 2.1), { 'font-weight': 700 }); return; }
    if (k === 2) { cidrGrid(90, 110, 15, 1, { label: 'my-role · 10.0.1.0/24' }); cidrGrid(560, 110, 15, E(u, 0.3, 1.4), { col: INFO, label: 'db-team · 10.0.2.0/24' });
      cmd(60, 46, 'vault write ssh/roles/db-team key_type=otp default_user=ubuntu cidr_list=10.0.2.0/24', E(u, 0.1, 0.9), { fs: 13.5 });
      sub(480, 395, '팀 조직 그대로 role을 나눠 대역을 따로 통제한다', fade(u, 1.8), { 'font-weight': 700 }); return; }
    if (k === 3) { const rows = [['키 회전', '접속마다 새 값'], ['유출', '이미 쓴 값이라 무해'], ['공유 계정', '개인별 발급'], ['범위', 'role의 user·CIDR']];
      rows.forEach(([a, b], i) => { const y = 80 + i * 76; card(250, y, 280, 54, { rx: 10, stroke: BAD, sw: 2, text: a + ' 부담', fs: 15, color: BAD });
        if (seg(u, 0.3 + i * 0.4, 0.6 + i * 0.4) > 0.5) cross(110, y, 9, 1);
        grow(394, y, 540, y, E(u, 0.4 + i * 0.4, 0.7 + i * 0.4), GOOD); card(700, y, 300, 54, { rx: 10, stroke: GOOD, sw: 2, text: b, fs: 15, color: GOOD, s: pop(u, 0.6 + i * 0.4) }); }); return; }
    // k4: 다음 — CA 모드
    ticket(250, 180, 'OTP', { w: 160 }); sub(250, 236, 'helper + PAM이 서버마다 필요', 1, { 'font-weight': 700 });
    grow(350, 180, 560, 180, E(u, 0.4, 1.0), ACC);
    card(700, 180, 240, 110, { rx: 10, stroke: INFO, sw: 2.5, s: pop(u, 1.0) });
    tx(700, 172, 'OpenSSH 인증서', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.1) });
    sub(700, 198, 'CA 서명 모드 · helper 없음', fade(u, 1.2));
    banner(480, 330, '다음 장 III-2-2 SSH CA', pop(u, 1.8)); }

  const quiz = [
    { q: '고정 id_rsa 키와 공유 계정을 쓸 때 사고가 나면 가장 어려운 일은 무엇인가?',
      o: ['서버 CPU를 늘리는 일', '모든 서버에서 키를 빠짐없이 회수하고 접속한 사람을 특정하는 일', 'SSH 포트를 바꾸는 일'], a: 1,
      why: '키는 만료가 없고 로그에는 모두 user=ubuntu로 남는다. 회수는 서버 수만큼 해야 해서 하나라도 빠지면 구멍이 남는다.' },
    { q: 'OTP role의 cidr_list=10.0.1.0/24가 정하는 것은 무엇인가?',
      o: ['OTP를 발급해 줄 대상 서버 IP 대역', 'OTP 문자열의 길이', 'Vault 서버가 듣는 주소'], a: 0,
      why: 'role은 default_user로 계정을, cidr_list로 대상 대역을 못 박는다. 10.0.1.0/24 밖 IP를 넣으면 발급 단계에서 거부된다.' },
    { q: '같은 OTP로 두 번째 접속을 시도하면 어떻게 되나?',
      o: ['다시 성공한다', '768h가 지나야 실패한다', '실패한다'], a: 2,
      why: '첫 접속 때 helper가 Vault에 검증하면 Vault가 그 OTP를 지운다. 그래서 같은 값으로는 다시 들어갈 수 없다.' },
    { q: '대상 서버에서 입력된 OTP를 Vault에 물어보는 것은 누구인가?',
      o: ['sshd가 직접', 'PAM에 끼운 vault-ssh-helper', '사용자 노트북의 vault CLI'], a: 1,
      why: 'pam_exec가 expose_authtok로 입력값을 helper에게 넘기고, helper가 ssh/verify로 확인한다. PasswordAuthentication no로 고정 비밀번호 길은 닫는다.' },
    { q: 'OTP 모드에서 "누가 언제 어느 서버로 들어갔나"가 남는 곳은?',
      o: ['Vault audit device 로그', '서버의 authorized_keys', 'OTP 문자열 안'], a: 0,
      why: 'OTP 발급 요청이 Vault API 호출이라 감사 로그에 role과 IP가 남는다. 공유 계정을 써도 요청한 토큰으로 사람이 드러난다.' },
  ];

  const summary = [
    '고정 키는 만료가 없고 공유 계정은 누가 들어왔는지 지운다.',
    'role에 key_type=otp, default_user, cidr_list를 적어 발급 범위를 정한다.',
    '접속 직전 ssh/creds/my-role로 OTP를 받고, 그 값을 비밀번호로 넣는다.',
    '서버의 vault-ssh-helper가 Vault에 확인하면 OTP는 바로 지워져 다시 못 쓴다.',
  ];
  const review = [
    { q: '퇴사자가 있었는데 OTP 모드를 쓰는 서버들은 따로 손댈 것이 거의 없다. 이유로 맞는 것은?',
      o: ['서버에 그 사람 키가 애초에 없고, Vault 토큰만 막으면 OTP를 못 받는다', 'OTP는 768h 동안 유효해 저절로 풀린다', 'sshd가 퇴사자를 자동으로 안다'], a: 0,
      why: '서버에 심어 둔 고정 키가 없다. 접속하려면 매번 Vault에서 OTP를 받아야 하니 Vault 쪽 권한만 거두면 된다.' },
    { q: 'ssh/creds/my-role ip=10.0.2.5로 요청했더니 거부됐다. 먼저 볼 것은?',
      o: ['vault-ssh-helper 설정', 'my-role의 cidr_list가 10.0.1.0/24인지', 'sshd의 UsePAM 값'], a: 1,
      why: '발급 단계에서 role의 cidr_list로 IP를 검사한다. 10.0.2.5는 10.0.1.0/24 밖이라 db-team 같은 다른 role을 써야 한다.' },
    { q: 'OTP를 받아 입력했는데 서버가 계속 거부한다. Vault 응답은 정상이었다. 의심할 곳은?',
      o: ['서버의 PAM에 helper가 끼워져 있는지와 sshd 설정', 'transit 키 버전', 'role의 lease_duration'], a: 0,
      why: '검증은 대상 서버의 PAM 단계에서 helper가 한다. pam_exec 줄이나 ChallengeResponse·UsePAM 설정이 빠지면 OTP가 Vault까지 가지 않는다.' },
  ];

  R.page({ title: 'SSH OTP 접속 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
