/* I-2-2 Pulumi vs Terraform — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone,
    cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통 부품 ----------
  // 가운데 세로선으로 나눈 무대: 왼쪽 Pulumi, 오른쪽 Terraform. dim: 'L' | 'R' 쪽을 흐리게
  function split(dim) { el('line', { x1: 480, y1: 20, x2: 480, y2: 404, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
    tx(30, 36, 'Pulumi', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: dim === 'L' ? 0.35 : 1 });
    tx(500, 36, 'Terraform', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: dim === 'R' ? 0.35 : 1 }); }
  function codeBox(x, y, w, lines, o) { o = o || {}; const lh = 22, h = lines.length * lh + 20;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: o.col || GRID, 'stroke-width': o.col ? 2 : 1.5, opacity: o.op ?? 1 });
    lines.forEach((s, i) => { const [str, hi] = Array.isArray(s) ? s : [s, false];
      if (hi) el('rect', { x: x + 4, y: y + 8 + i * lh, width: w - 8, height: lh, rx: 4, fill: ACCBG, opacity: o.op ?? 1 });
      R.spans(x + 12, y + 24 + i * lh, R.tokens(str), { 'font-size': 13.5, opacity: o.op ?? 1 }); });
    return h; }
  function bucketIcon(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INFO;
    el('path', { d: 'M-20,-14 L-15,20 H15 L20,-14 Z', fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); el('ellipse', { cx: 0, cy: -14, rx: 20, ry: 6, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); }
  function doc(cx, cy, w, h, title, rows, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2, col = o.col || INK, g = R.G(0, 0, 1, o.op);
    el('path', { d: `M${x},${y} H${x + w - 14} L${x + w},${y + 14} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2 }, g);
    mono(x + 10, y + 20, title, { 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    (rows || []).forEach((r, i) => { const [s, rc] = Array.isArray(r) ? r : [r, null]; mono(x + 10, y + 42 + i * 20, s, { 'font-size': 13.5, fill: rc || MUT }, g); }); }
  const note = (s, u0, u, col, x, y) => tx(x || 480, y || 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, u0) });

  // =========================================================
  // 1. 언어 — 범용 언어 vs 전용 DSL
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    split(k === 3 ? null : 'R');
    const L = [['import * as aws from "@pulumi/aws";', k === 0], ['const project = "web";', k === 1], ['const env     = "prod";', k === 1],
      ['const bucket = new aws.s3.BucketV2("assets", {', k === 1], ['  bucket: `${project}-${env}-assets`, … });', k === 1],
      ['export const bucketArn = bucket.arn;', k === 2]].filter((_, i) => i === 0 || (k >= 1 && i <= 4) || (k >= 2));
    codeBox(20, 52, 450, L);
    if (k === 0) { ['aws.s3', 'aws.ec2', 'aws.iam', 'aws.lambda'].forEach((s, i) => pill(80 + (i % 2) * 150, 150 + Math.floor(i / 2) * 44, s, ACC, pop(u, 0.5 + i * 0.2), { mono: true, fs: 14 }));
      tx(245, 270, '타입을 아는 평범한 .ts 파일', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      doc(710, 150, 200, 90, 'main.tf', ['HCL · 전용 DSL'], { col: INFO, op: fade(u, 0.8) });
      tx(710, 240, '배우기 쉽고 선언형', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { const P = [['web', ACC, 0.4], ['-', MUT, 0.9], ['prod', ACC, 1.0], ['-assets', MUT, 1.5]]; let x = 130;
      P.forEach(([s, col, a], i) => { const w = tw(s, 20); fly(i === 0 ? 120 : i === 2 ? 120 : x + w / 2, i === 0 ? 96 : i === 2 ? 118 : 250, x + w / 2, 250, seg(u, a, a + 0.5), s, { mono: true, fill: col === MUT ? INK : ACC });
        if (u > a + 0.5 && u <= 2.0) mono(x, 257, s, { 'font-size': 20, 'font-weight': 800, fill: col === MUT ? INK : ACC }); x += w; });
      if (u > 2.0) mono(130, 257, 'web-prod-assets', { 'font-size': 20, 'font-weight': 800, fill: ACC });
      bucketIcon(110, 330, pop(u, 2.0), ACC); mono(140, 336, 'BucketV2 "assets"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(245, 296, '템플릿 리터럴이 곧 이름 표현식', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { const s = pop(u, 0.5); card(250, 290, 240, 110, { rx: 8, stroke: INFO, sw: 2, s });
      if (s > 0.8) [['arn', 'Output<string>'], ['bucket', 'Output<string>'], ['id', 'Output<string>']].forEach(([a, b], i) => { const y = 262 + i * 28;
        if (i === 0) el('rect', { x: 136, y: y - 16, width: 228, height: 24, rx: 4, fill: C.INFOBG });
        mono(146, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: i === 0 ? INFO : INK }); mono(356, y, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
      tx(245, 380, '.arn 자동완성 · 오타는 컴파일에서', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); return; }
    // k3: 같은 것을 HCL 블록으로
    const H = [['variable "project" { default = "web" }', 'const', 170], ['variable "env"     { default = "prod" }', 'const', 170],
      ['resource "aws_s3_bucket" "assets" {', 'new', 236], ['  bucket = "${var.project}-${var.env}-assets"', 'new', 236], ['  tags   = { … } }', 'new', 236], ['output "bucket_arn" {', 'export', 302], ['  value = aws_s3_bucket.assets.arn }', 'export', 302]];
    codeBox(492, 52, 452, H.map(([s]) => s), { col: INFO });
    [['const', 'variable 블록', 110, 64], ['new', 'resource 블록', 160, 162], ['export', 'output 블록', 196, 184]].forEach(([a, b, ly, ry], i) => {
      grow(470, ly, 496, ry - 8, E(u, 0.4 + i * 0.4, 0.9 + i * 0.4), INFO);
      pill(245, 250 + i * 40, a + ' → ' + b, INFO, pop(u, 0.6 + i * 0.4), { fs: 13.5 }); });
    note('문법만 익히면 바로 시작한다. 복잡한 로직에서 답답해진다', 1.9, u, MUT, 480, 380); }

  // =========================================================
  // 2. state / backend — 둘 다 state, 저장소만 다르다
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    split(k === 0 ? 'L' : k === 1 ? 'R' : null);
    // Terraform 쪽
    const tfL = [['terraform { backend "s3" {', k === 0], ['  bucket = "my-tfstate-prod"', k === 0], ['  key    = "web/terraform.tfstate"', k === 0],
      ['  region = "ap-northeast-2"', k === 2], ['  use_lockfile = true', k === 2], ['  encrypt = true } }', k === 2]];
    codeBox(492, 52, 452, tfL, { op: k === 1 ? 0.35 : 1 });
    if (k === 0) { bucketIcon(600, 270, pop(u, 0.6), INFO); mono(632, 262, 'my-tfstate-prod', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      doc(780, 330, 220, 56, 'web/terraform.tfstate', [], { col: INFO, op: fade(u, 1.2) }); dot([[600, 290], [700, 330]], seg(u, 1.0, 1.5), INFO, 6);
      note('backend 블록에 버킷과 키를 직접 적는다', 1.7, u, INFO, 710, 404); return; }
    // Pulumi 쪽
    const cmd = k === 1 ? ['$ pulumi login'] : k === 2 ? ['$ pulumi login s3://my-pulumi-state', '$ pulumi login file://~'] : ['$ pulumi config set --secret \\', '    dbPassword s3cr3t'];
    cmd.forEach((s, i) => pill(240, 80 + i * 40, s, ACC, pop(u, 0.2 + i * 0.3), { mono: true, fs: 14 }));
    if (k === 1) { const g = R.G(240, 210, pop(u, 0.7)); el('path', { d: 'M-50,22 H50 A22,22 0 0 0 46,-20 A30,30 0 0 0 -10,-28 A24,24 0 0 0 -50,-6 A13,13 0 0 0 -50,22 Z', fill: ACCBG, stroke: ACC, 'stroke-width': 2.6 }, g);
      tx(240, 270, 'Pulumi Cloud (기본)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      card(240, 330, 260, 40, { rx: 8, stroke: GRID, dash: '6 4', text: 'backend 블록 없음', fs: 14, color: MUT, s: pop(u, 1.4) });
      el('line', { x1: 120, y1: 330, x2: 120 + 240 * E(u, 1.7, 2.1), y2: 330, stroke: BAD, 'stroke-width': 2.5 }); return; }
    if (k === 2) { lock(110, 220, true, GOOD, pop(u, 1.0)); tx(140, 214, 'lock 파일은 알아서 만든다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.1) });
      tx(140, 238, '(DIY backend 기본 잠금)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
      lock(560, 300, true, INFO, pop(u, 1.4)); tx(590, 296, '잠금 · 암호화를 블록에 직접 채운다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) });
      tx(590, 320, 'use_lockfile은 1.11+, 예전엔 DynamoDB', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) }); return; }
    // k3: 같은 값이 state 에 어떻게 남나
    const m = E(u, 0.6, 1.2);
    doc(240, 270, 330, 110, 'Pulumi state', [['dbPassword:', INK], [m > 0.5 ? '  ciphertext "AAABAM8x…"' : '  …', GOOD]], { col: ACC });
    if (m > 0.5) lock(380, 236, true, GOOD, pop(u, 1.2));
    doc(710, 270, 330, 110, 'terraform.tfstate', [['"db_password":', INK], [u > 1.0 ? '  "s3cr3t"' : '  …', BAD]], { col: INFO, op: fade(u, 0.8) });
    if (u > 1.2) tx(710, 350, 'sensitive 표시를 해도 state에는 평문', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) });
    note('secret을 기본으로 암호화하는 것이 실무 차이', 2.0, u, ACC, 480, 404); }

  // =========================================================
  // 3. 로직 — for_each · count 트릭 vs map · if
  // =========================================================
  const AZ = ['ap-northeast-2a', 'ap-northeast-2b', 'ap-northeast-2c'];
  const CIDR = ['10.0.0.0/24', '10.0.1.0/24', '10.0.2.0/24'];   // VPC 10.0.0.0/16 에서 cidrsubnet(…, 8, i)
  function vpc(x, y, w, names, k0, k, u, col) { zone(x, y, w, 196, 'VPC 10.0.0.0/16', { fill: PANEL, stroke: col, dash: '7 5', color: col });
    names.forEach((nm, i) => { const yy = y + 50 + i * 48, s = k === k0 ? pop(u, 0.5 + i * 0.4) : 1;
      card(x + w / 2, yy, w - 30, 40, { rx: 8, stroke: col, sw: 2, s });
      if (s > 0.8) { mono(x + 26, yy + 5, nm, { 'font-size': 13.5, 'font-weight': 700 }); mono(x + w - 26, yy + 5, CIDR[i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } }); }
  function s3(t, c) { const { k, u } = c;
    split(k === 2 ? 'R' : k === 3 ? null : 'L');
    if (k === 0 || k === 1) {
      const tfL = k === 0 ? [['variable "azs" { default = [3개 AZ] }', true], ['resource "aws_subnet" "app" {', true], ['  for_each = toset(var.azs)', true], ['  availability_zone = each.value', true]]
        : [['resource "aws_backup_plan" "daily" {', true], ['  count = var.env == "prod" ? 1 : 0', true], ['  name  = "daily-backup" }', true]];
      codeBox(492, 52, 452, tfL);
      if (k === 0) { vpc(510, 176, 420, AZ.map((a) => `app["${a.slice(-2)}"]`), 0, k, u, INFO);
        AZ.forEach((a, i) => fly(560 + i * 130, 120, 600, 226 + i * 48, seg(u, 0.2 + i * 0.4, 0.6 + i * 0.4), 'each.value', { mono: true, fill: INFO }));
        tx(245, 220, 'for_each · each.value', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.5) });
        tx(245, 246, 'HCL 전용 반복 문법', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); return; }
      // count 트릭: dev → 0, prod → 1
      [['dev', 0], ['prod', 1]].forEach(([e, n], i) => { const y = 220 + i * 80, s = pop(u, 0.3 + i * 0.6);
        pill(560, y, 'env = ' + e, INK, s, { mono: true, fs: 14 }); grow(616, y, 676, y, E(u, 0.6 + i * 0.6, 0.9 + i * 0.6), MUT);
        mono(700, y + 5, 'count = ' + n, { 'font-size': 15, 'font-weight': 800, fill: n ? GOOD : MUT, opacity: fade(u, 0.8 + i * 0.6) });
        if (n) card(860, y, 140, 40, { rx: 8, stroke: GOOD, sw: 2, text: 'daily[0]', fs: 14, mono: true, s: pop(u, 1.6) });
        else tx(860, y + 5, '만들지 않음', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) }); });
      tx(245, 220, 'HCL에는 if가 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
      tx(245, 246, '개수 1 · 0으로 우회한다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.7) }); return; }
    if (k === 2) { codeBox(20, 52, 450, [['const subnets = azs.map((az, i) =>', true], ['  new aws.ec2.Subnet(`app-${i}`, {', true], ['    availabilityZone: az,', true], ['    cidrBlock: `10.0.${i}.0/24` }));', true]]);
      vpc(30, 176, 420, ['app-0', 'app-1', 'app-2'], 2, k, u, ACC);
      tx(710, 220, '같은 subnet 3개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) });
      tx(710, 246, '배열 .map()과 화살표 함수', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    // k3: 중첩 함수 vs 한 줄
    const box = (x, y, w, h, s, col, a) => { el('rect', { x, y, width: w * E(u, a, a + 0.4), height: h, rx: 8, fill: 'none', stroke: col, 'stroke-width': 2.2 }); if (s) mono(x + 10, y + 22, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: fade(u, a + 0.3) }); };
    box(500, 70, 440, 170, 'cidrsubnet(', INFO, 0.2);
    mono(520, 124, 'aws_vpc.main.cidr_block, 8,', { 'font-size': 13.5, opacity: fade(u, 0.6) });
    box(520, 140, 400, 80, 'index(', WARN, 0.8); mono(540, 194, 'var.azs, each.value )', { 'font-size': 13.5, opacity: fade(u, 1.1) });
    mono(500, 266, ')', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) });
    tx(710, 310, '함수 안의 함수, 안쪽부터 읽는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
    codeBox(20, 110, 450, [['cidrBlock: `10.0.${i}.0/24`', true], ['if (env === "prod") new aws.backup.Plan(…);', true]], { op: fade(u, 1.6) });
    tx(245, 230, '값도 조건도 한 줄', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
    note('결과 CIDR은 같다: 10.0.0.0/24 · 10.0.1.0/24 · 10.0.2.0/24', 2.1, u, MUT, 480, 380); }

  // =========================================================
  // 4. 생태계 · 테스트 · 마이그레이션
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const N = [['Terraform provider', 'hashicorp/aws', INFO, 140], ['bridge', 'pulumi-terraform-bridge', WARN, 430], ['Pulumi provider', 'pulumi-aws', ACC, 740]];
      N.forEach(([a, b, col, x], i) => { card(x, 150, 230, 80, { rx: 12, stroke: col, sw: 2.4, s: pop(u, 0.2 + i * 0.5) });
        tx(x, 144, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) }); mono(x, 168, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) });
        if (i < 2) grow(x + 118, 150, N[i + 1][3] - 118, 150, E(u, 0.6 + i * 0.5, 1.0 + i * 0.5), MUT); });
      ['TS', 'Python', 'Go', 'C#'].forEach((s, i) => { grow(740, 192, 620 + i * 80, 262, E(u, 1.6, 2.0), ACC, { plain: true }); pill(620 + i * 80, 280, s, ACC, pop(u, 1.8 + i * 0.1), { fs: 14 }); });
      note('많은 provider가 Terraform provider를 감싸 쓴다. 커버리지가 사실상 대등하다', 2.1, u, INK, 480, 370); return; }
    if (k === 1) { card(150, 170, 200, 80, { rx: 12, stroke: ACC, sw: 2.4, text: 'index.ts\n프로그램', fs: 15, s: pop(u, 0.2) });
      card(470, 170, 230, 96, { rx: 12, stroke: WARN, sw: 2.6, fill: C.WARNBG, s: pop(u, 0.5) });
      mono(470, 150, 'setMocks', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.7) });
      mono(470, 176, 'id: `${name}-id`', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 0.9) }); mono(470, 198, 'state: inputs', { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 1.0) });
      grow(252, 170, 352, 170, E(u, 0.8, 1.2), ACC); dot([[252, 170], [352, 170]], ((u * 0.8) % 1), ACC, 6);
      zone(700, 110, 220, 120, 'AWS', { fill: PANEL, stroke: GRID, dash: '7 5' });
      grow(588, 170, 690, 170, E(u, 1.2, 1.5), GRID, { plain: true, dash: '5 5' }); cross(640, 170, 14, pop(u, 1.6));
      note('실제 클라우드 호출 없이 프로그램을 그대로 실행한다', 2.0, u, INK, 480, 330); return; }
    if (k === 2) { R.terminal(40, 60, 520, 150, ['$ npx jest infra.test.ts   # 예시 명령', 'describe("s3 bucket")', '  it("prod 버킷에 Env 태그가 있어야 한다")', ['PASS prod 버킷에 Env 태그가 있어야 한다', 'var(--good)']], clamp((u - 0.2) / 1.6) * 4, { fs: 13.5 });
      card(760, 120, 300, 110, { rx: 10, stroke: INFO, sw: 2, s: pop(u, 0.6) });
      mono(630, 100, 'bucket.tags.apply(t =>', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.8) });
      mono(640, 128, '{ Project: "web",', { 'font-size': 14, opacity: fade(u, 1.0) }); mono(640, 152, '  Env: "prod" }', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
      check(900, 148, 12, pop(u, 2.0));
      tx(300, 260, 'expect(tags).toHaveProperty("Env", "prod")', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', opacity: fade(u, 1.4) });
      note('@pulumi/pulumi mocks로 실제로 돌려 본 결과 (jest 대신 같은 단언 함수)', 2.0, u, MUT, 480, 330); return; }
    // k3: 기존 자산 흡수
    doc(130, 120, 170, 70, 'main.tf', ['HCL'], { col: INFO });
    pill(370, 120, 'pulumi convert --from terraform', ACC, pop(u, 0.3), { mono: true, fs: 13.5 });
    grow(220, 120, 240, 120, 1, MUT); grow(500, 120, 640, 120, E(u, 0.5, 0.9), ACC);
    doc(740, 120, 170, 70, 'index.ts', ['TypeScript'], { col: ACC, op: fade(u, 0.9) });
    zone(40, 220, 300, 130, 'AWS (이미 있음)', { fill: PANEL, stroke: INFO, dash: '7 5', color: INFO });
    bucketIcon(110, 296, 1, INFO); mono(140, 302, 'my-existing-bucket', { 'font-size': 14, 'font-weight': 700 });
    pill(480, 286, 'pulumi import …BucketV2 assets', ACC, pop(u, 1.2), { mono: true, fs: 13.5 });
    dot([[340, 286], [620, 286], [700, 286]], seg(u, 1.4, 2.0), ACC, 7);
    doc(780, 290, 200, 76, 'Pulumi state', [['= assets 추가', GOOD]], { col: GOOD, op: fade(u, 1.8) });
    note('리소스를 지우거나 다시 만들지 않고 state로 흡수한다', 2.2, u, GOOD, 480, 396); }

  // =========================================================
  // 5. 정책 as code — CrossGuard vs Sentinel
  // =========================================================
  function gate(x, y, label, col, s) { card(x, y, 30, 150, { rx: 6, stroke: col, sw: 2.4, fill: col === INFO ? C.INFOBG : ACCBG, s }); tx(x, y - 88, label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, opacity: s > 0.8 ? 1 : 0 }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { codeBox(30, 60, 420, [['import { PolicyPack, validateResourceOfType }', true], ['  from "@pulumi/policy";', true], ['import * as aws from "@pulumi/aws";', true]]);
      doc(650, 120, 200, 70, 'index.ts', ['인프라 코드'], { col: ACC, op: fade(u, 0.6) }); doc(650, 230, 200, 70, 'policy.ts', ['정책 코드'], { col: WARN, op: fade(u, 0.9) });
      tx(830, 180, '같은 언어', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.3) }); tx(830, 204, '같은 도구', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.5) });
      note('정책도 TypeScript로 쓰고 테스트한다', 1.9, u, INK, 480, 360); return; }
    if (k === 1) { card(300, 200, 400, 200, { rx: 14, stroke: WARN, sw: 2.4, s: pop(u, 0.2) });
      mono(120, 128, 'PolicyPack "aws-guardrails"', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.4) });
      mono(130, 176, 'name: s3-must-be-private', { 'font-size': 14, opacity: fade(u, 0.8) });
      mono(130, 206, 'enforcementLevel:', { 'font-size': 14, opacity: fade(u, 1.0) }); pill(350, 202, 'mandatory', BAD, pop(u, 1.2), { mono: true, fs: 14 });
      gate(700, 210, 'mandatory', BAD, pop(u, 1.5));
      tx(700, 316, '어기면 배포가 멈춘다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { pill(480, 50, '$ pulumi preview --policy-pack ./policy', INK, pop(u, 0.1), { mono: true, fs: 14 });
      gate(520, 220, 's3-must-be-private', WARN, 1);
      [['acl: "private"', GOOD, 170], ['acl: "public-read"', BAD, 290]].forEach(([s, col, y], i) => { const a = 0.4 + i * 0.6, x = lerp(120, i ? 420 : 760, E(u, a, a + 0.8));
        bucketIcon(x, y - 8, 1, col); mono(x, y + 34, s, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col });
        if (u > a + 0.8) (i ? cross : check)(x + 44, y - 8, 10, pop(u, a + 0.8)); });
      card(760, 330, 330, 50, { rx: 10, stroke: BAD, sw: 2, fill: C.BADBG, s: pop(u, 2.0) });
      tx(760, 336, 'reportViolation · 배포 중단', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); return; }
    // k3: Sentinel 도 같은 일을
    split(null);
    codeBox(20, 60, 450, [['enforcementLevel: "mandatory"', true], ['validateResourceOfType(BucketV2, …)', true]]);
    codeBox(492, 60, 452, [['policy "s3-must-be-private" {', true], ['  enforcement_level = "hard-mandatory" }', true]], { col: INFO });
    gate(245, 250, 'CrossGuard', ACC, pop(u, 0.5)); gate(715, 250, 'Sentinel / OPA', INFO, pop(u, 0.8));
    [245, 715].forEach((x, i) => { bucketIcon(x - 110, 250, 1, BAD); cross(x - 50, 250, 10, pop(u, 1.2 + i * 0.2)); });
    note('문법은 달라도 정책을 자동으로 강제하는 목적은 같다', 1.8, u, INK, 480, 390); }

  const quiz = [
    { q: 'Pulumi의 index.ts에서 bucket.arn을 bucket.ar로 잘못 치면 언제 알 수 있나?',
      o: ['편집기 자동완성과 컴파일 단계에서', 'pulumi up이 끝난 뒤 AWS 콘솔에서', 'Terraform plan을 돌려야'], a: 0,
      why: 'bucket 변수의 타입을 IDE가 알아서 .arn을 자동완성하고, 없는 속성은 컴파일에서 오류가 난다.' },
    { q: 'pulumi config set --secret dbPassword로 넣은 값은 state에 어떻게 남나?',
      o: ['평문 "s3cr3t" 그대로', '암호문(ciphertext)으로', 'state에는 남지 않는다'], a: 1,
      why: 'Pulumi는 secret을 state 안에서 기본 암호화한다. Terraform state는 sensitive 값도 평문으로 들고 있다.' },
    { q: 'Terraform에서 prod일 때만 백업 계획을 만들려면 어떻게 쓰나?',
      o: ['if (env == "prod") 블록', 'for_each = env', 'count = var.env == "prod" ? 1 : 0'], a: 2,
      why: 'HCL에는 if가 없어 count를 1 또는 0으로 두는 우회를 쓴다. Pulumi는 언어의 if 한 줄이다.' },
    { q: 'pulumi.runtime.setMocks를 쓰면 테스트에서 무엇이 달라지나?',
      o: ['클라우드 호출 없이 프로그램을 그대로 실행해 값을 검사한다', '실제 AWS에 테스트용 리소스를 만든다', 'Terraform provider로 바꿔 실행한다'], a: 0,
      why: 'newResource와 call을 가짜로 바꿔 id와 입력값을 돌려준다. 그래서 Jest로 태그 같은 값을 바로 단언할 수 있다.' },
    { q: 'CrossGuard 정책의 enforcementLevel이 mandatory일 때 public-read 버킷을 preview 하면?',
      o: ['경고만 띄우고 그대로 배포한다', '위반으로 보고하고 배포를 멈춘다', '버킷을 자동으로 private로 바꾼다'], a: 1,
      why: 'mandatory는 어기면 막는 수준이다. reportViolation이 호출되면 배포가 진행되지 않는다.' },
  ];

  const summary = [
    'Pulumi는 범용 언어로, Terraform은 HCL이라는 전용 DSL로 인프라를 쓴다.',
    '둘 다 state를 쓰고 저장소만 다르며, Pulumi는 secret을 state 안에서 암호화한다.',
    '반복과 조건은 Terraform이 for_each와 count 트릭, Pulumi는 언어의 map과 if로 쓴다.',
    '생태계는 Terraform, 단위 테스트는 Pulumi가 편하고, 고르는 기준은 팀의 언어와 기존 자산이다.',
  ];
  const review = [
    { q: '이미 HCL 모듈이 수백 개이고 인프라 전담 팀이 HCL에 익숙하다. 새 서비스 인프라를 무엇으로 시작하나?',
      o: ['Terraform을 계속 쓴다', '당장 전부 Pulumi로 옮긴다', '두 도구로 같은 리소스를 함께 관리한다'], a: 0,
      why: '두 도구가 만드는 인프라는 같다. 기존 자산과 팀 역량이 HCL 쪽이면 유지가 가장 싸다.' },
    { q: 'Terraform에서 Pulumi로 옮기는데 운영 중인 버킷을 지우면 안 된다. 쓸 명령은?',
      o: ['pulumi up으로 같은 이름 버킷을 새로 만든다', 'pulumi import로 기존 버킷을 state에 흡수한다', 'terraform destroy 뒤 다시 만든다'], a: 1,
      why: 'pulumi import는 살아 있는 리소스를 지우지 않고 state로 들인다. 코드는 pulumi convert --from terraform으로 옮긴다.' },
    { q: 'AZ마다 subnet을 만드는 HCL에 cidrsubnet(…, index(…))가 겹쳐 읽기 어렵다는 말이 나왔다. Pulumi로 쓰면 어떻게 되나?',
      o: ['같은 함수 중첩을 그대로 써야 한다', 'subnet은 Pulumi로 만들 수 없다', 'azs.map((az, i) => …) 안에서 10.0.${i}.0/24처럼 쓴다'], a: 2,
      why: '배열의 map과 템플릿 리터럴로 같은 10.0.0.0/24 · 10.0.1.0/24 · 10.0.2.0/24를 만든다.' },
  ];

  R.page({ title: 'Pulumi vs Terraform', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
