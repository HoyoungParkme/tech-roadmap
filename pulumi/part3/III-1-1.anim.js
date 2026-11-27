/* III-1-1 멀티 클라우드 — 한 프로그램에 AWS·GCP·Azure — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, snippet, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, GOOD, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const COL = { AWS: WARN, GCP: INFO, Azure: ACC };
  // 리소스 한 개: 위에 타입 토큰, 아래에 logical name. o.st = 'plan'(점선, 아직 없음) | 'gone'(지워짐)
  function node(cx, cy, w, type, name, o) { o = o || {}; const col = o.col || INK, h = o.h || 52, plan = o.st === 'plan', gone = o.st === 'gone';
    const g = card(cx, cy, w, h, { rx: 8, stroke: gone ? OFF : col, sw: o.hot ? 3 : 2, dash: plan ? '6 5' : null, fill: o.fill || PANEL, s: o.s, op: o.op });
    mono(-w / 2 + 12, -6, type, { 'font-size': 13.5, fill: gone ? OFF : MUT }, g);
    tx(-w / 2 + 12, 16, name, { 'font-size': 15, 'font-weight': 700, fill: gone ? OFF : plan ? MUT : col, class: 'mono', 'text-decoration': gone ? 'line-through' : null }, g);
    if (o.badge != null) { el('circle', { cx: -w / 2, cy: -h / 2, r: 12, fill: col }, g); tx(-w / 2, -h / 2 + 5, String(o.badge), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: PANEL }, g); }
    return g; }
  function colHead(cx, y, w, name, col, s) { const g = card(cx, y, w, 34, { rx: 8, fill: col, stroke: 'none', s }); tx(0, 6, name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: PANEL }, g); }
  // 아직 값이 없는 Output: 점선 상자 안 '?' → open 이 1 이 되면 값
  function outBox(cx, cy, w, label, val, open, o) { o = o || {}; const g = card(cx, cy, w, 40, { rx: 20, stroke: INFO, sw: 2, dash: open < 1 ? '5 4' : null, fill: INFOBG, s: o.s, op: o.op });
    tx(0, -28, label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: INFO, class: 'mono' }, g);
    if (open < 0.5) tx(0, 7, '?', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: INFO, opacity: 1 - open * 2 }, g);
    if (open >= 0.5) mono(0, 6, val, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INK, opacity: (open - 0.5) * 2 }, g); return g; }
  // 간트: rows [{n, s, e, col}] 를 시각 T(초)까지 채운다
  function gantt(x, y, w, rows, tmax, T, o) { o = o || {}; const rh = o.rh || 30, X = (v) => x + (v / tmax) * w;
    el('line', { x1: x, y1: y + rows.length * rh + 4, x2: x + w, y2: y + rows.length * rh + 4, stroke: MUT, 'stroke-width': 1.5 });
    for (let v = 0; v <= tmax; v += o.step || 5) mono(X(v), y + rows.length * rh + 22, v + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    rows.forEach((r, i) => { const yy = y + i * rh, op = r.op ?? 1;
      mono(x - 10, yy + 19, r.n, { 'font-size': 14, 'text-anchor': 'end', fill: r.dim ? OFF : INK, 'font-weight': 700, opacity: op });
      el('rect', { x, y: yy + 6, width: w, height: 18, rx: 4, fill: SOFT, opacity: op });
      if (r.wait && T < r.s) el('rect', { x: X(0), y: yy + 6, width: Math.max(0, X(Math.min(T, r.s)) - X(0)), height: 18, rx: 4, fill: 'none', stroke: OFF, 'stroke-dasharray': '4 4', opacity: op });
      const e = Math.min(T, r.e); if (e > r.s) el('rect', { x: X(r.s), y: yy + 6, width: X(e) - X(r.s), height: 18, rx: 4, fill: r.col || ACC, opacity: (r.hot ? 1 : 0.85) * op, stroke: r.hot ? INK : 'none', 'stroke-width': 2 });
      if (T >= r.e) mono(X(r.e) + 6, yy + 20, (r.e - r.s) + 's', { 'font-size': 13.5, 'font-weight': 700, fill: r.col || ACC, opacity: op }); });
    return X; }
  // preview 표의 한 줄: + 표시, 타입, 이름
  function planRow(x, y, sign, type, name, col, op) {
    el('rect', { x, y: y - 17, width: 5, height: 22, rx: 2, fill: col || OFF, opacity: op });
    mono(x + 16, y, sign, { 'font-size': 15, 'font-weight': 800, fill: sign === '+' ? GOOD : sign === '-' ? BAD : WARN, opacity: op });
    mono(x + 40, y, type, { 'font-size': 14, fill: MUT, opacity: op }); mono(x + 360, y, name, { 'font-size': 14, 'font-weight': 700, opacity: op }); }

  // ---------- 1. 세 cloud SDK 를 한 파일에 ----------
  const CX = [170, 480, 790], CW = 280;
  const IMPORTS = ['import * as aws from "@pulumi/aws";', 'import * as gcp from "@pulumi/gcp";', 'import * as azure from "@pulumi/azure-native";'];
  const REG = ['ap-northeast-2', 'asia-northeast3', 'koreacentral'], NAMES = ['AWS', 'GCP', 'Azure'];
  function cols(c, on) { NAMES.forEach((n, i) => { const s = on[i]; if (s <= 0) return;
      zone(CX[i] - CW / 2, 150, CW, 250, null, { fill: SOFT, op: Math.min(1, s) });
      colHead(CX[i], 150, CW, n, COL[n], s);
      mono(CX[i], 196, 'pulumi-resource-' + ['aws', 'gcp', 'azure-native'][i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: Math.min(1, s) }); }); }
  function s1(t, c) { const { k, u } = c;
    const code = k === 0 ? IMPORTS : k === 1 ? ['const cfg = new pulumi.Config();', 'const awsRegion = cfg.get("awsRegion") ?? "ap-northeast-2";', 'const gcpRegion = cfg.get("gcpRegion") ?? "asia-northeast3";']
      : k === 2 ? ['const awsProvider = new aws.Provider("aws-seoul", {', '  region: awsRegion as aws.Region,', '});'] : k === 3 ? ['const gcpProvider = new gcp.Provider("gcp-seoul", {', '  project: "my-ml-project",', '  region:  gcpRegion,', '});']
      : k === 4 ? ['// azure-native는 Provider를 따로 안 만들고', '// 리소스 그룹의 location 인자로 위치를 준다'] : ['// 컴퓨팅은 AWS, ML은 GCP, 인증은 Azure', '// 한 변수 그래프 안에서 cross-provider 의존을 잇는다'];
    const shown = k === 0 ? Math.min(3, E(u, 0.1, 1.6) * 3 + 0.01) : code.length;
    snippet(30, 14, code.slice(0, Math.ceil(shown)), { fs: 14.5, w: 900, op: k === 0 ? 1 : fade(u, 0.05, 0.3) });
    const on = k === 0 ? [pop(u, 0.6), pop(u, 1.1), pop(u, 1.6)] : [1, 1, 1];
    if (k === 0) [0, 1, 2].forEach((i) => fly(660, 40 + i * 22, CX[i], 196, seg(u, 0.4 + i * 0.5, 1.0 + i * 0.5), ['@pulumi/aws', '@pulumi/gcp', '@pulumi/azure-native'][i], { mono: true, fill: COL[NAMES[i]] }));
    cols(c, on);
    if (k === 0) { lbl(780, 74, '파일 하나, SDK 세 개', fade(u, 2.0), { fill: INK, 'font-size': 16 }); return; }
    // region: config 에 값이 없으면 ?? 뒤 기본값
    REG.forEach((r, i) => { const s = k === 1 ? E(u, 0.4 + i * 0.35, 1.0 + i * 0.35) : 1;
      el('rect', { x: CX[i] - 110, y: 218, width: 220, height: 30, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      el('rect', { x: CX[i] - 110, y: 218, width: 220 * s, height: 30, rx: 6, fill: COL[NAMES[i]], opacity: 0.15 });
      mono(CX[i], 238, r, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); });
    if (k === 1) { sub(480, 280, 'stack config에 값이 없으면 ?? 뒤의 기본값을 쓴다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 306, 'prod·dev stack마다 다른 region을 config로 줄 수 있다', fade(u, 2.2)); return; }
    // provider 인스턴스
    if (k >= 2) node(CX[0], 300, 230, 'pulumi:providers:aws', 'aws-seoul', { col: WARN, s: k === 2 ? pop(u, 0.4) : 1 });
    if (k >= 3) { node(CX[1], 300, 230, 'pulumi:providers:gcp', 'gcp-seoul', { col: INFO, s: k === 3 ? pop(u, 0.4) : 1 });
      pill(CX[1], 360, 'project: my-ml-project', INFO, k === 3 ? pop(u, 1.1) : 1, { mono: true, fs: 13.5 }); }
    if (k === 2) sub(CX[0], 360, '이름이 있으니 어느 region 인지 보인다', fade(u, 1.2), { fill: INK });
    if (k >= 4) { const s = k === 4 ? pop(u, 0.4) : 1;
      card(CX[2], 290, 230, 44, { rx: 8, stroke: OFF, dash: '6 5', text: 'Provider 따로 없음', fs: 15, color: MUT, s });
      if (k === 4) cross(CX[2] + 100, 270, 9, pop(u, 0.9));
      pill(CX[2], 350, 'location: azureRegion', ACC, k === 4 ? pop(u, 1.3) : 1, { mono: true, fs: 13.5 }); }
    if (k === 4) sub(480, 400, 'cloud마다 위치를 정하는 방법이 다르다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
    if (k === 5) { ['컴퓨팅', 'ML', '인증'].forEach((r, i) => pill(CX[i], 392, r, COL[NAMES[i]], pop(u, 0.3 + i * 0.3), { fs: 15 }));
      grow(CX[0] - 120, 126, CX[2] + 120, 126, E(u, 1.2, 2.2), INK, { sw: 3, plain: true });
      lbl(480, 114, '한 프로그램 · 한 stack · 한 state', fade(u, 1.8), { fill: INK, 'font-size': 16 }); } }

  // ---------- 2. AWS: S3 + Lambda ----------
  const P2 = { b: [150, 110], r: [150, 300], f: [470, 300], n: [470, 110] };
  function s2(t, c) { const { k, u } = c;
    zone(20, 20, 620, 380, 'AWS · ap-northeast-2 · provider: awsProvider', { fill: WARNBG, color: WARN });
    zone(660, 20, 280, 380, null, { fill: SOFT, op: 0.6 });
    tx(800, 200, 'GCP · Azure', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: OFF }); tx(800, 224, '(다음 장면)', { 'text-anchor': 'middle', 'font-size': 14, fill: OFF });
    // S3
    node(P2.b[0], P2.b[1], 200, 'aws:s3:BucketV2', 'imagesBucket', { col: WARN, s: k === 0 ? pop(u, 0.2) : 1, badge: k >= 3 ? 1 : null });
    if (k === 0) { grow(250, 100, 330, 70, E(u, 0.8, 1.3), MUT, { plain: true }); tx(338, 66, 'logical name', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.2) }); sub(400, 86, '프로그램 안에서만 유일하면 된다', fade(u, 1.3));
      grow(250, 124, 330, 160, E(u, 1.5, 2.0), WARN, { plain: true }); mono(338, 166, 'bucket: "images-prod-2026"', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); sub(420, 188, 'cloud에 생기는 실제 이름', fade(u, 2.0)); return; }
    sub(P2.b[0], 152, 'images-prod-2026', 1, { class: 'mono' });
    // IAM 역할
    node(P2.r[0], P2.r[1], 200, 'aws:iam:Role', 'imageResizeRole', { col: WARN, s: k === 1 ? pop(u, 0.2) : 1, badge: k >= 3 ? 1 : null });
    node(P2.f[0], P2.f[1], 200, k >= 3 ? 'aws:lambda:Function' : '(Lambda 자리)', k >= 3 ? 'imageResizeFn' : '역할이 먼저', { col: WARN, st: k >= 3 ? null : 'plan', s: k === 3 ? pop(u, 0.2) : 1, op: k >= 3 ? 1 : fade(u, 0.6), badge: k >= 3 ? 2 : null });
    if (k === 1) { grow(250, 300, 368, 300, E(u, 0.9, 1.6), OFF, { dash: '5 5' }); sub(310, 290, '먼저 필요', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
    if (k === 2) { const lines = ['assumeRolePolicy: {', '  Action: "sts:AssumeRole",', '  Principal: { Service:', '    "lambda.amazonaws.com" },', '}'];
      snippet(290, 138, lines.slice(0, Math.ceil(E(u, 0.2, 1.4) * 5 + 0.01)), { fs: 13.5, w: 300 });
      pill(150, 390, 'lambda.amazonaws.com', WARN, pop(u, 1.6), { mono: true, fs: 13.5 }); grow(150, 374, 150, 330, E(u, 1.9, 2.4), WARN);
      sub(390, 395, '이 서비스가 역할을 맡을 수 있다', fade(u, 2.1), { fill: INK, 'font-weight': 700 }); }
    if (k >= 3) { grow(250, 300, 368, 300, k === 3 ? E(u, 0.6, 1.3) : 1, ACC); if (k === 3 || k === 5) mono(309, 288, 'role.arn', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.2) : 1 }); }
    if (k === 3) { sub(470, 352, '참조 = 의존 선언', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); dot([[250, 300], [368, 300]], seg(u, 1.4, 2.4), ACC, 6); }
    if (k >= 4) { const s = k === 4 ? pop(u, 0.2) : 1;
      node(P2.n[0], P2.n[1], 230, 'aws:s3:BucketNotification', 'imagesNotify', { col: WARN, s, badge: 3 });
      grow(250, 110, 352, 110, k === 4 ? E(u, 0.7, 1.3) : 1, ACC); grow(470, 274, 470, 140, k === 4 ? E(u, 1.0, 1.6) : 1, ACC);
      mono(300, 98, 'bucket.id', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 4 ? fade(u, 1.2) : 1 });
      mono(480, 210, 'fn.arn', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 4 ? fade(u, 1.5) : 1 });
      if (k === 4) { pill(320, 196, 's3:ObjectCreated:*', WARN, pop(u, 1.9), { mono: true, fs: 13.5 }); } }
    if (k === 5) { banner(330, 372, 'AWS 리소스 4개 · 참조로 생긴 의존 3개', pop(u, 0.4));
      sub(800, 270, 'Terraform 단독 구성과', fade(u, 1.2), { 'font-size': 15, fill: MUT }); sub(800, 292, '아직 차이가 없다', fade(u, 1.2), { 'font-size': 15, fill: MUT }); } }

  // ---------- 3. 같은 파일에 GCP ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { // Terraform 에서 state 를 cloud 별로 나눴다면 vs Pulumi
      tx(240, 44, 'Terraform (state를 cloud 별로 나눔)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: MUT });
      tx(720, 44, 'Pulumi (한 프로그램)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC });
      card(120, 140, 180, 60, { rx: 10, stroke: WARN, text: 'aws state\noutput bucket_id', fs: 14, s: pop(u, 0.2) });
      card(360, 140, 180, 60, { rx: 10, stroke: INFO, text: 'gcp state\nremote_state로 읽기', fs: 14, s: pop(u, 0.5) });
      grow(212, 140, 268, 140, E(u, 0.8, 1.4), MUT); dot([[212, 140], [268, 140]], seg(u, 1.4, 2.2), MUT, 6);
      sub(240, 210, 'state 경계를 넘을 때 한 번 더 거친다', fade(u, 1.4), { fill: INK, 'font-weight': 700 });
      card(720, 140, 300, 60, { rx: 10, stroke: ACC, text: 'imagesBucket.id를 바로 쓴다', fs: 15, s: pop(u, 0.9) });
      sub(720, 210, 'state도 하나, 변수도 하나', fade(u, 1.6), { fill: INK, 'font-weight': 700 });
      tx(480, 320, 'Terraform도 한 구성에 여러 provider를 둘 수 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
      tx(480, 346, '차이는 state를 나눴을 때 값을 넘기는 방법이다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k >= 3) zone(12, 12, 616, 396, 'index.ts 한 스코프', { fill: 'none', stroke: INK, dash: '6 5', color: INK, op: k === 3 ? fade(u, 0.2) : 1 });
    zone(24, 40, 280, 360, 'AWS', { fill: WARNBG, color: WARN }); zone(336, 40, 280, 360, 'GCP · provider: gcpProvider', { fill: INFOBG, color: INFO });
    node(164, 130, 230, 'aws:s3:BucketV2', 'imagesBucket', { col: WARN }); node(164, 300, 230, 'aws:lambda:Function', 'imageResizeFn', { col: WARN });
    node(476, 130, 230, 'gcp:storage:Bucket', 'thumbsBucket', { col: INFO, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { pill(476, 196, 'location: gcpRegion', INFO, pop(u, 1.0), { mono: true, fs: 13.5 }); sub(476, 236, '문법은 AWS와 같고 provider만 다르다', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
    if (k >= 1) node(476, 300, 230, 'gcp:vertex:AiEndpoint', 'classifyEndpoint', { col: INFO, s: k === 1 ? pop(u, 0.3) : 1 });
    if (k === 1) sub(476, 356, '분류 모델을 서빙할 엔드포인트', fade(u, 1.0), { fill: INK, 'font-weight': 700 });
    if (k === 2) { const keys = [['awsImagesBucket', 'imagesBucket.id', [164, 130], WARN], ['awsLambdaArn', 'imageResizeFn.arn', [164, 300], WARN], ['gcpThumbsBucket', 'thumbsBucket.url', [476, 130], INFO], ['gcpClassifyId', 'classifyEndpoint.id', [476, 300], INFO]];
      zone(648, 40, 296, 360, 'export pipelineUrls', { fill: PANEL, stroke: INK, color: INK });
      keys.forEach(([kk, v, from, col], i) => { const y = 100 + i * 74, s = fade(u, 0.3 + i * 0.4);
        mono(666, y, kk, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); mono(666, y + 22, v, { 'font-size': 13.5, fill: col, opacity: s });
        dot([[from[0] + 115, from[1]], [646, y]], seg(u, 0.2 + i * 0.4, 0.9 + i * 0.4), col, 6); });
      return; }
    if (k === 3) { grow(279, 300, 361, 140, E(u, 0.6, 1.3), MUT, { dash: '6 5' }); grow(476, 156, 476, 272, E(u, 1.2, 1.8), MUT, { dash: '6 5' });
      card(790, 150, 280, 90, { rx: 10, stroke: GRID, s: pop(u, 1.6) }); tx(790, 142, '점선 = 앱의 데이터 흐름', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(790, 166, 'Pulumi 의존 간선이 아니다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
      tx(790, 300, '두 cloud의 변수가', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); tx(790, 324, '같은 스코프에 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); } }

  // ---------- 4. Azure AD 의 값이 AWS 역할로 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 4) { // 세 cloud 의 리소스 8개와 참조로 생긴 의존
      const N = { b: [130, 90, 'imagesBucket', WARN], r: [130, 200, 'imageResizeRole', WARN], f: [130, 310, 'imageResizeFn', WARN], n: [390, 310, 'imagesNotify', WARN],
        g: [390, 90, 'thumbsBucket', INFO], v: [390, 200, 'classifyEndpoint', INFO], a: [660, 90, 'mlEngineers', ACC], x: [660, 250, 'crossCloudRole', WARN] };
      Object.values(N).forEach(([x, y, n, col], i) => card(x, y, 200, 44, { rx: 8, stroke: col, text: n, fs: 15, mono: true, color: col, s: pop(u, 0.1 + i * 0.12) }));
      [['r', 'f'], ['b', 'n'], ['f', 'n']].forEach(([a, b], i) => { const A = N[a], B = N[b]; const v = A[0] === B[0]; grow(v ? A[0] : A[0] + 100, v ? A[1] + 22 : A[1], v ? B[0] : B[0] - 100, v ? B[1] - 22 : B[1], E(u, 1.0 + i * 0.2, 1.5 + i * 0.2), ACC); });
grow(660, 112, 660, 228, E(u, 1.6, 2.2), BAD, { sw: 3 });
      pill(830, 170, 'Azure → AWS', BAD, pop(u, 2.0), { fs: 14 });
      tx(480, 395, '화살표 = Output 참조로 생긴 의존 4개', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { tx(40, 70, 'state를 나눈 Terraform', { 'font-size': 16, 'font-weight': 800, fill: MUT });
      const hops = [[150, 'azuread state'], [400, 'remote_state'], [650, 'aws 입력']];
      hops.forEach(([x, n], i) => card(x + 50, 130, 190, 48, { rx: 10, stroke: MUT, text: n, fs: 15, s: pop(u, 0.2 + i * 0.2) }));
      [0, 1].forEach((i) => grow(hops[i][0] + 145, 130, hops[i + 1][0] - 45, 130, E(u, 0.6 + i * 0.3, 1.0 + i * 0.3), MUT));
      dot([[200, 130], [450, 130], [700, 130]], seg(u, 1.0, 2.4), MUT, 7);
      tx(40, 250, 'Pulumi', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      card(200, 310, 190, 48, { rx: 10, stroke: ACC, text: 'mlGroup.objectId', fs: 15, mono: true, s: pop(u, 0.4) }); card(700, 310, 190, 48, { rx: 10, stroke: WARN, text: 'crossCloudRole', fs: 15, mono: true, s: pop(u, 0.5) });
      grow(296, 310, 604, 310, E(u, 0.8, 1.6), ACC); mono(450, 296, '.apply()', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      dot([[296, 310], [604, 310]], seg(u, 1.2, 2.0), ACC, 7); banner(480, 396, '3번 건너던 값을 변수 하나로 넘긴다', pop(u, 2.1)); return; }
    zone(20, 30, 270, 370, 'Azure AD (@pulumi/azuread)', { fill: ACCBG, color: ACC }); zone(670, 30, 270, 370, 'AWS · awsProvider', { fill: WARNBG, color: WARN });
    node(155, 120, 240, 'azuread:index:Group', 'mlEngineers', { col: ACC, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { sub(155, 172, 'displayName: "ML Engineers"', fade(u, 1.0), { class: 'mono' }); sub(155, 194, 'securityEnabled: true', fade(u, 1.2), { class: 'mono' });
      tx(480, 230, '세 번째 cloud도 import 한 줄', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    const roleOn = k >= 3;
    if (k >= 1) node(805, 120, 240, 'aws:iam:Role', 'crossCloudRole', { col: WARN, st: roleOn ? null : 'plan', s: k === 1 ? pop(u, 1.0) : 1 });
    if (k === 1) { outBox(155, 260, 200, 'mlGroup.objectId', '', 0, { s: pop(u, 0.4) }); sub(155, 310, 'Output<string> · 아직 값이 없다', fade(u, 0.9), { fill: INFO, 'font-weight': 700 });
      sub(805, 172, '정책에 넣을 값을 기다린다', fade(u, 1.4)); }
    if (k >= 2) { const mv = k === 2 ? E(u, 0.1, 0.8) : 1, ox = lerp(155, 480, mv), op = k === 2 ? E(u, 0.9, 1.4) : 1;
      outBox(ox, k === 2 ? lerp(260, 90, mv) : 90, 200, '.apply((oid) => …)', 'oid', op);
      const L = ['Principal: { Federated: "…/AzureAD" },', 'Action: "sts:AssumeRoleWithSAML",', 'Condition: { StringEquals: {', '  "azuread:objectId": oid,', '} }'];
      snippet(320, 150, L, { fs: 13.5, w: 330, op: k === 2 ? fade(u, 0.5) : 1 });
      if (k === 2) { el('rect', { x: 324, y: 228, width: 322, height: 22, rx: 4, fill: 'var(--hl)', opacity: 0.45 * fade(u, 1.5) });
        grow(480, 112, 480, 220, E(u, 1.3, 1.9), INFO); sub(480, 300, '값이 생긴 뒤에야 정책 문자열이 만들어진다', fade(u, 2.0), { fill: INK, 'font-weight': 700, 'font-size': 15 }); } }
    if (k === 3) { fly(490, 270, 805, 150, seg(u, 0.3, 1.3), '정책 JSON', { fill: INFO });
      if (u > 1.3) check(925, 100, 9, pop(u, 1.4)); sub(805, 172, 'provider: awsProvider', fade(u, 1.5), { class: 'mono', fill: WARN });
      grow(275, 120, 685, 120, E(u, 1.6, 2.3), BAD, { sw: 3 }); pill(480, 340, 'Azure 출력 → AWS 입력', BAD, pop(u, 2.2), { fs: 15 }); } }

  // ---------- 5. preview / up 한 번 ----------
  const ROWS = [['pulumi:pulumi:Stack', 'multi-cloud-prod', MUT], ['pulumi:providers:aws', 'aws-seoul', WARN], ['aws:s3:BucketV2', 'imagesBucket', WARN], ['aws:iam:Role', 'imageResizeRole', WARN],
    ['aws:lambda:Function', 'imageResizeFn', WARN], ['aws:s3:BucketNotification', 'imagesNotify', WARN], ['pulumi:providers:gcp', 'gcp-seoul', INFO], ['gcp:storage:Bucket', 'thumbsBucket', INFO],
    ['gcp:vertex:AiEndpoint', 'classifyEndpoint', INFO], ['azuread:index:Group', 'mlEngineers', ACC], ['aws:iam:Role', 'crossCloudRole', WARN]];
  // 실행 결과를 python 으로 재현한 일정 (의존이 끝나면 바로 시작)
  const GT = [{ n: 'imagesBucket', s: 0, e: 4, col: WARN }, { n: 'imageResizeRole', s: 0, e: 2, col: WARN }, { n: 'mlEngineers', s: 0, e: 3, col: ACC }, { n: 'thumbsBucket', s: 0, e: 5, col: INFO },
    { n: 'classifyEndpoint', s: 0, e: 35, col: INFO }, { n: 'imageResizeFn', s: 2, e: 14, col: WARN, wait: true }, { n: 'crossCloudRole', s: 3, e: 5, col: WARN, wait: true }, { n: 'imagesNotify', s: 14, e: 15, col: WARN, wait: true }];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // 언어 호스트 → 엔진 → provider 플러그인
      card(150, 150, 220, 110, { rx: 12, stroke: INK, s: pop(u, 0.1) }); tx(150, 130, '언어 호스트', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); mono(150, 158, 'node index.ts', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(150, 184, '리소스를 등록만 한다', fade(u, 0.3));
      card(470, 150, 220, 110, { rx: 12, stroke: ACC, sw: 2.5, s: pop(u, 0.5) }); tx(470, 140, '엔진', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) }); sub(470, 168, 'state와 비교해 계획', fade(u, 0.7));
      card(470, 320, 180, 56, { rx: 10, stroke: GRID, text: 'state (prod)\n비어 있음', fs: 14, s: pop(u, 0.9) }); grow(470, 205, 470, 290, E(u, 1.0, 1.4), MUT, { plain: true });
      ['aws', 'gcp', 'azuread'].forEach((p, i) => { const y = 80 + i * 70, col = [WARN, INFO, ACC][i]; card(800, y, 220, 48, { rx: 10, stroke: col, text: 'plugin · ' + p, fs: 15, mono: true, color: col, s: pop(u, 1.2 + i * 0.2) });
        grow(580, 150, 688, y, E(u, 1.6 + i * 0.15, 2.0 + i * 0.15), col); });
      for (let i = 0; i < 4; i++) dot([[262, 150], [358, 150]], ((u * 0.8 + i / 4) % 1), INK, 5);
      mono(310, 132, 'register', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      banner(480, 396, '$ pulumi up  →  먼저 preview', pop(u, 2.2)); return; }
    if (k <= 2) { const n = k === 1 ? Math.ceil(E(u, 0.2, 1.8) * 6) : 6 + Math.ceil(E(u, 0.2, 1.6) * 5);
      tx(60, 36, 'Previewing update (prod)', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: MUT });
      ROWS.forEach(([ty, nm, col], i) => { if (i >= n) return; planRow(60, 72 + i * 31, '+', ty, nm, col, k === 1 || i >= 6 ? fade(u, (i - (k === 1 ? 0 : 6)) * 0.3 + 0.2, 0.3) : 1); });
      if (k === 1) pill(800, 100, 'provider도 리소스다', WARN, pop(u, 1.9), { fs: 14 });
      if (k === 2) pill(800, 382, '순서는 선언 순서', MUT, pop(u, 1.9), { fs: 14 }); return; }
    if (k === 3) { tx(480, 50, 'Resources: + 11 to create', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, class: 'mono', fill: GOOD, opacity: fade(u, 1.8) });
      const grp = [['Stack', 1, MUT], ['provider', 2, INK], ['클라우드 리소스', 8, ACC]]; let x = 120;
      grp.forEach(([g, n, col], gi) => { tx(x, 150, g, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.2 + gi * 0.4) });
        for (let i = 0; i < n; i++) { const s = pop(u, 0.3 + gi * 0.4 + i * 0.08); el('rect', { x: x + i * 46, y: 168, width: 38, height: 38, rx: 6, fill: col, opacity: 0.8 * Math.min(1, s) }); }
        x += Math.max(n * 46, tw(g, 15)) + 50; });
      mono(480, 270, '1 + 2 + 8 = 11', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      pill(480, 340, 'Do you want to perform this update?  yes', INK, pop(u, 2.2), { mono: true, fs: 14 }); return; }
    if (k === 4 || k === 5 || k === 7) { const T = k === 4 ? lerp(0, 5, E(u, 0.2, 2.2)) : k === 5 ? lerp(5, 36, E(u, 0.2, 2.4)) : 36;
      const rows = GT.map((r) => ({ ...r, op: k === 4 && r.wait ? 0.35 : 1, hot: k === 7 && r.n === 'classifyEndpoint' }));
      gantt(190, 30, 720, rows, 36, T, { step: 5 });
      if (k === 4) pill(720, 360, '의존 없는 5개가 0초에 함께 시작', GOOD, pop(u, 1.4), { fs: 14 });
      if (k === 5) { pill(720, 360, '기다린 3개는 앞 리소스가 끝난 즉시', WARN, pop(u, 2.0), { fs: 14 }); }
      if (k === 7) { banner(480, 368, '+ 11 created · Duration 47s', pop(u, 0.3)); sub(480, 404, '가장 긴 줄은 Vertex AI 35초 · 나머지는 그 안에 끝난다', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 6) { zone(140, 40, 680, 300, 'Outputs · pipelineUrls', { fill: PANEL, stroke: INK, color: INK });
      [['awsImagesBucket', '"images-prod-2026"', WARN], ['awsLambdaArn', '"arn:aws:lambda:ap-northeast-2:..."', WARN], ['gcpThumbsBucket', '"gs://thumbnails-prod-2026"', INFO], ['gcpClassifyId', '"projects/my-ml-project/…"', INFO]].forEach(([kk, v, col], i) => {
        const y = 100 + i * 60; mono(170, y, kk, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.35) });
        outBox(600, y - 5, 380, '', v, E(u, 0.6 + i * 0.35, 1.0 + i * 0.35), { op: fade(u, 0.2 + i * 0.35) }); });
      sub(480, 380, '두 cloud의 값이 한 출력에 · 표의 값은 예시', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k8: destroy 는 의존 역순 (python 재현: 층 3 → 2 → 1 → 0)
    const LAY = [['imagesNotify'], ['imageResizeFn'], ['imagesBucket', 'imageResizeRole', 'thumbsBucket', 'classifyEndpoint', 'crossCloudRole'], ['aws-seoul', 'gcp-seoul', 'mlEngineers']];
    tx(480, 40, '$ pulumi destroy · 의존의 역순', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono' });
    LAY.forEach((ns, li) => { const y = 100 + li * 78, gone = u > 0.4 + li * 0.5; mono(40, y + 5, String(li + 1), { 'font-size': 16, 'font-weight': 800, fill: gone ? BAD : MUT });
      ns.forEach((n, j) => { const x = 140 + j * 162; card(x + 70, y, 150, 40, { rx: 8, stroke: gone ? OFF : INK, text: n, fs: 13.5, mono: true, color: gone ? OFF : INK });
        if (gone) el('line', { x1: x + 4, y1: y, x2: x + 136, y2: y, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 0.4 + li * 0.5, 0.3) }); }); }); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: '이 장에서 stack마다 다른 region을 쓰게 만드는 방법은 무엇인가?',
      o: ['region 문자열을 코드에 바로 적는다', 'pulumi.Config로 읽고 값이 없으면 기본값을 쓴다', 'cloud마다 프로그램 파일을 나눈다'], a: 1,
      why: 'cfg.get("awsRegion") ?? "ap-northeast-2" 처럼 stack config에서 읽고, 값이 없을 때만 기본값을 쓴다. dev·prod stack이 같은 코드로 다른 region을 쓴다.' },
    { q: 'Lambda가 IAM 역할보다 나중에 만들어지는 이유는 무엇인가?',
      o: ['코드에서 역할을 먼저 적었기 때문이다', 'AWS가 언제나 IAM을 먼저 처리하기 때문이다', 'role: lambdaRole.arn으로 역할의 출력을 참조했기 때문이다'], a: 2,
      why: '다른 리소스의 출력(Output)을 입력에 넣으면 그 자체가 의존 선언이 된다. 엔진은 역할이 만들어져 arn이 생긴 뒤에 Lambda를 만든다.' },
    { q: '장면의 점선(Lambda → GCS → Vertex AI)은 무엇을 뜻하나?',
      o: ['앱의 데이터 흐름일 뿐 Pulumi 의존은 아니다', 'Pulumi가 만든 의존 간선이다', 'dependsOn으로 건 명시적 의존이다'], a: 0,
      why: '코드에서 GCS나 Vertex AI는 Lambda의 출력을 참조하지 않는다. 그래서 엔진은 이 셋을 서로 기다리지 않고 만든다.' },
    { q: 'mlGroup.objectId를 정책 JSON에 넣을 때 .apply()를 쓰는 이유는 무엇인가?',
      o: ['Azure와 AWS가 다른 언어를 써서', 'JSON.stringify가 느려서', 'objectId가 아직 값이 없는 Output이라서'], a: 2,
      why: 'AD 그룹이 만들어져야 objectId가 생긴다. apply 안에서만 실제 값을 받아 정책 문자열을 만들 수 있고, 결과도 Output이라 순서가 지켜진다.' },
    { q: '이 up에서 crossCloudRole은 언제 만들어지기 시작하나?',
      o: ['다른 리소스 7개가 모두 끝난 뒤', 'mlEngineers 그룹이 끝난 3초 뒤', 'Vertex AI가 끝난 35초 뒤'], a: 1,
      why: 'crossCloudRole이 기다리는 것은 objectId를 주는 AD 그룹뿐이다. 그룹이 3초에 끝나면 바로 시작해 5초에 끝난다.' },
  ];

  const summary = [
    '한 TypeScript 파일에 aws·gcp·azuread를 import 하면 세 cloud를 한 프로그램과 한 state로 다룬다.',
    'region은 stack config로 읽고, 명시적 provider(aws-seoul, gcp-seoul)를 리소스 옵션에 넘긴다.',
    '다른 리소스의 출력을 입력에 넣으면 의존이 생기고, AD 그룹의 objectId도 apply로 AWS 역할에 들어간다.',
    'preview는 Stack과 provider까지 세어 + 11이고, up은 의존 없는 것부터 동시에 만든다.',
  ];
  const review = [
    { q: 'up이 47초 걸렸다. 시간을 줄이려고 가장 먼저 볼 것은?',
      o: ['crossCloudRole의 정책 길이', '35초 걸린 Vertex AI 엔드포인트', 'Stack 리소스의 이름'], a: 1,
      why: '독립 리소스는 동시에 만들어지므로 전체 시간은 가장 긴 줄이 정한다. 이 배포에서는 Vertex AI의 35초가 그 줄이다.' },
    { q: '새 팀원이 preview의 + 11을 보고 리소스가 8개인데 이상하다고 한다. 맞는 설명은?',
      o: ['Stack 1개와 명시적 provider 2개도 리소스로 센다', 'preview가 리소스를 중복으로 센 버그다', '아직 import 하지 않은 리소스 3개가 섞였다'], a: 0,
      why: 'Pulumi는 Stack과 new aws.Provider 같은 명시적 provider도 리소스로 등록한다. 1 + 2 + 8 = 11이다.' },
    { q: 'AD 그룹의 objectId를 문자열로 바로 정책에 붙였더니 역할이 엉뚱한 값을 가졌다. 고칠 방법은?',
      o: ['objectId를 콘솔에서 복사해 코드에 적는다', 'crossCloudRole을 다른 stack으로 옮긴다', 'mlGroup.objectId.apply 안에서 정책 JSON을 만든다'], a: 2,
      why: 'Output은 아직 값이 없는 약속이라 문자열로 바로 붙일 수 없다. apply 안에서 받은 oid로 정책을 만들면 값과 순서가 함께 지켜진다.' },
  ];

  R.page({ title: '멀티 클라우드 한 프로그램', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
