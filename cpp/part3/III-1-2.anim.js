/* III-1-2 STL 컨테이너 내부 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 용량·재할당 횟수·버킷 수·생성자 호출 수는 zig c++ 0.17(clang, libc++)로 돌린 실측값(M)이다. 주소·해시값은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 실측 (exp2/cont.cpp)
  const M = { grow: [1, 2, 4, 8, 16, 32, 64], realloc: 21, buckets: 101, ctorIns: [1, 0, 1], ctorEmp: [1, 0, 0], w3: [3, 6] };

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const mk = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function arc(x1, y1, x2, y2, bend, u, col, o) { o = o || {}; if (u <= 0) return; const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - bend;
    el('path', { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: 'none', stroke: col || MUT, 'stroke-width': o.sw || 2.2, pathLength: 1, 'stroke-dasharray': `${clamp(u)} 2`, 'marker-end': u > 0.98 ? mk(col) : null, opacity: o.op ?? 1 }); }
  function brace(x1, x2, y, u, text, col) { if (u <= 0) return; const xe = lerp(x1, x2, E(u, 0, 1));
    el('path', { d: `M${x1},${y - 8} V${y} H${xe}` + (u >= 1 ? ` V${y - 8}` : ''), fill: 'none', stroke: col || INK, 'stroke-width': 2 });
    if (u >= 1 && text) tx((x1 + x2) / 2, y + 20, text, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col || INK }); }

  // ---------- 1. vector: 연속 칸 + capacity ----------
  const V = { x: 250, y: 150, w: 74, h: 54 };
  const vx = (i) => V.x + i * V.w;
  function vobj(size, cap, op) { // 스택 위 vector 객체 (세 칸)
    zone(40, 50, 170, 156, 'v (스택)', { fill: SOFT, op });
    [['data', '→'], ['size', String(Math.round(size))], ['cap', String(Math.round(cap))]].forEach(([n, v], i) => { const y = 92 + i * 36;
      tx(56, y + 5, n, { 'font-size': 14.5, fill: MUT, opacity: op, class: 'mono' }); mono(190, y + 6, v, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: i === 0 ? ACC : INK, opacity: op }); });
    el('path', { d: `M200,92 C228,92 222,${V.y + V.h / 2} ${V.x - 4},${V.y + V.h / 2}`, fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'marker-end': 'url(#ra-ahb)', opacity: op }); }
  function slotRow(vals, o) { o = o || {};
    vals.forEach((v, i) => { const st = (o.style && o.style(i)) || {}, used = v !== '' && v != null;
      card(vx(i) + V.w / 2, V.y + V.h / 2 + (st.dy || 0), V.w - 6, V.h, { rx: 6, text: used ? String(v) : '', fs: 19, mono: true, fw: 800, fill: st.fill || (used ? ACCBG : PANEL), stroke: st.stroke || (used ? ACC : GRID), dash: used ? null : '5 4', sw: 2, s: st.s, op: st.op });
      if (o.addr) mono(vx(i) + V.w / 2, V.y + V.h + 20, '0x' + (0x1000 + i * 4).toString(16), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.addr }); }); }
  function s1(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {}, vm = b.vmeta, pm = p.vmeta || { size: 0, cap: 0 };
    const vals = b.slots.map((s) => s.v);
    vobj(tween(pm.size, vm.size, u), tween(pm.cap, vm.cap, u), 1);
    if (k !== 3) tx(V.x, V.y - 18, '힙: 연속된 int 칸', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k === 0) { slotRow(vals, { style: (i) => ({ s: pop(u, 0.3 + i * 0.15) }) });
      pill(V.x + 3 * V.w, V.y - 50, 'reserve(6)', ACC, pop(u, 1.3), { mono: true, fs: 14 });
      note(V.x, 280, '칸은 6개 확보, 원소는 아직 0개', fade(u, 1.8)); return; }
    if (k === 1) { slotRow(vals.map((v, i) => (u > 0.3 + i * 0.45 + 0.5 ? v : '')));
      vals.slice(0, 4).forEach((v, i) => fly(vx(i) + V.w / 2, 60, vx(i) + V.w / 2, V.y + V.h / 2, seg(u, 0.3 + i * 0.45, 0.8 + i * 0.45), v, { mono: true }));
      note(V.x, 280, '빈 칸에 쓰기만 한다 · 재할당 0회', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 2) { slotRow(vals, { addr: 0 });
      brace(vx(0) + 3, vx(4) - 3, V.y + V.h + 22, seg(u, 0.2, 0.9), 'size 4', ACC);
      brace(vx(0) + 3, vx(6) - 3, V.y + V.h + 76, seg(u, 0.9, 1.7), 'capacity 6', INK);
      tx(vx(5), V.y - 18, '여유 2칸', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 3) { slotRow(vals, { addr: fade(u, 0.2), style: (i) => (i === 2 && u > 1.4 ? { fill: ACC, stroke: ACC } : {}) });
      mono(V.x, 300, 'v[2] = base + 2 × sizeof(int)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) });
      mono(V.x, 330, '     = 0x1000 + 8 = 0x1008  =>  30', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      arc(vx(0) + 20, V.y - 4, vx(2) + V.w / 2, V.y - 4, 40, seg(u, 0.8, 1.4), ACC);
      el('rect', { x: vx(0), y: V.y - 6, width: V.w * 4, height: V.h + 12, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.8) });
      tx(V.x, 384, '캐시는 옆 칸까지 한 번에 가져온다 (주소는 예시)', { 'font-size': 14.5, fill: INFO, 'font-weight': 600, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { const old = [10, 20, 30, 40, '', ''];
      // 뒤에서부터 한 칸씩 민다: 40, 30, 20 순서
      const mv = (i) => (i >= 1 && i <= 3 ? E(u, 0.2 + (3 - i) * 0.4, 0.6 + (3 - i) * 0.4) : 0);
      [0, 1, 2, 3].forEach((i) => { const g = mv(i), x = vx(i) + V.w / 2 + g * V.w; card(x, V.y + V.h / 2, V.w - 6, V.h, { rx: 6, text: String(old[i]), fs: 19, mono: true, fw: 800, fill: g > 0 && g < 1 ? WARNBG : ACCBG, stroke: g > 0 ? WARN : ACC }); });
      [4, 5].forEach((i) => { if (i === 4 && mv(3) > 0) return; card(vx(i) + V.w / 2, V.y + V.h / 2, V.w - 6, V.h, { rx: 6, fill: PANEL, stroke: GRID, dash: '5 4' }); });
      card(vx(5) + V.w / 2, V.y + V.h / 2, V.w - 6, V.h, { rx: 6, fill: PANEL, stroke: GRID, dash: '5 4' });
      fly(vx(1) + V.w / 2, 50, vx(1) + V.w / 2, V.y + V.h / 2, seg(u, 1.5, 2.1), '99', { mono: true, fill: BAD });
      if (u >= 2.1) card(vx(1) + V.w / 2, V.y + V.h / 2, V.w - 6, V.h, { rx: 6, text: '99', fs: 19, mono: true, fw: 800, fill: BADBG, stroke: BAD, s: pop(u, 2.1) });
      mono(V.x, 290, `밀린 칸 ${Math.min(3, Math.floor(seg(u, 0.2, 1.4) * 3.99))}개`, { 'font-size': 18, 'font-weight': 800, fill: WARN });
      note(V.x, 324, '중간 삽입은 뒤 원소 수만큼 옮긴다 · O(n)', fade(u, 1.8), { fill: WARN }); return; }
    // k 5: 기준 상태 + reserve 없이 늘리면
    slotRow(vals, { style: () => ({ op: 0.5 }) });
    tx(40, 262, 'reserve 없이 push_back 하면 (libc++ 실측 용량)', { 'font-size': 14.5, 'font-weight': 700 });
    const caps = M.grow.slice(0, 4); let x = 60;
    caps.forEach((cp, i) => { const s = pop(u, 0.3 + i * 0.45), w = cp * 22; if (s <= 0) { x += w + 46; return; }
      for (let j = 0; j < cp; j++) el('rect', { x: x + j * 22, y: 290, width: 20, height: 30, rx: 3, fill: j < (i ? caps[i - 1] : 0) ? ACCBG : PANEL, stroke: i < caps.length - 1 && u > 0.75 + i * 0.45 ? OFF : ACC, 'stroke-width': 1.8, opacity: clamp(s) });
      mono(x + w / 2, 342, 'cap ' + cp, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) });
      if (i) arc(x - 40, 300, x - 4, 300, 18, seg(u, 0.2 + i * 0.45, 0.5 + i * 0.45), WARN);
      x += w + 46; });
    note(60, 384, '찰 때마다 2배 새 블록에 전부 복사, 옛 반복자는 무효', fade(u, 2.2), { fill: WARN }); }

  // ---------- 2. map: 균형 이진 트리 ----------
  function layout(node, x, y, dx, out, par) { if (!node) return; out.push({ key: node.key, x, y, par });
    layout(node.l, x - dx, y + 74, dx * 0.52, out, { x, y }); layout(node.r, x + dx, y + 74, dx * 0.52, out, { x, y }); return out; }
  function tree(root, o) { o = o || {}; const ns = layout(root, o.x || 330, o.y || 90, o.dx || 150, []) || [];
    ns.forEach((n) => { if (n.par) { const s = o.s ? o.s(n.key) : 1; if (s <= 0) return; el('line', { x1: n.par.x, y1: n.par.y + 22, x2: n.x, y2: n.y - 22, stroke: (o.edge && o.edge(n.key)) || GRID, 'stroke-width': 2.5, opacity: clamp(s) }); } });
    ns.forEach((n) => { const s = o.s ? o.s(n.key) : 1; if (s <= 0) return; const st = (o.style && o.style(n.key)) || {};
      el('circle', { cx: n.x, cy: n.y, r: 24 * s, fill: st.fill || PANEL, stroke: st.stroke || INK, 'stroke-width': st.sw || 2.4 });
      if (s > 0.5) mono(n.x, n.y + 6, String(n.key), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: st.color || INK }); });
    return ns; }
  const posOf = (ns, key) => ns.find((n) => n.key === key);
  function s2(t, c) { const { k, u } = c, b = c.beat, root = b.tree.root;
    zone(640, 30, 290, 370, null, { fill: SOFT });
    if (k === 0) { pill(330, 90, 'root → nullptr', MUT, pop(u, 0.3), { mono: true, fs: 15 });
      mono(330, 150, 'begin() == end()', { 'font-size': 16, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      note(660, 70, '원소마다 노드 하나를', fade(u, 1.3)); note(660, 98, '힙에 따로 만든다', fade(u, 1.5));
      note(660, 140, '노드끼리는 포인터로', fade(u, 1.9), { fill: MUT, 'font-weight': 500 }); note(660, 166, '이어 붙인다', fade(u, 1.9), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { const order = [30, 10, 50, 20], at = (key) => 0.3 + order.indexOf(key) * 0.5;
      order.forEach((key, i) => pill(670 + i * 60, 60, String(key), u > at(key) ? OFF : INK, 1, { mono: true, fs: 15 }));
      tx(660, 100, '넣는 순서', { 'font-size': 13.5, fill: MUT });
      const ns = tree(root, { s: (key) => pop(u, at(key) + 0.3) });
      const n20 = posOf(ns, 20), n10 = posOf(ns, 10), n30 = posOf(ns, 30);
      dot([[n30.x, n30.y], [n10.x, n10.y], [n20.x, n20.y]], seg(u, 1.8, 2.3), ACC, 7);
      note(660, 160, '작으면 왼쪽', fade(u, 0.8)); note(660, 188, '크면 오른쪽', fade(u, 1.0));
      note(660, 240, '삽입마다 O(log n)', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 2) { const ord = [10, 20, 30, 50], cur = Math.floor(seg(u, 0.2, 2.0) * 4.0);
      const ns = tree(root, { style: (key) => (ord.indexOf(key) < cur ? { fill: ACCBG, stroke: ACC, color: ACC } : {}) });
      tx(660, 70, '순회 결과', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      ord.slice(0, cur).forEach((key, i) => card(690 + i * 62, 110, 52, 40, { rx: 6, text: String(key), fs: 17, mono: true, fw: 800, fill: ACCBG, stroke: ACC, s: 1 }));
      note(660, 190, '넣은 순서 30 10 50 20은', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); note(660, 216, '남지 않는다', fade(u, 2.0), { fill: MUT, 'font-weight': 500 });
      note(660, 270, '왼쪽부터 훑으면 곧 정렬', fade(u, 2.3), { fill: ACC }); return; }
    if (k === 3) { const path = b.searchPath, st = (key) => { const i = path.indexOf(key); return i >= 0 && u > 0.3 + i * 0.6 ? { fill: i === path.length - 1 ? ACC : ACCBG, stroke: ACC, color: i === path.length - 1 ? PANEL : ACC } : {}; };
      const ns = tree(root, { style: st });
      [['20 < 30  왼쪽', 0.6], ['20 > 10  오른쪽', 1.2], ['20 == 20  찾음', 1.8]].forEach(([s, a], i) => mono(660, 80 + i * 36, s, { 'font-size': 15.5, 'font-weight': 700, fill: i === 2 ? ACC : INK, opacity: fade(u, a) }));
      mono(660, 220, 'it->second  =>  이십', { 'font-size': 15.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) });
      note(660, 280, '못 찾으면 end()', fade(u, 2.3), { fill: WARN }); return; }
    // k 4: 노드 6개 · lower_bound(20)
    const path = b.searchPath, st = (key) => { const i = path.indexOf(key); return i >= 0 && u > 0.6 + i * 0.5 ? { fill: key === 20 ? ACC : ACCBG, stroke: ACC, color: key === 20 ? PANEL : ACC } : {}; };
    const ns = tree(root, { s: (key) => (key === 25 || key === 70 ? pop(u, 0.2) : 1), style: st, dx: 160 });
    mono(660, 76, 'lower_bound(20)', { 'font-size': 16, 'font-weight': 800 });
    [['30 ≥ 20  후보, 왼쪽', 0.7], ['20 ≥ 20  후보, 왼쪽', 1.2], ['10 < 20  오른쪽 끝', 1.7]].forEach(([s, a], i) => mono(660, 112 + i * 32, s, { 'font-size': 14.5, opacity: fade(u, a) }));
    mono(660, 226, '=> 20', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
    note(660, 290, '정렬이 있어서 범위 질의가', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); note(660, 316, '트리 높이만큼으로 끝난다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); }

  // ---------- 3. unordered_map: 해시 버킷 ----------
  const HB = { x: 560, y: 54, h: 54 };
  const by = (i) => HB.y + i * HB.h;
  function buckets(bs, o) { o = o || {};
    bs.forEach((bk, i) => { const y = by(i), dim = o.only != null && o.only !== i, hot = o.hot === i;
      card(HB.x + 28, y + 22, 56, 44, { rx: 6, text: `[${bk.idx}]`, fs: 15, mono: true, fill: hot ? ACCBG : SOFT, stroke: hot ? ACC : GRID, op: dim ? 0.35 : 1, s: o.s ? o.s(i) : 1 });
      bk.items.forEach((it, j) => { const sc = o.item ? o.item(i, j) : 1; if (sc <= 0) return; const x = HB.x + 90 + j * 140;
        if (sc > 0.5) el('line', { x1: x - 34 + (j ? 0 : 0), y1: y + 22, x2: x - 4, y2: y + 22, stroke: MUT, 'stroke-width': 2, opacity: dim ? 0.35 : 1 });
        card(x + 60, y + 22, 120, 38, { rx: 8, text: it, fs: 14.5, mono: true, fill: o.hiItem && o.hiItem(i, j) ? ACC : PANEL, color: o.hiItem && o.hiItem(i, j) ? PANEL : INK, stroke: o.coll === i ? WARN : INK, s: sc, op: dim ? 0.35 : 1 }); }); }); }
  function hashBox(u0, key, out, o) { o = o || {};
    pill(110, 200, key, INK, o.s ?? 1, { mono: true, fs: 15 });
    grow(160, 200, 220, 200, u0, MUT);
    card(300, 200, 150, 56, { rx: 10, text: 'hash(key)\n% 버킷 수', fs: 14, fill: INFOBG, stroke: INFO });
    if (out != null) { grow(376, 200, 430, 200, seg(u0, 0.5, 1), INFO); mono(470, 206, out, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: seg(u0, 0.8, 1) }); } }
  function s3(t, c) { const { k, u } = c, bs = c.beat.buckets;
    tx(HB.x, 36, '버킷 배열 (6칸은 그림용 예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    if (k === 0) { buckets(bs, { s: (i) => pop(u, 0.2 + i * 0.12) });
      pill(240, 120, 'reserve(100)', ACC, pop(u, 1.0), { mono: true, fs: 15 });
      note(60, 200, '원소 0개, 버킷 배열부터 준비', fade(u, 1.4));
      note(60, 232, `libc++ 실측: 버킷 ${M.buckets}개가 잡힌다`, fade(u, 1.9), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { const keys = [['"ada"', 1], ['"bob"', 3], ['"eve"', 4]], cur = Math.min(2, Math.floor(seg(u, 0.1, 2.4) * 3));
      const lu = seg(u, 0.1 + cur * 0.77, 0.1 + cur * 0.77 + 0.6);
      hashBox(lu, keys[cur][0], '→ ' + keys[cur][1]);
      buckets(bs, { item: (i, j) => { const kk = keys.findIndex((x) => x[1] === i); return kk < cur ? 1 : kk === cur ? pop(u, 0.1 + cur * 0.77 + 0.6) : 0; } });
      note(60, 300, '자리는 사전 순서가 아니라 해시값이 정한다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 2) { hashBox(seg(u, 0.2, 0.9), '"bob"', '→ 3');
      buckets(bs, { only: u > 1.0 ? 3 : null, hot: u > 1.0 ? 3 : null, hiItem: (i) => i === 3 && u > 1.5 });
      mono(110, 300, 'h["bob"]  =>  2', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      note(60, 340, '다른 버킷은 보지 않는다 · 평균 O(1)', fade(u, 2.1)); return; }
    if (k === 3) { hashBox(seg(u, 0.2, 0.9), '"kim"', '→ 3');
      buckets(bs, { only: u > 1.0 ? 3 : null, hot: u > 1.0 ? 3 : null });
      if (u > 1.5) cross(HB.x + 230, by(3) + 22, 10, pop(u, 1.5));
      mono(110, 300, 'h.count("kim")  =>  0', { 'font-size': 17, 'font-weight': 800, fill: INK, opacity: fade(u, 1.7) });
      note(60, 340, 'h["kim"]으로 확인하면 빈 항목이 생긴다', fade(u, 2.1), { fill: WARN }); return; }
    // k 4: 충돌
    hashBox(1, '"kim"', '→ 3', { s: 1 });
    buckets(bs, { coll: 3, item: (i, j) => (i === 3 && j === 1 ? pop(u, 0.3) : 1), hiItem: (i, j) => i === 3 && Math.floor(seg(u, 0.9, 2.0) * 2) === j && u < 2.0 });
    tx(HB.x + 200, by(3) + 66, '같은 버킷 · 차례로 훑는다', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.9) });
    mono(60, 300, 'load factor = size / 버킷 수', { 'font-size': 15, opacity: fade(u, 1.5) });
    note(60, 334, '한도(1.0)를 넘으면 rehash: 버킷을 늘려 전부 재배치', fade(u, 1.9), { fill: WARN });
    note(60, 368, '순회 순서는 보장되지 않는다', fade(u, 2.2), { fill: MUT, 'font-weight': 500 }); }

  // ---------- 4. 선택 기준 · emplace ----------
  const TONE = { vec: ACC, hash: INFO, map: GOOD };
  function table(rows, newAt, u) { const x = 40, y = 40;
    tx(x, y, '자주 하는 일', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(x + 250, y, '고를 것', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    rows.forEach((r, i) => { const yy = y + 18 + i * 52, s = i >= newAt ? pop(u, 0.2 + (i - newAt) * 0.25) : 1; if (s <= 0) return;
      el('line', { x1: x, y1: yy, x2: x + 430, y2: yy, stroke: GRID, 'stroke-width': 1.2 });
      tx(x, yy + 22, r.need, { 'font-size': 14.5, 'font-weight': 600, opacity: clamp(s) });
      pill(x + 250 + R.tw(r.best, 14) / 2 + 13, yy + 17, r.best, TONE[r.tone] || INK, s, { mono: true, fs: 14 });
      tx(x, yy + 42, r.why, { 'font-size': 13.5, fill: MUT, opacity: clamp(s) }); }); }
  function userCard(cx, cy, name, age, o) { o = o || {}; card(cx, cy, 120, 48, { rx: 8, text: `User\n"${name}", ${age}`, fs: 13.5, mono: true, fill: o.fill || PANEL, stroke: o.stroke || INK, s: o.s, op: o.op }); }
  function s4(t, c) { const { k, u } = c, b = c.beat, pr = c.prev ? c.prev.compare.length : 0;
    table(b.compare, k === 0 ? 0 : pr, u);
    el('line', { x1: 492, y1: 30, x2: 492, y2: 400, stroke: GRID, 'stroke-width': 1.5 });
    const sx = 560, sy = 120;
    if (k <= 2) { tx(520, 52, 'users (vector 칸)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [0, 1, 2].forEach((i) => el('rect', { x: sx + i * 128 - 4, y: sy - 30, width: 128, height: 60, rx: 6, fill: 'none', stroke: GRID, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' })); }
    if (k === 0) { note(520, 220, '쌓고, 인덱스로 꺼내고, 훑는다', fade(u, 0.8)); note(520, 252, '확신이 없으면 vector', fade(u, 1.4), { fill: ACC }); return; }
    if (k === 1) { const g = E(u, 1.0, 1.8);
      userCard(lerp(620, sx + 60, g), lerp(260, sy, g), 'ada', 30, { s: pop(u, 0.2), fill: g < 1 ? WARNBG : PANEL, stroke: g < 1 ? WARN : INK });
      if (u < 1.0) tx(620, 300, '임시 객체', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(520, 340, `생성자 ${M.ctorIns[0]} · 복사 ${M.ctorIns[1]} · 이동 ${M.ctorIns[2]}`, { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.9) });
      sub(700, 372, 'libc++ 실측 · 만들고 나서 옮긴다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 2) { userCard(sx + 60, sy, 'ada', 30, {});
      fly(640, 260, sx + 188, sy, seg(u, 0.2, 1.0), '"bob", 25', { mono: true });
      userCard(sx + 188, sy, 'bob', 25, { s: pop(u, 1.0), stroke: GOOD });
      mono(520, 340, `생성자 ${M.ctorEmp[0]} · 복사 ${M.ctorEmp[1]} · 이동 ${M.ctorEmp[2]}`, { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      sub(700, 372, '인자를 넘겨 칸 안에서 바로 생성', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 3) { tx(520, 52, 'deque = 청크들의 묶음', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      [0, 1, 2].forEach((i) => { const x = 540 + i * 130; el('rect', { x, y: 150, width: 116, height: 44, rx: 6, fill: SOFT, stroke: INK, 'stroke-width': 1.8 });
        for (let j = 1; j < 4; j++) el('line', { x1: x + j * 29, y1: 150, x2: x + j * 29, y2: 194, stroke: GRID }); });
      card(540 + 87 + 14, 172, 26, 36, { rx: 4, text: '1', fs: 15, mono: true, fill: ACCBG, stroke: ACC, s: pop(u, 0.4) });
      card(540 + 260 + 14, 172, 26, 36, { rx: 4, text: '2', fs: 15, mono: true, fill: ACCBG, stroke: ACC, s: pop(u, 0.9) });
      pill(600, 110, 'push_front(1)', ACC, pop(u, 0.3), { mono: true, fs: 13.5 }); pill(820, 110, 'push_back(2)', ACC, pop(u, 0.8), { mono: true, fs: 13.5 });
      note(520, 250, '앞뒤 모두 O(1), 인덱스 접근도 된다', fade(u, 1.4));
      note(520, 282, '순회는 vector보다 조금 느리다', fade(u, 1.8), { fill: MUT, 'font-weight': 500 }); return; }
    note(520, 70, 'idx["ada"] = 0;', fade(u, 0.2), { class: 'mono', 'font-size': 16 });
    note(520, 110, '이름으로 찾기만 하면 해시 맵', fade(u, 0.6), { fill: INFO });
    note(520, 180, 'list는 이론상 중간 삽입 O(1)', fade(u, 1.4), { fill: MUT, 'font-weight': 500 });
    note(520, 206, '실제로는 캐시 미스로 vector가', fade(u, 1.4), { fill: MUT, 'font-weight': 500 });
    note(520, 232, '이기는 경우가 많다', fade(u, 1.4), { fill: MUT, 'font-weight': 500 }); }

  // ---------- 5. 실무 실패 사례 ----------
  function block(x, y, n, cw, vals, o) { o = o || {};
    for (let i = 0; i < n; i++) { const v = vals[i];
      el('rect', { x: x + i * cw, y, width: cw - 3, height: 44, rx: 4, fill: o.dead ? SOFT : v != null ? (o.fill || ACCBG) : PANEL, stroke: o.dead ? OFF : o.stroke || ACC, 'stroke-width': 2, 'stroke-dasharray': v == null && !o.dead ? '4 3' : null, opacity: o.op ?? 1 });
      if (v != null) mono(x + i * cw + (cw - 3) / 2, y + 29, String(v), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: o.dead ? OFF : INK, opacity: o.op ?? 1 }); } }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(40, 46, 'a.push_back × 1,000,000 (reserve 없음, libc++)', { 'font-size': 15, 'font-weight': 700 });
      const ax = R.axes(110, 80, 600, 250, { x: [0, M.realloc], y: [0, 20], xt: [1, 5, 10, 15, 20], yt: [0, 10, 20], xl: '새 블록 번호', yl: 'log₂ 용량' });
      const pts = []; for (let i = 0; i < M.realloc; i++) { pts.push([i, i]); pts.push([i + 1, i]); }
      R.line(ax, pts, E(u, 0.2, 2.0), WARN, { sw: 2.6 });
      const n = Math.round(M.realloc * E(u, 0.2, 2.0));
      mono(900, 140, `${n}번`, { 'font-size': 30, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
      sub(830, 170, '새 블록을 잡은 횟수', 1, { 'font-size': 14 });
      tx(760, 230, '1 → 2 → 4 → … → 1,048,576', { 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 2.0), 'text-anchor': 'middle' });
      note(800, 290, '에러도 로그도 없이 느려진다', fade(u, 2.2), { fill: BAD, 'text-anchor': 'middle' }); return; }
    if (k === 1) { tx(40, 46, 'b.reserve(1000000) 후 같은 반복', { 'font-size': 15, 'font-weight': 700 });
      el('rect', { x: 60, y: 90, width: 600 * E(u, 0.2, 0.8), height: 44, rx: 6, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 });
      mono(360, 120, '1,000,000칸 한 번에', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      mono(900, 122, '0번', { 'font-size': 30, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end', opacity: fade(u, 0.9) });
      zone(40, 200, 880, 190, '다음 실수: 조회만 하는데 map', { fill: SOFT, op: fade(u, 1.2) });
      mono(70, 270, 'std::map<K,V> m;', { 'font-size': 16, fill: BAD, opacity: fade(u, 1.4), 'text-decoration': 'line-through' });
      grow(260, 264, 330, 264, seg(u, 1.6, 1.9), GOOD);
      mono(350, 270, 'std::unordered_map<K,V> m;', { 'font-size': 16, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      note(70, 330, '트리 탐색 O(log n) + 흩어진 노드 대신 해시 한 번', fade(u, 2.1), { fill: MUT, 'font-weight': 500 }); return; }
    // k 2~4: 반복자 무효화
    const cw = 62, ax = 220, ay = 120, bx = 220, byy = 270;
    tx(40, 50, 'std::vector<int> v{1, 2, 3};  auto it = v.begin();', { 'font-size': 15, class: 'mono', 'font-weight': 700 });
    const dead = k >= 3 && (k > 3 || u > 1.6);
    tx(40, ay + 28, '블록 A', { 'font-size': 14, 'font-weight': 700, fill: dead ? OFF : MUT });
    block(ax, ay, M.w3[0], cw, [1, 2, 3], { dead, op: k === 2 ? fade(u, 0.2) : 1 });
    if (dead) cross(ax + cw * 1.5, ay + 22, 16, k === 3 ? pop(u, 1.6) : 1);
    if (k >= 3) { const g = k === 3 ? 1 : 1; tx(40, byy + 28, '블록 B', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: k === 3 ? fade(u, 0.2) : 1 });
      block(bx, byy, M.w3[1], cw, [1, 2, 3, 4], { op: k === 3 ? fade(u, 0.2) : 1 });
      if (k === 3) [0, 1, 2].forEach((i) => arc(ax + i * cw + 28, ay + 46, bx + i * cw + 28, byy - 2, -10, seg(u, 0.4 + i * 0.2, 0.9 + i * 0.2), WARN));
      tx(bx + M.w3[1] * cw + 12, byy + 28, `push_back(4) · cap ${M.w3[0]} → ${M.w3[1]}`, { 'font-size': 14, class: 'mono', fill: WARN, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.6) : 1 }); }
    // it 화살표
    const itCol = k === 2 ? ACC : k === 3 ? BAD : GOOD, tgtY = k === 4 ? byy : ay, gx = k === 4 ? bx : ax;
    const g = k === 4 ? E(u, 0.3, 1.0) : 1;
    const iy = (k === 4 ? lerp(ay, byy, g) : tgtY) + 22;
    pill(150, iy, 'it', itCol, 1, { mono: true, fs: 15 });
    el('line', { x1: 172, y1: iy, x2: gx - 4, y2: iy, stroke: itCol, 'stroke-width': 2.4, 'marker-end': mk(itCol === ACC ? ACC : itCol === BAD ? BAD : MUT) });
    if (k === 2) note(40, 370, 'it은 원소가 아니라 블록 A의 주소를 들고 있다', fade(u, 1.0));
    if (k === 3) { note(40, 370, '원소는 블록 B로 옮겨졌고 it은 해제된 A를 가리킨다', fade(u, 1.8), { fill: BAD });
      mono(920, 140, '*it  →  UB', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.1) }); }
    if (k === 4) note(40, 370, 'it = v.begin(); 으로 다시 받으면 안전하다', fade(u, 1.2), { fill: GOOD }); }

  const quiz = [
    { q: 'v.reserve(6) 뒤 push_back을 4번 하면 size와 capacity는 무엇인가?',
      o: ['size 4, capacity 4', 'size 4, capacity 6', 'size 6, capacity 6'], a: 1,
      why: 'reserve는 칸(capacity)만 6개 잡고 원소 수(size)는 건드리지 않는다. 그래서 4개를 넣어도 재할당 없이 여유가 2칸 남는다.' },
    { q: 'map에 30, 10, 50, 20 순서로 넣고 순회하면 무엇이 나오는가?',
      o: ['30 10 50 20', '순서가 정해지지 않는다', '10 20 30 50'], a: 2,
      why: 'map은 균형 이진 트리라 왼쪽부터 훑으면 키 오름차순이다. 넣은 순서는 남지 않는다.' },
    { q: 'unordered_map에서 존재 확인을 h["kim"]으로 하면 생기는 문제는 무엇인가?',
      o: ['없는 키가 기본값 0으로 새로 생긴다', '해시를 두 번 계산해 느려진다', '버킷 순서가 바뀌어 순회가 정렬된다'], a: 0,
      why: 'operator[]는 키가 없으면 항목을 만든다. 확인만 하려면 count나 find를 쓴다.' },
    { q: 'users.emplace_back("bob", 25)가 insert(User("bob", 25))보다 나은 까닭은 무엇인가?',
      o: ['vector 앞쪽에 넣어 주기 때문에', '칸 안에서 바로 생성해 임시 객체를 옮기는 단계가 없어서', 'User의 복사 생성자를 지워 주기 때문에'], a: 1,
      why: 'insert는 임시 User를 만든 뒤 이동하고, emplace_back은 생성자 인자를 받아 그 자리에서 한 번만 만든다.' },
    { q: 'auto it = v.begin(); v.push_back(4); 뒤에 *it을 읽으면 위험한 이유는 무엇인가?',
      o: ['push_back이 it을 자동으로 end()로 바꿔서', 'int 반복자는 한 번만 쓸 수 있어서', '재할당으로 원소가 새 블록에 옮겨 가서'], a: 2,
      why: '용량이 3에서 6으로 늘 때 원소가 새 메모리로 복사된다. 옛 주소를 들고 있는 it은 무효라 역참조가 미정의 동작이다.' },
  ];

  const summary = [
    'vector는 연속 칸이라 인덱스와 순회가 빠르지만 중간 삽입은 뒤 원소를 모두 민다.',
    '용량이 차면 2배 새 블록에 복사하고 옛 반복자는 무효가 된다. 크기를 알면 reserve한다.',
    'map은 정렬된 트리라 순회가 오름차순이고 탐색과 범위 질의가 O(log n)이다.',
    'unordered_map은 해시로 버킷에 바로 가서 평균 O(1)이지만 순서가 없다.',
  ];
  const review = [
    { q: '로그 100만 줄을 vector에 담는 배치가 느리다. 줄 수는 미리 안다. 먼저 고칠 곳은?',
      o: ['vector를 list로 바꾼다', '루프 전에 reserve(줄 수)를 넣는다', 'push_back 대신 insert(begin())을 쓴다'], a: 1,
      why: 'reserve 없이 100만 개를 넣으면 2배씩 늘며 새 블록을 21번 잡고 그때마다 복사한다. reserve 한 줄이면 0번이 된다.' },
    { q: '점수표에서 "80점 이상 첫 사람"을 자주 찾고 점수순 출력도 한다. 알맞은 컨테이너는?',
      o: ['unordered_map<int, string>', 'deque<int>', 'map<int, string>'], a: 2,
      why: '정렬 순회와 lower_bound 같은 범위 질의는 트리인 map이 한다. 해시 맵은 순서가 없어 둘 다 못 한다.' },
    { q: 'for 문으로 vector를 돌며 조건이 맞으면 push_back했더니 가끔 이상한 값이 나온다. 먼저 의심할 것은?',
      o: ['재할당으로 순회 중인 반복자가 무효가 됐다', 'push_back이 원소를 정렬했다', 'capacity가 size보다 작아졌다'], a: 0,
      why: '용량을 넘는 push_back은 원소를 새 블록으로 옮긴다. 옛 반복자로 계속 돌면 해제된 메모리를 읽는다.' },
  ];

  R.page({ title: '컨테이너 메모리 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
