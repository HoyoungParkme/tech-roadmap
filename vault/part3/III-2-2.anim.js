/* III-2-2 SSH CA — 짧은 수명 인증서 · 장면 5개 (../../anim/engine.js 규칙을 따른다)
   인증서 모양은 ssh-keygen 으로 실제 CA 서명(-V -30s:+30m, permit-pty 만)을 해 본 -L 출력 형식을 따른다.
   Vault 는 not_before_duration 기본 30s 만큼 시작 시각을 앞당긴다. 시각 2026-08-11T09:00 은 예시. 100대 × 50명 = 5000 은 페이지 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));
  const cmd = (x, y, s, f, o) => { o = o || {}; spans(x, y, [['$ ', { fill: MUT }], [typed(s, f), { fill: INK, 'font-weight': 600 }]], { 'font-size': o.fs || 14.5, opacity: o.op ?? 1 }); };
  function keyIcon(cx, cy, s, col, o) { o = o || {}; const g = G(cx, cy, s, o.op), c = col || ACC;
    el('circle', { cx: -14, cy: 0, r: 9, fill: PANEL, stroke: c, 'stroke-width': 3.5 }, g);
    el('line', { x1: -5, y1: 0, x2: 20, y2: 0, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    [11, 18].forEach((x) => el('line', { x1: x, y1: 0, x2: x, y2: 7, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g)); return g; }
  function vaultBox(cx, cy, w, h, name, o) { o = o || {}; const g = card(cx, cy, w, h, { rx: 12, sw: 2.5, stroke: o.stroke || INK, s: o.s });
    tx(-w / 2 + 14, -h / 2 + 24, name, { 'font-size': 14.5, 'font-weight': 800, fill: o.stroke || INK, class: o.mono ? 'mono' : null }, g); return g; }
  // 파일 카드: 위 이름 + 줄
  function file(x, y, w, name, lines, f, o) { o = o || {}; const h = 34 + lines.length * 26;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 });
    mono(x + 12, y + 22, name, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    lines.forEach((ln, i) => { const [s, col] = Array.isArray(ln) ? ln : [ln, INK]; mono(x + 12, y + 50 + i * 26, typed(s, clamp((f ?? 1) * lines.length - i)), { 'font-size': 14, fill: col, 'font-weight': col === INK ? 400 : 700 }); }); return h; }
  // SSH 인증서 카드 (사원증 모양)
  function sshCert(cx, cy, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), col = o.col || INFO;
    el('rect', { x: -110, y: -50, width: 220, height: 100, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.5 }, g);
    el('rect', { x: -110, y: -50, width: 220, height: 24, rx: 10, fill: col, opacity: 0.85 }, g);
    tx(0, -33, 'id_rsa-cert.pub', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: PANEL, class: 'mono' }, g);
    mono(-96, -2, 'principal: alice', { 'font-size': 14 }, g); mono(-96, 22, 'TTL ' + (o.ttl || '30m'), { 'font-size': 14, fill: WARN, 'font-weight': 700 }, g);
    mono(-96, 44, o.ext || 'permit-pty', { 'font-size': 13.5, fill: MUT }, g); return g; }

  // 1. authorized_keys 를 서버마다
  function s1(t, c) { const { k, u } = c;
    if (k === 0 || k === 2) { const cols = 25, rows = 10, x0 = 120, y0 = 90, cs = 22, n = k === 0 ? Math.floor(lerp(0, cols * rows, E(u, 0.6, 2.2))) : cols * rows;
      if (k === 0) cmd(40, 46, 'ssh web-01 "cat >> ~/.ssh/authorized_keys" < alice.pub', E(u, 0.1, 0.6), { fs: 14 });
      else tx(40, 50, '퇴사자 alice의 키를 모든 서버에서 지운다', { 'font-size': 15, 'font-weight': 700, fill: BAD });
      tx(x0 - 12, y0 + 6, '서버', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 }); tx(x0, y0 - 14, '사용자 →', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const sweep = k === 2 ? Math.floor(lerp(0, rows, E(u, 0.3, 1.8))) : -1;
      for (let i = 0; i < cols * rows; i++) { if (i >= n) break; const r = Math.floor(i / cols), q = i % cols, alice = q === 3;
        let fill = INK, op = 0.55; if (k === 2 && alice) { const miss = r === 7; if (r < sweep) { fill = miss ? BAD : OFF; op = miss ? 1 : 0.35; } else { fill = ACC; op = 1; } }
        el('circle', { cx: x0 + q * cs + 8, cy: y0 + r * cs + 8, r: 6, fill, opacity: op }); }
      if (k === 0) mono(480, 330, '서버 100대 × 사용자 50명 = 키 5000개', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      else { mono(x0 + 3 * cs + 8, y0 + 10 * cs + 22, 'alice', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
        sub(560, 350, '한 칸만 남아도 뒷문이다. 다 지웠다는 증명이 없다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
      return; }
    if (k === 1) { keyIcon(150, 160, 1.6, ACC); mono(210, 168, 'alice.pub', { 'font-size': 17, 'font-weight': 800 });
      const x = 150, w = 680, f = E(u, 0.4, 2.0); el('rect', { x, y: 230, width: w * f, height: 22, rx: 5, fill: ACC, opacity: 0.6 });
      if (f >= 1) { grow(x + w - 10, 241, x + w + 70, 241, 1, ACC); mono(x + w - 40, 290, '∞', { 'font-size': 30, 'font-weight': 800, fill: BAD }); }
      mono(x, 290, '넣은 날', { 'font-size': 14, fill: MUT });
      sub(480, 360, 'SSH 공개키에는 유효기간이 없다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { const x = 70, y = 70; el('rect', { x, y, width: 500, height: 210, rx: 10, fill: INK });
      ['SHA256:Xk2…', 'SHA256:9fQ…', 'SHA256:a7L…'].forEach((s, i) => { mono(x + 16, y + 50 + i * 50, 'Accepted publickey ' + s, { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 0.2 + i * 0.3) });
        grow(x + 420, y + 45 + i * 50, 700, 100 + i * 90, E(u, 1.0 + i * 0.3, 1.4 + i * 0.3), MUT, { dash: '5 5' });
        person(760, 100 + i * 90, null, { s: 0.7 }); tx(800, 106 + i * 90, '?', { 'font-size': 22, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5 + i * 0.3) }); });
      sub(320, 330, '지문을 사람으로 바꾸는 일이 포렌식이 된다', fade(u, 2.2), { 'font-weight': 700 }); return; }
    // k4: CA 하나를 서버들이 믿는다
    card(480, 200, 170, 70, { rx: 12, stroke: INFO, sw: 3, text: 'SSH CA', fs: 18, color: INFO, s: pop(u, 0.2) });
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = 480 + Math.cos(a) * 330, y = 200 + Math.sin(a) * 140;
      grow(x, y, lerp(x, 480, 0.72), lerp(y, 200, 0.72), E(u, 0.6 + i * 0.1, 1.0 + i * 0.1), INFO, { plain: true }); server(x, y, null, { s: 0.45 }); }
    banner(480, 395, '중앙 발급 + 짧은 수명 + 자동 만료', pop(u, 2.0)); }

  // 2. Vault 가 SSH CA 가 된다
  function s2(t, c) { const { k, u } = c, V = [300, 230];
    vaultBox(V[0], V[1], 400, 260, 'Vault', {});
    pill(V[0] - 70, V[1] - 66, 'ssh-client-signer/', ACC, k === 0 ? pop(u, 0.9) : 1, { mono: true, fs: 14.5, fill: ACCBG });
    if (k === 0) { cmd(40, 46, 'vault secrets enable -path=ssh-client-signer ssh', E(u, 0.1, 0.8)); sub(V[0], V[1] + 10, '사용자 키에 서명할 자리', fade(u, 1.5), { 'font-weight': 700 }); return; }
    if (k === 1) cmd(40, 46, 'vault write ssh-client-signer/config/ca generate_signing_key=true', E(u, 0.1, 0.8), { fs: 14 });
    if (k === 2) cmd(40, 46, 'vault read -field=public_key ssh-client-signer/config/ca > trusted-user-ca-keys.pem', E(u, 0.1, 0.9), { fs: 13.5 });
    const kp = k === 1 ? pop(u, 0.9) : 1;
    keyIcon(V[0] - 100, V[1] + 10, 1.4 * kp, BAD); lock(V[0] - 100, V[1] + 70, true, BAD, kp); mono(V[0] - 100, V[1] + 110, 'CA 개인키', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: clamp(kp) });
    const pubX = k === 1 ? V[0] + 80 : k >= 2 ? lerp(V[0] + 80, 700, k === 2 ? E(u, 0.9, 1.7) : 1) : V[0] + 80;
    keyIcon(pubX, V[1] + 10, 1.4 * kp, INFO); mono(pubX, V[1] + 50, 'CA 공개키', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: clamp(kp) });
    if (k === 1) sub(V[0], V[1] + 162, '응답에는 public_key만 나온다', fade(u, 1.8), { 'font-weight': 700 });
    if (k >= 2) { const f = k === 2 ? fade(u, 1.7) : 1; el('rect', { x: 560, y: 300, width: 380, height: 66, rx: 8, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: f });
      mono(574, 324, 'trusted-user-ca-keys.pem', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: f }); mono(574, 350, 'ssh-rsa AAAAB3NzaC1yc2E…', { 'font-size': 14, fill: INFO, opacity: f }); }
    if (k === 3) { const out = E(u, 0.3, 0.9), back = E(u, 0.9, 1.4); keyIcon(V[0] - 100 + 170 * out - 170 * back, V[1] - 22, 0.9, BAD, { op: 0.7 });
      if (u > 0.9) cross(V[0] + 90, V[1] - 22, 11, pop(u, 0.9));
      sub(V[0], V[1] + 162, '서명은 언제나 Vault 안에서 한다', fade(u, 1.5), { fill: GOOD, 'font-weight': 700 });
      sub(750, 400, '서버에 나눌 것은 공개키 파일 하나', fade(u, 1.9), { 'font-weight': 700 }); } }

  // 3. 서버가 CA 를 믿는다
  function s3(t, c) { const { k, u } = c, S = [160, 200];
    server(S[0], S[1], 'web-01', { lamp: k >= 3 ? GOOD : OFF, s: 1.1 });
    if (k === 0) { cmd(40, 46, 'scp trusted-user-ca-keys.pem web-01:/etc/ssh/', E(u, 0.1, 0.7));
      fly(800, 200, S[0] + 60, S[1], seg(u, 0.8, 1.9), 'trusted-user-ca-keys.pem', { mono: true, fill: INFO }); mono(300, 270, '→ web-01:/etc/ssh/trusted-user-ca-keys.pem', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(560, 330, '사용자 키가 아니라 CA 공개키 파일 하나', fade(u, 2.0), { 'font-weight': 700 }); return; }
    if (k >= 1 && k <= 3) { const L = [['TrustedUserCAKeys /etc/ssh/trusted-user-ca-keys.pem', INFO]]; if (k >= 2) L.push(['AuthorizedPrincipalsFile /etc/ssh/auth_principals/%u', ACC]);
      file(300, 70, 620, '/etc/ssh/sshd_config', L, k === 1 ? E(u, 0.2, 1.4) : k === 2 ? (u < 0.2 ? 0.5 : lerp(0.5, 1, E(u, 0.2, 1.2))) : 1); }
    if (k === 1) sub(610, 200, '이 CA가 서명한 인증서면 통과', fade(u, 1.6), { fill: INFO, 'font-weight': 700 });
    if (k === 2) { file(360, 210, 300, '/etc/ssh/auth_principals/alice', [['alice', GOOD]], E(u, 1.2, 1.7));
      grow(670, 258, 760, 258, E(u, 1.8, 2.1), GOOD); tx(770, 264, '인증서 principal과 대조', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }
    if (k === 3) { cmd(300, 250, 'sudo systemctl restart sshd', E(u, 0.1, 0.7)); check(S[0] + 80, S[1] - 50, 12, pop(u, 1.3));
      sub(560, 300, '서버 쪽 작업은 여기서 끝', fade(u, 1.5), { 'font-weight': 700 }); }
    if (k === 4) { const n = Math.round(tween(50, 500, u, 1.6));
      card(470, 160, 220, 90, { rx: 12, stroke: ACC, sw: 2.5 }); tx(470, 140, '사용자 수', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      mono(470, 178, n + '명', { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
      card(760, 160, 220, 90, { rx: 12, stroke: GOOD, sw: 2.5 }); tx(760, 140, '서버 설정 파일', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      mono(760, 178, '그대로', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
      banner(560, 320, 'authorized_keys 배포 0건', pop(u, 1.9)); } }

  // 4. 공개키 서명 → 짧은 인증서
  function s4(t, c) { const { k, u } = c, V = [740, 190];
    if (k <= 1) { if (k === 0) cmd(40, 46, 'vault write ssh-client-signer/roles/my-role - <<EOF', E(u, 0.1, 0.7));
      vaultBox(480, 230, 560, 300, 'ssh-client-signer/roles/my-role', { mono: true, s: k === 0 ? pop(u, 0.9) : 1 });
      const rows = [['key_type', 'ca'], ['allowed_users', 'alice,bob'], ['default_user', 'alice'], ['ttl', '30m0s'], ['default_extensions', 'permit-pty'], ['algorithm_signer', 'rsa-sha2-256']];
      if (k === 1) rows.forEach(([a, b], i) => { const f = fade(u, 0.2 + i * 0.3); mono(230, 130 + i * 38, a, { 'font-size': 15, fill: MUT, opacity: f });
        mono(470, 130 + i * 38, b, { 'font-size': 16, 'font-weight': 800, fill: i === 3 ? WARN : i === 4 ? GOOD : INK, opacity: f }); });
      else sub(480, 240, '무엇을 얼마나 짧게 서명할지 적는 틀', fade(u, 1.4), { 'font-weight': 700 }); return; }
    if (k === 2) { person(110, 190, 'alice', {}); keyIcon(110, 280, 1.1, BAD); lock(160, 280, true, BAD, 1); mono(110, 316, 'id_rsa (로컬에)', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
      vaultBox(V[0], V[1], 300, 170, 'Vault CA', { stroke: INFO }); sub(V[0], V[1] + 10, 'sign/my-role · principal 확인', 1, { 'font-weight': 700 });
      fly(170, 160, V[0] - 150, V[1] - 30, seg(u, 0.2, 1.2), 'id_rsa.pub', { mono: true, fill: INK });
      if (u > 1.3) sshCert(lerp(V[0], 330, E(u, 1.4, 2.4)), lerp(V[1] + 120, 330, E(u, 1.4, 2.4)), { s: 0.9 });
      return; }
    if (k === 3) { const lines = ['$ ssh-keygen -Lf ~/.ssh/id_rsa-cert.pub', 'Type: ssh-rsa-cert-v01@openssh.com user certificate', 'Signing CA: RSA SHA256:… (using rsa-sha2-256)',
        'Valid: from 2026-08-11T08:59:30 to 2026-08-11T09:30:00', 'Principals: alice', 'Extensions: permit-pty'];
      terminal(40, 30, 880, 200, lines, lerp(1, 6, E(u, 0.1, 1.4)), { lh: 24, fs: 14 });
      const x = 120, w = 720, X = (m) => x + ((m + 1) / 32) * w, y = 300;
      el('line', { x1: x, y1: y + 26, x2: x + w, y2: y + 26, stroke: GRID, 'stroke-width': 2 });
      const f = E(u, 1.5, 2.4); el('rect', { x: X(-0.5), y, width: (X(30) - X(-0.5)) * f, height: 20, rx: 5, fill: WARN, opacity: 0.75 });
      [['08:59:30', -0.5], ['09:00', 0], ['09:30', 30]].forEach(([s, m], i) => mono(X(m), i === 0 ? y - 10 : y + 50, s, { 'font-size': 13.5, 'text-anchor': i === 0 ? 'end' : 'middle', fill: MUT, opacity: fade(u, 1.6) }));
      sub(480, 400, '시작은 30초 앞당겨(not_before_duration 30s), 끝은 30분 뒤', fade(u, 2.2), { 'font-weight': 700 }); return; }
    // k4 접속과 만료
    server(780, 170, 'web-01', { lamp: u < 2.0 ? GOOD : BAD }); person(110, 170, 'alice', {}); sshCert(260, 320, { s: 1 });
    grow(150, 170, 700, 170, E(u, 0.2, 0.8), INFO);
    [['CA 서명', 0], ['principal alice', 1], ['유효기간 안', 2]].forEach(([s, i]) => { const y = 250 + i * 40; tx(600, y + 6, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.3) }); check(570, y, 9, pop(u, 0.8 + i * 0.3)); });
    if (u > 2.0) { cross(260, 320, 30, pop(u, 2.0)); mono(420, 400, '09:30 이후: 같은 인증서로는 거부', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); } }

  // 5. OTP vs CA
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { [0, 1, 2].forEach((i) => { const x = 140 + i * 130; server(x, 150, null, { s: 0.7 });
        ['helper', 'PAM'].forEach((s, j) => card(x, 230 + j * 38, 104, 30, { rx: 6, text: s, fs: 13.5, stroke: WARN, color: WARN, s: k === 0 ? pop(u, 0.3 + i * 0.3 + j * 0.15) : 1 })); });
      tx(270, 70, 'OTP 모드', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN });
      sub(270, 340, '서버마다 vault-ssh-helper 설치', k === 0 ? fade(u, 1.5) : 1, { 'font-weight': 700 });
      if (k === 1) { [0, 1, 2].forEach((i) => { const x = 560 + i * 130; server(x, 150, null, { s: 0.7, lamp: GOOD });
          card(x, 240, 120, 30, { rx: 6, text: 'CA 한 줄', fs: 13.5, stroke: GOOD, color: GOOD, s: pop(u, 0.3 + i * 0.3) }); });
        tx(690, 70, 'CA 모드', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
        sub(690, 340, 'TrustedUserCAKeys 한 줄, 표준 OpenSSH', fade(u, 1.5), { 'font-weight': 700 }); }
      return; }
    if (k === 2) { cmd(40, 46, 'vault write ssh-client-signer/roles/restricted - <<EOF', E(u, 0.1, 0.7));
      sshCert(260, 220, { ttl: '15m', s: pop(u, 0.8) }); sshCert(640, 220, { ttl: '30m', op: 0.45 });
      mono(640, 300, 'my-role', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); mono(260, 300, 'restricted · alice만', { 'font-size': 14, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(450, 370, '확장은 적힌 것만 붙는다. permit-pty 하나뿐', fade(u, 1.8), { 'font-weight': 700 }); return; }
    if (k === 3) { person(110, 200, 'alice', {}); server(480, 200, 'web-01', { lamp: GOOD });
      R.dbIcon(830, 200, '내부 DB', {});
      grow(150, 190, 410, 190, E(u, 0.2, 0.7), GOOD); tx(280, 175, '셸(pty)', { 'text-anchor': 'middle', 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
      const f = E(u, 0.9, 1.6); el('rect', { x: 150, y: 292, width: 610 * f, height: 18, rx: 9, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' });
      tx(450, 338, '포트 포워딩 터널', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
      cross(560, 301, 14, pop(u, 1.7)); sub(480, 392, 'permit-port-forwarding이 없으니 터널은 열리지 않는다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { const x = 70, y = 70; el('rect', { x, y, width: 820, height: 180, rx: 10, fill: SOFT, stroke: GRID });
      mono(x + 16, y + 28, 'vault audit log', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      [['alice', 'ssh-client-signer/sign/my-role', 'principal=alice'], ['bob', 'ssh-client-signer/sign/my-role', 'principal=bob']].forEach((r, j) =>
        r.forEach((s, i) => mono(x + 16 + [0, 120, 520][i], y + 72 + j * 44, s, { 'font-size': 14.5, opacity: fade(u, 0.4 + j * 0.6 + i * 0.1) })));
      card(480, 320, 360, 60, { rx: 10, stroke: GOOD, sw: 2.5, text: '서버 쪽 키 배포·회수 0건', fs: 16, color: GOOD, s: pop(u, 1.8) }); return; }
    // k5
    [['OTP', '접속마다 비밀번호 · helper 필요', WARN, 250], ['CA', '짧은 인증서 · sshd 한 줄', GOOD, 710]].forEach(([a, b, col, x], i) => {
      card(x, 170, 360, 120, { rx: 14, stroke: col, sw: i ? 3.5 : 2, s: pop(u, 0.2 + i * 0.4) });
      tx(x, 160, a + ' 모드', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.4) });
      tx(x, 192, b, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.3 + i * 0.4) }); });
    banner(480, 320, '대규모 SSH는 CA 모드로 중앙 관리', pop(u, 1.6));
    sub(480, 380, 'principal로 대상, TTL로 만료, 확장으로 권한을 좁힌다', fade(u, 2.0), { 'font-weight': 700 }); }

  const quiz = [
    { q: '서버 100대, 사용자 50명을 authorized_keys로 관리할 때 근본 문제는 무엇인가?',
      o: ['공개키가 너무 길다', '키에 만료가 없고 5000개를 빠짐없이 배포·회수해야 한다', 'sshd가 공개키를 읽지 못한다'], a: 1,
      why: '키 하나가 영원히 유효하고, 퇴사자 키를 한 서버라도 빠뜨리면 뒷문이 남는다. 다 지웠다는 증명도 어렵다.' },
    { q: 'generate_signing_key=true 뒤에 Vault 밖으로 꺼내 서버에 나눠 주는 것은?',
      o: ['CA 공개키', 'CA 개인키', '사용자 개인키'], a: 0,
      why: 'CA 개인키는 Vault 안에만 있고 서명도 거기서 한다. 서버에는 trusted-user-ca-keys.pem 하나만 심는다.' },
    { q: '사용자가 50명에서 500명으로 늘면 서버 sshd 설정은 어떻게 되나?',
      o: ['사용자마다 줄이 하나씩 는다', '서버를 다시 설치해야 한다', '그대로다'], a: 2,
      why: '서버는 TrustedUserCAKeys로 CA 하나만 믿는다. 새 사용자는 Vault에서 인증서만 받으면 된다.' },
    { q: 'alice가 서명을 요청할 때 Vault로 보내는 것은?',
      o: ['id_rsa 개인키', 'id_rsa.pub 공개키', '서버의 sshd_config'], a: 1,
      why: '서명에는 공개키만 필요하다. 개인키는 로컬을 떠나지 않고, 돌아오는 것은 30분짜리 id_rsa-cert.pub이다.' },
    { q: 'restricted role처럼 default_extensions에 permit-pty만 둔 인증서로 할 수 없는 것은?',
      o: ['셸 접속', '포트 포워딩 터널', 'principal 확인'], a: 1,
      why: '확장은 적힌 것만 붙는다. permit-port-forwarding이 없으니 터널을 열 수 없다.' },
  ];

  const summary = [
    '서버마다 authorized_keys를 고치면 만료 없는 키 5000개를 사람이 쫓게 된다.',
    'Vault가 SSH CA가 되어 개인키는 안에 두고 공개키 파일 하나만 서버에 심는다.',
    '서버는 TrustedUserCAKeys 한 줄로 CA만 믿어서 사용자가 늘어도 설정이 그대로다.',
    'alice는 공개키를 보내 30분짜리 인증서를 받고, 시간이 지나면 저절로 못 쓴다.',
  ];
  const review = [
    { q: 'alice가 퇴사했다. CA 모드에서 가장 먼저 할 일은?',
      o: ['100대 서버의 authorized_keys를 모두 편집한다', 'Vault에서 alice의 서명 권한을 거둔다', 'sshd_config에서 TrustedUserCAKeys를 지운다'], a: 1,
      why: '서버에는 alice 키가 없다. 새 인증서를 못 받게 막으면 이미 받은 것도 30분 안에 만료된다.' },
    { q: 'bob이 인증서로 web-01에 alice 계정으로 들어가려다 거부됐다. 막은 것은?',
      o: ['인증서 principal과 auth_principals/alice 파일의 대조', 'OTP 재사용 방지', 'transit 키 회전'], a: 0,
      why: 'AuthorizedPrincipalsFile을 두면 로그인 계정별로 허용 principal을 확인한다. bob 인증서의 principal은 alice가 아니다.' },
    { q: '서버가 수백 대인데 각 서버에 에이전트를 깔 수 없다. 두 모드 중 맞는 쪽과 이유는?',
      o: ['OTP, 접속마다 비밀번호가 바뀌어서', 'CA, sshd 설정 한 줄이면 되고 helper가 필요 없어서', '둘 다 helper가 필요해 어렵다'], a: 1,
      why: 'OTP는 서버마다 vault-ssh-helper와 PAM 연동이 필요하다. CA 모드는 표준 OpenSSH 인증서라 sshd만 있으면 된다.' },
  ];

  R.page({ title: 'SSH CA 서명 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
