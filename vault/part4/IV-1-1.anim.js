/* IV-1-1 Kubernetes auth method — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, cross, check, clock, snippet } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 이 장의 그림 부품 ----------
  // 금고(Vault): 둥근 판 + 금고 문 무늬
  function vaultBox(cx, cy, o) { o = o || {}; const w = o.w || 132, h = o.h || 66, g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    const dx = -w / 2 + 30; el('circle', { cx: dx, cy: 0, r: 17, fill: SOFT, stroke: c, 'stroke-width': 2 }, g);
    [0, 60, 120].forEach((a) => { const r = a * Math.PI / 180; el('line', { x1: dx - Math.cos(r) * 11, y1: -Math.sin(r) * 11, x2: dx + Math.cos(r) * 11, y2: Math.sin(r) * 11, stroke: c, 'stroke-width': 2 }, g); });
    tx(dx + 26, 6, o.name || 'Vault', { 'font-size': 16, 'font-weight': 800, fill: c }, g); return g; }
  // ServiceAccount JWT: header.payload.signature 세 조각
  function jwt(cx, cy, s, o) { o = o || {}; const g = G(cx, cy, s ?? 1, o.op ?? 1); let x = -57;
    [[INFO, 30], [ACC, 46], [GOOD, 30]].forEach(([col, w]) => { el('rect', { x, y: -11, width: w, height: 22, rx: 5, fill: col, opacity: 0.85 }, g); x += w + 4; });
    if (o.label !== false) tx(0, -19, o.label || 'SA JWT', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: o.col || INK }, g); return g; }
  const vtoken = (cx, cy, s, op) => pill(cx, cy, 'hvs.CAESIF…', GOOD, s, { mono: true, fs: 13.5, fill: C.GOODBG, op });
  function key(cx, cy, col, s) { const g = G(cx, cy, s ?? 1); el('circle', { cx: -9, cy: 0, r: 7, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
    el('path', { d: 'M-2,0 H15 M10,0 V7 M15,0 V6', stroke: col, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g); return g; }
  function file(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('path', { d: 'M-16,-22 H8 L18,-12 V22 H-16 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M8,-22 V-12 H18', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-4, 3, 10].forEach((y) => el('line', { x1: -10, y1: y, x2: 10, y2: y, stroke: OFF, 'stroke-width': 2 }, g));
    if (name) tx(0, 40, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  function pod(x, y, w, h, name, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || SOFT, stroke: o.stroke || MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: o.op ?? 1 });
    if (name) tx(x + 14, y + 22, name, { 'font-size': 14, 'font-weight': 700, fill: o.color || MUT, opacity: o.op ?? 1 }); }
  // 줄 그어 가는 메시지 화살표 (순서도)
  function msg(x1, x2, y, u, text, col) { grow(x1, y, x2, y, u, col); if (u > 0.05) mono((x1 + x2) / 2, y - 9, text, { 'font-size': 13.5, 'text-anchor': 'middle', fill: col === ACC ? ACC : INK, opacity: clamp(u * 3), 'font-weight': 600 }); }

  // 1. 문제 — 크리덴셜을 미리 넣으면 그것이 또 시크릿이 된다
  const SPOTS = [
    { y: 70, title: 'deployment.yaml (env)', line: 'VAULT_TOKEN=s.rL0a…' },
    { y: 165, title: 'Secret vault-approle', line: 'secret_id=5b1a…9f' },
    { y: 260, title: 'CI 이미지 myorg/app:1.4.0', line: '빌드 때 크리덴셜 baking' },
  ];
  function s1(t, c) { const { k, u } = c, n = (c.beat.items || []).length, dim = k === 3 ? 0.35 : 1;
    pod(400, 80, 210, 210, 'Pod · app');
    card(505, 200, 130, 46, { text: 'app 컨테이너', fs: 14 });
    vaultBox(830, 185);
    SPOTS.forEach((sp, i) => { if (i >= n) return; const fresh = i === n - 1 && k === i, s = fresh ? pop(u, 0.2) : 1;
      card(180, sp.y, 290, 66, { rx: 10, stroke: BAD, sw: 2, s, op: dim });
      tx(48, sp.y - 8, sp.title, { 'font-size': 14, 'font-weight': 700, opacity: dim * (fresh ? fade(u, 0.3) : 1) });
      mono(48, sp.y + 17, sp.line, { 'font-size': 13.5, fill: BAD, opacity: dim * (fresh ? fade(u, 0.4) : 1) });
      key(296, sp.y + 12, BAD, s * (dim < 1 ? 0.8 : 1));
      el('line', { x1: 325, y1: sp.y, x2: 400, y2: 200, stroke: BAD, 'stroke-width': 1.8, 'stroke-dasharray': '4 5', opacity: dim * (fresh ? fade(u, 0.9) : 0.7) });
      if (fresh) fly(330, sp.y, 470, 175, seg(u, 0.9, 1.8), i === 0 ? 'VAULT_TOKEN' : i === 1 ? 'secret_id' : '크리덴셜', { fill: BAD, mono: true }); });
    if (k === 0) { [2, 1, 0].forEach((j) => { const op = fade(u, 1.5 + (2 - j) * 0.25); el('rect', { x: 40 + j * 7, y: 112 + j * 6, width: 200, height: 24, rx: 5, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
        if (j === 0) mono(50, 129, 'rev 1~3 · s.rL0a…', { 'font-size': 13.5, fill: MUT, opacity: op }); });
      sub(450, 340, 'kubectl describe·배포 히스토리 어디서든 다시 읽힌다', fade(u, 2.0), { 'font-weight': 700, fill: BAD }); }
    if (k === 1) { person(710, 320, '유출된 secret_id', { stroke: BAD });
      dot([[325, 180], [690, 300]], seg(u, 1.2, 1.9), BAD, 7);
      grow(735, 300, 790, 222, seg(u, 1.9, 2.5), BAD); }
    if (k === 2) { tx(40, 345, '미리 넣어 둔 정적 크리덴셜', { 'font-size': 15, 'font-weight': 700 });
      mono(300, 346, Math.round(tween((c.prev.items || []).length, n, u)) + '개', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
      banner(640, 380, '시크릿을 없애려다 시크릿이 하나 더 생겼다', pop(u, 1.3)); }
    if (k === 3) { file(470, 150, null, { s: pop(u, 0.2), stroke: ACC }); mono(445, 270, '/var/run/secrets/…/token', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 0.4), 'text-anchor': 'middle' });
      jwt(540, 132, pop(u, 0.6));
      grow(615, 160, 762, 175, seg(u, 1.2, 2.0), ACC);
      pill(700, 120, '이걸로 로그인하자', ACC, pop(u, 1.8), { fs: 14 });
      sub(505, 316, '모든 파드가 자동으로 받는 신원', fade(u, 2.1), { 'font-weight': 700, fill: ACC }); } }

  // 2. Vault 설정 — enable + config
  function s2(t, c) { const { k, u } = c;
    zone(30, 30, 450, 360, 'Vault 서버', { fill: SOFT });
    zone(560, 30, 370, 360, '쿠버네티스 클러스터', { fill: SOFT, dash: '6 5', stroke: MUT });
    server(745, 150, 'K8s API 서버');
    pod(660, 270, 170, 100, 'Pod · app');
    jwt(745, 335, 1, { label: false, op: k === 3 ? 1 : 0.5 });
    // auth 목록
    tx(52, 70, 'vault auth list', { 'font-size': 13.5, fill: MUT, class: 'mono', 'font-weight': 700 });
    mono(60, 100, 'token/', { 'font-size': 15, fill: MUT }); sub(250, 100, '기본으로 켜져 있다', 1, { 'text-anchor': 'start' });
    const en = k === 0 ? E(u, 0.3, 1.0) : 1;
    el('rect', { x: 50, y: 112, width: 410 * en, height: 30, rx: 6, fill: ACCBG, opacity: 0.9 });
    if (en > 0.6) { mono(60, 133, 'kubernetes/', { 'font-size': 15, 'font-weight': 800, fill: ACC }); sub(250, 133, k === 0 ? '클러스터 정보는 아직 비었다' : '켜짐', fade(k === 0 ? u : 3, 1.2), { 'text-anchor': 'start', fill: ACC }); }
    // config
    if (k >= 1) { tx(52, 180, 'auth/kubernetes/config', { 'font-size': 13.5, fill: MUT, class: 'mono', 'font-weight': 700 });
      [['kubernetes_host', 'https://kubernetes.default.svc', 0.2], ['kubernetes_ca_cert', 'ca.crt (TLS 검증)', 0.7]].forEach(([kk, v, d], i) => { const f = k === 1 ? E(u, d, d + 0.6) : 1, y = 196 + i * 36;
        el('rect', { x: 50, y, width: 410, height: 30, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
        mono(60, y + 20, kk, { 'font-size': 13.5, 'font-weight': 700, opacity: f }); mono(220, y + 20, f < 1 ? v.slice(0, Math.round(v.length * f)) : v, { 'font-size': 13.5, fill: INFO }); });
      const lu = k === 1 ? seg(u, 1.4, 2.3) : 1; grow(462, 211, 686, 150, lu, INFO);
      if (lu > 0.5) { el('circle', { cx: 574, cy: 181, r: 15, fill: PANEL, stroke: INFO, 'stroke-width': 2 }); R.lock(574, 183, true, INFO, 0.6); } }
    if (k === 2) R.terminal(50, 272, 410, 108, ['$ vault read auth/kubernetes/config', 'Key               Value', 'kubernetes_host   https://kubernetes.default.svc'], Math.min(3, lerp(0, 3.2, E(u, 0.2, 2.0))), { fs: 13.5, lh: 21 });
    if (k === 3) { dot([[700, 335], [560, 335], [470, 300]], seg(u, 0.1, 0.8), ACC, 7);
      card(380, 300, 150, 54, { rx: 10, text: '직접 해독 안 함', fs: 14, stroke: BAD, color: BAD, s: pop(u, 0.8) }); cross(300, 300, 9, pop(u, 0.9));
      fly(470, 230, 690, 165, seg(u, 1.2, 1.9), 'TokenReview', { mono: true, fill: INFO });
      fly(690, 190, 470, 250, seg(u, 2.0, 2.7), 'authenticated: true', { mono: true, fill: GOOD, stay: true }); } }

  // 3. role — SA 와 정책을 잇는다
  const ROLE = [['bound_service_account_names', 'app-sa'], ['bound_service_account_namespaces', 'default'], ['token_policies', 'db-read'], ['token_ttl', '1h']];
  function s3(t, c) { const { k, u } = c;
    card(240, 40, 420, 36, { rx: 8, fill: INK, stroke: 'none', text: 'auth/kubernetes/role/app', fs: 14.5, color: PANEL, mono: true });
    ROLE.forEach(([kk, v], i) => { const show = i < 2 || k >= 1; if (!show) return; const fresh = (k === 0 && i < 2) || (k === 1 && i >= 2), d = 0.2 + (i % 2) * 0.45, f = fresh ? E(u, d, d + 0.5) : 1, y = 70 + i * 40;
      const lit = (k === 2 && i < 2) || (k === 1 && i === 2);
      el('rect', { x: 30, y, width: 420, height: 36, rx: 6, fill: lit ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(42, y + 23, kk, { 'font-size': 13.5, fill: MUT, opacity: f }); mono(340, y + 23, v, { 'font-size': 15, 'font-weight': 800, fill: i < 2 ? INK : GOOD, opacity: f }); });
    if (k === 1) { const f = fade(u, 1.3); snippet(30, 250, ['# db-read 정책', 'path "secret/data/app/*" {', '  capabilities = ["read"]', '}'], { fs: 14, op: f, w: 420 }); }
    if (k >= 2) { const s = k === 2 ? pop(u, 0.2) : 1;
      card(760, 110, 250, 84, { rx: 10, stroke: INFO, sw: 2.2, s });
      tx(650, 95, 'ServiceAccount', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: s });
      mono(650, 120, 'name: app-sa', { 'font-size': 15, 'font-weight': 700, opacity: s }); mono(650, 142, 'namespace: default', { 'font-size': 14, opacity: s });
      [[88, 115], [128, 137]].forEach(([y1, y2], i) => { const lu = k === 2 ? seg(u, 0.8 + i * 0.4, 1.4 + i * 0.4) : 1;
        if (lu > 0) el('path', { d: `M452,${y1} C540,${y1} 560,${y2} 636,${y2}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': `${lu * 220} 999` });
        if (lu >= 1) check(560, (y1 + y2) / 2 - 2, 8, k === 2 ? pop(u, 1.4 + i * 0.4) : 1); });
      if (k === 2) sub(760, 180, '이름·네임스페이스가 글자 그대로 같아야 한다', fade(u, 2.1), { 'font-weight': 700, fill: GOOD }); }
    if (k === 3) { const s = pop(u, 0.2);
      card(760, 290, 270, 96, { rx: 10, stroke: INK, sw: 2, s });
      tx(640, 268, 'Deployment app', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: s });
      mono(640, 294, 'serviceAccountName:', { 'font-size': 14, opacity: s }); mono(640, 318, '  app-sa', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: s });
      grow(760, 240, 760, 160, seg(u, 0.8, 1.5), INFO);
      jwt(880, 205, pop(u, 1.5)); sub(880, 240, '이 JWT가 신원', fade(u, 1.7), { 'font-weight': 700 });
      pill(240, 300, '다른 SA (web-sa)로 오면 거부', BAD, pop(u, 2.0), { fs: 14 }); cross(80, 300, 9, pop(u, 2.1)); } }

  // 4. 로그인 흐름 — 순서도
  const X = { pod: 140, vault: 480, k8s: 820 };
  const Y = [130, 178, 222, 268, 312, 352];
  function s4(t, c) { const { k, u } = c;
    [['Pod (app-sa)', X.pod], ['Vault', X.vault], ['K8s API', X.k8s]].forEach(([n, x]) => { card(x, 50, 170, 42, { rx: 10, text: n, fs: 15, fw: 800, stroke: n === 'Vault' ? INK : MUT });
      el('line', { x1: x, y1: 72, x2: x, y2: 372, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 6' }); });
    // ① JWT 읽기
    jwt(X.pod, Y[0] - 4 + 8, k === 0 ? pop(u, 0.6) : 1, { label: k === 0 ? 'SA JWT 읽음' : false });
    if (k === 0) { file(X.pod - 92, Y[0] + 10, null, { s: pop(u, 0.2), stroke: ACC }); sub(X.pod + 20, Y[0] + 50, '/var/run/secrets/…/token', fade(u, 1.0), { class: 'mono', fill: ACC }); }
    // ② 로그인 요청
    if (k >= 1) msg(X.pod + 60, X.vault - 6, Y[1] - 18, k === 1 ? seg(u, 0.2, 1.3) : 1, 'login role=app + jwt', ACC);
    if (k === 1) { dot([[X.pod + 60, Y[1] - 18], [X.vault - 6, Y[1] - 18]], seg(u, 0.3, 1.4), ACC, 7); sub(X.vault + 120, Y[1] - 4, '아직 아무것도 믿지 않는다', fade(u, 1.6), { 'font-weight': 700, 'text-anchor': 'start' }); }
    // ③ TokenReview (k=3 에서 채운다)
    if (k === 2) { el('rect', { x: X.vault + 20, y: Y[1] + 2, width: 330, height: 62, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.6) });
      tx(X.vault + 185, Y[1] + 39, '발급 전에 무슨 일이?', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) }); }
    if (k >= 3) { msg(X.vault + 6, X.k8s - 6, Y[2] - 8, k === 3 ? seg(u, 0.2, 1.0) : 1, 'TokenReview(jwt)', INFO);
      msg(X.k8s - 6, X.vault + 6, Y[3] - 22, k === 3 ? seg(u, 1.1, 1.9) : 1, 'authenticated · app-sa/default', INFO);
      if (k === 3) { pill(X.vault - 130, Y[3] - 30, 'bound SA·ns 일치', GOOD, pop(u, 2.1), { fs: 13.5 }); check(X.vault - 222, Y[3] - 30, 8, pop(u, 2.2)); } }
    // ④ token 발급
    if (k >= 2) { const uu = k === 2 ? seg(u, 0.2, 1.2) : 1; msg(X.vault - 6, X.pod + 60, Y[4] - 18, uu, 'token 발급', GOOD);
      if (k === 2) fly(X.vault - 20, Y[4] - 18, X.pod + 80, Y[4] - 18, seg(u, 0.3, 1.3), 'hvs.CAESIF…', { fill: GOOD, mono: true });
      if (uu >= 1) { vtoken(X.pod, Y[4] - 18, k === 2 ? pop(u, 1.3) : 1);
        if (k === 2) { mono(X.pod - 70, Y[4] + 14, '["db-read" "default"]', { 'font-size': 13.5, opacity: fade(u, 1.5) }); clock(X.pod - 80, Y[4] + 44, 13, E(u, 1.6, 2.6), WARN); mono(X.pod - 60, Y[4] + 49, 'TTL 1h', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) }); } } }
    // ⑤ 시크릿 읽기
    if (k >= 4) { msg(X.pod + 70, X.vault - 6, Y[5] - 12, k === 4 ? seg(u, 0.2, 1.0) : 1, 'kv get secret/app/db', INK);
      if (k === 4) { R.kvTable(X.vault + 30, Y[4] - 34, 300, [['username', 'app', { op: fade(u, 1.3) }], ['password', 'p@ss123', { op: fade(u, 1.5), hot: true }]], { title: 'secret/data/app/db', rh: 30 });
        sub(X.vault + 180, Y[5] + 30, 'db-read 범위 안이라 읽힌다', fade(u, 1.9), { 'font-weight': 700, fill: GOOD }); } }
    if (k === 5) { const n = Math.round(tween(3, 0, u, 1.4)); el('rect', { x: X.vault + 30, y: Y[4] - 22, width: 320, height: 86, rx: 12, fill: PANEL, stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 0.1) });
      tx(X.vault + 190, Y[4] + 8, '미리 배포한 크리덴셜', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(X.vault + 190, Y[4] + 48, n + '개', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: n === 0 ? GOOD : BAD }); } }

  // 5. 실무 — Agent Injector 가 이 흐름을 대신한다
  function s5(t, c) { const { k, u } = c;
    if (k === 3) { tx(480, 52, '역할 셋이 나뉜다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      [['신원', 'SA JWT', '파드마다 자동 발급'], ['검증', 'K8s TokenReview', 'Vault는 결과만 믿는다'], ['권한', 'role → policy', 'db-read · TTL 1h']].forEach(([a, b, d], i) => { const cx = 180 + i * 300, s = pop(u, 0.2 + i * 0.35);
        card(cx, 200, 260, 190, { rx: 14, stroke: [ACC, INFO, GOOD][i], sw: 2.5, s });
        lbl(cx, 135, a, fade(u, 0.3 + i * 0.35), { 'font-size': 16, fill: [ACC, INFO, GOOD][i] });
        if (i === 0) jwt(cx, 190, s, { label: false }); else if (i === 1) server(cx, 182, null, { s: s * 0.6 }); else snippet(cx - 70, 165, ['path "app/*"', ' read'], { fs: 13.5, op: fade(u, 0.5 + i * 0.35), w: 140 });
        mono(cx, 245, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.35) });
        sub(cx, 272, d, fade(u, 0.6 + i * 0.35)); });
      banner(480, 360, '정적 시크릿 마운트가 사라진다', pop(u, 1.8)); return; }
    pod(300, 50, 460, 300, 'Pod · app (serviceAccountName: app-sa)');
    card(410, 170, 150, 60, { text: 'app\nmyorg/app:1.4.0', fs: 14 });
    const sx = k === 0 ? lerp(830, 650, E(u, 0.4, 1.6)) : 650;
    card(sx, 170, 150, 60, { text: 'vault-agent\n사이드카', fs: 14, stroke: ACC, color: ACC, fill: ACCBG });
    if (k === 0) sub(650, 230, '앱 대신 로그인한다', fade(u, 1.8), { 'font-weight': 700, fill: ACC });
    vaultBox(870, 300, { w: 140 });
    // annotation
    if (k >= 1) { const rows = ['agent-inject: "true"', 'role: "app"', 'agent-inject-secret-db:', '  secret/data/app/db'];
      tx(30, 80, 'annotations', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      rows.forEach((r, i) => { const f = k === 1 ? fade(u, 0.2 + i * 0.3) : 1; el('rect', { x: 24, y: 92 + i * 34, width: 256, height: 28, rx: 5, fill: ACCBG, opacity: f * 0.8 });
        mono(32, 111 + i * 34, r, { 'font-size': 13.5, fill: i === 3 ? MUT : INK, opacity: f }); });
      if (k === 1) { dot([[650, 200], [650, 300], [800, 300]], seg(u, 1.4, 2.2), ACC, 6); pill(560, 380, 'SA JWT 로그인 → token', ACC, pop(u, 2.0), { fs: 13.5 }); } }
    if (k >= 2) { el('rect', { x: 400, y: 262, width: 250, height: 66, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      tx(412, 282, '/vault/secrets (메모리)', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      file(610, 300, null, { s: k === 2 ? pop(u, 0.9) : 1, stroke: INFO });
      mono(560, 312, 'db', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 1.0) : 1 });
      if (k === 2) { dot([[800, 290], [700, 220], [628, 286]], seg(u, 0.2, 0.9), ACC, 6); dot([[595, 290], [430, 205]], seg(u, 1.4, 2.2), INFO, 7);
        sub(410, 120, '앱은 파일만 읽는다', fade(u, 2.0), { 'font-weight': 800, fill: INFO, 'font-size': 15 }); } } }

  const quiz = [
    { q: 'Vault 토큰이나 AppRole secret_id를 파드에 미리 넣는 방식의 근본 문제는 무엇인가?',
      o: ['Vault가 그 토큰을 읽지 못한다', '그 크리덴셜 자체가 또 하나의 정적 시크릿이 된다', '파드가 재시작되면 토큰이 사라진다'], a: 1,
      why: 'env·Secret·이미지 어디에 넣든 미리 배포한 크리덴셜은 복사되고 유출될 수 있다. 시크릿을 없애려다 하나를 더 만드는 셈이다.' },
    { q: 'auth/kubernetes/config에 kubernetes_host와 CA 인증서를 넣는 이유는 무엇인가?',
      o: ['Vault가 JWT 서명을 직접 풀기 위해서', '파드에 JWT를 대신 마운트하기 위해서', 'TokenReview API로 JWT 진위를 쿠버네티스에 되묻기 위해서'], a: 2,
      why: 'Vault는 JWT를 스스로 해독하지 않고 API 서버의 TokenReview에 묻는다. host는 물어볼 곳, CA는 그 통신의 TLS 검증용이다.' },
    { q: 'role app이 bound_service_account_names=app-sa로 되어 있을 때 web-sa로 뜬 파드가 로그인하면 어떻게 되는가?',
      o: ['로그인이 거부된다', 'default 정책만 붙은 토큰을 받는다', 'db-read 정책 토큰을 받는다'], a: 0,
      why: 'role은 SA 이름과 네임스페이스가 글자 그대로 일치할 때만 정책을 준다. 맞지 않으면 토큰 자체가 나오지 않는다.' },
    { q: 'role=app 로그인에 성공한 파드가 받는 것은 무엇인가?',
      o: ['쿠버네티스 SA JWT의 새 사본', 'db-read 정책이 붙은 수명 1h의 Vault token', 'secret/app/db의 비밀번호 원문'], a: 1,
      why: 'Vault는 TokenReview와 role 매칭을 거쳐 token_ttl=1h, token_policies=db-read인 토큰을 돌려준다. 시크릿은 그 토큰으로 따로 읽는다.' },
    { q: 'Vault Agent Injector를 쓰면 앱 쪽에서 바뀌는 것은 무엇인가?',
      o: ['앱 코드에 Vault 로그인 로직을 넣는다', 'SA JWT를 직접 Vault에 보낸다', '/vault/secrets/db 파일을 읽기만 한다'], a: 2,
      why: 'annotation을 보고 붙은 vault-agent 사이드카가 로그인과 시크릿 읽기를 맡는다. 앱은 공유 볼륨의 파일만 연다.' },
  ];
  const summary = [
    'Vault 토큰을 파드에 미리 넣으면 그 토큰이 또 지켜야 할 정적 시크릿이 된다.',
    '파드는 SA JWT를 이미 갖고 있고, Vault는 이를 TokenReview로 쿠버네티스에 확인한다.',
    'role이 SA 이름·네임스페이스를 정책에 묶어서, 맞는 파드만 db-read 토큰을 받는다.',
    '토큰 수명은 1h로 짧게 두고, 실무에서는 Agent Injector가 로그인을 대신한다.',
  ];
  const review = [
    { q: '파드 로그인이 계속 permission denied로 실패한다. TokenReview는 authenticated=true를 돌려준다. 먼저 볼 것은?',
      o: ['role의 bound SA 이름·네임스페이스와 파드의 serviceAccountName', 'Vault 서버의 디스크 용량', '앱 이미지 태그'], a: 0,
      why: 'JWT는 진짜라고 확인됐으니 남은 관문은 role 매칭이다. app-sa와 default가 글자 그대로 같아야 토큰이 나온다.' },
    { q: 'kubernetes auth로 받은 토큰이 유출됐다. Step 1의 env 토큰 방식과 비교해 피해가 작은 이유는?',
      o: ['토큰이 암호화돼 있어 읽을 수 없어서', '수명이 1h이고 db-read 경로만 읽을 수 있어서', '쿠버네티스가 유출을 막아서'], a: 1,
      why: 'role이 token_ttl=1h와 db-read 정책을 붙였다. 매니페스트에 박아 둔 토큰과 달리 곧 만료되고 범위도 좁다.' },
    { q: 'Vault를 클러스터 밖에 두고 kubernetes auth를 켰더니 모든 로그인이 TokenReview 단계에서 막힌다. 의심할 곳은?',
      o: ['파드의 SA JWT 파일 경로', 'role의 token_policies', 'config의 kubernetes_host 주소와 CA 인증서'], a: 2,
      why: 'Vault는 config에 적힌 API 서버로 TokenReview를 보낸다. 주소가 틀리거나 CA가 맞지 않으면 진위를 물어볼 수 없다.' },
  ];

  R.page({ title: '파드 → Vault 인증 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
