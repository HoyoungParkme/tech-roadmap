/* II-2-1 async/await — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, terminal, cross, check, lock, cells, dbIcon } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 이 장의 부품 ----------
  function ptok(cx, cy, st, o) { o = o || {}; const r = o.r || 30, s = o.s ?? 1; if (s <= 0) return;
    const col = st === 'ok' ? GOOD : st === 'bad' ? BAD : WARN, bg = st === 'ok' ? GOODBG : st === 'bad' ? BADBG : WARNBG;
    el('circle', { cx, cy, r: r * s, fill: bg, stroke: col, 'stroke-width': 3, 'stroke-dasharray': st === 'pending' ? '7 5' : null, opacity: o.op ?? 1 });
    if (o.text) mono(cx, cy + 5, o.text, { 'text-anchor': 'middle', 'font-size': o.fs || 14, 'font-weight': 800, fill: col, opacity: (o.op ?? 1) * clamp(s) }); }
  // 레인 위 구간 막대 (a→b, 그려진 비율 f)
  function span(x0, x1, y, f, col, text, o) { o = o || {}; if (f <= 0) return;
    el('rect', { x: x0, y: y - 16, width: (x1 - x0) * f, height: 32, rx: 6, fill: o.dash ? PANEL : col, stroke: o.dash ? col : 'none', 'stroke-width': 2, 'stroke-dasharray': o.dash ? '6 5' : null, opacity: o.op ?? 1 });
    if (text && f > 0.6) tx((x0 + x1) / 2, y + 5, text, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: o.dash ? col : PANEL, opacity: (o.op ?? 1) * fade(f, 0.6, 0.4) }); }

  // ---------- 1. async 함수는 Promise, await 는 양보 ----------
  function s1(t, c) { const { k, u } = c;
    const L1 = 110, L2 = 210;
    tx(24, L1 - 30, 'loadUser(7) 함수', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    tx(24, L2 - 30, '호출부 · 이벤트 루프', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    el('line', { x1: 24, y1: L1 + 22, x2: 936, y2: L1 + 22, stroke: GRID }); el('line', { x1: 24, y1: L2 + 22, x2: 936, y2: L2 + 22, stroke: GRID });
    const g = (kk, a, b) => (k > kk ? 1 : k === kk ? E(u, a, b) : 0);
    // 호출부
    span(30, 150, L2, Math.max(g(0, 0.2, 0.6), k >= 4 ? 1 : 0), INFO, '0) 호출 직전');
    span(150, 340, L1, g(0, 0.6, 1.4), ACC, '1) 시작 (동기)');
    if (k >= 1) { el('line', { x1: 340, y1: L1 - 30, x2: 340, y2: L2 + 24, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); mono(340, L1 - 40, 'await', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: WARN }); }
    if (k === 1) { lock(560, 300, false, ACC, pop(u, 0.4)); tx(600, 296, '스레드는 붙들지 않는다', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(600, 322, '멈추는 건 이 함수 하나뿐', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.2) }); }
    span(340, 690, L1, g(2, 0.2, 1.4), WARN, '멈춤 · fetchUser 기다림', { dash: true });
    span(340, 470, L2, g(2, 0.6, 1.2), INFO, '2) 호출 직후');
    span(470, 690, L2, g(2, 1.1, 2.0), OFF, '다른 요청·타이머');
    if (k === 2) { fly(340, L1, 560, 330, seg(u, 0.3, 1.2), '남은 코드', { fill: WARN, stay: true }); sub(560, 370, '결과가 오면 이어서 실행하도록 예약', fade(u, 1.2), { 'font-weight': 700 }); }
    if (k >= 3) { span(690, 850, L1, g(3, 0.6, 1.4), ACC, '3) 재개 · return');
      if (k === 3) { dot([[690, 300], [690, L1 + 16]], seg(u, 0.1, 0.6), GOOD, 7); sub(690, 320, 'fetchUser 결과 도착', fade(u, 0.1), { fill: GOOD, 'font-weight': 700 }); } }
    // 돌려주는 Promise
    const st = k >= 3 && !(k === 3 && u < 1.4) ? 'ok' : 'pending';
    if (k >= 0) ptok(900, L1, st, { r: 26, s: k === 0 ? pop(u, 1.4) : 1, text: 'P' });
    if (k === 0) { tx(900, L1 + 50, 'Promise<User>', { 'text-anchor': 'middle', 'font-size': 13.5, class: 'mono', fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
      sub(560, 300, 'async 함수는 무엇을 return 하든 Promise 로 감싸 내보낸다', fade(u, 2.0), { 'font-size': 15, 'font-weight': 700, fill: INK }); }
    if (k >= 4) { span(850, 936, L2, g(4, 1.6, 2.2), INFO, 'await p');
      if (k === 4) { fly(150, L2 + 40, 300, 300, seg(u, 0.3, 1.0), 'p = Promise (즉시)', { fill: WARN, stay: true }); sub(300, 345, '아직 User 값은 없다', fade(u, 1.0), { fill: WARN, 'font-weight': 700 }); } }
    if (k === 5) { const lines = ['$ node load-user.js', ['0) 호출 직전', 'var(--term)'], ['1) 시작', 'var(--term)'], ['2) 호출 직후', 'var(--term)'], ['3) 결과 도착, 재개', 'var(--term)']];
      terminal(24, 260, 420, 150, lines, 1 + E(u, 0.2, 1.8) * 4, { title: '출력', lh: 21 });
      [[90, L2], [245, L1], [405, L2], [770, L1]].forEach(([x, y], i) => { const s = pop(u, 0.4 + i * 0.4); el('circle', { cx: x, cy: y + 36, r: 13 * s, fill: INK }); mono(x, y + 41, String(i), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: PANEL, opacity: clamp(s) }); });
      tx(690, 330, '2) 가 3) 보다 먼저 찍힌다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.0) });
      tx(690, 358, 'await 에서 양보했다는 증거', { 'text-anchor': 'middle', 'font-size': 15, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); } }

  // ---------- 2. try / catch / finally ----------
  const BL = [['const conn = await db.connect();', 50], ['await db.saveOrder(conn, cart)', 120], ['await sendEmail(order)', 158], ['return order.id', 196], ['console.error(…); throw err', 275], ['await conn.close()', 352]];
  function s2(t, c) { const { k, u } = c;
    const X = 60, W = 380;
    if (k === 5) { // 두 길을 나란히
      const rows = [['성공', GOOD, ['saveOrder', 'sendEmail', 'finally: close']], ['실패', BAD, ['saveOrder ✗', 'catch: 로그', 'finally: close']]];
      rows.forEach(([n, col, xs], i) => { const y = 120 + i * 140;
        tx(60, y + 6, n, { 'font-size': 18, 'font-weight': 800, fill: col });
        xs.forEach((s, j) => { const x = 230 + j * 250, a = 0.2 + i * 0.9 + j * 0.25;
          card(x, y, 200, 46, { rx: 8, text: s, fs: 15, mono: true, stroke: j === 2 ? INFO : col, color: j === 2 ? INFO : col, s: pop(u, a) });
          if (j) grow(x - 150, y, x - 102, y, E(u, a - 0.1, a + 0.2), col); }); });
      el('path', { d: 'M730,143 L730,237', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '5 4', opacity: fade(u, 2.0) });
      tx(760, 196, '둘 다 close 로 모인다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) });
      return; }
    // 블록 영역
    const tryOn = k >= 1, cOn = k === 3 || k === 4, fOn = k === 4;
    zone(X - 16, 92, W + 32, 128, 'try {', { fill: tryOn ? INFOBG : 'none', stroke: tryOn ? INFO : GRID, color: tryOn ? INFO : OFF, dash: tryOn ? null : '5 5', op: k === 1 ? fade(u, 0.2) : 1 });
    zone(X - 16, 228, W + 32, 70, '} catch (err) {', { fill: cOn ? BADBG : 'none', stroke: cOn ? BAD : GRID, color: cOn ? BAD : OFF });
    zone(X - 16, 306, W + 32, 72, '} finally {', { fill: fOn ? SOFT : 'none', stroke: fOn ? INFO : GRID, color: fOn ? INFO : OFF });
    const hot = k === 0 ? [0] : k === 1 ? [1] : k === 2 ? [1, 2, 3] : k === 3 ? [1, 4] : [5];
    const grey = k === 3 ? [2, 3] : [];
    BL.forEach(([s, y], i) => { const yy = i >= 4 ? y : y + (i ? 18 : 0);
      card(X + W / 2, yy, W, 32, { rx: 6, text: s, fs: 13.5, mono: true, stroke: hot.includes(i) ? (i === 4 || (k === 3 && i === 1) ? BAD : ACC) : GRID, color: grey.includes(i) ? OFF : INK, sw: hot.includes(i) ? 2.2 : 1.3 }); });
    // DB 와 커넥션
    dbIcon(800, 120, 'DB', { s: 0.8 });
    const connOn = !(k === 4 && u > 1.6);
    el('line', { x1: X + W, y1: 50, x2: 760, y2: 110, stroke: connOn ? ACC : OFF, 'stroke-width': 2.5, 'stroke-dasharray': connOn ? null : '5 5', opacity: k === 0 ? E(u, 0.3, 1.0) : 1 });
    mono(620, 64, connOn ? 'conn 열림' : 'conn 닫힘', { 'font-size': 14, 'font-weight': 700, fill: connOn ? ACC : MUT, opacity: k === 0 ? fade(u, 1.0) : 1 });
    if (k === 0) { grow(X + W + 10, 66, 700, 220, E(u, 1.4, 2.0), BAD, { dash: '6 4' }); tx(700, 244, '여기서 reject 되면', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8), 'text-anchor': 'middle' }); tx(700, 268, '아래 catch 가 못 잡는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0), 'text-anchor': 'middle' }); }
    if (k === 1) { ptok(700, 260, 'pending', { s: pop(u, 0.8), text: 'order', fs: 13.5, r: 34 }); sub(700, 318, 'reject 면 이 줄에서 예외가 던져진다', fade(u, 1.3), { 'font-weight': 700, fill: INK }); }
    if (k === 2) { dot([[X + W + 14, 138], [X + W + 14, 176], [X + W + 14, 214]], seg(u, 0.2, 1.6), GOOD, 7); ptok(700, 260, 'ok', { text: 'order', fs: 13.5, r: 34 }); mono(700, 320, 'return order.id', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); }
    if (k === 3) { cross(X + W + 22, 138, 9, pop(u, 0.2)); dot([[X + W + 14, 138], [X + W + 40, 138], [X + W + 40, 275], [X + W + 14, 275]], seg(u, 0.4, 1.4), BAD, 7);
      ['건너뜀', '건너뜀'].forEach((s, i) => sub(X + W + 60, 181 + i * 38, s, fade(u, 0.8), { fill: OFF, 'font-weight': 700 }));
      mono(560, 330, '결제 실패: (에러 메시지)', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.5) });
      grow(X + W + 40, 275, 900, 275, E(u, 1.8, 2.5), BAD); tx(900, 302, 'throw err → 상위로', { 'font-size': 14, 'font-weight': 700, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 2.3) }); }
    if (k === 4) { dot([[X + W + 14, 214], [X + W + 14, 352]], seg(u, 0.2, 1.0), GOOD, 7); dot([[X + W + 30, 275], [X + W + 30, 352]], seg(u, 0.3, 1.1), BAD, 7);
      tx(620, 360, '성공이든 실패든 close', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) });
      tx(620, 386, '커넥션 누수가 없다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.9) }); } }

  // ---------- 3. 순차 900ms vs 병렬 400ms ----------
  const TASKS = [['fetchUser', 300], ['fetchPosts', 200], ['fetchTags', 400]];
  function s3(t, c) { const { k, u } = c;
    const x0 = 200, X = (ms) => x0 + ms * 0.74;
    el('line', { x1: X(0), y1: 44, x2: X(950), y2: 44, stroke: MUT, 'stroke-width': 1.5 });
    [0, 300, 400, 500, 900].forEach((v) => { el('line', { x1: X(v), y1: 39, x2: X(v), y2: 49, stroke: MUT }); mono(X(v), 32, v + 'ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    tx(24, 74, '순차 slow()', { 'font-size': 15, 'font-weight': 800, fill: BAD });
    let s0 = 0; TASKS.forEach(([n, ms], i) => { const y = 92 + i * 38, f = i === 0 ? (k === 0 ? E(u, 0.3, 1.6) : 1) : k === 0 ? 0 : k === 1 ? E(u, 0.2 + (i - 1) * 1.1, 1.1 + (i - 1) * 1.1) : 1;
      tx(x0 - 12, y + 19, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' });
      el('rect', { x: X(s0), y, width: X(ms) - X(0), height: 28, rx: 6, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4' });
      if (f > 0) { el('rect', { x: X(s0), y, width: (X(ms) - X(0)) * f, height: 28, rx: 6, fill: BAD, opacity: 0.75 }); if (f > 0.7) mono(X(s0 + ms / 2), y + 19, '+' + ms, { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }); }
      else if (k === 0 && i > 0) mono(X(s0) + 10, y + 19, '아직 출발 안 함', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.0) });
      s0 += ms; });
    if (k >= 2) { el('line', { x1: X(900), y1: 84, x2: X(900), y2: 206, stroke: BAD, 'stroke-width': 2.5, opacity: k === 2 ? E(u, 0.2, 0.6) : 1 });
      mono(X(900) - 8, 228, Math.round(k === 2 ? tween(0, 900, u) : 900) + 'ms', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'end' }); }
    if (k < 3) { if (k === 2) tx(24, 300, '300 + 200 + 400 = 900ms', { 'font-size': 18, 'font-weight': 800, class: 'mono', opacity: fade(u, 1.2) }); return; }
    tx(24, 264, '병렬 fast()', { 'font-size': 15, 'font-weight': 800, fill: GOOD });
    const bundle = k === 3 ? pop(u, 0.3) : 1;
    el('rect', { x: 26, y: 276, width: 160 * bundle, height: 118, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    if (k === 3) tx(106, 410, 'Promise.all([…])', { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.7) });
    TASKS.forEach(([n, ms], i) => { const y = 282 + i * 38, f = k === 3 ? 0 : k === 4 ? E(u, 0.3, 0.3 + 2.0 * ms / 400) : 1;
      tx(x0 - 12, y + 19, n, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' });
      el('rect', { x: X(0), y, width: X(ms) - X(0), height: 28, rx: 6, fill: 'none', stroke: GRID, 'stroke-dasharray': '4 4' });
      if (f > 0) { el('rect', { x: X(0), y, width: (X(ms) - X(0)) * f, height: 28, rx: 6, fill: GOOD, opacity: 0.8 }); if (f > 0.7) mono(X(ms / 2), y + 19, String(ms), { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'middle' }); } });
    if (k === 3) tx(560, 330, '세 요청이 한 번에 출발한다', { 'font-size': 16, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
    if (k === 5) { el('line', { x1: X(400), y1: 274, x2: X(400), y2: 396, stroke: GOOD, 'stroke-width': 2.5 });
      mono(X(400) + 10, 270, Math.round(tween(900, 400, u)) + 'ms', { 'font-size': 18, 'font-weight': 800, fill: GOOD });
      grow(X(900), 250, X(400) + 6, 250, E(u, 1.4, 2.0), GOOD); mono(X(650), 240, '−500ms', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); } }

  // ---------- 4. 실전 문법 ----------
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { // 최상위 await
      card(250, 140, 380, 120, { rx: 12, stroke: GOOD, s: pop(u, 0.2) }); mono(80, 110, 'patterns.mjs (ESM)', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) });
      mono(80, 150, 'const config = await loadConfig();', { 'font-size': 14, opacity: fade(u, 0.5) }); check(410, 110, 11, pop(u, 1.0));
      el('rect', { x: 80, y: 168, width: 300 * E(u, 0.8, 2.0), height: 12, rx: 6, fill: GOOD, opacity: 0.7 });
      sub(250, 222, 'config 를 받은 뒤에 모듈 평가가 이어진다', fade(u, 1.4), { 'font-weight': 700 });
      card(710, 140, 400, 120, { rx: 12, stroke: BAD, s: pop(u, 1.2) }); mono(530, 110, 'config.cjs (CommonJS)', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      mono(530, 150, 'const config = await loadConfig();', { 'font-size': 14, opacity: fade(u, 1.4) }); cross(880, 110, 10, pop(u, 1.8));
      mono(530, 182, 'SyntaxError: await is only valid', { 'font-size': 13.5, fill: BAD, opacity: fade(u, 1.9) });
      tx(480, 320, '최상위 await 는 ESM 모듈에서만 된다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.2) }); return; }
    if (k <= 3) { // for await...of
      zone(30, 60, 330, 200, 'cursor (비동기 이터러블)', { fill: SOFT });
      const rows = ['row 1', 'row 2', 'row 3'];
      const got = k === 1 ? 0 : k === 2 ? Math.floor(E(u, 0.2, 2.4) * 3 + 0.0001) : 3;
      rows.forEach((r, i) => { if (i < got || (k === 2 && i === got)) return; card(110 + i * 90, 150, 76, 40, { rx: 8, text: r, fs: 14, mono: true, stroke: INFO, color: INFO, s: k === 1 ? pop(u, 0.3 + i * 0.2) : 1 }); });
      if (k === 2) { const f = (E(u, 0.2, 2.4) * 3) % 1, i = Math.min(2, got); if (got < 3) fly(110 + i * 90, 150, 520 + i * 100, 160, f, rows[i], { fill: INFO, mono: true });
        sub(195, 230, '반복마다 다음 값을 await', fade(u, 0.3), { 'font-weight': 700, fill: INFO }); }
      tx(480, 110, 'rows', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
      cells(480, 140, [0, 1, 2].map((i) => (i < got ? rows[i] : '')), { w: 92, h: 44, gap: 8, style: (i) => ({ stroke: i < got ? ACC : GRID, color: ACC }) });
      if (k === 1) sub(620, 210, '빈 배열을 먼저 만든다', fade(u, 0.8), { 'font-weight': 700 });
      if (k === 3) { const f = E(u, 0.3, 1.2);
        el('rect', { x: 466, y: 126, width: 328, height: 72, rx: 36, fill: 'none', stroke: f > 0.99 && u > 1.6 ? GOOD : WARN, 'stroke-width': 3, 'stroke-dasharray': u > 1.6 ? null : '7 5', opacity: f });
        mono(630, 232, 'return rows → Promise<rows>', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: u > 1.6 ? GOOD : WARN, opacity: fade(u, 1.0) });
        sub(630, 262, 'async 함수라 배열도 Promise 로 감싸져 나간다', fade(u, 1.8), { 'font-weight': 700 }); }
      return; }
    // k4·k5: map + async → Promise 배열 → Promise.all
    tx(60, 80, 'ids', { 'font-size': 15, 'font-weight': 800, class: 'mono' });
    cells(110, 56, [1, 2, 3], { w: 56, h: 44 });
    tx(60, 170, k === 4 ? 'ids.map(async id => …)' : 'await Promise.all(…)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: k === 4 ? WARN : GOOD });
    [0, 1, 2].forEach((i) => { const x = 330 + i * 150, a = 0.4 + i * 0.3;
      grow(138 + i * 62, 104, x, 214, k === 4 ? E(u, a - 0.2, a + 0.3) : 1, MUT);
      if (k === 4) ptok(x, 250, 'pending', { s: pop(u, a + 0.2), text: 'Promise', fs: 13.5, r: 36 });
      else { const f = E(u, 0.4 + i * 0.25, 1.0 + i * 0.25); ptok(x, 250, 'pending', { op: 1 - f, text: '', r: 36 }); card(x, 250, 120, 44, { rx: 8, text: 'User ' + (i + 1), fs: 15, mono: true, stroke: GOOD, color: GOOD, s: f }); } });
    if (k === 4) tx(480, 340, '값 배열이 아니라 Promise 배열이다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.8) });
    else tx(480, 340, 'users = [User 1, User 2, User 3]', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, class: 'mono', fill: GOOD, opacity: fade(u, 1.8) }); }

  // ---------- 5. 실무 함정 넷 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // ① await 누락
      mono(40, 80, 'const u = fetchUser();', { 'font-size': 15, 'font-weight': 700 });
      ptok(120, 150, 'pending', { s: pop(u, 0.3), text: 'Promise', fs: 13.5, r: 38 });
      grow(165, 150, 300, 150, E(u, 0.6, 1.0), MUT); mono(310, 155, 'u.isAdmin', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8) });
      grow(400, 150, 500, 150, E(u, 1.0, 1.4), MUT); mono(510, 155, 'undefined', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) });
      cross(640, 150, 10, pop(u, 1.6)); tx(665, 156, '관리자도 걸러진다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.7) });
      mono(40, 260, 'const u2 = await fetchUser();', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) });
      card(150, 320, 220, 46, { rx: 8, text: 'User { isAdmin: true }', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 2.1) }); check(290, 320, 10, pop(u, 2.3));
      tx(400, 326, '에러 없이 조건문만 조용히 틀린다', { 'font-size': 15, 'font-weight': 700, fill: INK, opacity: fade(u, 2.4) }); return; }
    if (k === 1 || k === 2) { // ② 반복문 안 순차 await
      const par = k === 2, n = 5, x0 = 200, w = 110;
      tx(24, 52, par ? 'await Promise.all(ids.map(sendMail))' : 'for (const id of ids) await sendMail(id)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: par ? GOOD : BAD });
      for (let i = 0; i < n; i++) { const y = 80 + i * 40, start = par ? lerp(i * w, 0, E(u, 0.2, 1.2)) : i * w, f = par ? 1 : E(u, 0.2 + i * 0.4, 0.6 + i * 0.4);
        mono(x0 - 14, y + 19, 'id ' + (i + 1), { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
        el('rect', { x: x0 + start, y, width: w * f, height: 28, rx: 6, fill: par ? GOOD : BAD, opacity: 0.75 }); }
      sub(480, 300, '예시: 항목 5개, 한 번에 걸리는 시간 t', 1, { 'font-size': 14 });
      tx(480, 340, par ? '총 시간 ≈ 가장 느린 한 번' : '총 시간 = 항목 수 × t', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: par ? GOOD : BAD, opacity: fade(u, par ? 1.3 : 2.0) });
      return; }
    if (k === 3) { // ③ try 범위
      [[0, '밖', BAD], [1, '안', GOOD]].forEach(([i, w, col]) => { const x = 60 + i * 450, a = 0.2 + i * 1.1;
        tx(x, 60, 'await risky() 가 try ' + w, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, a) });
        el('rect', { x, y: 90, width: 360, height: 110, rx: 10, fill: i ? INFOBG : 'none', stroke: INFO, 'stroke-width': 2, opacity: fade(u, a) });
        mono(x + 14, 112, 'try {', { 'font-size': 14, fill: INFO, opacity: fade(u, a) });
        mono(x + 14, i ? 150 : 240, 'await risky();', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, a) });
        ptok(x + 250, i ? 150 : 240, 'bad', { r: 20, s: pop(u, a + 0.3), text: '' });
        if (i) { dot([[x + 250, 150], [x + 250, 260]], seg(u, a + 0.6, a + 1.2), BAD, 7); card(x + 250, 280, 180, 40, { rx: 8, text: 'catch → handle(e)', fs: 14, mono: true, stroke: GOOD, color: GOOD, s: pop(u, a + 1.2) }); }
        else { dot([[x + 270, 240], [x + 340, 330]], seg(u, a + 0.5, a + 1.0), BAD, 7); pill(x + 230, 350, 'unhandledRejection', BAD, pop(u, a + 0.9), { mono: true, fs: 13.5 }); } });
      return; }
    // k4: ④ 독립 호출은 묶는다 + 세 규칙
    const X = (v) => 220 + v * 140;
    [['순차', BAD, [[0, 1], [1, 2]]], ['Promise.all', GOOD, [[0, 1], [0, 1]]]].forEach(([n, col, bars], i) => { const y = 60 + i * 90;
      tx(24, y + 30, n, { 'font-size': 15, 'font-weight': 800, fill: col });
      bars.forEach(([a, b], j) => { const f = E(u, 0.2 + i * 0.4 + (i ? 0 : j * 0.4), 0.6 + i * 0.4 + (i ? 0 : j * 0.4));
        el('rect', { x: X(a), y: y + j * 32, width: (X(b) - X(a)) * f, height: 26, rx: 6, fill: col, opacity: 0.75 });
        mono(X(a) + 10, y + j * 32 + 18, ['loadA()', 'loadB()'][j], { 'font-size': 13.5, 'font-weight': 700, fill: PANEL, opacity: f > 0.5 ? 1 : 0 }); }); });
    [['값이 필요하면', 'await'], ['서로 독립이면', 'Promise.all'], ['위험하면', 'try 로 감싼다']].forEach(([a, b], i) => { const y = 290 + i * 40, op = fade(u, 1.3 + i * 0.3);
      tx(220, y, a, { 'font-size': 16, 'font-weight': 700, opacity: op }); mono(400, y, b, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: op }); }); }

  const quiz = [
    { q: 'loadUser 안에서 await를 만났을 때 일어나는 일은 무엇인가?',
      o: ['메인 스레드가 결과가 올 때까지 멈춘다', '이 함수만 멈추고 남은 코드를 예약한 뒤 루프에 양보한다', '함수가 처음부터 다시 실행된다'], a: 1,
      why: '멈추는 건 함수 하나뿐이다. 그래서 호출부의 2)가 함수 안 3)보다 먼저 찍힌다.' },
    { q: 'const conn = await db.connect()가 try 블록 바깥에 있다. 여기서 reject 되면 어떻게 되는가?',
      o: ['아래 catch가 잡는다', 'finally만 실행되고 끝난다', '이 함수의 catch는 못 잡고 호출부로 그대로 던져진다'], a: 2,
      why: 'reject는 그 await 줄에서 예외로 던져진다. 그 줄이 try 안에 있어야 catch로 들어간다.' },
    { q: '300ms, 200ms, 400ms 짜리 독립 호출을 Promise.all로 묶으면 총 시간은 얼마인가?',
      o: ['400ms', '900ms', '200ms'], a: 0,
      why: '셋이 동시에 출발하므로 가장 느린 400ms에 끝난다. 한 줄씩 await 하면 300 + 200 + 400 = 900ms다.' },
    { q: 'ids.map(async id => await fetchUser(id))의 결과는 무엇인가?',
      o: ['User 객체 배열', 'Promise 배열', 'undefined'], a: 1,
      why: 'async 콜백은 늘 Promise를 돌려준다. 값 배열을 얻으려면 Promise.all로 감싸 await 한다.' },
    { q: 'const u = fetchUser(); if (u.isAdmin) { … }에서 생기는 일은 무엇인가?',
      o: ['TypeError로 바로 멈춘다', '관리자일 때만 통과한다', 'u.isAdmin이 늘 undefined라 관리자도 걸러진다'], a: 2,
      why: 'u는 User가 아니라 Promise 객체다. 에러 없이 조건문만 조용히 틀리므로 찾기 어렵다.' },
  ];

  const summary = [
    'async 함수는 늘 Promise를 돌려주고, await는 그 함수만 멈춘 채 이벤트 루프에 양보한다.',
    'await한 Promise가 reject되면 그 줄에서 예외가 난다. try 안에 둬야 catch가 잡는다.',
    '정리 코드는 finally에 둔다. 성공이든 실패든 커넥션이 닫힌다.',
    '독립 호출 300, 200, 400ms를 한 줄씩 기다리면 900ms, Promise.all로 묶으면 400ms다.',
  ];
  const review = [
    { q: '사용자 100명에게 메일을 보내는 API가 느리다. for 문 안에서 await sendMail(id)를 하고 있다. 먼저 바꿀 것은?',
      o: ['await Promise.all(ids.map(sendMail))로 한 번에 기다린다', 'sendMail 앞의 await를 지운다', 'for 문을 while 문으로 바꾼다'], a: 0,
      why: '반복문 안 await는 항목 수만큼 왕복을 더한다. 독립 항목이면 한꺼번에 시작해 가장 느린 한 번만큼만 기다린다.' },
    { q: '결제 실패가 나면 DB 커넥션이 하나씩 쌓여 결국 풀이 바닥난다. 가장 먼저 의심할 것은?',
      o: ['await를 너무 많이 써서', 'conn.close()가 try 블록 끝에만 있어서', 'Promise.all을 쓰지 않아서'], a: 1,
      why: 'reject 되면 try의 남은 줄은 건너뛴다. close를 finally에 두면 성공이든 실패든 실행된다.' },
    { q: '대시보드가 user를 받은 뒤 그 id로 posts를 가져온다. 두 호출을 Promise.all로 묶으면 안 되는 이유는?',
      o: ['Promise.all은 두 개까지만 받아서', 'Promise.all은 에러를 못 잡아서', 'posts가 user의 결과를 써서 순서가 필요해서'], a: 2,
      why: '뒤 작업이 앞 결과를 쓰면 순차 await가 맞다. 서로 독립일 때만 Promise.all로 묶는다.' },
  ];

  R.page({ title: 'await가 멈추고 이어지는 모습', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
