/* III-2-2 nullable 참조 타입 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 경고·오류 번호는 .NET 10 에서 페이지 코드를 컴파일해 확인했다:
 *   null 대입 CS8600, null 가능 값 역참조 CS8602, required 누락 CS9035, typeof(string?) CS8639,
 *   [NotNullWhen(true)] 헬퍼 뒤에서는 경고 없음, string? 의 GetType() 은 System.String */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // null 표시: 땅(접지) 기호
  function nul(x, y, s, col) { const g = R.G(x, y, s ?? 1); col = col || BAD;
    el('line', { x1: 0, y1: -16, x2: 0, y2: 0, stroke: col, 'stroke-width': 3 }, g);
    [[-16, 0], [-10, 7], [-4, 14]].forEach(([w, y]) => el('line', { x1: w, y1: y, x2: -w, y2: y, stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round' }, g));
    tx(0, 36, 'null', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', class: 'mono', fill: col }, g); }
  // 경고 삼각형
  function warnSign(x, y, code, s, col) { const g = R.G(x, y, s ?? 1); col = col || WARN;
    el('path', { d: 'M0,-16 L16,12 L-16,12 Z', fill: col === BAD ? BADBG : WARNBG, stroke: col, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    tx(0, 8, '!', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col }, g);
    if (code) mono(24, 7, code, { 'font-size': 14.5, 'font-weight': 800, fill: col }, g); }
  function boom(x, y, s) { const g = R.G(x, y, s ?? 1); let d = ''; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 22 : 40; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1); }
    el('path', { d: d + 'Z', fill: BADBG, stroke: BAD, 'stroke-width': 2.5 }, g); }
  function slot(x, y, name, type, s, col) { card(x, y, 220, 44, { rx: 6, s: s ?? 1, stroke: col || INK });
    mono(x - 98, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: clamp(s ?? 1) });
    mono(x + 50, y + 5, type, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: clamp(s ?? 1) });
    el('circle', { cx: x + 96, cy: y, r: 5, fill: col || INK, opacity: clamp(s ?? 1) }); }

  // ---------- 1. 문제 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 4) { // 타입 = 집합. string 안에 null 이 몰래 들어 있다
      el('ellipse', { cx: 360, cy: 210, rx: 260, ry: 140, fill: PANEL, stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 0.1) });
      mono(240, 128, 'string', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.2) });
      ['"Kim"', '"Seoul"', '""', '"hello"'].forEach((s, i) => card(220 + (i % 2) * 150, 180 + Math.floor(i / 2) * 60, 100, 34, { rx: 17, text: s, fs: 14, mono: true, stroke: GRID, s: pop(u, 0.4 + i * 0.15) }));
      nul(520, 220, pop(u, 1.2));
      note(660, 180, '타입이 둘을 구분하지 않는다', fade(u, 1.6), { fill: BAD }); note(660, 210, '그래서 컴파일러도 막지 못한다', fade(u, 1.9), { fill: MUT }); return; }
    zone(24, 40, 330, 300, '스택', { fill: SOFT }); zone(380, 40, 556, 300, '힙', { fill: SOFT });
    slot(190, 120, 'name', 'string', k === 0 ? pop(u, 0.2) : 1);
    card(600, 110, 130, 40, { rx: 8, text: '"Kim"', fs: 15, mono: true, stroke: GRID, op: k === 0 ? fade(u, 0.8) * 0.8 : 0.35 });
    nul(600, 220, k === 0 ? pop(u, 1.0) : 1);
    if (k === 0) { grow(286, 120, 530, 112, E(u, 1.3, 1.8), MUT, { dash: '5 5' }); grow(286, 120, 586, 200, E(u, 1.3, 1.8), MUT, { dash: '5 5' });
      mono(420, 160, '?', { 'font-size': 26, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
      note(40, 380, '타입만 봐서는 어느 쪽인지 알 수 없다', fade(u, 2.0)); return; }
    grow(286, 120, 586, 200, 1, BAD);
    if (k === 1) { pill(190, 190, 'name.Length', INK, pop(u, 0.3), { mono: true, fs: 15 });
      dot([[286, 120], [586, 200]], seg(u, 0.8, 1.8), BAD, 8); note(40, 380, '확인 없이 바로 화살표를 따라간다', fade(u, 1.8)); return; }
    if (k === 2) { card(190, 260, 260, 44, { rx: 10, stroke: GOOD, fill: GOODBG, s: pop(u, 0.2) }); check(90, 260, 9, pop(u, 0.4)); tx(110, 265, '빌드 성공 · 경고 0', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.4) });
      boom(760, 230, pop(u, 1.2)); mono(660, 310, 'NullReferenceException', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      note(40, 380, '컴파일 때는 조용하고, 운영 중에 죽는다', fade(u, 2.0), { fill: BAD }); return; }
    // k3: null 의 출처
    card(760, 300, 250, 50, { rx: 10, text: 'static string GetUserName()', fs: 13.5, mono: true, stroke: BAD, s: pop(u, 0.2) });
    grow(700, 274, 628, 222, E(u, 0.6, 1.1), BAD);
    mono(700, 360, 'return null;', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
    note(40, 380, '반환 타입 string에는 이 가능성이 적혀 있지 않다', fade(u, 1.6), { fill: BAD }); }

  // ---------- 2. #nullable enable ----------
  function sets(u, o) { o = o || {}; const sp = o.split ?? 1;
    el('ellipse', { cx: lerp(480, 270, sp), cy: 230, rx: lerp(300, 190, sp), ry: 120, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    mono(lerp(480, 270, sp), 140, 'string', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
    if (sp > 0.05) { el('ellipse', { cx: lerp(480, 700, sp), cy: 230, rx: lerp(300, 190, sp), ry: 120, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, opacity: sp });
      mono(lerp(480, 700, sp), 140, 'string?', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: sp });
      nul(760, 230, sp); tx(700, 330, '"Kim" … 그리고 null', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: sp }); }
    tx(270, 330, '"Kim", "Seoul" … null 없음', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: sp }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 4) { card(300, 110, 480, 90, { rx: 10, fill: INK, stroke: 'none', s: pop(u, 0.2) });
      mono(80, 100, '<Nullable>enable</Nullable>', { 'font-size': 15, fill: PANEL, opacity: fade(u, 0.3) });
      mono(80, 128, '<WarningsAsErrors>Nullable</WarningsAsErrors>', { 'font-size': 15, fill: PANEL, opacity: fade(u, 0.7) });
      ['CS8600', 'CS8602'].forEach((cd, i) => { const red = u > 1.4 + i * 0.3; warnSign(640, 100 + i * 60, cd, 1, red ? BAD : WARN); tx(800, 107 + i * 60, red ? '오류' : '경고', { 'font-size': 15, 'font-weight': 800, fill: red ? BAD : WARN }); });
      card(480, 300, 420, 56, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s: pop(u, 2.0) });
      tx(480, 306, 'null 규칙을 어기면 빌드가 멈춘다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    sets(u, { split: k === 0 ? E(u, 0.6, 1.8) : 1 });
    pill(480, 60, '#nullable enable', ACC, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 15 });
    if (k === 0) { note(330, 400, '같던 string이 둘로 갈린다', fade(u, 2.0)); return; }
    if (k === 1) { const g = seg(u, 0.3, 1.2); if (g < 1) fly(520, 400, 300, 230, g, 'null', { fill: BAD, mono: true }); else nul(300, 215, 1, BAD);
      warnSign(170, 220, 'CS8600', pop(u, 1.3)); mono(40, 395, 'city = null;', { 'font-size': 15, opacity: fade(u, 0.1) });
      note(330, 395, '경고만 뜬다 · 실행 중에 막지는 않는다', fade(u, 1.8), { fill: WARN }); return; }
    if (k === 2) { fly(520, 400, 680, 250, seg(u, 0.3, 1.2), 'null', { fill: WARN, mono: true }); check(620, 260, 10, pop(u, 1.3));
      mono(40, 395, 'string? nickname = null;', { 'font-size': 15, opacity: fade(u, 0.1) }); note(400, 395, '물음표가 "없을 수도 있다"는 선언', fade(u, 1.6), { fill: WARN }); return; }
    // k3: User? Find → 역참조 경고
    card(480, 395, 520, 36, { rx: 8, text: 'User? user = repo.Find(id);  user.Name', fs: 14, mono: true, stroke: INK, s: pop(u, 0.1) });
    warnSign(790, 380, 'CS8602', pop(u, 1.0));
    tx(480, 360, '시그니처만 보고도 null 검사가 필요한 걸 안다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }

  // ---------- 3. 흐름 분석 ----------
  function chip(x, y, nn, s) { card(x, y, nn ? 120 : 130, 30, { rx: 15, text: nn ? 'not-null' : 'maybe-null', fs: 13.5, mono: true, fw: 700, stroke: nn ? GOOD : WARN, color: nn ? GOOD : WARN, fill: nn ? GOODBG : WARNBG, s }); }
  function s3(t, c) { const { k, u } = c;
    card(480, 60, 330, 44, { rx: 8, text: 'string? name = GetName();', fs: 15, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    chip(720, 60, false, k === 0 ? pop(u, 0.8) : 1);
    if (k === 0) { warnSign(480, 190, null, pop(u, 1.2)); mono(510, 197, 'name.Length → CS8602', { 'font-size': 15, fill: WARN, opacity: fade(u, 1.3) });
      note(260, 300, '컴파일러가 줄마다 null 가능 여부를 기록해 둔다', fade(u, 1.8)); return; }
    const cond = k === 1 ? 'name != null' : k === 2 ? 'name is not null' : 'Helper(name)', attr = k === 4;
    grow(480, 82, 480, 122, 1, MUT);
    el('path', { d: 'M480,122 L620,172 L480,222 L340,172 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
    mono(480, 177, attr ? 'HasValue(name)' : cond, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' });
    const g = k === 4 ? 1 : E(u, 0.4, 1.0);
    grow(360, 190, 220, 270, g, GOOD); grow(600, 190, 740, 270, g, MUT);
    tx(260, 222, 'true', { 'font-size': 14, fill: GOOD, 'font-weight': 700 }); tx(680, 222, 'false', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    const okTrue = k === 1 || k === 2 || (k === 4 && u > 1.0);
    card(200, 300, 230, 44, { rx: 8, text: 'name.Length', fs: 15, mono: true, stroke: okTrue ? GOOD : WARN, s: k === 4 ? 1 : pop(u, 1.0) });
    chip(200, 350, okTrue, k === 4 ? 1 : pop(u, 1.3));
    chip(760, 300, false, k === 4 ? 1 : pop(u, 1.3));
    if (k === 1) { note(330, 400, '검사를 지난 블록 안에서만 string으로 좁혀진다', fade(u, 1.8), { fill: GOOD }); return; }
    if (k === 2) { note(330, 400, '패턴 검사도, ??와 ?. 도 같은 방식으로 읽는다', fade(u, 1.8), { fill: GOOD }); return; }
    if (k === 3) { warnSign(345, 300, 'CS8602', pop(u, 1.5));
      card(800, 120, 230, 60, { rx: 8, dash: '6 5', stroke: GRID, s: pop(u, 0.6) }); tx(800, 115, 'bool Helper(string? s)', { 'font-size': 13.5, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 0.7) }); tx(800, 138, '안은 보지 않는다', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      note(330, 400, '검사했는데도 경고가 남는다 · 여기서 ! 를 쓰지 않는다', fade(u, 2.0), { fill: WARN }); return; }
    card(800, 120, 250, 60, { rx: 8, stroke: GOOD, sw: 2.5, fill: GOODBG, s: pop(u, 0.2) });
    mono(800, 115, '[NotNullWhen(true)]', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    tx(800, 138, 'true면 인자는 null 아님', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
    note(330, 400, '특성으로 약속을 알려 주면 좁힘이 돌아온다', fade(u, 1.8), { fill: GOOD }); }

  // ---------- 4. null 처리 연산자 ----------
  function chain(y, names, stopAt, u, a) { names.forEach((n, i) => { const x = 140 + i * 190, nullHere = i === stopAt;
      card(x, y, 150, 44, { rx: 8, text: nullHere ? 'null' : n, fs: 15, mono: true, stroke: nullHere ? BAD : INK, color: nullHere ? BAD : INK, op: stopAt != null && i > stopAt ? 0.3 : 1 });
      if (i < names.length - 1) { grow(x + 75, y, x + 115, y, 1, stopAt != null && i >= stopAt ? GRID : MUT); mono(x + 95, y - 10, '?.', { 'font-size': 14, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }); } }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) {
      mono(40, 62, k === 0 ? 'user?.Address?.City' : k === 1 ? 'user?.Name ?? "익명"' : 'cityName ??= "미상"', { 'font-size': 17, 'font-weight': 800, fill: ACC });
      if (k === 0) { tx(40, 110, 'user가 있을 때', { 'font-size': 14, fill: MUT }); chain(150, ['user', 'Address', 'City'], null, u);
        dot([[140, 150], [710, 150]], seg(u, 0.2, 1.2), GOOD, 7); card(860, 150, 110, 40, { rx: 20, text: 'City 값', fs: 14, stroke: GOOD, color: GOOD, s: pop(u, 1.2) });
        tx(40, 240, 'user가 null일 때', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3) }); chain(280, ['user', 'Address', 'City'], 0, u);
        dot([[140, 280], [215, 280]], seg(u, 1.4, 1.8), BAD, 7); if (u > 1.9) grow(215, 280, 780, 280, E(u, 1.9, 2.3), BAD, { dash: '5 5' });
        card(860, 280, 110, 40, { rx: 20, text: 'null', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 2.3) });
        note(40, 370, '뒤를 평가하지 않고 통째로 null · 결과는 string?', fade(u, 2.4)); return; }
      if (k === 1) { card(200, 180, 200, 48, { rx: 8, text: 'user?.Name', fs: 15, mono: true }); card(200, 280, 120, 40, { rx: 20, text: 'null', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 0.3) });
        grow(300, 280, 470, 230, E(u, 0.8, 1.3), ACC); pill(530, 222, '??', ACC, pop(u, 0.7), { mono: true, fs: 16 });
        card(720, 230, 160, 48, { rx: 24, text: '"익명"', fs: 16, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 1.4) });
        note(560, 320, 'display는 string · null이 아니다', fade(u, 1.9), { fill: GOOD }); return; }
      [['null', '"미상"', 0.3], ['"Seoul"', '"Seoul"', 1.4]].forEach(([before, after, a], i) => { const y = 170 + i * 120;
        card(200, y, 150, 46, { rx: 8, text: before, fs: 15, mono: true, stroke: before === 'null' ? BAD : INK, color: before === 'null' ? BAD : INK, s: pop(u, a) });
        grow(280, y, 440, y, E(u, a + 0.3, a + 0.7), before === 'null' ? ACC : GRID);
        card(540, y, 150, 46, { rx: 8, text: after, fs: 15, mono: true, stroke: GOOD, fill: before === 'null' ? GOODBG : PANEL, s: pop(u, a + 0.7) });
        tx(640, y + 5, before === 'null' ? '채운다' : '그대로 · 오른쪽은 평가도 안 함', { 'font-size': 14, 'font-weight': 700, fill: before === 'null' ? GOOD : MUT, opacity: fade(u, a + 0.8) }); });
      tx(110, 290 - 50, '이미 값이 있으면', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.3) }); return; }
    if (k === 3) { card(250, 110, 380, 60, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 0.2) });
      mono(250, 105, 'user == null', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle' }); tx(250, 128, '타입이 == 를 재정의했으면 그 코드가 답한다', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      card(250, 260, 380, 60, { rx: 10, stroke: GOOD, sw: 2.5, fill: GOODBG, s: pop(u, 1.0) });
      mono(250, 255, 'user is null', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD }); tx(250, 278, '참조가 null 인지만 본다', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      grow(440, 260, 640, 260, E(u, 1.4, 1.9), GOOD); nul(690, 245, pop(u, 1.9), GOOD);
      note(520, 130, '같은 질문, 다른 답이 나올 수 있다', fade(u, 0.9), { fill: WARN }); return; }
    // k4: required
    card(480, 70, 460, 44, { rx: 8, text: 'public required string Name { get; init; }', fs: 14.5, mono: true, stroke: ACC, s: pop(u, 0.1) });
    card(260, 200, 340, 70, { rx: 10, stroke: BAD, sw: 2.5, fill: BADBG, s: pop(u, 0.6) });
    mono(260, 195, 'new User { }', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.7) });
    tx(260, 220, 'CS9035 · Name을 채워야 한다', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    card(700, 200, 340, 70, { rx: 10, stroke: GOOD, sw: 2.5, fill: GOODBG, s: pop(u, 1.3) });
    mono(700, 195, 'new User { Name = "Kim" }', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.4) });
    check(700, 222, 9, pop(u, 1.6));
    note(150, 340, '생성자 없이도 non-null이 보장된다', fade(u, 2.0)); }

  // ---------- 5. ! · int? · 마이그레이션 ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { zone(24, 40, 330, 280, '스택', { fill: SOFT }); zone(380, 40, 556, 280, '힙', { fill: SOFT });
      slot(190, 120, 'user', 'User?', 1); nul(620, 180, 1); grow(286, 120, 606, 160, 1, BAD);
      if (k === 0) { mono(40, 370, 'string name = user!.Name;', { 'font-size': 16, 'font-weight': 700 });
        const gone = E(u, 0.6, 1.2); if (gone < 1) warnSign(330, 362, 'CS8602', 1 - gone);
        pill(225, 335, '! = 경고 끄기', ACC, pop(u, 0.4), { fs: 13.5 });
        dot([[286, 120], [606, 160]], seg(u, 1.4, 2.0), BAD, 8); boom(720, 160, pop(u, 2.0)); mono(620, 270, 'NRE', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); return; }
      mono(40, 370, 'string safe = user?.Name ?? "익명";', { 'font-size': 16, 'font-weight': 700 });
      dot([[286, 120], [450, 140]], seg(u, 0.3, 0.9), BAD, 8);
      card(780, 140, 150, 46, { rx: 23, text: '"익명"', fs: 16, mono: true, stroke: GOOD, fill: GOODBG, s: pop(u, 1.1) });
      grow(460, 140, 700, 140, E(u, 0.9, 1.3), GOOD); note(420, 270, '검사로 바꾸면 ! 가 필요 없다', fade(u, 1.6), { fill: GOOD }); return; }
    if (k === 2) { zone(24, 40, 520, 330, '스택 · int? age', { fill: SOFT });
      tx(60, 100, 'Nullable<int> 구조체', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.2) });
      [['HasValue', 'false'], ['Value', '0']].forEach(([n, v], i) => { card(170 + i * 230, 170, 210, 70, { rx: 8, stroke: INFO, sw: 2.2, s: pop(u, 0.4 + i * 0.3) });
        tx(80 + i * 230, 160, n, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.3) }); mono(80 + i * 230, 190, v, { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.3) }); });
      note(60, 290, '런타임에 실제로 있는 칸 두 개', fade(u, 1.2), { fill: INFO });
      mono(600, 160, 'age.HasValue  → false', { 'font-size': 15, opacity: fade(u, 1.4) });
      mono(600, 200, 'age ?? 0      → 0', { 'font-size': 15, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    if (k === 3) { [['string', 160], ['string?', 300]].forEach(([ty, y], i) => { slot(220, y, i ? 's2' : 's1', ty, pop(u, 0.2 + i * 0.3));
        grow(316, y, 560, 230, E(u, 0.7 + i * 0.2, 1.1 + i * 0.2), INK); });
      card(650, 230, 160, 46, { rx: 8, text: '"a"', fs: 16, mono: true, s: pop(u, 0.6) });
      mono(560, 120, 'GetType() → System.String', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      mono(560, 350, 'typeof(string?)', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); warnSign(740, 343, 'CS8639', pop(u, 2.0), BAD);
      note(40, 400, '물음표는 컴파일러에게만 보이는 표시다', fade(u, 2.2)); return; }
    // k4: 파일 단위 점진 적용
    const cols = 8, rows = 4, lit = Math.floor(E(u, 0.3, 2.3) * 14);
    for (let i = 0; i < cols * rows; i++) { const x = 110 + (i % cols) * 100, y = 90 + Math.floor(i / cols) * 70, on = i < lit;
      card(x, y, 80, 52, { rx: 6, stroke: on ? GOOD : GRID, fill: on ? GOODBG : PANEL, sw: on ? 2.2 : 1.4 });
      el('path', { d: `M${x - 18},${y - 14} h24 l12,12 v28 h-36 Z`, fill: 'none', stroke: on ? GOOD : OFF, 'stroke-width': 2 }); }
    note(70, 390, '#nullable enable을 파일·폴더 단위로 늘려 간다', fade(u, 0.6), { fill: GOOD });
    tx(890, 390, '레거시 파일은 그대로', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.2) }); }

  const quiz = [
    { q: 'nullable을 켜기 전 string name = GetUserName(); name.Length가 위험한 이유는 무엇인가?',
      o: ['string이 null을 담을 수 있는데 타입에 그 표시가 없다', 'Length는 원래 느린 속성이다', 'GetUserName이 컴파일 오류를 낸다'], a: 0,
      why: '경고 없이 빌드되고 실행 중에 NullReferenceException이 난다. null이 들어올 수 있다는 정보가 타입에 없어서다.' },
    { q: '#nullable enable 뒤 string city에 null을 대입하면 어떻게 되나?',
      o: ['컴파일 오류로 빌드가 멈춘다', '경고 CS8600이 뜨지만 실행은 막지 않는다', '실행할 때 대입이 무시된다'], a: 1,
      why: 'nullable은 컴파일러의 정적 분석이다. 막으려면 WarningsAsErrors로 경고를 오류로 올린다.' },
    { q: '직접 만든 bool Helper(string? s)로 검사했는데도 CS8602가 남는다. 올바른 고침은?',
      o: ['사용하는 곳마다 name! 를 붙인다', 'Helper를 지우고 검사를 하지 않는다', '매개변수에 [NotNullWhen(true)]를 붙인다'], a: 2,
      why: '컴파일러는 헬퍼 안을 보지 않는다. 특성으로 true면 인자가 null이 아니라고 알려 주면 좁힘이 돌아온다.' },
    { q: 'user가 null일 때 user?.Name ?? "익명" 의 결과는?',
      o: ['null', '"익명"', 'NullReferenceException'], a: 1,
      why: '?.가 뒤를 건너뛰고 null을 내면 ??가 오른쪽 기본값을 쓴다.' },
    { q: 'int?와 string?의 차이로 맞는 것은?',
      o: ['둘 다 런타임에 Nullable 구조체다', '둘 다 컴파일러 표시일 뿐이다', 'int?는 HasValue를 가진 구조체이고 string?는 런타임엔 그냥 string이다'], a: 2,
      why: 'int?는 Nullable<int>로 HasValue·Value 칸이 실제로 있다. string?의 물음표는 런타임 타입을 바꾸지 않는다.' },
  ];

  const summary = [
    '참조 타입은 원래 표시 없이 null을 담아서, 컴파일은 되고 실행 중에 NRE가 난다.',
    '#nullable enable을 켜면 string은 null 아님, string?는 null 가능으로 갈린다.',
    '컴파일러는 null 검사 뒤의 블록에서 변수를 null 아님으로 좁혀 준다.',
    'null 허용 연산자 !는 경고만 끄고 검사는 하지 않는다. 실제 처리는 ?.와 ??로 한다.',
  ];
  const review = [
    { q: '경고를 없애려고 곳곳에 ! 를 붙였더니 경고는 0개인데 운영에서 NRE가 났다. 원인은?',
      o: ['nullable이 꺼져 있었다', '! 는 런타임에 아무것도 검사하지 않는다', '?? 연산자가 null을 만들었다'], a: 1,
      why: '! 는 컴파일러에게 책임지겠다고 말할 뿐이다. 값이 null이면 그대로 NRE가 난다. 실제 검사나 ?.·??로 바꿔야 한다.' },
    { q: 'repo.Find(id)가 User?를 돌려준다. 호출하는 쪽 코드로 가장 알맞은 것은?',
      o: ['var user = repo.Find(id); if (user is null) return NotFound();', 'var user = repo.Find(id)!;', 'var name = repo.Find(id).Name;'], a: 0,
      why: 'User?는 없을 수 있다는 약속이다. is null로 검사하면 그 아래에서 user가 null 아님으로 좁혀진다.' },
    { q: '큰 레거시 프로젝트에서 <Nullable>enable</Nullable>을 켰더니 경고가 쏟아졌다. 어떻게 하는 것이 좋은가?',
      o: ['모든 경고를 ! 로 한 번에 끈다', 'nullable을 다시 끄고 쓰지 않는다', '파일·폴더 단위로 #nullable enable을 늘려 가며 고친다'], a: 2,
      why: '한 번에 켜면 고칠 양이 너무 많다. 범위를 나눠 켜고 고친 다음 경고를 오류로 올리는 순서가 안전하다.' },
  ];

  R.page({ title: 'null이 흐르는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
