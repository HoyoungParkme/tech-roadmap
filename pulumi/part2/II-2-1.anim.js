/* II-2-1 Transformations — 공통 속성 일괄 수정 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 등록 직전에 args(type·name·props·opts)를 받는 동작, 컴포넌트에 건 옵션이 자식에 닿는 범위, transforms 로 옮겨 가는 흐름은
 * pulumi.com/docs (Transformations · Transforms) 로 확인했다. 타입 토큰(aws:s3/bucketV2:BucketV2 등)과 BucketV2 의
 * serverSideEncryptionConfigurations 모양은 @pulumi/aws 6 타입으로 확인했고, 코드는 tsc --noEmit 으로 확인했다.
 * 태그 합치기 결과(개별 값이 우선)는 파이썬으로 같은 spread 규칙을 돌려 맞췄다. pulumi CLI 가 없어 실제 실행 출력은 없다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 페이지 데이터의 짧은 타입을 실제 타입 토큰으로
  const TOK = { 'aws:s3:BucketV2': 'aws:s3/bucketV2:BucketV2', 'aws:ec2:Instance': 'aws:ec2/instance:Instance', 'aws:dynamodb:Table': 'aws:dynamodb/table:Table', 'aws:sqs:Queue': 'aws:sqs/queue:Queue' };
  const tok = (t) => TOK[t] || t;

  // 검색대(gate): 세로 띠. 위에 이름, 안에 줄 몇 개
  function gate(x, y, w, h, title, lines, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || WARNBG, stroke: o.col || WARN, 'stroke-width': 2.5, opacity: op });
    [0, 1].forEach((i) => el('rect', { x: x + (i ? w - 10 : 0), y: y - 8, width: 10, height: h + 16, rx: 3, fill: o.col || WARN, opacity: op }));
    tx(x + w / 2, y + 24, title, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: o.col || WARN, opacity: op, class: 'mono' });
    (lines || []).forEach((s, i) => mono(x + 20, y + 52 + i * 22, s, { 'font-size': 13.5, opacity: op * (o.lineOp ? o.lineOp(i) : 1) })); }
  // 리소스 카드: 타입 토큰 · 이름 · 속성 한 줄
  function res(cx, cy, r, text, o) { o = o || {}; const w = o.w || 240, h = 78, s = o.s ?? 1; if (s <= 0) return;
    const col = o.col || INK, g = card(cx, cy, w, h, { rx: 10, stroke: col, sw: o.sw || 2, fill: o.fill || PANEL, s, op: o.op, dash: o.dash });
    mono(-w / 2 + 12, -15, tok(r.type), { 'font-size': 13.5, fill: MUT }, g);
    mono(-w / 2 + 12, 6, r.name, { 'font-size': 15, 'font-weight': 800, fill: col }, g);
    mono(-w / 2 + 12, 28, text, { 'font-size': 13.5, fill: o.tcol || INK }, g); return g; }

  // 세 줄 흐름: 왼쪽(코드가 만든 값) → 가운데 검색대 → 오른쪽(엔진에 등록될 값)
  const LX = 150, GX = 340, GW = 240, RX = 790, RY = [110, 210, 310];
  function rows(c, o) { const { k, u } = c, rs = c.beat.resources, prev = c.prev ? c.prev.resources : null;
    rs.forEach((r, i) => { const y = RY[i], was = prev && prev[i] ? prev[i].after : null, fresh = was !== r.after || k === 0;
      res(LX, y, r, r.before, { w: 260 });
      if (r.changed && fresh) dot([[LX + 130, y], [GX + GW / 2, y], [RX - 150, y]], seg(u, 0.3 + i * 0.25, 1.3 + i * 0.25), ACC, 7);
      const op = fresh ? fade(u, 1.1 + i * 0.25) : 1;
      res(RX, y, r, r.after, { w: 300, col: r.changed ? ACC : GRID, fill: r.changed ? ACCBG : PANEL, tcol: r.changed ? ACC : MUT, op: Math.max(op, 0.001) });
      if (o && o.icon) o.icon(r, i, y, op); });
    tx(LX, 54, '코드가 넘긴 값', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT });
    tx(RX, 54, '엔진에 등록될 값', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }); }

  // ---------- 1. 등록 직전 가로채기 ----------
  function s1(t, c) { const { k, u } = c, r = c.beat.resources[0];
    if (k <= 2) {
      // 엔진 쪽
      card(860, 90, 150, 56, { rx: 10, text: '엔진에 등록', fs: 15, fill: SOFT, stroke: GRID });
      gate(400, 40, 160, 250, '검색대', [], { op: 1 });
      const bx = k === 0 ? lerp(120, 330, E(u, 0.2, 1.0)) : k === 1 ? 330 : lerp(330, 760, E(u, 0.3, 1.3));
      res(bx, 160, r, '{ bucket }', { w: 200, col: k === 2 ? GOOD : INK });
      if (k === 2 && u > 1.3) check(890, 214, 12, pop(u, 1.3));
      // args 네 칸
      const A = [['type', '"aws:s3/bucketV2:BucketV2"'], ['name', '"imagesBucket"'], ['props', '{ bucket: "images-prod-2026" }'], ['opts', 'ResourceOptions']];
      if (k === 0) A.forEach(([a, v], i) => { const y = 310 + i * 26, op = fade(u, 1.0 + i * 0.3);
        mono(40, y, 'args.' + a, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: op }); mono(170, y, v, { 'font-size': 14, opacity: op }); });
      if (k === 1) { card(480, 340, 520, 70, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.2), text: 'function addCommonTags(args)\n  : ResourceTransformationResult | undefined', fs: 14, mono: true, color: ACC });
        grow(480, 290, 480, 302, seg(u, 0.7, 1.0), ACC); sub(800, 360, '함수 하나가 곧 hook', fade(u, 1.2), { 'font-weight': 700 }); }
      if (k === 2) { pill(480, 340, 'return { props: args.props, opts: args.opts }', ACC, pop(u, 0.2), { mono: true, fs: 14, fill: PANEL });
        note(480, 390, '아직 아무것도 고치지 않았다 · 그대로 등록', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT }); }
      return; }
    // k3: 바꾸기 vs 막기
    zone(30, 40, 430, 330, 'Transformation · 바꾼다', { fill: ACCBG, stroke: ACC, color: ACC });
    zone(500, 40, 430, 330, 'CrossGuard · 막는다', { fill: BADBG, stroke: BAD, color: BAD });
    pill(140, 130, 'tags: { }', INK, pop(u, 0.2), { mono: true, fs: 14, fill: PANEL });
    grow(200, 130, 260, 130, seg(u, 0.5, 0.9), ACC);
    pill(345, 130, 'tags: { team, … }', ACC, pop(u, 0.9), { mono: true, fs: 14, fill: PANEL });
    sub(245, 190, '등록될 값 자체가 달라진다', fade(u, 1.2), { 'font-weight': 700, fill: ACC });
    pill(610, 130, '암호화 없음', INK, pop(u, 0.4), { fs: 14, fill: PANEL });
    el('rect', { x: 700, y: 92, width: 12, height: 76, rx: 3, fill: BAD, opacity: fade(u, 0.8) });
    cross(706, 130, 14, pop(u, 1.1));
    sub(715, 190, '값은 그대로 · 통과 여부만 정한다', fade(u, 1.4), { 'font-weight': 700, fill: BAD });
    note(480, 300, '같은 등록 길목에서 하나는 고치고 하나는 거른다', fade(u, 1.9), { 'text-anchor': 'middle' }); }

  // ---------- 2. 공통 태그 강제 ----------
  function s2(t, c) { const { k, u } = c;
    const L = ['COMMON_TAGS = {', '  team: "platform",', '  env: getStack(),', '  managedBy: "pulumi" }'];
    const L2 = k >= 1 ? ['if ("tags" in props)', '  tags = {', '    ...COMMON_TAGS,', '    ...props.tags }'] : L;
    gate(GX, 70, GW, 290, k === 0 ? '공통 태그' : 'stack 전체 hook', L2, { lineOp: (i) => (k <= 1 ? fade(u, 0.3 + i * 0.25) : 1) });
    if (k >= 2) sub(GX + GW / 2, 300, '공통 먼저, 개별이 나중(우선)', k === 2 ? fade(u, 1.6) : 1, { 'font-weight': 700, fill: WARN });
    if (k === 0) { sub(GX + GW / 2, 290, 'env = stack 이름', fade(u, 1.4), { 'font-weight': 700 }); sub(GX + GW / 2, 312, '(dev · staging · prod)', fade(u, 1.6)); }
    rows(c);
    if (k === 1) c.beat.resources.forEach((r, i) => { check(GX - 26, RY[i], 9, pop(u, 0.6 + i * 0.25)); });
    if (k === 4) banner(480, 396, '태그를 깜빡할 자리가 없다', pop(u, 1.8)); }

  // ---------- 3. 타입별 보안 기본값 ----------
  function s3(t, c) { const { k, u } = c;
    const L = ['if (type === S3)', '  암호화 ??= AES256', 'if (type === EC2)', '  monitoring = true', 'return { props, opts }'];
    const hot = [[0, 1], [0, 1], [2, 3], [4], [1, 3]][k];
    gate(GX, 70, GW, 290, 'args.type으로 분기', L, { col: INFO, fill: INFOBG, lineOp: (i) => (hot.includes(i) ? 1 : 0.35) });
    if (k === 4) { el('rect', { x: 20, y: 372, width: 920, height: 44, rx: 10, fill: SOFT });
      mono(36, 400, '개발자가 "aws:kms" 를 줬다면', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.2) });
      pill(470, 394, '??= → aws:kms 유지', GOOD, pop(u, 0.6), { mono: true, fs: 14, fill: PANEL });
      pill(720, 394, '= → AES256로 덮어씀', BAD, pop(u, 1.0), { mono: true, fs: 14, fill: PANEL }); }
    rows(c, { icon: (r, i, y, op) => { if (!r.changed) return;
      if (i === 0) lock(RX + 128, y - 18, true, ACC, op);
      if (i === 1) { el('circle', { cx: RX + 128, cy: y - 18, r: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: op }); el('path', { d: `M${RX + 128},${y - 18} L${RX + 135},${y - 25}`, stroke: ACC, 'stroke-width': 2.5, opacity: op }); } } }); }

  // ---------- 4. 범위 좁히기 ----------
  const TN = [['Stack', '', 0, 70], ['PaymentComponent', 'payment', 1, 150], ['aws:sqs/queue:Queue', 'payment-queue', 2, 230], ['aws:s3/bucketV2:BucketV2', 'external-logs', 1, 330]];
  function s4(t, c) { const { k, u } = c, rs = c.beat.resources, q = rs[1];
    const sub2 = k >= 2, whole = k === 4;
    // 적용 범위 칠하기
    if (whole) { el('rect', { x: 26, y: 44, width: 500, height: 330, rx: 12, fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.3) });
      tx(40, 396, 'registerStackTransformation = 이 트리 전체', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) }); }
    if (sub2) { const a = k === 2 ? E(u, 0.6, 1.6) : 1; el('rect', { x: 66, y: 120, width: 440, height: 70 + 80 * a, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: 0.9 }); }
    // 트리 선
    el('path', { d: 'M52,86 V330 M52,150 H76 M52,330 H76 M100,166 V230 H124', fill: 'none', stroke: GRID, 'stroke-width': 2 });
    TN.forEach(([ty, nm, d, y], i) => { const x = 40 + d * 42;
      el('circle', { cx: x + 12, cy: y, r: 6, fill: i === 3 && k === 3 ? WARN : INK });
      mono(x + 28, y + 5, ty, { 'font-size': 14, 'font-weight': 700, fill: i === 3 && k === 3 ? WARN : INK });
      if (nm) { const renamed = i === 2 && (k > 2 || (k === 2 && u > 1.4));
        mono(x + 28, y + 28, i === 2 ? 'name: ' + (renamed ? 'pci-payment-queue' : 'payment-queue') : 'name: ' + nm, { 'font-size': 14, fill: renamed ? ACC : MUT, 'font-weight': renamed ? 800 : 400 }); } });
    if (k === 3) { cross(480, 330, 11, pop(u, 0.4)); note(300, 380, '서브트리 밖이라 hook을 지나지 않는다', fade(u, 0.8), { fill: WARN }); }
    // 오른쪽: hook 함수
    const FX = 740, FY = 120;
    card(FX, FY, 330, 74, { rx: 10, stroke: k === 5 ? GRID : ACC, fill: PANEL, text: 'applyPciNaming(args)\nname이 있으면 pci- 를 붙인다', fs: 14, mono: false, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { grow(FX - 165, FY, 540, 150, seg(u, 0.8, 1.4), MUT, { dash: '5 5', plain: true }); cross(560, 146, 9, pop(u, 1.4)); note(FX, 200, '아직 어디에도 안 걸림', fade(u, 1.5), { 'text-anchor': 'middle', fill: MUT }); }
    if (k === 1) { pill(FX, 220, 'payment-queue', INK, pop(u, 0.3), { mono: true, fs: 14, fill: PANEL }); grow(FX, 238, FX, 262, seg(u, 0.7, 1.0), ACC);
      pill(FX, 280, 'pci-payment-queue', ACC, pop(u, 1.0), { mono: true, fs: 14, fill: ACCBG }); sub(FX, 322, '"name" in props를 먼저 본다', fade(u, 1.4)); }
    if (k >= 2 && k <= 4) { grow(FX - 165, FY + 20, 400, 150, k === 2 ? seg(u, 0.2, 0.7) : 1, ACC);
      pill(FX, 230, '{ transformations: [applyPciNaming] }', ACC, k === 2 ? pop(u, 0.4) : 1, { mono: true, fs: 13.5, fill: PANEL }); }
    if (k === 4) { pill(FX, 300, 'registerStackTransformation(fn)', INFO, pop(u, 0.6), { mono: true, fs: 13.5, fill: PANEL }); sub(FX, 336, '넓게(stack) · 좁게(옵션)', fade(u, 1.0), { 'font-weight': 700 }); }
    if (k === 5) { ['registerResourceTransform(fn)', '{ transforms: [fn] }', 'fn은 async도 된다'].forEach((s, i) => pill(FX, 220 + i * 50, s, i < 2 ? ACC : INK, pop(u, 0.3 + i * 0.3), { mono: i < 2, fs: 14, fill: PANEL }));
      sub(FX, 380, '문서: transformations는 앞으로 deprecated', fade(u, 1.5), { fill: WARN, 'font-weight': 700 }); } }

  // ---------- 5. 바꾸기 vs 막기 ----------
  const ST = [['new BucketV2', 90], ['Transformation', 270], ['엔진 등록', 450], ['CrossGuard', 640], ['배포', 840]];
  function s5(t, c) { const { k, u } = c;
    ST.forEach(([s, x], i) => { const on = (i === 1 && (k === 0 || k === 3)) || (i === 3 && k >= 1);
      card(x, 80, i === 3 || i === 1 ? 160 : 130, 46, { rx: 23, text: s, fs: 14.5, fw: 800, stroke: on ? (i === 3 ? BAD : ACC) : GRID, fill: on ? (i === 3 ? BADBG : ACCBG) : PANEL, color: on ? (i === 3 ? BAD : ACC) : INK });
      if (i < 4) grow(x + (i === 1 || i === 3 ? 82 : 67), 80, ST[i + 1][1] - (i + 1 === 1 || i + 1 === 3 ? 82 : 67), 80, 1, GRID); });
    sub(640, 124, 'preview · up 중 검사', 1);
    // 값이 따라 흐른다: 버킷 한 개
    const path = (to) => ST.slice(0, to + 1).map(([, x]) => [x, 180]);
    if (k === 0) { dot(path(2), seg(u, 0.2, 1.6), ACC, 8);
      pill(90, 220, 'tags: { }', INK, 1, { mono: true, fs: 14, fill: PANEL }); pill(300, 220, 'tags: { team, env, managedBy }', ACC, pop(u, 0.9), { mono: true, fs: 14, fill: ACCBG });
      note(480, 300, '고친 값(props)을 돌려주니 등록되는 값이 바뀐다', fade(u, 1.6), { 'text-anchor': 'middle' }); }
    if (k >= 1) { const g = card(640, 300, 330, 96, { rx: 10, stroke: BAD, sw: 2, s: k === 1 ? pop(u, 0.2) : 1 });
      mono(490, 278, 'PolicyPack "org-standards"', { 'font-size': 14, 'font-weight': 800, opacity: k === 1 ? fade(u, 0.4) : 1 });
      mono(490, 302, '  s3-must-encrypt', { 'font-size': 14, opacity: k === 1 ? fade(u, 0.6) : 1 });
      mono(490, 326, '  enforcementLevel: mandatory', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.8) : 1 }); }
    if (k === 1) sub(250, 300, '정책은 별도 프로젝트에 둔다', fade(u, 1.2));
    if (k === 2) { dot([[90, 180], [270, 180], [450, 180], [610, 180]], seg(u, 0.2, 1.3), INK, 8);
      pill(250, 230, '암호화 설정 없음', INK, 1, { fs: 14, fill: PANEL });
      el('rect', { x: 628, y: 150, width: 12, height: 60, rx: 3, fill: BAD, opacity: fade(u, 1.2) }); cross(840, 180, 14, pop(u, 1.6));
      pill(250, 290, 'reportViolation("S3는 암호화 필수")', BAD, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL });
      sub(250, 330, '값은 그대로, 배포만 거부', fade(u, 1.8), { 'font-weight': 700, fill: BAD }); }
    if (k === 3) { dot(path(4), seg(u, 0.2, 2.0), GOOD, 8);
      pill(270, 230, '암호화 주입', ACC, pop(u, 0.5), { fs: 14, fill: ACCBG }); check(640, 180, 12, pop(u, 1.4)); check(840, 180, 12, pop(u, 2.0));
      sub(250, 290, 'hook이 넣고, 정책이 한 번 더 본다', fade(u, 1.0), { 'font-weight': 700 }); } }

  const quiz = [
    { q: 'Transformation hook은 언제, 무엇을 받는가?',
      o: ['리소스가 엔진에 등록되기 직전에 type·name·props·opts를 받는다', '배포가 끝난 뒤 클라우드의 실제 값을 받는다', 'pulumi preview 출력 문자열을 받는다'], a: 0,
      why: 'new BucketV2(...)가 등록되기 직전 args 네 가지가 넘어오고, 돌려준 props로 등록된다.' },
    { q: 'sessionsTable이 tags: { team: "payments" }를 직접 줬다. 공통 태그 hook을 지난 뒤 team은 무엇인가?',
      o: ['"platform"', '"payments"', 'team 키가 둘 생긴다'], a: 1,
      why: '{ ...COMMON_TAGS, ...args.props.tags } 순서라 개별 값이 나중에 덮는다. 공통값은 빈 자리만 채운다.' },
    { q: 'monitoring: false를 준 EC2가 보안 기본값 hook을 지나면 monitoring은 어떻게 되는가?',
      o: ['false 그대로 남는다', '속성이 지워진다', 'true로 바뀐다'], a: 2,
      why: 'EC2 분기는 ??= 가 아니라 = 를 쓴다. = 는 개발자 값과 상관없이 덮어쓰는 강제다.' },
    { q: 'payment 컴포넌트에만 transformations 옵션을 걸었다. 같은 파일의 external-logs 버킷 이름은?',
      o: ['그대로 external-logs', 'pci-external-logs로 바뀐다', '등록이 거부된다'], a: 0,
      why: '옵션으로 건 hook은 그 컴포넌트 서브트리에만 닿는다. 범위는 파일이 아니라 리소스 트리로 정해진다.' },
    { q: '암호화 없는 버킷이 mandatory 정책 s3-must-encrypt에 걸리면 어떻게 되는가?',
      o: ['CrossGuard가 암호화 설정을 채워 넣고 배포한다', '값은 그대로 두고 배포를 거부한다', '경고만 남기고 배포한다'], a: 1,
      why: 'CrossGuard는 검증만 한다. reportViolation으로 알리고 mandatory면 배포를 막는다.' },
  ];

  const summary = [
    'Transformation은 리소스가 등록되기 직전 type·name·props·opts를 받아 props를 고친다.',
    'registerStackTransformation에 건 hook은 stack의 모든 리소스를 지나며 공통 태그를 채운다.',
    'args.type으로 타입을 골라 S3는 암호화, EC2는 모니터링 같은 보안 기본값을 넣는다.',
    '옵션으로 건 hook은 그 컴포넌트 아래에만 닿는다. CrossGuard는 값을 고치지 않고 위반을 막는다.',
  ];
  const review = [
    { q: '개발자가 버킷에 tags: { env: "test" }를 직접 주고 prod stack에 올렸다. 등록된 env는?',
      o: ['"prod"', 'env가 빠진다', '"test"'], a: 2,
      why: '공통 태그를 먼저 깔고 개별 태그로 덮으므로 직접 준 "test" 가 남는다. 강제하려면 순서를 바꾸거나 정책으로 막는다.' },
    { q: 'pci- 접두사가 payment 아래 큐에는 붙었는데 같은 파일의 감사 로그 버킷에는 안 붙었다. 이유는?',
      o: ['버킷이 payment 컴포넌트 서브트리 밖에 있어서', '버킷은 name 속성을 지원하지 않아서', 'hook이 async가 아니어서'], a: 0,
      why: 'transformations 옵션은 건 리소스와 그 자식에게만 적용된다. 버킷을 payment의 자식으로 만들거나 stack 전체 hook을 써야 한다.' },
    { q: '암호화 기본값 hook을 넣었는데도 s3-must-encrypt 정책이 배포를 막았다. 먼저 의심할 것은?',
      o: ['정책의 enforcementLevel이 너무 낮다', 'hook의 타입 문자열이 실제 토큰과 달라 S3 분기에 안 들어갔다', 'CrossGuard가 hook보다 먼저 값을 바꿨다'], a: 1,
      why: 'args.type은 "aws:s3/bucketV2:BucketV2" 같은 전체 토큰이다. 문자열이 다르면 분기를 건너뛰고 정책이 그 빈자리를 잡아낸다.' },
  ];

  R.page({ title: '등록 직전 검색대', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
