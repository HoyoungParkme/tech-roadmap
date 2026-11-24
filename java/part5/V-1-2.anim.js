/* V-1-2 스레드와 동시성 기초 — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 실행마다 달라지는 값(경쟁 결과 137,492, 반복 횟수 등)은 코드 주석의 예시를 그대로 쓰고 그림에 "예시"로 적는다.
 * 1000 * 1.1 = 1100.0 은 python 으로 같은 IEEE 754 double 계산을 해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, fly, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // 스레드 줄: x1 → x2 를 u 만큼, dash 면 기다리는 중
  function lane(x1, x2, y, u, col, o) { o = o || {}; if (u <= 0) return;
    el('line', { x1, y1: y, x2: lerp(x1, x2, clamp(u)), y2: y, stroke: col || INK, 'stroke-width': o.sw || 5, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }
  // 스레드 이름표
  const tag = (x, y, s, col, sc, o) => card(x, y, (o && o.w) || 104, 32, { rx: 16, text: s, fs: 14, mono: true, fw: 800, stroke: col || INK, fill: (o && o.fill) || PANEL, color: col || INK, s: sc });
  // 힙의 칸 (이름 + 값)
  function cell(cx, cy, name, val, o) { o = o || {}; const w = o.w || 170, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -34, width: w, height: 68, rx: 10, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': o.sw || 2.4 }, g);
    tx(0, -12, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }, g);
    mono(0, 20, String(val), { 'text-anchor': 'middle', 'font-size': o.fs || 22, 'font-weight': 800, fill: o.col || INK }, g); }

  // =========================================================
  // 1. 스레드 — 프로세스 안의 실행 줄기, 힙은 함께 쓴다
  // =========================================================
  const L = { main: 92, w1: 162, w2: 222, x0: 150, fork: 250, end: 560 };
  function s1(t, c) { const { k, u } = c;
    zone(20, 20, 920, 380, 'MyApp 프로세스');
    zone(600, 46, 326, 220, '힙 · 모든 스레드가 함께 쓴다', { fill: INFOBG, color: INFO });
    // main 줄
    tag(84, L.main, 'main', ACC, k === 0 ? pop(u, 0.2) : 1);
    const mainEnd = k === 0 ? seg(u, 0.4, 1.6) * 0.35 : k <= 2 ? 0.35 : 1;
    if (k < 4) lane(L.x0, L.end, L.main, k === 3 ? lerp(0.35, 0.62, E(u, 0.2, 1.4)) : mainEnd, ACC);
    if (k === 0) sub(300, 130, '실행 흐름은 아직 하나', fade(u, 1.4), { 'font-size': 14.5, fill: INK });
    // 힙 안의 job · Thread 객체
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1;
      card(763, 96, 220, 52, { rx: 9, text: 'Runnable job\n() -> 이름 출력', fs: 14, mono: true, stroke: INFO, sw: 2.2, s });
      if (k === 1) sub(300, 130, '"무엇을 할지"만 만들었다 · 실행은 아직', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); }
    if (k >= 2) { const st = k === 2 ? 'NEW' : k === 5 ? 'TERMINATED' : 'RUNNABLE';
      [['worker-1', 680], ['worker-2', 846]].forEach(([n, x], i) => { const s = k === 2 ? pop(u, 0.3 + i * 0.4) : 1;
        card(x, 200, 150, 60, { rx: 9, text: 'Thread ' + n + '\n' + st, fs: 13.5, mono: true, stroke: INK, s });
        grow(x, 168, 763 + (i ? 30 : -30), 124, k === 2 ? seg(u, 0.9 + i * 0.4, 1.4 + i * 0.4) : 1, INFO, { sw: 2 }); });
      if (k === 2) sub(300, 130, 'Thread 객체만 생겼다 · 같은 job 을 들고 있다', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); }
    // start(): 두 줄로 갈라진다
    if (k >= 3) { const g = k === 3 ? seg(u, 0.6, 1.6) : 1, w = k === 3 ? seg(u, 1.0, 2.4) : 1;
      [[L.w1, 'worker-1'], [L.w2, 'worker-2']].forEach(([y, n], i) => {
        if (g > 0) el('path', { d: `M${L.fork},${L.main} C${L.fork + 30},${L.main} ${L.fork + 10},${y} ${L.fork + 50},${y}`, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: g });
        tag(84, y, n, INFO, g, { w: 112 });
        const endX = k >= 4 ? 450 + i * 30 : L.end;
        lane(L.fork + 50, endX, y, w * (k >= 4 ? 1 : 0.8), INFO);
        if (k >= 4) { el('line', { x1: endX + 6, y1: y - 12, x2: endX + 6, y2: y + 12, stroke: INFO, 'stroke-width': 3 }); } });
      if (k === 3) { pill(400, 132, 't1.start() · t2.start()', ACC, pop(u, 0.2), { mono: true, fs: 14, fill: PANEL });
        tx(300, 300, '실행 흐름 1개 → 3개', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.0) }); } }
    // join(): main 이 기다린다
    if (k >= 4) { lane(L.x0, L.fork + 50, L.main, 1, ACC);
      lane(L.fork + 50, 486, L.main, k === 4 ? seg(u, 0.2, 1.2) : 1, ACC, { dash: '4 9', sw: 4 });
      lane(486, L.end, L.main, k === 4 ? seg(u, 1.8, 2.6) : 1, ACC);
      if (k === 4) { tx(370, 76, 'join() · WAITING', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
        tx(300, 300, '두 워커가 끝나야 main 이 다음 줄로 간다', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 1.8) }); } }
    if (k === 5) { const a = fade(u, 0.3), b = fade(u, 1.1);
      tx(60, 282, '출력 순서는 실행마다 다를 수 있다', { 'font-size': 15, 'font-weight': 800, fill: INK });
      terminal(50, 294, 410, 102, ['worker-1 작업 시작', 'worker-2 작업 시작', 'main 종료'].map((s, i) => [s, i === 2 ? 'var(--panel)' : null]), a > 0 ? 3 : 0, { lh: 18, fs: 13.5, title: '실행 A' });
      if (b > 0) terminal(490, 294, 410, 102, ['worker-2 작업 시작', 'worker-1 작업 시작', 'main 종료'].map((s, i) => [s, i === 2 ? 'var(--panel)' : null]), 3, { lh: 18, fs: 13.5, title: '실행 B' }); } }

  // =========================================================
  // 2. 레이스 컨디션 — count++ 는 읽기 · +1 · 쓰기
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    // k===3 의 교차 실행에서 메모리 값
    const mem = k === 3 ? (u < 1.6 ? 0 : 1) : k === 4 ? '예: 137,492' : 0;
    cell(480, 70, 'static int count (힙)', mem, { s: k === 0 ? pop(u, 0.2) : 1, w: k === 4 ? 230 : 190, stroke: k === 3 && u > 2.2 ? BAD : INK, col: k === 4 ? BAD : INK, fs: k === 4 ? 19 : 22 });
    if (k <= 1) lock(600, 68, false, MUT, 0.9);
    if (k === 0) { sub(480, 150, '보호 장치 없이 두 스레드가 함께 쓴다', fade(u, 1.0), { 'font-size': 15, fill: INK }); }
    tag(170, 190, 'T1', ACC, k === 0 ? fade(u, 1.4) : 1, { w: 70 }); tag(790, 190, 'T2', INFO, k === 0 ? fade(u, 1.6) : 1, { w: 70 });
    if (k === 0) return;
    if (k === 1) { [[170, ACC], [790, INFO]].forEach(([x, col], i) => { const v = seg(u, 0.3, 2.2);
        R.hbar(x - 120, 226, 200, v * 100000, 100000, { col, label: false });
        mono(x - 20, 270, fmt(v * 100000) + ' 회', { 'font-size': 15, 'text-anchor': 'middle', fill: col, 'font-weight': 700 }); });
      pill(480, 300, '기대: 100,000 + 100,000 = 200,000', GOOD, pop(u, 2.0), { mono: true, fs: 15, fill: PANEL }); return; }
    if (k === 2) { const parts = [['읽기', 'getstatic'], ['+1', 'iadd'], ['쓰기', 'putstatic']];
      card(480, 172, 160, 40, { rx: 8, text: 'count++', fs: 17, mono: true, fw: 800, s: pop(u, 0.1) });
      parts.forEach(([a, b], i) => { const x = 300 + i * 180, s = pop(u, 0.7 + i * 0.35);
        grow(480, 194, x, 232, seg(u, 0.5 + i * 0.35, 0.9 + i * 0.35), MUT, { plain: true });
        card(x, 262, 150, 56, { rx: 9, text: a + '\n' + b, fs: 14.5, mono: true, stroke: WARN, sw: 2.2, s }); });
      tx(480, 340, '세 단계 사이에 다른 스레드가 끼어들 수 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) });
      sub(480, 366, '(javac 이 static 필드의 count++ 를 바꾼 바이트코드)', fade(u, 2.2)); return; }
    if (k === 3) { // 시간 줄: T1 읽기 0 · T2 읽기 0 · T1 쓰기 1 · T2 쓰기 1
      const ty = [250, 330], ev = [[0, '읽기 0', 0.2], [1, '읽기 0', 0.7], [0, '쓰기 1', 1.3], [1, '쓰기 1', 1.9]];
      el('line', { x1: 120, y1: 380, x2: 860, y2: 380, stroke: MUT, 'stroke-width': 1.5, 'marker-end': 'url(#ra-ah)' }); tx(860, 400, '시간', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      tx(80, ty[0] + 5, 'T1', { 'font-size': 15, 'font-weight': 800, fill: ACC }); tx(80, ty[1] + 5, 'T2', { 'font-size': 15, 'font-weight': 800, fill: INFO });
      ev.forEach(([who, s, at], i) => { const x = 200 + i * 170, sc = pop(u, at + 0.2);
        card(x, ty[who], 130, 38, { rx: 8, text: s, fs: 14.5, mono: true, stroke: who ? INFO : ACC, fill: s.startsWith('쓰기') ? WARNBG : PANEL, s: sc });
        const up = s.startsWith('쓰기'); dot(up ? [[x, ty[who] - 20], [480, 104]] : [[480, 104], [x, ty[who] - 20]], seg(u, at - 0.2, at + 0.3), who ? INFO : ACC, 6); });
      if (u > 2.2) pill(700, 140, '두 번 더했는데 1', BAD, pop(u, 2.2), { fs: 15, fill: PANEL }); return; }
    // k === 4: 결과
    const v = seg(u, 0.3, 1.6);
    tx(140, 236, '기대', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end' }); R.hbar(160, 222, 560, 200000 * v, 200000, { col: GOOD, text: '200,000' });
    tx(140, 286, '실제 (예)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: BAD }); R.hbar(160, 272, 560, 137492 * v, 200000, { col: BAD, text: '137,492' });
    tx(480, 350, '실행마다 다른, 더 작은 수 · 예외도 경고도 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }

  // =========================================================
  // 3. 가시성 — 코어마다 다른 값을 볼 수 있다 (volatile)
  // =========================================================
  function core(cx, name, who, val, o) { o = o || {};
    card(cx, 96, 230, 120, { rx: 12, stroke: GRID, sw: 2, fill: SOFT, op: o.op });
    tx(cx - 100, 58, name, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    tag(cx - 50, 100, who, o.tcol || INK, o.op ?? 1, { w: 90 });
    card(cx + 58, 106, 92, 52, { rx: 8, text: '캐시\n' + val, fs: 14, mono: true, stroke: o.bad ? BAD : INK, color: o.bad ? BAD : INK, fill: PANEL, op: o.op }); }
  function spin(cx, cy, t, col, on) { const a = on ? t * 6 : 0;
    el('path', { d: `M${cx + 16},${cy} A16,16 0 1 1 ${cx},${cy - 16}`, fill: 'none', stroke: col, 'stroke-width': 3, transform: `rotate(${a * 57.3} ${cx} ${cy})`, 'marker-end': col === BAD ? 'url(#ra-ahr)' : 'url(#ra-ah)' }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 5) { tx(480, 46, 'volatile int count 에 count++ 를 두 스레드가', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
      cell(480, 120, 'volatile int count', u < 1.8 ? 5 : 6, { w: 210, stroke: u > 1.8 ? BAD : INK });
      [[260, 'T1', ACC], [700, 'T2', INFO]].forEach(([x, n, col], i) => { tag(x, 230, n, col, 1, { w: 70 });
        mono(x, 280, '읽기 5 → 6 쓰기', { 'font-size': 15, 'text-anchor': 'middle', fill: col, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
        dot([[480, 154], [x, 210]], seg(u, 0.2 + i * 0.3, 0.8 + i * 0.3), col, 6); dot([[x, 210], [480, 154]], seg(u, 1.2 + i * 0.3, 1.8 + i * 0.3), col, 6); });
      pill(480, 340, '가시성은 있어도 원자성은 없다 · 결과 6 (7 이어야 함)', BAD, pop(u, 2.1), { fs: 15, fill: PANEL }); return; }
    const writeF = k >= 3, fresh = k >= 4, readF = k === 4 && u > 1.4;
    const memVal = writeF && (k > 3 || u > 1.2) ? 'false' : 'true';
    cell(480, 330, (k === 3 ? 'boolean running' : 'volatile boolean running') + ' (메모리)', memVal, { w: 300, s: k === 0 ? pop(u, 0.2) : 1, stroke: memVal === 'false' ? WARN : INK });
    if (k === 0) { sub(480, 250, '정지 플래그 · 처음 값 true', fade(u, 0.8), { 'font-size': 15, fill: INK }); return; }
    const c1 = writeF && (k > 3 || u > 0.5) ? 'false' : 'true', c2 = readF ? 'false' : 'true';
    if (k > 1) core(230, 'Core 1', 'main', c1, { tcol: ACC });
    core(730, 'Core 2', 'worker', c2, { bad: k === 3 || (k === 4 && !readF), tcol: INFO });
    const looping = !(k === 4 && u > 1.8);
    spin(680, 186, t, k === 3 ? BAD : INFO, looping); mono(706, 192, looping ? 'while (running)' : '멈춤', { 'font-size': 14, fill: k === 3 ? BAD : looping ? INFO : GOOD, 'font-weight': 700 });
    if (k === 1) { dot([[788, 132], [600, 300]], (t * 0.7) % 1, INFO, 5); sub(380, 210, 'worker 가 쉬지 않고 running 을 읽는다', fade(u, 0.8), { 'font-size': 14.5, fill: INK }); }
    if (k === 2) { pill(230, 196, 'worker.start()', ACC, pop(u, 0.2), { mono: true, fs: 14, fill: PANEL }); sub(480, 248, '두 코어가 각자 자기 캐시의 true 를 본다', fade(u, 1.0), { 'font-size': 14.5, fill: INK }); }
    if (k === 3) { pill(230, 196, 'running = false', WARN, pop(u, 0.1), { mono: true, fs: 14, fill: PANEL });
      dot([[288, 132], [440, 300]], seg(u, 0.5, 1.2), WARN, 7);
      tx(730, 250, 'volatile 이 없으면 옛 true 만 본다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k === 4) { pill(480, 226, 'volatile · 쓰기가 다음 읽기에 보인다', GOOD, pop(u, 0.2), { fs: 14.5, fill: PANEL });
      dot([[520, 300], [770, 134]], seg(u, 0.7, 1.4), GOOD, 7);
      if (u > 1.9) mono(840, 260, '멈춤. 반복 예: 4,821,337회', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'end' }); } }

  // =========================================================
  // 4. synchronized — 모니터 락, 그리고 데드락
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k <= 1) { cell(480, 300, 'static int count', k === 1 ? Math.round(tween(0, 2, u - 0.6, 1.6)) : 0, { w: 180 });
      card(480, 110, 200, 70, { rx: 12, stroke: k === 1 ? ACC : INK, sw: 2.4, s: k === 0 ? pop(u, 0.2) : 1 });
      tx(480, 96, 'Object lock', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' });
      const owner = k === 1 ? (u < 1.4 ? 'T1' : u < 2.3 ? 'T2' : '없음') : '없음';
      lock(480, 128, k === 1 && owner !== '없음', owner === 'T1' ? ACC : owner === 'T2' ? INFO : MUT, 0.9);
      tx(600, 116, '주인: ' + owner, { 'font-size': 14.5, 'font-weight': 700, fill: owner === 'T1' ? ACC : owner === 'T2' ? INFO : MUT });
      if (k === 0) { grow(480, 145, 480, 264, seg(u, 0.8, 1.6), MUT, { dash: '5 5' }); sub(560, 210, '이 락이 count 를 지킨다', fade(u, 1.4), { 'font-size': 14.5, fill: INK, 'text-anchor': 'start' }); return; }
      // T1 이 먼저 들어가고 T2 는 입구에서 BLOCKED
      const t1x = u < 0.4 ? 160 : u < 1.4 ? 400 : 160, t2x = u < 1.4 ? 250 : u < 2.3 ? 560 : 800;
      tag(t1x, 210, 'T1', ACC, 1, { w: 64 }); tag(t2x, 210, 'T2', INFO, 1, { w: 64 });
      tx(250, 250, u < 1.4 ? 'T2 · BLOCKED (대기)' : '', { 'text-anchor': 'middle', 'font-size': 14, fill: WARN, 'font-weight': 700 });
      el('rect', { x: 340, y: 176, width: 280, height: 70, rx: 10, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      tx(352, 196, 'synchronized 구역', { 'font-size': 13.5, fill: ACC, 'font-weight': 700 });
      return; }
    // k 2~4: 데드락
    const A = [300, 110], B = [660, 110], T1 = [300, 300], T2 = [660, 300];
    [[A, 'Lock A'], [B, 'Lock B']].forEach(([p, n], i) => { card(p[0], p[1], 150, 64, { rx: 10, stroke: INK, s: k === 2 ? pop(u, 0.2 + i * 0.3) : 1 }); lock(p[0] - 40, p[1] + 2, true, INK, 0.8); tx(p[0] + 18, p[1] + 6, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); });
    card(T1[0], T1[1], 150, 50, { rx: 25, text: 'T1 · bad1()', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC });
    const fix = k === 4, two = k >= 3;
    if (two) card(T2[0], T2[1], 150, 50, { rx: 25, text: 'T2 · bad2()', fs: 15, mono: true, fw: 800, stroke: INFO, color: INFO, s: k === 3 ? pop(u, 0.2) : 1 });
    // T1: A 보유(실선) → B 원함(점선)
    grow(T1[0], T1[1] - 25, A[0], A[1] + 34, k === 2 ? seg(u, 0.6, 1.2) : 1, ACC, { sw: 3 });
    tx(T1[0] - 14, 214, '보유', { 'font-size': 14, fill: ACC, 'font-weight': 700, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 1.2) : 1 });
    if (!fix || u < 0.6) grow(T1[0] + 40, T1[1] - 25, B[0] - 40, B[1] + 34, k === 2 ? seg(u, 1.4, 2.2) : 1, BAD, { dash: '6 5', sw: 2.6 });
    if (k === 2) tx(480, 196, '원함', { 'font-size': 14, fill: BAD, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
    if (k === 3) { grow(T2[0], T2[1] - 25, B[0], B[1] + 34, seg(u, 0.5, 1.0), INFO, { sw: 3 });
      grow(T2[0] - 40, T2[1] - 25, A[0] + 40, A[1] + 34, seg(u, 1.1, 1.8), BAD, { dash: '6 5', sw: 2.6 });
      tx(T2[0] + 14, 214, '보유', { 'font-size': 14, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.0) });
      if (u > 1.9) { el('circle', { cx: 480, cy: 205, r: 46, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '8 6', transform: `rotate(${t * 40} 480 205)` }); }
      tx(480, 380, '서로 상대의 락을 영원히 기다린다 · 데드락', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) }); }
    if (fix) { tx(480, 40, '두 메서드 모두 A → B 순서로 잡는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.2) });
      grow(T1[0] + 40, T1[1] - 25, B[0] - 40, B[1] + 34, seg(u, 0.8, 1.4), GOOD, { sw: 3 });
      tx(T2[0] + 90, 250, 'A 를 기다림 (줄 서기)', { 'font-size': 14, fill: WARN, 'font-weight': 700, 'text-anchor': 'end', opacity: fade(u, 1.0) });
      grow(T2[0] - 50, T2[1] - 20, A[0] + 76, A[1] + 20, seg(u, 0.4, 1.0), WARN, { dash: '4 6', sw: 2.4 });
      check(480, 380, 11, pop(u, 1.8)); tx(500, 386, '순환 대기가 없다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); } }

  // =========================================================
  // 5. Atomic — CAS 로 락 없이
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { const v = seg(u, 0.3, 1.5);
      tx(160, 96, 'AtomicInteger', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: GOOD }); R.hbar(180, 82, 520, 200000 * v, 200000, { col: GOOD, text: '200,000' });
      tx(160, 146, 'int (예)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', fill: BAD }); R.hbar(180, 132, 520, 137492 * v, 200000, { col: BAD, text: '137,492' });
      [['카운터 · 플래그 · 참조 하나', 'Atomic', GOOD], ['여러 변수를 한 규칙으로 함께', 'synchronized / Lock', WARN]].forEach(([a, b, col], i) => { const y = 250 + i * 70, s = pop(u, 1.4 + i * 0.4);
        card(480, y, 640, 56, { rx: 10, stroke: col, sw: 2, s }); if (s < 0.6) return;
        tx(190, y + 6, a, { 'font-size': 15.5, 'font-weight': 700 }); mono(770, y + 6, b, { 'font-size': 15.5, 'font-weight': 800, fill: col, 'text-anchor': 'end' }); });
      return; }
    // 메모리 칸
    const memV = k <= 1 ? 41 : k === 2 ? (u < 1.6 ? 41 : 42) : (u < 0.9 ? 42 : u < 2.2 ? 43 : 44);
    cell(480, 74, 'AtomicInteger.value', memV, { w: 220, s: k === 0 ? pop(u, 0.2) : 1, stroke: k >= 2 && u > 1.5 ? GOOD : INK });
    if (k === 0) { sub(480, 140, '어느 순간의 값 41 · 락 없이 CPU 의 CAS 명령으로 바꾼다', fade(u, 0.8), { 'font-size': 14.5, fill: INK }); lock(640, 74, false, MUT, 0.9); cross(640, 74, 16, pop(u, 1.2)); return; }
    // 한 스레드의 4단계
    const st = [['① 읽기', 'expected = 41'], ['② 계산', 'next = 42'], ['③ CAS', 'compareAndSet(41, 42)'], ['④ 결과', '같으면 성공']];
    if (k <= 2) { st.forEach(([a, b], i) => { const x = 140 + i * 228, on = k === 1 ? i === 0 : true, s = k === 1 ? (i === 0 ? pop(u, 0.3) : 0.0) : k === 2 && i > 0 ? pop(u, 0.2 + (i - 1) * 0.5) : 1;
        if (s <= 0) return; card(x, 250, 210, 70, { rx: 10, stroke: i === 2 ? ACC : INFO, sw: 2.2, s });
        if (s > 0.6) { tx(x, 240, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: i === 2 ? ACC : INFO }); mono(x, 264, b, { 'text-anchor': 'middle', 'font-size': 13.5 }); }
        if (i > 0 && s > 0.8) grow(x - 120, 250, x - 108, 250, 1, MUT); });
      if (k === 1) { dot([[480, 108], [140, 214]], seg(u, 0.8, 1.6), INFO, 7); sub(480, 350, '증가 한 번은 언제나 현재 값을 읽는 것부터', fade(u, 1.6), { 'font-size': 14.5, fill: INK }); }
      if (k === 2) { dot([[596, 214], [480, 108]], seg(u, 1.1, 1.6), ACC, 7);
        tx(480, 350, '메모리가 아직 41 이면 42 로 바꾼다 · 아니면 ①부터 다시', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }
      return; }
    // k === 3: 두 스레드가 동시에 — T2 는 한 번 실패하고 다시
    const rows = [['T1', ACC, [['읽기 42', 0.2], ['CAS(42,43) 성공', 0.9]]], ['T2', INFO, [['읽기 42', 0.3], ['CAS(42,43) 실패', 1.3], ['다시 읽기 43', 1.7], ['CAS(43,44) 성공', 2.2]]]];
    rows.forEach(([n, col, evs], r) => { const y = 200 + r * 90; tag(70, y, n, col, 1, { w: 60 });
      evs.forEach(([s, at], i) => { const x = 210 + i * 190, sc = pop(u, at), bad = s.includes('실패');
        card(x, y, 176, 44, { rx: 8, text: s, fs: 14, mono: true, stroke: bad ? BAD : s.includes('성공') ? GOOD : col, color: bad ? BAD : INK, s: sc }); }); });
    tx(480, 380, '실패하면 기다리지 않고 다시 돈다 · 증가가 사라지지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.4) }); }

  // =========================================================
  // 6. 고수준 도구 — 스레드 풀 · Future · CompletableFuture
  // =========================================================
  const WK = [0, 1, 2, 3].map((i) => [600 + (i % 2) * 170, 96 + Math.floor(i / 2) * 70]);
  function pool(busy, op) { zone(510, 40, 420, 170, 'newFixedThreadPool(4)', { fill: SOFT, op });
    WK.forEach(([x, y], i) => card(x + 10, y + 20, 156, 44, { rx: 8, text: 'pool-1-thread-' + (i + 1), fs: 13.5, mono: true, stroke: busy === i ? ACC : GRID, sw: busy === i ? 2.6 : 1.6, op })); }
  function s6(t, c) { const { k, u } = c;
    const shut = k === 4 && u > 0.8;
    pool(k === 1 ? (u > 0.9 && u < 1.8 ? 0 : -1) : k === 2 ? (u > 0.8 && u < 1.8 ? 1 : -1) : -1, shut ? 1 - seg(u, 0.8, 1.8) * 0.75 : 1);
    zone(40, 40, 420, 170, '작업 큐', { fill: 'none', stroke: GRID, dash: '6 5' });
    if (k === 0) { const s = pop(u, 0.2); sub(720, 236, '스레드 4개를 미리 만들어 돌려 쓴다', fade(u, 0.6), { 'font-size': 14.5, fill: INK });
      card(250, 300, 340, 60, { rx: 10, stroke: BAD, sw: 2, s: pop(u, 1.2) }); cross(110, 300, 10, pop(u, 1.2));
      if (u > 1.5) { tx(135, 296, '요청마다 new Thread()', { 'font-size': 15, 'font-weight': 700, class: 'mono' }); tx(135, 318, '생성 비용·문맥 전환이 폭발한다', { 'font-size': 13.5, fill: MUT }); } return; }
    if (k === 1) { fly(120, 120, 600, 116, seg(u, 0.2, 0.9), '() -> 40 + 2', { mono: true });
      card(250, 300, 230, 52, { rx: 9, text: 'Future<Integer> f', fs: 14.5, mono: true, stroke: INFO, s: pop(u, 0.4) });
      dot([[600, 140], [600, 300], [366, 300]], seg(u, 1.5, 2.1), ACC, 7);
      if (u > 2.1) pill(560, 300, 'f.get() = 42', GOOD, pop(u, 2.1), { mono: true, fs: 15, fill: PANEL }); return; }
    // k 2~3: CompletableFuture 파이프
    const st = [['supplyAsync', 'loadPrice()', '1000'], ['thenApply', 'p * 1.1', '1100.0'], ['thenAccept', 'println', '총액 = 1100.0']];
    if (k === 2 || k === 3) st.forEach(([a, b, v], i) => { const x = 160 + i * 300, s = k === 2 ? (i === 0 ? pop(u, 0.2) : 0) : pop(u, 0.1 + i * 0.6) ;
      if (k === 3 && i === 0) { card(x, 300, 230, 62, { rx: 10, stroke: INFO, sw: 2.2 }); } else if (s <= 0) return; else card(x, 300, 230, 62, { rx: 10, stroke: i === 2 ? GOOD : INFO, sw: 2.2, s });
      tx(x, 290, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono', fill: INFO });
      mono(x, 312, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
      const vs = k === 2 ? fade(u, 1.6) : i === 0 ? 1 : fade(u, 0.6 + i * 0.6);
      mono(x, 356, v, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: i === 2 ? GOOD : ACC, opacity: vs });
      if (i > 0 && k === 3) grow(x - 300 + 117, 300, x - 117, 300, seg(u, 0.3 + i * 0.6, 0.7 + i * 0.6), MUT); });
    if (k === 2) { dot([[160, 268], [160, 230], [770, 140]], seg(u, 0.6, 1.4), ACC, 7); sub(480, 236, '풀의 스레드에서 비동기로 시작 · 기다리지 않는다', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }
    if (k === 3) sub(480, 236, '.join() 으로 끝날 때까지 기다린다', fade(u, 2.2), { 'font-size': 14.5, fill: INK });
    if (k === 4) { pill(720, 236, 'pool.shutdown()', GOOD, pop(u, 0.2), { mono: true, fs: 15, fill: PANEL });
      card(250, 400 - 100, 360, 60, { rx: 10, stroke: GOOD, sw: 2, s: pop(u, 1.6) }); check(100, 300, 10, pop(u, 1.6));
      if (u > 1.9) { tx(122, 296, '스레드가 끝나고 JVM 도 끝난다', { 'font-size': 15, 'font-weight': 700 }); tx(122, 318, '부르지 않으면 풀 스레드가 남아 안 끝난다', { 'font-size': 13.5, fill: MUT }); } } }

  const quiz = [
    { q: 'run()을 직접 부르면 start()와 무엇이 다른가?',
      o: ['새 스레드가 두 개 생긴다', '새 스레드 없이 지금 스레드에서 그냥 실행된다', '차이가 없다'], a: 1,
      why: 'start()를 불러야 새 실행 흐름이 갈라진다. run()은 평범한 메서드 호출이라 main 스레드가 그대로 실행한다.' },
    { q: '두 스레드가 count++를 10만 번씩 했는데 200,000보다 작게 나오는 까닭은 무엇인가?',
      o: ['읽기와 쓰기 사이에 다른 스레드가 끼어들어 증가가 덮어써져서', 'int가 200,000을 담지 못해서', 'JVM이 반복을 일부 건너뛰어서'], a: 0,
      why: 'count++는 읽기, +1, 쓰기 세 단계다. 둘이 같은 0을 읽고 각자 1을 쓰면 두 번 더했는데 1이 된다.' },
    { q: 'volatile boolean running이 막아 주는 문제는 무엇인가?',
      o: ['count++ 같은 증가가 사라지는 문제', '다른 스레드가 바꾼 값이 안 보이는 문제', '두 스레드가 락을 엇갈려 잡는 문제'], a: 1,
      why: 'volatile은 쓰기가 다음 읽기에 보이게 한다(가시성). 원자성은 주지 않아서 count++에는 부족하다.' },
    { q: 'bad1은 A 다음 B, bad2는 B 다음 A를 잡는다. 데드락을 없애는 가장 쉬운 방법은 무엇인가?',
      o: ['두 메서드 모두 A 다음 B 순서로 잡게 한다', '락을 하나 더 추가한다', 'Thread.sleep을 넣는다'], a: 0,
      why: '모든 코드가 같은 순서로 락을 잡으면 서로를 기다리는 원이 생길 수 없다.' },
    { q: 'compareAndSet(41, 42)가 실패했다. 그때 메모리의 값은 무엇인가?',
      o: ['41', '41이 아닌 다른 값', '0'], a: 1,
      why: 'CAS는 메모리 값이 기대값 41과 같을 때만 42로 바꾼다. 실패했다면 다른 스레드가 먼저 바꾼 것이고, 다시 읽어 재시도한다.' },
    { q: 'newFixedThreadPool(4)를 쓰고 shutdown()을 부르지 않으면 어떻게 되는가?',
      o: ['작업이 실행되지 않는다', 'main이 끝나도 풀 스레드가 남아 JVM이 끝나지 않는다', '작업이 두 번 실행된다'], a: 1,
      why: '풀 스레드는 데몬이 아니라서 남아 있는 동안 JVM이 내려가지 않는다. 다 쓰면 shutdown()을 부른다.' },
  ];
  const summary = [
    '스레드는 한 프로세스 안의 실행 흐름이고 같은 힙을 함께 쓴다.',
    'count++는 읽기, +1, 쓰기라서 두 스레드가 끼어들면 증가가 사라진다.',
    'volatile은 바뀐 값이 보이게만 하고 synchronized와 Atomic이 원자성을 준다.',
    '락은 늘 같은 순서로 잡고, 스레드는 풀에 맡긴 뒤 shutdown으로 닫는다.',
  ];
  const review = [
    { q: '조회수 카운터를 volatile int로 바꿨는데 여전히 값이 모자란다. 먼저 바꿀 것은 무엇인가?',
      o: ['volatile을 두 번 선언한다', 'AtomicInteger의 incrementAndGet으로 바꾼다', '스레드 수를 늘린다'], a: 1,
      why: 'volatile은 가시성만 준다. 증가가 사라지는 문제는 원자성 문제라서 CAS로 재시도하는 AtomicInteger가 맞다.' },
    { q: '주문 금액과 재고 두 값을 항상 함께 바꿔야 한다. 알맞은 도구는 무엇인가?',
      o: ['synchronized로 두 변경을 한 구역에 묶는다', '각각 AtomicInteger로 따로 바꾼다', 'volatile만 붙인다'], a: 0,
      why: 'Atomic은 변수 하나만 원자적으로 바꾼다. 두 값이 한 규칙으로 묶이면 락 하나로 같은 구역에서 바꿔야 한다.' },
    { q: '서버가 요청마다 new Thread()를 만들었더니 부하 때 메모리가 바닥났다. 먼저 고칠 것은 무엇인가?',
      o: ['스레드마다 volatile을 붙인다', '요청마다 run()을 직접 부른다', '정해진 크기의 스레드 풀에 작업을 제출한다'], a: 2,
      why: '스레드는 만들 때마다 비용과 메모리가 든다. 풀로 개수를 정해 재사용하면 요청이 몰려도 큐에서 기다린다.' },
  ];

  R.page({ title: '스레드 · 락 · CAS', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
