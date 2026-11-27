/* IV-2-1 Agent Injector — sidecar 주입 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, cross, check, clock, snippet, terminal, spans } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 이 장의 그림 부품 ----------
  function vaultBox(cx, cy, o) { o = o || {}; const w = o.w || 132, h = o.h || 66, g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    const dx = -w / 2 + 30; el('circle', { cx: dx, cy: 0, r: 17, fill: SOFT, stroke: c, 'stroke-width': 2 }, g);
    [0, 60, 120].forEach((a) => { const r = a * Math.PI / 180; el('line', { x1: dx - Math.cos(r) * 11, y1: -Math.sin(r) * 11, x2: dx + Math.cos(r) * 11, y2: Math.sin(r) * 11, stroke: c, 'stroke-width': 2 }, g); });
    tx(dx + 26, 6, o.name || 'Vault', { 'font-size': 16, 'font-weight': 800, fill: c }, g); return g; }
  function jwt(cx, cy, s, o) { o = o || {}; const g = G(cx, cy, s ?? 1, o.op ?? 1); let x = -57;
    [[INFO, 30], [ACC, 46], [GOOD, 30]].forEach(([col, w]) => { el('rect', { x, y: -11, width: w, height: 22, rx: 5, fill: col, opacity: 0.85 }, g); x += w + 4; });
    if (o.label) tx(0, -19, o.label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700 }, g); return g; }
  function pod(x, y, w, h, name, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || SOFT, stroke: o.stroke || MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: o.op ?? 1 });
    if (name) tx(x + 14, y + 22, name, { 'font-size': 14, 'font-weight': 700, fill: o.color || MUT, opacity: o.op ?? 1 }); }
  // 컨테이너: 이름 + 부제
  const ctr = (cx, cy, w, name, subt, o) => { o = o || {}; card(cx, cy, w, 58, { rx: 10, text: name + (subt ? '\n' + subt : ''), fs: 14, stroke: o.stroke || INK, color: o.color || INK, fill: o.fill, s: o.s, op: o.op, dash: o.dash, mono: o.mono }); };
  const agent = (cx, cy, s, op, name) => ctr(cx, cy, 160, name || 'vault-agent', '사이드카', { stroke: ACC, color: ACC, fill: ACCBG, s, op });
  function file(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('path', { d: 'M-16,-22 H8 L18,-12 V22 H-16 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M8,-22 V-12 H18', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    [-4, 3, 10].forEach((y) => el('line', { x1: -10, y1: y, x2: 10, y2: y, stroke: OFF, 'stroke-width': 2 }, g));
    if (name) tx(0, 40, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: c }, g); return g; }
  // 켜짐/꺼짐 스위치
  function toggle(x, y, on, f) { el('rect', { x, y: y - 11, width: 40, height: 22, rx: 11, fill: on ? GOOD : OFF, opacity: f });
    el('circle', { cx: x + (on ? 29 : 11), cy: y, r: 8, fill: PANEL, opacity: f }); }

  // 1. 문제 — 앱이 Vault 를 직접 불러야 한다
  const TASKS = ['① SA 토큰으로 로그인', '② client_token 파싱', '③ secret/data/web/db 읽기', '④ TTL 전 재로그인 스레드', '⑤ 언어 바뀌면 전부 다시'];
  function s1(t, c) { const { k, u } = c;
    card(120, 190, 170, 70, { rx: 10, text: 'Deployment\nweb', fs: 15, s: k === 0 ? pop(u, 0.2) : 1 });
    grow(208, 190, 256, 190, k === 0 ? seg(u, 0.6, 1.0) : 1, MUT);
    if (k > 0 || u > 1.0) pod(260, 50, 460, 300, 'Pod · web', { op: k === 0 ? fade(u, 1.0) : 1 });
    vaultBox(850, 190);
    const legacy = k === 3;
    ctr(380, 160, 190, legacy ? 'legacy 바이너리' : 'web', 'mycorp/web:1.0', { s: k === 0 ? pop(u, 1.2) : 1, stroke: legacy ? BAD : INK, color: legacy ? BAD : INK });
    if (k >= 1) { ['VAULT_ADDR', 'VAULT_ROLE=web'].forEach((s, i) => pill(380, 222 + i * 34, s, INFO, k === 1 ? pop(u, 0.3 + i * 0.3) : 1, { mono: true, fs: 13.5 }));
      if (k === 1) { grow(480, 222, 772, 190, seg(u, 1.0, 1.8), INFO, { dash: '6 5' }); sub(380, 320, '주소일 뿐, 로그인 코드는 앱 몫', fade(u, 1.8), { 'font-weight': 700, fill: WARN }); } }
    if (k >= 2) { TASKS.forEach((s, i) => { const f = k === 2 ? E(u, 0.2 + i * 0.3, 0.5 + i * 0.3) : 1, y = 82 + i * 46;
        el('rect', { x: 500, y, width: 205 * f, height: 36, rx: 6, fill: legacy ? SOFT : C.BADBG, stroke: legacy ? GRID : BAD, 'stroke-width': 1.5, opacity: legacy ? 0.6 : 1 });
        if (f > 0.7) tx(510, y + 23, s, { 'font-size': 13.5, 'font-weight': 700, fill: legacy ? MUT : BAD }); });
      if (k === 2) ['Go', 'Java', 'Python'].forEach((s, i) => pill(530 + i * 100, 380, s + ' ×5', BAD, pop(u, 1.9 + i * 0.15), { fs: 13.5 })); }
    if (legacy) { R.lock(380, 108, true, BAD, pop(u, 0.2)); cross(470, 108, 9, pop(u, 0.4));
      sub(380, 300, '코드를 고칠 수 없다', fade(u, 0.6), { 'font-weight': 700, fill: BAD, 'font-size': 15 });
      ctr(820, 330, 180, '사이드카?', '이 짐을 대신', { stroke: ACC, color: ACC, dash: '6 5', s: pop(u, 1.4) });
      grow(735, 280, 760, 302, seg(u, 1.6, 2.1), ACC); } }

  // 2. mutating webhook — 파드에 사이드카를 끼워 넣는다
  function s2(t, c) { const { k, u } = c;
    const ch = k === 0 ? pop(u, 0.9) : 1;
    card(110, 72, 160, 70, { rx: 10, stroke: INFO, sw: 2.2, s: ch }); tx(110, 66, 'hashicorp/vault', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, class: 'mono', fill: INFO, opacity: ch });
    tx(110, 88, 'helm 차트', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: ch });
    if (k === 0) { pill(470, 72, 'helm.releases.hashicorp.com', INFO, pop(u, 0.2), { mono: true, fs: 13.5 }); grow(330, 72, 196, 72, seg(u, 0.5, 1.0), INFO);
      sub(470, 120, 'Vault 서버와 Injector가 같은 차트에 들어 있다', fade(u, 1.4), { 'font-weight': 700 }); }
    if (k >= 1) { [['injector.enabled', true], ['server.enabled', false]].forEach(([s, on], i) => { const f = k === 1 ? fade(u, 0.2 + i * 0.4) : 1, y = 52 + i * 40;
        mono(220, y + 5, s, { 'font-size': 14, opacity: f }); toggle(390, y, on, f); mono(440, y + 5, on ? 'true' : 'false', { 'font-size': 14, 'font-weight': 800, fill: on ? GOOD : MUT, opacity: f }); });
      vaultBox(830, 72, { s: k === 1 ? pop(u, 1.1) : 1 });
      grow(520, 72, 758, 72, k === 1 ? seg(u, 1.3, 2.0) : 1, MUT, { dash: '6 5' });
      if (k === 1) mono(640, 60, 'externalVaultAddr', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); }
    if (k >= 2) { zone(30, 150, 900, 260, '쿠버네티스 클러스터', { stroke: MUT, dash: '6 5' });
      const s = k === 2 ? pop(u, 0.3) : 1; ctr(160, 265, 220, 'vault-agent-injector', '1/1 Running', { s, mono: true });
      if (k === 2) sub(160, 330, '모든 파드 생성 요청을 들여다볼 파드', fade(u, 1.0), { 'font-weight': 700 }); }
    if (k >= 3) { server(470, 250, 'API 서버', { s: k === 3 ? pop(u, 0.2) : 1 });
      grow(400, 255, 272, 262, k === 3 ? seg(u, 0.7, 1.4) : 1, ACC);
      if (k === 3) { mono(336, 236, 'webhook', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
        pill(470, 378, 'vault-agent-injector-cfg', ACC, pop(u, 1.6), { mono: true, fs: 13.5 }); } }
    if (k === 4) { pill(470, 172, 'kubectl apply (Pod web)', INK, pop(u, 0.1), { mono: true, fs: 13.5 });
      dot([[470, 190], [470, 208]], seg(u, 0.2, 0.5), INK, 6); dot([[410, 255], [272, 262]], seg(u, 0.5, 1.0), ACC, 7); dot([[272, 272], [410, 265], [600, 265]], seg(u, 1.0, 1.6), GOOD, 7);
      const x = 620; tx(x, 186, 'Pod web 스펙', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const rows = [['containers: web', INK, 0], ['+ initContainers: vault-agent-init', GOOD, 1.5], ['+ containers: vault-agent', GOOD, 1.8], ['+ volume: /vault/secrets (메모리)', GOOD, 2.1]];
      rows.forEach(([s, col, d], i) => { const f = d ? fade(u, d) : 1; el('rect', { x, y: 198 + i * 40, width: 300, height: 32, rx: 6, fill: d ? C.GOODBG : PANEL, stroke: d ? GOOD : GRID, 'stroke-width': 1.5, opacity: f });
        mono(x + 10, 219 + i * 40, s, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: f }); }); } }

  // 3. agent 가 k8s auth 로 로그인
  function s3(t, c) { const { k, u } = c;
    zone(30, 30, 430, 370, 'Vault 서버'); zone(510, 30, 420, 370, '쿠버네티스 클러스터', { stroke: MUT, dash: '6 5' });
    server(720, 100, null, { s: 0.7 }); tx(790, 106, 'K8s API', { 'font-size': 15, 'font-weight': 700 });
    tx(52, 68, 'vault auth list', { 'font-size': 13.5, fill: MUT, class: 'mono', 'font-weight': 700 });
    const en = k === 0 ? E(u, 0.3, 1.0) : 1; el('rect', { x: 50, y: 80, width: 390 * en, height: 30, rx: 6, fill: ACCBG });
    if (en > 0.6) mono(60, 101, 'kubernetes/', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 0) sub(245, 140, 'agent가 쓸 로그인 창구', fade(u, 1.2), { 'font-weight': 700, fill: ACC });
    if (k >= 1) { const lu = k === 1 ? seg(u, 0.6, 1.4) : 1;
      el('rect', { x: 50, y: 124, width: 390, height: 30, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(60, 144, 'kubernetes_host', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); mono(200, 144, 'https://kubernetes…', { 'font-size': 13.5, fill: INFO, opacity: k === 1 ? fade(u, 0.3) : 1 });
      grow(442, 139, 670, 108, lu, INFO);
      if (k === 1) sub(560, 160, 'SA 토큰 진위는 여기에 되묻는다', fade(u, 1.6), { 'font-weight': 700, fill: INFO }); }
    if (k === 2) { tx(52, 192, 'auth/kubernetes/role/web', { 'font-size': 13.5, fill: MUT, class: 'mono', 'font-weight': 700 });
      [['bound_service_account_names', 'web-sa'], ['bound_…_namespaces', 'default'], ['policies', 'web-policy'], ['ttl', '1h']].forEach(([a, b], i) => { const f = E(u, 0.2 + i * 0.35, 0.6 + i * 0.35), y = 204 + i * 44;
        el('rect', { x: 50, y, width: 390 * f, height: 36, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
        if (f > 0.8) { mono(60, y + 23, a, { 'font-size': 13.5, fill: MUT }); mono(430, y + 23, b, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: i === 2 ? GOOD : INK }); } }); }
    if (k === 3) { snippet(50, 186, ['vault policy write web-policy', 'path "secret/data/web/db" {', '  capabilities = ["read"]', '}'], { fs: 14, w: 390, op: fade(u, 0.2) });
      [['secret/data/web/db', true], ['secret/data/pay/key', false]].forEach(([p, ok], i) => { const y = 328 + i * 34, f = fade(u, 1.0 + i * 0.5);
        (ok ? check : cross)(66, y, 8, pop(u, 1.1 + i * 0.5)); mono(86, y + 5, p, { 'font-size': 14, fill: ok ? GOOD : BAD, opacity: f, 'font-weight': 700 }); }); }
    // 파드: agent + web
    pod(540, 180, 370, 215, 'Pod web (web-sa)');
    agent(640, 290, 1, 1, 'vault-agent'); ctr(820, 290, 130, 'web', '앱', {});
    jwt(640, 362, 0.8, { op: k === 4 ? 1 : 0.4 });
    if (k === 4) { dot([[580, 362], [470, 362], [380, 300]], seg(u, 0.2, 0.9), ACC, 7); mono(470, 404, 'login role=web', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      vaultBox(245, 270, { s: pop(u, 0.1) });
      fly(320, 240, 640, 232, seg(u, 1.0, 1.8), 'hvs.… web-policy', { fill: GOOD, mono: true, stay: true });
      clock(740, 232, 13, E(u, 1.8, 2.8), WARN); sub(245, 340, 'TTL 1h 전에 agent가 알아서 갱신', fade(u, 2.0), { 'font-weight': 700 });
      sub(820, 345, '토큰을 모른다', fade(u, 2.2), { 'font-weight': 700, fill: GOOD }); } }

  // 4. 시크릿을 파일로 렌더
  const ANN = [['agent-inject: "true"', 0], ['role: "web"', 0], ['agent-inject-secret-db-creds:', 1], ['  "secret/data/web/db"', 1], ['agent-inject-template-db-creds: |', 2], ['  export DB_USER={{ … }}', 2], ['  export DB_PASS={{ … }}', 2]];
  function s4(t, c) { const { k, u } = c;
    tx(30, 40, 'annotations', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    ANN.forEach(([s, g], i) => { const on = g === k || (k === 3 && g === 0), y = 52 + i * 32;
      el('rect', { x: 24, y, width: 370, height: 28, rx: 5, fill: on ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1 });
      if (i === 2) spans(32, y + 19, [['agent-inject-secret-', {}], ['db-creds', { fill: k === 1 ? ACC : INK, 'font-weight': 800 }], [':', {}]], { 'font-size': 13.5 });
      else mono(32, y + 19, s, { 'font-size': 13.5, fill: g > k ? MUT : INK }); });
    pod(430, 30, 500, 270, 'Pod web');
    agent(540, 110, k === 0 ? pop(u, 0.6) : 1, 1); ctr(840, 110, 120, 'web', '앱 이미지 그대로', {});
    if (k === 0) { grow(396, 66, 456, 100, seg(u, 0.3, 0.7), ACC); sub(680, 175, '두 줄만 보고 webhook이 붙인다', fade(u, 1.2), { 'font-weight': 700, fill: ACC }); }
    if (k >= 1) { el('rect', { x: 470, y: 170, width: 430, height: 116, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      tx(482, 192, '/vault/secrets (emptyDir · 메모리)', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      file(510, 238, null, { s: k === 1 ? pop(u, 0.9) : 1, stroke: INFO }); mono(536, 244, 'db-creds', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k === 1 ? fade(u, 1.0) : 1 });
      if (k === 1) { el('path', { d: 'M300,116 C380,140 430,230 488,236', fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': `${seg(u, 0.3, 0.9) * 300} 999` });
        sub(700, 330, 'annotation 이름 뒤쪽이 그대로 파일 이름', fade(u, 1.4), { 'font-weight': 700, fill: ACC }); } }
    if (k >= 2) { const lines = ['export DB_USER=app', 'export DB_PASS=s3cr3t-from-vault'];
      lines.forEach((s, i) => { const f = k === 2 ? E(u, 1.0 + i * 0.5, 1.6 + i * 0.5) : 1; mono(630, 232 + i * 26, s.slice(0, Math.round(s.length * f)), { 'font-size': 13.5, 'font-weight': 700 }); });
      if (k === 2) { R.kvTable(40, 290, 340, [['username', 'app'], ['password', 's3cr3t-from-vault', { hot: true }]], { title: 'secret/data/web/db  (.Data.data)', rh: 30 });
        dot([[380, 330], [470, 300], [600, 240]], seg(u, 0.3, 1.0), ACC, 7); } }
    if (k === 3) { const x0 = 450, W = 460, X = (m) => x0 + W * m / 15, y = 360;
      el('line', { x1: x0, y1: y, x2: x0 + W * E(u, 0.1, 0.8), y2: y, stroke: MUT, 'stroke-width': 2 });
      [0, 5, 10, 15].forEach((m) => mono(X(m), y + 26, m + '분', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) }));
      el('rect', { x: X(0) - 6, y: y - 30, width: 12, height: 24, rx: 3, fill: INFO, opacity: fade(u, 0.6) }); mono(X(0) + 12, y - 40, 'init: 앱보다 먼저 첫 파일', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.7) });
      [5, 10, 15].forEach((m, i) => { const s = pop(u, 1.2 + i * 0.3); el('circle', { cx: X(m), cy: y - 16, r: 8 * s, fill: ACC }); });
      mono(X(10), y + 52, '사이드카가 다시 렌더 (KV 기본 5분)', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(215, 330, '동적 시크릿은 TTL에 맞춰 다시 가져온다', fade(u, 2.2), { 'font-weight': 700 }); } }

  // 5. 앱은 파일만 읽는다
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { terminal(60, 50, 840, 170, ['$ kubectl exec deploy/web -c web -- cat /vault/secrets/db-creds', 'export DB_USER=app', 'export DB_PASS=s3cr3t-from-vault'], Math.min(3, lerp(0, 3.3, E(u, 0.2, 1.8))), { fs: 15, lh: 30 });
      file(200, 320, '/vault/secrets/db-creds', { s: pop(u, 1.8), stroke: INFO }); sub(560, 320, '앱이 뜨기 전에 init 컨테이너가 이미 써 두었다', fade(u, 2.1), { 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 1) { const pts = [[110, 'db-creds 파일'], [330, 'source'], [560, 'DB_USER\nDB_PASS'], [790, 'web-server']];
      file(110, 160, null, { stroke: INFO, s: pop(u, 0.1) }); lbl(110, 230, 'db-creds 파일', fade(u, 0.2), { fill: INFO });
      card(330, 160, 150, 50, { rx: 25, text: 'source', fs: 15, mono: true, s: pop(u, 0.5) });
      card(560, 160, 170, 64, { rx: 10, text: 'DB_USER\nDB_PASS', fs: 14.5, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 0.9) });
      card(790, 160, 160, 56, { rx: 10, text: 'web-server', fs: 15, mono: true, s: pop(u, 1.3) });
      [[140, 255], [405, 475], [645, 710]].forEach(([a, b], i) => grow(a, 160, b, 160, seg(u, 0.3 + i * 0.4, 0.7 + i * 0.4), MUT));
      dbIcon(790, 320, 'DB', { s: pop(u, 1.8) }); grow(790, 190, 790, 268, seg(u, 1.9, 2.4), GOOD);
      [['Vault SDK', 260], ['로그인 코드', 450]].forEach(([s, x], i) => { pill(x, 320, s, BAD, pop(u, 1.6 + i * 0.2), { fs: 14 }); cross(x - tw(s, 14) / 2 - 26, 320, 9, pop(u, 2.0 + i * 0.2)); }); return; }
    if (k === 2) { pod(40, 40, 880, 330, 'Pod web — kubectl get pod -o jsonpath');
      tx(70, 100, 'initContainers', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' }); tx(70, 210, 'containers', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
      ctr(380, 100, 220, 'vault-agent-init', '첫 파일 렌더 후 종료', { s: pop(u, 0.4), stroke: INFO, color: INFO, mono: true });
      ctr(380, 210, 160, 'web', '앱', { s: pop(u, 0.9), mono: true }); ctr(600, 210, 190, 'vault-agent', '계속 갱신', { s: pop(u, 1.2), stroke: ACC, color: ACC, fill: ACCBG, mono: true });
      [[380, 140, '매니페스트에 없던 것'], [600, 250, '매니페스트에 없던 것']].forEach(([x, y, s], i) => sub(x, y + 22, s, fade(u, 1.6 + i * 0.3), { 'font-weight': 700, fill: GOOD }));
      sub(480, 330, 'mutating webhook이 끼워 넣은 흔적', fade(u, 2.2), { 'font-weight': 700, 'font-size': 15 }); return; }
    tx(480, 52, '앱은 Vault를 몰라도 된다', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    [['앱 코드 수정', '0줄', 'annotation만 추가'], ['인증·갱신', '사이드카', 'k8s auth + 토큰 갱신'], ['시크릿 위치', '메모리 파일', '노드 디스크에 평문 없음']].forEach(([a, b, d], i) => { const cx = 180 + i * 300, s = pop(u, 0.2 + i * 0.35);
      card(cx, 190, 260, 150, { rx: 14, stroke: [GOOD, ACC, INFO][i], sw: 2.5, s });
      lbl(cx, 150, a, fade(u, 0.3 + i * 0.35), { fill: MUT }); tx(cx, 196, b, { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: [GOOD, ACC, INFO][i], opacity: fade(u, 0.4 + i * 0.35) });
      sub(cx, 232, d, fade(u, 0.5 + i * 0.35)); });
    pill(480, 340, '다음: External Secrets Operator (IV-2-2)', MUT, pop(u, 1.8), { fs: 14 }); }

  const quiz = [
    { q: 'Agent Injector 없이 앱이 Vault 시크릿을 쓰려면 앱 코드가 떠안는 일은 무엇인가?',
      o: ['VAULT_ADDR 환경변수만 읽으면 끝난다', '로그인·토큰 파싱·시크릿 읽기·TTL 전 갱신을 직접 구현한다', 'kubectl로 Secret을 만든다'], a: 1,
      why: 'env는 주소일 뿐이다. 로그인부터 갱신 스레드까지 앱이 짜야 하고, 언어가 바뀌면 다시 짜야 한다.' },
    { q: 'Agent Injector가 파드에 사이드카를 넣을 수 있는 쿠버네티스 장치는 무엇인가?',
      o: ['mutating admission webhook', 'CronJob', 'PersistentVolume'], a: 0,
      why: '파드가 저장되기 전에 API 서버가 webhook(vault-agent-injector-cfg)을 부르고, injector가 init·사이드카·볼륨을 끼운 스펙을 돌려준다.' },
    { q: '주입된 vault-agent가 Vault에 로그인할 때 내는 신원은 무엇인가?',
      o: ['앱 이미지에 넣어 둔 Vault 토큰', '관리자의 root token', '파드에 자동 마운트된 ServiceAccount(web-sa) 토큰'], a: 2,
      why: 'agent는 SA 토큰으로 kubernetes auth의 role=web에 로그인해 web-policy 토큰을 받는다. 미리 배포한 크리덴셜은 없다.' },
    { q: 'agent-inject-secret-db-creds annotation이 만드는 파일은 무엇인가?',
      o: ['/vault/secrets/db-creds', '/etc/db-creds.conf', '/var/run/secrets/db-creds'], a: 0,
      why: 'annotation 이름 뒤쪽(db-creds)이 그대로 파일 이름이 되고, 공유 메모리 볼륨 /vault/secrets 아래에 렌더된다.' },
    { q: '주입이 끝난 파드의 컨테이너 구성으로 맞는 것은 무엇인가?',
      o: ['web 하나뿐이다', 'init에 vault-agent-init, 컨테이너에 web과 vault-agent', '컨테이너에 vault 서버와 web'], a: 1,
      why: 'init 컨테이너가 앱 전에 첫 파일을 쓰고, 사이드카 vault-agent가 남아 파일을 계속 갱신한다.' },
  ];
  const summary = [
    '앱이 Vault를 직접 부르면 로그인과 갱신 코드를 언어마다 다시 짜야 한다.',
    'Injector는 mutating webhook으로 파드에 vault-agent init과 사이드카를 끼운다.',
    'agent는 파드의 SA 토큰으로 role=web에 로그인하고 토큰을 혼자 쥔다.',
    '시크릿은 /vault/secrets 메모리 파일로 렌더되고, KV는 기본 5분마다 다시 쓴다.',
  ];
  const review = [
    { q: 'annotation을 붙였는데 새 파드에 vault-agent가 보이지 않는다. 먼저 볼 것은?',
      o: ['injector 파드와 mutatingwebhookconfiguration이 살아 있는지', 'web-policy의 경로', '앱의 entrypoint 스크립트'], a: 0,
      why: '사이드카를 끼우는 것은 webhook이다. injector가 없거나 webhook 등록이 없으면 annotation은 아무 일도 하지 않는다.' },
    { q: 'vault-agent-init이 permission denied로 멈춰 파드가 뜨지 않는다. 의심할 곳은?',
      o: ['template의 export 문법', 'role web의 bound SA와 파드의 serviceAccountName, web-policy 경로', '앱 이미지 태그'], a: 1,
      why: 'agent는 web-sa로 role=web에 로그인해 secret/data/web/db를 읽는다. SA가 다르거나 정책 경로가 다르면 읽기에서 막힌다.' },
    { q: 'Vault에서 KV 값을 바꿨더니 몇 분 뒤 /vault/secrets/db-creds 내용이 바뀌었다. 이 일을 한 것은?',
      o: ['vault-agent-init 컨테이너', '앱이 다시 로그인했다', '계속 떠 있는 vault-agent 사이드카가 주기적으로 다시 렌더했다'], a: 2,
      why: 'init은 첫 파일만 쓰고 끝난다. KV처럼 임대가 없는 값은 사이드카가 기본 5분마다 다시 읽어 파일을 고쳐 쓴다.' },
  ];

  R.page({ title: '사이드카 주입 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
