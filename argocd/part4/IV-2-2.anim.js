/* IV-2-2 보안 체크리스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 아래 띠의 체크리스트 11칸은 STEPS 의 done · focus 를 읽는다(항목은 페이지의 CHECKLIST).
 * redis 허용 출발지(server · repo-server · application-controller)와 repo-server 8081 은 Argo CD 공식 매니페스트의 NetworkPolicy 로 확인했다.
 * 이벤트 문구 형식("<user> initiated sync to …")은 Argo CD 소스로 확인했다. 터미널 출력과 버전 v2.11.0 은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    cross, check, lock, terminal, spans, fly, G, person, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // 아래 띠: 체크리스트 11칸
  const CK = ['감사', '격리', 'redis·repo', 'SA 권한', 'TLS·노출', '서명', 'RBAC', 'SSO', '시크릿', 'admin', '스캔·버전'];
  function checklist(c) { const d = new Set(c.beat.done || []), pd = new Set((c.prev && c.prev.done) || []), f = new Set(c.beat.focus || []), y = 398;
    CK.forEach((n, i) => { const x = 24 + i * 83, on = d.has(i), isNew = on && !pd.has(i), foc = f.has(i);
      card(x + 39, y, 78, 30, { rx: 8, stroke: foc ? ACC : on ? GOOD : GRID, sw: foc ? 2.5 : 1.5, fill: on ? GOODBG : PANEL, text: n, fs: 13.5, fw: 700, color: on ? GOOD : foc ? ACC : OFF, s: isNew ? pop(c.u, 1.6) : 1 }); }); }
  function pod(cx, cy, name, o) { o = o || {}; const col = o.col || INK;
    card(cx, cy, o.w || 150, 46, { rx: 23, stroke: col, sw: o.sw || 2.2, fill: o.fill || PANEL, text: name, fs: 14, mono: true, color: col, s: o.s, op: o.op, dash: o.dash }); }

  // ---------- 1. 감사 로그 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 90, 360, 54, { rx: 10, stroke: ACC, sw: 2.5, text: 'argocd-cmd-params-cm', fs: 16, mono: true, color: ACC, s: pop(u, 0.2) });
      [['argocd-server', 200], ['application-controller', 480], ['repo-server', 760]].forEach(([n, x], i) => { pod(x, 250, n, { w: 230, s: pop(u, 0.6 + i * 0.2) }); grow(x, 226, lerp(x, 480, 0.5), 118, E(u, 1.0 + i * 0.2, 1.5 + i * 0.2), MUT); });
      sub(480, 320, '컴포넌트 실행 옵션이 모이는 곳, 로그 설정도 여기', fade(u, 1.8));
      checklist(c); return; }
    if (k === 1) { tx(40, 60, 'text', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      mono(40, 92, 'time=… level=info msg="sync" user=alice', { 'font-size': 14.5, fill: MUT });
      tx(40, 150, 'json', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      spans(40, 182, [['{"level":"info", "msg":"sync", ', { fill: INK }], ['"user":"alice"', { fill: ACC, 'font-weight': 800 }], ['}', { fill: INK }]], { 'font-size': 14.5, opacity: fade(u, 0.6) });
      card(700, 270, 360, 70, { rx: 10, stroke: ACC, s: pop(u, 1.3), text: 'Loki · ELK: user = "alice"\n필드로 바로 검색', fs: 14.5, color: ACC });
      grow(330, 196, 560, 250, E(u, 1.0, 1.4), ACC); sub(220, 120, 'text는 grep밖에 못 한다', fade(u, 1.8));
      checklist(c); return; }
    if (k === 2 || k === 3) { const rows = [['2m', 'Normal', 'ResourceUpdated', 'web-app', 'Updated sync status: OutOfSync -> Synced'], ['5m', 'Normal', 'OperationStarted', 'api-app', 'alice@acme.com initiated sync to HEAD'], ['9m', 'Warning', 'OperationCompleted', 'api-app', 'Sync operation to 3f2a9c1 failed: …']];
      tx(40, 52, '$ kubectl get events -n argocd (출력 예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
      rows.forEach((r, i) => { const y = 92 + i * 52, hit = k === 3 && i === 1, op = k === 2 ? fade(u, 0.2 + i * 0.3) : (k === 3 && !hit ? 0.35 : 1);
        if (hit) el('rect', { x: 32, y: y - 22, width: 900, height: 36, rx: 6, fill: ACCBG });
        mono(44, y, r[0], { 'font-size': 14, fill: MUT, opacity: op }); mono(84, y, r[1], { 'font-size': 14, fill: r[1] === 'Warning' ? BAD : INK, 'font-weight': 700, opacity: op });
        mono(170, y, r[2], { 'font-size': 14, opacity: op }); tx(360, y, r[4], { 'font-size': 14, class: 'mono', opacity: op, fill: r[1] === 'Warning' ? BAD : INK }); });
      if (k === 2) { const x0 = 60, w = 840; el('rect', { x: x0, y: 270, width: w, height: 14, rx: 7, fill: SOFT });
        el('rect', { x: x0, y: 270, width: w * E(u, 0.8, 2.2), height: 14, rx: 7, fill: WARN, opacity: 0.5 });
        tx(x0, 310, '지금', { 'font-size': 13.5, fill: MUT }); mono(x0 + w, 310, '1시간 뒤 사라짐', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 2.0) });
        sub(480, 346, '이벤트 보존 기본값은 1시간이라 중앙 수집이 필요하다', fade(u, 2.2)); }
      else { mono(360, 260, 'alice@acme.com', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) }); sub(450, 290, '맨 앞 계정 = 실행 주체', fade(u, 1.0));
        ['admin', 'admin', 'admin'].forEach((n, i) => mono(700 + i * 80, 270, n, { 'font-size': 16, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5 + i * 0.15) }));
        sub(780, 300, '공용 admin이면 누구인지 모른다', fade(u, 2.0), { fill: BAD }); }
      checklist(c); return; }
    if (k === 4) { [['RequestResponse', 'applications · create/update/patch/delete', '요청 + 응답 본문', 600, ACC], ['Metadata', 'secrets', '누가 · 언제 · 무엇만', 180, MUT]].forEach(([lv, what, keep, w, col], i) => {
        const y = 90 + i * 120; mono(40, y, lv, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.5) }); tx(40, y + 26, what, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.3 + i * 0.5) });
        el('rect', { x: 300, y: y - 16, width: w * E(u, 0.5 + i * 0.5, 1.4 + i * 0.5), height: 34, rx: 6, fill: col, opacity: 0.35 }); tx(310, y + 7, keep, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.5) }); });
      note(40, 330, '본문까지 남기는 건 중요한 리소스에만, 나머지는 Metadata', fade(u, 2.0));
      checklist(c); return; }
    const x0 = 60, w = 600; tx(x0, 70, '로그 보존', { 'font-size': 15, 'font-weight': 700 });
    el('rect', { x: x0, y: 90, width: w, height: 26, rx: 6, fill: SOFT }); el('rect', { x: x0, y: 90, width: w * E(u, 0.2, 1.4), height: 26, rx: 6, fill: ACC, opacity: 0.5 });
    mono(x0 + w + 12, 110, '90일 이상', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
    mono(x0, 190, 'Warning  OperationCompleted', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.0) });
    fly(330, 184, 700, 240, seg(u, 1.4, 2.2), 'Slack 알림', { stay: true });
    checklist(c); }

  // ---------- 2. 네트워크 정책 ----------
  const N = { server: [170, 90], controller: [170, 270], repo: [520, 270], redis: [520, 90], other: [830, 180] };
  const NN = { server: 'argocd-server', controller: 'app-controller', repo: 'repo-server', redis: 'argocd-redis', other: 'other-app' };
  function edge(a, b, f, ok, lab) { const [x1, y1] = N[a], [x2, y2] = N[b], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const sx = x1 + ux * 80, sy = y1 + uy * 30, ex = x2 - ux * 84, ey = y2 - uy * 32;
    if (ok) grow(sx, sy, ex, ey, f, GOOD); else { grow(sx, sy, lerp(sx, ex, 0.75), lerp(sy, ey, 0.75), f, BAD, { plain: true, dash: '6 5' }); if (f >= 1) cross(lerp(sx, ex, 0.8), lerp(sy, ey, 0.8), 9, 1); } }
  function s2(t, c) { const { k, u } = c;
    zone(30, 34, 900, 318, 'namespace argocd');
    const tgt = k >= 1 && k <= 3 ? 'redis' : k >= 4 && k <= 6 ? 'repo' : null;
    Object.keys(N).forEach((n) => { const sel = n === tgt; pod(N[n][0], N[n][1], NN[n], { col: n === 'other' ? BAD : sel ? ACC : INK, sw: sel ? 3 : 2.2, fill: sel ? ACCBG : PANEL }); });
    if (k === 0) { Object.keys(N).filter((n) => n !== 'other').forEach((n, i) => lock(N[n][0] + 86, N[n][1] - 20, true, INK, pop(u, 0.3 + i * 0.25)));
      edge('other', 'redis', E(u, 1.4, 2.0), false); edge('other', 'repo', E(u, 1.6, 2.2), false);
      sub(340, 186, 'podSelector: {}로 들어오는 트래픽 전부 차단', fade(u, 1.0), { 'font-weight': 700 }); checklist(c); return; }
    if (tgt === 'redis') { if (k === 1) pill(520, 40, 'app.kubernetes.io/name: argocd-redis', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      const from = ['server', 'controller', 'repo'];
      if (k >= 2) from.forEach((n, i) => edge(n, 'redis', k === 2 ? E(u, 0.3 + i * 0.4, 0.9 + i * 0.4) : 1, true));
      edge('other', 'redis', k === 2 ? E(u, 1.6, 2.2) : 1, false);
      if (k === 3) { [['6379', true], ['그 외 포트', false]].forEach(([p, ok], i) => { pill(680 + i * 130, 40, p, ok ? GOOD : BAD, pop(u, 0.3 + i * 0.4), { mono: true, fs: 14 }); }); }
      if (k === 2) sub(345, 338, 'repo-server도 캐시로 redis를 쓴다', fade(u, 1.4), { fill: GOOD, 'font-weight': 700 }); }
    if (tgt === 'repo') { if (k === 4) pill(520, 330, 'app.kubernetes.io/name: argocd-repo-server', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      if (k >= 5) ['server', 'controller'].forEach((n, i) => edge(n, 'repo', k === 5 ? E(u, 0.3 + i * 0.4, 0.9 + i * 0.4) : 1, true));
      edge('other', 'repo', k === 5 ? E(u, 1.4, 2.0) : 1, false);
      if (k === 4) sub(720, 126, 'Git 자격증명을 다룬다', fade(u, 1.0), { fill: WARN, 'font-weight': 700 });
      if (k === 5) sub(330, 338, 'ApplicationSet · 알림 컨트롤러도 8081을 부른다', fade(u, 1.6));
      if (k === 6) pill(680, 330, '8081 (gRPC)만', GOOD, pop(u, 0.4), { mono: true, fs: 14 }); }
    if (k === 7) { card(480, 186, 420, 88, { rx: 12, stroke: BAD, sw: 2.5, fill: BADBG, s: pop(u, 0.3) });
      tx(480, 178, 'CNI가 NetworkPolicy를 지원하지 않으면', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      tx(480, 204, '적용된 줄 알았는데 열려 있다 (flannel 기본)', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      pill(720, 330, 'egress 잠금 → Git 443 예외 필요', WARN, pop(u, 1.4), { fs: 13.5 }); }
    checklist(c); }

  // ---------- 3. 최소 권한 · TLS · 노출 ----------
  const KINDS = ['deployments', 'services', 'configmaps', 'secrets', 'nodes', 'clusterroles', 'namespaces', 'crds'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const shrink = E(u, 0.8, 1.8);
      KINDS.forEach((n, i) => { const x = 70 + (i % 4) * 210, y = 100 + Math.floor(i / 4) * 80, inn = i < 3;
        card(x + 90, y, 190, 50, { rx: 8, text: n, fs: 14, mono: true, stroke: inn ? GOOD : lerp(1, 0, shrink) > 0.5 ? BAD : GRID, color: inn ? GOOD : shrink > 0.5 ? OFF : BAD, fill: inn ? GOODBG : PANEL }); });
      el('rect', { x: 56, y: 66, width: lerp(850, 640, shrink), height: lerp(168, 70, shrink), rx: 12, fill: 'none', stroke: shrink < 0.5 ? BAD : GOOD, 'stroke-width': 3, 'stroke-dasharray': '8 5' });
      mono(60, 300, shrink < 0.5 ? 'cluster-admin: 전부' : 'argocd-controller-limited: 관리 대상만', { 'font-size': 16, 'font-weight': 800, fill: shrink < 0.5 ? BAD : GOOD });
      checklist(c); return; }
    if (k === 1) { card(160, 150, 240, 50, { rx: 10, stroke: GOOD, text: 'ClusterRole (좁힘)', fs: 15, color: GOOD });
      grow(282, 150, 380, 150, E(u, 0.3, 0.8), MUT); card(480, 150, 200, 50, { rx: 10, stroke: INK, text: 'ClusterRoleBinding', fs: 14.5, s: pop(u, 0.6) });
      grow(582, 150, 660, 110, E(u, 0.9, 1.4), GOOD);
      [['argocd-application-controller', GOOD, 110], ['argocd-server', OFF, 190], ['argocd-repo-server', OFF, 260]].forEach(([n, col, y], i) => pill(790, y, n, col, pop(u, 1.1 + i * 0.2), { mono: true, fs: 13.5 }));
      note(60, 320, '컴포넌트마다 SA를 나누면 침해돼도 그 범위에서 끝난다', fade(u, 1.8));
      checklist(c); return; }
    if (k === 2) { R.browser(150, 170, 160, 110, '브라우저', {});
      pod(780, 170, 'argocd-server', { w: 190 });
      grow(232, 140, 684, 140, E(u, 0.3, 1.1), GOOD); lock(460, 120, true, GOOD, pop(u, 1.0)); mono(460, 166, 'HTTPS', { 'font-size': 15, fill: GOOD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      grow(232, 210, 600, 210, E(u, 1.2, 1.7), BAD, { plain: true, dash: '6 5' }); cross(620, 210, 11, pop(u, 1.8)); mono(420, 236, 'HTTP', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      [['server.insecure: "false"', 60], ['server.disable.auth: "false"', 90]].forEach(([s, dy], i) => mono(60, 270 + dy, s, { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8 + i * 0.3) }));
      checklist(c); return; }
    if (k === 3 || k === 4) { const gate = [520, 190];
      card(gate[0], gate[1], 150, 120, { rx: 12, stroke: ACC, sw: 2.5, text: k === 3 ? 'Ingress\n허용 대역' : 'internal-nginx\n사내 인증서', fs: 15, color: ACC });
      mono(gate[0], gate[1] + 84, k === 3 ? '10.0.0.0/8' : 'argocd-server-tls', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      pod(830, 190, 'argocd-server', { w: 180 }); grow(596, 190, 738, 190, 1, GOOD);
      if (k === 3) { [['10.12.3.4', true, 120], ['10.40.0.9', true, 170], ['203.0.113.7', false, 230], ['198.51.100.2', false, 280]].forEach(([ip, ok, y], i) => {
          const f = seg(u, 0.2 + i * 0.4, 1.0 + i * 0.4); mono(60, y + 5, ip, { 'font-size': 14.5, fill: ok ? INK : BAD, 'font-weight': 700 });
          if (ok) dot([[180, y], [444, gate[1]]], f, GOOD, 7); else { dot([[180, y], [430, y]], f, BAD, 7); if (f >= 1) cross(440, y, 9, 1); } });
        sub(250, 340, '예시 주소: 사내 대역만 들어온다', fade(u, 2.0)); }
      else { card(200, 190, 220, 70, { rx: 10, stroke: BAD, dash: '6 5', text: '공개 LoadBalancer', fs: 15, color: OFF, op: lerp(1, 0.35, E(u, 0.3, 1.0)) }); cross(310, 160, 12, pop(u, 1.0));
        note(60, 320, '공개 경로를 아예 만들지 않는다', fade(u, 1.5)); }
      checklist(c); return; }
    [['권한', '컴포넌트별 SA + 좁힌 ClusterRole'], ['전송', 'server.insecure=false, 항상 TLS'], ['노출', '사내 Ingress + IP 허용 대역']].forEach(([a, b], i) => { const y = 90 + i * 80, s = pop(u, 0.2 + i * 0.4);
      card(480, y, 640, 60, { rx: 12, stroke: GOOD, sw: 2, s }); check(200, y, 12, s); tx(230, y + 6, a, { 'font-size': 18, 'font-weight': 800, opacity: s }); tx(300, y + 6, b, { 'font-size': 15, opacity: s }); });
    checklist(c); }

  // ---------- 4. 서명 검증 ----------
  const KEYID = '4AEE18F83AFDEB23';
  function commits(u, o) { o = o || {}; const y = 140; el('line', { x1: 60, y1: y, x2: 560, y2: y, stroke: GRID, 'stroke-width': 3 });
    [['a1c', true], ['b2d', true], ['c3e', false], ['d4f', true]].forEach(([h, sig], i) => { const x = 110 + i * 130, s = pop(u, 0.2 + i * 0.25);
      el('circle', { cx: x, cy: y, r: 14 * s, fill: PANEL, stroke: sig ? GOOD : BAD, 'stroke-width': 3 }); mono(x, y + 40, h, { 'font-size': 14, 'text-anchor': 'middle', opacity: s });
      if (o.badge) { (sig ? check : cross)(x, y - 34, 9, pop(u, 0.8 + i * 0.25)); } }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { zone(60, 60, 520, 260, 'AppProject production', { stroke: ACC, sw: 2.5, fill: ACCBG });
      ['web', 'api', 'payment'].forEach((n, i) => pod(170 + i * 150, 190, n, { w: 120, s: pop(u, 0.5 + i * 0.2) }));
      note(620, 150, '서명 강제는 프로젝트 단위로 건다', fade(u, 1.2)); note(620, 178, '이 안의 Application 전부에 적용', fade(u, 1.5), { fill: MUT });
      checklist(c); return; }
    if (k === 1 || k === 3) { commits(u, { badge: true });
      mono(60, 60, 'signatureKeys: - keyID: ' + KEYID, { 'font-size': 15, 'font-weight': 700, fill: ACC });
      if (k === 1) { card(760, 140, 250, 50, { rx: 10, stroke: GOOD, text: 'sync 허용', fs: 15, color: GOOD, s: pop(u, 1.6) }); sub(370, 230, '서명 없는 c3e에서는 sync가 막힌다', fade(u, 1.8), { fill: BAD }); }
      else { el('circle', { cx: 370, cy: 140, r: 22, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.4) });
        card(760, 140, 260, 64, { rx: 10, stroke: BAD, fill: BADBG, text: 'ComparisonError\nsync 거부', fs: 15, color: BAD, s: pop(u, 1.0) });
        sub(480, 300, '키를 바꿀 땐 새 키를 먼저 등록하고 서명을 바꾼다', fade(u, 1.8)); }
      checklist(c); return; }
    if (k === 2) { tx(60, 70, '커밋 서명의 키 ID', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(60, 104, KEYID, { 'font-size': 22, 'font-weight': 800, fill: INFO });
      tx(520, 70, 'argocd-gpg-keys-cm의 data 키', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); mono(520, 104, KEYID + ':', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      grow(300, 96, 506, 96, E(u, 0.8, 1.6), GOOD); check(900, 96, 12, pop(u, 1.7));
      card(520, 210, 360, 70, { rx: 10, stroke: ACC, text: '-----BEGIN PGP PUBLIC KEY BLOCK-----\n팀 릴리스 공개키', fs: 13.5, mono: true, color: ACC, s: pop(u, 1.2) });
      note(60, 320, '키 ID와 data 키 이름이 한 글자라도 다르면 검증 실패', fade(u, 2.0), { fill: BAD });
      checklist(c); return; }
    // Kyverno admission
    if (k === 7) {
      [['GPG 서명 커밋', 'ArgoCD가 확인 후 sync'], ['cosign sign', '레지스트리에 서명'], ['admission 검증', '통과한 이미지만 실행']].forEach(([a, b], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.5);
        card(x, 160, 250, 76, { rx: 12, stroke: GOOD, sw: 2.5, s }); tx(x, 154, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(x, 178, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
        if (i < 2) grow(x + 128, 160, x + 182, 160, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), GOOD); });
      note(480, 290, 'CI에 sign 단계가 빠지면 배포 전체가 막힌다', fade(u, 2.0), { fill: BAD, 'text-anchor': 'middle' }); checklist(c); return; }
    const gx = 480; el('rect', { x: gx - 18, y: 60, width: 36, height: 260, rx: 8, fill: k >= 4 ? ACC : SOFT, opacity: 0.35 });
    mono(gx, 50, 'Kyverno admission', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    if (k === 4) { [['Audit', '기록만', WARN, 140], ['Enforce', '차단', BAD, 240]].forEach(([m, w, col, y], i) => { card(720, y, 220, 56, { rx: 10, stroke: col, sw: i ? 3 : 1.8, text: m + ' · ' + w, fs: 15, color: col, s: pop(u, 0.3 + i * 0.5) }); });
      grow(720, 170, 720, 210, E(u, 1.2, 1.7), MUT); note(60, 320, 'Audit으로 영향 범위를 본 뒤 Enforce로 올린다', fade(u, 1.9)); }
    if (k >= 5) { const imgs = k === 5 ? [['registry.acme.com/web:1.4', 'in', GOOD], ['docker.io/library/nginx', 'out', MUT]] : [['registry.acme.com/web:1.4 (서명)', 'ok', GOOD], ['registry.acme.com/api:2.0 (미서명)', 'no', BAD]];
      imgs.forEach(([n, st, col], i) => { const y = 130 + i * 110, f = seg(u, 0.3 + i * 0.6, 1.4 + i * 0.6);
        mono(40, y - 30, n, { 'font-size': 14, fill: col === MUT ? MUT : INK, 'font-weight': 700 });
        const pass = st !== 'no', endx = pass ? 860 : gx - 26;
        if (f < 1) dot([[60, y], [endx, y]], f, col, 9); else if (pass) pod(860, y, 'Pod', { w: 90, col: col === MUT ? MUT : GOOD }); else cross(gx - 40, y, 11, 1);
        if (k === 5 && st === 'out') sub(680, y + 32, '검증 대상 밖(퍼블릭 이미지는 서명이 없다)', fade(u, 1.8)); });
      if (k === 5) pill(680, 330, 'imageReferences: registry.acme.com/*', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      if (k === 6) pill(680, 330, 'attestors: cosign 공개키', ACC, pop(u, 0.4), { fs: 13.5 }); }
    checklist(c); }

  // ---------- 5. 종합 하드닝 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const st = ['admin 끄기', '초기 시크릿 삭제', '이미지 스캔', '버전 업그레이드', '되읽어 확인'];
      mono(60, 60, 'set -euo pipefail', { 'font-size': 18, 'font-weight': 800, fill: ACC });
      st.forEach((s, i) => { const y = 110 + i * 46, fail = i === 2, after = i > 2, op = after ? lerp(1, 0.3, E(u, 1.6, 2.2)) : 1;
        card(300, y, 300, 36, { rx: 8, stroke: fail ? BAD : after ? GRID : GOOD, text: s, fs: 14.5, color: after ? OFF : INK, op, s: pop(u, 0.2 + i * 0.15) });
        if (i < 2) check(470, y, 9, pop(u, 0.8 + i * 0.2)); if (fail) cross(470, y, 9, pop(u, 1.4)); });
      note(520, 210, '한 단계라도 실패하면 거기서 멈춘다', fade(u, 1.8)); note(520, 236, '반쯤 적용된 상태가 남지 않는다', fade(u, 2.1), { fill: MUT });
      checklist(c); return; }
    if (k === 1 || k === 2) { R.browser(240, 170, 300, 200, 'Argo CD 로그인', {});
      [['admin', k >= 1], ['SSO로 로그인', false]].forEach(([n, off], i) => { const y = 160 + i * 50; card(240, y, 220, 38, { rx: 8, text: n, fs: 15, stroke: off ? BAD : ACC, color: off ? OFF : ACC, op: off ? lerp(1, 0.4, E(u, 0.6, 1.2)) : 1 }); if (off) cross(360, y, 10, pop(u, 1.0)); });
      mono(560, 100, 'admin.enabled: "false"', { 'font-size': 16, 'font-weight': 800, fill: WARN });
      if (k === 2) { const f = E(u, 0.4, 1.6); card(lerp(700, 800, f), lerp(200, 290, f), 280, 44, { rx: 8, stroke: BAD, text: 'argocd-initial-admin-secret', fs: 13.5, mono: true, color: BAD, op: 1 - f * 0.6 });
        el('path', { d: 'M770,300 h60 l-8,60 h-44 Z', fill: SOFT, stroke: INK, 'stroke-width': 2 }); note(560, 160, '설치 직후 한 번만 필요한 값', fade(u, 1.8)); }
      else note(560, 160, '끄기 전에 SSO 로그인이 되는지 먼저 확인', fade(u, 1.4));
      checklist(c); return; }
    if (k === 3) { ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].forEach((sv, i) => { const keep = i >= 2, y = 80 + i * 56, f = E(u, 0.3 + i * 0.25, 1.0 + i * 0.25);
        card(160, y, 160, 40, { rx: 8, text: sv, fs: 15, mono: true, stroke: keep ? BAD : GRID, color: keep ? BAD : OFF });
        if (keep) grow(244, y, 244 + 160 * f, y, 1, BAD); else { if (f > 0) cross(270, y, 9, f); } });
      ['argocd-server', 'argocd-repo-server', 'argocd-application-controller'].forEach((n, i) => pill(700, 100 + i * 60, n, INK, pop(u, 0.4 + i * 0.2), { mono: true, fs: 13.5 }));
      note(480, 330, '--severity HIGH,CRITICAL로 기준선을 정한다', fade(u, 1.8), { 'text-anchor': 'middle' });
      checklist(c); return; }
    if (k === 4) { terminal(40, 40, 560, 170, ['$ trivy config ./k8s/overlays/prd', ['privileged: true인 컨테이너 발견', 'var(--bad)'], ['권한이 넓은 Role 발견', 'var(--bad)']], 1 + E(u, 0.2, 1.8) * 2, { fs: 14 });
      sub(320, 232, '출력은 예시', fade(u, 1.8)); card(780, 125, 260, 70, { rx: 10, stroke: WARN, text: 'CI 게이트에서\n머지 전에 잡는다', fs: 15, color: WARN, s: pop(u, 1.6) });
      checklist(c); return; }
    if (k === 5) { mono(120, 120, 'argocd version --short', { 'font-size': 15, fill: MUT });
      card(220, 210, 200, 60, { rx: 10, stroke: BAD, text: '지금 버전', fs: 16, color: BAD }); grow(322, 210, 578, 210, E(u, 0.5, 1.4), GOOD);
      card(680, 210, 200, 60, { rx: 10, stroke: GOOD, text: 'v2.11.0 (예시)', fs: 16, mono: true, color: GOOD, s: pop(u, 1.4) });
      note(480, 310, '오래된 버전은 알려진 CVE의 표적이다', fade(u, 1.8), { 'text-anchor': 'middle' });
      checklist(c); return; }
    if (k === 6) { [['server.log.format', 'json'], ['networkpolicy', '3개'], ['admin.enabled', 'false'], ['signatureKeys', KEYID]].forEach(([a, b], i) => { const y = 80 + i * 66, d = 0.2 + i * 0.45;
        mono(80, y, 'get ' + a, { 'font-size': 15, opacity: fade(u, d) }); mono(560, y, b, { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, d + 0.3) }); check(520, y - 5, 9, pop(u, d + 0.3)); });
      sub(480, 352, '"설정했다" 와 "적용됐다" 는 다르다', fade(u, 2.2), { 'font-weight': 700 });
      checklist(c); return; }
    // k7: 다 채운 체크리스트
    tx(480, 60, '프로덕션 체크리스트 11칸', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
    [['RBAC', 'IV-1-1'], ['SSO', 'IV-1-2'], ['시크릿', 'IV-2-1']].forEach(([a, b], i) => { const s = pop(u, 0.3 + i * 0.4);
      card(220 + i * 260, 150, 220, 60, { rx: 10, stroke: INFO, sw: 2, s }); tx(220 + i * 260, 146, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); mono(220 + i * 260, 168, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
      });
    note(480, 260, '앞 챕터 셋 + 이번 장 여덟 칸', fade(u, 1.8), { 'text-anchor': 'middle' });
    note(480, 290, 'admin 방치가 가장 흔한 사고 원인이다', fade(u, 2.2), { 'text-anchor': 'middle', fill: BAD });
    checklist(c); }

  const quiz = [
    { q: 'kubectl get events로 사고를 추적하려는데 어제 sync 기록이 안 보인다. 이유는 무엇인가?',
      o: ['이벤트는 기본 1시간만 보존된다', 'Argo CD는 이벤트를 남기지 않는다', 'json 로그로 바꿔서 이벤트가 꺼졌다'], a: 0,
      why: '쿠버네티스 이벤트는 금방 사라진다. 그래서 server · controller 로그를 json으로 중앙 수집하고 90일 이상 보존한다.' },
    { q: 'argocd-redis에 대한 NetworkPolicy의 from에 꼭 있어야 하는 컴포넌트 묶음은 무엇인가?',
      o: ['argocd-server 하나', 'argocd-server · repo-server · application-controller', 'argocd 네임스페이스의 모든 파드'], a: 1,
      why: 'Argo CD 공식 매니페스트도 이 셋만 6379로 허용한다. repo-server는 매니페스트 캐시로 redis를 쓴다.' },
    { q: 'argocd-server를 인터넷에 그대로 열지 않으려면 어떻게 하는가?',
      o: ['server.insecure를 true로 둔다', '공개 LoadBalancer에 비밀번호를 길게 건다', '내부 Ingress 클래스에 사내 대역만 허용한다'], a: 2,
      why: '공개 경로를 아예 만들지 않는 것이 가장 확실하다. 예시는 internal-nginx와 10.0.0.0/8 허용이다.' },
    { q: 'AppProject에 signatureKeys를 건 뒤 서명 없는 커밋이 들어오면 어떻게 되는가?',
      o: ['경고만 남기고 sync 한다', 'sync가 막히고 ComparisonError가 뜬다', '커밋이 자동으로 서명된다'], a: 1,
      why: '등록된 키로 서명된 커밋만 sync 한다. 이미지는 Kyverno가 cosign 서명을 admission에서 따로 확인한다.' },
    { q: 'admin.enabled를 false로 바꾸기 전에 반드시 할 일은 무엇인가?',
      o: ['SSO 로그인이 실제로 되는지 확인한다', 'argocd-initial-admin-secret을 백업한다', 'trivy로 이미지를 스캔한다'], a: 0,
      why: 'SSO가 안 되는데 admin을 끄면 아무도 들어갈 수 없다. 확인한 뒤 끄고 초기 시크릿은 지운다.' },
  ];

  const summary = [
    '공용 admin으로 일하면 감사 로그에 admin만 남아 누가 바꿨는지 알 수 없다.',
    '로그는 json으로 모아 90일 넘게 두고, 쿠버네티스 이벤트는 1시간이면 사라진다.',
    'NetworkPolicy로 redis 6379와 repo-server 8081을 정해진 컴포넌트에만 연다.',
    '서명 커밋과 서명 이미지만 받고, admin을 끈 뒤 설정이 적용됐는지 되읽어 확인한다.',
  ];
  const review = [
    { q: '배포 사고를 조사하는데 이벤트에 "admin initiated sync to HEAD"만 남아 있다. 다음에 같은 일이 없게 하려면?',
      o: ['admin을 끄고 SSO 개인 계정으로만 로그인하게 한다', '이벤트 보존 기간만 늘린다', '로그 레벨을 debug로 올린다'], a: 0,
      why: '이벤트 맨 앞에는 실행한 계정이 찍힌다. 공용 admin이면 기록을 오래 남겨도 누구인지 알 수 없다.' },
    { q: 'NetworkPolicy를 다 적용했는데 다른 파드에서 nc로 redis 6379에 그대로 붙는다. 먼저 의심할 것은?',
      o: ['정책 이름이 너무 길다', 'CNI가 NetworkPolicy를 지원하지 않는다', 'redis 비밀번호가 짧다'], a: 1,
      why: 'flannel 기본처럼 정책을 무시하는 CNI면 적어도 효과가 없다. Calico나 Cilium 같은 CNI가 필요하다.' },
    { q: '서명 강제를 켠 다음 날부터 모든 배포가 멈췄다. 정책과 키는 그대로다. 가장 먼저 볼 곳은?',
      o: ['감사 로그 보존 기간', 'Ingress 허용 대역', 'CI의 커밋 서명과 cosign sign 단계'], a: 2,
      why: '검증은 서명이 있어야 통과한다. CI에서 서명 단계가 빠지면 커밋도 이미지도 모두 거부된다.' },
  ];

  R.page({ title: '프로덕션 보안 점검', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
