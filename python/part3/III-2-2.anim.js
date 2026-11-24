/* III-2-2 타입 힌트와 mypy — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 출력은 python 3.12.10 과 mypy 2.4.1 로 코드 블록을 직접 돌려 얻었다.
 *   hints_basic.py:16 error: Argument 1 to "greet" has incompatible type "int"; expected "str"  [arg-type]  (실행은 'Hello, 123! ')
 *   Item "None" of "str | None" has no attribute "upper"  [union-attr]
 *   app.py:16 Argument "age" to "User" ... expected "int", app.py:20 Argument 1 to "birthday" ... expected "User", Found 2 errors in 1 file
 *   python app.py → 31 다음 AttributeError: 'str' object has no attribute 'age'
 *   pitfalls.py 는 mypy 가 Success (Any 경로), 실행하면 AttributeError: 'dict' object has no attribute 'foo'
 *   shout(123) → AttributeError: 'int' object has no attribute 'upper' */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, terminal, tokens, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  function pyobj(x, y, w, h, type, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, opacity: op, 'stroke-dasharray': o.dash });
    el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    mono(x + 12, y + 21, type, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: op }); }
  function code(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, pad = 16;
    const w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + pad + 18, h = lines.length * lh + 14, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    lines.forEach((s, i) => { const yy = y + 7 + i * lh, shown = o.show ? clamp(o.show - i) : 1; if (shown <= 0) return;
      const bg = o.bg && o.bg(i); if (bg) el('rect', { x: x + 4, y: yy, width: w - 8, height: lh, rx: 4, fill: bg, opacity: op * shown });
      else if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: yy, width: w - 8, height: lh, rx: 4, fill: HL, opacity: op * shown });
      spans(x + pad, yy + fs + 2, tokens(s), { 'font-size': fs, opacity: op * shown }); });
    // 글자 위치: 줄 i 의 c 번째 글자 x
    return { w, h, lh, line: (i) => y + 7 + i * lh + lh / 2, cx: (i, c) => x + pad + tw(lines[i].slice(0, c), fs) }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (lines, u, a = 0.2, b = 1.6) => lerp(0, lines.length, E(u, a, b));
  // 빨간 물결 밑줄 (mypy 가 짚은 자리)
  function squiggle(x1, x2, y, u, col) { if (u <= 0) return; const n = Math.max(2, Math.floor((x2 - x1) / 6)), e = x1 + (x2 - x1) * clamp(u);
    let d = `M${x1},${y}`; for (let i = 1; i <= n; i++) { const x = x1 + (x2 - x1) * (i / n); if (x > e) break; d += ` L${x},${y + (i % 2 ? 4 : 0)}`; }
    el('path', { d, fill: 'none', stroke: col || BAD, 'stroke-width': 2 }); }
  // 이름표 + 타입 딱지
  function hintTag(cx, cy, name, type, s, o) { o = o || {}; const w = tw(name, 15) + 26;
    pill(cx, cy, name, INFO, s, { mono: true, fs: 15, fill: INFOBG });
    card(cx + w / 2 + tw(type, 13.5) / 2 + 16, cy, tw(type, 13.5) + 18, 24, { rx: 4, text: type, mono: true, fs: 13.5, stroke: WARN, color: WARN, fill: WARNBG, s, dash: o.dash }); }
  // mypy 돋보기 아이콘
  function lens(cx, cy, s, col) { const g = R.G(cx, cy, s); el('circle', { cx: 0, cy: 0, r: 16, fill: PANEL, stroke: col || INK, 'stroke-width': 3 }, g);
    el('line', { x1: 11, y1: 11, x2: 24, y2: 24, stroke: col || INK, 'stroke-width': 4, 'stroke-linecap': 'round' }, g); }

  // ---------- 1. 타입 힌트 문법 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { [['count', 'int', '0'], ['name', 'str', '"kim"'], ['pi', 'float', '3.14'], ['ok', 'bool', 'True']].forEach(([n, ty, v], i) => {
        const y = 70 + i * 74, s = pop(u, 0.2 + i * 0.3); hintTag(110, y, n, ty, s);
        grow(260, y, 420, y, E(u, 0.5 + i * 0.3, 0.9 + i * 0.3), ACC); card(480, y, 110, 44, { rx: 8, text: v, mono: true, fs: 16, s }); });
      note(620, 120, '딱지는 이름에 붙은 표기일 뿐', fade(u, 1.8)); note(620, 148, '값은 하나도 바뀌지 않는다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 1 || k === 3 || k === 4) {
      const L = ['def greet(name: str, times: int = 1) -> str:', '    return f"Hello, {name}! " * times'];
      const cd = code(40, 50, k === 1 ? L.slice(0, 1) : L, { fs: 16 });
      if (k === 1) { const parts = [[10, 19, '매개변수 타입', INFO], [21, 35, '기본값 있는 매개변수', ACC], [37, 43, '반환 타입', WARN]];
        parts.forEach(([a, b, lab, col], i) => { const x1 = cd.cx(0, a), x2 = cd.cx(0, b), s = E(u, 0.3 + i * 0.5, 0.8 + i * 0.5);
          el('path', { d: `M${x1},${cd.line(0) + 18} V${cd.line(0) + 26} H${x2} V${cd.line(0) + 18}`, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: s });
          tx((x1 + x2) / 2, cd.line(0) + 50 + (i % 2) * 22 + 60, lab, { 'font-size': 14.5, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: s });
          grow((x1 + x2) / 2, cd.line(0) + 28, (x1 + x2) / 2, cd.line(0) + 92 + (i % 2) * 22, s, col, { plain: true }); });
        note(40, 330, '기본값은 타입 뒤에 = 로 적는다', fade(u, 2.0)); return; }
      // k 3: 실행 / k 4: mypy
      const x1 = cd.cx(0, 10), x2 = cd.cx(0, 19);
      code(40, 160, ['greet(123)'], { fs: 16 });
      if (k === 3) { el('rect', { x: x1 - 4, y: cd.line(0) - 14, width: x2 - x1 + 8, height: 28, rx: 6, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
        fly(120, 186, (x1 + x2) / 2, cd.line(0), seg(u, 0.45, 1.2), '123', { mono: true, fill: INFO });
        mono((x1 + x2) / 2, cd.line(0) - 22, '검사 안 함', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        const T = ['>>> greet(123)', "'Hello, 123! '"]; terminal(320, 160, 360, 90, T, typed(T, u, 1.2, 2.0), { title: 'python 3.12' });
        note(40, 320, '인터프리터는 힌트를 보지 않는다', fade(u, 1.9), { fill: WARN }); return; }
      lens(110, 280, pop(u, 0.2), BAD); squiggle(40 + 16 + tw('greet(', 16), 40 + 16 + tw('greet(123', 16), 160 + 7 + 25 + 6, E(u, 0.5, 1.0));
      const T = ['$ mypy hints_basic.py', ['hints_basic.py:16: error: Argument 1 to "greet" has', 'var(--bad)'], ['    incompatible type "int"; expected "str"  [arg-type]', 'var(--bad)'], 'Found 1 error in 1 file (checked 1 source file)'];
      terminal(160, 240, 770, 150, T, typed(T, u, 0.6, 2.2), { title: '실행 전 검사', fs: 13.5 }); return; }
    if (k === 2) { code(40, 50, ['def log(msg: str) -> None:', '    print(msg)'], { fs: 16 });
      code(40, 160, ['r = log("hi")'], { fs: 16 }); const T = ['hi']; terminal(340, 150, 200, 70, T, typed(T, u, 0.4, 0.8), { title: '출력' });
      hintTag(110, 300, 'r', 'None', pop(u, 1.0)); grow(220, 300, 330, 300, E(u, 1.3, 1.7), ACC); card(380, 300, 90, 40, { rx: 8, text: 'None', mono: true, fs: 16, stroke: MUT, color: MUT, s: pop(u, 1.6) });
      note(560, 300, '돌려주는 값이 없다는 것도 계약이다', fade(u, 2.0)); return; }
    // k 5: __annotations__ 사전
    pyobj(40, 50, 400, 210, 'function greet', {});
    mono(56, 104, '__annotations__', { 'font-size': 15, fill: WARN, 'font-weight': 700 });
    [['name', "<class 'str'>"], ['times', "<class 'int'>"], ['return', "<class 'str'>"]].forEach(([a, b], i) => { const s = pop(u, 0.3 + i * 0.3);
      card(130, 140 + i * 38, 120, 30, { rx: 6, text: "'" + a + "'", mono: true, fs: 14, stroke: INK, s }); card(320, 140 + i * 38, 170, 30, { rx: 6, text: b, mono: true, fs: 14, stroke: WARN, color: WARN, s }); });
    note(500, 120, '힌트는 사전으로 보관만 한다', fade(u, 1.4)); note(500, 148, '검사는 IDE·mypy 몫', fade(u, 1.8), { fill: MUT });
    note(40, 320, '런타임 검증이 필요하면 Pydantic 같은 도구를 따로 둔다', fade(u, 2.2), { fill: MUT }); }

  // ---------- 2. 컨테이너와 Optional ----------
  function typeBox(cx, cy, parts, s, o) { o = o || {}; let x = cx - parts.reduce((a, [t]) => a + tw(t, 15) + 30, 0) / 2;
    parts.forEach(([t, col, op]) => { const w = tw(t, 15) + 24; card(x + w / 2, cy, w, 36, { rx: 6, text: t, mono: true, fs: 15, stroke: col, color: col, fill: PANEL, s, op: op ?? 1 }); x += w + 6; }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 60, 'nums: list[int]', { 'font-size': 16, 'font-weight': 700, fill: WARN });
      cells(40, 76, [1, 2, 3], { w: 60, h: 44, gap: 8, style: (i) => ({ s: pop(u, 0.3 + i * 0.2) }) });
      [0, 1, 2].forEach((i) => tx(70 + i * 68, 140, 'int', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.9 + i * 0.1) }));
      mono(480, 60, 'scores: dict[str, int]', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
      [['"kim"', 90], ['"lee"', 88]].forEach(([a, b], i) => { const s = pop(u, 1.4 + i * 0.3); card(540, 98 + i * 50, 100, 40, { rx: 6, text: a, mono: true, fs: 15, s }); grow(594, 98 + i * 50, 640, 98 + i * 50, s, MUT); card(690, 98 + i * 50, 80, 40, { rx: 6, text: String(b), mono: true, fs: 15, s }); });
      tx(540, 210, 'str', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 2.0) }); tx(690, 210, 'int', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 2.0) });
      note(40, 300, '대괄호 안에 원소 타입까지 적는다 (3.9+ 는 소문자 내장 타입)', fade(u, 2.2)); return; }
    if (k === 1) { mono(40, 60, 'pair: tuple[int, str]', { 'font-size': 16, 'font-weight': 700, fill: WARN });
      cells(40, 76, ['1', '"a"'], { w: 70, h: 44, gap: 8, style: (i) => ({ s: pop(u, 0.3 + i * 0.2) }) });
      ['int', 'str'].forEach((ty, i) => tx(75 + i * 78, 140, ty, { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.8) }));
      tx(40, 170, '자리마다 타입이 정해진 길이 2', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      mono(480, 60, 'many: tuple[int, ...]', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) });
      const n = Math.round(lerp(1, 5, E(u, 1.4, 2.4))); cells(480, 76, Array.from({ length: n }, (_, i) => i + 1), { w: 56, h: 44, gap: 8, style: () => ({ stroke: INFO }) });
      tx(480, 170, '모두 int, 길이는 자유', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); return; }
    // k 2~6: Optional
    const head = k === 2 ? pop(u, 0.2) : 1;
    mono(40, 50, 'Optional[str]', { 'font-size': 18, 'font-weight': 800, fill: WARN, opacity: head });
    tx(210, 50, '=', { 'font-size': 20, 'font-weight': 800, opacity: k === 2 ? fade(u, 0.8) : 1 });
    typeBox(320, 44, [['str', INFO, k === 6 ? 1 : 1], ['|', MUT], ['None', MUT, k === 6 && u > 1.2 ? 0.25 : 1]], k === 2 ? pop(u, 1.0) : 1);
    if (k === 2) { note(40, 120, '"str 이거나 None"', fade(u, 1.5)); note(40, 148, '3.10+ 는 str | None 표기를 권한다', fade(u, 1.8), { fill: MUT });
      note(40, 176, '기본값이 None 이라는 뜻이 아니다', fade(u, 2.2), { fill: WARN }); return; }
    // 표와 find_user(2)
    tx(40, 110, 'table', { 'font-size': 14, fill: MUT, 'font-weight': 700, class: 'mono' });
    card(80, 140, 60, 36, { rx: 6, text: '1', mono: true, fs: 15 }); grow(112, 140, 146, 140, 1, MUT); card(190, 140, 80, 36, { rx: 6, text: '"kim"', mono: true, fs: 15 });
    if (k === 3) { mono(300, 146, 'table.get(2)', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.3) });
      dot([[300, 170], [80, 180], [80, 200], [300, 230]], seg(u, 0.5, 1.6), INFO, 7); cross(110, 190, 8, pop(u, 1.2));
      card(360, 230, 90, 36, { rx: 8, text: 'None', mono: true, fs: 15, stroke: MUT, color: MUT, s: pop(u, 1.7) }); note(480, 236, '키 2 가 없으면 None', fade(u, 1.9)); return; }
    hintTag(110, 240, 'user', 'str | None', 1);
    grow(268, 240, 340, 240, k === 4 ? E(u, 0.3, 0.8) : 1, ACC); card(390, 240, 90, 36, { rx: 8, text: 'None', mono: true, fs: 15, stroke: MUT, color: MUT, s: k === 4 ? pop(u, 0.7) : 1 });
    if (k === 4) { note(480, 246, 'find_user(2) 의 결과가 실제로 None', fade(u, 1.3)); return; }
    if (k === 5) { const cd = code(40, 300, ['user.upper()'], { fs: 16 }); lens(250, 330, pop(u, 0.3), BAD); squiggle(56, 56 + tw('user.upper()', 16), 340, E(u, 0.5, 1.0));
      const T = [['error: Item "None" of "str | None" has no attribute "upper"', 'var(--bad)'], ['  [union-attr]', 'var(--bad)']];
      terminal(300, 290, 640, 110, T, typed(T, u, 0.9, 1.8), { title: 'mypy', fs: 13.5 }); void cd; return; }
    if (k === 6) { // 좁히기
      code(40, 300, ['if user is not None:', '    print(user.upper())'], { fs: 16, bg: (i) => (i === 1 ? GOODBG : null) });
      zone(460, 290, 470, 110, null, { fill: GOODBG, stroke: GOOD, op: fade(u, 1.0) });
      tx(480, 320, '블록 안에서 user 의 타입', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.0) });
      typeBox(560, 360, [['str', INFO]], pop(u, 1.4)); mono(640, 366, '← None 이 빠졌다 (narrowing)', { 'font-size': 14.5, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    // k 7: Union
    code(500, 90, ['def parse(x: Union[int, str]) -> int:', '    return int(x)'], { fs: 14.5 });
    [['"7"', 'str', 0.3], ['7', 'int', 0.9]].forEach(([v, ty, a], i) => { fly(520 + i * 120, 190, 700, 280, seg(u, a, a + 0.7), v, { mono: true, fill: i ? INFO : ACC });
      tx(520 + i * 120, 220, ty, { 'font-size': 13.5, fill: WARN, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, a) }); });
    card(760, 300, 70, 40, { rx: 8, text: '7', mono: true, fs: 17, stroke: GOOD, color: GOOD, s: pop(u, 1.8) }); tx(820, 306, 'int', { 'font-size': 13.5, fill: WARN, class: 'mono', opacity: fade(u, 1.9) });
    note(500, 380, 'int | str 와 같은 뜻, set[str] 도 같은 규칙', fade(u, 2.2), { fill: MUT }); }

  // ---------- 3. Any · Callable · TypeVar · Protocol ----------
  // 함수 모양: 입력 꽂이와 출력 꽂이
  function shape(cx, cy, ins, out, col, s, o) { o = o || {}; const h = Math.max(70, ins.length * 40 + 20);
    card(cx, cy, 150, h, { rx: 10, stroke: col, fill: PANEL, s, text: o.label || '', mono: true, fs: 14.5, color: col });
    ins.forEach((t, i) => { const y = cy - (ins.length - 1) * 20 + i * 40; el('line', { x1: cx - 75 - 40, y1: y, x2: cx - 75, y2: y, stroke: col, 'stroke-width': 3, opacity: s });
      mono(cx - 75 - 46, y + 5, t, { 'font-size': 14.5, fill: col, 'text-anchor': 'end', 'font-weight': 700, opacity: s }); });
    el('line', { x1: cx + 75, y1: cy, x2: cx + 115, y2: cy, stroke: col, 'stroke-width': 3, opacity: s }); mono(cx + 121, cy + 5, out, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: s }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { code(40, 40, ['from __future__ import annotations', 'from typing import Any, Callable, TypeVar, Protocol'], { fs: 15, hi: (i) => i === 0 && u < 1.2 });
      [['Any', BAD], ['Callable', INFO], ['TypeVar', ACC], ['Protocol', WARN]].forEach(([n, col], i) => pill(150 + i * 200, 200, n, col, pop(u, 0.8 + i * 0.3), { mono: true, fs: 16 }));
      note(40, 290, '첫 줄은 아직 정의 안 된 타입도 문자열 없이 쓰게 해 준다', fade(u, 2.0), { fill: MUT }); return; }
    if (k === 1) { code(40, 40, ['def loose(x: Any) -> Any:', '    return x.anything.goes'], { fs: 16 });
      // 검사가 꺼진 구역
      const s = fade(u, 0.6); el('rect', { x: 40, y: 150, width: 880, height: 120, rx: 10, fill: SOFT, stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: s });
      for (let i = 0; i < 18; i++) el('line', { x1: 60 + i * 48, y1: 260, x2: 100 + i * 48, y2: 160, stroke: OFF, 'stroke-width': 1.5, opacity: s * 0.7 });
      lens(140, 210, pop(u, 0.9), MUT); mono(200, 216, 'mypy: 아무 말 없음', { 'font-size': 16, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.2) });
      note(40, 320, 'Any 는 타입이 아니라 검사 포기 선언에 가깝다', fade(u, 1.8), { fill: BAD }); note(40, 348, '없는 속성을 이어 붙여도 통과한다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 2 || k === 3) { mono(40, 50, 'Callable[[int, int], int]', { 'font-size': 18, 'font-weight': 800, fill: INFO });
      shape(400, 190, ['int', 'int'], 'int', INFO, k === 2 ? pop(u, 0.4) : 1, { label: k === 3 ? 'x + y' : 'fn' });
      if (k === 2) { note(40, 330, '인자 목록을 대괄호에, 반환 타입을 뒤에', fade(u, 1.4)); note(40, 358, '함수 자체의 모양을 적는다', fade(u, 1.8), { fill: MUT }); return; }
      code(40, 290, ['apply(lambda x, y: x + y, 3, 4)'], { fs: 15 });
      fly(200, 300, 250, 170, seg(u, 0.4, 1.0), '3', { mono: true, fill: INFO }); fly(240, 300, 250, 210, seg(u, 0.6, 1.2), '4', { mono: true, fill: INFO });
      fly(600, 190, 660, 190, seg(u, 1.4, 2.0), '7', { mono: true, fill: GOOD, stay: true });
      note(560, 320, '모양이 맞으면 람다든 def 든 통과', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 4 || k === 5) { code(40, 40, ['T = TypeVar("T")', 'def first(items: list[T]) -> T:', '    return items[0]'], { fs: 16 });
      if (k === 4) { // 입력의 T 와 출력의 T 를 잇는 고리
        const a = [40 + 16 + tw('def first(items: list[', 16), 98], b = [40 + 16 + tw('def first(items: list[T]) -> ', 16), 98];
        const p = el('path', { d: `M${a[0] + 5},${a[1] + 14} C${a[0] + 5},${a[1] + 120} ${b[0] + 5},${b[1] + 120} ${b[0] + 5},${b[1] + 14}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, pathLength: 100, 'stroke-dasharray': `${E(u, 0.4, 1.4) * 100} 100` });
        void p; note(40, 230, '입력 원소 타입이 곧 출력 타입', fade(u, 1.5), { fill: ACC }); note(40, 258, 'Any 로 적으면 이 연결이 끊긴다', fade(u, 1.9), { fill: MUT }); return; }
      [[['1', '2', '3'], 'int', 'n'], [['"a"', '"b"'], 'str', 's']].forEach(([vals, ty, nm], i) => { const y = 210 + i * 100, s = pop(u, 0.2 + i * 0.8);
        mono(40, y - 18, 'first([' + vals.join(', ') + '])', { 'font-size': 15, opacity: s });
        cells(40, y - 6, vals, { w: 52, h: 36, gap: 6, style: (j) => ({ stroke: j === 0 ? ACC : GRID, s }) });
        grow(60 + vals.length * 58, y + 12, 420, y + 12, E(u, 0.5 + i * 0.8, 1.0 + i * 0.8), ACC);
        mono(440, y + 18, 'T = ' + ty, { 'font-size': 17, fill: ACC, 'font-weight': 800, opacity: fade(u, 0.8 + i * 0.8) });
        hintTag(640, y + 12, nm, ty, pop(u, 1.0 + i * 0.8)); }); return; }
    // k 6, 7: Protocol
    code(40, 40, ['class Closeable(Protocol):', '    def close(self) -> None: ...'], { fs: 16 });
    // 모양 틀: close() 홈이 있는 판
    const s = k === 6 ? pop(u, 0.5) : 1;
    el('path', { d: 'M520,60 H860 V140 H760 V110 H620 V140 H520 Z', fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, opacity: s });
    mono(690, 96, 'close() -> None', { 'font-size': 15, fill: WARN, 'text-anchor': 'middle', 'font-weight': 700, opacity: s });
    if (k === 6) { note(40, 220, '필요한 메서드 모양만 적는다', fade(u, 1.2)); note(40, 248, '상속을 요구하지 않는다', fade(u, 1.6), { fill: MUT }); return; }
    // k 7: 모양이 맞으면 들어간다 (예시 클래스)
    [['File', true], ['Socket', true], ['Point', false]].forEach(([n, ok], i) => { const x = 180 + i * 260, p = E(u, 0.3 + i * 0.4, 1.0 + i * 0.4);
      el('rect', { x: x - 80, y: 300, width: 160, height: 70, rx: 8, fill: PANEL, stroke: ok ? INK : OFF, 'stroke-width': 2 }); mono(x - 66, 324, n, { 'font-size': 15, 'font-weight': 700 });
      if (ok) { el('rect', { x: x - 70, y: 300 - 28 * p, width: 140, height: 28, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.8 }); mono(x, 296 - 28 * p + 18, 'close()', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN }); check(x + 60, 350, 10, pop(u, 1.2 + i * 0.4)); }
      else { mono(x - 66, 354, 'x, y 만 있다', { 'font-size': 14, fill: MUT }); cross(x + 60, 350, 9, pop(u, 1.4 + i * 0.4)); } });
    tx(40, 410, 'File·Socket·Point 는 예시 클래스', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.0) });
    mono(40, 200, 'shutdown(res: Closeable)', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.2) }); }

  // ---------- 4. mypy 정적 검사 ----------
  const APP = ['@dataclass', 'class User:', '    name: str', '    age: int', '', 'def birthday(u: User) -> int:', '    return u.age + 1', '', 'u = User(name="kim", age=30)', 'print(birthday(u))', '', 'bad = User(name="lee", age="thirty")', '', 'birthday("not a user")'];
  const LN = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 20];   // 실제 app.py 줄 번호
  function s4(t, c) { const { k, u } = c;
    const hi = [[0, 1, 2, 3], [5, 6], [8, 9], [11], [11], [13], []][k];
    const cd = code(30, 24, APP, { fs: 14, w: 420, hi: (i) => hi.includes(i) });
    APP.forEach((_, i) => mono(24, cd.line(i) + 5, String(LN[i]), { 'font-size': 13.5, fill: OFF, 'text-anchor': 'end' }));
    if (k === 0) { pyobj(520, 50, 320, 120, 'User', { op: pop(u, 0.5) }); [['name', 'str'], ['age', 'int']].forEach(([a, b], i) => { mono(540, 104 + i * 36, a, { 'font-size': 15, opacity: fade(u, 0.8 + i * 0.2) }); card(700, 98 + i * 36, 70, 28, { rx: 4, text: b, mono: true, fs: 14, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 1.0 + i * 0.2) }); });
      note(520, 230, '필드에 적은 타입이 곧 검사 기준', fade(u, 1.8)); return; }
    if (k === 1) { mono(520, 80, 'birthday(u: User) -> int', { 'font-size': 16, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.3) });
      [['u', 'User'], ['반환', 'int']].forEach(([a, b], i) => { hintTag(560, 140 + i * 50, a, b, pop(u, 0.6 + i * 0.4)); });
      note(520, 270, 'u.age 같은 속성 접근도 함께 검사된다', fade(u, 1.8), { fill: MUT }); return; }
    // 스캔 막대: mypy 가 위에서 아래로 소스를 읽는다
    const upto = k === 2 ? 9 : k === 3 ? 11 : k === 4 ? 11 : 13;
    const from = k === 2 ? 0 : k === 3 ? 9 : k === 4 ? 11 : 11;
    const sy = lerp(cd.line(from), cd.line(upto), E(u, 0.2, 1.2));
    if (k !== 6) el('rect', { x: 30, y: sy - 2, width: 420, height: 4, rx: 2, fill: INFO, opacity: k === 3 ? 0 : 0.8 * (1 - E(u, 1.3, 1.6)) });
    if (k === 2) { check(470, cd.line(9), 9, pop(u, 1.3)); const T = ['$ python app.py', '31']; terminal(520, 60, 380, 90, T, typed(T, u, 1.4, 2.0), { title: '여기까지 실행' });
      note(520, 200, '맞는 코드에는 잔소리가 없다', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 3) { pyobj(520, 50, 320, 120, 'bad: User', { op: pop(u, 0.3) }); mono(540, 104, "name = 'lee'", { 'font-size': 15, opacity: fade(u, 0.6) }); mono(540, 140, "age  = 'thirty'", { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.9) });
      note(520, 220, '실행하면 대입은 그냥 된다', fade(u, 1.4)); note(520, 248, '나중에 age + 1 에서 터진다', fade(u, 1.8), { fill: BAD }); return; }
    const line = (i) => cd.line(i) + 9;
    if (k >= 4) squiggle(30 + 16 + tw('bad = User(name="lee", ', 14), 30 + 16 + tw('bad = User(name="lee", age="thirty"', 14), line(11), k === 4 ? E(u, 1.0, 1.4) : 1);
    if (k >= 5) squiggle(30 + 16 + tw('birthday(', 14), 30 + 16 + tw('birthday("not a user"', 14), line(13), k === 5 ? E(u, 1.0, 1.4) : 1);
    const T = ['$ mypy app.py', ['app.py:16: error: Argument "age" to "User" has', 'var(--bad)'], ['  incompatible type "str"; expected "int"  [arg-type]', 'var(--bad)'],
      ['app.py:20: error: Argument 1 to "birthday" has', 'var(--bad)'], ['  incompatible type "str"; expected "User"  [arg-type]', 'var(--bad)'], 'Found 2 errors in 1 file (checked 1 source file)'];
    const shown = k === 4 ? lerp(1, 3, E(u, 1.2, 2.0)) : k === 5 ? lerp(3, 5, E(u, 1.2, 2.0)) : lerp(5, 6, E(u, 0.2, 0.8));
    terminal(470, 30, 470, 200, T, shown, { title: '파일 · 줄 · 오류코드', fs: 13 });
    if (k === 6) { const T2 = ['$ python app.py', '31', ['AttributeError: \'str\' object has no attribute \'age\'', 'var(--bad)']];
      terminal(470, 250, 470, 112, T2, typed(T2, u, 0.8, 1.8), { title: '실행하면', fs: 13 });
      note(470, 392, 'mypy 는 실행하지 않고 소스를 읽어 두 건을 먼저 찾았다', fade(u, 2.0), { fill: GOOD, 'font-size': 14 }); } }

  // ---------- 5. 실무 함정 ----------
  function heads(on) { [['① 런타임 강제 오해', 0, 2], ['② Optional 미처리', 2, 4], ['③ Any 남용', 4, 7]].forEach(([s, a, b], i) => {
      const act = on >= a && on < b; pill(160 + i * 310, 26, s, act ? BAD : GRID, 1, { fs: 14, color: act ? BAD : MUT, fill: act ? BADBG : PANEL }); }); }
  function s5(t, c) { const { k, u } = c;
    heads(k);
    if (k <= 1) { const cd = code(40, 70, ['def shout(x: str) -> str:', '    return x.upper()'], { fs: 16 });
      if (k === 0) { hintTag(130, 200, 'x', 'str', pop(u, 0.5)); note(40, 270, 'str 을 받는다고 적었으니 안전하다?', fade(u, 1.2)); note(40, 298, '표기는 약속일 뿐 방어벽이 아니다', fade(u, 1.8), { fill: WARN }); return; }
      code(40, 180, ['shout(123)'], { fs: 16 });
      dot([[150, 200], [400, 200], [400, cd.line(1)], [200, cd.line(1)]], seg(u, 0.2, 1.2), INFO, 8);
      el('circle', { cx: 56 + tw('    return x.', 16) + 20, cy: cd.line(1), r: 26, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.2) });
      const T = [['AttributeError: \'int\' object has no attribute \'upper\'', 'var(--bad)']]; terminal(40, 260, 560, 70, T, typed(T, u, 1.4, 1.9), { title: '실행' });
      note(40, 370, '호출 지점이 아니라 본문에서 터진다', fade(u, 2.0), { fill: BAD }); note(620, 286, 'mypy 는 실행 전 arg-type 으로 잡는다', fade(u, 2.3), { fill: GOOD, 'font-size': 14 }); return; }
    if (k <= 3) { code(40, 70, ['def find_user(uid: int) -> Optional[str]:', '    return {1: "kim"}.get(uid)'], { fs: 15 });
      hintTag(110, 180, 'u', 'str | None', pop(u, k === 2 ? 0.5 : 0)); grow(266, 180, 340, 180, k === 2 ? E(u, 0.8, 1.2) : 1, ACC); card(390, 180, 90, 36, { rx: 8, text: 'None', mono: true, fs: 15, stroke: MUT, color: MUT, s: k === 2 ? pop(u, 1.1) : 1 });
      if (k === 2) { note(40, 270, '표기까지는 올바르다', fade(u, 1.5), { fill: GOOD }); note(40, 298, '표기한 뒤 실제로 None 을 처리해야 한다', fade(u, 1.9)); return; }
      [['return u.upper()', BAD, 'union-attr 오류'], ['if u is not None:\n    print(u.upper())', GOOD, 'mypy 통과']].forEach(([s, col, r], i) => { const x = 40 + i * 450, sc = pop(u, 0.3 + i * 0.7);
        const ls = s.split('\n'); code(x, 250, ls, { fs: 15, op: sc, w: 400 }); mono(x, 250 + ls.length * 24 + 44, r, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: sc });
        if (i === 0) squiggle(x + 16 + tw('return ', 15), x + 16 + tw('return u.upper()', 15), 285, E(u, 0.6, 1.0)); else check(x + 380, 270, 10, sc); }); return; }
    // k 4~6: Any 가 흘러간다
    code(40, 70, ['def load() -> Any:', '    return {"score": 90}', 'data = load()'], { fs: 15, hi: (i) => k === 4 && i === 0 });
    const fog = k === 4 ? E(u, 0.6, 2.2) : 1;
    if (k <= 5) { el('rect', { x: 430, y: 60, width: 500 * fog, height: 150, rx: 10, fill: SOFT, stroke: OFF, 'stroke-dasharray': '6 5', 'stroke-width': 2 });
      for (let i = 0; i < 10 * fog; i++) el('line', { x1: 450 + i * 48, y1: 200, x2: 490 + i * 48, y2: 70, stroke: OFF, 'stroke-width': 1.5, opacity: 0.6 });
      mono(450, 100, 'data 이후 검사 꺼짐', { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, k === 4 ? 1.0 : 0) }); }
    if (k === 4) { note(40, 280, '경계에서 Any 로 받는 것까지는 어쩔 수 없다', fade(u, 1.5)); note(40, 308, '문제는 그 Any 를 그대로 흘려보내는 것', fade(u, 1.9), { fill: WARN }); return; }
    if (k === 5) { code(450, 120, ['data.foo.bar'], { fs: 16 });
      const T1 = ['$ mypy pitfalls.py', ['Success: no issues found in 1 source file', 'var(--term)']], T2 = ['$ python pitfalls.py', ['AttributeError: \'dict\' object has no attribute \'foo\'', 'var(--bad)']];
      terminal(40, 230, 420, 90, T1, typed(T1, u, 0.3, 1.0), { title: 'mypy', fs: 13.5 }); terminal(480, 230, 450, 90, T2, typed(T2, u, 1.2, 1.9), { title: '실행', fs: 13.5 });
      note(40, 370, '힌트를 달아 놓고 Any 하나로 그물을 걷어낸 셈', fade(u, 2.2), { fill: BAD }); return; }
    // k 6: 구체 타입으로 좁힌다
    code(40, 200, ['safe: dict[str, int] = load()', 'print(safe["score"])'], { fs: 16, bg: (i) => GOODBG });
    hintTag(560, 120, 'safe', 'dict[str, int]', pop(u, 0.4)); const T = ['90']; terminal(560, 200, 200, 70, T, typed(T, u, 1.0, 1.4), { title: '출력' });
    note(40, 330, '받는 쪽에서 구체 타입을 적으면 그 지점부터 검사가 되살아난다', fade(u, 1.6), { fill: GOOD }); note(40, 358, '또는 Protocol 로 필요한 모양만 좁힌다', fade(u, 2.0), { fill: MUT }); }

  const quiz = [
    { q: 'def greet(name: str)에 greet(123)을 넘겨 실행하면 어떻게 되는가?',
      o: ['TypeError로 호출이 막힌다', "그대로 실행돼 'Hello, 123! '이 나온다", '123이 자동으로 "123"으로 바뀌어 검사를 통과한다'], a: 1,
      why: '인터프리터는 힌트를 보지 않는다. 같은 호출을 mypy에 넣어야 arg-type 오류가 나온다.' },
    { q: 'find_user가 Optional[str]을 돌려줄 때 user.upper()를 바로 부르면 mypy는 무엇을 알려 주는가?',
      o: ['union-attr 오류: None에는 upper가 없다', '아무 말도 하지 않는다', 'arg-type 오류: uid가 틀렸다'], a: 0,
      why: 'str | None 중 None 쪽에는 upper가 없다. if user is not None: 안에서는 타입이 str로 좁혀져 통과한다.' },
    { q: 'def first(items: list[T]) -> T에 first(["a", "b"])를 넘기면 결과의 타입은 무엇으로 추론되는가?',
      o: ['Any', 'list[str]', 'str'], a: 2,
      why: 'TypeVar T는 호출할 때 정해진다. 원소가 str이면 T도 str이라 반환 타입이 str이 된다.' },
    { q: 'mypy app.py가 오류 2건을 보고했다. 이 두 건은 어떻게 찾았는가?',
      o: ['소스를 읽어 타입이 맞물리는지 실행 전에 따져서', '프로그램을 실행해 보다가 예외를 잡아서', '테스트 코드를 돌려서'], a: 0,
      why: 'mypy는 코드를 실행하지 않는다. 그래서 테스트가 닿지 않는 줄의 arg-type 오류도 함께 찾는다.' },
    { q: 'load() -> Any의 결과로 data.foo.bar를 썼다. mypy와 실행 결과는 각각 무엇인가?',
      o: ['둘 다 오류', 'mypy는 통과, 실행하면 AttributeError', 'mypy는 오류, 실행은 성공'], a: 1,
      why: 'Any 경로는 검사가 꺼져 mypy가 Success를 낸다. 실제 값은 dict라 실행하면 foo가 없다는 AttributeError가 난다.' },
  ];

  const summary = [
    '타입 힌트는 이름에 붙인 표기라 인터프리터는 검사하지 않는다. greet(123)도 그대로 실행된다.',
    '없을 수 있는 값은 Optional로 적고 is not None으로 확인한다. 그래야 mypy가 None 접근을 잡는다.',
    'TypeVar는 입력과 출력의 타입을 잇고, Protocol은 상속 없이 메서드 모양만으로 호환을 따진다.',
    'mypy는 실행하지 않고 소스를 읽어 app.py에서 arg-type 오류 2건을 찾았다. Any 경로는 검사가 꺼진다.',
  ];
  const review = [
    { q: '힌트를 꼼꼼히 달았는데 운영에서 AttributeError가 났다. CI에는 pytest만 있다. 먼저 할 일은?',
      o: ['CI에 mypy를 넣어 계약을 검사한다', '힌트를 더 자세히 적는다', '모든 함수에 Any를 붙인다'], a: 0,
      why: '힌트는 도구가 읽어야 쓸모가 있다. mypy를 CI에서 돌리면 잘못된 인자와 None 접근을 실행 전에 막는다.' },
    { q: 'mypy가 통과했는데 실행 중 dict에 없는 속성을 찾다 죽었다. 먼저 의심할 곳은?',
      o: ['Optional 표기가 너무 많다', 'Any를 돌려주는 함수의 결과가 그대로 흘러간 곳', 'dataclass 필드 순서'], a: 1,
      why: 'Any를 지나는 값은 검사가 꺼진다. 받는 쪽에서 dict[str, int] 같은 구체 타입을 적으면 검사가 되살아난다.' },
    { q: 'User(name="lee", age="thirty")가 실행 중에는 아무 오류 없이 만들어졌다. 그 까닭은?',
      o: ['dataclass가 문자열을 int로 바꿔서', 'age 기본값이 있어서', '런타임은 필드 타입을 검사하지 않아서'], a: 2,
      why: 'dataclass도 힌트를 검사하지 않는다. mypy는 같은 줄을 arg-type 오류로 잡고, 실행하면 나중에 age + 1에서 터진다.' },
  ];

  R.page({ title: '타입 힌트와 mypy 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
