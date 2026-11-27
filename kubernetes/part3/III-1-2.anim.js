/* III-1-2 Ingress (HTTP 라우팅) — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    G, person, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 부품 ----------
  function pod(cx, cy, o) { o = o || {}; const r = o.r || 15, g = G(cx, cy, o.s, o.op), col = o.stroke || INK;
    const pts = [0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 3 * i + Math.PI / 6; return (r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1); }).join(' ');
    el('polygon', { points: pts, fill: PANEL, stroke: col, 'stroke-width': 2.2 }, g); el('rect', { x: -5, y: -5, width: 10, height: 10, rx: 2, fill: 'none', stroke: col, 'stroke-width': 1.6 }, g); return g; }
  const SV = { api: INFO, admin: WARN, web: ACC };
  const SVN = ['api', 'admin', 'web'];
  // Service 판: 이름 + 아래 한 줄(host 칸) + 오른쪽 Pod 둘
  function svcCard(cx, cy, name, line, col, o) { o = o || {}; const g = card(cx, cy, 168, 52, { rx: 10, stroke: col, sw: 2.4, s: o.s, op: o.op, fill: PANEL });
    tx(-72, -4, name, { 'font-size': 15, 'font-weight': 800, fill: col, class: 'mono' }, g);
    if (line) tx(-72, 16, line, { 'font-size': 13.5, fill: o.lineCol || MUT, 'font-weight': 600, class: 'mono' }, g);
    if (!o.noPods && (o.s ?? 1) > 0.5) { pod(cx + 106, cy - 12, { stroke: col, op: o.op }); pod(cx + 106, cy + 18, { stroke: col, op: o.op }); }
    return g; }
  // 클라우드 LB 판
  function lbBox(cx, cy, top, line, o) { o = o || {}; const col = o.stroke || INK, g = card(cx, cy, o.w || 150, 54, { rx: 10, stroke: col, fill: o.fill || PANEL, sw: 2.4, s: o.s, op: o.op });
    tx(0, line ? -5 : 6, top, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }, g);
    if (line) mono(0, 16, line, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.lineCol || MUT, 'font-weight': 700 }, g); return g; }
  // Ingress Controller (nginx Pod 를 품은 판)
  function ctrl(cx, cy, o) { o = o || {}; const g = card(cx, cy, 150, 92, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.6, s: o.s });
    tx(0, -22, 'ingress-nginx', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC }, g);
    tx(0, -3, 'Controller', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    if (o.sub) mono(0, 26, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.subCol || INK, 'font-weight': 700 }, g); return g; }
  const ap = (k, n, u, a, d) => (k > n ? 1 : k === n ? pop(u, a, d) : 0);
  const af = (k, n, u, a) => (k > n ? 1 : k === n ? fade(u, a) : 0);
  // 맨 아래 상태 한 줄 (페이지 데이터의 warn)
  function status(c, u) { const w = ((c.beat.dataState || {}).warn || '').replace(/^[^\w가-힣(]+/, ''); if (!w) return;
    tx(20, 408, w, { 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.2) }); }
  const CL = [60, 205];

  // ---------- 1. 서비스마다 LB ----------
  const Y1 = [95, 205, 315];
  function s1(t, c) { const { k, u } = c, ds = c.beat.dataState, svs = ds.services;
    person(CL[0], CL[1], '사용자', {});
    svs.forEach((s, i) => { const y = Y1[i], col = SV[s.key], born = i === svs.length - 1 && k === i && k <= 2, sc = born ? pop(u, 0.2) : 1;
      const ipShow = k === 3 ? clamp((u - 0.3 - i * 0.35) / 0.6) : k > 3 ? 1 : 0, ip = s.host;
      lbBox(270, y, 'LB #' + (i + 1), ipShow > 0 ? ip.slice(0, Math.round(ip.length * ipShow)) : '(IP 대기)', { s: sc, stroke: BAD, lineCol: ipShow > 0 ? INK : MUT });
      svcCard(540, y, s.name, k >= 3 ? 'NodePort ' + (31000 + i) : 'LoadBalancer', col, { s: born ? pop(u, 0.5) : 1, lineCol: k >= 3 ? INK : MUT });
      grow(347, y, 454, y, born ? seg(u, 0.6, 1.0) : 1, GRID, { plain: true, sw: 2.2 });
      grow(CL[0] + 28, CL[1], 193, y, born ? seg(u, 0.3, 0.8) : 1, GRID, { plain: true, sw: 2 }); });
    // 지금 강조된 경로
    const tp = (ds.trafficPath || [])[1]; const li = tp ? +tp.split('-')[1] : -1;
    if (li >= 0 && k <= 3) dot([[CL[0] + 28, CL[1]], [193, Y1[li]], [347, Y1[li]], [454, Y1[li]]], seg(u, 0.9, 2.3), BAD, 7);
    // 월 청구서
    const bx = 740, by = 40, n = ds.lbCount;
    el('rect', { x: bx, y: by, width: 200, height: 300, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(bx + 16, by + 28, '월 청구서', { 'font-size': 15, 'font-weight': 800 });
    for (let i = 0; i < n; i++) { const fresh = i === n - 1 && k === i && k <= 2, s = fresh ? E(u, 1.0, 1.6) : 1;
      el('rect', { x: bx + 20, y: by + 250 - (i + 1) * 62 * s, width: 160, height: 56 * s, rx: 6, fill: 'var(--badbg)', stroke: BAD, 'stroke-width': 1.8 });
      if (s > 0.9) tx(bx + 100, by + 250 - (i + 1) * 62 + 33, 'LB #' + (i + 1), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD }); }
    mono(bx + 100, by + 282, '× ' + n, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD });
    if (k === 4) { [['IP', 3], ['도메인', 3], ['인증서', 3]].forEach(([a, v], i) => pill(bx - 290 + i * 110, 380, a + ' × ' + v, BAD, pop(u, 0.3 + i * 0.3), { fs: 14 }));
      banner(540, 30, '서비스 100개면 LB 100개?', pop(u, 1.4)); return; }
    status(c, u); }

  // ---------- 2. Ingress 도입 ----------
  const Y2 = [95, 205, 315];
  function s2(t, c) { const { k, u } = c, ds = c.beat.dataState;
    person(CL[0], CL[1], '사용자', {});
    // LB 3 → 1
    if (k === 0) [0, 2].forEach((i) => { const g = E(u, 0.3, 1.3); if (g < 1) lbBox(220, lerp(Y2[i], 205, g), 'LB', null, { s: 1 - g * 0.6, stroke: BAD, op: 1 - g }); });
    lbBox(220, 205, 'LB 1개', 'LoadBalancer', { stroke: INK, s: k === 0 ? 0.7 + 0.3 * E(u, 1.0, 1.6) : 1 });
    grow(CL[0] + 28, CL[1], 143, 205, 1, MUT, { sw: 2.2 });
    ctrl(410, 205, { s: ap(k, 0, u, 1.2), sub: k >= 3 ? 'class: nginx' : null, subCol: ACC });
    grow(297, 205, 333, 205, k === 0 ? seg(u, 1.4, 1.8) : 1, MUT, { sw: 2.2 });
    // Service 3개
    ds.services.forEach((s, i) => { const y = Y2[i], col = SV[s.key], isLb = s.host === 'LoadBalancer', flip = k === 1 && i === 0 || k === 2 && i > 0;
      svcCard(700, y, s.name, s.host, col, { lineCol: isLb ? BAD : ACC });
      if (isLb) card(640, y - 42, 72, 26, { rx: 8, text: '전용 LB', fs: 13.5, stroke: BAD, color: BAD, sw: 1.6 });
      if (flip) { const g = E(u, 0.3, 1.0); if (g < 1) card(640, y - 42, 72, 26, { rx: 8, text: '전용 LB', fs: 13.5, stroke: BAD, color: BAD, sw: 1.6, op: 1 - g, s: 1 + g * 0.3 }); } });
    // Ingress 자원 (규칙 그릇)
    if (k >= 2) { const s = ap(k, 2, u, 0.8); const g = card(410, 70, 190, 64, { rx: 6, stroke: INK, sw: 2, s, fill: PANEL });
      tx(-80, -8, 'kind: Ingress', { 'font-size': 14, class: 'mono', 'font-weight': 700 }, g); tx(-80, 14, 'site-ingress', { 'font-size': 14, class: 'mono', fill: ACC, 'font-weight': 700 }, g);
      if (k >= 3) { el('line', { x1: 410, y1: 102, x2: 410, y2: 159, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); }
      if (k >= 3) mono(410, 380, 'rules: [ ]', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: af(k, 3, u, 0.5) }); }
    if (k === 3) { dot([[CL[0] + 28, CL[1]], [143, 205], [335, 205], [430, 205]], seg(u, 0.6, 1.6), INK, 7);
      pill(560, 205, '404', BAD, pop(u, 1.7), { mono: true, fs: 15 }); }
    if (k === 4) { // 비용 막대: ×3 → ×1
      el('rect', { x: 20, y: 290, width: 330, height: 100, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      tx(36, 318, '전', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(36, 362, '후', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      el('rect', { x: 64, y: 304, width: 240, height: 20, rx: 4, fill: BAD, opacity: 0.8 }); mono(312, 320, '×3', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      const g = E(u, 0.4, 1.4); el('rect', { x: 64, y: 348, width: lerp(240, 80, g), height: 20, rx: 4, fill: GOOD }); mono(lerp(312, 152, g), 364, '×1', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      pill(560, 360, '인증서 관리도 1곳', GOOD, pop(u, 1.6), { fs: 14 }); return; }
    status(c, u); }

  // ---------- 3. host 기반 ----------
  const Y3 = [100, 205, 310];
  function s3(t, c) { const { k, u } = c, ds = c.beat.dataState, routes = ds.routes;
    person(CL[0], CL[1], '사용자', {});
    lbBox(185, 205, 'LB', '203.0.113.42', { w: 130 });
    ctrl(345, 205, {});
    grow(CL[0] + 28, CL[1], 118, 205, 1, MUT); grow(252, 205, 268, 205, 1, MUT);
    // 규칙 표
    tx(470, 50, 'rules', { 'font-size': 14, 'font-weight': 800, fill: MUT, class: 'mono' });
    routes.forEach((r, i) => { const key = r.service.replace('-svc', ''), col = SV[key] || MUT, fresh = (k === 0 && i === 0) || (k === 2 && i === 1) || (k === 3 && i === 2);
      const s = fresh ? pop(u, 0.2) : 1, y = Y3[i];
      card(560, y, 190, 50, { rx: 8, stroke: col, sw: 2, s, fill: PANEL });
      mono(475, y - 4, r.match, { 'font-size': 14, 'font-weight': 700, fill: INK, opacity: s > 0.5 ? 1 : 0 });
      mono(475, y + 16, '→ ' + r.service, { 'font-size': 13.5, fill: col, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 });
      grow(420, 205, 463, y, fresh ? seg(u, 0.4, 0.9) : 1, GRID, { plain: true });
      if (SV[key]) grow(657, y, 735, y, k === 1 && i === 0 ? seg(u, 0.4, 1.0) : 1, col); });
    ['api', 'admin', 'web'].forEach((key, i) => svcCard(830, Y3[i], key + '-svc', 'ClusterIP', SV[key], { noPods: true }));
    // Host 헤더가 실린 요청 하나
    const hostOf = ['api.example.com', 'api.example.com', 'admin.example.com', 'web.example.com', null][k];
    if (hostOf) { const i = routes.findIndex((r) => r.match === hostOf), y = Y3[Math.max(0, i)], col = SV[hostOf.split('.')[0]];
      fly(CL[0] + 20, 120, 330, 140, seg(u, 0.2, 1.0), 'Host: ' + hostOf, { mono: true, fill: col, stay: u < 1.2 });
      const routed = routes[i] && routes[i].service !== '(미정)';
      if (routed) dot([[420, 205], [463, y], [657, y], [744, y]], seg(u, 1.2, 2.4), col, 7);
      else if (u > 1.3) { mono(560, y + 50, '보낼 곳 없음', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) }); } }
    if (k === 4) { el('rect', { x: 20, y: 286, width: 330, height: 112, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(34, 308, 'DNS A 레코드', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      ['api', 'admin', 'web'].forEach((d, i) => { const op = fade(u, 0.3 + i * 0.3); mono(34, 334 + i * 22, (d + '.example.com').padEnd(18), { 'font-size': 14, fill: SV[d], 'font-weight': 700, opacity: op }); mono(336, 334 + i * 22, '203.0.113.42', { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700, opacity: op }); });
      el('line', { x1: 185, y1: 280, x2: 185, y2: 236, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 1.4) });
      return; }
    status(c, u); }

  // ---------- 4. path 기반 ----------
  const Y4 = [130, 225, 320];
  function urlBar(path, u, o) { o = o || {}; const x = 40, y = 30, host = 'example.com';
    el('rect', { x, y, width: 420, height: 44, rx: 22, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    mono(x + 22, y + 28, host, { 'font-size': 16, fill: MUT, 'font-weight': 700 });
    const px = x + 22 + tw(host, 16);
    if (o.strip) { const cut = o.strip; mono(px, y + 28, cut, { 'font-size': 16, fill: BAD, 'font-weight': 800, 'text-decoration': 'line-through', opacity: 1 - 0.6 * E(u, 1.0, 1.6) });
      mono(px + tw(cut, 16), y + 28, path.slice(cut.length), { 'font-size': 16, fill: INK, 'font-weight': 800 }); }
    else mono(px, y + 28, path, { 'font-size': 16, fill: o.col || INK, 'font-weight': 800 }); }
  function s4(t, c) { const { k, u } = c, ds = c.beat.dataState, routes = ds.routes;
    ctrl(330, 225, { sub: 'example.com' });
    tx(450, 92, 'paths (긴 것부터 맞춘다)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    routes.forEach((r, i) => { const p = r.match.replace('example.com', '') || '/', key = r.service.replace('-svc', ''), col = SV[key] || MUT, y = Y4[i];
      const fresh = k === i + 1 && k <= 3 || k === 0, s = fresh ? pop(u, 0.2) : 1;
      card(540, y, 160, 48, { rx: 8, stroke: col, sw: 2, s, fill: PANEL, dash: SV[key] ? null : '5 4' });
      mono(475, y + 6, p === '/*' ? '/ ?' : p, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: s > 0.5 ? 1 : 0 });
      grow(405, 225, 458, y, fresh ? seg(u, 0.4, 0.9) : 1, GRID, { plain: true });
      if (SV[key]) { grow(622, y, 700, y, fresh ? seg(u, 0.8, 1.3) : 1, col); svcCard(800, y, r.service, null, col, { noPods: true, s: fresh ? pop(u, 1.0) : 1 }); } });
    if (k === 0) { urlBar('/*', u, { col: MUT }); sub(540, 190, '경로 규칙이 아직 없다', fade(u, 1.0), { 'font-size': 14 }); }
    const demo = [null, ['/api/users', 0], ['/admin/login', 1], ['/products', 2], ['/api/users', 0], null][k];
    if (demo) { const [path, ri] = demo, col = SV[routes[ri].service.replace('-svc', '')];
      urlBar(path, u, k === 4 ? { strip: '/api' } : {});
      dot([[250, 74], [260, 225], [405, 225], [458, Y4[ri]], [622, Y4[ri]], [712, Y4[ri]]], seg(u, 0.5, 2.0), col, 7);
      if (k === 4) { mono(800, Y4[0] + 46, '받는 경로 /users', { 'text-anchor': 'middle', 'font-size': 14, fill: col, 'font-weight': 800, opacity: fade(u, 1.8) });
        mono(560, 58, 'rewrite-target: /$2', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.3) }); }
      if (k === 3) sub(540, 375, '/api · /admin에 안 걸리면 /가 받는다', fade(u, 1.8), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
    if (k === 5) { [['/api/users', 0], ['/admin/login', 1], ['/products', 2]].forEach(([p, ri], i) => { const col = SV[routes[ri].service.replace('-svc', '')];
        mono(40, 50 + i * 28, 'GET example.com' + p, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) });
        dot([[200, 130], [260, 225], [405, 225], [458, Y4[ri]], [622, Y4[ri]], [712, Y4[ri]]], seg(u, 0.4 + i * 0.4, 1.6 + i * 0.4), col, 7); }); }
    status(c, u); }

  // ---------- 5. TLS 종단 ----------
  const Y5 = [110, 215, 320];
  function s5(t, c) { const { k, u } = c, ds = c.beat.dataState;
    person(CL[0], 215, '브라우저', {});
    ctrl(360, 215, {});
    // 바깥 구간: HTTPS (두꺼운 이중선 + 자물쇠)
    el('line', { x1: CL[0] + 28, y1: 215, x2: 283, y2: 215, stroke: ACC, 'stroke-width': 7, opacity: 0.25 });
    el('line', { x1: CL[0] + 28, y1: 215, x2: 283, y2: 215, stroke: ACC, 'stroke-width': 2.4 });
    lock(170, 196, true, ACC, ap(k, 0, u, 0.4));
    mono(170, 245, 'HTTPS :443', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, 'font-weight': 800, opacity: af(k, 0, u, 0.6) });
    // Secret site-tls (열쇠)
    const sx = 360, sy = 70, ss = ap(k, 0, u, 0.9);
    const g = card(sx, sy, 170, 50, { rx: 8, stroke: WARN, sw: 2.2, s: ss, fill: PANEL });
    el('circle', { cx: -62, cy: 0, r: 8, fill: 'none', stroke: WARN, 'stroke-width': 2.5 }, g); el('line', { x1: -54, y1: 0, x2: -38, y2: 0, stroke: WARN, 'stroke-width': 2.5 }, g);
    tx(-28, -3, 'Secret', { 'font-size': 13.5, fill: MUT }, g); tx(-28, 16, 'site-tls', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, class: 'mono' }, g);
    grow(sx, sy + 26, sx, 166, k === 0 ? seg(u, 1.3, 1.8) : 1, WARN, { dash: '4 4' });
    // cert-manager
    if (k >= 1) { const cs = ap(k, 1, u, 0.2); card(130, 70, 170, 50, { rx: 8, text: 'cert-manager', fs: 15, stroke: INK, s: cs });
      sub(130, 112, "Let's Encrypt", cs, { 'font-size': 13.5 });
      if (k === 1) fly(215, 70, 275, 70, seg(u, 0.9, 1.8), '인증서', { fill: WARN });
      if (k === 1) sub(250, 146, '수동 발급 작업이 사라진다', fade(u, 2.0), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
    // 안쪽 구간: 평문 HTTP 로 Service 까지
    ['api', 'admin', 'web'].forEach((key, i) => { const y = Y5[i], col = SV[key], g2 = k >= 2 ? (k === 2 ? seg(u, 0.4 + i * 0.2, 1.0 + i * 0.2) : 1) : 0;
      svcCard(760, y, key + '-svc', k >= 3 ? 'HTTP 내부' : 'ClusterIP', col, {});
      if (g2 > 0) grow(436, 215, 674, y, g2, col, { sw: 1.8 }); });
    if (k === 2) { lock(452, 192, false, ACC, pop(u, 0.2)); mono(575, 202, 'Host 헤더로 분기', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
      dot([[CL[0] + 28, 215], [436, 215], [674, Y5[0]]], seg(u, 1.2, 2.5), INFO, 7); }
    if (k === 3) { mono(575, 202, 'HTTP :80 (평문)', { 'text-anchor': 'middle', 'font-size': 14, fill: INK, 'font-weight': 800, opacity: fade(u, 0.3) });
      [0, 1, 2].forEach((i) => dot([[CL[0] + 28, 215], [436, 215], [674, Y5[i]]], seg(u, 0.5 + i * 0.4, 1.7 + i * 0.4), SV[SVN[i]], 6));
      sub(880, 378, 'Pod는 인증서를 모른다', fade(u, 1.6), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
    if (k === 4) { // 갱신 시간축 (숫자 없이 순서만)
      const x0 = 60, x1 = 560, y = 360, g3 = E(u, 0.2, 1.2);
      el('line', { x1: x0, y1: y, x2: lerp(x0, x1, g3), y2: y, stroke: MUT, 'stroke-width': 3 });
      [['발급', x0, ACC], ['갱신', 400, GOOD], ['만료', x1, BAD]].forEach(([s, x, col], i) => { const op = fade(u, 0.4 + i * 0.4);
        el('circle', { cx: x, cy: y, r: 7, fill: col, opacity: op }); tx(x, y + 28, s, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: op }); });
      el('path', { d: `M400,${y - 12} Q230,${y - 70} ${x0 + 10},${y - 14}`, fill: 'none', stroke: GOOD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 1.6) });
      sub(230, y - 52, '만료 전에 cert-manager가 다시 받는다', fade(u, 1.8), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); return; }
    status(c, u); }

  const quiz = [
    { q: '서비스 3개를 모두 type: LoadBalancer로 만들면 무엇이 몇 개 생기는가?',
      o: ['LB 1개와 외부 IP 3개', 'LB 3개와 외부 IP 3개', 'LB 3개와 외부 IP 1개'], a: 1,
      why: 'Service마다 클라우드 LB가 하나씩 생기고 IP도 따로 붙는다. 203.0.113.10, .11, .12처럼 세 개가 된다.' },
    { q: 'Ingress를 도입한 뒤 api-svc의 type은 무엇으로 바꾸는가?',
      o: ['ClusterIP', 'NodePort', 'LoadBalancer 그대로'], a: 0,
      why: '외부 진입은 Ingress Controller 앞의 LB 1개가 맡는다. 뒤의 Service는 ClusterIP로 두면 전용 LB가 사라진다.' },
    { q: 'host 기반 라우팅에서 Ingress가 요청을 나누는 기준은 무엇인가?',
      o: ['요청한 사용자의 IP', 'Host 헤더의 도메인', 'LB의 IP 주소'], a: 1,
      why: '세 도메인은 모두 같은 IP 203.0.113.42를 가리킨다. Ingress는 Host 헤더를 보고 api-svc, admin-svc, web-svc로 보낸다.' },
    { q: 'example.com/products 요청은 이 Ingress에서 어디로 가는가?',
      o: ['api-svc', 'admin-svc', 'web-svc'], a: 2,
      why: '/api와 /admin 어느 쪽에도 맞지 않으므로 기본 경로 /를 맡은 web-svc가 받는다.' },
    { q: 'tls 섹션을 켠 뒤 Ingress에서 api-svc로 가는 구간은 어떤 프로토콜인가?',
      o: ['HTTPS 그대로', '평문 HTTP', 'Pod마다 다른 인증서로 다시 암호화'], a: 1,
      why: 'Ingress가 site-tls 인증서로 TLS를 풀고 ClusterIP에는 평문 HTTP로 넘긴다. Pod는 인증서를 다루지 않는다.' },
  ];

  const summary = [
    'Service마다 LoadBalancer를 두면 LB와 IP, 인증서가 서비스 수만큼 늘어난다.',
    'Ingress를 쓰면 LB는 Controller 앞 하나만 남고 뒤의 Service는 ClusterIP가 된다.',
    'host 규칙은 Host 헤더로, path 규칙은 경로로 나눈다. 더 길게 맞는 경로가 먼저다.',
    'tls 섹션을 켜면 Ingress가 TLS를 풀고 안쪽에는 평문 HTTP로 넘긴다.',
  ];
  const review = [
    { q: 'Ingress를 만들었는데 모든 요청이 404를 돌려준다. 먼저 볼 곳은?',
      o: ['rules와 요청 Host·경로의 매칭', 'LB 개수가 3개인지', 'Pod 인증서의 만료 여부'], a: 0,
      why: 'ingressClassName만 있고 rules가 비어 있으면 보낼 곳이 없어 404가 난다. 규칙과 요청의 Host·경로를 맞춰 본다.' },
    { q: 'api.example.com과 admin.example.com을 같은 Ingress로 받으려 한다. DNS에는 무엇을 넣는가?',
      o: ['도메인마다 다른 LB IP', '두 도메인 모두 Ingress 앞 LB IP 하나', 'Service의 ClusterIP'], a: 1,
      why: 'A 레코드는 모두 203.0.113.42 하나를 가리키고, 나누는 일은 Ingress가 Host 헤더로 한다.' },
    { q: '/api 규칙으로 보낸 요청을 백엔드가 /api/users 그대로 받아 404를 낸다. 고칠 곳은?',
      o: ['web-svc의 기본 경로 /', 'tls의 Secret 이름', 'rewrite-target 설정'], a: 2,
      why: 'rewrite-target /$2를 쓰면 /api/users가 /users로 바뀌어 넘어간다. 백엔드는 접두사를 몰라도 된다.' },
  ];

  R.page({ title: 'Ingress 라우팅', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
