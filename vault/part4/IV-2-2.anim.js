/* IV-2-2 External Secrets Operator (ESO) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, dbIcon, cross, check, clock, snippet, terminal, spans } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 이 장의 그림 부품 ----------
  function vaultBox(cx, cy, o) { o = o || {}; const w = o.w || 132, h = o.h || 60, g = G(cx, cy, o.s ?? 1, o.op ?? 1), c = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: PANEL, stroke: c, 'stroke-width': 2.5 }, g);
    const dx = -w / 2 + 30; el('circle', { cx: dx, cy: 0, r: 16, fill: SOFT, stroke: c, 'stroke-width': 2 }, g);
    [0, 60, 120].forEach((a) => { const r = a * Math.PI / 180; el('line', { x1: dx - Math.cos(r) * 10, y1: -Math.sin(r) * 10, x2: dx + Math.cos(r) * 10, y2: Math.sin(r) * 10, stroke: c, 'stroke-width': 2 }, g); });
    tx(dx + 25, 6, o.name || 'Vault', { 'font-size': 16, 'font-weight': 800, fill: c }, g); return g; }
  // K8s Secret 카드: 제목 + 키:값 한 줄
  function secretCard(cx, cy, w, title, k, v, o) { o = o || {}; const g = G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.stroke || INFO;
    el('rect', { x: -w / 2, y: -40, width: w, height: 80, rx: 10, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    tx(-w / 2 + 14, -16, title, { 'font-size': 14, 'font-weight': 800, fill: col }, g);
    if (k) { mono(-w / 2 + 14, 18, k, { 'font-size': 14, fill: MUT }, g); mono(-w / 2 + 14 + tw(k, 14) + 10, 18, v, { 'font-size': 14.5, 'font-weight': 800, fill: o.vc || INK }, g); } return g; }
  function pod(x, y, w, h, name, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || SOFT, stroke: o.stroke || MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: o.op ?? 1 });
    if (name) tx(x + 14, y + 22, name, { 'font-size': 14, 'font-weight': 700, fill: o.color || MUT, opacity: o.op ?? 1 }); }
  // ESO 컨트롤러: 톱니 + 눈
  function eso(cx, cy, s, o) { o = o || {}; const g = G(cx, cy, s ?? 1, o.op ?? 1);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('rect', { x: -5, y: -30, width: 10, height: 12, rx: 2, fill: ACC, transform: `rotate(${a * 180 / Math.PI})` }, g); }
    el('circle', { cx: 0, cy: 0, r: 22, fill: ACCBG, stroke: ACC, 'stroke-width': 3 }, g);
    el('path', { d: 'M-12,0 Q0,-10 12,0 Q0,10 -12,0 Z', fill: PANEL, stroke: ACC, 'stroke-width': 2 }, g); el('circle', { cx: 0, cy: 0, r: 4, fill: ACC }, g);
    if (o.label !== false) tx(0, 48, o.label || 'ESO', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC }, g); return g; }
  const kvRow = (x, y, w, k, v, o) => { o = o || {}; el('rect', { x, y, width: w, height: 30, rx: 6, fill: o.hot ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    mono(x + 10, y + 20, k, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: o.op ?? 1 }); mono(x + (o.vx || 120), y + 20, v, { 'font-size': 13.5, 'font-weight': 700, fill: o.vc || INK, opacity: o.op ?? 1 }); };

  // 1. 문제 — 손으로 옮긴 사본은 원본을 모른다
  function s1(t, c) { const { k, u } = c;
    // 원본 (Vault)
    vaultBox(110, 70); mono(60, 128, 'secret/app/db', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const vv = k < 2 ? 'v2' : k === 2 ? (u < 1.0 ? 'v2' : 'v3') : 'v3';
    el('rect', { x: 40, y: 138, width: 290, height: 40, rx: 8, fill: k === 2 && u > 1.0 ? C.WARNBG : PANEL, stroke: GRID, 'stroke-width': 1.5 });
    spans(52, 164, [['password=', { fill: MUT }], ['super-secret-' + vv, { 'font-weight': 800, fill: k === 2 && u > 1.0 ? WARN : INK }]], { 'font-size': 14.5 });
    if (k === 2) { sub(185, 204, 'vault kv put — 원본 회전', fade(u, 1.2), { 'font-weight': 700, fill: WARN }); }
    // 사람
    person(480, 110, '개발자 손', {});
    if (k === 0) { fly(200, 158, 480, 188, seg(u, 0.8, 1.8), 'super-secret-v2', { mono: true, fill: INK, stay: true }); sub(480, 230, '꺼내 보는 것까지는 괜찮다', fade(u, 2.0), { 'font-weight': 700 }); }
    // 사본 (K8s Secret)
    if (k >= 1) { secretCard(790, 120, 270, 'Secret app-db', 'password:', 'super-secret-v2', { s: k === 1 ? pop(u, 1.0) : 1, stroke: k >= 3 ? BAD : INFO, vc: k >= 3 ? BAD : INK });
      if (k === 1) { fly(510, 130, 700, 130, seg(u, 0.2, 1.0), 'kubectl create secret', { mono: true, fill: INFO });
        const lu = seg(u, 1.5, 2.0); el('line', { x1: 332, y1: 230, x2: 330 + 330 * lu, y2: 230, stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
        if (u > 2.1) { el('line', { x1: 332, y1: 230, x2: 660, y2: 230, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }); cross(496, 230, 11, pop(u, 2.1)); sub(496, 262, '원본과의 연결이 여기서 끊긴다', fade(u, 2.2), { 'font-weight': 700, fill: BAD }); } } }
    if (k === 3) { lbl(590, 170, '≠', fade(u, 0.2), { 'font-size': 40, fill: BAD });
      pod(560, 240, 380, 150, 'Pod app (app-db 사용)'); mono(600, 300, 'DB_PASS=super-secret-v2', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5) });
      dbIcon(220, 320, 'DB (이제 v3)', { s: pop(u, 0.8) });
      grow(560, 320, 280, 320, seg(u, 1.0, 1.7), BAD); cross(420, 320, 12, pop(u, 1.8)); sub(420, 360, '인증 실패', fade(u, 1.9), { 'font-weight': 800, fill: BAD, 'font-size': 15 }); }
    if (k === 4) { ['?', '?', '?'].forEach((q, i) => lbl(420 + i * 30, 52 - i * 6, q, fade(u, 0.2 + i * 0.2), { 'font-size': 22, fill: WARN }));
      sub(480, 222, '누가 언제 다시 맞추나', fade(u, 0.5), { 'font-weight': 800, 'font-size': 15, fill: WARN });
      card(300, 330, 420, 110, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 0.9) }); tx(110, 296, 'git commit secret.yaml', { 'font-size': 14, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.0) });
      mono(110, 324, 'password: c3VwZXItc2VjcmV0LXYy', { 'font-size': 14, opacity: fade(u, 1.2) });
      mono(110, 356, '$ base64 -d → super-secret-v2', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) });
      sub(740, 340, 'base64는 암호화가 아니다', fade(u, 2.1), { 'font-weight': 800, fill: BAD, 'font-size': 15 }); }
    if (k === 5) { el('path', { d: 'M332,230 Q496,330 660,230', fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': `${seg(u, 0.2, 1.0) * 400} 999` });
      eso(496, 300, pop(u, 0.9));
      for (let i = 0; i < 4; i++) dot([[332, 230], [420, 278], [496, 280], [580, 278], [660, 230]], ((t * 0.6 + i / 4) % 1) * (u > 1.2 ? 1 : 0), ACC, 5);
      sub(496, 390, 'Vault 원본 → K8s Secret을 자동으로 잇는 다리', fade(u, 1.6), { 'font-weight': 800, 'font-size': 15, fill: ACC }); } }

  // 2. ESO 설치 — 컨트롤러와 CRD
  const CRDS = [['SecretStore', '네임스페이스 연결', INFO], ['ClusterSecretStore', '클러스터 공용 연결', INFO], ['ExternalSecret', '키 → Secret 매핑', ACC]];
  function s2(t, c) { const { k, u } = c;
    card(110, 62, 170, 58, { rx: 10, stroke: INFO, sw: 2.2, s: k === 0 ? pop(u, 0.9) : 1 });
    tx(110, 58, 'external-secrets', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, class: 'mono', fill: INFO }); tx(110, 78, 'helm 차트', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    if (k === 0) { pill(450, 62, 'charts.external-secrets.io', INFO, pop(u, 0.2), { mono: true, fs: 13.5 }); grow(330, 62, 198, 62, seg(u, 0.5, 1.0), INFO);
      sub(450, 110, 'Vault 전용이 아니다 · AWS·GCP·Azure도 같은 방식', fade(u, 1.4), { 'font-weight': 700 }); }
    if (k >= 1) { const zf = k === 1 ? E(u, 0.2, 0.9) : 1; el('rect', { x: 30, y: 130, width: 500 * zf, height: 270, rx: 12, fill: SOFT, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      if (zf > 0.8) tx(44, 154, 'namespace: external-secrets', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
      grow(110, 92, 110, 168, k === 1 ? seg(u, 0.9, 1.4) : 1, MUT);
      if (k === 1) sub(330, 110, '전용 네임스페이스에 상주', fade(u, 1.5), { 'font-weight': 700 }); }
    if (k >= 2) { ['external-secrets', 'external-secrets-webhook', 'external-secrets-cert-controller'].forEach((n, i) => { const y = 200 + i * 62, s = k === 2 ? pop(u, 0.2 + i * 0.35) : 1;
        card(280, y, 470, 48, { rx: 10, stroke: i === 0 ? ACC : INK, sw: 2, s });
        mono(62, y + 5, n, { 'font-size': 14, 'font-weight': 700, opacity: s }); el('circle', { cx: 440, cy: y, r: 6, fill: GOOD, opacity: s }); mono(452, y + 5, 'Running', { 'font-size': 13.5, fill: GOOD, opacity: s }); });
      if (k === 2) eso(470, 84, pop(u, 1.4), { label: false }); }
    if (k >= 3) { tx(570, 154, 'kubectl api-resources', { 'font-size': 13.5, fill: MUT, class: 'mono', 'font-weight': 700 });
      CRDS.forEach(([n, d, col], i) => { const y = 196 + i * 72, s = k === 3 ? pop(u, 0.3 + i * 0.4) : 1;
        card(745, y, 350, 58, { rx: 10, stroke: col, sw: 2.2, s }); mono(584, y - 2, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s }); tx(584, y + 19, d, { 'font-size': 13.5, fill: MUT, opacity: s }); });
      if (k === 3) dot([[530, 200], [570, 268]], seg(u, 1.5, 2.1), ACC, 6); }
    if (k === 4) { [[268, '연결 · 어떻게', INFO], [340, '매핑 · 무엇을', ACC]].forEach(([y, s, col], i) => pill(860, y - 72 + (i ? 72 : 0), s, col, pop(u, 0.3 + i * 0.4), { fs: 13.5, fill: PANEL }));
      banner(745, 400, '값을 읽어 표준 Secret을 만든다', pop(u, 1.4)); } }

  // 3. SecretStore — Vault 연결·인증
  const STORE = [['server', 'https://vault.default.svc:8200'], ['path', '"secret"'], ['version', '"v2"'], ['auth.kubernetes.role', '"eso-role"'], ['serviceAccountRef', 'external-secrets']];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { zone(30, 40, 900, 360, '쿠버네티스 클러스터', { stroke: MUT, dash: '6 5' });
      card(480, 105, 300, 54, { rx: 12, stroke: INFO, sw: 2.5, fill: C.INFOBG, s: pop(u, 0.3) });
      mono(480, 100, 'ClusterSecretStore', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' }); mono(480, 120, 'vault-backend', { 'font-size': 13.5, 'text-anchor': 'middle' });
      ['app', 'team-b', 'team-c'].forEach((n, i) => { const x = 180 + i * 300; zone(x - 120, 230, 240, 140, 'ns: ' + n, { fill: PANEL, stroke: GRID, op: fade(u, 0.6 + i * 0.2) });
        grow(480 + (i - 1) * 60, 132, x, 228, seg(u, 1.0 + i * 0.25, 1.5 + i * 0.25), INFO); card(x, 310, 170, 40, { rx: 8, text: 'ExternalSecret', fs: 13.5, mono: true, stroke: ACC, color: ACC, op: fade(u, 1.4 + i * 0.25) }); });
      sub(480, 395, '여러 팀이 같은 Vault를 쓰면 전역 스토어 하나로', fade(u, 2.2), { 'font-weight': 700 }); return; }
    // 왼쪽: 스토어 정의 표
    card(205, 50, 350, 34, { rx: 8, fill: INK, stroke: 'none', text: 'ClusterSecretStore vault-backend', fs: 14, color: PANEL, mono: true });
    STORE.forEach(([a, b], i) => { const on = (k === 1 && i < 3) || (k === 2 && i >= 3); kvRow(30, 78 + i * 40, 350, a, b.length > 22 && i === 0 ? 'https://vault…:8200' : b, { hot: on, vx: 170 }); });
    vaultBox(820, 90);
    if (k === 1) { grow(382, 93, 750, 90, seg(u, 0.2, 0.9), INFO); sub(570, 78, 'server', fade(u, 0.6), { class: 'mono', fill: INFO });
      tx(430, 220, '조회할 실제 경로', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
      [['secret', INFO, 1.0], ['/data/', WARN, 1.5], ['app/db', ACC, 2.0]].reduce((x, [s, col, d]) => { const w = tw(s, 16) + 22; card(x + w / 2, 260, w, 40, { rx: 8, text: s, fs: 16, mono: true, stroke: col, color: col, s: pop(u, d) }); return x + w + 6; }, 430);
      sub(640, 310, 'version v2면 data가 끼어든다', fade(u, 2.2), { 'font-weight': 700, fill: WARN }); }
    if (k === 2) { const s0 = pop(u, 0.2);
      card(520, 290, 200, 58, { rx: 10, text: 'ESO 파드\nSA: external-secrets', fs: 13.5, s: s0 });
      let x = -57; [[INFO, 30], [ACC, 46], [GOOD, 30]].forEach(([col, w]) => { el('rect', { x: 463 + x + 57, y: 335, width: w, height: 20, rx: 5, fill: col, opacity: 0.85 * fade(u, 0.4) }); x += w + 4; });
      dot([[620, 300], [720, 220], [800, 125]], seg(u, 0.8, 1.6), ACC, 7);
      pill(760, 200, 'auth/kubernetes · eso-role', ACC, pop(u, 1.2), { mono: true, fs: 13.5 });
      fly(800, 125, 620, 280, seg(u, 1.8, 2.5), 'Vault token', { fill: GOOD, stay: true });
      sub(520, 390, '크리덴셜 배포 없이 SA 토큰으로 로그인', fade(u, 2.3), { 'font-weight': 700, fill: GOOD }); }
    if (k === 3) { terminal(420, 220, 510, 110, ['$ kubectl get clustersecretstore vault-backend', 'NAME            STATUS   READY', 'vault-backend   Valid    True'], Math.min(3, lerp(0, 3.2, E(u, 0.2, 1.4))), { fs: 13.5, lh: 22 });
      grow(382, 200, 750, 100, 1, GOOD); check(565, 150, 13, pop(u, 1.6)); sub(675, 370, 'Valid = 주소·인증까지 통과', fade(u, 1.8), { 'font-weight': 700, fill: GOOD }); } }

  // 4. ExternalSecret — 매핑을 적으면 Secret 이 생긴다
  const ES = [['refreshInterval', '"1h"', 1], ['secretStoreRef', 'vault-backend', 1], ['target.name', 'app-db', 2], ['remoteRef.key', 'app/db', 3], ['property', 'password', 3], ['secretKey', 'password', 3]];
  function s4(t, c) { const { k, u } = c;
    const s0 = k === 0 ? pop(u, 0.2) : 1;
    card(180, 50, 300, 34, { rx: 8, fill: INK, stroke: 'none', text: 'ExternalSecret db-secret', fs: 14, color: PANEL, mono: true, s: s0 });
    mono(30, 92, 'namespace: app', { 'font-size': 13.5, fill: MUT, opacity: s0 });
    ES.forEach(([a, b, from], i) => { if (k < from) return; const fresh = k === from; kvRow(30, 104 + i * 38, 300, a, b, { hot: fresh, vx: 150, op: fresh ? fade(u, 0.2 + (i % 3) * 0.3) : 1 }); });
    eso(480, 66, 0.8, { label: k === 0 ? 'ESO가 감지' : false });
    if (k === 0) { dot([[455, 72], [332, 60]], seg(u, 0.8, 1.4), ACC, 6); sub(480, 140, '평문은 없다 · 어디서 가져올지만', fade(u, 1.6), { 'font-weight': 700 }); }
    // Vault KV
    vaultBox(480, 210, { w: 140 });
    if (k >= 1) { pill(480, 270, 'vault-backend', INFO, k === 1 ? pop(u, 0.8) : 1, { mono: true, fs: 13.5 });
      if (k === 1) { grow(332, 160, 420, 262, seg(u, 0.6, 1.2), INFO); clock(300, 123, 13, E(u, 1.2, 2.6), WARN); sub(480, 310, '1h마다 원본을 다시 읽는다', fade(u, 1.8), { 'font-weight': 700, fill: WARN }); } }
    if (k >= 3) { kvRow(390, 300, 190, 'password', 'super-secret-v3', { vx: 82, hot: k === 3 }); mono(390, 352, 'secret/data/app/db', { 'font-size': 13.5, fill: MUT }); }
    // 만들어질 Secret
    if (k >= 2) { const filled = k === 4, sv = filled ? 'c3VwZXItc2VjcmV0LXYz' : '';
      secretCard(790, 200, 270, 'kind: Secret · app-db', filled || k === 3 ? 'password:' : null, filled ? sv.slice(0, Math.round(sv.length * E(u, 0.5, 1.5))) : '', { s: k === 2 ? pop(u, 0.3) : 1, dash: filled ? null : '6 5', stroke: filled ? GOOD : INFO });
      if (k === 2) { el('path', { d: 'M332,195 C450,140 560,140 652,195', fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': seg(u, 0.6, 1.3) < 1 ? (seg(u, 0.6, 1.3) * 360) + ' 999' : '5 5' }); sub(790, 270, '파드는 이 이름만 알면 된다', fade(u, 1.6), { 'font-weight': 700 }); } }
    if (k === 3) { el('path', { d: `M582,315 C620,315 630,225 670,220`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': `${seg(u, 0.6, 1.4) * 200} 999` });

      sub(790, 270, 'property → secretKey', fade(u, 1.6), { 'font-weight': 700, fill: ACC, class: 'mono' }); }
    if (k === 4) { sub(790, 262, 'base64(super-secret-v3)', fade(u, 1.6), { class: 'mono' });
      pod(660, 300, 270, 100, 'Pod app'); mono(676, 360, 'envFrom: app-db', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.9) });
      grow(900, 240, 900, 300, seg(u, 1.8, 2.3), GOOD); } }

  // 5. Injector 와 비교 · refreshInterval · 실무
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { terminal(60, 60, 840, 130, ['$ kubectl get externalsecret db-secret -n app', 'NAME        STATUS         READY', 'db-secret   SecretSynced   True'], Math.min(3, lerp(0, 3.3, E(u, 0.2, 1.6))), { fs: 15, lh: 28 });
      check(480, 270, 16, pop(u, 1.8)); sub(480, 330, '깨지면 이 STATUS에 에러가 뜬다 · 모니터링할 곳', fade(u, 2.1), { 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 1) { secretCard(250, 150, 300, '손으로 만든 Secret', 'TYPE', 'Opaque · DATA 1', { s: pop(u, 0.3) });
      secretCard(710, 150, 300, 'ESO가 만든 Secret', 'TYPE', 'Opaque · DATA 1', { s: pop(u, 0.7), stroke: GOOD });
      lbl(480, 160, '=', fade(u, 1.2), { 'font-size': 40 });
      sub(480, 280, '앱 입장에선 구분되지 않는다 · 기존 매니페스트·차트 그대로', fade(u, 1.6), { 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 2) { [['Agent Injector', 30, '/vault/secrets/db-creds', '파일 경로를 알아야 한다', WARN], ['ESO', 490, 'envFrom: app-db', '표준 Secret 그대로', GOOD]].forEach(([n, x, a, b, col], i) => {
        pod(x, 50, 440, 300, 'Pod · ' + n, { stroke: col }); const s = pop(u, 0.3 + i * 0.6);
        card(x + 120, 170, 150, 56, { rx: 10, text: 'app', fs: 15, s });
        if (i === 0) { card(x + 330, 170, 150, 56, { rx: 10, text: 'vault-agent', fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s }); R.el('rect', { x: x + 60, y: 240, width: 330, height: 40, rx: 8, fill: PANEL, stroke: INFO, 'stroke-dasharray': '5 4', opacity: s }); }
        else { el('rect', { x: x + 60, y: 240, width: 330, height: 40, rx: 8, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: s }); }
        mono(x + 74, 266, a, { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: s });
        sub(x + 220, 320, b, fade(u, 0.8 + i * 0.6), { 'font-weight': 800, fill: col, 'font-size': 15 }); }); return; }
    if (k === 3 || k === 4) { const x0 = 160, W = 720, X = (m) => x0 + W * m / 70;
      [0, 10, 30, 60].forEach((m) => mono(X(m), 80, m + '분', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      const lane = (y, name, at, col) => { tx(30, y + 5, name, { 'font-size': 14.5, 'font-weight': 700 });
        const p = k === 3 ? E(u, 0.2, 2.2) : 1, xe = x0 + W * p; el('rect', { x: x0, y: y - 12, width: Math.min(xe, X(at)) - x0, height: 24, rx: 5, fill: OFF });
        if (xe > X(at)) el('rect', { x: X(at), y: y - 12, width: xe - X(at), height: 24, rx: 5, fill: col, opacity: 0.85 });
        mono(x0 + 8, y + 5, 'v3', { 'font-size': 13.5, 'font-weight': 800 }); if (xe > X(at) + 20) mono(X(at) + 8, y + 5, 'v4', { 'font-size': 13.5, 'font-weight': 800, fill: PANEL }); };
      lane(130, 'Vault 원본', 10, WARN); lane(190, 'Secret app-db', 60, GOOD);
      el('line', { x1: X(60), y1: 100, x2: X(60), y2: 220, stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '4 4' }); mono(X(60), 238, 'refresh', { 'font-size': 13.5, 'text-anchor': 'end', fill: ACC, 'font-weight': 700 });
      sub(X(10), 112, '예: 10분에 회전', 1, { 'font-weight': 700, fill: WARN });
      if (k === 3) { sub(480, 300, '다음 refresh(1h 안)에 Secret이 v4로 바뀐다', fade(u, 2.2), { 'font-weight': 800, 'font-size': 15, fill: GOOD }); return; }
      lane(260, '파드 env', 999, BAD);
      const rs = E(u, 1.2, 2.0); pill(X(66) - 30, 305, 'rollout restart', ACC, pop(u, 1.0), { mono: true, fs: 13.5 });
      el('rect', { x: X(66), y: 248, width: (x0 + W - X(66)) * rs, height: 24, rx: 5, fill: GOOD, opacity: 0.85 }); if (rs > 0.6) mono(X(66) + 6, 265, 'v4', { 'font-size': 13.5, 'font-weight': 800, fill: PANEL });
      sub(330, 330, 'env는 파드가 뜰 때 한 번 읽힌다', fade(u, 0.4), { 'font-weight': 800, fill: BAD, 'font-size': 15 });
      sub(480, 385, '볼륨으로 마운트한 Secret은 kubelet이 잠시 뒤 파일을 바꾼다', fade(u, 2.2), { 'font-weight': 700 }); return; }
    if (k === 5) { zone(80, 50, 800, 300, 'Git 저장소 (GitOps)', { stroke: GRID });
      [['external-secret.yaml', ['kind: ExternalSecret', 'remoteRef.key: app/db', 'property: password'], GOOD, true], ['secret.yaml', ['kind: Secret', 'password: c3VwZXIt…'], BAD, false]].forEach(([f, lines, col, ok], i) => { const x = 130 + i * 380, s = pop(u, 0.3 + i * 0.6);
        card(x + 160, 200, 320, 180, { rx: 10, stroke: col, sw: 2.2, s }); mono(x + 14, 135, f, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s });
        lines.forEach((l, j) => mono(x + 14, 170 + j * 28, l, { 'font-size': 14, opacity: s, 'text-decoration': ok ? null : 'line-through' }));
        (ok ? check : cross)(x + 290, 128, 11, pop(u, 0.8 + i * 0.6)); });
      sub(480, 385, '커밋하는 것은 매핑뿐 · 값은 클러스터 안에서 ESO가 채운다', fade(u, 1.8), { 'font-weight': 700, 'font-size': 15 }); return; }
    const rows = [['전달', '파드 안 파일', '표준 K8s Secret'], ['앱 변경', '파일 경로 읽기', '없음'], ['회전 반영', '사이드카가 다시 씀', 'refreshInterval'], ['백엔드', 'Vault', 'Vault·AWS·GCP·Azure']];
    tx(360, 60, 'Agent Injector', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); tx(700, 60, 'ESO', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
    rows.forEach(([a, b, d], i) => { const y = 84 + i * 66, f = fade(u, 0.2 + i * 0.4);
      el('rect', { x: 40, y, width: 880, height: 54, rx: 10, fill: i % 2 ? PANEL : SOFT, opacity: f });
      tx(60, y + 33, a, { 'font-size': 15, 'font-weight': 700, opacity: f }); tx(360, y + 33, b, { 'font-size': 15, 'text-anchor': 'middle', opacity: f }); tx(700, y + 33, d, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: f }); }); }

  const quiz = [
    { q: 'Vault 값을 손으로 복사해 K8s Secret을 만들었다. 며칠 뒤 원본을 v3로 바꾸면 Secret은 어떻게 되는가?',
      o: ['자동으로 v3가 된다', '여전히 v2로 남아 원본과 어긋난다', '쿠버네티스가 Secret을 지운다'], a: 1,
      why: '복사하는 순간 원본과의 연결이 끊긴다. 사본은 원본이 바뀐 것을 알 방법이 없어 앱이 낡은 값으로 인증에 실패한다.' },
    { q: 'ESO에서 연결과 매핑을 나눠 맡는 두 종류의 CRD는 무엇인가?',
      o: ['Deployment와 Service', 'ConfigMap과 Secret', 'SecretStore(연결)와 ExternalSecret(매핑)'], a: 2,
      why: 'SecretStore·ClusterSecretStore가 어느 저장소에 어떻게 붙을지를, ExternalSecret이 어떤 키를 어느 Secret으로 넣을지를 정한다.' },
    { q: 'ClusterSecretStore를 SecretStore 대신 쓰는 이유는 무엇인가?',
      o: ['여러 네임스페이스가 같은 Vault 연결을 함께 쓰려고', 'KV v1만 지원해서', 'Vault 인증을 건너뛰려고'], a: 0,
      why: 'SecretStore는 한 네임스페이스에서만 쓰인다. 여러 팀이 같은 Vault를 쓰면 클러스터 공용 스토어 하나로 중복을 줄인다.' },
    { q: 'ExternalSecret db-secret을 적용하면 ESO가 만드는 것은 무엇인가?',
      o: ['파드 안 /vault/secrets 파일', 'target.name인 app-db라는 표준 K8s Secret', '새 Vault 정책'], a: 1,
      why: 'ESO는 Vault에서 password를 읽어 app-db Secret의 password 키로 넣는다. 파드는 평범한 env·volume으로 쓴다.' },
    { q: 'Vault 원본을 v4로 바꾼 뒤 app-db Secret이 v4가 되는 시점은 언제인가?',
      o: ['다음 refreshInterval(1h 안)에 ESO가 다시 읽을 때', '즉시', '누군가 ExternalSecret을 지웠다 다시 만들 때'], a: 0,
      why: 'ESO는 refreshInterval마다 원본을 다시 읽는다. 다만 envFrom으로 받은 env는 파드를 다시 띄워야 새 값이 된다.' },
  ];
  const summary = [
    'Vault 값을 손으로 복사한 Secret은 원본이 바뀌어도 옛 값에 머문다.',
    'ESO는 SecretStore로 Vault에 붙고 ExternalSecret 매핑대로 표준 Secret을 만든다.',
    'ESO 자신도 SA 토큰으로 kubernetes auth에 로그인해 정적 크리덴셜이 없다.',
    'refreshInterval 1h마다 Secret이 갱신되지만 env로 받은 값은 재시작해야 바뀐다.',
  ];
  const review = [
    { q: 'ExternalSecret 상태가 SecretSynced가 아니고 오류다. ClusterSecretStore는 Valid다. 먼저 볼 것은?',
      o: ['remoteRef의 key·property가 Vault 경로·필드와 맞는지', 'ESO 헬름 저장소 주소', '파드의 이미지 태그'], a: 0,
      why: '스토어가 Valid면 연결과 인증은 됐다. 남은 것은 매핑으로, app/db 경로나 password 필드 이름이 틀리면 값을 못 읽는다.' },
    { q: 'Vault에서 DB 비밀번호를 v4로 바꾸고 2시간이 지났다. app-db Secret은 v4인데 앱은 여전히 옛 비밀번호로 접속한다. 이유는?',
      o: ['ESO가 동기화를 멈췄다', 'Secret의 base64가 깨졌다', '앱이 envFrom으로 받은 값은 파드를 다시 띄워야 바뀐다'], a: 2,
      why: 'refreshInterval 1h가 지나 Secret은 갱신됐다. env는 파드가 뜰 때 한 번만 읽히므로 rollout restart나 볼륨 마운트가 필요하다.' },
    { q: 'GitOps 저장소에 무엇을 커밋해야 평문 유출 없이 Vault 값을 배포할 수 있나?',
      o: ['base64로 인코딩한 Secret yaml', 'ExternalSecret 매핑 yaml', 'vault kv get 결과를 붙인 ConfigMap'], a: 1,
      why: 'ExternalSecret에는 어디서 가져올지만 있고 값이 없다. base64는 누구나 되돌릴 수 있어 Secret yaml 커밋은 평문 커밋과 같다.' },
  ];

  R.page({ title: 'Vault → K8s Secret 동기화', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
