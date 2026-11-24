/* I-2-1 Cluster, Node, Control Plane — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, dbIcon, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 자리: 위 = Control Plane(master-1), 아래 = worker 3대
  const CP = { x: 150, y: 22, w: 790, h: 150 };
  const COMP = { api: [300, 104], etcd: [480, 104], sch: [660, 104], ctl: [840, 104] };
  const WX = [40, 345, 650], WY = 236, WW = 270, WH = 170;
  function compBox(key, name, s, o) { o = o || {}; const [cx, cy] = COMP[key];
    if (key === 'etcd') { dbIcon(cx, cy - 6, null, { s: (s ?? 1) * 0.62, stroke: o.hot ? ACC : INK, fill: o.hot ? ACCBG : PANEL, op: o.op }); if ((s ?? 1) > 0.5) tx(cx, cy + 46, 'etcd', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.hot ? ACC : INK, opacity: o.op ?? 1 }); return; }
    card(cx, cy, 158, 54, { rx: 10, text: name, fs: 15, fw: 800, stroke: o.hot ? ACC : INK, fill: o.hot ? ACCBG : PANEL, color: o.hot ? ACC : INK, s, sw: o.hot ? 3 : 2, op: o.op }); }
  function master(g, o) { o = o || {};
    el('rect', { x: CP.x + CP.w / 2 * (1 - g), y: CP.y, width: CP.w * g, height: CP.h, rx: 14, fill: INFOBG, stroke: INFO, 'stroke-width': 2.5, opacity: g });
    if (g > 0.6) { mono(CP.x + 14, CP.y + 24, 'master-1', { 'font-size': 15, 'font-weight': 800, fill: INFO }); tx(CP.x + 104, CP.y + 24, 'control-plane', { 'font-size': 14, fill: MUT }); } }
  function worker(i, s, o) { o = o || {}; const x = WX[i];
    const g = R.G(x + WW / 2, WY + WH / 2, s ?? 1, o.op);
    el('rect', { x: -WW / 2, y: -WH / 2, width: WW, height: WH, rx: 14, fill: o.hot ? ACCBG : PANEL, stroke: o.hot ? ACC : GRID, 'stroke-width': o.hot ? 3 : 2 }, g);
    mono(-WW / 2 + 14, -WH / 2 + 24, 'worker-' + (i + 1), { 'font-size': 15, 'font-weight': 800 }, g);
    if (!o.comps) tx(WW / 2 - 14, -WH / 2 + 24, 'ROLES <none>', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }, g); }
  // worker 안 세 컴포넌트 (on: 어디까지 보이나 0~3)
  const WC = [['kubelet', 0], ['kube-proxy', 1], ['containerd', 2]];
  function wcomps(i, on, hot) { const x = WX[i] + 14;
    WC.forEach(([n, j]) => { if (j >= on) return; const y = WY + 44 + j * 38;
      card(x + 66, y + 14, 132, 30, { rx: 6, text: n, fs: 14, fw: 700, mono: true, stroke: hot === j ? ACC : GRID, fill: hot === j ? ACCBG : SOFT, color: hot === j ? ACC : INK, sw: hot === j ? 2.5 : 1.5 }); }); }
  function podIcon(cx, cy, s, label) { const g = R.G(cx, cy, s ?? 1);
    el('rect', { x: -38, y: -24, width: 76, height: 48, rx: 12, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5 }, g);
    tx(0, 6, label || 'Pod', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: GOOD, class: 'mono' }, g); }
  const PODPOS = (i) => [WX[i] + 215, WY + 100];
  function topo(c, o) { o = o || {}; master(1); ['api', 'etcd', 'sch', 'ctl'].forEach((k) => compBox(k, { api: 'kube-apiserver', sch: 'kube-scheduler', ctl: 'controller-mgr' }[k], 1, { hot: o.hot && o.hot[k] }));
    [0, 1, 2].forEach((i) => { worker(i, 1, { comps: true, hot: o.whot === i }); wcomps(i, 3, o.whot === i ? o.wc : null); if (o.pods && o.pods[i]) podIcon(...PODPOS(i), 1, 'nginx'); }); }

  // 1. 클러스터 외곽
  function s1(t, c) { const { k, u } = c;
    master(k === 0 ? E(u, 0.2, 1.1) : 1);
    if (k === 0) tx(545, 110, '시청 부지 · 4개 부서는 다음 장면에서', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) });
    [0, 1, 2].forEach((i) => { if (k === 0) return; worker(i, k === 1 ? pop(u, 0.2 + i * 0.35) : 1); });
    terminal(10, 186 - 150, 128, 120, [['$ kubectl', 'var(--term)'], ['  get nodes', 'var(--term)']], k === 0 ? lerp(0, 2, E(u, 0.1, 0.8)) : 2, {});
    if (k === 1) sub(480, 225, '노드 4대 = 한 클러스터', fade(u, 1.5), { 'font-weight': 700, 'font-size': 15 });
    if (k === 2) { [0, 1, 2].forEach((i) => { const cx = WX[i] + WW / 2; grow(cx, CP.y + CP.h + 4, cx, WY - 6, E(u, 0.2 + i * 0.2, 0.9 + i * 0.2), ACC, { sw: 3 }); });
      pill(545, 110, '결정만 한다', INFO, pop(u, 1.0), { fs: 16 });
      [0, 1, 2].forEach((i) => pill(WX[i] + WW / 2, WY + 100, '실행만 한다', GOOD, pop(u, 1.4 + i * 0.15), { fs: 15 })); } }

  // 2. Control Plane 4 컴포넌트
  function s2(t, c) { const { k, u } = c;
    master(1); [0, 1, 2].forEach((i) => worker(i, 1, { op: 0.45 }));
    const keys = ['api', 'etcd', 'sch', 'ctl'], names = { api: 'kube-apiserver', sch: 'kube-scheduler', ctl: 'controller-mgr' };
    keys.forEach((key, i) => { if (i > k) return; compBox(key, names[key], i === k ? pop(u, 0.2) : 1, { hot: i === k, op: i === k ? 1 : 0.55 }); });
    const [ax, ay] = COMP.api;
    if (k === 0) { ['인증', '인가', 'Admission'].forEach((s, i) => { const x = 380 + i * 118, s2 = pop(u, 0.8 + i * 0.35); lock(x - 30, 206, true, ACC, s2); tx(x - 12, 212, s, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.9 + i * 0.35) }); });
      mono(ax, 156, 'HTTPS :6443', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); }
    if (k >= 1) { grow(ax + 80, ay, COMP.etcd[0] - 46, ay, k === 1 ? E(u, 0.6, 1.2) : 1, k === 1 ? ACC : MUT, { plain: true, sw: 3 });
      if (k === 1) { [['/registry/pods/…', 0], ['/registry/services/…', 1], ['/registry/secrets/…', 2]].forEach(([s, i]) => mono(560, 206 + i * 20, s, { 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.0 + i * 0.3) }));
        sub(380, 224, 'apiserver만 직접 접근', fade(u, 1.5), { 'font-weight': 700 }); } }
    if (k >= 2) { el('path', { d: `M${COMP.sch[0] - 30},${COMP.sch[1] - 28} Q480,20 ${ax + 30},${ay - 28}`, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: k === 2 ? fade(u, 0.5) : 1 }); }
    if (k === 2) { card(660, 208, 140, 36, { rx: 18, text: 'Pod ?', fs: 14, mono: true, dash: '5 4', stroke: WARN, color: WARN, s: pop(u, 0.6) });
      [0, 1, 2].forEach((i) => grow(660, 228, WX[i] + WW / 2, WY - 4, E(u, 1.2 + i * 0.25, 1.7 + i * 0.25), i === 1 ? ACC : OFF, { dash: i === 1 ? null : '4 4' }));
      sub(860, 224, '고르기만, 만들지 않음', fade(u, 2.1), { 'font-weight': 700, fill: ACC }); }
    if (k === 3) { const [cx, cy] = [840, 210], a = (t * 2.2) % (Math.PI * 2);
      el('circle', { cx, cy, r: 26, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '120 44', transform: `rotate(${a * 57.3} ${cx} ${cy})`, opacity: fade(u, 0.4) });
      tx(cx - 44, cy + 5, 'spec', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.8) }); tx(cx + 44, cy + 5, 'status', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      sub(640, 214, '차이를 계속 메운다', fade(u, 1.3), { 'font-weight': 700, fill: ACC }); } }

  // 3. Worker 3 컴포넌트
  function s3(t, c) { const { k, u } = c;
    master(1); ['api', 'etcd', 'sch', 'ctl'].forEach((key) => compBox(key, { api: 'kube-apiserver', sch: 'kube-scheduler', ctl: 'controller-mgr' }[key], 1, { op: key === 'api' && k === 0 ? 1 : 0.5, hot: key === 'api' && k === 0 }));
    if (k === 3) { // 노드 한 대를 크게: 호출 사슬
      el('rect', { x: 40, y: 200, width: 880, height: 200, rx: 14, fill: PANEL, stroke: GRID, 'stroke-width': 2 }); mono(56, 226, 'worker-2 안', { 'font-size': 15, 'font-weight': 800 });
      const chain = [['kubelet', 130], ['containerd', 360], ['runc', 570], ['컨테이너', 780]];
      chain.forEach(([n, x], i) => { const s = pop(u, 0.2 + i * 0.45); if (i < 3) card(x, 300, 150, 50, { rx: 10, text: n, fs: 15, fw: 800, mono: true, stroke: i === 0 ? ACC : INK, s }); else podIcon(x, 300, s, 'nginx');
        if (i) grow(chain[i - 1][1] + 78, 300, x - (i === 3 ? 42 : 78), 300, E(u, 0.1 + i * 0.45, 0.4 + i * 0.45), ACC); });
      mono(245, 288, 'CRI gRPC', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      return; }
    [0, 1, 2].forEach((i) => { worker(i, 1, { comps: true }); wcomps(i, k + 1, k); });
    if (k === 0) { [0, 1, 2].forEach((i) => { const sx = WX[i] + 80; el('line', { x1: sx, y1: WY + 44, x2: COMP.api[0], y2: COMP.api[1] + 28, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.5 + i * 0.2) }); });
      pill(480, 200, 'watch: 내 노드의 Pod', ACC, pop(u, 1.3), { fs: 14 }); }
    if (k === 1) { const x = WX[1] + 150, y = WY + 99;
      card(x + 60, y - 72, 200, 56, { rx: 8, text: 'Service ClusterIP\n→ Pod IP 규칙', fs: 14, stroke: WARN, s: pop(u, 0.5) });
      mono(x + 60, y - 6, 'iptables / IPVS', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    if (k === 2) { [0, 1, 2].forEach((i) => { const x = WX[i] + 210, y = WY + 140; fly(x, y - 120, x, y, seg(u, 0.4 + i * 0.3, 1.4 + i * 0.3), 'image', { mono: true, fill: INFO }); });
      sub(480, 214, '이미지 pull · start · stop', fade(u, 1.8), { 'font-weight': 700 }); } }

  // 4. Pod 하나가 뜨기까지
  function s4(t, c) { const { k, u, beat } = c, [ax, ay] = COMP.api, [ex, ey] = COMP.etcd, [sx, sy] = COMP.sch;
    const hot = { 0: { api: 1 }, 1: { api: 1, etcd: 1 }, 2: { api: 1, sch: 1 }, 3: {}, 4: { api: 1, etcd: 1 }, 5: {} }[k];
    topo(c, { hot, whot: k >= 2 && k <= 4 ? 1 : null, wc: k === 3 ? 0 : k === 4 ? 2 : null, pods: k >= 4 && (k > 4 || u > 1.2) ? [0, 1, 0] : null });
    // etcd 의 Pod 기록
    const rec = k === 0 ? null : k === 1 ? ['node: ""', 'Pending'] : k <= 3 ? ['node: worker-2', 'Pending'] : ['node: worker-2', k === 4 && u < 1.8 ? 'Pending' : 'Running'];
    if (rec) { const op = k === 1 ? fade(u, 1.2) : 1; el('rect', { x: 14, y: 150, width: 126, height: 66, rx: 8, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: op });
      mono(24, 170, 'pod/nginx', { 'font-size': 13.5, 'font-weight': 800, opacity: op }); mono(24, 189, rec[0], { 'font-size': 13.5, fill: k === 2 && u > 1.6 ? ACC : MUT, opacity: op });
      mono(24, 208, rec[1], { 'font-size': 13.5, 'font-weight': 700, fill: rec[1] === 'Running' ? GOOD : WARN, opacity: op }); }
    if (k === 0) { card(70, 104, 120, 46, { rx: 8, text: 'kubectl\napply', fs: 13.5, mono: true, fill: INK, color: PANEL, stroke: 'none', s: pop(u, 0.1) });
      dot([[130, 104], [ax - 80, ay]], seg(u, 0.3, 1.0), ACC, 7);
      ['인증', '인가', 'Admission'].forEach((s, i) => { pill(320 + i * 130, 210, s, GOOD, pop(u, 1.1 + i * 0.35), { fs: 14 }); }); }
    if (k === 1) dot([[ax + 80, ay], [ex - 40, ey]], seg(u, 0.2, 1.0), ACC, 7);
    if (k === 2) { dot([[ax + 40, ay + 28], [sx - 40, sy + 28]], seg(u, 0.1, 0.7), ACC, 7);
      [0, 1, 2].forEach((i) => { const cx = WX[i] + WW - 30, s = pop(u, 0.8 + i * 0.2); if (i === 1) check(cx, WY + 24, 10, s); else el('circle', { cx, cy: WY + 22, r: 7, fill: OFF, opacity: s }); });
      pill(660, 210, 'Filter → Score → worker-2', ACC, pop(u, 0.8), { fs: 14 });
      dot([[sx - 40, sy + 28], [ax + 40, ay + 28]], seg(u, 1.6, 2.3), WARN, 7); mono(560, 182, 'binding', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
    if (k === 3) { dot([[ax, ay + 28], [WX[1] + 80, WY + 44]], seg(u, 0.2, 1.0), ACC, 7);
      dot([[WX[1] + 80, WY + 72], [WX[1] + 80, WY + 135]], seg(u, 1.3, 2.1), ACC, 7); mono(WX[1] + 160, WY + 112, 'CRI', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) }); }
    if (k === 4) { const [px, py] = PODPOS(1);
      sub(px, WY + 62, 'pull→runc→start', fade(u, 0.3), { 'font-weight': 700, fill: GOOD });
      dot([[px, py - 24], [ax, ay + 28]], seg(u, 1.4, 2.0), GOOD, 7); dot([[ax + 80, ay], [ex - 40, ey]], seg(u, 2.0, 2.5), GOOD, 7); }
    if (k === 5) { el('rect', { x: 150, y: 176, width: 660, height: 50, rx: 8, fill: INK, opacity: fade(u, 0.2) });
      mono(166, 197, 'NAME   READY  STATUS   NODE      IP', { 'font-size': 13.5, fill: OFF, opacity: fade(u, 0.3) });
      mono(166, 217, 'nginx  1/1    Running  worker-2  10.244.1.7', { 'font-size': 14, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.7) }); } }

  // 5. etcd = 단일 진실 원천
  function s5(t, c) { const { k, u } = c;
    const E0 = [190, 200];
    if (k === 4) { // 모두가 apiserver 를 거쳐 etcd 를 본다
      topo(c, { hot: { api: 1, etcd: 1 }, pods: [1, 1, 1] });
      const [ax, ay] = COMP.api; const from = [[COMP.sch[0], COMP.sch[1] + 28], [COMP.ctl[0], COMP.ctl[1] + 28], [WX[0] + 80, WY + 44], [WX[1] + 80, WY + 44], [WX[2] + 80, WY + 44]];
      from.forEach(([x, y], i) => { el('line', { x1: x, y1: y, x2: ax + (i - 2) * 12, y2: ay + 28, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.2 + i * 0.15) }); dot([[x, y], [ax + (i - 2) * 12, ay + 28]], ((t * 0.6 + i / 5) % 1), ACC, 5); });
      banner(480, 210, 'watch → apiserver → etcd', pop(u, 1.2)); return; }
    dbIcon(E0[0], E0[1], 'etcd', { s: 1.4, stroke: ACC, fill: ACCBG });
    if (k === 0) { const keys = [['/registry/pods/default/nginx', 'Pod'], ['/registry/deployments/default/web', 'Deployment'], ['/registry/services/default/api', 'Service'], ['/registry/secrets/…', 'Secret'], ['/registry/configmaps/…', 'ConfigMap']];
      keys.forEach(([kk, v], i) => { const y = 80 + i * 56, a = E(u, 0.2 + i * 0.3, 0.7 + i * 0.3); if (a <= 0) return;
        el('rect', { x: 360, y: y - 22, width: 560 * a, height: 40, rx: 8, fill: i === 3 ? WARNBG : PANEL, stroke: GRID, 'stroke-width': 1.5 });
        if (a > 0.9) { mono(376, y + 4, kk, { 'font-size': 14.5, 'font-weight': 700 }); tx(904, y + 4, v, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); } });
      sub(640, 380, 'Secret은 암호화 설정 권장', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); }
    if (k === 1) { ['ca.crt', 'server.crt', 'server.key'].forEach((s, i) => { const s2 = pop(u, 0.2 + i * 0.3); lock(400, 90 + i * 52, true, WARN, s2); mono(424, 97 + i * 52, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); });
      grow(560, 145, 680, 145, E(u, 1.2, 1.7), ACC);
      card(800, 145, 220, 56, { rx: 8, text: 'get /registry/pods/\ndefault/nginx', fs: 13.5, mono: true, stroke: ACC, s: pop(u, 1.7) });
      sub(640, 330, '운영에서는 보통 이 경로를 막아 둔다', fade(u, 2.1), { 'font-weight': 700, 'font-size': 15 }); }
    if (k === 2) { const a = E(u, 0.3, 1.3); const fx = lerp(260, 640, a);
      el('path', { d: `M${fx - 34},110 h52 l16,16 v62 h-68 Z`, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(fx - 24, 160, '.db', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      if (a > 0.95) { mono(fx + 50, 150, 'snapshot save', { 'font-size': 15, 'font-weight': 700 }); mono(fx + 50, 172, 'etcd-2025-05-01.db', { 'font-size': 13.5, fill: MUT }); }
      if (u > 1.6) { el('path', { d: 'M620,230 Q450,330 250,270', fill: 'none', stroke: GOOD, 'stroke-width': 3, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 1.6) });
        mono(470, 330, 'snapshot restore → 그 시점 상태로', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }
    if (k === 3) { [[3, 1, 470], [5, 2, 770]].forEach(([n, f, cx], j) => { const s = pop(u, 0.2 + j * 0.5);
        for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n, x = cx + Math.cos(a) * 62, y = 190 + Math.sin(a) * 62, dead = i < f && u > 1.2 + j * 0.3;
          dbIcon(x, y, null, { s: 0.34 * s, stroke: dead ? BAD : ACC, fill: dead ? PANEL : ACCBG }); if (dead) cross(x, y, 12, pop(u, 1.2 + j * 0.3)); }
        mono(cx, 300, n + '대 → ' + f + '대까지 죽어도', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5 + j * 0.3) });
        mono(cx, 324, '과반 ' + (n - f) + '/' + n + ' 유지', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.7 + j * 0.3) }); });
      sub(620, 380, '멤버는 서로 다른 가용 영역에', fade(u, 2.2), { 'font-weight': 700, 'font-size': 15 }); } }

  const quiz = [
    { q: 'kubectl get nodes에서 ROLES가 <none>인 노드는 무엇을 하는가?',
      o: ['Pod를 실제로 돌리는 Worker다', '클러스터를 통제하는 Control Plane이다', '아직 클러스터에 합류하지 않은 노드다'], a: 0,
      why: 'master-1만 control-plane 역할이고, ROLES가 <none>인 worker-1~3이 실제 컨테이너를 실행한다.' },
    { q: 'Control Plane 컴포넌트 중 etcd에 직접 접근하는 것은 무엇인가?',
      o: ['kube-scheduler', 'kube-apiserver', 'kube-controller-manager'], a: 1,
      why: 'etcd에는 apiserver만 직접 붙는다. 나머지는 apiserver를 거쳐 읽고 쓴다.' },
    { q: 'kubelet이 컨테이너를 띄울 때 호출하는 경로로 맞는 것은 무엇인가?',
      o: ['kubelet → kube-proxy → 컨테이너', 'kubelet → apiserver → runc', 'kubelet → CRI(gRPC) → containerd → runc → 컨테이너'], a: 2,
      why: 'kubelet은 CRI로 런타임(containerd)을 부르고, containerd가 runc로 실제 프로세스를 시작한다.' },
    { q: 'scheduler가 Pod의 노드를 정한 직후, 그 노드에서 컨테이너를 실제로 띄우는 것은 누구인가?',
      o: ['scheduler가 직접 띄운다', '그 노드의 kubelet이 watch로 알아채고 CRI로 띄운다', 'controller-manager가 SSH로 띄운다'], a: 1,
      why: 'scheduler는 nodeName만 정한다. worker-2의 kubelet이 자기 몫을 보고 containerd에 생성을 맡긴다.' },
    { q: 'etcd를 5대로 띄웠을 때 클러스터가 버티는 최대 장애 대수는 무엇인가?',
      o: ['1대', '4대', '2대'], a: 2,
      why: 'Raft는 과반이 살아 있어야 한다. 5대 중 3대가 남으면 되므로 2대까지 죽어도 된다.' },
  ];

  const summary = [
    '클러스터는 통제하는 Control Plane과 Pod를 실제로 돌리는 Worker로 나뉜다.',
    'Control Plane의 네 컴포넌트 중 etcd에 직접 닿는 것은 apiserver 하나다.',
    'Worker마다 kubelet, kube-proxy, 컨테이너 런타임이 돌고 kubelet은 CRI로 런타임을 부른다.',
    '상태는 etcd 한 곳에 있으니 3대나 5대로 띄우고 스냅샷을 떠 둔다.',
  ];
  const review = [
    { q: 'Pod가 Pending에서 멈춰 있고 describe에 노드가 정해지지 않았다고 나온다. 먼저 살펴볼 컴포넌트는?',
      o: ['kube-proxy', 'kube-scheduler', 'containerd'], a: 1,
      why: 'nodeName이 비어 있다면 배치 결정이 안 난 것이다. Filter 단계에서 requests나 taint 때문에 걸러졌는지 scheduler 쪽을 본다.' },
    { q: 'etcd 3대 중 2대가 동시에 죽었다. 이미 떠 있던 Pod와 새 배포는 어떻게 되나?',
      o: ['이미 돌던 Pod는 계속 돌지만 과반이 깨져 새 변경은 저장되지 않는다', '모든 Pod가 즉시 멈춘다', '남은 1대가 혼자 계속 쓰기를 받는다'], a: 0,
      why: '3대는 1대 장애까지만 버틴다. 상태 저장이 막혀도 kubelet이 이미 띄운 컨테이너는 노드에서 계속 돈다.' },
    { q: 'worker-2에서 이미지를 받지 못해 Pod가 뜨지 않는다. 이 일을 맡은 쪽은?',
      o: ['etcd', 'kube-scheduler', 'worker-2의 kubelet과 containerd'], a: 2,
      why: '배치가 끝난 뒤 이미지 pull과 실행은 노드의 kubelet이 CRI로 containerd에 맡기는 단계다.' },
  ];

  R.page({ title: '클러스터 구성도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
