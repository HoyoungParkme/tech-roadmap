/* III-1-1 Service 4가지 타입 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    G, person, dbIcon, cross, check, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 쿠버네티스 부품 ----------
  // Pod: 육각형 + 안쪽 컨테이너 칸, 이름은 아래
  function pod(cx, cy, name, o) { o = o || {}; const r = o.r || 22, g = G(cx, cy, o.s, o.op), col = o.stroke || INK;
    const pts = [0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 3 * i + Math.PI / 6; return (r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1); }).join(' ');
    el('polygon', { points: pts, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.5, 'stroke-dasharray': o.dash }, g);
    el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 3, fill: 'none', stroke: col, 'stroke-width': 1.8 }, g);
    if (name) tx(o.nx || 0, r + 19, name, { 'text-anchor': o.anchor || 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: o.color || col }, g);
    return g; }
  // Service: 둥근 판 + 이름 + (IP)
  function svc(cx, cy, name, ip, o) { o = o || {}; const w = o.w || 176, h = ip ? 58 : 42, col = o.stroke || ACC;
    const g = card(cx, cy, w, h, { rx: 12, stroke: col, fill: o.fill || ACCBG, sw: 2.5, s: o.s, op: o.op, dash: o.dash });
    tx(0, ip ? -5 : 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }, g);
    if (ip) mono(0, 18, ip, { 'text-anchor': 'middle', 'font-size': 14, fill: o.ipCol || INK, 'font-weight': 700 }, g);
    return g; }
  // kubectl get 결과 표. cols [[머리, 폭]], rows [[칸…]], o.col(r,c) 강조색, o.show(r,c) 0→1
  function ktable(x, y, cols, rows, o) { o = o || {}; const rh = 27, W = cols.reduce((a, c) => a + c[1], 0) + 24, op = o.op ?? 1;
    el('rect', { x, y, width: W, height: rh * (rows.length + 1) + 12, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    let cx = x + 12;
    cols.forEach(([h, w], c) => { mono(cx, y + 24, h, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op });
      rows.forEach((r, i) => { const v = r[c]; if (v == null) return; const s = o.show ? o.show(i, c) : 1; if (s <= 0) return; const col = o.col && o.col(i, c);
        mono(cx, y + 24 + rh * (i + 1), v, { 'font-size': 14, fill: col || INK, 'font-weight': col ? 800 : 500, opacity: s * op }); });
      cx += w; });
    return W; }
  const ap = (k, n, u, a, d) => (k > n ? 1 : k === n ? pop(u, a, d) : 0);   // n 번째 beat 에 튀어나와 남는다
  const af = (k, n, u, a) => (k > n ? 1 : k === n ? fade(u, a) : 0);         // n 번째 beat 에 서서히 보이고 남는다
  const cluster = (x, y, w, h, title, o) => { o = o || {}; zone(x, y, w, h, title, { fill: SOFT, stroke: o.stroke || GRID, dash: '7 6', sw: o.sw || 2, color: o.color }); };

  // ---------- 1. ClusterIP ----------
  const S1 = { sx: 520, sy: 205, cx: 285, ox: 78 };
  const WEB = [[810, 92], [810, 202], [810, 312]];
  function s1(t, c) { const { k, u } = c;
    const glow = k === 1 ? E(u, 0.3, 1.2) : k >= 1 ? 1 : 0;
    cluster(165, 20, 780, 390, '클러스터 · default 네임스페이스', { stroke: glow > 0.5 ? ACC : GRID, sw: glow > 0.5 ? 2.5 : 2, color: glow > 0.5 ? ACC : MUT });
    if (k >= 1) pill(820, 22, '클러스터 안에서만 보인다', ACC, k === 1 ? pop(u, 1.0) : 1, { fs: 13.5, fill: PANEL });
    // web Pod 3개 (app=web)
    WEB.forEach(([x, y], i) => { const live = k >= 2 ? 1 : 0.45;
      pod(x, y, null, { op: live, stroke: k >= 2 ? INK : MUT });
      mono(x + 34, y + 5, 'app=web', { 'font-size': 14, fill: k >= 2 ? ACC : MUT, 'font-weight': 700, opacity: live }); });
    // selector 선 + 포트
    if (k >= 2) WEB.forEach(([x, y], i) => { const g = k === 2 ? seg(u, 0.9 + i * 0.25, 1.7 + i * 0.25) : 1;
      grow(S1.sx + 88, S1.sy, x - 26, y, g, ACC, { sw: 2.4 });
      if (g >= 1) mono(lerp(S1.sx + 88, x - 26, 0.62), lerp(S1.sy, y, 0.62) - 8, '8080', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle' }); });
    if (k === 2) fly(S1.sx, S1.sy - 60, 810, 202, seg(u, 0.2, 1.0), 'selector app=web', { mono: true });
    // Service
    const ip = k <= 0 ? null : k <= 2 ? (Math.floor(t * 2) % 2 ? 'IP 할당 대기' : 'IP 할당 대기 …') : '10.96.5.21';
    svc(S1.sx, S1.sy, k === 0 ? 'Service web' : 'ClusterIP · web', ip, { s: k === 0 ? pop(u, 0.3) : 1, dash: k === 0 ? '6 5' : null, ipCol: k >= 3 ? ACC : MUT });
    if (k === 0) sub(S1.sx, S1.sy + 50, '타입 · 대상 Pod 미지정', fade(u, 0.9), { 'font-size': 14 });
    if (k >= 2) mono(S1.sx + 80, S1.sy - 36, ':80', { 'font-size': 14, fill: ACC, 'font-weight': 800, opacity: k === 2 ? fade(u, 0.5) : 1 });
    if (k === 1) sub(S1.sx, S1.sy + 52, 'type 생략 = ClusterIP', fade(u, 0.8), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    // kubectl get svc
    if (k === 3) ktable(190, 292, [['NAME', 52], ['TYPE', 98], ['CLUSTER-IP', 112], ['EXTERNAL-IP', 118], ['PORT(S)', 70]],
      [['web', 'ClusterIP', '10.96.5.21', '<none>', '80/TCP']], { show: (r, cc) => fade(u, 0.3 + cc * 0.3), col: (r, cc) => (cc === 2 ? ACC : cc === 3 ? MUT : null) });
    // 내부 Pod 에서 호출
    if (k >= 4) { pod(S1.cx, S1.sy, 'client Pod', { s: k === 4 ? pop(u, 0.2) : 1 });
      if (k === 4) { pill(S1.cx, S1.sy - 62, 'curl http://web', INK, pop(u, 0.4), { mono: true, fs: 13.5 });
        dot([[S1.cx + 26, S1.sy], [S1.sx - 88, S1.sy], [S1.sx + 88, S1.sy], [WEB[1][0] - 26, WEB[1][1]]], seg(u, 0.9, 2.2), ACC, 7);
        mono(S1.cx - 70, S1.sy + 82, 'web.default.svc.cluster.local', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); } }
    // 외부에서는 닿지 않는다
    if (k === 5) { person(S1.ox, S1.sy, '외부', { s: pop(u, 0.2) });
      const g = E(u, 0.6, 1.5); el('line', { x1: S1.ox + 26, y1: S1.sy, x2: lerp(S1.ox + 26, 160, g), y2: S1.sy, stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '5 5' });
      if (g >= 1) cross(165, S1.sy, 11, pop(u, 1.5));
      pill(S1.sx, S1.sy + 64, 'EXTERNAL-IP <none>', MUT, pop(u, 1.0), { mono: true, fs: 13.5 });
      pill(300, 360, '백엔드 API · DB · 내부 마이크로서비스', ACC, pop(u, 1.9), { fs: 14 }); } }

  // ---------- 2. NodePort ----------
  const ND = [{ name: 'node-1', ip: '10.0.1.11', y: 75 }, { name: 'node-2', ip: '10.0.1.12', y: 205 }, { name: 'node-3', ip: '10.0.1.13', y: 335 }];
  const NX = 330, NW = 590, NH = 104;
  function nodes(o) { o = o || {};
    ND.forEach((n, i) => { const top = n.y - NH / 2, hot = o.hot;
      el('rect', { x: NX, y: top, width: NW, height: NH, rx: 12, fill: SOFT, stroke: hot ? BAD : GRID, 'stroke-width': hot ? 2.5 : 1.8 });
      tx(NX + 52, top + 26, n.name, { 'font-size': 15, 'font-weight': 700 });
      mono(NX + 52, top + 48, n.ip, { 'font-size': 14, fill: hot ? BAD : MUT, 'font-weight': hot ? 800 : 500 });
      card(NX + 270, n.y, 112, 32, { rx: 8, text: 'kube-proxy', fs: 14, stroke: GRID, sw: 1.6, color: MUT });
      pod(NX + 470, n.y - 8, 'web', { r: 19, nx: 34, anchor: 'start', fs: 14 }); }); }
  // 노드 왼쪽 끝의 포트 자리 (o.u 로 튀어나옴, o.text 없으면 빈칸)
  function port(i, text, s, col) { const n = ND[i]; card(NX, n.y, 76, 30, { rx: 8, text: text || '?', fs: 14, mono: true, stroke: col || ACC, fill: text ? ACCBG : PANEL, color: col || ACC, s, dash: text ? null : '4 4' }); }
  function s2(t, c) { const { k, u } = c, P = [78, 205];
    nodes({ hot: k === 4 });
    person(P[0], P[1], '외부 손님', {});
    // Service 판 (왼쪽 위)
    card(150, 40, 230, 50, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.2 });
    tx(150, 36, 'Service web', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
    tx(150, 56, k === 0 ? 'ClusterIP → NodePort' : 'NodePort · 10.96.5.21', { 'text-anchor': 'middle', 'font-size': 13.5, fill: INK, 'font-weight': 600, opacity: k === 0 ? fade(u, 0.3) : 1 });
    // 포트 자리
    ND.forEach((n, i) => { const sIn = k === 0 ? pop(u, 0.8 + i * 0.25) : 1, filled = k >= 2 || (k === 1 && u > 0.4 + i * 0.3);
      port(i, filled ? ':30080' : null, k === 1 && filled ? pop(u, 0.4 + i * 0.3) : sIn, k === 4 ? BAD : ACC); });
    if (k === 0) sub(150, 120, '내부 ClusterIP 는 그대로', fade(u, 1.6), { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    // 30000~32767 범위 눈금
    if (k === 1) { const x0 = 30, x1 = 270, y = 370, g = E(u, 0.3, 1.2);
      el('line', { x1: x0, y1: y, x2: lerp(x0, x1, g), y2: y, stroke: MUT, 'stroke-width': 6, 'stroke-linecap': 'round' });
      mono(x0, y + 24, '30000', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) }); mono(x1, y + 24, '32767', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.9) });
      const mx = x0 + (x1 - x0) * 80 / 2767; el('circle', { cx: mx, cy: y, r: 8 * pop(u, 1.4), fill: ACC });
      mono(mx + 4, y - 16, '30080', { 'font-size': 14, fill: ACC, 'font-weight': 800, opacity: fade(u, 1.5) });
      tx(x0, y - 44, 'nodePort 범위 (기본값)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.3) }); }
    // PORT(S) 칸이 바뀐다
    if (k === 2) { const y = 300;
      el('rect', { x: 14, y, width: 290, height: 100, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      mono(28, y + 28, 'PORT(S)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      const sw = E(u, 0.5, 1.3);
      mono(132, y + 28, sw < 0.5 ? '80/TCP' : '80:30080/TCP', { 'font-size': 14.5, fill: sw < 0.5 ? INK : ACC, 'font-weight': 800, opacity: Math.abs(sw - 0.5) * 2 });
      mono(28, y + 60, 'EXTERNAL-IP', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
      mono(132, y + 60, '<none>', { 'font-size': 14.5, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.5) });
      tx(28, y + 88, '대표 IP 없이 노드 IP 를 쓴다', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9) }); }
    // 세 노드 어디로 와도 Pod 로
    if (k >= 3) ND.forEach((n, i) => { const col = k === 4 ? BAD : ACC, g = k === 3 ? seg(u, 0.2 + i * 0.25, 0.9 + i * 0.25) : 1;
      grow(P[0] + 28, P[1], NX - 40, n.y, g, col, { sw: 2.2 });
      if (k === 3) { dot([[NX + 38, n.y], [NX + 214, n.y]], seg(u, 0.9 + i * 0.25, 1.5 + i * 0.25), ACC, 6);
        dot([[NX + 326, n.y], [NX + 449, n.y - 8]], seg(u, 1.5 + i * 0.25, 2.1 + i * 0.25), ACC, 6);
        if (u > 2.1 + i * 0.25) check(NX + 560, n.y - 8, 10, pop(u, 2.1 + i * 0.25)); } });
    if (k === 4) { pill(150, 330, '진입점 3개 · 노드 IP 노출', BAD, pop(u, 0.4), { fs: 14 });
      pill(150, 380, '개발 · 온프렘 임시용', MUT, pop(u, 1.2), { fs: 14 }); } }

  // ---------- 3. LoadBalancer ----------
  const LB = { x: 225, y: 205 };
  const ND3 = ND.map((n) => ({ ...n }));
  function nodes3(o) { o = o || {}; const X = 430, W = 490;
    ND3.forEach((n) => { const top = n.y - NH / 2;
      el('rect', { x: X, y: top, width: W, height: NH, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 1.8 });
      tx(X + 50, top + 26, n.name, { 'font-size': 15, 'font-weight': 700 });
      card(X + 225, n.y, 112, 32, { rx: 8, text: 'kube-proxy', fs: 14, stroke: GRID, sw: 1.6, color: MUT });
      pod(X + 390, n.y - 8, 'web', { r: 19, nx: 32, anchor: 'start', fs: 14 });
      if (o.port) card(X, n.y, 76, 30, { rx: 8, text: ':30080', fs: 14, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: o.port }); }); }
  function s3(t, c) { const { k, u } = c, X = 430;
    nodes3({ port: k < 2 ? 0 : k === 2 ? pop(u, 1.2) : 1 });
    person(70, LB.y, '인터넷', {});
    if (k === 0) { card(LB.x, LB.y, 170, 70, { rx: 12, stroke: GRID, dash: '6 6', text: 'LB 없음', color: MUT, s: pop(u, 0.4) });
      svc(LB.x, 60, 'Service web', null, { s: pop(u, 0.2) });
      sub(LB.x, 290, 'ClusterIP · NodePort 와 같은 선언', fade(u, 1.0), { 'font-size': 14 }); return; }
    if (k === 1) { mono(LB.x - 10, 70, 'aws-load-balancer-type: nlb', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      card(LB.x, 150, 150, 44, { rx: 10, text: 'CLB (기본)', fs: 15, stroke: GRID, color: MUT, s: pop(u, 0.4) });
      if (u > 1.0) el('line', { x1: LB.x - 70, y1: 150, x2: lerp(LB.x - 70, LB.x + 70, E(u, 1.0, 1.5)), y2: 150, stroke: BAD, 'stroke-width': 3 });
      card(LB.x, 240, 150, 52, { rx: 10, text: 'NLB', fs: 17, stroke: ACC, fill: ACCBG, color: ACC, sw: 2.6, s: pop(u, 1.4) });
      sub(LB.x, 300, '클라우드마다 annotation 키가 다르다', fade(u, 2.0), { 'font-size': 13.5 }); return; }
    // LB 판
    const build = k === 2 ? E(u, 0.2, 1.4) : 1;
    el('rect', { x: LB.x - 90, y: LB.y - 50, width: 180, height: 100, rx: 14, fill: k >= 3 ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 2.6, 'stroke-dasharray': k === 2 ? `${560 * build} 600` : null });
    tx(LB.x, LB.y - 20, 'AWS NLB', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC });
    if (k === 2) sub(LB.x, LB.y + 12, '프로비저닝 중' + '.'.repeat(1 + (Math.floor(t * 2) % 3)), 1, { 'font-size': 14, fill: WARN, 'font-weight': 700 });
    if (k >= 3) { const typ = k === 3 ? clamp((u - 0.8) / 1.0) : 1, s = '203.0.113.42';
      mono(LB.x, LB.y + 14, s.slice(0, Math.round(s.length * typ)), { 'text-anchor': 'middle', 'font-size': 16, fill: INK, 'font-weight': 800 });
      sub(LB.x, LB.y + 38, 'EXTERNAL-IP', k === 3 ? fade(u, 1.6) : 1, { 'font-size': 13.5 }); }
    if (k === 3) { clock(LB.x, LB.y - 100, 18, E(u, 0.2, 1.0), WARN, null); tx(LB.x + 28, LB.y - 94, '1~2분 뒤', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
      pill(LB.x, LB.y + 110, '진입점 3개 → 1개', GOOD, pop(u, 2.0), { fs: 14 }); }
    // LB → 노드 :30080
    if (k <= 4) ND3.forEach((n, i) => { const g = k === 2 ? seg(u, 1.2 + i * 0.2, 1.9 + i * 0.2) : 1; grow(LB.x + 90, LB.y, X - 40, n.y, g, ACC, { sw: 2.2 }); });
    if (k >= 2 && k <= 4) grow(96, LB.y, LB.x - 92, LB.y, k === 2 ? seg(u, 0.4, 1.0) : 1, k >= 3 ? ACC : GRID, { sw: 2.4 });
    if (k === 4) { dot([[96, LB.y], [LB.x - 90, LB.y], [LB.x + 90, LB.y], [X - 40, ND3[0].y], [X + 170, ND3[0].y]], seg(u, 0.1, 1.4), ACC, 7);
      dot([[X + 282, ND3[0].y], [X + 370, ND3[0].y - 8]], seg(u, 1.4, 1.9), ACC, 7);
      dot([[96, LB.y], [LB.x - 90, LB.y], [LB.x + 90, LB.y], [X - 40, ND3[2].y], [X + 170, ND3[2].y]], seg(u, 0.7, 2.0), ACC, 7);
      dot([[X + 282, ND3[2].y], [X + 370, ND3[2].y - 8]], seg(u, 2.0, 2.5), ACC, 7);
      ND3.forEach((n, i) => { const ph = (t * 1.2 + i * 0.33) % 1; el('circle', { cx: X - 52, cy: n.y, r: 4 + ph * 12, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: 1 - ph }); });
      sub(LB.x, LB.y + 92, '헬스체크도 클라우드가', fade(u, 1.0), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
    if (k === 5) { // Service 마다 LB 를 만들면
      el('rect', { x: 20, y: 300, width: 362, height: 110, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      ['api', 'admin', 'web'].forEach((s, i) => { const sc = pop(u, 0.3 + i * 0.3);
        card(84 + i * 117, 340, 108, 34, { rx: 8, text: 'LB · ' + s, fs: 14, stroke: BAD, color: BAD, s: sc });
        mono(84 + i * 117, 382, '$20/월', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.3) }); });
      sub(201, 404, 'NLB 약 $20/월 + 트래픽, Service 마다', fade(u, 1.3), { 'font-size': 13.5 });
      pill(LB.x, 120, 'Ingress 1개 + 뒤는 ClusterIP', GOOD, pop(u, 1.8), { fs: 14 }); } }

  // ---------- 4. ExternalName ----------
  const X4 = { app: [105, 215], dns: [330, 92], name: [330, 220], kp: [330, 340], db: [780, 205] };
  function s4(t, c) { const { k, u } = c, b = c.beat.dataState || {};
    cluster(20, 20, 545, 385, '클러스터');
    zone(595, 20, 345, 385, '클러스터 밖', { fill: PANEL, stroke: GRID, dash: '3 5' });
    pod(X4.app[0], X4.app[1], 'app Pod', {});
    card(X4.dns[0], X4.dns[1], 130, 44, { rx: 10, text: 'CoreDNS', fs: 15, stroke: k === 3 ? ACC : GRID, color: k === 3 ? ACC : MUT, sw: 2 });
    // legacy-db 이름표: IP 칸이 없다
    const tagS = ap(k, 0, u, 0.2);
    card(X4.name[0], X4.name[1], 170, 54, { rx: 27, stroke: WARN, fill: PANEL, sw: 2.6, s: tagS, dash: k === 3 ? '5 4' : null });
    tx(X4.name[0], X4.name[1] - 2, 'legacy-db', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, class: 'mono', opacity: tagS ? 1 : 0 });
    tx(X4.name[0], X4.name[1] + 17, 'ExternalName', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: tagS ? 1 : 0 });
    if (k === 0) { el('line', { x1: X4.name[0] - 85, y1: X4.name[1] + 40, x2: X4.name[0] - 85 - 80 * E(u, 0.8, 1.6), y2: X4.name[1] + 90, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
      sub(X4.name[0] - 60, X4.name[1] + 112, 'selector 없음 · 가리키는 Pod 없음', fade(u, 1.5), { 'font-size': 14 }); }
    // 바깥 DB
    const target = b.externalIP || null;
    if (k >= 1 && k <= 5) { const newDb = k === 4, sOld = k === 4 ? 1 - E(u, 0.3, 1.0) : 1;
      if (sOld > 0.02) dbIcon(X4.db[0], X4.db[1], null, { s: (k === 1 ? pop(u, 0.2) : 1) * sOld, stroke: INK });
      if (sOld > 0.4) mono(X4.db[0], X4.db[1] + 66, 'db.example.com', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: sOld });
      if (newDb) { dbIcon(X4.db[0], X4.db[1], null, { s: pop(u, 1.0), stroke: ACC });
        mono(X4.db[0], X4.db[1] + 66, target, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) }); }
      const g = k === 1 ? seg(u, 0.6, 1.6) : 1;
      grow(X4.name[0] + 86, X4.name[1], X4.db[0] - 50, X4.db[1], g, WARN, { sw: 2.4, dash: '7 5' });
      if (g >= 1) tx(565, X4.name[1] - 14, 'CNAME', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN }); }
    if (k === 2) ktable(36, 292, [['NAME', 95], ['CLUSTER-IP', 100], ['EXTERNAL-IP', 140], ['PORT(S)', 70]],
      [['legacy-db', '<none>', 'db.example.com', '<none>']], { show: (r, cc) => fade(u, 0.3 + cc * 0.35), col: (r, cc) => (cc === 1 || cc === 3 ? BAD : cc === 2 ? WARN : null) });
    if (k === 3) { pill(X4.app[0], X4.app[1] - 64, 'psql -h legacy-db', INK, pop(u, 0.1), { mono: true, fs: 13.5 });
      dot([[X4.app[0] + 24, X4.app[1] - 14], [X4.dns[0] - 66, X4.dns[1] + 8]], seg(u, 0.4, 1.0), INFO, 7);
      fly(X4.dns[0] - 30, X4.dns[1] + 50, X4.app[0] + 40, X4.app[1] - 110, seg(u, 1.0, 1.7), 'CNAME db.example.com', { mono: true, fill: WARN, stay: true });
      dot([[X4.app[0] + 24, X4.app[1] + 14], [X4.app[0] + 120, 300], [X4.db[0] - 120, 300], [X4.db[0] - 46, X4.db[1] + 20]], seg(u, 1.8, 2.7), ACC, 7);
      sub(450, 324, '연결은 직접 맺는다', fade(u, 2.0), { 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
    if (k === 4) { pill(X4.app[0], X4.app[1] - 64, 'psql -h legacy-db', INK, 1, { mono: true, fs: 13.5 }); check(X4.app[0] + 96, X4.app[1] - 64, 10, pop(u, 1.6));
      sub(X4.app[0] + 20, X4.app[1] + 74, '앱 코드 · 배포 그대로', fade(u, 1.8), { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); }
    if (k === 5) { card(X4.kp[0], X4.kp[1], 130, 38, { rx: 8, text: 'kube-proxy', fs: 14, stroke: GRID, color: MUT }); cross(X4.kp[0], X4.kp[1], 16, pop(u, 0.3));
      ['포트 매핑', '헬스체크', '부하 분산'].forEach((s, i) => { const y = 316 + i * 34; cross(640, y, 8, pop(u, 0.7 + i * 0.25)); tx(658, y + 5, s + ' 없음', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.7 + i * 0.25) }); });
      tx(640, 60, 'SNI: legacy-db', { 'font-size': 14.5, class: 'mono', 'font-weight': 700, fill: INK, opacity: fade(u, 1.6) });
      tx(640, 86, '인증서: db.example.com', { 'font-size': 14.5, class: 'mono', 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) });
      sub(745, 110, 'HTTPS 는 이름이 어긋날 수 있다', fade(u, 2.2), { 'font-size': 13.5, fill: BAD }); }
    if (k === 6) grow(X4.name[0] + 86, X4.name[1], 636, 200, seg(u, 0.2, 0.8), WARN, { sw: 2.4, dash: '7 5' });
    if (k === 6) [['클라우드 RDS', 'RDS 엔드포인트'], ['사내 레거시 DB', 'db.example.com'], ['SaaS API', 'api.stripe.com']].forEach(([a, h], i) => {
      const y = 90 + i * 110, s = pop(u, 0.3 + i * 0.4); card(640 + 125, y, 250, 70, { rx: 10, stroke: ACC, s });
      tx(765, y - 6, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
      mono(765, y + 18, h, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.4 + i * 0.4) }); }); }

  // ---------- 5. 네 타입 비교 ----------
  const TYPES = [['ClusterIP', 'X', '무료', 'O', '내부 API · DB'], ['NodePort', 'O', '무료', 'O', '개발 · 온프렘'], ['LoadBalancer', 'O', '유료', 'O', 'production'], ['ExternalName', '-', '무료', 'X', '외부 DNS 별칭']];
  function tree(k, u) { // 결정 흐름
    const node = (x, y, s, col, sc, o) => card(x, y, o && o.w || 200, 48, { rx: o && o.leaf ? 24 : 10, text: s, fs: 15, stroke: col, fill: o && o.leaf ? (col === GRID ? PANEL : 'var(--newbg)') : PANEL, color: col === GRID ? MUT : col, sw: 2.2, s: sc });
    const on = (n) => (k === n ? ACC : GRID);
    node(140, 90, 'Q1. 외부에 노출?', on(1) === ACC || k > 1 ? INK : INK, 1);
    grow(140, 115, 140, 200, k === 1 ? seg(u, 0.4, 1.0) : 1, k === 1 ? ACC : MUT); tx(152, 165, 'NO', { 'font-size': 14, 'font-weight': 800, fill: k === 1 ? ACC : MUT });
    node(140, 225, 'ClusterIP', on(1), k === 1 ? pop(u, 1.0) : 1, { leaf: true, w: 170 });
    if (k >= 2) { grow(240, 90, 345, 90, k === 2 ? seg(u, 0.2, 0.7) : 1, k === 2 ? ACC : MUT); tx(292, 80, 'YES', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: k === 2 ? ACC : MUT });
      node(450, 90, 'Q2. 클라우드?', INK, k === 2 ? pop(u, 0.6) : 1);
      grow(550, 80, 660, 50, k === 2 ? seg(u, 1.0, 1.5) : 1, k === 2 ? ACC : MUT); grow(550, 100, 660, 135, k === 2 ? seg(u, 1.4, 1.9) : 1, k === 2 ? ACC : MUT);
      node(780, 45, 'LoadBalancer', on(2), k === 2 ? pop(u, 1.4) : 1, { leaf: true, w: 220 });
      node(780, 140, 'NodePort + 외부 LB', on(2), k === 2 ? pop(u, 1.8) : 1, { leaf: true, w: 220 });
      sub(780, 186, '온프렘 · MetalLB', k === 2 ? fade(u, 2.1) : 1, { 'font-size': 13.5 }); }
    if (k >= 3) { node(450, 300, 'Q3. 밖의 도메인을 부르나?', INK, k === 3 ? pop(u, 0.3) : 1, { w: 250 });
      grow(575, 300, 665, 300, k === 3 ? seg(u, 0.8, 1.3) : 1, k === 3 ? ACC : MUT); tx(620, 290, 'YES', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: k === 3 ? ACC : MUT });
      node(780, 300, 'ExternalName', on(3), k === 3 ? pop(u, 1.2) : 1, { leaf: true, w: 220 });
      sub(450, 348, '방향이 반대: 클러스터 → 밖', k === 3 ? fade(u, 1.6) : 1, { 'font-size': 13.5 }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const x0 = 60, cw = [190, 90, 90, 90, 200], y0 = 70, rh = 64, heads = ['타입', '외부', '비용', '헬스', '쓰는 곳'];
      let x = x0; heads.forEach((h, j) => { tx(x + 14, y0, h, { 'font-size': 14, fill: MUT, 'font-weight': 700 }); x += cw[j] + 8; });
      TYPES.forEach((r, i) => { let xx = x0; const y = y0 + 22 + i * rh;
        r.forEach((v, j) => { const s = fade(u, 0.2 + i * 0.35 + j * 0.08), good = v === 'O' || v === '무료', bad = v === 'X' || v === '유료';
          el('rect', { x: xx, y, width: cw[j], height: rh - 10, rx: 8, fill: j === 0 ? PANEL : good ? 'var(--goodbg)' : bad ? 'var(--badbg)' : SOFT, stroke: GRID, opacity: s });
          tx(xx + (j === 0 || j === 4 ? 14 : cw[j] / 2), y + rh / 2, v, { 'font-size': j === 0 ? 15.5 : 15, 'font-weight': j === 0 ? 800 : 700, 'text-anchor': j === 0 || j === 4 ? 'start' : 'middle', fill: j === 0 ? (i === 3 ? WARN : ACC) : good ? GOOD : bad ? BAD : INK, opacity: s, class: j === 0 ? 'mono' : null });
          xx += cw[j] + 8; }); });
      sub(480, 405, 'ExternalName 만 성격이 다르다: 들어오는 문이 아니라 나가는 이름표', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k <= 3) { tree(k, u); return; }
    if (k === 4) { person(60, 210, '인터넷', {});
      card(250, 210, 170, 70, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.6, s: pop(u, 0.2) }); tx(250, 204, 'Ingress', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC }); sub(250, 226, 'LoadBalancer 1개', 1, { 'font-size': 13.5 });
      grow(90, 210, 162, 210, seg(u, 0.1, 0.5), ACC);
      [['/api', 'svc-api'], ['/web', 'svc-web'], ['/img', 'svc-img']].forEach(([p, s], i) => { const y = 90 + i * 120, g = seg(u, 0.6 + i * 0.3, 1.2 + i * 0.3);
        grow(336, 210, 600, y, g, ACC); if (g >= 1) mono(470, lerp(210, y, 0.5) - 10, p, { 'font-size': 15, fill: ACC, 'font-weight': 800, 'text-anchor': 'middle' });
        svc(700, y, s, 'ClusterIP', { s: pop(u, 0.9 + i * 0.3), w: 180, ipCol: MUT });
        dot([[90, 210], [336, 210], [600, y]], seg(u, 1.8 + i * 0.25, 2.6 + i * 0.25), ACC, 6); });
      return; }
    if (k === 5) { [['Service 마다 LoadBalancer', '비용 폭발'], ['production 에서 NodePort', '노드 IP 노출 · 관리 부담'], ['ExternalName 에 포트 적기', '무시된다 (DNS 만)']].forEach(([a, b], i) => {
        const y = 90 + i * 110, s = pop(u, 0.2 + i * 0.45); card(480, y, 560, 78, { rx: 12, stroke: BAD, sw: 2, s }); cross(240, y, 12, s);
        tx(270, y - 6, a, { 'font-size': 16.5, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.45) }); tx(270, y + 20, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.45) }); }); return; }
    // 다음: Ingress
    person(90, 210, null, {}); card(280, 210, 160, 60, { rx: 12, text: 'LB 1개', fs: 16, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.2) });
    grow(118, 210, 198, 210, seg(u, 0.3, 0.7), ACC);
    ['api.example.com', 'example.com/admin', 'web.example.com'].forEach((s, i) => { const y = 100 + i * 110, g = seg(u, 0.8 + i * 0.3, 1.4 + i * 0.3);
      grow(362, 210, 560, y, g, ACC); pill(700, y, s, ACC, pop(u, 1.2 + i * 0.3), { mono: true, fs: 14 }); });
    sub(480, 395, '다음 장 III-1-2: 도메인 · 경로로 나누는 Ingress', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'type을 적지 않은 Service가 받는 것은 무엇인가?',
      o: ['노드마다 열리는 30000번대 포트', '클러스터 안에서만 닿는 가상 IP', '클라우드가 발급한 공인 IP'], a: 1,
      why: 'type을 생략하면 ClusterIP가 기본이다. web은 10.96.5.21을 받았고 EXTERNAL-IP는 <none>으로 남는다.' },
    { q: 'NodePort Service에 nodePort 30080을 주면 어디가 열리는가?',
      o: ['선택된 Pod가 떠 있는 노드 하나', '모든 워커 노드의 30080 포트', '클라우드 LB의 30080 포트'], a: 1,
      why: '모든 노드가 같은 포트를 연다. 노드 3대 중 어느 IP로 30080에 와도 kube-proxy가 Pod로 보낸다.' },
    { q: 'type: LoadBalancer를 적용하면 클라우드 LB는 트래픽을 어디로 넘기는가?',
      o: ['노드들의 NodePort 30080', 'Pod IP로 바로', 'CoreDNS'], a: 0,
      why: 'LoadBalancer는 NodePort를 묶는 구조다. LB 203.0.113.42가 노드의 30080으로 넘기고 kube-proxy가 Pod로 나눈다.' },
    { q: 'ExternalName Service legacy-db를 부르면 CoreDNS는 무엇을 돌려주는가?',
      o: ['legacy-db의 ClusterIP', 'db.example.com을 가리키는 CNAME', '외부 DB의 Pod 목록'], a: 1,
      why: 'ExternalName에는 CLUSTER-IP가 없다. DNS가 CNAME으로 db.example.com을 알려 주고 연결은 Pod가 직접 맺는다.' },
    { q: '실무에서 외부에 여러 서비스를 낼 때 흔한 조합은 무엇인가?',
      o: ['서비스마다 LoadBalancer', '모든 서비스를 NodePort로', 'LB를 쓰는 Ingress 하나와 뒤의 ClusterIP들'], a: 2,
      why: 'LB는 Ingress 앞 하나만 두고 /api, /web, /img 뒤의 서비스는 ClusterIP로 둔다. LB 비용이 1개분으로 줄어든다.' },
  ];

  const summary = [
    'type을 생략한 Service는 ClusterIP다. 클러스터 안에서만 닿는 고정 IP를 받는다.',
    'NodePort는 모든 노드의 같은 포트를 연다. 기본 범위는 30000에서 32767이다.',
    'LoadBalancer는 클라우드 LB가 공인 IP 하나를 받아 노드의 NodePort로 넘긴다.',
    'ExternalName은 DNS가 CNAME만 돌려준다. 프록시도 헬스체크도 없다.',
  ];
  const review = [
    { q: '사내 결제 API를 다른 Pod만 부르게 하려 했는데 실수로 NodePort를 썼다. 무엇이 달라졌나?',
      o: ['모든 노드 IP의 30000번대 포트로 밖에서도 닿게 됐다', '클러스터 안의 Pod가 더는 부를 수 없게 됐다', '클라우드 LB 비용이 생겼다'], a: 0,
      why: 'NodePort는 ClusterIP를 그대로 두고 노드 포트를 하나 더 연다. 내부 전용이면 ClusterIP로 충분하다.' },
    { q: 'Service 20개를 모두 type: LoadBalancer로 만들었더니 청구서가 크게 늘었다. 먼저 바꿀 것은?',
      o: ['LB를 NLB에서 CLB로 바꾼다', 'Ingress 하나만 LB로 두고 나머지는 ClusterIP로 돌린다', '모두 ExternalName으로 바꾼다'], a: 1,
      why: 'LB는 Service마다 하나씩 과금된다. Ingress 하나를 앞에 두면 LB는 1개분만 남는다.' },
    { q: 'ExternalName legacy-db로 HTTPS API를 불렀더니 인증서 오류가 났다. 먼저 의심할 것은?',
      o: ['kube-proxy의 부하 분산 설정', '클라이언트가 legacy-db라는 이름으로 접속해 인증서 이름과 어긋남', 'ClusterIP가 모자람'], a: 1,
      why: 'ExternalName은 DNS만 바꾼다. 클라이언트는 부른 이름을 그대로 보내므로 db.example.com 인증서와 맞지 않을 수 있다.' },
  ];

  R.page({ title: 'Service 타입별 트래픽', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
