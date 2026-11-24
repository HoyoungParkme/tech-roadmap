/* V-2-2 종합: 미니 주문 도메인 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 금액은 페이지 데이터(아메리카노 3,000×2, 카페라떼 4,500, 치즈케이크 6,500)에서 읽었다.
 * 합계 17,000 과 Math.round(17000 * (1 - 0.1)) = 15,300 은 python 으로 같은 계산을 해 확인했다.
 * ArrayList 배열 10칸은 OpenJDK 의 기본 용량(첫 add 때 잡는다)이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const won = (v) => Math.round(v).toLocaleString('en-US') + '원';
  const ITEMS = [['아메리카노', 3000, 2], ['카페라떼', 4500, 1], ['치즈케이크', 6500, 1]];

  // 힙 객체 (머리띠 + 필드 줄)
  function obj(cx, cy, cls, rows, o) { o = o || {}; const w = o.w || 190, h = 34 + rows.length * 26, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.stroke || INK;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 9, fill: o.fill || PANEL, stroke: col, 'stroke-width': o.sw || 2.2 }, g);
    el('path', { d: `M${-w / 2},${-h / 2 + 30} H${w / 2}`, stroke: col, 'stroke-width': 1.5 }, g);
    tx(0, -h / 2 + 21, cls, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }, g);
    rows.forEach((r, i) => { const [s, c] = Array.isArray(r) ? r : [r, null]; mono(-w / 2 + 14, -h / 2 + 52 + i * 26, s, { 'font-size': 14.5, fill: c || INK }, g); });
    return { w, h }; }
  // 왼쪽에서 들어와 관문에서 튕기거나 지나가는 호출
  function attempt(text, x0, xg, y, u, a, ok, o) { o = o || {}; const v = seg(u, a, a + 0.8);
    if (v <= 0) return; const x = ok ? lerp(x0, o.x1 || xg + 160, E(v, 0, 1)) : v < 0.6 ? lerp(x0, xg - 80, E(v / 0.6, 0, 1)) : xg - 80 - (v - 0.6) * 120;
    card(x, y, tw(text, 13.5) + 26, 30, { rx: 15, text, fs: 13.5, mono: true, fw: 700, stroke: ok ? GOOD : BAD, fill: PANEL, color: ok ? GOOD : BAD, op: ok ? 1 : 1 - clamp((v - 0.6) * 1.5) * 0.6 });
    if (!ok && v > 0.6) cross(xg - 20, y, 9, 1); }

  // =========================================================
  // 1. 값 객체 — record Money · Product
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 90, 340, 60, { rx: 10, text: 'record Money(long amount)', fs: 18, mono: true, fw: 800, stroke: ACC, sw: 2.6, s: pop(u, 0.1) });
      [['private final long amount', 150, 220], ['Money(long amount)', 400, 250], ['amount()', 620, 220], ['equals', 250, 330], ['hashCode', 480, 340], ['toString', 710, 330]].forEach(([s, x, y], i) => {
        grow(480, 120, x, y - 18, seg(u, 0.6 + i * 0.2, 0.9 + i * 0.2), GRID, { plain: true });
        pill(x, y, s, i < 3 ? INFO : GOOD, pop(u, 0.8 + i * 0.2), { mono: true, fs: 14.5, fill: PANEL }); });
      tx(480, 400, '선언 한 줄에서 컴파일러가 만들어 주는 것', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const xg = 520;
      el('rect', { x: xg - 14, y: 60, width: 28, height: 300, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2.4 });
      tx(xg, 48, 'compact 생성자 · amount >= 0', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC });
      attempt('new Money(3000)', 120, xg, 150, u, 0.2, true, { x1: 760 });
      attempt('new Money(-100)', 120, xg, 270, u, 1.0, false);
      if (u > 1.0) check(870, 150, 11, pop(u, 1.0));
      if (u > 1.7) mono(xg + 40, 312, 'IllegalArgumentException', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
      tx(480, 400, '잘못된 값은 아예 태어나지 못한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { obj(170, 110, 'Money a', ['amount = 3000'], {});
      obj(170, 250, 'Money b', ['amount = 3000'], { s: pop(u, 0.1) });
      card(450, 180, 150, 50, { rx: 25, text: 'a.plus(b)', fs: 15, mono: true, fw: 800, stroke: ACC, s: pop(u, 0.4) });
      grow(268, 110, 380, 170, seg(u, 0.6, 1.0), MUT); grow(268, 250, 380, 192, seg(u, 0.7, 1.1), MUT);
      grow(528, 180, 640, 180, seg(u, 1.2, 1.6), ACC);
      obj(760, 180, 'new Money', ['amount = 6000'], { s: pop(u, 1.6), stroke: GOOD });
      tx(170, 330, 'a 는 그대로 3000', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) });
      tx(760, 270, '계산은 새 값을 돌려준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { obj(260, 190, 'record Product', ['name  = "아메리카노"', 'price = ●'], { w: 260, s: pop(u, 0.2) });
      obj(680, 190, 'record Money', ['amount = 3000'], { s: pop(u, 0.6) });
      grow(250, 220, 584, 196, seg(u, 0.9, 1.6), INFO, { sw: 2.4 });
      tx(260, 300, 'name 이 비거나 null 이면 생성 거부', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) });
      tx(480, 370, '값 객체 안의 값 객체 · 둘 다 불변이라 함께 써도 안전하다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k === 4: 값이 같으면 같은 객체
    obj(150, 120, 'Money a', ['amount = 3000'], {}); obj(150, 250, 'Money b', ['amount = 3000'], {});
    pill(420, 120, 'a.equals(b) = true', GOOD, pop(u, 0.2), { mono: true, fs: 15, fill: PANEL });
    pill(420, 172, 'a.plus(b) = Money[amount=6000]', ACC, pop(u, 0.6), { mono: true, fs: 14.5, fill: PANEL });
    zone(620, 70, 300, 230, 'HashSet<Money>', { fill: INFOBG, color: INFO, op: fade(u, 1.0) });
    dot([[230, 120], [620, 160], [770, 180]], seg(u, 1.1, 1.6), INFO, 7); dot([[230, 250], [620, 220], [770, 190]], seg(u, 1.5, 2.0), INFO, 7);
    if (u > 1.6) card(770, 185, 180, 44, { rx: 8, text: 'Money(3000)', fs: 15, mono: true, stroke: INFO });
    mono(770, 270, 'set.size() = ' + (u > 2.0 ? 1 : u > 1.6 ? 1 : 0), { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
    tx(480, 370, 'record 의 equals·hashCode 가 필드 값으로 비교해 Set·Map 키로 안전하다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // =========================================================
  // 2. 엔티티 OrderItem — 생성자 관문과 private 필드
  // =========================================================
  function fort(o) { o = o || {};
    el('rect', { x: 500, y: 60, width: 400, height: 250, rx: 14, fill: PANEL, stroke: INK, 'stroke-width': 2.6 });
    tx(700, 88, 'class OrderItem', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    [['product', o.p || '—', 140], ['quantity', o.q || '—', 196]].forEach(([n, v, y]) => {
      el('rect', { x: 560, y: y - 20, width: 300, height: 40, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      lock(590, y + 2, true, INK, 0.7); mono(616, y + 5, 'private final ' + n, { 'font-size': 14 }); mono(848, y + 5, v, { 'font-size': 14, 'text-anchor': 'end', 'font-weight': 800, fill: v === '—' ? MUT : GOOD }); }); }
  function gates(n, u, k) { const G_ = [['product != null', 240], ['quantity >= 1', 380]];
    G_.slice(0, n).forEach(([s, x], i) => { const sc = k === 6 + i - 5 ? pop(u, 0.2) : 1;
      el('rect', { x: x - 10, y: 110, width: 20, height: 170, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2, opacity: sc });
      mono(x, 300, s, { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: sc }); }); }
  function s2(t, c) { const { k, u } = c;
    const filled = k >= 3 && !(k === 3 && u < 1.6);
    fort({ p: filled ? 'coffee' : '—', q: filled ? '2' : '—' });
    if (k === 0) { const v = seg(u, 0.6, 1.4); card(lerp(120, 420, E(v, 0, 1)), 360, 220, 32, { rx: 16, text: 'item.quantity = -5', fs: 13.5, mono: true, stroke: BAD, color: BAD, op: v > 0 ? 1 : 0 });
      if (v >= 1) { cross(540, 360, 10, 1); tx(560, 366, '밖에서는 필드에 닿을 통로가 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD }); }
      el('rect', { x: 490, y: 160, width: 20, height: 60, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.6) });
      tx(470, 150, '들어오는 길은 생성자뿐', { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); return; }
    gates(k === 1 ? 1 : 2, u, k);
    if (k === 1) attempt('OrderItem(null, 2)', 120, 240, 190, u, 0.6, false);
    if (k === 2) attempt('OrderItem(coffee, 0)', 120, 380, 190, u, 0.6, false);
    if (k === 1 || k === 2) { if (u > 1.6) mono(40, 250, 'InvalidOrderException', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { attempt('OrderItem(coffee, 2)', 120, 380, 190, u, 0.3, true, { x1: 420 }); if (u > 1.2) grow(500, 190, 556, 168, seg(u, 1.2, 1.6), GOOD);
      tx(700, 270, filled ? '두 관문을 다 지난 뒤에만 대입 · 반쯤 만든 객체가 없다' : '', { 'text-anchor': 'middle', 'font-size': 14, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 4) { // 읽기만 공개
      grow(700, 312, 700, 356, seg(u, 0.3, 0.7), GOOD);
      pill(700, 372, 'subtotal() = 3,000 × 2 = 6,000원', GOOD, pop(u, 0.7), { fs: 14.5, fill: PANEL });
      pill(310, 360, 'product() · quantity()', INFO, pop(u, 1.2), { mono: true, fs: 14, fill: PANEL });
      card(110, 200, 170, 36, { rx: 18, text: 'setQuantity()', fs: 14, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.6) }); cross(110, 200, 16, pop(u, 1.9));
      sub(110, 250, '게터만 열고 세터는 없다', fade(u, 2.1), { 'font-size': 14.5, fill: INK }); return; }
    // k === 5: 도메인 예외
    terminal(60, 316, 840, 96, ['> new OrderItem(coffee, 0)', ['InvalidOrderException: 수량은 1개 이상: 0', 'var(--bad)']], clamp(u * 1.4, 0, 2), { lh: 22, fs: 14 });
    sub(700, 44, '예외 이름이 곧 설명이다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 3. Order — ArrayList 배열 · 읽기 전용 뷰 · 상품별 HashMap
  // =========================================================
  const AX = 300, AW = 58;
  function arr(n, o) { o = o || {}; for (let i = 0; i < 10; i++) { const on = i < n, x = AX + i * (AW + 4);
      el('rect', { x, y: 170, width: AW, height: 56, rx: 5, fill: on ? ACCBG : PANEL, stroke: on ? ACC : GRID, 'stroke-width': on ? 2.2 : 1.4 });
      mono(x + AW / 2, 242, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
      if (on) { const [nm, p, q] = ITEMS[i]; mono(x + AW / 2, 194, 'item', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 800 }); mono(x + AW / 2, 214, '×' + q, { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC }); } }
    if (n > 0) tx(AX, 274, ITEMS.slice(0, n).map(([nm, p, q], i) => i + ': ' + nm + ' ' + won(p * q)).join('   '), { 'font-size': 14, fill: INK, 'font-weight': 600 });
    tx(AX, 160, 'ArrayList.elementData (OpenJDK 기본 10칸)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (o.view) { el('rect', { x: AX - 12, y: 140, width: 10 * (AW + 4) + 20, height: 120, rx: 12, fill: 'none', stroke: INFO, 'stroke-width': 2.4, 'stroke-dasharray': '7 5', opacity: o.view });
      tx(AX + 10 * (AW + 4) + 4, 132, 'unmodifiableList 뷰', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: o.view }); } }
  function s3(t, c) { const { k, u } = c;
    const n = k < 4 ? 0 : k === 4 ? (u > 1.2 ? 1 : 0) : 1 + (u > 0.6 ? 1 : 0) + (u > 1.1 ? 1 : 0);
    obj(140, 120, k >= 4 ? 'Order #1001' : 'Order', ['id', 'items ●'], { w: 170 });
    grow(196, 148, AX - 14, 196, 1, INFO, { sw: 2.2 });
    if (k !== 3) arr(n, { view: k === 2 ? fade(u, 0.4) : k >= 4 ? 0.5 : 0 });
    if (k === 0) { pill(480, 300, 'List<OrderItem>', ACC, pop(u, 0.2), { mono: true, fs: 15, fill: PANEL });
      const v = seg(u, 0.9, 1.6); card(lerp(60, 330, E(v, 0, 1)), 360, 220, 32, { rx: 16, text: 'items.add("문자열")', fs: 13.5, mono: true, stroke: BAD, color: BAD, op: v > 0 ? 1 : 0 });
      if (v >= 1) { cross(460, 360, 10, 1); tx(480, 366, '컴파일 에러 · 제네릭이 막는다', { 'font-size': 15, 'font-weight': 700, fill: BAD }); } return; }
    if (k === 1) { card(140, 330, 210, 48, { rx: 24, text: 'addItem(product, qty)', fs: 14, mono: true, stroke: GOOD, s: pop(u, 0.2) });
      dot([[245, 330], [420, 330], [420, 260], [AX + 29, 228]], seg(u, 0.7, 1.7), GOOD, 7);
      tx(440, 320, 'new OrderItem(...) 의 검증을 거쳐서만 들어간다', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.5) }); return; }
    if (k === 2) { const v = seg(u, 1.0, 1.7); card(lerp(60, 230, E(v, 0, 1)), 340, 210, 32, { rx: 16, text: 'order.items().clear()', fs: 13.5, mono: true, stroke: BAD, color: BAD, op: v > 0 ? 1 : 0 });
      if (v >= 1) { cross(350, 340, 10, 1); mono(370, 346, 'UnsupportedOperationException', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }
      sub(480, 390, '복사본이 아니라 원본을 감싼 읽기 전용 뷰', fade(u, 2.0), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3) { // countByProduct: HashMap<Product, Integer>
      tx(300, 60, 'countByProduct() · HashMap<Product, Integer>', { 'font-size': 15, 'font-weight': 800 });
      const rows = [['Product(아메리카노)', 2], ['Product(카페라떼)', 1], ['Product(치즈케이크)', 1]];
      rows.forEach(([kk, v], i) => { const y = 120 + i * 62, s = pop(u, 0.3 + i * 0.4);
        card(470, y, 260, 46, { rx: 8, text: kk, fs: 14, mono: true, stroke: ACC, s }); grow(602, y, 660, y, seg(u, 0.5 + i * 0.4, 0.8 + i * 0.4), MUT);
        card(710, y, 80, 46, { rx: 8, text: String(v), fs: 17, mono: true, fw: 800, stroke: INFO, s }); });
      tx(560, 340, 'merge(product, qty, Integer::sum) 로 같은 키는 합친다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(560, 370, 'record 의 equals·hashCode 덕에 같은 상품이 같은 키가 된다 (수량은 담은 뒤 예)', fade(u, 2.1)); return; }
    if (k === 4) { pill(480, 320, 'addItem(아메리카노, 2) · 6,000원', ACC, pop(u, 0.3), { fs: 15, fill: PANEL });
      dot([[480, 300], [AX + 29, 228]], seg(u, 0.6, 1.2), ACC, 7); return; }
    // k === 5
    pill(480, 318, '카페라떼 4,500원 · 치즈케이크 6,500원 추가', ACC, pop(u, 0.2), { fs: 14.5, fill: PANEL });
    const v = seg(u, 1.4, 2.0); card(lerp(60, 230, E(v, 0, 1)), 360, 190, 32, { rx: 16, text: 'items().add(x)', fs: 13.5, mono: true, stroke: BAD, color: BAD, op: v > 0 ? 1 : 0 });
    if (v >= 1) { cross(340, 360, 10, 1); mono(360, 366, 'UnsupportedOperationException', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); } }

  // =========================================================
  // 4. 합계 · 할인 · Optional — Stream 과 다형성
  // =========================================================
  function policy(x, y, name, calc, res, s, col) { card(x, y, 250, 84, { rx: 10, stroke: col || GOOD, sw: 2.2, s }); if (s < 0.6) return;
    mono(x, y - 18, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col || GOOD }); mono(x, y + 6, calc, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
    mono(x, y + 30, res, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) { card(480, 70, 320, 64, { rx: 10, stroke: INFO, sw: 2.4, dash: '6 5', s: k === 0 ? pop(u, 0.2) : 1 });
      tx(480, 62, 'interface DiscountPolicy', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO }); mono(480, 86, 'Money applyTo(Money total)', { 'text-anchor': 'middle', 'font-size': 14 });
      if (k === 0) { tx(480, 200, 'Order 는 이 약속만 안다 · 구현체는 모른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
      grow(400, 104, 260, 190, k === 1 ? seg(u, 0.2, 0.7) : 1, INFO, { dash: '5 5' });
      policy(260, 240, 'RateDiscount(0.1)', 'round(17000 × 0.9)', '15,300원', k === 1 ? pop(u, 0.6) : 1);
      if (k === 2) { grow(560, 104, 700, 190, seg(u, 0.2, 0.7), INFO, { dash: '5 5' }); policy(700, 240, 'NoDiscount()', 'return total', '17,000원', pop(u, 0.6), WARN);
        tx(480, 370, '"할인 없음"도 객체 · 호출부의 if 가 사라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
      return; }
    if (k === 3) { // Stream: map → reduce
      const xs = [120, 360, 600, 840], heads = ['items.stream()', '.map(subtotal)', '.reduce(plus)', 'total()'];
      heads.forEach((h, i) => { mono(xs[i], 60, h, { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 800, fill: i === 3 ? GOOD : INFO }); if (i) grow(xs[i - 1] + 70, 60, xs[i] - 78, 60, 1, MUT); });
      let acc = 0;
      ITEMS.forEach(([nm, p, q], i) => { const st = 0.2 + i * 0.6, y = 140 + i * 70, v = seg(u, st, st + 0.5), sub_ = p * q;
        card(xs[0], y, 170, 42, { rx: 8, text: nm + ' ×' + q, fs: 14, s: pop(u, 0.1 + i * 0.2) });
        if (v > 0) card(lerp(xs[0] + 150, xs[1], E(v, 0, 1)), y, 130, 42, { rx: 21, text: won(sub_), fs: 14.5, mono: true, fw: 800, stroke: ACC, fill: ACCBG });
        const w = seg(u, st + 0.5, st + 0.8); if (w > 0) dot([[xs[1] + 66, y], [xs[2] - 60, 210]], w < 1 ? w : 0, ACC, 6);
        if (w >= 1) acc += sub_; });
      card(xs[2], 210, 140, 60, { rx: 10, stroke: INFO, sw: 2.2 }); mono(xs[2], 202, 'Money(0) 부터', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); mono(xs[2], 226, won(acc), { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 800 });
      if (u > 2.1) pill(xs[3], 210, won(17000), GOOD, pop(u, 2.1), { mono: true, fs: 17, fill: PANEL });
      return; }
    if (k === 4) { card(480, 60, 360, 50, { rx: 10, text: 'totalWith(policy) = policy.applyTo(total())', fs: 14.5, mono: true, stroke: INK });
      [['RateDiscount(0.1)', '17000 × 0.9', '15,300원', GOOD], ['FixedDiscount(2000)', '17000 − 2000', '15,000원', GOOD], ['NoDiscount()', '그대로', '17,000원', WARN]].forEach(([a, b, r, col], i) => {
        grow(480, 86, 180 + i * 300, 190, seg(u, 0.2 + i * 0.4, 0.6 + i * 0.4), MUT); policy(180 + i * 300, 240, a, b, r, pop(u, 0.5 + i * 0.4), col); });
      tx(480, 360, '새 정책을 더해도 Order 코드는 한 줄도 안 바뀐다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.9) });
      sub(480, 388, 'FixedDiscount 는 코드에 없는, 더할 수 있는 예', fade(u, 2.1)); return; }
    if (k === 5) { // Optional
      ITEMS.forEach(([nm, p, q], i) => { const y = 110 + i * 62, best = i === 2; card(170, y, 220, 44, { rx: 8, text: nm + ' ' + won(p * q), fs: 14.5, stroke: best && u > 1.0 ? GOOD : INK }); });
      mono(400, 110, '.max(소계 기준)', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.4) });
      el('rect', { x: 560, y: 120, width: 300, height: 120, rx: 16, fill: 'none', stroke: INFO, 'stroke-width': 2.6, 'stroke-dasharray': '8 5', opacity: fade(u, 0.6) });
      tx(574, 112, 'Optional<OrderItem>', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, class: 'mono', opacity: fade(u, 0.6) });
      const v = seg(u, 1.0, 1.7); if (v > 0) card(lerp(170, 710, E(v, 0, 1)), lerp(234, 180, E(v, 0, 1)), 220, 44, { rx: 8, text: '치즈케이크 ' + won(6500), fs: 14.5, stroke: GOOD, fill: GOODBG });
      card(710, 320, 300, 50, { rx: 10, text: '빈 주문 → Optional.empty()', fs: 14.5, mono: true, stroke: MUT, color: MUT, s: pop(u, 2.0) });
      tx(250, 330, 'null 대신 "없을 수 있음"을 타입으로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k === 6 실행 결과
    terminal(120, 70, 720, 180, ['> order.total()', 'Money[amount=17000]', '> order.totalWith(new RateDiscount(0.1))', 'Money[amount=15300]', '> order.mostExpensiveItem()', '치즈케이크 ×1 이 든 Optional'], clamp(u * 2.6, 0, 6), { lh: 22, fs: 14.5 });
    [['합계', won(17000), INK], ['10% 할인', won(15300), GOOD], ['최고가', '치즈케이크', INFO]].forEach(([a, b, col], i) => { const s = pop(u, 1.6 + i * 0.3);
      card(240 + i * 240, 330, 200, 64, { rx: 10, stroke: col, sw: 2, s }); if (s > 0.6) { tx(240 + i * 240, 320, a, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); mono(240 + i * 240, 346, b, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col }); } }); }

  // =========================================================
  // 5. sealed OrderStatus — 허용된 전이만
  // =========================================================
  const S = { Pending: [150, 150], Paid: [400, 150], Shipped: [650, 150], Cancelled: [400, 320] };
  const LB = { Pending: '결제 대기', Paid: '결제 완료', Shipped: '배송 중', Cancelled: '취소됨' };
  function states(sc, cur) { Object.keys(S).forEach((n, i) => { const [x, y] = S[n], s = sc(i); if (s <= 0) return;
      card(x, y, 170, 64, { rx: 12, stroke: cur === n ? ACC : n === 'Cancelled' ? BAD : INK, sw: cur === n ? 3.2 : 2, fill: cur === n ? ACCBG : PANEL, s });
      if (s > 0.6) { mono(x, y - 4, n, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }); tx(x, y + 18, LB[n], { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } }); }
  function edge(a, b, u, col, label, o) { o = o || {}; const [x1, y1] = S[a], [x2, y2] = S[b], horiz = y1 === y2;
    const p1 = horiz ? [x1 + 88, y1] : [x1 + (x2 - x1) * 0.2, y1 + 34], p2 = horiz ? [x2 - 88, y2] : [x2 + (x1 - x2) * 0.25, y2 - 34];
    grow(p1[0], p1[1], p2[0], p2[1], u, col, { sw: 2.6, dash: o.dash });
    if (u >= 1 && label) mono((p1[0] + p2[0]) / 2 + (o.dx || 0), (p1[1] + p2[1]) / 2 + (o.dy ?? -10), label, { 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700 });
    if (o.x && u >= 1) cross((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, 10, 1); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 90, 520, 70, { rx: 12, stroke: INFO, sw: 2.6, s: pop(u, 0.2) });
      if (u > 0.4) { mono(480, 82, 'sealed interface OrderStatus', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: INFO }); mono(480, 106, 'permits Pending, Paid, Shipped, Cancelled', { 'text-anchor': 'middle', 'font-size': 14.5 }); }
      ['Pending', 'Paid', 'Shipped', 'Cancelled'].forEach((n, i) => { el('rect', { x: 150 + i * 170, y: 190, width: 150, height: 50, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.8 + i * 0.2) });
        mono(225 + i * 170, 220, n, { 'text-anchor': 'middle', 'font-size': 14.5, fill: INFO, opacity: fade(u, 0.8 + i * 0.2) }); });
      const v = seg(u, 1.6, 2.2); card(lerp(60, 330, E(v, 0, 1)), 320, 120, 34, { rx: 17, text: '"PAiD"', fs: 14.5, mono: true, stroke: BAD, color: BAD, op: v > 0 ? 1 : 0 });
      if (v >= 1) { cross(410, 320, 10, 1); tx(430, 326, '허용 목록 밖은 존재할 수 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD }); } return; }
    const cur = k <= 2 ? 'Pending' : k === 3 ? (u < 1.2 ? 'Pending' : 'Paid') : k === 6 ? (u < 0.6 ? 'Paid' : 'Shipped') : 'Pending';
    states((i) => (k === 1 ? pop(u, 0.2 + i * 0.3) : 1), k >= 2 ? cur : null);
    if (k === 1) { tx(480, 400, '네 상태가 필드 없는 record 로 존재한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { pill(150, 64, 'status = new Pending()', ACC, pop(u, 0.3), { mono: true, fs: 14, fill: PANEL }); tx(480, 400, '태어날 때 결제 대기 · status 는 private 이라 메서드로만 바뀐다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    edge('Pending', 'Paid', k === 3 ? seg(u, 0.3, 1.0) : 1, GOOD, 'pay()');
    if (k === 3) { [['Paid', 0], ['Shipped', 1]].forEach(([n, i]) => { if (u > 1.6 + i * 0.3) { const [x, y] = S[n]; tx(x, y + 58, 'pay() 불가', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, 'font-weight': 700 }); } });
      tx(480, 400, 'Pending 이 아니면 InvalidOrderException', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k >= 6) edge('Paid', 'Shipped', seg(u, 0.1, 0.6), GOOD, 'ship()');
    if (k === 4 || k === 5) { edge('Pending', 'Cancelled', k === 4 ? seg(u, 0.3, 0.9) : 1, GOOD, 'cancel()', { dash: '6 5', dx: -40, dy: 0 }); edge('Paid', 'Cancelled', k === 4 ? seg(u, 0.8, 1.4) : 1, GOOD, '', { dash: '6 5' });
      if (k === 4) { R.snippet(700, 230, ['switch (status) {', '  case Pending p -> ...', '  case Paid p    -> ...', '  case Shipped s -> throw', '  case Cancelled c -> throw', '}'].slice(0, Math.ceil(clamp(u * 2.4) * 6)), { fs: 13.5, w: 250 });
        tx(480, 410, 'case 하나를 빠뜨리면 컴파일 에러 · default 를 두지 않는다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.2) }); } }
    if (k === 5) { edge('Shipped', 'Cancelled', seg(u, 0.3, 1.0), BAD, '', { dash: '4 5', x: true });
      tx(720, 300, '배송 후 취소 불가', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
      tx(720, 324, '이미 취소된 주문도 재취소 불가', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
      tx(480, 400, '규칙 위반은 조용히 넘기지 않고 도메인 예외로 드러낸다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 6) { edge('Shipped', 'Cancelled', seg(u, 1.0, 1.6), BAD, '', { dash: '4 5', x: true });
      if (u > 1.7) mono(560, 396, 'cancel() → InvalidOrderException: 배송 후 취소 불가', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle' });
      sub(700, 260, 'pay → ship 은 지나간다', fade(u, 0.8), { 'font-size': 14.5, fill: GOOD, 'font-weight': 700 }); } }

  const quiz = [
    { q: 'record Money의 compact 생성자에 amount < 0 검사를 둔 효과는 무엇인가?',
      o: ['음수 금액은 Money 객체로 만들어질 수 없다', '음수 금액을 0으로 바꿔 준다', '계산할 때마다 음수인지 다시 확인한다'], a: 0,
      why: '생성자에서 예외를 던지면 객체 자체가 만들어지지 않는다. Money(-100)은 IllegalArgumentException으로 끝난다.' },
    { q: 'OrderItem(coffee, 0)을 만들면 어떻게 되는가?',
      o: ['수량 0인 항목이 만들어진다', '수량이 1로 바뀌어 만들어진다', 'InvalidOrderException이 나고 객체가 없다'], a: 2,
      why: '"수량은 1개 이상"은 생성자가 지키는 불변식이다. 통과하지 못하면 필드에 값이 들어가지도 않는다.' },
    { q: 'order.items()가 돌려주는 리스트에 add를 하면 무엇이 일어나는가?',
      o: ['UnsupportedOperationException이 난다', '주문에 항목이 추가된다', '복사본에만 추가되고 원본은 그대로다'], a: 0,
      why: 'unmodifiableList는 원본을 감싼 읽기 전용 뷰다. 바꾸는 메서드는 모두 예외를 던지고, 추가는 addItem으로만 한다.' },
    { q: 'total()이 17,000원일 때 RateDiscount(0.1)의 결과는 무엇인가?',
      o: ['15,000원', '15,300원', '17,000원'], a: 1,
      why: 'Math.round(17000 × 0.9) = 15,300이다. 15,000원은 FixedDiscount(2000)의 결과다.' },
    { q: 'Shipped 상태에서 cancel()을 부르면 어떻게 되는가?',
      o: ['Cancelled로 바뀐다', '아무 일도 일어나지 않는다', 'InvalidOrderException이 난다'], a: 2,
      why: 'switch의 case Shipped가 예외를 던진다. 허용되지 않은 전이를 조용히 무시하지 않고 드러낸다.' },
  ];
  const summary = [
    'Money와 Product는 값이 곧 정체성이라 record로 두고 생성자에서 검증한다.',
    'OrderItem은 필드를 private으로 감추고 수량 1개 이상을 생성자가 지킨다.',
    'Order는 addItem으로만 담고 items()는 읽기 전용 뷰로 내보낸다.',
    '합계 17,000원은 Stream으로, 할인은 정책 객체로, 상태는 sealed로 묶는다.',
  ];
  const review = [
    { q: '할인 정책을 하나 더 붙이려는데 Order의 if 문을 고쳐야 한다고 한다. 어떤 설계로 바꾸면 되나?',
      o: ['DiscountPolicy를 구현한 새 record를 만들어 넘긴다', 'Order에 할인 종류 문자열 필드를 둔다', 'total()에 switch를 하나 더 넣는다'], a: 0,
      why: 'Order는 policy.applyTo(total())만 부른다. 새 정책은 구현체 하나로 끝나고 Order는 그대로다.' },
    { q: '주문 상태를 String으로 두었더니 "PAiD" 같은 값이 DB에 들어갔다. 가장 알맞은 고침은 무엇인가?',
      o: ['문자열을 대문자로 바꿔 저장한다', '상태를 sealed 인터페이스와 record로 바꾼다', '저장 전에 로그를 남긴다'], a: 1,
      why: 'sealed는 permits에 적은 네 상태만 존재하게 한다. 없는 상태는 컴파일 단계에서 만들 수 없다.' },
    { q: '빈 주문에서 mostExpensiveItem().get()을 불러 예외가 났다. 호출부를 어떻게 바꿔야 하나?',
      o: ['get() 앞에 Thread.sleep을 넣는다', 'mostExpensiveItem이 null을 돌려주게 바꾼다', 'isPresent나 orElse로 비어 있는 경우를 먼저 다룬다'], a: 2,
      why: '빈 주문이면 Optional.empty()가 돌아온다. Optional은 "없을 수 있음"을 다루라고 알려 주는 타입이다.' },
  ];

  R.page({ title: '값 객체 · 컬렉션 · 상태 전이', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
