/* II-1-2 AWS secret engine — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 끝없이 사는 AKIA 키와 그 복제본, Vault 금고 안의 마스터 자격, 동작×버킷 권한 칸,
 *       lease 동안만 사는 IAM 사용자, renew·revoke 가 방식마다 다르게 듣는 두 줄 시간선.
 * 키 값은 페이지 코드의 예시 값(AKIAIOSFODNN7EXAMPLE 등)이고, 1h·6h·vGZ8k 는 페이지 코드에서 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, G, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    server, person, cross, check, lock, clock, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  function vault(cx, cy, w, h, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 }, g);
    const dx = -w / 2 + 26, dy = -h / 2 + 26;
    el('circle', { cx: dx, cy: dy, r: 13, fill: PANEL, stroke: ACC, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + (o.spin || 0); el('line', { x1: dx, y1: dy, x2: dx + Math.cos(a) * 9, y2: dy + Math.sin(a) * 9, stroke: ACC, 'stroke-width': 2 }, g); }
    tx(dx + 22, dy + 6, 'Vault', { 'font-size': 17, 'font-weight': 800, fill: ACC }, g); return g; }
  // AWS 쪽 판: 위에 이름 띠
  function aws(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || WARNBG, stroke: WARN, 'stroke-width': 2, opacity: o.op ?? 1 });
    tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: o.op ?? 1 }); }
  function cmd(x, y, s, u, o) { o = o || {}; const w = o.w || tw('$ ' + s, 14) + 28; el('rect', { x, y: y - 20, width: w, height: 30, rx: 7, fill: INK });
    mono(x + 12, y, '$ ' + s.slice(0, Math.round(s.length * clamp(u ?? 1))), { 'font-size': 14, fill: PANEL }); }
  // 키 카드: 이름표 + 값
  function keyCard(x, y, label, val, col, o) { o = o || {}; const w = o.w || 300, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: 52, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    tx(x + 12, y + 20, label, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
    mono(x + 12, y + 42, val, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op, 'text-decoration': o.gone ? 'line-through' : null }); }
  // 흉내 글자: 같은 t 면 같은 글자 (rotate-root 장면)
  const SC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const scramble = (s, t, done) => [...s].map((ch, i) => (i < 4 || i < done * s.length ? ch : SC[(Math.floor(t * 20) * 7 + i * 13) % SC.length])).join('');

  // ---------- 1. 장기 키 ----------
  function s1(t, c) { const { k, u } = c;
    const life = k === 0 ? E(u, 0.8, 2.2) : 1;
    keyCard(40, 40, 'AWS_ACCESS_KEY_ID (장기 키)', 'AKIAIOSFODNN7EXAMPLE', BAD, { op: k === 0 ? fade(u, 0.2) : 1 });
    if (k <= 1) { // 수명선: 끝이 없다
      grow(350, 66, lerp(350, 860, life), 66, life > 0 ? 1 : 0, BAD, { plain: true, sw: 4 });
      tx(880, 74, '∞', { 'font-size': 30, 'font-weight': 800, fill: BAD, opacity: fade(u, k === 0 ? 2.0 : 0) });
      tx(560, 52, '사람이 지우기 전까지 유효', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: k === 0 ? fade(u, 1.4) : 1 }); }
    if (k === 0) { tx(40, 140, 'export 한 줄로 앱 설정에 심는다', { 'font-size': 15, opacity: fade(u, 1.0) }); return; }
    if (k === 1) { const D = [['CI 변수', 'secrets.AWS_SECRET', 180], ['이미지 레이어', 'docker build -t app .', 480], ['git 히스토리', 'git grep AKIA', 780]];
      D.forEach(([n, s, x], i) => { const at = 0.3 + i * 0.5;
        fly(190, 92, x, 196, seg(u, at, at + 0.6), 'AKIA…', { fill: BAD, mono: true });
        const op = fade(u, at + 0.6); card(x, 230, 250, 80, { rx: 10, stroke: BAD, sw: 2, op, fill: BADBG });
        tx(x, 220, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: op }); mono(x, 246, s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); });
      tx(480, 330, '한 번 심은 키는 복사본이 계속 남는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { // 며칠간 쓰이는데 언제 샜는지 모른다
      const days = ['월', '화', '수', '목', '금', '토', '일'];
      days.forEach((d, i) => { const x = 120 + i * 104, op = fade(u, 0.2 + i * 0.15);
        el('rect', { x: x - 44, y: 140, width: 88, height: 110, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
        tx(x, 164, d, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: op });
        for (let j = 0; j < 3; j++) { const s = pop(u, 0.9 + i * 0.18 + j * 0.06); el('circle', { cx: x - 22 + j * 22, cy: 200 + (j % 2) * 22, r: 7 * s, fill: BAD }); } });
      person(860, 330, '공격자', { stroke: BAD });
      tx(120, 290, 'S3·EC2 호출이 며칠째 이어진다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(120, 318, '언제 샜는지, 누가 쓰는지 알 수 없다', { 'font-size': 15, opacity: fade(u, 2.1) });
      tx(120, 360, '회수 = 키 삭제 + 전 서비스 재배포', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 3) { // 과권한: 서비스 칸 전부 켜짐
      const S = ['S3', 'EC2', 'IAM', 'RDS', 'Lambda', 'DynamoDB', 'KMS', 'CloudTrail'];
      tx(40, 150, 'AdministratorAccess', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: BAD, opacity: fade(u, 0.2) });
      S.forEach((n, i) => { const x = 120 + (i % 4) * 200, y = 210 + Math.floor(i / 4) * 80, s = pop(u, 0.4 + i * 0.12);
        card(x, y, 170, 56, { rx: 8, text: n, fs: 16, mono: true, stroke: BAD, fill: BADBG, color: BAD, s }); });
      el('rect', { x: 28, y: 175, width: 184, height: 70, rx: 12, fill: 'none', stroke: GOOD, 'stroke-width': 3.5, 'stroke-dasharray': '7 5', opacity: fade(u, 1.8) });
      tx(120, 380, '앱에 필요한 건 S3 하나뿐', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
      tx(560, 380, '유출되면 계정 전체가 열린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
    // k4: 필요한 것: 요청할 때만, 최소 권한, 짧게
    [['요청할 때만', 'vault read aws/creds/…'], ['최소 권한', 'S3 읽기만'], ['짧게', 'lease 1h']].forEach(([a, b], i) => { const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.4);
      card(x, 220, 260, 110, { rx: 12, stroke: GOOD, sw: 2.5, fill: GOODBG, s });
      tx(x, 210, a, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: GOOD, opacity: s }); mono(x, 242, b, { 'text-anchor': 'middle', 'font-size': 14, opacity: s }); });
    clock(790, 120, 18, 1 - E(u, 1.4, 2.8) * 0.3, WARN);
    banner(480, 350, 'Vault AWS secret engine', pop(u, 1.9)); }

  // ---------- 2. 엔진 설정 ----------
  const VX = 230, VY = 220;
  function s2(t, c) { const { k, u } = c;
    vault(VX, VY, 300, 260, { spin: k === 0 ? E(u, 0.2, 1.4) * 2 : 2 });
    if (k !== 3) aws(640, 110, 290, 220, 'AWS IAM');
    pill(VX, VY - 76, 'aws/', ACC, k === 0 ? pop(u, 1.1) : 1, { mono: true, fs: 15 });
    if (k === 0) { cmd(40, 40, 'vault secrets enable aws', E(u, 0.1, 0.9));
      sub(VX, VY - 20, '임시 키를 만들 자격이 아직 없다', fade(u, 1.6)); return; }
    const root = (o) => { o = o || {};
      ['access_key', 'secret_key', 'region'].forEach((n, i) => { const op = o.op ? o.op[i] : 1;
        mono(VX - 135, VY - 22 + i * 34, n, { 'font-size': 14, fill: MUT, opacity: op });
        mono(VX - 30, VY - 22 + i * 34, [o.ak || 'AKIA_VAULT_…', '••••••••', 'ap-northeast-2'][i], { 'font-size': 14, 'font-weight': 700, fill: o.col && i < 2 ? o.col : INK, opacity: op }); });
      mono(VX - 135, VY - 48, 'config/root', { 'font-size': 14, 'font-weight': 800, fill: ACC }); };
    const linkU = k === 1 ? E(u, 1.4, 2.2) : 1;
    grow(VX + 150, VY + 40, 640, VY + 40, linkU, ACC);
    if (linkU > 0.9) { lock(510, VY + 16, true, ACC); tx(510, VY + 70, '마스터 자격', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC }); }
    if (k === 1) { root({ op: [fade(u, 0.2), fade(u, 0.5), fade(u, 0.8)] }); tx(785, 180, 'IAM 사용자·키를', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.8) }); tx(785, 204, '만들 권한만', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.8) });
      tx(40, 390, '이 키는 Vault 안에만 있고 앱에는 보이지 않는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const d = E(u, 0.6, 2.0); root({ ak: d >= 1 ? 'AKIA3ALIVA…' : scramble('AKIA3ALIVA…', t, d), col: GOOD });
      cmd(40, 40, 'vault write -f aws/config/rotate-root', E(u, 0.1, 0.6));
      mono(VX - 30, VY + 90, 'AKIA_VAULT_…', { 'font-size': 14, fill: OFF, 'text-decoration': 'line-through', opacity: 1 - fade(u, 1.8) });
      tx(785, 180, '옛 키 삭제', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      tx(785, 210, '새 키 쌍 발급', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      tx(40, 390, '새 secret_key는 Vault만 안다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    root();
    if (k === 3) { const ax = R.axes(520, 200, 400, 1, { x: [0, 6], y: [0, 1], xt: [0, 1, 2, 3, 4, 5, 6], xl: '' });
      el('rect', { x: ax.X(0), y: 124, width: (ax.X(1) - ax.X(0)) * E(u, 0.3, 1.0), height: 22, rx: 4, fill: ACC });
      mono(ax.X(1) + 8, 140, 'lease 1h', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      el('rect', { x: ax.X(0), y: 160, width: (ax.X(6) - ax.X(0)) * E(u, 1.0, 1.9), height: 22, rx: 4, fill: WARN, opacity: 0.45 });
      mono(ax.X(6), 110, 'lease_max 6h', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      cmd(40, 40, 'vault write aws/config/lease lease=1h lease_max=6h', E(u, 0.1, 0.8));
      return; }
    // k4: 발급기 완성
    server(90, 390 - 20, null, { s: 0.6, op: pop(u, 0.2) }); tx(150, 378, '앱', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
    grow(130, 352, VX - 40, VY + 130, E(u, 0.5, 1.1), INK);
    banner(640, 380, 'Vault = 임시 AWS 키 발급기', pop(u, 1.4));
    tx(785, 200, '앱은 마스터 키를', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.0) }); tx(785, 224, '볼 수 없다', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.0) }); }

  // ---------- 3. role + IAM policy ----------
  const ACT = ['s3:GetObject', 's3:ListBucket', 's3:PutObject', 's3:DeleteObject'], BUK = ['my-bucket', '다른 버킷 1', '다른 버킷 2'];
  function grid(x, y, st) { // st(r, c) → 0 모름 · 1 허용 · -1 거부
    BUK.forEach((b, j) => tx(x + 170 + j * 130 + 55, y - 10, b, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: j ? null : 'mono', fill: j ? MUT : INK }));
    ACT.forEach((a, i) => { mono(x, y + 30 + i * 52, a, { 'font-size': 14.5, 'font-weight': 700 });
      BUK.forEach((b, j) => { const v = st(i, j), cx = x + 170 + j * 130, cy = y + i * 52 + 6;
        el('rect', { x: cx, y: cy, width: 110, height: 42, rx: 6, fill: v > 0 ? GOODBG : v < 0 ? SOFT : PANEL, stroke: v > 0 ? GOOD : GRID, 'stroke-width': v > 0 ? 2 : 1.5 });
        if (v > 0) check(cx + 55, cy + 21, 9); else if (v < 0) cross(cx + 55, cy + 21, 7, 0.8); else tx(cx + 55, cy + 27, '?', { 'text-anchor': 'middle', 'font-size': 16, fill: OFF }); }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      const L = ['{ "Version": "2012-10-17",', '  "Statement": [{', '    "Sid": "AllowReadMyBucket",', '    "Effect": "Allow",', '    "Action": [ … ],', '    "Resource": [ … ] }]}'];
      el('rect', { x: 30, y: 40, width: 330, height: 190, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      L.forEach((s, i) => mono(44, 70 + i * 28, s, { 'font-size': 14, fill: i === 2 || i === 3 ? ACC : INK, 'font-weight': i === 2 || i === 3 ? 700 : 500, opacity: fade(u, 0.2 + i * 0.2) }));
      grid(410, 80, () => 0);
      tx(30, 290, 'Statement 안에 허용할 것만 적는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(30, 318, 'Sid는 목적을 남기는 이름', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { grid(410, 80, (i, j) => { const at = 0.3 + i * 0.35; return u < at ? 0 : i < 2 ? 1 : -1; });
      tx(30, 120, 'Action', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      mono(30, 152, 's3:GetObject', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); mono(30, 178, 's3:ListBucket', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
      tx(30, 230, '쓰기·삭제는 목록에 없다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const g = E(u, 0.4, 1.4); grid(410, 80, (i, j) => (i < 2 ? (j === 0 || g < 0.5 ? 1 : -1) : -1));
      tx(30, 120, 'Resource', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      mono(30, 152, 'arn:aws:s3:::my-bucket', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) }); mono(30, 178, 'arn:aws:s3:::my-bucket/*', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) });
      tx(30, 230, '허용 칸 12개 중 2개만 남는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k3: role 에 붙이기
    const s = pop(u, 0.2);
    card(250, 200, 420, 230, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s });
    mono(60, 112, 'aws/roles/my-role', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: s });
    [['credential_type', 'iam_user'], ['policy_document', 'my-role-policy.json'], ['수명', 'aws/config/lease → 1h']].forEach(([a, b], i) => {
      mono(60, 160 + i * 44, a, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.3) }); mono(210, 160 + i * 44, b, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.3) }); });
    fly(720, 200, 250, 290, seg(u, 0.9, 1.6), 'GetObject·ListBucket on my-bucket', { fill: GOOD, mono: true, stay: true });
    tx(700, 160, 'role이 곧 이 키로', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.8) });
    tx(700, 186, '할 수 있는 일의 전부', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    tx(250, 360, 'Action에 *를 넣으면 임시 키여도 위험하다', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // ---------- 4. creds 발급 ----------
  const AX = 90, AY = 110, QX = 420, QY = 110, IX = 650;
  function s4(t, c) { const { k, u } = c;
    server(AX, AY, 'app', { s: 0.8 });
    vault(QX, QY, 220, 140);
    mono(QX - 90, QY + 30, 'roles/my-role', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    aws(IX, 40, 280, 170, 'AWS IAM');
    const userOn = k === 0 ? 0 : k === 1 ? fade(u, 1.0) : 1, gone = k === 5 ? E(u, 1.6, 2.2) : 0;
    if (userOn > 0) { card(IX + 140, 110, 240, 44, { rx: 8, stroke: gone > 0.5 ? OFF : WARN, fill: PANEL, sw: 2, op: userOn });
      tx(IX + 32, 116, '새 IAM 사용자 (Vault가 만듦)', { 'font-size': 14, 'font-weight': 700, fill: gone > 0.5 ? OFF : INK, opacity: userOn, 'text-decoration': gone > 0.5 ? 'line-through' : null });
      mono(IX + 32, 160, '정책: my-role-policy', { 'font-size': 13.5, fill: gone > 0.5 ? OFF : MUT, opacity: userOn }); }
    // S3 버킷
    const bx = 790, by = 320; el('path', { d: `M${bx - 50},${by - 40} L${bx + 50},${by - 40} L${bx + 40},${by + 40} L${bx - 40},${by + 40} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    mono(bx, by + 6, 'my-bucket', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 }); mono(bx, by + 66, 'S3', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    if (k === 0) { pill(185, 26, 'vault read aws/creds/my-role', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); dot([[AX + 45, AY], [QX - 110, QY]], seg(u, 0.6, 1.4), ACC, 7);
      tx(40, 260, '앱은 이 한 줄만 호출한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(40, 288, '마스터 키도 장기 키도 등장하지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); return; }
    const resp = (op) => { el('rect', { x: 30, y: 200, width: 520, height: 140, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      [['lease_id', 'aws/creds/my-role/vGZ8k…', ACC], ['lease_duration', '1h', ACC], ['access_key', 'AKIAIOSFODNN7EXAMPLE', INK], ['session_token', '<nil>', OFF]].forEach(([a, b, col], i) => {
        mono(44, 228 + i * 30, a, { 'font-size': 14, fill: MUT, opacity: op }); mono(190, 228 + i * 30, b, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op }); }); };
    if (k === 1) { grow(QX + 110, QY, IX, QY, E(u, 0.2, 0.9), WARN); mono(QX + 120, QY - 14, 'CreateUser', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
      fly(QX - 110, QY + 40, AX + 40, AY + 60, seg(u, 1.3, 1.9), 'AKIA… 키', { mono: true }); resp(fade(u, 1.8)); return; }
    if (k === 2) {
      ['export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE', 'export AWS_SECRET_ACCESS_KEY=…', '# AWS_SESSION_TOKEN은 STS 방식일 때만'].forEach((s, i) => {
        el('rect', { x: 30, y: 210 + i * 40, width: 520, height: 32, rx: 6, fill: i < 2 ? INK : SOFT, opacity: fade(u, 0.3 + i * 0.5) });
        mono(42, 231 + i * 40, s, { 'font-size': 14, fill: i < 2 ? PANEL : MUT, opacity: fade(u, 0.3 + i * 0.5) }); });
      tx(40, 360, '앱 입장에서는 보통 AWS 키와 같다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3 || k === 4) { const ok = k === 3;
      cmd(30, 250, ok ? 'aws s3 cp s3://my-bucket/data.csv ./data.csv' : 'aws s3 rm s3://my-bucket/data.csv', E(u, 0.1, 0.8), { w: 520 });
      dot([[AX + 40, AY + 40], [bx - 50, by - 20]], seg(u, 0.8, 1.5), ok ? ACC : BAD, 7);
      if (ok) { fly(bx - 40, by, AX + 40, AY + 50, seg(u, 1.5, 2.3), 'data.csv', { mono: true, fill: GOOD }); mono(30, 296, 'download: s3://my-bucket/data.csv to ./data.csv', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      else { cross(bx - 70, by - 30, 14, pop(u, 1.5)); mono(30, 296, '(AccessDenied) … DeleteObject operation', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
        tx(30, 330, '정책에 s3:DeleteObject가 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      return; }
    // k5: lease 1h 가 끝나면 IAM 사용자째 지운다
    const f = 1 - E(u, 0.2, 1.6); clock(QX + 70, QY + 32, 22, f, WARN, f > 0.01 ? 'lease 1h' : '0');
    if (u > 1.6) { grow(QX + 110, QY - 10, IX, QY - 10, E(u, 1.6, 2.0), BAD); mono(QX + 120, QY - 22, 'DeleteUser', { 'font-size': 13.5, 'font-weight': 700, fill: BAD }); }
    tx(40, 270, '앱은 오래 사는 공유 키를 쓴 적이 없다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
    tx(40, 300, 'lease가 끝나면 이 키의 주인(IAM 사용자)이 사라진다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); }

  // ---------- 5. 생애주기와 방식 비교 ----------
  function lanes(c, o) { const { u } = c; o = o || {};
    const ax = R.axes(200, 150, 640, 150, { x: [0, 2], y: [0, 1], xt: [0, 1, 2], xl: '발급 후 시간 (h)' });
    const L = [['iam_user', 'AKIA… · my-role', ACC, 112 + 60], ['assumed_role', 'ASIA… · sts-role', INFO, 112 + 120]];
    L.forEach(([n, s, col, y], i) => { const end = o.end ? o.end[i] : 1, stop = o.stop ? o.stop[i] : null;
      mono(30, y + 6, n, { 'font-size': 15, 'font-weight': 800, fill: col });
      el('rect', { x: ax.X(0), y: y - 14, width: ax.X(end) - ax.X(0), height: 28, rx: 5, fill: col, opacity: 0.9 });
      mono(ax.X(0) + 10, y + 5, s, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
      if (stop != null) { el('rect', { x: ax.X(stop), y: y - 14, width: ax.X(end) - ax.X(stop), height: 28, fill: PANEL, opacity: 0.75 }); } });
    return ax; }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { cmd(30, 50, 'vault list sys/leases/lookup/aws/creds/my-role', E(u, 0.1, 0.9));
      el('rect', { x: 30, y: 84, width: 380, height: 96, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.0) });
      mono(46, 112, 'Keys', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); mono(46, 150, 'vGZ8k…', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      clock(330, 140, 22, 1 - E(u, 1.4, 2.8) * 0.2, WARN);
      tx(30, 240, '지금 살아 있는 키를 Vault가 전부 안다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(30, 270, '활성 1건', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { const g = E(u, 0.6, 1.4); lanes(c, { end: [lerp(1, 1.6, g), 1] });
      el('line', { x1: 200 + 640 * 0.3, y1: 140, x2: 200 + 640 * 0.3, y2: 250, stroke: INK, 'stroke-width': 2.5 }); tx(200 + 640 * 0.3, 132, 'renew', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
      check(860, 172, 10, pop(u, 1.4)); cross(860, 232, 9, pop(u, 1.6));
      mono(560, 272, 'lease_renewable=false', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.7) });
      tx(30, 380, 'iam_user lease만 연장된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { const s = E(u, 0.4, 1.0); lanes(c, { stop: [s > 0.5 ? 0.6 : null, null] });
      el('line', { x1: 200 + 640 * 0.3, y1: 140, x2: 200 + 640 * 0.3, y2: 250, stroke: BAD, 'stroke-width': 2.5 }); tx(200 + 640 * 0.3, 132, 'revoke', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD });
      tx(30, 346, 'iam_user: Vault가 IAM 사용자를 지워 키가 바로 죽는다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      tx(30, 374, 'assumed_role: STS 키는 자기 만료 시각까지 산다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.7) });
      tx(30, 402, '그래서 STS 방식은 TTL을 짧게 둔다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { // 세 방식 카드
      [['iam_user', 'IAM 사용자 생성·삭제', '인라인 정책을 세밀하게', ACC], ['assumed_role', 'STS AssumeRole', '가볍고 정리할 것이 없다', INFO], ['federation_token', 'GetFederationToken', '특수한 경우', MUT]].forEach(([n, a, b, col], i) => {
        const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4); card(x, 200, 280, 170, { rx: 12, stroke: col, sw: 2.5, s });
        mono(x, 150, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: s });
        tx(x, 200, a, { 'text-anchor': 'middle', 'font-size': 15, opacity: s }); tx(x, 236, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: s }); });
      tx(480, 350, '짧고 잦은 발급은 assumed_role, 세밀한 정책은 iam_user', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { // sts-role
      vault(160, 150, 220, 130);
      mono(70, 186, 'roles/sts-role', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      aws(560, 70, 370, 160, 'AWS STS');
      mono(580, 130, 'role/s3-reader', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(580, 160, '111122223333', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      grow(272, 130, 560, 130, E(u, 0.6, 1.2), INFO); mono(300, 118, 'AssumeRole', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) });
      fly(560, 190, 420, 250, seg(u, 1.3, 2.0), 'ASIA… + session_token', { fill: INFO, mono: true, stay: true });
      mono(40, 300, 'credential_type=assumed_role', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(40, 330, 'role_arns=arn:aws:iam::111122223333:role/s3-reader', { 'font-size': 14, opacity: fade(u, 0.5) });
      tx(40, 380, 'IAM 사용자를 만들지 않아 대량 발급에 가볍다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k5: 장기 키 0
    keyCard(60, 70, '예전: 장기 키', 'AKIAIOSFODNN7EXAMPLE', BAD, { gone: u > 0.8, w: 320 });
    grow(400, 96, 900, 96, 1 - E(u, 0.6, 1.2), BAD, { plain: true, sw: 4 });
    [['짧은 수명', 'lease 1h · 자동 폐기'], ['최소 권한', 'my-bucket 읽기만'], ['출처 추적', 'lease_id vGZ8k…']].forEach(([a, b], i) => { const x = 170 + i * 310, s = pop(u, 1.1 + i * 0.3);
      card(x, 260, 270, 100, { rx: 12, stroke: GOOD, sw: 2.5, fill: GOODBG, s }); tx(x, 250, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: s }); mono(x, 282, b, { 'text-anchor': 'middle', 'font-size': 14, opacity: s }); });
    tx(480, 380, '앱과 CI에 심어 둔 장기 키는 0개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: 'AKIA로 시작하는 장기 IAM 키를 앱에 심었을 때 가장 큰 문제는 무엇인가?',
      o: ['1시간마다 다시 발급받아야 한다', '지우기 전까지 영원히 유효하고, 복사본이 이미지와 git에 남는다', 'S3에만 접근할 수 있다'], a: 1,
      why: '장기 키에는 만료가 없다. CI 변수, 이미지 레이어, git 히스토리로 퍼진 뒤에는 언제 샜는지도 알기 어렵다.' },
    { q: 'aws/config/rotate-root를 실행하면 무엇이 달라지는가?',
      o: ['Vault가 마스터 키를 새 키 쌍으로 바꾸고 새 secret_key는 Vault만 안다', '앱이 쓰던 임시 키가 모두 폐기된다', 'lease 기본값이 1h에서 6h로 바뀐다'], a: 0,
      why: 'rotate-root는 Vault가 AWS와 말할 때 쓰는 마스터 자격을 바꾼다. 바뀐 뒤에는 사람도 그 값을 모른다.' },
    { q: 'my-role 정책으로 받은 키가 할 수 없는 일은 무엇인가?',
      o: ['my-bucket의 객체 읽기', 'my-bucket 목록 보기', '다른 버킷의 객체 읽기'], a: 2,
      why: 'Resource를 my-bucket과 my-bucket/* 로 묶었기 때문에 Action이 허용돼도 다른 버킷에는 쓰이지 않는다.' },
    { q: 'credential_type=iam_user인 my-role로 creds를 읽으면 session_token은 어떻게 나오는가?',
      o: ['ASIA로 시작하는 키와 함께 긴 토큰이 나온다', 'AKIA 키와 함께 <nil>로 나온다', '토큰만 나오고 access_key는 없다'], a: 1,
      why: 'iam_user는 IAM 사용자를 새로 만들어 그 사용자의 키를 준다. 세션 토큰은 STS 방식(assumed_role 등)에서만 나온다.' },
    { q: '유출 의심으로 lease를 revoke 했을 때 바로 효력이 사라지는 쪽은 어디인가?',
      o: ['assumed_role로 받은 STS 키', '둘 다 만료 시각까지 산다', 'iam_user로 받은 키'], a: 2,
      why: 'iam_user는 revoke 때 Vault가 IAM 사용자를 지운다. STS 키는 Vault가 지울 방법이 없어 만료 시각까지 살아 있다.' },
  ];

  const summary = [
    '장기 AWS 키는 지우기 전까지 살아 있고 CI 변수, 이미지, git 히스토리로 복사돼 퍼진다.',
    'Vault에는 마스터 자격을 한 번만 넣고 rotate-root로 바꾸면 그 값은 Vault만 안다.',
    'role 정책은 GetObject와 ListBucket을 my-bucket에만 허용해 키가 할 수 있는 일을 좁힌다.',
    'iam_user 키는 lease 1h가 끝나면 사용자째 지워지고 STS 키는 정해진 시각에 스스로 죽는다.',
  ];
  const review = [
    { q: 'CI가 받은 키로 s3 rm을 했더니 AccessDenied가 났다. 먼저 확인할 것은?',
      o: ['role의 IAM 정책에 s3:DeleteObject가 있는가', 'lease_max가 6h인가', 'rotate-root를 했는가'], a: 0,
      why: '키가 할 수 있는 일은 role에 붙인 정책이 정한다. my-role 정책은 GetObject와 ListBucket만 허용한다.' },
    { q: '배치가 assumed_role 키를 받아 쓰다가 유출 정황이 나왔다. revoke 뒤에도 마음을 놓을 수 없는 이유는?',
      o: ['revoke가 iam_user 사용자까지 지우기 때문이다', 'STS 키는 만료 시각 전까지 계속 유효하기 때문이다', 'lease_id가 남지 않기 때문이다'], a: 1,
      why: 'STS 키는 Vault가 무효로 만들 수 없다. 그래서 STS 방식은 default_sts_ttl을 짧게 잡아 위험 창을 줄인다.' },
    { q: '앱이 lease renew를 했더니 iam_user 키는 연장됐다. 같은 코드가 sts-role 키에서 실패했다. 이유는?',
      o: ['sts-role에 role_arns가 없어서', 'Vault 마스터 키가 회전돼서', 'STS 방식 lease는 lease_renewable이 false라서'], a: 2,
      why: 'STS 키는 수명이 발급 때 정해진다. 더 필요하면 만료 전에 creds를 다시 읽어 새 키를 받는다.' },
  ];

  R.page({ title: 'AWS 임시 자격 증명 생애주기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
