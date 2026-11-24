/* I-1-2 왜 Spring Cloud 인가 — 장면 4개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 STEPS 의 services · standardized · dup 을 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 팀 × 관심사 표 ----------
  const COLS = ['Config', 'Discovery', 'Gateway', 'Resilience', 'Tracing'];
  const TEAMS = [
    { n: 'A팀 user', col: INFO, v: ['git clone', 'IP 하드코딩', null, 'try-catch', 'UUID 로그'] },
    { n: 'B팀 order', col: WARN, v: ['Consul 호출', 'Nginx 수동', null, 'Hystrix', 'X-Trace'] },
    { n: 'C팀 catalog', col: MUT, v: ['yml에 박기', 'k8s DNS', null, '없음', 'APM 일부'] },
    { n: 'D팀', col: OFF, v: ['각자', '각자', '각자', '각자', '각자'] },
    { n: 'E팀', col: OFF, v: ['각자', '각자', '각자', '각자', '각자'] },
  ];
  const X0 = 270, CW = 128, CG = 6, Y0 = 70, RH = 56;
  const cx = (q) => X0 + q * (CW + CG) + CW / 2, cy = (r) => Y0 + r * RH + RH / 2 - 4;
  function header(op) { COLS.forEach((h, q) => tx(cx(q), 50, h, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op ?? 1 })); }
  function rowLabel(r, op) { tx(X0 - 12, cy(r) + 5, TEAMS[r].n, { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: TEAMS[r].col === OFF ? MUT : TEAMS[r].col, opacity: op }); }
  // 칸 하나: 팀 색 테두리 + 그 팀의 해법
  function cell(r, q, s, o) { o = o || {}; const t = TEAMS[r], v = o.v !== undefined ? o.v : t.v[q] || '각자';
    if (s <= 0) return; const hole = v === '없음';
    card(cx(q), cy(r), CW, RH - 8, { rx: 7, text: v, fs: 13.5, fw: 600, stroke: hole ? BAD : t.col, color: hole ? BAD : INK, fill: hole ? BADBG : PANEL, dash: hole ? '5 4' : null, sw: 2, s: o.pop ? s : 1, op: o.pop ? 1 : s * (o.op ?? 1) }); }
  function counter(c, label, y) { const b = c.beat, p = c.prev || {}, v = c.k === 0 && !c.prev ? b.dup : tween(p.dup, b.dup, c.u);
    mono(120, y || 390, label + ' ' + Math.round(v) + '곳', { 'font-size': 22, 'font-weight': 800, fill: v >= 12 ? BAD : v > 5 ? WARN : ACC, 'text-anchor': 'middle' }); }

  // ---------- 1. 팀마다 다시 만든다 ----------
  function s1(t, c) { const { k, u } = c;
    header();
    const rows = k < 3 ? k + 1 : 5;
    for (let r = 0; r < rows; r++) { const fresh = r === k && k < 3, op = fresh ? fade(u, 0.1) : 1; rowLabel(r, op);
      COLS.forEach((_, q) => { const v = TEAMS[r].v[q];
        if (r < 3 && v == null && k < 3) { el('rect', { x: cx(q) - CW / 2, y: cy(r) - (RH - 8) / 2, width: CW, height: RH - 8, rx: 7, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4', opacity: op }); return; }
        const s = fresh ? pop(u, 0.3 + q * 0.3) : k === 3 && (r >= 3 || v == null) ? pop(u, 0.2 + (r >= 3 ? (r - 3) * 0.4 : 0) + q * 0.08) : 1;
        cell(r, q, s, { pop: true, v: v == null ? '각자' : undefined }); }); }
    // B팀: A팀과 해법이 하나도 같지 않다
    if (k === 1) { [0, 1, 3, 4].forEach((q, i) => lbl(cx(q), cy(0) + RH / 2 + 2, '≠', fade(u, 1.6 + i * 0.15), { 'font-size': 18, fill: BAD }));
      pill(cx(3), cy(1) + 34, '유지보수 종료', BAD, pop(u, 2.0), { fs: 13.5, fill: PANEL }); }
    if (k === 2) { sub(cx(3), cy(2) + 36, '장애 시 전체 대기', fade(u, 1.6), { fill: BAD, 'font-weight': 700 }); }
    if (k === 3) { const g = E(u, 1.2, 1.9), x = cx(4) + CW / 2 + 10;
      el('line', { x1: x, y1: cy(0), x2: x, y2: lerp(cy(0), cy(1), g), stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' });
      if (g >= 1) { cross(x, (cy(0) + cy(1)) / 2, 8, pop(u, 1.9)); } }
    counter(c, '중복 구현', 390);
    if (k === 3) sub(560, 384, '관심사 5 × 서비스 5 · 추적 헤더가 달라 경로를 못 잇는다', fade(u, 2.0), { 'font-weight': 700, fill: BAD }); }

  // ---------- 2. 칸을 표준 하나로 합친다 ----------
  const STD = [['Spring Cloud', 'Config'], ['Discovery', 'Eureka/Consul'], ['Spring Cloud', 'Gateway'], ['CircuitBreaker', 'Resilience4j'], ['Micrometer', 'Tracing']];
  const HOW = ['git 한 곳', '이름으로 호출', '진입점 하나', '실패 임계 → 차단', 'id 자동 전파'];
  function s2(t, c) { const { k, u } = c;
    header(); for (let r = 0; r < 5; r++) rowLabel(r, 1);
    COLS.forEach((_, q) => { const done = q < k, now = q === k, m = now ? E(u, 0.3, 1.2) : done ? 1 : 0;
      if (m < 1) for (let r = 0; r < 5; r++) { const v = TEAMS[r].v[q] || '각자';
        // 칸이 기둥 가운데로 모이며 사라진다
        if (m > 0) { const y = lerp(cy(r), cy(2), m); card(cx(q), y, CW, RH - 8, { rx: 7, stroke: TEAMS[r].col, op: 1 - m, sw: 2 }); }
        else cell(r, q, 1, { v }); }
      if (m > 0) { const s = now ? pop(u, 1.0) : 1, h = 5 * RH - 8, y = (cy(0) + cy(4)) / 2;
        card(cx(q), y, CW, h, { rx: 10, fill: ACCBG, stroke: ACC, sw: 2.5, s });
        if (s > 0.3) { tx(cx(q), y - 18, STD[q][0], { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: now ? fade(u, 1.2) : 1 });
          tx(cx(q), y + 4, STD[q][1], { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: now ? fade(u, 1.2) : 1 });
          tx(cx(q), y + 34, HOW[q], { 'text-anchor': 'middle', 'font-size': 13.5, fill: INK, opacity: now ? fade(u, 1.5) : 1 }); } } });
    // 추적: trace id 가 모든 서비스를 꿰뚫는다
    if (k === 4) { for (let r = 0; r < 5; r++) dot([[X0 - 8, cy(r)], [cx(4) + CW / 2 + 12, cy(r)]], seg(u, 1.6 + r * 0.12, 2.5 + r * 0.12), INFO, 5); }
    counter(c, '중복 구현', 390);
    mono(560, 390, '표준 ' + Math.round(tween(c.prev && c.prev.standardized, c.beat.standardized, u)) + ' / 5', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    if (k === 4) sub(800, 386, '문제 5 ↔ 표준 5, 고르지 않고 채택', fade(u, 2.0), { 'font-weight': 700, fill: ACC }); }

  // ---------- 3. starter 다섯 줄 ----------
  const DEPS = ['starter-config', 'starter-netflix-eureka-client', 'starter-gateway', 'starter-circuitbreaker-…-resilience4j', 'micrometer-tracing-bridge-otel'];
  const BEANS = ['ConfigData 로더', 'DiscoveryClient', 'RouteLocator', 'CircuitBreakerFactory', 'Tracer'];
  function s3(t, c) { const { k, u } = c, off = k === 4 ? E(u, 0.4, 1.4) : 0;
    tx(30, 40, 'build.gradle  dependencies', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    DEPS.forEach((d, i) => { const s = k === 0 ? clamp((u - 0.2 - i * 0.35) / 0.3) : 1, y = 72 + i * 38;
      if (s <= 0) return; const shown = d.slice(0, Math.round(d.length * s));
      el('rect', { x: 26, y: y - 16, width: 330, height: 28, rx: 6, fill: SOFT, opacity: 1 - off * 0.6 });
      mono(38, y + 3, shown, { 'font-size': 13.5, fill: off > 0.5 ? OFF : INK, 'text-decoration': off > 0.5 ? 'line-through' : null }); });
    if (k === 0) mono(190, 290, '의존성 5줄', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    // 애플리케이션 컨텍스트
    if (k >= 1) { const s = k === 1 ? pop(u, 0.1) : 1;
      card(570, 170, 300, 270, { rx: 12, stroke: off > 0.5 ? INK : ACC, sw: 2.5, fill: off > 0.5 ? PANEL : ACCBG, s });
      tx(570, 58, k >= 2 && off < 0.5 ? 'order-service' : 'ApplicationContext', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: off > 0.5 ? INK : ACC, opacity: clamp(s) });
      pill(570, 300, '@SpringBootApplication', INK, k === 1 ? pop(u, 0.4) : 1, { mono: true, fs: 13.5, fill: PANEL });
      BEANS.forEach((b, i) => { const y = 92 + i * 40, a = 0.6 + i * 0.3, g = k === 1 ? E(u, a, a + 0.4) : 1, op = 1 - off;
        if (k === 1) dot([[356, 72 + i * 38], [455, y]], seg(u, a - 0.3, a + 0.1), ACC, 5);
        if (g > 0 && op > 0.02) card(570, y, 240, 30, { rx: 6, text: b, mono: true, fs: 13.5, stroke: ACC, s: g, op }); });
      if (k === 1) { tx(570, 370, '@EnableXxx', { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', 'font-weight': 700, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 2.0) });
        sub(570, 394, 'auto-configuration이 빈을 등록한다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); } }
    // 설정 몇 줄
    const Y = ['name: order-service', 'config.import: optional:configserver:…', 'defaultZone: http://eureka:8761/eureka/'];
    if (k >= 2) { Y.forEach((s, i) => { if (i === 2 && k < 3) return; const op = (k === 2 || (k === 3 && i === 2)) ? fade(u, 0.2 + i * 0.3) : 1;
        mono(30, 316 + i * 30, s, { 'font-size': 13.5, fill: off > 0.5 ? OFF : i === 1 ? WARN : INK, opacity: op, 'text-decoration': off > 0.5 ? 'line-through' : null }); }); }
    if (k >= 2 && off < 0.99) { const o = 1 - off; card(845, 110, 160, 50, { rx: 9, text: 'Config Server\n:8888', fs: 13.5, dash: '6 4', stroke: MUT, op: o * (k === 2 ? fade(u, 0.6) : 1) });
      if (k === 2) { grow(720, 120, 762, 112, E(u, 0.9, 1.3), WARN, { dash: '5 4' }); check(845, 160, 9, pop(u, 1.8)); sub(845, 190, '서버가 없어도 앱은 뜬다', fade(u, 1.9), { fill: GOOD, 'font-weight': 700 }); } }
    if (k >= 3 && off < 0.99) { const o = 1 - off, s = k === 3 ? pop(u, 0.4) : 1;
      card(845, 265, 180, 86, { rx: 10, stroke: ACC, sw: 2, s, op: o }); tx(845, 240, 'Eureka :8761', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: o * clamp(s) });
      if (k === 3) fly(700, 250, 845, 276, seg(u, 0.9, 1.8), 'order-service', { mono: true, stay: true });
      else mono(845, 281, 'order-service', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, opacity: o });
      if (k === 3) sub(845, 334, '하드코딩 IP 목록이 하던 일', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }
    if (k === 4) { banner(570, 232, '빼면 원래 Boot 앱으로 돌아간다', pop(u, 1.6)); } }

  // ---------- 4. 구현만 갈아 끼운다 ----------
  const SLOT = [['서비스 발견', 'Eureka', 'Eureka'], ['로드밸런싱', 'Ribbon', 'LoadBalancer'], ['장애 격리', 'Hystrix', 'Resilience4j'], ['게이트웨이', 'Zuul', 'Gateway'], ['분산 추적', 'Sleuth', 'Micrometer']];
  const SX = (i) => 110 + i * 185;
  function s4(t, c) { const { k, u } = c;
    // 위: 애플리케이션 코드 (바뀌지 않는다)
    const ic = k === 0 ? pop(u, 0.2) : 1;
    card(480, 62, 470, 76, { rx: 10, stroke: ACC, sw: 2.5, s: ic });
    if (ic > 0.3) { mono(480, 56, '@FeignClient(name = "user-service")', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      mono(480, 82, 'UserDto findById(Long id);', { 'text-anchor': 'middle', 'font-size': 14 }); }
    if (k >= 1) { pill(820, 62, '변경 0줄', GOOD, k === 1 ? pop(u, 2.2) : 1, { fs: 14, fill: PANEL }); }
    // 추상화 선
    el('line', { x1: 40, y1: 140, x2: 920, y2: 140, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: k === 0 ? fade(u, 0.8) : 1 });
    tx(40, 128, '추상화 (@FeignClient · CircuitBreaker · DiscoveryClient)', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.9) : 1 });
    if (k === 3) { // 저울: 자유 ↔ 일관성
      const tilt = -E(u, 0.4, 1.4) * 12 * Math.PI / 180, px = 480, py = 250, L = 210;
      el('path', { d: `M${px - 20},${py + 90} L${px},${py} L${px + 20},${py + 90} Z`, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      const ax = px - L * Math.cos(tilt), ay = py + L * Math.sin(tilt), bx = px + L * Math.cos(tilt), by = py - L * Math.sin(tilt);
      el('line', { x1: ax, y1: ay, x2: bx, y2: by, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
      card(ax, ay + 34, 190, 50, { rx: 9, text: '완전한 자유', fs: 15, stroke: WARN });
      card(bx, by + 34, 220, 50, { rx: 9, text: '일관성 · 유지보수 위임', fs: 15, stroke: ACC, fill: ACCBG });
      sub(px, 370, '서비스가 여럿인 조직이면 채택 쪽이 무겁다', fade(u, 1.5), { 'font-weight': 700, fill: INK, 'font-size': 15 });
      mono(px, 400, '팀별 구현 25곳 → 표준 5개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); return; }
    SLOT.forEach(([n, old, nu], i) => { const x = SX(i), keep = old === nu;
      tx(x, 200, n, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT });
      const sw = k === 1 ? E(u, 0.3 + i * 0.2, 1.1 + i * 0.2) : k > 1 ? 1 : 0;
      if (keep) { card(x, 245, 150, 44, { rx: 8, text: old, fs: 15, stroke: INK }); if (k >= 1) sub(x, 290, '그대로', 1, { fill: MUT }); return; }
      if (k <= 1) card(x, lerp(245, 330, sw), 150, 44, { rx: 8, text: sw < 0.45 || sw > 0.9 ? old : '', fs: 15, stroke: BAD, color: sw > 0.3 ? BAD : INK, op: 1 - sw * 0.5 });
      if (sw > 0.6 && k === 1) mono(x, 372, 'EOL', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: BAD, opacity: 1 - sw * 0.5 });
      if (sw > 0) card(x, lerp(330, 245, sw), 150, 44, { rx: 8, text: sw > 0.55 ? nu : '', fs: 15, stroke: ACC, fill: ACCBG, color: ACC, op: sw }); });
    if (k === 0) { dot([[480, 100], [SX(0), 222]], seg(u, 1.2, 2.2), ACC, 6); sub(480, 330, 'Netflix OSS 구현 위에서 시작했다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); }
    if (k === 2) { grow(480, 100, 480, 136, E(u, 0.2, 0.6), ACC); SLOT.forEach((_, i) => grow(SX(i) + 55, 222, SX(i) + 55, 146, E(u, 0.8 + i * 0.15, 1.2 + i * 0.15), MUT));
      pill(480, 340, '교체 지점 = starter 의존성 하나', ACC, pop(u, 1.8), { fs: 14, fill: PANEL });
      sub(480, 380, '코드는 구현이 아니라 추상화에 기댄다', fade(u, 2.1), { 'font-weight': 700, fill: INK }); } }

  const quiz = [
    { q: 'A·B·C 세 팀이 설정·발견·복원력·추적을 각자 만들었을 때 가장 큰 문제는 무엇인가?',
      o: ['서비스가 너무 빨라진다', '같은 문제를 팀마다 다시 풀어 해법이 제각각이 된다', 'Spring Boot를 쓸 수 없게 된다'], a: 1,
      why: '서비스 5개면 관심사 5개 × 5 = 25곳을 각자 유지한다. 추적 헤더마저 달라 요청 경로를 잇지 못한다.' },
    { q: '"요청 경로 추적이 안 된다"는 문제에 맞춰진 표준 컴포넌트는 무엇인가?',
      o: ['Spring Cloud Config', 'Spring Cloud Gateway', 'Micrometer Tracing'], a: 2,
      why: 'Micrometer Tracing이 trace/span id를 서비스 경계마다 자동으로 넘긴다. 다섯 문제와 다섯 표준이 1:1로 맞는다.' },
    { q: 'Spring Cloud 표준 다섯 개를 켜는 데 필요한 것은 무엇인가?',
      o: ['starter 의존성과 application.yml 몇 줄', '새 프레임워크의 메인 클래스로 갈아타기', '컴포넌트마다 @EnableXxx와 직접 만든 설정 클래스'], a: 0,
      why: 'starter가 auto-configuration으로 빈을 등록하므로 @SpringBootApplication 진입점은 그대로다. 빼면 원래 Boot 앱으로 돌아간다.' },
    { q: 'Hystrix가 유지보수를 끝냈을 때 @FeignClient와 CircuitBreaker 추상화를 쓰던 코드는 어떻게 되었나?',
      o: ['인터페이스 코드는 그대로 두고 starter만 Resilience4j로 바꿨다', '모든 호출 코드를 새 API로 다시 썼다', 'Hystrix를 계속 써야 했다'], a: 0,
      why: '앱은 구현이 아니라 추상화에 의존한다. Ribbon·Hystrix·Zuul·Sleuth가 바뀌어도 UserClient는 한 줄도 안 바뀌었다.' },
  ];

  const summary = [
    '팀마다 설정, 발견, 복원력, 추적을 따로 만들면 서비스 5개에서 25곳을 각자 유지한다.',
    'Spring Cloud는 다섯 문제마다 표준 컴포넌트를 하나씩 맞춰 준다.',
    'starter 의존성과 yml 몇 줄이면 켜지고, 빼면 원래 Boot 앱으로 돌아간다.',
    '코드가 추상화에 기대므로 Hystrix가 Resilience4j로 바뀌어도 호출 코드는 그대로다.',
  ];
  const review = [
    { q: '새로 만든 D팀 서비스가 B팀과 다른 추적 헤더를 쓴다. 장애 때 가장 먼저 생길 일은?',
      o: ['한 요청이 두 서비스를 지나간 경로를 잇지 못한다', '두 서비스의 설정 파일이 합쳐진다', 'Gateway가 요청을 막는다'], a: 0,
      why: '추적 id 형식이 다르면 서비스 경계에서 요청이 끊긴 것처럼 보인다. Micrometer Tracing으로 맞추면 id가 자동으로 넘어간다.' },
    { q: 'Config Server를 아직 띄우지 않았는데 config.import에 optional:을 붙인 서비스는 어떻게 되나?',
      o: ['기동에 실패한다', 'Config Server 없이도 뜬다', 'Eureka 등록이 막힌다'], a: 1,
      why: 'optional: 접두사는 서버가 없을 때 건너뛰라는 뜻이다. 표준을 하나씩 들일 수 있는 이유다.' },
    { q: '어느 조직이 Spring Cloud 없이 직접 구현하는 편이 더 맞을까?',
      o: ['서비스 30개를 여러 팀이 나눠 맡은 조직', '라이브러리 EOL로 마이그레이션을 자주 겪는 조직', '서비스 1~2개를 한 팀이 운영하는 조직'], a: 2,
      why: '표준 채택은 자유를 조금 내주고 일관성과 유지보수를 얻는 거래다. 서비스가 한두 개면 얻을 것이 적다.' },
  ];

  R.page({ title: '파편화 → 표준 수렴', scenes: [s1, s2, s3, s4], quiz, summary, review });
})();
