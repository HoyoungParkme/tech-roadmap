/* III-1-2 컬렉션 프레임워크 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 위 = 인터페이스 계층(점선 = 약속, 실선 = 구현체), 아래 = 스택 변수와 힙 객체.
 * 버킷 번호는 String.hashCode 와 HashMap.hash( (h ^ h>>>16) & (n-1) ) 를 python 으로 같은 식으로 계산한 값이다
 *   kim 106191 → 14, lee 107020 → 13, park 3433450 → 14, A/B/C 65/66/67 → 1/2/3 (버킷 16칸). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const ph = (c, k0, a, b) => (c.k > k0 ? 1 : c.k < k0 ? 0 : E(c.u, a, b));
  const pk = (c, k0, a) => (c.k > k0 ? 1 : c.k < k0 ? 0 : pop(c.u, a));

  function slot(x, y, name, o) { o = o || {}; const w = o.w || 190;
    card(x + w / 2, y, w, 38, { rx: 8, stroke: INK, sw: 2, s: o.s, op: o.op });
    if ((o.s ?? 1) > 0.3) { mono(x + 12, y + 5, name, { 'font-size': 14, 'font-weight': 700, opacity: o.op ?? 1 }); el('circle', { cx: x + w - 14, cy: y, r: 5, fill: o.dot || ACC, opacity: o.op ?? 1 }); }
    return [x + w - 14, y]; }
  const ref = (a, b, u, col) => grow(a[0] + 6, a[1], b[0] - 4, b[1], u, col || ACC, { sw: 2.3 });
  // 인터페이스 노드(점선)와 구현 이름
  function iface(cx, cy, name, impl, s, o) { o = o || {};
    card(cx, cy, tw(name, 15) + 34, 36, { rx: 18, stroke: o.col || INFO, sw: 2, dash: '6 4', fill: INFOBG, text: name, fs: 15, fw: 800, color: o.col || INFO, s, mono: true });
    if (impl && s > 0.5) mono(cx, cy + 38, impl, { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK, opacity: o.iop ?? 1 }); }
  // 한 줄 배열 객체 (ArrayList 내부 Object[])
  function arrObj(x, y, name, vals, o) { o = o || {}; const w = o.w || 62;
    tx(x, y - 8, name, { 'font-size': 14, 'font-weight': 700, fill: o.col || ACC, opacity: o.op ?? 1 });
    vals.forEach((v, i) => { const st = (o.style && o.style(i)) || {};
      card(x + i * (w + 4) + w / 2, y + 20, w, 40, { rx: 5, stroke: st.stroke || (o.col || ACC), sw: 2, fill: st.fill || PANEL, s: st.s, op: (o.op ?? 1) * (st.op ?? 1), text: v, fs: 15, mono: true, color: st.color || INK, dash: st.dash }); });
    return (i) => x + i * (w + 4) + w / 2; }
  // 노드 체인 (LinkedList): 노드마다 값 + 앞뒤 화살표
  function nodes(x, y, vals, o) { o = o || {}; const w = o.w || 62, gap = o.gap || 42;
    vals.forEach((v, i) => { const s = o.s ? o.s(i) : 1; if (s <= 0) return; const cx = x + i * (w + gap) + w / 2;
      card(cx, y + 20, w, 40, { rx: 20, stroke: o.col || WARN, sw: 2, text: v, fs: 15, mono: true, s, op: o.op });
      if (i > 0 && s > 0.9) { const x0 = cx - w / 2 - gap; el('line', { x1: x0 + 4, y1: y + 13, x2: cx - w / 2 - 4, y2: y + 13, stroke: o.col || WARN, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)', opacity: o.op ?? 1 });
        el('line', { x1: cx - w / 2 - 4, y1: y + 27, x2: x0 + 4, y2: y + 27, stroke: OFF, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)', opacity: o.op ?? 1 }); } });
    return (i) => x + i * (w + gap) + w / 2; }

  // ---------- 1. 계층 ----------
  function s1(t, c) { const { k, u } = c;
    const top = [[300, 52, 'Collection<E>'], [130, 136, 'List', 'ArrayList · LinkedList'], [310, 136, 'Set', 'HashSet · TreeSet'], [490, 136, 'Queue', 'ArrayDeque · LinkedList']];
    iface(300, 52, 'Collection<E>', null, pk(c, 0, 0.1));
    grow(300, 70, 130, 118, ph(c, 0, 0.3, 0.7), INFO, { plain: true });
    iface(130, 136, 'List', 'ArrayList · LinkedList', pk(c, 0, 0.5));
    if (k >= 3) { grow(300, 70, 310, 118, ph(c, 3, 0.2, 0.6), INFO, { plain: true }); iface(310, 136, 'Set', 'HashSet · TreeSet', pk(c, 3, 0.4)); }
    if (k >= 5) { grow(300, 70, 490, 118, ph(c, 5, 0.2, 0.6), INFO, { plain: true }); iface(490, 136, 'Queue', 'ArrayDeque · LinkedList', pk(c, 5, 0.4)); }
    if (k >= 4) { iface(780, 52, 'Map<K,V>', null, pk(c, 4, 0.2), { col: WARN });
      iface(780, 136, 'Map', 'HashMap · TreeMap …', pk(c, 4, 0.5), { col: WARN }); grow(780, 70, 780, 118, ph(c, 4, 0.5, 0.8), WARN, { plain: true });
      el('line', { x1: 412, y1: 52, x2: 690, y2: 52, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 6', opacity: ph(c, 4, 0.9, 1.3) }); cross(551, 52, 8, pk(c, 4, 1.1));
      sub(551, 84, 'Collection 을 상속하지 않는다', ph(c, 4, 1.2, 1.6), { fill: BAD, 'font-weight': 700 }); }
    // 아래: 스택 변수와 힙 객체
    zone(30, 214, 220, 196, '스택'); zone(270, 214, k >= 5 ? 450 : 660, 196, '힙');
    const np = slot(44, 258, 'List<String> names', { s: pk(c, 0, 0.6) });
    // ArrayList ↔ LinkedList 교체 (k = 2)
    const sw = k < 2 ? 0 : k === 2 ? E(u, 0.4, 1.4) : 1;
    const vals = k === 0 ? ['', ''] : ['"kim"', '"lee"'];
    if (sw < 1) { arrObj(330, 240 + 60 * sw, 'ArrayList', vals, { w: 74, op: 1 - sw, style: (i) => (k === 1 ? { s: pop(u, 0.4 + i * 0.5) } : k === 0 ? { stroke: GRID } : {}) }); }
    if (sw > 0) nodes(330, 240 - 40 * (1 - sw), ['"kim"', '"lee"'], { w: 74, gap: 30, op: sw, col: ACC });
    ref(np, [326, 260], ph(c, 0, 0.9, 1.4), ACC);
    if (k === 0) sub(470, 316, '선언은 List, new 는 ArrayList', fade(u, 1.6), { fill: INK, 'font-weight': 700 });
    if (k === 1) pill(560, 260, 'names.add(…)', INFO, pop(u, 0.2), { mono: true, fs: 14 });
    if (k === 2) { pill(640, 250, 'new LinkedList<>()', ACC, pop(u, 0.2), { mono: true, fs: 14 });
      [['names.add("kim")', 0], ['System.out.println(names)', 1]].forEach(([s, i]) => { mono(530, 316 + i * 26, s, { 'font-size': 14, opacity: fade(u, 1.5 + i * 0.2) }); check(512, 311 + i * 26, 7, pop(u, 1.6 + i * 0.2)); });
      sub(800, 330, '호출부는 그대로', fade(u, 2.0), { fill: GOOD, 'font-weight': 700 }); }
    if (k >= 3) { const up = slot(44, 312, 'Set<String> unique', { s: pk(c, 3, 0.6) });
      card(400, 312, 110, 34, { rx: 8, stroke: ACC, sw: 2, text: 'HashSet', fs: 14, fw: 700, color: ACC, mono: true, s: pk(c, 3, 0.8) }); ref(up, [345, 312], ph(c, 3, 1.0, 1.4), ACC); }
    if (k >= 4) { const ap = slot(44, 366, 'Map ages', { s: pk(c, 4, 1.4) });
      card(430, 366, 170, 34, { rx: 8, stroke: WARN, sw: 2, text: 'HashMap {kim=30}', fs: 14, fw: 700, color: WARN, mono: true, s: pk(c, 4, 1.6) }); ref(ap, [345, 366], ph(c, 4, 1.8, 2.2), WARN);
      if (k === 4) { pill(620, 330, 'ages.add(…)', BAD, pop(u, 2.0), { mono: true, fs: 13.5 }); cross(620, 330, 18, pop(u, 2.2) * 0.9); pill(620, 370, 'ages.put("kim", 30)', GOOD, pop(u, 2.3), { mono: true, fs: 13.5 }); } }
    if (k === 5) terminal(736, 214, 206, 196, ['> println(names)', '[kim, lee]', '> println(ages)', '{kim=30}'], lerp(0, 4, E(u, 0.8, 2.0)), { title: '출력', fs: 14 });
  }

  // ---------- 2. ArrayList vs LinkedList ----------
  function s2(t, c) { const { k, u } = c;
    const opA = k >= 3 && k <= 5 ? 0.4 : 1;
    zone(30, 26, 900, 172, 'ArrayList · 연속된 배열 칸', { op: 1 }); zone(30, 212, 900, 196, 'LinkedList · 흩어진 노드', { op: k >= 3 ? 1 : 0.5 });
    if (k <= 2) { // [10, 20, 30] → get(2) → add(1, 99)
      const ins = k === 2 ? E(u, 0.3, 1.3) : 0, drop = k === 2 ? E(u, 1.4, 2.0) : 0;
      const base = ['10', '20', '30'], w = 70;
      const X = (i) => 80 + i * 74 + w / 2;
      base.forEach((v, i) => { const shift = i >= 1 ? ins : 0, s = k === 0 ? pop(u, 0.3 + i * 0.3) : 1, hit = k === 1 && i === 2 && u > 1.0;
        card(lerp(X(i), X(i + 1), shift), 100, w, 44, { rx: 5, stroke: hit ? ACC : INK, sw: hit ? 3 : 2, fill: hit ? ACCBG : PANEL, text: v, fs: 16, mono: true, s }); });
      if (k === 2) { card(lerp(430, X(1), drop), lerp(100, 100, drop), w, 44, { rx: 5, stroke: ACC, sw: 2.5, fill: ACCBG, text: '99', fs: 16, mono: true, op: drop > 0 ? 1 : 0 });
        [2, 1].forEach((i, j) => grow(X(i) + 16, 140, X(i + 1) - 16, 140, E(u, 0.3 + j * 0.3, 0.8 + j * 0.3), WARN));
        pill(640, 70, 'arr.add(1, 99)', ACC, pop(u, 0.1), { mono: true, fs: 14 });
        mono(560, 120, '20·30 을 한 칸씩 뒤로 복사 → O(n)', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) });
        mono(560, 150, '=> [10, 99, 20, 30]', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) }); }
      for (let i = 0; i < (k === 2 && drop > 0.5 ? 4 : 3); i++) mono(X(i), 142 + 20, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 2 ? 0 : 1 });
      if (k === 0) { pill(640, 70, 'new ArrayList<>(List.of(10, 20, 30))', ACC, pop(u, 0.1), { mono: true, fs: 13.5 }); sub(640, 130, '내부는 Object[] 하나', fade(u, 1.4), { fill: INK, 'font-weight': 700 }); }
      if (k === 1) { pill(640, 70, 'arr.get(2)', ACC, pop(u, 0.1), { mono: true, fs: 14 });
        el('path', { d: `M ${X(0)} 70 Q ${X(1)} 30 ${X(2)} 74`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': `${300 * E(u, 0.4, 1.0)} 300`, 'marker-end': u > 1.0 ? 'url(#ra-ahb)' : null });
        mono(560, 120, '칸 위치 = 시작 + 2 × 칸 크기', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.1) });
        mono(560, 150, '=> 30 · 크기와 무관하게 O(1)', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) }); }
      return; }
    // 위: 결과 배열은 흐리게 남긴다
    arrObj(80, 82, '', k === 6 ? ['A', 'B', 'C', 'D', 'E'] : ['10', '99', '20', '30'], { w: 70, op: opA, col: INK });
    if (k === 3 || k === 4) { // Deque 로 선언한 LinkedList
      tx(60, 256, 'Deque<Integer> dq = new LinkedList<>()', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: k === 3 ? fade(u, 0.2) : 1 });
      const hx = 300, n = k === 3 ? 0 : 2;
      if (k === 3) { mono(120, 330, 'head = null', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) }); mono(420, 330, 'tail = null', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
        cross(700, 330, 9, pop(u, 1.5)); mono(720, 336, 'dq.get(i) 없음', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
      const X = nodes(200, 310, ['1', '2'], { s: (i) => pop(u, 0.3 + i * 0.8), gap: 80 });
      pill(X(0), 290, 'addFirst(1)', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); pill(X(1), 290, 'addLast(2)', ACC, pop(u, 1.0), { mono: true, fs: 13.5 });
      mono(X(0), 390, 'head', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(X(1), 390, 'tail', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) });
      mono(560, 336, '앞뒤 포인터만 고친다 → O(1)', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      mono(560, 362, '=> [1, 2]', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); return; }
    // k = 5, 6: A..E 체인
    const X = nodes(80, 300, ['A', 'B', 'C', 'D', 'E'], { gap: 40 });
    mono(X(0), 290, 'head', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700 });
    if (k === 5) { const hop = lerp(0, 3, E(u, 0.3, 2.0)), i = Math.floor(hop), f = hop - i, hx = i < 3 ? lerp(X(i), X(i + 1), f) : X(3);
      el('path', { d: `M ${hx - 9} 384 l 9 -12 l 9 12 z`, fill: ACC });
      mono(640, 330, 'get(3) → ' + Math.floor(hop + 1e-6) + '칸 이동', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      mono(640, 360, 'i번째는 head 부터 i칸 → O(n)', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) });
      if (u > 2.0) card(X(3), 320, 70, 48, { rx: 22, stroke: ACC, sw: 3, fill: 'none', s: pop(u, 2.0) }); return; }
    // k = 6: 나란히 비교
    const L = c.beat.list;
    mono(500, 70, L.arrayList.getOp, { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.3) });
    mono(500, 98, L.arrayList.insertOp, { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.6) });
    mono(80, 372, L.linkedList.getOp, { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.9) });
    mono(80, 398, L.linkedList.insertOp, { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) });
    banner(480, 168, '특별한 이유가 없으면 ArrayList', pop(u, 1.8));
  }

  // ---------- 3. HashMap 버킷 ----------
  const BK = { x: 44, y: 150, w: 52, gap: 3 };
  const bx = (i) => BK.x + i * (BK.w + BK.gap) + BK.w / 2;
  function buckets(o) { o = o || {};
    for (let i = 0; i < 16; i++) { const hi = o.hi === i;
      el('rect', { x: bx(i) - BK.w / 2, y: BK.y, width: BK.w, height: 36, rx: 4, fill: hi ? ACCBG : SOFT, stroke: hi ? ACC : GRID, 'stroke-width': hi ? 2.5 : 1.5, opacity: o.op ?? 1 });
      mono(bx(i), BK.y + 24, String(i), { 'font-size': 14, 'text-anchor': 'middle', fill: hi ? ACC : MUT, 'font-weight': 700, opacity: o.op ?? 1 }); } }
  function entry(b, depth, key, val, o) { o = o || {}; const cx = bx(b) + (b === 14 ? 24 : b === 13 ? -24 : 0), cy = BK.y + 70 + depth * 56;
    if (depth === 0) el('line', { x1: bx(b), y1: BK.y + 36, x2: cx, y2: cy - 18, stroke: o.col || INK, 'stroke-width': 1.8, opacity: o.s ?? 1 });
    else el('line', { x1: cx, y1: cy - 56 + 18, x2: cx, y2: cy - 18, stroke: o.col || INK, 'stroke-width': 1.8, 'marker-end': 'url(#ra-ah)', opacity: o.s ?? 1 });
    card(cx, cy, 92, 36, { rx: 8, stroke: o.col || INK, sw: o.sw || 2, fill: o.fill || PANEL, text: `${key}=${val}`, fs: 14, mono: true, s: o.s, color: o.color }); return [cx, cy]; }
  const HASH = { kim: ['106191', 14], lee: ['107020', 13], park: ['3433450', 14] };
  function hashLine(key, u0, c) { const [h, b] = HASH[key];
    mono(44, 60, `"${key}".hashCode() = ${h}`, { 'font-size': 16, 'font-weight': 700, opacity: fade(c.u, u0) });
    mono(44, 90, `(h ^ h>>>16) & 15 = ${b}`, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(c.u, u0 + 0.5) }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { // TreeMap: 정렬 트리
      tx(60, 60, 'TreeMap · 키를 정렬한 레드-블랙 트리', { 'font-size': 17, 'font-weight': 800 });
      const P = { lee: [480, 140], kim: [330, 270], park: [630, 270] };
      grow(460, 160, 350, 250, E(u, 0.6, 1.0), INK, { plain: true }); grow(500, 160, 610, 250, E(u, 0.8, 1.2), INK, { plain: true });
      card(P.lee[0], P.lee[1], 120, 46, { rx: 23, stroke: INK, sw: 2.5, fill: INK, text: 'lee=25', fs: 15, mono: true, color: PANEL, s: pop(u, 0.2) });
      card(P.kim[0], P.kim[1], 120, 46, { rx: 23, stroke: BAD, sw: 2.5, text: 'kim=30', fs: 15, mono: true, s: pop(u, 0.9) });
      card(P.park[0], P.park[1], 120, 46, { rx: 23, stroke: BAD, sw: 2.5, text: 'park=40', fs: 15, mono: true, s: pop(u, 1.1) });
      mono(190, 270, 'k < l', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); mono(770, 270, 'p > l', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      pill(480, 360, '순서대로 꺼내면 {kim=30, lee=25, park=40}', ACC, pop(u, 1.8), { mono: true, fs: 14 });
      sub(480, 400, '조회는 높이만큼 비교 · O(log n)', fade(u, 2.2), { fill: INK, 'font-weight': 700 }); return; }
    if (k === 6) { // 커스텀 키: record 는 equals·hashCode 를 만든다
      tx(60, 52, 'record PointKey(int x, int y)', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      buckets({ op: 0.35 });
      const [ax, ay] = [bx(5), BK.y + 70];
      card(ax, ay, 150, 36, { rx: 8, stroke: GOOD, sw: 2, text: 'PointKey(1, 2)', fs: 14, mono: true, s: pop(u, 0.2) });
      el('line', { x1: ax, y1: BK.y + 36, x2: ax, y2: ay - 18, stroke: GOOD, 'stroke-width': 1.8 });
      fly(ax, 110, ax, ay, seg(u, 0.8, 1.5), 'get(new PointKey(1, 2))', { mono: true, fill: GOOD });
      mono(ax + 90, ay + 6, '같은 버킷 · equals true → 찾음', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) });
      // 계약을 안 지킨 일반 class: 해시가 객체마다 달라 다른 버킷
      tx(60, 300, 'equals·hashCode 없는 class', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      const [b1, b2] = [bx(3), bx(11)];
      card(b1, 350, 120, 34, { rx: 8, stroke: BAD, sw: 2, text: '넣은 키', fs: 14, s: pop(u, 1.9) }); card(b2, 350, 120, 34, { rx: 8, stroke: BAD, sw: 2, dash: '5 4', text: '찾는 키', fs: 14, s: pop(u, 2.1) });
      mono(b2 + 70, 356, '→ 다른 버킷 · null', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.3) });
      sub(bx(7), 400, '버킷 번호는 그림용 예시', fade(u, 2.3)); return; }
    buckets({ hi: k === 0 ? (u > 1.4 ? 14 : null) : k === 1 ? (u > 1.4 ? 13 : null) : k === 2 ? (u > 1.4 ? 14 : null) : k === 3 ? (u > 0.8 ? 14 : null) : null });
    tx(BK.x, BK.y - 12, 'table · 버킷 16칸', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k <= 2) hashLine(['kim', 'lee', 'park'][k], 0.2, c);
    // 엔트리
    entry(14, 0, 'kim', 30, { s: pk(c, 0, 1.6) });
    if (k >= 1) entry(13, 0, 'lee', 25, { s: pk(c, 1, 1.6) });
    if (k >= 2) entry(14, 1, 'park', 40, { s: pk(c, 2, 1.6), col: k === 2 ? WARN : INK });
    if (k === 2) { pill(700, 300, '충돌 · 같은 칸에 줄줄이', WARN, pop(u, 2.0), { fs: 14 });
      sub(560, 60, '한 칸이 8개를 넘고 버킷이 64칸 이상이면', fade(u, 2.2), { 'text-anchor': 'start' });
      sub(560, 84, '그 칸을 레드-블랙 트리로 바꾼다 (OpenJDK)', fade(u, 2.3), { 'text-anchor': 'start' }); }
    if (k === 3) { mono(44, 60, 'ages.get("park")', { 'font-size': 16, 'font-weight': 700 });
      mono(44, 90, 'hash → 14번 버킷', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      const kx = bx(14) + 24;
      el('rect', { x: kx - 50, y: BK.y + 50, width: 100, height: 40, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.1) });
      el('rect', { x: kx - 50, y: BK.y + 106, width: 100, height: 40, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.7) });
      cross(470, 336, 7, pop(u, 1.2)); mono(490, 341, '① "kim".equals("park") → false', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
      check(470, 368, 8, pop(u, 1.8)); mono(490, 373, '② "park".equals("park") → true', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      pill(560, 72, '=> 40', GOOD, pop(u, 2.2), { mono: true, fs: 18 }); }
    if (k === 4) { // LinkedHashMap: 넣은 순서를 잇는 줄
      mono(44, 60, 'new LinkedHashMap<>()', { 'font-size': 16, 'font-weight': 700 });
      const pts = [[bx(14) + 24, BK.y + 70], [bx(13) - 24, BK.y + 70], [bx(14) + 24, BK.y + 126]];
      el('path', { d: `M ${pts[0][0]} ${pts[0][1] + 18} Q ${(pts[0][0] + pts[1][0]) / 2} ${pts[0][1] + 44} ${pts[1][0]} ${pts[1][1] + 18} Q ${pts[1][0] + 10} ${pts[2][1]} ${pts[2][0] - 46} ${pts[2][1]}`, fill: 'none', stroke: INFO, 'stroke-width': 3, 'stroke-dasharray': `${400 * E(u, 0.4, 1.4)} 400`, opacity: 0.85 });
      ['①', '②', '③'].forEach((s, i) => lbl(pts[i][0] + (i === 1 ? -60 : 60), pts[i][1] + 5, s, fade(u, 0.5 + i * 0.4), { fill: INFO }));
      mono(44, 330, 'HashMap        → {lee=25, kim=30, park=40}', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) });
      mono(44, 362, 'LinkedHashMap  → {kim=30, lee=25, park=40}', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.9) });
      sub(560, 90, 'HashMap 은 버킷 순서대로 꺼낸다', fade(u, 1.5), { 'text-anchor': 'start' }); }
  }

  // ---------- 4. HashSet ----------
  const SB = { x: 70, y: 196, w: 44, gap: 4 };
  const sbx = (i) => SB.x + i * (SB.w + SB.gap) + SB.w / 2;
  const IN = ['A', 'B', 'A', 'C', 'B'], SLOT = { A: 1, B: 2, C: 3 };
  function s4(t, c) { const { k, u } = c;
    card(480, 228, 860, 210, { rx: 14, stroke: ACC, sw: 2.2, fill: 'none', s: k === 0 ? pop(u, 0.2) : 1 });
    tx(64, 150, 'HashSet seen', { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono' });
    tx(200, 150, '내부 HashMap map · 값은 키 자리에, 값 자리엔 PRESENT', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.8) : 1 });
    for (let i = 0; i < 16; i++) { el('rect', { x: sbx(i) - SB.w / 2, y: SB.y, width: SB.w, height: 32, rx: 4, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: k === 0 ? fade(u, 0.5 + i * 0.04) : 1 });
      mono(sbx(i), SB.y + 22, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.5 + i * 0.04) : 1 }); }
    // 저장된 키
    const stored = k === 0 ? [] : k === 1 ? IN.filter((v, i) => IN.indexOf(v) === i && u > 0.6 + i * 0.4) : k >= 5 ? (k === 5 && u < 1.0 ? ['A', 'B', 'C'] : ['B', 'C']) : ['A', 'B', 'C'];
    stored.forEach((v) => card(sbx(SLOT[v]), SB.y + 66, 46, 34, { rx: 8, stroke: ACC, sw: 2, text: v, fs: 15, mono: true, fill: ACCBG, s: k === 1 ? pop(u, 0.6 + IN.indexOf(v) * 0.4) : 1 }));
    if (k === 1) { // 입력 5개
      IN.forEach((v, i) => { const a = 0.2 + i * 0.4, dup = IN.indexOf(v) !== i, tx0 = 560 + i * 60;
        pill(tx0, 70, v, dup ? BAD : INK, 1 - seg(u, a, a + 0.15), { mono: true, fs: 15 });
        if (!dup) fly(tx0, 70, sbx(SLOT[v]), SB.y + 66, seg(u, a, a + 0.4), v, { mono: true });
        else { fly(tx0, 70, sbx(SLOT[v]), SB.y - 10, seg(u, a, a + 0.35), v, { mono: true, fill: BAD }); if (u > a + 0.35) mono(sbx(SLOT[v]) + (v === 'A' ? -18 : 18), SB.y - 16, 'false', { 'font-size': 14, fill: BAD, 'font-weight': 800, 'text-anchor': v === 'A' ? 'end' : 'start', opacity: 1 - seg(u, a + 1.2, a + 1.5) }); } });
      mono(64, 104, '입력 5개 → 저장 ' + stored.length + '개', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) }); }
    if (k === 2) terminal(560, 30, 380, 84, ['> println(seen)', '[A, B, C]'], lerp(0, 2, E(u, 0.3, 1.2)), { lh: 19, title: '출력 · 버킷 순서대로' });
    if (k === 3) { mono(560, 70, 'seen.contains("B")', { 'font-size': 16, 'font-weight': 700 }); mono(560, 100, '"B" 해시 66 → 2번 버킷', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.6) });
      el('rect', { x: sbx(2) - 27, y: SB.y - 4, width: 54, height: 108, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: fade(u, 1.0) });
      pill(820, 100, '=> true', GOOD, pop(u, 1.6), { mono: true, fs: 16 }); sub(380, 100, '한 칸만 보면 끝 · O(1)', fade(u, 1.9), { 'text-anchor': 'start', 'font-weight': 700, fill: INK }); }
    // modCount 계기판 (k ≥ 1)
    if (k >= 4 && k <= 6) { const mc = k === 4 ? 3 : k === 5 ? (u > 1.0 ? 4 : 3) : (u > 1.0 ? 5 : 4), ex = k === 4 ? 3 : k === 5 ? (u > 1.2 ? 4 : 3) : 4;
      R.meters(560, 36, 360, [{ name: 'modCount (컬렉션)', val: String(mc), hot: mc !== ex }, { name: 'expectedModCount (Iterator)', val: String(ex), hot: mc !== ex }], { h: 62 });
      const cur = k === 4 ? lerp(-0.6, 1, E(u, 0.4, 1.2)) : k === 5 ? lerp(1, 2, E(u, 1.4, 2.0)) : 2;
      if (k >= 4) { const cx = lerp(sbx(0), sbx(1), 0) + (cur) * (SB.w + SB.gap); el('path', { d: `M ${cx - 10} 330 l 10 -14 l 10 14 z`, fill: INFO, opacity: k === 4 ? fade(u, 0.3) : 1 }); mono(cx + 16, 332, 'it', { 'font-size': 15, fill: INFO, 'font-weight': 800 }); }
      if (k === 4) mono(64, 120, 'Iterator<String> it = seen.iterator();', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      if (k === 5) { mono(64, 120, 'if (it.next().equals("A")) it.remove();', { 'font-size': 15, 'font-weight': 700 });
        if (u > 0.6 && u < 1.2) cross(sbx(1), SB.y + 66, 14, pop(u, 0.6)); sub(300, 380, '두 숫자를 함께 올린다 · 순회 계속 OK', fade(u, 1.5), { fill: GOOD, 'font-weight': 700 }); }
      if (k === 6) { mono(64, 120, 'for (String s : seen) seen.remove(s);', { 'font-size': 15, 'font-weight': 700, fill: BAD });
        if (u > 0.8) { card(sbx(2), SB.y + 66, 46, 34, { rx: 8, stroke: BAD, sw: 2, dash: '5 4', text: 'B', fs: 15, mono: true, s: 1 - E(u, 0.8, 1.1) }); }
        banner(480, 390, 'next() → ConcurrentModificationException', pop(u, 1.8)); } }
    if (k === 7) { mono(64, 120, 'List.of("A","B","A","C","B")  → 저장 3개', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      mono(560, 70, '삭제 뒤 출력 => [B, C]', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
      sub(480, 370, '중복 판정은 hashCode 로 칸을 찾고 equals 로 확인한다', fade(u, 1.0), { fill: INK, 'font-weight': 700 });
      sub(480, 398, '순회 중 삭제는 Iterator.remove() 또는 removeIf()', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
  }

  // ---------- 5. 시간복잡도 표 ----------
  const COLS = [['get', '조회 get'], ['addEnd', '끝에 추가'], ['insertMid', '중간 삽입'], ['search', '검색']];
  const ORDER = ['ArrayList', 'LinkedList', 'HashMap', 'HashSet', 'TreeMap'];
  const PICK = [['ArrayList', 'get'], ['LinkedList', 'addEnd'], ['HashMap', 'search'], ['HashSet', 'search'], ['TreeMap', 'get']];
  const cost = (v) => (/log/.test(v) ? 2 : /O\(1\)/.test(v) ? 1 : /O\(n\)/.test(v) ? 3 : 0);
  function s5(t, c) { const { k, u } = c;
    const rows = c.beat.complexity.rows, by = Object.fromEntries(rows.map((r) => [r.ds, r]));
    const x0 = 40, cw = 108, nx = 160, y0 = 74, rh = 56;
    COLS.forEach(([, h], j) => tx(nx + j * cw + cw / 2, y0 - 12, h, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT }));
    const nShow = Math.min(5, k + 1);
    for (let r = 0; r < nShow; r++) { const ds = ORDER[r], row = by[ds], y = y0 + r * rh, s = r === k ? pop(u, 0.2) : 1, pick = PICK[r];
      tx(x0, y + 33, ds, { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: s });
      COLS.forEach(([key], j) => { const v = row[key], cl = cost(v), hot = (k === r || k === 5) && pick[1] === key, f = r === k ? fade(u, 0.3 + j * 0.15) : 1;
        const fill = cl === 1 ? GOODBG : cl === 2 ? WARNBG : cl === 3 ? BADBG : SOFT, col = cl === 1 ? GOOD : cl === 2 ? WARN : cl === 3 ? BAD : MUT;
        el('rect', { x: nx + j * cw + 3, y: y + 6, width: cw - 6, height: rh - 10, rx: 6, fill, opacity: f, stroke: hot ? INK : 'none', 'stroke-width': 3 });
        mono(nx + j * cw + cw / 2, y + 35, v, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: f }); }); }
    // 오른쪽: n = 1,000,000 일 때 단계 수
    const ax = 620; tx(ax, 60, 'n = 1,000,000 일 때 걸음 수', { 'font-size': 15, 'font-weight': 800 });
    const cur = k < 5 ? cost(by[PICK[k][0]][PICK[k][1]]) : 0;
    [['O(1)', 1, '1', 1], ['O(log n)', Math.log10(20), '≈ 20', 2], ['O(n)', 6, '1,000,000', 3]].forEach(([n, lv, s, cl], i) => { const y = 92 + i * 62, col = cl === 1 ? GOOD : cl === 2 ? WARN : BAD, on = cur === cl;
      mono(ax, y + 16, n, { 'font-size': 15, 'font-weight': 800, fill: col });
      el('rect', { x: ax + 90, y, width: 160, height: 22, rx: 4, fill: SOFT });
      el('rect', { x: ax + 90, y, width: Math.max(4, 160 * Math.max(lv, 0.15) / 6), height: 22, rx: 4, fill: col, opacity: on ? 1 : 0.45 });
      mono(ax + 90, y + 42, s, { 'font-size': 14, fill: col, 'font-weight': 700 });
      if (on) el('rect', { x: ax - 8, y: y - 8, width: 278, height: 56, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.8) }); });
    sub(ax + 140, 296, '막대는 로그 눈금 · log₂(10⁶) ≈ 19.9', 1);
    if (k === 5) banner(480, 384, '가장 잦은 연산이 싼 구현체를 고른다', pop(u, 0.6));
    else { const notes = c.beat.complexity.notes; if (k === 0) sub(ax + 140, 330, notes[0], fade(u, 1.4)); if (k === 1) sub(ax + 140, 330, notes[1], fade(u, 1.4)); }
  }

  const quiz = [
    { q: '변수를 List<String> names = new ArrayList<>(); 로 선언하는 이유는 무엇인가?',
      o: ['ArrayList 전용 메서드를 쓰기 위해', '구현체를 LinkedList로 바꿔도 호출부를 고치지 않기 위해', 'Map과 같은 계층에 넣기 위해'], a: 1,
      why: '호출부가 List의 약속(add, get)만 쓰면 new 옆 한 곳만 바꿔 구현체를 갈아끼울 수 있다. Map은 Collection 밖의 별도 최상위다.' },
    { q: 'LinkedList에서 get(3)이 느린 이유는 무엇인가?',
      o: ['head부터 노드를 3칸 따라가야 해서', '배열 전체를 한 칸씩 밀어야 해서', '해시를 다시 계산해야 해서'], a: 0,
      why: '노드는 메모리에 흩어져 있어 주소 계산으로 건너뛸 수 없다. i번째를 찾으려면 i칸을 걸어가야 하므로 O(n)이다.' },
    { q: '"park"이 "kim"과 같은 14번 버킷에 들어간 뒤 get("park")은 어떻게 값을 찾는가?',
      o: ['버킷 16칸을 처음부터 전부 훑는다', '입력 순서대로 엔트리를 센다', '해시로 14번 칸을 찾고 체인 안에서 equals로 키를 가린다'], a: 2,
      why: '해시로 칸을 한 번에 고르고, 그 칸의 kim과 park을 equals로 비교해 40을 꺼낸다. 그래서 hashCode와 equals가 짝을 이뤄야 한다.' },
    { q: 'HashSet을 for-each로 돌며 seen.remove(s)를 부르면 무엇이 일어나는가?',
      o: ['다음 next()에서 ConcurrentModificationException이 난다', '조용히 모든 원소가 지워진다', '컴파일 에러가 난다'], a: 0,
      why: 'remove가 modCount를 5로 올렸는데 Iterator가 기억한 값은 4다. 둘이 다르면 next()가 예외를 던진다. 삭제는 it.remove()로 한다.' },
    { q: '루프 안에서 "이 아이디를 이미 봤나?"를 매번 확인할 때 알맞은 구현체는 무엇인가?',
      o: ['ArrayList의 contains', 'HashSet의 contains', 'LinkedList의 get'], a: 1,
      why: 'HashSet의 contains는 버킷 한 칸만 보는 O(1)이다. List.contains는 O(n)이라 루프 안에서 부르면 O(n²)이 된다.' },
  ];

  const summary = [
    '선언은 List·Set·Map 인터페이스로 하고, new 옆에서만 구현체를 고른다.',
    'ArrayList는 인덱스 조회가 O(1)이고, LinkedList는 양 끝 삽입이 O(1)이다.',
    'HashMap은 해시로 16칸 중 한 칸을 고르고, 같은 칸 안에서는 equals로 키를 가린다.',
    'HashSet은 HashMap 키 집합이라 contains가 O(1)이고, 순회 중 삭제는 it.remove()로 한다.',
  ];
  const review = [
    { q: '회원 10만 명 목록에서 for 문 안에 list.contains(id)를 두었더니 배치가 몇 분씩 걸린다. 먼저 바꿀 것은?',
      o: ['id들을 HashSet에 담아 contains로 확인한다', 'ArrayList를 LinkedList로 바꾼다', 'TreeMap에 담아 정렬한다'], a: 0,
      why: 'List.contains는 매번 끝까지 훑는 O(n)이라 루프와 합쳐 O(n²)이 된다. HashSet은 해시로 한 칸만 보므로 O(1)이다.' },
    { q: '좌표 클래스를 HashMap 키로 넣었는데, 같은 좌표로 new 해서 get하면 null이 나온다. 원인은?',
      o: ['HashMap 용량이 16칸이라 모자라서', 'equals·hashCode를 구현하지 않아 다른 버킷을 찾아서', '키를 넣은 순서가 달라서'], a: 1,
      why: '기본 hashCode는 객체마다 달라 다른 칸을 보게 된다. record로 만들거나 equals와 hashCode를 함께 오버라이드해야 같은 칸에서 찾는다.' },
    { q: 'HashMap에 넣은 순서대로 화면에 보여 주려다 순서가 뒤섞였다. 가장 작은 수정은?',
      o: ['키를 정렬해서 다시 넣는다', 'ArrayList로 바꾸고 인덱스로 찾는다', '생성 부분만 new LinkedHashMap<>()으로 바꾼다'], a: 2,
      why: 'HashMap은 버킷 순서로 꺼내므로 입력 순서를 보장하지 않는다. Map으로 선언해 두었다면 생성만 LinkedHashMap으로 바꾸면 된다.' },
  ];

  R.page({ title: '컬렉션 내부', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
