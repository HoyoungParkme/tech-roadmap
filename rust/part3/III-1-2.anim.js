/* III-1-2 tokio runtime — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 이 PC(12코어, rustc 1.100, tokio 1.53)에서 페이지 코드를 돌린 결과다.
 *   workers.rs: 여덟 번 실행 → ThreadId(2)~(5) 안에서 1종 2번, 2종 3번, 4종 3번. 그림의 분배는 그중 한 번(10 · 56 · 22 · 12)
 *   spawn.rs: total = 14, 108ms / panic task → Err(JoinError::Panic(.., "boom", ..)), 프로세스는 계속
 *   reactor.rs: 클라이언트가 보낸 hello → "echo 5 bytes to 127.0.0.1:3130"
 *   enable_* 를 끈 런타임의 패닉 문구, Runtime::new() 의 worker 12개, #[tokio::test] 의 CurrentThread 도 실행해 확인했다 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, terminal, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 스레드 한 가닥: 왼쪽 이름표 + 가로줄. o.busy(0~1) 만큼 굵게 칠한다
  function lane(x, y, w, name, o) { o = o || {}; const op = o.op ?? 1, col = o.col || INK;
    tx(x, y + 5, name, { 'font-size': o.fs || 14, 'font-weight': 700, fill: col, opacity: op, class: o.mono ? 'mono' : null });
    const x0 = x + (o.lw || 90);
    el('line', { x1: x0, y1: y, x2: x0 + w * (o.g ?? 1), y2: y, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: op });
    if (o.busy) el('line', { x1: x0, y1: y, x2: x0 + w * o.busy, y2: y, stroke: o.bcol || ACC, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: op }); }

  // ---------- 1. #[tokio::main] 매크로 ----------
  function s1(t, c) { const { k, u } = c;
    // 왼쪽: 소스 → 전개
    if (k === 0) { card(250, 200, 360, 150, { rx: 12, stroke: INK, sw: 2, s: pop(u, 0.2) });
      ['#[tokio::main]', 'async fn main() {', '    println!("hello tokio");', '}'].forEach((s, i) => mono(90, 158 + i * 28, s, { 'font-size': 15, 'font-weight': i < 2 ? 700 : 400, fill: i === 0 ? ACC : INK, opacity: fade(u, 0.3 + i * 0.15) }));
      pill(250, 320, '런타임 준비 코드 0줄', GOOD, pop(u, 1.4), { fs: 14 });
      sub(690, 200, '아직 실행기는 없다', fade(u, 1.8), { 'font-size': 16, 'font-weight': 700, fill: MUT }); return; }
    const sp = k === 1 ? E(u, 0.3, 1.4) : 1;
    // 위 조각: fn main (동기)
    card(250, lerp(200, 90, sp), 360, 52, { rx: 10, stroke: INK, sw: 2 });
    mono(90, lerp(200, 90, sp) + 5, k >= 1 ? 'fn main() {        // 동기 함수' : '', { 'font-size': 15, 'font-weight': 700 });
    // 아래 조각: async 블록
    card(250, lerp(200, 180, sp), 360, 70, { rx: 10, stroke: ACC, sw: 2.2, fill: ACCBG, op: sp });
    mono(90, lerp(200, 180, sp) - 6, 'let body = async {', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: sp });
    mono(90, lerp(200, 180, sp) + 20, '    println!("hello tokio"); };', { 'font-size': 14, fill: INK, opacity: sp });
    if (k === 1) { sub(250, 268, 'cargo expand 로 본 모양', fade(u, 1.4), { 'font-size': 14.5, 'font-weight': 700 });
      sub(690, 200, '본문은 실행할 Future 하나로 묶인다', fade(u, 1.8), { 'font-size': 16, 'font-weight': 700, fill: INK }); return; }
    // 오른쪽: Runtime 틀
    const fr = k === 2 ? E(u, 0.1, 0.7) : 1;
    el('rect', { x: 470, y: 40, width: 460, height: 330, rx: 14, fill: SOFT, stroke: ACC, 'stroke-width': 2, opacity: fr });
    tx(486, 64, k === 4 ? 'Runtime · current_thread' : 'Runtime · multi_thread', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fr });
    const nW = k === 4 ? Math.round(lerp(8, 0, E(u, 0.3, 1.6))) : 8;
    for (let i = 0; i < 8; i++) { const s = k === 2 ? clamp((u - 0.5) * 6 - i * 0.7) : 1, gone = i >= nW;
      lane(490, 92 + i * 22, 180, 'worker ' + i, { fs: 13.5, lw: 74, g: s, op: (gone ? 0.15 : 1) * clamp(s * 3), busy: k === 3 ? 0 : 0 }); }
    if (k !== 4) tx(780, 100, '코어 수만큼', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: k === 2 ? fade(u, 1.8) : 1 });
    if (k !== 4) tx(780, 122, '(그림은 8코어 예)', { 'font-size': 13.5, fill: MUT, opacity: k === 2 ? fade(u, 1.9) : 1 });
    ['I/O 드라이버', 'timer 드라이버'].forEach((s, i) => pill(560 + i * 170, 290, s, INFO, k === 2 ? pop(u, 1.9 + i * 0.25) : 1, { fs: 13.5, fill: INFOBG }));
    if (k === 2) mono(486, 336, '.enable_all() = 둘 다 켠다', { 'font-size': 13.5, fill: INFO, opacity: fade(u, 2.3) });
    // main 스레드 + block_on
    if (k >= 3) { lane(490, 336, 300, 'main', { fs: 14, lw: 60, busy: k === 3 ? E(u, 0.3, 2.4) : 1, bcol: WARN });
      pill(700, 336, 'block_on(body)', WARN, k === 3 ? pop(u, 0.3) : 1, { mono: true, fs: 13.5, fill: PANEL });
      if (k === 3) { const a = t * 3; el('circle', { cx: 880 + 18 * Math.cos(a), cy: 336 + 18 * Math.sin(a), r: 5, fill: WARN });
        sub(250, 300, '이 Future 가 끝날 때까지 main 을 붙잡는다', fade(u, 1.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); } }
    if (k === 4) { card(620, 200, 230, 70, { rx: 10, stroke: ACC, sw: 2, s: pop(u, 1.4) });
      tx(620, 194, '따로 띄운 worker 없음', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      mono(620, 218, 'num_workers() = 1', { 'font-size': 14, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      sub(250, 300, '#[tokio::main(flavor = "current_thread")]', fade(u, 0.3), { 'font-size': 14, class: 'mono', fill: ACC, 'font-weight': 700 });
      sub(250, 330, 'main 스레드 하나로 전부 돈다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK }); } }

  // ---------- 2. worker thread 4개 ----------
  const WY = [150, 205, 260, 315], DIST = [10, 56, 22, 12];
  function s2(t, c) { const { k, u } = c;
    // 위: global injector 큐 (한 칸 = task 10개)
    const queued = k === 1 ? Math.round(E(u, 0.2, 1.8) * 100) : k === 2 ? Math.round(100 - E(u, 0.4, 2.2) * 100) : 0;
    if (k >= 1) { tx(40, 62, 'injector 큐', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 10; i++) el('rect', { x: 150 + i * 34, y: 46, width: 30, height: 26, rx: 4, fill: i < Math.ceil(queued / 10) ? ACC : PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: 0.9 });
      mono(510, 64, `${queued} / 100`, { 'font-size': 15, 'font-weight': 800, fill: ACC });
      tx(640, 64, 'block_on 쪽에서 spawn → 여기로', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 1.4) : 1 }); }
    // worker 4개
    WY.forEach((y, i) => { const s = k === 0 ? clamp((u - 0.3) * 4 - i * 0.6) : 1;
      const done = k === 2 ? Math.round(DIST[i] * E(u, 0.4, 2.2)) : k >= 3 ? DIST[i] : 0;
      lane(40, y, 330, k >= 2 ? `ThreadId(${i + 2})` : 'tokio-w', { mono: true, fs: 14, lw: 130, g: s, op: clamp(s * 3), busy: k === 2 ? (Math.sin(t * 5 + i) > 0 ? 0.15 : 0) : 0 });
      if (k >= 2 && k < 4) mono(520, y + 5, `${done}개`, { 'font-size': 15, 'font-weight': 700, fill: INK }); });
    if (k === 2) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) dot([[300 + j * 50, 72], [170 + 330 * ((j + i) % 4) / 4, WY[i]]], ((u * 1.3 + j * 0.3 + i * 0.17) % 1), ACC, 5);
    if (k === 0) { pill(700, 160, '.worker_threads(4)', ACC, pop(u, 0.4), { mono: true, fs: 14 });
      pill(700, 215, '.thread_name("tokio-w")', ACC, pop(u, 0.8), { mono: true, fs: 14 });
      pill(700, 270, 'stack 2 MiB', ACC, pop(u, 1.2), { mono: true, fs: 14 });
      sub(700, 340, '매크로가 숨기던 일을 직접 고른다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    lane(40, 375, 330, 'ThreadId(1)', { mono: true, fs: 14, lw: 130, busy: 1, bcol: WARN, op: k >= 2 ? 1 : 0.35 });
    if (k >= 2 && k < 4) tx(520, 380, 'main: block_on 만 돈다', { 'font-size': 14, fill: WARN, 'font-weight': 700 });
    if (k === 1) sub(700, 220, 'task 수는 worker 수와 무관하다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 3) { const left = Math.round(100 - E(u, 0.2, 2.0) * 100);
      card(760, 220, 260, 110, { rx: 12, stroke: GRID, sw: 1.5 });
      tx(650, 200, 'for h in handles { h.await }', { 'font-size': 13.5, class: 'mono', fill: MUT });
      mono(760, 248, `남은 task ${left}`, { 'font-size': 22, 'font-weight': 800, fill: left ? ACC : GOOD, 'text-anchor': 'middle' }); }
    if (k === 4) { DIST.forEach((v, i) => hbar(560, WY[i] - 9, 240, v, 60, { u: E(u, 0.2 + i * 0.2, 1.2 + i * 0.2), h: 18, text: v + '개' }));
      tx(560, 118, '한 번 실행했을 때 worker 별 task 수', { 'font-size': 14, 'font-weight': 700, fill: MUT });
      tx(560, 360, '8번 실행: 1종 2번 · 2종 3번 · 4종 3번', { 'font-size': 14.5, 'font-weight': 700, fill: INK, opacity: fade(u, 1.6) });
      tx(560, 386, '분배는 매번 다르다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.9) }); } }

  // ---------- 3. spawn → JoinHandle ----------
  const SX = (ms) => 220 + ms * 5;   // 0~120ms → 220~820
  function s3(t, c) { const { k, u } = c;
    if (k === 4) { // panic
      lane(40, 100, 600, 'task', { lw: 70, busy: E(u, 0.2, 0.9) * 0.3, bcol: BAD });
      if (u > 0.9) cross(40 + 70 + 600 * 0.3 + 14, 100, 12, pop(u, 0.9));
      terminal(40, 140, 620, 110, [['thread \'tokio-rt-worker\' panicked at', 'var(--term)'], ['src\\bin\\spawn.rs:11:35: boom', 'var(--term)']], E(u, 0.9, 1.6) * 2, { title: 'stderr' });
      card(350, 310, 620, 56, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.6) });
      mono(56, 316, 'h.await → Err(JoinError::Panic(.., "boom", ..))', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.7) });
      check(740, 210, 14, pop(u, 2.0)); tx(770, 216, '프로세스는 계속', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
      tx(700, 380, 'await 안 하면 아무도 모른다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); return; }
    if (k === 3) { // timer 가 깨운다
      clock(200, 170, 60, E(u, 0.3, 2.0) * 0.999, WARN, 'timer 드라이버');
      if (u > 2.0) pill(200, 268, '100ms → wake × 3', GOOD, pop(u, 2.0), { mono: true, fs: 13.5, fill: PANEL });
      tx(200, 320, 'sleep 100ms × 3 등록', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(400, 110, 'tokio::time::sleep', { 'font-size': 15, 'font-weight': 800, fill: GOOD, class: 'mono' });
      lane(400, 150, 320, 'worker', { lw: 80, busy: Math.sin(t * 6) > 0 ? 0.25 : 0.1, bcol: GOOD });
      tx(400, 184, '기다리는 동안 다른 task 를 돈다', { 'font-size': 14.5, fill: INK, opacity: fade(u, 0.8) });
      tx(400, 250, 'std::thread::sleep', { 'font-size': 15, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 1.2) });
      lane(400, 290, 320, 'worker', { lw: 80, busy: E(u, 1.3, 2.4), bcol: BAD, op: fade(u, 1.2) });
      tx(400, 324, 'worker 하나가 통째로 막힌다', { 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k 0~2: 시간축 위 task 셋
    el('line', { x1: SX(0), y1: 330, x2: SX(120), y2: 330, stroke: MUT, 'stroke-width': 1.5 });
    [0, 50, 100].forEach((v) => mono(SX(v), 350, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    lane(40, 80, 600, 'main', { lw: 180, busy: 0 });
    const now = k === 2 ? 50 + E(u, 0.1, 1.2) * 70 : k === 1 ? 10 + E(u, 0.4, 1.8) * 30 : E(u, 0.4, 1.8) * 25;
    [['h1', 1, 160], ['h2', 4, 220], ['h3', 9, 280]].forEach(([h, v, y], i) => { if (k === 0 && i > 0) return;
      const sc = (k === 0 || (k === 1 && i > 0)) ? pop(u, 0.2 + i * 0.25) : 1; if (sc <= 0) return;
      pill(110, y, `${h}: JoinHandle`, ACC, sc, { mono: true, fs: 13.5, fill: PANEL });
      el('rect', { x: SX(0), y: y - 11, width: Math.max(0, SX(Math.min(now, 100)) - SX(0)), height: 22, rx: 5, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 });
      mono(SX(0) + 8, y + 5, `compute(${i + 1})`, { 'font-size': 13.5, fill: ACC, opacity: now > 15 ? 1 : 0 });
      if (now >= 100) { check(SX(100) + 16, y, 8); mono(SX(100) + 32, y + 5, `= ${v}`, { 'font-size': 15, 'font-weight': 800, fill: GOOD }); } });
    if (k <= 1) el('line', { x1: SX(now), y1: 140, x2: SX(now), y2: 330, stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    if (k === 0) sub(560, 390, 'spawn 하는 순간 바로 돌기 시작한다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 1) sub(560, 390, '다 띄운 뒤에 await 해야 셋이 겹친다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 2) { if (u > 1.4) { mono(300, 86, 'total = 1 + 4 + 9 = 14', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
        mono(620, 86, '(실측 108ms)', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.7) }); }
      sub(560, 390, 'await 순서는 상관없다 · 이미 같이 돌고 있다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); } }

  // ---------- 4. Reactor — OS 이벤트로 깨운다 ----------
  function layers(op) { [[40, 'task (worker 가 poll)', 70], [190, 'reactor', 70], [300, 'OS · epoll / kqueue / IOCP', 70]].forEach(([y, s, h], i) => {
      el('rect', { x: 20, y, width: 780, height: h, rx: 10, fill: i === 0 ? PANEL : SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
      tx(34, y + 22, s, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: op }); }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 4) { // 드라이버 스위치
      [['enable_io()', 'reactor', 'TcpListener::bind', 'A Tokio 1.x context was found,', 'but IO is disabled.'], ['enable_time()', 'timer', 'tokio::time::sleep', 'A Tokio 1.x context was found,', 'but timers are disabled.']].forEach(([fn, d, api, m1, m2], i) => {
        const y = 80 + i * 150, s = pop(u, 0.2 + i * 0.5), off = u > 1.0 + i * 0.5;
        card(130, y, 170, 50, { rx: 25, text: fn, fs: 15, mono: true, stroke: off ? OFF : GOOD, color: off ? MUT : GOOD, s });
        tx(240, y + 5, off ? '끄면 →' : '켜면 → ' + d, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.5) });
        if (off) { mono(330, y - 4, api, { 'font-size': 14.5, 'font-weight': 700, fill: INK });
          mono(330, y + 22, 'panic: ' + m1, { 'font-size': 13.5, fill: BAD }); mono(330, y + 44, '       ' + m2, { 'font-size': 13.5, fill: BAD }); } });
      banner(480, 385, '.enable_all() = 둘 다 켠다', pop(u, 2.2)); return; }
    layers(1);
    // 소켓 :9000
    card(290, 75, 140, 40, { rx: 8, text: 'listener :9000', fs: 14, mono: true, stroke: ACC, color: ACC, s: k === 0 ? pop(u, 0.2) : 1 });
    const reg = k === 0 ? E(u, 0.6, 1.6) : 1; grow(290, 96, 290, lerp(96, 320, reg), reg, ACC, { plain: true, dash: '5 4' });
    if (k === 0) { sub(560, 160, 'bind 하면서 reactor 에 소켓을 등록한다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // accept task
    const ready = k >= 2 && u > 1.3 || k === 3;
    card(480, 75, 180, 40, { rx: 8, text: ready ? 'accept → Ready' : 'accept ⏸ Pending', fs: 14, stroke: ready ? GOOD : WARN, color: ready ? GOOD : WARN, fill: ready ? GOODBG : WARNBG });
    const spin = t * 4; el('circle', { cx: 480, cy: 225, r: 14, fill: 'none', stroke: INFO, 'stroke-width': 3, 'stroke-dasharray': '30 60', transform: `rotate(${spin * 57} 480 225)` });
    tx(505, 230, 'epoll_wait', { 'font-size': 14, class: 'mono', fill: INFO, 'font-weight': 700 });
    // 클라이언트
    card(880, 225, 110, 60, { rx: 10, text: 'client', fs: 15, mono: true });
    if (k === 1) { sub(560, 160, '할 일이 없으면 스레드는 다른 task 로', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { dot([[825, 225], [700, 335], [480, 335]], seg(u, 0.1, 0.7), ACC, 7);
      dot([[480, 335], [480, 225], [480, 96]], seg(u, 0.7, 1.3), ACC, 7);
      pill(610, 170, 'Waker.wake()', ACC, pop(u, 0.9), { mono: true, fs: 13.5, fill: PANEL });
      card(700, 75, 140, 40, { rx: 8, text: 'conn task', fs: 14, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 1.7) });
      grow(572, 75, 628, 75, E(u, 1.5, 1.9), ACC); tx(600, 60, 'spawn', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) }); return; }
    // k 3: hello 5바이트 왕복
    card(700, 75, 140, 40, { rx: 8, text: 'conn task', fs: 14, stroke: ACC, color: ACC, fill: ACCBG });
    fly(825, 210, 700, 100, seg(u, 0.2, 1.0), 'hello', { mono: true });
    fly(700, 100, 825, 245, seg(u, 1.2, 2.0), 'hello', { mono: true, fill: INK });
    if (u > 1.0) pill(610, 160, 'read → 5 bytes', ACC, pop(u, 1.0), { mono: true, fs: 13.5, fill: PANEL });
    mono(820, 390, 'echo 5 bytes to 127.0.0.1:3130', { 'font-size': 13.5, fill: INK, 'text-anchor': 'end', opacity: fade(u, 2.1) }); }

  // ---------- 5. 상황별 고르기 ----------
  const CARDS = [['서버', '#[tokio::main]', 'multi_thread', 'worker 12 (이 PC 코어 수)'], ['테스트', '#[tokio::test]', 'current_thread', '테스트마다 새 런타임'],
    ['라이브러리', 'pub async fn', '런타임 없음', '호출자 것을 쓴다'], ['CLI', 'flavor = "current_thread"', 'current_thread', 'worker 1 · main 스레드']];
  function s5(t, c) { const { k, u } = c;
    CARDS.forEach(([n, a, b, d], i) => { const cx = 245 + (i % 2) * 470, cy = 95 + Math.floor(i / 2) * 150, on = i <= k;
      const s = i === k ? pop(u, 0.2) : 1, op = on ? (k === 4 ? 0.45 : 1) : 0.25;
      card(cx, cy, 440, 124, { rx: 12, stroke: i === k ? ACC : GRID, sw: i === k ? 2.5 : 1.5, s, op });
      tx(cx - 204, cy - 32, n, { 'font-size': 16, 'font-weight': 800, opacity: op });
      mono(cx - 204, cy - 4, a, { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: op });
      mono(cx - 204, cy + 24, b, { 'font-size': 14, fill: INK, opacity: on ? op : 0 });
      tx(cx - 204, cy + 48, d, { 'font-size': 13.5, fill: MUT, opacity: on ? op : 0 }); });
    if (k === 2) { card(480, 372, 900, 54, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, s: pop(u, 1.2) });
      mono(48, 368, '안에서 block_on → panic: Cannot start a runtime', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) });
      mono(48, 388, '                    from within a runtime.', { 'font-size': 13.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.3) }); }
    if (k === 4) { const g = E(u, 0.3, 2.0);
      card(480, 372, 600, 54, { rx: 27, fill: INK, stroke: 'none' });
      mono(480, 378, g < 1 ? `shutdown · 남은 task 정리 중 ${Math.round(g * 100)}%` : 'shutdown 완료', { 'font-size': 15, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }); } }

  const quiz = [
    { q: '#[tokio::main]이 붙은 async fn main은 컴파일 뒤 어떤 모양이 되는가?',
      o: ['그대로 async fn main으로 실행된다', '동기 fn main 안에서 Runtime을 만들고 본문 async 블록을 block_on한다', 'main 대신 별도 스레드에서 본문을 돌린다'], a: 1,
      why: 'Rust의 main은 동기다. 매크로가 Builder로 Runtime을 만들고 rt.block_on(body)로 본문 Future를 끝까지 poll한다.' },
    { q: 'worker_threads(4) 런타임에서 task 100개를 spawn하고 ThreadId를 찍으면 무엇을 보게 되는가?',
      o: ['ThreadId 100개가 모두 다르다', '항상 네 worker가 25개씩 나눠 가진다', 'worker 네 개의 ThreadId 안에서만 나오고 분배는 실행마다 다르다'], a: 2,
      why: '여덟 번 돌린 결과 ThreadId(2)~(5)만 나왔고, 한 worker가 100개를 다 집은 적도, 네 개가 나눠 가진 적도 있었다.' },
    { q: 'spawn한 task가 panic하면 어떻게 되는가?',
      o: ['프로세스 전체가 바로 종료된다', '그 task만 끝나고 JoinHandle.await가 Err(JoinError)를 돌려준다', 'panic이 무시되고 task가 다시 시작된다'], a: 1,
      why: 'stderr에 panic 메시지가 찍히고 프로세스는 계속 돈다. 결과는 handle을 await해야만 Err로 보인다.' },
    { q: 'enable_io를 켜지 않은 런타임에서 TcpListener::bind를 부르면 어떻게 되는가?',
      o: ['"IO is disabled" 패닉이 난다', '조용히 동기 bind로 바뀐다', '컴파일 오류가 난다'], a: 0,
      why: '소켓은 reactor에 등록돼야 하는데 I/O 드라이버가 없다. 실행해 보니 "A Tokio 1.x context was found, but IO is disabled" 패닉이 났다.' },
    { q: '라이브러리 함수를 만들 때 tokio 런타임은 어떻게 다루는 것이 맞는가?',
      o: ['함수 안에서 Runtime을 만들어 block_on한다', 'pub async fn으로 내놓고 호출자의 런타임에서 await하게 한다', '#[tokio::main]을 라이브러리 함수에 붙인다'], a: 1,
      why: '안에서 block_on하면 이미 tokio 안에 있는 호출자는 "Cannot start a runtime from within a runtime" 패닉을 맞는다.' },
  ];

  const summary = [
    'Rust의 main은 동기라서 #[tokio::main]이 Runtime을 만들고 본문을 block_on으로 돌린다.',
    'multi_thread는 코어 수만큼 worker를 두고, task를 어느 worker가 집을지는 실행마다 다르다.',
    'spawn한 task는 곧바로 돌고, 결과와 panic은 JoinHandle을 await해야 보인다.',
    'reactor와 timer는 enable_io, enable_time을 켜야 돌고, 끄면 해당 API가 패닉한다.',
  ];
  const review = [
    { q: 'CPU를 오래 쓰는 계산을 tokio task 안에서 돌렸더니 같은 worker의 다른 요청 응답이 늦어졌다. 원인에 가장 가까운 것은?',
      o: ['spawn을 너무 늦게 해서', '계산이 끝날 때까지 그 worker 스레드가 다른 task를 poll하지 못해서', 'injector 큐가 100개로 제한돼서'], a: 1,
      why: 'worker는 task가 Pending으로 물러나야 다음 task로 간다. std::thread::sleep처럼 스레드를 붙잡는 일은 그 worker를 통째로 막는다.' },
    { q: '테스트에서 TcpListener를 쓰는데 "IO is disabled" 패닉이 났다. 직접 만든 Builder에서 먼저 볼 곳은?',
      o: ['worker_threads 값', 'thread_name 값', 'enable_io 또는 enable_all 호출 여부'], a: 2,
      why: '소켓은 I/O 드라이버가 있어야 reactor에 등록된다. Builder를 직접 쓰면 enable_all을 빠뜨리기 쉽다.' },
    { q: '백그라운드 정리 작업이 가끔 실패하는데 로그에 아무 흔적이 없다. 코드는 tokio::spawn(cleanup());뿐이다. 먼저 할 일은?',
      o: ['JoinHandle을 받아 await하고 Err를 기록한다', 'current_thread로 바꾼다', 'worker 수를 늘린다'], a: 0,
      why: 'spawn한 task의 panic이나 결과는 handle을 await해야 Err(JoinError)로 드러난다. 버리면 아무도 확인하지 않는다.' },
  ];

  R.page({ title: 'tokio 런타임 내부', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
