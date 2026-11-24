/* I-1-2 struct + 메서드 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: struct 의 칸(필드)과 값, receiver 자리에 들어가는 복사본/주소, 임베딩된 struct 와 필드 승격, DTO·도메인·생성자 관문.
 * 값은 모두 페이지 코드(struct_basic.go … real_world.go)에 있는 것만 쓴다. 바깥 입력값은 "예시" 로 적는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, card, mono, sub, lbl, pill, banner, grow, fly, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, u) => s.slice(0, Math.round(s.length * clamp(u)));
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 세로 struct 상자: fields [[이름, 값, {col, op, hot}]]
  function sbox(x, y, w, title, fields, o) { o = o || {}; const rh = o.rh || 36, h = 34 + fields.length * rh, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash, opacity: op });
    mono(x + 12, y + 23, title, { 'font-size': 15, 'font-weight': 800, fill: o.tcol || INK, opacity: op });
    fields.forEach(([f, v, fo], i) => { fo = fo || {}; const yy = y + 34 + i * rh, fop = op * (fo.op ?? 1);
      if (fo.hot) el('rect', { x: x + 6, y: yy + 2, width: w - 12, height: rh - 4, rx: 6, fill: fo.hot, opacity: fop });
      el('line', { x1: x, y1: yy, x2: x + w, y2: yy, stroke: GRID, 'stroke-width': 1.2, opacity: op });
      mono(x + 12, yy + rh / 2 + 5, f, { 'font-size': 14.5, 'font-weight': 700, fill: fo.fcol || ACC, opacity: fop });
      if (v != null) mono(x + w - 12, yy + rh / 2 + 5, v, { 'font-size': 14.5, fill: fo.col || INK, 'text-anchor': 'end', opacity: fop, 'font-weight': fo.bold ? 800 : 500 }); });
    return { x, y, w, h }; }
  // 가로 한 줄 struct 칸 (struct_basic 용)
  const W1 = [110, 190, 230], X1 = 120;
  function row(y, name, vals, o) { o = o || {}; let x = X1;
    if (name) mono(o.ptr ? 34 : 40, y + 24, name, { 'font-size': 15, 'font-weight': 800, opacity: o.op ?? 1 });
    vals.forEach((v, i) => { const s = o.s ? o.s(i) : 1, w = W1[i];
      if (s > 0) card(x + w / 2, y + 18, w, 36, { rx: 6, text: v, fs: 14, mono: true, fw: 600, stroke: o.dash ? GRID : (o.hot === i ? WARN : ACC), dash: o.dash ? '5 4' : null, fill: o.hot === i ? WARNBG : PANEL, color: o.dash ? MUT : INK, op: (o.op ?? 1) * clamp(s) });
      x += w + 6; }); }

  // ---------- 1. struct 도시락통 ----------
  function s1(t, c) { const { k, u } = c;
    mono(40, 44, 'type User struct', { 'font-size': 16, 'font-weight': 800 });
    ['ID int', 'Name string', 'Email string'].forEach((s, i) => { const x = X1 + W1.slice(0, i).reduce((a, b) => a + b + 6, 0);
      card(x + W1[i] / 2, 74, W1[i], 34, { rx: 6, text: s, fs: 14, mono: true, stroke: GRID, dash: '5 4', color: MUT, s: k === 0 ? pop(u, 0.3 + i * 0.35) : 1 }); });
    if (k === 0) { note(X1, 140, '칸 3개와 타입만 정했다 — 아직 값은 없다', fade(u, 1.6)); return; }
    const sv = (at) => (i) => (k === 1 ? pop(u, at + i * 0.2, 0.5) : 1);
    row(126, 'u1', ['1', '"Alice"', k >= 2 ? '' : '"a@x.com"'], { s: sv(0.2) });
    row(182, 'u2', ['2', '"Bob"', '"b@x.com"'], { s: sv(0.9) });
    row(250, 'u3', ['3', '"Carol"', '""'], { s: sv(1.5), ptr: true });
    pill(812, 200, '순서만 적으면 필드가 늘 때 깨진다', WARN, k === 1 ? pop(u, 1.3) : 1, { fs: 13.5 });
    grow(76, 268, 116, 268, k === 1 ? E(u, 1.4, 1.7) : 1, ACC); el('circle', { cx: 70, cy: 268, r: 5, fill: ACC });
    pill(780, 268, '& 를 붙이면 포인터', ACC, k === 1 ? pop(u, 2.0) : 1, { fs: 13.5 }); sub(780, 304, 'Email 은 안 줘서 ""', k === 1 ? fade(u, 2.3) : 1, { 'font-size': 13.5 });
    if (k >= 2) { const ex = X1 + 110 + 190 + 12 + 115;
      if (k === 2) { const sw = E(u, 1.2, 1.8);
        mono(ex, 149, sw < 1 ? '"a@x.com"' : '', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: 1 - sw });
        if (sw > 0.2) mono(ex, 149, typed('"alice@new.com"', E(u, 1.6, 2.4)), { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 800 });
        fly(X1 + 110 + 6 + 95, 140, 790, 140, seg(u, 0.2, 1.0), '"Alice"', { mono: true, stay: true });
        mono(700, 120, 'u1.Name', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.2) }); }
      else mono(ex, 149, '"alice@new.com"', { 'font-size': 14, 'text-anchor': 'middle', fill: INK }); }
    if (k === 3) { row(330, 'empty', ['0', '""', '""'], { s: (i) => pop(u, 0.3 + i * 0.25, 0.5), hot: null });
      mono(40, 318, 'var', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.2) });
      banner(480, 396, 'null 없이 zero value 로 채워진다', pop(u, 1.4)); } }

  // ---------- 2. 메서드 ----------
  function mcard(x, y, sig, body, o) { o = o || {}; const s = o.s ?? 1, w = o.w || 380;
    card(x + w / 2, y + 38, w, 76, { rx: 10, stroke: INFO, fill: PANEL, s });
    if (s < 0.6) return;
    el('rect', { x: x + 48, y: y + 8, width: 76, height: 26, rx: 13, fill: INFOBG, stroke: INFO, 'stroke-width': 1.8 });
    mono(x + 12, y + 26, sig, { 'font-size': 14.5, 'font-weight': 700, fill: INK, style: 'white-space:pre' });
    mono(x + 28, y + 58, body, { 'font-size': 14, fill: MUT }); }
  function s2(t, c) { const { k, u } = c;
    sbox(40, 60, 240, 'type User struct', [['Name', 'string'], ['Age', 'int']], { op: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { note(40, 200, 'struct 선언 안에는 데이터만', fade(u, 1.0)); note(40, 228, '함수 자리는 없다', fade(u, 1.4), { fill: MUT, 'font-weight': 500 }); return; }
    const ga = k === 1 ? E(u, 0.8, 1.4) : 1;
    mcard(470, 50, 'func (u User) Greet() string', 'return "Hello, " + u.Name', { s: k === 1 ? pop(u, 0.2) : 1, w: 420 });
    grow(280, 90, 516, 71, ga, INFO, { plain: true }); if (ga > 0.9) mono(400, 74, 'receiver', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle' });
    if (k >= 2) { mcard(470, 150, 'func (u User) IsAdult() bool', 'return u.Age >= 18', { s: k === 2 ? pop(u, 0.2) : 1, w: 420 }); grow(280, 120, 516, 171, k === 2 ? E(u, 0.8, 1.4) : 1, INFO, { plain: true }); }
    const ms = k === 1 ? ['Greet'] : ['Greet', 'IsAdult'];
    tx(40, 208, 'User 의 메서드', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    ms.forEach((m, i) => pill(80 + i * 100, 238, m + '()', INFO, (k === 1 && i === 0) || (k === 2 && i === 1) ? pop(u, 1.6) : 1, { fs: 13.5, mono: true }));
    if (k === 2) note(40, 290, '파일을 나눠 붙여도 같은 패키지면 된다', fade(u, 2.0), { 'font-weight': 500 });
    if (k === 3) { sbox(40, 270, 240, 'alice', [['Name', '"Alice"'], ['Age', '25']], { stroke: ACC, tcol: ACC, op: fade(u, 0.1) });
      fly(160, 300, 556, 71, seg(u, 0.5, 1.1), 'alice 복사', { mono: true });
      fly(160, 300, 556, 171, seg(u, 1.3, 1.9), 'alice 복사', { mono: true });
      pill(820, 260, '"Hello, Alice"', GOOD, pop(u, 1.2), { mono: true, fs: 14.5 }); pill(820, 304, '25 >= 18 → true', GOOD, pop(u, 2.0), { mono: true, fs: 14.5 });
      mono(470, 360, 'alice.Greet() 는 User.Greet(alice) 와 같다', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 2.3) }); }
    if (k === 4) { tx(470, 290, 'receiver 이름은 타입 첫 글자', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['(u User)', 0.4], ['(p *Point)', 0.7], ['(s *Server)', 1.0]].forEach(([s, a], i) => pill(530 + i * 150, 330, s, INK, pop(u, a), { mono: true, fs: 14 }));
      sub(680, 372, 'Point · Server 는 예시 타입', fade(u, 1.4), { 'font-size': 13.5 });
      nope(160, 380, 'this', pop(u, 1.8)); } }
  function nope(x, y, s, sc) { if (sc <= 0) return; const w = tw(s, 14) + 26; card(x, y, w, 30, { rx: 15, text: s, fs: 14, stroke: MUT, color: MUT, s: sc, mono: true });
    el('line', { x1: x - w / 2 + 8, y1: y, x2: x - w / 2 + 8 + (w - 16) * clamp(sc), y2: y, stroke: BAD, 'stroke-width': 2.5 }); }

  // ---------- 3. 값 receiver vs 포인터 receiver ----------
  function cntBox(v, o) { o = o || {}; const b = bump(o.u ?? 0, o.bumpAt ?? 9);
    const g = R.G(170, 200, 1 + b, 1); el('rect', { x: -110, y: -60, width: 220, height: 120, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.6 }, g);
    mono(-96, -34, 'cnt  Counter', { 'font-size': 15, 'font-weight': 800 }, g);
    el('rect', { x: -96, y: -16, width: 192, height: 56, rx: 8, fill: o.hot ? GOODBG : SOFT, stroke: o.hot ? GOOD : GRID, 'stroke-width': 1.8 }, g);
    mono(-84, 18, 'Count', { 'font-size': 15, fill: ACC, 'font-weight': 700 }, g);
    mono(84, 22, String(v), { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'end', fill: o.hot ? GOOD : INK }, g); }
  const MB = { bad: { x: 470, y: 50 }, good: { x: 470, y: 230 } };
  function frame(which, s) { const p = MB[which], bad = which === 'bad';
    card(p.x + 220, p.y + 60, 440, 120, { rx: 10, stroke: bad ? WARN : GOOD, s, sw: 2.2 });
    if (s < 0.6) return;
    mono(p.x + 14, p.y + 26, bad ? 'func (c Counter) IncBad()' : 'func (c *Counter) Inc()', { 'font-size': 15, 'font-weight': 800, fill: bad ? WARN : GOOD });
    tx(p.x + 14, p.y + 108, bad ? 'c = 통째로 복사한 새 값' : 'c = cnt 가 있는 주소', { 'font-size': 14, fill: MUT }); }
  function s3(t, c) { const { k, u } = c;
    // cnt 값: k3 끝까지 0, k4 에서 1
    const v = k >= 4 ? (k === 4 && u < 1.3 ? 0 : 1) : 0;
    if (k <= 4) cntBox(v, { hot: k === 4 && u > 1.3, u, bumpAt: k === 4 ? 1.3 : 9 });
    if (k === 0) { sbox(470, 120, 260, 'type Counter struct', [['Count', 'int']], { op: fade(u, 0.3) }); note(60, 330, '이 숫자가 호출 뒤에 바뀌는지 지켜본다', fade(u, 1.2)); return; }
    if (k >= 1 && k <= 4) frame('bad', k === 1 ? pop(u, 0.2) : 1);
    if (k >= 2 && k <= 4) frame('good', k === 2 ? pop(u, 0.2) : 1);
    if (k === 1) { card(790, 120, 120, 44, { rx: 8, text: 'c.Count++', fs: 14, mono: true, stroke: WARN, dash: '5 4', s: pop(u, 1.0) }); note(60, 330, '안에서 올린 건 복사본뿐', fade(u, 1.6), { fill: WARN }); }
    if (k === 2) { const a = E(u, 0.8, 1.6); el('path', { d: `M470,300 C400,340 310,330 280,262`, fill: 'none', stroke: GOOD, 'stroke-width': 2.6, 'stroke-dasharray': `${a * 500} 500` });
      note(60, 330, '별표 하나 — 본문은 같은 c.Count++', fade(u, 1.8), { fill: GOOD }); }
    if (k === 3) { // 복사본이 1 이 되고 사라진다
      const cp = seg(u, 0.2, 0.9), gone = seg(u, 2.0, 2.5);
      if (cp > 0 && gone < 1) { const x = lerp(170, 790, E(cp, 0, 1)), y = lerp(200, 112, E(cp, 0, 1));
        card(x, y, 140, 50, { rx: 8, stroke: WARN, dash: '5 4', fill: WARNBG, op: 1 - gone });
        mono(x - 58, y + 6, 'c.Count', { 'font-size': 14, fill: WARN, opacity: 1 - gone }); mono(x + 58, y + 7, u > 1.3 ? '1' : '0', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'end', fill: WARN, opacity: 1 - gone }); }
      if (gone > 0.8) cross(790, 112, 14, pop(u, 2.4));
      pill(170, 320, 'Println(cnt.Count) → 0', BAD, pop(u, 2.3), { mono: true, fs: 14.5 }); }
    if (k === 4) { const a = E(u, 0.2, 0.9); el('path', { d: `M470,300 C400,340 310,330 280,262`, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': `${a * 500} 500` });
      mono(390, 352, '&cnt', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) });
      pill(170, 320, 'Println(cnt.Count) → 1', GOOD, pop(u, 1.8), { mono: true, fs: 14.5 });
      mono(470, 396, 'cnt.Inc() 는 (&cnt).Inc() 로 바뀌어 불린다', { 'font-size': 14.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 2.2) }); }
    if (k === 5) { tx(40, 50, '메서드를 부를 때마다 receiver 로 건너가는 것', { 'font-size': 16, 'font-weight': 800 });
      // 큰 struct 값 receiver: 칸 12개가 통째로 복사
      lbl(160, 100, 'func (b Big) …', 1, { class: 'mono', fill: WARN });
      for (let i = 0; i < 12; i++) { const r = Math.floor(i / 4), q = i % 4, f = seg(u, 0.3 + i * 0.08, 0.7 + i * 0.08);
        el('rect', { x: 70 + q * 46, y: 120 + r * 40, width: 40, height: 32, rx: 4, fill: SOFT, stroke: GRID, 'stroke-width': 1.4 });
        if (f > 0) el('rect', { x: lerp(70 + q * 46, 290 + q * 46, E(f, 0, 1)), y: 120 + r * 40, width: 40, height: 32, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.6 }); }
      sub(320, 268, '필드 전부 복사', fade(u, 1.4), { fill: WARN, 'font-weight': 700, 'font-size': 14.5 });
      lbl(690, 100, 'func (b *Big) …', 1, { class: 'mono', fill: GOOD });
      card(620, 160, 60, 40, { rx: 6, text: '●', fs: 15, stroke: GOOD, fill: GOODBG, color: GOOD, s: pop(u, 0.5) }); grow(652, 160, 740, 160, E(u, 0.8, 1.2), GOOD);
      card(800, 160, 110, 70, { rx: 8, text: 'Big', fs: 15, stroke: INK });
      sub(690, 268, '주소 하나 (64비트면 8바이트)', fade(u, 1.4), { fill: GOOD, 'font-weight': 700, 'font-size': 14.5 });
      [['고쳐야 한다 → *T', GOOD], ['struct 가 크다 → *T', GOOD], ['필드 2~3개 작은 값 → T', INFO]].forEach(([s, col], i) => pill(170 + i * 300, 330, s, col, pop(u, 1.7 + i * 0.2), { fs: 14 }));
      sub(480, 384, '한 타입의 메서드는 한 종류로 맞춘다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); } }

  // ---------- 4. 임베딩 ----------
  const DOG = { x: 40, y: 60, w: 470, h: 300 }, AN = { x: 70, y: 110, w: 300, h: 150 };
  function animal(x, y, name, o) { o = o || {};
    el('rect', { x, y, width: AN.w, height: AN.h, rx: 10, fill: o.fill || ACCBG, stroke: o.hot ? INFO : ACC, 'stroke-width': o.hot ? 3 : 2, opacity: o.op ?? 1 });
    mono(x + 12, y + 24, o.title || 'Animal', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: o.op ?? 1 });
    el('rect', { x: x + 12, y: y + 40, width: AN.w - 24, height: 40, rx: 6, fill: o.nameHot ? INFOBG : PANEL, stroke: o.nameHot ? INFO : GRID, 'stroke-width': 1.8, opacity: o.op ?? 1 });
    mono(x + 24, y + 66, 'Name', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: o.op ?? 1 }); if (name) mono(x + AN.w - 24, y + 66, name, { 'font-size': 14.5, 'text-anchor': 'end', opacity: o.op ?? 1 });
    card(x + 92, y + 116, 160, 34, { rx: 17, text: 'Speak()', fs: 14.5, mono: true, stroke: o.speakHot ? INFO : ACC, fill: o.speakHot ? INFOBG : PANEL, color: o.speakHot ? INFO : ACC, op: o.op ?? 1 }); }
  function dog(name, breed, o) { o = o || {}; const op = o.op ?? 1;
    el('rect', { x: DOG.x, y: DOG.y, width: DOG.w, height: DOG.h, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.4, opacity: op });
    mono(DOG.x + 14, DOG.y + 28, 'd  Dog', { 'font-size': 16, 'font-weight': 800, opacity: op });
    animal(AN.x, AN.y, name, { title: 'Animal  (필드 이름 없음)', op, nameHot: o.nameHot, speakHot: o.speakHot });
    el('rect', { x: AN.x, y: 290, width: AN.w, height: 40, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.8, opacity: op });
    mono(AN.x + 12, 316, 'Breed', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: op }); if (breed) mono(AN.x + AN.w - 12, 316, breed, { 'font-size': 14.5, 'text-anchor': 'end', opacity: op });
    if (o.dogSpeak) card(440, 130, 120, 34, { rx: 17, text: 'Speak()', fs: 14.5, mono: true, stroke: INFO, fill: INFOBG, color: INFO, s: o.dogSpeak }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { animal(AN.x, AN.y, null, { op: fade(u, 0.2) }); note(420, 150, 'Name 필드와 Speak() 하나', fade(u, 1.0)); note(420, 180, 'abstract 도 base 도 아닌 평범한 struct', fade(u, 1.5), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 1) { const f = E(u, 0.4, 1.4);
      el('rect', { x: DOG.x, y: DOG.y, width: DOG.w, height: DOG.h, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2.4, opacity: fade(u, 0.1) });
      mono(DOG.x + 14, DOG.y + 28, 'type Dog struct', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      animal(lerp(560, AN.x, f), lerp(180, AN.y, f), null, {});
      el('rect', { x: AN.x, y: 290, width: AN.w, height: 40, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.8, opacity: fade(u, 1.6) });
      mono(AN.x + 12, 316, 'Breed string', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) });
      note(560, 360, 'extends 없이 이름 없는 필드 한 줄', fade(u, 2.0)); return; }
    const vals = k === 2 ? [u > 0.8 ? '"Rex"' : '', u > 1.4 ? '"Mix"' : ''] : ['"Rex"', '"Mix"'];
    dog(vals[0], vals[1], { nameHot: k === 3 && u > 1.2, speakHot: (k === 4 && u > 1.0) || (k === 5 && u > 2.0), dogSpeak: k === 5 ? pop(u, 0.3) : 0 });
    if (k === 2) { mono(560, 110, 'd := Dog{', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.2) });
      mono(580, 140, typed('Animal: Animal{Name: "Rex"},', E(u, 0.3, 1.0)), { 'font-size': 14.5, fill: ACC });
      mono(580, 170, typed('Breed:  "Mix",', E(u, 1.1, 1.5)), { 'font-size': 14.5, fill: ACC });
      mono(560, 200, u > 1.5 ? '}' : '', { 'font-size': 15, 'font-weight': 700 });
      note(560, 260, '만들 때는 안쪽 통을 타입 이름으로 채운다', fade(u, 1.8)); return; }
    if (k === 3) { pill(700, 100, 'd.Name', INFO, pop(u, 0.2), { mono: true, fs: 16 });
      note(560, 160, '1단계: Dog 자기 필드 — Animal, Breed', fade(u, 0.5), { 'font-weight': 500 }); cross(940, 154, 9, pop(u, 0.8));
      note(560, 196, '2단계: 안쪽 Animal.Name', fade(u, 1.1), { 'font-weight': 500 }); check(940, 190, 9, pop(u, 1.3));
      grow(600, 112, AN.x + AN.w, 170, E(u, 1.2, 1.6), INFO);
      pill(700, 260, '"Rex"', GOOD, pop(u, 1.8), { mono: true, fs: 16 });
      sub(700, 310, 'd.Animal.Name 도 그대로 된다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 4) { pill(720, 100, 'd.Speak()', INFO, pop(u, 0.2), { mono: true, fs: 16 });
      grow(650, 112, AN.x + 172, AN.y + 110, E(u, 0.5, 1.0), INFO);
      pill(720, 180, '"Rex makes a sound"', GOOD, pop(u, 1.2), { mono: true, fs: 15 });
      mono(560, 260, 'var a Animal = d', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); cross(780, 255, 10, pop(u, 1.9));
      sub(720, 292, '컴파일 오류 — Dog 는 Animal 을 가질 뿐이다', fade(u, 2.1), { fill: BAD, 'font-weight': 700, 'font-size': 14 }); return; }
    // k 5: 바깥 Speak 가 이긴다
    note(590, 110, '바깥(Dog)에 같은 이름 → 바깥이 먼저', fade(u, 0.8), { fill: INFO });
    pill(720, 200, 'd.Speak() → "Rex barks!"', INFO, pop(u, 1.3), { mono: true, fs: 14.5 });
    pill(720, 262, 'd.Animal.Speak() → "Rex makes a sound"', ACC, pop(u, 2.0), { mono: true, fs: 13.5 });
    sub(720, 330, '상속 트리가 아니라 상자 안의 상자', fade(u, 2.4), { 'font-size': 14.5 }); }

  // ---------- 5. DTO · Domain · 생성자 ----------
  function gate(x, y, label, s) { card(x, y, 150, 56, { rx: 10, text: label, fs: 14.5, stroke: WARN, fill: WARNBG, color: INK, s }); }
  function domain(x, y, email, o) { o = o || {};
    return sbox(x, y, 280, o.title || 'User (도메인)', [['ID', o.id ?? '0'], ['Name', o.name ?? '"Alice"'], ['Email', email, { hot: o.hot ? GOODBG : null, col: o.hot ? GOOD : INK, bold: o.hot }]], { stroke: ACC, tcol: ACC, op: o.op }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { // JSON ↔ DTO
      const J = [['"id"', '1'], ['"name"', '"Alice"'], ['"email"', '"a@x.com"']];
      card(150, 170, 230, 170, { rx: 10, fill: SOFT, stroke: GRID, sw: 1.5 }); mono(48, 104, 'JSON (API)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      J.forEach(([kk, v], i) => mono(56, 140 + i * 36, `${kk}: ${v}`, { 'font-size': 14.5, opacity: k === 0 ? fade(u, 0.2 + i * 0.2) : 1 }));
      const D = [['ID', 'json:"id"'], ['Name', 'json:"name"'], ['Email', 'json:"email"']];
      sbox(330, 86, 250, 'UserDTO', D.map(([f, tg]) => [f, tg, { col: INFO }]), { stroke: INFO, tcol: INFO, op: k === 0 ? fade(u, 0.6) : 1 });
      D.forEach((_, i) => grow(240, 136 + i * 36, 336, 138 + i * 36, k === 0 ? E(u, 1.0 + i * 0.3, 1.4 + i * 0.3) : 1, INFO, { plain: true }));
      if (k === 0) { note(330, 260, '백틱 안 태그가 JSON 키와 필드를 잇는다', fade(u, 2.0)); return; }
      el('line', { x1: 610, y1: 40, x2: 610, y2: 400, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 0.2) });
      tx(600, 396, 'API 경계', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 700, opacity: fade(u, 0.3) });
      domain(640, 86, '"a@x.com"', { id: '1', op: fade(u, 0.6) });
      grow(584, 160, 636, 160, E(u, 1.0, 1.4), ACC);
      note(640, 270, '태그 없는 순수 데이터', fade(u, 1.6)); note(640, 300, 'API 모양이 바뀌어도 그대로', fade(u, 2.0), { fill: MUT, 'font-weight': 500 }); return; }
    if (k === 2) { const ok = u > 1.5;
      domain(40, 120, ok ? '"alice@new.com"' : '"a@x.com"', { hot: ok && u > 2.1 });
      mono(40, 96, 'u *User', { 'font-size': 14, fill: MUT, opacity: 1 });
      gate(600, 120, '"@" 가 있나?', pop(u, 0.2)); mono(525, 80, 'ChangeEmail', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      fly(880, 60, 640, 100, seg(u, 0.3, 0.8), 'alice.x.com', { mono: true, fill: MUT });
      if (u > 0.8) pill(790, 190, 'invalid email: alice.x.com', BAD, pop(u, 0.8), { mono: true, fs: 13.5 });
      fly(880, 60, 640, 100, seg(u, 1.1, 1.6), 'alice@new.com', { mono: true });
      grow(524, 140, 340, 205, E(u, 1.6, 2.1), GOOD);
      sub(780, 260, '입력값은 예시 · 통과한 값만 원본에 들어간다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 3) { gate(330, 150, 'name == "" ?', pop(u, 0.2)); mono(255, 106, 'NewUser(name, email)', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      fly(90, 80, 290, 140, seg(u, 0.3, 0.8), 'name = ""', { mono: true, fill: MUT });
      if (u > 0.8) pill(330, 236, 'nil, "name is required"', BAD, pop(u, 0.8), { mono: true, fs: 13.5 });
      fly(90, 200, 290, 160, seg(u, 1.1, 1.6), '"Alice", "a@x.com"', { mono: true });
      grow(406, 150, 600, 150, E(u, 1.6, 1.9), GOOD);
      domain(620, 90, '"a@x.com"', { title: '&User', op: fade(u, 1.8) });
      sub(760, 260, 'ID 는 안 줘서 0', fade(u, 2.2), { 'font-size': 14 });
      note(40, 340, '생성 경로를 New* 하나로 좁히면 덜 채워진 User 가 안 돌아다닌다', fade(u, 2.4), { 'font-size': 14.5 }); return; }
    // k 4: 호출 측 세 줄
    const L = [['u, err := NewUser("Alice", "a@x.com")', 0.2], ['if err != nil { return err }', 0.8], ['u.ChangeEmail("alice@new.com")', 1.4]];
    L.forEach(([s, a], i) => { mono(40, 90 + i * 50, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a) }); });
    check(520, 135, 9, pop(u, 1.0)); mono(536, 140, 'err == nil', { 'font-size': 14, fill: GOOD, opacity: fade(u, 1.0) });
    domain(640, 60, u > 1.9 ? '"alice@new.com"' : '"a@x.com"', { hot: u > 1.9 });
    grow(330, 185, 636, 170, E(u, 1.5, 1.9), GOOD);
    [['DTO', INFO], ['도메인 + 규칙', ACC], ['New* 생성자', WARN]].forEach(([s, col], i) => pill(180 + i * 220, 300, s, col, pop(u, 2.1 + i * 0.12), { fs: 15 }));
    sub(400, 350, '세 조각이 실무 코드의 뼈대', fade(u, 2.5), { 'font-size': 15 }); }

  const quiz = [
    { q: 'u3 := &User{ID: 3, Name: "Carol"}을 만든 뒤 u3.Email의 값은 무엇인가?',
      o: ['nil', '빈 문자열 ""', '컴파일 오류'], a: 1,
      why: '적지 않은 필드는 타입의 zero value로 채워진다. string의 zero value는 ""이다.' },
    { q: 'func (u User) Greet()에서 (u User)는 무엇인가?',
      o: ['이 함수를 User의 메서드로 붙이는 receiver', 'Greet의 반환 타입', 'User를 상속한다는 표시'], a: 0,
      why: 'receiver는 이 함수가 어느 타입에 붙는지 정한다. alice.Greet()를 부르면 alice가 u 자리에 들어간다.' },
    { q: 'cnt.IncBad()를 부른 뒤 cnt.Count가 0 그대로인 이유는 무엇인가?',
      o: ['IncBad가 Count를 다시 0으로 돌려서', 'cnt.Count가 상수라서', '값 receiver라 복사본의 Count만 올라가서'], a: 2,
      why: '(c Counter)는 cnt를 통째로 복사해 받는다. 포인터 receiver Inc()를 부르면 원본이 1이 된다.' },
    { q: 'Dog에 Speak를 따로 만들지 않았는데 d.Speak()가 되는 이유는 무엇인가?',
      o: ['Dog가 Animal을 상속해서', '임베딩한 Animal의 메서드가 Dog로 승격돼서', '컴파일러가 Speak를 새로 만들어 줘서'], a: 1,
      why: '필드 이름 없이 넣은 Animal의 필드와 메서드는 한 단계 올라와 d.Name, d.Speak()로 쓸 수 있다. Dog가 Animal 타입이 되는 것은 아니다.' },
    { q: 'NewUser("", "a@x.com")을 부르면 무엇이 돌아오나?',
      o: ['nil과 "name is required" 에러', 'Name이 빈 User 포인터와 nil', 'panic'], a: 0,
      why: 'NewUser는 이름이 비면 User를 만들지 않고 error를 돌려준다. 생성 규칙이 이 함수 한 곳에 모인다.' },
  ];

  const summary = [
    'struct는 필드만 묶은 타입이다. 값을 주지 않은 칸은 0이나 "" 같은 zero value가 된다.',
    '메서드는 func (u User)처럼 receiver를 적어 struct 밖에서 붙인다.',
    '값 receiver는 복사본을 고친다. 원본을 바꾸거나 struct가 크면 *T를 쓴다.',
    '임베딩하면 안쪽 struct의 필드와 메서드가 승격되고, 같은 이름이 있으면 바깥이 먼저다.',
  ];
  const review = [
    { q: 'SetName 메서드를 불렀는데 이름이 안 바뀐다는 버그 보고가 왔다. 먼저 확인할 것은?',
      o: ['struct 필드 이름이 대문자인지', 'SetName의 receiver가 값 receiver인지', 'fmt.Println 형식 문자열'], a: 1,
      why: '값 receiver는 복사본을 받아 고치므로 원본이 그대로다. receiver에 *를 붙이면 원본이 바뀐다.' },
    { q: 'Dog에 Animal을 임베딩했다. func feed(a Animal)에 d를 넘기려면 어떻게 해야 하나?',
      o: ['feed(d.Animal)로 안쪽 값을 넘긴다', 'feed(d)로 그대로 넘긴다', 'Dog에 implements Animal을 적는다'], a: 0,
      why: '임베딩은 상속이 아니어서 Dog는 Animal 타입이 아니다. 안쪽 필드 d.Animal을 꺼내 넘긴다.' },
    { q: 'API 응답 JSON 키가 email에서 mail로 바뀌었다. 가장 적게 고치는 곳은?',
      o: ['도메인 User의 모든 메서드', 'NewUser 생성자', 'UserDTO의 json 태그'], a: 2,
      why: 'DTO가 바깥 모양을 맡고 도메인 User는 태그가 없다. 태그 한 줄만 바꾸면 도메인 코드는 그대로다.' },
  ];

  R.page({ title: 'struct + 메서드', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
