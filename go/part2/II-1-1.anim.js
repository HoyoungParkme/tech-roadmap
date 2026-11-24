/* II-1-1 goroutine — 가벼운 스레드 · 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cells, cross, check, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // goroutine 하나: 작은 원 + 이름 (o.col 색, o.s 크기, o.op 투명도)
  function gtok(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || ACC, r = o.r || 17;
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2.4 }, g);
    if (name) tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: col, class: 'mono' }, g);
    return g; }
  // OS 스레드 하나: 키 큰 스택 막대 (1MB)
  function osThread(cx, cy, h, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -16, y: -h, width: 32, height: h, rx: 5, fill: o.fill || WARNBG, stroke: o.stroke || WARN, 'stroke-width': 2.2 }, g);
    for (let y = -h + 10; y < -6; y += 12) el('line', { x1: -9, y1: y, x2: 9, y2: y, stroke: o.stroke || WARN, 'stroke-width': 1.4, opacity: 0.6 }, g);
    if (name) tx(0, 20, name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: MUT }, g);
    return g; }
  const fmtN = (v) => Math.round(v).toLocaleString('en-US');

  // ---------- 1. OS 스레드는 무겁다 ----------
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) {
      // 100칸 = 스레드 1만 개. 한 칸 = 스레드 100개 = 스택 100MB
      const x0 = 70, y0 = 78, cw = 31, ch = 34, gx = 33, gy = 40;
      tx(x0, 46, k === 0 ? 'new Thread() × 10,000' : 'newFixedThreadPool(200)', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
      const fill = k === 0 ? lerp(0, 100, E(u, 0.2, 2.0)) : 100;
      for (let i = 0; i < 100; i++) { const x = x0 + (i % 25) * gx, y = y0 + Math.floor(i / 25) * gy;
        const on = k === 0 ? i < fill : i < 2, gone = k === 1 && i >= 2, f = gone ? 1 - E(u, 0.2, 1.0) : 1;
        el('rect', { x, y, width: cw, height: ch, rx: 4, fill: on ? WARN : gone ? WARN : PANEL, opacity: on ? 0.8 : gone ? 0.8 * f : 1, stroke: on ? 'none' : GRID, 'stroke-width': 1.4 });
        if (gone && f < 1) el('rect', { x, y, width: cw, height: ch, rx: 4, fill: 'none', stroke: GRID, 'stroke-width': 1.4, opacity: 1 - f }); }
      sub(700, 46, '한 칸 = OS 스레드 100개 = 스택 100MB (스레드당 1MB)', 1);
      const th = k === 0 ? fill * 100 : tween(10000, 200, u), mem = th, q = k === 0 ? 0 : tween(0, 9800, u);
      R.meters(70, 296, 820, [
        { name: 'OS 스레드', val: fmtN(th), hot: k === 0 && th > 9000 },
        { name: '스택 합계', val: mem >= 1000 ? (mem / 1000).toFixed(1) + 'GB' : fmtN(mem) + 'MB', hot: k === 0 && th > 9000, bar: mem / 100 },
        { name: '큐에서 대기하는 작업', val: fmtN(q), bar: q / 100 },
      ]);
      if (k === 0) { const s = pop(u, 2.2); if (s > 0) { cross(330, 262, 14, s); pill(480, 262, 'OS가 생성을 거부할 수 있다', BAD, s, { fs: 14 }); } }
      if (k === 1) { // 200개만 일하고 나머지 9,800개는 줄을 선다
        el('rect', { x: x0 - 6, y: y0 - 6, width: 2 * gx + 8, height: ch + 12, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.6, opacity: fade(u, 0.9) });
        el('rect', { x: x0 + 2 * gx + 4, y: y0 + 4, width: 150, height: 26, rx: 5, fill: PANEL, opacity: fade(u, 1.0) });
        tx(x0 + 2 * gx + 10, y0 + 23, '← 풀 200개만 일한다', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
        for (let i = 0; i < 9; i++) dot([[900, 270], [x0 + 2 * gx + 30, 270], [x0 + 34, y0 + ch + 8]], (t * 0.35 + i / 9) % 1, INK, 4.5);
        tx(900, 258, '작업 9,800개가 줄을 선다', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) }); }
      return; }
    if (k === 2) { // 콜백 체인: 코드는 이어 보이지만 실행은 흩어진다
      tx(70, 50, 'CompletableFuture', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
      const st = [['supplyAsync', 'fetchUser()', 210], ['thenCompose', 'fetchOrders(user)', 480], ['thenAccept', 'render(orders)', 750]];
      st.forEach(([a, b, x], i) => { const s = pop(u, 0.2 + i * 0.45);
        card(x, 130, 220, 70, { rx: 10, stroke: INFO, sw: 2.2, s, fill: INFOBG });
        mono(x, 124, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3 + i * 0.45) });
        mono(x, 148, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: INK, opacity: fade(u, 0.3 + i * 0.45) });
        if (i) grow(x - 270 + 112, 130, x - 112, 130, seg(u, 0.4 + i * 0.45, 0.8 + i * 0.45), INFO); });
      // 아래: 실제로 도는 스레드는 콜백마다 다를 수 있다 → 스택이 끊긴다
      tx(70, 228, '콜백이 실행되는 스레드 (예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.5) });
      [['풀 스레드 A', 210], ['풀 스레드 C', 480], ['풀 스레드 B', 750]].forEach(([n, x], i) => { const o = fade(u, 1.6 + i * 0.2);
        osThread(x, 320, 64, null, { op: o }); tx(x, 344, n, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: o });
        el('line', { x1: x, y1: 168, x2: x, y2: 252, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: o }); });
      [345, 615].forEach((x, i) => { const s = pop(u, 2.1 + i * 0.15); if (s > 0) cross(x, 290, 11, s); });
      tx(480, 392, '스택 트레이스가 콜백마다 끊기고, 흐름이 위에서 아래로 읽히지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) });
      return; }
    // k === 3: 세 방법 모두 대가가 있다
    [['스레드 직접', '메모리 폭발', BAD], ['풀 + 큐', '크기를 사람이 튜닝', WARN], ['콜백 체인', '디버깅이 어렵다', BAD]].forEach(([a, b, col], i) => {
      const x = 190 + i * 290, s = pop(u, 0.2 + i * 0.35);
      card(x, 130, 250, 96, { rx: 12, stroke: col, sw: 2.4, s });
      tx(x, 122, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.35) });
      tx(x, 150, b, { 'text-anchor': 'middle', 'font-size': 15, fill: col, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) }); });
    grow(480, 196, 480, 262, seg(u, 1.4, 1.9), MUT);
    banner(480, 296, '근본 원인 · OS 스레드 하나가 너무 비싸다', pop(u, 1.9));
    tx(480, 360, '필요한 것은 수만 개를 띄워도 되는 가벼운 일꾼', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, opacity: fade(u, 2.3) }); }

  // ---------- 2. goroutine 과 G·M·P 스케줄러 ----------
  const P2 = [{ x: 400, name: 'P0' }, { x: 700, name: 'P1' }], PY = 96, MY = 222;
  function gmp(t, c, o) { o = o || {}; const op = o.op ?? 1;
    zone(300, 30, 630, 250, 'Go 런타임 스케줄러', { op });
    P2.forEach((p, i) => {
      card(p.x, PY, 70, 40, { rx: 8, text: p.name, fs: 15, fw: 800, stroke: INFO, color: INFO, fill: INFOBG, op });
      for (let j = 0; j < 4; j++) el('rect', { x: p.x + 46 + j * 42, y: PY - 17, width: 36, height: 34, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      el('line', { x1: p.x, y1: PY + 20, x2: p.x, y2: MY - 40, stroke: MUT, 'stroke-width': 2, opacity: op });
      osThread(p.x, MY + 26, 52, null, { op });
      tx(p.x + 26, MY + 6, 'M' + i, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: op }); });
    tx(946 - 30, PY + 44, '로컬 실행 큐', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: main goroutine
    gtok(110, 96, 'main', { r: 30, col: INK, fill: SOFT });
    if (k <= 2) {
      gmp(t, c);
      // 실행 중인 G (M 위)
      if (k === 2) { gtok(P2[0].x, 160, 'G', { r: 15 }); gtok(P2[1].x, 160, 'G', { r: 15 }); }
      // beat 0: go sayHello() → P0 큐
      const a0 = k === 0 ? seg(u, 0.3, 1.4) : 1;
      if (k === 0 && a0 < 1) fly(210, 96, P2[0].x + 64, PY, a0, 'sayHello', { mono: true });
      if (k >= 1 || a0 >= 1) gtok(P2[0].x + 64, PY, 'G1', { r: 16 });
      if (k === 0) { grow(110, 134, 110, 250, seg(u, 1.0, 1.8), ACC); tx(126, 220, '기다리지 않고', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); tx(126, 240, '다음 줄로', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); }
      // beat 1: 익명 함수 → P1 큐, 바깥 변수 캡처
      if (k === 1) { const a1 = seg(u, 0.3, 1.4); if (a1 < 1) fly(220, 96, P2[1].x + 64, PY, a1, 'func(){…}()', { mono: true }); else gtok(P2[1].x + 64, PY, 'G2', { r: 16 });
        card(110, 220, 96, 40, { rx: 6, text: 'name', fs: 15, mono: true, s: pop(u, 1.3) });
        tx(110, 262, '바깥 변수', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.4) });
        el('path', { d: `M158,214 Q${P2[1].x - 120},250 ${P2[1].x + 50},${PY + 18}`, fill: 'none', stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.7) });
        tx(615, 302, '익명 함수는 바깥 변수를 그대로 본다', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); }
      if (k === 2) { gtok(P2[1].x + 64, PY, 'G2', { r: 16 });
        // 큐가 G 로 가득 찬다
        const f = E(u, 0.1, 1.2);
        P2.forEach((p) => { for (let j = 1; j < 4; j++) if (f * 4 > j) gtok(p.x + 64 + j * 42, PY, null, { r: 12, s: clamp(f * 4 - j) }); });
        P2.forEach((p) => { if (f * 4 > 0.2) gtok(p.x + 64, PY, null, { r: 12 }); });
        mono(920, 60, 'G × ' + fmtN(lerp(2, 10000, E(u, 0.1, 1.4))), { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 800, fill: ACC });
        // 메모리 비교 막대
        const g = E(u, 1.0, 2.2);
        tx(60, 316, '1만 개의 스택 합계', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.9) });
        tx(60, 352, 'OS 스레드 1MB', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) }); tx(60, 390, 'goroutine 2KB', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.0) });
        hbar(200, 340, 560 * g, 10000, 10000, { col: WARN, text: '약 10GB', h: 18, label: g > 0.95 });
        hbar(200, 378, 560 * g, 20.48, 10000, { col: ACC, text: '약 20MB', h: 18, label: g > 0.95 });
        tx(900, 316, '스레드 하나 차이 512배', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); }
      if (k === 0) sub(615, 300, 'G = goroutine · P = 실행 자리 (GOMAXPROCS 개, 그림은 2개) · M = OS 스레드', fade(u, 1.8));
      if (k !== 2) sub(615, 330, '런타임이 많은 G를 적은 M에 나눠 태운다 (M:N)', k === 0 ? fade(u, 2.1) : 1);
      return; }
    if (k === 3) { // main 이 끝나면 다 같이 사라진다
      gmp(t, c, { op: 1 - 0.7 * E(u, 1.2, 2.0) });
      const gone = E(u, 1.2, 2.0);
      gtok(P2[0].x + 64, PY, 'G', { r: 16, op: 1 - gone }); gtok(P2[1].x + 64, PY, 'G', { r: 16, op: 1 - gone });
      const s = pop(u, 0.3); card(110, 196, 110, 36, { rx: 18, text: 'return', fs: 15, mono: true, fw: 800, stroke: BAD, color: BAD, s });
      grow(110, 130, 110, 176, seg(u, 0.1, 0.4), BAD);
      if (gone > 0.3) { cross(P2[0].x + 64, PY, 12, pop(u, 1.6)); cross(P2[1].x + 64, PY, 12, pop(u, 1.7)); }
      terminal(40, 288, 420, 110, ['$ go run main.go', ['(Hello가 안 찍힐 수 있다)', 'var(--off)']], k === 3 ? lerp(0, 2, E(u, 0.6, 1.6)) : 2, {});
      tx(500, 330, 'main이 끝나면 프로그램이 끝난다', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      tx(500, 358, '남은 goroutine은 기다려 주지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    // k === 4: 에러·panic 은 위로 올라오지 않는다
    gmp(t, c, { op: 0.35 });
    const hot = pop(u, 0.3);
    gtok(P2[0].x, 160, 'G', { r: 18, col: BAD, fill: BADBG, s: hot });
    pill(P2[0].x + 90, 160, 'panic / err', BAD, pop(u, 0.6), { mono: true, fs: 13.5 });
    el('path', { d: `M${P2[0].x - 22},158 Q250,150 146,110`, fill: 'none', stroke: BAD, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', opacity: fade(u, 1.0) });
    if (u > 1.3) cross(250, 146, 13, pop(u, 1.3));
    tx(250, 196, 'main으로 전파되지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
    card(330, 340, 300, 64, { rx: 10, stroke: GOOD, sw: 2.2, s: pop(u, 1.8), text: '결과·에러는 채널로 돌려받는다\n끝나기는 WaitGroup으로 기다린다', fs: 14.5 });
    card(700, 340, 330, 64, { rx: 10, stroke: BAD, sw: 2.2, s: pop(u, 2.1), text: 'panic은 프로세스 전체를 죽인다\nrecover는 그 goroutine 안에서만', fs: 14.5 }); }

  // ---------- 3. 흔한 함정 세 가지 ----------
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) {
      tx(60, 48, k === 0 ? 'go func() { fmt.Println(i) }()' : 'go func(id int) { fmt.Println(id) }(i)', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      const gx = [560, 700, 840];
      gx.forEach((x, j) => gtok(x, 110, 'G' + j, { r: 22, s: k === 0 ? pop(u, 0.2 + j * 0.25) : 1 }));
      if (k === 0) { // 변수 i 하나를 셋이 함께 본다
        const iv = Math.min(3, Math.floor(lerp(0, 3.999, E(u, 0.2, 1.4))));
        card(220, 190, 110, 60, { rx: 8, stroke: WARN, sw: 2.6, fill: WARNBG });
        mono(220, 198, String(iv), { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: WARN });
        tx(165, 150, '변수 i (하나)', { 'font-size': 15, 'font-weight': 800 });
        gx.forEach((x, j) => { const g = seg(u, 1.0 + j * 0.15, 1.6 + j * 0.15); if (g > 0) el('line', { x1: x, y1: 132, x2: lerp(x, 275, g), y2: lerp(132, 190, g), stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '5 4' }); });
        tx(560, 228, '루프가 끝난 뒤에야 실행되면', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.7) });
        terminal(560, 250, 330, 100, ['3', '3', '3'], lerp(0, 3, E(u, 1.9, 2.5)), { title: '출력 예시 (Go 1.22 이전)', lh: 20 });
        tx(60, 390, '값이 아니라 변수 자체를 붙잡는다. Go 1.22부터는 반복마다 새 i가 생긴다.', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.3) });
        return; }
      // k === 1: 호출할 때 값을 복사해 넘긴다
      card(220, 190, 110, 60, { rx: 8, stroke: GRID, sw: 2 }); tx(165, 150, '변수 i', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      mono(220, 198, String(Math.min(3, Math.floor(lerp(0, 3.999, E(u, 0.2, 1.6))))), { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: MUT });
      gx.forEach((x, j) => { const a = seg(u, 0.3 + j * 0.4, 0.9 + j * 0.4);
        if (a > 0 && a < 1) fly(220, 240, x, 240, a, String(j), { mono: true });
        if (a >= 1) { card(x, 176, 60, 40, { rx: 6, stroke: ACC, sw: 2.2, fill: ACCBG }); mono(x, 183, String(j), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC }); tx(x, 214, 'id', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono' }); } });
      terminal(560, 250, 330, 100, ['2', '0', '1'], lerp(0, 3, E(u, 1.9, 2.5)), { title: '출력 예시 (순서는 매번 다르다)', lh: 20 });
      tx(60, 300, '각자 자기 복사본을 갖는다', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      tx(60, 326, '값은 맞지만 순서는 보장되지 않는다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) });
      return; }
    if (k <= 3) { // 시간축: main 과 doWork
      const X0 = 200, X1 = 880, T = (s) => lerp(X0, X1, s);
      el('line', { x1: X0, y1: 330, x2: X1, y2: 330, stroke: MUT, 'stroke-width': 1.8 }); tx(X1, 354, '시간 →', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      tx(60, 140, 'main', { 'font-size': 16, 'font-weight': 800, class: 'mono' }); tx(60, 240, 'doWork', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC });
      if (k === 2) { const g = E(u, 0.2, 1.0);
        el('rect', { x: X0, y: 120, width: (T(0.25) - X0) * g, height: 30, rx: 6, fill: INK, opacity: 0.8 });
        const d = E(u, 0.5, 1.4); el('rect', { x: T(0.12), y: 220, width: (T(0.8) - T(0.12)) * d, height: 30, rx: 6, fill: ACC, opacity: 0.35, stroke: ACC, 'stroke-dasharray': '5 4' });
        el('rect', { x: T(0.12), y: 220, width: (T(0.25) - T(0.12)) * g, height: 30, rx: 6, fill: ACC });
        const s = pop(u, 1.5); if (s > 0) { el('line', { x1: T(0.25), y1: 100, x2: T(0.25), y2: 300, stroke: BAD, 'stroke-width': 3 }); card(T(0.25), 82, 130, 32, { rx: 16, text: 'main 반환', fs: 14, fw: 800, stroke: BAD, color: BAD, s }); cross(T(0.25) + 60, 235, 13, s); }
        tx(T(0.55), 290, '하던 일이 중간에 사라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) });
        sub(T(0.55), 388, '가끔 되고 가끔 안 되는 버그가 된다', fade(u, 2.2));
        return; }
      // k === 3: <-done 이 main 을 붙잡는다
      el('rect', { x: X0, y: 120, width: T(0.12) - X0, height: 30, rx: 6, fill: INK, opacity: 0.8 });
      const w = E(u, 0.2, 1.6);
      el('rect', { x: T(0.12), y: 120, width: (T(0.8) - T(0.12)) * w, height: 30, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      if (w > 0.3) mono(T(0.4), 141, '<-done 에서 대기', { 'text-anchor': 'middle', 'font-size': 14, fill: INK, 'font-weight': 700 });
      el('rect', { x: T(0.12), y: 220, width: (T(0.8) - T(0.12)) * w, height: 30, rx: 6, fill: ACC });
      if (u > 1.6) { const s = pop(u, 1.6); card(T(0.8), 186, 130, 30, { rx: 15, text: 'close(done)', fs: 13.5, mono: true, fw: 800, stroke: ACC, color: ACC, s });
        grow(T(0.8), 214, T(0.8), 156, seg(u, 1.7, 2.1), ACC);
        el('rect', { x: T(0.8), y: 120, width: (T(0.95) - T(0.8)) * E(u, 2.0, 2.5), height: 30, rx: 6, fill: INK, opacity: 0.8 }); check(T(0.97) + 14, 135, 11, pop(u, 2.4)); }
      tx(T(0.45), 290, '완료 신호를 받을 때까지 main이 기다린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) });
      return; }
    // k === 4: 받는 쪽이 없는 송신 → 끝나지 않는 goroutine 이 쌓인다
    snippetLine(60, 40, 'ch := make(chan int)\ngo func() { ch <- 1 }()   // 받는 쪽이 없다');
    const n = Math.floor(lerp(1, 12, E(u, 0.3, 2.2)));
    for (let i = 0; i < n; i++) { const x = 110 + (i % 6) * 86, y = 200 + Math.floor(i / 6) * 86;
      gtok(x, y, 'G', { r: 20, col: MUT, fill: SOFT, s: i === n - 1 ? pop(u, 0.3 + i * 0.17) : 1 });
      mono(x + 22, y - 18, 'z', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
    tx(110 - 20, 380, '요청마다 하나씩 ch <- 1 에서 멈춘 채 남는다', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
    // 오른쪽: 메모리가 천천히 오른다
    const ax = R.axes(660, 150, 250, 180, { x: [0, 1], y: [0, 1], xl: '시간', yl: '메모리 (모양만)' });
    R.line(ax, [[0, 0.12], [0.25, 0.25], [0.5, 0.42], [0.75, 0.6], [1, 0.82]], E(u, 0.4, 2.4), BAD);
    tx(785, 372, 'goroutine leak', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 2.2) }); }
  // 여러 줄 코드 상자 (색칠 없이 고정폭)
  function snippetLine(x, y, s) { R.snippet(x, y, s.split('\n'), { fs: 14.5 }); }

  // ---------- 4. 작업자 풀 ----------
  const W4 = [{ y: 120 }, { y: 210 }, { y: 300 }], JX = 170, WX = 500, RX = 760;
  function chanBox(x, y, name, vals, o) { o = o || {}; const n = 5;
    tx(x, y - 12, name, { 'font-size': 15, 'font-weight': 800, class: 'mono', opacity: o.op ?? 1 });
    cells(x, y, Array.from({ length: n }, (_, i) => vals[i] ?? null), { w: 34, h: 34, gap: 4, fs: 14.5, style: (i) => ({ fill: vals[i] != null ? ACCBG : PANEL, stroke: vals[i] != null ? ACC : GRID, op: o.op }) });
    mono(x + n * 38 + 4, y + 23, '… cap 100', { 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 });
    if (o.closed) pill(x + 90, y + 56, 'closed', BAD, o.closed, { mono: true, fs: 13.5 }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // 함수 모양: 받기 전용 · 보내기 전용
      gtok(480, 200, 'worker', { r: 44 });
      grow(180, 200, 430, 200, seg(u, 0.3, 1.0), ACC); grow(530, 200, 790, 200, seg(u, 0.9, 1.6), ACC);
      mono(300, 180, 'jobs <-chan int', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.7) });
      tx(300, 228, '받기만 한다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) });
      mono(660, 180, 'results chan<- int', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      tx(660, 228, '보내기만 한다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      card(480, 320, 520, 50, { rx: 10, text: 'for j := range jobs  →  jobs가 닫히면 반복이 끝난다', fs: 14.5, mono: true, s: pop(u, 1.9) });
      sub(480, 378, '방향을 거꾸로 쓰면 컴파일러가 막는다', fade(u, 2.3));
      return; }
    if (k === 4) { // 두 바퀴에 끝난다 (시간표)
    const X0 = 300, sec = 120, T = (s) => X0 + s * sec;
    tx(60, 60, '1초짜리 작업 5개, worker 3개 (배정은 예시)', { 'font-size': 15, 'font-weight': 800 });
    [0, 1, 2, 3, 4, 5].forEach((s) => { el('line', { x1: T(s), y1: 84, x2: T(s), y2: 300, stroke: GRID, 'stroke-width': 1, 'stroke-dasharray': '3 4' }); mono(T(s), 318, s + 's', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); });
    const plan = [[0, 0, 1], [1, 0, 2], [2, 0, 3], [0, 1, 4], [1, 1, 5]];
    ['w1', 'w2', 'w3'].forEach((w, i) => tx(X0 - 16, 118 + i * 50, w, { 'font-size': 15, 'font-weight': 800, class: 'mono', 'text-anchor': 'end', fill: ACC }));
    plan.forEach(([w, s, j], i) => { const g = E(u, 0.2 + s * 0.7, 0.8 + s * 0.7); if (g <= 0) return;
      el('rect', { x: T(s) + 3, y: 100 + w * 50, width: (sec - 6) * g, height: 30, rx: 5, fill: ACC, opacity: 0.85 });
      if (g > 0.6) mono(T(s) + sec / 2, 121 + w * 50, '작업 ' + j, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: PANEL }); });
    tx(X0 - 16, 268, '순차', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 1.6) });
    el('rect', { x: T(0) + 3, y: 252, width: (5 * sec - 6) * E(u, 1.6, 2.3), height: 26, rx: 5, fill: OFF });
    if (u > 2.3) mono(T(5) - 10, 271, '5초', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: INK });
    pill(T(2) + 20, 360, '약 2초에 끝', GOOD, pop(u, 1.6), { fs: 15 });
    mono(T(2) + 170, 366, '결과 2 4 6 8 10 (도착 순서는 예시)', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    const op1 = k === 1 ? fade(u, 0.2) : 1;
    // jobs 안의 값
    let jv = [];
    if (k === 3) { const put = Math.floor(lerp(0, 5.99, E(u, 0.2, 1.3))), take = Math.floor(lerp(0, 3.99, E(u, 1.0, 1.8))); for (let j = take + 1; j <= put; j++) jv.push(j); }
    chanBox(40, 200, 'jobs', jv, { op: op1, closed: k === 3 ? pop(u, 2.0) : k > 3 ? 1 : 0 });
    if (k === 1) chanBox(700, 200, 'results', [], { op: fade(u, 0.6) });
    if (k === 1) { tx(480, 120, '작업을 넣을 큐와 결과를 받을 큐', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) }); mono(480, 150, 'len 0 · cap 100', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) }); return; }
    if (k <= 3) { chanBox(700, 200, 'results', []);
      W4.forEach((w, i) => { const s = k === 2 ? pop(u, 0.3 + i * 0.3) : 1;
        gtok(WX, w.y, 'w' + (i + 1), { r: 24, s });
        if (k === 2) { el('line', { x1: 300, y1: 217, x2: WX - 28, y2: w.y, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5', opacity: s }); mono(WX + 30, w.y - 14, 'z', { 'font-size': 15, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) }); }
        if (k === 3) { const a = seg(u, 1.0 + i * 0.15, 1.7 + i * 0.15); if (a > 0 && a < 1) fly(220, 217, WX - 30, w.y, a, String(i + 1), { mono: true });
          if (a >= 1) pill(WX + 70, w.y, '작업 ' + (i + 1), ACC, 1, { fs: 13.5 }); } });
      if (k === 2) tx(480, 380, '세 goroutine이 같은 jobs에서 나눠 가져간다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.6) });
      if (k === 3) { sub(160, 120, 'main이 1~5를 넣고 close', fade(u, 0.3)); tx(480, 380, '어느 worker가 몇 번을 집는지는 실행마다 다르다 (그림은 예시)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); }
      return; } }

  // ---------- 5. context 로 취소 ----------
  const X0 = 120, X1 = 900, TS = (s) => lerp(X0, X1, s / 10);   // 0~10초
  function units(n, op, upto, col) { for (let i = 0; i < n; i++) { const x = TS(i * 0.1); el('rect', { x: x + 0.6, y: 200, width: 6.6, height: 34, rx: 1.5, fill: i < upto ? (col || ACC) : OFF, opacity: op }); } }
  function axis10(op) { el('line', { x1: X0, y1: 250, x2: X1, y2: 250, stroke: MUT, 'stroke-width': 1.6, opacity: op });
    [0, 2, 4, 6, 8, 10].forEach((s) => mono(TS(s), 272, s + 's', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op })); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) {
      const o0 = fade(u, 0.2), cw = R.tw('ctx context.Context', 18);
      mono(230, 120, 'func longTask(', { 'font-size': 18, 'text-anchor': 'end', opacity: o0 });
      mono(236, 120, 'ctx context.Context', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: o0 });
      mono(242 + cw, 120, ', jobID int) error', { 'font-size': 18, opacity: o0 });
      el('rect', { x: 230, y: 96, width: cw + 12, height: 34, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, 0.8) });
      grow(350, 136, 350, 196, seg(u, 0.9, 1.4), ACC);
      card(350, 230, 260, 56, { rx: 10, stroke: ACC, sw: 2.2, fill: ACCBG, text: '취소 신호가 들어오는 통로', fs: 15, s: pop(u, 1.3) });
      tx(480, 330, 'ctx는 언제나 첫 번째 인자 · struct 필드에 넣지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) });
      return; }
    if (k === 1) { // 반복마다 select 로 갈림길
      gtok(140, 200, 'loop', { r: 30 });
      grow(176, 190, 420, 110, seg(u, 0.3, 1.0), BAD); grow(176, 210, 420, 290, seg(u, 0.5, 1.2), ACC);
      card(560, 110, 260, 52, { rx: 10, stroke: BAD, sw: 2.2, text: 'case <-ctx.Done()', fs: 15, mono: true, s: pop(u, 0.9) });
      mono(720, 115, '→ return ctx.Err()', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
      card(560, 290, 260, 52, { rx: 10, stroke: ACC, sw: 2.2, text: 'default', fs: 15, mono: true, s: pop(u, 1.1) });
      mono(720, 295, '→ 한 단위 일한다', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(480, 390, 'default가 있어 select는 멈추지 않고 신호만 확인하고 지나간다', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.0) });
      return; }
    if (k === 5) { // HTTP 요청 → 하위로 취소 전파
    const nodes = [['클라이언트', 120, 150], ['handler · r.Context()', 400, 150], ['longTask(ctx)', 680, 110], ['DB 쿼리(ctx)', 680, 200]];
    nodes.forEach(([n, x, y], i) => card(x, y, i === 1 ? 220 : 170, 46, { rx: 10, text: n, fs: 14.5, mono: i > 0, stroke: i === 0 ? INK : ACC, sw: 2.2 }));
    el('line', { x1: 205, y1: 150, x2: 290, y2: 150, stroke: INK, 'stroke-width': 2.4 }); el('line', { x1: 510, y1: 142, x2: 595, y2: 114, stroke: ACC, 'stroke-width': 2.2 }); el('line', { x1: 510, y1: 158, x2: 595, y2: 196, stroke: ACC, 'stroke-width': 2.2 });
    if (u > 0.5) cross(248, 150, 13, pop(u, 0.5));
    tx(248, 196, '연결 끊김', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.7) });
    dot([[290, 150], [510, 150], [595, 114]], seg(u, 1.0, 1.9), BAD, 7); dot([[290, 150], [510, 150], [595, 196]], seg(u, 1.0, 1.9), BAD, 7);
    ['longTask', 'DB'].forEach((_, i) => { if (u > 1.9) pill(830, i ? 200 : 110, 'Done 닫힘', BAD, pop(u, 1.9 + i * 0.1), { fs: 13.5 }); });
    tx(480, 300, 'r.Context()는 클라이언트가 끊으면 자동으로 취소된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.0) });
    tx(480, 330, 'ctx를 아래로 넘기기만 하면 하위 작업까지 함께 멈춘다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.2) }); return; }
    axis10(1);
    tx(X0, 180, 'longTask: 100ms × 100번', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    if (k === 2) { units(100, 1, Math.floor(lerp(0, 100, E(u, 0.2, 2.2))));
      tx(X0, 330, '단위마다 한 번씩 취소를 확인한다. 끝까지 가면 10초 뒤 return nil', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      tx(X0, 360, '한 번에 오래 막히는 코드라면 그 사이 취소를 못 본다', { 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.8) });
      return; }
    const dl = TS(3);
    // 마감선 3초
    const gl = k === 3 ? E(u, 0.3, 1.0) : 1;
    el('line', { x1: dl, y1: lerp(250, 130, gl), x2: dl, y2: 250, stroke: BAD, 'stroke-width': 3 });
    if (gl > 0.95) pill(dl, 116, 'WithTimeout 3s', BAD, 1, { mono: true, fs: 13.5 });
    if (k === 3) { units(100, 0.5, 0);
      card(700, 110, 280, 50, { rx: 10, stroke: INK, sw: 2, text: 'defer cancel()', fs: 15, mono: true, s: pop(u, 1.2) });
      tx(700, 154, '타이머 자원을 꼭 돌려준다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      tx(X0, 330, 'Background → 3초 뒤 스스로 취소되는 ctx', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) });
      return; }
    if (k === 4) { const done = Math.floor(lerp(0, 30, E(u, 0.1, 1.2)));
      units(100, 1, done);
      if (u > 1.2) { cross(dl + 18, 160, 12, pop(u, 1.2)); tx(dl + 40, 165, '약 30번째 단위에서 멈춘다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.3) }); }
      terminal(X0, 300, 620, 90, ['err == context.DeadlineExceeded', ['(시각) 작업 실패: context deadline exceeded', null]], lerp(0, 2, E(u, 1.5, 2.4)), {});
      return; } }

  const quiz = [
    { q: 'Java에서 new Thread()로 스레드 1만 개를 띄우려 할 때 먼저 부딪히는 한계는 무엇인가?',
      o: ['스레드마다 1MB 안팎의 스택이 필요해 합계가 10GB쯤 된다', 'Java는 스레드를 100개까지만 만들 수 있다', '콜백을 쓰지 않으면 컴파일이 안 된다'], a: 0,
      why: 'OS 스레드는 스레드당 1MB 정도의 스택을 잡는다. 1만 개면 약 10GB라 풀이나 콜백 같은 우회로가 필요했다.' },
    { q: 'go sayHello()를 실행한 직후 main goroutine은 어떻게 되는가?',
      o: ['sayHello가 끝날 때까지 기다린다', '기다리지 않고 바로 다음 줄을 실행한다', 'sayHello를 같은 goroutine에서 먼저 실행한다'], a: 1,
      why: 'go는 새 goroutine을 만들어 런타임 실행 큐에 넣을 뿐이다. 부른 쪽은 멈추지 않고 진행한다.' },
    { q: 'Go 1.22 이전에 for 안에서 go func() { fmt.Println(i) }()를 쓰면 왜 3 3 3이 찍힐 수 있는가?',
      o: ['goroutine이 i를 문자열로 바꾸기 때문이다', 'fmt.Println이 마지막 호출만 남기기 때문이다', '세 goroutine이 같은 변수 i 하나를 붙잡고 있기 때문이다'], a: 2,
      why: '익명 함수는 값이 아니라 변수 자체를 캡처한다. 실행 시점에 i가 이미 3이면 셋 다 3을 본다.' },
    { q: 'worker 3개, 1초짜리 작업 5개인 작업자 풀은 대략 몇 초에 끝나는가?',
      o: ['약 1초', '약 2초', '약 5초'], a: 1,
      why: '첫 바퀴에 작업 1~3, 둘째 바퀴에 4~5를 처리한다. 두 바퀴라 순차 5초 대신 약 2초다.' },
    { q: 'WithTimeout(3초) ctx를 받은 longTask(100ms × 100번)는 어떻게 끝나는가?',
      o: ['10초를 다 채우고 nil을 돌려준다', '3초 무렵 ctx.Done()을 보고 context.DeadlineExceeded를 돌려준다', '3초가 되면 panic으로 프로세스가 죽는다'], a: 1,
      why: '단위마다 select로 ctx.Done()을 확인하므로 약 30번째 단위에서 멈춘다. 취소도 평범한 error 값으로 돌아온다.' },
  ];

  const summary = [
    'OS 스레드는 스레드당 1MB 안팎의 스택을 잡아 1만 개면 10GB쯤 든다.',
    'goroutine은 2KB 스택에서 시작하고, 런타임이 많은 G를 적은 OS 스레드에 나눠 태운다.',
    'main이 끝나면 goroutine도 끝나고, goroutine 안의 에러는 위로 전파되지 않는다.',
    '작업자 풀은 채널 두 개와 worker 몇 개로 만들고, 취소는 ctx.Done()으로 듣는다.',
  ];
  const review = [
    { q: '요청마다 go handle(req)로 goroutine을 띄우는 서버에서 메모리가 시간이 갈수록 계속 오른다. 먼저 의심할 것은?',
      o: ['goroutine의 초기 스택이 너무 크다', '받는 쪽이 없는 채널 송신 등에서 끝나지 않고 남은 goroutine', 'GOMAXPROCS 값이 CPU 수와 같다'], a: 1,
      why: 'goroutine은 2KB로 가볍지만 끝나지 않으면 계속 쌓인다. 수신자 없는 송신이나 취소를 안 듣는 루프가 흔한 원인이다.' },
    { q: '작업자 풀 코드에서 main이 결과를 다 받은 뒤에도 worker goroutine들이 사라지지 않는다. 빠뜨렸을 가능성이 큰 줄은?',
      o: ['close(jobs)', 'results := make(chan int, 100)', 'time.Sleep(time.Second)'], a: 0,
      why: 'worker는 for j := range jobs로 돈다. jobs가 닫히지 않으면 range가 끝나지 않아 worker가 영원히 기다린다.' },
    { q: '클라이언트가 응답을 기다리다 브라우저를 닫았는데 서버의 긴 작업이 끝까지 돈다. 어떻게 고치는가?',
      o: ['작업 함수 안에서 time.After(10초)를 새로 건다', 'go 키워드를 빼고 같은 goroutine에서 실행한다', 'r.Context()를 작업 함수에 넘기고 단위마다 ctx.Done()을 확인한다'], a: 2,
      why: 'r.Context()는 연결이 끊기면 취소된다. 그 ctx를 첫 인자로 넘겨 select로 들으면 하위 작업까지 멈춘다.' },
  ];

  R.page({ title: 'goroutine과 스케줄러', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
