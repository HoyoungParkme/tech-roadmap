/* I-1-2 IaC 란 무엇인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone,
    server, person, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const SYM = { '+': GOOD, '~': WARN, '-': BAD, '-/+': BAD };

  // ---------- 공통 부품 ----------
  // 코드 판: lines = [[처음 보이는 beat, 글]], 지금 beat 줄은 밝게
  function codePanel(x, y, w, h, title, lines, k, u, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 24, title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    let yy = y + 52; const lh = o.lh || 21;
    lines.forEach(([at, s]) => { if (at > k) return; const cur = at === k, op = cur ? fade(u, 0.15) : 1;
      if (cur && !o.noHi) el('rect', { x: x + 6, y: yy - 15, width: w - 12, height: lh, rx: 4, fill: ACCBG, opacity: op });
      R.spans(x + 14, yy, R.tokens(s), { 'font-size': 13.5, opacity: op }); yy += lh; }); }
  // AWS 리전 판
  function region(x, y, w, h, name, o) { o = o || {};
    zone(x, y, w, h, null, { fill: o.fill || PANEL, stroke: o.stroke || INFO, dash: '7 5', sw: 2 });
    mono(x + 14, y + 22, name, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || INFO }); }
  // state 파일 그림 (접힌 귀퉁이)
  function stateDoc(cx, cy, w, h, rows, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2, s = o.s ?? 1; if (s <= 0) return;
    const g = R.G(0, 0, 1, o.op);
    el('path', { d: `M${x},${y} H${x + w - 18} L${x + w},${y + 18} V${y + h} H${x} Z`, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    el('path', { d: `M${x + w - 18},${y} V${y + 18} H${x + w}`, fill: 'none', stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    mono(x + 12, y + 22, o.title || 'terraform.tfstate', { 'font-size': 13.5, 'font-weight': 700, fill: o.stroke || INK }, g);
    (rows || []).forEach((r, i) => mono(x + 12, y + 46 + i * 21, r, { 'font-size': 13.5, fill: MUT }, g)); }
  // plan 기호 상자
  function symBox(cx, cy, sym, s) { const col = SYM[sym] || MUT; card(cx, cy, sym.length > 1 ? 52 : 34, 34, { rx: 6, fill: PANEL, stroke: col, sw: 2.2, text: sym, fs: 17, fw: 800, color: col, mono: true, s }); }

  // =========================================================
  // 1. 명령적 — 한 줄씩 시키고 ID 를 넘긴다
  // =========================================================
  const CMD = ['① aws ec2 create-vpc', '② aws ec2 create-subnet', '③ aws ec2 create-security-group', '④ aws ec2 run-instances'];
  const NEED = [[], ['$VPC_ID'], ['$VPC_ID'], ['$SUBNET_ID', '$SG_ID']];
  const OUTV = ['VPC_ID', 'SUBNET_ID', 'SG_ID', null];
  function s1(t, c) { const { k, u } = c, st = c.beat.imperative.steps, pst = c.prev ? c.prev.imperative.steps : st.map(() => ({ ok: false }));
    // set -e
    card(150, 32, 150, 34, { rx: 8, text: 'set -e', fs: 15, mono: true, stroke: k === 0 ? ACC : GRID, sw: 2 });
    if (k === 0) { tx(250, 30, '에러가 나면 멈춘다', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) }); check(240, 25, 7, pop(u, 0.4));
      tx(250, 52, '만든 것을 되돌리지는 않는다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) }); cross(240, 47, 6, pop(u, 1.1)); }
    // 명령 네 줄
    CMD.forEach((s, i) => { const y = 92 + i * 66, ok = st[i].ok, fresh = ok && !pst[i].ok, cur = fresh || (k === 5 && i === 0);
      card(250, y, 440, 48, { rx: 8, stroke: cur ? ACC : ok ? GOOD : GRID, sw: cur ? 2.5 : 1.8, fill: ok ? PANEL : SOFT });
      mono(44, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: ok ? INK : MUT });
      let px = 436; NEED[i].slice().reverse().forEach((v) => { const w = R.tw(v, 13.5) + 26; pill(px - w / 2, y, v, INFO, 1, { fs: 13.5, mono: true, op: ok ? 1 : 0.35 }); px -= w + 4; });
      if (ok) check(452, y, 9, fresh ? pop(u, 1.3) : 1); });
    // 명령 사이 흐름: 이번 beat 에 실행된 명령의 출력 ID 가 셸 변수로
    const run = st.findIndex((x, i) => x.ok && !pst[i].ok);
    // 셸 변수 칸
    zone(30, 360, 430, 46, null, { fill: SOFT });
    mono(44, 389, '셸 변수', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    OUTV.forEach((v, i) => { if (!v || !st[i].ok) return; const fresh = i === run, x = 140 + i * 108;
      pill(x + 44, 383, v, INFO, fresh ? pop(u, 1.9) : 1, { fs: 13.5, mono: true }); });
    // 오른쪽: AWS
    region(510, 24, 430, 280, 'AWS · ap-northeast-2', {});
    const sh = (i) => (st[i].ok ? (i === run ? pop(u, 0.9) : 1) : 0);
    if (run >= 0) dot([[460, 92 + run * 66], [600, 92 + run * 66]], seg(u, 0.3, 0.9), ACC, 7);
    if (sh(0) > 0) { zone(530, 50, 260, 240, null, { fill: 'none', stroke: INK, sw: 2, op: sh(0) }); mono(544, 72, 'vpc-aaa  10.0.0.0/16', { 'font-size': 13.5, 'font-weight': 700, opacity: sh(0) }); }
    if (sh(1) > 0) { zone(545, 86, 230, 140, null, { fill: SOFT, stroke: GRID, sw: 1.5, op: sh(1) }); mono(557, 106, 'subnet 10.0.1.0/24', { 'font-size': 13.5, fill: MUT, opacity: sh(1) }); }
    if (sh(2) > 0) card(660, 258, 150, 36, { rx: 8, text: 'web-sg', fs: 14, mono: true, stroke: WARN, sw: 2, s: sh(2) });
    if (sh(3) > 0) server(660, 166, null, { s: 0.6 * sh(3), lamp: GOOD });
    if (k === 3) { tx(655, 330, '③ 에서 실패했다면 ①② 는 그대로 남는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
    if (k === 5) { const s = pop(u, 0.9); zone(800, 50, 126, 240, null, { fill: C.BADBG, stroke: BAD, sw: 2.5, dash: '6 4', op: s });
      mono(863, 160, 'vpc-bbb', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: s }); tx(863, 184, '중복', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: s });
      tx(725, 332, '다시 돌리면 VPC가 또 생긴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    // 위험 목록
    const risks = c.beat.imperative.risks, pr = c.prev ? c.prev.imperative.risks.length : 0;
    risks.forEach((r, i) => { if (k === 3 || k === 5) return; tx(940, 334 + i * 24, r, { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: i >= pr ? fade(u, 2) : 1 }); }); }

  // =========================================================
  // 2. 선언적 — 있어야 할 것만 적고, 순서는 참조가 정한다
  // =========================================================
  const DECL = [[0, 'terraform {'], [0, '  required_providers {'], [0, '    aws = { source = "hashicorp/aws"'], [0, '            version = "~> 5.0" } } }'],
    [1, 'provider "aws" { region = "ap-northeast-2" }'],
    [2, 'resource "aws_vpc" "main" {'], [2, '  cidr_block = "10.0.0.0/16" }'],
    [3, 'resource "aws_subnet" "web" {'], [3, '  vpc_id = aws_vpc.main.id }'],
    [4, 'resource "aws_security_group" "web" {'], [4, '  vpc_id = aws_vpc.main.id }'],
    [5, 'resource "aws_instance" "web" {'], [5, '  subnet_id = aws_subnet.web.id'], [5, '  vpc_security_group_ids ='], [5, '    [aws_security_group.web.id] }']];
  const GN = { vpc: [700, 110, 'aws_vpc.main'], sub: [580, 230, 'aws_subnet.web'], sg: [820, 230, 'aws_security_group.web'], ec2: [700, 350, 'aws_instance.web'] };
  const gw = (id) => tw(GN[id][2], 14) + 28;
  function gnode(id, s, o) { o = o || {}; const [x, y, n] = GN[id]; card(x, y, gw(id), 40, { rx: 8, text: n, fs: 14, mono: true, s, stroke: o.col || INK, fill: o.fill || PANEL, sw: o.sw || 2 }); }
  function gedge(a, b, u, col) { const [x1, y1] = GN[a], [x2, y2] = GN[b]; const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    grow(x1 + dx * 22 / L * (Math.abs(dx) > 10 ? 2.2 : 1), y1 + 20, x2 - dx * 0.12, y2 - 22, u, col || MUT); }
  function s2(t, c) { const { k, u } = c, d = c.beat.declarative, pd = c.prev ? c.prev.declarative : d;
    codePanel(20, 20, 410, 380, 'declarative.tf (줄인 모양)', DECL, k, u, { noHi: k === 6 });
    // 오른쪽 위: plan 요약
    const n = (s) => +((s || '').match(/\+ (\d+)/) || [0, 0])[1];
    const cnt = tween(n(pd.diff), n(d.diff), u);
    tx(940, 40, 'plan', { 'text-anchor': 'end', 'font-size': 14, fill: MUT, 'font-weight': 700 });
    mono(940, 66, `+ ${Math.round(cnt)} to add`, { 'text-anchor': 'end', 'font-size': 18, 'font-weight': 800, fill: cnt > 0.5 ? GOOD : MUT });
    if (k <= 1) { const s = k === 0 ? pop(u, 0.3) : 1; // provider 플러그인
      card(640, 170, 220, 70, { rx: 12, stroke: ACC, sw: 2.2, s }); el('rect', { x: 548, y: 160, width: 22, height: 20, rx: 3, fill: ACC, opacity: s });
      el('line', { x1: 553, y1: 160, x2: 553, y2: 150, stroke: ACC, 'stroke-width': 3, opacity: s }); el('line', { x1: 565, y1: 160, x2: 565, y2: 150, stroke: ACC, 'stroke-width': 3, opacity: s });
      mono(585, 166, 'hashicorp/aws', { 'font-size': 14.5, 'font-weight': 700, opacity: s }); mono(585, 188, '~> 5.0', { 'font-size': 14, fill: ACC, opacity: s });
      if (k === 1) { grow(640, 205, 640, 262, E(u, 0.3, 1.0), INFO); card(640, 290, 200, 46, { rx: 8, stroke: INFO, sw: 2, dash: '6 4', text: 'ap-northeast-2', fs: 14.5, mono: true, color: INFO, s: pop(u, 0.9) }); }
      sub(640, 380, k === 0 ? '무엇으로 만들지 먼저 정한다' : '어디에 만들지 한 줄', fade(u, 1.2), { 'font-size': 14.5, fill: INK, 'font-weight': 600 }); return; }
    const sh = (at) => (k === at ? pop(u, 0.3) : k > at ? 1 : 0);
    if (k >= 2) gnode('vpc', sh(2), { col: k === 2 ? ACC : INK });
    if (k >= 3) { gnode('sub', sh(3), { col: k === 3 ? ACC : INK }); gedge('vpc', 'sub', k === 3 ? E(u, 0.7, 1.5) : 1, k === 3 ? ACC : MUT); }
    if (k >= 4) { gnode('sg', sh(4), { col: k === 4 ? ACC : INK }); gedge('vpc', 'sg', k === 4 ? E(u, 0.7, 1.5) : 1, k === 4 ? ACC : MUT); }
    if (k >= 5) { gnode('ec2', sh(5), { col: k === 5 ? ACC : INK }); gedge('sub', 'ec2', k === 5 ? E(u, 0.7, 1.4) : 1, k === 5 ? ACC : MUT); gedge('sg', 'ec2', k === 5 ? E(u, 1.0, 1.7) : 1, k === 5 ? ACC : MUT); }
    if (k === 3) sub(700, 300, '참조 aws_vpc.main.id가 화살표가 된다', fade(u, 1.5), { 'font-size': 14.5, fill: INK, 'font-weight': 600 });
    if (k === 6) { // 실행 순서: 의존이 끝난 것끼리 동시에
      [['vpc'], ['sub', 'sg'], ['ec2']].forEach((wave, i) => { const a = 0.3 + i * 0.7;
        wave.forEach((id) => { const [x, y] = GN[id]; card(x - gw(id) / 2 - 2, y - 22, 28, 28, { rx: 14, fill: ACC, stroke: 'none', text: String(i + 1), fs: 14, fw: 800, color: PANEL, s: pop(u, a) }); }); });
      tx(940, 400, '같은 번호는 동시에 만든다', { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); } }

  // =========================================================
  // 3. 변경 감지 — 코드 · state · 실제 AWS
  // =========================================================
  const RS = ['aws_vpc.main', 'aws_subnet.web', 'aws_security_group.web', 'aws_instance.web'];
  function col3(x, title, sub2, vals, o) { o = o || {}; zone(x, 30, 290, 270, null, { fill: o.fill || SOFT, stroke: o.stroke || 'none', sw: 2, op: o.op });
    tx(x + 145, 56, title, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, opacity: o.op ?? 1 });
    tx(x + 145, 78, sub2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 });
    vals.forEach((v, i) => { const y = 112 + i * 46, s = o.s ? o.s(i) : 1; if (s <= 0) return;
      card(x + 145, y, 262, 38, { rx: 7, fill: PANEL, stroke: o.hi === i ? WARN : GRID, sw: o.hi === i ? 2.5 : 1.5, s });
      mono(x + 26, y + 5, RS[i].replace('aws_security_group', 'aws_sg'), { 'font-size': 13.5, 'font-weight': 700, opacity: s });
      if (v) mono(x + 270, y + 5, v, { 'font-size': 13.5, 'font-weight': 800, fill: o.hi === i ? WARN : MUT, 'text-anchor': 'end', opacity: s }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) { const loaded = k > 0 || u > 1.6;
      col3(20, '.tf 코드', '원하는 상태', [null, null, null, 't3.small'], { hi: k >= 2 ? 3 : null });
      col3(335, 'terraform.tfstate', '알고 있는 상태', [null, null, null, 't3.micro'], { hi: k >= 2 ? 3 : null, s: (i) => (k === 0 ? pop(u, 0.6 + i * 0.25) : 1) });
      col3(650, '실제 AWS', '현재 상태', [null, null, null, 't3.micro'], { op: k === 1 ? 1 : 0.45, stroke: k === 1 ? INFO : 'none' });
      if (k === 1) { for (let i = 0; i < 4; i++) dot([[660, 112 + i * 46], [622, 112 + i * 46]], seg(u, 0.3 + i * 0.3, 0.9 + i * 0.3), INFO, 6);
        tx(640, 330, 'refresh: state에 적힌 자원만 다시 읽는다 (쓰기 없음)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) }); }
      if (k === 0) tx(480, 330, '입력은 코드와 state, 두 개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
      if (k >= 2) { [0, 1, 2, 3].forEach((i) => { const y = 112 + i * 46, same = i < 3, s = k === 2 ? pop(u, 0.3 + i * 0.35) : 1;
          card(322, y, 30, 30, { rx: 15, fill: same ? PANEL : C.WARNBG, stroke: same ? GOOD : WARN, sw: 2, text: same ? '=' : '≠', fs: 16, fw: 800, color: same ? GOOD : WARN, s }); }); }
      if (k === 2) { const s = fade(u, 1.8); el('rect', { x: 120, y: 318, width: 720, height: 40, rx: 8, fill: C.WARNBG, opacity: s });
        R.spans(140, 344, [['~ ', { fill: WARN, 'font-weight': 800 }], ['aws_instance.web  instance_type = "t3.micro" -> "t3.small"', {}]], { 'font-size': 14.5, opacity: s }); }
      if (k === 3) { [['add', 0, GOOD], ['change', 1, WARN], ['destroy', 0, BAD]].forEach(([n, v, col], i) => { const x = 250 + i * 230, s = pop(u, 0.2 + i * 0.3);
          card(x, 352, 200, 64, { rx: 10, stroke: col, sw: v ? 3 : 1.8, fill: v ? C.WARNBG : PANEL, s });
          mono(x - 70, 360, String(Math.round(v * E(u, 0.4, 1.2))), { 'font-size': 26, 'font-weight': 800, fill: col, opacity: s }); tx(x - 34, 358, `to ${n}`, { 'font-size': 15, 'font-weight': 700, opacity: s }); }); }
      return; }
    if (k === 4) { [['+', 'create', '새로 만든다', '처음 EC2 생성'], ['~', 'update', '속성만 바꾼다', 't3.micro → t3.small'], ['-', 'destroy', '지운다', '필요 없어진 자원'], ['-/+', 'replace', '지우고 다시 만든다', 'AMI 변경 등']].forEach(([sy, en, ko, ex], i) => {
        const y = 66 + i * 84, s = pop(u, 0.2 + i * 0.4); symBox(110, y, sy, s);
        mono(170, y + 6, en, { 'font-size': 16, 'font-weight': 800, fill: SYM[sy], opacity: s }); tx(290, y + 6, ko, { 'font-size': 16, 'font-weight': 700, opacity: s });
        tx(560, y + 6, ex, { 'font-size': 15, fill: MUT, opacity: s, class: 'mono' }); });
      const s = fade(u, 2); el('rect', { x: 60, y: 300, width: 840, height: 54, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', opacity: s });
      tx(480, 400, '-/+ 가 보이면 지웠다 다시 만드는 동안 끊길 수 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: s }); return; }
    // k5: bash 와 비교
    tx(240, 50, 'bash를 다시 돌리면', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    tx(720, 50, 'terraform plan은', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    CMD.forEach((s, i) => { const y = 100 + i * 56, sc = pop(u, 0.2 + i * 0.25); card(240, y, 360, 42, { rx: 8, stroke: BAD, sw: 1.8, text: s, fs: 14, mono: true, s: sc }); });
    tx(240, 352, '지금 상태를 모르니 전부 다시 실행', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
    RS.forEach((r, i) => { const y = 100 + i * 56, d = i === 3, sc = pop(u, 0.4 + i * 0.25);
      card(720, y, 360, 42, { rx: 8, stroke: d ? WARN : GRID, sw: d ? 2.5 : 1.5, fill: d ? C.WARNBG : PANEL, op: d ? 1 : 0.55, s: sc });
      mono(560, y + 5, (d ? '~ ' : '  ') + r, { 'font-size': 14, 'font-weight': 700, fill: d ? WARN : MUT, opacity: sc }); });
    tx(720, 352, '차이 한 줄만 골라 사람이 검토한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }

  // =========================================================
  // 4. 멱등성 — 두 번 돌려도 같다
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(480, 120, 'f(f(x)) = f(x)', { 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.2, 0.6) });
      [['x', 200], ['f(x)', 480], ['f(f(x))', 760]].forEach(([s, x], i) => { const sc = pop(u, 0.8 + i * 0.4);
        card(x, 250, 150, 60, { rx: 10, text: s, fs: 17, mono: true, stroke: i ? ACC : INK, sw: 2.2, s: sc }); if (i) { grow(x - 205, 250, x - 80, 250, E(u, 0.6 + i * 0.4, 1.1 + i * 0.4), ACC); mono(x - 142, 236, 'apply', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 0.9 + i * 0.4) }); } });
      tx(620, 320, '두 번째 apply는 아무것도 바꾸지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2) }); return; }
    if (k <= 4) { // 왼쪽 bash, 오른쪽 terraform
      tx(240, 40, 'bash 스크립트', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: k <= 2 ? INK : MUT });
      tx(720, 40, 'terraform apply', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: k >= 3 ? INK : MUT });
      el('line', { x1: 480, y1: 30, x2: 480, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
      region(40, 66, 400, 230, 'AWS', {});
      const nb = k === 1 ? 1 : k >= 2 ? 2 : 0;
      ['vpc-aaa', 'vpc-bbb'].forEach((v, i) => { if (i >= nb) return; const s = (k === 1 && i === 0) || (k === 2 && i === 1) ? pop(u, 0.6) : 1;
        card(140 + i * 200, 180, 170, 90, { rx: 10, stroke: i ? BAD : INK, sw: 2.5, fill: i ? C.BADBG : PANEL, dash: i ? '6 4' : null, text: v, fs: 16, mono: true, color: i ? BAD : INK, s }); });
      if (nb) { mono(60, 330, `$ ./imperative.sh   × ${nb}`, { 'font-size': 14.5, 'font-weight': 700 }); }
      if (k >= 2) tx(240, 372, 'VPC 2개, 요금도 2배', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: k === 2 ? fade(u, 1.4) : 1 });
      // terraform
      region(520, 66, 400, 230, 'AWS', { stroke: k >= 3 ? INFO : GRID });
      if (k >= 3) { RS.forEach((r, i) => { const s = k === 3 ? pop(u, 0.4 + i * 0.25) : 1; card(720, 110 + i * 44, 300, 34, { rx: 7, text: r, fs: 13.5, mono: true, s, stroke: GOOD, sw: 1.8 }); });
        const lines = k === 3 ? ['Apply complete! Resources:', '4 added, 0 changed, 0 destroyed.'] : ['No changes. Your infrastructure', 'matches the configuration.'];
        mono(540, 324, `$ terraform apply   (${k - 2}회차)`, { 'font-size': 14.5, 'font-weight': 700 });
        lines.forEach((s, i) => mono(540, 348 + i * 20, s, { 'font-size': 13.5, 'font-weight': 700, fill: k === 3 ? GOOD : INFO, opacity: fade(u, 1.4 + i * 0.2) }));
        if (k === 4) { tx(720, 402, 'state와 코드가 같으니 할 일이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2) }); } }
      else sub(720, 186, '(아직 실행 전)', 1);
      return; }
    if (k === 5) { tx(480, 50, 'CI가 몇 번을 돌려도', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      ['4 added', 'No changes', 'No changes', 'No changes', 'No changes'].forEach((s, i) => { const x = 110 + i * 185, sc = pop(u, 0.2 + i * 0.35);
        card(x, 150, 140, 92, { rx: 12, stroke: i ? INFO : GOOD, sw: 2, s: sc }); mono(x, 136, `run #${i + 1}`, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: sc });
        mono(x, 164, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: i ? INFO : GOOD, opacity: sc });
        if (i) grow(x - 112, 150, x - 74, 150, E(u, 0.1 + i * 0.35, 0.4 + i * 0.35), MUT); });
      [['중간에 멈춰도', '다시 돌리면 된다'], ['동료가 돌려도', '같은 결과']].forEach(([a, b], i) => { const x = 300 + i * 360, s = pop(u, 1.8 + i * 0.3);
        card(x, 310, 300, 70, { rx: 10, stroke: GOOD, sw: 2, fill: C.GOODBG, s }); tx(x, 304, a, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: s }); tx(x, 328, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: s }); });
      return; }
    // k6: 멱등성을 깨는 코드
    tx(480, 46, '이런 코드는 매번 바뀐다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD });
    tx(745, 80, '다시 돌리면', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
    [['provisioner "local-exec"', 'useradd 같은 비멱등 명령', '다시 만들 때 또 실행, 실패', BAD], ['timestamp()', '실행할 때마다 값이 다르다', '매번 ~ 1 update', WARN], ['null_resource + triggers', '트리거 값이 매번 바뀌게 묶음', '매번 -/+ 1 replace', BAD]].forEach(([a, b, r, col], i) => { const y = 132 + i * 94, s = pop(u, 0.3 + i * 0.45);
      card(300, y, 440, 74, { rx: 10, stroke: BAD, sw: 2, s }); mono(100, y - 6, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); tx(100, y + 20, b, { 'font-size': 14, fill: MUT, opacity: s });
      const g = E(u, 0.8 + i * 0.45, 1.2 + i * 0.45); grow(522, y, 576, y, g, col);
      card(745, y, 330, 48, { rx: 8, stroke: col, sw: 1.8, fill: col === WARN ? C.WARNBG : C.BADBG, text: r, fs: 14.5, color: col, s: pop(u, 1.1 + i * 0.45) });
    }); }

  // =========================================================
  // 5. 협업 + git — PR 로 리뷰하고 머지 때 apply
  // =========================================================
  const LOG = [['a3f1c2b', 'web 인스턴스 t3.small로', '#42'], ['8b7d9e1', '0.0.0.0/0 SSH 차단', '#41'], ['5c2a4f8', '2c 가용영역 추가', '#40'], ['1f9b3a7', '초기 VPC와 EC2 1대', '#1']];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 50, '$ git log --oneline terraform/', { 'font-size': 15, 'font-weight': 700 });
      el('line', { x1: 90, y1: 90, x2: 90, y2: lerp(90, 370, E(u, 0.2, 1.6)), stroke: INK, 'stroke-width': 3 });
      LOG.forEach(([h, m, pr], i) => { const y = 100 + i * 86, s = pop(u, 0.3 + i * 0.35);
        el('circle', { cx: 90, cy: y, r: 10 * s, fill: i ? PANEL : ACC, stroke: ACC, 'stroke-width': 3 });
        mono(120, y + 5, h, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: s }); tx(220, y + 5, m, { 'font-size': 16, 'font-weight': 600, opacity: s });
        pill(560, y, 'PR ' + pr, INFO, s, { fs: 13.5, mono: true }); });
      tx(760, 230, '누가 · 언제 · 왜', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.8) }); tx(760, 256, '커밋과 PR에 남는다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k <= 2) { // 브랜치 → PR → 리뷰 → 머지 → apply
      el('line', { x1: 40, y1: 300, x2: 920, y2: 300, stroke: INK, 'stroke-width': 4 }); mono(40, 330, 'main', { 'font-size': 15, 'font-weight': 700 });
      const bu = k === 1 ? E(u, 0.2, 1.0) : 1; el('path', { d: 'M120,300 C160,300 160,180 220,180 H' + lerp(220, 520, bu), fill: 'none', stroke: ACC, 'stroke-width': 4 });
      mono(230, 166, 'feature/upgrade-instance', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: bu });
      el('circle', { cx: 380, cy: 180, r: 9, fill: ACC, opacity: bu }); mono(380, 208, 'instance_type', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: bu });
      card(560, 90, 220, 50, { rx: 10, text: 'PR #42', fs: 17, fw: 800, stroke: INFO, sw: 2.2, s: k === 1 ? pop(u, 0.9) : 1 });
      const bub = k === 1 ? fade(u, 1.6) : 1; el('rect', { x: 690, y: 40, width: 250, height: 66, rx: 10, fill: C.WARNBG, stroke: WARN, 'stroke-width': 1.8, opacity: bub });
      tx(704, 62, 'CI bot · terraform plan', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: bub }); mono(704, 88, '~ 1 to change', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: bub });
      if (k === 2) { person(400, 96, null, { s: pop(u, 0.2) }); check(436, 74, 9, pop(u, 0.6)); tx(364, 102, '리뷰어 승인', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.6) });
        const mu = E(u, 0.9, 1.7); el('path', { d: `M520,180 C580,180 580,300 ${lerp(600, 640, mu)},300`, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: mu });
        el('circle', { cx: 640, cy: 300, r: 11 * mu, fill: ACC });
        grow(640, 312, 640, 372, E(u, 1.7, 2.3), GOOD); pill(640, 392, 'CD · terraform apply', GOOD, pop(u, 2.2), { fs: 14, mono: true }); }
      return; }
    if (k <= 4) { // GitHub Actions 두 job
      mono(40, 50, 'on: pull_request (terraform/**) · push (main)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      const jobs = [['plan', 280, ['init', 'plan -no-color'], 'PR · main 둘 다'], ['apply', 680, ['init', 'apply -auto-approve'], 'main에서만']];
      jobs.forEach(([n, x, steps, cond], i) => { if (i === 1 && k < 4) return; const s = (k === 3 && i === 0) || (k === 4 && i === 1) ? pop(u, 0.3) : 1, hot = (k === 3 && i === 0) || (k === 4 && i === 1);
        card(x, 210, 280, 190, { rx: 12, stroke: hot ? ACC : GRID, sw: hot ? 2.5 : 1.8, s });
        mono(x - 120, 146, `job: ${n}`, { 'font-size': 16, 'font-weight': 800, fill: hot ? ACC : INK, opacity: s }); tx(x + 120, 146, cond, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', 'font-weight': 700, opacity: s });
        steps.forEach((st, j) => { const sy = 196 + j * 48, ss = (k === 3 && i === 0) || (k === 4 && i === 1) ? pop(u, 0.8 + j * 0.4) : 1;
          card(x, sy, 240, 36, { rx: 7, fill: SOFT, stroke: GRID, sw: 1.2, text: 'terraform ' + st, fs: 14, mono: true, s: ss }); }); });
      if (k === 4) { grow(422, 210, 538, 210, E(u, 0.9, 1.6), ACC); mono(480, 196, 'needs', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
        tx(480, 360, 'plan이 성공해야 apply가 시작된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      else tx(680, 220, 'PR에서는 plan까지만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      return; }
    if (k === 5) { // apply 로 실제 반영
      pill(170, 80, 'terraform apply -auto-approve', GOOD, pop(u, 0.2), { fs: 14.5, mono: true });
      region(380, 40, 300, 200, 'AWS', {}); server(470, 140, null, { s: 0.8, lamp: GOOD });
      const cu = E(u, 0.8, 1.6); mono(540, 132, 't3.micro', { 'font-size': 15, fill: MUT, opacity: 1 - cu, 'text-decoration': 'line-through' }); mono(540, 156, 't3.small', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: cu });
      dot([[300, 80], [400, 120]], seg(u, 0.3, 0.9), GOOD, 7);
      stateDoc(830, 140, 210, 130, ['backend "s3"', 'aws_instance.web', '  t3.small'], { s: 1, op: fade(u, 1.6) }); lock(910, 200, true, ACC, pop(u, 2.0));
      tx(830, 238, 'S3 + lock', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 2) });
      tx(480, 330, '사람 확인은 PR 리뷰에서 이미 끝났다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    [['콘솔에서 손으로 클릭', '코드 수정 + PR'], ['"누가 바꿨지?" 추적 불가', 'git blame으로 바로'], ['환경 수동 동기화', '같은 코드, 변수만'], ['장애 복구는 기억에 의존', '코드 다시 apply']].forEach(([a, b], i) => { const y = 70 + i * 82, s = pop(u, 0.2 + i * 0.4);
      card(250, y, 340, 58, { rx: 10, stroke: BAD, sw: 1.8, fill: C.BADBG, text: a, fs: 15, s }); grow(425, y, 525, y, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), GOOD);
      card(710, y, 340, 58, { rx: 10, stroke: GOOD, sw: 2, fill: C.GOODBG, text: b, fs: 15, fw: 700, s: pop(u, 0.8 + i * 0.4) }); }); }

  const quiz = [
    { q: '명령적 bash 스크립트를 같은 계정에서 한 번 더 돌리면 어떻게 되는가?',
      o: ['이미 있는 VPC를 알아보고 건너뛴다', '앞에서 만든 자원을 지우고 다시 만든다', 'VPC가 하나 더 생긴다'], a: 2,
      why: '스크립트는 지금 상태를 모른 채 명령만 다시 실행한다. 그래서 vpc-aaa 옆에 vpc-bbb가 또 생긴다.' },
    { q: 'declarative.tf에서 서브넷이 VPC보다 나중에 만들어지는 이유는 무엇인가?',
      o: ['vpc_id = aws_vpc.main.id로 VPC를 참조해서', '파일에서 VPC 블록이 먼저 적혀 있어서', '알파벳 순서로 만들어서'], a: 0,
      why: '참조가 의존성 그래프의 간선이 된다. 의존이 없는 서브넷과 보안그룹은 VPC 다음에 동시에 만들어진다.' },
    { q: 'terraform plan이 instance_type 한 줄만 ~로 보여 줄 때 비교한 두 가지는 무엇인가?',
      o: ['git의 이전 커밋과 지금 커밋', '.tf 코드와 refresh된 state', 'AWS 콘솔 화면과 CloudTrail'], a: 1,
      why: 'plan은 state에 적힌 자원을 실제 API로 다시 읽은 뒤 코드와 비교한다. 그 결과 0 add, 1 change, 0 destroy가 나온다.' },
    { q: '같은 코드로 terraform apply를 두 번째 돌렸을 때 결과는 무엇인가?',
      o: ['VPC가 하나 더 생긴다', '4개 자원을 지우고 다시 만든다', 'No changes. Your infrastructure matches the configuration.'], a: 2,
      why: '첫 apply 결과가 state에 남아 있어 두 번째에는 코드와 state가 같다. 그래서 할 일이 없다.' },
    { q: '이 장의 GitHub Actions에서 apply job이 돌기 위한 조건은 무엇인가?',
      o: ['main에 push되고 plan job이 성공했을 때', 'PR이 열리기만 하면 언제나', '리뷰어가 댓글로 apply라고 적었을 때'], a: 0,
      why: 'apply는 refs/heads/main일 때만 돌고 needs: plan으로 plan job을 기다린다. PR 단계에서는 plan까지만 한다.' },
  ];
  const summary = [
    'bash 스크립트는 순서를 사람이 정하고, 두 번 돌리면 VPC가 하나 더 생긴다.',
    'Terraform은 있어야 할 자원만 적고, 만드는 순서는 참조로 생긴 그래프가 정한다.',
    'plan은 state를 실제 API로 새로 읽은 뒤 코드와 비교해 바뀔 줄만 +, ~, -로 보여 준다.',
    '두 번째 apply는 No changes라서 CI가 PR 머지 때마다 돌려도 안전하다.',
  ];
  const review = [
    { q: 'CI에서 terraform apply가 중간에 네트워크 오류로 끊겼다. 다음에 할 일로 맞는 것은?',
      o: ['콘솔에서 만들어진 자원을 손으로 지운다', '같은 코드로 plan과 apply를 다시 돌린다', 'state 파일을 지우고 처음부터 만든다'], a: 1,
      why: '끊기기 전에 만든 자원은 state에 기록된다. 다시 돌리면 남은 차이만 만들기 때문에 이어서 끝낼 수 있다.' },
    { q: 'PR의 plan 코멘트에 -/+ aws_instance.web이 보인다. 리뷰어가 먼저 확인할 것은?',
      o: ['커밋 메시지의 맞춤법', 'CI 실행 시간', '인스턴스를 지웠다 다시 만들어도 되는지'], a: 2,
      why: '-/+는 제자리 변경이 안 되어 지우고 새로 만든다는 뜻이다. 그동안 서비스가 끊길 수 있다.' },
    { q: '누군가 콘솔에서 인스턴스 타입을 t3.medium으로 바꿨다. 코드는 t3.small이다. 다음 plan은 무엇을 보여 주는가?',
      o: ['~ instance_type "t3.medium" -> "t3.small"', '변경 없음', '+ 새 인스턴스 생성'], a: 0,
      why: 'plan은 refresh로 실제 값 t3.medium을 읽고 코드의 t3.small과 비교한다. 그래서 되돌리는 ~ 변경이 나온다.' },
  ];

  R.page({ title: '명령적에서 선언적으로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
