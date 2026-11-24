/* II-2-1 Service Discovery — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자: IP 10.0.1.42/.55/.78/.91/.103, 인스턴스 5개, heartbeat 30초·제거 90초, readiness 5초×2, liveness 10초×3 은 페이지 코드 값.
 * 라운드 로빈 순서, 감지 시간 범위(readiness 5~10초, liveness 20~30초, Eureka 죽은 뒤 60~90초)는 node 로 돌려 확인한 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, cells, person, cross, check, dbIcon, clock, hbar, lock, G } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  function svc(cx, cy, name, o) { o = o || {}; const w = o.w || 170, h = o.h || 56;
    const g = card(cx, cy, w, h, { rx: 10, stroke: o.stroke || INK, fill: o.fill, sw: o.sw ?? 2.2, s: o.s, op: o.op, dash: o.dash });
    tx(0, o.sub ? -4 : 6, name, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 700, fill: o.color || o.stroke || INK }, g);
    if (o.sub) tx(0, 16, o.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: o.subCol || MUT, class: o.subMono ? 'mono' : null }, g);
    return g; }
  const ln = (x1, y1, x2, y2, col, o) => { o = o || {}; el('line', { x1, y1, x2, y2, stroke: col || GRID, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // pod: 작은 상자 + IP. o.dead 면 회색 점선, o.hot 이면 빨강
  function pod(cx, cy, ip, o) { o = o || {}; const col = o.dead ? OFF : o.hot ? BAD : o.col || INK;
    const g = card(cx, cy, o.w || 112, 44, { rx: 8, stroke: col, dash: o.dead ? '5 4' : null, fill: o.fill || PANEL, s: o.s, op: o.op, sw: 2 });
    tx(0, o.lab ? -3 : 5, ip, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, class: 'mono', fill: col }, g);
    if (o.lab) tx(0, 14, o.lab, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    return g; }

  // ---------- 1. 하드코딩 IP ----------
  const PX = (i) => 470 + i * 104;
  function cfgCard(o) { el('rect', { x: 30, y: 172, width: 260, height: 82, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(44, 194, 'application.yml', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    mono(44, 218, 'product:   10.0.1.42', { 'font-size': 14, 'font-weight': 700, fill: o.bad ? BAD : INK });
    mono(44, 242, 'inventory: 10.0.1.55', { 'font-size': 14 }); }
  function s1(t, c) { const { k, u } = c;
    svc(160, 100, 'order-service', { w: 180 }); cfgCard({ bad: k === 1 || k === 4 });
    if (k === 0) { pod(PX(0), 110, '10.0.1.42', { lab: 'product', s: pop(u, 0.2) }); pod(PX(0), 300, '10.0.1.55', { lab: 'inventory', s: pop(u, 0.4) });
      ln(250, 100, PX(0) - 56, 110, GRID); ln(250, 112, PX(0) - 56, 300, GRID);
      for (let i = 0; i < 3; i++) { dot([[250, 100], [PX(0) - 56, 110]], seg(u, 0.8 + i * 0.4, 1.4 + i * 0.4), GOOD, 6); dot([[250, 112], [PX(0) - 56, 300]], seg(u, 1.0 + i * 0.4, 1.6 + i * 0.4), GOOD, 6); }
      check(PX(0) + 76, 110, 9, pop(u, 1.6)); sub(PX(0) + 140, 360, '지금은 잘 돈다', fade(u, 2.0), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 1) { const gone = E(u, 0.3, 1.0);
      pod(PX(0), 110, '10.0.1.42', { lab: 'product', dead: true, op: 1 - 0.6 * gone });
      pod(PX(1) + 40, 110, '10.0.1.78', { lab: '새 pod', col: GOOD, s: pop(u, 1.0) });
      ln(250, 100, PX(0) - 56, 110, BAD);
      for (let i = 0; i < 3; i++) dot([[250, 100], [PX(0) - 56, 110]], seg(u, 1.2 + i * 0.35, 1.7 + i * 0.35), BAD, 6);
      cross(PX(0) - 70, 110, 11, pop(u, 1.7)); sub(PX(0), 160, 'pod 재시작', fade(u, 0.5), { fill: MUT, 'font-weight': 700 });
      note(470, 300, '설정은 여전히 .42 를 부른다', fade(u, 1.9), { fill: BAD }); note(470, 328, '→ 호출이 모두 실패', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 2 || k === 3) { const ips = ['10.0.1.42', '새 IP', '새 IP', '새 IP', '새 IP'];
      if (k === 3) ['us-east-1a', '1b', '1c'].forEach((z, i) => { const x0 = [418, 626, 834][i] - 2, w = i < 2 ? 204 : 100;
        el('rect', { x: x0, y: 48, width: w - 4, height: 300, rx: 10, fill: [INFOBG, GOODBG, WARNBG][i], opacity: fade(u, 0.3 + i * 0.2) });
        mono(x0 + 10, 68, z, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3 + i * 0.2) }); });
      ips.forEach((ip, i) => { pod(PX(i), 120, ip, { w: 96, lab: 'product', hot: i === 0, s: k === 2 && i > 0 ? pop(u, 0.2 + i * 0.15) : 1 });
        const load = i === 0 ? 1 : 0, g = k === 2 ? E(u, 1.0, 1.8) : 1;
        el('rect', { x: PX(i) - 40, y: 158, width: 80, height: 12, rx: 3, fill: SOFT }); el('rect', { x: PX(i) - 40, y: 158, width: 80 * load * g, height: 12, rx: 3, fill: BAD }); });
      ln(250, 100, PX(0) - 50, 120, BAD);
      if (k === 2) { for (let i = 0; i < 5; i++) dot([[250, 100], [PX(0) - 50, 120]], ((t * 0.8 + i / 5) % 1), BAD, 5);
        sub(PX(0), 192, '과부하', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); sub(PX(2) + 52, 192, '4대 idle = 80%', fade(u, 1.8), { fill: MUT, 'font-weight': 700, 'font-size': 14.5 });
        note(470, 300, '늘린 인스턴스를 호출 측이 모른다', fade(u, 2.1)); return; }
      // k3: 카나리·zone
      tx(470, 250, '카나리', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.8) });
      el('rect', { x: 540, y: 236, width: 300, height: 20, rx: 10, fill: SOFT, opacity: fade(u, 0.8) });
      el('rect', { x: 540, y: 236, width: 285, height: 20, rx: 10, fill: OFF, opacity: fade(u, 1.0) }); el('rect', { x: 825, y: 236, width: 15, height: 20, rx: 4, fill: ACC, opacity: fade(u, 1.0) });
      mono(540, 280, '기존 95%', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.1) }); mono(840, 280, '새 버전 5%', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.1) });
      cross(870, 246, 10, pop(u, 1.6));
      note(470, 322, 'IP 를 코드가 쥐면 비율도 zone 도 못 바꾼다', fade(u, 2.0), { fill: BAD }); return; }
    // k4: 의존 서비스 N개 = 배포 N번
    pod(PX(0), 110, '10.0.1.42 → ?', { w: 140, lab: 'product IP 변경', hot: true, s: pop(u, 0.2) });
    ['order', 'cart', 'search', '… N'].forEach((n, i) => { const x = 420 + i * 130, y = 280, sc = pop(u, 0.5 + i * 0.2);
      svc(x, y, n, { w: 110, h: 44, s: sc }); pill(x, y + 42, '.42 고정', BAD, sc, { fs: 13.5, mono: true, fill: PANEL });
      if (u > 1.4 + i * 0.25) pill(x, y - 44, '재배포', WARN, pop(u, 1.4 + i * 0.25), { fs: 13.5, fill: WARNBG }); });
    sub(615, 384, '서비스 이름은 예시', fade(u, 0.9));
    note(40, 330, '가용성 95% 이하', fade(u, 2.2), { fill: BAD, 'font-size': 17, 'font-weight': 800 }); }

  // ---------- 2. Eureka (client-side) ----------
  const EU = { x: 330, y: 40, w: 300 }, INST = [['10.0.1.42', 270], ['10.0.1.55', 330], ['10.0.1.78', 390]];
  function registry(rows, o) { o = o || {}; el('rect', { x: EU.x, y: EU.y, width: EU.w, height: 168, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.5 });
    tx(EU.x + 14, EU.y + 24, 'Eureka 서버', { 'font-size': 15, 'font-weight': 800, fill: INFO }); mono(EU.x + EU.w - 14, EU.y + 24, ':8761', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    mono(EU.x + 14, EU.y + 52, 'product-service', { 'font-size': 14.5, 'font-weight': 800, fill: o.nameHot ? ACC : INK });
    rows.forEach(([ip, st, op], i) => { const y = EU.y + 82 + i * 28, f = op ?? 1;
      mono(EU.x + 30, y, ip + ':8080', { 'font-size': 14, opacity: f, fill: st === 'DOWN' ? OFF : INK, 'text-decoration': st === 'DOWN' ? 'line-through' : null });
      pill(EU.x + EU.w - 46, y - 5, st, st === 'UP' ? GOOD : BAD, f, { fs: 13.5, mono: true, fill: PANEL }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 4) { // heartbeat 시간축
      registry([['10.0.1.42', 'UP'], ['10.0.1.55', 'UP'], ['10.0.1.78', u > 2.2 ? 'DOWN' : 'UP']]);
      const x0 = 140, W = 720, X = (s) => x0 + W * s / 150, y0 = 270;
      el('line', { x1: x0, y1: 380, x2: x0 + W, y2: 380, stroke: MUT, 'stroke-width': 1.8 });
      [0, 30, 60, 90, 120, 150].forEach((s) => { el('line', { x1: X(s), y1: 380, x2: X(s), y2: 385, stroke: MUT }); mono(X(s), 402, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      const now = lerp(0, 150, E(u, 0.2, 2.4));
      INST.forEach(([ip], i) => { const y = y0 + i * 34; mono(x0 - 10, y + 5, '.' + ip.split('.')[3], { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 700 });
        el('line', { x1: x0, y1: y, x2: X(now), y2: y, stroke: GRID, 'stroke-width': 1.5 });
        [0, 30, 60, 90, 120, 150].forEach((s) => { if (s > now || (i === 2 && s > 30)) return; el('circle', { cx: X(s), cy: y, r: 6, fill: GOOD }); }); });
      if (now > 35) { cross(X(35), y0 + 68, 8, 1); sub(X(35), y0 + 96, '죽음', 1, { fill: BAD, 'font-weight': 700 }); }
      if (now > 30) { const e = Math.min(now, 120); el('rect', { x: X(30), y: y0 + 60, width: X(e) - X(30), height: 16, rx: 4, fill: WARN, opacity: 0.25 });
        if (now >= 120) { el('line', { x1: X(120), y1: y0 - 16, x2: X(120), y2: 380, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); tx(X(120) + 8, y0 + 73, '90초 무응답 → 제거', { 'font-size': 14, 'font-weight': 700, fill: BAD }); } }
      tx(EU.x + EU.w + 30, 100, '30초마다 heartbeat', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
      sub(EU.x + EU.w + 130, 130, '죽고 나서 60~90초 동안', fade(u, 2.2)); sub(EU.x + EU.w + 130, 150, '목록에 남아 있을 수 있다', fade(u, 2.2)); return; }
    const nRows = k === 0 ? (u > 1.1 ? 1 : 0) : k === 1 ? 1 : 3;
    registry(INST.slice(0, nRows).map(([ip], i) => [ip, 'UP', k === 2 && i > 0 ? fade(u, 0.4 + i * 0.3) : 1]), { nameHot: k === 1 });
    svc(130, 330, 'order-service', { w: 180, sub: '호출 측' });
    INST.forEach(([ip, y], i) => { if (i >= Math.max(1, nRows) && !(k === 0 && i === 0)) return;
      pod(800, y, ip, { lab: 'product', s: (k === 0 && i === 0) ? pop(u, 0.1) : k === 2 && i > 0 ? pop(u, 0.2 + i * 0.3) : 1 }); });
    if (k === 0) { fly(744, 270, EU.x + EU.w - 60, EU.y + 82, seg(u, 0.3, 1.1), 'REGISTER', { mono: true, fill: INFO });
      pill(800, 210, '@EnableEurekaClient', ACC, pop(u, 0.2), { fs: 13.5, mono: true, fill: PANEL });
      sub(480, 250, 'IP 를 아는 쪽이 인스턴스 자신이 된다', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 1) { ln(744, 270, EU.x + EU.w, 160, INFO, { dash: '5 4' });
      R.snippet(40, 64, ['spring.application.name:', '  product-service', 'defaultZone:', '  http://eureka:8761/eureka/'], { fs: 13.5, op: fade(u, 0.3) });
      sub(480, 250, '호출 측이 아는 값은 이름 하나', fade(u, 1.6), { fill: ACC, 'font-weight': 700, 'font-size': 14.5 }); return; }
    if (k === 2) { card(200, 250, 330, 40, { rx: 8, text: '@FeignClient(name = "product-service")', fs: 13.5, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.8) });
      check(130, 392, 9, pop(u, 1.6)); sub(220, 397, '호출 코드에 IP 가 없다', fade(u, 1.7), { fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 3) { fly(EU.x + 60, EU.y + 170, 150, 300, seg(u, 0.2, 0.9), '[.42, .55, .78]', { mono: true, fill: INFO });
      const RR = [0, 1, 2, 0, 1, 2], cnt = [0, 0, 0];
      RR.forEach((j, n) => { const a = 1.0 + n * 0.25; if (u > a + 0.25) cnt[j]++; dot([[220, 330], [744, INST[j][1]]], seg(u, a, a + 0.3), n === 1 ? ACC : INK, n === 1 ? 7 : 5); });
      INST.forEach(([, y], j) => mono(870, y + 5, '×' + cnt[j], { 'font-size': 15, 'font-weight': 800, fill: ACC }));
      pill(130, 270, 'Ribbon 라운드 로빈', ACC, pop(u, 0.9), { fs: 13.5, fill: PANEL });
      sub(480, 250, '두 번째 호출 → 10.0.1.55', fade(u, 1.5), { fill: ACC, 'font-weight': 700, 'font-size': 14.5 }); return; }
    // k5: SDK 강결합
    el('rect', { x: 52, y: 362, width: 156, height: 34, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: fade(u, 0.3) });
    mono(130, 384, 'Feign + Ribbon', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    svc(130, 140, 'Node.js 서비스', { w: 180, sub: 'SDK 없음', s: pop(u, 0.8) }); cross(230, 112, 10, pop(u, 1.3));
    sub(130, 200, '예시: 비-Java 클라이언트', fade(u, 1.0));
    sub(480, 250, 'LB 로직이 클라이언트마다 들어간다', fade(u, 1.8), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 }); }

  // ---------- 3. Nginx (server-side) ----------
  const UP = [['10.0.1.42', 3], ['10.0.1.55', 1], ['10.0.1.78', 4], ['10.0.1.91', 2], ['10.0.1.103', 5]];
  const upY = (i) => 60 + i * 76;
  function s3(t, c) { const { k, u } = c, lbDown = k === 4 && u > 0.4 && u < 1.6;
    card(370, 210, 150, 330, { rx: 12, stroke: lbDown ? BAD : INFO, fill: INFOBG, sw: 2.5 });
    tx(370, 70, 'Nginx', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO }); mono(370, 92, 'internal-lb:80', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    mono(370, 330, 'least_conn', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INFO });
    UP.forEach(([ip, cn], i) => { const y = upY(i), fail = (k === 2 && i === 0 && u > 0.6), s = k === 0 ? pop(u, 0.2 + i * 0.2) : 1;
      pod(760, y, ip, { w: 130, hot: fail, s });
      if (k === 0) { const best = i === 1; for (let q = 0; q < cn; q++) el('rect', { x: 836 + q * 16, y: y - 7, width: 12, height: 14, rx: 2, fill: best ? ACC : OFF, opacity: fade(u, 0.6 + i * 0.2) }); }
      ln(445, Math.min(Math.max(y, 70), 350), 695, y, GRID, { sw: 1.6, op: s }); });
    if (k === 0) { sub(880, 412, '■ = 지금 연결 수 (예시)', fade(u, 1.4)); dot([[445, 120], [695, upY(1)]], seg(u, 1.6, 2.3), ACC, 7);
      tx(150, 210, '연결이 가장 적은', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); tx(150, 234, '.55 로 보낸다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); return; }
    const langs = k === 3 ? ['Java', 'Go', 'Python', 'Node'] : ['client'];
    langs.forEach((n, i) => { const y = k === 3 ? 90 + i * 80 : 210; svc(100, y, n, { w: 120, h: 44, s: k === 3 ? pop(u, 0.2 + i * 0.2) : 1 }); ln(160, y, 295, Math.min(Math.max(y, 80), 340), INK, { sw: 1.8 });
      if (k === 3) dot([[160, y], [295, Math.min(Math.max(y, 80), 340)]], seg(u, 0.8 + i * 0.2, 1.4 + i * 0.2), ACC, 6); });
    if (k === 1) { pill(100, 150, 'http://internal-lb', ACC, pop(u, 0.4), { fs: 13.5, mono: true, fill: PANEL });
      note(100, 290, '알아야 할 주소', fade(u, 1.2), { 'text-anchor': 'middle' }); note(100, 314, '= 하나', fade(u, 1.3), { 'text-anchor': 'middle', fill: ACC }); return; }
    if (k === 2) { dot([[160, 210], [295, 210], [445, 150], [695, upY(0)]], seg(u, 0.1, 0.7), INK, 7);
      pill(760, upY(0) + 38, 'max_fails=2 fail_timeout=10s', WARN, pop(u, 0.3), { fs: 13.5, mono: true, fill: PANEL });
      if (u > 0.7) { mono(640, upY(0) - 10, '502', { 'font-size': 15, 'font-weight': 800, fill: BAD }); dot([[695, upY(0)], [445, 150], [695, upY(1)]], seg(u, 0.8, 1.5), WARN, 7); }
      if (u > 1.5) { dot([[695, upY(1)], [445, 200], [295, 210], [160, 210]], seg(u, 1.5, 2.2), GOOD, 7); check(895, upY(1), 9, pop(u, 1.5)); }
      sub(100, 270, '클라이언트는 실패를 모른다', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 });
      mono(560, 412, 'proxy_next_upstream error timeout http_502', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) }); return; }
    if (k === 3) { mono(230, 412, 'fetch("http://internal-lb/products/42")', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) });
      sub(600, 412, 'SDK 설치 없음', fade(u, 1.9), { fill: GOOD, 'font-weight': 700 }); return; }
    // k4: LB 가 SPOF, hop 하나 추가
    if (lbDown) cross(370, 210, 24, pop(u, 0.4));
    if (u >= 1.6) { card(370, 396, 130, 30, { rx: 6, text: 'standby LB', fs: 13.5, stroke: INFO, color: INFO, s: pop(u, 1.6) }); }
    sub(100, 280, u < 1.6 ? 'LB 가 죽으면 전부 멈춘다' : '그래서 LB 를 이중화', 1, { fill: u < 1.6 ? BAD : INFO, 'font-weight': 700 });
    mono(560, 30, 'client → LB → 인스턴스 · hop 1개 추가', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.0) }); }

  // ---------- 4. k8s Service ----------
  const PD = (i) => 70 + i * 70;
  function s4(t, c) { const { k, u } = c;
    const fq = 'product-service.shop.svc.cluster.local', typed = k === 0 ? E(u, 0.4, 1.8) : 1;
    el('rect', { x: 210, y: 34, width: 390, height: 40, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    mono(224, 60, 'DNS  ' + fq.slice(0, Math.ceil(fq.length * typed)), { 'font-size': 14, 'font-weight': 700, fill: ACC });
    svc(400, 200, 'Service product-service', { w: 260, h: 60, sub: k >= 1 ? 'ClusterIP · 80 → 8080' : 'type: ClusterIP', s: k === 0 ? pop(u, 0.1) : 1 });
    grow(400, 76, 400, 168, k === 0 ? E(u, 1.8, 2.3) : 1, ACC);
    const nP = k === 0 ? 0 : k === 1 ? 1 : 5;
    for (let i = 0; i < nP; i++) { const y = PD(i), sc = k === 2 && i > 0 ? pop(u, 0.2 + i * 0.25) : k === 1 ? pop(u, 0.4) : 1;
      const out = (k === 3 && i === 2 && u > 1.6) || (k === 5 && i === 4 && u > 1.0), gone = k === 5 && i === 4 && u > 1.0;
      if (gone && u > 1.6) pod(800, y, 'pod 6', { w: 140, lab: 'app: product', col: GOOD, s: pop(u, 1.6) });
      else pod(800, y, 'pod ' + (i + 1), { w: 140, lab: 'app: product', dead: out, s: sc, op: gone ? 1 - fade(u, 1.1, 0.4) : 1 });
      if (!out) ln(530, 200, 728, y, ACC, { sw: 1.8, op: sc });
      if (k === 3) { const ph = ((t - 9 * 3) % 1.25) / 1.25; el('circle', { cx: 880, cy: y, r: 6 + ph * 14, fill: 'none', stroke: out ? BAD : GOOD, 'stroke-width': 2, opacity: 1 - ph }); }
      if (gone && u > 1.9) ln(530, 200, 728, y, GOOD, { sw: 1.8 }); }
    if (k === 1) { pill(400, 262, 'selector  app: product', ACC, pop(u, 0.9), { fs: 13.5, mono: true, fill: PANEL });
      sub(400, 300, '라벨로 대상을 정한다', fade(u, 1.5), { fill: INK, 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 2) { mono(560, 400, 'replicas: 5', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) }); sub(400, 300, '설정을 안 바꿔도 자동 합류', fade(u, 1.8), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 3) { mono(560, 400, 'readinessProbe · 5초마다', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) });
      sub(400, 300, '준비 안 된 pod 는 대상에서 빠진다', fade(u, 1.8), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 4) { svc(110, 200, 'order', { w: 130, sub: 'ns: shop' }); svc(110, 340, 'admin', { w: 130, sub: '다른 ns (예시)' });
      ln(175, 200, 270, 200, INK); ln(175, 340, 280, 222, INK, { dash: '5 4' });
      mono(110, 140, 'http://product-service', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.5) });
      mono(340, 400, '…' + fq, { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
      for (let j = 0; j < 2; j++) dot([[175, 200], [270, 200]], seg(u, 0.6 + j * 0.5, 1.0 + j * 0.5), ACC, 6); }
    if (k === 5) { svc(110, 200, 'order', { w: 130 }); ln(175, 200, 270, 200, INK);
      tx(400, 290, 'kube-proxy', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO });
      for (let j = 0; j < 4; j++) dot([[175, 200], [270, 200], [530, 200], [728, PD(j)]], seg(u, 0.2 + j * 0.5, 1.0 + j * 0.5), ACC, 6);
      sub(400, 320, 'pod 5 삭제 · pod 6 생성이 자동 반영된다', fade(u, 2.0), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 }); } }

  // ---------- 5. Health Check ----------
  function lamp(x, y, name, ok, op) { el('circle', { cx: x, cy: y, r: 11, fill: ok ? GOOD : BAD, opacity: op ?? 1 }); tx(x + 20, y + 5, name, { 'font-size': 14.5, 'font-weight': 700, opacity: op ?? 1 }); }
  function probeAxis(x0, W, max, step, period, thr, start, now, col) { const X = (s) => x0 + W * s / max, y = 330;
    el('line', { x1: x0, y1: y, x2: x0 + W, y2: y, stroke: MUT, 'stroke-width': 1.8 });
    for (let s = 0; s <= max; s += step) mono(X(s), y + 22, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    el('rect', { x: X(start), y: y - 60, width: Math.max(0, X(Math.min(now, max)) - X(start)), height: 14, rx: 3, fill: BAD, opacity: now > start ? 0.25 : 0 });
    if (now > start) tx(X(start), y - 68, '고장 시작', { 'font-size': 13.5, fill: BAD, 'font-weight': 700 });
    let fails = 0, hit = null;
    for (let s = 0; s <= max; s += period) { if (s > now) break; const bad = s > start; if (bad) fails++; const fire = bad && fails === thr;
      el('circle', { cx: X(s), cy: y, r: 7, fill: bad ? BAD : GOOD }); if (bad) mono(X(s), y - 16, String(fails), { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      if (fire) hit = s; }
    return { X, hit }; }
  function s5(t, c) { const { k, u } = c;
    svc(150, 110, 'product pod', { w: 190, h: 60, sub: 'Spring Boot Actuator' });
    if (k === 0) { R.snippet(320, 50, ['management:', '  endpoints.web.exposure.include: health,info,prometheus', '  endpoint.health.probes.enabled: true', '  endpoint.health.group.readiness.include: readinessState,db'], { fs: 13.5, op: fade(u, 0.3) });
      pill(150, 190, 'GET /actuator/health', ACC, pop(u, 1.2), { fs: 13.5, mono: true, fill: PANEL });
      sub(480, 260, '판단 근거를 앱이 스스로 내놓는다', fade(u, 1.8), { fill: INK, 'font-weight': 700, 'font-size': 15 });
      sub(480, 290, 'readiness 그룹에 db 를 넣어야 DB 상태가 readiness 에 반영된다', fade(u, 2.2), { fill: WARN, 'font-weight': 700 }); return; }
    if (k === 1) { [['/actuator/health/liveness', '앱이 살아 있나?'], ['/actuator/health/readiness', '트래픽 받을 준비가 됐나?']].forEach(([p, q], i) => { const y = 220 + i * 70, s = pop(u, 0.3 + i * 0.5);
        card(330, y, 340, 50, { rx: 8, stroke: i ? INFO : WARN, s }); mono(175, y - 4, p, { 'font-size': 14, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) }); tx(175, y + 17, q, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.5) }); });
      lamp(560, 220, 'liveness', true, fade(u, 1.2)); lamp(560, 290, 'readiness', true, fade(u, 1.6));
      sub(720, 380, '두 질문은 다르다', fade(u, 2.0), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 2) { const cut = u > 1.4; dbIcon(760, 110, 'DB', { stroke: cut ? BAD : INK });
      ln(245, 110, 712, 110, cut ? BAD : GOOD, { dash: cut ? '6 6' : null }); if (cut) cross(480, 110, 12, pop(u, 1.4));
      mono(480, 90, 'conn.isValid(1)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: INFO });
      lamp(110, 230, 'liveness  UP', true); lamp(110, 280, cut ? 'readiness  DOWN' : 'readiness  UP', !cut);
      pill(480, 250, cut ? 'Health.down()' : 'Health.up()', cut ? BAD : GOOD, 1, { fs: 14, mono: true, fill: PANEL });
      sub(480, 330, '포트가 열렸다고 정상은 아니다', fade(u, 1.9), { fill: INK, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 3 || k === 4) { const rd = k === 3, now = lerp(0, rd ? 30 : 40, E(u, 0.1, 2.3));
      tx(60, 190, rd ? 'readinessProbe · 5초마다 · 2번 연속 실패' : 'livenessProbe · 10초마다 · 3번 연속 실패', { 'font-size': 15, 'font-weight': 800, fill: rd ? INFO : WARN });
      const r = probeAxis(80, 800, rd ? 30 : 40, 5, rd ? 5 : 10, rd ? 2 : 3, 7, now);
      if (r.hit != null) { el('line', { x1: r.X(r.hit), y1: 240, x2: r.X(r.hit), y2: 340, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
        tx(r.X(r.hit) + 8, 236, rd ? '트래픽 차단 (pod 유지)' : 'pod 재시작', { 'font-size': 14.5, 'font-weight': 800, fill: BAD }); }
      sub(480, 400, rd ? '고장부터 차단까지 5~10초 (node 로 돌린 범위)' : '고장부터 재시작까지 20~30초 (node 로 돌린 범위)', fade(u, 2.3), { fill: INK, 'font-weight': 700 });
      lamp(320, 110, rd ? 'readiness' : 'liveness', !(r.hit != null), 1); return; }
    // k5: DB 가 잠깐 끊길 때
    dbIcon(480, 110, 'DB 잠깐 끊김', { stroke: BAD, s: 0.8 });
    [['liveness 로 판정하면', 'pod 3개 모두 재시작', BAD], ['readiness 로 판정하면', '트래픽만 끊고 pod 는 그대로', GOOD]].forEach(([a, b, col], i) => { const x = 250 + i * 460, y = 270, s = pop(u, 0.4 + i * 0.6);
      card(x, y, 400, 150, { rx: 10, stroke: col, s });
      tx(x, y - 45, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.6) });
      [0, 1, 2].forEach((j) => { const px = x - 110 + j * 110; card(px, y + 5, 80, 36, { rx: 6, text: i ? 'pod' : '재시작', fs: 13.5, stroke: col, color: col, fill: i ? PANEL : BADBG, op: fade(u, 0.6 + i * 0.6 + j * 0.1) }); });
      tx(x, y + 55, b, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.6) }); });
    sub(480, 405, 'pod 3개는 예시', fade(u, 2.0)); }

  const quiz = [
    { q: '설정에 product 주소를 10.0.1.42로 적어 두었는데 pod가 재시작돼 10.0.1.78이 되었다. 어떻게 되나?',
      o: ['설정이 자동으로 .78로 바뀐다', '.42로 가는 호출이 모두 실패한다', '절반만 실패한다'], a: 1,
      why: '설정 파일은 pod 재시작을 따라가지 못한다. 고쳐서 다시 배포하기 전까지 옛 IP를 계속 부른다.' },
    { q: 'Eureka에서 인스턴스가 죽으면 목록에서 빠지기까지 왜 시간이 걸리나?',
      o: ['heartbeat가 90초 동안 오지 않아야 지우기 때문이다', 'Ribbon이 목록을 하루에 한 번 받기 때문이다', 'DNS 캐시가 남아 있기 때문이다'], a: 0,
      why: '30초마다 오던 heartbeat가 끊긴 뒤 90초가 지나야 제거한다. 그동안 죽은 주소가 목록에 남을 수 있다.' },
    { q: 'Nginx 같은 server-side discovery를 쓸 때 꼭 챙겨야 하는 것은 무엇인가?',
      o: ['클라이언트마다 Ribbon 설치', '모든 서비스를 Java로 통일', 'LB 이중화'], a: 2,
      why: '모든 호출이 LB를 지나므로 LB가 죽으면 전체가 멈춘다. 대신 클라이언트는 URL 하나만 알면 된다.' },
    { q: 'k8s에서 replicas를 1에서 5로 늘리면 Service는 새 pod를 어떻게 찾나?',
      o: ['Service 설정에 새 IP를 손으로 적는다', 'app: product 라벨이 같으면 자동으로 대상에 들어간다', 'DNS 이름을 pod마다 새로 만든다'], a: 1,
      why: 'Service는 IP 목록이 아니라 selector 라벨로 대상을 정한다. 라벨이 같은 pod는 생기는 대로 합류한다.' },
    { q: 'DB가 잠깐 끊겼을 때 pod를 재시작하지 않고 트래픽만 끊으려면 무엇이 DB 상태를 보아야 하나?',
      o: ['readiness', 'liveness', 'startup'], a: 0,
      why: 'readiness 실패는 트래픽만 차단하고 liveness 실패는 재시작이다. DB 일시 끊김에는 재시작이 필요 없다.' },
  ];
  const summary = [
    'IP를 설정에 박으면 pod 재시작이나 오토스케일을 따라가지 못하고 IP가 바뀔 때마다 의존 서비스를 다시 배포한다.',
    'Eureka는 인스턴스가 스스로 등록하고 호출 측이 목록을 받아 라운드 로빈한다. 대신 SDK가 클라이언트마다 필요하다.',
    'Nginx 같은 LB나 k8s Service에 맡기면 클라이언트는 이름 하나만 알면 되고, LB는 이중화가 필요하다.',
    'readiness는 5초씩 2번 실패하면 트래픽을 끊고 liveness 실패는 재시작이라, DB 끊김은 readiness로 본다.',
  ];
  const review = [
    { q: 'k8s로 옮긴 뒤 배포 때마다 order가 product 호출에 실패한다. 설정을 보니 pod IP가 적혀 있다. 먼저 바꿀 것은?',
      o: ['pod IP를 고정 IP로 예약한다', '주소를 Service 이름 http://product-service로 바꾼다', 'readinessProbe 주기를 늘린다'], a: 1,
      why: 'pod IP는 재시작마다 바뀐다. Service 이름은 DNS로 ClusterIP를 주고 kube-proxy가 살아 있는 pod로 보낸다.' },
    { q: 'Eureka를 쓰는데 인스턴스가 죽은 직후 1분 넘게 일부 호출이 실패한다. 가장 그럴듯한 이유는?',
      o: ['Feign 인터페이스 이름이 틀렸다', 'least_conn 설정이 빠졌다', '90초 무응답 전까지 죽은 인스턴스가 목록에 남아 있다'], a: 2,
      why: 'heartbeat가 끊겨도 90초를 기다린 뒤 지운다. 그사이 라운드 로빈이 죽은 주소를 고를 수 있어 재시도나 health check를 함께 둔다.' },
    { q: '부하가 몰릴 때 pod들이 줄줄이 재시작된다. livenessProbe가 DB 상태까지 보고 있었다. 알맞은 조치는?',
      o: ['DB 확인은 readiness로 옮기고 liveness는 느슨하게 둔다', 'liveness 주기를 1초로 줄인다', 'replicas를 줄인다'], a: 0,
      why: 'liveness 실패는 재시작을 부른다. 의존성 상태는 트래픽만 끊는 readiness로 보고 liveness는 10초·3회처럼 여유 있게 둔다.' },
  ];

  R.page({ title: '디스커버리 흐름', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
