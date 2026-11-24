/* IV-2-2 record·sealed — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 손으로 쌓는 멤버 탑과 한 줄 record, 힙의 Point 객체와 HashSet 칸, 컴팩트 생성자 검문소,
 *       같은 ArrayList를 가리키는 두 참조와 List.copyOf 복사본, permits 자리가 채워지는 봉인 계층, 빠짐없음을 세는 switch. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, terminal, hbar, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 자바 코드 조각 ----------
  const JKW = /^(abstract|boolean|case|catch|class|default|double|else|extends|final|for|if|implements|import|instanceof|int|interface|long|new|null|permits|private|public|record|return|sealed|static|switch|this|throw|throws|try|var|void|yield|true|false)$/;
  function jtok(s) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(@?\b\w+\b)/).forEach((w) => { if (w) out.push([w, JKW.test(w) ? { 'font-weight': 700, fill: INFO } : w[0] === '@' ? { 'font-weight': 700, fill: WARN } : {}]); }); buf = ''; };
    while (i < s.length) { const ch = s[i];
      if (ch === '/' && s[i + 1] === '/') { flush(); out.push([s.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = s.indexOf('"', i + 1), end = e < 0 ? s.length : e + 1; out.push([s.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  // o.hl(i) → 'hl' | 'bad' | 'good' | 'dim', o.show = 보이는 줄 수(소수면 마지막 줄을 타이핑)
  function jcode(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + 30, h = lines.length * lh + 16, op = o.op ?? 1, show = o.show ?? lines.length;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': o.stroke ? 2 : 1.5, opacity: op });
    lines.forEach((s, i) => { if (i >= Math.ceil(show)) return; const part = i === Math.ceil(show) - 1 && show % 1 ? s.slice(0, Math.round(s.length * (show % 1))) : s;
      const st = o.hl ? o.hl(i) : null, ly = y + 8 + i * lh;
      if (st === 'hl' || st === 'bad' || st === 'good') el('rect', { x: x + 4, y: ly, width: w - 8, height: lh, rx: 4, fill: st === 'bad' ? BADBG : st === 'good' ? GOODBG : ACCBG, opacity: op });
      spans(x + 14, ly + lh / 2 + fs * 0.36, jtok(part), { 'font-size': fs, opacity: op * (st === 'dim' ? 0.35 : 1) }); });
    return { x, y, w, h, lh, cx: (col) => x + 14 + col * fs * 0.55, cy: (i) => y + 8 + i * lh + lh / 2 }; }
  // 참조 화살표 (구부러진 선이 자란다). 시작점에 점
  const MK = (col) => (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)');
  function qp(x1, y1, x2, y2, b) { return [(x1 + x2) / 2 - (y2 - y1) * b, (y1 + y2) / 2 + (x2 - x1) * b]; }
  function arc(x1, y1, x2, y2, u, col, o) { o = o || {}; if (u <= 0) return; const [qx, qy] = qp(x1, y1, x2, y2, o.bend || 0);
    if (!o.nodot) el('circle', { cx: x1, cy: y1, r: 5, fill: col || INK, opacity: o.op ?? 1 });
    const a = { d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`, fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, opacity: o.op ?? 1, 'marker-end': u >= 0.98 ? MK(col) : null };
    if (u < 1) { a.pathLength = 1; a['stroke-dasharray'] = `${u} 1`; } else if (o.dash) a['stroke-dasharray'] = o.dash;
    el('path', a); }
  function along(x1, y1, x2, y2, b, f) { const [qx, qy] = qp(x1, y1, x2, y2, b), g = 1 - f; return [g * g * x1 + 2 * g * f * qx + f * f * x2, g * g * y1 + 2 * g * f * qy + f * f * y2]; }
  // 스택 프레임: rows [[이름, 값(null 이면 참조 점), {col, bg}]] → 값 칸 가운데 좌표
  function frame(x, y, w, title, rows, o) { o = o || {}; const rh = 42, h = 40 + rows.length * rh;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 });
    mono(x + 12, y + 24, title, { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    return rows.map(([n, v, ro], i) => { ro = ro || {}; const yy = y + 36 + i * rh, vx = x + w * 0.46, vw = w * 0.54 - 12, col = ro.col || INK;
      mono(x + 14, yy + rh / 2 + 5, n, { 'font-size': 15, 'font-weight': 700, fill: col });
      el('rect', { x: vx, y: yy + 5, width: vw, height: rh - 10, rx: 5, fill: ro.bg || SOFT, stroke: ro.col || GRID, 'stroke-width': 1.5 });
      if (v != null) mono(vx + vw / 2, yy + rh / 2 + 5, v, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: col });
      else el('circle', { cx: vx + vw / 2, cy: yy + rh / 2, r: 5, fill: col });
      return { x: vx + vw / 2, y: yy + rh / 2, r: vx + vw }; }); }
  // 힙 객체: 머리(클래스) + 필드 줄
  function obj(cx, cy, w, head, rows, o) { o = o || {}; const h = 38 + rows.length * 26, col = o.stroke || INK;
    const g = card(cx, cy, w, h, { rx: 10, stroke: col, sw: 2.2, fill: o.fill || PANEL, s: o.s, op: o.op });
    mono(0, -h / 2 + 24, head, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    if (rows.length) el('line', { x1: -w / 2 + 8, y1: -h / 2 + 34, x2: w / 2 - 8, y2: -h / 2 + 34, stroke: GRID, 'stroke-width': 1.5 }, g);
    rows.forEach(([s, rc], i) => mono(-w / 2 + 14, -h / 2 + 56 + i * 26, s, { 'font-size': 14.5, fill: rc || INK }, g));
    return { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2, h }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const strike = (x, y, len, u, col) => { if (u > 0) el('line', { x1: x, y1: y, x2: x + len * clamp(u), y2: y, stroke: col || BAD, 'stroke-width': 2.4, 'stroke-linecap': 'round' }); };
  const heapZones = (sx, hx) => { zone(20, 34, sx - 30, 372, '스택', { fill: SOFT }); zone(sx, 34, hx - sx, 372, '힙', { fill: INFOBG }); };
  const chip = (x, y, s, col, o) => { o = o || {}; return card(x, y, tw(s, 14) + 22, 30, { rx: 8, text: s, mono: true, fs: 14, fw: 700, fill: o.fill || PANEL, stroke: col || INK, color: col || INK, s: o.s, op: o.op }); };
  const burst = (x, y, sc) => { if (sc <= 0) return; const g = R.G(x, y, sc);
    el('path', { d: 'M0,-30 L8,-11 L28,-16 L14,0 L28,16 L8,11 L0,30 L-8,11 L-28,16 L-14,0 L-28,-16 L-8,-11 Z', fill: BADBG, stroke: BAD, 'stroke-width': 2.4 }, g); };

  // ---------- 1. 보일러플레이트 ----------
  const BLK = [['필드', 2, 'private final int x, y'], ['생성자', 4, 'Point(int x, int y)'], ['접근자', 2, 'getX() · getY()'], ['equals', 5, '값 기반 비교'], ['hashCode', 3, 'equals와 짝'], ['toString', 3, '"Point[x=.., y=..]"']];
  const LH = 15;   // 한 줄 = 15px
  function tower(n, u, newIdx, o) { o = o || {}; let y = 400, total = 0;
    tx(40, 50, o.title || '손으로 쓴 멤버', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    BLK.slice(0, n).forEach(([nm, ln, d], i) => { const isNew = i === newIdx, g = isNew ? E(u, 0.2, 0.8) : 1, h = ln * LH * g; y -= h + 4; total += isNew ? ln * g : ln;
      el('rect', { x: 40, y, width: 300, height: Math.max(0, h), rx: 6, fill: isNew ? ACCBG : SOFT, stroke: isNew ? ACC : GRID, 'stroke-width': 2, opacity: o.op ?? 1 });
      if (g > 0.6) { tx(54, y + h / 2 + 5, nm, { 'font-size': 15, 'font-weight': 800, fill: isNew ? ACC : INK, opacity: o.op ?? 1 }); mono(326, y + h / 2 + 5, `${ln}줄`, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: o.op ?? 1 }); } });
    return total; }
  function pointObj(cx, cy, x, y, o) { o = o || {}; return obj(cx, cy, o.w || 200, o.head || 'Point', [[`x = ${x}`, o.col], [`y = ${y}`, o.col]], { stroke: o.stroke || INK, s: o.s }); }
  function s1(t, c) { const { k, u } = c;
    const tot = tower(k + 1, u, k), [nm, , d] = BLK[k];
    card(650, 60, 280, 50, { rx: 25, stroke: WARN, sw: 2 }); tx(530, 66, '직접 쓴 줄', { 'font-size': 15, fill: MUT, 'font-weight': 700 });
    mono(780, 68, String(Math.round(tot)), { 'font-size': 22, 'font-weight': 800, fill: WARN, 'text-anchor': 'end' });
    mono(650, 136, d, { 'font-size': 15, 'text-anchor': 'middle', fill: ACC, 'font-weight': 700, opacity: fade(u, 0.5) });
    if (k === 0) { obj(650, 260, 220, 'Point', [['x', MUT], ['y', MUT]], { s: pop(u, 0.6) }); lock(770, 230, true, INK, pop(u, 1.2)); sub(650, 340, 'final 필드 2개', fade(u, 1.3), { 'font-size': 15 }); return; }
    if (k === 1) { mono(470, 210, 'new Point(1, 2)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      fly(470, 230, 700, 254, seg(u, 0.6, 1.2), '1', { mono: true, fill: INFO }); fly(520, 230, 700, 280, seg(u, 0.9, 1.5), '2', { mono: true, fill: INFO });
      pointObj(720, 280, u > 1.2 ? 1 : '', u > 1.5 ? 2 : '', { s: pop(u, 0.4) }); sub(650, 380, '필드가 늘면 여기도 고친다', fade(u, 1.8), { fill: WARN, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 2) { pointObj(560, 270, 1, 2); [['getX()', '1', 240], ['getY()', '2', 320]].forEach(([m, v, y], i) => { grow(662, y - 6, 760, y - 6, E(u, 0.4 + i * 0.4, 0.8 + i * 0.4), ACC); chip(830, y - 6, `${m} → ${v}`, ACC, { s: pop(u, 0.8 + i * 0.4) }); });
      sub(650, 390, '필드 수만큼 늘어난다', fade(u, 1.8), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); return; }
    if (k === 3) { const a = pointObj(520, 250, 1, 2, { head: 'a : Point', w: 170 }), b = pointObj(780, 250, 1, 2, { head: 'b : Point', w: 170, s: pop(u, 0.2) });
      mono(650, 350, 'a == b', { 'font-size': 16, 'text-anchor': 'end', opacity: fade(u, 0.6) }); mono(670, 350, 'false', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      mono(650, 384, 'a.equals(b)', { 'font-size': 16, 'text-anchor': 'end', opacity: fade(u, 1.3) }); mono(670, 384, 'true', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      sub(650, 190, '다른 객체지만 값이 같다', fade(u, 1.8), { fill: ACC, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 4) { // equals 와 hashCode 짝
      const BX = (i) => 470 + i * 56; tx(470, 190, 'HashMap 칸', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
      for (let i = 0; i < 8; i++) el('rect', { x: BX(i), y: 200, width: 50, height: 40, rx: 5, fill: i === 3 ? ACCBG : PANEL, stroke: i === 3 ? ACC : GRID, 'stroke-width': 1.8 });
      chip(520, 300, 'a (1, 2)', INFO); chip(690, 300, 'b (1, 2)', INFO);
      grow(520, 284, BX(3) + 20, 244, E(u, 0.4, 0.8), ACC); grow(690, 284, BX(3) + 30, 244, E(u, 0.8, 1.2), ACC);
      sub(650, 340, '같은 값 → 같은 hashCode → 같은 칸', fade(u, 1.2), { fill: GOOD, 'font-weight': 700, 'font-size': 15 });
      sub(650, 376, '한쪽만 고치면 같은 값을 다른 칸에서 찾는다', fade(u, 1.8), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); return; }
    pointObj(560, 260, 1, 2); grow(662, 260, 720, 260, E(u, 0.3, 0.6), ACC);
    terminal(730, 220, 200, 80, ['Point[x=1, y=2]'], u > 0.7 ? 1 : 0, { title: 'toString()', fs: 14 });
    banner(650, 370, '필드 2개에 파일 30줄', pop(u, 1.4)); }

  // ---------- 2. record ----------
  function s2(t, c) { const { k, u } = c;
    const decl = (op) => jcode(380, 40, ['public record Point(int x, int y) {}'], { fs: 18, stroke: ACC, op });
    if (k === 0) { const sq = E(u, 0.4, 1.6); tower(6, 3, -1, { op: 1 - sq * 0.85, title: 'Step 1의 멤버 19줄' });
      for (let i = 0; i < 6; i++) { const f = seg(u, 0.3 + i * 0.22, 0.9 + i * 0.22); if (f > 0 && f < 1) fly(190, 360 - i * 50, 560, 120, f, BLK[i][0], { fill: ACC }); }
      decl(fade(u, 1.2)); banner(640, 240, '파일 30줄 → 선언 1줄', pop(u, 1.8));
      sub(640, 300, '필드 · 생성자 · 접근자 · equals · hashCode · toString', fade(u, 2.1), { 'font-size': 15 }); return; }
    decl(1);
    if (k === 1) { mono(140, 180, 'new Point(1, 2)', { 'font-size': 17, 'font-weight': 700 });
      fly(170, 200, 560, 230, seg(u, 0.4, 1.0), '1', { mono: true, fill: INFO }); fly(220, 200, 560, 256, seg(u, 0.6, 1.2), '2', { mono: true, fill: INFO });
      pointObj(580, 255, u > 1.0 ? 1 : '', u > 1.2 ? 2 : '', { head: 'a : Point', s: pop(u, 0.2) }); lock(700, 222, true, INK, pop(u, 1.4));
      sub(580, 340, '표준 생성자는 컴포넌트 순서대로 받는다', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 2) { pointObj(330, 250, 1, 2, { head: 'a : Point' });
      [['a.x()', '1', 236], ['a.y()', '2', 262]].forEach(([m, v, y], i) => { grow(432, y, 560, y, E(u, 0.3 + i * 0.4, 0.7 + i * 0.4), ACC); chip(620, y, `${m} → ${v}`, ACC, { s: pop(u, 0.7 + i * 0.4) }); });
      mono(560, 340, 'a.getX()', { 'font-size': 16, fill: OFF, opacity: fade(u, 1.5), 'text-decoration': 'line-through' }); cross(660, 334, 8, pop(u, 1.6));
      sub(560, 380, '컴포넌트 이름이 곧 메서드 이름', fade(u, 1.9), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    if (k === 3) { pointObj(300, 230, 1, 2, { head: 'a : Point', w: 180 }); pointObj(620, 230, 1, 2, { head: 'b : Point', w: 180, s: pop(u, 0.2) });
      mono(460, 340, 'a.equals(b)', { 'font-size': 16, 'text-anchor': 'end', opacity: fade(u, 0.6) }); mono(480, 340, 'true', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) });
      mono(460, 376, 'a.hashCode() == b.hashCode()', { 'font-size': 16, 'text-anchor': 'end', opacity: fade(u, 1.3) }); mono(480, 376, 'true', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      sub(800, 230, '자동이라 어긋날 일이 없다', fade(u, 1.9), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    if (k === 4) { pointObj(330, 250, 1, 2, { head: 'a : Point' }); grow(432, 250, 520, 250, E(u, 0.3, 0.6), ACC);
      terminal(530, 200, 260, 90, ['Point[x=1, y=2]'], u > 0.7 ? 1 : 0, { title: 'a.toString()', fs: 16 });
      sub(560, 340, '이름과 값이 함께 찍힌다', fade(u, 1.2), { 'font-size': 15 }); return; }
    // k5: HashSet
    const BX = (i) => 300 + i * 60; tx(300, 150, 'HashSet<Point> 칸', { 'font-size': 14.5, fill: MUT, 'font-weight': 700 });
    for (let i = 0; i < 8; i++) el('rect', { x: BX(i), y: 162, width: 54, height: 44, rx: 5, fill: i === 5 && u > 0.8 ? ACCBG : PANEL, stroke: i === 5 && u > 0.8 ? ACC : GRID, 'stroke-width': 1.8 });
    if (u > 0.8) mono(BX(5) + 27, 190, 'a', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    chip(160, 184, 'set.add(a)', INFO); fly(220, 184, BX(5) + 27, 184, seg(u, 0.3, 0.8), 'a', { mono: true });
    chip(160, 300, 'set.contains(b)', INFO, { op: fade(u, 1.0) }); fly(240, 300, BX(5) + 27, 214, seg(u, 1.1, 1.6), 'b', { mono: true, fill: INFO });
    if (u > 1.6) { mono(BX(5) + 27, 250, 'equals', { 'font-size': 14, 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 }); check(BX(5) + 70, 244, 8, 1); }
    pill(560, 320, 'has → true', GOOD, pop(u, 2.0), { mono: true }); sub(560, 370, '칸 번호는 예시, 같은 값이면 같은 칸으로 간다', fade(u, 2.2)); }

  // ---------- 3. 컴팩트 생성자 ----------
  function gate(cx, cy, label, st) { // st: 'idle' | 'ok' | 'bad'
    const col = st === 'bad' ? BAD : st === 'ok' ? GOOD : INK;
    el('rect', { x: cx - 10, y: cy - 70, width: 20, height: 140, rx: 4, fill: col, opacity: 0.85 });
    card(cx, cy - 92, tw(label, 14) + 24, 30, { rx: 8, text: label, mono: true, fs: 14, stroke: col, color: col }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) jcode(40, 30, ['public record Range(int lo, int hi) {', '  public Range { … }   // 파라미터 목록 없음'], { fs: 15, hl: (i) => (i === 1 && k === 0 ? 'hl' : null) });
    if (k === 0) { gate(480, 260, '검사 자리', 'idle'); sub(480, 360, '컴팩트 생성자 = 필드 대입 직전의 검문소', fade(u, 0.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      chip(220, 260, '(lo, hi)', INFO, { s: pop(u, 0.9) }); obj(760, 260, 180, 'Range', [['lo', MUT], ['hi', MUT]], { s: pop(u, 1.2) });
      note(40, 404, 'this.lo = lo 같은 대입은 적지 않는다', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 1) { gate(480, 260, 'if (lo > hi) throw', 'bad'); chip(220, 230, '(8, 3)', BAD); fly(220, 270, 455, 270, seg(u, 0.4, 1.0), '(8, 3)', { mono: true, fill: BAD });
      if (u > 1.0) cross(440, 270, 12, pop(u, 1.0)); obj(760, 260, 180, 'Range', [['lo', MUT], ['hi', MUT]], { stroke: OFF });
      terminal(300, 340, 480, 70, [['IllegalArgumentException: lo > hi: 8 > 3', '#fca5a5']], u > 1.4 ? 1 : 0, { fs: 13.5 }); return; }
    if (k === 2) { gate(480, 260, 'if (lo > hi) throw', 'ok'); chip(220, 230, '(3, 8)', INFO);
      fly(220, 270, 690, 270, seg(u, 0.3, 1.2), '(3, 8)', { mono: true, fill: INFO });
      obj(760, 260, 180, 'Range', [[`lo = ${u > 1.2 ? 3 : ''}`, ACC], [`hi = ${u > 1.4 ? 8 : ''}`, ACC]], { stroke: ACC }); lock(870, 222, true, ACC, pop(u, 1.6));
      sub(600, 360, '통과하면 컴파일러가 붙인 대입이 실행되고, 그 뒤로 값은 바뀌지 않는다', fade(u, 1.8), { 'font-size': 14.5 }); return; }
    if (k === 3) { gate(480, 220, 'if (lo > hi) throw', 'idle');
      fly(200, 200, 690, 200, seg(u, 0.3, 1.1), '(3, 8)', { mono: true, fill: INFO }); obj(780, 200, 200, 'ok : Range', [['lo = 3', ACC], ['hi = 8', ACC]], { stroke: ACC, s: pop(u, 1.1) });
      chip(780, 290, 'ok.length() → 5', GOOD, { s: pop(u, 1.4) });
      fly(200, 250, 455, 250, seg(u, 0.9, 1.6), '(8, 3)', { mono: true, fill: BAD }); if (u > 1.6) cross(440, 250, 12, pop(u, 1.6));
      sub(300, 340, 'bad는 만들어지지도 않는다', fade(u, 1.9), { fill: BAD, 'font-weight': 700, 'font-size': 15 });
      note(40, 404, '불변식이 생성 지점 한 곳에 모인다', fade(u, 2.3), { fill: ACC }); return; }
    jcode(40, 30, ['public record User(String name) {', '  public User { name = name.trim(); }', '}'], { fs: 15, hl: (i) => (i === 1 ? 'hl' : null) });
    gate(480, 270, 'name = name.trim()', 'ok');
    const f = k === 4 ? seg(u, 0.3, 1.4) : 1, p = lerp(200, 690, E(f, 0, 1)), s = p < 480 ? '"  amy "' : '"amy"';
    if (k === 4 && f > 0 && f < 1) chip(p, 270, s, p < 480 ? INFO : ACC);
    if (k === 4) chip(200, 220, 'new User("  amy ")', INFO);
    obj(770, 270, 200, 'User', [[`name = ${f >= 1 ? '"amy"' : ''}`, ACC]], { stroke: ACC });
    if (k === 4) { sub(480, 380, '파라미터에 다시 대입하면 그 값이 필드에 저장된다', fade(u, 1.6), { 'font-size': 15 }); return; }
    terminal(560, 340, 370, 76, [['> new User("  amy ").name()', null], ['"amy"', null]], lerp(0, 2, E(u, 0.3, 1.2)), { fs: 14, lh: 18 });
    note(40, 400, '정규화도 생성 시 한 번, 한 곳에서', fade(u, 1.6), { fill: ACC }); }

  // ---------- 4. 얕은 불변 ----------
  function listObj(cx, cy, vals, o) { o = o || {}; const w = Math.max(220, vals.length * 72 + 30), h = 84, col = o.stroke || INK;
    card(cx, cy, w, h, { rx: 10, stroke: col, sw: 2.2, fill: o.fill || PANEL, s: o.s });
    mono(cx - w / 2 + 12, cy - h / 2 + 20, o.head || 'ArrayList', { 'font-size': 14, 'font-weight': 800, fill: col });
    cells(cx - w / 2 + 14, cy - 10, vals, { w: 64, h: 36, gap: 6, fs: 14, style: (i) => (o.hot && o.hot(i) ? { stroke: BAD, color: BAD, fill: BADBG } : {}) });
    return { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2 }; }
  function s4(t, c) { const { k, u } = c; heapZones(250, 940);
    if (k === 0) { const r = obj(470, 150, 270, 'TeamBad (record)', [['final members', INK]], { s: pop(u, 0.2) }); lock(590, 116, true, INK, pop(u, 0.6));
      const L = listObj(640, 310, ['…'], { s: pop(u, 0.8) }); arc(r.r - 40, 162, L.l + 40, L.t, E(u, 1.0, 1.5), INK, { bend: -0.15 });
      note(270, 400, '참조는 final이지만 가리키는 리스트는 바꿀 수 있다', fade(u, 1.8), { fill: WARN }); return; }
    const fr = frame(30, 70, 210, 'main()', k <= 2 ? [['src', null], ['t1', null]] : [['src', null], ['t1', null], ['t2', null, { col: ACC }]]);
    if (k <= 2) { const vals = k === 1 ? ['amy', 'bob'] : u < 0.6 ? ['amy', 'bob'] : u < 1.6 ? ['amy', 'bob', 'eve'] : ['amy', 'bob', 'eve', 'mallory'];
      const r = obj(400, 300, 230, 't1 : TeamBad', [['members', INK]]), L = listObj(690, 140, vals, { hot: (i) => k === 2 && i >= 2, stroke: k === 2 ? BAD : INK });
      arc(fr[0].x, fr[0].y, L.l, 140, k === 1 ? E(u, 0.2, 0.7) : 1, INK, { bend: -0.08 });
      arc(fr[1].x, fr[1].y, r.l, 300, k === 1 ? E(u, 0.6, 1.0) : 1, INK, { bend: 0.1 });
      arc(r.r - 30, r.t + 50, L.l + 40, L.b, k === 1 ? E(u, 1.0, 1.5) : 1, k === 2 ? BAD : INK, { bend: -0.2 });
      if (k === 1) { sub(690, 230, '같은 ArrayList 하나를 둘이 가리킨다', fade(u, 1.6), { fill: WARN, 'font-weight': 700, 'font-size': 15 }); return; }
      chip(400, 100, 'src.add("eve")', BAD, { op: fade(u, 0.3) }); chip(690, 400, 't1.members().add("mallory")', BAD, { op: fade(u, 1.2) });
      sub(690, 230, '바깥에서도, 접근자로 받은 쪽에서도 바뀐다', fade(u, 2.0), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); return; }
    // k3~5: copyOf
    const base = ['amy', 'bob', 'eve', 'mallory'], orig = k >= 4 && (k > 4 || u > 0.8) ? [...base, 'trudy'] : base;
    const L = listObj(640, 110, orig, { head: 'ArrayList (src)', hot: (i) => i === 4 }), C2 = listObj(640, 300, base, { head: 'List.copyOf → 불변 복사본', stroke: ACC, fill: ACCBG, s: k === 3 ? pop(u, 0.8) : 1 });
    arc(fr[0].x, fr[0].y, L.l, 110, 1, INK, { bend: -0.08 });
    arc(fr[2].x, fr[2].y, C2.l, 300, k === 3 ? E(u, 1.2, 1.7) : 1, ACC, { bend: 0.1 });
    if (k === 3) { fly(640, 160, 640, 262, seg(u, 0.3, 0.8), '복사', { fill: ACC }); sub(380, 400, '컴팩트 생성자에서 참조를 끊는다', fade(u, 1.8), { fill: ACC, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 4) { chip(380, 200, 'src.add("trudy")', INFO, { op: fade(u, 0.3) }); sub(640, 390, 't2는 생성 당시 스냅샷 그대로', fade(u, 1.4), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); return; }
    lock(C2.r - 20, C2.t + 4, true, ACC, 1); fly(380, 400, C2.r - 40, 320, seg(u, 0.3, 0.9), 'add("x")', { mono: true, fill: BAD });
    if (u > 0.9) burst(C2.r - 40, 320, pop(u, 0.9));
    terminal(270, 340, 380, 66, [['UnsupportedOperationException', '#fca5a5']], u > 1.2 ? 1 : 0, { fs: 14 }); }

  // ---------- 5. sealed ----------
  const SUBS = [['Circle', 'record Circle(double r)', 190], ['Square', 'record Square(double s)', 480], ['Triangle', 'record Triangle(double b, double h)', 770]];
  function sealedTop(u0) { card(480, 70, 460, 66, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG });
    mono(480, 64, 'sealed interface Shape', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    mono(480, 88, 'permits Circle, Square, Triangle', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: u0 }); }
  function subSlot(i, filled, s) { const [n, f, x] = SUBS[i]; grow(480, 104, x, 196, 1, filled ? ACC : GRID, { plain: !filled });
    if (!filled) { card(x, 230, 240, 64, { rx: 10, stroke: GRID, sw: 2, dash: '7 5', text: n + ' 자리', fs: 15, color: MUT }); return; }
    card(x, 230, 260, 64, { rx: 10, stroke: INK, sw: 2.2, s }); if (s < 0.5) return;
    mono(x, 224, f, { 'font-size': i === 2 ? 13.5 : 14.5, 'text-anchor': 'middle', 'font-weight': 700 }); sub(x, 248, 'implements Shape · 자동 final', 1, { fill: GOOD }); }
  function s5(t, c) { const { k, u } = c;
    sealedTop(k === 0 ? fade(u, 0.5) : 1);
    SUBS.forEach((_, i) => subSlot(i, (k >= 1 && i === 0) || (k >= 2), k === 1 && i === 0 ? pop(u, 0.3) : k === 2 && i > 0 ? pop(u, 0.3 + (i - 1) * 0.4) : 1));
    if (k === 0) { sub(480, 320, '이 타입이 될 수 있는 것은 목록의 셋뿐', fade(u, 1.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { sub(190, 300, 'record는 자동 final이라 계층을 더 열지 않는다', fade(u, 1.0), { 'font-size': 14.5, 'text-anchor': 'start', fill: ACC }); return; }
    if (k === 2) { sub(480, 320, 'permits 목록이 모두 채워졌다', fade(u, 1.4), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    if (k === 3) { card(820, 350, 240, 50, { rx: 10, stroke: BAD, sw: 2.2, dash: '6 4', text: 'record Hexagon(double s)', mono: true, fs: 14, color: BAD, s: pop(u, 0.2) });
      grow(700, 345, 600, 300, E(u, 0.8, 1.1), BAD); if (u > 1.1) cross(650, 322, 11, pop(u, 1.1));
      terminal(40, 320, 540, 84, [['error: class is not allowed to extend', '#fca5a5'], ['  sealed class: Shape', '#fca5a5']], u < 1.4 ? 0 : lerp(1, 2, E(u, 1.4, 2.0)), { fs: 13.5, lh: 18 }); return; }
    zone(30, 290, 260, 120, '스택', { fill: SOFT }); const fr = frame(44, 320, 232, 'main()', [['s : Shape', null]]);
    arc(fr[0].x, fr[0].y, 190, 262, E(u, 0.3, 0.8), ACC, { bend: -0.3 });
    mono(330, 360, 's = new Circle(2.0)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
    sub(600, 390, 'Shape 변수에 담기는 값은 언제나 이 셋 중 하나', fade(u, 1.2), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }

  // ---------- 6. switch 패턴매칭 ----------
  const CASES = [['case Circle(double r)', 'PI * r * r'], ['case Square(double s)', 's * s'], ['case Triangle(double b, double h)', 'b * h / 2.0']];
  function sw(n, o) { o = o || {}; el('rect', { x: 40, y: 50, width: 560, height: 300, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    mono(60, 80, 'static double area(Shape shape) {', { 'font-size': 15, 'font-weight': 700 }); mono(76, 108, 'return switch (shape) {', { 'font-size': 15 });
    CASES.forEach(([p, e], i) => { const y = 148 + i * 56, on = i < n && !(o.miss === i), s = o.pop && o.pop(i) != null ? o.pop(i) : 1;
      el('rect', { x: 70, y: y - 22, width: 510, height: 44, rx: 8, fill: on ? ACCBG : o.miss === i ? BADBG : SOFT, stroke: on ? ACC : o.miss === i ? BAD : GRID, 'stroke-width': 2, 'stroke-dasharray': on ? null : '6 4' });
      if (on && s > 0.3) mono(84, y + 5, `${p} -> ${e};`, { 'font-size': i === 2 ? 13.5 : 14, fill: INK, opacity: clamp(s) });
      if (o.miss === i) mono(84, y + 5, '(Triangle 경우가 빠짐)', { 'font-size': 14, fill: BAD, 'font-weight': 700 }); });
    mono(76, 330, '};', { 'font-size': 15 });
    const cov = n - (o.miss != null ? 1 : 0); card(780, 100, 220, 70, { rx: 12, stroke: cov === 3 ? GOOD : BAD, sw: 2.4 });
    tx(780, 88, '다룬 경우', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(780, 118, `${cov} / 3`, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: cov === 3 ? GOOD : BAD }); }
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { sw(0); sub(780, 200, '아직 어떤 경우도 다루지 않았다', fade(u, 0.6), { 'font-size': 14.5 }); return; }
    if (k === 1) { sw(1, { pop: (i) => (i === 0 ? pop(u, 0.2) : null) });
      obj(780, 260, 200, 'Circle', [['r = 2.0', ACC]], { s: pop(u, 0.6) }); fly(690, 268, 470, 204, seg(u, 1.0, 1.6), 'r = 2.0', { mono: true, fill: ACC });
      sub(780, 340, '매칭하면서 r을 꺼낸다', fade(u, 1.6), { fill: ACC, 'font-weight': 700, 'font-size': 15 });
      sub(780, 368, 'record 패턴은 Java 21부터', fade(u, 2.0), { 'font-size': 14 }); return; }
    if (k === 2 || k === 3) { sw(3, { pop: (i) => (k === 2 && i > 0 ? pop(u, 0.3 + (i - 1) * 0.4) : null) });
      if (k === 2) { sub(780, 210, 'sealed 계층의 모든 경우', fade(u, 1.2), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); return; }
      el('rect', { x: 70, y: 280, width: 510, height: 36, rx: 8, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.3) });
      mono(84, 304, 'default -> …', { 'font-size': 14, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 0.3) }); cross(240, 298, 8, pop(u, 0.6));
      sub(780, 210, '빠진 경우가 없어', fade(u, 1.0), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); sub(780, 236, 'default 없이 성립', fade(u, 1.1), { fill: GOOD, 'font-weight': 700, 'font-size': 15 }); return; }
    if (k === 4) { sw(3); const R3 = [['Circle(2.0)', '12.566…'], ['Square(3.0)', '9.0'], ['Triangle(4, 5)', '10.0']];
      R3.forEach(([a, r], i) => { const y = 148 + i * 56, t0 = 0.3 + i * 0.6; fly(800, 220 + i * 56, 590, y, seg(u, t0, t0 + 0.4), a, { mono: true, fill: INFO });
        if (u > t0 + 0.4) chip(820, 220 + i * 56, `area → ${r}`, ACC, { s: pop(u, t0 + 0.4) }); });
      return; }
    sw(3, { miss: 2 });
    terminal(40, 352, 560, 66, [['error: the switch expression does not cover all possible input values', '#fca5a5']], u > 0.8 ? 1 : 0, { fs: 13.5 });
    sub(780, 210, '새 도형을 추가해도 같다', fade(u, 1.4), { fill: BAD, 'font-weight': 700, 'font-size': 15 });
    sub(780, 236, '고칠 곳을 컴파일러가 짚는다', fade(u, 1.6), { fill: BAD, 'font-weight': 700, 'font-size': 15 }); }

  const quiz = [
    { q: 'equals는 고치고 hashCode는 그대로 두면 어떤 일이 생기는가?',
      o: ['컴파일 에러가 난다', '값이 같은 객체를 HashMap에서 못 찾을 수 있다', 'toString 결과가 달라진다'], a: 1,
      why: '같은 값이면 hashCode도 같아야 같은 칸에서 찾는다. Point처럼 손으로 쓰면 둘이 어긋나도 컴파일러가 잡아 주지 않는다.' },
    { q: 'record Point(int x, int y)에서 x 값을 읽는 접근자는 무엇인가?',
      o: ['p.getX()', 'p.x', 'p.x()'], a: 2,
      why: 'record 접근자는 컴포넌트 이름 그대로인 x()다. 필드는 private final이라 p.x로 바깥에서 직접 읽지 않는다.' },
    { q: '컴팩트 생성자 public Range { … }에 적는 것은 무엇인가?',
      o: ['검증과 정규화만 적고 필드 대입은 적지 않는다', 'this.lo = lo 대입을 반드시 적는다', '파라미터 목록 (int lo, int hi)를 다시 적는다'], a: 0,
      why: '컴팩트 생성자는 파라미터 목록과 대입을 생략한다. new Range(8, 3)은 검사에서 예외로 끝나고 통과한 값만 필드에 들어간다.' },
    { q: 'record TeamBad(List<String> members)에 바깥 ArrayList를 넘기면 무엇이 문제인가?',
      o: ['record 안팎이 같은 리스트 객체를 가리켜 내용이 바뀔 수 있다', 'record에는 List를 담을 수 없다', '리스트가 자동으로 복사돼 메모리가 두 배가 된다'], a: 0,
      why: 'record의 불변은 참조만 고정하는 얕은 불변이다. 컴팩트 생성자에서 List.copyOf로 복사해야 참조가 끊긴다.' },
    { q: 'sealed interface Shape permits Circle, Square, Triangle에 Hexagon이 implements Shape를 시도하면 어떻게 되는가?',
      o: ['실행 중에 예외가 난다', '컴파일 에러가 난다', 'Hexagon이 permits 목록에 자동으로 추가된다'], a: 1,
      why: 'permits 목록 밖의 타입은 그 sealed 타입을 구현할 수 없다. 계층에 들어올 수 있는 타입을 컴파일 단계에서 막는다.' },
    { q: 'sealed Shape의 세 하위타입을 모두 case로 다룬 switch 식에 default가 없어도 되는 까닭은 무엇인가?',
      o: ['switch 식은 원래 default를 쓰지 않아서', '실행 중에 빠진 경우가 오면 0을 돌려줘서', '컴파일러가 가능한 경우가 셋뿐임을 알아 빠짐없음을 확인해서'], a: 2,
      why: 'sealed 계층이라 컴파일러가 모든 경우를 안다. 한 case라도 빠지면 "does not cover all possible input values" 에러가 난다.' },
  ];

  const summary = [
    '값 두 개를 담는 클래스를 손으로 쓰면 30줄이 되고, equals와 hashCode가 어긋나기 쉽다.',
    'record 한 줄이 생성자, x() 같은 접근자, equals와 hashCode, toString을 만들어 준다.',
    '검증과 정규화는 컴팩트 생성자 한 곳에 두고, 가변 리스트는 List.copyOf로 복사해 담는다.',
    'sealed로 하위타입을 못 박으면 switch가 모든 경우를 다뤘는지 컴파일러가 확인한다.',
  ];
  const review = [
    { q: 'record로 만든 Team의 멤버 목록이 생성 뒤에도 바뀌었다. 먼저 확인할 것은?',
      o: ['컴팩트 생성자에서 List.copyOf로 복사했는지', 'record에 final을 붙였는지', 'toString을 다시 정의했는지'], a: 0,
      why: 'record는 얕은 불변이라 넘겨받은 ArrayList를 그대로 담으면 밖에서 add한 것이 보인다. copyOf로 불변 복사본을 담으면 생성 당시 내용이 유지된다.' },
    { q: 'Shape에 Hexagon을 추가하기로 했다. permits에 넣은 뒤 컴파일러가 알려 주는 곳은?',
      o: ['Hexagon을 new 하는 모든 곳', 'Shape를 다루는 switch 가운데 Hexagon case가 없는 곳', 'Shape를 import하는 모든 파일'], a: 1,
      why: 'sealed 계층의 switch는 빠짐없음 검사를 받는다. default 없이 쓴 switch마다 새 경우를 다루라는 컴파일 에러가 난다.' },
    { q: 'new Range(8, 3)을 막고 싶다. 알맞은 자리는?',
      o: ['Range를 쓰는 모든 메서드 앞', 'length() 안', 'Range의 컴팩트 생성자'], a: 2,
      why: '생성 지점 한 곳에서 lo > hi를 예외로 막으면 이후 만들어진 Range는 언제나 유효하다. 받는 쪽마다 검사할 필요가 없다.' },
  ];

  R.page({ title: 'record와 sealed', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
