/* I-2-1 interface — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 인터페이스가 요구하는 메서드 칸과 타입이 가진 메서드 칸 맞추기, 인터페이스 값의 두 칸(타입 · 값),
 *       io.Reader 로 바이트가 흘러드는 모습, 패키지 사이 의존 방향, 타입 단언·타입 스위치.
 * 출력값은 페이지 코드로 정해지는 것만 쓰고, 바깥에서 들어오는 값(입력 예, map 내용)은 "예시" 로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, u) => s.slice(0, Math.round(s.length * clamp(u)));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 타입/인터페이스 상자: 이름 + 메서드 칩들. o.iface 면 점선 칩(요구)
  function tbox(cx, cy, w, name, methods, o) { o = o || {}; const s = o.s ?? 1, h = o.h || 96, col = o.col || INK;
    card(cx, cy, w, h, { rx: 10, stroke: col, fill: o.fill || PANEL, dash: o.dash, s, sw: 2.2 });
    if (s < 0.6) return;
    mono(cx - w / 2 + 12, cy - h / 2 + 24, name, { 'font-size': 15, 'font-weight': 800, fill: col });
    if (o.sub) tx(cx + w / 2 - 12, cy - h / 2 + 24, o.sub, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    let x = cx - w / 2 + 14; methods.forEach((m) => { const mw = tw(m, 14) + 22, on = o.on ? o.on(m) : 1;
      if (on > 0) card(x + mw / 2, cy + h / 2 - 26, mw, 30, { rx: 15, text: m, fs: 14, mono: true, stroke: o.iface ? col : INFO, dash: o.iface ? '5 4' : null, fill: o.iface ? PANEL : INFOBG, color: o.iface ? col : INFO, s: on }); x += mw + 8; });
    if (!methods.length && o.none) tx(cx - w / 2 + 14, cy + h / 2 - 20, o.none, { 'font-size': 14, fill: MUT }); }
  // 인터페이스 값 = 두 칸 (타입 · 값)
  function ival(x, y, ty, v, o) { o = o || {}; const w1 = o.w1 || 120, w2 = o.w2 || 160, op = o.op ?? 1, col = o.col || ACC;
    if (o.head) { tx(x + w1 / 2, y - 8, '타입', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); tx(x + w1 + 4 + w2 / 2, y - 8, '값', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }
    card(x + w1 / 2, y + 20, w1, 40, { rx: 6, text: ty, fs: 14, mono: true, stroke: o.tcol || col, fill: o.tfill || PANEL, color: o.tcol || col, op, sw: o.tsw || 2 });
    card(x + w1 + 4 + w2 / 2, y + 20, w2, 40, { rx: 6, text: v, fs: 14, mono: true, stroke: GRID, fill: PANEL, color: INK, op }); }
  function link(x1, y1, x2, y2, u, col, o) { grow(x1, y1, x2, y2, u, col || GOOD, Object.assign({ sw: 2.4 }, o || {})); }

  // ---------- 1. Java: implements 로 사인 ----------
  function s1(t, c) { const { k, u } = c;
    tbox(480, 80, 280, 'interface Printable', ['print()'], { iface: true, col: INFO, s: k === 0 ? pop(u, 0.2) : 1 });
    if (k === 0) { note(330, 190, '메서드 모양만 정한다 — 여기까지는 Go 와 같다', fade(u, 1.2)); return; }
    tbox(160, 290, 250, 'class Receipt', ['print()'], { s: k === 1 ? pop(u, 0.2) : 1 });
    const tag = k === 1 ? pop(u, 0.9) : 1; card(160, 220, 210, 30, { rx: 4, text: 'implements Printable', fs: 13.5, mono: true, stroke: WARN, fill: WARNBG, color: WARN, s: tag });
    link(220, 204, 400, 124, k === 1 ? E(u, 1.4, 2.0) : 1, GOOD);
    if (k === 1) { note(40, 390, '사람이 적어야 연결된다', fade(u, 2.2), { fill: WARN }); return; }
    tbox(480, 290, 250, 'lib.Invoice', ['print()'], { s: k === 2 ? pop(u, 0.2) : 1, sub: '서드파티' });
    lock(590, 230, true, MUT, k === 2 ? pop(u, 0.7) : 1);
    link(480, 238, 480, 132, k === 2 ? E(u, 1.0, 1.6) : 1, MUT, { dash: '6 5', plain: true }); cross(480, 186, 12, k === 2 ? pop(u, 1.7) : 1);
    if (k === 2) { note(560, 390, '모양은 같아도 사인이 없으면 남이다', fade(u, 2.1), { fill: BAD }); return; }
    card(800, 290, 250, 140, { rx: 12, stroke: WARN, dash: '7 5', s: pop(u, 0.3) });
    mono(686, 240, 'InvoiceAdapter', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
    mono(686, 264, 'implements Printable', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 0.6) });
    card(800, 316, 200, 44, { rx: 8, text: 'Invoice 를 감싼다', fs: 14, stroke: GRID, op: fade(u, 0.8) });
    link(760, 220, 560, 118, E(u, 1.2, 1.8), GOOD);
    note(560, 400, '감쌀 타입이 늘면 어댑터도 같이 는다', fade(u, 2.1)); }

  // ---------- 2. Go: 메서드만 있으면 구현 ----------
  function s2(t, c) { const { k, u } = c;
    if (k <= 3) {
      tbox(480, 76, 260, 'type Printer interface', ['Print()'], { iface: true, col: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      if (k === 0) { note(330, 186, '구현자 목록이 없다 — 모양만 정한다', fade(u, 1.0)); return; }
      const rp = k === 1 ? 0 : k === 2 ? pop(u, 0.5) : 1;
      tbox(220, 270, 260, 'Receipt', rp > 0 ? ['Print()'] : [], { s: k === 1 ? pop(u, 0.2) : 1, sub: 'Total int', none: '메서드 없음', on: () => rp });
      if (k === 1) { link(300, 222, 400, 124, E(u, 0.8, 1.4), MUT, { dash: '6 5', plain: true }); cross(350, 172, 11, pop(u, 1.5)); note(40, 380, 'Print() 가 없으니 Printer 가 아니다', fade(u, 1.9)); return; }
      link(280, 222, 410, 124, k === 2 ? E(u, 1.1, 1.7) : 1, GOOD); check(332, 160, 10, k === 2 ? pop(u, 1.7) : 1);
      if (k === 2) { note(40, 380, 'implements 를 적은 곳이 없다', fade(u, 2.0), { fill: ACC }); note(40, 406, '메서드 집합이 맞으면 컴파일러가 연결한다', fade(u, 2.3), { 'font-weight': 500 }); return; }
      tbox(740, 270, 260, 'Invoice', ['Print()'], { s: pop(u, 0.2), sub: 'ID string' });
      link(680, 222, 550, 124, E(u, 0.8, 1.4), GOOD); check(628, 160, 10, pop(u, 1.4));
      note(330, 392, '공통 부모 없이 Print() 하나로 같은 자리에 들어간다', fade(u, 1.9)); return; }
    // k 4~5: printAll 과 인터페이스 값
    card(480, 62, 420, 46, { rx: 10, text: 'func printAll(items []Printer)', fs: 15, mono: true, stroke: INK, s: k === 4 ? pop(u, 0.2) : 1 });
    tx(150, 118, 'items  []Printer', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' });
    const filled = k === 5;
    [['Receipt', '{Total: 1000}'], ['Invoice', '{ID: "X"}']].forEach(([ty, v], i) => { const y = 158 + i * 62, op = filled ? fade(u, 0.2 + i * 0.4) : 1;
      if (filled) ival(150, y, ty, v, { head: i === 0, op });
      else ival(150, y, '?', '?', { head: i === 0, op: fade(u, 0.5 + i * 0.3), tcol: GRID }); });
    if (k === 4) { note(150, 310, 'printAll 은 구체 타입을 모른다', fade(u, 1.2)); note(150, 340, '어떤 타입이 와도 Print() 만 부른다', fade(u, 1.6), { 'font-weight': 500 });
      pill(740, 200, 'thirdparty.Foo { Print() }', ACC, pop(u, 2.0), { mono: true, fs: 14 }); sub(740, 240, '남의 타입도 그대로 들어간다', fade(u, 2.2), { 'font-size': 14 }); return; }
    const cur = u < 1.0 ? -1 : u < 1.7 ? 0 : 1;
    if (cur >= 0) { el('rect', { x: 144, y: 152 + cur * 62, width: 296, height: 52, rx: 8, fill: 'none', stroke: INFO, 'stroke-width': 2.6 });
      mono(460, 184 + cur * 62, `item.Print() → ${cur ? 'Invoice' : 'Receipt'}.Print`, { 'font-size': 14, fill: INFO, 'font-weight': 700 }); }
    terminal(150, 300, 560, 100, ['영수증 총액: 1000원', '청구서 ID: X'], u < 1.2 ? 0 : u < 1.9 ? 1 : 2, { title: '출력' });
    sub(820, 340, '어댑터 · 캐스팅 없음', fade(u, 2.3), { 'font-size': 14.5, fill: ACC, 'font-weight': 700 }); }

  // ---------- 3. io.Reader ----------
  const SOCK = { x: 330, y: 210 };
  function fn(k, u) { card(530, 210, 330, 150, { rx: 12, stroke: INK, sw: 2.4 }); mono(380, 158, 'countLines(r io.Reader)', { 'font-size': 15, 'font-weight': 800 });
    el('path', { d: `M${SOCK.x},${SOCK.y - 26} h30 v52 h-30`, fill: ACCBG, stroke: ACC, 'stroke-width': 2.4 });
    mono(SOCK.x - 4, SOCK.y - 34, 'io.Reader', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'end' });
    card(470, 214, 150, 40, { rx: 8, text: 'bufio.Scanner', fs: 14, mono: true, stroke: INFO, color: INFO }); }
  function counter(v, o) { o = o || {}; card(820, 210, 130, 96, { rx: 12, stroke: ACC, sw: 2.4 }); tx(820, 186, 'count', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', 'font-weight': 700, class: 'mono' });
    mono(820, 232, String(v), { 'font-size': 34, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); grow(695, 210, 755, 210, 1, MUT); }
  const SRC = [['file', 'os.File', 110], ['http', 'resp.Body', 210], ['mem', 'strings.Reader', 310]];
  function source(i, x, y, o) { o = o || {}; card(x, y, 150, 52, { rx: 8, text: SRC[i][1], fs: 14.5, mono: true, stroke: o.on ? ACC : INK, fill: o.on ? ACCBG : PANEL, s: o.s ?? 1, op: o.op ?? 1 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 64, 520, 48, { rx: 10, text: 'Read(p []byte) (n int, err error)', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      tx(70, 150, 'p : 8칸 버퍼 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.5) });
      const B = ['a', '\\n', 'b', '\\n', 'c'], f = Math.floor(lerp(0, 5, E(u, 0.9, 1.9)));
      cells(70, 166, Array.from({ length: 8 }, (_, i) => (i < f ? B[i] : '')), { w: 54, h: 44, style: (i) => ({ stroke: i < f ? ACC : GRID, fill: i < f ? ACCBG : PANEL, s: pop(u, 0.5 + i * 0.05, 0.4) }) });
      mono(560, 196, `n = ${f}, err = nil`, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      mono(560, 236, '다음 Read → n = 0, err = io.EOF', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) });
      sub(310, 270, '"a\\nb\\nc" 를 읽은 예', fade(u, 2.0), { 'font-size': 14 });
      note(70, 350, '요구는 이 메서드 하나 — 그래서 거의 모든 입력이 만족한다', fade(u, 2.4)); return; }
    if (k === 6) { tbox(220, 110, 220, 'Reader', ['Read()'], { iface: true, col: ACC, s: pop(u, 0.2), h: 84 }); tbox(220, 240, 220, 'Writer', ['Write()'], { iface: true, col: ACC, s: pop(u, 0.4), h: 84 });
      const m = E(u, 0.8, 1.5); link(332, 110, lerp(332, 470, m), lerp(110, 170, m), m, ACC, { plain: true }); link(332, 240, lerp(332, 470, m), lerp(240, 180, m), m, ACC, { plain: true });
      tbox(600, 175, 260, 'ReadWriter', ['Read()', 'Write()'], { iface: true, col: ACC, s: pop(u, 1.4), h: 90 });
      ['os.File', 'bytes.Buffer', 'net.Conn'].forEach((s, i) => pill(520 + i * 150, 290, s, INFO, pop(u, 1.9 + i * 0.15), { mono: true, fs: 14 }));
      sub(670, 336, '둘 다 가진 타입은 자동으로 ReadWriter', fade(u, 2.3), { 'font-size': 14.5 });
      note(60, 380, '작게 만들고, 필요하면 임베딩으로 합친다', fade(u, 2.4)); return; }
    fn(k, u);
    const plug = k >= 3 ? k - 3 : -1;
    SRC.forEach(([, , y], i) => { if (i !== plug) { source(i, 90, y, { s: k === 1 ? pop(u, 0.3 + i * 0.15) : 1, op: plug >= 0 && i > plug ? 0.5 : 1 }); return; }
      const f = E(u, 0.2, 0.8); source(i, lerp(90, 250, f), lerp(y, SOCK.y, f), { on: true });
      if (f > 0.99) check(250, SOCK.y - 40, 9, pop(u, 0.9)); });
    if (k === 1) { counter(0); note(380, 330, '인자 타입이 os.File 이 아니라 io.Reader', fade(u, 1.0)); return; }
    if (k === 2) { const n = Math.floor(lerp(0, 3.99, E(u, 0.3, 2.0)));
      for (let i = 0; i < 3; i++) { const f = seg(u, 0.3 + i * 0.55, 0.85 + i * 0.55); if (f > 0 && f < 1) el('rect', { x: lerp(370, 640, f), y: 240, width: 40, height: 10, rx: 3, fill: MUT }); }
      counter(n); mono(530, 312, 'Scan() 이 true 인 동안 count++', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      note(380, 360, '어디서 온 줄인지는 루프가 모른다', fade(u, 2.2)); return; }
    if (k === 3 || k === 4) { counter('n'); note(380, 330, k === 3 ? '파일도 Read 를 가졌으니 그대로 꽂힌다' : 'HTTP 응답 본문도 같은 함수에 꽂힌다', fade(u, 1.0));
      sub(530, 380, k === 3 ? '변환 함수도 래퍼도 없다' : 'net.Conn 같은 소켓도 같은 자리에 들어간다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    // k 5: 메모리 문자열 → 3
    const B = ['a', '\\n', 'b', '\\n', 'c'], n = u < 1.0 ? 0 : u < 1.4 ? 1 : u < 1.8 ? 2 : 3;
    cells(385, 244, B, { w: 40, h: 34, fs: 14, style: (i) => ({ stroke: B[i] === '\\n' ? WARN : ACC, fill: PANEL, s: pop(u, 0.6 + i * 0.06, 0.4) }) });
    counter(n);
    mono(380, 330, 'countLines(strings.NewReader("a\\nb\\nc"))', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) });
    pill(820, 300, '결과 3', GOOD, pop(u, 2.0), { fs: 15 });
    note(380, 380, '테스트에서 임시 파일을 만들 필요가 없다', fade(u, 2.3), { fill: ACC }); }

  // ---------- 4. 사용처에서 정의 ----------
  function svcZone(op) { zone(30, 30, 430, 220, 'package service', { fill: SOFT, op }); }
  function slot(ty, v, o) { o = o || {}; tx(56, 194, 'repo UserRepo', { 'font-size': 14, class: 'mono', 'font-weight': 700, opacity: o.op ?? 1 });
    ival(186, 172, ty, v, { w1: 140, w2: 96, op: o.op, tcol: o.tcol, tfill: o.tfill }); }
  function s4(t, c) { const { k, u } = c;
    svcZone(k === 0 ? fade(u, 0.1) : 1);
    tbox(240, 96, 380, 'type UserRepo interface', ['FindByID(id)'], { iface: true, col: ACC, s: k === 0 ? pop(u, 0.3) : 1, h: 84 });
    if (k === 0) { note(30, 300, '쓰는 쪽(service)이 필요한 메서드 하나만 적는다', fade(u, 1.2)); note(30, 330, 'Save · Delete 는 필요 없으니 없다', fade(u, 1.7), { 'font-weight': 500, fill: MUT }); return; }
    const inj = k === 4 ? (u > 1.2 ? 'pg' : null) : k === 5 ? (u > 1.4 ? 'mem' : 'pg') : null;
    const ty = inj === 'pg' ? '*PostgresRepo' : inj === 'mem' ? '*MemoryRepo' : 'nil', vv = inj ? '● 주소' : 'nil';
    slot(ty, vv, { op: k === 1 ? fade(u, 0.3) : 1, tcol: inj ? (inj === 'pg' ? INFO : WARN) : GRID });
    mono(56, 160, 'type UserService struct', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 0.2) : 1 });
    if (k === 1) { note(30, 300, '필드가 *PostgresRepo 가 아니라 UserRepo', fade(u, 1.0)); nopeImport(240, 350, 'import "…/postgres"', pop(u, 1.6)); return; }
    if (k === 2) { pill(240, 290, 's.repo.FindByID(id)', ACC, pop(u, 0.3), { mono: true, fs: 14.5 }); grow(240, 274, 300, 216, E(u, 0.6, 1.0), ACC);
      mono(80, 340, 'return "Hello, " + u.Name, nil', { 'font-size': 14.5, opacity: fade(u, 1.3) });
      note(30, 384, 'SQL 인지 메모리인지 모른 채 로직이 끝난다', fade(u, 1.9)); return; }
    // postgres 쪽
    zone(500, 30, 430, 170, 'package postgres', { fill: SOFT, op: k === 3 ? fade(u, 0.1) : 1 });
    tbox(715, 118, 380, '*PostgresRepo', ['FindByID(id)', 'Save(u)'], { s: k === 3 ? pop(u, 0.3) : 1, h: 84 });
    if (k === 3) { el('line', { x1: 500, y1: 150, x2: 462, y2: 150, stroke: MUT, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 1.0) }); cross(481, 150, 10, pop(u, 1.3));
      note(500, 240, 'service 를 import 하지 않는다', fade(u, 1.5)); note(500, 270, 'Save 가 더 있어도 상관없다', fade(u, 2.0), { 'font-weight': 500, fill: MUT }); return; }
    if (k === 4) { // main 이 연결
      card(480, 330, 300, 46, { rx: 8, text: 'NewUserService(&PostgresRepo{…})', fs: 14, mono: true, stroke: INK, s: pop(u, 0.2) });
      grow(560, 160, 330, 186, E(u, 0.6, 1.2), INFO); check(560, 214, 10, pop(u, 1.4));
      tx(580, 220, 'FindByID 가 있으니 UserRepo', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) });
      sub(480, 392, '두 패키지를 잇는 선언 코드가 어디에도 없다', fade(u, 2.1), { 'font-size': 14.5 }); return; }
    // k 5: 테스트용 MemoryRepo
    zone(500, 220, 430, 180, 'package memory (테스트)', { fill: WARNBG, op: fade(u, 0.1) });
    tbox(715, 286, 380, '*MemoryRepo', ['FindByID(id)'], { s: pop(u, 0.3), h: 76 });
    mono(530, 360, 'users: {1: Alice}  (예시)', { 'font-size': 14, fill: WARN, opacity: fade(u, 0.7) });
    grow(560, 270, 330, 200, E(u, 1.0, 1.4), WARN);
    pill(240, 300, 'Greet(1) → "Hello, Alice"', GOOD, pop(u, 2.0), { mono: true, fs: 14 });
    note(30, 384, 'mock 라이브러리 없이 map 하나로 테스트', fade(u, 2.3)); }
  function nopeImport(x, y, s, sc) { if (sc <= 0) return; const w = tw(s, 14) + 26; card(x, y, w, 30, { rx: 15, text: s, fs: 14, stroke: MUT, color: MUT, s: sc, mono: true });
    el('line', { x1: x - w / 2 + 8, y1: y, x2: x - w / 2 + 8 + (w - 16) * clamp(sc), y2: y, stroke: BAD, 'stroke-width': 2.5 }); }

  // ---------- 5. any 와 타입 단언 ----------
  function anyBox(ty, v, o) { o = o || {}; tx(60, 74, 'v any', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    ival(60, 104, ty, v, { head: true, w1: 130, w2: 150, op: o.op, tcol: o.tcol, tfill: o.tfill }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { const V = [['int', '42'], ['string', '"hi"'], ['[]byte', '[1 2 3]']], i = u < 1.0 ? 0 : u < 1.7 ? 1 : 2;
      anyBox(V[i][0], V[i][1], { op: fade(u, 0.2) });
      V.forEach(([ty, v], j) => pill(560, 100 + j * 50, `describe(${v === '[1 2 3]' ? '[]byte{1,2,3}' : v})`, j === i ? ACC : MUT, pop(u, 0.2 + j * 0.7), { mono: true, fs: 14 }));
      note(60, 220, '메서드 요구 0개 — 무엇이든 들어온다', fade(u, 1.0)); note(60, 250, '안에 든 타입은 실행 중에 꺼내 봐야 안다', fade(u, 2.1), { fill: WARN }); sub(560, 280, '입력값은 예시', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 1 || k === 2) { anyBox('string', '"hi"', { tcol: u > 0.8 ? (k === 1 ? BAD : WARN) : ACC });
      mono(420, 128, k === 1 ? 'n := v.(int)' : 'n, ok := v.(int)', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
      mono(420, 164, 'string 을 int 로?', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) }); cross(580, 159, 9, pop(u, 0.9));
      if (k === 1) { const b = pop(u, 1.2); card(480, 270, 620, 60, { rx: 10, fill: BADBG, stroke: BAD, s: b });
        mono(190, 276, 'panic: interface conversion: interface {} is string, not int', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.4) });
        note(170, 360, '컴파일은 통과하고 실행 중에 죽는다', fade(u, 2.0), { fill: BAD }); return; }
      ival(420, 220, 'ok', 'false', { w1: 70, w2: 100, op: fade(u, 1.2), col: WARN }); ival(640, 220, 'n', '0', { w1: 60, w2: 80, op: fade(u, 1.5), col: WARN });
      sub(600, 300, 'n 은 int 의 zero value', fade(u, 1.8), { 'font-size': 14 }); check(420, 360, 10, pop(u, 2.1)); note(440, 366, '죽지 않고 ok 로 갈라진다', fade(u, 2.1), { fill: GOOD }); return; }
    if (k === 3 || k === 4) { const CS = [['case int', 'int: 42', '42', 'int'], ['case string', 'string: hi', '"hi"', 'string'], ['case []byte', 'bytes len: 3', '[1 2 3]', '[]byte'], ['default', 'unknown: 3.14', '3.14', 'float64']];
      const i = k === 3 ? 0 : u < 0.9 ? 1 : u < 1.6 ? 2 : 3;
      anyBox(CS[i][3], CS[i][2], {});
      mono(60, 210, 'switch x := v.(type)', { 'font-size': 16, 'font-weight': 800, opacity: k === 3 ? fade(u, 0.2) : 1 });
      CS.forEach(([cs, out], j) => { const y = 70 + j * 76, on = j === i, vis = k === 3 ? (j === 0 ? pop(u, 0.5) : 0.45) : 1;
        card(560, y, 200, 44, { rx: 8, text: cs, fs: 14.5, mono: true, stroke: on ? GOOD : GRID, fill: on ? GOODBG : PANEL, color: on ? GOOD : MUT, op: vis });
        if (on) { link(346, 124, 456, y, k === 3 ? E(u, 0.6, 1.1) : 1, GOOD); mono(680, y + 5, out, { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: k === 3 ? fade(u, 1.2) : 1 }); } });
      if (k === 3) note(60, 300, 'case int 안에서 x 는 이미 int', fade(u, 1.8), { fill: GOOD });
      else { note(60, 300, 'default 가 예상 밖 타입을 받는다', fade(u, 2.0), { fill: WARN }); sub(220, 340, '입력값은 예시', fade(u, 2.2), { 'font-size': 13.5 }); }
      return; }
    if (k === 5) { mono(40, 56, 'raw = {"name": "Alice", "age": 30}  (예시)', { 'font-size': 14.5, fill: MUT });
      tx(40, 100, 'data  map[string]any', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      [['"name"', 'string', '"Alice"'], ['"age"', 'float64', '30']].forEach(([kk, ty, v], i) => { const y = 120 + i * 56;
        mono(40, y + 25, kk, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.3) }); ival(130, y, ty, v, { w1: 110, w2: 110, op: fade(u, 0.3 + i * 0.3), tcol: i ? WARN : ACC }); });
      sub(250, 250, 'JSON 숫자는 float64 로 들어온다', fade(u, 1.0), { 'font-size': 14, fill: WARN, 'font-weight': 700 });
      mono(520, 120, 'data["name"].(string)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); check(820, 115, 9, pop(u, 1.4));
      mono(520, 200, 'data["nmae"].(string)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      ival(520, 220, 'nil', 'nil', { w1: 80, w2: 80, op: fade(u, 1.9), col: BAD });
      pill(720, 300, 'panic', BAD, pop(u, 2.2), { fs: 15 });
      note(40, 380, '키 오타도 컴파일러가 못 잡는다', fade(u, 2.3), { fill: BAD }); return; }
    // k 6: struct 로 받기
    mono(40, 56, 'type Person struct{ Name string }', { 'font-size': 15, 'font-weight': 800 });
    card(220, 170, 300, 90, { rx: 10, stroke: ACC, s: pop(u, 0.2) }); mono(84, 150, 'p  Person', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
    mono(84, 186, 'Name', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 0.3) }); mono(356, 186, u > 1.0 ? '"Alice"' : '', { 'font-size': 14.5, 'text-anchor': 'end' });
    fly(560, 120, 300, 180, seg(u, 0.5, 1.0), 'json.Unmarshal', { mono: true });
    mono(520, 260, 'p.Name', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) }); check(600, 255, 9, pop(u, 1.4)); tx(620, 260, '단언 없음', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.4) });
    mono(520, 300, 'p.Nmae', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); cross(600, 295, 9, pop(u, 1.9)); tx(620, 300, '컴파일 오류', { 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) });
    note(40, 380, '모양을 알면 struct, 정말 모를 때만 any', fade(u, 2.3), { fill: ACC }); }

  const quiz = [
    { q: 'Java에서 lib.Invoice를 Printable로 쓸 수 없는 이유는 무엇인가?',
      o: ['print()의 반환 타입이 달라서', 'Invoice 선언에 implements Printable이 없어서', 'Invoice가 final 클래스라서'], a: 1,
      why: 'Java는 클래스가 implements로 직접 약속해야 연결된다. 남의 파일은 고칠 수 없으니 어댑터를 따로 만든다.' },
    { q: 'Go에서 Receipt가 Printer를 구현하게 되는 순간은 언제인가?',
      o: ['Print() 메서드를 붙였을 때', 'Receipt 선언에 Printer를 적었을 때', 'printAll에 처음 넘겼을 때'], a: 0,
      why: 'Go의 인터페이스는 암묵적이다. 타입의 메서드 집합이 인터페이스 요구를 포함하면 컴파일러가 구현으로 본다.' },
    { q: 'countLines(strings.NewReader("a\\nb\\nc"))의 결과는 무엇인가?',
      o: ['2', '3', '5'], a: 1,
      why: 'Scanner는 줄 단위로 Scan()이 true를 낸다. 마지막 c 뒤에 줄바꿈이 없어도 한 줄로 세므로 3이다.' },
    { q: 'service 패키지가 UserRepo 인터페이스를 직접 정의하면 얻는 것은 무엇인가?',
      o: ['PostgresRepo가 service를 import해야 한다', 'Save와 Delete도 반드시 구현해야 한다', 'service가 DB 패키지를 모른 채 테스트용 구현을 주입받는다'], a: 2,
      why: 'FindByID만 있으면 어떤 타입이든 UserRepo가 된다. 그래서 map으로 만든 MemoryRepo로도 Greet을 시험할 수 있다.' },
    { q: 'v에 "hi"가 들어 있을 때 n, ok := v.(int)의 결과는 무엇인가?',
      o: ['panic이 난다', 'n = 0, ok = false', 'n = 2, ok = true'], a: 1,
      why: '두 값으로 받는 단언은 실패해도 죽지 않는다. ok는 false, n은 int의 zero value인 0이다.' },
  ];

  const summary = [
    'Java는 implements를 적어야 인터페이스에 연결되고, 남의 타입은 어댑터로 감싸야 한다.',
    'Go는 메서드 집합이 맞으면 선언 없이 그 인터페이스를 구현한다.',
    'io.Reader처럼 메서드 하나짜리 인터페이스는 파일, HTTP 본문, 문자열을 같은 함수로 받는다.',
    '인터페이스는 쓰는 쪽에서 좁게 정의하고, any는 v.(int) 같은 단언 없이는 꺼내 쓸 수 없다.',
  ];
  const review = [
    { q: '서드파티 라이브러리의 Logger 타입에 Write(p []byte) (int, error) 메서드가 있다. io.Writer를 받는 함수에 넘기려면?',
      o: ['어댑터 struct를 만들어 감싼다', '라이브러리 코드에 implements를 추가한다', '그대로 넘긴다'], a: 2,
      why: 'Go 인터페이스는 메서드 모양만 맞으면 자동으로 만족한다. Write가 같은 시그니처면 io.Writer 자리에 바로 들어간다.' },
    { q: 'JSON을 map[string]any로 받아 data["age"].(int)를 했더니 panic이 났다. 먼저 의심할 것은?',
      o: ['JSON 숫자가 float64로 들어와 있다', 'age 키가 대문자여야 한다', 'map은 int를 담을 수 없다'], a: 0,
      why: 'encoding/json은 any 자리에 숫자를 float64로 넣는다. 모양을 안다면 struct로 받는 편이 안전하다.' },
    { q: 'UserService 단위 테스트에서 DB를 띄우지 않으려 한다. 가장 맞는 방법은?',
      o: ['PostgresRepo에 테스트 모드 플래그를 넣는다', 'FindByID만 가진 MemoryRepo를 만들어 주입한다', 'service에서 database/sql을 직접 import한다'], a: 1,
      why: 'UserService는 UserRepo 인터페이스만 안다. map을 감싼 구현을 넣으면 서비스 코드를 고치지 않고 시험할 수 있다.' },
  ];

  R.page({ title: 'interface', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
