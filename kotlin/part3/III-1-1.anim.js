/* III-1-1 suspend 함수와 코루틴 기초 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 지역 도우미 ----------
  // Kotlin 코드 조각: 키워드 굵게, 문자열 ACC, // 주석 MUT. o.hi 강조 줄 번호(0부터), o.show 보이는 줄 수(소수면 마지막 줄 타이핑)
  const KW = /^(fun|val|var|suspend|return|if|else|for|while|in|try|catch|finally|class|private|import|throw|null|true|false|object|when)$/;
  function ktok(line) { const out = []; let i = 0, buf = '';
    const flush = () => { if (!buf) return; buf.split(/(\b\w+\b)/).forEach((w) => { if (w) out.push([w, KW.test(w) ? { 'font-weight': 700, fill: INFO } : {}]); }); buf = ''; };
    while (i < line.length) { const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') { flush(); out.push([line.slice(i), { fill: MUT }]); return out; }
      if (ch === '"') { flush(); const e = line.indexOf('"', i + 1), end = e < 0 ? line.length : e + 1; out.push([line.slice(i, end), { fill: ACC }]); i = end; continue; }
      buf += ch; i++; }
    flush(); return out; }
  function code(x, y, lines, o) { o = o || {}; const fs = o.fs || 14.5, lh = fs + 9, op = o.op ?? 1;
    const w = o.w || Math.max(...lines.map((s) => R.tw(s, fs))) + 36, h = lines.length * lh + 18;
    el('rect', { x, y, width: w, height: h, rx: 8, fill: SOFT, stroke: o.stroke || GRID, 'stroke-width': o.stroke ? 2 : 1.5, opacity: op });
    lines.forEach((s, i) => { const sh = o.show == null ? 1 : clamp(o.show - i); if (sh <= 0) return;
      const base = y + 12 + fs + i * lh;
      if (o.hi && o.hi.includes(i)) el('rect', { x: x + 6, y: base - fs - 2, width: w - 12, height: lh, rx: 4, fill: o.hiCol || ACCBG, opacity: op });
      R.spans(x + 16, base, ktok(sh < 1 ? s.slice(0, Math.round(s.length * sh)) : s), { 'font-size': fs, opacity: op }); });
    return { w, h, lh, row: (i) => y + 12 + fs + i * lh }; }
  // 스레드 줄(가로): 왼쪽 이름표 + 빈 트랙
  function lane(x, y, w, name, o) { o = o || {};
    el('rect', { x, y: y - 15, width: w, height: 30, rx: 6, fill: SOFT, stroke: GRID, 'stroke-width': 1.2, opacity: o.op ?? 1 });
    tx(x - 10, y + 5, name, { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: o.col || INK, class: 'mono', opacity: o.op ?? 1 }); }
  // 트랙 위 일 조각. st: run(실행) block(블로킹) pause(일시중단) 등
  function blk(x, y, w, st, label, o) { o = o || {}; if (w <= 0.5) return;
    const S = { run: [ACCBG, ACC], block: [BADBG, BAD], pause: [PANEL, INFO], c2: [INFOBG, INFO], c3: [GOODBG, GOOD], cpu: [GOODBG, GOOD], wait: [WARNBG, WARN] }[st] || [ACCBG, ACC];
    el('rect', { x, y: y - 11, width: w, height: 22, rx: 4, fill: S[0], stroke: S[1], 'stroke-width': 1.8, 'stroke-dasharray': st === 'pause' ? '4 3' : null, opacity: o.op ?? 1 });
    if (label && w > R.tw(label, 13.5) + 8) tx(x + w / 2, y + 5, label, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: S[1], opacity: o.op ?? 1, class: o.mono ? 'mono' : null }); }
  // 코루틴 하나: 둥근 알약. st: run / pause(점선) / done / cancel
  function coro(cx, cy, name, st, o) { o = o || {};
    const col = { run: ACC, pause: INFO, done: GOOD, cancel: BAD, wait: WARN }[st] || ACC, fill = { run: ACCBG, pause: PANEL, done: GOODBG, cancel: BADBG, wait: WARNBG }[st] || ACCBG;
    const w = o.w || R.tw(name, 14) + 30, g = R.G(cx, cy, o.s ?? 1, o.op ?? 1);
    el('rect', { x: -w / 2, y: -16, width: w, height: 32, rx: 16, fill, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': st === 'pause' ? '5 4' : null }, g);
    tx(0, 5, name, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: col, class: 'mono' }, g); return g; }
  // 세로 스레드 막대 (풀 안의 스레드)
  function vthread(cx, y0, h, o) { o = o || {}; el('rect', { x: cx - 9, y: y0, width: 18, height: h, rx: 5, fill: o.fill || SOFT, stroke: o.stroke || MUT, 'stroke-width': 1.6, opacity: o.op ?? 1 }); }

  // ---------- 1. 콜백 지옥 — 들여쓰기 피라미드 ----------
  const LV = ['fun loadReceipt(userId, cb) {', 'userRepo.findById(userId) { user ->', 'orderRepo.findByUser(user.id) { order ->', 'paymentRepo.findByOrder(order.id) { pay ->', 'receiptBuilder.build(…) { receipt ->'];
  const lvBox = (d) => ({ x: 34 + d * 34, y: 34 + d * 56, w: 620 - d * 68, h: 340 - d * 66 });
  function nest(d, g, o) { o = o || {}; if (g <= 0) return; const b = lvBox(d);
    el('rect', { x: b.x, y: b.y, width: b.w, height: b.h * g, rx: 8, fill: d % 2 ? SOFT : PANEL, stroke: o.hot ? WARN : d ? MUT : INK, 'stroke-width': d ? 1.6 : 2.2 });
    if (g > 0.15) mono(b.x + 12, b.y + 23, LV[d], { 'font-size': 14, 'font-weight': d ? 600 : 800, fill: d === 4 ? ACC : INK, opacity: seg(g, 0.15, 0.6) }); }
  function depthPanel(c) { const D = [1, 3, 4, 4], d = tween(c.k ? D[c.k - 1] : null, D[c.k], c.u);
    tx(800, 52, '콜백 중첩 깊이', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: MUT });
    mono(800, 100, Math.round(d) + '단', { 'text-anchor': 'middle', 'font-size': 38, 'font-weight': 800, fill: d >= 3.5 ? BAD : d >= 2.5 ? WARN : INK });
    for (let i = 0; i < 4; i++) el('rect', { x: 740 + i * 31, y: 116, width: 26, height: 10, rx: 3, fill: i < Math.round(d) ? (d >= 3.5 ? BAD : WARN) : GRID }); }
  function s1(t, c) { const { k, u } = c;
    const G = [[E(u, 0.2, 0.9), E(u, 1.0, 1.8), 0, 0, 0], [1, 1, E(u, 0.2, 1.0), E(u, 1.0, 1.8), 0], [1, 1, 1, 1, E(u, 0.2, 0.9)], [1, 1, 1, 1, 1]][k];
    G.forEach((g, d) => nest(d, g, { hot: k >= 1 && d >= 2 }));
    depthPanel(c);
    if (k === 0) { const s = pop(u, 1.9); pill(800, 196, 'cb: (Receipt?) -> Unit', ACC, s, { mono: true, fs: 13.5 });
      grow(712, 196, 260, 57, seg(u, 2.1, 2.6), ACC); sub(800, 232, 'return 대신 콜백으로 넘긴다', fade(u, 2.2)); }
    if (k === 1) { [2, 3].forEach((d, i) => { const b = lvBox(d), o = fade(u, 1.2 + i * 0.7);
        grow(34, b.y + 18, b.x - 4, b.y + 18, seg(u, 0.4 + i * 0.8, 1.0 + i * 0.8), WARN, { sw: 2.5 }); });
      sub(800, 196, '한 단계 = 한 칸 더 안으로', fade(u, 1.8), { 'font-size': 14 }); }
    if (k >= 2) { const b = lvBox(4); mono(b.x + 30, b.y + 56, 'cb(receipt)', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: k === 2 ? fade(u, 0.9) : 1 }); }
    if (k === 2) { fly(350, 310, 800, 220, seg(u, 1.2, 2.3), 'receipt', { stay: true, mono: true });
      sub(800, 262, '결과는 맨 안쪽에서 cb 로만 나간다', fade(u, 2.2), { 'font-size': 14 }); }
    if (k === 3) { // null 검사 3곳 + 어디서 끊을지 모르는 취소
      [1, 2, 3].forEach((d, i) => { const b = lvBox(d), y = 168 + i * 40, s = pop(u, 0.2 + i * 0.3);
        grow(b.x + b.w, b.y + 18, 712, y, seg(u, 0.2 + i * 0.3, 0.6 + i * 0.3), BAD, { sw: 1.5, dash: '4 4', plain: true });
        pill(800, y, 'null → cb(null)', BAD, s, { mono: true, fs: 13.5 }); });
      [0, 1, 2, 3].forEach((d, i) => { const b = lvBox(d + 1), s = pop(u, 1.4 + i * 0.2); if (s <= 0) return;
        const g = R.G(b.x - 17, b.y + 40, s); el('circle', { cx: 0, cy: 0, r: 12, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }, g);
        tx(0, 5, '?', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: WARN }, g); });
      tx(800, 310, '취소는 어느 층에서 끊나?', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.9) }); } }

  // ---------- 2. Thread 블로킹 ----------
  const TX0 = 170, TW = 690, ms = (v) => TX0 + (v / 150) * TW;
  function s2(t, c) { const { k, u } = c;
    if (k === 0) {
      const L = ['fun loadReceipt(userId: Long): Receipt {', '    val user = userRepo.findById(userId)', '    val order = orderRepo.findByUser(user.id)', '    val payment = paymentRepo.findByOrder(order.id)', '    return receiptBuilder.build(user, order, payment)', '}'];
      code(40, 40, L, { show: lerp(0, 6, E(u, 0.2, 1.4)), fs: 14 });
      // 오른쪽: Thread-1 이 사슬로 이 함수에 묶인다
      const s = pop(u, 1.5); const g = R.G(800, 140, s);
      el('rect', { x: -22, y: -70, width: 44, height: 140, rx: 8, fill: WARNBG, stroke: WARN, 'stroke-width': 2.4 }, g);
      tx(0, 94, 'Thread-1', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, class: 'mono' }, g);
      for (let i = 0; i < 6; i++) { const x = lerp(600, 774, i / 5); el('ellipse', { cx: x, cy: 140, rx: 11, ry: 6, fill: 'none', stroke: MUT, 'stroke-width': 2.2, opacity: fade(u, 1.9 + i * 0.08) }); }
      tx(480, 330, '콜백 중첩은 사라졌다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) });
      tx(480, 360, '대신 함수가 끝날 때까지 Thread 하나가 붙잡혀 있다', { 'text-anchor': 'middle', 'font-size': 15, fill: WARN, opacity: fade(u, 2.3) });
      return; }
    if (k === 1) {
      const rows = ['Thread-1', 'Thread-2', 'Thread-3'], calls = [['findById', 0], ['findByUser', 50], ['findByOrder', 100]];
      const head = lerp(0, 150, E(u, 0.2, 2.3));
      rows.forEach((n, r) => { const y = 82 + r * 58; lane(TX0, y, TW, n);
        calls.forEach(([nm, a]) => blk(ms(a) + 2, y, Math.max(0, Math.min(head - a, 50)) / 150 * TW - 4, 'block', nm + ' 50ms')); });
      lane(TX0, 82 + 3 * 58, TW, 'Thread-4'); blk(TX0 + 2, 82 + 3 * 58, head / 150 * TW - 4, 'cpu', 'CPU 작업');
      [0, 50, 100, 150].forEach((v) => { el('line', { x1: ms(v), y1: 290, x2: ms(v), y2: 296, stroke: MUT }); mono(ms(v), 314, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
      el('line', { x1: TX0, y1: 290, x2: TX0 + TW, y2: 290, stroke: MUT, 'stroke-width': 1.5 });
      el('line', { x1: ms(head), y1: 56, x2: ms(head), y2: 290, stroke: INK, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' });
      mono(480, 362, '누적 대기 ' + Math.round(head) + 'ms', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD });
      sub(480, 392, '빨간 칸 동안 그 Thread 는 아무 일도 하지 않는다', fade(u, 2.0), { 'font-size': 14.5 });
      return; }
    if (k === 2) { // 1만 명 → Thread 1만 개 → 스택 10GB. 한 칸 = Thread 100개 = 100MB
      const x0 = 70, y0 = 70, cw = 30, ch = 32, gx = 33, gy = 38, fill = lerp(0, 100, E(u, 0.2, 2.0));
      for (let i = 0; i < 100; i++) { const x = x0 + (i % 25) * gx, y = y0 + Math.floor(i / 25) * gy, on = i < fill;
        el('rect', { x, y, width: cw, height: ch, rx: 4, fill: on ? WARN : PANEL, opacity: on ? 0.8 : 1, stroke: on ? 'none' : GRID, 'stroke-width': 1.3 }); }
      tx(x0, 46, '한 칸 = Thread 100개 = 스택 약 100MB (Thread 하나에 약 1MB)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      const n = fill * 100;
      meters(70, 250, 820, [
        { name: '동시 사용자', val: Math.round(n).toLocaleString('en-US') + '명' },
        { name: '필요한 Thread', val: Math.round(n).toLocaleString('en-US') + '개', hot: n > 9000 },
        { name: '스택 메모리', val: n >= 1000 ? (n / 1000).toFixed(1) + 'GB' : Math.round(n) + 'MB', hot: n > 9000, bar: n / 100 },
      ]);
      tx(480, 372, '대부분은 DB 응답을 기다리기만 하는 Thread 다', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    // k === 3: Tomcat maxThreads 200 — 201번째 요청은 대기열
    const x0 = 60, y0 = 74, cs = 24, fillN = lerp(150, 200, E(u, 0.2, 1.2));
    tx(x0, 52, 'Tomcat 스레드 풀 · maxThreads = 200', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    for (let i = 0; i < 200; i++) { const x = x0 + (i % 20) * (cs + 3), y = y0 + Math.floor(i / 20) * (cs + 3), on = i < fillN;
      el('rect', { x, y, width: cs, height: cs, rx: 3, fill: on ? BAD : PANEL, opacity: on ? 0.75 : 1, stroke: on ? 'none' : GRID, 'stroke-width': 1.2 }); }
    mono(x0 + 20 * (cs + 3) - 3, 52, Math.round(fillN) + ' / 200', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' });
    const bx = 640; el('line', { x1: bx, y1: 80, x2: bx, y2: 330, stroke: BAD, 'stroke-width': 4, opacity: fade(u, 1.1) });
    tx(bx + 70, 372, '빈 Thread 없음', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.1) });
    ['201번째', '202번째', '203번째'].forEach((s, i) => { const yy = 130 + i * 62, x = lerp(940, 760, E(u, 1.3 + i * 0.25, 2.0 + i * 0.25));
      coro(x, yy, s, 'wait', { op: fade(u, 1.3 + i * 0.25) }); });
    sub(780, 330, '대기열에서 순서를 기다린다', fade(u, 2.2), { 'font-size': 14 }); }

  // ---------- 3. suspend — 멈췄다 이어 간다 ----------
  function s3(t, c) { const { k, u } = c;
    if (k === 0) {
      const L = ['suspend fun fetchUser(id: Long): User {', '    delay(50)   // 일시중단 지점', '    return User(id, "Alice")', '}'];
      const cd = code(36, 60, L, { hi: [0], show: lerp(0, 4, E(u, 0.2, 1.0)) });
      // 오른쪽: 함수 본문이 delay 자리에서 두 조각(label 0 / label 1)으로 나뉜다
      const sp = E(u, 1.4, 2.0) * 14, gw = E(u, 0.9, 1.4);
      if (gw > 0) { el('rect', { x: 540 - sp, y: 96, width: 170 * gw, height: 48, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
        if (gw > 0.98) el('rect', { x: 710 + sp, y: 96, width: 170, height: 48, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2 }); }
      mono(625 - sp, 126, 'label 0', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      mono(795 + sp, 126, 'label 1', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      sub(625 - sp, 168, '처음 ~ delay(50)', fade(u, 1.6), { 'font-size': 14 }); sub(795 + sp, 168, '이어서 return', fade(u, 1.6), { 'font-size': 14 });
      tx(710, 76, 'suspend 를 붙이면 컴파일러가 이렇게 나눈다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.9) });
      grow(710, 182, 710, 236, seg(u, 1.9, 2.3), INFO);
      card(710, 270, 300, 62, { rx: 10, stroke: INFO, fill: INFOBG, text: 'Continuation\n다음 label · 지역 변수 보관', fs: 14.5, s: pop(u, 2.2) });
      return; }
    if (k === 1 || k === 3) {
      const x0 = 160, w = 740, head = E(u, 0.2, 2.5), hx = x0 + w * head;
      lane(x0, 300, w, 'Thread-1');
      if (k === 1) { // C-1: 실행 → delay(50) 일시중단 → 재개. 그 사이 Thread-1 은 C-2 를 처리
        const S = [[0, 0.2, 'run', 'C-1 실행'], [0.2, 0.75, 'c2', 'C-2 처리'], [0.75, 1, 'run', 'C-1 재개']];
        S.forEach(([a, b, st, nm]) => blk(x0 + w * a + 2, 300, Math.max(0, Math.min(head, b) - a) * w - 4, st, nm));
        lane(x0, 120, w, 'C-1', { col: ACC });
        blk(x0 + 2, 120, Math.min(head, 0.2) * w - 4, 'run', '실행');
        if (head > 0.2) blk(x0 + 0.2 * w + 2, 120, (Math.min(head, 0.75) - 0.2) * w - 4, 'pause', 'delay(50) 일시중단');
        if (head > 0.75) blk(x0 + 0.75 * w + 2, 120, (head - 0.75) * w - 4, 'run', '재개');
        [0.2, 0.75].forEach((a, i) => { if (head > a) grow(x0 + w * a, i ? 138 : 282, x0 + w * a, i ? 282 : 138, seg(head, a, a + 0.06), i ? ACC : INFO, { sw: 2 }); });
        tx(x0 + w * 0.475, 210, '코루틴이 멈춘 동안 Thread 는 놀지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
      } else { // 코루틴 셋이 Thread 하나를 번갈아 쓴다
        const S = [[0, 0.12, 'run', 'C-1'], [0.12, 0.24, 'c2', 'C-2'], [0.24, 0.36, 'c3', 'C-3'], [0.36, 0.5, 'run', 'C-1'], [0.5, 0.62, 'c3', 'C-3'], [0.62, 0.76, 'c2', 'C-2'], [0.76, 0.88, 'run', 'C-1'], [0.88, 1, 'c3', 'C-3']];
        S.forEach(([a, b, st, nm]) => blk(x0 + w * a + 2, 300, Math.max(0, Math.min(head, b) - a) * w - 4, st, nm, { mono: true }));
        const on = (S.find(([a, b]) => head >= a && head < b) || S[S.length - 1])[3];
        [['C-1', 'run', 290], ['C-2', 'c2', 480], ['C-3', 'c3', 670]].forEach(([nm, st, x]) => { const active = on === nm;
          coro(x, 130, nm + (active ? ' 실행' : ' 일시중단'), active ? 'run' : 'pause', { w: 150 });
          if (active) grow(x, 150, x, 280, 1, ACC, { sw: 2, dash: '4 4' }); });
        tx(530, 78, 'Thread 1개 · 코루틴 3개', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.6) });
      }
      el('line', { x1: hx, y1: 96, x2: hx, y2: 322, stroke: INK, 'stroke-width': 1.3, 'stroke-dasharray': '3 3' });
      return; }
    if (k === 2) {
      const L = ['suspend fun loadReceipt(userId: Long): Receipt {', '    val user = fetchUser(userId)', '    val order = fetchOrder(user.id)', '    val payment = fetchPayment(order.id)', '    return Receipt(user, order, payment)', '}'];
      const cd = code(36, 56, L, { fs: 14, w: 500 });
      [1, 2, 3].forEach((i, j) => { const s = pop(u, 0.4 + j * 0.35); pill(596, cd.row(i) - 5, '일시중단', INFO, s, { fs: 13.5 }); });
      // 오른쪽: 콜백 피라미드(4단)가 납작한 한 단으로
      const f = E(u, 1.3, 2.3);
      tx(800, 70, f < 0.5 ? '콜백: 4단' : 'suspend: 1단', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: f < 0.5 ? WARN : GOOD });
      for (let d = 0; d < 4; d++) el('rect', { x: 700 + d * 24 * (1 - f), y: 96 + d * 50, width: 200 - d * 24 * (1 - f), height: 36, rx: 6, fill: f < 0.5 ? WARNBG : GOODBG, stroke: f < 0.5 ? WARN : GOOD, 'stroke-width': 1.8 });
      ['findById', 'findByUser', 'findByOrder', 'build'].forEach((s, d) => mono(712 + d * 24 * (1 - f), 120 + d * 50, s, { 'font-size': 14, fill: INK }));
      tx(480, 360, '중간에 세 번 멈추지만 코드는 위에서 아래로 읽힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) });
      return; }
    // k === 4: 어디서 부를 수 있나
    const rows = [['suspend fun caller() { fetchUser(1) }', true, 'suspend 함수 안'], ['scope.launch { fetchUser(1) }', true, '코루틴 빌더 블록 안'], ['fun main() { fetchUser(1) }', false, '일반 함수 안']];
    rows.forEach(([s, ok, why], i) => { const y = 62 + i * 92, op = fade(u, 0.2 + i * 0.45);
      code(60, y, [s], { stroke: ok ? GOOD : BAD, op, w: 520 });
      tx(600, y + 30, why, { 'font-size': 15, 'font-weight': 700, fill: ok ? GOOD : BAD, opacity: op });
      const s2 = pop(u, 0.5 + i * 0.45); if (ok) check(800, y + 24, 14, s2); else cross(800, y + 24, 13, s2); });
    const eo = fade(u, 1.8);
    el('rect', { x: 60, y: 330, width: 840, height: 56, rx: 8, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: eo });
    mono(76, 352, "Suspend function 'fetchUser' should be called only", { 'font-size': 14, fill: BAD, opacity: eo });
    mono(76, 374, 'from a coroutine or another suspend function', { 'font-size': 14, fill: BAD, opacity: eo }); }

  // ---------- 4. CoroutineScope — launch / async ----------
  // 왼쪽: runBlocking 동네 안의 자식들, 오른쪽: 그 자식의 시간 막대 (0 ~ 1000ms)
  const RW = [138, 220, 302], TL0 = 560, TLW = 340, tms = (v) => TL0 + (Math.min(v, 1000) / 1000) * TLW;
  function s4(t, c) { const { k, u } = c;
    if (k === 4) { // 실무 Scope 고르기
      card(170, 100, 250, 74, { rx: 12, stroke: BAD, text: 'runBlocking\nmain · 테스트 전용', fs: 15, s: pop(u, 0.2) }); cross(300, 68, 12, pop(u, 0.6));
      tx(170, 162, '앱 코드에서 쓰면 Thread 를 막는다', { 'text-anchor': 'middle', 'font-size': 14, fill: BAD, opacity: fade(u, 0.7) });
      [['viewModelScope', 'ViewModel 수명만큼 산다', 0], ['lifecycleScope', 'Activity · Fragment 수명만큼 산다', 1]].forEach(([a, b, i]) => { const y = 72 + i * 84, s = pop(u, 0.8 + i * 0.35);
        coro(500, y, a, 'run', { s, w: 180 }); const bw = E(u, 1.0 + i * 0.35, 1.8 + i * 0.35) * 260;
        el('rect', { x: 610, y: y - 10, width: bw, height: 20, rx: 4, fill: GOODBG, stroke: GOOD, 'stroke-width': 1.6 });
        tx(610, y + 34, b, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.3 + i * 0.35) }); });
      // 아래: 부모 취소 → 자식 모두 취소
      const cx = 480, py = 262, f = E(u, 1.9, 2.6);
      coro(cx, py, 'Scope 취소', f > 0.05 ? 'cancel' : 'run', { s: pop(u, 1.7), w: 150 });
      [-200, 0, 200].forEach((dx, i) => { const red = f > 0.3 + i * 0.2;
        el('line', { x1: cx, y1: py + 16, x2: cx + dx, y2: py + 70, stroke: red ? BAD : GRID, 'stroke-width': 2, opacity: fade(u, 1.7) });
        coro(cx + dx, py + 88, ['launch', 'async', 'async'][i], red ? 'cancel' : 'run', { op: fade(u, 1.7), w: 110 }); });
      return; }
    const zg = k === 0 ? E(u, 0.2, 1.0) : 1;
    el('rect', { x: 30, y: 36, width: 470 * zg, height: 340, rx: 14, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2, opacity: 0.55 + 0.45 * zg });
    mono(50, 66, 'runBlocking {   // CoroutineScope', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: k === 0 ? fade(u, 0.8) : 1 });
    if (k === 0) { tx(265, 200, '이 블록 안에서만', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.2) });
      tx(265, 228, 'suspend 함수를 부를 수 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) }); return; }
    // 시간축
    el('line', { x1: TL0, y1: 340, x2: TL0 + TLW, y2: 340, stroke: MUT, 'stroke-width': 1.5 });
    [0, 500, 1000].forEach((v) => { el('line', { x1: tms(v), y1: 340, x2: tms(v), y2: 346, stroke: MUT }); mono(tms(v), 364, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    const now = k === 1 ? 0 : k === 2 ? lerp(0, 50, E(u, 0.4, 1.6)) : lerp(50, 1000, E(u, 0.6, 2.5));   // 지금 시각(ms)
    const kids = [['launch { }', 'Job', 1000], ['async { fetchUser }', 'Deferred<User>', 50], ['async { fetchOrder }', 'Deferred<Order>', 50]];
    kids.forEach(([nm, hd, dur], i) => { if (i > 0 && k < 2) return;
      const y = RW[i], s = (k === 1 && i === 0) || (k === 2 && i > 0) ? pop(u, 0.2 + (k === 2 ? (i - 1) * 0.25 : 0)) : 1;
      if (s > 0) { el('line', { x1: 56, y1: 76, x2: 56, y2: y, stroke: ACC, 'stroke-width': 2 }); el('line', { x1: 56, y1: y, x2: 76, y2: y, stroke: ACC, 'stroke-width': 2 }); }
      const st = k === 3 && i === 0 ? (now >= 999 ? 'done' : 'pause') : k === 3 ? 'done' : 'run';
      coro(170, y, nm, st, { s, w: 190 });
      pill(390, y, hd, i ? INFO : MUT, s, { mono: true, fs: 13.5 });
      // 해야 할 구간(점선)과 지금까지 지난 구간(채움)
      const plan = i === 0 && k === 1 ? E(u, 0.5, 2.0) : 1;
      el('rect', { x: TL0, y: y - 10, width: Math.max(1, (tms(dur) - TL0) * plan), height: 20, rx: 4, fill: 'none', stroke: i ? INFO : MUT, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', opacity: s > 0 ? 1 : 0 });
      if (now > 0) el('rect', { x: TL0, y: y - 10, width: Math.max(1, tms(Math.min(now, dur)) - TL0), height: 20, rx: 4, fill: i ? INFO : MUT, opacity: 0.55 });
      if (i === 0) mono(TL0 + 8, y - 18, k === 3 ? 'job.join() 이 1000ms 까지 기다린다' : 'delay(1000)', { 'font-size': 13.5, fill: MUT, 'font-weight': 600, opacity: k === 1 ? fade(u, 1.2) : 1 });
      else mono(tms(50) + 8, y + 5, '50ms', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: k === 2 ? fade(u, 1.0) : 1 }); });
    if (k >= 2) { el('line', { x1: tms(now), y1: 104, x2: tms(now), y2: 340, stroke: INK, 'stroke-width': 1.3, 'stroke-dasharray': '3 3' });
      mono(tms(now), 388, Math.round(now) + 'ms', { 'font-size': 14, 'font-weight': 800, 'text-anchor': now > 900 ? 'end' : 'middle' }); }
    if (k === 2) tx(TL0 + 80, 186, '두 async 가 같은 순간에 시작', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.3) });
    if (k === 3) { // await: 두 값을 걷어 온다
      [1, 2].forEach((i, j) => fly(390, RW[i], 265, 350, seg(u, 0.2 + j * 0.25, 0.9 + j * 0.25), i === 1 ? 'user' : 'order', { mono: true, fill: GOOD }));
      card(265, 350, 400, 38, { rx: 8, stroke: GOOD, fill: GOODBG, text: 'await 두 번 · 50ms 만에 둘 다 받음', fs: 14.5, s: pop(u, 1.2) });
      tx(TL0 + 80, 186, '순차였다면 100ms', { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) }); } }

  // ---------- 5. Dispatcher — 어느 Thread 풀에서 도나 ----------
  const POOL = [
    { key: 'M', x: 30, w: 250, name: 'Dispatchers.Main', th: [70], col: WARN, bg: WARNBG, note: 'UI 스레드 1개' },
    { key: 'IO', x: 310, w: 320, name: 'Dispatchers.IO', th: [350, 380, 410, 440, 470], col: INFO, bg: INFOBG, note: '64개 이상까지 늘어나는 풀' },
    { key: 'D', x: 660, w: 270, name: 'Dispatchers.Default', th: [690, 720, 750, 780], col: GOOD, bg: GOODBG, note: 'CPU 코어 수만큼' }];
  function pools(c) { const { k, u } = c;
    POOL.forEach((p, i) => { const s = k === 0 ? fade(u, 0.1 + i * 0.15) : 1;
      zone(p.x, 40, p.w, 280, null, { fill: p.bg, op: s });
      mono(p.x + p.w / 2, 66, p.name, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: p.col, opacity: s });
      p.th.forEach((x) => vthread(x, 86, 180, { op: s, stroke: p.col, fill: PANEL }));
      sub(p.x + p.w / 2, 300, p.note, s); });
    mono(500, 182, '…', { 'font-size': 18, fill: INFO, 'font-weight': 800 }); }
  function spinner(cx, cy, t, op) { el('circle', { cx, cy, r: 16, fill: 'none', stroke: GRID, 'stroke-width': 4, opacity: op });
    const a = t * 5; el('path', { d: `M${cx + 16 * Math.cos(a)},${cy + 16 * Math.sin(a)} A16,16 0 0 1 ${cx + 16 * Math.cos(a + 1.8)},${cy + 16 * Math.sin(a + 1.8)}`, fill: 'none', stroke: WARN, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: op }); }
  function s5(t, c) { const { k, u } = c; pools(c);
    const MX = 70, IX = 350, TY = 130, UI = 185;   // 코루틴 자리(Main 스레드 / IO 스레드)와 Main 화면 쪽 글자 자리
    if (k === 0) { coro(MX, lerp(20, TY, E(u, 0.6, 1.4)), 'C', 'run', { w: 40, op: fade(u, 0.6) });
      spinner(UI, 140, t, fade(u, 1.5)); mono(UI, 186, 'showLoading()', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(480, 370, 'launch(Dispatchers.Main) · 코루틴이 UI 스레드에서 출발한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 1) { const f = E(u, 0.2, 1.0);
      coro(MX, TY, 'C', 'pause', { w: 40, op: f > 0.1 ? 1 : 0 });
      coro(lerp(MX, IX, f), TY - Math.sin(f * Math.PI) * 60, 'C', 'run', { w: 40 });
      ['findById', 'findByUser', 'findByOrder'].forEach((s, i) => card(565, 120 + i * 40, 112, 30, { rx: 6, text: s, fs: 13.5, mono: true, stroke: INFO, fill: PANEL, s: pop(u, 1.1 + i * 0.4) }));
      spinner(UI, 140, t, 1); tx(UI, 186, 'Main 은 비어 있어', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
      tx(UI, 206, '화면을 계속 그린다', { 'text-anchor': 'middle', 'font-size': 13.5, fill: WARN, 'font-weight': 700 });
      tx(480, 370, 'withContext(Dispatchers.IO) 블록 동안만 IO 풀에서 돈다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 2) { const f = E(u, 0.2, 1.0);
      coro(lerp(IX, MX, f), TY - Math.sin(f * Math.PI) * 60, 'C', 'run', { w: 40 });
      fly(565, 160, UI, 150, seg(u, 0.3, 1.2), 'receipt', { stay: true, mono: true, fill: GOOD });
      mono(UI, 196, 'renderReceipt()', { 'text-anchor': 'middle', 'font-size': 13.5, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(UI, 218, 'hideLoading()', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(480, 370, '블록이 끝나면 저절로 Main 으로 돌아온다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    // k === 3: 세 풀의 쓰임
    [[MX, TY], [350, TY], [380, 190], [690, TY], [720, 190], [750, 150]].forEach(([x, y], i) => coro(x, y, 'C', 'run', { w: 40, s: pop(u, 0.2 + i * 0.18) }));
    [[UI, 'UI 렌더'], [565, 'DB · HTTP'], [860, '정렬 · 압축']].forEach(([x, s], i) => tx(x, 160, s, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.5 + i * 0.3) }));
    tx(480, 370, 'UI는 Main, 디스크·네트워크는 IO, 계산은 Default', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.6) }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터
  const quiz = [
    { q: '콜백으로 사용자, 주문, 결제, 영수증을 차례로 이어 부를 때 생기는 문제는 무엇인가?',
      o: ['결과가 더 빨리 나온다', '콜백이 4단으로 중첩되고 null 검사가 층마다 흩어진다', 'Thread가 하나도 필요 없어진다'], a: 1,
      why: '다음 조회는 앞 콜백 안에서만 부를 수 있어 들여쓰기가 4단까지 깊어진다. null 검사도 3곳에 따로 적어야 한다.' },
    { q: '동기 블로킹 코드로 동시 사용자 1만 명을 받으면 무엇이 먼저 한계에 닿는가?',
      o: ['Thread마다 잡는 스택 메모리', 'CPU 계산 속도', '코드 줄 수'], a: 0,
      why: 'Thread 하나가 스택 약 1MB를 잡으니 1만 개면 약 10GB다. 그 Thread 대부분은 DB 응답을 기다리기만 한다.' },
    { q: 'suspend 함수가 delay(50)에서 멈춰 있는 동안 Thread는 무엇을 하나?',
      o: ['다른 코루틴을 처리한다', '50ms 동안 잠든다', '그 코루틴을 강제로 끝낸다'], a: 0,
      why: 'delay는 Thread를 재우지 않고 코루틴만 멈춘다. 멈춘 자리는 Continuation이 기억하고, Thread는 그사이 다른 코루틴을 돌린다.' },
    { q: 'async 두 개를 먼저 띄우고 나중에 await 하면 각 50ms 짜리 작업은 모두 얼마 만에 끝나는가?',
      o: ['100ms', '1000ms', '약 50ms'], a: 2,
      why: '두 async가 같은 순간에 시작해 함께 돌기 때문에 합(100ms)이 아니라 긴 쪽(50ms)만큼 걸린다.' },
    { q: 'withContext(Dispatchers.IO) 블록이 끝나면 코루틴은 어디서 이어 실행되나?',
      o: ['IO 풀에 그대로 남는다', 'Dispatchers.Default로 옮겨 간다', '원래 있던 Dispatchers.Main으로 돌아온다'], a: 2,
      why: 'withContext는 블록 동안만 실행 영역을 옮긴다. 블록을 벗어나면 launch 할 때의 Main으로 돌아오므로 renderReceipt를 바로 이어 쓸 수 있다.' },
  ];

  const summary = [
    '콜백으로 비동기를 이으면 중첩이 4단까지 깊어지고 에러 처리가 층마다 흩어진다.',
    '블로킹 Thread는 기다리는 동안에도 스택 약 1MB를 잡아 1만 명이면 약 10GB가 된다.',
    'suspend 함수는 멈춘 자리를 기억해 두고 Thread를 풀어 준다. 코드는 순서대로 읽힌다.',
    '코루틴은 Scope 안에서 launch·async로 띄우고, withContext로 실행할 Dispatcher를 바꾼다.',
  ];
  const review = [
    { q: '서버가 DB 응답만 기다리는데 Thread가 모자라 요청이 대기열에 쌓인다. 먼저 바꿀 것은?',
      o: ['maxThreads를 10만으로 올린다', '조회 함수를 suspend로 바꿔 기다리는 동안 Thread를 풀어 준다', 'DB 쿼리를 콜백 4단으로 다시 짠다'], a: 1,
      why: 'Thread를 늘리면 스택 메모리가 먼저 터진다. 일시중단은 기다리는 동안 Thread를 돌려주므로 적은 Thread로 많은 요청을 받는다.' },
    { q: 'Android 화면에서 DB 조회를 Main에서 바로 했더니 화면이 멈췄다. 알맞은 고침은?',
      o: ['runBlocking으로 감싼다', 'Thread.sleep으로 기다린다', '조회 부분만 withContext(Dispatchers.IO)로 감싼다'], a: 2,
      why: 'IO 풀에서 조회하는 동안 코루틴은 Main에서 일시중단되고 UI 스레드는 화면을 계속 그린다. 블록이 끝나면 Main으로 돌아와 결과를 그린다.' },
    { q: '일반 fun main() 안에서 fetchUser(1)을 불렀더니 컴파일이 안 된다. 왜인가?',
      o: ['suspend 함수는 코루틴이나 다른 suspend 함수 안에서만 부를 수 있다', 'fetchUser가 50ms보다 오래 걸려서', 'main은 값을 돌려줄 수 없어서'], a: 0,
      why: '일시중단하려면 멈춘 자리를 이어 줄 코루틴이 있어야 한다. runBlocking이나 launch 블록 안에서 부르면 된다.' },
  ];

  R.page({ title: '코루틴 vs Thread 모델', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
