/* II-1-1 manual sync — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 Git 저장소(커밋 해시), 가운데 Argo CD 앱 카드(Sync·Health), 오른쪽 클러스터(live 해시·Pod).
 * manual 이면 Argo CD 와 클러스터 사이에 "사람 승인" 문이 있다. 해시·replicas·이미지 태그는 페이지 STEPS 와 코드 블록의 값만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, person, cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 자리 ----------
  const GX = 30, GW = 220, AX = 480, AY = 128, KX = 710, KW = 220, TOP = 30, H = 230;
  const rev = (s) => String(s || '').split(' ')[0].split('+')[0];
  const SYNC = { Synced: GOOD, OutOfSync: WARN, Syncing: INFO };
  function badge(cx, cy, s, sc) { return pill(cx, cy, s, SYNC[s] || MUT, sc, { fs: 14, fill: (SYNC[s] === GOOD ? GOODBG : SYNC[s] === WARN ? WARNBG : INFOBG) }); }
  // Git 저장소: commits 는 위가 최신. o.fresh = 맨 위 커밋이 들어오는 정도(0→1)
  function gitRepo(commits, o) { o = o || {};
    zone(GX, TOP, GW, H, 'Git 저장소 · main', { fill: SOFT });
    commits.slice(0, 4).forEach((cm, i) => { const y = TOP + 62 + i * 46, hot = i === 0, f = hot && o.fresh != null ? o.fresh : 1;
      if (f <= 0) return;
      card(GX + GW / 2, lerp(y - 30, y, E(f, 0, 1)), GW - 36, 36, { rx: 8, stroke: hot ? ACC : GRID, sw: hot ? 2.4 : 1.5, fill: hot ? ACCBG : PANEL, op: clamp(f * 1.5) });
      mono(GX + 34, lerp(y - 30, y, E(f, 0, 1)) + 5, cm[0], { 'font-size': 15, 'font-weight': 700, fill: hot ? ACC : MUT, opacity: clamp(f * 1.5) });
      if (cm[1]) tx(GX + GW - 28, lerp(y - 30, y, E(f, 0, 1)) + 5, cm[1], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: clamp(f * 1.5) });
      if (i < commits.length - 1 && i < 3) el('line', { x1: GX + 34, y1: y + 18, x2: GX + 34, y2: y + 28, stroke: GRID, 'stroke-width': 2 }); }); }
  // Argo CD 앱 카드
  function appCard(sync, health, o) { o = o || {};
    card(AX, AY, 210, 128, { rx: 12, stroke: INK, sw: 2.2, s: o.s });
    tx(AX, AY - 40, 'Argo CD · web-prd', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
    badge(AX, AY - 2, sync, 1 + (o.bump || 0));
    if (health) pill(AX, AY + 36, health, health === 'Healthy' ? GOOD : health === 'Degraded' ? BAD : INFO, 1, { fs: 13.5 }); }
  // 클러스터: live 해시 + Deployment Pod 들
  function cluster(live, pods, o) { o = o || {};
    zone(KX, TOP, KW, H, '클러스터 (live)', { fill: SOFT, stroke: o.hot ? BAD : 'none' });
    card(KX + KW / 2, TOP + 62, KW - 36, 36, { rx: 8, stroke: o.liveCol || INFO, sw: 2.2, fill: PANEL });
    mono(KX + KW / 2, TOP + 67, live, { 'font-size': 15, 'font-weight': 700, fill: o.liveCol || INFO, 'text-anchor': 'middle' });
    tx(KX + 22, TOP + 116, 'Deployment web', { 'font-size': 14, 'font-weight': 700 });
    const n = Math.round(pods), ghost = o.ghost || 0;
    for (let i = 0; i < n + ghost; i++) { const x = KX + 36 + (i % 5) * 38, y = TOP + 152 + Math.floor(i / 5) * 38, g = i >= n;
      el('circle', { cx: x, cy: y, r: 13, fill: g ? 'none' : GOODBG, stroke: g ? MUT : GOOD, 'stroke-width': 2, 'stroke-dasharray': g ? '4 4' : null, opacity: g ? (o.ghostOp ?? 1) : 1 }); }
    mono(KX + 22, TOP + 222, `replicas ${n}`, { 'font-size': 14, fill: MUT }); }
  // 두 줄기 길: Git→Argo(감시), Argo→클러스터(적용). gate = 사람 승인 문 (0 닫힘 ~ 1 열림)
  const PATH1 = [[GX + GW, AY], [AX - 105, AY]], PATH2 = [[AX + 105, AY], [KX, AY]];
  function lanes(o) { o = o || {};
    el('line', { x1: PATH1[0][0], y1: AY, x2: PATH1[1][0], y2: AY, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '6 6' });
    el('line', { x1: PATH2[0][0], y1: AY, x2: PATH2[1][0], y2: AY, stroke: GRID, 'stroke-width': 2.5 });
    if (o.gate != null) { const gx = (PATH2[0][0] + PATH2[1][0]) / 2, open = clamp(o.gate);
      el('rect', { x: gx - 6, y: AY - 40 + open * -30, width: 12, height: 80, rx: 4, fill: open > 0.5 ? GOOD : WARN, opacity: 0.9 });
      lock(gx, AY + 66, open < 0.5, open > 0.5 ? GOOD : WARN);
      sub(gx, AY + 100, open > 0.5 ? '승인됨' : '사람 승인', 1, { 'font-weight': 700, fill: open > 0.5 ? GOOD : WARN }); } }
  const eqSign = (eq, op) => tx(480, TOP + 260, eq ? 'Git = live' : 'Git ≠ live', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: eq ? GOOD : WARN, opacity: op ?? 1 });

  // ---------- 1. 왜 manual ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, g = rev(b.gitRev), lv = rev(b.liveRev);
    if (k === 0) {   // automated: push 가 곧 배포
      gitRepo([['b9c8d7e', '새 커밋'], ['a1b2c3d', '']], { fresh: E(u, 0.1, 0.6) });
      lanes(); appCard('Syncing', null, { bump: R.bump(t, 0.9) });
      pill(AX, AY + 40, 'automated: on', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      dot([...PATH1, ...PATH2], seg(u, 0.6, 1.6), BAD, 8);
      cluster(u > 1.6 ? 'b9c8d7e' : 'a1b2c3d', 3, { liveCol: u > 1.6 ? BAD : INFO, hot: u > 1.6 });
      banner(480, 330, '검토 0초 · 잘못된 커밋도 바로 프로덕션', pop(u, 1.8));
      return; }
    if (k === 1) {   // manual 이 맞는 자리
      gitRepo([[g, '']]); lanes({ gate: 0 }); appCard(b.status, 'Healthy'); cluster(lv, 3); eqSign(true);
      [['결제 · 인증', '실수가 치명적', 'lock'], ['승인 워크플로', '배포 담당자 승인', 'person'], ['배포 시간대', '야간 배포 창구', 'clock']].forEach(([a, d, ic], i) => {
        const cx = 175 + i * 305, s = pop(u, 0.3 + i * 0.45); card(cx, 352, 270, 70, { rx: 10, stroke: WARN, sw: 2, s });
        const o = fade(u, 0.35 + i * 0.45);
        if (ic === 'lock') lock(cx - 100, 352, true, WARN, s); else if (ic === 'person') person(cx - 100, 356, null, { s: s * 0.7, stroke: WARN }); else clock(cx - 100, 352, 15, 0.7 * s, WARN);
        tx(cx - 72, 346, a, { 'font-size': 16, 'font-weight': 700, opacity: o }); tx(cx - 72, 370, d, { 'font-size': 13.5, fill: MUT, opacity: o }); });
      return; }
    if (k === 2) {   // push → OutOfSync 표시만
      gitRepo([[g, '새 커밋'], ['a1b2c3d', '']], { fresh: E(u, 0.1, 0.6) });
      lanes({ gate: 0 }); appCard(u > 1.2 ? 'OutOfSync' : 'Synced', 'Healthy', { bump: R.bump(u, 1.2) });
      dot(PATH1, seg(u, 0.5, 1.2), ACC, 7);
      const gx = (PATH2[0][0] + PATH2[1][0]) / 2; if (u > 1.4) { dot([PATH2[0], [gx - 12, AY]], seg(u, 1.4, 1.9), WARN, 7); if (u > 1.9) cross(gx - 30, AY - 26, 9, pop(u, 1.9)); }
      cluster(lv, 3); eqSign(false, fade(u, 1.3));
      tx(480, 340, 'OutOfSync = 배포 대기 표시', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      return; }
    if (k === 3) {   // 사람이 승인
      gitRepo([[g, ''], ['a1b2c3d', '']]); const open = E(u, 0.9, 1.4);
      lanes({ gate: open }); appCard('Syncing', 'Healthy');
      const gx = (PATH2[0][0] + PATH2[1][0]) / 2; person(gx, 330, '배포 담당자', { s: pop(u, 0.2), stroke: INK });
      grow(gx - 40, 318, gx - 40, AY + 70, E(u, 0.5, 0.9), INK);
      dot(PATH2, seg(u, 1.4, 2.2), ACC, 8);
      cluster(u > 2.2 ? lv : 'a1b2c3d', 3, { liveCol: u > 2.2 ? GOOD : INFO }); eqSign(u > 2.2, fade(u, 2.2));
      return; }
    // k4: manual = automated 를 쓰지 않는 것
    gitRepo([[g, '']]); lanes({ gate: 0 }); appCard(b.status, 'Healthy'); cluster(lv, 3);
    R.snippet(300, 290, ['syncPolicy:', '  # automated: …   ← 이 블록이 없다'], { op: fade(u, 0.2) });
    banner(480, 392, 'automated가 없으면 기본이 manual', pop(u, 1.0)); }

  // ---------- 2. OutOfSync 감지 ----------
  function s2(t, c) { const { k, u } = c, b = c.beat, g = rev(b.gitRev), lv = rev(b.liveRev);
    const commits = [[g, 'replicas 3 → 5'], ['a1b2c3d', '']];
    if (k === 0) {
      gitRepo(commits, { fresh: E(u, 0.1, 0.7) }); lanes({ gate: 0 }); appCard('Synced', 'Healthy'); cluster(lv, 3);
      const f = E(u, 0.8, 2.6) * 0.8; clock(AX, 300, 30, f, INFO);
      tx(AX + 46, 296, '폴링 120초 + 지터 최대 60초', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(AX + 46, 320, '또는 webhook이 바로 알려 준다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) });
      tx(AX, 370, 'Argo CD가 아직 모르는 구간', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    if (k === 1) {
      gitRepo(commits); lanes({ gate: 0 }); appCard(u > 1.6 ? 'OutOfSync' : 'Synced', 'Healthy', { bump: R.bump(u, 1.6) }); cluster(lv, 3);
      dot(PATH1, seg(u, 0.2, 0.9), ACC, 7);
      terminal(150, 280, 660, 128, ['$ argocd app get web-prd', ['Sync Status:    OutOfSync from main (e4f5a6b)', 'var(--hl)'], 'Health Status:  Healthy'], lerp(0, 3, E(u, 0.4, 2.2)), { title: 'detect-outofsync.sh' });
      return; }
    if (k === 2) {   // 두 질문은 따로다
      const q = [['Sync', 'Git과 같은가?', 'OutOfSync', WARN, WARNBG], ['Health', '잘 돌고 있는가?', 'Healthy', GOOD, GOODBG]];
      q.forEach(([n, qq, v, col, bg], i) => { const cx = 250 + i * 460, s = pop(u, 0.2 + i * 0.6);
        card(cx, 140, 380, 170, { rx: 14, stroke: col, sw: 2.5, fill: PANEL, s });
        tx(cx, 92, n, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.6) });
        tx(cx, 124, qq, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.4 + i * 0.6) });
        pill(cx, 168, v, col, pop(u, 0.7 + i * 0.6), { fs: 17, fill: bg }); });
      tx(250, 208, `Git ${g} · live ${lv}`, { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT, opacity: fade(u, 1.0) });
      for (let i = 0; i < 3; i++) el('circle', { cx: 670 + i * 40, cy: 208, r: 11, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.4 + i * 0.1) });
      tx(800, 213, 'Pod 3개 정상', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.6) });
      R.cells(140, 270, ['apps', 'Deployment', 'web', 'web', 'OutOfSync', 'Healthy'], { w: 108, h: 40, gap: 6, fs: 14,
        style: (i) => ({ s: pop(u, 1.8 + i * 0.08), stroke: i === 4 ? WARN : i === 5 ? GOOD : GRID, color: i === 4 ? WARN : i === 5 ? GOOD : INK }) });
      ['GROUP', 'KIND', 'NAMESPACE', 'NAME', 'STATUS', 'HEALTH'].forEach((h, i) => sub(140 + 54 + i * 114, 334, h, fade(u, 1.9)));
      tx(480, 378, '구버전이 멀쩡히 돌고 있을 뿐, 앱이 죽은 게 아니다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) });
      return; }
    if (k === 3) {   // 목록 훑기 + refresh
      gitRepo(commits); lanes({ gate: 0 }); appCard('OutOfSync', 'Healthy'); cluster(lv, 3);
      dot([[AX - 105, AY - 14], [GX + GW, AY - 14]], seg(u, 1.4, 1.9), INFO, 7); dot([[GX + GW, AY + 14], [AX - 105, AY + 14]], seg(u, 1.9, 2.4), INFO, 7);
      pill(355, AY - 44, '--refresh', INFO, pop(u, 1.3), { mono: true, fs: 13.5 });
      terminal(60, 280, 840, 128, ['$ argocd app list | grep OutOfSync', ['argocd/web-prd  https://kubernetes.default.svc  web  production  OutOfSync  Healthy  Manual', 'var(--hl)'], '$ argocd app get web-prd --refresh'], lerp(0, 3, E(u, 0.2, 1.4)), { title: '조회만 한다 · 클러스터는 그대로' });
      return; }
    // k4: 클러스터는 그대로
    gitRepo(commits); lanes({ gate: 0 }); appCard('OutOfSync', 'Healthy');
    cluster(lv, 3, { ghost: 2, ghostOp: fade(u, 0.4) });
    tx(KX + KW / 2, TOP + 252, '점선 2개 = Git이 원하는 몫', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
    lock(AX + 162, AY + 66, true, WARN, 1 + R.bump(u, 1.2));
    banner(480, 360, '승인 전까지 live는 replicas 3 그대로', pop(u, 1.6)); }

  // ---------- 3. diff 리뷰 ----------
  const LIVE = [['image', 'acme/web:v2.3.0'], ['replicas', '3']], GIT = [['image', 'acme/web:v2.3.1'], ['replicas', '5']];
  function manifest(cx, title, rows, col, s, hiRow) { card(cx, 118, 290, 132, { rx: 10, stroke: col, sw: 2.2, s });
    if (s < 0.5) return; tx(cx - 128, 76, title, { 'font-size': 15, 'font-weight': 800, fill: col });
    rows.forEach(([kk, v], i) => { const y = 112 + i * 34; if (hiRow != null && hiRow(i)) el('rect', { x: cx - 134, y: y - 20, width: 268, height: 28, rx: 5, fill: C.HL, opacity: 0.6 });
      mono(cx - 124, y, kk + ':', { 'font-size': 15, fill: MUT }); mono(cx - 32, y, v, { 'font-size': 15, 'font-weight': 700 }); }); }
  function diffPanel(x, y, rows, shown) { el('rect', { x, y, width: 520, height: 34 + rows.length * 28, rx: 10, fill: INK });
    mono(x + 16, y + 24, '===== apps/Deployment web/web ======', { 'font-size': 14, fill: 'var(--term)' });
    rows.forEach(([sg, s], i) => { if (i >= shown) return; mono(x + 16, y + 52 + i * 28, `${sg} ${s}`, { 'font-size': 15, 'font-weight': 700, fill: sg === '-' ? '#f87171' : '#4ade80' }); }); }
  const DROWS = [['-', 'image: acme/web:v2.3.0'], ['+', 'image: acme/web:v2.3.1'], ['-', 'replicas: 3'], ['+', 'replicas: 5']];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      manifest(180, 'live (클러스터)', LIVE, INFO, pop(u, 0.2)); manifest(780, 'Git (목표)', GIT, ACC, pop(u, 0.5));
      grow(330, 118, 630, 118, E(u, 0.9, 1.6), MUT, { plain: true, dash: '5 5' });
      pill(480, 118, 'argocd app diff web-prd', INK, pop(u, 1.4), { mono: true, fs: 14 });
      tx(480, 270, '읽기 전용 · 실행해도 클러스터는 바뀌지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      return; }
    manifest(180, 'live (클러스터)', LIVE, INFO, 1, k === 2 ? () => u > 0.6 : null); manifest(780, 'Git (목표)', GIT, ACC, 1, k === 2 ? () => u > 0.6 : null);
    if (k === 1) {
      diffPanel(220, 230, DROWS, 0);
      pill(330, 300, '-  지금 live 값', BAD, pop(u, 0.5), { fs: 15 }); pill(630, 300, '+  Git 목표 값', GOOD, pop(u, 1.0), { fs: 15 });
      grow(180, 186, 300, 286, E(u, 0.6, 1.2), BAD); grow(780, 186, 660, 286, E(u, 1.1, 1.7), MUT);
      tx(480, 400, '부호를 거꾸로 읽으면 롤백을 배포로 착각한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
      return; }
    if (k === 2) {
      diffPanel(220, 220, DROWS, Math.floor(lerp(0, 4.99, E(u, 0.2, 1.6))));
      el('path', { d: 'M752,248 h14 v108 h-14', fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      tx(778, 300, '한 커밋에 값 두 개', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      tx(778, 322, '장애 나면 원인 분리가 어렵다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) });
      return; }
    if (k === 3) {
      [['이미지 태그가 의도한 릴리스인가', 'v2.3.1'], ['replicas 변화가 용량 계획과 맞나', '3 → 5'], ['삭제(-)되는 리소스가 있나', '없음'], ['Secret / ConfigMap이 바뀌었나', '그대로']].forEach(([a, v], i) => {
        const y = 222 + i * 46, at = 0.3 + i * 0.5; el('rect', { x: 180, y: y - 18, width: 26, height: 26, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 2 });
        if (u > at + 0.3) check(193, y - 5, 9, pop(u, at + 0.3));
        tx(222, y + 1, a, { 'font-size': 16, 'font-weight': 600, opacity: fade(u, at) }); mono(760, y + 1, v, { 'font-size': 15, 'font-weight': 700, fill: i === 2 ? GOOD : INK, 'text-anchor': 'end', opacity: fade(u, at + 0.2) }); });
      return; }
    // k4: dry-run
    const f = seg(u, 0.3, 1.3), back = seg(u, 1.5, 2.3);
    card(480, 300, 200, 60, { rx: 10, stroke: INFO, sw: 2.2, text: '검증 (client 모드)', fs: 15, s: pop(u, 0.2) });
    fly(780, 190, 520, 280, f, 'Git 매니페스트', { mono: false });
    if (u > 1.3) check(480, 352, 10, pop(u, 1.3));
    fly(560, 300, 780, 360, back, '형식 OK', { fill: GOOD, stay: true });
    pill(180, 300, 'live 변경 없음', INFO, pop(u, 1.8), { fs: 14 });
    pill(480, 228, 'argocd app sync web-prd --dry-run', INK, pop(u, 0.1), { mono: true, fs: 13.5 }); }

  // ---------- 4. sync 승인 ----------
  function s4(t, c) { const { k, u } = c, b = c.beat, g = rev(b.gitRev);
    if (k === 0) {
      gitRepo([[g, ''], ['a1b2c3d', '']]); lanes({ gate: E(u, 1.0, 1.4) }); appCard(u > 1.0 ? 'Syncing' : 'OutOfSync', 'Healthy'); cluster('a1b2c3d', 3);
      const bs = 1 - 0.12 * Math.sin(Math.PI * seg(u, 0.6, 1.0)); card(480, 330, 150, 52, { rx: 10, fill: ACC, stroke: 'none', text: 'SYNC', fs: 19, color: PANEL, s: pop(u, 0.1) * bs });
      person(330, 330, '사람', { s: pop(u, 0.2) }); grow(360, 330, 400, 330, E(u, 0.3, 0.7), INK);
      dot(PATH2, seg(u, 1.4, 2.4), ACC, 8);
      return; }
    if (k === 1) {
      const nPods = lerp(3, 5, E(u, 1.0, 2.2));
      gitRepo([[g, ''], ['a1b2c3d', '']]); lanes({ gate: 1 }); appCard(u > 2.2 ? 'Synced' : 'Syncing', 'Healthy'); cluster(u > 1.0 ? g : 'a1b2c3d', nPods, { liveCol: u > 1.0 ? GOOD : INFO });
      [['Deployment  web', u > 1.6 ? 'Synced' : 'Syncing']].forEach(([n, st]) => { card(480, 320, 360, 46, { rx: 8, stroke: SYNC[st], sw: 2 }); mono(318, 325, n, { 'font-size': 15 }); mono(640, 325, st, { 'font-size': 15, 'font-weight': 700, fill: SYNC[st], 'text-anchor': 'end' }); });
      tx(480, 376, 'live 해시가 Git을 따라잡으면 sync 끝', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    if (k === 2) {   // 부분 sync
      zone(560, 40, 370, 300, '클러스터 리소스', { fill: SOFT });
      card(745, 110, 320, 54, { rx: 10, stroke: GOOD, sw: 2.5, fill: GOODBG, s: pop(u, 0.4) }); mono(605, 116, 'apps:Deployment:web', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      if (u > 1.4) check(880, 110, 10, pop(u, 1.4));
      [0, 1, 2].forEach((i) => card(745, 180 + i * 50, 320, 40, { rx: 8, stroke: GRID, dash: '5 5', s: pop(u, 0.6 + i * 0.15) }));
      tx(745, 330, '나머지는 이번 sync에서 빠진다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      pill(270, 110, '--resource apps:Deployment:web', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      dot([[400, 110], [585, 110]], seg(u, 0.8, 1.4), ACC, 8);
      tx(270, 220, '대량 변경을 나눠 밀면', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(270, 246, '사고 범위가 줄어든다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) {   // wait + UI
      card(250, 140, 380, 170, { rx: 12, stroke: INK, sw: 2 });
      mono(80, 86, 'argocd app wait web-prd', { 'font-size': 15, 'font-weight': 700 }); mono(80, 110, '--sync --health --timeout 120', { 'font-size': 14, fill: MUT });
      const f = E(u, 0.3, 2.0); el('rect', { x: 80, y: 130, width: 340, height: 14, rx: 7, fill: SOFT }); el('rect', { x: 80, y: 130, width: 340 * f, height: 14, rx: 7, fill: ACC });
      [['sync', 0.9], ['health', 1.7]].forEach(([n, at], i) => { const x = 110 + i * 160; if (u > at) check(x, 186, 10, pop(u, at)); tx(x + 18, 192, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, at) }); });
      card(700, 160, 400, 230, { rx: 12, stroke: GRID, sw: 1.8, s: pop(u, 0.6) });
      tx(520, 74, 'UI · SYNCHRONIZE 패널', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.7) });
      [['PRUNE', false], ['DRY RUN', false], ['Deployment web', true]].forEach(([n, on], i) => { const y = 120 + i * 42, op = fade(u, 0.9 + i * 0.2);
        el('rect', { x: 530, y: y - 15, width: 22, height: 22, rx: 4, fill: on ? ACC : PANEL, stroke: on ? ACC : INK, 'stroke-width': 2, opacity: op });
        tx(566, y + 2, n, { 'font-size': 15, opacity: op, class: i === 2 ? 'mono' : null }); });
      card(700, 248, 180, 40, { rx: 8, fill: ACC, stroke: 'none', text: 'SYNCHRONIZE', fs: 15, color: PANEL, s: pop(u, 1.6) });
      tx(250, 270, 'CI는 여기서 배포 완료를 기다린다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) });
      return; }
    // k4: 결과 + 기록
    gitRepo([[g, ''], ['a1b2c3d', '']]); lanes({ gate: 1 }); appCard('Synced', 'Healthy', { bump: R.bump(u, 0.3) }); cluster(g, 5, { liveCol: GOOD }); eqSign(true);
    tx(480, 330, `Sync Status: Synced to main (${g})`, { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.6) });
    [['a1b2c3d', '이전 배포'], [g, '이번 배포']].forEach(([h, d], i) => { const x = 330 + i * 300;
      card(x, 382, 230, 40, { rx: 8, stroke: i ? ACC : GRID, sw: 2, s: pop(u, 1.0 + i * 0.4) }); mono(x - 96, 388, h, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1 + i * 0.4) }); tx(x + 96, 388, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.1 + i * 0.4) }); });
    grow(447, 382, 513, 382, E(u, 1.4, 1.8), MUT); }

  // ---------- 5. 실무 함정 ----------
  function s5(t, c) { const { k, u } = c, b = c.beat, g = rev(b.gitRev), lv = rev(b.liveRev);
    if (k === 0) {   // 방치
      gitRepo([[g, '또 밀림'], ['e4f5a6b', ''], ['a1b2c3d', '']], { fresh: E(u, 0.2, 0.8) }); lanes({ gate: 0 }); appCard('OutOfSync', 'Healthy'); cluster(lv, 5);
      const f = E(u, 0.8, 2.4); el('rect', { x: 260, y: 300, width: 440, height: 22, rx: 11, fill: SOFT }); el('rect', { x: 260, y: 300, width: 440 * f, height: 22, rx: 11, fill: WARN, opacity: 0.85 });
      tx(480, 350, 'OutOfSync로 둔 시간만큼 다음 sync가 커진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      return; }
    if (k === 1) {   // 습관적 sync
      gitRepo([[g, ''], ['e4f5a6b', '']]); lanes({ gate: 1 }); appCard('Syncing', 'Healthy');
      dot(PATH2, seg(u, 0.8, 1.6), BAD, 8); cluster(u > 1.6 ? g : 'e4f5a6b', 5, { liveCol: u > 1.6 ? BAD : INFO, hot: u > 1.6 });
      card(480, 330, 220, 54, { rx: 10, stroke: GRID, dash: '6 5', text: 'app diff (건너뜀)', fs: 15, color: MUT, s: pop(u, 0.1) }); cross(395, 330, 12, pop(u, 0.5));
      [['Prune으로 삭제', 790], ['잘못된 이미지', 170]].forEach(([s, x], i) => pill(x, 330, s, BAD, pop(u, 1.8 + i * 0.3), { fs: 14 }));
      return; }
    if (k === 2) {   // 대량 변경 한 번에
      gitRepo([[g, '10개 서비스'], ['f7a1c2d', '']], { fresh: E(u, 0.1, 0.6) }); appCard('OutOfSync', 'Healthy');
      for (let i = 0; i < 10; i++) { const x = 300 + (i % 5) * 90, y = 290 + Math.floor(i / 5) * 56; card(x, y, 76, 42, { rx: 8, stroke: INK, sw: 1.8, text: `svc ${i + 1}`, fs: 14, s: pop(u, 0.6 + i * 0.08) }); }
      el('rect', { x: 246, y: 256, width: 468, height: 124, rx: 16, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: fade(u, 1.7) });
      tx(830, 300, '한 커밋 = 한 번에', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      tx(830, 324, '원인 격리·롤백 어려움', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.1) });
      return; }
    if (k === 3) {   // 수동 drift
      gitRepo([[g, ''], ['f7a1c2d', '']]); lanes({ gate: 0 }); appCard(u > 1.6 ? 'OutOfSync' : 'Synced', 'Healthy', { bump: R.bump(u, 1.6) });
      cluster(u > 1.4 ? b.liveRev : g, 5, { liveCol: u > 1.4 ? WARN : INFO });
      person(820, 340, '누군가', { s: pop(u, 0.1) }); fly(800, 300, 820, 100, seg(u, 0.4, 1.4), 'kubectl edit', { fill: WARN, mono: true });
      tx(480, 340, 'OutOfSync가 drift를 알리는 신호가 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      return; }
    // k4: 체크리스트 + rollback 경로
    ['OutOfSync는 즉시 검토 큐로', 'sync 전 반드시 diff', '대량 변경은 나눠서 부분 sync', '배포 후 app wait로 health 확인', '문제면 app rollback'].forEach((s, i) => {
      const y = 70 + i * 52, at = 0.2 + i * 0.35; card(300, y, 440, 42, { rx: 21, stroke: GOOD, sw: 2, s: pop(u, at) }); check(110, y, 9, pop(u, at + 0.1));
      tx(132, y + 6, s, { 'font-size': 16, 'font-weight': 600, opacity: fade(u, at + 0.1) }); });
    card(760, 110, 200, 44, { rx: 8, stroke: GRID, text: 'c0ffee1', fs: 15, mono: true, s: pop(u, 1.6) });
    card(760, 250, 200, 44, { rx: 8, stroke: GOOD, sw: 2.4, text: lv, fs: 15, mono: true, s: pop(u, 1.8) });
    grow(760, 134, 760, 224, E(u, 2.0, 2.5), ACC); badge(760, 310, 'Synced', pop(u, 2.4)); }

  const quiz = [
    { q: 'manual sync를 쓰려면 Application에 무엇을 해야 하는가?',
      o: ['syncPolicy.manual: true를 넣는다', 'syncPolicy.automated 블록을 두지 않는다', 'argocd-cm에 manual 모드를 켠다'], a: 1,
      why: 'manual은 따로 켜는 설정이 아니다. automated 블록이 없으면 그게 기본값이고, push는 OutOfSync 표시로만 끝난다.' },
    { q: 'app get에서 Sync Status가 OutOfSync, Health Status가 Healthy라면 지금 상황은 무엇인가?',
      o: ['새 버전이 배포되다 실패했다', '클러스터의 Pod가 죽어 있다', 'Git은 e4f5a6b로 바뀌었고 클러스터의 구버전은 정상으로 돌고 있다'], a: 2,
      why: 'Sync는 Git과 같은지, Health는 잘 도는지를 묻는 별개의 질문이다. live는 a1b2c3d의 replicas 3으로 멀쩡하다.' },
    { q: 'diff -u 형식의 app diff에서 "- replicas: 3" 과 "+ replicas: 5" 는 무엇을 뜻하는가?',
      o: ['live가 3이고 Git 목표가 5다', 'Git이 3이고 live가 5다', '3개를 지우고 5개를 새로 만든다'], a: 0,
      why: '- 는 지금 클러스터의 값, + 는 Git이 원하는 값이다. sync 하면 3이 5로 바뀐다.' },
    { q: 'argocd app sync web-prd --resource apps:Deployment:web은 무엇을 하는가?',
      o: ['web Deployment를 지운다', '앱 전체를 적용하고 Deployment만 기다린다', 'web Deployment만 골라 적용한다'], a: 2,
      why: '부분 sync다. 대량 변경을 리소스 단위로 나눠 밀어 사고 범위를 줄인다.' },
    { q: '누군가 kubectl edit로 클러스터를 직접 고쳤다. manual sync 앱에서 이것은 어떻게 드러나는가?',
      o: ['Argo CD가 곧바로 Git 값으로 되돌린다', '앱이 OutOfSync가 되어 drift를 알린다', '아무 표시도 나지 않는다'], a: 1,
      why: 'manual에서는 되돌리지 않고 OutOfSync로 표시만 한다. 반복된다면 selfHeal이 있는 auto sync를 검토한다.' },
  ];

  const summary = [
    'automated를 켜면 push 하자마자 프로덕션에 나가서 검토할 틈이 없다.',
    'manual에서는 Git이 바뀌어도 OutOfSync로 표시만 하고 클러스터는 그대로 둔다.',
    '승인 전에 app diff로 바뀌는 값을 본다. 이 예시에서는 이미지 v2.3.1과 replicas 5였다.',
    'OutOfSync를 오래 두면 쌓인 변경이 다음 sync 때 한꺼번에 나간다.',
  ];
  const review = [
    { q: 'Git에 커밋하고 10분이 지났는데 클러스터 Pod 수가 그대로다. app get은 OutOfSync, Healthy다. 가장 먼저 할 일은?',
      o: ['Argo CD를 재시작한다', 'app diff로 바뀔 값을 보고 sync를 승인한다', 'Pod를 지워 다시 뜨게 한다'], a: 1,
      why: 'manual 앱은 사람이 승인해야 반영된다. OutOfSync는 고장이 아니라 배포 대기 신호다.' },
    { q: '배포 담당자가 diff를 보지 않고 매번 SYNC를 눌러 왔다. 가장 걱정할 사고는?',
      o: ['Git에서 지운 리소스가 prune으로 사라지는 것', '폴링 주기가 길어지는 것', 'Health가 Progressing으로 바뀌는 것'], a: 0,
      why: '삭제(-) 줄을 놓치면 sync 때 그 리소스가 지워질 수 있다. diff를 PR 리뷰처럼 필수 절차로 둔다.' },
    { q: '10개 서비스를 한 커밋으로 바꿨고 한 서비스가 장애를 냈다. 다음 배포에서 바꿀 점은?',
      o: ['sync 버튼을 더 빨리 누른다', 'dry-run을 끈다', '리소스나 앱 단위로 나눠 부분 sync 한다'], a: 2,
      why: '한 번에 밀면 원인 격리도 롤백도 어렵다. --resource로 나눠 밀면 영향 범위가 작아진다.' },
  ];

  R.page({ title: '수동 동기화 흐름 · web-prd', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
