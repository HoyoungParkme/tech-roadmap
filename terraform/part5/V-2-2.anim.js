/* V-2-2 운영 체크리스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 틀: 위쪽 점검판(4축 × 12칸 = 48칸)이 beat 의 accumulated 만큼 채워지고, 아래에 그 beat 의 실제 대상(명령, backend, 정책, 파이프라인)을 그린다.
 * 터미널 출력은 실행 결과가 아니라 동작 규칙으로 만든 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, tokens, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    person, server, dbIcon, cross, check, lock, terminal, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const chip = (cx, cy, s, col, sc, o) => pill(cx, cy, s, col, sc, Object.assign({ mono: true, fs: 13.5, fill: PANEL }, o || {}));
  const AX = [['quality', 'Code Quality'], ['state', 'State Safety'], ['security', 'Security'], ['ops', 'Operations']];

  // 점검판: 4줄 × 12칸. 앞 beat 값에서 지금 값으로 칸이 하나씩 찬다
  function board(c, o) { o = o || {}; const acc = c.beat.accumulated, pa = c.prev ? c.prev.accumulated : (o.from ?? acc), u = c.u;
    const now = lerp(pa, acc, E(u, 0.3, 0.3 + Math.max(0.4, (acc - pa) * 0.25)));
    const x0 = 180, cw = 30, ch = 20, y0 = 18;
    AX.forEach(([id, name], r) => { const y = y0 + r * 26, act = c.beat.activeAxis === id || c.beat.activeAxis === 'all';
      tx(x0 - 14, y + 15, name, { 'font-size': 14, 'font-weight': act ? 800 : 600, fill: act ? INK : MUT, 'text-anchor': 'end' });
      for (let i = 0; i < 12; i++) { const n = r * 12 + i, f = clamp(now - n), fresh = n >= pa && n < acc;
        el('rect', { x: x0 + i * (cw + 3), y, width: cw, height: ch, rx: 4, fill: SOFT, stroke: act ? GRID : 'none' });
        if (f > 0) el('rect', { x: x0 + i * (cw + 3), y, width: cw * f, height: ch, rx: 4, fill: fresh ? ACC : GOOD, opacity: fresh ? 1 : 0.55 }); } });
    const shown = Math.round(now);
    mono(800, 66, `${shown}`, { 'font-size': 40, 'font-weight': 800, fill: shown === 48 ? GOOD : ACC, 'text-anchor': 'end' });
    mono(806, 66, '/ 48', { 'font-size': 18, 'font-weight': 700, fill: MUT });
    tx(780, 96, '점검 완료 항목', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    el('line', { x1: 24, y1: 128, x2: 936, y2: 128, stroke: GRID, 'stroke-width': 1.5 }); }
  // 새로 체크되는 항목 목록 (아래 영역 왼쪽)
  function ticks(x, y, items, u, a0) { items.forEach((s, i) => { const yy = y + i * 34, d = seg(u, (a0 ?? 0.4) + i * 0.3, (a0 ?? 0.4) + 0.25 + i * 0.3);
    el('rect', { x, y: yy - 13, width: 24, height: 24, rx: 5, fill: d >= 1 ? GOODBG : PANEL, stroke: d > 0 ? GOOD : GRID, 'stroke-width': 2 });
    if (d > 0) check(x + 12, yy - 1, 7, d); tx(x + 36, yy + 5, s, { 'font-size': 15, 'font-weight': 600, fill: d > 0 ? INK : MUT }); }); }

  // ================= 1. Code Quality =================
  function s1(t, c) { const { k, u } = c; board(c, { from: 0 });
    if (k === 0) { [['terraform fmt -check -recursive', '정렬'], ['terraform validate', '문법 · 참조'], ['tflint --recursive', 'provider lint']].forEach(([cmd, what], i) => {
        const y = 170 + i * 66, s = pop(u, 0.3 + i * 0.35); card(330, y, 560, 50, { rx: 10, stroke: GOOD, sw: 2, s });
        if (s > 0.6) { mono(70, y + 6, cmd, { 'font-size': 15, 'font-weight': 700 }); tx(540, y + 6, what, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); check(590, y, 9, s); } });
      card(790, 236, 220, 130, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 1.5), fill: ACCBG }); lbl(790, 226, 'CI가 대신 본다', fade(u, 1.7), { fill: ACC }); tx(790, 256, '사람이 판단할 게 없다', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 1) { ticks(40, 170, ['resource 이름은 snake_case', 'variable: type · description · default', 'output: description · sensitive', '모듈마다 README (입출력 표)'], u);
      chip(720, 175, 'aws_s3_bucket.app_logs', GOOD, pop(u, 0.5)); chip(720, 225, 'aws_s3_bucket.AppLogs-1', BAD, pop(u, 0.8)); cross(860, 225, 8, pop(u, 1.0));
      note(560, 300, '리뷰어가 코드를 열지 않고도 쓸 수 있게', fade(u, 1.8)); return; }
    if (k === 2) { ticks(40, 160, ['locals로 매직 넘버 제거', 'count · for_each 인덱스 의미', 'data와 resource 구분', '태그 표준 Project/Env/Owner/CostCenter', '주석은 why만'], u, 0.3);
      card(760, 230, 300, 120, { rx: 10, stroke: GRID, sw: 1.6, s: pop(u, 1.0) });
      if (u > 1.2) { mono(630, 208, 'instance_count = 3', { 'font-size': 14.5, fill: BAD, 'text-decoration': 'line-through' }); mono(630, 240, 'locals { web_count = 3 }', { 'font-size': 14.5, fill: GOOD }); mono(630, 272, 'count = local.web_count', { 'font-size': 14.5 }); } return; }
    // k === 3: CI 머지 게이트
    terminal(24, 150, 600, 170, ['$ terraform fmt -check -recursive', ['main.tf', '#fbbf24'], ['exit 3', '#f87171'], '$ terraform validate', 'Success! The configuration is valid.'], 5 * E(u, 0.2, 2.0), { title: 'PR check (예시)' });
    gate(800, 240, u > 1.0 ? false : true, pop(u, 0.4)); note(660, 370, '정렬이 안 된 파일이 있으면 머지 불가', fade(u, 2.2)); }
  function gate(cx, cy, open, s) { const g = R.G(cx, cy, s ?? 1), col = open ? GOOD : BAD;
    el('rect', { x: -56, y: -50, width: 12, height: 100, rx: 3, fill: INK }, g); el('rect', { x: 44, y: -50, width: 12, height: 100, rx: 3, fill: INK }, g);
    el('rect', { x: -44, y: -7, width: 88 * (open ? 0.15 : 1), height: 14, rx: 3, fill: col }, g);
    tx(0, 74, open ? '머지 가능' : '머지 막힘', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }, g); }

  // ================= 2. State Safety =================
  function s3obj(cx, cy, vers, o) { o = o || {}; // S3 버킷과 state 객체 버전
    el('path', { d: `M${cx - 80},${cy - 70} L${cx + 80},${cy - 70} L${cx + 66},${cy + 70} L${cx - 66},${cy + 70} Z`, fill: PANEL, stroke: INK, 'stroke-width': 2.4, opacity: o.op ?? 1 });
    el('ellipse', { cx, cy: cy - 70, rx: 80, ry: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.4, opacity: o.op ?? 1 });
    mono(cx, cy + 96, 'company-tfstate-prod', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: o.op ?? 1 });
    vers.forEach(([s, col, sc], i) => { if (sc <= 0) return; card(cx, cy - 30 + i * 34, 130, 28, { rx: 6, stroke: col, sw: 2, s: sc, text: s, fs: 13.5, mono: true, color: col }); }); }
  function s2(t, c) { const { k, u } = c; board(c, { from: 12 });
    if (k === 0) { // 로컬 → 원격
      card(170, 270, 200, 110, { rx: 12, stroke: BAD, sw: 2.2, op: 1 - 0.6 * seg(u, 1.4, 2.0) }); tx(170, 262, '노트북', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: 1 - 0.6 * seg(u, 1.4, 2.0) });
      mono(170, 290, 'terraform.tfstate', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      fly(270, 270, 560, 270, seg(u, 0.4, 1.3), 'tfstate', { mono: true, fill: ACC });
      s3obj(660, 270, [['vpc.tfstate', ACC, pop(u, 1.2)]], {});
      note(24, 380, '노트북이 죽어도 인프라 기록은 남는다', fade(u, 2.0)); return; }
    if (k === 1) { s3obj(250, 270, [['vpc.tfstate', INK, 1]]); lock(318, 214, true, GOOD, pop(u, 0.3)); mono(330, 180, 'encrypt + KMS', { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
      // 두 사람이 동시에 apply → lock
      person(560, 230, 'A', { s: pop(u, 0.5) }); person(560, 330, 'B', { s: pop(u, 0.7) });
      card(800, 270, 220, 110, { rx: 10, stroke: WARN, sw: 2.2, s: pop(u, 0.9) }); mono(712, 236, 'tf-state-lock', { 'font-size': 14, 'font-weight': 800, opacity: fade(u, 1.0) });
      mono(712, 270, 'LockID: A', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.3) });
      grow(590, 222, 690, 250, E(u, 1.1, 1.5), GOOD); grow(590, 322, 690, 300, E(u, 1.6, 2.0), BAD);
      mono(712, 304, 'B: 대기 · 실패', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { s3obj(250, 270, [['v3 (망가짐)', BAD, pop(u, 0.3)], ['v2', INK, 1], ['v1', INK, 1]]);
      el('path', { d: 'M330,280 C420,280 420,238 330,238', fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: E(u, 1.0, 1.6) });
      chip(560, 250, 'versioning Enabled', GOOD, pop(u, 0.6)); note(470, 310, '잘못된 apply 직후 이전 객체 버전으로 되돌린다', fade(u, 1.6)); return; }
    if (k === 3) { [['terraform.tfstate git 커밋', 0.2], ['.terraform/ 커밋', 0.5], ['개발자의 직접 state 접근', 0.8], ['기록 없는 state mv · rm', 1.1]].forEach(([s, a], i) => {
        const y = 170 + i * 54; card(300, y, 520, 42, { rx: 21, stroke: BAD, sw: 2, s: pop(u, a), fill: BADBG }); if (u > a + 0.3) { tx(80, y + 6, s, { 'font-size': 15.5, 'font-weight': 700 }); cross(530, y, 8, pop(u, a + 0.3)); } });
      note(620, 230, 'state에는 sensitive 값도', fade(u, 1.8)); note(620, 262, '평문으로 들어 있다', fade(u, 2.0), { fill: BAD }); return; }
    // k === 4
    ticks(40, 170, ['주 1회 plan으로 drift 점검', 'sensitive output은 state 안에만', 'state 백업 스냅샷 (일 · 주)', 'state import 절차 문서화'], u, 0.3);
    [['remote', 0], ['암호화', 1], ['lock', 2], ['버저닝', 3]].forEach(([s, i]) => chip(620 + (i % 2) * 150, 200 + Math.floor(i / 2) * 60, s, GOOD, pop(u, 1.4 + i * 0.15), { mono: false, fs: 15 }));
    note(560, 340, 'state를 지키는 4중 방어선', fade(u, 2.2)); }

  // ================= 3. Security =================
  function s3(t, c) { const { k, u } = c; board(c, { from: 24 });
    if (k === 0) { terminal(24, 150, 560, 130, ['  password = "supersecret123!"', ['gitleaks: leak found — generic-password', '#f87171'], ['exit 1', '#f87171']], 3 * E(u, 0.2, 1.6), { title: 'main.tf → gitleaks (예시)' });
      gate(790, 230, false, pop(u, 1.4)); note(24, 330, '이 한 줄이 들어간 코드는 커밋 단계에서 막는다', fade(u, 2.0)); return; }
    if (k === 1) { mono(40, 175, 'password = "supersecret123!"', { 'font-size': 15, fill: BAD, 'text-decoration': 'line-through', opacity: fade(u, 0.2) });
      grow(60, 195, 60, 240, E(u, 0.4, 0.8), ACC);
      mono(40, 268, 'data "aws_secretsmanager_secret_version" "db"', { 'font-size': 14.5, opacity: fade(u, 0.8) });
      mono(40, 298, '  secret_id = "prod/db/master"', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.0) });
      mono(40, 336, 'password = jsondecode(…secret_string)["password"]', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 1.4) });
      chip(780, 230, '값을 적지 않고 가리킨다', ACC, pop(u, 1.9), { mono: false }); return; }
    if (k === 2) { const g = E(u, 0.6, 1.6);
      [['actions', 's3:*', '"s3:GetObject", "s3:PutObject"'], ['resources', 'arn:aws:s3:::*', '"arn:aws:s3:::app-data/*"']].forEach(([n, a, b], i) => { const y = 180 + i * 80;
        tx(40, y + 6, n, { 'font-size': 15, 'font-weight': 700 }); mono(170, y + 6, a, { 'font-size': 15, fill: BAD, opacity: 1 - g * 0.6, 'text-decoration': g > 0.5 ? 'line-through' : null });
        grow(330, y, 390, y, g, ACC); mono(410, y + 6, b, { 'font-size': 15, fill: GOOD, opacity: g }); });
      note(40, 370, '지금 증명할 수 있는 권한까지만 준다', fade(u, 2.0)); return; }
    if (k === 3) { // 스캐너 5겹 필터
      const tools = ['tfsec', 'checkov', 'gitleaks', 'trivy', 'Sentinel · OPA'];
      tools.forEach((s, i) => { const x = 170 + i * 150, sc = pop(u, 0.2 + i * 0.2); el('rect', { x: x - 8, y: 150, width: 16, height: 200, rx: 8, fill: ACC, opacity: 0.25 * sc });
        mono(x, 374, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: sc }); });
      const pts = [[0, 170], [1, 230], [2, 290], [3, 330]]; // 각 문제는 서로 다른 필터에서 걸린다
      pts.forEach(([stop, y], i) => { const xx = lerp(60, 170 + stop * 150 - 16, E(u, 0.8 + i * 0.15, 1.8 + i * 0.15)); el('circle', { cx: xx, cy: y, r: 8, fill: BAD }); });
      el('circle', { cx: lerp(60, 900, E(u, 1.0, 2.4)), cy: 200, r: 8, fill: GOOD }); mono(900, 232, '통과', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.4) });
      note(480, 408, '도구마다 잡는 문제가 달라서 겹쳐 쓴다 (빨간 점: 걸린 문제)', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
    // k === 4: 인증
    chip(170, 190, 'long-lived access key', BAD, 1); cross(290, 190, 9, pop(u, 0.3));
    chip(170, 250, 'OIDC · AssumeRole', GOOD, pop(u, 0.5)); chip(450, 250, 'KMS 키 회전', GOOD, pop(u, 0.9)); chip(700, 250, 'CloudTrail 항상 켬', GOOD, pop(u, 1.3));
    note(40, 330, 'security 축 12칸이 다 찼다', fade(u, 2.0), { fill: GOOD }); }

  // ================= 4. Operations =================
  const STG = ['init', 'fmt', 'validate', 'plan -out', 'Infracost'];
  function stages(on, u, a0) { STG.forEach((s, i) => { const x = 110 + i * 175, lit = on(i);
    card(x, 190, 150, 46, { rx: 10, stroke: lit ? ACC : GRID, sw: lit ? 2.4 : 1.4, fill: lit ? ACCBG : PANEL, text: s, fs: 14.5, mono: true, color: lit ? ACC : MUT, s: a0 == null ? 1 : pop(u, a0 + i * 0.2) });
    if (i < 4) grow(x + 76, 190, x + 99, 190, a0 == null ? 1 : E(u, a0 + 0.1 + i * 0.2, a0 + 0.2 + i * 0.2), MUT); }); }
  function s4(t, c) { const { k, u } = c; board(c, { from: 36 });
    if (k === 0) { chip(130, 280, 'PR 열림', INFO, pop(u, 0.2), { mono: false, fs: 15 }); grow(200, 280, 300, 280, E(u, 0.4, 0.8), INFO);
      mono(330, 286, 'on: [pull_request]', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) }); stages(() => false, u, 0.9);
      note(560, 286, '사람이 명령을 치는 게 아니라 PR이 방아쇠다', fade(u, 2.0)); return; }
    if (k === 1) { stages((i) => i < 4, u); fly(635, 220, 635, 300, seg(u, 0.6, 1.3), 'tfplan', { mono: true, fill: INK, stay: true });
      note(40, 290, 'fmt · validate는 Step 1의 검사를 그대로 쓴다', fade(u, 1.2)); note(40, 360, 'plan 파일이 승인 후 apply할 "그때 본 그 계획"이다', fade(u, 1.8)); return; }
    if (k === 2) { stages((i) => i === 4, u);
      card(700, 320, 420, 90, { rx: 14, stroke: INFO, sw: 2, fill: INFOBG, s: pop(u, 0.5) });
      if (u > 0.8) { tx(510, 306, 'infracost 코멘트', { 'font-size': 14, 'font-weight': 800, fill: INFO }); tx(510, 336, '이 PR로 늘어나는 월 비용', { 'font-size': 15, 'font-weight': 600 }); }
      note(40, 300, '리뷰할 때 비용이 보이면', fade(u, 1.4)); note(40, 332, '배포 전에 질문이 나온다', fade(u, 1.8)); return; }
    if (k === 3) { [['envs/dev', '자동 apply', GOOD], ['envs/staging', '자동 apply', GOOD], ['envs/prod', '수동 승인', WARN]].forEach(([d, how, col], i) => {
        const y = 170 + i * 56; mono(60, y + 6, '├── ' + d, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) });
        chip(420, y, how, col, pop(u, 0.4 + i * 0.3), { mono: false }); });
      lock(520, 282, true, WARN, pop(u, 1.4)); mono(60, 350, '└── modules/vpc  (같은 모듈)', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      note(600, 230, 'workspace보다 디렉터리 분리가', fade(u, 1.9)); note(600, 262, 'prod 실수를 줄인다', fade(u, 2.1)); return; }
    if (k === 4) { ticks(40, 170, ['plan 결과 PR 코멘트 게시', 'rollback 계획 (이전 git tag)', 'runbook (사고 대응 SOP)'], u, 0.4);
      note(560, 210, '이미 체크: plan 자동 실행,', fade(u, 1.6), { fill: MUT }); note(560, 240, 'prod 수동 승인, env 분리', fade(u, 1.8), { fill: MUT });
      note(560, 300, 'runbook이 없으면 사고 때', fade(u, 2.1)); note(560, 330, '가장 바쁜 사람이 문서를 쓴다', fade(u, 2.3)); return; }
    ticks(40, 160, ['drift detection일 1회 (cron)', 'apply 결과 Slack · Email 알림', '모듈 · provider 버전 고정 (~> 5.0)', '.terraform.lock.hcl 커밋', 'on-call 담당 + 인수인계 문서'], u, 0.3);
    note(620, 280, '48칸이 모두 찼다', fade(u, 2.2), { fill: GOOD }); }

  // ================= 5. 종합 =================
  function s5(t, c) { const { k, u } = c; board(c);
    if (k === 0) { [['Code Quality', '작성자', 'fmt · validate · tflint'], ['State Safety', '플랫폼팀', 'backend · lock · KMS'], ['Security', 'SecOps', 'tfsec · checkov · gitleaks'], ['Operations', 'SRE', 'CI · Infracost · runbook']].forEach(([a, who, tool], i) => {
        const y = 166 + i * 50, op = fade(u, 0.2 + i * 0.3); tx(40, y + 6, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(250, y + 6, '12 / 12', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: op });
        chip(420, y, who, ACC, pop(u, 0.4 + i * 0.3), { mono: false }); tx(540, y + 6, tool, { 'font-size': 14, fill: MUT, opacity: op }); });
      note(40, 400, '책임자 칸이 빈 축은 아무도 안 보는 축이다', fade(u, 2.2)); return; }
    if (k === 1) { [['PR마다', '바뀐 모듈의 해당 축'], ['분기마다', '4축 전체 회고'], ['사고 후', 'root cause 항목 추가']].forEach(([a, b], i) => {
        const x = 170 + i * 310, s = pop(u, 0.3 + i * 0.4); el('circle', { cx: x, cy: 250, r: 60 * s, fill: PANEL, stroke: ACC, 'stroke-width': 2.4 });
        if (s > 0.6) { lbl(x, 246, a, 1, { fill: ACC }); tx(x, 340, b, { 'font-size': 14.5, 'text-anchor': 'middle' }); } });
      return; }
    if (k === 2) { chip(200, 200, 'TBD', BAD, pop(u, 0.2), { fs: 16 }); cross(250, 200, 9, pop(u, 0.9));
      grow(280, 200, 400, 200, E(u, 0.9, 1.3), ACC); chip(560, 200, 'Owner: @infra-lead · Due: 날짜', GOOD, pop(u, 1.3), { mono: false });
      note(40, 300, '지금 운영에 들어가는 모듈부터 채운다', fade(u, 1.8)); note(40, 334, '체크리스트도 git으로 버전 관리한다', fade(u, 2.2)); return; }
    if (k === 3) { ['Terraform Cloud · Enterprise', '사내 모듈 레지스트리', '정책 코드 (Sentinel · OPA)', '멀티 어카운트 거버넌스'].forEach((s, i) => {
        const y = 170 + i * 56; card(480, y, 520, 44, { rx: 22, stroke: INFO, sw: 2, s: pop(u, 0.2 + i * 0.35) }); if (u > 0.5 + i * 0.35) tx(480, y + 6, s, { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle' }); });
      return; }
    tx(480, 220, '정답을 주지는 않는다', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, opacity: fade(u, 0.3) });
    tx(480, 266, '빠뜨린 것이 있는지 알려 준다', { 'text-anchor': 'middle', 'font-size': 20, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
    tx(480, 330, '운영은 실수를 줄여 가는 과정이다', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 1.7) }); }

  const quiz = [
    { q: 'PR 검사에서 terraform fmt -check -recursive가 실패했다. 무엇이 문제인가?',
      o: ['정렬되지 않은 .tf 파일이 있다', 'provider 문법이 틀렸다', 'state lock이 걸려 있다'], a: 0,
      why: 'fmt -check는 파일을 고치지 않고 정렬 여부만 본다. 미정렬 파일이 있으면 0이 아닌 코드로 끝나 머지 게이트가 막힌다.' },
    { q: 'S3 backend에서 두 사람이 동시에 apply할 때 state가 깨지지 않게 하는 설정은 무엇인가?',
      o: ['encrypt = true', 'state lock (dynamodb_table 또는 use_lockfile)', 'versioning Enabled'], a: 1,
      why: 'lock이 있으면 먼저 잡은 사람만 진행하고 다른 사람은 기다리거나 실패한다. 암호화와 버저닝은 다른 위험을 막는다.' },
    { q: 'IAM 정책 리뷰에서 바로 막아야 할 것은 무엇인가?',
      o: ['actions = ["s3:GetObject"]', 'resources = ["arn:aws:s3:::app-data/*"]', 'actions = ["s3:*"]'], a: 2,
      why: 's3:* 는 필요하지 않은 삭제 권한까지 준다. actions와 resources를 모두 필요한 만큼만 좁힌다.' },
    { q: 'dev와 prod를 나눌 때 이 챕터가 더 안전하다고 보는 방식은 무엇인가?',
      o: ['envs/dev · envs/prod 디렉터리 분리', '같은 디렉터리의 workspace 전환', '브랜치 이름으로 구분'], a: 0,
      why: '디렉터리를 나누면 prod에만 수동 승인 게이트와 다른 권한을 줄 수 있다. workspace 전환은 실수로 prod에 apply하기 쉽다.' },
    { q: '체크리스트에서 아직 못 지킨 항목은 어떻게 적어야 하는가?',
      o: ['TBD', 'Owner와 Due', '빈칸으로 둔다'], a: 1,
      why: 'TBD는 아무도 하지 않는다. 이름과 날짜가 있어야 항목이 움직인다.' },
  ];

  const summary = [
    'fmt, validate, tflint는 사람이 판단할 게 없으니 PR 머지 게이트로 CI에 맡긴다.',
    'state는 원격 backend, 암호화, lock, 버저닝으로 지키고 git에는 절대 올리지 않는다.',
    '비밀은 코드에 적지 않고 가리키며, IAM은 actions와 resources를 모두 좁힌다.',
    'plan은 PR마다 자동으로, prod apply는 수동 승인으로 하고 체크리스트는 계속 고친다.',
  ];
  const review = [
    { q: '두 엔지니어가 같은 시각에 prod apply를 했더니 state가 꼬였다. 체크리스트에서 빠졌을 가능성이 가장 큰 항목은?',
      o: ['tflint 경고 0건', 'state lock', 'Infracost 비용 리포트'], a: 1,
      why: 'lock이 있으면 두 번째 apply는 기다리거나 실패한다. 동시 쓰기로 state가 깨지는 일은 lock이 막는다.' },
    { q: 'gitleaks는 통과했는데 state 파일에서 DB 비밀번호가 평문으로 발견됐다. 어떻게 보는 게 맞는가?',
      o: ['state 저장소의 암호화와 접근 권한을 따로 지킨다', 'gitleaks 설정을 고쳐 다시 돌린다', 'sensitive = true를 붙여 state에서 지운다'], a: 0,
      why: 'gitleaks는 코드를 본다. 리소스에 들어간 값은 sensitive여도 state에 남으므로 state 축의 암호화와 권한이 따로 필요하다.' },
    { q: '승인 후 apply했더니 PR에서 본 plan과 다른 변경이 적용됐다. 운영 절차에서 먼저 고칠 것은?',
      o: ['fmt -check를 추가한다', '모듈 README를 쓴다', 'plan -out으로 저장한 계획 파일을 apply한다'], a: 2,
      why: 'plan을 파일로 남겨 두고 그 파일을 apply하면 승인한 계획 그대로 적용된다. 다시 plan을 세우면 그사이 바뀐 것이 끼어든다.' },
  ];

  R.page({ title: '운영 출항 점검판', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
