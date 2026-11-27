/* I-1-1 클릭 운영의 4대 함정 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone,
    server, person, cross, check, clock, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통 부품 ----------
  // 표의 한 칸: 값이 u 만큼 타이핑되며 채워진다
  function typed(s, u) { const n = Math.round(String(s).length * clamp(u)); return String(s).slice(0, n); }
  function cell(x, y, w, h, s, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: o.op ?? 1 });
    if (s) mono(x + 12, y + h / 2 + 5, s, { 'font-size': o.fs || 14, 'font-weight': o.fw || 600, fill: o.color || INK, opacity: o.op ?? 1 }); }
  // 리전 상자 (AWS 리전 = 점선 테두리 판)
  function region(x, y, w, h, name, o) { o = o || {};
    zone(x, y, w, h, null, { fill: o.fill || PANEL, stroke: o.stroke || INFO, dash: '7 5', sw: 2, op: o.op });
    mono(x + 14, y + 24, name, { 'font-size': 14, 'font-weight': 700, fill: o.stroke || INFO, opacity: o.op ?? 1 }); }
  // 기록 줄: ✓ 또는 ✕ 와 글
  function recRow(x, y, ok, s, op, sc) { if (op <= 0) return; (ok ? check : cross)(x, y, 8, sc ?? 1);
    tx(x + 20, y + 5, s, { 'font-size': 14.5, 'font-weight': 600, fill: ok ? INK : BAD, opacity: op }); }

  // =========================================================
  // 1. 콘솔에서 손으로 클릭
  // =========================================================
  function s1(t, c) { const { k, u } = c, b = c.beat, A = b.envA;
    // 왼쪽: 콘솔 화면
    R.browser(245, 205, 430, 340, null, {});
    mono(96, 59, 'AWS 콘솔 › EC2 › Launch instance', { 'font-size': 13.5, fill: MUT });
    tx(60, 100, '김주임 · 14:23 로그인', { 'font-size': 15, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
    const rows = [['Region', 'region', 1], ['Instance type', 'type', 1], ['Security group', 'sg', 2]];
    rows.forEach(([name, key, at], i) => { const y = 132 + i * 62, v = A[key] === '—' ? '' : A[key];
      tx(60, y, name, { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      const tu = k === at ? seg(u, 0.3 + i * 0.5, 1.2 + i * 0.5) : k > at ? 1 : 0;
      const show = key === 'sg' && v ? 'SSH 22 ← 0.0.0.0/0' : v;
      cell(60, y + 8, 236, 34, typed(show, tu), { stroke: tu > 0 && k === at ? ACC : GRID, color: key === 'sg' && v ? WARN : INK });
      el('path', { d: `M${276},${y + 22} l6,7 l6,-7`, fill: 'none', stroke: MUT, 'stroke-width': 2 }); });
    // Launch 버튼
    const press = k === 3 ? pop(u, 0.2) : 1;
    card(130, 340, 140, 40, { rx: 8, fill: k >= 3 ? ACC : SOFT, stroke: k >= 3 ? ACC : GRID, text: 'Launch ▶', fs: 15, fw: 800, color: k >= 3 ? PANEL : MUT, s: k === 3 ? 0.9 + 0.1 * press : 1 });
    // 머릿속 말풍선 (기록되지 않는 이유)
    const why = k === 1 ? ['왜 t3.small?', fade(u, 1.6)] : k === 2 ? ['편하니까', fade(u, 1.4)] : null;
    if (why) { const [s, op] = why, bx = 322, by = k === 1 ? 232 : 296;
      el('ellipse', { cx: bx + 60, cy: by - 40, rx: tw(s, 14.5) / 2 + 22, ry: 22, fill: SOFT, stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', opacity: op });
      tx(bx + 60, by - 35, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-style': 'italic', fill: MUT, opacity: op });
      sub(bx + 60, by - 2, '머릿속에만', op); }
    // 오른쪽 위: 리전 (k3 부터 서버가 생긴다)
    region(500, 24, 430, 160, 'ap-northeast-2', {});
    if (k >= 3) { const s = k === 3 ? pop(u, 0.5) : 1; server(610, 104, null, { s, lamp: GOOD });
      mono(690, 92, 'i-0a1b2c3d4e5f6a7b8', { 'font-size': 14, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.9) : 1 });
      mono(690, 116, '13.124.x.x', { 'font-size': 14, fill: MUT, opacity: k === 3 ? fade(u, 1.1) : 1 });
      pill(760, 150, '5분 만에 생성', GOOD, k === 3 ? pop(u, 1.4) : 1, { fs: 13.5 }); }
    else sub(715, 112, '아직 비어 있다', 1);
    // 오른쪽 아래: 남는 기록
    zone(500, 204, 430, 196, '남는 기록', { fill: SOFT });
    const recs = [[0, true, '작업자 김주임'], [0, true, '작업 시각 14:23'], [1, false, 'region·type을 고른 이유'], [2, false, 'SSH를 전체 공개한 이유'], [4, false, '같은 환경을 다시 만들 명세']];
    recs.forEach(([at, ok, s], i) => { if (k < at) return; const op = k === at ? fade(u, 0.3 + (at === 0 ? i * 0.3 : 0.6)) : 1;
      recRow(530, 246 + i * 32, ok, s, op, k === at ? pop(u, 0.3 + (at === 0 ? i * 0.3 : 0.6)) : 1); }); }

  // =========================================================
  // 2. 환경 B 를 비슷하게 — 칸이 하나씩 빨개진다
  // =========================================================
  const ROWS2 = [['region', 'region'], ['instance type', 'type'], ['security group', 'sg'], ['AMI', null], ['disk', null]];
  const SAME = { AMI: 'Amazon Linux 2023', disk: '8 GiB gp3' };
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || b, x0 = 30, w0 = 140, wc = 220;
    tx(x0 + w0 + 12, 40, '환경 A (운영)', { 'font-size': 15, 'font-weight': 700 });
    tx(x0 + w0 + wc + 22, 40, '환경 B (스테이징)', { 'font-size': 15, 'font-weight': 700, fill: k ? INK : MUT });
    ROWS2.forEach(([name, key], i) => { const y = 56 + i * 52;
      tx(x0, y + 26, name, { 'font-size': 14.5, 'font-weight': 600, fill: MUT });
      const a = key ? b.envA[key] : SAME[name]; let bv = key ? b.envB[key] : (k >= 4 ? SAME[name] : '—');
      if (bv === '—') bv = '';
      const fresh = key ? (p.envB[key] !== b.envB[key] && b.envB[key] !== '—') : k === 4, tu = fresh ? seg(u, 0.3, 1.3) : 1;
      const diff = key && b.diffKeys.includes(key) && (!fresh || u > 1.3);
      cell(x0 + w0, y, wc, 40, a, {});
      cell(x0 + w0 + wc + 10, y, wc, 40, typed(bv, tu), { stroke: diff ? BAD : fresh ? ACC : GRID, fill: diff ? C.BADBG : PANEL, color: diff ? BAD : INK, sw: diff ? 2.2 : 1.5 });
      if (!key && k >= 4) check(x0 + w0 + 2 * wc + 26, y + 20, 8, k === 4 ? pop(u, 1.2 + i * 0.2) : 1); });
    // 오른쪽: 차이 건수
    const n = tween(p === b ? 0 : p.diffKeys.length, b.diffKeys.length, u);
    tx(800, 70, '차이', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
    mono(800, 130, `${Math.round(n)}건`, { 'text-anchor': 'middle', 'font-size': 46, 'font-weight': 800, fill: n >= 0.5 ? BAD : MUT });
    if (k >= 1 && k <= 3) { const why = ['', '서울을 고른다는 게 도쿄', '"B는 더 좋게" 즉흥 판단', '"필요할 것 같아서" 추가'][k];
      tx(800, 170, why, { 'text-anchor': 'middle', 'font-size': 14.5, fill: INK, opacity: fade(u, 1.4) }); }
    // k4: 시간이 갈수록 벌어지는 두 환경
    if (k === 4) { const ax = R.axes(690, 200, 230, 150, { x: [0, 4], y: [0, 4], xl: '시간', yl: '설정 차이' });
      R.line(ax, [[0, 0.2], [4, 0.2]], E(u, 0.3, 2.2), MUT, { sw: 2.5 });
      R.line(ax, [[0, 0.2], [1, 1.1], [2, 1.7], [3, 2.8], [4, 3.6]], E(u, 0.3, 2.2), BAD, { sw: 3 });
      tx(ax.X(4) - 4, ax.Y(0.2) - 8, 'A', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2) });
      tx(ax.X(3.3), ax.Y(3.6), 'B', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2) }); } }

  // =========================================================
  // 3. 누가 뭘 바꿨는지 모른다
  // =========================================================
  const TRAIL = [['eventName', 'AuthorizeSecurityGroupIngress'], ['user', 'intern02'], ['time', '2026-06-12 03:22'], ['fromPort', '3306 · 0.0.0.0/0']];
  const TRY = ['CloudTrail 조회', '슬랙 검색', '인수인계 문서', '관련 티켓'];
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev;
    // 왼쪽 위: 환경 A 의 SG 규칙
    zone(24, 24, 310, 170, '환경 A · 보안 그룹 인바운드', { fill: SOFT });
    cell(40, 62, 278, 38, 'SSH  22   0.0.0.0/0', {});
    const blink = k === 0 ? 0.55 + 0.45 * Math.abs(Math.sin(u * 4)) : 1;
    cell(40, 110, 278, 38, 'MySQL 3306 0.0.0.0/0', { stroke: BAD, fill: C.BADBG, color: BAD, sw: 2.5, op: k === 0 ? Math.min(blink, fade(u, 0.2)) : 1 });
    tx(40, 176, '어제까지 없던 규칙', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: k === 0 ? fade(u, 1) : 1 });
    // 왼쪽 아래: 추적 시도 (data.audit 개수만큼)
    zone(24, 214, 310, 186, '추적 시도', { fill: SOFT });
    const na = (b.audit || []).length, pa = (p && p.audit || []).length;
    TRY.forEach((s, i) => { if (i >= na) return; const y = 256 + i * 36, op = i >= pa ? fade(u, 0.3) : 1;
      tx(70, y + 5, s, { 'font-size': 14.5, 'font-weight': 600, opacity: op });
      if (i === 0) tx(318, y + 5, '이유 없음', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'end', 'font-weight': 700, opacity: op });
      else cross(300, y, 7, i >= pa ? pop(u, 0.6) : 1);
      el('circle', { cx: 50, cy: y, r: 5, fill: i === 0 ? WARN : BAD, opacity: op }); });
    // 오른쪽 위: CloudTrail 기록 (k1 부터)
    if (k >= 1) { zone(360, 24, 576, 160, 'CloudTrail 이벤트', { fill: PANEL, stroke: GRID });
      TRAIL.forEach(([f, v], i) => { const y = 64 + i * 30, op = k === 1 ? fade(u, 0.3 + i * 0.35) : 1;
        mono(380, y, f, { 'font-size': 14, fill: MUT, opacity: op }); mono(500, y, v, { 'font-size': 14, 'font-weight': 700, opacity: op });
        check(900, y - 5, 7, k === 1 ? pop(u, 0.5 + i * 0.35) : 1); }); }
    else { tx(648, 110, 'CloudTrail에 무엇이 남았을까?', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 1.2) }); }
    // 오른쪽 아래: 빈칸들
    const by = 206;
    if (k === 2) { tx(360, by + 16, '판단에 필요한 칸', { 'font-size': 15, 'font-weight': 700 });
      ['변경 이유', '승인자', '연결 티켓', '원복 영향'].forEach((s, i) => { const x = 360 + i * 146, s2 = pop(u, 0.3 + i * 0.35);
        card(x + 66, by + 90, 132, 96, { rx: 10, stroke: BAD, sw: 2, dash: '6 4', s: s2 });
        tx(x + 66, by + 64, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) });
        mono(x + 66, by + 112, '(빈칸)', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: fade(u, 0.6 + i * 0.35) }); }); }
    if (k === 3) { ['SG 바꾼 사람?', '3306 누가 열었어?', 'intern02 보안그룹'].forEach((s, i) => { const y = by + 30 + i * 60, op = fade(u, 0.3 + i * 0.6);
        card(360 + tw(s, 15) / 2 + 30, y, tw(s, 15) + 40, 40, { rx: 18, fill: C.INFOBG, stroke: INFO, sw: 1.8, text: s, fs: 15, op });
        tx(640, y + 5, '응답 없음', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.7 + i * 0.6) }); }); }
    if (k === 4) { const op = 1 - 0.65 * E(u, 0.8, 2);
      person(450, by + 80, 'intern02', { op, stroke: op < 0.6 ? OFF : INK });
      tx(450, by + 168, '2026-06-30 퇴사', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      [['인수인계 문서', 0.6], ['운영 매뉴얼', 1.0]].forEach(([s, a], i) => { const x = 600 + i * 170;
        card(x + 60, by + 80, 120, 120, { rx: 6, fill: SOFT, stroke: GRID, s: pop(u, a) });
        tx(x + 60, by + 160, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
        cross(x + 60, by + 72, 22, pop(u, a + 0.8)); }); }
    if (k === 5) { [['누가', true], ['언제', true], ['무엇을', true], ['왜', false]].forEach(([s, ok], i) => { const x = 420 + i * 136, sc = pop(u, 0.3 + i * 0.35);
        card(x, by + 92, 116, 116, { rx: 14, stroke: ok ? GOOD : BAD, sw: ok ? 2 : 3.5, fill: ok ? C.GOODBG : C.BADBG, s: sc });
        tx(x, by + 76, s, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) });
        (ok ? check : cross)(x, by + 116, 14, sc); });
      tx(648, by + 186, '흔적은 남아도 의도는 사라진다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); } }

  // =========================================================
  // 4. 똑같이 다시 만들 수 없다 — 16종을 손으로 옮기기
  // =========================================================
  const RES = [['EC2', '1'], ['SG', '3'], ['VPC', '1'], ['Subnet', '4'], ['Route Tbl', '2'], ['IGW', '1'], ['NAT', '1'], ['EIP', '2'],
    ['IAM Role', '3'], ['Log Group', '5'], ['S3', '2'], ['RDS', '1+2'], ['ALB', '+TG'], ['Route53', '4'], ['ACM', '1'], ['태그', '∞']];
  const MISS = [3, 6, 9, 12, 15];   // 손으로 옮길 때 빠지는 칸 (그림용 표시)
  function grid16(x, y, fn) { RES.forEach(([n, q], i) => { const cx = x + (i % 4) * 94 + 44, cy = y + Math.floor(i / 4) * 50 + 22, st = fn(i) || {};
      if (st.hide) return; card(cx, cy, 88, 44, { rx: 7, stroke: st.stroke || GRID, fill: st.fill || PANEL, sw: st.sw || 1.5, dash: st.dash, s: st.s, op: st.op });
      if (!st.empty) { tx(cx, cy - 2, n, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: st.color || INK, opacity: st.op ?? 1 });
        mono(cx, cy + 16, q, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: st.op ?? 1 }); } }); }
  function s4(t, c) { const { k, u } = c, xa = 30, xb = 556, gy = 116;
    region(xa - 10, 64, 400, 262, 'ap-northeast-2 · 환경 A', { stroke: BAD });
    region(xb - 10, 64, 400, 262, 'us-east-1 · 복제 대상', {});
    // 타이머
    const FR = [0, 0.2, 0.45, 0.95, 0.97, 1];
    clock(480, 34, 22, tween(k ? FR[k - 1] : 0, FR[k], u), BAD);
    mono(512, 40, k === 0 ? '30:00' : '30분 제한', { 'font-size': 14, 'font-weight': 800, fill: BAD });
    // 왼쪽: 원본 리소스 — k1, k2 에 하나씩 센다
    const counted = k === 0 ? 0 : k === 1 ? Math.floor(lerp(0, 8, E(u, 0.2, 2.2))) : k === 2 ? 8 + Math.floor(lerp(0, 8, E(u, 0.2, 2.2))) : 16;
    grid16(xa, gy, (i) => ({ stroke: i < counted ? BAD : GRID, fill: i < counted ? C.BADBG : PANEL, sw: i < counted ? 2 : 1.5, op: k === 0 ? 0.55 : 1 }));
    mono(xa + 380, 92, `${counted} / 16종`, { 'font-size': 14.5, 'font-weight': 800, fill: counted ? BAD : MUT, 'text-anchor': 'end' });
    // 가운데 화살표
    grow(434, 220, 532, 220, k === 0 ? E(u, 0.4, 1.6) : 1, BAD, { dash: '6 5' });
    tx(483, 206, '손으로', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD });
    // 오른쪽: 복제 결과 (k4 부터 손으로 옮긴 결과)
    if (k >= 4) grid16(xb, gy, (i) => { const at = 0.2 + i * 0.12, s = k === 4 ? pop(u, at) : 1;
      return MISS.includes(i) ? { empty: true, stroke: BAD, dash: '5 4', s, fill: SOFT } : { s }; });
    else grid16(xb, gy, () => ({ empty: true, dash: '4 5', fill: SOFT }));
    if (k >= 4) tx(xb + 190, 50, '빠진 칸이 무엇인지 모른다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: k === 4 ? fade(u, 2) : 1 });
    // 아래: 시간 막대 (k3, k4)
    if (k === 3 || k === 4) { const g = k === 3 ? E(u, 0.3, 1.8) : 1;
      tx(30, 362, '목표', { 'font-size': 15, 'font-weight': 700 }); tx(30, 396, '현실', { 'font-size': 15, 'font-weight': 700, fill: BAD });
      hbar(90, 350, 700, 30, 480, { u: g, col: GOOD, text: '30분', h: 18 }); hbar(90, 384, 700, 480, 480, { u: g, col: BAD, text: '8시간+', h: 18 }); }
    if (k === 5) banner(480, 376, '손으로 만든 인프라는 손으로 복구할 수 없다', pop(u, 0.3)); }

  // =========================================================
  // 5. IaC 로 해결 — 코드가 곧 인프라
  // =========================================================
  const TF = [ // [처음 보이는 beat, 글]
    [0, 'terraform {'], [0, '  required_version = ">= 1.6.0"'], [0, '  aws = { version = "~> 5.0" } }'],
    [1, 'variable "region" {'], [1, '  default = "ap-northeast-2" }'],
    [2, 'variable "instance_type" {'], [2, '  default = "t3.small" }'],
    [3, 'variable "env_name" {}'], [3, 'provider "aws" { region = var.region }'],
    [4, 'resource "aws_security_group" "web" {'], [4, '  name = "${var.env_name}-web-sg"'],
    [5, '  cidr_blocks = ["203.0.113.0/24"]'],
    [6, 'resource "aws_instance" "web" {'], [6, '  instance_type = var.instance_type'], [6, '  vpc_security_group_ids ='], [6, '    [aws_security_group.web.id] }'],
  ];
  function tfPanel(k, u) { el('rect', { x: 20, y: 20, width: 380, height: 380, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(36, 44, 'iac-fix.tf (줄인 모양)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const last = Math.min(k, 6); let y = 72;
    TF.forEach(([at, s]) => { if (at > last) return; const cur = at === k, op = cur ? fade(u, 0.15) : 1;
      if (cur) el('rect', { x: 26, y: y - 15, width: 368, height: 21, rx: 4, fill: ACCBG, opacity: op });
      R.spans(34, y, R.tokens(s), { 'font-size': 13.5, opacity: k >= 7 && !cur ? 0.75 : op }); y += 21; }); }
  // 오른쪽 그래프 마디
  const NODE = { region: [540, 70, 'var.region'], env: [540, 160, 'var.env_name'], type: [540, 250, 'var.instance_type'],
    prov: [800, 70, 'provider aws'], sg: [800, 160, 'aws_security_group.web'], ec2: [800, 300, 'aws_instance.web'] };
  function node(id, s, o) { o = o || {}; const [x, y, n] = NODE[id], w = tw(n, 14) + 30;
    card(x, y, w, 40, { rx: id.length > 4 || id === 'sg' || id === 'ec2' || id === 'prov' ? 8 : 20, text: n, fs: 14, mono: true, s, stroke: o.hot ? ACC : id === 'sg' || id === 'ec2' ? INK : MUT, fill: o.hot ? ACCBG : PANEL, sw: o.hot ? 2.5 : 2 }); }
  function edge(a, b, u, col) { const [x1, y1] = NODE[a], [x2, y2] = NODE[b], w1 = tw(NODE[a][2], 14) / 2 + 15, w2 = tw(NODE[b][2], 14) / 2 + 15;
    const horiz = Math.abs(y1 - y2) < 60; if (horiz) grow(x1 + w1, y1, x2 - w2, y2, u, col || ACC); else grow(x1 + (x1 === x2 ? 0 : w1), y1 + (x1 === x2 ? 20 : 0), x2 - (x1 === x2 ? 0 : w2), y2 - 20, u, col || ACC); }
  function s5(t, c) { const { k, u } = c;
    tfPanel(k, u);
    if (k === 0) { [['Terraform 본체', '>= 1.6.0', 150], ['hashicorp/aws', '~> 5.0', 260]].forEach(([a, v, y], i) => { const s = pop(u, 0.3 + i * 0.5);
        card(670, y, 330, 76, { rx: 12, stroke: ACC, sw: 2.2, s }); R.lock(540, y, true, ACC, s);
        tx(580, y - 6, a, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) }); mono(580, y + 20, v, { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.5) }); });
      tx(670, 360, '누가 돌려도 같은 버전으로 실행된다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k <= 6) { const sh = (at) => (k === at ? pop(u, 0.3) : k > at ? 1 : 0);
      if (k >= 1) node('region', sh(1), { hot: k === 1 }); if (k >= 2) node('type', sh(2), { hot: k === 2 });
      if (k >= 3) { node('env', sh(3), { hot: k === 3 }); node('prov', sh(3), { hot: k === 3 }); edge('region', 'prov', k === 3 ? E(u, 0.8, 1.6) : 1, k === 3 ? ACC : MUT); }
      if (k >= 4) { node('sg', sh(4), { hot: k === 4 || k === 5 }); edge('env', 'sg', k === 4 ? E(u, 0.8, 1.6) : 1, k === 4 ? ACC : MUT); }
      if (k === 5) { const y = 218; card(800, y + 18, 240, 64, { rx: 8, stroke: GOOD, sw: 2, fill: C.GOODBG, s: pop(u, 0.3) });
        mono(700, y + 10, '22/tcp ← 0.0.0.0/0', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.4), 'text-decoration': 'line-through' });
        mono(700, y + 36, '22/tcp ← 203.0.113.0/24', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.1) }); }
      if (k >= 6) { node('ec2', sh(6), { hot: true }); edge('type', 'ec2', E(u, 0.8, 1.6)); edge('sg', 'ec2', E(u, 1.2, 2.0));
        sub(800, 360, '참조가 곧 순서: SG를 먼저, 인스턴스를 나중에', fade(u, 2), { 'font-size': 14, fill: INK, 'font-weight': 600 }); }
      if (k >= 1 && k <= 3) sub(540, 330, ['', '드롭다운 대신 기본값이 적힌 변수', '즉흥 대신 기본값 t3.small', '환경 차이는 변수 값 한 곳'][k], fade(u, 1), { 'font-size': 14.5, fill: INK, 'font-weight': 600 });
      return; }
    if (k === 7) { // 같은 코드 + workspace 둘 → 같은 모양 두 벌
      [['prod', 470], ['staging', 710]].forEach(([env, x], i) => { const s = pop(u, 0.9 + i * 0.4);
        R.dot([[400, 210], [x + 100, 120]], seg(u, 0.2 + i * 0.3, 1.0 + i * 0.3), ACC, 7);
        zone(x, 60, 210, 300, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
        mono(x + 16, 86, `workspace ${env}`, { 'font-size': 14, 'font-weight': 700, fill: ACC });
        card(x + 105, 140, 180, 40, { rx: 8, text: `${env}-web-sg`, fs: 14, mono: true, s });
        card(x + 105, 210, 180, 40, { rx: 8, text: `${env}-web`, fs: 14, mono: true, s });
        grow(x + 105, 162, x + 105, 188, s, MUT);
        card(x + 105, 300, 180, 56, { rx: 6, fill: SOFT, stroke: GRID, s }); mono(x + 105, 296, 'state', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: s });
        mono(x + 105, 316, env, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); });
      tx(680, 392, 'state는 환경마다 따로, 모양은 같다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2) }); return; }
    // k8: 네 함정 → 해결
    [['환경 차이', 'variables'], ['변경 추적', 'git log · PR'], ['안전', 'terraform plan'], ['재현·복구', 'terraform apply']].forEach(([a, b], i) => { const y = 80 + i * 78, s = pop(u, 0.2 + i * 0.4);
      card(530, y, 190, 54, { rx: 10, stroke: BAD, sw: 2, fill: C.BADBG, text: a, fs: 16, fw: 700, s });
      grow(630, y, 700, y, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), GOOD);
      card(810, y, 210, 54, { rx: 10, stroke: GOOD, sw: 2, fill: C.GOODBG, text: b, fs: 15, fw: 700, mono: true, s: pop(u, 0.8 + i * 0.4) }); }); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: '콘솔 클릭으로 EC2를 만든 뒤에도 남지 않는 것은 무엇인가?',
      o: ['작업자와 작업 시각', '같은 환경을 다시 만들 명세와 값을 고른 이유', '인스턴스 ID와 Public IP'], a: 1,
      why: '결과물과 로그인 기록은 남지만 t3.small을 왜 골랐는지, SSH를 왜 전체 공개했는지는 머릿속에만 있다.' },
    { q: '한 달 뒤 만든 환경 B가 A와 세 칸이나 달라진 원인은 무엇인가?',
      o: ['AWS가 리전마다 기본값을 바꿔서', '스테이징은 원래 운영과 달라야 해서', '기억에 기대 다시 클릭하며 실수와 즉흥 판단이 섞여서'], a: 2,
      why: 'region은 실수, t3.medium은 즉흥 판단, HTTP 80은 "필요할 것 같아서"였다. 무엇이 의도인지 구분할 기록이 없다.' },
    { q: 'CloudTrail에서 3306 포트 변경을 찾고도 끝내 알 수 없는 것은 무엇인가?',
      o: ['왜 열었고 누가 승인했는지', '변경한 IAM 사용자', '변경한 시각'], a: 0,
      why: 'CloudTrail은 intern02가 03:22에 3306을 열었다는 사실까지만 남긴다. 이유와 승인, 티켓은 비어 있다.' },
    { q: '장애 때 환경 A를 us-east-1에 손으로 복제할 때 가장 큰 문제는 무엇인가?',
      o: ['us-east-1에서는 EC2를 만들 수 없다', '리소스 16종을 기억과 클릭으로 옮겨야 해 빠뜨려도 알 수 없다', '복제는 30분이면 충분하다'], a: 1,
      why: '체크리스트도 명세도 없으니 30분 목표는 8시간 넘게 늘고, 빠진 칸이 무엇인지 확인할 방법도 없다.' },
    { q: 'iac-fix.tf가 "비슷한데 다른" 환경 문제를 막는 방법은 무엇인가?',
      o: ['콘솔 로그인 권한을 모두 막는다', '같은 코드에 env_name 같은 변수 값만 달리 준다', 'region을 하나로 고정해 둔다'], a: 1,
      why: '모양은 코드 하나가 정하고 환경 차이는 변수 값으로만 드러난다. 그 변경은 git 이력과 PR 리뷰에 남는다.' },
  ];

  const summary = [
    '콘솔 클릭은 5분이면 끝나지만 무엇을 왜 골랐는지는 머릿속에만 남는다.',
    '기억으로 환경 B를 다시 만들자 region, type, sg 세 칸이 A와 달라졌다.',
    'CloudTrail은 누가 언제 3306을 열었는지만 남기고 이유와 승인은 남기지 않는다.',
    '코드에 변수와 description을 적고 환경마다 state를 나누면 같은 모양을 다시 만들 수 있다.',
  ];
  const review = [
    { q: '스테이징에서 되던 기능이 운영에서 실패했다. 두 환경 모두 콘솔에서 만들었다. 먼저 의심할 것은?',
      o: ['클릭 차이로 두 환경의 설정이 어긋났을 가능성', '애플리케이션 코드의 문법 오류', 'AWS 리전 전체 장애'], a: 0,
      why: '손으로 두 번 만든 환경은 region, type, sg처럼 작은 차이가 쌓인다. 설정을 나란히 비교하는 것이 먼저다.' },
    { q: 'Terraform으로 옮긴 뒤 누군가 SSH를 다시 0.0.0.0/0으로 열려고 한다. 이 변경은 어디서 걸러지는가?',
      o: ['퇴사자 인수인계 문서', '.tf를 고친 PR의 코드 리뷰와 plan', 'CloudTrail 사후 조회'], a: 1,
      why: 'cidr_blocks가 코드에 적혀 있으니 바꾸려면 PR이 필요하고, 리뷰어는 plan에서 규칙 변경을 먼저 본다.' },
    { q: '장애로 환경 A를 다른 region에 다시 만들어야 한다. 코드로 관리했다면 무엇을 하는가?',
      o: ['16종 리소스를 콘솔에서 하나씩 캡처한다', '체크리스트부터 새로 만든다', 'region 값만 바꾼 별도 state에서 apply를 돌린다'], a: 2,
      why: '모양은 이미 코드에 있으니 region 변수와 state만 새로 정하면 된다. 손으로 옮길 칸이 없다.' },
  ];

  R.page({ title: '클릭 운영에서 코드로', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
