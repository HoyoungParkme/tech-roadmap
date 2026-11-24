/* II-1-2 channel — 안전한 통신 · 장면 6개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  function gtok(cx, cy, name, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op ?? 1), col = o.col || ACC, r = o.r || 30;
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || ACCBG, stroke: col, 'stroke-width': 2.6 }, g);
    if (name) tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, class: 'mono' }, g);
    return g; }
  const zz = (x, y, op) => { mono(x, y, 'z', { 'font-size': 14, 'font-weight': 800, fill: MUT, opacity: op ?? 1 }); mono(x + 10, y - 12, 'z', { 'font-size': 16, 'font-weight': 800, fill: MUT, opacity: op ?? 1 }); };
  const SX = 100, RX = 860, PY = 140, PL = 190, PR = 770, SW = 64, SG = 12;
  // 버퍼 칸 위치: p = 0 이 맨 오른쪽(먼저 들어온 값, 먼저 나간다)
  const slotX = (p) => PR - 40 - SW / 2 - p * (SW + SG);
  // 채널 그림: 송신 G · 파이프(버퍼 칸) · 수신 G · 아래 hchan 칸
  function chan(t, c, o) { o = o || {}; const { k, u } = c, ch = c.beat.channel, pv = (c.prev && c.prev.channel) || null;
    const cap = ch.capacity, n = Math.max(cap, 1), grow0 = o.grow ? E(u, 0.1, 0.9) : 1;
    // 파이프
    const pw = (PR - PL) * grow0;
    el('rect', { x: PL, y: PY - 42, width: pw, height: 84, rx: 16, fill: o.nil ? 'none' : SOFT, stroke: ch.danger ? BAD : o.nil ? OFF : INFO, 'stroke-width': 2.6, 'stroke-dasharray': o.nil ? '8 7' : null });
    if (grow0 >= 1 && !o.nil) mono(PL + 14, PY - 52, o.type || 'chan int', { 'font-size': 14.5, 'font-weight': 800, fill: INFO });
    if (grow0 >= 1 && !o.nil) mono(PR - 14, PY - 52, cap ? 'cap ' + cap : '용량 0', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' });
    for (let p = 0; p < n && grow0 >= 1 && !o.nil; p++) el('rect', { x: slotX(p) - SW / 2, y: PY - 26, width: SW, height: 52, rx: 8, fill: cap ? PANEL : 'none', stroke: cap ? GRID : OFF, 'stroke-width': 1.8, 'stroke-dasharray': cap ? null : '5 5' });
    if (!cap && grow0 >= 1 && !o.nil) tx(slotX(0), PY + 5, '칸 없음', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    // 버퍼 값: 앞 beat 에서 이어진다
    const cur = ch.slots || [], prev = pv ? pv.slots || [] : cur;
    const vbox = (x, v, op) => { card(x, PY, SW - 8, 44, { rx: 7, fill: ACCBG, stroke: ACC, sw: 2.2, op }); mono(x, PY + 6, String(v), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: op ?? 1 }); };
    if (cur.length >= prev.length) { cur.forEach((v, j) => { if (j < prev.length) return vbox(slotX(j), v);
        const a = seg(u, 0.2 + (j - prev.length) * 0.4, 0.75 + (j - prev.length) * 0.4); if (a >= 1) vbox(slotX(j), v); else if (a > 0) fly(SX + 40, PY, slotX(j), PY, a, String(v), { mono: true }); }); }
    else { const r = prev.length - cur.length, e = E(u, 0.3, 1.4);
      prev.slice(0, r).forEach((v, j) => { const a = seg(u, 0.2 + j * 0.35, 0.9 + j * 0.35); if (a <= 0) vbox(slotX(j), v); else if (a < 1) fly(slotX(j), PY, RX - 40, PY, a, String(v), { mono: true }); });
      cur.forEach((v, j) => vbox(slotX(j + r * (1 - e)), v)); }
    // 닫힘: 입구를 막는다
    if (ch.closed) { const s = pv && !pv.closed ? pop(u, 0.3) : 1;
      el('rect', { x: PL - 6, y: PY - 50, width: 12, height: 100, rx: 4, fill: BAD, opacity: s });
      pill(PL + 60, PY + 64, 'closed', BAD, s, { mono: true, fs: 14 }); }
    // 송신 · 수신 goroutine
    const blocked = ch.blockedSend, hot = ch.danger;
    if (o.noS) { el('circle', { cx: SX, cy: PY, r: 30, fill: 'none', stroke: OFF, 'stroke-width': 2.2, 'stroke-dasharray': '5 5' }); tx(SX, PY + 5, '없음', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT }); }
    else gtok(SX, PY, o.sName || 'G', { col: blocked ? WARN : hot && ch.sending ? BAD : ch.sending ? ACC : MUT, fill: blocked ? WARNBG : hot && ch.sending ? BADBG : ch.sending ? ACCBG : SOFT });
    gtok(RX, PY, o.rName || 'main', { col: ch.receiving ? GOOD : MUT, fill: ch.receiving ? GOODBG : SOFT });
    if (blocked) { zz(SX + 26, PY - 30, fade(u, 0.6)); if (o.held != null) pill(SX, PY - 58, String(o.held), WARN, pv && pv.blockedSend ? 1 : pop(u, 0.3), { mono: true, fs: 14 }); }
    if (o.recvWait) zz(RX + 26, PY - 30, fade(u, 0.6));
    // 손에서 손으로 (용량 0)
    if (ch.flow && !cap && o.held != null) { const a = seg(u, 0.3, 1.4); if (a < 1) fly(SX + 30, PY, RX - 30, PY, a, String(o.held), { mono: true }); else pill(RX, PY - 58, String(o.held), GOOD, 1, { mono: true, fs: 14 }); }
    tx(SX, PY + 56, '송신', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    tx(RX, PY + 56, '수신', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT });
    if (o.labels !== false) { mono(SX - 60, PY + 84, ch.senderLabel, { 'font-size': 13.5, 'font-weight': 700, fill: blocked ? WARN : hot ? BAD : INK, opacity: fade(u, 0.5) });
      mono(RX + 70, PY + 84, ch.receiverLabel, { 'font-size': 13.5, 'font-weight': 700, fill: ch.receiving ? GOOD : INK, 'text-anchor': 'end', opacity: fade(u, 0.5) }); } }
  // 런타임 안의 채널 구조체 (runtime/chan.go 의 hchan 필드 일부)
  function hchan(c, o) { o = o || {}; const { u } = c, ch = c.beat.channel, pv = (c.prev && c.prev.channel) || ch, y = o.y || 300;
    if (o.nil) { card(480, y + 30, 560, 64, { rx: 10, stroke: BAD, sw: 2.2, dash: '6 5', text: 'nilCh == nil · 가리키는 hchan이 아예 없다', fs: 15, color: BAD }); return; }
    tx(60, y - 4, 'hchan (런타임 안의 채널)', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    const q = tween((pv.slots || []).length, (ch.slots || []).length, u), recvq = o.recvq ?? 0, sendq = o.sendq ?? (ch.blockedSend ? 1 : 0);
    [['qcount', Math.round(q), q > 0 ? ACC : INK], ['dataqsiz', ch.capacity, INK], ['closed', ch.closed ? 1 : 0, ch.closed ? BAD : INK], ['sendq', sendq ? '[G]' : '[ ]', sendq ? WARN : INK], ['recvq', recvq ? '[G]' : '[ ]', recvq ? WARN : INK]].forEach(([nm, v, col], i) => {
      const x = 130 + i * 150; card(x, y + 34, 132, 58, { rx: 8, stroke: GRID, sw: 1.6 });
      tx(x, y + 22, nm, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, class: 'mono' });
      mono(x, y + 50, String(v), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col }); });
    mono(480, y + 92, 'len(ch) = qcount · cap(ch) = dataqsiz', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }

  // ---------- 1. 타입 있는 파이프 ----------
  function s1(t, c) { const { k, u } = c;
    chan(t, c, { grow: k === 0, held: 42, sName: 'go', labels: k > 0 });
    if (k === 0) { const a = seg(u, 1.2, 2.0); if (a > 0) { const x = lerp(SX + 20, PL - 30, E(a, 0, 1)); pill(x, PY - 96, '"hi"', BAD, 1, { mono: true, fs: 14 }); }
      if (u > 2.0) { cross(PL - 2, PY - 96, 11, pop(u, 2.0)); tx(PL + 24, PY - 90, 'string은 못 들어간다 (컴파일 오류)', { 'font-size': 14, 'font-weight': 700, fill: BAD }); }
      mono(480, 270, 'ch := make(chan int)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.5) });
      tx(480, 304, 'int만 흐르는 파이프 · 아직 아무도 쓰지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 0.9) });
      return; }
    hchan(c);
    if (k === 2) mono(480, 262, 'v = 42', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
    if (k === 1) tx(480, 262, '값은 아직 파이프 안이 아니라 송신자 손에 있다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) }); }

  // ---------- 2. unbuffered 랑데부: 시간표 ----------
  function s2(t, c) { const { k, u } = c;
    chan(t, c, { held: '"hello"', type: 'chan string', labels: true });
    const X0 = 220, X1 = 860, T = (s) => lerp(X0, X1, s / 1.2);
    const lane = (y, name, col) => { tx(X0 - 16, y + 19, name, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: col }); el('line', { x1: X0, y1: y + 14, x2: X1, y2: y + 14, stroke: GRID, 'stroke-width': 1.5 }); };
    lane(290, '송신 G', ACC); lane(350, 'main', INK);
    [0, 0.5, 1].forEach((s) => mono(T(s), 408, s + 's', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }));
    if (k === 0) { tx(480, 260, '시간표: 누가 언제 멈추는가', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4) }); return; }
    const g = k === 1 ? E(u, 0.2, 2.0) : 1, now = k === 1 ? 1.0 * g : 1.0;
    // 송신: 0초에 "보내는 중..." 뒤 대기
    pill(T(0) + 52, 266, '보내는 중...', ACC, k === 1 ? pop(u, 0.2) : 1, { fs: 13.5 });
    el('rect', { x: T(0), y: 292, width: T(now) - T(0), height: 24, rx: 5, fill: WARNBG, stroke: WARN, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' });
    if (g > 0.4) tx(T(0.5), 309, 'ch <- 에서 대기', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: WARN });
    el('rect', { x: T(0), y: 352, width: T(now) - T(0), height: 24, rx: 5, fill: OFF });
    if (g > 0.4) mono(T(0.5), 369, 'time.Sleep(1s)', { 'text-anchor': 'middle', 'font-size': 13.5, fill: INK });
    if (k === 2) { const s = pop(u, 0.3);
      el('line', { x1: T(1), y1: 280, x2: T(1), y2: 384, stroke: GOOD, 'stroke-width': 3, opacity: s });
      const e = E(u, 1.2, 2.0); el('rect', { x: T(1), y: 292, width: (T(1.2) - T(1)) * e, height: 24, rx: 5, fill: ACC }); el('rect', { x: T(1), y: 352, width: (T(1.2) - T(1)) * e, height: 24, rx: 5, fill: INK, opacity: 0.8 });
      pill(T(1) - 4, 266, '만나는 순간', GOOD, pop(u, 0.5), { fs: 13.5 }); } }

  // ---------- 3. buffered: 칸이 차고, 가득 차면 막힌다 ----------
  function s3(t, c) { const { k, u } = c;
    chan(t, c, { held: k === 2 ? 4 : null, labels: true });
    hchan(c);
    if (k === 2) tx(480, 252, '꺼내 줄 goroutine이 없으면 deadlock (ch <- 4는 코드에서 주석 처리)', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.2) });
    if (k === 3) mono(480, 252, 'fmt.Println(<-ch) → 1 · len 2 · cap 3', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
    if (k === 1) tx(480, 252, '빈 칸이 있으면 송신은 넣고 바로 다음 줄로 간다', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.6) });
    if (k === 0) tx(480, 252, '먼저 들어온 값이 오른쪽 끝에서 먼저 나간다 (FIFO)', { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.8) }); }

  // ---------- 4. close + range ----------
  function s4(t, c) { const { k, u } = c;
    chan(t, c, { sName: 'go', labels: true });
    const out = k === 2 ? ['1', '2'] : k === 3 ? ['1', '2', '3', 'done'] : [];
    const shown = k === 2 ? lerp(0, 2, E(u, 0.8, 1.8)) : k === 3 ? lerp(2, 4, E(u, 0.8, 1.8)) : 0;
    if (k >= 2) terminal(560, 260, 340, 140, out, shown, { title: '출력', lh: 22 });
    if (k >= 2) mono(90, 300, 'for v := range ch {', { 'font-size': 16, 'font-weight': 800, opacity: k === 2 ? fade(u, 0.3) : 1 });
    if (k >= 2) mono(110, 326, 'fmt.Println(v)', { 'font-size': 15, fill: MUT }), mono(90, 352, '}', { 'font-size': 16, 'font-weight': 800 });
    if (k === 1) tx(480, 290, 'close는 값이 아니라 상태다. 남은 1 2 3은 그대로 받을 수 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) });
    if (k === 0) tx(480, 290, '버퍼 3칸이라 1, 2, 3을 보내는 동안 막히지 않는다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.6) });
    if (k === 3) { const s = pop(u, 2.0); if (s > 0) { check(110, 390, 10, s); tx(130, 396, '닫혔고 비었으니 range가 스스로 끝난다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD }); } } }

  // ---------- 5. v, ok ----------
  const ROWS5 = [['1', 'true'], ['4', 'true'], ['9', 'true'], ['16', 'true'], ['25', 'true'], ['0', 'false']];
  function s5(t, c) { const { k, u } = c;
    chan(t, c, { sName: 'go', labels: true, type: 'chan int · jobs' });
    if (k < 2) { tx(480, 300, k === 0 ? '1~5의 제곱을 jobs에 흘려보낸다' : '닫아도 남은 값 5개는 사라지지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: k === 0 ? ACC : BAD, opacity: fade(u, 1.2) }); return; }
    // 받은 기록 표
    const n = k === 2 ? 1 : k === 3 ? 5 : 6, before = k === 2 ? 0 : k === 3 ? 1 : 5;
    const x0 = 300, y0 = 262;
    mono(x0, y0, 'v, ok := <-jobs', { 'font-size': 15, 'font-weight': 800 });
    ['v', 'ok'].forEach((h, i) => tx(x0 + 200 + i * 90, y0, h, { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono', 'text-anchor': 'middle' }));
    const vis = before + (n - before) * E(u, 0.3, 1.6);
    ROWS5.slice(0, n).forEach(([v, ok], i) => { const op = clamp(vis - i); if (op <= 0) return; const x = x0 + 200 + (i % 6) * 0, y = y0 + 22 + i * 22;
      const bad = ok === 'false';
      mono(x, y, v, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: bad ? BAD : INK, opacity: op });
      mono(x + 90, y, ok, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: bad ? BAD : GOOD, opacity: op }); });
    if (k === 4) { pill(x0 + 360, y0 + 132, 'break', BAD, pop(u, 1.8), { mono: true, fs: 14 });
      tx(x0 - 20, y0 + 148, 'v가 0이어도 ok로 닫힘을 구분한다', { 'font-size': 14, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 2.0) }); } }

  // ---------- 6. 실무 함정 ----------
  const MSG6 = ['panic: send on closed channel', 'panic: close of closed channel', '(아무 출력 없이 멈춘다)', 'fatal error: all goroutines are asleep - deadlock!'];
  function s6(t, c) { const { k, u } = c;
    if (k === 2) { chan(t, c, { nil: true, labels: true, sName: 'G' }); zz(RX + 26, PY - 30, fade(u, 0.6)); tx(480, 254, 'make를 안 한 채널은 nil이다. 가리키는 hchan이 아예 없다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.8) }); }
    else { chan(t, c, { labels: true, sName: 'main', rName: 'main', recvWait: k === 3, noS: k === 3 });
      if (k === 0) { const a = seg(u, 0.4, 1.1); if (a > 0 && a < 1) fly(SX + 30, PY, PL - 10, PY, a, '1', { mono: true }); if (a >= 1) { cross(PL - 24, PY - 6, 16, pop(u, 1.1)); } }
      if (k === 1) { const s = pop(u, 0.6); pill(PL + 80, PY - 84, 'close(ch) 두 번째', BAD, s, { mono: true, fs: 14 }); if (u > 1.1) cross(PL + 190, PY - 84, 12, pop(u, 1.1)); }
    }
    terminal(140, 286, 680, 76, ['$ go run pitfalls.go', [MSG6[k], k === 2 ? 'var(--off)' : '#f87171']], lerp(0, 2, E(u, 1.2, 2.2)), {});
    const rule = ['닫힌 채널에 보내면 panic', 'close는 한 번만', '채널은 make로 만든다', '받을 값이 영영 없으면 deadlock'][k];
    tx(480, 394, rule, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); }

  const quiz = [
    { q: 'ch := make(chan int)로 만든 채널에 "hi"를 보내는 코드는 어떻게 되는가?',
      o: ['실행 중에 panic이 난다', '컴파일 단계에서 막힌다', '0으로 바뀌어 들어간다'], a: 1,
      why: '채널은 타입이 있는 파이프다. chan int에는 int만 흐를 수 있어 다른 타입은 컴파일 오류가 된다.' },
    { q: 'unbuffered 채널에서 송신 goroutine이 ch <- "hello" 다음 줄을 실행하는 때는 언제인가?',
      o: ['main이 <-ch로 값을 받아 간 뒤', '값을 채널 안에 넣어 둔 즉시', '1초가 지나 타이머가 풀릴 때'], a: 0,
      why: '용량 0이라 값을 둘 칸이 없다. 받는 쪽이 나타나 손에서 손으로 넘겨야 둘 다 풀린다.' },
    { q: 'make(chan int, 3)에 1, 2, 3을 넣고 <-ch로 하나 꺼낸 뒤 len(ch), cap(ch)는 무엇인가?',
      o: ['3 3', '2 2', '2 3'], a: 2,
      why: 'len은 지금 담긴 개수라 2, cap은 만들 때 정한 칸 수라 3 그대로다. 먼저 넣은 1이 먼저 나온다.' },
    { q: '생산자가 close(ch)를 한 뒤 버퍼에 남은 1, 2, 3은 어떻게 되는가?',
      o: ['range로 모두 받을 수 있고, 다 비면 range가 끝난다', 'close와 함께 버려진다', '받으려 하면 panic이 난다'], a: 0,
      why: 'close는 더 보낼 값이 없다는 상태 표시다. 남은 값은 그대로 수신되고, 비고 나서야 range가 끝난다.' },
    { q: '닫혔고 비어 있는 jobs에서 v, ok := <-jobs를 실행하면 결과는 무엇인가?',
      o: ['v = 25, ok = true', 'v = 0, ok = false', '값이 올 때까지 멈춘다'], a: 1,
      why: '닫히고 빈 채널은 즉시 zero 값과 false를 돌려준다. 그래서 0이라는 값과 닫힘을 ok로 구분한다.' },
    { q: 'var nilCh chan int로 선언만 하고 nilCh <- 1을 실행하면 어떻게 되는가?',
      o: ['panic: send on nil channel이 난다', '값이 버려지고 다음 줄로 간다', 'panic 없이 그 자리에서 영원히 멈춘다'], a: 2,
      why: 'nil 채널의 송신과 수신은 영원히 블로킹된다. 다른 goroutine이 살아 있으면 아무 메시지도 남지 않아 찾기 어렵다.' },
  ];

  const summary = [
    '채널은 타입이 있는 파이프라서 chan int에는 int만 흐른다.',
    '용량 0 채널은 보내는 쪽과 받는 쪽이 만나야 값이 넘어가고, 그때 둘 다 풀린다.',
    '버퍼 채널은 cap만큼 담아 두고, 가득 차면 송신이 멈춘다. len은 담긴 개수다.',
    'close는 보내는 쪽이 한 번만 한다. 받는 쪽은 range나 v, ok로 닫힘을 안다.',
  ];
  const review = [
    { q: '여러 goroutine이 같은 결과 채널에 보내는데, 수신 쪽 goroutine이 일을 마치며 close(results)를 했더니 가끔 프로그램이 죽는다. 원인은?',
      o: ['아직 보내던 goroutine이 닫힌 채널에 송신해 panic이 났다', '버퍼 크기가 너무 커서 메모리가 모자랐다', 'range가 닫힌 채널을 읽지 못했다'], a: 0,
      why: '닫는 책임은 보내는 쪽에 있다. 받는 쪽이 닫으면 늦게 보내던 송신자가 send on closed channel로 panic한다.' },
    { q: '소비자 루프가 v := <-jobs로만 받는데, 생산자가 close한 뒤 끝없이 0을 처리하며 돈다. 어떻게 고치는가?',
      o: ['jobs 버퍼를 더 크게 만든다', 'v, ok := <-jobs로 받고 ok가 false면 빠져나온다', '생산자에서 close를 뺀다'], a: 1,
      why: '닫히고 빈 채널은 계속 zero 값을 즉시 돌려준다. ok로 닫힘을 확인하거나 for range로 받아야 끝난다.' },
    { q: 'main 하나만 있는 프로그램에서 ch := make(chan int, 3)에 값을 네 번 연달아 보냈다. 무슨 일이 생기는가?',
      o: ['네 번째 값이 첫 값을 덮어쓴다', '버퍼가 자동으로 4칸으로 늘어난다', '네 번째 송신에서 멈추고 런타임이 deadlock으로 끝낸다'], a: 2,
      why: '버퍼는 3칸이 다다. 꺼내 줄 goroutine이 없으니 모두 멈춘 상태가 되어 all goroutines are asleep 오류가 난다.' },
  ];

  R.page({ title: '채널 안을 들여다보기', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
