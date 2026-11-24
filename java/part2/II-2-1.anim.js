/* II-2-1 인터페이스 vs 추상클래스 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 구멍(추상 메서드)이 남은 클래스 판, 능력 계약(인터페이스)과 구현 선(점선 + 빈 삼각형), 선택 기준표, default 몸통이 구현 클래스로 내려가는 모습 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function area(x, y, w, h, title, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || SOFT, stroke: o.stroke || 'none', 'stroke-width': 2, opacity: o.op ?? 1 });
    if (title) tx(x + 14, y + 24, title, { 'font-size': 15, 'font-weight': 700, fill: o.col || MUT, opacity: o.op ?? 1 }); }
  function cls(x, y, w, name, rows, o) { o = o || {}; const rh = 26, h = 36 + rows.length * rh + (rows.length ? 6 : 0), op = o.op ?? 1, st = o.stroke || INK;
    const g = el('g', { opacity: op });
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || PANEL, stroke: st, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    tx(x + w / 2, y + 23, name, { 'font-size': 15, 'font-weight': 800, class: 'mono', 'text-anchor': 'middle', fill: st }, g);
    if (rows.length) el('line', { x1: x, y1: y + 34, x2: x + w, y2: y + 34, stroke: st, 'stroke-width': 1.3 }, g);
    rows.forEach(([s, rs], i) => { rs = rs || {}; const cy = y + 36 + i * rh + rh / 2 + 3;
      if (rs.hot) el('rect', { x: x + 4, y: cy - rh / 2 + 1, width: w - 8, height: rh - 2, rx: 5, fill: rs.hot === true ? ACCBG : rs.hot, opacity: rs.op ?? 1 }, g);
      mono(x + 10, cy + 5, s, { 'font-size': 14, fill: rs.col || (rs.dim ? MUT : INK), 'font-weight': rs.dim ? 400 : 600, 'text-decoration': rs.strike ? 'line-through' : null, opacity: rs.op ?? 1 }, g); });
    return { x, y, w, h, cx: x + w / 2, cy: (i) => y + 36 + i * rh + rh / 2 }; }
  // 상속(실선)·구현(점선) 화살표, 끝에 빈 삼각형
  function inh(x1, y1, x2, y2, u, o) { o = o || {}; if (u <= 0) return; const col = o.col || INK;
    el('line', { x1, y1, x2: lerp(x1, x2, u), y2: lerp(y1, y2, u), stroke: col, 'stroke-width': 2, 'stroke-dasharray': o.dash });
    if (u > 0.98) { const a = Math.atan2(y2 - y1, x2 - x1), s = 13, q = (d) => [x2 - s * Math.cos(a + d), y2 - s * Math.sin(a + d)];
      el('path', { d: `M${x2},${y2} L${q(-0.45)} L${q(0.45)} Z`, fill: PANEL, stroke: col, 'stroke-width': 2 }); } }
  const real = (x1, y1, x2, y2, u, o) => inh(x1, y1, x2, y2, u, Object.assign({ dash: '6 4', col: INFO }, o));
  function chip(x, y, s, o) { o = o || {}; const fs = o.fs || 14, w = o.w || tw(s, fs) + 22, op = o.op ?? 1;
    el('rect', { x, y: y - 15, width: w, height: 30, rx: 6, fill: o.fill || PANEL, stroke: o.stroke || GRID, 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 11, y + 5, s, { 'font-size': fs, fill: o.col || INK, 'font-weight': o.fw || 600, opacity: op, 'text-decoration': o.strike ? 'line-through' : null });
    return { x, y, w, x1: x + w }; }
  function ref(x1, y1, x2, y2, u, o) { o = o || {}; if (u <= 0) return; const col = o.col || ACC;
    const mk = col === BAD ? 'url(#ra-ahr)' : col === ACC ? 'url(#ra-ahb)' : 'url(#ra-ah)';
    const mx = (x1 + x2) / 2 + (o.bx || 0), my = (y1 + y2) / 2 + (o.by || 0);
    el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: col, 'stroke-width': o.sw || 2.4, pathLength: 1,
      'stroke-dasharray': u >= 1 ? o.dash : `${clamp(u)} 1`, 'marker-end': u > 0.98 ? mk : null, opacity: o.op ?? 1 }); }
  // 클래스 판의 한 줄 (구멍이면 점선)
  function row(x, y, w, s, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y: y - 17, width: w, height: 34, rx: 7, fill: o.hole ? 'none' : (o.fill || PANEL), stroke: o.stroke || GRID, 'stroke-width': o.hole ? 2.2 : 1.6, 'stroke-dasharray': o.hole ? '7 5' : null, opacity: op });
    mono(x + 12, y + 5, s, { 'font-size': 14.5, 'font-weight': 600, fill: o.col || INK, opacity: op });
    if (o.tag) tx(x + w - 10, y + 5, o.tag, { 'font-size': 13.5, 'font-weight': 700, fill: o.tagCol || MUT, 'text-anchor': 'end', opacity: op }); }

  // ---------- 1. 추상클래스: 골격 + 상태 + 구멍 ----------
  function s1(t, c) { const { k, u } = c, X = 40, W = 470;
    area(20, 20, 510, 385, null, {});
    el('rect', { x: X - 6, y: 36, width: W + 12, height: 358, rx: 12, fill: PANEL, stroke: k >= 5 && u > 1.6 ? INK : WARN, 'stroke-width': 2.4, 'stroke-dasharray': k >= 5 && u > 1.6 ? null : '9 6' });
    tx(X + 8, 64, 'abstract class Payment', { 'font-size': 17, 'font-weight': 800, class: 'mono', fill: WARN });
    if (k >= 1) { row(X + 8, 108, W - 16, 'protected final long amount;', { op: k === 1 ? fade(u, 0.2) : 1, stroke: k === 1 ? ACC : GRID, tag: '상태', tagCol: ACC });
      row(X + 8, 150, W - 16, 'protected Payment(long amount)', { op: k === 1 ? fade(u, 0.7) : 1, stroke: k === 1 ? ACC : GRID, tag: '생성자', tagCol: ACC }); }
    if (k >= 2) row(X + 8, 206, W - 16, 'validate()  amount <= 0 → 예외', { op: k === 2 ? fade(u, 0.2) : 1, stroke: k === 2 ? GOOD : GRID, fill: GOODBG, tag: '구현', tagCol: GOOD });
    if (k >= 3) row(X + 8, 248, W - 16, 'fee()  amount / 100', { op: k === 3 ? fade(u, 0.2) : 1, stroke: k === 3 ? GOOD : GRID, fill: GOODBG, tag: '구현 · 1%', tagCol: GOOD });
    const filled = k === 5 ? E(u, 0.6, 1.5) : 0;
    if (k >= 4) row(X + 8, 310, W - 16, k === 5 ? '' : 'abstract boolean approve();', { hole: true, stroke: filled > 0.98 ? GOOD : BAD, col: filled > 0.98 ? MUT : BAD, op: k === 4 ? fade(u, 0.3) : 1, tag: filled > 0.98 ? '채워짐' : '몸통 없음', tagCol: filled > 0.98 ? GOOD : BAD });
    area(550, 20, 390, 385, k === 5 ? 'class CardPayment extends Payment' : '밖에서 보면', { col: k === 5 ? INK : MUT });
    if (k === 0) { chip(580, 110, 'new Payment(…)', { fs: 15, stroke: BAD, col: BAD, op: fade(u, 0.4) }); cross(760, 110, 10, pop(u, 0.9));
      tx(745, 190, '미완성 부모 — 직접 만들 수 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(745, 220, '자식이 나머지를 채워야 쓸 수 있다', fade(u, 1.7), { 'font-size': 14 }); }
    if (k === 1) { tx(745, 140, '필드와 생성자', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.0) });
      tx(745, 168, '인터페이스에는 없는 능력', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(745, 200, '자식은 super(amount)로 넘긴다', fade(u, 1.8), { 'font-size': 14 }); }
    if (k === 2 || k === 3) { ['CardPayment', 'KakaoPay'].forEach((n, i) => { const x = 580 + i * 180, s = 1;
        cls(x, 120, 160, n, [[k === 2 ? 'validate() ✓' : 'fee() ✓', { dim: true }]], { op: s });
        dot([[X + W - 20, k === 2 ? 206 : 248], [x + 80, 186]], seg(u, 0.6 + i * 0.4, 1.4 + i * 0.4), GOOD, 7); });
      tx(745, 260, '자식은 다시 쓰지 않고 물려받는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 4) { tx(745, 170, '공통은 부모가', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 0.8) });
      tx(745, 200, '다른 부분만 자식이', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.2) });
      sub(745, 240, '구현 메서드와 추상 메서드를 한 클래스에 섞는다', fade(u, 1.6), { 'font-size': 14 }); }
    if (k === 5) { // 조각이 구멍으로 들어간다
      const px = lerp(580, X + 8, filled), py = lerp(120, 310, filled);
      el('rect', { x: px, y: py - 17, width: 330, height: 34, rx: 7, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.2 });
      mono(px + 12, py + 5, 'approve() { amount < 1_000_000 }', { 'font-size': 14, 'font-weight': 700, fill: GOOD });
      chip(580, 210, 'new CardPayment(…)', { fs: 15, stroke: GOOD, col: GOOD, op: fade(u, 1.7) }); check(800, 210, 10, pop(u, 1.9));
      chip(580, 290, 'extends Payment, Other', { fs: 14, stroke: BAD, col: BAD, strike: true, op: fade(u, 2.1) }); cross(830, 290, 9, pop(u, 2.3));
      sub(745, 340, 'extends는 딱 하나', fade(u, 2.3), { 'font-size': 15, fill: BAD }); } }

  // ---------- 2. 인터페이스: 상태 없는 능력 계약 ----------
  function s2(t, c) { const { k, u } = c;
    area(20, 20, 920, 385, null, {});
    // Refundable
    el('rect', { x: 40, y: 40, width: 430, height: 196, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.4 });
    tx(56, 66, 'interface Refundable', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { row(56, 110, 398, '(인스턴스 필드 자리)', { hole: true, stroke: BAD, col: MUT, op: fade(u, 0.7) }); cross(430, 110, 9, pop(u, 1.1));
      tx(255, 170, '상태를 담을 자리가 애초에 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k >= 1) { const pre = k === 1 ? seg(u, 0.8, 1.6) : 1, s = 'public static final ';
      mono(68, 94, s.slice(0, Math.round(s.length * pre)), { 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
      row(56, 118, 398, 'int MAX_REFUND_DAYS = 30;', { stroke: k === 1 ? WARN : GRID, tag: '상수', tagCol: WARN, op: k === 1 ? fade(u, 0.2) : 1 }); }
    if (k >= 2) { const pre = k === 2 ? seg(u, 0.8, 1.5) : 1, s = 'public abstract ';
      mono(68, 162, s.slice(0, Math.round(s.length * pre)), { 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      row(56, 186, 398, 'boolean refund(long amount);', { hole: true, stroke: INFO, col: INFO, tag: '몸통 없음', op: k === 2 ? fade(u, 0.2) : 1 }); }
    if (k === 1) sub(255, 226, '값을 바꿀 수 없는 공유 상수', fade(u, 1.8), { 'font-size': 14 });
    // Loggable
    if (k >= 3) { el('rect', { x: 540, y: 40, width: 380, height: 110, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.4, opacity: k === 3 ? fade(u, 0.2) : 1 });
      tx(556, 66, 'interface Loggable', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO, opacity: k === 3 ? fade(u, 0.3) : 1 });
      row(556, 110, 348, 'void log(String event);', { hole: true, stroke: INFO, col: INFO, op: k === 3 ? fade(u, 0.6) : 1 });
      if (k === 3) { tx(730, 200, '서로 아무 관계 없는 별개의 능력', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
        sub(730, 228, '계층이 아니라 붙였다 떼는 딱지', fade(u, 1.6), { 'font-size': 14 }); } }
    // GiftCard
    if (k >= 4) { const gx = 330, gy = 290, gw = 300;
      const rows = [['refund(long amount)', k >= 5 ? { col: GOOD } : { col: MUT }], ['log(String event)', k >= 6 ? { col: GOOD } : { col: MUT }]];
      cls(gx, gy, gw, 'class GiftCard', rows, { op: k === 4 ? fade(u, 0.2) : 1 });
      real(gx + 60, gy, 255, 236, k === 4 ? seg(u, 0.5, 1.1) : 1); real(gx + gw - 60, gy, 730, 150, k === 4 ? seg(u, 0.9, 1.5) : 1);
      if (k === 4) { tx(gx + gw + 20, 310, 'implements Refundable, Loggable', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INFO, opacity: fade(u, 1.6) });
        sub(780, 360, 'extends로는 불가능한 일', fade(u, 2.0), { 'font-size': 15 }); }
      if (k === 5) { const bx = 560, by = 220, bw = 340, th = bx + bw * 0.5;
        el('rect', { x: bx, y: by, width: bw, height: 14, rx: 7, fill: SOFT, stroke: GRID });
        el('rect', { x: bx, y: by, width: (th - bx) * E(u, 0.3, 1.0), height: 14, rx: 7, fill: GOOD });
        el('rect', { x: th, y: by, width: (bx + bw - th) * E(u, 1.0, 1.6), height: 14, rx: 7, fill: BAD, opacity: 0.7 });
        el('line', { x1: th, y1: by - 10, x2: th, y2: by + 24, stroke: INK, 'stroke-width': 2 }); mono(th, by - 14, '50_000', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
        tx(bx + 10, by + 44, '이하 → true', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) }); tx(bx + bw - 10, by + 44, '초과 → false', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.6) });
        sub(780, 380, '계약은 하나, 몸통은 클래스 마음', fade(u, 2.0), { 'font-size': 14 }); }
      if (k === 6) { chip(650, 230, 'println("[GiftCard] " + event)', { fs: 13.5, stroke: GOOD, op: fade(u, 0.3) });
        cls(40, 290, 230, 'CardPayment', [['extends Payment', { dim: true }]], { op: fade(u, 1.0) }); real(155, 290, 140, 236, seg(u, 1.3, 1.9));
        tx(155, 410, '다른 계층에도 같은 능력', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 2.0) }); } } }

  // ---------- 3. 선택 기준 ----------
  function tableRows(x, y, rows, prevRows, u) { const W = [210, 105, 105], rh = 44;
    ['질문', '추상클래스', '인터페이스'].forEach((h, i) => tx(x + W.slice(0, i).reduce((a, b) => a + b, 0) + 8, y, h, { 'font-size': 14, 'font-weight': 800, fill: i === 1 ? WARN : i === 2 ? INFO : MUT }));
    const known = new Set((prevRows || []).map((r) => r.q));
    rows.forEach((r, i) => { const yy = y + 14 + i * rh, isNew = !known.has(r.q), f = isNew ? fade(u, 0.5, 0.6) : 1;
      el('rect', { x, y: yy, width: 420, height: rh - 6, rx: 7, fill: isNew ? ACCBG : PANEL, stroke: GRID, 'stroke-width': 1.4, opacity: f });
      tx(x + 8, yy + 24, r.q.replace('(필드)', ''), { 'font-size': 13.5, 'font-weight': 700, opacity: f });
      [r.abs, r.iface].forEach((v, j) => { const ok = /^✅/.test(v), no = /^✖/.test(v), txt = v.replace(/^[✅✖△]\s*/, '');
        tx(x + 210 + j * 105 + 8, yy + 24, txt.replace(/\s*\(.*\)$/, ''), { 'font-size': 13.5, 'font-weight': 700, fill: ok ? GOOD : no ? BAD : INK, opacity: f }); }); }); }
  function s3(t, c) { const { k, u } = c, d = c.beat.decide || { rows: [], verdict: [] }, pd = (c.prev && c.prev.decide) || { rows: [] };
    area(20, 20, 470, 385, '코드 구조', {});
    area(505, 20, 435, 385, '선택 기준표', {});
    if (k === 0) { tx(255, 120, '① 타입은 인터페이스로 노출', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.3) });
      grow(255, 136, 255, 186, seg(u, 0.8, 1.3), MUT);
      tx(255, 214, '② 공통 구현이 필요할 때만 추상클래스', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.3) });
      tx(722, 200, '두 질문만 던진다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(722, 232, '공유할 상태·구현이 있나? · 여러 개를 붙이나?', fade(u, 2.0), { 'font-size': 14 }); }
    if (k >= 1) { const pm = cls(110, 50, 290, 'interface PaymentMethod', [['boolean approve();', { col: INFO }], ['long fee();', { col: INFO }]], { stroke: INFO, op: k === 1 ? fade(u, 0.2) : 1 }); }
    if (k >= 2) { const rows = [['long amount  (생성자로 받음)']]; if (k >= 3) rows.push(['fee()  amount / 100', { col: GOOD }], ['approve()  — 추상 그대로', { dim: true }]);
      cls(90, 170, 330, 'abstract AbstractPayment', rows, { stroke: WARN, op: k === 2 ? fade(u, 0.2) : 1 }); real(255, 170, 255, 136, k === 2 ? seg(u, 0.5, 1.0) : 1); }
    if (k >= 4) { const sw = k === 5 && u > 1.0 && u < 2.0, cp = cls(140, 330, 230, sw ? '다른 구현' : 'CardPayment', [], { op: k === 4 ? fade(u, 0.2) : 1, dash: k === 5 && u > 1.0 && u < 2.0 ? '6 4' : null, stroke: k === 5 && u > 1.0 && u < 2.0 ? MUT : INK });
      inh(255, 330, 255, k >= 3 ? 290 : 240, k === 4 ? seg(u, 0.4, 0.9) : 1);
      if (k === 4) { chip(300, 384, 'extends Other', { fs: 13.5, stroke: BAD, col: BAD, strike: true, op: fade(u, 1.2) }); cross(450, 384, 8, pop(u, 1.5)); } }
    if (k === 5) { el('circle', { cx: 50, cy: 92, r: 6, fill: ACC }); tx(50, 76, 'pm', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.2) }); tx(50, 122, '호출부', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      ref(56, 92, 108, 92, seg(u, 0.3, 0.7), { by: 0 });
      tx(255, 410, '구현을 갈아끼워도 호출부는 그대로', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.0) }); }
    tableRows(520, 64, d.rows, pd.rows, u);
    (d.verdict || []).forEach((v, i) => { const was = ((c.prev && c.prev.decide && c.prev.decide.verdict) || []).some((p) => p.pick === v.pick);
      const col = v.pick === '인터페이스' ? INFO : WARN, y = 300 + i * 46;
      card(722, y, 400, 38, { rx: 19, stroke: col, sw: 2.2, s: was ? 1 : pop(u, 1.2), text: v.pick + ' — ' + v.when, fs: 13.5, color: col }); }); }

  // ---------- 4. default 메서드 ----------
  function s4(t, c) { const { k, u } = c;
    area(20, 20, 920, 385, null, {});
    const rows = [['String name();', { col: INFO }]];
    if (k === 0) rows.push(['String greet();  ← 추상으로 추가하면?', { col: BAD, op: fade(u, 0.6), hot: BADBG }]);
    if (k >= 1) rows.push(['default String greet() { … }', { col: GOOD, hot: k === 1 ? GOODBG : null }]);
    if (k >= 2) rows.push(['static Greeter of(String n)', { col: WARN, hot: k === 2 ? WARNBG : null }]);
    const gi = cls(250, 40, 420, 'interface Greeter', rows, { stroke: INFO });
    // 구현 클래스들
    const IM = [['Korean', 'name() "홍길동"'], ['기존 구현 …', 'name()'], ['기존 구현 …', 'name()']];
    if (k <= 3) IM.forEach(([n, r], i) => { const x = 90 + i * 270, y = 270;
      const broken = k === 0 && u > 1.2, got = k >= 1;
      cls(x, y, 230, n, [[r, { dim: i > 0 }]].concat(got ? [['greet()  물려받음', { col: GOOD, op: k === 1 ? fade(u, 1.0 + i * 0.3) : 1 }]] : []), { stroke: broken ? BAD : got && (k > 1 || u > 1.0 + i * 0.3) ? GOOD : INK });
      real(x + 115, y, 460, gi.y + gi.h, 1, { col: MUT });
      if (broken) cross(x + 215, y + 10, 9, pop(u, 1.2 + i * 0.2));
      if (k === 1) dot([[460, gi.cy(1)], [x + 115, y + 50]], seg(u, 0.4 + i * 0.3, 1.1 + i * 0.3), GOOD, 7); });
    if (k === 0) tx(480, 395, '모든 구현 클래스가 컴파일 에러 — Java 8 이전의 딜레마', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
    if (k === 1) tx(480, 395, '구현 클래스는 한 줄도 안 고쳤다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    if (k === 2) { pill(810, 70, 'Greeter.of("Guest")', WARN, pop(u, 0.5), { mono: true }); grow(810, 88, 810, 148, seg(u, 0.9, 1.3), WARN); }
    if (k === 2) tx(810, 244, '추상 메서드 하나 → 람다로 구현', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
    if (k === 3) { const kx = 90 + 115;
      dot([[kx, 300], [460, gi.cy(1)]], seg(u, 0.2, 0.9), ACC, 7); dot([[460, gi.cy(1)], [kx + 60, 300]], seg(u, 1.0, 1.6), INFO, 7);
      tx(360, 400, 'greet() 안에서 name()을 Korean에게 다시 묻는다', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 1.0) });
      pill(800, 395, '안녕하세요, 홍길동님', GOOD, pop(u, 1.9)); }
    if (k === 4) { const kc = cls(90, 270, 300, 'class X implements Greeter', [['name()', { dim: true }], ['greet()  직접 구현', { col: ACC, hot: true }]]);
      real(240, 270, 400, gi.y + gi.h, 1, { col: MUT }); tx(240, 405, '자식 구현이 default를 이긴다', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
      // 다이아몬드 충돌
      cls(560, 200, 150, 'interface A', [['default greet()', { col: GOOD }]], { op: fade(u, 1.2) }); cls(750, 200, 150, 'interface B', [['default greet()', { col: GOOD }]], { op: fade(u, 1.2) });
      cls(655, 330, 150, 'class C', [], { stroke: BAD, op: fade(u, 1.5) }); real(700, 330, 635, 268, seg(u, 1.5, 1.9)); real(760, 330, 825, 268, seg(u, 1.5, 1.9)); cross(820, 348, 9, pop(u, 2.0));
      tx(730, 405, '같은 default 둘 → C가 직접 재정의해야 한다', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.2) }); }
    if (k === 2 || k === 5) cls(710, 150, 200, '람다 구현체', [['name() → "Guest"', { col: WARN }]], { stroke: WARN, op: k === 2 ? fade(u, 1.2) : 1 });
    if (k === 5) { pill(810, 260, 'g.greet()', GOOD, pop(u, 0.3), { mono: true }); grow(810, 230, 810, 245, seg(u, 0.4, 0.7), GOOD);
      pill(810, 330, '안녕하세요, Guest님', GOOD, pop(u, 1.0)); grow(810, 278, 810, 312, seg(u, 0.7, 1.0), GOOD);
      chip(90, 300, 'List.sort(…)', { fs: 15, stroke: GOOD, op: fade(u, 1.4) }); chip(90, 345, 'Collection.stream()', { fs: 15, stroke: GOOD, op: fade(u, 1.7) });
      tx(330, 330, '← Java 8에 default로 추가됐다', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.0) }); } }

  // ---------- 5. 실전 조합과 안티패턴 ----------
  function s5(t, c) { const { k, u } = c;
    area(20, 20, 920, 385, null, {});
    if (k <= 3) {
      const ap = cls(355, 36, 250, 'AbstractPayment', [['amount · fee()', { dim: true }]], { stroke: WARN });
      const rows = [['amount · fee()  (물려받음)', { dim: true }], ['approve()', k >= 2 ? { col: GOOD } : { col: MUT }]];
      if (k >= 1) rows.push(['refund(long a)', k >= 2 ? { col: GOOD } : { col: MUT, op: fade(u, 0.8) }], ['log(String e)', k >= 3 ? { col: GOOD } : { col: MUT, op: k === 1 ? fade(u, 0.8) : 1 }]);
      const cp = cls(330, 190, 300, 'class CardPayment', rows);
      inh(480, 190, 480, ap.y + ap.h, k === 0 ? seg(u, 0.3, 0.9) : 1, { col: WARN });
      if (k === 0) { dot([[480, 100], [420, cp.cy(0)]], seg(u, 1.0, 1.7), WARN, 7); tx(660, 150, 'extends 한 장 — 골격과 상태', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.5) }); }
      if (k >= 1) { const a = k === 1 ? seg(u, 0.2, 0.8) : 1;
        cls(40, 150, 230, 'Refundable', [['refund(long)', { col: INFO }]], { stroke: INFO, op: a }); cls(690, 150, 230, 'Loggable', [['log(String)', { col: INFO }]], { stroke: INFO, op: a });
        real(330, 240, 270, 200, k === 1 ? seg(u, 0.6, 1.1) : 1); real(630, 240, 690, 200, k === 1 ? seg(u, 0.8, 1.3) : 1);
        if (k === 1) tx(480, 400, 'implements는 콤마로 몇 장이든', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
      if (k === 2) { check(610, cp.cy(1), 9, pop(u, 0.4)); check(610, cp.cy(2), 9, pop(u, 0.8));
        tx(480, 400, 'fee()는 부모 것을 그대로 쓴다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
      if (k === 3) { check(610, cp.cy(3), 9, pop(u, 0.4)); terminal(660, 300, 260, 90, ['[Card] approved'], seg(u, 0.9, 1.5), { title: 'console' });
        tx(40, 330, '골격은 추상클래스에서', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); tx(40, 356, '능력은 인터페이스에서', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.7) }); }
      return; }
    if (k === 4) { tx(40, 60, '안티패턴 1 — 상수 인터페이스', { 'font-size': 17, 'font-weight': 800, fill: BAD });
      cls(80, 90, 250, 'interface Const', [['int MAX = 100;', { col: BAD }]], { stroke: BAD, op: fade(u, 0.2) });
      cls(80, 260, 250, 'class CardPayment', [['implements Const', { col: BAD, strike: u > 1.6 }]], { op: fade(u, 0.4) }); real(205, 260, 205, 158, seg(u, 0.5, 1.0), { col: BAD });
      tx(360, 300, 'CardPayment가 "Const의 일종" 이 되어 버린다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
      chip(500, 140, 'final class Limits { static final int MAX = 100; }', { fs: 13.5, stroke: GOOD, col: GOOD, op: fade(u, 1.6), w: 420 });
      tx(500, 190, '상수는 구현 세부 — enum이나 final 클래스의 static 상수로', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    // k5: 남은 두 안티패턴
    tx(40, 60, '안티패턴 2 — 능력을 추상클래스로 묶기', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.2) });
    cls(60, 90, 180, 'abstract Refunds', [], { stroke: WARN, op: fade(u, 0.3) }); cls(260, 90, 180, 'abstract Logs', [], { stroke: WARN, op: fade(u, 0.3) });
    cls(150, 230, 200, 'CardPayment', [], { op: fade(u, 0.5) }); inh(210, 230, 150, 126, seg(u, 0.6, 1.0)); inh(290, 230, 350, 126, seg(u, 0.8, 1.2), { col: BAD, dash: '6 4' }); cross(320, 178, 10, pop(u, 1.2));
    tx(250, 310, 'extends는 하나 — 두 번째 능력에서 막힌다', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.3) });
    tx(500, 60, '안티패턴 3 — default 남용', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
    cls(500, 90, 190, 'interface A', [['default 로직 …', { col: GOOD }]], { op: fade(u, 1.1) }); cls(720, 90, 190, 'interface B', [['default 로직 …', { col: GOOD }]], { op: fade(u, 1.1) });
    cls(610, 230, 190, 'class C', [], { stroke: BAD, op: fade(u, 1.4) }); real(660, 230, 595, 158, seg(u, 1.4, 1.8)); real(750, 230, 815, 158, seg(u, 1.4, 1.8)); cross(780, 248, 9, pop(u, 1.9));
    tx(705, 310, '같은 default가 겹치면 컴파일 에러', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
    banner(480, 372, '계약은 인터페이스 · 골격은 추상클래스 · 상수는 enum', pop(u, 2.3)); }

  const quiz = [
    { q: 'abstract class Payment에 대해 맞는 것은 무엇인가?',
      o: ['new Payment()로 바로 객체를 만들 수 있다', '필드는 가질 수 없고 메서드만 가진다', '필드·생성자·구현 메서드와 몸통 없는 approve()를 함께 가진다'], a: 2,
      why: '추상클래스는 상태와 공통 구현을 물려주는 미완성 부모다. approve() 구멍은 CardPayment 같은 자식이 채운다.' },
    { q: 'Refundable 안의 int MAX_REFUND_DAYS = 30은 무엇이 되는가?',
      o: ['public static final 상수', '구현 클래스마다 따로 갖는 인스턴스 필드', '나중에 바꿀 수 있는 static 변수'], a: 0,
      why: '인터페이스에 쓴 변수에는 public static final이 저절로 붙는다. 인터페이스는 인스턴스 상태를 갖지 않는다.' },
    { q: 'CardPayment가 이미 AbstractPayment를 상속하는데 다른 골격이 하나 더 필요해졌다. 어떻게 되는가?',
      o: ['extends를 하나 더 쓰면 된다', '클래스는 extends를 하나만 쓸 수 있어 추상클래스로는 더할 수 없다', '추상클래스를 둘 상속하면 자동으로 합쳐진다'], a: 1,
      why: '자바는 클래스 단일 상속이다. 그래서 타입은 인터페이스로 노출하고 추상클래스는 꼭 필요한 골격에만 쓴다.' },
    { q: '이미 여러 클래스가 구현한 Greeter에 greet()를 default로 추가하면 기존 구현 클래스는 어떻게 되는가?',
      o: ['모두 greet()를 직접 구현해야 컴파일된다', '아무것도 고치지 않아도 기본 greet()를 물려받는다', 'greet()를 부르면 실행 중 예외가 난다'], a: 1,
      why: 'default 메서드는 몸통을 가진 채 추가된다. List.sort와 Collection.stream도 Java 8에 이렇게 들어왔다.' },
    { q: '상수만 담은 interface Const를 implements하는 방식을 피하는 이유는 무엇인가?',
      o: ['상수가 런타임에 바뀌기 때문이다', '인터페이스에는 상수를 둘 수 없기 때문이다', '구현 세부인 상수 때문에 클래스의 타입 계층이 오염되기 때문이다'], a: 2,
      why: 'implements는 그 클래스가 무엇을 할 수 있는지를 알리는 선언이다. 상수는 enum이나 final 클래스의 static 상수에 둔다.' },
  ];

  const summary = [
    '추상클래스는 필드와 생성자, 공통 구현을 물려주는 미완성 부모다.',
    '클래스는 하나만 상속할 수 있어서 여러 능력은 인터페이스로 붙인다.',
    '인터페이스 변수는 상수가 되고 메서드는 몸통 없는 계약이 된다.',
    'default 메서드는 기존 구현 클래스를 고치지 않고 인터페이스를 늘린다.',
  ];
  const review = [
    { q: '결제 클래스 셋이 금액 검증과 수수료 계산 코드를 똑같이 복사해 쓰고 있다. 먼저 해 볼 것은?',
      o: ['공통 코드를 추상클래스로 올리고 승인만 자식이 구현하게 한다', '상수 인터페이스를 하나 만든다', '세 클래스를 final로 막는다'], a: 0,
      why: '공유할 상태와 완성된 공통 로직이 있으면 추상클래스가 맞다. 다른 부분인 approve()만 추상으로 남긴다.' },
    { q: '두 인터페이스가 같은 이름의 default 메서드를 주는데 둘 다 implements했더니 컴파일이 안 된다. 고칠 방법은?',
      o: ['인터페이스 하나를 추상클래스로 바꾼다', '구현 클래스에서 그 메서드를 직접 재정의한다', 'default를 static으로 바꾸면 자동으로 해결된다'], a: 1,
      why: '어느 default를 쓸지 컴파일러가 정할 수 없다. 클래스가 직접 재정의해 하나로 정해 주면 된다.' },
    { q: '서로 다른 계층의 GiftCard와 CardPayment 둘 다 환불 기능이 필요하다. 어울리는 설계는?',
      o: ['둘을 같은 추상클래스 아래로 옮긴다', 'GiftCard가 CardPayment를 상속한다', 'Refundable 인터페이스를 각자 implements한다'], a: 2,
      why: '환불은 계층과 상관없이 붙이는 능력이다. 인터페이스라 각자의 부모를 바꾸지 않고도 붙일 수 있다.' },
  ];

  R.page({ title: '추상클래스와 인터페이스', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
