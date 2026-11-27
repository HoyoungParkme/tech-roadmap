/* IV-1-1 GitHub Actions — preview/up 자동화 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 파이프라인 단계 상태는 STEPS 의 stages(status·note)를 읽는다. 터미널·PR 화면의 출력은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, G, E, lerp, clamp, seg, pop, fade, tw, card, spans, tokens, mono, sub, lbl, pill, banner, grow, fly, dot, zone, server, person, cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, PANEL, SOFT, GRID, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 코드 판: lines 중 show(i) 가 참인 줄만, hot(i) 인 줄은 바탕색
  function codePanel(x, y, w, title, lines, o) { o = o || {}; const lh = o.lh || 25, fs = o.fs || 14, h = o.h || lines.length * lh + 46;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    el('rect', { x, y, width: w, height: 30, rx: 10, fill: GRID, opacity: 0.6 });
    mono(x + 14, y + 20, title, { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    lines.forEach((s, i) => { const op = o.show ? o.show(i) : 1; if (op <= 0) return; const yy = y + 42 + i * lh;
      if (o.hot && o.hot(i)) el('rect', { x: x + 6, y: yy - 4, width: w - 12, height: lh, rx: 5, fill: ACCBG, opacity: op });
      spans(x + 16, yy + fs * 0.95, tokens(s), { 'font-size': fs, opacity: op }); });
    return { x, y, w, h, row: (i) => y + 42 + i * lh + lh / 2 - 4 }; }
  // 상태 동그라미: done ✓ · running 도는 호 · waiting 일시정지 · blocked ✕ · idle 빈 원
  function statusIcon(cx, cy, st, t, s) { const g = G(cx, cy, s ?? 1);
    const col = st === 'done' ? GOOD : st === 'running' ? INFO : st === 'waiting' ? WARN : st === 'blocked' ? BAD : OFF;
    el('circle', { cx: 0, cy: 0, r: 15, fill: st === 'idle' ? PANEL : col, stroke: col, 'stroke-width': 2.5, opacity: st === 'running' ? 0.25 : 1 }, g);
    if (st === 'running') { const a = (t * 4) % (Math.PI * 2); el('path', { d: `M${15 * Math.cos(a)},${15 * Math.sin(a)} A15,15 0 0 1 ${15 * Math.cos(a + 2)},${15 * Math.sin(a + 2)}`, fill: 'none', stroke: INFO, 'stroke-width': 4, 'stroke-linecap': 'round' }, g); }
    if (st === 'done') el('path', { d: 'M-7,0 L-2,6 L8,-6', fill: 'none', stroke: PANEL, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    if (st === 'blocked') el('path', { d: 'M-6,-6 L6,6 M6,-6 L-6,6', stroke: PANEL, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g);
    if (st === 'waiting') [-4, 4].forEach((d) => el('rect', { x: d - 2, y: -6, width: 4, height: 12, rx: 1, fill: PANEL }, g));
    return col; }
  // 노트북: 화면 + 받침, 화면 안에 명령 한 줄
  function laptop(cx, cy, cmd, o) { o = o || {}; const g = G(cx, cy, o.s, o.op);
    el('rect', { x: -70, y: -46, width: 140, height: 86, rx: 8, fill: INK, stroke: INK, 'stroke-width': 2 }, g);
    el('path', { d: 'M-88,44 L88,44 L78,56 L-78,56 Z', fill: PANEL, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    if (cmd) mono(-58, -4, cmd, { 'font-size': 14, fill: PANEL }, g);
    if (o.name) tx(0, 80, o.name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 }, g); return g; }

  // ---------- 1. 워크플로우 파일 한 장 ----------
  const WF = ['name: Pulumi', 'on:', '  pull_request: { branches: [main] }', '  push: { branches: [main] }',
    'permissions:', '  contents: read', '  pull-requests: write', '  id-token: write',
    'jobs:', "  preview: # if: event == 'pull_request'", "  up:      # if: event == 'push'"];
  const WF_BEAT = [0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3];   // 몇 번째 beat 에 나타나는 줄인가
  function s1(t, c) { const { k, u } = c;
    codePanel(24, 30, 452, '.github/workflows/pulumi.yml', WF, {
      show: (i) => (WF_BEAT[i] < k ? 1 : WF_BEAT[i] === k && k < 4 ? fade(u, 0.2 + (i - WF_BEAT.indexOf(k)) * 0.25) : WF_BEAT[i] <= k ? 1 : 0),
      hot: (i) => WF_BEAT[i] === k });
    const EV = [[590, 92, 'pull_request'], [590, 182, 'push: main']], JB = [[840, 92, 'preview'], [840, 182, 'up']];
    if (k === 0) { // 저장소 안 자리와 Actions 탭
      tx(520, 70, 'infra 저장소', { 'font-size': 15, 'font-weight': 700 });
      ['.github/workflows/pulumi.yml', 'index.ts', 'Pulumi.yaml', 'Pulumi.dev.yaml', 'Pulumi.prod.yaml'].forEach((f, i) => {
        const y = 104 + i * 34, hot = i === 0, s = hot ? pop(u, 0.3) : 1;
        if (hot) el('rect', { x: 516, y: y - 20, width: 300, height: 30, rx: 6, fill: ACCBG, opacity: s });
        mono(530, y, (i ? '  ' : '') + f, { 'font-size': 14, 'font-weight': hot ? 700 : 400, fill: hot ? ACC : MUT, opacity: hot ? s : 1 }); });
      tx(520, 310, 'Actions 탭', { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 1.2) });
      pill(660, 346, '▶ Pulumi', ACC, pop(u, 1.5), { fs: 15 }); return; }
    // 이벤트 → 잡
    EV.forEach(([x, y, s], i) => pill(x, y, s, INFO, k === 1 ? pop(u, 0.3 + i * 0.4) : 1, { mono: true, fs: 14 }));
    JB.forEach(([x, y, s], i) => card(x, y, 120, 44, { rx: 8, text: s, fs: 15, mono: true, stroke: k >= 3 ? ACC : GRID, dash: k >= 3 ? null : '6 5', color: k >= 3 ? ACC : MUT, s: k === 1 ? pop(u, 0.9 + i * 0.4) : 1 }));
    EV.forEach(([x, y], i) => grow(x + 72, y, JB[i][0] - 64, y, k === 1 ? E(u, 1.2 + i * 0.4, 1.9 + i * 0.4) : 1, k >= 3 ? ACC : MUT, { dash: k >= 3 ? null : '5 5' }));
    if (k === 1) sub(715, 238, 'PR은 preview, main 머지는 up을 깨운다', fade(u, 2.1), { 'font-size': 14.5, fill: INK });
    if (k === 2) { tx(520, 262, '러너 토큰에 주는 권한', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['contents: read', '체크아웃'], ['pull-requests: write', 'PR 코멘트'], ['id-token: write', 'OIDC 토큰']].forEach(([a, b], i) => {
        const x = 590 + i * 140, s = pop(u, 0.4 + i * 0.35); card(x, 312, 132, 56, { rx: 8, stroke: GOOD, s });
        mono(x, 306, a.split(':')[0] + ':', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: s });
        tx(x, 327, a.split(': ')[1] + ' · ' + b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
      const s = pop(u, 1.7); card(660, 380, 200, 30, { rx: 15, stroke: OFF, dash: '5 4', text: '기본 write-all', fs: 13.5, color: OFF, s });
      el('line', { x1: 570, y1: 380, x2: lerp(570, 750, E(u, 1.9, 2.4)), y2: 380, stroke: BAD, 'stroke-width': 3 }); }
    if (k === 3) { mono(715, 140, 'github.event_name', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) });
      [0, 1].forEach((i) => dot([[EV[i][0] + 72, EV[i][1]], [JB[i][0] - 64, JB[i][1]]], seg(u, 0.6 + i * 0.6, 1.5 + i * 0.6), ACC, 7));
      sub(715, 250, '파일은 하나, 잡은 둘. if가 이벤트별로 가른다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }
    if (k === 4) { laptop(610, 320, '$ pulumi up', { name: '내 노트북', s: pop(u, 0.2) });
      if (u > 0.9) el('line', { x1: 548, y1: 316, x2: lerp(548, 662, E(u, 0.9, 1.3)), y2: 316, stroke: BAD, 'stroke-width': 3.5 });
      server(830, 300, 'CI 러너만', { lamp: GOOD, s: pop(u, 1.3) });
      check(900, 262, 12, pop(u, 1.8)); sub(830, 400, '모든 변경이 실행 로그로 남는다', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); } }

  // ---------- 2. preview 잡과 PR 코멘트 ----------
  const PSTEP = ['actions/checkout@v4', 'setup-node · node 20', 'npm ci', 'pulumi/actions@v6 · preview', 'comment-on-pr'];
  function prPage(x, y, w, h, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    tx(x + 16, y + 28, 'add prod redis cache', { 'font-size': 16, 'font-weight': 800 }); mono(x + w - 16, y + 28, '#142', { 'font-size': 15, fill: MUT, 'text-anchor': 'end' });
    mono(x + 16, y + 52, 'feat/redis → main', { 'font-size': 13.5, fill: MUT });
    el('line', { x1: x, y1: y + 66, x2: x + w, y2: y + 66, stroke: GRID, 'stroke-width': 1.5 }); }
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: 러너 잡 단계
    zone(24, 24, 420, 372, 'preview 잡 · ubuntu-latest', { fill: SOFT });
    pill(330, 48, 'pull_request', INFO, k === 0 ? pop(u, 0.3) : 1, { mono: true, fs: 13.5 });
    const st = (i) => { if (k === 0) return 'idle';
      if (i < 3) return k === 1 ? (u > 0.5 + i * 0.6 ? 'done' : u > 0.2 + i * 0.6 ? 'running' : 'idle') : 'done';
      if (i === 3) return k < 2 ? 'idle' : k === 2 ? (u > 2.2 ? 'done' : 'running') : 'done';
      return k < 3 ? 'idle' : k === 3 ? (u > 2.0 ? 'done' : 'running') : 'done'; };
    PSTEP.forEach((s, i) => { const y = 96 + i * 58, sc = k === 0 ? pop(u, 0.6 + i * 0.2) : 1;
      statusIcon(62, y, st(i), t, sc); mono(92, y + 5, s, { 'font-size': 14.5, 'font-weight': i >= 3 ? 700 : 400, opacity: sc }); });
    if (k === 2) { pill(234, 368, 'stack: org/infra/dev', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      sub(703, 200, '계산만 한다. 아무것도 만들지 않는다', fade(u, 1.2), { 'font-size': 15, fill: INK }); }
    // 오른쪽: PR 화면
    const X = 470, Y = 24, W = 466;
    prPage(X, Y, W, 372);
    if (k <= 1) sub(X + W / 2, Y + 200, k === 0 ? 'PR이 열리자 러너가 뜬다' : 'Pulumi 프로그램도 그냥 Node 코드다', fade(u, 0.8), { 'font-size': 15 });
    const bot = k >= 3 ? (k === 3 ? E(u, 1.0, 1.8) : 1) : 0;
    if (k === 3) fly(300, 270, X + 120, Y + 110, seg(u, 0.2, 1.1), 'diff', { mono: true });
    if (bot > 0) { el('rect', { x: X + 16, y: Y + 82, width: W - 32, height: 150, rx: 8, fill: SOFT, stroke: GRID, opacity: bot });
      tx(X + 30, Y + 106, 'pulumi bot 님의 코멘트 (예시)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: bot });
      [['Previewing update (dev)', INK], ['+ aws:elasticache:Cluster  redis-prod  create', GOOD], ['Resources: + 1 to create', INK]].forEach(([s, col], i) =>
        mono(X + 30, Y + 140 + i * 28, s, { 'font-size': 14, fill: col, 'font-weight': i ? 700 : 400, opacity: clamp(bot * 3 - i) })); }
    // 체크와 머지 버튼
    if (k >= 2) { const done = k >= 4 || (k === 3) || (k === 2 && u > 2.2);
      el('rect', { x: X + 16, y: Y + 250, width: W - 32, height: 46, rx: 8, fill: PANEL, stroke: GRID });
      statusIcon(X + 40, Y + 273, done ? 'done' : 'running', t, 0.8); mono(X + 64, Y + 278, 'Pulumi / preview', { 'font-size': 14 });
      tx(X + W - 30, Y + 278, done ? '성공' : '진행 중', { 'font-size': 14, 'font-weight': 700, fill: done ? GOOD : INFO, 'text-anchor': 'end' }); }
    if (k === 4) { card(X + 130, Y + 334, 200, 40, { rx: 8, fill: GOOD, stroke: 'none', text: 'Merge pull request', fs: 14.5, color: PANEL, s: pop(u, 0.3) });
      card(X + 350, Y + 334, 170, 40, { rx: 8, fill: PANEL, stroke: BAD, dash: '5 4', text: '실패면 잠김', fs: 14, color: BAD, s: pop(u, 1.2) });
      lock(X + 350 - 66, Y + 336, true, BAD, pop(u, 1.4) * 0.8); } }

  // ---------- 3. OIDC 단기 토큰 ----------
  function s3(t, c) { const { k, u } = c, GX = 120, RX = 430, AX = 790, Y = 110;
    // 세 주체
    card(GX, Y, 170, 64, { rx: 10, text: 'GitHub\nOIDC 발급자', fs: 14.5, stroke: INK });
    server(RX, Y, null, { lamp: INFO, s: 0.8 }); tx(RX, Y + 58, 'preview 잡', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700 });
    card(AX, Y, 190, 64, { rx: 10, text: 'AWS STS\nrole/gha-pulumi', fs: 14.5, stroke: WARN });
    if (k === 0) { dot([[RX - 60, Y - 10], [GX + 85, Y - 10]], seg(u, 0.2, 0.9), MUT, 6);
      const s = E(u, 0.9, 1.6); fly(GX + 60, Y + 40, 110, 198, seg(u, 0.9, 1.6), 'JWT', { mono: true, fill: INFO, stay: true });
      if (s >= 1) { const x = 70, y = 220; el('rect', { x, y, width: 470, height: 118, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 1.8 });
        [['iss', 'token.actions.githubusercontent.com'], ['sub', 'repo:my-org/infra:pull_request'], ['aud', 'sts.amazonaws.com']].forEach(([a, b], i) =>
          spans(x + 16, y + 30 + i * 32, [[a.padEnd(5), { fill: INFO, 'font-weight': 700 }], [b, {}]], { 'font-size': 14.5, opacity: fade(u, 1.7 + i * 0.25) })); }
      sub(780, 300, '잡마다 새 토큰을 받는다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { fly(RX + 60, Y - 20, AX - 95, Y - 20, seg(u, 0.2, 1.0), 'JWT', { mono: true, fill: INFO });
      fly(AX - 95, Y + 30, RX + 150, Y + 30, seg(u, 1.1, 1.9), '임시 자격증명', { fill: WARN, stay: true });
      clock(AX, 260, 28, 1 - E(u, 1.9, 2.8) * 0.2, WARN, '곧 만료');
      // 금고 속 장기 키 지우기
      zone(60, 220, 420, 120, 'GitHub Secrets', { fill: SOFT });
      mono(84, 270, 'AWS_ACCESS_KEY_ID', { 'font-size': 15, 'font-weight': 700, fill: E(u, 0.6, 1.2) > 0.5 ? OFF : INK });
      mono(84, 304, 'AWS_SECRET_ACCESS_KEY', { 'font-size': 15, 'font-weight': 700, fill: E(u, 0.6, 1.2) > 0.5 ? OFF : INK });
      [270, 304].forEach((y, i) => el('line', { x1: 80, y1: y - 5, x2: lerp(80, 300, E(u, 0.6 + i * 0.2, 1.1 + i * 0.2)), y2: y - 5, stroke: BAD, 'stroke-width': 3 }));
      sub(270, 370, 'Secret에 남는 것은 Role ARN뿐', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { zone(60, 210, 540, 160, 'pulumi 단계의 env', { fill: SOFT });
      [['PULUMI_ACCESS_TOKEN', '상태 backend 용', true], ['AWS_ACCESS_KEY_ID', '없음', false], ['AWS_SECRET_ACCESS_KEY', '없음', false]].forEach(([a, b, on], i) => {
        const y = 258 + i * 36, op = fade(u, 0.3 + i * 0.4); mono(84, y, a, { 'font-size': 15, 'font-weight': 700, fill: on ? INK : OFF, opacity: op, 'text-decoration': on ? null : 'line-through' });
        tx(380, y, b, { 'font-size': 14, fill: on ? MUT : OFF, opacity: op }); if (on) check(560, y - 5, 10, pop(u, 0.6)); });
      fly(AX - 40, Y + 40, 700, 300, seg(u, 1.4, 2.2), 'AWS 인증은 OIDC가', { fill: WARN, stay: true });
      return; }
    // k3: 신뢰 정책의 sub 조건
    zone(60, 196, 840, 196, 'IAM Role 신뢰 정책: sub가 이 목록과 같아야 한다', { fill: SOFT });
    [['repo:my-org/infra:pull_request', 'preview 잡', true], ['repo:my-org/infra:environment:production', 'up 잡', true], ['repo:someone/fork:pull_request', '남의 저장소', false]].forEach(([s, who, ok], i) => {
      const y = 246 + i * 46, sc = pop(u, 0.3 + i * 0.55); mono(90, y, s, { 'font-size': 15, 'font-weight': 700, fill: ok ? INK : BAD, opacity: sc });
      tx(560, y, who, { 'font-size': 14.5, fill: MUT, opacity: sc }); (ok ? check : cross)(700, y - 5, 11, sc);
      tx(724, y, ok ? 'Role 받음' : '거절', { 'font-size': 14.5, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: sc }); }); }

  // ---------- 4. main 머지와 승인 게이트 ----------
  function gitGraph(u, k) { const y = 70, x0 = 60, x1 = 520;
    el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: INK, 'stroke-width': 3 }); mono(x0, y - 18, 'main', { 'font-size': 14, 'font-weight': 700 });
    [100, 200].forEach((x) => el('circle', { cx: x, cy: y, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 3 }));
    el('path', { d: `M200,${y} C240,${y + 50} 260,${y + 50} 300,${y + 50} L390,${y + 50}`, fill: 'none', stroke: ACC, 'stroke-width': 3 });
    [300, 350].forEach((x) => el('circle', { cx: x, cy: y + 50, r: 7, fill: PANEL, stroke: ACC, 'stroke-width': 3 }));
    mono(200, y + 80, 'feat/redis  #142', { 'font-size': 13.5, fill: ACC });
    const m = k === 0 ? E(u, 0.2, 1.0) : 1;
    if (m > 0) { el('path', { d: `M390,${y + 50} C420,${y + 50} 430,${y} ${lerp(390, 460, m)},${y}`, fill: 'none', stroke: ACC, 'stroke-width': 3 });
      if (m >= 1) el('circle', { cx: 460, cy: y, r: 10, fill: ACC }); } }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { gitGraph(u, k);
      const pu = k === 0 ? pop(u, 1.1) : 1; pill(460, 150, 'push → main', INFO, pu, { mono: true, fs: 14 });
      grow(520, 150, 610, 150, k === 0 ? E(u, 1.4, 1.9) : 1, INFO);
      const st = k === 0 ? (u > 1.9 ? 'running' : 'idle') : k === 1 ? (u > 0.8 ? 'waiting' : 'running') : (u > 0.6 ? 'running' : 'waiting');
      card(760, 150, 280, 64, { rx: 10, stroke: st === 'waiting' ? WARN : INFO, sw: 2.5 });
      statusIcon(650, 150, st, t); mono(676, 146, 'up 잡', { 'font-size': 15, 'font-weight': 800 });
      tx(676, 168, st === 'waiting' ? 'Waiting for approval' : st === 'running' ? '실행 중' : '대기', { 'font-size': 13.5, fill: st === 'waiting' ? WARN : MUT, 'font-weight': 700 }); }
    if (k === 0) { sub(480, 260, '머지는 main 으로의 push다. 그 순간 up 잡이 깨어난다', fade(u, 2.0), { 'font-size': 15, fill: INK }); return; }
    if (k === 1) { zone(560, 220, 380, 170, 'environment: production', { fill: WARNBG, color: WARN });
      person(640, 300, '@lead-sre', { s: pop(u, 0.9) });
      card(800, 300, 150, 42, { rx: 8, fill: u > 2.2 ? GOOD : PANEL, stroke: GOOD, text: 'Approve', fs: 15, color: u > 2.2 ? PANEL : GOOD, s: pop(u, 1.2) });
      sub(300, 300, '승인 버튼을 누르기 전까지 잡이 멈춘다', fade(u, 1.6), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { card(200, 310, 200, 50, { rx: 8, text: 'preview 잡', fs: 15, mono: true, stroke: GRID });
      card(760, 310, 200, 50, { rx: 8, text: 'up 잡', fs: 15, mono: true, stroke: INFO });
      card(480, 310, 220, 56, { rx: 10, text: 'role/gha-pulumi', fs: 15, mono: true, stroke: WARN, fill: WARNBG, s: pop(u, 0.3) });
      grow(300, 310, 368, 310, E(u, 0.6, 1.1), WARN); grow(660, 310, 592, 310, E(u, 1.1, 1.6), WARN);
      sub(480, 380, '인증 방식은 한 벌. prod 전용 장기 키도 없다', fade(u, 1.9), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { tx(60, 60, 'preview 잡과 up 잡의 차이', { 'font-size': 17, 'font-weight': 800 });
      const rows = [['-', '          command: preview', BAD, BADBG], ['+', '          command: up', GOOD, GOODBG], ['-', '          stack-name: org/infra/dev', BAD, BADBG], ['+', '          stack-name: org/infra/prod', GOOD, GOODBG]];
      rows.forEach(([sg, s, col, bg], i) => { const y = 110 + i * 48 + (i >= 2 ? 14 : 0), op = fade(u, 0.3 + i * 0.4);
        el('rect', { x: 60, y: y - 26, width: 640, height: 40, rx: 6, fill: bg, opacity: op });
        mono(76, y, sg, { 'font-size': 17, 'font-weight': 800, fill: col, opacity: op }); mono(96, y, s.trim(), { 'font-size': 16, opacity: op }); });
      sub(830, 190, '다른 곳은 같다', fade(u, 1.9), { 'font-size': 15 }); sub(830, 216, '두 줄만 바뀐다', fade(u, 2.1), { 'font-size': 15, fill: WARN, 'font-weight': 700 });
      return; }
    // k4: 승인자는 저장소 설정에서
    el('rect', { x: 60, y: 40, width: 560, height: 330, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(80, 72, 'Settings › Environments › production', { 'font-size': 14.5, fill: MUT });
    el('line', { x1: 60, y1: 88, x2: 620, y2: 88, stroke: GRID });
    tx(80, 126, 'Required reviewers', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
    card(200, 170, 220, 40, { rx: 20, stroke: INK, text: '@lead-sre', fs: 15, mono: true, s: pop(u, 0.6) });
    tx(80, 236, 'YAML이 아니라 저장소 설정에 둔다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
    tx(80, 290, 'Branch protection · required check', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.3) });
    card(220, 332, 260, 40, { rx: 20, stroke: GOOD, text: 'Pulumi / preview', fs: 15, mono: true, s: pop(u, 1.5) });
    card(800, 200, 230, 110, { rx: 10, stroke: BAD, dash: '6 5', text: 'preview가 실패한 PR\n머지 불가\nup까지 오지 못한다', fs: 14.5, color: BAD, s: pop(u, 2.0) }); }

  // ---------- 5. 전체 파이프라인 ----------
  const LOG = ['● preview (dev)', '  ✔ configure-aws-credentials (OIDC)', '  ✔ pulumi preview', ['      + aws:elasticache:Cluster  redis-prod  create', '#86efac'], '      Resources: + 1 to create',
    '  ✔ comment-on-pr → PR #142', ['  status: success ✅', '#86efac'], '● up (prod)  environment: production', ['  ⏸ Waiting for approval …', '#fcd34d'], '  ▶ approved by @lead-sre',
    '  ✔ pulumi up', ['      + aws:elasticache:Cluster  redis-prod  created (48s)', '#86efac'], ['  status: success ✅', '#86efac']];
  const FAIL = [['✖ pulumi preview  →  error: policy violation', '#fca5a5'], ['status: failure ❌', '#fca5a5'], '→ required status check 실패', '→ 머지 버튼 잠김, up 잡은 실행조차 안 됨'];
  const LOG_N = [5, 7, 9, 13, 0, 13];
  function s5(t, c) { const { k, u } = c, S = c.beat.stages || [], ps = (c.prev && c.prev.stages) || S;
    const X = (i) => 90 + i * 156, Y = 86;
    el('line', { x1: X(0), y1: Y, x2: X(5), y2: Y, stroke: GRID, 'stroke-width': 4 });
    // 지난 칸까지 색이 차오르는 선
    const lastDone = (arr) => arr.reduce((m, s, i) => (s.status === 'done' ? i : m), -1);
    const d0 = lastDone(ps), d1 = lastDone(S), dd = lerp(d0, d1, E(u, 0.2, 1.4));
    if (dd > 0) el('line', { x1: X(0), y1: Y, x2: X(0) + dd * 156, y2: Y, stroke: S.some((s) => s.status === 'blocked') ? BAD : GOOD, 'stroke-width': 4 });
    S.forEach((s, i) => { const changed = !ps[i] || ps[i].status !== s.status, sc = changed ? 0.7 + 0.3 * pop(u, 0.4 + i * 0.12) : 1;
      statusIcon(X(i), Y, s.status, t, sc * 1.25); tx(X(i), Y + 44, s.name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: s.status === 'blocked' ? BAD : INK }); });
    const run = S.findIndex((s) => s.status === 'running');
    if (run > 0) dot([[X(run - 1), Y], [X(run), Y]], (t * 0.7) % 1, INFO, 6);
    if (k === 4) { terminal(60, 190, 840, 214, FAIL, lerp(0, FAIL.length, E(u, 0.3, 2.2)), { title: 'run-log.txt  (실패했다면)', lh: 26, fs: 14.5 }); return; }
    const n0 = k === 0 ? 0 : LOG_N[k - 1] || 0, n1 = LOG_N[k];
    terminal(60, 190, 840, 214, LOG, k === 5 ? LOG.length : lerp(n0, n1, E(u, 0.2, 2.2)), { title: 'run-log.txt  (예시)', lh: 25, fs: 14.5 });
    if (k === 5) banner(480, 164, '통과는 끝까지 자동, 실패는 머지에서 멈춘다', pop(u, 0.4)); }

  const quiz = [
    { q: '이 워크플로우 파일에서 pulumi up을 깨우는 신호는 무엇인가?',
      o: ['PR이 열리는 pull_request 이벤트', 'main으로 들어오는 push 이벤트', '개발자 노트북의 pulumi up 명령'], a: 1,
      why: 'pull_request는 preview 잡, main 으로의 push는 up 잡을 깨운다. 두 잡은 github.event_name으로 갈린다.' },
    { q: 'preview 잡이 PR에 남기는 코멘트에 담기는 것은 무엇인가?',
      o: ['배포가 끝난 리소스의 실제 ID', '이 PR이 인프라를 어떻게 바꿀지 보여 주는 계획(+1 to create 등)', '리뷰어의 승인 기록'], a: 1,
      why: 'command: preview는 아무것도 만들지 않고 변경 계획만 계산한다. comment-on-pr이 그 diff를 봇 코멘트로 붙인다.' },
    { q: 'OIDC를 쓰면 GitHub Secrets에서 사라지는 것은 무엇인가?',
      o: ['AWS_ACCESS_KEY_ID 같은 장기 클라우드 키', 'PULUMI_ACCESS_TOKEN', 'IAM Role의 ARN'], a: 0,
      why: '잡은 GitHub이 발급한 단기 토큰으로 role/gha-pulumi를 assume 한다. env에는 상태 backend 용 PULUMI_ACCESS_TOKEN만 남는다.' },
    { q: 'main에 머지된 뒤 up 잡이 Waiting으로 멈춰 있는 이유는 무엇인가?',
      o: ['preview가 실패해서', 'environment: production에 지정된 승인자가 아직 누르지 않아서', 'OIDC 토큰이 만료돼서'], a: 1,
      why: 'environment: production 한 줄이 승인 게이트를 건다. Required reviewers는 저장소 Environments 설정에서 지정한다.' },
    { q: 'preview가 정책 위반으로 실패한 PR에서 up 잡은 어떻게 되나?',
      o: ['승인만 받으면 실행된다', 'prod에 일부만 배포된다', 'required check가 머지를 막아 up 잡은 시작조차 못 한다'], a: 2,
      why: '빨간불인 preview는 required status check를 통과하지 못해 머지 버튼이 잠긴다. 머지가 없으니 push도, up 잡도 없다.' },
  ];

  const summary = [
    '노트북에서 각자 up 하면 누가 무엇을 바꿨는지 남지 않는다. 클라우드를 바꾸는 주체를 CI 러너 하나로 좁힌다.',
    'PR에서는 preview 잡이 변경 계획을 계산해 PR 코멘트로 붙인다. 리뷰어는 코드 옆에서 인프라 diff를 본다.',
    '러너는 GitHub이 잡마다 발급한 단기 토큰으로 IAM Role을 받아 쓴다. Secret에 장기 AWS 키를 두지 않는다.',
    'main 머지가 up 잡을 깨우고 production 승인 게이트에서 한 번 더 멈춘다. preview가 실패한 PR은 머지되지 않는다.',
  ];
  const review = [
    { q: '신뢰 정책의 sub를 repo:my-org/infra:ref:refs/heads/main 하나로만 두었더니 OIDC 인증이 실패했다. 먼저 의심할 것은?',
      o: ['잡마다 sub 값이 달라 목록과 맞지 않는다', 'id-token: write 대신 contents: read를 줘야 한다', 'PULUMI_ACCESS_TOKEN이 만료됐다'], a: 0,
      why: 'sub는 잡의 이벤트와 environment로 정해진다. preview 잡은 repo:my-org/infra:pull_request, up 잡은 repo:my-org/infra:environment:production을 허용해야 한다.' },
    { q: '리뷰어가 PR 코멘트에서 + 1 to create를 확인하고 승인했다. 머지 직후 prod에서 실제로 리소스가 만들어지는 때는?',
      o: ['PR이 머지되는 순간 바로', '@lead-sre가 production 게이트에서 Approve를 누른 뒤 up 잡이 돌 때', '다음 PR의 preview가 돌 때'], a: 1,
      why: '머지는 up 잡을 깨우지만 environment: production이 승인 전까지 잡을 멈춘다. 승인 뒤 up이 돌고 예시 로그에서 redis-prod가 48초 만에 생긴다.' },
    { q: '누군가 급한 마음에 노트북에서 prod로 pulumi up을 했다. 이 파이프라인 관점에서 가장 큰 문제는?',
      o: ['노트북이 러너보다 느리다', 'preview 코멘트가 두 번 달린다', '리뷰·승인·실행 로그를 모두 건너뛴다'], a: 2,
      why: '이 설계는 클라우드를 바꾸는 통로를 CI 러너 하나로 좁혀 모든 변경을 리뷰·승인·로그로 남기는 것이다. 로컬 up은 그 통로를 우회한다.' },
  ];

  R.page({ title: 'GitOps 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
