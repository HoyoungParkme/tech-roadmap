/* III-2-1 NetworkPolicy — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    G, cross, check, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- Pod 그래프 ----------
  const P = { web: [100, 80], api: [300, 80], db: [500, 80], attacker: [100, 195], cache: [300, 195], dns: [632, 195] };
  const SUBT = { web: 'frontend', api: 'backend', db: 'postgres', attacker: 'compromised', cache: 'redis' };
  const EDGES = [['web', 'api', '8080', 0.5], ['api', 'db', '5432', 0.5], ['api', 'cache', '6379', 0.62], ['web', 'db', '5432', 0.5], ['attacker', 'db', '5432', 0.72], ['attacker', 'api', '8080', 0.32], ['cache', 'db', '5432', 0.35]];
  function pod(cx, cy, name, o) { o = o || {}; const r = 24, g = G(cx, cy, o.s, o.op), col = o.stroke || INK;
    const pts = [0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 3 * i + Math.PI / 6; return (r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1); }).join(' ');
    el('polygon', { points: pts, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.6 }, g);
    el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 3, fill: 'none', stroke: col, 'stroke-width': 1.8 }, g);
    tx(0, 46, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }, g); return g; }
  // 선 위의 점 (직선은 a→b, web→db 는 위로 휜 곡선)
  function at(a, b, f) { const [x1, y1] = P[a], [x2, y2] = P[b];
    if (a === 'web' && b === 'db') { const cx = 300, cy = -12, s = 1 - f; return [s * s * x1 + 2 * s * f * cx + f * f * x2, s * s * y1 + 2 * s * f * cy + f * f * y2]; }
    return [lerp(x1, x2, f), lerp(y1, y2, f)]; }
  const F0 = 0.13, F1 = 0.87;   // 고리 바깥에서 시작·끝
  function edgePath(a, b) { const pts = []; for (let i = 0; i <= 16; i++) pts.push(at(a, b, lerp(F0, F1, i / 16))); return pts; }
  function drawEdge(a, b, port, lf, state, t, o) { o = o || {}; if (!state) return; const pts = edgePath(a, b), d = 'M' + pts.map((p) => p.join(',')).join(' L');
    const col = state === 'allow' ? GOOD : state === 'block' ? BAD : MUT, op = o.op ?? 1;
    el('path', { d, fill: 'none', stroke: col, 'stroke-width': state === 'allow' ? 2.6 : 2, 'stroke-dasharray': state === 'allow' ? null : '6 6', opacity: (state === 'allow' ? 1 : 0.7) * op });
    if (state === 'allow') { for (let i = 0; i < 2; i++) { const f = ((t * 0.45 + i / 2) % 1); el('circle', { cx: at(a, b, lerp(F0, F1, f))[0], cy: at(a, b, lerp(F0, F1, f))[1], r: 4.5, fill: GOOD, opacity: op }); }
      const [mx, my] = at(a, b, lf); if (o.port) mono(a === 'api' && b === 'cache' ? mx + 24 : mx, my - 8, port, { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); }
    if (state === 'block') { const [x, y] = at(a, b, 0.78); cross(x, y, 7, o.sc ?? 1); }
    if (state === 'half') { const [x, y] = at(a, b, 0.22); cross(x, y, 7, o.sc ?? 1); const [x2, y2] = at(a, b, 0.8); check(x2, y2, 8, o.sc ?? 1); } }
  // 한 번 시도해 보는 요청 점: 허용이면 끝까지, 막히면 고리 앞에서 멈춘다
  function probe(a, b, state, u, t0) { const g = seg(u, t0, t0 + 1.1);
    if (g <= 0) return; const stop = state === 'allow' ? F1 : state === 'half' ? 0.2 : 0.74, f = lerp(F0, stop, E(g, 0, 1));
    const [x, y] = at(a, b, f); el('circle', { cx: x, cy: y, r: 8, fill: state === 'allow' ? GOOD : BAD, stroke: PANEL, 'stroke-width': 2 }); }
  // 고리: 들어오는 문(실선) · 나가는 문(점선). open: 그 Pod 쪽으로 열린 방향(라디안)
  function rings(o) { ['web', 'api', 'db', 'attacker', 'cache'].forEach((n) => { const [x, y] = P[n];
    if (o.ing) { el('circle', { cx: x, cy: y, r: 33, fill: 'none', stroke: BAD, 'stroke-width': 2.4, opacity: o.ing });
      const door = (o.doors || {})[n]; if (door != null) { const a0 = door - 0.55, a1 = door + 0.55;
        el('path', { d: `M${x + 33 * Math.cos(a0)},${y + 33 * Math.sin(a0)} A33,33 0 0 1 ${x + 33 * Math.cos(a1)},${y + 33 * Math.sin(a1)}`, fill: 'none', stroke: GOOD, 'stroke-width': 5 }); } }
    if (o.eg) el('circle', { cx: x, cy: y, r: 40, fill: 'none', stroke: o.egOpen ? GOOD : BAD, 'stroke-width': 1.8, 'stroke-dasharray': '4 4', opacity: o.eg }); }); }
  function graph(t, c, o) { o = o || {}; const ed = c.beat.edges || {};
    el('rect', { x: 18, y: 26, width: 560, height: 242, rx: 12, fill: SOFT, stroke: o.area ? ACC : GRID, 'stroke-width': o.area ? 2.2 : 1.5, 'stroke-dasharray': o.area ? '8 5' : null });
    tx(566, 260, 'default 네임스페이스', { 'font-size': 13.5, fill: o.area ? ACC : MUT, 'font-weight': 700, 'text-anchor': 'end' });
    if (o.dns) { el('rect', { x: 588, y: 132, width: 104, height: 136, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
      tx(640, 260, 'kube-system', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700 }); pod(P.dns[0], P.dns[1] - 10, 'kube-dns', { s: 0.9, stroke: INFO }); }
    EDGES.forEach(([a, b, port, lf]) => drawEdge(a, b, port, lf, ed[a + '→' + b], t, { port: o.ports, sc: o.fresh && o.fresh.includes(a + '→' + b) ? pop(c.u, o.freshAt || 0.4) : 1 }));
    rings(o);
    Object.keys(SUBT).forEach((n) => pod(P[n][0], P[n][1], n, { stroke: n === 'attacker' ? BAD : INK, fill: n === 'attacker' ? 'var(--badbg)' : PANEL })); }
  // 오른쪽: 적용된 정책 카드 더미
  const POL = ['default-deny-ingress', 'default-deny-egress', 'allow-web-to-api', 'allow-egress-in-ns-and-dns', 'allow-api-to-db'];
  const SEL = ['<none>', '<none>', 'app=api', '<none>', 'app=db'];
  function policies(n, fresh, u, o) { o = o || {}; tx(712, 40, 'NetworkPolicy', { 'font-size': 14, fill: MUT, 'font-weight': 800 });
    if (!n) mono(712, 70, '0개', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < n; i++) { const isNew = i === n - 1 && fresh, s = isNew ? pop(u, o.at || 0.3) : 1, y = 64 + i * 38, deny = i < 2;
      card(828, y, 236, 32, { rx: 7, stroke: deny ? BAD : GOOD, sw: 1.8, s, dash: isNew && o.draft ? '5 4' : null, fill: PANEL });
      mono(718, y + 5, POL[i], { 'font-size': 13.5, 'font-weight': 700, fill: deny ? BAD : GOOD, opacity: s > 0.6 ? 1 : 0 });
      if (o.sel) mono(938, y + 5, SEL[i], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.25) }); } }
  function counter(c, u) { const ed = c.beat.edges || {}, v = Object.values(ed).filter(Boolean), a = v.filter((x) => x === 'allow').length, b = v.filter((x) => x !== 'allow').length;
    if (!v.length) return; mono(712, 262, '허용 ' + a, { 'font-size': 16, 'font-weight': 800, fill: GOOD }); mono(800, 262, '차단 ' + b, { 'font-size': 16, 'font-weight': 800, fill: b ? BAD : MUT }); }
  function bannerLine(c, u) { const b = c.beat, col = b.bannerKind === 'warn' ? BAD : b.bannerKind === 'good' ? GOOD : INFO; if (!b.warningBanner) return;
    tx(20, 287, b.warningBanner, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.3) }); }
  // 아래: 그 beat 에 실행한 명령 / 적은 yaml
  function bottom(item, u) { if (!item) return;
    if (item.term) terminal(20, 296, 920, 122, item.term, Math.min(item.term.length, 0.6 + u * 1.4), { lh: 20, fs: 13.5 });
    else snippet(20, 300, item.yaml, { fs: 14, w: 920 }); }
  const ap = (k, n, u, a) => (k > n ? 1 : k === n ? pop(u, a) : 0);

  // ---------- 1. 기본: 모두 열림 ----------
  const T1 = [
    { term: ['$ kubectl get networkpolicy -A', 'No resources found.'] },
    { term: ['$ kubectl exec web-7d9 -- curl -s api:8080/health', '{"status":"ok"}     # 정상'] },
    { term: ['$ kubectl exec api-5b2 -- nc -zv db 5432', 'db (10.244.1.7:5432) open    # 정상'] },
    { term: ['$ kubectl exec attacker-cc -- nc -zv db 5432', ['db (10.244.1.7:5432) open    # 위험!', BAD]] },
    { term: ['$ kubectl exec attacker-cc -- curl -s api:8080/admin', ['{"users": [...]}             # 위험! 내부 API 노출', BAD]] },
    { term: ['# K8s 철학: "default open"', '#   → 빠른 시작에는 좋지만 production에는 부적합'] },
  ];
  const PROBE1 = [null, ['web', 'api'], ['api', 'db'], ['attacker', 'db'], ['attacker', 'api'], null];
  function s1(t, c) { const { k, u } = c;
    graph(t, c, { ports: true, fresh: PROBE1[k] ? [PROBE1[k].join('→')] : null, freshAt: 1.3 });
    if (PROBE1[k]) probe(PROBE1[k][0], PROBE1[k][1], 'allow', u, 0.2);
    if (k === 5) { const r = lerp(40, 330, E(u, 0.3, 1.8)); el('circle', { cx: P.attacker[0], cy: P.attacker[1], r, fill: 'var(--badbg)', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0.35 });
      tx(420, 240, 'attacker 가 닿는 범위', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) }); }
    policies(0, false, u); counter(c, u); bannerLine(c, u); bottom(T1[k], u); }

  // ---------- 2. default-deny ----------
  const T2 = [
    { yaml: ['kind: NetworkPolicy', '  name: default-deny-ingress', '  namespace: default'] },
    { yaml: ['  podSelector: {}              # namespace 안 모든 Pod', '  policyTypes:', '    - Ingress'] },
    { yaml: ['  name: default-deny-egress', '  policyTypes:', '    - Egress'] },
    { term: ['$ kubectl exec web-7d9     -- curl -m 2 api:8080', '# (timeout)', '$ kubectl exec attacker-cc -- nc -zv -w 2 db 5432', '# (timeout)'] },
    { yaml: ['  # ingress 규칙 없음 → 전부 차단', '  # egress 규칙 없음 → 전부 차단', '# DNS 등 필수 통신도 끊긴다 → 다음 단계에서 선택 허용'] },
  ];
  function s2(t, c) { const { k, u } = c;
    const ing = k === 1 ? E(u, 0.4, 1.2) : k > 1 ? 1 : 0, eg = k === 2 ? E(u, 0.4, 1.2) : k > 2 ? 1 : 0;
    graph(t, c, { area: k >= 1, ing, eg, dns: k === 4, fresh: k === 1 ? EDGES.map((e) => e[0] + '→' + e[1]) : null, freshAt: 1.0 });
    if (k === 1) { const r = lerp(30, 300, E(u, 0.2, 1.0)); el('circle', { cx: 300, cy: 150, r, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: 1 - E(u, 0.8, 1.2) });
      mono(300, 156, 'podSelector: {}', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.2) * (1 - fade(u, 1.4)) }); }
    if (k === 3) { probe('web', 'api', 'block', u, 0.2); probe('attacker', 'db', 'block', u, 0.9); }
    if (k === 4) { const [x1, y1] = P.web; el('path', { d: `M${x1 + 40},${y1 + 20} Q420,170 ${P.dns[0] - 30},${P.dns[1] - 14}`, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 6' }); cross(x1 + 56, y1 + 30, 7, pop(u, 0.6));
      mono(470, 160, 'DNS 53', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      mono(300, 150, 'ingress: [ ]   egress: [ ]', { 'font-size': 14.5, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); }
    policies(k >= 2 ? 2 : 1, k === 0 || k === 2, u, { draft: k === 0 }); counter(c, u); bannerLine(c, u); bottom(T2[k], u); }

  // ---------- 3. web → api 만 ----------
  const T3 = [
    { yaml: ['  podSelector:', '    matchLabels:', '      app: api                 # 대상: api Pod'] },
    { yaml: ['  ingress:', '    - from:', '              app: web         # 출처: web Pod 만'] },
    { yaml: ['      ports:', '        - protocol: TCP', '          port: 8080'] },
    { yaml: ['  podSelector: {}              # 모든 Pod 의 나가는 통신', '        - podSelector: {}      # 같은 ns Pod 로 나가기 허용', '              kubernetes.io/metadata.name: kube-system   # DNS 53'] },
    { term: ['$ kubectl exec web-7d9      -- curl -s api:8080/health', '{"status":"ok"}              # 허용'] },
    { term: ['$ kubectl exec attacker-cc  -- curl -m 2 api:8080', '# (timeout)                  # 차단 (default-deny + 매칭 안됨)', '$ kubectl exec cache-r4     -- curl -m 2 api:8080', '# (timeout)                  # 차단 (label 불일치)'] },
  ];
  function s3(t, c) { const { k, u } = c, egOpen = k >= 3;
    graph(t, c, { area: true, ing: 1, eg: 1, egOpen, dns: k >= 3, doors: k >= 1 ? { api: Math.PI } : {}, ports: true, fresh: k === 1 || k === 3 ? ['web→api'] : null, freshAt: 1.2 });
    if (k === 0) { el('circle', { cx: P.api[0], cy: P.api[1], r: 50 + 6 * Math.sin(t * 5), fill: 'none', stroke: ACC, 'stroke-width': 3 }); pill(P.api[0] + 80, P.api[1] + 62, 'app=api', ACC, pop(u, 0.4), { mono: true, fs: 14 }); }
    if (k === 1) pill(P.web[0] + 100, P.web[1] + 48, 'from: app=web', GOOD, pop(u, 0.3), { mono: true, fs: 14 });
    if (k === 2) pill(200, 52, ':8080 만', GOOD, pop(u, 0.4), { mono: true, fs: 14 });
    if (k >= 3) [['web', GOOD], ['api', GOOD]].forEach(([n], i) => { const [x, y] = P[n], g = k === 3 ? seg(u, 0.4 + i * 0.3, 1.2 + i * 0.3) : 1;
      if (g > 0) el('path', { d: `M${x + 30},${y + 26} Q${(x + P.dns[0]) / 2 + 40},${(y + P.dns[1]) / 2 + 60} ${lerp(x + 30, P.dns[0] - 28, g)},${lerp(y + 26, P.dns[1] - 12, g)}`, fill: 'none', stroke: GOOD, 'stroke-width': 1.8, 'stroke-dasharray': '3 4', opacity: k === 3 ? 1 : 0.6 }); });
    if (k === 3) { mono(500, 228, 'DNS 53 허용', { 'font-size': 14, fill: GOOD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(300, 20, '출발지 egress 와 도착지 ingress 가 둘 다 허용해야 통한다', { 'font-size': 14, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 4) probe('web', 'api', 'allow', u, 0.3);
    if (k === 5) { probe('attacker', 'api', 'block', u, 0.2); probe('api', 'cache', 'block', u, 99);
      const g = seg(u, 0.9, 2.0); if (g > 0) { const f = lerp(F0, 0.72, E(g, 0, 1)); el('circle', { cx: lerp(P.cache[0], P.api[0], f), cy: lerp(P.cache[1], P.api[1], f), r: 8, fill: BAD, stroke: PANEL, 'stroke-width': 2 }); } }
    policies(k >= 3 ? 4 : 3, k === 0 || k === 3, u); counter(c, u); bannerLine(c, u); bottom(T3[k], u); }

  // ---------- 4. api → db 만 ----------
  const T4 = [
    { yaml: ['  podSelector:', '    matchLabels:', '      app: db                  # 대상: db Pod'] },
    { yaml: ['  ingress:', '    - from:', '              app: api         # 출처: api Pod 만'] },
    { yaml: ['      ports:', '        - protocol: TCP', '          port: 5432'] },
    { term: ['$ kubectl exec api-5b2      -- nc -zv db 5432', 'db (10.244.1.7:5432) open    # 허용', '$ kubectl exec web-7d9      -- nc -zv -w 2 db 5432', '# (timeout)                  # 차단 (web 은 db 직접 접근 불가)'] },
    { term: ['$ kubectl exec attacker-cc  -- nc -zv -w 2 db 5432', '# (timeout)                  # 차단 (label 불일치)', '', '# Policy as Code — 누가 누구에게 접근할지 yaml 로 명시'] },
  ];
  function s4(t, c) { const { k, u } = c;
    graph(t, c, { area: true, ing: 1, eg: 1, egOpen: true, dns: true, doors: k >= 1 ? { api: Math.PI, db: Math.PI } : { api: Math.PI }, ports: true, fresh: k === 1 ? ['api→db'] : null, freshAt: 1.2 });
    if (k === 0) { el('circle', { cx: P.db[0], cy: P.db[1], r: 50 + 6 * Math.sin(t * 5), fill: 'none', stroke: ACC, 'stroke-width': 3 }); pill(P.db[0] - 10, P.db[1] + 76, 'app=db', ACC, pop(u, 0.4), { mono: true, fs: 14 }); }
    if (k === 1) pill(P.api[0] + 100, P.api[1] + 48, 'from: app=api', GOOD, pop(u, 0.3), { mono: true, fs: 14 });
    if (k === 2) pill(400, 52, ':5432 만', GOOD, pop(u, 0.4), { mono: true, fs: 14 });
    if (k === 3) { probe('api', 'db', 'allow', u, 0.2); probe('web', 'db', 'block', u, 1.2); }
    if (k === 4) probe('attacker', 'db', 'block', u, 0.3);
    policies(5, k === 0, u); counter(c, u); bannerLine(c, u); bottom(T4[k], u); }

  // ---------- 5. 결과: 의도한 그래프만 ----------
  const T5 = [
    { term: ['NAME                         POD-SELECTOR   AGE', 'allow-web-to-api             app=api        1m', 'allow-egress-in-ns-and-dns   <none>         1m', 'allow-api-to-db              app=db         30s'] },
    { term: ['$ kubectl exec web-7d9      -- curl -s api:8080/health', '{"status":"ok"}', '$ kubectl exec api-5b2      -- nc -zv db 5432', 'db (10.244.1.7:5432) open'] },
    { term: ['$ kubectl exec web-7d9      -- nc -zv -w 2 db 5432', '# (timeout)', '$ kubectl exec attacker-cc  -- nc -zv -w 2 db 5432', '# (timeout)'] },
    { term: ['$ kubectl exec attacker-cc  -- curl -m 2 api:8080', '# (timeout)'] },
    { term: ['#   1) default deny: 기본은 모두 차단', '#   2) explicit allow: 필요한 것만 명시 허용', '#   3) least privilege: 최소 권한 그래프', '#   4) policy as code: yaml 로 검토/리뷰 가능'] },
  ];
  function s5(t, c) { const { k, u } = c;
    graph(t, c, { area: true, ing: 1, eg: 1, egOpen: true, dns: true, doors: { api: Math.PI, db: Math.PI }, ports: k === 1 });
    if (k === 1) { probe('web', 'api', 'allow', u, 0.2); probe('api', 'db', 'allow', u, 1.1); }
    if (k === 2) { probe('web', 'db', 'block', u, 0.2); probe('attacker', 'db', 'block', u, 1.0); }
    if (k === 3) { probe('attacker', 'api', 'block', u, 0.2); const r = lerp(330, 44, E(u, 0.6, 1.8));
      el('circle', { cx: P.attacker[0], cy: P.attacker[1], r, fill: 'var(--badbg)', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0.35 });
      tx(150, 168, 'blast radius 최소', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 4) [['default deny', BAD], ['explicit allow', GOOD], ['least privilege', GOOD], ['policy as code', ACC]].forEach(([s, col], i) => pill(160 + i * 140 - (i > 1 ? 0 : 0), 20, s, col, pop(u, 0.3 + i * 0.35), { fs: 13.5, fill: PANEL }));
    policies(5, false, u); counter(c, u); if (k !== 4) bannerLine(c, u); bottom(T5[k], u); }

  const quiz = [
    { q: 'NetworkPolicy가 하나도 없을 때 attacker Pod는 db의 5432 포트에 붙을 수 있는가?',
      o: ['붙을 수 있다, 기본은 모두 열려 있다', '붙을 수 없다, 기본은 모두 막혀 있다', 'api를 거쳐야만 붙는다'], a: 0,
      why: '정책이 0개면 Pod 사이 통신에 제약이 없다. attacker → db도 web → api와 똑같이 open이 나온다.' },
    { q: 'podSelector: {}에 규칙 배열을 비운 Ingress 정책을 적용하면 무엇이 되는가?',
      o: ['attacker만 막힌다', '네임스페이스의 모든 Pod로 들어오는 통신이 막힌다', 'DNS만 막힌다'], a: 1,
      why: '빈 podSelector는 네임스페이스의 모든 Pod를 고른다. 허용 규칙이 없으니 web → api 같은 정상 통신도 끊긴다.' },
    { q: 'default-deny-egress가 있을 때 web → api:8080을 열려면 무엇이 필요한가?',
      o: ['api 쪽 ingress 허용만 있으면 된다', 'api 쪽 ingress 허용과 web 쪽 egress 허용 둘 다', 'web 쪽 egress 허용만 있으면 된다'], a: 1,
      why: '연결은 출발지 egress와 도착지 ingress가 모두 허용해야 성립한다. 그래서 allow-egress-in-ns-and-dns를 함께 둔다.' },
    { q: 'allow-api-to-db를 적용한 뒤 web이 db 5432에 직접 붙으면 어떻게 되는가?',
      o: ['api와 같은 네임스페이스라 열린다', 'db가 api로 넘겨준다', 'timeout으로 막힌다'], a: 2,
      why: 'db로 들어오는 출처는 app=api 하나뿐이다. web은 반드시 api를 거쳐야 한다.' },
    { q: '마지막 상태에서 허용된 통신은 7개 중 몇 개인가?',
      o: ['4개', '2개', '7개'], a: 1,
      why: 'web → api와 api → db 두 개만 열려 있고 나머지 5개는 막혀 있다. attacker는 어디에도 닿지 못한다.' },
  ];

  const summary = [
    'NetworkPolicy가 없으면 Pod끼리 모두 통한다. 침투한 Pod도 db에 그대로 닿는다.',
    'podSelector: {}에 규칙이 빈 정책으로 들어오는 통신과 나가는 통신을 모두 막는다.',
    '그다음 출처 라벨과 포트로 필요한 길만 연다. 나가는 쪽 허용과 DNS 53도 함께 연다.',
    '마지막에는 web에서 api, api에서 db 두 길만 남고 attacker는 어디에도 닿지 못한다.',
  ];
  const review = [
    { q: 'default-deny 두 개를 적용한 뒤 api가 db 이름을 못 찾는다며 실패한다. 먼저 의심할 것은?',
      o: ['db Pod의 메모리 부족', '나가는 DNS 53 통신이 막혀 있다', 'attacker Pod가 살아 있다'], a: 1,
      why: '규칙이 빈 egress 정책은 DNS 조회까지 막는다. kube-system으로 나가는 53번을 열어야 이름이 풀린다.' },
    { q: 'allow-web-to-api만 추가했는데 web → api가 여전히 timeout이다. default-deny-egress도 있다. 빠진 것은?',
      o: ['web에서 나가는 쪽을 허용하는 egress 정책', 'api의 포트를 5432로 바꾸기', 'default-deny-ingress 지우기'], a: 0,
      why: 'ingress 허용은 api가 받는 쪽만 연다. web이 내보내는 쪽도 egress 정책으로 열어야 연결이 된다.' },
    { q: 'cache Pod가 api를 부르지 못한다는 보고가 왔다. 현재 정책에서 이것은 무엇인가?',
      o: ['버그라서 default-deny를 지워야 한다', '의도된 차단이며, 필요하면 cache 출처를 허용하는 정책을 더한다', 'CNI가 고장 난 것이다'], a: 1,
      why: 'api로 들어오는 출처는 app=web뿐이라 cache는 막힌다. 새 통신은 정책을 추가해 명시적으로 연다.' },
  ];

  R.page({ title: 'Pod 통신 그래프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
