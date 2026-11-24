/* I-1-4 2024 릴리스 트레인 · BOM · 모듈 구성 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 모듈 버전(config·gateway·netflix·openfeign 4.2.0, circuitbreaker 3.2.0)은 spring-cloud-dependencies 2024.0.0 BOM 에서 확인한 값.
 * 호환 짝은 Spring Cloud 지원 버전 표(2024.0 ↔ Boot 3.4.x, 2023.0 ↔ 3.2.x/3.3.x)를 따른다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, cells, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 1. 릴리스 트레인과 Boot 라인의 짝 ----------
  const PAIR = [['2.6.x / 2.7.x', '2021.0.x'], ['3.0.x / 3.1.x', '2022.0.x'], ['3.2.x / 3.3.x', '2023.0.x'], ['3.4.x', '2024.0.x']];
  const RY = (i) => 74 + i * 52, BX = 190, CX = 600;
  const WAG = [['config', '4.2.0'], ['gateway', '4.2.0'], ['netflix', '4.2.0'], ['openfeign', '4.2.0'], ['circuitbr.', '3.2.0']];
  function train(x, y, op) { card(x, y, 170, 50, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, op });
    mono(x, y - 3, '2024.0.0', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: op }); tx(x, y + 16, 'Moorgate', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op });
    WAG.forEach(([n, v], i) => { const wx = x + 125 + i * 72; el('line', { x1: wx - 46, y1: y, x2: wx - 30, y2: y, stroke: ACC, 'stroke-width': 3, opacity: op });
      card(wx, y, 62, 40, { rx: 6, text: v, mono: true, fs: 13.5, stroke: ACC, op }); tx(wx, y + 38, n, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op }); }); }
  function s1(t, c) { const { k, u } = c;
    tx(BX, 40, 'Spring Boot 라인', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(CX, 40, 'Spring Cloud 트레인', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT });
    PAIR.forEach(([b, cl], i) => { const me = i === 3, old = i === 0 && k >= 3;
      card(BX, RY(i), 180, 40, { rx: 8, text: b, mono: true, fs: 14, stroke: me ? INK : GRID, color: old ? OFF : me ? INK : MUT, sw: me ? 2.5 : 1.5 });
      if (k >= 2) card(CX, RY(i), 180, 40, { rx: 8, text: cl, mono: true, fs: 14, stroke: me ? ACC : GRID, color: old ? OFF : me ? ACC : MUT, fill: me ? ACCBG : PANEL, sw: me ? 2.5 : 1.5, op: k === 2 ? fade(u, 0.2 + (3 - i) * 0.15) : 1 }); });
    // 0) Boot 3.4.1 을 못박는다
    pill(BX - 150, RY(3), '3.4.1', INK, k === 0 ? pop(u, 0.4) : 1, { mono: true, fs: 14, fill: C.HL });
    if (k === 0) pill(BX, RY(3) + 50, "dependency-management 1.1.7", MUT, pop(u, 1.2), { mono: true, fs: 13.5, fill: PANEL });
    // 1) Java 17 문
    if (k === 1) { const gx = 480, gy = 345; el('rect', { x: gx - 8, y: gy - 40, width: 16, height: 80, rx: 4, fill: INK });
      tx(gx, gy + 60, 'Boot 3.x 입장 조건 · Java 17', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INK, opacity: fade(u, 0.3) });
      [['JDK 8', 0.3, false], ['JDK 11', 0.8, false], ['JDK 17', 1.3, true]].forEach(([s, a, ok], i) => { const p = seg(u, a, a + 0.7), y = gy - 24 + i * 24;
        const x = ok ? lerp(160, 720, p) : p < 0.6 ? lerp(160, gx - 50, p / 0.6) : lerp(gx - 50, gx - 110, (p - 0.6) / 0.4);
        if (p > 0) pill(x, y, s, ok ? GOOD : BAD, 1, { mono: true, fs: 13.5, fill: PANEL });
        if (p >= 1) (ok ? check : cross)(ok ? 790 : gx - 170, y, 8, 1); }); }
    // 2) 트레인이 들어온다
    if (k >= 2) { const x = k === 2 ? lerp(420, 150, E(u, 0.4, 1.6)) : 150; if (k < 4) train(x, 345, k === 2 ? fade(u, 0.3) : 1);
      if (k === 2) sub(480, 412, '모듈 수십 개를 한 묶음으로 배포한다', fade(u, 1.8), { 'font-weight': 700, fill: ACC }); }
    // 3) 짝 맞추기
    if (k >= 3) PAIR.forEach((_, i) => { const me = i === 3, g = k === 3 ? E(u, 0.2 + i * 0.25, 0.6 + i * 0.25) : 1, bad = k === 4 && i === 2;
      if (k === 4 && me) return; grow(BX + 90, RY(i), lerp(BX + 90, CX - 90, g), RY(i), 1, me ? ACC : GRID, { plain: true, sw: me ? 3.5 : 2 }); });
    if (k === 3) { check(CX + 115, RY(3), 9, pop(u, 1.4)); sub(CX + 160, RY(0) + 5, 'Boot 2.x 전용', fade(u, 1.6), { fill: MUT, 'font-weight': 700 }); }
    // 4) 짝을 어기면
    if (k === 4) { grow(BX + 90, RY(3), CX - 90, RY(2), E(u, 0.2, 0.7), BAD, { sw: 3 });
      const st = [['컴파일', '통과', GOOD], ['기동', '호환성 검사 실패', BAD], ['검사를 끄면', 'NoSuchMethodError', BAD]];
      st.forEach(([a, b, col], i) => { const x = 170 + i * 300, s = pop(u, 0.9 + i * 0.45);
        card(x, 345, 250, 64, { rx: 10, stroke: col, sw: 2.2, fill: col === BAD ? BADBG : PANEL, s });
        tx(x, 337, a, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0 + i * 0.45) });
        mono(x, 360, b, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.45) });
        if (i < 2) grow(x + 128, 345, x + 170, 345, E(u, 1.2 + i * 0.45, 1.4 + i * 0.45), MUT); }); } }

  // ---------- 2. BOM = 버전 규칙 목록 ----------
  const SHEET = [['spring-cloud-config', '4.2.0'], ['spring-cloud-gateway', '4.2.0'], ['spring-cloud-netflix', '4.2.0'], ['spring-cloud-openfeign', '4.2.0'], ['spring-cloud-circuitbreaker', '3.2.0']];
  const SX0 = 600, SY0 = 40;
  const sheetRow = (i) => SY0 + 58 + i * 34;
  function sheet(op, hot, dim) { el('rect', { x: SX0, y: SY0, width: 330, height: 236, rx: 10, fill: PANEL, stroke: dim ? GRID : ACC, 'stroke-width': 2.2, opacity: op });
    mono(SX0 + 16, SY0 + 26, 'spring-cloud-dependencies 2024.0.0', { 'font-size': 13.5, 'font-weight': 800, fill: dim ? OFF : ACC, opacity: op });
    SHEET.forEach(([n, v], i) => { const y = sheetRow(i), h = hot && hot(i);
      if (h) el('rect', { x: SX0 + 8, y: y - 17, width: 314, height: 26, rx: 5, fill: ACCBG, opacity: op });
      mono(SX0 + 16, y, n, { 'font-size': 13.5, fill: dim ? OFF : INK, opacity: op }); mono(SX0 + 314, y, v, { 'font-size': 13.5, 'font-weight': 800, fill: dim ? OFF : ACC, 'text-anchor': 'end', opacity: op }); }); }
  const DEP = [['spring-cloud-starter-config', 0], ['spring-cloud-starter-gateway', 1], ['spring-cloud-starter-netflix-eureka-client', 2], ['spring-boot-starter-actuator', -1]];
  const DY = (i) => 168 + i * 50;
  function s2(t, c) { const { k, u } = c;
    // 0) dependencyManagement 로 목록만 들인다
    const sIn = k === 0 ? E(u, 0.3, 1.2) : 1;
    if (k < 4) sheet(sIn, (i) => (k === 2 && seg(u, 0.6 + Math.min(i, 2) * 0.45, 1.3 + Math.min(i, 2) * 0.45) > 0 && i < 3));
    else sheet(1, null, true);
    if (k === 0) { card(260, 120, 360, 60, { rx: 10, stroke: INK, text: 'dependencyManagement { imports { … } }', mono: true, fs: 13.5, s: pop(u, 0.2) });
      grow(440, 120, 596, 120, E(u, 0.8, 1.2), ACC);
      mono(260, 220, '받은 jar 0개', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: INK, opacity: fade(u, 1.6) });
      sub(260, 248, '버전 규칙만 들어왔다', fade(u, 1.8), { 'font-weight': 700, fill: MUT }); }
    if (k === 1) { pill(300, 90, 'org.springframework.cloud', MUT, pop(u, 0.2), { mono: true, fs: 13.5, fill: PANEL });
      pill(300, 132, 'spring-cloud-dependencies', ACC, pop(u, 0.5), { mono: true, fs: 13.5, fill: PANEL });
      pill(300, 174, '${springCloudVersion} = 2024.0.0', ACC, pop(u, 0.8), { mono: true, fs: 13.5, fill: ACCBG });
      tx(40, 260, 'Maven 에서는', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4) });
      pill(220, 296, '<type>pom</type>', WARN, pop(u, 1.6), { mono: true, fs: 13.5, fill: PANEL }); pill(420, 296, '<scope>import</scope>', WARN, pop(u, 1.9), { mono: true, fs: 13.5, fill: PANEL }); }
    // 2·3) 버전 없이 선언 → 빈칸을 채운다
    if (k >= 2) { const n = k === 2 ? 3 : 4; tx(30, 140, 'dependencies (버전 없이)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      DEP.slice(0, n).forEach(([name, si], i) => { const y = DY(i), fresh = (k === 2 && i < 3) || (k === 3 && i === 3);
        const a = fresh ? (k === 2 ? 0.3 + i * 0.45 : 0.3) : 0, op = fresh ? fade(u, a) : 1;
        mono(30, y + 5, name, { 'font-size': 13.5, fill: k === 4 ? OFF : INK, opacity: op });
        const filled = !fresh || u > a + 1.0;
        const ver = si >= 0 ? SHEET[si][1] : '3.4.1';
        if (k < 4) { card(500, y, 80, 32, { rx: 6, text: filled ? ver : '?', mono: true, fs: 14, stroke: si >= 0 ? ACC : INK, color: filled ? (si >= 0 ? ACC : INK) : OFF, fill: filled ? (si >= 0 ? ACCBG : SOFT) : PANEL, op });
          if (fresh && si >= 0) dot([[SX0 + 8, sheetRow(si) - 5], [541, y]], seg(u, a + 0.5, a + 1.0), ACC, 5); } }); }
    if (k === 3) { card(760, 340, 230, 56, { rx: 10, text: 'Boot plugin 3.4.1\nBoot 모듈 버전 담당', fs: 14, stroke: INK, s: pop(u, 0.2) });
      dot([[645, 340], [541, DY(3)]], seg(u, 0.6, 1.2), INK, 5); sub(300, 400, 'Cloud 모듈은 BOM, Boot 모듈은 plugin이 맡는다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }
    // 4) BOM 이 없다면 (예시 버전)
    if (k === 4) { const hand = [['4.2.0', ACC], ['4.1.x', BAD], ['4.2.0', ACC]];
      hand.forEach(([v, col], i) => { const y = DY(i); card(500, y, 80, 32, { rx: 6, text: v, mono: true, fs: 14, stroke: col, color: col, fill: col === BAD ? BADBG : PANEL, s: pop(u, 0.3 + i * 0.3) }); });
      el('line', { x1: SX0, y1: SY0, x2: SX0 + 330, y2: SY0 + 236, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 0.2) });
      tx(560, 150, '손으로 적은 버전 (예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.5) });
      lbl(450, DY(1) + 8, '!', fade(u, 1.4), { 'font-size': 24, fill: BAD });
      sub(300, 360, '하나만 어긋나도 런타임 충돌', fade(u, 1.6), { 'font-weight': 700, fill: BAD, 'font-size': 15 }); } }

  // ---------- 3. starter 로 조립 ----------
  const ST = [['spring-cloud-starter-config', '설정 받아오기'], ['spring-cloud-starter-netflix-eureka-client', '등록 + 조회'], ['spring-cloud-starter-gateway', '라우팅 · 필터'], ['spring-cloud-starter-circuitbreaker-resilience4j', '장애 전파 차단']];
  const BY = (i) => 84 + i * 76;
  function s3(t, c) { const { k, u } = c;
    el('rect', { x: 24, y: 36, width: 430, height: 330, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    tx(40, 60, 'my-service (build.gradle)', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    ST.forEach(([n, w], i) => { if (i > k && k < 4) { el('rect', { x: 40, y: BY(i) - 6, width: 398, height: 60, rx: 8, fill: 'none', stroke: GRID, 'stroke-dasharray': '5 5' }); return; }
      const now = i === k, x = now ? lerp(-200, 239, E(u, 0.1, 0.8)) : 239;
      card(x, BY(i) + 24, 398, 60, { rx: 8, stroke: now ? ACC : INK, fill: now ? ACCBG : PANEL, sw: now ? 2.5 : 1.8 });
      if (!now || u > 0.8) { mono(x - 186, BY(i) + 18, n.length > 44 ? n.slice(0, 43) + '…' : n, { 'font-size': 13.5, 'font-weight': 700, fill: now ? ACC : INK });
        tx(x - 186, BY(i) + 41, '라이브러리 + 자동설정 · ' + w, { 'font-size': 13.5, fill: MUT }); } });
    const RX = 700;
    if (k === 0) { card(RX, 120, 180, 50, { rx: 9, text: 'Config Server', fs: 15, stroke: ACC, s: pop(u, 0.9) });
      dot([[RX, 146], [RX, 200], [440, 110]], seg(u, 1.3, 2.2), ACC, 6); sub(RX, 220, '기동할 때 설정을 받아 온다', fade(u, 1.6), { 'font-weight': 700, fill: ACC }); }
    if (k === 1) { R.kvTable(600, 80, 240, [['ORDER', '10.0.1.7'], ['USER', '10.0.2.3']], { title: 'Eureka (예시)', kw: 110, rh: 30 });
      fly(460, BY(1) + 10, 556, 120, seg(u, 0.9, 1.6), '등록', { fill: ACC }); fly(556, 150, 460, BY(1) + 40, seg(u, 1.6, 2.3), '조회', { fill: INK });
      sub(720, 230, '한 starter에 등록과 조회가 같이 있다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }
    if (k === 2) { [-30, -10, 10, 30].forEach((d, i) => grow(560, 140 + d, 650, 140, E(u, 0.8 + i * 0.1, 1.2 + i * 0.1), MUT, { plain: true }));
      card(680, 140, 60, 70, { rx: 8, stroke: ACC, fill: ACCBG, s: pop(u, 0.9) }); grow(712, 140, 800, 140, E(u, 1.3, 1.6), ACC);
      pill(680, 205, 'WebFlux 기반', ACC, pop(u, 1.4), { fs: 13.5, fill: PANEL });
      card(700, 290, 300, 50, { rx: 9, text: 'spring-boot-starter-web (MVC)', mono: true, fs: 13.5, stroke: BAD, color: BAD, s: pop(u, 1.8) }); cross(870, 290, 10, pop(u, 2.1));
      sub(700, 336, '같이 넣으면 기동이 막힌다', fade(u, 2.2), { 'font-weight': 700, fill: BAD }); }
    if (k === 3) { const py = 160; card(570, py, 110, 44, { rx: 9, text: 'order', mono: true, fs: 14, s: pop(u, 0.9) }); card(860, py, 120, 44, { rx: 9, text: 'payment ✕', mono: true, fs: 14, stroke: BAD, color: BAD, s: pop(u, 0.9) });
      const o = E(u, 1.4, 1.9), ang = -35 * o * Math.PI / 180;
      el('line', { x1: 625, y1: py, x2: 680, y2: py, stroke: MUT, 'stroke-width': 2 }); el('circle', { cx: 680, cy: py, r: 5, fill: INK }); el('circle', { cx: 750, cy: py, r: 5, fill: INK });
      el('line', { x1: 680, y1: py, x2: 680 + 70 * Math.cos(ang), y2: py + 70 * Math.sin(ang), stroke: o > 0.5 ? BAD : INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
      el('line', { x1: 750, y1: py, x2: 800, y2: py, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      sub(715, 230, '장애가 위로 번지기 전에 끊는다', fade(u, 2.0), { 'font-weight': 700, fill: BAD }); }
    if (k === 4) { terminal(470, 46, 470, 230, ['$ ./gradlew dependencies', '+--- …starter-config -> 4.2.0', '+--- …starter-netflix-eureka-client -> 4.2.0', '+--- …starter-gateway -> 4.2.0', '+--- …starter-circuitbreaker-resilience4j -> 3.2.0', '\\--- …spring-boot-starter-actuator -> 3.4.1'], lerp(0, 6, E(u, 0.2, 2.0)), { fs: 13.5, lh: 30 });
      sub(705, 300, '예시 출력 (실행하지 않음) · 버전은 BOM 2024.0.0과 Boot 3.4.1 기준', fade(u, 2.1), { fill: MUT, 'font-weight': 700 });
      mono(239, 395, '적은 버전 문자열 0개', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); } }

  // ---------- 4. Java 17 · javax → jakarta ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const gx = 480, gy = 200;
      card(gx, gy - 120, 300, 46, { rx: 9, text: 'toolchain languageVersion 17', mono: true, fs: 14, stroke: INK, s: pop(u, 0.2) });
      el('rect', { x: gx - 8, y: gy - 70, width: 16, height: 150, rx: 4, fill: INK, opacity: fade(u, 0.3) });
      [['JDK 8', 0.4, false], ['JDK 11', 0.9, false], ['JDK 17', 1.4, true]].forEach(([s, a, ok], i) => { const p = seg(u, a, a + 0.8), y = gy - 40 + i * 44;
        const x = ok ? lerp(120, 800, p) : p < 0.6 ? lerp(120, gx - 50, p / 0.6) : lerp(gx - 50, gx - 120, (p - 0.6) / 0.4);
        if (p > 0) pill(x, y, s, ok ? GOOD : BAD, 1, { mono: true, fs: 14, fill: PANEL }); if (p >= 1) (ok ? check : cross)(ok ? 870 : gx - 190, y, 9, 1); });
      sub(gx, 340, '17 미만 JDK로는 빌드 자체가 거부된다', fade(u, 2.2), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    if (k === 1) { [['spring-boot-starter-validation', 'jakarta.validation'], ['spring-boot-starter-data-jpa', 'jakarta.persistence']].forEach(([s, p], i) => { const y = 110 + i * 120;
        card(250, y, 360, 54, { rx: 10, text: s, mono: true, fs: 14, s: pop(u, 0.2 + i * 0.4) }); grow(432, y, 560, y, E(u, 0.8 + i * 0.4, 1.2 + i * 0.4), ACC);
        pill(700, y, p + '.*', ACC, pop(u, 1.2 + i * 0.4), { mono: true, fs: 14, fill: ACCBG }); });
      sub(480, 350, 'Boot starter는 이미 jakarta로 갈아탔다. 문제는 직접 넣은 의존성이다', fade(u, 2.0), { 'font-weight': 700, fill: INK, 'font-size': 14.5 }); return; }
    if (k === 2) { card(200, 170, 300, 150, { rx: 10, stroke: INK, s: pop(u, 0.2) });
      if (u > 0.4) { mono(70, 130, 'class OrderRequest {', { 'font-size': 14 }); mono(90, 165, '@NotNull', { 'font-size': 14, 'font-weight': 800, fill: WARN }); mono(90, 188, '(javax.validation)', { 'font-size': 13.5, fill: WARN }); mono(90, 215, 'String id;', { 'font-size': 14 }); }
      card(720, 170, 230, 70, { rx: 10, text: '검증기 (jakarta)\nHibernate Validator', fs: 14, stroke: ACC, fill: ACCBG, s: pop(u, 0.6) });
      fly(360, 170, 545, 170, seg(u, 1.0, 1.8), 'id = null', { mono: true, fill: INK, stay: true });
      if (u > 1.8) { dot([[560, 190], [700, 300]], seg(u, 1.8, 2.3), BAD, 6); }
      pill(720, 320, '통과 · 예외 없음', BAD, pop(u, 2.2), { fs: 14, fill: BADBG });
      sub(480, 392, 'javax 애너테이션은 jakarta 검증기 눈에 보이지 않는다', fade(u, 2.3), { 'font-weight': 700, fill: BAD, 'font-size': 14.5 }); return; }
    // 3) import 의 앞 이름만 바뀐다
    ['persistence.Entity', 'servlet.Filter', 'validation.Valid'].forEach((rest, i) => { const y = 120 + i * 80, a = 0.3 + i * 0.4, m = E(u, a, a + 0.7);
      mono(150, y, 'import', { 'font-size': 17, fill: INFO, 'font-weight': 700 });
      const px = 230; mono(px, y - 14 * m, 'javax', { 'font-size': 17, fill: BAD, 'font-weight': 700, opacity: clamp(1 - 2 * m) });
      mono(px, y + 14 * (1 - m), 'jakarta', { 'font-size': 17, fill: ACC, 'font-weight': 700, opacity: clamp(2 * m - 1) });
      mono(px + lerp(52, 73, m), y, '.' + rest + ';', { 'font-size': 17 }); });
    sub(480, 370, '클래스와 메서드는 그대로, 패키지 앞 이름만 바뀐다', fade(u, 1.9), { 'font-weight': 700, fill: INK, 'font-size': 15 }); }

  // ---------- 5. 순서대로 쌓은 build.gradle ----------
  const PROC = ['Boot 확정', '매트릭스로 Cloud 선택', 'BOM import', 'starter 추가', 'Java 17 · jakarta 확인'];
  const FILE = [['plugins { boot 3.4.1 }', 0], ['java { toolchain 17 }', 4], ["ext { springCloudVersion '2024.0.0' }", 1], ['dependencyManagement { mavenBom … }', 2], ['dependencies { starter × 5 }', 3]];
  function s5(t, c) { const { k, u } = c;
    tx(150, 40, '하는 순서', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(680, 40, 'build.gradle 안의 자리', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT });
    PROC.forEach((p, i) => { const fi = FILE.findIndex((f) => f[1] === i), on = fi <= k;
      card(150, 80 + i * 64, 220, 46, { rx: 9, text: (i + 1) + '. ' + p, fs: 14, stroke: on ? ACC : GRID, color: on ? INK : OFF, fill: fi === k ? ACCBG : PANEL, sw: fi === k ? 2.5 : 1.5 }); });
    FILE.forEach(([f, pi], i) => { const on = i <= k, now = i === k, y = 80 + i * 64;
      card(680, y, 400, 46, { rx: 6, stroke: on ? INK : GRID, fill: now ? ACCBG : SOFT, sw: now ? 2.5 : 1.5, op: on ? 1 : 0.5 });
      mono(490, y + 5, on ? f : '', { 'font-size': 13.5, fill: now ? ACC : INK, 'font-weight': now ? 700 : 400 });
      if (on) { const g = now ? E(u, 0.3, 1.1) : 1, y1 = 80 + pi * 64; grow(262, y1, lerp(262, 478, g), lerp(y1, y, g), 1, now ? ACC : GRID, { plain: g < 1 || !now, sw: now ? 2.4 : 1.4 }); } });
    if (k === 1) sub(480, 412, '순서는 마지막이어도 파일에서는 위쪽에 적는다', fade(u, 1.4), { 'font-weight': 700, fill: INK });
    if (k === 2) sub(480, 412, '최신이 아니라 Boot 라인의 짝을 고른다', fade(u, 1.4), { 'font-weight': 700, fill: INK });
    if (k === 4) pill(480, 398, '개별 모듈 버전을 한 번도 적지 않았다 · 충돌 0', GOOD, pop(u, 1.4), { fs: 14, fill: PANEL }); }

  const quiz = [
    { q: 'Spring Boot 3.4.1 프로젝트에 맞는 Spring Cloud 릴리스 트레인은 무엇인가?',
      o: ['2023.0.x', '2024.0.x', '2021.0.x'], a: 1,
      why: '2024.0.x(Moorgate)는 Boot 3.4.x의 짝이다. 2023.0.x는 3.2.x/3.3.x, 2021.0.x는 Boot 2.x 전용이다.' },
    { q: 'dependencyManagement로 spring-cloud-dependencies BOM을 import한 직후 받아지는 jar는 몇 개인가?',
      o: ['0개, 버전 규칙만 들어온다', 'BOM에 적힌 모듈 전부', 'spring-cloud-starter-config 하나'], a: 0,
      why: 'BOM은 의존성이 아니라 버전 목록이다. 실제 jar는 dependencies에 버전 없이 선언할 때 받아지고, 그 버전을 BOM이 채운다.' },
    { q: 'API 게이트웨이를 만들려고 spring-cloud-starter-gateway를 넣을 때 피해야 할 조합은 무엇인가?',
      o: ['spring-boot-starter-actuator와 함께 넣기', 'eureka-client와 함께 넣기', 'spring-boot-starter-web(MVC)과 함께 넣기'], a: 2,
      why: 'gateway starter는 WebFlux 기반이다. MVC starter와 같이 넣으면 기동이 막힌다.' },
    { q: 'Boot 3.x로 올린 뒤 javax.validation:validation-api를 그대로 두면 어떻게 되나?',
      o: ['컴파일 오류로 바로 알려 준다', '컴파일은 되지만 검증이 조용히 동작하지 않는다', '자동으로 jakarta로 바뀐다'], a: 1,
      why: 'jakarta 검증기는 javax 애너테이션을 보지 못한다. 예외도 없이 실패하므로 서드파티의 javax 의존을 먼저 찾아야 한다.' },
    { q: '충돌 없는 스택을 만드는 순서에서 맨 처음 하는 일은 무엇인가?',
      o: ['Spring Boot 버전을 확정한다', '가장 최신 Spring Cloud 트레인을 고른다', '필요한 starter를 모두 적는다'], a: 0,
      why: 'Cloud 트레인은 Boot 라인에 맞춰 고른다. Boot 확정, 매트릭스 대조, BOM import, starter 추가, Java 17·jakarta 확인 순서다.' },
  ];

  const summary = [
    'Spring Cloud는 모듈을 릴리스 트레인으로 묶어 내고, 트레인마다 맞는 Boot 라인이 정해져 있다.',
    '2024.0.x는 Boot 3.4.x의 짝이다. 짝을 어기면 컴파일은 되고 기동에서 막힌다.',
    'BOM을 import하면 starter를 버전 없이 적어도 config 4.2.0처럼 맞는 버전이 채워진다.',
    'Boot 3.x는 Java 17과 jakarta 패키지가 전제이고, javax 라이브러리가 섞이면 조용히 깨진다.',
  ];
  const review = [
    { q: 'starter-gateway에만 4.1.x 버전을 손으로 적었더니 기동 중 NoSuchMethodError가 났다. 먼저 할 일은?',
      o: ['다른 starter에도 버전을 모두 손으로 맞춘다', '버전 문자열을 지우고 BOM이 채우게 둔다', 'Java를 21로 올린다'], a: 1,
      why: '버전을 적는 순간 BOM 규칙을 덮어쓴다. 지우면 BOM 2024.0.0이 4.2.0으로 맞춘다.' },
    { q: 'Boot 3.3.2를 쓰면서 springCloudVersion을 2024.0.0으로 적었다. 기동 때 가장 먼저 보게 될 것은?',
      o: ['Spring Cloud 호환성 검사 실패 메시지', '컴파일 오류', '아무 문제 없이 기동'], a: 0,
      why: '2024.0.x는 Boot 3.4.x용이다. 컴파일은 지나가고, 기동할 때 호환성 검사기가 Boot 버전이 맞지 않는다고 막는다.' },
    { q: 'Boot 2.7에서 3.4로 올리는 중이다. import만 고쳤는데 입력 검증이 사라졌다. 먼저 의심할 것은?',
      o: ['BOM 버전', 'Eureka 주소', '서드파티가 끌어온 javax.validation 의존성'], a: 2,
      why: 'Boot starter는 이미 jakarta다. 직접 넣은 javax 기반 라이브러리가 남아 있으면 예외 없이 검증이 빠진다.' },
  ];

  R.page({ title: 'BOM 버전 정렬 · 호환 매트릭스', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
