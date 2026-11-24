/* III-2-1 Flow — 차가운 스트림 · 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // 구슬: 흐르는 값 하나
  function ball(cx, cy, v, o) { o = o || {}; const col = o.col || ACC, r = o.r || Math.max(15, R.tw(String(v), 13.5) / 2 + 8), g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('circle', { cx: 0, cy: 0, r, fill: o.ghost ? PANEL : col === ACC ? ACCBG : col === INFO ? INFOBG : col === GOOD ? GOODBG : col === BAD ? BADBG : WARNBG, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.ghost ? '4 3' : null }, g);
    tx(0, 5, String(v), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: col, class: 'mono' }, g); return g; }
  // 관: 두꺼운 회색 띠
  function pipe(x1, y, x2, o) { o = o || {}; el('line', { x1, y1: y, x2: x1 + (x2 - x1) * (o.g ?? 1), y2: y, stroke: o.col || GRID, 'stroke-width': o.w || 16, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash, opacity: o.op ?? 1 }); }
  // Flow 상자(수도꼭지): 이름 + 밸브(잠김/열림)
  function tap(cx, cy, w, h, title, sub2, open, o) { o = o || {}; const g = card(cx, cy, w, h, { rx: 12, stroke: open ? ACC : INFO, fill: open ? ACCBG : INFOBG, s: o.s, op: o.op });
    tx(0, -h / 2 + 24, title, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: open ? ACC : INFO, class: 'mono' }, g);
    if (sub2) tx(0, -h / 2 + 46, sub2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }, g);
    const vg = R.G(w / 2 + 2, 0, 1, 1, g); el('circle', { cx: 0, cy: 0, r: 12, fill: PANEL, stroke: open ? ACC : INFO, 'stroke-width': 2.4 }, vg);
    el('line', { x1: open ? 0 : -8, y1: open ? -8 : 0, x2: open ? 0 : 8, y2: open ? 8 : 0, stroke: open ? ACC : INFO, 'stroke-width': 3, 'stroke-linecap': 'round' }, vg); return g; }
  function station(cx, cy, name, o) { o = o || {}; const w = o.w || R.tw(name, 14) + 26;
    card(cx, cy, w, 36, { rx: 8, text: name, fs: 14, mono: true, stroke: o.col || INK, fill: o.fill || PANEL, color: o.col || INK, s: o.s, op: o.op, dash: o.dash }); }
  // 마블 줄: 이름 + 시간선
  function mlane(x0, x1, y, name, op) { el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: GRID, 'stroke-width': 2, opacity: op ?? 1 });
    mono(x0 - 10, y + 5, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: op ?? 1 }); }

  // ---------- 1. suspend 는 값 하나 · List 는 다 모인 뒤 · Flow 는 흐른다 ----------
  function s1(t, c) { const { k, u } = c;
    const head = (s) => tx(480, 40, s, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    if (k === 0) { head('suspend fun fetchPrice(symbol): BigDecimal');
      card(160, 190, 170, 64, { rx: 12, text: '호출하는 쪽', fs: 15, stroke: INK });
      card(680, 190, 250, 64, { rx: 12, text: 'api.getPrice(symbol)', fs: 14.5, mono: true, stroke: INFO, fill: INFOBG, s: pop(u, 0.2) });
      grow(250, 172, 550, 172, seg(u, 0.4, 1.1), MUT); mono(400, 160, '요청 1번', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) });
      const b = seg(u, 1.3, 2.2); if (b > 0) ball(lerp(560, 260, E(b, 0, 1)), 214, 'price', { col: ACC, r: 28 });
      tx(400, 270, '값 1개를 돌려주고 끝', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      tx(480, 360, '값이 계속 들어오는 상황은 이 모양으로 표현할 수 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 1) { head('suspend fun fetchAllPrices(): List<BigDecimal>');
      // 메모리 상자가 다 찰 때까지 처리 쪽은 기다린다
      const x0 = 80, y0 = 80, fill = lerp(0, 120, E(u, 0.2, 2.0));
      zone(x0 - 16, y0 - 16, 12 * 34 + 24, 10 * 24 + 28, null, { fill: SOFT, stroke: fill > 115 ? BAD : GRID, sw: 2 });
      for (let i = 0; i < 120; i++) { const x = x0 + (i % 12) * 34, y = y0 + Math.floor(i / 12) * 24, on = i < fill;
        el('rect', { x, y, width: 28, height: 18, rx: 3, fill: on ? WARN : PANEL, opacity: on ? 0.75 : 1, stroke: on ? 'none' : GRID }); }
      mono(x0 + 6 * 34, y0 + 10 * 24 + 40, '메모리에 전부 쌓는다 (10만 개라면?)', { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, 'font-weight': 700 });
      const done = fill >= 119.5;
      card(740, 180, 220, 70, { rx: 12, stroke: done ? GOOD : GRID, text: done ? '이제야 처리 시작' : '처리 쪽: 대기 중', fs: 15, color: done ? GOOD : MUT });
      if (done) grow(520, 180, 626, 180, seg(u, 2.05, 2.4), GOOD); return; }
    // k 2·3: Flow 관
    head('fun streamPrices(symbol): Flow<BigDecimal> = flow { … }');
    const g = k === 2 ? E(u, 0.4, 1.4) : 1;
    tap(170, 190, 220, 110, 'flow { }', 'while (true)', true, { s: k === 2 ? pop(u, 0.2) : 1 });
    // 무한 루프 표시: 도는 화살표
    const a = t * 2.4; el('path', { d: `M${170 + 22 * Math.cos(a)},${210 + 22 * Math.sin(a)} A22,22 0 1 1 ${170 + 22 * Math.cos(a + 4.6)},${210 + 22 * Math.sin(a + 4.6)}`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: fade(u, k === 2 ? 1.0 : 0) });
    pipe(296, 190, 700, { g });
    mono(498, 160, 'Flow<BigDecimal>', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, k === 2 ? 1.2 : 0) });
    card(800, 190, 170, 70, { rx: 12, text: '받는 쪽\n하나씩 처리', fs: 15, stroke: INK, op: k === 2 ? fade(u, 1.4) : 1 });
    if (k === 2) { tx(480, 330, '반환하는 것은 값이 아니라 흐름이다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    // k 3: 1초 간격 emit — 관 안에는 늘 한 건
    for (let i = 0; i < 4; i++) { const p = ((t * 0.42 + i * 0.25) % 1); if (p < 0.02) continue; ball(lerp(300, 700, p), 190, 'price', { r: 26 }); }
    mono(498, 240, 'emit(price) · delay(1000)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
    tx(480, 320, '도착하는 대로 한 건씩 흘려보낸다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
    tx(480, 350, '전부 모을 필요가 없어 메모리에는 몇 건만 머문다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) }); }

  // ---------- 2. 빌더 — 수도꼭지를 달았을 뿐 ----------
  function console_(lines, note, o) { o = o || {}; terminal(620, 60, 300, 190, lines, lines.length, { title: '콘솔 출력' });
    if (!lines.length) mono(770, 160, '(아무것도 안 찍힘)', { 'text-anchor': 'middle', 'font-size': 14, fill: OFF });
    tx(770, 290, '빌더 실행', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700 });
    mono(770, 330, '0회', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: INFO }); }
  function s2(t, c) { const { k, u } = c;
    console_([]);
    if (k <= 1) { tap(300, 120, 400, 110, 'val nums: Flow<Int> = flow { }', null, false, { s: k === 0 ? pop(u, 0.2) : 1 });
      mono(300, 152, 'println("flow 빌더 실행 시작")', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: (k === 0 ? fade(u, 0.8) : 1) * 0.6 });
      if (k === 0) { tx(300, 230, '등록만 됐다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) });
        tx(300, 258, 'println 조차 아직 실행되지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.5) }); }
      if (k === 1) { [1, 2, 3].forEach((v, i) => { const x = 160 + i * 140, s = pop(u, 0.3 + i * 0.35);
          ball(x, 260, v, { ghost: true, col: INFO, s, r: 20 }); if (i) mono(x - 70, 300, '100ms', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4 + i * 0.35) }); });
        tx(300, 350, 'emit(i) 세 번이 계획만 되어 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.5) }); }
      return; }
    if (k === 2) { tap(300, 90, 400, 72, 'flow { for (i in 1..3) … }', null, false, {});
      tap(300, 190, 400, 72, 'flowOf("a", "b", "c")', null, false, { s: pop(u, 0.2) });
      tap(300, 290, 400, 72, '(1..10).asFlow()', null, false, { s: pop(u, 0.7) });
      ['a', 'b', 'c'].forEach((v, i) => ball(200 + i * 50, 210, v, { ghost: true, col: INFO, r: 13, op: fade(u, 0.5 + i * 0.1) }));
      for (let i = 0; i < 10; i++) ball(132 + i * 37, 310, i + 1, { ghost: true, col: INFO, r: 13, op: fade(u, 1.0 + i * 0.05) });
      tx(300, 390, '어떤 빌더든 collect 전에는 차갑다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); return; }
    // k 3: 차가움 증명
    tap(300, 130, 420, 110, 'val cold = flow { … }', null, false, {});
    mono(300, 162, 'println("이 줄은 collect 전에 출력 안 됨")', { 'text-anchor': 'middle', 'font-size': 13, fill: MUT });
    const s = pop(u, 0.6); if (s > 0) { cross(300, 260, 18, s); tx(300, 310, 'collect 를 부르지 않았다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) }); }
    tx(300, 350, '그래서 콘솔은 비어 있고 실행은 0회', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); }

  // ---------- 3. 연산자 — 마블로 보는 검색창 ----------
  const MX0 = 210, MX1 = 900, T = (ms) => MX0 + (ms / 2000) * (MX1 - MX0);
  const TYPED = [['k', 0], ['ko', 130], ['kot', 260], ['kotl', 800], ['kot', 950], ['ko', 1450], ['k', 1600]];   // 예시 입력
  const DEB = [['kot', 560], ['kot', 1250], ['k', 1900]];                                                   // debounce(300) 결과
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { const op = k === 0 ? 1 : 0.9;
      mlane(MX0, MX1, 80, 'searchInput', op); mono(MX1, 50, '예시 입력', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      TYPED.forEach(([v, ms], i) => ball(T(ms) + 18, 80, v, { col: INK, r: 17, s: k === 0 ? pop(u, 0.2 + i * 0.3) : 1 }));
      if (k === 0) { tx(560, 160, '사람이 칠 때마다 값이 흘러든다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
      const lanes = [['debounce(300)', 150], ['filter { len ≥ 2 }', 220], ['distinctUntilChanged', 290]];
      lanes.forEach(([n, y], i) => mlane(MX0, MX1, y, n, fade(u, 0.1 + i * 0.5)));
      DEB.forEach(([v, ms], i) => { const x = T(ms) + 18, s = pop(u, 0.3 + i * 0.15);
        ball(x, 150, v, { col: ACC, r: 17, s });
        const drop1 = v.length < 2, s2 = pop(u, 0.9 + i * 0.15);
        if (drop1) cross(x, 220, 11, s2); else ball(x, 220, v, { col: ACC, r: 17, s: s2 });
        if (!drop1) { const drop2 = i === 1, s3 = pop(u, 1.5 + i * 0.15); if (drop2) cross(x, 290, 11, s3); else ball(x, 290, v, { col: GOOD, r: 17, s: s3 }); } });
      tx(560, 360, '7번 친 입력 가운데 검색까지 가는 것은 "kot" 1번', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
      sub(560, 388, '시각과 입력은 설명을 위한 예시다', fade(u, 2.2)); return; }
    if (k === 2) { // map + flatMapLatest: 새 query 가 오면 이전 검색 취소
      const Q = (ms) => 260 + (ms / 1000) * 600;   // 0~1000ms (예시)
      mlane(260, 860, 90, 'query'); mlane(260, 860, 170, 'search("kot")'); mlane(260, 860, 240, 'search("kotlin")'); mlane(260, 860, 320, '결과');
      mono(860, 56, '시각은 예시', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
      const now = lerp(0, 1000, E(u, 0.2, 2.5));
      ball(Q(0) + 22, 90, 'kot', { col: ACC, r: 18, s: pop(u, 0.2) }); if (now > 400) ball(Q(400) + 22, 90, 'kotlin', { col: ACC, r: 26, s: pop(u, 0.2 + 0.4 * 2.3) });
      el('rect', { x: Q(0), y: 158, width: Math.max(1, Q(Math.min(now, 400)) - Q(0)), height: 24, rx: 5, fill: INFO, opacity: 0.55 });
      if (now > 400) { cross(Q(400) + 12, 170, 10, 1); mono(Q(400) + 30, 175, '취소 (응답 버림)', { 'font-size': 14, 'font-weight': 700, fill: BAD }); }
      if (now > 400) el('rect', { x: Q(400), y: 228, width: Math.max(1, Q(Math.min(now, 850)) - Q(400)), height: 24, rx: 5, fill: GOOD, opacity: 0.55 });
      if (now > 850) ball(Q(850) + 20, 320, 'List', { col: GOOD, r: 22 });
      el('line', { x1: Q(now), y1: 70, x2: Q(now), y2: 335, stroke: INK, 'stroke-width': 1.3, 'stroke-dasharray': '3 3' });
      tx(560, 380, 'map { it.trim() } 을 지나 flatMapLatest 가 최신 검색만 살린다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 3) { // 체인 전체 = 선언. 아직 아무것도 흐르지 않는다
      const row1 = [['searchInput', 110], ['debounce(300)', 300], ['filter', 470], ['distinctUntilChanged', 690]], row2 = [['map', 690], ['flatMapLatest', 500], ['catch', 310], ['suggestions', 120]];
      row1.forEach(([n, x], i) => { station(x, 90, n, { col: INFO, dash: '5 4', s: pop(u, 0.1 + i * 0.18) }); if (i) grow(row1[i - 1][1] + R.tw(row1[i - 1][0], 14) / 2 + 14, 90, x - R.tw(n, 14) / 2 - 14, 90, seg(u, 0.2 + i * 0.18, 0.4 + i * 0.18), INFO, { dash: '4 4' }); });
      grow(690, 110, 690, 172, seg(u, 0.9, 1.1), INFO, { dash: '4 4' });
      row2.forEach(([n, x], i) => { station(x, 190, n, { col: n === 'catch' ? WARN : INFO, dash: '5 4', s: pop(u, 0.9 + i * 0.18) }); if (i) grow(row2[i - 1][1] - R.tw(row2[i - 1][0], 14) / 2 - 14, 190, x + R.tw(n, 14) / 2 + 14, 190, seg(u, 1.0 + i * 0.18, 1.2 + i * 0.18), INFO, { dash: '4 4' }); });
      // catch 의 몫: 예외가 오면 빈 목록
      const s = pop(u, 1.8); if (s > 0) { ball(250, 270, 'Exception', { col: BAD, r: 44, s }); grow(300, 270, 360, 270, seg(u, 1.9, 2.1), WARN); ball(400, 270, '[ ]', { col: WARN, r: 24, s }); mono(440, 276, 'emptyList()', { 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: s }); }
      banner(700, 290, '흐른 값 0건 · 아직 선언일 뿐', pop(u, 2.2)); return; }
    // k 4: debounce + flatMapLatest 가 낡은 응답을 막는다
    [['이전 검색을 그대로 두면', BAD, false], ['flatMapLatest', GOOD, true]].forEach(([n, col, latest], r) => { const y0 = 80 + r * 160, op = fade(u, 0.2 + r * 0.9);
      tx(60, y0 - 26, n, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
      el('rect', { x: 200, y: y0 - 10, width: latest ? 120 : 420, height: 20, rx: 4, fill: latest ? OFF : INFO, opacity: 0.6 * op });
      mono(190, y0 + 5, 'search("ko")', { 'font-size': 13.5, 'text-anchor': 'end', opacity: op });
      if (latest) cross(330, y0, 9, pop(u, 1.4));
      el('rect', { x: 320, y: y0 + 26, width: 220, height: 20, rx: 4, fill: GOOD, opacity: 0.6 * op });
      mono(310, y0 + 41, 'search("kot")', { 'font-size': 13.5, 'text-anchor': 'end', opacity: op });
      // 화면에 남는 결과
      const late = !latest, s = pop(u, 0.9 + r * 0.9);
      card(780, y0 + 18, 200, 46, { rx: 10, text: late ? '화면: "ko" 결과' : '화면: "kot" 결과', fs: 15, stroke: late ? BAD : GOOD, color: late ? BAD : GOOD, fill: late ? BADBG : GOODBG, s });
      grow(late ? 624 : 544, late ? y0 : y0 + 36, 676, y0 + 18, seg(u, 0.7 + r * 0.9, 1.0 + r * 0.9), late ? BAD : GOOD);
      sub(780, y0 + 62, late ? '늦게 온 낡은 응답이 덮어쓴다' : '이전 검색은 취소되어 덮어쓸 수 없다', fade(u, 1.1 + r * 0.9)); }); }

  // ---------- 4. collect — 밸브를 여는 순간 흐른다 ----------
  function runs(n, prev, u) { tx(860, 52, '빌더 실행', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700 });
    mono(860, 92, Math.round(tween(prev, n, u)) + '회', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: n ? ACC : INFO }); }
  function s4(t, c) { const { k, u } = c; const N = [0, 1, 3, 4], open = k >= 1;
    if (k <= 3) runs(N[k], k ? N[k - 1] : null, u);
    if (k === 4) { // launchIn: 호출부는 바로 다음 줄로, collect 는 새 코루틴에서
      const x0 = 260, w = 600;
      [['호출부', 120, INK], ['viewModelScope 의 새 코루틴', 250, ACC]].forEach(([n, y, col], i) => { el('rect', { x: x0, y: y - 15, width: w, height: 30, rx: 6, fill: SOFT, stroke: GRID });
        tx(x0 - 12, y + 5, n, { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: col }); });
      el('rect', { x: x0, y: 108, width: 70, height: 24, rx: 4, fill: INFO, opacity: 0.6 }); mono(x0 + 35, 125, 'launchIn', { 'text-anchor': 'middle', 'font-size': 13.5, fill: PANEL, 'font-weight': 700 });
      const g = E(u, 0.4, 1.4); el('rect', { x: x0 + 74, y: 108, width: (w - 80) * g, height: 24, rx: 4, fill: GOOD, opacity: 0.5 });
      mono(x0 + 90, 125, '바로 다음 줄을 실행', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 0.8) });
      grow(x0 + 35, 132, x0 + 35, 232, seg(u, 0.3, 0.7), ACC);
      [1, 2, 3].forEach((v, i) => { const s = pop(u, 0.9 + i * 0.4); ball(x0 + 120 + i * 140, 250, v, { s, r: 16 }); mono(x0 + 120 + i * 140, 300, 'ui.show(' + v + ')', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.0 + i * 0.4) }); });
      tx(480, 370, 'onEach 로 처리를 붙이고 launchIn 이 별도 코루틴에서 collect 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    tap(150, 190, 200, 100, 'nums', 'Flow<Int>', open, {});
    pipe(254, 190, 520, { col: open ? ACCBG : GRID, w: 18 });
    if (k === 0) { [1, 2, 3].forEach((v, i) => ball(150 + (i - 1) * 50, 290, v, { ghost: true, col: INFO, r: 15, op: fade(u, 0.4 + i * 0.2) }));
      tx(400, 360, '1, 2, 3 을 내보낼 준비만 해 두었다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.2) }); return; }
    if (k === 1) { card(620, 190, 180, 60, { rx: 10, text: 'collect { v -> … }', fs: 14, mono: true, stroke: ACC, s: pop(u, 0.2) });
      const L = []; [1, 2, 3].forEach((v, i) => { const p = seg(u, 0.5 + i * 0.6, 1.1 + i * 0.6); if (p > 0 && p < 1) ball(lerp(260, 540, p), 190, v, { r: 16 }); if (p >= 1) L.push('받음: ' + v); });
      terminal(560, 260, 300, 130, L, L.length, { title: '콘솔' }); return; }
    if (k === 2) { // toList 와 first
      card(640, 110, 200, 44, { rx: 10, text: 'toList()', fs: 15, mono: true, stroke: GOOD });
      R.cells(560, 140, [1, 2, 3].map((v, i) => fade(u, 0.4 + i * 0.3) > 0.5 ? v : ''), { w: 50, h: 36, style: () => ({ stroke: GOOD }) });
      mono(740, 166, '= [1, 2, 3]', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.3) });
      card(640, 270, 200, 44, { rx: 10, text: 'first()', fs: 15, mono: true, stroke: ACC, s: pop(u, 1.4) });
      ball(580, 320, 1, { r: 16, s: pop(u, 1.6) }); [2, 3].forEach((v, i) => { ball(640 + i * 50, 320, v, { ghost: true, col: OFF, r: 16, op: fade(u, 1.8) }); cross(640 + i * 50, 320, 9, pop(u, 2.0)); });
      mono(780, 326, '= 1 · 흐름 취소', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
      tx(260, 380, '부를 때마다 빌더가 처음부터 다시 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k 3: reduce 로 누적
    card(640, 120, 220, 46, { rx: 10, text: 'reduce { acc, v -> acc + v }', fs: 13.5, mono: true, stroke: WARN });
    const st = [['acc = 1', 0.3], ['1 + 2 = 3', 1.0], ['3 + 3 = 6', 1.7]];
    st.forEach(([s, a], i) => { const p = seg(u, a, a + 0.5); if (p > 0 && p < 1) ball(lerp(260, 540, p), 190, i + 1, { r: 16 });
      mono(560, 220 + i * 36, s, { 'font-size': 16, 'font-weight': 700, fill: i === 2 ? WARN : INK, opacity: fade(u, a + 0.5) }); });
    card(820, 292, 120, 46, { rx: 10, text: 'sum = 6', fs: 16, mono: true, stroke: WARN, fill: WARNBG, color: WARN, s: pop(u, 2.3) }); }

  // ---------- 5. StateFlow · SharedFlow — 뜨거운 흐름 ----------
  function sbox(cx, cy, v, o) { o = o || {}; card(cx, cy, o.w || 230, 92, { rx: 12, stroke: WARN, fill: WARNBG, s: o.s, op: o.op });
    mono(cx, cy - 18, o.title || 'MutableStateFlow', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: o.op ?? 1 });
    card(cx, cy + 16, 64, 38, { rx: 8, text: String(v), fs: 20, mono: true, stroke: WARN, fill: PANEL, color: INK, op: o.op }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tap(220, 150, 240, 100, 'Flow<T>', 'collect 마다 새로 실행', false, { s: pop(u, 0.2) });
      tx(220, 240, 'cold · 값을 들고 있지 않다', { 'text-anchor': 'middle', 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 0.5) });
      sbox(680, 150, 0, { s: pop(u, 0.9) });
      tx(680, 240, 'hot · 구독자가 없어도 현재값 0 을 품고 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.4) });
      el('circle', { cx: 680, cy: 166, r: 34 + 6 * Math.sin(t * 4), fill: 'none', stroke: WARN, 'stroke-width': 2, opacity: 0.4 * fade(u, 1.4) }); return; }
    if (k === 1) { el('rect', { x: 50, y: 50, width: 440, height: 300, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2 });
      mono(70, 78, 'class CounterViewModel', { 'font-size': 15, 'font-weight': 800 });
      sbox(270, 190, 0, { title: '_count (private)', w: 260, s: pop(u, 0.2) });
      mono(270, 290, '_count.value 는 안에서만 바꾼다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
      grow(400, 190, 610, 190, seg(u, 0.8, 1.4), WARN); mono(555, 178, 'asStateFlow()', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      card(760, 190, 260, 92, { rx: 12, stroke: WARN, fill: PANEL, s: pop(u, 1.4) });
      mono(760, 172, 'count: StateFlow<Int>', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
      mono(740, 214, '0', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, opacity: fade(u, 1.5) }); lock(800, 210, true, MUT, pop(u, 1.8));
      tx(760, 270, '밖에서는 읽기만', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { const v = u < 0.9 ? 0 : 1; sbox(220, 190, v, {});
      mono(220, 110, '_count.value += 1', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      [['구독자 A', 110], ['구독자 B', 270]].forEach(([n, y], i) => { card(720, y, 200, 60, { rx: 10, stroke: INK, text: n, fs: 14.5 });
        dot([[350, 190], [610, y]], seg(u, 1.0 + i * 0.15, 1.8 + i * 0.15), WARN, 8);
        mono(850, y + 6, String(u < 1.8 + i * 0.15 ? 0 : 1), { 'font-size': 20, 'font-weight': 800, fill: WARN }); });
      tx(220, 300, '현재값 0 → 1', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.0) });
      sub(480, 380, '같은 값을 다시 넣으면 전파하지 않는다', fade(u, 2.2), { 'font-size': 14.5 }); return; }
    if (k === 3) { // Compose 화면
      const v = u < 1.4 ? 1 : 2;
      el('rect', { x: 600, y: 40, width: 220, height: 340, rx: 26, fill: PANEL, stroke: INK, 'stroke-width': 2.5 });
      mono(710, 150, 'Count: ' + v, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: v === 2 ? ACC : INK });
      const press = u > 0.8 && u < 1.2; card(710, 240, 90, 50, { rx: 10, text: '+', fs: 24, stroke: ACC, fill: press ? ACC : ACCBG, color: press ? PANEL : ACC });
      sbox(250, 140, v, { title: 'vm.count' });
      grow(370, 140, 590, 150, seg(u, 1.4, 1.9), WARN); mono(480, 130, 'collectAsState()', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN });
      grow(660, 250, 370, 170, seg(u, 0.9, 1.3), ACC, { dash: '4 4' }); mono(470, 250, 'vm.increment()', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.9) });
      tx(300, 330, '값이 바뀌면 Text 가 다시 그려진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    // k 4: SharedFlow — 그 순간 구독 중인 쪽에만
    card(180, 190, 230, 80, { rx: 12, stroke: INFO, fill: INFOBG, text: 'MutableSharedFlow\n<UiEvent>', fs: 14.5, mono: true });
    const ev = seg(u, 0.5, 1.4);
    [['구독자 A', 100, true], ['구독자 B', 190, true], ['늦게 온 구독자', 300, false]].forEach(([n, y, on], i) => {
      const op = on ? 1 : fade(u, 1.6); card(740, y, 210, 56, { rx: 10, stroke: on ? INK : GRID, text: n, fs: 14.5, dash: on ? null : '5 4', op });
      if (on) { dot([[300, 190], [630, y]], ev, INFO, 8); if (ev >= 1) check(870, y, 10, pop(u, 1.4)); }
      else { cross(870, y, 9, pop(u, 1.9)); sub(740, y + 46, 'emit 뒤에 구독해 받지 못한다', fade(u, 2.0)); } });
    mono(460, 150, 'emit(e)', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.4) });
    tx(180, 300, '값을 보관하지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: '시세처럼 값이 시간 차로 계속 들어올 때 List로 받으면 생기는 문제는 무엇인가?',
      o: ['값이 하나만 온다', '전부 메모리에 모인 뒤에야 처리를 시작한다', '값의 순서가 뒤섞인다'], a: 1,
      why: 'List는 모든 값을 다 받아야 돌려준다. Flow는 emit 할 때마다 한 건씩 흘려보내 도착하는 대로 처리한다.' },
    { q: 'flow { println("시작"); emit(1) }를 변수에 담기만 하고 collect 하지 않으면 무엇이 출력되나?',
      o: ['"시작"', '"시작" 과 1', '아무것도 출력되지 않는다'], a: 2,
      why: 'Flow는 차갑다. 빌더 블록은 collect를 부를 때 비로소 실행되므로 그전에는 println도 돌지 않는다.' },
    { q: '검색창에서 새 검색어가 들어오면 진행 중이던 이전 검색을 취소하는 연산자는 무엇인가?',
      o: ['debounce', 'distinctUntilChanged', 'flatMapLatest'], a: 2,
      why: 'flatMapLatest는 새 값이 오면 이전 값으로 시작한 안쪽 흐름을 취소한다. 그래서 늦게 온 낡은 응답이 화면을 덮지 않는다.' },
    { q: '같은 nums에 collect, toList, first, reduce를 차례로 부르면 빌더는 모두 몇 번 실행되나?',
      o: ['1번', '4번', '0번'], a: 1,
      why: '차가운 Flow는 종결 연산자를 부를 때마다 처음부터 다시 실행된다. 네 번 불렀으니 네 번 돈다.' },
    { q: 'UI의 "지금 값" 을 담아 두고 새 구독자에게도 바로 주고 싶다. 무엇을 쓰나?',
      o: ['StateFlow', 'SharedFlow (replay 0)', '차가운 flow { }'], a: 0,
      why: 'StateFlow는 현재값 하나를 늘 품고 있어 구독하자마자 그 값을 준다. SharedFlow는 기본으로 값을 보관하지 않는다.' },
  ];

  const summary = [
    'suspend 함수는 값 하나를 돌려주고, List는 전부 모인 뒤에야 처리할 수 있다.',
    'Flow는 값을 시간 차로 한 건씩 흘려보내고, collect 하기 전에는 빌더가 돌지 않는다.',
    'debounce, filter 같은 연산자로 입력을 거르고 flatMapLatest로 이전 검색을 취소한다.',
    '차가운 Flow는 구독마다 다시 돈다. UI 상태는 StateFlow, 일회성 이벤트는 SharedFlow에 담는다.',
  ];
  const review = [
    { q: '앱을 열 때마다 서버 로그에 같은 조회가 세 번씩 찍힌다. 화면 세 곳이 같은 flow { }를 각자 collect하고 있었다. 왜인가?',
      o: ['차가운 Flow라 collect마다 빌더가 다시 실행돼서', 'debounce 시간이 너무 짧아서', 'emit이 값을 세 번 복사해서'], a: 0,
      why: '차가운 Flow는 구독마다 처음부터 돈다. 한 번만 실행하고 결과를 나누려면 StateFlow 같은 뜨거운 흐름에 담아 공유한다.' },
    { q: '검색창에서 "ko" 결과가 "kot" 결과보다 늦게 와 화면이 낡은 목록으로 바뀐다. 먼저 쓸 연산자는?',
      o: ['filter', 'flatMapLatest', 'toList'], a: 1,
      why: 'flatMapLatest는 새 검색어가 오면 이전 검색 흐름을 취소한다. 취소된 검색의 응답은 화면에 닿지 못한다.' },
    { q: '"저장 완료" 토스트를 한 번만 띄우고 싶은데 StateFlow에 담았더니 화면을 돌릴 때마다 다시 뜬다. 무엇으로 바꾸나?',
      o: ['차가운 flow { }', 'StateFlow에 같은 값 다시 넣기', 'SharedFlow'], a: 2,
      why: 'StateFlow는 마지막 값을 보관해 새 구독자에게 다시 준다. 일회성 이벤트는 값을 보관하지 않는 SharedFlow가 맞다.' },
  ];

  R.page({ title: 'Flow 구성요소', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
