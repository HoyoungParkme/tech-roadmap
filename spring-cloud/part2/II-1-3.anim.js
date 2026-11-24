/* II-1-3 Eureka 서비스 디스커버리 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 주인공: 레지스트리 표(서비스명·인스턴스·상태), lease 막대, renew 하트비트, eviction 시각표, self-preservation 임계.
 * 표의 줄은 STEPS 의 registry, 시각표 숫자는 lifecycle.yml 과 Eureka 소스의 식(Lease·AbstractInstanceRegistry)으로 계산한 값만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, cross, check, clock, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  // 인스턴스 칩: 이름 + 주소, o.dead 면 빨간 테두리
  function inst(cx, cy, name, addr, o) { o = o || {}; const w = o.w || 170, col = o.dead ? BAD : o.col || INK;
    const g = card(cx, cy, w, 54, { rx: 9, stroke: col, sw: o.sw || 2.2, fill: o.fill || PANEL, s: o.s, op: o.op, dash: o.dash });
    tx(-w / 2 + 14, -4, name, { 'font-size': 14, 'font-weight': 700, fill: col }, g);
    R.el('circle', { cx: w / 2 - 16, cy: -6, r: 5, fill: o.dead ? OFF : o.lamp || GOOD }, g);
    R.mono(-w / 2 + 14, 17, addr, { 'font-size': 13.5, fill: o.dead ? BAD : MUT }, g); return g; }
  const st = (s) => (s === 'UP' ? GOOD : s === 'STARTING' ? WARN : BAD);
  // 레지스트리 표. rows = [{name, ip, status, renew, dead}], o.cols: 보일 열, o.appear(i) 0→1, o.lease(i) 0→1 남은 lease
  function regTable(x, y, w, rows, o) { o = o || {}; const rh = o.rh || 42, h = 40 + rh * Math.max(1, rows.length) + 8;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || ACC, 'stroke-width': 2 });
    el('rect', { x, y, width: w, height: 32, rx: 10, fill: o.stroke || ACC }); el('rect', { x, y: y + 20, width: w, height: 12, fill: o.stroke || ACC });
    tx(x + 14, y + 22, o.title || 'Eureka 레지스트리', { 'font-size': 14, 'font-weight': 700, fill: PANEL });
    const cx = { app: x + 14, ip: x + w * 0.31, st: x + w * (o.renew ? 0.53 : 0.56), rn: x + w * 0.64 };
    if (!rows.length) { sub(x + w / 2, y + 40 + rh / 2 + 4, o.empty || '등록된 인스턴스 없음', o.emptyOp ?? 1); return h; }
    rows.forEach((r, i) => { const a = o.appear ? o.appear(i) : 1; if (a <= 0) return; const yy = y + 40 + i * rh, mid = yy + rh / 2;
      if (r.dead) el('rect', { x: x + 6, y: yy + 3, width: w - 12, height: rh - 6, rx: 6, fill: BADBG, opacity: a });
      el('rect', { x: x + 6, y: yy + 3, width: (w - 12) * a, height: rh - 6, rx: 6, fill: 'none', stroke: GRID, 'stroke-width': 1 });
      mono(cx.app, mid + 5, r.name, { 'font-size': 14, 'font-weight': 700, fill: r.dead ? BAD : INK, opacity: a });
      mono(cx.ip, mid + 5, r.ip, { 'font-size': 13.5, fill: r.dead ? BAD : MUT, opacity: a });
      const s = (o.status && o.status(i)) || r.status; pill(cx.st + 28, mid, s, st(s), a, { fs: 13.5, mono: true, fill: PANEL });
      if (o.renew) mono(cx.rn, mid + 5, o.renew(i), { 'font-size': 14, 'font-weight': 700, fill: r.dead ? BAD : INK, opacity: a });
      if (o.lease) { const f = clamp(o.lease(i)), lx = x + w - 112; el('rect', { x: lx, y: mid - 6, width: 96, height: 12, rx: 3, fill: SOFT, opacity: a });
        el('rect', { x: lx, y: mid - 6, width: Math.max(1.5, 96 * f), height: 12, rx: 3, fill: f < 0.35 ? BAD : ACC, opacity: a }); } });
    return h; }
  const rowsOf = (b) => (b && b.registry) || [];

  // ---------- 1. IP 하드코딩 ----------
  const O1 = { x: 130, y: 220 }, U = [{ y: 110 }, { y: 220 }, { y: 330 }], UX = 760;
  function s1(t, c) { const { k, u } = c;
    server(O1.x, O1.y, 'order-service', { lamp: ACC });
    // 설정 카드
    const cfgS = k === 0 ? pop(u, 0.2) : 1, ip = k >= 2 ? '10.0.2.31' : '10.0.1.7';
    card(250, 60, 440, 46, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.5, s: cfgS });
    const typed = 'user-service: "http://10.0.1.7:8081"', n = k === 0 ? Math.round(typed.length * E(u, 0.4, 1.6)) : typed.length;
    mono(48, 66, typed.slice(0, n), { 'font-size': 15, 'font-weight': 700, fill: k >= 2 ? BAD : INK, 'text-decoration': k >= 2 ? 'line-through' : null });
    // 처음 한 대
    const mainY = U[1].y, dead = k === 3;
    const wireU = k === 0 ? E(u, 1.4, 2.2) : 1;
    if (k < 4) grow(O1.x + 60, O1.y, UX - 90, mainY, wireU, k >= 2 ? BAD : ACC, { dash: k === 2 ? '6 5' : null });
    if (k === 0) { inst(UX, mainY, 'user-service', '10.0.1.7:8081', { s: pop(u, 1.8) }); note(480, 300, '주소가 배포하는 순간 고정된다', fade(u, 2.2), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 1) { inst(UX, mainY, 'user-service', '10.0.1.7:8081');
      [0, 2].forEach((j, q) => inst(UX, U[j].y, 'user-service', '새 인스턴스', { s: pop(u, 0.2 + q * 0.3), col: MUT }));
      for (let i = 0; i < 8; i++) dot([[O1.x + 60, O1.y], [UX - 90, mainY]], (t * 0.7 + i / 8) % 1, ACC, 5);
      [[U[0].y, 0], [mainY, 1], [U[2].y, 0]].forEach(([y, v], i) => { hbar(UX + 100, y - 9, 60, v * E(u, 0.6, 1.6), 1, { label: false, col: v ? BAD : ACC });
        mono(UX + 100, y + 26, v ? '부하 3배' : '0', { 'font-size': 13.5, 'font-weight': 700, fill: v ? BAD : MUT, opacity: fade(u, 1.4) }); });
      return; }
    if (k === 2) { const sw = E(u, 0.3, 1.1);
      inst(UX, mainY, 'user-service', sw < 0.5 ? '10.0.1.7:8081' : '10.0.2.31:8081', { col: sw < 0.5 ? INK : WARN, s: 1 + 0.08 * Math.sin(sw * Math.PI) });
      cross(UX - 110, mainY, 12, pop(u, 1.2));
      card(480, 330, 360, 48, { rx: 10, stroke: BAD, sw: 2, text: '설정 수정 + 호출하는 쪽까지 재배포', fs: 15, color: BAD, s: pop(u, 1.6) }); return; }
    if (k === 3) { inst(UX, mainY, 'user-service', '10.0.1.7:8081', { dead: true });
      for (let i = 0; i < 3; i++) { const a = 0.2 + i * 0.7; dot([[O1.x + 60, O1.y], [UX - 92, mainY]], seg(u, a, a + 0.6), INK, 6);
        clock(UX - 230 + i * 56, 330, 20, E(u, a + 0.6, a + 1.4), BAD); }
      mono(UX - 174, 375, 'timeout × 3', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6), 'text-anchor': 'middle' });
      note(560, 160, '죽었는지 물어볼 곳이 없다', fade(u, 1.9), { fill: BAD }); return; }
    // k4: 런타임에 묻는다
    const bx = 560, by = 250, bs = pop(u, 0.2);
    card(bx, by, 150, 110, { rx: 8, fill: ACCBG, stroke: ACC, sw: 2.5, s: bs });
    el('line', { x1: bx - 60, y1: by - 55, x2: bx - 60, y2: by + 55, stroke: ACC, 'stroke-width': 3, opacity: bs });
    tx(bx + 6, by - 10, '레지스트리', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    tx(bx + 6, by + 16, '(전화번호부)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    fly(O1.x + 50, O1.y - 30, bx - 70, by - 40, seg(u, 0.8, 1.6), 'user-service 어디?', {});
    if (u > 1.6) pill(bx, by - 86, '지금 살아 있는 주소 목록', GOOD, pop(u, 1.7), { fs: 14, fill: PANEL });
    banner(480, 395, '위치는 배포 때가 아니라 실행 중에 묻는다', pop(u, 2.2)); }

  // ---------- 2. Eureka Server ----------
  const SV = { x: 280, y: 200 };
  function s2(t, c) { const { k, u } = c, T = { x: 560, y: 70, w: 370 };
    const on = k >= 2;
    server(SV.x, SV.y, on ? 'EUREKA-SERVER' : 'Spring Boot 앱', { lamp: on ? GOOD : OFF, op: k === 0 ? 0.35 + 0.65 * E(u, 1.6, 2.4) : 1 });
    if (k === 0) { card(SV.x + 60, 80, 400, 56, { rx: 8, fill: SOFT, stroke: GRID, sw: 1.5 }); tx(SV.x - 130, 46, 'build.gradle', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      fly(250, 150, SV.x + 60, 80, seg(u, 0.2, 1.4), 'spring-cloud-starter-netflix-eureka-server', { mono: true, stay: true });
      sub(SV.x, 330, '스타터를 넣었을 뿐, 아직 아무 일도 하지 않는다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k >= 1) pill(SV.x, SV.y - 72, '@EnableEurekaServer', ACC, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 15, fill: ACCBG });
    if (k === 1) { fly(SV.x + 60, SV.y - 10, 640, 150, seg(u, 0.9, 1.7), '/eureka/apps', { mono: true, stay: true });
      fly(SV.x + 60, SV.y + 20, 640, 240, seg(u, 1.2, 2.0), '대시보드', { stay: true, fill: INFO });
      sub(720, 196, '등록·조회 REST API', fade(u, 1.8)); sub(720, 286, '상태를 보는 웹 화면', fade(u, 2.1)); return; }
    regTable(T.x, T.y, T.w, [], { empty: '비어 있음 · 등록 0건', emptyOp: k === 2 ? fade(u, 0.8) : k === 4 ? 1 - fade(u, 0.5) : 1 });
    if (k === 2) { note(SV.x, 330, 'run()이 끝나면 등록 요청을 받는다', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    pill(SV.x, SV.y + 96, '10.0.0.2:8761', ACC, k === 3 ? pop(u, 0.2) : 1, { mono: true, fs: 15, fill: PANEL });
    if (k === 3) { [[90, 330], [180, 370]].forEach(([x, y], i) => { card(x, y, 90, 34, { rx: 8, text: '클라이언트', fs: 13.5, stroke: MUT, color: MUT, s: pop(u, 0.6 + i * 0.3) });
        grow(x + 46, y - 12, SV.x - 40, SV.y + 104, E(u, 0.9 + i * 0.3, 1.6 + i * 0.3), ACC, { dash: '5 4' }); });
      mono(560, 340, 'defaultZone: http://10.0.0.2:8761/eureka/', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.8) }); return; }
    // k4: 자기 자신은 등록 안 함
    const fu = seg(u, 0.2, 1.2);
    if (u < 1.9) fly(SV.x + 60, SV.y, T.x + 180, T.y + 60, fu, 'EUREKA-SERVER', { mono: true, stay: true, fill: OFF, color: INK });
    cross(T.x + 180, T.y + 60, 14, pop(u, 1.2));
    mono(T.x + 10, 230, 'register-with-eureka: false', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) });
    mono(T.x + 10, 260, 'fetch-registry: false', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
    sub(T.x + 185, 300, '서버는 목록을 관리할 뿐 목록에 들지 않는다', fade(u, 2.1), { 'font-size': 14.5 }); }

  // ---------- 3. 클라이언트 등록 ----------
  const CL = [{ name: 'user-service', ip: '10.0.1.7', port: 8081, y: 100 }, { name: 'user-service', ip: '10.0.1.8', port: 8081, y: 205 }, { name: 'order-service', ip: '10.0.2.3', port: 8082, y: 310 }];
  function s3(t, c) { const { k, u } = c, rows = rowsOf(c.beat), prevN = rowsOf(c.prev).length, T = { x: 470, y: 60, w: 460 };
    const shown = [1, 1, 2, 3][k];   // 이 beat 에 떠 있는 클라이언트 수
    CL.slice(0, shown).forEach((p, i) => inst(130, p.y, p.name, `${p.ip}:${p.port}`, { s: i === shown - 1 && (k === 0 || k >= 2) ? pop(u, 0.2) : 1, col: i < rows.length ? ACC : INK }));
    regTable(T.x, T.y, T.w, rows, { appear: (i) => (i >= prevN ? E(u, 1.2, 1.9) : 1), lease: k === 3 ? () => E(u, 1.6, 2.4) : null });
    if (k === 0) { sub(T.x + T.w / 2, 240, 'server.port: 8081로 떴다. 아직 등록 전', fade(u, 0.8), { 'font-size': 14.5 }); return; }
    const j = shown - 1, from = [215, CL[j].y], to = [T.x - 6, T.y + 60 + j * 42];
    if (u < 1.3) fly(from[0], from[1], to[0], to[1], seg(u, 0.2, 1.2), u < 0.7 ? CL[j].name : CL[j].name.toUpperCase(), { mono: true, fill: ACC });
    if (k === 1) { mono(T.x + 14, 260, 'spring.application.name: user-service', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      mono(T.x + 14, 288, '→ 레지스트리 키 USER-SERVICE', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { mono(T.x + 14, 280, 'defaultZone: 10.0.0.2:8761/eureka/', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) });
      fly(T.x, T.y + 90, 215, CL[0].y + 30, seg(u, 1.6, 2.5), '목록 받기 (fetch)', { fill: INFO }); return; }
    // k3: prefer-ip + lease 선언
    const hs = E(u, 0.2, 0.9);
    mono(130, 372, hs < 0.5 ? 'host: ip-10-0-2-3.internal' : 'host: 10.0.2.3 (IP)', { 'font-size': 13.5, 'font-weight': 700, fill: hs < 0.5 ? MUT : ACC, 'text-anchor': 'middle' });
    mono(T.x + T.w - 10, T.y + 222, 'lease 90s 중 남은 시간', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0), 'text-anchor': 'end' });
    mono(T.x + 14, T.y + 222, 'renew 30s · expire 90s', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.7) }); }

  // ---------- 4. 생명주기 ----------
  const TL = { x0: 80, x1: 900, y: 360, max: 330 }, TX = (s) => TL.x0 + (s / TL.max) * (TL.x1 - TL.x0);
  const SRC = [40, 40 + 46, 40 + 92, 40 + 138];
  function timeline(op) { el('line', { x1: TL.x0, y1: TL.y, x2: TL.x1, y2: TL.y, stroke: MUT, 'stroke-width': 1.8, opacity: op });
    [0, 60, 120, 180, 240, 300].forEach((s) => { el('line', { x1: TX(s), y1: TL.y - 4, x2: TX(s), y2: TL.y + 4, stroke: MUT, opacity: op }); mono(TX(s), TL.y + 22, s + 's', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }); }
  function mark(s, label, col, op, up) { el('line', { x1: TX(s), y1: TL.y - 26, x2: TX(s), y2: TL.y, stroke: col, 'stroke-width': 2.5, opacity: op });
    mono(TX(s), TL.y - (up ? 46 : 32), label, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: op }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, rows = rowsOf(b), pr = rowsOf(c.prev), T = { x: 230, y: 34, w: 700 };
    if (k === 5) return s4ten(t, c);
    // 왼쪽 인스턴스 칩
    rows.forEach((r, i) => { const y = T.y + 40 + i * 46 + 23, dead = r.dead && k >= 2;
      card(110, y, 160, 36, { rx: 8, stroke: dead ? BAD : GRID, sw: dead ? 2.5 : 1.5, fill: dead ? BADBG : PANEL });
      mono(42, y + 5, r.ip, { 'font-size': 13.5, 'font-weight': 700, fill: dead ? BAD : INK });
      if (dead) cross(206, y, 9, k === 2 ? pop(u, 0.3) : 1);
      // 하트비트 점 (k1: 모두 / k2~: 죽은 것 빼고)
      if (k >= 1 && !dead) for (let q = 0; q < 2; q++) dot([[192, y], [T.x - 4, y]], ((t * 0.9 + q * 0.5 + i * 0.13) % 1), ACC, 5); });
    const leaseOf = (i) => { const r = rows[i]; if (k === 0) return E(u, 1.0, 1.8); if (r.dead && k >= 2) return k === 2 ? 1 - 0.55 * E(u, 0.4, 2.6) : k === 3 ? 0.45 - 0.45 * E(u, 1.4, 2.4) : 0;
      return 0.75 + 0.25 * Math.abs(Math.sin(t * 1.3 + i)); };
    regTable(T.x, T.y, T.w, rows, { appear: k === 0 ? (i) => E(u, 0.2 + i * 0.15, 0.7 + i * 0.15) : null,
      status: k === 0 ? () => (u < 1.4 ? 'STARTING' : 'UP') : null,
      renew: (i) => 'renew ' + Math.round(tween(pr[i] ? pr[i].renew : null, rows[i].renew, u)), lease: leaseOf });
    if (k === 0) { timeline(fade(u, 1.6)); mark(0, 'register', ACC, fade(u, 1.8)); return; }
    if (k === 1) { timeline(1); mark(0, 'register', MUT, 1); [30, 60, 90].forEach((s, i) => mark(s, '♥', ACC, fade(u, 0.5 + i * 0.4)));
      sub(TX(160), TL.y - 40, '30초마다 PUT → lease를 다시 90초로', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { timeline(1); [30, 60, 90].forEach((s) => mark(s, '♥', ACC, 1)); mark(95, 'kill -9', BAD, fade(u, 0.3), true);
      pill(TX(95) + 150, TL.y - 86, 'cancel 요청 없음 → 목록엔 UP', BAD, pop(u, 1.4), { fs: 13.5, fill: PANEL });
      return; }
    if (k === 3) { timeline(1); mark(90, '마지막 ♥', ACC, 1); mark(180, '+90s', WARN, fade(u, 0.4), true); mark(270, '+180s 만료', BAD, fade(u, 1.0));
      [60, 120, 180, 240].forEach((s) => el('circle', { cx: TX(s), cy: TL.y, r: 4, fill: MUT, opacity: fade(u, 1.4) }));
      el('circle', { cx: TX(300), cy: TL.y, r: 7, fill: BAD, opacity: fade(u, 1.8) }); mono(TX(300), TL.y - 32, '제거(예시)', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      return; }
    // k4: self-preservation (4대)
    const sp = b.sp || { expect: 8, thr: 6, got: 6 }, gx = 260, gy = 300;
    tx(60, gy + 4, '분당 renew', { 'font-size': 15, 'font-weight': 700 });
    [['기대', sp.expect, INK], ['임계', sp.thr, WARN], ['실제', sp.got, BAD]].forEach(([n, v, col], i) => { const y = gy - 26 + i * 30;
      mono(gx - 50, y + 14, n, { 'font-size': 13.5, fill: MUT }); hbar(gx, y, 320, v * E(u, 0.2 + i * 0.3, 0.9 + i * 0.3), 10, { col, label: false, h: 16 });
      mono(gx + 330, y + 14, String(v), { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.6 + i * 0.3) }); });
    mono(700, gy - 4, `${sp.got} > ${sp.thr} ?  아니오`, { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
    tx(700, gy + 26, 'eviction 멈춤', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
    card(480, 400, 600, 30, { rx: 6, fill: BAD, stroke: 'none', text: 'EMERGENCY! … RENEWALS ARE LESSER THAN THRESHOLD', fs: 13.5, color: PANEL, mono: true, s: pop(u, 2.1) }); }
  // k5: 10대라면 — 같은 한 대 장애가 다르게 끝난다
  function s4ten(t, c) { const { u } = c, sp = c.beat.sp || { n: 10, expect: 20, thr: 17, got: 18, got2: 16 };
    tx(40, 40, `인스턴스 ${sp.n}대 · 기대 renew 분당 ${sp.expect} · 임계 int(${sp.expect}×0.85) = ${sp.thr}`, { 'font-size': 16, 'font-weight': 700 });
    const two = u > 1.6;
    for (let i = 0; i < sp.n; i++) { const x = 70 + (i % 5) * 70, y = 100 + Math.floor(i / 5) * 70, dead = i === 0 || (two && i === 1);
      card(x, y, 56, 48, { rx: 8, stroke: dead ? BAD : GOOD, sw: 2.2, fill: dead ? BADBG : GOODBG, s: i === 1 && two ? 1 + 0.1 * Math.sin(seg(u, 1.6, 2.0) * Math.PI) : 1 });
      if (dead) cross(x, y, 10, i === 1 ? pop(u, 1.6) : pop(u, 0.2)); }
    const ax = 470, w = 380, sc = (v) => (v / sp.expect) * w;
    const got = two ? sp.got2 : sp.got;
    tx(ax, 110, two ? '두 대가 함께 죽으면' : '한 대만 죽으면', { 'font-size': 15, 'font-weight': 700, fill: two ? BAD : GOOD });
    el('rect', { x: ax, y: 126, width: w, height: 26, rx: 4, fill: SOFT });
    el('rect', { x: ax, y: 126, width: sc(two ? lerp(sp.got, sp.got2, E(u, 1.6, 2.2)) : sp.got * E(u, 0.3, 1.0)), height: 26, rx: 4, fill: two ? BAD : GOOD });
    el('line', { x1: ax + sc(sp.thr), y1: 116, x2: ax + sc(sp.thr), y2: 162, stroke: WARN, 'stroke-width': 3 });
    mono(ax + sc(sp.thr), 182, '임계 ' + sp.thr, { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle' });
    mono(ax + w + 10, 145, String(got), { 'font-size': 16, 'font-weight': 800, fill: two ? BAD : GOOD });
    mono(ax, 230, `${sp.got} > ${sp.thr}  → 죽은 1대를 지운다`, { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.9) });
    mono(ax, 262, `${sp.got2} > ${sp.thr} 아님 → eviction 멈춤`, { 'font-size': 16, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
    sub(480, 330, '판단은 대수가 아니라 비율로 한다. 4대에서는 1대만 죽어도 멈췄다', fade(u, 2.3), { 'font-size': 15 }); }

  // ---------- 5. 서비스명 호출 + 로드밸런싱 ----------
  function s5(t, c) { const { k, u } = c, rows = rowsOf(c.beat), ups = rows.filter((r) => r.name === 'USER-SERVICE' && r.status === 'UP'), pUps = rowsOf(c.prev).filter((r) => r.name === 'USER-SERVICE').length;
    if (k <= 1) { zone(40, 40, 520, 330, 'ApplicationContext (order-service)', { fill: SOFT });
      const bs = k === 0 ? 1 : 1; card(240, 150, 240, 64, { rx: 10, text: 'WebClient.Builder', fs: 16, mono: true, s: bs });
      if (k === 0) { const pu = E(u, 0.4, 1.4); card(lerp(560, 380, pu), 150, 92, 46, { rx: 8, fill: ACCBG, stroke: ACC, sw: 2.5, text: 'LB 필터', fs: 14, color: ACC });
        pill(240, 96, '@LoadBalanced', ACC, pop(u, 1.4), { mono: true, fs: 14.5, fill: PANEL });
        sub(300, 250, '서비스명 → 인스턴스로 바꾸는 필터가 끼워진다', fade(u, 1.9), { 'font-size': 14.5 }); return; }
      card(380, 150, 92, 46, { rx: 8, fill: ACCBG, stroke: ACC, sw: 2.5, text: 'LB 필터', fs: 14, color: ACC }); pill(240, 96, '@Bean @LoadBalanced', ACC, 1, { mono: true, fs: 14.5, fill: PANEL });
      check(140, 230, 12, pop(u, 0.4)); tx(162, 236, '빈으로 등록된 빌더만 필터를 갖는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.5) });
      card(760, 200, 230, 64, { rx: 10, text: 'new WebClient', fs: 16, mono: true, stroke: MUT, color: MUT, s: pop(u, 1.2) });
      cross(760, 262, 12, pop(u, 1.6)); sub(760, 300, '직접 만들면 http://user-service를 못 푼다', fade(u, 1.8), { 'font-size': 14 }); return; }
    // k2~: 왼쪽 OrderService, 가운데 LB, 오른쪽 인스턴스 목록(UP 만)
    card(130, 200, 200, 120, { rx: 10, stroke: INK, sw: 2.2 });
    tx(130, 162, 'OrderService', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
    mono(130, 196, 'webClient', { 'font-size': 14.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700 });
    if (k === 2) { fly(130, 60, 130, 196, seg(u, 0.2, 1.1), 'builder.build()', { mono: true, fill: ACC });
      mono(130, 236, 'IP: 없음', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(560, 200, '아는 것은 이름 user-service 뿐이다', fade(u, 1.8), { 'font-size': 16, fill: INK }); return; }
    // URL
    const url = 'http://user-service/users/42', ux = 250, uy = 64, nU = k === 3 ? Math.round(url.length * E(u, 0.2, 1.2)) : url.length;
    mono(ux, uy, url.slice(0, nU), { 'font-size': 17, 'font-weight': 700 });
    if (k === 3) { const hx = ux + R.tw('http://', 17), hw = R.tw('user-service', 17);
      el('rect', { x: hx - 3, y: uy - 19, width: hw + 6, height: 26, rx: 4, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.3) });
      tx(hx + hw / 2, uy + 32, '호스트 자리 = 서비스명', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(560, 250, '실제 주소는 호출 직전에 정해진다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k4, k5: 라운드로빈
    const LB = { x: 430, y: 220 }; el('circle', { cx: LB.x, cy: LB.y, r: 46, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 });
    tx(LB.x, LB.y - 4, 'Load', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' }); tx(LB.x, LB.y + 15, 'Balancer', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    const n = ups.length, ys = ups.map((_, i) => 220 + (i - (n - 1) / 2) * 82), isNew = (i) => k === 5 && i >= pUps;
    ups.forEach((r, i) => { const s = isNew(i) ? pop(u, 0.2) : 1; inst(800, ys[i], r.name, r.ip, { s, col: isNew(i) ? WARN : INK, lamp: GOOD }); });
    grow(232, 200, LB.x - 50, LB.y, 1, MUT);
    const order = k === 4 ? [1, 0, 1, 0] : [2, 0, 1, 2], gate = k === 5 ? 1.4 : 0.3;   // 순서는 예시 (카운터 시작값에 따라 달라진다)
    order.forEach((j, q) => { if (j >= n) return; const a = gate + q * 0.32; if (k === 5 && u < 1.4 && j === 2) return;
      dot([[232, 200], [LB.x, LB.y], [715, ys[j]]], seg(u, a, a + 0.6), j === 2 ? WARN : ACC, 6); });
    mono(LB.x, 300, k === 4 ? 'UP 2대 중 차례로' : 'UP 3대 중 차례로', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
    sub(LB.x, 324, '(고르는 순서는 예시)', 1);
    if (k === 4) { mono(620, 120, '→ 10.0.1.8:8081', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) }); return; }
    clock(600, 360, 20, E(u, 0.4, 1.3), INFO); tx(630, 366, 'fetch 30초 뒤 목록에 합류', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.6) });
    sub(160, 300, '코드·설정 변경 0줄', fade(u, 2.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }

  const quiz = [
    { q: 'user-service를 3대로 늘렸는데 설정에 주소가 10.0.1.7 하나만 적혀 있다. 무슨 일이 생기는가?',
      o: ['세 대가 요청을 고르게 나눠 받는다', '모든 요청이 10.0.1.7 한 대로만 간다', '새로 띄운 두 대로만 요청이 간다'], a: 1,
      why: '호출하는 쪽은 적힌 주소 하나만 안다. 그래서 늘린 두 대는 놀고, 한 대가 부하를 3배로 받는다.' },
    { q: '단일 Eureka 서버에서 register-with-eureka와 fetch-registry를 false로 두는 이유는 무엇인가?',
      o: ['서버가 목록을 관리할 뿐 스스로 목록에 들 필요가 없어서', '서버가 등록 요청을 받지 않게 하려고', '대시보드를 끄려고'], a: 0,
      why: '서버는 전화번호부 역할만 한다. 켜 두면 서버가 자기 자신을 찾으려다 실패 로그를 남긴다.' },
    { q: 'spring.application.name이 user-service인 인스턴스 두 대가 등록되면 레지스트리는 어떻게 되는가?',
      o: ['이름이 겹쳐 두 번째 등록이 거절된다', 'USER-SERVICE라는 한 서비스 아래 인스턴스 두 줄이 생긴다', '서비스가 USER-SERVICE-1, USER-SERVICE-2로 나뉜다'], a: 1,
      why: '이름이 곧 서비스 키다. 같은 이름으로 붙은 인스턴스들은 한 서비스의 인스턴스 목록으로 모인다.' },
    { q: '인스턴스 4대 중 10.0.1.8이 kill -9로 죽었다.이 클러스터에서 10.0.1.8은 어떻게 되는가?',
      o: ['cancel 요청이 가서 바로 목록에서 빠진다', '90초 뒤 정확히 목록에서 지워진다', '분당 renew가 6번으로 임계 6을 넘지 못해 eviction이 멈추고 목록에 남는다'], a: 2,
      why: '기대 8번의 85%를 내린 임계가 6이다. 6 > 6이 아니므로 self-preservation이 eviction을 막는다.' },
    { q: '@LoadBalanced WebClient로 http://user-service/users/42를 부르면 호스트 자리는 어떻게 처리되는가?',
      o: ['DNS가 user-service라는 호스트를 찾는다', 'LoadBalancer가 USER-SERVICE의 UP 인스턴스 중 하나의 주소로 바꾼다', 'Eureka 서버가 요청을 대신 전달한다'], a: 1,
      why: '레지스트리에서 받아 둔 목록 가운데 UP인 인스턴스를 라운드로빈으로 골라 실제 IP로 바꾼다. 요청이 Eureka 서버를 거치지는 않는다.' },
  ];

  const summary = [
    '주소를 설정에 적어 두면 스케일아웃과 재배포, 장애를 호출하는 쪽이 따라가지 못한다.',
    'Eureka 서버는 이름과 인스턴스 목록만 들고, 클라이언트가 부팅할 때 스스로 등록한다.',
    '클라이언트는 30초마다 renew를 보내고, kill -9로 죽으면 lease가 끝날 때까지 목록에 남는다.',
    '분당 renew가 임계를 넘지 못하면 self-preservation이 eviction을 멈춘다. 4대면 1대 장애로도 켜진다.',
  ];
  const review = [
    { q: '개발 환경에서 인스턴스 3~4대로 Eureka를 쓰는데 대시보드에 빨간 경고가 자주 뜨고 죽은 인스턴스가 안 빠진다. 먼저 의심할 것은?',
      o: ['Eureka 서버의 메모리 부족', '대수가 적어 renew 몇 번만 빠져도 임계 아래로 떨어지는 self-preservation', 'prefer-ip-address 설정 누락'], a: 1,
      why: '임계는 기대 renew의 85%로 정해진다. 4대면 한 대만 빠져도 6 > 6을 넘지 못해 eviction이 멈춘다.' },
    { q: '배포할 때 인스턴스를 kill -9로 내리자 몇 분 동안 그 주소로 요청이 가서 실패했다. 이유로 가장 알맞은 것은?',
      o: ['cancel이 없어서 lease 만료와 eviction 검사를 기다리는 동안 목록에 UP으로 남았다', 'LoadBalancer가 라운드로빈을 쓰지 않아서', '서비스명이 대문자로 바뀌어서'], a: 0,
      why: '정상 종료면 cancel로 바로 빠진다. 강제 종료는 마지막 renew 뒤 만료 판정과 60초 주기 검사를 거쳐서야 지워진다.' },
    { q: 'user-service를 한 대 더 띄웠는데 order-service의 호출이 바로 새 인스턴스로 가지 않는다. 가장 자연스러운 설명은?',
      o: ['새 인스턴스가 등록에 실패했다', 'order-service가 들고 있는 목록이 다음 fetch 때까지 옛것이다', '@LoadBalanced가 빠졌다'], a: 1,
      why: 'order-service는 30초마다 레지스트리를 받아 와 캐시한다. 등록은 바로 되지만 호출하는 쪽 목록은 다음 fetch 때 바뀐다.' },
  ];

  R.page({ title: '서비스 레지스트리 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
