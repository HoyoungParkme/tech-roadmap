/* I-1-1 왜 Rust 인가 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
   확인한 값: race.cpp 를 MSVC(/Od)로 스레드당 10만 회 8번 실행 → 116295, 200000×5, 169132, 200000 / 100회면 8번 모두 200
   main.rs: format!("Hello, {}", "Alice") → len 12, cap 14 / let x = g; let y = g; → E0382 use of moved value: `g`
   Rc 를 thread::spawn 으로 넘기면 E0277, 두 스레드가 같은 counter 를 &mut 로 쓰면 E0499 (rustc 1.100)
   GC 장면의 200ms·2~3배는 페이지가 든 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, person, terminal, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ── 공용 그림 도구 ──────────────────────────────────────────
  function slot(x, y, name, vals, o) {
    o = o || {}; const dead = !!o.dead, col = dead ? OFF : (o.col || INK), cw = o.cw || 58, op = o.op ?? 1;
    const g = R.G(x, y, 1, op);
    tx(-12, 35, name, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', class: 'mono', fill: col, 'text-decoration': dead ? 'line-through' : null }, g);
    vals.forEach(([f, v], i) => { const cx = i * (cw + 4);
      el('rect', { x: cx, y: 10, width: cw, height: 40, rx: 5, fill: dead ? SOFT : (o.fill || PANEL), stroke: col, 'stroke-width': 2, 'stroke-dasharray': dead ? '4 4' : null }, g);
      if (f) tx(cx + cw / 2, 3, f, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }, g);
      if (v === '●') el('circle', { cx: cx + cw / 2, cy: 30, r: 6, fill: dead ? OFF : (o.ptrCol || ACC) }, g);
      else mono(cx + cw / 2, 36, String(v), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: dead ? OFF : (o.valCol || INK) }, g); });
    return { ptr: [x + cw / 2, y + 30], right: x + vals.length * (cw + 4) - 4, bottom: y + 50 };
  }
  function wire(pts, u, col, o) {
    o = o || {}; if (u <= 0) return; const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = L.reduce((a, b) => a + b, 0);
    let d = clamp(u) * tot; const out = [pts[0]];
    for (let i = 0; i < L.length && d > 0; i++) { const f = Math.min(1, d / L[i]); out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]); d -= L[i]; }
    el('polyline', { points: out.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col || ACC, 'stroke-width': o.sw || 2.4, 'stroke-dasharray': o.dash, opacity: o.op ?? 1, 'stroke-linejoin': 'round',
      'marker-end': u > 0.98 && !o.plain ? (col === BAD ? 'url(#ra-ahr)' : col === ACC || !col ? 'url(#ra-ahb)' : 'url(#ra-ah)') : null });
  }
  function err(cx, cy, code, lines, s) {
    if (s <= 0.01) return; lines = [].concat(lines); const head = 'error[' + code + ']';
    const w = Math.max(tw(head, 15), ...lines.map((l) => tw(l, 14))) + 34, h = 34 + lines.length * 21, g = R.G(cx, cy, s);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: INK }, g);
    mono(-w / 2 + 16, -h / 2 + 23, head, { 'font-size': 15, 'font-weight': 800, fill: BAD }, g);
    lines.forEach((l, i) => mono(-w / 2 + 16, -h / 2 + 45 + i * 21, l, { 'font-size': 14, fill: PANEL }, g));
  }
  const brace = (x, y, op, col) => mono(x, y, '}', { 'font-size': 54, 'font-weight': 800, fill: col || MUT, opacity: op, 'text-anchor': 'middle' });
  // 64바이트 힙: 16칸 × 4줄. n 칸까지 보이고, st(i) → { fill, stroke, color, op, dash }
  function bytes64(x, y, n, chars, st) {
    for (let i = 0; i < Math.min(64, Math.ceil(n)); i++) { const r = Math.floor(i / 16), cx = x + (i % 16) * 26, cy = y + r * 30, s = (st && st(i)) || {}, op = (s.op ?? 1) * clamp(n - i);
      el('rect', { x: cx, y: cy, width: 24, height: 28, rx: 3, fill: s.fill || PANEL, stroke: s.stroke || GRID, 'stroke-width': 1.5, 'stroke-dasharray': s.dash, opacity: op });
      const ch = chars && chars[i]; if (ch) mono(cx + 12, cy + 19, ch, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: s.color || INK, opacity: op }); }
  }
  const HELLO = ['H', 'e', 'l', 'l', 'o', ',', '␣', 'A', 'l', 'i', 'c', 'e', '\\0'];
  // 한 줄 힙 칸 (UAF 장면)
  function row(x, y, chars, st, w) { w = w || 34;
    chars.forEach((ch, i) => { const s = (st && st(i)) || {}, cx = x + i * (w + 3);
      el('rect', { x: cx, y, width: w, height: 40, rx: 4, fill: s.fill || ACCBG, stroke: s.stroke || ACC, 'stroke-width': 2, 'stroke-dasharray': s.dash, opacity: s.op ?? 1 });
      if (ch) mono(cx + w / 2, y + 26, ch, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: s.color || INK, opacity: s.op ?? 1 }); }); }

  // 1. C/C++ — 자유롭지만 검사관이 없다
  function s1(t, c) { const { k, u } = c;
    if (k === 4) {
      mono(480, 50, 'free(g) 는 몇 번?', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle' });
      zone(40, 75, 420, 250, '한 번도 안 부르면'); zone(500, 75, 420, 250, '두 번 부르면');
      // 왼쪽: 주인 없는 64바이트
      el('rect', { x: 170, y: 150, width: 160, height: 70, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      mono(250, 192, '64B', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.2) });
      tx(250, 268, '가리키는 변수 없음 · 누수', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      // 오른쪽: 같은 자리에 free 두 번
      el('rect', { x: 630, y: 150, width: 160, height: 70, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      mono(710, 192, '64B', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) });
      pill(560, 120, 'free ①', INK, pop(u, 0.5), { mono: true, fs: 13.5 }); grow(590, 130, 640, 160, seg(u, 0.6, 1.0), INK);
      pill(860, 120, 'free ②', BAD, pop(u, 1.0), { mono: true, fs: 13.5 }); grow(830, 130, 780, 160, seg(u, 1.1, 1.5), BAD);
      cross(800, 150, 14, pop(u, 1.5)); tx(710, 268, 'double-free', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 1.6) });
      pill(480, 372, '두 경우 모두 컴파일 성공', GOOD, pop(u, 2.0), { fs: 15 }); check(320, 372, 11, pop(u, 2.1)); return; }
    zone(30, 40, 390, 360, '스택'); zone(440, 40, 490, 360, '힙');
    const fnOp = k <= 1 ? 1 : k === 2 ? 1 - 0.75 * E(u, 1.4, 2.2) : 0;
    if (fnOp > 0) zone(45, 70, 360, 140, 'make_greeting()', { fill: PANEL, stroke: WARN, sw: 2, op: fnOp });
    zone(45, 225, 360, 160, 'main()', { fill: PANEL, stroke: k >= 2 ? INK : GRID, sw: 1.5 });
    const n = k === 0 ? lerp(0, 64, E(u, 0.3, 1.4)) : 64, typed = k === 1 ? lerp(0, 13, E(u, 0.2, 1.4)) : k >= 2 ? 13 : 0;
    bytes64(470, 110, n, HELLO.slice(0, Math.floor(typed)), (i) => i < Math.floor(typed) ? { fill: ACCBG, stroke: ACC, color: i === 12 ? MUT : INK } : {});
    mono(470, 98, '0x7f12', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: k === 0 ? fade(u, 0.3) : 1 });
    if (k === 0) sub(677, 262, '64바이트 · 크기도 수명도 적혀 있지 않다', fade(u, 1.5), { 'font-weight': 700, fill: INK });
    if (fnOp > 0) { const b = slot(130, 110, 'buf', [['char*', '0x7f12']], { cw: 100, op: fnOp * (k === 0 ? fade(u, 0.2) : 1) });
      if (k <= 1) wire([[b.right, b.ptr[1]], [440, b.ptr[1]], [466, 124]], k === 0 ? seg(u, 1.2, 1.7) : 1, ACC); }
    if (k === 1) { el('rect', { x: 470, y: 232, width: 414, height: 28, rx: 3, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.6) });
      tx(677, 290, 'name 이 56자를 넘으면 64바이트 밖까지 쓴다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(677, 318, '경계 검사 없음', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 2) { fly(180, 160, 180, 300, seg(u, 0.3, 1.3), 'return 0x7f12', { mono: true, stay: true });
      fly(300, 170, 300, 345, seg(u, 0.8, 1.8), 'free 책임 (주석뿐)', { fill: WARN, stay: true }); }
    if (k === 3) { const g = slot(140, 245, 'g', [['char*', '0x7f12']], { cw: 100 });
      wire([[g.right, g.ptr[1]], [430, g.ptr[1]], [430, 124], [466, 124]], seg(u, 0.2, 0.8), ACC);
      slot(140, 315, '?', [['char*', '0x7f12']], { cw: 100, op: fade(u, 1.0), col: WARN, valCol: WARN });
      wire([[250, 345], [440, 345], [470, 200]], seg(u, 1.2, 1.7), WARN, { dash: '6 4' });
      pill(677, 300, '주인일까, 빌린 것일까?', WARN, pop(u, 1.8), { fs: 15 });
      sub(677, 340, '같은 주소를 가진 변수가 몇 개인지 아무도 모른다', fade(u, 2.1)); }
  }

  // 2. use-after-free
  function s2(t, c) { const { k, u } = c;
    zone(30, 40, 360, 360, '스택'); zone(410, 40, 520, 360, '힙 0x7f12');
    const chars = HELLO.map((h) => h === '\\0' ? '' : h);
    const freed = k > 0 || u > 1.4, taken = k === 3 ? E(u, 0.2, 1.0) : 0, evil = k === 4 ? E(u, 1.0, 1.6) : 0;
    row(430, 110, chars, (i) => {
      if (k === 4 && evil > 0) return { fill: BADBG, stroke: BAD, color: BAD, op: 1 };
      if (k === 3) return { fill: INFOBG, stroke: INFO, color: INFO, op: 1 };
      if (k === 5) return { fill: SOFT, stroke: OFF, color: OFF, dash: '4 3' };
      return freed ? { fill: SOFT, stroke: OFF, color: k === 2 ? MUT : OFF, dash: '4 3', op: k === 0 ? 1 : 1 } : {};
    }, 34);
    if (k === 3) { for (let i = 0; i < 13; i++) el('rect', { x: 430 + i * 37, y: 110, width: 34, height: 40, rx: 4, fill: INFO, opacity: 0.25 * taken });
      tx(670, 96, '다른 malloc 이 같은 자리를 받음', { 'font-size': 15, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.6) }); }
    const g = slot(130, 100, 'g', [['char*', '0x7f12']], { cw: 100, col: freed ? BAD : null, valCol: freed ? BAD : null });
    wire([[g.right, g.ptr[1]], [426, 130]], 1, freed ? BAD : ACC, { dash: freed ? '6 4' : null });
    if (k === 0) { terminal(450, 250, 450, 120, ['Hello, Alice'], seg(u, 0.4, 0.9), { title: 'printf' });
      pill(190, 210, 'free(g)', WARN, pop(u, 1.3), { mono: true });
      tx(190, 260, 'g 에는 주소가 그대로 남는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 1) { for (let i = 0; i < 6; i++) { const yy = 210 + i * 22 - E(u, 0.1, 1.0) * 60; if (yy > 180 && yy < 330) mono(60, yy, '…', { 'font-size': 15, fill: OFF }); }
      tx(110, 250, '… 100줄 뒤 …', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.3) });
      pill(200, 330, 'log_message(g)', BAD, pop(u, 0.8), { mono: true });
      dot([[200, 315], [g.right, g.ptr[1]], [426, 130]], seg(u, 1.1, 2.0), BAD, 7);
      tx(670, 200, '해제된 자리를 읽는다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 2) { terminal(450, 230, 450, 120, ['Hello, Alice', ['Hello, Alice   (해제 뒤)', WARN]], lerp(1, 2, seg(u, 0.4, 1.0)), { title: 'log' });
      pill(670, 385, '테스트 통과 · 버그는 숨는다', WARN, pop(u, 1.4), { fs: 14 });
      tx(200, 260, '운 좋게 옛 값이 남아 있다', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
    if (k === 3) { terminal(450, 230, 450, 120, [['(남의 데이터) 또는 crash', BAD]], seg(u, 1.2, 1.7), { title: 'log' });
      tx(200, 260, '재현 안 되는 깨짐', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 4) { person(840, 300, '공격자', { stroke: BAD });
      fly(800, 280, 620, 140, seg(u, 0.3, 1.1), '조작된 값', { fill: BAD });
      banner(600, 260, '해제된 자리 → 원격 코드 실행', pop(u, 1.7)); }
    if (k === 5) { [['그대로 출력', WARN], ['데이터 오염 · crash', INFO], ['원격 코드 실행', BAD]].forEach(([s, col], i) => {
        const y = 210 + i * 62, sc = pop(u, 0.2 + i * 0.3); R.card(600, y, 260, 48, { rx: 10, stroke: col, sw: 2, text: s, fs: 15, color: col, s: sc });
        check(770, y, 10, pop(u, 0.5 + i * 0.3)); tx(788, y + 5, '컴파일 통과', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5 + i * 0.3) }); });
      tx(200, 270, '알게 되는 때', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      tx(200, 300, '배포 뒤 사고', { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
  }

  // 3. 데이터 레이스
  const RUNS = [116295, 200000, 200000, 200000, 200000, 200000, 169132, 200000];
  function s3(t, c) { const { k, u } = c;
    if (k === 4) {
      tx(480, 34, 'race.cpp 실제 실행 · MSVC /Od · 스레드당 10만 회', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      const ax = axes(150, 70, 700, 270, { x: [0, 8], y: [0, 220000], yt: [0, 100000, 200000], xl: '실행 번호', grid: true });
      el('line', { x1: 150, y1: ax.Y(200000), x2: 850, y2: ax.Y(200000), stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '7 5', opacity: fade(u, 0.1) });
      tx(855, ax.Y(200000) + 5, '기대', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.1) });
      RUNS.forEach((v, i) => { const g = E(u, 0.2 + i * 0.18, 0.8 + i * 0.18), x = ax.X(i + 0.5) - 30, h = (ax.Y(0) - ax.Y(v)) * g, short = v < 200000;
        el('rect', { x, y: ax.Y(0) - h, width: 60, height: h, rx: 3, fill: short ? BAD : ACC, opacity: 0.85 });
        mono(x + 30, ax.Y(0) - h - 7, String(v), { 'font-size': 13.5, 'font-weight': short ? 800 : 500, fill: short ? BAD : MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8 + i * 0.18) });
        mono(x + 30, ax.Y(0) + 20, String(i + 1), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      tx(480, 400, '빌드는 매번 성공 · 같은 코드가 실행마다 다른 값', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    // 공유 카운터
    const val = k === 2 ? (u < 1.5 ? 41 : 42) : k === 3 ? '?' : 0;
    R.card(480, 80, 240, 60, { rx: 10, stroke: k >= 2 ? BAD : INK, sw: 2.5, text: 'counter = ' + val, fs: 20, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
    lock(650, 82, false, BAD, k === 0 ? pop(u, 0.8) : 1); if (k === 0) { cross(650, 82, 18, pop(u, 1.1)); tx(680, 88, 'mutex 없음', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
      tx(480, 200, '모든 스레드가 같은 전역 변수 하나를 만진다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      [180, 780].forEach((x, i) => { R.card(x, 300, 150, 50, { rx: 10, stroke: GRID, text: i ? 'Thread B' : 'Thread A', fs: 15, color: MUT, s: pop(u, 1.8 + i * 0.2) }); grow(x + (i ? -80 : 80), 290, x + (i ? -220 : 220), 110, seg(u, 2.0, 2.5), MUT, { dash: '5 5' }); }); return; }
    if (k === 1) { const parts = [['① 메모리에서 읽기', 220], ['② 1 더하기', 480], ['③ 메모리에 쓰기', 740]];
      pill(480, 200, 'counter++', INK, 1 - fade(u, 0.6), { mono: true, fs: 16 });
      parts.forEach(([s, x], i) => { const f = E(u, 0.5 + i * 0.15, 1.2 + i * 0.15); R.card(lerp(480, x, f), 200, 190, 46, { rx: 23, stroke: WARN, sw: 2, text: s, fs: 15, op: f });
        if (i < 2) grow(x + 100, 200, x + 160, 200, seg(u, 1.4 + i * 0.2, 1.7 + i * 0.2), WARN); });
      tx(480, 290, '세 동작 사이의 틈에 다른 스레드가 끼어든다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(480, 330, '스레드마다 10만 번 반복', fade(u, 2.2), { 'font-weight': 700 }); return; }
    // k 2, 3: 두 줄 타임라인
    const lanes = [['Thread A', 190], ['Thread B', 290]];
    lanes.forEach(([n, y]) => { tx(130, y + 5, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); el('line', { x1: 145, y1: y, x2: k === 3 ? 700 : 860, y2: y, stroke: GRID, 'stroke-width': 3 }); });
    if (k === 2) { const ev = [[0, 230, '읽기 41', INFO], [1, 370, '읽기 41', INFO], [0, 510, '쓰기 42', WARN], [1, 650, '쓰기 42', BAD]];
      ev.forEach(([ln, x, s, col], i) => { const sc = pop(u, 0.2 + i * 0.4); R.card(x, lanes[ln][1], 100, 36, { rx: 18, stroke: col, sw: 2, text: s, fs: 14.5, color: col, mono: true, s: sc });
        grow(x, lanes[ln][1] - 18, x, 110, seg(u, 0.3 + i * 0.4, 0.6 + i * 0.4), col, { dash: '4 4', plain: true }); });
      tx(480, 370, '+1 을 두 번 했는데 counter 는 1 만 늘었다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(480, 400, '끼어드는 순서 하나를 보인 예시', fade(u, 2.2)); return; }
    el('rect', { x: 700, y: 160, width: 10, height: 160, rx: 5, fill: INK, opacity: fade(u, 0.3) });
    tx(705, 345, 'join()', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    lanes.forEach(([, y], i) => dot([[145, y], [700, y]], seg(u, 0.1 + i * 0.3, 1.2 + i * 0.3), ACC, 8));
    check(760, 240, 12, pop(u, 1.6)); tx(785, 236, '끝났다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
    tx(785, 262, '값이 맞다는 보장은 없다', { 'font-size': 14, fill: BAD, opacity: fade(u, 2.0) });
  }

  // 4. GC 언어
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) {
      zone(30, 40, 900, 230, 'JVM 힙');
      el('circle', { cx: 110, cy: 130, r: 34, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); tx(110, 128, 'GC', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); tx(110, 146, '루트', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      R.cells(190, 108, ['byte[]', 'byte[]', 'byte[]'], { w: 70, h: 44, fs: 14, style: () => ({ stroke: GOOD, fill: GOODBG }) });
      tx(190, 98, 'cache', { 'font-size': 15, 'font-weight': 700, class: 'mono' }); grow(144, 130, 186, 130, k === 0 ? seg(u, 0.4, 0.8) : 1, INK);
      tx(312, 190, '참조가 남아 있어 회수 안 됨', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 0 ? fade(u, 1.0) : 1 });
      // 요청마다 1MB buf
      const nreq = k === 0 ? 0 : k === 1 ? lerp(0, 8, E(u, 0.2, 2.2)) : 8, sweep = k === 2 ? E(u, 1.2, 2.2) : 0;
      for (let i = 0; i < 8; i++) { const f = clamp(nreq - i); if (f <= 0) continue; const x = 470 + (i % 4) * 110, y = 80 + Math.floor(i / 4) * 80, d = clamp(sweep * 1.5 - i * 0.06), garbage = nreq - i > 1.2 || k === 2;
        el('rect', { x, y: y + d * 40, width: 96, height: 56, rx: 6, fill: garbage ? SOFT : WARNBG, stroke: garbage ? OFF : WARN, 'stroke-width': 2, 'stroke-dasharray': garbage ? '5 4' : null, opacity: f * (1 - d) });
        mono(x + 48, y + 34 + d * 40, '1MB', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: garbage ? OFF : WARN, opacity: f * (1 - d) }); }
      if (k === 1) tx(690, 255, '다 쓴 buf 는 쓰레기로 남아 GC 를 기다린다', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      // 힙 사용량
      const used = k === 0 ? 0.1 : k === 1 ? lerp(0.1, 0.92, E(u, 0.2, 2.2)) : lerp(0.92, 0.15, E(u, 1.2, 2.2));
      tx(60, 300, '힙 사용량', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      el('rect', { x: 140, y: 288, width: 700, height: 16, rx: 8, fill: SOFT }); el('rect', { x: 140, y: 288, width: 700 * used, height: 16, rx: 8, fill: used > 0.8 ? BAD : WARN });
      // 요청 줄
      tx(60, 360, '요청', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); el('line', { x1: 140, y1: 355, x2: 900, y2: 355, stroke: GRID, 'stroke-width': 3 });
      if (k === 2) { el('rect', { x: 470, y: 325, width: lerp(0, 150, E(u, 0.2, 0.6)), height: 60, rx: 6, fill: INK, opacity: 0.85 });
        tx(545, 361, 'GC · STW', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
        for (let i = 0; i < 5; i++) el('circle', { cx: 455 - i * 18 * E(u, 0.4, 1.0), cy: 355, r: 7, fill: BAD });
        tx(330, 395, '멈춘 동안 요청이 줄을 선다', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
      else if (k === 1) for (let i = 0; i < 4; i++) dot([[140, 355], [900, 355]], (u * 0.45 + i / 4) % 1, ACC, 6);
      return; }
    // k 3, 4: 지연 그래프 (예시 값)
    const ax = axes(110, 70, 450, 260, { x: [0, 10], y: [0, 250], yt: [0, 100, 200], xl: '시간', yl: '응답 ms (예시)' });
    const pts = [[0, 5], [1, 6], [2, 5], [3, 5], [4, 6], [4.4, 200], [4.8, 6], [6, 5], [7, 5], [8, 6], [9, 5], [10, 5]];
    line(ax, pts, k === 3 ? E(u, 0.2, 1.6) : 1, k === 4 ? BAD : WARN);
    if (k === 3) { pill(ax.X(4.4) + 70, ax.Y(200), 'GC 정지 200ms', WARN, pop(u, 1.4), { fs: 14 }); sub(ax.X(8), ax.Y(5) - 18, '평소 5ms', fade(u, 1.0)); }
    if (k === 4) { el('line', { x1: 110, y1: ax.Y(60), x2: 560, y2: ax.Y(60), stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 5', opacity: fade(u, 0.2) });
      tx(560, ax.Y(60) - 8, '실시간 지연 상한', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.2) });
      cross(ax.X(4.4), ax.Y(130), 13, pop(u, 0.8)); }
    // 메모리 막대
    tx(640, 90, '필요한 메모리 (예시)', { 'font-size': 15, 'font-weight': 700 });
    [['C', 1, INK], ['GC 언어', 2.5, WARN]].forEach(([n, v, col], i) => { const y = 130 + i * 60, g = E(u, 0.6 + i * 0.3, 1.4 + i * 0.3);
      tx(640, y + 14, n, { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 720, y, width: 70 * v * (k === 3 ? g : 1), height: 22, rx: 4, fill: col, opacity: 0.85 });
      mono(726 + 70 * v * (k === 3 ? g : 1), y + 16, i ? '2~3배' : '1', { 'font-size': 14, 'font-weight': 700, fill: col, opacity: k === 3 ? fade(u, 1.4 + i * 0.3) : 1 }); });
    if (k === 4) { el('rect', { x: 640, y: 270, width: 230, height: 70, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: fade(u, 1.0) });
      tx(755, 262, '저사양 기기 메모리', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      el('rect', { x: 650, y: 292, width: lerp(0, 270, E(u, 1.2, 2.0)), height: 26, rx: 4, fill: BAD, opacity: 0.8 });
      tx(755, 372, '넘친다', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
  }

  // 5. Rust — 컴파일 게이트
  function s5(t, c) { const { k, u } = c;
    if (k === 5) {
      const cols = [['작성', 200], ['빌드', 400], ['실행', 600], ['배포 뒤', 800]];
      cols.forEach(([n, x], i) => { tx(x, 64, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1 + i * 0.1) }); el('line', { x1: x, y1: 80, x2: x, y2: 370, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5' }); });
      const lanes = [['C/C++', 140, 800, BAD, '사고로 발견'], ['GC 언어', 240, 600, WARN, 'GC 정지·메모리'], ['Rust', 340, 400, GOOD, '에러로 차단']];
      lanes.forEach(([n, y, stop, col, note], i) => { tx(150, y + 5, n, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
        el('line', { x1: 170, y1: y, x2: 860, y2: y, stroke: GRID, 'stroke-width': 3 });
        const f = E(u, 0.3 + i * 0.4, 1.2 + i * 0.4), x = lerp(200, stop, f); el('circle', { cx: x, cy: y, r: 9, fill: col });
        if (f > 0.98) { if (i === 2) check(stop, y - 26, 11, pop(u, 1.3 + i * 0.4)); else if (i === 0) cross(stop, y - 26, 10, pop(u, 1.3 + i * 0.4));
          else el('rect', { x: stop, y: y - 10, width: 200 * fade(u, 1.3 + i * 0.4), height: 20, rx: 4, fill: WARN, opacity: 0.35 });
          tx(stop + (i === 1 ? 100 : 0), y + 34, note, { 'font-size': 14.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 1.3 + i * 0.4) }); } });
      return; }
    if (k === 4) {
      el('line', { x1: 480, y1: 50, x2: 480, y2: 400, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
      tx(490, 70, '스레드 경계', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      const rcX = lerp(200, 430, E(u, 0.2, 0.9)) - (u > 0.9 ? 30 * E(u, 0.9, 1.2) : 0);
      pill(rcX, 130, 'Rc<RefCell<i32>>', INK, 1, { mono: true, fs: 14 }); if (u > 0.9) cross(455, 130, 12, pop(u, 0.9));
      err(705, 140, 'E0277', ['`Rc<RefCell<i32>>` cannot be sent', 'between threads safely', 'help: the trait `Send` is not implemented'], pop(u, 1.1));
      R.card(170, 310, 130, 46, { rx: 10, text: 'counter', fs: 16, mono: true, stroke: INK, s: pop(u, 1.3) });
      [[400, 270, 'spawn ①'], [400, 350, 'spawn ②']].forEach(([x, y, n], i) => { R.card(x, y, 110, 40, { rx: 10, text: n, fs: 14, stroke: GRID, s: pop(u, 1.4 + i * 0.2) });
        wire([[345, y], [235, 310]], seg(u, 1.6 + i * 0.2, 1.9 + i * 0.2), i ? BAD : INK); mono(300, y + (i ? 22 : -10), '&mut', { 'font-size': 14, fill: i ? BAD : MUT, opacity: fade(u, 1.7 + i * 0.2) }); });
      err(705, 320, 'E0499', ['cannot borrow `counter` as mutable', 'more than once at a time'], pop(u, 2.1)); return; }
    zone(30, 40, 420, 360, '스택'); zone(470, 40, 460, 360, '힙');
    const chars = ['H', 'e', 'l', 'l', 'o', ',', '␣', 'A', 'l', 'i', 'c', 'e'];
    const fall = k === 2 ? E(u, 0.8, 2.0) : 0;
    chars.concat(['', '']).forEach((ch, i) => { const spare = i >= 12, d = clamp(fall * 1.6 - i * 0.08), x = 490 + i * 31, y = 120 + d * 40, op = (k === 0 ? clamp(lerp(0, 14, E(u, 0.2, 0.9)) - i) : 1) * (1 - d);
      if (op <= 0.02) return;
      el('rect', { x, y, width: 28, height: 40, rx: 4, fill: spare ? PANEL : ACCBG, stroke: spare ? OFF : ACC, 'stroke-width': 2, 'stroke-dasharray': spare ? '4 3' : null, opacity: op });
      if (ch) mono(x + 14, y + 26, ch, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: op }); });
    if (k !== 2 || u < 1.0) sub(707, 186, 'len 12 · cap 14 (여분 2칸)', k === 0 ? fade(u, 1.0) : 1);
    const fnOp = k === 0 ? 1 - E(u, 1.6, 2.3) : 0;
    if (fnOp > 0) { zone(45, 70, 390, 130, 'make_greeting()', { fill: PANEL, stroke: WARN, sw: 2, op: fnOp });
      const f = slot(150, 110, 'String', [['ptr', '●'], ['len', 12], ['cap', 14]], { op: fnOp * fade(u, 0.1) });
      wire([[f.right, f.ptr[1]], [486, 140]], seg(u, 0.8, 1.2) * (u < 1.6 ? 1 : 0), ACC); }
    zone(45, 215, 390, 175, 'main()', { fill: PANEL, stroke: k === 2 ? INK : GRID, sw: 1.5 });
    if (k === 0) fly(240, 175, 240, 262, seg(u, 1.3, 2.0), 'return = move', { mono: true });
    const gDead = k === 3 && u > 0.9, gOn = k >= 1 || u > 2.0;
    if (gOn && !(k === 2 && u > 1.8)) { const g = slot(150, 240, 'g', [['ptr', '●'], ['len', 12], ['cap', 14]], { dead: gDead, op: k === 2 ? 1 - E(u, 1.4, 1.8) : 1 });
      if (!gDead && !(k === 2 && u > 0.8)) wire([[g.right, g.ptr[1]], [455, g.ptr[1]], [455, 140], [486, 140]], k === 0 ? seg(u, 2.0, 2.4) : 1, ACC); }
    if (k === 1) { pill(140, 350, 'println!', INFO, pop(u, 0.2), { mono: true }); wire([[140, 334], [180, 292]], seg(u, 0.5, 1.0), INFO, { dash: '5 4' });
      mono(200, 330, '&g 로 빌려 읽기', { 'font-size': 14, fill: INFO, opacity: fade(u, 0.8) });
      terminal(500, 250, 400, 92, ['Hello, Alice'], seg(u, 1.0, 1.5), { title: '출력' }); }
    if (k === 2) { brace(410, 380, fade(u, 0.1), INK); fly(390, 350, 260, 300, seg(u, 0.2, 0.8), 'drop(g)', { mono: true, fill: WARN });
      tx(700, 280, '힙 14바이트 반환', { 'font-size': 16, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(700, 310, 'free 는 한 줄도 쓰지 않았다', { 'font-size': 15, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); }
    if (k === 3) { fly(240, 300, 240, 330, seg(u, 0.2, 0.9), 'let x = g;', { mono: true });
      if (u > 0.9) { const x = slot(150, 315, 'x', [['ptr', '●'], ['len', 12], ['cap', 14]]); wire([[x.right, x.ptr[1]], [460, x.ptr[1]], [460, 150], [486, 150]], seg(u, 0.9, 1.3), ACC); }
      err(700, 300, 'E0382', ['use of moved value: `g`', 'let y = g;', '        ^ value used here after move'], pop(u, 1.5)); }
  }

  const quiz = [
    { q: 'legacy.c의 make_greeting이 호출자에게 돌려주는 것은 무엇인가?',
      o: ['크기와 해제 시점이 함께 적힌 객체', '힙 주소 하나', '문자열의 새 복사본'], a: 1,
      why: 'malloc은 64바이트의 시작 주소만 준다. 누가 언제 free할지는 주석에만 적혀 있다.' },
    { q: 'free(g) 뒤 log_message(g)가 "Hello, Alice"를 그대로 찍었다. 이것은 무엇을 뜻하는가?',
      o: ['할당기가 그 자리를 아직 내주지 않아 버그가 숨어 있다', 'free가 실패해서 메모리가 그대로다', 'C 컴파일러가 해제를 취소해 주었다'], a: 0,
      why: '해제된 자리를 읽은 것은 맞는데 우연히 옛 값이 남아 있었을 뿐이다. 그래서 테스트를 통과해 버린다.' },
    { q: 'race.cpp를 스레드당 10만 번으로 8번 돌렸을 때 실제로 본 결과는 무엇인가?',
      o: ['8번 모두 200000', '116295, 169132처럼 모자란 값이 섞였다', '컴파일 에러로 실행되지 않았다'], a: 1,
      why: '8번 중 2번이 200000보다 작았다. 빌드는 매번 성공했고, 100번 반복으로 돌리면 8번 모두 200이 나와 버그가 숨었다.' },
    { q: 'Java 예제에서 use-after-free가 생기지 않는 이유는 무엇인가?',
      o: ['참조가 남아 있는 한 GC가 회수하지 않아서', 'JVM이 free를 대신 바로 불러서', '배열 크기가 1MB로 정해져 있어서'], a: 0,
      why: 'GC는 누가 아직 참조하는가로 회수를 정한다. 그 대가로 STW 정지와 여유 메모리를 낸다.' },
    { q: 'Rust에서 let x = g; let y = g; 를 빌드하면 어떻게 되는가?',
      o: ['y가 g의 복사본을 받는다', '실행 중에 double-free로 죽는다', 'E0382 use of moved value: `g`로 빌드가 멈춘다'], a: 2,
      why: 'g의 소유권은 x로 옮겨 갔다. 옮겨 간 값을 다시 쓰는 줄을 컴파일러가 거부하므로 double-free가 생길 수 없다.' },
  ];

  const summary = [
    'C는 malloc이 준 주소만 들고 다니고 해제 책임은 주석에 둔다. 누수와 해제 뒤 사용이 빌드를 통과한다.',
    '잠금 없는 counter++는 실행마다 값이 달랐고, 반복이 짧으면 8번 모두 정상처럼 보였다.',
    'GC 언어는 해제 사고를 막지만 일시 정지와 여유 메모리를 비용으로 낸다.',
    'Rust는 drop 위치, move 뒤 사용, 스레드 공유를 빌드 때 검사해 E0382, E0499로 막는다.',
  ];
  const review = [
    { q: 'C 서비스의 로그에 가끔 남의 데이터가 찍히고 재현이 안 된다. 먼저 의심할 것은 무엇인가?',
      o: ['해제한 포인터를 다른 곳에서 다시 쓰는 코드', '로그 파일의 문자 인코딩', 'CPU 클럭 속도'], a: 0,
      why: '해제된 자리에 다른 할당이 들어오면 그 내용이 찍힌다. 할당 순서에 따라 달라 재현이 어렵다.' },
    { q: '스레드 카운터 테스트가 100번 반복으로는 늘 통과했는데 운영에서는 값이 모자란다. 이유로 맞는 것은 무엇인가?',
      o: ['운영 서버의 컴파일러 버전이 달라서', '반복이 짧으면 두 스레드가 겹치지 않아 레이스가 드러나지 않아서', 'join을 부르지 않아서'], a: 1,
      why: '이 장의 실행에서도 100번은 8번 모두 200, 10만 번은 116295 같은 값이 나왔다. 테스트 통과가 안전을 뜻하지 않는다.' },
    { q: '지연 상한이 엄격한 임베디드 장비를 만들면서 메모리 안전도 지켜야 한다. 이 장의 내용으로 고를 만한 것은 무엇인가?',
      o: ['C로 짜고 코드 리뷰를 늘린다', 'GC 언어로 짜고 힙을 넉넉히 준다', 'Rust로 짜서 해제와 공유를 빌드 때 검사받는다'], a: 2,
      why: 'C는 사고를 배포 뒤에 알고, GC는 정지와 메모리가 상한을 넘을 수 있다. Rust는 검사를 빌드로 옮기고 GC가 없다.' },
  ];

  R.page({ title: '메모리 사고를 잡는 시점', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
