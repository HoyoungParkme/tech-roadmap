/* III-2-2 예외 처리 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 예외 = 빨간 공. 공은 던져진 자리에서 호출 스택을 거꾸로 타고 내려가 자기를 잡아 줄 catch 를 찾는다.
 * 색: Error = BAD, checked = INFO, unchecked(RuntimeException) = WARN. 예시 값(id=7 등)은 그림 안에 "예시"라고 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const ph = (c, k0, a, b) => (c.k > k0 ? 1 : c.k < k0 ? 0 : E(c.u, a, b));
  const pk = (c, k0, a) => (c.k > k0 ? 1 : c.k < k0 ? 0 : pop(c.u, a));

  // 예외 공: 가운데 (x, y), 이름표는 오른쪽
  function ball(x, y, name, col, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.02) return;
    el('circle', { cx: x, cy: y, r: 11 * s, fill: col || BAD, opacity: o.op ?? 1 });
    if (name && s > 0.6) mono(x + (o.left ? -18 : 18), y + 5, name, { 'font-size': o.fs || 14, 'font-weight': 800, fill: col || BAD, 'text-anchor': o.left ? 'end' : 'start', opacity: o.op ?? 1 }); }
  function node(cx, cy, name, col, s, o) { o = o || {};
    card(cx, cy, tw(name, o.fs || 14) + 24, 32, { rx: 8, stroke: col, sw: 2.2, fill: o.fill || PANEL, text: name, fs: o.fs || 14, fw: 800, mono: true, color: col, s, op: o.op }); }
  const edge = (a, b, u, col) => grow(a[0], a[1] + 16, b[0], b[1] - 16, u, col || GRID, { plain: true, sw: 2 });

  // ---------- 1. Throwable 계층 ----------
  const HP = { Throwable: [480, 46], Error: [180, 128], Exception: [620, 128], OOM: [110, 212], SOE: [292, 212], IO: [462, 212], SQL: [618, 212], RT: [800, 212], NPE: [800, 290], IAE: [800, 330], IOOBE: [800, 370] };
  function s1(t, c) { const { k, u } = c;
    node(...HP.Throwable, 'Throwable', INK, pk(c, 0, 0.2), { fs: 15 });
    if (k === 0) sub(480, 100, 'throw · catch 할 수 있는 것은 이 아래뿐이다', fade(u, 1.0), { fill: INK, 'font-weight': 700 });
    if (k >= 1) { edge(HP.Throwable, HP.Error, ph(c, 1, 0.1, 0.5), BAD); node(...HP.Error, 'Error', BAD, pk(c, 1, 0.4), { fs: 15 });
      edge(HP.Error, HP.OOM, ph(c, 1, 0.7, 1.0), BAD); edge(HP.Error, HP.SOE, ph(c, 1, 0.8, 1.1), BAD);
      node(...HP.OOM, 'OutOfMemoryError', BAD, pk(c, 1, 1.0)); node(...HP.SOE, 'StackOverflowError', BAD, pk(c, 1, 1.2));
      sub(200, 262, 'JVM 수준 사고 · 잡지 않는다', ph(c, 1, 1.5, 1.9), { fill: BAD, 'font-weight': 700 }); }
    if (k >= 2) { edge(HP.Throwable, HP.Exception, ph(c, 2, 0.1, 0.5), INFO); node(...HP.Exception, 'Exception', INFO, pk(c, 2, 0.4), { fs: 15 });
      edge(HP.Exception, HP.IO, ph(c, 2, 0.7, 1.0), INFO); edge(HP.Exception, HP.SQL, ph(c, 2, 0.8, 1.1), INFO);
      node(...HP.IO, 'IOException', INFO, pk(c, 2, 1.0)); node(...HP.SQL, 'SQLException', INFO, pk(c, 2, 1.2));
      sub(540, 262, 'checked · 컴파일러가 처리를 강제', ph(c, 2, 1.5, 1.9), { fill: INFO, 'font-weight': 700 }); }
    if (k >= 3) { edge(HP.Exception, HP.RT, ph(c, 3, 0.1, 0.5), WARN); node(...HP.RT, 'RuntimeException', WARN, pk(c, 3, 0.4));
      [['NPE', 'NullPointerException'], ['IAE', 'IllegalArgumentException'], ['IOOBE', 'IndexOutOfBoundsException']].forEach(([key, n], i) => {
        node(HP[key][0], HP[key][1], n, WARN, pk(c, 3, 0.8 + i * 0.25), { fs: 13.5 }); });
      grow(800, 228, 800, 274, ph(c, 3, 0.6, 0.9), WARN, { plain: true });
      sub(800, 402, 'unchecked · 강제 없음 · 대개 버그', ph(c, 3, 1.6, 2.0), { fill: WARN, 'font-weight': 700 }); }
    if (k === 4) { // isChecked(): Exception 이면서 RuntimeException 이 아닌 것
      card(210, 306, 330, 40, { rx: 10, stroke: INK, sw: 2, text: 'Exception && !RuntimeException', fs: 14, mono: true, s: pop(u, 0.2) });
      [['IOException', INFO, 'true', GOOD], ['NullPointerException', WARN, 'false', BAD], ['OutOfMemoryError', BAD, 'false', BAD]].forEach(([n, col, r, rc], i) => { const a = 0.6 + i * 0.6, y = 292;
        fly(560, 340, 440, 306, seg(u, a, a + 0.4), n.replace('Exception', 'Ex.').replace('OutOfMemoryError', 'OOM'), { fill: col, mono: true });
        if (u > a + 0.45) mono(60, 346 + i * 24, n.replace('Exception', 'Ex.').replace('OutOfMemoryError', 'OOM') + ' → ' + r, { 'font-size': 14, 'font-weight': 800, fill: rc, opacity: fade(u, a + 0.45) }); }); }
    if (k === 5) { // catch (Exception e) 그물
      const f = E(u, 0.2, 0.9);
      el('rect', { x: 400, y: 104, width: 552 * f, height: 290, rx: 16, fill: INFOBG, opacity: 0.35, stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' });
      mono(410, 396, 'catch (Exception e)', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
      const fall = E(u, 1.0, 2.2); ball(110, lerp(250, 380, fall), 'OOM', BAD, { s: pop(u, 1.0) });
      if (u > 2.0) tx(190, 385, '그물 밖 · 잡히지 않는다', { 'font-size': 14.5, fill: BAD, 'font-weight': 800 }); }
  }

  // ---------- 2. checked vs unchecked ----------
  function gate(open, col) { el('rect', { x: 596, y: 40, width: 14, height: 300, rx: 4, fill: col || GRID });
    lbl(603, 30, 'javac', 1, { fill: col || MUT, class: 'mono' });
    if (!open) el('rect', { x: 585, y: 150, width: 36, height: 80, rx: 6, fill: BAD, opacity: 0.85 }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 5) { // 두 열 비교 (페이지 데이터 compare)
      const D = c.beat.compare; [[D.checked, INFO, 250], [D.unchecked, WARN, 710]].forEach(([d, col, cx], i) => { const s = pop(u, 0.2 + i * 0.4);
        card(cx, 200, 400, 300, { rx: 14, stroke: col, sw: 2.4, s });
        if (s < 0.5) return; lbl(cx, 82, d.title, 1, { fill: col, 'font-size': 16 });
        [d.forced, d.rule, d.when, d.fail].forEach((v, j) => tx(cx - 180, 132 + j * 56, v, { 'font-size': 15, 'font-weight': j === 0 ? 800 : 600, fill: j === 3 ? BAD : INK, opacity: fade(u, 0.5 + i * 0.4 + j * 0.2) })); });
      banner(480, 384, '차이는 하나 · 컴파일러가 처리를 강제하느냐', pop(u, 1.8)); return; }
    const top = k <= 2;
    gate(!(k === 1 && u > 0.9), k === 1 && u > 0.9 ? BAD : k >= 3 ? WARN : GRID);
    if (top) { R.spans(40, 70, [['String readFirstLine(String path) ', {}], ['throws IOException', { fill: k === 1 ? OFF : INFO, 'font-weight': 800, 'text-decoration': k === 1 && u > 0.4 ? 'line-through' : null }]], { 'font-size': 15 });
      mono(60, 120, 'new FileReader(path)', { 'font-size': 15 }); mono(60, 170, 'r.readLine()', { 'font-size': 15 }); }
    if (k === 0) { dot([[400, 70], [596, 70], [800, 70]], seg(u, 0.5, 1.8), INFO, 8); check(840, 70, 12, pop(u, 1.8)); sub(780, 120, '선언했으니 통과', fade(u, 1.9), { fill: GOOD, 'font-weight': 700 });
      sub(300, 230, 'throws = 이 메서드를 부르면 이 예외를 받을 수 있다는 계약', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
    if (k === 1) { dot([[400, 70], [580, 70]], seg(u, 0.5, 1.0), BAD, 8);
      mono(40, 268, 'error: unreported exception FileNotFoundException;', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(40, 292, '       must be caught or declared to be thrown', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
      sub(790, 200, '처리하거나 넘기거나 · 둘 중 하나', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); }
    if (k === 2) { ball(320, 114, 'FileNotFoundException', INFO, { s: pop(u, 0.3) }); ball(220, 164, 'IOException', INFO, { s: pop(u, 0.8) });
      grow(320, 102, 360, 80, E(u, 1.2, 1.6), INFO); grow(220, 152, 340, 82, E(u, 1.4, 1.8), INFO);
      sub(300, 230, '파일 없음·읽기 실패는 버그가 아니라 바깥 상황', fade(u, 1.9), { fill: INFO, 'font-weight': 700 }); }
    if (k >= 3) { mono(40, 70, 'int parsePositive(String s)', { 'font-size': 15, 'font-weight': 700 }); mono(60, 120, 'Integer.parseInt(s)', { 'font-size': 15 });
      sub(300, 92, 'throws 선언 없음', 1, { fill: MUT, 'font-weight': 700 });
      if (k === 3) { ball(270, 114, '', WARN, { s: pop(u, 0.3) }); mono(60, 150, 'NumberFormatException', { 'font-size': 14.5, fill: WARN, 'font-weight': 800, opacity: fade(u, 0.4) });
        dot([[280, 114], [596, 114], [880, 114]], seg(u, 0.8, 2.0), WARN, 9); sub(760, 160, '강제 없이 지나간다', fade(u, 1.8), { fill: WARN, 'font-weight': 700 });
        sub(300, 230, '선언이 없다고 안전한 것이 아니다', fade(u, 2.1), { fill: INK, 'font-weight': 700 }); } }
    if (k === 4) { mono(60, 190, 'if (n <= 0) throw new IllegalArgumentException(…)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(60, 220, 'parsePositive("-5")  // 예시 입력', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4) });
      ball(420, 260, '"양수가 아님: -5"', WARN, { s: pop(u, 0.7), left: true });
      // 아무도 안 잡으면 스택을 타고 끝까지
      ['parsePositive', 'handle', 'main', 'Thread'].forEach((f, i) => card(780, 150 + i * 50, 200, 38, { rx: 6, stroke: i === 3 ? BAD : GRID, sw: 2, text: f, fs: 14, mono: true, s: pop(u, 0.3 + i * 0.1), color: i === 3 ? BAD : INK }));
      dot([[430, 260], [660, 150], [780, 150], [780, 300]], seg(u, 1.0, 2.3), WARN, 9);
      if (u > 2.3) cross(900, 300, 10, pop(u, 2.3)); sub(780, 350, '아무도 안 잡으면 스레드가 끝난다', fade(u, 2.3), { fill: BAD, 'font-weight': 700 }); }
  }

  // ---------- 3. 전파와 catch ----------
  const FR = ['main()', 'service()', 'repository()', 'readLine()'];
  const fy = (i) => 330 - i * 66;
  function s3(t, c) { const { k, u } = c;
    tx(60, 34, '호출 스택 (위로 쌓인다)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const nF = k === 0 ? 2 : 4;
    for (let i = 0; i < nF; i++) { const s = (k === 0 && i === 1) ? pop(u, 0.8) : (k === 1 && i >= 2) ? pop(u, 0.3 + (i - 2) * 0.4) : 1;
      const st = c.beat.stack && c.beat.stack.frames ? c.beat.stack.frames[i] : null;
      card(200, fy(i), 280, 52, { rx: 8, stroke: i === 0 ? INFO : i === 3 ? BAD : INK, sw: 2.2, s, fill: i === 0 && k >= 3 ? INFOBG : PANEL });
      if (s > 0.5) mono(80, fy(i) + 6, FR[i], { 'font-size': 15.5, 'font-weight': 800 });
      if (s > 0.5 && k >= 2 && (i === 1 || i === 2)) mono(320, fy(i) + 6, '통과', { 'font-size': 14, fill: MUT, 'font-weight': 700, 'text-anchor': 'end', opacity: k === 2 ? fade(u, i === 2 ? 0.6 : 1.2) : 1 }); }
    if (k === 0) { grow(200, fy(0) - 26, 200, fy(1) + 28, E(u, 0.3, 0.8), INFO); mono(360, fy(0) + 6, 'try { service(); }', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.4) }); }
    if (k === 1) { const b = pop(u, 1.3); ball(370, fy(3), 'FileNotFoundException', BAD, { s: b });
      sub(560, fy(3) + 40, '"app.conf" 없음 · IOException 의 하위', fade(u, 1.7), { fill: BAD, 'font-weight': 700 }); }
    // 공이 아래로 (main 쪽으로) 내려간다
    if (k >= 2) { const pos = k === 2 ? lerp(3, 1, E(u, 0.3, 1.6)) : 0; const y = lerp(fy(3), fy(0), clamp((3 - pos) / 3));
      const yy = k === 2 ? fy(Math.max(0, pos)) : fy(0); ball(370, k === 2 ? fy(3) + (fy(1) - fy(3)) * E(u, 0.3, 1.6) : fy(0), k >= 3 ? '' : 'FileNotFound…', BAD); }
    // 오른쪽: main 의 catch 들
    if (k >= 3) { const rows = [['catch (FileNotFoundException e)', '설정 파일 없음 · 기본값', INFO], ['catch (IOException | SQLException e)', 'log + IllegalStateException', WARN], ['finally', 'metrics.record(…) · 항상', GOOD]];
      rows.forEach(([a, b, col], i) => { const y = 90 + i * 92, on = (k === 3 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 2), s = k === 3 ? pop(u, 0.2 + i * 0.25) : 1;
        card(705, y, 470, 70, { rx: 10, stroke: on ? col : GRID, sw: on ? 3 : 1.8, fill: on ? PANEL : SOFT, s });
        if (s > 0.5) { mono(486, y - 6, a, { 'font-size': 14.5, 'font-weight': 800, fill: on ? col : MUT }); tx(486, y + 20, b, { 'font-size': 14, fill: on ? INK : MUT }); } });
      if (k === 3) { dot([[380, fy(0)], [470, 90]], seg(u, 1.0, 1.6), BAD, 8); check(920, 90, 10, pop(u, 1.6));
        sub(705, 372, '좁은 타입이 위 · IOException 을 먼저 쓰면 아래 절은 도달 불가', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
      if (k === 4) { ball(370, fy(0), 'SQLException', BAD, { s: pop(u, 0.2), left: true }); dot([[380, fy(0)], [470, 182]], seg(u, 0.5, 1.1), BAD, 8);
        fly(705, 210, 705, 380, seg(u, 1.4, 2.4), 'IllegalStateException(…, e)', { mono: true, fill: WARN }); }
      if (k === 5) { [0, 1].forEach((i) => dot([[470, 90 + i * 92], [470, 274]], seg(u, 0.3 + i * 0.5, 0.9 + i * 0.5), GOOD, 7)); sub(705, 340, '성공해도, 예외가 나도 실행된다', fade(u, 1.4), { fill: GOOD, 'font-weight': 700 });
        sub(705, 372, 'finally 에서 다시 던지면 원래 예외를 덮는다', fade(u, 1.9), { fill: BAD, 'font-weight': 700 }); } }
  }

  // ---------- 4. try-with-resources ----------
  // 자원 수명 막대: 열린 구간 [a, b] (0~1 비율)
  function life(y, name, a, b, col, o) { o = o || {}; const x0 = 210, w = 640;
    mono(60, y + 6, name, { 'font-size': 15, 'font-weight': 800, fill: col });
    el('line', { x1: x0, y1: y, x2: x0 + w, y2: y, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
    if (b > a) el('rect', { x: x0 + w * a, y: y - 9, width: w * (b - a), height: 18, rx: 9, fill: col, opacity: 0.8 });
    return (f) => x0 + w * f; }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { tx(60, 44, '옛 방식 · finally 에서 손으로 닫는다', { 'font-size': 16, 'font-weight': 800 });
      const X = life(120, 'r', 0.05, k === 0 ? 0.05 + 0.6 * E(u, 0.3, 1.6) : 0.65, INFO);
      if (k === 0) { mono(60, 200, 'BufferedReader r = null;  try { r = new …; }', { 'font-size': 14.5, opacity: fade(u, 0.2) });
        mono(60, 228, 'finally { if (r != null) r.close(); }', { 'font-size': 14.5, opacity: fade(u, 0.6) });
        sub(480, 300, '열기와 닫기가 다른 블록에 흩어진다', fade(u, 1.8), { fill: WARN, 'font-weight': 700 }); }
      if (k === 1) { ball(X(0.45), 120, '본문 예외 A', BAD, { s: pop(u, 0.2), op: 1 - 0.7 * E(u, 1.5, 2.0) });
        ball(X(0.65), 170, 'close() 예외 B', WARN, { s: pop(u, 0.9) });
        dot([[X(0.65), 170], [X(0.65), 300]], seg(u, 1.3, 2.0), WARN, 8);
        if (u > 1.6) { mono(X(0.45) - 20, 160, '사라짐', { 'font-size': 14.5, fill: BAD, 'font-weight': 800, 'text-anchor': 'end' }); }
        sub(480, 340, '위로 올라가는 것은 B 뿐 · 진짜 원인 A 가 소실된다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
      return; }
    tx(60, 44, 'try (Connection con = …; PreparedStatement ps = …) { … }', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const openA = 0.05, openB = 0.15, boom = 0.45, cB = 0.6, cA = 0.72;
    const tB = k === 2 ? openB + (boom - openB) * E(u, 0.9, 1.8) : k === 3 ? boom : k === 4 ? lerp(boom, cB, E(u, 0.3, 0.9)) : cB;
    const tA = k === 2 ? openA + (boom - openA) * E(u, 0.2, 1.8) : k === 3 ? boom : k === 4 ? (u < 1.0 ? lerp(boom, cB, E(u, 0.3, 0.9)) : lerp(cB, cA, E(u, 1.1, 1.7))) : cA;
    const XA = life(110, 'con', openA, tA, INFO), XB = life(170, 'ps', k === 2 && u < 0.9 ? 0.15 : openB, Math.max(tB, k === 2 && u < 0.9 ? 0.15 : openB), ACC);
    if (k === 2) { pill(XA(openA) + 40, 76, '① con 열기', INFO, pop(u, 0.2), { fs: 13.5 }); pill(XB(openB) + 140, 210, '② ps 열기', ACC, pop(u, 0.9), { fs: 13.5 });
      sub(480, 300, '괄호 안에서 연 AutoCloseable 은 닫기가 자동이다', fade(u, 2.0), { fill: GOOD, 'font-weight': 700 }); }
    if (k >= 3) { ball(XA(boom), 250, k >= 5 ? '' : 'executeUpdate 실패', BAD, { s: k === 3 ? pop(u, 0.3) : 1 }); el('line', { x1: XA(boom), y1: 90, x2: XA(boom), y2: 238, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: k === 3 ? fade(u, 0.4) : 1 });
      if (k === 3) sub(480, 320, '예외가 나도 정리는 그대로 진행된다', fade(u, 1.4), { fill: INK, 'font-weight': 700 }); }
    if (k >= 4) { lbl(XB(cB) + 16, 150, '③ ps.close()', k === 4 ? fade(u, 0.9) : 1, { 'text-anchor': 'start', fill: ACC, 'font-size': 14.5 });
      lbl(XA(cA) + 16, 90, '④ con.close()', k === 4 ? fade(u, 1.7) : 1, { 'text-anchor': 'start', fill: INFO, 'font-size': 14.5 });
      if (k === 4) sub(480, 320, '나중에 연 것을 먼저 닫는다 · 역순', fade(u, 2.0), { fill: INK, 'font-weight': 700 }); }
    if (k === 5) { ball(XA(cA), 300, 'close 예외', WARN, { s: pop(u, 0.2) });
      const f = E(u, 0.6, 1.4); dot([[XA(cA), 300], [XA(boom) + 16, 256]], f < 1 ? f : 0, WARN, 6);
      if (u > 1.4) { el('circle', { cx: XA(boom) + 20, cy: 238, r: 6, fill: WARN }); mono(XA(boom) + 32, 232, 'suppressed', { 'font-size': 14, fill: WARN, 'font-weight': 800 }); }
      mono(60, 370, 'e.getSuppressed()  =>  [close 예외]', { 'font-size': 15.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      sub(700, 370, '원래 예외가 그대로 올라간다', fade(u, 2.1), { fill: GOOD, 'font-weight': 700 }); }
  }

  // ---------- 5. 번역과 체이닝 ----------
  const LAY = [['Controller', 70], ['Service', 170], ['Repository · JdbcTemplate', 270]];
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { node(200, 80, 'RuntimeException', WARN, 1); grow(200, 98, 200, 160, ph(c, 0, 0.3, 0.8), WARN, { plain: true });
      node(200, 180, 'OrderNotFoundException', WARN, pk(c, 0, 0.7));
      if (k === 0) sub(200, 230, 'unchecked 를 고른 것 = 처리를 강제하지 않겠다', fade(u, 1.3), { fill: WARN, 'font-weight': 700 });
      if (k === 1) { card(660, 190, 420, 170, { rx: 12, stroke: WARN, sw: 2.4, s: pop(u, 0.2) });
        lbl(660, 130, 'new OrderNotFoundException(…)', fade(u, 0.4), { class: 'mono', fill: WARN, 'font-size': 14.5 });
        [['message', '"주문 없음 id=…"'], ['cause', 'Throwable']].forEach(([a, b], i) => { const y = 180 + i * 50;
          mono(480, y, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.6 + i * 0.3) });
          card(720, y - 5, 220, 34, { rx: 6, stroke: i ? BAD : GRID, sw: 2, dash: i ? '5 4' : null, text: b, fs: 14, mono: true, s: pop(u, 0.7 + i * 0.3) }); });
        sub(660, 310, 'super(message, cause) 로 원본을 부모에 넘긴다', fade(u, 1.5), { fill: INK, 'font-weight': 700 }); }
      return; }
    LAY.forEach(([n, y]) => { el('rect', { x: 40, y: y - 34, width: 880, height: 68, rx: 10, fill: SOFT, opacity: 0.9 }); tx(56, y - 12, n, { 'font-size': 14, 'font-weight': 700, fill: MUT }); });
    if (k === 2) { mono(380, 276, 'jdbc.queryForObject(SQL, mapper, id)', { 'font-size': 14.5, 'font-weight': 700 });
      ball(330, 276, '', BAD, { s: pop(u, 1.0) }); mono(380, 300, 'EmptyResultDataAccessException', { 'font-size': 14, fill: BAD, 'font-weight': 800, opacity: fade(u, 1.1) });
      sub(640, 370, '이대로 올리면 위 계층이 JDBC 에 묶인다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 }); }
    if (k === 3 || k === 5) { // 감싼 상자: 바깥 OrderNotFoundException, 안쪽 cause
      const yy = k === 3 ? lerp(270, 170, E(u, 0.6, 1.6)) : 170, inner = k === 5 ? 1 - E(u, 0.8, 1.4) : 1;
      card(560, yy, 430, 60, { rx: 10, stroke: WARN, sw: 2.6, fill: WARNBG, s: k === 3 ? pop(u, 0.3) : 1 });
      mono(360, yy - 10, 'OrderNotFoundException', { 'font-size': 14.5, 'font-weight': 800, fill: WARN });
      card(640, yy + 12, 260, 26, { rx: 6, stroke: BAD, sw: 1.8, text: 'cause: EmptyResult…', fs: 13.5, mono: true, color: BAD, op: inner });
      if (k === 3) { grow(560, 136, 560, 104, E(u, 1.8, 2.2), WARN); sub(560, 70, '위 계층은 "주문이 없다"만 안다', fade(u, 2.2), { fill: INK, 'font-weight': 700 }); }
      if (k === 5) { if (u > 1.0) cross(640, yy + 12, 12, pop(u, 1.0));
        terminal(500, 236, 440, 110, ['OrderNotFoundException: 주문 없음', '  at …findOrder(…)', '  (Caused by 줄이 없다)'], lerp(0, 3, E(u, 1.4, 2.2)), { title: 'cause 를 버린 스택 트레이스', fs: 13.5 });
        sub(240, 340, '어느 SQL 이 왜 실패했는지 사라진다', fade(u, 2.2), { fill: BAD, 'font-weight': 700 }); } }
    if (k === 4) { // 설계 기준 (페이지 데이터 design.rows)
      const rows = c.beat.design.rows; el('rect', { x: 40, y: 36, width: 880, height: 270, rx: 10, fill: PANEL });
      lbl(480, 64, c.beat.design.title, 1, { 'font-size': 16 });
      rows.forEach((r, i) => { const y = 112 + i * 64, col = r.tone === 'checked' ? INFO : WARN, s = pop(u, 0.3 + i * 0.4);
        card(290, y, 420, 46, { rx: 8, stroke: GRID, sw: 1.6, text: r.q, fs: 14.5, s }); grow(504, y, 560, y, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), col);
        pill(735, y, r.pick, col, pop(u, 0.8 + i * 0.4), { fs: 14, mono: true }); });
      banner(480, 360, '애매하면 unchecked 가 실무 기본값', pop(u, 2.0)); }
  }

  // ---------- 6. 안티패턴 ----------
  function s6(t, c) { const { k, u } = c;
    if (k === 0) { mono(60, 60, 'try { save(order); } catch (SQLException e) { }', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      el('ellipse', { cx: 300, cy: 300, rx: 90, ry: 22, fill: INK, opacity: 0.85 }); tx(300, 350, '빈 catch', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT });
      const f = E(u, 0.4, 1.4); ball(300, lerp(120, 300, f), f < 0.95 ? 'SQLException' : '', BAD, { s: 1 - seg(u, 1.3, 1.5) });
      card(720, 200, 260, 80, { rx: 12, stroke: GOOD, sw: 2.5, fill: GOODBG, text: '호출자: "저장 성공"', fs: 16, color: GOOD, s: pop(u, 1.7) });
      sub(720, 270, '실제로는 저장 실패 · 장애가 늦게 드러난다', fade(u, 2.1), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 1) { mono(60, 60, 'log.error("주문 저장 실패 id=" + order.id(), e);', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
      mono(60, 88, 'throw new OrderSaveException("저장 실패", e);', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD });
      ball(200, 200, 'SQLException', BAD, { s: pop(u, 0.2) });
      terminal(480, 130, 440, 120, ['ERROR 주문 저장 실패 id=…', 'java.sql.SQLException: …', '  at …save(…)'], lerp(0, 3, E(u, 0.6, 1.6)), { title: '로그 · e 를 넘겨 스택이 남는다', fs: 13.5 });
      fly(200, 220, 200, 330, seg(u, 1.6, 2.4), 'OrderSaveException(cause = e)', { mono: true, fill: WARN, stay: true }); return; }
    if (k === 2) { mono(60, 60, 'catch (Exception e) { throw new RuntimeException(e); }', { 'font-size': 14.5, 'font-weight': 800, fill: BAD });
      ['SQLException', 'IOException', 'TimeoutException'].forEach((n, i) => { const x = 160 + i * 230, f = E(u, 0.5 + i * 0.2, 1.3 + i * 0.2);
        ball(x, 160, f < 0.5 ? n : '', BAD, { s: 1 });
        card(x, 160, 210, 44, { rx: 10, stroke: MUT, sw: 2, fill: SOFT, text: 'RuntimeException', fs: 14, mono: true, color: MUT, s: f }); });
      ['?', '?', '?'].forEach((q, i) => lbl(160 + i * 230, 240, q, fade(u, 1.8), { 'font-size': 28, fill: BAD }));
      sub(480, 300, '위에서는 셋을 구분할 수 없다 · 도메인 예외로 번역하라', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 3) { mono(60, 60, 'catch (Throwable t) { retry(); }', { 'font-size': 15, 'font-weight': 800, fill: BAD });
      el('rect', { x: 60, y: 100, width: 840 * E(u, 0.2, 0.8), height: 120, rx: 16, fill: BADBG, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' });
      [['NullPointerException', WARN], ['OutOfMemoryError', BAD], ['IOException', INFO]].forEach(([n, col], i) => ball(130 + i * 280, 160, n, col, { s: pop(u, 0.8 + i * 0.2) }));
      el('path', { d: 'M 480 250 A 60 40 0 1 1 479 250', fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': `${400 * E(u, 1.2, 2.2)} 400`, transform: 'translate(0 60)' });
      mono(480, 356, 'retry #' + Math.max(1, Math.floor(lerp(1, 9, E(u, 1.2, 2.6)))), { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      sub(480, 400, '버그와 OOM 까지 삼켜 재시도를 반복한다 · 장애 증폭', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); return; }
    if (k === 4) { mono(60, 60, 'try (var in = Files.newInputStream(path)) { process(in); }', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD });
      tx(60, 120, '커넥션 풀 (그림용 10칸)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      tx(60, 250, '닫지 않으면', { 'font-size': 15, 'font-weight': 800, fill: BAD }); tx(500, 250, 'try-with-resources', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      const leak = Math.floor(lerp(0, 10, E(u, 0.3, 2.2)));
      for (let i = 0; i < 10; i++) { el('rect', { x: 60 + i * 38, y: 270, width: 32, height: 32, rx: 5, fill: i < leak ? BAD : PANEL, stroke: i < leak ? 'none' : GRID, 'stroke-width': 1.5, opacity: 0.85 });
        const on = i === Math.floor(t * 4) % 10; el('rect', { x: 500 + i * 38, y: 270, width: 32, height: 32, rx: 5, fill: on ? GOOD : PANEL, stroke: on ? 'none' : GRID, 'stroke-width': 1.5, opacity: 0.85 }); }
      tx(60, 334, '사용 중 ' + leak + ' / 10', { 'font-size': 15, 'font-weight': 800, fill: leak >= 10 ? BAD : INK });
      if (leak >= 10) tx(60, 362, '고갈 · 새 요청은 기다린다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 });
      tx(500, 334, '쓰고 나면 곧바로 반납', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.0) }); return; }
    // k = 5: 네 가지 정리 (페이지 데이터 pitfalls)
    const P = c.beat.pitfalls;
    P.forEach((p, i) => { const y = 60 + i * 82, s = pop(u, 0.2 + i * 0.35);
      card(250, y, 420, 60, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, s }); card(710, y, 420, 60, { rx: 10, stroke: GOOD, sw: 2, fill: GOODBG, s: pop(u, 0.4 + i * 0.35) });
      if (s > 0.5) { tx(56, y - 6, p.why.split(' — ')[0], { 'font-size': 15, 'font-weight': 800, fill: BAD }); tx(56, y + 18, (p.why.split(' — ')[1] || ''), { 'font-size': 13.5, fill: INK });
        tx(516, y + 5, p.good, { 'font-size': 14, 'font-weight': 700, fill: GOOD }); } });
    sub(480, 400, '필요한 타입만 · 필요한 곳에서 · cause 를 지켜 잡는다', fade(u, 1.9), { fill: INK, 'font-weight': 700 });
  }

  const quiz = [
    { q: 'catch (Exception e)로 감싼 코드에서 OutOfMemoryError가 나면 어떻게 되는가?',
      o: ['Exception 그물에 잡혀 처리된다', 'Error는 Exception의 하위가 아니라서 잡히지 않는다', '컴파일 에러가 난다'], a: 1,
      why: 'Throwable 아래에서 Error와 Exception은 따로 갈라진다. catch (Exception e)는 Error 갈래를 건드리지 않도록 설계됐다.' },
    { q: 'readFirstLine에서 throws IOException을 지우면 어떻게 되는가?',
      o: ['실행 중에만 경고가 뜬다', '아무 일도 없다', 'unreported exception 컴파일 에러가 난다'], a: 2,
      why: 'FileReader와 readLine이 던지는 checked 예외는 잡거나 throws로 넘겨야 한다. 이 강제가 checked의 정체다.' },
    { q: 'readLine에서 난 FileNotFoundException을 service()가 잡지 않으면 무슨 일이 일어나는가?',
      o: ['스택을 거꾸로 타고 main의 catch까지 내려간다', '그 자리에서 조용히 사라진다', 'service()가 자동으로 null을 돌려준다'], a: 0,
      why: '예외는 자기를 잡아 줄 catch를 찾을 때까지 호출 스택을 되짚는다. main에서 FileNotFoundException 절이 먼저 맞아 처리된다.' },
    { q: 'try-with-resources에서 본문 예외 뒤 close()도 예외를 던지면 close 예외는 어디로 가는가?',
      o: ['원래 예외를 덮고 대신 올라간다', '원래 예외의 suppressed 목록에 붙는다', '로그에만 찍히고 버려진다'], a: 1,
      why: 'con과 ps를 역순으로 닫는 동안 난 예외는 getSuppressed()로 남는다. 옛 finally 방식처럼 진짜 원인을 덮지 않는다.' },
    { q: '저수준 예외를 OrderNotFoundException으로 번역할 때 꼭 해야 할 일은 무엇인가?',
      o: ['원래 예외를 cause로 넘긴다', '메시지를 영어로 쓴다', 'checked로 만든다'], a: 0,
      why: 'cause를 넘겨야 스택 트레이스에 Caused by 줄이 남는다. 빠뜨리면 어느 SQL이 왜 실패했는지 추적할 수 없다.' },
    { q: 'catch (Throwable t) { retry(); }가 위험한 이유는 무엇인가?',
      o: ['Throwable은 잡을 수 없는 타입이라서', '재시도가 항상 한 번만 되어서', 'NPE·OOM 같은 버그와 Error까지 삼켜 재시도를 되풀이해서'], a: 2,
      why: '잡을 이유가 없는 버그와 Error까지 그물에 걸린다. OOM에서 재시도를 반복하면 복구가 아니라 장애가 커진다.' },
  ];

  const summary = [
    'Throwable 아래 Error와 Exception이 갈리고, Error는 잡지 않는다.',
    'RuntimeException을 상속하지 않은 예외만 컴파일러가 처리를 강제한다.',
    '예외는 잡힐 때까지 스택을 되짚고, catch는 좁은 타입을 위에 둔다.',
    '자원은 try-with-resources로 열고, 번역할 때는 원래 예외를 cause로 넘긴다.',
  ];
  const review = [
    { q: '운영 로그에 "OrderNotFoundException: 주문 없음" 한 줄만 있고 원인을 알 수 없다. 코드에서 먼저 볼 곳은?',
      o: ['번역하는 catch에서 e를 cause로 넘겼는지', 'OrderNotFoundException이 checked인지', 'finally 블록이 있는지'], a: 0,
      why: 'cause를 넘기지 않으면 Caused by 줄이 사라진다. new OrderNotFoundException(msg, e)처럼 원본을 이어야 진짜 원인이 남는다.' },
    { q: '부하 시험에서만 DB 커넥션이 고갈되고 개발 환경은 멀쩡하다. 가장 먼저 의심할 코드는?',
      o: ['catch 절 순서가 넓은 타입부터인 곳', 'try-with-resources 없이 커넥션을 열고 닫기를 빠뜨린 곳', 'unchecked 예외를 throws에 적지 않은 곳'], a: 1,
      why: '닫히지 않은 커넥션은 요청이 몰릴 때만 쌓여 풀을 비운다. 괄호 안에서 열면 예외가 나도 역순으로 자동 close된다.' },
    { q: '주문 저장이 실패했는데 화면에는 성공으로 뜨고 데이터만 없다. 가장 먼저 찾을 패턴은?',
      o: ['multi-catch로 묶인 catch', 'try-with-resources로 연 스트림', '아무것도 하지 않는 빈 catch'], a: 2,
      why: '빈 catch는 예외를 삼켜 호출자가 성공으로 알게 만든다. 최소한 log.error(msg, e)로 남기고 다시 던지거나 복구해야 한다.' },
  ];

  R.page({ title: '예외 흐름', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
