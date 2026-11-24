/* IV-2-1 Terragrunt — Terraform 앞단의 DRY 보강. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 버킷·키·inputs 값은 페이지 CODE 블록(backend-dry.hcl, inherit.hcl, dependency.hcl)에서 옮겼다.
 * include 규칙(중첩 불가, 기본 shallow)은 Terragrunt 문서의 include 블록 설명을 따른다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, snippet, spans, cross, check, lock, terminal, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, kk, d) => (c.k > kk ? 1 : c.k === kk ? pop(c.u, d ?? 0.2) : 0);
  const fa = (c, kk, d) => (c.k > kk ? 1 : c.k === kk ? fade(c.u, d ?? 0.2) : 0);
  const gr = (c, kk, a, b) => (c.k > kk ? 1 : c.k === kk ? E(c.u, a ?? 0.2, b ?? 1.2) : 0);
  function fileCard(x, y, w, h, name, o) { o = o || {}; const op = o.op ?? 1, st = o.stroke || INK;
    el('path', { d: `M${x},${y} H${x + w - 14} L${x + w},${y + 14} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: st, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: op });
    if (name) mono(x + 10, y + 21, name, { 'font-size': o.fs || 14, 'font-weight': 700, fill: o.color || INK, opacity: op }); }
  function bucket(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || WARN;
    el('path', { d: 'M-56,-26 L-45,36 H45 L56,-26 Z', fill: WARNBG, stroke: col, 'stroke-width': 2.4 }, g);
    el('ellipse', { cx: 0, cy: -26, rx: 56, ry: 10, fill: PANEL, stroke: col, 'stroke-width': 2.4 }, g);
    if (name) mono(0, 60, name, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g); }
  const kv = (x, y, k, v, col, op) => spans(x, y, [[k + ' = ', { fill: MUT }], [v, { fill: col || INK, 'font-weight': '700' }]], { 'font-size': 14, opacity: op ?? 1 });

  // ---------- 1. Terragrunt 는 얇은 래퍼 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const s = pop(u, 0.2);
      card(430, 200, 640, 260, { rx: 18, stroke: ACC, sw: 3, fill: ACCBG, s });
      tx(130, 96, 'terragrunt', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: clamp(s) });
      card(500, 220, 380, 150, { rx: 14, stroke: INFO, sw: 2.6, fill: PANEL, s: pop(u, 0.5) });
      tx(330, 172, 'terraform (그대로)', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) });
      fly(20, 200, 200, 200, seg(u, 0.8, 1.5), 'terragrunt apply', { mono: true });
      fly(200, 220, 440, 230, seg(u, 1.5, 2.2), 'terraform apply', { mono: true, fill: INFO });
      if (u > 2.2) pill(440, 230, 'terraform apply', INFO, 1, { mono: true, fs: 13.5 });
      tx(860, 380, '문법은 그대로, 앞단만 보강', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 2.3) });
      return; }
    if (k === 1 || k === 2) { const envs = k === 1 ? ['dev'] : ['dev', 'stage', 'prod'];
      envs.forEach((e, i) => { const x = 40 + i * 300, s = i === 0 ? 1 : seg(u, 0.3 + i * 0.4, 1.0 + i * 0.4);
        tx(x, 60, 'envs/' + e + '/', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: clamp(s * 2) });
        [['main.tf', 'provider 블록'], ['backend.tf', 'backend "s3" 블록'], ['variables.tf', '공통 변수']].forEach(([f, b], j) => {
          const op = k === 1 ? fade(u, 0.3 + j * 0.4) : clamp(s * 2), y = 80 + j * 90, bk = j === 1 && k === 2;
          fileCard(x, y, 250, 70, f, { op, stroke: bk ? WARN : INK });
          tx(x + 10, y + 52, b + (i ? '  (복붙)' : ''), { 'font-size': 13.5, fill: bk ? WARN : MUT, opacity: op }); }); });
      tx(480, 380, k === 1 ? '환경 하나까지는 문제가 없어 보인다' : '환경이 늘면 같은 설정이 통째로 복사된다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      return; }
    if (k === 3) { const n = Math.min(15, Math.floor(E(u, 0.6, 2.4) * 16));
      ['dev', 'stage', 'prod'].forEach((e, r) => { mono(90, 112 + r * 80, e, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
        for (let m = 0; m < 5; m++) { const i = r * 5 + m, done = i < n;
          card(160 + m * 130, 106 + r * 80, 110, 50, { rx: 7, text: 'backend.tf', fs: 13.5, mono: true, stroke: done ? WARN : GRID, color: done ? WARN : INK, fill: done ? WARNBG : PANEL, s: pop(u, 0.1 + i * 0.02) }); } });
      for (let m = 0; m < 5; m++) mono(160 + m * 130, 60, 'module ' + (m + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      tx(160, 370, '버킷 이름 한 번 바꾸기', { 'font-size': 16, 'font-weight': 700 });
      mono(400, 370, n + ' / 15 파일 수정', { 'font-size': 18, 'font-weight': 800, fill: WARN });
      return; }
    if (k === 4) { const g = E(u, 0.2, 1.0);
      for (let i = 0; i < 15; i++) { const r = Math.floor(i / 5), m = i % 5, x = lerp(160 + m * 130, 200, g), y = lerp(106 + r * 80, 200, g);
        if (g < 1) card(x, y, 110, 50, { rx: 7, stroke: WARN, fill: WARNBG, op: 1 - g * 0.8 }); }
      fileCard(80, 150, 240, 110, 'live/terragrunt.hcl', { stroke: ACC, color: ACC, op: fade(u, 0.9) });
      mono(200, 220, '설정 1벌', { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      [['backend', 'remote_state'], ['provider', 'generate 블록'], ['공통 변수', 'inputs 상속'], ['여러 모듈 실행', 'run-all'], ['모듈 간 의존', 'dependency']].forEach(([a, b], i) => {
        const y = 70 + i * 62, s = pop(u, 1.0 + i * 0.25); grow(322, 205, 440, y, seg(u, 1.0 + i * 0.25, 1.3 + i * 0.25), GRID);
        card(600, y, 300, 46, { rx: 23, stroke: ACC, s }); tx(470, y + 5, a, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s) });
        mono(735, y + 5, b, { 'font-size': 14, fill: ACC, 'text-anchor': 'end', opacity: clamp(s) }); });
      return; }
    // k = 5: live/ 와 modules/ 경계
    zone(30, 40, 380, 250, 'live/  — Terragrunt (.hcl)', { fill: ACCBG, stroke: ACC, color: ACC });
    zone(550, 40, 380, 250, 'modules/  — Terraform (.tf)', { fill: INFOBG, stroke: INFO, color: INFO });
    ['terragrunt.hcl', 'dev/vpc/terragrunt.hcl', 'prod/vpc/terragrunt.hcl'].forEach((f, i) => mono(56, 96 + i * 40, f, { 'font-size': 14.5, opacity: fade(u, 0.2 + i * 0.2) }));
    ['vpc/main.tf', 'vpc/variables.tf', 'vpc/outputs.tf'].forEach((f, i) => mono(576, 96 + i * 40, f, { 'font-size': 14.5, opacity: fade(u, 0.4 + i * 0.2) }));
    card(480, 352, 330, 60, { rx: 10, text: '.terragrunt-cache/  → terraform apply', fs: 14.5, mono: true, fw: 700, stroke: INK, s: pop(u, 1.4) });
    grow(220, 292, 380, 324, E(u, 1.6, 2.1), ACC); grow(740, 292, 580, 324, E(u, 1.6, 2.1), INFO);
    tx(480, 408, '두 문법이 폴더로 갈린다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ---------- 2. backend 를 루트 한 곳에 ----------
  const ROOT = [
    ['remote_state {', '  backend = "s3"'],
    ['  generate = {', '    path      = "backend.tf"', '    if_exists = "overwrite_terragrunt"', '  }'],
    ['  config = {', '    bucket         = "mycompany-tfstate"', '    region         = "ap-northeast-2"', '    encrypt        = true', '    dynamodb_table = "tfstate-lock"'],
    ['    key = "${path_relative_to_include()}/…"', '  }'],
  ];
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) { const lines = [].concat(...ROOT.slice(0, k + 1), ['}']);
      tx(24, 34, 'live/terragrunt.hcl (루트)', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      snippet(24, 46, lines, { fs: 13.5 });
      if (k === 0) { [['live/', 0], ['dev/', 1], ['vpc/', 2], ['rds/', 2], ['prod/', 1]].forEach(([n, d], i) => mono(560 + d * 30, 80 + i * 40, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.15) }));
        tx(560, 320, 'backend 정의를 루트 파일 한 곳으로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
      if (k === 1) { fileCard(560, 70, 340, 230, 'live/dev/vpc/', {});
        fileCard(590, 120, 280, 140, '.terragrunt-cache/', { stroke: MUT, color: MUT, dash: '5 4' });
        const s = pop(u, 1.0); card(730, 212, 170, 48, { rx: 8, text: 'backend.tf', fs: 15, mono: true, fw: 800, stroke: GOOD, color: GOOD, fill: GOODBG, s });
        mono(730, 290, 'Terragrunt 가 써 준다', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
      if (k === 2) { bucket(640, 150, 'mycompany-tfstate', { s: pop(u, 0.5) });
        card(840, 150, 150, 70, { rx: 10, stroke: INFO, fill: INFOBG, s: pop(u, 1.0) }); lock(840, 145, true, INFO, pop(u, 1.2));
        mono(840, 212, 'tfstate-lock', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.2) });
        tx(740, 280, '회사 전체가 같은 버킷 · 같은 잠금 테이블', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        mono(740, 306, 'encrypt = true', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
      if (k === 3) { bucket(820, 300, null, { s: 0.8 });
        [['live/dev/vpc', 'dev/vpc/terraform.tfstate'], ['live/prod/rds', 'prod/rds/terraform.tfstate']].forEach(([a, b], i) => { const y = 80 + i * 90;
          mono(520, y, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2 + i * 0.5) });
          grow(520, y + 10, 540, y + 30, seg(u, 0.5 + i * 0.5, 0.8 + i * 0.5), MUT);
          mono(560, y + 40, 'key = ' + b, { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.5) });
          dot([[760, y + 46], [820, 290]], seg(u, 1.4 + i * 0.4, 2.0 + i * 0.4), ACC, 6); });
        tx(520, 270, '폴더 경로가 곧 state key', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 4) { snippet(24, 60, ['# live/dev/vpc/terragrunt.hcl', 'include "root" {', '  path = find_in_parent_folders()', '}'], { fs: 14 });
      const T = [['live/', 0, 'terragrunt.hcl ✓'], ['dev/', 1, '없음'], ['vpc/', 2, '여기서 시작']];
      T.forEach(([n, d, note], i) => { const y = 110 + i * 80, x = 560 + d * 40;
        mono(x, y, n, { 'font-size': 16, 'font-weight': 800 }); mono(x + 70, y, note, { 'font-size': 14, fill: i === 0 ? GOOD : MUT, 'font-weight': 700, opacity: i === 2 ? 1 : fade(u, i === 1 ? 1.0 : 1.7) }); });
      dot([[650, 266], [610, 186], [570, 106]], seg(u, 0.4, 1.8), ACC, 8);
      if (u > 1.8) check(540, 104, 10, pop(u, 1.8));
      tx(24, 260, '부모 폴더로 올라가며 terragrunt.hcl 을 찾는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(24, 288, '자식에는 backend 설정이 한 줄도 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    if (k === 5) { snippet(24, 40, ['terraform {', '  source = "../../../modules//vpc"', '}', 'inputs = {', '  vpc_cidr = "10.10.0.0/16"', '  name     = "dev-vpc"', '}'], { fs: 14 });
      fileCard(560, 50, 340, 110, 'modules/vpc/', { stroke: INFO, color: INFO }); mono(576, 120, 'main.tf · variables.tf', { 'font-size': 14 });
      fileCard(560, 230, 340, 110, '.terragrunt-cache/', { stroke: MUT, color: MUT, dash: '5 4' });
      grow(730, 162, 730, 228, E(u, 0.6, 1.2), INFO);
      mono(576, 300, '-var vpc_cidr=10.10.0.0/16', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(24, 260, '자식은 무엇을(source), 어떤 값으로(inputs)만 말한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      return; }
    // k = 6: 1곳 + 한 줄씩
    fileCard(330, 30, 300, 70, 'live/terragrunt.hcl', { stroke: ACC, color: ACC }); mono(346, 84, 'remote_state 1벌', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    ['dev/vpc', 'dev/rds', 'prod/vpc', 'prod/rds'].forEach((n, i) => { const x = 40 + i * 230, s = pop(u, 0.3 + i * 0.25);
      grow(480, 102, x + 100, 180, seg(u, 0.3 + i * 0.25, 0.7 + i * 0.25), GRID);
      fileCard(x, 186, 200, 80, n, { op: clamp(s) }); mono(x + 10, 248, 'include "root"', { 'font-size': 13.5, fill: ACC, opacity: clamp(s) }); });
    tx(480, 330, 'backend 정의', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.8) });
    mono(494, 330, '15벌 → 1벌', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
    tx(480, 372, '모듈이 늘어도 backend 설정은 늘지 않는다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ---------- 3. include 로 값 합치기 ----------
  const LY = [{ n: 'live/terragrunt.hcl', y: 30, col: INFO }, { n: 'live/dev/env.hcl', y: 150, col: WARN }, { n: 'live/dev/vpc/terragrunt.hcl', y: 270, col: ACC }];
  function layer(i, s) { const L = LY[i]; fileCard(20, L.y, 440, 110, L.n, { stroke: L.col, color: L.col, op: clamp(s * 1.5) }); }
  const chip = (x, y, s, col, sc, o) => pill(x, y, s, col, sc, Object.assign({ mono: true, fs: 13.5, fill: PANEL }, o || {}));
  function s3(t, c) { const { k, u } = c;
    layer(0, at(c, 0, 0.1));
    if (k === 0) { chip(110, 92, 'local.company', MUT, pop(u, 0.5)); chip(270, 92, 'local.region', MUT, pop(u, 0.7));
      tx(560, 100, 'locals 는 파일 안에서 계산용', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(560, 130, '이것만으로는 모듈에 전달되지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    // 루트 inputs
    ['company', 'region'].forEach((n, i) => chip(80 + i * 105, 92, n, INFO, at(c, 1, 0.3 + i * 0.2)));
    chip(345, 92, 'tags{ManagedBy, Owner}', INFO, at(c, 1, 0.8), { fs: 13.5 });
    if (k === 1) { tx(560, 100, 'inputs 에 담아야 모듈로 간다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(560, 130, '공통 태그도 여기서 한 번만', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    layer(1, at(c, 2, 0.2));
    if (k === 2) { grow(240, 150, 240, 110, E(u, 0.8, 1.3), BAD, { dash: '5 4' }); if (u > 1.3) cross(260, 128, 12, pop(u, 1.3));
      tx(300, 134, 'include → include ✗', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
      tx(560, 210, 'include 된 파일은', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(560, 238, '다시 include 할 수 없다', { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    chip(80, 212, 'env', WARN, at(c, 3, 0.2)); chip(230, 212, 'tags{Environment}', WARN, at(c, 3, 0.4));
    if (k === 3) { // shallow 와 deep 비교
      [['shallow (기본값)', false, 60], ['deep', true, 220]].forEach(([n, deep, y], i) => { const op = fade(u, 0.8 + i * 0.6);
        tx(520, y, n, { 'font-size': 16, 'font-weight': 800, fill: deep ? GOOD : BAD, opacity: op });
        [['ManagedBy', INFO], ['Owner', INFO], ['Environment', WARN]].forEach(([kk, col], j) => { const kept = deep || j === 2;
          mono(540, y + 32 + j * 26, (kept ? '' : '') + kk, { 'font-size': 14.5, 'font-weight': 700, fill: kept ? col : OFF, 'text-decoration': kept ? null : 'line-through', opacity: op }); });
        (deep ? check : cross)(720, y + 56, 14, pop(u, 1.2 + i * 0.6)); });
      tx(560, 400, 'tags 같은 맵은 merge_strategy 에 달렸다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    layer(2, at(c, 4, 0.2));
    if (k >= 4) { const g = gr(c, 4, 0.6, 1.4);
      el('path', { d: 'M440,300 C490,300 490,85 462,85', fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': `${g * 300} 300` });
      el('path', { d: 'M440,320 C480,320 480,205 462,205', fill: 'none', stroke: WARN, 'stroke-width': 2.4, 'stroke-dasharray': `${g * 200} 200` });
      mono(36, 318, 'include "root"  ·  include "env"', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fa(c, 4, 0.4) });
      mono(36, 342, 'merge_strategy = "deep"', { 'font-size': 14, fill: GOOD, opacity: fa(c, 4, 1.4) }); }
    if (k === 4) { tx(560, 330, '위 두 파일을 블록 둘로 받는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    chip(110, 366, 'vpc_cidr', ACC, at(c, 5, 0.3)); chip(240, 366, 'name', ACC, at(c, 5, 0.5)); chip(360, 366, 'source', ACC, at(c, 5, 0.7));
    if (k === 5) { tx(560, 330, '이 모듈만의 값만 적는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(560, 358, 'company · region 은 다시 안 적는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); return; }
    // 오른쪽: 합친 결과
    zone(520, 30, 420, 370, '모듈에 전달되는 inputs', { fill: SOFT });
    const RES = [['company', '"mycompany"', INFO], ['region', '"ap-northeast-2"', INFO], ['env', '"dev"', WARN], ['vpc_cidr', '"10.10.0.0/16"', ACC], ['name', '"dev-vpc"', ACC]];
    RES.forEach(([kk, v, col], i) => { const s = k === 6 ? seg(u, 0.2 + i * 0.3, 0.7 + i * 0.3) : 1; kv(540, 74 + i * 34, kk, v, col, clamp(s * 2)); });
    if (k === 7) { mono(540, 260, 'tags = {', { 'font-size': 14 });
      [['ManagedBy', '"Terragrunt"', INFO], ['Owner', '"platform-team"', INFO], ['Environment', '"dev"', WARN]].forEach(([kk, v, col], i) => kv(560, 288 + i * 28, kk, v, col, fade(u, 0.4 + i * 0.4)));
      mono(540, 376, '}', { 'font-size': 14 });
      tx(920, 392, '색 = 온 층', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) }); }
    if (k === 6) tx(730, 300, '같은 키가 겹치면 아래층이 이긴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }

  // ---------- 4. run-all ----------
  const N = { vpc: [140, 150], rds: [430, 80], eks: [430, 220], app: [720, 150] };
  const WAVE = { vpc: 0, rds: 1, eks: 1, app: 2 };
  function unit(n, o) { o = o || {}; const [x, y] = N[n], col = o.col || INK;
    card(x, y, 150, 64, { rx: 10, stroke: col, sw: o.on ? 3 : 2, fill: o.fill || PANEL, op: o.op, s: o.s });
    mono(x, y - 4, n + '/', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: o.op ?? 1 });
    if (o.p != null) { el('rect', { x: x - 55, y: y + 10, width: 110, height: 8, rx: 4, fill: SOFT, opacity: o.op ?? 1 }); el('rect', { x: x - 55, y: y + 10, width: 110 * clamp(o.p), height: 8, rx: 4, fill: col, opacity: o.op ?? 1 }); } }
  function edges(op) { [['vpc', 'rds'], ['vpc', 'eks'], ['rds', 'app'], ['eks', 'app']].forEach(([a, b]) => { const [x1, y1] = N[a], [x2, y2] = N[b];
    el('line', { x1: x1 + 76, y1, x2: x2 - 78, y2, stroke: GRID, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ah)', opacity: op ?? 1 }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 6) { edges(0.4); Object.keys(N).forEach((n) => unit(n, { op: 0.6 }));
      terminal(200, 250, 560, 160, ['$ terragrunt run-all output', 'vpc_id           = …', 'db_endpoint      = …', 'cluster_endpoint = …', 'app_url          = …'], 1 + E(u, 0.3, 2.0) * 4, { fs: 14 });
      return; }
    edges();
    mono(30, 36, ['run-all apply', 'run-all apply --terragrunt-non-interactive', 'run-all plan --terragrunt-include-dir vpc, rds', 'run-all apply --terragrunt-exclude-dir eks', 'run-all destroy', 'cd app && terragrunt destroy …'][k], { 'font-size': 15, 'font-weight': 800, fill: k === 4 ? BAD : ACC });
    Object.keys(N).forEach((n) => { const w = WAVE[n];
      if (k === 0 || k === 1) { const p = E(u, 0.3 + w * 0.75, 0.95 + w * 0.75); unit(n, { p, col: p >= 1 ? GOOD : p > 0 ? ACC : INK, on: p > 0 && p < 1 }); }
      if (k === 2) { const inc = n === 'vpc' || n === 'rds'; unit(n, { op: inc ? 1 : 0.3, col: inc ? ACC : MUT, p: inc ? E(u, 0.6 + (n === 'rds') * 0.6, 1.2 + (n === 'rds') * 0.6) : null }); }
      if (k === 3) { const ex = n === 'eks'; unit(n, { op: ex ? 0.35 : 1, col: ex ? MUT : ACC, p: ex ? null : E(u, 0.3 + w * 0.6, 0.9 + w * 0.6) }); if (ex) cross(N.eks[0], N.eks[1], 18, pop(u, 0.4)); }
      if (k === 4) { const s = 1 - 0.3 * E(u, 0.8, 1.6); unit(n, { col: BAD, fill: u > 0.8 ? BADBG : PANEL, s }); }
      if (k === 5) { const ord = { app: 0, eks: 1, rds: 2, vpc: 3 }[n], d = seg(u, 0.3 + ord * 0.55, 0.8 + ord * 0.55);
        unit(n, { col: d >= 1 ? OFF : BAD, op: 1 - 0.6 * d, p: 1 - d });
        card(N[n][0] + 70, N[n][1] - 34, 30, 30, { rx: 15, text: String(ord + 1), fs: 14, fw: 800, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.2 + ord * 0.55) }); } });
    const say = (s, col, d) => tx(480, 330, s, { 'font-size': 16, 'font-weight': 800, fill: col || INK, 'text-anchor': 'middle', opacity: fade(u, d ?? 2.2) });
    if (k === 0) { ['1차: vpc', '2차: rds · eks 동시', '3차: app'].forEach((s, i) => mono(140 + i * 290, 300, s, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.95 + i * 0.75) }));
      say('순서를 외우지 않아도 의존 그래프가 정한다', INK, 2.4); }
    if (k === 1) { card(840, 300, 120, 44, { rx: 8, text: 'y / n ?', fs: 16, mono: true, stroke: GRID, s: 1 }); if (u > 0.4) cross(840, 300, 16, pop(u, 0.4));
      tx(60, 300, '--terragrunt-parallelism 4', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
      for (let i = 0; i < 4; i++) el('rect', { x: 60 + i * 46, y: 318, width: 40, height: 26, rx: 5, fill: i < (u > 1.05 && u < 1.8 ? 2 : u > 0.3 ? 1 : 0) ? ACC : SOFT, stroke: GRID });
      tx(60, 376, '동시에 최대 4개 · 승인 프롬프트 없이', { 'font-size': 14.5, fill: MUT }); }
    if (k === 2) say('지정한 두 모듈만 plan  (terraform plan × 2)', ACC, 1.8);
    if (k === 3) { say('eks 를 빼고 apply', ACC, 1.6); tx(720, 220, 'eks output 이 필요하면 mock 이 있어야 한다', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 4) say('확인 한 번에 환경 전체가 지워진다 · 운영에서는 쓰지 않는다', BAD, 1.6);
    if (k === 5) say('생성의 역순으로 하나씩, 매번 무엇이 지워지는지 본다', INK, 2.4); }

  // ---------- 5. dependency ----------
  const U = { vpc: 150, rds: 480, app: 810 };
  function ucard(n, s, o) { o = o || {}; const x = U[n]; fileCard(x - 125, 60, 250, 120, 'live/dev/' + n + '/', { op: clamp(s * 1.5), stroke: o.col || INK, color: o.col || INK });
    if (o.sub) o.sub.forEach((l, i) => mono(x - 112, 108 + i * 22, l, { 'font-size': 13.5, fill: MUT, opacity: clamp(s * 1.5) })); }
  function depArrow(a, b, g, label, op) { const x1 = U[a] - 125, x2 = U[b] + 125, y = a === 'app' && b === 'vpc' ? 40 : 120;
    if (a === 'app' && b === 'vpc') { el('path', { d: `M${U.app},60 C${U.app},20 ${U.vpc},20 ${U.vpc},58`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': `${g * 760} 760`, opacity: op ?? 1 }); if (label) mono((U.app + U.vpc) / 2, 22, label, { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: g }); return; }
    grow(x1, y, x2 + 4, y, g, ACC, { dash: '6 4' }); if (label) mono((x1 + x2) / 2, y - 10, label, { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: g }); }
  function s5(t, c) { const { k, u } = c;
    const outV = k === 2 ? null : ['vpc_id', 'subnet_ids'];
    ucard('vpc', 1, { col: INFO, sub: k === 2 ? ['아직 apply 전', 'outputs 없음'] : ['outputs:', 'vpc_id, subnet_ids'] });
    ucard('rds', 1, { sub: ['include "root"', 'source = modules//rds'].concat(k >= 1 ? ['dependency "vpc"'] : []) });
    if (k >= 1) depArrow('rds', 'vpc', gr(c, 1, 0.4, 1.2), '../vpc', 1);
    const ry = 230;
    if (k === 0) { tx(380, ry, 'inputs.subnet_ids =', { 'font-size': 15, class: 'mono' }); mono(560, ry, '???', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      tx(380, ry + 40, '이대로면 vpc 의 ID 를 손으로 옮겨 적는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 1) tx(480, ry, 'rds 는 vpc 에 의존한다 → vpc 가 먼저', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    if (k === 2) { ['vpc_id = "vpc-mock-000"', 'subnet_ids = ["subnet-mock-a", "subnet-mock-b"]'].forEach((s, i) => mono(250, ry + i * 26, s, { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }));
      mono(250, ry - 30, 'mock_outputs', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      [['plan', true], ['validate', true], ['apply', false]].forEach(([n, ok], i) => { const x = 330 + i * 150;
        card(x, 340, 130, 40, { rx: 20, text: n, fs: 15, mono: true, fw: 800, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, s: pop(u, 1.2 + i * 0.3) });
        (ok ? check : cross)(x + 75, 322, 9, pop(u, 1.5 + i * 0.3)); });
      return; }
    if (k >= 3 && k <= 7) { // 실제 output → input
      const s = k === 3 ? E(u, 0.3, 1.3) : 1;
      ['vpc_id', 'subnet_ids'].forEach((n, i) => { chip(U.vpc, 210 + i * 40, n, INFO, k === 3 ? pop(u, 0.2 + i * 0.2) : 1);
        if (k === 3) dot([[U.vpc + 60, 210 + i * 40], [U.rds - 80, 210 + i * 40]], seg(u, 0.8 + i * 0.3, 1.6 + i * 0.3), INFO, 6);
        mono(U.rds - 80, 215 + i * 40, 'dependency.vpc.outputs.' + n, { 'font-size': 13.5, fill: INFO, opacity: k === 3 ? fade(u, 1.5 + i * 0.3) : 0.5 }); });
      if (k === 3) { tx(480, 360, '참조 한 줄이 곧 배선 · 사람이 ID 를 옮겨 적지 않는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; } }
    if (k >= 4) { ucard('app', at(c, 4, 0.2), { col: ACC, sub: ['dependency "vpc"'].concat(k >= 5 ? ['dependency "rds"'] : []) });
      depArrow('app', 'vpc', gr(c, 4, 0.5, 1.5), 'app → vpc', 1); }
    if (k >= 5) { depArrow('app', 'rds', gr(c, 5, 0.3, 1.0), null, 1);
      chip(U.rds, 300, 'db_endpoint', WARN, at(c, 5, 0.6));
      if (k === 5) mono(U.app - 110, 230, 'mock: "mock-db.local:5432"', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.2) }); }
    if (k === 6) { ['vpc_id', 'subnet_ids', 'db_endpoint'].forEach((n, i) => { const col = i < 2 ? INFO : WARN, from = i < 2 ? [U.vpc + 60, 210 + i * 40] : [U.rds + 60, 300];
        dot([from, [U.app - 40, 250 + i * 40]], seg(u, 0.3 + i * 0.4, 1.2 + i * 0.4), col, 6);
        chip(U.app + 20, 250 + i * 40, n, col, pop(u, 1.2 + i * 0.4)); });
      tx(480, 400, '두 모듈의 output 이 app 의 inputs 에서 만난다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); }
    if (k === 7) { ['vpc', 'rds', 'app'].forEach((n, i) => card(U[n] + 105, 52, 34, 34, { rx: 17, text: String(i + 1), fs: 16, fw: 800, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3 + i * 0.4) }));
      tx(480, 400, '선언된 dependency 를 모아 순서를 스스로 정한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }

  const quiz = [
    { q: 'terragrunt apply를 치면 실제로 인프라를 바꾸는 것은 무엇인가?',
      o: ['Terragrunt 자체 엔진', 'Terragrunt가 안에서 호출하는 terraform apply', 'AWS CLI'], a: 1,
      why: 'Terragrunt는 앞단에서 설정을 모아 주는 래퍼다. 실제 plan과 apply는 그대로 Terraform이 한다.' },
    { q: 'live/dev/vpc의 state key가 dev/vpc/terraform.tfstate로 정해지는 이유는 무엇인가?',
      o: ['자식 파일에 key를 직접 적었기 때문이다', 'S3 버킷이 폴더를 자동으로 만들기 때문이다', '루트 remote_state의 key가 path_relative_to_include()로 경로를 쓰기 때문이다'], a: 2,
      why: '루트에 key 규칙을 한 번만 적고, 경로 함수가 자식 폴더 위치를 넣는다. 폴더가 곧 state 슬롯이 된다.' },
    { q: '루트 tags{ManagedBy, Owner}와 env.hcl의 tags{Environment}를 include로 받을 때, 세 키가 모두 남으려면 무엇이 필요한가?',
      o: ['include 블록에 merge_strategy = "deep"', 'env.hcl에 include "root" 추가', '아무것도 필요 없다. 기본이 합치기다'], a: 0,
      why: '기본값 shallow는 tags 맵을 통째로 바꾼다. deep일 때 안쪽 키끼리 합쳐진다. include 된 파일은 다시 include 할 수도 없다.' },
    { q: 'vpc → (rds, eks) → app 구조에서 run-all apply는 어떤 순서로 실행하는가?',
      o: ['폴더 이름 알파벳순', 'vpc 다음 rds·eks를 동시에, 마지막에 app', '네 개를 처음부터 동시에'], a: 1,
      why: '의존 그래프를 따라 앞 단계가 끝나야 다음이 시작된다. 서로 의존하지 않는 rds와 eks는 같은 차례에 돈다.' },
    { q: 'vpc가 아직 apply 전인데 rds에서 plan을 돌리려 한다. mock_outputs가 하는 일은 무엇인가?',
      o: ['vpc를 대신 만들어 준다', 'apply 때도 가짜 ID로 rds를 만든다', 'plan·validate에서만 가짜 output을 넣어 준다'], a: 2,
      why: 'mock_outputs_allowed_terraform_commands를 plan, validate로 두면 apply에는 가짜 값이 새어 나가지 않는다.' },
  ];

  const summary = [
    'Terraform만 쓰면 환경 3개와 모듈 5개에 backend 블록 15벌을 복붙하게 된다.',
    'Terragrunt는 remote_state를 루트에 한 번 적고, 자식은 include로 받는다.',
    'include 된 파일은 다시 include 할 수 없고, tags 같은 맵은 deep일 때만 합쳐진다.',
    'dependency 블록이 모듈 사이 배선과 run-all의 실행 순서를 함께 정한다.',
  ];
  const review = [
    { q: 'live/dev/terragrunt.hcl에 include "root"를 넣고, 모듈 폴더도 그 파일을 include 했더니 오류가 났다. 고치는 방법은?',
      o: ['dev 공통 값을 env.hcl로 옮기고 모듈 폴더에 include 블록을 둘 단다', 'find_in_parent_folders()를 두 번 호출한다', 'merge_strategy를 shallow로 바꾼다'], a: 0,
      why: 'include 된 파일은 자기 include 블록을 가질 수 없다. 층이 여럿이면 모듈 폴더가 블록을 여러 개 달아 받는다.' },
    { q: 'run-all apply를 하는데 app이 db_endpoint 없이 실패했다. 먼저 확인할 것은?',
      o: ['S3 버킷 암호화 설정', 'app의 dependency "rds" 블록과 config_path', 'parallelism 값'], a: 1,
      why: 'dependency가 선언돼야 rds가 먼저 돌고 그 output이 app inputs로 들어간다. 빠지면 순서도 값도 보장되지 않는다.' },
    { q: '운영 환경 정리를 맡았다. 가장 안전한 방법은?',
      o: ['live/prod에서 run-all destroy 한 번', '모듈 폴더를 통째로 지운다', 'app부터 vpc까지 생성 역순으로 하나씩 destroy'], a: 2,
      why: 'run-all destroy는 한 번 확인으로 환경 전체를 지운다. 역순으로 하나씩 하면 중간에 멈추고 무엇이 지워지는지 매번 본다.' },
  ];

  R.page({ title: 'Terragrunt 설정 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
