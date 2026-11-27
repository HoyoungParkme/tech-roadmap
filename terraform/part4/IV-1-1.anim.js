/* IV-1-1 module — 재사용 코드 단위. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자(CIDR, 서브넷 수, 하드코딩 "dev" 횟수, 줄 수)는 페이지 CODE 블록에서 센 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, spans, cross, check, lock, terminal, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // beat kk 에서 튀어나오고 그 뒤로는 그대로 (c.k, c.u 기준)
  const at = (c, kk, d) => (c.k > kk ? 1 : c.k === kk ? pop(c.u, d ?? 0.2) : 0);
  const fa = (c, kk, d) => (c.k > kk ? 1 : c.k === kk ? fade(c.u, d ?? 0.2) : 0);
  const gr = (c, kk, a, b) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a ?? 0.2, b ?? 1.2) : 0);
  // 접힌 귀퉁이가 있는 .tf 파일
  function fileCard(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1, st = o.stroke || INK;
    el('path', { d: `M${x},${y} H${x + w - 18} L${x + w},${y + 18} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: st, 'stroke-width': o.sw || 2, opacity: op });
    el('path', { d: `M${x + w - 18},${y} V${y + 18} H${x + w}`, fill: 'none', stroke: st, 'stroke-width': 1.5, opacity: op });
    if (name) mono(x + 12, y + 23, name, { 'font-size': 14.5, 'font-weight': 700, fill: o.color || INK, opacity: op }); }
  // resource 블록 한 칸: 머리(이름) + 아래 한 줄(조각 배열, "dev" 같은 하드코딩은 빨갛게)
  function block(x, y, w, head, parts, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: 0, width: w, height: 48, rx: 7, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6 }, g);
    mono(10, 19, head, { 'font-size': 14, 'font-weight': 700, fill: o.color || INK }, g);
    if (parts) spans(10, 39, parts, { 'font-size': 13.5, fill: MUT }, g); return g; }
  const hot = (s) => [s, { fill: BAD, 'font-weight': '700' }];
  // 모듈 = 함수: 왼쪽 입력 핀, 오른쪽 출력 핀
  function port(x, y, col, s) { el('circle', { cx: x, cy: y, r: 7 * (s ?? 1), fill: PANEL, stroke: col || ACC, 'stroke-width': 2.5 }); }
  function vpcRect(x, y, w, h, title, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || 'none', stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: op });
    if (title) mono(x + 10, y + 20, title, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || INFO, opacity: op }); }
  function subnetCell(x, y, w, az, cidr, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('rect', { x: 0, y: 0, width: w, height: 44, rx: 6, fill: o.fill || GOODBG, stroke: o.stroke || GOOD, 'stroke-width': 1.6 }, g);
    mono(w / 2, 18, az, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.stroke || GOOD }, g);
    mono(w / 2, 36, cidr, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK }, g); return g; }

  // ---------- 1. 복붙 ----------
  const DUP = [
    ['aws_vpc.this', ['10.0.0.0/16  Name="', null], hot('dev'), ['-vpc"']],
    ['aws_subnet.public_a', ['10.0.1.0/24 · 2a  Name="'], hot('dev'), ['-public-a"']],
    ['aws_internet_gateway.this', ['vpc_id 참조  Name="'], hot('dev'), ['-igw"']],
    ['aws_route_table.public', ['0.0.0.0/0 → igw  Name="'], hot('dev'), ['-public-rt"']],
  ];
  function s1(t, c) { const { k, u } = c;
    if (k <= 3) {
      fileCard(30, 30, 420, 300, 'dev/main.tf');
      DUP.forEach(([h, a, b, d], i) => { const s = at(c, i, 0.2); if (s <= 0) return;
        block(48, 64 + i * 64, 384, h, [[a[0]], b, d], { s: 0.6 + 0.4 * s, op: clamp(s * 1.4), stroke: i === k ? ACC : GRID, sw: i === k ? 2.4 : 1.6 }); });
      const n = tween(k > 0 ? k : null, k + 1, u);
      tx(30, 368, '하드코딩한 "dev"', { 'font-size': 15, 'font-weight': 700 });
      mono(170, 368, Math.round(n) + '번', { 'font-size': 18, 'font-weight': 800, fill: BAD });
      // 오른쪽: 실제로 생길 네트워크
      const sv = at(c, 0, 0.6);
      if (sv > 0) vpcRect(490, 40, 440, 290, 'VPC 10.0.0.0/16', { op: clamp(sv) });
      if (k >= 1) subnetCell(520, 90, 170, 'public_a · 2a', '10.0.1.0/24', { s: at(c, 1, 0.5) });
      if (k >= 2) { const s = at(c, 2, 0.5); card(905, 140, 74, 52, { rx: 8, text: 'IGW', fs: 15, fw: 800, stroke: INK, fill: PANEL, s }); }
      if (k >= 3) { const g = gr(c, 3, 0.4, 1.5);
        el('path', { d: 'M690,112 C780,112 800,140 866,140', fill: 'none', stroke: ACC, 'stroke-width': 2.6, 'stroke-dasharray': `${g * 200} 200` });
        card(700, 250, 300 * 0.86, 50, { rx: 8, text: 'route 0.0.0.0/0 → IGW', fs: 14, mono: true, stroke: ACC, color: ACC, s: at(c, 3, 1.2) });
        sub(710, 314, 'dev 한 벌 완성', fa(c, 3, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      return; }
    // k = 4: 세 파일로 복사
    const xs = [30, 340, 650], names = ['dev/main.tf', 'staging/main.tf', 'prod/main.tf'], envs = ['dev', 'staging', 'prod'];
    xs.forEach((x, i) => { const s = i === 0 ? 1 : seg(u, 0.3 + i * 0.4, 0.9 + i * 0.4); if (s <= 0) return;
      const xx = i === 0 ? x : lerp(xs[0], x, E(s, 0, 1));
      fileCard(xx, 40, 280, 240, names[i], { op: i === 0 ? 1 : clamp(s * 2) });
      ['aws_vpc', 'aws_subnet', 'aws_internet_gateway', 'aws_route_table'].forEach((r, j) => { const op = i === 0 ? 1 : clamp(s * 2);
        mono(xx + 14, 84 + j * 40, r, { 'font-size': 13.5, opacity: op });
        spans(xx + 266, 102 + j * 40, [['"'], hot(envs[i]), ['-…"']], { 'font-size': 13.5, 'text-anchor': 'end', opacity: op }); });
      if (i > 0) mono(xx + 140, 244, '(복붙)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.4) }); });
    // flow log 요청이 세 파일에 각각 도착
    xs.forEach((x, i) => { const a = 1.7 + i * 0.25; fly(480, 335, x + 140, 260, seg(u, a, a + 0.6), '+ flow log', { fill: WARN });
      if (u > a + 0.6) card(x + 140, 262, 110, 28, { rx: 14, text: '+ flow log', fs: 13.5, fw: 700, fill: WARNBG, stroke: WARN, color: WARN, s: pop(u, a + 0.6) }); });
    tx(480, 322, '보안팀: 모든 VPC에 flow log', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
    tx(480, 392, '수정 지점', { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) });
    mono(492, 392, '1곳 → 3곳', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.3) }); }

  // ---------- 2. module 추출: 입력 핀 · 본체 · 출력 핀 ----------
  const MX = 330, MY = 60, MW = 330, MH = 300;
  const IN = [['name', 'string', 118], ['cidr_block', 'string', 178], ['public_subnets', 'list(object)', 262]];
  function s2(t, c) { const { k, u } = c;
    zone(MX, MY, MW, MH, 'modules/vpc/', { fill: SOFT, stroke: ACC, sw: 2.4 });
    // 입력 핀 (variables.tf)
    IN.forEach(([n, ty, y], i) => { const s = at(c, i, 0.9); if (s <= 0) return;
      port(MX, y, ACC, s); tx(MX - 16, y - 4, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono', opacity: clamp(s) });
      mono(MX - 16, y + 16, ': ' + ty, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: clamp(s) }); });
    if (k >= 0) tx(MX - 170, 50, 'variables.tf (입력)', { 'font-size': 13.5, 'font-weight': 700, fill: ACC });
    // 본체에서 하드코딩이 빠져 나간다
    if (k === 0) { mono(MX + 40, 118, 'Name = "dev-vpc"', { 'font-size': 14.5, opacity: 1 - 0.6 * fade(u, 1.6) });
      fly(MX + 105, 118, MX - 70, 104, seg(u, 0.4, 1.4), '"dev"', { fill: BAD, mono: true });
      if (u > 1.6) { el('line', { x1: MX + 40, y1: 113, x2: MX + 185, y2: 113, stroke: BAD, 'stroke-width': 2.2 }); } }
    if (k === 1) fly(MX + 105, 178, MX - 70, 164, seg(u, 0.3, 1.3), '"10.0.0.0/16"', { fill: BAD, mono: true });
    if (k === 2) { const s = pop(u, 1.2);
      card(MX - 112, 318, 200, 36, { rx: 8, text: '[{cidr, az}, {cidr, az}]', fs: 13.5, mono: true, stroke: INFO, color: INFO, s }); }
    // 본체 main.tf
    if (k >= 3) { const s = at(c, 3, 0.2);
      block(MX + 40, 88, 270, 'aws_vpc.this', [['cidr = '], ['var.cidr_block', { fill: ACC, 'font-weight': '700' }]], { s: 0.7 + 0.3 * s, op: clamp(s * 1.5), fill: PANEL });
      spans(MX + 50, 160, [['Name = "${'], ['var.name', { fill: ACC, 'font-weight': '700' }], ['}-vpc"']], { 'font-size': 13.5, opacity: fa(c, 3, 0.8) });
      const g = gr(c, 3, 0.8, 1.8);
      el('path', { d: `M${MX + 7},118 C${MX + 25},118 ${MX + 30},155 ${MX + 50},155`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': `${g * 80} 80` });
      el('path', { d: `M${MX + 7},178 C${MX + 25},178 ${MX + 30},130 ${MX + 118},128`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': `${g * 140} 140` });
      tx(MX + 310, MY + 22, 'main.tf', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' }); }
    // for_each 로 서브넷 펼치기
    if (k >= 4) { const sp = gr(c, 4, 0.9, 1.9);
      mono(MX + 40, 200, 'for_each = { for s in … : s.az => s }', { 'font-size': 13.5, fill: INFO, opacity: fa(c, 4, 0.2) });
      el('path', { d: `M${MX + 7},262 C${MX + 25},262 ${MX + 25},240 ${MX + 40},236`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: fa(c, 4, 0.4) });
      ['2a', '2b'].forEach((az, j) => { const x = MX + 40 + j * 140 * sp;
        block(x, 218 + j * 44 * sp, 130, 'public["' + az + '"]', [['each.value.cidr']], { op: j === 0 ? fa(c, 4, 0.5) : sp, fill: GOODBG, stroke: GOOD }); }); }
    // 출력 핀 (outputs.tf) — 선언한 것만 밖으로
    if (k >= 5) { const s = at(c, 5, 0.3);
      [['vpc_id', 118], ['public_subnet_ids', 262]].forEach(([n, y], i) => { const g = gr(c, 5, 0.3 + i * 0.4, 1.1 + i * 0.4);
        el('line', { x1: MX + 270, y1: y, x2: lerp(MX + 270, MX + MW, g), y2: y, stroke: GOOD, 'stroke-width': 2.2 });
        port(MX + MW, y, GOOD, s); tx(MX + MW + 16, y + 5, n, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: GOOD, opacity: fade(u, 0.5 + i * 0.4) }); });
      tx(MX + MW + 16, 50, 'outputs.tf (출력)', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD, opacity: fa(c, 5, 0.3) });
      lock(MX + MW + 40, 196, true, MUT, fa(c, 5, 1.6));
      tx(MX + MW + 62, 192, 'aws_internet_gateway 등', { 'font-size': 13.5, fill: MUT, opacity: fa(c, 5, 1.7) });
      tx(MX + MW + 62, 212, '선언 안 한 값은 안 보인다', { 'font-size': 13.5, fill: MUT, opacity: fa(c, 5, 1.7) }); }
    if (k === 5) banner(480, 392, '입력(variables) + 본체(main) + 출력(outputs) = 함수', pop(u, 2.1)); }

  // ---------- 3. 호출: 인자만 바꿔 세 번 ----------
  const ENVS = [
    { f: 'dev/main.tf', name: 'dev', cidr: '10.0.0.0/16', sub: [['2a', '10.0.1.0/24'], ['2b', '10.0.2.0/24']] },
    { f: 'staging/main.tf', name: 'staging', cidr: '10.1.0.0/16', sub: [['2a', '10.1.1.0/24'], ['2b', '10.1.2.0/24']] },
    { f: 'prod/main.tf', name: 'prod', cidr: '10.2.0.0/16', sub: [['2a', '10.2.1.0/24'], ['2b', '10.2.2.0/24'], ['2c', '10.2.3.0/24']] },
  ];
  const ENV_K = [0, 3, 4];
  function s3(t, c) { const { k, u } = c;
    const mx = 470, my = 210;
    card(mx, my, 130, 70, { rx: 10, text: 'modules/vpc', fs: 15, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, mono: true });
    ENVS.forEach((e, i) => { const s = at(c, ENV_K[i], 0.2); if (s <= 0) return; const y = 58 + i * 112, op = clamp(s * 1.5);
      fileCard(20, y, 310, 100, e.f, { op, stroke: k === ENV_K[i] ? ACC : INK });
      const diff = i > 0 && k === ENV_K[i];
      spans(34, y + 50, [['name = "'], [e.name, diff ? { fill: WARN, 'font-weight': '700' } : {}], ['"']], { 'font-size': 13.5, opacity: op });
      spans(34, y + 70, [['cidr_block = "'], [e.cidr, diff ? { fill: WARN, 'font-weight': '700' } : {}], ['"']], { 'font-size': 13.5, opacity: op });
      if (k >= ENV_K[i] + (i === 0 ? 1 : 0)) spans(34, y + 90, [['public_subnets = ' + e.sub.length + '개']], { 'font-size': 13.5, fill: i === 2 && k === 4 ? WARN : INFO, opacity: i === 0 ? fa(c, 1, 0.2) : op });
      // source 화살표
      const g = i === 0 ? gr(c, 0, 0.6, 1.4) : gr(c, ENV_K[i], 0.6, 1.4);
      el('path', { d: `M330,${y + 50} C380,${y + 50} 380,${my} ${mx - 65},${my}`, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': `${g * 260} 260` });
      if (i === 0) tx(368, y + 40, 'source', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fa(c, 0, 1.2) });
      // 만들어지는 VPC
      const vk = i === 0 ? 1 : ENV_K[i]; if (k < vk) return; const vs = gr(c, vk, 0.6, 1.4), vy = 50 + i * 118;
      vpcRect(612, vy, 320, 106, e.name + ' VPC ' + e.cidr, { op: clamp(vs * 2) });
      e.sub.forEach(([az, ci], j) => subnetCell(620 + j * 102, vy + 32, 98, az, ci, { s: clamp(vs * 3 - j * 0.5), fill: i === 2 && j === 2 && k === 4 ? WARNBG : GOODBG, stroke: i === 2 && j === 2 && k === 4 ? WARN : GOOD }));
      el('path', { d: `M${mx + 65},${my} C${mx + 110},${my} 560,${vy + 53} 612,${vy + 53}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': `${vs * 260} 260` }); });
    if (k === 2) { fly(mx, my - 36, 360, 30, seg(u, 0.3, 1.4), 'module.vpc.vpc_id', { fill: GOOD, mono: true });
      if (u > 1.4) pill(360, 30, 'module.vpc.vpc_id', GOOD, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL }); }
    if (k > 2) pill(360, 30, 'module.vpc.vpc_id', GOOD, 1, { mono: true, fs: 13.5, fill: PANEL });
    if (k === 5) { fly(mx, 400, mx, my + 40, seg(u, 0.2, 0.9), '+ flow log', { fill: WARN });
      ENVS.forEach((e, i) => { const vy = 50 + i * 118; dot([[mx + 65, my], [560, vy + 53], [612, vy + 53]], seg(u, 1.0 + i * 0.15, 1.7 + i * 0.15), WARN, 7);
        if (u > 1.7 + i * 0.15) pill(880, vy + 16, 'flow log', WARN, pop(u, 1.7 + i * 0.15), { fs: 13.5, fill: WARNBG }); });
      tx(470, 300, '수정 지점 3곳 → 1곳', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) });
      mono(470, 322, '호출 블록 3개 = 28줄', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.4) }); } }

  // ---------- 4. 출력 → 입력 체이닝: 의존 그래프와 apply 순서 ----------
  function modNode(cx, cy, w, h, name, o) { o = o || {}; card(cx, cy, w, h, { rx: 12, stroke: o.stroke || INK, sw: 2.4, fill: o.fill || PANEL, s: o.s, op: o.op });
    if ((o.s ?? 1) > 0.3) mono(cx, cy - h / 2 + 24, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: o.stroke || INK, opacity: o.op ?? 1 }); }
  function gantt(c) { const { k, u } = c, x0 = 140, sc = 120;
    tx(30, 312, 'apply 순서', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const rows = [['vpc', 0, 1, 0], ['eks', 1, 2, 1], ['rds', 1, 2, 3]];
    rows.forEach(([n, a, b, kk], i) => { if (k < kk) return; const y = 326 + i * 28, g = kk === k ? E(u, 0.8, 1.8) : 1;
      mono(x0 - 12, y + 14, n, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700 });
      el('rect', { x: x0 + a * sc, y, width: Math.max(2, (b - a) * sc * g), height: 18, rx: 4, fill: i === 0 ? INFO : ACC, opacity: 0.85 }); });
    if (k >= 3) tx(x0 + 2 * sc + 14, 368, 'eks · rds 동시에', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fa(c, 3, 1.8) }); }
  function s4(t, c) { const { k, u } = c;
    const vs = at(c, 0, 0.2); modNode(150, 140, 200, 140, 'module.vpc', { s: vs, stroke: INFO });
    [['vpc_id', 115], ['public_subnet_ids', 165]].forEach(([n, y], i) => { if (vs < 0.5) return; port(250, y, INFO); mono(238, y + 5, n, { 'font-size': 13.5, 'text-anchor': 'end', fill: INFO, opacity: fa(c, 0, 0.8 + i * 0.3) }); });
    const wire = (y1, x2, y2, g, col) => el('path', { d: `M257,${y1} C330,${y1} 340,${y2} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': `${g * 300} 300` });
    if (k >= 1) { const g = gr(c, 1, 0.6, 1.6); modNode(520, 85, 210, 110, 'module.eks', { s: at(c, 1, 0.2), stroke: ACC });
      wire(115, 415, 75, g, ACC); wire(165, 415, 105, g, ACC);
      mono(520, 128, 'vpc_id · subnet_ids', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fa(c, 1, 1.4) });
      if (k >= 2) { const s = at(c, 2, 0.3); [0, 1, 2].forEach((j) => R.server(470 + j * 50, 160, null, { s: 0.32 * (k === 2 ? pop(u, 0.3 + j * 0.25) : 1) }));
        mono(520, 200, 'node_count = 3 · t3.large', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fa(c, 2, 1.2) }); } }
    if (k >= 3) { const g = gr(c, 3, 0.6, 1.6); modNode(520, 262, 210, 80, 'module.rds', { s: at(c, 3, 0.2), stroke: ACC });
      wire(115, 415, 252, g, ACC); wire(165, 415, 272, g, ACC);
      mono(520, 288, 'postgres · db.t3.medium', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fa(c, 3, 1.4) }); }
    if (k >= 4) { const g = gr(c, 4, 0.3, 1.0); grow(625, 85, lerp(625, 700, g), 85, 1, GOOD, { plain: true });
      pill(808, 85, 'cluster_endpoint', GOOD, at(c, 4, 0.9), { mono: true, fs: 13.5 }); }
    if (k >= 5) { const g = gr(c, 5, 0.3, 1.0); grow(625, 262, lerp(625, 700, g), 262, 1, GOOD, { plain: true });
      pill(790, 262, 'db_endpoint', GOOD, at(c, 5, 0.9), { mono: true, fs: 13.5 }); }
    if (k >= 4) { const lines = ['$ terraform output', 'cluster_endpoint = <sensitive>'].concat(k >= 5 ? ['db_endpoint = <sensitive>'] : []);
      terminal(560, 300, 385, 112, lines, k === 4 ? 1 + E(u, 1.0, 2.0) : k === 5 ? 2 + E(u, 1.0, 2.0) : lines.length, { fs: 13.5 });
      tx(700, 150, 'state 파일에는 평문으로 남는다', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fa(c, 4, 2.0) }); }
    gantt(c); }

  // ---------- 5. Public Registry ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { browser(270, 205, 470, 300, 'registry.terraform.io', {});
      card(250, 100, 380, 34, { rx: 8, text: '', stroke: GRID, sw: 1.5 }); mono(75, 106, '🔍 vpc', { 'font-size': 15 });
      card(150, 150, 130, 30, { rx: 15, text: '☑ Partner', fs: 13.5, stroke: INFO, color: INFO, s: pop(u, 0.4) });
      ['terraform-aws-modules/vpc/aws', 'terraform-aws-modules/eks/aws', 'terraform-aws-modules/rds/aws'].forEach((s, i) => {
        const y = 200 + i * 52, sp = pop(u, 0.8 + i * 0.3); card(270, y, 430, 42, { rx: 8, stroke: i === 0 ? ACC : GRID, sw: i === 0 ? 2.4 : 1.5, s: sp });
        mono(70, y + 5, s, { 'font-size': 14, 'font-weight': i === 0 ? 800 : 500, fill: i === 0 ? ACC : INK, opacity: clamp(sp) }); });
      tx(560, 120, 'Partner 필터: HashiCorp가 검토한', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(560, 144, '배포자의 module만 남긴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      [['VPC · EKS · RDS는', '이미 표준 module이 있다'], ['직접 짜기는', '마지막 수단']].forEach(([a, b], i) => {
        tx(560, 216 + i * 70, a, { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0 + i * 0.3) }); tx(560, 240 + i * 70, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0 + i * 0.3) }); });
      return; }
    if (k === 1) { snippet(30, 60, ['module "vpc" {', '  source  = "../modules/vpc"', '}'], { op: 1 - fade(u, 0.6) });
      if (u > 0.6) snippet(30, 60, ['module "vpc" {', '  source  = "terraform-aws-modules/vpc/aws"', '  version = "~> 5.13"', '}'], { op: fade(u, 0.6) });
      // 버전 제약이 허용하는 범위
      const x0 = 520, x1 = 920, POS = { 5.12: 570, 5.13: 650, 5.5: 760, 6.0: 870 }, X = (v) => POS[v];
      tx(x0, 200, 'version = "~> 5.13" 이 받는 버전', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      el('line', { x1: x0, y1: 260, x2: x1, y2: 260, stroke: MUT, 'stroke-width': 2, opacity: fade(u, 1.0) });
      const g = E(u, 1.2, 2.2); el('rect', { x: X(5.13), y: 250, width: (X(6.0) - X(5.13)) * g, height: 20, rx: 4, fill: GOOD, opacity: 0.35 });
      [[5.12, '5.12', 0], [5.13, '5.13', 1], [5.5, '5.x', 1], [6.0, '6.0', 0]].forEach(([v, s, ok], i) => { const op = fade(u, 1.3 + i * 0.25);
        el('line', { x1: X(v), y1: 252, x2: X(v), y2: 268, stroke: INK, 'stroke-width': 2, opacity: op });
        mono(X(v), 292, s, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: op });
        (ok ? check : cross)(X(v), 318, 8, op); });
      tx(x0, 360, '5.13 이상 6.0 미만 · 버전 번호는 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.3) });
      tx(30, 240, 'init 때 .terraform/modules/에 내려받는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      return; }
    // k 2~3: 인자 → 3 AZ 네트워크
    if (k === 2 || k === 3) { const lines = k === 2
        ? ['name = "prod-vpc"', 'cidr = "10.2.0.0/16"', 'azs  = [2a, 2b, 2c]', 'private_subnets = [10.2.1~3.0/24]', 'public_subnets  = [10.2.101~103.0/24]']
        : ['enable_nat_gateway = true', 'single_nat_gateway = true', 'enable_flow_log    = true'];
      snippet(24, 60, lines, { fs: 14 });
      vpcRect(450, 40, 490, 330, 'prod-vpc 10.2.0.0/16');
      ['2a', '2b', '2c'].forEach((az, j) => { const x = 466 + j * 158, s = k === 2 ? seg(u, 0.5 + j * 0.3, 1.0 + j * 0.3) : 1;
        mono(x + 72, 84, az, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: clamp(s * 2) });
        subnetCell(x, 100, 146, 'public', '10.2.10' + (j + 1) + '.0/24', { s, fill: INFOBG, stroke: INFO });
        subnetCell(x, 160, 146, 'private', '10.2.' + (j + 1) + '.0/24', { s }); });
      if (k === 2) tx(695, 260, 'private / public 분리가 기본으로 따라온다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      if (k === 3) { const s = pop(u, 0.4); card(539, 245, 120, 40, { rx: 8, text: 'NAT GW × 1', fs: 14, fw: 800, stroke: WARN, color: WARN, fill: WARNBG, s });
        el('path', { d: 'M479,245 H456 V122 H466', fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 0.8) });
        mono(539, 284, 'single_nat_gateway', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
        const f = pop(u, 1.3); card(820, 265, 180, 40, { rx: 8, text: 'VPC flow log', fs: 14, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, s: f });
        for (let i = 0; i < 3; i++) dot([[700, 200], [770, 245]], ((t * 0.7 + i / 3) % 1) * (u > 1.4 ? 1 : 0), GOOD, 5);
        tx(695, 340, 'Step 1에서 세 파일을 고치던 flow log가 true 한 줄', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
      return; }
    if (k === 4) { const src = [['로컬 경로', '"./modules/vpc"'], ['공식 registry', '"terraform-aws-modules/vpc/aws"'], ['Git + 태그', '"git::https://…//vpc?ref=v1.0.0"']];
      src.forEach(([a, b], i) => { const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.5);
        tx(30, y - 6, a, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) }); mono(30, y + 18, b, { 'font-size': 13.5, fill: ACC, opacity: clamp(s) });
        grow(330, y + 6, 640, 190, seg(u, 0.5 + i * 0.5, 1.0 + i * 0.5), MUT); });
      snippet(650, 150, ['module "vpc" {', '  source = …', '}'], { op: fade(u, 0.2) });
      tx(780, 300, '어디서 오든 호출은 같다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      mono(780, 326, 'version은 registry에서만', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      return; }
    // k = 5: 다섯 단계 정리
    const st = ['복붙', '추출', '호출', '체이닝', 'registry'];
    el('line', { x1: 110, y1: 150, x2: lerp(110, 850, E(u, 0.2, 1.6)), y2: 150, stroke: GRID, 'stroke-width': 4 });
    st.forEach((s, i) => { const x = 110 + i * 185, sp = pop(u, 0.3 + i * 0.3);
      card(x, 150, 58, 58, { rx: 29, text: String(i + 1), fs: 20, fw: 800, mono: true, stroke: i === 0 ? BAD : ACC, color: i === 0 ? BAD : ACC, s: sp });
      tx(x, 206, s, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: clamp(sp) }); });
    tx(480, 290, '수정 지점', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.9) });
    mono(494, 290, '3곳 → 1곳', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
    tx(480, 340, '표준 인프라는 registry부터, 회사 고유 패턴만 직접', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); }

  const quiz = [
    { q: '같은 VPC 코드를 dev/staging/prod 폴더에 복붙했다. 보안팀이 flow log를 켜라고 하면 무엇이 문제인가?',
      o: ['Terraform이 같은 코드를 세 번 apply하지 못한다', '같은 수정을 세 파일에 해야 하고 한 곳을 빠뜨리면 환경이 어긋난다', 'state 파일이 하나로 합쳐진다'], a: 1,
      why: '복붙한 세 벌은 서로 모른다. 수정 지점이 1곳에서 3곳으로 늘고, 빠뜨린 환경만 조용히 달라진다.' },
    { q: 'module 안의 aws_internet_gateway.this를 호출자가 쓰려면 무엇이 필요한가?',
      o: ['module의 outputs.tf에 그 값을 output으로 선언한다', '호출자에서 aws_internet_gateway.this를 바로 참조한다', 'variable로 선언한다'], a: 0,
      why: 'module 안의 리소스는 밖에서 보이지 않는다. output으로 선언한 값만 module.<이름>.<output>으로 읽힌다.' },
    { q: 'prod만 서브넷이 3개 필요하다. module을 쓰는 올바른 방법은 무엇인가?',
      o: ['modules/vpc/main.tf에 prod 전용 서브넷 블록을 더한다', 'prod용 module 폴더를 따로 복사한다', 'prod 호출에서 public_subnets 목록에 하나를 더 넘긴다'], a: 2,
      why: '본체의 for_each가 넘긴 목록 길이만큼 서브넷을 만든다. 환경 차이는 코드가 아니라 인자로 표현한다.' },
    { q: 'eks와 rds가 둘 다 module.vpc의 출력만 참조한다. apply 순서는 어떻게 되는가?',
      o: ['vpc가 끝난 뒤 eks와 rds가 동시에 만들어진다', 'vpc, eks, rds 순서로 하나씩 만들어진다', '셋이 처음부터 동시에 만들어진다'], a: 0,
      why: '참조가 의존 간선이 된다. eks와 rds 사이에는 간선이 없으므로 vpc 다음에 병렬로 간다.' },
    { q: 'registry module에 version = "~> 5.13"을 걸었다. 받아들이는 버전은 무엇인가?',
      o: ['5.13.x만', '5.13 이상 6.0 미만', '5.13 이상 모든 버전'], a: 1,
      why: '~> 는 맨 오른쪽 자리만 올라가게 둔다. "~> 5.13"은 5.x 안에서 5.13 이상이고 6.0은 막는다.' },
  ];

  const summary = [
    '환경마다 같은 코드를 복붙하면 한 줄 수정이 세 파일 수정이 되고 빠뜨린 곳만 달라진다.',
    'module은 variables(입력), main(본체), outputs(출력) 세 파일로 된 함수다.',
    '환경 차이는 module을 고치지 않고 name, cidr_block, 서브넷 목록 같은 인자로 넘긴다.',
    '한 module의 output을 다른 module의 입력에 꽂으면 순서와 병렬 생성을 Terraform이 정한다.',
  ];
  const review = [
    { q: 'staging에만 서브넷을 추가하려고 modules/vpc/main.tf에 블록을 직접 넣었더니 dev와 prod plan에도 변경이 떴다. 먼저 고칠 것은?',
      o: ['dev와 prod에서 그 블록을 지우는 코드를 따로 만든다', '블록을 되돌리고 staging 호출의 public_subnets 인자에 항목을 더한다', 'staging만 module 폴더를 복사해 쓴다'], a: 1,
      why: 'module 본체는 세 환경이 함께 쓴다. 한 환경만의 차이는 그 환경의 호출 인자로 넘겨야 다른 환경에 번지지 않는다.' },
    { q: 'module.rds가 module.vpc 출력을 쓰는데 depends_on 없이 apply했더니 vpc가 먼저 만들어졌다. 이유는?',
      o: ['Terraform은 파일에 적힌 순서대로 만들기 때문이다', 'registry module은 순서를 스스로 정하기 때문이다', 'module.vpc.vpc_id 참조가 의존 간선이 되기 때문이다'], a: 2,
      why: '출력을 입력에 꽂는 참조 자체가 그래프의 간선이다. 그래서 vpc가 끝나야 rds가 시작된다.' },
    { q: 'cluster_endpoint output에 sensitive = true를 붙였다. 그래도 조심해야 할 곳은?',
      o: ['state 파일. 값이 평문으로 남는다', 'plan 출력. 값이 그대로 찍힌다', 'module 호출부. 값을 읽을 수 없게 된다'], a: 0,
      why: 'sensitive는 plan과 output 화면에서만 값을 가린다. state에는 그대로 저장되므로 backend 접근 권한을 관리해야 한다.' },
  ];

  R.page({ title: 'module 조립 무대', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
