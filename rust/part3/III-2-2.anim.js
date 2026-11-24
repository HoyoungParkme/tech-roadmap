/* III-2-2 join! · select! · timeout — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 이 PC(rustc 1.100, tokio 1.53)에서 페이지 코드를 그대로 돌린 결과다.
 *   join!(50, 100, 200ms) → 212ms, try_join! → Err("boom")  (실험: 300ms Ok + 20ms Err → 31ms 에 Err("boom"))
 *   select! → "got value 42" 57ms / timeout r1 = Ok(()), r2 = Err(Elapsed(())) 107ms
 *   cancel-safe → 처리: m0 … m4, "shutdown signal — drain & exit" / fastest() → "primary" */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, G, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, clock, cells, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 깨져 흩어지는 조각 (drop 된 Future)
  function shatter(cx, cy, w, a, label) { [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => { const x = cx + dx * (w / 4 + 26 * a), y = cy + dy * (8 + 14 * a);
      el('rect', { x: x - w / 4, y: y - 8, width: w / 2, height: 16, rx: 4, fill: SOFT, stroke: OFF, 'stroke-width': 1.5, opacity: 1 - a * 0.7, transform: `rotate(${dx * dy * 14 * a} ${x} ${y})` }); });
    if (label) mono(cx, cy + 5, label, { 'font-size': 13.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: a }); }

  // ---------- 1. join! — 모두 끝날 때까지 ----------
  const JX = (ms) => 160 + ms * 3.2;   // 0~220ms → 160~864
  const JL = [['A', 50, 110], ['B', 100, 165], ['C', 200, 220]];
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      el('line', { x1: JX(0), y1: 260, x2: JX(220), y2: 260, stroke: MUT, 'stroke-width': 1.5 });
      [0, 50, 100, 200].forEach((v) => mono(JX(v), 280, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      const now = k === 0 ? 0 : k === 1 ? E(u, 0.2, 2.4) * 200 : 200;
      JL.forEach(([n, ms, y], i) => { const s = k === 0 ? pop(u, 0.4 + i * 0.3) : 1;
        card(80, y, 120, 36, { rx: 18, text: `work("${n}", ${ms})`, fs: 13.5, mono: true, stroke: k === 0 ? OFF : ACC, color: k === 0 ? MUT : ACC, s });
        if (k === 0) return;
        el('rect', { x: JX(0), y: y - 10, width: Math.max(0, JX(Math.min(now, ms)) - JX(0)), height: 20, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5 });
        if (now >= ms) check(JX(ms) + 14, y, 8); });
      if (k === 0) { sub(520, 170, '아직 호출 전 · .await 이나 join! 이 있어야 굴러간다', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
      if (k === 1) { el('line', { x1: JX(now), y1: 86, x2: JX(now), y2: 260, stroke: ACC, 'stroke-width': 2 }); mono(JX(now), 78, Math.round(now) + 'ms', { 'font-size': 13.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle' });
        tx(160, 340, '합 350ms 가 아니라 가장 긴 200ms', { 'font-size': 16, 'font-weight': 800, fill: INK, opacity: fade(u, 2.2) }); return; }
      // k 2: 튜플
      tx(160, 330, 'let (a, b, c) =', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      cells(320, 308, ['A-done', 'B-done', 'C-done'], { w: 110, h: 40, fs: 14, style: (i) => ({ stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 0.3 + i * 0.3) }) });
      mono(700, 334, '실측 212ms', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      sub(480, 395, '순서는 결과가 나온 순서가 아니라 적은 순서', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    // k 3·4: try_join!
    const br = [['Ok("ok-1")', GOOD], ['Err("boom")', BAD], ['Ok("ok-3")', GOOD]];
    tx(60, 60, 'tokio::try_join!(…)', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
    br.forEach(([s, col], i) => { const y = 120 + i * 70, drop = k === 4 && i !== 1;
      if (drop) shatter(220, y, 200, E(u, 0.6, 1.6), '결과 버림'); else card(220, y, 200, 46, { rx: 8, text: s, fs: 15, mono: true, stroke: col, color: col, s: k === 3 ? pop(u, 0.3 + i * 0.3) : 1 }); });
    if (k === 3) { sub(620, 190, '모든 branch 가 Result 를 돌려줘야 한다', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    grow(330, 190, 520, 190, E(u, 0.2, 0.8), BAD);
    card(660, 190, 220, 54, { rx: 10, text: 'Err("boom")', fs: 17, fw: 800, mono: true, stroke: BAD, color: BAD, fill: BADBG, s: pop(u, 0.8) });
    tx(60, 360, '실험: 300ms 뒤 Ok + 20ms 뒤 Err → 31ms 에 Err("boom")', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    sub(480, 395, '첫 Err 가 나오면 나머지를 기다리지 않는다', fade(u, 2.2), { 'font-size': 14.5 }); }

  // ---------- 2. select! — 먼저 끝난 하나 ----------
  const BR = [['sleep(1s)', 1000, 150, MUT], ['rx.recv()', 57, 230, ACC], ['ctrl_c()', null, 310, INFO]];
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { // 채널과 보내는 task
      card(200, 120, 110, 50, { rx: 10, text: 'tx', fs: 18, fw: 800, mono: true, s: pop(u, k === 0 ? 0.2 : 0) });
      cells(430, 98, [k === 1 && u > 2.0 ? '42' : ''], { w: 60, h: 44, style: () => ({ stroke: ACC }) });
      card(700, 120, 110, 50, { rx: 10, text: 'rx', fs: 18, fw: 800, mono: true, s: pop(u, k === 0 ? 0.5 : 0) });
      grow(255, 120, 425, 120, k === 0 ? E(u, 0.6, 1.0) : 1, MUT); grow(495, 120, 640, 120, k === 0 ? E(u, 0.9, 1.3) : 1, MUT);
      mono(460, 170, 'mpsc::channel::<i32>(1)', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      if (k === 0) { sub(480, 260, '용량 1 칸 · rx 가 select! 의 branch 재료가 된다', fade(u, 1.5), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
      card(200, 270, 230, 60, { rx: 10, text: 'spawn 된 task\nsleep 50ms → send(42)', fs: 14, stroke: ACC, s: pop(u, 0.2) });
      clock(360, 270, 24, E(u, 0.6, 1.8), WARN);
      if (u > 1.8) dot([[200, 240], [200, 120], [430, 120]], seg(u, 1.8, 2.4), ACC, 7);
      sub(640, 300, 'spawn 은 바로 돌아온다 · 전송은 50ms 뒤', fade(u, 1.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    tx(60, 70, 'tokio::select! {', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
    el('line', { x1: 820, y1: 110, x2: 820, y2: 340, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '6 5' }); tx(820, 100, '먼저 끝난 쪽', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle' });
    const race = k === 5 ? E(u, 0.2, 1.4) * 57 : 0;
    BR.forEach(([n, ms, y, col], i) => { if (k < 2 + i) return;
      const s = k === 2 + i ? pop(u, 0.3) : 1;
      card(140, y, 160, 46, { rx: 23, text: n, fs: 14.5, mono: true, stroke: col, color: col, s });
      el('line', { x1: 230, y1: y, x2: 810, y2: y, stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round' });
      const p = ms ? Math.min(1, race / ms) : 0;
      if (k === 5 && i !== 1 && u > 1.5) { shatter(330, y, 150, E(u, 1.5, 2.3), 'drop'); return; }
      el('line', { x1: 230, y1: y, x2: 230 + 580 * p, y2: y, stroke: col, 'stroke-width': 8, 'stroke-linecap': 'round' });
      el('circle', { cx: 230 + 580 * p, cy: y, r: 9, fill: col });
      mono(500, y - 16, ms ? (ms === 57 ? '50ms 뒤 값' : `${ms}ms`) : '시그널 올 때까지', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    if (k === 3) sub(500, 390, 'Some(v) 패턴이 맞을 때만 이 본문이 돈다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 4) sub(500, 390, '타이머 · 채널 · 시그널을 한 곳에서 기다린다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 2) sub(500, 390, '1초라 이번에는 가장 느리다', fade(u, 1.2), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 5) { if (u > 1.4) pill(880, 230, '채택', GOOD, pop(u, 1.4), { fs: 14 });
      terminal(230, 350, 420, 62, ['got value 42'], E(u, 1.9, 2.4), { title: '' }); mono(670, 392, '57ms', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); } }

  // ---------- 3. timeout ----------
  const TX = (ms) => 200 + ms * 1.3;   // 0~500ms → 200~850
  function race2(y, work, limit, u, win) { // 두 막대 경주: 작업 vs 제한 시간
    const end = Math.min(work, limit), now = E(u, 0.2, 1.8) * end;
    [['작업', work, y, ACC], ['제한', limit, y + 50, WARN]].forEach(([n, ms, yy, col]) => {
      tx(60, yy + 5, `${n} ${ms}ms`, { 'font-size': 15, 'font-weight': 700, fill: col });
      el('rect', { x: TX(0), y: yy - 10, width: TX(ms) - TX(0), height: 20, rx: 4, fill: 'none', stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' });
      el('rect', { x: TX(0), y: yy - 10, width: TX(Math.min(now, ms)) - TX(0), height: 20, rx: 4, fill: col, opacity: 0.8 }); });
    el('line', { x1: TX(end), y1: y - 26, x2: TX(end), y2: y + 70, stroke: INK, 'stroke-width': 2, opacity: now >= end ? 1 : 0 }); }
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { card(480, 170, 520, 170, { rx: 16, stroke: WARN, sw: 2.5, dash: '7 5', s: pop(u, 0.6) });
      card(400, 175, 220, 70, { rx: 10, text: 'fut', fs: 20, fw: 800, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      clock(640, 175, 34, E(u, 1.0, 2.2) * 0.6, WARN);
      tx(240, 110, 'timeout(dur, fut)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN, opacity: fade(u, 0.7) });
      mono(480, 310, 'Result<T, Elapsed>', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 1.6) });
      sub(480, 350, 'Future 를 감싸 결과를 Result 로 바꾼다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 1 || k === 2) { const [w, l] = k === 1 ? [100, 500] : [500, 100];
      el('line', { x1: TX(0), y1: 250, x2: TX(500), y2: 250, stroke: MUT, 'stroke-width': 1.5 });
      [0, 100, 500].forEach((v) => mono(TX(v), 270, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      race2(130, w, l, u);
      if (k === 2 && u > 1.8) shatter(TX(300), 130, 160, E(u, 1.8, 2.5), 'drop');
      const out = k === 1 ? ['r1 = Ok(())', GOOD] : ['r2 = Err(Elapsed(()))', BAD];
      if (u > 1.9) { card(480, 330, 360, 50, { rx: 10, text: out[0], fs: 17, fw: 800, mono: true, stroke: out[1], color: out[1], s: pop(u, 1.9) }); }
      if (k === 2) mono(700, 336, '실측 107ms', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.2) });
      return; }
    if (k === 3) { card(330, 180, 420, 130, { rx: 16, stroke: WARN, sw: 2.5, dash: '7 5' });
      card(300, 190, 280, 60, { rx: 10, text: 'HTTP 호출 (응답 미정)', fs: 15, stroke: ACC, color: ACC });
      tx(140, 136, 'timeout(3s, …)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: WARN });
      clock(500, 190, 26, (t * 0.3) % 1, WARN);
      ['3초 안에 오면 Ok(body)', '안 오면 Err 로 끊는다'].forEach((s, i) => tx(600, 170 + i * 34, s, { 'font-size': 15, 'font-weight': 700, fill: i ? BAD : GOOD, opacity: fade(u, 0.8 + i * 0.5) }));
      sub(480, 340, '감싸지 않은 네트워크 호출은 영원히 매달릴 수 있다', fade(u, 1.8), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    // k 4: timeout 의 정체
    tx(80, 80, 'timeout(dur, fut) 는 개념상', { 'font-size': 16, 'font-weight': 800 });
    mono(80, 130, 'tokio::select! {', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3) });
    [['v = fut', '=> Ok(v)', GOOD], ['_ = sleep(dur)', '=> Err(Elapsed)', BAD]].forEach(([a, b, col], i) => { const y = 180 + i * 60, s = pop(u, 0.6 + i * 0.4);
      card(320, y, 380, 46, { rx: 8, stroke: col, sw: 2, s }); mono(150, y + 5, a, { 'font-size': 16, 'font-weight': 700, fill: col, opacity: fade(u, 0.7 + i * 0.4) });
      mono(330, y + 5, b, { 'font-size': 16, fill: INK, opacity: fade(u, 0.8 + i * 0.4) }); });
    mono(80, 300, '}', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.3) });
    tx(600, 200, '새 개념이 아니라', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
    tx(600, 230, 'select! 의 정해진 사용법', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); }

  // ---------- 4. 취소 안전성 · graceful shutdown ----------
  const MSG = ['m0', 'm1', 'm2', 'm3', 'm4'];
  function s4(t, c) { const { k, u } = c;
    // 위: mpsc 큐 (cap 8)
    let q = [];
    if (k === 4) q = ['m0'];
    if (k === 5) { const inn = Math.min(5, Math.floor(E(u, 0.1, 0.9) * 5.99)), out = Math.min(5, Math.floor(E(u, 0.9, 2.3) * 5.99)); q = MSG.slice(out, inn); }
    tx(40, 54, 'mpsc (cap 8)', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    cells(160, 32, Array.from({ length: 8 }, (_, i) => q[i] || ''), { w: 50, h: 40, fs: 14, style: (i) => (q[i] ? { stroke: ACC, color: ACC, fill: ACCBG } : { stroke: GRID }), op: 1 });
    // watch 깃발
    const flag = k === 6 && u > 0.6;
    tx(640, 54, 'watch', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    card(770, 52, 120, 40, { rx: 8, text: flag ? 'true' : 'false', fs: 16, fw: 800, mono: true, stroke: flag ? BAD : GRID, color: flag ? BAD : MUT, fill: flag ? BADBG : PANEL });
    if (k === 0) { sub(480, 220, '일감은 mpsc 로, 종료 신호는 watch 로', fade(u, 1.0), { 'font-size': 16, 'font-weight': 700, fill: INK });
      sub(480, 250, 'watch 는 여러 task 가 같은 값을 본다', fade(u, 1.6), { 'font-size': 14.5 }); return; }
    // worker 루프
    const lx = 200, ly = 250, done = k === 6 && u > 1.6;
    el('circle', { cx: lx, cy: ly, r: 70, fill: 'none', stroke: done ? OFF : ACC, 'stroke-width': 3, 'stroke-dasharray': '10 8', transform: done ? null : `rotate(${t * 60} ${lx} ${ly})` });
    tx(lx, ly - 4, 'worker', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: done ? MUT : INK });
    mono(lx, ly + 20, done ? 'break' : 'loop { select! }', { 'text-anchor': 'middle', 'font-size': 13.5, fill: done ? BAD : ACC });
    // branch 두 칸
    if (k >= 2) { const br = [['1', '_ = sh_rx.changed()', WARN], ['2', 'Some(msg) = rx.recv()', ACC]];
      if (k === 2) mono(330, 128, 'biased;', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
      br.forEach(([n, s, col], i) => { if (k === 4 && i === 1 && u > 1.0) return; const y = 180 + i * 70, hot = (k === 3 && i === 0) || ((k === 4 || k === 5) && i === 1) || (k === 6 && i === 0);
        card(510, y, 300, 50, { rx: 10, stroke: hot ? col : GRID, sw: hot ? 2.6 : 1.6, s: k === 2 ? pop(u, 0.5 + i * 0.3) : 1 });
        mono(372, y + 5, n + ') ' + s, { 'font-size': 14, 'font-weight': 700, fill: col }); });
      if (k === 2) tx(680, 300, '없으면 무작위 순서 · 있으면 위에서부터', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.4) }); }
    if (k === 1) sub(560, 250, '한 바퀴마다 branch Future 를 새로 만든다', fade(u, 0.8), { 'font-size': 15, 'font-weight': 700, fill: INK });
    if (k === 3) { mono(680, 186, '*sh_rx.borrow() == false', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      tx(680, 360, 'true 일 때만 break', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) }); }
    if (k === 4) { shatter(510, 250, 300, E(u, 1.0, 1.8), 'recv Future drop');
      tx(160, 112, '← 메시지는 채널에 그대로', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k >= 5) { const lines = MSG.map((m) => '처리: ' + m).concat(k === 6 ? ['shutdown signal — drain & exit'] : []);
      terminal(380, 310, 540, 104, lines, k === 5 ? E(u, 0.9, 2.3) * 5 : 5 + E(u, 1.0, 1.6), { title: '', lh: 20, fs: 13.5 }); }
    if (k === 6) { fly(830, 80, lx + 40, ly - 50, seg(u, 0.6, 1.4), 'send(true)', { mono: true, fill: BAD });
      if (u > 1.8) pill(lx, 360, 'worker.await 완료', GOOD, pop(u, 1.8), { mono: true, fs: 13.5, fill: PANEL }); } }

  // ---------- 5. 자주 쓰는 패턴 4개 ----------
  const PAN = [['join!', '병렬 호출 · 둘 다 받기'], ['select!', '먼저 오는 응답 쓰기'], ['timeout', '외부 API 마감 시한'], ['watch + biased', 'graceful shutdown']];
  function s5(t, c) { const { k, u } = c;
    PAN.forEach(([a, b], i) => { const cx = 245 + (i % 2) * 470, cy = 105 + Math.floor(i / 2) * 210, on = i === k, op = i <= k ? 1 : 0.3;
      card(cx, cy, 440, 190, { rx: 12, stroke: on ? ACC : GRID, sw: on ? 2.5 : 1.5, op });
      mono(cx - 204, cy - 66, a, { 'font-size': 16, 'font-weight': 800, fill: on ? ACC : INK, opacity: op });
      tx(cx + 204, cy - 66, b, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: op });
      if (i > k) return;
      const uu = on ? u : 3;
      if (i === 0) { [['user', -10], ['post', 30]].forEach(([s, dy], j) => { const g = E(uu, 0.3, 1.4);
          el('rect', { x: cx - 200, y: cy + dy - 9, width: 200 * g, height: 18, rx: 4, fill: ACCBG, stroke: ACC }); mono(cx - 192, cy + dy + 5, s, { 'font-size': 13.5, fill: ACC, opacity: g }); });
        grow(cx + 10, cy + 10, cx + 70, cy + 10, E(uu, 1.4, 1.8), ACC); card(cx + 140, cy + 10, 110, 40, { rx: 8, text: '(u, p)', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(uu, 1.8) }); }
      if (i === 1) { const now = E(uu, 0.2, 1.6) * 50; [['primary', 50, -10], ['fallback', 80, 30]].forEach(([s, ms, dy], j) => {
          const w = 260 * Math.min(now, ms) / 80, dropped = j === 1 && uu > 1.6;
          if (dropped) { shatter(cx - 70, cy + dy, 200, E(uu, 1.6, 2.3), 'drop'); return; }
          el('rect', { x: cx - 200, y: cy + dy - 9, width: Math.max(2, w), height: 18, rx: 4, fill: j ? SOFT : ACCBG, stroke: j ? MUT : ACC });
          mono(cx - 192, cy + dy + 5, `${s} ${ms}ms`, { 'font-size': 13.5, fill: j ? MUT : ACC }); });
        card(cx + 150, cy + 10, 120, 40, { rx: 8, text: '"primary"', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(uu, 1.7) }); }
      if (i === 2) { mono(cx - 200, cy - 22, 'match timeout(2s, ..).await {', { 'font-size': 13.5, fill: INK, opacity: fade(uu, 0.2) });
        mono(cx - 180, cy + 8, 'Ok(v)  => Ok(v),', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(uu, 0.7) });
        mono(cx - 180, cy + 36, 'Err(_) => Err(()),', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(uu, 1.1) });
        tx(cx - 200, cy + 72, 'Elapsed 를 그대로 흘리지 않는다', { 'font-size': 13.5, fill: MUT, opacity: fade(uu, 1.6) }); }
      if (i === 3) { const n = on ? Math.floor(E(u, 0.2, 1.8) * 9) : 9;
        for (let j = 0; j < n; j++) el('circle', { cx: cx - 190 + j * 28, cy: cy - 6, r: 6, fill: ACC, opacity: 0.7 });
        mono(cx - 200, cy + 26, 'tick 10ms …', { 'font-size': 13.5, fill: ACC });
        if (!on || u > 1.9) { card(cx + 140, cy - 6, 120, 40, { rx: 8, text: 'break', fs: 15, mono: true, stroke: BAD, color: BAD, s: on ? pop(u, 1.9) : 1 });
          tx(cx - 200, cy + 62, 'shutdown.changed() 가 1순위', { 'font-size': 13.5, fill: MUT }); } } }); }

  const quiz = [
    { q: '50·100·200ms를 자는 work 셋을 join!으로 묶으면 다음 줄은 언제 실행되는가?',
      o: ['가장 빠른 50ms 뒤', '셋이 모두 끝나는 200ms 남짓 뒤', '합인 350ms 뒤'], a: 1,
      why: 'join!은 모두 끝나야 튜플을 돌려준다. 걸린 시간은 가장 느린 C 기준이고, 실행해 보니 212ms였다.' },
    { q: 'select!에서 rx.recv()가 50ms 만에 Some(42)를 받았다. 나머지 sleep(1s)와 ctrl_c()는 어떻게 되는가?',
      o: ['drop되어 취소된다', '끝날 때까지 계속 기다린 뒤 무시된다', '다음 select!로 넘어간다'], a: 0,
      why: 'select!는 가장 먼저 Ready가 된 branch의 본문만 실행하고, 고르지 않은 Future는 그 자리에서 drop한다.' },
    { q: 'timeout(100ms, sleep(500ms))의 결과는 무엇인가?',
      o: ['Ok(())', '500ms 뒤 Ok(())', 'Err(Elapsed(()))'], a: 2,
      why: '제한 시간이 먼저 만료돼 작업 Future는 drop되고 Err(Elapsed(()))가 나온다. 실측은 107ms였다.' },
    { q: '루프 안 select!에서 다른 branch가 골라져 rx.recv() Future가 drop되면 메시지는 어떻게 되는가?',
      o: ['그 메시지는 사라진다', '채널에 그대로 남아 다음 바퀴에 받는다', 'panic이 난다'], a: 1,
      why: 'mpsc::Receiver::recv는 cancel-safe다. 그래서 m0~m4 다섯 건이 모두 처리된 뒤 종료 신호로 빠져나왔다.' },
    { q: 'primary(50ms)와 fallback(80ms)을 select!로 동시에 부르는 패턴이 노리는 것은 무엇인가?',
      o: ['두 응답을 합치기', '요청 비용 줄이기', '중복 요청 비용을 내고 느린 꼬리 지연을 줄이기'], a: 2,
      why: '먼저 온 primary를 쓰고 fallback은 drop한다. 요청을 두 번 보내는 대신 한쪽이 느려도 기다리지 않는다.' },
  ];

  const summary = [
    'join!은 모두 끝날 때까지 기다리고, 걸린 시간은 가장 느린 Future가 정한다.',
    'select!는 먼저 Ready가 된 branch만 실행하고 나머지 Future는 drop한다.',
    'timeout은 sleep과 select!한 것과 같고, 넘기면 Err(Elapsed(()))를 돌려준다.',
    'drop돼도 데이터를 잃지 않는 recv 같은 Future만 루프 속 select!에 둔다.',
  ];
  const review = [
    { q: '사용자 정보와 게시글을 순서대로 await하니 응답이 두 지연의 합만큼 걸린다. 둘은 서로 관계가 없다. 고칠 방법은?',
      o: ['select!로 먼저 온 것만 쓴다', 'join!으로 묶어 동시에 진행시킨다', 'timeout을 건다'], a: 1,
      why: '독립된 호출은 join!으로 묶으면 지연이 합이 아니라 최댓값이 된다. 둘 다 필요하므로 select!는 맞지 않다.' },
    { q: '종료 신호를 보냈는데 worker가 메시지를 계속 처리하느라 한참 뒤에야 멈춘다. select! 안에서 먼저 확인할 것은?',
      o: ['biased;를 두고 종료 branch를 맨 위에 놓았는지', '채널 용량이 8인지', 'timeout이 걸려 있는지'], a: 0,
      why: 'biased;가 없으면 branch를 무작위로 고르므로 종료 신호가 밀릴 수 있다. 종료를 첫 branch로 두면 먼저 검사된다.' },
    { q: '루프 안 select!에 직접 만든 Future를 넣었더니 가끔 읽던 데이터가 사라진다. 원인으로 가장 가까운 것은?',
      o: ['tokio 버전이 낮아서', 'select!가 branch를 두 번 실행해서', '고르지 않은 branch가 drop될 때 그 Future가 읽던 상태를 잃어서'], a: 2,
      why: 'select!는 매 바퀴 지는 branch를 drop한다. recv처럼 cancel-safe한 Future만 넣어야 데이터가 남는다.' },
  ];

  R.page({ title: 'join! 과 select!', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
