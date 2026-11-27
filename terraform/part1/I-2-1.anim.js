/* I-2-1 IaC 도구 비교 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone,
    server, cross, check, lock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통 부품 ----------
  // 왼쪽 코드 판: lines = [[처음 보이는 beat, 글]]. 지금 beat 줄은 밝게, 넘치면 앞줄을 밀어 올린다
  function codePanel(title, lines, k, u, o) { o = o || {}; const x = 20, y = 20, w = o.w || 400, h = 380, lh = 20, max = 16;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 24, title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const vis = lines.filter(([at]) => at <= k), first = Math.max(0, vis.length - max);
    vis.slice(first).forEach(([at, s], i) => { const yy = y + 52 + i * lh, cur = at === k, op = cur ? fade(u, 0.15) : 1;
      if (cur) el('rect', { x: x + 6, y: yy - 14, width: w - 12, height: lh, rx: 4, fill: ACCBG, opacity: op });
      R.spans(x + 14, yy, R.tokens(s), { 'font-size': 13.5, opacity: op }); }); }
  // 문서 아이콘
  function doc(cx, cy, name, o) { o = o || {}; const w = o.w || tw(name, 13.5) + 30, h = o.h || 48, x = cx - w / 2, y = cy - h / 2, col = o.col || INK, g = R.G(0, 0, 1, o.op);
    el('path', { d: `M${x},${y} H${x + w - 14} L${x + w},${y + 14} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 2 }, g);
    mono(cx, cy + 5, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col }, g); }
  // 클라우드 이름표 (점선 판)
  function cloudBox(x, y, w, h, name, o) { o = o || {};
    zone(x, y, w, h, null, { fill: o.fill || PANEL, stroke: o.col || INFO, dash: '7 5', sw: 2, op: o.op });
    mono(x + 12, y + 20, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.col || INFO, opacity: o.op ?? 1 }); }
  const node = (cx, cy, s, o) => { o = o || {}; card(cx, cy, o.w || tw(s, 14) + 28, o.h || 38, { rx: o.rx ?? 8, text: s, fs: 14, mono: o.mono !== false, stroke: o.hot ? ACC : o.col || INK, fill: o.hot ? ACCBG : o.fill || PANEL, sw: o.hot ? 2.5 : 1.8, s: o.s, op: o.op, color: o.color }); };
  const note = (s, u0, u, col) => tx(690, 396, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, u0) });
  const tagChips = (x, y, tags, u0, u, hiIdx) => tags.forEach((t, i) => pill(x, y + i * 32, t, i === hiIdx ? ACC : MUT, pop(u, u0 + i * 0.25), { fs: 13.5, mono: true }));

  // =========================================================
  // 1. Terraform — .tf → CLI + provider 플러그인 → 클라우드
  // =========================================================
  const TFL = [[0, 'terraform {'], [0, '  required_version = ">= 1.6.0"'], [0, '  aws = { version = "~> 5.0" } }'],
    [1, 'provider "aws" {'], [1, '  region = "ap-northeast-2" }'],
    [2, 'variable "instance_type" {'], [2, '  default = "t3.micro" }'],
    [3, 'resource "aws_instance" "web" {'], [3, '  instance_type = var.instance_type'],
    [4, '  tags = { Name = "demo-web"'], [4, '    ManagedBy = "Terraform" } }'],
    [5, 'output "public_ip" {'], [5, '  value = aws_instance.web.public_ip }']];
  function s1(t, c) { const { k, u } = c;
    codePanel('terraform.tf (줄인 모양)', TFL, k, u);
    // 오른쪽 고정 배치
    doc(500, 60, 'main.tf', {});
    grow(540, 60, 600, 60, 1, MUT);
    node(680, 60, 'terraform', { hot: k === 0 || k === 2 });
    grow(760, 60, 820, 60, 1, MUT);
    doc(880, 60, '.tfstate', { col: k === 7 ? BAD : INK, sw: k === 7 ? 3 : 2 });
    const plugs = [['aws', 590], ['google', 690], ['azurerm', 800]];
    plugs.forEach(([p, x], i) => { el('line', { x1: 680, y1: 79, x2: x, y2: 128, stroke: GRID, 'stroke-width': 2 });
      node(x, 146, p, { hot: (k === 0 || k === 1) && i === 0, op: k === 1 && i ? 0.45 : 1, rx: 18 }); });
    cloudBox(450, 190, 480, 170, k >= 1 ? 'AWS · ap-northeast-2' : 'AWS', { col: k === 1 ? ACC : INFO });
    if (k === 0) { lock(642, 34, true, ACC, pop(u, 0.4)); mono(680, 104, '>= 1.6.0', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
      lock(560, 122, true, ACC, pop(u, 0.9)); mono(590, 182, '~> 5.0', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      note('본체와 provider 버전을 파일에 고정한다', 1.6, u); return; }
    if (k === 1) { grow(590, 165, 590, 188, E(u, 0.3, 1.0), ACC); note('provider만 바꿔 끼우면 다른 클라우드', 1.4, u); return; }
    if (k === 2) { fly(300, 150, 680, 60, seg(u, 0.3, 1.4), 'var.instance_type = "t3.micro"', { mono: true });
      pill(690, 270, 'instance_type ← var', ACC, pop(u, 1.5), { mono: true }); note('환경마다 달라질 값을 변수 한곳에', 1.8, u); return; }
    // k3 이후: 인스턴스가 있다
    const es = k === 3 ? pop(u, 0.6) : 1; server(540, 270, null, { s: 0.8 * es, lamp: GOOD });
    mono(600, 262, 'aws_instance.web', { 'font-size': 14, 'font-weight': 700, opacity: es }); mono(600, 284, 't3.micro', { 'font-size': 14, fill: MUT, opacity: es });
    if (k === 3) { dot([[680, 80], [680, 175], [560, 230]], seg(u, 0.2, 0.8), ACC, 7); note('최종 상태만 적으면 도구가 맞춘다', 1.6, u); return; }
    if (k === 4) { tagChips(820, 230, ['Name = demo-web', 'Environment = dev', 'ManagedBy = Terraform'], 0.3, u, 2); note('콘솔에서 만든 것과 구분하는 표시', 1.6, u); return; }
    if (k === 5) { fly(540, 318, 690, 330, seg(u, 0.3, 1.2), 'public_ip', { mono: true });
      R.terminal(450, 300, 480, 96, ['Outputs:', 'public_ip = "(apply 뒤에 정해진다)"'], fade(u, 1.2) * 2, {}); return; }
    if (k === 6) { [['HCL', '읽기 쉬운 선언'], ['Provider', '수천 개'], ['state', '현재 상태 기록'], ['plan', '적용 전 미리보기'], ['그래프', '순서 자동']].forEach(([a, b], i) => { const x = 498 + i * 98, s = pop(u, 0.3 + i * 0.3);
        card(x, 334, 90, 56, { rx: 8, stroke: GOOD, sw: 2, fill: C.GOODBG, s }); tx(x, 330, a, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, opacity: s });
        tx(x, 350, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); });
      return; }
    // k7: 대가 — state 와 lock 을 직접 챙긴다
    lock(918, 30, true, BAD, pop(u, 0.4));
    card(690, 330, 440, 44, { rx: 10, stroke: BAD, sw: 2.2, fill: C.BADBG, text: 'state 백엔드 · lock을 직접 챙겨야 한다', fs: 15, color: BAD, s: pop(u, 0.8) });
    note('HCL의 반복·조건 표현은 제한적', 1.6, u, WARN); }

  // =========================================================
  // 2. CloudFormation — YAML 템플릿 → AWS 안의 서비스 → 스택
  // =========================================================
  const CFL = [[0, 'AWSTemplateFormatVersion: "2010-09-09"'], [0, 'Description: Demo EC2 instance'],
    [1, 'Parameters:'], [1, '  InstanceType:'], [1, '    Default: t3.micro'], [1, '    AllowedValues: [t3.micro, t3.small]'],
    [2, 'Resources:'], [2, '  WebInstance:'], [2, '    Type: AWS::EC2::Instance'], [2, '      InstanceType: !Ref InstanceType'],
    [3, '      Tags:'], [3, '        - Key: ManagedBy'], [3, '          Value: CloudFormation'],
    [4, 'Outputs:'], [4, '  PublicIp:'], [4, '    Value: !GetAtt WebInstance.PublicIp'], [4, '    Export: !Sub "${AWS::StackName}-PublicIp"']];
  function cfnBase(k, u, o) { o = o || {};
    doc(510, 60, 'template.yaml', { col: o.docHot ? ACC : INK });
    cloudBox(600, 24, 340, 300, 'AWS 계정 안', {});
    node(770, 70, 'CloudFormation', { mono: false, hot: o.cfnHot });
    grow(565, 60, 680, 66, 1, MUT);
    zone(630, 110, 280, 200, null, { fill: SOFT, stroke: o.stackCol || GRID, sw: 2 }); mono(644, 132, 'Stack: demo', { 'font-size': 14, 'font-weight': 700, fill: o.stackCol || INK });
    grow(770, 89, 770, 110, 1, MUT); }
  function s2(t, c) { const { k, u } = c;
    codePanel('cloudformation.yaml (줄인 모양)', CFL, k, u);
    if (k <= 5) cfnBase(k, u, { docHot: k === 0, cfnHot: k === 5, stackCol: k === 5 ? GOOD : null });
    const inst = (s) => { server(700, 210, null, { s: 0.7 * s, lamp: GOOD }); mono(770, 200, 'WebInstance', { 'font-size': 14, 'font-weight': 700, opacity: s }); };
    if (k === 0) { dot([[565, 60], [680, 66], [770, 110]], seg(u, 0.4, 1.4), ACC, 7); note('템플릿 파일 하나 = 스택 하나', 1.4, u); return; }
    if (k === 1) { [['t3.micro', GOOD, true], ['t3.small', GOOD, true], ['t3.large', BAD, false]].forEach(([v, col, ok], i) => { const y = 160 + i * 46, s = pop(u, 0.3 + i * 0.4);
        node(720, y, v, { col, s }); (ok ? check : cross)(820, y, 9, s); });
      note('AllowedValues 밖의 값은 배포 전에 거절', 1.8, u); return; }
    if (k >= 2 && k <= 4) inst(k === 2 ? pop(u, 0.4) : 1);
    if (k === 2) { pill(520, 210, '!Ref InstanceType', ACC, pop(u, 0.9), { mono: true }); grow(590, 210, 660, 210, E(u, 1.1, 1.6), ACC); note('!Ref · !GetAtt · !Sub를 알아야 한다', 1.8, u); return; }
    if (k === 3) { tx(690, 352, 'tags를 적는 데 드는 줄 수', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['HCL', 5, GOOD], ['YAML', 7, WARN]].forEach(([n, v, col], i) => { const x = 480 + i * 240; tx(x, 384, n, { 'font-size': 14.5, 'font-weight': 700, fill: col });
        hbar(x + 46, 372, 120, v, 7, { u: E(u, 0.4 + i * 0.4, 1.4 + i * 0.4), col, text: v + '줄' }); });
      return; }
    if (k === 4) { grow(800, 230, 880, 290, E(u, 0.3, 1.0), ACC); pill(840, 270, 'demo-PublicIp', ACC, pop(u, 1.0), { mono: true, fs: 13.5 });
      node(770, 360, '다른 스택 · !ImportValue', { s: pop(u, 1.5), mono: false }); grow(840, 286, 800, 340, E(u, 1.6, 2.2), ACC); return; }
    if (k === 5) { inst(1); doc(860, 260, 'state', { col: GOOD, op: fade(u, 0.3) }); tx(860, 296, 'AWS가 보관', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) });
      pill(530, 160, '실패하면 자동 롤백', WARN, pop(u, 1.0)); pill(530, 220, 'IAM 권한과 1:1', INFO, pop(u, 1.4)); return; }
    if (k === 6) { cloudBox(450, 40, 140, 120, 'AWS', { col: GOOD }); check(520, 110, 14, pop(u, 0.3));
      [['GCP', 680], ['Azure', 850]].forEach(([n, x], i) => { cloudBox(x - 70, 40, 140, 120, n, { col: BAD }); cross(x, 110, 22, pop(u, 0.6 + i * 0.4)); });
      card(690, 280, 420, 120, { rx: 10, stroke: WARN, sw: 2 }); tx(500, 252, 'YAML 1000줄을 넘으면', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      for (let i = 0; i < 7; i++) el('rect', { x: 500, y: 266 + i * 14, width: lerp(60, 380, ((i * 37) % 10) / 10) * E(u, 1.3 + i * 0.1, 2.0 + i * 0.1), height: 8, rx: 3, fill: OFF });
      return; }
    // k7: 옮겨 가는 방향
    node(520, 200, 'CloudFormation', { mono: false, s: pop(u, 0.2) });
    [['AWS만 쓰는 조직', 'AWS CDK', 110], ['멀티클라우드 조직', 'Terraform', 290]].forEach(([who, to, y], i) => { grow(600, 200, 760, y, E(u, 0.5 + i * 0.5, 1.2 + i * 0.5), ACC);
      node(840, y, to, { mono: false, hot: true, s: pop(u, 1.1 + i * 0.5) }); tx(690, y + (i ? 34 : -22), who, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.5) }); }); }

  // =========================================================
  // 3. Pulumi — 파이썬 코드가 그대로 실행되어 자원을 등록한다
  // =========================================================
  const PUL = [[0, 'import pulumi'], [0, 'import pulumi_aws as aws'],
    [1, 'config = pulumi.Config()'], [1, 'instance_type = (config.get("instanceType")'], [1, '                 or "t3.micro")'],
    [2, 'def make_tags(name: str, env: str) -> dict:'], [2, '    return {"Name": name, "Environment": env, ...}'],
    [3, 'web = aws.ec2.Instance("web", ami=..., '], [3, '    instance_type=instance_type,'], [3, '    tags=make_tags(...))'],
    [4, 'for i in range(3):'], [4, '    worker = aws.ec2.Instance(f"worker-{i}", ...)'], [4, '    workers.append(worker)'],
    [5, 'pulumi.export("public_ip", web.public_ip)'], [5, 'pulumi.export("worker_ids",'], [5, '              [w.id for w in workers])']];
  function s3(t, c) { const { k, u } = c;
    codePanel('pulumi.py (줄인 모양)', PUL, k, u, { w: 420 });
    // 오른쪽 흐름: 파이썬 → Pulumi 엔진 → AWS
    node(530, 50, 'python', { hot: k <= 2, rx: 18 }); grow(580, 50, 640, 50, 1, MUT); node(720, 50, 'Pulumi 엔진', { mono: false }); grow(800, 50, 850, 50, 1, MUT); node(890, 50, 'aws', { rx: 18 });
    cloudBox(460, 100, 480, 250, 'AWS', {});
    if (k === 0) { [['pip install pulumi', 160], ['pip install pulumi-aws', 220]].forEach(([s, y], i) => pill(700, y, s, ACC, pop(u, 0.3 + i * 0.4), { mono: true }));
      note('새 언어가 아니라 파이썬 패키지', 1.4, u); return; }
    if (k === 1) { node(700, 150, 'config.get("instanceType")', { s: pop(u, 0.2) });
      [['값이 있으면', 't3.small', 560], ['없으면 or', 't3.micro', 840]].forEach(([a, v, x], i) => { grow(700, 170, x, 230, E(u, 0.5 + i * 0.4, 1.0 + i * 0.4), i ? ACC : MUT);
node(x, 250, v, { hot: i === 1, s: pop(u, 0.9 + i * 0.4) }); tx(x, 290, a, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.4) }); });
      note('기본값도 파이썬 문법 그대로', 1.8, u); return; }
    if (k === 2) { card(700, 210, 300, 120, { rx: 12, stroke: ACC, sw: 2.2, s: pop(u, 0.2) }); mono(570, 170, 'make_tags(name, env)', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      ['"Name": name', '"Environment": env', '"ManagedBy": "Pulumi"'].forEach((s, i) => mono(580, 200 + i * 24, s, { 'font-size': 14, opacity: fade(u, 0.7 + i * 0.3) }));
      note('함수로 묶어 어디서나 다시 쓴다', 1.8, u); return; }
    const shown = k === 3 ? 1 : 4, wk = k === 4 ? Math.floor(lerp(0, 3.99, E(u, 0.3, 2.2))) : 3;
    server(540, 200, null, { s: 0.7 * (k === 3 ? pop(u, 0.5) : 1), lamp: GOOD }); mono(540, 262, 'web', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
    if (k === 3) { dot([[580, 50], [720, 50], [890, 70], [560, 170]], seg(u, 0.2, 1.0), ACC, 7); note('생성자를 부르면 자원이 등록된다', 1.6, u); return; }
    for (let i = 0; i < wk; i++) { const x = 680 + i * 90, s = k === 4 ? pop(u, 0.4 + i * 0.6) : 1; server(x, 200, null, { s: 0.55 * s, lamp: ACC }); mono(x, 254, `worker-${i}`, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: s }); }
    if (k === 4) { mono(860, 132, `i = ${Math.min(wk, 2)}`, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: ACC }); note('count/for_each 대신 for 문', 2.2, u); return; }
    if (k === 5) { R.terminal(470, 270, 460, 96, ['public_ip  : (배포 뒤에 정해진다)', 'worker_ids : [3개 id]'], fade(u, 0.6) * 2, {}); return; }
    if (k === 6) { [['자동완성', '타입 체크'], ['pytest', '단위 테스트']].forEach(([a, b], i) => { const x = 590 + i * 200, s = pop(u, 0.4 + i * 0.5);
        card(x, 310, 170, 60, { rx: 10, stroke: GOOD, sw: 2, fill: C.GOODBG, s }); tx(x, 306, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: s }); tx(x, 326, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); check(x + 70, 296, 7, s); });
      return; }
    // k7 대가
    card(700, 316, 460, 54, { rx: 10, stroke: BAD, sw: 2.2, fill: C.BADBG, s: pop(u, 0.4), text: '인프라 코드인지 앱 코드인지 흐려진다', fs: 15, color: BAD });
    note('생태계는 Terraform보다 작다', 1.4, u, WARN); }

  // =========================================================
  // 4. AWS CDK — TypeScript → cdk synth → CloudFormation 템플릿
  // =========================================================
  const CDKL = [[0, 'import * as cdk from "aws-cdk-lib";'], [0, 'import * as ec2 from "aws-cdk-lib/aws-ec2";'],
    [1, 'interface DemoStackProps extends cdk.StackProps {'], [1, '  instanceType?: ec2.InstanceType; ... }'],
    [2, 'export class DemoStack extends cdk.Stack {'],
    [3, 'const vpc = new ec2.Vpc(this, "DemoVpc",'], [3, '  { maxAzs: 2 });'],
    [4, 'const sg = new ec2.SecurityGroup(this, "WebSg",'], [4, '  { vpc, ... });'], [4, 'sg.addIngressRule(..., ec2.Port.tcp(80));'],
    [5, 'const web = new ec2.Instance(this, "WebInstance", {'], [5, '  vpc, instanceType, securityGroup: sg, ... });'],
    [6, 'cdk.Tags.of(web).add("ManagedBy", "CDK");'], [6, 'new cdk.CfnOutput(this, "PublicIp", ...);'],
    [7, 'const app = new cdk.App();'], [7, 'new DemoStack(app, "DemoStack", ...);'], [8, '// TS 에러 → CFN 에러, 두 단계']];
  function synthBar(k, u, hot) { const items = [['cdk.ts', 478, 76], ['cdk synth', 598, 104], ['template.yaml', 740, 128], ['CloudFormation', 878, 124]];
    items.forEach(([n, x, w], i) => { const h = hot === i; if (i === 0 || i === 2) doc(x, 54, n, { col: h ? ACC : INK, w }); else node(x, 54, n, { hot: h, mono: i === 1, rx: i === 1 ? 18 : 8, w });
      if (i) { const [, px, pw] = items[i - 1]; grow(px + pw / 2 + 3, 54, x - w / 2 - 3, 54, 1, MUT); } }); }
  function s4(t, c) { const { k, u } = c;
    codePanel('cdk.ts (줄인 모양)', CDKL, k, u, { w: 420 });
    synthBar(k, u, k === 7 ? 1 : k === 0 ? 0 : k === 8 ? 3 : -1);
    if (k === 0) { [['npm i aws-cdk-lib', 170], ['npm i constructs', 230]].forEach(([s, y], i) => pill(690, y, s, ACC, pop(u, 0.3 + i * 0.4), { mono: true })); note('겉보기엔 평범한 TypeScript 프로젝트', 1.4, u); return; }
    if (k === 1) { card(690, 200, 420, 110, { rx: 10, stroke: GRID, sw: 1.5, fill: SOFT });
      mono(500, 186, 'instanceTyp: ...', { 'font-size': 15, 'font-weight': 700 });
      el('path', { d: `M500,194 ${Array.from({ length: 12 }, (_, i) => `l5,${i % 2 ? -4 : 4}`).join(' ')}`, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.6) });
      tx(500, 226, '컴파일할 때 오타가 잡힌다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); cross(860, 200, 14, pop(u, 1.0));
      note('배포까지 가기 전에 멈춘다', 1.8, u); return; }
    if (k === 2) { node(560, 200, 'class DemoStack', { hot: true, s: pop(u, 0.2) }); grow(650, 200, 760, 200, E(u, 0.6, 1.2), ACC);
      zone(770, 150, 160, 100, null, { fill: SOFT, stroke: INK, sw: 2, op: fade(u, 1.1) }); tx(850, 206, 'CFN 스택', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.2) });
      note('클래스 하나가 스택 하나', 1.8, u); return; }
    if (k === 3) { node(560, 140, 'new ec2.Vpc(...)', { hot: true, s: pop(u, 0.2) });
      const parts = [['Subnet', '×4'], ['RouteTable', '×4'], ['NAT GW', '×2'], ['EIP', '×2'], ['IGW', '×1']];
      parts.forEach(([n, q], i) => { const m = E(u, 0.5 + i * 0.25, 1.2 + i * 0.25), x = lerp(560, 520 + (i % 3) * 140, m), y = lerp(140, 230 + Math.floor(i / 3) * 62, m);
        if (m <= 0) return; card(x, y, 124, 46, { rx: 8, stroke: INFO, sw: 1.8, op: clamp(m * 2) }); tx(x - 8, y + 5, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: clamp(m * 2) }); mono(x + 54, y + 5, q, { 'text-anchor': 'end', 'font-size': 13.5, fill: INFO, opacity: clamp(m * 2) }); });
      sub(690, 390, '기본값 기준 (AZ 2개, AZ마다 public·private 서브넷과 NAT)', fade(u, 2), { 'font-size': 13.5 }); return; }
    if (k === 4) { node(560, 180, 'WebSg', { hot: true, s: pop(u, 0.2) }); grow(610, 180, 700, 180, E(u, 0.6, 1.2), ACC);
      pill(800, 180, '.addIngressRule(80)', ACC, pop(u, 1.0), { mono: true }); note('규칙 추가가 메서드 호출 한 번', 1.6, u); return; }
    if (k === 5) { node(560, 150, 'ec2.Instance', { hot: true, s: pop(u, 0.2) });
      [['IAM Role', 210], ['Instance Profile', 270], ['AMI 조회 (SSM)', 330]].forEach(([n, y], i) => { const s = pop(u, 0.7 + i * 0.35);
        grow(610, 168, 696, y, E(u, 0.5 + i * 0.35, 0.9 + i * 0.35), INFO); card(790, y, 180, 40, { rx: 8, stroke: INFO, sw: 1.8, dash: '6 4', text: n, fs: 14, s }); });
      tx(460, 300, '적지 않아도', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); tx(460, 322, '따라 생긴다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 6) { tagChips(560, 170, ['Name = demo-web', 'ManagedBy = CDK'], 0.3, u, 1);
      grow(660, 250, 740, 250, E(u, 0.9, 1.4), ACC); node(560, 250, 'CfnOutput PublicIp', { s: pop(u, 0.6) }); doc(840, 250, 'Outputs:', { s: 1, op: fade(u, 1.4), w: 140 });
      note('합성하면 CFN의 Outputs가 된다', 1.8, u); return; }
    if (k === 7) { dot([[500, 54], [620, 54], [755, 54]], seg(u, 0.2, 1.3), ACC, 8);
      card(755, 210, 290, 200, { rx: 6, fill: PANEL, stroke: GRID, s: pop(u, 1.2) });
      ['Resources:', '  DemoVpc…: AWS::EC2::VPC', '  WebSg…: AWS::EC2::SecurityGroup', '  WebInstance…: AWS::EC2::Instance', 'Outputs:', '  PublicIp: ...'].forEach((s, i) => mono(622, 134 + i * 22, s, { 'font-size': 13.5, opacity: fade(u, 1.4 + i * 0.15) }));
      note('cdk synth가 만든 CFN 템플릿 (예시)', 2.2, u); return; }
    // k8: 두 단계 디버깅
    card(560, 200, 200, 60, { rx: 10, stroke: WARN, sw: 2, text: 'TS 컴파일 에러', fs: 15, s: pop(u, 0.3) });
    card(830, 200, 200, 60, { rx: 10, stroke: BAD, sw: 2, text: 'CFN 배포 에러', fs: 15, s: pop(u, 0.7) });
    el('path', { d: 'M830,232 C830,300 560,300 560,232', fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.1) });
    tx(695, 300, '배포 에러를 TS 코드 줄로 되짚어야 한다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
    note('AWS 전용, 추상화가 과할 수 있다', 2, u, WARN); }

  // =========================================================
  // 5. 시나리오별 선택
  // =========================================================
  const PICK = [['멀티클라우드', 'Terraform'], ['AWS만 · TS/Python 팀', 'AWS CDK'], ['멀티 + 테스트 필수', 'Pulumi'], ['AWS만 · CFN 자산 많음', 'CFN 유지'], ['온프레미스 혼합', 'Terraform']];
  const MX = { cols: ['Terraform', 'CFN', 'Pulumi', 'CDK'], rows: [['멀티클라우드', '◎', '✕', '◎', '△'], ['벤더 락인', '낮음', '높음', '낮음', '높음'], ['학습곡선', '중', '중', '낮음', '낮음'],
    ['언어', 'HCL', 'YAML', 'Py/TS/Go', 'TS/Py'], ['State', '직접', 'AWS', '직접/클라우드', 'AWS'], ['비용', '무료', '무료', '유료 옵션', '무료'], ['생태계', '★★★★★', '★★★', '★★★', '★★★★'], ['신규 서비스', '대기', '즉시', '대기', '즉시']] };
  const GOODV = new Set(['◎', '낮음', '무료', '즉시', '★★★★★', 'AWS']);
  function tree(k, u) { // 결정 트리
    const N = { q1: [480, 60, '클라우드가 AWS 하나뿐?'], q2: [250, 180, '팀이 TS/Python에 능숙?'], q3: [710, 180, '무엇을 먼저 보나?'],
      cdk: [150, 320, 'AWS CDK'], cfn: [350, 320, 'CloudFormation'], tf: [610, 320, 'Terraform'], pu: [810, 320, 'Pulumi'] };
    const at = (id, a) => (k === 2 && ['q1', 'q2', 'cdk', 'cfn'].includes(id) ? pop(u, a) : k === 3 && ['q3', 'tf', 'pu'].includes(id) ? pop(u, a) : 1);
    const show = (id) => k >= 3 || ['q1', 'q2', 'cdk', 'cfn'].includes(id);
    const E2 = [['q1', 'q2', 'Yes', 0.5], ['q2', 'cdk', 'Yes', 1.1], ['q2', 'cfn', 'No', 1.4], ['q1', 'q3', 'No (멀티)', 0.5], ['q3', 'tf', '표준·생태계', 1.1], ['q3', 'pu', '일반 언어·테스트', 1.4]];
    E2.forEach(([a, b, lab, t0]) => { if (!show(b)) return; const [x1, y1] = N[a], [x2, y2] = N[b], cur = (k === 2 && t0 && ['q2', 'cdk', 'cfn'].includes(b)) || (k === 3 && ['q3', 'tf', 'pu'].includes(b));
      const g = cur ? E(u, t0 - 0.3, t0 + 0.3) : 1; grow(x1, y1 + 22, lerp(x1, x2, 0.92), lerp(y1 + 22, y2 - 22, 0.92), g, cur ? ACC : MUT, { plain: true });
      tx((x1 + x2) / 2 + (x2 > x1 ? 14 : -14), (y1 + y2) / 2 + 6, lab, { 'text-anchor': x2 > x1 ? 'start' : 'end', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: g }); });
    Object.entries(N).forEach(([id, [x, y, s]]) => { if (!show(id)) return; const leaf = !id.startsWith('q'), star = leaf && id !== 'cfn';
      card(x, y, tw(s, 15) + 34, 44, { rx: leaf ? 22 : 8, text: (star ? '★ ' : '') + s, fs: 15, fw: 700, stroke: leaf ? (star ? ACC : INK) : INK, fill: leaf && star ? ACCBG : PANEL, sw: 2, s: at(id, leaf ? 1.4 : 0.6) }); }); }
  function matrix(rows, u, u0) { const x0 = 230, cw = 160, rh = 40, y0 = 70;
    MX.cols.forEach((n, j) => tx(x0 + j * cw + cw / 2, y0 - 14, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }));
    rows.forEach((r, i) => { const y = y0 + i * rh, a = u0 + i * 0.25;
      tx(x0 - 14, y + rh / 2 + 5, r[0], { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
      r.slice(1).forEach((v, j) => { const good = GOODV.has(v) || (r[0] === '학습곡선' && v === '낮음'), bad = v === '✕' || v === '높음' || v === '대기';
        card(x0 + j * cw + cw / 2, y + rh / 2, cw - 8, rh - 6, { rx: 6, fill: good ? C.GOODBG : bad ? C.BADBG : PANEL, stroke: good ? GOOD : bad ? BAD : GRID, sw: 1.4, text: v, fs: 14.5, fw: 700, color: good ? GOOD : bad ? BAD : INK, s: pop(u, a + j * 0.08) }); }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { tx(60, 44, '상황', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(640, 44, '추천', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      PICK.forEach(([a, b], i) => { if (k === 0 && i > 0) return; const y = 84 + i * 64, s = k === 0 || i > 0 ? pop(u, 0.2 + i * 0.3) : 1;
        card(300, y, 500, 50, { rx: 10, stroke: GRID, sw: 1.5, text: a, fs: 16, s }); grow(560, y, 620, y, k === 0 || i > 0 ? E(u, 0.5 + i * 0.3, 0.9 + i * 0.3) : 1, ACC);
        card(740, y, 220, 50, { rx: 25, stroke: ACC, sw: 2.2, fill: ACCBG, text: b, fs: 16, fw: 800, color: ACC, s: k === 0 || i > 0 ? pop(u, 0.8 + i * 0.3) : 1 }); });
      if (k === 0) tx(480, 260, '첫 질문은 클라우드가 몇 개인가', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      return; }
    if (k <= 3) { tree(k, u); return; }
    if (k === 4) { matrix(MX.rows.slice(0, 3), u, 0.2); tx(480, 250, '락인이 낮은 쪽은 Terraform과 Pulumi', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 5) { matrix(MX.rows.slice(3), u, 0.2); return; }
    if (k === 6) { // 한 자원을 두 도구가 관리하면
      server(480, 220, null, { s: 0.9, lamp: BAD }); tx(480, 300, 'aws_instance.web', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      [['Terraform state', 180], ['CDK 스택 (CFN)', 780]].forEach(([n, x], i) => { doc(x, 120, n, { w: 200, col: BAD, op: fade(u, 0.3 + i * 0.4) }); grow(x + (i ? -60 : 60), 145, 480 + (i ? 66 : -66), 200, E(u, 0.6 + i * 0.4, 1.2 + i * 0.4), BAD); });
      tx(480, 120, '둘 다 내 것이라 주장', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
      ['유행 따라 고른 도구, 팀에 쓸 줄 아는 사람 1명', '작은 토이 프로젝트에 무거운 도구'].forEach((s, i) => tx(480, 350 + i * 28, s, { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 2 + i * 0.2) }));
      return; }
    if (k === 7) { // 한 모듈씩 옮기기
      tx(200, 50, '기존 인프라', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); tx(760, 50, '새 도구', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
      const mods = ['network', 'security', 'compute', 'database', 'dns'], moved = Math.floor(lerp(0, 2.99, E(u, 0.3, 2.3)));
      mods.forEach((m, i) => { const done = i < moved, mv = i === moved ? E(u, 0.3 + i * 0.7, 0.9 + i * 0.7) : 0, x = done ? 760 : lerp(200, 760, mv);
        card(x, 100 + i * 56, 180, 44, { rx: 8, text: m, fs: 15, mono: true, stroke: done || mv > 0.5 ? ACC : INK, fill: done ? ACCBG : PANEL }); });
      pill(480, 380, 'import로 흡수 (예: terraform import, cdk migrate)', INFO, pop(u, 1.2), { fs: 13.5 }); return; }
    // k8: 5년 유지보수
    tx(480, 70, '도구를 고르는 기준', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    const tilt = E(u, 0.6, 1.8) * 0.16; el('line', { x1: 480, y1: 120, x2: 480, y2: 300, stroke: INK, 'stroke-width': 3 });
    const L = [480 - 240 * Math.cos(tilt), 120 + 240 * Math.sin(tilt)], Rr = [480 + 240 * Math.cos(tilt), 120 - 240 * Math.sin(tilt)];
    el('line', { x1: L[0], y1: L[1], x2: Rr[0], y2: Rr[1], stroke: INK, 'stroke-width': 4 });
    card(L[0], L[1] + 40, 220, 60, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, text: '팀 학습 비용 + 5년 유지보수', fs: 14.5, fw: 800, color: ACC });
    card(Rr[0], Rr[1] + 70, 200, 60, { rx: 10, stroke: GRID, sw: 2, text: '기술적 우월성', fs: 15, color: MUT });
    tx(480, 380, '큰 조직은 Terraform으로 표준화, 작은 AWS 팀은 CDK로 빠르게', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2) }); }

  const quiz = [
    { q: 'terraform.tf에서 provider "aws" 블록이 정하는 것은 무엇인가?',
      o: ['만들 EC2의 개수', '어느 클라우드의 어느 리전과 통신할지', 'state 파일의 저장 위치'], a: 1,
      why: 'provider 블록은 ap-northeast-2처럼 어디에 만들지만 정한다. provider를 바꾸면 같은 HCL 문법으로 다른 클라우드를 쓴다.' },
    { q: 'CloudFormation을 쓰면 Terraform과 달리 사용자가 하지 않아도 되는 일은 무엇인가?',
      o: ['state를 직접 보관하고 잠그는 일', '템플릿 파일을 작성하는 일', 'IAM 권한을 주는 일'], a: 0,
      why: 'CloudFormation은 AWS가 스택 단위로 상태를 보관하고 실패하면 자동 롤백한다. 그 대가로 AWS 밖으로는 못 나간다.' },
    { q: 'pulumi.py에서 worker 3대를 만든 방법은 무엇인가?',
      o: ['count = 3 메타 인자', 'YAML의 Fn::ForEach', '파이썬 for i in range(3) 반복문'], a: 2,
      why: 'Pulumi는 일반 언어라 반복과 조건을 언어 문법 그대로 쓴다. worker-0부터 worker-2까지 생성자를 세 번 부른다.' },
    { q: 'AWS CDK로 만든 인프라를 실제로 배포하는 엔진은 무엇인가?',
      o: ['CloudFormation', 'Terraform', 'TypeScript 컴파일러'], a: 0,
      why: 'cdk synth가 TypeScript를 CloudFormation 템플릿으로 합성하고 cdk deploy가 그 템플릿을 CloudFormation으로 배포한다.' },
    { q: 'AWS만 쓰고 팀이 TypeScript에 능숙하다면 결정 트리가 고르는 도구는 무엇인가?',
      o: ['Pulumi', 'AWS CDK', 'Terraform'], a: 1,
      why: '첫 질문(클라우드가 AWS 하나인가)에서 Yes, 둘째 질문(TS/Python에 능숙한가)에서 Yes이면 AWS CDK다.' },
  ];
  const summary = [
    'Terraform은 HCL과 provider로 여러 클라우드를 같은 문법으로 다루지만 state는 직접 관리한다.',
    'CloudFormation은 AWS가 상태를 보관하고 롤백해 주지만 AWS 밖으로는 쓸 수 없다.',
    'Pulumi는 파이썬 같은 일반 언어로 쓰고, CDK는 TypeScript를 CloudFormation 템플릿으로 합성한다.',
    '도구는 클라우드가 하나인지와 팀이 익숙한 언어 두 질문으로 대부분 정해진다.',
  ];
  const review = [
    { q: '회사가 AWS와 GCP를 함께 쓰고, 인프라 팀은 일반 언어 코딩에 익숙하지 않다. 무엇을 고르는가?',
      o: ['Terraform', 'AWS CDK', 'CloudFormation'], a: 0,
      why: '멀티클라우드라 AWS 전용인 CDK와 CloudFormation은 빠진다. 일반 언어 부담이 있으니 HCL의 Terraform이 맞다.' },
    { q: '같은 EC2를 Terraform과 CDK가 함께 관리하고 있었다. 가장 먼저 생길 문제는?',
      o: ['HCL 문법 오류', '두 도구의 상태가 서로 덮어쓰며 충돌한다', '비용이 무료에서 유료로 바뀐다'], a: 1,
      why: 'Terraform state와 CDK 스택이 같은 자원을 각자 자기 것으로 기록한다. 한쪽 변경을 다른 쪽이 되돌리려 한다.' },
    { q: 'CloudFormation 템플릿 수백 개를 쓰던 팀이 CDK로 옮기려 한다. 맞는 방법은?',
      o: ['모든 스택을 지우고 CDK로 한 번에 다시 만든다', 'CDK와 CloudFormation을 같은 자원에 같이 쓴다', '한 모듈씩 가져와 점진적으로 옮긴다'], a: 2,
      why: '운영 중인 자원은 지우지 않고 가져와 흡수한다. 한 번에 다 옮기면 실패했을 때 되돌리기 어렵다.' },
  ];

  R.page({ title: 'IaC 도구 네 가지', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
