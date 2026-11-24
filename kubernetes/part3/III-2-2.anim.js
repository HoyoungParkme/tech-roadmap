/* III-2-2 Service 디스커버리 (DNS) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    G, cross, check, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 부품 ----------
  function pod(cx, cy, name, o) { o = o || {}; const r = o.r || 24, g = G(cx, cy, o.s, o.op), col = o.stroke || INK;
    const pts = [0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 3 * i + Math.PI / 6; return (r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1); }).join(' ');
    el('polygon', { points: pts, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 3, fill: 'none', stroke: col, 'stroke-width': 1.8 }, g);
    if (name) tx(0, r + 19, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: o.color || col }, g);
    if (o.ip) mono(0, r + 38, o.ip, { 'text-anchor': 'middle', 'font-size': 14, fill: o.ipCol || MUT, 'font-weight': 700 }, g);
    return g; }
  function svc(cx, cy, name, ip, o) { o = o || {}; const col = o.stroke || ACC, g = card(cx, cy, o.w || 180, 58, { rx: 12, stroke: col, fill: o.fill || ACCBG, sw: 2.5, s: o.s, op: o.op });
    tx(0, -5, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g);
    mono(0, 17, ip, { 'text-anchor': 'middle', 'font-size': 14, fill: o.ipCol || INK, 'font-weight': 700 }, g); return g; }
  const PC = { cyan: ACC, amber: WARN, fuchsia: INFO, emerald: GOOD, slate: MUT, gray: MUT };
  // 호출 문자열을 색 조각으로: http:// + parts
  // 호출 문자열을 색 조각으로: http:// + parts (한 줄 text 에 tspan 으로 이어 붙여 글자 사이가 벌어지지 않게)
  function callBar(x, y, parts, o) { o = o || {}; const fs = o.fs || 17, all = [['http://', { fill: MUT, 'font-weight': 700 }]];
    parts.forEach((p, i) => { const sh = o.show ? o.show(i) : 1; all.push([p.text, Object.assign({ fill: PC[p.color] || INK, 'font-weight': 800, 'fill-opacity': sh }, p.strike ? { 'text-decoration': 'line-through' } : {})]); });
    const e = R.spans(x, y, all, { 'font-size': fs });
    const len = (a, n) => { try { return e.getSubStringLength(a, n); } catch (er) { return tw('x'.repeat(n), fs); } };
    let at = 'http://'.length;
    parts.forEach((p, i) => { const sh = o.show ? o.show(i) : 1, col = PC[p.color] || INK;
      if (o.labels && p.label !== '·' && sh > 0) tx(x + len(0, at) + len(at, p.text.length) / 2, y + 26, p.label, { 'font-size': 13.5, fill: col, 'text-anchor': 'middle', 'font-weight': 700, opacity: sh });
      at += p.text.length; }); }
  function problem(c, u) { const p = c.beat.problem; if (!p) return; tx(480, 408, p, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) }); }
  const ap = (k, n, u, a) => (k > n ? 1 : k === n ? pop(u, a) : 0);

  // ---------- 1. IP 하드코딩 ----------
  const F = [140, 190], A = [760, 190];
  function s1(t, c) { const { k, u } = c, b = c.beat;
    zone(20, 20, 920, 360, null, { fill: SOFT });
    pod(F[0], F[1], 'frontend-aa1', {});
    // env 카드
    const ec = card(F[0] + 10, 70, 250, 62, { rx: 8, stroke: INK, sw: 1.8, fill: PANEL, s: ap(k, 0, u, 0.2) });
    mono(-112, -8, 'env: API_URL', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }, ec);
    mono(-112, 16, 'http://10.244.2.42:8080', { 'font-size': 15, fill: k >= 2 ? BAD : INK, 'font-weight': 800, 'text-decoration': k === 5 ? 'line-through' : null }, ec);
    // api Pod
    const crashed = k >= 2, cg = k === 2 ? E(u, 0.2, 0.9) : 1;
    if (!crashed || cg < 1) { pod(A[0], A[1], 'api Pod', { ip: '10.244.2.42', op: crashed ? 1 - cg : 1 }); if (crashed) cross(A[0], A[1], 16, pop(u, 0.2)); }
    if (crashed) { el('rect', { x: A[0] - 70, y: A[1] - 36, width: 140, height: 104, rx: 10, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: k === 2 ? fade(u, 0.8) : 1 });
      mono(A[0], A[1] + 4, '10.244.2.42', { 'text-anchor': 'middle', 'font-size': 14, fill: OFF, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.8) : 1 });
      sub(A[0], A[1] + 28, '빈 주소', k === 2 ? fade(u, 0.9) : 1, { 'font-size': 14 });
      pod(A[0], A[1] + 130, 'api Pod (새로 뜸)', { ip: b.targetIp, ipCol: WARN, s: k === 2 ? pop(u, 1.2) : 1, stroke: INK }); }
    if (k === 2) { clock(F[0] + 260, 300, 18, E(u, 0.2, 1.0), WARN, null); tx(F[0] + 284, 306, 't=1d · Node 재시작 / OOMKilled', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.4) }); }
    // 호출
    if (k === 1) { tx(F[0], F[1] + 90, 't=0', { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', 'font-weight': 800 });
      dot([[F[0] + 28, F[1]], [A[0] - 28, A[1]]], seg(u, 0.3, 1.6), ACC, 8); if (u > 1.6) { check(A[0] + 56, A[1] - 30, 11, pop(u, 1.6)); mono(A[0] + 74, A[1] - 24, '200', { 'font-size': 16, fill: GOOD, 'font-weight': 800 }); } }
    if (k === 3) { dot([[F[0] + 28, F[1]], [A[0] - 72, A[1]]], seg(u, 0.2, 1.4), BAD, 8);
      if (u > 1.4) { cross(A[0] - 72, A[1], 12, pop(u, 1.4)); pill(A[0] - 200, A[1] - 50, 'connection refused', BAD, pop(u, 1.6), { mono: true, fs: 14 }); } }
    if (k === 4) { tx(470, 44, '모두 IP 가 바뀌는 경우', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.2) });
      [['HPA 스케일 아웃', '새 Pod 가 추가된다'], ['롤링 업데이트', '이전 Pod 종료'], ['Node drain', '다른 노드로 이주'], ['CrashLoop 회복', '같은 Pod 도 새 IP']].forEach(([a, d], i) => {
      const x = 375 + (i % 2) * 200, y = 90 + Math.floor(i / 2) * 76, s = pop(u, 0.3 + i * 0.35); card(x, y, 188, 64, { rx: 10, stroke: WARN, sw: 2, s, fill: PANEL });
      tx(x, y - 5, a, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.4 + i * 0.35) }); tx(x, y + 17, d, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); }); }
    if (k === 5) { pill(470, 70, 'Service 이름으로 부르자', GOOD, pop(u, 0.6), { fs: 15 }); sub(470, 104, 'IP 하드코딩은 PoC 에서만', fade(u, 1.0), { 'font-size': 14 }); }
    problem(c, u); }

  // ---------- 2. CoreDNS ----------
  const Q = { f: [110, 250], dns: [470, 82], svc: [470, 262], p1: [820, 165], p2: [820, 265] };
  function coreDns(state, t) { const col = state === 'resolving' ? WARN : state === 'resolved' ? GOOD : INK;
    card(Q.dns[0], Q.dns[1], 250, 96, { rx: 12, stroke: col, sw: 2.4, fill: PANEL });
    tx(Q.dns[0] - 110, Q.dns[1] - 22, 'CoreDNS', { 'font-size': 16, 'font-weight': 800, fill: col });
    mono(Q.dns[0] - 110, Q.dns[1], 'kube-dns 10.96.0.10', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    pod(Q.dns[0] - 50, Q.dns[1] + 30, null, { r: 13, stroke: col }); pod(Q.dns[0] - 10, Q.dns[1] + 30, null, { r: 13, stroke: col });
    tx(Q.dns[0] + 20, Q.dns[1] + 35, 'Pod 2개', { 'font-size': 13.5, fill: MUT });
    if (state === 'resolving') el('circle', { cx: Q.dns[0] + 100, cy: Q.dns[1] - 26, r: 6 + 3 * Math.sin(t * 8), fill: WARN }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    pod(Q.f[0], Q.f[1], 'frontend-aa1', {});
    coreDns(b.coreDnsState, t);
    svc(Q.svc[0], Q.svc[1], 'api-svc', b.targetIp, { s: ap(k, 0, u, 0.3), ipCol: b.targetIp.startsWith('(') ? MUT : INK });
    pod(Q.p1[0], Q.p1[1], null, {}); pod(Q.p2[0], Q.p2[1], null, {}); tx(Q.p1[0] + 34, Q.p1[1] + 5, 'api Pod', { 'font-size': 14, 'font-weight': 700 }); tx(Q.p2[0] + 34, Q.p2[1] + 5, 'api Pod', { 'font-size': 14, 'font-weight': 700 });
    grow(Q.svc[0] + 92, Q.svc[1], Q.p1[0] - 30, Q.p1[1], 1, GRID, { plain: true }); grow(Q.svc[0] + 92, Q.svc[1], Q.p2[0] - 30, Q.p2[1], 1, GRID, { plain: true });
    sub(Q.svc[0] + 210, Q.svc[1] + 6, 'kube-proxy', 1, { 'font-size': 13.5 });
    pill(Q.f[0], Q.f[1] - 70, 'http://api-svc', ACC, ap(k, 0, u, 0.6), { mono: true, fs: 14 });
    if (k === 1) { const s = '10.96.180.21'; el('rect', { x: Q.svc[0] - 70, y: Q.svc[1] + 6, width: 140, height: 20, rx: 4, fill: 'var(--hl)', opacity: 0.6 * (1 - fade(u, 1.6)) });
      sub(Q.svc[0], Q.svc[1] + 52, 'Pod 가 바뀌어도 이 IP 는 그대로', fade(u, 1.2), { 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
    if (k === 2) { dot([[Q.f[0] + 26, Q.f[1] - 20], [Q.dns[0] - 126, Q.dns[1] + 20]], seg(u, 0.3, 1.3), WARN, 8); fly(Q.f[0] + 40, Q.f[1] - 110, 250, 150, seg(u, 0.3, 1.3), 'nslookup api-svc', { mono: true, fill: WARN, stay: true }); }
    if (k === 3) { fly(Q.dns[0] - 120, Q.dns[1] + 40, 250, 160, seg(u, 0.2, 1.0), '→ 10.96.180.21', { mono: true, fill: GOOD, stay: true });
      mono(Q.dns[0] + 140, Q.dns[1] + 70, 'api-svc.default.svc.cluster.local', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 4) { dot([[Q.f[0] + 26, Q.f[1]], [Q.svc[0] - 92, Q.svc[1]], [Q.svc[0] + 92, Q.svc[1]], [Q.p2[0] - 26, Q.p2[1]]], seg(u, 0.3, 1.9), ACC, 8);
      if (u > 1.9) { check(Q.p2[0] + 40, Q.p2[1] - 34, 10, pop(u, 1.9)); mono(Q.p2[0] + 58, Q.p2[1] - 28, '200 OK', { 'font-size': 15, fill: GOOD, 'font-weight': 800 }); }
      sub(Q.f[0] + 30, Q.f[1] + 80, 'IP 는 몰라도 된다', fade(u, 1.2), { 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
    if (k === 5) terminal(20, 318, 920, 98, ['$ kubectl logs -n kube-system coredns-558bd4d5db-4gh2k | tail -1   (예시)', '[INFO] 10.244.1.5:50284 - 4373 "A IN api-svc.default.svc.cluster.local. udp 51 false 512"', '       NOERROR qr,aa,rd 102 0.0012s'], Math.min(3, 0.6 + u * 1.4), { lh: 18, fs: 13.5 }); }

  // ---------- 3. resolv.conf ----------
  const SR = ['default.svc.cluster.local', 'svc.cluster.local', 'cluster.local'];
  function file(x, y, k, u) { el('rect', { x, y, width: 400, height: 128, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(x + 14, y + 22, '/etc/resolv.conf', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    const rows = [[['search ', MUT], [SR[0] + ' ', ACC], [SR[1] + ' ', INFO], [SR[2], WARN]], [['nameserver ', MUT], ['10.96.0.10', INK]], [['options ', MUT], ['ndots:5', INK]]];
    rows.forEach((r, i) => { const op = k === 1 ? fade(u, 0.2 + i * 0.5) : k > 1 ? 1 : 0; let cx = x + 14;
      if (i === 0) { mono(cx, y + 50, 'search', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: op }); SR.forEach((s, j) => mono(x + 86, y + 50 + j * 18, s, { 'font-size': 13.5, fill: [ACC, INFO, WARN][j], 'font-weight': 700, opacity: op })); return; }
      r.forEach(([s, col]) => { mono(cx, y + 50 + (i + 2) * 18 - 2, s, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: op }); cx += tw(s, 14); }); }); }
  function s3(t, c) { const { k, u } = c;
    pod(80, 80, 'frontend-aa1', { s: ap(k, 0, u, 0.1) });
    if (k <= 4) file(140, 30, Math.max(1, k), k === 0 ? 0 : u);
    if (k === 0) { sub(340, 200, '짧은 이름이 왜 통할까', fade(u, 0.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // 후보 FQDN
    if (k >= 2 && k <= 3) { tx(580, 56, '"api-svc" 에 차례로 붙여 본다', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      SR.forEach((s, i) => { const y = 90 + i * 52, op = k === 2 ? fade(u, 0.3 + i * 0.4) : i === 0 ? 1 : 0.35;
        el('rect', { x: 580, y: y - 22, width: 360, height: 38, rx: 8, fill: k === 3 && i === 0 ? 'var(--goodbg)' : PANEL, stroke: k === 3 && i === 0 ? GOOD : GRID, 'stroke-width': 1.8, opacity: op });
        mono(594, y + 2, 'api-svc.', { 'font-size': 14.5, 'font-weight': 700, opacity: op }); mono(594 + tw('api-svc.', 14.5), y + 2, s, { 'font-size': 14.5, fill: [ACC, INFO, WARN][i], 'font-weight': 700, opacity: op });
        mono(568, y + 2, String(i + 1), { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 800, opacity: op }); });
      if (k === 3) { check(925, 90, 9, pop(u, 0.5)); mono(760, 268, '→ 10.96.180.21   200 OK', { 'font-size': 15, fill: GOOD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
        sub(760, 296, '같은 default ns 라 1번에서 끝', fade(u, 1.4), { 'font-size': 14 }); } }
    if (k === 4) { el('rect', { x: 580, y: 40, width: 350, height: 230, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' });
      tx(596, 64, 'kube-system', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      svc(755, 112, 'kube-dns', '10.96.0.10', { s: pop(u, 0.3), w: 200 });
      mono(755, 168, '53/UDP, 53/TCP', { 'font-size': 14, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, opacity: fade(u, 0.8) });
      pod(705, 220, null, { r: 16, s: pop(u, 1.0) }); pod(805, 220, null, { r: 16, s: pop(u, 1.2) }); sub(755, 258, 'CoreDNS Pod', fade(u, 1.3), { 'font-size': 13.5 });
      grow(540, 126, 650, 112, seg(u, 0.4, 1.0), ACC); }
    if (k === 5) { // 점 개수와 ndots:5
      const x0 = 300, x1 = 860, X = (v) => x0 + (x1 - x0) * v / 6, y = 250;
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: MUT, 'stroke-width': 2 });
      for (let v = 0; v <= 6; v++) { el('line', { x1: X(v), y1: y - 5, x2: X(v), y2: y + 5, stroke: MUT }); mono(X(v), y + 22, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
      tx(x0 - 14, y + 5, '점 개수', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 700 });
      el('line', { x1: X(5), y1: 196, x2: X(5), y2: y + 30, stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) });
      mono(X(5), 186, 'ndots:5', { 'font-size': 15, fill: WARN, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      [['api-svc', 0], ['api.example.com', 2], ['a.b.c.d.e.f', 5]].forEach(([s, d], i) => { const s2 = pop(u, 0.7 + i * 0.45); el('circle', { cx: X(d), cy: y, r: 8 * s2, fill: d < 5 ? ACC : INK });
        mono(X(d), y + 50 + (i % 2) * 22, s, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 800, fill: d < 5 ? ACC : INK, opacity: fade(u, 0.8 + i * 0.45) }); });
      tx(X(2.4), 214, 'search 먼저', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(X(5.55), 214, '그대로 먼저', { 'font-size': 14.5, 'font-weight': 800, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 6) { tx(480, 200, 'curl https://google.com  (점 1개 < ndots 5)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono' });
      SR.concat(['']).forEach((s, i) => { const y = 236 + i * 40, ok = i === 3, op = fade(u, 0.2 + i * 0.45);
        mono(300, y, 'google.com' + (s ? '.' + s : ''), { 'font-size': 14.5, 'font-weight': 700, fill: ok ? GOOD : MUT, opacity: op });
        mono(760, y, ok ? '성공' : 'NXDOMAIN', { 'font-size': 14.5, 'font-weight': 800, fill: ok ? GOOD : BAD, opacity: op, 'text-anchor': 'end' });
        mono(280, y, String(i + 1), { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: op }); });
      pill(860, 270, 'ndots:2', ACC, pop(u, 2.2), { mono: true, fs: 14 }); sub(860, 300, '점 2개 이상은', fade(u, 2.3), { 'font-size': 13.5 }); sub(860, 320, '바로 조회', fade(u, 2.3), { 'font-size': 13.5 }); } }

  // ---------- 4. 다른 namespace ----------
  const NS = { def: [40, 80, 400, 260], prod: [520, 80, 400, 260] };
  function nsBox(b, title, col, op) { const [x, y, w, h] = b; el('rect', { x, y, width: w, height: h, rx: 12, fill: SOFT, stroke: col || GRID, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: op ?? 1 });
    tx(x + 16, y + 24, title, { 'font-size': 14.5, 'font-weight': 800, fill: col || MUT, opacity: op ?? 1 }); }
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k === 4) { [['default', 'dev 버전'], ['staging', 'staging 버전'], ['production', 'prod 버전']].forEach(([n, v], i) => { const x = 40 + i * 300, s = pop(u, 0.2 + i * 0.35);
        nsBox([x, 90, 280, 230], n + ' ns', [MUT, INFO, WARN][i], s > 0.3 ? 1 : 0); svc(x + 140, 190, 'api-svc', v, { s, stroke: [ACC, INFO, WARN][i], w: 190 }); });
      sub(480, 360, '이름은 같고 ns 가 버전을 가른다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { [['api-svc', 'default ns 로 간다', BAD], ['api-svc.production', 'ns 명시', GOOD], ['api-svc.production.svc', '객체 종류까지', GOOD], ['api-svc.production.svc.cluster.local', '풀 FQDN', GOOD]].forEach(([s, d, col], i) => {
        const y = 70 + i * 74, w = 200 + i * 150, op = fade(u, 0.2 + i * 0.4);
        el('rect', { x: 60, y: y - 26, width: w * E(u, 0.2 + i * 0.4, 0.8 + i * 0.4), height: 40, rx: 8, fill: col === BAD ? 'var(--badbg)' : 'var(--goodbg)', stroke: col, 'stroke-width': 1.8 });
        mono(76, y, s, { 'font-size': 15, 'font-weight': 800, opacity: op });
        (col === BAD ? cross : check)(40, y - 6, 9, op); tx(Math.min(80 + w, 930), y + 34, d, { 'font-size': 13.5, fill: col, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); });
      tx(480, 400, '뒤로 갈수록 명시적이고 search 에 덜 기댄다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    nsBox(NS.def, 'default ns', MUT); nsBox(NS.prod, 'production ns', WARN);
    pod(130, 230, 'frontend-aa1', {});
    svc(330, 160, 'api-svc', '10.96.180.21', {});
    svc(720, 160, 'api-svc', '10.96.207.42', { stroke: WARN, fill: PANEL, s: ap(k, 0, u, 0.3) });
    if (k === 0) sub(720, 216, '이름은 같고 ClusterIP 는 다르다', fade(u, 1.0), { 'font-size': 14 });
    // 호출 문자열
    const nParts = b.parts.length; callBar(60, 50, b.parts, { fs: 17, show: (i) => (k === 2 && i > 0 ? fade(u, 0.3 + i * 0.3) : 1) });
    if (k === 1) { dot([[156, 214], [240, 175]], seg(u, 0.3, 1.2), ACC, 8);
      if (u > 1.4) { pill(720, 260, 'production 에 닿지 않음', BAD, pop(u, 1.4), { fs: 14 }); } }
    if (k >= 2 && k <= 3) { const g = k === 2 ? seg(u, 1.0, 2.2) : 1; dot([[156, 220], [480, 250], [630, 175]], k === 2 ? g : seg(u, 0.2, 1.4), WARN, 8);
      if (k === 2) mono(720, 230, '→ 10.96.207.42', { 'font-size': 15, fill: WARN, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }
    if (k === 3 && u > 1.4) { check(820, 140, 10, pop(u, 1.4)); terminal(540, 236, 370, 92, ['HTTP/1.1 200 OK', ['X-Pod-Namespace: production', WARN]], Math.min(2, (u - 1.4) * 2 + 0.5), { lh: 20, fs: 14 }); }
    if (k === 6) { el('line', { x1: 480, y1: 90, x2: 480, y2: 340, stroke: BAD, 'stroke-width': 6, opacity: fade(u, 0.3) });
      dot([[156, 220], [470, 220]], seg(u, 0.5, 1.4), WARN, 8); if (u > 1.4) cross(480, 220, 12, pop(u, 1.4));
      mono(720, 260, 'namespaceSelector', { 'font-size': 15, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      sub(720, 290, '이름이 풀려도 통신 허용은 별개', fade(u, 1.6), { 'font-size': 14, fill: INK, 'font-weight': 700 }); }
    if (k === 7) { card(330, 290, 190, 54, { rx: 27, stroke: WARN, sw: 2.4, s: pop(u, 0.3), fill: PANEL }); mono(330, 286, 'external-db', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: WARN, opacity: fade(u, 0.4) });
      sub(330, 306, 'ExternalName', fade(u, 0.4), { 'font-size': 13.5 });
      grow(426, 290, 620, 290, seg(u, 0.9, 1.6), WARN, { dash: '7 5' }); tx(523, 280, 'CNAME', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
      mono(720, 296, 'db.amazonaws.com', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, opacity: fade(u, 1.6) }); }
    problem(c, u); }

  // ---------- 5. FQDN 과 Corefile ----------
  const PLUG = ['errors', 'health', 'ready', 'kubernetes', 'forward', 'cache', 'loop', 'reload', 'loadbalance'];
  function chain(k, u, hi) { const x0 = 40, w = 92, y = 120;
    el('rect', { x: 20, y: 66, width: 920, height: 104, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(36, 90, '.:53 {', { 'font-size': 15, 'font-weight': 800, fill: INK });
    PLUG.forEach((p, i) => { const x = x0 + i * (w + 8), on = hi === p, s = k === 1 ? pop(u, 0.2 + i * 0.12) : 1;
      card(x + w / 2, y + 12, w, 40, { rx: 8, stroke: on ? ACC : GRID, fill: on ? ACCBG : PANEL, sw: on ? 2.6 : 1.5, s, text: p, fs: 13.5, mono: true, color: on ? ACC : INK }); }); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { const g = card(300, 150, 300, 150, { rx: 10, stroke: INK, sw: 2, s: pop(u, 0.2), fill: PANEL });
      mono(-130, -44, 'kind: ConfigMap', { 'font-size': 15, 'font-weight': 800 }, g); mono(-130, -18, 'name: coredns', { 'font-size': 15, fill: ACC, 'font-weight': 700 }, g);
      mono(-130, 8, 'namespace: kube-system', { 'font-size': 15, fill: MUT, 'font-weight': 700 }, g); mono(-130, 40, 'data.Corefile: |', { 'font-size': 15, fill: INFO, 'font-weight': 700 }, g);
      grow(452, 150, 600, 150, seg(u, 0.9, 1.5), ACC); card(720, 150, 200, 70, { rx: 12, text: 'CoreDNS 동작', fs: 16, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.4) });
      sub(480, 290, '이 ConfigMap 하나가 클러스터 DNS 를 정한다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k <= 3) { chain(k, u, k === 2 ? 'kubernetes' : k === 3 ? 'forward' : null);
      if (k === 1) sub(480, 230, '53번으로 온 질의를 플러그인이 순서대로 처리한다', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 2) { pill(220, 250, '*.cluster.local', ACC, pop(u, 0.2), { mono: true, fs: 15 }); grow(320, 230, 360, 165, seg(u, 0.5, 1.0), ACC);
        card(500, 330, 200, 54, { rx: 10, text: 'API 서버', fs: 15, stroke: INK, s: pop(u, 1.1) }); grow(406, 165, 470, 302, seg(u, 1.0, 1.6), MUT);
        mono(700, 330, 'ttl 30', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); sub(700, 356, '답을 30초 기억', fade(u, 1.9), { 'font-size': 13.5 }); }
      if (k === 3) { pill(260, 250, 'google.com', INK, pop(u, 0.2), { mono: true, fs: 15 }); grow(320, 236, 450, 165, seg(u, 0.5, 1.0), MUT);
        card(560, 330, 260, 54, { rx: 10, text: '상위 DNS (노드 resolv.conf)', fs: 14.5, stroke: INK, s: pop(u, 1.1) }); grow(500, 165, 540, 302, seg(u, 1.0, 1.6), MUT);
        mono(800, 232, 'cache 30', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.8), 'text-anchor': 'middle' }); }
      return; }
    if (k === 4 || k === 5) { const parts = b.parts, fs = 26, x0 = 60;
      callBar(x0, 130, parts, { fs, labels: true, show: (i) => (k === 4 ? fade(u, 0.2 + i * 0.22) : 1) });
      if (k === 5) { mono(x0, 240, '10-244-1-5.default.', { 'font-size': 20, 'font-weight': 700, fill: INK, opacity: fade(u, 0.3) });
        mono(x0 + tw('10-244-1-5.default.', 20), 240, 'pod', { 'font-size': 20, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) });
        mono(x0 + tw('10-244-1-5.default.pod', 20), 240, '.cluster.local', { 'font-size': 20, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.6) });
        sub(x0 + 300, 274, 'Pod 레코드는 svc 대신 pod, IP 의 점을 대시로', fade(u, 1.0), { 'font-size': 14, 'text-anchor': 'start' });
        sub(480, 340, 'cluster.local 은 kubeadm 기본값, kubelet --cluster-domain 으로 바꾼다', fade(u, 1.6), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      return; }
    if (k === 6) { mono(60, 90, 'nslookup -q=SRV _http._tcp.api-svc.production', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      const F5 = [['0', 'priority'], ['100', 'weight'], ['80', 'port'], ['api-svc.production.svc.cluster.local', 'host']]; let x = 60;
      F5.forEach(([v, l], i) => { const w = tw(v, 20) + 24, op = fade(u, 0.6 + i * 0.35), col = i === 2 ? ACC : INK;
        el('rect', { x, y: 150, width: w, height: 44, rx: 8, fill: i === 2 ? ACCBG : PANEL, stroke: col, 'stroke-width': 2, opacity: op });
        mono(x + w / 2, 179, v, { 'font-size': 20, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op });
        tx(x + w / 2, 222, l, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700, opacity: op }); x += w + 10; });
      sub(480, 300, 'IP 가 아니라 포트와 호스트 이름이 온다 (포트 이름 http)', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 7) { terminal(60, 60, 840, 250, ['$ kubectl run -it --rm dnsutils --image=registry.k8s.io/e2e-test-images/jessie-dnsutils:1.3 \\', '    --restart=Never -- bash',
        '$ nslookup api-svc.production.svc.cluster.local', '$ dig +short api-svc.production.svc.cluster.local', '$ getent hosts api-svc.production'], Math.min(5, 0.5 + u * 2), { lh: 30, fs: 14.5 });
      sub(480, 350, '임시 Pod 에서 이름 해석을 직접 확인한다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    [['<svc>.<ns> 로 부른다', 'search 의존을 줄인다'], ['ndots 를 낮춘다', '외부 도메인 지연 감소'], ['CoreDNS Pod 2개 이상', '단일 장애점 피하기'], ['도메인 변경은 동시에', 'kubelet + Corefile']].forEach(([a, d], i) => {
      const x = 250 + (i % 2) * 460, y = 120 + Math.floor(i / 2) * 140, s = pop(u, 0.2 + i * 0.35);
      card(x, y, 420, 100, { rx: 12, stroke: ACC, sw: 2, s, fill: PANEL }); mono(x - 190, y - 6, String(i + 1), { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3 + i * 0.35) });
      tx(x - 160, y - 6, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) }); tx(x - 160, y + 22, d, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); }); }

  const quiz = [
    { q: 'frontend가 api Pod IP 10.244.2.42를 env에 박아 두었다. api Pod가 다시 뜬 뒤 무엇이 일어나는가?',
      o: ['새 IP 10.244.2.87로 자동으로 따라간다', '.42로 계속 접속해 connection refused가 난다', 'Pod IP는 재기동해도 바뀌지 않는다'], a: 1,
      why: '재기동한 Pod는 새 IP를 받는다. env는 그대로 .42라서 아무도 없는 주소로 접속하게 된다.' },
    { q: 'frontend Pod 안에서 nslookup api-svc를 하면 누가 답하는가?',
      o: ['api Pod 자신', 'kube-dns Service 10.96.0.10 뒤의 CoreDNS', '노드의 /etc/hosts'], a: 1,
      why: 'Pod의 nameserver는 10.96.0.10이다. CoreDNS가 api-svc.default.svc.cluster.local의 ClusterIP 10.96.180.21을 돌려준다.' },
    { q: '같은 namespace에서 api-svc 한 단어로 통하는 이유는 무엇인가?',
      o: ['resolv.conf의 search 첫 줄이 default.svc.cluster.local이라서', 'CoreDNS가 모든 이름을 api-svc로 바꿔서', 'kube-proxy가 이름을 IP로 바꿔서'], a: 0,
      why: '짧은 이름 뒤에 search 도메인이 차례로 붙는다. 첫 후보 api-svc.default.svc.cluster.local에서 바로 맞는다.' },
    { q: 'default ns의 Pod가 production의 api-svc를 부르려면 어떤 이름을 쓰는가?',
      o: ['api-svc', 'production', 'api-svc.production'], a: 2,
      why: 'api-svc만 쓰면 default ns의 같은 이름 Service가 잡힌다. 두 번째 라벨에 production을 붙여야 10.96.207.42로 간다.' },
    { q: 'api-svc.production.svc.cluster.local에서 svc 자리는 무엇을 뜻하는가?',
      o: ['Service 객체라는 표시', 'namespace 이름', '클러스터 도메인'], a: 0,
      why: '왼쪽부터 Service 이름, namespace, 객체 종류, 클러스터 도메인이다. Pod 레코드면 이 자리에 pod가 온다.' },
  ];

  const summary = [
    'Pod는 다시 뜰 때마다 새 IP를 받는다. IP를 박아 두면 언젠가 통신이 끊긴다.',
    'Service를 만들면 CoreDNS가 이름을 등록하고 ClusterIP를 돌려준다.',
    '짧은 이름은 resolv.conf의 search 도메인이 붙어서 풀린다. 첫 후보가 자기 namespace다.',
    '다른 namespace는 api-svc.production처럼 부른다. 풀 이름은 이름, ns, svc, 도메인 순이다.',
  ];
  const review = [
    { q: 'staging의 frontend가 api-svc를 불렀는데 production 데이터가 아니라 staging 응답이 왔다. 이유는?',
      o: ['CoreDNS 캐시가 오래돼서', '짧은 이름은 자기 namespace의 search 도메인부터 붙여 찾기 때문', 'ClusterIP가 두 namespace에서 같아서'], a: 1,
      why: 'search 첫 줄이 staging.svc.cluster.local이라 같은 ns의 api-svc가 먼저 맞는다. 다른 ns는 .production을 붙여야 한다.' },
    { q: '외부 API를 자주 부르는 Pod에서 DNS 지연이 크다. 로그에 NXDOMAIN이 여러 번 보인다. 먼저 손볼 것은?',
      o: ['CoreDNS의 kubernetes 플러그인 ttl', 'Pod의 dnsConfig로 ndots를 낮추기', 'Service를 ExternalName으로 바꾸기'], a: 1,
      why: 'ndots:5에서는 점이 적은 외부 이름도 search 후보부터 헛돈다. ndots를 낮추면 점이 충분한 이름은 바로 조회한다.' },
    { q: 'api-svc.production이 잘 풀리는데 실제 호출은 timeout이다. 다음으로 확인할 것은?',
      o: ['NetworkPolicy가 namespace 간 통신을 막는지', 'search 도메인 순서', 'FQDN의 cluster.local 철자'], a: 0,
      why: '이름 해석과 통신 허용은 별개다. 이름이 풀려도 namespaceSelector 정책이 막으면 연결되지 않는다.' },
  ];

  R.page({ title: '이름으로 부르는 Service', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
