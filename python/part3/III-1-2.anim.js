/* III-1-2 데코레이터 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 출력은 python 3.12.10 으로 코드 블록을 직접 돌려 얻었다.
 *   triple.__closure__[0].cell_contents = 3, say_hi.__name__ = 'wrapper'(wraps 없음), add.__name__ = 'add'(wraps 있음)
 *   fib(30) 캐시 없이 호출 2,692,537번, lru_cache 로 misses=31 hits=28, compute: 0.02ms(이 기기, 기기마다 다름)
 *   fib(5) 캐시 없이 호출 15번, 캐시로 6번 / Cart().add() 두 번 → add 호출 1회, add 호출 2회 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, clock, terminal, tokens, spans, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  // ---------- 공용 도우미 ----------
  function pyobj(x, y, w, h, type, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, opacity: op, 'stroke-dasharray': o.dash });
    el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    mono(x + 12, y + 21, type, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: op }); }
  function nameTag(cx, cy, name, x2, y2, u, o) { o = o || {}; const w = tw(name, 15) + 26, col = o.col || INFO;
    if (u <= 0) return; pill(cx, cy, name, col, o.s ?? 1, { mono: true, fs: 15, fill: INFOBG });
    const sx = x2 < cx - w / 2 ? cx - w / 2 - 2 : x2 > cx + w / 2 ? cx + w / 2 + 2 : cx, sy = sx === cx ? (y2 < cy ? cy - 16 : cy + 16) : cy;
    grow(sx, sy, x2, y2, clamp(u * 1.6 - 0.4), o.arrow || ACC, { dash: o.dash }); }
  function code(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, pad = 16;
    const w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + pad + 18, h = lines.length * lh + 14, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    lines.forEach((s, i) => { const yy = y + 7 + i * lh, shown = o.show ? clamp(o.show - i) : 1; if (shown <= 0) return;
      if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: yy, width: w - 8, height: lh, rx: 4, fill: HL, opacity: op * shown });
      spans(x + pad, yy + fs + 2, tokens(s), { 'font-size': fs, opacity: op * shown }); });
    return { w, h, lh }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (lines, u, a = 0.2, b = 1.6) => lerp(0, lines.length, E(u, a, b));
  // 신분증 카드: __name__ / __doc__
  function idCard(x, y, name, doc, col, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1;
    el('rect', { x, y, width: 250, height: 92, rx: 10, fill: PANEL, stroke: col, 'stroke-width': 2.2, opacity: s * op });
    tx(x + 14, y + 24, o.title || '이름표', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: s * op });
    mono(x + 14, y + 52, '__name__  ' + name, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: s * op });
    mono(x + 14, y + 78, '__doc__   ' + doc, { 'font-size': 15, fill: col, opacity: s * op }); }

  // ---------- 1. 함수는 일급 객체 ----------
  const F = { x: 330, y: 56, w: 250, h: 120 };
  function fnObj(name, o) { o = o || {}; pyobj(F.x, F.y, F.w, F.h, 'function', { op: o.s });
    mono(F.x + 16, F.y + 62, "__name__ = '" + name + "'", { 'font-size': 15, opacity: o.s ?? 1 });
    mono(F.x + 16, F.y + 94, '__code__ = <code>', { 'font-size': 15, fill: MUT, opacity: o.s ?? 1 }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) {
      const s = k === 0 ? pop(u, 0.6) : 1; fnObj('greet', { s });
      nameTag(150, 96, 'greet', F.x - 2, 96, k === 0 ? E(u, 1.2, 1.9) : 1);
      code(30, 250, ['def greet(name):', '    return f"Hi, {name}"'], { show: k === 0 ? lerp(0, 2, E(u, 0.1, 0.6)) : 2, hi: () => k === 0 });
      if (k === 0) { note(420, 268, 'def 는 실행문이다', fade(u, 1.8)); note(420, 296, '객체를 만들고 이름 greet 를 붙인다', fade(u, 2.1), { fill: MUT }); return; }
      nameTag(150, 150, 'g', F.x - 2, 150, E(u, 0.2, 0.9), { s: pop(u, 0.2) });
      const T = ['>>> g is greet', 'True', ">>> g('kim')", "'Hi, kim'", '>>> g.__name__', "'greet'"];
      terminal(620, 40, 310, 190, T, typed(T, u, 0.8, 2.4), { title: 'python 3.12' });
      note(30, 360, '괄호가 없으면 호출이 아니라 객체 자체다', fade(u, 1.4)); note(30, 388, '이름 둘, 객체 하나', fade(u, 1.8), { fill: INFO }); return; }
    if (k === 2) { // 고차 함수: str.upper 를 인자로
      code(30, 30, ['def run_twice(fn, x):', '    return fn(fn(x))'], {});
      card(150, 190, 170, 56, { rx: 10, text: 'str.upper', mono: true, fs: 16, stroke: INK, s: pop(u, 0.2) });
      tx(150, 238, '함수 객체', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      fly(150, 190, 470, 190, seg(u, 0.5, 1.1), 'fn', { mono: true, fill: INFO });
      [440, 640].forEach((x, i) => { el('circle', { cx: x + 30, cy: 300, r: 34, fill: INFOBG, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 1.0) });
        mono(x + 30, 305, 'fn', { 'font-size': 16, 'text-anchor': 'middle', fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) }); });
      const p = E(u, 1.2, 2.5), xx = lerp(360, 820, p), val = xx < 470 ? '"py"' : xx < 670 ? '"PY"' : '"PY"';
      card(xx, 300, 64, 32, { rx: 16, text: val, mono: true, fs: 14, stroke: 'none', fill: ACC, color: PANEL });
      grow(504, 300, 636, 300, fade(u, 1.0), MUT, { plain: true });
      mono(830, 260, 'run_twice(str.upper, "py")', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.2) });
      mono(880, 305, '→ PY', { 'font-size': 16, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.5) }); return; }
    // k 3, 4: 클로저
    const fr = k === 3 ? 1 - E(u, 1.8, 2.6) * 0.75 : 0.25;
    zone(40, 56, 250, 140, 'make_multiplier(3) 프레임', { fill: SOFT, stroke: GRID, dash: '5 4', op: fr });
    mono(70, 120, 'factor', { 'font-size': 16, 'font-weight': 700, opacity: fr });
    const cs = k === 3 ? pop(u, 0.4) : 1;
    card(400, 300, 100, 50, { rx: 8, text: 'cell  3', mono: true, fs: 16, stroke: WARN, color: WARN, fill: WARNBG, s: cs });
    tx(400, 345, '클로저 셀', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: cs });
    grow(140, 128, 350, 290, (k === 3 ? E(u, 0.5, 1.0) : 1) * (fr > 0.3 ? 1 : 0), MUT);
    const ms = k === 3 ? pop(u, 0.9) : 1;
    pyobj(560, 56, 260, 140, 'function mul', { op: ms });
    mono(576, 118, 'return x * factor', { 'font-size': 14.5, opacity: ms });
    el('circle', { cx: 584, cy: 160, r: 5, fill: WARN, opacity: ms }); mono(598, 165, '__closure__', { 'font-size': 14.5, fill: WARN, opacity: ms });
    grow(584, 166, 448, 290, k === 3 ? E(u, 1.2, 1.8) : 1, WARN, { plain: false });
    nameTag(890, 126, 'triple', 822, 126, k === 3 ? E(u, 1.6, 2.2) : 1);
    if (k === 3) { note(40, 240, '프레임은 끝나도', fade(u, 2.2), { fill: MUT }); note(40, 266, 'factor 값 3 은 셀에 남는다', fade(u, 2.4), { fill: WARN }); return; }
    // k 4: triple(10)
    fly(500, 230, 640, 120, seg(u, 0.2, 0.9), '10', { mono: true, fill: INFO });
    if (u > 0.9) { el('rect', { x: 340, y: 270, width: 120, height: 60, rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: 1 - E(u, 1.6, 2.2) }); }
    fly(700, 200, 760, 250, seg(u, 1.2, 1.8), '30', { mono: true, fill: GOOD, stay: true });
    const T = ['>>> triple(10)', '30', '>>> triple.__closure__[0].cell_contents', '3'];
    terminal(560, 280, 370, 130, T, typed(T, u, 0.6, 2.4), { title: 'python 3.12' });
    note(40, 400, '10 × 기억한 3 = 30', fade(u, 1.8), { fill: GOOD }); }

  // ---------- 2. @decorator = f = decorator(f) ----------
  const W = { x: 470, y: 50, w: 420, h: 250 };
  const DL = ['def log_calls(func):', '    def wrapper():', '        print("[before]")', '        result = func()', '        print("[after]")', '        return result', '    return wrapper'];
  const O = { x: 640, y: 330, w: 220, h: 70 };
  function band(y, h, text, col, s) { if (s <= 0) return; el('rect', { x: W.x + 20, y, width: W.w - 40, height: h, rx: 8, fill: col === WARN ? WARNBG : col === ACC ? ACCBG : INFOBG, stroke: col, 'stroke-width': 1.8, opacity: s });
    mono(W.x + 36, y + h / 2 + 5, text, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: s }); }
  function wrapperObj(k, u, o) { o = o || {};
    const ws = k === 1 ? pop(u, 0.2) : 1;
    pyobj(W.x, W.y, W.w, W.h, 'function wrapper', { op: ws, stroke: ACC });
    band(W.y + 44, 44, 'print("[before]")', INFO, k === 1 ? E(u, 0.8, 1.4) : 1);
    if (k >= 2) band(W.y + 100, 60, 'result = func()', ACC, k === 2 ? E(u, 0.2, 0.9) : 1);
    if (k >= 3) band(W.y + 172, 44, 'print("[after]")', INFO, k === 3 ? E(u, 0.2, 0.8) : 1); }
  function s2(t, c) { const { k, u } = c;
    const hl = [[0], [1, 2], [3], [4, 5, 6], [], [], []][k];
    code(30, 40, DL, { w: 400, fs: 14, hi: (i) => hl.includes(i), op: k >= 4 ? 0.55 : 1 });
    if (k === 0) { el('rect', { x: W.x, y: W.y, width: W.w, height: W.h, rx: 10, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      pill(W.x + W.w / 2, W.y + W.h / 2, 'func', ACC, pop(u, 0.8), { mono: true, fs: 16, fill: ACCBG });
      note(W.x + W.w / 2, W.y + W.h / 2 + 50, '원본 함수가 들어올 자리', fade(u, 1.3), { 'text-anchor': 'middle', fill: MUT });
      note(30, 300, '함수를 인자로 받는 평범한 함수', fade(u, 1.8)); return; }
    wrapperObj(k, u);
    if (k === 1) { note(30, 300, 'wrapper 안의 코드는 아직 돌지 않는다', fade(u, 1.8), { fill: MUT }); return; }
    // 원본 함수 객체와 func 참조
    const os = k === 2 ? pop(u, 0.6) : 1;
    pyobj(O.x, O.y, O.w, O.h, 'function say_hi', { op: os }); mono(O.x + 16, O.y + 56, 'print("hi")', { 'font-size': 14.5, opacity: os });
    grow(W.x + 300, W.y + 160, O.x + 110, O.y - 2, k === 2 ? E(u, 0.9, 1.5) : 1, ACC);
    if (k === 2) { note(30, 300, '원본을 부를지 말지도 wrapper 가 정한다', fade(u, 1.8)); return; }
    if (k === 3) { // return wrapper
      grow(W.x - 4, W.y + 250, 380, 350, E(u, 1.0, 1.6), ACC); mono(400, 370, 'return wrapper', { 'font-size': 15, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.5) });
      note(30, 300, 'return result 를 빠뜨리면 늘 None', fade(u, 2.0), { fill: WARN }); return; }
    // 이름 say_hi 가 원본 → wrapper 로 옮겨 간다
    const mv = k === 4 ? E(u, 0.8, 1.8) : 1;
    if (mv < 1) grow(540, 365, O.x - 2, 365, 1, MUT, { dash: '5 4' });
    nameTag(500, 365, 'say_hi', 560, W.y + W.h + 2, mv > 0 ? mv : 0.001);
    if (mv >= 1) { cross(590, 365, 8, k === 4 ? pop(u, 1.8) : 1); }
    if (k === 4) { note(30, 300, '@log_calls 를 붙인 순간', fade(u, 0.3), { fill: MUT }); note(30, 326, '이름 say_hi 가 wrapper 를 가리킨다', fade(u, 1.9), { fill: ACC });
      note(30, 352, '원본은 func 로만 남는다', fade(u, 2.3)); return; }
    if (k === 5) { const s = pop(u, 0.3);
      code(30, 290, ['@log_calls', 'def say_hi(): ...'], { op: s, w: 190 }); tx(232, 330, '≡', { 'font-size': 32, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      code(260, 300, ['say_hi = log_calls(say_hi)'], { op: fade(u, 1.2), w: 0 || undefined }); return; }
    // k 6: 호출 흐름 before → 원본 → after
    const route = [[W.x + 210, W.y - 30], [W.x + 210, W.y + 66], [W.x + 300, W.y + 130], [O.x + 110, O.y + 30], [W.x + 300, W.y + 150], [W.x + 210, W.y + 194], [W.x + 210, W.y + W.h + 20]];
    dot(route, seg(u, 0.2, 2.5), ACC, 9);
    const T = ['>>> say_hi()', '[before]', 'hi', '[after]'], sh = u < 0.3 ? 1 : u < 0.8 ? 1 : u < 1.4 ? 2 : u < 2.0 ? 3 : 4;
    terminal(30, 290, 400, 120, T, sh, { title: 'say_hi() 는 사실 wrapper()' }); }

  // ---------- 3. *args/**kwargs + functools.wraps ----------
  function s3(t, c) { const { k, u } = c;
    if (k <= 2 || k === 4) { // 인자 묶기·풀기
      mono(40, 50, 'add(3, 4)', { 'font-size': 20, 'font-weight': 800, fill: INFO });
      pyobj(250, 80, 300, 150, 'wrapper(*args, **kwargs)', { stroke: ACC });
      mono(270, 150, 'args', { 'font-size': 15, fill: MUT }); mono(270, 200, 'kwargs', { 'font-size': 15, fill: MUT });
      const pk = k === 0 ? E(u, 0.4, 1.4) : 1;
      if (k === 0) [3, 4].forEach((v, i) => fly(70 + i * 40, 60, 400 + i * 48, 145, seg(u, 0.4 + i * 0.3, 1.2 + i * 0.3), String(v), { mono: true, fill: INFO, stay: true }));
      el('rect', { x: 366, y: 124, width: 130, height: 42, rx: 21, fill: 'none', stroke: INFO, 'stroke-width': 2, opacity: k === 0 ? fade(u, 1.4) : 1 });
      tx(512, 150, 'tuple', { 'font-size': 13.5, fill: INFO, opacity: k === 0 ? fade(u, 1.5) : 1 });
      card(430, 195, 90, 32, { rx: 6, text: '{ }', mono: true, fs: 16, stroke: GRID, op: fade(k === 0 ? u : 3, 1.4) });
      if (k === 0) { note(40, 300, '받을 때 별표 = 묶기', fade(u, 1.8)); note(40, 326, '위치 인자는 튜플, 키워드는 딕셔너리로', fade(u, 2.1), { fill: MUT }); return; }
      // 원본 add(a, b) 로 풀어서 넘긴다
      pyobj(650, 80, 260, 150, 'add(a, b)', {});
      mono(670, 150, 'a', { 'font-size': 16, 'font-weight': 700 }); mono(670, 200, 'b', { 'font-size': 16, 'font-weight': 700 });
      const pu = k === 1 ? E(u, 0.4, 1.4) : 1;
      [3, 4].forEach((v, i) => card(lerp(400 + i * 48, 730, pu), lerp(145, 145 + i * 50, pu), 40, 30, { rx: 6, text: String(v), mono: true, fs: 15, stroke: INFO, color: INFO }));
      mono(600, 72, 'func(*args, **kwargs)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.3) : 1 });
      if (k === 1) { note(40, 300, '넘길 때 별표 = 풀기', fade(u, 1.6)); note(40, 326, '짝이 맞으면 어떤 시그니처든 통과한다', fade(u, 2.0), { fill: MUT }); return; }
      // 결과 7 이 돌아온다
      fly(800, 175, 400, 270, seg(u, 0.3, 1.2), '7', { mono: true, fill: GOOD, stay: true });
      const T = k === 2 ? ['call add(3, 4)', '  -> 7'] : ['>>> add(3, 4)', 'call add(3, 4)', '  -> 7', '7'];
      terminal(40, 290, 460, 120, T, typed(T, u, 0.6, 2.2), { title: k === 2 ? 'wrapper 의 로그' : 'python 3.12' });
      note(540, 330, k === 2 ? '결과는 손대지 않고 그대로 돌려준다' : '인자 두 개도 그대로 통과', fade(u, 1.8), { fill: GOOD }); return; }
    // k 3, 5, 6: 이름표 비교
    const orig = { x: 60, y: 70 }, wr = { x: 600, y: 70 };
    idCard(orig.x, orig.y, "'add'", "'두 수를 더한다'", INK, { title: '원본 add (func 안)', op: k === 6 ? 0.5 : 1 });
    nameTag(470, 260, 'add', wr.x + 60, wr.y + 94, 1);
    if (k === 3) { idCard(wr.x, wr.y, "'wrapper'", 'None', BAD, { title: 'wrapper (@wraps 없음)', s: pop(u, 0.3) });
      note(60, 330, '이름 add 를 불렀는데 자기를 wrapper 라고 소개한다', fade(u, 1.6), { fill: BAD }); return; }
    if (k === 5) { // 복사된다
      const p = E(u, 0.4, 1.6), done = u > 1.6;
      idCard(wr.x, wr.y, done ? "'add'" : "'wrapper'", done ? "'두 수를…'" : 'None', done ? GOOD : BAD, { title: 'wrapper + @wraps(func)' });
      fly(orig.x + 180, 44, wr.x + 180, 44, seg(u, 0.4, 1.4), '__name__', { mono: true, fill: GOOD });
      fly(orig.x + 180, 44, wr.x + 180, 44, seg(u, 0.7, 1.7), '__doc__', { mono: true, fill: GOOD });
      mono(wr.x + 14, wr.y + 122, '__wrapped__ → 원본 add', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 2.0) });
      note(60, 330, '@functools.wraps(func) 한 줄이 이름표를 옮겨 붙인다', fade(u, 2.2)); void p; return; }
    // k 6: 비교
    idCard(wr.x, wr.y, "'add'", "'두 수를…'", GOOD, { title: 'wrapper + @wraps(func)' });
    const T = ['>>> add.__name__', "'add'", '>>> add.__doc__', "'두 수를 더한다'"];
    terminal(60, 290, 420, 120, T, typed(T, u, 0.3, 1.8), { title: 'python 3.12' });
    note(560, 330, '@wraps 가 없으면', fade(u, 1.6), { fill: MUT }); mono(560, 360, "'wrapper', None", { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) }); }

  // ---------- 4. 데코레이터 팩토리 ----------
  const LY = [{ x: 330, y: 40, w: 600, h: 330, name: 'retry(times=3, delay=0.1)', col: INFO }, { x: 360, y: 120, w: 540, h: 236, name: 'decorator(func)', col: WARN }, { x: 390, y: 196, w: 480, h: 146, name: 'wrapper(*args, **kwargs)', col: ACC }];
  function layer(i, s) { const L = LY[i]; if (s <= 0) return;
    el('rect', { x: L.x, y: L.y, width: L.w, height: L.h, rx: 12, fill: i === 0 ? INFOBG : i === 1 ? WARNBG : PANEL, stroke: L.col, 'stroke-width': 2.2, opacity: s });
    mono(L.x + 14, L.y + 24, L.name, { 'font-size': 15, 'font-weight': 700, fill: L.col, opacity: s }); }
  function cell(x, y, t, col, s) { card(x, y, tw(t, 14.5) + 24, 30, { rx: 6, text: t, mono: true, fs: 14.5, stroke: col, color: col, fill: PANEL, s }); }
  function s4(t, c) { const { k, u } = c;
    layer(0, k === 0 ? E(u, 0.2, 0.7) : 1);
    cell(780, 64, 'times = 3', INFO, k === 0 ? pop(u, 0.8) : 1); cell(780, 100, 'delay = 0.1', INFO, k === 0 ? pop(u, 1.0) : 1);
    if (k >= 1) { layer(1, k === 1 ? E(u, 0.2, 0.7) : 1); cell(780, 146, k >= 6 ? 'func = risky' : 'func = ?', WARN, k === 1 ? pop(u, 0.8) : k === 6 ? pop(u, 1.0) : 1); }
    if (k >= 2) { layer(2, k === 2 ? E(u, 0.2, 0.7) : 1);
      mono(406, 252, 'for attempt in range(1, times + 1)', { 'font-size': 14.5, opacity: k === 2 ? fade(u, 0.6) : 1 });
      const res = k === 3 ? ['ok'] : k === 4 ? ['fail', 'fail', 'fail'] : [];
      [1, 2, 3].forEach((a, i) => { const s = k === 2 ? pop(u, 1.0 + i * 0.25) : 1, r = res[i], on = k === 3 ? u > 0.8 && i === 0 : k === 4 ? u > 0.5 + i * 0.6 : false;
        card(450 + i * 110, 300, 90, 40, { rx: 8, text: String(a) + '회', fs: 15, stroke: on ? (r === 'ok' ? GOOD : BAD) : GRID, color: on ? (r === 'ok' ? GOOD : BAD) : MUT, fill: on ? (r === 'ok' ? GOODBG : BADBG) : PANEL, s });
        if (k === 3 && i > 0) cross(450 + i * 110, 300, 0, 0); });
      if (k === 2) grow(760, 74, 640, 240, E(u, 1.4, 2.0), INFO, { dash: '4 4' }); }
    // 왼쪽: 그 beat 의 이야기
    if (k === 0) { note(30, 80, '@retry(times=3)', fade(u, 0.2), { class: 'mono', 'font-size': 16 }); note(30, 112, '괄호가 있으니', fade(u, 1.2), { fill: MUT }); note(30, 138, '먼저 호출된다', fade(u, 1.5), { fill: INFO }); }
    if (k === 1) { note(30, 160, '함수를 받는 층은', fade(u, 1.0), { fill: MUT }); note(30, 186, '가운데 하나뿐', fade(u, 1.3), { fill: WARN }); }
    if (k === 2) { note(30, 240, 'wrapper 는 바깥 두 층의', fade(u, 1.6), { fill: MUT }); note(30, 266, '변수를 클로저로 본다', fade(u, 1.9), { fill: ACC }); }
    if (k === 3) { check(450, 334, 9, pop(u, 1.0)); grow(404, 300, 250, 380, E(u, 1.2, 1.9), GOOD); mono(30, 400, 'return func(*args, **kwargs)', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) });
      note(30, 120, '1회차 성공이면', fade(u, 0.4), { fill: MUT }); note(30, 146, '남은 시도 없이 끝', fade(u, 1.4), { fill: GOOD }); }
    if (k === 4) { [0, 1, 2].forEach((i) => { if (u > 0.6 + i * 0.6) clock(495 + i * 110, 268, 9, seg(u, 0.6 + i * 0.6, 1.1 + i * 0.6), WARN); });
      const T = ['  1회 실패: 일시 오류', '  2회 실패: 일시 오류', '  3회 실패: 일시 오류', ['RuntimeError: 3회 모두 실패', 'var(--bad)']];
      terminal(20, 160, 300, 150, T, u < 0.5 ? 0 : u < 1.1 ? 1 : u < 1.7 ? 2 : u < 2.3 ? 3 : 4, { title: 'risky()', fs: 13.5 });
      tx(30, 340, '사이마다 time.sleep(0.1)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.0) }); }
    if (k === 5) { grow(LY[2].x + 6, LY[2].y + 70, LY[1].x - 26, 230, E(u, 0.3, 1.0), ACC); grow(LY[1].x + 6, LY[1].y + 60, 300, 140, E(u, 1.2, 1.9), WARN);
      mono(30, 236, 'return wrapper', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) }); mono(30, 146, 'return decorator', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.9) });
      note(30, 330, '하나만 빠져도 None 이 된다', fade(u, 2.3), { fill: BAD }); }
    if (k === 6) { [['① retry(times=3)', '→ decorator', INFO], ['② decorator(risky)', '→ wrapper', WARN], ['③ risky = wrapper', '', ACC]].forEach(([a, b, col], i) => {
        mono(24, 90 + i * 64, a, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.5) }); mono(44, 114 + i * 64, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.5) }); });
      nameTag(140, 330, 'risky', LY[2].x - 2, 320, E(u, 1.4, 2.1)); } }

  // ---------- 5. 실무: timer · log · lru_cache ----------
  function stopwatch(cx, cy, r, f, s) { const g = R.G(cx, cy, s ?? 1); el('rect', { x: -6, y: -r - 12, width: 12, height: 8, rx: 2, fill: INK }, g);
    el('circle', { cx: 0, cy: 0, r, fill: PANEL, stroke: INK, 'stroke-width': 3 }, g); const a = -Math.PI / 2 + f * 2 * Math.PI;
    el('line', { x1: 0, y1: 0, x2: Math.cos(a) * (r - 8), y2: Math.sin(a) * (r - 8), stroke: BAD, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); }
  // fib(5) 호출 나무: 캐시가 없으면 15번
  const TREE = (() => { const out = []; let id = 0; (function go(n, x, y, w, par) { const me = id++; out.push({ n, x, y, par, me }); if (n >= 2) { go(n - 1, x - w, y + 52, w / 2, me); go(n - 2, x + w, y + 52, w / 2, me); } })(5, 230, 70, 104, null); return out; })();
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) {
      stopwatch(110, 140, 46, k === 1 ? E(u, 0.4, 2.2) : k === 2 ? 1 : 0, k === 0 ? pop(u, 0.2) : 1);
      code(220, 40, ['def timer(func):', '    @functools.wraps(func)', '    def wrapper(*args, **kwargs):', '        t0 = perf_counter()', '        result = func(*args, **kwargs)', '        elapsed = perf_counter() - t0', '        print(f"{func.__name__}: ...ms")', '        return result', '    return wrapper'],
        { fs: 14, hi: (i) => (k === 0 ? i <= 2 : k === 1 ? i >= 3 && i <= 5 : i >= 6) });
      if (k === 0) { note(640, 80, '받고, 감싸고, 돌려준다', fade(u, 1.0)); note(640, 108, 'Step 3 의 틀 그대로', fade(u, 1.4), { fill: MUT }); return; }
      if (k === 1) { const ax = 640, aw = 280, y = 140; el('line', { x1: ax, y1: y, x2: ax + aw, y2: y, stroke: MUT, 'stroke-width': 2 });
        const p = E(u, 0.4, 2.0); el('rect', { x: ax + 30, y: y - 14, width: (aw - 60) * p, height: 28, rx: 4, fill: ACC, opacity: 0.7 });
        el('line', { x1: ax + 30, y1: y - 26, x2: ax + 30, y2: y + 26, stroke: INFO, 'stroke-width': 2.5 }); mono(ax + 30, y + 46, 't0', { 'font-size': 15, fill: INFO, 'text-anchor': 'middle' });
        if (p >= 1) { el('line', { x1: ax + aw - 30, y1: y - 26, x2: ax + aw - 30, y2: y + 26, stroke: INFO, 'stroke-width': 2.5 }); mono(ax + aw - 30, y + 46, '끝', { 'font-size': 15, fill: INFO, 'text-anchor': 'middle' }); }
        mono(ax + aw / 2, y - 34, 'func(...) 실행', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        mono(ax + aw / 2, y + 80, 'elapsed = 끝 − t0', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
        tx(640, 290, 'time.time() 대신 perf_counter()', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
      terminal(640, 50, 290, 90, ['compute: 0.02ms'], typed([1], u, 0.4, 1.0), { title: '@timer' });
      card(785, 220, 290, 80, { rx: 10, text: '@log 도 같은 틀\nwrapper 안에 logging.info', fs: 14.5, stroke: INFO, color: INFO, s: pop(u, 1.3) });
      note(640, 320, 'func.__name__ 이 원본 이름을 알려 준다', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 3) { // 캐시: 같은 인자 다시 계산 → 저장값
      tx(30, 40, 'fib(5) 호출 나무', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const seen = new Set(), cached = u > 1.4, st = {};
      TREE.forEach((nd) => { const hit = seen.has(nd.n); seen.add(nd.n); const par = nd.par == null ? null : st[nd.par]; st[nd.me] = { hit, hidden: !!(par && (par.hit || par.hidden)) }; });
      TREE.forEach((nd, i) => { const s = clamp(E(u, 0.1, 1.2) * TREE.length - i); if (s <= 0) return; const q = st[nd.me], par = TREE.find((z) => z.me === nd.par);
        const op = cached && q.hidden ? 0.15 : 1, col = !q.hit ? INFO : cached ? GOOD : BAD;
        if (par) el('line', { x1: par.x, y1: par.y + 13, x2: nd.x, y2: nd.y - 13, stroke: GRID, 'stroke-width': 1.5, opacity: s * op });
        card(nd.x, nd.y, 36, 26, { rx: 6, text: String(nd.n), mono: true, fs: 13.5, stroke: col, color: col, fill: q.hit ? (cached ? GOODBG : BADBG) : PANEL, s, op }); });
      mono(30, 346, '캐시 없이 15번 · 캐시로 6번', { 'font-size': 15, 'font-weight': 700, fill: cached ? GOOD : BAD, opacity: fade(u, 1.0) });
      tx(30, 374, cached ? '초록 칸 = 저장값을 꺼냄, 그 아래는 사라진다' : '빨간 칸 = 이미 계산한 값을 다시 계산', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
      tx(560, 220, 'fib(30) 호출 수', { 'font-size': 14.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(560, 256, '캐시 없음', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) }); hbar(650, 243, 200, 2692537, 2692537, { col: BAD, h: 18, text: '2,692,537', u: E(u, 1.5, 2.2) });
      tx(560, 296, 'lru_cache', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.9) }); hbar(650, 283, 200, 31, 2692537, { col: GOOD, h: 18, text: '31', u: E(u, 1.9, 2.4) });
      mono(560, 350, '@functools.lru_cache(maxsize=None)', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k 4, 5: 겹쳐 붙이기와 결과
    pyobj(40, 50, 400, 230, 'compute = timer(compute)', { stroke: INFO });
    stopwatch(90, 120, 22, k === 5 ? E(u, 0.2, 1.0) : 0, 1);
    card(260, 120, 230, 46, { rx: 8, text: 'compute() → fib(30)', mono: true, fs: 14.5, stroke: INK });
    pyobj(470, 50, 450, 230, 'fib = lru_cache(maxsize=None)(fib)', { stroke: WARN });
    // 캐시 칸 31개 (n = 0 … 30)
    const fill = k === 5 ? E(u, 0.2, 1.4) : k === 4 ? 0 : 1;
    for (let i = 0; i < 31; i++) { const on = i < fill * 31; el('rect', { x: 492 + (i % 11) * 38, y: 100 + Math.floor(i / 11) * 40, width: 32, height: 32, rx: 4, fill: on ? WARNBG : PANEL, stroke: on ? WARN : GRID, 'stroke-width': 1.5 });
      mono(508 + (i % 11) * 38, 121 + Math.floor(i / 11) * 40, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: on ? WARN : OFF }); }
    tx(492, 236, '캐시 칸: fib(0) … fib(30)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    grow(375, 120, 486, 120, k === 4 ? E(u, 0.5, 1.1) : 1, ACC);
    if (k === 4) { code(40, 300, ['@a', '@b', 'def f(): ...'], { op: fade(u, 1.2) }); tx(200, 350, '≡  f = a(b(f))', { 'font-size': 18, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fade(u, 1.6) });
      note(470, 330, '위에 적은 데코레이터가 바깥이 된다', fade(u, 2.0)); return; }
    const T = ['>>> compute()', 'compute: 0.02ms', '>>> fib.cache_info()', 'CacheInfo(hits=28, misses=31, maxsize=None, currsize=31)'];
    terminal(40, 296, 880, 116, T, typed(T, u, 0.4, 2.2), { title: 'python 3.12 (시간은 기기마다 다름)', fs: 14 }); }

  // ---------- 6. 실무 함정 ----------
  function heads(on) { [['① wraps 누락', 0, 3], ['② 실행 시점', 3, 6], ['③ 상태 공유', 6, 9]].forEach(([s, a, b], i) => {
      const act = on >= a && on < b; pill(160 + i * 300, 26, s, act ? BAD : GRID, 1, { fs: 14, color: act ? BAD : MUT, fill: act ? BADBG : PANEL }); }); }
  function s6(t, c) { const { k, u } = c;
    heads(k);
    if (k <= 2) {
      pyobj(60, 70, 360, 200, 'function wrapper', { stroke: ACC });
      card(240, 180, 240, 60, { rx: 8, text: 'return func(*a, **k)', mono: true, fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: k === 0 ? pop(u, 0.4) : 1 });
      pill(240, 118, '@wraps 없음', BAD, k === 0 ? pop(u, 1.0) : 1, { fs: 14, fill: BADBG });
      if (k === 0) { note(500, 150, '에러는 나지 않는다', fade(u, 1.5)); note(500, 178, '그래서 더 위험하다', fade(u, 1.8), { fill: BAD }); return; }
      if (k === 1) { dot([[480, 300], [240, 300], [240, 212], [240, 300], [480, 300]], seg(u, 0.2, 1.6), ACC, 8); check(520, 300, 12, pop(u, 1.6));
        note(560, 306, '동작은 멀쩡하다', fade(u, 1.7), { fill: GOOD }); return; }
      idCard(500, 90, "'wrapper'", 'None', BAD, { title: 'hello 의 이름표', s: pop(u, 0.3) });
      mono(60, 330, 'print(hello.__name__)', { 'font-size': 15, opacity: fade(u, 0.8) }); mono(330, 330, "→ wrapper (기대: hello)", { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
      note(60, 380, '로거와 문서 생성기가 읽는 값이 여기서 틀어진다', fade(u, 1.8), { fill: MUT }); return; }
    if (k <= 5) { // 정의 시점 vs 호출 시점
      const ax = 80, aw = 800, y = 230;
      el('line', { x1: ax, y1: y, x2: ax + aw, y2: y, stroke: MUT, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)' });
      tx(ax + aw, y + 30, '시간', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      const P = [[160, 'import · @timing', INFO], [480, 'work()', ACC], [700, 'work()', ACC]];
      P.forEach(([x, s, col], i) => { const show = i === 0 ? (k === 3 ? fade(u, 0.3) : 1) : (k >= 4 ? (k === 4 ? fade(u, 0.3 + (i - 1) * 0.8) : 1) : 0.25);
        el('line', { x1: x, y1: y - 10, x2: x, y2: y + 10, stroke: col, 'stroke-width': 3, opacity: show }); mono(x, y + 32, s, { 'font-size': 14.5, fill: col, 'text-anchor': 'middle', 'font-weight': 700, opacity: show }); });
      const said = k === 3 ? pop(u, 0.9) : 1;
      card(160, 160, 160, 36, { rx: 8, text: '장식: work', fs: 14.5, mono: true, stroke: INFO, color: INFO, fill: INFOBG, s: said });
      if (k >= 4) [480, 700].forEach((x, i) => card(x, 160, 100, 36, { rx: 8, text: '실행!', fs: 14.5, stroke: ACC, color: ACC, fill: ACCBG, s: k === 4 ? pop(u, 0.7 + i * 0.8) : 1 }));
      if (k === 3) { note(80, 330, 'timing 몸통의 print 는 장식하는 순간 돈다', fade(u, 1.5)); note(80, 358, 'import 만 해도 찍힌다', fade(u, 1.9), { fill: WARN }); }
      if (k === 4) { note(80, 330, 'wrapper 안의 print 는 호출마다 돈다', fade(u, 2.2)); }
      if (k === 5) { const n1 = 1, n2 = Math.round(tween(0, 2, u)); hbar(240, 300, 300, n1, 2, { col: INFO, h: 20, text: '장식: work  1회' }); hbar(240, 340, 300, n2, 2, { col: ACC, h: 20, text: '실행!  ' + n2 + '회', u: 1 });
        tx(80, 315, '정의 시점', { 'font-size': 14, fill: INFO, 'font-weight': 700 }); tx(80, 355, '호출 시점', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
      return; }
    // k 6: 상태 공유
    [0, 1].forEach((i) => { const s = pop(u, 0.2 + i * 0.4); pyobj(60, 80 + i * 130, 200, 90, 'Cart', { op: s }); mono(80, 145 + i * 130, 'Cart().add()', { 'font-size': 14.5, opacity: s });
      grow(262, 125 + i * 130, 440, 200, E(u, 0.6 + i * 0.6, 1.1 + i * 0.6), ACC); });
    pyobj(450, 120, 260, 150, 'wrapper (add)', { stroke: ACC });
    const n = u < 1.1 ? 0 : u < 1.7 ? 1 : 2;
    card(580, 210, 140, 50, { rx: 8, text: 'count  ' + n, mono: true, fs: 18, stroke: WARN, color: WARN, fill: WARNBG });
    const T = ['add 호출 1회', 'add 호출 2회'];
    terminal(740, 120, 200, 110, T, n, { title: '출력' });
    note(60, 380, '장식할 때 한 번 생긴 count 를 두 객체가 함께 쓴다', fade(u, 2.0), { fill: BAD }); }

  const quiz = [
    { q: 'g = greet를 실행한 뒤 g.__name__은 무엇인가?',
      o: ["'g'", "'greet'", '오류가 난다. g는 함수가 아니다'], a: 1,
      why: 'g = greet는 호출이 아니라 같은 함수 객체에 이름을 하나 더 붙인 것이다. 객체의 __name__은 처음 정의한 greet 그대로다.' },
    { q: '@log_calls를 붙인 say_hi를 부르면 실제로 실행되는 함수는 무엇인가?',
      o: ['log_calls', '원본 say_hi', 'log_calls가 돌려준 wrapper'], a: 2,
      why: '@log_calls는 say_hi = log_calls(say_hi)와 같다. 이름 say_hi가 wrapper를 가리키므로 [before], hi, [after] 순서로 찍힌다.' },
    { q: '@functools.wraps(func)를 빼고 감싼 add의 __name__은 무엇인가?',
      o: ["'wrapper'", "'add'", "'log_calls'"], a: 0,
      why: '이름 add는 wrapper 객체를 가리킨다. wraps가 __name__과 __doc__을 원본에서 복사해 주지 않으면 wrapper와 None이 보인다.' },
    { q: '@retry(times=3)에서 retry(times=3)가 먼저 호출되면 무엇이 돌아오는가?',
      o: ['감싼 wrapper', '함수를 받을 decorator', '원본 risky의 결과'], a: 1,
      why: '바깥 층은 설정만 받고 decorator를 돌려준다. 그 decorator가 risky를 받아 wrapper를 돌려준다.' },
    { q: 'fib(30)에 lru_cache를 붙이면 호출 수가 2,692,537번에서 31번으로 줄어드는 까닭은 무엇인가?',
      o: ['같은 n을 다시 부르면 계산 없이 저장값을 돌려줘서', 'lru_cache가 재귀를 반복문으로 바꿔서', '파이썬이 정수 연산을 병렬로 해서'], a: 0,
      why: 'fib(0)부터 fib(30)까지 31개만 실제로 계산하고 나머지 28번은 저장값을 꺼낸다. cache_info()의 misses=31, hits=28이 그 수다.' },
    { q: 'timing 데코레이터의 몸통에 둔 print("장식")은 언제 실행되는가?',
      o: ['work()를 부를 때마다', '프로그램이 끝날 때', '@timing을 붙여 함수를 정의하는 순간 한 번'], a: 2,
      why: '데코레이터 몸통은 장식할 때, 즉 import 시점에 한 번 돈다. wrapper 안의 print("실행!")만 호출마다 돈다.' },
  ];

  const summary = [
    '함수는 객체라서 이름에 담고, 인자로 넘기고, 반환할 수 있다. 안쪽 함수는 바깥 변수를 셀에 붙잡는다.',
    '@deco는 f = deco(f) 재대입이다. 이름 f가 wrapper를 가리키고 원본은 클로저의 func로만 남는다.',
    'wrapper(*args, **kwargs)로 인자를 그대로 넘기고, @functools.wraps로 원본 이름과 docstring을 옮긴다.',
    '인자 있는 데코레이터는 설정, 데코레이터, 래퍼 세 겹이다. 몸통은 장식할 때 한 번, wrapper는 호출마다 돈다.',
  ];
  const review = [
    { q: '로그에 함수 이름이 전부 wrapper로 찍힌다. 데코레이터에서 먼저 확인할 것은?',
      o: ['wrapper 위에 @functools.wraps(func)가 있는지', 'return result가 빠졌는지', '인자에 *args를 썼는지'], a: 0,
      why: 'wraps가 없으면 감싼 함수의 __name__이 wrapper가 된다. 이름을 읽는 로거와 문서 도구가 함께 틀어진다.' },
    { q: '@retry를 괄호 없이 붙였더니 risky()를 부를 때 TypeError가 났다. 까닭은 무엇인가?',
      o: ['times가 0이라 한 번도 시도하지 않아서', '함수가 times 자리에 들어가 risky가 decorator로 바뀌어서', 'lru_cache와 함께 써서'], a: 1,
      why: '@retry는 risky = retry(risky)다. 돌아온 decorator는 func 인자를 기다리므로 risky()는 인자가 빠졌다는 TypeError를 낸다.' },
    { q: '메서드에 호출 수를 세는 데코레이터를 붙였더니 서로 다른 Cart 객체의 수가 합쳐져 나온다. 원인은 무엇인가?',
      o: ['nonlocal을 써서 값이 사라졌다', 'self가 wrapper로 전달되지 않았다', 'count가 장식할 때 한 번 생겨 모든 호출이 같이 쓴다'], a: 2,
      why: 'wrapper 바깥 변수는 데코레이터가 한 번 돌 때 하나만 생긴다. 객체마다 따로 세려면 값을 self에 둔다.' },
  ];

  R.page({ title: '데코레이터 들여다보기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
