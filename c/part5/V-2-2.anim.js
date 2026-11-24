/* V-2-2 메모리 풀 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인 (zig cc = clang, x86_64): 원래 pool_init 은 0번부터 push 해서 머리가 3번이었다(첫 alloc 이 3번).
 * 페이지 설명(첫 alloc = 0번, 남은 목록 1→2→3)에 맞게 루프를 뒤(3번)부터 push 하도록 고쳤고, 고친 코드로
 * a=0 · b=1 · 남은 2 3 · 반납 후 c=0 (a 와 같은 주소), sizeof(Slot)=8 · sizeof(Bullet)=8 · sizeof(MemPool)=32,
 * slot_size 4 를 주면 8 로 올라가고, 4칸 풀에서 다섯 번째 alloc 은 NULL 임을 확인했다. 주소값은 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, spans, sub, pill, banner, grow, fly, dot, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const ok = (x, y, s, op) => { if (op <= 0) return; check(x + 7, y - 5, 7, op); tx(x + 22, y, s, { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: op }); };

  // ---------- 풀 그림: 32바이트 버퍼 = 8바이트 슬롯 4칸 ----------
  const SX = 200, SY = 210, SW = 150, SH = 70;
  const sx = (i) => SX + i * SW;
  // st: { s:[상태 'free'|'used'|'raw'|'gone'], next:[다음 번호|-1], head:번호|-1, data:{i:문자열}, hot:i, arc:{i:u}, headFrom, headU, op }
  function pool(st) { const op = st.op ?? 1, g = el('g', { opacity: op });
    el('rect', { x: SX - 6, y: SY - 6, width: 4 * SW + 12, height: SH + 12, rx: 8, fill: 'none', stroke: st.s.every((v) => v === 'gone') ? OFF : INK, 'stroke-width': 2, 'stroke-dasharray': st.s.every((v) => v === 'gone') ? '6 5' : null }, g);
    st.s.forEach((v, i) => { const x = sx(i), hot = st.hot === i;
      const fill = v === 'used' ? ACCBG : v === 'free' ? PANEL : v === 'gone' ? 'none' : SOFT, stroke = v === 'gone' ? OFF : hot ? WARN : v === 'used' ? ACC : INK;
      el('rect', { x: x + 2, y: SY, width: SW - 4, height: SH, rx: 6, fill, stroke, 'stroke-width': hot ? 3.2 : 2, 'stroke-dasharray': v === 'gone' ? '5 4' : null }, g);
      mono(x + 12, SY + 20, '슬롯 ' + i, { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }, g);
      if (v === 'free') { const n = st.next[i]; tx(x + 12, SY + 52, 'next', { 'font-size': 14, fill: MUT }, g);
        mono(x + SW - 14, SY + 52, n < 0 ? 'NULL' : '→ ' + n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: n < 0 ? MUT : INFO }, g); }
      else if (v === 'used') mono(x + 12, SY + 52, (st.data && st.data[i]) || '사용 중', { 'font-size': 15, 'font-weight': 800, fill: ACC }, g);
      else if (v === 'raw') mono(x + SW / 2, SY + 52, '?', { 'font-size': 18, fill: MUT, 'text-anchor': 'middle' }, g);
      mono(x + 4, SY + SH + 22, '+' + i * 8, { 'font-size': 13.5, fill: MUT }, g); });
    // next 화살표: 슬롯 위로 휘어 넘어간다
    st.s.forEach((v, i) => { const n = st.next[i]; if (v !== 'free' || n < 0) return; const u = st.arc && st.arc[i] != null ? st.arc[i] : 1; if (u <= 0) return;
      const x1 = sx(i) + SW * 0.62, x2 = sx(n) + SW * 0.38, top = SY - 34;
      const p = el('path', { d: `M${x1},${SY - 2} C${x1},${top} ${x2},${top} ${x2},${SY - 4}`, fill: 'none', stroke: INFO, 'stroke-width': 2.4, pathLength: 100, 'marker-end': u >= 0.98 ? 'url(#ra-ah)' : null }, g);
      if (u < 0.98) p.setAttribute('stroke-dasharray', `${u * 100} 100`); });
    // free_list 머리
    const HX = 96, HY = 96;
    card(HX, HY, 150, 44, { rx: 8, text: 'free_list', fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO, op });
    const h = st.head, hf = st.headFrom;
    if (h == null) return;
    const tgt = (j) => (j < 0 ? [HX, HY + 70] : [sx(j) + SW * 0.5, SY - 4]);
    const hu = st.headU ?? 1, a = hf != null ? tgt(hf) : tgt(h), b = tgt(h), e = [lerp(a[0], b[0], E(hu, 0, 1)), lerp(a[1], b[1], E(hu, 0, 1))];
    if (h < 0 && hu >= 1) { mono(HX, HY + 52, 'NULL', { 'font-size': 16, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: op }); return; }
    el('path', { d: `M${HX + 75},${HY} Q${e[0]},${HY} ${e[0]},${e[1]}`, fill: 'none', stroke: INFO, 'stroke-width': 2.6, 'marker-end': 'url(#ra-ah)', opacity: op }); }
  const FREE4 = { s: ['free', 'free', 'free', 'free'], next: [1, 2, 3, -1], head: 0 };
  const ONE_USED = { s: ['used', 'free', 'free', 'free'], next: [-1, 2, 3, -1], head: 1 };
  const cpy = (o, ext) => Object.assign({}, o, { s: o.s.slice(), next: o.next.slice() }, ext || {});

  // ---------- 1. 왜 메모리 풀인가 ----------
  // 힙 6칸 (페이지 데이터 HEAP_FRAG 모양)
  function heapRow(x, y, used, o) { o = o || {}; used.forEach((v, i) => { el('rect', { x: x + i * 78, y, width: 72, height: 52, rx: 6, fill: v ? (o.col || WARNBG) : PANEL, stroke: v ? (o.stroke || WARN) : GRID, 'stroke-width': 2, opacity: o.op ?? 1 });
      if (v && o.lab) mono(x + i * 78 + 36, y + 32, o.lab(i), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: o.op ?? 1 }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { mono(24, 44, 'for (frame = 0; frame < 100000; frame++)', { 'font-size': 16, 'font-weight': 700 });
      if (k === 0) { const fr = Math.round(lerp(0, 100000, E(u, 0.3, 2.6)));
        mono(24, 80, 'frame = ' + fr.toLocaleString('en-US'), { 'font-size': 18, 'font-weight': 800, fill: ACC });
        card(130, 200, 160, 60, { rx: 10, text: 'game_loop', fs: 15, mono: true });
        heapRow(400, 174, [0, 0, 0, 0, 0, 0]); tx(400, 160, '힙', { 'font-size': 14, 'font-weight': 700, fill: MUT });
        for (let i = 0; i < 3; i++) { const ph = (t * 1.2 + i / 3) % 1; dot([[210, 200], [400 + (i * 2) * 78 + 36, 200]], ph < 0.5 ? ph * 2 : 2 - ph * 2, ph < 0.5 ? ACC : WARN, 6); }
        tx(24, 320, '매 프레임 malloc 으로 자리를 찾고 free 로 돌려준다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.2) });
        tx(24, 350, '할당자는 호출마다 빈 공간을 탐색하고 기록을 고친다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.7) }); return; }
      if (k === 1) { const fr = [1, 0, 1, 0, 1, 0];
        heapRow(200, 140, fr, { lab: () => '사용', op: 1 }); tx(200, 126, '크기가 뒤섞인 할당·해제 뒤의 힙', { 'font-size': 14, 'font-weight': 700, fill: MUT });
        card(380, 270, 150, 52, { rx: 8, text: '2칸 요청', fs: 15, stroke: BAD, color: BAD, s: pop(u, 0.8) });
        [1, 3, 5].forEach((i, j) => { const x = 200 + i * 78 + 36; grow(380, 244, x, 196, E(u, 1.1 + j * 0.2, 1.4 + j * 0.2), BAD, { dash: '4 4' }); cross(x, 168, 8, pop(u, 1.4 + j * 0.2)); });
        tx(200, 360, '빈칸은 모두 3칸인데 이어진 2칸이 없어 실패한다', { 'font-size': 15.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
        tx(200, 388, '외부 단편화', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
      // k = 2: 할당 시간이 들쭉날쭉
      heapRow(200, 90, [1, 0, 1, 0, 1, 0], { lab: () => '사용' });
      const H = [0.3, 0.8, 0.45, 1.0, 0.25, 0.7, 0.55, 0.9, 0.35, 0.6];
      el('line', { x1: 200, y1: 340, x2: 760, y2: 340, stroke: MUT, 'stroke-width': 1.8 });
      H.forEach((h, i) => { const g = E(u, 0.3 + i * 0.12, 0.8 + i * 0.12); el('rect', { x: 210 + i * 54, y: 340 - 130 * h * g, width: 38, height: 130 * h * g, rx: 3, fill: WARN }); });
      tx(200, 366, '프레임마다 할당에 걸리는 시간 (모양만 나타낸 그림)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      tx(200, 396, '실시간 처리에서는 들쭉날쭉한 시간이 곧 끊김이다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { mono(24, 44, 'pool_init(&pool, sizeof(Bullet), 256);', { 'font-size': 16, 'font-weight': 700 });
      const n = Math.floor(clamp((u - 0.3) / 1.6) * 256.99);
      for (let i = 0; i < 256; i++) { const r = Math.floor(i / 32), q = i % 32; el('rect', { x: 120 + q * 22, y: 90 + r * 22, width: 19, height: 19, rx: 3, fill: i < n ? ACCBG : SOFT, stroke: i < n ? ACC : GRID, 'stroke-width': 1.2 }); }
      tx(120, 300, 'malloc 한 번으로 큰 블록 · 같은 크기 256칸', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      mono(120, 330, '슬롯 ' + n + ' / 256', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      tx(120, 362, '이후로는 malloc 을 부르지 않는다', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { mono(24, 44, 'Bullet *b = pool_alloc(&pool);', { 'font-size': 16, 'font-weight': 700 });
      for (let i = 0; i < 64; i++) { const r = Math.floor(i / 32), q = i % 32, used = i < 2 && u > 0.6 + i * 0.4;
        el('rect', { x: 120 + q * 22, y: 90 + r * 22, width: 19, height: 19, rx: 3, fill: used ? ACC : ACCBG, stroke: ACC, 'stroke-width': 1.2 }); }
      tx(120, 160, '… 나머지 192칸', { 'font-size': 14, fill: MUT });
      [['pool_alloc', '목록 맨 앞을 꺼낸다'], ['pool_free', '목록 맨 앞에 얹는다']].forEach(([a, b], i) => { const y = 220 + i * 60;
        card(220, y, 200, 46, { rx: 8, text: a, fs: 16, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 1.2 + i * 0.3) });
        tx(340, y + 6, b, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.3) }); });
      pill(620, 250, '둘 다 O(1) · 탐색 없음', GOOD, pop(u, 2.0), { fs: 15 }); return; }
    // k = 5: 크기가 같으니 어느 빈칸이든 맞는다
    tx(24, 50, '일반 힙', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    heapRow(140, 30, [1, 0, 1, 0, 1, 0], { lab: () => '사용' }); cross(660, 56, 10, 1);
    tx(24, 150, '메모리 풀', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    [1, 0, 1, 0, 1, 0].forEach((v, i) => { const fillIn = !v && u > 0.6 + i * 0.25;
      el('rect', { x: 140 + i * 78, y: 130, width: 72, height: 52, rx: 6, fill: v || fillIn ? ACCBG : PANEL, stroke: ACC, 'stroke-width': 2 });
      if (fillIn) mono(140 + i * 78 + 36, 162, '새 것', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' }); });
    check(660, 156, 10, fade(u, 2.0));
    tx(24, 260, '모든 슬롯이 같은 크기라 어느 빈칸에 넣어도 맞는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
    tx(24, 292, '이어진 빈칸이 모자라 실패하는 일이 없다', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // ---------- 2. 구조와 초기화 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(24, 44, 'typedef struct Slot { struct Slot *next; } Slot;', { 'font-size': 16, 'font-weight': 700 });
      el('rect', { x: 200, y: 120, width: 240, height: 90, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.3) });
      tx(214, 146, '빈 슬롯', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.3) });
      el('rect', { x: 214, y: 156, width: 212, height: 40, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 0.8) });
      mono(226, 182, 'next  (8바이트)', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
      el('rect', { x: 560, y: 120, width: 240, height: 90, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.2) });
      tx(574, 146, '다음 빈 슬롯', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
      const pth = el('path', { d: 'M426,176 C490,176 500,166 556,166', fill: 'none', stroke: INFO, 'stroke-width': 2.6, pathLength: 100, 'marker-end': u > 2 ? 'url(#ra-ah)' : null });
      pth.setAttribute('stroke-dasharray', `${E(u, 1.4, 2.0) * 100} 100`);
      tx(24, 290, '비어 있는 동안에는 슬롯 자체가 연결 리스트 노드다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(24, 320, '목록을 위한 메모리를 따로 잡지 않는다', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { mono(24, 44, 'typedef struct { … } MemPool;', { 'font-size': 16, 'font-weight': 700 });
      [['buffer', 'void *', 'malloc 한 큰 블록'], ['free_list', 'Slot *', '빈 목록의 머리'], ['slot_size', 'size_t', '슬롯 하나 크기'], ['count', 'size_t', '슬롯 개수']].forEach(([n, ty, d], i) => {
        const y = 80 + i * 62, s = pop(u, 0.3 + i * 0.3);
        card(260, y + 24, 300, 52, { rx: 6, stroke: i === 1 ? INFO : INK, fill: i === 1 ? INFOBG : PANEL, s });
        if (s > 0.6) { mono(122, y + 30, ty, { 'font-size': 14, fill: MUT }); mono(200, y + 30, n, { 'font-size': 16, 'font-weight': 800, fill: i === 1 ? INFO : INK }); tx(580, y + 30, d, { 'font-size': 14.5, fill: MUT }); }
        mono(90, y + 30, '+' + i * 8, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.5 + i * 0.3) }); });
      tx(122, 360, 'sizeof(MemPool) = 32 · 이 넷이면 풀 전체를 표현한다 (x86_64)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { mono(24, 44, 'if (slot_size < sizeof(Slot)) slot_size = sizeof(Slot);', { 'font-size': 15.5, 'font-weight': 700 });
      // slot_size 4 로 두면 next(8바이트)가 옆 슬롯을 침범한다
      tx(24, 100, 'slot_size = 4 그대로라면', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      for (let i = 0; i < 4; i++) el('rect', { x: 220 + i * 90, y: 80, width: 86, height: 40, rx: 4, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.3) });
      const w = 176 * E(u, 0.7, 1.3); el('rect', { x: 222, y: 86, width: w, height: 28, rx: 4, fill: BAD, opacity: 0.8 });
      if (u > 1.3) { mono(310, 106, 'next 8바이트', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' }); tx(600, 106, '슬롯 1 을 덮는다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); }
      tx(24, 200, '하한을 맞춘 뒤', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      for (let i = 0; i < 4; i++) el('rect', { x: 220 + i * 180, y: 180, width: 176, height: 40, rx: 4, fill: PANEL, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.7) });
      el('rect', { x: 222, y: 186, width: 172, height: 28, rx: 4, fill: INFO, opacity: 0.8 * fade(u, 1.9) });
      mono(308, 206, 'next', { 'font-size': 14, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      tx(24, 300, '실행 확인: slot_size 4 → 8, Bullet{int x, y} 는 원래 8', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      tx(24, 328, '정렬(alignment)도 포인터 크기 단위로 맞춰진다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.4) }); return; }
    if (k === 3) { mono(24, 44, 'p->buffer = malloc(slot_size * count);   // 8 × 4 = 32바이트', { 'font-size': 15.5, 'font-weight': 700 });
      pool({ s: ['raw', 'raw', 'raw', 'raw'], next: [-1, -1, -1, -1], head: null, op: fade(u, 0.4) });
      el('rect', { x: 24, y: 340, width: 300, height: 46, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.4) });
      mono(40, 369, 'if (!p->buffer) return -1;', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      tx(360, 369, '공간은 생겼지만 아직 목록은 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 4) { mono(24, 44, 'p->free_list = NULL;   char *base = (char *)p->buffer;', { 'font-size': 15.5, 'font-weight': 700 });
      pool({ s: ['raw', 'raw', 'raw', 'raw'], next: [-1, -1, -1, -1], head: -1 });
      // 바이트 눈금: base + i*8
      for (let b = 0; b <= 32; b++) { const x = SX + b * (SW / 8); el('line', { x1: x, y1: SY + SH + 30, x2: x, y2: SY + SH + (b % 8 ? 36 : 44), stroke: MUT, 'stroke-width': b % 8 ? 1 : 2, opacity: fade(u, 0.6) }); }
      [0, 1, 2, 3].forEach((i) => { const x = sx(i); grow(x + 2, SY + SH + 80, x + 2, SY + SH + 48, E(u, 1.0 + i * 0.25, 1.3 + i * 0.25), ACC);
        mono(x + 2, SY + SH + 100, i ? `base + ${i}*8` : 'base', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2 + i * 0.25) }); });
      tx(500, 110, 'char * 는 1바이트씩 더해진다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { mono(24, 44, 'for (i = count; i-- > 0; ) { s->next = free_list; free_list = s; }', { 'font-size': 15, 'font-weight': 700 });
      // 3번부터 거꾸로 push 한다
      const step = Math.min(4, Math.floor(clamp((u - 0.2) / 2.2) * 4.999)), frac = ((u - 0.2) / 2.2 * 4.999) % 1;
      const s = [0, 1, 2, 3].map((i) => (i >= 4 - step ? 'free' : 'raw'));
      const head = step === 0 ? -1 : 4 - step, prev = step <= 1 ? -1 : 5 - step;
      pool({ s, next: [1, 2, 3, -1], head, headFrom: prev, headU: clamp(frac * 2), arc: { [4 - step]: clamp(frac * 2) } });
      mono(480, 120, step ? `i = ${4 - step}` : 'i = 4', { 'font-size': 18, 'font-weight': 800, fill: ACC });
      tx(24, 380, '한 바퀴가 push 한 번 · 3번부터 넣으니 끝나면 머리는 0번', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    mono(24, 44, 'return 0;', { 'font-size': 16, 'font-weight': 700 });
    pool(cpy(FREE4));
    pill(480, 360, 'free_list → 0 → 1 → 2 → 3 → NULL', INFO, pop(u, 0.6), { mono: true, fs: 15 });
    tx(24, 400, '이제 pool_alloc 을 부를 수 있다', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) }); }

  // ---------- 3. pool_alloc ----------
  function sPtr(i, lbl, col, op) { const x = sx(i) + SW / 2; grow(x, SY + SH + 70, x, SY + SH + 34, 1, col || WARN, { op });
    mono(x, SY + SH + 90, lbl, { 'font-size': 16, 'font-weight': 800, fill: col || WARN, 'text-anchor': 'middle', opacity: op ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    const code = ['Slot *s = p->free_list;', 'if (s == NULL) return NULL;', 'p->free_list = s->next;  return s;', 'pool_init(&pool, sizeof(Bullet), 4);', 'Bullet *b0 = pool_alloc(&pool);', 'b0->x = 10;  b0->y = 20;', '// 남은 빈 슬롯: 1 → 2 → 3'][k];
    mono(24, 44, code, { 'font-size': 16, 'font-weight': 700 });
    if (k === 0) { pool(cpy(FREE4, { hot: 0 })); sPtr(0, 's', WARN, fade(u, 0.6));
      tx(500, 110, '머리 슬롯을 손에 쥐었을 뿐 · 아직 목록 그대로', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    if (k === 1) { pool({ s: ['used', 'used', 'used', 'used'], next: [-1, -1, -1, -1], head: -1, op: 0.9 });
      tx(500, 110, '4칸이 모두 쓰이는 중이면 free_list 는 NULL', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      card(300, 380, 260, 46, { rx: 8, text: 'return NULL;', fs: 16, mono: true, fw: 800, stroke: BAD, color: BAD, s: pop(u, 1.2) });
      tx(470, 386, '호출한 쪽이 NULL 을 확인해야 한다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
    if (k === 2) { const sw = E(u, 0.4, 1.2);
      pool({ s: [u > 1.2 ? 'used' : 'free', 'free', 'free', 'free'], next: [1, 2, 3, -1], head: 1, headFrom: 0, headU: sw, hot: 0 });
      sPtr(0, 's', WARN);
      tx(500, 110, u > 1.2 ? '0번은 목록에서 빠져 사용자에게 간다' : '머리를 s->next 로 옮긴다', { 'font-size': 15, 'font-weight': 700 });
      pill(780, 380, '포인터 세 줄 · O(1)', GOOD, pop(u, 1.8), { fs: 14 }); return; }
    if (k === 3) { pool(cpy(FREE4, { op: fade(u, 0.3) }));
      tx(500, 110, '새 풀 · 4칸 모두 빈칸, 머리는 0번', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 4) { const done = u > 0.9; pool(done ? cpy(ONE_USED, { headFrom: 0, headU: E(u, 0.9, 1.5) }) : cpy(FREE4));
      sPtr(0, 'b0', ACC, fade(u, 0.6));
      el('rect', { x: 480, y: 340, width: 330, height: 44, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 1.6) });
      mono(494, 368, 'if (b0 == NULL) { … }', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      tx(480, 410, 'malloc 과 같은 규칙', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 5) { const w = u > 1.0; pool(cpy(ONE_USED, { s: [w ? 'used' : 'used', 'free', 'free', 'free'], data: { 0: w ? 'x=10 y=20' : '(next 값)' }, hot: 0 }));
      if (w) { el('line', { x1: sx(0) + SW / 2, y1: SY + SH + 6, x2: sx(0) + SW / 2, y2: SY + SH + 6, stroke: 'none' }); }
      tx(500, 110, '조금 전까지 next 가 있던 8바이트', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      tx(500, 136, 'int x · int y 가 그 자리를 덮는다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      tx(24, 380, '목록에서 이미 빠졌으니 덮어써도 문제없다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    pool(cpy(ONE_USED, { data: { 0: 'x=10 y=20' } }));
    [1, 2, 3].forEach((i, j) => el('rect', { x: sx(i) + 2, y: SY, width: SW - 4, height: SH, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.4 + j * 0.3) }));
    tx(500, 110, '다음 요청은 탐색 없이 곧바로 1번', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); }

  // ---------- 4. pool_free ----------
  function s4(t, c) { const { k, u } = c;
    const code = ['if (ptr == NULL) return;', 's->next = p->free_list;', 'p->free_list = s;', 'free(p->buffer);  buffer = free_list = NULL;', 'pool_free(&pool, b0);  b0 = NULL;', '// 남의 포인터를 넘기면 목록이 깨진다'][k];
    mono(24, 44, code, { 'font-size': 16, 'font-weight': 700 });
    if (k === 0) { pool(cpy(ONE_USED, { data: { 0: 'x=10 y=20' } }));
      const b = seg(u, 0.4, 1.6); if (b > 0 && b < 1) { const y = b < 0.5 ? lerp(380, 300, b * 2) : lerp(300, 380, b * 2 - 1); card(120, y, 90, 34, { rx: 17, text: 'NULL', fs: 14, mono: true, fw: 800, fill: SOFT, stroke: MUT }); }
      if (u > 1.0) tx(200, 386, 'NULL 이면 아무것도 하지 않고 돌아간다 · free(NULL) 과 같은 규칙', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 1) { pool({ s: [u > 0.4 ? 'free' : 'used', 'free', 'free', 'free'], next: [1, 2, 3, -1], head: 1, arc: { 0: E(u, 0.6, 1.4) }, hot: 0, data: { 0: 'x=10 y=20' } });
      tx(500, 110, '0번을 다시 노드로 보고 next 에 1 을 쓴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) }); return; }
    if (k === 2) { pool(cpy(FREE4, { headFrom: 1, headU: E(u, 0.3, 1.1), hot: 0 }));
      tx(500, 110, '머리를 0번으로 · 빈 슬롯 4칸으로 복귀', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
      pill(780, 380, '포인터 두 줄 · O(1)', GOOD, pop(u, 1.6), { fs: 14 }); return; }
    if (k === 3) { const g = E(u, 0.4, 1.2);
      pool(g < 0.5 ? cpy(FREE4) : { s: ['gone', 'gone', 'gone', 'gone'], next: [-1, -1, -1, -1], head: -1 });
      if (g >= 0.5) tx(SX + 2 * SW, SY + SH + 60, '큰 블록 하나만 free · 슬롯 전부 무효', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
      tx(500, 110, '슬롯을 하나씩 돌려줄 필요가 없다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    if (k === 4) { pool(cpy(FREE4, { hot: 0 }));
      const cut = u > 1.0; card(120, 380, 130, 44, { rx: 8, stroke: cut ? GOOD : ACC }); mono(70, 386, 'b0', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      mono(170, 386, cut ? 'NULL' : '0x…', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: cut ? GOOD : ACC });
      if (!cut) grow(186, 372, sx(0) + 40, SY + SH + 4, 1, ACC, { dash: '5 4' });
      // 두 번 반납하면 자기 자신을 가리키는 고리가 생긴다
      el('rect', { x: 560, y: 340, width: 376, height: 70, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.8, opacity: fade(u, 1.6) });
      el('path', { d: 'M600,388 c-30,0 -30,-34 0,-34 c30,0 30,34 4,34', fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'marker-end': 'url(#ra-ahr)', opacity: fade(u, 1.8) });
      tx(640, 370, '같은 슬롯을 두 번 넣으면', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(640, 394, 'next 가 자기 자신 → 두 번 할당', { 'font-size': 14.5, fill: BAD, opacity: fade(u, 2.0) }); return; }
    pool(cpy(FREE4));
    // 버퍼 범위 [buffer, buffer+32)
    el('path', { d: `M${SX - 6},${SY + SH + 40} v10 H${SX + 4 * SW + 6} v-10`, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.3) });
    mono(SX + 2 * SW, SY + SH + 74, 'buffer ≤ ptr < buffer + 32', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
    card(870, 120, 110, 50, { rx: 8, text: '남의 주소', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 1.0) });
    grow(870, 146, 870, SY - 6, E(u, 1.3, 1.7), BAD, { dash: '4 4' }); cross(870, SY + 30, 10, pop(u, 1.8));
    tx(500, 110, '범위 밖이면 거절한다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }

  // ---------- 5. 종합 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { mono(24, 44, 'typedef struct { int x, y; } Bullet;', { 'font-size': 16, 'font-weight': 700 });
      ['int x', 'int y'].forEach((s, i) => card(300 + i * 160, 150, 150, 56, { rx: 6, text: s, fs: 16, mono: true, fw: 800, stroke: ACC, fill: ACCBG, s: pop(u, 0.4 + i * 0.25) }));
      el('path', { d: 'M225,190 v10 H535 v-10', fill: 'none', stroke: MUT, 'stroke-width': 2, opacity: fade(u, 1.0) });
      tx(380, 226, 'sizeof(Bullet) = 8 · 슬롯 하나에 딱 맞는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      card(120, 300, 150, 52, { rx: 8, stroke: INK, s: pop(u, 1.5) }); mono(60, 306, 'Bullet *', { 'font-size': 14.5, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.6) });
      grow(196, 300, 300, 182, E(u, 1.8, 2.3), ACC);
      tx(220, 340, '풀이 내주는 것은 슬롯을 가리키는 포인터', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { mono(24, 44, 'pool_init(&pool, sizeof(Bullet), 4);', { 'font-size': 16, 'font-weight': 700 });
      pool(cpy(FREE4, { op: fade(u, 0.4) }));
      pill(760, 110, 'malloc 1회', ACC, pop(u, 1.0), { fs: 15 });
      tx(500, 380, '이후 프로그램은 malloc 을 부르지 않는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 2) { mono(24, 44, 'a = pool_alloc(&pool);  b = pool_alloc(&pool);  a->x = 1; b->x = 2;', { 'font-size': 15, 'font-weight': 700 });
      const st = u < 0.7 ? cpy(FREE4) : u < 1.4 ? cpy(ONE_USED, { data: { 0: 'a' } }) : { s: ['used', 'used', 'free', 'free'], next: [-1, -1, 3, -1], head: 2, data: { 0: u > 2 ? 'x=1' : 'a', 1: u > 2 ? 'x=2' : 'b' } };
      pool(st); if (u > 0.7) sPtr(0, 'a', ACC); if (u > 1.4) sPtr(1, 'b', ACC);
      tx(560, 380, '실행 확인: a = 슬롯 0, b = 슬롯 1', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { mono(24, 44, 'pool_free(&pool, a);  a = NULL;', { 'font-size': 16, 'font-weight': 700 });
      pool({ s: ['free', 'used', 'free', 'free'], next: [2, -1, 3, -1], head: 0, headFrom: 2, headU: E(u, 0.4, 1.1), arc: { 0: E(u, 0.2, 0.6) }, data: { 1: 'x=2' }, hot: 0 });
      sPtr(1, 'b', ACC); card(120, 380, 120, 40, { rx: 8, text: 'a = NULL', fs: 14.5, mono: true, fw: 800, stroke: GOOD, color: GOOD, s: pop(u, 1.4) });
      tx(560, 380, '0번이 다시 목록 머리 (push)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    if (k === 4) { mono(24, 44, 'Bullet *c = pool_alloc(&pool);', { 'font-size': 16, 'font-weight': 700 });
      const got = u > 0.8;
      pool(got ? { s: ['used', 'used', 'free', 'free'], next: [-1, -1, 3, -1], head: 2, headFrom: 0, headU: E(u, 0.8, 1.4), data: { 0: 'c', 1: 'x=2' }, hot: 0 } : { s: ['free', 'used', 'free', 'free'], next: [2, -1, 3, -1], head: 0, data: { 1: 'x=2' } });
      if (got) sPtr(0, 'c', ACC); sPtr(1, 'b', ACC, 0.6);
      el('rect', { x: 500, y: 92, width: 436, height: 40, rx: 8, fill: INK, opacity: fade(u, 1.6) });
      mono(514, 118, 'reused slot: 0x…  (a 와 같은 주소)', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 1.6) });
      tx(24, 400, '실행 확인: c == 예전 a · 주소 값은 실행마다 다르다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { mono(24, 44, 'pool_destroy(&pool);   // free 한 번', { 'font-size': 16, 'font-weight': 700 });
      pool({ s: ['gone', 'gone', 'gone', 'gone'], next: [-1, -1, -1, -1], head: -1, op: 1 - 0.3 * E(u, 1.4, 2) });
      // 한계: 슬롯보다 큰 객체는 못 담는다
      el('rect', { x: SX, y: 120, width: 330 * E(u, 0.6, 1.2), height: 40, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 2 });
      if (u > 1.2) { tx(SX + 12, 146, 'Bullet 보다 큰 객체', { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); tx(SX + 350, 146, '8바이트 슬롯에 안 들어간다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD }); }
      tx(24, 400, '한계 하나 · 슬롯 크기가 고정이다 (크기별로 풀을 따로 두거나 일반 할당자)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k = 6: 다섯 번째 요청은 NULL · 배운 개념이 한 장에
    pool({ s: ['used', 'used', 'used', 'used'], next: [-1, -1, -1, -1], head: -1, data: { 0: '1', 1: '2', 2: '3', 3: '4' } });
    card(884, SY + SH / 2, 140, 50, { rx: 8, text: '5번째 → NULL', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 0.4) });
    [['포인터', '슬롯 주소 · next'], ['malloc/free', '큰 블록 1회'], ['구조체', 'MemPool · Slot'], ['연결 리스트', 'alloc=pop · free=push'], ['정렬', 'slot_size ≥ sizeof(Slot)']].forEach(([a, b], i) => {
      const x = 100 + i * 190, s = pop(u, 0.9 + i * 0.2); card(x, 370, 176, 62, { rx: 10, stroke: ACC, s });
      if (s > 0.6) { tx(x, 364, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); tx(x, 386, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); } });
    tx(500, 110, '한계 둘 · 개수도 미리 정한다 (4칸이면 다섯 번째는 NULL)', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) }); }

  const quiz = [
    { q: '일반 힙에서 빈칸이 모두 3칸인데 2칸짜리 요청이 실패하는 이유는 무엇인가?',
      o: ['힙 전체 크기가 2칸보다 작아서', '빈칸이 흩어져 이어진 2칸이 없어서', 'free를 너무 자주 불러서'], a: 1,
      why: '사용 중인 칸 사이사이에 빈칸이 끼어 있어 합계는 충분해도 연속 공간이 없다. 이것이 외부 단편화다.' },
    { q: '메모리 풀에서 빈 슬롯의 next 포인터는 어디에 저장되는가?',
      o: ['풀 옆에 따로 잡은 관리용 배열', 'MemPool 구조체 안의 배열', '빈 슬롯 자기 자신의 8바이트 안'], a: 2,
      why: '비어 있는 슬롯은 어차피 안 쓰는 공간이라 그 안에 다음 빈 슬롯 주소를 적는다. 관리용 메모리가 따로 필요 없다.' },
    { q: '머리가 0번이고 목록이 0 → 1 → 2 → 3일 때 pool_alloc을 한 번 부르면 free_list는 어디를 가리키는가?',
      o: ['1번 슬롯', '0번 슬롯 그대로', 'NULL'], a: 0,
      why: 'pool_alloc은 머리(0번)를 떼어 주고 free_list를 0번의 next, 즉 1번으로 옮긴다. 연결 리스트의 pop이다.' },
    { q: '같은 슬롯을 pool_free로 두 번 넣으면 어떤 일이 생기는가?',
      o: ['두 번째 호출은 자동으로 무시된다', '그 슬롯의 next가 자기 자신을 가리켜 같은 슬롯이 두 번 할당된다', '풀 전체가 즉시 해제된다'], a: 1,
      why: '두 번째 push에서 s->next = free_list가 s 자신이 되어 고리가 생긴다. 그래서 반납 후 포인터를 NULL로 만든다.' },
    { q: 'a를 반납한 뒤 pool_alloc으로 받은 c는 어떤 주소인가?',
      o: ['b 바로 다음 슬롯의 주소', '새로 malloc한 주소', 'a가 쓰던 슬롯 0의 주소'], a: 2,
      why: '반납한 0번이 목록 머리로 들어갔으니 다음 pop이 바로 0번을 준다. 실행해 보면 c와 예전 a가 같은 주소다.' },
  ];

  const summary = [
    'malloc을 자주 부르면 탐색 비용이 쌓이고, 크기가 섞이면 빈칸이 흩어진다.',
    '풀은 malloc 한 번으로 같은 크기 슬롯을 만들고, 빈 슬롯끼리 next로 잇는다.',
    'pool_alloc은 목록 맨 앞을 떼어 주고, pool_free는 맨 앞에 다시 얹는다.',
    '슬롯 크기와 개수가 고정이라 4칸 풀에서 다섯 번째 요청은 NULL이다.',
  ];
  const review = [
    { q: '총알 풀을 만들었는데 b0를 두 번 pool_free한 뒤로 두 총알이 같은 좌표를 공유한다. 원인과 방어는?',
      o: ['slot_size가 작아서 생긴 일이니 슬롯을 키운다', '목록에 고리가 생겼으니 반납 후 b0 = NULL로 둔다', 'pool_destroy를 먼저 부른다'], a: 1,
      why: '같은 슬롯이 두 번 push되면 next가 자기 자신을 가리켜 같은 주소가 두 번 나간다. 반납 직후 포인터를 지우면 두 번째 호출이 NULL 검사에 걸린다.' },
    { q: 'int 하나(4바이트)를 담는 풀을 slot_size 4로 만들려 한다. pool_init은 slot_size를 얼마로 바꾸는가?',
      o: ['4 그대로', '32', 'sizeof(Slot)인 8'], a: 2,
      why: '빈 슬롯은 next 포인터를 담아야 한다. 8바이트 포인터가 4바이트 슬롯에 들어가면 옆 슬롯을 덮으므로 하한 8로 올린다.' },
    { q: '크기가 요청마다 제각각인 객체를 이 장의 풀 하나로 처리하려 한다. 어떻게 될까?',
      o: ['슬롯 크기가 고정이라 맞지 않는다', '그대로 O(1)로 잘 처리된다', '단편화가 오히려 더 심해진다'], a: 0,
      why: '풀은 같은 크기 객체를 자주 만들고 지울 때 쓴다. 크기가 다양하면 크기별 풀을 여러 개 두거나 일반 할당자를 쓴다.' },
  ];

  R.page({ title: '메모리 풀 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
