/* V-2-2 SSO — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, spans, mono, sub, pill, grow, fly, dot, zone,
    person, browser, cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 지역 도우미 ----------
  function req(x, y, m, path, o) { o = o || {}; const fs = o.fs || 14, mw = tw(m, fs) + 16, pw = tw(path, fs) + 18, h = fs + 14;
    const col = m === 'GET' ? INFO : m === 'POST' ? ACC : WARN, g = G(x, y, 1, o.op);
    el('rect', { x: 0, y: -h / 2, width: mw + pw, height: h, rx: 7, fill: PANEL, stroke: col, 'stroke-width': 1.8 }, g);
    el('rect', { x: 0, y: -h / 2, width: mw, height: h, rx: 7, fill: col }, g);
    mono(mw / 2, fs * 0.36, m, { 'font-size': fs, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }, g);
    mono(mw + 9, fs * 0.36, path, { 'font-size': fs, fill: INK }, g); return mw + pw; }
  // 켜고 끄는 스위치 (on 0→1)
  function toggle(cx, cy, on, col) { const c = col || ACC;
    el('rect', { x: cx - 20, y: cy - 11, width: 40, height: 22, rx: 11, fill: on > 0.5 ? c : SOFT, stroke: on > 0.5 ? c : GRID, 'stroke-width': 1.5 });
    el('circle', { cx: cx - 9 + 18 * clamp(on), cy, r: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1 }); }
  const mini = (cx, cy, s, col, op) => person(cx, cy, null, { s, stroke: col || INK, op });
  const typed = (s, f) => s.slice(0, Math.round(s.length * clamp(f)));

  // ---------- 1. 인증 방식 네 가지 ----------
  const METHODS = [['[auth.github]', 'OAuth', 'GitHub · Google · GitLab', INFO], ['[auth.generic_oauth]', 'OIDC', 'Okta · Keycloak · Auth0', GOOD],
    ['[auth.saml]', 'SAML', 'Enterprise · Cloud 전용', WARN], ['[auth.ldap]', 'LDAP', 'Active Directory', MUT]];
  function loginPage(k, u) { // 왼쪽: Grafana 로그인 화면
    browser(220, 222, 380, 356, null); tx(220, 98, 'Grafana 로그인', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
    const fo = k === 4 ? 1 - E(u, 0.8, 1.6) : 1, ldap = k === 3 ? fade(u, 0.6) : 0;
    if (fo > 0.02) { const g = G(220, 168, 1, fo);
      [['email or username', -44], ['password', -6]].forEach(([s, dy]) => { el('rect', { x: -150, y: dy - 15, width: 300, height: 30, rx: 6, fill: PANEL, stroke: ldap ? INFO : GRID, 'stroke-width': ldap ? 2.5 : 1.5 }, g); tx(-138, dy + 5, s, { 'font-size': 13.5, fill: MUT }, g); });
      el('rect', { x: -150, y: 18, width: 300, height: 30, rx: 6, fill: INK }, g); tx(0, 38, 'Log in', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: PANEL }, g); }
    if (k === 3) tx(220, 238, '아이디·비밀번호는 AD가 확인', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: ldap });
    if (k === 4) { const x = seg(u, 0.4, 0.9); if (x > 0) cross(220, 166, 34, x); if (u > 1.6) tx(220, 226, '로컬 로그인 폼 숨김', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k !== 3) { el('line', { x1: 60, y1: 254, x2: 380, y2: 254, stroke: GRID, 'stroke-width': 1.5 }); el('rect', { x: 198, y: 244, width: 44, height: 20, fill: PANEL }); tx(220, 259, '또는', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
    [['Sign in with GitHub', 0, INFO], ['Sign in with Okta', 1, GOOD], ['Sign in with SAML', 2, WARN]].forEach(([s, need, col], i) => { if (k < need) return;
      const y = 290 + i * 40, sc = k === need ? pop(u, 1.0) : 1, hot = k === 4 && need === 1;
      card(220, y, 300, 32, { rx: 8, stroke: col, sw: hot ? 3 : 1.8, fill: hot ? ACCBG : PANEL, text: s, fs: 14, color: INK, s: sc }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 5) { // 로컬 계정이 남기는 유령 권한
      zone(30, 30, 420, 370, 'Grafana 로컬 계정 (예시)');
      [['alice', '재직'], ['bob', '재직'], ['carol', '퇴사'], ['dave', '재직']].forEach(([n, st], i) => { const y = 92 + i * 70, f = fade(u, 0.2 + i * 0.15), bad = st === '퇴사' && u > 1.0;
        card(240, y, 380, 54, { rx: 10, stroke: bad ? BAD : GRID, sw: bad ? 2.5 : 1.5, fill: bad ? C.BADBG : PANEL, op: f });
        mini(76, y, 0.55, bad ? BAD : INK, f); mono(104, y + 5, n, { 'font-size': 15, 'font-weight': 700, opacity: f });
        tx(196, y + 5, st, { 'font-size': 14, fill: st === '퇴사' ? BAD : MUT, 'font-weight': 700, opacity: f });
        if (st === '퇴사') { lock(256, y + 2, false, BAD, pop(u, 1.1)); tx(290, y + 6, '아직 로그인됨', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) }); } });
      // 오른쪽: IdP 한 곳에서 막는다
      const a = pop(u, 1.4); card(720, 110, 300, 110, { rx: 14, stroke: GOOD, sw: 2.5, fill: C.GOODBG, s: a });
      tx(720, 82, 'IdP (Okta)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: a });
      ['alice', 'bob', 'carol', 'dave'].forEach((n, i) => { const x = 630 + i * 60; mini(x, 126, 0.5, n === 'carol' ? OFF : INK, a); if (n === 'carol' && u > 1.9) cross(x, 122, 12, pop(u, 1.9)); });
      grow(720, 170, 720, 300, seg(u, 1.6, 2.1), GOOD); card(720, 330, 260, 52, { rx: 10, text: 'Grafana', fs: 16, s: pop(u, 1.6) });
      sub(720, 390, '비밀번호는 IdP에만 있다', fade(u, 2.2), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); return; }
    loginPage(k, u);
    // 오른쪽: grafana.ini 섹션이 한 줄씩 켜진다
    METHODS.forEach(([sec, nm, who, col], i) => { if (k < i) return; const y = 66 + i * 70, s = k === i ? pop(u, 0.2) : 1, on = k === i ? E(u, 0.7, 1.1) : 1;
      card(695, y, 490, 58, { rx: 10, stroke: col, sw: k === i ? 2.6 : 1.6, s });
      mono(466, y - 5, k === i ? typed(sec, E(u, 0.3, 0.9)) : sec, { 'font-size': 15, 'font-weight': 700, fill: INK });
      tx(466, y + 18, nm + '  ·  ' + who, { 'font-size': 13.5, fill: MUT, opacity: k === i ? fade(u, 1.0) : 1 });
      mono(840, y + 5, 'enabled', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: s }); toggle(900, y, on, col);
      if (i === 1 && k >= 1) pill(705, y - 5, '표준 · 우선', GOOD, k === 1 ? pop(u, 1.5) : 1, { fs: 13.5 });
      if (i === 2 && k >= 2) lock(760, y - 2, true, WARN, k === 2 ? pop(u, 1.5) : 1); });
    if (k === 2) tx(695, 330, 'OSS에서는 고를 수 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
    if (k === 4) { const s = pop(u, 0.2); card(695, 352, 490, 58, { rx: 10, stroke: BAD, sw: 2.6, s });
      mono(466, 357, '[auth]  disable_login_form', { 'font-size': 15, 'font-weight': 700, opacity: s }); toggle(900, 352, E(u, 0.5, 0.9), BAD); } }

  // ---------- 2. generic_oauth 설정 ----------
  const INI = [['root_url', 'https://grafana.corp.com', 0], ['client_id', 'grafana-prod', 1], ['client_secret', '${OAUTH_SECRET}', 1],
    ['auth_url', '…/oauth2/authorize', 2], ['token_url', '…/oauth2/token', 2], ['api_url', '…/oauth2/userinfo', 2], ['scopes', 'openid profile email groups', 3]];
  const rowY = (i) => 74 + i * 46;
  function iniPanel(k, u, arrive) { zone(20, 20, 440, 384, 'grafana.ini  ·  [auth.generic_oauth]');
    INI.forEach(([key, val, need], i) => { if (k < need) return; const y = rowY(i), now = k === need, f = now ? arrive(i) : 1;
      if (now) el('rect', { x: 30, y: y - 18, width: 420, height: 34, rx: 6, fill: ACCBG, opacity: fade(u, 0.1) });
      mono(42, y + 5, key, { 'font-size': 14, fill: MUT }); mono(150, y + 5, '=', { 'font-size': 14, fill: MUT });
      if (key === 'scopes') spans(170, y + 5, [['openid profile email ', { fill: INK }], ['groups', { fill: ACC, 'font-weight': '800', opacity: k === 3 ? fade(u, 1.0) : 1 }]], { 'font-size': 14 });
      else mono(170, y + 5, f >= 1 ? val : typed(val, f), { 'font-size': 14, 'font-weight': 700, fill: key === 'client_secret' ? WARN : INK }); }); }
  function s2(t, c) { const { k, u } = c;
    const arrive = (i) => k === 0 ? E(u, 0.1, 0.6) : k === 1 ? seg(u, 1.0 + (i - 1) * 0.5, 1.6 + (i - 1) * 0.5) : k === 2 ? seg(u, 1.3 + (i - 3) * 0.35, 1.7 + (i - 3) * 0.35) : 1;
    iniPanel(k, u, arrive);
    if (k === 0) { tx(710, 60, '콜백 URL은 계산된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      const m = E(u, 1.3, 1.9), a = 'https://grafana.corp.com', b = '/login/generic_oauth';

      if (m < 1) { card(lerp(625, 600, m), lerp(120, 250, m), tw(a, 14) + 24, 34, { rx: 8, stroke: INK, text: a, fs: 14, mono: true, s: pop(u, 0.4) });
        card(lerp(820, 800, m), lerp(190, 250, m), tw(b, 14) + 24, 34, { rx: 8, stroke: ACC, color: ACC, text: b, fs: 14, mono: true, s: pop(u, 0.8) });
        tx(720, 160, '+', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.9) * (1 - m) }); }
      else spans(710 - tw(a + b, 14) / 2, 256, [[a, { fill: INK }], [b, { fill: ACC }]], { 'font-size': 14, 'font-weight': '700' });
      if (m >= 1) el('rect', { x: 710 - tw(a + b, 14) / 2 - 14, y: 232, width: tw(a + b, 14) + 28, height: 36, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2 });
      sub(710, 320, '이 값을 IdP에 그대로 등록한다', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { card(710, 180, 420, 220, { rx: 14, stroke: GOOD, sw: 2.5, s: pop(u, 0.2) });
      tx(518, 96, 'Okta · 애플리케이션 등록', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
      [['Client ID', 'grafana-prod'], ['Client secret', '••••••••'], ['Redirect URI', '…/login/generic_oauth']].forEach(([a, b], i) => { const y = 140 + i * 50, f = fade(u, 0.4 + i * 0.15);
        tx(518, y + 5, a, { 'font-size': 14, fill: MUT, opacity: f }); mono(650, y + 5, b, { 'font-size': 14, 'font-weight': 700, opacity: f }); });
      fly(700, 145, 260, rowY(1), seg(u, 1.0, 1.6), 'grafana-prod', { mono: true });
      fly(700, 195, 260, rowY(2), seg(u, 1.5, 2.1), '••••••••', { fill: WARN, mono: true });
      if (u > 2.1) { lock(560, 340, true, WARN, pop(u, 2.1)); tx(584, 346, 'env로 주입 · 평문 커밋 금지', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) }); } return; }
    if (k === 2) { req(490, 64, 'GET', '/.well-known/openid-configuration', { op: fade(u, 0.1) });
      zone(490, 96, 450, 190, null, { stroke: GRID, sw: 1.5 });
      const J = ['{', '  "authorization_endpoint": "…/authorize",', '  "token_endpoint": "…/token",', '  "userinfo_endpoint": "…/userinfo"', '}'];
      J.forEach((s, i) => mono(508, 128 + i * 34, s, { 'font-size': 13.5, fill: i % 4 ? INK : MUT, opacity: fade(u, 0.3 + i * 0.12) }));
      [0, 1, 2].forEach((i) => dot([[880, 157 + i * 34], [480, 157 + i * 34], [440, rowY(3 + i)]], seg(u, 0.9 + i * 0.35, 1.5 + i * 0.35), INFO, 7));
      sub(715, 330, '엔드포인트는 추측하지 말고 복사한다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { ['openid', 'profile', 'email', 'groups'].forEach((s, i) => { const x = 540 + i * 100, g = i === 3; pill(x, 64, s, g ? ACC : MUT, g ? pop(u, 1.0) : 1, { fs: 14, mono: true, color: g ? ACC : INK }); });
      zone(490, 100, 450, 110, 'groups 없이', { stroke: BAD, sw: 1.5, dash: '6 4' });
      mono(508, 152, '{ "email": "alice@corp.com" }', { 'font-size': 14 }); tx(508, 188, '역할로 바꿀 재료가 없다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) });
      const b = fade(u, 1.3); zone(490, 228, 450, 140, 'groups 포함', { stroke: GOOD, sw: 2, op: b });
      mono(508, 280, '{ "email": "alice@corp.com",', { 'font-size': 14, opacity: b });
      spans(508, 308, [['  "groups": ', {}], ['["grafana-admins", "data-platform"]', { fill: GOOD, 'font-weight': '700' }], [' }', {}]], { 'font-size': 14, opacity: fade(u, 1.7) });
      tx(508, 346, '다음 단계의 역할 매핑 입력이 된다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); return; }
    // k4: 등록값과 계산값 비교
    tx(490, 70, '두 값이 한 글자까지 같아야 한다', { 'font-size': 16, 'font-weight': 800 }); tx(940, 70, '(예시)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const fix = u > 1.9, rest = '://grafana.corp.com/login/generic_oauth';
    tx(490, 128, 'IdP에 등록한 값', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    spans(490, 160, [['http', {}], [fix ? 's' : '', { fill: GOOD, 'font-weight': '800' }], [rest, {}]], { 'font-size': 14 });
    tx(490, 214, 'Grafana가 계산한 값', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    spans(490, 246, [['http', {}], ['s', { fill: u > 0.6 && !fix ? BAD : INK, 'font-weight': '800' }], [rest, {}]], { 'font-size': 14 });
    if (!fix && u > 0.6) el('rect', { x: 490 + tw('http', 14) - 3, y: 228, width: tw('s', 14) + 6, height: 26, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 2.5 });
    if (!fix) card(715, 320, 330, 46, { rx: 23, fill: BAD, stroke: 'none', text: 'redirect_uri mismatch', fs: 15, mono: true, color: PANEL, s: pop(u, 1.1) });
    else { card(715, 320, 330, 46, { rx: 23, fill: GOOD, stroke: 'none', text: '일치 · 로그인 통과', fs: 15, color: PANEL, s: pop(u, 1.9) }); check(900, 160, 11, pop(u, 2.0)); } }

  // ---------- 3. role_attribute_path ----------
  const RULES = [["contains(groups[*], 'grafana-admins')", 'Admin', BAD], ["contains(groups[*], 'grafana-editors')", 'Editor', WARN], ["contains(groups[*], 'grafana-viewers')", 'Viewer', INFO]];
  const ry = (i) => 116 + i * 60;
  function s3(t, c) { const { k, u } = c;
    // 왼쪽: 토큰
    const who = k === 4 ? ['carol@corp.com', ['sre-oncall']] : ['alice@corp.com', ['grafana-admins', 'data-platform']];
    zone(20, 40, 310, 280, 'IdP 토큰 (userinfo)');
    if (k < 2) tx(175, 190, '(아직 로그인 전)', { 'text-anchor': 'middle', 'font-size': 15, fill: OFF, 'font-weight': 700 });
    else { const L = ['"email": "' + who[0] + '"', '"groups": [', ...who[1].map((g) => '  "' + g + '"'), ']'], fill = k === 2 || k === 4 ? E(u, 0.6, 1.6) : 1;
      if (k === 2 || k === 4) dot([[175, 20], [175, 110]], seg(u, 0.1, 0.6), ACC, 7);
      L.forEach((s, i) => { const f = clamp(fill * L.length - i); if (f <= 0) return; mono(38, 96 + i * 30, typed(s, f), { 'font-size': 14, 'font-weight': s.includes('grafana-') || s.includes('sre-') ? 700 : 400, fill: s.startsWith('  ') ? ACC : INK }); }); }
    // 오른쪽: 규칙 세 줄
    mono(360, 64, 'role_attribute_path =', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    RULES.forEach(([cond, role, col], i) => { const y = ry(i), a = k === 0 ? pop(u, 0.2 + i * 0.35) : 1;
      let st = 'idle'; if (k === 3) st = i === 0 ? (u > 0.6 ? 'true' : 'idle') : (u > 1.2 ? 'skip' : 'idle'); if (k === 4) st = u > 0.4 + i * 0.4 ? 'false' : 'idle';
      const op = st === 'skip' ? 0.35 : 1, stroke = st === 'true' ? GOOD : st === 'false' ? BAD : GRID;
      card(650, y, 580, 48, { rx: 10, stroke, sw: st === 'idle' ? 1.5 : 2.5, s: a, op, fill: st === 'true' ? C.GOODBG : PANEL });
      el('circle', { cx: 384, cy: y, r: 12, fill: SOFT, stroke: GRID, opacity: a * op }); mono(384, y + 5, String(i + 1), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: a * op });
      mono(404, y + 5, cond, { 'font-size': 13.5, opacity: a * op });
      mono(714, y + 5, '&&', { 'font-size': 13.5, fill: MUT, opacity: a * op }); pill(800, y, "'" + role + "'", col, a, { fs: 14, mono: true, op });
      if (st === 'true' || st === 'false') mono(930, y + 5, st, { 'font-size': 13.5, 'font-weight': 800, fill: st === 'true' ? GOOD : BAD, 'text-anchor': 'end' });
      if (st === 'skip') tx(930, y + 5, '평가 안 함', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    if (k === 0) { grow(350, 96, 350, 262, seg(u, 1.4, 2.0), ACC); tx(650, 292, '앞에서부터 보고 처음 참인 역할을 고른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); }
    if (k >= 1 && k <= 3) { const on = k === 1 ? E(u, 0.4, 0.9) : 1; card(650, 330, 580, 52, { rx: 10, stroke: k === 1 ? BAD : GRID, sw: k === 1 ? 2.5 : 1.5 });
      mono(378, 335, 'role_attribute_strict = true', { 'font-size': 15, 'font-weight': 700 }); toggle(900, 330, on, BAD);
      if (k === 1) { lock(390, 386, true, BAD, pop(u, 1.2)); tx(414, 392, '셋 다 거짓이면 로그인을 막는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) }); } }
    // 결과
    if (k >= 2) { const res = k === 2 ? '평가 중' : k === 3 ? (u > 1.4 ? 'Admin' : '…') : (u > 1.6 ? 'false' : '…');
      card(175, 370, 310, 52, { rx: 12, stroke: k === 3 && u > 1.4 ? GOOD : k === 4 && u > 1.6 ? BAD : GRID, sw: 2.5 });
      tx(44, 376, '결과', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(300, 377, res, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'end', fill: res === 'Admin' ? BAD : res === 'false' ? BAD : MUT }); }
    if (k === 3) fly(800, ry(0), 250, 370, seg(u, 0.8, 1.4), "'Admin'", { fill: BAD, mono: true });
    if (k === 4) { [['끝에 || \'Viewer\'를 붙이면', "'Viewer' · 조용히 통과", WARN], ['기본값 없음 + strict', '로그인 차단 · 실패가 보인다', BAD]].forEach(([a, b, col], i) => { const x = 505 + i * 290, s = pop(u, 1.8 + i * 0.3);
        card(x, 340, 270, 70, { rx: 12, stroke: col, sw: 2.5, s }); tx(x, 332, a, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: s });
        tx(x, 358, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); }); } }

  // ---------- 4. Team Sync ----------
  const GROUPS = [['data-platform', 'Data Platform', 'teamId 7', 'custom:datasource-editor'], ['sre-oncall', 'SRE', 'teamId 8', 'Alerting 편집'], ['finance-viewers', 'Finance', '', '결제 폴더 Viewer']];
  const gy = (i) => 128 + i * 104;
  function s4(t, c) { const { k, u } = c;
    mono(480, 34, 'groups_attribute_path = groups', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: k === 0 ? fade(u, 0.2) : 1 });
    tx(30, 66, 'IdP 그룹 (Okta)', { 'font-size': 15, 'font-weight': 800, fill: GOOD }); tx(520, 66, 'Grafana 팀', { 'font-size': 15, 'font-weight': 800 });
    // 알리스의 위치: k4 에서 IdP 는 먼저, Grafana 는 다음 로그인에
    const idpMove = k === 4 ? E(u, 0.3, 1.0) : 0, grMove = k === 4 ? E(u, 2.0, 2.6) : 0;
    const linked = (i) => (i === 0 && k >= 1) || (i === 1 && k >= 2) || (i === 2 && k >= 3);
    GROUPS.forEach(([g, team, id, perm], i) => { const y = gy(i), a = k === 0 ? pop(u, 0.2 + i * 0.2) : 1;
      card(160, y, 260, 84, { rx: 12, stroke: GOOD, sw: 2, s: a }); mono(46, y - 16, g, { 'font-size': 15, 'font-weight': 700, opacity: a });
      [150, 200].forEach((x) => mini(x, y + 18, 0.45, INK, a));
      card(730, y, 420, 84, { rx: 12, stroke: linked(i) ? WARN : GRID, sw: linked(i) ? 2.5 : 1.5, s: k === 0 ? pop(u, 0.5 + i * 0.2) : 1 });
      tx(536, y - 14, team, { 'font-size': 16, 'font-weight': 800 }); if (id) mono(924, y - 14, id, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      // 링크와 사람 흐름
      const now = (i === 0 && k === 1) || (i === 1 && k === 2) || (i === 2 && k === 3), lu = now ? seg(u, 0.5, 1.1) : linked(i) ? 1 : 0;
      grow(290, y, 520, y, lu, WARN, { plain: true });
      if (now) (i === 0 ? [[70, 560], [150, 640], [200, 684]] : [[150, 640], [200, 684]]).forEach(([a0, b0], j) => dot([[a0, y + 18], [290, y], [520, y], [b0, y + 18]], seg(u, 1.2 + j * 0.25, 2.0 + j * 0.25), WARN, 6));
      const inTeam = linked(i) && !(now && u < 2.0);
      if (inTeam) [640, 684].forEach((x) => mini(x, y + 18, 0.45, INK));
      if (!linked(i)) tx(560, y + 22, '멤버 없음', { 'font-size': 13.5, fill: OFF });
      if (k >= 3) pill(820, y + 18, perm, ACC, k === 3 ? pop(u, 1.6 + i * 0.2) : 1, { fs: 13.5, mono: perm.startsWith('custom'), color: INK }); });
    // alice (data-platform 의 첫 사람)
    const ia = [lerp(70, 70, idpMove), lerp(gy(0), gy(1), idpMove) + 18];
    mini(ia[0], ia[1], 0.5, ACC); mono(ia[0] + 22, ia[1] + 5, 'alice', { 'font-size': 13.5, 'font-weight': 700, fill: ACC });
    if (k >= 1 && !(k === 1 && u < 2.0)) { const p = [560, lerp(gy(0), gy(1), grMove) + 18]; mini(p[0], p[1], 0.5, ACC); }
    if (k === 0) tx(405, 230, '연결 0건', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
    if (k === 1 || k === 2) req(250, 396, 'POST', '/api/teams/' + (k === 1 ? 7 : 8) + '/groups  {"groupId": "' + (k === 1 ? 'data-platform' : 'sre-oncall') + '"}', { op: fade(u, 0.1), fs: 13.5 });
    if (k === 3) tx(480, 400, 'IdP 그룹 → 팀 → 팀에 건 권한', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
    if (k === 4) { clock(405, 180, 22, E(u, 1.0, 1.9), WARN); tx(405, 222, '다음 로그인까지', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      if (u > 1.9) pill(405, 290, '재로그인', ACC, pop(u, 1.9), { fs: 14 });
      tx(480, 400, 'IdP에서 옮겨도 Grafana 팀은 다음 로그인에 바뀐다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.6) }); } }

  // ---------- 5. 로그인 한 줄기 ----------
  const N = { user: [90, 120], idp: [360, 120], gr: [640, 120], perm: [868, 120] };
  function node(key, title, s, sc, col) { const [x, y] = N[key]; card(x, y, 176, 72, { rx: 12, stroke: col || INK, sw: 2.2, s: sc });
    tx(x, y - 4, title, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: col || INK, opacity: sc }); tx(x, y + 18, s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: sc }); }
  function pipeline(k, u) { const [ux, uy] = N.user, now = k === 1;
    person(ux, uy - 8, null, {}); tx(ux, uy + 52, '사용자', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
    const ia = now ? pop(u, 0.2) : 1, ga = now ? pop(u, 0.9) : 1;
    node('idp', 'IdP (Okta)', '인증 · 그룹 클레임', ia, GOOD); node('gr', 'Grafana', 'role_path · team sync', ga, ACC);
    grow(ux + 36, uy, N.idp[0] - 92, uy, now ? seg(u, 0.3, 0.7) : 1, MUT); grow(N.idp[0] + 92, uy, N.gr[0] - 92, uy, now ? seg(u, 1.0, 1.3) : 1, GOOD);
    mono(500, uy - 50, '/login/generic_oauth', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: now ? fade(u, 1.1) : 1 });
    if (now) { dot([[ux + 36, uy], [N.idp[0] - 92, uy]], seg(u, 0.3, 0.8), ACC, 7); fly(N.idp[0], uy + 60, N.gr[0], uy + 60, seg(u, 1.1, 1.8), 'groups: [grafana-admins, …]', { mono: true, fill: GOOD }); }
    if (k >= 1) [["role = 'Admin'", BAD, 1.9], ['strict = true', MUT, 2.2]].forEach(([s, col, a], i) => pill(N.gr[0], 186 + i * 36, s, col, now ? pop(u, a) : 1, { fs: 13.5, mono: true })); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { person(110, 200, '사용자', {}); grow(150, 200, 300, 200, seg(u, 0.2, 0.6), MUT);
      browser(480, 210, 300, 270, null); tx(480, 116, 'Grafana 로그인', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      [150, 186].forEach((y) => el('rect', { x: 360, y: y - 14, width: 240, height: 28, rx: 6, fill: SOFT, stroke: GRID, opacity: 1 - E(u, 0.7, 1.3) * 0.7 }));
      if (u > 0.7) cross(480, 168, 24, pop(u, 0.7));
      card(480, 270, 240, 36, { rx: 8, stroke: GOOD, sw: 2.5, fill: C.GOODBG, text: 'Sign in with Okta', fs: 14.5, s: pop(u, 1.2) });
      mono(480, 320, 'disable_login_form = true', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      lock(790, 190, true, WARN, pop(u, 1.8)); tx(790, 236, '비상용 admin 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.9) });
      tx(790, 260, '계정 복구 경로만 남긴다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    pipeline(k, u);
    if (k === 2) { // 함정 네 곳을 흐름 위에 꽂는다
      [['② 로컬 admin 방치', '우회 로그인 경로', N.user[0] + 30, 170, 120], ['③ 콜백 URL 불일치', 'redirect_uri mismatch', 500, 124, 350], ['① role_path 오설정', '전부 Viewer', 640, 280, 580], ['④ Team Sync 지연', '다음 로그인에 반영', 720, 160, 820]].forEach(([a, b, lx, ly, cx], i) => {
        const ord = [1, 2, 0, 3][i], s = pop(u, 0.3 + ord * 0.4);
        grow(cx, 322, lx, ly, seg(u, 0.4 + ord * 0.4, 0.8 + ord * 0.4), BAD, { plain: true, dash: '4 4' });
        card(cx, 360, 216, 70, { rx: 12, stroke: BAD, sw: 2.2, fill: PANEL, s }); tx(cx, 354, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: s });
        tx(cx, 378, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s, class: b.includes('_') ? 'mono' : null }); }); }
    if (k >= 3) { const a = k === 3 ? pop(u, 0.2) : 1; node('perm', '권한 부여', 'Admin + Data Platform', a, WARN); grow(N.gr[0] + 92, N.gr[1], N.perm[0] - 92, N.perm[1], k === 3 ? seg(u, 0.1, 0.4) : 1, WARN); }
    if (k === 3) { const chain = [['IdP 인증', GOOD], ['그룹 클레임', GOOD], ["역할 'Admin'", BAD], ['팀 Data Platform', WARN], ['custom:datasource-editor', ACC]];
      let x = 40; const y = 330; chain.forEach(([s, col], i) => { const w = tw(s, 13.5) + 26, s0 = pop(u, 0.5 + i * 0.35);
        pill(x + w / 2, y, s, col, s0, { fs: 13.5, mono: s.startsWith('custom') });
        if (i < chain.length - 1) grow(x + w + 4, y, x + w + 26, y, seg(u, 0.7 + i * 0.35, 0.9 + i * 0.35), MUT); x += w + 30; });
      tx(480, 390, '인증과 인가가 한 줄기로 이어진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.2) }); }
    if (k === 4) { const L = ['$ curl …/api/access-control/users/:id/permissions', '{ "dashboards:read": ["dashboards:*"],', '  "datasources:write": ["datasources:*"],', '  … }'];
      terminal(30, 240, 520, 170, L, lerp(0, L.length, E(u, 0.2, 1.4)), { title: 'audit (예시 · 일부)', fs: 14 });
      clock(790, 300, 50, E(u, 0.8, 2.2), ACC); tx(790, 384, '주기적으로 다시 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) }); } }

  const quiz = [
    { q: '퇴사한 carol의 로컬 계정이 Grafana에 남아 있다. 로그인을 IdP로 모으면 무엇이 달라지는가?',
      o: ['IdP에서 carol을 막으면 Grafana에도 들어올 수 없다', 'Grafana가 carol의 비밀번호를 대신 바꿔 준다', 'carol이 만든 대시보드가 자동으로 지워진다'], a: 0,
      why: 'SSO에서는 Grafana가 비밀번호를 저장하지 않고 IdP가 신원을 확인한다. IdP 한 곳에서 계정을 막으면 Grafana 입구도 함께 닫힌다.' },
    { q: 'IdP에는 https://grafana.corp.com/login/generic_oauth를 등록했는데 root_url이 http://grafana.corp.com이다. 무슨 일이 생기는가?',
      o: ['scopes에서 groups가 빠진다', 'redirect_uri mismatch로 로그인이 실패한다', '모두 Viewer로 들어온다'], a: 1,
      why: '콜백 URL은 root_url에 /login/generic_oauth를 붙여 계산된다. 한 글자라도 IdP 등록값과 다르면 로그인 전체가 실패한다.' },
    { q: "groups가 [grafana-admins, data-platform]인 alice의 role_attribute_path 결과는 무엇인가?",
      o: ['Editor', 'Viewer', 'Admin'], a: 2,
      why: "앞에서부터 평가해 처음 참이 되는 조건에서 멈춘다. 첫 조건 contains(groups[*], 'grafana-admins')가 참이라 Admin이 된다." },
    { q: 'IdP에서 alice를 data-platform에서 sre-oncall로 옮겼는데 Grafana 팀은 그대로다. 이유는 무엇인가?',
      o: ['SRE 팀에 RBAC 역할이 걸려 있지 않아서', 'Team Sync는 다음 로그인 때 팀 소속을 맞춰서', 'IdP 그룹은 팀에 한 번만 연결되어서'], a: 1,
      why: '그룹 변경은 바로 반영되지 않고 다음 로그인에 동기화된다. 재로그인을 안내해야 새 팀으로 옮겨진다.' },
    { q: 'disable_login_form = true로 두는 목적은 무엇인가?',
      o: ['IdP 로그인 버튼을 숨긴다', '로컬 admin 계정을 지운다', '로컬 로그인 폼을 숨겨 입구를 IdP로 좁힌다'], a: 2,
      why: '로컬 폼이 열려 있으면 IdP를 거치지 않는 입구가 남는다. 폼을 숨기고 비상용 admin 하나만 복구 경로로 둔다.' },
  ];

  const summary = [
    '로컬 계정을 사람마다 만들면 퇴사자 계정이 남는다. SSO는 인증을 IdP에 맡겨 이 구멍을 막는다.',
    'generic_oauth 콜백 URL은 root_url에 /login/generic_oauth를 붙인 값이고 IdP 등록값과 같아야 한다.',
    'role_attribute_path는 groups 클레임을 앞에서부터 보고 처음 참인 역할을 준다. 기본값 없이 strict를 켠다.',
    'Team Sync로 IdP 그룹을 팀에 잇고 팀에 RBAC 역할을 걸면 권한이 한 줄기가 된다. 반영은 다음 로그인이다.',
  ];
  const review = [
    { q: 'SSO를 켰더니 grafana-editors 그룹 사람까지 모두 Viewer로 들어온다. 먼저 의심할 것은?',
      o: ['Team Sync의 반영 지연', 'scopes에 groups가 빠져 클레임이 오지 않는다', 'disable_login_form 값'], a: 1,
      why: 'groups 클레임이 없으면 역할을 뽑지 못하고 auto_assign_org_role(기본 Viewer)로 들어온다. strict를 켜 두었다면 로그인 차단으로 바로 드러났을 것이다.' },
    { q: "IdP 그룹이 sre-oncall 하나뿐인 carol이 로그인한다. 표현식 끝에 || 'Viewer'가 있고 strict도 켜져 있다면?",
      o: ['로그인이 막힌다', 'Editor가 된다', '조용히 Viewer로 들어온다'], a: 2,
      why: "끝의 기본값이 실패를 'Viewer'로 바꿔 매핑 실패가 생기지 않는다. strict가 잡을 일이 없으므로 기본값을 빼야 실패가 드러난다." },
    { q: 'Team Sync로 Data Platform 팀에 들어온 사람이 데이터소스를 고치지 못한다. 먼저 볼 곳은?',
      o: ['팀에 custom:datasource-editor가 걸려 있는지', 'root_url 값', '콜백 URL의 https'], a: 0,
      why: 'Team Sync는 팀 소속만 맞춘다. 팀에 RBAC 역할을 걸어야 그룹, 팀, 세밀 권한이 이어진다.' },
  ];

  R.page({ title: 'SSO 로그인과 권한 매핑', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
