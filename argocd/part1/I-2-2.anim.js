/* I-2-2 destination + 동기화 상태 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
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
  // 리소스 표: rows [{name, kind, sync, health}] — 열은 KIND · NAME · SYNC · HEALTH
  function table(x, y, rows, o) { o = o || {}; const rh = 42, w = o.w || 590, n = rows.length, CX = o.w ? [16, 200, 340, 450] : [16, 222, 400, 520];
    el('rect', { x, y, width: w, height: 36 + rh * n, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    [['KIND', CX[0]], ['NAME', CX[1]], o.sync && ['SYNC', CX[2]], o.health && ['HEALTH', CX[3]]].forEach((h) => h && mono(x + h[1], y + 24, h[0], { 'font-size': 13.5, 'font-weight': 700, fill: MUT }));
    rows.forEach((r, i) => { const yy = y + 36 + i * rh, op = o.op ? o.op(i) : 1, hot = o.hot && o.hot(r, i);
      if (hot) el('rect', { x: x + 6, y: yy + 3, width: w - 12, height: rh - 6, rx: 6, fill: hot === 'bad' ? BADBG : hot === 'good' ? GOODBG : WARNBG, opacity: op });
      mono(x + 16, yy + 27, r.kind, { 'font-size': r.kind.length > 16 ? 13.5 : 14.5, 'font-weight': 700, opacity: op });
      mono(x + CX[1], yy + 27, r.name, { 'font-size': 14.5, opacity: op });
      if (o.sync) { const s = r.sync; mono(x + CX[2], yy + 27, s || '—', { 'font-size': 14.5, 'font-weight': 700, fill: s ? SC[s] : MUT, opacity: op }); }
      if (o.health) { const h = r.health; mono(x + CX[3], yy + 27, h || '판정 없음', { 'font-size': h ? 14.5 : 13.5, 'font-weight': 700, fill: h ? HC[h] : MUT, opacity: op }); } });
    return y + 36 + rh * n; }
  // 오른쪽 앱 요약: 종합 sync / health
  function appCard(c, o) { o = o || {}; const b = c.beat, cb = b.combined || {}, pb = (c.prev && c.prev.combined) || {};
    el('rect', { x: 660, y: 40, width: 270, height: 180, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(678, 68, 'app shop-web', { 'font-size': 15.5, 'font-weight': 800, fill: ACC });
    [['Sync', cb.sync, pb.sync, SC], ['Health', cb.health, pb.health, HC]].forEach(([n, v, pv, M], i) => { const y = 112 + i * 56, changed = v && v !== pv;
      tx(678, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: MUT });
      const shown = o.dimH && i === 1 ? null : v;
      if (shown) pill(840, y, shown, M[shown], changed ? pop(c.u, 0.6) : 1, { fs: 15, mono: true, fill: BG(M[shown]) });
      else mono(840, y + 5, '—', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' }); }); }

  // 1. destination
  function s1(t, c) { const { k, u } = c, b = c.beat, d = b.dest;
    el('rect', { x: 30, y: 30, width: 420, height: 220, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(48, 58, 'Application shop-web', { 'font-size': 15.5, 'font-weight': 800, fill: ACC }); tx(48, 82, '객체는 ns argocd에 산다', { 'font-size': 13.5, fill: MUT });
    const L = [['source: acme/shop.git @ main', 1], ['  path: k8s/overlays/prd', 1], ['destination:', 2], ['  server: https://kubernetes.default.svc', 2], ['  # name: prod-tokyo   (둘 중 하나만)', 3], ['  namespace: shop', 4]];
    L.forEach(([s, at], i) => { if (k < at) return; mono(48, 112 + i * 23, s, { 'font-size': 13.5, fill: at === k ? ACC : at === 3 ? MUT : INK, 'font-weight': at === k ? 700 : 400, opacity: at === k ? fade(u, 0.2) : 1 }); });
    const known = !/미정/.test(d.cluster);
    clusterBox(490, 30, 440, 230, known ? 'in-cluster · ' + d.server.replace('https://', '') : '클러스터 = ?', { dash: known ? null : '6 5', op: known ? 1 : 0.6 });
    zone(510, 70, 190, 170, 'ns argocd', { fill: PANEL, stroke: GRID }); card(605, 155, 160, 40, { rx: 8, text: 'shop-web', fs: 14, mono: true, stroke: ACC, color: ACC });
    const ns = d.namespace, nsOk = !/미정/.test(ns);
    zone(720, 70, 190, 170, nsOk ? 'ns ' + ns : 'ns = ?', { fill: nsOk ? GOODBG : PANEL, stroke: nsOk ? GOOD : GRID, dash: nsOk ? null : '6 5' });
    const RES = (b.resources || []).filter((r) => r.kind !== 'Application');
    if (k >= 1) RES.forEach((r, i) => { const land = k >= 4, e = k === 4 ? E(u, 0.3 + i * 0.25, 1.0 + i * 0.25) : land ? 1 : 0;
      const x = lerp(110 + i * 115, 815, e), y = lerp(290, 120 + i * 40, e);
      card(x, y, land ? 160 : 106, 34, { rx: 8, text: r.kind, fs: 14, mono: true, stroke: GOOD, s: k === 1 ? pop(u, 0.4 + i * 0.25) : 1 }); });
    if (k === 1) sub(240, 336, '"무엇을"만 정해졌고 "어디에"는 비어 있다', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700 });
    if (k === 2) { grow(450, 192, 486, 120, E(u, 0.3, 0.8), INFO, { sw: 3 }); sub(710, 300, '자기 클러스터는 관례적으로 kubernetes.default.svc', fade(u, 1.0), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 3) { (b.clusters || []).forEach((cl, i) => { card(600 + i * 230, 320, 210, 56, { rx: 10, stroke: cl.active ? INFO : GRID, s: pop(u, 0.2 + i * 0.3) }); mono(510 + i * 230, 316, cl.name, { 'font-size': 15, 'font-weight': 800, fill: cl.active ? INFO : INK, opacity: fade(u, 0.3 + i * 0.3) }); mono(510 + i * 230, 338, cl.server, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
      pill(240, 380, 'server + name 동시 → 검증 에러', BAD, pop(u, 1.2), { fs: 14.5 }); }
    if (k === 5) { ['server · name은 하나만', '매니페스트에 ns가 있으면 그게 우선', '없는 ns는 CreateNamespace=true'].forEach((s, i) => pill(170 + i * 310, 370, s, i ? INK : BAD, pop(u, 0.2 + i * 0.4), { fs: 14.5 })); } }

  // 2. 다중 클러스터 등록
  function s2(t, c) { const { k, u } = c, b = c.beat;
    const TERM = [
      ['$ kubectl config get-contexts', 'CURRENT  NAME        CLUSTER', '*        in-cluster  kubernetes', '         prod-tokyo  tokyo.k8s.acme.io'],
      ['$ argocd login argocd.acme.io --sso', ['세션 생성', '#4ade80']],
      ['$ argocd cluster add prod-tokyo \\', '    --name prod-tokyo'],
      ['$ argocd cluster list', 'SERVER                     NAME        STATUS', 'https://kubernetes...      in-cluster  Successful', 'https://tokyo.k8s.acme.io  prod-tokyo  Successful'],
      ['destination:', '  name: prod-tokyo', '  namespace: shop'],
      ['# 실행자 권한 = 등록 권한', '# ClusterRole은 나중에 좁힌다', '# EKS/GKE 토큰 만료 → IRSA / WI']][k];
    terminal(30, 30, 450, 200, TERM, lerp(0, TERM.length, E(u, 0.1, 1.4)), { fs: 13.5, lh: 25 });
    if (k === 0 || k === 3) sub(255, 250, '출력은 예시', fade(u, 1.4));
    // Argo CD 가 사는 클러스터
    clusterBox(510, 30, 420, 200, 'in-cluster (Argo CD)'); argo(615, 110, { s: 0.9 });
    zone(700, 60, 215, 150, 'ns argocd · 클러스터 Secret', { fill: PANEL, stroke: GRID });
    const known = (b.clusters || []).map((x) => x.name), reg = k >= 2;
    [['in-cluster', 1], ['prod-tokyo', reg], ['prod-seoul', k >= 3]].forEach(([n, on], i) => { if (!on) return; const s = (k === 2 && i === 1) || (k === 3 && i === 2) ? pop(u, i === 1 ? 1.6 : 0.8) : 1;
      card(808, 106 + i * 36, 180, 28, { rx: 6, text: n, fs: 13.5, mono: true, stroke: i === 1 && k >= 2 ? ACC : GRID, color: i === 1 && k >= 2 ? ACC : INK, s }); });
    // 원격 클러스터
    [['prod-tokyo', 'tokyo.k8s.acme.io', 510], ['prod-seoul', 'seoul.k8s.acme.io', 730]].forEach(([n, srv, x], i) => { const show = i === 0 || k >= 3; if (!show) return;
      const isReg = i === 0 ? k >= 2 : true, op = k === 3 && i === 1 ? fade(u, 0.6) : 1;
      clusterBox(x, 260, 200, 140, n, { dash: isReg ? null : '6 5', stroke: isReg ? INFO : MUT, fill: isReg ? INFOBG : PANEL, op }); if (k !== 4 && k !== 2) mono(x + 14, 312, srv, { 'font-size': 13.5, fill: MUT, opacity: op }); });
    if (k === 0) tx(610, 360, '아직 Argo CD는 모른다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
    if (k === 1) { grow(470, 130, 545, 115, E(u, 0.6, 1.1), ACC); sub(255, 300, 'CLI 세션이 있어야 cluster add를 반영한다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700 }); }
    if (k === 2) { card(610, 346, 180, 30, { rx: 6, text: 'SA argocd-manager', fs: 13.5, mono: true, stroke: ACC, s: pop(u, 0.4) }); card(610, 380, 180, 30, { rx: 6, text: 'argocd-manager-role', fs: 13.5, mono: true, stroke: ACC, s: pop(u, 0.7) });
      fly(610, 330, 808, 142, seg(u, 1.0, 1.8), '토큰', { fill: ACC }); mono(255, 300, 'Secret: cluster-tokyo-k8s', { 'font-size': 14.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) }); }
    if (k === 3) sub(255, 300, 'Successful = 연결 가능. 배포 권한은 별개', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700 });
    if (k === 4) { (b.resources || []).forEach((r, i) => { fly(615, 140, 610, 306 + i * 32, seg(u, 0.3 + i * 0.45, 0.9 + i * 0.45), r.kind, { stay: true, mono: true }); });
      sub(255, 300, '이름(name)을 쓰면 URL이 바뀌어도 그대로', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: GOOD }); }
    if (k === 5) pill(255, 300, 'RBAC 부족 = 조용한 실패의 주범', BAD, pop(u, 1.4), { fs: 14.5 }); }

  // 3. sync status
  function s3(t, c) { const { k, u } = c, b = c.beat;
    const rows = b.resources || [];
    table(40, 40, rows, { sync: b.showSync, op: (i) => (k === 0 ? fade(u, 0.1 + i * 0.15) : 1), hot: (r) => (r.sync === 'OutOfSync' ? 'warn' : k === 3 && r.kind === 'Deployment' ? 'good' : null) });
    appCard(c, { dimH: k < 1 });
    if (k === 1) { tx(795, 250, 'Health는 Healthy, 별개 질문', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) }); pill(795, 168, 'Healthy', GOOD, pop(u, 1.0), { fs: 15, mono: true, fill: GOODBG }); }
    if (k === 0) tx(795, 250, 'Git과 실제가 같은가?', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
    if (k === 2 || k === 3) { const rep = k === 2 ? 5 : Math.round(lerp(5, 3, E(u, 0.4, 1.4)));
      el('rect', { x: 40, y: 270, width: 590, height: 120, rx: 10, fill: INK });
      mono(58, 298, k === 2 ? '$ argocd app diff shop-web' : '$ argocd app sync shop-web', { 'font-size': 14, fill: PANEL });
      mono(58, 328, 'spec.replicas:', { 'font-size': 14, fill: 'var(--term)' }); mono(78, 352, '- 3   (Git 목표)', { 'font-size': 14, fill: '#4ade80' }); mono(78, 376, '+ ' + rep + '   (클러스터 실제)', { 'font-size': 14, fill: rep === 3 ? '#4ade80' : '#f87171' });
      pods(690, 300, rep, { cols: 5, gx: 48, col: rep === 3 ? GOOD : WARN }); mono(795, 376, 'replicas ' + rep, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); }
    if (k === 4) { snippet(40, 270, ['ignoreDifferences:', '  - group: apps', '    kind: Deployment', '    jsonPointers: [ /spec/replicas ]'], { op: fade(u, 0.8) });
      card(795, 300, 220, 48, { rx: 10, text: 'HPA가 replicas 변경', fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 0.2) }); tx(795, 360, '되돌려도 곧 다시 OutOfSync', { 'text-anchor': 'middle', 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(795, 388, '이 필드만 비교에서 뺀다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 5) { banner(480, 320, 'Synced = Git대로 적용됨. Pod가 잘 뜨는지는 health가 답한다', pop(u, 0.4)); } }

  // 4. health status
  function s4(t, c) { const { k, u } = c, b = c.beat;
    const rows = b.resources || [];
    table(40, 40, rows, { health: true, hot: (r, i) => (k === 1 && r.kind === 'Deployment' ? 'bad' : k === 2 && r.kind === 'Service' ? 'good' : (k === 3 || k === 4) && r.kind === 'Foo' ? 'warn' : null), op: (i) => (k === 0 ? fade(u, 0.1 + i * 0.15) : 1) });
    appCard(c);
    if (k === 0) { ['Healthy', 'Progressing', 'Degraded', 'Missing', 'Suspended'].forEach((h, i) => pill(110 + i * 185, 300, h, HC[h], pop(u, 0.4 + i * 0.2), { fs: 15, mono: true, fill: BG(HC[h]) })); tx(480, 360, '지금 어느 칸에 있는가', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
    if (k === 1) { [['available = desired', 'Healthy', GOOD], ['롤아웃 진행 중', 'Progressing', INFO], ['Pod CrashLoopBackOff', 'Degraded', BAD]].forEach(([a, h, col], i) => { const y = 280 + i * 40; mono(60, y + 5, a, { 'font-size': 14.5, opacity: fade(u, 0.2 + i * 0.3) }); grow(300, y, 360, y, E(u, 0.3 + i * 0.3, 0.6 + i * 0.3), col); mono(372, y + 5, h, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.3) }); });
      tx(795, 260, '앱 종합 = 가장 나쁜 값', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); }
    if (k === 2) { [['Service (LoadBalancer)', 'external IP가 붙어야'], ['PVC', 'Bound여야'], ['Ingress', 'LB 주소가 채워져야']].forEach(([a, bb], i) => { const y = 290 + i * 40; mono(60, y, a, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) }); tx(330, y, bb + ' Healthy', { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.3) }); }); }
    if (k === 3) { tx(330, 300, 'health 규칙이 없는 CRD는 판정하지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) }); tx(330, 330, '고장이어도 앱 종합 health를 끌어내리지 않는다', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.0) }); }
    if (k === 4) { snippet(40, 260, ['resource.customizations.health.example.com_Foo: |', '  if obj.status.phase == "Running" then', '    hs.status = "Healthy"  else  "Progressing"'], { op: fade(u, 0.3), fs: 13.5 });
      tx(795, 290, 'argocd-cm에 Lua 규칙', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.0) }); }
    if (k === 5) { const ORD = ['Healthy', 'Suspended', 'Progressing', 'Missing', 'Degraded', 'Unknown'];
      ORD.forEach((h, i) => { const x = 95 + i * 154, s = pop(u, 0.2 + i * 0.15); card(x, 300, 126, 40, { rx: 20, text: h, fs: 13.5, mono: true, stroke: HC[h] || MUT, color: HC[h] || MUT, fill: BG(HC[h] || MUT), s }); if (i) mono(x - 77, 305, '<', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
      tx(480, 360, '앱 health = 가장 나쁜 값. 아직 없는 Missing 리소스는 계산에서 빠진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); } }

  // 5. 두 상태의 조합
  function s5(t, c) { const { k, u } = c, b = c.beat, cb = b.combined, pb = (c.prev && c.prev.combined) || cb;
    if (k === 4) { [['Synced만 보고 정상이라 단정하지 않기', BAD], ['알림은 health=Degraded 기준으로도', BAD], ['목적지 ns 없음 → CreateNamespace=true', INK], ['원격 클러스터는 RBAC 먼저 점검', INK], ['CRD는 health 규칙 없으면 착시', WARN]].forEach(([s, col], i) => { const y = 70 + i * 62, sc = pop(u, 0.2 + i * 0.3);
        card(480, y, 760, 50, { rx: 10, stroke: col === INK ? GRID : col, s: sc }); check(130, y, 11, sc); tx(160, y + 6, s, { 'font-size': 16, 'font-weight': 700, opacity: sc }); }); return; }
    // 2×2 판
    const X0 = 40, Y0 = 70, CW = 150, CH = 90, pos = (cmb) => [X0 + 60 + (cmb.health === 'Degraded' ? 1 : 0) * CW + CW / 2, Y0 + 30 + (cmb.sync === 'OutOfSync' ? 1 : 0) * CH + CH / 2];
    ['Healthy', 'Degraded'].forEach((h, j) => tx(X0 + 60 + j * CW + CW / 2, Y0 + 18, h, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: HC[h], class: 'mono' }));
    ['Synced', 'OutOfSync'].forEach((s, i) => tx(X0 + 52, Y0 + 30 + i * CH + CH / 2 + 5, s, { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 800, fill: SC[s], class: 'mono' }));
    [['이상적', 0, 0], ['코드·설정 문제', 0, 1], ['Git과 어긋남', 1, 0], ['배포도 앱도 문제', 1, 1]].forEach(([s, i, j]) => card(X0 + 60 + j * CW + CW / 2, Y0 + 30 + i * CH + CH / 2, CW - 8, CH - 8, { rx: 10, text: s, fs: 14, fw: 700, stroke: GRID, color: MUT }));
    const [ax, ay] = pos(pb), [bx, by] = pos(cb), m = E(u, 0.3, 1.2);
    el('rect', { x: lerp(ax, bx, m) - CW / 2 + 4, y: lerp(ay, by, m) - CH / 2 + 4, width: CW - 8, height: CH - 8, rx: 10, fill: 'none', stroke: cb.health === 'Degraded' ? BAD : GOOD, 'stroke-width': 4 });
    // 리소스 표
    const rows = b.resources || [];
    table(410, 40, rows, { w: 540, sync: true, health: true, hot: (r) => (r.health === 'Degraded' ? 'bad' : r.sync === 'OutOfSync' ? 'warn' : null) });
    if (k === 0) tx(160, 330, '네 칸 중 어디인지부터', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    if (k === 1) tx(160, 330, 'sync 열은 전부 초록', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    if (k === 2) terminal(410, 270, 540, 110, ['$ kubectl -n shop logs deploy/shop-web --tail=20', ['Error: cannot connect to db: DATABASE_URL is empty', '#f87171']], lerp(0, 2, E(u, 0.3, 1.6)), { fs: 13.5 });
    if (k === 2) tx(160, 330, '원인은 설정 값', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
    if (k === 3) { terminal(410, 270, 540, 110, ['$ argocd app get shop-web --refresh', '$ argocd app get shop-web --hard-refresh'], lerp(0, 2, E(u, 0.2, 1.2)), { fs: 13.5 });
      tx(160, 330, '앱 종합도 OutOfSync로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); } }

  const quiz = [
    { q: 'destination에 server와 name을 함께 적으면 어떻게 되나?',
      o: ['server가 우선 적용된다', '검증 에러가 난다', '두 클러스터에 모두 배포된다'], a: 1,
      why: 'server와 name은 같은 클러스터를 가리키는 두 방법이다. 한 Application에는 하나만 쓴다.' },
    { q: 'argocd cluster add가 대상 클러스터와 argocd 네임스페이스에 만드는 것은 무엇인가?',
      o: ['ServiceAccount·ClusterRole과 그 토큰을 담은 Secret', 'Application과 AppProject', 'Ingress와 LoadBalancer'], a: 0,
      why: '대상에 argocd-manager ServiceAccount와 권한을 만들고, 토큰을 argocd ns의 Secret으로 저장한다.' },
    { q: 'HPA가 replicas를 바꿀 때마다 OutOfSync가 뜬다. 알맞은 대응은 무엇인가?',
      o: ['sync를 계속 누른다', 'HPA를 지운다', '/spec/replicas를 ignoreDifferences로 뺀다'], a: 2,
      why: '밖에서 바뀌는 것이 정상인 필드는 비교에서 빼야 소음이 사라진다.' },
    { q: 'Deployment가 Degraded, Service가 Healthy, Rollout이 Progressing이면 앱 종합 health는 무엇인가?',
      o: ['Healthy', 'Progressing', 'Degraded'], a: 2,
      why: '앱 health는 리소스 중 가장 나쁜 값이다. 순서는 Healthy < Suspended < Progressing < Missing < Degraded < Unknown이다.' },
    { q: 'Sync는 Synced, Health는 Degraded일 때 먼저 볼 곳은 어디인가?',
      o: ['Pod 로그와 설정 값', 'Git 저장소 인증 Secret', 'destination.server 주소'], a: 0,
      why: 'Git대로 적용은 됐지만 앱이 죽어 있다. 예시에서는 로그에 DATABASE_URL이 비어 있다고 나온다.' },
  ];

  const summary = [
    'destination은 클러스터와 네임스페이스이고, 클러스터는 server와 name 중 하나로만 가리킨다.',
    '원격 클러스터는 argocd cluster add로 먼저 등록하고 권한을 점검한다.',
    'sync는 Git과 실제가 같은지, health는 리소스가 실제로 잘 도는지를 따로 묻는다.',
    'Synced인데 Degraded일 수 있으니 health 기준 알림도 함께 건다.',
  ];
  const review = [
    { q: '새 앱이 Synced인데 사용자는 접속이 안 된다고 한다. Health는 Degraded다. 먼저 확인할 것은?',
      o: ['Git에 새 커밋이 있는지', 'Pod 로그와 환경 변수 같은 설정 값', 'argocd login 세션이 만료됐는지'], a: 1,
      why: 'Synced는 Git대로 적용됐다는 뜻뿐이다. Degraded의 원인은 대개 코드나 설정 쪽에 있다.' },
    { q: 'prod-tokyo를 cluster add로 등록했고 목록에는 Successful로 보이는데 리소스가 만들어지지 않는다. 먼저 볼 것은?',
      o: ['targetRevision이 태그인지', 'ignoreDifferences 설정', '등록 때 만든 ServiceAccount의 RBAC 권한'], a: 2,
      why: 'Successful은 연결이 된다는 뜻이다. 실제로 리소스를 만들 권한은 등록 단계의 ClusterRole이 정한다.' },
    { q: '화면의 상태가 오래돼 보여 refresh 했더니 shop-api가 OutOfSync로 바뀌었다. 앱 종합 sync는?',
      o: ['OutOfSync', 'Synced', 'Unknown'], a: 0,
      why: '앱 종합 sync는 리소스 하나라도 OutOfSync면 OutOfSync다. 그래서 2×2 판에서 OutOfSync + Degraded 칸으로 옮겨 간다.' },
  ];

  R.page({ title: 'destination과 두 가지 상태', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
