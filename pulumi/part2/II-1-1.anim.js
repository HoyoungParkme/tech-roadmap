/* II-1-1 ComponentResource — 재사용 묶음 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * super(type, name, {}, opts) · { parent: this } · registerOutputs 의 동작은 pulumi.com/docs (Components) 로 확인했다.
 * pulumi CLI 가 없어 코드는 tsc --noEmit(@pulumi/pulumi 3, @pulumi/aws 6 타입)으로만 확인했고,
 * URN 모양(부모타입$자식타입)과 리소스 수(3 × (1 + 4) = 15)는 파이썬으로 규칙을 재현해 맞췄다. 트리 출력은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 리소스 칩: 위에 타입(mono), 아래에 이름
  function chip(cx, cy, type, name, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return;
    const w = o.w || Math.max(tw(type, 13.5), tw(name || '', 15)) + 28, h = o.h || (name ? 54 : 36), col = o.col || INK;
    const g = card(cx, cy, w, h, { rx: 9, stroke: col, sw: o.sw || 2, fill: o.fill || PANEL, dash: o.dash, s, op: o.op });
    if (name) { mono(-w / 2 + 12, -5, type, { 'font-size': 13.5, fill: MUT }, g); mono(-w / 2 + 12, 17, name, { 'font-size': 15, 'font-weight': 700, fill: col }, g); }
    else mono(0, 5, type, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle' }, g);
    return g; }
  // 선이 자라는 곡선 (pathLength 로 u 만큼)
  function arc(d, u, col, o) { if (u <= 0) return; o = o || {};
    el('path', { d, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 - clamp(u), opacity: o.op ?? 1 }); }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 흩어진 4개 ----------
  const RS = [['aws.ec2.Vpc', 'dev-vpc'], ['aws.ec2.Subnet', 'dev-subnet'], ['aws.ec2.InternetGateway', 'dev-igw'], ['aws.ec2.RouteTable', 'dev-rt']];
  const RY = [72, 164, 256, 348], RX = 200, RW = 220;
  const REFS = [[1, 'dev-subnet.vpcId', 'vpc.id'], [2, 'dev-igw.vpcId', 'vpc.id'], [3, 'dev-rt.vpcId', 'vpc.id'], [3, 'dev-rt.routes[0].gatewayId', 'igw.id']];
  function s1(t, c) { const { k, u } = c;
    if (k <= 3) {
      zone(40, 24, 380, 384, 'dev 환경 (before.ts)', { fill: SOFT });
      RS.forEach(([ty, nm], i) => { if (i > k) return; chip(RX + 30, RY[i] + 10, ty, nm, { w: RW, s: i === k ? pop(u, 0.2) : 1, col: i === k ? ACC : INK }); });
      // vpc.id 배선: 왼쪽으로 휘는 곡선, igw.id: 오른쪽
      [1, 2, 3].forEach((j) => { if (j > k) return; const y0 = RY[0] + 10, y1 = RY[j] + 10, bx = RX + 30 - RW / 2, b = 22 + j * 16;
        arc(`M${bx},${y0} C${bx - b},${y0} ${bx - b},${y1} ${bx},${y1}`, j === k ? seg(u, 0.7, 1.5) : 1, j === k ? ACC : MUT); });
      if (k === 3) { const ex = RX + 30 + RW / 2; arc(`M${ex},${RY[2] + 10} C${ex + 34},${RY[2] + 10} ${ex + 34},${RY[3] + 10} ${ex},${RY[3] + 10}`, seg(u, 1.3, 2.0), WARN); }
      // 오른쪽: 손으로 이은 참조
      tx(470, 52, '손으로 이은 참조', { 'font-size': 15, 'font-weight': 700 });
      const nRef = REFS.filter((r) => r[0] <= k).length;
      REFS.forEach(([at, lhs, rhs], i) => { if (at > k) return; const y = 76 + i * 50, a = at === k ? seg(u, 0.9 + (i - 2) * 0.25, 1.6 + (i - 2) * 0.25) : 1;
        if (a <= 0) return;
        el('rect', { x: 470, y, width: 450 * a, height: 38, rx: 7, fill: at === k ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.2 });
        mono(484, y + 25, lhs, { 'font-size': 14, opacity: fade(a, 0.6, 0.4) });
        mono(906, y + 25, '← ' + rhs, { 'font-size': 14, 'font-weight': 700, fill: rhs === 'igw.id' ? WARN : ACC, 'text-anchor': 'end', opacity: fade(a, 0.6, 0.4) }); });
      const prevRef = k === 0 ? 0 : REFS.filter((r) => r[0] <= k - 1).length;
      mono(470, 300, '참조 ' + Math.round(tween(prevRef, nRef, u)) + '개 · 리소스 ' + (k + 1) + '개', { 'font-size': 16, 'font-weight': 800, fill: k === 3 ? ACC : INK });
      if (k === 0) note(470, 340, 'CIDR 10.0.0.0/16 VPC 하나. 아직 문제없다.', fade(u, 1.0));
      if (k === 3) note(470, 340, '0.0.0.0/0 → igw 라우트까지 넣어야 한 세트', fade(u, 1.8), { fill: WARN });
      return; }
    // k4: 같은 4줄을 세 환경에 복붙
    const ENV = [['dev', 170], ['staging', 480], ['prod', 790]];
    ENV.forEach(([e, cx], i) => { const s = i === 0 ? 1 : pop(u, 0.2 + i * 0.35);
      if (s <= 0) return;
      zone(cx - 148, 40, 296, 220, e + ' 환경', { fill: SOFT, op: Math.min(1, s) });
      ['Vpc', 'Subnet', 'InternetGateway', 'RouteTable'].forEach((ty, j) => chip(cx + (j % 2 ? 70 : -70), 112 + Math.floor(j / 2) * 70, ty, null, { w: 136, s }));
      if (i > 0) dot([[170, 150], [cx, 150]], seg(u, 0.05 + i * 0.3, 0.45 + i * 0.3), ACC, 6); });
    // 규칙 수정이 세 곳을 돈다. staging 만 빠뜨린다
    ENV.forEach(([e, cx], i) => { const at = 1.3 + i * 0.35; if (u < at) return;
      if (i === 1) { cross(cx, 290, 13, pop(u, at)); note(cx, 322, '고치는 걸 빠뜨림', fade(u, at + 0.1), { 'text-anchor': 'middle', fill: BAD }); }
      else { check(cx, 290, 13, pop(u, at)); note(cx, 322, '규칙 수정함', fade(u, at + 0.1), { 'text-anchor': 'middle', fill: GOOD }); } });
    banner(480, 380, '3 환경 × 4 리소스 = 12개를 따로 고친다', pop(u, 2.2)); }

  // ---------- 2. class extends ComponentResource ----------
  const KIDS = [['Vpc', 'vpc'], ['Subnet', 'subnet'], ['InternetGateway', 'igw'], ['RouteTable', 'routeTable']];
  function s2(t, c) { const { k, u } = c, ty = c.beat.component.type, ok = ty.startsWith('pkg');
    // 클래스 상자: 테두리가 그려지며 생긴다
    const bu = k === 0 ? seg(u, 0.2, 1.1) : 1;
    el('rect', { x: 30, y: 30, width: 500, height: 300, rx: 14, fill: k === 0 ? 'none' : ACCBG, stroke: ACC, 'stroke-width': 2.5, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 - bu, opacity: 1 });
    mono(50, 60, 'class Network extends ComponentResource', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.6) : 1 });
    tx(50, 96, 'type', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.9) : 1 });
    card(290, 92, 300, 36, { rx: 8, stroke: ok ? ACC : GRID, dash: ok ? null : '5 4', fill: PANEL, sw: 2, op: k === 0 ? fade(u, 0.9) : 1 });
    if (!ok) mono(290, 97, ty, { 'font-size': 14, fill: OFF, 'text-anchor': 'middle' });
    if (k === 1) fly(700, 92, 290, 92, seg(u, 0.2, 1.0), 'super("pkg:network:Network", …)', { mono: true });
    if (ok && (k > 1 || u > 1.0)) { const op = k === 1 ? fade(u, 1.0) : 1;
      mono(290, 98, ty, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: op });
      if (k === 1) [['패키지', 222], ['모듈', 273], ['타입', 344]].forEach(([s, x], i) => sub(x, 130, s, fade(u, 1.3 + i * 0.2), { 'font-weight': 700 })); }
    // 자식 4개 (아직 parent 없음)
    if (k >= 2) KIDS.forEach(([ty2, nm], i) => chip(160 + (i % 2) * 240, 170 + Math.floor(i / 2) * 66, 'aws.ec2.' + ty2, nm, { w: 220, s: k === 2 ? pop(u, 0.2 + i * 0.2) : 1, dash: '5 4' }));
    if (k === 3) { card(280, 300, 260, 34, { rx: 17, fill: ACC, stroke: 'none', text: 'this.registerOutputs({})', fs: 14, mono: true, color: PANEL, s: pop(u, 0.3) }); }
    // 오른쪽: 엔진이 받은 등록 목록
    tx(570, 52, '엔진에 등록된 리소스', { 'font-size': 15, 'font-weight': 700 });
    const rows = [];
    if (ok) rows.push(['pkg:network:Network', 'prod-net', 0, 1]);
    if (k >= 2) KIDS.forEach(([ty2], i) => rows.push(['aws:ec2:' + ty2, '', 0, 2, i]));
    rows.forEach(([a, b, ind, at, i], r) => { const y = 70 + r * 44, op = k === at ? fade(u, at === 1 ? 1.2 : 0.5 + (i || 0) * 0.2) : 1;
      el('rect', { x: 570, y, width: 360, height: 36, rx: 7, fill: at === 1 ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.2, opacity: op });
      mono(584, y + 24, a, { 'font-size': 14, 'font-weight': 700, fill: at === 1 ? ACC : INK, opacity: op });
      if (b) mono(916, y + 24, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: op });
      if (at === 2) mono(916, y + 24, '부모: Stack', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', opacity: op }); });
    if (!ok) note(750, 120, '아직 아무것도 등록 안 됨', k === 0 ? fade(u, 1.2) : 1, { 'text-anchor': 'middle', fill: MUT });
    if (k === 2) note(750, 330, 'parent를 안 줘서 Stack 바로 아래에 붙는다', fade(u, 1.4), { 'text-anchor': 'middle', fill: WARN });
    if (k === 3) { cross(588, 330, 10, pop(u, 1.2)); note(606, 336, 'super()가 없으면 Network 노드도 없다', fade(u, 1.3), { fill: BAD }); }
    // 아래: 순서 규칙
    const ORD = ['① super()', '② 자식 생성', '③ registerOutputs()'], OX = [110, 330, 590];
    ORD.forEach((s, i) => { const on = k >= i + 1, cx = OX[i];
      pill(cx, 384, s, on ? ACC : GRID, 1, { mono: true, fs: 14, fill: on ? ACCBG : PANEL, color: on ? ACC : MUT });
      if (i < 2) grow(cx + (tw(s, 14) + 26) / 2 + 8, 384, OX[i + 1] - (tw(ORD[i + 1], 14) + 26) / 2 - 8, 384, 1, k >= i + 2 ? ACC : GRID); }); }

  // ---------- 3. parent 옵션과 URN 트리 ----------
  const SLOT = [[140, 118], [340, 118], [140, 212], [340, 212]];
  const FLOAT = [[140, 300], [340, 300], [140, 360], [340, 360]];
  const URNT = ['aws:ec2/vpc:Vpc', 'aws:ec2/subnet:Subnet', 'aws:ec2/internetGateway:InternetGateway', 'aws:ec2/routeTable:RouteTable'];
  const SUF = ['-vpc', '-subnet', '-igw', '-rt'];
  function s3(t, c) { const { k, u } = c, kids = c.beat.component.children, cur = Math.min(k, 3);
    zone(30, 40, 420, 225, 'Network (prod-net)', { fill: ACCBG, stroke: ACC, color: ACC });
    kids.forEach((ch, i) => { const inside = ch.parented, moving = i === k && k <= 3;
      const [x0, y0] = FLOAT[i], [x1, y1] = SLOT[i], m = moving ? E(u, 0.3, 1.3) : inside ? 1 : 0;
      const cx = lerp(x0, x1, m), cy = lerp(y0, y1, m);
      chip(cx, cy, KIDS[i][0], ch.label, { w: i === 2 ? 170 : 150, h: 50, dash: m < 1 ? '5 4' : null, col: moving ? ACC : INK });
      if (m >= 1) pill(cx + (i === 2 ? 60 : 50), cy - 33, 'parent', ACC, moving ? pop(u, 1.3) : 1, { fs: 13.5, fill: PANEL }); });
    if (kids.some((ch) => !ch.parented)) tx(30, 410, '점선 = 아직 parent 없음 · Stack 바로 아래', { 'font-size': 13.5, 'font-weight': 700, fill: WARN });
    // 오른쪽: pulumi up 트리 (예시)
    const lines = c.beat.urns, prevN = c.prev && c.prev.urns ? c.prev.urns.length : 0;
    const shown = k === 0 ? lerp(0, lines.length, E(u, 0.2, 1.6)) : lerp(Math.min(prevN, lines.length), lines.length, E(u, 0.6, 1.4));
    terminal(480, 40, 460, 210, lines, Math.max(0.01, shown), { title: 'pulumi up · 트리 (예시)', fs: 14, lh: 25 });
    // URN: 부모 타입이 $ 앞에 붙는다
    if (k <= 3) { const ty = URNT[cur];
      tx(480, 282, '이번 자식의 URN', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
      mono(480, 308, 'urn:pulumi:<stack>::<project>::', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
      R.spans(480, 332, [['pkg:network:Network', { fill: ACC, 'font-weight': 700 }], ['$', { fill: WARN, 'font-weight': 800 }], [ty, {}]], { 'font-size': 13.5, opacity: fade(u, 1.6) });
      mono(480, 356, '::prod-net' + SUF[cur], { 'font-size': 13.5, opacity: fade(u, 1.8) }); }
    else { [['+', '그룹째 미리보기', GOOD], ['−', '그룹째 삭제', BAD]].forEach(([s, n], i) => { pill(560 + i * 200, 300, s + ' ' + n, s === '+' ? GOOD : BAD, pop(u, 0.4 + i * 0.3), { fs: 14 }); });
      note(710, 350, 'Network 아래 4개가 한 덩어리로 움직인다', fade(u, 1.2), { 'text-anchor': 'middle' }); } }

  // ---------- 4. args 입력 · this 출력 ----------
  const ARGS = [['cidrBlock', 'string', 0], ['subnetCidr', 'string', 1], ['azCount?', 'number', null]];
  const OUTS = [['this.vpcId', 0], ['this.subnetIds', 1], ['this.publicRouteTableId', 3]];
  function s4(t, c) { const { k, u } = c, BX = 330, BW = 280;
    zone(BX, 50, BW, 280, 'Network', { fill: ACCBG, stroke: ACC, color: ACC });
    KIDS.forEach(([ty], i) => chip(BX + BW / 2, 108 + i * 58, ty, null, { w: 200, h: 38 }));
    // 입력
    tx(40, 60, 'interface NetworkArgs', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
    ARGS.forEach(([n, ty, to], i) => { const y = 108 + i * 64, s = k === 0 ? pop(u, 0.3 + i * 0.3) : 1;
      pill(140, y, n + ': ' + ty, to == null ? GRID : WARN, s, { mono: true, fs: 14, color: to == null ? MUT : INK, fill: PANEL });
      if (to != null) { const ty2 = 108 + to * 58; grow(240, y, BX + BW / 2 - 102, ty2, k === 0 ? seg(u, 1.0 + i * 0.3, 1.6 + i * 0.3) : 1, WARN, { sw: 2 }); } });
    sub(140, 316, '?: 선택 입력 (지금 코드는 쓰지 않음)', k === 0 ? fade(u, 1.8) : 1);
    // 출력
    if (k >= 1) { tx(670, 60, 'public readonly …: Output', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: k === 1 ? fade(u, 0.2) : 1 });
      OUTS.forEach(([n, from], i) => { const y = 108 + i * 64, fy = 108 + from * 58, a = k === 1 ? seg(u, 0.4 + i * 0.35, 1.0 + i * 0.35) : 1;
        grow(BX + BW / 2 + 102, fy, 690, y, a, ACC, { sw: 2 });
        const inReg = i < 2, dim = k === 2 && !inReg;
        pill(812, y, n, dim ? GRID : ACC, k === 1 ? pop(u, 0.9 + i * 0.35) : 1, { mono: true, fs: 14, color: dim ? MUT : ACC, fill: PANEL }); });
      sub(812, 316, 'up이 끝나야 값이 채워지는 약속(Output)', k === 1 ? fade(u, 2.0) : 1); }
    if (k === 2) { const s = pop(u, 0.3);
      card(470, 372, 430, 40, { rx: 20, fill: ACC, stroke: 'none', text: 'registerOutputs({ vpcId, subnetIds })', fs: 14.5, mono: true, color: PANEL, s });
      [0, 1].forEach((i) => dot([[812, 108 + i * 64 + 16], [700, 350]], seg(u, 0.8 + i * 0.3, 1.5 + i * 0.3), ACC, 6));
      sub(812, 290, 'publicRouteTableId는 등록 목록에 없다', fade(u, 1.6), { fill: WARN, 'font-weight': 700 }); }
    if (k <= 1) { [['Terraform', 'variable', 'output'], ['Pulumi', 'args', 'this.xxx']].forEach(([a, b, d], i) => { const op = k === 1 ? fade(u, 2.2) : 0; if (!op) return;
        mono(330 + i * 160, 380, a, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); mono(330 + i * 160, 402, b + ' / ' + d, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); });
      if (k === 1) mono(410, 392, '=', { 'font-size': 16, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); } }

  // ---------- 5. 한 클래스, 여러 인스턴스 ----------
  function s5(t, c) { const { k, u } = c, ins = c.beat.instances, prevN = c.prev && c.prev.instances ? c.prev.instances.length : 0;
    const pulse = k === 4 ? Math.max(0, Math.sin(seg(u, 0.2, 1.4) * Math.PI)) : 0;
    chip(480, 48, 'network.ts', 'class Network', { w: 210, h: 54, col: ACC, fill: ACCBG, sw: 2.5 + pulse * 2 });
    const X = [170, 480, 790];
    ins.forEach((it, i) => { const cx = X[i], fresh = i >= prevN && i === ins.length - 1 && k <= 2, s = fresh ? pop(u, 1.0) : 1;
      if (fresh) dot([[480, 76], [cx, 140]], seg(u, 0.2, 1.0), ACC, 7);
      if (k === 4) dot([[480, 76], [cx, 140]], seg(u, 0.3 + i * 0.15, 1.1 + i * 0.15), WARN, 7);
      if (s <= 0) return;
      zone(cx - 140, 128, 280, 170, null, { fill: k === 4 && u > 1.1 ? WARNBG : ACCBG, stroke: ACC, op: Math.min(1, s) });
      mono(cx - 124, 154, it.env, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: Math.min(1, s) });
      mono(cx + 124, 154, it.region, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: Math.min(1, s) });
      ['vpc', 'subnet', 'igw', 'rt'].forEach((n, j) => chip(cx - 96 + j * 64, 196 + (j % 2) * 0, n, null, { w: 58, h: 34, s }));
      sub(cx, 260, 'Network 인스턴스', Math.min(1, s)); });
    if (k <= 2) { const n = Math.round(tween(prevN, ins.length, u));
      mono(480, 340, `new Network() ${n}번 · 리소스 ${n * 5}개`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: INK });
      sub(480, 366, '인스턴스 1개 = 컴포넌트 1 + 자식 4', 1); }
    if (k === 3) { chip(480, 360, 'EksCluster', 'prod-eks', { w: 160, s: pop(u, 0.9), col: INFO });
      arc('M790,298 C790,350 640,360 560,360', seg(u, 0.3, 1.0), INFO);
      mono(700, 322, 'prodNet.subnetIds', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6), 'text-anchor': 'middle' });
      mono(170, 350, 'export prodVpcId', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 4) { mono(480, 340, '3 × (1 + 4) = 15개 리소스', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      banner(480, 384, '규칙 수정은 network.ts 한 파일, 3환경에 같이 반영', pop(u, 1.4)); } }

  const quiz = [
    { q: 'VPC 세트 4개를 dev·staging·prod에 복붙해 두었을 때 생기는 위험은 무엇인가?',
      o: ['환경마다 리소스 이름이 같아져 충돌한다', '규칙이 바뀌면 12개를 세 곳에서 고쳐야 하고 한 곳을 빠뜨리면 환경이 어긋난다', 'Pulumi가 같은 코드를 세 번 실행하지 못한다'], a: 1,
      why: '3환경 × 4리소스 = 12개가 따로 있다. 한 환경만 고치는 걸 빠뜨려도 아무도 알려 주지 않는다.' },
    { q: 'super("pkg:network:Network", name, {}, opts)의 첫 인자는 무엇인가?',
      o: ['엔진이 트리에서 이 컴포넌트를 알아보는 타입 이름', '만들 VPC의 이름', 'AWS 리전'], a: 0,
      why: '"패키지:모듈:타입" 꼴의 문자열이 컴포넌트의 이름표다. super()를 불러야 컴포넌트 노드가 등록된다.' },
    { q: 'subnet만 { parent: this }를 빼먹으면 up 트리에서 subnet은 어디에 보이는가?',
      o: ['Network 아래 그대로', '트리에 아예 안 보인다', 'Network 밖, Stack 바로 아래'], a: 2,
      why: 'parent를 준 리소스만 컴포넌트 자식이 되고 URN 앞에 부모 타입이 붙는다. 빼먹으면 Stack 아래로 뜬다.' },
    { q: '다른 코드가 Network의 VPC id를 쓰게 하려면 어떻게 하는가?',
      o: ['network.ts 안의 vpc 변수를 export 한다', 'public readonly vpcId 필드에 vpc.id를 대입한다', 'registerOutputs를 지운다'], a: 1,
      why: '출력은 this.vpcId 같은 public 필드로 연다. Terraform module의 output 자리이고 값은 Output으로 들어온다.' },
    { q: 'Network로 3환경을 만든 뒤 서브넷 규칙이 바뀌면 어디를 고치는가?',
      o: ['index.ts의 new Network 세 줄 전부', '각 환경의 state 파일', 'network.ts 한 파일'], a: 2,
      why: '규칙은 클래스 한 곳에 있고 환경 차이는 CIDR 인자뿐이다. 클래스를 고치면 3개 인스턴스에 같이 반영된다.' },
  ];

  const summary = [
    'VPC 세트 4개를 환경 3곳에 복붙하면 규칙 하나 바꿀 때 12개를 따로 고쳐야 한다.',
    'ComponentResource를 상속해 super()로 타입을 등록하고 자식을 만든 뒤 registerOutputs()로 닫는다.',
    '자식마다 parent: this를 줘야 URN에 부모 타입이 붙고 up 트리에서 Network 아래로 묶인다.',
    'args로 입력, public 필드로 출력을 열면 new Network() 한 줄로 dev·staging·prod를 만든다.',
  ];
  const review = [
    { q: 'up 트리에서 staging-net의 subnet만 Network 밖, Stack 바로 아래에 보인다. 먼저 의심할 것은?',
      o: ['super()의 타입 문자열 오타', '그 subnet을 만들 때 { parent: this }가 빠졌다', 'registerOutputs에 subnetIds를 안 넣었다'], a: 1,
      why: '트리의 위치는 parent 옵션이 정한다. 타입 문자열이나 출력 등록은 자식의 위치를 바꾸지 않는다.' },
    { q: 'prod 네트워크 위에 EksCluster를 올리려 한다. 서브넷을 넘기는 방법으로 맞는 것은?',
      o: ['콘솔에서 서브넷 ID를 복사해 문자열로 적는다', 'network.ts 안의 subnet 변수를 직접 import 한다', 'prodNet.subnetIds를 EksCluster 입력으로 넘긴다'], a: 2,
      why: '컴포넌트가 연 출력 필드를 다음 컴포넌트 입력으로 넘기면 의존도 같이 생긴다. 안쪽 변수는 밖에서 보이지 않는다.' },
    { q: '팀원이 Network 생성자에서 super()보다 vpc를 먼저 만들었다. 무엇이 문제인가?',
      o: ['컴포넌트 노드가 아직 없어 vpc를 그 자식으로 붙일 수 없다', 'vpc의 CIDR이 무시된다', '아무 문제 없다, 순서는 상관없다'], a: 0,
      why: 'super()가 먼저 불려야 Network가 리소스 노드로 등록된다. TypeScript도 super() 전에는 this를 쓰지 못하게 막는다.' },
  ];

  R.page({ title: 'ComponentResource 묶음', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
