/* V-2-1 모니터링 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: operation 이름별 표, resolver span 워터폴, 플랫폼 비교, extensions.code 별 집계, PR의 schema check.
 * span 이름·에러 code·HTTP 상태는 @opentelemetry/instrumentation-graphql와 @apollo/server 4로 돌려 확인한 값.
 * Studio 화면의 호출량·p95·건수는 페이지 코드 주석의 예시 값이다(그림에 "예시"로 표시). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, banner, grow, fly, dot, cross, check, server, spans, tokens, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));
  function code(x, y, lines, shown, o) { o = o || {}; const fs = o.fs || 14, lh = o.lh || fs + 7, n = lines.length;
    const w = o.w || Math.max(...lines.map((l) => tw(Array.isArray(l) ? l[0] : l, fs))) + 28, h = n * lh + 16;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.5, opacity: o.op ?? 1 });
    if (o.title) tx(x + 4, y - 8, o.title, { 'font-size': 13.5, 'font-weight': 700, fill: o.tcol || MUT, opacity: o.op ?? 1 });
    const sh = shown == null ? n : shown;
    lines.forEach((l, i) => { if (i >= Math.ceil(sh)) return; let [s, col] = Array.isArray(l) ? l : [l, null];
      if (i === Math.ceil(sh) - 1 && sh % 1) s = s.slice(0, Math.round(s.length * (sh % 1)));
      const yy = y + 8 + fs + i * lh;
      if (col) mono(x + 14, yy, s, { 'font-size': fs, fill: col, 'font-weight': 600, opacity: o.op ?? 1 });
      else spans(x + 14, yy, tokens(s), { 'font-size': fs, opacity: o.op ?? 1 }); });
    return { w, h }; }
  // 구름 모양 (Studio / GraphOS)
  function cloud(cx, cy, label, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op);
    el('path', { d: 'M-70,24 Q-96,24 -92,0 Q-90,-22 -64,-20 Q-58,-48 -24,-44 Q-6,-64 22,-48 Q56,-54 62,-24 Q94,-22 90,4 Q88,26 64,24 Z', fill: o.fill || INFOBG, stroke: o.stroke || INFO, 'stroke-width': 2.4 }, g);
    tx(0, 2, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.stroke || INFO }, g); return g; }

  // ---------- 1. Apollo Studio ----------
  const OPS = [['GetUser', '2.4k/min', '8ms', '0.01%', false], ['CreatePost', '340/min', '24ms', '1.2%', true], ['HomeScreen', '5k/min', '42ms', '0.03%', false]];
  function opsTable(x, y, shown, o) { o = o || {}; const cols = [0, 150, 270, 360];
    el('rect', { x: x - 14, y: y - 30, width: 470, height: 40 + OPS.length * 40, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    ['operation', 'rate', 'p95', 'error'].forEach((h, j) => tx(x + cols[j], y - 8, h, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }));
    OPS.forEach(([n, r, p, e, hot], i) => { const op = clamp(shown - i); if (op <= 0) return; const yy = y + 24 + i * 40;
      if (hot) el('rect', { x: x - 8, y: yy - 22, width: 458, height: 32, rx: 6, fill: BADBG, opacity: op });
      [n, r, p, e].forEach((v, j) => mono(x + cols[j], yy, v, { 'font-size': 14.5, 'font-weight': j === 0 ? 700 : 500, fill: hot && j === 3 ? BAD : INK, opacity: op })); });
    if (o.ex !== false) sub(x + 440, y + 34 + OPS.length * 40, '숫자는 예시', 1, { 'font-size': 13.5, 'text-anchor': 'end' }); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(470, 170, 480, 110, { rx: 12, sw: 2.2, s: pop(u, 0.2) });
      mono(250, 140, 'new ApolloServer({', { 'font-size': 15, opacity: fade(u, 0.3) }); mono(270, 166, 'typeDefs, resolvers,', { 'font-size': 15, opacity: fade(u, 0.4) });
      mono(270, 192, 'plugins: [', { 'font-size': 15, opacity: fade(u, 0.5) }); mono(250, 218, '] })', { 'font-size': 15, opacity: fade(u, 0.5) });
      fly(150, 340, 525, 186, seg(u, 0.9, 1.9), 'ApolloServerPluginUsageReporting', { mono: true, stay: true });
      note(440, 380, '@apollo/server 안에 이미 들어 있다. 따로 설치하지 않는다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    if (k <= 2) { server(150, 190, 'Apollo Server', { lamp: ACC }); cloud(790, 180, 'Apollo Studio'); }
    if (k === 1) { for (let i = 0; i < 4; i++) dot([[215, 190], [700, 185]], ((u * 0.7 + i / 4) % 1), ACC, 6);
      code(300, 260, ['operation: "GetUser"   duration: …', ['variables: ""          (none)', MUT], ['headers:   —           (none)', MUT], ['error:     "<masked>"  (AS4 기본값)', MUT]], E(u, 0.4, 1.8) * 4, { fs: 14, title: '전송되는 trace 한 건' });
      return; }
    if (k === 2) { code(250, 300, ['APOLLO_KEY=service:my-service:xxxxxx', 'APOLLO_GRAPH_REF=my-service@current'], E(u, 0.2, 1.0) * 2, { fs: 15 });
      pill(770, 290, 'graph = my-service', INFO, pop(u, 1.3), { mono: true, fs: 14 }); pill(770, 334, 'variant = current', ACC, pop(u, 1.6), { mono: true, fs: 14 });
      sub(740, 380, 'staging · current를 variant로 나눈다', fade(u, 2.0), { 'font-size': 14 }); note(250, 100, '코드에는 키가 없다', fade(u, 0.4)); return; }
    if (k === 3) { tx(80, 60, 'Operations (last 1h)', { 'font-size': 16, 'font-weight': 800 }); opsTable(80, 120, E(u, 0.3, 1.6) * 3);
      pill(700, 167, 'error 1.2% ⚠', BAD, pop(u, 1.8), { fs: 14 }); note(80, 340, '한 줄을 누르면 resolver 단 trace로 들어간다', fade(u, 2.2)); return; }
    // k4 운영 수칙
    ['{ user { id } }', '{ me { name } }', '{ posts { id } }'].forEach((q, i) => { const y = 90 + i * 46; mono(60, y, q, { 'font-size': 14, opacity: fade(u, 0.2 + i * 0.15) });
      grow(240, y - 5, 330, 130, E(u, 0.6, 1.0), MUT); });
    card(400, 130, 140, 44, { rx: 8, text: 'anonymous', mono: true, fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.0) });
    tx(480, 86, '이름이 없으면 한 줄로 뭉친다', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.1) });
    [['① operation 이름', 'query GetUser { … }'], ['② PII 마스킹', 'sendVariableValues: none'], ['③ 알람 임계', 'p95 · error rate']].forEach(([a, b], i) => { const x = 160 + i * 300, s = pop(u, 1.4 + i * 0.3);
      card(x, 300, 270, 70, { rx: 10, stroke: ACC, s }); tx(x, 294, a, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); mono(x, 318, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }); }

  // ---------- 2. Resolver trace ----------
  const WF = [['query HomeScreen', 0, 320, 0], ['Query.user', 0, 5, 1], ['User.posts', 5, 250, 1], ['db.posts.findByUserId(123)', 8, 245, 2], ['Post.author × 50', 255, 20, 1]];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { card(140, 200, 150, 60, { rx: 10, text: 'Router', fs: 16, s: pop(u, 0.2) }); card(470, 200, 170, 60, { rx: 10, text: 'subgraph', fs: 16, s: pop(u, 0.3) });
      grow(215, 186, 385, 186, E(u, 0.5, 0.9), MUT); mono(305, 146, 'apollo-federation-include-trace: ftv1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      grow(385, 214, 215, 214, E(u, 1.0, 1.4), ACC); code(300, 250, ['{ "data": { … },', '  "extensions": { "ftv1": "…" } }'], E(u, 1.1, 1.7) * 2, { fs: 14 });
      cloud(800, 200, 'Studio', { s: pop(u, 1.8) });
      dot([[140, 170], [140, 120], [720, 120], [770, 170]], seg(u, 2.0, 2.8), ACC, 7);
      note(60, 390, 'inlineTrace는 trace를 응답 extensions에 실어 보낸다', fade(u, 2.2)); return; }
    if (k === 1) { [['NodeSDK', '@opentelemetry/sdk-node'], ['GraphQLInstrumentation', '@opentelemetry/instrumentation-graphql'], ['OTLPTraceExporter', '@opentelemetry/exporter-trace-otlp-http']].forEach(([a, b], i) => {
        const y = 80 + i * 76, s = pop(u, 0.2 + i * 0.35); card(260, y, 420, 60, { rx: 10, stroke: ACC, s }); mono(260, y - 4, a, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: s }); mono(260, y + 18, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); });
      ['Jaeger', 'Tempo', 'Datadog'].forEach((n, i) => { grow(470, 156, 640, 90 + i * 66, E(u, 1.4 + i * 0.2, 1.8 + i * 0.2), MUT); pill(720, 90 + i * 66, n, INFO, pop(u, 1.8 + i * 0.2), { fs: 15 }); });
      note(60, 380, 'OTLP로 내보내면 어느 백엔드로든 붙는다', fade(u, 2.3)); return; }
    if (k === 2) { [['tracing 파일', 'sdk.start()'], ['require("graphql")', '계측이 붙는다'], ['서버 시작', 'span이 collector로']].forEach(([a, b], i) => {
        const x = 150 + i * 300, s = pop(u, 0.2 + i * 0.5); card(x, 140, 240, 74, { rx: 10, stroke: i === 0 ? ACC : INK, s }); mono(x, 134, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: s });
        tx(x, 158, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); if (i) grow(x - 178, 140, x - 122, 140, E(u, 0.2 + i * 0.5, 0.5 + i * 0.5), MUT); });
      dot([[750, 180], [750, 290]], seg(u, 1.8, 2.6), ACC, 7); pill(750, 310, 'collector:4318', INFO, pop(u, 2.2), { mono: true, fs: 14 });
      note(60, 300, '계측할 모듈보다 먼저 시작한다 (OTel 문서 권장)', fade(u, 2.3), { fill: MUT }); return; }
    if (k === 3) { mono(60, 46, 'query Home { user { name posts { title } } }', { 'font-size': 15, 'font-weight': 700 });
      const S = [['graphql.parse', 1], ['graphql.validate', 1], ['query Home', 1], ['graphql.resolve user', 1], ['graphql.resolve user.name', 0], ['graphql.resolve user.posts', 1], ['graphql.resolve user.posts.0.title', 0], ['graphql.resolve user.posts.1.title', 0]];
      S.forEach(([n, on], i) => { const y = 92 + i * 38, a = 0.2 + i * 0.22, op = fade(u, a);
        el('rect', { x: 60, y: y - 20, width: 470, height: 30, rx: 6, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': 1.5, 'stroke-dasharray': on ? null : '5 4', opacity: op });
        mono(74, y, n, { 'font-size': 14, fill: on ? INK : OFF, 'font-weight': on ? 700 : 500, 'text-decoration': on ? null : 'line-through', opacity: op }); });
      note(570, 200, '실행해서 나온 span 이름', fade(u, 1.0)); note(570, 232, '점선 = 기본 resolver', fade(u, 1.8), { fill: MUT });
      note(570, 260, 'ignoreTrivialResolveSpans로 생략', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 4) { const X = (ms) => 330 + ms * 1.8;
      WF.forEach(([n, s0, d, lv], i) => { const y = 70 + i * 54, a = 0.2 + i * 0.3, hot = n === 'User.posts' || lv === 2;
        mono(30 + lv * 16, y + 18, n.length > 24 ? n.slice(0, 22) + '…' : n, { 'font-size': 14, 'font-weight': 700, fill: hot ? BAD : INK, opacity: fade(u, a) });
        el('rect', { x: X(s0), y, width: Math.max(3, d * 1.8 * E(u, a, a + 0.5)), height: 26, rx: 5, fill: hot ? BAD : n.startsWith('Post') ? GOOD : INFO, opacity: 0.8 });
        mono(X(s0 + d) + 8, y + 18, d + 'ms', { 'font-size': 14, 'font-weight': 700, opacity: fade(u, a + 0.4) }); });
      note(330, 360, 'User.posts 250ms = 전체 320ms의 약 78%', fade(u, 1.9), { fill: BAD }); note(330, 390, '그 아래 DB 호출 245ms가 진짜 원인', fade(u, 2.2));
      sub(900, 410, '예시', 1, { 'font-size': 13.5, 'text-anchor': 'end' }); return; }
    [['Apollo Studio', 'trace 탭'], ['Jaeger · Tempo · Datadog', 'OTLP로 받는 APM'], ['Honeycomb', '카디널리티가 높을 때']].forEach(([a, b], i) => { const y = 100 + i * 90, s = pop(u, 0.2 + i * 0.4);
      card(320, y, 420, 66, { rx: 10, stroke: i === 0 ? ACC : INFO, s }); tx(320, y - 4, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(320, y + 20, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
    note(580, 220, 'GraphQL 성능 문제는 대부분 resolver 하나에서 난다', fade(u, 1.8)); }

  // ---------- 3. GraphOS / Hive ----------
  const COMMON = ['operation 별 latency · error', 'field-level usage', 'breaking change 검출', 'supergraph compose', 'client awareness'];
  function s3(t, c) { const { k, u } = c;
    const col = (x, name, sub_, items, colr, show) => { card(x, 70, 360, 64, { rx: 12, stroke: colr, sw: 2.5, fill: PANEL, s: show });
      tx(x, 66, name, { 'font-size': 18, 'font-weight': 800, fill: colr, 'text-anchor': 'middle', opacity: show }); tx(x, 90, sub_, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: show });
      items.forEach((s, i) => { const op = k === (colr === ACC ? 0 : 1) ? fade(u, 0.5 + i * 0.3) : show; check(x - 160, 140 + i * 34, 8, op); tx(x - 144, 145 + i * 34, s, { 'font-size': 14.5, opacity: op }); }); };
    if (k <= 2) { col(250, 'Apollo GraphOS', '상용 표준 · Cloud', k === 2 ? [] : ['Operations · Traces · Schema Check', 'Apollo Router와 supergraph 합성', '클라우드 / 온프레미스', 'Free → Enterprise'], ACC, k === 0 ? pop(u, 0.2) : 1);
      if (k >= 1) col(710, 'The Guild Hive', 'OSS · self-host 무료', k === 2 ? [] : ['self-host 또는 Hive Cloud', 'Apollo Federation v2 호환', 'Schema Registry + usage', '가격 부담이 적다'], GOOD, k === 1 ? pop(u, 0.2) : 1); }
    if (k === 2) { COMMON.forEach((s, i) => { const y = 150 + i * 46, a = 0.3 + i * 0.3; tx(480, y + 5, s, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, a) });
        check(250, y, 10, pop(u, a + 0.1)); check(710, y, 10, pop(u, a + 0.2)); });
      note(480, 400, '기능으로는 거의 같다. 비용과 데이터 위치로 고른다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k <= 1) return;
    if (k === 3) { [['WunderGraph Cosmo', 'OSS Router + Studio'], ['Stellate', 'GraphQL CDN · 캐시'], ['Sentry', 'error tracing'], ['Datadog / New Relic', '기존 APM + GraphQL']].forEach(([a, b], i) => {
        const x = 250 + (i % 2) * 460, y = 120 + Math.floor(i / 2) * 140, s = pop(u, 0.2 + i * 0.35);
        card(x, y, 380, 86, { rx: 12, stroke: INFO, s }); tx(x, y - 6, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); tx(x, y + 20, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
      note(480, 390, '이미 쓰는 APM이 있으면 GraphQL 플러그인만 얹어도 된다', fade(u, 2.1), { 'text-anchor': 'middle' }); return; }
    [['작은 팀', 'Studio Free + Sentry'], ['중형', 'GraphOS Standard 또는 Hive Cloud'], ['대형 · OSS 선호', 'Hive self-host + Cosmo Router']].forEach(([a, b], i) => {
      const x = 60 + i * 290, y = 320 - i * 90, s = pop(u, 0.2 + i * 0.45);
      el('rect', { x, y, width: 270, height: 390 - y, rx: 8, fill: SOFT, stroke: GRID, opacity: s }); tx(x + 14, y + 30, a, { 'font-size': 16, 'font-weight': 800, opacity: s });
      tx(x + 14, y + 56, b, { 'font-size': 13.5, fill: ACC, opacity: s, 'font-weight': 700 }); }); }

  // ---------- 4. Error rate ----------
  const CODES = [['UNAUTHENTICATED', '로그인 필요', WARN], ['FORBIDDEN', '권한 부족', WARN], ['BAD_USER_INPUT', '검증 실패', MUT], ['NOT_FOUND', '자원 없음', MUT], ['INTERNAL_SERVER_ERROR', '우리 잘못', BAD], ['PERSISTED_QUERY_NOT_FOUND', 'APQ 첫 호출', MUT]];
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { CODES.forEach(([n, d, col], i) => { const x = 170 + (i % 3) * 310, y = 200 + Math.floor(i / 3) * 110, s = pop(u, 0.3 + i * 0.2);
        el('path', { d: `M${x - 130},${y - 30} L${x - 112},${y + 40} L${x + 112},${y + 40} L${x + 130},${y - 30}`, fill: col === BAD ? BADBG : SOFT, stroke: col, 'stroke-width': 2, opacity: s });
        mono(x, y, n.length > 20 ? n.replace('PERSISTED_QUERY_', 'PERSISTED_Q…') : n, { 'font-size': 13.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: s }); tx(x, y + 24, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); });
      for (let i = 0; i < 6; i++) dot([[480, 40], [170 + (i % 3) * 310, 160 + Math.floor(i / 3) * 110]], seg(u, 1.4 + i * 0.12, 2.0 + i * 0.12), INK, 5);
      mono(480, 60, 'errors[].extensions.code', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); return; }
    if (k === 1) { const D = [['UNAUTHENTICATED', 880, WARN], ['BAD_USER_INPUT', 230, MUT], ['INTERNAL_SERVER_ERROR', 42, BAD], ['FORBIDDEN', 12, WARN]];
      tx(60, 60, 'Errors (last 1h)', { 'font-size': 16, 'font-weight': 800 }); sub(900, 60, '숫자는 예시', 1, { 'text-anchor': 'end' });
      D.forEach(([n, v, col], i) => { const y = 90 + i * 52; mono(60, y + 18, n, { 'font-size': 14.5, 'font-weight': 700, fill: col });
        R.hbar(330, y + 3, 460, v * E(u, 0.2 + i * 0.2, 1.0 + i * 0.2), 880, { col, h: 22, text: String(v) }); });
      code(60, 320, ['알람 예: createPost의 INTERNAL_SERVER_ERROR > 1% → Slack'], fade(u, 1.8), { fs: 14 }); return; }
    if (k === 2) { const OPS_ = ['GetUser', 'CreatePost', 'HomeScreen'], CD = ['UNAUTH…', 'FORBID…', 'BAD_INPUT', 'INTERNAL'];
      mono(60, 50, 'graphql_errors_total{operation, code}', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      CD.forEach((h, j) => mono(330 + j * 130, 104, h, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 }));
      OPS_.forEach((o, i) => { mono(80, 150 + i * 60, o, { 'font-size': 14.5, 'font-weight': 700 }); CD.forEach((h, j) => { const hit = i === 1 && j === 3;
        el('rect', { x: 270 + j * 130, y: 126 + i * 60, width: 120, height: 44, rx: 6, fill: hit ? BADBG : SOFT, stroke: hit ? BAD : GRID, 'stroke-width': hit ? 2.4 : 1.2, opacity: fade(u, 0.3 + (i * 4 + j) * 0.06) }); }); });
      mono(400 + 3 * 130 - 70, 156 + 60, '+1', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8), 'text-anchor': 'middle' });
      note(60, 360, '라벨은 operation과 code 정도만 (값 종류가 적은 것)', fade(u, 2.2)); return; }
    if (k === 3) { const ST = ['requestDidStart', 'parse', 'validate', 'execute', 'didEncounterErrors'];
      ST.forEach((s, i) => { const x = 110 + i * 185, hot = i === 4; card(x, 140, 166, 50, { rx: 10, text: s, mono: true, fs: 13.5, stroke: hot ? BAD : GRID, color: hot ? BAD : INK, s: pop(u, 0.2 + i * 0.2) });
        if (i) grow(x - 102, 140, x - 86, 140, E(u, 0.2 + i * 0.2, 0.4 + i * 0.2), MUT); });
      dot([[30, 140], [850, 140]], seg(u, 1.2, 2.3), INK, 7);
      code(560, 210, ['{ operationName, errors }'], fade(u, 2.0), { fs: 15 }); note(60, 330, '에러가 난 요청마다 이 훅이 불린다', fade(u, 2.2)); return; }
    if (k === 4) { const RW = [['query Home { boom }', 'Home', '(없음) → INTERNAL_SERVER_ERROR', '200', BAD], ['query Me { auth }', 'Me', 'UNAUTHENTICATED', '200', WARN], ['{ ok bad }', 'anonymous', 'GRAPHQL_VALIDATION_FAILED', '400', MUT], ['query Broken { ok', 'anonymous', 'GRAPHQL_PARSE_FAILED', '400', MUT]];
      ['보낸 쿼리', 'operation', '훅에서 본 code', 'HTTP'].forEach((h, j) => tx([40, 250, 400, 860][j], 50, h, { 'font-size': 13.5, 'font-weight': 700, fill: MUT }));
      RW.forEach(([q, o, cd, http, col], i) => { const y = 92 + i * 52, op = fade(u, 0.3 + i * 0.4);
        mono(40, y, q, { 'font-size': 14, opacity: op }); mono(250, y, o, { 'font-size': 14, 'font-weight': 700, opacity: op }); mono(400, y, cd, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: op }); mono(860, y, http, { 'font-size': 14, opacity: op }); });
      el('rect', { x: 390, y: 72, width: 440, height: 30, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2.2, opacity: fade(u, 1.9) });
      note(40, 330, '그냥 던진 Error는 이 훅에서 code가 없다 (실행해서 확인)', fade(u, 2.0), { fill: BAD }); note(40, 360, 'UNKNOWN으로 두면 INTERNAL 카운터가 늘지 않는다', fade(u, 2.3)); return; }
    code(60, 60, ['captureException(error, { tags: { operation, code } })'], fade(u, 0.2), { fs: 14.5, title: 'Sentry' });
    [['INTERNAL_SERVER_ERROR > 1% · 5분', 'P1 호출', BAD], ['UNAUTHENTICATED 급증', '보안 사고 의심', WARN], ['PERSISTED_QUERY_NOT_FOUND 급증', '배포 미스 의심', WARN]].forEach(([a, b, col], i) => {
      const y = 170 + i * 70, s = pop(u, 0.6 + i * 0.4); card(330, y, 540, 54, { rx: 10, stroke: col, s }); mono(80, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, opacity: s }); pill(700, y, b, col, s, { fs: 14 }); }); }

  // ---------- 5. Schema check ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const F = [['README.md', false], ['src/app.ts', false], ['src/schema/user.graphql', true]];
      tx(60, 60, 'PR #128 변경 파일', { 'font-size': 15, 'font-weight': 800 });
      F.forEach(([f, hit], i) => { const y = 100 + i * 50, op = fade(u, 0.2 + i * 0.2); mono(80, y, f, { 'font-size': 15, fill: hit ? ACC : MUT, 'font-weight': hit ? 800 : 500, opacity: op });
        if (hit) check(420, y - 5, 10, pop(u, 1.2)); else cross(420, y - 5, 8, pop(u, 1.0 + i * 0.1)); });
      code(500, 90, ['on:', '  pull_request:', '    paths: ["**/*.graphql", "src/schema/**"]'], E(u, 0.4, 1.2) * 3, { fs: 14 });
      note(60, 300, '스키마가 바뀐 PR 에서만 check가 돈다', fade(u, 1.8)); sub(60, 330, 'PR 번호와 파일은 예시', fade(u, 1.8), { 'text-anchor': 'start' }); return; }
    if (k === 1) { [['checkout', 'actions/checkout@v4'], ['rover 설치', 'curl … rover.apollo.dev | sh'], ['rover subgraph check', '다음 단계']].forEach(([a, b], i) => {
        const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.4); card(x, 170, 260, 80, { rx: 12, stroke: i === 1 ? ACC : INK, s }); tx(x, 164, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s });
        mono(x, 190, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); if (i) grow(x - 180, 170, x - 132, 170, E(u, 0.2 + i * 0.4, 0.5 + i * 0.4), MUT); });
      mono(480, 300, 'echo "$HOME/.rover/bin" >> $GITHUB_PATH', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(480, 340, '경로를 GITHUB_PATH에 더해야 다음 step에서 rover를 찾는다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k <= 4) { const L1 = ['type User {', '  id: ID!', '  email: String', '}', 'posts(first: Int = 20)'], L2 = [' type User {', '   id: ID!', ['-  email: String', BAD], ' }', ['~ posts(first: Int = 50)', WARN]];
      code(40, 60, L1, k === 2 ? E(u, 0.2, 0.8) * 5 : 5, { fs: 14, title: 'GraphOS에 등록된 스키마', w: 300 });
      code(380, 60, L2, k === 2 ? E(u, 0.6, 1.2) * 5 : 5, { fs: 14, title: 'PR의 스키마', w: 300 }); }
    if (k === 2) { pill(820, 110, '판정 기준', INFO, pop(u, 1.5), { fs: 14 }); note(720, 150, '운영 트래픽에서', fade(u, 1.7)); note(720, 176, '실제로 쓰는 필드인가', fade(u, 1.9), { fill: INFO });
      sub(480, 330, '쓰는 사람이 없으면 지워도 된다를 데이터로 판단한다', fade(u, 2.2), { 'font-size': 15, fill: INK }); return; }
    if (k === 3) { terminal(40, 230, 880, 170, ['$ rover subgraph check my-graph@current \\', '    --schema ./schema.graphql --name users \\', '    --validation-period 7d'], E(u, 0.2, 1.8) * 3, { title: 'GitHub Actions' });
      pill(820, 110, 'APOLLO_KEY (secrets)', ACC, pop(u, 2.0), { mono: true, fs: 13.5 }); return; }
    if (k === 4) { [['User.email 삭제', 'blocked', '최근 7일 12개 클라이언트가 사용', BAD], ['posts(first) 기본값 20 → 50', 'OK', '하위 호환', GOOD]].forEach(([a, b, d, col], i) => {
        const y = 270 + i * 60, s = pop(u, 0.3 + i * 0.6); card(480, y, 880, 50, { rx: 10, stroke: col, sw: 2.2, s }); mono(60, y + 5, a, { 'font-size': 14.5, 'font-weight': 700, opacity: s });
        pill(420, y, b, col, s, { fs: 14 }); tx(500, y + 5, d, { 'font-size': 14, fill: MUT, opacity: s }); });
      sub(900, 400, '결과 예시', 1, { 'font-size': 13.5, 'text-anchor': 'end' }); note(720, 120, '막히면 @deprecated로 알리고', fade(u, 1.8)); note(720, 148, '사용량 0이 된 뒤 지운다', fade(u, 2.1), { fill: ACC }); return; }
    if (k === 5) { cloud(160, 200, 'GraphOS'); grow(260, 200, 420, 200, E(u, 0.3, 0.8), MUT); mono(340, 186, 'webhook', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      card(640, 200, 400, 120, { rx: 12, stroke: INFO, sw: 2, s: pop(u, 0.9) });
      tx(460, 168, '#graphql-schema', { 'font-size': 14, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.1) }); mono(460, 200, 'users subgraph check: 1 blocked', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.3) });
      mono(460, 226, 'User.email removal', { 'font-size': 14, opacity: fade(u, 1.5) }); note(460, 330, 'Hive도 같은 알림을 준다', fade(u, 2.0), { fill: MUT }); return; }
    const ST = [['① PR', 'rover subgraph check'], ['② Merge', 'rover subgraph publish'], ['③ Router', 'uplink로 새 supergraph'], ['④ 관찰', 'operation 별 error rate']];
    ST.forEach(([a, b], i) => { const x = 130 + i * 235, s = pop(u, 0.2 + i * 0.4); card(x, 160, 210, 84, { rx: 12, stroke: i === 3 ? WARN : INK, s });
      tx(x, 152, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); mono(x, 178, b, { 'font-size': 13, fill: MUT, 'text-anchor': 'middle', opacity: s });
      if (i) grow(x - 128, 160, x - 107, 160, E(u, 0.2 + i * 0.4, 0.4 + i * 0.4), MUT); });
    const rb = E(u, 1.9, 2.5); if (rb > 0) { el('path', { d: `M${835},${205} C${835},${300} ${365},${300} ${365},${210}`, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: rb });
      tx(600, 300, '이상하면 supergraph rollback', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: rb }); } }

  const quiz = [
    { q: 'Apollo Studio의 Operations 표가 쓸모 있으려면 클라이언트 쪽에서 꼭 해야 할 것은 무엇인가?',
      o: ['모든 쿼리를 GET으로 보낸다', 'query GetUser { … }처럼 operation에 이름을 붙인다', '변수를 쿼리 문자열에 직접 넣는다'], a: 1,
      why: '표는 operation 이름으로 묶는다. 이름이 없으면 모두 anonymous 한 줄로 뭉쳐 어느 화면이 느린지 알 수 없다.' },
    { q: 'HomeScreen trace에서 전체 320ms 중 User.posts가 250ms, 그 아래 DB 호출이 245ms다. 어디부터 보는가?',
      o: ['User.posts가 부르는 DB 쿼리 (인덱스 등)', 'Query.user resolver', 'Post.author의 DataLoader'], a: 0,
      why: '자식 span이 부모 시간 대부분을 먹으면 그 아래가 원인이다. 250ms 중 245ms가 DB 호출이다.' },
    { q: 'GraphOS와 Hive 중 하나를 고를 때 가장 큰 기준은 무엇인가?',
      o: ['breaking change 검출 지원 여부', 'operation 별 latency를 보여 주는지', '비용과 스키마·사용량 데이터를 어디에 둘 수 있는지'], a: 2,
      why: '두 플랫폼 모두 operation 메트릭, field usage, breaking change 검출을 준다. 외부 SaaS에 데이터를 못 올리면 Hive self-host를 고른다.' },
    { q: 'didEncounterErrors에서 code를 e.extensions?.code || "UNKNOWN"으로 셌다. resolver가 throw new Error("db down")을 던지면 카운터에는 무엇이 오르는가?',
      o: ['INTERNAL_SERVER_ERROR', 'UNKNOWN', '아무것도 오르지 않는다'], a: 1,
      why: '이 훅 시점에는 그냥 던진 Error에 code가 없다. 응답에서만 INTERNAL_SERVER_ERROR가 붙으니 기본값을 그 값으로 둬야 장애 알람이 운다.' },
    { q: 'PR에서 User.email을 지웠는데 rover subgraph check가 막았다. 이유는 무엇인가?',
      o: ['최근 운영 트래픽에서 그 필드를 쓰는 클라이언트가 있어서', 'email 필드가 nullable이라서', 'paths 필터에 걸려서'], a: 0,
      why: 'schema check는 등록된 스키마와 비교하되 실제 사용량으로 판정한다. 쓰는 클라이언트가 있으면 @deprecated로 알린 뒤 사용량이 0이 되면 지운다.' },
  ];
  const summary = [
    'GraphQL은 에러도 HTTP 200으로 보내는 일이 많아 상태 코드만 봐서는 장애가 안 보인다.',
    'operation 이름을 붙여야 Studio나 Hive가 호출 수, p95, 에러율을 화면별로 묶어 준다.',
    'resolver마다 span을 남기면 느린 operation 안에서 어느 필드가 시간을 먹는지 바로 찾는다.',
    '에러는 operation과 code로 세고, 스키마 변경은 운영 트래픽 기준 check를 PR에서 통과시킨다.',
  ];
  const review = [
    { q: '대시보드의 HTTP 5xx는 0 인데 사용자는 글쓰기가 안 된다고 한다. 먼저 볼 것은?',
      o: ['CreatePost operation의 errors[].extensions.code 분포', '서버 CPU 사용률', 'CDN 캐시 적중률'], a: 0,
      why: 'GraphQL은 실행 에러도 200에 errors 배열로 보낸다. operation과 code로 나눠 세야 CreatePost의 INTERNAL_SERVER_ERROR가 보인다.' },
    { q: 'trace에 graphql.resolve span이 필드 수만큼 쏟아져 저장 비용이 커졌다. 대부분 p[field]만 읽는 필드다. 먼저 켤 옵션은?',
      o: ['sendVariableValues: { none: true }', 'ignoreTrivialResolveSpans: true', 'depthLimit(7)'], a: 1,
      why: '기본 resolver는 값만 꺼내므로 span이 쓸모없다. 켜면 user.name 같은 필드 span이 빠진다(실행해서 확인).' },
    { q: 'Operations 표에서 CreatePost의 error가 1.2%다. 원인을 좁히는 순서로 맞는 것은?',
      o: ['스키마를 롤백한다', 'p95 알람 임계를 올린다', 'error code 분포를 보고, INTERNAL이면 그 operation의 resolver trace를 연다'], a: 2,
      why: 'UNAUTHENTICATED 같은 정상 거부인지 우리 잘못인지 code로 먼저 가른다. INTERNAL이면 trace로 어느 resolver 인지 찾는다.' },
  ];

  R.page({ title: '모니터링 대시보드', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
