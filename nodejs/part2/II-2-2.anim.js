/* II-2-2 이벤트 루프 심화 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 이 장의 부품 ----------
  // 이벤트 루프 고리: 여섯 단계를 시계 방향으로. o.lit = 켜진 단계 번호, o.ptr = 포인터 위치(0~6, 단계 사이도 가능)
  const PH = ['timers', 'pending', 'idle·prepare', 'poll', 'check', 'close'];
  function ring(cx, cy, r, o) { o = o || {}; const bw = o.bw || 124, fs = o.fs || 15, pos = [];
    el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3 });
    for (let i = 0; i < 6; i++) { const a = (-90 + i * 60) * Math.PI / 180; pos.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    // 시계 방향 표시: 단계 사이 작은 화살촉
    for (let i = 0; i < 6; i++) { const a = (-60 + i * 60) * Math.PI / 180, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a), d = a * 180 / Math.PI + 90;
      el('path', { d: 'M-6,-6 L4,0 L-6,6', fill: 'none', stroke: MUT, 'stroke-width': 2, transform: `translate(${x} ${y}) rotate(${d})` }); }
    pos.forEach(([x, y], i) => { const lit = o.lit === i || (o.lits && o.lits.includes(i)), dim = i === 2 && !lit;
      card(x, y, bw, 36, { rx: 18, text: o.short && i === 2 ? 'idle' : PH[i], fs, mono: true, fw: 700, stroke: lit ? (o.litCol || ACC) : dim ? GRID : INK, color: lit ? (o.litCol || ACC) : dim ? OFF : INK, fill: lit ? ACCBG : PANEL, sw: lit ? 3 : 1.8 }); });
    if (o.ptr != null) { const a = (-90 + o.ptr * 60) * Math.PI / 180; el('circle', { cx: cx + (r - 26) * Math.cos(a), cy: cy + (r - 26) * Math.sin(a), r: 8, fill: o.ptrCol || ACC }); }
    if (o.center !== false) { tx(cx, cy - 4, o.center || '이벤트 루프', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: o.centerCol || MUT });
      if (o.center2) tx(cx, cy + 20, o.center2, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
    return pos; }
  // 큐 칩 (짧은 이름)
  const chip = (x, y, s, col, sc, op) => card(x, y, tw(s, 13.5) + 22, 28, { rx: 6, text: s, fs: 13.5, mono: true, fw: 700, stroke: 'none', fill: col || ACC, color: PANEL, s: sc, op });
  // 큐 한 줄 (제목 + 칩들)
  function qline(x, y, w, title, items, o) { o = o || {};
    tx(x, y - 9, title, { 'font-size': 14.5, 'font-weight': 800, fill: o.col || MUT });
    el('rect', { x, y, width: w, height: 42, rx: 8, fill: o.fill || PANEL, stroke: o.col || GRID, 'stroke-width': 1.8 });
    let cx = x + 10; items.forEach((it) => { const iw = tw(it.t, 13.5) + 22; chip(cx + iw / 2, y + 21, it.t, it.c || o.col, it.s, it.op); cx += iw + 8; }); }

  // ---------- 1. 여섯 단계 ----------
  const CQ = { 0: [420, 65], 3: [430, 365], 4: [170, 326] };
  function s1(t, c) { const { k, u } = c;
    const CX = 300, CY = 215;
    const lit = k === 0 ? 0 : k === 1 ? 4 : k === 2 ? 3 : null;
    let ptr = null, lits = [];
    if (k === 4) { ptr = E(u, 0.2, 2.6) * 6; lits = [Math.min(5, Math.floor(ptr))]; }
    ring(CX, CY, 150, { lit, lits, ptr, center: k === 3 ? '아직 안 돈다' : '이벤트 루프', centerCol: k === 3 ? WARN : MUT, center2: k === 3 ? '동기 코드가 먼저' : '한 바퀴 = tick' });
    // 큐에 들어간 콜백
    const inT = k > 0 || u > 1.2, inC = k > 1 || (k === 1 && u > 1.2), inP = k > 2 || (k === 2 && u > 2.0);
    if (inT) chip(CQ[0][0], CQ[0][1], 'setTimeout cb', WARN, k === 0 ? pop(u, 1.2) : 1, k === 4 && ptr > 0.5 ? 0.25 : 1);
    if (inC) chip(CQ[4][0], CQ[4][1], 'setImmediate cb', INFO, k === 1 ? pop(u, 1.2) : 1, k === 4 && ptr > 4.5 ? 0.25 : 1);
    if (inP) chip(CQ[3][0], CQ[3][1], 'readFile cb', ACC, k === 2 ? pop(u, 2.0) : 1);
    // 오른쪽: 코드 세 줄
    zone(560, 30, 376, 150, 'phases.js', { fill: SOFT });
    [['setTimeout(…, 0)', WARN], ['setImmediate(…)', INFO], ['fs.readFile(__filename, cb)', ACC]].forEach(([s, col], i) => {
      const on = i === k || k >= 3; mono(580, 80 + i * 36, s, { 'font-size': 14.5, 'font-weight': on ? 700 : 400, fill: on ? col : OFF }); });
    if (k === 0) fly(880, 80, CQ[0][0], CQ[0][1], seg(u, 0.3, 1.2), 'cb', { fill: WARN, mono: true });
    if (k === 1) fly(880, 116, CQ[4][0], CQ[4][1], seg(u, 0.3, 1.2), 'cb', { fill: INFO, mono: true });
    // libuv 스레드 풀 (파일 읽기)
    if (k === 2 || k === 3) { zone(560, 210, 376, 120, 'libuv 스레드 풀 (기본 4개)', { fill: SOFT });
      for (let i = 0; i < 4; i++) { const x = 580 + i * 88, busy = k === 2 && i === 0 && u > 0.7 && u < 2.0;
        card(x + 38, 280, 76, 44, { rx: 8, text: busy ? '읽는 중' : '쉼', fs: 13.5, stroke: busy ? ACC : GRID, color: busy ? ACC : OFF }); }
      if (k === 2) { fly(700, 152, 618, 280, seg(u, 0.2, 0.7), 'read', { fill: ACC, mono: true }); fly(618, 280, CQ[3][0], CQ[3][1], seg(u, 2.0, 2.6), 'cb', { mono: true }); } }
    if (k === 3) { tx(748, 370, '세 줄은 예약만 했다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      tx(748, 396, '실행은 루프가 단계를 돌 때', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) }); }
    if (k === 4) { const roles = ['만료된 setTimeout · setInterval', '미뤄진 일부 시스템 콜백', 'libuv 내부용', 'I/O 완료 콜백, 여기서 기다림', 'setImmediate 전용', 'socket close 등 정리'];
      const cur = Math.min(5, Math.floor(ptr));
      roles.forEach((r, i) => { const y = 220 + i * 31, on = i <= cur;
        mono(580, y, PH[i], { 'font-size': 14, 'font-weight': 700, fill: i === cur ? ACC : on ? INK : OFF });
        tx(700, y, r, { 'font-size': 13.5, fill: i === cur ? INK : on ? MUT : OFF }); }); } }

  // ---------- 2. 마이크로태스크 서열 ----------
  function s2(t, c) { const { k, u } = c;
    // 콜 스택
    zone(24, 40, 200, 170, '콜 스택', { fill: SOFT });
    let fr = null;
    if (k === 0 && u > 0.2 && u < 1.6) fr = ['log("1)")', INFO];
    if (k === 4 && u > 0.2 && u < 1.6) fr = ['log("2)")', INFO];
    if (k === 5) { const ph = u < 0.9 ? 0 : u < 1.7 ? 1 : u < 2.5 ? 2 : -1; if (ph >= 0) fr = [['nextTick cb', WARN], ['then cb', GOOD], ['setTimeout cb', INFO]][ph]; }
    if (fr) card(124, 170, 168, 34, { rx: 6, text: fr[0], fs: 14, mono: true, stroke: fr[1], color: fr[1] });
    else sub(124, 130, k === 4 && u > 1.6 ? '비었다 → 큐 차례' : '비어 있음', 1, { 'font-weight': 700, fill: k === 4 && u > 1.6 ? ACC : MUT });
    // 세 큐 (서열 순)
    const has = (q) => (q === 'm' ? k >= 2 || (k === 1 && u > 1.0) : q === 'p' ? k >= 3 || (k === 2 && u > 1.0) : k >= 4 || (k === 3 && u > 1.0));
    const gone = (i) => k === 5 && u > [0.9, 1.7, 2.5][i] - 0.6;
    const Q = [['① nextTick 큐 (마이크로, 최우선)', 'n', 'nextTick cb', WARN], ['② Promise 큐 (마이크로)', 'p', 'then cb', GOOD], ['③ 매크로 큐 (timers)', 'm', 'setTimeout cb', INFO]];
    Q.forEach(([title, q, name, col], i) => { const y = 80 + i * 100;
      qline(260, y, 330, title, has(q) && !gone(i) ? [{ t: name, c: col, s: k === [3, 2, 1][i] ? pop(u, 1.0) : 1 }] : [], { col }); });
    if (k === 1) fly(124, 230, 330, 301, seg(u, 0.3, 1.0), 'setTimeout', { fill: INFO, mono: true });
    if (k === 2) fly(124, 230, 320, 201, seg(u, 0.3, 1.0), '.then', { fill: GOOD, mono: true });
    if (k === 3) { fly(124, 230, 330, 101, seg(u, 0.3, 1.0), 'nextTick', { fill: WARN, mono: true }); sub(470, 145, '같은 마이크로라도 Promise 보다 앞', fade(u, 1.4), { fill: WARN, 'font-weight': 700 }); }
    if (k === 5) [[300, 101], [300, 201], [300, 301]].forEach(([x, y], i) => dot([[x, y], [230, y], [124, 170]], seg(u, [0.2, 1.0, 1.8][i], [0.8, 1.6, 2.4][i]), [WARN, GOOD, INFO][i], 7));
    // 출력
    const lines = ['$ node microtask.js', '1) 동기 코드 (지금 당장)', '2) 동기 코드 끝', '3) nextTick (마이크로태스크 최우선)', '4) Promise.then (마이크로태스크)', '5) setTimeout'].map((s, i) => (i ? [s, 'var(--term)'] : s));
    const shown = k < 4 ? 1 + (k === 0 ? E(u, 0.8, 1.4) : 1) : k === 4 ? 2 + E(u, 0.8, 1.4) : 3 + E(u, 0.9, 1.1) + E(u, 1.7, 1.9) + E(u, 2.5, 2.7);
    terminal(620, 40, 316, 200, lines, shown, { title: '출력', fs: 13.5, lh: 24 });
    if (k === 5) tx(778, 300, '동기 → nextTick → Promise → 매크로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.6) }); }

  // ---------- 3. 실행 순서 맞히기 ----------
  const OUT = [['sync: 시작', INK], ['sync: 끝', INK], ['nextTick', WARN], ['Promise.then', GOOD], ['setTimeout(0)', INFO], ['setImmediate', INFO]];
  function s3(t, c) { const { k, u } = c;
    const L = [['nextTick', 'nextTick', WARN], ['Promise', '.then', GOOD], ['timers', 'setTimeout', INFO], ['check', 'setImmediate', INFO]];
    const left = (i) => (i === 0 ? k >= 4 || (k === 3 && u > 0.6) : i === 1 ? k >= 5 || (k === 4 && u > 0.6) : k === 5 && u > 0.6 + (i - 2) * 0.6);
    L.forEach(([n, s, col], i) => { const y = 70 + i * 82, inQ = (k >= 2 || (k === 1 && u > 0.6 + i * 0.3)) && !left(i);
      qline(40, y, 330, (i < 2 ? '마이크로 · ' : '매크로 · ') + n, inQ ? [{ t: s, c: col, s: k === 1 ? pop(u, 0.6 + i * 0.3) : 1 }] : [], { col });
      if (k === 1) fly(410, y + 21, 120, y + 21, seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3), s, { fill: col, mono: true }); });
    // 출력 판: 여섯 칸
    tx(460, 52, '출력 순서', { 'font-size': 15, 'font-weight': 800 });
    const n = k === 0 ? 1 : k === 1 ? 1 : k === 2 ? 2 : k === 3 ? 3 : k === 4 ? 4 : 6;
    OUT.forEach(([s, col], i) => { const y = 72 + i * 52, on = i < n, isNew = (k === 0 && i === 0) || (k === 2 && i === 1) || (k === 3 && i === 2) || (k === 4 && i === 3) || (k === 5 && i >= 4);
      const sc = isNew ? pop(u, k === 5 ? 1.0 + (i - 4) * 0.5 : 0.6) : 1;
      el('rect', { x: 460, y, width: 300, height: 42, rx: 8, fill: PANEL, stroke: GRID, 'stroke-dasharray': on ? null : '4 4' });
      mono(478, y + 27, String(i + 1), { 'font-size': 16, 'font-weight': 800, fill: on ? INK : OFF });
      if (on) card(630, y + 21, 220, 32, { rx: 6, text: s, fs: 14.5, mono: true, stroke: col, color: col, s: sc }); });
    if (k === 5) { el('path', { d: 'M772,286 h12 v84 h-12', fill: 'none', stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      tx(796, 316, '메인 모듈에선', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      tx(796, 336, '둘 순서가 바뀐다', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) });
      mono(40, 400, '30번 실행: setImmediate 먼저 21 · setTimeout 먼저 9', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) }); } }

  // ---------- 4. setTimeout(0) vs setImmediate ----------
  function s4(t, c) { const { k, u } = c;
    const A = [230, 200], B = [720, 200], r = 110;
    tx(A[0], 40, '메인 모듈에서', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: k <= 1 ? BAD : OFF });
    tx(B[0], 40, 'I/O 콜백 안에서', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: k >= 2 ? GOOD : OFF });
    // 왼쪽 고리
    const pa = ring(A[0], A[1], r, { bw: 92, fs: 13.5, short: true, center: k === 1 ? '?' : '루프 시작 전', centerCol: k === 1 ? BAD : MUT, lit: k === 1 ? (Math.floor(t * 1.2) % 2 ? 0 : 4) : null, litCol: BAD });
    if (k <= 1) { chip(pa[0][0] + 30, pa[0][1] - 30, 'timeout', WARN, k === 0 ? pop(u, 0.4) : 1); chip(pa[4][0] - 20, pa[4][1] + 34, 'immediate', INFO, k === 0 ? pop(u, 0.8) : 1); }
    if (k === 1) { // 실제로 30번 돌려 본 결과
      const y = 364, f = E(u, 0.4, 1.6);
      el('rect', { x: 40, y, width: 380 * (28 / 30) * f, height: 20, rx: 4, fill: INFO, opacity: 0.8 }); el('rect', { x: 40 + 380 * (28 / 30) * f, y, width: 380 * (2 / 30) * f, height: 20, rx: 4, fill: WARN });
      mono(40, y + 42, '30번 실행: immediate 먼저 28 · timeout 먼저 2', { 'font-size': 13.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(230, 350, '1ms 타이머가 만료로 보이느냐에 달렸다', fade(u, 2.0), { fill: BAD, 'font-weight': 700 }); }
    if (k === 0) sub(230, 360, '각각 timers, check 큐로', fade(u, 1.2), { 'font-weight': 700, 'font-size': 15 });
    // 오른쪽 고리
    let ptr = null, lit = null;
    if (k >= 2) { ptr = 3; lit = 3; }
    if (k === 3) { ptr = lerp(3, 6, E(u, 0.6, 2.4)); lit = Math.floor(ptr) % 6; }
    if (k === 4) { ptr = 3.5; lit = null; }
    const pb = ring(B[0], B[1], r, { bw: 92, fs: 13.5, short: true, ptr, lit, lits: k === 4 ? [3, 4] : [], litCol: GOOD, center: k >= 2 ? 'readFile 콜백' : '', center2: k >= 2 ? 'poll 에서 실행 중' : null, centerCol: GOOD });
    if (k >= 2) { const showT = !(k === 3 && ptr >= 6 - 0.05) , showI = !(k === 3 && ptr >= 4) ;
      if (k >= 3 || u > 0.8) { if (showI) chip(pb[4][0] - 20, pb[4][1] + 34, 'immediate', INFO, k === 2 ? pop(u, 0.8) : 1); if (showT) chip(pb[0][0] + 30, pb[0][1] - 30, 'timeout', WARN, k === 2 ? pop(u, 1.1) : 1); } }
    if (k === 2) sub(720, 360, '지금 위치는 poll, 다음 단계는 check', fade(u, 1.5), { 'font-weight': 700, 'font-size': 15, fill: INK });
    if (k >= 3) { const lines = ['$ node timeout-vs-immediate.js', ['io: immediate', 'var(--term)'], ['io: timeout', 'var(--term)']];
      const sh = k === 3 ? 1 + (ptr >= 4 ? 1 : 0) + (ptr >= 5.95 ? 1 : 0) : 3;
      terminal(560, 336, 376, 80, lines, sh, { title: '출력', lh: 18, fs: 13.5 }); }
    if (k === 4) { el('path', { d: `M${pb[3][0] - 50},${pb[3][1] - 26} Q${pb[4][0] + 10},${pb[3][1] - 20} ${pb[4][0] + 20},${pb[4][1] + 22}`, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': 200, 'stroke-dashoffset': 200 * (1 - E(u, 0.2, 1.0)) });
      sub(230, 340, '30번 모두 io: immediate 가 먼저', fade(u, 1.2), { 'font-size': 15, 'font-weight': 800, fill: GOOD });
      sub(230, 370, 'poll 바로 다음이 check 이기 때문', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK }); } }

  // ---------- 5. 스타베이션과 선택 기준 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 4) { const P = [['지금 콜백 직후, 단 한 번', 'process.nextTick', WARN], ['I/O 다음, 다음 바퀴 초반', 'setImmediate', INFO], ['최소 N ms 뒤', 'setTimeout(fn, N)', INK], ['무거운 CPU 계산', 'worker_threads', ACC]];
      tx(60, 56, '언제 무엇을 쓰나', { 'font-size': 18, 'font-weight': 800 });
      P.forEach(([w, api, col], i) => { const y = 110 + i * 70, s = pop(u, 0.2 + i * 0.35);
        card(480, y, 840, 54, { rx: 10, stroke: col, sw: 2, s });
        tx(90, y + 6, w, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.35) });
        mono(560, y + 6, api, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.35) }); });
      tx(480, 400, 'nextTick 은 재귀 금지, 무거운 계산은 루프 밖으로', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); return; }
    const CX = 290, CY = 215;
    if (k <= 1) { // nextTick 재귀
      ring(CX, CY, 150, { ptr: 0.5, ptrCol: BAD, center: '단계를 못 넘어간다', centerCol: BAD });
      lock(CX, CY + 40, true, BAD, pop(u, k === 0 ? 1.8 : 0));
      // nextTick 큐: 꺼내면 바로 다시 채워진다
      qline(560, 70, 376, 'nextTick 큐', [{ t: 'starve', c: WARN }], { col: WARN });
      const f = (t * 1.6) % 1;
      fly(640, 91, 640, 160, f < 0.5 ? f * 2 : 0, 'starve', { fill: BAD, mono: true });
      grow(700, 160, 700, 112, f > 0.5 ? (f - 0.5) * 2 : 0, WARN);
      mono(760, 160, '꺼내면 또 등록', { 'font-size': 14, 'font-weight': 700, fill: WARN });
      tx(560, 210, '큐 길이', { 'font-size': 15, fill: MUT, 'font-weight': 700 }); mono(650, 212, '1 → 1 → 1 …', { 'font-size': 16, 'font-weight': 800, fill: BAD });
      if (k === 1) { chip(420, 65, 'setTimeout cb', WARN, 1); chip(430, 365, 'readFile cb', ACC, 1);
        clock(506, 65, 12, 0.15 + 0.8 * E(u, 0.2, 2.6), BAD, null); clock(516, 365, 12, 0.15 + 0.8 * E(u, 0.2, 2.6), BAD, null);
        tx(560, 290, '실험: nextTick 을 200만 번에서 멈추게 했더니', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
        tx(560, 316, 'setTimeout 은 그 뒤에야 돌았다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); }
      return; }
    // k2·k3: setImmediate 로 한 조각씩
    let ptr = k === 2 ? 4 : E(u, 0.2, 2.6) * 6 + 4;
    const lit = Math.floor(ptr) % 6;
    ring(CX, CY, 150, { ptr: ptr % 6, lit, center: '매 바퀴 한 조각', centerCol: ACC });
    if (k === 2) { chip(170, 326, 'yieldLoop(n-1)', INFO, pop(u, 0.6)); sub(150, 408, '다음 조각은 check 큐로', fade(u, 1.0), { fill: INFO, 'font-weight': 700 }); }
    if (k === 3) { if (ptr < 9) chip(430, 365, 'readFile cb', ACC, 1); else sub(430, 408, 'readFile 콜백 실행', 1, { fill: ACC, 'font-weight': 800 });
      chip(170, 326, 'yieldLoop(n-1)', INFO, 1); }
    // 오른쪽: 1000 조각 막대
    tx(560, 70, 'yieldLoop(1000)', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    const done = k === 2 ? E(u, 0.3, 2.6) * 3 : 3 + E(u, 0.2, 2.6) * 2;
    for (let i = 0; i < 20; i++) el('rect', { x: 560 + i * 18, y: 90, width: 14, height: 30, rx: 3, fill: i < done ? INFO : SOFT, stroke: GRID });
    sub(740, 145, '한 칸 = 한 조각 (그림은 앞 20칸)', 1, { 'font-size': 13.5 });
    if (k === 3) { tx(560, 210, '조각 사이마다 poll 이 돈다', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.8) });
      tx(560, 240, '그래서 readFile 콜백도 끼어든다', { 'font-size': 15, opacity: fade(u, 1.2) });
      mono(560, 290, '한 번 돌려 보니 18번째 조각 뒤에 실행', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 2) { tx(560, 210, '반복을 조각으로 나누고', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(560, 240, '다음 조각은 다음 바퀴에', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.2) }); } }

  const quiz = [
    { q: 'fs.readFile의 완료 콜백은 이벤트 루프의 어느 단계에서 실행되는가?',
      o: ['poll', 'timers', 'check'], a: 0,
      why: '파일 읽기는 libuv 스레드 풀이 맡고, 완료 콜백은 poll 단계에서 돈다. timers는 setTimeout, check는 setImmediate 차지다.' },
    { q: '같은 동기 코드 안에서 setTimeout(0), Promise.then, process.nextTick을 걸었다. 콜백 중 가장 먼저 찍히는 것은?',
      o: ['setTimeout 콜백', 'nextTick 콜백', 'Promise.then 콜백'], a: 1,
      why: '동기 코드가 끝나면 nextTick 큐, Promise 큐 순으로 비우고 나서야 timers로 간다. 출력은 1) 2) 3) 4) 5) 순이다.' },
    { q: '메인 모듈에서 setTimeout(0)과 setImmediate를 나란히 걸었을 때 순서에 대해 맞는 것은?',
      o: ['setTimeout이 항상 먼저다', 'setImmediate가 항상 먼저다', '실행마다 바뀔 수 있다'], a: 2,
      why: '루프가 시작될 때 1ms 타이머가 만료로 보이느냐에 달려 있다. 30번 돌리면 21번은 setImmediate, 9번은 setTimeout이 먼저였다.' },
    { q: 'readFile 콜백 안에서 setTimeout(0)과 setImmediate를 걸면 어느 쪽이 먼저인가?',
      o: ['setImmediate', 'setTimeout', '그때그때 다르다'], a: 0,
      why: '콜백은 poll에서 돌고 바로 다음 단계가 check다. setTimeout은 다음 바퀴 timers까지 밀린다. 30번 모두 같은 순서였다.' },
    { q: 'nextTick 콜백이 자기 자신을 다시 nextTick으로 걸면 생기는 일은 무엇인가?',
      o: ['한 바퀴에 한 번씩만 실행된다', '마이크로 큐가 비지 않아 I/O와 타이머가 굶는다', 'Node가 자동으로 setImmediate로 바꾼다'], a: 1,
      why: '마이크로 큐를 다 비워야 다음 단계로 가는데 비울 때마다 다시 찬다. 반복이 필요하면 setImmediate로 매 바퀴 양보한다.' },
  ];

  const summary = [
    '이벤트 루프는 여섯 단계를 정해진 순서로 돌고, 콜백은 자기가 등록된 단계에 와서야 실행된다.',
    '동기 코드가 끝나면 nextTick 큐, Promise 큐를 다 비운 뒤에야 다음 매크로태스크로 간다.',
    '메인 모듈의 setTimeout(0)과 setImmediate는 순서가 흔들리고, I/O 콜백 안에서는 setImmediate가 먼저다.',
    'nextTick을 재귀로 걸면 I/O가 굶는다. 반복은 setImmediate로, 무거운 계산은 worker_threads로 뺀다.',
  ];
  const review = [
    { q: '로그가 코드에 쓴 순서와 다르게 찍힌다. 가장 먼저 따져 볼 것은?',
      o: ['각 콜백이 어느 큐에 들어가는지', '콘솔 버퍼 크기', 'console.log를 몇 번 불렀는지'], a: 0,
      why: '순서는 줄 순서가 아니라 큐가 정한다. 동기, nextTick, Promise, 그다음 timers와 check 순이다.' },
    { q: '서버 CPU는 100% 인데 요청에 전혀 응답하지 않는다. 코드에서 먼저 찾을 것은?',
      o: ['setImmediate로 조각을 나눈 반복', 'setTimeout의 지연 시간이 큰 곳', '자기 자신을 다시 거는 process.nextTick'], a: 2,
      why: 'nextTick 재귀는 마이크로 큐를 끝없이 채워 poll 단계에 가지 못하게 한다. I/O 콜백이 하나도 안 돈다.' },
    { q: '파일을 다 읽은 직후 다음 작업을 확실히 이어 붙이고 싶다. 그 콜백 안에서 쓸 것은?',
      o: ['setTimeout(fn, 0)', 'setImmediate(fn)', 'while 문으로 기다리기'], a: 1,
      why: 'poll 바로 다음이 check라 setImmediate가 같은 바퀴에서 먼저 돈다. setTimeout은 다음 바퀴 timers로 밀린다.' },
  ];

  R.page({ title: '이벤트 루프의 단계와 큐', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
