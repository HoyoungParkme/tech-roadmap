/* I-1-2 언어별 SDK — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone,
    cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통 부품 ----------
  const LG = [['TypeScript', INFO], ['Python', WARN], ['Go', GOOD], ['C#', ACC]];
  const LY = [74, 164, 254, 344];
  // 언어 한 줄씩: 왼쪽에 이름 칩, 오른쪽에 그 언어의 코드 (lines: 언어별 [줄…])
  function lanes(lines, k0, k, u, o) { o = o || {}; const w = o.w || 560;
    LG.forEach(([nm, col], i) => { const y = LY[i], first = k === k0, op = first ? fade(u, 0.15 + i * 0.25) : 1;
      el('rect', { x: 16, y: y - 38, width: w, height: 76, rx: 10, fill: SOFT, stroke: o.hot === i ? col : GRID, 'stroke-width': o.hot === i ? 2.4 : 1.4 });
      card(76, y, 104, 34, { rx: 17, stroke: col, sw: 2, text: nm, fs: 14.5, fw: 800, color: col });
      const ls = [].concat(lines[i]);
      ls.forEach((s, j) => R.spans(140, y + 5 + (j - (ls.length - 1) / 2) * 22, R.tokens(s), { 'font-size': 13.5, opacity: op })); }); }
  // 언어 줄에서 오른쪽 한 점으로 모이는 선
  function converge(x, y, k0, k, u, col) { LY.forEach((ly, i) => grow(580, ly, x, y + (i - 1.5) * 10, k === k0 ? E(u, 0.9 + i * 0.15, 1.5 + i * 0.15) : 1, col || ACC)); }
  const note = (s, u0, u, col, x, y) => tx(x || 760, y || 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, u0) });
  function bucketIcon(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INFO;
    el('path', { d: 'M-22,-16 L-16,22 H16 L22,-16 Z', fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); el('ellipse', { cx: 0, cy: -16, rx: 22, ry: 7, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); }
  function doc(cx, cy, w, h, title, rows, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2, col = o.col || INK, g = R.G(0, 0, 1, o.op);
    el('path', { d: `M${x},${y} H${x + w - 14} L${x + w},${y + 14} V${y + h} H${x} Z`, fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
    mono(x + 10, y + 20, title, { 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    (rows || []).forEach((r, i) => mono(x + 10, y + 41 + i * 20, r, { 'font-size': 13.5, fill: o.rowCol || MUT }, g)); }

  // =========================================================
  // 1. 범용 언어 — 배열 · 반복 · 조건을 그대로
  // =========================================================
  const L1 = [
    [['import * as aws from "@pulumi/aws";'], ['import pulumi_aws as aws'], ['"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/s3"'], ['using Aws = Pulumi.Aws;']],
    [['const envs = ["dev", "staging", "prod"];'], ['envs = ["dev", "staging", "prod"]'], ['envs := []string{"dev", "staging", "prod"}'], ['var envs = new[] { "dev", "staging", "prod" };']],
    [['const buckets = envs.map((env) =>', '  new aws.s3.BucketV2(`images-${env}`, …));'], ['buckets = [aws.s3.BucketV2(f"images-{env}", …)', '           for env in envs]'], ['for _, env := range envs {', '  _, err := s3.NewBucketV2(ctx, …) }'], ['foreach (var env in envs)', '  new Aws.S3.BucketV2($"images-{env}", …);']],
    [['if (env === "prod") { /* 추가 리소스 */ }'], ['if env == "prod":', '    pass  # prod만 추가 설정'], ['if err != nil {', '    return err }'], ['// C# 의 foreach / LINQ 그대로']],
  ];
  const ENV = ['dev', 'staging', 'prod'];
  function s1(t, c) { const { k, u } = c;
    lanes(L1[k], k, k, u);
    if (k === 0) { card(780, 210, 250, 70, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: pop(u, 0.6) });
      mono(780, 206, 'pulumi-aws', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      tx(780, 228, 'provider 하나', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
      converge(655, 210, 0, k, u); note('import 문법만 다르고 부르는 대상은 같다', 1.8, u, INK, 780, 320); return; }
    // 환경 칩 (오른쪽 위)
    ENV.forEach((e, i) => pill(660 + i * 100, 64, e, INK, k === 1 ? pop(u, 0.9 + i * 0.25) : 1, { mono: true, fs: 15 }));
    if (k === 1) { converge(640, 64, 1, k, u, GRID); note('환경 목록은 그냥 배열이다', 1.8, u, INK, 760, 200); note('variable 블록이 필요 없다', 2.0, u, MUT, 760, 228); return; }
    // 반복: 커서가 칩을 하나씩 지나며 버킷을 찍는다
    const n = k === 2 ? clamp(Math.floor((u - 0.3) / 0.6) + 1, 0, 3) : 3;
    if (k === 2 && u > 0.3 && u < 2.1) { const i = Math.min(2, Math.floor((u - 0.3) / 0.6)); el('rect', { x: 620 + i * 100, y: 48, width: 80, height: 32, rx: 16, fill: 'none', stroke: ACC, 'stroke-width': 3 }); }
    ENV.forEach((e, i) => { if (i >= n) return; const y = 140 + i * 72, s = k === 2 ? pop(u, 0.35 + i * 0.6) : 1;
      bucketIcon(660, y, s, i === 2 && k === 3 ? ACC : INFO);
      if (s > 0.6) { mono(696, y - 4, `images-${e}-2026`, { 'font-size': 15, 'font-weight': 700 }); mono(696, y + 18, `tags: Env=${e}`, { 'font-size': 13.5, fill: MUT }); } });
    if (k === 2) { mono(940, 380, `BucketV2 × ${n}`, { 'text-anchor': 'end', 'font-size': 17, 'font-weight': 800, fill: ACC }); note('count · for_each 없이 언어의 반복 그대로', 2.2, u, MUT, 760, 404); return; }
    // k3: if 문 — prod 만 통과
    ENV.forEach((e, i) => { const y = 140 + i * 72, s = pop(u, 0.4 + i * 0.35);
      (i === 2 ? check : cross)(900, y, 10, s); });
    card(800, 362, 250, 40, { rx: 10, stroke: ACC, dash: '6 4', sw: 2, text: 'prod 전용 추가 리소스 자리', fs: 14, color: ACC, s: pop(u, 1.6) });
    note('4개 언어 → 같은 3개 버킷', 2.1, u, GOOD, 760, 408); }

  // =========================================================
  // 2. 같은 버킷 하나를 4개 언어로
  // =========================================================
  const L2 = [
    [['import * as pulumi from "@pulumi/pulumi";', 'import * as aws from "@pulumi/aws";'], ['import pulumi', 'import pulumi_aws as aws'], ['import ( "…/pulumi-aws/sdk/v6/go/aws/s3"', '         "…/pulumi/sdk/v3/go/pulumi" )'], ['using Pulumi;', 'using Aws = Pulumi.Aws;']],
    [['new aws.s3.BucketV2("images", {', '  bucket: "images-prod-2026", … })'], ['aws.s3.BucketV2("images",', '    bucket="images-prod-2026", …)'], ['s3.NewBucketV2(ctx, "images", &s3.BucketV2Args{', '  Bucket: pulumi.String("images-prod-2026"), …})'], ['new Aws.S3.BucketV2("images", new()', '{ Bucket = "images-prod-2026", … });']],
    [['tags: { Env: "prod", Team: "platform" }'], ['tags={"Env": "prod", "Team": "platform"}'], ['Tags: pulumi.StringMap{', '  "Env": pulumi.String("prod"), … }'], ['Tags = { { "Env", "prod" },', '         { "Team", "platform" } }']],
    [['export const bucketName = bucket.bucket;'], ['pulumi.export("bucketName", bucket.bucket)'], ['ctx.Export("bucketName", bucket.Bucket)'], ['return new Dictionary<string, object?>', '  { ["bucketName"] = bucket.Bucket };']],
  ];
  function s2(t, c) { const { k, u } = c;
    lanes(L2[k], k, k, u, { hot: k === 2 ? 2 : null });
    if (k === 0) { card(780, 210, 250, 70, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: pop(u, 0.6) });
      mono(780, 206, 'pulumi-aws', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      tx(780, 228, '들어가는 문 4개, 도착은 하나', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.9) });
      converge(655, 210, 0, k, u); return; }
    // 버킷 하나 + 두 이름
    bucketIcon(700, 150, k === 1 ? pop(u, 0.8) : 1, INFO);
    converge(670, 150, 1, k, u, k === 1 ? ACC : GRID);
    const ls = k === 1 ? fade(u, 1.4) : 1;
    pill(830, 112, '"images"', ACC, k === 1 ? pop(u, 1.3) : 1, { mono: true, fs: 14.5 }); tx(830, 146, '논리 이름 · Pulumi 안', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: ls });
    pill(830, 186, 'images-prod-2026', INFO, k === 1 ? pop(u, 1.6) : 1, { mono: true, fs: 14.5 }); tx(830, 220, '실제 이름 · AWS', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: ls });
    if (k === 1) return;
    // 태그 표
    const tg = [['Env', 'prod'], ['Team', 'platform']];
    el('rect', { x: 640, y: 248, width: 290, height: 92, rx: 10, fill: PANEL, stroke: k === 2 ? ACC : GRID, 'stroke-width': 2 });
    tx(656, 270, 'tags', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    tg.forEach(([a, b], i) => { const op = k === 2 ? fade(u, 1.4 + i * 0.3) : 1; mono(670, 298 + i * 26, a, { 'font-size': 15, 'font-weight': 700, opacity: op }); mono(780, 298 + i * 26, '= ' + b, { 'font-size': 15, opacity: op }); });
    if (k === 2) { LY.forEach((y, i) => fly(560, y, 720, 264, seg(u, 0.2 + i * 0.15, 0.8 + i * 0.15), ['객체', 'dict', 'StringMap', '이니셜라이저'][i], { fill: LG[i][1] }));
      note('Go만 pulumi.String으로 감싼다 (정적 Input 타입)', 2.1, u, GOOD, 760, 380); return; }
    // k3: stack output
    card(785, 382, 290, 42, { rx: 21, stroke: GOOD, sw: 2.4, fill: C.GOODBG, text: 'bucketName = images-prod-2026', fs: 14, mono: true, color: GOOD, s: pop(u, 1.2) });
    LY.forEach((y, i) => grow(580, y, 640, 380, E(u, 0.3 + i * 0.15, 0.9 + i * 0.15), GOOD)); }

  // =========================================================
  // 3. SDK 패키지 — 설치 · import · 의존성 파일
  // =========================================================
  const L3 = [
    [['npm install @pulumi/aws'], ['pip install pulumi-aws'], ['go get github.com/pulumi/pulumi-aws/sdk/v6/go/aws'], ['dotnet add package Pulumi.Aws']],
    [['import * as aws from "@pulumi/aws";'], ['import pulumi_aws as aws'], ['"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/s3"'], ['using Aws = Pulumi.Aws;']],
    [['package.json', '  "@pulumi/aws": "^6.0.0"'], ['requirements.txt', '  pulumi-aws>=6.0.0'], ['go.mod', '  require …/pulumi-aws/sdk/v6 v6.x.x'], ['image-pipeline.csproj', '  <PackageReference Include="Pulumi.Aws" Version="6.*" />']],
    [['new aws.s3.BucketV2("images", …)'], ['aws.s3.BucketV2("images", …)'], ['s3.NewBucketV2(ctx, "images", …)'], ['new Aws.S3.BucketV2("images", …)']],
  ];
  const REG = ['npm', 'PyPI', 'Go 모듈', 'NuGet'];
  function s3(t, c) { const { k, u } = c;
    lanes(L3[k].map((l) => l.map((s) => s.length > 54 ? s.slice(0, 53) + '…' : s)), k, k, u);
    if (k === 0) { REG.forEach((r, i) => { const y = LY[i], s = pop(u, 0.5 + i * 0.25);
        card(760, y, 150, 44, { rx: 8, stroke: LG[i][1], sw: 2, text: r, fs: 15, fw: 800, color: LG[i][1], s });
        dot([[740, y], [600, y]], seg(u, 1.0 + i * 0.25, 1.7 + i * 0.25), LG[i][1], 6); });
      tx(900, 214, '언어의', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) }); tx(900, 236, '기존 저장소', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    if (k === 1) { [['패키지 전체', 0], ['패키지 전체', 1], ['서비스 단위 (s3)', 2], ['네임스페이스 별칭', 3]].forEach(([s, i]) => pill(780, LY[i], s, i === 2 ? GOOD : MUT, pop(u, 0.6 + i * 0.25), { fs: 14 }));
      note('Go는 서비스별로, 나머지는 aws 전체를 부른다', 1.9, u, GOOD, 780, 404); return; }
    if (k === 2) { const ls = pop(u, 0.8); lock(760, 214, true, ACC, ls * 1.4);
      tx(800, 200, 'SDK 버전 =', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); tx(800, 224, 'provider 버전', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      tx(800, 252, '파일로 팀 전체를 고정', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); return; }
    // k3: 얇은 SDK → 같은 provider 플러그인 → AWS API
    LY.forEach((y, i) => { el('rect', { x: 590, y: y - 16, width: 64, height: 32, rx: 6, fill: PANEL, stroke: LG[i][1], 'stroke-width': 2, opacity: fade(u, 0.2) }); mono(622, y + 5, 'SDK', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: LG[i][1], opacity: fade(u, 0.2) });
      grow(656, y, 724, 210 + (i - 1.5) * 14, E(u, 0.4 + i * 0.1, 0.9 + i * 0.1), GRID); dot([[656, y], [724, 210]], ((u * 0.7 + i * 0.25) % 1), LG[i][1], 5); });
    card(800, 210, 150, 84, { rx: 10, stroke: ACC, sw: 2.6, fill: ACCBG, s: pop(u, 0.8) });
    mono(800, 196, 'pulumi-', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); mono(800, 214, 'resource-aws', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
    tx(800, 236, 'provider (v6)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1) });
    grow(800, 254, 800, 300, E(u, 1.3, 1.7), ACC); card(800, 330, 150, 52, { rx: 10, stroke: INFO, sw: 2, text: 'AWS API', fs: 15, fw: 800, color: INFO, s: pop(u, 1.7) });
    note('설치 경로가 달라도 같은 API를 부른다', 2.2, u, INK, 760, 404); }

  // =========================================================
  // 4. Pulumi.yaml — runtime 한 줄이 언어를 정한다
  // =========================================================
  const RT = [['nodejs', 'index.ts', 'pulumi-language-nodejs', ['package.json', 'tsconfig.json', 'index.ts', 'node_modules/']],
    ['python', '__main__.py', 'pulumi-language-python', ['requirements.txt', '__main__.py', 'venv/']],
    ['go', 'main.go', 'pulumi-language-go', ['go.mod', 'go.sum', 'main.go']],
    ['dotnet', 'Program.cs', 'pulumi-language-dotnet', ['image-pipeline.csproj', 'Program.cs', 'bin/  obj/']]];
  function yaml(x, y, rtIdx, hiRow, u0, u) { const rows = ['name: image-pipeline', 'runtime: ' + RT[rtIdx][0], 'description: 이미지 업로드 파이프라인'];
    el('rect', { x, y, width: 330, height: 120, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 24, 'Pulumi.yaml', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    rows.forEach((s, i) => { if (i === hiRow) el('rect', { x: x + 6, y: y + 36 + i * 26, width: 318, height: 24, rx: 4, fill: ACCBG, opacity: fade(u, u0) });
      mono(x + 14, y + 53 + i * 26, s, { 'font-size': 14, 'font-weight': i === hiRow ? 800 : 500, fill: i === hiRow ? ACC : INK }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { yaml(40, 60, 0, 0, 0.2, u);
      const parts = [['urn:pulumi:', MUT], ['<stack>', MUT], ['::', MUT], ['image-pipeline', ACC], ['::aws:s3/bucketV2:BucketV2::images', MUT]];
      let x = 60; parts.forEach(([s, col], i) => { mono(x, 260, s, { 'font-size': 16, 'font-weight': col === ACC ? 800 : 500, fill: col, opacity: fade(u, 0.8 + i * 0.1) }); if (col === ACC) { grow(205, 186, x + tw(s, 16) / 2, 240, E(u, 0.6, 1.2), ACC); } x += tw(s, 16); });
      card(720, 120, 300, 110, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 1.4) });
      tx(720, 106, 'Pulumi Cloud', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); mono(720, 134, 'Project: image-pipeline', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      note('Pulumi.yaml이 있는 폴더 하나 = program 하나', 2.0, u, INK, 480, 340); return; }
    if (k === 1) { const i = Math.min(3, Math.floor(clamp((u - 0.2) / 2.4) * 4));
      yaml(40, 60, i, 1, 0.2, u);
      RT.forEach(([r, entry], j) => { const on = j === i, x = 470 + (j % 2) * 230, y = 90 + Math.floor(j / 2) * 110;
        card(x + 100, y, 210, 80, { rx: 12, stroke: on ? LG[j][1] : GRID, sw: on ? 2.8 : 1.5, fill: on ? PANEL : SOFT });
        mono(x + 100, y - 6, 'runtime: ' + r, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: on ? LG[j][1] : MUT });
        mono(x + 100, y + 20, '→ ' + entry, { 'text-anchor': 'middle', 'font-size': 14, fill: on ? INK : MUT }); });
      note('이 값 하나로 실행 방식이 통째로 바뀐다', 1.0, u, ACC, 480, 380); return; }
    if (k === 2) { RT.forEach(([r, entry, lh, files], j) => { const x = 30 + j * 232, s = pop(u, 0.2 + j * 0.3);
        card(x + 106, 80, 200, 40, { rx: 10, stroke: LG[j][1], sw: 2, text: 'runtime: ' + r, fs: 14, mono: true, color: LG[j][1], s });
        ['Pulumi.yaml'].concat(files).forEach((f, i) => { const y = 132 + i * 30, op = fade(u, 0.5 + j * 0.3 + i * 0.12), hot = f === entry;
          el('path', { d: `M${x + 18},${y - 18} V${y - 5} H${x + 30}`, fill: 'none', stroke: GRID, 'stroke-width': 1.5, opacity: op });
          mono(x + 36, y, f, { 'font-size': 14, 'font-weight': hot ? 800 : 500, fill: hot ? LG[j][1] : INK, opacity: op }); }); });
      note('언어의 표준 프로젝트 구조를 그대로 쓴다', 2.0, u, MUT, 480, 380); return; }
    // k3: pulumi up → 언어 호스트 → 엔진 → provider
    const i = Math.min(3, Math.floor(clamp((u - 0.2) / 2.4) * 4));
    pill(110, 60, '$ pulumi up', INK, pop(u, 0.1), { mono: true, fs: 15 });
    yaml(30, 100, i, 1, 0.1, u);
    RT.forEach(([r, entry, lh], j) => { const on = j === i, y = 270 + j * 0; if (!on) return;
      card(260, 330, 300, 70, { rx: 12, stroke: LG[j][1], sw: 2.6, fill: PANEL });
      mono(260, 324, lh, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: LG[j][1] });
      mono(260, 348, '실행: ' + entry, { 'text-anchor': 'middle', 'font-size': 14, fill: INK }); });
    tx(260, 285, '언어 호스트 (바뀜)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT });
    [['엔진', 'state 비교 · 계획', 560], ['provider', 'pulumi-resource-aws', 800]].forEach(([a, b, x], j) => {
      card(x, 330, 200, 70, { rx: 12, stroke: INK, sw: 2.2, s: pop(u, 0.4 + j * 0.3) });
      tx(x, 324, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); mono(x, 348, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      tx(x, 285, '그대로', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD }); });
    grow(412, 330, 456, 330, 1, MUT); grow(662, 330, 696, 330, 1, MUT);
    dot([[410, 330], [460, 330], [660, 330], [700, 330]], ((u * 0.8) % 1), ACC, 6);
    tx(640, 160, '파일 구조는 달라도', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
    tx(640, 188, '등록을 받는 엔진과 provider는 하나', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.1) }); }

  // =========================================================
  // 5. 실무 선택 — 팀 언어 + IDE
  // =========================================================
  function editor(x, y, w, h, lines, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 22, o.title || 'index.ts', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    lines.forEach((s, i) => { mono(x + 14, y + 52 + i * 24, String(i + 1), { 'font-size': 13.5, fill: OFF }); R.spans(x + 40, y + 52 + i * 24, R.tokens(s), { 'font-size': 14 }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const T = [['Node · 프론트 팀'], ['데이터 · ML 팀'], ['플랫폼 · 인프라 팀'], ['.NET · Azure 팀']];
      T.forEach(([team], i) => { const y = LY[i], s = pop(u, 0.2 + i * 0.3);
        R.person(110, y - 4, null, { s: 0.75 * s }); tx(150, y + 5, team, { 'font-size': 16, 'font-weight': 700, opacity: s > 0.8 ? 1 : 0 });
        grow(380, y, 560, y, E(u, 0.5 + i * 0.3, 1.0 + i * 0.3), LG[i][1]);
        card(660, y, 180, 44, { rx: 22, stroke: LG[i][1], sw: 2.4, text: LG[i][0], fs: 16, fw: 800, color: LG[i][1], s: pop(u, 0.9 + i * 0.3) }); });
      tx(870, 210, '정답 언어는', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); tx(870, 234, '없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
      return; }
    if (k === 1) { editor(40, 60, 460, 200, ['const bucket = new aws.s3.BucketV2("images", {', '  bucket: "images-prod-2026",', '});', 'export const arn = bucket.' + (u > 0.6 ? '' : '')]);
      const pop1 = pop(u, 0.9), items = [['arn', 'Output<string>'], ['bucket', 'Output<string>'], ['id', 'Output<string>'], ['tags', 'Output<…>']];
      card(400, 270, 260, 132, { rx: 8, stroke: INFO, sw: 2, s: pop1 });
      items.forEach(([a, b], i) => { if (pop1 < 0.8) return; const y = 226 + i * 28;
        if (i === 0) el('rect', { x: 274, y: y - 16, width: 252, height: 24, rx: 4, fill: C.INFOBG });
        mono(286, y, a, { 'font-size': 14.5, 'font-weight': 700, fill: i === 0 ? INFO : INK }); mono(514, y, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
      [['자동완성', '속성 이름'], ['타입 체크', '배포 전 오류'], ['리팩터링', '이름 바꾸기 · 참조 찾기']].forEach(([a, b], i) => { const y = 110 + i * 90, s = pop(u, 1.4 + i * 0.3);
        card(790, y, 270, 66, { rx: 12, stroke: GOOD, sw: 2, fill: C.GOODBG, s }); tx(790, y - 4, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: s > 0.8 ? 1 : 0 }); tx(790, y + 18, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s > 0.8 ? 1 : 0 }); });
      return; }
    if (k === 2) { const L = ['new aws.s3.BucketV2("images", …)', 'aws.s3.BucketV2("images", …)', 's3.NewBucketV2(ctx, "images", …)', 'new Aws.S3.BucketV2("images", …)'];
      lanes(L, 2, k, u, { w: 520 }); LY.forEach((y, i) => grow(540, y, 700, 210 + (i - 1.5) * 12, E(u, 0.9 + i * 0.15, 1.5 + i * 0.15), ACC));
      bucketIcon(740, 210, pop(u, 1.6), ACC); mono(740, 262, 'images-prod-2026', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      tx(740, 290, '언어가 달라도 state에는 같은 리소스', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { editor(40, 50, 560, 160, ['const bucket = new aws.s3.BucketV2("images", {', '  bukcet: "images",', '});']);
      // 빨간 물결 밑줄
      const w = tw('bukcet', 14), x0 = 80 + tw('  ', 14), g = E(u, 0.4, 1.0);
      let d = `M${x0},${132}`; for (let x = 0; x < w * g; x += 6) d += ` q3,${(x / 6) % 2 ? 4 : -4} 6,0`;
      el('path', { d, fill: 'none', stroke: BAD, 'stroke-width': 2 });
      card(420, 290, 760, 96, { rx: 10, stroke: BAD, sw: 2, fill: C.BADBG, s: pop(u, 1.1) });
      mono(56, 272, 'TS2561: Object literal may only specify known properties,', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(56, 296, "but 'bukcet' does not exist in type 'BucketV2Args'.", { 'font-size': 14, fill: BAD, opacity: fade(u, 1.4) });
      mono(56, 320, "Did you mean to write 'bucket'?", { 'font-size': 14, fill: INK, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(700, 130, 'tsc 실제 출력', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
      note('up 전에, 편집기에서 멈춘다', 2.0, u, GOOD, 480, 380); return; }
    // k4: Output<string> — 타입은 지금, 값은 배포 뒤
    editor(40, 50, 520, 110, ['export const arn = bucket.arn;   // Output<string>']);
    const ax = 120, aw = 720; el('line', { x1: ax, y1: 260, x2: ax + aw * E(u, 0.2, 0.9), y2: 260, stroke: MUT, 'stroke-width': 2.5 });
    [['편집', 0.0], ['preview', 0.45], ['up 끝', 1.0]].forEach(([s, f], i) => { const x = ax + aw * f, op = fade(u, 0.4 + i * 0.4);
      el('circle', { cx: x, cy: 260, r: 7, fill: i === 2 ? GOOD : INK, opacity: op }); tx(x, 290, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: op }); });
    pill(ax + 160, 214, '타입: Output<string>', INFO, pop(u, 0.6), { mono: true, fs: 14 });
    pill(ax + 160, 330, '값: ?', WARN, pop(u, 0.9), { mono: true, fs: 14 });
    pill(ax + aw - 120, 330, 'arn:aws:s3:::images-prod-2026', GOOD, pop(u, 1.8), { mono: true, fs: 14 });
    note('타입은 지금 정해지고, 값은 배포가 끝나야 채워진다', 2.2, u, INK, 480, 395); }

  const quiz = [
    { q: 'dev · staging · prod 버킷 세 개를 만들 때, Pulumi에서 반복을 표현하는 방법은 무엇인가?',
      o: ['HCL의 for_each를 흉내 낸 Pulumi 전용 문법', '각 언어의 map · 컴프리헨션 · for range · foreach', '버킷마다 new를 세 번 복사해 쓰는 것만 된다'], a: 1,
      why: '범용 언어라 반복·조건을 언어 문법 그대로 쓴다. 문법은 달라도 만들어지는 BucketV2 세 개는 같다.' },
    { q: 'new aws.s3.BucketV2("images", { bucket: "images-prod-2026" })에서 "images"는 무엇인가?',
      o: ['AWS에 실제로 생기는 버킷 이름', '태그 Env의 값', 'Pulumi 안에서 쓰는 논리 이름 (URN의 name 자리)'], a: 2,
      why: '첫 인자는 Pulumi가 리소스를 구분하는 논리 이름이고, bucket 속성의 images-prod-2026이 AWS의 실제 이름이다.' },
    { q: 'TypeScript는 @pulumi/aws, Go는 pulumi-aws/sdk/v6을 쓴다. 두 SDK가 실제 AWS 호출에 쓰는 것은 무엇인가?',
      o: ['같은 provider 플러그인 pulumi-resource-aws', '언어마다 따로 만든 AWS 호출 코드', '각 언어의 AWS 공식 SDK를 직접'], a: 0,
      why: '언어별 SDK는 같은 provider 플러그인을 감싼 얇은 껍데기다. 그래서 어떤 언어로 써도 같은 AWS API를 부른다.' },
    { q: 'pulumi up이 index.ts를 실행할지 __main__.py를 실행할지는 무엇으로 정해지나?',
      o: ['폴더에 있는 파일 개수', 'Pulumi.yaml의 runtime 값', 'pulumi login 한 backend'], a: 1,
      why: 'runtime이 nodejs면 index.ts, python이면 __main__.py를 실행하는 언어 호스트가 뜬다. 엔진과 provider는 그대로다.' },
    { q: 'TypeScript에서 bucket을 bukcet으로 잘못 적었다. 이 오류는 언제 드러나나?',
      o: ['편집기 · 컴파일 단계에서 TS2561 오류로', 'pulumi up이 AWS를 호출한 뒤에야', '배포가 끝나고 버킷을 열어 봐야'], a: 0,
      why: 'BucketV2Args에 없는 속성이라 tsc가 바로 막는다. 실제 tsc 출력도 bucket을 쓰려던 것이냐고 묻는다.' },
  ];

  const summary = [
    'Pulumi는 TypeScript, Python, Go, C# 같은 범용 언어로 인프라를 쓴다.',
    '반복과 조건은 언어 문법 그대로 쓰고, 어떤 언어로 써도 같은 버킷 세 개가 만들어진다.',
    '언어별 SDK는 이름과 설치법만 다르고 같은 provider 플러그인 pulumi-resource-aws를 부른다.',
    'Pulumi.yaml의 runtime 한 줄이 실행할 언어를 정하고, 고르는 기준은 팀이 잘 쓰는 언어다.',
  ];
  const review = [
    { q: 'Python 팀이 쓰던 Pulumi 코드를 Node 팀이 TypeScript로 다시 썼다. 같은 논리 이름과 속성이라면 state의 리소스는 어떻게 되나?',
      o: ['언어가 바뀌었으니 전부 지우고 다시 만든다', '같은 provider로 같은 리소스를 가리켜 그대로 둔다', 'TypeScript 용 state를 새로 만든다'], a: 1,
      why: '엔진과 provider는 언어와 상관없다. 논리 이름과 타입이 같으면 URN이 같고, state의 리소스도 그대로다.' },
    { q: 'Go로 태그를 Tags: {"Env": "prod"}처럼 문자열 그대로 넣었더니 컴파일이 안 된다. 먼저 의심할 것은?',
      o: ['pulumi.StringMap과 pulumi.String으로 Input 타입을 맞춰야 한다', 'Go SDK는 태그를 지원하지 않는다', 'Pulumi.yaml의 runtime이 nodejs로 되어 있다'], a: 0,
      why: '정적 타입 언어인 Go는 값을 pulumi.String 같은 Input 타입으로 감싼다. 다른 언어는 객체나 dict를 그대로 넘긴다.' },
    { q: '데이터 팀이 처음 IaC를 맡았고 ML 파이프라인은 Python이다. 언어를 고를 때 가장 먼저 볼 것은?',
      o: ['컴파일러가 가장 엄격한 Go', '버킷 생성 속도가 가장 빠른 언어', '팀이 이미 잘 쓰는 언어인 Python'], a: 2,
      why: '어떤 언어든 같은 provider를 거쳐 같은 리소스가 생기니 속도 차이는 없다. 익숙한 언어가 실수를 줄인다.' },
  ];

  R.page({ title: '언어별 SDK', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
