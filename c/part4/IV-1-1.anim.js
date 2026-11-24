/* IV-1-1 연결 리스트 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 노드 = [data | next] 두 칸. 힙 주소는 zig cc(x86_64 Windows)로 실제 돌린 값에서 가져온 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const ADDR = { 10: '0x…15D0', 20: '0x…10F0', 30: '0x…1490' };   // 실행해 본 주소의 끝자리 (실행마다 바뀐다)
  // 노드 한 칸: 왼쪽 data, 오른쪽 next. o.next: 'dot' | 'NULL' | '??' | 문자열
  function node(cx, cy, v, o) { o = o || {}; const w = o.w || 100, h = o.h || 42, dw = o.dw || w * 0.46, s = o.s ?? 1, op = o.op ?? 1;
    if (s <= 0.01 || op <= 0.01) return { L: cx - w / 2, R: cx + w / 2, nx: cx - w / 2 + dw + (w - dw) / 2, cx, cy, top: cy - h / 2, bot: cy + h / 2 };
    const g = R.G(cx, cy, s, op), st = o.stroke || INK, L = -w / 2;
    el('rect', { x: L, y: -h / 2, width: w, height: h, rx: 6, fill: o.fill || PANEL, stroke: st, 'stroke-width': o.sw || 2.2, 'stroke-dasharray': o.dash }, g);
    el('line', { x1: L + dw, y1: -h / 2, x2: L + dw, y2: h / 2, stroke: st, 'stroke-width': 1.6 }, g);
    const dv = v == null ? '' : String(v);
    tx(L + dw / 2, 6, dv, { 'text-anchor': 'middle', 'font-size': dv === '??' ? 15 : 17, 'font-weight': 800, class: 'mono', fill: dv === '??' ? WARN : o.color || INK }, g);
    const nx = L + dw + (w - dw) / 2, nv = o.next ?? 'dot';
    if (nv === 'dot') el('circle', { cx: nx, cy: 0, r: 5, fill: o.dotCol || ACC }, g);
    else tx(nx, 5, nv, { 'text-anchor': 'middle', 'font-size': nv.length > 6 ? 13.5 : 14, 'font-weight': 700, class: 'mono', fill: nv === '??' ? WARN : nv === 'NULL' ? MUT : INK }, g);
    if (o.addr) mono(0, -h / 2 - 8, o.addr, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g);
    return { L: cx - w / 2, R: cx + w / 2, nx: cx - w / 2 + dw + (w - dw) / 2, cx, cy, top: cy - h / 2, bot: cy + h / 2 }; }
  // 곡선 화살표가 자라기 (pathLength 로 일부만 그린다)
  function arc(x1, y1, x2, y2, bend, u, col, o) { o = o || {}; if (u <= 0) return; col = col || MUT;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - bend;
    el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 2.4, pathLength: 100,
      'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash, opacity: o.op ?? 1,
      'marker-end': u > 0.98 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); }
  // 포인터 변수 깃발 (cur, prev, next): 노드 위(또는 아래)에 이름표 + 꼬리
  function pin(x, y, name, col, o) { o = o || {}; const up = o.below ? 1 : -1, op = o.op ?? 1; if (op <= 0) return;
    el('line', { x1: x, y1: y, x2: x, y2: y + up * 22, stroke: col, 'stroke-width': 2.4, opacity: op });
    el('path', { d: `M${x - 6},${y + up * 8} L${x},${y} L${x + 6},${y + up * 8}`, fill: 'none', stroke: col, 'stroke-width': 2.4, opacity: op });
    card(x, y + up * 36, tw(name, 14) + 20, 26, { rx: 13, text: name, fs: 14, fw: 800, mono: true, stroke: col, color: col, fill: PANEL, sw: 2, op }); }
  // 스택의 포인터 변수 상자: 이름 + 값
  function vbox(cx, cy, name, val, o) { o = o || {}; const op = o.op ?? 1;
    tx(cx - 50, cy + 5, name, { 'font-size': 15, 'font-weight': 800, class: 'mono', 'text-anchor': 'end', opacity: op, fill: o.col || INK });
    card(cx, cy, 84, 36, { rx: 6, text: val, fs: 14, mono: true, fw: 700, stroke: o.col || INK, op, color: val === 'NULL' ? MUT : INK });
    return { R: cx + 42, cx, cy }; }
  function nullMark(x, y, op) { mono(x, y + 5, 'NULL', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op ?? 1 }); }
  // 가로 사슬: 값 배열을 x0 부터 pitch 간격으로. o.pos(i) 로 위치 바꾸기, o.style(i) 로 모양 바꾸기
  function chain(vals, x0, y, pitch, o) { o = o || {}; const ps = [];
    vals.forEach((v, i) => { const st = (o.style && o.style(i, v)) || {}, cx = st.x ?? x0 + i * pitch, cy = st.y ?? y;
      ps.push(node(cx, cy, v, Object.assign({ w: o.w || 96, next: i === vals.length - 1 && !o.openEnd ? 'NULL' : 'dot' }, st))); });
    ps.forEach((p, i) => { const st = (o.style && o.style(i)) || {}; if (i < ps.length - 1 && !st.noLink) { const q = ps[i + 1], lu = st.linkU ?? 1;
        if (Math.abs(q.cy - p.cy) < 2) grow(p.nx + 6, p.cy, q.L - 3, q.cy, lu, st.linkCol || MUT, { op: st.op });
        else arc(p.nx, p.cy + (q.cy > p.cy ? 8 : -8), q.L - 2, q.cy, q.cy > p.cy ? -20 : 20, lu, st.linkCol || MUT, { op: st.op }); } });
    return ps; }
  const step = (x0, pitch, f) => x0 + f * pitch;   // 깃발이 노드 사이를 미끄러지는 위치

  // ---------- 1. 노드와 head ----------
  const H = { n10: [430, 150], n20: [740, 210], n30: [500, 330] };
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      tx(480, 44, 'typedef struct Node { int data; struct Node* next; } Node;', { 'text-anchor': 'middle', 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.1) });
      const bx = 240, bw = 480, y = 150, g = E(u, 0.4, 1.8);
      const parts = [[0, 4, 'data (int)', ACC], [4, 8, '패딩', OFF], [8, 16, 'next (Node*)', INFO]];
      parts.forEach(([a, b, name, col], i) => { const s = clamp(g * 3 - i); if (s <= 0) return; const x = bx + (a / 16) * bw, w = ((b - a) / 16) * bw;
        el('rect', { x, y, width: w * s, height: 56, rx: 4, fill: col === OFF ? SOFT : col === ACC ? ACCBG : INFOBG, stroke: col, 'stroke-width': 2, 'stroke-dasharray': col === OFF ? '5 4' : null });
        if (s > 0.9) tx(x + w / 2, y + 34, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col === OFF ? MUT : col }); });
      for (let b = 0; b <= 16; b += 4) { const x = bx + (b / 16) * bw; el('line', { x1: x, y1: y + 60, x2: x, y2: y + 70, stroke: MUT, opacity: fade(u, 1.6) }); mono(x, y + 88, String(b), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
      mono(480, 290, 'sizeof(Node) = 16 바이트 (64비트)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.9) });
      sub(480, 320, 'next 는 8바이트 경계에 맞춰지므로 data 뒤에 4바이트가 빈다', fade(u, 2.1));
      tx(480, 380, '설계도일 뿐, 메모리에 노드는 아직 0개', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.3) });
      return; }
    // 메모리 지도: 왼쪽 스택, 오른쪽 힙
    zone(20, 30, 220, 370, '스택 · main()', { fill: SOFT });
    zone(260, 30, 680, 370, '힙 · malloc 이 준 자리', { fill: SOFT });
    const N10 = H.n10, N20 = H.n20, N30 = H.n30;
    const v10 = k === 1 ? '??' : 10, nx10 = k === 1 ? '??' : k === 2 || k === 3 ? (k === 2 && u < 1.2 ? '??' : 'NULL') : ADDR[20];
    if (k === 2) { // 칸 채우기
      const a = node(N10[0], N10[1], u < 0.6 ? '??' : 10, { w: 150, dw: 60, next: u < 1.3 ? '??' : 'NULL', addr: ADDR[10] + ' (예시)' });
      el('rect', { x: a.L, y: a.top, width: 60, height: 42, rx: 6, fill: ACC, opacity: 0.25 * (1 - seg(u, 0.6, 1.4)) });
      el('rect', { x: a.L + 60, y: a.top, width: 90, height: 42, rx: 6, fill: INFO, opacity: 0.25 * (1 - seg(u, 1.3, 2.1)) });
      mono(N10[0], N10[1] + 50, 'n->data = 10;  n->next = NULL;', { 'font-size': 14, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.3) });
    } else {
      const s10 = k === 1 ? pop(u, 0.3) : 1;
      node(N10[0], N10[1], v10, { w: 150, dw: 60, next: k >= 4 ? (k === 4 && u < 1.0 ? 'NULL' : ADDR[20]) : nx10, addr: ADDR[10] + ' (예시)', s: s10, stroke: k === 1 ? WARN : INK });
    }
    // n (k1~2) 또는 head (k3~)
    if (k <= 2) { const b = vbox(150, 150, 'n', ADDR[10], { op: k === 1 ? fade(u, 0.8) : 1 });
      grow(b.R + 2, 150, N10[0] - 77, N10[1], k === 1 ? seg(u, 1.0, 1.6) : 1, ACC);
      if (k === 1) { pill(N10[0], N10[1] + 64, 'malloc(sizeof(Node)) = 16바이트', WARN, pop(u, 0.4), { mono: true, fs: 13.5 });
        tx(130, 230, 'n == NULL ?', { 'font-size': 14.5, class: 'mono', 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) });
        tx(130, 254, '아니오 → 계속', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.2) });
        tx(N10[0], N10[1] + 104, '두 칸 모두 쓰레기값', { 'font-size': 15, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    } else { const hop = k === 3 ? fade(u, 0.3) : 1;
      if (k === 3) { mono(130, 104, 'new_node 가 끝나 n 은 사라짐', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: 1 - fade(u, 1.6) }); }
      const b = vbox(150, 150, 'head', ADDR[10], { op: hop, col: ACC });
      grow(b.R + 2, 150, N10[0] - 77, N10[1], k === 3 ? seg(u, 0.6, 1.3) : 1, ACC);
      if (k === 3) { tx(130, 214, '리스트로 가는', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.5) });
        tx(130, 236, '유일한 입구', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
        tx(130, 300, 'head 를 덮어쓰면', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.2) });
        tx(130, 322, '모든 노드를 잃는다', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) }); } }
    if (k >= 4) { const s20 = k === 4 ? pop(u, 0.2) : 1;
      node(N20[0], N20[1], 20, { w: 150, dw: 60, next: k >= 5 && u > 0.9 || k > 5 ? ADDR[30] : 'NULL', addr: ADDR[20] + ' (예시)', s: s20 });
      grow(N10[0] + 76, N10[1] + 6, N20[0] - 78, N20[1] - 4, k === 4 ? seg(u, 1.0, 1.8) : 1, MUT);
      if (k === 4) tx(600, 380, '주소가 붙어 있지 않다 · next 에 적힌 주소만이 순서를 만든다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.0) }); }
    if (k >= 5) { node(N30[0], N30[1], 30, { w: 150, dw: 60, next: 'NULL', addr: ADDR[30] + ' (예시)', s: pop(u, 0.2) });
      arc(N20[0] + 30, N20[1] + 22, N30[0] + 78, N30[1], -30, seg(u, 0.6, 1.2), MUT);
      dot([[192, 150], [N10[0] - 75, N10[1]], [N10[0] + 30, N10[1]], [N20[0] - 75, N20[1]]], seg(u, 1.3, 2.3), ACC, 8);
      if (u > 2.3) el('rect', { x: N20[0] - 75, y: N20[1] - 21, width: 60, height: 42, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 3.5 });
      mono(150, 300, 'head->next->data', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(150, 330, '=> 20', { 'font-size': 20, 'text-anchor': 'middle', 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) }); }
  }

  // ---------- 2. 삽입 ----------
  const X0 = 190, PT = 132, Y = 230;
  function headBox(target, u, o) { o = o || {}; card(70, Y, 76, 38, { rx: 6, text: 'head', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
    if (target) grow(110, Y, target[0], target[1], u ?? 1, ACC); }
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) {
      const slide = k === 2 ? E(u, 1.3, 2.3) : 0;
      const ps = chain([10, 20, 30], X0 + PT * slide, Y, PT);
      const nx = lerp(X0, X0, slide), ny = lerp(110, Y, slide);
      const n5 = node(nx, ny, 5, { w: 96, s: k === 0 ? pop(u, 0.3) : 1, stroke: ACC, next: k === 0 ? 'NULL' : 'dot', fill: ACCBG });
      if (k === 0) { tx(X0 + 70, 96, '아직 사슬 밖', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
        mono(480, 360, 'push_front(&head, 5)  ·  head 를 바꾸므로 Node** 로 받는다', { 'text-anchor': 'middle', 'font-size': 14.5, opacity: fade(u, 1.6) }); }
      if (k >= 1 && slide < 0.05) { arc(n5.nx, n5.bot - 4, ps[0].L + 20, ps[0].top - 2, -10, k === 1 ? seg(u, 0.3, 1.2) : 1, ACC);
        if (k === 1) { pill(X0 + 230, 110, '① n->next = *head', ACC, pop(u, 1.1), { mono: true, fs: 14 }); } }
      if (slide >= 0.05) grow(n5.nx + 6, Y, ps[0].L - 3, Y, 1, MUT);
      // head 화살표: k<2 는 [10], k=2 는 [5] 로 옮겨 감
      if (k < 2) headBox([ps[0].L - 3, Y]); else { const sw = seg(u, 0.2, 1.0);
        headBox(null); if (sw < 1) grow(110, Y, ps[0].L - 3, Y, 1, OFF, { dash: '5 5', op: 1 - sw });
        grow(110, Y, lerp(n5.L - 3, n5.L - 3, slide), n5.cy + (slide < 1 ? 0 : 0), sw, ACC);
        pill(X0 + 230, 110, '② *head = n', ACC, pop(u, 0.9), { mono: true, fs: 14 });
        banner(480, 360, '두 줄로 끝 · 찾을 필요가 없으니 O(1)', pop(u, 2.2)); }
      if (k === 1) tx(480, 360, 'head 는 아직 [10] 을 가리킨다 · 이제 뒷사슬은 안전하다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      return; }
    if (k === 3) { // [10] 뒤에 [15]
      const g = E(u, 2.0, 2.6), vals = [5, 10, 15, 20, 30];
      const ps = chain([5, 10, 20, 30], X0, Y, PT, { style: (i) => (i >= 2 ? { x: X0 + i * PT + PT * g } : i === 1 ? { noLink: true } : {}) });
      const fx = lerp(X0 + PT * 1.5, X0 + PT * 2, g), fy = lerp(110, Y, g);
      const n15 = node(fx, fy, 15, { w: 96, stroke: ACC, fill: ACCBG, s: pop(u, 0.2) });
      // ① n->next = prev->next
      if (g < 0.05) { arc(n15.nx, n15.bot - 4, ps[2].L + 20, ps[2].top - 2, -10, seg(u, 0.5, 1.1), ACC);
        // ② prev->next = n  (옛 화살표는 흐려지고 새 화살표가 위로)
        const s2u = seg(u, 1.2, 1.8); grow(ps[1].nx + 6, Y, ps[2].L - 3, Y, 1, OFF, { op: 1 - s2u, dash: '5 5' });
        arc(ps[1].nx, ps[1].top + 4, n15.L - 2, n15.cy, 30, s2u, ACC); }
      else grow(ps[1].nx + 6, Y, n15.L - 3, Y, 1, MUT);
      if (g >= 0.05) grow(n15.nx + 6, Y, ps[2].L - 3, Y, 1, MUT);
      headBox([ps[0].L - 3, Y]);
      mono(ps[1].cx, Y + 52, 'prev', { 'font-size': 14, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
      pill(700, 96, '① n->next = prev->next', ACC, pop(u, 0.6), { mono: true, fs: 13.5 });
      pill(700, 134, '② prev->next = n', ACC, pop(u, 1.3), { mono: true, fs: 13.5 });
      // 뒤집으면: 아래 작은 그림
      const bo = fade(u, 2.1); if (bo > 0) { tx(60, 330, '순서를 뒤집으면', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: bo });
        node(250, 364, 10, { w: 80, op: bo, next: 'dot' }); grow(293, 364, 345, 364, bo, BAD); node(390, 364, 15, { w: 80, op: bo, stroke: BAD, next: '??' });
        node(540, 364, 20, { w: 80, op: bo * 0.35, dash: '4 4' }); node(650, 364, 30, { w: 80, op: bo * 0.35, dash: '4 4' });
        tx(720, 370, '[20][30] 주소를 아무도 모른다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: bo }); }
      return; }
    if (k === 4) { // tail: 끝까지 걷기
      const vals = [5, 10, 15, 20, 30], att = E(u, 2.0, 2.5);
      const ps = chain(vals.concat([40]), X0 - 30, Y, PT * 0.96, { w: 92, style: (i) => (i === 5 ? { y: lerp(110, Y, att), stroke: ACC, fill: ACCBG, s: pop(u, 0.15), linkU: 1 } : i === 4 ? { linkU: att > 0.05 ? 1 : 0, next: att > 0.5 ? 'dot' : 'NULL' } : {}) });
      headBox([ps[0].L - 3, Y]);
      const walk = Math.min(4, E(u, 0.3, 1.9) * 4), wi = Math.floor(walk), wf = walk - wi;
      const px = lerp(ps[wi].cx, ps[Math.min(4, wi + 1)].cx, wf);
      pin(px, Y + 24, 'cur', INFO, { below: true });
      mono(480, 380, `cur = cur->next  ×${Math.round(walk)}`, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO });
      if (u > 1.9) tx(ps[4].cx, Y - 40, 'next == NULL · 여기가 끝', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: INK, opacity: fade(u, 1.9) * (1 - seg(u, 2.0, 2.2)) });
      sub(480, 50, '노드 5개를 지나야 붙일 자리를 안다 · O(n)', fade(u, 2.3), { 'font-size': 15, fill: WARN, 'font-weight': 700 });
      return; }
    // k5: 비용 막대 (찾기 + 잇기)
    tx(260, 60, '찾기', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) }); el('rect', { x: 230, y: 48, width: 20, height: 14, rx: 3, fill: WARN, opacity: fade(u, 0.2) });
    tx(360, 60, '잇기', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) }); el('rect', { x: 330, y: 48, width: 20, height: 14, rx: 3, fill: ACC, opacity: fade(u, 0.2) });
    [['head 앞', 0, 'O(1)'], ['중간 (prev 뒤)', 0.5, 'O(n)'], ['tail (끝)', 1, 'O(n) *']].forEach(([name, f, big], i) => { const y = 120 + i * 82, g = E(u, 0.3 + i * 0.4, 1.2 + i * 0.4);
      tx(40, y + 18, name, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.4) });
      const fw = 420 * f * g; if (fw > 1) el('rect', { x: 230, y, width: fw, height: 28, rx: 4, fill: WARN });
      el('rect', { x: 230 + fw + 2, y, width: 46 * g, height: 28, rx: 4, fill: ACC });
      mono(230 + fw + 60, y + 20, big, { 'font-size': 17, 'font-weight': 800, fill: f === 0 ? GOOD : BAD, opacity: fade(u, 1.1 + i * 0.4) }); });
    tx(480, 370, '잇는 비용은 어디서나 같다 · 차이는 자리를 찾는 데서 난다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.9) });
    sub(480, 398, '* tail 포인터를 따로 들고 다니면 tail 삽입도 O(1)', fade(u, 2.3)); }

  // ---------- 3. 삭제 ----------
  const DX = 300, DP = 180, DY = 220;
  function s3(t, c) { const { k, u, beat } = c;
    const call = `delete_value(&head, ${beat.deleteValue})`;
    mono(480, 52, call, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: k === 0 || k === 2 || k === 3 ? fade(u, 0.1) : 1 });
    if (k === 0 || k === 1) {
      const ps = chain([10, 20, 30], DX, DY, DP, { w: 110 });
      card(130, DY, 76, 38, { rx: 6, text: 'head', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG }); grow(170, DY, ps[0].L - 3, DY, 1, ACC);
      const f = k === 0 ? 0 : E(u, 0.3, 1.4);
      pin(lerp(ps[0].cx, ps[1].cx, f), DY - 24, 'cur', INFO, { op: k === 0 ? fade(u, 0.5) : 1 });
      if (f < 0.5) { mono(lerp(130, ps[0].cx, f), DY + 100, 'prev = NULL', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.0) : 1 - f * 2 }); }
      if (k === 1) pin(lerp(130, ps[0].cx, f), DY + 24, 'prev', WARN, { below: true, op: clamp(f * 2) });
      if (k === 0) { tx(480, 350, '지울 노드(cur)와 그 앞(prev)을 함께 들고 걷는다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) });
        sub(480, 380, 'head 가 바뀔 수 있어 &head 로 받는다 (Node**)', fade(u, 2.1)); }
      else { mono(480, 350, u < 1.4 ? 'cur->data(10) != 20  →  prev = cur;  cur = cur->next;' : 'cur->data(20) == 20  →  루프 종료', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: u < 1.4 ? INK : GOOD });
        sub(480, 380, 'prev 가 한 칸 뒤를 따라와야 건너뛰기를 할 수 있다', fade(u, 1.8)); }
      return; }
    if (k === 2) { const ps = chain([10, 30], DX, DY, DP, { w: 110 });
      card(130, DY, 76, 38, { rx: 6, text: 'head', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG }); grow(170, DY, ps[0].L - 3, DY, 1, ACC);
      const w = E(u, 0.3, 1.9) * 2, xs = [ps[0].cx, ps[1].cx, ps[1].R + 60], wi = Math.min(1, Math.floor(w)), cx = lerp(xs[wi], xs[wi + 1], w - wi);
      pin(cx, DY - 24, 'cur', w >= 2 ? BAD : INFO);
      if (w >= 2) mono(ps[1].R + 60, DY + 46, 'cur == NULL', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
      mono(480, 350, 'if (cur == NULL) return;', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) });
      check(330, 384, 9, pop(u, 2.3)); tx(350, 390, '리스트는 그대로 · 없는 값 삭제는 정상 입력', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.3) });
      return; }
    if (k === 3) { const drop = E(u, 1.1, 2.0), gone = seg(u, 2.0, 2.6);
      const ps = chain([10, 20, 30], DX, DY, DP, { w: 110, style: (i) => (i === 0 ? { y: DY + 90 * drop, op: 1 - gone, stroke: BAD, linkCol: OFF } : {}) });
      card(130, DY, 76, 38, { rx: 6, text: 'head', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
      const sw = seg(u, 0.3, 1.0); if (sw < 1) grow(170, DY, ps[0].L - 3, ps[0].cy, 1, OFF, { op: 1 - sw });
      arc(170, DY - 8, ps[1].L - 2, DY - 8, 60, sw, ACC);
      pill(480, 110, '*head = cur->next', ACC, pop(u, 0.5), { mono: true, fs: 14 });
      tx(ps[0].cx, DY + 160, gone > 0 ? 'free(cur)' : 'prev == NULL · 첫 노드', { 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono', 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      sub(600, 404, 'head 를 바꾸는 유일한 경우 · Node** 가 없으면 호출자 head 는 그대로', fade(u, 1.8), { 'font-size': 14.5 });
      return; }
    // k4·k5: [20] 건너뛰기 → free
    const lift = k === 4 ? E(u, 1.2, 2.0) : 1, crumble = k === 5 ? E(u, 0.6, 1.6) : 0;
    const ps = chain([10, 20, 30], DX, DY, DP, { w: 110, style: (i) => (i === 0 ? { noLink: true } : i === 1 ? { y: DY + 90 * lift, dash: lift > 0.5 ? '5 4' : null, stroke: lift > 0.5 ? WARN : INK, s: 1 - crumble, op: 1 - crumble } : {}) });
    card(130, DY, 76, 38, { rx: 6, text: 'head', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG }); grow(170, DY, ps[0].L - 3, DY, 1, ACC);
    const rel = k === 4 ? seg(u, 0.3, 1.1) : 1;
    if (rel < 1) grow(ps[0].nx + 6, DY, ps[1].L - 3, DY, 1, OFF, { op: 1 - rel, dash: '5 5' });
    arc(ps[0].nx, DY - 14, ps[2].L - 2, DY - 10, 70, rel, ACC);
    pill(ps[1].cx, 100, 'prev->next = cur->next', ACC, k === 4 ? pop(u, 0.6) : 1, { mono: true, fs: 14 });
    if (k === 4) { pin(ps[1].cx, ps[1].bot, 'cur', INFO, { below: true, op: fade(u, 1.6) });
      tx(480, 400, '[20] 은 사슬에서 빠졌지만 메모리는 아직 살아 있다 · free 가 남았다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) }); return; }
    // k5: free
    if (crumble < 1) for (let i = 0; i < 8; i++) { const a = i * 0.8, r = 30 + 40 * crumble; el('rect', { x: ps[1].cx + Math.cos(a) * r - 5, y: DY + 90 + Math.sin(a) * r * 0.6 - 5, width: 10, height: 10, rx: 2, fill: WARN, opacity: (1 - crumble) * (crumble > 0 ? 1 : 0) }); }
    el('rect', { x: ps[1].cx - 55, y: DY + 69, width: 110, height: 42, rx: 6, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: fade(u, 1.4) });
    mono(ps[1].cx, DY + 95, 'free(cur)', { 'font-size': 14.5, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    const bo = fade(u, 2.0); if (bo > 0) { card(480, 384, 600, 40, { rx: 8, stroke: BAD, fill: BADBG, sw: 1.8, op: bo });
      tx(480, 390, 'free 를 먼저 하면 cur->next 읽기가 use-after-free', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: bo }); } }

  // ---------- 4. 탐색과 순회 ----------
  const TX = 230, TP = 175, TY = 210;
  function loopLine(on, op) { const parts = [['for (', null], ['Node* cur = head', 0], ['; ', null], ['cur != NULL', 1], ['; ', null], ['cur = cur->next', 2], [')', null]];
    let x = 480 - tw(parts.map((p) => p[0]).join(''), 16) / 2;
    parts.forEach(([s, id]) => { const w = tw(s, 16); if (id != null && on === id) el('rect', { x: x - 3, y: 44, width: w + 6, height: 28, rx: 5, fill: INFOBG, opacity: op ?? 1 });
      mono(x, 64, s, { 'font-size': 16, 'font-weight': id != null && on === id ? 800 : 600, fill: id != null && on === id ? INFO : INK, opacity: op ?? 1 }); x += w; }); }
  function walker(ps, f, endX) { const xs = ps.map((p) => p.cx).concat([endX]), i = Math.min(xs.length - 2, Math.floor(f)); return lerp(xs[i], xs[i + 1], f - i); }
  function s4(t, c) { const { k, u, beat } = c;
    const vals = beat.list, n = vals.length, pitch = n > 3 ? 150 : TP, x0 = n > 3 ? 190 : TX;
    if (k === 5) { // 두 실수
      tx(40, 110, 'cur != NULL 을 빼면', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
      const a = chain([10, 20, 30], 300, 110, 150, { w: 96 }); const f = E(u, 0.3, 1.6) * 3, x = walker(a, f, a[2].R + 70);
      pin(x, 110 + 22, 'cur', f >= 3 ? BAD : INFO, { below: true });
      if (f >= 3) { const b = pop(u, 1.6); cross(a[2].R + 70, 110, 14, b); mono(a[2].R + 70, 194, 'NULL->data', { 'font-size': 14, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); tx(a[2].R + 70, 216, '세그폴트', { 'font-size': 15, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }
      tx(40, 300, 'cur = cur->next 를 빼면', { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      const b = chain([10, 20, 30], 300, 300, 150, { w: 96, style: () => ({ op: fade(u, 1.0) }) });
      if (u > 1.0) { const ang = t * 6; el('path', { d: `M${b[0].cx + 26},${300 + 26} A26,26 0 1 1 ${b[0].cx + 26 * Math.cos(ang)},${300 + 26 + 26 * Math.sin(ang)}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, transform: `translate(0 ${30})`, opacity: fade(u, 1.2) });
        pin(b[0].cx, 300 - 22, 'cur', BAD); tx(b[2].R + 30, 306, '제자리 · 무한 루프', { 'font-size': 15, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.8) }); }
      return; }
    loopLine(k === 0 ? (u < 1.2 ? 0 : 1) : k === 4 ? 2 : 1, k === 0 ? fade(u, 0.1) : 1);
    const ps = chain(vals, x0, TY, pitch, { w: 104 });
    card(70, TY, 76, 38, { rx: 6, text: 'head', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG }); grow(110, TY, ps[0].L - 3, TY, 1, ACC);
    const endX = ps[n - 1].R + 56;
    if (k === 0) { pin(ps[0].cx, TY - 24, 'cur', INFO, { op: fade(u, 0.5) });
      tx(480, 330, '인덱스가 없다 · head 에서 출발해 한 칸씩 걷는 길밖에 없다', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 360, 'cur != NULL 이 거짓이 되는 순간이 멈춤 신호', fade(u, 2.1), { 'font-size': 15 }); return; }
    const target = beat.searchValue, hit = vals.indexOf(target);
    // 걷는 거리: 찾으면 그 칸, 못 찾으면 NULL 까지
    const stops = k === 2 ? n : k === 1 ? hit : n;
    const f = E(u, 0.2, 2.0) * stops, x = walker(ps, f, endX), at = Math.min(n, Math.floor(f + 1e-6));
    pin(x, TY - 24, 'cur', at >= n ? BAD : INFO);
    if (k === 1 || k === 2) {
      for (let i = 0; i <= Math.min(at, n - 1); i++) { if (k === 1 && i > hit) break; const ok = vals[i] === target;
        mono(ps[i].cx, TY + 52, ok ? `${vals[i]} == ${target}` : `${vals[i]} != ${target}`, { 'font-size': 14.5, 'font-weight': 800, fill: ok ? GOOD : MUT, 'text-anchor': 'middle' }); }
      if (k === 1) { mono(480, 340, 'return cur;', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
        sub(480, 372, `비교 ${hit + 1}번 · 평균 n/2 칸을 걷는다 · O(n)`, fade(u, 2.3), { 'font-size': 15 }); }
      else { if (at >= n) mono(endX, TY + 6, 'NULL', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
        mono(480, 340, 'return NULL;   // 끝까지 없음', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) });
        sub(480, 372, `비교 ${n}번 · 받은 쪽은 NULL 인지 먼저 확인해야 한다`, fade(u, 2.3), { 'font-size': 15 }); }
      return; }
    if (k === 3) { // 출력
      const shown = Math.min(n + 1, f + 1e-6), outs = vals.slice(0, Math.floor(shown)).map((v) => `${v} -> `).join('') + (shown >= n ? 'NULL' : '');
      R.terminal(200, 290, 560, 100, ['$ ./traverse', outs], 2, { title: 'print_list(head)' });
      return; }
    // k4: 길이 — cur 가 i 번째 칸을 밟으면 n = i+1
    const seen = at >= n ? n : Math.min(n, Math.floor(f + 1e-6) + 1);
    for (let i = 0; i < seen; i++) mono(ps[i].cx, TY + 52, `n=${i + 1}`, { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
    mono(480, 340, `length(head) = ${at >= n ? n : '…'}`, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: at >= n ? ACC : INK });
    sub(480, 372, '셀 때마다 전부 밟는다 · 자주 쓰면 size 를 따로 둔다', fade(u, 2.2), { 'font-size': 15 }); }

  // ---------- 5. 배열 vs 연결 리스트 ----------
  const SC = [[300, 280], [520, 340], [700, 260], [880, 330]];   // 흩어진 노드 자리
  function scattered(o) { o = o || {}; const ps = SC.map(([x, y], i) => { const st = (o.style && o.style(i)) || {}; return node(x, y, [10, 20, 30, 40][i], Object.assign({ w: 100, next: i === 3 ? 'NULL' : 'dot' }, st)); });
    ps.forEach((p, i) => { if (i < 3 && !((o.style && o.style(i)) || {}).noLink) arc(p.nx, p.cy + (ps[i + 1].cy > p.cy ? 10 : -10), ps[i + 1].L - 2, ps[i + 1].cy, ps[i + 1].cy > p.cy ? -10 : 30, 1, ((o.style && o.style(i)) || {}).linkCol || MUT, { op: ((o.style && o.style(i)) || {}).op }); });
    return ps; }
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) {
      // 위: 배열 (연속), 아래: 흩어진 노드
      tx(40, 60, '배열 · 한 블록', { 'font-size': 15, 'font-weight': 800, fill: INK });
      const arrGone = k === 0 ? seg(u, 1.4, 2.0) : 1;
      R.cells(250, 40, [10, 20, 30, 40], { w: 70, h: 40, gap: 0, style: () => ({ op: 1 - arrGone * 0.8, stroke: arrGone > 0.5 ? OFF : INK }) });
      ['+0', '+4', '+8', '+12'].forEach((s, i) => mono(285 + i * 70, 100, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      mono(570, 66, k === 0 ? 'free(arr);  // 한 번' : 'free(arr);  // 한 번', { 'font-size': 15, 'font-weight': 700, fill: arrGone > 0.5 ? GOOD : INK, opacity: k === 0 ? fade(u, 1.2) : 1 });
      tx(40, 176, '연결 리스트 · 흩어진 노드', { 'font-size': 15, 'font-weight': 800 });
      card(110, 280, 76, 38, { rx: 6, text: 'head', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
      if (k === 0) { const ps = scattered(); grow(150, 280, ps[0].L - 3, 280, 1, ACC); pin(ps[0].cx, 280 - 22, 'cur', INFO, { op: fade(u, 0.6) });
        tx(560, 410, '노드 수만큼 free 를 반복해야 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
      if (k === 1) { const nx = seg(u, 0.2, 0.8), fr = seg(u, 0.9, 1.5), mv = E(u, 1.6, 2.4);
        const ps = scattered({ style: (i) => (i === 0 ? { s: 1 - fr * 0.9, op: 1 - fr, noLink: fr > 0.3 } : {}) });
        if (fr < 0.3) grow(150, 280, ps[0].L - 3, 280, 1, ACC);
        pin(lerp(ps[0].cx, ps[1].cx, mv), lerp(280, 340, mv) - 22, 'cur', INFO);
        pin(ps[1].cx, 340 + 22, 'next', WARN, { below: true, op: nx });
        mono(560, 140, ['① Node* next = cur->next;', '② free(cur);', '③ cur = next;'][u < 0.9 ? 0 : u < 1.6 ? 1 : 2], { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: u < 0.9 ? WARN : u < 1.6 ? BAD : INFO });
        mono(ps[0].cx, 286, 'free', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fr * (1 - mv) });
        return; }
      // k2: 보관 없이 free 먼저
      const fr = seg(u, 0.3, 1.0);
      const ps = scattered({ style: (i) => (i === 0 ? { s: 1 - fr * 0.9, op: 1 - fr, noLink: true } : { op: 1 - 0.6 * seg(u, 1.6, 2.2), dash: u > 1.8 ? '4 4' : null }) });
      pin(ps[0].cx, 280 - 22, 'cur', BAD);
      mono(560, 140, 'free(cur);  cur = cur->next;', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD });
      if (u > 1.0) { mono(ps[0].cx, 290, '??', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
      tx(700, 410, '남은 노드 3개로 가는 주소를 잃었다 · 누수', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      return; }
    if (k === 3) { // DNode
      tx(480, 56, 'typedef struct DNode { int data; struct DNode *prev, *next; } DNode;', { 'text-anchor': 'middle', 'font-size': 14.5, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.1) });
      const xs = [220, 480, 740], y = 200;
      xs.forEach((x, i) => { const s = pop(u, 0.3 + i * 0.25), g = R.G(x, y, s);
        el('rect', { x: -90, y: -24, width: 180, height: 48, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }, g);
        el('line', { x1: -36, y1: -24, x2: -36, y2: 24, stroke: INK, 'stroke-width': 1.6 }, g); el('line', { x1: 36, y1: -24, x2: 36, y2: 24, stroke: INK, 'stroke-width': 1.6 }, g);
        tx(0, 7, String((i + 1) * 10), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, class: 'mono' }, g);
        if (i === 0) tx(-63, 6, 'NULL', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g); else el('circle', { cx: -63, cy: 0, r: 5, fill: WARN }, g);
        if (i === 2) tx(63, 6, 'NULL', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: MUT }, g); else el('circle', { cx: 63, cy: 0, r: 5, fill: ACC }, g);
        if (i === 0) { mono(x - 63, y - 34, 'prev', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: s }); mono(x + 63, y - 34, 'next', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: s }); } });
      for (let i = 0; i < 2; i++) { arc(xs[i] + 63, y - 10, xs[i + 1] - 92, y - 10, 30, seg(u, 1.1 + i * 0.2, 1.6 + i * 0.2), ACC);
        arc(xs[i + 1] - 63, y + 10, xs[i] + 92, y + 10, -30, seg(u, 1.6 + i * 0.2, 2.1 + i * 0.2), WARN); }
      tx(480, 330, 'prev 가 있으면 뒤로도 걷는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.1) });
      sub(480, 360, '단일 연결 리스트는 앞으로만 간다', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k === 4) { // 바이트 막대
      const bx = 220, px = 26; // 1바이트 = 26px
      const rows = [['Node', [['data', 4, ACC], ['패딩', 4, OFF], ['next', 8, INFO]], 16], ['DNode', [['data', 4, ACC], ['패딩', 4, OFF], ['prev', 8, WARN], ['next', 8, INFO]], 24]];
      rows.forEach(([name, parts, total], r) => { const y = 110 + r * 120, g = E(u, 0.2 + r * 0.6, 1.2 + r * 0.6); let x = bx;
        tx(bx - 24, y + 30, name, { 'font-size': 17, 'font-weight': 800, class: 'mono', 'text-anchor': 'end', opacity: fade(u, 0.1 + r * 0.6) });
        parts.forEach(([p, b, col]) => { const w = b * px * g; if (w > 1) { el('rect', { x, y, width: w, height: 48, rx: 3, fill: col === OFF ? SOFT : col === ACC ? ACCBG : col === WARN ? WARNBG : INFOBG, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': col === OFF ? '4 4' : null });
            if (g > 0.95) tx(x + w / 2, y + 30, p, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: col === OFF ? MUT : col }); } x += b * px * g; });
        mono(bx + total * px * g + 14, y + 31, `${total} B`, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.1 + r * 0.6) }); });
      tx(480, 370, '값 하나(4바이트)를 담으려고 포인터 8바이트 → 16바이트', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.0) });
      sub(480, 398, '삽입·삭제 때 고칠 포인터도 두 배 (x86_64, zig cc 로 sizeof 확인)', fade(u, 2.3)); return; }
    // k5: 비교표
    const rows = c.beat.compare.rows, y0 = 92, rh = 56;
    tx(330, 66, '배열', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); tx(690, 66, '연결 리스트', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' });
    rows.forEach((r, i) => { const y = y0 + i * rh, s = fade(u, 0.2 + i * 0.3);
      el('line', { x1: 30, y1: y, x2: 930, y2: y, stroke: GRID, opacity: s });
      tx(40, y + 34, r.op, { 'font-size': 15, 'font-weight': 700, opacity: s });
      [[r.arr, r.arrGood, 200], [r.list, r.listGood, 560]].forEach(([txt, ok, x]) => { if (s <= 0) return;
        if (ok) check(x + 14, y + 29, 8, s); else cross(x + 14, y + 29, 7, s);
        tx(x + 34, y + 34, txt.replace(/ — /, ' · ').replace(/ → /, ' · '), { 'font-size': 14.5, fill: ok ? GOOD : BAD, 'font-weight': 600, opacity: s }); }); });
    tx(480, 400, '조회가 잦으면 배열 · 앞뒤 삽입·삭제가 잦으면 연결 리스트', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: '연결 리스트에서 마지막 노드의 next에 NULL을 넣는 까닭은 무엇인가?',
      o: ['순회가 멈출 곳을 알려 주는 유일한 신호이기 때문이다', 'malloc이 NULL을 넣어 주지 않으면 할당이 실패하기 때문이다', 'head가 마지막 노드를 가리키게 하기 위해서다'], a: 0,
      why: 'malloc 직후 next는 쓰레기값이라 직접 NULL로 눌러야 한다. 순회는 cur != NULL이 거짓이 되는 순간 멈춘다.' },
    { q: '[10] 뒤에 [15]를 넣을 때 먼저 실행해야 하는 줄은 무엇인가?',
      o: ['prev->next = n;', 'n->next = prev->next;', 'free(prev);'], a: 1,
      why: '새 노드가 뒷사슬 [20]을 먼저 붙잡아야 한다. prev->next부터 바꾸면 [20][30]으로 가는 주소를 아무도 갖지 않게 된다.' },
    { q: '[10]→[20]→[30]에서 [20]을 지울 때 올바른 순서는 무엇인가?',
      o: ['free(cur) 다음 prev->next = cur->next', 'head = cur->next 다음 free(cur)', 'prev->next = cur->next 다음 free(cur)'], a: 2,
      why: '먼저 [10]이 [30]을 가리키게 건너뛰고, 그 뒤에 [20]을 free한다. 반대로 하면 해제된 cur에서 next를 읽게 된다.' },
    { q: '[10]→[20]→[30]에서 find(head, 99)는 비교를 몇 번 하고 무엇을 돌려주나?',
      o: ['3번 비교하고 NULL을 돌려준다', '1번 비교하고 0을 돌려준다', '비교 없이 바로 NULL을 돌려준다'], a: 0,
      why: '인덱스가 없어 head부터 세 칸을 다 걷는다. cur가 NULL이 되면 루프를 빠져나와 return NULL에 닿는다.' },
    { q: 'free_list에서 free(cur) 전에 next를 따로 받아 두는 까닭은 무엇인가?',
      o: ['free가 next를 자동으로 NULL로 바꾸기 때문이다', '해제된 노드에서 next를 읽으면 use-after-free라서다', 'next를 받아 두어야 free가 더 빨라지기 때문이다'], a: 1,
      why: 'free한 뒤 cur->next를 읽는 것은 해제된 메모리를 읽는 일이다. 다음 주소를 미리 챙겨야 남은 노드로 갈 수 있다.' },
  ];

  const summary = [
    '연결 리스트 노드는 data와 next 두 칸이고 힙 여기저기에 흩어져 놓인다.',
    'head는 리스트로 들어가는 유일한 입구이고 마지막 next의 NULL이 끝을 알린다.',
    '삽입은 새 노드의 next를 먼저 잇고, 삭제는 건너뛰기를 먼저 한 뒤 free한다.',
    '인덱스가 없어 탐색은 O(n)이다. 조회가 잦으면 배열, 앞쪽 삽입·삭제가 잦으면 리스트를 고른다.',
  ];
  const review = [
    { q: 'remove_first(Node* head)로 첫 노드를 지웠더니 호출한 쪽 head가 해제된 노드를 가리킨다. 먼저 고칠 것은?',
      o: ['함수가 Node** 를 받아 *head를 바꾸게 한다', 'free 대신 head = NULL만 한다', '노드마다 prev 포인터를 더한다'], a: 0,
      why: 'Node*로 받으면 head의 복사본만 바뀐다. 첫 노드를 지우거나 앞에 넣을 때는 &head를 넘겨 *head를 고쳐야 한다.' },
    { q: '뒤에 붙이기(push_back)를 10만 번 했더니 점점 느려진다. 가장 먼저 의심할 것은?',
      o: ['malloc이 매번 실패하고 있다', 'push_back마다 끝까지 걸어가고 있다', 'NULL 체크가 너무 많다'], a: 1,
      why: 'tail 포인터가 없으면 붙일 때마다 cur->next가 NULL인 곳까지 걷는다. tail 포인터를 따로 두면 매번 O(1)이 된다.' },
    { q: '값을 순서대로 한 번 다 읽는 일이 대부분인 프로그램이다. 배열과 연결 리스트 중 무엇이 맞나?',
      o: ['연결 리스트, 노드마다 next가 있어 따라가기 쉽다', '어느 쪽이든 O(n)이라 차이가 없다', '배열, 연속 메모리라 캐시에 잘 맞는다'], a: 2,
      why: '둘 다 O(n)이지만 배열은 다음 원소가 바로 옆에 있다. 흩어진 노드는 칸마다 새 주소로 뛰어 캐시 미스가 난다.' },
  ];

  R.page({ title: '연결 리스트 메모리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
