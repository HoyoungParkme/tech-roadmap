/* V-2-2 테스트 (runTest / Turbine) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 벽시계와 가상 시계, 스레드 점유 막대, TestDispatcher 큐와 Main 소켓, Flow 방출이 지나는 개찰구를 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, zone, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const ap = (k, i, u, s = 0.2, d = 0.6) => (k > i ? 1 : k === i ? R.spring(seg(u, s, s + d)) : 0);
  const gr = (k, i, u, s = 0.2, d = 0.9) => (k > i ? 1 : k === i ? E(u, s, s + d) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 큰 시계: frac 만큼 채움 + 가운데 숫자
  function dial(cx, cy, r, frac, col, big, cap) { clock(cx, cy, r, frac, col);
    el('circle', { cx, cy, r: r * 0.58, fill: PANEL });
    mono(cx, cy + 7, big, { 'text-anchor': 'middle', 'font-size': r > 60 ? 21 : 15, 'font-weight': 800, fill: col });
    tx(cx, cy + r + 24, cap, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT }); }

  // ---------- 1. 실제 시간: delay(1000) 은 진짜 1초 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 2) return ci(t, c);
    const f = k === 0 ? E(u, 0.3, 2.4) : 1;
    dial(160, 180, 92, f, WARN, `${Math.round(1000 * f)}ms`, '벽시계');
    const ax = R.axes(330, 90, 560, 90, { x: [0, 1000], y: [0, 1], xt: [0, 500, 1000], xl: 'ms (실제 시간)' });
    el('rect', { x: ax.X(0), y: 120, width: (ax.X(1000) - ax.X(0)) * f, height: 34, rx: 5, fill: WARN, opacity: 0.85 });
    if (f > 0.3) mono(ax.X(0) + 12, 143, 'delay(1000)', { 'font-size': 14.5, 'font-weight': 800, fill: PANEL });
    if (k === 0) { note(330, 260, 'load()는 네트워크 대기를 delay(1000)으로 흉내 낸다', fade(u, 0.6)); note(330, 288, '테스트에서도 진짜 1초를 잔다', fade(u, 1.2), { fill: WARN }); return; }
    // k1: runBlocking 이 테스트 스레드를 붙잡는다
    tx(320, 268, '테스트 스레드', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: MUT });
    el('rect', { x: 330, y: 248, width: 560, height: 34, rx: 6, fill: PANEL, stroke: GRID });
    const h = E(u, 0.2, 2.2); el('rect', { x: 332, y: 250, width: 556 * h, height: 30, rx: 5, fill: BAD, opacity: 0.8 });
    if (h > 0.4) tx(344, 270, 'runBlocking — 잠든 채 점유', { 'font-size': 14, 'font-weight': 700, fill: PANEL });
    note(330, 330, 'runBlocking은 가상 시간을 모른다 · 잠든 시간을 그대로 갚는다', fade(u, 2.0), { fill: MUT, 'font-size': 14.5 }); }
  function ci(t, c) { const { u } = c, N = 40, cols = 10, f = E(u, 0.2, 2.2) * N;
    lbl(480, 42, '테스트 한 건 = 1초 · 이런 테스트가 쌓이면', 1, { 'font-size': 16 });
    for (let i = 0; i < N; i++) { const x = 230 + (i % cols) * 52, y = 70 + Math.floor(i / cols) * 46, on = f > i;
      el('rect', { x, y, width: 46, height: 38, rx: 5, fill: on ? WARNBG : PANEL, stroke: on ? WARN : GRID, 'stroke-width': 1.5 });
      if (on) mono(x + 23, y + 24, '1s', { 'font-size': 13.5, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 }); }
    check(214, 90, 9, pop(u, 0.3)); tx(110, 95, 'assertEquals 통과', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
    mono(480, 300, `${Math.round(lerp(0, 2000, E(u, 0.2, 2.2))).toLocaleString('en-US')}건 × 1초 = ${Math.round(lerp(0, 2000, E(u, 0.2, 2.2))).toLocaleString('en-US')}초`, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: WARN });
    tx(480, 328, '≈ 33분 (건수는 예시)', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.2) });
    pill(480, 380, '실행 순서도 스케줄러에 따라 흔들린다 → 플래키', BAD, pop(u, 2.4), { fs: 14 }); }

  // ---------- 2. runTest: 가상 시계만 감긴다 ----------
  function s2(t, c) { const { k, u } = c;
    const vf = k === 0 ? 0 : k === 1 ? E(u, 0.9, 1.15) : 1;
    dial(230, 190, 110, vf, ACC, `${Math.round(1000 * vf)}ms`, '가상 시계 (runTest)');
    const wf = k === 0 ? 0 : 0.015;
    dial(700, 170, 56, wf, MUT, k === 0 ? '0' : '수 ms', '벽시계');
    if (k === 0) { [['import kotlinx.coroutines.test.runTest', 0.3], ['testImplementation(kotlinx-coroutines-test)', 0.8]].forEach(([s, a], i) => mono(430, 300 + i * 30, s, { 'font-size': 14, fill: i ? MUT : ACC, 'font-weight': 700, opacity: fade(u, a) }));
      note(430, 270, '아직 아무것도 감기지 않았다', fade(u, 1.4), { fill: MUT }); return; }
    if (k === 1) { card(480, 330, 190, 40, { rx: 8, text: 'delay(1000)', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      grow(390, 320, 330, 260, E(u, 0.5, 0.9), ACC);
      note(600, 300, '기다리지 않고 시계만 1000ms 감는다', fade(u, 1.3), { fill: ACC });
      note(600, 326, '벽시계는 거의 그대로', fade(u, 1.7), { fill: MUT }); return; }
    // k2: currentTime 단언
    card(640, 310, 420, 46, { rx: 8, stroke: GOOD, fill: GOODBG, s: pop(u, 0.2) });
    mono(450, 316, 'assertEquals(1000L, currentTime)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) }); check(828, 310, 10, pop(u, 0.8));
    note(450, 372, 'currentTime은 Long · Int 1000과 비교하면 equals가 false다', fade(u, 1.4), { fill: MUT, 'font-size': 14 });
    note(300, 66, '벽시계 수 ms는 그림용 예시', fade(u, 1.8), { fill: MUT, 'font-size': 13.5 }); }

  // ---------- 3. TestDispatcher 큐 · Main 소켓 ----------
  function socket(x, y, who, col, s) { el('rect', { x: x - 80, y: y - 30, width: 160, height: 60, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2 });
    tx(x, y - 40, 'Dispatchers.Main', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' });
    if (who) card(x, y, 140, 42, { rx: 8, text: who, fs: 14, fw: 800, stroke: col, color: col, fill: PANEL, s }); }
  function s3(t, c) { const { k, u } = c;
    // 큐
    const Q = { x: 400, y: 250 }, qs = ap(k, 0, u, 0.2);
    tx(Q.x, Q.y - 44, 'StandardTestDispatcher 큐', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: clamp(qs) });
    for (let i = 0; i < 4; i++) el('rect', { x: Q.x + i * 70, y: Q.y - 26, width: 62, height: 52, rx: 6, fill: PANEL, stroke: ACC, 'stroke-width': 1.8, 'stroke-dasharray': '5 4', opacity: clamp(qs) });
    // Main 소켓
    if (k === 0) { socket(150, 110, 'Main (Android)', INK, 1); note(400, 330, '코루틴을 바로 돌리지 않고 큐에 쌓아 둔다', fade(u, 1.0)); note(400, 356, '실행 시점은 테스트가 정한다', fade(u, 1.3), { fill: ACC }); }
    if (k === 1) { const out = E(u, 0.2, 1.0), inn = E(u, 1.2, 2.0);
      if (out < 1) card(150, lerp(110, 20, out), 140, 42, { rx: 8, text: 'Main (Android)', fs: 14, fw: 800, op: 1 - out });
      socket(150, 110, null, ACC, 0); if (inn > 0) card(150, lerp(200, 110, inn), 140, 42, { rx: 8, text: 'TestDispatcher', fs: 14, fw: 800, stroke: ACC, color: ACC });
      note(260, 70, '테스트 JVM에는 Android Main이 없다', fade(u, 0.6), { fill: BAD, 'font-size': 14.5 });
      mono(260, 96, '@BeforeTest setMain(dispatcher)', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k >= 2 && k <= 3) socket(150, 110, 'TestDispatcher', ACC, 1);
    if (k === 4) { const out = E(u, 0.2, 1.0), inn = E(u, 1.0, 1.8); socket(150, 110, null, INK, 0);
      if (out < 1) card(150, lerp(110, 200, out), 140, 42, { rx: 8, text: 'TestDispatcher', fs: 14, fw: 800, stroke: ACC, color: ACC, op: 1 - out });
      if (inn > 0) card(150, lerp(20, 110, inn), 140, 42, { rx: 8, text: 'Main (원래대로)', fs: 14, fw: 800 });
      mono(260, 96, '@AfterTest resetMain()', { 'font-size': 14, fill: INK, 'font-weight': 700, opacity: fade(u, 0.4) });
      note(400, 340, '다음 테스트가 남의 디스패처를 물려받지 않는다', fade(u, 1.8), { fill: GOOD }); }
    // ViewModel 상태
    const S = { x: 820, y: 250 };
    if (k >= 2) { card(S.x, S.y, 150, 90, { rx: 10, stroke: INK, s: ap(k, 2, u, 0.1) });
      const v = k === 2 ? 0 : k === 3 ? (u > 1.5 ? 1 : 0) : 1;
      tx(S.x, S.y - 18, 'vm.state.value', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono' });
      mono(S.x, S.y + 22, String(v), { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: v ? GOOD : MUT }); }
    if (k === 2) { fly(S.x - 60, S.y + 80, Q.x + 31, Q.y, seg(u, 0.4, 1.3), 'increment', { mono: true, stay: true });
      mono(560, 160, 'vm.increment()', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      note(400, 340, '예약만 됐다 · 지금 단언하면 0이라 실패', fade(u, 1.6), { fill: WARN }); }
    if (k === 3) { const f = E(u, 0.3, 1.4);
      card(lerp(Q.x + 31, S.x - 120, f), lerp(Q.y, S.y, f), tw('increment', 13.5) + 24, 28, { rx: 14, fill: f < 1 ? ACC : GOOD, stroke: 'none', text: 'increment', fs: 13.5, fw: 700, color: PANEL, mono: true, op: 1 - E(u, 1.4, 1.7) });
      mono(560, 160, 'advanceUntilIdle()', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
      if (u > 1.8) { card(560, 360, 300, 40, { rx: 8, text: 'assertEquals(1, vm.state.value)', fs: 14, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.8) }); check(724, 360, 9, pop(u, 2.1)); } } }

  // ---------- 4. Turbine: 방출이 개찰구를 하나씩 지난다 ----------
  const TOK = ['0', '1', '2', '완료'], GX = 640;
  function token(x, y, s, col, op) { card(x, y, s === '완료' ? 64 : 46, 46, { rx: s === '완료' ? 10 : 23, text: s, fs: 15, mono: true, fw: 800, stroke: col, color: col, fill: PANEL, op }); }
  function s4(t, c) { const { k, u } = c;
    // 소스
    card(120, 210, 170, 90, { rx: 10, stroke: INK, s: ap(k, 0, u, 0.1) });
    mono(120, 180, 'flowOf(0, 1, 2)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, opacity: clamp(ap(k, 0, u, 0.1)) });
    // 벨트와 개찰구
    el('line', { x1: 210, y1: 260, x2: 900, y2: 260, stroke: GRID, 'stroke-width': 4 });
    const open = k >= 1;
    el('rect', { x: GX - 8, y: 150, width: 16, height: 110, rx: 5, fill: open ? ACC : OFF });
    tx(GX, 140, open ? 'awaitItem()' : 'test { } 전', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: open ? ACC : MUT, class: 'mono' });
    // 소비된 것: 오른쪽 칸
    const used = k <= 1 ? 0 : k === 2 ? Math.min(2, Math.floor(E(u, 0.3, 2.2) * 2.05)) : k === 3 ? 3 : 4;
    const moving = k === 2 ? E(u, 0.3, 2.2) * 2 : k === 3 ? 2 + E(u, 0.3, 1.4) : k === 4 ? 3 + E(u, 0.3, 1.4) : 0;
    TOK.forEach((s, i) => { let x, y = 230, col = i === 3 ? INFO : ACC;
      if (k === 0) { x = 76 + (i % 2) * 42; y = 212 + Math.floor(i / 2) * 0 + (i > 1 ? 0 : 0); if (i < 3) token(72 + i * 48, 228, s, col, 0.5); return; }
      const queue = 560 - (i - Math.min(i, Math.floor(moving))) * 56; // 개찰구 앞 줄
      if (k === 1) { const f = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3); if (f <= 0) return; x = lerp(210, 560 - i * 56, f); token(x, y, s, col, 1); return; }
      const m = clamp(moving - i);
      if (m <= 0) { x = 560 - (i - Math.floor(moving)) * 56; token(x, y, s, col, 1); return; }
      x = lerp(560, 720 + i * 56, m); token(x, y, s, col, 1);
      if (m >= 1) check(x, y - 40, 9, 1); });
    if (k === 0) { note(260, 120, 'Flow는 구독하기 전엔 아무것도 흘리지 않는다', fade(u, 0.6)); return; }
    if (k === 1) { note(260, 120, 'test { }가 구독을 열고 방출을 붙잡아 둔다', fade(u, 1.4)); return; }
    mono(700, 340, `소비 ${used} / 4 (값 3 + 종료 1)`, { 'font-size': 15, 'font-weight': 700, fill: used === 4 ? GOOD : INK });
    if (k === 2) note(210, 340, 'assertEquals(0, awaitItem()) · (1, awaitItem())', fade(u, 0.6), { class: 'mono', 'font-size': 14 });
    if (k === 3) { note(210, 340, '세 값을 다 꺼냈다', fade(u, 0.6)); pill(400, 384, '종료를 확인하지 않고 끝내면 Turbine이 실패시킨다', WARN, pop(u, 1.6), { fs: 13.5 }); }
    if (k === 4) { note(210, 340, 'awaitComplete()', fade(u, 0.3), { class: 'mono', fill: INFO }); pill(400, 384, '남은 이벤트 0 · 통과', GOOD, pop(u, 1.8), { fs: 14 }); } }

  // ---------- 5. 종합: 뼈대 · 격리 · StateFlow 검증 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 2) return isolate(t, c);
    // 테스트 뼈대 괄호
    const bs = ap(k, 0, u, 0.1);
    card(480, 50, 520, 40, { rx: 8, text: '@BeforeTest  setMain(UnconfinedTestDispatcher())', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: bs });
    card(480, 390, 520, 40, { rx: 8, text: '@AfterTest  resetMain()', fs: 14, mono: true, stroke: ACC, color: ACC, fill: ACCBG, s: ap(k, 0, u, 0.5) });
    el('path', { d: 'M200,70 V370', stroke: ACC, 'stroke-width': 3, opacity: gr(k, 0, u, 0.8, 0.5) }); el('path', { d: 'M760,70 V370', stroke: ACC, 'stroke-width': 3, opacity: gr(k, 0, u, 0.8, 0.5) });
    if (k === 0) { note(240, 220, '교체와 원복은 항상 짝으로', fade(u, 1.3), { 'font-size': 17, 'font-weight': 800 }); note(240, 250, 'Unconfined는 시작하자마자 바로 실행한다', fade(u, 1.6), { fill: MUT }); return; }
    pill(320, 110, 'runTest · 가상 시계', ACC, ap(k, 1, u, 0.2), { fs: 14 });
    if (k === 1) { dial(320, 230, 50, E(u, 0.6, 1.0), ACC, '+delay', '가상 시계'); note(420, 222, '안쪽 delay는 기다리지 않고', fade(u, 1.1)); note(420, 248, '가상 시계만 그만큼 감는다', fade(u, 1.4), { fill: ACC }); return; }
    // k3·k4: StateFlow 칸과 Turbine
    const Dt = k === 4 && u > 1.4, sv = Dt ? 'Data("Hoyoung")' : 'Loading';
    card(360, 230, 230, 80, { rx: 10, stroke: Dt ? GOOD : INFO, fill: Dt ? GOODBG : INFOBG, sw: 2.2 });
    tx(360, 212, 'vm.uiState.value', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono' });
    mono(360, 244, sv, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: Dt ? GOOD : INFO });
    el('rect', { x: 552, y: 186, width: 14, height: 90, rx: 5, fill: k === 4 && u > 2.3 ? OFF : ACC });
    tx(559, 176, k === 4 && u > 2.3 ? '구독 닫힘' : 'uiState.test { }', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: ACC, class: 'mono' });
    if (k === 3) { fly(475, 230, 660, 230, seg(u, 0.4, 1.2), 'Loading', { fill: INFO, mono: true, stay: true }); if (u > 1.2) check(660, 196, 9, pop(u, 1.2));
      note(240, 330, 'StateFlow는 구독하자마자 현재 값을 준다', fade(u, 1.5)); return; }
    card(640, 230, 92, 32, { rx: 16, text: 'Loading', fs: 13.5, mono: true, fw: 700, fill: INFO, stroke: 'none', color: PANEL }); check(640, 196, 9, 1);
    mono(240, 150, 'vm.load() → advanceUntilIdle()', { 'font-size': 14.5, 'font-weight': 800, opacity: fade(u, 0.2) });
    fly(475, 270, 700, 280, seg(u, 1.5, 2.2), 'Data("Hoyoung")', { fill: GOOD, mono: true, stay: true }); if (u > 2.2) check(760, 248, 9, pop(u, 2.2));
    note(240, 340, 'cancelAndConsumeRemaining()으로 끝나지 않는 구독을 닫는다', fade(u, 2.3), { 'font-size': 14 }); }
  function isolate(t, c) { const { u } = c;
    [['테스트 A', 260], ['테스트 B', 700]].forEach(([n, x], i) => { const s = pop(u, 0.2 + i * 0.3);
      zone(x - 170, 90, 340, 220, n, { fill: SOFT, op: clamp(s) });
      card(x, 170, 260, 42, { rx: 8, text: 'UserViewModel(FakeRepo())', fs: 14, mono: true, fw: 700, stroke: i ? INFO : ACC, color: i ? INFO : ACC, s: pop(u, 0.6 + i * 0.3) });
      tx(x, 240, '새 인스턴스', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9 + i * 0.3) }); });
    const sh = fade(u, 1.5); el('line', { x1: 430, y1: 170, x2: 530, y2: 170, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: sh }); cross(480, 170, 12, pop(u, 1.6));
    tx(480, 140, '공유 상태 없음', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: sh });
    note(240, 370, '실행 순서가 바뀌어도 결과가 같다 · 네트워크 없이 결정적', fade(u, 2.0)); }

  const quiz = [
    { q: 'runBlocking 안에서 delay(1000)을 부르는 테스트는 어떻게 되는가?',
      o: ['가상 시계만 감겨 바로 끝난다', '실제로 1초를 기다리며 테스트 스레드를 붙잡는다', 'delay가 무시되어 0ms에 끝난다'], a: 1,
      why: 'runBlocking은 가상 시간을 모른다. 잠든 1초를 벽시계로 그대로 기다리므로 테스트 한 건이 1초씩 길어진다.' },
    { q: 'runTest 안에서 delay(1000) 하나를 지난 뒤 currentTime은 얼마인가?',
      o: ['1000', '0', '벽시계로 잰 실제 경과 시간'], a: 0,
      why: 'runTest는 delay를 만나면 가상 시계를 1000ms 감는다. 벽시계는 거의 그대로지만 currentTime은 1000이다.' },
    { q: 'StandardTestDispatcher로 Main을 바꾼 뒤 vm.increment() 바로 다음에 state를 보면 무엇인가?',
      o: ['이미 1이다', '예외가 난다', '아직 0이다. advanceUntilIdle()을 불러야 1이 된다'], a: 2,
      why: 'Standard 디스패처는 코루틴을 큐에 예약만 한다. advanceUntilIdle()이 큐를 비워야 state가 1로 바뀐다.' },
    { q: 'Turbine test 블록에서 0, 1, 2를 꺼내고 awaitComplete() 없이 끝내면 어떻게 되는가?',
      o: ['소비하지 않은 종료 이벤트가 남아 테스트가 실패한다', '그대로 통과한다', 'Flow가 처음부터 다시 방출한다'], a: 0,
      why: 'Turbine은 블록이 끝날 때 남은 이벤트를 검사한다. flowOf(0, 1, 2)의 종료 신호도 이벤트라 awaitComplete()로 꺼내야 한다.' },
    { q: 'StateFlow인 uiState를 Turbine으로 구독했을 때 첫 awaitItem()은 무엇인가?',
      o: ['load() 뒤의 Data("Hoyoung")', '구독 시점의 현재 값 Loading', '아무것도 오지 않아 타임아웃'], a: 1,
      why: 'StateFlow는 구독하자마자 현재 값을 준다. 그래서 Loading을 먼저 확인하고, load() 뒤에 Data를 받는다.' },
  ];

  const summary = [
    'runBlocking 안의 delay(1000)은 진짜 1초를 기다려 그만큼 테스트가 길어진다.',
    'runTest는 delay를 가상 시계로 건너뛰고 currentTime에 1000만 남긴다.',
    'ViewModel 테스트는 setMain과 resetMain을 짝으로 두고 advanceUntilIdle로 실행한다.',
    'Turbine은 방출을 awaitItem으로 차례로 꺼내고 남은 이벤트가 있으면 실패시킨다.',
  ];
  const review = [
    { q: 'ViewModel 테스트가 Main dispatcher had failed to initialize 오류로 바로 죽는다. 무엇이 빠졌나?',
      o: ['Turbine 의존성', '@BeforeTest의 Dispatchers.setMain(테스트 디스패처)', 'advanceTimeBy(500) 호출'], a: 1,
      why: '테스트 JVM에는 Android Main이 없다. setMain으로 TestDispatcher를 끼우고 @AfterTest에서 resetMain으로 되돌린다.' },
    { q: '가상 시계가 1000ms 감겼는데 assertEquals(1000, currentTime)이 실패한다. 까닭은?',
      o: ['Int 1000과 Long 1000L을 비교해 equals가 false라서', 'runTest가 시계를 감지 않아서', 'delay가 두 번 실행돼서'], a: 0,
      why: 'currentTime은 Long이다. 기대값을 1000L로 적어야 같은 타입끼리 비교된다.' },
    { q: '테스트를 하나씩 돌리면 통과하는데 전체로 돌리면 가끔 실패한다. 먼저 볼 것은?',
      o: ['delay 값을 줄인다', 'Turbine 버전을 올린다', '테스트끼리 공유하는 ViewModel이나 빠진 resetMain'], a: 2,
      why: '공유 상태나 원복되지 않은 Main은 다음 테스트로 새어 나간다. 매 테스트 새 인스턴스와 setMain·resetMain 짝으로 막는다.' },
  ];

  R.page({ title: '시간을 통제하는 테스트', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
