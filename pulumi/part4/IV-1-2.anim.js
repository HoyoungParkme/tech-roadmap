/* IV-1-2 Pulumi Cloud — 협업 + state lock + RBAC — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 잠금 상태는 STEPS 의 lock(locked·holder·waiting)을 읽는다. 터미널·콘솔 화면의 출력은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, person, cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function laptop(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('rect', { x: -62, y: -40, width: 124, height: 76, rx: 8, fill: INK }, g);
    el('path', { d: 'M-80,38 L80,38 L70,50 L-70,50 Z', fill: PANEL, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    if (o.cmd) mono(-50, 0, o.cmd, { 'font-size': 13.5, fill: PANEL }, g);
    if (name) tx(0, 74, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }, g); return g; }
  // 구름: 가운데 기준
  function cloudShape(cx, cy, s, label, o) { o = o || {}; const g = G(cx, cy, s, o.op);
    el('path', { d: 'M-90,30 C-130,30 -130,-22 -88,-20 C-84,-58 -26,-62 -10,-34 C6,-64 70,-60 70,-18 C112,-20 116,30 80,30 Z', fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2.5 }, g);
    if (label) tx(0, 6, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.stroke || INFO }, g); return g; }
  // state 파일 아이콘 (접힌 귀퉁이)
  function stateFile(cx, cy, name, o) { o = o || {}; const g = G(cx, cy, o.s, o.op), c = o.stroke || INK;
    el('path', { d: 'M-22,-28 L10,-28 L22,-16 L22,28 L-22,28 Z', fill: o.fill || PANEL, stroke: c, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M10,-28 L10,-16 L22,-16', fill: 'none', stroke: c, 'stroke-width': 2 }, g);
    mono(0, 6, '{ }', { 'font-size': 14, 'text-anchor': 'middle', fill: c, 'font-weight': 700 }, g);
    if (name) mono(0, 50, name, { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.nameCol || MUT }, g); return g; }
  // 스택 이름을 org / project / stack 세 조각으로
  function stackName(x, y, org, proj, st, op, fs) { fs = fs || 15;
    spans(x, y, [[org, { fill: MUT }], ['/', { fill: OFF }], [proj, { fill: INK, 'font-weight': 700 }], ['/', { fill: OFF }], [st, { fill: ACC, 'font-weight': 800 }]], { 'font-size': fs, opacity: op ?? 1 }); }

  // ---------- 1. local state 에서 Pulumi Cloud 로 ----------
  function s1(t, c) { const { k, u } = c, LX = 170, RX = 790, Y = 270;
    const fileUp = k >= 2 ? (k === 2 ? E(u, 0.8, 1.8) : 1) : 0;
    laptop(LX, Y, '나 (jiwon)', { cmd: k === 2 ? '$ pulumi login' : '$ pulumi up' });
    if (k < 2) { stateFile(LX + 150, Y - 30, '~/.pulumi/stacks/…', { s: k === 0 ? pop(u, 0.4) : 1, stroke: k === 1 && u > 1.7 ? BAD : INK, nameCol: INK });
      terminal(30, 30, 420, 112, [['$ pulumi whoami -v', null], 'User: jiwon', ['Backend URL: file://~', '#fcd34d']], k === 0 ? lerp(0, 3, E(u, 0.6, 2.0)) : 3, { title: '예시', lh: 22 });
      if (k === 0) { sub(700, 200, 'state가 내 디스크에만 있다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; } }
    if (k === 1) { laptop(RX, Y, '동료 (minsu)', { s: pop(u, 0.2), cmd: '$ pulumi up' });
      el('line', { x1: RX - 90, y1: Y - 10, x2: lerp(RX - 90, LX + 140, E(u, 0.3, 1.0)), y2: Y - 10, stroke: OFF, 'stroke-width': 2.5, 'stroke-dasharray': '6 6' });
      cross(560, Y - 10, 14, pop(u, 1.0)); sub(580, Y + 26, '동료는 내 state를 볼 수 없다', fade(u, 1.1), { 'font-size': 14.5, fill: INK });
      dot([[LX + 40, Y - 60], [LX + 150, Y - 60]], seg(u, 1.4, 2.0), ACC, 6); dot([[RX - 40, Y - 70], [LX + 170, Y - 60]], seg(u, 1.4, 2.0), BAD, 6);
      if (u > 1.9) sub(LX + 150, Y + 110, '동시 up이면 덮어쓴다', fade(u, 1.9), { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    // 구름으로 옮겨 감
    cloudShape(480, 90, k === 2 ? pop(u, 0.2) : 1, 'Pulumi Cloud', {});
    if (k === 2) { stateFile(lerp(LX + 150, 480, fileUp), lerp(Y - 30, 150, fileUp), null, {});
      sub(480, 400, 'pulumi login 한 줄. S3·DynamoDB 셋업이 없다', fade(u, 2.0), { 'font-size': 15, fill: INK }); }
    else stateFile(480, 150, k === 4 ? null : 'payments/prod', { stroke: INFO });
    if (k === 3) { terminal(520, 210, 420, 170, [['$ pulumi whoami -v', null], 'User: jiwon', 'Organizations: jiwon, acme-corp', ['Backend URL: https://app.pulumi.com/jiwon', '#86efac']], lerp(0, 4, E(u, 0.3, 2.0)), { title: '예시', lh: 24 });
      mono(LX - 120, 380, 'file://~', { 'font-size': 15, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 0.3) });
      grow(LX - 30, 375, LX + 20, 375, E(u, 0.6, 1.0), MUT); mono(LX + 30, 380, 'app.pulumi.com', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) }); }
    if (k === 4) { [['저장', 300, 200], ['잠금', 420, 250], ['이력', 540, 250], ['RBAC', 660, 200]].forEach(([s, x, y], i) => {
        grow(480 + (x - 480) * 0.25, 170, x, y - 18, E(u, 0.2 + i * 0.3, 0.6 + i * 0.3), INFO, { plain: true }); pill(x, y, s, INFO, pop(u, 0.5 + i * 0.3), { fs: 15 }); });
      card(790, 340, 220, 44, { rx: 8, stroke: OFF, dash: '5 4', text: 'S3 + DynamoDB 직접 구성', fs: 14, color: OFF, s: pop(u, 1.7) });
      el('line', { x1: 690, y1: 340, x2: lerp(690, 890, E(u, 2.0, 2.4)), y2: 340, stroke: BAD, 'stroke-width': 3 }); } }

  // ---------- 2. 조직 › 팀 › 스택 ----------
  const TEAM = [{ n: 'platform', x: 240, m: ['minsu', 'jiwon'], d: '공용 인프라' }, { n: 'app-dev', x: 720, m: ['sara', 'jiwon'], d: '서비스 앱' }];
  const STK = [['payments', 'prod', 0, 175], ['payments', 'dev', 1, 480], ['web', 'prod', 1, 785]];
  function s2(t, c) { const { k, u } = c;
    card(480, 46, 220, 46, { rx: 10, fill: INK, stroke: 'none', text: 'org: acme-corp', fs: 16, color: PANEL, s: k === 0 ? pop(u, 0.3) : 1 });
    if (k === 0) { sub(480, 100, '청구·멤버·감사 로그의 경계', fade(u, 1.0), { 'font-size': 14.5 }); }
    TEAM.forEach((tm, i) => { if (k < 1 + i) return; const s = k === 1 + i ? pop(u, 0.2) : 1;
      grow(480, 70, tm.x, 112, k === 1 + i ? E(u, 0.1, 0.5) : 1, MUT, { plain: true });
      card(tm.x, 134, 190, 44, { rx: 10, stroke: ACC, fill: ACCBG, text: 'team: ' + tm.n, fs: 15, mono: true, color: ACC, s });
      tx(tm.x, 172, tm.d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s });
      tm.m.forEach((m, j) => { const ps = k === 1 + i ? pop(u, 0.7 + j * 0.4) : 1; person(tm.x - 46 + j * 92, 210, m, { s: ps * 0.8, stroke: m === 'jiwon' ? WARN : INK }); }); });
    if (k === 2) sub(480, 226, 'jiwon은 두 팀에 다 있다', fade(u, 1.8), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 });
    if (k >= 3) STK.forEach(([p, st, ti, x], i) => { const s = k === 3 ? pop(u, 0.2 + i * 0.4) : 1;
      el('rect', { x: x - 135, y: 296, width: 270, height: 44, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: s });
      stackName(x - 120, 324, 'acme-corp', p, st, s, 14.5);
      grow(TEAM[ti].x, 250, x, 294, k === 3 ? E(u, 0.6 + i * 0.4, 1.1 + i * 0.4) : 1, ti ? ACC : INFO); });
    if (k === 3) { [['org', MUT, 300], ['project', INK, 400], ['stack', ACC, 500]].forEach(([s, col, x], i) => tx(x - 140, 368, s, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: fade(u, 1.8 + i * 0.15) })); }
    if (k === 4) { spans(40, 392, [['CLI  ', { fill: MUT }], ['pulumi org set-default acme-corp · pulumi stack init …', {}]], { 'font-size': 14, opacity: fade(u, 0.3) });
      spans(40, 414, [['콘솔 ', { fill: MUT }], ['Settings › Teams에서 팀과 멤버', {}]], { 'font-size': 14, opacity: fade(u, 0.9) }); } }

  // ---------- 3. RBAC 행렬 ----------
  const COLS = ['payments/prod', 'payments/dev', 'web/prod'];
  const PERM = { platform: ['admin', 'admin', null], 'app-dev': ['read', 'write', 'admin'] };
  const RCOL = { admin: ACC, write: INFO, read: MUT };
  function s3(t, c) { const { k, u } = c, X0 = 360, CW = 190, Y0 = 120, RH = 78;
    // 왼쪽: 조직 역할
    tx(30, 60, '조직 역할', { 'font-size': 15, 'font-weight': 800 });
    [['jiwon', 'admin'], ['minsu', 'member'], ['sara', 'member']].forEach(([n, r], i) => { const y = 110 + i * 70, s = k === 0 ? pop(u, 0.3 + i * 0.35) : 1;
      person(60, y, null, { s: 0.7 * s, stroke: r === 'admin' ? WARN : INK }); mono(96, y + 4, n, { 'font-size': 15, 'font-weight': 700, opacity: s });
      pill(210, y, r, r === 'admin' ? WARN : MUT, s, { fs: 13.5, mono: true }); });
    if (k === 0) { sub(170, 330, '전권은 한 사람만', fade(u, 1.6), { 'font-size': 14.5, fill: WARN, 'font-weight': 700 }); return; }
    // 오른쪽: 팀 × 스택
    COLS.forEach((s, i) => mono(X0 + i * CW + CW / 2, Y0 - 18, s, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: k === i + 1 ? ACC : INK }));
    Object.keys(PERM).forEach((tm, r) => { const y = Y0 + r * RH;
      mono(X0 - 12, y + RH / 2 + 5, tm, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      PERM[tm].forEach((p, i) => { const shown = k > i + 1 || k === 4 ? 1 : k === i + 1 ? pop(u, 0.3 + r * 0.4) : 0;
        el('rect', { x: X0 + i * CW + 6, y: y + 6, width: CW - 12, height: RH - 12, rx: 8, fill: SOFT, stroke: GRID });
        if (!p || shown <= 0) { if (!p && k >= 3) mono(X0 + i * CW + CW / 2, y + RH / 2 + 5, '—', { 'font-size': 16, fill: OFF, 'text-anchor': 'middle' }); return; }
        card(X0 + i * CW + CW / 2, y + RH / 2, CW - 40, 36, { rx: 18, stroke: RCOL[p], fill: p === 'admin' ? ACCBG : p === 'write' ? INFOBG : PANEL, text: p, fs: 15, mono: true, color: RCOL[p], s: shown }); }); });
    const BY = Y0 + 2 * RH + 30;
    if (k === 1) { spans(X0, BY + 30, [['sara$ ', { fill: MUT }], ['pulumi up --stack acme-corp/payments/prod', {}]], { 'font-size': 14.5, opacity: fade(u, 1.2) });
      if (u > 1.8) { cross(X0 + 458, BY + 25, 11, pop(u, 1.8)); tx(X0 + 476, BY + 31, '권한 없음', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); } }
    if (k === 2) sub(X0 + CW * 1.5, BY + 30, '같은 app-dev라도 dev에서는 배포할 수 있다', fade(u, 1.2), { 'font-size': 15, fill: INK });
    if (k === 3) sub(X0 + CW * 1.5, BY + 30, 'prod라고 다 platform 것이 아니다. 담당 팀이 갖는다', fade(u, 1.2), { 'font-size': 15, fill: INK });
    if (k === 4) { const yy = Y0 + RH + RH / 2; person(X0 - 210, BY + 50, '새 입사자', { s: pop(u, 0.3) * 0.8, stroke: GOOD });
      grow(X0 - 180, BY + 36, X0 - 110, yy + 22, E(u, 0.7, 1.3), GOOD);
      if (u > 1.3) el('rect', { x: X0, y: Y0 + RH, width: CW * 3, height: RH, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.3) });
      sub(X0 + CW * 1.5, BY + 50, '팀에 넣기만 하면 이 줄의 권한을 그대로 받는다', fade(u, 1.7), { 'font-size': 15, fill: INK }); } }

  // ---------- 4. 동시 up 과 잠금 ----------
  function s4(t, c) { const { k, u } = c, L = c.beat.lock || {}, X0 = 140, W = 640, Tm = (v) => X0 + v * W;
    const locked = k === 4 ? !(u > 1.0) : !!L.locked;
    stateFile(480, 70, 'acme-corp/payments/prod', { stroke: locked ? WARN : GOOD });
    lock(530, 58, locked, locked ? WARN : GOOD, k === 0 ? pop(u, 0.9) : 1);
    // 두 사람의 줄
    [['minsu', 190], ['sara', 290]].forEach(([n, y]) => { mono(X0 - 16, y + 5, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      el('rect', { x: X0, y: y - 14, width: W, height: 28, rx: 6, fill: SOFT }); });
    mono(X0, 340, '10:12', { 'font-size': 13.5, fill: MUT }); mono(X0 + W, 340, '시간 →', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    const mEnd = 0.62, mNow = k === 0 ? 0.08 + E(u, 0.2, 2.4) * 0.22 : k === 1 ? 0.3 + E(u, 0, 2.6) * 0.1 : k === 2 ? 0.4 + E(u, 0, 2.6) * 0.1 : k === 3 ? 0.5 + E(u, 0, 2.6) * 0.06 : k === 4 ? lerp(0.56, mEnd, E(u, 0.1, 1.0)) : 0.4;
    el('rect', { x: X0, y: 176, width: (mNow) * W, height: 28, rx: 6, fill: k === 5 && u > 1.2 ? BAD : INFO, opacity: 0.85 });
    mono(X0 + 10, 195, 'pulumi up (update #3)', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700 });
    if (k >= 1 && k <= 3 || k === 5) { const ax = Tm(0.3);
      if (k === 1) { grow(ax, 330, ax, 304, E(u, 0.2, 0.6), BAD); }
      el('rect', { x: ax - 3, y: 278, width: 6, height: 24, fill: BAD, opacity: k === 1 ? fade(u, 0.6) : 1 });
      if (k === 1 || k === 2) { cross(ax + 22, 290, 9, k === 1 ? pop(u, 0.7) : 1);
        mono(ax + 40, 296, '[409] Conflict: Another update is currently in progress.', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.9) : 1 }); } }
    if (k === 1) sub(480, 390, '줄을 세워 주지 않는다. 거절된 쪽은 나중에 다시 돌린다', fade(u, 1.8), { 'font-size': 15, fill: INK });
    if (k === 2) { el('rect', { x: 600, y: 22, width: 330, height: 108, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.3) });
      tx(616, 50, 'Pulumi Cloud · payments/prod', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.4) });
      [['update #3', '진행 중'], ['시작한 사람', 'minsu'], ['시작', '10:12']].forEach(([a, b], i) => { tx(616, 78 + i * 20, a, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7 + i * 0.3) }); mono(800, 78 + i * 20, b, { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.3) }); });
      sub(480, 390, '누가 언제부터 돌리는지는 콘솔에서 본다', fade(u, 1.8), { 'font-size': 15, fill: INK }); }
    if (k === 4) { const sOn = E(u, 1.2, 2.6); if (sOn > 0) { el('rect', { x: Tm(mEnd) + 6, y: 276, width: sOn * 0.3 * W, height: 28, rx: 6, fill: GOOD, opacity: 0.85 });
        mono(Tm(mEnd) + 14, 295, 'up (다시 시도)', { 'font-size': 13.5, fill: PANEL, 'font-weight': 700, opacity: sOn }); }
      check(Tm(mEnd), 160, 10, pop(u, 1.0)); sub(480, 390, '끝나면 잠금이 저절로 풀리고, sara는 다시 돌리면 된다', fade(u, 1.6), { 'font-size': 15, fill: INK }); }
    if (k === 3) { terminal(590, 16, 350, 118, [['updates/3  (예시)', '#cbd5e1'], '+ aws:rds:Instance payments-db creating…', '  … 실시간 로그가 이어진다'], lerp(0, 3, E(u, 0.3, 2.0)), { title: 'app.pulumi.com', lh: 24, fs: 13.5 }); }
    if (k === 5) { spans(X0, 386, [['$ ', { fill: MUT }], ['pulumi cancel --stack acme-corp/payments/prod', { 'font-weight': 700 }]], { 'font-size': 14.5, opacity: fade(u, 0.3) });
      if (u > 1.2) { tx(X0 + W * 0.42, 236, '남의 업데이트를 끊으면 즉시 실패, state가 어긋날 수 있다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) }); } } }

  // ---------- 5. 이력 · 태그 · Deployments · Self-Hosted ----------
  const HIST = [['3', 'minsu', '10:12', '+1 ~0 -0'], ['2', 'jiwon', '10:05', '+0 ~1 -0'], ['1', 'jiwon', '10:02', '+5 ~0 -0']];
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { tx(40, 50, 'pulumi stack history  (요약 예시)', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      el('line', { x1: 70, y1: 80, x2: 70, y2: 330, stroke: GRID, 'stroke-width': 3 });
      HIST.forEach(([v, who, at, d], i) => { const y = 100 + i * 84, s = k === 0 ? pop(u, 0.3 + (2 - i) * 0.45) : 1, hot = k === 1 && v === '2';
        el('circle', { cx: 70, cy: y + 18, r: 9, fill: hot ? ACC : PANEL, stroke: hot ? ACC : INK, 'stroke-width': 2.5, opacity: s });
        card(260, y + 18, 320, 58, { rx: 8, stroke: hot ? ACC : GRID, sw: hot ? 2.5 : 1.5, s });
        mono(116, y + 12, 'v' + v + '  ' + who + '  ' + at, { 'font-size': 14.5, 'font-weight': 700, opacity: s });
        spans(116, y + 36, d.split(' ').map((x, j) => [x + ' ', { fill: [GOOD, WARN, BAD][j], 'font-weight': 700 }]), { 'font-size': 14.5, opacity: s }); });
      if (k === 0) { sub(700, 200, '배포 하나가 버전 하나', fade(u, 1.8), { 'font-size': 16, fill: INK }); return; }
      // export / import 는 state 기록만
      fly(420, 202, 600, 120, seg(u, 0.2, 1.0), 'prev.json', { mono: true, stay: true });
      stateFile(780, 120, 'state 기록', { stroke: ACC, s: pop(u, 1.1) }); grow(640, 120, 750, 120, E(u, 1.1, 1.5), ACC);
      mono(780, 196, 'v3 → v2', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      cloudShape(780, 300, pop(u, 1.6) * 0.75, '실제 리소스', { stroke: MUT, fill: SOFT });
      sub(780, 372, '그대로 v3 상태. 되돌리려면 코드를 되돌려 up', fade(u, 2.1), { 'font-size': 14, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 2) { spans(40, 50, [['$ ', { fill: MUT }], ['pulumi stack ls --organization acme-corp --tag env=prod', { 'font-weight': 700 }]], { 'font-size': 15, opacity: fade(u, 0.2) });
      const rows = [['payments', 'prod', ['env=prod', 'cost-center=payments'], true], ['payments', 'dev', [], false], ['web', 'prod', [], false]];
      rows.forEach(([p, s, tags, hit], i) => { const y = 120 + i * 80, op = !hit && u > 1.6 ? lerp(1, 0.25, E(u, 1.6, 2.2)) : 1;
        el('rect', { x: 40, y: y - 28, width: 880, height: 56, rx: 8, fill: hit && u > 1.6 ? ACCBG : PANEL, stroke: GRID, opacity: op });
        stackName(60, y + 6, 'acme-corp', p, s, op);
        tags.forEach((g, j) => pill(500 + j * 190, y, g, INFO, pop(u, 0.5 + j * 0.4), { fs: 13.5, mono: true }));
        if (!tags.length) tx(500, y + 5, '태그 없음', { 'font-size': 13.5, fill: OFF, opacity: op }); });
      sub(480, 380, '스택이 수십 개여도 태그로 골라낸다. 비용 배분 키로도 쓴다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { person(90, 230, 'sara', {}); pill(230, 200, 'git push main', INK, pop(u, 0.2), { mono: true, fs: 13.5 });
      grow(140, 230, 330, 230, E(u, 0.4, 0.9), MUT);
      cloudShape(510, 210, 1.25, null, {}); tx(510, 116, 'Pulumi Cloud Deployments', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO });
      server(510, 222, null, { lamp: u > 1.0 ? GOOD : OFF, s: 0.6 }); mono(510, 280, 'pulumi up', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.0) });
      grow(670, 220, 790, 220, E(u, 1.4, 1.9), WARN); card(850, 220, 120, 54, { rx: 8, stroke: WARN, text: 'AWS', fs: 16, s: pop(u, 1.8) });
      mono(730, 206, 'OIDC', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.7) });
      laptop(170, 370, null, { s: 0.5, op: 0.5 }); el('line', { x1: 120, y1: 360, x2: lerp(120, 220, E(u, 2.1, 2.5)), y2: 360, stroke: BAD, 'stroke-width': 3 });
      tx(240, 376, '노트북에서 실행하지 않는다', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k4: Self-Hosted
    const sw = E(u, 0.6, 1.6);
    cloudShape(250, 160, 1, 'app.pulumi.com', { op: 1 - sw * 0.6 });
    const b = G(700, 200, pop(u, 1.0)); el('rect', { x: -90, y: -70, width: 180, height: 140, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }, b);
    for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) el('rect', { x: -72 + q * 38, y: -52 + r * 36, width: 26, height: 22, rx: 3, fill: SOFT, stroke: GRID }, b);
    tx(700, 300, '사내 데이터센터', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
    spans(130, 370, [['$ pulumi login ', { fill: MUT }], ['https://pulumi.acme-corp.internal', { 'font-weight': 700, fill: ACC }]], { 'font-size': 15, opacity: fade(u, 1.6) });
    dot([[330, 160], [600, 200]], seg(u, 1.0, 1.9), ACC, 7);
    sub(480, 410, 'URL만 사내 주소로. 잠금·이력·RBAC는 같다', fade(u, 2.1), { 'font-size': 15, fill: INK }); }

  const quiz = [
    { q: 'local backend(file://~)를 쓰는 팀에 생기는 문제는 무엇인가?',
      o: ['state가 클라우드 리소스와 자동으로 맞춰지지 않는다', '동료가 state를 볼 수 없고, 동시에 up 하면 서로의 기록을 덮어쓴다', 'pulumi preview를 돌릴 수 없다'], a: 1,
      why: 'state 파일이 내 노트북 ~/.pulumi 아래에만 있다. pulumi login으로 Pulumi Cloud에 올리면 저장·잠금·이력·RBAC가 함께 붙는다.' },
    { q: 'acme-corp/payments/prod라는 스택 이름에서 payments는 무엇인가?',
      o: ['조직', '팀', '프로젝트'], a: 2,
      why: '스택은 org/project/stack으로 완전히 식별된다. 팀은 이름에 들어가지 않고, owner-team으로 스택을 소유한다.' },
    { q: 'app-dev 팀이 payments/prod에 read 권한만 가질 때 sara가 할 수 있는 일은 무엇인가?',
      o: ['prod 스택 조회', 'prod 스택에 pulumi up', 'prod 스택 삭제'], a: 0,
      why: 'read는 볼 수만 있고 배포·삭제는 막힌다. 같은 app-dev 팀이라도 payments/dev에는 write가 있어 배포할 수 있다.' },
    { q: 'minsu가 prod에 up 하는 도중 sara가 같은 스택에 up 하면 어떻게 되나?',
      o: ['sara의 up이 409 Conflict로 거절되고, minsu가 끝난 뒤 다시 돌리면 된다', '두 up이 차례로 줄을 서서 자동 실행된다', '나중에 끝난 쪽의 state가 앞의 것을 덮어쓴다'], a: 0,
      why: 'up이 시작되면 Pulumi Cloud가 스택을 잠근다. 두 번째 up은 Another update is currently in progress 에러로 바로 멈춘다.' },
    { q: 'pulumi stack export --version 2로 꺼낸 state를 import 하면 무엇이 바뀌나?',
      o: ['AWS에 있는 실제 리소스가 v2 모양으로 돌아간다', 'Pulumi 프로그램 코드가 v2로 돌아간다', 'Pulumi Cloud에 저장된 state 기록만 v2로 바뀐다'], a: 2,
      why: 'import는 state 기록을 바꿀 뿐 리소스를 건드리지 않는다. 인프라를 되돌리려면 코드를 되돌리고 다시 up 한다.' },
  ];

  const summary = [
    'local backend의 state는 내 노트북에만 있어서 동료가 못 보고, 동시에 up 하면 서로 덮어쓴다.',
    'pulumi login 한 번으로 state가 Pulumi Cloud에 올라가고 잠금과 업데이트 이력이 따라온다.',
    '스택은 org/project/stack으로 부르고, 권한은 팀 단위로 스택마다 admin·write·read 중에 준다.',
    'up이 돌면 스택이 잠기고 두 번째 up은 409로 거절된다. 끝나면 다시 돌리면 된다.',
  ];
  const review = [
    { q: '신입이 app-dev 팀에 들어온 첫날 payments/prod에 pulumi up을 쳤다. 무엇이 이 배포를 막나?',
      o: ['state 잠금', 'Self-Hosted 설정', 'app-dev 팀의 payments/prod 권한이 read라서'], a: 2,
      why: '권한은 팀 단위로 주어지고 app-dev는 payments/prod에 read 뿐이다. 신입은 팀에 들어오는 순간 그 줄의 권한을 그대로 받는다.' },
    { q: 'CI 잡이 [409] Conflict로 실패했다. 콘솔을 보니 update #3이 2시간째 진행 중이고 그 노트북은 이미 꺼져 있다. 먼저 할 일은?',
      o: ['state 파일을 직접 지운다', '아무도 돌리지 않는다는 것을 확인한 뒤 pulumi cancel로 잠금을 푼다', '다른 스택 이름으로 같은 코드를 up 한다'], a: 1,
      why: 'CLI가 죽어 잠금이 남은 경우가 pulumi cancel을 쓰는 자리다. 누가 실제로 돌리는 중이면 그 업데이트가 바로 실패하니 먼저 확인한다.' },
    { q: 'v3 배포 뒤 문제가 생겨 v2로 되돌리고 싶다. 실제 인프라까지 되돌리는 방법은?',
      o: ['코드를 v2 시점으로 되돌리고 pulumi up 한다', 'stack export --version 2 후 import만 한다', 'stack tag로 env=v2를 단다'], a: 0,
      why: 'export·import는 state 기록만 바꾼다. 리소스를 바꾸는 것은 프로그램을 실행하는 up이다.' },
  ];

  R.page({ title: '팀 backend와 잠금', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
