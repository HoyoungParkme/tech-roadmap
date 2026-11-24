/* II-2-2 캡슐화와 접근제어자 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 힙의 BankAccount 객체와 balance 칸, private 벽과 메서드 문, 검증 관문, 불변 Money 와 방어적 복사 리스트, 패키지 경계 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, lock, terminal, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function area(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || SOFT, stroke: o.stroke || 'none', 'stroke-width': 2, 'stroke-dasharray': o.dash, opacity: o.op ?? 1 });
    if (title) tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 700, fill: o.col || MUT, opacity: o.op ?? 1 }); }
  function chip(x, y, s, o) { o = o || {}; const fs = o.fs || 14, w = o.w || tw(s, fs) + 22, op = o.op ?? 1;
    el('rect', { x, y: y - 15, width: w, height: 30, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 11, y + 5, s, { 'font-size': fs, fill: o.col || INK, 'font-weight': o.fw || 600, opacity: op, 'text-decoration': o.strike ? 'line-through' : null });
    return { x, y, w, x1: x + w }; }
  function ref(x1, y1, x2, y2, u, o) { o = o || {}; if (u <= 0) return; const col = o.col || ACC;
    const mk = col === BAD ? 'url(#ra-ahr)' : col === ACC ? 'url(#ra-ahb)' : 'url(#ra-ah)';
    const mx = (x1 + x2) / 2 + (o.bx || 0), my = (y1 + y2) / 2 + (o.by || 0);
    el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 2.4, pathLength: 1,
      'stroke-dasharray': u >= 1 ? o.dash : `${clamp(u)} 1`, 'marker-end': u > 0.98 ? mk : null, opacity: o.op ?? 1 }); }
  function slot(x, y, name, val, o) { o = o || {}; const w = o.w || 60, op = o.op ?? 1;
    tx(x - 10, y + 5, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono', fill: o.col || INK, opacity: op });
    el('rect', { x, y: y - 16, width: w, height: 32, rx: 6, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: op });
    if (val === '•') el('circle', { cx: x + w / 2, cy: y, r: 5.5, fill: ACC, opacity: op });
    return { cx: x + w / 2, x1: x + w, y }; }
  // 잔액 칸: 이름표 + 큰 숫자
  function balance(x, y, w, label, v, o) { o = o || {}; const bad = typeof v === 'number' && v < 0;
    el('rect', { x, y, width: w, height: 52, rx: 8, fill: bad ? BADBG : o.fill || PANEL, stroke: bad ? BAD : o.stroke || INK, 'stroke-width': 2.4 });
    mono(x + 12, y + 32, label, { 'font-size': 15, 'font-weight': 700, fill: o.lcol || INK });
    mono(x + w - 12, y + 34, typeof v === 'number' ? String(Math.round(v)) : v, { 'font-size': 21, 'font-weight': 800, 'text-anchor': 'end', fill: bad ? BAD : o.vcol || ACC }); }
  // 불변식 배지
  function badge(cx, cy, ok, op) { card(cx, cy, 190, 34, { rx: 17, stroke: ok ? GOOD : BAD, sw: 2.2, fill: ok ? GOODBG : BADBG, text: '불변식: 잔액 ≥ 0', fs: 14.5, fw: 700, color: ok ? GOOD : BAD, op: op ?? 1 });
    if (!ok) cross(cx + 110, cy, 9); }

  // ---------- 1. public 필드는 무방비 ----------
  function s1(t, c) { const { k, u } = c, OX = 520, OY = 110, OW = 360;
    area(20, 20, 380, 280, 'class Demo (바깥 코드)', {});
    area(420, 20, 520, 280, 'Heap', { col: ACC });
    el('rect', { x: OX, y: OY, width: OW, height: 130, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: k === 0 ? fade(u, 0.2) : 1 });
    tx(OX + 14, OY + 26, 'BankAccount', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
    badge(OX + OW / 2, OY - 40, k < 3 || (k === 3 && u < 1.4), k === 0 ? fade(u, 1.0) : 1);
    if (k === 0) { sub(OX + OW / 2, OY + 80, '잔액을 어떻게 담을지 아직 정하지 않았다', fade(u, 0.6), { 'font-size': 14 });
      tx(200, 160, '지켜야 할 값: 잔액', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    let v = k >= 2 ? (k === 2 ? (u < 1.2 ? '0' : 50000) : 50000) : null;
    if (k === 3) v = u < 1.2 ? 50000 : -9999; if (k === 4) v = -9999;
    if (k >= 1) { const typ = k === 4 && u > 0.6 ? 'BigDecimal' : 'long';
      balance(OX + 20, OY + 52, OW - 40, 'public ' + typ + ' balance', v == null ? '' : v, { op: 1, lcol: k === 4 && u > 0.6 ? WARN : INK });
      // 벽이 없다: 위아래 열린 문
      if (k === 1) { tx(OX + OW / 2, OY + 160, '관문 없음 — 어디서든 직접 읽고 쓴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.8) }); } }
    if (k >= 2) { const a = slot(110, 80, 'acc', '•'); ref(a.cx, a.y, OX - 2, OY + 70, k === 2 ? seg(u, 0.2, 0.7) : 1, { by: -40 }); }
    const w1 = chip(40, 150, 'acc.balance = 50000;', { fs: 14.5, op: k >= 2 ? (k === 2 ? fade(u, 0.3) : 1) : 0, stroke: k === 4 && u > 1.0 ? BAD : GRID, col: k === 4 && u > 1.0 ? BAD : INK });
    if (k === 2) fly(260, 150, OX + OW - 80, OY + 78, seg(u, 0.6, 1.2), '50000', { mono: true });
    const w2 = chip(40, 200, 'acc.balance = -9999;', { fs: 14.5, op: k >= 3 ? (k === 3 ? fade(u, 0.3) : 1) : 0, stroke: k === 3 || (k === 4 && u > 1.0) ? BAD : GRID, col: BAD });
    if (k === 3) fly(260, 200, OX + OW - 80, OY + 78, seg(u, 0.6, 1.2), '-9999', { mono: true, fill: BAD });
    if (k === 4) { cross(w1.x1 + 16, 150, 8, pop(u, 1.1)); cross(w2.x1 + 16, 200, 8, pop(u, 1.3));
      tx(200, 258, '타입을 바꾸면 밖의 대입이 전부 컴파일 에러', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) }); }
    const lines = []; if (k >= 2) lines.push('50000'); if (k >= 3) lines.push('-9999');
    terminal(20, 315, 380, 95, lines, k === 2 ? seg(u, 1.4, 1.8) : k === 3 ? 1 + seg(u, 1.4, 1.8) : lines.length, { title: 'console' });
    if (k === 3) tx(680, 350, '잔액 ≥ 0이 그 자리에서 깨진다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
    if (k === 2) tx(680, 350, '여기까지는 문제없어 보인다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    if (k === 4) tx(680, 350, '내부 구현이 바깥에 그대로 묶였다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 2.0) }); }

  // ---------- 2. private 벽과 메서드 문 ----------
  const DOORS = [['getBalance()', 'out', '읽기'], ['deposit(long)', 'in', '입금'], ['withdraw(long)', 'in', '출금']];
  function s2(t, c) { const { k, u } = c, WX = 540, WY = 60, WW = 360, WH = 250;
    area(20, 20, 380, 385, 'class Demo (바깥 코드)', {});
    area(420, 20, 520, 385, 'Heap', { col: ACC });
    const wall = k === 0 ? E(u, 0.2, 1.2) : 1;
    el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 16, fill: PANEL, stroke: INK, 'stroke-width': 2 + 10 * wall, opacity: 0.95 });
    tx(WX + WW - 16, WY + 30, 'private', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: INK, 'text-anchor': 'end', opacity: wall });
    let v = 0; if (k === 4) v = u < 0.9 ? 0 : tween(0, 50000, u - 0.8, 0.6); if (k >= 5) v = 50000;
    balance(WX + 50, WY + 160, WW - 80, 'long balance', v, { vcol: ACC });
    tx(WX + WW / 2 + 10, WY + 30 + 0, 'BankAccount', { 'font-size': 15, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle' });
    const nd = k === 0 ? 0 : Math.min(3, k);
    for (let i = 0; i < nd; i++) { const [nm, dir, lab] = DOORS[i], y = WY + 62 + i * 34, isNew = i === k - 1 && k <= 3, op = isNew ? fade(u, 0.2) : 1;
      el('rect', { x: WX - 8, y: y - 13, width: 16, height: 26, rx: 3, fill: dir === 'out' ? INFO : GOOD, opacity: op });
      mono(WX + 18, y + 5, 'public ' + nm, { 'font-size': 14, 'font-weight': 700, fill: dir === 'out' ? INFO : GOOD, opacity: op });
      if (isNew) dir === 'out' ? grow(WX - 10, y, WX - 70, y, seg(u, 0.6, 1.1), INFO === ACC ? ACC : MUT) : grow(WX - 70, y, WX - 12, y, seg(u, 0.6, 1.1), ACC); }
    if (k === 0) { tx(200, 150, '통로 0개', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); sub(200, 180, '밖에서는 balance가 보이지 않는다', fade(u, 1.4), { 'font-size': 14 }); }
    if (k === 1) { tx(200, 150, '읽기만 연다', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) }); sub(200, 180, '쓰기는 아직 닫혀 있다', fade(u, 1.4), { 'font-size': 14 }); }
    if (k === 2) { tx(200, 150, 'setBalance가 아니라 deposit', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) }); sub(200, 180, '이름에서 뜻이 드러나는 행위로만 연다', fade(u, 1.4), { 'font-size': 14 }); }
    if (k === 3) { tx(200, 150, '쓰기 통로는 두 개로 고정', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 4) { chip(40, 110, 'acc.deposit(50000);', { fs: 14.5, stroke: GOOD });
      dot([[250, 110], [WX - 8, WY + 96], [WX + WW / 2, WY + 180]], seg(u, 0.2, 0.9), GOOD, 7);
      chip(40, 160, 'acc.getBalance()', { fs: 14.5, stroke: INFO, op: fade(u, 1.4) }); dot([[WX + WW / 2, WY + 180], [WX - 8, WY + 62], [230, 160]], seg(u, 1.5, 2.2), INFO, 7);
      terminal(30, 300, 360, 90, ['50000'], seg(u, 2.2, 2.5), { title: 'console' }); }
    if (k === 5) { chip(40, 110, 'acc.balance = -9999;', { fs: 14.5, stroke: BAD, col: BAD });
      const b = seg(u, 0.2, 1.0), back = seg(u, 1.0, 1.5); const px = lerp(250, WX - 14, b) - (WX - 14 - 380) * back;
      if (u < 1.5) el('circle', { cx: px, cy: lerp(110, WY + 200, b), r: 7, fill: BAD }); if (u > 0.95) cross(WX - 16, WY + 200, 11, pop(u, 0.95));
      chip(30, 210, 'error: balance has private access', { fs: 13.5, stroke: BAD, col: BAD, op: fade(u, 1.4), w: 350 });
      tx(200, 270, '경계를 컴파일러가 지킨다', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); } }

  // ---------- 3. 메서드 안의 검증 관문 ----------
  function gate(x, y, s, state, op) { const col = state === 'no' ? BAD : state === 'ok' ? GOOD : INK;
    el('rect', { x, y: y - 22, width: 170, height: 44, rx: 8, fill: state === 'no' ? BADBG : state === 'ok' ? GOODBG : PANEL, stroke: col, 'stroke-width': 2.4, opacity: op ?? 1 });
    mono(x + 85, y + 5, s, { 'font-size': 14.5, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: op ?? 1 }); }
  function s3(t, c) { const { k, u } = c, BX = 690;
    area(20, 20, 920, 385, null, {});
    // 잔액 칸 + 불변식
    let v = 0; if (k === 4) { v = u < 0.6 ? 0 : u < 1.2 ? tween(0, 50000, u - 0.6, 0.4) : tween(50000, 20000, u - 1.2, 0.4); }
    balance(BX, 130, 230, 'balance', v);
    badge(BX + 115, 80, true, k === 0 ? fade(u, 0.3) : 1);
    if (k === 0) { tx(330, 150, '불변식 = 언제 봐도 참이어야 하는 조건', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(330, 185, '이 조건을 지키는 코드를 메서드 안에 둔다', fade(u, 1.4), { 'font-size': 15 });
      [[-1, BAD], [1, GOOD]].forEach(([s, col], i) => el('rect', { x: i ? 330 : 130, y: 250, width: 200, height: 14, rx: 7, fill: col, opacity: 0.75 * fade(u, 1.8) }));
      el('line', { x1: 330, y1: 238, x2: 330, y2: 276, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.8) }); mono(330, 296, '0', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(230, 236, '들어가면 안 되는 영역', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    const lanes = [['deposit', 120], ['withdraw', 260]];
    lanes.forEach(([n, y]) => { mono(40, y + 5, n + '(amount)', { 'font-size': 15, 'font-weight': 700 }); el('line', { x1: 220, y1: y, x2: BX - 10, y2: y > 200 ? 175 : 155, stroke: GRID, 'stroke-width': 2.5 }); });
    // 관문
    if (k >= 1) gate(260, 120, 'amount > 0 ?', k === 1 && u > 1.2 ? 'no' : k === 4 && u > 0.4 && u < 0.9 ? 'ok' : null);
    if (k >= 2) gate(260, 260, 'amount > 0 ?', k === 2 && u > 1.2 ? 'no' : k === 4 && u > 1.0 && u < 2.5 ? 'ok' : null, k === 2 ? fade(u, 0.2) : 1);
    if (k >= 3) gate(460, 260, 'amount ≤ balance ?', k === 3 && u > 1.2 ? 'no' : k === 4 ? (u > 1.0 && u < 1.6 ? 'ok' : u > 2.0 ? 'no' : null) : null, k === 3 ? fade(u, 0.2) : 1);
    const reject = (y, x, s, ex, a) => { const b = seg(u, a, a + 0.6); fly(60, y - 34, x, y - 34, b, s, { mono: true, fill: BAD, stay: true });
      if (u > a + 0.7) tx(x + 85, y + 46, ex, { 'font-size': 14, 'font-weight': 800, fill: BAD, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, a + 0.7) }); };
    if (k === 1) { reject(120, 200, 'deposit(-100)', 'IllegalArgumentException', 0.4); sub(BX + 115, 220, '필드는 손대지 않은 채 그대로', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 2) { reject(260, 200, 'withdraw(-100)', 'IllegalArgumentException', 0.4); sub(BX + 115, 220, '같은 규칙이 객체 안 한 곳에', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 3) { tx(545, 330, '이 한 줄이 잔액이 음수로 가는 길을 막는다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.4) }); }
    if (k === 4) { dot([[220, 120], [430, 120], [BX, 155]], seg(u, 0.2, 0.7), GOOD, 7); dot([[220, 260], [640, 260], [BX, 175]], seg(u, 0.8, 1.3), GOOD, 7);
      dot([[220, 260], [455, 260]], seg(u, 1.6, 2.0), BAD, 7);
      [['deposit(50000)', GOOD, 0.2], ['withdraw(30000)', GOOD, 0.8], ['withdraw(999999)', BAD, 1.6]].forEach(([s, col, a], i) => chip(40 + i * 220, 360, s, { fs: 14, stroke: col, col, op: fade(u, a) }));
      terminal(BX - 10, 210, 250, 110, ['20000', 'IllegalStateException:', '  잔액 부족'], seg(u, 1.6, 2.6) * 3, { title: 'console' }); } }

  // ---------- 4. 불변 객체 + 방어적 복사 ----------
  function listObj(x, y, items, o) { o = o || {}; const op = o.op ?? 1;
    tx(x, y - 8, o.title || 'ArrayList', { 'font-size': 13.5, 'font-weight': 700, fill: o.col || MUT, class: 'mono', opacity: op });
    cells(x, y, items.concat(o.pad ? [''] : []), { w: 86, h: 36, fs: 14, style: (i, v) => ({ stroke: v === '"hacked"' ? BAD : o.stroke || INK, fill: v === '"hacked"' ? BADBG : PANEL, op, dash: v === '' ? '4 4' : null }) }); }
  function s4(t, c) { const { k, u } = c, MX = 300, MY = 50;
    area(20, 20, 200, 385, 'Stack', {});
    area(240, 20, 700, 385, 'Heap', { col: ACC });
    // Money 객체
    el('rect', { x: MX, y: MY, width: 300, height: 150, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2.4 });
    tx(MX + 14, MY + 26, 'final class Money', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN });
    [['final long amount', '50000'], ['final String currency', '"KRW"'], ['final List tags', k >= 1 ? '•' : null]].forEach(([n, v], i) => {
      const y = MY + 56 + i * 32, show = i < 2 || k >= 1, op = i < 2 ? (k === 0 ? fade(u, 0.3 + i * 0.4) : 1) : k === 1 ? fade(u, 0.2) : 1;
      if (!show) return;
      mono(MX + 14, y + 5, n, { 'font-size': 14, 'font-weight': 600, opacity: op });
      if (v === '•') el('circle', { cx: MX + 270, cy: y, r: 5.5, fill: ACC, opacity: op }); else mono(MX + 284, y + 5, v, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
      if (i < 2) lock(MX + 225, y - 2, true, WARN, 0.6 * (k === 0 ? pop(u, 0.5 + i * 0.4) : 1)); });
    // 내부 리스트 (복사본 B)
    const hasB = k >= 1, internal = k >= 3 ? '복사본 (내부)' : '내부 tags';
    if (hasB) { listObj(MX + 340, MY + 140, ['"salary"'], { title: internal, col: WARN, stroke: WARN, op: k === 1 ? fade(u, 0.4) : 1 });
      ref(MX + 275, MY + 120, MX + 338, MY + 150, k === 1 ? seg(u, 0.5, 1.0) : 1, { by: -10 });
      if (k === 1) { lock(MX + 245, MY + 118, true, WARN, pop(u, 1.0)); tx(MX + 340, MY + 210, '참조만 고정 — 리스트 내용은 바뀔 수 있다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.4) }); } }
    if (k === 0) tx(590, 290, '한 번 정한 금액과 통화는 다시 바뀌지 않는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
    if (k === 2) { chip(270, 290, 'new Money(음수, …)', { fs: 15, stroke: BAD, col: BAD, op: fade(u, 0.3) }); grow(450, 290, 520, 290, seg(u, 0.7, 1.1), BAD); cross(540, 290, 10, pop(u, 1.1));
      mono(570, 296, 'IllegalArgumentException', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      tx(590, 350, '만들어진 Money는 언제 봐도 유효하다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    // 바깥 리스트 t (원본 A)
    if (k >= 3) { const hacked = k === 6 && u > 0.8;
      const ts = slot(110, 260, 't', '•'); listObj(300, 300, hacked ? ['"salary"', '"hacked"'] : ['"salary"'], { title: '원본 t' });
      ref(ts.cx, ts.y, 298, 318, 1, { by: 10 });
      if (k === 3) { dot([[386, 300], [MX + 380, MY + 160]], seg(u, 0.4, 1.2), ACC, 7); tx(590, 380, 'new ArrayList<>(tags) — 들일 때 복사', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) }); } }
    const ms = slot(110, 120, 'm', '•', { op: k >= 3 ? 1 : 0 }); if (k >= 3) ref(ms.cx, ms.y, MX - 2, MY + 60, 1, { by: -10 });
    if (k >= 4) { const hacked = k === 6 && u > 1.6;
      listObj(640, 300, hacked ? ['"salary"', '"hacked"'] : ['"salary"'], { title: '반환 복사본', col: INFO, stroke: INFO, op: k === 4 ? fade(u, 1.0) : 1 });
      if (k === 4) { dot([[MX + 380, MY + 160], [680, 300]], seg(u, 0.4, 1.1), INFO, 7); tx(590, 395, 'getTags()는 복사본을 준다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.4) }); } }
    if (k === 5) { [0, 1, 2].forEach((i) => dot([[880, 60 + i * 30], [MX + 300, MY + 40 + i * 30]], ((t * 0.7 + i / 3) % 1), INFO, 6));
      tx(800, 40 + 0, '여러 스레드', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
      tx(590, 395, 'setter가 없다 — 같이 읽어도 락이 필요 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) }); }
    if (k === 6) { tx(400, 395, 't.add("hacked")', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      tx(730, 395, 'm.getTags().add("hacked")', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      pill(MX + 470, MY + 202, '내부는 [salary] 그대로', GOOD, pop(u, 2.0)); } }

  // ---------- 5. 접근제어자 4종 ----------
  const FIELDS = [['private long id', 'private', BAD], ['long stock', 'default', WARN], ['protected String sku', 'protected', INFO], ['public String name', 'public', GOOD]];
  function s5(t, c) { const { k, u } = c;
    const lvl = k === 0 ? -1 : Math.min(3, k - 1);
    const hi = (on, f) => (on ? f : 0);
    // 다른 패키지(전체)
    el('rect', { x: 10, y: 10, width: 940, height: 400, rx: 14, fill: lvl === 3 && k === 4 ? GOODBG : SOFT, opacity: 1 });
    tx(24, 32, '다른 패키지 (어디서나)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    // 패키지 shop
    el('rect', { x: 30, y: 45, width: 520, height: 350, rx: 12, fill: k === 2 ? WARNBG : PANEL, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 5' });
    tx(46, 70, 'package shop', { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: k === 0 ? fade(u, 0.2) : 1 });
    // Product 클래스
    el('rect', { x: 50, y: 85, width: 330, height: 295, rx: 10, fill: k === 1 ? BADBG : PANEL, stroke: INK, 'stroke-width': 2.2 });
    tx(64, 110, 'class Product', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    FIELDS.forEach(([s, m, col], i) => { if (i > lvl && k < 5) return; const isNew = i === lvl && k >= 1 && k <= 4;
      mono(66, 145 + i * 30, s, { 'font-size': 14, 'font-weight': 700, fill: isNew ? col : INK, opacity: isNew ? fade(u, 0.2) : 1 }); });
    if (k >= 5) [['private validate()', BAD], ['protected onRestock()', INFO], ['public describe()', GOOD]].forEach(([s, col], i) =>
      chip(66, 280 + i * 34, s, { fs: 13.5, stroke: col, col, op: k === 5 ? fade(u, 0.3 + i * 0.4) : 1 }));
    // shop 의 다른 클래스
    el('rect', { x: 395, y: 120, width: 140, height: 80, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
    tx(465, 155, '같은 패키지', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' }); tx(465, 177, '다른 클래스', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
    // 다른 패키지: 자식 / 남
    el('rect', { x: 600, y: 60, width: 320, height: 120, rx: 10, fill: k === 3 ? INFOBG : PANEL, stroke: INFO, 'stroke-width': 2 });
    tx(616, 88, '자식 클래스 (다른 패키지)', { 'font-size': 14, 'font-weight': 700, fill: INFO }); mono(616, 116, 'extends Product', { 'font-size': 14, fill: MUT });
    el('rect', { x: 600, y: 240, width: 320, height: 150, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 2 });
    tx(616, 268, '남의 클래스 (다른 패키지)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const reach = [['Product 안에서만', 215, 250], ['shop 패키지 안', 290, 60], ['shop + 자식', 690, 155], ['어디서나', 760, 320]];
    if (k >= 1 && k <= 4) { const [s, x, y] = reach[k - 1], col = FIELDS[k - 1][2];
      if (k === 1) tx(x, y + 120, s, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      if (k === 2) { tx(465, 240, s, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); check(465, 270, 10, pop(u, 1.0)); }
      if (k === 3) { tx(760, 150, '✓ sku 접근', { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); ref(600, 110, 382, 100, seg(u, 0.4, 1.0), { col: MUT, by: -20 }); }
      if (k === 4) { tx(760, 320, '✓ name 접근', { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); sub(760, 350, '무방비였던 Step 1로 되돌아간다', fade(u, 1.4), { 'font-size': 14, fill: BAD }); } }
    if (k === 0) { tx(760, 215, '같은 클래스 → 같은 패키지', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); tx(760, 232, '→ 자식 → 전체', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.1) }); }
    if (k === 5) tx(760, 320, '헬퍼는 private, 훅은 protected', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    if (k === 6) [['product.name', true], ['product.sku', false], ['product.stock', false], ['product.id', false]].forEach(([s, ok], i) => {
      const y = 296 + i * 24, a = 0.3 + i * 0.4;
      mono(630, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: fade(u, a) });
      ok ? check(880, y, 8, pop(u, a + 0.2)) : cross(880, y, 7, pop(u, a + 0.2)); }); }

  const quiz = [
    { q: 'balance가 public 필드일 때 acc.balance = -9999가 그대로 들어가는 이유는 무엇인가?',
      o: ['long이 음수를 담을 수 없어서 자동 보정되기 때문이다', '값을 거를 관문이 없어 바깥 코드가 직접 대입하기 때문이다', 'JVM이 불변식을 나중에 검사하기 때문이다'], a: 1,
      why: 'public 필드는 어디서든 직접 쓴다. 잔액 ≥ 0 규칙을 강제할 코드가 끼어들 자리가 없다.' },
    { q: 'balance를 private으로 바꾼 뒤 Demo에서 acc.balance = -9999를 쓰면 어떻게 되는가?',
      o: ['실행 중에 예외가 난다', '값이 무시되고 0이 된다', '컴파일 자체가 실패한다'], a: 2,
      why: 'private 필드는 클래스 밖에서 보이지 않는다. 경계를 문서가 아니라 컴파일러가 지킨다.' },
    { q: '잔액 50000에서 withdraw(30000) 뒤 withdraw(999999)를 부르면 결과는 무엇인가?',
      o: ['잔액 20000이 남고 두 번째 출금은 IllegalStateException으로 막힌다', '잔액이 -979999가 된다', '두 출금 모두 예외로 막힌다'], a: 0,
      why: '첫 출금은 두 검사를 통과해 20000이 된다. 두 번째는 amount > balance 검사에 걸려 잔액은 그대로다.' },
    { q: 'Money가 tags를 new ArrayList<>(tags)로 복사해 담는 이유는 무엇인가?',
      o: ['final 필드에는 리스트를 바로 넣을 수 없기 때문이다', 'ArrayList가 List보다 빠르기 때문이다', '호출부가 원본 리스트를 바꿔도 내부 tags가 영향을 받지 않게 하기 위해서다'], a: 2,
      why: 'final은 참조만 고정한다. 복사해 담고 복사해 내보내야 t.add나 getTags().add가 내부를 바꾸지 못한다.' },
    { q: '다른 패키지의 일반 클래스에서 Product의 어느 필드에 접근할 수 있는가?',
      o: ['public String name만', 'name과 protected sku', 'id를 뺀 나머지 전부'], a: 0,
      why: 'protected는 같은 패키지와 자식 클래스까지다. 남의 패키지 일반 클래스에는 public만 열린다.' },
  ];

  const summary = [
    'public 필드는 누구나 직접 바꿀 수 있어 잔액이 음수가 되는 것도 못 막는다.',
    '필드는 private으로 감추고 검증하는 메서드 안에서만 값을 바꾼다.',
    '불변 객체는 final 필드와 방어적 복사로 밖에서 내용을 못 바꾸게 한다.',
    '접근 범위는 private에서 시작해 필요할 때만 넓힌다.',
  ];
  const review = [
    { q: '잔액이 가끔 음수로 찍히는 버그가 났다. 코드를 보니 여러 곳에서 account.balance -= x를 직접 한다. 먼저 할 일은?',
      o: ['호출하는 곳마다 if 검사를 하나씩 붙인다', 'balance를 private으로 막고 검증하는 withdraw로만 바꾸게 한다', 'balance 타입을 int로 바꾼다'], a: 1,
      why: '검증이 호출부에 흩어지면 한 곳만 빠져도 불변식이 깨진다. 객체 안 한 곳에 모으면 모든 경로가 같은 검사를 지난다.' },
    { q: 'final List<String> tags 필드를 둔 객체인데 밖에서 getTags().add()를 하자 내부 값이 바뀌었다. 원인은?',
      o: ['final이 리스트 내용까지는 막지 않고 내부 리스트를 그대로 내보냈다', 'getTags()가 static이라서', 'ArrayList가 스레드 안전하지 않아서'], a: 0,
      why: 'final은 참조만 고정한다. getTags()에서 new ArrayList<>(tags) 같은 복사본을 돌려줘야 내부가 지켜진다.' },
    { q: '라이브러리의 한 필드를 처음 공개할 때 고를 접근제어자로 알맞은 것은?',
      o: ['일단 public으로 열고 나중에 좁힌다', '아무 제어자도 쓰지 않는 default가 가장 넓다', '가장 좁은 private으로 시작하고 필요할 때 넓힌다'], a: 2,
      why: '넓게 열면 남이 의존해 좁히기 어렵다. 좁게 시작한 범위는 나중에 넓혀도 기존 코드가 깨지지 않는다.' },
  ];

  R.page({ title: 'BankAccount 경계 지키기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
