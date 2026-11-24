/* IV-2-2 스택·큐 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 출력값(peek=30, pop=30, pop=20), 원형 큐의 front/rear, 괄호 검사·BFS 순서는 zig cc 로 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check, fly } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const fi = (v) => String(Math.round(v));

  // ---------- 1. 배열 스택 ----------
  const SK = { x: 300, base: 360, h: 46, w: 130, n: 6 };
  const slotY = (i) => SK.base - (i + 1) * SK.h;      // 칸 i 의 윗변
  function stackFrame(vals, o) { o = o || {};
    for (let i = 0; i < SK.n; i++) { const y = slotY(i), has = vals[i] != null, live = has && (o.top == null || i <= o.top), st = (o.style && o.style(i)) || {};
      el('rect', { x: SK.x, y, width: SK.w, height: SK.h, fill: live ? (st.fill || PANEL) : SOFT, stroke: st.stroke || (live ? INK : GRID), 'stroke-width': 2, 'stroke-dasharray': live ? null : '4 4', opacity: st.op ?? 1 });
      if (has && st.hide !== true) mono(SK.x + SK.w / 2, y + 30, String(vals[i]), { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: live ? (st.color || INK) : OFF, opacity: st.op ?? 1 });
      mono(SK.x + SK.w + 14, y + 29, `[${i}]`, { 'font-size': 13.5, fill: MUT }); }
    mono(SK.x + SK.w / 2, slotY(SK.n - 1) - 10, '⋮  [99]', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
  // top 화살표: 값 t(-1 이면 바닥 아래)
  function topArrow(t, col) { const y = t < 0 ? SK.base + 22 : slotY(t) + SK.h / 2;
    grow(SK.x - 110, y, SK.x - 6, y, 1, col || ACC);
    mono(SK.x - 116, y + 5, `top = ${t < 0 && t > -1 ? '-1' : fi(t)}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: col || ACC }); }
  function s1(t, c) { const { k, u, beat, prev } = c, st = beat.stackState, pst = prev && prev.stackState;
    const vals = st.cells.map((x) => x.v);
    if (k === 0) { for (let i = 0; i < SK.n; i++) { const s = pop(u, 0.2 + i * 0.1); if (s > 0) el('rect', { x: SK.x, y: slotY(i), width: SK.w, height: SK.h, fill: SOFT, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: s }); }
      mono(SK.x + SK.w / 2, slotY(SK.n - 1) - 10, '⋮  [99]', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      mono(SK.x - 116, SK.base - 100, 'top = ?', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 1.2) });
      tx(660, 160, 'int data[100];', { 'font-size': 17, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(660, 196, 'int top;', { 'font-size': 17, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(660, 260, '맨 위 칸 번호 하나만 들고 다닌다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 1) { stackFrame([]); topArrow(-1);
      mono(660, 170, 'init(&s);   top = -1', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      mono(660, 220, 'is_empty: top == -1  → true', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) });
      mono(660, 254, 'is_full:  top == 99  → false', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) }); return; }
    if (k === 2 || k === 3) { const order = k === 2 ? [0] : [1, 2], startTop = k === 2 ? -1 : 0;
      const shownTop = Math.min(st.top, startTop + Math.floor(E(u, 0.3, 2.0) * order.length + 1e-6));
      stackFrame(vals.map((v, i) => (i <= shownTop ? v : null))); topArrow(tween(startTop, st.top, u, 1.8));
      order.forEach((i, j) => fly(SK.x + SK.w / 2, 40, SK.x + SK.w / 2, slotY(i) + SK.h / 2, seg(u, 0.3 + j * 0.85, 1.0 + j * 0.85), String(vals[i]), { mono: true }));
      mono(660, 170, k === 2 ? 's->data[++s->top] = 10;' : 'push(&s, 20);  push(&s, 30);', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      tx(660, 220, k === 2 ? 'top 을 먼저 올리고 그 칸에 쓴다 · -1 → 0' : '30 이 맨 위 · top 0 → 2', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 4) { stackFrame(vals, { top: 2, style: (i) => (i === 2 ? { stroke: INFO, fill: INFOBG } : {}) }); topArrow(2);
      const g = E(u, 0.4, 1.3); if (g > 0.25) card(lerp(SK.x + SK.w / 2, 660, g), lerp(slotY(2) + 23, 170, g), 70, 36, { rx: 6, text: '30', fs: 17, mono: true, fw: 800, stroke: INFO, color: INFO, fill: PANEL, op: fade(u, 0.3) });
      mono(660, 230, 'peek=30', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.4) });
      tx(660, 270, '읽기만 한다 · top 은 2 그대로', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 5) { const out = E(u, 0.3, 1.3);
      stackFrame([10, 20, 30], { top: out > 0.5 ? 1 : 2, style: (i) => (i === 2 ? { hide: out < 1 } : {}) }); topArrow(tween(2, 1, u, 1.4));
      if (out < 1) card(lerp(SK.x + SK.w / 2, 660, out), lerp(slotY(2) + 23, 170, out), 70, 36, { rx: 6, text: '30', fs: 17, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
      else card(660, 170, 70, 36, { rx: 6, text: '30', fs: 17, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
      mono(660, 230, 'return s->data[s->top--];', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(660, 270, '값은 칸에 남지만 top 밖이라 없는 것', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k6: 출력 순서
    const p2 = E(u, 1.2, 1.8), p3 = E(u, 2.0, 2.5);
    stackFrame([10, 20, 30], { top: p3 > 0.5 ? 0 : p2 > 0.5 ? 1 : 2 }); topArrow(p3 > 0.5 ? 0 : p2 > 0.5 ? 1 : 2);
    R.terminal(560, 120, 340, 150, ['$ ./stack_array', 'peek=30', 'pop =30', 'pop =20'], 1 + (u > 0.6 ? 1 : 0) + (u > 1.5 ? 1 : 0) + (u > 2.3 ? 1 : 0), {});
    tx(730, 320, '넣은 역순으로 나온다 · LIFO', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.3) });
    sub(730, 350, '세 연산 모두 top 한 곳에서 · O(1)', fade(u, 2.5), { 'font-size': 15 }); }

  // ---------- 2. 경계 검사와 연결 리스트 스택 ----------
  function lnode(cx, cy, v, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -50, y: -21, width: 100, height: 42, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2 }, g);
    el('line', { x1: 4, y1: -21, x2: 4, y2: 21, stroke: o.stroke || INK, 'stroke-width': 1.6 }, g);
    tx(-23, 7, String(v), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: o.color || INK }, g);
    if (o.last) tx(27, 5, 'NULL', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g); else el('circle', { cx: 27, cy: 0, r: 5, fill: ACC }, g); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { // 오버플로: [96..99] 꽉 참
      const x = 330, w = 130, h = 46;
      [96, 97, 98, 99].forEach((i, j) => { const y = 330 - (j + 1) * h; el('rect', { x, y, width: w, height: h, fill: PANEL, stroke: INK, 'stroke-width': 2 }); mono(x + w / 2, y + 30, '…', { 'font-size': 16, 'text-anchor': 'middle', fill: MUT }); mono(x + w + 14, y + 29, `[${i}]`, { 'font-size': 13.5, fill: MUT }); });
      el('line', { x1: x - 30, y1: 330 - 4 * h, x2: x + w + 60, y2: 330 - 4 * h, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
      mono(x + w + 66, 330 - 4 * h + 5, '배열 끝', { 'font-size': 14, fill: BAD, 'font-weight': 800 });
      mono(x - 110, 330 - 4 * h + h / 2 + 5, 'top = 99', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' }); grow(x - 104, 330 - 3.5 * h, x - 6, 330 - 3.5 * h, 1, ACC);
      const b = seg(u, 0.3, 1.5), yy = b < 0.6 ? lerp(40, 120, b / 0.6) : lerp(120, 60, (b - 0.6) / 0.4);
      card(x + w / 2, yy - 20, 70, 34, { rx: 6, text: '40', fs: 16, mono: true, fw: 800, stroke: BAD, color: BAD, fill: BADBG, op: b > 0 ? 1 : 0 });
      mono(720, 250, 'if (is_full(s)) return false;', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      tx(720, 296, '검사가 없으면 data[100] 에 써서 옆 메모리를 덮는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { stackFrame([]); topArrow(-1);
      el('rect', { x: SK.x, y: SK.base + 4, width: SK.w, height: 40, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.0) });
      mono(SK.x + SK.w / 2, SK.base + 30, 'data[-1] ?', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      mono(660, 150, 'bool pop(Stack *s, int *out)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(660, 190, 'if (is_empty(s)) return false;', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.8) });
      tx(660, 240, '성공 여부는 반환값, 값은 *out 으로 따로', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 2) { const g = R.G(480, 170, pop(u, 0.2));
      el('rect', { x: -130, y: -32, width: 260, height: 64, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2.4 }, g); el('line', { x1: 0, y1: -32, x2: 0, y2: 32, stroke: INK, 'stroke-width': 1.8 }, g);
      tx(-65, 8, 'int val', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: ACC }, g); tx(65, 8, 'Node *next', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: INFO }, g);
      tx(480, 270, 'push 할 때마다 malloc 으로 한 칸씩 · CAP 같은 상한이 없다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      sub(480, 302, '대신 노드마다 next 포인터 공간과 malloc 비용이 든다', fade(u, 1.8), { 'font-size': 15 }); return; }
    // k3 pop_list, k4 push_list : 노드 30·20·10
    const y = 230, X = [330, 480, 630];
    card(140, y, 80, 38, { rx: 6, text: 'top', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
    if (k === 3) { const off = E(u, 0.6, 1.4), fr = E(u, 1.6, 2.3);
      lnode(X[0], y - 90 * off, 30, { stroke: off > 0.5 ? BAD : INK, s: 1 - fr * 0.8, op: 1 - fr });
      lnode(X[1], y, 20); lnode(X[2], y, 10, { last: true });
      if (off < 0.5) grow(X[0] + 32, y, X[1] - 53, y, 1, MUT); grow(X[1] + 32, y, X[2] - 53, y, 1, MUT);
      grow(180, y, off > 0.5 ? X[1] - 53 : X[0] - 53, y, 1, ACC);
      mono(X[0], y + 60, 'dead', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3) * (1 - fr) });
      mono(720, 110, '*out = 30;  *top = dead->next;  free(dead);', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      tx(480, 360, 'free 를 빼먹으면 pop 할 때마다 노드 하나씩 샌다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.2) }); return; }
    const sl = E(u, 1.2, 2.0), ny = lerp(y - 100, y, sl);
    lnode(X[0], ny, 30, { stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.2) });
    lnode(X[1], y, 20); lnode(X[2], y, 10, { last: true }); grow(X[1] + 32, y, X[2] - 53, y, 1, MUT);
    grow(X[0] + 32, ny, X[1] - 53, y, seg(u, 0.6, 1.1), MUT);
    if (sl < 1) grow(180, y, X[1] - 53, y, 1, OFF, { op: 1 - sl });
    if (sl > 0) grow(180, y, X[0] - 53, ny, sl, ACC);
    mono(720, 110, 'n->next = *top;  *top = n;', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    tx(480, 360, '머리에 끼우고 머리에서 뗀다 · 이동 없이 O(1)', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.2) }); }

  // ---------- 3. 순진한 배열 큐 ----------
  const QX = 180, QW = 100, QY = 190;
  const qx = (i) => QX + i * QW + QW / 2;
  function qcells(vals, o) { o = o || {};
    for (let i = 0; i < 6; i++) { const v = vals[i], st = (o.style && o.style(i)) || {};
      card(qx(i), QY, QW - 6, 54, { rx: 4, text: v == null ? '' : String(v), fs: 18, mono: true, fw: 800, stroke: st.stroke || (v == null ? GRID : INK), fill: st.fill || (v == null ? SOFT : PANEL), dash: v == null ? '4 4' : null, color: st.color });
      mono(qx(i), QY + 50, `[${i}]`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } }
  function qptr(name, at, col, below) { const x = at <= 5.5 ? qx(at) : QX + 6 * QW + 30, y = below ? QY + 70 : QY - 40;
    grow(x, below ? y + 36 : y - 26, x, below ? QY + 60 : QY - 30, 1, col);
    mono(x, below ? y + 56 : y - 34, `${name} = ${fi(at)}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }); }
  function s3(t, c) { const { k, u, beat, prev } = c, q = beat.queueState, pq = prev && prev.queueState;
    if (k === 0) { qcells([]); qptr('front', 0, INFO, true); qptr('rear', 0, ACC);
      tx(480, 380, 'front 는 뺄 자리, rear 는 다음에 넣을 자리', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) }); return; }
    if (k === 1) { const n = Math.min(3, Math.floor(E(u, 0.3, 2.1) * 3 + 1e-6));
      qcells([10, 20, 30].map((v, i) => (i < n ? v : null))); qptr('front', 0, INFO, true); qptr('rear', tween(0, 3, u, 1.9), ACC);
      [10, 20, 30].forEach((v, i) => fly(860, QY, qx(i), QY, seg(u, 0.3 + i * 0.6, 0.9 + i * 0.6), String(v), { mono: true }));
      mono(480, 380, 'q->data[q->rear++] = x;', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 2) { const out = E(u, 0.3, 0.9), sh = E(u, 1.0, 1.9);
      qcells([null, null, null]); qptr('front', 0, INFO, true); qptr('rear', tween(3, 2, u, 1.9), ACC);
      card(lerp(qx(0), 80, out), QY, QW - 10, 46, { rx: 4, text: '10', fs: 18, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, op: 1 - seg(u, 1.0, 1.4) });
      [[1, 20], [2, 30]].forEach(([i, v]) => card(lerp(qx(i), qx(i - 1), sh), QY, QW - 10, 46, { rx: 4, text: String(v), fs: 18, mono: true, fw: 800, stroke: WARN, fill: WARNBG }));
      mono(480, 380, 'memmove(q->data, q->data + 1, ...);', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      tx(480, 60, 'dequeue 한 번에 남은 원소 전부가 움직인다 · O(n)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { const out = E(u, 0.3, 1.0);
      qcells([null, 20, 30], { style: (i) => (i === 0 && u > 1.2 ? { fill: SOFT, stroke: BAD } : {}) }); qptr('front', tween(0, 1, u, 1.6), INFO, true); qptr('rear', 3, ACC);
      if (out < 1) card(lerp(qx(0), 80, out), QY, QW - 10, 46, { rx: 4, text: '10', fs: 18, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, op: 1 - out * 0.5 });
      if (u > 1.2) { el('path', { d: `M${qx(0) - 40},${QY - 20} L${qx(0) + 40},${QY + 20} M${qx(0) + 40},${QY - 20} L${qx(0) - 40},${QY + 20}`, stroke: BAD, 'stroke-width': 2, opacity: fade(u, 1.2) * 0.6 }); }
      mono(480, 380, 'return q->data[q->front++];', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(480, 60, 'O(1) 이지만 [0] 칸은 다시 쓸 길이 없다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) }); return; }
    // k4: 40 추가, rear 가 끝을 향한다
    qcells([null, 20, 30, u > 0.9 ? 40 : null], { style: (i) => (i === 0 ? { fill: SOFT, stroke: BAD } : {}) });
    fly(860, QY, qx(3), QY, seg(u, 0.2, 0.9), '40', { mono: true });
    qptr('front', 1, INFO, true); qptr('rear', tween(3, 4, u, 0.8), ACC);
    const ghost = E(u, 1.3, 2.2); if (ghost > 0) { const gx = lerp(qx(4), QX + 6 * QW + 30, ghost); el('circle', { cx: gx, cy: QY - 102, r: 7, fill: BAD, opacity: 0.8 }); }
    tx(480, 60, 'rear 가 CAP 에 닿으면 [0] 이 비어 있어도 "꽉 찼다"', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
    tx(480, 380, '해답은 끝과 처음을 잇는 원형 큐', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 2.3) }); }

  // ---------- 4. 원형 큐 ----------
  const RC = { x: 330, y: 215, r1: 90, r2: 160 };
  const ang = (i) => -Math.PI / 2 + (i / 8) * Math.PI * 2;   // 칸 i 시작 각
  function ring(cells, o) { o = o || {};
    for (let i = 0; i < 8; i++) { const a0 = ang(i) + 0.02, a1 = ang(i + 1) - 0.02, { x, y, r1, r2 } = RC, s = o.s ? o.s(i) : 1; if (s <= 0) continue;
      const P = (r, a) => `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`, v = cells[i] ? cells[i].v : null, st = (o.style && o.style(i)) || {};
      el('path', { d: `M${P(r1, a0)} L${P(r2, a0)} A${r2},${r2} 0 0 1 ${P(r2, a1)} L${P(r1, a1)} A${r1},${r1} 0 0 0 ${P(r1, a0)} Z`, fill: st.fill || (v == null ? SOFT : PANEL), stroke: st.stroke || (v == null ? GRID : INK), 'stroke-width': 2, opacity: s, 'stroke-dasharray': v == null ? '4 4' : null });
      const am = (a0 + a1) / 2;
      if (v != null) mono(x + 125 * Math.cos(am), y + 125 * Math.sin(am) + 6, String(v), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: s, fill: st.color || INK });
      mono(x + 186 * Math.cos(am), y + 186 * Math.sin(am) + 5, `[${i}]`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); } }
  function hand(pos, col, name, len) { const a = ang(pos) + Math.PI / 8, { x, y } = RC, L = len || 82;
    el('line', { x1: x, y1: y, x2: x + L * Math.cos(a), y2: y + L * Math.sin(a), stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round' });
    el('circle', { cx: x + L * Math.cos(a), cy: y + L * Math.sin(a), r: 6, fill: col }); }
  function legend(f, r, op) { mono(620, 70, `front = ${fi(f)}`, { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: op ?? 1 }); mono(800, 70, `rear = ${fi(r)}`, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: op ?? 1 }); }
  function condRows(rows, u0) { rows.forEach(([a, b, col], i) => { mono(600, 230 + i * 58, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u0, 0.6 + i * 0.4) }); mono(620, 254 + i * 58, '→ ' + b, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u0, 0.8 + i * 0.4) }); }); }
  function s4(t, c) { const { k, u, beat, prev } = c, cq = beat.circular, pc = prev && prev.circular ? prev.circular : cq;
    // 회전하는 바늘 위치: 앞 beat 값에서 이어 돈다 (wrap 은 +8 해서 앞으로 돌기)
    const unwrap = (a, b) => (b < a ? b + 8 : b);
    const fpos = tween(pc.front, unwrap(pc.front, cq.front), u, 1.6), rpos = tween(pc.rear, unwrap(pc.rear, cq.rear), u, 1.8);
    let cells = cq.cells;
    if (k === 2) { const n = Math.floor(E(u, 0.2, 2.0) * 5 + 1e-6); cells = cq.cells.map((x, i) => (i < n ? x : { v: null })); }
    if (k === 5) { const n = Math.floor(E(u, 0.2, 2.0) * 4 + 1e-6), seq = [5, 6, 7, 0]; cells = cq.cells.map((x, i) => (seq.indexOf(i) >= n ? { v: null } : x)); }
    ring(cells, { s: k === 0 ? (i) => pop(u, 0.2 + i * 0.08) : null, style: (i) => (k === 5 && i === 1 && u > 2.0 ? { stroke: WARN, fill: WARNBG } : {}) });
    if (k >= 1 || u > 1) { hand(rpos, ACC, 'rear', 82); hand(fpos, INFO, 'front', 58); }
    el('circle', { cx: RC.x, cy: RC.y, r: 7, fill: INK });
    legend(fpos % 8, rpos % 8, k === 0 ? fade(u, 1.0) : 1);
    if (k === 0) { tx(620, 140, 'CAP = 8 · 실제 저장은 7개', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.3) });
      sub(760, 180, '한 칸을 늘 비워 둔다 (이유는 곧)', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 1) { condRows([['빔: front == rear', '0 == 0 → true', GOOD], ['꽉 참: (rear+1) % 8 == front', '1 == 0 → false', MUT]], u); return; }
    if (k === 2) { mono(620, 140, 'q->rear = (q->rear + 1) % CAP;', { 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 0.2) });
      condRows([['넣은 값', '30 40 50 60 70', INK], ['저장된 개수', '5 (최대 7)', INFO]], u); return; }
    if (k === 3) { const out = E(u, 0.3, 1.2); if (out < 1) card(lerp(RC.x + 125 * Math.cos(ang(0) + Math.PI / 8), 700, out), lerp(RC.y + 125 * Math.sin(ang(0) + Math.PI / 8), 150, out), 60, 32, { rx: 6, text: '30', fs: 16, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
      else card(700, 150, 60, 32, { rx: 6, text: '30', fs: 16, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
      condRows([['q->front = (q->front + 1) % CAP', '0 → 1', INFO], ['[0] 칸', '나중에 rear 가 다시 쓴다', MUT]], u); return; }
    if (k === 4) { condRows([['빔: front == rear', '2 == 5 → false', MUT], ['꽉 참: (5+1) % 8 == 2', '6 == 2 → false', MUT], ['저장된 개수', '3', INFO]], u); return; }
    condRows([['80·90·100·110 enqueue', 'rear 5 → 1 (7 다음 0)', ACC], ['꽉 참: (1+1) % 8 == 2', 'true', BAD], ['enqueue(120)', 'false · [1] 은 비워 둔다', WARN]], u); }

  // ---------- 5. 활용: 괄호 검사 · BFS ----------
  const STR = '{[()]}';
  function tape(x, y, s, hot, o) { o = o || {}; s.split('').forEach((ch, i) => card(x + i * 46, y, 40, 44, { rx: 6, text: ch, fs: 20, mono: true, fw: 800, stroke: hot === i ? ACC : (o.col && o.col(i)) || INK, fill: hot === i ? ACCBG : PANEL, color: hot === i ? ACC : INK })); }
  function cstack(x, base, items, o) { o = o || {};
    for (let i = 0; i < 4; i++) el('rect', { x, y: base - (i + 1) * 40, width: 80, height: 40, fill: i < items.length ? PANEL : SOFT, stroke: i < items.length ? INK : GRID, 'stroke-width': 2, 'stroke-dasharray': i < items.length ? null : '4 4' });
    items.forEach((ch, i) => mono(x + 40, base - i * 40 - 13, ch, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: i === items.length - 1 ? ACC : INK }));
    mono(x + 40, base + 26, `top = ${items.length - 1}`, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    tx(x + 40, base - 4 * 40 - 12, 'st[]', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', fill: MUT }); }
  const GN = [[620, 120], [540, 230], [740, 230], [490, 340], [800, 340]], GE = [[0, 1], [0, 2], [1, 3], [2, 4]];
  function graph(visited, active, o) { GE.forEach(([a, b]) => el('line', { x1: GN[a][0], y1: GN[a][1], x2: GN[b][0], y2: GN[b][1], stroke: GRID, 'stroke-width': 3 }));
    GN.forEach(([x, y], i) => { const v = visited.indexOf(i), on = active === i;
      el('circle', { cx: x, cy: y, r: 26, fill: on ? ACC : v >= 0 ? GOODBG : PANEL, stroke: on ? ACC : v >= 0 ? GOOD : INK, 'stroke-width': 2.5 });
      tx(x, y + 6, String(i), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono', fill: on ? PANEL : INK });
      if (v >= 0 && o && o.order) mono(x + 34, y - 18, `${v + 1}번째`, { 'font-size': 13.5, fill: GOOD, 'font-weight': 700 }); }); }
  function qstrip(x, y, items, front, rear) { for (let i = 0; i < 5; i++) { const v = items[i];
      card(x + i * 56 + 26, y, 50, 40, { rx: 4, text: v == null ? '' : String(v), fs: 17, mono: true, fw: 800, stroke: v == null ? GRID : i < front ? OFF : INK, color: i < front ? OFF : INK, fill: v == null ? SOFT : PANEL, dash: v == null ? '4 4' : null }); }
    mono(x + front * 56 + 26, y + 44, '▲ front', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700 });
    mono(x + rear * 56 + 26, y - 30, '▼ rear', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', 'font-weight': 700 });
    tx(x - 14, y + 6, 'q[]', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'end', fill: MUT }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) { mono(80, 70, `balanced("${STR}")`, { 'font-size': 16, 'font-weight': 800 });
      if (k === 0) { tape(100, 140, STR, -1); cstack(700, 330, []); tx(400, 270, '가장 최근에 연 괄호부터 닫혀야 한다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        sub(400, 300, '그래서 LIFO 인 스택이 맞다', fade(u, 1.6), { 'font-size': 15 }); return; }
      if (k === 1) { const n = Math.min(3, Math.floor(E(u, 0.3, 2.0) * 3 + 1e-6)), i = Math.min(2, n);
        tape(100, 140, STR, u < 2.0 ? Math.min(2, Math.floor(E(u, 0.3, 2.0) * 3)) : -1); cstack(700, 330, STR.slice(0, n).split(''));
        mono(400, 270, 'st[++top] = c;', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
        tx(400, 310, '여는 괄호 셋을 차례로 쌓는다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
      if (k === 2) { const n = Math.min(3, Math.floor(E(u, 0.3, 2.2) * 3 + 1e-6)), hot = Math.min(5, 3 + Math.floor(E(u, 0.3, 2.2) * 3 - 1e-6));
        tape(100, 140, STR, hot, { col: (i) => (i < 3 + n ? GOOD : null) }); cstack(700, 330, STR.slice(0, 3 - n).split(''));
        mono(400, 270, 'char o = st[top--];   // 최근 것과 대조', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
        ['( 와 )', '[ 와 ]', '{ 와 }'].slice(0, n).forEach((s, i) => { check(260 + i * 140, 330, 9, 1); mono(280 + i * 140, 336, s, { 'font-size': 15, 'font-weight': 800, fill: GOOD }); }); return; }
      tape(100, 140, STR, -1, { col: () => GOOD }); cstack(700, 330, []);
      mono(400, 250, 'return top == -1;   // => true', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.2) });
      [['"([)]"', '] 가 ( 와 안 맞음', 0], ['"(()"', '끝에 ( 가 남음', 1], ['")("', '첫 ) 에서 top < 0', 2]].forEach(([a, b, i]) => { const y = 300 + i * 34, s = fade(u, 0.9 + i * 0.4);
        cross(90, y - 5, 7, s); mono(110, y, a, { 'font-size': 15, 'font-weight': 800, opacity: s }); tx(210, y, `false · ${b}`, { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: s }); }); return; }
    // BFS
    mono(80, 50, 'bfs(0, 5, adj)', { 'font-size': 16, 'font-weight': 800 });
    if (k === 4) { graph([0], null); qstrip(110, 200, [0], 0, 1);
      tx(240, 300, 'q[rear++] = start;  seen[0] = true;', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.5) });
      sub(240, 330, '간선 0-1 · 0-2 · 1-3 · 2-4', fade(u, 1.2), { 'font-size': 15 }); return; }
    const steps = [[0, [0, 1, 2]], [1, [0, 1, 2, 3]], [2, [0, 1, 2, 3, 4]], [3, [0, 1, 2, 3, 4]], [4, [0, 1, 2, 3, 4]]];
    const f = Math.min(4.999, E(u, 0.2, 2.4) * 5), i = Math.floor(f), [cur, q] = steps[i];
    graph([0, 1, 2, 3, 4].slice(0, i + 1), cur, { order: true }); qstrip(110, 200, q, i + 1, q.length);
    mono(240, 300, `u = q[front++] = ${cur}`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    mono(240, 340, `방문 순서  ${[0, 1, 2, 3, 4].slice(0, i + 1).join(' ')}`, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle' });
    tx(240, 384, '스택으로 바꾸면 DFS 가 된다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 2.4) }); }

  const quiz = [
    { q: '10, 20, 30을 차례로 push한 뒤 peek, pop, pop을 하면 출력은 무엇인가?',
      o: ['30, 30, 20', '10, 10, 20', '30, 20, 10'], a: 0,
      why: 'peek은 top만 읽고 그대로 두니 30, 첫 pop도 30, 그다음 pop은 20이다. 넣은 역순으로 나온다.' },
    { q: '연결 리스트 스택의 pop_list에서 뗀 노드에 free를 빠뜨리면 어떻게 되나?',
      o: ['다음 pop이 같은 값을 다시 꺼낸다', 'pop할 때마다 노드 하나씩 메모리가 샌다', 'top이 NULL로 바뀐다'], a: 1,
      why: '노드는 push_list에서 malloc한 힙 메모리다. head에서 떼기만 하고 free하지 않으면 그 노드로 가는 주소가 사라진 채 남는다.' },
    { q: '배열 큐에서 front 인덱스만 미는 방식 B의 문제는 무엇인가?',
      o: ['dequeue가 O(n)이 된다', '꺼낸 값이 틀린다', '앞쪽 빈칸을 다시 못 써서 rear가 끝에 닿으면 꽉 찼다고 오판한다'], a: 2,
      why: 'dequeue는 O(1)이지만 [0] 같은 앞칸이 버려진다. 당기는 방식 A는 반대로 dequeue마다 남은 원소를 전부 옮긴다.' },
    { q: 'CAP 8인 원형 큐에서 front가 2, rear가 1일 때 상태는 무엇인가?',
      o: ['비어 있다', '꽉 찼다', '하나만 들어 있다'], a: 1,
      why: '(1+1) % 8 == 2 == front라서 is_full이 참이다. 한 칸을 비워 두므로 7개가 들어 있다.' },
    { q: '괄호 검사에 스택을 쓰는 까닭은 무엇인가?',
      o: ['가장 최근에 연 괄호가 가장 먼저 닫혀야 하기 때문이다', '괄호를 먼저 연 순서대로 닫아야 하기 때문이다', '괄호 개수만 세면 되기 때문이다'], a: 0,
      why: '"{[()]}"는 ( 가 맨 위에 있다가 )와 먼저 짝지어진다. 개수만 세면 "([)]"를 걸러내지 못한다.' },
  ];

  const summary = [
    '스택은 top 한쪽에서만 넣고 빼서 넣은 역순으로 나온다.',
    '배열 스택은 push에 is_full, pop에 is_empty 검사를 꼭 넣는다.',
    '배열 큐는 당기면 dequeue가 O(n)이고 front만 밀면 앞칸이 버려진다.',
    '원형 큐는 % CAP로 감아 돌고, 한 칸을 비워 빈 상태와 꽉 찬 상태를 가른다.',
  ];
  const review = [
    { q: '프린터 작업을 들어온 순서대로 처리해야 한다. 배열로 만들 때 가장 알맞은 구조는?',
      o: ['배열 스택', '% CAP로 도는 원형 큐', 'dequeue마다 memmove로 당기는 큐'], a: 1,
      why: '먼저 온 작업이 먼저 나가야 하니 큐다. 원형 큐는 앞칸을 다시 쓰면서 enqueue와 dequeue가 모두 O(1)이다.' },
    { q: 'CAP 8 원형 큐에 7개를 넣은 뒤 8번째 enqueue가 false를 돌려줬다. 무엇을 의심해야 하나?',
      o: ['버그다, 8칸이니 8개가 들어가야 한다', 'rear가 음수가 됐다', '정상이다, 빈 상태와 구분하려고 한 칸을 비워 둔다'], a: 2,
      why: '꽉 찬 상태를 (rear+1) % CAP == front로 판정하므로 최대 7개다. 8개를 채우면 front == rear가 되어 빈 상태와 같아진다.' },
    { q: '긴 입력을 처리하다 가끔 엉뚱한 지역 변수 값이 바뀐다. 코드에 data[++top] = x; 만 있고 검사가 없다. 원인은?',
      o: ['스택 오버플로로 배열 밖 메모리를 덮어썼다', 'pop이 너무 느리다', 'LIFO 순서가 뒤집혔다'], a: 0,
      why: 'top이 CAP-1인데 또 push하면 data[CAP]에 써서 옆 메모리가 바뀐다. push 첫 줄에 is_full 검사를 넣어 막는다.' },
  ];

  R.page({ title: '스택과 큐 메모리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
