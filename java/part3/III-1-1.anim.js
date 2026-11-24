/* III-1-1 String·StringBuilder — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 왼쪽 = 스택의 변수 칸, 오른쪽 = 힙의 객체. 변수에서 객체로 가는 화살표가 "참조"다.
 * 숫자는 페이지 코드(Immutable·LoopTrap·Builder·Methods)와 python 으로 다시 계산한 값만 쓴다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // beat k0 에서 a→b 초 사이에 0→1, 그 뒤 beat 에서는 1
  const ph = (c, k0, a, b) => (c.k > k0 ? 1 : c.k < k0 ? 0 : E(c.u, a, b));
  const pk = (c, k0, a) => (c.k > k0 ? 1 : c.k < k0 ? 0 : pop(c.u, a));

  // 변수 칸: 왼쪽 x, 가운데 y. 화살표가 나갈 점을 돌려준다
  function slot(x, y, name, o) { o = o || {}; const w = o.w || 170;
    card(x + w / 2, y, w, 42, { rx: 8, stroke: o.stroke || INK, sw: 2, s: o.s, op: o.op });
    if ((o.s ?? 1) > 0.3) { mono(x + 14, y + 5, name, { 'font-size': 15, 'font-weight': 700, fill: o.stroke || INK, opacity: o.op ?? 1 });
      el('circle', { cx: x + w - 16, cy: y, r: 5, fill: o.dot || ACC, opacity: o.op ?? 1 }); }
    return [x + w - 16, y]; }
  // 힙의 String 객체: 값(따옴표 포함), 주소. o.dead = 아무도 안 가리킴
  function sobj(cx, cy, val, addr, o) { o = o || {}; const w = Math.max(104, tw(val, 16) + 36), col = o.dead ? OFF : o.col || INK;
    card(cx, cy, w, 46, { rx: 8, stroke: col, sw: o.dead ? 1.6 : 2.2, fill: o.fill || PANEL, dash: o.dead ? '6 5' : null, s: o.s, op: o.op });
    if ((o.s ?? 1) > 0.3) { mono(cx, cy + 6, val, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: o.dead ? MUT : col, opacity: o.op ?? 1 });
      if (addr) mono(cx, cy - 31, addr, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: o.op ?? 1 }); }
    return { l: cx - w / 2, r: cx + w / 2, w }; }
  // 참조 화살표: 출발점 → 목표점(객체 왼쪽 가장자리). to 가 [a, b, f] 면 a 에서 b 로 f 만큼 옮겨 간 끝
  function ref(from, to, u, col) { grow(from[0] + 6, from[1], to[0] - 4, to[1], u, col || ACC, { sw: 2.4 }); }
  const mid = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];

  // ---------- 1. 불변 ----------
  const S1 = { hi: [430, 112], hi2: [640, 112], ban: [430, 282], bon: [640, 282] };
  function s1(t, c) { const { k, u } = c;
    zone(30, 36, 210, 350, '스택 · 변수'); zone(262, 36, 476, 350, '힙 · 객체');
    const sp = slot(50, 112, 'String s'), tp = slot(50, 178, 'String t', { s: pk(c, 0, 1.1) });
    // "Hi" @0x01
    const hiOld = k >= 4 ? false : false;
    const a = sobj(S1.hi[0], S1.hi[1], '"Hi"', '@0x01', { s: pk(c, 0, 0.2), col: INK });
    if (k >= 1) lock(a.r - 2, S1.hi[1] - 22, true, k >= 2 ? GOOD : MUT, k === 2 ? pop(u, 1.6) : k > 2 ? 1 : 0.0001);
    // "Hi!" @0x02 — 새 객체를 만들고 s 만 옮긴다
    let b = null;
    if (k >= 1) { b = sobj(S1.hi2[0], S1.hi2[1], '"Hi!"', '@0x02', { s: pk(c, 1, 0.9), col: ACC });
      if (k === 1) { ['H', 'i'].forEach((ch, i) => fly(S1.hi[0] - 14 + i * 16, S1.hi[1] + 42, S1.hi2[0] - 22 + i * 16, S1.hi2[1] + 42, seg(u, 0.2 + i * 0.15, 0.85 + i * 0.15), ch, { mono: true, fill: MUT }));
        fly(S1.hi2[0] + 40, S1.hi2[1] + 70, S1.hi2[0] + 18, S1.hi2[1] + 42, seg(u, 0.5, 1.0), '!', { mono: true });
        sub(S1.hi2[0], S1.hi2[1] + 70, '글자를 복사해 새로 만든다', fade(u, 0.3)); } }
    const toHi = [a.l, S1.hi[1]], toHi2 = b ? [b.l, S1.hi2[1]] : toHi;
    const sTo = k === 0 ? toHi : k === 1 ? mid([a.l, S1.hi[1] - 6], [toHi2[0], toHi2[1] - 6], E(u, 1.4, 2.2)) : [toHi2[0], toHi2[1] - 6];
    ref(sp, k === 0 ? [toHi[0], toHi[1] - 6] : sTo, k === 0 ? E(u, 0.5, 1.1) : 1, ACC);
    ref(tp, [toHi[0], toHi[1] + 8], k === 0 ? E(u, 1.3, 1.9) : 1, INFO);
    if (k === 0) sub(S1.hi[0], S1.hi[1] + 46, 's 와 t 가 같은 주소 @0x01', fade(u, 2.0), { fill: INK, 'font-weight': 700 });
    if (k === 1) sub(S1.hi[0], S1.hi[1] + 70, 't 는 여전히 @0x01', fade(u, 2.2), { fill: INFO, 'font-weight': 700 });
    // 출력 창
    const out = [];
    if (k >= 2) out.push('> println(s)', 'Hi!', '> println(t)', 'Hi');
    if (k >= 3) out.push('> println(u)', 'banana');
    if (k >= 4) out.push('> println(u)', 'bonono');
    const shown = k === 2 ? lerp(0, 4, E(u, 0.2, 1.4)) : k === 3 ? 4 + lerp(0, 2, E(u, 1.6, 2.3)) : k === 4 ? 6 + lerp(0, 2, E(u, 1.6, 2.3)) : 0;
    if (k >= 2) terminal(752, 36, 190, 214, out, shown, { title: '출력', fs: 14 });
    // 불변이 주는 이득 (페이지 데이터 why.rows)
    const why = (c.beat.immutable && c.beat.why && c.beat.why.rows) || [];
    why.forEach((r, i) => { const s = c.prev && c.prev.why && c.prev.why.rows.length > i ? 1 : pop(u, 2.0);
      pill(847, 282 + i * 38, r.k, GOOD, s, { fs: 14 }); });
    if (why.length) sub(847, 268, '불변이 주는 이득', 1, { 'font-weight': 700 });
    // banana / bonono
    if (k >= 3) { const up = slot(50, 282, 'String u', { s: pk(c, 3, 0.2) });
      const ba = sobj(S1.ban[0], S1.ban[1], '"banana"', null, { s: pk(c, 3, 0.3), dead: k >= 4 && E(u, 1.3, 1.6) > 0.5 });
      const bo = sobj(S1.bon[0], S1.bon[1], '"bonono"', null, { s: pk(c, 3, 0.9), dead: k === 3 && u > 1.6, col: ACC });
      if (k === 3) { pill(S1.bon[0], S1.bon[1] + 50, '받는 변수 없음 → 버려짐', MUT, pop(u, 1.7), { fs: 13.5 });
        pill(S1.ban[0] + 4, S1.ban[1] - 48, 'u.replace("a", "o")', ACC, pop(u, 0.5), { mono: true, fs: 13.5 }); }
      const uTo = k === 3 ? [ba.l, S1.ban[1]] : mid([ba.l, S1.ban[1]], [bo.l, S1.bon[1]], E(u, 0.4, 1.2));
      ref(up, uTo, k === 3 ? E(u, 0.3, 0.8) : 1, ACC);
      if (k === 4) { pill(S1.bon[0], S1.bon[1] - 48, 'u = u.replace("a", "o")', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
        pill(S1.ban[0], S1.ban[1] + 50, 'GC 대상', MUT, pop(u, 1.5), { fs: 13.5 }); } }
  }

  // ---------- 2. 루프 += ----------
  const LOOP = ['0,', '0,1,', '0,1,2,', '0,1,2,3,', '0,1,2,3,4,', '0,1,2,3,4,5,', '0,1,2,3,4,5,6,', '0,1,2,3,4,5,6,7,'];
  const NSHOW = [0, 4, 6, 8, 8];
  function s2(t, c) { const { k, u } = c;
    if (k === 4) { // n = 100,000 일 때 복사한 글자 수 (python 으로 같은 루프를 세어 본 값)
      tx(480, 54, 'n = 100,000 번 결합할 때 복사하는 글자 수', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
      const rows = [['String +=', 28939799495, '28,939,799,495자', BAD], ['StringBuilder', 1767547, '1,767,547자', GOOD]];
      rows.forEach(([n, v, s, col], i) => { const y = 120 + i * 92, f = E(u, 0.3 + i * 0.5, 1.3 + i * 0.5), len = 560 * Math.log10(v) / 11;
        lbl(150, y + 14, n, 1, { 'text-anchor': 'end', fill: col, class: 'mono' });
        el('rect', { x: 180, y, width: 600, height: 26, rx: 5, fill: SOFT });
        el('rect', { x: 180, y, width: Math.max(3, len * f), height: 26, rx: 5, fill: col, opacity: 0.85 });
        mono(180 + len * f + 10, y + 19, s, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.5) }); });
      sub(480, 292, '막대는 로그 눈금 · 같은 루프를 python 으로 세어 본 값', fade(u, 1.8));
      sub(480, 318, 'StringBuilder = 쓰기 588,890 + 확장 15회 복사 589,767 + toString 588,890', fade(u, 2.0));
      banner(480, 368, '약 16,000배 차이 · 체감 시간은 수 초 대 수 ms (예시)', pop(u, 2.2)); return; }
    zone(30, 36, 190, 310, '스택'); zone(242, 36, 400, 310, '힙 · result 가 만든 String');
    const rp = slot(44, 112, 'result', { w: 160 });
    const n = NSHOW[k], n0 = k > 0 ? NSHOW[k - 1] : 0;
    // 지금 보이는 개수(소수: 마지막 것이 막 생기는 중)
    const live = k === 0 ? 0 : n0 + (n - n0) * E(u, 0.2, 0.2 + 0.5 * (n - n0));
    const cur = Math.floor(live + 1e-6);   // 0 = 빈 문자열이 현재
    const ys = (i) => 82 + i * 29.5;
    // 행 0 = 빈 문자열, 행 i+1 = i 번째 반복이 만든 String
    const rows = [''].concat(LOOP);
    for (let i = 0; i <= n; i++) { const s = i === 0 ? (k === 0 ? pop(u, 0.2) : 1) : clamp(live - (i - 1)); if (s <= 0) break;
      const v = i === 0 ? '""' : rows[i], w = tw(v, 14.5) + 24, x = 300, y = ys(i) - 12, isCur = i === cur;
      el('rect', { x, y, width: w * clamp(s * 1.4), height: 25, rx: 6, fill: isCur ? ACCBG : PANEL, stroke: isCur ? ACC : OFF, 'stroke-width': isCur ? 2.2 : 1.5, 'stroke-dasharray': isCur ? null : '5 4' });
      if (s > 0.6) mono(x + 12, y + 18, v, { 'font-size': 14.5, 'font-weight': 700, fill: isCur ? ACC : MUT }); }
    // result 화살표: 가장 최근 객체로
    ref(rp, [300, ys(cur)], k === 0 ? E(u, 0.6, 1.1) : 1, ACC);
    if (k === 0) sub(470, 150, '아직 객체 하나 · 복사 0자', fade(u, 1.2), { fill: INK, 'font-weight': 700 });
    // 오른쪽: 반복마다 복사한 글자 수 막대 (2, 4, 6 … 16)
    if (k >= 1) { const ax = { x: 680, y: 70, w: 250, h: 230 };
      tx(ax.x, 56, '반복마다 복사한 글자 수', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      el('line', { x1: ax.x, y1: ax.y + ax.h, x2: ax.x + ax.w, y2: ax.y + ax.h, stroke: MUT, 'stroke-width': 1.8 });
      for (let i = 0; i < Math.min(n, Math.ceil(live)); i++) { const v = LOOP[i].length, s = clamp(live - i), bw = 24, bx = ax.x + 6 + i * 30, bh = v / 16 * ax.h * s;
        el('rect', { x: bx, y: ax.y + ax.h - bh, width: bw, height: bh, rx: 3, fill: BAD, opacity: 0.75 });
        if (s > 0.8) mono(bx + bw / 2, ax.y + ax.h - bh - 6, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
        mono(bx + bw / 2, ax.y + ax.h + 18, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
      tx(ax.x + ax.w, ax.y + ax.h + 40, 'i', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
      if (k === 3) { const f = E(u, 0.9, 1.8);
        el('polyline', { points: `${ax.x + 6},${ax.y + ax.h} ${ax.x + 6 + 8 * 30 * f},${ax.y + ax.h} ${ax.x + 6 + 8 * 30 * f},${ax.y + ax.h - ax.h * f}`, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: f > 0 ? 1 : 0 });
        lbl(ax.x, ax.y + ax.h + 44, '1+2+…+n ≈ n²/2', fade(u, 1.6), { 'text-anchor': 'start' }); } }
    // 계기판: 만든 객체 · 버린 객체 · 누적 복사
    const made = Math.floor(live + 1e-6), copied = LOOP.slice(0, made).reduce((a, s) => a + s.length, 0);
    if (k >= 1) R.meters(250, 356, 390, [
      { name: '버린 객체', val: String(made), hot: made >= 8 },
      { name: '누적 복사', val: copied + '자', hot: made >= 8 },
    ], { h: 56 });
  }

  // ---------- 3. StringBuilder 버퍼 ----------
  function bufCells(x, y, cap, buf, o) { o = o || {}; const w = o.w || 40, gap = 4;
    for (let i = 0; i < cap; i++) { const v = buf[i] || '', on = !!v, s = o.fill ? clamp(o.fill * cap - i) : 1;
      if (s <= 0) continue;
      card(x + i * (w + gap) + w / 2, y + 21, w, 42, { rx: 5, stroke: o.dead ? OFF : on ? ACC : GRID, sw: on ? 2 : 1.5, fill: on && !o.dead ? ACCBG : PANEL, s, dash: o.dead ? '5 4' : null });
      if (on && (!o.hide || !o.hide(i))) mono(x + i * (w + gap) + w / 2, y + 27, v, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: o.dead ? MUT : ACC });
      if (o.index) mono(x + i * (w + gap) + w / 2, y + 60, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); }
    return (i) => x + i * (w + gap) + w / 2; }
  function s3(t, c) { const { k, u } = c;
    const st = c.beat.builder.steps, cur = st[st.length - 1], pst = c.prev ? c.prev.builder.steps[c.prev.builder.steps.length - 1] : { len: 0, cap: cur.cap };
    zone(30, 36, 190, 120, '스택'); const sp = slot(44, 96, 'sb', { w: 160 });
    // 객체 머리
    card(470, 74, 300, 52, { rx: 10, stroke: INK, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    lbl(400, 80, 'StringBuilder', 1, { 'font-size': 16 });
    const len = tween(pst.len, cur.len, u, 1.4), cap = k === 4 ? Math.round(lerp(8, 18, E(u, 1.0, 1.6))) : cur.cap;
    mono(520, 70, 'count  = ' + Math.round(len), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 });
    mono(520, 92, 'capacity = ' + cap, { 'font-size': 14.5, fill: k === 4 && u > 1.0 ? WARN : MUT, 'font-weight': 700 });
    ref(sp, [320, 74], k === 0 ? E(u, 0.5, 1.0) : 1, ACC);
    tx(70, 196, '내부 배열 value[]', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    if (k < 4) { const old = k > 0 ? c.prev.builder.steps[c.prev.builder.steps.length - 1].buf : [];
      const X = bufCells(70, 210, 8, cur.buf, { fill: k === 0 ? E(u, 0.6, 1.8) : null, index: true, hide: (i) => !old[i] && u < 1.0 + (i - pst.len) * 0.18 });
      // 새 글자가 날아와 빈칸에 들어간다
      if (k >= 1) { const op = st[st.length - 1].op, from = pst.len, to = cur.len;
        pill(560, 150, k === 3 ? '.append("ef").append("gh")' : 'sb.' + op, ACC, pop(u, 0.1), { mono: true, fs: 14 });
        for (let i = from; i < to; i++) fly(560, 160, X(i), 231, seg(u, 0.3 + (i - from) * 0.18, 1.0 + (i - from) * 0.18), cur.buf[i], { mono: true }); }
      if (k === 1 || k === 2) sub(560, 196, '새 객체 없이 빈칸에 이어 쓴다', fade(u, 1.3), { fill: INK, 'font-weight': 700 });
      if (k === 2) { // 마지막에 한 번 toString → 새 String
        const f = E(u, 1.6, 2.3); dot([[160, 254], [160, 330], [300, 330]], seg(u, 1.4, 2.2), INK, 6);
        sobj(390, 336, '"abcd"', 'toString() · 한 번만', { s: pop(u, 2.0), col: INK }); }
      if (k === 3) { // append 는 this 를 돌려준다: 화살표가 같은 객체로 되돌아온다
        el('path', { d: 'M 720 150 C 800 150 800 74 624 74', fill: 'none', stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': `${600 * E(u, 1.2, 2.0)} 600`, 'marker-end': u > 2.0 ? 'url(#ra-ahb)' : null });
        pill(810, 110, 'this 반환', ACC, pop(u, 1.9), { fs: 14 });
        pill(430, 330, 'count 8 = capacity 8 · 가득', WARN, pop(u, 2.2), { fs: 14 }); }
      return; }
    // k = 4: 넘친다 → max(10, 8×2+2) = 18 칸 새 배열에 복사
    const oldBuf = c.prev.builder.steps[c.prev.builder.steps.length - 1].buf;
    bufCells(70, 210, 8, oldBuf, { dead: u > 2.0 });
    pill(560, 150, 'sb.append("ij")  → 10칸 필요', WARN, pop(u, 0.1), { mono: true, fs: 14 });
    tx(70, 300, '새 배열 · 18칸', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
    const X2 = bufCells(70, 312, 18, cur.buf.concat(Array(18 - cur.buf.length).fill('')), { w: 44, fill: E(u, 0.8, 1.3), hide: (i) => (i < 8 ? u < 1.3 + i * 0.06 : u < 2.0 + (i - 8) * 0.15) });
    for (let i = 0; i < 8; i++) dot([[92 + i * 44, 252], [X2(i), 312]], seg(u, 1.0 + i * 0.06, 1.4 + i * 0.06), ACC, 5);
    banner(640, 268, '새 용량 = max(10, 8 × 2 + 2) = 18', pop(u, 1.7));
  }

  // ---------- 4. Builder vs Buffer, + 의 진실 ----------
  function lane(x0, y, x1, n, t, col, o) { o = o || {}; el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: o.op ?? 1 });
    if (o.dots !== false) for (let i = 0; i < n; i++) { const f = (t * (o.speed || 0.6) + i / n) % 1; if (o.gate && f > o.gate[0] && f < o.gate[1]) continue;
      el('circle', { cx: lerp(x0, x1, f), cy: y, r: 5, fill: col, opacity: o.op ?? 1 }); } }
  function s4(t, c) { const { k, u } = c;
    // 위: 두 갈래 — 왼쪽 StringBuilder(락 없음), 오른쪽 StringBuffer(synchronized)
    const topOp = k >= 2 ? 0.45 : 1;
    pill(90, 92, '스레드 T1', INK, k === 0 ? pop(u, 0.2) : 1, { fs: 14, op: topOp });
    lane(150, 92, 330, 5, t, ACC, { op: topOp * (k === 0 ? fade(u, 0.5) : 1), speed: 0.9 });
    card(400, 92, 130, 48, { rx: 8, stroke: GOOD, sw: 2.2, text: 'StringBuilder', fs: 15, fw: 700, color: GOOD, s: k === 0 ? pop(u, 0.3) : 1, op: topOp });
    sub(400, 140, '락 없음 · 바로 append', topOp * (k === 0 ? fade(u, 1.0) : 1), { fill: GOOD, 'font-weight': 700 });
    if (k >= 1) { const a = k === 1 ? fade(u, 0.2) : topOp, open = Math.floor(t * 1.6) % 2;
      pill(560, 64, '스레드 T1', INK, k === 1 ? pop(u, 0.2) : 1, { fs: 14, op: a }); pill(560, 122, '스레드 T2', INK, k === 1 ? pop(u, 0.4) : 1, { fs: 14, op: a });
      el('line', { x1: 616, y1: 64, x2: 720, y2: 88, stroke: GRID, 'stroke-width': 3, opacity: a }); el('line', { x1: 616, y1: 122, x2: 720, y2: 96, stroke: GRID, 'stroke-width': 3, opacity: a });
      // 한 번에 한 스레드만 들어간다
      [0, 1].forEach((i) => { const f = ((t * 0.7) % 1), y0 = i === 0 ? 64 : 122, go = i === open;
        const fx = go ? lerp(616, 720, f) : lerp(616, 690, Math.min(f, 0.75)); el('circle', { cx: fx, cy: lerp(y0, i === 0 ? 88 : 96, (fx - 616) / 104), r: 5, fill: go ? ACC : WARN, opacity: a }); });
      lock(738, 92, true, WARN, (k === 1 ? pop(u, 0.6) : 1));
      card(840, 92, 128, 48, { rx: 8, stroke: WARN, sw: 2.2, text: 'StringBuffer', fs: 15, fw: 700, color: WARN, s: k === 1 ? pop(u, 0.5) : 1, op: a });
      sub(800, 140, '메서드마다 synchronized · 한 번에 하나', a * (k === 1 ? fade(u, 1.2) : 1), { fill: WARN, 'font-weight': 700 }); }
    if (k < 2) { if (k === 1) tx(480, 260, '공유가 없으면 이 기다림은 비용일 뿐이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.8) }); return; }
    // 아래: "a" + b + "c" 한 문장
    el('line', { x1: 40, y1: 178, x2: 920, y2: 178, stroke: GRID, 'stroke-width': 1.5 });
    if (k === 2 || k === 3) { R.snippet(60, 196, ['int b = 7;', 'String line = "a" + b + "c";'], { op: k === 2 ? fade(u, 0.2) : 1 });
      if (k === 2) { ['"a"', '7', '"c"'].forEach((s, i) => fly(150 + i * 70, 280, 560, 236, seg(u, 0.6 + i * 0.25, 1.3 + i * 0.25), s, { mono: true }));
        sobj(620, 236, '"a7c"', '결과 String 하나', { s: pop(u, 1.8), col: GOOD });
        check(720, 236, 12, pop(u, 2.1)); sub(620, 300, '한 문장 결합 · 객체도 한 번', fade(u, 2.1), { fill: GOOD, 'font-weight': 700 }); }
      if (k === 3) { grow(330, 246, 400, 246, E(u, 0.2, 0.6), MUT);
        card(670, 226, 500, 40, { rx: 8, stroke: INFO, sw: 1.8, s: pop(u, 0.5) }); mono(430, 231, 'JDK 8까지: new StringBuilder()', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.6) });
        mono(430, 255, '  .append("a").append(b).append("c").toString()', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 0.7) });
        card(670, 300, 500, 46, { rx: 8, stroke: GOOD, sw: 1.8, s: pop(u, 1.2) }); mono(430, 296, 'JDK 9부터: invokedynamic', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.3) });
        mono(430, 316, '  StringConcatFactory 가 결합을 만든다', { 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.4) });
        tx(480, 380, '어느 쪽이든 컴파일러가 처리한다 · 손댈 것 없음', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) }); }
      return; }
    // k = 4: 루프 안 += 는 반복마다 결합을 새로 한다
    R.snippet(60, 196, ['String s = "";', 'for (int i = 0; i < n; i++) s += i;'], {});
    const n = Math.floor(lerp(0, 6, E(u, 0.3, 2.0)));
    for (let i = 0; i < 6; i++) { if (i >= n) break; const v = '0123456'.slice(0, i + 1), x = 470 + i * 78, cur = i === n - 1;
      card(x, 300 - i * 0, 70, 34, { rx: 6, stroke: cur ? BAD : OFF, sw: cur ? 2.2 : 1.5, dash: cur ? null : '5 4', text: v, fs: 14, mono: true, color: cur ? BAD : MUT, s: pop(u, 0.3 + i * 0.28) });
      if (!cur) cross(x + 26, 286, 6, 1); }
    tx(470 - 35, 250, '반복마다 새 String · 앞의 것은 버린다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) });
    banner(480, 372, '최적화는 문장 안에서만 · 루프 += 는 O(n²)', pop(u, 2.2));
  }

  // ---------- 5. 메서드와 문자열 풀 ----------
  function chars(x, y, s, o) { o = o || {}; const w = o.w || 50, gap = 0;
    [...s].forEach((ch, i) => { const st = (o.style && o.style(i, ch)) || {};
      card(x + i * w + w / 2, y + 24, w - 4, 46, { rx: 5, stroke: st.stroke || INK, sw: st.sw || 2, fill: st.fill || PANEL, s: st.s, op: st.op, dash: st.dash });
      if ((st.s ?? 1) > 0.3) mono(x + i * w + w / 2, y + 30, ch === ' ' ? '␣' : ch, { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: st.color || INK, opacity: st.op ?? 1 }); });
    return (i) => x + i * w; }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { tx(70, 58, 'String s = "abcde";', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      const X = chars(70, 90, 'abcde', { w: 64, style: (i) => k === 0 && (i === 1 || i === 2) && u > 1.0 ? { stroke: ACC, fill: ACCBG, color: ACC } : k === 1 && i === Math.min(2, Math.floor(lerp(0, 3, E(u, 0.2, 1.0)))) && u < 1.3 ? { stroke: INFO } : {} });
      for (let i = 0; i <= 5; i++) { el('line', { x1: X(i), y1: 84, x2: X(i), y2: 146, stroke: MUT, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }); mono(X(i), 168, String(i), { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 }); }
      if (k === 0) { const f = E(u, 0.3, 1.0); el('path', { d: `M ${X(1)} 186 V 198 H ${lerp(X(1), X(3), f)}`, fill: 'none', stroke: ACC, 'stroke-width': 3 });
        if (f > 0.98) el('line', { x1: X(3), y1: 186, x2: X(3), y2: 198, stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '4 3' });
        mono(X(1), 222, 'begin 1 포함', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
        mono(X(3) + 6, 222, 'end 3 제외', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
        R.snippet(470, 80, ['s.substring(1, 3)'], { op: fade(u, 0.2) }); mono(500, 160, '=> "bc"', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
        sub(600, 196, '구간 [1, 3) · 길이 = 3 − 1 = 2', fade(u, 2.0), { 'text-anchor': 'start' }); }
      if (k === 1) { // 찾기: 앞에서부터 한 칸씩
        const p = lerp(0, 2, E(u, 0.2, 1.0)); el('path', { d: `M ${X(p) + 32 - 9} 74 l 9 12 l 9 -12 z`, fill: INFO });
        R.snippet(470, 80, ['s.indexOf("c")', 's.indexOf("z")'], {});
        mono(700, 108, '=> 2', { 'font-size': 18, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.1) });
        const q = lerp(0, 5, E(u, 1.4, 2.3)); if (u > 1.4) el('path', { d: `M ${X(q) + 32 - 9} 198 l 9 -12 l 9 12 z`, fill: BAD });
        mono(700, 132, '=> -1', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.3) });
        sub(310, 232, '"z" 는 끝까지 없다 · 0 이 아니라 -1', fade(u, 2.3), { fill: BAD, 'font-weight': 700 }); }
      return; }
    if (k === 2) { tx(70, 58, '"a.b.c".split(정규식)', { 'font-size': 16, 'font-weight': 700, class: 'mono' });
      [['split(".")', true, 90], ['split("\\\\.")', false, 240]].forEach(([call, any, y], r) => { const a = r === 0 ? 0.2 : 1.4;
        const X = chars(70, y, 'a.b.c', { w: 56 }); mono(70, y - 10, call, { 'font-size': 14.5, 'font-weight': 700, fill: r ? GOOD : BAD, opacity: fade(u, a) });
        for (let i = 0; i < 5; i++) { const cut = any || i % 2 === 1; if (!cut) continue; const f = E(u, a + 0.1 + i * 0.1, a + 0.4 + i * 0.1);
          el('line', { x1: X(i) + 28, y1: y - 4, x2: X(i) + 28, y2: y - 4 + 58 * f, stroke: r ? GOOD : BAD, 'stroke-width': 3.5, opacity: 0.85 }); }
        if (r === 0) { mono(400, y + 30, '"." = 아무 글자 → 다섯 글자 모두 구분자', { 'font-size': 14, fill: BAD, opacity: fade(u, 0.9) });
          mono(400, y + 56, '=> 남는 조각 없음, 길이 0 배열', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) }); }
        else { ['a', 'b', 'c'].forEach((s, i) => pill(440 + i * 60, y + 26, s, GOOD, pop(u, 2.0 + i * 0.15), { mono: true, fs: 15 }));
          mono(640, y + 32, '=> [a, b, c]', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.4) }); } });
      return; }
    if (k === 3) { const rows = [['String.join("-", "a", "b", "c")', '"a-b-c"'], ['String.format("%d원", 500)', '"500원"'], ['"  hi  ".strip()', '"hi"']];
      rows.forEach(([call, out], i) => { const y = 80 + i * 110, a = 0.2 + i * 0.6;
        mono(60, y, call, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, a) });
        if (i === 0) { ['a', 'b', 'c'].forEach((s, j) => fly(80 + j * 70, y + 40, 480 + j * 70, y + 34, seg(u, a + 0.1, a + 0.6), s, { mono: true, stay: true })); [0, 1].forEach((j) => fly(80 + j * 70 + 35, y + 60, 515 + j * 70, y + 34, seg(u, a + 0.3, a + 0.7), '-', { mono: true, stay: true, fill: WARN })); }
        if (i === 1) { fly(150, y + 40, 520, y + 34, seg(u, a + 0.1, a + 0.6), '500', { mono: true, stay: true }); }
        if (i === 2) { const X = chars(60, y + 14, '  hi  ', { w: 40, style: (j) => (j < 2 || j > 3) ? { stroke: OFF, color: MUT, s: 1 - E(u, a + 0.5, a + 0.9) } : {} }); }
        mono(760, y + 40, '=> ' + out, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, a + 0.6) }); });
      return; }
    // k = 4, 5: 문자열 풀과 ==
    zone(30, 36, 200, 350, '스택'); zone(252, 36, 690, 350, '힙');
    zone(282, 76, 300, 150, '문자열 풀 (리터럴)', { fill: INFOBG, color: INFO });
    const xp = slot(46, 110, 'x', { w: 168 }), yp = slot(46, 176, 'y', { w: 168 });
    const pool = sobj(430, 156, '"hi"', null, { col: INFO, s: k === 4 ? pop(u, 0.2) : 1 });
    ref(xp, [pool.l, 150], k === 4 ? E(u, 0.5, 1.0) : 1, ACC); ref(yp, [pool.l, 164], k === 4 ? E(u, 0.9, 1.4) : 1, INFO);
    if (k === 4) { pill(780, 150, 'x == y  →  true', GOOD, pop(u, 1.7), { mono: true, fs: 16 });
      sub(780, 190, '같은 객체를 가리켜서', fade(u, 2.0), { fill: GOOD, 'font-weight': 700 }); return; }
    const zp = slot(46, 290, 'z', { w: 168, s: pop(u, 0.2) });
    const zo = sobj(460, 300, '"hi"', 'new String("hi")', { col: WARN, s: pop(u, 0.4) });
    ref(zp, [zo.l, 300], E(u, 0.6, 1.1), BAD);
    pill(790, 110, 'x == y  →  true', GOOD, 1, { mono: true, fs: 15 });
    pill(790, 190, 'x == z  →  false', BAD, pop(u, 1.3), { mono: true, fs: 15 });
    pill(790, 270, 'x.equals(z)  →  true', GOOD, pop(u, 1.9), { mono: true, fs: 15 });
    sub(790, 312, '==는 주소, equals는 글자', fade(u, 2.2), { fill: INK, 'font-weight': 700 });
    if (u > 1.9) { dot([[430, 178], [460, 278]], seg(u, 1.9, 2.4), GOOD, 5); }
  }

  // ---------- 6. 선택 기준 ----------
  function s6(t, c) { const { k, u } = c;
    const Q1 = [250, 70], Q2 = [250, 210], L1 = [520, 70], L2 = [520, 210], L3 = [250, 340];
    const dia = (p, s, op) => { const g = R.G(p[0], p[1], 1, op); el('path', { d: 'M 0 -34 L 150 0 L 0 34 L -150 0 Z', fill: PANEL, stroke: INK, 'stroke-width': 2 }, g); tx(0, 5, s, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }, g); };
    if (k >= 3) return fails6(c);
    const opT = 1;
    dia(Q1, '결합이 반복되나?', opT);
    grow(400, 70, 440, 70, k === 0 ? E(u, 0.6, 1.0) : 1, k === 0 ? ACC : MUT); sub(420, 60, '아니오', opT);
    card(L1[0], L1[1], 150, 50, { rx: 25, stroke: GOOD, sw: 2.2, text: 'String +', fs: 16, fw: 800, color: GOOD, s: pk(c, 0, 0.9), op: opT });
    if (k >= 1) { grow(250, 104, 250, 172, k === 1 ? E(u, 0.5, 0.9) : 1, k === 1 ? ACC : MUT); sub(268, 144, '예', opT, { 'text-anchor': 'start' });
      dia(Q2, '여러 스레드가 같은 버퍼에?', opT * (k === 1 ? fade(u, 0.8) : 1));
      grow(400, 210, 440, 210, k === 1 ? E(u, 1.2, 1.6) : 1, k === 1 ? ACC : MUT); sub(420, 200, '아니오', opT);
      card(L2[0], L2[1], 170, 50, { rx: 25, stroke: GOOD, sw: 2.2, text: 'StringBuilder', fs: 16, fw: 800, color: GOOD, s: pk(c, 1, 1.5), op: opT }); }
    if (k >= 2) { grow(250, 244, 250, 312, k === 2 ? E(u, 0.4, 0.8) : 1, k === 2 ? ACC : MUT); sub(268, 284, '예 (드물다)', opT, { 'text-anchor': 'start' });
      card(L3[0], L3[1], 160, 50, { rx: 25, stroke: WARN, sw: 2.2, text: 'StringBuffer', fs: 16, fw: 800, color: WARN, s: pk(c, 2, 0.8), op: opT }); }
    // 지금 고르는 예
    const ex = [['"id=" + id + ", name=" + name', L1], ['for (Order o : orders) sb.append(…)', L2], ['여러 스레드 → 한 버퍼', L3]];
    if (k <= 2) { const [s, L] = ex[k]; pill(760, 70 + k * 135, s, ACC, pop(u, 0.2), { mono: k < 2, fs: 13.5 });
      const route = k === 0 ? [[760, 96], [760, 120], [L1[0] + 80, 120], [L1[0] + 80, 90]] : k === 1 ? [[760, 231], [760, 250], [L2[0] + 90, 250], [L2[0] + 90, 232]] : [[760, 366], [760, 380], [L3[0] + 90, 380], [L3[0] + 90, 360]];
      dot(route, seg(u, 1.6, 2.5), ACC, 6); return; }
  }
  // 6의 k = 3, 4: 실패 사례 → 고친 모양
  function fails6(c) { const { k, u } = c;
    tx(480, 44, '자주 나는 실패와 고친 모양', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800 });
    const fails = [['for (…) s += x', 'sb.append(x)', '느리다'], ['값 2개에 StringBuilder', '"a" + b', '읽기 어렵다'], ['split(".")', 'split("\\\\.")', '정규식'], ['if (a == b)', 'if (a.equals(b))', '주소 비교']];
    fails.forEach(([bad, fix, why], i) => { if (i >= (k === 3 ? 2 : 4)) return; const y = 74 + i * 72, a = (k === 3 ? i : i - 2) * 0.5 + 0.3, old = k === 4 && i < 2, s = old ? 1 : pop(u, a);
      card(330, y + 20, 300, 44, { rx: 8, stroke: BAD, sw: 1.8, fill: BADBG, s }); cross(204, y + 20, 7, s);
      mono(224, y + 25, bad, { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: s > 0.5 ? 1 : 0 });
      grow(492, y + 20, 548, y + 20, old ? 1 : E(u, a + 0.4, a + 0.7), GOOD);
      pill(660, y + 20, fix, GOOD, old ? 1 : pop(u, a + 0.6), { mono: true, fs: 14.5 });
      sub(820, y + 25, why, old ? 1 : fade(u, a + 0.8), { 'text-anchor': 'start', 'font-weight': 700 }); });
    if (k === 4) banner(480, 384, '루프가 보이면 StringBuilder, 아니면 +', pop(u, 1.8));
  }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'String s = "Hi"; String t = s; s = s + "!"; 를 실행한 뒤 t가 가리키는 것은 무엇인가?',
      o: ['새로 만든 "Hi!" 객체', '처음 만든 "Hi" 객체(@0x01)', 'null'], a: 1,
      why: '+ 는 원본을 고치지 않고 "Hi!"라는 새 객체를 만들어 s만 옮긴다. t는 그대로 @0x01의 "Hi"를 가리킨다.' },
    { q: '루프에서 result += i + "," 를 8번 돌렸을 때 누적 복사량이 커지는 이유는 무엇인가?',
      o: ['반복마다 지금까지의 문자열 전체를 새 객체에 다시 복사해서', '컴파일러가 루프를 8번 더 펼쳐서', 'GC가 복사를 대신 해서'], a: 0,
      why: '반복 i에서 복사하는 길이가 2, 4, 6…16자로 늘어 합이 72자가 된다. 1+2+…+n ≈ n²/2라서 O(n²)이다.' },
    { q: '용량 8칸이 가득 찬 StringBuilder에 2글자를 append하면 새 용량은 얼마인가?',
      o: ['16', '10', '18'], a: 2,
      why: '새 용량은 max(필요한 길이 10, 8×2+2)이다. 그래서 18칸 배열을 새로 만들고 기존 8칸을 복사한다.' },
    { q: '컴파일러가 알아서 처리해 주지 못하는 결합은 무엇인가?',
      o: ['String line = "a" + b + "c";', 'for 루프 안의 s += i', 'String.join("-", "a", "b")'], a: 1,
      why: '컴파일러의 결합 처리는 문장 하나 안에서만 일어난다. 루프 안 += 는 반복마다 결합을 새로 해 새 String을 만든다.' },
    { q: 'String x = "hi"; String z = new String("hi"); 일 때 x == z의 결과는 무엇인가?',
      o: ['false', 'true', '컴파일 에러'], a: 0,
      why: '리터럴 x는 문자열 풀의 객체, z는 new로 만든 별도 객체다. ==는 주소를 비교하므로 false, 글자 비교는 equals로 해야 true다.' },
    { q: '주문 목록을 for 문으로 돌며 CSV 한 줄씩 쌓을 때 알맞은 것은 무엇인가?',
      o: ['String +=', 'StringBuffer', 'StringBuilder'], a: 2,
      why: '반복해서 쌓는 조립이고 한 스레드 안에서 끝난다. 버퍼 하나에 append하고 마지막에 toString하는 StringBuilder가 맞다.' },
  ];

  const summary = [
    'String은 바뀌지 않는다. +나 replace는 새 객체를 만들고 변수만 옮긴다.',
    '루프 안 +=는 매번 전체를 복사해서 비용이 n²에 비례하고 버린 객체도 쌓인다.',
    'StringBuilder는 배열 하나에 이어 쓰고, 넘치면 2배+2칸으로 한 번에 늘린다.',
    '한 문장 결합은 +로 두고, 문자열 내용 비교는 ==가 아니라 equals로 한다.',
  ];
  const review = [
    { q: '10만 줄 로그를 for 문에서 log += line + "\\n" 으로 모았더니 몇 초씩 멈춘다. 먼저 바꿀 것은?',
      o: ['StringBuffer로 바꿔 동기화한다', 'StringBuilder 하나에 append하고 끝에서 toString한다', 'JVM 힙을 늘린다'], a: 1,
      why: '느린 원인은 반복마다 전체를 다시 복사하는 O(n²)이다. 단일 스레드 조립이라 락 없는 StringBuilder로 바꾸면 복사가 길이에 비례한다.' },
    { q: 'name.replace(" ", ""); 를 호출했는데 출력에 공백이 그대로 남았다. 원인은?',
      o: ['replace의 반환값을 받지 않아 결과가 버려졌다', 'replace는 정규식이라 공백을 못 찾는다', '문자열 풀이 원본을 되돌렸다'], a: 0,
      why: 'String은 불변이라 replace는 새 문자열을 돌려줄 뿐이다. name = name.replace(" ", "")처럼 다시 받아야 변수가 새 객체를 가리킨다.' },
    { q: '입력값 cmd와 "quit"을 cmd == "quit"으로 비교했더니 콘솔에서 quit을 쳐도 끝나지 않는다. 고칠 방법은?',
      o: ['cmd.strip() == "quit"으로 바꾼다', 'cmd를 StringBuilder로 바꾼다', '"quit".equals(cmd)로 비교한다'], a: 2,
      why: '입력으로 만든 문자열은 풀의 리터럴과 다른 객체라 ==가 false다. 글자 내용은 equals로 비교해야 한다.' },
  ];

  R.page({ title: '문자열 조립', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
