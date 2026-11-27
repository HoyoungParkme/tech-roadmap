/* IV-1-2 SSO / Dex 통합 로그인 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 아래 띠의 단계(사용자 → IdP → Dex → ID 토큰 → RBAC → 권한)는 STEPS 의 active, 매핑 표는 mapping 을 읽는다.
 * 콜백 경로·requestedScopes 기본값·scopes 기본값은 Argo CD 문서로 확인했다. exp − iat = 86400초(24h)는 코드의 예시 토큰 값이다. 터미널 출력은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    person, cross, check, lock, terminal, spans, server, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 아래 띠: 로그인 파이프라인에서 지금 켜진 단계
  const PIPE = ['사용자', 'IdP', 'Dex', 'ID 토큰', 'RBAC', '권한'];
  function pipe(c) { const a = new Set(c.beat.active || []), pa = new Set((c.prev && c.prev.active) || []), y = 398;
    PIPE.forEach((n, i) => { const x = 105 + i * 150, on = a.has(i);
      if (i < 5) el('line', { x1: x + 46, y1: y, x2: x + 104, y2: y, stroke: on && a.has(i + 1) ? ACC : GRID, 'stroke-width': 2.5 });
      card(x, y, 92, 30, { rx: 15, text: n, fs: 13.5, fw: 700, stroke: on ? ACC : GRID, fill: on ? ACCBG : PANEL, color: on ? ACC : OFF, s: on && !pa.has(i) ? pop(c.u, 0.2 + i * 0.08) : 1 }); }); }
  function idpBox(cx, cy, name, o) { o = o || {}; const g = card(cx, cy, o.w || 150, o.h || 64, { rx: 12, stroke: o.stroke || INFO, sw: 2.5, fill: INFOBG, s: o.s, op: o.op });
    tx(0, o.sub ? -4 : 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.stroke || INFO }, g);
    if (o.sub) tx(0, 18, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g); return g; }
  function argoBox(cx, cy, o) { o = o || {}; return card(cx, cy, o.w || 140, o.h || 64, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, text: o.text || 'Argo CD', fs: 15, color: ACC, s: o.s, op: o.op }); }
  function dexBox(cx, cy, o) { o = o || {}; return card(cx, cy, o.w || 120, o.h || 56, { rx: 12, stroke: WARN, sw: 2.5, fill: WARNBG, text: 'Dex', fs: 16, color: WARN, s: o.s, op: o.op, dash: o.dash }); }

  // ---------- 1. 왜 SSO ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 50, 'argocd-cm accounts.* (로컬 계정)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      ['계정', '비밀번호', 'MFA', '상태'].forEach((h, i) => tx(80 + [0, 170, 330, 450][i], 88, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }));
      [['admin', '공유', '사용 중'], ['alice', '개별', '사용 중'], ['bob', '메신저로 받음', '사용 중'], ['dan', '개별', '퇴사했는데 남음']].forEach(([n, pw, st], i) => { const y = 124 + i * 46, op = fade(u, 0.2 + i * 0.3), z = i === 3;
        el('rect', { x: 64, y: y - 24, width: 620, height: 38, rx: 6, fill: z ? BADBG : PANEL, stroke: z ? BAD : GRID, opacity: op });
        mono(80, y, n, { 'font-size': 15, 'font-weight': 700, fill: z ? BAD : INK, opacity: op }); tx(250, y, pw, { 'font-size': 14, opacity: op, fill: pw === '공유' || pw === '메신저로 받음' ? BAD : INK });
        cross(420, y - 5, 8, op); tx(530, y, st, { 'font-size': 14, fill: z ? BAD : MUT, 'font-weight': z ? 700 : 400, opacity: op }); });
      note(64, 340, '좀비 계정 · MFA 없음 · 약한 감사', fade(u, 1.9), { fill: BAD });
      pipe(c); return; }
    if (k === 1) { idpBox(180, 170, '조직 IdP', { w: 220, h: 200, sub: 'GitHub · Google' });
      ['alice', 'bob', 'carol'].forEach((n, i) => { person(120 + i * 60, 236, null, { s: 0.6 }); });
      pill(180, 120, 'MFA · 계정 생성/삭제', GOOD, pop(u, 0.6), { fs: 13.5 });
      grow(296, 170, 600, 170, E(u, 0.5, 1.4), ACC); mono(450, 158, '로그인 위임', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      argoBox(700, 170, { w: 180, h: 80, text: 'Argo CD\n인가(RBAC)만', s: pop(u, 0.9) });
      note(420, 320, '퇴사하면 IdP에서 끈다. 새 로그인이 막힌다', fade(u, 1.8), { 'text-anchor': 'middle' });
      pipe(c); return; }
    if (k === 2) { idpBox(130, 110, 'GitHub', { sub: 'LDAP · SAML', s: pop(u, 0.2) }); dexBox(440, 110, { s: pop(u, 0.6) }); argoBox(780, 220, { s: pop(u, 0.2) });
      idpBox(130, 330, 'Okta', { sub: 'Keycloak · 표준 OIDC', w: 180, s: pop(u, 1.2) });
      grow(206, 110, 378, 110, E(u, 0.7, 1.1), WARN); grow(502, 110, 708, 200, E(u, 1.0, 1.4), WARN);
      grow(222, 330, 708, 240, E(u, 1.5, 2.1), INFO);
      mono(290, 98, 'OIDC 모름', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(560, 306, 'Dex 없이 바로', { 'font-size': 14, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      pipe(c); return; }
    if (k === 3) { el('line', { x1: 480, y1: 40, x2: 480, y2: 360, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
      tx(240, 70, '인증: 너 누구야?', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      tx(720, 70, '인가: 뭘 해도 돼?', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      idpBox(170, 190, 'IdP', { s: pop(u, 0.4) }); dexBox(330, 190, { s: pop(u, 0.6) });
      argoBox(720, 190, { w: 220, text: 'Argo CD RBAC', s: pop(u, 1.1) });
      fly(400, 190, 610, 190, seg(u, 1.4, 2.3), 'groups', { mono: true });
      sub(240, 260, '비밀번호 · MFA는 여기서 끝', fade(u, 0.8)); sub(720, 260, 'policy.csv로 판정', fade(u, 1.5));
      pipe(c); return; }
    // k4: 로컬 admin 은 비상용
    card(250, 180, 260, 150, { rx: 12, stroke: GRID, sw: 2, dash: '7 6', fill: SOFT });
    tx(250, 130, '비상용 유리함', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    lock(250, 186, true, WARN, pop(u, 0.4)); mono(250, 236, 'admin', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN });
    idpBox(620, 120, 'SSO 로그인', { w: 200, s: pop(u, 0.8) }); grow(720, 120, 840, 180, E(u, 1.0, 1.6), ACC); argoBox(840, 220, { w: 130, s: pop(u, 1.2) });
    note(560, 300, '평소에는 SSO, admin은 복구할 때만', fade(u, 1.8));
    pipe(c); }

  // ---------- 2. Dex 설정 ----------
  function cm(x, y, w, lines, o) { o = o || {}; el('rect', { x, y, width: w, height: 30 + lines.length * 26, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    mono(x + 14, y + 22, o.title || 'argocd-cm', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: o.op ?? 1 });
    lines.forEach(([s, col, op], i) => mono(x + 14, y + 50 + i * 26, s, { 'font-size': 14, fill: col || INK, opacity: (op ?? 1) * (o.op ?? 1) })); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const a = 'https://argocd.acme.com', b = '/api/dex/callback', w = tw(a, 17);
      cm(60, 50, 420, [['url: https://argocd.acme.com', ACC]], {});
      const x0 = 120, y = 220, slide = E(u, 0.6, 1.6);
      mono(x0, y, a, { 'font-size': 17, 'font-weight': 700, fill: ACC });
      mono(lerp(x0 + w + 160, x0 + w, slide), y, b, { 'font-size': 17, 'font-weight': 700, fill: WARN });
      grow(200, 120, 200, 196, E(u, 0.2, 0.6), ACC);
      note(120, 280, '콜백 주소 = url + /api/dex/callback', fade(u, 1.8));
      pipe(c); return; }
    const dexLines = [['dex.config: |', INK], ['  connectors:', INK], ['    - type: github', WARN], ['      config:', INK],
      ['        clientID: $dex.github.clientID', ACC], ['        clientSecret: $dex.github.clientSecret', ACC], ['        orgs: [ { name: acme } ]', INFO], ['        teamNameField: slug', INFO]];
    const shown = k === 1 ? 4 : 8;
    cm(30, 34, 470, dexLines.slice(0, shown).map(([s, col], i) => [s, col, k === 1 ? fade(u, 0.2 + i * 0.2) : (k === 2 && (i === 4 || i === 5)) ? fade(u, 0.2) : (k === 3 && i >= 6 ? fade(u, 0.2 + (i - 6) * 0.3) : 1)]));
    if (k === 1) { dexBox(760, 120, { s: pop(u, 0.4) }); idpBox(760, 270, 'GitHub', { s: pop(u, 0.9) }); grow(760, 238, 760, 152, E(u, 1.1, 1.7), WARN);
      tx(800, 200, '커넥터 하나 = IdP 하나', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 2 || k === 4) { const sx = 660, sy = 150;
      cm(sx, sy, 270, [['dex.github.clientID', ACC], [k === 4 ? '"Iv1.0a1b2c3d…"' : '(값)', k === 4 ? INK : OFF], ['dex.github.clientSecret', ACC], [k === 4 ? '"REDACTED…"' : '(값)', k === 4 ? INK : OFF]], { title: 'argocd-secret', stroke: ACC });
      grow(440, 180, sx - 6, 200, E(u, 0.6, 1.3), ACC); grow(470, 206, sx - 6, 250, E(u, 0.8, 1.5), ACC);
      if (k === 2) { mono(560, 330, 'clientSecret: abc123…', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'text-decoration': 'line-through', opacity: fade(u, 1.4) }); sub(560, 354, 'ConfigMap에 평문은 쓰지 않는다', fade(u, 1.6)); }
      else sub(795, 320, '이 파일은 저장소에 커밋하지 않는다', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); }
    if (k === 3) { const users = [['kim', 'acme', 'platform-team'], ['lee', 'acme', 'frontend'], ['park', 'other-org', '']];
      users.forEach(([n, org, team], i) => { const y = 90 + i * 64, ok = org === 'acme', f = seg(u, 0.3 + i * 0.3, 1.3 + i * 0.3);
        mono(560, y, n + ' @' + org, { 'font-size': 14, 'font-weight': 700, fill: ok ? INK : BAD });
        if (ok) { dot([[690, y - 5], [760, y - 5]], f, INFO, 6); if (f >= 1) mono(780, y, '"acme:' + team + '"', { 'font-size': 14, fill: INFO, 'font-weight': 700 }); }
        else cross(720, y - 5, 10, pop(u, 1.2)); });
      sub(720, 300, 'GitHub team이 groups 클레임이 된다', fade(u, 1.8), { fill: INFO, 'font-weight': 700 }); }
    if (k === 5) { const reg = 'https://argocd.acme.com/api/dex/callback', bad = 'https://argocd.acme.com/api/dex/callbak';
      tx(560, 300, 'GitHub OAuth App에 등록한 값', { 'font-size': 13.5, fill: MUT }); mono(560, 324, reg, { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(560, 350, '한 글자 다르면', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) }); mono(560, 374, bad, { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
      card(760, 120, 290, 50, { rx: 10, stroke: BAD, fill: BADBG, text: 'redirect_uri mismatch', fs: 15, mono: true, color: BAD, s: pop(u, 1.8) }); }
    pipe(c); }

  // ---------- 3. 로그인 흐름 (시퀀스) ----------
  const LANE = [['브라우저', 110], ['Argo CD', 350], ['Dex', 590], ['GitHub', 830]];
  const MSG = [
    [[0, 1, 'GET /auth/login'], [1, 2, '리다이렉트 (state, nonce)']],
    [[2, 3, '로그인 화면 + MFA'], [3, 2, 'authorization code']],
    [[2, 3, 'code → access token'], [3, 2, 'org · team 정보']],
  ];
  function lanes(op) { LANE.forEach(([n, x]) => { card(x, 40, 130, 34, { rx: 8, text: n, fs: 15, stroke: INK, op });
    el('line', { x1: x, y1: 58, x2: x, y2: 360, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 6', opacity: op }); }); }
  function arrow(i, j, y, label, f, col) { const x1 = LANE[i][1], x2 = LANE[j][1], d = x2 > x1 ? 1 : -1;
    grow(x1 + d * 6, y, x2 - d * 6, y, f, col); if (f > 0.3) mono((x1 + x2) / 2, y - 8, label, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col === OFF ? MUT : col, 'font-weight': 700, opacity: col === OFF ? 0.6 : fade(f, 0.3, 0.4) }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 2) { lanes(1);
      for (let b = 0; b <= k; b++) MSG[b].forEach(([i, j, s], m) => { const y = 96 + b * 92 + m * 40, now = b === k;
        arrow(i, j, y, s, now ? E(u, 0.3 + m * 0.8, 1.0 + m * 0.8) : 1, now ? (j < i ? INK : ACC) : OFF); });
      if (k === 1) pill(830, 178, 'MFA', GOOD, pop(u, 0.9), { fs: 13.5 });
      if (k === 2) { card(590, 352, 150, 40, { rx: 8, stroke: WARN, fill: WARNBG, text: 'ID 토큰 서명', fs: 14.5, color: WARN, s: pop(u, 2.0) }); }
      pipe(c); return; }
    // 토큰 들여다보기
    if (k === 3 || k === 4) { el('rect', { x: 60, y: 40, width: 470, height: 320, rx: 12, fill: PANEL, stroke: INFO, 'stroke-width': 2 });
      mono(80, 66, 'ID 토큰 payload (예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const L = [['"iss": "https://argocd.acme.com/api/dex"', INK, 3], ['"sub": "Cg8xMjM0NTY3OBIGZ2l0aHVi"', INK, 3], ['"email": "kim@acme.com"', INK, 3],
        ['"groups": ["acme:platform-team",', ACC, 4], ['           "acme:frontend"]', ACC, 4], ['"exp": 1734500000', WARN, 4], ['"iat": 1734413600', WARN, 4]];
      L.forEach(([s, col, b], i) => { if (b > k) return; const op = b === k ? fade(u, 0.2 + (i % 4) * 0.3) : 1;
        if (b === 4 && i >= 3 && i <= 4 && k === 4) el('rect', { x: 70, y: 82 + i * 36, width: 450, height: 28, rx: 5, fill: ACCBG, opacity: op });
        mono(84, 102 + i * 36, s, { 'font-size': 14.5, fill: col, opacity: op, 'font-weight': col === INK ? 500 : 700 }); });
      if (k === 3) { [['iss', '누가 발급했나'], ['sub', 'IdP의 고유 ID'], ['email', '사람이 읽는 이름']].forEach(([a, b], i) => { const y = 110 + i * 60;
          mono(600, y, a, { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6 + i * 0.4) }); tx(680, y, b, { 'font-size': 14.5, opacity: fade(u, 0.6 + i * 0.4) }); }); }
      else { const sec = Math.round(tween(0, 86400, u, 1.6));
        tx(600, 110, 'exp − iat', { 'font-size': 15, fill: MUT, 'font-weight': 700 }); mono(600, 150, sec.toLocaleString('en-US') + '초', { 'font-size': 28, 'font-weight': 800, fill: WARN });
        mono(600, 184, '= 24시간', { 'font-size': 16, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) });
        note(600, 250, 'RBAC은 groups 배열만 본다', fade(u, 2.0), { fill: ACC }); }
      pipe(c); return; }
    if (k === 5) { lanes(0.35); arrow(2, 1, 110, 'ID 토큰', E(u, 0.2, 0.9), ACC);
      card(350, 170, 170, 40, { rx: 8, stroke: GOOD, fill: GOODBG, text: '서명 검증', fs: 14.5, color: GOOD, s: pop(u, 0.9) });
      arrow(1, 0, 236, '세션 쿠키', E(u, 1.2, 1.8), INK);
      pill(350, 300, 'groups → policy.csv', ACC, pop(u, 1.9), { mono: true, fs: 14 });
      pipe(c); return; }
    terminal(60, 50, 560, 220, ['$ argocd account get-user-info', 'Logged In: true', 'Username: kim@acme.com', ['Groups: acme:platform-team,acme:frontend', 'var(--good)']], 1 + E(u, 0.2, 2.2) * 3, { fs: 14.5 });
    sub(340, 294, '출력은 예시', fade(u, 2.0));
    card(790, 160, 250, 90, { rx: 10, stroke: BAD, text: 'Groups가 비어 있으면\nRBAC이 아무 역할도 못 준다', fs: 14, color: BAD, s: pop(u, 1.8) });
    pipe(c); }

  // ---------- 4. groups → 역할 ----------
  function mapTable(c, x, y) { const rows = c.beat.mapping || [], ch = !c.prev || JSON.stringify(c.prev.mapping) !== JSON.stringify(rows);
    ['groups 클레임', 'role', '권한'].forEach((h, i) => tx(x + [0, 170, 320][i], y, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }));
    rows.forEach((r, i) => { const yy = y + 34 + i * 46, op = ch ? fade(c.u, 0.3 + i * 0.3) : 1, empty = /없음|매핑 전|비어/.test(r.group + r.role);
      el('rect', { x: x - 10, y: yy - 22, width: 470, height: 38, rx: 6, fill: empty ? SOFT : PANEL, stroke: GRID, opacity: op });
      mono(x, yy, r.group, { 'font-size': 13.5, fill: empty ? MUT : INFO, 'font-weight': 700, opacity: op });
      mono(x + 170, yy, r.role, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: op });
      tx(x + 320, yy, r.perm, { 'font-size': 13.5, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c;
    mapTable(c, 480, 50);
    if (k === 0) { el('rect', { x: 40, y: 270, width: 380, height: 20, rx: 4, fill: GOOD, opacity: 0.25 + 0.5 * E(u, 0.3, 1.2) });
      mono(230, 310, 'policy.default: role:readonly', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      [0, 1, 2].forEach((i) => { person(110 + i * 110, 220, null, { s: pop(u, 1.2 + i * 0.2) }); });
      sub(230, 336, '아무 규칙에도 안 걸려도 조회는 된다', fade(u, 1.8)); }
    if (k === 1) { card(220, 110, 300, 44, { rx: 10, stroke: ACC, text: 'role:web-deployer', fs: 16, mono: true, color: ACC, s: pop(u, 0.2) });
      [['get', '*/*'], ['sync', '*/web-*'], ['action/*', '*/web-*']].forEach(([a, o], i) => { const y = 176 + i * 38;
        el('circle', { cx: 116, cy: y - 5, r: 5 * E(u, 0.5 + i * 0.2, 0.9 + i * 0.2), fill: ACC }); mono(130, y, a + '  ' + o, { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.7 + i * 0.25) }); });
      sub(220, 320, '아직 이 역할을 가진 그룹이 없다', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); }
    if (k === 2) { [['g, acme:platform-team, role:admin', BAD], ['g, acme:frontend, role:web-deployer', ACC], ['g, acme:readonly, role:readonly', GOOD]].forEach(([s, col], i) => {
        const y = 100 + i * 60; mono(40, y, s, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) });
        grow(40, y + 14, 40 + 330 * E(u, 0.4 + i * 0.3, 1.0 + i * 0.3), y + 14, 1, col, { plain: true }); });
      note(40, 300, '토큰의 groups 문자열을 그대로 적는다', fade(u, 1.7)); }
    if (k === 3) { tx(40, 80, 'scopes: "[groups, email]"', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      [['groups', GOOD, 'g 규칙이 동작'], ['email', GOOD, '개인 단위 규칙']].forEach(([n, col, w], i) => { pill(90 + i * 120, 130, n, col, pop(u, 0.3 + i * 0.3), { mono: true });
        sub(90 + i * 120, 166, w, fade(u, 0.7 + i * 0.3)); });
      card(200, 260, 320, 60, { rx: 10, stroke: BAD, sw: 2, dash: '6 5', text: 'groups가 빠지면\ng 규칙 전부 무시', fs: 14.5, color: BAD, s: pop(u, 1.5) });
      sub(200, 314, '기본값은 [groups]', fade(u, 2.0)); }
    if (k === 4) { terminal(30, 40, 430, 250, ['$ argocd admin settings rbac validate \\', '    --policy-file policy.csv', ['정책 문법 정상', 'var(--good)'], '$ argocd admin settings rbac can \\', '    role:web-deployer sync applications \\', '    default/web-prd --policy-file policy.csv', ['Yes', 'var(--good)']], 1 + E(u, 0.2, 2.4) * 6, { fs: 13.5, lh: 20 });
      sub(245, 312, '출력은 예시', fade(u, 2.2)); }
    if (k === 5) { terminal(30, 40, 430, 170, ['$ argocd account get-user-info', 'Username: kim@acme.com', ['Groups: acme:frontend', 'var(--good)']], 1 + E(u, 0.2, 1.8) * 2, { fs: 14 });
      sub(245, 232, '출력은 예시', fade(u, 1.8)); note(40, 290, '토큰에 실제로 groups가 왔는지 먼저 본다', fade(u, 2.0)); }
    if (k === 6) { tx(40, 80, '토큰', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(40, 110, '"acme:frontend"', { 'font-size': 18, 'font-weight': 800, fill: INFO });
      tx(40, 170, 'policy.csv', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); spans(40, 200, [['g, ', { fill: MUT }], ['frontend', { fill: BAD, 'font-weight': 800 }], [', role:web-deployer', { fill: INK }]], { 'font-size': 16 });
      el('rect', { x: 40, y: 92, width: 56 * E(u, 0.6, 1.2), height: 24, rx: 4, fill: BAD, opacity: 0.18 });
      cross(400, 150, 14, pop(u, 1.2)); note(40, 260, '접두어 acme: 하나로 매칭이 조용히 실패한다', fade(u, 1.6), { fill: BAD }); }
    pipe(c); }

  // ---------- 5. 외부 OIDC 직결 + 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { idpBox(130, 170, 'Okta', { sub: '표준 OIDC', s: pop(u, 0.2) }); dexBox(450, 90, { dash: '6 5', op: lerp(1, 0.3, E(u, 0.5, 1.2)) });
      grow(206, 170, 678, 170, E(u, 0.9, 1.7), INFO); argoBox(760, 170, { s: pop(u, 0.4) });
      cm(260, 230, 420, [['oidc.config: |', INK], ['  issuer: https://acme.okta.com', INFO], ['  clientID: 0oa1b2c3d4EXAMPLE', INFO]], { op: fade(u, 1.4) });
      pipe(c); return; }
    if (k === 1 || k === 2) { tx(40, 60, 'requestedScopes', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      ['openid', 'profile', 'email', 'groups'].forEach((s, i) => pill(90 + i * 110, 100, s, i === 3 ? ACC : MUT, k === 1 ? pop(u, 0.2 + i * 0.25) : 1, { mono: true }));
      card(700, 180, 340, 170, { rx: 12, stroke: INFO, sw: 2 }); tx(546, 120, 'ID 토큰', { 'font-size': 14, fill: INFO, 'font-weight': 700 });
      mono(546, 160, '"email": "kim@acme.com"', { 'font-size': 14.5 }); mono(546, 196, '"groups": ["acme:frontend"]', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.4) : 1 });
      grow(460, 116, 540, 186, k === 1 ? E(u, 1.1, 1.5) : 1, ACC);
      if (k === 1) note(40, 330, '목록을 직접 적으면서 groups를 빼면 그룹이 안 실린다', fade(u, 1.8), { fill: BAD });
      if (k === 2) { lock(840, 196, true, GOOD, pop(u, 0.5)); mono(40, 220, 'requestedIDTokenClaims:', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
        mono(60, 250, 'groups: { essential: true }', { 'font-size': 15, fill: GOOD, 'font-weight': 800, opacity: fade(u, 0.6) }); note(40, 320, 'IdP에게 groups를 꼭 넣으라고 요구한다', fade(u, 1.4)); }
      pipe(c); return; }
    if (k === 3) { [['Dex를 쓸 때', 'https://argocd.acme.com/api/dex/callback', WARN], ['외부 OIDC 직결', 'https://argocd.acme.com/auth/callback', INFO]].forEach(([a, b, col], i) => { const y = 90 + i * 110;
        tx(60, y, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + i * 0.6) }); mono(60, y + 36, b, { 'font-size': 17, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.6) }); });
      el('rect', { x: 290, y: 108, width: 180 * E(u, 1.4, 1.9), height: 24, rx: 4, fill: WARN, opacity: 0.18 }); el('rect', { x: 290, y: 218, width: 130 * E(u, 1.4, 1.9), height: 24, rx: 4, fill: INFO, opacity: 0.18 });
      note(60, 320, '섞어 등록하면 redirect_uri mismatch', fade(u, 2.0), { fill: BAD });
      pipe(c); return; }
    if (k === 4) { const ax = 80, aw = 760, y = 160; el('line', { x1: ax, y1: y + 60, x2: ax + aw, y2: y + 60, stroke: GRID, 'stroke-width': 2 });
      mono(40, 80, 'users.session.duration: "24h"', { 'font-size': 16, 'font-weight': 800, fill: WARN });
      tx(ax, y + 84, '로그인', { 'font-size': 13.5, fill: MUT }); tx(ax + 300, y + 84, '퇴사 처리', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle' }); tx(ax + aw, y + 84, '세션 만료', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      el('rect', { x: ax, y: y + 20, width: aw * E(u, 0.2, 1.6), height: 26, rx: 5, fill: WARN, opacity: 0.35 });
      el('rect', { x: ax + 300, y: y + 20, width: (aw - 300) * E(u, 1.2, 1.6), height: 26, rx: 5, fill: BAD, opacity: 0.35 });
      el('line', { x1: ax + 300, y1: y + 6, x2: ax + 300, y2: y + 70, stroke: BAD, 'stroke-width': 2.5 });
      note(ax + 320, y - 10, '이 구간은 세션이 아직 살아 있다', fade(u, 1.7), { fill: BAD });
      pipe(c); return; }
    if (k === 5) { [['admin', WARN, true, 220], ['SSO', ACC, false, 620]].forEach(([n, col, locked, cx], i) => { card(cx, 170, 200, 170, { rx: 12, stroke: col, sw: 2.5 });
        tx(cx, 110, n + ' 로그인', { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); lock(cx, 190, locked, col, pop(u, 0.4 + i * 0.4)); });
      mono(220, 290, 'admin.enabled: "false"', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(620, 290, '평소 로그인 경로', fade(u, 1.4)); note(420, 340, '비상시에만 잠깐 켜고 바로 끈다', fade(u, 1.9), { 'text-anchor': 'middle' });
      pipe(c); return; }
    const items = ['requestedScopes에 groups', '콜백 URL이 IdP 등록값과 일치', 'g 그룹명 = 토큰 groups', 'admin.enabled: "false"', '세션 · 토큰 만료 정책'];
    items.forEach((s, i) => { const y = 70 + i * 56, d = 0.2 + i * 0.4;
      el('rect', { x: 200, y: y - 22, width: 30, height: 30, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2 }); check(215, y - 7, 10, pop(u, d + 0.2));
      tx(250, y, s, { 'font-size': 16, 'font-weight': 600, opacity: fade(u, d) }); });
    pipe(c); }

  const quiz = [
    { q: 'SSO를 붙이면 Argo CD가 직접 맡지 않게 되는 일은 무엇인가?',
      o: ['policy.csv로 권한을 판정하는 일', '계정 생성 · 삭제 · MFA 같은 인증', 'Application을 sync 하는 일'], a: 1,
      why: '인증은 조직 IdP(필요하면 Dex 경유)가 맡고, Argo CD는 RBAC로 인가만 한다.' },
    { q: 'Dex GitHub 커넥터를 쓸 때 GitHub OAuth App에 등록할 콜백 URL은 무엇인가?',
      o: ['https://argocd.acme.com/auth/callback', 'https://argocd.acme.com/api/dex/callback', 'https://github.com/login/callback'], a: 1,
      why: 'Dex를 거치면 argocd-cm의 url 뒤에 /api/dex/callback이 붙는다. 한 글자라도 다르면 redirect_uri mismatch가 난다.' },
    { q: '로그인 뒤 Argo CD RBAC이 사람의 팀을 판단할 때 보는 것은 무엇인가?',
      o: ['ID 토큰의 groups 배열', 'GitHub 비밀번호', '브라우저 쿠키의 만료 시각'], a: 0,
      why: 'Dex가 서명한 ID 토큰의 groups 클레임이 g 규칙과 맞춰진다. 예시 토큰은 exp − iat가 86400초, 24시간이다.' },
    { q: '토큰 groups는 "acme:frontend" 인데 policy.csv에 g, frontend, role:web-deployer로 적었다. 결과는 무엇인가?',
      o: ['접두어를 무시하고 매핑된다', '에러가 나서 로그인이 막힌다', '에러 없이 매핑이 실패해 기본 권한만 남는다'], a: 2,
      why: 'g의 그룹 문자열은 토큰 값과 정확히 같아야 한다. 틀리면 조용히 빗나가 policy.default 권한만 남는다.' },
    { q: 'Okta에 Dex 없이 직접 붙일 때 콜백 URL 경로는 무엇인가?',
      o: ['/auth/callback', '/api/dex/callback', '/oidc/login'], a: 0,
      why: '외부 OIDC 직결은 /auth/callback, Dex 경유는 /api/dex/callback이다. 섞이면 로그인이 깨진다.' },
  ];

  const summary = [
    '로컬 계정은 퇴사자 계정이 남고 MFA와 감사가 약해서 팀이 커지면 버티지 못한다.',
    '인증은 IdP에 맡기고 Argo CD는 RBAC으로 인가만 한다. GitHub 같은 곳은 Dex가 잇는다.',
    'ID 토큰의 groups 문자열을 policy.csv의 g 줄에 그대로 적어 팀 단위로 역할을 준다.',
    '외부 OIDC 콜백은 /auth/callback이고, groups 스코프와 admin 잠금을 마지막에 확인한다.',
  ];
  const review = [
    { q: 'SSO 로그인은 되는데 모두 조회만 된다. get-user-info의 Groups가 비어 있다. 먼저 고칠 곳은?',
      o: ['policy.default를 role:admin으로 바꾼다', 'requestedScopes나 Dex 커넥터 설정에서 groups가 실리게 한다', 'argocd-server를 다시 띄운다'], a: 1,
      why: '토큰에 groups가 없으면 g 규칙이 맞을 것이 없다. 그룹이 실려 오게 하는 것이 먼저다.' },
    { q: '퇴사자를 IdP에서 비활성화했는데 몇 시간 동안 Argo CD 화면을 계속 쓸 수 있었다. 이유로 알맞은 것은?',
      o: ['이미 받은 세션 토큰이 만료 전이라서', 'RBAC 정책에 퇴사자 이름이 남아 있어서', 'Dex가 IdP와 연결이 끊겨서'], a: 0,
      why: '비활성화는 새 로그인을 막는다. 이미 발급된 세션은 users.session.duration이나 토큰 만료까지 산다.' },
    { q: 'Dex로 GitHub를 붙였다가 Okta 직결로 바꿨더니 redirect_uri mismatch가 난다. 먼저 볼 것은?',
      o: ['policy.csv의 g 줄', 'admin.enabled 값', 'IdP 앱에 등록한 콜백이 아직 /api/dex/callback인지'], a: 2,
      why: '직결로 바꾸면 콜백이 /auth/callback으로 바뀐다. IdP에 등록한 값을 함께 고쳐야 한다.' },
  ];

  R.page({ title: 'SSO 로그인 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
