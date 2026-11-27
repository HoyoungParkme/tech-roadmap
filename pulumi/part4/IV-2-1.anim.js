/* IV-2-1 Policy as Code — CrossGuard — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 규칙·강도는 STEPS 의 policies, 리소스별 검사 결과는 resources[].checks, 게이트는 gate 를 읽는다. preview 출력은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const LV = { advisory: WARN, mandatory: BAD, disabled: OFF, remediate: INFO };
  const SHORT = { 's3-encryption-required': 's3-encryption', 'require-team-tag': 'team-tag', 'allowed-instance-types': 'instance-type' };
  // 리소스 카드: 타입 · 이름, 아래에 검사 결과 알약
  function resCard(cx, cy, r, pols, o) { o = o || {}; const w = o.w || 300, h = 64 + (r.checks.length ? 34 : 0);
    const bad = r.checks.some((x) => x.result === 'violate' && (pols.find((p) => p.name === x.policy) || {}).level === 'mandatory');
    const g = card(cx, cy, w, h, { rx: 10, stroke: o.stroke || (bad ? BAD : INK), sw: 2.2, s: o.s, op: o.op });
    mono(-w / 2 + 14, -h / 2 + 24, r.type, { 'font-size': 13.5, fill: MUT }, g);
    mono(-w / 2 + 14, -h / 2 + 48, r.name, { 'font-size': 16, 'font-weight': 800 }, g);
    r.checks.forEach((ch, i) => { const lvl = (pols.find((p) => p.name === ch.policy) || {}).level, ok = ch.result === 'pass';
      const col = ok ? GOOD : LV[lvl] || WARN, s = SHORT[ch.policy] + (ok ? ' ✓' : ' ✗');
      const pw = tw(s, 13.5) + 22, px = -w / 2 + 14 + i * 150;
      el('rect', { x: px, y: h / 2 - 38, width: pw, height: 26, rx: 13, fill: ok ? GOODBG : lvl === 'mandatory' ? BADBG : WARNBG, stroke: col, 'stroke-width': 1.5 }, g);
      mono(px + 11, h / 2 - 20, s, { 'font-size': 13.5, 'font-weight': 700, fill: col }, g); });
    return g; }
  // 규칙 카드: 이름 + 강도 배지
  function ruleCard(x, y, p, o) { o = o || {}; const w = o.w || 330, col = LV[p.level] || MUT, g = G(x, y, o.s, o.op);
    el('rect', { x: 0, y: -22, width: w, height: 44, rx: 8, fill: PANEL, stroke: o.plan ? GRID : col, 'stroke-width': 2, 'stroke-dasharray': o.plan ? '6 5' : null }, g);
    mono(12, 5, p.name, { 'font-size': 14, 'font-weight': 700, fill: o.plan ? MUT : INK }, g);
    if (!o.plan) { const lw = tw(p.level, 13.5) + 18; el('rect', { x: w - lw - 8, y: -12, width: lw, height: 24, rx: 12, fill: col }, g); mono(w - lw / 2 - 8, 5, p.level, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }, g); }
    return g; }
  // 정책 팩 상자
  function packBox(x, y, w, h, title, o) { o = o || {}; el('rect', { x, y, width: w, height: h, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: o.op ?? 1 });
    el('rect', { x, y, width: w, height: 32, rx: 12, fill: ACC, opacity: o.op ?? 1 }); mono(x + 14, y + 22, title, { 'font-size': 14.5, 'font-weight': 700, fill: PANEL, opacity: o.op ?? 1 }); }
  // 게이트(차단봉): open 0 → 1
  function gate(x, y, open, col) { el('rect', { x: x - 8, y: y - 60, width: 16, height: 120, rx: 4, fill: INK });
    const a = lerp(0, -80, open), g = el('g', { transform: `translate(${x} ${y - 50}) rotate(${a})` });
    el('rect', { x: 0, y: -7, width: 150, height: 14, rx: 7, fill: col || BAD }, g);
    [30, 70, 110].forEach((d) => el('rect', { x: d, y: -7, width: 18, height: 14, fill: PANEL, opacity: 0.85 }, g)); }

  // ---------- 1. Policy Pack 을 만든다 ----------
  function s1(t, c) { const { k, u } = c, P = c.beat.policies || [];
    if (k === 0) { packBox(300, 70, 360, 270, 'Policy Pack', { op: fade(u, 0.2) });
      [0, 1, 2].forEach((i) => { const s = pop(u, 0.8 + i * 0.35); el('rect', { x: 330, y: 130 + i * 66, width: 300, height: 48, rx: 8, fill: PANEL, stroke: ACC, 'stroke-dasharray': '6 5', opacity: s }); mono(350, 160 + i * 66, '규칙 ' + (i + 1), { 'font-size': 14.5, fill: MUT, opacity: s }); });
      sub(480, 380, '관리 단위는 규칙 하나가 아니라 규칙 묶음', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { terminal(40, 60, 520, 130, [['$ mkdir compliance-policies && cd compliance-policies', null], ['$ pulumi policy new aws-typescript', null]], lerp(0, 2, E(u, 0.2, 1.4)), { title: 'setup.sh', lh: 26 });
      const s = pop(u, 1.6); const g = G(760, 150, s); el('path', { d: 'M-80,-40 L-30,-40 L-18,-26 L80,-26 L80,50 L-80,50 Z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
      mono(760, 230, 'compliance-policies/', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
      sub(480, 330, '정책 팩도 템플릿에서 시작하는 프로젝트다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { mono(120, 80, 'compliance-policies/', { 'font-size': 16, 'font-weight': 800 });
      [['index.ts', '규칙을 코드로 적는 곳', true], ['PulumiPolicy.yaml', '팩 메타데이터', false], ['package.json', '의존성 (@pulumi/policy)', false]].forEach(([f, d, hot], i) => {
        const y = 140 + i * 64, s = pop(u, 0.3 + i * 0.35);
        if (hot) el('rect', { x: 130, y: y - 26, width: 620, height: 44, rx: 8, fill: ACCBG, opacity: s });
        grow(130, y - 6, 150, y - 6, s, MUT, { plain: true }); mono(160, y, f, { 'font-size': 16, 'font-weight': 700, fill: hot ? ACC : INK, opacity: s });
        tx(420, y, d, { 'font-size': 15, fill: MUT, opacity: s }); });
      return; }
    // k3·k4: preview 가 팩을 거쳐 간다
    card(110, 140, 150, 60, { rx: 10, text: 'Pulumi\n프로그램', fs: 15 });
    card(330, 140, 150, 60, { rx: 10, text: '엔진\n(preview)', fs: 15, stroke: INFO });
    grow(185, 140, 255, 140, 1, MUT);
    packBox(470, 82, 230, 116, 'compliance-policies');
    grow(405, 140, 465, 140, k === 3 ? E(u, 0.2, 0.6) : 1, ACC);
    cardCloud(850, 140);
    grow(705, 140, 790, 140, k === 3 ? E(u, 1.6, 2.0) : 1, MUT, { dash: '5 5' });
    if (k === 3) { ['user-uploads', 'batch-worker'].forEach((n, i) => fly(330, 150, 585, 150, seg(u, 0.5 + i * 0.4, 1.3 + i * 0.4), n, { mono: true, fill: INK }));
      spans(60, 300, [['$ ', { fill: MUT }], ['pulumi preview --policy-pack ../compliance-policies', { 'font-weight': 700 }]], { 'font-size': 15, opacity: fade(u, 0.2) });
      sub(480, 360, 'preview가 돌 때마다 팩이 함께 실행된다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    mono(585, 160, '규칙 0개', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    P.forEach((p, i) => ruleCard(150 + (i % 3) * 230 - 40, 270 + 0, p, { w: 220, plan: true, s: pop(u, 0.3 + i * 0.4) }));
    P.forEach((p, i) => tx(70 + i * 230 + 110 - 0, 312, p.rule.replace('작성 예정 — ', ''), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6 + i * 0.4) }));
    sub(480, 380, '작성 예정. 아직 검사는 돌지 않는다', fade(u, 2.0), { 'font-size': 15, fill: INK }); }
  function cardCloud(cx, cy) { el('path', { d: `M${cx - 60},${cy + 22} C${cx - 88},${cy + 22} ${cx - 88},${cy - 16} ${cx - 58},${cy - 14} C${cx - 52},${cy - 42} ${cx - 10},${cy - 44} ${cx},${cy - 24} C${cx + 14},${cy - 46} ${cx + 52},${cy - 40} ${cx + 50},${cy - 12} C${cx + 80},${cy - 12} ${cx + 82},${cy + 22} ${cx + 56},${cy + 22} Z`, fill: SOFT, stroke: MUT, 'stroke-width': 2 });
    tx(cx, cy + 6, '클라우드', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }); }

  // ---------- 2. validateStack · validateResource ----------
  function s2(t, c) { const { k, u } = c, P = c.beat.policies || [], RS = c.beat.resources || [];
    // 왼쪽: 스택의 리소스
    zone(20, 20, 400, 380, 'stack.resources (preview 계획)', { fill: SOFT });
    RS.forEach((r, i) => resCard(220, 110 + i * 150, r, P, { w: 360 }));
    // 오른쪽: 팩
    packBox(470, 20, 470, 380, 'new PolicyPack("compliance-policies")', { op: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { mono(500, 90, 'policies: [', { 'font-size': 15, opacity: fade(u, 0.6) }); mono(500, 130, ']', { 'font-size': 15, opacity: fade(u, 0.6) });
      sub(700, 220, '팩 = PolicyPack 하나 + policies 배열', fade(u, 1.4), { 'font-size': 15, fill: INK }); return; }
    P.forEach((p, i) => ruleCard(490, 80 + i * 56, p, { w: 430, s: k === (i ? 4 : 1) ? pop(u, 0.3) : 1 }));
    if (k === 1) { sub(705, 260, '이름은 위반 보고에 찍히고, 처음엔 advisory로 돌린다', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 2 || k === 3) { // 버킷과 암호화 설정을 짝짓기
      mono(650, 196, 'validateStack', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      tx(650, 226, '버킷마다 기대는 암호화 설정이 있나?', { 'font-size': 14.5, opacity: fade(u, 0.5) });
      const ok = E(u, 0.6, 1.4);
      el('path', { d: `M400,110 C450,110 470,${lerp(110, 300, ok)} ${lerp(400, 640, ok)},300`, fill: 'none', stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: k === 2 ? ok : 1 });
      card(770, 300, 260, 52, { rx: 8, stroke: WARN, dash: '6 5', text: 'BucketServerSide…V2 ?', fs: 14, mono: true, color: WARN, s: pop(u, 1.3) });
      tx(770, 350, '짝이 없다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
      if (k === 3) mono(490, 390, 'reportViolation("암호화 규칙이 …", b.urn)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.4) });
      return; }
    // k4·k5: 리소스를 하나씩 받는 validateResource
    mono(490, 214, 'validateResource: (args, report) => …', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: k === 4 ? fade(u, 0.3) : 1 });
    tx(490, 244, '타입을 가리지 않고 모든 리소스가 지나간다', { 'font-size': 14.5, opacity: k === 4 ? fade(u, 0.6) : 1 });
    if (k === 4) RS.forEach((r, i) => dot([[400, 110 + i * 150], [470, 230], [520, 230]], seg(u, 0.9 + i * 0.6, 1.6 + i * 0.6), ACC, 7));
    if (k >= 5) { mono(490, 290, 'const tags = args.props.tags;', { 'font-size': 14.5, opacity: k === 5 ? fade(u, 0.2) : 1 });
      mono(490, 318, 'if (!tags || !tags["team"]) report(…)', { 'font-size': 14.5, opacity: k === 5 ? fade(u, 0.5) : 1 }); }
    if (k === 6) { el('rect', { x: 480, y: 340, width: 450, height: 44, rx: 8, fill: WARNBG, opacity: fade(u, 0.3) });
      tx(705, 368, '규칙 2개 모두 advisory. 배포는 아직 막지 않는다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); } }

  // ---------- 3. 강도 ----------
  const STOPS = [['disabled', '끈다'], ['advisory', '경고만'], ['mandatory', '배포 차단'], ['remediate', '값을 고쳐 넣음']];
  function s3(t, c) { const { k, u } = c, P = c.beat.policies || [], RS = c.beat.resources || [], PP = (c.prev && c.prev.policies) || P;
    if (k === 0) { el('line', { x1: 140, y1: 190, x2: 820, y2: 190, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
      STOPS.forEach(([n, d], i) => { const x = 140 + i * 226.6, s = pop(u, 0.3 + i * 0.4);
        el('circle', { cx: x, cy: 190, r: 16 * s, fill: LV[n] });
        mono(x, 150, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: LV[n], opacity: s });
        tx(x, 236, d, { 'font-size': 15, 'text-anchor': 'middle', opacity: s }); });
      tx(820, 264, 'Enterprise · 리소스 규칙만', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) });
      sub(480, 340, '검사 로직은 그대로 두고 강도만 바꿔 도입 속도를 조절한다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    // 오른쪽 규칙 목록 (강도는 data)
    P.forEach((p, i) => { const was = PP[i] && PP[i].level, flip = was && was !== p.level;
      ruleCard(500, 70 + i * 60, flip && u < 0.9 ? Object.assign({}, p, { level: was }) : p, { w: 430, s: !PP[i] ? pop(u, 0.3) : flip ? 1 + 0.08 * Math.sin(seg(u, 0.9, 1.4) * Math.PI) : 1 }); });
    if (k <= 2) { resCard(230, 110, RS[0], P, { w: 380 });
      if (k === 1) sub(230, 200, u > 0.9 ? '같은 위반이 이제 배포를 막는다' : '한 줄만 바꾼다', 1, { 'font-size': 15, fill: u > 0.9 ? BAD : INK, 'font-weight': 700 });
      if (k === 2) { const s = pop(u, 0.4); card(260, 290, 420, 64, { rx: 12, stroke: BAD, fill: BADBG, s });
        mono(70, 296, '암호화 필수 — 배포를 막습니다.', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: s });
        sub(260, 350, '막힌 사람이 읽고 바로 고칠 수 있게', fade(u, 1.2), { 'font-size': 14.5, fill: INK }); }
      return; }
    resCard(230, 110, RS[1], P, { w: 380 });
    if (k === 3) sub(230, 210, 'aws.ec2.Instance만 검사한다. 비용 가드레일', fade(u, 0.9), { 'font-size': 14.5, fill: INK });
    const AL = ['t3.micro', 't3.small', 't3.medium'];
    if (k >= 4) { AL.forEach((a, i) => card(150 + i * 140, 280, 124, 40, { rx: 8, stroke: a === 't3.small' ? GOOD : GRID, text: a, fs: 15, mono: true, s: k === 4 ? pop(u, 0.2 + i * 0.25) : 1 }));
      tx(80, 240, 'const allowed = [...]', { 'font-size': 14.5, class: 'mono', opacity: k === 4 ? fade(u, 0.1) : 1 }); }
    if (k === 4) { fly(230, 140, 290, 280, seg(u, 1.0, 1.9), 'instanceType: t3.small', { mono: true, fill: GOOD });
      if (u > 1.9) check(290, 316, 10, pop(u, 1.9)); }
    if (k === 5) { el('rect', { x: 40, y: 330, width: 880, height: 72, rx: 10, fill: BADBG, stroke: BAD, opacity: fade(u, 0.3) });
      tx(56, 352, '예: instanceType이 m5.4xlarge라면', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      mono(56, 384, '허용되지 않은 타입: m5.4xlarge. 승인 목록: t3.micro, t3.small, t3.medium', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) }); } }

  // ---------- 4. preview 가 막힌다 ----------
  const OUT = ['Previewing update (prod):', ' +  aws:s3:BucketV2     user-uploads  create', ' +  aws:ec2:Instance    batch-worker  create', 'Policy Violations:',
    ['  [mandatory] s3-encryption-required', '#fca5a5'], ['    (aws:s3:BucketV2: user-uploads)', '#fca5a5'], ['  [advisory]  require-team-tag', '#fcd34d'], ['    (aws:ec2:Instance: batch-worker)', '#fcd34d'],
    ['error: preview failed: 1 mandatory policy violation', '#fca5a5']];
  const OUT_N = [3, 6, 8, 9, 9, 9];
  function s4(t, c) { const { k, u } = c, P = c.beat.policies || [], RS = c.beat.resources || [];
    const n0 = k ? OUT_N[k - 1] : 0, n1 = OUT_N[k];
    terminal(20, 20, 500, 380, OUT, k === 0 ? lerp(0, n1, E(u, 0.2, 2.0)) : lerp(n0, n1, E(u, 0.2, 1.4)), { title: 'preview --policy-pack  (예시)', lh: 34, fs: 14 });
    // 오른쪽: 게이트를 향하는 두 리소스
    const shut = c.beat.gate === 'blocked', GX = 760;
    gate(GX, 150, shut ? 0 : 0.6, shut ? BAD : WARN);
    RS.forEach((r, i) => { const y = 100 + i * 100, v = r.checks.find((x) => x.result === 'violate'), lvl = v && (P.find((p) => p.name === v.policy) || {}).level;
      const stop = lvl === 'mandatory', x = !v ? lerp(600, 640, E(u, 0.2, 1.0)) : stop ? 650 : k >= 2 ? 880 : 650;
      card(x, y, 140, 40, { rx: 8, text: r.name, fs: 14, mono: true, stroke: stop ? BAD : lvl === 'advisory' ? WARN : INK, color: stop ? BAD : INK });
      if (v) tx(x, y + 38, stop ? '차단' : '경고 후 통과', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: stop ? BAD : WARN }); });
    if (k === 3 || k === 4) { spans(570, 300, [['pulumi up', { 'font-weight': 700 }], ['  거부', { fill: BAD, 'font-weight': 700 }]], { 'font-size': 16, opacity: fade(u, 0.4) }); }
    if (k === 4) sub(740, 350, '결과를 가른 것은 위반 수가 아니라 등급', fade(u, 1.0), { 'font-size': 14.5, fill: INK });
    if (k === 5) { el('rect', { x: 560, y: 270, width: 370, height: 110, rx: 10, fill: INK });
      mono(580, 304, '$ echo $?', { 'font-size': 15, fill: PANEL }); mono(580, 334, '1', { 'font-size': 18, 'font-weight': 800, fill: '#fca5a5', opacity: fade(u, 0.5) });
      cross(760, 330, 13, pop(u, 1.1)); tx(784, 336, 'CI 잡 실패', { 'font-size': 15, 'font-weight': 700, fill: '#fca5a5', opacity: fade(u, 1.2) }); } }

  // ---------- 5. 고치고, 조직에 펼치고, 역할을 가른다 ----------
  function s5(t, c) { const { k, u } = c, P = c.beat.policies || [], RS = c.beat.resources || [];
    if (k <= 1) { // 고친 리소스 셋
      const fix = k === 0 ? E(u, 0.4, 1.4) : 1;
      resCard(200, 90, RS[0], P, { w: 340, stroke: k === 1 ? GOOD : null });
      resCard(200, 300, RS[1], P, { w: 340, stroke: k === 1 ? GOOD : null });
      card(560, 90, 230, 50, { rx: 8, stroke: GOOD, text: 'user-uploads-sse', fs: 14.5, mono: true, s: pop(u, k === 0 ? 0.4 : 0) });
      if (fix > 0) el('line', { x1: 445, y1: 90, x2: lerp(445, 370, fix), y2: 90, stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
      mono(560, 140, '암호화 설정 추가', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, k === 0 ? 1.0 : 0) });
      pill(560, 300, 'tags.team 추가', GOOD, k === 0 ? pop(u, 1.2) : 1, { fs: 14, mono: true });
      gate(780, 210, c.beat.gate === 'open' ? E(u, 0.4, 1.4) * 0.85 : 0, c.beat.gate === 'open' ? GOOD : WARN);
      if (k === 1) { tx(780, 330, 'all passed', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 1.2) });
        sub(780, 362, '게이트는 검사 결과가 연다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); }
      return; }
    if (k === 2) { packBox(60, 150, 220, 100, 'compliance-policies');
      fly(170, 200, 470, 80, seg(u, 0.2, 0.9), 'policy publish', { mono: true, stay: true });
      card(470, 200, 160, 54, { rx: 10, fill: INK, stroke: 'none', text: 'org: my-org', fs: 15, color: PANEL, s: pop(u, 0.3) });
      ['payments/prod', 'payments/dev', 'web/prod', 'web/dev', 'data/prod', '…'].forEach((s, i) => { const x = 660 + (i % 2) * 150, y = 90 + Math.floor(i / 2) * 110, e = E(u, 1.0 + i * 0.15, 1.5 + i * 0.15);
        grow(552, 200, x - 62, y, e, ACC, { plain: true });
        card(x, y, 130, 44, { rx: 8, stroke: ACC, text: s, fs: 13.5, mono: true, s: pop(u, 1.4 + i * 0.15) }); });
      sub(300, 380, 'policy enable로 켜면 조직의 모든 스택이 같은 규칙을 지난다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { const half = (x, title, col, note, change) => { zone(x, 30, 430, 340, title, { fill: SOFT, color: col });
        mono(x + 24, 110, 'tags: {', { 'font-size': 16 });
        mono(x + 48, 144, change && u > 1.4 ? 'team: "batch",' : '', { 'font-size': 16, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.4) });
        mono(x + 24, 178, '}', { 'font-size': 16 });
        tx(x + 24, 250, note, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.6) }); };
      half(30, 'advisory · mandatory', WARN, '읽고 판정만. 값은 그대로', false);
      half(500, 'remediate · Transformation', INFO, '값을 고쳐 넣는다 (예시 값)', true);
      const mg = G(330, 140, pop(u, 0.4)); el('circle', { cx: 0, cy: 0, r: 22, fill: 'none', stroke: WARN, 'stroke-width': 4 }, mg); el('line', { x1: 16, y1: 16, x2: 34, y2: 34, stroke: WARN, 'stroke-width': 5, 'stroke-linecap': 'round' }, mg);
      sub(480, 400, '막는 도구와 고치는 도구를 섞지 않는다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    // k4: 정책 언어
    [['index.ts', 'TypeScript'], ['__main__.py', 'Python'], ['policy.rego', 'OPA Rego']].forEach(([f, l], i) => { const y = 100 + i * 100, s = pop(u, 0.2 + i * 0.3);
      card(150, y, 210, 60, { rx: 10, stroke: i === 2 ? INFO : ACC, s }); mono(70, y - 4, f, { 'font-size': 15, 'font-weight': 700, opacity: s }); tx(70, y + 18, l, { 'font-size': 13.5, fill: MUT, opacity: s });
      grow(258, y, 420, 200, E(u, 0.8 + i * 0.2, 1.3 + i * 0.2), MUT); });
    packBox(430, 150, 200, 100, 'CrossGuard');
    grow(636, 200, 700, 200, E(u, 1.5, 1.9), ACC);
    // 리소스 그래프
    const N = [[760, 130], [860, 110], [800, 220], [900, 230], [830, 310]];
    [[0, 1], [0, 2], [2, 3], [2, 4]].forEach(([a, b]) => el('line', { x1: N[a][0], y1: N[a][1], x2: N[b][0], y2: N[b][1], stroke: GRID, 'stroke-width': 2, opacity: fade(u, 1.7) }));
    N.forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 13, fill: PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.7 + i * 0.1) }));
    tx(830, 370, 'Pulumi 리소스 그래프', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'CrossGuard에서 규칙을 묶어 만들고 스택에 붙이는 단위는 무엇인가?',
      o: ['Policy Pack', 'Stack', 'Transformation'], a: 0,
      why: 'pulumi policy new로 팩 프로젝트를 만들고 index.ts에 규칙을 적는다. preview --policy-pack으로 붙이면 preview마다 함께 돈다.' },
    { q: '암호화 규칙을 validateResource가 아니라 validateStack으로 쓴 이유는 무엇인가?',
      o: ['validateStack이 더 빨라서', '버킷과 암호화 설정이 서로 다른 리소스라 둘을 함께 봐야 해서', 'advisory 규칙은 validateStack만 쓸 수 있어서'], a: 1,
      why: '버킷 하나만 받아서는 짝이 되는 암호화 설정이 있는지 알 수 없다. 스택의 리소스를 한꺼번에 받아 짝을 찾는다.' },
    { q: 's3-encryption-required를 advisory에서 mandatory로 바꾸면 달라지는 것은 무엇인가?',
      o: ['검사 로직이 더 엄격해진다', '위반이 경고에서 배포 차단으로 바뀐다', '위반한 버킷의 설정을 자동으로 고친다'], a: 1,
      why: '검사 코드는 그대로이고 enforcementLevel 한 줄만 바뀐다. 값을 고쳐 넣는 것은 remediate 등급의 일이다.' },
    { q: 'mandatory 위반 1건과 advisory 위반 1건이 함께 나온 preview의 결과는 무엇인가?',
      o: ['경고만 찍고 up이 진행된다', 'advisory 위반을 먼저 고쳐야 한다', 'preview가 실패하고 종료 코드 1로 CI가 멈춘다'], a: 2,
      why: '차단 등급 위반이 하나라도 있으면 preview가 실패한다. 태그 위반은 경고로만 남는다.' },
    { q: 'advisory·mandatory 규칙이 하지 않는 일은 무엇인가?',
      o: ['리소스 속성을 읽어 판정하기', '리소스의 값을 바꿔 넣기', 'preview를 실패시키기'], a: 1,
      why: '두 등급은 읽고 판정만 한다. 값을 고치는 것은 remediate 등급이나 프로그램 쪽 Transformation이다.' },
  ];

  const summary = [
    '사람의 PR 리뷰만으로는 암호화 없는 버킷이나 태그 빠진 리소스를 놓치기 쉽다.',
    'Policy Pack에 규칙을 코드로 적어 두면 preview와 up이 돌 때마다 모든 리소스를 검사한다.',
    'advisory 위반은 경고로 남고, mandatory 위반이 하나라도 있으면 preview가 실패해 CI가 멈춘다.',
    '잘 만든 팩은 policy publish와 enable로 조직의 모든 스택에 같은 규칙으로 건다.',
  ];
  const review = [
    { q: '새 태그 규칙을 처음 도입한다. 기존 스택 수십 개가 한꺼번에 막히지 않게 하려면 강도를 무엇으로 시작하나?',
      o: ['mandatory', 'advisory', 'remediate'], a: 1,
      why: 'advisory는 위반을 경고로만 남겨 팀이 미리 고칠 시간을 준다. 위반이 줄어든 뒤 mandatory로 올린다.' },
    { q: 'batch-worker를 m5.4xlarge로 바꿨더니 CI의 preview 잡이 빨간불이 됐다. 먼저 확인할 것은?',
      o: ['instance-type 위반 메시지의 타입과 목록', 'state 잠금이 걸렸는지', 'team 태그 규칙의 강도'], a: 0,
      why: 'allowed-instance-types는 mandatory라 승인 목록 밖의 타입이면 preview가 실패한다. 메시지에 실제 타입과 목록이 함께 찍힌다.' },
    { q: '버킷마다 암호화 설정을 자동으로 붙여 주고 싶다. 이 페이지의 mandatory 규칙만으로 충분한가?',
      o: ['그렇다, mandatory가 값을 채운다', '그렇다, policy publish가 값을 채운다', '아니다, mandatory는 막기만 한다'], a: 2,
      why: 'advisory·mandatory는 판정만 한다. 값을 바꾸려면 remediate 등급(Enterprise)이나 프로그램 쪽 Transformation을 쓴다.' },
  ];

  R.page({ title: '정책 검사 게이트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
