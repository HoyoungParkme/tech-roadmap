/* III-2-1 컨텍스트 매니저(with) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 출력은 python 3.12.10 으로 코드 블록을 직접 돌려 얻었다 (data.txt = "hello\nworld\n").
 *   with 뒤 f.closed = True / 예외 시 __exit__ 인자 = (ZeroDivisionError, ZeroDivisionError('division by zero'), traceback)
 *   __exit__ 가 아무것도 돌려주지 않는 __enter__ → as x = None / __exit__ True → 예외가 사라지고 다음 줄 실행
 *   finally 없는 @contextmanager + 예외 → f.closed = False / sqlite 트랜잭션: 정상 1행 commit, 예외 행은 rollback → [(1,)]
 *   with a, b: → open a, open b, body, close b, close a
 *   열린 파일을 리스트에 쥐면 이 Windows 기기에서 8,187개째에 OSError [Errno 24], f 만 다시 대입하면 20,000번도 괜찮다(참조 수 0 → 닫힘)
 *   acquire 만 하고 예외 → lock.locked() True, 다른 acquire(timeout=0.1) → False */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, lock, terminal, tokens, spans, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG, HL } = C;

  function pyobj(x, y, w, h, type, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, opacity: op, 'stroke-dasharray': o.dash });
    el('line', { x1: x, y1: y + 30, x2: x + w, y2: y + 30, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    mono(x + 12, y + 21, type, { 'font-size': 14.5, 'font-weight': 700, fill: o.stroke || INK, opacity: op }); }
  function nameTag(cx, cy, name, x2, y2, u, o) { o = o || {}; const w = tw(name, 15) + 26;
    if (u <= 0) return; pill(cx, cy, name, INFO, o.s ?? 1, { mono: true, fs: 15, fill: INFOBG });
    const sx = x2 < cx ? cx - w / 2 - 2 : cx + w / 2 + 2; grow(sx, cy, x2, y2, clamp(u * 1.6 - 0.4), ACC); }
  function code(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, pad = 16;
    const w = o.w || Math.max(...lines.map((s) => tw(s, fs))) + pad + 18, h = lines.length * lh + 14, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: o.fill || SOFT, stroke: o.stroke || GRID, 'stroke-width': 1.5, opacity: op });
    lines.forEach((s, i) => { const yy = y + 7 + i * lh, shown = o.show ? clamp(o.show - i) : 1; if (shown <= 0) return;
      const bg = o.bg && o.bg(i); if (bg) el('rect', { x: x + 4, y: yy, width: w - 8, height: lh, rx: 4, fill: bg, opacity: op * shown });
      else if (o.hi && o.hi(i)) el('rect', { x: x + 4, y: yy, width: w - 8, height: lh, rx: 4, fill: HL, opacity: op * shown });
      spans(x + pad, yy + fs + 2, tokens(s), { 'font-size': fs, opacity: op * shown }); });
    return { w, h, lh, line: (i) => y + 7 + i * lh + lh / 2 }; }
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const typed = (lines, u, a = 0.2, b = 1.6) => lerp(0, lines.length, E(u, a, b));
  // 파일 객체: 열림/닫힘 등
  function fileObj(x, y, open, o) { o = o || {}; const s = o.s ?? 1;
    pyobj(x, y, 230, 96, 'TextIOWrapper', { op: s, stroke: open ? INK : OFF });
    mono(x + 14, y + 56, "name='data.txt'", { 'font-size': 14.5, opacity: s, fill: open ? INK : MUT });
    el('circle', { cx: x + 22, cy: y + 78, r: 6, fill: open ? (o.leak ? BAD : GOOD) : OFF, opacity: s });
    mono(x + 36, y + 83, open ? (o.leak ? '열린 채 남음' : '열림') : 'closed = True', { 'font-size': 14, fill: open ? (o.leak ? BAD : GOOD) : MUT, 'font-weight': 700, opacity: s }); }
  // 번개(예외)
  function bolt(x, y, s, col) { if (s <= 0) return; const g = R.G(x, y, s); el('path', { d: 'M4,-18 L-8,2 L0,2 L-4,18 L10,-4 L2,-4 Z', fill: col || BAD }, g); }

  // ---------- 1. 왜 with 인가 ----------
  const TF = ['f = open("data.txt")', 'try:', '    data = f.read()', 'finally:', '    f.close()'];
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: try/finally 가 한 줄씩 자란다
    const nL = [1, 3, 5, 5, 5, 5][k];
    tx(30, 34, '예전 방식', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const cd = code(30, 44, TF.slice(0, nL), { w: 300, show: k <= 2 ? lerp(k === 0 ? 0 : [1, 1, 3][k], nL, E(u, 0.1, 0.9)) : nL, hi: (i) => (k === 0 && i === 0) || (k === 1 && (i === 1 || i === 2)) || (k === 2 && i >= 3), op: k >= 3 ? 0.6 : 1 });
    const open = !(k === 2 && u > 1.8) && !(k >= 4 && u > (k === 4 ? 1.6 : 0)) && k !== 5;
    fileObj(420, 50, k === 1 ? true : open, { s: k === 0 ? pop(u, 0.5) : 1, leak: k === 1 && u > 1.6 });
    nameTag(720, 98, 'f', 652, 98, k === 0 ? E(u, 0.8, 1.4) : 1);
    if (k === 0) { note(380, 190, '여는 순간 닫을 책임이 생긴다', fade(u, 1.4), { fill: WARN }); return; }
    if (k === 1 || k === 2) { // 본문에서 예외가 터진다
      bolt(330, cd.line(2), pop(u, 0.6), BAD); mono(345, cd.line(2) - 22, 'OSError', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.7) });
      if (k === 1) { grow(330, cd.line(2), 330, 250, E(u, 0.9, 1.5), BAD); note(30, 290, '예외가 나면 닫는 줄에 닿지 못한다', fade(u, 1.7), { fill: BAD }); return; }
      const route = [[330, cd.line(2)], [330, cd.line(4)], [300, cd.line(4)]]; dot(route, seg(u, 0.8, 1.6), BAD, 7);
      note(30, 220, 'finally 는 예외가 나도 돈다', fade(u, 1.8), { fill: GOOD }); note(30, 248, '맞지만 쓸 때마다 다섯 줄', fade(u, 2.2), { fill: MUT }); return; }
    // k ≥ 3: with 두 줄
    tx(30, 214, 'with', { 'font-size': 14, fill: ACC, 'font-weight': 700 });
    const wl = ['with open("data.txt") as f:', '    data = f.read()'];
    const wd = code(30, 224, wl, { w: 300, fill: ACCBG, stroke: ACC, show: k === 3 ? lerp(0, 2, E(u, 0.2, 1.0)) : 2, hi: (i) => k === 3 && i === 0 });
    if (k === 3) { grow(180, 186, 180, 220, E(u, 1.0, 1.4), ACC); note(380, 230, 'open 과 try 를 한 줄이 맡는다', fade(u, 1.4)); note(380, 258, '닫는 코드는 쓰지 않는다', fade(u, 1.8), { fill: MUT }); return; }
    if (k === 4) { dot([[180, wd.line(1)], [180, 300], [380, 300]], seg(u, 0.2, 1.4), ACC, 8);
      note(380, 300, '블록을 벗어나는 순간 close', fade(u, 1.4), { fill: GOOD }); note(380, 328, '정상이든 예외든 같다', fade(u, 1.8), { fill: MUT }); return; }
    const T = ['>>> print(f.closed)', 'True'];
    terminal(380, 210, 300, 90, T, typed(T, u, 0.2, 1.0), { title: 'python 3.12' });
    [['try/finally', 5, WARN], ['with', 2, ACC]].forEach(([a, n, col], i) => { tx(380, 340 + i * 34, a, { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 1.0 + i * 0.3) });
      R.hbar(500, 326 + i * 34, 300, n, 5, { col, h: 18, text: n + '줄', u: E(u, 1.0 + i * 0.3, 1.8 + i * 0.3) }); }); }

  // ---------- 2. __enter__ / __exit__ 프로토콜 ----------
  const LANE = [['__init__', 120], ['__enter__', 290], ['본문', 470], ['__exit__', 650], ['다음 줄', 840]];
  function s2(t, c) { const { k, u } = c;
    // 클래스 상자: 메서드가 하나씩 생긴다
    pyobj(20, 40, 300, 170, 'class ManagedFile', { stroke: INFO });
    const ms = [['__init__(self, path)', 0], ['__enter__(self)', 1], ['__exit__(self, exc_type, exc, tb)', 3]];
    ms.forEach(([m, from], i) => { if (k < from) return; const s = k === from ? pop(u, 0.3) : 1;
      card(170, 92 + i * 40, 280, 32, { rx: 6, text: m, mono: true, fs: from === 3 ? 13.5 : 14, stroke: from === 3 ? WARN : from === 1 ? ACC : INK, color: from === 3 ? WARN : from === 1 ? ACC : INK, s }); });
    if (k === 0) { pyobj(360, 60, 240, 70, 'ManagedFile', { op: pop(u, 0.9) }); mono(374, 113, "path = 'data.txt'", { 'font-size': 14.5, opacity: fade(u, 1.2) });
      note(360, 180, '아직 with 에 쓸 수 없는 평범한 클래스', fade(u, 1.6), { fill: MUT }); note(360, 208, '__init__ 은 만들 때, __enter__ 는 들어갈 때', fade(u, 2.0)); return; }
    if (k <= 2) { pyobj(360, 60, 240, 70, 'ManagedFile', {}); mono(374, 113, 'self.f ●', { 'font-size': 14.5 });
      const fs = k === 1 ? pop(u, 0.8) : 1; pyobj(680, 50, 230, 80, 'TextIOWrapper', { op: fs }); mono(694, 106, '열림', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fs });
      grow(444, 108, 676, 92, k === 1 ? E(u, 1.0, 1.5) : 1, ACC);
      if (k === 1) { note(360, 200, '__enter__ 에서 자원을 얻는다', fade(u, 1.6)); return; }
      nameTag(560, 230, 'f', 790, 134, E(u, 0.3, 1.0)); mono(600, 290, 'return self.f  →  as f', { 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 0.9) });
      note(360, 340, 'return 이 없으면 f 는 None', fade(u, 1.7), { fill: WARN }); return; }
    if (k === 3) { // 세 인자: 정상 / 예외
      tx(330, 70, '__exit__ 가 받는 세 인자', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      const rows = [['정상 종료', ['None', 'None', 'None'], GOOD], ['1 / 0 예외', ['ZeroDivisionError', "ZeroDivisionError('division…')", '<traceback>'], BAD]];
      ['exc_type', 'exc', 'tb'].forEach((h, j) => mono([440, 590, 850][j], 104, h, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.4) }));
      rows.forEach(([name, vals, col], i) => { const y = 140 + i * 56; tx(330, y + 5, name, { 'font-size': 14.5, fill: col, 'font-weight': 700, opacity: fade(u, 0.6 + i * 0.7) });
        vals.forEach((v, j) => mono([440, 590, 850][j], y + 5, v, { 'font-size': 13.5, fill: col, opacity: fade(u, 0.7 + i * 0.7 + j * 0.15) })); });
      note(330, 290, '어느 쪽이든 __exit__ 는 불린다', fade(u, 2.2), { fill: GOOD }); return; }
    // k 4, 5: 생명주기 띠
    const y0 = 290;
    el('line', { x1: 60, y1: y0, x2: 900, y2: y0, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    LANE.forEach(([n, x]) => { card(x, y0, tw(n, 14.5) + 26, 34, { rx: 17, text: n, mono: true, fs: 14.5, stroke: n === '__exit__' ? WARN : n === '본문' ? INK : ACC, color: n === '__exit__' ? WARN : n === '본문' ? INK : ACC, fill: PANEL }); });
    if (k === 4) { bolt(470, y0 - 46, pop(u, 0.3), BAD); dot([[470, y0], [650, y0]], seg(u, 0.5, 1.1), BAD, 8);
      // return False → 위로 전파 / return True → 사라짐
      grow(650, y0 - 20, 650, 150, E(u, 1.2, 1.8), BAD); card(650, 132, 170, 32, { rx: 16, text: 'return False', mono: true, fs: 14, stroke: BAD, color: BAD, s: pop(u, 1.4) });
      mono(740, 175, '→ 예외가 밖으로 전파', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.8) });
      card(840, y0 + 60, 160, 32, { rx: 16, text: 'return True', mono: true, fs: 14, stroke: WARN, color: WARN, s: pop(u, 2.0) });
      mono(840, y0 + 102, '예외가 조용히 사라진다', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    // k 5: 실제로 돌려 본 출력
    dot(LANE.slice(0, 4).map(([n, x]) => [x, y0]), seg(u, 0.2, 1.6), ACC, 8);
    const T = ['→ __enter__: 자원 획득', '→ __exit__: 정리', ['ZeroDivisionError 전파, f.closed = True', 'var(--bad)']];
    terminal(330, 60, 600, 140, T, u < 0.6 ? 0 : u < 1.4 ? 1 : u < 2.0 ? 2 : 3, { title: 'with ManagedFile("data.txt") as f:  1 / 0' }); }

  // ---------- 3. @contextmanager ----------
  const GL = ['@contextmanager', 'def opened(path):', '    f = open(path)       # __enter__', '    try:', '        yield f          # as f', '    finally:', '        f.close()        # __exit__', '        print("closed")'];
  function s3(t, c) { const { k, u } = c;
    const bg = (i) => (k >= 1 && i === 2 ? INFOBG : k >= 2 && (i === 3 || i === 4) ? WARNBG : k >= 3 && i >= 5 ? GOODBG : null);
    const cd = code(30, 40, GL, { w: 420, bg, hi: (i) => k === 0 && i === 0, show: k === 0 ? lerp(0, 8, E(u, 0.1, 1.2)) : 8 });
    if (k === 0) { card(560, 110, 170, 48, { rx: 10, text: '제너레이터 함수', fs: 15, stroke: INK, s: pop(u, 0.4) });
      grow(650, 110, 720, 110, E(u, 0.9, 1.4), ACC); mono(690, 72, '@contextmanager', { 'font-size': 13.5, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      card(820, 110, 170, 48, { rx: 10, text: '컨텍스트 매니저', fs: 15, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.5) });
      note(560, 220, '클래스 대신 함수 하나로', fade(u, 2.0)); note(560, 248, 'from contextlib import contextmanager', fade(u, 2.2), { fill: MUT, class: 'mono', 'font-size': 14 }); return; }
    // 오른쪽: 대응표
    const MAP = [['yield 이전', '__enter__', INFO, INFOBG, 1], ['yield 값', 'as 뒤 이름', WARN, WARNBG, 2], ['yield 이후', '__exit__', GOOD, GOODBG, 3]];
    MAP.forEach(([a, b, col, bgc, from], i) => { if (k < from) return; const s = k === from ? pop(u, 0.3) : 1, y = 70 + i * 64;
      card(590, y, 170, 44, { rx: 8, text: a, fs: 15, stroke: col, color: col, fill: bgc, s }); grow(680, y, 730, y, k === from ? E(u, 0.6, 1.0) : 1, MUT);
      card(820, y, 160, 44, { rx: 8, text: b, mono: true, fs: 15, stroke: col, color: col, s: k === from ? pop(u, 0.9) : 1 }); });
    if (k === 1) { note(30, 290, 'yield 앞에서 자원을 연다', fade(u, 1.2)); note(30, 318, '이 부분이 __enter__ 자리다', fade(u, 1.6), { fill: INFO }); return; }
    if (k === 2) { el('rect', { x: 456, y: cd.line(4) - 14, width: 36, height: 28, rx: 6, fill: WARN, opacity: fade(u, 1.2) }); mono(474, cd.line(4) + 5, '⏸', { 'font-size': 15, 'text-anchor': 'middle', fill: PANEL, opacity: fade(u, 1.2) });
      note(30, 290, '여기서 멈추고 with 본문이 돈다', fade(u, 1.5)); note(30, 318, '본문 예외는 이 yield 자리로 되던져진다', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 3) { // finally 유무 비교 (예외가 났을 때)
      bolt(470, cd.line(4), pop(u, 0.3), BAD); dot([[470, cd.line(4)], [470, cd.line(6)], [440, cd.line(6)]], seg(u, 0.5, 1.2), BAD, 7);
      [['finally 있음', 'closed = True', GOOD], ['finally 없음', 'closed = False', BAD]].forEach(([a, b, col], i) => { const s = pop(u, 1.3 + i * 0.5);
        card(640 + i * 200, 300, 180, 64, { rx: 10, text: a + '\n' + b, fs: 14.5, stroke: col, color: col, s }); });
      note(560, 380, '예외가 난 뒤 f.closed 를 재 본 값', fade(u, 2.2), { fill: MUT }); return; }
    // k 4: 써 본다
    const T = ['>>> with opened("data.txt") as f:', '...     print(f.read())', 'hello', 'world', '', 'closed'];
    terminal(470, 250, 460, 160, T, typed(T, u, 0.2, 2.2), { title: 'python 3.12' });
    note(30, 290, '클래스 버전과 똑같이 동작한다', fade(u, 1.0)); note(30, 318, '마지막 줄 closed 가 정리의 증거', fade(u, 2.3), { fill: GOOD }); }

  // ---------- 4. 실무: 락 · 트랜잭션 · 다중 컨텍스트 ----------
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) {
      pyobj(60, 60, 260, 150, 'threading.Lock', { stroke: INK });
      const locked = k === 1 && u > 0.6 && u < 2.0;
      lock(190, 140, locked, locked ? BAD : GOOD, 1.6);
      mono(190, 196, locked ? 'locked' : 'unlocked', { 'font-size': 14.5, 'text-anchor': 'middle', fill: locked ? BAD : GOOD, 'font-weight': 700 });
      card(560, 135, 160, 56, { rx: 10, text: 'counter  ' + (k === 1 && u > 1.3 ? 1 : 0), mono: true, fs: 17, stroke: INFO, color: INFO, s: k === 0 ? pop(u, 0.6) : 1 });
      if (k === 0) { note(60, 270, 'Lock 객체 자체가 이미 컨텍스트 매니저다', fade(u, 1.2)); return; }
      dot([[380, 300], [380, 135], [480, 135], [380, 135], [380, 300], [800, 300]], seg(u, 0.2, 2.4), ACC, 8);
      mono(390, 330, 'with lock:', { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      [['acquire', 0.6], ['counter += 1', 1.3], ['release', 2.0]].forEach(([s, at], i) => pill(600 + i * 0, 250 + i * 40 - 30, s, i === 1 ? INFO : ACC, pop(u, at), { mono: true, fs: 14 }));
      return; }
    if (k <= 4) { // 트랜잭션
      dbIcon(150, 170, 'sqlite3 (:memory:)', {});
      code(300, 40, ['@contextmanager', 'def transaction(conn):', '    try:', '        yield conn', '        conn.commit()', '    except Exception:', '        conn.rollback()', '        raise'],
        { fs: 14, w: 300, hi: (i) => (k === 2 ? i <= 1 : k === 3 ? i === 3 || i === 4 : i >= 5) });
      tx(650, 60, '테이블 t', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const rows = k === 2 ? [] : k === 3 ? (u > 1.2 ? [['1', GOOD]] : [['1', WARN]]) : [['1', GOOD]].concat(u < 1.6 ? [['2', WARN]] : []);
      rows.forEach(([v, col], i) => card(700, 92 + i * 44, 100, 36, { rx: 6, text: 'x = ' + v, mono: true, fs: 15, stroke: col, color: col, fill: col === GOOD ? GOODBG : WARNBG, s: k === 4 && i === 1 ? 1 - E(u, 1.3, 1.6) : 1 }));
      if (k === 2) { note(650, 140, '획득 · 사용 · 정리', fade(u, 1.0)); note(650, 168, '구조가 같으면 무엇이든', fade(u, 1.3), { fill: MUT }); return; }
      if (k === 3) { pill(760, 260, 'commit', GOOD, pop(u, 1.2), { mono: true, fill: GOODBG }); note(300, 290, '본문이 무사히 끝나면 yield 다음 줄', fade(u, 1.6), { fill: GOOD }); return; }
      bolt(830, 136, pop(u, 0.4), BAD); pill(760, 260, 'rollback', BAD, pop(u, 1.2), { mono: true, fill: BADBG });
      grow(760, 280, 760, 330, E(u, 1.8, 2.2), BAD); mono(760, 352, 'raise → 밖으로', { 'font-size': 14.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) });
      mono(300, 300, 'SELECT → [(1,)]', { 'font-size': 15, fill: INK, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k 5: 다중 컨텍스트 — 쌓였다가 역순으로
    code(30, 40, ['with open("in.txt") as fi, open("out.txt", "w") as fo:', '    fo.write(fi.read())'], { fs: 14.5 });
    const ev = [['open  fi', 0.3], ['open  fo', 0.7], ['본문', 1.1], ['close fo', 1.6], ['close fi', 2.0]];
    const stackN = u < 0.3 ? 0 : u < 0.7 ? 1 : u < 1.6 ? 2 : u < 2.0 ? 1 : 0;
    ['fi', 'fo'].forEach((n, i) => { if (i >= stackN) return; card(220, 300 - i * 52, 180, 44, { rx: 8, text: n, mono: true, fs: 16, stroke: i ? ACC : INFO, color: i ? ACC : INFO, fill: PANEL }); });
    el('line', { x1: 110, y1: 326, x2: 330, y2: 326, stroke: INK, 'stroke-width': 3 }); tx(220, 350, '열린 자원', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    ev.forEach(([s, at], i) => { mono(520, 150 + i * 36, (i + 1) + '. ' + s, { 'font-size': 15, fill: s.startsWith('close') ? GOOD : s === '본문' ? INK : INFO, 'font-weight': 700, opacity: fade(u, at) }); });
    note(520, 360, '정리는 연 순서의 반대', fade(u, 2.3), { fill: GOOD }); }

  // ---------- 5. 실무 함정 ----------
  function heads(on) { [['① fd 누수', 0, 3], ['② 예외 삼킴', 3, 4], ['③ 락 해제 누락', 4, 6]].forEach(([s, a, b], i) => {
      const act = on >= a && on < b; pill(160 + i * 300, 26, s, act ? BAD : GRID, 1, { fs: 14, color: act ? BAD : MUT, fill: act ? BADBG : PANEL }); }); }
  function fdGrid(n, total, col) { const cols = 30, rows = 8; for (let i = 0; i < cols * rows; i++) { const on = i < (n / total) * cols * rows;
      el('rect', { x: 40 + (i % cols) * 14.5, y: 70 + Math.floor(i / cols) * 14.5, width: 11, height: 11, rx: 2, fill: on ? col : SOFT, stroke: on ? 'none' : GRID, 'stroke-width': 1 }); } }
  function s5(t, c) { const { k, u } = c;
    heads(k);
    if (k <= 2) {
      tx(40, 60, '열린 파일 디스크립터', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      if (k === 0) { const n = Math.round(lerp(0, 3000, E(u, 0.2, 2.2))); fdGrid(n, 8187, WARN);
        mono(500, 120, 'opened 목록: ' + n.toLocaleString('en-US') + '개', { 'font-size': 16, fill: WARN, 'font-weight': 700 });
        note(500, 160, '에러는 아직 없다', fade(u, 1.5)); note(40, 230, 'f 만 다시 대입하면 CPython 은 참조 수 0 으로 닫아 준다', fade(u, 1.9), { fill: MUT, 'font-size': 14 });
        note(40, 256, '목록에 쥐고 있으면 닫히지 않고 쌓인다', fade(u, 2.2), { fill: WARN, 'font-size': 14 }); return; }
      if (k === 1) { const n = Math.round(lerp(3000, 8187, E(u, 0.1, 1.4))); fdGrid(n, 8187, n >= 8187 ? BAD : WARN);
        mono(500, 120, 'opened 목록: ' + n.toLocaleString('en-US') + '개', { 'font-size': 16, fill: n >= 8187 ? BAD : WARN, 'font-weight': 700 });
        card(670, 180, 360, 40, { rx: 8, text: 'OSError: [Errno 24] Too many open files', mono: true, fs: 13.5, fill: BAD, stroke: 'none', color: PANEL, s: pop(u, 1.5) });
        note(40, 230, '이 Windows 기기에서 8,187개째 (Linux 기본 한도는 보통 1024)', fade(u, 1.9), { fill: MUT, 'font-size': 14 });
        note(40, 256, '터지는 곳은 다음에 파일을 여는 무고한 코드다', fade(u, 2.3), { fill: BAD, 'font-size': 14 }); return; }
      // with 로 감싸면 한 번에 하나
      const ph = Math.floor(t * 2.2) % 30; fdGrid(0, 1, GOOD); el('rect', { x: 40 + ph * 14.5, y: 70, width: 11, height: 11, rx: 2, fill: GOOD });
      mono(500, 120, '열린 파일: 늘 1개', { 'font-size': 16, fill: GOOD, 'font-weight': 700 });
      code(40, 230, ['for path in paths:', '    with open(path) as f:', '        process(f.read())'], { hi: (i) => i === 1, op: fade(u, 0.4) });
      note(500, 260, '반복 하나가 끝날 때마다 닫힌다', fade(u, 1.4), { fill: GOOD }); return; }
    if (k === 3) { // __exit__ True
      code(40, 70, ['class Bad:', '    def __exit__(self, exc_type, exc, tb):', '        return True'], { hi: (i) => i === 2 });
      el('rect', { x: 500, y: 70, width: 260, height: 130, rx: 10, fill: SOFT, stroke: GRID }); mono(516, 100, 'with Bad():', { 'font-size': 15, fill: ACC, 'font-weight': 700 });
      mono(530, 140, 'raise ValueError', { 'font-size': 15, fill: BAD }); bolt(740, 136, pop(u, 0.3), BAD);
      const p = E(u, 0.5, 1.4); card(lerp(620, 620, p), lerp(170, 260, p), 130, 30, { rx: 15, text: 'ValueError', mono: true, fs: 14, fill: BAD, stroke: 'none', color: PANEL, op: 1 - E(u, 1.2, 1.6) });
      cross(620, 260, 14, pop(u, 1.5)); mono(500, 320, '다음 줄이 그냥 실행된다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.8) });
      note(40, 300, '정리만 하려면 아무것도 돌려주지 않는다 (None)', fade(u, 2.2)); return; }
    // k 4, 5: 락
    const bad = k === 4, locked = bad ? u > 0.4 : u > 0.4 && u < 1.6;
    lock(150, 150, locked, locked ? BAD : GOOD, 2);
    mono(150, 210, locked ? 'locked' : 'unlocked', { 'font-size': 15, 'text-anchor': 'middle', fill: locked ? BAD : GOOD, 'font-weight': 700 });
    code(300, 70, bad ? ['lock.acquire()', 'risky()          # 예외!', 'lock.release()   # 닿지 못함'] : ['with lock:', '    risky()      # 예외!', '# 나가며 release'], { hi: (i) => i === 1 });
    bolt(560, 120, pop(u, 0.9), BAD);
    if (bad) { cross(580, 156, 9, pop(u, 1.2));
      card(300 + 150, 260, 300, 44, { rx: 10, text: '다른 스레드: acquire(timeout=0.1)', mono: true, fs: 13.5, stroke: INK, s: pop(u, 1.5) });
      mono(620, 266, '→ False', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) });
      note(300, 340, '락이 풀리지 않아 다른 스레드가 멈춘다', fade(u, 2.2), { fill: BAD }); return; }
    mono(300, 266, 'lock.locked()  →  False', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
    note(300, 330, '세 함정의 해법은 하나, 정리를 with 에 맡긴다', fade(u, 2.2), { fill: GOOD }); }

  const quiz = [
    { q: 'with open("data.txt") as f: 블록 안에서 예외가 나면 f는 어떻게 되는가?',
      o: ['열린 채 남는다', 'with가 블록을 나가며 닫는다', '프로그램이 끝날 때 닫힌다'], a: 1,
      why: 'with는 try/finally를 문법으로 묶은 것이라 정상이든 예외든 블록을 나가는 순간 close가 불린다. 그래서 f.closed가 True다.' },
    { q: '__exit__가 True를 돌려주면 블록 안에서 난 예외는 어떻게 되는가?',
      o: ['그대로 밖으로 전파된다', '__enter__에서 다시 난다', '삼켜져서 사라진다'], a: 2,
      why: '진리값을 돌려주면 예외 억제다. 정리만 하고 예외를 올려보내려면 아무것도 돌려주지 않거나 False를 돌려준다.' },
    { q: '@contextmanager 함수에서 yield를 try/finally로 감싸지 않으면 본문 예외 때 무슨 일이 생기는가?',
      o: ['yield 뒤의 정리 코드가 건너뛰어져 자원이 열린 채 남는다', 'with 문이 문법 오류를 낸다', '예외가 자동으로 삼켜진다'], a: 0,
      why: '본문 예외는 yield 자리로 되던져진다. finally가 없으면 close가 실행되지 않아 f.closed가 False로 남았다.' },
    { q: 'with open(a) as fi, open(b) as fo: 블록이 끝날 때 닫히는 순서는 무엇인가?',
      o: ['fi 먼저, fo 나중', 'fo 먼저, fi 나중', '둘이 동시에'], a: 1,
      why: '여러 컨텍스트는 쌓였다가 역순으로 풀린다. 실행해 보면 close b, close a 순서로 찍힌다.' },
    { q: 'lock.acquire()와 lock.release() 사이에서 예외가 나면 무엇이 문제인가?',
      o: ['락이 두 번 풀린다', '예외가 사라진다', 'release에 닿지 못해 락이 잠긴 채 남는다'], a: 2,
      why: '예외가 나면 release 줄을 건너뛴다. 다른 스레드의 acquire(timeout=0.1)는 False를 받고 기다리게 된다. with lock:이면 예외에도 풀린다.' },
  ];

  const summary = [
    '자원을 열면 닫을 책임이 생긴다. try/finally로 지킬 수 있지만 쓸 때마다 다섯 줄을 반복해야 한다.',
    'with는 __enter__로 자원을 얻어 as에 넘기고, 블록을 나갈 때 예외가 나도 __exit__를 부른다.',
    '@contextmanager에서는 yield 앞이 진입, 뒤가 정리다. yield는 try/finally로 감싸야 예외에도 닫힌다.',
    '파일, Lock, 트랜잭션을 with에 맡기면 fd 누수, 예외 삼킴, 락 해제 누락을 함께 막는다.',
  ];
  const review = [
    { q: '직접 만든 컨텍스트 매니저를 쓰는 코드에서 에러가 났는데 로그에 아무것도 안 남는다. 먼저 볼 곳은?',
      o: ['__enter__의 반환값', '__exit__가 True를 돌려주는지', 'with 블록의 들여쓰기'], a: 1,
      why: '__exit__가 참값을 돌려주면 블록 안 예외가 밖으로 나가지 않는다. 정리만 하려면 None을 돌려준다.' },
    { q: 'DB 작업 중 예외가 났는데 일부 행이 저장돼 있었다. transaction 컨텍스트 매니저에서 빠졌을 가능성이 큰 것은?',
      o: ['except에서 conn.rollback()을 부르는 줄', 'yield 앞의 open', 'with 문의 as 이름'], a: 0,
      why: '예외 경로에서 rollback을 해야 본문이 쓴 변경이 되돌려진다. 정상 경로만 commit하고 예외 경로는 rollback 후 raise한다.' },
    { q: '수천 개 파일을 처리하는 배치가 중간에 Too many open files로 죽었다. 가장 알맞은 수정은?',
      o: ['프로세스 파일 한도를 크게 올린다', '파일을 연 뒤 time.sleep을 넣는다', '반복 안에서 with open(path) as f:로 연다'], a: 2,
      why: 'with를 반복 안에 두면 반복 하나가 끝날 때마다 닫혀 열린 파일이 늘 하나다. 한도를 올리는 것은 누수를 미룰 뿐이다.' },
  ];

  R.page({ title: 'with 블록 들여다보기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
