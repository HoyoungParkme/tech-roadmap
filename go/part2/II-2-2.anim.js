/* II-2-2 sync — Mutex·WaitGroup · 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function gtok(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || ACC, r = o.r || 24;
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2.4 }, g);
    if (name) tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: col, class: 'mono' }, g);
    return g; }
  // 메모리 칸 하나: 이름 + 값
  function cell(cx, cy, name, val, o) { o = o || {};
    card(cx, cy, o.w || 130, o.h || 64, { rx: 10, stroke: o.col || INK, sw: 2.6, fill: o.fill || PANEL, s: o.s, op: o.op });
    mono(cx, cy + 9, String(val), { 'text-anchor': 'middle', 'font-size': o.fs || 26, 'font-weight': 800, fill: o.col || INK, opacity: o.op ?? 1 });
    if (name) mono(cx, cy - (o.h || 64) / 2 - 10, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.ncol || INK, opacity: o.op ?? 1 }); }
  const GXS = [180, 380, 580, 780];

  // ---------- 1. 레이스 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) {
      cell(480, 120, 'counter', 0, { s: k === 0 ? pop(u, 0.2) : 1 });
      card(800, 120, 150, 44, { rx: 12, stroke: INFO, sw: 2, fill: INFOBG, text: 'done chan bool', fs: 14, mono: true, color: INFO, s: k === 0 ? pop(u, 0.7) : 1 });
      if (k === 0) { tx(480, 260, '혼자 쓰는 변수 하나는 아무 문제가 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) }); return; }
      GXS.forEach((x, i) => { const s = pop(u, 0.2 + i * 0.2); gtok(x, 300, 'G' + (i + 1), { r: 26, s });
        const g = seg(u, 0.8 + i * 0.15, 1.4 + i * 0.15); if (g > 0) el('line', { x1: x, y1: 272, x2: lerp(x, 480, g), y2: lerp(272, 154, g), stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '5 4' }); });
      tx(480, 380, '넷이 같은 주소를 동시에 만진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
      return; }
    if (k === 2) { // 읽기 → +1 → 쓰기 가 섞이는 순간 (값은 예시)
      tx(40, 46, 'counter++ = 읽기 → +1 → 쓰기 (값은 예시)', { 'font-size': 16, 'font-weight': 800 });
      const xs = [250, 370, 490, 610, 730, 850];
      const ev = [[0, '읽기 41'], [1, '읽기 41'], [0, '+1 → 42'], [1, '+1 → 42'], [0, '쓰기 42'], [1, '쓰기 42']], mem = [41, 41, 41, 41, 42, 42];
      tx(150, 126, 'G1', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC, 'text-anchor': 'end' }); tx(150, 196, 'G2', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO, 'text-anchor': 'end' });
      tx(150, 276, '메모리', { 'font-size': 15, 'font-weight': 700, fill: MUT, 'text-anchor': 'end' });
      ev.forEach(([g, s], i) => { const a = pop(u, 0.2 + i * 0.3); if (a <= 0) return; const col = g ? INFO : ACC;
        card(xs[i], g ? 190 : 120, 108, 40, { rx: 8, stroke: col, sw: 2, fill: g ? INFOBG : ACCBG, s: a, text: s, fs: 14, color: col, fw: 700 });
        cell(xs[i], 270, null, mem[i], { w: 70, h: 44, fs: 18, s: a, col: i >= 4 ? (i === 5 ? BAD : INK) : MUT }); });
      if (u > 2.1) { cross(xs[5] + 50, 270, 11, pop(u, 2.1)); tx(480, 360, '두 번 올렸는데 한 번만 반영됐다. 기대는 43', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); }
      return; }
    if (k === 3) { // 전원 완주 후 결과
      GXS.forEach((x, i) => { gtok(x - 60, 90, 'G' + (i + 1), { r: 20 }); hbar(x - 30, 80, 110, 25, 25, { u: E(u, 0.1 + i * 0.1, 1.0 + i * 0.1), h: 18, label: false }); });
      mono(480, 140, 'done 4번 수신 · 전원 완주', { 'text-anchor': 'middle', 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.1) });
      tx(140, 214, '기대', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(140, 264, '출력 예', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: BAD });
      const g = E(u, 1.2, 2.2);
      hbar(160, 198, 600, 100 * g, 100, { col: GOOD, h: 24, text: '100' }); hbar(160, 248, 600, 87 * g, 100, { col: BAD, h: 24, text: '87' });
      tx(480, 330, '값은 실행마다 다르고, 100이 나올 때도 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) });
      tx(480, 362, '완주를 기다리는 일과 값을 지키는 일은 다른 문제다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.4) });
      return; }
    // k === 4: -race
    terminal(80, 60, 800, 250, ['$ go run -race race.go', '==================', ['WARNING: DATA RACE', '#f87171'], 'Read at 0x00c00001… by goroutine 8:   (주소·번호는 예시)', 'Previous write at 0x00c00001… by goroutine 7:', '==================', 'exit status 66'], lerp(0, 7, E(u, 0.2, 2.0)), { lh: 26 });
    tx(480, 360, '가끔만 틀리는 버그를 런타임이 잡아 준다. CI에서 go test -race를 돌린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.2) }); }

  // ---------- 2. Mutex ----------
  function room(locked, op) { el('rect', { x: 380, y: 60, width: 200, height: 200, rx: 14, fill: locked ? ACCBG : SOFT, stroke: locked ? ACC : GRID, 'stroke-width': 2.6, opacity: op ?? 1 });
    tx(480, 84, '임계 구역', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op ?? 1 });
    el('rect', { x: 372, y: 160, width: 16, height: 70, rx: 3, fill: locked ? ACC : PANEL, stroke: locked ? ACC : GRID, 'stroke-width': 2 }); lock(380, 140, locked, locked ? ACC : MUT, 1); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { cell(480, 160, 'counter', 0); lock(620, 160, false, MUT, pop(u, 0.3)); mono(660, 166, 'var mu sync.Mutex', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5) });
      tx(480, 300, '제로값이 그대로 쓸 수 있는 자물쇠다. 아직 잠그지 않았다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
    if (k === 3) { // 결과
      tx(140, 150, '실행 1', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(140, 200, '실행 2', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); tx(140, 250, '실행 3', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' });
      [0, 1, 2].forEach((i) => hbar(160, 134 + i * 50, 600, 100, 100, { col: GOOD, h: 24, u: E(u, 0.2 + i * 0.3, 1.0 + i * 0.3), text: '100' }));
      tx(480, 330, '몇 번을 돌려도 언제나 100, race 경고도 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) }); return; }
    room(true);
    // 누가 안에 있는가: k=1 은 G1 고정, k=2 는 시간에 따라 돌아가며
    const inside = k === 1 ? 0 : Math.floor(t * 1.6) % 4, val = k === 1 ? 0 : Math.round(100 * E(u, 0.2, 2.6));
    cell(480, 210, 'counter', val, { w: 110, h: 54, fs: 22 });
    gtok(480, 124, 'G' + (inside + 1), { r: 20, s: k === 1 ? pop(u, 0.3) : 1 });
    const q = [0, 1, 2, 3].filter((i) => i !== inside);
    q.forEach((g, j) => { gtok(300 - j * 64, 190, 'G' + (g + 1), { r: 22, col: MUT, fill: SOFT, s: k === 1 ? pop(u, 0.6 + j * 0.2) : 1 }); });
    tx(236, 240, '문 앞에서 대기', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: k === 1 ? fade(u, 1.2) : 1 });
    mono(480, 300, k === 1 ? 'mu.Lock()  먼저 온 하나만 들어간다' : 'Lock → counter++ → Unlock → 다음 차례', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
    tx(480, 340, k === 1 ? '나머지 셋은 이 줄에서 멈춰 기다린다' : '겹침이 없으니 유실도 없다. 안에서는 짧게 끝낸다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); }

  // ---------- 3. RWMutex ----------
  function s3(t, c) { const { k, u } = c;
    card(480, 70, 330, 64, { rx: 10, stroke: INK, sw: 2.2, s: k === 0 ? pop(u, 0.2) : 1 });
    mono(330, 64, 'Cache { mu sync.RWMutex', { 'font-size': 15, 'font-weight': 800, opacity: k === 0 ? fade(u, 0.4) : 1 }); mono(330, 88, '        data map[string]string }', { 'font-size': 14.5, fill: MUT, opacity: k === 0 ? fade(u, 0.6) : 1 });
    if (k === 0) { tx(480, 200, '자물쇠를 지키는 데이터 바로 옆에 둔다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.2) }); return; }
    const MX = 640, my = 250;
    card(MX, my, 150, 120, { rx: 12, stroke: k === 2 ? BAD : ACC, sw: 2.6, fill: k === 2 ? BADBG : ACCBG });
    mono(MX, my - 34, 'data', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: k === 2 ? BAD : ACC });
    ['k1', 'k2', 'k3'].forEach((x, i) => mono(MX, my - 6 + i * 22, x + ': …', { 'text-anchor': 'middle', 'font-size': 14, fill: INK }));
    const ry = [150, 200, 250, 300, 350];
    if (k === 1 || k === 3) { ry.forEach((y, i) => { gtok(90, y, 'R' + (i + 1), { r: 18, s: k === 1 ? pop(u, 0.2 + i * 0.1) : 1 });
        el('line', { x1: 110, y1: y, x2: MX - 76, y2: my - 40 + i * 20, stroke: GOOD, 'stroke-width': 1.6, opacity: 0.35 });
        dot([[110, y], [MX - 76, my - 40 + i * 20]], ((t * 0.7 + i * 0.13 + 0.5) % 1), GOOD, 6);
        dot([[110, y], [MX - 76, my - 40 + i * 20]], ((t * 0.7 + i * 0.13) % 1), GOOD, 6); });
      mono(330, 400, k === 1 ? 'RLock: 다섯이 동시에 읽는다' : '읽기 위주일 때만 이득이다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.8) }); }
    if (k === 3) tx(860, 400, '쓰기가 잦으면 그냥 Mutex', { 'text-anchor': 'end', 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
    if (k === 2) { ry.forEach((y, i) => { gtok(90, y, 'R' + (i + 1), { r: 18, col: MUT, fill: SOFT }); });
      el('line', { x1: 200, y1: 130, x2: 200, y2: 370, stroke: BAD, 'stroke-width': 4, opacity: fade(u, 0.5) }); tx(214, 380, '모든 Get 대기', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.7) });
      const a = seg(u, 0.3, 1.2); gtok(lerp(900, MX + 110, E(a, 0, 1)), my, 'W', { r: 22, col: BAD, fill: BADBG });
      if (a >= 1) { lock(MX + 60, my - 76, true, BAD, pop(u, 1.2)); mono(MX, my + 92, 'Lock: Set 혼자 독점', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); } } }

  // ---------- 4. WaitGroup ----------
  function s4(t, c) { const { k, u } = c;
    const n = k === 0 ? 0 : k === 1 ? Math.round(lerp(0, 4, E(u, 0.3, 1.8))) : k === 2 ? 4 - Math.floor(lerp(0, 4.999, E(u, 0.3, 2.4))) : 0;
    const nn = Math.max(0, n);
    cell(160, 130, 'wg 카운터', nn, { col: nn ? WARN : GOOD, fill: nn ? WARNBG : GOODBG });
    if (k === 0) { lock(160, 260, false, MUT, pop(u, 0.6)); mono(190, 266, 'mu sync.Mutex', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.7) });
      tx(560, 140, 'WaitGroup은 언제 끝났나를 센다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); tx(560, 270, 'Mutex는 누가 만지나를 정한다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.4) }); return; }
    // 일꾼 4개: 진행 막대 (끝나는 순서·시각은 예시)
    const fin = [0.9, 1.5, 1.9, 2.4];
    GXS.forEach((x, i) => { const y = 100 + i * 62, s = k === 1 ? pop(u, 0.4 + i * 0.35) : 1;
      gtok(360, y, 'G' + (i + 1), { r: 20, s });
      const p = k === 1 ? 0 : k === 2 ? E(u, 0.2, fin[i]) : 1;
      hbar(396, y - 9, 300, 25 * p, 25, { h: 18, label: false, col: p >= 1 ? GOOD : ACC });
      if (k >= 2 && p >= 1) mono(720, y + 5, 'Done', { 'font-size': 14.5, 'font-weight': 800, fill: GOOD }); });
    if (k === 1) mono(160, 220, 'wg.Add(1) × 4 (go 전에)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.5) });
    if (k === 2) mono(160, 220, 'defer wg.Done() → -1', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) });
    if (k >= 2) sub(760, 404, '끝나는 순서와 시각은 예시', 1);
    // main 과 Wait 문
    gtok(160, 330, 'main', { r: 26, col: INK, fill: SOFT });
    const open = k === 3 ? E(u, 0.2, 0.9) : 0;
    el('rect', { x: 210, y: 300 + 60 * open, width: 14, height: 60 * (1 - open), rx: 3, fill: k === 3 ? GOOD : WARN });
    mono(240, 324, 'wg.Wait()', { 'font-size': 15, 'font-weight': 800, fill: k === 3 ? GOOD : WARN });
    if (k === 3) { grow(186, 360, 300, 395, seg(u, 0.9, 1.4), GOOD); terminal(560, 312, 330, 70, [['100', null]], lerp(0, 1, E(u, 1.3, 1.9)), {}); } }

  // ---------- 5. Once · atomic ----------
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) {
      cell(720, 110, 'once', k === 1 && u > 1.6 ? 'done' : '아직', { w: 140, fs: 18, col: k === 1 && u > 1.6 ? GOOD : MUT });
      cell(720, 260, 'conn *DB', k === 1 && u > 1.6 ? '0xc0…' : 'nil', { w: 140, fs: 18, col: k === 1 && u > 1.6 ? ACC : MUT });
      if (k === 1 && u > 1.6) sub(720, 314, '주소는 예시', 1);
      if (k === 0) { tx(300, 200, '패키지 변수 두 개, 아직 연결은 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.8) }); return; }
      [0, 1, 2, 3].forEach((i) => { const y = 90 + i * 70, first = i === 1;
        gtok(110, y, 'G' + (i + 1), { r: 20, s: pop(u, 0.1 + i * 0.05) }); mono(140, y + 5, 'GetDB()', { 'font-size': 14, fill: MUT });
        if (first) { card(380, y, 170, 40, { rx: 8, text: 'connect() 1회', fs: 14.5, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.4) }); hbar(300, y + 24, 160, 1, 1, { u: E(u, 0.4, 1.6), h: 6, label: false }); }
        else { const wait = u < 1.6; mono(330, y + 5, wait ? '기다린다…' : '완성된 conn을 받는다', { 'font-size': 14, fill: wait ? WARN : GOOD, 'font-weight': 700 }); } });
      tx(480, 396, '여럿이 동시에 불러도 안쪽 함수는 딱 한 번만 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
      return; }
    // atomic: 잠금 없이 +1 이 꽂힌다
    const hits = k === 2 ? Math.floor(lerp(0, 8, E(u, 0.3, 2.2))) : 8;
    cell(600, 190, 'hits int64', hits, { col: ACC, fill: ACCBG });
    [0, 1, 2, 3].forEach((i) => { const y = 100 + i * 60; gtok(150, y, 'G' + (i + 1), { r: 20 });
      if (k === 2) for (let j = 0; j < 2; j++) { const a = seg(u, 0.3 + (j * 4 + i) * 0.23, 0.8 + (j * 4 + i) * 0.23); if (a > 0 && a < 1) fly(180, y, 530, 190, a, '+1', { mono: true }); } });
    if (k === 2) { mono(340, 380, 'atomic.AddInt64(&hits, 1) · 자물쇠 없음', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) }); sub(600, 250, '그림의 +1 개수만 센다', fade(u, 2.2)); return; }
    // k === 3: 읽기도 atomic
    gtok(860, 130, 'R', { r: 22, col: GOOD, fill: GOODBG }); grow(836, 140, 670, 176, seg(u, 0.3, 0.9), GOOD);
    mono(860, 90, 'LoadInt64(&hits) → 8', { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
    gtok(860, 290, 'R', { r: 22, col: BAD, fill: BADBG, s: pop(u, 1.2) }); grow(836, 280, 670, 204, seg(u, 1.4, 1.9), BAD);
    mono(860, 340, 'return hits  ← 이것도 race', { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
    if (u > 2.0) cross(760, 245, 11, pop(u, 2.0)); }

  // ---------- 6. 채널 vs Mutex ----------
  function s6(t, c) { const { k, u } = c;
    if (k <= 1) {
      card(260, 170, 260, 140, { rx: 12, stroke: ACC, sw: 2.6, fill: ACCBG, s: k === 0 ? pop(u, 0.2) : 1 });
      mono(160, 124, 'Counter', { 'font-size': 16, 'font-weight': 800, fill: ACC });
      lock(190, 180, k === 1 && Math.floor(t * 1.5) % 2 === 0, ACC, k === 0 ? pop(u, 0.6) : 1); mono(214, 186, 'mu', { 'font-size': 15, 'font-weight': 700 });
      cell(320, 180, null, k === 1 ? Math.min(9, Math.floor(u * 3.4)) : 0, { w: 80, h: 50, fs: 20 }); mono(320, 228, 'n', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT });
      if (k === 0) { tx(560, 180, '지킬 값과 자물쇠를 한 덩어리로', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); return; }
      [0, 1, 2].forEach((i) => { const y = 100 + i * 80; gtok(820, y, 'G' + (i + 1), { r: 20 }); mono(790, y + 5, 'c.Inc()', { 'font-size': 14.5, 'text-anchor': 'end', fill: INK });
        dot([[800, y], [400, 180]], ((t * 0.6 + i * 0.33) % 1), ACC, 6); });
      mono(260, 290, 'Lock · defer Unlock 은 Inc 안에만', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
      tx(480, 380, '부르는 쪽은 동시성을 신경 쓰지 않아도 된다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
      return; }
    if (k === 2) { // 채널로 일을 넘긴다
      const pipe = (x, name) => { card(x, 200, 150, 50, { rx: 14, stroke: INFO, sw: 2.2, fill: INFOBG, text: name, fs: 15, mono: true, color: INFO }); };
      gtok(80, 200, 'main', { r: 26, col: INK, fill: SOFT }); pipe(230, 'jobs'); pipe(730, 'results');
      [110, 200, 290].forEach((y, i) => { gtok(480, y, 'w' + (i + 1), { r: 22, s: pop(u, 0.2 + i * 0.2) });
        dot([[305, 200], [456, y]], ((t * 0.55 + i * 0.33) % 1), ACC, 6); dot([[504, y], [655, 200]], ((t * 0.55 + i * 0.33 + 0.5) % 1), GOOD, 6); });
      tx(480, 370, '값이 goroutine 사이를 옮겨 다닌다. 소유권이 넘어가니 자물쇠가 필요 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) });
      return; }
    // k === 3: 네 가지 함정
    [['Unlock 누락', '데드락'], ['Mutex 값 복사', '잠금이 깨진다 · 포인터로 넘긴다'], ['go 안에서 wg.Add', 'Wait가 완주를 놓친다'], ['race 무시', '운영에서 가끔 틀린 값']].forEach(([a, b], i) => {
      const y = 80 + i * 74, s = pop(u, 0.2 + i * 0.35); card(480, y, 620, 58, { rx: 10, stroke: BAD, sw: 2, s });
      cross(200, y, 9, s); mono(226, y + 6, a, { 'font-size': 15.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.3 + i * 0.35) });
      tx(770, y + 6, b, { 'font-size': 14.5, fill: INK, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.35) }); });
    tx(480, 398, '값 하나를 짧게 지키면 Mutex, 일을 넘기고 흐름을 만들면 채널', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) }); }

  const quiz = [
    { q: 'counter++를 네 goroutine이 동시에 실행하면 왜 증가분이 사라질 수 있는가?',
      o: ['counter++가 읽기·+1·쓰기 세 동작이라 사이에 다른 goroutine이 끼어들기 때문이다', 'goroutine이 4개를 넘으면 쓰기가 무시되기 때문이다', 'done 채널이 값을 덮어쓰기 때문이다'], a: 0,
      why: '두 goroutine이 같은 41을 읽고 각자 42를 쓰면 두 번의 증가가 한 번만 남는다. 원자적이지 않은 연산이다.' },
    { q: 'mu.Lock()을 먼저 잡은 goroutine이 counter++를 하는 동안 나머지 셋은 어떻게 되는가?',
      o: ['각자 복사본을 올린 뒤 나중에 합친다', 'Lock 줄에서 멈춰 차례를 기다린다', '증가를 건너뛰고 다음 반복으로 간다'], a: 1,
      why: 'Mutex는 임계 구역에 한 번에 하나만 들인다. 겹침이 없으니 결과가 언제나 100이다.' },
    { q: 'RWMutex에서 Set이 Lock을 쥐고 있는 동안 Get 요청들은 어떻게 되는가?',
      o: ['RLock끼리라 그대로 동시에 통과한다', 'panic이 난다', '쓰기가 끝날 때까지 모두 기다린다'], a: 2,
      why: '쓰기 잠금은 혼자 독점한다. RLock은 reader끼리만 서로 막지 않는다.' },
    { q: 'wg.Add(1)을 goroutine 안에서 부르면 생길 수 있는 문제는 무엇인가?',
      o: ['Wait가 카운터 0을 보고 일꾼이 시작하기도 전에 지나칠 수 있다', 'Done이 두 번 호출된다', 'Mutex가 풀리지 않는다'], a: 0,
      why: 'go로 띄운 함수가 언제 시작할지 모른다. Add는 go 앞에서 불러야 Wait가 인원을 놓치지 않는다.' },
    { q: '여러 goroutine이 동시에 GetDB()를 부를 때 once.Do 안의 connect()는 몇 번 실행되는가?',
      o: ['부른 goroutine 수만큼', '정확히 한 번', '한 번도 실행되지 않을 수 있다'], a: 1,
      why: 'sync.Once는 처음 한 번만 함수를 돌리고, 늦게 온 goroutine은 그 실행이 끝날 때까지 기다렸다가 완성된 conn을 본다.' },
    { q: '작업을 여러 worker에게 흘려보내는 파이프라인에는 무엇이 더 자연스러운가?',
      o: ['sync.Mutex로 공유 슬라이스를 잠근다', 'atomic.AddInt64로 작업 번호를 나눈다', '채널로 값을 넘겨 소유권을 옮긴다'], a: 2,
      why: '값이 goroutine 사이를 옮겨 가면 한 번에 한 쪽만 만지므로 자물쇠가 필요 없다. 상태를 짧게 지킬 때가 Mutex다.' },
  ];

  const summary = [
    'counter++는 읽기와 +1과 쓰기라서, 동시에 하면 증가분이 사라질 수 있다.',
    'Mutex는 한 번에 하나만 들이고, RWMutex는 읽기끼리만 동시에 들인다.',
    'WaitGroup은 go 앞에서 Add하고, 끝날 때 defer Done, main은 Wait로 기다린다.',
    '초기화 한 번은 Once, 정수 카운터는 atomic, 일을 넘길 때는 채널을 쓴다.',
  ];
  const review = [
    { q: 'WaitGroup으로 완주를 기다린 뒤 counter를 찍었는데 여전히 가끔 100보다 작다. 무엇이 빠졌는가?',
      o: ['counter++를 Mutex로 감싸거나 atomic으로 바꾸는 일', 'wg.Wait()를 한 번 더 부르는 일', 'goroutine 수를 4개에서 2개로 줄이는 일'], a: 0,
      why: 'WaitGroup은 언제 끝났는지만 센다. 값을 지키는 일은 Mutex나 atomic이 따로 해야 한다.' },
    { q: '요청마다 hits를 atomic.AddInt64로 올리는데, 통계 API가 return hits로 읽고 있다. go test -race는 무엇을 보고하는가?',
      o: ['아무것도 보고하지 않는다', '읽기 쪽 data race를 보고한다', 'AddInt64 쪽 race만 보고한다'], a: 1,
      why: '쓰기가 atomic이어도 읽기를 평범하게 하면 동시 접근이다. 읽기도 atomic.LoadInt64로 해야 한다.' },
    { q: 'Cache 구조체를 값으로 넘기는 함수(c Cache)를 만들었더니 잠금이 서로 안 막는 것처럼 보인다. 원인은?',
      o: ['RWMutex는 원래 읽기를 막지 않는다', 'map은 잠글 수 없다', '구조체가 복사되며 Mutex도 따로 하나 더 생겼다'], a: 2,
      why: 'Mutex를 값으로 복사하면 서로 다른 자물쇠가 된다. 자물쇠가 든 구조체는 포인터(*Cache)로 넘기고 go vet로 확인한다.' },
  ];

  R.page({ title: '공유 메모리와 자물쇠', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
