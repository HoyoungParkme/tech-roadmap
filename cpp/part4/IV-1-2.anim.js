/* IV-1-2 optional·variant — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 출력값(1, 0, 80 / 2, hi, 타입 불일치! / 문자열 hi)은 코드 블록을 zig c++ -std=c++20 으로 돌려 확인했다.
 * 장면 2의 lookup 은 선언만 있어서, lookup(7) 이 "Ada" 를 돌려준다고 가정한 예시로 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // optional 상자: [있음 깃발 | T 자리]. has: true/false/null(아직 모름)
  function optBox(cx, cy, has, val, o) { o = o || {}; const s = o.s ?? 1, op = o.op ?? 1;
    const fc = has === true ? GOOD : has === false ? MUT : WARN;
    card(cx - 75, cy, 80, 58, { rx: 8, fill: has === true ? GOODBG : has === false ? SOFT : WARNBG, stroke: fc, sw: 2.2, s, op });
    if (s > 0.5) { tx(cx - 75, cy - 6, '있음?', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op });
      mono(cx - 75, cy + 17, has === true ? 'true' : has === false ? 'false' : '?', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: fc, opacity: op }); }
    card(cx + 45, cy, 150, 58, { rx: 8, stroke: has === true ? INK : GRID, dash: has === true ? null : '6 5', sw: 2.2, text: has === true ? val : has === false ? '(빈 자리)' : '?', fs: has === true ? 18 : 14, mono: has === true, color: has === true ? INK : MUT, s, op });
    if (o.name) mono(cx - 115, cy - 42, o.name, { 'font-size': 15, 'font-weight': 800, opacity: op * clamp(s * 2) }); }

  // ---------- 1. optional ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { pill(480, 44, 'std::optional<int> parsePort(const std::string& s)', ACC, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 15, fill: ACCBG });
      // 옛 방식 둘
      [['int find();  // 못 찾으면 -1', '진짜 -1과 구분 불가'], ['int* find(); // nullptr', '누가 지우나? 매번 null 확인']].forEach(([a, b], i) => { const y = 120 + i * 70, s = k === 0 ? pop(u, 0.6 + i * 0.4) : 1;
        card(190, y, 300, 52, { rx: 8, stroke: BAD, sw: 1.8, fill: BADBG, s, op: k === 0 ? 1 : 0.45 });
        mono(56, y - 3, a, { 'font-size': 14, opacity: (k === 0 ? 1 : 0.45) * clamp(s * 2) }); tx(56, y + 17, b, { 'font-size': 13.5, fill: BAD, opacity: (k === 0 ? 1 : 0.45) * clamp(s * 2) });
        cross(360, y, 10, k === 0 ? pop(u, 1.4 + i * 0.2) : 1); });
      if (k === 0) { optBox(640, 155, null, '', { s: pop(u, 1.8), name: '반환값' }); note(540, 230, '값 있음 / 값 없음 중 하나', fade(u, 2.2)); }
      if (k >= 1) { mono(470, 130, 's == "http"', { 'font-size': 15, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.2) : 1 });
        grow(580, 125, 620, 125, k === 1 ? E(u, 0.4, 0.8) : 1, GOOD); fly(600, 125, 785, 130, k === 1 ? seg(u, 0.6, 1.3) : 0, 'return 80;', { mono: true, fill: GOOD });
        optBox(760, 130, k === 1 ? (u > 1.3 ? true : null) : true, '80', { s: k === 1 ? pop(u, 0.2) : 1, name: 'http' }); }
      if (k >= 2) { mono(470, 280, '그 밖의 s', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
        grow(560, 275, 620, 275, E(u, 0.4, 0.8), MUT); fly(600, 275, 785, 280, seg(u, 0.6, 1.3), 'std::nullopt', { mono: true, fill: INK });
        optBox(760, 280, u > 1.3 ? false : null, '', { s: pop(u, 0.2), name: 'ftp' });
        tx(480, 380, '"없음"이 -1이 아니라 타입 안의 상태가 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); }
      if (k === 1) tx(480, 380, 'int를 그대로 return하면 optional<int>로 포장된다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    // k 3, 4: main 스택 위의 a, b
    zone(60, 60, 520, 300, 'main 의 스택 (힙 할당 없음)', {});
    optBox(310, 150, true, '80', { s: k === 3 ? pop(u, 0.3) : 1, name: 'a = parsePort("http")' });
    optBox(310, 290, false, '', { s: k === 3 ? pop(u, 0.8) : 1, name: 'b = parsePort("ftp")' });
    if (k === 3) { note(620, 150, '둘 다 optional<int>', fade(u, 1.4)); note(620, 180, '같은 타입, 다른 상태', fade(u, 1.7), { fill: ACC });
      note(620, 260, 'T 자리 + 있음 깃발이', fade(u, 2.1), { fill: MUT }); note(620, 286, '나란히 스택에 놓인다', fade(u, 2.3), { fill: MUT }); return; }
    // k 4: 출력
    const lines = ['$ ./a.exe', 'a.has_value() → 1', 'b.has_value() → 0', '*a → 80'];
    terminal(610, 90, 320, 150, lines, lerp(1, 4, E(u, 0.3, 1.8)));
    [[170, 0.5], [290, 1.0]].forEach(([y, d]) => dot([[195, y - 20], [600, y - 40]], seg(u, d - 0.2, d + 0.3), ACC, 6));
    if (u > 1.6) check(410, 150, 12, pop(u, 1.6));
    note(610, 290, 'if (a)가 참일 때만 *a로 연다', fade(u, 2.0), { fill: ACC }); }

  // ---------- 2. optional 안전하게 열기 ----------
  const WAYS = [['if (opt) / has_value()', '확인', GOOD], ['*opt · opt->', '확인 후에만', WARN], ['value_or(def)', '기본값', GOOD], ['value()', '빈 상태면 예외', INFO]];
  const NWAY = [0, 0, 2, 3, 4];
  function ways(k, u) { const n = NWAY[k], p = k ? NWAY[k - 1] : 0; if (!n) return;
    zone(640, 40, 300, 330, '꺼내는 길');
    WAYS.slice(0, n).forEach(([code, what, col], i) => { const y = 92 + i * 70, fresh = i >= p, s = fresh ? pop(u, 0.2 + (i - p) * 0.3) : 1;
      card(790, y, 270, 54, { rx: 8, stroke: col, sw: 2, s });
      if (s > 0.5) { mono(668, y - 3, code, { 'font-size': 14, 'font-weight': 700 }); tx(668, y + 17, what, { 'font-size': 13.5, fill: col, 'font-weight': 600 }); } }); }
  function s2(t, c) { const { k, u } = c; ways(k, u);
    if (k === 0) { card(200, 200, 200, 70, { rx: 10, text: '#include <optional>', fs: 15, mono: true, s: pop(u, 0.2) });
      [['std::optional', 120], ['std::bad_optional_access', 280]].forEach(([s, y], i) => { grow(300, 200, 520, y, E(u, 0.8 + i * 0.4, 1.3 + i * 0.4), ACC);
        pill(700, y, s, ACC, pop(u, 1.3 + i * 0.4), { mono: true, fs: 15, fill: ACCBG }); });
      tx(480, 390, 'value()가 던지는 예외 타입도 같은 헤더에 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // 공통: name 상자
    const known = k >= 2;
    optBox(260, 110, known ? true : null, '"Ada"', { s: k === 1 ? pop(u, 0.2) : 1, name: 'name = lookup(7)' });
    if (k === 1) { note(110, 210, '받은 직후에는 어느 상태인지 모른다', fade(u, 0.9));
      card(300, 280, 260, 50, { rx: 25, stroke: BAD, fill: BADBG, text: '*name  (확인 없이 열기)', fs: 14, mono: true, color: BAD, s: pop(u, 1.4) }); cross(450, 280, 10, pop(u, 1.7));
      tx(300, 340, '비어 있으면 미정의 동작', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { const g = E(u, 0.3, 0.8);
      card(260, 220, 150, 50, { rx: 8, text: 'if (name)', fs: 16, mono: true, stroke: GOOD, s: pop(u, 0.2) });
      grow(260, 140, 260, 194, g, MUT);
      grow(185, 220, 110, 300, E(u, 0.9, 1.3), GOOD); grow(335, 220, 410, 300, E(u, 0.9, 1.3), MUT);
      card(110, 330, 160, 46, { rx: 8, text: 'cout << *name', fs: 14, mono: true, stroke: GOOD, s: pop(u, 1.3) });
      tx(110, 380, '있음 → "Ada" 출력 (예시)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, opacity: fade(u, 1.7) });
      card(410, 330, 160, 46, { rx: 8, text: '건너뛴다', fs: 14, stroke: GRID, color: MUT, s: pop(u, 1.5) });
      tx(410, 380, '없음 → 아무것도 안 함', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { // 두 갈래가 한 줄로 합쳐진다
      optBox(260, 250, false, '', { s: pop(u, 0.2), name: '비었다면' });
      pill(470, 180, 'value_or("(unknown)")', GOOD, pop(u, 0.6), { mono: true, fs: 14, fill: GOODBG });
      dot([[340, 110], [470, 160], [560, 180]], seg(u, 0.9, 1.6), GOOD, 7); dot([[340, 250], [470, 200], [560, 180]], seg(u, 1.3, 2.0), MUT, 7);
      mono(450, 110, '→ "Ada"', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) });
      mono(450, 266, '→ "(unknown)"', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 2.0) });
      tx(320, 370, 'if 없이 한 줄로 끝난다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.3) }); return; }
    // k 4: 빈 optional 에 value()
    optBox(260, 250, false, '', { s: pop(u, 0.2), name: 'lookup(0)' });
    fly(230, 180, 260, 250, seg(u, 0.5, 1.1), '.value()', { mono: true, fill: INFO });
    if (u > 1.1) { card(470, 250, 210, 48, { rx: 8, text: 'bad_optional_access', fs: 14, mono: true, fill: BADBG, stroke: BAD, color: BAD, s: pop(u, 1.1) });
      grow(345, 250, 362, 250, E(u, 1.1, 1.3), BAD); }
    terminal(80, 320, 520, 80, ['catch → 빈 optional!'], lerp(0, 1, E(u, 1.8, 2.4)), { title: '' });
    tx(400, 110, '조용한 미정의 동작 대신', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.2) }); tx(400, 136, '눈에 띄는 실패', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.3) }); }

  // ---------- variant 상자 ----------
  // 위에 대안 타입 칩, 아래에 [index | 공유 자리]. active: 지금 칸 번호
  function varBox(cx, cy, types, active, val, o) { o = o || {}; const s = o.s ?? 1, gap = o.gap || 110, n = types.length;
    types.forEach((ty, i) => { const x = cx + 40 + (i - (n - 1) / 2) * gap, on = i === active;
      pill(x, cy - 82, ty, on ? ACC : GRID, s, { mono: true, fs: 14, fill: on ? ACCBG : PANEL, color: on ? ACC : MUT });
      if (on && s > 0.9) grow(x, cy - 66, lerp(x, cx + 40, 0.3), cy - 32, o.arrow ?? 1, ACC); });
    card(cx - 140, cy, 80, 60, { rx: 8, stroke: INFO, sw: 2.2, fill: INFOBG, s });
    if (s > 0.5) { tx(cx - 140, cy - 8, 'index', { 'text-anchor': 'middle', 'font-size': 13.5, fill: INFO, 'font-weight': 700 });
      mono(cx - 140, cy + 18, String(o.idx ?? active), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: INFO }); }
    card(cx + 40, cy, 260, 60, { rx: 8, stroke: INK, sw: 2.2, text: val, fs: 18, mono: true, s, color: o.vcol });
    if (o.name) mono(cx - 180, cy - 44, o.name, { 'font-size': 15, 'font-weight': 800, opacity: clamp(s * 2) }); }

  // ---------- 3. variant ----------
  const VT = ['int', 'double', 'std::string'];
  function s3(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { varBox(330, 220, VT, 0, '0', { s: pop(u, 0.2), arrow: E(u, 0.8, 1.2), name: 'v' });
      note(130, 330, '기본 생성 = 첫 대안(int)을 기본값으로', fade(u, 1.4)); note(130, 358, '그래서 시작 index는 0', fade(u, 1.8), { fill: INFO });
      tx(740, 190, '자리 하나를', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) }); tx(740, 214, '세 타입이 나눠 쓴다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const sw = u > 1.4, val = u < 0.5 ? '0' : !sw ? '10' : '3.14';
      varBox(330, 220, VT, sw ? 1 : 0, val, { arrow: sw ? E(u, 1.4, 1.7) : 1, name: 'v' });
      fly(100, 60, 370, 220, seg(u, 0.1, 0.5), 'v = 10', { mono: true });
      fly(100, 60, 370, 220, seg(u, 0.8, 1.3), 'v = 3.14', { mono: true });
      if (u > 1.3 && u < 2.1) { mono(500, 300, '10 소멸', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: 1 - seg(u, 1.6, 2.1) }); }
      note(130, 340, '활성 칸은 언제나 하나다', fade(u, 2.1), { fill: ACC }); return; }
    if (k === 2) { varBox(330, 220, VT, u > 0.9 ? 2 : 1, u > 0.9 ? '"hi"' : '3.14', { arrow: u > 0.9 ? E(u, 0.9, 1.2) : 1, name: 'v' });
      fly(100, 60, 370, 220, seg(u, 0.2, 0.9), 'v = std::string("hi")', { mono: true });
      terminal(560, 290, 360, 100, ['$ ./a.exe', 'v.index() → 2'], lerp(1, 2, E(u, 1.5, 2.2)));
      note(60, 340, 'union과 달리 지금 무엇이 들었는지 기억한다', fade(u, 1.8), { fill: INFO }); return; }
    varBox(330, 200, VT, 2, '"hi"', { name: 'v' });
    if (k === 3) { card(250, 320, 340, 46, { rx: 8, text: 'holds_alternative<std::string>(v)', fs: 14, mono: true, stroke: GOOD, s: pop(u, 0.3) });
      mono(440, 326, '→ true', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
      fly(370, 200, 760, 320, seg(u, 1.3, 2.0), '"hi"', { mono: true, fill: GOOD, stay: true });
      mono(640, 290, 'get<std::string>(v)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.2) }); return; }
    // k 4: 틀린 타입
    card(250, 320, 220, 46, { rx: 8, text: 'std::get<int>(v)', fs: 15, mono: true, stroke: BAD, s: pop(u, 0.2) });
    mono(380, 326, 'index 2 ≠ 0', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
    card(760, 250, 220, 48, { rx: 8, text: 'bad_variant_access', fs: 14, mono: true, fill: BADBG, stroke: BAD, color: BAD, s: pop(u, 1.2) });
    tx(760, 300, 'catch → 타입 불일치!', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    tx(760, 360, 'C union은 index가 없어 조용히 틀린 값을 읽는다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); }

  // ---------- 4. visit ----------
  const VT2 = ['std::monostate', 'int', 'std::string'];
  const LAM = ['[](std::monostate)', '[](int n)', '[](const std::string& s)'];
  function lam(x, y, i, o) { o = o || {}; card(x, y, 250, 40, { rx: 8, text: LAM[i], fs: 14, mono: true, stroke: o.on ? ACC : INK, fill: o.on ? ACCBG : PANEL, sw: o.on ? 2.6 : 2, s: o.s, op: o.op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { [0, 1, 2].forEach((i) => { const y = lerp(90 + i * 90, 160 + i * 44, E(u, 1.0, 1.8)); lam(300, y, i, { s: pop(u, 0.2 + i * 0.2) }); });
      const g = E(u, 1.6, 2.1); if (g > 0) { el('rect', { x: 160, y: 120, width: 280, height: 170, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: g });
        mono(170, 112, 'overloaded{ … }  = visitor 하나', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: g }); }
      note(520, 180, '람다 여럿을 상속으로 합치고', fade(u, 0.8)); mono(520, 210, 'using Ts::operator()...;', { 'font-size': 14.5, opacity: fade(u, 1.1) });
      note(520, 250, '호출 연산자를 모두 후보로 올린다', fade(u, 1.4), { fill: MUT }); return; }
    const act = k === 1 ? 0 : k === 2 ? (u > 0.9 ? 2 : 0) : 2;
    varBox(270, 150, VT2, act, act === 0 ? '(비어 있음)' : '"hi"', { gap: 130, name: 'v', s: k === 1 ? pop(u, 0.2) : 1, vcol: act === 0 ? MUT : null, arrow: k === 2 && u > 0.9 ? E(u, 0.9, 1.2) : 1 });
    if (k === 1) { note(110, 290, '첫 칸 monostate = 멤버 없는 빈 타입', fade(u, 1.0)); note(110, 318, '"아직 아무것도 없음"으로 기본 생성된다', fade(u, 1.4), { fill: MUT }); return; }
    if (k === 2) { fly(80, 40, 310, 150, seg(u, 0.2, 0.9), 'v = std::string("hi")', { mono: true }); note(110, 300, '담긴 타입이 곧 분기 대상', fade(u, 1.6), { fill: ACC }); return; }
    // k 3, 4: 방문자 세 줄
    [0, 1, 2].forEach((i) => { const y = 270 + i * 48, s = k === 3 ? pop(u, 0.2 + i * 0.3) : 1, on = k === 4 && i === 2 && u > 1.2;
      lam(300, y, i, { s, on }); });
    if (k === 3) { note(470, 280, '대안 셋에 람다 셋', fade(u, 1.3)); note(470, 310, '하나라도 빠지면 컴파일 에러', fade(u, 1.7), { fill: BAD });
      note(470, 340, '케이스 누락을 실행 전에 잡는다', fade(u, 2.1), { fill: MUT }); return; }
    pill(720, 64, 'std::visit(visitor, v)', ACC, pop(u, 0.2), { mono: true, fs: 15, fill: ACCBG });
    dot([[400, 150], [460, 220], [430, 366]], seg(u, 0.4, 1.2), ACC, 7);
    terminal(560, 250, 360, 90, ['$ ./a.exe', '문자열 hi'], lerp(1, 2, E(u, 1.4, 2.0)));
    card(740, 380, 360, 36, { rx: 18, stroke: WARN, text: 'std::any: 대안 목록이 없어 visit 불가', fs: 13.5, color: WARN, s: pop(u, 2.2) }); }

  // ---------- 5. 실패 사례 ----------
  const PIT = ['① 매직값 -1', '② 빈 optional 열기', '③ 틀린 타입 get', '④ catch-all'];
  function pits(k, u) { PIT.forEach((s, i) => pill(122 + i * 238, 30, s, i === k ? BAD : i < k ? MUT : GRID, i === k ? pop(u, 0.1) : 1, { fs: 14, fill: i === k ? BADBG : PANEL, color: i === k ? BAD : i < k ? MUT : OFF })); }
  function lane(y, code, res, col, d, u, o) { o = o || {};
    mono(60, y + 5, code, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, d) });
    grow(410, y, 500, y, E(u, d + 0.3, d + 0.7), col);
    card(620, y, 220, 42, { rx: 8, text: res, fs: 14.5, mono: o.mono, stroke: col, fill: o.fill, color: col, s: pop(u, d + 0.7) });
    if (o.ok) check(750, y, 10, pop(u, d + 0.9)); else if (o.bad) cross(750, y, 9, pop(u, d + 0.9)); }
  function s5(t, c) { const { k, u } = c; pits(k, u);
    if (k === 0) { optBox(230, 170, false, '', { s: pop(u, 0.2), name: 'opt' });
      varBox(640, 190, ['int', 'std::string'], 1, '"x"', { s: pop(u, 0.6), name: 'v' });
      card(300, 320, 330, 48, { rx: 8, stroke: BAD, fill: BADBG, text: 'int find(); // 못 찾으면 -1', fs: 14, mono: true, color: BAD, s: pop(u, 1.2) }); cross(480, 320, 10, pop(u, 1.5));
      tx(300, 372, '호출자가 규약을 외워야 한다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.7) });
      tx(640, 330, '상태를 타입이 들고 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    if (k === 1) { optBox(200, 110, false, '', { name: 'opt' });
      lane(200, 'opt.value()', 'bad_optional_access', BAD, 0.2, u, { mono: true, bad: true });
      lane(260, '*opt', '미정의 동작', BAD, 0.7, u, { bad: true });
      lane(320, 'opt.value_or(-1)', '-1', GOOD, 1.2, u, { mono: true, ok: true });
      tx(480, 390, '열기 전에 확인하거나 기본값을 준다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 2) { varBox(300, 180, ['int', 'std::string'], 1, '"x"', { name: 'v' });
      lane(280, 'std::get<int>(v)', 'bad_variant_access', BAD, 0.3, u, { mono: true, bad: true });
      lane(340, 'std::get_if<int>(&v)', 'nullptr → 건너뜀', GOOD, 1.0, u, { ok: true });
      tx(480, 400, 'get_if는 틀린 타입이면 예외 대신 nullptr를 준다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    // k 3: 새 대안이 생겼을 때
    varBox(330, 180, ['int', 'std::string', 'double'], 2, '(새 대안)', { gap: 120, s: 1, name: 'v', vcol: WARN });
    tx(700, 110, '나중에 double을 추가했다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
    lane(285, '타입별 람다만', '컴파일 에러로 알림', GOOD, 0.6, u, { ok: true });
    lane(345, '[](auto&&){ }', '조용히 통과', BAD, 1.3, u, { mono: false, bad: true });
    tx(480, 405, 'catch-all은 새 케이스 누락을 숨긴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'parsePort("ftp")처럼 값을 못 줄 때 optional<int>는 무엇을 돌려주는가?',
      o: ['-1', 'std::nullopt', 'nullptr'], a: 1,
      why: 'nullopt는 빈 상태를 뜻하는 전용 값이라 어떤 정수와도 겹치지 않는다. 그래서 has_value()가 0을 찍는다.' },
    { q: '없을 때 쓸 기본값이 분명할 때 가장 깔끔한 방법은 무엇인가?',
      o: ['*opt로 바로 연다', 'opt.value()를 try로 감싼다', 'opt.value_or(기본값)을 쓴다'], a: 2,
      why: 'value_or는 있으면 그 값, 없으면 기본값을 한 줄로 준다. if 분기가 통째로 사라진다.' },
    { q: 'v에 "hi"가 들어 있을 때 std::get<int>(v)를 부르면 어떻게 되는가?',
      o: ['bad_variant_access 예외가 난다', '0이 나온다', '"hi"의 첫 바이트를 int로 읽는다'], a: 0,
      why: 'variant는 index로 지금 타입을 기억한다. index 2인데 int를 달라고 하면 예외로 알려 준다.' },
    { q: 'std::visit에 넘긴 visitor가 대안 타입 하나를 처리하지 못하면 어떻게 되는가?',
      o: ['그 경우만 아무 일도 안 한다', '컴파일 에러가 난다', '실행 중 예외가 난다'], a: 1,
      why: 'visit은 모든 대안에 맞는 호출이 있어야 컴파일된다. 케이스 누락을 실행 전에 잡는 것이 visit의 안전장치다.' },
    { q: '빈 optional에 *opt를 쓰는 것이 value()보다 위험한 이유는 무엇인가?',
      o: ['*opt는 예외 없이 미정의 동작이 되어서', '*opt는 더 느려서', '*opt는 컴파일이 안 되어서'], a: 0,
      why: 'value()는 bad_optional_access로 실패를 알리지만 *opt는 아무 경고 없이 미정의 동작이다. 확인한 뒤에만 쓴다.' },
  ];

  const summary = [
    '없을 수도 있는 반환값을 -1이나 nullptr로 나타내면 호출자가 규약을 외워야 한다.',
    'optional<T>는 T 자리와 있음 깃발을 스택에 함께 두고, 비면 nullopt가 된다.',
    'variant는 index로 지금 타입을 기억해서 틀린 타입으로 꺼내면 예외를 낸다.',
    'visit은 대안마다 처리가 있어야 컴파일되니 auto&& 하나로 다 받지 않는다.',
  ];
  const review = [
    { q: '설정 값을 읽는 함수가 없을 때 0을 돌려주는데, 0도 쓸 수 있는 값이라 버그가 났다. 먼저 바꿀 것은?',
      o: ['반환 타입을 std::optional<int>로 바꾼다', '없을 때 -1을 돌려준다', 'int* 를 돌려주고 nullptr로 표시한다'], a: 0,
      why: '없음을 어떤 정수로 나타내도 진짜 값과 겹칠 수 있다. optional은 없음을 nullopt라는 별도 상태로 담는다.' },
    { q: 'variant<int, std::string>에 double을 추가했더니 visit 쪽이 아무 에러 없이 빌드됐다. 먼저 의심할 것은?',
      o: ['double이 int로 자동 변환되었다', 'visitor에 [](auto&&) 같은 catch-all이 있다', 'monostate가 첫 칸에 없다'], a: 1,
      why: '타입별 람다만 있으면 새 대안에서 컴파일이 깨진다. catch-all이 모든 타입을 받아 누락을 숨긴 것이다.' },
    { q: '사용자 이름 optional<std::string>을 화면에 찍는데 비면 "손님"을 보이고 싶다. 알맞은 코드는?',
      o: ['*name', 'name.value()', 'name.value_or("손님")'], a: 2,
      why: '*name은 비면 미정의 동작이고 value()는 예외를 던진다. 기본값이 분명하면 value_or가 맞다.' },
  ];

  R.page({ title: 'optional과 variant의 상자', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
