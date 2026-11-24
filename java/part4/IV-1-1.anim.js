/* IV-1-1 람다·함수형 인터페이스 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 추상 메서드 칸이 하나뿐인 인터페이스, 껍데기가 벗겨지는 익명 클래스, 스택 지역변수와 힙의 람다 객체(캡처한 값),
 *       입력·출력 단자가 다른 함수형 인터페이스 기계, 메서드 참조 정거장을 지나는 원소, 람다와 익명 객체의 this 화살표. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, terminal, hbar } = R;
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

  // ---------- 1. 함수형 인터페이스 ----------
  function greeter(x, y, extraU, o) { o = o || {}; const bad = extraU > 0, w = 320, h = 140 + 44 * clamp(extraU * 1.5);
    el('rect', { x, y, width: w, height: h, rx: 12, fill: PANEL, stroke: bad ? BAD : INK, 'stroke-width': 2.5 });
    mono(x + 16, y + 28, '@FunctionalInterface', { 'font-size': 14.5, 'font-weight': 700, fill: bad ? BAD : WARN });
    mono(x + 16, y + 54, 'interface Greeter {', { 'font-size': 15.5, 'font-weight': 800 });
    const plug = o.plug || 0;
    el('rect', { x: x + 22, y: y + 66, width: w - 44, height: 36, rx: 7, fill: plug > 0 ? ACCBG : SOFT, stroke: plug > 0 ? ACC : MUT, 'stroke-width': 2, 'stroke-dasharray': plug > 0 ? null : '6 4' });
    if (plug > 0) mono(x + 34, y + 89, 'name -> "Hello, " + name', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: plug });
    else mono(x + 34, y + 89, 'String greet(String name);', { 'font-size': 14.5 });
    if (bad) { const ox = lerp(260, 0, E(extraU, 0, 1));
      el('rect', { x: x + 22 + ox, y: y + 110, width: w - 44, height: 36, rx: 7, fill: BADBG, stroke: BAD, 'stroke-width': 2, opacity: clamp(extraU * 2) });
      mono(x + 34 + ox, y + 133, 'void extra();', { 'font-size': 14.5, fill: BAD, opacity: clamp(extraU * 2) }); }
    mono(x + 16, y + h - 14, '}', { 'font-size': 15.5, 'font-weight': 800 });
    return { slotY: y + 84, r: x + w }; }
  const ANON = ['Greeter g1 = new Greeter() {', '  @Override public String greet(String name) {', '    return "Hello, " + name;', '  }', '};'];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const wv = E(u, 0.1, 0.9);
      greeter(40, 70, 0);
      if (wv < 1) el('rect', { x: 30, y: 60 + 160 * wv, width: 340, height: 162 - 160 * wv, fill: PANEL });
      pill(200, 250, '추상 메서드 1개', GOOD, pop(u, 0.9));
      sub(200, 290, '구현할 메서드가 하나로 정해진다', fade(u, 1.2), { 'font-size': 14.5 });
      const cd = jcode(470, 130, ['Greeter g = ???;'], { fs: 22, op: fade(u, 1.4) });
      arc(362, 154, 466, 156, E(u, 1.6, 2.3), ACC, { bend: -0.2, nodot: true });
      sub(cd.x + cd.w / 2, 220, '이 칸을 채울 구현은 아직 없다', fade(u, 2.0), { 'font-size': 14.5 });
      return; }
    if (k === 1) { const eu = E(u, 0.2, 1.0);
      greeter(40, 70, eu);
      pill(200, 300, '추상 메서드 2개: 어느 쪽을 구현?', BAD, pop(u, 1.0));
      terminal(420, 80, 510, 150, [['$ javac LambdaIntro.java', null], ['error: Unexpected @FunctionalInterface', '#fca5a5'], ['  annotation', '#fca5a5'], ['  Greeter is not a functional interface', '#fca5a5']], u < 1.2 ? 0 : lerp(1, 4, E(u, 1.2, 2.4)), { title: 'javac', fs: 13.5 });
      note(420, 280, '실행 전에 빌드가 멈춘다', fade(u, 2.3), { fill: BAD });
      return; }
    if (k <= 3) greeter(40, 70, 0, { plug: k === 3 ? E(u, 2.0, 2.5) : 0 });
    if (k === 2) { const cd = jcode(400, 70, ANON, { show: lerp(0, 5, E(u, 0.2, 1.6)), hl: (i) => (i === 2 && u > 1.6 ? 'hl' : null) });
      arc(362, 154, 400, cd.cy(1), E(u, 1.0, 1.5), MUT, { bend: 0.15, nodot: true });
      cells(400, 240, ['', '', '로직', '', ''], { w: 72, h: 40, gap: 6, fs: 14, mono: false, style: (i) => (seg(u, 1.8 + i * 0.12, 2.0 + i * 0.12) <= 0 ? { op: 0 } : i === 2 ? { stroke: ACC, fill: ACCBG, color: ACC } : { stroke: GRID, fill: SOFT }) });
      note(400, 312, '5줄 가운데 하는 일은 return 1줄', fade(u, 2.3));
      return; }
    if (k === 3) { const cd = jcode(400, 70, ANON, { hl: (i) => (i === 2 ? 'hl' : 'dim') });
      [[0, 13, 15], [1, 2, 45], [3, 2, 1], [4, 0, 2]].forEach(([ln, c0, n], i) => strike(cd.cx(c0), cd.cy(ln), n * 14.5 * 0.55, E(u, 0.3 + i * 0.25, 0.6 + i * 0.25)));
      const lam = jcode(400, 232, ['Greeter g2 = name -> "Hello, " + name;'], { stroke: ACC, show: u < 1.4 ? 0 : E(u, 1.4, 2.2) });
      [['new Greeter() { }', '좌변 타입이 알려 준다'], ['@Override greet', '메서드가 하나뿐이다'], ['String name', '시그니처에서 추론한다']].forEach(([a, b], i) => { const op = fade(u, 0.4 + i * 0.35);
        mono(40, 262 + i * 36, a, { 'font-size': 14, fill: MUT, opacity: op, 'text-decoration': 'line-through' }); tx(200, 262 + i * 36, b, { 'font-size': 14.5, opacity: op }); });
      pill(560, 330, '5줄 → 1줄, 같은 동작', ACC, pop(u, 2.3));
      return; }
    // k4: 두 객체 비교 (힙)
    heapZones(280, 690);
    const fr = frame(36, 90, 230, 'main()', [['g1', null], ['g2', null]]);
    const o1 = obj(485, 130, 330, 'LambdaIntro$1', [['익명 클래스 · .class 파일이 따로', MUT]]);
    const o2 = obj(485, 270, 330, '람다 객체 (Greeter)', [['실행 중에 JVM이 만든다', MUT]]);
    arc(fr[0].x, fr[0].y, o1.l, 130, E(u, 0.2, 0.8), INK, { bend: -0.08 });
    arc(fr[1].x, fr[1].y, o2.l, 270, E(u, 0.4, 1.0), ACC, { bend: 0.08 });
    terminal(704, 80, 236, 160, ['> g1.greet("Java")', ['Hello, Java', null], '> g2.greet("Java")', ['Hello, Java', null]], u < 1.0 ? 0 : lerp(1, 4, E(u, 1.0, 2.3)), { title: '출력', fs: 13.5 });
    dot([[o1.r, 130], [704, 150]], seg(u, 1.0, 1.5), INK, 6); dot([[o2.r, 270], [704, 200]], seg(u, 1.7, 2.2), ACC, 6);
    pill(815, 300, '출력이 같다', GOOD, pop(u, 2.4));
    sub(480, 384, '바뀐 것은 코드 길이와 객체를 만드는 방식뿐이다', fade(u, 2.5), { 'font-size': 14.5 }); }

  // ---------- 2. 문법과 캡처 ----------
  const FORMS = [['() -> expr', '파라미터 없음'], ['x -> x * 2', '1개면 괄호 생략'], ['(a, b) -> a + b', '2개 이상은 괄호 필수'], ['(a, b) -> { …; return r; }', '블록이면 { }와 return']];
  function forms(n, u, from) { FORMS.slice(0, n).forEach(([s, nt], i) => { const cx = i % 2 ? 710 : 250, cy = i < 2 ? 286 : 352, sc = i >= from ? pop(u, 1.6 + (i - from) * 0.3) : 1;
      card(cx, cy, 430, 54, { rx: 10, stroke: i >= from ? ACC : GRID, sw: 2, s: sc });
      if (sc > 0.3) { mono(cx - 200, cy + 6, s, { 'font-size': 15, 'font-weight': 700 }); tx(cx + 200, cy + 6, nt, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); } }); }
  function machine(cx, cy, name, body, u, a, b, r) {
    card(cx, cy, 300, 92, { rx: 12, stroke: ACC, sw: 2.4, s: pop(u, 0.2) });
    mono(cx, cy - 12, name, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
    mono(cx, cy + 18, body, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    fly(cx - 40, 60, cx - 20, cy - 40, seg(u, 0.7, 1.3), a, { mono: true, fill: INFO }); fly(cx + 40, 60, cx + 20, cy - 40, seg(u, 0.8, 1.4), b, { mono: true, fill: INFO });
    if (u < 0.7) { pill(cx - 40, 60, a, INFO, 1, { mono: true }); pill(cx + 40, 60, b, INFO, 1, { mono: true }); }
    fly(cx, cy + 40, cx, 290, seg(u, 1.5, 2.1), r, { mono: true, stay: true }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { const fs = 32, cw = fs * 0.55, x0 = 480 - 15 * cw / 2, y = 112, s = pop(u, 0.2);
      spans(x0, y, [['(a, b)', { fill: INFO, 'font-weight': 700 }], [' -> ', { fill: MUT, 'font-weight': 700 }], ['a + b', { fill: ACC, 'font-weight': 700 }]], { 'font-size': fs, opacity: s });
      [[0, 6, INFO, '파라미터'], [6.6, 9.4, MUT, '화살표'], [10, 15, ACC, '본문 (식 하나)']].forEach(([a, b, col, s2], i) => { const g = E(u, 0.6 + i * 0.35, 1.0 + i * 0.35), xa = x0 + a * cw, xb = x0 + b * cw;
        if (g > 0) el('path', { d: `M${xa},126 V136 H${lerp(xa, xb, g)}${g >= 1 ? ' V126' : ''}`, fill: 'none', stroke: col, 'stroke-width': 2.4 });
        tx((xa + xb) / 2, 162, s2, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.35) }); });
      note(480, 210, '식 하나면 그 값이 곧 반환값이라 return도 { }도 없다', fade(u, 1.4), { 'text-anchor': 'middle', 'font-weight': 500, fill: MUT });
      forms(2, u, 0); return; }
    if (k === 1) { const cd = jcode(300, 36, ['(a, b) -> {', '  int m = Math.max(a, b);', '  return m;', '}'], { fs: 17 });
      [[0, 10, 1], [2, 2, 6], [3, 0, 1]].forEach(([ln, c0, n], i) => { const s = pop(u, 0.4 + i * 0.3); if (s <= 0) return;
        el('rect', { x: cd.cx(c0) - 3, y: cd.cy(ln) - 14, width: n * 17 * 0.55 + 6, height: 26, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: clamp(s) }); });
      note(cd.x + cd.w + 24, 92, '여러 줄이면', fade(u, 1.0), { fill: ACC }); note(cd.x + cd.w + 24, 118, '{ }와 return을 쓴다', fade(u, 1.1), { fill: ACC });
      note(cd.x + cd.w + 24, 150, 'return을 빼면 컴파일 에러', fade(u, 1.4), { 'font-size': 14, 'font-weight': 500, fill: BAD });
      forms(4, u, 2); return; }
    if (k === 2) { sub(480, 30, 'BinaryOperator<Integer> · 둘 다 apply(2, 3)으로 부른다', fade(u, 0.1), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      machine(270, 190, 'add', '(a, b) -> a + b', u, '2', '3', '5');
      machine(690, 190, 'maxOp', '(a, b) -> { … return m; }', u, '2', '3', '3');
      if (u > 2.1) { note(270, 330, 'add = 5', 1, { 'text-anchor': 'middle', fill: ACC }); note(690, 330, 'maxOp = 3', 1, { 'text-anchor': 'middle', fill: ACC }); }
      banner(480, 380, '모양은 달라도 부르는 메서드는 apply 하나', pop(u, 2.4)); return; }
    // k3~5: 스택과 힙
    heapZones(330, 940);
    const rows = [['nums', null], ['factor', k === 4 && u > 0.6 ? '20 ?' : '10', k === 4 && u > 0.6 ? { col: BAD, bg: BADBG } : {}]];
    if (k === 5) rows.push(['cnt', null, { col: ACC }]);
    const fr = frame(34, 70, 284, 'main()', rows);
    tx(470, 64, 'List.of(1, 2, 3)', { 'font-size': 14, fill: MUT, class: 'mono' });
    cells(470, 74, [1, 2, 3], { w: 48, h: 40, gap: 6 });
    arc(fr[0].x, fr[0].y, 466, 94, k === 3 ? E(u, 0.2, 0.7) : 1, INK, { bend: -0.1 });
    if (k < 5) { const lo = obj(560, 250, 300, 'n -> n * factor', [['factor = 10  (복사본)', ACC]], { stroke: ACC, s: k === 3 ? pop(u, 0.5) : 1 });
      arc(fr[1].r - 8, fr[1].y, lo.l, 262, k === 3 ? E(u, 0.9, 1.4) : 1, ACC, { bend: 0.15, dash: '6 5' });
      if (k === 3) sub(370 + 40, 196, '값을 복사', fade(u, 1.3), { fill: ACC, 'font-weight': 700 });
      if (k === 3) { const outs = ['10', '20', '30'];
        [0, 1, 2].forEach((i) => { const a = seg(u, 1.4 + i * 0.35, 1.85 + i * 0.35); dot([[494 + i * 54, 118], [560, 220], [lo.r, 250], [790, 250]], a, INFO, 7); });
        terminal(780, 120, 150, 150, outs, u < 1.85 ? 0 : lerp(1, 3, E(u, 1.85, 2.6)), { title: '출력', fs: 14 }); return; }
      // k4: 재대입 시도
      cross(fr[1].x + 70, fr[1].y, 10, pop(u, 0.9));
      note(380, 316, '바깥이 20이 되면 람다 안의 10과 어긋난다', fade(u, 1.0), { fill: BAD, 'font-size': 14.5 });
      terminal(380, 330, 556, 82, [['error: local variables referenced from a lambda', '#fca5a5'], ['  expression must be final or effectively final', '#fca5a5']], u < 1.5 ? 0 : lerp(1, 2, E(u, 1.5, 2.4)), { fs: 13.5, lh: 19 });
      return; }
    // k5: AtomicInteger
    const lo = obj(560, 236, 300, 'n -> cnt.incrementAndGet()', [['cnt = 참조 (복사본)', ACC]], { stroke: ACC });
    const n = Math.floor(clamp((u - 1.0) / 0.4, 0, 3)), v = u < 1.0 ? 0 : Math.min(3, n);
    const ao = obj(800, 336, 220, 'AtomicInteger', [[`value = ${v}`, v > 0 ? ACC : INK]], { stroke: INK, s: pop(u, 0.2) });
    arc(fr[2].x, fr[2].y, ao.l, 336, E(u, 0.3, 0.8), ACC, { bend: 0.1 });
    arc(lo.r - 40, lo.b, 780, ao.t, E(u, 0.6, 1.0), ACC, { bend: -0.15, dash: '6 5' });
    [0, 1, 2].forEach((i) => dot([[494 + i * 54, 118], [560, 210], [700, 260], [800, ao.t + 10]], seg(u, 1.0 + i * 0.4, 1.4 + i * 0.4), INFO, 7));
    note(380, 400, '참조는 그대로, 객체 안의 값만 바뀐다', fade(u, 2.2), { 'font-size': 14.5, fill: ACC });
    pill(820, 400, 'cnt.get() → 3', GOOD, pop(u, 2.4), { mono: true, fs: 13.5 }); }

  // ---------- 3. 표준 함수형 인터페이스 ----------
  const FI = [
    { n: 'Function<T,R>', m: 'apply', i: '"hello"', o: '5', tag: 'Stream.map 자리' },
    { n: 'Consumer<T>', m: 'accept', i: '"log"', o: null, out: '[log]', tag: 'forEach 자리' },
    { n: 'Supplier<T>', m: 'get', i: null, o: '난수', tag: 'get() 할 때 계산' },
    { n: 'Predicate<T>', m: 'test', i: '4', o: 'true', tag: 'filter 자리' },
    { n: 'BiFunction<T,U,R>', m: 'apply', i: '3, 4', o: '7', tag: '입력 2개 · 출력 1개' },
    { n: 'Runnable', m: 'run', i: null, o: null, tag: 'new Thread(r) 자리' },
  ];
  function fiMachine(j, u, live, pk) { const f = FI[j], cx = [165, 480, 795][j % 3], cy = j < 3 ? 118 : 296, s = live ? pop(u, 0.2) : 1;
    if (s <= 0) return;
    mono(cx, cy - 50, f.n, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: live ? ACC : INK, opacity: clamp(s) });
    card(cx, cy, 104, 46, { rx: 10, stroke: live ? ACC : INK, sw: 2.4, fill: live ? ACCBG : PANEL, text: f.m, fs: 16, mono: true, s });
    // 입력 단자
    el('line', { x1: cx - 98, y1: cy, x2: cx - 52, y2: cy, stroke: f.i ? MUT : GRID, 'stroke-width': 2.4, 'stroke-dasharray': f.i ? null : '4 4' });
    el('line', { x1: cx + 52, y1: cy, x2: cx + 98, y2: cy, stroke: f.o ? MUT : GRID, 'stroke-width': 2.4, 'stroke-dasharray': f.o ? null : '4 4' });
    const fin = !live || u > 1.4, fout = !live || u > 2.0;
    if (!f.i) tx(cx - 116, cy + 6, '∅', { 'font-size': 18, fill: MUT, 'text-anchor': 'middle' });
    else if (!live || u < 0.8) pill(cx - 112, cy, f.i, INFO, 1, { mono: true, fs: 13.5, fill: PANEL });
    if (live && f.i) fly(cx - 112, cy, cx - 60, cy, seg(u, 0.8, 1.4), f.i, { mono: true, fill: INFO });
    if (!f.o) tx(cx + 116, cy + 6, '∅', { 'font-size': 18, fill: MUT, 'text-anchor': 'middle', opacity: fin ? 1 : 0 });
    else { if (live) fly(cx + 60, cy, cx + 112, cy, seg(u, 1.4, 2.0), f.o, { mono: true, fill: ACC }); if (fout) pill(cx + 112, cy, f.o, ACC, 1, { mono: true, fs: 13.5, fill: PANEL }); }
    if (f.out && (fin || !live)) pill(cx, cy + 46, '출력 ' + f.out, WARN, live ? pop(u, 1.5) : 1, { fs: 13.5 });
    const ty = f.out ? cy + 80 : cy + 52;
    sub(cx, ty, f.tag, live ? fade(u, 2.0) : 1, { 'font-size': 14 });
    if (pk) mono(cx, ty + 24, j === 5 ? 'java.lang' : 'java.util.function', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: j === 5 ? WARN : INFO, opacity: pk }); }
  function s3(t, c) { const { k, u } = c;
    for (let j = 0; j < Math.min(k, 5); j++) fiMachine(j, u, false, k === 5 ? fade(u, 1.2 + j * 0.15) : 0);
    fiMachine(k === 5 ? 5 : k, u, true, k === 5 ? fade(u, 2.1) : 0); }

  // ---------- 4. 메서드 참조 ----------
  const SX = 100, ST = { x: 470, y: 200, w: 340, h: 130 }, OX = 840;
  const ys = [130, 200, 270];
  function source(vals, used) { tx(SX, 92, '흘러오는 값', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 600 });
    vals.forEach((v, i) => card(SX, ys[i], 120, 44, { rx: 8, text: v, mono: true, fs: 15, stroke: used(i) ? GRID : INK, color: used(i) ? OFF : INK })); }
  function station(top, big, col, s) { card(ST.x, ST.y, ST.w, ST.h, { rx: 14, stroke: col || ACC, sw: 2.6, fill: PANEL, s });
    if (top) mono(ST.x, ST.y - 22, top, { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) });
    if (big) mono(ST.x, ST.y + 22, big, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: col || ACC, opacity: clamp(s) }); }
  function flow(u, ins, outs, t0, o) { o = o || {}; const sy = o.sy || ST.y;
    ins.forEach((v, i) => { const a = seg(u, t0 + i * 0.5, t0 + i * 0.5 + 0.9);
      if (a > 0 && a < 0.5) fly(SX + 60, ys[i], ST.x - 60, sy, a * 2, v, { mono: true, fill: INFO });
      if (a >= 0.5 && a < 1) fly(ST.x + 60, sy, o.tx || OX, ys[i], (a - 0.5) * 2, outs[i], { mono: true, fill: ACC });
      if (a >= 0.5 && a < 1 && o.inside) o.inside(v, i); });
    return (i) => seg(u, t0 + i * 0.5, t0 + i * 0.5 + 0.9) >= 1; }
  function s4(t, c) { const { k, u } = c;
    if (k === 4) { // 네 형태 표
      const cols = [[60, '형태'], [180, '메서드 참조'], [400, '같은 람다'], [690, '수신 객체']];
      const rows = [['① 정적', 'Integer::parseInt', 's -> Integer.parseInt(s)', '없음 (static)'], ['② 특정 객체', 'System.out::println', 'x -> System.out.println(x)', 'System.out'],
        ['③ 임의 객체', 'String::toUpperCase', 's -> s.toUpperCase()', '흘러온 s'], ['④ 생성자', 'ArrayList::new', '() -> new ArrayList<>()', '새로 만든 객체']];
      cols.forEach(([x, h]) => tx(x, 70, h, { 'font-size': 14.5, 'font-weight': 700, fill: MUT }));
      el('line', { x1: 50, y1: 82, x2: 910, y2: 82, stroke: GRID, 'stroke-width': 2 });
      rows.forEach((r, i) => { const y = 124 + i * 64, s = i < 3 ? fade(u, 0.2 + i * 0.25) : fade(u, 1.2), hot = i === 3;
        if (hot && s > 0) el('rect', { x: 50, y: y - 30, width: 860 * E(u, 1.2, 1.8), height: 52, rx: 8, fill: ACCBG });
        if (i === 2) el('rect', { x: 50, y: y - 30, width: 860, height: 52, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 2.2) });
        tx(60, y + 2, r[0], { 'font-size': 15, 'font-weight': 700, opacity: s });
        mono(180, y + 2, r[1], { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: s });
        mono(400, y + 2, r[2], { 'font-size': 14, opacity: s });
        tx(690, y + 2, r[3], { 'font-size': 14.5, opacity: s }); });
      note(480, 400, '③은 클래스 이름을 적지만 정적 메서드가 아니다', fade(u, 2.3), { 'text-anchor': 'middle', fill: WARN, 'font-size': 14.5 });
      return; }
    if (k === 0) { const W = ['"java"', '"kotlin"', '"go"'], done = flow(u, W, ['java', 'kotlin', 'go'], 1.0, { tx: 760 });
      source(W, done);
      station(null, null, ACC, 1);
      const lam = 'x -> System.out.println(x)', x0 = ST.x - lam.length * 15 * 0.55 / 2;
      mono(x0, ST.y - 18, lam, { 'font-size': 15, fill: MUT });
      strike(x0, ST.y - 23, 4 * 8.25, E(u, 0.2, 0.5)); strike(x0 + 23 * 8.25, ST.y - 23, 3 * 8.25, E(u, 0.5, 0.8));
      mono(ST.x, ST.y + 26, 'System.out::println', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
      obj(ST.x, 52, 240, 'System.out', [], { stroke: INFO, s: pop(u, 0.4) }); grow(ST.x, ST.y - ST.h / 2, ST.x, 73, E(u, 0.6, 0.9), INFO);
      sub(ST.x + 190, 66, '수신 객체가 정해져 있다', fade(u, 0.9), { 'text-anchor': 'start', fill: INFO, 'font-weight': 700 });
      terminal(730, 140, 200, 140, ['java', 'kotlin', 'go'], [0, 1, 2].filter(done).length, { title: 'forEach 출력', fs: 14 });
      return; }
    if (k === 1) { const W = ['"java"', '"kotlin"', '"go"'], O = ['"JAVA"', '"KOTLIN"', '"GO"'];
      const done = flow(u, W, O, 1.0, { inside: (v) => mono(ST.x, ST.y + 52, v + '.toUpperCase()', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 }) });
      source(W, done); station('s -> s.toUpperCase()', 'String::toUpperCase', ACC, pop(u, 0.2));
      sub(ST.x, 104, '흘러온 s가 곧 수신 객체', fade(u, 0.6), { fill: WARN, 'font-weight': 700, 'font-size': 15 });
      O.forEach((v, i) => { if (done(i)) card(OX, ys[i], 130, 44, { rx: 8, text: v, mono: true, fs: 15, stroke: ACC, color: ACC }); });
      pill(800, 340, 'upper → [JAVA, KOTLIN, GO]', GOOD, pop(u, 2.5), { mono: true, fs: 13.5 });
      return; }
    if (k === 2) { const W = ['"1"', '"2"', '"3"'], O = ['1', '2', '3'];
      const done = flow(u, W, O, 1.0, { inside: (v) => mono(ST.x, ST.y + 52, 'Integer.parseInt(' + v + ')', { 'font-size': 14.5, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700 }) });
      source(W, done); station('s -> Integer.parseInt(s)', 'Integer::parseInt', ACC, pop(u, 0.2));
      sub(ST.x, 104, 'static 메서드라 s는 인자로 들어간다', fade(u, 0.6), { fill: INFO, 'font-weight': 700, 'font-size': 15 });
      tx(SX, 330, 'String', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); tx(OX, 330, 'Integer', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      O.forEach((v, i) => { if (done(i)) card(OX, ys[i], 90, 44, { rx: 8, text: v, mono: true, fs: 16, stroke: ACC, color: ACC }); });
      pill(ST.x, 370, 'nums → [1, 2, 3]', GOOD, pop(u, 2.5), { mono: true, fs: 13.5 });
      return; }
    // k3: 호출 두 번 → 참조 불가
    const W = ['"java"', '"kotlin"', '"go"'], done = flow(u, W, ['JAVA', 'KOTLIN', 'GO'], 1.0, { tx: 760, sy: ST.y + 48 });
    source(W, done);
    card(ST.x, ST.y, ST.w, ST.h, { rx: 14, stroke: INK, sw: 2.6 });
    card(ST.x - 78, ST.y + 8, 130, 46, { rx: 10, text: '.trim()', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.2) });
    card(ST.x + 78, ST.y + 8, 150, 46, { rx: 10, text: '.toUpperCase()', mono: true, fs: 15, stroke: INFO, color: INFO, s: pop(u, 0.4) });
    grow(ST.x - 12, ST.y + 8, ST.x + 2, ST.y + 8, E(u, 0.5, 0.7), MUT);
    mono(ST.x, ST.y - 40, 's -> s.trim().toUpperCase()', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.3) });
    mono(ST.x, 96, 'String::???', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.6) }); cross(ST.x + 80, 90, 10, pop(u, 0.8));
    sub(ST.x, 312, '호출이 2개라 가리킬 메서드가 하나가 아니다', fade(u, 0.9), { fill: BAD, 'font-weight': 700, 'font-size': 14.5 });
    sub(ST.x, 340, 'map은 람다로 두고, forEach만 System.out::println', fade(u, 1.4), { 'font-size': 14.5 });
    terminal(730, 140, 200, 140, ['JAVA', 'KOTLIN', 'GO'], [0, 1, 2].filter(done).length, { title: '출력', fs: 14 }); }

  // ---------- 5. 실무 함정 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 5) { // 스택 트레이스 + 함정 4가지
      zone(30, 40, 330, 360, '호출 스택 (위가 최근)', { fill: SOFT });
      const fr = (y, s, col, sc, dash) => card(195, y, 270, 52, { rx: 8, text: s, mono: true, fs: 15, stroke: col, color: col, s: sc, dash });
      fr(340, 'LambdaPitfalls.main()', INK, 1);
      fr(lerp(150, 276, E(u, 0.2, 0.8)), 'LambdaPitfalls.run()', INK, fade(u, 0.2));
      fr(212, 'normalize()', ACC, pop(u, 1.0), '6 4');
      sub(195, 168, '람다 본문을 이름 있는 메서드로 (예)', fade(u, 1.2), { fill: ACC, 'font-weight': 700 });
      const P = [['익명 클래스 남발', '람다 · 메서드 참조'], ['캡처 변수 ++', 'AtomicInteger · 집계'], ['this 혼동', '람다 this = 바깥 객체'], ['3~4줄 중첩 람다', 'private 메서드 + 참조']];
      tx(400, 66, '람다가 독이 되는 순간', { 'font-size': 15, 'font-weight': 800 });
      P.forEach(([a, b], i) => { const y = 112 + i * 72, s = pop(u, 0.6 + i * 0.35), hot = i === 3;
        card(660, y, 520, 56, { rx: 10, stroke: hot ? ACC : GRID, sw: hot ? 2.4 : 1.6, fill: hot ? ACCBG : PANEL, s });
        if (s < 0.5) return; cross(426, y, 8, 1); tx(446, y + 5, a, { 'font-size': 15, 'font-weight': 700, fill: BAD });
        check(668, y, 9, 1); tx(688, y + 5, b, { 'font-size': 15, 'font-weight': 700, fill: GOOD }); });
      return; }
    heapZones(330, 940);
    if (k <= 1) {
      const fr = frame(34, 80, 284, 'run()', [['items', null], ['count', k === 0 ? '0' : null, k === 0 ? {} : { col: ACC }]]);
      tx(470, 64, 'List.of("a", "b", "c")', { 'font-size': 14, fill: MUT, class: 'mono' });
      cells(470, 74, ['a', 'b', 'c'], { w: 48, h: 40, gap: 6 });
      arc(fr[0].x, fr[0].y, 466, 94, 1, INK, { bend: -0.1 });
      if (k === 0) { const lo = obj(600, 230, 260, 'x -> count++', [], { stroke: BAD, s: pop(u, 0.2) });
        const g = E(u, 0.6, 1.3), ex = lerp(lo.l, fr[1].r + 6, g * 0.55), ey = lerp(230, fr[1].y, g * 0.55);
        if (g > 0) el('line', { x1: lo.l, y1: 230, x2: ex, y2: ey, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
        cross(ex, ey, 12, pop(u, 1.3));
        note(400, 320, '바깥 지역변수에 쓰기 → effectively final 위반', fade(u, 1.6), { fill: BAD, 'font-size': 14.5 });
        note(400, 352, '컴파일 단계에서 막힌다', fade(u, 2.0), { 'font-size': 14.5 });
        return; }
      const lo = obj(560, 236, 300, 'x -> count.incrementAndGet()', [['count = 참조 (복사본)', ACC]], { stroke: ACC });
      const v = u < 1.0 ? 0 : Math.min(3, Math.floor((u - 1.0) / 0.4));
      const ao = obj(800, 336, 220, 'AtomicInteger', [[`value = ${v}`, v > 0 ? ACC : INK]], { s: pop(u, 0.2) });
      arc(fr[1].x, fr[1].y, ao.l, 336, E(u, 0.3, 0.8), ACC, { bend: 0.1 });
      arc(lo.r - 40, lo.b, 780, ao.t, E(u, 0.6, 1.0), ACC, { bend: -0.15, dash: '6 5' });
      [0, 1, 2].forEach((i) => dot([[494 + i * 54, 118], [560, 210], [700, 260], [800, ao.t + 10]], seg(u, 1.0 + i * 0.4, 1.4 + i * 0.4), INFO, 7));
      pill(470, 390, 'count.get() → 3', GOOD, pop(u, 2.4), { mono: true, fs: 13.5 });
      return; }
    // k2~4: this 화살표
    const fr = frame(34, 80, 284, 'run()', [['this', null], ['lambda', null], ['anon', null, k >= 3 ? {} : { col: OFF }]]);
    const lp = obj(520, 110, 290, 'LambdaPitfalls', [['tag = "OUTER"', ACC]], { stroke: INK });
    arc(fr[0].x, fr[0].y, lp.l, 110, k === 2 ? E(u, 0.2, 0.7) : 1, INK, { bend: -0.08 });
    const lo = obj(520, 286, 290, '람다 () -> println(this.tag)', [], { stroke: ACC, s: k === 2 ? pop(u, 0.5) : 1 });
    arc(fr[1].x, fr[1].y, lo.l, 286, k === 2 ? E(u, 0.6, 1.0) : 1, INK, { bend: 0.1 });
    arc(470, lo.t, 470, lp.b, k === 2 ? E(u, 1.2, 1.8) : 1, ACC, { nodot: true });
    tx(480, 210, 'this', { 'font-size': 15, 'font-weight': 800, fill: ACC, class: 'mono', opacity: k === 2 ? fade(u, 1.6) : 1 });
    if (k === 2) { note(560, 216, '람다에는 자기 this가 없다', fade(u, 1.9), { fill: ACC, 'font-size': 14.5 }); return; }
    const an = obj(820, 286, 210, 'LambdaPitfalls$1', [['(tag 필드 없음)', MUT]], { stroke: WARN, s: k === 3 ? pop(u, 0.2) : 1 });
    arc(fr[2].x, fr[2].y, an.l + 40, an.b, k === 3 ? E(u, 0.3, 0.8) : 1, INK, { bend: 0.25 });
    const lu = k === 3 ? E(u, 0.8, 1.4) : 1;
    if (lu > 0) el('path', { d: `M${an.r - 40},${an.t} C${an.r - 40},${an.t - 56} ${an.r + 28},${an.t - 40} ${an.r},${an.t + 16}`, fill: 'none', stroke: WARN, 'stroke-width': 2.4, pathLength: 1, 'stroke-dasharray': `${lu} 1` });
    mono(an.r - 26, an.t - 44, 'this', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: lu });
    if (k === 3) mono(712, 380, 'this.tag ✗', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
    arc(an.l + 30, an.t, lp.r, 120, k === 3 ? E(u, 1.7, 2.3) : 1, ACC, { bend: 0.2, nodot: true });
    mono(760, 172, 'LambdaPitfalls.this', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 3 ? fade(u, 2.1) : 1 });
    if (k === 3) return;
    // k4: 실행
    const f1 = seg(u, 0.4, 1.1), f2 = seg(u, 1.0, 1.7);
    if (f1 > 0 && f1 < 1) { const [px, py] = [470, lerp(lo.t, lp.b, f1)]; el('circle', { cx: px, cy: py, r: 7, fill: ACC }); }
    if (f2 > 0 && f2 < 1) { const [px, py] = along(an.l + 30, an.t, lp.r, 120, 0.2, f2); el('circle', { cx: px, cy: py, r: 7, fill: ACC }); }
    terminal(40, 292, 280, 114, [['> lambda.run()', null], 'OUTER', ['> anon.run()', null], 'OUTER'], u < 0.6 ? 0 : lerp(1, 4, E(u, 0.6, 1.9)), { fs: 13.5, lh: 18 });
    note(560, 400, '출력은 같아도 this를 따라가는 길이 다르다', fade(u, 2.2), { fill: WARN, 'font-size': 14.5 }); }

  const quiz = [
    { q: '@FunctionalInterface를 붙인 인터페이스에 추상 메서드를 하나 더 넣으면 어떻게 되는가?',
      o: ['람다가 두 메서드를 차례로 구현한다', '컴파일 에러가 난다', '실행할 때 예외가 난다'], a: 1,
      why: '추상 메서드가 2개면 람다가 어느 것을 구현하는지 정할 수 없다. @FunctionalInterface는 이를 컴파일 단계에서 잡아낸다.' },
    { q: 'int factor = 10을 캡처한 람다 아래에 factor = 20을 쓰면 어떻게 되는가?',
      o: ['람다는 계속 10을 쓴다', '람다가 20을 쓰도록 바뀐다', '람다 쪽 줄이 컴파일 에러가 된다'], a: 2,
      why: '캡처하는 지역변수는 effectively final이어야 한다. 재대입이 하나라도 있으면 그 변수를 쓰는 람다가 컴파일되지 않는다.' },
    { q: '입력 없이 값을 만들어 돌려주는 람다를 담는 표준 인터페이스는 무엇인가?',
      o: ['Supplier<T>', 'Consumer<T>', 'Function<T,R>'], a: 0,
      why: 'Supplier는 입력이 없고 get()으로 값을 돌려준다. 값을 받기만 하는 것은 Consumer, 값을 받아 값을 내면 Function이다.' },
    { q: 'map(String::toUpperCase)에서 toUpperCase를 부르는 수신 객체는 무엇인가?',
      o: ['String 클래스 자체', '스트림을 따라 흘러온 각 문자열', 'System.out'], a: 1,
      why: '임의 객체의 인스턴스 메서드 참조는 첫 인자가 수신 객체가 된다. "java"가 들어오면 "java".toUpperCase()가 불린다.' },
    { q: '익명 클래스를 람다로 바꾸면 그 안의 this가 가리키는 대상은 무엇인가?',
      o: ['람다 객체 자신', 'null', '람다를 감싼 바깥 클래스의 인스턴스'], a: 2,
      why: '익명 클래스의 this는 익명 객체 자신이지만 람다는 자기 this가 없어 바깥 인스턴스를 가리킨다. 컴파일은 통과해서 찾기 어려운 차이다.' },
  ];

  const summary = [
    '추상 메서드가 하나뿐인 인터페이스는 이름과 타입을 지우고 본문만 남긴 람다로 구현할 수 있다.',
    '람다가 읽는 바깥 지역변수는 다시 대입하면 안 되고, 세야 하면 AtomicInteger처럼 참조를 고정한다.',
    '표준 인터페이스는 입력과 출력이 있는지로 고르고, 값을 바꾸는 map 자리에는 Function을 쓴다.',
    '기존 메서드 하나를 그대로 부르면 메서드 참조로 줄이고, 호출이 둘 이상이면 람다로 둔다.',
  ];
  const review = [
    { q: 'forEach 안에서 지역변수 total에 값을 더하려다 컴파일 에러가 났다. 가장 알맞은 수정은?',
      o: ['total을 static으로 바꾼다', 'mapToInt(...).sum()처럼 스트림 집계로 계산한다', 'final을 지우고 다시 컴파일한다'], a: 1,
      why: '캡처한 지역변수는 바꿀 수 없다. 세거나 더하는 일은 스트림 집계가 맡고, 꼭 바깥에 쌓아야 할 때만 AtomicInteger를 쓴다.' },
    { q: '익명 클래스를 람다로 바꿨더니 this.name이 다른 값을 찍는다. 먼저 확인할 것은?',
      o: ['람다의 this가 바깥 인스턴스라는 점', 'name이 effectively final인지', '람다 파라미터 개수'], a: 0,
      why: '익명 클래스 안의 this는 익명 객체였지만 람다 안의 this는 감싼 클래스 인스턴스다. 같은 이름의 필드가 둘 다 있으면 결과가 달라진다.' },
    { q: '문자열을 받아 앞뒤 공백을 지우고 대문자로 바꾸는 map 자리에 알맞은 것은?',
      o: ['String::trim::toUpperCase', 'String::toUpperCase', 's -> s.trim().toUpperCase()'], a: 2,
      why: '호출이 두 번이라 메서드 참조 하나로 가리킬 수 없다. Function 자리에 람다로 적는다.' },
  ];

  R.page({ title: '람다와 함수형 인터페이스', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
