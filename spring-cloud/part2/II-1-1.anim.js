/* II-1-1 Config Server 중앙 집중식 설정 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림의 주인공: yml 파일 줄, git 레포·브랜치, Config Server(:8888), 병합 우선순위 층, {cipher} 암호문, @RefreshScope 빈.
 * 숫자는 STEPS 의 services·environments·centralized 와 코드 블록에 적힌 값, 재시도 간격은 공식 기본값(1000ms, ×1.1)으로 계산한 값만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, person, dbIcon, cross, check, lock, clock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 91.7) * 43758.5; return s - Math.floor(s); };
  // yml 파일 카드: lines = [text, {col, hot, op}] ; 제목 탭 포함
  function yfile(x, y, w, name, lines, o) { o = o || {}; const lh = 26, h = 44 + lines.length * lh + 6, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.8, opacity: op });
    el('rect', { x, y, width: w, height: 30, rx: 8, fill: o.tab || SOFT, opacity: op }); el('rect', { x, y: y + 22, width: w, height: 8, fill: o.tab || SOFT, opacity: op });
    mono(x + 12, y + 20, name, { 'font-size': 13.5, 'font-weight': 700, fill: o.tabCol || MUT, opacity: op });
    lines.forEach(([s, lo], i) => { lo = lo || {}; const yy = y + 44 + i * lh + 8, a = (lo.op ?? 1) * op; if (a <= 0) return;
      if (lo.hot) el('rect', { x: x + 6, y: yy - 17, width: w - 12, height: 23, rx: 4, fill: lo.hot, opacity: a });
      mono(x + 14, yy, s, { 'font-size': 14, fill: lo.col || INK, 'font-weight': lo.bold ? 700 : 400, opacity: a }); });
    return h; }
  // git 커밋 줄: 점 n 개를 u 만큼
  function gitLine(x, y, w, n, u, col, label) { el('line', { x1: x, y1: y, x2: x + w * clamp(u), y2: y, stroke: col || INK, 'stroke-width': 3 });
    for (let i = 0; i < n; i++) { const px = x + (w * i) / (n - 1); if (px > x + w * clamp(u) + 1) continue; el('circle', { cx: px, cy: y, r: 7, fill: PANEL, stroke: col || INK, 'stroke-width': 3 }); }
    if (label) mono(x + w + 12, y + 5, label, { 'font-size': 14, 'font-weight': 700, fill: col || INK }); }
  // 글자를 섞으며 바뀌기 (a → b)
  function morph(a, b, f) { const n = Math.max(a.length, b.length), m = Math.floor(n * f), CH = 'AQBvk9xc1f2Zr7';
    let s = ''; for (let i = 0; i < n; i++) s += i < m ? (b[i] || '') : f > 0 && f < 1 && i < m + 4 ? CH[Math.floor(hsh(i + m) * CH.length)] : (a[i] || ''); return s; }

  // ---------- 1. 설정 파편화 ----------
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    if (k <= 1) {
      const L1 = [['url: jdbc:mysql://prod-db:3306/users'], ['password: p@ssw0rd!', { col: BAD, hot: BADBG, bold: true }], ['feature.new-login: true']];
      const n1 = k === 0 ? E(u, 0.4, 2.0) * 3 : 3;
      zone(30, 60, 420, 230, 'user-service 레포', { fill: SOFT, op: k === 0 ? fade(u, 0.1) : 1 });
      yfile(50, 96, 380, 'application-prod.yml', L1.map(([s, o], i) => [s, Object.assign({}, o, { op: clamp(n1 - i) })]), { op: k === 0 ? fade(u, 0.2) : 1 });
      if (k === 0) { sub(240, 330, '서비스 레포 안에 운영 DB 주소와 비번이 그대로', fade(u, 2.1), { 'font-size': 14.5 }); return; }
      const L2 = [['url: jdbc:mysql://prod-db:3306/orders'], ['password: p@ssw0rd!', { col: BAD, hot: BADBG, bold: true, op: fade(u, 1.3) }], ['timeout.read-ms: 3000']];
      zone(510, 60, 420, 230, 'order-service 레포', { fill: SOFT, op: fade(u, 0.1) });
      yfile(530, 96, 380, 'application-prod.yml', L2, { op: fade(u, 0.3) });
      fly(150, 176, 640, 176, seg(u, 0.5, 1.3), 'p@ssw0rd!', { mono: true, fill: BAD });
      el('path', { d: 'M 230 236 Q 480 300 720 236', fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.6) });
      note(480, 330, '같은 비번이 레포 2곳에', fade(u, 1.8), { fill: BAD, 'text-anchor': 'middle' }); return; }
    if (k === 2) { const S = b.services, Env = ['dev', 'stage', 'prod'], cw = 62, x0 = 170, y0 = 80;
      const shown = Math.round(tween(2, S * b.environments, u, 1.4));
      Env.forEach((e, r) => mono(x0 - 16, y0 + r * 52 + 26, e, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }));
      for (let i = 0; i < S * 3; i++) { const col = i % S, row = Math.floor(i / S), on = i < shown;
        if (!on) continue; card(x0 + col * cw + 27, y0 + row * 52 + 20, 54, 40, { rx: 5, fill: row === 2 ? BADBG : PANEL, stroke: row === 2 ? BAD : GRID, sw: 1.5, text: '.yml', fs: 13.5, mono: true, color: MUT }); }
      mono(x0 + S * cw + 16, y0 + 70, `사본 ${shown}개`, { 'font-size': 18, 'font-weight': 800, fill: BAD });
      mono(x0 + S * cw + 16, y0 + 96, `${S} 서비스 × ${b.environments} 환경`, { 'font-size': 14, fill: MUT });
      for (let i = 0; i < S; i++) pill(x0 + i * cw + 27, 290, '배포', BAD, pop(u, 1.6 + i * 0.07), { fs: 13.5, fill: PANEL });
      note(480, 350, 'prod 비번 하나 바꾸려면 10개 서비스를 다 배포한다', fade(u, 2.2), { 'text-anchor': 'middle', fill: BAD }); return; }
    // k3: 평문 커밋 + 재기동
    person(140, 150, '레포 접근자', { s: pop(u, 0.2) });
    grow(180, 150, 350, 150, E(u, 0.5, 1.1), BAD); dbIcon(420, 150, '운영 DB', { stroke: BAD, s: pop(u, 0.9) });
    sub(280, 240, '레포를 읽을 수 있으면 운영 DB에도 들어간다', fade(u, 1.1), { 'font-size': 14.5, fill: BAD });
    card(720, 140, 200, 60, { rx: 30, stroke: INK, sw: 2, s: pop(u, 1.3) }); mono(660, 146, 'new-login', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
    el('circle', { cx: 790, cy: 140, r: 18, fill: OFF, opacity: fade(u, 1.4) });
    el('path', { d: 'M 700 240 A 26 26 0 1 1 740 262', fill: 'none', stroke: WARN, 'stroke-width': 3, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 1.6) });
    tx(760, 256, '끄려면 재기동', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
    banner(480, 370, '설정을 한 곳에서 관리할 서버가 필요하다', pop(u, 2.2)); }

  // ---------- 2. Config Server + Git ----------
  const SV2 = { x: 560, y: 190 };
  const TREE = [['application.yml', '전역 공통', INK], ['user-service.yml', '앱 공통', ACC], ['user-service-dev.yml', '앱 + dev', INFO], ['user-service-prod.yml', '앱 + prod', WARN], ['order-service.yml', '앱 공통', ACC], ['order-service-prod.yml', '앱 + prod', WARN]];
  function s2(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const named = k >= 1 || u > 1.2;
    server(SV2.x, SV2.y, named ? 'Config Server' : 'Spring Boot 앱', { lamp: k >= 1 ? ACC : OFF });
    pill(SV2.x, SV2.y - 74, '@EnableConfigServer', ACC, k === 0 ? pop(u, 0.4) : 1, { mono: true, fs: 15, fill: ACCBG });
    if (k === 0) { sub(SV2.x, 330, '평범한 Spring Boot 앱에 한 줄', fade(u, 1.4), { 'font-size': 15 }); return; }
    pill(SV2.x + 110, SV2.y + 20, ':8888', ACC, k === 1 ? pop(u, 0.3) : 1, { mono: true, fs: 15, fill: PANEL });
    if (k === 1) { card(180, 190, 180, 110, { rx: 10, dash: '7 6', stroke: MUT, sw: 2, text: 'backend ?', fs: 17, color: MUT, s: pop(u, 0.9) });
      grow(275, 190, SV2.x - 62, SV2.y, E(u, 1.3, 2.0), MUT, { dash: '5 5' });
      sub(SV2.x, 320, 'name: config-server로 떴지만 내려줄 설정이 없다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 2) { tx(60, 120, 'config-repo (git)', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 0.1) });
      gitLine(70, 170, 260, 5, E(u, 0.2, 1.2), INK, 'main');
      grow(380, 170, SV2.x - 62, SV2.y - 10, E(u, 1.2, 1.8), ACC);
      mono(SV2.x - 270, SV2.y + 50, 'git.uri: …/acme/config-repo', { 'font-size': 14, fill: ACC, opacity: fade(u, 1.4) });
      const n = Math.round(tween(p.centralized, b.centralized, u, 1.4));
      mono(SV2.x, 340, `중앙 관리 설정 파일 ${n}개`, { 'font-size': 18, 'font-weight': 800, fill: n ? ACC : MUT, 'text-anchor': 'middle' });
      sub(SV2.x, 368, '이력·리뷰·롤백은 git 그대로', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    // 레포 파일 목록 (왼쪽)
    tx(40, 50, 'config-repo/', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    const pick = k === 4 ? [0, 1, 3] : [];
    TREE.forEach(([f, tag, col], i) => { const y = 74 + i * 46, s = k === 3 ? pop(u, 0.2 + i * 0.25) : 1, on = pick.includes(i);
      card(190, y + 16, 300, 38, { rx: 7, stroke: on ? ACC : col === INK ? GRID : col, sw: on ? 3 : 1.6, fill: on ? ACCBG : PANEL, s });
      mono(52, y + 21, f, { 'font-size': 14, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 });
      tx(330, y + 21, tag, { 'font-size': 13.5, fill: col === INK ? MUT : col, 'font-weight': 700, 'text-anchor': 'end', opacity: s > 0.5 ? 1 : 0 }); });
    grow(345, 190, SV2.x - 62, SV2.y, 1, ACC);
    if (k === 3) { sub(SV2.x + 170, 330, '파일 이름이 곧 규칙: {app}-{profile}.yml', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4: GET /user-service/prod → 3개 병합
    pill(830, 80, 'GET /user-service/prod', INFO, pop(u, 0.1), { mono: true, fs: 14, fill: PANEL });
    grow(800, 98, SV2.x + 60, SV2.y - 30, E(u, 0.3, 0.9), INFO);
    pick.forEach((i, q) => fly(190, 90 + i * 46, SV2.x, SV2.y, seg(u, 0.8 + q * 0.5, 1.25 + q * 0.5), TREE[i][0], { mono: true }));
    card(820, 270, 200, 96, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 2.0) });
    mono(820, 262, 'JSON', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
    tx(820, 288, '파일 3개 병합', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }

  // ---------- 3. 클라이언트 ----------
  const CS = { x: 780, y: 200 }, WAITS = [1000, 1100, 1210, 1331, 1464.1];   // 기본값 1000ms × 1.1^n 으로 계산
  function s3(t, c) { const { k, u } = c, b = c.beat;
    // 왼쪽 클라이언트 yml
    if (k <= 3) yfile(30, 60, 330, 'user-service/application.yml', [['name: user-service', { bold: true, col: ACC }], ['profiles.active: prod', { bold: true, col: ACC }],
      ['import: configserver:…:8888', { op: k >= 1 ? (k === 1 ? fade(u, 0.3) : 1) : 0.0, col: INFO, bold: true }]], {});
    if (k !== 4) server(CS.x, CS.y, 'config-server:8888', { lamp: k === 2 ? OFF : ACC, stroke: k === 2 ? BAD : INK });
    if (k === 0) { const sx = 450; mono(sx, 290, '/{application}/{profile}', { 'font-size': 17, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.2) });
      fly(150, 120, sx + 70, 330, seg(u, 0.7, 1.5), 'user-service', { mono: true, stay: true }); fly(150, 146, sx + 220, 330, seg(u, 1.1, 1.9), 'prod', { mono: true, stay: true });
      sub(sx + 150, 380, '두 값이 요청 좌표가 된다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    if (k === 1) { grow(362, 172, CS.x - 62, CS.y, E(u, 0.5, 1.5), INFO, { sw: 3 });
      sub(560, 250, '부팅할 때 Config Server를 설정 소스로 읽는다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 2) { cross(CS.x, CS.y, 22, pop(u, 0.2));
      const x0 = 70, W = 760, tot = WAITS.reduce((a, v) => a + v, 0), X = (ms) => x0 + (ms / tot) * W;
      el('line', { x1: x0, y1: 320, x2: x0 + W, y2: 320, stroke: GRID, 'stroke-width': 2 });
      let acc = 0; for (let i = 0; i < 6; i++) { const at = 0.3 + i * 0.3, x = X(acc), s = pop(u, at);
        el('circle', { cx: x, cy: 320, r: 9 * s, fill: BAD }); mono(x, 300, String(i + 1), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, at) });
        if (i < 5) { mono((x + X(acc + WAITS[i])) / 2, 350, Math.round(WAITS[i]) + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, at + 0.2) }); acc += WAITS[i]; } }
      mono(x0 + W, 386, '≈ 6.1초 뒤 부팅 중단 (fail-fast)', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.2) });
      tx(x0, 386, '간격은 기본값으로 계산', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { const steps = ['기동', '좌표 조합', 'GET 호출', '원격 값 적용', '주입'];
      steps.forEach((s, i) => { const on = u > 0.3 + i * 0.4; card(110 + i * 150, 360, 130, 40, { rx: 20, text: `${i + 1} ${s}`, fs: 14, stroke: on ? ACC : GRID, color: on ? ACC : MUT, fill: on ? ACCBG : PANEL }); });
      dot([[362, 172], [CS.x - 62, CS.y]], seg(u, 0.9, 1.4), INFO, 7); dot([[CS.x - 62, CS.y + 10], [362, 182]], seg(u, 1.4, 1.9), ACC, 7);
      card(560, 230, 240, 34, { rx: 6, fill: ACCBG, stroke: ACC, text: '원격 설정 (위)', fs: 14, color: ACC, s: pop(u, 1.8) });
      card(560, 268, 240, 34, { rx: 6, fill: SOFT, stroke: GRID, text: '로컬 application.yml', fs: 14, color: MUT, s: pop(u, 1.6) }); return; }
    if (k === 4) { const L = [['user-service-prod.yml', '앱 + 프로파일'], ['application-prod.yml', '전역 + 프로파일'], ['user-service.yml', '앱 공통'], ['application.yml', '전역 공통']];
      tx(90, 50, '강함', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(90, 360, '약함', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      el('line', { x1: 110, y1: 66, x2: 110, y2: 336, stroke: MUT, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)', opacity: fade(u, 0.2) });
      L.forEach(([f, tag], i) => { const y = 92 + i * 70, w = 360 + i * 50, s = pop(u, 0.2 + i * 0.3);
        card(420, y, w, 52, { rx: 8, fill: i === 0 ? ACCBG : i === 1 ? INFOBG : PANEL, stroke: i === 0 ? ACC : i === 1 ? INFO : GRID, sw: 2, s });
        mono(420 - w / 2 + 18, y + 5, f, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) });
        tx(420 + w / 2 - 16, y + 5, tag, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.3) }); });
      note(800, 150, '겹치는 키는', fade(u, 1.6)); note(800, 176, '위층이 이긴다', fade(u, 1.8), { fill: ACC });
      sub(780, 230, '2층이 3층보다 위다', fade(u, 2.2), { 'font-size': 14.5, 'text-anchor': 'start' }); return; }
    // k5: 주입 + 10개 서비스
    mono(60, 80, '@Value("${feature.new-login}")', { 'font-size': 16, 'font-weight': 700, fill: INFO });
    mono(60, 110, 'private boolean newLogin;', { 'font-size': 16 });
    fly(CS.x - 60, CS.y - 30, 300, 140, seg(u, 0.2, 1.0), 'true', { mono: true, stay: true });
    const S = b.services; for (let i = 0; i < S; i++) { const x = 520 + (i % 2) * 70, y = 110 + Math.floor(i / 2) * 50;
      const s = pop(u, 1.0 + i * 0.08); grow(x + 24, y, CS.x - 64, CS.y, s > 0.9 ? 1 : 0, ACC, { plain: true, op: 0.5, sw: 1.5 }); card(x, y, 48, 32, { rx: 6, stroke: ACC, fill: ACCBG, s, text: String(i + 1), fs: 13.5, mono: true, color: ACC }); }
    mono(CS.x, 330, `서비스 ${S}개`, { 'font-size': 15, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    sub(CS.x, 354, '같은 import 한 줄로 연결', fade(u, 2.0), { 'font-size': 14 });
    tx(160, 380, '클라이언트 레포에서 DB 비번이 사라졌다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); }

  // ---------- 4. 프로파일 · {cipher} · {label} ----------
  const CIPH = "{cipher}AQBv3k9x...c1f2";
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) { const pw = k === 0 ? 'password: ???  (평문 자리)' : k === 1 ? 'password: ' + morph('p@ssw0rd!', CIPH, E(u, 0.4, 1.8)) : 'password: ' + CIPH;
      const lines = [['url: jdbc:mysql://prod-db:3306/users', { hot: k === 3 ? WARNBG : null }], ['username: user_app'], [pw, { col: k === 0 ? WARN : ACC, bold: true, hot: k === 1 || k === 3 ? ACCBG : null }]];
      if (k >= 2) lines.push(['feature.new-login: true', { op: k === 2 ? fade(u, 0.4) : 1, col: INFO }], ['timeout.read-ms: 2000', { op: k === 2 ? fade(u, 0.9) : 1, col: INFO }]);
      yfile(30, 50, k === 3 ? 440 : 520, 'user-service-prod.yml', lines, { stroke: WARN, tab: WARNBG, tabCol: WARN });
      if (k === 0) { note(620, 120, '{app}-{profile}.yml', fade(u, 0.6), { class: 'mono' }); sub(700, 150, '파일 이름 하나로 환경이 갈린다', fade(u, 1.0), { 'font-size': 14.5 }); return; }
      if (k === 1) { lock(640, 135, true, ACC, pop(u, 1.6)); note(670, 141, 'git 에는 암호문만', fade(u, 1.8), { fill: ACC }); return; }
      if (k === 2) { note(620, 230, 'DB 정보뿐 아니라', fade(u, 1.4)); note(620, 256, '플래그·타임아웃도 환경별로', fade(u, 1.7), { fill: INFO }); return; }
      yfile(490, 50, 440, 'user-service-dev.yml', [['url: jdbc:mysql://dev-db:3306/users', { hot: WARNBG }], ['password: dev-plain-ok', { hot: ACCBG }], ['feature.new-login: true', { col: INFO }]], { stroke: INFO, tab: INFOBG, tabCol: INFO, op: fade(u, 0.3) });
      sub(480, 340, '다른 줄만 칠해진다. grep으로 찾을 필요가 없다', fade(u, 1.5), { 'font-size': 15, fill: INK }); return; }
    if (k === 4) { server(480, 190, 'Config Server', { lamp: ACC });
      pill(480, 110, 'encrypt.key', WARN, pop(u, 0.2), { mono: true, fs: 14, fill: WARNBG });
      fly(90, 190, 410, 190, seg(u, 0.5, 1.3), 'POST /encrypt  p@ssw0rd!', { mono: true, fill: INFO });
      fly(550, 190, 860, 190, seg(u, 1.4, 2.2), 'AQBv3k9x...c1f2', { mono: true, stay: true });
      sub(480, 320, '키는 Config Server만 갖는다. 레포 권한과 복호화 권한이 갈린다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 5) { const pts = [130, 480, 830];
      card(pts[0], 190, 200, 70, { rx: 10, stroke: INK, text: 'config-repo', fs: 15 }); server(pts[1], 190, 'Config Server', { lamp: ACC });
      card(pts[2], 190, 200, 70, { rx: 10, stroke: ACC, text: 'user-service', fs: 15, color: ACC });
      fly(pts[0] + 40, 130, pts[1] - 20, 130, seg(u, 0.2, 1.0), CIPH, { mono: true, fill: OFF, color: INK });
      lock(pts[1] + 80, 120, u < 1.2, ACC, 1.2);
      fly(pts[1] + 40, 130, pts[2], 130, seg(u, 1.3, 2.1), 'password = p@ssw0rd!', { mono: true, fill: GOOD, stay: true });
      sub(480, 330, '배급할 때 풀어서 준다. 클라이언트는 암호화를 모른다', fade(u, 2.2), { 'font-size': 15 }); return; }
    // k6: {label}
    tx(60, 60, 'config-repo', { 'font-size': 15, 'font-weight': 700 });
    gitLine(80, 130, 560, 6, 1, INK, 'main (default-label)');
    el('path', { d: 'M 304 130 Q 340 220 400 220', fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 0.2) });
    gitLine(400, 220, 240 * E(u, 0.3, 1.0), 3, 1, ACC, u > 1.0 ? 'release-2026-08' : null);
    pill(480, 330, 'GET /user-service/prod/release-2026-08', ACC, pop(u, 1.3), { mono: true, fs: 14, fill: PANEL });
    grow(480, 312, 640, 232, E(u, 1.6, 2.2), ACC);
    sub(480, 380, 'label을 빼면 main의 설정이 나간다', fade(u, 2.3), { 'font-size': 14.5 }); }

  // ---------- 5. 런타임 갱신 ----------
  function bean(x, y, name, val, o) { o = o || {}; const g = card(x, y, 220, 84, { rx: 10, stroke: o.col || INK, sw: 2.2, s: o.s, op: o.op, fill: o.fill });
    tx(0, -14, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.col || INK }, g);
    if (val != null) mono(0, 18, val, { 'font-size': 15, 'text-anchor': 'middle', fill: o.vcol || INK, 'font-weight': 700 }, g); return g; }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 6) { const S = b.services; server(120, 200, 'user-service', { lamp: ACC });
      pill(120, 110, 'POST /busrefresh', ACC, pop(u, 0.1), { mono: true, fs: 14, fill: PANEL });
      card(400, 200, 150, 54, { rx: 27, fill: INK, stroke: 'none', text: 'Cloud Bus', fs: 15, color: PANEL, s: pop(u, 0.3) });
      grow(180, 200, 322, 200, E(u, 0.4, 0.8), ACC);
      for (let i = 0; i < S; i++) { const y = 40 + i * 36, a = 0.9 + i * 0.05, on = u > a + 0.6;
        dot([[476, 200], [700, y]], seg(u, a, a + 0.6), ACC, 5);
        card(760, y, 120, 28, { rx: 6, stroke: on ? ACC : GRID, fill: on ? ACCBG : PANEL, text: `서비스 ${i + 1}`, fs: 13.5, color: on ? ACC : MUT }); }
      mono(400, 300, `호출 1번 → ${S}개 갱신`, { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    zone(30, 40, 560, 340, 'ApplicationContext (user-service)', { fill: SOFT });
    bean(150, 120, 'DataSource', null, { col: MUT }); bean(150, 300, 'UserRepository', null, { col: MUT });
    const fx = 420, fy = 210, newOn = k === 5 && u > 1.0, val = (k >= 5 && newOn) ? 'newLogin = true' : k >= 1 ? 'newLogin = false' : null;
    if (k === 5) bean(fx, fy, 'FeatureController', 'newLogin = false', { op: 1 - E(u, 0.3, 1.0), s: 1 - 0.3 * E(u, 0.3, 1.0), col: OFF });
    bean(fx, fy, 'FeatureController', val, { s: k === 5 ? pop(u, 1.0) : 1, col: ACC, vcol: newOn ? GOOD : INK });
    el('rect', { x: fx - 122, y: fy - 54, width: 244, height: 108, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: k === 0 ? fade(u, 0.5) : 1 });
    mono(fx, fy - 64, '@RefreshScope', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 0.7) : 1 });
    if (k === 0) { sub(310, 360, 'refresh 신호가 오면 이 빈만 다시 만든다', fade(u, 1.4), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 1) { fly(820, 120, fx + 40, fy + 18, seg(u, 0.3, 1.2), 'feature.new-login', { mono: true });
      mono(660, 300, '${feature.new-login:false}', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) });
      sub(760, 330, '키가 없으면 기본값 false', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    const resp = (x, y, s, col, a) => { pill(x, y, s, col, pop(u, a), { mono: true, fs: 14, fill: PANEL }); };
    if (k === 2) { fly(880, 120, fx + 110, fy - 20, seg(u, 0.2, 1.0), 'GET /login-mode', { mono: true, fill: INFO });
      resp(780, 260, '"legacy-login"', WARN, 1.3); return; }
    if (k === 3) { ['health', 'refresh', 'busrefresh'].forEach((e, i) => { const y = 110 + i * 70, open = u > 0.6 + i * 0.4;
        lock(650, y, !open, open ? ACC : MUT, 1.1); mono(680, y + 6, '/actuator/' + e, { 'font-size': 15, 'font-weight': 700, fill: open ? ACC : MUT }); });
      sub(760, 350, 'exposure에 없으면 404', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    if (k === 4) { gitLine(640, 90, 220, 4, 1, INK, null); el('circle', { cx: 860, cy: 90, r: 9, fill: ACC, opacity: fade(u, 0.3) });
      mono(640, 130, 'new-login: false → true', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      terminal(610, 170, 330, 120, ['$ curl -X POST …/actuator/refresh', ['["feature.new-login"]', '#86efac']], k === 4 ? 0.5 + 1.5 * E(u, 0.9, 2.0) : 2, { title: 'bash', fs: 13.5 });
      sub(310, 360, '빈은 아직 옛 값이다. 다음 호출 때 새로 만든다', fade(u, 2.2), { 'font-size': 14.5, fill: INK }); return; }
    // k5
    fly(880, 120, fx + 110, fy - 20, seg(u, 1.4, 2.0), 'GET /login-mode', { mono: true, fill: INFO });
    resp(780, 270, '"new-login"', GOOD, 2.2);
    mono(780, 330, '재배포 0회', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.4) }); }

  const quiz = [
    { q: '서비스 10개·환경 3개에 설정 파일을 레포마다 따로 두면, prod DB 비번 하나를 바꿀 때 생기는 일은 무엇인가?',
      o: ['git push 한 번이면 모두 바뀐다', '10개 서비스를 각각 고쳐 다시 배포해야 한다', 'prod 레포 하나만 고치면 된다'], a: 1,
      why: '사본이 30개로 퍼져 있어 값 하나의 변경이 서비스 수만큼의 재배포가 된다.' },
    { q: 'Config Server에 GET /user-service/prod를 보내면 기본 config-repo에서는 어떤 응답이 오는가?',
      o: ['user-service-prod.yml 한 파일만', 'application.yml, user-service.yml, user-service-prod.yml을 병합한 JSON', '레포의 모든 yml 파일'], a: 1,
      why: '전역 공통, 앱 공통, 앱+환경 파일을 골라 우선순위대로 묶어 돌려준다. 클라이언트는 병합 규칙을 몰라도 된다.' },
    { q: '같은 키가 user-service.yml과 application-prod.yml에 모두 있다. prod로 뜬 user-service는 어느 값을 쓰는가?',
      o: ['application-prod.yml의 값', 'user-service.yml의 값', '먼저 읽은 파일의 값'], a: 0,
      why: '프로파일 파일은 앱 기본 파일보다 앞선다. 순서는 user-service-prod, application-prod, user-service, application이다.' },
    { q: 'config-repo에 {cipher}로 시작하는 비번을 커밋하면 클라이언트는 무엇을 받는가?',
      o: ['암호문을 받아 스스로 복호화한다', 'Config Server가 풀어 준 평문을 받는다', '값을 받지 못해 부팅이 멈춘다'], a: 1,
      why: '키는 Config Server만 갖고 배급할 때 복호화한다. git에는 암호문만 남는다.' },
    { q: 'git에 new-login을 true로 push한 뒤 POST /actuator/refresh를 부르면 FeatureController는 어떻게 되는가?',
      o: ['다음 호출 때 @RefreshScope 빈이 새로 만들어져 new-login을 돌려준다', '서비스가 자동으로 재기동된다', '모든 빈이 즉시 다시 만들어진다'], a: 0,
      why: 'refresh는 바뀐 키 목록 ["feature.new-login"]을 돌려주고, @RefreshScope 빈만 다음 접근 때 새 값으로 만든다.' },
  ];

  const summary = [
    '설정을 서비스 레포마다 두면 10개 서비스 3환경에 사본 30개가 생기고 비번이 평문으로 남는다.',
    'Config Server는 git 레포를 backend로 삼아 /{application}/{profile}로 병합한 설정을 내려준다.',
    '겹치는 키는 앱+프로파일, 전역+프로파일, 앱 공통, 전역 공통 순으로 이긴다.',
    '{cipher}로 비번을 감추고, @RefreshScope와 /actuator/refresh로 재배포 없이 값을 바꾼다.',
  ];
  const review = [
    { q: 'prod에서 user-service.yml의 timeout을 고쳤는데 값이 바뀌지 않았다. 먼저 의심할 것은?',
      o: ['application-prod.yml에 같은 키가 있어 그쪽이 이긴다', 'Config Server 포트가 8888이 아니다', '{cipher} 접두어가 빠졌다'], a: 0,
      why: '프로파일 파일이 앱 기본 파일보다 앞선다. 같은 키가 application-prod.yml에 있으면 user-service.yml 값은 가려진다.' },
    { q: 'Config Server가 잠깐 죽은 사이 배포한 서비스가 기본값으로 떠서 잘못된 DB에 붙었다. 막으려면?',
      o: ['spring.config.import에 optional:을 붙인다', 'fail-fast와 retry를 켜서 설정을 못 받으면 부팅을 멈춘다', '@RefreshScope를 모든 빈에 붙인다'], a: 1,
      why: '설정 없이 반쯤 뜬 서비스가 가장 위험하다. fail-fast는 못 받으면 멈추고, retry는 그 전에 몇 번 더 묻는다.' },
    { q: '기능 플래그를 git에서 바꾸고 refresh를 불렀는데, 플래그를 쓰는 빈 하나만 옛 값을 계속 쓴다. 이유로 알맞은 것은?',
      o: ['git push가 실패했다', '그 빈에 @RefreshScope가 없어서 @Value 필드가 다시 주입되지 않았다', 'refresh가 Config Server를 재시작했다'], a: 1,
      why: 'refresh는 @RefreshScope 빈만 다시 만든다. 일반 빈의 @Value 필드는 처음 주입된 값을 그대로 쥐고 있다.' },
  ];

  R.page({ title: '설정 배급 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
