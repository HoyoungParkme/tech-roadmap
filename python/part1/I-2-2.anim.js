/* I-2-2 함수 — 인자·반환·기본값 — 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const VIA = { 위치: INFO, 키워드: ACC, 기본값: MUT };

  // 콜 스택: frames 는 아래부터. top 의 등장(s)·퇴장(out) 을 받는다
  function stack(x, y0, frames, o) { o = o || {}; const w = 170, h = 40;
    tx(x, y0 + 26, '콜 스택', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle' });
    el('line', { x1: x - w / 2 - 8, y1: y0, x2: x + w / 2 + 8, y2: y0, stroke: INK, 'stroke-width': 2.5 });
    frames.forEach((f, i) => { const top = i === frames.length - 1, s = top ? (o.s ?? 1) : 1, gone = top ? (o.out ?? 0) : 0; if (s <= 0 || gone >= 1) return;
      const yy = y0 - 6 - h / 2 - i * (h + 4) - gone * 40;
      card(x, yy, w, h, { rx: 6, text: f, fs: 14, mono: true, stroke: top ? ACC : GRID, color: top ? ACC : MUT, fill: top ? ACCBG : PANEL, s, op: 1 - gone }); }); }
  // 프레임 안 지역 이름 칸: rows [[name, value, col]]
  function frame(x, y, title, rows, o) { o = o || {}; const w = o.w || 330, rh = 40, h = 40 + rows.length * rh, op = o.op ?? 1;
    el('rect', { x, y, width: w, height: h, rx: 12, fill: o.fill || SOFT, stroke: o.col || INK, 'stroke-width': 2, opacity: op });
    mono(x + 14, y + 25, title, { 'font-size': 15, 'font-weight': 800, fill: o.col || INK, opacity: op });
    rows.forEach(([n, v, col, s], i) => { const yy = y + 34 + i * rh; mono(x + 18, yy + 23, n, { 'font-size': 15, 'font-weight': 700, opacity: op });
      if ((s ?? 1) > 0) card(x + w - 100, yy + 18, 150, 32, { rx: 6, text: v, fs: 15, mono: true, stroke: col || INK, color: col || INK, s: s ?? 1, op }); });
    return { x, y, w, h, row: (i) => y + 34 + i * rh + 18 }; }
  const chip = (cx, cy, s, o) => { o = o || {}; card(cx, cy, Math.max(40, tw(s, 15) + 20), 34, { rx: 8, text: s, fs: 15, mono: true, stroke: o.col || INK, color: o.col || INK, fill: o.fill, s: o.s, op: o.op }); };
  const legend = (x, y, op) => Object.entries(VIA).forEach(([k, col], i) => { el('rect', { x: x + i * 96, y: y - 11, width: 14, height: 14, rx: 3, fill: col, opacity: op }); tx(x + i * 96 + 20, y + 1, k, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: op }); });

  // =========================================================
  // 1. 위치 · 키워드 · 기본값 — 프레임의 칸에 무엇이 묶이나
  // =========================================================
  const CALLS = [null,
    { call: 'greet("kim")', b: [['"kim"', '위치'], ['"안녕"', '기본값'], ['"!"', '기본값']], out: '안녕, kim!' },
    { call: 'greet("kim", "hello")', b: [['"kim"', '위치'], ['"hello"', '위치'], ['"!"', '기본값']], out: 'hello, kim!' },
    { call: 'greet("kim", punct="?")', b: [['"kim"', '위치'], ['"안녕"', '기본값'], ['"?"', '키워드']], out: '안녕, kim?' },
    { call: 'greet("kim", greeting="hey", punct="~")', b: [['"kim"', '위치'], ['"hey"', '키워드'], ['"~"', '키워드']], out: 'hey, kim~' }];
  function s1(t, c) { const { k, u } = c;
    mono(40, 50, 'def greet(name, greeting="안녕", punct="!"):', { 'font-size': 16, 'font-weight': 700 });
    if (k === 0) { el('rect', { x: 60, y: 90, width: 400, height: 110, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.2) });
      mono(80, 120, 'function greet', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) });
      mono(80, 160, '__defaults__', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) });
      chip(320, 160, '("안녕", "!")', { col: MUT, s: pop(u, 1.0) });
      grow(260, 210, 260, 260, E(u, 1.4, 1.8), MUT);
      card(260, 300, 360, 60, { rx: 12, text: 'def 를 실행하는 순간 한 번 만들어진다', fs: 15, stroke: WARN, color: WARN, s: pop(u, 1.9) });
      stack(820, 380, ['<module>'], {}); legend(560, 110, fade(u, 2.2)); return; }
    const C1 = CALLS[k], P = ['name', 'greeting', 'punct'];
    mono(40, 92, C1.call, { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
    const fr = frame(60, 120, 'greet 프레임', P.map((p, i) => [p, C1.b[i][0], VIA[C1.b[i][1]], pop(u, 0.6 + i * 0.3)]), { op: fade(u, 0.3) * (1 - 0.5 * fade(u, 2.3)) });
    P.forEach((p, i) => mono(410, fr.row(i) + 5, C1.b[i][1], { 'font-size': 14, fill: VIA[C1.b[i][1]], 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.3) }));
    mono(60, 340, '→ ' + C1.out, { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
    stack(820, 380, ['<module>', 'greet'], { s: pop(u, 0.3), out: E(u, 2.2, 2.7) });
    if (k === 2) sub(250, 395, '두 번째 자리가 기본값 "안녕"을 밀어낸다', fade(u, 2.3), { 'font-size': 14 });
    if (k === 3) sub(250, 395, 'greeting 을 건너뛰어 기본값이 남는다', fade(u, 2.3), { 'font-size': 14 });
    if (k === 4) { mono(470, 330, 'greet(greeting="hi", "kim")', { 'font-size': 15, fill: BAD, opacity: fade(u, 2.2) });
      mono(470, 360, 'SyntaxError: positional argument', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.4) }); mono(470, 382, 'follows keyword argument', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.4) }); } }

  // =========================================================
  // 2. *args · **kwargs — 남는 인자가 튜플과 딕셔너리로
  // =========================================================
  function bins(x, y, o) { o = o || {};   // level 칸, args 튜플, kwargs 딕셔너리
    const lv = o.noLevel ? null : [x, y];
    if (lv) { card(x + 70, y + 40, 140, 50, { rx: 8, stroke: INK }); mono(x + 6, y + 6, 'level', { 'font-size': 15, 'font-weight': 700 }); }
    const ax = o.noLevel ? x : x + 170;
    el('rect', { x: ax, y: y + 15, width: o.noLevel ? 270 : 250, height: 50, rx: 25, fill: INFOBG, stroke: INFO, 'stroke-width': 2.2 }); mono(ax + 6, y + 6, 'args (tuple)', { 'font-size': 15, 'font-weight': 700, fill: INFO });
    const kx = ax + (o.noLevel ? 300 : 280); el('rect', { x: kx, y: y + 15, width: 260, height: 90, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 }); mono(kx + 6, y + 6, 'kwargs (dict)', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    return { lv: [x + 70, y + 40], a: (i) => [ax + 50 + i * 80, y + 40], kw: (i) => [kx + 130, y + 40 + i * 36], ax, kx }; }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { mono(40, 60, 'def log(level, *args, **kwargs):', { 'font-size': 18, 'font-weight': 700 });
      const B = bins(60, 130);
      sub(200, 260, '고정 자리', fade(u, 0.6), { 'font-size': 15 }); sub(B.ax + 125, 260, '남는 위치 인자', fade(u, 1.0), { 'font-size': 15, fill: INFO }); sub(B.kx + 130, 260, '남는 키워드 인자', fade(u, 1.4), { 'font-size': 15, fill: ACC });
      sub(480, 340, 'args·kwargs 는 관례 이름이고 문법은 * 와 ** 다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k <= 3) { const warn = k === 3, call = warn ? 'log("WARN")' : 'log("INFO", "user", 42, code=200, ok=True)';
      mono(40, 60, call, { 'font-size': 17, 'font-weight': 800, fill: ACC });
      const B = bins(60, 130); const P = warn ? ['"WARN"'] : ['"INFO"', '"user"', '42'];
      P.forEach((v, i) => { const st = k === 1 ? 0.3 + i * 0.4 : -1, to = i === 0 ? B.lv : B.a(i - 1), from = [80 + i * 100, 78], p = st < 0 ? 1 : E(u, st, st + 0.6);
        chip(lerp(from[0], to[0], p), lerp(from[1], to[1], p), v, { col: i === 0 ? INK : INFO, s: warn ? pop(u, 0.3) : 1 }); });
      if (!warn && k >= 2) [['code', '200'], ['ok', 'True']].forEach(([kk, v], i) => { const st = k === 2 ? 0.3 + i * 0.4 : -1, p = st < 0 ? 1 : E(u, st, st + 0.6), to = B.kw(i);
        chip(lerp(420 + i * 120, to[0], p), lerp(78, to[1], p), `'${kk}': ${v}`, { col: ACC }); });
      if (warn) { mono(B.ax + 125, 180, '()', { 'font-size': 20, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); mono(B.kx + 130, 200, '{}', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        card(480, 320, 380, 54, { rx: 12, text: 'None 이 아니라 빈 튜플 · 빈 딕셔너리', fs: 16, stroke: INFO, color: INFO, s: pop(u, 1.6) }); }
      const out = warn ? "WARN () {}" : k === 2 ? "INFO ('user', 42) {'code': 200, 'ok': True}" : null;
      if (out) mono(60, 395, out, { 'font-size': 16, 'font-weight': 800, opacity: fade(u, warn ? 2.0 : 1.8) });
      if (k === 1) sub(480, 330, '첫 값은 level, 남은 위치 인자 둘은 args 튜플로', fade(u, 1.9), { 'font-size': 15 }); return; }
    // k4, k5: 래퍼
    mono(40, 60, k === 4 ? 'wrapper("INFO", "user", 42, code=200, ok=True)' : 'return fn(*args, **kwargs)', { 'font-size': 17, 'font-weight': 800, fill: ACC });
    const B = bins(60, 110, { noLevel: true });
    const P = ['"INFO"', '"user"', '42'];
    P.forEach((v, i) => { const pa = k === 4 ? E(u, 0.3 + i * 0.3, 0.9 + i * 0.3) : 1, a = B.a(i);
      if (k === 5) { const q = E(u, 0.4 + i * 0.25, 1.0 + i * 0.25); chip(lerp(a[0], 100 + i * 110, q), lerp(a[1], 300, q), v, { col: INFO }); }
      else chip(lerp(80 + i * 100, a[0], pa), lerp(78, a[1], pa), v, { col: INFO }); });
    [['code', '200'], ['ok', 'True']].forEach(([kk, v], i) => { const to = B.kw(i);
      if (k === 5) { const q = E(u, 1.2 + i * 0.25, 1.8 + i * 0.25); chip(lerp(to[0], 450 + i * 130, q), lerp(to[1], 300, q), q > 0.5 ? `${kk}=${v}` : `'${kk}': ${v}`, { col: ACC }); }
      else { const p = E(u, 1.2 + i * 0.3, 1.8 + i * 0.3); chip(lerp(720 + i * 110, to[0], p), lerp(78, to[1], p), `'${kk}': ${v}`, { col: ACC }); } });
    if (k === 4) { sub(480, 300, '고정 자리가 없으니 "INFO" 까지 args 로 들어간다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); stack(820, 390, ['<module>', 'wrapper'], { s: pop(u, 0.2) }); return; }
    mono(60, 345, 'log("INFO", "user", 42, code=200, ok=True)', { 'font-size': 15, opacity: fade(u, 2.0) });
    sub(330, 380, '모은 것을 다시 펼쳐 원본 함수에 그대로 넘긴다', fade(u, 2.2), { 'font-size': 14 });
    stack(820, 390, ['<module>', 'wrapper', 'log'], { s: pop(u, 2.0) }); }

  // =========================================================
  // 3. / 와 * — 시그니처를 구역으로 나눈다
  // =========================================================
  function ruler(k, u) { const P = ['a', 'b', '/', 'c', '*', 'd', 'e'], x0 = 120, w = 90;
    const zoneOf = (p) => (p === 'a' || p === 'b' ? (k >= 1 ? 0 : -1) : p === 'c' ? (k >= 2 ? 1 : -1) : p === 'd' || p === 'e' ? (k >= 2 ? 2 : -1) : -2);
    const Z = [[INFO, INFOBG, '위치 전용'], [GOOD, GOODBG, '위치 · 키워드 둘 다'], [ACC, ACCBG, '키워드 전용']];
    P.forEach((p, i) => { const cx = x0 + i * w, z = zoneOf(p), mk = z === -2;
      if (mk) { mono(cx, 112, p, { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', fill: (p === '/' && k >= 1) || (p === '*' && k >= 2) ? BAD : MUT }); return; }
      const st = z >= 0 ? Z[z] : [INK, PANEL]; const s = (k === 1 && z === 0) || (k === 2 && z >= 1) ? pop(u, 0.3 + (z === 2 ? 0.5 : 0)) : 1;
      card(cx, 104, 70, 54, { rx: 10, text: p, fs: 20, mono: true, stroke: st[0], color: st[0], fill: st[1], s }); });
    [[0, 1, 0], [3, 3, 1], [5, 6, 2]].forEach(([a, b, z]) => { const show = z === 0 ? k >= 1 : k >= 2; if (!show) return; const op = (k === 1 && z === 0) || (k === 2 && z >= 1) ? fade(u, 0.7) : 1;
      el('path', { d: `M${x0 + a * w - 35},142 v10 h${(b - a) * w + 70} v-10`, fill: 'none', stroke: Z[z][0], 'stroke-width': 2.5, opacity: op });
      tx(x0 + (a + b) / 2 * w, 176, Z[z][2], { 'font-size': 15, 'font-weight': 700, fill: Z[z][0], 'text-anchor': 'middle', opacity: op }); });
    return (i) => x0 + i * w; }
  function s3(t, c) { const { k, u } = c;
    mono(40, 50, k === 5 ? 'def connect(host, *, timeout=5, retry=3):' : 'def f(a, b, /, c, *, d, e):', { 'font-size': 17, 'font-weight': 700 });
    if (k === 5) { const x0 = 120; [['host', INFO, 0], ['*', BAD, 1], ['timeout=5', ACC, 2], ['retry=3', ACC, 3]].forEach(([p, col, i]) => {
        if (p === '*') mono(x0 + 140, 112, '*', { 'font-size': 28, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' });
        else card(x0 + [0, 0, 300, 480][i], 104, p.length * 11 + 40, 54, { rx: 10, text: p, fs: 18, mono: true, stroke: col, color: col, fill: col === ACC ? ACCBG : INFOBG }); });
      mono(60, 230, 'connect("db", timeout=10)', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.4) }); if (u > 0.9) check(400, 224, 12, pop(u, 0.9));
      mono(60, 300, 'connect("db", 10, 2)', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.2) }); if (u > 1.6) cross(320, 294, 12, pop(u, 1.6));
      mono(60, 336, 'TypeError: connect() takes 1 positional argument but 3 were given', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.7) });
      sub(480, 395, '숫자 10, 2 가 무엇인지 호출부가 말하게 만든다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const X = ruler(k, u);
    if (k === 0) { sub(480, 260, '다섯 파라미터 사이에 마커 / 와 * 가 끼어 있다', fade(u, 0.8), { 'font-size': 15 }); return; }
    if (k === 1) { mono(60, 250, 'f(a=1, b=2, …)', { 'font-size': 16, fill: BAD, opacity: fade(u, 1.2) }); if (u > 1.6) cross(230, 244, 11, pop(u, 1.6));
      sub(480, 330, '호출부가 이름 a, b 에 기대지 못하게 막는다 · 나중에 이름을 바꿔도 안전', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) { sub(480, 260, 'c 만 위치로도, 이름으로도 넘길 수 있다', fade(u, 1.5), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 3) { [['f(1, 2, 3, d=4, e=5)', 0.3], ['f(1, 2, c=3, d=4, e=5)', 1.1]].forEach(([s, st], i) => { const y = 240 + i * 60;
        mono(60, y, s, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, st) }); if (u > st + 0.4) check(370, y - 6, 12, pop(u, st + 0.4));
        mono(420, y, '→ (1, 2, 3, 4, 5)', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, st + 0.5) }); }); return; }
    [['f(a=1, b=2, c=3, d=4, e=5)', "f() got some positional-only arguments passed as keyword arguments: 'a, b'", 0.3], ['f(1, 2, 3, 4, 5)', 'f() takes 3 positional arguments but 5 were given', 1.2]].forEach(([s, m, st], i) => { const y = 230 + i * 80;
      mono(60, y, s, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, st) }); if (u > st + 0.4) cross(60 + tw(s, 17) + 24, y - 6, 11, pop(u, st + 0.4));
      mono(60, y + 30, 'TypeError: ' + m, { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, st + 0.5) }); }); }

  // =========================================================
  // 4. 가변 기본값 — 모든 호출 프레임이 같은 리스트를 가리킨다
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    const ok = k >= 4, name = ok ? 'add_ok' : 'add';
    mono(40, 50, ok ? 'def add_ok(x, box=None):' : 'def add(x, box=[]):', { 'font-size': 17, 'font-weight': 700 });
    // 함수 객체
    el('rect', { x: 50, y: 80, width: 260, height: 90, rx: 12, fill: PANEL, stroke: ok ? GOOD : INK, 'stroke-width': 2 });
    mono(66, 108, 'function ' + name, { 'font-size': 15, 'font-weight': 800 }); mono(66, 148, '__defaults__', { 'font-size': 15, fill: MUT });
    const dflt = ok ? '(None,)' : null; if (dflt) mono(290, 148, dflt, { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end' });
    if (!ok) { const n = k <= 1 ? 0 : k === 2 ? (u > 1.9 ? 3 : u > 1.2 ? 2 : u > 0.5 ? 1 : 0) : 3, vals = [1, 2, 3].slice(0, n);
      el('circle', { cx: 270, cy: 143, r: 5, fill: INK }); grow(270, 150, 270, 228, k === 0 ? E(u, 0.6, 1.0) : 1, INK);
      el('rect', { x: 150, y: 232, width: 240, height: 64, rx: 10, fill: k >= 2 ? BADBG : SOFT, stroke: k >= 2 ? BAD : INK, 'stroke-width': 2, opacity: k === 0 ? fade(u, 0.3) : 1 });
      mono(160, 226, 'list · 딱 1개', { 'font-size': 14, fill: k >= 2 ? BAD : MUT, opacity: k === 0 ? fade(u, 0.3) : 1 });
      cells(166, 242, vals, { w: 60, h: 44, style: (i) => ({ s: k === 2 ? pop(u, [0.5, 1.2, 1.9][i]) : 1, stroke: BAD }) });
      if (k === 0) { sub(560, 120, '정의 시점: def 를 실행할 때', fade(u, 1.0), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); sub(560, 150, '이때 [] 가 한 번 만들어진다', fade(u, 1.4), { 'font-size': 15 }); stack(820, 390, ['<module>'], {}); return; }
      if (k === 1) { snippet(440, 90, ['box.append(x)   # 새 리스트가 아니다', 'return box      # 같은 객체를 돌려준다'], { op: fade(u, 0.3) }); stack(820, 390, ['<module>'], {});
        sub(560, 330, 'append 는 기본값 리스트를 제자리에서 고친다', fade(u, 1.5), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      if (k === 2) { const call = u > 1.9 ? 3 : u > 1.2 ? 2 : 1, frIn = (u - [0.3, 1.0, 1.7][call - 1]);
        frame(440, 90, `add(${call}) 프레임`, [['x', String(call), INFO], ['box', '→ 공유 리스트', BAD]], { w: 300, op: clamp(frIn * 3) });
        grow(500, 190, 390, 260, clamp(frIn * 3), BAD);
        ['[1]', '[1, 2]', '[1, 2, 3]'].forEach((s, i) => mono(440 + i * 120, 360, s, { 'font-size': 17, 'font-weight': 800, fill: i ? BAD : INK, opacity: fade(u, [0.6, 1.3, 2.0][i]) }));
        stack(870, 300, ['<module>', 'add'], { s: 1, out: 0 }); return; }
      mono(440, 120, 'print(add.__defaults__)', { 'font-size': 17, opacity: fade(u, 0.3) });
      mono(440, 160, '→ ([1, 2, 3],)', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
      sub(600, 330, '누적된 리스트가 함수 객체 안에 들어 있다', fade(u, 1.5), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); return; }
    // ok: None 기본값
    snippet(440, 82, ['if box is None:', '    box = []   # 호출마다 새 리스트'], { op: fade(u, 0.2) });
    if (k === 4) { sub(600, 220, 'None 은 불변이라 공유돼도 안전하다', fade(u, 1.0), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); stack(820, 390, ['<module>'], {}); return; }
    [[1, 0.3], [2, 1.3]].forEach(([v, st], i) => { const y = 200 + i * 100;
      frame(60, y, `add_ok(${v}) 프레임`, [['box', '→ 새 리스트', GOOD]], { w: 260, op: fade(u, st) });
      grow(320, y + 50, 400, y + 50, E(u, st + 0.3, st + 0.6), GOOD);
      el('rect', { x: 410, y: y + 26, width: 90, height: 50, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, st + 0.5) }); mono(455, y + 57, `[${v}]`, { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, st + 0.5) }); });
    sub(700, 340, '호출끼리 상태가 새지 않는다', fade(u, 2.2), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }

  // =========================================================
  // 5. 반환과 일급 객체 — 튜플로 묶고, * 로 펼치고, 함수를 값으로
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { mono(40, 50, 'def stats(nums): return min(nums), max(nums)', { 'font-size': 16, 'font-weight': 700 });
      mono(40, 90, 'stats([3, 1, 9])', { 'font-size': 16, fill: MUT });
      const j = k === 0 ? E(u, 0.8, 1.5) : 1;
      chip(lerp(160, 360, j), 160, '1', { col: INK, s: k === 0 ? pop(u, 0.3) : 1 }); chip(lerp(560, 420, j), 160, '9', { col: INK, s: k === 0 ? pop(u, 0.5) : 1 });
      mono(160, 210, 'min', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: 1 - j }); mono(560, 210, 'max', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: 1 - j });
      if (j > 0.6) { el('rect', { x: 320, y: 132, width: 140, height: 56, rx: 14, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: fade(j, 0.6, 0.4) }); mono(390, 124, 'tuple (1, 9)', { 'font-size': 14, fill: INFO, 'text-anchor': 'middle', 'font-weight': 700 }); }
      if (k === 0) { sub(390, 260, '값 두 개가 아니라 튜플 하나를 돌려준다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      [['lo', 300, 0.3], ['hi', 480, 0.6]].forEach(([n, x, st]) => { card(x, 290, 90, 40, { rx: 8, text: n, fs: 17, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, st) }); grow(x < 400 ? 360 : 420, 188, x, 268, E(u, st + 0.2, st + 0.6), ACC); });
      mono(390, 350, 'lo, hi = stats(…)  →  1 9', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      mono(390, 395, 'a, b, c = … → ValueError: not enough values to unpack', { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 2 || k === 3) { mono(40, 50, 'def f(a, b, c): return a + b + c', { 'font-size': 16, 'font-weight': 700 });
      ['a', 'b', 'c'].forEach((p, i) => card(520 + i * 110, 200, 80, 50, { rx: 10, text: p, fs: 18, mono: true, stroke: INK }));
      if (k === 2) { mono(60, 110, 'nums = [1, 2, 3]', { 'font-size': 16 }); el('rect', { x: 60, y: 175, width: 210, height: 50, rx: 8, fill: SOFT, stroke: INK, 'stroke-width': 2 });
        [1, 2, 3].forEach((v, i) => { const p = E(u, 0.5 + i * 0.3, 1.1 + i * 0.3); chip(lerp(100 + i * 65, 520 + i * 110, p), lerp(200, 150, p), String(v), { col: INFO }); });
        mono(160, 260, 'f(*nums)', { 'font-size': 17, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' });
        mono(520, 300, '= f(1, 2, 3)  →  6', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
        sub(480, 380, '수집(*args)의 반대 방향: 리스트를 위치 인자로 펼친다', fade(u, 2.3), { 'font-size': 14 }); return; }
      mono(60, 110, 'kw = {"a": 1, "b": 2, "c": 3}', { 'font-size': 16 });
      ['a', 'b', 'c'].forEach((n, i) => { const p = E(u, 0.4 + i * 0.3, 1.0 + i * 0.3); chip(lerp(130, 520 + i * 110, p), lerp(170 + i * 40, 150, p), `${n}=${i + 1}`, { col: ACC }); });
      mono(160, 300, 'f(**kw)', { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      mono(520, 300, '= f(a=1, b=2, c=3)  →  6', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      mono(60, 380, "키가 안 맞으면 TypeError: f() got an unexpected keyword argument 'x'", { 'font-size': 14, fill: BAD, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { mono(40, 50, 'op = max   # 괄호 없음: 호출이 아니라 함수 객체', { 'font-size': 16, 'font-weight': 700 });
      card(560, 170, 240, 70, { rx: 12, text: '<built-in function max>', fs: 15, mono: true, stroke: INK });
      [['max', 120, INFO, INFOBG], ['op', 220, ACC, ACCBG]].forEach(([n, y, col, bg], i) => { const s = i ? pop(u, 0.4) : 1;
        card(150, y, 80, 40, { rx: 8, text: n, fs: 17, mono: true, stroke: col, color: col, fill: bg, s }); grow(192, y, 436, 170 + (i ? 12 : -12), i ? E(u, 0.7, 1.2) : 1, col); });
      mono(60, 320, 'op([4, 7, 2])', { 'font-size': 17, opacity: fade(u, 1.4) }); mono(250, 320, '→ 7', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      sub(640, 320, '이름표 둘이 같은 함수 객체를 가리킨다', fade(u, 2.0), { 'font-size': 15 }); return; }
    mono(40, 50, 'sorted(words, key=len)   words = ["bb", "a", "ccc"]', { 'font-size': 16, 'font-weight': 700 });
    card(480, 120, 120, 44, { rx: 22, text: 'len', fs: 17, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) }); mono(480, 90, 'key 로 넘긴 함수', { 'font-size': 14, fill: ACC, 'text-anchor': 'middle' });
    const W = ['"bb"', '"a"', '"ccc"'], L = [2, 1, 3], order = [1, 0, 2];
    W.forEach((w, i) => { chip(160, 200 + i * 55, w, { s: pop(u, 0.3 + i * 0.1) }); mono(260, 206 + i * 55, `len → ${L[i]}`, { 'font-size': 15, fill: ACC, opacity: fade(u, 0.7 + i * 0.25) });
      const r = order.indexOf(i), p = E(u, 1.6, 2.3); chip(lerp(160, 680, p), lerp(200 + i * 55, 200 + r * 55, p), w, { col: p > 0.5 ? ACC : INK, op: fade(u, 1.5) }); });
    mono(680, 385, "['a', 'bb', 'ccc']", { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.3) }); }

  // =========================================================
  // 6. 실무 실패 사례 — 기본값 · kwargs 블랙박스 · 익명 플래그
  // =========================================================
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) { mono(40, 50, 'def push(x, buf=None): if buf is None: buf = [] …', { 'font-size': 16, 'font-weight': 700 });
      [[1, 0.3], [2, 1.0]].forEach(([v, st], i) => { const y = 110 + i * 120, show = k === 1 ? 1 : fade(u, st);
        frame(60, y, `push(${v})`, [['buf', '→ 새 리스트', GOOD]], { w: 240, op: show });
        grow(300, y + 52, 380, y + 52, k === 1 ? 1 : E(u, st + 0.3, st + 0.6), GOOD);
        card(440, y + 52, 90, 46, { rx: 8, text: `[${v}]`, fs: 18, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, op: show }); });
      if (k === 1) { mono(600, 200, 'print(push(1), push(2))', { 'font-size': 16, opacity: fade(u, 0.3) }); mono(600, 240, '→ [1] [2]', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) });
        sub(720, 320, '캐시처럼 일부러 쌓는 게 아니면 기본값에 [] · {} 금지', fade(u, 1.6), { 'font-size': 14 }); }
      else stack(820, 390, ['<module>', 'push'], { s: pop(u, 0.3), out: E(u, 2.2, 2.7) });
      return; }
    if (k === 2) { mono(40, 50, 'def api(**kwargs): host = kwargs["host"]', { 'font-size': 16, 'font-weight': 700 });
      el('rect', { x: 400, y: 110, width: 260, height: 160, rx: 14, fill: INK, opacity: 0.88 }); mono(530, 150, '**kwargs', { 'font-size': 17, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle' });
      tx(530, 180, '무엇을 넣어야 하나?', { 'font-size': 15, fill: PANEL, 'text-anchor': 'middle', opacity: 0.8 });
      mono(60, 140, 'api(hots="db")', { 'font-size': 17, 'font-weight': 700, fill: WARN }); fly(200, 160, 500, 220, seg(u, 0.4, 1.2), "'hots': 'db'", { mono: true, fill: WARN, stay: u < 1.4 });
      mono(60, 190, '호출은 그대로 통과', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      mono(400, 320, "KeyError: 'host'", { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
      sub(530, 360, '오타가 함수 안에서 뒤늦게 터진다 · 자동완성도 안 된다', fade(u, 2.1), { 'font-size': 14 }); return; }
    if (k === 3) { mono(40, 50, 'def api(host, *, port=5432):', { 'font-size': 17, 'font-weight': 700 });
      card(200, 120, 110, 48, { rx: 10, text: 'host', fs: 17, mono: true, stroke: INFO, color: INFO, fill: INFOBG }); mono(290, 128, '*', { 'font-size': 26, 'font-weight': 800, fill: BAD });
      card(400, 120, 150, 48, { rx: 10, text: 'port=5432', fs: 17, mono: true, stroke: ACC, color: ACC, fill: ACCBG });
      mono(60, 220, 'api("db")', { 'font-size': 17, opacity: fade(u, 0.4) }); mono(260, 220, '→ db:5432', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.7) });
      mono(60, 280, 'api(hots="db")', { 'font-size': 17, opacity: fade(u, 1.2) });
      mono(60, 314, "TypeError: api() got an unexpected keyword argument 'hots'", { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.5) });
      sub(480, 380, '같은 오타가 호출하는 순간 바로 걸린다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    mono(40, 50, 'def process(data, *, cache=False, strict=True):', { 'font-size': 17, 'font-weight': 700 });
    mono(60, 130, 'process(data, True, False, 3)', { 'font-size': 17, fill: BAD, opacity: fade(u, 0.2) });
    ['True', 'False', '3'].forEach((s, i) => { const x = 60 + tw('process(data, ', 17) + [0, 60, 135][i]; if (u > 0.5) mono(x + 12, 160, '?', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5 + i * 0.2), 'text-anchor': 'middle' }); });
    mono(60, 200, 'TypeError: process() takes 1 positional argument but 4 were given', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.1) });
    mono(60, 280, 'process([1], cache=True)', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.6) }); mono(360, 280, '→ (True, True)', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
    sub(480, 360, '옵션은 * 뒤에 두어 이름을 붙여야만 넘기게 한다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  const quiz = [
    { q: 'greet("kim", punct="?")를 부르면 greeting에는 무엇이 들어가는가?',
      o: ['"?"', '기본값 "안녕"', '빈 문자열'], a: 1,
      why: 'punct는 이름으로 콕 집었으니 greeting은 건너뛰어 기본값이 남는다. 결과는 "안녕, kim?"이다.' },
    { q: 'log("WARN")처럼 남는 인자 없이 부르면 args와 kwargs는 무엇인가?',
      o: ['빈 튜플 ()과 빈 딕셔너리 {}', '둘 다 None', 'args는 None, kwargs는 {}'], a: 0,
      why: '남는 인자가 없으면 빈 컬렉션이 온다. 그래서 출력이 WARN () {}이다.' },
    { q: 'def f(a, b, /, c, *, d, e)에서 f(1, 2, 3, 4, 5)를 부르면 어떻게 되는가?',
      o: ['(1, 2, 3, 4, 5)를 돌려준다', 'd, e에 None이 들어간다', 'TypeError, d와 e는 키워드로만 넘길 수 있다'], a: 2,
      why: '* 뒤는 키워드 전용이라 위치로 다섯 개를 주면 "takes 3 positional arguments but 5 were given" 오류가 난다.' },
    { q: 'add(1), add(2), add(3) 뒤에 add.__defaults__를 찍으면 무엇이 보이는가?',
      o: ['([],)', '([1, 2, 3],)', '(None,)'], a: 1,
      why: '기본값 리스트는 함수 객체에 하나만 붙어 있고 세 호출이 모두 그 리스트에 append 했다.' },
    { q: 'op = max 다음에 op([4, 7, 2])가 7을 돌려주는 이유는 무엇인가?',
      o: ['op에 max를 호출한 결과가 담겨서', 'op가 max의 복사본 함수라서', 'op와 max가 같은 함수 객체를 가리켜서'], a: 2,
      why: '괄호 없이 쓴 max는 함수 객체 자체다. 함수도 값이라 이름표를 하나 더 붙이고 인자로도 넘길 수 있다.' },
    { q: 'def api(**kwargs)를 def api(host, *, port=5432)로 바꾸면 api(hots="db") 오타는 언제 드러나는가?',
      o: ['호출하는 순간 TypeError로', '함수 안에서 KeyError로', '드러나지 않고 기본값이 쓰인다'], a: 0,
      why: '시그니처에 없는 키워드는 호출 시점에 "unexpected keyword argument" 로 막힌다. **kwargs는 받아 두었다가 안에서 뒤늦게 터진다.' },
  ];

  const summary = [
    '인자는 위치, 키워드, 기본값 순으로 프레임의 칸에 묶인다. 옵션은 이름을 붙여 넘긴다.',
    '*args는 남는 위치 인자를 튜플로, **kwargs는 남는 키워드 인자를 딕셔너리로 모은다.',
    '/ 앞은 위치 전용, * 뒤는 키워드 전용이다. 규칙을 어기면 호출 순간 TypeError가 난다.',
    '기본값은 def 때 한 번 만들어 함수에 붙는다. 가변 기본값 대신 None을 두고 안에서 만든다.',
  ];
  const review = [
    { q: '요청마다 headers=[] 기본값에 헤더를 append 하는 함수가, 배포 후 요청이 쌓일수록 헤더가 중복돼 나갔다. 먼저 의심할 것은?',
      o: ['기본값 리스트가 모든 호출에 공유되어 누적된다', 'HTTP 라이브러리가 헤더를 캐시한다', '키워드 인자 순서가 바뀌었다'], a: 0,
      why: '기본값은 def 시점에 한 번 만들어진다. headers=None으로 두고 함수 안에서 새 리스트를 만들면 호출마다 깨끗해진다.' },
    { q: 'send(msg, True, False, 3)처럼 불리언이 줄지어 넘어가 무엇이 무엇인지 리뷰어가 읽지 못한다. 시그니처를 어떻게 바꾸나?',
      o: ['def send(*args)로 바꿔 개수 제한을 없앤다', '옵션을 * 뒤로 옮겨 키워드 전용으로 만든다', '불리언 대신 0과 1을 넘겨 더 짧게 쓴다'], a: 1,
      why: '* 뒤의 파라미터는 이름을 붙여야만 넘길 수 있어 호출부가 스스로 설명된다. 위치로 넘기면 바로 TypeError가 난다.' },
    { q: '로깅 래퍼 def wrapper(*args, **kwargs)가 원본을 fn(args, kwargs)로 불렀더니 원본이 엉뚱한 값을 받았다. 고칠 곳은?',
      o: ['wrapper의 파라미터를 지운다', 'args를 list(args)로 바꿔 넘긴다', 'fn(*args, **kwargs)로 다시 펼쳐서 넘긴다'], a: 2,
      why: 'fn(args, kwargs)는 튜플과 딕셔너리를 통째로 인자 두 개로 넘긴다. * 와 ** 로 펼쳐야 원본이 자기 파라미터로 다시 모은다.' },
  ];

  R.page({ title: '함수 호출과 프레임', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
