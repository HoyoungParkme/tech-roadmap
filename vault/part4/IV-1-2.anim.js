/* IV-1-2 OIDC — 사람 로그인 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, browser, cross, check, clock, snippet, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 이 장의 그림 부품 ----------
  function vaultBox(cx, cy, o) { o = o || {}; const w = o.w || 132, h = o.h || 66, g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    const dx = -w / 2 + 30; el('circle', { cx: dx, cy: 0, r: 17, fill: SOFT, stroke: c, 'stroke-width': 2 }, g);
    [0, 60, 120].forEach((a) => { const r = a * Math.PI / 180; el('line', { x1: dx - Math.cos(r) * 11, y1: -Math.sin(r) * 11, x2: dx + Math.cos(r) * 11, y2: Math.sin(r) * 11, stroke: c, 'stroke-width': 2 }, g); });
    tx(dx + 26, 6, o.name || 'Vault', { 'font-size': 16, 'font-weight': 800, fill: c }, g); return g; }
  // IdP: 방패 모양 + 이름
  function idp(cx, cy, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INFO;
    el('rect', { x: -70, y: -33, width: 140, height: 66, rx: 12, fill: C.INFOBG, stroke: c, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-48,-16 L-34,-21 L-20,-16 V-2 Q-20,12 -34,18 Q-48,12 -48,-2 Z', fill: PANEL, stroke: c, 'stroke-width': 2 }, g);
    tx(-10, 0, o.name || 'Okta', { 'font-size': 16, 'font-weight': 800, fill: c }, g); tx(-10, 18, 'IdP', { 'font-size': 13.5, fill: MUT }, g); return g; }
  function key(cx, cy, col, s) { const g = G(cx, cy, s ?? 1); el('circle', { cx: -9, cy: 0, r: 7, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
    el('path', { d: 'M-2,0 H15 M10,0 V7 M15,0 V6', stroke: col, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g); return g; }
  function jwt(cx, cy, s, o) { o = o || {}; const g = G(cx, cy, s ?? 1, o.op ?? 1); let x = -57;
    [[INFO, 30], [ACC, 46], [o.sig || GOOD, 30]].forEach(([col, w]) => { el('rect', { x, y: -11, width: w, height: 22, rx: 5, fill: col, opacity: 0.85 }, g); x += w + 4; });
    if (o.label) tx(0, -19, o.label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: o.col || INK }, g); return g; }
  const vtoken = (cx, cy, s, text) => pill(cx, cy, text || 'hvs.CAESIJ…', GOOD, s, { mono: true, fs: 13.5, fill: C.GOODBG });
  // 키-값 한 줄 (값이 f 만큼 타이핑)
  function row(x, y, w, k, v, f, o) { o = o || {}; el('rect', { x, y, width: w, height: 30, rx: 6, fill: o.hot ? ACCBG : PANEL, stroke: o.stroke || GRID, 'stroke-width': o.stroke ? 2 : 1.5 });
    mono(x + 10, y + 20, k, { 'font-size': 13.5, fill: o.kc || MUT, 'font-weight': 700 });
    const vs = String(v); mono(x + (o.vx || 190), y + 20, f < 1 ? vs.slice(0, Math.round(vs.length * f)) : vs, { 'font-size': 13.5, fill: o.vc || INK, 'font-weight': 700 }); }

  // 1. 문제 — 사람에게 토큰을 손으로 나눠 주던 시절
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      person(110, 120, '관리자', {}); person(560, 120, '개발자 김OO', {});
      vtoken(335, 70, k === 0 ? pop(u, 0.3) : 1, 'hvs.CAESIJ… · 720h');
      if (k === 0) { mono(335, 104, 'vault token create -ttl=720h', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
        fly(150, 130, 520, 130, seg(u, 1.0, 2.0), 'Slack DM', { fill: WARN });
        clock(760, 110, 34, E(u, 1.6, 2.6), WARN); mono(760, 172, '720h = 30일', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) }); }
      else { card(335, 130, 130, 34, { rx: 17, text: 'Slack DM', fs: 13.5, fill: C.WARNBG, stroke: WARN, color: WARN }); clock(760, 110, 34, 1, WARN); mono(760, 172, '720h = 30일', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN }); } }
    if (k === 1) { const x0 = 90, W = 780, d = (v) => x0 + W * v / 30, y = 290;
      tx(x0, 240, '토큰 수명 30일', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: x0, y: y - 10, width: W * E(u, 0.2, 1.2), height: 20, rx: 5, fill: GOOD, opacity: 0.75 });
      [0, 10, 20, 30].forEach((v) => mono(d(v), y + 32, v + '일', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      const q = fade(u, 1.3); el('line', { x1: d(10), y1: y - 32, x2: d(10), y2: y + 14, stroke: BAD, 'stroke-width': 2.5, opacity: q });
      tx(d(10) + 8, y - 20, '10일째 퇴사', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: q });
      el('rect', { x: d(10), y: y - 10, width: (d(30) - d(10)) * E(u, 1.5, 2.3), height: 20, rx: 5, fill: BAD, opacity: 0.8 });
      tx(d(20), y + 60, '퇴사자 토큰이 20일 더 살아 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      [['MFA·그룹 변경 반영 안 됨', 220], ['소유자는 사람이 기억', 700]].forEach(([s, x], i) => pill(x, 385, s, WARN, pop(u, 2.3 + i * 0.15), { fs: 13.5 })); }
    if (k === 2) { const rows = [['09:12', 'root', 'secret/app/db', 'read'], ['09:13', 'root', 'secret/pay/key', 'read'], ['09:15', 'root', 'sys/policy/dev', 'delete']];
      tx(130, 240, '감사 로그', { 'font-size': 15, 'font-weight': 700 });
      rows.forEach((r, i) => { const y = 256 + i * 40, f = fade(u, 0.3 + i * 0.35);
        el('rect', { x: 120, y, width: 640, height: 32, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: f });
        mono(136, y + 21, r[0], { 'font-size': 14, fill: MUT, opacity: f }); mono(230, y + 21, 'who=' + r[1], { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: f });
        mono(400, y + 21, r[2], { 'font-size': 14, opacity: f }); mono(690, y + 21, r[3], { 'font-size': 14, fill: i === 2 ? BAD : INK, opacity: f }); });
      lbl(860, 320, '누가 했지?', fade(u, 1.6), { 'font-size': 20, fill: BAD }); }
    if (k === 3) { const nodes = [[110, '개발자', 'vault login\n-method=oidc'], [340, '브라우저', '회사 SSO'], [590, 'Okta', '비밀번호·MFA'], [840, 'Vault', '그룹에 맞는 token']];
      nodes.forEach(([x, n, s], i) => { const sc = pop(u, 0.2 + i * 0.4);
        if (i === 0) person(x, 160, null, { s: sc }); else if (i === 1) browser(x, 160, 120, 84, null, { s: sc }); else if (i === 2) idp(x, 160, { s: sc }); else vaultBox(x, 160, { s: sc });
        lbl(x, 238, n, fade(u, 0.3 + i * 0.4)); card(x, 290, 170, 56, { rx: 10, text: s, fs: 13.5, stroke: GRID, op: fade(u, 0.4 + i * 0.4) });
        if (i) grow(nodes[i - 1][0] + 70, 160, x - 74, 160, seg(u, 0.3 + i * 0.4, 0.7 + i * 0.4), ACC); });
      dot(nodes.map(([x]) => [x, 160]), seg(u, 1.6, 2.6), ACC, 7);
      sub(480, 380, 'IdP에서 계정을 끄면 Vault 접근도 끊긴다', fade(u, 2.2), { 'font-weight': 700, 'font-size': 15, fill: GOOD }); }
    if (k === 4) { const s = pop(u, 0.2);
      card(250, 170, 200, 120, { rx: 12, stroke: INFO, sw: 2.5, s });
      tx(170, 140, '사원증 (IdP 로그인)', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      person(200, 185, null, { s: 0.7 * s }); tx(235, 190, '김개발', { 'font-size': 15, opacity: fade(u, 0.4) });
      grow(365, 170, 590, 170, seg(u, 0.8, 1.5), ACC); tx(478, 160, '정문 통과', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
      vtoken(700, 170, pop(u, 1.6), 'hvs.CAESIJ… · 1h'); sub(700, 210, '방문증 (Vault token)', fade(u, 1.8), { 'font-weight': 700, fill: GOOD });
      banner(480, 330, 'OIDC auth method', pop(u, 2.1)); } }

  // 2. OIDC auth 활성화 + IdP 연결
  function s2(t, c) { const { k, u } = c;
    zone(30, 30, 450, 360, 'Vault 서버'); zone(600, 30, 330, 360, '회사 IdP · company.okta.com', { stroke: INFO, dash: '6 5', color: INFO });
    idp(765, 120);
    tx(52, 70, 'vault auth list', { 'font-size': 13.5, fill: MUT, class: 'mono', 'font-weight': 700 });
    mono(60, 98, 'token/', { 'font-size': 15, fill: MUT });
    const en = k === 0 ? E(u, 0.3, 1.0) : 1; el('rect', { x: 50, y: 108, width: 410 * en, height: 28, rx: 6, fill: ACCBG });
    if (en > 0.6) { mono(60, 128, 'oidc/', { 'font-size': 15, 'font-weight': 800, fill: ACC }); if (k === 0) sub(200, 128, 'IdP 연결은 아직 비었다', fade(u, 1.2), { 'text-anchor': 'start', fill: ACC }); }
    const cfg = [['oidc_discovery_url', 'https://company.okta.com', 1], ['oidc_client_id', '0oa1a2b3c4d5E6f7G8h9', 2], ['oidc_client_secret', '••••••••', 2], ['default_role', 'developer', 2]];
    if (k >= 1) tx(52, 172, 'auth/oidc/config', { 'font-size': 13.5, fill: MUT, class: 'mono', 'font-weight': 700 });
    cfg.forEach(([kk, v, from], i) => { if (k < from) return; const fresh = k === from, d = from === 1 ? 1.6 : 1.2 + (i - 1) * 0.35, f = fresh ? E(u, d, d + 0.5) : 1;
      if (k === 3 && i === 2) { row(50, 184 + i * 36, 410, kk, '(응답에 안 나온다)', 1, { vc: MUT, vx: 200 }); return; }
      row(50, 184 + i * 36, 410, kk, v, f, { vx: 200, vc: i === 2 ? WARN : INFO }); });
    if (k >= 1) { const lu = k === 1 ? seg(u, 0.2, 0.9) : 1; grow(462, 196, 694, 128, lu, INFO);
      if (k === 1) { tx(540, 205, 'discovery 문서', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
        const p = E(u, 1.0, 1.9); key(lerp(760, 400, p), lerp(190, 120, p), INFO, 1.1); tx(lerp(760, 400, p) - 30, lerp(190, 120, p) + 28, '서명 공개키', { 'font-size': 13.5, 'font-weight': 700, fill: INFO }); }
      else { key(410, 150, INFO, 1); } }
    if (k === 2) { card(765, 270, 260, 120, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.2) });
      tx(650, 238, 'IdP 콘솔 · 앱 등록 "Vault"', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(650, 268, 'client_id', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) }); mono(650, 298, 'client_secret', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
      fly(700, 268, 380, 256, seg(u, 0.8, 1.6), 'client_id', { mono: true, fill: INFO }); fly(700, 298, 380, 292, seg(u, 1.1, 1.9), 'client_secret', { mono: true, fill: WARN }); }
    if (k === 3) { terminal(620, 210, 300, 170, ['$ vault read auth/oidc/config', 'oidc_discovery_url', '  https://company.okta.com', 'oidc_client_id', '  0oa1a2b3c4d5E6f7G8h9', 'default_role  developer'], Math.min(6, lerp(0, 6.3, E(u, 0.2, 2.2))), { fs: 13.5, lh: 20 });
      R.lock(440, 271, true, WARN, pop(u, 1.8)); }
    if (k === 4) { [['Okta 서명', GOOD, true], ['다른 키 서명', BAD, false]].forEach(([s, col, ok], i) => { const y = 250 + i * 80, p = E(u, 0.3 + i * 0.7, 1.0 + i * 0.7);
        jwt(lerp(860, 540, p), y, 1, { sig: col }); tx(lerp(860, 540, p), y + 30, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700 });
        if (p >= 1) (ok ? check : cross)(455, y, 11, pop(u, 1.0 + i * 0.7)); });
      sub(255, 380, '서명 공개키가 맞는 ID token만 믿는다', fade(u, 2.0), { 'font-weight': 700, fill: GOOD, 'font-size': 15 }); } }

  // 3. role — 누가 로그인하고 무엇을 받나
  const CLAIMS = [['iss', 'company.okta.com'], ['aud', '0oa1a2b3c4…'], ['sub', 'kim.dev@company.com'], ['groups', 'vault-developers, …']];
  const RFIELDS = [['user_claim', 'sub', 0, '식별'], ['groups_claim', 'groups', 0, '그룹'], ['bound_audiences', '0oa1a2b3c4d5E6f7G8h9', 1, '수신자 검증'],
    ['allowed_redirect_uris', 'CLI :8250 + UI 콜백', 1, '콜백 방어'], ['oidc_scopes', 'openid,profile,email,groups', 2, '범위'], ['token_ttl / max', '1h / 8h', 2, '수명']];
  function s3(t, c) { const { k, u } = c;
    card(170, 50, 280, 34, { rx: 8, fill: C.INFOBG, stroke: INFO, text: 'ID token claims (예)', fs: 14, color: INFO });
    CLAIMS.forEach(([a, b], i) => { const y = 76 + i * 38, hot = (k === 0 && (i === 2 || i === 3)) || (k === 1 && i === 1);
      el('rect', { x: 30, y, width: 280, height: 32, rx: 6, fill: hot ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(42, y + 21, a, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(110, y + 21, b, { 'font-size': 13.5 }); });
    card(675, 50, 510, 34, { rx: 8, fill: INK, stroke: 'none', text: 'auth/oidc/role/developer', fs: 14, color: PANEL, mono: true });
    RFIELDS.forEach(([a, b, from, why], i) => { if (k < from) return; const fresh = k === from, d = 0.2 + (i % 2) * 0.5, f = fresh ? E(u, d, d + 0.5) : 1, y = 76 + i * 38;
      const lit = k === 3 ? Math.floor(seg(u, 0.2, 2.6) * 6) === i : false;
      row(420, y, 510, a, b, f, { vx: 200, hot: fresh || lit, vc: INK });
      if (k === 3) pill(395 - tw(why, 13.5) / 2 - 10, y + 15, why, ACC, pop(u, 0.2 + i * 0.35), { fs: 13.5 }); });
    // claim → 필드 연결선
    const link = (ci, fi, uu, col) => { if (uu <= 0) return; const y1 = 92 + ci * 38, y2 = 92 + fi * 38; el('path', { d: `M312,${y1} C360,${y1} 370,${y2} 418,${y2}`, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': `${uu * 160} 999` }); };
    if (k === 0) { link(2, 0, seg(u, 1.0, 1.6), ACC); link(3, 1, seg(u, 1.5, 2.1), ACC); sub(170, 260, 'sub → Vault 사용자 이름', fade(u, 1.8), { 'font-weight': 700, fill: ACC }); sub(170, 284, 'groups → 그룹 매핑', fade(u, 2.1), { 'font-weight': 700, fill: ACC }); }
    if (k === 1) { link(1, 2, seg(u, 1.2, 1.8), GOOD); check(370, 120, 8, pop(u, 1.8));
      [['http://localhost:8250/oidc/callback', true], ['https://vault.company.com/ui/vault/auth/oidc/oidc/callback', true], ['https://evil.example/callback', false]].forEach(([s, ok], i) => { const y = 322 + i * 30, f = fade(u, 1.4 + i * 0.35);
        (ok ? check : cross)(44, y - 5, 7, f); mono(62, y, s, { 'font-size': 13.5, fill: ok ? INK : BAD, opacity: f, 'text-decoration': ok ? null : 'line-through' }); }); }
    if (k === 2) { ['openid', 'profile', 'email', 'groups'].forEach((s, i) => pill(70 + i * 90 + (i === 3 ? 6 : 0), 330, s, i === 3 ? ACC : MUT, pop(u, 0.3 + i * 0.2), { fs: 13.5, mono: true }));
      sub(190, 372, 'groups가 빠지면 그룹 매핑이 통째로 안 된다', fade(u, 1.2), { 'font-weight': 700, fill: WARN });
      const x0 = 470, W = 440, X = (h) => x0 + W * h / 8; el('rect', { x: x0, y: 330, width: W, height: 16, rx: 4, fill: SOFT });
      el('rect', { x: x0, y: 330, width: (X(1) - x0) * E(u, 0.8, 1.4), height: 16, rx: 4, fill: GOOD });
      el('line', { x1: X(8), y1: 320, x2: X(8), y2: 356, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.5) });
      mono(X(1), 374, 'ttl 1h', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(X(8), 374, 'max 8h', { 'font-size': 13.5, 'text-anchor': 'end', fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(X(4.5), 318, '갱신해도 8h를 넘지 못한다', fade(u, 1.9), { 'font-weight': 700 }); }
    if (k === 3) sub(675, 330, '로그인이 안 되면 대개 redirect_uris 아니면 scopes 문제', fade(u, 2.3), { 'font-weight': 700, fill: WARN, 'font-size': 15 });
    if (k === 4) { banner(675, 340, 'role developer 준비 완료', pop(u, 0.3)); check(510, 340, 11, pop(u, 0.6)); } }

  // 4. 로그인 흐름 — 브라우저·IdP·콜백·검증
  const NODES = [[100, 'CLI :8250'], [330, '브라우저'], [580, 'Okta'], [840, 'Vault']];
  const TOK = [['iss', '"https://company.okta.com"'], ['aud', '"0oa1a2b3c4d5E6f7G8h9"'], ['sub', '"kim.dev@company.com"'], ['email', '"kim.dev@company.com"'], ['name', '"김개발"'],
    ['groups', '["vault-developers",'], ['', ' "team-payments"]'], ['iat', '1723334400'], ['exp', '1723338000']];
  function s4(t, c) { const { k, u } = c;
    NODES.forEach(([x, n]) => card(x, 44, 150, 36, { rx: 8, text: n, fs: 14.5, fw: 800, stroke: n === 'Okta' ? INFO : n === 'Vault' ? INK : MUT, color: n === 'Okta' ? INFO : INK }));
    const hop = [[100, 330, 'open'], [330, 580, '로그인+MFA'], [580, 100, 'code'], [100, 840, 'code'], [840, 580, '교환 → ID token']];
    hop.forEach(([a, b, s], i) => { const uu = k === 0 ? seg(u, 0.2 + i * 0.35, 0.5 + i * 0.35) : 1, y = 74 + i * 18, dir = b > a ? 1 : -1;
      grow(a + dir * 10, y, b - dir * 10, y, uu, i === 4 ? INFO : MUT, { sw: 1.8 });
      if (uu > 0.5 && (i === 2 || i === 4)) mono(i === 2 ? 250 : 700, i === 2 ? y - 4 : y + 17, s, { 'font-size': 13.5, fill: i === 4 ? INFO : MUT, 'font-weight': 700 }); });
    // ID token 카드
    const tk = k === 0 ? pop(u, 1.9) : 1;
    card(250, 290, 430, 230, { rx: 10, stroke: INFO, sw: 2, s: tk });
    tx(48, 196, 'ID token payload', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: tk });
    const hot = [[0, 1], [2, 3, 4], [5, 6], [0, 1, 7, 8], []][k];
    TOK.forEach(([a, b], i) => { const y = 216 + i * 21, on = hot.includes(i);
      if (on) el('rect', { x: 42, y: y - 15, width: 416, height: 20, rx: 4, fill: ACCBG, opacity: tk });
      mono(52, y, a ? '"' + a + '":' : '', { 'font-size': 13.5, fill: on ? ACC : MUT, 'font-weight': 700, opacity: tk }); mono(150, y, b, { 'font-size': 13.5, opacity: tk }); });
    if (k === 0) { sub(720, 200, 'iss = 누가 발급했나', fade(u, 2.3), { 'font-weight': 700 }); sub(720, 224, 'aud = 누구에게 준 것인가', fade(u, 2.4), { 'font-weight': 700 }); }
    if (k === 1) { card(720, 230, 300, 64, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 0.4) }); tx(590, 222, 'Vault entity', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(590, 248, 'kim.dev@company.com', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      el('rect', { x: 570, y: 300, width: 300, height: 32, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.4) });
      mono(582, 321, '감사 로그: kim.dev@… login', { 'font-size': 13.5, opacity: fade(u, 1.5) }); sub(720, 360, 'root가 아니라 사람 이름이 남는다', fade(u, 1.9), { 'font-weight': 700, fill: GOOD }); }
    if (k === 2) { ['vault-developers', 'team-payments'].forEach((s, i) => { const p = E(u, 0.3 + i * 0.4, 1.1 + i * 0.4); pill(lerp(330, 720, p), lerp(322 + i * 21, 240 + i * 50, p), s, ACC, 1, { fs: 13.5, mono: true }); });
      sub(720, 350, 'groups_claim이 이 배열을 읽는다', fade(u, 1.8), { 'font-weight': 700, fill: ACC }); }
    if (k === 3) { [['서명', 'IdP 공개키로 확인'], ['aud', '= bound_audiences'], ['iss', '= discovery_url'], ['exp', '1723338000 − iat = 3600s']].forEach(([a, b], i) => { const y = 190 + i * 46, f = fade(u, 0.3 + i * 0.5);
        el('rect', { x: 520, y, width: 410, height: 38, rx: 8, fill: PANEL, stroke: GOOD, 'stroke-width': 1.8, opacity: f });
        check(546, y + 19, 8, pop(u, 0.5 + i * 0.5)); tx(566, y + 25, a, { 'font-size': 15, 'font-weight': 800, opacity: f }); mono(630, y + 25, b, { 'font-size': 13.5, opacity: f }); });
      sub(725, 388, '하나라도 어긋나면 로그인 거부', fade(u, 2.4), { 'font-weight': 700, fill: BAD }); }
    if (k === 4) { fly(840, 210, 620, 210, seg(u, 0.2, 1.0), 'hvs.CAESIJ…', { fill: GOOD, mono: true });
      if (u > 1.0) { vtoken(640, 210, pop(u, 1.0)); }
      mono(530, 260, 'token_policies  ["default" "dev-base"]', { 'font-size': 13.5, opacity: fade(u, 1.3) });
      clock(550, 306, 15, E(u, 1.5, 2.6), WARN); mono(576, 312, 'TTL 1h', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) });
      sub(725, 370, '비밀번호는 Vault를 거치지 않았다', fade(u, 2.0), { 'font-weight': 700, fill: GOOD, 'font-size': 15 }); } }

  // 5. 그룹 → 정책 매핑
  function s5(t, c) { const { k, u } = c;
    // IdP 그룹
    idp(120, 230, {}); tx(120, 290, 'vault-developers', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INFO });
    const inside = k === 4 ? (u < 0.4 ? 0 : u < 1.6 ? E(u, 0.4, 1.0) : 1 - E(u, 1.6, 2.2)) : 1;
    [0, 1, 2].forEach((i) => el('circle', { cx: 80 + i * 40, cy: 320, r: 7, fill: INFO, opacity: 0.6 }));
    el('circle', { cx: lerp(200, 120, inside), cy: lerp(380, 344, inside), r: 9, fill: ACC });
    // oidc/ mount + accessor
    card(420, 66, 170, 40, { rx: 8, text: 'auth: oidc/', fs: 15, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    const acc = k === 0 ? pop(u, 1.0) : 1; pill(420, 116, 'auth_oidc_a1b2c3d4', ACC, acc, { fs: 13.5, mono: true });
    if (k === 0) { terminal(560, 40, 370, 120, ["$ vault auth list -format=json \\", "  | jq -r '.[\"oidc/\"].accessor'", 'auth_oidc_a1b2c3d4'], Math.min(3, lerp(0, 3.2, E(u, 0.2, 1.4))), { fs: 13.5, lh: 22 });
      sub(420, 160, '어느 auth에서 온 그룹인지 가리키는 열쇠', fade(u, 1.6), { 'font-weight': 700, fill: ACC }); }
    // external group + 정책
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1; card(690, 230, 200, 70, { rx: 10, stroke: INK, sw: 2.2, s });
      tx(600, 222, 'external group', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: s }); mono(600, 246, 'vault-developers', { 'font-size': 14, 'font-weight': 800, opacity: s });
      const on = k === 4 ? inside : 1, gu = k === 1 ? seg(u, 0.9, 1.5) : 1; grow(792, 230, 836, 230, gu, GOOD);
      card(890, 230, 100, 46, { rx: 8, text: 'dev-full', fs: 14.5, mono: true, stroke: on > 0.5 ? GOOD : OFF, color: on > 0.5 ? GOOD : OFF, fill: on > 0.5 ? C.GOODBG : PANEL, s: k === 1 ? pop(u, 1.4) : 1 });
      if (k === 1) sub(690, 290, '멤버는 바깥(IdP)이 정한다', fade(u, 1.8), { 'font-weight': 700 }); }
    // group-alias
    if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1; card(420, 230, 210, 84, { rx: 10, stroke: ACC, sw: 2.2, s });
      tx(325, 208, 'group-alias', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: s }); mono(325, 232, 'name=vault-developers', { 'font-size': 13.5, opacity: s }); mono(325, 254, 'canonical_id=8d1a…', { 'font-size': 13.5, opacity: s });
      const l = (x1, y1, x2, y2, a) => grow(x1, y1, x2, y2, k === 2 ? seg(u, a, a + 0.6) : 1, ACC, { plain: true }); l(190, 230, 314, 230, 0.7); l(420, 130, 420, 187, 1.1); l(526, 230, 588, 230, 1.5);
      if (k === 2) sub(420, 300, '이름이 groups 값과 글자 그대로 같아야 한다', fade(u, 2.1), { 'font-weight': 700, fill: ACC }); }
    if (k === 3) { const pols = [['default', MUT, 0.3], ['dev-base', INFO, 0.8], ['dev-full', GOOD, 1.4]];
      tx(250, 366, 'token_policies', { 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      pols.forEach(([p, col, d], i) => pill(470 + i * 120, 361, p, col, pop(u, d), { fs: 13.5, mono: true }));
      sub(590, 404, 'dev-base는 role에서, dev-full은 그룹 매핑에서', fade(u, 1.9), { 'font-weight': 700 });
      dot([[890, 254], [710, 340]], seg(u, 1.0, 1.5), GOOD, 6); }
    if (k === 4) { tx(480, 370, inside > 0.5 ? '그룹에 넣으면 dev-full ON' : '그룹에서 빼면 OFF', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: inside > 0.5 ? GOOD : BAD });
      sub(480, 400, '온보딩·오프보딩이 IdP 한 곳에서 끝난다', fade(u, 2.3), { 'font-weight': 700 }); } }

  const quiz = [
    { q: '관리자가 사람마다 720h 토큰을 손으로 만들어 주는 방식에서 가장 큰 문제는 무엇인가?',
      o: ['토큰이 너무 빨리 만료된다', '퇴사자 회수·소유자 추적·MFA 반영이 사람 손에 달린다', 'Vault가 사람 토큰을 받지 않는다'], a: 1,
      why: '30일짜리 토큰이 DM으로 흩어지면 회수도 감사도 수작업이다. root를 돌려 쓰면 감사 로그가 전부 root로 찍힌다.' },
    { q: 'auth/oidc/config의 oidc_discovery_url이 하는 일은 무엇인가?',
      o: ['IdP의 서명 공개키와 엔드포인트를 자동으로 가져오게 한다', '사용자 비밀번호를 Vault에 저장한다', '로그인 후 돌아올 콜백 주소를 정한다'], a: 0,
      why: 'discovery 문서에서 공개키와 엔드포인트를 읽어 온다. 콜백 주소는 role의 allowed_redirect_uris가 정한다.' },
    { q: 'role의 allowed_redirect_uris에 없는 주소로 콜백을 보내면 어떻게 되는가?',
      o: ['Vault가 주소를 고쳐서 받아 준다', 'default_role로 로그인된다', '인증이 성립하지 않는다'], a: 2,
      why: '콜백은 화이트리스트에 있는 CLI(localhost:8250)와 UI 주소만 허용된다. 남의 주소로 코드를 빼돌리는 공격을 막는 장치다.' },
    { q: 'Vault가 ID token을 받아 확인하는 항목이 아닌 것은 무엇인가?',
      o: ['서명·aud·iss·exp', '사용자의 IdP 비밀번호', 'aud가 client_id와 같은지'], a: 1,
      why: '비밀번호와 MFA는 IdP 화면에서 끝나 Vault는 보지 못한다. Vault는 서명, aud, iss, exp만 검증한다.' },
    { q: 'IdP 그룹 vault-developers를 Vault 정책 dev-full에 잇는 것은 무엇인가?',
      o: ['oidc_scopes', 'external group과 group-alias', 'token_max_ttl'], a: 1,
      why: 'external group에 dev-full을 붙이고, alias가 IdP 그룹 이름과 oidc accessor로 그 그룹을 가리킨다.' },
  ];
  const summary = [
    '사람에게 토큰을 손으로 나눠 주면 회수와 감사가 사람 기억에 달린다.',
    'OIDC auth는 회사 IdP 로그인을 믿고 Vault token을 내준다.',
    'role이 콜백 주소, aud, 사용자·그룹 claim, 1h·8h 수명을 정한다.',
    'IdP 그룹을 external group에 alias로 이으면 그룹 변경이 곧 권한 변경이다.',
  ];
  const review = [
    { q: 'CLI 로그인은 되는데 Vault UI의 OIDC 로그인 버튼만 실패한다. 먼저 볼 것은?',
      o: ['allowed_redirect_uris에 UI 콜백 주소가 있는지', 'token_ttl 값', 'IdP의 서명 공개키'], a: 0,
      why: 'CLI는 localhost:8250, UI는 /ui/vault/auth/oidc/oidc/callback으로 돌아온다. UI 주소가 빠지면 그쪽만 실패한다.' },
    { q: '로그인은 되는데 token_policies에 dev-full이 없다. 의심할 곳은?',
      o: ['oidc_client_secret이 틀렸다', 'oidc_scopes에 groups가 빠졌거나 alias 이름이 다르다', 'iat 값이 오래됐다'], a: 1,
      why: 'dev-full은 groups claim을 거쳐 붙는다. scope에 groups가 없거나 alias 이름이 groups 값과 다르면 dev-base만 남는다.' },
    { q: '퇴사한 직원의 Vault 접근을 끊으려 한다. OIDC를 쓰는 지금 가장 먼저 할 일은?',
      o: ['Vault에서 그 사람의 720h 토큰을 찾아 revoke 한다', 'root token을 새로 만든다', 'IdP에서 계정을 비활성하거나 그룹에서 뺀다'], a: 2,
      why: '신원과 그룹은 IdP가 관리한다. 새로 로그인할 수 없고, 이미 받은 토큰도 1h, 길어야 8h면 끝난다.' },
  ];

  R.page({ title: '사람 로그인 — OIDC 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
