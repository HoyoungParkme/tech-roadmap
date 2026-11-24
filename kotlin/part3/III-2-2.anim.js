/* III-2-2 구조화된 동시성과 취소 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // Job 하나: 둥근 알약. st: run / done / cancel / leak / parent
  function job(cx, cy, name, st, o) { o = o || {};
    const col = { run: ACC, done: GOOD, cancel: BAD, leak: WARN, parent: INFO, idle: MUT }[st] || ACC, fill = { run: ACCBG, done: GOODBG, cancel: BADBG, leak: WARNBG, parent: INFOBG, idle: SOFT }[st] || ACCBG;
    const w = o.w || R.tw(name, 14) + 30, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -17, width: w, height: 34, rx: 17, fill, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, class: 'mono' }, g); return g; }
  // 부모-자식 선 (u 만큼 자람, red 면 취소가 흐름)
  function edge(x1, y1, x2, y2, u, red) { if (u <= 0) return; el('line', { x1, y1, x2: lerp(x1, x2, u), y2: lerp(y1, y2, u), stroke: red ? BAD : MUT, 'stroke-width': red ? 3 : 2 }); }
  // 휴대폰 화면 (Activity)
  function phone(cx, cy, name, dead, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -60, y: -100, width: 120, height: 200, rx: 18, fill: dead ? SOFT : PANEL, stroke: dead ? OFF : INK, 'stroke-width': 2.5 }, g);
    el('rect', { x: -46, y: -80, width: 92, height: 140, rx: 6, fill: dead ? GRID : ACCBG, opacity: dead ? 0.6 : 1 }, g);
    if (o.bare) return g;
    tx(0, -6, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: dead ? MUT : ACC }, g);
    tx(0, 14, dead ? 'destroyed' : '활성', { 'text-anchor': 'middle', 'font-size': 13.5, fill: dead ? BAD : MUT, class: dead ? 'mono' : null }, g); return g; }
  function hbar(x, y, w, f, col, label) { el('rect', { x, y: y - 10, width: w, height: 20, rx: 5, fill: PANEL, stroke: GRID, 'stroke-width': 1.4 });
    el('rect', { x, y: y - 10, width: Math.max(0, w * clamp(f)), height: 20, rx: 5, fill: col, opacity: 0.65 });
    if (label) mono(x + w + 10, y + 5, label, { 'font-size': 14, 'font-weight': 800, fill: col }); }

  // ---------- 1. 누수 — 끝낼 사람이 없다 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 3) { // 화면을 넘길 때마다 하나씩 쌓인다
      const n = lerp(1, 5, E(u, 0.2, 2.2));
      for (let i = 0; i < 5; i++) { const s = i < n - 0.5 ? 1 : 0; phone(110 + i * 34, 190 - i * 8, '', true, { s: 0.62, op: s ? 0.9 : 0, bare: true }); }
      el('rect', { x: 400, y: 60, width: 520, height: 240, rx: 14, fill: WARNBG, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      mono(420, 88, 'GlobalScope · 앱이 끝날 때까지', { 'font-size': 15, 'font-weight': 800, fill: WARN });
      for (let i = 0; i < 5; i++) { const s = i < n - 0.5 ? pop(u, 0.2 + i * 0.45) : 0; if (s <= 0) continue;
        job(500 + (i % 3) * 150, 150 + Math.floor(i / 3) * 70, 'launch', 'leak', { s, w: 110 }); }
      mono(660, 340, '남은 코루틴 ' + Math.round(n) + '개', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: WARN });
      sub(660, 372, '화면 전환 수는 예시. 시작한 곳은 있어도 끝내는 곳이 없다', 1); return; }
    const dead = k === 2 && u > 0.4;
    phone(130, 200, 'Activity', dead || k === 3);
    if (dead) cross(176, 108, 15, pop(u, 0.4));
    // GlobalScope: 화면과 상관없는 긴 수명
    el('rect', { x: 300, y: 50, width: 620, height: 44, rx: 10, fill: WARNBG, stroke: WARN, 'stroke-width': 1.8 });
    mono(316, 78, 'GlobalScope · 앱 전체 수명', { 'font-size': 15, 'font-weight': 800, fill: WARN });
    const s = k === 0 ? pop(u, 0.5) : 1;
    job(440, 170, 'GlobalScope.launch', 'leak', { s, w: 200 });
    edge(440, 153, 440, 94, k === 0 ? seg(u, 0.9, 1.3) : 1, false);
    // Activity 와 이 코루틴 사이에는 소유 관계가 없다
    el('line', { x1: 192, y1: 190, x2: 338, y2: 172, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 5' });
    if (k === 0) { mono(265, 236, '부모 Job 없음', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) });
      tx(610, 250, '이 작업을 멈출 책임자가 없다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // 5초 걸리는 요청
    const sec = k === 1 ? lerp(0, 3, E(u, 0.2, 2.4)) : lerp(3, 5, E(u, 0.6, 2.2));
    mono(560, 175, 'api.getProfile()', { 'font-size': 14.5, 'font-weight': 700 });
    hbar(560, 205, 280, sec / 5, WARN, sec.toFixed(1) + '초');
    sub(700, 240, '5초 걸리는 요청', 1);
    if (k === 1) { el('path', { d: 'M560,280 Q350,330 200,300', fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.4) });
      mono(390, 345, 'runOnUiThread { renderProfile(profile) }', { 'text-anchor': 'middle', 'font-size': 14, fill: ACC, opacity: fade(u, 1.6) }); return; }
    // k 2: 화면은 죽었는데 요청은 계속, 결과가 갈 곳이 없다
    tx(610, 300, '화면이 닫혀도 코루틴은 계속 돈다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) });
    if (sec >= 4.99) { fly(560, 250, 200, 250, seg(u, 2.2, 2.9), 'profile', { stay: true, fill: BAD, mono: true }); }
    sub(610, 330, '결과를 받을 화면이 없다', fade(u, 1.4), { 'font-size': 14.5, fill: BAD }); }

  // ---------- 2. Job 트리 ----------
  const N = { root: [480, 70], child: [480, 170], ga: [300, 280], gb: [660, 280] };
  function s2(t, c) { const { k, u } = c;
    const red = k === 3, f = red ? E(u, 0.6, 2.2) : 0;   // 취소가 위에서 아래로 내려가는 정도
    const st = (lv) => (red && f > lv * 0.33 ? 'cancel' : lv === 0 ? 'parent' : 'run');
    const [rx, ry] = N.root, [cx, cy] = N.child;
    job(rx, ry, red ? 'viewModelScope (cleared)' : 'viewModelScope', st(0), { s: k === 0 ? pop(u, 0.2) : 1, w: 260 });
    edge(rx, ry + 17, cx, cy - 17, k === 0 ? seg(u, 0.6, 1.0) : 1, red && f > 0.2);
    job(cx, cy, 'launch { … }', st(1), { s: k === 0 ? pop(u, 1.0) : 1, w: 170 });
    if (k >= 1) { [['ga', 'async { loadUser }'], ['gb', 'async { loadOrders }']].forEach(([key, n], i) => { const [x, y] = N[key];
        edge(cx, cy + 17, x, y - 17, k === 1 ? seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3) : 1, red && f > 0.55);
        job(x, y, n, st(2), { s: k === 1 ? pop(u, 0.5 + i * 0.3) : 1, w: 210 }); }); }
    if (k === 1) { card(480, 370, 260, 40, { rx: 8, text: 'display(user, orders)', fs: 14.5, mono: true, stroke: GOOD, s: pop(u, 1.6) });
      [N.ga, N.gb].forEach(([x, y], i) => dot([[x, y + 17], [480, 350]], seg(u, 1.8 + i * 0.2, 2.5 + i * 0.2), GOOD, 6)); }
    if (k === 2) { [['coroutineContext[Job]  ← 부모', N.root, 0], ['← 자식', N.child, 1], ['손자 →', N.ga, 2], ['← 손자', N.gb, 3]].forEach(([s, [x, y], i]) => {
        const right = i === 3 || i < 2; mono(right ? x + (i === 0 ? 140 : i === 1 ? 95 : 115) : x - 115, y + 5, s, { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': right ? 'start' : 'end', opacity: fade(u, 0.3 + i * 0.35) }); });
      tx(480, 370, '연결하는 코드를 한 줄도 쓰지 않았다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) }); }
    if (k === 3) { pill(800, 70, 'onCleared()', BAD, pop(u, 0.2), { mono: true, fs: 14 });
      tx(480, 370, 'cancel 을 부르는 코드 없이 트리 전체가 멈춘다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); } }

  // ---------- 3. 취소 전파 ----------
  const TX = (ms, max) => 470 + (ms / max) * 430;
  function s3(t, c) { const { k, u } = c;
    if (k >= 4) { // 형제 실패도 전파: 자식 X 가 50ms 에 실패 → 부모 → 자식 Y 취소
      const now = k === 4 ? lerp(0, 50, E(u, 0.2, 1.4)) : 50, M = 500;
      job(220, 80, 'scope.launch (부모)', k === 5 ? 'cancel' : 'parent', { w: 220 });
      [['자식 X', 170, 50], ['자식 Y', 300, 500]].forEach(([n, y, end], i) => { const failed = i === 0 && now >= 49.9, cut = i === 1 && k === 5;
        edge(220, 97, i ? 300 : 140, y - 17, 1, (i === 0 && failed && k === 4 && u > 1.5) || (cut && u > 0.6));
        job(i ? 300 : 140, y, n, failed || cut ? 'cancel' : 'run', { w: 110 });
        el('rect', { x: TX(0, M), y: y - 11, width: TX(end, M) - TX(0, M), height: 22, rx: 5, fill: 'none', stroke: i ? INFO : BAD, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
        el('rect', { x: TX(0, M), y: y - 11, width: TX(Math.min(now, end), M) - TX(0, M), height: 22, rx: 5, fill: i ? INFO : BAD, opacity: 0.6 }); });
      mono(TX(0, M), 380, '0ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(TX(50, M), 380, '50', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(TX(500, M), 380, '500ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      el('line', { x1: TX(0, M), y1: 360, x2: TX(500, M), y2: 360, stroke: MUT, 'stroke-width': 1.5 });
      if (now >= 49.9) { mono(TX(50, M) + 14, 175, 'IOException("X 실패")', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: k === 4 ? fade(u, 1.4) : 1 }); }
      if (k === 4) { dot([[140, 153], [200, 97]], seg(u, 1.5, 2.1), BAD, 7); tx(350, 60, '예외가 부모로 올라간다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); }
      if (k === 5) { dot([[240, 97], [300, 283]], seg(u, 0.2, 0.7), BAD, 7); cross(TX(50, M) + 14, 300, 10, pop(u, 0.8));
        mono(TX(275, M), 270, 'println("Y 완료")', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'text-decoration': 'line-through', opacity: fade(u, 1.2) });
        tx(TX(275, M), 336, '500ms 를 기다리다 50ms 에 함께 취소', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) }); }
      return; }
    // k 0~3: parentJob 아래 a, b. 350ms 에 부모 취소
    const M = 400, now = k <= 1 ? (k === 0 ? 0 : lerp(0, 330, E(u, 0.2, 2.4))) : k === 2 ? lerp(330, 350, E(u, 0.1, 0.6)) : 350;
    job(210, 70, 'scope (SupervisorJob)', 'parent', { w: 230, s: k === 0 ? pop(u, 0.2) : 1 });
    const pr = k >= 2 && (k === 3 || u > 0.7);
    edge(210, 87, 210, 143, k === 0 ? seg(u, 0.6, 1.0) : 1, false);
    job(210, 160, 'parentJob', pr ? 'cancel' : 'run', { w: 150, s: k === 0 ? pop(u, 1.0) : 1 });
    if (k === 0) { tx(210, 250, 'Scope 는 경계, 실제 작업 단위는 Job', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    const kr = k >= 2 && (k === 3 || u > 1.1);
    [['a', 120, 250], ['b', 300, 310]].forEach(([n, x, y], i) => { edge(210, 177, x, 233, k === 1 ? seg(u, 0.1, 0.4) : 1, k === 2 ? u > 0.9 : k === 3);
      job(x, 250, 'launch ' + n, kr ? 'cancel' : 'run', { w: 120, s: k === 1 ? pop(u, 0.3) : 1 });
      // 오른쪽 시간선: 100ms 마다 출력
      const ly = 90 + i * 70; mono(458, ly + 5, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
      el('line', { x1: TX(0, M), y1: ly, x2: TX(400, M), y2: ly, stroke: GRID, 'stroke-width': 2 });
      [100, 200, 300].forEach((ms, j) => { if (now >= ms) R.pill(TX(ms, M), ly, n + ' ' + j, i ? INFO : ACC, 1, { mono: true, fs: 13 }); });
      if (now >= 349.9) cross(TX(400, M) - 6, ly, 9, 1); });
    [0, 100, 200, 300, 400].forEach((ms) => mono(TX(ms, M), 210, ms + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    el('line', { x1: TX(now, M), y1: 64, x2: TX(now, M), y2: 196, stroke: now >= 349.9 ? BAD : INK, 'stroke-width': now >= 349.9 ? 2.4 : 1.3, 'stroke-dasharray': '3 3' });
    if (k === 2) { pill(TX(350, M), 50, 'parentJob.cancel()', BAD, pop(u, 0.5), { mono: true, fs: 13.5 });
      dot([[210, 177], [120, 233]], seg(u, 0.8, 1.2), BAD, 6); dot([[210, 177], [300, 233]], seg(u, 0.8, 1.2), BAD, 6); }
    if (k === 3) { terminal(470, 228, 430, 186, ['a 0', 'b 0', 'a 1', 'b 1', 'a 2', 'b 2', ['(취소 — 남은 997회는 돌지 않음)', '#fca5a5']], lerp(0, 7, E(u, 0.2, 1.6)), { title: '출력 (같은 시각의 a·b 순서는 바뀔 수 있다)', lh: 20, fs: 13.5 }); } }

  // ---------- 4. 협력적 취소 ----------
  function loop(cx, cy, r, t, spin, col) { el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 10 });
    const a = spin ? t * 4 : 0.3; el('path', { d: `M${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a + 2.2)},${cy + r * Math.sin(a + 2.2)}`, fill: 'none', stroke: col, 'stroke-width': 10, 'stroke-linecap': 'round' }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { const ok = k === 1, stop = ok && u > 1.5;
      loop(260, 200, 90, t, !stop, stop ? BAD : ok ? GOOD : WARN);
      mono(260, 194, 'compute(i++)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
      mono(260, 218, ok ? 'ensureActive()' : 'suspend 함수 없음', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ok ? GOOD : WARN, 'font-weight': 700 });
      if (ok) { el('rect', { x: 340, y: 186, width: 22, height: 28, rx: 4, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); tx(395, 160, '확인 지점', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle' }); }
      // 취소 신호가 날아온다
      const p = seg(u, 0.3, 1.3); pill(lerp(800, 440, E(p, 0, 1)), 200, 'cancel()', BAD, p > 0 && (p < 1 || (ok && !stop)) ? 1 : 0, { mono: true, fs: 14 });
      if (!ok) { if (p >= 1) { const b = seg(u, 1.3, 2.0); pill(lerp(440, 680, b), 200 - Math.sin(b * Math.PI) * 60, 'cancel()', BAD, b < 1 ? 1 : 0, { mono: true, fs: 14 }); }
        tx(640, 320, '읽어 주는 곳이 없어 신호가 무시된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) }); }
      else { if (stop) pill(620, 300, 'CancellationException', BAD, pop(u, 1.6), { mono: true, fs: 14 });
        tx(620, 350, '다음 바퀴의 ensureActive() 에서 멈춘다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); }
      return; }
    if (k === 2) { // yield: 1000회마다 양보 → 다른 코루틴이 끼어든다
      const x0 = 180, w = 700, head = E(u, 0.2, 2.4);
      el('rect', { x: x0, y: 145, width: w, height: 30, rx: 6, fill: SOFT, stroke: GRID }); mono(x0 - 12, 165, 'Thread', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700 });
      const S = [[0, 0.22, 'loop'], [0.22, 0.3, 'C-2'], [0.3, 0.52, 'loop'], [0.52, 0.6, 'C-2'], [0.6, 0.82, 'loop'], [0.82, 0.9, 'C-2'], [0.9, 1, 'loop']];
      S.forEach(([a, b, n]) => { const e = Math.min(head, b); if (e <= a) return; const lp = n === 'loop';
        el('rect', { x: x0 + a * w + 2, y: 149, width: (e - a) * w - 4, height: 22, rx: 4, fill: lp ? GOODBG : INFOBG, stroke: lp ? GOOD : INFO, 'stroke-width': 1.6 });
        if ((e - a) * w > 50) tx(x0 + (a + (e - a) / 2) * w, 165, lp ? '1000회' : 'C-2', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: lp ? GOOD : INFO, class: 'mono' }); });
      [0.22, 0.52, 0.82].forEach((a, i) => { if (head > a) { grow(x0 + a * w, 110, x0 + a * w, 142, 1, WARN); mono(x0 + a * w, 100, 'yield()', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700 }); } });
      tx(530, 240, 'yield() 는 취소를 확인하고, 다른 코루틴에게 차례를 넘긴다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.4) });
      tx(530, 272, 'ensureActive() 는 확인만 하고 스레드는 넘기지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k 3·4: try/finally 로 자원 정리
    const conn = (x, y, open, s) => { const g = R.G(x, y, s ?? 1); el('rect', { x: -40, y: -22, width: 80, height: 44, rx: 8, fill: open ? WARNBG : GOODBG, stroke: open ? WARN : GOOD, 'stroke-width': 2.2 }, g);
      tx(0, 5, open ? 'conn 열림' : 'conn 닫힘', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: open ? WARN : GOOD }, g); };
    if (k === 3) { conn(110, 200, u < 2.2, pop(u, 0.2));
      el('rect', { x: 200, y: 120, width: 330, height: 70, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 1.8 }); mono(216, 146, 'try { readData(conn) }', { 'font-size': 14.5, 'font-weight': 700 });
      const g = Math.min(E(u, 0.3, 1.6), 0.55); el('rect', { x: 216, y: 160, width: 300 * g, height: 14, rx: 4, fill: ACC, opacity: 0.6 });
      if (u > 1.2) { cross(216 + 300 * 0.55 + 12, 167, 9, pop(u, 1.2)); pill(700, 155, 'cancel → 예외', BAD, pop(u, 1.1), { fs: 14 }); }
      el('rect', { x: 200, y: 230, width: 330, height: 60, rx: 10, fill: u > 1.6 ? GOODBG : SOFT, stroke: u > 1.6 ? GOOD : INK, 'stroke-width': 1.8 }); mono(216, 266, 'finally { … }', { 'font-size': 14.5, 'font-weight': 700, fill: u > 1.6 ? GOOD : INK });
      grow(365, 192, 365, 228, seg(u, 1.4, 1.7), GOOD);
      tx(480, 350, '취소도 예외라서 finally 는 그대로 실행된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.9) }); return; }
    // k 4: finally 안에서 suspend — NonCancellable 이 없으면 바로 취소된다
    [['finally { conn.closeAsync() }', false, 110], ['finally { withContext(NonCancellable) { conn.closeAsync() } }', true, 250]].forEach(([s, ok, y], i) => { const op = fade(u, 0.2 + i * 0.9);
      el('rect', { x: 40, y: y - 30, width: 610, height: 60, rx: 10, fill: SOFT, stroke: ok ? GOOD : BAD, 'stroke-width': 2, opacity: op });
      mono(56, y + 5, s, { 'font-size': 14, 'font-weight': 700, opacity: op });
      const s2 = pop(u, 0.7 + i * 0.9); if (s2 > 0) { conn(780, y, !ok, s2); if (ok) check(860, y, 12, s2); else cross(860, y, 11, s2); }
      sub(345, y + 50, ok ? '취소를 잠시 막아 close 가 끝까지 돈다' : '이미 취소된 코루틴이라 suspend 호출이 바로 취소된다', op, { 'font-size': 14, fill: ok ? GOOD : BAD, 'font-weight': 700 }); }); }

  // ---------- 5. withTimeout · use ----------
  const TT = (ms) => 220 + (ms / 3000) * 640;
  function tline(y, end, cap, col, label) { el('rect', { x: TT(0), y: y - 12, width: TT(end) - TT(0), height: 24, rx: 5, fill: 'none', stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });
    el('rect', { x: TT(0), y: y - 12, width: TT(Math.min(cap, end)) - TT(0), height: 24, rx: 5, fill: col, opacity: 0.6 }); if (label) mono(TT(0) - 12, y + 5, label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end' }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { const now = lerp(0, 3000, E(u, 0.2, 2.2));
      el('line', { x1: TT(2000), y1: 60, x2: TT(2000), y2: 300, stroke: BAD, 'stroke-width': 2.5 }); mono(TT(2000), 50, k === 0 ? 'withTimeout(2000)' : 'withTimeoutOrNull(2000)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: BAD });
      tline(120, 1200, now, GOOD, '빠른 응답'); tline(220, 3000, Math.min(now, 2000), WARN, '느린 응답');
      if (now >= 1200) pill(TT(1200) + 60, 120, '결과 반환', GOOD, 1, { fs: 13.5 });
      if (now >= 2000) { cross(TT(2000) + 14, 220, 10, 1); pill(TT(2000) + 140, 260, k === 0 ? 'TimeoutCancellationException' : 'null 반환', BAD, 1, { mono: true, fs: 13.5 }); }
      [0, 1000, 2000, 3000].forEach((ms) => mono(TT(ms), 330, ms + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      el('line', { x1: TT(now), y1: 90, x2: TT(now), y2: 300, stroke: INK, 'stroke-width': 1.3, 'stroke-dasharray': '3 3' });
      sub(480, 372, '응답 시각 1200ms·3000ms 는 예시. 한도를 넘으면 안쪽 코루틴이 취소된다', fade(u, 1.0), { 'font-size': 14 }); return; }
    if (k === 2) { // use: 정상이든 예외든 close()
      card(170, 200, 200, 80, { rx: 12, stroke: INK, text: 'inputStream()\n.use { … }', fs: 15, mono: true });
      [['정상 종료', 120, GOOD], ['예외 · 취소', 280, BAD]].forEach(([n, y, col], i) => { grow(272, 200, 500, y, seg(u, 0.3 + i * 0.6, 0.8 + i * 0.6), col);
        pill(560, y, n, col, pop(u, 0.7 + i * 0.6), { fs: 14 }); grow(630, y, 720, 200, seg(u, 1.0 + i * 0.6, 1.4 + i * 0.6), GOOD); });
      card(800, 200, 150, 60, { rx: 10, stroke: GOOD, fill: GOODBG, text: 'close()', fs: 16, mono: true, color: GOOD, s: pop(u, 1.4) });
      tx(480, 370, '어느 길로 나가든 close() 가 불린다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) }); return; }
    // k 3·4: 세 겹 — Dispatchers.IO ⊃ withTimeout(5000) ⊃ db.use
    const L = [['withContext(Dispatchers.IO)', INFO, 40, 40, 880, 330], ['withTimeout(5000)', WARN, 90, 90, 780, 240], ['Database.connect().use { db ->', GOOD, 140, 140, 680, 150]];
    L.forEach(([n, col, x, y, w, h], i) => { const g = k === 3 ? E(u, 0.2 + i * 0.5, 0.8 + i * 0.5) : 1; if (g <= 0) return;
      el('rect', { x, y, width: w * g, height: h, rx: 14, fill: 'none', stroke: col, 'stroke-width': 2.4 });
      mono(x + 14, y + 24, n, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: g > 0.5 ? 1 : 0 }); });
    if (k === 3) { [['스레드', 820, 64], ['시간', 720, 114], ['자원', 620, 164]].forEach(([s, x, y], i) => tx(x, y, s + ' 담당', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.5) }));
      return; }
    // k 4: 쿼리 → map → first → Report, 그리고 db 닫힘
    const st = [['db.query(…)', 230], ['.map { Report.fromRow(it) }', 430], ['.first()', 620]];
    st.forEach(([s, x], i) => mono(x, 230, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.3) }));
    fly(230, 260, 880, 395, seg(u, 1.0, 2.0), 'Report', { stay: true, mono: true, fill: GOOD });
    const shut = u > 1.6; card(730, 262, 120, 34, { rx: 8, text: shut ? 'db 닫힘' : 'db 열림', fs: 14, stroke: shut ? GOOD : WARN, color: shut ? GOOD : WARN, fill: shut ? GOODBG : WARNBG });
    sub(410, 400, '5초를 넘겨 취소돼도 use 가 db 를 닫는다', fade(u, 1.8), { 'font-size': 14.5, 'font-weight': 700 }); }

  const quiz = [
    { q: 'GlobalScope.launch로 띄운 요청이 화면이 닫힌 뒤에도 계속 도는 까닭은 무엇인가?',
      o: ['요청이 5초나 걸려서', '그 코루틴을 멈출 부모 Job이 없어서', 'runOnUiThread를 써서'], a: 1,
      why: 'GlobalScope는 앱 전체 수명을 따르고 화면과 부모-자식 관계가 없다. 화면이 사라져도 취소해 줄 쪽이 없다.' },
    { q: 'viewModelScope.launch 안에서 async 두 개를 띄웠다. ViewModel이 정리되면 async 들은 어떻게 되나?',
      o: ['자동으로 함께 취소된다', '끝날 때까지 계속 돈다', '직접 cancel을 불러야 멈춘다'], a: 0,
      why: 'launch와 async는 viewModelScope의 Job 아래 자식·손자로 붙는다. 부모가 취소되면 트리 전체로 취소가 내려간다.' },
    { q: '100ms마다 출력하는 자식 a, b를 둔 parentJob을 350ms에 cancel 하면 각자 몇 번 출력하나?',
      o: ['3번', '1번', '1000번'], a: 0,
      why: '100, 200, 300ms에 한 번씩 출력하고 400ms를 기다리던 delay에서 취소된다. 남은 997회는 돌지 않는다.' },
    { q: 'suspend 호출이 없는 CPU 루프에 cancel을 걸었는데 멈추지 않는다. 무엇을 넣어야 하나?',
      o: ['Thread.sleep', 'finally 블록', '루프 안에 ensureActive()나 yield()'], a: 2,
      why: '취소는 신호라서 코드가 읽어야 멈춘다. ensureActive()는 취소됐으면 CancellationException을 던지고, yield()는 확인에 더해 차례도 넘긴다.' },
    { q: 'withTimeoutOrNull(2000) 안의 호출이 2초를 넘기면 무엇을 돌려받나?',
      o: ['TimeoutCancellationException', '늦게라도 받은 결과', 'null'], a: 2,
      why: 'withTimeout은 예외로, withTimeoutOrNull은 null로 시간 초과를 알린다. 실패를 값으로 다루고 싶을 때 쓴다.' },
  ];

  const summary = [
    'GlobalScope로 띄운 코루틴은 멈출 부모가 없어 화면이 닫혀도 계속 돈다.',
    'Scope 안에서 띄운 launch와 async는 부모-자식 Job 트리로 자동 연결된다.',
    '부모를 취소하거나 자식 하나가 실패하면 트리 전체로 취소가 내려간다.',
    '취소는 suspend 지점이나 ensureActive 에서만 걸리고, 정리는 finally와 use가 맡는다.',
  ];
  const review = [
    { q: '화면을 빠르게 넘기는 테스트 뒤 메모리 사용량이 계속 오른다. 코드에 GlobalScope.launch가 보인다. 먼저 바꿀 것은?',
      o: ['요청 시간을 줄인다', '화면 수명에 묶인 lifecycleScope·viewModelScope로 띄운다', 'launch를 async로 바꾼다'], a: 1,
      why: '수명이 정해진 Scope에서 띄우면 화면이 사라질 때 자식이 모두 취소된다. 남는 코루틴이 쌓이지 않는다.' },
    { q: '이미지 변환 루프를 담은 코루틴이 취소 뒤에도 몇 초 더 CPU를 쓴다. 루프 안에는 suspend 호출이 없다. 어디를 고치나?',
      o: ['루프 안에서 ensureActive()로 취소를 확인한다', 'withTimeout을 더 짧게 건다', 'SupervisorJob으로 바꾼다'], a: 0,
      why: '취소는 협력적이다. 타임아웃도 같은 취소라서 루프가 확인하지 않으면 멈추지 않는다.' },
    { q: 'finally에서 conn.closeAsync()를 불렀는데 취소된 경우에만 연결이 닫히지 않는다. 왜인가?',
      o: ['finally가 실행되지 않아서', 'use를 두 번 불러서', 'closeAsync가 suspend라 이미 취소된 코루틴에서 바로 취소돼서'], a: 2,
      why: '취소된 코루틴에서 suspend 함수를 부르면 곧바로 CancellationException이 난다. withContext(NonCancellable)로 감싸야 close가 끝까지 돈다.' },
  ];

  R.page({ title: '코루틴 Job 트리', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
