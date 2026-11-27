/* V-2-1 Secret 관리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 틀: 비밀 값 하나(열쇠)가 어디에 평문으로 복사되어 남는지를 따라간다. 오른쪽 위 위험도 별은 페이지 설명의 값(5 · 3 · 1 · 2 · 1)이다.
 * 터미널·plan 출력은 실행 결과가 아니라 동작 규칙으로 만든 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, tokens, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, server, dbIcon, cross, check, lock, terminal, clock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const chip = (cx, cy, s, col, sc, o) => pill(cx, cy, s, col, sc, Object.assign({ mono: true, fs: 13.5, fill: PANEL }, o || {}));
  // 열쇠 = 비밀 값 하나의 평문 사본
  function key(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s); const c = col || BAD;
    el('circle', { cx: -9, cy: 0, r: 8, fill: 'none', stroke: c, 'stroke-width': 3.2 }, g);
    el('path', { d: 'M-1,0 H15 M9,0 V6 M14,0 V5', fill: 'none', stroke: c, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g); }
  // 위험도 별 (오른쪽 위)
  function stars(n, prevN, u) { const v = tween(prevN, n, u); tx(764, 32, '위험도', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 5; i++) { const f = clamp(v - i), x = 828 + i * 22;
      el('path', { d: starPath(x, 27, 9), fill: SOFT, stroke: GRID, 'stroke-width': 1 }); if (f > 0) el('path', { d: starPath(x, 27, 9), fill: n >= 4 ? BAD : n >= 3 ? WARN : GOOD, opacity: f }); } }
  function starPath(cx, cy, r) { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1); } return d + 'Z'; }
  // 파일 카드 (줄 단위 등장)
  function fileCard(x, y, w, name, rows, o) { o = o || {}; const lh = o.lh || 24, h = 34 + rows.length * lh + 10;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, opacity: o.op ?? 1 });
    el('rect', { x, y, width: w, height: 28, rx: 10, fill: SOFT, opacity: o.op ?? 1 }); mono(x + 14, y + 19, name, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    rows.forEach((r, i) => { const op = (r.op ?? 1) * (o.op ?? 1); if (op <= 0) return; const yy = y + 34 + i * lh;
      if (r.hi) el('rect', { x: x + 6, y: yy, width: w - 12, height: lh, rx: 4, fill: r.hi === 'bad' ? BADBG : r.hi === 'good' ? GOODBG : ACCBG, opacity: op });
      spans(x + 16, yy + lh / 2 + 5, r.col ? [[r.s, { fill: r.col }]] : tokens(r.s), { 'font-size': o.fs || 14.5, opacity: op }); });
    return h; }

  // ================= 1. 평문 tfvars =================
  const TFV = ['db_password    = "P@ss123!"', 'db_username    = "admin"', 'aws_access_key = "AKIAIOSFODNN7EXAMPLE"', 'aws_secret_key = "wJalr…EXAMPLEKEY"', 'github_token   = "ghp_aBcD…"', 'stripe_api_key = "sk_live_51H…"'];
  function s1(t, c) { const { k, u } = c;
    stars(5, k === 0 ? 0 : 5, k === 0 ? u : 3);
    const shown = [2, 4, 6, 6, 6][k], fresh = (i) => (k === 0 && i < 2 ? fade(u, 0.2 + i * 0.4) : k === 1 && i >= 2 && i < 4 ? fade(u, 0.2 + (i - 2) * 0.4) : k === 2 && i >= 4 ? fade(u, 0.2 + (i - 4) * 0.4) : 1);
    fileCard(24, 50, 470, 'terraform.tfvars', TFV.slice(0, shown).map((s, i) => ({ s, hi: (k === 0 && i === 0) || (k === 1 && (i === 2 || i === 3)) || (k === 2 && i >= 4) ? 'bad' : null, op: fresh(i) })));
    if (k === 0) { key(440, 96, pop(u, 1.0)); note(24, 260, '값을 적는 순간 이 파일은 비밀 파일이 된다', fade(u, 1.4)); note(24, 292, '커밋 한 번이면 이력에 영원히 남는다', fade(u, 1.9), { fill: BAD }); return; }
    if (k === 1) { key(440, 96, 1); key(470, 144, pop(u, 0.9));
      el('circle', { cx: 700, cy: 170, r: 52, fill: 'none', stroke: INFO, 'stroke-width': 4, opacity: fade(u, 1.2) }); el('line', { x1: 737, y1: 207, x2: 780, y2: 250, stroke: INFO, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: fade(u, 1.2) });
      mono(700, 176, 'AKIA…', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      note(560, 300, 'GitHub은 AKIA 패턴을 자동으로 찾는다', fade(u, 1.8)); note(560, 332, '키 한 쌍이면 계정 전체가 열린다', fade(u, 2.2), { fill: BAD }); return; }
    if (k === 2) { [96, 144, 192, 216].forEach((y, i) => key(470, y, i < 2 ? 1 : pop(u, 0.6 + (i - 2) * 0.3)));
      const r = lerp(60, 150, E(u, 0.8, 2.0)); el('circle', { cx: 760, cy: 190, r: 70, fill: SOFT, stroke: GRID, 'stroke-width': 2 }); tx(760, 196, '회사 계정', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      el('circle', { cx: 760, cy: 190, r, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8) });
      chip(640, 340, '저장소 권한', BAD, pop(u, 1.5)); chip(850, 340, '결제 API', BAD, pop(u, 1.8)); return; }
    if (k === 3) { // 다섯 갈래로 새는 사본
      const dst = [['git 커밋', 620, 70], ['Slack · 메일 첨부', 820, 120], ['plan 출력 · CI 로그', 620, 190], ['terraform.tfstate', 820, 250], ['git 이력 (지우기 어렵다)', 680, 320]];
      dst.forEach(([s, x, y], i) => { const a = 0.2 + i * 0.35; dot([[494, 130], [x - 70, y]], seg(u, a, a + 0.6), BAD, 6);
        card(x, y, tw(s, 14) + 60, 40, { rx: 20, stroke: BAD, sw: 2, s: pop(u, a + 0.5), fill: BADBG }); if (u > a + 0.7) { key(x - tw(s, 14) / 2 - 8, y, 0.8); tx(x + 14, y + 5, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); } });
      note(24, 300, '사본이 5곳에 생긴다', fade(u, 2.2), { fill: BAD }); return; }
    // k === 4: .gitignore 는 과거를 못 지운다
    const X = (i) => 120 + i * 180; grow(80, 330, 900, 330, E(u, 0.1, 0.6), MUT, { plain: true });
    [['c1', 'tfvars 커밋', BAD], ['c2', '기능 추가', INK], ['c3', '.gitignore 추가', GOOD], ['c4', '…', INK]].forEach(([id, s, col], i) => { const sc = pop(u, 0.3 + i * 0.3);
      el('circle', { cx: X(i), cy: 330, r: 14 * sc, fill: col === BAD ? BAD : col === GOOD ? GOOD : PANEL, stroke: col, 'stroke-width': 2.5 });
      if (sc > 0.6) { mono(X(i), 362, id, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); tx(X(i), 388, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col }); } });
    el('path', { d: `M${X(0)},314 C${X(0)},270 ${X(3)},270 ${X(3)},314`, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 1.8) });
    chip(X(1.5), 266, 'c1 안의 tfvars는 그대로 남는다', BAD, pop(u, 2.0), { mono: false, fs: 14 });
    note(560, 236, 'ignore는 아직 추적 안 된 파일에만 듣는다', fade(u, 2.3)); }

  // ================= 2. 환경변수 =================
  function s2(t, c) { const { k, u } = c, prevStars = k === 0 ? 5 : [2, 3, 1, 2, 3][k - 1];
    stars([2, 3, 1, 2, 2, 3][k], prevStars, u);
    if (k === 0) { fileCard(24, 60, 430, 'variables.tf', [{ s: 'variable "db_password" {' }, { s: '  type      = string' }, { s: '  sensitive = true', hi: 'good', op: fade(u, 0.6) }, { s: '}' }]);
      key(560, 120, 1 - seg(u, 1.0, 1.6), BAD); if (u > 1.6) cross(560, 120, 12, pop(u, 1.6));
      note(24, 260, '파일에는 선언만 있고 값이 없다', fade(u, 1.8)); note(24, 292, '그래서 이 파일은 더 이상 비밀 파일이 아니다', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 1) { zone(24, 60, 430, 150, '셸 프로세스 환경', { fill: SOFT, stroke: GRID, sw: 1.5 });
      mono(44, 112, 'TF_VAR_db_password', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(44, 142, '= "P@ss123!"', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.4) }); key(420, 110, pop(u, 0.5), WARN);
      grow(460, 120, 600, 120, E(u, 0.9, 1.5), ACC); mono(530, 108, '접두사 떼기', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      card(740, 120, 260, 70, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 1.4), text: 'var.db_password', fs: 16, mono: true, color: ACC, fill: ACCBG });
      note(24, 270, '값은 이 셸 프로세스 안에만 있다', fade(u, 1.8)); note(24, 302, 'git에는 남지 않는다', fade(u, 2.2), { fill: GOOD }); return; }
    if (k === 2) { terminal(24, 60, 620, 170, ['$ terraform plan', '  + resource "aws_db_instance" "main" {', ['      + password = (sensitive value)', '#4ade80'], '    }'], 4 * E(u, 0.2, 1.8), { title: 'plan 출력 (예시)' });
      chip(780, 110, '-var 옵션 불필요', GOOD, pop(u, 1.2)); chip(780, 170, '-var="…" 는 ps 목록에 보인다', BAD, pop(u, 1.7), { mono: false });
      note(24, 290, 'sensitive 덕분에 plan 출력에는 값 대신 (sensitive value)', fade(u, 2.1)); return; }
    if (k === 3) { // direnv: 디렉터리 안에서만 값이 있다
      zone(300, 60, 360, 210, 'project/ (.envrc · gitignore 대상)', { fill: GOODBG, stroke: GOOD, sw: 2 });
      const p = E(u, 0.2, 1.2) - E(u, 1.6, 2.5), x = lerp(150, 480, clamp(p));
      person(x, 170, null, {}); const inside = x > 320;
      mono(x, 230, inside ? 'TF_VAR_… 로드됨' : '값 없음', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: inside ? GOOD : MUT });
      if (inside) key(x + 40, 140, 1, WARN);
      note(700, 140, 'cd로 들어가면 로드', fade(u, 0.8)); note(700, 172, '나오면 자동 unset', fade(u, 1.8));
      note(300, 330, '값이 사는 범위를 디렉터리 하나로 줄인다', fade(u, 2.2)); return; }
    if (k === 4) { card(150, 140, 220, 90, { rx: 12, stroke: INFO, sw: 2.2, fill: INFOBG, text: 'GitHub\nsecrets', fs: 16, color: INFO }); lock(150, 82, true, INFO, 0.9);
      fly(260, 140, 420, 140, seg(u, 0.3, 1.0), 'DB_PASSWORD', { mono: true, fill: INFO });
      card(540, 140, 250, 70, { rx: 12, stroke: INK, sw: 2, text: 'env:\nTF_VAR_db_password', fs: 14.5, mono: true, s: pop(u, 0.9) });
      terminal(24, 240, 600, 120, ['$ terraform apply -auto-approve', ['  TF_VAR_db_password: ***', '#4ade80']], 2 * E(u, 1.3, 2.2), { title: 'Actions 로그' });
      chip(800, 300, '로그에서 *** 로 가린다', GOOD, pop(u, 2.0), { mono: false }); return; }
    // k === 5: 남는 위험
    terminal(24, 60, 520, 130, ['$ history | tail -1', ['  512  export TF_VAR_db_password="P@ss123!"', '#f87171']], 2 * E(u, 0.2, 1.0), { title: '~/.bash_history' });
    key(520, 140, pop(u, 1.0));
    [['/proc/<pid>/environ', '같은 계정 · root는 읽을 수 있다'], ['키 회전', '사람이 손으로'], ['감사 로그', '누가 언제 썼는지 모른다']].forEach(([a, b], i) => {
      const y = 240 + i * 50, s = pop(u, 1.2 + i * 0.35); chip(150, y, a, BAD, s); tx(290, y + 5, b, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.3 + i * 0.35) }); });
    chip(800, 120, '진짜 비밀 저장소로', ACC, pop(u, 2.3), { mono: false }); }

  // ================= 3. Vault =================
  function vaultBox(cx, cy, s, o) { o = o || {}; card(cx, cy, 230, 150, { rx: 14, stroke: INK, sw: 2.6, s, fill: PANEL });
    if (s < 0.6) return; lock(cx, cy - 40, true, INK, 1.1); lbl(cx, cy + 6, 'Vault', 1, { 'font-size': 18 });
    if (o.sub) mono(cx, cy + 34, o.sub, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function s3(t, c) { const { k, u } = c;
    stars(k === 5 ? 3 : 1, k === 0 ? 3 : k === 5 ? 1 : 1, u);
    if (k === 0) { card(170, 170, 200, 90, { rx: 12, stroke: ACC, sw: 2.4, text: 'Terraform', fs: 18, color: ACC, s: pop(u, 0.2) });
      vaultBox(760, 170, pop(u, 0.6), { sub: 'hashicorp/vault' }); grow(272, 170, 640, 170, E(u, 1.0, 1.6), ACC);
      chip(460, 140, 'required_providers · vault ~> 5.0', ACC, pop(u, 1.4));
      note(480, 330, 'provider 하나로 Vault가 또 하나의 data source가 된다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { fileCard(24, 50, 440, 'vault.tf', [{ s: 'provider "vault" {' }, { s: '  # address = 환경변수 권장', col: MUT }, { s: '  # token   = 환경변수 권장', col: MUT }, { s: '}' }]);
      [['VAULT_ADDR', 0.5], ['VAULT_TOKEN', 0.9]].forEach(([s, a], i) => fly(560, 260 + i * 50, 300, 120 + i * 24, seg(u, a, a + 0.8), s, { mono: true, fill: INFO }));
      vaultBox(780, 170, 1, {}); chip(250, 300, '코드 안 비밀 0건', GOOD, pop(u, 1.9), { mono: false }); return; }
    if (k === 2) { vaultBox(150, 170, 1, { sub: 'KV v2' });
      const tree = [['secret/', 290, 90], ['data/', 340, 140], ['prod/db', 390, 190]]; tree.forEach(([s, x, y], i) => { mono(x, y, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) }); if (i) el('path', { d: `M${x - 36},${y - 44} V${y - 6} H${x - 6}`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: fade(u, 0.2 + i * 0.3) }); });
      card(470, 260, 220, 80, { rx: 10, stroke: INK, sw: 1.8, s: pop(u, 1.1) }); if (u > 1.3) { mono(380, 250, 'username', { 'font-size': 14 }); mono(380, 278, 'password', { 'font-size': 14 }); key(540, 274, 0.8, WARN); }
      grow(590, 230, 700, 150, E(u, 1.6, 2.1), ACC); chip(800, 130, 'data.vault_kv_secret_v2.db', ACC, pop(u, 2.0)); return; }
    if (k === 3) { chip(200, 90, 'data.vault_kv_secret_v2.db', ACC, 1);
      fly(200, 110, 640, 160, seg(u, 0.3, 1.2), 'data["password"]', { mono: true, fill: ACC, stay: true });
      dbIcon(780, 170, 'aws_db_instance.main', { s: pop(u, 0.2) });
      zone(24, 260, 600, 110, null, { fill: WARNBG, op: fade(u, 1.5) });
      note(44, 296, '코드에는 "어디서 가져올지"만 있다', fade(u, 1.6)); note(44, 330, '그래도 받은 값은 state에 기록된다. state 보호는 따로', fade(u, 2.0), { fill: WARN });
      key(600, 310, pop(u, 2.2), WARN); return; }
    if (k === 4) { vaultBox(150, 170, 1, { sub: 'database 엔진' });
      const life = E(u, 0.3, 2.4); card(470, 120, 220, 54, { rx: 10, stroke: ACC, sw: 2.2, s: pop(u, 0.3), text: 'v-app-readonly-…', fs: 14.5, mono: true, color: ACC, op: 1 - 0.7 * seg(u, 2.2, 2.6) });
      clock(470, 240, 36, life, WARN, 'TTL'); if (u > 2.4) cross(470, 120, 14, pop(u, 2.4));
      grow(270, 150, 360, 130, E(u, 0.2, 0.5), ACC);
      note(600, 120, '실행할 때마다 새 DB 사용자', fade(u, 0.8)); note(600, 160, 'TTL이 지나면 Vault가 폐기', fade(u, 1.6));
      chip(720, 250, 'ephemeral · state에 안 남음', GOOD, pop(u, 2.0), { mono: false }); note(600, 330, 'Terraform 1.10+ · vault provider 5.0+', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    // k === 5: 감사 로그와 운영 부담
    terminal(24, 50, 470, 150, ['audit: 02:13 ci-deploy read secret/data/prod/db', 'audit: 09:41 alice  read secret/data/prod/db', 'audit: 10:05 bob    update secret/data/prod/db'], 3 * E(u, 0.2, 1.4), { title: 'Vault 감사 로그 (예시)' });
    [0, 1, 2].forEach((i) => server(600 + i * 130, 120, i === 0 ? 'leader' : 'follower', { s: 0.6 * pop(u, 1.0 + i * 0.2), lamp: GOOD }));
    tx(730, 230, 'HA (Raft) 클러스터', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    [0, 1, 2].forEach((i) => key(600 + i * 130, 290, pop(u, 1.8 + i * 0.15), WARN)); tx(730, 330, 'unseal 키 조각 관리', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) });
    note(24, 270, '감사 · 회전 · TTL은 강력하다', fade(u, 1.5), { fill: GOOD }); note(24, 302, '대신 Vault 서버 자체를 운영해야 한다', fade(u, 2.1), { fill: WARN }); }

  // ================= 4. SOPS =================
  const ENC = 'ENC[AES256_GCM,data:…]';
  function s4(t, c) { const { k, u } = c;
    stars(k === 1 ? 4 : k >= 2 ? 2 : 1, k === 0 ? 3 : k === 1 ? 1 : k === 2 ? 4 : 2, u);
    if (k === 0) { fileCard(24, 50, 520, '.sops.yaml (git 커밋 OK)', [{ s: 'creation_rules:' }, { s: '  - path_regex: \\.enc\\.yaml$', hi: 'acc' }, { s: '    kms: arn:aws:kms:…:key/abc-123', hi: 'acc', op: fade(u, 0.4) }]);
      [['secrets.enc.yaml', true], ['config.yaml', false]].forEach(([f, ok], i) => { const y = 250 + i * 56; chip(160, y, f, ok ? ACC : MUT, pop(u, 0.8 + i * 0.4));
        if (ok) check(300, y, 10, pop(u, 1.3)); else cross(300, y, 9, pop(u, 1.7)); });
      note(400, 268, '규칙과 키 ARN만 있다', fade(u, 1.9)); note(400, 300, 'ARN은 키를 가리킬 뿐 키 자체가 아니다', fade(u, 2.2), { fill: MUT }); return; }
    const rows = (enc) => [{ s: 'db_password: ' + (enc ? ENC : '"P@ss123!"'), hi: enc ? 'good' : 'bad' }, { s: 'aws_access_key: ' + (enc ? ENC : '"AKIA…"'), hi: enc ? 'good' : 'bad' }];
    if (k === 1) { fileCard(24, 50, 560, 'secrets.enc.yaml (아직 평문)', rows(false), { stroke: BAD });
      key(560, 100, 1); terminal(24, 200, 560, 90, ['$ sops -e -i secrets.enc.yaml'], E(u, 0.6, 1.6), { title: 'shell' });
      note(24, 330, '쓰자마자 암호화한다. 암호화 전 커밋이 가장 흔한 사고다', fade(u, 1.9), { fill: BAD }); return; }
    if (k === 2) { const g = seg(u, 0.4, 1.4); fileCard(24, 50, 560, 'secrets.enc.yaml', rows(g >= 0.5).concat([{ s: 'sops:', op: fade(u, 1.5) }, { s: '  kms: - arn: arn:aws:kms:…:key/abc-123', col: MUT, op: fade(u, 1.7) }]), { stroke: g >= 0.5 ? GOOD : BAD });
      if (g > 0 && g < 1) el('rect', { x: 200, y: 84, width: 370 * g, height: 48, fill: ACC, opacity: 0.25 });
      note(620, 110, '키 이름은 그대로', fade(u, 1.6)); note(620, 142, '값만 AES256-GCM 암호문', fade(u, 1.9)); note(620, 190, 'diff로 어떤 키가 늘었는지는 보인다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 3) { fileCard(24, 50, 560, 'providers.tf', [{ s: 'sops = { source  = "carlpett/sops"' }, { s: '         version = "~> 1.0" }', hi: 'acc' }]);
      card(760, 120, 220, 80, { rx: 12, stroke: ACC, sw: 2.4, text: 'sops provider\n복호화 담당', fs: 15, color: ACC, s: pop(u, 0.8), fill: ACCBG });
      note(24, 230, '개발자가 sops -d를 직접 칠 일이 없다', fade(u, 1.6)); return; }
    if (k === 4) { chip(130, 120, 'secrets.enc.yaml', GOOD, 1); grow(220, 120, 340, 120, E(u, 0.2, 0.6), MUT);
      card(430, 120, 160, 70, { rx: 12, stroke: WARN, sw: 2.2, text: 'AWS KMS', fs: 16, s: pop(u, 0.4) }); lock(430, 70, u < 1.0, WARN, pop(u, 0.5));
      grow(510, 120, 620, 120, E(u, 1.0, 1.4), ACC); fly(620, 120, 800, 120, seg(u, 1.3, 2.0), 'data["db_password"]', { mono: true, fill: ACC, stay: true });
      dbIcon(810, 250, 'aws_db_instance.main', { s: pop(u, 1.9) });
      note(24, 260, 'KMS 복호화 권한이 없으면 plan도 못 돈다', fade(u, 2.1)); note(24, 292, '권한이 곧 접근 제어다', fade(u, 2.3), { fill: ACC }); return; }
    if (k === 5) { card(150, 140, 220, 80, { rx: 12, stroke: INK, sw: 2.2, text: 'GitHub Actions', fs: 16 });
      fly(260, 140, 410, 140, seg(u, 0.3, 1.0), 'OIDC', { fill: ACC }); card(500, 140, 170, 80, { rx: 12, stroke: ACC, sw: 2.4, text: 'role/ci-deploy', fs: 15, mono: true, color: ACC, s: pop(u, 0.9) });
      grow(586, 140, 680, 140, E(u, 1.2, 1.6), ACC); card(770, 140, 160, 80, { rx: 12, stroke: WARN, sw: 2.2, text: 'kms:Decrypt', fs: 15, mono: true, s: pop(u, 1.5) });
      chip(480, 270, 'CI에 넣은 시크릿 0개', GOOD, pop(u, 2.0), { mono: false, fs: 15 }); return; }
    // k === 6
    [['Vault 서버 운영', '필요 없음', GOOD], ['리뷰', 'diff로 키 추가가 보인다', GOOD], ['로컬 개발', 'KMS 권한만 있으면 같다', GOOD], ['키 관리', 'KMS 권한 설계가 전부', WARN]].forEach(([a, b, col], i) => {
      const y = 80 + i * 70, s = pop(u, 0.2 + i * 0.35); card(480, y, 640, 54, { rx: 12, stroke: col, sw: 2, s });
      if (s > 0.6) { tx(190, y + 6, a, { 'font-size': 16, 'font-weight': 700 }); tx(780, y + 6, b, { 'font-size': 15, fill: col, 'font-weight': 700, 'text-anchor': 'end' }); } });
    chip(480, 380, 'AWS 안이라면 더 쉬운 길', ACC, pop(u, 2.0), { mono: false }); }

  // ================= 5. AWS Secrets Manager =================
  function smBox(cx, cy, versions, o) { o = o || {}; card(cx, cy, 300, 200, { rx: 14, stroke: INK, sw: 2.4, s: o.s ?? 1 });
    if ((o.s ?? 1) < 0.6) return; mono(cx - 136, cy - 74, 'prod/db/master', { 'font-size': 15, 'font-weight': 800 }); tx(cx + 136, cy - 74, 'Secrets Manager', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    versions.forEach(([v, s, cur], i) => { if (s <= 0) return; const y = cy - 30 + i * 44; card(cx, y, 260, 36, { rx: 8, stroke: cur ? ACC : GRID, sw: 2, s, fill: cur ? ACCBG : PANEL });
      if (s > 0.6) { mono(cx - 118, y + 5, v, { 'font-size': 14, 'font-weight': 700 }); if (cur) mono(cx + 118, y + 5, 'AWSCURRENT', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end', 'font-weight': 700 }); } }); }
  function s5(t, c) { const { k, u } = c;
    stars(1, 1, u);
    if (k === 0) { smBox(200, 170, [], { s: pop(u, 0.2) }); mono(200, 190, '(값 없음)', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      chip(560, 110, 'kms_key_id = aws_kms_key.secrets.id', WARN, pop(u, 0.8)); chip(560, 170, 'recovery_window_in_days = 7', INK, pop(u, 1.2));
      note(420, 260, '그릇부터 만들고 이름을 먼저 설계한다', fade(u, 1.8)); return; }
    if (k === 1) { smBox(200, 170, [['v1 · JSON', pop(u, 0.4), true]]);
      chip(600, 110, 'jsonencode({ username, password })', ACC, pop(u, 0.2)); grow(470, 120, 360, 150, E(u, 0.3, 0.7), ACC);
      note(420, 260, '값은 버전으로 쌓인다. 덮어써도 이전 버전이 남는다', fade(u, 1.6)); return; }
    if (k === 2) { const n = Math.round(32 * E(u, 0.2, 1.6)), CH = 'aZ8#k2Qv!m0Rt7=Lp4(wX9_e3Yj6+Hc1)';
      for (let i = 0; i < 32; i++) { const x = 40 + (i % 16) * 56, y = 70 + Math.floor(i / 16) * 56;
        card(x + 24, y, 48, 44, { rx: 6, stroke: i < n ? ACC : GRID, sw: 1.6, text: i < n ? CH[i] : '', fs: 15, mono: true, color: ACC }); }
      mono(40, 196, `length = ${n} / 32`, { 'font-size': 16, 'font-weight': 800, fill: ACC });
      note(40, 250, '사람이 고른 비밀번호가 코드에 나올 일이 없다', fade(u, 1.7));
      chip(250, 300, 'override_special: / @ " 공백 제외', WARN, pop(u, 2.0), { mono: false }); note(500, 306, 'RDS 비밀번호가 받지 않는 문자', fade(u, 2.2), { fill: MUT, 'font-size': 14 }); return; }
    if (k === 3) { smBox(200, 170, [['v1 · JSON', 1, true]]);
      card(560, 170, 140, 80, { rx: 12, stroke: WARN, sw: 2.2, text: 'IAM\n권한', fs: 15, s: pop(u, 0.4) });
      card(800, 170, 200, 80, { rx: 12, stroke: INK, sw: 2, text: '사용하는 쪽 코드', fs: 15, s: pop(u, 0.2) });
      fly(700, 120, 360, 120, seg(u, 0.6, 1.4), 'name = "prod/db/master"', { mono: true, fill: INK });
      note(420, 320, '만든 쪽과 쓰는 쪽을 나눠 권한도 따로 준다', fade(u, 1.8)); return; }
    if (k === 4) { mono(40, 90, 'secret_string', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.1) });
      chip(260, 130, '"{\\"username\\":\\"admin\\",\\"password\\":\\"…\\"}"', INK, pop(u, 0.2));
      grow(260, 160, 260, 220, E(u, 0.6, 1.0), ACC); mono(280, 196, 'jsondecode', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
      card(260, 290, 330, 100, { rx: 10, stroke: ACC, sw: 2.2, s: pop(u, 1.1) });
      if (u > 1.3) { mono(110, 278, 'local.db_creds.username', { 'font-size': 14.5 }); mono(110, 310, 'local.db_creds.password', { 'font-size': 14.5 }); }
      note(500, 280, 'locals에서 한 번 풀고 여러 곳에서 쓴다', fade(u, 1.7)); note(500, 312, 'JSON 하나로 묶으면 secret 수가 준다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 5) { card(200, 170, 300, 100, { rx: 10, stroke: ACC, sw: 2.2 }); mono(70, 160, 'local.db_creds.username', { 'font-size': 14.5 }); mono(70, 192, 'local.db_creds.password', { 'font-size': 14.5 });
      fly(350, 170, 640, 170, seg(u, 0.3, 1.2), 'username · password', { fill: ACC });
      dbIcon(760, 170, 'aws_db_instance.main', { s: pop(u, 1.0) });
      note(200, 320, '코드 어디에도 값이 적히지 않는다', fade(u, 1.8)); return; }
    if (k === 6) { const X = (d) => 90 + d * 25; grow(X(0), 300, X(32), 300, E(u, 0.1, 0.5), MUT, { plain: true });
      [0, 30].forEach((d, i) => { el('line', { x1: X(d), y1: 290, x2: X(d), y2: 310, stroke: INK, 'stroke-width': 2 }); mono(X(d), 334, `${d}일`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
      const sw = seg(u, 0.6, 1.8); dot([[X(0), 300], [X(30), 300]], sw < 1 ? sw : 0.999, ACC, 8);
      smBox(480, 140, [['v1', 1, sw < 1], ['v2 (회전)', pop(u, 1.8), sw >= 1]]);
      chip(780, 262, 'automatically_after_days = 30', ACC, pop(u, 0.4)); note(90, 390, 'rotation Lambda가 새 비밀번호를 만들고 RDS도 같이 바꾼다', fade(u, 2.1)); return; }
    // k === 7: 대가
    [['secret 하나', '월 $0.40'], ['API 호출', '호출당 과금'], ['이식성', 'AWS 밖으로는 못 간다']].forEach(([a, b], i) => {
      const y = 80 + i * 64, s = pop(u, 0.2 + i * 0.3); card(250, y, 420, 50, { rx: 10, stroke: i === 2 ? WARN : INK, sw: 2, s });
      if (s > 0.6) { tx(60, y + 6, a, { 'font-size': 15.5, 'font-weight': 700 }); mono(440, y + 6, b, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: i === 2 ? WARN : INK }); } });
    terminal(500, 50, 436, 160, ['GetSecretValue  role/ci-deploy', 'GetSecretValue  user/alice', 'PutSecretValue  rotation-lambda'], 3 * E(u, 0.8, 1.8), { title: 'CloudTrail (예시)' });
    note(60, 300, 'IAM · 회전 · 감사를 직접 만드는 것보다 싸다', fade(u, 2.0)); }

  const quiz = [
    { q: 'terraform.tfvars를 커밋한 뒤 .gitignore에 *.tfvars를 추가했다. 이미 커밋된 비밀은 어떻게 되는가?',
      o: ['git 이력에 그대로 남는다', '다음 커밋부터 이력에서 사라진다', 'GitHub이 자동으로 지운다'], a: 0,
      why: 'ignore 규칙은 아직 추적하지 않는 파일에만 듣는다. 이미 들어간 커밋 c1 안의 값은 이력에 그대로 있다.' },
    { q: 'export TF_VAR_db_password="…"로 넣은 값은 Terraform 안에서 무엇이 되는가?',
      o: ['var.TF_VAR_db_password', 'var.db_password', 'local.db_password'], a: 1,
      why: 'Terraform은 TF_VAR_ 접두사를 떼고 같은 이름의 variable에 값을 넣는다. sensitive = true면 plan 출력에서도 가려진다.' },
    { q: 'Vault KV v2에서 data source로 읽은 비밀번호에 대해 맞는 것은 무엇인가?',
      o: ['state에도 값이 기록된다', '메모리에서만 쓰이고 어디에도 남지 않는다', 'Vault가 매번 새 비밀번호를 만든다'], a: 0,
      why: 'data source 결과와 그 값을 받은 리소스 속성은 state에 들어간다. 그래서 Vault를 써도 state 보호는 따로 해야 한다.' },
    { q: 'SOPS로 암호화한 secrets.enc.yaml에서 평문으로 남는 것은 무엇인가?',
      o: ['값', '키 이름', 'KMS 키 자체'], a: 1,
      why: 'SOPS는 키 이름은 두고 값만 ENC[AES256_GCM,…]로 바꾼다. 그래서 diff로 어떤 키가 늘었는지는 볼 수 있다.' },
    { q: 'Secrets Manager 비밀번호를 random_password로 만들 때 RDS 때문에 챙겨야 할 것은 무엇인가?',
      o: ['length를 8 이하로', 'override_special로 / @ " 공백을 빼기', 'special = false로 특수문자를 모두 끄기'], a: 1,
      why: 'random_password의 기본 특수문자에는 @가 있고 RDS는 / @ " 공백을 비밀번호로 받지 않는다. 필요한 문자만 override_special로 준다.' },
  ];

  const summary = [
    '평문 tfvars는 git, Slack, CI 로그, state까지 비밀 사본을 남긴다.',
    'TF_VAR_ 환경변수는 git 사고를 막지만 셸 히스토리와 프로세스 환경에 값이 남는다.',
    'Vault, SOPS, Secrets Manager는 값을 코드 밖에 두고 권한과 감사 기록으로 관리한다.',
    '어느 방식이든 받은 값은 state에 들어가므로 state 보호는 따로 해야 한다.',
  ];
  const review = [
    { q: 'CI 로그에는 ***로 가려졌는데 같은 비밀번호가 S3에 있는 terraform.tfstate에서 평문으로 발견됐다. 무엇 때문인가?',
      o: ['GitHub Actions 마스킹이 실패해서', '리소스에 넣은 값이 state에 기록되어서', 'SOPS 암호화가 풀려서'], a: 1,
      why: '마스킹은 로그 출력만 가린다. 리소스 속성으로 들어간 비밀번호는 state에 남으므로 state 저장소의 암호화와 권한을 따로 챙긴다.' },
    { q: 'Vault 서버를 운영할 사람이 없는 5명 팀이 AWS에서 비밀을 git으로 리뷰하며 관리하고 싶다. 먼저 고를 방식은?',
      o: ['SOPS + AWS KMS', 'HashiCorp Vault HA 클러스터', '평문 tfvars + .gitignore'], a: 0,
      why: 'SOPS는 서버 없이 암호문을 git에 커밋하고 KMS 권한으로 복호화한다. diff로 키 추가도 리뷰할 수 있다.' },
    { q: '퇴사자가 예전에 본 DB 비밀번호가 아직 유효한지 걱정된다. 이 위험을 가장 직접 줄이는 기능은?',
      o: ['sensitive = true', '자동 회전이나 TTL이 있는 동적 자격 증명', 'direnv'], a: 1,
      why: 'Secrets Manager 회전(30일)이나 Vault 동적 자격 증명은 값의 수명을 줄인다. sensitive와 direnv는 노출 경로만 줄인다.' },
  ];

  R.page({ title: '비밀은 어디에 남는가', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
