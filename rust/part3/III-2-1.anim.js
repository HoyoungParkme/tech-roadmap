/* III-2-1 Future · Poll · Waker — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 이 PC(rustc 1.100, tokio 1.53)에서 페이지의 Delay · Receive · AlwaysReady 를 그대로 돌리고 poll 마다 센 결과다.
 *   Delay(100ms): poll #1 Pending → poll #2 Ready, "delay 끝 (elapsed 100.2284ms)"
 *   Receive: poll #1 Pending → send 가 wake() → poll #2 Ready, "received = 42"
 *   AlwaysReady(Some(5)) → 5, std::future::ready(42) → 42
 *   Waker 를 안 남긴 Future(10ms 뒤 준비)를 200ms timeout 으로 감싸면 214.8ms 에야 끝났다 (timeout 타이머가 대신 깨움) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock, cells, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 필드 칸: name 위, 값 아래
  function field(cx, cy, w, name, val, o) { o = o || {}; const col = o.col || INK;
    card(cx, cy, w, 58, { rx: 8, stroke: o.hot ? ACC : GRID, sw: o.hot ? 2.6 : 1.6, fill: o.fill || PANEL, s: o.s, op: o.op });
    tx(cx - w / 2 + 12, cy - 10, name, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: o.op ?? 1 });
    mono(cx - w / 2 + 12, cy + 18, val, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: o.op ?? 1 }); }

  // ---------- 1. Future trait — poll 하나 ----------
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { const mods = [['std::future', ['Future']], ['std::pin', ['Pin']], ['std::task', ['Context', 'Poll']]];
      let n = 0; mods.forEach(([m, ts], i) => { const y = 90 + i * 100; mono(60, y + 5, m, { 'font-size': 16, 'font-weight': 700, fill: MUT });
        ts.forEach((s) => { const j = n++, a = seg(u, 0.3 + j * 0.35, 1.0 + j * 0.35), x = 560 + j * 100;
          card(lerp(270, x, E(a, 0, 1)), lerp(y, 200, E(a, 0, 1)), 92, 46, { rx: 8, text: s, fs: 15, fw: 800, mono: true, stroke: ACC, color: ACC, fill: ACCBG, op: a > 0 ? 1 : 0 }); }); });
      sub(710, 280, 'poll 시그니처 하나에 넷이 다 쓰인다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { tx(60, 60, 'trait Future', { 'font-size': 18, 'font-weight': 800 });
      card(200, 110, 280, 44, { rx: 8, text: 'type Output;', fs: 15, mono: true, s: pop(u, 0.2) });
      const slots = [['self: Pin<&mut Self>', 200, ACC], ['cx: &mut Context', 480, INFO], ['Poll<Self::Output>', 780, GOOD]];
      tx(60, 196, 'fn poll(', { 'font-size': 16, 'font-weight': 800, class: 'mono', opacity: fade(u, 0.5) });
      slots.forEach(([s, x, col], i) => { const sc = pop(u, 0.7 + i * 0.4); card(x, 250, 250, 54, { rx: 10, text: s, fs: 14.5, mono: true, stroke: col, color: col, sw: 2.2, s: sc }); });
      grow(330, 250, 350, 250, E(u, 1.2, 1.4), MUT, { plain: true }); grow(610, 250, 650, 250, E(u, 1.6, 1.9), MUT);
      tx(600, 236, '->', { 'font-size': 15, class: 'mono', fill: MUT, opacity: fade(u, 1.6) });
      sub(480, 340, '멤버는 연관 타입 Output 과 메서드 poll 둘뿐', fade(u, 2.1), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 2) { card(200, 210, 170, 60, { rx: 10, text: 'Poll<T>', fs: 18, fw: 800, mono: true, s: pop(u, 0.2) });
      const a = E(u, 0.6, 1.4);
      el('path', { d: `M285,210 C360,210 380,120 ${lerp(285, 470, a)},120`, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: a });
      el('path', { d: `M285,210 C360,210 380,300 ${lerp(285, 470, a)},300`, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: a });
      card(570, 120, 190, 58, { rx: 10, text: 'Ready(T)', fs: 18, fw: 800, mono: true, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.3) });
      card(570, 300, 190, 58, { rx: 10, text: 'Pending', fs: 18, fw: 800, mono: true, stroke: WARN, color: WARN, fill: WARNBG, s: pop(u, 1.5) });
      tx(690, 126, '값이 나왔다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(690, 306, '아직 · 나중에 다시', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(480, 395, '중간 상태는 없다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // k 3: Pin — 자기참조 구조는 옮기면 안 된다
    const mv = E(u, 0.4, 1.4);
    tx(60, 54, 'async fn 이 만든 상태 기계 (자기 필드를 가리킨다)', { 'font-size': 15, 'font-weight': 700 });
    [['주소 A', 220, 1 - mv * 0.6], ['주소 B (옮긴 뒤)', 680, mv]].forEach(([name, x, op], i) => {
      zone(x - 170, 90, 340, 170, name, { fill: SOFT, op });
      card(x - 70, 180, 120, 52, { rx: 6, text: 'buf', fs: 15, mono: true, op });
      card(x + 80, 180, 120, 52, { rx: 6, text: 'ptr', fs: 15, mono: true, op, stroke: i ? BAD : INK }); });
    el('path', { d: 'M300,206 C300,240 150,240 150,206', fill: 'none', stroke: INK, 'stroke-width': 2, 'marker-end': 'url(#ra-ah)', opacity: 1 - mv * 0.6 });
    if (mv > 0.5) el('path', { d: 'M760,206 C760,300 160,300 150,212', fill: 'none', stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', 'marker-end': 'url(#ra-ahr)', opacity: fade(u, 1.2) });
    if (u > 1.5) tx(480, 330, '옮겨도 ptr 은 옛 주소를 가리킨다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
    if (u > 1.9) { lock(400, 384, true, ACC, pop(u, 1.9) * 1.2); tx(430, 390, 'Pin<&mut Self> = 이동 금지를 타입으로 약속', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); } }

  // ---------- 2. 첫 poll — Waker 저장 + Pending ----------
  const TX = (ms) => 140 + ms * 6;   // 0~120ms → 140~860
  function s2(t, c) { const { k, u } = c;
    tx(40, 50, 'struct Delay', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    const wk = k >= 3 || (k === 2 && u > 1.2), sp = k >= 4 || (k === 3 && u > 0.8);
    field(250, 100, 200, 'when', 'now + 100ms', { s: k === 0 ? pop(u, 0.3) : 1 });
    field(470, 100, 200, 'waker', wk ? 'Some(waker)' : 'None', { s: k === 0 ? pop(u, 0.6) : 1, hot: k === 2, col: wk ? ACC : MUT });
    field(690, 100, 200, 'spawned', sp ? 'true' : 'false', { s: k === 0 ? pop(u, 0.9) : 1, hot: k === 3, col: sp ? ACC : MUT });
    if (k === 0) { sub(480, 220, '다음 poll 에 필요한 것을 필드로 들고 있는다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK });
      sub(480, 250, 'waker 는 Arc<Mutex<Option<Waker>>> · 타이머 스레드와 나눠 쓴다', fade(u, 2.0), { 'font-size': 14 }); return; }
    // 시간축
    el('line', { x1: TX(0), y1: 250, x2: TX(120), y2: 250, stroke: MUT, 'stroke-width': 1.5 });
    [0, 50, 100].forEach((v) => mono(TX(v), 272, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    el('line', { x1: TX(100), y1: 190, x2: TX(100), y2: 250, stroke: WARN, 'stroke-width': 2 }); tx(TX(100) + 6, 200, 'when', { 'font-size': 14, 'font-weight': 700, fill: WARN });
    el('circle', { cx: TX(0), cy: 250, r: 7, fill: ACC }); tx(TX(0) - 10, 236, 'now', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'end' });
    if (k === 1) { pill(480, 320, 'now >= when ?', INK, pop(u, 0.4), { mono: true, fs: 15 });
      if (u > 1.2) pill(650, 320, '아니오', BAD, pop(u, 1.2), { fs: 15 });
      sub(480, 380, '지났으면 그 자리에서 Ready(()) 로 끝났을 것이다', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 2) { card(110, 330, 160, 50, { rx: 8, text: 'cx: Context', fs: 14.5, mono: true, stroke: INFO, color: INFO });
      fly(110, 310, 470, 128, seg(u, 0.3, 1.2), 'waker.clone()', { mono: true });
      sub(560, 340, '이 한 줄이 없으면 아무도 이 task 를 깨우지 못한다', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700, fill: BAD }); }
    if (k >= 3) { const g = k === 3 ? E(u, 1.0, 2.4) : 1;
      tx(40, 335, '타이머 스레드', { 'font-size': 14, 'font-weight': 700 });
      el('rect', { x: TX(0), y: 322, width: (TX(100) - TX(0)) * g, height: 22, rx: 5, fill: SOFT, stroke: MUT, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      if (g > 0.3) mono(TX(0) + 10, 338, 'thread::sleep(when - now)', { 'font-size': 13.5, fill: MUT });
      if (k === 3) sub(480, 395, 'poll 은 기다리지 않는다 · 기다리는 일은 밖으로', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k === 4) { pill(240, 200, 'poll #1 → Pending', WARN, pop(u, 0.3), { mono: true, fs: 14, fill: PANEL });
      const w = E(u, 1.2, 2.0); if (w > 0) { grow(TX(100), 322, TX(100), 290, w, ACC); pill(TX(100) - 10, 385, 'w.wake()', ACC, pop(u, 1.4), { mono: true, fs: 13.5, fill: PANEL }); }
      tx(40, 395, '100ms 뒤 저장해 둔 Waker 로 깨운다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); } }

  // ---------- 3. Waker.wake() — 채널 Future ----------
  function s3(t, c) { const { k, u } = c;
    const locked = (k === 1 && u > 0.3) || (k === 2) || (k === 3 && u > 0.3) || (k === 4 && u < 1.6);
    const val = k === 3 ? (u > 1.0 ? 'Some(v)' : 'None') : k === 4 ? 'Some(v)' : 'None';
    const wk = k === 2 ? (u > 1.0 ? 'Some(w)' : 'None') : k === 3 ? 'Some(w)' : k === 4 ? (u > 0.8 ? 'None' : 'Some(w)') : 'None';
    zone(330, 70, 300, 210, 'Arc<Mutex<Shared>>', { fill: SOFT, stroke: GRID });
    lock(600, 96, locked, locked ? WARN : MUT);
    field(480, 150, 240, 'value', val, { col: val === 'None' ? MUT : GOOD, hot: k === 3 || (k === 1 && u > 0.8) });
    field(480, 228, 240, 'waker', wk, { col: wk === 'None' ? MUT : ACC, hot: k === 2 || k === 4 });
    card(130, 180, 180, 70, { rx: 10, text: 'Receive\n(받는 task)', fs: 15, stroke: INK, s: k === 0 ? pop(u, 0.3) : 1 });
    card(830, 180, 180, 70, { rx: 10, text: 'send\n(다른 task)', fs: 15, stroke: INK, s: k === 0 ? pop(u, 0.6) : 1 });
    grow(220, 180, 330, 180, k === 0 ? E(u, 0.5, 1.0) : 1, MUT, { plain: true }); grow(740, 180, 630, 180, k === 0 ? E(u, 0.8, 1.3) : 1, MUT, { plain: true });
    if (k === 0) sub(480, 330, '보내는 쪽과 받는 쪽이 같은 Waker 자리를 본다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 1) { pill(130, 270, 'poll #1', ACC, pop(u, 0.2), { mono: true, fs: 14, fill: PANEL });
      mono(480, 330, 'g.value.take() → None', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      sub(480, 365, '값이 있었다면 여기서 Ready(v)', fade(u, 1.8), { 'font-size': 14.5 }); }
    if (k === 2) { fly(200, 210, 420, 228, seg(u, 0.2, 1.0), 'cx.waker()', { mono: true });
      if (u > 1.2) pill(130, 270, 'Poll::Pending', WARN, pop(u, 1.2), { mono: true, fs: 14, fill: PANEL });
      sub(480, 330, '이제 깨워 줄 사람은 send 쪽이다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k === 3) { fly(760, 160, 560, 150, seg(u, 0.3, 1.0), '42', { mono: true, fill: GOOD });
      sub(480, 330, '값만 넣었다 · executor 는 아직 모른다', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k === 4) { fly(560, 228, 480, 350, seg(u, 0.3, 1.1), 'w.wake()', { mono: true });
      tx(160, 360, 'ready queue', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
      cells(270, 336, ['', '', 'task'], { w: 70, h: 42, style: (i) => (i === 2 ? { stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.1) } : { stroke: GRID }) });
      tx(520, 362, '곧 다시 poll 된다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) }); } }

  // ---------- 4. 두 번째 poll → Ready ----------
  const UX = (ms) => 170 + ms * 4.4;   // 0~160ms → 170~874
  const ROWS = [['Delay', 110], ['Receive', 190], ['send task', 260]];
  function s4(t, c) { const { k, u } = c;
    el('line', { x1: UX(0), y1: 300, x2: UX(160), y2: 300, stroke: MUT, 'stroke-width': 1.5 });
    [0, 50, 100, 150].forEach((v) => mono(UX(v), 320, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    ROWS.forEach(([n, y], i) => { const on = (i === 0 && k >= 1) || (i === 1 && k >= 3) || (i === 2 && k >= 4); tx(40, y + 5, n, { 'font-size': 15, 'font-weight': 700, fill: on ? INK : OFF, class: 'mono' }); });
    const mark = (x, y, s, col, sc) => { el('circle', { cx: x, cy: y, r: 7, fill: col, opacity: sc > 0 ? 1 : 0 }); if (sc > 0) mono(x, y - 16, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: Math.min(1, sc) }); };
    if (k === 0) { el('line', { x1: UX(0), y1: 80, x2: UX(0), y2: 300, stroke: ACC, 'stroke-width': 2 }); pill(UX(0) + 110, 70, 'started = Instant::now()', ACC, pop(u, 0.4), { mono: true, fs: 13.5, fill: PANEL });
      sub(520, 370, '#[tokio::main] — poll 을 부르는 주체는 executor', fade(u, 1.4), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { card(UX(0) + 120, 110, 220, 40, { rx: 8, text: 'Delay { +100ms }', fs: 14, mono: true, s: pop(u, 0.3) });
      sub(520, 370, '만들기만 했다 · poll 0회 · 아무 일도 없다', fade(u, 1.3), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // Delay 줄 (k ≥ 2)
    const dg = k === 2 ? E(u, 0.3, 2.0) : 1;
    mark(UX(0), 110, '#1 Pending', WARN, k === 2 ? pop(u, 0.3) : 1);
    el('rect', { x: UX(0) + 10, y: 102, width: Math.max(0, (UX(100) - UX(0) - 20) * dg), height: 16, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-dasharray': '4 4' });
    if (dg >= 1) mark(UX(100.2), 110, '#2 Ready(())', GOOD, k === 2 ? pop(u, 2.0) : 1);
    if (k === 2) { terminal(170, 345, 520, 66, ['delay 끝 (elapsed 100.2284ms)'], E(u, 2.1, 2.6), { title: '' });
      tx(720, 384, 'await 한 줄 = poll 2회', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    // Receive (k ≥ 3)
    mark(UX(100.5), 190, '#1 Pending', WARN, k === 3 ? pop(u, 0.5) : 1);
    if (k === 3) { pill(UX(100.5) + 150, 190, 'value: None · waker 저장', WARN, pop(u, 1.0), { fs: 13.5, fill: PANEL });
      sub(520, 370, '값이 없으니 Pending, 대신 Waker 를 남긴다', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    const sg = k === 4 ? E(u, 0.2, 1.6) : 1;
    el('rect', { x: UX(100.5), y: 252, width: (UX(150) - UX(100.5)) * sg, height: 16, rx: 4, fill: SOFT, stroke: MUT, 'stroke-dasharray': '4 4' });
    mono(UX(100.5) + 6, 290, 'sleep(50ms)', { 'font-size': 13.5, fill: MUT, opacity: sg });
    el('rect', { x: UX(100.5) + 10, y: 182, width: Math.max(0, (UX(150) - UX(100.5) - 20) * sg), height: 16, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-dasharray': '4 4' });
    if (sg >= 1) { mark(UX(150), 260, 'send(42)', ACC, k === 4 ? pop(u, 1.6) : 1); grow(UX(150), 250, UX(150), 205, k === 4 ? E(u, 1.7, 2.2) : 1, ACC); }
    if (k === 4) { sub(520, 370, '깨우는 쪽은 Future 밖 · 다른 task 가 wake() 를 부른다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    mark(UX(152), 190, '#2 Ready(42)', GOOD, pop(u, 0.4));
    fly(UX(152), 190, 780, 44, seg(u, 0.8, 1.6), 'v = 42', { mono: true, fill: GOOD, stay: true });
    terminal(170, 345, 520, 66, ['received = 42'], E(u, 1.7, 2.3), { title: '' }); }

  // ---------- 5. 정리 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { snippetBox(40, 70, ['async fn fetch(url: &str) -> String {', '    reqwest::get(url).await', '        .unwrap().text().await', '        .unwrap()', '}'], fade(u, 0.2));
      const st = [['시작', MUT], ['get 대기', WARN], ['text 대기', WARN], ['끝', GOOD]];
      tx(560, 70, '컴파일러가 만드는 상태', { 'font-size': 15, 'font-weight': 800 });
      st.forEach(([s, col], i) => { const y = 110 + i * 70; card(680, y, 170, 46, { rx: 23, text: s, fs: 15, fw: 700, stroke: col, color: col, s: pop(u, 0.6 + i * 0.35) });
        if (i < 3) grow(680, y + 24, 680, y + 46, E(u, 0.9 + i * 0.35, 1.2 + i * 0.35), MUT); });
      sub(300, 300, '.await 마다 상태가 하나씩 생긴다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK });
      sub(300, 330, 'poll · Pending · Ready 는 컴파일러 몫', fade(u, 2.3), { 'font-size': 14.5 }); return; }
    if (k === 1) { const L = ['pub struct AlwaysReady<T>(pub Option<T>);', 'impl<T: Unpin> Future for AlwaysReady<T> {', '    type Output = T;', '    fn poll(mut self: Pin<&mut Self>, _: &mut Context) -> Poll<T>'];
      L.forEach((s, i) => { const y = 120 + i * 70, a = E(u, 0.2 + i * 0.4, 0.6 + i * 0.4);
        card(480, lerp(y - 60, y, a), 760, 54, { rx: 8, stroke: i === 3 ? ACC : GRID, sw: 2, op: a });
        mono(118, lerp(y - 60, y, a) + 5, s, { 'font-size': 15, 'font-weight': 700, fill: i === 3 ? ACC : INK, opacity: a }); });
      tx(480, 54, '직접 구현의 뼈대는 네 줄', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { const took = u > 1.0;
      field(250, 150, 220, 'self.0', took ? 'None' : 'Some(5)', { col: took ? MUT : GOOD, hot: true });
      pill(560, 120, 'poll #1 → Ready(5)', GOOD, pop(u, 1.0), { mono: true, fs: 14.5, fill: PANEL });
      if (u > 1.7) { pill(560, 210, 'poll #2 → None', BAD, pop(u, 1.7), { mono: true, fs: 14.5, fill: PANEL });
        mono(560, 270, 'panic!("두 번 poll 됨")', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
      sub(480, 350, 'Ready 를 돌려준 Future 는 다시 poll 하지 않는다', fade(u, 2.2), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 3) { const rows = [['ready(42).await', '첫 poll 에 Ready', '실행 → 42', GOOD], ['pending::<()>().await', '언제나 Pending', '영원히 대기', WARN], ['poll_fn(|cx| …)', '클로저가 poll 이 된다', 'struct 없이', ACC]];
      tx(40, 60, 'futures::future (std::future 에도 같은 이름이 있다)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      rows.forEach(([a, b, d, col], i) => { const y = 120 + i * 90, s = pop(u, 0.3 + i * 0.5);
        card(480, y, 880, 66, { rx: 10, stroke: col, sw: 2, s });
        mono(60, y + 5, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.5) });
        tx(430, y + 5, b, { 'font-size': 15, opacity: fade(u, 0.5 + i * 0.5) });
        tx(890, y + 5, d, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'end', opacity: fade(u, 0.6 + i * 0.5) }); });
      return; }
    // k 4: 망가지는 세 가지 + 실험
    [['poll 안에서 blocking IO', '그 worker 의 다른 task 가 멈춘다'], ['Waker 저장 누락', '아무도 깨우지 않는다'], ['wake 없는 Pending', '영영 Pending']].forEach(([a, b], i) => { const x = 170 + i * 310, s = pop(u, 0.2 + i * 0.3);
      card(x, 90, 290, 76, { rx: 10, stroke: BAD, sw: 2, fill: BADBG, s }); cross(x - 120, 90, 9, s);
      tx(x - 100, 84, a, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3 + i * 0.3) }); tx(x - 100, 108, b, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3 + i * 0.3) }); });
    tx(40, 190, '실험: Waker 를 안 남긴 Future (10ms 뒤 준비) + 200ms timeout', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    const X = (ms) => 80 + ms * 3.6, g = E(u, 1.2, 2.5);
    el('line', { x1: X(0), y1: 290, x2: X(220), y2: 290, stroke: MUT, 'stroke-width': 1.5 });
    [0, 10, 100, 200].forEach((v) => mono(X(v), 312, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: v === 10 ? 0 : 1 }));
    el('rect', { x: X(0), y: 240, width: X(10) - X(0), height: 22, rx: 4, fill: ACC, opacity: g > 0 ? 1 : 0 });
    tx(X(0), 232, '10ms 에 준비 끝', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
    el('rect', { x: X(10), y: 240, width: Math.max(0, (X(214.8) - X(10)) * clamp((g * 214.8 - 10) / 204.8)), height: 22, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-dasharray': '4 4' });
    if (g >= 1) { mark2(X(214.8), 251); tx(X(214.8) - 8, 360, '214.8ms 에야 끝 · timeout 타이머가 대신 깨웠다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' }); } }
  function mark2(x, y) { el('circle', { cx: x, cy: y, r: 8, fill: BAD }); }
  function snippetBox(x, y, lines, op) { const h = lines.length * 28 + 24; el('rect', { x, y, width: 440, height: h, rx: 8, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    lines.forEach((s, i) => mono(x + 16, y + 32 + i * 28, s, { 'font-size': 14.5, fill: /await/.test(s) ? WARN : INK, 'font-weight': /await/.test(s) ? 700 : 400, opacity: op })); }

  const quiz = [
    { q: 'Future trait의 poll이 돌려줄 수 있는 값은 무엇인가?',
      o: ['Ready(T), Pending, Running 셋 중 하나', 'Ready(T) 아니면 Pending', 'T 또는 Err'], a: 1,
      why: 'Poll<T>는 Ready(T)와 Pending 두 갈래뿐이다. 중간 상태가 없어서 "아직"이면 Pending을 돌려주고 나중에 다시 불린다.' },
    { q: 'Delay의 첫 poll이 Pending을 돌려주기 전에 반드시 해야 하는 일은 무엇인가?',
      o: ['cx.waker()를 복제해 자기 안에 저장한다', 'thread::sleep으로 when까지 기다린다', 'spawned를 false로 되돌린다'], a: 0,
      why: '저장한 Waker가 있어야 타이머 스레드가 100ms 뒤 wake()로 task를 깨운다. 빠뜨리면 그 task를 아무도 다시 poll하지 않는다.' },
    { q: 'send가 value에 값을 넣기만 하고 wake()를 부르지 않으면 어떻게 되는가?',
      o: ['executor가 값을 감지해 곧바로 poll한다', 'Receive가 Err를 돌려준다', '받는 task는 계속 잠들어 있다'], a: 2,
      why: 'executor는 값이 들어온 것을 모른다. 저장된 Waker를 꺼내 wake()해야 task가 ready queue로 돌아간다.' },
    { q: 'd.await가 끝날 때까지 Delay의 poll은 몇 번 불렸는가?',
      o: ['1번', '2번', '100번'], a: 1,
      why: 'poll #1은 Pending, 100ms 뒤 wake 후 poll #2가 Ready였다. 실행 출력은 "delay 끝 (elapsed 100.2284ms)"였다.' },
    { q: 'Ready를 이미 돌려준 AlwaysReady를 한 번 더 poll하면 어떻게 되는가?',
      o: ['같은 값을 다시 Ready로 준다', 'Pending을 돌려준다', '값이 이미 꺼내져 None이라 panic한다'], a: 2,
      why: 'take()로 값을 한 번만 꺼내므로 두 번째 poll에서는 None이다. Ready 뒤의 poll은 Future 계약 위반이다.' },
  ];

  const summary = [
    'Future의 메서드는 poll 하나이고, 결과는 Ready(T)나 Pending 둘 중 하나다.',
    '아직 끝나지 않았으면 cx.waker()를 저장해 두고 Pending을 돌려준다.',
    '값을 넣은 쪽이 저장된 Waker로 wake()를 불러야 task가 다시 poll된다.',
    'Delay와 Receive는 모두 poll 2번에 Ready가 됐다. 평소에는 async fn이 이 일을 대신한다.',
  ];
  const review = [
    { q: '직접 만든 Future를 await했더니 준비가 끝났는데도 다음 줄로 넘어가지 않는다. 먼저 볼 곳은?',
      o: ['Pending을 돌려주기 전에 Waker를 저장하고 나중에 wake()하는지', 'Output 타입이 Copy인지', 'worker 스레드 수'], a: 0,
      why: 'Waker 없이 Pending을 돌려주면 그 task는 다른 사건이 깨울 때까지 멈춘다. 실험에서는 10ms에 준비됐어도 214.8ms에야 끝났다.' },
    { q: '채널 Future에서 send 쪽이 lock을 잡고 value를 채웠다. 받는 task가 실제로 값을 쥐는 시점은?',
      o: ['value가 채워지는 바로 그 순간', 'wake()로 다시 큐에 들어가 executor가 poll했을 때', 'send 함수가 끝나 lock이 풀릴 때'], a: 1,
      why: '값을 꺼내는 것은 poll 안의 value.take()다. wake()는 다시 poll해 달라는 신호일 뿐이고, 두 번째 poll에서 Ready(42)가 나왔다.' },
    { q: 'poll 안에서 std::fs::read로 큰 파일을 읽도록 Future를 짰다. 무엇이 문제인가?',
      o: ['Poll 타입이 맞지 않아 컴파일되지 않는다', 'Pin 때문에 파일을 옮길 수 없다', 'poll이 오래 걸리는 동안 그 스레드의 다른 task가 모두 멈춘다'], a: 2,
      why: 'poll은 바로 돌아와야 한다. 오래 걸리는 일은 Delay의 타이머 스레드처럼 밖으로 내보내고 Waker로 돌아와야 한다.' },
  ];

  R.page({ title: 'poll과 Waker', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
