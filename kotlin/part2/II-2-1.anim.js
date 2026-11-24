/* II-2-1 확장 함수 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   그림의 재료: 자물쇠가 걸린 클래스 벽(안 = 멤버), 벽 밖에 점선으로 붙는 확장 카드, 문자 칸("Kotlin" 의 인덱스 0~5),
   선언 타입 표와 실제 객체, 멤버가 먼저 뽑히는 호출 순서. 값은 코드 주석 그대로(n, [3, 4], [2, 4, 6, 8], 6, 5, I am a View, member ping) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, G, card, spans, mono, sub, lbl, pill, banner, grow, fly, dot,
    cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  const KW = /^(fun|val|var|when|is|if|else|for|in|return|class|data|open|private|null|true|false|this|it|get)$/;
  function toks(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  const kt = (x, y, s, o) => { o = o || {}; return spans(x, y, toks(s), { 'font-size': o.fs || 15, opacity: o.op ?? 1, 'text-anchor': o.anchor }, o.p); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  // 클래스 벽: 굵은 테두리 + 자물쇠(소스를 열 수 없다) + 멤버 줄
  function wall(x, y, w, h, name, members, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || SOFT, stroke: o.stroke || INK, 'stroke-width': 3.2, opacity: op });
    kt(x + 16, y + 28, name, { op, fs: 16 });
    if (o.locked !== false && op > 0.5) lock(x + w - 24, y + 22, true, MUT, 0.85);
    el('line', { x1: x, y1: y + 42, x2: x + w, y2: y + 42, stroke: o.stroke || INK, 'stroke-width': 1.4, opacity: op });
    (members || []).forEach((m, i) => { const [s, mo] = Array.isArray(m) ? m : [m, {}], yy = y + 70 + i * 34;
      el('rect', { x: x + 12, y: yy - 20, width: w - 24, height: 28, rx: 6, fill: mo.fill || PANEL, stroke: mo.stroke || GRID, 'stroke-width': mo.sw || 1.4, opacity: op * (mo.op ?? 1) });
      kt(x + 22, yy - 1, s, { fs: 14.5, op: op * (mo.op ?? 1) }); });
    return { x, y, w, h, x1: x + w, row: (i) => y + 70 + i * 34 - 6 }; }
  // 확장 카드: 벽 밖에 붙는 주황 카드. 왼쪽 끝에서 벽까지 점선 이음매
  function ext(x, y, s, o) { o = o || {}; const fs = o.fs || 14.5, w = o.w || tw(s, fs) + 28, h = 36, op = o.op ?? 1, dim = o.dim;
    if (o.to != null) el('line', { x1: o.to, y1: y, x2: x, y2: y, stroke: dim ? OFF : WARN, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: op });
    el('rect', { x, y: y - h / 2, width: w, height: h, rx: 8, fill: dim ? PANEL : o.fill || WARNBG, stroke: dim ? OFF : o.stroke || WARN, 'stroke-width': 2.2, opacity: op });
    if (dim) mono(x + 14, y + 5, s, { 'font-size': fs, fill: OFF, opacity: op }); else kt(x + 14, y + 5, s, { fs, op });
    return { x, y, w, x1: x + w }; }
  const box = (cx, cy, v, o) => { o = o || {}; return card(cx, cy, o.w || 50, o.h || 40, { rx: 7, text: String(v), mono: true, fs: o.fs || 16, fw: 700, stroke: o.stroke || INK, fill: o.fill, color: o.color, s: o.s, op: o.op }); };
  function chars(x, y, s, o) { o = o || {}; [...s].forEach((ch, i) => { const hot = o.hot === i, cx = x + i * 52 + 23;
    box(cx, y, ch, { w: 46, h: 44, stroke: hot ? ACC : INK, fill: hot ? ACCBG : PANEL, s: o.s ? o.s(i) : 1 });
    mono(cx, y + 40, String(i), { 'font-size': 14, 'text-anchor': 'middle', fill: hot ? ACC : MUT, opacity: o.op ?? 1 }); }); }

  // ---------- 1. 확장 함수 정의 ----------
  function s1(t, c) { const { k, u } = c;
    const W = wall(40, 60, 300, 190, 'class String', ['length', 'substring(…)', 'uppercase()']);
    note(190, 282, 'String 소스는 열 수 없다', 1, { 'text-anchor': 'middle', fill: MUT, 'font-size': 14.5 });
    const dx = k === 0 ? lerp(220, 0, E(u, 0.3, 1.0)) : 0;
    const e = ext(400 + dx, 110, 'fun String.lastChar(): Char', { to: W.x1, op: k === 0 ? fade(u, 0.3) : 1 });
    if (k === 0) { kt(400, 172, '= this[length - 1]', { op: fade(u, 1.2) });
      el('line', { x1: 452, y1: 120, x2: 452 + tw('String', 14.5), y2: 120, stroke: INFO, 'stroke-width': 3, opacity: fade(u, 1.5) });
      note(452, 150, '수신 타입', fade(u, 1.6), { fill: INFO, 'font-size': 14.5 });
      note(400, 230, '벽 밖에 lastChar 가 하나 생겼다', fade(u, 2.0), { fill: WARN });
      note(400, 258, '벽 안(멤버)은 그대로다', fade(u, 2.2), { fill: MUT }); return; }
    if (k === 1) { // this = String 인스턴스
      kt(400, 172, '= this[length - 1]', {});
      kt(400, 200, '// = this.get(this.length - 1)', { fs: 14, op: fade(u, 0.3) });
      chars(400, 300, 'Kotlin', { hot: u > 1.8 ? 5 : null, s: (i) => pop(u, 0.4 + i * 0.08) });
      mono(470, 240, 'this = "Kotlin"', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) });
      grow(440, 210, 440, 272, E(u, 0.5, 0.8), INFO);
      const L = Math.round(tween(0, 6, u - 0.9, 0.5)); mono(740, 255, `length = ${L}`, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.9) });
      mono(740, 290, 'length - 1 = 5', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      sub(560, 395, 'this 로 length·get 같은 public 멤버에 닿는다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 600 }); return; }
    // k === 2 : 멤버처럼 점으로 부른다
    kt(400, 172, '= this[length - 1]', {});
    el('rect', { x: 400, y: 230, width: 300, height: 46, rx: 9, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
    kt(416, 259, 's.lastChar()', { fs: 17, op: fade(u, 0.2) }); mono(610, 259, '// n', { 'font-size': 16, fill: MUT, opacity: fade(u, 1.6) });
    dot([[470, 230], [470, 160], [520, 130]], seg(u, 0.5, 1.1), ACC, 7);
    if (u > 1.2) box(760, 110, 'n', { w: 54, h: 48, fs: 22, stroke: GOOD, fill: GOODBG, s: pop(u, 1.2) });
    grow(e.x1 + 4, 110, 728, 110, E(u, 1.0, 1.2), GOOD);
    mono(400, 330, 'StringUtils.lastChar(s)', { 'font-size': 16, fill: MUT, opacity: fade(u, 1.6) });
    el('line', { x1: 400, y1: 325, x2: 400 + tw('StringUtils.lastChar(s)', 16) * E(u, 1.8, 2.1), y2: 325, stroke: BAD, 'stroke-width': 2.5 });
    sub(800, 330, '유틸 클래스가 필요 없다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
    sub(560, 395, '(JVM 에서는 lastChar(s) 같은 정적 함수로 컴파일된다)', fade(u, 2.3), { 'font-size': 14 }); }

  // ---------- 2. 표준 라이브러리가 확장으로 가득 ----------
  const LM = ['size', 'get(index)', 'iterator()', 'contains(…)', '… 기본 연산 10가지'];
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { const W = wall(40, 40, 280, 230, 'interface List<Int>', LM.map((m) => [m, { op: k === 0 ? 1 : 0.7 }]));
      kt(40, 320, 'val nums = listOf(1, 2, 3, 4)', { op: 1 });
      [1, 2, 3, 4].forEach((v, i) => box(80 + i * 56, 370, v, { s: k === 0 ? pop(u, 0.3 + i * 0.1) : 1 }));
      const E3 = [['filter { }', '[3, 4]'], ['map { }', '[2, 4, 6, 8]'], ['first()', null]];
      E3.forEach(([s, r], i) => { const y = 90 + i * 70, live = k === 1 && i < 2;
        const e = ext(400, y, s, { to: W.x1, dim: !live, op: k === 0 ? fade(u, 0.8 + i * 0.25) : 1 });
        if (live && r) { const at = 0.4 + i * 0.6; grow(e.x1 + 6, y, 640, y, E(u, at, at + 0.3), GOOD);
          mono(650, y + 6, r, { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, at + 0.3) });
          kt(400, y + 36, i ? 'nums.map { it * 2 }' : 'nums.filter { it > 2 }', { fs: 14, op: fade(u, at) }); } });
      if (k === 0) { note(400, 330, '벽 안 멤버는 기본 연산 몇 개뿐', fade(u, 1.6), { fill: INK });
        note(400, 360, '편의 함수는 전부 벽 밖에 붙어 있다', fade(u, 2.0), { fill: WARN }); }
      else note(560, 330, '호출 모양은 멤버와 똑같다', fade(u, 2.0), { fill: ACC });
      return; }
    if (k === 2) { // T.let — 모든 타입에 붙는다
      ext(330, 70, 'fun <T> T.let(block: (T) -> R): R', { fs: 15, op: fade(u, 0.2) });
      const B = [['String', 140], ['Int', 380], ['List<Int>', 620]];
      B.forEach(([n, x], i) => { const s = pop(u, 0.4 + i * 0.2); card(x + 100, 200, 200, 60, { rx: 10, text: n, mono: true, fs: 16, stroke: INK, fill: SOFT, sw: 3, s });
        el('line', { x1: 500, y1: 88, x2: x + 100, y2: 170, stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.7 + i * 0.2) }); });
      el('rect', { x: 140, y: 290, width: 680, height: 52, rx: 10, fill: PANEL, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.3) });
      kt(160, 322, 'val len = "Kotlin".let { it.length }', { fs: 16, op: fade(u, 1.3) });
      if (u > 1.9) box(760, 316, 6, { w: 60, h: 40, fs: 20, stroke: GOOD, fill: GOODBG, s: pop(u, 1.9) });
      sub(480, 390, 'let · apply · also 는 제네릭 T 의 확장이라 어떤 타입에도 붙는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 600 }); return; }
    // k === 3 : 자동완성 목록 — 멤버와 확장이 나란히
    kt(60, 70, 'nums.', { fs: 20 });
    const L = [['size', 1], ['get(index)', 1], ['filter { }', 0], ['map { }', 0], ['contains(…)', 1], ['first()', 0]];
    el('rect', { x: 60, y: 90, width: 330, height: L.length * 40 + 12, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 1.8, opacity: fade(u, 0.2) });
    L.forEach(([s, mem], i) => { const y = 120 + i * 40, op = fade(u, 0.3 + i * 0.1);
      mono(80, y + 5, s, { 'font-size': 16, opacity: op });
      const tg = fade(u, 1.4 + i * 0.08); if (tg > 0) card(330, y, 70, 26, { rx: 13, text: mem ? '멤버' : '확장', fs: 13.5, fw: 700, stroke: 'none', fill: mem ? INFO : WARN, color: PANEL, op: tg }); });
    note(450, 140, '목록에서는 구분이 없다', fade(u, 0.9));
    note(450, 175, '태그를 붙여야 비로소 보인다', fade(u, 1.6), { fill: WARN });
    terminal(450, 250, 470, 90, ['> println("$big $doubled $len")', '[3, 4] [2, 4, 6, 8] 6'], 1 + E(u, 1.9, 2.4), { title: 'stdout' }); }

  // ---------- 3. 정적 디스패치 ----------
  function hier(k, u, o) { o = o || {};
    const v = card(130, 90, 170, 52, { rx: 10, text: 'open class View', mono: true, fs: 15, stroke: INK, fill: SOFT, sw: 3, s: k === 0 ? pop(u, 0.2) : 1 });
    card(130, 260, 170, 52, { rx: 10, text: 'class Button', mono: true, fs: 15, stroke: INK, fill: SOFT, sw: 3, s: k === 0 ? pop(u, 0.6) : 1 });
    const g = k === 0 ? E(u, 0.9, 1.4) : 1; el('line', { x1: 130, y1: 234, x2: 130, y2: lerp(234, 132, g), stroke: INK, 'stroke-width': 2.2 });
    if (g > 0.95) el('path', { d: 'M120,134 L140,134 L130,118 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.2 });
    if (k === 0) sub(200, 182, 'Button : View()', fade(u, 1.3), { 'text-anchor': 'start', 'font-size': 14.5 });
    if (o.ext) { ext(250, 90, 'View.describe()', { to: 215, op: o.ext[0], dim: o.dim === 1 });
      ext(250, 260, 'Button.describe()', { to: 215, op: o.ext[1], dim: o.dim === 0 }); } }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { hier(k, u); note(420, 120, '상속 계층만 있다', fade(u, 1.6)); note(420, 155, '확장은 아직 하나도 없다', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 1) { hier(k, u, { ext: [fade(u, 0.3), fade(u, 0.8)] });
      mono(440, 130, '= "I am a View"', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.5) });
      mono(440, 300, '= "I am a Button"', { 'font-size': 15, fill: ACC, opacity: fade(u, 1.0) });
      note(560, 190, '이름은 같아도 서로 다른 두 함수', fade(u, 1.5), { fill: INK });
      note(560, 222, '오버라이드 관계가 아니다', fade(u, 1.9), { fill: BAD }); return; }
    const dimSel = k >= 3 ? 1 : null;
    hier(k, u, { ext: [1, 1], dim: dimSel === 1 ? 0 : null });
    // 변수와 실제 객체
    el('rect', { x: 520, y: 60, width: 170, height: 70, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.4 });
    kt(536, 102, 'val v: View', { fs: 16 });
    el('rect', { x: 760, y: 60, width: 170, height: 70, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 2.4, opacity: k === 2 ? fade(u, 0.5) : 1 });
    mono(845, 102, 'Button()', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.5) : 1 });
    grow(690, 95, 756, 95, k === 2 ? E(u, 0.7, 1.0) : 1, ACC);
    pill(605, 160, '선언 타입 View', INFO, k === 2 ? pop(u, 1.2) : 1, { fs: 14.5 });
    pill(845, 160, '실제 타입 Button', WARN, k === 2 ? pop(u, 1.6) : 1, { fs: 14.5 });
    if (k === 2) { sub(605, 196, '컴파일러가 아는 것', fade(u, 1.4), { 'font-size': 14.5 }); sub(845, 196, '실행 중에만 안다', fade(u, 1.8), { 'font-size': 14.5 });
      note(520, 300, '두 타입이 갈리는 순간 차이가 드러난다', fade(u, 2.2)); return; }
    if (k === 3) { el('rect', { x: 520, y: 230, width: 250, height: 46, rx: 9, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
      kt(536, 259, 'v.describe()', { fs: 17, op: fade(u, 0.2) });
      // 컴파일러가 선언 타입 표를 본다
      el('circle', { cx: 650, cy: 160, r: 30, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: fade(u, 0.6) });
      el('line', { x1: 670, y1: 182, x2: 690, y2: 205, stroke: INFO, 'stroke-width': 4, opacity: fade(u, 0.6) });
      dot([[520, 253], [440, 200], [400, 120]], seg(u, 1.0, 1.6), INFO, 7);
      if (u > 1.7) { card(645, 340, 250, 46, { rx: 9, text: '"I am a View"', mono: true, fs: 17, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.7) }); }
      sub(880, 260, '컴파일 시점에', fade(u, 2.0), { 'font-size': 15, fill: INFO, 'font-weight': 700 }); sub(880, 285, '이미 결정', fade(u, 2.0), { 'font-size': 15, fill: INFO, 'font-weight': 700 });
      return; }
    // k === 4 : 멤버였다면
    [['확장 (정적)', '선언 타입 View 를 본다', '"I am a View"', INFO, 240], ['멤버 open fun (동적)', '실제 타입 Button 을 본다', '"I am a Button"', GOOD, 320]].forEach(([a, b, r, col, y], i) => { const at = 0.3 + i * 0.8;
      el('rect', { x: 470, y: y - 32, width: 470, height: 64, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2, opacity: fade(u, at) });
      tx(486, y - 6, a, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, at) });
      tx(486, y + 18, b, { 'font-size': 14, fill: MUT, opacity: fade(u, at) });
      mono(924, y + 6, r, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: fade(u, at + 0.4) }); });
    sub(240, 390, '확장에 다형성을 기대하면 버그가 된다', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }

  // ---------- 4. nullable 수신자 · 확장 프로퍼티 ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { // String? = String 값 + null
      el('rect', { x: 40, y: 60, width: 360, height: 170, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 3 });
      kt(56, 88, 'String?', { fs: 17 });
      el('rect', { x: 60, y: 110, width: 180, height: 100, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mono(150, 166, '"Kotlin" …', { 'font-size': 16, 'text-anchor': 'middle' });
      el('rect', { x: 256, y: 110, width: 126, height: 100, rx: 10, fill: PANEL, stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      mono(319, 166, 'null', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
      // 확장이 두 칸 모두를 덮는다
      const g = k === 0 ? E(u, 0.4, 1.0) : 1;
      el('path', { d: `M60,250 L60,262 L${lerp(60, 382, g)},262 L${lerp(60, 382, g)},250`, fill: 'none', stroke: WARN, 'stroke-width': 3 });
      ext(60, 300, 'fun String?.orEmpty2(): String = this ?: ""', { fs: 15, op: k === 0 ? fade(u, 0.9) : 1 });
      if (k === 0) { note(470, 130, '수신 타입에 ? 를 붙이면', fade(u, 1.4)); note(470, 160, 'null 에도 호출이 열린다', fade(u, 1.6), { fill: WARN });
        note(470, 200, '본문에서 this 가 null 인지 직접 본다', fade(u, 2.0), { fill: MUT }); return; }
      // k === 1 : name = null 에 그대로 호출
      kt(500, 90, 'val name: String? = null', {});
      el('rect', { x: 500, y: 130, width: 300, height: 46, rx: 9, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 0.3) });
      kt(516, 159, 'name.orEmpty2()', { fs: 17, op: fade(u, 0.3) });
      dot([[500, 153], [400, 166], [319, 166]], seg(u, 0.6, 1.1), ACC, 7);
      if (u > 1.1) { el('circle', { cx: 319, cy: 166, r: 40, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 1.1) }); }
      mono(600, 230, 'this ?: ""', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.3) });
      grow(600, 240, 600, 280, E(u, 1.5, 1.8), GOOD);
      if (u > 1.8) card(600, 310, 140, 44, { rx: 9, text: '""', mono: true, fs: 20, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.8) });
      note(690, 316, '빈 문자열 · NPE 없음', fade(u, 2.0), { fill: GOOD });
      mono(560, 380, 'name?.let { … } ?: ""', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) });
      el('line', { x1: 560, y1: 375, x2: 560 + tw('name?.let { … } ?: ""', 15) * E(u, 2.2, 2.5), y2: 375, stroke: BAD, 'stroke-width': 2.4 }); return; }
    const W = wall(40, 60, 280, 190, 'class String', ['length', 'substring(…)', 'uppercase()']);
    if (k === 2) { const e = ext(370, 110, 'val String.lastIndex: Int', { to: W.x1, op: fade(u, 0.2) });
      kt(390, 158, 'get() = length - 1', { op: fade(u, 0.6), fs: 15 });
      // 계산 칸 vs 저장 칸
      card(470, 250, 150, 64, { rx: 10, text: 'get()\n계산할 때마다', fs: 14.5, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.0) });
      card(700, 250, 170, 64, { rx: 10, text: 'backing field\n값 저장 칸', fs: 14.5, stroke: BAD, color: BAD, fill: BADBG, dash: '6 4', s: pop(u, 1.5) });
      cross(800, 222, 12, pop(u, 1.9));
      sub(700, 310, '밖에서는 만들 수 없다', fade(u, 2.0), { 'font-size': 15, fill: BAD, 'font-weight': 700 });
      sub(470, 310, '계산형만 된다', fade(u, 1.3), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    // k === 3 : 프로퍼티처럼 읽는다
    ext(370, 110, 'val String.lastIndex: Int', { to: W.x1 });
    kt(370, 190, '"Kotlin".lastIndex', { fs: 17, op: fade(u, 0.2) });
    chars(370, 250, 'Kotlin', { hot: u > 1.0 ? 5 : null });
    if (u > 1.2) box(720, 185, 5, { w: 56, h: 44, fs: 22, stroke: GOOD, fill: GOODBG, s: pop(u, 1.2) });
    sub(800, 245, '괄호 없이 점으로 읽는다', fade(u, 1.3), { 'font-size': 14.5 });
    kt(40, 370, 'name.isNullOrEmpty()', { fs: 16, op: fade(u, 1.7) }); mono(300, 370, '// null 이면 true', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
    sub(720, 368, '표준 라이브러리도 같은 방식', fade(u, 2.2), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }

  // ---------- 5. 실무 함정 ----------
  function repo(o) { o = o || {};
    const W = wall(40, 60, 320, 160, 'class Repo', [['private val secret = 42', { fill: SOFT, op: 0.9 }], ['fun ping() = "member ping"', { stroke: o.pingHot ? GOOD : GRID, sw: o.pingHot ? 2.4 : 1.4 }]], { op: o.op });
    lock(330, W.row(0) - 2, true, BAD, 0.7); return W; }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { repo({ op: fade(u, 0.1) });
      pill(560, 130, 'private · 안에서만', BAD, pop(u, 0.8), { fs: 14.5 }); pill(560, 164, 'public 멤버', GOOD, pop(u, 1.2), { fs: 14.5 });
      grow(470, 130, 368, 130, E(u, 0.9, 1.2), BAD); grow(482, 164, 368, 164, E(u, 1.3, 1.6), GOOD);
      sub(330, 300, '원본이 무엇을 가졌는지부터 본다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 600 }); return; }
    if (k === 1) { const W = repo();
      ext(420, 164, 'fun Repo.ping() = "extension ping"', { to: W.x1, op: fade(u, 0.3) });
      el('path', { d: 'M440,240 L462,280 L418,280 Z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.4, opacity: fade(u, 1.0) });
      mono(440, 275, '!', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.0) });
      mono(480, 270, 'warning: Extension is shadowed by a member', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) });
      sub(330, 340, '이름·시그니처가 멤버와 같다 · 컴파일은 되지만 쓰이지 않는다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 600 }); return; }
    if (k === 2) { const hot = u > 1.2, W = repo({ pingHot: hot });
      ext(420, 164, 'fun Repo.ping() = "extension ping"', { to: W.x1, dim: u > 1.4 });
      el('rect', { x: 420, y: 250, width: 200, height: 46, rx: 9, fill: PANEL, stroke: ACC, 'stroke-width': 2.2 });
      kt(436, 279, 'r.ping()', { fs: 17 });
      dot([[440, 250], [380, 200], [300, W.row(1) + 6]], seg(u, 0.4, 1.1), ACC, 7);
      note(660, 262, '① 멤버부터 찾는다 → 있음', fade(u, 0.8), { fill: GOOD });
      note(660, 292, '② 확장은 보지도 않는다', fade(u, 1.4), { fill: MUT });
      terminal(40, 320, 400, 80, ['> r.ping()', ['member ping', 'var(--term)']], 1 + E(u, 1.6, 2.1), { title: 'stdout' });
      sub(700, 370, '내가 만든 확장은 실행되지 않는다', fade(u, 2.2), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { const W = repo();
      ext(420, 110, 'fun Repo.leak() = secret', { to: W.x1, stroke: BAD, fill: BADBG });
      const f = E(u, 0.5, 1.1); grow(470, 128, lerp(470, 372, f), lerp(128, W.row(0) + 2, f), f, BAD, { plain: true });
      if (u > 1.1) cross(366, W.row(0) + 2, 12, pop(u, 1.1));
      card(560, 290, 520, 50, { rx: 9, text: "error: Cannot access 'secret': it is private in 'Repo'", fs: 14.5, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 1.5) });
      sub(560, 360, '확장은 클래스 밖 코드다 · public 멤버만 본다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(560, 388, '캡슐화를 뚫는 문이 아니다', fade(u, 2.3), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // k === 4 : 쓸 자리를 정한다
    kt(60, 70, '"text".', { fs: 20, op: 1 });
    el('rect', { x: 60, y: 90, width: 330, height: 290, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 1.8 });
    const n = Math.round(lerp(3, 11, E(u, 0.3, 1.4)));
    for (let i = 0; i < n; i++) { const y = 112 + i * 24, isExt = i >= 3;
      el('rect', { x: 78, y: y - 8, width: isExt ? 150 + ((i * 37) % 90) : 120, height: 10, rx: 4, fill: isExt ? WARN : INFO, opacity: isExt ? 0.6 : 0.9 }); }
    note(80, 405, '아무 데나 단 확장이 자동완성을 채운다', fade(u, 1.4), { fill: BAD, 'font-size': 14.5 });
    [['유틸', '반복되는 작은 변환'], ['가독성', '호출부를 문장처럼'], ['DSL', '빌더 · 설정 블록']].forEach(([a, b], i) => { const y = 120 + i * 70, s = pop(u, 1.6 + i * 0.2);
      card(560, y, 160, 50, { rx: 25, text: a, fs: 17, stroke: GOOD, color: GOOD, fill: GOODBG, s }); tx(660, y + 6, b, { 'font-size': 15, opacity: fade(u, 1.7 + i * 0.2) }); });
    banner(680, 350, '목적이 뚜렷할 때만 · 좁은 범위로', pop(u, 2.3)); }

  // ---------- 확인 문제 · 정리 · 복습 ----------
  const quiz = [
    { q: 'fun String.lastChar(): Char = this[length - 1]에서 this는 무엇을 가리키는가?',
      o: ['lastChar 함수 자신', '확장을 호출한 String 인스턴스', 'String 클래스의 소스 파일'], a: 1,
      why: '확장 함수 본문의 this는 수신 객체다. "Kotlin".lastChar()라면 this는 "Kotlin"이고 this[5]인 n을 돌려준다.' },
    { q: 'nums.filter { it > 2 }를 호출부만 보고 확장인지 멤버인지 알 수 있는가?',
      o: ['알 수 없다, 모양이 똑같다', '확장은 앞에 ext.가 붙는다', '확장은 괄호를 쓰지 않는다'], a: 0,
      why: '확장도 멤버처럼 점으로 부른다. filter·map·let은 모두 확장이지만 호출부만 봐서는 구분되지 않는다.' },
    { q: 'val v: View = Button()일 때 v.describe()가 "I am a View"를 내는 이유는 무엇인가?',
      o: ['Button이 View를 상속하지 않아서', '확장은 선언 타입 View를 보고 컴파일 시점에 정해져서', 'Button.describe()가 private이라서'], a: 1,
      why: '확장은 정적 디스패치다. 실제 객체가 Button이어도 변수의 선언 타입 View 쪽 확장이 뽑힌다.' },
    { q: 'name이 null인데 name.orEmpty2()가 NPE 없이 빈 문자열을 돌려주는 이유는 무엇인가?',
      o: ['수신 타입을 String?로 잡고 본문에서 this ?: ""로 처리해서', 'Kotlin이 null을 자동으로 빈 문자열로 바꿔서', 'orEmpty2가 멤버 함수라서'], a: 0,
      why: 'nullable 수신자 확장은 null에도 호출된다. 본문의 엘비스 연산자가 null일 때 ""를 돌려준다.' },
    { q: 'Repo에 멤버 ping()이 있는데 같은 시그니처의 확장 Repo.ping()을 만들면 r.ping()은 무엇을 부르는가?',
      o: ['확장 ping()', '컴파일 에러가 난다', '멤버 ping()'], a: 2,
      why: '멤버가 항상 이긴다. 컴파일러는 Extension is shadowed by a member 경고만 내고 결과는 member ping이다.' },
  ];
  const summary = [
    '확장 함수는 클래스 소스를 고치지 않고 밖에서 함수를 붙이며, 본문의 this는 수신 객체다.',
    'filter, map, let 같은 표준 함수도 확장이라 호출부만으로는 멤버와 구분되지 않는다.',
    '확장은 선언 타입으로 정해지는 정적 디스패치라서 오버라이드처럼 동작하지 않는다.',
    '이름이 같은 멤버가 있으면 멤버가 이기고, 확장은 private 멤버에 닿지 못한다.',
  ];
  const review = [
    { q: 'List<Shape>를 돌며 shape.area()를 불렀더니 Circle도 Shape용 결과가 나왔다. area가 확장 함수라면 먼저 의심할 것은?',
      o: ['Circle 생성자가 잘못됐다', 'List가 원소를 복사했다', '확장은 선언 타입 Shape로 정해진다'], a: 2,
      why: '확장은 오버라이드되지 않는다. 다형성이 필요하면 open 멤버 함수로 바꿔야 실제 타입을 따라간다.' },
    { q: '라이브러리 클래스의 toString() 결과를 바꾸려고 같은 이름의 확장 toString()을 만들었다. 어떻게 되는가?',
      o: ['확장이 멤버를 덮어 쓴다', '멤버 toString()이 계속 불린다', '두 함수가 번갈아 불린다'], a: 1,
      why: '시그니처가 같으면 멤버가 이긴다. 확장으로는 기존 동작을 바꿀 수 없고 경고만 뜬다.' },
    { q: '확장 함수로 다른 팀 클래스의 private 캐시를 비우려 한다. 가능한가?',
      o: ['안 된다, 확장은 public 멤버만 본다', '같은 파일에 쓰면 된다', 'this를 쓰면 된다'], a: 0,
      why: '확장은 클래스 밖 코드라 private·protected 멤버가 보이지 않는다. 그런 기능은 클래스 쪽에 공개 API가 있어야 한다.' },
  ];

  R.page({ title: '기존 타입 — 안(멤버) vs 밖(확장)', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
