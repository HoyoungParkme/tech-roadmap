/* II-2-2 sync option — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 왼쪽 스위치 판(그 beat 의 options 데이터, 앞 beat 에서 이어서 켜지고 꺼진다) + 오른쪽에 그 옵션이 클러스터에서 만드는 결과.
 * ignoreDifferences 장면의 diff 판정은 python 으로 재현한 결과와 같다:
 *   무시 없음 → replicas·env.LOG 차이로 OutOfSync / replicas 무시 → env.LOG 때문에 여전히 OutOfSync / /spec 전체 무시 → 이미지가 v2.3.0 이어도 Synced */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, clock, snippet, terminal, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const RISKY = { Replace: 1, 'Validate=false': 1 };
  // 왼쪽 스위치 판
  function switches(c, o) { o = o || {}; const b = c.beat, p = c.prev, opts = b.options || [];
    zone(16, 20, 286, 40 + opts.length * 58, 'syncOptions', { fill: SOFT });
    opts.forEach((op, i) => { const was = p && p.options && p.options[i] && p.options[i].name === op.name ? p.options[i].on : op.on;
      const f = was === op.on ? (op.on ? 1 : 0) : (op.on ? E(c.u, 0.2, 0.7) : 1 - E(c.u, 0.2, 0.7)), y = 72 + i * 58, risky = RISKY[op.name], col = risky ? BAD : GOOD;
      el('rect', { x: 34, y: y - 14, width: 50, height: 28, rx: 14, fill: f > 0.5 ? col : PANEL, stroke: f > 0.5 ? col : OFF, 'stroke-width': 2 });
      el('circle', { cx: 48 + 22 * f, cy: y, r: 10, fill: PANEL, stroke: f > 0.5 ? col : OFF, 'stroke-width': 2 });
      mono(96, y + 5, op.name, { 'font-size': 14.5, 'font-weight': 700, fill: f > 0.5 ? INK : MUT }); }); }
  const RX = 330, RW = 610;   // 오른쪽 그림 영역

  // ---------- 1. syncOptions 란 ----------
  function washer(u, k) {   // 세탁기: 전원 = automated, 다이얼 = syncOptions
    const cx = 635, cy = 210; card(cx, cy, 380, 300, { rx: 18, stroke: INK, sw: 2.4 });
    el('line', { x1: cx - 190, y1: cy - 80, x2: cx + 190, y2: cy - 80, stroke: INK, 'stroke-width': 2 });
    el('circle', { cx, cy: cy + 50, r: 80, fill: SOFT, stroke: INK, 'stroke-width': 2.4 });
    const on = k >= 3; el('circle', { cx: cx - 150, cy: cy - 115, r: 16, fill: on ? GOOD : PANEL, stroke: on ? GOOD : INK, 'stroke-width': 2.4 });
    tx(cx - 126, cy - 109, '전원 = automated', { 'font-size': 14, 'font-weight': 700, fill: on ? GOOD : MUT });
    [0, 1, 2].forEach((i) => { const dx = cx + 75 + i * 46, a = k >= 4 ? lerp(-60, 60, k === 4 ? E(u, 0.3 + i * 0.3, 0.8 + i * 0.3) : 1) : -60, rad = (a - 90) * Math.PI / 180;
      el('circle', { cx: dx, cy: cy - 115, r: 17, fill: PANEL, stroke: k >= 4 ? ACC : INK, 'stroke-width': 2.4 });
      el('line', { x1: dx, y1: cy - 115, x2: dx + 13 * Math.cos(rad), y2: cy - 115 + 13 * Math.sin(rad), stroke: k >= 4 ? ACC : INK, 'stroke-width': 3, 'stroke-linecap': 'round' }); });
    tx(cx + 120, cy - 56, '다이얼 = syncOptions', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: k >= 4 ? ACC : MUT });
    if (on) { const r = (u * 2) % (Math.PI * 2); [0, 1, 2].forEach((i) => el('circle', { cx: cx + 45 * Math.cos(r + i * 2.1), cy: cy + 50 + 45 * Math.sin(r + i * 2.1), r: 9, fill: INFOBG, stroke: INFO, 'stroke-width': 2 })); } }
  function s1(t, c) { const { k, u } = c; switches(c);
    if (k <= 2) {
      zone(RX + 10, 40, 250, 130, 'ns: argocd', { fill: SOFT });
      card(RX + 135, 110, 200, 48, { rx: 10, stroke: INK, sw: 2.2, text: 'Application web-app', fs: 14.5, mono: true, s: k === 0 ? pop(u, 0.3) : 1 });
      if (k >= 1) { dbIcon(RX + 135, 280, 'Git', { s: k === 1 ? pop(u, 0.2) : 1, stroke: ACC }); snippet(RX + 200, 230, ['repo: …/acme/web.git', 'revision: v2.3.1', 'path: k8s/overlays/prd'], { fs: 14, op: k === 1 ? fade(u, 0.6) : 1 });
        grow(RX + 135, 238, RX + 135, 140, k === 1 ? E(u, 1.0, 1.6) : 1, ACC); }
      if (k >= 2) { zone(RX + 380, 40, 220, 130, 'ns: web', { fill: PANEL, stroke: WARN, dash: '6 5', op: fade(u, 0.3) });
        grow(RX + 236, 110, RX + 376, 110, E(u, 0.6, 1.2), MUT); tx(RX + 490, 120, '있다는 보장 없음', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) }); }
      if (k === 0) tx(RX + 135, 210, '실제 워크로드는 다른 ns로 간다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      return; }
    if (k === 7) {
      [['CreateNamespace=true', '이름=값'], ['ServerSideApply=true', '이름=값']].forEach(([s, d], i) => { pill(RX + 170, 90 + i * 56, s, ACC, pop(u, 0.2 + i * 0.3), { mono: true, fs: 15 }); });
      tx(RX + 380, 120, '문자열 배열', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
      snippet(RX + 10, 210, ['metadata:', '  annotations:', '    argocd.argoproj.io/sync-options: ServerSideApply=true'], { fs: 14, op: fade(u, 1.2) });
      tx(RX + 300, 350, '리소스 하나에만 주려면 annotation으로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    washer(u, k);
    if (k === 5) { pill(635, 395, 'Validate=false 같은 위험 옵션도 같은 배열에', BAD, pop(u, 0.8), { fs: 14 }); }
    if (k === 6) { tx(635, 400, 'automated = 할지 말지 · syncOptions = 어떻게', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) }); } }

  // ---------- 2. CreateNamespace ----------
  function nsBox(f, o) { o = o || {}; const x = RX + 300, y = 70, w = 290, h = 250;
    el('rect', { x, y, width: w * f, height: h, rx: 14, fill: f > 0.99 ? SOFT : 'none', stroke: o.col || GOOD, 'stroke-width': 2.4, 'stroke-dasharray': o.dash });
    if (f > 0.6) tx(x + 16, y + 26, 'namespace: web', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: o.col || GOOD }); }
  function s2(t, c) { const { k, u } = c; switches(c);
    const gitApp = () => { card(RX + 120, 190, 200, 56, { rx: 10, stroke: INK, sw: 2.2, text: 'argocd app sync', fs: 14.5, mono: true }); };
    if (k === 0) { gitApp(); nsBox(1, { col: MUT, dash: '7 6' }); tx(RX + 445, 210, '?', { 'text-anchor': 'middle', 'font-size': 60, 'font-weight': 800, fill: OFF, opacity: fade(u, 0.5) });
      tx(RX + 300, 380, '기본값 false · ns는 사람이 미리 만들어 둔다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 1) { gitApp(); nsBox(1, { col: GOOD, dash: '7 6' }); pill(RX + 445, 200, 'CreateNamespace=true', GOOD, pop(u, 0.6), { mono: true, fs: 14 });
      tx(RX + 300, 380, '없으면 Argo CD가 먼저 만든다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 2) { gitApp(); nsBox(1, { col: MUT, dash: '7 6' }); dot([[RX + 220, 190], [RX + 300, 190]], seg(u, 0.2, 0.8), BAD, 8); if (u > 0.8) cross(RX + 300, 190, 14, pop(u, 0.8));
      terminal(RX, 290, 600, 110, ['$ argocd app sync web-app', ['FAILED: namespaces "web" not found', '#f87171']], lerp(0, 2, E(u, 0.6, 1.6)));
      return; }
    if (k === 3) { gitApp(); const f = E(u, 0.2, 0.9); nsBox(f);
      [['Deployment', 1.2], ['Service', 1.6]].forEach(([n, at], i) => { fly(RX + 220, 190, RX + 445, 140 + i * 60, seg(u, at - 0.3, at), n, { mono: true }); if (u > at) card(RX + 445, 140 + i * 60, 200, 44, { rx: 8, stroke: GOOD, text: n, fs: 15, mono: true }); });
      pill(RX + 400, 280, 'Synced', GOOD, pop(u, 2.1), { fs: 14 }); pill(RX + 500, 280, 'Healthy', GOOD, pop(u, 2.3), { fs: 14 });
      ['① ns 생성', '② 리소스 배포', '③ Synced / Healthy'].forEach((s, i) => tx(RX + 10, 290 + i * 30, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.9) })); return; }
    if (k === 4) { nsBox(1);
      [['istio-injection: enabled', 120], ['pod-security…/enforce: restricted', 175], ['team: frontend', 230]].forEach(([s, y], i) => {
        fly(RX + 60, 60 + i * 40, RX + 445, y, seg(u, 0.3 + i * 0.4, 0.9 + i * 0.4), s, { mono: true, fill: i === 2 ? INFO : ACC, stay: true }); });
      mono(RX + 10, 340, 'managedNamespaceMetadata', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      tx(RX + 10, 370, '안 붙이면 라벨 없는 맨몸 ns가 생긴다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); return; }
    // k5: ns 가 계속 생기는 곳
    [['pr-123', 'PR 미리보기'], ['pr-124', 'PR 미리보기'], ['new-svc', '신규 서비스'], ['tenant-a', '멀티테넌트'], ['tenant-b', '멀티테넌트']].forEach(([n, d], i) => {
      const x = RX + 70 + (i % 3) * 200, y = 90 + Math.floor(i / 3) * 140, s = pop(u, 0.2 + i * 0.3);
      el('rect', { x: x - 80, y: y - 40, width: 170, height: 90, rx: 12, fill: SOFT, stroke: GOOD, 'stroke-width': 2, opacity: s, 'stroke-dasharray': i < 2 && u > 2.2 && i === 0 ? '5 4' : null });
      mono(x + 5, y, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: s }); tx(x + 5, y + 26, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: s }); });
    tx(RX + 300, 380, 'ns를 매번 새로 여는 환경에서 필수', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); }

  // ---------- 3. ServerSideApply ----------
  function annMeter(f, over) { const x = RX + 40, y = 250, w = 520, lim = 0.75;
    el('rect', { x, y, width: w, height: 30, rx: 8, fill: SOFT, stroke: GRID });
    el('rect', { x, y, width: w * f, height: 30, rx: 8, fill: f > lim ? BAD : WARN, opacity: 0.8 });
    el('line', { x1: x + w * lim, y1: y - 14, x2: x + w * lim, y2: y + 44, stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '5 4' });
    mono(x + w * lim, y - 22, '262144 bytes 한계', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
    tx(x, y + 58, 'last-applied-configuration 어노테이션 크기', { 'font-size': 14, fill: MUT }); }
  const FIELDS = [['spec.replicas', 'HPA'], ['spec.template…image', 'argocd'], ['metadata.labels', 'argocd']];
  function owners(u, o) { o = o || {}; card(RX + 300, 190, 560, 190, { rx: 12, stroke: INK, sw: 2 }); tx(RX + 40, 118, 'Deployment web · managedFields', { 'font-size': 15, 'font-weight': 800 });
    FIELDS.forEach(([f, who], i) => { const y = 160 + i * 46, w2 = o.take && i === 0 ? (u > o.take ? 'argocd' : 'HPA') : who, col = w2 === 'HPA' ? INFO : ACC;
      mono(RX + 40, y + 5, f, { 'font-size': 15, opacity: fade(u, 0.2 + i * 0.25) }); pill(RX + 470, y, w2, col, pop(u, 0.4 + i * 0.25) + (o.take && i === 0 ? R.bump(u, o.take) : 0), { mono: true, fs: 14 }); }); }
  function s3(t, c) { const { k, u } = c; switches(c);
    if (k === 0 || k === 2) { snippet(RX + 20, 40, ['kubectl.kubernetes.io/last-applied-configuration:', '  {"apiVersion":…, "spec": {… 전체 매니페스트 …}}'], { fs: 14 });
      const f = k === 0 ? E(u, 0.3, 2.0) * 0.6 : lerp(0.6, 0.97, E(u, 0.3, 1.8)); annMeter(f);
      if (k === 2) { if (u > 1.6) cross(RX + 560, 230, 12, pop(u, 1.6)); mono(RX + 300, 380, 'metadata.annotations: Too long: must have at most 262144 bytes', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      else tx(RX + 300, 380, '클라이언트가 전체 매니페스트를 어노테이션에 담는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      return; }
    if (k === 1) { card(RX + 100, 190, 150, 60, { rx: 10, stroke: MUT, text: 'Argo CD', fs: 16 }); R.server(RX + 470, 190, 'API 서버', { s: pop(u, 0.2), lamp: GOOD });
      grow(RX + 178, 190, RX + 405, 190, E(u, 0.5, 1.2), ACC); pill(RX + 290, 160, 'apply --server-side', ACC, pop(u, 1.0), { mono: true, fs: 13.5 });
      tx(RX + 300, 330, '병합을 API 서버가 맡고 필드마다 주인을 적는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 3) { owners(u); tx(RX + 300, 340, 'last-applied를 안 쓰므로 크기 한계가 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { [['CRD prometheuses…', true], ['Deployment web', false], ['Service web', false]].forEach(([n, on], i) => { const y = 90 + i * 70;
        card(RX + 200, y, 360, 52, { rx: 10, stroke: on ? ACC : GRID, sw: on ? 2.6 : 1.6, fill: on ? ACCBG : PANEL, s: pop(u, 0.2 + i * 0.2), text: n, fs: 15, mono: true });
        tx(RX + 400, y + 6, on ? 'server-side' : 'client-side', { 'font-size': 14, 'font-weight': 700, fill: on ? ACC : MUT, opacity: fade(u, 0.8 + i * 0.2) }); });
      mono(RX + 300, 330, 'sync-options: ServerSideApply=true', { 'text-anchor': 'middle', 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(RX + 300, 365, '앱 전체 대신 큰 CRD 하나에만', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.8) }); return; }
    if (k === 5) { owners(u, { take: 1.4 }); pill(RX + 300, 330, '--force-conflicts', BAD, pop(u, 1.0), { mono: true, fs: 15 });
      tx(RX + 300, 372, 'Git에 replicas가 있으면 HPA 몫도 가져온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    [['대형 CRD', 'Prometheus · Istio · Gateway API'], ['여러 컨트롤러', '한 객체의 다른 필드를 나눠 씀'], ['262144 bytes 에러', 'client-side apply가 막힘']].forEach(([a, d], i) => { const y = 90 + i * 90, s = pop(u, 0.2 + i * 0.5);
      card(RX + 300, y, 560, 70, { rx: 12, stroke: GOOD, sw: 2, s }); if (s > 0.5) { tx(RX + 50, y - 4, a, { 'font-size': 17, 'font-weight': 800 }); tx(RX + 50, y + 20, d, { 'font-size': 14, fill: MUT }); check(RX + 540, y, 11, 1); } }); }

  // ---------- 4. ignoreDifferences ----------
  function diffTable(c, o) { o = o || {}; const b = c.beat, p = c.prev, u = c.u, rows = b.diff || [];
    const x = RX, y = 40; ['필드', 'Git', 'live', '판정'].forEach((h, i) => tx(x + [10, 190, 330, 490][i], y + 10, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
    rows.forEach((r, i) => { const yy = y + 50 + i * 54, pr = p && p.diff && p.diff[i], ign = r.ignored, f = pr && pr.ignored !== ign ? E(u, 0.3, 0.8) : 1;
      const res = r.same ? ['같음', GOOD] : ign ? ['무시', MUT] : ['다름', WARN];
      card(x + 300, yy, 600, 44, { rx: 8, stroke: r.same ? GRID : ign ? GRID : WARN, sw: ign ? 1.5 : 2, fill: ign ? SOFT : PANEL });
      mono(x + 12, yy + 5, r.field, { 'font-size': 15, 'font-weight': 700, fill: ign ? MUT : INK });
      mono(x + 190, yy + 5, r.desired, { 'font-size': 14.5, fill: ign ? MUT : INK }); mono(x + 330, yy + 5, r.live, { 'font-size': 14.5, fill: ign ? MUT : INK });
      pill(x + 540, yy, res[0], res[1], 1, { fs: 13.5 });
      if (ign) el('line', { x1: x + 8, y1: yy, x2: x + 8 + 460 * f, y2: yy, stroke: MUT, 'stroke-width': 2 }); });
    const left = rows.filter((r) => !r.same && !r.ignored).length;
    if (o.verdict !== false) { const s = left ? 'OutOfSync' : 'Synced'; pill(RX + 300, 230, `앱 판정: ${s}`, left ? WARN : GOOD, 1, { fs: 15 }); } }
  function s4(t, c) { const { k, u } = c; switches(c);
    if (k === 2) { snippet(RX, 40, ['webhooks:', '  - name: v1.web', '    clientConfig:', '      caBundle: LS0tLS1CRUdJTi…   ← webhook이 채움', '  - name: v2.web', '    clientConfig:', '      caBundle: LS0tLS1CRUdJTi…'], { fs: 14 });
      [0, 1].forEach((i) => el('rect', { x: RX + 8, y: 40 + 10 + (3 + i * 3) * 22.5, width: 260, height: 22, rx: 4, fill: C.HL, opacity: 0.6 * fade(u, 0.6 + i * 0.4) }));
      mono(RX + 300, 300, '.webhooks[].clientConfig.caBundle', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      tx(RX + 300, 340, '배열 안 필드는 jqPathExpressions로 짚는다', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { card(RX + 300, 150, 560, 150, { rx: 12, stroke: INK, sw: 2 }); tx(RX + 40, 100, 'Deployment · managedFields', { 'font-size': 15, 'font-weight': 800 });
      [['kube-controller-manager', 'spec.replicas', true], ['argocd-controller', 'spec.template…', false]].forEach(([m, f, ig], i) => { const y = 140 + i * 50;
        mono(RX + 40, y + 5, m, { 'font-size': 15, 'font-weight': 700, fill: ig ? MUT : INK, opacity: fade(u, 0.3 + i * 0.3) }); mono(RX + 380, y + 5, f, { 'font-size': 14.5, fill: ig ? MUT : INK, opacity: fade(u, 0.4 + i * 0.3) });
        if (ig) el('line', { x1: RX + 34, y1: y, x2: RX + 34 + 500 * E(u, 1.0, 1.6), y2: y, stroke: MUT, 'stroke-width': 2.2 }); });
      tx(RX + 300, 280, '이 매니저가 가진 필드는 통째로 diff에서 뺀다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(RX + 300, 310, 'managedFieldsManagers · SSA의 소유권 기록을 쓴다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { diffTable(c, { verdict: false });
      const v = Math.floor(t * 1.4) % 2; mono(RX + 300, 260, v ? 'replicas: 3 (HPA)' : 'replicas: 1 (selfHeal)', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: v ? INFO : ACC });
      el('path', { d: `M${RX + 160},290 A140,40 0 1 0 ${RX + 440},290`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' });
      tx(RX + 300, 380, 'selfHeal이 1로, HPA가 3으로 · 끝나지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); return; }
    if (k === 6) { [['HPA', '/spec/replicas'], ['webhook', 'caBundle'], ['클라우드', 'Service의 LB 주소 등'], ['cert-manager', '갱신하는 tls secret data']].forEach(([a, d], i) => { const y = 70 + i * 72, s = pop(u, 0.2 + i * 0.35);
        card(RX + 300, y, 560, 56, { rx: 28, stroke: INFO, sw: 2, s }); if (s > 0.5) { tx(RX + 50, y + 6, a, { 'font-size': 16, 'font-weight': 800 }); mono(RX + 560, y + 6, d, { 'font-size': 14.5, 'text-anchor': 'end' }); } });
      tx(RX + 300, 380, '클러스터가 채우는 값만 무시한다 · env.LOG는 진짜 차이', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 7) {   // /spec 전체를 무시하면
      card(RX + 300, 120, 560, 120, { rx: 12, stroke: BAD, sw: 2.4, fill: BADBG, s: pop(u, 0.2) });
      mono(RX + 40, 100, 'jsonPointers: [/spec]', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3) });
      mono(RX + 40, 140, 'image  Git web:v2.3.1  live web:v2.3.0', { 'font-size': 15, opacity: fade(u, 0.8) });
      pill(RX + 300, 260, '앱 판정: Synced', GOOD, pop(u, 1.3), { fs: 15 }); if (u > 1.8) cross(RX + 420, 260, 12, pop(u, 1.8));
      tx(RX + 300, 330, '이미지가 롤백돼도 아무도 모른다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      tx(RX + 300, 360, '필드 단위로 최소하게', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 2.2) }); return; }
    diffTable(c);
    if (k === 0) tx(RX + 300, 300, 'spec 아래 블록에 diff에서 뺄 필드를 적는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    if (k === 1) mono(RX + 300, 300, '- /spec/replicas', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
    if (k === 5) tx(RX + 300, 300, 'replicas는 통과 · 남은 차이는 env.LOG 하나', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); }

  // ---------- 5. 위험한 옵션들 ----------
  function tree(cx, y, gone, label) {   // Deployment → ReplicaSet → Pod 2개, gone = [d, rs, p] 사라진 정도
    const nodes = [['Deploy', cx, y], ['RS', cx, y + 70], ['Pod', cx - 40, y + 140], ['Pod', cx + 40, y + 140]];
    el('line', { x1: cx, y1: y + 18, x2: cx, y2: y + 52, stroke: GRID, 'stroke-width': 2 }); [-40, 40].forEach((d) => el('line', { x1: cx, y1: y + 88, x2: cx + d, y2: y + 122, stroke: GRID, 'stroke-width': 2 }));
    nodes.forEach(([n, x, yy], i) => { const g = gone[Math.min(i, 2)]; card(x, yy, i < 2 ? 90 : 64, 34, { rx: 8, stroke: g > 0.5 ? BAD : INK, dash: g > 0.5 ? '4 4' : null, op: 1 - 0.7 * g, text: n, fs: 14, mono: true }); });
    tx(cx, y + 190, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' }); }
  function s5(t, c) { const { k, u } = c; switches(c);
    if (k === 0) { tx(RX + 300, 120, '여기서부터는 기본값을 벗어나는 옵션', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
      snippet(RX + 120, 170, ['# Replace=true  # 이유: …', '# Validate=false  # 이유: …'], { fs: 15, op: fade(u, 0.8) });
      tx(RX + 300, 300, '바꿀 때는 이유를 코드에 남긴다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 1) {   // Replace (+Force) : Service 다시 만들어지고 IP 가 바뀐다, PVC 데이터
      const del = E(u, 0.6, 1.2), make = E(u, 1.4, 2.0);
      card(RX + 150, 130, 220, 70, { rx: 10, stroke: del > 0.5 && make < 0.5 ? BAD : INK, sw: 2.2, op: make > 0.5 ? 1 : 1 - del * 0.7, dash: del > 0.5 && make < 0.5 ? '5 4' : null });
      tx(RX + 150, 124, 'Service web', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      mono(RX + 150, 150, make > 0.5 ? 'clusterIP: 새로 할당' : 'clusterIP: 기존 IP', { 'text-anchor': 'middle', 'font-size': 14, fill: make > 0.5 ? BAD : INK });
      dbIcon(RX + 450, 140, 'PVC', { stroke: del > 0.5 ? BAD : INK });
      el('rect', { x: RX + 410, y: 130 - 0 + 50 * del, width: 80, height: Math.max(0, 40 - 40 * del), fill: INFO, opacity: 0.35 });
      tx(RX + 450, 230, del > 0.5 ? '지웠다 만들면 데이터 유실 가능' : '데이터', { 'text-anchor': 'middle', 'font-size': 14, fill: del > 0.5 ? BAD : MUT });
      pill(RX + 300, 290, 'Replace=true · replace로 통째 덮어쓰기', WARN, pop(u, 0.1), { fs: 14 });
      pill(RX + 300, 340, '+ Force=true · 지우고 다시 만들기', BAD, pop(u, 0.4), { fs: 14 }); return; }
    if (k === 2) { snippet(RX + 20, 60, ['spec:', '  replcas: 3     # 오타'], { fs: 16 });
      el('rect', { x: RX + 330, y: 40, width: 16, height: 120, rx: 4, fill: OFF, opacity: 0.6 }); tx(RX + 338, 186, '스키마 검증', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      R.cross(RX + 338, 100, 12, pop(u, 0.3)); fly(RX + 200, 100, RX + 520, 100, seg(u, 0.6, 1.6), 'replcas: 3', { mono: true, fill: BAD, stay: true });
      tx(RX + 300, 270, '오타도 그대로 클러스터로 간다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      tx(RX + 300, 300, '쓰는 곳: 스키마에 없는 필드(RawExtension)를 가진 객체', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 3) {   // 전파 정책 셋
      const g = (a) => E(u, a, a + 0.4);
      tree(RX + 100, 50, [g(1.6), g(1.1), g(0.6)], 'foreground'); tree(RX + 300, 50, [g(0.6), g(1.1), g(1.6)], 'background'); tree(RX + 500, 50, [g(0.6), 0, 0], 'orphan');
      sub(RX + 100, 282, '자식부터 · 기본값', 1, { fill: GOOD, 'font-weight': 700 }); sub(RX + 300, 282, '부모 먼저, 자식은 뒤따라', 1); sub(RX + 500, 282, '자식은 고아로 남음', 1, { fill: WARN, 'font-weight': 700 });
      return; }
    if (k === 4) { const y = 170;
      [['apply', '나머지 리소스', ACC], ['모두 적용 끝', 'Healthy', GOOD], ['맨 마지막', 'prune', BAD]].forEach(([a, d, col], i) => { const x = RX + 100 + i * 200, s = pop(u, 0.3 + i * 0.5);
        card(x, y, 170, 70, { rx: 10, stroke: col, sw: 2.2, s }); if (s > 0.5) { tx(x, y - 5, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col }); tx(x, y + 18, d, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); }
        if (i < 2) grow(x + 88, y, x + 112, y, E(u, 0.6 + i * 0.5, 0.9 + i * 0.5), MUT); });
      tx(RX + 300, 300, '지워질 것에 기대던 리소스가 먼저 자리를 잡는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 5) {   // 바뀐 것만 apply
      for (let i = 0; i < 24; i++) { const x = RX + 60 + (i % 8) * 70, y = 80 + Math.floor(i / 8) * 64, hot = i === 5 || i === 13 || i === 22;
        card(x, y, 56, 44, { rx: 8, stroke: hot ? WARN : GRID, sw: hot ? 2.4 : 1.4, fill: hot ? WARNBG : PANEL, s: pop(u, 0.1 + i * 0.03) });
        if (hot) dot([[x, 20], [x, y - 22]], seg(u, 1.2, 1.8), ACC, 6); }
      tx(RX + 300, 300, 'OutOfSync인 것에만 apply · 리소스가 많을수록 빨라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(RX + 300, 330, '성능 옵션이라 안전을 깎지 않는다', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    // k6: 안전 기본값
    [['Replace', 'false 유지', GOOD], ['Validate', 'true 유지', GOOD], ['CreateNamespace', '필요할 때', INFO], ['ServerSideApply', '대형 CRD면', INFO], ['ApplyOutOfSyncOnly', '대형 앱이면', INFO], ['ignoreDifferences', '최소 필드만', INFO]].forEach(([n, d, col], i) => {
      const x = RX + 150 + (i % 2) * 300, y = 80 + Math.floor(i / 2) * 80, s = pop(u, 0.2 + i * 0.25); card(x, y, 280, 60, { rx: 10, stroke: col, sw: 2, s });
      if (s > 0.5) { mono(x - 125, y - 3, n, { 'font-size': 15, 'font-weight': 800 }); tx(x - 125, y + 20, d, { 'font-size': 14, fill: col, 'font-weight': 700 }); } });
    tx(RX + 300, 350, '기본값이 곧 안전값이다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.9) }); }

  const quiz = [
    { q: 'automated와 syncOptions의 역할 차이는 무엇인가?',
      o: ['automated는 자동으로 sync 할지, syncOptions는 sync를 어떻게 할지 정한다', '둘 다 자동 sync를 켜는 스위치다', 'syncOptions는 automated가 켜져 있을 때만 쓰인다'], a: 0,
      why: '전원과 다이얼의 관계다. automated를 꺼도 syncOptions는 수동 sync에 그대로 적용된다.' },
    { q: 'destination.namespace가 web 인데 클러스터에 web ns가 없다. CreateNamespace를 켜지 않고 sync 하면 어떻게 되는가?',
      o: ['Argo CD가 ns를 만들고 배포한다', 'default ns에 배포한다', 'namespaces "web" not found로 실패한다'], a: 2,
      why: '기본값은 false다. CreateNamespace=true를 켜야 ns를 먼저 만들고, 라벨이 필요하면 managedNamespaceMetadata를 함께 쓴다.' },
    { q: 'ServerSideApply=true가 대형 CRD의 "262144 bytes" 오류를 없애는 이유는 무엇인가?',
      o: ['CRD를 압축해서 보낸다', 'last-applied-configuration 어노테이션에 전체 매니페스트를 담지 않는다', 'CRD를 여러 조각으로 나눠 적용한다'], a: 1,
      why: 'client-side apply는 전체 매니페스트를 어노테이션에 넣어 크기 한계에 걸린다. server-side apply는 필드 소유권(managedFields)으로 병합한다.' },
    { q: 'ignoreDifferences로 /spec/replicas만 뺐는데 앱이 여전히 OutOfSync다. 이 장의 예에서 이유는 무엇인가?',
      o: ['ignoreDifferences가 동작하지 않아서', 'HPA가 꺼져 있어서', 'env.LOG가 Git의 info와 live의 debug로 진짜 다르기 때문에'], a: 2,
      why: '무시한 replicas는 판정에서 빠지지만 env.LOG 차이는 남는다. 클러스터가 채우는 값만 좁게 빼야 진짜 드리프트가 보인다.' },
    { q: 'Replace=true에 Force=true까지 붙였을 때 Service에 생길 수 있는 일은 무엇인가?',
      o: ['아무 변화가 없다', '지웠다 다시 만들어져 clusterIP가 새로 할당된다', 'clusterIP가 Git 값으로 고정된다'], a: 1,
      why: 'Replace는 replace로 통째 덮어쓰고, Force까지 있으면 지우고 다시 만든다. PVC라면 데이터까지 잃을 수 있어 기본은 false로 둔다.' },
  ];

  const summary = [
    'automated는 자동으로 할지를, syncOptions는 sync를 어떻게 할지를 정한다.',
    'CreateNamespace=true를 켜면 없는 ns를 먼저 만든다. 안 켜면 not found로 실패한다.',
    '대형 CRD가 262144 bytes 한계에 걸리면 ServerSideApply=true로 어노테이션 저장을 없앤다.',
    'ignoreDifferences는 HPA의 replicas처럼 클러스터가 채우는 필드만 좁게 뺀다.',
  ];
  const review = [
    { q: 'HPA가 붙은 앱에 ignoreDifferences로 /spec/replicas를 뺐다. 그런데 이미지를 바꾸는 sync를 할 때마다 replicas가 Git 값 1로 돌아간다. 함께 켤 옵션은?',
      o: ['RespectIgnoreDifferences=true', 'Validate=false', 'Replace=true'], a: 0,
      why: 'ignoreDifferences는 기본으로 diff 계산에만 쓰인다. sync 때도 그 필드를 건드리지 않게 하려면 RespectIgnoreDifferences=true를 켠다.' },
    { q: 'PR마다 새 ns에 미리보기 환경을 띄우는데 istio 사이드카가 붙지 않는다. 먼저 볼 곳은?',
      o: ['ServerSideApply 설정', 'managedNamespaceMetadata에 istio-injection 라벨이 있는지', 'PrunePropagationPolicy'], a: 1,
      why: 'CreateNamespace만 켜면 라벨 없는 ns가 생긴다. managedNamespaceMetadata로 istio-injection: enabled를 붙여야 한다.' },
    { q: '누군가 이미지 태그를 v2.3.0으로 되돌렸는데 앱이 Synced로 보인다. ignoreDifferences에서 먼저 의심할 것은?',
      o: ['managedFieldsManagers에 kube-controller-manager를 적었다', 'jqPathExpressions로 caBundle을 뺐다', 'jsonPointers에 /spec처럼 넓은 경로를 적었다'], a: 2,
      why: '/spec 전체를 빼면 이미지 차이도 판정에서 사라진다. 무시는 /spec/replicas처럼 필드 단위로 최소하게 적는다.' },
  ];

  R.page({ title: 'syncOptions 스위치 판', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
