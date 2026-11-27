/* II-1-2 auto sync — prune · selfHeal — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: Git 저장소 → Argo CD 앱 → 클러스터. auto 가 켜지면 사람 문이 사라지고 점이 저절로 흐른다.
 * prune 은 Git 에서 사라진 리소스가 클러스터에서 지워지는 모습, selfHeal 은 kubectl 로 바꾼 Pod 수가 Git 값으로 되돌아가는 모습.
 * 숫자(replicas 3·10·20, 30분, 120초·60초, 5초)는 페이지 STEPS·코드·공식 문서 값만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, person, cross, check, lock, clock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const GX = 30, GW = 220, AX = 480, AY = 118, KX = 710, KW = 220, TOP = 24, H = 210;
  const SYNC = { Synced: GOOD, OutOfSync: WARN, Syncing: INFO };
  const badge = (cx, cy, s, sc) => pill(cx, cy, s, SYNC[s] || MUT, sc, { fs: 14, fill: SYNC[s] === GOOD ? GOODBG : SYNC[s] === WARN ? WARNBG : INFOBG });
  function gitRepo(items, o) { o = o || {};
    zone(GX, TOP, GW, H, o.title || 'Git 저장소 · main', { fill: SOFT });
    items.slice(0, 3).forEach((it, i) => { const [s, note, st] = it, y = TOP + 58 + i * 44, hot = i === 0 && !st, f = i === 0 && o.fresh != null ? o.fresh : 1;
      if (f <= 0) return; const yy = lerp(y - 26, y, E(f, 0, 1)), gone = st === 'gone';
      card(GX + GW / 2, yy, GW - 36, 34, { rx: 8, stroke: gone ? BAD : hot ? ACC : GRID, sw: hot || gone ? 2.2 : 1.5, fill: gone ? BADBG : hot ? ACCBG : PANEL, dash: gone ? '5 4' : null, op: clamp(f * 1.5) });
      mono(GX + 32, yy + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: gone ? BAD : hot ? ACC : MUT, opacity: clamp(f * 1.5), 'text-decoration': gone ? 'line-through' : null });
      if (note) tx(GX + GW - 28, yy + 5, note, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: clamp(f * 1.5) }); }); }
  function appCard(sync, o) { o = o || {};
    card(AX, AY, 200, 104, { rx: 12, stroke: INK, sw: 2.2 });
    tx(AX, AY - 26, 'Argo CD · web', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
    badge(AX, AY + 10, sync, 1 + (o.bump || 0));
    if (o.mode) pill(AX, AY + 74, o.mode, o.modeCol || ACC, o.modeS ?? 1, { mono: true, fs: 13.5 }); }
  // 클러스터: 리소스 카드 목록 [[이름, 값, 상태]] 상태: ok / old / ghost / gone / warn
  function cluster(rows, o) { o = o || {};
    zone(KX, TOP, KW, H, '클러스터', { fill: SOFT, stroke: o.hot ? BAD : 'none' });
    rows.forEach(([n, v, st, sc], i) => { const y = TOP + 58 + i * 44, col = st === 'gone' ? BAD : st === 'ghost' ? WARN : st === 'old' ? INFO : st === 'warn' ? WARN : GOOD;
      const s = sc ?? 1; if (s <= 0.02) return;
      card(KX + KW / 2, y, KW - 36, 34, { rx: 8, stroke: col, sw: 2, fill: st === 'ghost' ? WARNBG : PANEL, dash: st === 'ghost' || st === 'gone' ? '5 4' : null, s });
      mono(KX + 32, y + 5, n, { 'font-size': 14.5, 'font-weight': 700, fill: st === 'gone' ? BAD : INK, opacity: s, 'text-decoration': st === 'gone' ? 'line-through' : null });
      if (v) mono(KX + KW - 28, y + 5, v, { 'font-size': 14, fill: col, 'text-anchor': 'end', opacity: s }); }); }
  const P1 = [[GX + GW, AY], [AX - 100, AY]], P2 = [[AX + 100, AY], [KX, AY]];
  function lanes(o) { o = o || {};
    el('line', { x1: P1[0][0], y1: AY, x2: P1[1][0], y2: AY, stroke: GRID, 'stroke-width': 2.5, 'stroke-dasharray': '6 6' });
    el('line', { x1: P2[0][0], y1: AY, x2: P2[1][0], y2: AY, stroke: GRID, 'stroke-width': 2.5 });
    if (o.gate) { const gx = (P2[0][0] + P2[1][0]) / 2; el('rect', { x: gx - 6, y: AY - 36, width: 12, height: 72, rx: 4, fill: WARN }); sub(gx, AY + 56, '사람 대기', 1, { fill: WARN, 'font-weight': 700 }); } }
  function sw(x, y, name, on, s) { const g = R.G(x, y, s ?? 1); const col = on ? GOOD : OFF;
    el('rect', { x: 0, y: -14, width: 52, height: 28, rx: 14, fill: on ? GOOD : SOFT, stroke: col, 'stroke-width': 2 }, g);
    el('circle', { cx: on ? 38 : 14, cy: 0, r: 10, fill: PANEL, stroke: col, 'stroke-width': 2 }, g);
    R.tx(64, 5, name, { 'font-size': 15, 'font-weight': 700, class: 'mono' }, g); R.tx(64 + tw(name, 15) + 10, 5, on ? 'true' : 'false', { 'font-size': 14, class: 'mono', fill: on ? GOOD : MUT }, g); }
  // Pod 들: n 개 (소수면 마지막이 자라는 중)
  function pods(x, y, n, o) { o = o || {}; const cols = o.cols || 10, r = o.r || 12, gap = o.gap || 32;
    for (let i = 0; i < Math.ceil(n); i++) { const f = Math.min(1, n - i), cx = x + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap, extra = i >= (o.base ?? 99);
      el('circle', { cx, cy, r: r * (0.3 + 0.7 * f), fill: extra ? (o.exCol === BAD ? BADBG : WARNBG) : GOODBG, stroke: extra ? (o.exCol || WARN) : GOOD, 'stroke-width': 2, opacity: f }); } }

  // ---------- 1. 왜 auto ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0 || k === 5) {
      gitRepo([['v2', '새 커밋'], ['v1', '']], { fresh: k === 0 ? E(u, 0.1, 0.6) : 1 }); lanes({ gate: true }); appCard(k === 0 && u < 1.2 ? 'Synced' : 'OutOfSync', { mode: 'manual', modeCol: WARN });
      if (k === 0) dot(P1, seg(u, 0.6, 1.2), ACC, 7);
      cluster([['web-deploy', 'v1', 'old'], ['web-svc', 'ok', 'ok']]);
      if (k === 0) tx(480, 300, '알려 주기까지만 한다 · 적용은 사람 몫', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      else banner(480, 310, 'auto sync = 사람이 누르는 한 번을 없앤다', pop(u, 0.6));
      return; }
    if (k === 1) {   // 지연 드리프트
      const x0 = 110, x1 = 850, y = 170, f = E(u, 0.3, 2.2);
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 4 });
      el('rect', { x: x0, y: y - 26, width: (x1 - x0) * f, height: 52, rx: 6, fill: BADBG, opacity: 0.9 });
      [[x0, 'PR 머지', 'v2 커밋', ACC], [x1, 'argocd app sync', '그제야 반영', INFO]].forEach(([x, a, b2, col], i) => { const s = pop(u, i ? 2.0 : 0.2);
        el('circle', { cx: x, cy: y, r: 11 * s, fill: col }); lbl(x, y - 40, a, s > 0.5 ? 1 : 0, { fill: col }); sub(x, y + 48, b2, s > 0.5 ? 1 : 0); });
      mono(480, y + 6, `${Math.round(30 * f)}분`, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: BAD });
      tx(480, 290, '이 사이 Git은 v2, 클러스터는 v1 · 지연 드리프트', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      person(480, 360, '누르는 걸 잊은 사람', { s: pop(u, 1.0), stroke: MUT });
      return; }
    if (k === 2) {
      gitRepo([['v2', '새 커밋'], ['v1', '']]); lanes(); appCard(u > 1.9 ? 'Synced' : 'OutOfSync', { mode: 'automated' });
      clock(AX, 300, 26, E(u, 0.1, 1.0) * 0.85, INFO);
      tx(AX + 40, 296, '120초 + 지터 최대 60초', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      tx(AX + 40, 318, '길어야 3분쯤마다 Git을 본다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      dot([...P1, ...P2], seg(u, 1.0, 1.9), ACC, 8);
      cluster([['web-deploy', u > 1.9 ? 'v2' : 'v1', u > 1.9 ? 'ok' : 'old'], ['web-svc', 'ok', 'ok']]);
      return; }
    if (k === 3) {   // 환경별
      [['dev', 'auto ON', '빠른 피드백', GOOD], ['staging', 'auto ON', '표준화된 서비스', GOOD], ['prod', 'manual 유지', '초기엔 승인 게이트', WARN]].forEach(([e, m, d, col], i) => {
        const y = 80 + i * 96, s = pop(u, 0.2 + i * 0.5); card(480, y, 760, 76, { rx: 12, stroke: col, sw: 2.2, s });
        if (s < 0.5) return; tx(130, y + 7, e, { 'font-size': 20, 'font-weight': 800 }); pill(430, y, m, col, 1, { fs: 15 }); tx(560, y + 6, d, { 'font-size': 15, fill: MUT });
        if (i < 2) dot([[700, y], [830, y]], (t * 0.7 + i * 0.3) % 1, col, 6); else lock(800, y + 4, true, WARN); });
      tx(480, 395, '운영은 manual로 시작해 점진 전환한다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    // k4: webhook
    gitRepo([['v2', 'push']]); lanes(); appCard('Synced', { mode: 'automated' });
    el('path', { d: `M${GX + GW},${AY - 30} Q${(GX + GW + AX - 100) / 2},${AY - 90} ${AX - 100},${AY - 30}`, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': `${300 * E(u, 0.3, 1.0)} 400` });
    pill((GX + GW + AX - 100) / 2, AY - 78, 'webhook', ACC, pop(u, 0.9), { mono: true });
    dot(P2, seg(u, 1.1, 1.8), ACC, 8);
    cluster([['web-deploy', u > 1.8 ? 'v2' : 'v1', u > 1.8 ? 'ok' : 'old'], ['web-svc', 'ok', 'ok']]);
    snippet(250, 290, ['# argocd-cm', 'timeout.reconciliation: 120s   # 폴링 주기'], { op: fade(u, 1.6) }); }

  // ---------- 2. syncPolicy.automated ----------
  const APP = ['apiVersion: argoproj.io/v1alpha1', 'kind: Application', 'metadata: { name: web }', 'source:', '  repoURL: …/acme/web.git', '  targetRevision: main', '  path: k8s/overlays/dev', 'destination: { namespace: web }', 'syncPolicy:', '  automated:', '    prune: false', '    selfHeal: false'];
  function yamlPanel(n, hi, op) { const x = 24, y = 20, lh = 26;
    el('rect', { x, y, width: 400, height: 20 + 12 * lh, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    APP.slice(0, Math.ceil(n)).forEach((s, i) => { const f = Math.min(1, n - i);
      if (hi && hi(i)) el('rect', { x: x + 6, y: y + 10 + i * lh, width: 388, height: lh, rx: 4, fill: C.HL, opacity: 0.55 * f });
      mono(x + 16, y + 28 + i * lh, s, { 'font-size': 14.5, opacity: f * (op ?? 1), fill: s.trim().startsWith('#') ? MUT : INK }); }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    const n = [3, 8, 10, 12, 12, 12][k], prevN = [0, 3, 8, 10, 12, 12][k];
    yamlPanel(k === 0 ? lerp(0, 3, E(u, 0.1, 1.2)) : lerp(prevN, n, E(u, 0.1, 1.0)), (i) => (k === 1 && i >= 3 && i < 8) || (k === 2 && i >= 8 && i < 10) || (k === 3 && i >= 10));
    const RX = 470;   // 오른쪽 그림
    if (k === 0) { zone(RX, 40, 460, 300, null, { fill: PANEL, stroke: GRID });
      card(RX + 230, 130, 220, 60, { rx: 10, stroke: INK, sw: 2, text: 'Application web', fs: 16, mono: true, s: pop(u, 0.4) });
      tx(RX + 230, 210, 'syncPolicy 없음', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2) });
      tx(RX + 230, 236, '= 기본값 manual', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
      lock(RX + 230, 290, true, WARN, pop(u, 1.6)); return; }
    if (k === 1) {
      R.dbIcon(RX + 80, 120, 'main', { s: pop(u, 0.2), stroke: ACC }); sub(RX + 80, 205, 'k8s/overlays/dev', fade(u, 0.5), { class: 'mono' });
      zone(RX + 230, 70, 220, 150, 'ns: web', { fill: SOFT, op: fade(u, 0.6) });
      grow(RX + 130, 130, RX + 226, 130, E(u, 0.8, 1.5), ACC);
      tx(RX + 340, 160, '같은 클러스터', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.2) });
      tx(RX + 230, 290, '읽을 곳 → 배포할 곳 연결', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) {
      zone(RX, 40, 460, 230, 'Git → 클러스터', { fill: SOFT });
      card(RX + 80, 150, 110, 40, { rx: 8, stroke: ACC, text: 'v2', fs: 16, mono: true }); card(RX + 380, 150, 110, 40, { rx: 8, stroke: u > 1.8 ? GOOD : INFO, text: u > 1.8 ? 'v2' : 'v1', fs: 16, mono: true });
      el('line', { x1: RX + 135, y1: 150, x2: RX + 325, y2: 150, stroke: GRID, 'stroke-width': 2.5 });
      for (let i = 0; i < 3; i++) dot([[RX + 135, 150], [RX + 325, 150]], seg(u, 0.6 + i * 0.4, 1.4 + i * 0.4), ACC, 6);
      badge(RX + 230, 230, u > 1.8 ? 'Synced' : 'OutOfSync', 1);
      banner(RX + 230, 320, '블록 하나로 사람 클릭이 사라진다', pop(u, 2.0)); return; }
    if (k === 3) {
      sw(RX + 20, 80, 'prune:', false, pop(u, 0.2)); sw(RX + 20, 130, 'selfHeal:', false, pop(u, 0.4));
      zone(RX, 170, 460, 170, null, { fill: SOFT });
      tx(RX + 20, 200, 'Git', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(RX + 250, 200, '클러스터', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [['web-deploy', 'v2', 'v2'], ['legacy-job', '삭제', '잔류']].forEach(([nn, g, l], i) => { const y = 238 + i * 50, s = pop(u, 0.8 + i * 0.4);
        card(RX + 110, y, 190, 36, { rx: 8, stroke: i ? BAD : GRID, dash: i ? '5 4' : null, s, text: i ? 'legacy-job (지움)' : `${nn} ${g}`, fs: 14, mono: true, color: i ? BAD : INK });
        card(RX + 350, y, 190, 36, { rx: 8, stroke: i ? WARN : GOOD, sw: i ? 2.4 : 2, fill: i ? WARNBG : PANEL, s, text: `${nn} ${l === '잔류' ? '남음' : l}`, fs: 14, mono: true }); });
      badge(RX + 350, 80, 'OutOfSync', pop(u, 1.8)); return; }
    if (k === 4) {
      [['Git에 추가·수정', '자동 반영', true], ['Git에서 삭제', '클러스터에 남음', false], ['kubectl 직접 수정', '그대로 둠', false]].forEach(([a, r2, ok], i) => {
        const y = 80 + i * 80, s = pop(u, 0.2 + i * 0.5); card(RX + 230, y, 440, 62, { rx: 10, stroke: ok ? GOOD : WARN, sw: 2, s });
        if (s < 0.5) return; tx(RX + 40, y - 4, a, { 'font-size': 15, 'font-weight': 700 }); tx(RX + 40, y + 18, r2, { 'font-size': 14, fill: MUT });
        if (ok) check(RX + 410, y, 12, 1); else cross(RX + 410, y, 11, 1); });
      tx(RX + 230, 330, 'X 둘을 채우는 스위치가 prune · selfHeal', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    terminal(RX, 50, 460, 170, ['$ kubectl apply -f app-automated.yaml -n argocd', 'application.argoproj.io/web created', '$ argocd app get web', ['Sync Status:  Synced', 'var(--hl)']], lerp(0, 4, E(u, 0.1, 1.8)), { fs: 13.5 });
    tx(RX + 230, 270, '커밋할 때마다 Synced로 돌아온다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
    tx(RX + 230, 300, `${b.rows.length}개 리소스 모두 Git과 같음`, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); }

  // ---------- 3. prune ----------
  function s3(t, c) { const { k, u } = c;
    const files = (k === 4) ? [['web.yaml', ''], ['postgres-data.yaml', '', 'gone']] : [['web.yaml', ''], ['legacy-job.yaml', '', 'gone']];
    if (k === 1) {   // 삭제 순서
      sw(40, 50, 'PruneLast=', true, pop(u, 0.1)); sw(40, 96, 'PrunePropagationPolicy=', true, pop(u, 0.3));
      const y = 200, x0 = 80, step = 270;
      [['적용', 'web-deploy 등 나머지', ACC], ['적용 끝', '모두 Healthy 확인', GOOD], ['맨 마지막 wave', 'legacy-job 삭제', BAD]].forEach(([a, d, col], i) => { const s = pop(u, 0.6 + i * 0.5), x = x0 + i * step;
        card(x + 100, y, 220, 70, { rx: 10, stroke: col, sw: 2.2, s }); if (s > 0.5) { tx(x + 100, y - 6, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: col }); tx(x + 100, y + 18, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
        if (i < 2) grow(x + 212, y, x + step - 12, y, E(u, 0.9 + i * 0.5, 1.3 + i * 0.5), MUT); });
      // foreground: 자식 Pod 부터
      const fy = 330; card(300, fy, 150, 44, { rx: 8, stroke: BAD, text: 'Job legacy-job', fs: 14, mono: true, s: pop(u, 1.8) });
      [0, 1].forEach((i) => { const gone = E(u, 2.1 + i * 0.15, 2.5 + i * 0.15); el('circle', { cx: 430 + i * 40, cy: fy, r: 13 * (1 - gone * 0.9), fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: 1 - gone }); });
      tx(530, fy + 6, 'foreground: 자식 Pod부터 지우고 부모를 지운다', { 'font-size': 14.5, opacity: fade(u, 1.9) }); return; }
    if (k === 5) {   // 보호 vs 회수
      [['보호', 'Prune=false', [['PVC', 'postgres-data'], ['Secret', '']], GOOD, 250], ['회수 대상', 'prune: true', [['Deployment', ''], ['ConfigMap', '']], BAD, 710]].forEach(([h, d, items, col, cx], j) => {
        zone(cx - 200, 50, 400, 270, null, { fill: SOFT, stroke: col, op: fade(u, 0.2 + j * 0.6) });
        tx(cx, 90, h, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + j * 0.6) });
        pill(cx, 126, d, col, pop(u, 0.4 + j * 0.6), { mono: true, fs: 14 });
        items.forEach(([kk, nn], i) => { const y = 190 + i * 60; card(cx, y, 300, 44, { rx: 8, stroke: GRID, s: pop(u, 0.6 + j * 0.6 + i * 0.15), text: nn ? `${kk} ${nn}` : kk, fs: 15, mono: true });
          if (j === 0) lock(cx + 130, y + 2, true, GOOD, pop(u, 0.8 + i * 0.15)); }); });
      tx(480, 370, '상태를 담은 리소스만 지켜 두고 나머지는 Git을 따른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    gitRepo(files, { title: 'Git · k8s/' }); lanes();
    const on = k !== 3;
    appCard(k === 2 && u > 1.8 ? 'Synced' : k === 4 ? 'Synced' : 'OutOfSync', { mode: on ? 'prune: true' : 'prune: false', modeCol: on ? ACC : WARN, modeS: k === 0 ? pop(u, 0.4) : 1 });
    if (k === 0) { cluster([['web-deploy', 'v2', 'ok'], ['legacy-job', '남음', 'ghost']]);
      tx(480, 300, 'Git에 없는 것은 클러스터에서도 지우겠다는 선언', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { const g = E(u, 0.8, 1.8); dot(P2, seg(u, 0.2, 0.8), BAD, 8);
      cluster([['web-deploy', 'v2', 'ok'], ['legacy-job', g > 0.5 ? '삭제됨' : '남음', g > 0.5 ? 'gone' : 'ghost', 1 - g * 0.6]]);
      banner(480, 310, 'legacy-job.yaml을 지우고 push → 클러스터에서도 삭제', pop(u, 2.0)); return; }
    if (k === 3) { cluster([['web-deploy', 'v2', 'ok'], ['legacy-job', '남음', 'ghost']]);
      [0, 1, 2].forEach((i) => el('path', { d: `M${KX + 70 + i * 30},${TOP + 140} q6,-10 12,0 q6,10 12,0`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.5 + i * 0.2) }));
      tx(480, 300, '유령 리소스 · prune 필요 표시만 남는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      pill(480, 340, 'argocd app sync --prune을 사람이 눌러야 삭제', INK, pop(u, 1.6), { mono: false, fs: 14 }); return; }
    // k4: PVC 보호
    cluster([['web-deploy', 'v2', 'ok'], ['postgres-data', '', 'warn']]);
    tx(KX + KW / 2, TOP + H + 22, 'postgres-data는 남는다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
    lock(KX + KW - 20, TOP + 102, true, GOOD, pop(u, 0.8)); dot(P2, seg(u, 0.3, 0.9), BAD, 8); if (u > 0.9) R.cross(KX - 18, AY, 10, pop(u, 0.9));
    snippet(260, 300, ['annotations:', '  argocd.argoproj.io/sync-options: Prune=false'], { op: fade(u, 1.2) }); }

  // ---------- 4. selfHeal ----------
  function healStage(c, liveN, o) { o = o || {}; const u = c.u;
    zone(30, 24, 260, 190, 'Git', { fill: SOFT }); mono(160, 110, 'replicas: 3', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC });
    if (o.gitNote) tx(160, 150, o.gitNote, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    zone(330, 24, 600, 190, `클러스터 · web-deploy`, { fill: SOFT, stroke: o.hot ? WARN : 'none' });
    pods(370, 80, liveN, { cols: 10, base: 3, gap: 52, r: 15, exCol: o.exCol });
    mono(910, 50, `replicas ${Math.round(liveN)}`, { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 800, fill: Math.round(liveN) === 3 ? GOOD : WARN });
    badge(160, 182, o.sync || 'Synced', 1); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { healStage(c, 3); sw(330, 270, 'selfHeal:', true, pop(u, 0.3));
      tx(330, 330, '클러스터를 직접 바꾸면 Git 값으로 되돌리겠다는 선언', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 1) { const n = u < 1.4 ? lerp(3, 10, E(u, 0.4, 1.2)) : lerp(10, 3, E(u, 1.6, 2.3));
      healStage(c, n, { sync: u > 1.2 && u < 2.3 ? 'OutOfSync' : 'Synced', hot: u > 1.2 && u < 2.3 });
      fly(200, 300, 560, 160, seg(u, 0.1, 0.6), 'kubectl scale --replicas=10', { fill: WARN, mono: true });
      clock(560, 300, 22, E(u, 1.2, 1.6) * 0.85, INFO); tx(594, 306, '기본 5초 뒤 selfHeal이 다시 sync', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(480, 370, '10 → 3 · 드리프트가 저절로 사라진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) }); return; }
    if (k === 2) { healStage(c, lerp(3, 10, E(u, 0.2, 1.0)), { sync: u > 1.0 ? 'OutOfSync' : 'Synced', hot: true });
      sw(330, 270, 'selfHeal:', false, 1);
      tx(330, 330, 'replicas 10이 그대로 남고 OutOfSync 표시만 뜬다', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); return; }
    if (k === 3) { const n = u < 1.5 ? lerp(3, 20, E(u, 0.3, 1.2)) : lerp(20, 3, E(u, 1.6, 2.4));
      healStage(c, n, { exCol: BAD, sync: u > 1.2 && u < 2.4 ? 'OutOfSync' : 'Synced' });
      pill(200, 300, '장애 대응: --replicas=20', BAD, pop(u, 0.1), { mono: true, fs: 14 });
      tx(480, 360, '몇 초 뒤 3으로 롤백 · 긴급 조치가 무효가 된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      tx(480, 390, '정석은 Git에 replicas를 먼저 커밋하는 것', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.5) }); return; }
    if (k === 4) { healStage(c, lerp(3, 20, E(u, 0.9, 1.6)), { exCol: WARN, sync: u > 1.6 ? 'OutOfSync' : 'Synced', gitNote: 'auto 꺼짐' });
      [['① argocd app set web --sync-policy none', 0.2], ['② kubectl scale --replicas=20 (임시)', 0.8], ['③ 사후에 Git 반영 + auto 다시 켜기', 1.8]].forEach(([s, at], i) => {
        mono(60, 270 + i * 40, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, at), fill: i === 2 ? GOOD : INK }); }); return; }
    // k5: HPA 와 무한 루프 → ignoreDifferences
    const cut = E(u, 1.6, 2.2);
    card(260, 140, 200, 70, { rx: 12, stroke: INFO, sw: 2.4, text: 'HPA\nreplicas ↑', fs: 16, s: pop(u, 0.1) });
    card(700, 140, 200, 70, { rx: 12, stroke: ACC, sw: 2.4, text: 'selfHeal\nreplicas → 3', fs: 16, s: pop(u, 0.2) });
    const ph = (t * 1.2) % 2;
    if (cut < 0.5) { dot([[360, 120], [600, 120]], ph < 1 ? ph : -1, INFO, 8); dot([[600, 160], [360, 160]], ph >= 1 ? ph - 1 : -1, ACC, 8); }
    el('path', { d: 'M360,120 C430,80 530,80 600,120', fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: 1 - cut * 0.7 });
    el('path', { d: 'M600,160 C530,200 430,200 360,160', fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: 1 - cut * 0.7 });
    if (cut > 0) R.cross(480, 182, 14, cut);
    snippet(250, 250, ['ignoreDifferences:', '  - group: apps', '    kind: Deployment', '    jsonPointers: [/spec/replicas]'], { op: fade(u, 1.0) });
    tx(480, 400, 'replicas를 diff에서 빼면 싸움이 끝난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); }

  // ---------- 5. auto vs manual ----------
  function conds(items, col, u, title, x) { tx(x, 56, title, { 'font-size': 19, 'font-weight': 800, fill: col, opacity: fade(u, 0.1) });
    items.forEach(([a, d], i) => { const y = 110 + i * 70, s = pop(u, 0.3 + i * 0.4); card(x + 190, y, 380, 56, { rx: 10, stroke: col, sw: 2, s });
      if (s > 0.5) { tx(x + 20, y - 3, a, { 'font-size': 16, 'font-weight': 700 }); tx(x + 20, y + 18, d, { 'font-size': 13.5, fill: MUT }); } }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { conds([['dev / staging', '실수 비용이 낮다'], ['표준화된 무상태 서비스', '배포 절차가 정형화'], ['PR에서 리뷰 끝', '머지 = 신뢰']], GOOD, u, 'auto가 맞는 자리', 40);
      ['dev', 'stg'].forEach((e, i) => { const y = 150 + i * 90; card(700, y, 100, 44, { rx: 8, stroke: GOOD, text: e, fs: 16, mono: true, s: pop(u, 1.4 + i * 0.2) });
        dot([[560, y], [650, y]], (t * 0.8 + i * 0.4) % 1, GOOD, 7); tx(770, y + 5, '즉시 반영', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.6) }); }); return; }
    if (k === 1) { conds([['운영(prod) 핵심 서비스', '배포 창·승인 게이트'], ['DB 마이그레이션 동반', '순서·롤백 통제'], ['규제·감사 대상', '승인 기록 필수']], WARN, u, 'manual이 맞는 자리', 40);
      card(720, 190, 160, 60, { rx: 10, stroke: WARN, sw: 2.4, text: 'prod', fs: 18, mono: true, s: pop(u, 1.4) }); lock(720, 260, true, WARN, pop(u, 1.6));
      person(840, 200, '승인자', { s: pop(u, 1.8) }); return; }
    if (k === 2) {   // 함정 1·2
      zone(30, 40, 430, 300, '함정 1 · prune + 실수 삭제', { fill: SOFT, color: BAD });
      const g = E(u, 0.6, 1.4); card(245, 140, 240, 44, { rx: 8, stroke: BAD, dash: '5 4', text: 'legacy-pvc.yaml 삭제 커밋', fs: 14, s: pop(u, 0.2) });
      card(245, 230, 200, 48, { rx: 8, stroke: BAD, sw: 2.2, text: 'legacy-pvc', fs: 15, mono: true, op: 1 - g * 0.75 }); if (g > 0.5) R.cross(245, 230, 16, g);
      tx(245, 300, '방지: PR 리뷰 + Prune=false', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      zone(500, 40, 430, 300, '함정 2 · selfHeal이 긴급 수정 롤백', { fill: SOFT, color: BAD });
      const n = u < 1.2 ? 20 : lerp(20, 3, E(u, 1.2, 2.0)); pods(560, 120, n, { cols: 8, gap: 40, r: 13, base: 3, exCol: BAD });
      mono(715, 280, `replicas ${Math.round(n)}`, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: Math.round(n) === 3 ? INK : BAD });
      tx(715, 310, '방지: Git 먼저 또는 auto 잠시 off', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3) {   // 함정 3·4
      zone(30, 40, 430, 300, '함정 3 · HPA ↔ selfHeal 루프', { fill: SOFT, color: BAD });
      const v = Math.floor(t * 1.5) % 2; mono(245, 170, v ? 'replicas 10' : 'replicas 3', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: v ? INFO : ACC });
      el('path', { d: 'M150,210 A95,40 0 1 0 340,210', fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
      tx(245, 300, '방지: ignoreDifferences', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      zone(500, 40, 430, 300, '함정 4 · 승인 없는 배포', { fill: SOFT, color: BAD });
      card(600, 160, 120, 44, { rx: 8, stroke: ACC, text: 'merge', fs: 16, mono: true, s: pop(u, 0.6) }); card(840, 160, 120, 44, { rx: 8, stroke: BAD, sw: 2.4, text: 'prod', fs: 16, mono: true, s: pop(u, 0.8) });
      grow(662, 160, 778, 160, E(u, 0.9, 1.3), BAD); tx(720, 140, '즉시', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      tx(715, 300, '방지: prod는 manual + 승인 절차', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
    if (k === 4) {   // 환경별 스위치
      [['dev', [1, 1, 1], '완전 자동'], ['stg', [1, 1, 0], 'prune만'], ['prod', [0, 0, 0], '승인 후 sync']].forEach(([e, on, d], i) => { const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.5);
        card(480, y, 860, 80, { rx: 12, stroke: GRID, sw: 1.6, s }); if (s < 0.5) return;
        tx(80, y + 8, e, { 'font-size': 22, 'font-weight': 800 });
        ['automated', 'prune', 'selfHeal'].forEach((n, j) => { const x = 190 + j * 200; el('rect', { x, y: y - 14, width: 46, height: 26, rx: 13, fill: on[j] ? GOOD : SOFT, stroke: on[j] ? GOOD : OFF, 'stroke-width': 2 });
          el('circle', { cx: on[j] ? x + 33 : x + 13, cy: y - 1, r: 9, fill: PANEL }); tx(x + 56, y + 4, n, { 'font-size': 15, class: 'mono', fill: on[j] ? INK : MUT }); });
        tx(880, y + 5, d, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: i === 2 ? WARN : GOOD }); }); return; }
    // k5: 함께 쓰는 syncOptions
    [['CreateNamespace=true', '대상 ns 자동 생성'], ['PruneLast=true', 'prune을 마지막에'], ['ApplyOutOfSyncOnly=true', '바뀐 리소스만 다시 적용'], ['RespectIgnoreDifferences=true', '무시 필드를 sync에서도 존중']].forEach(([o, d], i) => {
      const y = 70 + i * 72, s = pop(u, 0.2 + i * 0.4); card(480, y, 760, 56, { rx: 28, stroke: ACC, sw: 2, s });
      if (s > 0.5) { mono(130, y + 6, o, { 'font-size': 16, 'font-weight': 700, fill: ACC }); tx(830, y + 6, d, { 'font-size': 15, 'text-anchor': 'end' }); } });
    tx(480, 380, '정책(automated)과 옵션(syncOptions)을 함께 건다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: 'manual sync에서 PR이 머지됐는데 배포가 30분 늦어진 이유로 가장 알맞은 것은 무엇인가?',
      o: ['Argo CD의 폴링 주기가 30분이라서', '누군가 argocd app sync를 눌러야 반영되기 때문에', 'Git 저장소가 느려서'], a: 1,
      why: 'manual은 OutOfSync로 표시까지만 한다. 기본 폴링은 120초에 지터를 더해 길어야 3분쯤이고, 나머지는 사람을 기다린 시간이다.' },
    { q: 'syncPolicy.automated만 켜고 prune·selfHeal을 쓰지 않았다. Git에서 legacy-job을 지우면 어떻게 되는가?',
      o: ['클러스터에서도 바로 지워진다', 'sync가 실패한다', '클러스터에 그대로 남는다'], a: 2,
      why: 'prune의 기본값은 false다. 추가·수정만 자동 반영되고 삭제분은 남아 prune 필요 표시만 뜬다.' },
    { q: 'PVC postgres-data를 prune에서 지키는 방법은 무엇인가?',
      o: ['PVC에 argocd.argoproj.io/sync-options: Prune=false를 붙인다', 'Application의 prune을 true로 둔다', 'PruneLast=true를 켠다'], a: 0,
      why: '리소스에 붙인 Prune=false는 Application의 prune 설정보다 우선한다. PruneLast는 순서만 미룰 뿐 지우는 건 같다.' },
    { q: 'selfHeal이 켜진 앱에서 장애 중 kubectl scale로 replicas를 20으로 올렸다. 무슨 일이 생기는가?',
      o: ['20이 유지되고 Git도 20으로 바뀐다', '몇 초 뒤 Git 값 3으로 되돌아간다', 'Argo CD가 앱을 manual로 바꾼다'], a: 1,
      why: 'selfHeal은 클러스터 변경을 드리프트로 보고 다시 sync 한다. Git에 먼저 커밋하거나 sync-policy none으로 잠시 끈다.' },
    { q: 'dev·stg·prod 정책을 나눌 때 prod에 알맞은 설정은 무엇인가?',
      o: ['automated { prune: true, selfHeal: true }', 'automated { prune: true, selfHeal: false }', 'syncPolicy 없이 승인 후 argocd app sync'], a: 2,
      why: '운영 핵심 서비스는 승인 게이트와 기록이 필요하다. dev는 완전 자동, stg는 prune만 켜는 식으로 나눈다.' },
  ];

  const summary = [
    'manual은 누군가 sync를 눌러야 반영돼서, 머지하고도 30분 뒤에 배포되는 일이 생긴다.',
    'automated를 켜면 Git을 120초에 지터를 더한 주기로 보고 바뀐 것을 바로 반영한다.',
    'prune과 selfHeal은 기본값이 false라서 삭제분과 kubectl 수정은 따로 켜야 따라간다.',
    'selfHeal은 장애 중 kubectl로 늘린 replicas도 몇 초 뒤 Git 값으로 되돌린다.',
  ];
  const review = [
    { q: 'stg 앱에 prune을 켰더니, 누군가 실수로 PVC YAML을 지운 커밋을 머지했다. 미리 막았어야 할 방법은?',
      o: ['selfHeal을 끈다', 'PVC에 Prune=false 애노테이션을 붙여 둔다', '폴링 주기를 늘린다'], a: 1,
      why: 'prune은 Git에서 사라진 리소스를 지운다. 상태를 담은 리소스는 Prune=false로 감싸 두어야 실수 커밋에도 남는다.' },
    { q: 'HPA가 붙은 Deployment의 replicas가 3과 10 사이를 계속 오간다. 먼저 의심할 것은?',
      o: ['Git의 replicas와 HPA 값을 selfHeal이 계속 맞추고 있다', '폴링 주기가 너무 짧다', 'prune이 Pod를 지우고 있다'], a: 0,
      why: 'selfHeal은 Git 값으로, HPA는 부하에 맞춰 replicas를 바꾼다. ignoreDifferences로 /spec/replicas를 빼면 루프가 끊긴다.' },
    { q: '장애 중 replicas를 20으로 늘려야 하는데 앱은 auto sync에 selfHeal이 켜져 있다. 알맞은 순서는?',
      o: ['kubectl scale만 하고 지켜본다', 'Application을 지운다', 'Git에 replicas 20을 커밋해 auto sync가 반영하게 한다'], a: 2,
      why: 'kubectl로만 바꾸면 몇 초 뒤 3으로 돌아간다. 정석은 Git이고, 정말 급하면 sync-policy none으로 잠시 끄고 나중에 되돌린다.' },
  ];

  R.page({ title: '자동 동기화 · web', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
