/* II-1-2 resource — 리소스 선언 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 생성 순서(물결)·destroy 역순·depends_on 전후 비교는 참조로 생긴 간선을 위상 정렬하는 파이썬 재현으로 맞췄다.
 * aws_instance 의 ami·instance_type 이 (Optional, launch_template 이 없으면 필요) 인 것과 aws_ami 의 most_recent 규칙은 AWS provider 문서로 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, snippet, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 그래프 노드: 리소스 주소 (data 는 점선)
  function node(cx, cy, s, o) { o = o || {}; const fs = o.fs || 14, w = tw(s, fs) + 28, sc = o.s ?? 1; if (sc <= 0) return { w };
    card(cx, cy, w, 36, { rx: 8, text: s, fs, mono: true, fw: 700, stroke: o.col || INK, color: o.col || INK, fill: o.fill || PANEL, dash: o.dash, s: sc, op: o.op, sw: o.sw || 2 }); return { w }; }
  function cloudZone(x, y, w, h, title, o) { o = o || {}; const op = o.op ?? 1; if (op <= 0) return;
    el('rect', { x, y, width: w, height: h, rx: 16, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: op });
    tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INFO, opacity: op }); }
  function bucket(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INK;
    el('path', { d: 'M-17,-12 L-12,16 H12 L17,-12', fill: PANEL, stroke: c, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: 0, cy: -12, rx: 17, ry: 5, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); }
  // 터미널 한 줄짜리 상태 파일
  function stateDoc(x, y, w, rows, o) { o = o || {}; const h = 40 + rows.length * 26;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: o.op ?? 1 });
    mono(x + 12, y + 22, 'terraform.tfstate', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    rows.forEach(([s, op], i) => mono(x + 14, y + 48 + i * 26, s, { 'font-size': 13.5, fill: INK, opacity: (op ?? 1) * (o.op ?? 1) })); }
  // 시간 막대 (일정표)
  function bar(x, y, w, s, col, u) { const ww = w * clamp(u ?? 1); if (ww <= 0) return;
    el('rect', { x, y, width: ww, height: 26, rx: 5, fill: col || ACC, opacity: 0.85 });
    if (u >= 1 && s) mono(x + 8, y + 18, s, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL }); }

  // ---------- 1. 블록 문법 ----------
  const HEAD = [['resource', INK, '키워드', 120], ['"aws_s3_bucket"', ACC, '타입: provider 가 정한다', 330], ['"mine"', INFO, '로컬이름: 내가 정한다', 560]];
  function header(u, k, y) { y = y || 80;
    HEAD.forEach(([s, col, lab, x], i) => { const a = k === 0 ? pop(u, 0.2 + i * 0.45) : 1;
      card(x, y, tw(s, 17) + 28, 44, { rx: 8, text: s, fs: 17, mono: true, fw: 800, stroke: col, color: col, s: a });
      if (k <= 1) sub(x, y + 44, lab, k === 0 ? fade(u, 0.5 + i * 0.45) : 1, { fill: col, 'font-weight': 700, 'font-size': 14 }); });
    mono(660, y + 7, '{', { 'font-size': 20, 'font-weight': 800 }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { header(u, k);
      const bodyA = k === 0 ? 0 : k === 1 ? seg(u, 0.3, 1.1) : 1;
      el('rect', { x: 120, y: 160, width: 520 * bodyA, height: 44, rx: 8, fill: WARNBG });
      if (bodyA > 0) mono(140, 189, 'bucket = "my-team-logs-2026"', { 'font-size': 17, 'font-weight': 700, fill: WARN, opacity: k === 1 ? fade(u, 0.8) : 1 });
      if (k === 0) sub(380, 189, '(속성이 아직 없다)', fade(u, 1.8), { 'font-size': 15 });
      mono(120, 238, '}', { 'font-size': 20, 'font-weight': 800 });
      if (k === 1) sub(380, 236, '속성 = 실제 클라우드로 보낼 값', fade(u, 1.4), { fill: WARN, 'font-weight': 700, 'font-size': 15 });
      if (k === 2) { cloudZone(700, 140, 240, 250, 'AWS');
        grow(330, 104, 800, 200, E(u, 0.2, 0.9), ACC); pill(800, 214, 'S3 버킷 API', ACC, pop(u, 0.9), { fs: 13.5 });
        grow(420, 184, 690, 300, E(u, 0.9, 1.6), WARN); bucket(820, 300, pop(u, 1.6), WARN); mono(820, 344, 'my-team-logs-2026', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.7) });
        grow(560, 104, 640, 300, E(u, 1.6, 2.1), INFO, { plain: true }); if (u > 2.1) cross(650, 312, 12, pop(u, 2.1));
        sub(520, 370, '"mine" 은 클라우드에 가지 않는다', fade(u, 2.2), { fill: INFO, 'font-weight': 700, 'font-size': 14.5 }); }
      return; }
    if (k === 3) { // apply 네 단계
      const st = [['① 블록 읽기', 110], ['② API 호출', 360], ['③ 응답', 610], ['④ state 기록', 850]];
      st.forEach(([s, x], i) => lbl(x, 40, s, fade(u, 0.1 + i * 0.5), { fill: i === 3 ? GOOD : INK }));
      snippet(20, 70, ['resource "aws_s3_bucket" "mine" {', '  bucket = "my-team-logs-2026"', '}'], { fs: 13.5, w: 300 });
      card(360, 110, 150, 50, { rx: 10, text: 'aws provider', fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.5) });
      cloudZone(530, 70, 200, 100, 'AWS', { op: fade(u, 0.8) });
      dot([[320, 110], [285, 110], [436, 110], [540, 120]], seg(u, 0.3, 1.2), ACC, 7);
      mono(360, 160, 'PUT /my-team-logs-2026', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9) });
      bucket(630, 130, pop(u, 1.2), GOOD);
      dot([[620, 160], [850, 220]], seg(u, 1.4, 2.0), GOOD, 7);
      stateDoc(640, 230, 300, [['aws_s3_bucket.mine', fade(u, 2.0)], ['  id = "my-team-logs-2026"', fade(u, 2.2)]]);
      note(40, 300, 'state 까지 적어야 다음 plan 이', fade(u, 2.2), { 'font-size': 15 }); note(40, 326, '"이미 있다" 를 안다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 4) { // 블록 3개 = 버킷 3개
      const B = [['logs', 'team-logs'], ['backup', 'team-backup'], ['static', 'team-static']];
      cloudZone(560, 50, 380, 320, 'AWS');
      B.forEach(([n, b], i) => { const y = 100 + i * 100;
        mono(30, y + 5, `resource "aws_s3_bucket" "${n}"`, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.1 + i * 0.2) });
        mono(60, y + 30, `{ bucket = "${b}" }`, { 'font-size': 14, fill: WARN, opacity: fade(u, 0.2 + i * 0.2) });
        grow(400, y + 10, 640, y + 10, E(u, 1.0, 1.6), ACC); bucket(700, y + 10, pop(u, 1.6), GOOD); mono(740, y + 16, b, { 'font-size': 14, opacity: fade(u, 1.7) }); });
      sub(750, 396, '서로 참조가 없으니 세 개가 동시에 만들어진다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    // k5 로컬이름 중복
    mono(40, 80, 'resource "aws_s3_bucket" "logs" { … }', { 'font-size': 15, 'font-weight': 700 });
    mono(40, 130, 'resource "aws_s3_bucket" "logs" { … }', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
    el('rect', { x: 30, y: 108, width: 400, height: 32, rx: 6, fill: BAD, opacity: 0.12 * fade(u, 0.3) });
    card(690, 105, 470, 56, { rx: 10, text: 'Error: Duplicate resource "aws_s3_bucket"\nconfiguration  (예시)', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.9) });
    mono(40, 250, 'resource "aws_s3_bucket" "logs" { … }', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
    mono(40, 300, 'resource "aws_iam_role"  "logs" { … }', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) });
    check(470, 296, 12, pop(u, 2.0));
    note(520, 276, '타입이 다르면 같은 이름도 된다', fade(u, 2.1), { fill: GOOD });
    sub(480, 390, '주소 = 타입.로컬이름 이라 둘이 겹치면 가리킬 대상이 하나로 정해지지 않는다', fade(u, 2.3), { fill: INK, 'font-size': 14 }); }

  // ---------- 2. 속성 세 종류 ----------
  const BINS = [['꼭 적는 값', ACC, 140], ['optional (기본값 있음)', INFO, 470], ['computed (apply 뒤 채움)', GOOD, 800]];
  function bins(op) { BINS.forEach(([s, col, x]) => { el('rect', { x: x - 150, y: 210, width: 300, height: 180, rx: 12, fill: SOFT, stroke: col, 'stroke-width': 2, opacity: op });
    tx(x, 236, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: op }); }); }
  function chip(x, y, s, col, o) { o = o || {}; const fs = 14.5, w = tw(s, fs) + 22; card(x, y, w, 34, { rx: 7, text: s, fs, mono: true, stroke: col, color: col, s: o.s, op: o.op, fill: o.fill }); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { mono(40, 40, 'resource "aws_instance" "web" {', { 'font-size': 15, 'font-weight': 700 });
      bins(1);
      const inBin1 = [['ami = "ami-0c2d3e23e…"', 280], ['instance_type = "t3.micro"', 330]];
      inBin1.forEach(([s, y], i) => { const a = k === 0 ? seg(u, 0.3 + i * 0.5, 1.0 + i * 0.5) : 1; if (a <= 0) return;
        chip(lerp(260, 140, E(a, 0, 1)), lerp(80 + i * 40, y, E(a, 0, 1)), s, ACC, { fill: PANEL }); });
      if (k === 0) sub(140, 404, 'launch_template 이 없으면 필요', fade(u, 1.8), { fill: ACC, 'font-weight': 700, 'font-size': 14 });
      if (k >= 1) { const a = k === 1 ? seg(u, 0.3, 1.0) : 1;
        if (k === 1) { mono(400, 80, 'monitoring', { 'font-size': 14.5, 'font-weight': 700 }); mono(520, 80, 'false', { 'font-size': 14.5, fill: MUT, 'text-decoration': 'line-through', opacity: fade(u, 0.2) });
          mono(580, 80, '→ true', { 'font-size': 14.5, fill: INFO, 'font-weight': 800, opacity: fade(u, 0.6) }); sub(560, 110, '기본값을 바꾸고 싶을 때만 적는다', fade(u, 1.0)); }
        if (a > 0) { chip(470, 280, 'monitoring = true', INFO, { s: a }); chip(470, 330, 'tags = { Name, Environment }', INFO, { s: k === 1 ? pop(u, 1.4) : 1 }); } }
      if (k === 2) { chip(690, 280, 'id', GOOD, { s: pop(u, 0.2) }); chip(690, 330, 'arn', GOOD, { s: pop(u, 0.4) });
        const f = u > 1.6; mono(722, 286, f ? '= "i-0abc…"' : '(known after apply)', { 'font-size': 13.5, fill: f ? GOOD : MUT, opacity: fade(u, 0.6) });
        mono(728, 336, f ? '= "arn:aws:ec2:…"' : '', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.6) });
        cloudZone(640, 40, 300, 110, 'AWS'); grow(700, 150, 790, 262, E(u, 1.0, 1.6), GOOD);
        mono(660, 100, 'apply 뒤 응답으로 채워진다', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.9) });
        sub(470, 190, 'aws_instance.web.id 로 읽기만 한다. 코드에 적으면 오류', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); }
      return; }
    if (k === 3) { // required 누락
      snippet(30, 50, ['resource "aws_iam_role" "broken" {', '  name = "web-role"', '  # assume_role_policy 없음', '}'], { fs: 14.5, w: 380 });
      el('rect', { x: 36, y: 116, width: 368, height: 24, rx: 4, fill: BAD, opacity: 0.15 * fade(u, 0.3) });
      card(560, 110, 140, 60, { rx: 10, text: 'plan', fs: 17, mono: true, stroke: INK, s: pop(u, 0.4) });
      dot([[410, 100], [490, 110]], seg(u, 0.5, 1.0), INK, 7);
      card(560, 230, 460, 70, { rx: 10, text: 'Error: Missing required argument\n"assume_role_policy" is required', fs: 14, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.1) });
      cloudZone(700, 300, 240, 100, 'AWS', { op: fade(u, 1.5) });
      grow(630, 140, 800, 300, E(u, 1.5, 2.0), OFF, { dash: '5 5', plain: true });
      if (u > 2.0) cross(780, 270, 12, pop(u, 2.0));
      sub(230, 330, 'API 를 한 번도 부르지 않고 멈춘다', fade(u, 2.2), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    // k4 문서 판별
    el('rect', { x: 40, y: 40, width: 880, height: 340, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    mono(60, 68, 'registry.terraform.io / aws / aws_instance', { 'font-size': 13.5, fill: MUT });
    tx(60, 110, 'Argument Reference', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
    [['ami', '(Optional) launch_template 이 없으면 필요', ACC], ['instance_type', '(Optional) launch_template 이 없으면 필요', ACC], ['monitoring', '(Optional) 기본 false', INFO]].forEach(([a, b, col], i) => { const y = 148 + i * 36, op = fade(u, 0.4 + i * 0.3);
      mono(70, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op }); tx(220, y, b, { 'font-size': 14.5, opacity: op }); });
    mono(70, 256, 'assume_role_policy', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); tx(250, 256, '(Required)  aws_iam_role 문서', { 'font-size': 14.5, opacity: fade(u, 1.4) });
    el('line', { x1: 600, y1: 90, x2: 600, y2: 360, stroke: GRID, 'stroke-width': 1.5 });
    tx(630, 110, 'Attributes Reference', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.7) });
    ['id', 'arn', 'public_ip'].forEach((a, i) => mono(640, 148 + i * 36, a, { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9 + i * 0.15) }));
    sub(480, 404, '조건이 붙은 (Optional) 은 그 조건까지 읽는다', fade(u, 2.3), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 3. resource address ----------
  const NB = [260, 120], NV = [700, 120];
  function s3(t, c) { const { k, u } = c;
    if (k <= 4) {
      node(NB[0], NB[1], 'aws_s3_bucket.mine', { s: k === 0 ? pop(u, 0.2) : 1 });
      if (k === 0) { bucket(NB[0], 230, pop(u, 0.8), GOOD); mono(NB[0], 276, 'my-team-logs-2026', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        sub(NB[0], 330, '참조당할 쪽이 먼저 있어야 한다', fade(u, 1.5), { fill: INK, 'font-size': 14.5 }); return; }
      const vs = k === 1 ? pop(u, 1.6) : 1;
      node(NV[0], NV[1], 'aws_s3_bucket_versioning.mine_versioning', { s: vs, fs: 13.5 });
      grow(NB[0] + 100, NB[1], NV[0] - 170, NV[1], k === 1 ? E(u, 1.9, 2.4) : 1, ACC);
      if (k === 1) { const parts = [['aws_s3_bucket', ACC, '타입'], ['.mine', INFO, '로컬이름'], ['.id', WARN, '속성']]; let x = 220;
        parts.forEach(([s, col, l], i) => { const w = tw(s, 18) + 18, a = pop(u, 0.2 + i * 0.35);
          card(x + w / 2, 260, w, 46, { rx: 8, text: s, fs: 18, mono: true, fw: 800, stroke: col, color: col, s: a }); sub(x + w / 2, 306, l, fade(u, 0.4 + i * 0.35), { fill: col, 'font-weight': 700, 'font-size': 14 }); x += w + 8; });
        mono(520, 266, '← bucket = 이 한 줄', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
      if (k === 2) { snippet(440, 170, ['  bucket = aws_s3_bucket.mine.id', '  versioning_configuration {', '    status = "Enabled"', '  }'], { fs: 14 });
        el('rect', { x: 446, y: 204, width: 300, height: 66, rx: 4, fill: INFO, opacity: 0.14 * fade(u, 0.5) });
        sub(610, 330, '= 로 주는 속성 · 중괄호로 여는 중첩 블록', fade(u, 1.2), { fill: INK, 'font-size': 14.5 }); return; }
      if (k === 3) { const x0 = 300, w = 150;
        tx(70, 226, 'apply', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) }); tx(70, 316, 'destroy', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
        bar(x0, 206, w, 'bucket', ACC, seg(u, 0.2, 0.7)); bar(x0 + w + 10, 206, w, 'versioning', ACC, seg(u, 0.7, 1.2));
        bar(x0, 296, w, 'versioning', BAD, seg(u, 1.3, 1.8)); bar(x0 + w + 10, 296, w, 'bucket', BAD, seg(u, 1.8, 2.3));
        grow(x0, 260, x0 + 2 * w + 40, 260, E(u, 0.1, 0.6), MUT); mono(x0 + 2 * w + 50, 266, '시간', { 'font-size': 13.5, fill: MUT });
        sub(640, 390, '참조 한 줄에서 순서가 저절로 정해진다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
      // k4 읽을 수 있는 속성
      [['.id', '식별자'], ['.arn', 'Amazon Resource Name'], ['.bucket', '입력한 이름 그대로'], ['.region', '만들어진 리전']].forEach(([a, b], i) => { const y = 200 + i * 44, s = pop(u, 0.2 + i * 0.3);
        card(150, y, 110, 34, { rx: 7, text: a, fs: 15, mono: true, stroke: WARN, color: WARN, s }); tx(220, y + 5, b, { 'font-size': 15, opacity: fade(u, 0.3 + i * 0.3) });
        grow(NB[0] - 30, NB[1] + 18, 150, y - 18, i === 0 ? E(u, 0.1, 0.4) : 0, MUT, { plain: true }); });
      sub(660, 300, '목록은 provider 문서의 Attributes Reference', fade(u, 1.8), { fill: INK, 'font-size': 14.5 }); return; }
    // k5 이름 충돌
    node(240, 110, 'aws_s3_bucket "mine" { bucket = "a" }', { s: 1, fs: 13.5 });
    node(240, 180, 'aws_s3_bucket "mine" { bucket = "b" }', { s: pop(u, 0.3), fs: 13.5, col: BAD });
    card(720, 145, 220, 44, { rx: 8, text: 'aws_s3_bucket.mine', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.8) });
    grow(608, 135, 420, 112, E(u, 1.1, 1.6), WARN); grow(608, 155, 420, 180, E(u, 1.1, 1.6), WARN);
    tx(560, 150, '?', { 'font-size': 34, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
    sub(480, 300, '가리킬 대상이 둘이면 주소가 성립하지 않는다', fade(u, 2.0), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); }

  // ---------- 4. data source ----------
  const CZ = { x: 600, y: 50, w: 340, h: 330 };
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { cloudZone(CZ.x, CZ.y, CZ.w, CZ.h, 'AWS (이미 있는 것)');
      if (k === 0) { node(250, 130, 'data.aws_vpc.default', { col: INFO, dash: '6 4', s: pop(u, 0.2) });
        mono(150, 180, 'default = true', { 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.4) }); sub(250, 210, '만들 값이 아니라 찾을 조건', fade(u, 0.6));
        card(770, 140, 240, 60, { rx: 10, text: 'vpc-0a1b2c3d (default)', fs: 14, mono: true, stroke: INK, dash: '6 4' });
        grow(370, 130, 640, 140, E(u, 0.8, 1.4), INFO, { dash: '6 5' }); pill(500, 104, 'GET', INFO, pop(u, 1.0), { mono: true });
        mono(250, 300, 'resource', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); mono(250, 324, '만들고 · 고치고 · 지운다', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) });
        mono(450, 300, 'data', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.9) }); mono(450, 324, '읽기만', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.9) });
        return; }
      // AMI 목록 (예시 이름)
      const L = [['al2023-ami-… -x86_64', 'amazon', 1, true], ['al2023-ami-… -arm64', 'amazon', 2, false], ['al2023-ami-… -x86_64 (이전)', 'amazon', 3, true], ['내가 만든 이미지', 'self', 4, false]];
      mono(616, 100, '이미지 (새것 → 옛것, 예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      L.forEach(([n, own, r, x86], i) => { const y = 136 + i * 56, drop = own !== 'amazon' || (k === 2 && !x86), pick = (k === 1 && i === 0) || (k === 2 && i === 0);
        const op = drop ? (k === 1 ? 1 - 0.7 * fade(u, 0.6) : k === 2 && own !== 'amazon' ? 0.3 : 1 - 0.7 * fade(u, 0.6)) : 1;
        card(770, y, 300, 44, { rx: 8, text: n, fs: 13.5, mono: true, stroke: pick && u > 1.6 ? GOOD : GRID, sw: pick && u > 1.6 ? 3 : 1.5, op, fill: pick && u > 1.6 ? GOODBG : PANEL }); });
      node(250, 110, 'data.aws_ami.amazon_linux_2023', { col: INFO, dash: '6 4', fs: 13.5 });
      const conds = k === 1 ? ['most_recent = true', 'owners = ["amazon"]'] : ['most_recent = true', 'owners = ["amazon"]', 'name = "al2023-ami-*-x86_64"'];
      conds.forEach((s, i) => mono(90, 170 + i * 34, s, { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: (k === 1 || i === 2) ? fade(u, 0.2 + i * 0.3) : 1 }));
      grow(400, 110, 610, 140, E(u, 1.2, 1.6), INFO, { dash: '6 5' });
      sub(270, 340, k === 1 ? '여러 건이면 가장 최신 것 하나를 고른다' : '0건이면 plan 에서 오류', fade(u, 1.8), { fill: INK, 'font-size': 14.5, 'font-weight': 700 }); return; }
    if (k === 6) { node(480, 150, 'data.aws_caller_identity.current', { col: INFO, dash: '6 4', s: pop(u, 0.2) });
      mono(480, 210, '.account_id → "123456789012"', { 'font-size': 15, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 0.8) });
      [['다른 팀이 만든 VPC · IAM', 160], ['자주 바뀌는 최신 AMI', 480], ['계정 · 리전 같은 메타 정보', 800]].forEach(([s, x], i) => pill(x, 320, s, INFO, pop(u, 1.2 + i * 0.3), { fs: 14 }));
      sub(480, 390, '내 코드 밖의 값을 읽어 오는 창구', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    // k3~5 그래프
    const G = { vpc: [170, 90], ami: [170, 300], sg: [520, 90], web: [760, 220] };
    const dn = (key, s, o) => node(G[key][0], G[key][1], s, o);
    const gone = k === 5;
    dn('vpc', 'data.aws_vpc.default', { col: INFO, dash: '6 4', fs: 13.5 });
    dn('ami', 'data.aws_ami.amazon_linux_2023', { col: INFO, dash: '6 4', fs: 13.5, s: k >= 4 ? (k === 4 ? pop(u, 0.2) : 1) : 0 });
    dn('sg', 'aws_security_group.web_sg', { s: k === 3 ? pop(u, 0.2) : 1, fs: 13.5, op: gone ? 1 - 0.6 * fade(u, 1.0) : 1 });
    grow(270, 90, 412, 90, k === 3 ? E(u, 0.6, 1.2) : 1, ACC);
    if (k === 3) { mono(520, 140, 'vpc_id = data.aws_vpc.default.id', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      sub(480, 300, 'data 를 참조해도 간선이 생긴다: 조회가 먼저, 생성이 나중', fade(u, 1.6), { fill: INK, 'font-size': 14.5 }); }
    if (k >= 4) { dn('web', 'aws_instance.web', { s: k === 4 ? pop(u, 0.6) : 1, op: gone ? 1 - 0.6 * fade(u, 0.6) : 1 });
      grow(340, 290, 690, 230, k === 4 ? E(u, 0.9, 1.4) : 1, ACC); grow(600, 110, 720, 200, k === 4 ? E(u, 0.9, 1.4) : 1, ACC); }
    if (k === 4) { [['1', 170, '조회 2개 (동시)'], ['2', 520, 'sg'], ['3', 760, 'web']].forEach(([n, x, l], i) => { const a = pop(u, 1.5 + i * 0.3);
        card(x, 380, 150, 34, { rx: 17, text: n + '번째: ' + l, fs: 13.5, fill: ACCBG, stroke: ACC, color: ACC, s: a }); }); }
    if (k === 5) { mono(480, 36, '$ terraform destroy', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      cross(760, 220, 18, pop(u, 0.6)); cross(520, 90, 18, pop(u, 1.0));
      [G.vpc, G.ami].forEach(([x, y], i) => check(x + 140, y, 11, pop(u, 1.5 + i * 0.2)));
      sub(480, 380, '조회한 VPC · AMI 는 그대로 남는다. 남의 것은 건드리지 않는다', fade(u, 1.8), { fill: INK, 'font-size': 14.5, 'font-weight': 700 }); } }

  // ---------- 5. depends_on ----------
  const D = { role: [150, 110], att: [520, 60], lam: [520, 170] };
  function lambdaGraph(k, u) {
    node(D.role[0], D.role[1], 'aws_iam_role.lambda', { s: k === 0 ? pop(u, 0.2) : 1 });
    if (k >= 1) { node(D.att[0], D.att[1], 'aws_iam_role_policy_attachment.lambda', { s: k === 1 ? pop(u, 0.2) : 1, fs: 13.5 });
      grow(240, 100, 340, 66, k === 1 ? E(u, 0.6, 1.2) : 1, ACC); if (k === 1) mono(270, 50, 'role.name', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.0) }); }
    if (k >= 2) { node(D.lam[0], D.lam[1], 'aws_lambda_function.worker', { s: k === 2 ? pop(u, 0.2) : 1, fs: 13.5 });
      grow(240, 120, 410, 166, k === 2 ? E(u, 0.6, 1.2) : 1, ACC); if (k === 2) mono(270, 176, 'role.arn', { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.0) }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { lambdaGraph(k, u); mono(60, 170, 'assume_role_policy = data…assume.json', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.8) });
      sub(480, 300, 'Role 과 정책은 서로 다른 리소스다. 붙이는 일이 한 번 더 필요하다', fade(u, 1.4), { fill: INK, 'font-size': 14.5 }); return; }
    if (k <= 4) { lambdaGraph(Math.min(k, 3), u);
      const dep = k === 4; if (dep) { grow(520, 80, 520, 150, E(u, 0.3, 0.9), GOOD, { dash: '6 4' }); mono(540, 120, 'depends_on', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) }); }
      if (k >= 2) { // 일정표
        const x0 = 260, y0 = 250; tx(40, y0 + 18, 'Role', { 'font-size': 14.5, 'font-weight': 700 }); tx(40, y0 + 56, 'attach', { 'font-size': 14.5, 'font-weight': 700 }); tx(40, y0 + 94, 'Lambda', { 'font-size': 14.5, 'font-weight': 700 });
        const a = k === 2 ? seg(u, 0.4, 2.2) : 1;
        bar(x0, y0, 140, '', INK, a * 3); bar(x0 + 150, y0 + 38, 260, '', ACC, a * 3 - 1);
        bar(dep ? x0 + 420 : x0 + 150, y0 + 76, 110, '', dep ? GOOD : BAD, a * 3 - 1.4);
        el('line', { x1: x0, y1: y0 + 120, x2: x0 + 600, y2: y0 + 120, stroke: MUT, 'stroke-width': 1.5 }); mono(x0 + 610, y0 + 125, '시간', { 'font-size': 13.5, fill: MUT });
        if (k === 2) sub(640, 230, '참조만 보면 attach 와 Lambda 는 동시에 시작해도 된다', fade(u, 1.8), { fill: INK, 'font-size': 14 });
        if (k === 3) { const ix = x0 + 270; grow(ix, y0 + 130, ix, y0 + 104, E(u, 0.5, 0.9), BAD); mono(ix, y0 + 152, '첫 호출', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 0.6) });
          card(780, 120, 230, 50, { rx: 10, text: 'AccessDenied', fs: 16, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.1) });
          sub(780, 170, '권한이 아직 안 붙었다', fade(u, 1.4), { fill: BAD, 'font-weight': 700 }); }
        if (k === 4) sub(780, 230, 'attach 가 끝난 뒤에 Lambda 를 만든다', fade(u, 1.5), { fill: GOOD, 'font-size': 14.5, 'font-weight': 700 }); }
      return; }
    if (k === 5) { // 남발
      tx(40, 60, '참조만', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); tx(40, 230, 'depends_on 남발', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      ['A', 'B', 'C', 'D'].forEach((n, i) => { node(260 + i * 120, 100, n, { s: pop(u, 0.1 + i * 0.1) });
        node(260 + i * 160, 270, n, { s: pop(u, 1.0 + i * 0.1), col: BAD }); if (i) grow(260 + (i - 1) * 160 + 24, 270, 260 + i * 160 - 26, 270, E(u, 1.3 + i * 0.1, 1.6 + i * 0.1), BAD); });
      bar(260, 140, 100, '1 물결', GOOD, seg(u, 0.4, 0.9)); bar(260, 310, 400, '4 물결', BAD, seg(u, 1.6, 2.4));
      sub(480, 400, '의존이 없으면 동시에 만든다 (기본 10개씩). 불필요한 depends_on 은 그 이점을 없앤다', fade(u, 2.2), { fill: INK, 'font-size': 14 }); return; }
    // k6 정리
    [['resource "타입" "이름" { … }', '가장 작은 단위', INK], ['required · optional · computed', '속성 세 종류', ACC], ['<타입>.<이름>.<속성>', 'address = 자동 의존성', WARN], ['data "타입" "이름" { … }', '조회 전용', INFO], ['depends_on = [ … ]', '추론이 안 될 때만', GOOD]].forEach(([a, b, col], i) => { const y = 60 + i * 70, s = pop(u, 0.2 + i * 0.3);
      card(330, y, 520, 52, { rx: 10, text: a, fs: 15, mono: true, stroke: col, color: col, s }); tx(620, y + 6, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); }); }

  const quiz = [
    { q: 'resource "aws_s3_bucket" "mine" { bucket = "my-team-logs-2026" } 에서 AWS로 전달되지 않는 것은 무엇인가?',
      o: ['로컬이름 mine', 'bucket 값 my-team-logs-2026', '타입이 정하는 S3 버킷 API'], a: 0,
      why: '로컬이름은 코드 안에서 이 블록을 가리키는 별명일 뿐이다. 클라우드에는 속성 값만 요청 본문으로 간다.' },
    { q: 'aws_instance의 id와 arn은 어떤 속성인가?',
      o: ['꼭 적어야 하는 required', 'apply 뒤 클라우드가 채우는 computed', '기본값이 있는 optional'], a: 1,
      why: 'id와 arn은 만들어진 뒤에야 정해진다. 코드에 적지 않고 aws_instance.web.id처럼 읽기만 한다.' },
    { q: 'aws_s3_bucket_versioning 에 bucket = aws_s3_bucket.mine.id 를 적으면 destroy 순서는 어떻게 되나?',
      o: ['버킷을 먼저 지우고 versioning을 지운다', '둘을 동시에 지운다', 'versioning을 먼저 지우고 버킷을 지운다'], a: 2,
      why: '참조 한 줄로 버킷 → versioning 간선이 생긴다. apply는 그 방향대로, destroy는 거꾸로 진행한다.' },
    { q: 'data "aws_vpc" "default" 블록이 있는 상태에서 terraform destroy 를 하면 기본 VPC는 어떻게 되나?',
      o: ['그대로 남는다', '함께 삭제된다', 'state에서만 지워지고 실제로는 삭제된다'], a: 0,
      why: 'data는 GET만 하는 조회 블록이다. 내가 만든 것이 아니므로 destroy도 건드리지 않는다.' },
    { q: 'Lambda가 role만 참조하는데 정책 attach 가 늦게 끝나 첫 호출이 AccessDenied 였다. 알맞은 해결은?',
      o: ['모든 리소스에 depends_on을 붙인다', 'Lambda에 depends_on = [aws_iam_role_policy_attachment.lambda]를 적는다', 'role 참조를 지운다'], a: 1,
      why: '코드에 참조가 없는 의존은 그래프에 없다. 보이지 않는 그 한 간선만 depends_on으로 더한다.' },
  ];

  const summary = [
    'resource 블록 하나가 클라우드 리소스 하나다. 타입은 provider가, 로컬이름은 내가 정하고 속성만 API로 간다.',
    '속성은 꼭 적는 값, 기본값이 있는 optional, apply 뒤에 채워지는 computed로 나뉜다.',
    '타입.이름.속성으로 다른 리소스를 참조하면 생성은 그 순서대로, 삭제는 거꾸로 진행된다.',
    'data는 이미 있는 것을 읽기만 하고, depends_on은 참조로 드러나지 않는 의존에만 쓴다.',
  ];
  const review = [
    { q: 'EC2에 이미지 ID를 직접 적었더니 다른 리전에서 plan이 실패했다. 고치는 방법으로 알맞은 것은?',
      o: ['data "aws_ami"로 owners와 이름 조건을 걸어 최신 이미지를 찾아 쓴다', 'ami 줄을 지운다', 'depends_on에 AMI를 넣는다'], a: 0,
      why: 'AMI ID는 리전마다 다르다. data로 조건을 걸어 찾으면 하드코딩이 사라지고, 결과를 address로 참조하면 된다.' },
    { q: '서로 참조가 없는 버킷 세 개에 습관처럼 depends_on을 줄줄이 걸었다. 무엇이 나빠지나?',
      o: ['버킷 이름이 바뀐다', 'destroy가 불가능해진다', '동시에 만들 수 있던 것이 한 줄로 서서 apply가 느려진다'], a: 2,
      why: '의존이 없으면 같은 물결에서 함께 만든다. 쓸데없는 간선은 물결 수를 늘려 직렬로 만든다.' },
    { q: 'plan에서 Missing required argument 오류가 났다. 클라우드에는 무슨 일이 일어났나?',
      o: ['리소스가 반쯤 만들어졌다', '아무 API도 호출되지 않았다', '기존 리소스가 지워졌다'], a: 1,
      why: '필수 인자 검사는 plan 단계에서 끝난다. 그래서 apply 전에 plan을 돌리면 클라우드를 건드리기 전에 막힌다.' },
  ];

  R.page({ title: 'resource 블록과 참조', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
