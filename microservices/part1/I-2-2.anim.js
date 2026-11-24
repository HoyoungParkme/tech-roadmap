/* I-2-2 모듈러 모놀리스 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: jar 하나 안에서 모듈이 api / internal 로 갈리고, 한 DB 인스턴스가 schema 로 갈리고, 모듈 사이는 in-process 이벤트로 잇다가
 *       Strangler Fig 로 payment 부터 떼어낸다. 아래 계기판은 STEPS 의 modules · deployUnits · crossCalls.
 * 숫자: 페이지 데이터·코드만 (모듈 4개, schema 4개, 트래픽 1% → 10% → 50% → 100%). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    server, dbIcon, person, cross, check, lock, meters, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const MOD = ['catalog', 'order', 'payment', 'shipping'];
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  // 계기판: 모듈 수 · 배포 단위 + 모듈 간 통신 방식(글자)
  function gauges(c) { const b = c.beat, p = c.prev || {};
    const m = tween(p.modules, b.modules, c.u), d = tween(p.deployUnits, b.deployUnits, c.u);
    meters(150, 344, 400, [{ name: '모듈 수', val: Math.round(m) + '개', bar: m / 6 * 100 }, { name: '배포 단위', val: Math.round(d) + '개', bar: d / 4 * 100, good: b.deployUnits > 1 }], { h: 64 });
    card(682, 376, 256, 64, { rx: 10, stroke: GRID, sw: 1.5 });
    tx(568, 365, '모듈 간 통신', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    mono(568, 394, b.crossCalls, { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: p.crossCalls && p.crossCalls !== b.crossCalls ? fade(c.u, 0.3) : 1 }); }

  // ---------- 1. Gradle 모듈 4개 ----------
  const MX = [560, 700, 840], JAR = { x: 470, y: 30, w: 460, h: 290 };
  const mpos = (i) => [JAR.x + 115 + (i % 2) * 230, JAR.y + 80 + Math.floor(i / 2) * 120];
  function modBox(i, o) { o = o || {}; const [x, y] = mpos(i), s = o.s ?? 1, sp = o.split ?? 0; if (s <= 0) return;
    if (sp <= 0) { card(x, y, 200, 90, { rx: 10, text: MOD[i], fs: 15, mono: true, stroke: o.stroke || INK, s }); return; }
    card(x, y - 23 - 4 * sp, 200, 44, { rx: 8, stroke: GOOD, fill: GOODBG, s }); card(x, y + 23 + 4 * sp, 200, 44, { rx: 8, stroke: INK, fill: SOFT, s });
    mono(x - 86, y - 18 - 4 * sp, MOD[i] + '/api', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: sp });
    mono(x - 86, y + 28 + 4 * sp, MOD[i] + '/internal', { 'font-size': 14, 'font-weight': 700, opacity: sp });
    lock(x + 80, y + 25 + 4 * sp, true, INK, 0.6 * sp); }
  function s1(t, c) { const { k, u } = c;
    el('rect', { x: JAR.x, y: JAR.y, width: JAR.w, height: JAR.h, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    mono(JAR.x + 14, JAR.y + JAR.h - 12, 'shop-monolith', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k === 0) { const L = ['rootProject.name = "shop-monolith"', 'include "modules:catalog"', 'include "modules:order"', 'include "modules:payment"', 'include "modules:shipping"', 'include "app"'];
      const n = E(u, 0.1, 2.0) * L.length; snippet(30, 50, L.slice(0, Math.ceil(n)), { w: 410, fs: 14 }); tx(30, 38, 'settings.gradle', { 'font-size': 13.5, fill: MUT, class: 'mono' });
      MOD.forEach((_, i) => modBox(i, { s: pop(u, 0.1 + (i + 2) / L.length * 1.9) }));
      pill(JAR.x + JAR.w / 2 + 50, JAR.y + JAR.h - 16, 'app · jar 를 조립하는 모듈', ACC, pop(u, 2.1), { fs: 13.5 });
      gauges(c); return; }
    const sp = k === 1 ? E(u, 0.3, 1.2) : 1;
    MOD.forEach((_, i) => modBox(i, { split: sp }));
    if (k === 1) { note(240, 130, 'api: 다른 모듈에 공개', fade(u, 1.2), { fill: GOOD, 'text-anchor': 'middle' }); note(240, 170, 'internal: 모듈 안에서만', fade(u, 1.5), { 'text-anchor': 'middle' });
      sub(240, 214, '폴더가 곧 계약이다', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 2) { snippet(20, 60, ['dependencies {', '  api project(":modules:catalog-api")', '  implementation project(', '    ":modules:catalog-internal")', '}'], { w: 430, fs: 13.5 });
      const [ox, oy] = mpos(1), [cx, cy] = mpos(0);
      const g1 = E(u, 0.3, 1.0), g2 = E(u, 1.2, 1.8);
      el('path', { d: `M${ox},${oy - 50} C${ox},${oy - 92} ${cx},${cy - 92} ${cx},${cy - 52}`, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': `${g1 * 300} 400`, 'marker-end': g1 >= 1 ? 'url(#ra-ah)' : null });
      if (g1 >= 1) check((ox + cx) / 2, cy - 84, 9, pop(u, 1.0));
      el('path', { d: `M${ox},${oy + 50} C${ox},${oy + 74} ${cx},${cy + 74} ${cx},${cy + 52}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: g2 });
      if (g2 >= 1) cross((ox + cx) / 2, cy + 70, 9, pop(u, 1.8));
      note(235, 220, 'order 컴파일 경로에 catalog-internal 이 없다', fade(u, 2.0), { 'text-anchor': 'middle', fill: BAD, 'font-size': 14.5 }); }
    if (k === 3) { const f = E(u, 0.3, 1.1); fly(JAR.x + JAR.w / 2, 175, 220, 175, f, 'shop-monolith.jar', { mono: true, stay: true });
      if (f >= 1) { server(220, 250, null, { lamp: GOOD, s: 0.7 }); }
      note(220, 110, '산출물은 여전히 jar 1개', fade(u, 1.3), { 'text-anchor': 'middle' });
      sub(220, 320, '모듈끼리는 공개 API 로만', fade(u, 1.9), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); }
    gauges(c); }

  // ---------- 2. 공개면 · 내부 구현 ----------
  function s2(t, c) { const { k, u } = c;
    zone(470, 30, 460, 290, 'catalog 모듈', { fill: SOFT });
    // 공개면 (창문)
    card(700, 112, 400, 96, { rx: 10, stroke: GOOD, fill: GOODBG, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(516, 90, 'public interface CatalogService', { 'font-size': 14, 'font-weight': 800, fill: GOOD, opacity: k === 0 ? fade(u, 0.4) : 1 });
    ['ProductDto findById(id)', 'boolean isInStock(id, qty)'].forEach((s, i) => mono(530, 120 + i * 26, s, { 'font-size': 14, opacity: k === 0 ? fade(u, 0.8 + i * 0.4) : 1 }));
    if (k === 0) { pill(240, 100, '밖에서 보이는 메서드 2개', GOOD, pop(u, 1.8), { fs: 14 }); sub(240, 140, '이 면이 나중에 서비스 API 가 된다', fade(u, 2.2), { 'font-size': 14.5 }); gauges(c); return; }
    // 내부 (벽 뒤)
    const inner = ['CatalogService\nImpl', 'Product\nEntity', 'Product\nRepository'];
    el('rect', { x: 490, y: 174, width: 420, height: 6, fill: INK, opacity: k === 1 ? fade(u, 0.2) : 1 });
    inner.forEach((s, i) => { const x = 560 + i * 140, sc = k === 1 ? pop(u, 0.4 + i * 0.3) : 1; card(x, 246, 134, 64, { rx: 8, stroke: INK, fill: PANEL, s: sc, text: s, fs: 13.5, mono: true, fw: 700 });
      lock(x, 286, true, MUT, 0.55 * sc); });
    if (k === 1) { note(240, 230, 'package-private', fade(u, 1.5), { 'text-anchor': 'middle', class: 'mono' }); sub(240, 260, 'internal 밖에서는 이름도 못 쓴다', fade(u, 1.8), { 'font-size': 14.5 }); gauges(c); return; }
    if (k === 2) { card(140, 160, 210, 60, { rx: 10, text: 'PlaceOrderService', fs: 14, mono: true, stroke: INFO, s: pop(u, 0.2) });
      mono(140, 210, 'order 모듈', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INFO }); grow(246, 150, 496, 110, E(u, 0.4, 0.9), GOOD); check(370, 112, 9, pop(u, 0.9));
      grow(246, 175, 625, 240, E(u, 1.1, 1.6), BAD); if (u > 1.6) cross(440, 208, 9, pop(u, 1.6));
      card(250, 290, 440, 48, { rx: 6, fill: INK, stroke: 'none', s: pop(u, 1.9) });
      mono(42, 287, 'error: ProductEntity is not public in', { 'font-size': 13.5, fill: '#fca5a5', opacity: fade(u, 2.0) });
      mono(42, 305, '  ...catalog.internal; cannot be accessed', { 'font-size': 13.5, fill: '#fca5a5', opacity: fade(u, 2.0) });
      gauges(c); return; }
    // k3: ArchUnit 이 CI 에서 막는다
    const st = ['build', 'ModuleBoundaryTest', 'deploy'];
    st.forEach((s, i) => { const x = 60 + i * 140, f = E(u, 0.3 + i * 0.5, 0.7 + i * 0.5), bad = i === 1 && u > 1.3;
      card(x + 60, 270, 130, 40, { rx: 20, text: s.length > 12 ? 'ArchUnit 테스트' : s, fs: 13.5, stroke: i === 2 ? OFF : bad ? BAD : GOOD, color: i === 2 ? OFF : bad ? BAD : INK, fill: bad ? BADBG : PANEL, s: i === 2 ? 1 : pop(u, 0.3 + i * 0.5) });
      if (i && i < 2) grow(x - 14, 270, x - 6, 270, f, MUT); });
    if (u > 1.3) cross(330, 236, 9, pop(u, 1.3));
    snippet(30, 40, ['noClasses().that()', ' .resideInAPackage("..order.internal..")', ' .should().dependOnClassesThat()', ' .resideInAPackage("..catalog.internal..")'], { w: 420, fs: 13.5, op: fade(u, 0.1) });
    note(240, 330 - 4, '경계 위반 = 빌드 실패', fade(u, 1.8), { 'text-anchor': 'middle', fill: BAD });
    gauges(c); }

  // ---------- 3. 한 DB 인스턴스, schema 4개 ----------
  const SC = (i) => [120 + i * 190, 150];
  function instance(o) { o = o || {}; el('path', { d: 'M30,50 V300 A440,26 0 0 0 890,300 V50', fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); el('ellipse', { cx: 460, cy: 50, rx: 430, ry: 24, fill: SOFT, stroke: INK, 'stroke-width': 2.5 });
    mono(460, 56, 'PostgreSQL · 인스턴스 1개', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); }
  function schemaBox(i, o) { o = o || {}; const [x, y] = SC(i), s = o.s ?? 1; if (s <= 0) return;
    card(x + (o.dx || 0), y + 46 + (o.dy || 0), 170, 176, { rx: 10, stroke: o.stroke || [ACC, INFO, WARN, GOOD][i], fill: o.fill || PANEL, s, dash: o.dash, op: o.op });
    mono(x + (o.dx || 0) - 72, y - 30 + (o.dy || 0), 'schema ' + (MOD[i] === 'order' ? '"order"' : MOD[i]), { 'font-size': 13.5, 'font-weight': 800, fill: [ACC, INFO, WARN, GOOD][i], opacity: Math.min(s, o.op ?? 1) }); }
  function table(x, y, name, cols, f, col) { mono(x, y, name, { 'font-size': 13.5, 'font-weight': 800, fill: col, opacity: f });
    cols.forEach((s, i) => { const g = clamp(f * cols.length - i); if (g <= 0) return; el('rect', { x: x - 4, y: y + 8 + i * 24, width: 160, height: 22, rx: 3, fill: SOFT, opacity: g }); mono(x + 4, y + 24 + i * 24, s, { 'font-size': 13.5, opacity: g }); }); }
  function s3(t, c) { const { k, u } = c;
    instance();
    const out = k === 4 ? E(u, 0.2, 1.2) : 0;
    MOD.forEach((_, i) => schemaBox(i, { s: k === 0 ? pop(u, 0.4 + i * 0.3) : 1, dy: i === 2 ? 0 : 0, op: i === 2 && out > 0 ? 1 - out : 1 }));
    if (k === 0) { note(460, 316, '모듈 수만큼 schema 를 판다 · 비용 0', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC }); gauges(c); return; }
    table(SC(0)[0] - 74, 150, 'products', ['id', 'title', 'price', 'stock_qty'], k === 1 ? E(u, 0.3, 1.3) : 1, ACC);
    if (k >= 2) table(SC(1)[0] - 74, 150, 'order_lines', ['order_id', 'product_id', 'qty', 'unit_price'], k === 2 ? E(u, 0.2, 1.0) : 1, INFO);
    if (k === 1) { gauges(c); return; }
    if (k === 2) { const f = E(u, 1.2, 1.8); el('path', { d: `M${SC(1)[0] - 78},${194} C${SC(1)[0] - 120},${194} ${SC(0)[0] + 120},${170} ${SC(0)[0] + 84},${170}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': `6 5`, opacity: f });
      if (f >= 1) cross(215, 182, 10, pop(u, 1.8)); pill(310, 304, 'FK 없음 · ID 값만', BAD, pop(u, 2.0), { fs: 13.5, fill: PANEL }); gauges(c); return; }
    if (k === 3) { card(460, 90, 150, 32, { rx: 16, text: 'catalog_app', fs: 14, mono: true, fill: INK, color: PANEL, stroke: 'none', s: pop(u, 0.2) });
      grow(386, 92, SC(0)[0] + 40, 112, E(u, 0.5, 0.9), GOOD); check(250, 92, 8, pop(u, 0.9));
      [1, 2].forEach((i, n) => { const f = E(u, 1.0 + n * 0.3, 1.4 + n * 0.3); grow(500 + n * 30, 106, lerp(500 + n * 30, SC(i)[0] + 40, f), lerp(106, 140, f), f, BAD); if (f >= 1) cross(SC(i)[0] + 40, 150, 8, 1); });
      card(460, 318, 470, 32, { rx: 6, fill: INK, stroke: 'none', s: pop(u, 1.9) });
      mono(460, 323, 'ERROR: permission denied for schema order', { 'font-size': 13.5, 'text-anchor': 'middle', fill: '#fca5a5', opacity: fade(u, 2.0) });
      gauges(c); return; }
    // k4: payment schema 를 통째로 떼어낸다
    const [px] = SC(2); if (out > 0) { dbIcon(lerp(px, 930 - 20, out), lerp(200, 140, out), null, { s: 0.7, stroke: WARN }); }
    mono(905, 200, 'payment DB', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.2) });
    card(460, 300 + 0, 420, 36, { rx: 18, text: 'cross-schema JOIN → 권한 에러', fs: 14, stroke: BAD, color: BAD, fill: PANEL, s: pop(u, 1.4) });
    pill(SC(2)[0], 250, '두 schema 동시 변경 → 이벤트', INFO, pop(u, 1.9), { fs: 13.5, fill: PANEL });
    gauges(c); }

  // ---------- 4. in-process 이벤트 버스 ----------
  function jvm(op, w) { el('rect', { x: 30, y: 30, width: w || 900, height: 280, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '10 6', opacity: op ?? 1 });
    mono(46, 54, 'JVM 1개 (shop-monolith)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op ?? 1 }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { jvm(1); el('rect', { x: 330, y: 70, width: 300, height: 190, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: pop(u, 0.2) });
      mono(346, 96, 'shared.events', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      ['record OrderPlaced(', '  OrderId orderId,', '  UserId userId,', '  Money totalAmount,', '  List<LineItem> lines)'].forEach((s, i) => mono(350, 130 + i * 24, s, { 'font-size': 14, opacity: fade(u, 0.6 + i * 0.25) }));
      note(780, 150, '과거형 이름', fade(u, 1.8), { 'text-anchor': 'middle', fill: ACC }); sub(780, 176, 'ChargePayment 가 아니라', fade(u, 2.0), { 'font-size': 14 }); sub(780, 198, 'OrderPlaced', fade(u, 2.1), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
      gauges(c); return; }
    const kaf = k === 3 ? E(u, 0.3, 1.4) : 0;
    jvm(1, lerp(900, 560, kaf));
    // 버스
    const by = 190; el('line', { x1: 260, y1: by, x2: lerp(880, 520, kaf), y2: by, stroke: INFO, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.35 * (1 - kaf) });
    if (kaf > 0) { el('line', { x1: 600, y1: by, x2: 920, y2: by, stroke: INFO, 'stroke-width': 26, 'stroke-linecap': 'round', opacity: 0.25 * kaf }); mono(760, by + 5, 'Kafka', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: kaf }); }
    card(150, 120, 170, 60, { rx: 10, text: 'order', fs: 15, mono: true, stroke: INK });
    const px = lerp(720, 860, kaf), py = lerp(110, 110, kaf);
    card(px, py, 150, 56, { rx: 10, text: 'payment', fs: 15, mono: true, stroke: GOOD, s: k === 1 ? 0.0001 : k === 2 ? pop(u, 0.2) : 1 });
    if (k === 1) { [['save', 0.3], ['publishEvent', 0.9], ['return', 1.5]].forEach(([s, a], i) => { pill(110 + i * 130, 250, s, i === 1 ? ACC : INK, pop(u, a), { fs: 13.5, mono: true }); if (i) grow(110 + (i - 1) * 130 + 52, 250, 110 + i * 130 - 58, 250, E(u, a - 0.3, a), MUT); });
      fly(150, 150, 520, by, seg(u, 1.0, 1.8), 'OrderPlaced', { mono: true });
      note(640, 110, 'payment 를 부르지 않는다', fade(u, 1.8), { fill: MUT, 'text-anchor': 'middle' }); gauges(c); return; }
    if (k === 2) { const f = seg(u, 0.5, 1.4); fly(300, by, px, py + 30, f, 'OrderPlaced', { mono: true });
      grow(px, by, px, py + 32, E(u, 0.3, 0.6), GOOD); mono(px, py - 40, '@ApplicationModuleListener', { 'font-size': 13.5, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.6) });
      card(720, 270, 150, 50, { rx: 10, text: 'shipping', fs: 15, mono: true, stroke: GOOD, dash: '6 4', s: pop(u, 1.6) }); grow(720, by + 4, 720, 244, E(u, 1.7, 2.0), GOOD);
      pill(330, 262, '발행 코드 변경 0줄', ACC, pop(u, 2.1), { fs: 14 }); gauges(c); return; }
    // k3: 떼어내면 Kafka 로 1:1
    [['publishEvent(e)', 'kafkaTemplate.send(e)'], ['@ApplicationModuleListener', '@KafkaListener']].forEach(([a, b], i) => { const y = 252 + i * 30, op = fade(u, 1.5 + i * 0.3);
      mono(60, y, a, { 'font-size': 14, opacity: op }); mono(320, y, '→', { 'font-size': 14, opacity: op, fill: MUT }); mono(350, y, b, { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: op }); });
    if (kaf >= 1) for (let i = 0; i < 3; i++) dot([[260, by], [640, by], [px, by], [px, py + 28]], ((t * 0.35 + i / 3) % 1), INFO, 6);
    gauges(c); }

  // ---------- 5. Strangler Fig ----------
  function mono_(op, o) { o = o || {}; el('rect', { x: 60, y: 50, width: 300, height: 250, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: op });
    mono(76, 76, 'shop-monolith.jar', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op });
    MOD.forEach((m, i) => { const gone = o.gone && o.gone[i], s = gone == null ? 1 : 1 - gone; if (s <= 0.02) return;
      card(140 + (i % 2) * 140, 140 + Math.floor(i / 2) * 90, 120 * s, 64, { rx: 8, text: gone ? '' : m, fs: 14, mono: true, stroke: i === 2 && o.hot ? WARN : INK, fill: SOFT, op: op * s }); }); }
  function vine(f) { if (f <= 0) return; const d = 'M30,320 C30,200 70,120 50,40 C120,20 250,30 380,40 C400,120 340,200 390,310';
    el('path', { d, fill: 'none', stroke: GOOD, 'stroke-width': 4, 'stroke-dasharray': `${f * 1300} 1400`, 'stroke-linecap': 'round', opacity: 0.8 });
    for (let i = 0; i < 9; i++) { if (f * 9 < i) break; const p = [[40, 230], [56, 130], [70, 50], [160, 34], [270, 34], [380, 70], [372, 160], [360, 230], [388, 290]][i]; el('ellipse', { cx: p[0], cy: p[1], rx: 9, ry: 5, fill: GOOD, transform: `rotate(${i * 40} ${p[0]} ${p[1]})` }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { mono_(1); vine(E(u, 0.3, 2.2));
      card(700, 170, 200, 80, { rx: 12, text: '새 서비스', fs: 16, stroke: GOOD, fill: GOODBG, s: pop(u, 1.2) });
      for (let i = 0; i < 4; i++) dot([[560, 300], [380, 300], [260, 300]], ((t * 0.4 + i / 4) % 1), INK, 5);
      for (let i = 0; i < 2; i++) dot([[560, 300], [700, 300], [700, 210]], ((t * 0.4 + i / 2) % 1), GOOD, 5);
      note(700, 290 + 30, '감싸며 조금씩 대체한다', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); gauges(c); return; }
    if (k === 1) { const f = seg(u, 0.3, 1.2); mono_(1, { gone: [0, 0, f, 0], hot: true });
      if (f > 0) fly(140, 230, 720, 120, f, 'payment', { mono: true });
      card(720, 120, 220, 60, { rx: 10, text: 'payment-service', fs: 15, mono: true, stroke: ACC, fill: ACCBG, s: pop(u, 1.2) });
      dbIcon(720, 240, null, { s: 0.6, stroke: WARN }); grow(720, 152, 720, 210, E(u, 1.4, 1.7), WARN); mono(790, 246, 'payment schema', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.6) });
      el('line', { x1: 362, y1: 120, x2: lerp(362, 608, E(u, 1.8, 2.3)), y2: 120, stroke: INFO, 'stroke-width': 10, opacity: 0.3 }); mono(485, 108, 'Kafka', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      gauges(c); return; }
    if (k === 2) { mono_(1, { gone: [0, 0, 1, 0] });
      card(720, 120, 220, 60, { rx: 10, text: 'payment-service', fs: 15, mono: true, stroke: ACC, fill: ACCBG });
      card(560, 270, 150, 50, { rx: 10, text: 'API Gateway', fs: 14, stroke: INK, fill: SOFT });
      const steps = [1, 10, 50, 100, 0], idx = Math.min(4, Math.floor(E(u, 0.1, 2.5) * 5)), pct = steps[idx];
      mono(560, 222, pct + '%', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: pct === 0 ? BAD : ACC });
      if (idx === 4) tx(640, 228, '문제 발생 → 즉시 0% 롤백', { 'font-size': 14, 'font-weight': 700, fill: BAD });
      for (let i = 0; i < 12; i++) { const toNew = ((i * 37) % 100) < pct, ph = ((t * 0.5 + i / 12) % 1);
        dot(toNew ? [[635, 270], [720, 270], [720, 152]] : [[485, 270], [362, 250]], ph, toNew ? ACC : INK, 5); }
      sub(560, 330 - 4, '1% → 10% → 50% → 100%', 1, { 'font-size': 14.5, 'font-weight': 700 }); gauges(c); return; }
    if (k === 3) { mono_(1, { gone: [0, 0, 1, 0] });
      card(720, 120, 220, 60, { rx: 10, text: 'payment-service', fs: 15, mono: true, stroke: ACC, fill: ACCBG });
      card(140, 230, 120 * (1 - E(u, 0.3, 1.0)), 64, { rx: 8, stroke: BAD, dash: '5 4', op: 1 - E(u, 0.3, 1.0) });
      if (u > 0.3 && u < 1.2) tx(140, 236, '삭제', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      ['order', 'shipping', 'catalog'].forEach((m, i) => { pill(560 + i * 130, 250, m, i === 0 ? WARN : MUT, pop(u, 1.2 + i * 0.25), { mono: true, fs: 14 }); if (i) grow(560 + (i - 1) * 130 + 46, 250, 560 + i * 130 - 50, 250, E(u, 1.3 + i * 0.25, 1.6 + i * 0.25), MUT); });
      tx(560, 214, '다음 대상', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(700, 300, '도메인 1개에 보통 3~6개월 (어림)', fade(u, 2.0), { 'font-size': 14 }); gauges(c); return; }
    // k4: 한 박자 거친다
    const st = [['모놀리스', '거대 패키지 · 한 schema'], ['모듈러 모놀리스', '모듈 경계 · schema 분리 · 이벤트'], ['MSA', '하나씩 떼어낸 서비스']], xs = [160, 480, 800];
    el('line', { x1: 160, y1: 150, x2: lerp(160, 800, E(u, 0.1, 1.6)), y2: 150, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    st.forEach(([a, b], i) => { const s = pop(u, 0.2 + i * 0.6); el('circle', { cx: xs[i], cy: 150, r: 16 * s, fill: i === 1 ? ACC : PANEL, stroke: i === 1 ? ACC : INK, 'stroke-width': 3 });
      tx(xs[i], 200, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.6) }); tx(xs[i], 226, b, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4 + i * 0.6) }); });
    note(480, 300, '빅뱅이 아니라 되돌릴 수 있는 마이그레이션', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC });
    gauges(c); }

  const quiz = [
    { q: '모듈러 모놀리스에서 모듈을 Gradle 모듈로 선언하는 이유는 무엇인가?',
      o: ['배포 단위를 모듈 수만큼 늘리려고', '빌드 도구가 모듈 경계를 지켜 주게 하려고', '모듈마다 다른 언어를 쓰려고'], a: 1,
      why: '폴더 이름만으로는 경계가 지켜지지 않는다. settings.gradle에 선언해야 빌드 도구가 의존을 막아 준다. 배포는 여전히 jar 1개다.' },
    { q: 'order 모듈 코드가 catalog의 ProductEntity를 필드로 쓰려 하면 어떻게 되나?',
      o: ['실행 중에 경고만 찍힌다', '자동으로 ProductDto로 바뀐다', 'package-private이라 컴파일 단계에서 막힌다'], a: 2,
      why: 'ProductEntity는 catalog.internal 안의 package-private 클래스다. 다른 모듈은 CatalogService와 DTO만 쓸 수 있다.' },
    { q: 'order_lines.product_id에 catalog.products로 가는 외래키를 걸지 않는 이유는 무엇인가?',
      o: ['나중에 schema를 통째로 떼어낼 때 cross-schema FK가 분리를 막아서', 'PostgreSQL이 다른 schema 참조를 지원하지 않아서', '외래키가 있으면 조회가 느려져서'], a: 0,
      why: 'cross-schema FK 한 줄이 서비스 분리를 막는다. 참조는 ID 값으로만 두고 권한으로 한 번 더 막는다.' },
    { q: 'payment 모듈을 별도 서비스로 떼어낼 때 이벤트 코드는 어떻게 바뀌나?',
      o: ['order가 payment를 직접 호출하도록 고친다', 'publishEvent가 kafkaTemplate.send로, 리스너가 @KafkaListener로 바뀐다', '이벤트를 지우고 DB를 공유한다'], a: 1,
      why: '같은 프로세스 안의 이벤트를 Kafka로 1:1로 옮긴다. 모듈 인터페이스는 거의 그대로다.' },
    { q: '새 payment-service로 트래픽을 10% 넘겼는데 오류가 늘었다. 어떻게 하나?',
      o: ['Gateway 비율을 0%로 돌린다', '100%로 올려 문제를 빨리 드러낸다', '모놀리스의 payment 코드를 지운다'], a: 0,
      why: 'Strangler Fig는 1%, 10%, 50%, 100% 순서로 넘기고 문제가 보이면 즉시 0%로 되돌린다.' },
  ];

  const summary = [
    '모듈러 모놀리스는 jar 하나로 배포하되 모듈을 api와 internal로 나눈다.',
    '경계는 Gradle 의존과 ArchUnit 테스트로 빌드 단계에서 막는다.',
    'DB도 schema 4개로 나누고 FK 대신 ID 값만 두며 권한으로 막는다.',
    '모듈 사이는 in-process 이벤트로 잇다가 payment부터 하나씩 떼어낸다.',
  ];
  const review = [
    { q: 'order 모듈 쿼리가 catalog.products와 JOIN하다가 permission denied가 났다. 바른 대응은?',
      o: ['catalog_app 롤에 order 권한을 다시 준다', 'CatalogService 공개 API로 상품 정보를 받는다', 'order schema에 products 사본 테이블을 FK로 건다'], a: 1,
      why: '권한 에러는 경계가 일한다는 뜻이다. 다른 모듈의 데이터는 공개 API나 이벤트로만 받는다.' },
    { q: '떼어낼 첫 모듈을 고른다. 어떤 기준이 맞나?',
      o: ['매출에 가장 중요한 모듈', '코드가 가장 많은 모듈', '경계가 가장 깨끗하게 격리된 모듈'], a: 2,
      why: 'schema와 이벤트 연결이 이미 깔끔하게 나뉜 모듈은 그대로 옮기면 된다. 이 장에서는 payment가 그 예다.' },
    { q: '모듈 경계를 internal 패키지 이름으로만 정하고 검사는 두지 않았다. 반년 뒤 생길 일은?',
      o: ['누군가 internal을 직접 참조해 경계가 사라진다', '배포 단위가 저절로 늘어난다', 'Kafka 토픽이 엉킨다'], a: 0,
      why: '주석이나 패키지 이름만으로는 막지 못한다. Gradle 의존이나 ArchUnit으로 넘지 못하게 강제해야 한다.' },
  ];

  R.page({ title: '모듈 경계 시뮬레이션', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
