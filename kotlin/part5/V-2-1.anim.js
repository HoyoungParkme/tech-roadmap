/* V-2-1 코루틴 운영 — 취소와 예외. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 취소 플래그와 확인 지점, 위로 떠오르는 예외 공과 catch 그물, 부모-자식 Job 나무, 스레드 레인을 그린다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, zone } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const ap = (k, i, u, s = 0.2, d = 0.6) => (k > i ? 1 : k === i ? R.spring(seg(u, s, s + d)) : 0);
  const gr = (k, i, u, s = 0.2, d = 0.9) => (k > i ? 1 : k === i ? E(u, s, s + d) : 0);
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ST = { run: [ACC, PANEL, '실행 중'], fail: [BAD, BADBG, '실패'], cancel: [OFF, SOFT, '취소됨'], done: [GOOD, GOODBG, '완료'], cancelling: [WARN, WARNBG, '취소 중'] };
  // Job 노드: 원 + 이름 + 상태
  function node(cx, cy, name, st, s, o) { o = o || {}; if (s <= 0) return; const [col, bg, lab] = ST[st] || ST.run, g = R.G(cx, cy, s);
    el('rect', { x: -(o.w || 150) / 2, y: -26, width: o.w || 150, height: 52, rx: 26, fill: bg, stroke: col, 'stroke-width': 2.5 }, g);
    tx(0, -2, name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, class: 'mono', fill: st === 'cancel' ? MUT : INK, 'text-decoration': st === 'cancel' ? 'line-through' : null }, g);
    tx(0, 17, o.tag || lab, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: col }, g); }
  // 예외 공
  function ball(x, y, label, col, r) { el('circle', { cx: x, cy: y, r: r || 11, fill: col || BAD }); if (label) tx(x + 18, y + 5, label, { 'font-size': 13.5, 'font-weight': 800, fill: col || BAD }); }
  // catch 그물 (가로 점선)
  function net(x1, x2, y, label, col, op, hole) { el('line', { x1, y1: y, x2, y2: y, stroke: col, 'stroke-width': 3, 'stroke-dasharray': '10 5', opacity: op });
    if (hole) el('rect', { x: hole - 18, y: y - 4, width: 36, height: 8, fill: PANEL, opacity: op });
    mono(x1, y - 10, label, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: op }); }
  // 깃발 (취소 플래그)
  function flag(x, y, on, s) { if (s <= 0) return; const g = R.G(x, y, s);
    el('line', { x1: 0, y1: 0, x2: 0, y2: -40, stroke: INK, 'stroke-width': 2.5 }, g);
    el('path', { d: 'M0,-40 L26,-32 L0,-24 Z', fill: on ? BAD : OFF }, g);
    tx(32, -26, on ? '취소 플래그 ON' : '플래그 OFF', { 'font-size': 13.5, 'font-weight': 700, fill: on ? BAD : MUT }, g); }
  // 도는 고리 (루프)
  function loopRing(cx, cy, r, t, col, checks) { el('circle', { cx, cy, r, fill: 'none', stroke: col, 'stroke-width': 3, opacity: 0.35 });
    const a = t * 4; el('path', { d: `M${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a + 1.6)},${cy + r * Math.sin(a + 1.6)}`, fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round' });
    if (checks) { el('rect', { x: cx - 8, y: cy - r - 8, width: 16, height: 16, rx: 3, fill: GOOD }); } }

  // ---------- 1. 협력적 취소: 확인 지점이 있어야 멈춘다 ----------
  const BX = 330, BW = 560, CUT = BX + 120;
  function laneBar(y, f, col, label) { el('rect', { x: BX, y: y - 12, width: BW, height: 24, rx: 5, fill: SOFT, stroke: GRID });
    if (f > 0) el('rect', { x: BX, y: y - 12, width: BW * f, height: 24, rx: 5, fill: col, opacity: 0.8 });
    if (label) mono(BX + BW, y - 20, label, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }); }
  function s1(t, c) { const { k, u } = c;
    // 위 레인: 취소를 무시하는 job
    mono(30, 70, 'val job = launch(Dispatchers.Default)', { 'font-size': 14.5, 'font-weight': 800, opacity: ap(k, 0, u, 0.1) > 0 ? 1 : 0 });
    loopRing(110, 140, 36, k >= 1 ? t : 0, k >= 2 ? BAD : ACC, false);
    mono(110, 145, 'while(i<n)', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700 });
    tx(170, 150, '확인 지점 0개', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: k >= 1 ? (k === 1 ? fade(u, 0.9) : 1) : 0 });
    const jf = k === 0 ? 0 : k === 1 ? lerp(0.02, 0.35, E(u, 0.2, 2.4)) : k === 2 ? lerp(0.35, 1, E(u, 0.4, 2.6)) : 1;
    laneBar(140, jf, k >= 2 ? BAD : ACC, 'i = 0 … 1,000,000');
    mono(BX, 176, k === 0 ? 'i = 0' : k >= 3 || jf > 0.999 ? 'i = 1,000,000' : 'i 증가 중 …', { 'font-size': 14.5, 'font-weight': 700, fill: k >= 2 ? BAD : ACC });
    if (k >= 2) { el('line', { x1: CUT, y1: 100, x2: CUT, y2: 330, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      mono(CUT - 8, 100, 'delay(50) → cancelAndJoin()', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'end' });
      flag(CUT + 14, 128, true, ap(k, 2, u, 0.2));
      if (k === 2) { note(BX + 200, 214, 'join이 계산 끝까지 기다린다', fade(u, 1.4), { fill: BAD }); } }
    // 아래 레인: 협력하는 safe
    const so = k >= 3 ? 1 : 0.25;
    mono(30, 250, 'val safe = launch(Dispatchers.Default)', { 'font-size': 14.5, 'font-weight': 800, opacity: so });
    loopRing(110, 320, 36, k >= 3 ? t : 0, k === 4 && u > 1.2 ? OFF : GOOD, k >= 3);
    mono(110, 325, 'isActive?', { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: so });
    if (k < 3) { laneBar(320, 0, GOOD); tx(BX + 10, 360, '아래에서 곧 띄울 안전한 버전', { 'font-size': 14, fill: MUT }); return; }
    const sf = k === 3 ? lerp(0, 0.2, E(u, 0.2, 2.6)) : Math.min(lerp(0.2, 0.25, E(u, 0.1, 1.0)), (CUT - BX) / BW + 0.012);
    laneBar(320, sf, GOOD, 'ensureActive()는 1000번마다');
    for (let i = 1; i < 30; i++) { const x = BX + i * 12; if (x > BX + BW * sf) break; el('line', { x1: x, y1: 306, x2: x, y2: 334, stroke: PANEL, 'stroke-width': 1.5 }); }
    if (k === 3) { note(BX, 372, '흰 금 = 매 반복 플래그를 읽는 자리', fade(u, 1.0), { fill: GOOD }); return; }
    flag(CUT + 14, 300, true, pop(u, 0.2));
    if (u > 1.0) { cross(BX + BW * sf + 16, 320, 13, pop(u, 1.0)); mono(BX + BW * sf + 40, 326, 'CancellationException', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) }); }
    banner(480, 398, 'safe는 곧 멈추고, job은 계산이 끝나야 멈춘다', pop(u, 2.0)); }

  // ---------- 2. CancellationException 을 삼키지 마라 ----------
  function s2(t, c) { const { k, u } = c;
    // 왼쪽: badWork
    zone(30, 40, 420, 350, 'suspend fun badWork()', { fill: k >= 2 ? SOFT : SOFT, color: BAD });
    const LX = 240, DL = 330, NET = 230;
    loopRing(LX, DL - 10, 50, k <= 1 ? t : 0, k === 1 ? BAD : ACC, false);
    mono(LX, DL - 5, 'delay(100)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700 });
    net(60, 420, NET, 'catch (e: Exception)', BAD, 1);
    if (k === 0) { const f = E(u, 0.5, 1.6); if (u > 0.4) ball(LX, lerp(DL - 60, NET + 14, f), 'CancellationException');
      note(60, 120, 'cancel() → delay가 예외를 던진다', fade(u, 0.2)); note(60, 146, '에러가 아니라 정상 취소 신호', fade(u, 0.8), { fill: MUT }); }
    if (k === 1) { const cyc = (t * 0.9) % 1; ball(LX, lerp(DL - 60, NET + 14, E(cyc, 0, 0.5)), null, BAD, 9);
      const n = Math.floor(E(u, 0.3, 2.6) * 6);
      for (let i = 0; i < n; i++) mono(70, 98 + i * 20, 'log("무시")', { 'font-size': 14, fill: BAD, opacity: 0.4 + 0.6 * (i + 1) / n });
      note(250, 120, '잡히고 → 루프가 다시 돈다', fade(u, 0.6), { fill: BAD }); note(250, 146, '취소가 무효화 · 누수', fade(u, 1.4), { fill: BAD, 'font-weight': 800 }); }
    if (k >= 2) { mono(70, 120, 'log("무시") ×∞', { 'font-size': 14.5, fill: BAD, 'font-weight': 700 }); tx(LX, 376, '누수', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD }); }
    if (k < 2) return;
    // 오른쪽: goodWork
    const RX = 700, rz = ap(k, 2, u, 0.1);
    zone(500, 40, 430, 350, 'suspend fun goodWork()', { color: GOOD, op: clamp(rz) });
    const closed = k === 4 && u > 1.6;
    card(RX, 82, 200, 36, { rx: 18, text: closed ? 'conn 닫힘' : 'conn 열림', fs: 14.5, mono: true, fw: 800, stroke: closed ? MUT : WARN, color: closed ? MUT : WARN, fill: closed ? SOFT : WARNBG, s: rz });
    loopRing(RX, DL - 10, 50, k === 2 ? t : 0, ACC, false); mono(RX, DL - 5, 'delay(100)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, opacity: clamp(rz) });
    const n1 = 240, n2 = 160;
    net(520, 910, n1, 'catch (e: CancellationException) → throw e', INFO, gr(k, 3, u, 0.1, 0.4), k >= 3 ? RX : null);
    if (k === 2) { note(520, 160, '닫아야 할 자원을 쥐고 루프를 돈다', fade(u, 0.8)); return; }
    if (k === 3) { const f = E(u, 0.4, 2.2); ball(RX, lerp(DL - 60, 100, f), f > 0.3 && f < 0.6 ? 'throw e' : null);
      note(520, 128, '잡자마자 다시 던져 통과시킨다', fade(u, 1.6), { fill: INFO }); return; }
    // k4: finally + NonCancellable
    el('rect', { x: 516, y: 120, width: 398, height: 76, rx: 10, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.1) });
    mono(530, 142, 'finally { withContext(NonCancellable) {', { 'font-size': 13.5, 'font-weight': 700, fill: GOOD });
    [['conn.flush()', 0.5], ['conn.close()', 1.0]].forEach(([s, a], i) => { mono(560 + i * 170, 176, s, { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) }); check(545 + i * 170, 171, 7, pop(u, a + 0.2)); });
    const f = E(u, 1.5, 2.5); ball(RX, lerp(150, 50, f), u > 1.5 ? null : null, BAD, 9);
    if (u > 2.4) pill(RX, 404, '정리 후 취소가 계속 위로 → 정상 종료', GOOD, pop(u, 2.4), { fs: 13.5 }); }

  // ---------- 3. 자식 실패 → 부모 취소 → 형제 취소 ----------
  const P = [480, 78], KID = [[220, 220, 'user', 'loadUser()'], [480, 220, 'posts', 'loadPosts()'], [740, 220, 'ads', 'loadAds()']];
  function tree(k, u, sts, rootName, rootSt, appearAt) {
    KID.forEach(([x, y], i) => grow(P[0], P[1] + 26, x, y - 28, gr(k, appearAt, u, 0.4 + i * 0.15, 0.5), GRID, { plain: true, sw: 3 }));
    node(P[0], P[1], rootName, rootSt, ap(k, appearAt, u, 0.1), { w: 230 });
    KID.forEach(([x, y, n, f], i) => node(x, y, `async { ${f} }`, sts[i], ap(k, appearAt, u, 0.7 + i * 0.2), { w: 210, tag: `${n} · ${ST[sts[i]][2]}` })); }
  function s3(t, c) { const { k, u } = c;
    const sts = k === 0 ? ['run', 'run', 'run'] : k === 1 ? ['run', 'fail', 'run'] : ['cancel', 'fail', 'cancel'];
    const rs = k === 0 ? 'run' : k === 1 ? (u > 1.4 ? 'cancelling' : 'run') : 'cancel';
    if (k === 2 && u < 1.2) { sts[0] = 'run'; sts[2] = 'run'; }
    tree(k, u, sts, 'coroutineScope', rs, 0);
    if (k === 1) { if (u > 0.2) ball(480, 268, 'IOException', BAD, 9); dot([[480, 194], [480, 106]], seg(u, 0.7, 1.4), BAD, 9); note(560, 150, '자식 실패 → 부모로', fade(u, 1.2), { fill: BAD }); }
    if (k === 2) { [0, 2].forEach((i) => dot([[P[0], P[1] + 26], [KID[i][0], KID[i][1] - 28]], seg(u, 0.3, 1.1), BAD, 8));
      note(300, 320, '멀쩡하던 user·ads도 함께 취소', fade(u, 1.4), { fill: BAD, 'font-size': 16 }); }
    if (k >= 3) { const y = 330, op = k === 3 ? fade(u, 0.2) : 1;
      mono(110, y, 'UiState(user.await(), posts.await(), ads.await())', { 'font-size': 15, 'font-weight': 700, opacity: op * (k === 4 ? 0.4 : 1) });
      if (k === 3) { cross(560, y - 5, 14, pop(u, 1.0)); grow(P[0] + 115, P[1], 900, P[1], E(u, 1.2, 1.8), BAD);
        mono(900, P[1] - 12, 'IOException', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.8) });
        note(110, 372, 'UiState 생성까지 가지 못한다 · coroutineScope가 예외를 다시 던진다', fade(u, 1.6), { fill: BAD, 'font-size': 14 }); } }
    if (k === 4) { // 호출부: 화면 전체가 에러
      mono(110, 372, 'catch (e: IOException) { showError(e) }', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      const sx = 820, sy = 340; card(sx, sy, 150, 120, { rx: 10, stroke: INK, s: pop(u, 0.6) });
      if (u > 0.9) { el('rect', { x: sx - 62, y: sy - 46, width: 124, height: 92, rx: 6, fill: BADBG, stroke: BAD, opacity: fade(u, 1.0) });
        tx(sx, sy + 5, '화면 전체 에러', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.1) }); }
      note(300, 296, '위젯 하나 실패 → 화면 전체 실패', fade(u, 1.6), { fill: BAD }); } }

  // ---------- 4. supervisorScope: 실패를 격리한다 ----------
  const KS = [[150, 250, 'user'], [330, 250, 'posts'], [510, 250, 'ads']], SP = [330, 70];
  function screen(x, y, st, s) { card(x, y, 220, 250, { rx: 12, stroke: INK, sw: 2.5, s });
    if (s <= 0) return; ['user', 'posts', 'ads'].forEach((n, i) => { const yy = y - 80 + i * 78, v = st[i];
      el('rect', { x: x - 90, y: yy - 28, width: 180, height: 60, rx: 8, fill: v === 'done' ? GOODBG : v === 'empty' ? SOFT : PANEL, stroke: v === 'done' ? GOOD : v === 'empty' ? OFF : GRID, 'stroke-dasharray': v === 'empty' ? '5 4' : null, opacity: clamp(s) });
      tx(x, yy + 7, v === 'done' ? `${n} ✓` : v === 'empty' ? `${n} · 비어 있음` : `${n} 로딩…`, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: v === 'done' ? GOOD : MUT, opacity: clamp(s) }); }); }
  function s4(t, c) { const { k, u } = c;
    node(SP[0], SP[1], 'supervisorScope', 'run', ap(k, 0, u, 0.1), { w: 230, tag: '부모 · 살아 있음' });
    const bf = gr(k, 0, u, 0.6, 0.8);
    el('rect', { x: SP[0] - 240 * bf, y: 118, width: 480 * bf, height: 12, rx: 6, fill: WARN, opacity: 0.85 });
    if (bf > 0.5) tx(SP[0] + 250, 129, '전파 차단', { 'font-size': 14, 'font-weight': 800, fill: WARN, opacity: bf });
    if (k === 0) { note(110, 330, 'coroutineScope를 supervisorScope로 바꾸는 한 줄', fade(u, 1.4)); note(110, 356, '자식 실패가 위로 올라가지 않는다', fade(u, 1.8), { fill: WARN }); return; }
    // 핸들러
    const hs = ap(k, 1, u, 0.2);
    card(330, 380, 400, 44, { rx: 10, stroke: INFO, fill: INFOBG, s: hs });
    if (hs > 0) mono(330, 385, 'handler: log("위젯 실패: …")', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: clamp(hs) });
    if (k === 1) { note(110, 250, '전파가 끊기면 실패를 받을 곳이', fade(u, 0.9)); note(110, 276, '자식 쪽에 따로 있어야 한다', fade(u, 1.2), { fill: INFO }); return; }
    const sts = k === 2 ? ['run', 'run', 'run'] : ['done', 'fail', 'done'];
    if (k === 3 && u < 1.0) { sts[0] = 'run'; sts[2] = 'run'; }
    KS.forEach(([x, y, n], i) => { grow(x, 130, x, y - 28, gr(k, 2, u, 0.2 + i * 0.15, 0.4), GRID, { plain: true, sw: 3 });
      node(x, y, `launch(handler)`, sts[i], ap(k, 2, u, 0.5 + i * 0.2), { w: 168, tag: `${n} · ${ST[sts[i]][2]}` }); });
    const scr = k === 2 ? ['load', 'load', 'load'] : k === 3 ? (u < 1.0 ? ['load', 'load', 'load'] : ['done', 'empty', 'done']) : ['done', 'empty', 'done'];
    screen(790, 220, scr, ap(k, 2, u, 0.3));
    if (k === 3) { if (u > 0.2) ball(330, 300, null, BAD, 9);
      dot([[330, 278], [330, 356]], seg(u, 0.4, 1.0), BAD, 9);
      if (u > 0.5) { cross(330, 148, 10, pop(u, 0.5)); tx(350, 160, '위로 안 감', { 'font-size': 13.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) }); } }
    if (k === 4) { el('rect', { x: 20, y: 296, width: 620, height: 54, rx: 8, fill: PANEL, stroke: GRID, opacity: fade(u, 0.1) });
      mono(34, 318, 'val adResult = try { ads.await() }', { 'font-size': 14, 'font-weight': 700 });
      mono(34, 340, '               catch (e: Exception) { null }', { 'font-size': 14, 'font-weight': 700, fill: INFO });
      fly(560, 318, 600, 340, seg(u, 0.8, 1.6), 'null', { fill: INFO, mono: true, stay: true });
      note(660, 66, 'async 자식은 handler가 아니라', fade(u, 1.2), { 'font-size': 14 }); note(660, 90, 'await 자리에서 예외가 나온다', fade(u, 1.4), { 'font-size': 14, fill: INFO }); } }

  // ---------- 5. 운영 체크리스트 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // handler 는 최상위 launch 에만
      node(480, 80, 'scope.launch(handler)', 'done', pop(u, 0.2), { w: 260, tag: 'handler 동작' });
      [[260, 'launch(handler)', '자식 · 무시됨'], [700, 'async(handler)', 'await가 던진다']].forEach(([x, n, tg], i) => {
        grow(480, 106, x, 222, E(u, 0.6 + i * 0.3, 1.1 + i * 0.3), GRID, { plain: true, sw: 3 });
        node(x, 250, n, 'fail', pop(u, 1.0 + i * 0.3), { w: 220, tag: tg }); });
      note(300, 360, 'CoroutineExceptionHandler는 최상위 launch에서만 쓰인다', fade(u, 1.9), { fill: INFO }); return; }
    if (k === 1) { // 수명 막대
      const X = 200, W = 640, close = X + 380;
      R.axes(X, 90, W, 230, { x: [0, 1], y: [0, 1] });
      tx(X + W, 350, '시간', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
      el('rect', { x: X, y: 100, width: 380 * E(u, 0.2, 0.8), height: 30, rx: 5, fill: INFOBG, stroke: INFO });
      tx(X + 8, 121, '화면이 열려 있는 동안', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.5) });
      el('line', { x1: close, y1: 90, x2: close, y2: 320, stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 0.8) });
      tx(close + 6, 84, '화면 닫힘', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.8) });
      const gl = E(u, 1.0, 2.4); tx(X - 12, 185, 'GlobalScope', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: BAD });
      el('rect', { x: X + 40, y: 170, width: (W - 40) * gl, height: 28, rx: 5, fill: BAD, opacity: 0.8 }); if (gl > 0.9) tx(X + W - 8, 160, '계속 돈다 · 누수', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
      const vm = E(u, 1.0, 2.0); tx(X - 12, 255, 'viewModelScope', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: GOOD });
      el('rect', { x: X + 40, y: 240, width: (340) * vm, height: 28, rx: 5, fill: GOOD, opacity: 0.8 }); if (vm > 0.95) tx(close + 10, 260, '함께 취소', { 'font-size': 14, 'font-weight': 800, fill: GOOD });
      return; }
    if (k === 2) { zone(240, 60, 480, 270, 'scope (주입받은 viewModelScope)', { fill: ACCBG, color: ACC });
      node(480, 190, 'refresh()', 'run', pop(u, 0.4), { w: 200, tag: 'scope.launch(handler)' });
      card(480, 280, 220, 36, { rx: 8, text: 'handler 부착', fs: 14, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 1.0) });
      note(260, 380, '화면과 수명을 같이하는 최상위 launch라 handler가 동작한다', fade(u, 1.6), { 'font-size': 14 }); return; }
    if (k === 3) { // Main ↔ IO 레인
      const X0 = 200, W = 660; [['Main', 140, ACC], ['IO 풀', 250, INFO]].forEach(([n, y, col]) => { tx(X0 - 12, y + 5, n, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end' }); el('rect', { x: X0, y: y - 18, width: W, height: 36, rx: 6, fill: PANEL, stroke: GRID }); });
      const segs = [[0, 0.2, 140, ACC, 'launch'], [0.2, 0.7, 250, INFO, 'api.fetch()'], [0.7, 1, 140, ACC, 'render(data)']];
      const f = E(u, 0.2, 2.4);
      segs.forEach(([a, b, y, col, lab]) => { if (f <= a) return; const w = (Math.min(b, f) - a) * W; el('rect', { x: X0 + a * W, y: y - 15, width: w, height: 30, rx: 5, fill: col, opacity: 0.85 }); if (w > 70) tx(X0 + a * W + 10, y + 5, lab, { 'font-size': 14, 'font-weight': 700, fill: PANEL, class: 'mono' }); });
      if (f > 0.2) grow(X0 + 0.2 * W, 158, X0 + 0.2 * W, 232, 1, INFO); if (f > 0.7) grow(X0 + 0.7 * W, 232, X0 + 0.7 * W, 158, 1, ACC);
      note(200, 340, 'withContext는 IO로 잠깐 옮겼다 돌아온다 · 그 자체가 취소 확인 지점', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 4) { // catch 두 단
      net(120, 840, 230, 'catch (e: CancellationException) { throw e }', INFO, 1, 300);
      net(120, 840, 140, 'catch (e: Exception) { showError(e) }', WARN, 1);
      const f1 = E(u, 0.2, 1.4); ball(300, lerp(340, 40, f1), f1 < 0.2 ? 'CancellationException' : null, INFO, 10);
      if (u > 1.4) tx(320, 60, '통과 → 위로', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.4) });
      const f2 = E(u, 1.2, 2.2); ball(640, lerp(340, 154, f2), f2 < 0.2 ? 'IOException' : null, BAD, 10);
      if (u > 2.2) pill(640, 90, 'showError(e)', WARN, pop(u, 2.2), { mono: true, fs: 13.5 });
      note(120, 390, '취소는 흘려보내고, 진짜 에러만 화면에 알린다', fade(u, 2.3)); return; }
    // k5: 화면이 닫히면 scope 와 함께
    const off = E(u, 0.8, 1.8);
    zone(200, 50, 560, 250, 'viewModelScope', { fill: off > 0.5 ? SOFT : ACCBG, color: off > 0.5 ? MUT : ACC });
    [[320, 150], [480, 150], [640, 150], [400, 240], [560, 240]].forEach(([x, y], i) => node(x, y, `job ${i + 1}`, off > 0.2 + i * 0.1 ? 'cancel' : 'run', 1, { w: 120 }));
    pill(480, 340, 'scope 취소 → 안의 코루틴 전부 정리', GOOD, pop(u, 2.0), { fs: 14 });
    if (u > 0.4) R.browser(860, 120, 120, 90, '화면', { s: 1 - E(u, 0.4, 1.0) * 0.4, op: 1 - E(u, 0.4, 1.0) * 0.6 }); }

  const quiz = [
    { q: '정지 함수가 없는 계산 루프를 cancelAndJoin()으로 멈추려 하면 어떻게 되는가?',
      o: ['루프가 끝까지 돌고 나서야 멈추고, 그동안 join이 기다린다', '스레드가 그 자리에서 강제로 멈춘다', '루프 한가운데서 CancellationException이 저절로 난다'], a: 0,
      why: 'cancel()은 플래그만 세운다. 루프가 isActive나 ensureActive()로 확인하지 않으면 i가 1,000,000에 닿을 때까지 돈다.' },
    { q: '루프 안의 catch (e: Exception)이 CancellationException까지 잡아 로그만 찍으면 어떻게 되는가?',
      o: ['코루틴이 더 빨리 끝난다', '취소가 무효화되어 루프가 계속 돈다', '부모 Job이 대신 예외를 던진다'], a: 1,
      why: '취소 신호가 그물에 걸려 사라지고 루프가 다시 delay(100)으로 돌아간다. 잡았다면 throw e로 다시 던져야 한다.' },
    { q: 'coroutineScope 안에서 posts가 IOException을 던지면 user와 ads는 어떻게 되는가?',
      o: ['그대로 끝까지 실행된다', 'await를 불러야만 취소된다', '부모가 취소되면서 함께 취소된다'], a: 2,
      why: '자식 실패가 부모 Job을 취소하고, 부모는 남은 자식에게 취소를 내려보낸다. 그 뒤 coroutineScope가 IOException을 다시 던진다.' },
    { q: 'supervisorScope 안에서 launch(handler)로 띄운 posts가 실패하면 어떻게 되는가?',
      o: ['예외는 handler로 가고 user와 ads는 끝까지 돈다', '부모가 취소되어 셋 다 멈춘다', '예외가 어디에도 전달되지 않는다'], a: 0,
      why: 'supervisorScope는 자식 실패를 부모로 올리지 않는다. 그래서 실패한 자식만 끝나고 그 예외는 자식에 단 handler가 받는다.' },
    { q: 'CoroutineExceptionHandler가 실제로 동작하는 곳은 어디인가?',
      o: ['async로 띄운 자식', 'scope.launch 같은 최상위 launch', '일반 부모 아래의 자식 launch'], a: 1,
      why: '일반 자식의 예외는 부모로 올라가고, async의 예외는 await가 던진다. handler는 최상위 launch에서만 쓰인다.' },
  ];

  const summary = [
    'cancel()은 플래그만 세운다. isActive, ensureActive, 정지 함수가 있어야 실제로 멈춘다.',
    'CancellationException은 정상 신호다. 잡았다면 다시 던지고 정리는 finally에서 한다.',
    'coroutineScope에서 자식 하나가 실패하면 부모가 취소되고 형제도 모두 취소된다.',
    '형제를 지키려면 supervisorScope를 쓰고 실패는 handler나 await의 try/catch가 받는다.',
  ];
  const review = [
    { q: '화면을 닫았는데 로그에 "무시"가 계속 찍힌다. 코드에서 먼저 볼 곳은?',
      o: ['delay 값이 너무 작은지', '루프 안 catch (e: Exception)이 CancellationException까지 삼키는지', 'Dispatchers.IO를 썼는지'], a: 1,
      why: '취소 예외를 삼키면 루프가 다시 돌고, 이미 취소된 상태라 delay가 곧바로 또 던진다. CancellationException은 다시 던져야 한다.' },
    { q: '위젯 세 개 중 광고 하나가 실패할 때마다 화면 전체가 에러가 된다. 어떻게 바꾸나?',
      o: ['coroutineScope를 supervisorScope로 바꾸고 각 자식이 실패를 처리하게 한다', 'loadAds 안에 delay를 넣는다', '세 위젯을 GlobalScope에서 띄운다'], a: 0,
      why: 'coroutineScope는 한 자식의 실패로 형제를 모두 취소한다. supervisorScope에서는 광고 칸만 비고 나머지는 그려진다.' },
    { q: '취소된 뒤 finally 안의 conn.flush()가 끝까지 실행되지 않는다. 고칠 방법은?',
      o: ['flush를 try 블록 맨 앞으로 옮긴다', 'catch (e: Throwable)로 모든 예외를 삼킨다', 'finally 안을 withContext(NonCancellable)로 감싼다'], a: 2,
      why: '이미 취소된 코루틴에서는 정지 함수가 곧바로 취소 예외를 던진다. NonCancellable로 감싸면 flush와 close가 끝까지 돈다.' },
  ];

  R.page({ title: '취소와 예외가 흐르는 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
