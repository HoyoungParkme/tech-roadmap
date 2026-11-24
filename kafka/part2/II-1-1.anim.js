/* II-1-1 Topic / Partition / Offset — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   key 가 가는 partition 은 Java 기본 파티셔너(murmur2(key) & 0x7fffffff % N)를 python 으로 재현해 계산한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ── 공통: 로그 칸 ──────────────────────────────────────────
  const SHORT = (v) => (v === 'msg' ? 'msg' : v.replace('order_', '').replace('_for_u101', '*'));
  const KEY = (k) => (k.startsWith('(') ? 'key 없음' : k);
  const parts = (b) => b.partitions || [];
  const msgs = (b, i) => ((parts(b)[i] || {}).messages || []);
  // 한 partition 줄: x = 첫 칸 왼쪽, y = 칸 위쪽. o.newFrom 번째 칸부터 o.at 초에 차례로 나타난다
  function logRow(x, y, name, list, o) {
    o = o || {}; const w = o.w || 92, h = o.h || 48, gap = o.gap ?? 8, u = o.u ?? 3;
    if (name) mono(x - 14, y + h / 2 + 5, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: o.nameCol || INK });
    list.forEach((m, i) => {
      const fresh = o.newFrom != null && i >= o.newFrom, s = fresh ? pop(u, (o.at ?? 0.6) + (i - o.newFrom) * (o.step ?? 0.4)) : 1;
      const st = (o.style && o.style(i, m)) || {}, cx = x + i * (w + gap) + w / 2;
      const text = o.text ? o.text(m) : KEY(m.key) + '\n' + SHORT(m.value);
      card(cx, y + h / 2, w, h, { rx: 6, text, fs: o.fs || 13.5, mono: true, fw: 600, s, stroke: st.stroke || (m.example ? WARN : INK), fill: st.fill || (m.example ? C.WARNBG : PANEL), color: st.color, sw: st.sw || 2, dash: m.example ? '5 4' : null });
      if (o.index !== false) mono(cx, y + h + 18, String(i), { 'font-size': 14, 'font-weight': 700, fill: st.idx || MUT, 'text-anchor': 'middle', opacity: s > 0.3 ? 1 : 0 });
    });
    if (o.tail) { const cx = x + list.length * (w + gap) + w / 2;
      card(cx, y + h / 2, w, h, { rx: 6, stroke: GRID, dash: '5 5', sw: 1.6, fill: 'none', op: o.tailOp ?? 1 }); }
    return { cell: (i) => [x + i * (w + gap) + w / 2, y + h / 2], w, h };
  }
  const prevN = (c, i) => (c.prev ? msgs(c.prev, i).length : msgs(c.beat, i).length);

  // ── 장면 1~3 공통 무대: Producer · 토픽 상자 · Consumer ─────────────
  const PX = 70, CX = 890, LX = 225;
  const ROWS3 = [96, 186, 276];
  function ends(o) { o = o || {};
    card(PX, o.py || 210, 104, 50, { text: 'Producer', fs: 15, stroke: INK, sw: 2.2 });
    card(CX, o.cy || 210, 104, 50, { text: o.cName || 'Consumer', fs: 15, stroke: INK, sw: 2.2, op: o.cOp ?? 1 }); }

  // 1. Topic — 이름표
  function s1(t, c) { const { k, u } = c;
    ends({ py: 200, cy: 200 });
    if (k === 0) {
      card(480, 200, 380, 100, { rx: 12, stroke: GRID, dash: '7 6', sw: 2, fill: 'none' });
      lbl(480, 206, '토픽 없음', fade(u, 0.3), { fill: MUT, 'font-size': 17 });
      grow(PX + 54, 200, 270, 200, E(u, 0.6, 1.4), MUT, { dash: '6 5' }); if (u > 1.4) cross(282, 200, 11, pop(u, 1.4));
      grow(CX - 54, 200, 690, 200, E(u, 1.2, 2.0), MUT, { dash: '6 5' }); if (u > 2.0) cross(678, 200, 11, pop(u, 2.0));
      sub(PX + 10, 260, '어디에 쓰지?', fade(u, 1.5), { fill: BAD, 'font-weight': 700 }); sub(CX - 10, 260, '어디서 읽지?', fade(u, 2.1), { fill: BAD, 'font-weight': 700 });
      return; }
    const gw = k === 1 ? lerp(40, 520, E(u, 0.2, 1.2)) : 520;
    zone(480 - gw / 2, 128, gw, 150, gw > 300 ? 'topic  orders' : '', { fill: ACCBG, stroke: ACC, sw: 2.2, color: ACC });
    if (k === 1) pill(480, 92, 'kafka-topics.sh --create --topic orders', INK, pop(u, 1.1), { mono: true, fs: 13.5 });
    const list = msgs(c.beat, 0), show = k === 1 ? E(u, 1.2, 1.6) : 1;
    if (show > 0.5) logRow(LX + 20, 172, null, list, { tail: true, newFrom: prevN(c, 0), u, at: 1.0 });
    if (k === 2) { ['orders', 'payments', 'user-signups'].forEach((n, i) => pill(170 + i * 150, 70, n, i === 0 ? ACC : MUT, pop(u, 0.2 + i * 0.25), { mono: true, fs: 13.5 }));
      sub(480, 104, 'kafka-topics.sh --list', fade(u, 0.2), { class: 'mono' });
      fly(PX + 40, 200, LX + 66, 196, seg(u, 0.4, 1.0), 'u-101 created', { mono: true }); }
    if (k === 3) { fly(PX + 40, 200, LX + 166, 196, seg(u, 0.2, 0.8), 'u-103 paid', { mono: true });
      pill(PX + 30, 300, "send('orders')", INK, pop(u, 1.0), { mono: true, fs: 13.5 }); pill(CX - 30, 300, "subscribe('orders')", INK, pop(u, 1.3), { mono: true, fs: 13.5 });
      grow(CX - 54, 200, 742, 200, E(u, 1.3, 1.9), ACC);
      banner(480, 372, '토픽 이름 하나로 쓰는 쪽과 읽는 쪽이 만난다', pop(u, 1.9)); }
    grow(PX + 54, 200, 216, 200, k === 1 ? E(u, 1.4, 2.0) : 1, ACC); }

  // 2. Partition — 토픽 안의 로그 여러 개
  function s2(t, c) { const { k, u } = c;
    ends({ cOp: 0 });
    const n = parts(c.beat).length;
    const zh = k === 1 ? lerp(110, 290, E(u, 0.3, 1.4)) : n === 1 ? 110 : 290;
    zone(150, 60, 610, zh, 'topic  orders', { fill: ACCBG, stroke: ACC, sw: 2, color: ACC });
    parts(c.beat).forEach((p, i) => {
      const f = k === 1 && i > 0 ? E(u, 0.3, 1.4) : 1, y = lerp(ROWS3[0], ROWS3[i], f);
      if (f < 0.12) return;
      logRow(LX, y, 'P' + i, p.messages, { tail: true, newFrom: k === 2 ? prevN(c, i) : null, u, at: 0.9 });
      if (k < 3) mono(772, y + 30, `orders-${i}/`, { 'font-size': 13.5, fill: MUT, opacity: k === 0 && i === 0 ? fade(u, 1.2) : 1 }); });
    if (k === 0) { const tx0 = LX + 2 * 100 + 46;
      grow(tx0, ROWS3[0] - 26, tx0, ROWS3[0] - 4, E(u, 0.6, 1.1), ACC);
      tx(tx0 + 12, ROWS3[0] - 12, '새 메시지는 끝에만 붙는다 (append-only)', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      sub(455, 214, 'partition 하나 = 디스크의 로그 디렉터리 하나 (orders-0/)', fade(u, 1.6), { 'font-size': 14.5 }); }
    if (k === 1) sub(455, 380, '--partitions 3으로 만든 orders 안에는 로그가 세 줄 있다', fade(u, 1.5), { 'font-size': 14.5 });
    if (k === 2) { [[1, 0], [2, 0], [2, 1]].forEach(([pi, mi], j) => { const at = 0.2 + j * 0.45;
        dot([[PX + 52, 210], [180, ROWS3[pi] + 24], [LX + mi * 100 + 46, ROWS3[pi] + 24]], seg(u, at, at + 0.55), ACC, 7); });
      ['병렬성', '확장성', '분산 저장'].forEach((s, i) => pill(300 + i * 160, 385, s, GOOD, pop(u, 1.6 + i * 0.25), { fs: 14.5 })); }
    if (k === 3) { const y2 = ROWS3[2] + 24;
      grow(LX + 46, y2 - 34, LX + 146, y2 - 34, E(u, 0.3, 1.0), GOOD); check(LX + 172, y2 - 34, 9, pop(u, 1.0));
      tx(LX + 186, y2 - 29, 'P2 안: created → shipped 순서 그대로', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      el('path', { d: `M${LX + 146},${ROWS3[0] + 48} C ${LX + 250},${ROWS3[0] + 120} ${LX + 250},${ROWS3[2] - 60} ${LX + 46},${ROWS3[2]}`, fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.5) });
      cross(LX + 236, 222, 10, pop(u, 1.8));
      tx(LX + 256, 228, 'P0 paid와 P2 created, 누가 먼저인지 모른다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); } }

  // 3. Offset — partition 안의 번호와 consumer 의 자리
  function s3(t, c) { const { k, u } = c, b = c.beat;
    zone(150, 60, 610, 290, 'topic  orders', { fill: ACCBG, stroke: ACC, sw: 2, color: ACC });
    parts(b).map((p, i) => logRow(LX, ROWS3[i], 'P' + i, p.messages, {
      tail: true, newFrom: k === 1 ? prevN(c, i) : null, u, at: 0.5,
      style: (j) => (k === 0 && j === 1 ? { stroke: WARN, sw: 3, idx: WARN } : k === 4 && j >= (i === 0 ? 3 : 2) ? { stroke: WARN, fill: C.WARNBG, sw: 2.4 }
        : k === 5 && j === 1 ? { stroke: i === 2 && u > 1.6 ? GOOD : WARN, sw: 3, fill: i === 2 && u > 1.6 ? C.GOODBG : null } : null) }));
    if (k === 0) { sub(890, 120, 'offset 1이', fade(u, 0.6), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 }); sub(890, 142, '줄마다 따로 있다', fade(u, 0.8), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 });
      sub(890, 190, '한 번 붙은 번호는', fade(u, 1.6)); sub(890, 210, '바뀌지 않는다', fade(u, 1.6)); }
    if (k === 1) { pill(860, 120, 'broker가 붙인다', INK, pop(u, 1.4), { fs: 14 }); sub(860, 152, 'producer가 정하지 않는다', fade(u, 1.8)); }
    if (k >= 2 && k <= 3) {
      card(CX, 210, 96, 50, { text: 'C1', fs: 16, stroke: k === 3 && u > 1.2 && u < 2.0 ? BAD : INK, sw: 2.2 });
      let at = 0; if (k === 3) at = u < 1.2 ? lerp(0, 2, E(u, 0.1, 1.1)) : 3;
      const px = LX + at * 100 + 46; el('path', { d: `M${px - 9},${ROWS3[0] - 8} L${px + 9},${ROWS3[0] - 8} L${px},${ROWS3[0] + 2} Z`, fill: INFO });
      mono(px, ROWS3[0] - 14, k === 3 && u >= 1.9 ? 'C1 재시작 → 3' : 'C1', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle' });
      if (k === 3 && u > 1.2 && u < 2.0) cross(CX, 210, 16, pop(u, 1.2));
      const v = k === 2 ? 0 : u < 1.2 ? 0 : 3;
      card(470, 386, 400, 42, { rx: 8, stroke: INFO, sw: 2, fill: C.INFOBG, op: k === 2 ? fade(u, 0.8) : 1 });
      mono(284, 392, '__consumer_offsets', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: k === 2 ? fade(u, 0.8) : 1 });
      mono(450, 392, `order-processor · P0 → ${v}`, { 'font-size': 14, fill: INK, opacity: k === 2 ? fade(u, 1.0) : 1 });
      if (k === 3) sub(CX, 268, '다음에 읽을 3을 커밋', fade(u, 2.0), { fill: GOOD, 'font-weight': 700 }); }
    if (k === 4) { const tab = [['P0', 3, 4], ['P1', 2, 2], ['P2', 2, 3]];
      mono(830, 82, 'CUR  END  LAG', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
      tab.forEach(([p, cur, end], i) => { const y = ROWS3[i] + 30, op = fade(u, 0.4 + i * 0.35);
        mono(830, y, `${cur}    ${end}    ${end - cur}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: end - cur ? WARN : GOOD, opacity: op }); });
      sub(455, 386, '노란 칸 = 아직 안 읽은 메시지 = LAG', fade(u, 1.6), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 5) { pill(880, 120, 'offset 1 → 세 개', WARN, pop(u, 0.3), { mono: true, fs: 13.5 });
      pill(880, 290, '(P2, 1) → 하나', GOOD, pop(u, 1.6), { mono: true, fs: 13.5 }); sub(880, 322, 'u-104 shipped', fade(u, 1.9), { class: 'mono', fill: INK }); } }

  // 4. Key → partition
  const HASH = { 'u-101': [1069861818, 0], 'u-102': [1403017637, 2], 'u-114': [540305776, 1] };
  const RX = 520, ROWS4 = [80, 175, 270];
  function machine(key, u, o) { o = o || {}; const keyless = !HASH[key], [h, p] = HASH[key] || [];
    const x = 180, col = keyless ? WARN : ACC;
    pill(x, 76, keyless ? 'key = None' : `key = "${key}"`, col, o.k0 ? pop(u, 0.2) : 1, { mono: true, fs: 15 });
    grow(x, 96, x, 124, o.k0 ? E(u, 0.5, 0.8) : 1, MUT);
    card(x, 150, 200, 44, { rx: 8, text: keyless ? '해시 안 함' : 'murmur2(key)', mono: !keyless, fs: 15, stroke: col, fill: keyless ? C.WARNBG : ACCBG, s: o.k0 ? pop(u, 0.7) : 1 });
    grow(x, 174, x, 202, o.k0 ? E(u, 1.0, 1.3) : 1, MUT);
    mono(x, 226, keyless ? 'sticky / 무작위' : `& 0x7fffffff = ${h}`, { 'font-size': 14.5, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, opacity: o.k0 ? fade(u, 1.2) : 1 });
    if (!keyless) { mono(x, 262, `${h} % 3 = ${p}`, { 'font-size': 16, 'text-anchor': 'middle', fill: col, 'font-weight': 800, opacity: o.k0 ? fade(u, 1.6) : 1 });
      grow(x + 90, 258, RX - 70, ROWS4[p] + 24, o.k0 ? E(u, 1.9, 2.5) : 1, ACC); }
    else mono(x, 262, '어느 줄로 갈지 정해지지 않는다', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 }); }
  function rows4(c, o) { o = o || {};
    parts(c.beat).forEach((p, i) => logRow(RX, ROWS4[i], 'P' + i, p.messages, { w: 90, tail: true, newFrom: o.anim ? prevN(c, i) : null, u: c.u, at: (o.atRow && o.atRow[i]) ?? o.at ?? 0.8, step: o.step ?? 0.45,
      style: (j, m) => (m.keyHi && o.hiKey === m.key ? { stroke: ACC, sw: 2.8 } : null) })); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { machine('u-101', u, { k0: true }); rows4(c); sub(180, 320, 'producer가 보내기 전에 계산한다', fade(u, 2.2)); return; }
    if (k === 1) { machine('u-101', u); rows4(c, { anim: true, hiKey: 'u-101' });
      for (let j = 0; j < 3; j++) fly(270, 258, RX + j * 98 + 45, ROWS4[0] + 24, seg(u, 0.3 + j * 0.45, 0.8 + j * 0.45), 'u-101', { mono: true });
      banner(480, 380, '같은 key → 같은 줄, offset 0·1·2로 순서대로', pop(u, 2.1)); return; }
    if (k === 2) { machine('u-102', u, { k0: true }); rows4(c, { anim: true, at: 2.0, step: 0.4, hiKey: 'u-102' }); return; }
    if (k === 3) { machine(null, u); rows4(c, { anim: true, atRow: [0, 0.8, 1.4] });
      fly(270, 258, RX + 45, ROWS4[1] + 24, seg(u, 0.2, 0.8), 'created*', { mono: true, fill: WARN });
      fly(270, 258, RX + 2 * 98 + 45, ROWS4[2] + 24, seg(u, 0.8, 1.4), 'paid*', { mono: true, fill: WARN });
      sub(RX + 200, 372, '* key 없이 보낸 u-101 주문 · 자리는 예시', fade(u, 1.4), { fill: WARN, 'font-weight': 700 });
      card(180, 345, 300, 50, { rx: 8, stroke: BAD, sw: 2, fill: C.BADBG, s: pop(u, 1.9), text: 'P2를 먼저 읽으면\npaid가 created보다 먼저', fs: 14, color: BAD });
      return; }
    rows4(c, { hiKey: null });
    tx(40, 92, '지킬 순서', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(345, 92, 'key', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    [['한 사용자의 이벤트', 'user_id'], ['한 주문의 상태 변화', 'order_id']].forEach(([a, kk], i) => { const y = 140 + i * 64, s = pop(u, 0.3 + i * 0.4);
      card(150, y, 220, 46, { rx: 8, text: a, fs: 14.5, stroke: GOOD, s }); grow(262, y, 300, y, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), GOOD);
      pill(370, y, kk, GOOD, s, { mono: true, fs: 14.5 }); });
    card(220, 330, 380, 56, { rx: 8, stroke: WARN, sw: 2, fill: C.WARNBG, s: pop(u, 1.5), text: '단, partition 수를 바꾸면\n% N이 달라져 매핑이 깨진다', fs: 14, color: INK }); }

  // 5. Partition 수 — consumer 와의 균형
  const CONS_X = 820;
  function assignOf(b) { const out = {}; (b.consumers || []).forEach((cn) => { const m = cn.reading.match(/Partition ([\d, ]+)/); out[cn.id] = m ? m[1].split(',').map((s) => +s.trim()) : []; });
    if (b.consumers && b.consumers.length === 1 && /혼자/.test(b.consumers[0].reading)) out[b.consumers[0].id] = [0, 1, 2]; return out; }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 5) { // 체크리스트
      parts(b).forEach((p, i) => { logRow(110, 70 + i * 92, 'P' + i, p.messages, { w: 70, h: 40, index: false, text: (m) => m.key });
        grow(260, 90 + i * 92, 330, 90 + i * 92, 1, GRID, { plain: true }); card(370, 90 + i * 92, 70, 40, { text: 'C' + (i + 1), fs: 15 }); });
      tx(470, 70, '바꾸기 전에', { 'font-size': 17, 'font-weight': 800 });
      ['목표 처리량을 쟀다', 'partition 당 처리량을 쟀다', 'consumer 수 계획이 있다', 'key 기반이면 매핑 변화를 검토했다', 'LAG·처리량 모니터링이 있다'].forEach((s, i) => { const y = 112 + i * 56, d = seg(u, 0.3 + i * 0.35, 0.6 + i * 0.35);
        el('rect', { x: 470, y: y - 14, width: 26, height: 26, rx: 5, fill: d > 0.5 ? C.GOODBG : PANEL, stroke: d > 0.5 ? GOOD : GRID, 'stroke-width': 2 }); if (d > 0.5) check(483, y - 1, 8, pop(u, 0.5 + i * 0.35));
        tx(510, y + 5, s, { 'font-size': 15, 'font-weight': 600, opacity: fade(u, 0.2 + i * 0.35) }); });
      return; }
    const n = parts(b).length, gapY = n > 3 ? 56 : 80, top = n > 3 ? 40 : 70;
    const ys = parts(b).map((_, i) => top + i * gapY);
    parts(b).forEach((p, i) => { const fresh = k === 3 && i >= 3, s = fresh ? pop(u, 0.4 + (i - 3) * 0.25) : 1; if (s <= 0) return;
      logRow(110, ys[i], 'P' + i, p.messages, { w: 70, h: 40, index: false, tail: false, text: (m) => m.key, newFrom: k === 4 && i === 5 ? 0 : null, u, at: 1.0,
        style: (j, m) => (k === 4 && m.key === 'u-102' ? { stroke: BAD, sw: 3 } : null) });
      if (p.messages.length === 0) card(145, ys[i] + 20, 70, 40, { rx: 6, stroke: GRID, dash: '5 5', sw: 1.6, fill: 'none', s }); });
    const A = assignOf(b), prevA = c.prev ? assignOf(c.prev) : A, ids = Object.keys(A);
    const cy = (j) => (ids.length === 1 ? 160 : 70 + j * (ids.length > 3 ? 82 : 110));
    ids.forEach((id, j) => { const fresh = !(id in prevA), s = fresh ? pop(u, 0.3 + j * 0.15) : 1, idle = A[id].length === 0;
      card(CONS_X, cy(j), 92, 50, { text: idle ? id + '\nidle' : id, fs: 15, stroke: idle ? MUT : INK, dash: idle ? '6 5' : null, color: idle ? MUT : INK, s });
      A[id].forEach((pi) => { const moved = JSON.stringify(prevA[id] || []) !== JSON.stringify(A[id]);
        grow(282, ys[pi] + 20, CONS_X - 48, cy(j), moved ? E(u, 0.9, 1.6) : 1, ACC, { plain: true, sw: 2 }); }); });
    if (k === 0) { banner(480, 372, 'consumer 1명이면 partition이 3개여도 병렬성은 1', pop(u, 1.0)); sub(480, 330, '처음엔 3~6개로 시작해 지켜보며 늘린다', fade(u, 1.8)); }
    if (k === 1) card(480, 360, 440, 58, { rx: 10, stroke: INFO, fill: C.INFOBG, s: pop(u, 1.4), text: 'MAX(10,000 ÷ 2,000, consumer 5) = 5\n여유 1을 더해 6 (시나리오 B)', fs: 14.5, mono: true });
    if (k === 2) sub(CONS_X, cy(3) + 46, '받을 partition이 없다', fade(u, 1.4), { fill: BAD, 'font-weight': 700 });
    if (k === 3) pill(500, 380, 'kafka-topics.sh --alter --partitions 6', INK, pop(u, 0.2), { mono: true, fs: 13.5 });
    if (k === 4) { card(520, 112, 230, 128, { rx: 10, stroke: GRID, sw: 1.5, s: pop(u, 0.2) });
      mono(425, 74, 'key    %3 → %6', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.3) });
      [['u-101', 0, 0], ['u-114', 1, 4], ['u-102', 2, 5]].forEach(([kk, a, bb], i) => mono(425, 104 + i * 26, `${kk}  P${a} → P${bb}`, { 'font-size': 14.5, 'font-weight': 700, fill: a === bb ? GOOD : BAD, opacity: fade(u, 0.4 + i * 0.3) }));
      sub(480, 405, '같은 u-102가 P2와 P5 두 줄에 나뉜다', fade(u, 1.8), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 }); } }

  const quiz = [
    { q: 'Producer와 Consumer가 같은 데이터를 주고받으려면 미리 맞춰야 하는 것은 무엇인가?',
      o: ['서로의 IP 주소', '토픽 이름', '메시지의 offset 번호'], a: 1,
      why: 'Producer는 쓸 토픽을, Consumer는 읽을 토픽을 이름으로만 지정한다. orders라는 이름이 둘이 만나는 약속이다.' },
    { q: 'orders의 Partition 0과 Partition 2에 들어간 메시지 사이의 순서는 어떻게 되는가?',
      o: ['들어온 시각 순서가 보장된다', 'partition 번호가 작은 쪽이 먼저다', '보장되지 않는다'], a: 2,
      why: '순서는 한 partition 안에서만 지켜진다. partition끼리는 서로 독립된 로그라 어느 쪽이 먼저인지 알 수 없다.' },
    { q: 'C1이 Partition 0의 offset 2까지 처리하고 커밋한 뒤 죽었다. 재시작한 C1은 어디부터 읽는가?',
      o: ['offset 3부터', 'offset 0부터 처음부터', '가장 최근 메시지부터'], a: 0,
      why: '__consumer_offsets에 다음에 읽을 위치 3이 남아 있어 그 자리부터 이어 읽는다.' },
    { q: '3개 partition인 orders에 key "u-102"로 이벤트 두 건을 보내면 어디로 가는가?',
      o: ['두 건 모두 Partition 2', 'Partition 0과 1에 한 건씩', '보낼 때마다 무작위'], a: 0,
      why: 'murmur2("u-102") 값 1403017637을 3으로 나누면 나머지가 2다. 같은 key는 매번 같은 계산이라 같은 줄로 간다.' },
    { q: 'partition 3개인 토픽에 consumer 4명을 붙이면 무슨 일이 생기는가?',
      o: ['처리량이 4배가 된다', '두 명이 한 partition을 나눠 읽는다', '한 명은 배정받을 partition이 없어 논다'], a: 2,
      why: '그룹 안에서 한 partition은 한 consumer만 읽는다. partition 수가 병렬성의 천장이라 C4는 idle이 된다.' },
  ];

  const summary = [
    '토픽은 메시지를 모으는 이름표이고, 쓰는 쪽과 읽는 쪽은 이 이름 하나로 만난다.',
    '토픽 안은 append-only 로그 여러 줄(partition)이고, 순서는 한 줄 안에서만 지켜진다.',
    'offset은 줄마다 0부터 붙는 번호다. consumer는 다음에 읽을 offset을 커밋해 두고 이어 읽는다.',
    '같은 key는 murmur2 % N으로 늘 같은 줄에 간다. N을 바꾸면 u-102처럼 줄이 바뀐다.',
  ];
  const review = [
    { q: '주문의 "결제"가 "생성"보다 먼저 처리되는 버그가 났다. producer 코드를 보니 key 없이 보내고 있다. 먼저 할 일은?',
      o: ['partition 수를 1개로 줄인다', 'order_id를 key로 넣어 보낸다', 'consumer를 더 붙인다'], a: 1,
      why: 'key가 없으면 두 이벤트가 다른 partition에 떨어질 수 있다. order_id를 key로 쓰면 한 주문의 이벤트가 한 줄에 순서대로 쌓인다.' },
    { q: 'LAG이 계속 커져 orders를 3개에서 6개 partition으로 늘렸다. user_id를 key로 쓰는 서비스에서 바로 생길 수 있는 일은?',
      o: ['일부 사용자의 새 이벤트가 다른 partition으로 가 순서가 꼬인다', '기존 메시지의 offset이 처음부터 다시 매겨진다', '모든 key가 원래 partition에 그대로 남는다'], a: 0,
      why: 'murmur2 % 3과 % 6은 결과가 다를 수 있다. u-102는 P2에서 P5로 옮겨 가 옛 이벤트와 새 이벤트가 두 줄에 나뉜다.' },
    { q: 'kafka-consumer-groups --describe에서 P0이 CURRENT 3, LOG-END 4로 나왔다. 이 숫자가 말하는 것은?',
      o: ['P0에 메시지가 3개뿐이다', 'offset 3번 메시지가 지워졌다', '아직 안 읽은 메시지가 1개 남았다'], a: 2,
      why: 'CURRENT는 다음에 읽을 위치, LOG-END는 다음에 쓰일 위치다. 차이 1이 LAG이고 offset 3의 u-106 paid가 아직 처리되지 않았다.' },
  ];

  R.page({ title: 'orders 토픽 내부', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
