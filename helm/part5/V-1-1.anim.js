/* V-1-1 CI/CD 파이프라인 — Helm 배포 자동화. 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 지역 도우미 ----------
  // 파일 카드: 제목 띠 + 고정폭 줄. lines: 문자열 또는 [문자열, {col, hi, op, b, strike, ind}]
  function fileCard(x, y, w, name, lines, o) {
    o = o || {}; const lh = o.lh || 23, op = o.op ?? 1, h = o.h || lines.length * lh + 46;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, opacity: op });
    el('path', { d: `M${x},${y + 30} V${y + 10} Q${x},${y} ${x + 10},${y} H${x + w - 10} Q${x + w},${y} ${x + w},${y + 10} V${y + 30} Z`, fill: SOFT, opacity: op });
    mono(x + 14, y + 20, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: op });
    lines.forEach((ln, i) => { if (ln == null) return; const [s, a0] = Array.isArray(ln) ? ln : [ln, null], a = a0 || {}, yy = y + 38 + i * lh, lop = op * (a.op ?? 1);
      if (lop <= 0.001) return;
      if (a.hi) el('rect', { x: x + 6, y: yy, width: w - 12, height: lh - 2, rx: 5, fill: a.hi === true ? ACCBG : a.hi, opacity: lop });
      mono(x + 14 + (a.ind || 0), yy + lh / 2 + 5, s, { 'font-size': o.fs || 14, fill: a.col || INK, 'font-weight': a.b ? 700 : 400, opacity: lop, 'text-decoration': a.strike ? 'line-through' : null }); });
    return { h, row: (i) => y + 38 + i * lh + lh / 2 }; }
  const T = (x, y, s, a) => tx(x, y, s, Object.assign({ 'font-size': 14 }, a || {}));
  const M = (x, y, s, a) => mono(x, y, s, Object.assign({ 'font-size': 14 }, a || {}));

  // 아래 파이프라인 띠: beat 의 pipe[6] (0 대기 · 1 검증중 · 2 통과 · 3 배포중)
  const STG = ['git push', 'helm lint', 'helm template', 'helm --dry-run', 'helm upgrade', 'verify'];
  const SW = 136, SG = 16, SX = (960 - (6 * SW + 5 * SG)) / 2, SY = 366;
  const scx = (i) => SX + i * (SW + SG) + SW / 2;
  const STW = ['대기', '검증중', '통과', '배포중'];
  function strip(c, o) { o = o || {}; const b = c.beat, p = c.prev;
    STG.forEach((s, i) => { const st = b.pipe[i], was = p ? p.pipe[i] : 0, cx = scx(i), on = o.lit && o.lit(i);
      const col = st === 2 ? GOOD : st === 1 ? ACC : st === 3 ? WARN : on ? ACC : GRID;
      if (i < 5) el('line', { x1: cx + SW / 2 + 2, y1: SY, x2: cx + SW / 2 + SG - 2, y2: SY, stroke: GRID, 'stroke-width': 2.5 });
      card(cx, SY, SW, 36, { rx: 18, stroke: col, sw: i === b.active || on ? 2.8 : 1.8, fill: st === 2 ? C.GOODBG : st === 1 || on ? ACCBG : st === 3 ? C.WARNBG : PANEL,
        text: s, fs: 13.5, mono: true, color: st === 0 && !on ? MUT : INK, s: st !== was ? 1 + bump(c.u, 0.2) : 1 });
      sub(cx, SY + 36, STW[st], st !== was ? fade(c.u, 0.4) : 1, { fill: st === 0 ? OFF : col, 'font-weight': 700 }); }); }

  // ---------- 1. 파이프라인 개요 ----------
  function s1(t, c) { const { k, u } = c;
    // 왼쪽 위: git 그래프 (main)
    tx(44, 40, 'git', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    el('line', { x1: 60, y1: 80, x2: k >= 1 ? 340 : 270, y2: 80, stroke: INK, 'stroke-width': 3 });
    [90, 160, 230].forEach((x) => el('circle', { cx: x, cy: 80, r: 9, fill: PANEL, stroke: INK, 'stroke-width': 3 }));
    mono(60, 62, 'main', { 'font-size': 14, 'font-weight': 700, fill: INK });
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1; el('circle', { cx: 310, cy: 80, r: 10 * s, fill: ACC });
      mono(330, 62, 'push', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 1 ? fade(u, 0.4) : 1 }); }
    if (k >= 2) { const g = k === 2 ? E(u, 0.2, 1.0) : 1;
      el('path', { d: 'M160,80 C190,80 190,140 230,140 H' + lerp(230, 420, g), fill: 'none', stroke: INFO, 'stroke-width': 3 });
      [300, 380].forEach((x, i) => { if (g > (i + 1) / 2.4) el('circle', { cx: x, cy: 140, r: 8, fill: PANEL, stroke: INFO, 'stroke-width': 3 }); });
      mono(240, 166, 'feature → PR', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 2 ? fade(u, 0.8) : 1 }); }
    // 오른쪽: deploy.yml 이 한 줄씩 자란다
    const L = [['name: deploy', 0], ['on:', 1], ['  push: { branches: [main] }', 1], ['  pull_request: { branches: [main] }', 2], ['env:', 3],
      ['  CHART_DIR  RELEASE  NAMESPACE', 3], ['jobs:', 4], ['  validate:', 4], ['    runs-on: ubuntu-latest', 4], ['    setup-helm  v3.15.0', 4]];
    fileCard(560, 22, 380, '.github/workflows/deploy.yml', L.map(([s, kk], i) => kk > k ? null : [s, { hi: kk === k, op: kk === k ? fade(u, 0.15 + (i % 3) * 0.2) : 1, b: kk === k }]), { h: 278 });
    // 흐르는 점: main push 는 끝까지, PR 은 dry-run 에서 멈춘다
    if (k === 1) { const g = seg(u, 0.6, 2.4); dot([[scx(0), SY - 30], [scx(5), SY - 30]], g, ACC, 8);
      T(44, 200, 'main에 병합되면', { 'font-weight': 700, opacity: fade(u, 0.4) }); T(44, 224, '검증부터 배포까지 전부 돈다', { fill: MUT, opacity: fade(u, 0.6) }); }
    if (k === 2) { const g = seg(u, 0.9, 2.3); dot([[scx(0), SY - 30], [scx(3), SY - 30]], g, INFO, 8);
      if (u > 2.3) cross(scx(4), SY - 32, 11, pop(u, 2.3));
      T(44, 200, 'PR은 검증과 dry-run까지만', { 'font-weight': 700, opacity: fade(u, 0.5) }); T(44, 224, 'helm upgrade는 돌지 않는다', { fill: MUT, opacity: fade(u, 0.7) }); }
    if (k === 3) { [['CHART_DIR', './charts/my-app'], ['RELEASE', 'my-app'], ['NAMESPACE', 'production']].forEach(([n, v], i) => {
        const y = 206 + i * 40, s = pop(u, 0.2 + i * 0.25); card(150, y, 210, 32, { rx: 8, stroke: ACC, fill: ACCBG, text: n, fs: 14, mono: true, color: ACC, s }); M(268, y + 5, v, { opacity: fade(u, 0.4 + i * 0.25) }); });
      ['$CHART_DIR', '$RELEASE', '$NAMESPACE', '$RELEASE'].forEach((v, j) => fly(150, 318, scx(j + 1), SY - 38, seg(u, 1.0 + j * 0.35, 1.9 + j * 0.35), v, { mono: true, stay: true })); }
    if (k === 4) { zone(40, 180, 470, 150, 'runs-on: ubuntu-latest', { stroke: GRID, fill: SOFT });
      [['actions/checkout@v4', '소스 받기'], ['azure/setup-helm@v4', 'helm v3.15.0 고정']].forEach(([a, b], i) => { const s = pop(u, 0.3 + i * 0.4);
        card(170, 230 + i * 44, 220, 34, { rx: 8, text: a, fs: 13.5, mono: true, stroke: GOOD, s }); T(296, 235 + i * 44, b, { fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); });
      el('rect', { x: 60, y: 296, width: 430, height: 26, rx: 8, fill: 'none', stroke: OFF, 'stroke-dasharray': '5 5', opacity: fade(u, 1.4) });
      T(275, 314, '검증 스텝은 다음 장면에서 채운다', { 'text-anchor': 'middle', fill: MUT, 'font-size': 13.5, opacity: fade(u, 1.5) }); }
    strip(c, { lit: (i) => (k === 1 && i <= Math.floor(seg(u, 0.6, 2.4) * 5.99)) || (k === 2 && i <= Math.min(3, Math.floor(seg(u, 0.9, 2.3) * 3.99))) }); }

  // ---------- 2. lint → template ----------
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: 러너에 받은 차트 폴더
    const rows = ['Chart.yaml', 'values.yaml', 'values-prod.yaml', 'templates/', '  deployment.yaml', 'charts/', k >= 1 ? '  subchart.tgz' : ''];
    const ok = (i) => k >= 2 && i < 6 && (k > 2 || u > 0.4 + i * 0.28);
    const fx = 30, shown = (i) => k > 0 || u > 0.25 + i * 0.14;
    fileCard(fx, 22, 270, './charts/my-app', rows.map((s, i) => !shown(i) ? null : [s, { col: i === 6 ? ACC : INK, b: i === 6, op: i === 6 && k === 1 ? fade(u, 1.4) : 1, hi: i === 6 && k === 1 ? true : null }]), { h: 214 });
    rows.forEach((s, i) => { if (ok(i) && s) check(fx + 246, 22 + 38 + i * 23 + 11, 7, k === 2 ? pop(u, 0.4 + i * 0.28) : 1); });
    if (k === 2) { const y = lerp(60, 200, E(u, 0.3, 2.1)); el('rect', { x: fx + 4, y, width: 262, height: 4, rx: 2, fill: ACC, opacity: u < 2.2 ? 0.8 : 0 }); }
    pill(165, 262, 'helm v3.15.0', GOOD, k === 0 ? pop(u, 1.0) : 1, { mono: true, fs: 14 });
    if (k === 0) { sub(165, 300, 'checkout으로 소스를 받고 setup-helm으로 설치', fade(u, 1.3)); }
    if (k === 1) { fly(420, 40, fx + 150, 22 + 38 + 6 * 23 + 11, seg(u, 0.4, 1.4), 'subchart.tgz', { mono: true });
      terminal(350, 60, 580, 110, ['$ helm dependency build $CHART_DIR'], fade(u, 0.2) * 1, { title: 'validate' });
      card(640, 230, 520, 54, { rx: 10, stroke: WARN, fill: C.WARNBG, text: '이 스텝을 빼면 charts/가 비어\nlint가 의존성 없음으로 멈춘다', fs: 14, s: pop(u, 1.6) }); }
    if (k === 2) { terminal(350, 30, 580, 150, ['$ helm lint $CHART_DIR --values …/values-prod.yaml', '==> Linting ./charts/my-app', ['1 chart(s) linted, 0 chart(s) failed', '#4ade80']], lerp(0, 3, E(u, 0.2, 1.8)), { title: 'helm lint · 예시 출력' });
      T(360, 222, 'Chart.yaml·values 구조를 보고 템플릿도 한 번 렌더해 본다', { opacity: fade(u, 1.6) });
      T(360, 248, '실패하면 exit code가 0이 아니라 잡이 멈춘다', { fill: MUT, opacity: fade(u, 1.9) }); }
    if (k === 3) { // 렌더: 자리표시자에 값이 들어간다
      M(350, 56, 'templates/deployment.yaml', { fill: MUT, 'font-size': 13.5, 'font-weight': 700 });
      const done = u > 1.5;
      spansLine(350, 86, done ? [['replicas: ', INK], ['4', ACC]] : [['replicas: ', INK], ['{{ .Values.replicaCount }}', INFO]]);
      fly(820, 140, 470, 80, seg(u, 0.6, 1.5), 'replicaCount: 4', { mono: true });
      M(700, 146, 'values-prod.yaml', { fill: MUT, 'font-size': 13.5, opacity: fade(u, 0.3) });
      el('line', { x1: 350, y1: 176, x2: 930, y2: 176, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.6) });
      M(350, 206, '{{ required "image.tag 필요" .Values.image.tag }}', { opacity: fade(u, 1.7) });
      card(470, 246, 230, 34, { rx: 8, stroke: WARN, fill: C.WARNBG, text: 'lint: [INFO] 경고만', fs: 14, s: pop(u, 2.0) });
      card(760, 246, 260, 34, { rx: 8, stroke: BAD, fill: C.BADBG, text: 'template: Error로 멈춤', fs: 14, color: BAD, s: pop(u, 2.3) });
      sub(640, 296, '값이 비었을 때 (helm v3.15 소스 기준)', fade(u, 2.3)); }
    if (k === 4) { fileCard(560, 30, 300, 'rendered.yaml', [['kind: Deployment', { b: true }], '  replicas: 4', ['---', { col: MUT }], ['kind: Service', { b: true }], ['  …', { col: MUT }]], { op: fade(u, 0.3) });
      grow(400, 120, 550, 120, E(u, 0.2, 0.9), ACC); M(380, 104, '>', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      fly(710, 180, 710, 270, seg(u, 1.2, 2.0), 'cat → 로그', { fill: INK, stay: true });
      T(360, 300, '파일로 남기면 다음 스텝이 다시 읽는다', { fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 5) { el('rect', { x: 640, y: 36, width: 14, height: 250, rx: 7, fill: INFO, opacity: 0.85 });
      T(647, 22, 'k8s 스키마', { 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 });
      [['kind: Deployment', 80], ['kind: Service', 150], ['kind: Ingress', 220]].forEach(([s, y], i) => { const g = E(u, 0.3 + i * 0.4, 1.2 + i * 0.4);
        card(lerp(450, 800, g), y, 190, 36, { rx: 8, text: s, fs: 14, mono: true, stroke: g >= 1 ? GOOD : INK });
        if (g >= 1) check(910, y, 9, pop(u, 1.2 + i * 0.4)); });
      M(360, 46, 'kubeconform -strict -summary', { fill: MUT, 'font-size': 13.5, 'font-weight': 700 });
      T(360, 300, '하나라도 틀리면 exit ≠ 0 → 배포로 안 간다', { fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0), 'font-size': 14 }); }
    strip(c); }
  function spansLine(x, y, parts) { R.spans(x, y, parts.map(([s, col]) => [s, { fill: col, 'font-weight': 700 }]), { 'font-size': 17 }); }

  // ---------- 3. PR 미리보기 ----------
  function s3(t, c) { const { k, u } = c;
    const L = [['replicaCount: 4', 0], ['image:', 1], ['  repository: ghcr.io/my-org/my-app', 1], ['  # tag는 파이프라인이 주입', 1], ['resources:', 2], ['  requests: 250m / 512Mi', 2], ['  limits:   "1" / 1Gi', 2], ['ingress:', 3], ['  host: app.example.com', 3]];
    fileCard(24, 22, 400, 'values-prod.yaml', L.map(([s, kk]) => kk > Math.min(k, 3) ? null : [s, { hi: kk === k, b: kk === k, col: s.includes('#') ? MUT : INK }]), { h: 260, lh: 23 });
    const X = 470;
    if (k === 0) { T(X, 60, '같은 차트에 환경별 값 파일만 따로', { 'font-weight': 700 });
      for (let i = 0; i < 4; i++) { const s = pop(u, 0.4 + i * 0.25); card(X + 50 + i * 100, 150, 76, 76, { rx: 12, stroke: ACC, fill: ACCBG, s }); mono(X + 50 + i * 100, 156, 'Pod', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: s }); }
      M(X, 236, 'replicaCount: 4 → Pod 4개', { fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 1 || k === 5) { const filled = k === 5 && u > 1.3;
      M(X, 70, 'image:', { 'font-size': 16, 'font-weight': 700 });
      R.spans(X, 110, [['ghcr.io/my-org/my-app', { fill: INK }], [':', { fill: MUT }]], { 'font-size': 16 });
      const tx0 = X + tw('ghcr.io/my-org/my-app:', 16) + 6;
      el('rect', { x: tx0, y: 88, width: 150, height: 32, rx: 6, fill: filled ? ACCBG : 'none', stroke: filled ? ACC : OFF, 'stroke-width': 2, 'stroke-dasharray': filled ? null : '5 5' });
      mono(tx0 + 75, 110, filled ? '3f9c2a1…' : 'tag ?', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: filled ? ACC : OFF });
      if (k === 1) { pill(X + 90, 180, 'tag: latest', BAD, pop(u, 0.8), { mono: true }); cross(X + 175, 180, 12, pop(u, 1.2));
        T(X + 200, 186, '어떤 커밋이 떠 있는지 모른다', { fill: BAD, opacity: fade(u, 1.4) });
        T(X, 250, '값 파일에는 비워 두고 파이프라인이 채운다', { fill: MUT, opacity: fade(u, 1.8) }); }
      if (k === 5) { fly(X + 40, 260, tx0 + 75, 104, seg(u, 0.3, 1.3), '${{ github.sha }}', { mono: true });
        T(X, 180, '--set image.tag=${{ github.sha }}', { class: 'mono', 'font-weight': 700, opacity: fade(u, 0.2) });
        sub(tx0 + 75, 142, '커밋 해시 (예시)', fade(u, 1.8));
        T(X, 300, '--dry-run --debug로 렌더 결과만 로그에 찍는다', { fill: MUT, opacity: fade(u, 2.0) }); } }
    if (k === 2) { const rows = [['CPU', 250, 1000, '250m', '1 (=1000m)'], ['메모리', 512, 1024, '512Mi', '1Gi']];
      rows.forEach(([n, rq, lm, a, b], i) => { const y = 80 + i * 110, W = 330, g = E(u, 0.3 + i * 0.4, 1.3 + i * 0.4);
        T(X, y, n, { 'font-weight': 700, 'font-size': 15 });
        el('rect', { x: X + 70, y: y + 14, width: W * g, height: 22, rx: 4, fill: SOFT, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
        el('rect', { x: X + 70, y: y + 14, width: W * (rq / lm) * g, height: 22, rx: 4, fill: ACC });
        M(X + 70, y + 58, 'requests ' + a, { fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0 + i * 0.4) });
        M(X + 70 + W, y + 58, 'limits ' + b, { fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.2 + i * 0.4) }); });
      T(X, 310, '스테이징 값 파일에서는 더 작게 둔다', { fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 3) { R.browser(X + 220, 140, 360, 160, null, { s: pop(u, 0.2) });
      mono(X + 220, 104, 'https://app.example.com', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.7) });
      T(X + 220, 160, 'ingress.enabled: true', { 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 1.0) });
      T(X + 220, 260, '스테이징은 다른 host를 쓴다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 4) { const steps = [['helm upgrade --install', ACC], ['렌더 + 검증', INFO], ['미리보기 출력', GOOD]];
      steps.forEach(([s, col], i) => { const y = 64 + i * 64, sc = pop(u, 0.3 + i * 0.45); card(X + 120, y, 230, 42, { rx: 10, stroke: col, text: s, fs: 14, s: sc });
        if (i) grow(X + 120, y - 42, X + 120, y - 23, E(u, 0.1 + i * 0.45, 0.4 + i * 0.45), MUT); });
      R.server(X + 370, 120, '클러스터', { s: 0.8, lamp: OFF });
      lock(X + 370, 70, true, MUT, pop(u, 1.4)); T(X + 370, 228, '아무것도 적용 안 함', { 'text-anchor': 'middle', fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6) });
      T(X, 290, '--values values-prod.yaml --dry-run', { class: 'mono', 'font-weight': 700, opacity: fade(u, 1.9) }); }
    strip(c); }

  // ---------- 4. upgrade --install --atomic ----------
  function revChip(x, y, n, st, s) { const col = st === 'deployed' ? GOOD : st === 'failed' ? BAD : st === 'pending' ? WARN : MUT;
    card(x, y, 120, 58, { rx: 10, stroke: col, sw: 2.2, fill: st === 'deployed' ? C.GOODBG : st === 'failed' ? C.BADBG : PANEL, s });
    mono(x, y - 4, 'rev ' + n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: s });
    mono(x, y + 18, st, { 'text-anchor': 'middle', 'font-size': 13.5, fill: col, opacity: s }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [['validate', 140, GOOD], ['deploy', 480, ACC]].forEach(([n, x, col], i) => card(x, 120, 180, 60, { rx: 12, stroke: col, sw: 2.5, text: 'jobs.' + n, fs: 16, mono: true, s: pop(u, 0.2 + i * 0.6) }));
      grow(232, 120, 388, 120, E(u, 0.5, 1.1), ACC); M(250, 106, 'needs', { fill: MUT, opacity: fade(u, 0.8) });
      check(140, 72, 10, pop(u, 0.4));
      card(480, 212, 300, 40, { rx: 20, stroke: INFO, text: "if: github.ref == 'refs/heads/main'", fs: 13.5, mono: true, s: pop(u, 1.2) });
      card(800, 120, 200, 60, { rx: 12, stroke: WARN, dash: '6 4', text: 'environment:\nproduction', fs: 14, mono: true, s: pop(u, 1.6) });
      T(800, 176, '승인 게이트', { 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) });
      T(480, 290, 'PR에서는 이 잡이 돌지 않는다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 1) { lock(150, 130, true, WARN, pop(u, 0.2)); M(150, 180, 'secrets.KUBECONFIG', { 'text-anchor': 'middle', 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      card(460, 130, 200, 70, { rx: 12, stroke: INK, text: 'ubuntu 러너', fs: 15, s: pop(u, 0.5) });
      grow(200, 130, 356, 130, E(u, 0.7, 1.3), WARN);
      R.server(790, 130, 'production 클러스터', { lamp: u > 2 ? GOOD : OFF, s: pop(u, 1.2) });
      grow(564, 130, 726, 130, E(u, 1.5, 2.1), ACC);
      T(460, 260, 'k8s-set-context가 러너의 접속 정보를 잡는다', { 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      T(460, 288, '여기부터 실제 클러스터를 건드린다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 2) { card(200, 140, 250, 60, { rx: 30, stroke: ACC, sw: 2.5, text: '릴리스 my-app 이\n이미 있나?', fs: 15, s: pop(u, 0.2) });
      grow(326, 120, 520, 80, E(u, 0.6, 1.2), MUT); grow(326, 160, 520, 220, E(u, 0.9, 1.5), MUT);
      M(420, 86, '없다', { fill: MUT, 'font-weight': 700, opacity: fade(u, 0.9) }); M(420, 216, '있다', { fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
      card(640, 80, 230, 46, { rx: 10, stroke: GOOD, text: 'install → rev 1', fs: 15, mono: true, s: pop(u, 1.2) });
      card(640, 220, 230, 46, { rx: 10, stroke: ACC, text: 'upgrade → rev n+1', fs: 15, mono: true, s: pop(u, 1.5) });
      T(480, 300, '--create-namespace: 네임스페이스가 없으면 만든다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
    if (k >= 3) { // 리비전 줄: 위쪽에 계속 남는다
      const y = 70; T(40, 36, 'helm history my-app', { class: 'mono', fill: MUT, 'font-weight': 700 });
      revChip(110, y, 1, k === 3 && u < 1.0 ? 'deployed' : 'superseded', 1);
      grow(172, y, 228, y, 1, GRID, { plain: true });
      const failAt = k === 3 ? 1.3 : -1, failed = k > 3 || u > failAt;
      revChip(290, y, 2, failed ? 'failed' : 'pending', k === 3 ? pop(u, 0.3) : 1);
      if (k === 3) M(290, y - 40, 'image.tag = sha', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
      if (k > 3 || u > 1.6) { el('path', { d: `M290,${y + 30} C290,${y + 90} 470,${y + 90} 470,${y + 34}`, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: k === 3 ? fade(u, 1.6) : 1, 'marker-end': 'url(#ra-ahr)' });
        revChip(470, y, 3, 'deployed', k === 3 ? pop(u, 2.0) : 1); M(470, y - 40, '= rev 1 내용', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: k === 3 ? fade(u, 2.2) : 1 }); }
      if (k === 3) { T(620, 64, '--atomic', { class: 'mono', 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
        T(620, 92, '실패하면 직전 성공본으로 되돌리고', { opacity: fade(u, 1.8) }); T(620, 116, '그 롤백도 새 리비전으로 남는다', { opacity: fade(u, 2.1) });
        T(40, 230, '--atomic이 없으면 rev 2가 반쯤 뜬 채 남는다', { fill: MUT, opacity: fade(u, 2.3) }); }
      if (k === 4) { T(40, 190, '--wait: 모든 Pod가 Ready 될 때까지 기다린다', { 'font-weight': 700, opacity: fade(u, 0.2) });
        for (let i = 0; i < 4; i++) { const ready = u > 0.6 + i * 0.45; card(90 + i * 96, 262, 76, 60, { rx: 10, stroke: ready ? GOOD : WARN, fill: ready ? C.GOODBG : C.WARNBG, text: ready ? 'Ready' : '…', fs: 14, color: ready ? GOOD : WARN }); }
        clock(560, 262, 40, E(u, 0.2, 2.6) * 0.55, WARN, '--timeout 5m0s');
        T(640, 240, '5분 안에 Ready가 안 되면', { opacity: fade(u, 1.2) }); T(640, 266, '실패로 판정하고 롤백한다', { fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); }
      if (k === 5) { card(250, 250, 360, 76, { rx: 12, stroke: GOOD, sw: 2.5, s: pop(u, 0.2) });
        T(90, 238, '성공', { 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
        M(150, 238, 'helm status', { opacity: fade(u, 0.5) }); M(150, 266, 'kubectl rollout status', { opacity: fade(u, 0.7) }); check(400, 252, 11, pop(u, 0.9));
        card(700, 250, 360, 76, { rx: 12, stroke: OFF, sw: 2, dash: '6 5', s: pop(u, 1.2) });
        T(540, 244, '롤백됨', { 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) }); T(620, 244, 'verify 스텝은 실행 안 됨', { fill: MUT, opacity: fade(u, 1.5) });
        T(540, 270, '잡은 실패로 끝나 알림이 간다', { fill: MUT, opacity: fade(u, 1.8) }); } }
    strip(c); }

  // ---------- 5. 차트 게시 & GitOps ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['validate', GOOD], ['deploy', GOOD], ['publish-chart', ACC]].forEach(([n, col], i) => {
        card(150 + i * 300, 100, 210, 54, { rx: 12, stroke: col, sw: 2.5, text: n, fs: 16, mono: true, s: pop(u, 0.2 + i * 0.4) });
        if (i) grow(150 + (i - 1) * 300 + 106, 100, 150 + i * 300 - 108, 100, E(u, 0.4 + i * 0.4, 0.8 + i * 0.4), ACC); });
      M(330, 86, 'needs', { 'text-anchor': 'middle', fill: MUT, 'font-size': 13.5, opacity: fade(u, 0.8) }); M(630, 86, 'needs', { 'text-anchor': 'middle', fill: MUT, 'font-size': 13.5, opacity: fade(u, 1.2) });
      el('line', { x1: 120, y1: 240, x2: lerp(120, 840, E(u, 1.2, 2.2)), y2: 240, stroke: INK, 'stroke-width': 3 });
      for (let i = 0; i < 10; i++) if (E(u, 1.2, 2.2) * 10 > i) el('circle', { cx: 120 + i * 80, cy: 240, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
      T(480, 290, 'fetch-depth: 0 · 태그 계산에 쓰려고 전체 히스토리를 받는다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 1) { T(60, 50, 'gh-pages 브랜치', { 'font-weight': 800, fill: MUT });
      fileCard(60, 70, 330, 'index.yaml', ['apiVersion: v1', 'entries:', '  my-app:', ['    - version: 0.3.0', { hi: true, b: true, op: fade(u, 1.0) }], ['      urls: [my-app-0.3.0.tgz]', { op: fade(u, 1.2) }]], { op: fade(u, 0.2) });
      M(470, 110, 'helm/chart-releaser-action@v1.6.0', { 'font-weight': 700, opacity: fade(u, 0.4) });
      T(470, 140, 'index.yaml을 갱신해 차트 저장소를 만든다', { fill: MUT, opacity: fade(u, 0.7) });
      terminal(470, 180, 450, 100, ['$ helm repo add my-org https://<org>.github.io/<repo>', '$ helm install my-app my-org/my-app'], lerp(0, 2, E(u, 1.4, 2.4)), { title: '쓰는 쪽' }); }
    if (k === 2 || k === 3) { // 레지스트리 선반
      zone(560, 40, 370, 260, 'oci://ghcr.io/my-org/charts', { stroke: INFO, fill: C.INFOBG, color: INFO });
      lock(745, 110, k === 3 || u > 1.2, INFO, 1.3);
      if (k === 2) { fly(140, 110, 690, 110, seg(u, 0.2, 1.1), 'github.actor', { mono: true, fill: INK });
        fly(140, 170, 690, 140, seg(u, 0.5, 1.3), 'GITHUB_TOKEN', { mono: true, fill: WARN });
        M(60, 240, 'helm registry login ghcr.io', { 'font-weight': 700, opacity: fade(u, 1.4) });
        T(60, 270, '차트를 컨테이너 이미지처럼 레지스트리에 둔다', { fill: MUT, opacity: fade(u, 1.7) }); }
      if (k === 3) { [['Chart.yaml', 60], ['values.yaml', 100], ['templates/', 140]].forEach(([s, y], i) => card(lerp(120, 250, E(u, 0.2, 0.9)), lerp(y, 120, E(u, 0.2, 0.9)), 150, 30, { rx: 6, text: s, fs: 13.5, mono: true, op: 1 - E(u, 0.8, 1.0) }));
        const pk = pop(u, 0.9); card(250, 120, 210, 64, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pk, op: 1 - seg(u, 1.3, 1.45), text: 'my-app-0.3.0.tgz', fs: 15, mono: true, color: ACC });
        M(250, 190, 'helm package --version 0.3.0', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
        fly(250, 120, 745, 220, seg(u, 1.4, 2.4), 'my-app-0.3.0.tgz', { mono: true, stay: true });
        M(745, 260, 'my-app:0.3.0', { 'text-anchor': 'middle', 'font-weight': 700, fill: INFO, opacity: fade(u, 2.4) });
        T(60, 270, '차트 버전을 올려야 어느 릴리스가 어떤 차트인지 남는다', { fill: MUT, opacity: fade(u, 2.0) }); } }
    if (k === 4) { // push 형 vs pull 형
      [['push 형 (지금까지)', 40, BAD], ['pull 형 (GitOps)', 500, GOOD]].forEach(([n, x], i) => { zone(x, 26, 420, 290, n, { stroke: GRID, fill: SOFT, op: fade(u, 0.1 + i * 0.6) }); });
      card(130, 120, 120, 50, { rx: 10, text: 'CI', fs: 16, mono: true, s: pop(u, 0.2) }); R.server(360, 120, '클러스터', { s: 0.75 });
      grow(192, 120, 298, 120, E(u, 0.4, 1.0), BAD); M(245, 104, 'upgrade', { 'text-anchor': 'middle', 'font-size': 13.5, fill: BAD, opacity: fade(u, 0.6) });
      T(250, 250, 'CI가 클러스터 접속 정보를 가진다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      card(590, 120, 130, 50, { rx: 10, text: 'Git\nvalues', fs: 14, mono: true, s: pop(u, 1.0) });
      card(820, 120, 130, 50, { rx: 10, stroke: GOOD, text: 'ArgoCD', fs: 15, s: pop(u, 1.2), color: GOOD });
      grow(752, 120, 658, 120, E(u, 1.4, 1.9), GOOD); M(705, 104, 'pull', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.6) });
      R.server(820, 236, null, { s: 0.6 }); grow(820, 146, 820, 196, E(u, 1.8, 2.3), GOOD);
      T(710, 296, 'ArgoCD가 차트를 렌더해 스스로 맞춘다', { 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.2) }); }
    strip(c); }

  const quiz = [
    { q: 'PR을 열었을 때 이 워크플로우가 하는 일은 무엇인가?',
      o: ['검증과 dry-run까지만 돌리고 helm upgrade는 하지 않는다', 'main과 똑같이 운영 클러스터에 배포한다', '아무 잡도 돌지 않는다'], a: 0,
      why: 'push(main)과 pull_request 두 트리거가 있고, 실제 배포 잡은 main일 때만 돈다. PR은 병합 전에 문제를 찾는 용도다.' },
    { q: 'helm lint를 통과했는데 helm template에서 멈추는 대표적인 경우는 무엇인가?',
      o: ['Chart.yaml에 icon이 없을 때', 'required로 표시한 필수값이 비어 있을 때', '러너에 kubectl이 없을 때'], a: 1,
      why: 'lint는 템플릿을 렌더해 보지만 required 누락은 [INFO] 경고로만 넘긴다. template은 같은 상황에서 오류로 멈춘다.' },
    { q: '이미지 태그를 values-prod.yaml에 쓰지 않고 --set image.tag=${{ github.sha }}로 넣는 이유는 무엇인가?',
      o: ['latest보다 내려받기가 빠르다', 'values 파일이 짧아진다', '어떤 커밋이 떠 있는지 남고 그 태그로 정확히 되돌릴 수 있다'], a: 2,
      why: '커밋 해시는 한 커밋에 하나라서 추적이 된다. latest는 가리키는 이미지가 계속 바뀌어 롤백 기준이 되지 못한다.' },
    { q: '--atomic으로 upgrade 한 rev 2가 5분 안에 Ready 되지 못하면 history는 어떻게 되는가?',
      o: ['rev 2가 지워지고 rev 1 만 남는다', 'rev 2는 failed로 남고, rev 1 내용으로 롤백한 rev 3이 생긴다', 'rev 2가 반쯤 뜬 채 deployed로 남는다'], a: 1,
      why: '롤백도 새 리비전을 만든다. 실패한 rev 2 기록은 남고, 직전 성공본 내용이 rev 3으로 다시 배포된다.' },
    { q: 'GitOps(ArgoCD) 방식에서 CI 파이프라인이 하지 않게 되는 일은 무엇인가?',
      o: ['클러스터에 직접 helm upgrade 하기', 'values 파일을 Git에 커밋하기', '차트를 lint 하기'], a: 0,
      why: 'pull 형에서는 ArgoCD가 Git의 values를 당겨 차트를 렌더하고 스스로 동기화한다. CI는 클러스터에 밀지 않는다.' },
  ];

  const summary = [
    '손으로 helm upgrade를 치면 순서와 값이 매번 달라진다. 워크플로우 파일 하나가 그 순서를 고정한다.',
    'lint는 구조를 보고, template은 실제 값으로 끝까지 렌더하고, kubeconform은 스키마와 대조한다.',
    'PR에서는 dry-run으로 미리 보고, 이미지 태그는 latest 대신 커밋 해시로 넣는다.',
    '--atomic은 5분 안에 Ready가 안 되면 직전 리비전으로 되돌리고, 그 롤백도 새 리비전으로 남는다.',
  ];
  const review = [
    { q: 'PR 잡이 통과해 병합했는데 운영 배포에서 required 오류가 났다. PR 잡에서 먼저 의심할 것은?',
      o: ['helm template 없이 lint만 돌렸다', 'kubeconfig가 만료됐다', '차트 버전을 올리지 않았다'], a: 0,
      why: 'lint는 required 누락을 경고로만 넘긴다. 실제 배포 값으로 helm template을 돌렸다면 PR 단계에서 멈췄을 것이다.' },
    { q: '배포 뒤 Pod가 계속 재시작하는데 워크플로우는 초록으로 끝났다. 빠졌을 가능성이 가장 큰 옵션은?',
      o: ['--create-namespace', '--atomic 또는 --wait', '--values values-prod.yaml'], a: 1,
      why: '기다리지 않으면 helm은 매니페스트만 보내고 바로 성공으로 끝난다. --atomic을 주면 --wait도 함께 켜져 Ready를 확인한다.' },
    { q: '어제 오후 배포본으로 돌아가야 한다. 이 파이프라인에서 가장 정확한 기준은 무엇인가?',
      o: ['그 시각의 latest 태그', 'gh-pages의 index.yaml 수정 시각', '그때 배포한 커밋 해시 태그와 그 리비전'], a: 2,
      why: '이미지 태그를 github.sha로 넣었기 때문에 리비전마다 어떤 커밋이 떴는지 남아 있다. latest는 이미 다른 이미지를 가리킬 수 있다.' },
  ];

  R.page({ title: 'Helm 배포 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
