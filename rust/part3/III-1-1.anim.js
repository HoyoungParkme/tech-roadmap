/* III-1-1 async fn / await — Future lazy 평가 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 이 PC(rustc 1.100, tokio 1.53)에서 페이지 코드를 그대로 돌린 결과다.
 *   Step 2: fetch_user(1).await 는 poll 1번에 Ready (본문에 기다릴 곳이 없다)
 *   Step 3: A·B·C 는 각각 poll 2번(Pending → Ready), 다섯 번 실행 총 305~316ms, 시작 순서는 한 번 A·C·B
 *   Step 5: buggy-2 는 세 번 다 찍혔고, main 끝에 두면 여섯 번 다 잘렸다 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공용: Future 캡슐 (상태 기계) ----------
  const STC = { Created: MUT, Pending: WARN, Ready: GOOD, Dropped: OFF };
  // body: 본문 줄, run: 실행된 줄 수(소수면 그 줄을 실행 중), polls: poll 횟수
  function futCap(cx, cy, st, o) { o = o || {}; const body = o.body || [], w = o.w || 360, h = 58 + body.length * 26, col = STC[st] || INK;
    const g = G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14, fill: PANEL, stroke: col, 'stroke-width': 2.6, 'stroke-dasharray': st === 'Dropped' ? '6 5' : null }, g);
    tx(-w / 2 + 16, -h / 2 + 26, o.name || 'Future', { 'font-size': 15, 'font-weight': 800 }, g);
    card(w / 2 - 56, -h / 2 + 21, 92, 26, { rx: 13, text: st, fs: 13.5, fw: 800, color: col, stroke: col, sw: 1.6, p: g });
    body.forEach((s, i) => { const done = (o.run || 0) > i, now = (o.run || 0) > i && (o.run || 0) < i + 1;
      if (now) el('rect', { x: -w / 2 + 10, y: -h / 2 + 42 + i * 26, width: w - 20, height: 24, rx: 5, fill: ACCBG }, g);
      mono(-w / 2 + 18, -h / 2 + 59 + i * 26, s, { 'font-size': 13.5, fill: done ? INK : OFF }, g); });
    if (o.polls != null) mono(0, h / 2 + 22, `poll ${o.polls}회`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.polls ? ACC : MUT }, g);
    return { w, h }; }
  const BODY = ['println!("fetch_user 본문 시작!");', 'format!("user-{}", id)'];

  // ---------- 1. async fn 정의 — 본문은 즉시 실행되지 않는다 ----------
  function s1(t, c) { const { k, u } = c;
    // 위: 함수 시그니처
    mono(40, 52, 'async fn fetch_user(id: u64) -> String', { 'font-size': 17, 'font-weight': 700, fill: INK });
    if (k === 0) {
      const a = E(u, 0.5, 1.4);
      mono(40, 84, '// 컴파일러가 보는 실제 모양', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
      mono(40, 108, 'fn fetch_user(id: u64) -> impl Future<Output = String>', { 'font-size': 15, fill: ACC, opacity: fade(u, 0.6) });
      // String 알약을 Future 상자가 감싼다
      card(480, 250, 150, 50, { rx: 25, text: 'String', fs: 18, fw: 800, mono: true, s: pop(u, 0.2) });
      const bw = lerp(150, 380, a), bh = lerp(50, 150, a);
      if (a > 0.01) { el('rect', { x: 480 - bw / 2, y: 250 - bh / 2 - 14, width: bw, height: bh + 14, rx: 16, fill: 'none', stroke: ACC, 'stroke-width': 2.8, opacity: a });
        tx(480 - bw / 2 + 16, 250 - bh / 2 + 8, 'impl Future<Output = String>', { 'font-size': 15, 'font-weight': 700, fill: ACC, class: 'mono', opacity: fade(u, 1.3) }); }
      sub(480, 360, '호출하면 String 이 아니라 String 을 나중에 내놓을 Future 를 받는다', fade(u, 1.8), { 'font-size': 15 });
      return; }
    // k ≥ 1: main 쪽 호출과 Future 캡슐
    const calls = ['let fut = fetch_user(1);', 'println!("Future 만 받았다, 본문은 아직");', 'drop(fut);'];
    tx(40, 96, 'fn main()', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    calls.forEach((s, i) => { if (k < 1 + i) return;   // 0: k≥1, 1: k≥2, 2: k≥3
      if (k === 1 + i) el('rect', { x: 34, y: 108 + i * 34, width: 400, height: 28, rx: 6, fill: ACCBG });
      mono(46, 127 + i * 34, s, { 'font-size': 13.5, fill: INK }); });
    const fx = 700, fy = 160;
    if (k <= 2 || k === 4) { futCap(fx, fy, 'Created', { body: BODY, run: 0, polls: 0, w: 380, s: k === 1 ? pop(u, 0.4) : 1, op: k === 4 ? 0.35 : 1 });
      if (k === 1) { grow(436, 125, fx - 196, fy - 10, E(u, 0.2, 0.7), ACC); sub(fx, fy + 104, '본문 0줄 실행 · 시작 전 상태 그대로', fade(u, 1.4), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); } }
    if (k === 3) { // drop: 캡슐이 조각나 흩어진다
      const a = E(u, 0.4, 2.0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy], i) => { const x = fx + dx * (95 + 60 * a), y = fy + dy * (30 + 40 * a);
        el('rect', { x: x - 90, y: y - 26, width: 180, height: 52, rx: 10, fill: SOFT, stroke: OFF, 'stroke-width': 2, opacity: 1 - a * 0.85, transform: `rotate(${dx * dy * 18 * a} ${x} ${y})` }); });
      card(fx, fy, 150, 34, { rx: 17, text: 'poll 0회로 소멸', fs: 14.5, fw: 800, color: MUT, stroke: MUT, sw: 1.6, s: pop(u, 1.2) });
      sub(fx, fy + 92, '부수 효과 0 · 본문은 한 줄도 돌지 않았다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    // 아래: 터미널
    if (k >= 2) { const lines = [['$ cargo run', 'var(--panel)'], 'Future 만 받았다, 본문은 아직'];
      terminal(40, 290, 520, 112, lines, k === 2 ? 1 + E(u, 0.3, 1.3) : 2, { title: 'stdout' });
      if (k === 2) { mono(590, 340, 'fetch_user 본문 시작!', { 'font-size': 15, fill: OFF, 'text-decoration': 'line-through', opacity: fade(u, 1.6) });
        tx(590, 366, '이 줄은 어디에도 없다', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.9) }); } }
    if (k === 4) { card(760, 330, 300, 92, { rx: 12, stroke: GOOD, sw: 2, s: pop(u, 0.4) });
      tx(624, 314, 'cargo build → 경고 0개', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) });
      tx(624, 340, '변수에 담아 drop 하면 컴파일러도', { 'font-size': 13.5, fill: INK, opacity: fade(u, 0.9) });
      tx(624, 362, '아무 말 하지 않는다', { 'font-size': 13.5, fill: INK, opacity: fade(u, 0.9) });
      sub(700, 268, '출력 1줄 · 본문 실행 0줄', fade(u, 1.6), { 'font-size': 15, 'font-weight': 800, fill: ACC }); } }

  // ---------- 2. .await — Future 를 poll 한다 ----------
  function s2(t, c) { const { k, u } = c;
    if (k === 4) { // async 전염: 아래에서 위로 번진다
      const chain = [['#[tokio::main] async fn main', 'executor 가 첫 poll'], ['async fn 호출한 쪽', '.await 를 쓰려면 async'], ['async fn fetch_user', '.await 가 있는 곳']];
      tx(480, 44, '호출 사슬을 따라 위로 번지는 async', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      chain.forEach(([a, b], i) => { const y = 110 + i * 92, order = 2 - i, on = E(u, 0.3 + order * 0.55, 0.8 + order * 0.55);
        card(400, y, 380, 58, { rx: 10, stroke: on > 0.5 ? ACC : GRID, fill: on > 0.5 ? ACCBG : PANEL, sw: 2.2 });
        mono(230, y + 5, a, { 'font-size': 15, 'font-weight': 700, fill: on > 0.5 ? ACC : MUT });
        tx(620, y + 5, b, { 'font-size': 14.5, fill: INK, opacity: on }); });
      for (let i = 0; i < 2; i++) { const y0 = 110 + (i + 1) * 92 - 30, y1 = 110 + i * 92 + 30, a = E(u, 0.6 + (1 - i) * 0.55, 1.1 + (1 - i) * 0.55); grow(400, y0, 400, y1, a, ACC); }
      banner(480, 392, 'root 에는 누군가 executor 를 세워야 한다', pop(u, 2.1)); return; }
    if (k === 3) { // Step 1 과 Step 2 출력 비교
      tx(250, 60, 'Step 1 · .await 없음', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: MUT });
      tx(710, 60, 'Step 2 · .await 있음', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC });
      terminal(40, 80, 420, 150, [['$ cargo run', 'var(--panel)'], 'Future 만 받았다, 본문은 아직'], 2, { title: 'stdout' });
      terminal(500, 80, 420, 150, [['$ cargo run', 'var(--panel)'], 'fetch_user 본문 시작!', '결과: user-1'], 1 + E(u, 0.2, 1.4) * 2, { title: 'stdout' });
      [['본문 실행', '0줄', '2줄'], ['poll', '0회', '1회']].forEach(([n, a, b], i) => { const y = 280 + i * 44, op = fade(u, 1.4 + i * 0.3);
        tx(480, y, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: op });
        mono(250, y, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: MUT, opacity: op });
        mono(710, y, b, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: op }); });
      banner(480, 390, '차이는 .await 하나', pop(u, 2.2)); return; }
    // k 0~2: 런타임 틀 + main + Future
    const fr = k === 0 ? E(u, 0.3, 1.4) : 1;
    const per = 2 * (520 + 330);
    el('rect', { x: 30, y: 30, width: 520, height: 330, rx: 16, fill: 'none', stroke: ACC, 'stroke-width': 2.4, 'stroke-dasharray': fr < 1 ? `${fr * per} ${per}` : '7 6' });
    if (fr > 0.6) pill(150, 30, '#[tokio::main]', ACC, k === 0 ? pop(u, 1.2) : 1, { mono: true, fs: 14, fill: PANEL });
    tx(536, 54, 'tokio Runtime · block_on', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fr });
    mono(56, 92, 'async fn main() {', { 'font-size': 15, 'font-weight': 700 });
    const ln = 'let user = fetch_user(1).await;';
    if (k >= 1) el('rect', { x: 66, y: 104, width: 300, height: 28, rx: 6, fill: k === 1 ? ACCBG : SOFT });
    mono(76, 123, ln, { 'font-size': 14, opacity: k === 0 ? 0.35 : 1 });
    mono(56, 156, '}', { 'font-size': 15, 'font-weight': 700 });
    if (k === 0) { sub(290, 250, '매크로가 런타임을 만들고 main 의 본문을 첫 Future 로 돌린다', fade(u, 1.6), { 'font-size': 14.5 });
      card(760, 200, 300, 150, { rx: 12, stroke: GRID, sw: 1.5, s: pop(u, 1.4) });
      tx(630, 165, '만들어지는 것', { 'font-size': 14.5, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.6) });
      ['Runtime (스레드·드라이버)', 'block_on(main 의 Future)'].forEach((s, i) => tx(630, 200 + i * 32, '· ' + s, { 'font-size': 14.5, opacity: fade(u, 1.8 + i * 0.25) }));
      return; }
    // k 1: poll → 본문 실행 → Ready
    const run = k === 1 ? E(u, 0.9, 2.2) * 2 : 2, st = run >= 2 ? 'Ready' : 'Created', polls = k === 1 ? (u > 0.8 ? 1 : 0) : 1;
    futCap(290, 262, st, { body: BODY, run, polls, w: 380 });
    if (k === 1) { dot([[220, 132], [220, 190]], seg(u, 0.3, 0.8), ACC, 7); pill(330, 172, 'poll #1', ACC, pop(u, 0.4), { mono: true, fs: 13.5, fill: PANEL }); }
    // 오른쪽 터미널
    const out = [['$ cargo run', 'var(--panel)'], 'fetch_user 본문 시작!', '결과: user-1'];
    terminal(590, 60, 340, 140, out, k === 1 ? 1 + (run >= 0.6 ? 1 : 0) : 1 + 1 + E(u, 1.2, 1.9), { title: 'stdout' });
    if (k === 1) sub(760, 236, '기다릴 곳이 없어 첫 poll 에 끝까지', fade(u, 2.0), { 'font-size': 14.5, 'font-weight': 700, fill: INK });
    if (k === 2) { fly(540, 262, 470, 118, seg(u, 0.2, 1.1), '"user-1"', { mono: true, fill: GOOD });
      if (u > 1.1) pill(420, 118, 'user = "user-1"', GOOD, pop(u, 1.1), { mono: true, fs: 13.5, fill: PANEL });
      sub(760, 236, '.await 표현식이 값 자체가 된다', fade(u, 1.3), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); } }

  // ---------- 3. Pending — 기다리는 동안 스레드를 내놓는다 ----------
  const AX = { x0: 150, x1: 870, ms: 320 }, X = (ms) => AX.x0 + (AX.x1 - AX.x0) * ms / AX.ms;
  const LANES = [['A', 300, 130], ['B', 100, 190], ['C', 200, 250]];
  function timeAxis(op) { el('line', { x1: AX.x0, y1: 290, x2: AX.x1, y2: 290, stroke: MUT, 'stroke-width': 1.6, opacity: op });
    [0, 100, 200, 300].forEach((v) => { el('line', { x1: X(v), y1: 290, x2: X(v), y2: 296, stroke: MUT, opacity: op }); mono(X(v), 312, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); }); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { // slow_io 한 개: 시작 → await(⏸) → 끝
      tx(480, 54, 'async fn slow_io(name, ms)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono' });
      const segs = [['시작 출력', 150, 300, INK], ['sleep(ms).await', 330, 630, WARN], ['끝 출력', 660, 810, INK]];
      segs.forEach(([s, a, b, col], i) => { const sc = k === 0 ? pop(u, 0.3 + i * 0.35) : 1;
        card((a + b) / 2, 150, b - a, 54, { rx: 10, text: s, fs: 15, mono: i === 1, stroke: col, color: col, fill: i === 1 ? WARNBG : PANEL, sw: 2.2, s: sc }); });
      if (k === 0) { tx(480, 232, '⏸ 여기가 멈출 수 있는 지점', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
        sub(480, 262, '.await 하나가 중단점 하나다', fade(u, 2.0), { 'font-size': 14.5 }); return; }
      // k 1: poll 이 와서 Pending 을 받는다, 스레드는 다른 task 로
      dot([[120, 150], [330, 150]], seg(u, 0.2, 0.9), ACC, 8);
      if (u > 0.9) { pill(480, 92, 'Poll::Pending', WARN, pop(u, 0.9), { mono: true, fs: 14.5, fill: PANEL }); }
      card(780, 300, 190, 64, { rx: 10, stroke: GRID, sw: 1.8, s: pop(u, 1.2) });
      tx(780, 288, '다른 task', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
      const mv = E(u, 1.4, 2.4);
      card(lerp(200, 780, mv), lerp(300, 316, mv), 110, 30, { rx: 15, text: '스레드', fs: 14.5, fw: 800, stroke: ACC, color: ACC, fill: ACCBG });
      grow(270, 300, 650, 300, E(u, 1.4, 2.4), GRID, { dash: '5 5' });
      sub(480, 380, 'Pending 은 실패가 아니라 "나중에 다시 불러 줘"', fade(u, 1.9), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 4) { // 출력 순서 + 총 시간
      terminal(40, 40, 400, 230, [['$ cargo run --bin concurrent', 'var(--panel)'], '[A] 시작 (sleep 300ms)', '[B] 시작 (sleep 100ms)', '[C] 시작 (sleep 200ms)', ['[B] 끝', 'var(--panel)'], ['[C] 끝', 'var(--panel)'], ['[A] 끝', 'var(--panel)']], 1 + E(u, 0.2, 1.6) * 6, { title: 'stdout', lh: 26 });
      tx(480, 70, '총 걸린 시간', { 'font-size': 16, 'font-weight': 800 });
      const g = E(u, 0.6, 1.8);
      [['합으로 기다리면', 600, MUT], ['실측 (5회)', 305, ACC]].forEach(([n, v, col], i) => { const y = 110 + i * 64;
        tx(480, y, n, { 'font-size': 14.5, 'font-weight': 700, fill: col });
        el('rect', { x: 480, y: y + 10, width: Math.max(2, 400 * v / 600 * g), height: 22, rx: 4, fill: col, opacity: i ? 1 : 0.5 });
        mono(480 + 400 * v / 600 * g + 8, y + 27, i ? '305~316ms' : '600ms', { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 1.6) }); });
      tx(480, 262, '시작 세 줄의 순서는 실행마다 다르다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) });
      mono(480, 288, '(5번 중 1번은 A · C · B)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 2.2) });
      banner(480, 370, '끝나는 순서 B → C → A · 가장 긴 300ms 만큼만 기다린다', pop(u, 2.3)); return; }
    // k 2·3: 레인 3개 + 시간축
    timeAxis(1);
    const now = k === 2 ? 0 : E(u, 0.2, 2.5) * AX.ms;
    LANES.forEach(([n, ms, y], i) => { const s = k === 2 ? pop(u, 0.3 + i * 0.3) : 1;
      card(90, y, 70, 40, { rx: 20, text: n, fs: 16, fw: 800, s, stroke: ACC, color: ACC, fill: ACCBG });
      if (k === 2) { if (u > 0.6 + i * 0.3) pill(X(0) + 60, y, 'poll #1 → Pending', WARN, pop(u, 0.6 + i * 0.3), { mono: true, fs: 13.5, fill: PANEL }); return; }
      const end = Math.min(now, ms);
      el('rect', { x: X(0), y: y - 12, width: Math.max(0, X(end) - X(0)), height: 24, rx: 5, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      if (now >= ms) { check(X(ms) + 16, y, 9); mono(X(ms) + 32, y + 5, '#2 Ready', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD }); } });
    if (k === 3) { el('line', { x1: X(now), y1: 100, x2: X(now), y2: 290, stroke: ACC, 'stroke-width': 2 }); mono(X(now), 92, Math.round(now) + 'ms', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' }); }
    const polls = k === 2 ? Math.min(3, Math.floor(seg(u, 0.6, 1.3) * 3 + (u > 1.2 ? 1 : 0))) : 3 + LANES.filter(([, ms]) => now >= ms).length;
    card(720, 360, 300, 50, { rx: 10, stroke: GRID, sw: 1.5 });
    tx(590, 366, '지금까지 poll', { 'font-size': 14.5, 'font-weight': 700, fill: MUT }); mono(850, 367, polls + '회', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    tx(40, 366, k === 2 ? 'spawn 셋 → 각자 첫 poll 에서 Pending' : 'join!(a, b, c) — 깨어난 task 부터 다시 poll', { 'font-size': 15, 'font-weight': 700, opacity: k === 2 ? fade(u, 1.6) : 1 }); }

  // ---------- 4. Ready — wake → 재poll → 값 ----------
  const RING = [['poll', 300, 150], ['Pending', 420, 250], ['reactor\n이벤트', 300, 350], ['wake', 180, 250]];
  function ring(lit, prog, op) { // lit: 밝힐 칸, prog: 한 바퀴 진행(0~1)
    el('circle', { cx: 300, cy: 250, r: 100, fill: 'none', stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5', opacity: op });
    if (prog > 0 && prog < 1) { const a = -Math.PI / 2 + prog * 2 * Math.PI; el('circle', { cx: 300 + 100 * Math.cos(a), cy: 250 + 100 * Math.sin(a), r: 9, fill: ACC }); }
    RING.forEach(([s, x, y], i) => card(x, y, 104, 52, { rx: 26, text: s, fs: 14, fw: 800, stroke: i === lit ? ACC : GRID, color: i === lit ? ACC : INK, fill: i === lit ? ACCBG : PANEL, sw: 2, op })); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 2) {
      mono(40, 50, 'reqwest::get(url).await?.text().await?', { 'font-size': 15, 'font-weight': 700 });
      [[k === 0 ? 1 : 0, 'get'], [k === 2 ? 1 : 0, 'text']].forEach(([on, s], i) => { if (on) el('rect', { x: i ? 243 : 111, y: 34, width: i ? 113 : 130, height: 24, rx: 5, fill: 'none', stroke: ACC, 'stroke-width': 2 }); });
      // 서버 쪽
      card(800, 150, 160, 60, { rx: 10, text: '원격 서버', fs: 15, stroke: INK });
      el('line', { x1: 480, y1: 150, x2: 720, y2: 150, stroke: GRID, 'stroke-width': 2.5 });
      const lit = k === 0 ? (u < 1.2 ? 0 : 1) : k === 1 ? (u < 0.8 ? 2 : u < 1.5 ? 3 : 0) : (u < 0.9 ? 1 : u < 1.5 ? 2 : u < 2 ? 3 : 0);
      ring(lit, k === 0 ? 0 : k === 1 ? E(u, 0.4, 2.2) * 0.999 : E(u, 0.3, 2.4) * 0.999, 1);
      if (k === 0) { fly(480, 150, 720, 150, seg(u, 0.3, 1.2), 'GET', { mono: true });
        pill(300, 92, '⏸ 응답 없음 → Pending', WARN, pop(u, 1.3), { fs: 13.5, fill: PANEL }); sub(700, 300, '스레드는 다른 task 로 간다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
      if (k === 1) { fly(720, 180, 400, 350, seg(u, 0.1, 0.8), '응답 헤더', { fill: INK });
        pill(640, 260, 'Ready(Response)', GOOD, pop(u, 2.0), { mono: true, fs: 14, fill: PANEL });
        sub(640, 310, '깨어난 task 를 executor 가 다시 poll', fade(u, 1.5), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); }
      if (k === 2) { for (let i = 0; i < 4; i++) dot([[720, 160], [560, 330], [400, 350]], seg(u, 0.9 + i * 0.12, 1.5 + i * 0.12), INK, 5);
        pill(640, 260, 'Ready(String)', GOOD, pop(u, 2.2), { mono: true, fs: 14, fill: PANEL });
        sub(640, 310, '같은 사이클을 한 바퀴 더', fade(u, 0.5), { 'font-size': 14.5, 'font-weight': 700, fill: INK }); }
      mono(560, 392, ['사이클 1 · get', '사이클 1 · get', '사이클 2 · text'][k], { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      return; }
    if (k === 3) { // 문자열 자르기 — await 없는 동기 코드
      tx(480, 60, 'Ready 뒤의 파싱에는 .await 이 없다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      const parts = [['…<head>', 170, MUT], ['<title>', 320, WARN], ['제목', 480, ACC], ['</title>', 640, WARN], ['…</html>', 790, MUT]], sp = E(u, 0.4, 1.4);
      parts.forEach(([s, x, col], i) => { const dx = (i - 2) * 24 * sp, dy = i === 2 ? -60 * E(u, 1.4, 2.2) : 0;
        card(x + dx, 170 + dy, 150, 48, { rx: 6, text: s, fs: 15, mono: true, stroke: col, color: col, fill: i === 2 ? ACCBG : PANEL, sw: 2 }); });
      tx(480, 250, 'split("<title>").nth(1) → split("</title>").next()', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', fill: INK, opacity: fade(u, 0.8) });
      sub(480, 320, '값을 손에 쥔 뒤에는 평범한 함수처럼 한 줄씩 이어진다', fade(u, 2.0), { 'font-size': 15 }); return; }
    // k 4: 중첩된 Future — root executor 가 바깥부터 poll
    tx(480, 44, 'Future 안의 Future — 바깥을 poll 하면 안쪽까지 진행된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 });
    const box = [[480, 230, 820, 300, '#[tokio::main] async fn main', ACC], [480, 250, 640, 200, 'fetch_title(url)', INK], [380, 270, 220, 90, 'get().await', MUT], [620, 270, 220, 90, 'text().await', MUT]];
    box.forEach(([x, y, w, h, s, col], i) => { const a = E(u, 0.2 + i * 0.35, 0.8 + i * 0.35);
      el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 14, fill: i === 0 ? 'none' : PANEL, stroke: col, 'stroke-width': 2.2, opacity: a });
      tx(x - w / 2 + 14, y - h / 2 + 24, s, { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: col, opacity: a }); });
    pill(480, 360, 'title = …', GOOD, pop(u, 2.1), { mono: true, fs: 14, fill: PANEL }); }

  // ---------- 5. 정리 — 흔한 버그와 해법 ----------
  const TX = { x0: 200, x1: 560, ms: 160 }, TXm = (ms) => TX.x0 + (TX.x1 - TX.x0) * ms / TX.ms;
  const ROWS = [['buggy-1', null, BAD], ['buggy-2', [0, 50], WARN], ['ok-3', [0, 50], GOOD], ['ok-4', [50, 100], GOOD], ['ok-5', [100, 150], GOOD], ['ok-6', [100, 150], GOOD]];
  function s5(t, c) { const { k, u } = c;
    // 시간축
    el('line', { x1: TX.x0, y1: 368, x2: TX.x1, y2: 368, stroke: MUT, 'stroke-width': 1.5 });
    [0, 50, 100, 150].forEach((v) => mono(TXm(v), 390, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    ROWS.forEach(([n, span, col], i) => { const y = 60 + i * 50, show = i <= k || k === 5 || (k === 4 && i === 5), focus = i === k || (k === 4 && i === 5);
      if (focus && k < 5) el('rect', { x: 20, y: y - 20, width: 560, height: 40, rx: 8, fill: SOFT });
      mono(40, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: show ? col : OFF });
      if (!show) return;
      const g = focus && k < 5 ? E(u, 0.3, 1.5) : 1;
      if (!span) { if (focus && k < 5) { card(TXm(0) + 40, y, 80, 30, { rx: 8, text: 'Future', fs: 13.5, stroke: OFF, color: MUT, op: 1 - E(u, 1.0, 1.8) }); }
        mono(TXm(0), y + 5, '출력 없음', { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: focus && k < 5 ? fade(u, 1.6) : 1 }); return; }
      const [a, b] = span;
      el('rect', { x: TXm(a), y: y - 12, width: (TXm(b) - TXm(a)) * g, height: 24, rx: 5, fill: col === WARN ? WARNBG : GOODBG, stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': i === 1 ? '5 4' : null }); });
    // 오른쪽 설명 칸
    const RX = 610;
    if (k === 0) { card(770, 130, 330, 120, { rx: 10, stroke: WARN, sw: 2, fill: WARNBG, s: pop(u, 1.2) });
      mono(RX + 14, 98, 'warning: unused implementer', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
      mono(RX + 14, 120, 'of `Future` that must be used', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.3) });
      mono(RX + 14, 150, 'note: futures do nothing unless', { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.6) });
      mono(RX + 14, 172, 'you `.await` or poll them', { 'font-size': 13.5, fill: INK, opacity: fade(u, 1.6) });
      tx(RX, 240, '컴파일은 통과한다 · 경고만 뜬다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 1) { tx(RX, 70, 'JoinHandle 을 버린 spawn', { 'font-size': 16, 'font-weight': 800 });
      [['이 코드', 'main 이 150ms 더 돈다', '찍힘 3 / 3회', GOOD], ['main 끝에 두면', '바로 main 이 끝난다', '잘림 6 / 6회', BAD]].forEach(([a, b, r, col], i) => { const y = 130 + i * 110, s = pop(u, 0.6 + i * 0.6);
        card(770, y, 320, 90, { rx: 10, stroke: col, sw: 2, s });
        tx(RX + 16, y - 16, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.7 + i * 0.6) });
        tx(RX + 16, y + 10, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.7 + i * 0.6) });
        mono(RX + 16, y + 34, r, { 'font-size': 14.5, 'font-weight': 800, fill: col, opacity: fade(u, 0.9 + i * 0.6) }); });
      tx(RX, 330, '완료는 보장되지 않는다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.1) }); }
    if (k === 2) { mono(RX, 140, 'work("ok-3").await;', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.2) });
      tx(RX, 180, '그 자리에서 끝까지 진행', { 'font-size': 15, opacity: fade(u, 1.0) });
      tx(RX, 208, '50ms 동안 다음 줄로 안 간다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 3) { mono(RX, 130, 'let h = tokio::spawn(..);', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      mono(RX, 160, 'let _ = h.await;', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
      // 손잡이 줄
      const hy = 60 + 3 * 50; el('path', { d: `M${TXm(100)},${hy} C${TXm(100) + 40},${hy - 40} ${RX - 30},150 ${RX - 6},150`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.2) });
      tx(RX, 210, 'handle 을 쥐고 있다가 회수', { 'font-size': 15, opacity: fade(u, 1.6) }); }
    if (k === 4) { mono(RX, 140, 'tokio::join!(', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      mono(RX, 166, '  work("ok-5"), work("ok-6"));', { 'font-size': 15, 'font-weight': 700, fill: GOOD });
      tx(RX, 210, '새 task 없이 한 task 안에서 동시에', { 'font-size': 15, opacity: fade(u, 1.2) });
      tx(RX, 238, '두 50ms 가 겹쳐 50ms 에 끝', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) }); }
    if (k === 5) { ROWS.forEach(([n, span], i) => { const y = 60 + i * 50, s = pop(u, 0.3 + i * 0.2); if (i === 0) cross(TX.x1 + 30, y, 9, s); else if (i === 1) { card(TX.x1 + 30, y, 26, 26, { rx: 13, text: '?', fs: 15, fw: 800, color: WARN, stroke: WARN, s }); } else check(TX.x1 + 30, y, 9, s); });
      terminal(RX, 40, 320, 300, [['$ cargo run', 'var(--panel)'], '[ok-3] 시작', '[buggy-2] 시작', '[buggy-2] 끝', '[ok-3] 끝', '[ok-4] 시작', '[ok-4] 끝', '[ok-5] 시작', '[ok-6] 시작', '[ok-6] 끝', '[ok-5] 끝'], 1 + E(u, 0.4, 2.2) * 10, { title: 'stdout', lh: 23, fs: 13.5 });
      tx(RX, 372, 'buggy-1 은 한 번도 없다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.3) }); } }

  const quiz = [
    { q: 'let fut = fetch_user(1); 만 실행하고 drop 했을 때 일어나는 일은 무엇인가?',
      o: ['본문이 백그라운드 스레드에서 끝까지 돈다', '본문은 한 줄도 돌지 않고 Future만 사라진다', '컴파일 오류가 난다'], a: 1,
      why: 'async fn 호출은 Future를 만들 뿐이다. poll 0회로 버려지면 println! 한 줄 찍히지 않고, 이 코드는 경고도 없이 컴파일된다.' },
    { q: 'fetch_user(1).await가 poll 한 번 만에 Ready가 된 까닭은 무엇인가?',
      o: ['본문에 기다릴 .await 지점이 하나도 없어서', 'tokio가 결과를 미리 캐시해 둬서', '.await는 항상 poll을 한 번만 해서'], a: 0,
      why: 'fetch_user 본문은 println!과 format!뿐이라 첫 poll에서 끝까지 돈다. 기다릴 곳이 있으면 Pending이 나오고 poll이 더 필요하다.' },
    { q: '300·100·200ms를 자는 task 셋을 spawn한 뒤 join!하면 총 시간은 어느 쪽에 가까운가?',
      o: ['600ms (합)', '100ms (가장 짧은 것)', '300ms (가장 긴 것)'], a: 2,
      why: 'Pending인 동안 스레드는 다른 task를 돌린다. 다섯 번 실행해 305~316ms가 나왔고, 끝나는 순서는 B, C, A였다.' },
    { q: 'reqwest::get(url).await에서 응답이 오기 전 task는 어떻게 되는가?',
      o: ['스레드를 붙잡고 응답을 기다린다', 'Pending을 돌려주고 물러났다가, reactor 이벤트로 깨어나 다시 poll된다', 'Err를 돌려주고 끝난다'], a: 1,
      why: '응답이 없으면 Pending으로 물러난다. 소켓이 준비되면 waker가 task를 깨우고 executor가 같은 Future를 다시 poll해 Ready가 된다.' },
    { q: 'work("buggy-1"); 처럼 await 없이 호출한 줄을 컴파일러는 어떻게 다루는가?',
      o: ['경고만 내고 컴파일한다', '컴파일 오류로 막는다', '자동으로 .await를 붙여 준다'], a: 0,
      why: '"unused implementer of Future that must be used" 경고만 뜬다. 실행해도 [buggy-1]은 한 번도 찍히지 않는다.' },
  ];

  const summary = [
    'async fn을 호출하면 본문 대신 Future가 생기고, poll 전에는 한 줄도 돌지 않는다.',
    '.await는 그 Future를 poll한다. 기다릴 곳이 없는 fetch_user는 poll 한 번에 끝났다.',
    'Pending인 동안 스레드는 다른 task를 돌려서, 세 sleep이 합 600ms가 아닌 약 305ms에 끝났다.',
    'await를 빠뜨리면 경고만 뜨고, JoinHandle을 버린 spawn은 main이 먼저 끝나면 잘린다.',
  ];
  const review = [
    { q: '로그 함수가 한 번도 찍히지 않는다. 코드에 log_event(e); 한 줄이 있고 빌드에 경고가 하나 떠 있었다. 먼저 의심할 것은?',
      o: ['log_event가 async fn인데 .await를 빠뜨렸다', '로그 파일 권한이 없다', 'tokio 스레드 수가 모자라다'], a: 0,
      why: 'async fn 호출만으로는 Future가 만들어질 뿐 본문이 돌지 않는다. 그때 뜨는 경고가 unused implementer of Future다.' },
    { q: '외부 API 세 개를 순서대로 .await하니 응답 시간이 각 지연의 합이 됐다. 가장 알맞은 고침은?',
      o: ['스레드 수를 세 배로 늘린다', '세 호출을 join!으로 묶어 동시에 진행시킨다', '각 호출을 drop한다'], a: 1,
      why: '순서대로 await하면 앞 호출이 끝나야 다음이 시작된다. 함께 진행시키면 Step 3처럼 가장 긴 것만큼만 기다린다.' },
    { q: 'main 마지막 줄에 tokio::spawn(flush())만 두었더니 flush 결과가 가끔이 아니라 아예 남지 않는다. 이유로 맞는 것은?',
      o: ['spawn은 다음 poll까지 시작하지 않는다', 'flush가 Pending을 돌려서 실패했다', 'main이 바로 끝나면서 런타임과 함께 task가 잘렸다'], a: 2,
      why: 'spawn은 완료를 보장하지 않는다. main 끝에 둔 실험에서는 여섯 번 모두 잘렸으니 JoinHandle을 쥐고 await해야 한다.' },
  ];

  R.page({ title: 'Future 상태 기계', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
