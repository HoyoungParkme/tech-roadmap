/* I-2-1 state 와 backend — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone,
    cross, check, lock, person, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 공통 부품 ----------
  function doc(cx, cy, w, h, title, rows, o) { o = o || {}; const x = cx - w / 2, y = cy - h / 2, col = o.col || INK, g = R.G(0, 0, 1, o.op);
    el('path', { d: `M${x},${y} H${x + w - 16} L${x + w},${y + 16} V${y + h} H${x} Z`, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash }, g);
    mono(x + 12, y + 22, title, { 'font-size': 13.5, 'font-weight': 700, fill: col }, g);
    (rows || []).forEach((r, i) => { const [s, rc] = Array.isArray(r) ? r : [r, null]; mono(x + 12, y + 46 + i * 21, s, { 'font-size': 13.5, fill: rc || o.rowCol || INK }, g); }); }
  function bucketIcon(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INFO;
    el('path', { d: 'M-22,-16 L-16,22 H16 L22,-16 Z', fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); el('ellipse', { cx: 0, cy: -16, rx: 22, ry: 7, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); }
  function cloudShape(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s);
    el('path', { d: 'M-44,18 H44 A20,20 0 0 0 40,-18 A28,28 0 0 0 -10,-26 A22,22 0 0 0 -44,-6 A12,12 0 0 0 -44,18 Z', fill: PANEL, stroke: col || INFO, 'stroke-width': 2.6 }, g); }
  function laptop(cx, cy, s, col) { if (s <= 0) return; const g = R.G(cx, cy, s), c = col || INK;
    el('rect', { x: -34, y: -26, width: 68, height: 42, rx: 4, fill: PANEL, stroke: c, 'stroke-width': 2.4 }, g); el('path', { d: 'M-46,20 H46 L40,28 H-40 Z', fill: c }, g); }
  const note = (s, u0, u, col, x, y) => tx(x || 480, y || 404, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: fade(u, u0) });

  // =========================================================
  // 1. state — desired(코드) 와 actual(기록) 을 비교한다
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    // 코드 (desired)
    card(160, 110, 270, 110, { rx: 12, stroke: ACC, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    tx(40, 72, '코드 · desired', { 'font-size': 14, 'font-weight': 800, fill: ACC });
    mono(40, 104, 'new aws.s3.BucketV2("data", {', { 'font-size': 13.5 }); mono(40, 126, '  bucket: "data-prod-2026" });', { 'font-size': 13.5 });
    // state (actual)
    const has = k === 3, lost = k === 4;
    doc(800, 110, 260, 110, 'state · actual', has ? ['Stack demo-dev', 'data → data-prod-2026'] : [[lost ? '기록이 사라졌다' : '아직 기록 없음', lost ? BAD : MUT]],
      { col: has ? GOOD : lost ? BAD : MUT, dash: has ? null : '6 5', fill: has ? C.GOODBG : PANEL, op: lost ? 1 : 1 });
    if (lost) cross(900, 80, 14, pop(u, 0.3));
    // 엔진
    card(480, 110, 150, 64, { rx: 32, stroke: INK, sw: 2.2, text: '엔진 · 비교', fs: 15, fw: 800, s: k === 0 ? pop(u, 0.6) : 1 });
    grow(296, 110, 402, 110, k === 0 ? E(u, 0.8, 1.2) : 1, ACC); grow(670, 110, 558, 110, k === 0 ? E(u, 0.8, 1.2) : 1, MUT);
    // AWS
    zone(620, 220, 320, 150, 'AWS', { fill: PANEL, stroke: INFO, dash: '7 5', color: INFO });
    const live = k >= 3; if (live) { bucketIcon(700, 300, k === 3 ? pop(u, 0.4) : 1, INFO); mono(735, 306, 'data-prod-2026', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.6) : 1 }); }
    if (k === 0) { note('코드는 "이렇게 있었으면" 만 말한다. 지금 무엇이 있는지는 모른다', 1.4, u, MUT, 480, 400); return; }
    if (k === 1) { dot([[296, 110], [402, 110]], seg(u, 0.2, 0.8), ACC, 7); dot([[670, 110], [558, 110]], seg(u, 0.2, 0.8), MUT, 7);
      card(300, 290, 460, 70, { rx: 12, stroke: GOOD, sw: 2.2, s: pop(u, 1.0) });
      tx(300, 286, '비교할 기록이 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      tx(300, 308, '그래서 코드에 적힌 것 전부를 create로 계산', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { const rows = [['+', 'pulumi:pulumi:Stack', 'demo-dev'], ['+', '└─ aws:s3:BucketV2', 'data']];
      el('rect', { x: 30, y: 210, width: 560, height: 150, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(46, 236, 'Previewing update (dev):', { 'font-size': 13.5, fill: MUT });
      rows.forEach(([a, b, n], i) => { const y = 268 + i * 28, op = fade(u, 0.3 + i * 0.4);
        mono(46, y, a, { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: op }); mono(70, y, b, { 'font-size': 14, opacity: op }); mono(330, y, n, { 'font-size': 14, 'font-weight': 700, opacity: op }); mono(460, y, 'create', { 'font-size': 14, fill: GOOD, opacity: op }); });
      mono(46, 342, 'Resources: + 2 to create', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      note('preview = desired와 actual의 차이', 1.8, u, INK, 780, 400); return; }
    if (k === 3) { dot([[480, 142], [480, 250], [700, 290]], seg(u, 0.2, 0.8), ACC, 7);
      dot([[735, 290], [800, 170]], seg(u, 1.0, 1.6), GOOD, 7);
      note('up의 마지막 일 = 만든 것을 state에 적는다', 1.8, u, GOOD, 300, 300); return; }
    // k4: 기록을 잃으면 또 만들려 한다
    pill(300, 220, '+ data  create', GOOD, pop(u, 0.6), { mono: true, fs: 15 });
    dot([[400, 220], [600, 260], [690, 290]], seg(u, 0.9, 1.5), ACC, 7);
    card(300, 310, 470, 56, { rx: 10, stroke: BAD, sw: 2.4, fill: C.BADBG, s: pop(u, 1.6) });
    mono(300, 316, 'error: BucketAlreadyOwnedByYou', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
    note('이미 있는 버킷을 또 만들려다 실패한다', 2.1, u, BAD, 300, 380); }

  // =========================================================
  // 2. backend — state 를 어디에 둘까
  // =========================================================
  const BK = [['Pulumi Cloud', 'app.pulumi.com', 160], ['S3 · GCS · Azure Blob', 's3:// · gs:// · azblob://', 480], ['로컬 파일', '~/.pulumi (file://~)', 800]];
  const SEL2 = [0, 1, 2, 0, 0];
  function s2(t, c) { const { k, u } = c;
    BK.forEach(([a, b, x], i) => { const on = SEL2[k] === i;
      card(x, 130, 280, 170, { rx: 14, stroke: on ? ACC : GRID, sw: on ? 2.8 : 1.6, fill: on ? ACCBG : PANEL });
      if (i === 0) cloudShape(x, 104, 0.9, on ? ACC : INFO); else if (i === 1) bucketIcon(x, 104, 1, on ? ACC : INFO); else laptop(x, 104, 0.9, on ? ACC : INK);
      tx(x, 164, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: on ? ACC : INK });
      mono(x, 188, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
    // state 파일이 고른 곳으로 날아간다
    const tgt = BK[SEL2[k]][2];
    if (k <= 2) fly(480, 300, tgt, 140, seg(u, 0.5, 1.3), 'state', { mono: true, fill: ACC });
    const cmd = ['$ pulumi login', '$ pulumi login s3://my-team-pulumi-state', '$ pulumi login --local', '$ pulumi whoami --verbose', '팀 = 원격 · 혼자 = 로컬'][k];
    pill(480, 286, cmd, INK, pop(u, 0.15), { mono: k < 4, fs: 15 });
    if (k === 0) { ['팀 공유', '이력', '잠금 자동'].forEach((s, i) => pill(240 + i * 160, 350, s, GOOD, pop(u, 1.4 + i * 0.25), { fs: 14 }));
      note('아무것도 고르지 않으면 기본값이 Pulumi Cloud다', 2.1, u, INK, 480, 400); return; }
    if (k === 1) { note('백업 · 권한 같은 보관 책임은 우리 몫이 된다', 1.8, u, WARN, 480, 350); return; }
    if (k === 2) { cross(870, 70, 12, pop(u, 1.6)); note('편하지만 PC가 날아가면 state도 같이 날아간다', 1.8, u, BAD, 480, 350); return; }
    if (k === 3) { R.terminal(250, 318, 460, 98, ['User:      hoyoung', 'Backend:   https://app.pulumi.com'], fade(u, 0.5) * 2, { fs: 14 }); return; }
    // k4: 기준 + 옮기기
    grow(690, 228, 270, 228, E(u, 0.4, 1.4), ACC);
    pill(480, 326, 'stack export → stack import', ACC, pop(u, 1.2), { mono: true, fs: 14 });
    tx(160, 252, '팀 작업', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) });
    tx(800, 252, '실습 · CI 임시', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.5) });
    note('backend를 바꿀 때는 state를 꺼내서 옮겨 담는다', 1.9, u, INK, 480, 372); }

  // =========================================================
  // 3. state 에 담기는 것 — URN · outputs · 의존성 · secret
  // =========================================================
  const J = [[0, '{ "version": 3,'], [0, '  "deployment": { "resources": ['],
    [1, '    { "urn": "urn:pulumi:dev::demo::…::data",'], [1, '      "type": "aws:s3/bucketV2:BucketV2",'],
    [2, '      "outputs": { "bucket": "data-prod-2026",'], [2, '        "arn": "arn:aws:s3:::data-prod-2026" } },'],
    [3, '    { "urn": "…:Function::resizeFn",'], [3, '      "dependencies": [ "…::data" ],'],
    [4, '      "outputs": { "dbPassword": {'], [4, '        "4dabf18…": "1b47061…",'], [4, '        "ciphertext": "AAABAM8x…" } } } ] } }']];
  function s3(t, c) { const { k, u } = c;
    el('rect', { x: 16, y: 16, width: 460, height: 388, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(30, 40, 'state.json (일부)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    J.filter(([a]) => a <= k).forEach(([a, s], i) => { const y = 70 + i * 26, cur = a === k, op = cur ? fade(u, 0.2 + (i % 3) * 0.15) : 1;
      if (cur) el('rect', { x: 22, y: y - 17, width: 448, height: 24, rx: 4, fill: ACCBG, opacity: op });
      R.spans(30, y, R.tokens(s), { 'font-size': 13.5, opacity: op }); });
    if (k === 0) { tx(710, 120, '사람이 읽을 수 있는 JSON', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.6) });
      for (let i = 0; i < 4; i++) el('rect', { x: 560 + i * 92, y: 170, width: 80, height: 60, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.9 + i * 0.15) });
      tx(710, 262, 'resources 배열에 리소스가 하나씩 들어간다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      note('손으로 고치는 파일은 아니다', 2.0, u, WARN, 710, 330); return; }
    if (k === 1) { const P = [['stack', 'dev', ACC], ['project', 'demo', INFO], ['type', 'aws:s3/bucketV2:BucketV2', WARN], ['name', 'data', GOOD]];
      P.forEach(([a, b, col], i) => { const y = 90 + i * 58, s = pop(u, 0.3 + i * 0.3);
        card(560, y, 100, 40, { rx: 20, stroke: col, sw: 2, text: a, fs: 15, fw: 800, color: col, s });
        mono(620, y + 5, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.3) }); });
      card(710, 345, 440, 52, { rx: 10, stroke: BAD, sw: 2, fill: C.BADBG, s: pop(u, 1.7) });
      tx(710, 351, '이름을 바꾸면 URN이 바뀌어 다른 리소스가 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { bucketIcon(560, 150, pop(u, 0.3), INFO);
      [['bucket', 'data-prod-2026'], ['arn', 'arn:aws:s3:::data-prod-2026']].forEach(([a, b], i) => { const y = 130 + i * 44, op = fade(u, 0.6 + i * 0.4);
        mono(600, y, a, { 'font-size': 14, fill: MUT, opacity: op }); mono(660, y, b, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); });
      tx(710, 270, '클라우드가 돌려준 실제 값', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.4) });
      tx(710, 296, 'ARN은 코드에 없던 값이다. 다음 비교의 기준이 된다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) }); return; }
    if (k === 3) { card(600, 130, 150, 50, { rx: 10, stroke: INFO, sw: 2.2, text: 'data (버킷)', fs: 15, fw: 800, s: pop(u, 0.2) });
      card(840, 130, 150, 50, { rx: 10, stroke: ACC, sw: 2.2, text: 'resizeFn', fs: 15, fw: 800, mono: true, s: pop(u, 0.4) });
      grow(762, 130, 680, 130, E(u, 0.6, 1.1), ACC); tx(720, 116, '의존', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
      [['만들 때', 'data → resizeFn', GOOD], ['지울 때', 'resizeFn → data', BAD]].forEach(([a, b, col], i) => { const y = 230 + i * 60, s = pop(u, 1.3 + i * 0.4);
        card(720, y, 360, 46, { rx: 10, stroke: col, sw: 2, s });
        tx(570, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: s > 0.8 ? 1 : 0 }); mono(660, y + 5, b, { 'font-size': 15, 'font-weight': 700, opacity: s > 0.8 ? 1 : 0 }); });
      note('기록이 없으면 버킷부터 지워 Lambda가 깨진다', 2.2, u, BAD, 710, 372); return; }
    // k4: secret
    const m = E(u, 0.6, 1.4);
    card(710, 120, 360, 60, { rx: 10, stroke: m < 0.5 ? BAD : GOOD, sw: 2.4, fill: m < 0.5 ? C.BADBG : C.GOODBG });
    mono(710, 127, m < 0.5 ? 'dbPassword = "s3cr3t"' : 'dbPassword = AAABAM8x…', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: m < 0.5 ? BAD : GOOD });
    if (m >= 0.5) lock(540, 120, true, GOOD, pop(u, 1.3));
    tx(710, 200, m < 0.5 ? '평문이면 파일만 훔쳐도 읽힌다' : 'backend의 키로 암호화해 둔다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: m < 0.5 ? BAD : GOOD });
    ['URN', 'outputs', 'dependencies', 'secret (암호문)'].forEach((s, i) => pill(560 + i * 0 + (i % 2) * 220, 270 + Math.floor(i / 2) * 50, s, ACC, pop(u, 1.6 + i * 0.15), { fs: 14 }));
    note('state에 담기는 네 가지', 2.2, u, INK, 670, 380); }

  // =========================================================
  // 4. 잠금 — 동시 배포를 막는다 (S3 backend 예)
  // =========================================================
  const TX0 = 190, TX1 = 600;
  function s4(t, c) { const { k, u } = c;
    if (k <= 4) {
      person(90, 100, 'A · hoyoung', { s: 0.85, stroke: ACC }); person(90, 250, 'B · minji', { s: 0.85, stroke: INFO });
      el('line', { x1: TX0, y1: 340, x2: TX1, y2: 340, stroke: GRID, 'stroke-width': 2 }); tx(TX1, 364, '시간 →', { 'text-anchor': 'end', 'font-size': 13.5, fill: MUT });
      // 버킷 안 lock 폴더
      zone(640, 40, 300, 300, null, { fill: PANEL, stroke: INFO, dash: '7 5' });
      mono(654, 64, 's3://my-team-pulumi-state', { 'font-size': 13.5, 'font-weight': 700, fill: INFO }); mono(654, 86, '  .pulumi/locks/demo/dev/', { 'font-size': 13.5, fill: MUT });
      // A 막대
      const aEnd = k <= 2 ? lerp(TX0 + 40, TX0 + 330, k === 0 ? E(u, 0.2, 2.2) : 1) : TX0 + 330;
      const aDead = k === 4;
      el('rect', { x: TX0, y: 88, width: (k === 0 ? aEnd - TX0 : k <= 2 ? 330 : 330), height: 24, rx: 6, fill: aDead ? OFF : ACC, opacity: 0.85 });
      mono(TX0 + 10, 105, aDead ? 'pulumi up (프로세스 죽음)' : 'pulumi up', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
      if (k >= 3 && !aDead) { check(TX0 + 345, 100, 9, k === 3 ? pop(u, 0.3) : 1); }
      if (aDead) cross(TX0 + 345, 100, 10, pop(u, 0.3));
      // lock 파일
      const held = k <= 2 || (k === 4 && u < 1.6);
      const lockOp = k === 0 ? fade(u, 0.5) : k === 3 ? 1 - fade(u, 0.3, 0.6) : k === 4 ? 1 - fade(u, 1.6, 0.5) : 1;
      if (lockOp > 0.02) { lock(670, 140, true, aDead ? WARN : ACC, lockOp);
        mono(692, 146, '<id>.json', { 'font-size': 14, 'font-weight': 800, fill: aDead ? WARN : ACC, opacity: lockOp });
        mono(660, 176, 'created by hoyoung@laptop', { 'font-size': 13.5, opacity: lockOp }); mono(660, 198, '(pid 4312)', { 'font-size': 13.5, fill: MUT, opacity: lockOp });
        mono(660, 220, 'at 2026-08-11T09:12:44Z', { 'font-size': 13.5, fill: MUT, opacity: lockOp }); }
      if (k === 0) { dot([[TX0 + 40, 100], [660, 140]], seg(u, 0.3, 0.8), ACC, 7); note('up을 시작하면 lock 파일부터 만든다', 1.6, u, ACC, 410, 404); return; }
      // B 막대
      if (k === 1 || k === 2) { el('rect', { x: TX0 + 90, y: 238, width: 30 * (k === 1 ? E(u, 0.2, 0.6) : 1), height: 24, rx: 6, fill: INFO, opacity: 0.85 });
        cross(TX0 + 140, 250, 11, k === 1 ? pop(u, 0.7) : 1);
        card(410, 300, 420, 50, { rx: 8, stroke: BAD, sw: 2, fill: C.BADBG, s: k === 1 ? pop(u, 1.0) : 1 });
        mono(410, 296, 'error: the stack is currently locked', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: BAD });
        mono(410, 316, 'by 1 lock(s)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD });
        if (k === 1) note('B는 state를 덮어쓸 기회가 없다', 1.8, u, INK, 410, 404);
        if (k === 2) { el('rect', { x: 652, y: 158, width: 280, height: 72, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
          note('누가 언제 쥐었는지 보고 기다릴지 물어볼지 정한다', 1.0, u, WARN, 410, 404); }
        return; }
      if (k === 3) { const g = E(u, 0.9, 2.2); el('rect', { x: TX0 + 340, y: 238, width: 30 + 200 * g, height: 24, rx: 6, fill: INFO, opacity: 0.85 });
        mono(TX0 + 350, 255, 'B · up', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
        if (u > 1.2) { lock(670, 140, true, INFO, pop(u, 1.2)); mono(692, 146, 'B의 lock', { 'font-size': 14, 'font-weight': 800, fill: INFO }); }
        note('끝나면 잠금이 저절로 풀리고 B가 이어 간다', 1.6, u, GOOD, 410, 404); return; }
      // k4: 남은 lock 을 cancel 로
      pill(410, 250, '$ pulumi cancel', WARN, pop(u, 1.0), { mono: true, fs: 15 });
      dot([[480, 250], [670, 160]], seg(u, 1.2, 1.6), WARN, 7);
      card(410, 310, 430, 46, { rx: 10, stroke: BAD, sw: 2, text: '배포 중에 쓰면 state가 어긋날 수 있다', fs: 14.5, color: BAD, s: pop(u, 1.9) });
      note('프로세스가 죽어 lock만 남았을 때만 쓴다', 2.2, u, WARN, 410, 404); return; }
    // k5: 로컬 backend 둘 — 서로를 모른다
    [['A의 PC', 230, ACC], ['B의 PC', 730, INFO]].forEach(([nm, x, col], i) => { const s = pop(u, 0.2 + i * 0.3);
      laptop(x, 90, s * 1.1, col); tx(x, 140, nm, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: s });
      doc(x, 210, 220, 80, '~/.pulumi/…/dev.json', [i === 0 ? 'A가 만든 것' : 'B가 만든 것'], { col, op: fade(u, 0.7 + i * 0.3) });
      lock(x + 90, 160, true, col, pop(u, 1.0 + i * 0.3) * 0.8); });
    zone(330, 280, 300, 90, 'AWS', { fill: PANEL, stroke: INFO, dash: '7 5', color: INFO, op: fade(u, 1.4) });
    dot([[230, 250], [430, 330]], seg(u, 1.5, 2.1), ACC, 7); dot([[730, 250], [530, 330]], seg(u, 1.5, 2.1), INFO, 7);
    tx(480, 210, '잠금이 각자의 PC에만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) });
    note('차단 없이 둘 다 배포해 state가 서로 어긋난다', 2.2, u, BAD, 480, 404); }

  // =========================================================
  // 5. export / import — state 를 지키고 옮긴다
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { cloudShape(200, 170, pop(u, 0.2) * 1.2, INFO); mono(200, 236, 'stack dev의 state', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
      pill(480, 110, '$ pulumi stack export --file …', INK, pop(u, 0.4), { mono: true, fs: 14 });
      fly(260, 170, 700, 170, seg(u, 0.7, 1.5), 'JSON', { mono: true });
      doc(760, 180, 250, 80, 'backup-2026-08-11.json', ['현재 state 그대로'], { col: GOOD, op: fade(u, 1.5) });
      note('export는 읽기만 한다. 부담 없이 자주 돌린다', 1.9, u, GOOD, 480, 330); return; }
    // k1~k2: 로컬 → Pulumi Cloud
    if (k === 1 || k === 2) { laptop(170, 160, 1.2, INK); tx(170, 220, '로컬 backend', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
      cloudShape(790, 160, 1.3, k === 2 ? ACC : GRID); tx(790, 220, 'Pulumi Cloud', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: k === 2 ? ACC : MUT });
      if (k === 1) { pill(480, 300, '$ pulumi login --local', INK, pop(u, 0.2), { mono: true, fs: 14 });
        pill(480, 344, '$ pulumi stack export --file move.json', INK, pop(u, 0.6), { mono: true, fs: 14 });
        fly(170, 160, 480, 150, seg(u, 1.0, 1.8), 'move.json', { mono: true, stay: true }); return; }
      ['$ pulumi login', '$ pulumi stack init demo-dev', '$ pulumi stack import --file move.json'].forEach((s, i) => pill(480, 290 + i * 40, s, i === 2 ? ACC : INK, pop(u, 0.2 + i * 0.4), { mono: true, fs: 14 }));
      fly(480, 150, 790, 160, seg(u, 1.3, 2.1), 'move.json', { mono: true });
      if (u > 2.1) check(840, 130, 12, pop(u, 2.1));
      tx(790, 100, u < 1.0 ? '빈 stack' : 'demo-dev', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) }); return; }
    if (k === 3) { const P = [['export', 200, INFO], ['JSON 수정', 480, WARN], ['import', 760, GOOD]];
      P.forEach(([a, x, col], i) => { card(x, 160, 200, 70, { rx: 14, stroke: col, sw: 2.4, text: a, fs: 17, fw: 800, color: col, s: pop(u, 0.2 + i * 0.4) });
        if (i < 2) grow(x + 102, 160, x + 178, 160, E(u, 0.5 + i * 0.4, 0.9 + i * 0.4), MUT); });
      el('path', { d: 'M760,197 C760,270 200,270 200,197', fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
      card(480, 320, 520, 50, { rx: 10, stroke: BAD, sw: 2, text: 'backend 안의 파일을 직접 고치지 않는다', fs: 15, color: BAD, s: pop(u, 1.7) }); return; }
    // k4: 실무 3원칙
    [['팀은 원격 backend', '잠금 + 공유'], ['정기 export 백업', '유실 대비'], ['수정은 export → import', '그 길로만']].forEach(([a, b], i) => {
      const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4);
      card(x, 180, 280, 120, { rx: 14, stroke: GOOD, sw: 2.4, fill: C.GOODBG, s });
      mono(x, 140, String(i + 1), { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: s > 0.8 ? 1 : 0 });
      tx(x, 186, a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: s > 0.8 ? 1 : 0 });
      tx(x, 212, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: s > 0.8 ? 1 : 0 }); });
    note('state는 코드와 실제를 잇는 유일한 기록이다', 1.8, u, INK, 480, 320); }

  const quiz = [
    { q: '처음 pulumi up을 하면 preview가 전부 create로 나온다. 그 까닭은 무엇인가?',
      o: ['비교할 state가 비어 있어서', '코드에 create라고 적어서', 'AWS가 아직 응답하지 않아서'], a: 0,
      why: '엔진은 코드(desired)와 state(actual)의 차이를 계산한다. 기록이 없으니 Stack과 BucketV2 두 건이 모두 create다.' },
    { q: '팀이 데이터를 외부 SaaS에 둘 수 없다. state를 어디에 두나?',
      o: ['pulumi login만 쳐서 기본값에', '코드 저장소 git 안에', 'pulumi login s3://… 로 우리 버킷에'], a: 2,
      why: '셀프 매니지드 backend는 s3:// gs:// azblob://로 우리 클라우드에 둔다. 대신 백업과 권한은 우리가 챙긴다.' },
    { q: 'state에 resizeFn → data 의존이 적혀 있다. 둘을 지울 때 순서는 무엇인가?',
      o: ['data를 먼저, resizeFn을 나중에', 'resizeFn을 먼저, data를 나중에', '둘을 동시에'], a: 1,
      why: '의존하는 쪽부터 지운다. 버킷을 먼저 지우면 그 버킷을 쓰는 Lambda가 깨진다.' },
    { q: 'S3 backend에서 A가 up 하는 중에 B도 up 했다. B에게 일어나는 일은?',
      o: ['the stack is currently locked 오류로 바로 멈춘다', 'A의 기록 위에 그대로 덮어쓴다', 'A의 up을 취소시킨다'], a: 0,
      why: 'up이 시작될 때 lock 파일이 생긴다. B는 누가 언제 잠갔는지 보고 기다리거나 물어본다.' },
    { q: '로컬 backend의 stack을 Pulumi Cloud로 옮기는 순서로 맞는 것은?',
      o: ['login → stack import → stack export', '~/.pulumi 폴더를 통째로 업로드', 'login --local에서 stack export → login → stack init → stack import'], a: 2,
      why: '옮길 state를 먼저 꺼낸 뒤, 원격으로 전환해 빈 stack을 만들고 import로 밀어 넣는다.' },
  ];

  const summary = [
    '코드는 원하는 모습만 적고, 실제로 만든 것은 state에 기록된다.',
    '엔진은 코드와 state를 비교해 만들 것과 바꿀 것을 정한다. state를 잃으면 이미 있는 버킷을 또 만든다.',
    'state에는 URN, outputs, 의존성, 암호화된 secret이 들어 있다.',
    '팀은 잠금이 되는 원격 backend를 쓰고, export로 백업하며, 고칠 때도 export와 import로 한다.',
  ];
  const review = [
    { q: '노트북을 바꾼 뒤 pulumi up을 했더니 이미 있는 버킷을 만들려다 실패했다. 먼저 의심할 것은?',
      o: ['--local backend라 state가 옛 노트북에만 있었다', 'AWS 리전이 바뀌었다', 'TypeScript 버전이 달라졌다'], a: 0,
      why: '로컬 backend의 state는 그 PC의 ~/.pulumi 아래에 있다. 기록이 없으니 엔진은 버킷을 create로 계산했다.' },
    { q: '배포 도중 CI 러너가 강제로 꺼졌고, 다음 up이 계속 locked로 거부된다. 해야 할 일은?',
      o: ['state.json을 지우고 다시 up 한다', 'stack을 새 이름으로 만든다', '아무도 배포 중이 아닌지 확인하고 pulumi cancel로 lock을 지운다'], a: 2,
      why: '프로세스가 죽어 lock만 남은 경우다. 배포 중에 cancel 하면 state가 어긋날 수 있으니 먼저 확인한다.' },
    { q: 'state 파일이 유출됐다. 그 안의 dbPassword는 어떤 상태인가?',
      o: ['평문이라 바로 읽힌다', 'backend의 키로 암호화돼 파일만으로는 못 읽는다', 'state에는 아예 들어가지 않는다'], a: 1,
      why: 'secret은 ciphertext로 저장된다. URN이나 outputs는 읽혀도 secret 값은 키가 있어야 풀린다.' },
  ];

  R.page({ title: 'state와 backend', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
