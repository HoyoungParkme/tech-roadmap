/* I-1-2 Application — 핵심 리소스 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
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


  const HC = { Healthy: GOOD, Progressing: INFO, Degraded: BAD, Missing: WARN, Suspended: MUT };
  const KC = { source: ACC, dest: INFO, project: INK, policy: GOOD };

  // 1. Application = 배송 주문서
  const SLOT = [['source', '무엇을', 'repo · path · revision', '어떤 상품을 (창고 = Git)'], ['destination', '어디에', 'cluster + namespace', '어디로 배송 (클러스터/ns)'],
    ['project', '어떤 울타리', 'AppProject', '배송 가능 구역'], ['syncPolicy', '어떻게', '자동 / 수동 sync', '자동 재배송 여부']];
  function slot(i, f, text, o) { o = o || {}; const y = 122 + i * 50, col = KC[['source', 'dest', 'project', 'policy'][i]];
    el('rect', { x: 300, y: y - 20, width: 360, height: 40, rx: 8, fill: f > 0 ? BG(col) : PANEL, stroke: f > 0 ? col : GRID, 'stroke-width': f > 0 ? 2 : 1.5, 'stroke-dasharray': f > 0 ? null : '5 4' });
    mono(314, y + 5, SLOT[i][0], { 'font-size': 14.5, 'font-weight': 800, fill: col });
    if (f > 0) tx(424, y + 5, text, { 'font-size': 14, fill: INK, opacity: f }); }
  function s1(t, c) { const { k, u } = c;
    repo(30, 130, 210, 150, 'Git repo'); [0, 1, 2].forEach((i) => mono(52, 196 + i * 24, ['deployment.yaml', 'service.yaml', 'ingress.yaml'][i], { 'font-size': 13.5, fill: MUT }));
    clusterBox(720, 130, 210, 150, '클러스터'); [0, 1, 2].forEach((i) => pod(770 + i * 55, 215, {}));
    const g = k === 0 ? pop(u, 0.2) : 1, doc = R.G(480, 215, g);
    el('rect', { x: -195, y: -190, width: 390, height: 380, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, doc);
    mono(-175, -158, 'kind: Application', { 'font-size': 16, 'font-weight': 800, fill: ACC }, doc); tx(175, -158, 'CRD', { 'font-size': 14, 'font-weight': 800, fill: MUT, 'text-anchor': 'end' }, doc);
    if (k === 0 && u < 0.7) return;
    SLOT.forEach((s, i) => { const f = k === 0 ? 0 : k === 1 ? (i === 0 ? E(u, 0.3, 0.9) : 0) : k === 2 && i > 0 ? E(u, 0.2 + i * 0.35, 0.6 + i * 0.35) : 1;
      slot(i, f, k === 4 ? s[3] : k >= 3 ? s[1] : s[2]); });
    el('line', { x1: 300, y1: 330, x2: 660, y2: 330, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    mono(314, 356, 'status', { 'font-size': 14.5, 'font-weight': 800, fill: MUT });
    if (k >= 3) { const s = k === 3 ? pop(u, 0.6) : 1; pill(470, 356, 'sync', GOOD, s, { fs: 14, mono: true, fill: GOODBG }); pill(580, 356, 'health', INFO, s, { fs: 14, mono: true, fill: INFOBG });
      if (k === 3) { argo(825, 310, { s: 0.75 * pop(u, 0.2) }); sub(825, 360, 'spec은 사람이,', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700 }); sub(825, 382, 'status는 컨트롤러가 쓴다', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700 }); } }
    if (k === 0) { grow(242, 205, 284, 205, E(u, 0.6, 1.0), ACC); grow(676, 205, 716, 205, E(u, 0.9, 1.3), ACC); sub(825, 316, '선언 하나로 계속 동기화', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 1) grow(242, 160, 296, 122, E(u, 0.2, 0.7), ACC, { sw: 3 });
    if (k === 2) grow(664, 172, 716, 190, E(u, 0.5, 0.9), INFO, { sw: 3 });
    if (k === 4) { dot([[240, 205], [300, 122], [660, 172], [720, 205]], seg(u, 0.4, 2.4), ACC, 8); sub(135, 306, '창고', 1, { 'font-size': 15, 'font-weight': 700 }); sub(825, 306, '받는 집', 1, { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 5) { ['$ kubectl apply -f …', '$ kubectl apply -f …', '$ kubectl apply -f …'].forEach((s, i) => { mono(36, 330 + i * 26, s, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.2 + i * 0.2) }); });
      el('line', { x1: 30, y1: 345, x2: 230, y2: 345, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.0) }); el('line', { x1: 30, y1: 370, x2: 230, y2: 370, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.0) });
      el('path', { d: 'M790,300 A40,24 0 1 0 870,300', fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.4), 'marker-end': 'url(#ra-ah)' });
      sub(825, 350, 'self-heal로 상태 복원', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: GOOD }); } }

  // 2. spec.source
  const Y2 = [['kind: Application'], ['metadata:'], ['  name: web-app'], ['  namespace: argocd'], ['spec:'], ['  source:'], ['    repoURL: …/acme/web.git'], ['    path: k8s/overlays/prd'],
    ['    targetRevision: v2.3.1'], ['    kustomize:'], ['      images: [acme/web:v2.3.1]'], ['    # helm: …  (택1)', MUT]];
  const SH2 = [5, 7, 9, 11, 12, 12, 12], HI2 = [[2, 3], [5, 6], [7, 8], [9, 10], [9, 11], [8], [8]];
  // 커밋 줄: 6개 점, tip 이 움직인다
  function commits(n, o) { o = o || {}; const X = (i) => 520 + i * 70, y = o.y || 230;
    el('line', { x1: X(0), y1: y, x2: X(n - 1), y2: y, stroke: GRID, 'stroke-width': 3 });
    for (let i = 0; i < n; i++) el('circle', { cx: X(i), cy: y, r: 9, fill: PANEL, stroke: o.red && i === n - 1 ? BAD : INK, 'stroke-width': 2.5 });
    return X; }
  function s2(t, c) { const { k, u } = c;
    el('rect', { x: 30, y: 30, width: 400, height: 362, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(48, 54, 'application-source.yaml', { 'font-size': 13.5, fill: MUT });
    rows(50, 86, Y2, typed(c, SH2[k - 1] ?? 0, SH2[k]), { hi: (i) => HI2[k].includes(i), w: 370, fs: 14, lh: 25 });
    if (k === 0) { zone(470, 50, 220, 150, 'ns argocd', { fill: ACCBG, color: ACC }); card(580, 140, 170, 44, { rx: 10, text: 'Application web-app', fs: 14, mono: true, stroke: ACC, s: pop(u, 0.4) });
      zone(710, 50, 220, 150, 'ns web (워크로드)', { fill: SOFT, dash: '6 5', stroke: GRID }); [0, 1, 2].forEach((i) => pod(760 + i * 60, 140, { ghost: true }));
      tx(700, 260, '객체가 사는 곳과 배포될 곳은 다르다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k <= 2) { repo(480, 60, 440, k === 2 ? 300 : 110, 'github.com/acme/web.git', { stroke: ACC }); if (k === 1) sub(700, 135, '저장소 주소는 인증 Secret 매칭 키이기도 하다', fade(u, 0.8));
      if (k === 2) { [['k8s/', 0], ['overlays/', 1], ['prd/  ← path', 2], ['base/', 1]].forEach(([s, d], i) => mono(510 + d * 26, 130 + i * 30, s, { 'font-size': 15, 'font-weight': i === 2 ? 800 : 400, fill: i === 2 ? ACC : INK, opacity: fade(u, 0.2 + i * 0.2) }));
        const X = (i) => 530 + i * 70; el('line', { x1: X(0), y1: 300, x2: X(5), y2: 300, stroke: GRID, 'stroke-width': 3 }); for (let i = 0; i < 6; i++) el('circle', { cx: X(i), cy: 300, r: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
        pill(X(3), 262, 'v2.3.1', GOOD, pop(u, 1.2), { fs: 14, mono: true, fill: GOODBG }); el('line', { x1: X(3), y1: 276, x2: X(3), y2: 292, stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.3) });
        sub(700, 340, '저장소 · 폴더 · 버전, 세 좌표로 하나가 된다', fade(u, 1.6), { 'font-weight': 700 }); }
      return; }
    if (k === 3) { card(570, 150, 170, 60, { rx: 10, text: 'base\nacme/web:…', fs: 14, mono: true, stroke: MUT });
      grow(660, 150, 750, 150, E(u, 0.5, 1.0), ACC, { sw: 3 }); card(840, 150, 170, 60, { rx: 10, text: 'prd 렌더 결과\nacme/web:v2.3.1', fs: 14, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.0) });
      mono(705, 118, 'images', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.7) });
      sub(700, 260, '렌더링은 Argo CD(repo-server)가 한다', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700 }); return; }
    if (k === 4) { const s = pop(u, 0.2); card(590, 140, 180, 60, { rx: 10, text: 'kustomize:', fs: 16, mono: true, stroke: ACC, s }); card(820, 140, 180, 60, { rx: 10, text: 'helm:', fs: 16, mono: true, stroke: ACC, s: pop(u, 0.5) });
      mono(705, 146, '+', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.7) }); cross(705, 220, 16, pop(u, 1.1));
      tx(705, 290, '한 source에 도구는 하나만', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); return; }
    // k5, k6: 커밋 줄과 포인터
    const n = k === 6 ? 6 : 5, X = commits(n, { red: k === 6 }), adv = k === 6 ? E(u, 0.3, 1.0) : 1;
    if (k === 6) fly(X(4), 150, X(5), 230, seg(u, 0.1, 0.6), '남의 커밋', { fill: BAD });
    const tip = k === 6 ? lerp(X(4), X(5), adv) : X(4);
    pill(tip, 180, 'HEAD · main', BAD, k === 5 ? pop(u, 0.2) : 1, { fs: 14, mono: true, fill: BADBG }); el('line', { x1: tip, y1: 194, x2: tip, y2: 218, stroke: BAD, 'stroke-width': 2.5 });
    pill(X(2), 282, 'v2.3.1', GOOD, k === 5 ? pop(u, 0.6) : 1, { fs: 14, mono: true, fill: GOODBG }); el('line', { x1: X(2), y1: 268, x2: X(2), y2: 242, stroke: GOOD, 'stroke-width': 2.5 });
    pill(X(1), 330, 'a1b2c3d', GOOD, k === 5 ? pop(u, 1.0) : 1, { fs: 14, mono: true, fill: GOODBG }); el('line', { x1: X(1), y1: 316, x2: X(1), y2: 242, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
    if (k === 5) { sub(700, 100, '브랜치·HEAD는 계속 움직이고', fade(u, 1.3), { 'font-size': 15, 'font-weight': 700, fill: BAD }); sub(700, 380, '태그·커밋 해시는 그 시점에 못 박힌다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: GOOD }); }
    if (k === 6) { clusterBox(760, 40, 170, 80, '운영', { stroke: BAD, fill: BADBG }); grow(X(5), 220, 845, 124, E(u, 1.0, 1.6), BAD);
      tx(600, 110, '예고 없이 운영에 배포된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.6) }); } }

  // 3. spec.destination
  const Y3 = [['destination:'], ['  server: https://kubernetes.default.svc'], ['  namespace: web'], ['  # name: prod-eks   (택1)', MUT], ['syncOptions:'], ['  - CreateNamespace=true']];
  const SH3 = [3, 4, 6, 6, 6, 6], HI3 = [[1, 2], [3], [5], [2], [2], [1, 3, 5]];
  function s3(t, c) { const { k, u } = c;
    el('rect', { x: 30, y: 30, width: 400, height: 220, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(48, 54, 'application-destination.yaml', { 'font-size': 13.5, fill: MUT });
    rows(50, 90, Y3, typed(c, SH3[k - 1] ?? 0, SH3[k]), { hi: (i) => HI3[k].includes(i), w: 370, fs: 14, lh: 26 });
    if (k === 5) { [['server 오타', '미등록 클러스터 → sync 안 됨, 에러는 조건에만'], ['name + server 동시', '검증 에러'], ['CreateNamespace 없음 + ns 없음', '리소스 생성 실패']].forEach(([a, b], i) => {
        const y = 290 + i * 42, s = pop(u, 0.2 + i * 0.4); card(480, y, 900, 36, { rx: 18, stroke: i === 0 ? BAD : WARN, s }); tx(52, y + 5, a, { 'font-size': 15, 'font-weight': 800, fill: i === 0 ? BAD : WARN, opacity: fade(u, 0.3 + i * 0.4) });
        tx(340, y + 5, b, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.4) }); });
      clusterBox(470, 40, 460, 210, 'in-cluster'); ['argocd', 'web'].forEach((n, i) => zone(500 + i * 215, 80, 190, 150, 'ns ' + n, { fill: PANEL, stroke: GRID }));
      return; }
    clusterBox(470, 40, 460, 340, k === 1 ? '등록된 클러스터' : 'in-cluster  (Argo CD가 도는 클러스터)');
    if (k === 1) { [['in-cluster', 'kubernetes.default.svc'], ['prod-eks', '(argocd cluster add로 등록)']].forEach(([a, b], i) => { const y = 120 + i * 80, s = pop(u, 0.2 + i * 0.3);
        card(700, y, 400, 60, { rx: 10, stroke: i === 1 ? ACC : INFO, s }); mono(520, y - 4, a, { 'font-size': 16, 'font-weight': 800, fill: i === 1 ? ACC : INFO, opacity: fade(u, 0.3 + i * 0.3) }); mono(520, y + 18, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      card(700, 310, 300, 50, { rx: 10, stroke: BAD, fill: BADBG, text: 'server + name 같이 쓰면 에러', fs: 15, color: BAD, s: pop(u, 1.3) }); return; }
    // ns 두 칸: argocd (객체), web (워크로드), 필요하면 세 번째
    const nsWeb = k === 2 ? E(u, 0.3, 1.2) : 1;
    zone(495, 80, 200, 200, 'ns argocd', { fill: PANEL, stroke: k === 3 ? ACC : GRID, sw: k === 3 ? 2.5 : 1.5 });
    card(595, 160, 170, 42, { rx: 10, text: 'Application', fs: 14, mono: true, stroke: ACC, color: ACC });
    zone(710, 80, 200, 200, 'ns web', { fill: nsWeb > 0.95 ? GOODBG : PANEL, stroke: GOOD, dash: nsWeb < 0.95 ? '6 5' : null, sw: k === 3 ? 2.5 : 1.5 });
    if (k !== 4) [0, 1].forEach((i) => pod(770 + i * 80, 180, { s: k === 2 ? pop(u, 1.3 + i * 0.2) : 1 }));
    if (k === 0) { grow(430, 116, 490, 116, E(u, 0.2, 0.7), INFO, { sw: 3 }); grow(430, 142, 705, 112, E(u, 0.8, 1.4), GOOD); sub(700, 330, '목적지 = 클러스터 주소 + 네임스페이스', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 2) { pill(810, 300, '+ ns web 생성', GOOD, pop(u, 0.5), { fs: 14.5 }); sub(700, 350, '없는 ns는 Argo CD가 먼저 만든다', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 3) { mono(595, 230, 'metadata.namespace', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) }); mono(810, 250, 'destination.namespace', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.7) });
      sub(700, 330, '객체가 사는 곳 ≠ 리소스가 뜨는 곳', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 4) { zone(495, 296, 415, 70, 'ns (매니페스트에 하드코딩된 값)', { fill: BADBG, stroke: BAD });
      fly(240, 330, 800, 340, seg(u, 0.3, 1.5), 'metadata.namespace: …', { fill: BAD, mono: true, stay: true });
      card(140, 330, 200, 50, { rx: 10, text: '매니페스트', fs: 15, stroke: BAD });
      pod(780, 180, { ghost: true }); pod(860, 180, { ghost: true }); tx(810, 240, '여기 떠야 했는데', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) });
      sub(240, 380, '권장: ns를 비우고 주입받기', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: GOOD }); } }

  // 4. project 와 syncPolicy
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const s = pop(u, 0.2);
      el('rect', { x: 40, y: 60, width: 420, height: 300, rx: 18, fill: GOODBG, stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': '10 6', opacity: s });
      tx(60, 90, 'project: production', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: s, class: 'mono' });
      [['repo', 'acme/web.git'], ['cluster', '운영 클러스터'], ['ns', 'web']].forEach(([a, b], i) => { card(250, 150 + i * 66, 340, 50, { rx: 10, stroke: GOOD, s: pop(u, 0.5 + i * 0.25) }); mono(100, 155 + i * 66, a, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6 + i * 0.25) }); tx(200, 155 + i * 66, b, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.25) }); });
      tx(690, 90, 'default (생략 시)', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.2), class: 'mono' });
      ['아무 repo', '아무 클러스터', '아무 ns'].forEach((s0, i) => card(690, 150 + i * 66, 260, 50, { rx: 10, stroke: BAD, text: s0, fs: 15, color: BAD, s: pop(u, 1.3 + i * 0.2) }));
      tx(690, 380, '울타리가 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { [['automated', 'Git 변경을 자동 반영'], ['prune', 'Git에서 지운 리소스 → 클러스터도 삭제'], ['selfHeal', '수동 변경 → Git 상태로 복원']].forEach(([a, b], i) => {
        const y = 110 + i * 100; toggle(80, y, E(u, 0.3 + i * 0.5, 0.6 + i * 0.5), a, { fs: 16 }); tx(300, y + 5, b, { 'font-size': 16, opacity: fade(u, 0.5 + i * 0.5) });
        if (i === 1) { pod(820, y, { col: BAD, s: 1 - E(u, 1.6, 2.2) }); } if (i === 2) { el('path', { d: `M800,${y + 10} A22,16 0 1 0 846,${y + 10}`, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.8), 'marker-end': 'url(#ra-ah)' }); } });
      return; }
    if (k === 2) { const S = [['ns web 생성', 'CreateNamespace=true', GOOD], ['리소스 적용', 'Deployment · Service …', INK], ['삭제 (prune)', 'PruneLast=true', WARN]];
      el('line', { x1: 120, y1: 210, x2: 840, y2: 210, stroke: GRID, 'stroke-width': 4 });
      S.forEach(([a, b, col], i) => { const x = 160 + i * 320, s = pop(u, 0.3 + i * 0.5); card(x, 210, 230, 74, { rx: 12, stroke: col, s, fill: BG(col) }); tx(x, 205, a, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) }); mono(x, 230, b, { 'text-anchor': 'middle', 'font-size': 13.5, opacity: fade(u, 0.4 + i * 0.5) }); });
      dot([[160, 210], [800, 210]], seg(u, 0.5, 2.4), ACC, 8); mono(160, 140, '먼저', { 'font-size': 15, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.6) }); mono(800, 140, '마지막', { 'font-size': 15, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) });
      tx(480, 330, '의존 리소스가 먼저 사라지는 사고를 막는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { const W = [5, 10, 20, 40, 80], X0 = 220, SC2 = 3.6;
      tx(40, 50, 'retry.limit 5 · duration 5s · factor 2 · maxDuration 3m', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      W.forEach((w, i) => { const y = 92 + i * 52; tx(X0 - 16, y + 18, (i + 1) + '번째 재시도', { 'font-size': 14.5, 'text-anchor': 'end', fill: MUT });
        const g = E(u, 0.2 + i * 0.3, 0.7 + i * 0.3); el('rect', { x: X0, y, width: Math.max(2, w * SC2 * g), height: 26, rx: 5, fill: INFO, opacity: 0.85 });
        mono(X0 + w * SC2 * g + 10, y + 19, w + 's', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5 + i * 0.3) }); });
      el('line', { x1: X0 + 180 * SC2, y1: 80, x2: X0 + 180 * SC2, y2: 350, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }); mono(X0 + 180 * SC2 - 6, 372, '3m 상한', { 'font-size': 14, fill: WARN, 'text-anchor': 'end' });
      tx(X0, 384, '합계 155초, 상한에 닿기 전에 끝난다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { [['automated 있음', 'dev · stg'], ['automated 없음', '운영에서 흔함']].forEach(([a, b], i) => { const y = 120 + i * 170;
        tx(40, y - 40, a, { 'font-size': 16, 'font-weight': 800, class: 'mono' }); tx(40, y - 18, b, { 'font-size': 13.5, fill: MUT });
        repo(40, y, 120, 60, 'push'); clusterBox(760, y - 10, 170, 80, '클러스터');
        if (i === 0) { grow(162, y + 30, 756, y + 30, E(u, 0.2, 1.0), ACC, { sw: 3 }); dot([[162, y + 30], [756, y + 30]], seg(u, 0.4, 1.4), ACC, 7); pill(460, y + 6, '바로 배포', ACC, pop(u, 0.8), { fs: 14.5 }); }
        else { grow(162, y + 30, 330, y + 30, E(u, 0.6, 1.0), MUT); stat(410, y + 30, 'OutOfSync', pop(u, 1.0)); person(560, y + 24, null, { s: pop(u, 1.4) });
          mono(560, y - 14, 'sync 승인', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) }); grow(590, y + 30, 756, y + 30, E(u, 1.8, 2.3), ACC, { sw: 3 }); } });
      return; }
    // k5, k6: selfHeal / ignoreDifferences
    const want = 3, have = k === 5 ? (u < 1.4 ? lerp(3, 10, E(u, 0.2, 1.0)) : lerp(10, 3, E(u, 1.5, 2.4))) : (u < 1.2 ? lerp(3, 6, E(u, 0.3, 1.0)) : 6);
    repo(40, 60, 250, 150, 'Git'); mono(165, 150, 'replicas: 3', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle' });
    clusterBox(380, 40, 540, 220, '클러스터'); pods(430, 110, have, { cols: 5, gx: 60, gy: 60, col: Math.round(have) !== want && k === 5 ? WARN : GOOD });
    mono(840, 120, 'replicas', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(840, 150, String(Math.round(have)), { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle' });
    if (k === 5) { mono(480, 310, 'kubectl edit replicas 3 → 10', { 'font-size': 15, fill: BAD, opacity: fade(u, 0.2) }); pill(480, 360, 'selfHeal → Git 값 3', GOOD, pop(u, 1.5), { fs: 15, mono: true }); }
    if (k === 6) { card(640, 320, 160, 50, { rx: 10, text: 'HPA', fs: 17, stroke: INFO, color: INFO, s: pop(u, 0.2) }); grow(640, 294, 640, 266, E(u, 0.4, 0.8), INFO);
      snippet(40, 290, ['ignoreDifferences:', '  - kind: Deployment', '    jsonPointers: [/spec/replicas]'], { op: fade(u, 1.0) });
      tx(850, 330, 'selfHeal과 안 싸운다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); } }

  // 5. status — 두 축
  const ROWS = ['Healthy', 'Progressing', 'Degraded'], COLS = ['Synced', 'OutOfSync'];
  const CELL = { 'Synced|Healthy': '할 일 없음', 'OutOfSync|Healthy': '변경 대기', 'Synced|Progressing': 'Pod 기동 중', 'Synced|Degraded': '로그 확인', 'OutOfSync|Degraded': '롤백 검토' };
  function grid2(u, o) { o = o || {}; const x0 = 330, y0 = 90, cw = 270, ch = 82;
    COLS.forEach((s, j) => { tx(x0 + j * cw + cw / 2, y0 - 16, s, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: SC[s], class: 'mono' }); });
    ROWS.forEach((s, i) => { tx(x0 - 16, y0 + i * ch + ch / 2 + 6, s, { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 800, fill: HC[s], class: 'mono' });
      COLS.forEach((cs, j) => { const key = cs + '|' + s, txt = CELL[key], hot = o.hot && o.hot.includes(key), sc = pop(u, 0.2 + (i * 2 + j) * 0.2);
        card(x0 + j * cw + cw / 2, y0 + i * ch + ch / 2, cw - 10, ch - 10, { rx: 10, text: txt || '—', fs: 15, fw: 700, stroke: hot ? (s === 'Degraded' ? BAD : ACC) : GRID, color: txt ? INK : MUT, fill: hot ? BG(s === 'Degraded' ? BAD : ACC) : PANEL, sw: hot ? 3 : 1.5, s: o.anim ? sc : 1 }); }); });
    tx(x0 + cw, y0 - 44, 'sync →', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { const L = k === 0 ? [['$ kubectl apply -f web-app.yaml -n argocd']] : [['$ argocd app create web-app \\'], ['    --repo github.com/acme/web.git \\'], ['    --path k8s/overlays/prd \\'], ['    --revision v2.3.1 \\'], ['    --dest-namespace web \\'], ['    --project production \\'], ['    --sync-policy automated --auto-prune --self-heal']];
      const hi = k === 1 ? [1, 2, 3] : k === 2 ? [4, 5, 6] : [0];
      el('rect', { x: 30, y: 40, width: 560, height: 230, rx: 10, fill: INK });
      L.forEach(([s], i) => mono(48, 76 + i * 27, s, { 'font-size': 14, fill: hi.includes(i) ? '#fbbf24' : 'var(--term)', opacity: fade(u, 0.1 + i * 0.15) }));
      const F = [['spec.source', ACC], ['spec.destination', INFO], ['spec.project', INK], ['spec.syncPolicy', GOOD]];
      F.forEach(([s, col], i) => { const on = k === 1 ? i === 0 : k === 2 ? i > 0 : false; card(780, 70 + i * 56, 260, 42, { rx: 8, text: s, fs: 15, mono: true, stroke: on ? col : GRID, color: on ? col : MUT, fill: on ? BG(col) : PANEL, sw: on ? 2.5 : 1.5 }); });
      if (k === 1) grow(560, 130, 646, 74, E(u, 1.0, 1.5), ACC, { sw: 3 });
      if (k === 2) [0, 1, 2].forEach((i) => grow(560, 184 + i * 27, 646, 126 + i * 56, E(u, 0.8 + i * 0.3, 1.2 + i * 0.3), [INFO, INK, GOOD][i]));
      [['sync', '?'], ['health', '?']].forEach(([a, b], i) => { pill(330 + i * 170, 330, a + ': ' + b, MUT, 1, { fs: 15, mono: true }); });
      if (k === 0) sub(400, 380, '만드는 순간부터 컨트롤러가 두 축을 관측한다', fade(u, 1.0), { 'font-size': 15, 'font-weight': 700 });
      if (k > 0) sub(400, 380, 'CLI 인자는 spec 필드와 1:1로 맞물린다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700 });
      return; }
    if (k === 3 || k === 4) { terminal(30, 40, 520, k === 3 ? 90 : 200, k === 3 ? ['$ argocd app get web-app'] : ['$ argocd app get web-app', 'Name:          web-app', 'Project:       production', ['Sync Status:   Synced', '#4ade80'], ['Health Status: Healthy', '#4ade80']], k === 3 ? lerp(0, 1, E(u, 0.2, 0.8)) : lerp(1, 5, E(u, 0.2, 1.6)), { fs: 14.5 });
      if (k === 4) sub(290, 262, '출력은 예시', fade(u, 1.6));
      [['Sync', 'Git과 클러스터가 같은가', k === 4 ? 'Synced' : '?', GOOD], ['Health', '앱이 잘 도는가', k === 4 ? 'Healthy' : '?', GOOD]].forEach(([a, q, v, col], i) => { const cx = 700 + i * 0, cy = 100 + i * 150, s = k === 3 ? pop(u, 0.8 + i * 0.4) : 1;
        card(740, cy, 300, 110, { rx: 14, stroke: k === 4 ? col : GRID, s, sw: 2.2 }); tx(610, cy - 22, a, { 'font-size': 17, 'font-weight': 800, opacity: s }); tx(610, cy + 2, q, { 'font-size': 14, fill: MUT, opacity: s });
        mono(740, cy + 38, v, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 4 ? col : MUT, opacity: k === 4 ? fade(u, 1.2 + i * 0.3) : s }); });
      if (k === 3) sub(290, 300, '상태는 한 값이 아니라 두 축이다', fade(u, 1.6), { 'font-size': 16, 'font-weight': 700 });
      return; }
    if (k === 6) { [['"Synced 니까 정상이다"', 'Synced는 배포 반영일 뿐'], ['"OutOfSync = 장애다"', 'Git에 새 변경이 있다는 뜻일 수 있다']].forEach(([a, b], i) => { const y = 110 + i * 110, s = pop(u, 0.2 + i * 0.5);
        card(480, y, 760, 86, { rx: 12, stroke: BAD, s }); cross(140, y, 13, s); tx(180, y - 6, a, { 'font-size': 18, 'font-weight': 800, opacity: s }); tx(180, y + 22, b, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5 + i * 0.5) }); });
      pill(480, 350, '두 축을 따로 읽는다', GOOD, pop(u, 1.6), { fs: 16 }); return; }
    grid2(u, { anim: k === 5, hot: k === 7 ? ['Synced|Degraded', 'OutOfSync|Healthy'] : null });
    if (k === 7) { sub(480, 370, '반영됐지만 CrashLoop · 앱은 정상인데 변경 대기', fade(u, 0.8), { 'font-size': 15, 'font-weight': 700 }); mono(480, 400, '$ argocd app list  # 전체 앱의 두 축', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) }); } }

  const quiz = [
    { q: 'Application의 spec 4필드 중 "어디에" 배포할지를 정하는 것은 무엇인가?',
      o: ['source', 'destination', 'syncPolicy'], a: 1,
      why: 'source는 무엇을, destination은 어디에(클러스터와 네임스페이스), project는 울타리, syncPolicy는 어떻게를 정한다.' },
    { q: '운영 Application의 targetRevision으로 가장 알맞은 것은 무엇인가?',
      o: ['HEAD', 'main', 'v2.3.1 같은 태그'], a: 2,
      why: 'HEAD와 main은 커밋이 올라올 때마다 움직인다. 태그나 커밋 해시로 고정해야 언제 무엇이 배포됐는지 추적된다.' },
    { q: 'metadata.namespace가 argocd이고 destination.namespace가 web일 때, Deployment는 어디에 뜨나?',
      o: ['web', 'argocd', '두 곳 모두'], a: 0,
      why: 'argocd는 Application 객체가 사는 곳이고, 워크로드는 destination.namespace인 web에 뜬다.' },
    { q: 'project를 생략하면 어떤 일이 생기나?',
      o: ['Application 생성이 실패한다', '자동 sync가 꺼진다', '제한이 없는 default 프로젝트에 들어간다'], a: 2,
      why: 'default 프로젝트는 아무 repo, 아무 클러스터, 아무 ns에나 배포할 수 있어 잘못된 클러스터 배포를 막지 못한다.' },
    { q: 'Sync Status가 Synced인데 Health Status가 Degraded라면 무슨 뜻인가?',
      o: ['Git 변경이 아직 반영되지 않았다', 'Git대로 반영됐지만 Pod가 제대로 돌지 않는다', 'Argo CD가 클러스터에 접속하지 못한다'], a: 1,
      why: 'sync는 반영 여부, health는 실행 건강도다. Synced + Degraded면 CrashLoop이나 Probe 실패를 로그에서 찾는다.' },
  ];

  const summary = [
    'kubectl apply를 반복하는 대신 Application 하나로 배포를 선언한다.',
    'spec은 source, destination, project, syncPolicy 네 필드로 무엇을 어디에 어떻게 배포할지 정한다.',
    '운영은 targetRevision을 태그로 고정하고, project를 생략해 default에 두지 않는다.',
    'status는 sync와 health 두 축이라 Synced여도 Degraded일 수 있다.',
  ];
  const review = [
    { q: '운영 Application을 targetRevision: main으로 두었더니 다른 팀원의 커밋이 예고 없이 배포됐다. 먼저 고칠 것은?',
      o: ['syncPolicy에서 selfHeal을 끈다', 'targetRevision을 v2.3.1 같은 태그로 고정한다', 'destination을 name 방식으로 바꾼다'], a: 1,
      why: 'main은 커밋마다 움직이는 포인터다. 태그로 고정하면 targetRevision을 바꾸는 PR이 곧 배포가 된다.' },
    { q: 'HPA가 replicas를 늘릴 때마다 selfHeal이 다시 3으로 줄인다. 알맞은 조치는?',
      o: ['/spec/replicas를 ignoreDifferences로 제외한다', 'project를 default로 바꾼다', 'retry.limit을 늘린다'], a: 0,
      why: '밖에서 바뀌는 것이 정상인 필드는 ignoreDifferences로 비교에서 빼야 selfHeal과 충돌하지 않는다.' },
    { q: 'sync가 실패했다가 몇 분 안에 저절로 성공했다. retry가 limit 5, duration 5s, factor 2라면 기다린 시간은?',
      o: ['매번 5초씩', '5초, 10초, 20초, 40초, 80초 순으로 늘어난다', '처음부터 3분씩'], a: 1,
      why: 'backoff는 5초에서 두 배씩 늘고 3분 상한이 있다. 다섯 번 모두 상한 아래라 합계 155초다.' },
  ];

  R.page({ title: 'Application 주문서', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
