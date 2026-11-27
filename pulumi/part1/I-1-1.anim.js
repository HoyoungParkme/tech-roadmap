/* I-1-1 program · stack · resource — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone,
    cross, check, lock, browser } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통 부품 ----------
  // 코드 판: lines = [[처음 보이는 beat, 글]]. 지금 beat 줄은 밝게, 넘치면 앞줄을 밀어 올린다
  function codePanel(x, y, w, h, title, lines, k, u) { const lh = 21, max = Math.floor((h - 46) / lh);
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(x + 14, y + 24, title, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const vis = lines.filter(([at]) => at <= k), first = Math.max(0, vis.length - max);
    vis.slice(first).forEach(([at, s], i) => { const yy = y + 52 + i * lh, cur = at === k, op = cur ? fade(u, 0.15) : 1;
      if (cur) el('rect', { x: x + 6, y: yy - 15, width: w - 12, height: lh, rx: 4, fill: ACCBG, opacity: op });
      R.spans(x + 14, yy, R.tokens(s), { 'font-size': 13.5, opacity: op }); }); }
  // 리소스 판: 위에 타입(작게), 아래 논리 이름. o.live = 클라우드에 있음(실선), 아니면 점선
  function resNode(cx, cy, type, name, o) { o = o || {}; const w = o.w || 180, h = o.h || 52, s = o.s ?? 1; if (s <= 0) return;
    const g = R.G(cx, cy, s, o.op);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 9, fill: o.live ? C.GOODBG : PANEL, stroke: o.hot ? ACC : o.live ? GOOD : INK, 'stroke-width': o.hot ? 2.6 : 2, 'stroke-dasharray': o.live ? null : '6 4' }, g);
    mono(0, -6, type, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    mono(0, 15, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: o.hot ? ACC : INK }, g); }
  // 파일 그림 (접힌 귀퉁이)
  function doc(cx, cy, w, h, title, rows, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2, col = o.col || INK, g = R.G(0, 0, 1, o.op);
    el('path', { d: `M${x},${y} H${x + w - 14} L${x + w},${y + 14} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 2 }, g);
    mono(x + 10, y + 20, title, { 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    (rows || []).forEach((r, i) => mono(x + 10, y + 41 + i * 20, r, { 'font-size': 13.5, fill: o.rowCol || MUT }, g)); }
  const note = (s, u0, u, col, y) => tx(480, y || 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, u0) });
  // 작은 클라우드 객체 그림: S3 통(원통), SQS(칸 셋), λ
  function glyph(kind, cx, cy, col, s) { s = s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INK;
    if (kind === 's3') { el('path', { d: 'M-11,-9 L-8,11 H8 L11,-9 Z', fill: PANEL, stroke: c, 'stroke-width': 2 }, g); el('ellipse', { cx: 0, cy: -9, rx: 11, ry: 4, fill: PANEL, stroke: c, 'stroke-width': 2 }, g); }
    else if (kind === 'sqs') { [-9, 0, 9].forEach((x) => el('rect', { x: x - 4, y: -8, width: 8, height: 16, rx: 2, fill: c, opacity: 0.8 }, g)); }
    else { tx(0, 7, 'λ', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: c }, g); } }

  // =========================================================
  // 1. program — 코드가 실행되며 리소스를 하나씩 등록한다
  // =========================================================
  const P1 = [[0, 'import * as aws from "@pulumi/aws";'], [0, 'import * as pulumi from "@pulumi/pulumi";'],
    [1, 'const projectName = "my-infra";'], [1, 'const tags = { Project: projectName,'], [1, '               ManagedBy: "pulumi" };'],
    [2, 'const bucket = new aws.s3.Bucket('], [2, '  "bucket-logs", { bucket: …, tags });'],
    [3, 'const queue = new aws.sqs.Queue('], [3, '  "queue-jobs", { name: …, tags });'],
    [4, 'function makeLambdaPolicy(bucketArn) {'], [4, '  return pulumi.output(bucketArn)'], [4, '    .apply((arn) => JSON.stringify(…)); }'],
    [5, 'const role = new aws.iam.Role("fn-worker-role", …);'], [5, 'new aws.iam.RolePolicy("fn-worker-policy", {'], [5, '  role: role.id,'], [5, '  policy: makeLambdaPolicy(bucket.arn) });'],
    [6, 'const fn = new aws.lambda.Function("fn-worker", {'], [6, '  role: role.arn, environment: { variables: {'], [6, '    BUCKET: bucket.bucket, QUEUE_URL: queue.url } } });'],
    [7, 'export const bucketName = bucket.bucket;'], [7, 'export const queueUrl = queue.url;'], [7, 'export const functionArn = fn.arn;']];
  const N1 = { bucket: [575, 150], queue: [575, 232], role: [575, 314], policy: [845, 168], fn: [845, 300] };
  function s1(t, c) { const { k, u } = c;
    codePanel(16, 16, 434, 388, 'index.ts (줄인 모양)', P1.map(([a, s]) => [a, s.length > 49 ? s.slice(0, 48) + '…' : s]), k, u);
    // 오른쪽 위: 엔진이 받은 등록 수
    const cnt = [0, 0, 1, 2, 2, 4, 5, 5], pc = k > 0 ? cnt[k - 1] : 0, n = Math.round(tween(pc, cnt[k], c.u, 0.6));
    tx(476, 40, '엔진에 등록된 리소스', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    mono(660, 41, n + '개', { 'font-size': 18, 'font-weight': 800, fill: ACC });
    tx(940, 40, '클라우드: 0개', { 'font-size': 14, 'font-weight': 700, fill: OFF, 'text-anchor': 'end' });
    if (k === 0) { [['@pulumi/aws', 600, 'Bucket · Queue · Role …'], ['@pulumi/pulumi', 820, 'Output · Config · getStack']].forEach(([p, x, d], i) => {
        fly(250, 40 + i * 21, x, 120, seg(u, 0.3 + i * 0.4, 1.2 + i * 0.4), p, { mono: true, stay: true });
        tx(x, 156, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3 + i * 0.4) }); });
      card(705, 250, 420, 70, { rx: 12, stroke: GRID, fill: SOFT, dash: '6 5', s: pop(u, 1.8) });
      tx(705, 246, 'new를 부르기 전이라 아무것도 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) });
      tx(705, 268, '그냥 TypeScript import다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    // 변수 두 개 (위 줄)
    const vs = k === 1 ? pop(u, 0.3) : 1;
    pill(585, 84, 'projectName = "my-infra"', INK, vs, { mono: true, fs: 13.5 });
    pill(838, 84, 'tags', ACC, k === 1 ? pop(u, 0.8) : 1, { mono: true, fs: 13.5 });
    if (k === 1) { ['Project: "my-infra"', 'ManagedBy: "pulumi"'].forEach((s, i) => mono(838, 130 + i * 22, s, { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.2 + i * 0.3) }));
      note('리소스가 아니라 평범한 상수다. 엔진에는 아무것도 가지 않는다', 1.8, u, MUT); return; }
    // 리소스 판
    const at = { bucket: 2, queue: 3, role: 5, policy: 5, fn: 6 };
    const TY = { bucket: 'aws:s3:Bucket', queue: 'aws:sqs:Queue', role: 'aws:iam:Role', policy: 'aws:iam:RolePolicy', fn: 'aws:lambda:Function' };
    const NM = { bucket: 'bucket-logs', queue: 'queue-jobs', role: 'fn-worker-role', policy: 'fn-worker-policy', fn: 'fn-worker' };
    // 의존 선 (Output 을 넘긴 곳)
    const edge = (a, b, at0, lab, lx, ly) => { if (k < at0) return; const [x1, y1] = N1[a], [x2, y2] = N1[b], g = k === at0 ? E(u, 0.9, 1.6) : 1;
      grow(x1 + 90, y1, x2 - 92, y2, g, ACC, { dash: '6 4' });
      if (lab) mono(lx, ly, lab, { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: k === at0 ? fade(u, 1.4) : 1, 'text-anchor': 'middle' }); };
    edge('bucket', 'policy', 5, 'bucket.arn', 712, 146); edge('role', 'policy', 5);
    edge('role', 'fn', 6, 'role.arn', 712, 334); edge('bucket', 'fn', 6); edge('queue', 'fn', 6);
    Object.keys(N1).forEach((key) => { if (k < at[key]) return; const [x, y] = N1[key], first = k === at[key];
      const s = first ? pop(u, key === 'policy' ? 0.6 : key === 'fn' ? 0.3 : 0.2) : 1;
      resNode(x, y, TY[key], NM[key], { s, hot: first }); });
    if (k === 2 || k === 3) { const key = k === 2 ? 'bucket' : 'queue', [x, y] = N1[key];
      fly(838, 92, x + 40, y - 20, seg(u, 0.9, 1.7), 'tags', { mono: true });
      if (k === 3) pill(840, 232, 'tags 재사용 × 2', ACC, pop(u, 1.8), { fs: 13.5 });
      note(k === 2 ? 'new 한 줄 = 등록 한 건. 아직 클라우드에는 없다 (점선)' : '같은 변수를 다시 넣는다. 복사해 붙일 일이 없다', 1.9, u, k === 2 ? INK : GOOD); return; }
    if (k === 4) { const g = pop(u, 0.3);
      card(845, 232, 230, 96, { rx: 12, stroke: INFO, sw: 2.2, fill: C.INFOBG, s: g });
      mono(845, 210, 'makeLambdaPolicy(arn)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) });
      mono(845, 236, 'arn = ?', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9) });
      tx(845, 260, '값이 없어도 apply로 이어 둔다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
      grow(668, 160, 728, 210, E(u, 1.3, 1.9), WARN, { dash: '5 4' });
      note('bucket.arn은 Output: 배포 뒤에야 정해지는 약속', 1.9, u, WARN); return; }
    if (k === 5) { note('Output을 넘긴 곳이 곧 의존 선이 된다', 2.0, u, ACC); return; }
    if (k === 6) { sub(845, 345, '입력 셋 모두 Output', fade(u, 1.7), { 'font-weight': 700, fill: ACC });
      note('엔진은 이 선을 보고 Role 먼저, Lambda 나중으로 순서를 잡는다', 2.0, u); return; }
    // k7: export → stack output, 값은 아직 ?
    [['bucketName', N1.bucket], ['queueUrl', N1.queue], ['functionArn', N1.fn]].forEach(([nm, [x, y]], i) => {
      const s = pop(u, 0.3 + i * 0.35), ox = [560, 705, 860][i];
      pill(ox, 392, nm + ' = ?', WARN, s, { mono: true, fs: 13.5 }); });
    tx(476, 362, 'stack output · 값은 up 뒤에 채워진다', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) }); }

  // =========================================================
  // 2. stack — 같은 program 의 배포본 셋
  // =========================================================
  const SX = [170, 480, 790], SN = ['dev', 'staging', 'prod'];
  const CFG = [[['aws:region', 'ap-northeast-2'], ['size', 'small'], ['logRetentionDays', '7']],
    [['aws:region', 'ap-northeast-2'], ['size', 'medium'], ['logRetentionDays', '30']],
    [['aws:region', 'ap-northeast-2'], ['size', 'large'], ['logRetentionDays', '365']]];
  const SEL = [0, 1, 2, 2, 2, 0, 2, 2];
  const CMD2 = ['pulumi stack init dev', 'pulumi stack init staging', 'pulumi stack init prod', 'pulumi config set --secret dbPassword …',
    'pulumi stack ls', 'pulumi stack select dev && pulumi up', 'pulumi stack select prod && pulumi up', 'pulumi stack output --stack dev'];
  function s2(t, c) { const { k, u } = c;
    card(480, 34, 330, 44, { rx: 10, stroke: INK, sw: 2.2, text: 'program my-infra · index.ts', fs: 15, mono: true });
    const sel = k === 0 ? 0 : lerp(SEL[k - 1], SEL[k], E(u, 0.2, 0.9));
    SN.forEach((nm, i) => { if (i > k) return; const first = i === k && k <= 2, s = first ? pop(u, 0.25) : 1, x = SX[i], on = Math.round(sel) === i;
      grow(480, 56, x, 98, first ? E(u, 0.1, 0.5) : 1, on ? ACC : GRID, { plain: true, sw: 2 });
      card(x, 190, 280, 180, { rx: 12, stroke: on ? ACC : GRID, sw: on ? 2.8 : 1.8, fill: PANEL, s });
      if (s < 0.9) return;
      mono(x - 124, 122, 'stack ' + nm + (k >= 4 && i === 2 ? ' *' : ''), { 'font-size': 16, 'font-weight': 800, fill: on ? ACC : INK });
      CFG[i].forEach(([key, v], j) => { const op = first ? fade(u, 0.6 + j * 0.3) : 1, hot = k === 2 && i === 2 && j === 2;
        mono(x - 124, 150 + j * 24, key, { 'font-size': 13.5, fill: MUT, opacity: op });
        mono(x + 124, 150 + j * 24, v, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: hot ? ACC : INK, opacity: op }); });
      // 비밀값
      if (i === 2 && k >= 3) { const m = k === 3 ? E(u, 0.8, 1.6) : 1;
        mono(x - 124, 222, 'dbPassword', { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 0.3) : 1 });
        mono(x + 124, 222, m < 0.5 ? '<pw>' : 'secure: v1:…', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: m < 0.5 ? BAD : GOOD, opacity: k === 3 ? fade(u, 0.3) : 1 });
        if (m >= 0.5) lock(x + 6, 220, true, GOOD, (k === 3 ? pop(u, 1.6) : 1) * 0.7); }
      // state 칸
      const upd = (i === 0 && k >= 5) || (i === 2 && k >= 6);
      const just = (i === 0 && k === 5) || (i === 2 && k === 6);
      el('rect', { x: x - 124, y: 238, width: 248, height: 34, rx: 6, fill: upd ? C.GOODBG : SOFT, stroke: upd ? GOOD : GRID, 'stroke-width': 1.5, opacity: just ? fade(u, 1.3) : 1 });
      mono(x, 260, k >= 4 && !upd ? 'state · n/a (아직 up 전)' : upd ? 'state · +6 created' : 'state · 비어 있음', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: upd ? GOOD : MUT, opacity: just ? fade(u, 1.3) : 1 }); });
    // 선택 표시
    if (k <= 7) { const x = lerp(SX[0], SX[2], sel / 2); pill(x, 300, '선택된 stack', ACC, k === 0 ? pop(u, 0.9) : 1, { fs: 13.5 }); }
    // 지금 명령
    pill(480, 344, CMD2[k], INK, pop(u, 0.15), { mono: true, fs: 14 });
    if (k === 1) note('program은 그대로, config 값만 다르다', 1.6, u, MUT);
    if (k === 2) note('보관 기간 7 → 30 → 365일', 1.6, u, ACC);
    if (k === 3) note('--secret이면 Pulumi.prod.yaml에 암호문으로 남는다', 1.8, u, GOOD);
    if (k === 4) note('* = 지금 선택(prod). 셋 다 아직 리소스 없음', 1.4, u);
    if (k === 5 || k === 6) { const x = SX[k === 5 ? 0 : 2]; dot([[480, 58], [x, 100], [x, 238]], seg(u, 0.6, 1.4), ACC, 7);
      note(k === 5 ? 'up은 선택된 dev 하나에만 적용된다' : 'dev는 손대지 않고 prod만 바뀐다', 1.8, u, k === 5 ? ACC : WARN); }
    if (k === 7) { dot([[SX[0] - 140, 272], [SX[0] - 140, 360], [40, 388]], seg(u, 0.4, 1.1), INFO, 6);
      el('rect', { x: 24, y: 368, width: 912, height: 34, rx: 8, fill: C.INFOBG, stroke: INFO, 'stroke-width': 1.5, opacity: fade(u, 1.0) });
      ['bucketName: my-infra-dev-logs', 'queueUrl: …/my-infra-dev-jobs', 'functionArn: …:my-infra-dev-worker'].forEach((s, i) =>
        mono(40 + i * 300, 391, s, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2 + i * 0.3) })); } }

  // =========================================================
  // 3. resource — up 이 코드 → 엔진 → provider → AWS 로 흐른다
  // =========================================================
  const L3 = [['언어 호스트', 'node index.ts', 115], ['엔진', 'state와 비교', 375], ['provider', 'pulumi-resource-aws', 635], ['AWS', 'ap-northeast-2', 870]];
  const ROWS3 = [['pulumi:pulumi:Stack', 'my-infra-staging'], ['aws:s3:Bucket', 'bucket-logs'], ['aws:sqs:Queue', 'queue-jobs'],
    ['aws:iam:Role', 'fn-worker-role'], ['aws:iam:RolePolicy', 'fn-worker-policy'], ['aws:lambda:Function', 'fn-worker']];
  // 의존 순서대로의 시작·끝 (초, 로그의 소요 시간 예시) — Stack 은 감싸는 노드라 막대 없음
  const GT = [null, [0, 3], [0, 2], [0, 1], [3, 4], [3, 8]];
  function layers(k, u, hot) { L3.forEach(([a, b, x], i) => { const s = k === 0 ? pop(u, 0.3 + i * 0.3) : 1;
      card(x, 52, i === 3 ? 170 : 200, 58, { rx: 10, stroke: hot === i ? ACC : i === 3 ? INFO : INK, sw: hot === i ? 2.8 : 2, fill: hot === i ? ACCBG : PANEL, s });
      if (s > 0.8) { tx(x, 47, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: i === 3 ? INFO : INK }); mono(x, 68, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
      if (i < 3) grow(x + (i === 2 ? 102 : 102), 52, L3[i + 1][2] - (i === 2 ? 87 : 102), 52, k === 0 ? E(u, 0.6 + i * 0.3, 1.0 + i * 0.3) : 1, GRID); }); }
  function s3(t, c) { const { k, u } = c;
    layers(k, u, [0, 1, 1, 2, 1, 1, 1][k]);
    const stateTxt = k <= 2 ? 'staging state · 비어 있음' : k === 3 ? 'staging state · 기록 중' : 'staging state · 리소스 6 · URN 5';
    card(375, 104, 300, 30, { rx: 6, stroke: k >= 3 ? GOOD : GRID, fill: k >= 3 ? C.GOODBG : SOFT, sw: 1.5, text: stateTxt, fs: 13.5, mono: true, color: k >= 3 ? GOOD : MUT });
    if (k === 0) { note('$ pulumi stack select staging  →  $ pulumi up', 1.4, u, INK, 250); note('아직 아무것도 만들어지지 않았다', 1.9, u, MUT, 290); return; }
    if (k <= 4) { // 미리보기 / 생성 표
      ROWS3.forEach(([ty, nm], i) => { const y = 160 + i * 31, op = k === 1 ? fade(u, 0.3 + i * 0.28) : 1;
        if (k === 1) dot([[115, 82], [115, 130], [300, 130], [330, y - 5]], seg(u, i * 0.28, 0.3 + i * 0.28), ACC, 5);
        const done = k >= 3 && (i === 0 ? u > 2.4 || k > 3 : true), gt = GT[i];
        let cdone = k > 3; if (k === 3 && gt) cdone = u > 0.4 + gt[1] * 0.25;
        const sym = '+', col = GOOD;
        mono(34, y, sym, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op });
        mono(56, y, (i ? (i === 5 ? '└─ ' : '├─ ') : '') + ty, { 'font-size': 13.5, fill: INK, opacity: op });
        mono(300, y, nm, { 'font-size': 13.5, 'font-weight': 700, fill: INK, opacity: op });
        const st = k <= 2 ? 'create' : (i === 0 ? (k > 3 || u > 2.5 ? 'created' : '…') : cdone ? 'created' : gt && k === 3 && u > 0.4 + gt[0] * 0.25 ? '…' : '대기');
        mono(470, y, st, { 'font-size': 13.5, 'font-weight': 700, fill: st === 'created' ? GOOD : st === 'create' ? GOOD : MUT, opacity: op });
        if (k === 3 && gt) { const x0 = 560, sc = 26, a = 0.4 + gt[0] * 0.25, b = 0.4 + gt[1] * 0.25, g = k === 3 ? clamp((u - a) / (b - a)) : 1;
          el('rect', { x: x0 + gt[0] * sc, y: y - 13, width: Math.max(2, (gt[1] - gt[0]) * sc * g), height: 16, rx: 4, fill: g >= 1 ? GOOD : ACC, opacity: 0.85 });
          if (g >= 1) mono(x0 + gt[1] * sc + 6, y, (gt[1] - gt[0]) + 's', { 'font-size': 13.5, fill: MUT }); } });
      if (k === 3) { [0, 4, 8].forEach((v) => mono(560 + v * 26, 360, v + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
        tx(560, 144, '의존 순서 (시간은 로그 예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); }
      if (k === 1) note('state가 비어 있으니 등록된 6건이 모두 + create', 1.9, u, GOOD, 370);
      if (k === 2) { card(735, 226, 330, 96, { rx: 12, stroke: WARN, sw: 2.2, s: pop(u, 0.3) });
        mono(735, 210, 'Resources: + 6 to create', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
        mono(735, 240, 'perform this update? [y/N] ' + (u > 1.6 ? 'y' : ''), { 'text-anchor': 'middle', 'font-size': 14, fill: INK, opacity: fade(u, 1.0) });
        note('숫자를 보고 y를 눌러야 AWS 호출이 시작된다', 1.9, u, WARN, 370); }
      if (k === 3) { dot([[375, 82], [635, 52], [870, 52]], ((u * 0.9) % 1), ACC, 6); dot([[375, 82], [635, 52], [870, 52]], ((u * 0.9 + 0.5) % 1), ACC, 6);
        note('Bucket·Queue·Role은 동시에, Policy·Lambda는 그 뒤에', 2.0, u, INK, 392); }
      if (k === 4) { R.terminal(556, 136, 388, 160, ['Outputs:', '  bucketName  : "my-infra-staging-logs"', '  queueUrl    : "…/my-infra-staging-jobs"', '  functionArn : "…:my-infra-staging-worker"', 'Duration: 14s'], fade(u, 0.3) * 5, { fs: 13.5 });
        ['bucketName', 'queueUrl', 'functionArn'].forEach((s, i) => pill(300 + i * 160, 360, s + ' ✓', GOOD, pop(u, 1.6 + i * 0.2), { mono: true, fs: 13.5 }));
        note('Step 1의 ? 자리가 실제 이름·URL·ARN으로 채워졌다', 2.1, u, GOOD, 392); }
      return; }
    if (k === 5) { const urns = ['aws:s3/bucket:Bucket::bucket-logs', 'aws:sqs/queue:Queue::queue-jobs', 'aws:iam/role:Role::fn-worker-role', 'aws:iam/rolePolicy:RolePolicy::fn-worker-policy', 'aws:lambda/function:Function::fn-worker'];
      urns.forEach((s, i) => { const y = 170 + i * 36, f = clamp((u - 0.3 - i * 0.3) / 0.5);
        mono(40, y, ('urn:pulumi:staging::my-infra::' + s).slice(0, Math.round((30 + s.length) * f)), { 'font-size': 14, fill: INK });
        if (f >= 1) dot([[600, y - 5], [470, 120]], seg(u, 0.9 + i * 0.3, 1.4 + i * 0.3), GOOD, 5); });
      note('리소스마다 URN 하나가 state에 남는다', 2.1, u, GOOD, 380); return; }
    // k6: URN 해부
    const parts = [['urn:pulumi:', MUT, null], ['staging', ACC, 'stack'], ['::', MUT, null], ['my-infra', INFO, 'project'], ['::', MUT, null], ['aws:s3/bucket:Bucket', WARN, 'type'], ['::', MUT, null], ['bucket-logs', GOOD, 'name']];
    let x = 70; parts.forEach(([s, col, lab], i) => { const w = tw(s, 17), op = fade(u, 0.2 + i * 0.12);
      mono(x, 210, s, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: op });
      if (lab) { el('line', { x1: x, y1: 222, x2: x + w, y2: 222, stroke: col, 'stroke-width': 3, opacity: op }); tx(x + w / 2, 246, lab, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); }
      if (i === 1) { mono(x, 300, 'dev', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); }
      x += w; });
    mono(70, 300, 'urn:pulumi:', { 'font-size': 17, fill: MUT, opacity: fade(u, 1.6) });
    mono(70 + tw('urn:pulumi:dev', 17), 300, '::my-infra::aws:s3/bucket:Bucket::bucket-logs', { 'font-size': 17, fill: MUT, opacity: fade(u, 1.6) });
    tx(480, 350, 'stack 자리가 다르면 다른 리소스다. stack끼리 공유하지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }

  // =========================================================
  // 4. program × stack = resource
  // =========================================================
  const RK = [['s3', 'logs'], ['sqs', 'jobs'], ['fn', 'worker']];
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) {
      card(480, 50, 340, 54, { rx: 12, stroke: INK, sw: 2.6, s: k === 0 ? pop(u, 0.3) : 1 });
      mono(480, 46, 'program my-infra', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.5) : 1 });
      tx(480, 67, 'index.ts 한 벌', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
      if (k === 0) { note('코드는 프로젝트에 딱 한 벌만 둔다', 1.4, u, MUT, 220); return; }
      SN.forEach((nm, i) => { const x = SX[i], g = k === 1 ? E(u, 0.2 + i * 0.25, 0.9 + i * 0.25) : 1;
        grow(480, 78, x, 128, g, i === 0 && k === 2 ? ACC : MUT, { sw: 2 });
        if (g > 0.95) pill(x, 146, 'stack ' + nm, i === 0 && k === 2 ? ACC : INK, k === 1 ? pop(u, 0.9 + i * 0.25) : 1, { mono: true, fs: 15 });
        const show = k >= 3 || (k === 2 && i === 0);
        if (!show) return;
        RK.forEach(([g2, suf], j) => { const y = 200 + j * 44, first = (k === 2 && i === 0) || (k === 3 && i > 0), s = first ? pop(u, 0.3 + j * 0.25 + (k === 3 ? (i - 1) * 0.5 : 0)) : 1;
          glyph(g2, x - 112, y, i === 0 ? ACC : i === 1 ? INFO : WARN, s);
          if (s > 0.6) mono(x - 92, y + 5, `my-infra-${nm}-${suf}`, { 'font-size': 13.5, 'font-weight': 700 }); }); });
      const n = k === 2 ? 3 : Math.round(tween(3, 9, u, 1.0));
      mono(480, 362, `클라우드 객체 ${n}개`, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC });
      if (k === 2) note('같은 코드가 만든 것이지만 dev 것은 dev에만 있다', 1.6, u, MUT, 400);
      if (k === 3) note('주요 3개 × stack 3 = 9 (IAM 둘까지 세면 5 × 3 = 15)', 1.8, u, INK, 400);
      return; }
    if (k === 4) { const rows = [['program', '인프라를 표현하는 코드', 'index.ts · __main__.py'], ['stack', 'program의 배포 인스턴스', 'dev · staging · prod'], ['resource', '클라우드에 실제로 있는 객체', 'S3 bucket · SQS queue']];
      const X = [110, 260, 600], W = [150, 340, 290];
      ['개념', '설명', '예'].forEach((h, j) => tx(X[j] + 10, 92, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
      rows.forEach((r, i) => r.forEach((s, j) => { const y = 112 + i * 72, f = E(u, 0.2 + i * 0.4 + j * 0.12, 0.6 + i * 0.4 + j * 0.12);
        el('rect', { x: X[j], y, width: W[j] * f, height: 56, rx: 8, fill: j === 0 ? ACCBG : SOFT, stroke: j === 0 ? ACC : GRID, 'stroke-width': 1.5 });
        if (f > 0.9) (j === 0 || j === 2 ? mono : tx)(X[j] + 14, y + 33, s, { 'font-size': j === 0 ? 16 : 15, 'font-weight': j === 0 ? 800 : 600, fill: j === 0 ? ACC : INK }); }));
      note('코드 한 벌 · 환경 여러 벌 · 객체는 환경마다 따로', 1.9, u, INK, 368); return; }
    if (k === 5) { // 오해 걷어내기
      card(250, 130, 360, 64, { rx: 12, stroke: BAD, sw: 2, fill: C.BADBG, s: pop(u, 0.2) });
      tx(250, 137, '"stack = state 파일"', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      el('line', { x1: 110, y1: 132, x2: 110 + 280 * E(u, 0.7, 1.1), y2: 132, stroke: BAD, 'stroke-width': 3 });
      [['stack', '논리적 환경 (이름 · config)', ACC], ['state', '그 환경의 지금 모습 스냅샷', INFO]].forEach(([a, b, col], i) => { const y = 228 + i * 60, s = pop(u, 1.1 + i * 0.3);
        pill(140, y, a, col, s, { mono: true, fs: 15 }); tx(200, y + 5, b, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 1.2 + i * 0.3) }); });
      // 폴더 = program
      const fs = pop(u, 1.5); const g = R.G(720, 210, fs);
      el('path', { d: 'M-110,-70 H-40 L-28,-56 H110 V80 H-110 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
      ['Pulumi.yaml', 'Pulumi.dev.yaml', 'index.ts'].forEach((s, i) => mono(-92, -28 + i * 26, s, { 'font-size': 14, 'font-weight': i === 0 ? 800 : 600, fill: i === 0 ? ACC : INK }, g));
      tx(720, 322, 'Pulumi.yaml이 있는 폴더 = program 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) }); return; }
    // k6: 다음 — 같은 모델이 UI 주소에
    browser(480, 170, 760, 130, null, { s: pop(u, 0.2) });
    const segs = [['app.pulumi.com/', MUT, null], ['my-org', INK, '조직'], ['/', MUT, null], ['my-infra', ACC, 'program'], ['/', MUT, null], ['prod', INFO, 'stack']];
    let x = 160; segs.forEach(([s, col, lab], i) => { const w = tw(s, 18), op = fade(u, 0.5 + i * 0.15);
      mono(x, 192, s, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: op });
      if (lab) tx(x + w / 2, 290, lab, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.3 + i * 0.1) });
      if (lab) grow(x + w / 2, 204, x + w / 2, 270, E(u, 1.1 + i * 0.1, 1.5 + i * 0.1), col === INK ? MUT : col, {});
      x += w; });
    note('다음 장면: Pulumi Cloud 화면에서 같은 구조를 확인한다', 2.0, u, MUT, 360); }

  // =========================================================
  // 5. Pulumi Cloud 화면 — 같은 모델이 그대로 보인다
  // =========================================================
  function frame(u, k, url) { browser(480, 214, 920, 396, null, { s: 1 });
    mono(80, 33, url, { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
  const TREE = [['Organization: my-org', 0], ['Project: my-infra', 1], ['Stack: dev', 2], ['Stack: staging', 2], ['Stack: prod', 2]];
  function tree(k, u, grow0) { TREE.forEach(([s, d], i) => { const y = 88 + i * 34, op = grow0 ? fade(u, 0.2 + i * 0.3) : 1, on = i === 4;
      if (d && op > 0) el('path', { d: `M${44 + (d - 1) * 22},${y - 22} V${y - 5} H${40 + d * 22}`, fill: 'none', stroke: GRID, 'stroke-width': 2, opacity: op });
      mono(44 + d * 22, y, s, { 'font-size': 14, 'font-weight': on || i === 1 ? 800 : 600, fill: on ? ACC : i === 1 ? INFO : INK, opacity: op }); }); }
  const RES5 = [['aws:s3:Bucket', 'bucket-logs'], ['aws:sqs:Queue', 'queue-jobs'], ['aws:iam:Role', 'fn-worker-role'], ['aws:iam:RolePolicy', 'fn-worker-policy'], ['aws:lambda:Function', 'fn-worker']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 4) { frame(u, k, 'https://app.pulumi.com/my-org/my-infra/prod');
      el('line', { x1: 300, y1: 46, x2: 300, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
      if (k === 0) { [['my-org', 'org', INK, 258], ['my-infra', 'project = program', INFO, 336], ['prod', 'stack', ACC, 418]].forEach(([s, lab, col, x], i) => {
          card(x + 180, 150 + i * 70, 260, 50, { rx: 10, stroke: col, sw: 2.2, s: pop(u, 0.3 + i * 0.4) });
          mono(x + 100, 156 + i * 70, s, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.4) });
          tx(x + 300, 156 + i * 70, lab, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.4) }); });
        tx(160, 220, '주소 세 칸 =', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700 }); tx(160, 244, '조직 · program · stack', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
        return; }
      tree(k, u, k === 1);
      if (k === 1) { tx(600, 200, 'Organization → Project → Stack', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.4) });
        tx(600, 230, '코드 모델과 같은 순서다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.7) }); return; }
      // 오른쪽: prod 의 화면
      const tabs = ['Resources', 'Outputs', 'History', 'Settings'], tab = k === 3 ? Math.min(3, 1 + Math.floor(clamp((u - 0.3) / 0.6) * 3)) : 0;
      tabs.forEach((s, i) => { const x = 330 + i * 140; el('rect', { x, y: 62, width: 128, height: 30, rx: 6, fill: i === tab ? ACCBG : SOFT, stroke: i === tab ? ACC : GRID, 'stroke-width': 1.5 });
        tx(x + 64, 82, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: i === tab ? ACC : MUT }); });
      if (k === 2 || k === 4) { RES5.forEach(([ty, nm], i) => { const y = 132 + i * 40, op = k === 2 ? fade(u, 0.3 + i * 0.25) : 1;
          mono(340, y, ty, { 'font-size': 14, fill: MUT, opacity: op }); mono(560, y, '"' + nm + '"', { 'font-size': 14, 'font-weight': 700, opacity: op }); });
        if (k === 2) tx(600, 352, 'state에 있는 리소스가 그대로 목록이 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); }
      if (k === 3) { if (tab === 1) ['bucketName', 'queueUrl', 'functionArn'].forEach((s, i) => mono(340, 140 + i * 32, s, { 'font-size': 14.5, 'font-weight': 700 }));
        if (tab === 2) { for (let i = 0; i < 12; i++) { const x = 350 + i * 46, s = pop(u, 1.0 + i * 0.06); el('circle', { cx: x, cy: 160, r: 8 * s, fill: i === 11 ? ACC : OFF }); }
          el('line', { x1: 350, y1: 160, x2: 856, y2: 160, stroke: GRID, 'stroke-width': 2 });
          mono(600, 200, '12 updates · 누가 · 언제 · 무엇을', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC }); }
        if (tab === 3) ['멤버 권한 (RBAC)', 'secret provider'].forEach((s, i) => { lock(350, 140 + i * 40, true, INK, 0.8); tx(372, 146 + i * 40, s, { 'font-size': 15, 'font-weight': 600 }); });
        tx(600, 352, 'export 값 · 이력 · 권한이 stack마다 따로 붙는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }
      if (k === 4) { [2, 3].forEach((i) => { const y = 88 + i * 34; el('rect', { x: 66, y: y - 17, width: 220, height: 24, rx: 5, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.3 + (i - 2) * 0.3) }); });
        tx(160, 290, 'dev · staging도', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.8) }); tx(160, 312, '같은 하위 구조', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.9) });
        tx(600, 352, '환경을 늘려도 새로 배울 화면이 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5) }); }
      return; }
    if (k === 5) { const M = [['Resources', 'pulumi stack export'], ['Outputs', 'pulumi stack output'], ['History', 'pulumi history'], ['Settings', 'pulumi stack init / rm']];
      tx(240, 64, 'UI 메뉴', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: MUT }); tx(700, 64, 'CLI', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: MUT });
      M.forEach(([a, b], i) => { const y = 112 + i * 72, s = pop(u, 0.2 + i * 0.35);
        card(240, y, 200, 46, { rx: 10, stroke: INFO, sw: 2, text: a, fs: 15, s });
        grow(342, y, 568, y, E(u, 0.4 + i * 0.35, 0.9 + i * 0.35), ACC);
        card(700, y, 260, 46, { rx: 10, stroke: INK, sw: 1.8, text: b, fs: 14, mono: true, s: pop(u, 0.8 + i * 0.35) }); });
      note('UI가 없어도 CLI로 같은 정보를 얻는다', 2.2, u, MUT, 404); return; }
    if (k === 6) { const F = [['git push', '개발자 A'], ['pulumi preview', 'CI · dev'], ['리뷰', '리뷰어 B'], ['pulumi up', '승인 뒤'], ['History', 'SHA 기록']];
      F.forEach(([a, b], i) => { const x = 110 + i * 185, s = pop(u, 0.2 + i * 0.35);
        card(x, 190, 160, 70, { rx: 12, stroke: i === 1 ? ACC : i === 4 ? GOOD : INK, sw: 2.2, fill: i === 1 ? ACCBG : PANEL, s });
        mono(x, 186, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: s > 0.8 ? 1 : 0 });
        tx(x, 208, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s > 0.8 ? 1 : 0 });
        if (i < 4) grow(x + 82, 190, x + 102, 190, E(u, 0.4 + i * 0.35, 0.6 + i * 0.35), MUT); });
      dot([[110, 240], [850, 240]], seg(u, 0.4, 2.2), ACC, 7);
      note('preview 결과를 리뷰에 붙이면 인프라 변경도 코드 리뷰가 된다', 2.0, u, ACC, 320); return; }
    // k7: 왜 프로그램인가
    const T = [['에디터', '자동완성'], ['디버거', '중단점'], ['테스트', 'Jest · pytest'], ['타입 검사', '빨간 줄']];
    T.forEach(([a, b], i) => { const x = 150 + i * 220, s = pop(u, 0.2 + i * 0.3);
      card(x, 170, 190, 110, { rx: 14, stroke: GOOD, sw: 2.2, fill: C.GOODBG, s });
      tx(x, 165, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: s > 0.8 ? 1 : 0 });
      tx(x, 192, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: s > 0.8 ? 1 : 0 }); });
    tx(480, 290, '일반 언어를 쓰니 평소 개발 도구가 IaC에 그대로 붙는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
    tx(480, 322, '함수 · 클래스 · 패키지로 리소스를 묶는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); }

  const quiz = [
    { q: 'index.ts에서 new aws.s3.Bucket("bucket-logs", …) 한 줄이 실행되면 바로 일어나는 일은 무엇인가?',
      o: ['AWS에 버킷이 곧바로 만들어진다', '엔진에 리소스 하나가 등록되고, 클라우드에는 아직 아무것도 없다', 'state 파일에 버킷 ARN이 기록된다'], a: 1,
      why: 'new는 선언이다. 실제 생성은 pulumi up이 preview를 보여 주고 승인을 받은 뒤에 일어난다.' },
    { q: 'stack init으로 dev · staging · prod를 만든 직후 pulumi up을 치면 어느 stack이 바뀌나?',
      o: ['세 stack 모두', '맨 처음 만든 dev', '마지막으로 init 해서 선택돼 있는 prod'], a: 2,
      why: 'stack init은 만든 stack을 곧바로 선택한다. up은 선택된 stack 하나에만 적용되니 prod만 바뀐다.' },
    { q: '첫 pulumi up의 preview가 "+ 6 to create" 인데 코드의 리소스는 5개다. 하나 더 많은 까닭은 무엇인가?',
      o: ['Stack 자신도 pulumi:pulumi:Stack 리소스로 세기 때문', 'preview가 리소스를 두 번 세는 버그 때문', '승인 단계가 리소스 하나로 세지기 때문'], a: 0,
      why: '트리 맨 위의 pulumi:pulumi:Stack이 나머지 다섯의 부모로 함께 만들어진다. 그래서 5 + 1 = 6이다.' },
    { q: '한 program을 dev · staging · prod에 배포했다. dev의 bucket-logs와 prod의 bucket-logs는 어떤 관계인가?',
      o: ['같은 버킷을 함께 쓴다', 'prod가 dev 버킷을 복제해 쓴다', 'URN의 stack 자리가 달라 서로 다른 버킷이다'], a: 2,
      why: 'URN은 urn:pulumi:<stack>::<project>::<type>::<name> 꼴이다. stack이 다르면 다른 리소스이고 stack끼리 공유하지 않는다.' },
    { q: 'Pulumi Cloud 주소 app.pulumi.com/my-org/my-infra/prod에서 my-infra는 무엇에 해당하나?',
      o: ['program (project)', 'stack', '리소스 이름'], a: 0,
      why: '주소는 org / project / stack 순서다. project가 곧 program이고 prod가 stack이다.' },
  ];

  const summary = [
    'Pulumi program은 평범한 TypeScript 파일이고, new 한 줄이 리소스 등록 한 건이다.',
    '같은 program을 dev, staging, prod stack으로 나눠 배포하고 config 값만 바꾼다.',
    'pulumi up은 선택된 stack 하나에만 적용되고, 승인 뒤 의존 순서대로 리소스를 만든다.',
    '만든 리소스는 URN으로 state에 남고, URN에 stack 이름이 들어가 환경끼리 섞이지 않는다.',
  ];
  const review = [
    { q: 'prod에 배포하려던 변경이 dev에 들어갔다. 먼저 의심할 것은?',
      o: ['index.ts의 리소스 이름이 틀렸다', 'up 하기 전에 선택된 stack이 dev 였다', 'Pulumi Cloud가 stack을 섞었다'], a: 1,
      why: 'up은 선택된 stack 하나에만 적용된다. stack ls의 * 표시나 --stack 옵션으로 대상을 먼저 확인한다.' },
    { q: 'Lambda에 role.arn을 넘겼더니 preview에서 Role이 먼저, Lambda가 나중에 만들어진다. 이 순서는 어디서 왔나?',
      o: ['코드에서 Output을 넘긴 곳이 의존 선이 되어 엔진이 순서를 잡았다', '파일에 적은 줄 순서를 그대로 따랐다', 'AWS가 알파벳 순서로 만든다'], a: 0,
      why: 'role.arn은 아직 값이 없는 Output이다. 엔진은 이 연결을 보고 Role을 먼저 만들고, 의존이 없는 Bucket·Queue·Role은 동시에 만든다.' },
    { q: '같은 program으로 dev와 prod stack을 운영 중이다. prod만 로그를 365일 보관하려면 무엇을 바꾸나?',
      o: ['prod 전용 program을 새로 복사한다', 'dev의 state 파일을 prod로 복사한다', 'prod stack의 config 값 logRetentionDays만 바꾼다'], a: 2,
      why: 'program은 한 벌로 두고 환경 차이는 stack config로 표현한다. dev 7일, staging 30일, prod 365일이 그 예다.' },
  ];

  R.page({ title: 'program · stack · resource', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
