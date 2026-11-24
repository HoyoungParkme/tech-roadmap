/* II-1-1 provider — AWS/GCP/Azure 인증 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 인증 탐색 순서·버전 제약(~>)·features 필수 여부는 developer.hashicorp.com 과 각 provider 문서로 확인했다.
 * terraform 을 돌릴 수 없어 plan 개수(4 to add)·병렬 생성은 의존 그래프 규칙을 파이썬으로 재현해 맞췄다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, browser, cross, check, lock, clock, snippet, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // provider 플러그인: 왼쪽에 꽂는 핀 두 개가 달린 판
  function plug(cx, cy, name, sub2, o) { o = o || {}; const w = o.w || 170, h = o.h || 50, col = o.col || INK, s = o.s ?? 1;
    if (s <= 0) return; const g = R.G(cx, cy, s, o.op);
    [-10, 10].forEach((d) => el('rect', { x: -w / 2 - 12, y: d - 4, width: 14, height: 8, rx: 2, fill: col }, g));
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 9, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2 }, g);
    tx(-w / 2 + 12, sub2 ? -3 : 6, name, { 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g);
    if (sub2) tx(-w / 2 + 12, 16, sub2, { 'font-size': 13.5, fill: MUT, class: 'mono' }, g); return g; }
  // 열쇠(자격증명)
  function key(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s);
    el('circle', { cx: -9, cy: 0, r: 8, fill: 'none', stroke: col || WARN, 'stroke-width': 3.5 }, g);
    el('path', { d: 'M-1,0 H16 M10,0 V7 M15,0 V6', stroke: col || WARN, 'stroke-width': 3.5, 'stroke-linecap': 'round', fill: 'none' }, g); }
  // 파일 아이콘 (모서리 접힘)
  function fileIc(cx, cy, label, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op), col = o.col || INK;
    el('path', { d: 'M-16,-21 H8 L18,-11 V21 H-16 Z', fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M8,-21 V-11 H18', fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    if (o.tag) tx(1, 6, o.tag, { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, class: 'mono' }, g);
    if (label) mono(0, 42, label, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.lcol || INK, 'font-weight': 600 }, g); }
  // 구름 영역
  function cloudZone(x, y, w, h, title, o) { o = o || {}; const op = o.op ?? 1; if (op <= 0) return;
    el('rect', { x, y, width: w, height: h, rx: 16, fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: op });
    tx(x + 14, y + 23, title, { 'font-size': 15, 'font-weight': 800, fill: o.stroke || INFO, opacity: op }); }
  function bucket(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INK;
    el('path', { d: 'M-17,-12 L-12,16 H12 L17,-12', fill: PANEL, stroke: c, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: 0, cy: -12, rx: 17, ry: 5, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); }
  function vm(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INK;
    el('rect', { x: -22, y: -16, width: 44, height: 28, rx: 4, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g);
    el('path', { d: 'M-8,18 H8 M0,12 V18', stroke: c, 'stroke-width': 2.4 }, g); }

  // ---------- 1. provider 블록 ----------
  const T1 = { x: 30, y: 48, w: 440 };
  const RP = [['aws', 'hashicorp/aws', '~> 5.0', [5, 6]], ['google', 'hashicorp/google', '~> 5.0', [5, 6]], ['azurerm', 'hashicorp/azurerm', '~> 3.0', [3, 4]]];
  const PG = (i) => [596, 118 + i * 74];
  function s1(t, c) { const { k, u } = c;
    if (k <= 3) {
      // required_providers 표
      tx(T1.x, 28, 'terraform { required_version = ">= 1.6.0"  required_providers { … } }', { 'font-size': 13.5, class: 'mono', fill: MUT, opacity: k === 0 ? fade(u, 0.1) : 1 });
      el('rect', { x: T1.x, y: T1.y, width: T1.w, height: 34, rx: 8, fill: SOFT });
      [['이름', 12], ['source (어디서 받나)', 104], ['version', 330]].forEach(([s, dx]) => tx(T1.x + dx, T1.y + 22, s, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }));
      RP.forEach(([n, src, ver], i) => { if (i > Math.min(k, 2)) return; const y = T1.y + 40 + i * 44, a = k === i ? seg(u, 0.2, 1.0) : 1;
        el('rect', { x: T1.x, y, width: T1.w * a, height: 38, rx: 6, fill: k === i ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.2 });
        const op = k === i ? fade(u, 0.7) : 1;
        mono(T1.x + 12, y + 25, n, { 'font-size': 15, 'font-weight': 800, opacity: op });
        mono(T1.x + 104, y + 25, src, { 'font-size': 14.5, opacity: op });
        mono(T1.x + 330, y + 25, ver, { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: op }); });
      // 레지스트리 → 필요 목록
      card(640, 42, 250, 40, { rx: 20, text: 'registry.terraform.io', fs: 14, mono: true, fill: SOFT, stroke: GRID, sw: 1.5 });
      RP.forEach(([n, src, ver], i) => { if (i > Math.min(k, 2)) return; const [px, py] = PG(i), s = k === i ? pop(u, 1.0) : 1;
        if (k === i) dot([[640, 62], [px, py - 25]], seg(u, 0.5, 1.1), ACC, 6);
        plug(px, py, n, ver, { s, col: k === 3 ? INFO : INK }); });
      if (k === 0) { card(180, 320, 250, 66, { rx: 12, text: 'Terraform 본체\nHCL · 그래프 · state', fs: 14.5, fill: SOFT, stroke: INK });
        cloudZone(700, 292, 230, 60, 'AWS API');
        grow(306, 332, 690, 332, E(u, 1.2, 1.7), BAD, { plain: true }); if (u > 1.7) cross(500, 332, 13, pop(u, 1.7));
        dot([[306, 304], [500, 122], [690, 122], [812, 290]], seg(u, 2.0, 2.7), ACC, 7);
        note(480, 404, 'Terraform 본체는 AWS API를 모른다. 플러그인이 대신 말한다', fade(u, 1.9), { 'font-size': 14.5, 'text-anchor': 'middle' }); }
      if (k === 2) { // ~> 버전 범위 눈금
        const x0 = 60, ax = (v) => x0 + (v - 2.5) * 100, y0 = 300;
        el('line', { x1: x0, y1: y0, x2: ax(7), y2: y0, stroke: MUT, 'stroke-width': 1.8 });
        [3, 4, 5, 6, 7].forEach((v) => { el('line', { x1: ax(v), y1: y0, x2: ax(v), y2: y0 + 6, stroke: MUT }); mono(ax(v), y0 + 24, v + '.0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
        [['azurerm ~> 3.0', 3, 4, 0], ['aws · google ~> 5.0', 5, 6, 1]].forEach(([s, a, b, i]) => { const g = E(u, 1.0 + i * 0.4, 1.8 + i * 0.4), y = y0 - 34 - i * 0;
          el('rect', { x: ax(a), y, width: (ax(b) - ax(a) - 6) * g, height: 20, rx: 5, fill: ACC, opacity: 0.8 });
          mono(ax(a), y - 8, s, { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2 + i * 0.4) }); });
        sub(260, y0 + 52, '~> 5.0 은 5.x 안에서만 올라간다 (6.0은 받지 않음)', fade(u, 2.0), { fill: INK, 'font-size': 14 }); }
      if (k === 3) { // provider 블록 = 접속 설정
        const cfg = ['region = "ap-northeast-2"', 'project = "my-gcp-project"', 'features {}'];
        cfg.forEach((s, i) => { const [px, py] = PG(i), a = pop(u, 0.4 + i * 0.35);
          grow(px + 95, py, px + 132, py, a, INFO, { plain: true });
          if (a > 0) card(px + 132 + (tw(s, 13.5) + 22) / 2, py, tw(s, 13.5) + 22, 32, { rx: 6, text: s, fs: 13.5, mono: true, stroke: INFO, color: INFO, s: a }); });
        tx(T1.x, 250, '무엇을 받을지', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.4) });
        tx(T1.x + 130, 250, 'required_providers', { 'font-size': 14.5, class: 'mono', fill: ACC, opacity: fade(u, 1.4) });
        tx(T1.x, 288, '어떻게 접속할지', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8) });
        tx(T1.x + 130, 288, 'provider "aws" { … }', { 'font-size': 14.5, class: 'mono', fill: INFO, opacity: fade(u, 1.8) }); }
      return; }
    // k4: init → 인증 → plan/apply
    const steps = [['① terraform init', 150], ['② provider 별 인증', 480], ['③ plan / apply', 800]];
    steps.forEach(([s, x], i) => lbl(x, 30, s, fade(u, 0.1 + i * 0.7), { fill: i === 0 ? ACC : i === 1 ? WARN : INFO }));
    el('rect', { x: 40, y: 70, width: 220, height: 300, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(54, 96, '.terraform/providers/', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    ['aws', 'google', 'azurerm'].forEach((n, i) => { const y = 150 + i * 78, a = seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3);
      if (a < 1) fly(150, 112, 150, y, a, n, { mono: true });
      else plug(160, y, n, null, { w: 150, h: 42 });
      key(260, y, pop(u, 1.0 + i * 0.2)); if (u > 1.0 + i * 0.2) grow(276, y, 640, y, E(u, 1.5 + i * 0.15, 2.1 + i * 0.15), INFO); });
    ['AWS', 'GCP', 'Azure'].forEach((n, i) => { const y = 150 + i * 78; cloudZone(660, y - 30, 250, 60, n + ' API', { op: fade(u, 1.4 + i * 0.15) }); });
    sub(480, 400, '인증이 붙기 전에는 plan 도 API 를 부르지 못한다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 2. AWS 인증 탐색 순서 ----------
  const RUNG = [['① provider 블록 인자', 'access_key / secret_key'], ['② 환경변수', 'AWS_ACCESS_KEY_ID …'], ['③ ~/.aws/credentials', '[profile] 섹션'], ['④ 컨테이너 · 인스턴스 Role', '메타데이터가 임시 키 발급']];
  const RY = (i) => 78 + i * 78;
  function chain(found, u, k) { // found: 찾은 칸 번호
    tx(40, 34, 'AWS provider가 자격증명을 찾는 순서', { 'font-size': 15, 'font-weight': 800 });
    RUNG.forEach(([a, b], i) => { const y = RY(i), probe = seg(u, 0.15 + i * 0.3, 0.45 + i * 0.3), hit = i === found, miss = i < found;
      const col = hit ? (found === 0 ? BAD : GOOD) : miss && probe >= 1 ? OFF : GRID;
      card(240, y, 400, 58, { rx: 10, stroke: col, sw: hit ? 2.8 : 1.6, fill: hit && probe >= 1 ? (found === 0 ? BADBG : GOODBG) : PANEL });
      tx(56, y - 4, a, { 'font-size': 15, 'font-weight': 700, fill: miss && probe >= 1 ? MUT : INK });
      mono(56, y + 18, b, { 'font-size': 13.5, fill: MUT });
      if (miss && probe >= 1) mono(424, y + 6, '비어 있음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    const stop = 0.15 + found * 0.3 + 0.3; dot([[456, RY(0) - 40], [456, RY(found)]], seg(u, 0.1, stop), ACC, 7);
    if (u > stop) check(422, RY(found) + 2, 10, pop(u, stop)); return stop; }
  function s2(t, c) { const { k, u } = c;
    const PV = [760, 120];
    if (k <= 2) { const f = [1, 2, 3][k], stop = chain(f, u);
      plug(PV[0], PV[1], 'provider "aws"', 'region = "ap-northeast-2"' + (k === 1 ? '' : ''), { w: 260, s: 1 });
      if (k === 1) mono(PV[0] - 118, PV[1] + 44, 'profile = "dev"', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
      const ka = seg(u, stop + 0.2, stop + 1.0); if (ka > 0) { const kx = lerp(470, PV[0] - 150, E(ka, 0, 1)), ky = lerp(RY(f), PV[1], E(ka, 0, 1)); key(kx, ky, 1); }
      if (k === 0) { snippet(560, 230, ['$ export AWS_ACCESS_KEY_ID=AKIA…', '$ export AWS_SECRET_ACCESS_KEY=…', '$ export AWS_REGION=ap-northeast-2'], { fs: 13.5, op: fade(u, 1.6) });
        sub(760, 360, 'CI 시크릿이 env 로 넣어 주는 방식', fade(u, 2.1), { fill: INK }); }
      if (k === 1) { el('rect', { x: 570, y: 190, width: 330, height: 180, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.4) });
        mono(586, 216, '~/.aws/credentials', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) });
        [['[default]', 0], ['aws_access_key_id = AKIA…', 0], ['[dev]', 1], ['aws_access_key_id = AKIA…', 1]].forEach(([s, d], i) => { const y = 248 + i * 30, hot = d === 1;
          if (hot && i === 2) el('rect', { x: 578, y: y - 20, width: 314, height: 60, rx: 6, fill: ACCBG, opacity: fade(u, 1.9) });
          mono(590, y, s, { 'font-size': 14, fill: hot ? ACC : MUT, 'font-weight': hot ? 700 : 400, opacity: fade(u, 1.5 + i * 0.1) }); }); }
      if (k === 2) { vm(640, 300, pop(u, 1.2)); tx(690, 290, 'EC2 · ECS · EKS', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
        mono(690, 314, '메타데이터 서비스 → 임시 키', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.5) });
        clock(555, 300, 20, E(u, 1.6, 2.8), WARN); sub(555, 344, '만료되면 새로', fade(u, 1.9));
        sub(760, 392, '서버 안에 키 파일이 아예 없다', fade(u, 2.2), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 }); }
      return; }
    if (k === 3) { // assume_role
      zone(40, 60, 380, 300, 'Terraform 을 돌리는 계정', { fill: SOFT });
      zone(540, 60, 380, 300, '대상 계정 123456789012', { fill: SOFT, stroke: INFO, color: INFO });
      key(140, 160, 1); tx(170, 166, '기본 자격증명', { 'font-size': 15, 'font-weight': 700 }); sub(230, 196, '(env · 파일 · Role 중 하나)');
      card(730, 170, 300, 56, { rx: 10, text: 'role/TerraformExec', fs: 15, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.3) });
      grow(300, 160, 575, 170, E(u, 0.6, 1.4), ACC);
      pill(440, 128, 'STS AssumeRole', ACC, pop(u, 0.8), { mono: true, fs: 13.5 });
      const back = seg(u, 1.5, 2.3); if (back > 0) { const x = lerp(700, 220, E(back, 0, 1)); key(x, 270, 1, INFO); }
      if (u > 2.3) { mono(70, 316, '임시 키 (대상 계정 권한)', { 'font-size': 14, fill: INFO, 'font-weight': 700 }); }
      sub(480, 396, '파이프라인 하나가 계정 여러 개를 다룰 때 쓴다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    // k4: 하드코딩 금지
    chain(0, Math.max(u, 0.8));
    fileIc(640, 110, 'provider.tf', { col: BAD, tag: 'tf', s: pop(u, 0.4) });
    mono(600, 178, 'access_key = "AKIA…"', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.6) });
    grow(690, 110, 800, 110, E(u, 0.9, 1.4), BAD);
    card(850, 110, 90, 60, { rx: 10, text: 'git', fs: 16, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.3) });
    [[760, 260], [850, 300], [940, 250]].forEach(([x, y], i) => { const a = pop(u, 1.6 + i * 0.2); grow(850, 142, x, y - 22, a, BAD, { plain: true }); key(x, y, a, BAD); });
    tx(830, 370, '푸시되는 순간 키를 폐기해야 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }

  // ---------- 3. GCP ----------
  const GP = [790, 210];
  function gprov(o) { plug(GP[0], GP[1], 'provider "google"', 'project · region', Object.assign({ w: 250 }, o || {})); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(170, 120, 240, 120, { rx: 12, stroke: GRID, sw: 1.6, fill: SOFT });
      tx(66, 86, 'GCP 콘솔 · IAM', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      person(110, 138, null, { s: pop(u, 0.2) }); mono(140, 130, 'terraform-sa', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.4) });
      pill(210, 160, '필요한 최소 역할', GOOD, pop(u, 0.7), { fs: 13.5 });
      const d = seg(u, 1.0, 1.8); fileIc(lerp(170, 420, E(d, 0, 1)), lerp(190, 300, E(d, 0, 1)), d >= 1 ? '~/.gcp/terraform-sa.json' : null, { tag: '{ }', col: WARN, s: d > 0 ? 1 : 0 });
      note(560, 120, 'AWS는 키 두 개(ID·secret)', fade(u, 1.6), { fill: MUT });
      note(560, 152, 'GCP는 JSON 파일 하나가 자격증명', fade(u, 1.9), { 'font-weight': 800 }); gprov({ op: 0.35 }); return; }
    if (k === 1) { gprov();
      mono(40, 70, 'GOOGLE_APPLICATION_CREDENTIALS', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      mono(40, 96, '= "$HOME/.gcp/terraform-sa.json"', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      fileIc(380, 230, '~/.gcp/terraform-sa.json', { tag: '{ }', col: WARN });
      grow(160, 110, 360, 196, E(u, 0.6, 1.2), ACC); grow(410, 220, GP[0] - 140, GP[1], E(u, 1.2, 1.8), ACC);
      snippet(560, 270, ['provider "google" {', '  project = "my-gcp-project"', '  region  = "asia-northeast3"', '}'], { fs: 13.5, op: fade(u, 1.6) });
      sub(380, 330, '코드에는 경로도 키도 없다', fade(u, 2.1), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 2) { gprov();
      snippet(40, 60, ['provider "google" {', '  credentials = file("~/.gcp/terraform-sa.json")', '  project     = "my-gcp-project"', '}'], { fs: 14 });
      el('rect', { x: 46, y: 95, width: 452, height: 24, rx: 4, fill: WARN, opacity: 0.22 * fade(u, 0.4) });
      [['동료 A', '/home/a/.gcp/…', 0], ['동료 B', 'C:\\Users\\b\\…', 1]].forEach(([n, pth, i]) => { const x = 140 + i * 260, a = pop(u, 1.0 + i * 0.4);
        person(x, 270, n, { s: a }); mono(x, 340, pth, { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.2 + i * 0.4) }); });
      sub(270, 392, '경로가 코드에 박히면 사람마다 고쳐 써야 한다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 3) { gprov();
      person(90, 200, '나', { s: pop(u, 0.2) });
      mono(140, 120, '$ gcloud auth application-default login', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.3) });
      browser(300, 210, 140, 90, '브라우저 로그인', { s: pop(u, 0.7) });
      grow(124, 200, 228, 210, E(u, 0.5, 1.0), MUT);
      const d = seg(u, 1.2, 1.9); if (d > 0) fileIc(lerp(300, 520, E(d, 0, 1)), 210, d >= 1 ? 'ADC 파일' : null, { tag: '{ }', col: INFO });
      mono(330, 310, '~/.config/gcloud/application_default_credentials.json', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 1.8) });
      grow(542, 210, GP[0] - 140, GP[1], E(u, 1.9, 2.4), INFO, { dash: '6 5' });
      sub(480, 380, '내 계정 권한으로 돈다: 혼자 실습에는 편하고 CI 에는 쓰지 않는다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { el('rect', { x: 470, y: 80, width: 460, height: 270, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      tx(486, 106, 'GCE · GKE · Cloud Run 인스턴스', { 'font-size': 14.5, 'font-weight': 700 });
      plug(720, 230, 'provider "google"', null, { w: 240 });
      pill(720, 150, '붙어 있는 서비스 계정', GOOD, pop(u, 0.4), { fs: 13.5 }); grow(720, 166, 720, 202, E(u, 0.8, 1.2), GOOD);
      fileIc(200, 220, 'terraform-sa.json', { tag: '{ }', col: OFF, lcol: MUT }); cross(200, 220, 26, pop(u, 1.3));
      sub(200, 310, 'JSON 파일 필요 없음', fade(u, 1.6), { fill: INK, 'font-weight': 700, 'font-size': 14.5 });
      sub(480, 396, 'AWS의 IAM Role과 같은 자리: 운영은 키 파일 없이', fade(u, 2.1), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 }); return; }
    // k5 .gitignore
    el('rect', { x: 50, y: 60, width: 340, height: 300, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(66, 88, '작업 폴더', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const files = [['main.tf', true], ['provider.tf', true], ['terraform-sa.json', false], ['.gcp/', false], ['.gitignore', true]];
    files.forEach(([n, ok], i) => { const y = 124 + i * 46, a = fade(u, 0.2 + i * 0.15);
      mono(80, y, n, { 'font-size': 15, 'font-weight': 700, fill: ok ? INK : BAD, opacity: a, 'text-decoration': !ok && u > 1.2 ? 'line-through' : null });
      if (ok) grow(250, y - 5, 600, y - 5, E(u, 1.2 + i * 0.1, 1.8 + i * 0.1), GOOD, { plain: true }); else if (u > 1.2) mono(370, y, '무시', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.2) }); });
    snippet(450, 60, ['# .gitignore', '*.json', '.gcp/', 'terraform-sa*.json'], { fs: 14, op: fade(u, 0.6) });
    card(760, 270, 200, 100, { rx: 12, text: 'git 원격 저장소', fs: 15, stroke: GOOD, s: pop(u, 1.4) });
    sub(700, 396, '한 번이라도 커밋된 키는 폐기하고 다시 발급한다', fade(u, 2.2), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); }

  // ---------- 4. Azure ----------
  const AZ = [770, 120];
  function azprov(lines, o) { o = o || {}; snippet(AZ[0] - 150, AZ[1] - 60, lines, { fs: 14, w: 300, op: o.op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { azprov(['provider "azurerm" {', '  features {}', '}']);
      el('rect', { x: AZ[0] - 144, y: AZ[1] - 32, width: 288, height: 24, rx: 4, fill: ACC, opacity: 0.2 * fade(u, 1.6) });
      person(90, 220, '나', { s: pop(u, 0.2) });
      ['$ az login', '$ az account set --subscription <ID>', '$ az account show'].forEach((s, i) => mono(150, 170 + i * 30, s, { 'font-size': 14, 'font-weight': i === 0 ? 800 : 400, opacity: fade(u, 0.3 + i * 0.35) }));
      card(330, 320, 200, 50, { rx: 10, text: 'az CLI 세션', fs: 15, stroke: INFO, color: INFO, s: pop(u, 1.4) });
      grow(430, 320, AZ[0] - 60, AZ[1] + 36, E(u, 1.7, 2.3), INFO);
      sub(700, 300, 'provider 가 세션을 그대로 쓴다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { mono(40, 56, '$ az ad sp create-for-rbac --name "terraform-sp" \\', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.1) });
      mono(40, 80, '      --role "Contributor" --scopes "/subscriptions/<SUB_ID>"', { 'font-size': 14, opacity: fade(u, 0.3) });
      const g = R.G(200, 220, pop(u, 0.6)); el('rect', { x: -26, y: -26, width: 52, height: 44, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }, g);
      [-10, 10].forEach((d) => el('circle', { cx: d, cy: -6, r: 5, fill: ACC }, g)); el('line', { x1: 0, y1: -26, x2: 0, y2: -38, stroke: INK, 'stroke-width': 2.5 }, g); el('circle', { cx: 0, cy: -40, r: 4, fill: INK }, g);
      tx(200, 270, 'terraform-sp', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.8) });
      sub(200, 294, '사람이 아닌 자동화 계정', fade(u, 1.0));
      ['appId', 'password', 'tenant'].forEach((s, i) => { const a = seg(u, 1.1 + i * 0.3, 1.7 + i * 0.3);
        if (a > 0) card(lerp(240, 640, E(a, 0, 1)), 170 + i * 66, 180, 46, { rx: 8, text: s, fs: 15, mono: true, stroke: WARN, color: WARN }); });
      sub(640, 380, '출력값은 안전한 곳에 바로 보관', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { azprov(['provider "azurerm" {', '  features {}', '}']);
      const env = [['ARM_CLIENT_ID', 'appId'], ['ARM_CLIENT_SECRET', 'password'], ['ARM_TENANT_ID', 'tenant'], ['ARM_SUBSCRIPTION_ID', 'subscription']];
      env.forEach(([n, v], i) => { const y = 120 + i * 66, a = seg(u, 0.2 + i * 0.4, 0.7 + i * 0.4);
        el('rect', { x: 40, y: y - 22, width: 270, height: 44, rx: 8, fill: a >= 1 ? ACCBG : PANEL, stroke: a >= 1 ? ACC : GRID, 'stroke-width': 1.8 });
        mono(54, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, fill: a >= 1 ? ACC : INK });
        if (a > 0) fly(470, y, 320, y, a, v, { mono: true, fill: WARN, stay: true }); });
      [0, 1, 2, 3].forEach((i) => grow(310, 120 + i * 66, AZ[0] - 160, AZ[1] + 20, E(u, 2.0, 2.5), ACC, { plain: i > 0, op: 0.7 }));
      sub(700, 300, '네 값이 env 에 있으면 provider 는 features {} 만으로 인증된다', fade(u, 2.3), { fill: INK, 'font-size': 14 }); return; }
    if (k === 3) { el('rect', { x: 430, y: 60, width: 490, height: 300, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      tx(446, 86, 'Azure VM · App Service · AKS', { 'font-size': 14.5, 'font-weight': 700 });
      snippet(500, 120, ['provider "azurerm" {', '  features {}', '  use_msi = true', '}'], { fs: 14.5, w: 330 });
      pill(675, 290, 'Managed Identity (MSI)', GOOD, pop(u, 0.6), { fs: 14 });
      el('rect', { x: 506, y: 178, width: 318, height: 22, rx: 4, fill: GOOD, opacity: 0.2 * fade(u, 0.4) });
      card(180, 200, 220, 60, { rx: 10, text: 'client_secret', fs: 15, mono: true, stroke: OFF, color: MUT }); cross(180, 200, 26, pop(u, 1.2));
      sub(180, 260, '비밀값 0개', fade(u, 1.5), { fill: GOOD, 'font-weight': 700, 'font-size': 15 });
      sub(480, 396, 'AWS Role, GCP attached SA, Azure MSI는 같은 자리다', fade(u, 2.1), { fill: INK, 'font-size': 14.5 }); return; }
    if (k === 4) { snippet(40, 60, ['provider "azurerm" {', '  # features 블록 없음', '}'], { fs: 14.5, w: 330 });
      grow(380, 110, 520, 110, E(u, 0.4, 0.9), BAD);
      mono(540, 100, '$ terraform plan', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      card(700, 170, 400, 80, { rx: 10, text: 'Error: Insufficient features blocks', fs: 15, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.0) });
      sub(700, 236, '(예시: 오류 이름은 Terraform 공통 형식)', fade(u, 1.3));
      card(205, 280, 330, 70, { rx: 10, text: 'provider "azurerm" {\n  features {}\n}', fs: 14, mono: true, stroke: GOOD, s: pop(u, 1.6) });
      check(400, 280, 12, pop(u, 1.9)); sub(560, 392, '옵션을 하나도 안 써도 빈 블록은 꼭 둔다 (azurerm 2.0부터)', fade(u, 2.1), { fill: INK, 'font-size': 14.5 }); return; }
    // k5: features { key_vault { … } }
    snippet(40, 50, ['features {', '  key_vault {', '    purge_soft_delete_on_destroy    = true', '    recover_soft_deleted_key_vaults = true', '  }', '}'], { fs: 13.5 });
    const kvx = 160, kvy = 320; card(kvx, kvy, 160, 54, { rx: 10, text: 'Key Vault', fs: 15, stroke: INK });
    const d = seg(u, 0.6, 1.4); card(lerp(kvx + 180, 640, E(d, 0, 1)), 230, 150, 46, { rx: 10, text: 'destroy', fs: 14.5, mono: true, stroke: BAD, color: BAD, op: d > 0 ? 1 : 0 });
    card(790, 120, 230, 60, { rx: 10, text: 'soft-delete 보관\n(복구 가능 기간)', fs: 13.5, stroke: WARN, color: WARN, s: pop(u, 1.2) });
    card(790, 320, 230, 52, { rx: 10, text: '영구 삭제 (purge)', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 1.6) });
    grow(720, 220, 760, 152, E(u, 1.2, 1.6), WARN); grow(790, 152, 790, 292, E(u, 1.8, 2.3), BAD);
    sub(600, 392, 'features 는 리소스별 동작 스위치다', fade(u, 2.2), { fill: INK, 'font-size': 14.5 }); }

  // ---------- 5. 멀티 provider ----------
  const MP = [['aws', 'ap-northeast-2 (default)', 100, ACC], ['aws.tokyo', 'ap-northeast-1 (alias)', 180, ACC], ['google', 'asia-northeast3', 260, INFO], ['azurerm', 'features {}', 340, WARN]];
  const ZN = [['AWS 서울', 100], ['AWS 도쿄', 180], ['GCP 서울', 260], ['Azure Korea Central', 340]];
  const RES = [['aws_s3_bucket.seoul_logs', 0, 'b'], ['aws_s3_bucket.tokyo_logs', 1, 'b'], ['google_storage_bucket.gcp_assets', 2, 'b'], ['azurerm_resource_group.main', 3, 'g']];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 60, 260, 40, { rx: 20, text: 'terraform init (한 번)', fs: 15, mono: true, fill: SOFT, stroke: GRID });
      ['aws', 'google', 'azurerm'].forEach((n, i) => { const x = 220 + i * 260, a = seg(u, 0.3 + i * 0.25, 1.1 + i * 0.25);
        if (a < 1) fly(480, 80, x, 220, a, n, { mono: true }); else plug(x, 220, n, ['~> 5.0', '~> 5.0', '~> 3.0'][i], { w: 170 }); });
      sub(480, 320, '플러그인 3개가 동시에 내려받아진다', fade(u, 2.0), { fill: INK, 'font-size': 15 }); return; }
    // 공통: 왼쪽 접속 설정, 오른쪽 지역
    const nCfg = k === 1 ? 1 : k === 2 ? 2 : 4;
    tx(40, 50, '접속 설정 (provider 블록)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    tx(700, 50, '실제로 만들어지는 곳', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    MP.slice(0, nCfg).forEach(([n, s2, y, col], i) => { const fresh = (k === 1 && i === 0) || (k === 2 && i === 1) || (k === 3 && i >= 2);
      plug(150, y, n, s2, { w: 230, col, s: fresh ? pop(u, 0.2 + (i - 2 >= 0 && k === 3 ? (i - 2) * 0.3 : 0)) : 1 });
      const [zn, zy] = ZN[i]; cloudZone(700, zy - 30, 230, 60, zn, { op: fresh ? fade(u, 0.6) : 1, stroke: col, fill: SOFT });
      if (k <= 3) grow(268, y, 690, zy, fresh ? E(u, 0.8, 1.5) : 1, col, { dash: '5 5', op: 0.7 }); });
    if (k === 2) sub(480, 400, '같은 계정 · 다른 리전에 alias 로 이름을 붙인다', fade(u, 1.8), { fill: INK, 'font-size': 15 });
    if (k === 3) sub(480, 400, '클라우드가 늘어도 provider 블록만 늘어난다', fade(u, 1.8), { fill: INK, 'font-size': 15 });
    if (k >= 4) { const shown = k === 4 ? 2 : 4;
      RES.slice(0, shown).forEach(([addr, pi, ic], i) => { const y = MP[pi][2], fresh = (k === 4) || (k === 5 && i >= 2), a = fresh ? seg(u, 0.3 + (i % 2) * 0.5, 1.0 + (i % 2) * 0.5) : 1;
        const col = MP[pi][3];
        mono(480, y - 12, addr.split('.')[1], { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: fresh ? fade(u, 0.2 + (i % 2) * 0.5) : 1 });
        grow(268, y, 690, y, a, col); });
      if (k === 4) { mono(480, 222, 'provider = aws.tokyo', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 800, opacity: fade(u, 1.4) });
        mono(480, 128, '(provider 생략 → default)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) }); }
      if (k === 5) sub(480, 400, '타입 접두사 aws_ · google_ · azurerm_ 이 소속 provider 를 말해 준다', fade(u, 1.6), { fill: INK, 'font-size': 14.5 });
      if (k === 6) { RES.forEach(([a, pi, ic], i) => { const y = MP[pi][2], ap = seg(u, 0.8, 1.8);
          dot([[268, y], [690, y]], ap, MP[pi][3], 6); if (ap >= 1) (ic === 'b' ? bucket : (x, yy, s) => card(x, yy, 34, 26, { rx: 4, stroke: MP[pi][3], s }))(890, y + 4, pop(u, 1.8), MP[pi][3]); });
        card(480, 22, 360, 32, { rx: 16, text: 'Plan: 4 to add, 0 to change, 0 to destroy.', fs: 13.5, mono: true, fill: PANEL, stroke: GOOD, color: GOOD, s: pop(u, 0.3) });
        sub(480, 404, '서로 의존이 없어 네 개가 한꺼번에 만들어진다', fade(u, 2.0), { fill: INK, 'font-size': 14.5 }); } } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: 'required_providers 블록과 provider 블록이 맡는 일은 각각 무엇인가?',
      o: ['둘 다 인증 정보를 적는 곳이다', 'required_providers는 받을 플러그인과 버전, provider 블록은 리전·계정 같은 접속 설정이다', 'required_providers는 리소스 목록, provider 블록은 플러그인 다운로드 주소다'], a: 1,
      why: 'init은 required_providers의 source와 version을 보고 플러그인을 받는다. region이나 project처럼 어떻게 접속할지는 provider 블록에 적는다.' },
    { q: 'AWS_ACCESS_KEY_ID 환경변수가 비어 있고 ~/.aws/credentials 에 [dev] 프로파일이 있다. provider에 profile = "dev"를 적으면 어디서 키를 얻나?',
      o: ['~/.aws/credentials 의 [dev] 섹션', 'EC2 메타데이터 서비스', 'provider 블록의 access_key'], a: 0,
      why: '탐색 순서에서 환경변수 칸이 비어 있으므로 다음 칸인 공유 자격증명 파일로 내려가고, profile 이름으로 [dev] 섹션을 고른다.' },
    { q: 'GCP 인증에서 가장 권장되는 방식은 무엇인가?',
      o: ['provider 블록에 credentials = file("…json")을 적는다', 'JSON 키를 저장소에 함께 커밋한다', 'GOOGLE_APPLICATION_CREDENTIALS 환경변수에 키 파일 경로를 준다'], a: 2,
      why: '경로를 env로 주면 코드에는 비밀도 경로도 남지 않는다. file()로 적으면 경로가 코드에 박혀 사람마다 달라진다.' },
    { q: 'azurerm provider에서 features 블록을 빼면 어떻게 되나?',
      o: ['plan에서 features 블록이 모자란다는 오류가 난다', '기본 구독으로 조용히 동작한다', 'Key Vault만 만들 수 없게 된다'], a: 0,
      why: 'features는 azurerm 2.0부터 필수 블록이다. 옵션을 쓰지 않아도 features {}를 비워서라도 적어야 한다.' },
    { q: '같은 AWS 계정의 서울과 도쿄에 버킷을 하나씩 만들려면 무엇이 필요한가?',
      o: ['도쿄용 Terraform 폴더를 따로 만든다', 'alias = "tokyo"인 provider 블록을 하나 더 두고, 도쿄 버킷에 provider = aws.tokyo를 적는다', 'required_providers에 aws를 두 번 적는다'], a: 1,
      why: 'alias 없는 aws가 기본(서울)이고, alias를 붙인 두 번째 설정을 리소스의 provider 인자로 골라 쓴다. 플러그인은 aws 하나면 된다.' },
  ];

  const summary = [
    'Terraform 본체는 클라우드 API를 모르고, provider 플러그인이 그 일을 맡는다.',
    'required_providers는 받을 플러그인과 버전을, provider 블록은 리전과 계정 같은 접속 설정을 적는다.',
    '자격증명은 코드에 적지 않는다. 로컬은 프로파일이나 CLI 로그인, CI는 환경변수, 운영 서버는 Role로 키 없이 쓴다.',
    '같은 클라우드의 다른 리전이나 계정은 alias로 나누고, 리소스에 provider 인자로 고른다.',
  ];
  const review = [
    { q: 'GitHub Actions에서 AWS에 apply하려 한다. 키를 넣는 방법으로 알맞은 것은?',
      o: ['provider "aws" 블록에 access_key를 적어 커밋한다', 'CI 시크릿을 AWS_ACCESS_KEY_ID 같은 환경변수로 넣는다', '~/.aws/credentials 파일을 저장소에 함께 올린다'], a: 1,
      why: '환경변수는 탐색 순서 두 번째 칸이라 provider 블록에는 region만 남는다. 키가 코드나 저장소에 남지 않는다.' },
    { q: '팀원 PC마다 plan이 "파일을 찾을 수 없다"며 실패한다. provider "google" 블록에서 먼저 의심할 것은?',
      o: ['required_providers의 version', 'project 이름의 오타', 'credentials = file("~/.gcp/…") 처럼 박아 둔 경로'], a: 2,
      why: '경로가 코드에 있으면 사람마다 파일 위치가 달라 깨진다. 경로는 GOOGLE_APPLICATION_CREDENTIALS로 각자 주는 편이 낫다.' },
    { q: 'init을 다시 했더니 aws provider가 6.0으로 올라가지 않았다. 이유로 맞는 것은?',
      o: ['version = "~> 5.0"이라 5.x 안에서만 고르기 때문이다', '레지스트리에 6.0이 없기 때문이다', 'provider 블록에 region이 있어서다'], a: 0,
      why: '~> 5.0은 5.0 이상 6.0 미만만 허용한다. 큰 버전을 올리려면 제약을 직접 바꿔야 한다.' },
  ];

  R.page({ title: 'provider와 인증', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
