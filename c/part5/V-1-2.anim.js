/* V-1-2 디버깅 — gdb·valgrind — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 실행 확인: zig cc(clang) -g -O0 bug.c → "sum 1..5 = 15". -O2 -S 로 보면 sum_to 의 루프가 곱셈 식으로 바뀌고
 * total·i 는 DEBUG_VALUE undef(gdb 에서 <optimized out>), main 은 sum_to 를 부르지 않고 15 를 바로 printf 에 넘긴다.
 * gdb·valgrind·ASan 은 이 PC(Windows)에 없어 리포트 줄은 페이지 코드를 그대로 쓰고 주소·pid 는 예시로 표시한다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, spans, zone, sub, pill, banner, grow, fly, dot, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const typed = (u, a, b) => clamp((u - a) / (b - a));
  // 소스 보기: 줄 번호 + 코드. o.cur 현재 줄(화살표), o.bp 브레이크포인트 줄들, o.hi 강조 줄들, o.bpS 점 크기
  function src(x, y, w, from, lines, o) { o = o || {}; const lh = o.lh || 24, h = 40 + lines.length * lh;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 });
    mono(x + 14, y + 24, o.name || 'bug.c', { 'font-size': 15, 'font-weight': 800 });
    el('line', { x1: x, y1: y + 34, x2: x + w, y2: y + 34, stroke: GRID, 'stroke-width': 1.5 });
    lines.forEach((s, i) => { const n = from + i, yy = y + 56 + i * lh, hi = o.hi && o.hi.includes(n), cur = o.cur === n;
      if (hi || cur) el('rect', { x: x + 4, y: yy - 17, width: w - 8, height: lh - 2, rx: 4, fill: cur ? (o.curBg || WARNBG) : ACCBG });
      if (o.bp && o.bp.includes(n)) el('circle', { cx: x + 14, cy: yy - 5, r: 6 * (o.bpS ?? 1), fill: BAD });
      mono(x + 46, yy, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      mono(x + 58, yy, s, { 'font-size': 14, fill: INK, 'font-weight': cur ? 700 : null });
      if (cur) tx(x + w - 12, yy, '◀ 멈춤', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'end' }); });
    return { h, y: (n) => y + 56 + (n - from) * lh - 5 }; }
  // 콜스택: frames 위가 #0. 아래에서 위로 쌓인다
  function stack(x, y, w, frames, o) { o = o || {}; const fh = o.fh || 44;
    tx(x, y - 10, o.title || '콜스택', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    frames.forEach((f, i) => { const yy = y + i * (fh + 6), s = f.s ?? 1; if (s <= 0) return;
      const col = f.bad ? BAD : f.sel ? INFO : INK;
      card(x + w / 2, yy + fh / 2, w, fh, { rx: 8, stroke: col, fill: f.bad ? BADBG : f.sel ? INFOBG : PANEL, sw: f.sel || f.bad ? 2.5 : 1.8, s });
      if (s > 0.6) { mono(x + 12, yy + fh / 2 + 5, f.idx || '', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
        mono(x + 46, yy + fh / 2 + 5, f.fn, { 'font-size': 14.5, 'font-weight': 700, fill: col });
        if (f.at) mono(x + w - 12, yy + fh / 2 + 5, f.at, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } }); }
  function varBox(x, y, name, val, o) { o = o || {}; const w = o.w || 120;
    card(x + w / 2, y + 26, w, 52, { rx: 8, stroke: o.col || GRID, sw: o.col ? 2.5 : 1.5, fill: o.fill, s: o.s });
    tx(x + 12, y + 20, name, { 'font-size': 13.5, fill: MUT, 'font-weight': 700, class: 'mono' });
    mono(x + w - 12, y + 42, val, { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'end', fill: o.col && o.col !== GRID ? o.col : INK }); }
  // 바이트 칸 줄 (int 칸 n개). o.style(i) → {fill, stroke, text}
  function ints(x, y, n, o) { o = o || {}; const w = o.w || 50;
    for (let i = 0; i < n; i++) { const st = (o.style && o.style(i)) || {};
      el('rect', { x: x + i * w, y, width: w - 4, height: 44, rx: 4, fill: st.fill || PANEL, stroke: st.stroke || INK, 'stroke-width': st.sw || 2, 'stroke-dasharray': st.dash, opacity: st.op ?? 1 });
      if (st.text != null) mono(x + i * w + (w - 4) / 2, y + 28, st.text, { 'font-size': 14, 'text-anchor': 'middle', fill: st.col || INK, 'font-weight': 700, opacity: st.op ?? 1 });
      if (o.index) mono(x + i * w + (w - 4) / 2, y + 62, String(i), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: st.op ?? 1 }); } }
  function brace(x1, x2, y, s, col, op) { el('path', { d: `M${x1},${y} v-8 H${x2} v8`, fill: 'none', stroke: col || MUT, 'stroke-width': 2, opacity: op ?? 1 });
    tx((x1 + x2) / 2, y - 16, s, { 'font-size': 14, 'font-weight': 700, fill: col || MUT, 'text-anchor': 'middle', opacity: op ?? 1 }); }

  // ---------- 1. 디버그 빌드 ----------
  const SUM = [1, 3, 6, 10, 15];   // 실행으로 확인: i = 1..5 일 때 total
  function exe(x, y, w, name, dbg, o) { o = o || {}; const h = dbg ? 150 : 96;
    el('rect', { x, y, width: w, height: h, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    mono(x + 14, y + 24, name, { 'font-size': 15.5, 'font-weight': 800, opacity: o.op ?? 1 });
    el('rect', { x: x + 12, y: y + 36, width: w - 24, height: 44, rx: 6, fill: SOFT, stroke: GRID, opacity: o.op ?? 1 });
    tx(x + 24, y + 63, '기계어', { 'font-size': 14.5, 'font-weight': 700, opacity: o.op ?? 1 });
    if (dbg) { const s = o.dbgS ?? 1; el('rect', { x: x + 12, y: y + 88, width: (w - 24) * s, height: 50, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      if (s > 0.9) { tx(x + 24, y + 108, '디버그 정보', { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); tx(x + 24, y + 129, '주소 ↔ 줄 번호 · 변수 이름', { 'font-size': 13.5, fill: ACC }); } }
    return h; }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const sv = src(24, 24, 450, 4, ['int sum_to(int n) {', '    int total = 0;', '    for (int i = 1; i <= n; i++) {', '        total += i;', '    }', '    return total;'], { hi: [7] });
      pill(390, sv.y(7), '관찰 지점', ACC, pop(u, 0.4), { fs: 13.5 });
      note(530, 60, 'n = 5 일 때 total 이 쌓이는 모습', fade(u, 0.6));
      SUM.forEach((v, i) => { const s = clamp((u - 0.9) * 3 - i * 0.55); const x = 530 + i * 80;
        mono(x + 36, 104, 'i=' + (i + 1), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s > 0 ? 1 : 0.3 });
        card(x + 36, 140, 70, 48, { rx: 6, text: s > 0 ? String(v) : '', fs: 20, mono: true, stroke: s > 0 ? ACC : GRID, fill: s > 0 ? ACCBG : PANEL, color: ACC, s: s > 0 ? 0.7 + 0.3 * clamp(s) : 1 }); });
      tx(530, 214, '마지막 값 15 가 sum_to 의 반환값', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.4) });
      note(24, 300, '어느 줄에서, 어떤 변수를 볼지부터 정한다', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 1) { src(24, 24, 450, 12, ['int main(void) {', '    int n = 5;', '    int result = sum_to(n);', '    printf("sum 1..%d = %d\\n", n, result);'], { hi: [13, 14] });
      stack(560, 160, 360, [{ idx: '#0', fn: 'sum_to (n=5)', at: 'total · i', s: pop(u, 1.2), sel: true }, { idx: '#1', fn: 'main ()', at: 'n = 5 · result ?', s: pop(u, 0.4) }], { fh: 52 });
      grow(740, 270, 740, 220, E(u, 1.0, 1.4), ACC);
      tx(560, 330, '아래에서 위로 쌓인다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      note(24, 260, '콜스택 = main 위에 sum_to 한 칸', fade(u, 2.1), { fill: INFO }); return; }
    if (k === 2) { spans(24, 46, [['$ gcc ', { fill: MUT }], ['-g', { fill: ACC, 'font-weight': 800 }], [' ', {}], ['-O0', { fill: INFO, 'font-weight': 800 }], [' bug.c -o bug', {}]], { 'font-size': 17, opacity: fade(u, 0.1) });
      exe(24, 80, 330, 'bug', true, { dbgS: E(u, 0.5, 1.1) });
      tx(24, 262, '-O0 은 최적화를 꺼서 소스 한 줄이 실행 한 덩어리와 맞는다', { 'font-size': 14.5, fill: INFO, 'font-weight': 600, opacity: fade(u, 1.2) });
      // gdb 에서 보이는 것: -g 있음 / 없음
      [['-g 있음', GOOD, ['Breakpoint 1, sum_to (n=5) at bug.c:7', '(gdb) print total', '$1 = 0'], 1.3], ['-g 없음', BAD, ['Breakpoint 1, 0x… in sum_to ()', '(gdb) print total', 'No symbol "total" in current context.'], 1.9]].forEach(([h, col, ls, a], i) => {
        const y = 80 + i * 150, op = fade(u, a); note(396, y + 16, h, op, { fill: col });
        el('rect', { x: 396, y: y + 28, width: 540, height: 96, rx: 8, fill: INK, opacity: op });
        ls.forEach((s, j) => mono(410, y + 54 + j * 26, s, { 'font-size': 14, fill: j === 1 ? PANEL : col === BAD && j === 2 ? 'var(--badbg)' : 'var(--term)', opacity: op })); });
      tx(940, 404, '주소는 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); return; }
    if (k === 3) { spans(24, 46, [['$ gcc ', { fill: MUT }], ['-g', { fill: ACC, 'font-weight': 800 }], [' ', {}], ['-O2', { fill: WARN, 'font-weight': 800 }], [' bug.c -o bug_rel', {}]], { 'font-size': 17, opacity: fade(u, 0.1) });
      exe(24, 80, 330, 'bug_rel', true, {});
      pill(190, 260, '릴리스도 심볼은 남긴다', ACC, pop(u, 0.6), { fs: 14 });
      // 현장 크래시 → core → gdb
      card(470, 130, 120, 56, { rx: 8, text: '현장 크래시', fs: 14.5, stroke: BAD, color: BAD, s: pop(u, 0.9) });
      grow(532, 130, 602, 130, E(u, 1.1, 1.4), BAD);
      card(660, 130, 100, 56, { rx: 8, text: 'core', fs: 16, mono: true, fw: 800, s: pop(u, 1.4) });
      grow(712, 130, 772, 130, E(u, 1.6, 1.9), ACC);
      card(850, 130, 140, 56, { rx: 8, text: 'gdb 로 열기', fs: 14.5, stroke: ACC, color: ACC, s: pop(u, 1.9) });
      ok(470, 230, '함수 이름 · 줄 번호는 보인다', fade(u, 2.1));
      warnLine(470, 262, '지역 변수는 <optimized out> 일 수 있다', fade(u, 2.3)); return; }
    // k = 4: -O0 은 다섯 번 돌고, -O2 는 접힌다 (clang -O2 실측)
    note(24, 40, '-O0', fade(u, 0.1), { fill: INFO, 'font-size': 17 });
    for (let i = 0; i < 5; i++) card(140 + i * 112, 40 - 5, 100, 40, { rx: 6, text: `total += ${i + 1}`, fs: 14, mono: true, stroke: INFO, s: pop(u, 0.2 + i * 0.1) });
    tx(24, 84, '소스대로 다섯 번 돈다 · total 을 매번 볼 수 있다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) });
    note(24, 150, '-O2', fade(u, 1.0), { fill: WARN, 'font-size': 17 });
    const sq = E(u, 1.1, 1.8);
    for (let i = 0; i < 5; i++) card(lerp(140 + i * 112, 360, sq), 145, lerp(100, 300, sq), 40, { rx: 6, text: sq > 0.85 ? (i === 0 ? '곱셈 식 한 번 · 루프 없음' : '') : sq < 0.05 ? `total += ${i + 1}` : '', fs: 14, mono: sq <= 0.85, stroke: WARN, fill: sq > 0.85 ? WARNBG : PANEL, op: i === 0 ? 1 : 1 - sq });
    spans(24, 238, [['main', { 'font-weight': 800 }], ['  →  sum_to 호출 없이  ', { fill: MUT }], ['printf(…, 5, 15)', { 'font-weight': 700, fill: WARN }]], { 'font-size': 16, opacity: fade(u, 2.0) });
    card(250, 300, 450, 50, { rx: 8, stroke: BAD, fill: BADBG, text: '(gdb) print total  →  <optimized out>', fs: 15, mono: true, color: BAD, s: pop(u, 2.3) });
    tx(940, 404, 'clang -O2 로 확인한 결과', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) }); }
  const ok = (x, y, s, op) => { if (op <= 0) return; check(x + 7, y - 5, 7, op); tx(x + 22, y, s, { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: op }); };
  const warnLine = (x, y, s, op) => { if (op <= 0) return; cross(x + 7, y - 5, 6, op); tx(x + 22, y, s, { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: op }); };

  // ---------- 2. gdb 세션 ----------
  const GL = [ // [beat, 줄, 색]
    [0, '$ gcc -g -O0 bug.c -o bug'], [0, '$ gdb ./bug'],
    [1, '(gdb) break 7', 'p'], [1, 'Breakpoint 1 at 0x1161: file bug.c, line 7.'],
    [2, '(gdb) run', 'p'], [2, 'Breakpoint 1, sum_to (n=5) at bug.c:7'], [2, '7           total += i;'],
    [3, '(gdb) print total', 'p'], [3, '$1 = 0'],
    [4, '(gdb) watch total', 'p'], [4, 'Hardware watchpoint 2: total'],
    [5, '(gdb) continue', 'p'], [5, 'Hardware watchpoint 2: total'], [5, 'Old value = 0'], [5, 'New value = 1'],
    [6, '(… continue 몇 번 더 …)', 'm'], [6, '(gdb) bt', 'p'], [6, '#0  sum_to (n=5) at bug.c:7'], [6, '#1  main () at bug.c:14']];
  function s2(t, c) { const { k, u } = c;
    const mine = GL.filter((g) => g[0] < k), now = GL.filter((g) => g[0] === k);
    const shown = mine.length + now.length * typed(u, 0.15, 1.2) + 1e-6;
    terminal(20, 20, 440, 380, GL.filter((g) => g[0] <= k).map(([, s, m]) => [s, m === 'p' ? 'var(--panel)' : m === 'm' ? 'var(--muted)' : null]), shown, { title: 'gdb', fs: 13.5, lh: 21 });
    // 오른쪽: 소스 + 변수 + 콜스택
    const running = k >= 2, cur = running ? 7 : null;
    const sv = src(490, 20, 450, 4, ['int sum_to(int n) {', '    int total = 0;', '    for (int i = 1; ...) {', '        total += i;', '    }', '    return total;'],
      { bp: k >= 1 ? [7] : [], bpS: k === 1 ? pop(u, 0.4) : 1, cur, lh: 22 });
    if (k === 1) tx(940, 214, '주소 0x1161 은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.2) });
    const vy = 230, vals = !running ? ['—', '—', '—'] : k === 6 ? ['3', '3', '5'] : ['1', k === 5 ? (u > 1.3 ? '1' : '0') : '0', '5'];
    const tot = k === 5 ? (u > 1.3 ? 1 : 0) : null;
    [['i', 0], ['total', 1], ['n', 2]].forEach(([n, i]) => { const hot = (i === 1 && (k === 3 || k === 4 || k === 5));
      varBox(490 + i * 152, vy, n, vals[i], { w: 140, col: hot ? (k === 5 && tot ? BAD : ACC) : null, s: k === 2 ? pop(u, 1.0 + i * 0.15) : 1 }); });
    if (k === 3) fly(712, vy + 26, 200, 190, seg(u, 1.0, 1.9), '$1 = 0', { mono: true });
    if (k >= 4 && k <= 5) { const ex = 712, ey = vy - 12; el('ellipse', { cx: ex, cy: ey, rx: 16, ry: 9, fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: k === 4 ? fade(u, 0.8) : 1 }); el('circle', { cx: ex, cy: ey, r: 4.5, fill: ACC, opacity: k === 4 ? fade(u, 0.8) : 1 });
      tx(ex + 24, ey + 5, 'watch', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: k === 4 ? fade(u, 0.9) : 1 }); }
    if (k === 5) pill(712, vy + 72, 'Old 0 → New 1', BAD, pop(u, 1.4), { mono: true, fs: 13.5 });
    if (running) stack(490, 334, 450, k === 6 ? [{ idx: '#0', fn: 'sum_to (n=5)', at: 'bug.c:7', sel: true, s: pop(u, 1.4) }, { idx: '#1', fn: 'main ()', at: 'bug.c:14', s: pop(u, 1.8) }]
      : [{ idx: '#0', fn: 'sum_to (n=5)', at: 'bug.c:7', s: k === 2 ? pop(u, 1.6) : 1 }], { fh: 30, title: k === 6 ? '콜스택 (bt)' : '콜스택' });
    if (k === 0) { note(490, 330, '아직 실행 전 · (gdb) 프롬프트만 떠 있다', fade(u, 1.4), { fill: MUT }); } }

  // ---------- 3. 세그폴트 ----------
  const NX = [150, 310, 470], NY = 110;
  function nodes(o) { o = o || {};
    tx(40, NY - 52, 'head', { 'font-size': 14.5, 'font-weight': 700, class: 'mono' }); grow(58, NY - 44, 92, NY - 10, 1, INK);
    NX.forEach((x, i) => { card(x, NY, 120, 50, { rx: 8, stroke: INK, s: o.s ? o.s(i) : 1 });
      el('line', { x1: x + 20, y1: NY - 25, x2: x + 20, y2: NY + 25, stroke: GRID, 'stroke-width': 1.5 });
      tx(x - 20, NY + 6, 'value', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); tx(x + 40, NY + 6, 'next', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (i < 2) grow(x + 60, NY, NX[i + 1] - 62, NY, 1, INK); });
    grow(NX[2] + 60, NY, 588, NY, 1, BAD); mono(620, NY + 6, 'NULL', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
  function curAt(pos, col) { const x = pos < 3 ? NX[Math.floor(pos)] + (pos % 1) * 160 : 620, y = NY + 66;
    grow(x, y + 22, x, NY + 30, 1, col || INFO); mono(x, y + 42, 'cur', { 'font-size': 15, 'font-weight': 800, fill: col || INFO, 'text-anchor': 'middle' }); }
  const FR = [{ idx: '#0', fn: 'node_value (p=0x0)', at: 'list.c:5' }, { idx: '#1', fn: 'print_list (head=…)', at: 'list.c:18' }, { idx: '#2', fn: 'main ()', at: 'list.c:31' }];
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { // 코어 덤프
      mono(24, 46, '$ ulimit -c unlimited', { 'font-size': 16, opacity: fade(u, 0.1) });
      mono(24, 76, '$ ./list', { 'font-size': 16, opacity: fade(u, 0.3) });
      card(150, 170, 220, 70, { rx: 10, text: './list 프로세스', fs: 15, stroke: u > 0.9 ? BAD : INK, color: u > 0.9 ? BAD : INK, op: 1 - 0.5 * E(u, 1.2, 1.6) });
      if (u > 0.9) pill(150, 228, 'Segmentation fault (core dumped)', BAD, pop(u, 0.9), { fs: 13.5, mono: true });
      // 스냅샷: 스택·메모리를 그대로 파일로
      const sn = E(u, 1.2, 1.8); grow(270, 170, lerp(270, 380, sn), 170, sn, WARN);
      el('rect', { x: 390, y: 120, width: 170, height: 110, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 1.5) });
      mono(406, 146, 'core', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.5) });
      ['스택', '힙', '레지스터'].forEach((s, i) => tx(406, 172 + i * 20, '· ' + s, { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.6 + i * 0.1) }));
      mono(24, 300, '$ gdb ./list core', { 'font-size': 16, opacity: fade(u, 2.0) });
      stack(620, 100, 316, FR.map((f, i) => ({ ...f, bad: i === 0, s: pop(u, 2.1 + i * 0.12) })), { fh: 40, title: '죽은 순간의 콜스택' });
      tx(620, 300, 'gdb 밖에서 죽어도 그 순간을 다시 연다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.4) }); return; }
    nodes({ s: (i) => (k === 0 ? pop(u, 0.2 + i * 0.2) : 1) });
    if (k === 0) { curAt(0); note(24, 280, '$ gdb ./list  ·  아직 크래시 전', fade(u, 1.0)); tx(24, 310, 'gdb 아래에서는 죽는 순간 그 자리에 멈춘다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); return; }
    // 메모리 0x0 근처: 접근 금지
    const zoneOp = k === 1 ? fade(u, 1.4) : 1;
    el('rect', { x: 24, y: 330, width: 600, height: 56, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: zoneOp });
    mono(40, 364, '0x0 근처 · 어떤 프로그램도 쓸 수 없는 주소', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: zoneOp });
    const pos = k === 1 ? 3 * E(u, 0.1, 1.2) : 3; curAt(pos, pos >= 3 ? BAD : INFO);
    if (k === 1) { grow(620, NY + 120, 560, 326, E(u, 1.4, 1.8), BAD);
      mono(640, 250, 'p->value', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      banner(800, 52, 'SIGSEGV · list.c:5', pop(u, 1.9)); return; }
    // k ≥ 2: 콜스택
    const fr = FR.map((f, i) => ({ ...f, bad: i === 0, sel: k === 3 && i === 1, s: k === 2 ? pop(u, 0.3 + (2 - i) * 0.35) : 1 }));
    stack(660, 170, 280, fr, { fh: 40, title: '(gdb) bt' });
    if (k === 2) { note(660, 340, 'main → print_list → node_value', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    if (k === 3) { mono(660, 342, '(gdb) frame 1', { 'font-size': 14.5, opacity: fade(u, 0.3) });
      mono(660, 366, '(gdb) print cur', { 'font-size': 14.5, opacity: fade(u, 0.6) });
      mono(660, 390, '$1 = (Node *) 0x0', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      pill(800, 120, '진짜 원인은 #1', INFO, pop(u, 1.5), { fs: 14 }); return; }
    // k = 4: 조건부 브레이크 — p 가 NULL 일 때만 멈춘다
    el('rect', { x: 760, y: 60, width: 160, height: 46, rx: 8, fill: PANEL, stroke: WARN, 'stroke-width': 2.5 });
    mono(840, 89, 'if p == 0', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    tx(840, 46, 'break list.c:5', { 'font-size': 13.5, 'class': 'mono', fill: MUT, 'text-anchor': 'middle' });
    for (let i = 0; i < 6; i++) { const ph = clamp(u * 1.6 - i * 0.22); if (ph <= 0 || ph >= 1) continue;
      dot([[700, 83], [760, 83], [920, 83], [950, 83]], ph, GOOD, 6); }
    if (u > 2.0) { el('circle', { cx: 750, cy: 83, r: 8, fill: BAD }); tx(840, 130, 'p = NULL 인 순간만 멈춤', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); }
    else tx(840, 130, 'p ≠ NULL 이면 그냥 지나간다', { 'font-size': 14, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.5) }); }

  // ---------- 4. valgrind ----------
  const AX = 140;   // int 칸 시작
  function s4(t, c) { const { k, u } = c;
    tx(940, 24, 'pid ==12345== · 주소는 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (k === 0) { zone(24, 50, 912, 330, 'valgrind memcheck 아래에서 실행', { fill: SOFT, stroke: ACC, dash: '7 5', color: ACC });
      card(200, 210, 200, 80, { rx: 10, text: './leak\n(코드는 그대로)', fs: 15, s: pop(u, 0.3) });
      card(720, 210, 220, 80, { rx: 10, text: '힙 메모리', fs: 15, s: pop(u, 0.5) });
      // 모든 읽기·쓰기가 검사대를 지난다
      el('rect', { x: 440, y: 180, width: 70, height: 60, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.8) });
      tx(475, 216, '검사', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      for (let i = 0; i < 4; i++) dot([[300, 210], [610, 210]], ((t * 0.6 + i / 4) % 1) * (u > 1 ? 1 : 0), ACC, 6);
      tx(480, 330, '읽기 · 쓰기 · malloc · free 를 하나하나 기록한다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k <= 2) { // 40바이트 블록 = int 10칸, arr[10] 은 바깥
      const wr = k === 1 ? Math.floor(clamp((u - 0.2) / 1.5) * 11) : 11;
      tx(AX, 70, 'int *arr = malloc(40);', { 'font-size': 15, class: 'mono', 'font-weight': 700 });
      ints(AX, 110, 11, { index: true, style: (i) => i < 10 ? { fill: i < wr ? ACCBG : PANEL, stroke: ACC } : { dash: '5 4', stroke: i < wr ? BAD : OFF, fill: i < wr ? BADBG : 'none', text: i < wr ? '!' : '', col: BAD } });
      brace(AX, AX + 496, 100, k === 2 ? '할당한 블록 40바이트' : 'arr[0] ~ arr[9]', ACC, 1);
      if (wr >= 11) { mono(AX + 523, 200, 'arr[10] = …', { 'font-size': 14.5, fill: BAD, 'font-weight': 800, 'text-anchor': 'middle' }); }
      const rep = k === 1 ? fade(u, 1.8) : 1;
      el('rect', { x: 24, y: 236, width: 912, height: k === 2 ? 150 : 86, rx: 8, fill: INK, opacity: rep });
      mono(40, 264, '==12345== Invalid write of size 4', { 'font-size': 14.5, fill: 'var(--badbg)', 'font-weight': 700, opacity: rep });
      mono(40, 290, '==12345==    at main (arr.c:6)', { 'font-size': 14.5, fill: 'var(--term)', opacity: rep });
      if (k === 1) { tx(940, 390, '당장은 아무 일 없이 넘어가는 쓰기다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.2) }); return; }
      mono(40, 316, '==12345==  Address 0x.. is 0 bytes after a block of size 40', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 0.3) });
      mono(40, 342, '==12345==    by main (arr.c:4)', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.9) });
      el('path', { d: `M${AX + 500},164 q 0,30 -40,30`, fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.6) });
      tx(AX + 450, 198, '0 bytes after', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 0.6) });
      pill(830, 342, '오류 줄 + 할당 줄', ACC, pop(u, 1.6), { fs: 14 }); return; }
    if (k === 3) { // dup_name 이 만든 40바이트를 가리키던 포인터가 사라진다
      const gone = E(u, 0.9, 1.5);
      card(170, 120, 230, 96, { rx: 10, stroke: gone > 0.5 ? OFF : INK, op: 1 - 0.6 * gone, dash: gone > 0.5 ? '5 4' : null });
      mono(70, 96, 'dup_name()', { 'font-size': 15, 'font-weight': 800, opacity: 1 - 0.6 * gone });
      mono(70, 134, 'char *p', { 'font-size': 15, opacity: 1 - 0.6 * gone });
      if (gone < 0.5) grow(230, 128, 470, 128, 1, INK);
      else { cross(350, 128, 9, 1); tx(170, 196, '함수가 끝나 p 가 사라짐', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); }
      ints(480, 106, 10, { w: 44, style: () => ({ fill: gone > 0.8 ? BADBG : ACCBG, stroke: gone > 0.8 ? BAD : ACC }) });
      brace(480, 916, 96, 'leak.c:9 에서 malloc 한 40바이트', gone > 0.8 ? BAD : ACC, 1);
      if (u > 1.6) { el('rect', { x: 24, y: 250, width: 912, height: 110, rx: 8, fill: INK });
        mono(40, 278, '==12345== HEAP SUMMARY:', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700 });
        mono(40, 304, '==12345==   in use at exit: 40 bytes in 1 blocks', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 1.8) });
        mono(40, 330, '==12345== 40 bytes in 1 blocks are definitely lost', { 'font-size': 14.5, fill: 'var(--badbg)', 'font-weight': 700, opacity: fade(u, 2.0) });
        mono(40, 352, '==12345==    by dup_name (leak.c:9)', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 2.2) }); }
      if (gone > 0.8) tx(700, 196, '아무도 가리키지 않는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle' }); return; }
    // k = 4: 집계 — 오류 2건, 각각 짝지은 줄
    mono(480, 80, 'ERROR SUMMARY: 2 errors from 2 contexts', { 'font-size': 19, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.2) });
    [['Invalid write', 'arr.c:6', 'malloc · arr.c:4', BAD], ['definitely lost 40 bytes', '—', 'malloc · leak.c:9', WARN]].forEach(([a, l, b, col], i) => {
      const y = 160 + i * 100, s = pop(u, 0.6 + i * 0.5);
      card(220, y, 330, 60, { rx: 10, text: a + (l !== '—' ? '\n' + l : ''), fs: 15, stroke: col, color: col, s, mono: true });
      grow(390, y, 560, y, E(u, 0.9 + i * 0.5, 1.4 + i * 0.5), col);
      card(700, y, 260, 60, { rx: 10, text: '할당한 줄\n' + b, fs: 15, stroke: INK, s: pop(u, 1.3 + i * 0.5), mono: true }); });
    tx(480, 390, '추측 대신 어디서 넘쳤고 어디서 샜는지가 줄 번호로 남는다', { 'font-size': 15, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); }

  // ---------- 5. ASan · assert ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 2) { const RZ = 3;
      if (k === 0) { spans(24, 46, [['$ gcc -g ', { fill: MUT }], ['-fsanitize=address', { fill: ACC, 'font-weight': 800 }], [' bug.c -o bug', {}]], { 'font-size': 17, opacity: fade(u, 0.1) }); }
      // 블록 양옆 빨간 경계 칸(redzone)
      const x0 = 190, w = 50, rz = k === 0 ? E(u, 0.8, 1.4) : 1;
      for (let i = 0; i < RZ; i++) { el('rect', { x: x0 - (RZ - i) * w, y: 110, width: w - 4, height: 44, rx: 4, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: rz * (k === 0 ? 1 : 1) });
        el('rect', { x: x0 + (10 + i) * w, y: 110, width: w - 4, height: 44, rx: 4, fill: k >= 1 && i === 0 ? BAD : BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: rz }); }
      ints(x0, 110, 10, { style: () => ({ fill: ACCBG, stroke: ACC }) });
      brace(x0, x0 + 496, 100, '40바이트 블록', ACC, 1);
      tx(x0 + 10 * w + 70, 188, '경계 칸', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: rz });
      if (k === 0) { tx(24, 240, '컴파일러가 메모리 접근마다 검사 코드를 끼워 넣는다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) });
        // 느려지는 정도 (페이지 설명의 값)
        [['ASan', '2~3배', 0.12, ACC], ['valgrind', '수십 배', 0.85, WARN]].forEach(([n, v, f, col], i) => { const y = 290 + i * 44;
          tx(24, y + 14, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7 + i * 0.2) });
          el('rect', { x: 130, y, width: Math.max(2, 600 * f * E(u, 1.8 + i * 0.2, 2.5)), height: 20, rx: 4, fill: col });
          mono(140 + 600 * f, y + 15, v + ' 느려짐', { 'font-size': 14, 'font-weight': 700, fill: col, opacity: fade(u, 2.3) }); });
        tx(24, 398, 'valgrind 와 달리 따로 실행할 도구가 필요 없다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.4) }); return; }
      const hit = k === 1 ? u > 0.8 : true;
      mono(x0 + 10 * w + 23, 82, 'arr[10]', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: hit ? 1 : 0 });
      if (k === 1) { dot([[x0 + 10 * w + 23, 20], [x0 + 10 * w + 23, 112]], seg(u, 0.2, 0.8), BAD, 7);
        if (hit) { el('polygon', { points: '860,70 880,50 908,50 928,70 928,98 908,118 880,118 860,98', fill: BAD, opacity: pop(u, 0.8) }); tx(894, 90, 'STOP', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'middle', opacity: fade(u, 0.9) }); } }
      el('rect', { x: 24, y: 220, width: 912, height: k === 2 ? 170 : 96, rx: 8, fill: INK, opacity: k === 1 ? fade(u, 1.1) : 1 });
      mono(40, 248, '==9901==ERROR: AddressSanitizer: heap-buffer-overflow', { 'font-size': 14.5, fill: 'var(--badbg)', 'font-weight': 700, opacity: k === 1 ? fade(u, 1.2) : 1 });
      mono(40, 274, 'WRITE of size 4 at 0x60200000 thread T0', { 'font-size': 14.5, fill: 'var(--term)', opacity: k === 1 ? fade(u, 1.5) : 1 });
      mono(40, 300, '    #0 0x.. in main bug.c:6', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: k === 1 ? fade(u, 1.8) : 1 });
      if (k === 1) { tx(940, 404, '넘친 그 순간 멈춘다 · 주소는 예시', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.2) }); return; }
      mono(40, 330, '0x60200000 is located 0 bytes after 40-byte region', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 0.3) });
      mono(40, 356, '    allocated by thread T0 here:', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 0.6) });
      mono(40, 380, '    #1 0x.. in main bug.c:4', { 'font-size': 14.5, fill: PANEL, 'font-weight': 700, opacity: fade(u, 0.9) });
      pill(790, 380, '넘친 곳 + 만든 곳', ACC, pop(u, 1.6), { fs: 14 }); return; }
    if (k <= 4) { // assert: 가정이 참일 때 통과, 깨지면 그 자리에서 멈춘다
      const broken = k === 4;
      card(110, 120, 140, 56, { rx: 8, stroke: broken ? BAD : INK, s: k === 3 ? pop(u, 0.2) : 1 });
      mono(60, 126, 'ptr', { 'font-size': 16, 'font-weight': 800 });
      mono(150, 126, broken ? 'NULL' : '0x…', { 'font-size': 15, 'font-weight': 700, fill: broken ? BAD : INK, 'text-anchor': 'middle' });
      if (!broken) { grow(180, 120, 260, 120, E(u, 0.5, 0.9), ACC); ints(270, 98, 4, { w: 40, style: () => ({ fill: ACCBG, stroke: ACC }) }); }
      // 게이트
      const gx = 520; el('rect', { x: gx, y: 70, width: 220, height: 100, rx: 10, fill: broken ? BADBG : GOODBG, stroke: broken ? BAD : GOOD, 'stroke-width': 2.5, opacity: k === 3 ? fade(u, 0.8) : 1 });
      mono(gx + 110, 112, 'assert(ptr != NULL)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: broken ? BAD : GOOD, opacity: k === 3 ? fade(u, 0.9) : 1 });
      if (!broken) { ok(gx + 50, 150, '참 · 그대로 진행', fade(u, 1.4)); tx(24, 260, '주석 대신 코드가 가정을 검사한다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
        tx(24, 290, '도구가 못 잡는 논리 가정에 쓴다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) }); return; }
      cross(gx + 110, 146, 10, pop(u, 0.4));
      // 뒤따를 일들이 일어나지 않는다
      ['다음 계산', '파일 저장', '응답 전송'].forEach((s, i) => card(820, 80 + i * 50, 150, 40, { rx: 8, text: s, fs: 14, stroke: OFF, color: OFF, dash: '5 4', op: fade(u, 1.2 + i * 0.15) }));
      el('rect', { x: 24, y: 240, width: 912, height: 80, rx: 8, fill: INK, opacity: fade(u, 0.7) });
      mono(40, 270, "app: bug.c:12: main: Assertion `ptr != NULL' failed.", { 'font-size': 14.5, fill: 'var(--badbg)', 'font-weight': 700, opacity: fade(u, 0.8) });
      mono(40, 298, 'Aborted (core dumped)', { 'font-size': 14.5, fill: 'var(--term)', opacity: fade(u, 1.0) });
      tx(24, 360, '파일 · 줄 · 조건식이 찍히고, 잘못된 상태가 더 퍼지기 전에 멈춘다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); return; }
    // k = 5: -DNDEBUG 로 릴리스에서 assert 제거 + 도구별 쓰임
    [['개발 빌드', 'gcc -g -fsanitize=address app.c', true], ['릴리스 빌드', 'gcc -O2 -DNDEBUG app.c', false]].forEach(([h, cmd, on], i) => { const x = 24 + i * 470;
      note(x, 46, h, fade(u, 0.2 + i * 0.4), { fill: on ? INFO : ACC });
      mono(x, 76, cmd, { 'font-size': 14.5, opacity: fade(u, 0.3 + i * 0.4) });
      card(x + 210, 124, 420, 44, { rx: 8, text: 'assert(ptr != NULL);', fs: 15, mono: true, stroke: on ? GOOD : OFF, color: on ? GOOD : OFF, dash: on ? null : '5 4', s: pop(u, 0.5 + i * 0.4) });
      if (!on && u > 1.2) { el('line', { x1: x + 20, y1: 124, x2: x + 400, y2: 124, stroke: BAD, 'stroke-width': 2.5 }); tx(x + 210, 168, '통째로 빠진다 · 검사 비용 0', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, 'text-anchor': 'middle' }); } });
    [['printf', '빠른 감 잡기'], ['gdb', '멈춰서 정밀 추적'], ['valgrind · ASan', '메모리 오류 자동 고발'], ['assert', '가정을 코드로']].forEach(([a, b], i) => { const x = 128 + i * 236, s = pop(u, 1.4 + i * 0.15);
      card(x, 300, 216, 74, { rx: 10, stroke: INK, s }); mono(x, 294, a, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5 + i * 0.15) });
      tx(x, 318, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5 + i * 0.15) }); }); }

  // ---------- 6. 실무 루틴 ----------
  const ROUT = [['gcc -g -O0', '빌드'], ['gdb → bt', '세그폴트'], ['break · print · watch', '관찰'], ['valgrind · ASan', '메모리'], ['assert', '가정 고정']];
  const FAIL = [['-g 없이 gdb', '줄·변수가 안 보인다'], ['printf 로 추측', '원인을 짐작만'], ['-O2 로 디버깅', 'optimized out'], ['메모리 오류 방치', '눈으로는 못 잡음'], null];
  function s6(t, c) { const { k, u } = c;
    const X = (i) => 110 + i * 185, Y = 120;
    el('line', { x1: X(0), y1: Y, x2: X(4), y2: Y, stroke: GRID, 'stroke-width': 4, 'stroke-linecap': 'round' });
    if (k > 0) el('line', { x1: X(0), y1: Y, x2: lerp(X(k - 1), X(k), E(u, 0.1, 0.7)), y2: Y, stroke: ACC, 'stroke-width': 4, 'stroke-linecap': 'round' });
    ROUT.forEach(([cmd, h], i) => { const on = i <= k, now = i === k, s = now ? pop(u, 0.5) : 1;
      el('circle', { cx: X(i), cy: Y, r: 20 * (on ? s : 1), fill: on ? ACC : PANEL, stroke: on ? ACC : GRID, 'stroke-width': 3 });
      mono(X(i), Y + 6, String(i + 1), { 'font-size': 16, 'font-weight': 800, fill: on ? PANEL : MUT, 'text-anchor': 'middle' });
      tx(X(i), Y - 36, h, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? INK : OFF });
      mono(X(i), Y + 52, cmd, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: on ? ACC : OFF, opacity: now ? fade(u, 0.6) : 1 });
      const f = FAIL[i]; if (!f || i > k) return; const fs = now ? pop(u, 1.2) : 1;
      card(X(i), 250, 170, 70, { rx: 10, stroke: BAD, fill: BADBG, s: fs });
      if (fs > 0.6) { tx(X(i), 246, f[0], { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', 'text-decoration': 'line-through' }); tx(X(i), 268, f[1], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
      grow(X(i), 212, X(i), Y + 64, now ? E(u, 1.5, 1.9) : 1, BAD, { dash: '4 4' }); });
    const msg = ['디버그 정보가 없으면 시작부터 막힌다', 'bt 한 번이면 크래시 줄이 사실로 나온다', '멈춘 자리에서 예상 못 한 변수까지 본다', '잠복 메모리 버그는 도구에게 맡긴다', '같은 버그가 다시 오면 그 자리에서 걸린다'][k];
    tx(480, 380, msg, { 'font-size': 16, 'font-weight': 700, fill: k === 4 ? ACC : INK, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  const quiz = [
    { q: '-g 없이 빌드한 프로그램을 gdb로 열고 print total을 치면 어떻게 되는가?',
      o: ['$1 = 0이 그대로 나온다', 'No symbol "total" in current context.가 나온다', 'gdb가 자동으로 -g를 붙여 다시 빌드한다'], a: 1,
      why: '-g가 넣는 디버그 정보에 변수 이름과 줄 번호가 들어 있다. 그것이 없으면 gdb는 total이라는 이름을 모른다.' },
    { q: 'watch total을 건 뒤 continue하면 gdb는 언제 멈추는가?',
      o: ['total 값이 바뀌는 순간', '다음 줄로 넘어갈 때마다', '프로그램이 끝날 때'], a: 0,
      why: 'watchpoint는 값이 바뀌는 순간 멈추고 Old value = 0, New value = 1처럼 바뀌기 전후를 함께 보여 준다.' },
    { q: 'bt 결과가 #0 node_value (p=0x0), #1 print_list, #2 main일 때 NULL을 넘긴 곳을 확인하려면 무엇을 하는가?',
      o: ['list.c 맨 위에 printf를 심는다', 'frame 1로 올라가 print cur를 친다', 'run을 다시 한다'], a: 1,
      why: '터진 곳은 #0이지만 NULL을 넘긴 곳은 #1 print_list다. frame 1에서 cur를 찍으면 (Node *) 0x0이 보인다.' },
    { q: 'valgrind 리포트의 "0 bytes after a block of size 40"은 무슨 뜻인가?',
      o: ['40바이트 블록이 누수되었다', '40바이트 블록 바로 뒤를 건드렸다', '40바이트를 두 번 free했다'], a: 1,
      why: 'int 10칸(40바이트) 블록의 끝 바로 다음, 즉 arr[10]에 4바이트를 썼다는 뜻이다. 그 블록을 만든 줄 arr.c:4도 함께 나온다.' },
    { q: '-DNDEBUG를 붙여 릴리스 빌드를 하면 assert(ptr != NULL)은 어떻게 되는가?',
      o: ['검사가 더 엄격해진다', 'ptr이 NULL이면 경고만 찍는다', '코드에서 통째로 빠져 검사 비용이 없다'], a: 2,
      why: 'assert는 NDEBUG가 정의되면 아무 일도 하지 않는 식으로 바뀐다. 개발 중에만 안전망으로 쓰는 방식이다.' },
    { q: '현장 디버깅 루틴의 첫 단계는 무엇인가?',
      o: ['-g -O0로 빌드한다', 'printf를 의심 가는 곳마다 넣는다', '-O2로 빌드해 실제 속도에서 재현한다'], a: 0,
      why: '디버그 정보가 없으면 뒤의 bt·print·watch가 줄 번호와 변수를 보여 주지 못한다. -O0은 소스와 실행 순서를 맞춘다.' },
  ];

  const summary = [
    '-g를 빼고 빌드하면 gdb가 줄 번호와 변수 이름을 몰라 추적이 막힌다.',
    '-O2에서는 sum_to의 루프가 식 하나로 바뀌어 total을 볼 수 없다.',
    '세그폴트는 bt로 크래시 줄과 호출 경로를 보고, frame으로 올라가 원인을 확인한다.',
    'valgrind와 ASan은 넘친 줄과 그 메모리를 만든 줄을 함께 짚어 준다.',
  ];
  const review = [
    { q: '릴리스 서버에서 프로그램이 죽어 core 파일을 받았는데 gdb에 함수 이름과 주소만 보인다. 무엇이 빠졌을까?',
      o: ['-g 디버그 정보', '-fsanitize=address', 'ulimit -c unlimited'], a: 0,
      why: 'core 파일은 만들어졌으니 ulimit 문제는 아니다. 줄 번호와 변수를 보려면 그 실행 파일을 -g로 빌드해 두었어야 한다.' },
    { q: '반복 수만 번 중 가끔 NULL이 넘어와 죽는다. 매번 멈추지 않고 그 순간만 보려면?',
      o: ['watch p를 건다', 'break list.c:5 if p == 0을 건다', 'valgrind로 다시 돌린다'], a: 1,
      why: '조건부 브레이크는 조건이 참일 때만 멈춘다. p가 NULL이 되는 그 한 번에서 직전 상태를 볼 수 있다.' },
    { q: '테스트는 통과하는데 배포 후 가끔 엉뚱한 곳에서 죽는다. 먼저 해 볼 일은?',
      o: ['-O2를 -O3로 올린다', 'printf를 더 많이 넣는다', 'ASan 빌드나 valgrind로 테스트를 돌려 본다'], a: 2,
      why: '범위 밖 쓰기 같은 메모리 오류는 그 자리에서 터지지 않고 잠복한다. 도구가 처음 잘못 쓴 줄과 할당한 줄을 짚어 준다.' },
  ];

  R.page({ title: 'gdb·valgrind로 보는 프로그램 속', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
