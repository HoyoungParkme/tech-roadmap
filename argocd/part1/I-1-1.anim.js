/* I-1-1 GitOps — Git이 소스 오브 트루스 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, person, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- Argo CD 그림 부품 ----------
  const SC = { Synced: GOOD, OutOfSync: WARN, Syncing: INFO, Unknown: MUT };
  const BG = (c) => (c === GOOD ? GOODBG : c === WARN ? WARNBG : c === INFO ? INFOBG : c === BAD ? BADBG : c === ACC ? ACCBG : SOFT);
  const val = (arr, key) => { const r = (arr || []).find((x) => x.key === key); return r ? r.val : null; };
  const num = (s, d) => { const m = s == null ? null : String(s).match(/\d+/); return m ? +m[0] : d; };
  function stat(cx, cy, s, sc) { const col = SC[s] || MUT; return pill(cx, cy, s, col, sc, { fs: 15, fill: BG(col), mono: true }); }
  function branchIcon(cx, cy, col, op) { const a = { fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op ?? 1 };
    el('path', { d: `M${cx - 5},${cy - 6} V${cy + 6} M${cx + 6},${cy - 2} Q${cx + 6},${cy + 5} ${cx - 3},${cy + 5}`, fill: 'none', stroke: col, 'stroke-width': 2, opacity: op ?? 1 });
    el('circle', Object.assign({ cx: cx - 5, cy: cy - 8, r: 3.5 }, a)); el('circle', Object.assign({ cx: cx - 5, cy: cy + 8, r: 3.5 }, a)); el('circle', Object.assign({ cx: cx + 6, cy: cy - 5, r: 3.5 }, a)); }
  // Git 저장소 판 (위에 갈래 아이콘 + 이름)
  function repo(x, y, w, h, name, o) { o = o || {}; const col = o.stroke || INK, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: op });
    branchIcon(x + 20, y + 20, col, op); mono(x + 36, y + 25, name, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: op });
    el('line', { x1: x, y1: y + 38, x2: x + w, y2: y + 38, stroke: GRID, 'stroke-width': 1.5, opacity: op }); }
  function wheel(cx, cy, r, col, op) { const a = { stroke: col, 'stroke-width': 1.8, opacity: op ?? 1 };
    el('circle', Object.assign({ cx, cy, r, fill: 'none' }, a));
    for (let i = 0; i < 7; i++) { const t = -Math.PI / 2 + i * 2 * Math.PI / 7; el('line', Object.assign({ x1: cx + Math.cos(t) * r * 0.3, y1: cy + Math.sin(t) * r * 0.3, x2: cx + Math.cos(t) * r, y2: cy + Math.sin(t) * r }, a)); }
    el('circle', Object.assign({ cx, cy, r: r * 0.3, fill: PANEL }, a)); }
  // 클러스터 판 (키잡이 바퀴 + 이름)
  function clusterBox(x, y, w, h, name, o) { o = o || {}; const col = o.stroke || INFO, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 14, fill: o.fill || INFOBG, stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: op });
    wheel(x + 22, y + 21, 10, col, op); tx(x + 40, y + 27, name, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: op }); }
  function pod(cx, cy, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op), c = o.ghost ? MUT : (o.col || GOOD);
    el('rect', { x: -20, y: -18, width: 40, height: 36, rx: 9, fill: o.ghost ? 'none' : BG(c), stroke: c, 'stroke-width': 2.2, 'stroke-dasharray': o.ghost ? '4 4' : null }, g);
    if (!o.ghost) el('rect', { x: -8, y: -7, width: 16, height: 14, rx: 3, fill: c, opacity: 0.85 }, g); }
  // n 개 파드 (소수면 마지막 하나가 자라는 중). ghost = 목표 개수까지 빈 칸
  function pods(x0, y0, n, o) { o = o || {}; const cols = o.cols || 5, gx = o.gx || 54, gy = o.gy || 50, full = Math.floor(n + 1e-6);
    const at = (i) => [x0 + (i % cols) * gx, y0 + Math.floor(i / cols) * gy];
    for (let i = 0; i < Math.max(o.ghost || 0, Math.ceil(n - 1e-6)); i++) { const [x, y] = at(i);
      if (i < full) pod(x, y, { col: o.col }); else if (i < n) pod(x, y, { col: o.col, s: n - full }); else pod(x, y, { ghost: true }); } }
  function argo(cx, cy, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op), c = o.col || ACC;
    el('rect', { x: -70, y: -30, width: 140, height: 60, rx: 14, fill: ACCBG, stroke: c, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-58,6 Q-58,-20 -42,-20 Q-26,-20 -26,6 Z', fill: PANEL, stroke: c, 'stroke-width': 2 }, g);
    [-54, -46, -38, -30].forEach((x, i) => el('path', { d: `M${x},6 q${i % 2 ? 3 : -3},8 0,14`, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-linecap': 'round' }, g));
    el('circle', { cx: -47, cy: -6, r: 2.6, fill: c }, g); el('circle', { cx: -37, cy: -6, r: 2.6, fill: c }, g);
    tx(16, 6, o.name || 'Argo CD', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: c }, g); }
  function toggle(x, y, on, label, o) { o = o || {}; const c = on > 0.5 ? GOOD : OFF;
    el('rect', { x, y: y - 11, width: 40, height: 22, rx: 11, fill: c, opacity: o.op ?? 1 });
    el('circle', { cx: x + 11 + 18 * clamp(on), cy: y, r: 8, fill: PANEL, opacity: o.op ?? 1 });
    mono(x + 50, y + 5, label, { 'font-size': o.fs || 14.5, 'font-weight': 700, fill: on > 0.5 ? INK : MUT, opacity: o.op ?? 1 }); }
  // 파일 줄: arr [text, color?], shown 개(소수면 마지막 줄 타이핑), hi(i) 강조
  function rows(x, y, arr, shown, o) { o = o || {}; const lh = o.lh || 24, fs = o.fs || 14.5;
    arr.forEach(([s, col], i) => { if (i >= Math.ceil(shown)) return; const part = i === Math.ceil(shown) - 1 && shown % 1 ? s.slice(0, Math.round(s.length * (shown % 1))) : s, hot = o.hi && o.hi(i);
      if (hot) el('rect', { x: x - 8, y: y + i * lh - fs + 1, width: o.w || 300, height: lh - 2, rx: 5, fill: ACCBG });
      mono(x, y + i * lh, part, { 'font-size': fs, fill: hot ? ACC : col || INK, 'font-weight': hot ? 700 : 400 }); }); }
  const typed = (c, a, b, t0, t1) => (c.prev == null || a === b ? b : lerp(a, b, E(c.u, t0 ?? 0.2, t1 ?? 1.6)));

  // 1. GitOps 원칙 — 정답지 파일과 클러스터
  const F1 = [['# 원하는 상태 = 정답지', MUT], ['apiVersion: apps/v1'], ['kind: Deployment'], ['metadata:'], ['  name: web'], ['  namespace: web'], ['spec:'], ['  replicas: 3'], ['  … image: web:v1.0']];
  const SH1 = [1, 6, 8, 9, 9, 9], HI1 = [[0], [1, 2, 3, 4, 5], [6, 7], [8], [], []];
  function s1(t, c) { const { k, u } = c, b = c.beat;
    repo(40, 30, 360, 270, 'deployment.yaml');
    rows(60, 96, F1, typed(c, SH1[k - 1] ?? 0, SH1[k]), { hi: (i) => HI1[k].includes(i), w: 320, lh: 23 });
    const comp = k === 0 ? 0 : 1;
    clusterBox(580, 30, 340, 270, k >= 1 ? '클러스터 · ns web' : '클러스터', { dash: k === 0 ? '6 5' : null, op: k === 0 ? 0.7 : 1 });
    if (k === 0) sub(750, 170, '아직 비교 전', fade(u, 0.6), { 'font-size': 15, 'font-weight': 700 });
    const want = k >= 2 ? 3 : 0, have = tween(num(val(c.prev && c.prev.cluster, 'replicas'), 0), num(val(b.cluster, 'replicas'), 0), u);
    if (k >= 1) { pods(696, 140, have, { ghost: want, gx: 54 });
      mono(750, 214, `replicas  ${Math.round(have)} / ${want || '?'}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: have < want ? WARN : INK, opacity: comp });
      const img = val(b.cluster, 'image'); mono(750, 244, `image  ${img || '—'}`, { 'font-size': 14.5, 'text-anchor': 'middle', fill: img && img !== '—' ? INK : MUT }); }
    tx(490, 44, 'Sync', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    stat(490, 72, b.syncStatus, k === 0 ? pop(u, 0.8) : 1);
    if (k === 4) { grow(404, 165, 574, 165, E(u, 0.2, 0.9), ACC, { sw: 3 }); for (let i = 0; i < 3; i++) dot([[404, 165], [574, 165]], seg(u, 0.5 + i * 0.25, 1.4 + i * 0.25), ACC, 5);
      ['① 선언적', '② Git 단일 진실', '③ 자동 동기화', '④ 지속적 조정'].forEach((s, i) => pill(130 + i * 233, 352, s, ACC, pop(u, 0.4 + i * 0.4), { fs: 15 })); }
    if (k === 5) { const s1 = pop(u, 0.2), s2 = pop(u, 1.0);
      card(250, 350, 410, 62, { rx: 10, stroke: BAD, s: s1 }); cross(66, 350, 9, s1);
      mono(90, 345, 'kubectl scale deploy/web --replicas=5', { 'font-size': 14, opacity: fade(u, 0.3) }); tx(90, 368, '그 순간뿐, Git에 흔적이 없다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      card(710, 350, 410, 62, { rx: 10, stroke: GOOD, s: s2 }); check(526, 350, 10, s2);
      tx(550, 345, '커밋 → 리뷰 → merge → 자동 반영', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1) }); tx(550, 368, '누가·왜·언제가 커밋 로그에 남는다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) }); } }

  // 2. push 방식 vs pull 방식
  function s2(t, c) { const { k, u } = c;
    if (k === 5) { // CI / CD 역할 분리
      zone(30, 40, 430, 290, 'CI — 빌드와 커밋까지', { fill: SOFT }); zone(500, 40, 430, 290, 'CD — Argo CD가 반영', { fill: ACCBG, color: ACC });
      const A = [['코드 빌드', 245, 100], ['이미지 태그', 245, 170], ['매니페스트 태그를 Git에 커밋', 245, 240], ['커밋 감지', 715, 135], ['클러스터에 pull 반영', 715, 215]];
      A.forEach(([s, x, y], i) => card(x, y, i === 2 ? 300 : 230, 46, { rx: 23, text: s, fs: 15, fw: 700, stroke: i < 3 ? INK : ACC, color: i < 3 ? INK : ACC, s: pop(u, 0.2 + i * 0.3) }));
      const route = [[245, 100], [245, 170], [245, 240], [480, 240], [715, 135], [715, 215]]; dot(route, seg(u, 0.6, 2.5), ACC, 7);
      el('line', { x1: 480, y1: 50, x2: 480, y2: 330, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '8 6', opacity: fade(u, 1.6) });
      tx(480, 372, 'CI 사고가 배포 권한 사고로 번지지 않는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    const topOp = k >= 3 ? 0.35 : 1;
    // 위: push
    tx(30, 30, 'push', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: topOp });
    repo(30, 72, 130, 76, 'Git', { op: topOp }); sub(95, 130, 'git push', topOp);
    card(330, 110, 160, 60, { rx: 12, text: 'CI 파이프라인', fs: 15, fw: 700, op: topOp });
    clusterBox(600, 48, 320, 124, '클러스터', { op: topOp }); [0, 1, 2].forEach((i) => pod(700 + i * 60, 118, { op: topOp }));
    grow(162, 110, 248, 110, k === 0 ? E(u, 0.2, 0.7) : 1, MUT, { op: topOp }); grow(412, 110, 596, 110, k === 0 ? E(u, 0.8, 1.4) : 1, k < 3 ? BAD : MUT, { op: topOp });
    mono(504, 98, 'kubectl apply', { 'font-size': 14, 'text-anchor': 'middle', fill: k < 3 ? BAD : MUT, opacity: k === 0 ? fade(u, 1.2) : topOp });
    if (k === 0) dot([[162, 110], [248, 110], [412, 110], [596, 110]], seg(u, 1.4, 2.5), BAD, 7);
    if (k >= 1) { lock(330, 168, true, BAD, k === 1 ? pop(u, 0.2) : 1); if (k < 3) sub(330, 205, 'kubeconfig (관리자급)', k === 1 ? fade(u, 0.4) : 1, { fill: BAD, 'font-weight': 700 }); }
    if (k === 1 || k === 2) { tx(760, 196, 'apply 뒤 변화는 아무도 안 본다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: k === 1 ? fade(u, 1.2) : 1 }); }
    if (k === 2) { snippet(140, 250, ['- uses: actions/checkout@v4', '- run: kubectl apply -f k8s/ --kubeconfig=$KUBECONFIG'], { op: fade(u, 0.3) });
      pill(480, 370, 'KUBECONFIG가 CI 시크릿에 상주 → 공격 표면', BAD, pop(u, 1.2), { fs: 14.5 }); }
    if (k >= 4) cross(330, 168, 14, k === 4 ? pop(u, 0.2) : 1);
    if (k >= 3) { // 아래: pull
      tx(30, 222, 'pull', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      repo(30, 270, 130, 76, 'Git'); clusterBox(290, 228, 630, 180, '클러스터', { stroke: ACC, fill: ACCBG });
      argo(450, 318, { s: k === 3 ? pop(u, 0.2) : 1 }); [0, 1, 2].forEach((i) => pod(740 + i * 60, 318, {}));
      grow(378, 304, 166, 304, k === 3 ? E(u, 0.6, 1.2) : 1, ACC, { dash: '6 5', sw: 2.5 }); mono(272, 292, 'watch · pull', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: k === 3 ? fade(u, 1.0) : 1 });
      dot([[166, 304], [378, 304]], ((t * 0.5) % 1), ACC, 6);
      grow(522, 318, 710, 318, k === 3 ? E(u, 1.2, 1.7) : 1, ACC); mono(615, 306, 'apply', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: k === 3 ? fade(u, 1.5) : 1 });
      lock(450, 378, true, ACC, k === 3 ? pop(u, 1.6) : 1); tx(470, 384, '자격증명은 클러스터 안에만', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 1.8) : 1 }); }
    if (k === 4) { pill(330, 206, 'CI에 kube 권한 불필요', GOOD, pop(u, 0.4), { fs: 14.5 });
      el('path', { d: 'M470,288 Q480,262 600,262 Q780,262 800,296', fill: 'none', stroke: GOOD, 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.9) });
      pill(700, 262, 'Git과 실제를 늘 비교 → 드리프트 보임', GOOD, pop(u, 1.2), { fs: 14 }); } }

  // 3. Reconciliation 루프
  const NODE = { git: [700, 68, 'OBSERVE\nGit'], cl: [852, 215, 'OBSERVE\n클러스터'], diff: [700, 362, 'DIFF\n비교'], act: [548, 215, 'ACT\nsync'] };
  function ring(hot, op) { el('circle', { cx: 700, cy: 215, r: 150, fill: 'none', stroke: GRID, 'stroke-width': 3, 'stroke-dasharray': '2 7', opacity: op });
    Object.entries(NODE).forEach(([key, [x, y, s]]) => card(x, y, 126, 52, { rx: 12, text: s, fs: 14, fw: 700, stroke: hot === key ? ACC : GRID, color: hot === key ? ACC : INK, fill: hot === key ? ACCBG : PANEL, sw: hot === key ? 2.8 : 1.8, op })); }
  function s3(t, c) { const { k, u } = c;
    el('rect', { x: 30, y: 30, width: 380, height: 362, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(50, 60, 'Application  web', { 'font-size': 16, 'font-weight': 800, fill: ACC }); tx(50, 84, 'ns argocd · project default', { 'font-size': 13.5, fill: MUT });
    const SRC = [['source:'], ['  repoURL: acme/web-gitops.git'], ['  targetRevision: main'], ['  path: k8s']], DST = [['destination:'], ['  server: kubernetes.default.svc'], ['  namespace: web']];
    if (k >= 1) rows(50, 120, SRC, k === 1 ? lerp(0, 4, E(u, 0.2, 1.2)) : 4, { hi: () => k === 1, w: 350, fs: 14, lh: 23 });
    if (k >= 2) rows(50, 222, DST, k === 2 ? lerp(0, 3, E(u, 0.2, 1.0)) : 3, { hi: () => k === 2, w: 350, fs: 14, lh: 23 });
    if (k >= 3) { mono(50, 306, 'syncPolicy.automated:', { 'font-size': 14, fill: k === 3 ? ACC : INK, 'font-weight': k === 3 ? 700 : 400 });
      [['automated', 46], ['prune', 186], ['selfHeal', 288]].forEach(([s, x], i) => toggle(x, 336, k === 3 ? E(u, 0.3 + i * 0.4, 0.7 + i * 0.4) : 1, s, { fs: 14 }));
      tx(56, 372, '자동 sync + 삭제 반영 + 수동 변경 원복', { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 1.5) : 1 }); }
    if (k === 5) { terminal(470, 60, 460, 220, ['$ argocd app get web', ['Sync Status:   OutOfSync', '#fbbf24'], '  (replicas 3 != 5, image v1.0 != v1.1)', ['Health Status: Progressing', '#7dd3fc']], lerp(0, 4, E(u, 0.2, 1.8)), { title: 'argocd CLI', fs: 14 });
      sub(700, 300, '출력은 예시', fade(u, 1.8)); stat(600, 350, 'OutOfSync', pop(u, 2.0)); pill(800, 350, 'Progressing', INFO, pop(u, 2.2), { fs: 15, fill: INFOBG, mono: true }); return; }
    const hot = k === 0 ? null : k === 1 ? 'git' : k === 2 ? 'cl' : k === 3 ? 'act' : ['git', 'cl', 'diff', 'act'][Math.floor((t * 1.1) % 4)];
    ring(hot, k === 0 ? fade(u, 0.3) : 1);
    if (k === 0) { grow(412, 150, 560, 100, E(u, 0.8, 1.4), ACC, { dash: '5 4' }); sub(700, 220, 'Git과 클러스터를 잇는 조정 단위', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 1) fly(230, 140, 700, 68, seg(u, 0.9, 2.0), 'acme/web-gitops · main · k8s', { mono: true });
    if (k === 2) fly(230, 280, 852, 280, seg(u, 0.9, 2.0), 'in-cluster · ns web', { mono: true, stay: true });
    if (k === 3) { grow(412, 330, 500, 250, E(u, 1.2, 1.7), ACC); sub(700, 220, '정책이 켜져야 루프가 실제로 맞춘다', fade(u, 1.6), { 'font-weight': 700 }); }
    if (k === 4) { const a = -Math.PI / 2 + ((t * 1.1) % 4) * Math.PI / 2; el('circle', { cx: 700 + Math.cos(a) * 150, cy: 215 + Math.sin(a) * 150, r: 9, fill: ACC });
      mono(780, 40, 'replicas 5 · web:v1.1', { 'font-size': 13.5, fill: INK, opacity: fade(u, 0.3) }); mono(852, 262, 'replicas 3 · v1.0', { 'font-size': 13.5, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(700, 200, '약 3분마다 + 웹훅', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
      tx(700, 232, '2곳 다름 → OutOfSync', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.4) }); } }

  // 4. 드리프트 감지·복구
  function s4(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const gNow = num(val(b.git, 'replicas'), 3), gPrev = num(val(p.git, 'replicas'), gNow);
    const cNow = num(val(b.cluster, 'replicas'), 3), cPrev = num(val(p.cluster, 'replicas'), cNow), have = tween(cPrev, cNow, u, 1.4);
    repo(40, 40, 270, 250, k === 5 ? 'web-gitops · scale-up' : 'web-gitops · main', { stroke: k === 5 ? ACC : INK });
    mono(175, 150, 'replicas: ' + Math.round(tween(gPrev, gNow, u)), { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 5 ? ACC : INK });
    mono(175, 186, 'image: web:v1.0', { 'font-size': 14.5, 'text-anchor': 'middle', fill: MUT });
    if (k === 5) { mono(175, 230, 'feat: web replicas 3 -> 10', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) }); sub(175, 256, 'main은 아직 3 (merge 대기)', fade(u, 1.2), { 'font-weight': 700 }); }
    clusterBox(610, 40, 310, 250, '클러스터 · ns web');
    pods(660, 110, have, { cols: 5, gx: 52, gy: 54, col: cNow > gNow && k < 3 ? WARN : GOOD });
    mono(765, 268, 'replicas ' + Math.round(have), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: Math.round(have) !== 3 ? WARN : INK });
    el('line', { x1: 312, y1: 165, x2: 388, y2: 165, stroke: GRID, 'stroke-width': 2.5 }); el('line', { x1: 532, y1: 165, x2: 606, y2: 165, stroke: GRID, 'stroke-width': 2.5 });
    argo(460, 165); stat(460, 66, b.syncStatus, 1);
    if (k === 1) { person(450, 360, null, { s: pop(u, 0.2) }); terminal(500, 318, 440, 84, ['$ kubectl scale deployment/web -n web --replicas=10'], lerp(0, 1, E(u, 0.3, 1.0)), { fs: 13.5 });
      grow(720, 316, 740, 296, E(u, 1.0, 1.3), BAD); sub(175, 330, 'Git에는 흔적 없음', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: BAD }); }
    if (k === 2) { el('path', { d: 'M412,130 Q420,110 330,110', fill: 'none', stroke: WARN, 'stroke-width': 2.2, opacity: fade(u, 0.2) }); el('path', { d: 'M508,130 Q500,110 600,110', fill: 'none', stroke: WARN, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
      card(460, 232, 150, 44, { rx: 10, text: '10 ≠ 3', fs: 20, fw: 800, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.6) });
      sub(460, 330, '루프가 diff에서 어긋남을 잡는다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 3) { grow(532, 165, 606, 165, E(u, 0.1, 0.5), ACC, { sw: 3.5 }); pill(460, 232, 'selfHeal', GOOD, pop(u, 0.2), { fs: 15, mono: true });
      sub(460, 330, '사람이 sync를 누르지 않아도 Git 값으로', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700, fill: GOOD }); }
    if (k === 4) { const s1 = pop(u, 0.2), s2 = pop(u, 0.9);
      card(250, 360, 410, 58, { rx: 10, stroke: BAD, s: s1 }); cross(70, 360, 9, s1); tx(92, 366, 'kubectl edit / scale → 곧 원복된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      card(710, 360, 410, 58, { rx: 10, stroke: GOOD, s: s2 }); check(530, 360, 10, s2); tx(552, 366, 'Git 커밋 → PR → merge', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); }
    if (k === 5) pill(765, 340, '클러스터는 merge 뒤에 10이 된다', ACC, pop(u, 1.6), { fs: 14.5 });
    if (k === 6) { const on = u < 0.4 ? 1 : u < 0.7 ? 1 - E(u, 0.4, 0.7) : u < 1.8 ? 0 : E(u, 1.8, 2.1);
      toggle(380, 350, on, 'selfHeal: ' + (on > 0.5 ? 'true' : 'false'), { fs: 15 });
      tx(380, 392, '손으로 실험할 때만 잠깐 끄고, 끝나면 다시 켠다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5) }); } }

  // 5. GitOps의 이득 — 감사·롤백·리뷰·재현
  const LOG = [['a1b2c3d', 'feat: image web:v1.1 배포'], ['9f8e7d6', 'feat: replicas 3 -> 5'], ['3c2b1a0', 'fix: 헬스체크 경로 수정']];
  function s5(t, c) { const { k, u } = c, b = c.beat;
    el('rect', { x: 30, y: 30, width: 480, height: 250, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(48, 58, '$ git log --oneline k8s/deployment.yaml', { 'font-size': 14, fill: MUT });
    const rev = k >= 1 && k !== 3, sh = rev ? (k === 1 ? E(u, 0.2, 0.9) : 1) : 0;
    if (rev) { const y = 100, sh2 = sh; { const sh = clamp((sh2 - 0.75) * 4); el('rect', { x: 40, y: y - 22, width: 460, height: 34, rx: 6, fill: GOODBG, opacity: sh }); tx(52, y, '(새 커밋)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: sh }); tx(170, y, 'Revert a1b2c3d → v1.0 복귀', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: sh }); } }
    LOG.forEach(([h, m], i) => { const y = 100 + (i + sh) * 44, op = k === 0 ? fade(u, 0.2 + i * 0.35) : 1, bad = i === 0 && k >= 1;
      mono(52, y, h, { 'font-size': 14.5, 'font-weight': 700, fill: bad ? BAD : ACC, opacity: op }); tx(170, y, m, { 'font-size': 14.5, fill: bad ? BAD : INK, opacity: op, 'text-decoration': bad && k !== 3 ? 'line-through' : null }); });
    if (k === 0) sub(270, 262, '누가·언제·왜가 별도 대시보드 없이 보인다', fade(u, 1.5), { 'font-weight': 700 });
    // 클러스터
    const ver = k <= 1 ? 'v1.1' : k === 6 ? (u < 1.2 ? 'v1.1' : 'v1.0') : 'v1.0', col = ver === 'v1.1' ? ACC : GOOD;
    clusterBox(560, 30, 370, 250, '클러스터 · ns web');
    const swap = k === 2 ? E(u, 0.8, 2.0) : 1;
    [0, 1, 2].forEach((i) => pod(665 + i * 80, 130, { col: k === 2 ? (i < swap * 3 ? GOOD : ACC) : col }));
    mono(745, 200, k === 3 ? 'rev 42' : 'web:' + (k === 2 && swap < 0.5 ? 'v1.1' : ver), { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 3 ? INFO : col });
    stat(745, 248, b.syncStatus, 1);
    if (k === 2 || k === 6) dot([[510, 100], [560, 130], [665, 130]], seg(u, 0.2, 0.9), ACC, 7);
    if (k === 3) { terminal(40, 300, 470, 104, ['$ argocd app history web', '$ argocd app rollback web 42'], lerp(0, 2, E(u, 0.2, 1.4)), { fs: 14 });
      card(735, 352, 380, 70, { rx: 10, stroke: WARN, fill: WARNBG, text: '자동 sync가 켜진 앱은\n먼저 자동 sync를 꺼야 한다', fs: 14.5, s: pop(u, 1.5) }); }
    if (k === 4) { person(120, 350, null, { s: pop(u, 0.2) }); person(190, 350, null, { s: pop(u, 0.45) }); check(250, 348, 12, pop(u, 0.9));
      tx(280, 355, 'PR 승인 = 배포 승인 (four-eyes)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      pill(745, 350, '몰래 하는 배포는 없다', GOOD, pop(u, 1.5), { fs: 15 }); }
    if (k === 5) { terminal(40, 300, 470, 76, ['$ git checkout 3c2b1a0 -- k8s/'], lerp(0, 1, E(u, 0.2, 0.9)), { fs: 14 });
      grow(512, 338, 590, 338, E(u, 1.0, 1.4), ACC); clusterBox(600, 300, 320, 76, '그 시점 복제 · DR / 스테이징', { stroke: GOOD, fill: GOODBG, op: fade(u, 1.3) }); }
    if (k === 6) banner(480, 355, 'Git(원하는 상태) ⇄ 비교·조정 ⇄ 클러스터(실제 상태)', pop(u, 0.3));
    if (k === 1) sub(745, 330, 'Git만 되돌린 순간, 클러스터는 아직 v1.1', fade(u, 1.0), { 'font-size': 15, 'font-weight': 700, fill: WARN }); }

  // 6. 실무 함정 4가지
  const TRAPS = ['① 드리프트', '② 평문 시크릿', '③ 느린 조정 주기', '④ 과도한 권한'];
  function s6(t, c) { const { k, u } = c, act = Math.floor(k / 2);
    TRAPS.forEach((s, i) => { const on = i === act && k < 8, done = i < act || k === 8 || (i === act && k % 2 === 1);
      card(125 + i * 236, 40, 216, 40, { rx: 20, text: s, fs: 15, fw: 700, stroke: on && !done ? BAD : done ? GOOD : GRID, color: on && !done ? BAD : done ? GOOD : MUT, fill: on && !done ? BADBG : done ? GOODBG : PANEL, sw: on ? 2.6 : 1.6 }); });
    if (k === 0 || k === 1) { repo(60, 130, 260, 150, 'Git · 정답'); mono(190, 215, 'replicas: 3', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle' });
      clusterBox(640, 130, 280, 150, '클러스터'); mono(780, 215, k === 0 ? '손으로 바꾼 값' : 'Git 값으로 원복', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: k === 0 ? BAD : GOOD });
      if (k === 0) { person(780, 350, null, { s: pop(u, 0.2) }); mono(820, 356, 'kubectl edit', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 0.4) }); grow(780, 318, 780, 286, E(u, 0.6, 1.0), BAD);
        card(480, 205, 110, 48, { rx: 10, text: '≠', fs: 26, fw: 800, stroke: BAD, color: BAD, s: pop(u, 1.2) }); sub(480, 262, '방치되면 다음 배포 때 사라진다', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); }
      else { snippet(230, 320, ['automated: { selfHeal: true, prune: true }'], { op: fade(u, 0.2) }); grow(324, 205, 636, 205, E(u, 0.7, 1.4), GOOD, { sw: 3 }); mono(480, 192, '자동 원복', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) }); }
      return; }
    if (k === 2) { el('rect', { x: 60, y: 120, width: 360, height: 150, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      rows(80, 156, [['kind: Secret'], ['data:'], ['  db-password: c2VjcmV0', BAD]], lerp(0, 3, E(u, 0.2, 1.0)), { fs: 15, lh: 30 });
      grow(430, 196, 560, 196, E(u, 1.1, 1.6), BAD); mono(495, 182, 'base64 -d', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.2) });
      card(680, 196, 200, 60, { rx: 10, text: 'secret', fs: 22, fw: 800, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.6) });
      tx(480, 320, 'base64는 암호화가 아니다. 저장소가 곧 유출 경로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); sub(680, 248, '값은 예시', fade(u, 1.8)); return; }
    if (k === 3) { const N = [['평문 값', 110], ['kubeseal\n(공개키)', 330], ['Git: SealedSecret\nAgBy3i4OJ…', 580], ['클러스터 안에서\n복호화 → Secret', 830]];
      N.forEach(([s, x], i) => { card(x, 200, i === 2 ? 220 : 170, 70, { rx: 12, text: s, fs: 14.5, fw: 700, mono: i === 2, stroke: i === 0 ? BAD : i === 3 ? GOOD : ACC, s: pop(u, 0.2 + i * 0.45) }); if (i) grow(N[i - 1][1] + (i === 3 ? 112 : 88), 200, x - (i === 2 ? 112 : 88), 200, E(u, 0.5 + i * 0.45, 0.8 + i * 0.45), ACC); });
      lock(330, 262, true, ACC, pop(u, 0.8)); tx(480, 320, 'Git에는 암호문만, 실제 값은 Vault·KMS에 두는 방법도 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 4 || k === 5) { const X = (s) => 120 + s / 180 * 720, y = 250;
      el('line', { x1: X(0), y1: y, x2: X(180) + 30, y2: y, stroke: MUT, 'stroke-width': 2 }); [0, 60, 120, 180].forEach((s) => { el('line', { x1: X(s), y1: y, x2: X(s), y2: y + 6, stroke: MUT }); mono(X(s), y + 24, s + 's', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); });
      el('rect', { x: X(120), y: y - 50, width: X(180) - X(120), height: 44, rx: 6, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, opacity: k === 5 ? 0.4 : fade(u, 0.8) });
      tx((X(120) + X(180)) / 2, y - 22, '120s + 지터 ≤60s', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: k === 5 ? 0.4 : fade(u, 1.0) });
      pill(X(0), y - 70, 'git push (핫픽스)', ACC, 1, { fs: 14 }); grow(X(0), y - 52, X(0), y - 4, 1, ACC);
      if (k === 4) { dot([[X(0), y - 10], [X(150), y - 10]], seg(u, 0.4, 2.2), WARN, 7); tx(480, 340, '평소엔 최대 3분 늦게 반영된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) }); }
      else { el('path', { d: `M${X(0) + 6},${y - 40} l14,10 l-8,4 l14,12`, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.3) });
        pill(X(12) + 70, y - 30, 'POST /api/webhook → 즉시 sync', GOOD, pop(u, 0.5), { fs: 14, mono: true });
        tx(480, 340, '평소 반영은 웹훅이, 폴링은 안전망으로', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
        sub(480, 370, '웹훅 키는 argocd-secret의 webhook.github.secret', fade(u, 1.8)); }
      return; }
    if (k === 6 || k === 7) { argo(190, 135);
      const NS = ['ns web', '다른 팀 ns', '다른 팀 ns', 'kube-system'];
      if (k === 7) { el('rect', { x: 70, y: 98, width: 750, height: 74, rx: 18, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '10 6', opacity: fade(u, 0.2) });
        tx(84, 200, 'AppProject team-web', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.4) });
        mono(84, 226, 'sourceRepos: web-gitops.git만', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.0) }); mono(84, 250, 'destinations: ns web만', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.2) }); }
      NS.forEach((name, i) => { const x = 710, y = 135 + i * 72, ok = k === 7 && i === 0, off = k === 7 && i > 0, s0 = k === 6 ? pop(u, 0.2 + i * 0.25) : 1;
        if (!off) grow(262, 135, x - 104, y, k === 6 ? E(u, 0.4 + i * 0.25, 0.8 + i * 0.25) : 1, ok ? GOOD : BAD);
        card(x, y, 200, 52, { rx: 10, text: name + (k === 6 ? ' · admin' : ''), fs: 14.5, fw: 700, mono: true, stroke: ok ? GOOD : off ? GRID : BAD, color: off ? MUT : ok ? GOOD : BAD, s: s0, op: off ? 0.55 : 1 });
        if (off) lock(x + 126, y, true, MUT, pop(u, 0.6 + i * 0.2)); });
      if (k === 6) tx(330, 330, '실수 하나가 전면 사고가 된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      return; }
    // k === 8 체크리스트
    [['selfHeal · prune', '드리프트'], ['시크릿 암호화', 'Sealed·SOPS·External'], ['Git 웹훅', '반영 속도'], ['AppProject', '권한 울타리']].forEach(([a, bb], i) => {
      const x = 125 + i * 236, s = pop(u, 0.2 + i * 0.3); card(x, 220, 216, 150, { rx: 12, stroke: GOOD, sw: 2.2, s }); check(x, 180, 16, s);
      tx(x, 236, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) }); tx(x, 262, bb, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
    tx(480, 360, '도입 초기에 이 넷을 잡으면 운영이 편해진다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: 'GitOps에서 클러스터가 따라가야 하는 정답은 무엇인가?',
      o: ['마지막으로 실행한 kubectl 명령', 'Git에 커밋된 매니페스트', '지금 클러스터에 떠 있는 상태'], a: 1,
      why: 'Git에 선언한 원하는 상태가 정답지다. replicas 3과 web:v1.0을 적어 두면 클러스터는 그 값으로 맞춰진다.' },
    { q: 'push 방식과 비교해 pull 방식이 안전한 가장 큰 이유는 무엇인가?',
      o: ['배포 속도가 항상 더 빠르다', 'CI가 빌드를 하지 않아도 된다', '클러스터 자격증명이 클러스터 밖으로 나가지 않는다'], a: 2,
      why: 'pull 방식은 클러스터 안의 Argo CD가 Git을 당겨 온다. CI는 관리자급 kubeconfig를 들 필요가 없다.' },
    { q: '조정 루프에서 Git과 클러스터가 다를 때 붙는 표시는 무엇인가?',
      o: ['OutOfSync', 'Degraded', 'Missing'], a: 0,
      why: 'DIFF에서 replicas 5와 3, v1.1과 v1.0이 다르면 OutOfSync다. 그다음이 ACT(sync)다.' },
    { q: 'selfHeal이 켜진 앱에서 누군가 kubectl scale로 replicas를 10으로 바꾸면 어떻게 되나?',
      o: ['10이 새 정답으로 Git에 기록된다', 'Argo CD가 Git 값 3으로 되돌린다', '사람이 sync를 눌러야만 3이 된다'], a: 1,
      why: 'selfHeal은 Git에 없는 변경을 드리프트로 보고 자동으로 원복한다. 바꾸고 싶으면 커밋으로 남겨야 한다.' },
    { q: 'v1.1 배포에 문제가 생겼을 때 GitOps다운 롤백은 무엇인가?',
      o: ['문제 커밋을 git revert하고 push 한다', '클러스터에서 이미지를 직접 v1.0으로 고친다', 'Argo CD를 지웠다가 다시 설치한다'], a: 0,
      why: 'revert 커밋이 Git의 원하는 상태를 v1.0으로 돌리고, Argo CD가 그 커밋을 감지해 클러스터를 맞춘다. 롤백도 리뷰 가능한 기록이 된다.' },
    { q: 'Secret을 base64로만 인코딩해 Git에 올리면 생기는 문제는 무엇인가?',
      o: ['Argo CD가 Secret을 인식하지 못한다', 'base64는 누구나 풀 수 있어 사실상 평문 노출이다', '클러스터에서 복호화가 실패한다'], a: 1,
      why: 'base64는 암호화가 아니다. Sealed Secrets, SOPS, External Secrets로 암호문이나 참조만 Git에 둔다.' },
  ];

  const summary = [
    '클러스터를 손으로 고치면 이유도 기록도 남지 않는다.',
    'Git에 원하는 상태를 적어 두면 Argo CD가 클러스터를 그 값으로 맞춘다.',
    '클러스터 안의 Argo CD가 당겨 오므로 CI에 kube 권한을 줄 필요가 없다.',
    '조정 루프는 약 3분마다 돌고, selfHeal이 수동 변경을 되돌리며 롤백은 git revert로 한다.',
  ];
  const review = [
    { q: '장애 중 kubectl scale로 replicas를 10으로 올렸는데 몇 초 뒤 다시 3이 됐다. 먼저 확인할 것은?',
      o: ['노드 자원이 모자란지', '그 앱에 selfHeal이 켜져 있는지', 'CI 파이프라인이 실패했는지'], a: 1,
      why: 'selfHeal은 Git에 없는 변경을 원복한다. 유지하려면 replicas 10을 Git에 커밋해야 한다.' },
    { q: '핫픽스를 push 했는데 클러스터 반영까지 2~3분이 걸린다. 가장 알맞은 조치는?',
      o: ['CI에 kubeconfig를 주고 kubectl apply 하게 한다', 'selfHeal을 끈다', 'Git 웹훅을 걸어 push 즉시 sync 되게 한다'], a: 2,
      why: '기본 폴링은 120초에 최대 60초 지터라 최대 3분이 걸린다. 웹훅을 걸면 push 즉시 반영되고 폴링은 안전망이 된다.' },
    { q: 'CI 러너가 해킹당했다. 피해가 클러스터까지 번질 가능성이 큰 구성은?',
      o: ['CI가 KUBECONFIG 시크릿으로 kubectl apply 하는 push 방식', 'CI는 태그만 커밋하고 Argo CD가 당겨 가는 pull 방식', 'AppProject로 web ns만 허용한 구성'], a: 0,
      why: 'push 방식은 관리자급 자격증명이 CI에 있다. pull 방식은 자격증명이 클러스터 안에만 있어 사고 범위가 갈린다.' },
  ];

  R.page({ title: 'GitOps 조정 루프', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
