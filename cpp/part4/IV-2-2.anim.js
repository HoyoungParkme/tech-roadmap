/* IV-2-2 컴파일타임(constexpr) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 출력값(144 / 120 / 25 / 42 / 7)은 코드 블록을 zig c++ -std=c++20 으로 돌려 확인했다.
 * 컴파일 에러로 표시한 줄(constexpr c = readConfig(), cube(e), 파일 범위 int arr[n2])도 같은 컴파일러로 확인했다.
 * 장면 1의 입력값 3 · 5 · 7 은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cells, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ctr = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, opacity: op ?? 1 }, a || {}));

  // 두 띠: 위는 빌드(한 번), 아래는 실행(켤 때마다 세 번)
  const LB = { y: 40, h: 130 }, LR = { y: 220, h: 150 }, RUNX = [500, 660, 820];
  function lanes(op) {
    zone(30, LB.y, 900, LB.h, '빌드 (한 번)', { fill: INFOBG, op, color: INFO });
    zone(30, LR.y, 900, LR.h, '실행 (켤 때마다)', { fill: SOFT, op });
    RUNX.forEach((x, i) => { el('rect', { x: x - 70, y: LR.y + 34, width: 140, height: LR.h - 46, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      tx(x, LR.y + 54, `${i + 1}번째 실행`, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: op }); }); }
  function exe(x, y, label, s) { card(x, y, 120, 64, { rx: 8, stroke: INK, sw: 2.2, s }); if ((s ?? 1) > 0.5) { tx(x, y - 12, 'a.exe', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); if (label) mono(x, y + 18, label, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC }); } }

  // ---------- 1. 계산 시점 ----------
  const INP = [3, 5, 7];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      card(480, 200, 520, 70, { rx: 10, stroke: ACC, sw: 2.4, fill: PANEL, s: pop(u, 0.2) });
      mono(480, 206, 'constexpr int square(int x) { return x * x; }', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      ctr(480, 268, '"컴파일 타임에도 평가될 수 있다"는 자격만 붙는다', fade(u, 1.2), { fill: ACC });
      ctr(480, 296, '아직 아무 계산도 없다', fade(u, 1.7), { fill: MUT }); return; }
    lanes(1);
    if (k === 1) { card(160, 110, 130, 46, { rx: 8, text: 'square(12)', fs: 15, mono: true, s: pop(u, 0.2) });
      grow(228, 110, 300, 110, E(u, 0.4, 0.7), INFO); card(350, 110, 90, 46, { rx: 23, text: '12×12', fs: 15, mono: true, stroke: INFO, s: pop(u, 0.7) });
      grow(398, 110, 560, 110, E(u, 0.9, 1.2), INFO); exe(620, 110, u > 1.3 ? '144' : '', pop(u, 1.1));
      RUNX.forEach((x, i) => { dot([[620, 142], [x, LR.y + 80]], seg(u, 1.5 + i * 0.2, 2.0 + i * 0.2), ACC, 6);
        mono(x, LR.y + 100, '144 읽기', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9 + i * 0.2) }); });
      mono(120, LR.y + 100, '곱셈 0번', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.3) }); return; }
    exe(620, 110, '144', 1); mono(160, 116, 'square(12) → 144', { 'font-size': 15, 'font-weight': 700, fill: INFO });
    // 실행 때 입력
    RUNX.forEach((x, i) => { const d = 0.3 + i * 0.3;
      if (k === 2) { card(x, LR.y + 90, 90, 36, { rx: 6, text: `k = ${INP[i]}`, fs: 15, mono: true, stroke: WARN, s: pop(u, d) }); }
      else { mono(x, LR.y + 84, `k = ${INP[i]}`, { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700 });
        card(x, LR.y + 116, 110, 36, { rx: 18, text: `${INP[i]}×${INP[i]} = ${INP[i] * INP[i]}`, fs: 14, mono: true, stroke: INK, s: pop(u, d) }); } });
    if (k === 2) { mono(340, 116, 'k = ?', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) }); cross(410, 110, 9, pop(u, 1.4));
      mono(60, LR.y + 100, 'std::cin >> k', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.2) });
      tx(60, LR.y + 126, '입력은 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
      tx(200, 158, '빌드 때는 k를 알 수 없다', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); return; }
    mono(60, LR.y + 100, 'square(k)', { 'font-size': 15, 'font-weight': 700 });
    mono(60, LR.y + 126, '곱셈: 실행마다 1번', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) });
    tx(200, 158, '같은 함수, 다른 시점', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.8) }); }

  // ---------- 2. 네 키워드 ----------
  const KW = [
    { kw: 'const', code: 'const int a = readConfig();', when: 'run', val: '10', lockd: true },
    { kw: 'constexpr', code: 'constexpr int b = 6 * 7;', when: 'build', val: '42', lockd: true, bad: 'constexpr int c = readConfig();' },
    { kw: 'consteval', code: 'constexpr int d = cube(3);', when: 'build', val: '27', lockd: true, bad: 'cube(e)  // e는 실행 중 값' },
    { kw: 'constinit', code: 'constinit int g = b;', when: 'build', val: '42', lockd: false },
  ];
  const CBX = 560, CRX = 700, CLX = 860;
  function s2(t, c) { const { k, u } = c;
    const n = Math.min(k + 1, 4);
    tx(CBX, 40, '빌드 때', { 'text-anchor': 'middle', 'font-size': 14, fill: INFO, 'font-weight': 800 });
    tx(CRX, 40, '실행 때', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 800 });
    tx(CLX, 40, '나중에 바꾸기', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 800 });
    el('rect', { x: CBX - 60, y: 50, width: 120, height: 300, rx: 10, fill: INFOBG, opacity: 0.6 });
    KW.slice(0, n).forEach((r, i) => { const y = 88 + i * 76, fresh = i === k, s = fresh ? pop(u, 0.2) : 1, op = k === 4 ? 0.9 : 1;
      mono(40, y - 6, r.kw, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: s > 0.3 ? op : 0 });
      mono(40, y + 18, r.code, { 'font-size': 14, opacity: fresh ? fade(u, 0.4) : op });
      const x = r.when === 'build' ? CBX : CRX;
      card(x, y + 4, 70, 40, { rx: 20, text: r.val, fs: 17, mono: true, fw: 800, stroke: r.when === 'build' ? INFO : INK, color: r.when === 'build' ? INFO : INK, s: fresh ? pop(u, 0.8) : 1 });
      if (r.lockd) lock(CLX, y + 6, true, MUT, fresh ? pop(u, 1.2) : 1); else { const g = fresh ? pop(u, 1.2) : 1; if (g > 0.5) mono(CLX, y + 10, 'g = 100 OK', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: GOOD }); }
      if (fresh && r.bad) { card(380, y + 40, 300, 30, { rx: 15, text: r.bad, fs: 13.5, mono: true, fill: BADBG, stroke: BAD, color: BAD, s: pop(u, 1.6) }); cross(545, y + 40, 8, pop(u, 1.8)); } });
    if (k === 0) note(40, 380, 'const는 "못 바꾼다"만 약속한다. 값은 실행 중에 정해진다', fade(u, 1.6));
    if (k === 1) note(40, 380, '상수식이 아니면 그 자리에서 컴파일 에러', fade(u, 2.1), { fill: BAD });
    if (k === 2) note(40, 380, 'constexpr는 "가능하면", consteval은 "반드시" 빌드 때', fade(u, 2.1));
    if (k === 3) note(40, 380, 'constinit은 초기화 시점만 못 박는다. 값은 나중에 바뀐다', fade(u, 1.8));
    if (k === 4) { card(480, 390, 900, 40, { rx: 10, stroke: INK, sw: 1.5, fill: PANEL, s: pop(u, 0.2) });
      mono(60, 396, 'int arr[b];', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4) }); check(180, 390, 9, pop(u, 0.6));
      mono(220, 396, 'int bad[a];', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) }); cross(335, 390, 8, pop(u, 1.1));
      tx(360, 396, '표준에선 불가 (Clang은 VLA 확장으로 경고만)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) });
      mono(740, 396, 'g = 100;', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.7) }); check(830, 390, 9, pop(u, 1.9)); } }

  // ---------- 3. 컴파일 타임 계산 ----------
  const FACT = [5, 4, 3, 2, 1], FV = [120, 24, 6, 2, 1];
  function s3(t, c) { const { k, u } = c, lut = c.beat.lut.map((x) => x.v), plut = (c.prev && c.prev.lut ? c.prev.lut.map((x) => x.v) : lut);
    if (k <= 1) { zone(30, 30, 520, 360, '빌드 중인 컴파일러', { fill: INFOBG, color: INFO });
      const show = k === 0 ? 1 : Math.min(5, 1 + Math.floor(E(u, 0.2, 1.2) * 5));
      for (let i = 0; i < show; i++) { const y = 80 + i * 58, s = k === 0 ? pop(u, 0.3) : (i === 0 ? 1 : pop(u, 0.2 + i * 0.22));
        card(200 + i * 22, y, 250, 42, { rx: 8, text: i === 4 ? 'factorial(1) = 1' : `factorial(${FACT[i]}) = ${FACT[i]} × f(${FACT[i] - 1})`, fs: 14, mono: true, stroke: INFO, s });
        // 접기: 아래에서 위로 값이 올라간다
        if (k === 1) { const up = 4 - i, a = 1.4 + up * 0.22; if (u > a) mono(352 + i * 22, y + 5, `= ${FV[i]}`, { 'font-size': 15, 'font-weight': 800, fill: GOOD }); } }
      if (k === 0) { note(600, 120, '삼항 연산자로 기저와 재귀', fade(u, 0.8)); mono(600, 150, 'n <= 1 ? 1 : n * f(n-1)', { 'font-size': 14.5, opacity: fade(u, 1.1) });
        note(600, 210, '아직 호출 전이다', fade(u, 1.6), { fill: MUT }); return; }
      card(720, 160, 200, 64, { rx: 10, stroke: GOOD, sw: 2.4, fill: GOODBG, s: pop(u, 2.3) }); mono(720, 166, 'f = 120', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.3) });
      mono(620, 260, 'static_assert(f == 120);', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 2.4) }); check(860, 256, 9, pop(u, 2.5)); return; }
    // 표 칸
    const LX = 120, LY = 120;
    tx(LX, LY - 18, k === 2 ? 'std::array<int, 8> t{}' : 'SQUARES', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const vals = lut.map((v, i) => { if (k === 2) { const f = E(u, 0.2, 1.8) * 4; return i < 4 && i < f ? v : i < 4 ? plut[i] : 0; } if (k === 3) { const f = 4 + E(u, 0.2, 1.4) * 4; return i < f ? v : plut[i]; } return v; });
    const filled = (i) => (k === 2 ? i < E(u, 0.2, 1.8) * 4 && i < 4 : k === 3 ? i < 4 + E(u, 0.2, 1.4) * 4 : true);

    cells(LX, LY, vals, { w: 62, h: 48, gap: 6, index: true, style: (i) => (k === 4 && i === 5 && u > 0.9 ? { stroke: ACC, fill: ACCBG, sw: 3 } : filled(i) ? { stroke: INFO } : { stroke: GRID, color: OFF }) });
    if (k === 2) { mono(LX, 240, 'for (int i = 0; i < 8; ++i) t[i] = i * i;', { 'font-size': 15, opacity: fade(u, 0.3) });
      note(LX, 290, '반복문으로 채운다. 이 일도 빌드 중에 한다', fade(u, 1.9), { fill: INFO }); return; }
    if (k === 3) { const g = E(u, 1.6, 2.4); card(480, 300, 600, 90, { rx: 10, stroke: INK, sw: 2.2, s: pop(u, 1.5) });
      tx(200, 286, 'a.exe 읽기 전용 영역 (.rodata)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      if (g > 0) cells(200, 300, lut, { w: 58, h: 34, gap: 4, fs: 14, style: () => ({ op: g }) });
      return; }
    // k 4: 읽기만
    exe(820, 260, '', 1);
    terminal(120, 230, 460, 120, ['$ ./a.exe', 'f → 120', 'SQUARES[5] → 25'], lerp(1, 3, E(u, 0.4, 1.4)));
    mono(640, 330, '계산 0번 · 읽기만', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); }

  // ---------- 4. if constexpr ----------
  function branchBox(x, y, w, lines, o) { o = o || {}; const lh = 26;
    el('rect', { x, y, width: w, height: lines.length * lh + 20, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    lines.forEach(([s, st], i) => { st = st || {}; if (st.hide) return;
      if (st.bg) el('rect', { x: x + 6, y: y + 10 + i * lh, width: w - 12, height: lh - 2, rx: 5, fill: st.bg, opacity: o.op ?? 1 });
      mono(x + 16, y + 28 + i * lh, s, { 'font-size': 14.5, fill: st.col || INK, opacity: (st.op ?? 1) * (o.op ?? 1), 'text-decoration': st.strike ? 'line-through' : null, 'font-weight': st.b ? 700 : 400 }); }); }
  function s4(t, c) { const { k, u } = c;
    const L = (o1, o2) => [
      ['template <typename T>', {}],
      ['constexpr auto deref(T value) {', {}],
      ['  if constexpr (std::is_pointer_v<T>)', { b: true, col: INFO }],
      ['    return *value;', o1 || {}],
      ['  else', o2 && o2.strike ? { strike: true, col: OFF } : {}],
      ['    return value;', o2 || {}],
      ['}', {}],
    ];
    if (k === 0) { branchBox(60, 80, 420, L(), { op: fade(u, 0.2, 0.5) });
      pill(700, 120, 'T = ?', WARN, pop(u, 0.8), { mono: true, fs: 17 });
      note(580, 190, '아직 T가 정해지지 않았다', fade(u, 1.2)); note(580, 220, '두 가지 모두 후보로 남아 있다', fade(u, 1.5), { fill: MUT }); return; }
    if (k === 1 || k === 2) { const cut = k === 2 ? E(u, 0.3, 1.2) : 0;
      branchBox(60, 80, 420, L({ bg: ACCBG, col: ACC, b: true }, cut > 0.5 ? { strike: true, col: OFF } : {}));
      pill(700, 100, 'T = int*', ACC, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 17, fill: ACCBG });
      mono(560, 170, 'is_pointer_v<int*>', { 'font-size': 15, 'font-weight': 700, opacity: k === 1 ? fade(u, 0.6) : 1 });
      mono(760, 170, '→ true', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: k === 1 ? fade(u, 1.0) : 1 });
      grow(560, 190, 470, 160, k === 1 ? E(u, 1.2, 1.6) : 1, ACC);
      if (k === 1) note(560, 260, '조건이 빌드 때 참으로 정해진다', fade(u, 1.8));
      if (k === 2) { el('line', { x1: 66, y1: 196, x2: lerp(66, 474, cut), y2: 196, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
        note(560, 240, 'else 가지는 인스턴스화되지 않는다', fade(u, 1.2), { fill: BAD }); note(560, 270, '일반 if였다면 두 가지 모두 컴파일된다', fade(u, 1.7), { fill: MUT }); }
      return; }
    // k 3: 두 실체
    [['deref<int*>', ['return *value;'], 'deref(&x)', '42', 0.2], ['deref<int>', ['return value;'], 'deref(7)', '7', 0.9]].forEach(([nm, body, call, out, d], i) => { const y = 70 + i * 150;
      mono(60, y + 30, call, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, d) });
      grow(180, y + 25, 250, y + 25, E(u, d + 0.2, d + 0.5), ACC);
      card(390, y + 25, 260, 76, { rx: 10, stroke: ACC, sw: 2.2, s: pop(u, d + 0.4) });
      mono(280, y + 12, nm, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, d + 0.5) }); mono(296, y + 42, body[0], { 'font-size': 14.5, opacity: fade(u, d + 0.6) });
      grow(522, y + 25, 600, y + 25, E(u, d + 0.7, d + 1.0), MUT); mono(616, y + 31, out, { 'font-size': 22, 'font-weight': 800, opacity: fade(u, d + 1.0) }); });
    note(680, 120, '호출 타입마다', fade(u, 1.9)); note(680, 148, '다른 함수가 하나씩 생긴다', fade(u, 2.1), { fill: ACC }); }

  // ---------- 5. 실패 사례 ----------
  const PIT = ['① 런타임 값', '② const 오해', '③ 과한 계산', '④ 항상 빌드 때?'];
  function pits(on, u) { PIT.forEach((s, i) => pill(122 + i * 238, 30, s, i === on ? BAD : GRID, i === on ? pop(u, 0.1) : 1, { fs: 14, fill: i === on ? BADBG : PANEL, color: i === on ? BAD : OFF })); }
  function mini(op) { zone(30, 70, 900, 110, '빌드', { fill: INFOBG, color: INFO, op }); zone(30, 194, 900, 110, '실행', { fill: SOFT, op }); }
  function s5(t, c) { const { k, u } = c;
    pits(k <= 2 ? k : 3, u); mini(1);
    if (k === 0) { card(700, 249, 130, 44, { rx: 8, text: 'getSize() → 8', fs: 14, mono: true, s: pop(u, 0.2) });
      mono(70, 130, 'constexpr int n1 = getSize();', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) });
      grow(640, 240, 420, 140, E(u, 0.8, 1.3), BAD); cross(410, 140, 10, pop(u, 1.3));
      mono(70, 255, 'const int n1 = getSize();', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); check(360, 249, 9, pop(u, 1.9));
      ctr(480, 350, '실행 중에 정해지는 값은 constexpr에 넣을 수 없다', fade(u, 2.1), { 'font-weight': 700 }); return; }
    if (k === 1) { mono(70, 255, 'const int n2 = getSize();', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) }); lock(380, 250, true, MUT, pop(u, 0.4));
      mono(70, 130, 'int arr[n2];   // 파일 범위', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) });
      grow(200, 236, 200, 150, E(u, 1.0, 1.4), BAD); cross(380, 124, 10, pop(u, 1.4));
      ctr(480, 350, '"안 바뀜"과 "컴파일 타임 상수"는 다르다', fade(u, 1.9), { 'font-weight': 700, fill: BAD }); return; }
    if (k === 2) { mono(70, 120, 'constexpr int n3 = 8;', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
      mono(70, 150, 'int arr[n3];', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.4) }); check(200, 144, 9, pop(u, 0.6));
      // 커지는 컴파일 타임 계산
      mono(470, 120, 'constexpr auto t = huge<100000>();', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.9) });
      const g = E(u, 1.1, 2.4); el('rect', { x: 470, y: 136, width: 420, height: 18, rx: 4, fill: PANEL, stroke: GRID });
      el('rect', { x: 470, y: 136, width: 420 * g, height: 18, rx: 4, fill: g > 0.85 ? BAD : WARN });
      tx(470, 172, '빌드 시간 · 메모리', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.1) });
      tx(470, 250, '실행은 빨라져도', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) });
      ctr(480, 350, '재귀 한도를 넘기면 빌드가 실패한다', fade(u, 2.3), { 'font-weight': 700, fill: BAD }); return; }
    mono(70, 120, 'constexpr int f(int x) { return x + 1; }', { 'font-size': 14.5, 'font-weight': 700, opacity: k === 3 ? fade(u, 0.2) : 1 });
    if (k === 3) { mono(70, 250, 'int a = f(k);', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
      card(560, 249, 220, 44, { rx: 8, text: 'k = 8 → f 실행 → 9', fs: 14, mono: true, stroke: WARN, s: pop(u, 1.0) });
      ctr(480, 350, '인자가 실행 중 값이면 보통 함수처럼 실행 때 돈다', fade(u, 1.8), { 'font-weight': 700 }); return; }
    mono(70, 150, 'constexpr int b = f(3);', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.3) });
    card(560, 140, 100, 44, { rx: 22, text: 'b = 4', fs: 16, mono: true, fw: 800, stroke: INFO, color: INFO, s: pop(u, 0.8) });
    mono(70, 172, 'static_assert(b == 4);', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); check(330, 166, 9, pop(u, 1.5));
    tx(70, 255, '실행 때 할 계산이 없다', { 'font-size': 15, 'font-weight': 600, fill: MUT, opacity: fade(u, 1.6) });
    ctr(480, 350, 'constexpr 변수와 static_assert로 빌드 때 계산을 못 박는다', fade(u, 1.9), { 'font-weight': 700, fill: GOOD }); }

  const quiz = [
    { q: 'constexpr int a = square(12); 를 출력하는 줄은 실행할 때 무엇을 하는가?',
      o: ['12 × 12를 다시 계산한다', '빌드 때 박힌 144를 읽기만 한다', '처음 한 번만 계산하고 저장한다'], a: 1,
      why: '인자 12가 상수라 빌드 때 한 번 계산되고 실행 파일에는 144만 남는다. 이것이 상수 폴딩이다.' },
    { q: '배열 크기 자리에 쓸 수 있는 것은 무엇인가?',
      o: ['constexpr int b = 6 * 7;', 'const int a = readConfig();', 'constinit int g = b; 의 g'], a: 0,
      why: '배열 크기는 상수식만 받는다. const는 못 바꾼다는 약속뿐이고 constinit은 값이 나중에 바뀔 수 있어 상수식이 아니다.' },
    { q: 'constexpr auto SQUARES = makeSquares(); 의 표는 언제 채워지는가?',
      o: ['프로그램이 시작될 때', 'SQUARES[5]를 처음 읽을 때', '빌드할 때 채워져 실행 파일에 구워진다'], a: 2,
      why: 'constexpr 함수 안의 반복문도 빌드 중에 돈다. 그래서 실행할 때는 초기화 비용 없이 25를 읽기만 한다.' },
    { q: 'deref(7)을 부를 때 if constexpr의 else 가지는 어떻게 되는가?',
      o: ['T = int라 is_pointer_v가 거짓이 되어 else 가지만 남는다', '두 가지 모두 컴파일되고 실행 중에 고른다', '컴파일 에러가 난다'], a: 0,
      why: 'if constexpr는 조건을 빌드 때 판정해 고른 가지만 남긴다. deref<int>에는 return value; 만 있어 7을 돌려준다.' },
    { q: 'constexpr int f(int x)에 실행 중 값 k를 넘기면 어떻게 되는가?',
      o: ['컴파일 에러가 난다', '보통 함수처럼 실행 때 계산된다', '빌드 때 k를 추측해 계산한다'], a: 1,
      why: 'constexpr 함수는 빌드 때도 될 수 있다는 자격일 뿐이다. 호출 문맥이 시점을 정하므로, 강제하려면 constexpr 변수나 consteval을 쓴다.' },
  ];

  const summary = [
    '보통 계산은 실행할 때마다 다시 돌고, constexpr은 그 계산을 빌드 때로 옮길 수 있게 한다.',
    'const는 못 바꾼다는 약속뿐이라 배열 크기처럼 상수식이 필요한 자리에는 constexpr을 쓴다.',
    'constexpr 함수는 재귀와 반복을 담을 수 있어 120이나 제곱수 표를 빌드 때 만들어 둔다.',
    '인자가 실행 중 값이면 constexpr 함수도 실행 때 돌고, 너무 큰 빌드 계산은 빌드를 무겁게 한다.',
  ];
  const review = [
    { q: '전역 const int SIZE = loadSize(); 로 std::array<int, SIZE>를 만들려 했더니 컴파일 에러가 났다. 먼저 의심할 것은?',
      o: ['std::array는 전역에서 못 쓴다', 'loadSize가 너무 느리다', 'SIZE가 상수식이 아니라 템플릿 인자로 쓸 수 없다'], a: 2,
      why: 'const는 값이 실행 중에 정해져도 붙는다. 템플릿 인자와 배열 크기는 상수식만 받으므로 빌드 때 아는 값이면 constexpr로 바꾼다.' },
    { q: '해시 함수를 constexpr로 만들었는데 프로파일러에 여전히 그 함수가 잡힌다. 왜 그럴까?',
      o: ['constexpr는 inline이 아니라서', '실행 중 문자열을 인자로 넘겨 실행 때 계산되고 있어서', 'static_assert를 쓰지 않아 constexpr가 무시되어서'], a: 1,
      why: 'constexpr 함수는 인자가 상수일 때만 빌드 때 계산된다. 실행 중 값이 들어오면 보통 함수와 같이 돈다.' },
    { q: '빌드 때 sin 표를 크게 만들도록 바꿨더니 빌드가 몇 배 느려지고 가끔 실패한다. 알맞은 조치는?',
      o: ['표를 더 키워 한 번에 끝낸다', '표 크기를 줄이거나 실행 때 한 번 만든다', 'const로 바꿔 빌드 때 계산을 유지한다'], a: 1,
      why: '빌드 때 계산도 시간과 메모리를 쓰고 재귀 한도에 걸릴 수 있다. 크기를 재고 필요하면 실행 때 생성한다.' },
  ];

  R.page({ title: '계산은 언제 일어나나', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
