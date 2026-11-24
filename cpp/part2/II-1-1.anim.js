/* II-1-1 복사·이동 시맨틱 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 스택 칸(변수) · 힙 칸(버퍼) · 포인터 화살표로 그린다. 출력 줄과 바이트 수는 페이지 코드를 zig c++(libc++)로 돌려 확인한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, fly, zone, cells, cross, check, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공용 그림 ----------
  // 곡선 화살표를 u(0→1)만큼 그린다
  function arrow(x1, y1, x2, y2, u, col, o) { if (u <= 0) return; o = o || {}; const mx = (x1 + x2) / 2;
    el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, fill: 'none', stroke: col || INK, 'stroke-width': o.sw || 2.4, pathLength: 100,
      'stroke-dasharray': u < 1 ? `${u * 100} 100` : o.dash, opacity: o.op ?? 1, 'marker-end': u >= 1 ? (col === ACC ? 'url(#ra-ahb)' : col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)') : null }); }
  const SW = 230, SH = 44;
  // 스택 변수 칸: 왼쪽 위 (x, y). o.val 글자, o.ptr 이면 오른쪽에 포인터 점, o.empty 면 점선
  function slot(x, y, name, o) { o = o || {}; const g = R.G(x + SW / 2, y + SH / 2, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -SW / 2, y: -SH / 2, width: SW, height: SH, rx: 8, fill: o.empty ? SOFT : PANEL, stroke: o.stroke || (o.empty ? OFF : INK), 'stroke-width': 2, 'stroke-dasharray': o.empty ? '5 4' : null }, g);
    tx(-SW / 2 + 14, 6, name, { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: o.empty ? MUT : INK }, g);
    if (o.type) tx(-SW / 2 + 14 + tw(name, 16) + 10, 5, o.type, { 'font-size': 13.5, fill: MUT, class: 'mono' }, g);
    if (o.val) tx(SW / 2 - (o.ptr ? 34 : 14), 6, o.val, { 'font-size': 14, 'font-weight': 700, class: 'mono', 'text-anchor': 'end', fill: o.valCol || MUT }, g);
    if (o.ptr) el('circle', { cx: SW / 2 - 18, cy: 0, r: 6, fill: o.ptrCol || ACC }, g); }
  const out = (x, y) => [x + SW - 18, y + SH / 2];
  // 힙 버퍼: 글자 칸 한 줄. n 칸까지 채움
  function buf(x, y, chars, o) { o = o || {}; const n = o.n ?? chars.length;
    cells(x, y, chars.map((ch, i) => (i < n ? ch : '')), { w: 36, h: 38, gap: 4, fs: 16, style: (i) => (o.style && o.style(i)) || { stroke: o.stroke || (i < n ? INK : GRID), fill: o.fill, s: o.s, op: o.op, dash: o.dash } }); }
  const bufIn = (x, y) => [x - 4, y + 19];
  const frameZones = (o) => { o = o || {};
    zone(24, 34, 296, o.h || 262, o.st || '스택 · main()', { fill: SOFT });
    zone(344, 34, 592, o.h || 262, o.ht || '힙', { fill: SOFT }); };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 1. 복사: 버퍼가 한 벌 더 생긴다 ----------
  const RY = [70, 146, 222], BX = 470;
  function s1(t, c) { const { k, u } = c, H = [...'Hello'], Jl = [...'Jello'];
    frameZones();
    slot(44, RY[0], 'a', { type: 'string', ptr: true, s: k === 0 ? pop(u, 0.2) : 1 });
    buf(BX, RY[0] + 3, H, { n: k === 0 ? Math.floor(clamp((u - 0.5) / 0.9) * 5.99) : 5 });
    arrow(...out(44, RY[0]), ...bufIn(BX, RY[0] + 3), k === 0 ? E(u, 1.5, 2.1) : 1, ACC);
    if (k === 0) { tx(BX + 220, RY[0] + 28, 'a의 버퍼', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) });
      sub(40, 330, '"Hello" 처럼 짧은 문자열은 SSO로 객체 안에 담긴다', fade(u, 2.2), { 'text-anchor': 'start' });
      sub(40, 352, '그림은 SSO 한도를 넘는 긴 문자열일 때의 모습이다', fade(u, 2.3), { 'text-anchor': 'start' }); }
    if (k >= 1) { const fl = k === 1, bs = (i) => (fl ? clamp((u - 0.9 - i * 0.18) / 0.45) : 1);
      slot(44, RY[1], 'b', { type: 'string', ptr: true, s: fl ? pop(u, 0.2) : 1 });
      const bc = k >= 2 ? Jl : H;
      buf(BX, RY[1] + 3, bc.map((ch, i) => (bs(i) >= 1 ? ch : '')), { style: (i) => {
        const filled = !fl || bs(i) >= 1, hot = k === 2 && i === 0;
        return { stroke: hot ? ACC : filled ? INK : GRID, fill: hot ? ACCBG : undefined, color: hot ? ACC : undefined, s: fl ? pop(u, 0.3, 0.4) : hot ? 1 + bump(u, 0.4) : 1, op: 1 }; } });
      if (fl) { H.forEach((ch, i) => { const p = bs(i); if (p > 0 && p < 1) fly(BX + 18 + i * 40, RY[0] + 54, BX + 18 + i * 40, RY[1] + 22, p, ch, { mono: true, fill: WARN }); });
        pill(BX + 330, RY[1] + 22, 'new + memcpy', WARN, pop(u, 0.5), { mono: true }); }
      arrow(...out(44, RY[1]), ...bufIn(BX, RY[1] + 3), fl ? E(u, 2.0, 2.5) : 1, ACC); }
    if (k === 2) { mono(BX + 220, RY[1] + 28, "b[0] = 'J'", { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.5) });
      check(BX + 236, RY[0] + 22, 9, pop(u, 1.4)); tx(BX + 254, RY[0] + 28, 'a는 그대로', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.5) }); }
    if (k >= 3) { const fl = k === 3, bs = (i) => (fl ? clamp((u - 1.0 - i * 0.16) / 0.45) : 1);
      slot(44, RY[2], 'c', { type: 'string', ptr: true, s: fl ? pop(u, 0.2) : 1 });
      if (fl && u < 1.2) { card(BX + 40, RY[2] + 22, 90, 38, { rx: 6, text: '(빈)', fs: 14, stroke: OFF, color: MUT, dash: '4 4', op: 1 - fade(u, 0.8) }); cross(BX + 40, RY[2] + 22, 12, pop(u, 0.5)); }
      if (!fl || u >= 1.0) { buf(BX, RY[2] + 3, H.map((ch, i) => (bs(i) > 0.5 ? ch : '')), { style: (i) => ({ stroke: bs(i) >= 1 ? INK : bs(i) > 0 ? WARN : GRID, fill: bs(i) > 0 && bs(i) < 1 ? WARNBG : undefined, op: 1 }) });
        if (fl) el('path', { d: `M${BX - 14},${RY[0] + 30} C${BX - 70},${RY[0] + 90} ${BX - 70},${RY[2] + 0} ${BX - 14},${RY[2] + 14}`, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 0.9) }); }
      if (fl) tx(BX + 220, RY[2] + 28, '기존 내용 버리고 다시 복제', { 'font-size': 14, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.6) });
      arrow(...out(44, RY[2]), ...bufIn(BX, RY[2] + 3), fl ? E(u, 2.0, 2.5) : 1, ACC); }
    // 아래: 버퍼 수와 출력
    const nb = k === 0 ? 1 : k < 3 ? 2 : 3;
    if (k >= 1) { mono(40, 334, `힙 버퍼 ${nb}벌`, { 'font-size': 20, 'font-weight': 800, fill: nb >= 3 ? WARN : INK });
      mono(40, 362, `복사한 글자 ${k === 1 ? Math.round(5 * E(u, 0.9, 2.0)) : k < 3 ? 5 : k === 3 ? 5 + Math.round(5 * E(u, 1.0, 2.0)) : 10}개`, { 'font-size': 15, fill: MUT }); }
    const outL = k >= 3 ? ['Hello', 'Jello', 'Hello'] : k >= 2 ? ['Hello', 'Jello'] : [];
    if (outL.length) terminal(610, 306, 326, 108, outL, k === 2 ? E(u, 1.6, 2.5) * 2 : k === 3 ? 2 + E(u, 2.2, 2.7) : 3, { title: '출력' });
    if (k === 4) banner(330, 396, '사본이 필요할 때만 치를 값이다', pop(u, 0.5)); }

  // ---------- 2. 이동: 버퍼는 제자리, 포인터만 넘어간다 ----------
  const MY = { a: 64, buf: 148, b: 232 };
  function s2(t, c) { const { k, u } = c, H = [...'Hello'], W = [...'World'];
    frameZones();
    if (k === 0) { slot(44, MY.a, 'a', { empty: true, val: '아직 없음', s: 1 }); slot(44, MY.b, 'b', { empty: true, val: '아직 없음', s: 1 });
      pill(640, 120, '#include <utility>', INFO, pop(u, 0.3), { mono: true, fs: 15 });
      mono(640, 180, 'std::move(x)', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(640, 212, '옮기는 함수가 아니라 "옮겨도 된다"는 표식', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.5) });
      return; }
    const moved = k >= 2, mv = k === 2;
    // a 칸
    const aState = k === 4 ? { type: 'string', ptr: true } : moved ? { type: 'string', val: 'nullptr', valCol: BAD, empty: true } : { type: 'string', ptr: true };
    if (mv && u < 1.8) slot(44, MY.a, 'a', { type: 'string', ptr: true, s: 1 }); else slot(44, MY.a, 'a', Object.assign({ s: k === 1 ? pop(u, 0.2) : 1 }, aState));
    if (mv && u >= 1.8) tx(44 + SW / 2, MY.a + 66, '빈 상태 (size 0)', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.8) });
    if (moved) slot(44, MY.b, 'b', { type: 'string', ptr: true, s: mv ? pop(u, 0.2) : 1 });
    // 버퍼: 처음부터 끝까지 한 자리
    buf(BX, MY.buf, H, { n: k === 1 ? Math.floor(clamp((u - 0.5) / 0.9) * 5.99) : 5 });
    tx(BX + 220, MY.buf + 26, k >= 2 ? '버퍼는 제자리' : '', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: mv ? fade(u, 2.1) : 1 });
    // 화살표: 이동 중에는 출발점이 a 에서 b 로 옮겨 간다
    const [ax, ay] = out(44, MY.a), [bx, by] = out(44, MY.b), [hx, hy] = bufIn(BX, MY.buf);
    if (!moved) arrow(ax, ay, hx, hy, k === 1 ? E(u, 1.5, 2.1) : 1, ACC);
    else { const f = mv ? E(u, 1.0, 1.9) : 1; arrow(lerp(ax, bx, f), lerp(ay, by, f), hx, hy, 1, ACC); }
    if (mv) { [['ptr', 0.4], ['size 5', 0.6], ['cap', 0.8]].forEach(([s, d], i) => fly(150 + i * 60, MY.a + 22, 150 + i * 60, MY.b + 22, seg(u, d, d + 0.8), s, { mono: true, fill: ACC }));
      note(40, 334, '옮긴 것: 포인터 · 길이 · 용량', fade(u, 1.9), { fill: ACC }); note(40, 360, '복사한 글자 0개', fade(u, 2.2)); }
    if (k === 3) { pill(44 + SW / 2, MY.a + 62, 'a의 값 읽기 금지', BAD, pop(u, 1.6), { fs: 13.5, fill: PANEL }); }
    if (k === 4) { const fl = k === 4;
      buf(BX, MY.a + 3, W, { n: fl ? Math.floor(clamp((u - 0.4) / 0.9) * 5.99) : 5 });
      arrow(...out(44, MY.a), ...bufIn(BX, MY.a + 3), fl ? E(u, 1.4, 2.0) : 1, ACC);
      if (fl) tx(BX + 220, MY.a + 28, 'a에 새 버퍼', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }
    const outL = ['Hello', '0', 'World'], shown = k === 3 ? E(u, 0.3, 1.4) * 2 : k === 4 ? 2 + E(u, 2.0, 2.6) : k >= 5 ? 2 : 0;
    if (k >= 3) terminal(610, 306, 326, 108, outL, shown, { title: '출력' });
    if (k === 5) { card(330, 345, 300, 70, { rx: 10, stroke: WARN, sw: 2, text: '이동 생성자가 없는 클래스는\n여기서 조용히 복사로 대체된다', fs: 14.5, s: pop(u, 0.9) }); } }

  // ---------- 3. 값 범주가 오버로드를 고른다 ----------
  const JX = 360, JY = 210, TOP = 120, BOT = 300;
  const TAG = { lvalue: WARN, rvalue: GOOD, xvalue: INFO };
  function token(x, y, text, kind, s) { if (s <= 0) return; pill(x, y, text, INK, s, { mono: true, fs: 15, fill: PANEL });
    pill(x, y - 30, kind, TAG[kind], s, { fs: 13.5, fill: PANEL }); }
  // 길을 따라 가는 위치: 0~0.5 입력선, 0.5~1 갈래길
  function route(f, lane) { const ly = lane === 'top' ? TOP : BOT;
    if (f < 0.5) return [lerp(70, JX, f / 0.5), JY]; const g = (f - 0.5) / 0.5; return [lerp(JX, 630, g), lerp(JY, ly, E(g, 0, 0.6))]; }
  function lanes(u0) {
    el('line', { x1: 60, y1: JY, x2: lerp(60, JX, u0), y2: JY, stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round' });
    [TOP, BOT].forEach((ly) => el('path', { d: `M${JX},${JY} C${JX + 90},${JY} ${JX + 60},${ly} ${JX + 160},${ly} L700,${ly}`, fill: 'none', stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': `${clamp(u0 * 1.4 - 0.4) * 100} 100` })); }
  function ends(s, hot) {
    card(812, TOP, 220, 64, { rx: 10, text: 'const string& s\n복사경로 (lvalue)', fs: 14.5, mono: true, stroke: hot === 'top' ? WARN : INK, sw: hot === 'top' ? 3 : 2, s });
    card(812, BOT, 220, 64, { rx: 10, text: 'string&& s\n이동경로 (rvalue)', fs: 14.5, mono: true, stroke: hot === 'bot' ? GOOD : INK, sw: hot === 'bot' ? 3 : 2, s }); }
  function s3(t, c) { const { k, u } = c;
    lanes(k === 0 ? E(u, 0.2, 1.4) : 1); if (k <= 1) ends(k === 0 ? pop(u, 1.2) : 1, null);
    if (k === 0) { tx(700, TOP - 44, 'take() 오버로드 두 개', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.8) }); return; }
    const outL = ['복사경로(lvalue)', '이동경로(rvalue)', '이동경로(rvalue)'];
    if (k === 1) { card(190, 96, 260, 76, { rx: 10, text: 'makeStr()\nreturn string("temp")', fs: 14.5, mono: true, stroke: INFO, s: pop(u, 0.2) });
      token(190, 210, '"temp"', 'rvalue', pop(u, 0.8));
      tx(190, 262, '이름이 없다 · 식이 끝나면 사라진다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    let hot = null;
    if (k === 2) { const f1 = E(u, 0.2, 1.2), f2 = E(u, 1.3, 2.3);
      if (u < 1.25) { const [x, y] = route(f1, 'top'); token(x, y, 'a', 'lvalue', 1); if (f1 > 0.99) hot = 'top'; }
      else { hot = 'top'; const [x, y] = route(f2, 'bot'); token(x, y, 'makeStr()', 'rvalue', 1); if (f2 > 0.99) hot = 'bot'; }
      terminal(24, 300, 300, 110, outL, u < 1.25 ? f1 : 1 + f2, { title: '출력' }); }
    if (k === 3) { card(210, JY, 110, 46, { rx: 8, text: 'std::move', fs: 15, mono: true, stroke: INFO, fill: INFOBG, sw: 2.5, s: pop(u, 0.1) });
      const f = E(u, 0.4, 2.3), [x, y] = route(f, 'bot'); token(x, y - (f > 0.2 && f < 0.36 ? 0 : 0), 'a', f < 0.28 ? 'lvalue' : 'xvalue', 1);
      if (f > 0.99) hot = 'bot';
      tx(210, JY + 50, '아무것도 옮기지 않는다', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      terminal(24, 300, 300, 110, outL, 2 + E(u, 2.2, 2.7), { title: '출력' }); }
    ends(1, hot);
    if (k === 4) { slot(70, 280, 'a', { type: 'string', val: '"Hello"', valCol: INK, s: 1 });
      pill(185, 254, '이동됐을 수 있다', INFO, pop(u, 0.3), { fs: 13.5, fill: PANEL });
      [['std::cout << a;', BAD, 0.9], ['a = "...";', GOOD, 1.5]].forEach(([s, col, d], i) => { const y = 362 + i * 34;
        mono(80, y, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, d) });
        if (col === BAD) cross(270, y - 5, 9, pop(u, d + 0.2)); else check(270, y - 5, 9, pop(u, d + 0.2)); });
      sub(470, 400, '이 예제의 take는 s를 가져가지 않아 a가 실제로는 그대로다', fade(u, 2.0), { 'text-anchor': 'start' }); } }

  // ---------- 4. 100만 원소: RVO 0회, 이동은 포인터 3개 ----------
  function strip(x, y, w, h, f, o) { o = o || {}; const n = 48, cw = w / n;
    el('rect', { x, y, width: w, height: h, rx: 6, fill: PANEL, stroke: o.stroke || GRID, 'stroke-width': 1.5 });
    for (let i = 0; i < Math.floor(n * clamp(f)); i++) el('rect', { x: x + i * cw + 1, y: y + 3, width: cw - 2, height: h - 6, rx: 1.5, fill: o.col || ACC, opacity: 0.75 }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) {
      const rvo = k === 1 ? E(u, 0.4, 1.6) : k >= 2 ? 1 : 0;
      zone(24, 34, 296, 116, 'makeBig()의 스택 칸', { fill: SOFT, dash: k >= 1 ? '6 5' : null, stroke: k >= 1 ? OFF : 'none', op: k >= 2 ? 0.45 : 1 - 0.5 * rvo });
      zone(24, 168, 296, 220, 'main()의 스택 칸', { fill: SOFT, op: k === 0 ? 0.5 : 1 });
      zone(344, 34, 592, 160, '힙', { fill: SOFT });
      // v 칸이 main 의 a 자리로 (같은 칸)
      const vy = lerp(78, 206, rvo);
      slot(44, vy, rvo > 0.5 ? 'a' : 'v', { type: 'vector<int>', ptr: k < 2 || u < 1.6, ptrCol: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
      strip(380, 90, 520, 44, k === 0 ? E(u, 0.5, 1.8) : 1);
      mono(640, 168, 'int × 1,000,000 = 4,000,000 바이트', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 0 ? fade(u, 1.8) : 1 });
      const [ox, oy] = out(44, vy);
      if (k < 2) arrow(ox, oy, 376, 112, k === 0 ? E(u, 1.2, 1.8) : 1, ACC);
      if (k === 1) { tx(470, 250, '반환할 객체를 호출자 자리에 바로 만든다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
        mono(470, 290, '복사 0회 · 이동 0회', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); }
      if (k === 2) { slot(44, 290, 'b', { type: 'vector<int>', ptr: true, s: pop(u, 0.2) });
        [['begin', 0.4], ['end', 0.6], ['cap', 0.8]].forEach(([s, d], i) => fly(120 + i * 66, 228, 120 + i * 66, 312, seg(u, d, d + 0.8), s, { mono: true }));
        const f = E(u, 1.0, 1.8), [bx, by] = out(44, 290); arrow(lerp(ox, bx, f), lerp(oy, by, f), 376, 112, 1, ACC);
        if (u >= 1.6) tx(44 + SW - 14, 234, '비어 있음', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' });
        tx(380, 236, '옮긴 양', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
        hbar(470, 222, 300, 4000000, 4000000, { u: E(u, 1.7, 2.4), col: BAD, text: '복사라면 4,000,000 B' });
        hbar(470, 258, 300, 24, 4000000, { u: E(u, 1.7, 2.4), col: GOOD, text: '이동 24 B' });
        sub(620, 306, 'vector 객체 = 포인터 3개 = 24바이트 (64비트)', fade(u, 2.2)); }
      return; }
    if (k === 3) { zone(24, 34, 296, 262, '스택 · main()', { fill: SOFT }); zone(344, 34, 592, 262, '힙', { fill: SOFT });
      const f = E(u, 1.0, 1.8);
      slot(44, 80, 'big', { type: 'string', ptr: f < 0.98, s: 1 });
      if (f >= 0.98) tx(44 + SW - 14, 108, '비어 있음', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' });
      slot(44, 190, 'box', { type: 'vector<string>', ptr: true, s: 1 });
      strip(380, 70, 420, 36, 1, { col: WARN }); mono(810, 94, "'x' × 10,000", { 'font-size': 14.5, 'font-weight': 700 });
      card(470, 220, 120, 46, { rx: 8, text: 'box[0]', fs: 15, mono: true, stroke: ACC, sw: 2.5, s: pop(u, 0.3) });
      arrow(...out(44, 190), 408, 220, 1, MUT);
      const [bx, by] = out(44, 80); arrow(lerp(bx, 530, f), lerp(by, 220, f), 376, 88, 1, ACC);
      tx(560, 162, 'push_back(std::move(big))', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      tx(600, 268, '1만 바이트 버퍼를 box[0]이 그대로 넘겨받는다', { 'font-size': 14.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) });
      note(40, 340, '복사한 문자 0개', fade(u, 2.2), { fill: GOOD }); return; }
    // k4: 바이트 비교 막대
    tx(480, 48, '실제로 복사되는 원소·문자 바이트', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
    const rows = [['makeBig()를 복사로 반환', 4000000, BAD, '4,000,000 B', 4000000], ['b = std::move(a)', 0, GOOD, '0 B · 포인터 3개만', 4000000], ['return v; (RVO)', 0, GOOD, '0 B · 생략', 4000000],
      ['push_back(big)', 10000, WARN, '10,000 B', 10000], ['push_back(std::move(big))', 0, GOOD, '0 B · 포인터만', 10000]];
    tx(40, 84, 'vector<int> 100만 원소', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.1) });
    tx(40, 272, "string 'x' × 10,000", { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.0) });
    rows.forEach(([name, v, col, s, max], i) => { const y = (i < 3 ? 98 : 140) + i * 50, g = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3);
      mono(350, y + 15, name, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.1 + i * 0.3) });
      hbar(370, y, 360, v, max, { h: 20, u: g, col, text: s }); });
    sub(480, 404, '막대 길이는 묶음마다 가장 큰 값 기준이다', fade(u, 2.2)); }

  // ---------- 5. 실무 실패 네 가지 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { zone(24, 34, 912, 362, null, { fill: SOFT });
      slot(44, 60, 'v', { type: 'vector<int>', ptr: true }); strip(330, 66, 220, 32, 1); arrow(...out(44, 60), 326, 82, 1, ACC);
      tx(48, 150, 'long sumBad(std::vector<int> v)', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: BAD });
      const nc = Math.floor(E(u, 0.3, 1.8) * 3.99);
      for (let i = 0; i < nc; i++) { strip(70 + i * 240, 170, 200, 30, 1, { col: BAD }); mono(170 + i * 240, 222, `호출 ${i + 1} · 복사`, { 'font-size': 14, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 }); }
      tx(48, 272, 'long sumOk(const std::vector<int>& v)', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: GOOD, opacity: fade(u, 1.6) });
      if (u > 1.7) { arrow(420, 300, 560, 90, E(u, 1.8, 2.4), GOOD, { dash: '6 4' }); mono(48, 314, '참조 하나 · 복사 0', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); }
      mono(880, 222, nc ? `복사 ${nc}번` : '', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); return; }
    if (k === 1) { tx(480, 52, 'vector<Big> 가 커질 때 원소를 새 칸으로 옮긴다', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      const ox = 120, nx = 120, cw = 82;
      tx(40, 120, '옛 칸', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(40, 240, '새 칸', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 4; i++) { const f = E(u, 0.6 + i * 0.25, 1.3 + i * 0.25);
        card(ox + i * cw + 36, 112, 74, 44, { rx: 6, text: f > 0 ? '' : 'Big', fs: 15, mono: true, stroke: f >= 1 ? OFF : INK, dash: f >= 1 ? '4 4' : null }); }
      for (let i = 0; i < 8; i++) { const f = i < 4 ? E(u, 0.6 + i * 0.25, 1.3 + i * 0.25) : 0;
        card(nx + i * cw + 36, 232, 74, 44, { rx: 6, text: f >= 1 ? 'Big' : '', fs: 15, mono: true, stroke: f >= 1 ? GOOD : GRID, s: pop(u, 0.2, 0.4) });
        if (f > 0 && f < 1) fly(ox + i * cw + 36, 112, nx + i * cw + 36, 232, f, 'move', { mono: true, fill: GOOD }); }
      card(250, 340, 380, 62, { rx: 10, stroke: GOOD, sw: 2, text: 'Big(Big&&) noexcept = default;\n→ 원소를 이동으로 옮긴다', fs: 14.5, s: pop(u, 1.9) });
      card(700, 340, 330, 62, { rx: 10, stroke: BAD, sw: 2, text: '이동이 없거나 noexcept가 없으면\n→ 원소마다 복사', fs: 14.5, s: pop(u, 2.2) }); return; }
    if (k === 2) { tx(480, 52, 'Big의 특수 멤버 함수 다섯', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle' });
      const fns = ['~Big()', 'Big(const Big&)', 'Big& operator=(const Big&)', 'Big(Big&&) noexcept', 'Big& operator=(Big&&) noexcept'];
      const fixed = E(u, 1.6, 2.2) > 0.5;
      fns.forEach((f, i) => { const y = 92 + i * 58, isMove = i >= 3, lost = isMove && !fixed;
        card(370, y, 420, 46, { rx: 8, text: f, fs: 15, mono: true, stroke: lost ? OFF : fixed ? GOOD : INK, color: lost ? MUT : INK, dash: lost ? '5 4' : null, s: pop(u, 0.1 + i * 0.12) });
        if (i === 0 && !fixed) tx(600, y + 5, '직접 정의', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
        if (lost) tx(600, y + 5, '자동 생성 안 됨', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) });
        if (fixed) { mono(600, y + 5, '= default', { 'font-size': 15, 'font-weight': 800, fill: GOOD }); check(140, y, 10, pop(u, 1.9 + i * 0.08)); } });
      return; }
    // k3, k4: 이동 후 원본
    zone(24, 34, 296, 262, '스택 · main()', { fill: SOFT }); zone(344, 34, 592, 262, '힙', { fill: SOFT });
    const mvF = k === 3 ? E(u, 0.3, 1.1) : 1;
    slot(44, 64, 'a', mvF < 0.98 ? { type: 'string', ptr: true } : k === 4 && u > 0.4 ? { type: 'string', ptr: true } : { type: 'string', empty: true, val: '빈 상태', valCol: BAD });
    slot(44, 232, 'b', { type: 'string', ptr: true, s: k === 3 ? pop(u, 0.2) : 1 });
    buf(BX, 148, [...'big...'].slice(0, 6));
    const [ax, ay] = out(44, 64), [bx, by] = out(44, 232); arrow(lerp(ax, bx, mvF), lerp(ay, by, mvF), ...bufIn(BX, 148), 1, ACC);
    if (k === 3) { pill(660, 90, 'use(a)', BAD, pop(u, 1.3), { mono: true, fs: 15 }); el('line', { x1: 610, y1: 92, x2: 290, y2: 86, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.5) });
      cross(760, 90, 11, pop(u, 1.8)); tx(790, 96, '빈 값을 읽는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    buf(BX, 67, [...'reset'], { n: Math.floor(clamp((u - 0.4) / 0.9) * 5.99) }); arrow(ax, ay, ...bufIn(BX, 67), E(u, 1.3, 1.9), ACC);
    check(BX + 230, 86, 10, pop(u, 1.9)); tx(BX + 250, 92, '다시 쓸 수 있다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
    [['값 전달 → const&', 0], ['이동은 noexcept로 명시', 1], ['다섯을 한 세트로', 2], ['이동 후 읽기 금지', 3]].forEach(([s, i]) => pill(130 + i * 232, 350, s, WARN, pop(u, 2.0 + i * 0.12), { fs: 14 })); }

  // 장면마다 확인 문제 하나
  const quiz = [
    { q: 'std::string b = a; 를 실행한 뒤 메모리에 일어나는 일은 무엇인가?',
      o: ['b가 a의 버퍼를 함께 가리킨다', 'b가 새 버퍼를 할당받아 a의 글자를 모두 베낀다', 'a의 버퍼가 b로 넘어가고 a는 빈다'], a: 1,
      why: '복사 생성자는 깊은 복사를 한다. 그래서 b[0]을 J로 바꿔도 a는 Hello 그대로다.' },
    { q: 'std::string b = std::move(a); 직후 a.size()는 얼마인가?',
      o: ['0', '5', '정의되지 않아 매번 다르다'], a: 0,
      why: '버퍼는 b에게 넘어가고 a는 유효하지만 빈 상태가 된다. 코드 출력도 0이다.' },
    { q: 'take(std::move(a))에서 std::move가 실제로 하는 일은 무엇인가?',
      o: ['a의 버퍼를 새 객체로 옮긴다', 'a를 즉시 빈 문자열로 만든다', 'a를 rvalue 참조로 캐스팅해 이동 오버로드를 고르게 한다'], a: 2,
      why: 'std::move는 표식을 붙이는 캐스팅일 뿐이다. 옮기는 일은 그 표식을 받은 이동 생성자나 대입이 한다.' },
    { q: '100만 원소 vector를 std::move로 넘길 때 복사되는 원소 바이트는 얼마인가?',
      o: ['4,000,000 바이트', '0 바이트, 포인터 3개만 넘어간다', '원소 수의 절반'], a: 1,
      why: '이동은 begin, end, capacity 세 포인터만 넘긴다. 복사라면 int 100만 개, 4,000,000 바이트를 베낀다.' },
    { q: '소멸자만 직접 정의하고 이동 연산을 선언하지 않은 클래스를 std::move로 넘기면 어떻게 되나?',
      o: ['컴파일 에러가 난다', '이동이 자동 생성되어 그대로 이동된다', '이동이 자동 생성되지 않아 조용히 복사된다'], a: 2,
      why: '사용자가 소멸자를 선언하면 이동 연산이 자동 생성되지 않는다. 그래서 다섯을 함께 = default로 적는다.' },
  ];

  const summary = [
    '복사는 새 버퍼를 할당해 글자를 모두 베끼므로 원본과 사본이 따로 산다.',
    '이동은 버퍼를 제자리에 두고 포인터와 길이만 넘기며 원본은 빈 상태가 된다.',
    'std::move는 옮기지 않는다. 이동 오버로드를 고르게 하는 캐스팅이다.',
    '이동이 없는 클래스는 복사로 대체되니 다섯 특수 함수를 함께 적는다.',
  ];
  const review = [
    { q: '읽기만 하는 함수 f(std::vector<int> v)를 루프에서 100만 번 불렀더니 느리다. 먼저 고칠 것은?',
      o: ['인자를 const std::vector<int>& 로 바꾼다', '호출할 때 std::move(v)를 붙인다', 'v의 원소 수를 줄인다'], a: 0,
      why: '값으로 받으면 호출마다 깊은 복사가 일어난다. 읽기 전용이면 const 참조로 받아 복사를 없앤다. std::move를 붙이면 원본이 비어 다음 호출이 깨진다.' },
    { q: 'vector<Big> 에 원소를 계속 넣었더니 재할당마다 문자열 복사가 일어난다. Big에서 먼저 확인할 것은?',
      o: ['Big의 멤버 문자열 길이', '이동 생성자가 있고 noexcept 인지', 'vector의 reserve 호출 위치만'], a: 1,
      why: 'vector는 이동이 예외를 던지지 않을 때만 이동으로 옮긴다. 소멸자만 정의해 이동이 사라졌거나 noexcept가 없으면 원소마다 복사한다.' },
    { q: 'std::string b = std::move(a); 뒤에 a를 다시 쓰고 싶다. 안전한 방법은?',
      o: ['a를 바로 출력해 남은 값을 확인한다', 'a.size()가 5 인지 보고 쓴다', 'a에 새 값을 대입한 뒤 쓴다'], a: 2,
      why: '이동된 a는 유효하지만 빈 상태라 값을 기대하면 안 된다. 새 값을 대입하면 다시 평범한 객체가 된다.' },
  ];

  R.page({ title: '메모리 들여다보기 · 복사와 이동', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
