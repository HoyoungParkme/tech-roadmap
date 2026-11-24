/* IV-2-1 해시 테이블 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * djb2 값·버킷 번호·분포는 hash.c 를 zig cc 로 돌려 얻은 실제 값이다 (apple → 253337143 → % 8 = 7). */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const STEPS_H = [['a', 177670], ['p', 5863222], ['p', 193486438], ['l', 2090085266], ['e', 253337143]];
  const fmt = (v) => Math.round(v).toLocaleString('en-US');
  // 세로 버킷 배열: 칸 i 의 가운데 좌표
  function bucketCol(x, y0, n, gap, o) { o = o || {}; const h = o.h || 34;
    for (let i = 0; i < n; i++) { const yy = y0 + i * gap, hot = o.hot === i, st = (o.style && o.style(i)) || {};
      mono(x - 30, yy + 5, `[${i}]`, { 'font-size': 14, fill: hot ? ACC : MUT, 'text-anchor': 'end', 'font-weight': hot ? 800 : 500 });
      card(x + 30, yy, 60, h, { rx: 4, text: st.text ?? '', fs: 13.5, mono: true, fw: 700, stroke: hot ? ACC : st.stroke || INK, fill: hot ? ACCBG : st.fill || PANEL, color: st.color || MUT, sw: hot ? 3 : 2, op: o.op }); }
    return (i) => ({ x: x + 60, y: y0 + i * gap, cx: x + 30 }); }
  // 체인 노드 [key | •]
  function knode(cx, cy, key, o) { o = o || {}; const w = o.w || 108, s = o.s ?? 1, op = o.op ?? 1; if (s <= 0.01 || op <= 0.01) return { L: cx - w / 2, R: cx + w / 2 };
    const g = R.G(cx, cy, s, op);
    el('rect', { x: -w / 2, y: -16, width: w, height: 32, rx: 5, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    el('line', { x1: w / 2 - 26, y1: -16, x2: w / 2 - 26, y2: 16, stroke: o.stroke || INK, 'stroke-width': 1.5 }, g);
    tx(-13, 5, key, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: o.color || INK }, g);
    if (o.last) tx(w / 2 - 13, 4, '∅', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }, g); else el('circle', { cx: w / 2 - 13, cy: 0, r: 4, fill: ACC }, g);
    return { L: cx - w / 2, R: cx + w / 2 }; }
  function chainRow(start, cy, keys, o) { o = o || {}; let x = start + 30 + 54; const out = [];
    keys.forEach((k, i) => { const st = (o.style && o.style(i, k)) || {}; const nd = knode(x, cy, k, Object.assign({ last: i === keys.length - 1 }, st)); out.push({ x, L: nd.L, R: nd.R });
      x += 140; });
    if (keys.length) grow(start, cy, out[0].L - 2, cy, o.u0 ?? 1, ACC);
    out.forEach((p, i) => { if (i < out.length - 1) grow(p.R - 10, cy, out[i + 1].L - 2, cy, 1, MUT); });
    return out; }

  // ---------- 1. 해시 함수 ----------
  function letters(x, y, hot, op) { 'apple'.split('').forEach((ch, i) => card(x + i * 46, y, 40, 44, { rx: 6, text: ch, fs: 20, mono: true, fw: 800, stroke: hot === i ? ACC : INK, fill: hot === i ? ACCBG : PANEL, color: hot === i ? ACC : INK, op })); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      tx(70, 82, '키', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      const hot = k === 1 ? Math.min(4, Math.floor(E(u, 0.2, 2.2) * 5)) : -1; letters(130, 76, hot, k === 0 ? fade(u, 0.2) : 1);
      let val = 5381, label = 'hash = 5381';
      if (k === 1) { const f = E(u, 0.2, 2.2) * 5, i = Math.min(4, Math.floor(f)); val = STEPS_H[i][1]; label = `hash = hash × 33 + '${STEPS_H[i][0]}'`; }
      if (k === 2) val = 253337143;
      card(480, 210, 420, 74, { rx: 10, stroke: ACC, fill: ACCBG, sw: 2.5, s: k === 0 ? pop(u, 0.6) : 1 });
      mono(480, 222, fmt(val), { 'font-size': 30, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: k === 0 ? fade(u, 0.8) : 1 });
      tx(480, 160, k === 2 ? 'return hash;' : label, { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: k === 0 ? fade(u, 0.8) : 1 });
      if (k === 0) { tx(480, 300, 'uint32_t hash = 5381;  매직 시드에서 출발', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.5) });
        sub(480, 330, '시작값이 같으니 같은 키는 언제 계산해도 같은 결과', fade(u, 2.0), { 'font-size': 15 }); }
      if (k === 1) { const i = Math.min(4, Math.floor(E(u, 0.2, 2.2) * 5));
        if (i >= 3) { mono(480, 300, "6,385,052,562 는 32비트를 넘어 2,090,085,266 으로 감긴다", { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN }); }
        sub(480, 340, '(hash << 5) + hash = hash × 33 · 글자마다 반복', 1, { 'font-size': 15 }); }
      if (k === 2) { tx(480, 300, '"apple" 이 정수 하나로 뭉개졌다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) });
        tx(480, 334, '버킷 8칸에 쓰기엔 너무 큰 수 · 아직 인덱스가 아니다', { 'text-anchor': 'middle', 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.5) }); }
      return; }
    // k3~k5: % 8 → 버킷
    const bx = 130, by = 300, bw = 86;
    for (let i = 0; i < 8; i++) { const hot = i === 7 && (k > 3 || u > 1.7);
      card(bx + i * bw + bw / 2, by, bw - 6, 50, { rx: 6, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, sw: hot ? 3 : 2, s: k === 3 ? pop(u, 0.1 + i * 0.06) : 1 });
      mono(bx + i * bw + bw / 2, by + 46, `[${i}]`, { 'font-size': 14, fill: hot ? ACC : MUT, 'text-anchor': 'middle', 'font-weight': hot ? 800 : 500 }); }
    if (hotKey(k, u)) mono(bx + 7 * bw + bw / 2, by + 5, 'apple', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    if (k === 5) { // 전체 흐름
      const xs = [[120, '"apple"'], [370, '253337143'], [620, '% 8 = 7']];
      xs.forEach(([x, s], i) => { card(x, 110, i === 1 ? 190 : 150, 50, { rx: 8, text: s, fs: 17, mono: true, fw: 800, stroke: i === 2 ? ACC : INK, color: i === 2 ? ACC : INK, s: pop(u, 0.2 + i * 0.4) }); if (i < 2) grow(x + (i === 1 ? 97 : 77), 110, xs[i + 1][0] - (i === 0 ? 97 : 77), 110, seg(u, 0.4 + i * 0.4, 0.8 + i * 0.4), MUT); });
      mono(245, 92, 'djb2', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      grow(620, 136, bx + 7 * bw + bw / 2, by - 28, seg(u, 1.3, 1.9), ACC);
      tx(480, 400, '결정적 + 고르게 흩어짐 · 이 두 성질이 전제다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 2.1) }); return; }
    mono(480, 110, k === 3 ? '253,337,143 % 8 = 7' : 'hash_djb2("apple") = 253,337,143  →  % 8 = 7', { 'font-size': k === 3 ? 26 : 18, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) });
    if (k === 3) { tx(480, 160, '나머지는 늘 0 ~ 7 · 큰 수를 배열 범위로 접는다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.9) });
      dot([[480, 180], [bx + 7 * bw + bw / 2, by - 28]], seg(u, 1.1, 1.7), ACC, 8); }
    else { dot([[480, 130], [bx + 7 * bw + bw / 2, by - 28]], seg(u, 0.4, 1.0), ACC, 8);
      tx(480, 200, '조회도 같은 계산 · 훑지 않고 곧장 [7] 로 간다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      sub(480, 230, '배열을 처음부터 훑는 O(n) 과 갈리는 지점', fade(u, 1.8), { 'font-size': 15 }); } }
  const hotKey = (k, u) => k > 3 || (k === 3 && u > 1.7);

  // ---------- 2. 체이닝 ----------
  const HX = 90, HY = 70, HG = 42;
  function s2(t, c) { const { k, u, beat, prev } = c;
    if (k === 0) { // 노드 해부
      const g = E(u, 0.2, 1.4);
      [['key', 'char *', 160, ACC], ['value', 'int', 110, INFO], ['next', 'Node *', 130, WARN]].reduce((x, [n, ty, w, col], i) => { const s = clamp(g * 3 - i);
        if (s > 0) { el('rect', { x, y: 120, width: w * s, height: 60, rx: 4, fill: col === ACC ? ACCBG : col === INFO ? INFOBG : WARNBG, stroke: col, 'stroke-width': 2 });
          if (s > 0.9) { tx(x + w / 2, 156, n, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: col }); mono(x + w / 2, 206, ty, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); } }
        return x + w; }, 280);
      tx(480, 270, '같은 버킷의 다음 노드를 next 로 잇는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 302, '해시가 같아도 키는 다를 수 있어 원래 키도 들고 다닌다 (strcmp 로 확인)', fade(u, 2.0), { 'font-size': 15 });
      tx(480, 370, '버킷 8칸은 아직 전부 NULL', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    const bk = beat.buckets, at = bucketCol(HX, HY, 8, HG, { hot: k >= 3 ? 7 : null, style: (i) => (bk[i].chain.length ? {} : { text: 'NULL' }) });
    const count = bk.reduce((a, b) => a + b.chain.length, 0) + (k === 3 ? 0 : 0);
    const pc = prev && prev.buckets ? prev.buckets.reduce((a, b) => a + b.chain.length, 0) : count;
    mono(900, 40, `count = ${Math.round(tween(pc, count, u))}`, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end' });
    bk.forEach((b, i) => { if (!b.chain.length) return; const p = at(i);
      const isNew = (k === 1) || (k === 2 && i === 7);
      if (k === 4 && i === 7) { // mango 를 머리에 끼우기
        const sl = E(u, 1.0, 1.8);
        const apX = lerp(p.x + 84, p.x + 84 + 140, sl);
        knode(apX, p.y, 'apple', { last: true });
        knode(p.x + 84, lerp(p.y - 50, p.y, sl), 'mango', { stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.2), last: false });
        if (u > 0.6) grow(p.x + 84 + 41, lerp(p.y - 50, p.y, sl), apX - 56, p.y, seg(u, 0.6, 1.0), MUT);
        grow(p.x, p.y, sl > 0.5 ? p.x + 28 : apX - 56, p.y, 1, ACC);
        mono(620, 210, 'node->next = buckets[7];  buckets[7] = node;', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.4) });
        return; }
      chainRow(p.x, p.y, b.chain, { style: () => (isNew ? { s: pop(u, 0.3 + i * 0.1) } : {}), u0: isNew ? seg(u, 0.6 + i * 0.1, 1.0 + i * 0.1) : 1 }); });
    if (k === 1) tx(620, 400, 'kiwi · melon · lime 이 각자 다른 칸 · 조회는 칸 하나 확인', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    if (k === 2) { mono(620, 210, 'i = hash_djb2("apple") % 8 = 7', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.2) }); }
    if (k === 3) { const p = at(7);
      card(p.x + 84, p.y - 50, 108, 32, { rx: 5, text: 'mango', fs: 14.5, mono: true, fw: 700, stroke: BAD, color: BAD, s: pop(u, 0.2) });
      mono(620, 210, 'hash_djb2("mango") % 8 = 7', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.4) });
      mono(p.x + 330, p.y + 5, 'strcmp("apple", "mango") != 0', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.3) });
      tx(620, 250, '충돌 · 무한한 키를 8칸에 넣으니 반드시 겹친다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }
    if (k === 5) { const p = at(7); dot([[p.x, p.y], [p.x + 84, p.y], [p.x + 224, p.y]], seg(u, 0.3, 1.6), INFO, 8);
      mono(p.x + 84, p.y - 30, 'mango ≠', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      mono(p.x + 224, p.y - 30, 'apple ✓', { 'font-size': 14, fill: GOOD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(620, 210, 'ht_get("apple") · bucket[7] 리스트만 훑는다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      tx(620, 250, '리스트가 1~2개로 짧으면 O(1) 에 가깝다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); } }

  // ---------- 3. 부하율과 리사이즈 ----------
  const OLD = [['lime', 'melon'], ['kiwi'], ['cherry'], ['mango', 'apple']];         // % 4 (앞이 리스트 머리)
  const NEW = { lime: 4, melon: 0, kiwi: 1, cherry: 2, mango: 7, apple: 7 };          // % 8
  function stacks(x0, y, n, cw, items, o) { o = o || {};   // items: [{key, b, s, op, col}]
    for (let i = 0; i < n; i++) { const x = x0 + i * cw; el('rect', { x: x + 4, y, width: cw - 8, height: 30, rx: 4, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
      mono(x + cw / 2, y + 50, `[${i}]`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }
    const lvl = {}; items.forEach((it) => { const l = lvl[it.b] = (lvl[it.b] || 0) + 1; const x = it.x ?? x0 + it.b * cw + cw / 2, yy = it.y ?? y - 6 - l * 30;
      card(x, yy + 13, cw - 14, 26, { rx: 4, text: it.key, fs: 13.5, mono: true, fw: 700, stroke: it.col || INFO, color: INK, fill: INFOBG, s: it.s, op: (it.op ?? 1) * (o.op ?? 1) }); }); }
  function gauge(x, y, w, v, o) { o = o || {}; const max = 1.6, X = (z) => x + (z / max) * w;
    el('rect', { x, y, width: w, height: 16, rx: 8, fill: SOFT });
    el('rect', { x, y, width: Math.max(0, X(v) - x), height: 16, rx: 8, fill: v > 0.75 + 1e-9 ? BAD : GOOD });
    el('line', { x1: X(0.75), y1: y - 6, x2: X(0.75), y2: y + 22, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' });
    mono(X(0.75), y - 10, '0.75', { 'font-size': 13.5, 'text-anchor': 'middle', fill: INK });
    tx(x - 12, y + 13, o.label || '부하율', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end' });
    mono(x + w + 12, y + 14, v.toFixed(v === 0 || v >= 1 ? (v % 1 ? 2 : 1) : 3).replace(/0+$/, '').replace(/\.$/, ''), { 'font-size': 16, 'font-weight': 800, fill: v > 0.75 + 1e-9 ? BAD : GOOD }); }
  function oldItems(keys) { const out = []; OLD.forEach((lst, b) => lst.slice().reverse().forEach((key) => { if (keys.includes(key)) out.push({ key, b }); })); return out; }
  function s3(t, c) { const { k, u, beat, prev } = c, L = beat.loadDemo, pL = prev && prev.loadDemo ? prev.loadDemo : L;
    const ox = 140, oy = 150, ocw = 170, nx = 60, ny = 360, ncw = 106;
    tx(40, 34, `옛 버킷 (size ${L.before.size})`, { 'font-size': 15, 'font-weight': 800, fill: MUT });
    if (k === 0) { stacks(ox, oy, 4, ocw, oldItems(['kiwi', 'melon', 'lime']).map((it, i) => Object.assign(it, { s: pop(u, 0.2 + i * 0.25) })));
      gauge(250, 250, 460, tween(0, 0.75, u)); mono(480, 300, 'count 3 / size 4 = 0.75', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      tx(480, 340, '#define LOAD_FACTOR_MAX 0.75 · 넘으면 리스트가 길어지기 시작한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 5) { stacks(ox, oy - 40, 4, ocw, oldItems(Object.keys(NEW)), { op: 0.45 });
      gauge(250, 200, 460, tween(1.5, 1.5, u), { label: '전 (size 4)' }); gauge(250, 250, 460, tween(1.5, 0.75, u, 1.6), { label: '후 (size 8)' });
      mono(480, 316, 'if ((double)count / size > 0.75) ht_resize(ht);', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(480, 356, '리사이즈는 가끔 O(n) · 평균으로 나누면 삽입은 O(1)', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(480, 390, '리사이즈가 없으면 count 가 늘수록 리스트만 길어진다', fade(u, 2.3), { 'font-size': 15 }); return; }
    tx(40, 254, `새 버킷 (size 8, calloc 으로 전부 NULL)`, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.8) : 1 });
    const moved1 = ['lime', 'melon', 'kiwi'], all = Object.keys(NEW);
    const mv = (key) => (k === 1 ? 0 : k === 2 ? (moved1.includes(key) ? E(u, 0.3 + moved1.indexOf(key) * 0.4, 1.0 + moved1.indexOf(key) * 0.4) : 0) : k === 3 ? (moved1.includes(key) ? 1 : E(u, 0.3 + ['cherry', 'mango', 'apple'].indexOf(key) * 0.4, 1.0 + ['cherry', 'mango', 'apple'].indexOf(key) * 0.4)) : 1);
    const oldOp = k === 4 ? 1 - E(u, 0.3, 1.2) : 1;
    stacks(ox, oy, 4, ocw, [], { op: oldOp, stroke: k >= 1 && k < 4 ? BAD : INK });
    // 각 키의 옛 자리·새 자리
    const lvlO = {}, oPos = {}; OLD.forEach((lst, b) => lst.slice().reverse().forEach((key) => { const l = lvlO[b] = (lvlO[b] || 0) + 1; oPos[key] = [ox + b * ocw + ocw / 2, oy - 6 - l * 30]; }));
    // 새 버킷 쌓는 순서 = 옮긴 순서 (머리에 끼우므로 나중 것이 위)
    const order = ['lime', 'melon', 'kiwi', 'cherry', 'mango', 'apple'], lvlN = {}, nPos = {};
    order.forEach((key) => { const b = NEW[key], l = lvlN[b] = (lvlN[b] || 0) + 1; nPos[key] = [nx + b * ncw + ncw / 2, ny - 6 - l * 30]; });
    stacks(nx, ny, 8, ncw, [], { op: k === 1 ? fade(u, 0.5) : 1, stroke: ACC });
    all.forEach((key) => { const f = mv(key); if (k === 4 || f >= 1) { card(nPos[key][0], nPos[key][1] + 13, ncw - 14, 26, { rx: 4, text: key, fs: 13.5, mono: true, fw: 700, stroke: GOOD, fill: GOODBG }); return; }
      const x = lerp(oPos[key][0], nPos[key][0], f), y = lerp(oPos[key][1], nPos[key][1], f) - Math.sin(f * Math.PI) * 30;
      card(x, y + 13, f > 0 ? ncw - 14 : ocw - 14, 26, { rx: 4, text: key, fs: 13.5, mono: true, fw: 700, stroke: f > 0 ? ACC : INFO, fill: f > 0 ? ACCBG : INFOBG, op: oldOp }); });
    const lf = k === 1 ? 1.5 : k === 2 ? tween(1.5, 0.75, u) : k === 3 ? tween(0.75, 0, u) : 0;
    if (k <= 3) { mono(900, 34, `옛 쪽 부하율 ${(lf).toFixed(2)}`, { 'font-size': 15, 'font-weight': 800, fill: lf > 0.75 ? BAD : MUT, 'text-anchor': 'end' }); }
    if (k === 1) tx(700, 254, 'count 6 / size 4 = 1.5 > 0.75', { 'font-size': 15, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 1.4) });
    if (k === 2 || k === 3) tx(700, 254, 'j = hash % 8 · 복사가 아니라 다시 해시', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
    if (k === 4) { mono(480, 120, 'free(ht->buckets);  ht->size = 8;', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(700, 254, '노드는 재활용 · 부하율 6 / 8 = 0.75', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); } }

  // ---------- 4. 좋은 해시 vs 나쁜 해시 ----------
  function hist(x, y, w, h, bars, prevBars, max, u, col, title, note) {
    tx(x, y - 16, title, { 'font-size': 15.5, 'font-weight': 800, fill: col });
    const bw = w / 8; el('line', { x1: x, y1: y + h, x2: x + w, y2: y + h, stroke: MUT, 'stroke-width': 1.5 });
    bars.forEach((v, i) => { const pv = prevBars ? prevBars[i] : 0, vv = tween(pv, v, u), hh = (vv / max) * (h - 26);
      if (hh > 0.5) el('rect', { x: x + i * bw + 5, y: y + h - hh, width: bw - 10, height: hh, rx: 3, fill: col, opacity: 0.85 });
      mono(x + i * bw + bw / 2, y + h - hh - 6, String(Math.round(vv)), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, opacity: Math.round(vv) ? 1 : 0.35 });
      mono(x + i * bw + bw / 2, y + h + 18, String(i), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    tx(x + w / 2, y + h + 46, note, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 600, opacity: fade(u, 1.6) }); }
  function s4(t, c) { const { k, u, beat, prev } = c, d = beat.dist, pd = prev && prev.dist;
    const n = d.good.bars.reduce((a, b) => a + b, 0), max = Math.max(d.good.maxLen, d.bad.maxLen);
    mono(480, 30, `같은 키 ${n}개 (${n === 100 ? 'key0 ~ key99' : `key0 ~ key${n - 1}`}) 를 8칸에`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
    hist(50, 90, 400, 230, d.good.bars, pd && pd.good.bars.reduce((a, b) => a + b, 0) === n ? pd.good.bars : null, max, u, GOOD, d.good.title, d.good.note);
    hist(510, 90, 400, 230, d.bad.bars, pd && pd.bad.bars.reduce((a, b) => a + b, 0) === n && pd.bad.title === d.bad.title ? pd.bad.bars : null, max, u, BAD, d.bad.title, d.bad.note);
    if (k === 1) mono(710, 410, "key[0] = 'k' = 107 · 107 % 8 = 3", { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
    if (k === 4) mono(480, 410, '한 칸 최대 14개 vs 100개', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ---------- 5. 개방 주소법 ----------
  const SX = 80, SW = 100, SY = 190;
  const sx = (i) => SX + i * SW + SW / 2;
  function slots(sl, o) { o = o || {};
    sl.forEach((s, i) => { const st = s.state, col = st === 'empty' ? GRID : st === 'tomb' ? MUT : st === 'probed' ? ACC : INK;
      const sc = o.s ? o.s(i) : 1;
      card(sx(i), SY, SW - 8, 56, { rx: 6, stroke: col, fill: st === 'empty' ? SOFT : st === 'tomb' ? SOFT : st === 'probed' ? ACCBG : PANEL, sw: 2, dash: st === 'empty' ? '5 4' : null, s: sc });
      const key = st === 'tomb' ? '묘비' : s.key;
      if (key && sc > 0.5) tx(sx(i), SY + 6, key, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: st === 'tomb' ? null : 'mono', fill: st === 'tomb' ? MUT : st === 'probed' ? ACC : INK });
      mono(sx(i), SY + 50, st === 'empty' ? 'EMPTY' : st === 'tomb' ? 'TOMB' : 'FULL', { 'font-size': 13.5, 'text-anchor': 'middle', fill: st === 'empty' ? OFF : st === 'tomb' ? WARN : MUT, 'font-weight': 700 });
      mono(sx(i), SY - 40, `[${i}]`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }); }
  // 탐사 경로: 칸 번호 배열을 따라 점이 뛴다
  function hop(path, u, a, b, col) { const n = path.length - 1, f = E(u, a, b) * n, i = Math.min(n - 1, Math.floor(f)), r = f - i;
    if (n === 0) { el('circle', { cx: sx(path[0]), cy: SY - 62, r: 8, fill: col }); return path[0]; }
    const p = path[i], q = path[i + 1], wrap = q < p, x = wrap ? (r < 0.5 ? lerp(sx(p), SX + 8 * SW + 20, r * 2) : lerp(SX - 20, sx(q), r * 2 - 1)) : lerp(sx(p), sx(q), r);
    el('circle', { cx: x, cy: SY - 62 - Math.sin(r * Math.PI) * 18, r: 8, fill: col });
    return f >= n - 1e-6 ? path[n] : path[i]; }
  function s5(t, c) { const { k, u, beat } = c, sl = beat.probe.slots;
    if (k === 0) { slots(sl, { s: (i) => pop(u, 0.2 + i * 0.08) });
      mono(480, 70, 'typedef enum { EMPTY, FULL, TOMBSTONE } SlotState;', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      tx(480, 320, '리스트도 노드도 없다 · 값이 배열 안에 그대로 들어간다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.4) });
      sub(480, 352, '그래서 "빈칸" 과 "지운 칸" 을 구별할 상태가 필요하다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 1) { const order = [1, 7, 0, 4];
      slots(sl, { s: (i) => (sl[i].state === 'empty' ? 1 : pop(u, 0.3 + order.indexOf(i) * 0.35)) });
      tx(480, 320, 'kiwi 1 · apple 7 · melon 0 · lime 4 · 자기 자리가 비어 있었다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(480, 352, '다음 칸은 (i + n) % size · 끝에서는 0 으로 돌아온다', fade(u, 2.2), { 'font-size': 15 }); return; }
    if (k === 2) { const land = u > 2.0; slots(sl.map((s, i) => (i === 2 && !land ? { state: 'empty', key: '' } : s)), { s: (i) => (i === 2 ? (land ? pop(u, 2.0) : 1) : 1) });
      pill(480, 70, 'mango · hash % 8 = 7', ACC, pop(u, 0.1), { mono: true, fs: 15 });
      const at = hop([7, 0, 1, 2], u, 0.4, 1.9, ACC);
      ['7 apple ≠', '0 melon ≠', '1 kiwi ≠', '2 EMPTY → 저장'].forEach((s, i) => mono(110 + i * 200, 320, s, { 'font-size': 14.5, 'font-weight': 700, fill: i === 3 ? ACC : MUT, opacity: fade(u, 0.5 + i * 0.45) }));
      tx(480, 360, '끝에서 처음으로 감아 돌아 세 칸 밀렸다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { const del = E(u, 0.2, 0.7); slots(sl.map((s, i) => (i === 0 && del < 1 ? { state: 'full', key: 'melon' } : s)));
      if (del < 1) cross(sx(0), SY, 18, pop(u, 0.1));
      pill(480, 70, 'ht_get("mango") · 7 에서 출발', INFO, pop(u, 0.8), { mono: true, fs: 15 });
      const at = hop([7, 0], u, 1.0, 1.8, BAD);
      if (u > 1.8) { mono(sx(0), SY - 90, 'EMPTY → return 0', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); el('rect', { x: sx(2) - 48, y: SY - 30, width: 96, height: 60, rx: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); }
      tx(480, 320, 'mango 는 [2] 에 멀쩡히 있는데 조회가 [0] 에서 멈춘다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); return; }
    slots(sl, { s: (i) => (k === 4 && i === 0 ? pop(u, 0.4) : 1) });
    if (k === 4) { mono(480, 70, 'free(s->key);  s->state = TOMBSTONE;', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      tx(480, 320, '빈칸이 아니라 "예전에 뭔가 있었다" 는 표식', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(480, 352, '조회는 건너뛰고, 삽입은 이 자리를 다시 쓴다 · 너무 쌓이면 rehash 로 청소', fade(u, 1.9), { 'font-size': 15 }); return; }
    pill(480, 70, 'ht_get("mango")', INFO, 1, { mono: true, fs: 15 });
    hop([7, 0, 1, 2], u, 0.3, 1.9, INFO);
    ['7 apple ≠', '0 묘비 · 계속', '1 kiwi ≠', '2 mango ✓'].forEach((s, i) => mono(110 + i * 200, 320, s, { 'font-size': 14.5, 'font-weight': 700, fill: i === 3 ? GOOD : i === 1 ? WARN : MUT, opacity: fade(u, 0.4 + i * 0.45) }));
    tx(480, 362, '진짜 EMPTY 를 만날 때만 "없다" 고 판단한다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); }

  // ---------- 6. 전체 지도 ----------
  function s6(t, c) { const { k, u, beat } = c, n = beat.pipeline.chain.length;
    const nodes = [['"apple"', '키'], ['253337143', 'hash_djb2'], ['7', '% size(8)'], ['bucket[7]', 'mango → apple'], ['42', '값']];
    const xs = [90, 270, 440, 610, 830], y = 120;
    nodes.slice(0, Math.min(n, 5)).forEach(([v, l], i) => { const fresh = i === n - 1 && k < 3, s = fresh ? pop(u, 0.3) : 1;
      card(xs[i], y, i === 1 ? 150 : i === 3 ? 140 : 110, 52, { rx: 8, text: v, fs: 17, mono: true, fw: 800, stroke: i === 4 ? GOOD : i >= 2 ? ACC : INK, color: i === 4 ? GOOD : i >= 2 ? ACC : INK, s });
      tx(xs[i], y + 50, l, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: s });
      if (i > 0) grow(xs[i - 1] + (i - 1 === 1 ? 77 : i - 1 === 3 ? 72 : 57), y, xs[i] - (i === 1 ? 77 : i === 3 ? 72 : 57), y, fresh ? seg(u, 0.1, 0.4) : 1, MUT); });
    if (k === 0) tx(480, 250, '여기까지는 계산뿐 · 아직 배열을 건드리지 않았다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.0) });
    if (k === 1) tx(480, 250, 'size 가 바뀌면 이 결과가 통째로 바뀐다 · 리사이즈가 rehash 인 이유', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.0) });
    if (k === 2) { tx(480, 250, '이 칸 안의 길이가 성능을 정한다 · 평균 O(1), 한 칸에 몰리면 O(n)', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) }); }
    if (k === 3) { mono(480, 250, 'ht_put(ht, "apple", 42);', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(480, 290, 'C++  m["apple"] = 42      Python  d["apple"] = 42', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      dot([[xs[0], y + 30], [xs[4], y + 30]], seg(u, 0.5, 1.6), ACC, 7); }
    if (k === 4) { R.terminal(250, 210, 460, 90, ['$ ./summary', u > 0.8 ? 'apple=42' : ''], 2, { title: 'ht_get → printf' });
      const fr = E(u, 1.4, 2.3); for (let i = 0; i < 6; i++) el('rect', { x: 330 + i * 52, y: 340 + fr * 30, width: 40, height: 22, rx: 4, fill: OFF, opacity: 1 - fr });
      mono(480, 404, 'ht_free(ht);   // 버킷 배열 + 노드 전부', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.4) }); }
    if (k === 5) { [['C++ std::unordered_map', '체이닝', 230, '버킷마다 리스트 · Step 2'], ['Python dict', '개방 주소법', 730, '배열 안에서 탐사 · Step 5']].forEach(([a, b, x, d], i) => { const s = pop(u, 0.3 + i * 0.4);
        card(x, 290, 380, 110, { rx: 10, stroke: i ? INFO : ACC, sw: 2, s });
        tx(x, 270, a, { 'text-anchor': 'middle', 'font-size': 16.5, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.4 + i * 0.4) });
        tx(x, 300, b, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: i ? INFO : ACC, opacity: fade(u, 0.4 + i * 0.4) });
        tx(x, 326, d, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.6 + i * 0.4) }); }); } }

  const quiz = [
    { q: 'hash_djb2("apple")가 253337143일 때 버킷 8칸에서 apple이 들어갈 칸은 무엇인가?',
      o: ['bucket[7]', 'bucket[1]', 'bucket[5]'], a: 0,
      why: '253337143을 8로 나눈 나머지가 7이다. 조회 때도 같은 계산을 해서 곧장 [7]로 간다.' },
    { q: 'apple이 있는 bucket[7]에 mango가 또 떨어지면 체이닝은 어떻게 처리하나?',
      o: ['mango를 옆 칸 [0]에 넣는다', 'mango 노드를 리스트 머리에 끼워 mango → apple로 잇는다', 'apple을 지우고 mango로 덮는다'], a: 1,
      why: '키가 다르니(strcmp ≠ 0) 새 노드를 만들어 next를 기존 머리 apple로 잇고, 버킷이 mango를 가리키게 한다.' },
    { q: '버킷 4칸에 6개가 들어 부하율이 1.5다. 8칸으로 늘릴 때 기존 노드는 어떻게 옮기나?',
      o: ['옛 칸 번호 그대로 새 배열에 복사한다', '노드를 새로 malloc해 값을 복사한다', '모든 키를 hash % 8로 다시 계산해 새 칸에 붙인다'], a: 2,
      why: 'size가 바뀌면 나머지가 달라진다. 그래서 rehash하고, 노드는 그대로 재활용해 새 버킷 머리에 끼운다.' },
    { q: 'key0~key99 100개를 첫 글자만 쓰는 해시로 8칸에 넣으면 어떻게 되나?',
      o: ['100개가 전부 bucket[3] 한 칸에 몰린다', '칸마다 12~14개로 고르게 나뉜다', '칸마다 정확히 12.5개씩 들어간다'], a: 0,
      why: "첫 글자가 모두 'k'(107)이고 107 % 8 = 3이다. djb2는 같은 키를 칸마다 12~14개로 나눈다." },
    { q: '선형 탐사에서 melon을 지운 칸을 EMPTY로 두면 무슨 일이 생기나?',
      o: ['다음 삽입이 실패한다', '그 칸을 지나 저장된 mango를 조회가 못 찾는다', 'apple의 해시값이 바뀐다'], a: 1,
      why: 'mango 조회는 7에서 출발해 0에서 EMPTY를 만나면 "없다"고 멈춘다. 그래서 TOMBSTONE으로 표시한다.' },
    { q: 'C++ unordered_map과 Python dict가 충돌을 처리하는 방식은 각각 무엇인가?',
      o: ['둘 다 체이닝', 'unordered_map은 개방 주소법, dict는 체이닝', 'unordered_map은 체이닝, dict는 개방 주소법'], a: 2,
      why: 'unordered_map은 버킷마다 리스트를 매달고, dict는 배열 안에서 빈칸을 탐사한다.' },
  ];

  const summary = [
    '해시 테이블은 키를 정수로 바꾼 뒤 버킷 수로 나눈 나머지를 칸 번호로 쓴다.',
    '다른 키가 같은 칸에 떨어지는 충돌은 체이닝이나 개방 주소법으로 처리한다.',
    '부하율이 0.75를 넘으면 버킷을 2배로 늘리고 모든 키를 다시 해시한다.',
    'key0~key99를 djb2로 넣으면 칸마다 12~14개, 첫 글자 해시로 넣으면 한 칸에 100개다.',
  ];
  const review = [
    { q: '평소엔 빠르던 캐시 서버가 "user_" 로 시작하는 키가 몰린 날만 느려졌다. 먼저 의심할 것은?',
      o: ['해시가 키의 앞부분만 보고 있어 한 버킷에 몰렸다', '버킷 배열이 너무 커서 메모리가 부족하다', 'free를 너무 자주 불렀다'], a: 0,
      why: '앞글자만 보는 해시는 접두사가 같은 키를 한 칸에 몰아 조회가 O(n)이 된다. 모든 글자를 섞는 검증된 해시로 바꾼다.' },
    { q: '체이닝 해시 테이블을 오래 돌렸더니 메모리가 계속 는다. 리사이즈는 잘 되고 있다. 가장 그럴듯한 원인은?',
      o: ['부하율 임계치를 0.75로 둔 것', 'ht_free나 삭제 때 버킷 리스트의 노드를 끝까지 free하지 않았다', 'djb2 시드가 5381이라서'], a: 1,
      why: '체이닝 노드와 strdup한 키는 모두 malloc한 힙 메모리다. 버킷마다 리스트를 끝까지 돌며 하나씩 free해야 한다.' },
    { q: '개방 주소법 테이블에서 삭제와 삽입을 반복했더니 조회가 점점 느려진다. 무엇이 쌓였나?',
      o: ['EMPTY 칸', 'next 포인터', 'TOMBSTONE 칸'], a: 2,
      why: '조회는 묘비를 건너뛰며 계속 탐사하므로 묘비가 쌓일수록 경로가 길어진다. 주기적으로 rehash해 청소한다.' },
  ];

  R.page({ title: '해시 테이블 메모리', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
