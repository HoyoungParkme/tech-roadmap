/* IV-1-1 분산 락 — 장면 5개 (../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, clock, terminal, cells, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 프로세스 카드
  function proc(cx, cy, name, o) { o = o || {}; const dead = o.dead, col = dead ? OFF : o.col || INK;
    card(cx, cy, 120, 56, { rx: 10, stroke: col, fill: dead ? SOFT : o.fill, s: o.s, sw: 2.2 });
    if ((o.s ?? 1) < 0.3) return;
    mono(cx - (o.lock ? 14 : 0), cy + 6, name, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: col });
    if (o.lock) lock(cx + 34, cy + 2, true, o.lockCol || GOOD, 0.9);
    if (dead) cross(cx, cy, 18, o.deadS ?? 1);
    if (o.note) sub(cx, cy + 50, o.note, 1, { 'font-weight': 700, fill: o.noteCol || MUT, 'font-size': 14 }); }
  // Redis 키 표 (한 줄) : key | value | TTL
  function keyPanel(x, y, w, row, o) { o = o || {};
    el('rect', { x, y, width: w, height: 104, rx: 10, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 });
    tx(x + 14, y + 24, 'Redis', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    const c1 = x + 16, c2 = x + w * 0.42, c3 = x + w - 16;
    mono(c1, y + 50, 'key', { 'font-size': 13.5, fill: MUT }); mono(c2, y + 50, 'value', { 'font-size': 13.5, fill: MUT }); mono(c3, y + 50, 'TTL', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    if (!row) { sub(x + w / 2, y + 84, '(키 없음)', 1); return; }
    const op = row.op ?? 1, col = row.gone ? BAD : INK, deco = row.gone ? 'line-through' : null;
    if (row.hot) el('rect', { x: x + 8, y: y + 62, width: w - 16, height: 32, rx: 6, fill: PANEL, opacity: op });
    mono(c1, y + 84, row.key, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op, 'text-decoration': deco });
    mono(c2, y + 84, row.val, { 'font-size': 15, fill: row.valCol || col, opacity: op, 'text-decoration': deco, 'font-weight': 700 });
    mono(c3, y + 84, row.ttl, { 'font-size': 15, 'font-weight': 800, fill: row.ttlCol || WARN, opacity: op, 'text-anchor': 'end' }); }

  // =====================================================================
  // 1. 단순 SETNX
  const A = [110, 110], B = [110, 300], KP = { x: 430, y: 150, w: 480 };
  function s1(t, c) { const { k, u } = c;
    const crashed = k >= 2, crashU = k === 2 ? 0.3 : -1;
    const row = k === 0 ? (u > 1.0 ? { key: 'order:42', val: '"1"', ttl: '-1', op: fade(u, 1.0), hot: u < 2 } : null)
      : { key: 'order:42', val: '"1"', ttl: k >= 2 ? '-1 (만료 없음)' : '-1', ttlCol: k >= 2 ? BAD : WARN, hot: k === 4 };
    keyPanel(KP.x, KP.y, KP.w, row);
    proc(A[0], A[1], 'P1', { s: k === 0 ? pop(u, 0.1) : 1, lock: (k === 0 && u > 1.8) || (k === 1), dead: crashed, deadS: k === 2 ? pop(u, crashU) : 1 });
    proc(B[0], B[1], 'P2', { s: k === 1 ? pop(u, 0.1) : k === 0 ? 0 : 1, col: k >= 1 ? INK : INK });
    if (k === 0) { fly(A[0] + 70, A[1], KP.x, KP.y + 40, seg(u, 0.3, 1.1), 'SETNX order:42 1', { mono: true });
      fly(KP.x, KP.y + 20, A[0] + 70, A[1] + 10, seg(u, 1.2, 1.8), '(integer) 1', { mono: true, fill: GOOD });
      if (u > 1.8) tx(A[0] + 80, A[1] - 36, '먼저 만든 쪽이 임자', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.8) }); }
    if (k === 1) { fly(B[0] + 70, B[1], KP.x, KP.y + 80, seg(u, 0.3, 1.1), 'SETNX order:42 1', { mono: true, fill: INK });
      fly(KP.x, KP.y + 90, B[0] + 70, B[1] + 10, seg(u, 1.2, 1.8), '(integer) 0', { mono: true, fill: BAD });
      if (u > 1.8) cross(B[0] + 80, B[1] - 30, 9, pop(u, 1.8));
      pill(300, 60, 'naive_unlock() = DEL 뿐', WARN, pop(u, 2.0), { mono: true, fs: 14 }); }
    if (k === 2) { ['OOM kill', 'pod evict', '서버 재부팅'].forEach((s, i) => pill(300, 40 + i * 36, s, BAD, pop(u, 0.7 + i * 0.25), { fs: 13.5 }));
      grow(A[0] + 70, A[1] + 30, KP.x - 10, KP.y + 60, E(u, 1.6, 2.2), OFF, { dash: '6 5' });
      tx(KP.x + KP.w / 2, KP.y + 140, 'unlock 을 부를 주체가 사라졌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) }); }
    if (k === 3) { const tries = Math.floor(lerp(0, 5, E(u, 0.2, 2.2)));
      for (let i = 0; i < 4; i++) dot([[B[0] + 64, B[1]], [KP.x, KP.y + 80]], (t * 0.9 + i / 4) % 1, OFF, 5);
      mono(B[0] + 80, B[1] + 50, '0 · 0 · 0 · 0 · 0'.slice(0, Math.max(1, tries * 4 - 3)), { 'font-size': 15, 'font-weight': 800, fill: BAD });
      tx(B[0] - 50, B[1] + 84, '영원히 False', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      pill(KP.x + KP.w / 2, KP.y + 150, '수동: redis-cli DEL order:42', WARN, pop(u, 1.8), { mono: true, fs: 14 }); }
    if (k === 4) { clock(KP.x + KP.w - 60, KP.y - 40, 26, 0, WARN); tx(KP.x + KP.w - 60, KP.y - 33, '?', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
      grow(KP.x + KP.w - 60, KP.y - 12, KP.x + KP.w - 50, KP.y + 62, E(u, 0.5, 1.0), WARN);
      banner(KP.x + KP.w / 2 - 40, KP.y + 160, '락에는 반드시 만료(TTL)가 있어야 한다', pop(u, 1.2)); } }

  // =====================================================================
  // 2. SET NX EX 30
  const TOK = '2f9c-…-a41';
  function ttlClock(cx, cy, sec, total) { clock(cx, cy, 30, sec / total, sec > 0 ? WARN : OFF); mono(cx, cy + 50, Math.round(sec) + 's', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: sec > 0 ? WARN : MUT }); }
  function s2(t, c) { const { k, u } = c, KX = 380, KY = 150, KW = 400;
    if (k === 5) { // 시간줄 — P1 의 작업이 TTL 보다 길다
      const x0 = 150, sx = 11, X = (s) => x0 + s * sx;
      [['P1', 90], ['P2', 170], ['lock', 250]].forEach(([n, y]) => { mono(40, y + 6, n, { 'font-size': 16, 'font-weight': 800 }); el('line', { x1: x0, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 2 }); });
      const p = E(u, 0.2, 2.0), now = p * 62;
      el('rect', { x: X(0), y: 80, width: X(Math.min(now, 45)) - X(0), height: 20, rx: 4, fill: INFO, opacity: 0.85 });
      el('rect', { x: X(0), y: 240, width: X(Math.min(now, 30)) - X(0), height: 20, rx: 4, fill: GOOD, opacity: 0.85 }); if (now > 2) tx(X(1), 255, 'token A · TTL 30s', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
      if (now > 30) { el('line', { x1: X(30), y1: 60, x2: X(30), y2: 300, stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); mono(X(30), 320, '30s 만료', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN });
        el('rect', { x: X(30.5), y: 240, width: X(Math.min(now, 62)) - X(30.5), height: 20, rx: 4, fill: ACC, opacity: 0.85 }); if (now > 33) tx(X(31.5), 255, 'token B (P2)', { 'font-size': 13.5, 'font-weight': 700, fill: PANEL });
        el('rect', { x: X(30.5), y: 160, width: X(Math.min(now, 62)) - X(30.5), height: 20, rx: 4, fill: ACC, opacity: 0.5 }); }
      if (now > 45) { el('line', { x1: X(45), y1: 100, x2: X(45), y2: 238, stroke: BAD, 'stroke-width': 3, 'marker-end': 'url(#ra-ahr)' });
        pill(X(45), 50, 'P1: release_lock() → DEL', BAD, pop(u, 1.5), { mono: true, fs: 13.5 }); cross(X(45), 250, 12, pop(u, 1.6)); }
      if (u > 2.1) tx(480, 380, 'P1 이 지운 것은 P2 의 락이다', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.1) });
      return; }
    const tokB = '(P2 token)';
    let row = null, sec = 0;
    if (k === 0) row = null;
    if (k === 1) { row = u > 1.1 ? { key: 'lock:order:42', val: TOK, ttl: '', op: fade(u, 1.1), hot: true } : null; sec = u > 1.1 ? 30 - E(u, 1.4, 2.9) * 1 : 0; }
    if (k === 2) { const g = u > 1.2; row = { key: 'lock:order:42', val: TOK, ttl: '', gone: g }; sec = g ? 0 : 29; }
    if (k === 3) { const g = u > 2.0; row = { key: 'lock:order:42', val: TOK, ttl: '', gone: g }; sec = g ? 0 : 28; }
    if (k === 4) { const p = E(u, 0.5, 1.8), done = u > 1.9; row = { key: 'lock:order:42', val: done ? tokB : TOK, ttl: '', valCol: done ? ACC : INK, hot: done }; sec = done ? 30 : lerp(30, 0, p); }
    keyPanel(KX, KY, KW, row);
    if (k >= 1) ttlClock(860, KY + 44, sec, 30);
    const p1Dead = k === 4 && u > 0.4;
    proc(110, 110, 'P1', { lock: (k === 1 && u > 1.6) || (k === 3 && u < 2.0) || (k === 4 && !p1Dead), dead: p1Dead, deadS: pop(u, 0.4) });
    if (k >= 3) proc(110, 300, 'P2', { s: k === 3 ? pop(u, 0.2) : 1, lock: k === 4 && u > 1.9 });
    if (k === 0) { card(250, 300, 230, 60, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 0.4) }); grow(150, 140, 200, 268, E(u, 0.2, 0.5), ACC);
      mono(250, 294, 'token = uuid4()', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.6) });
      mono(250, 316, TOK, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      sub(560, 300, '이 값으로 "내 락" 을 알아본다', fade(u, 1.5), { 'font-weight': 700, 'font-size': 14.5, 'text-anchor': 'start' }); }
    if (k === 1) { fly(360, 70, KX + 200, KY + 30, seg(u, 0.2, 1.0), 'SET lock:order:42 <token> NX EX 30', { mono: true });
      fly(KX, KY + 20, 180, 120, seg(u, 1.1, 1.6), 'OK', { mono: true, fill: GOOD });
      // 두 줄로 쪼갠 경우
      const y = 330; el('rect', { x: 260, y: y - 26, width: 620, height: 74, rx: 10, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: fade(u, 1.8) });
      mono(280, y, 'SETNX lock 1', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8) }); mono(560, y, 'EXPIRE lock 30', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.8), fill: OFF });
      if (u > 2.1) cross(500, y - 5, 10, pop(u, 2.1)); tx(570, y + 34, '두 줄 사이에 죽으면 다시 데드락', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }
    if (k === 2) { fly(180, 110, KX, KY + 40, seg(u, 0.2, 1.0), 'DEL lock:order:42', { mono: true, fill: INK });
      pill(KX + KW / 2, KY + 150, '⚠ owner 확인 없음 — Step 3', WARN, pop(u, 1.6), { fs: 14 }); }
    if (k === 3) { fly(180, 300, KX, KY + 80, seg(u, 0.3, 1.0), 'SET … NX EX 30', { mono: true, fill: INK });
      fly(KX, KY + 90, 180, 310, seg(u, 1.0, 1.5), 'None', { mono: true, fill: MUT });
      if (u > 1.5) sub(110, 370, '다음 기회', 1, { 'font-weight': 700 });
      pill(300, 50, 'finally: release_lock', GOOD, pop(u, 1.6), { mono: true, fs: 14 }); fly(180, 110, KX, KY + 40, seg(u, 1.7, 2.1), 'DEL', { mono: true, fill: GOOD }); }
    if (k === 4) { if (u > 0.4) sub(110, 170, 'crash', 1, { fill: BAD, 'font-weight': 800, 'font-size': 15 });
      if (u > 1.6) { fly(180, 300, KX, KY + 80, seg(u, 1.6, 2.0), 'SET … NX EX 30 → OK', { mono: true }); }
      tx(KX + KW / 2, KY + 150, '살아 있으면 DEL, 죽으면 30초 뒤 Redis 가 회수', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.2) }); } }

  // =====================================================================
  // 3. Lua 원자 해제
  const SCRIPT = ['if redis.call("get", KEYS[1]) == ARGV[1] then', '    return redis.call("del", KEYS[1])', 'else', '    return 0', 'end'];
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { // 시퀀스: P1 · Redis · P2
      const xs = { P1: 150, R: 480, P2: 810 }, y0 = 70, y1 = 380;
      Object.entries(xs).forEach(([n, x]) => { card(x, 44, 120, 40, { rx: 8, stroke: n === 'R' ? ACC : INK, fill: n === 'R' ? ACCBG : null, text: n === 'R' ? 'Redis' : n, mono: true, fs: 15, color: n === 'R' ? ACC : INK }); el('line', { x1: x, y1: y0, x2: x, y2: y1, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); });
      const step = (a, b, y, s, col, uu) => { grow(a, y, b, y, uu, col); if (uu > 0.2) mono((a + b) / 2, y - 8, s, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col, opacity: clamp(uu * 2) }); };
      step(xs.P1, xs.R - 4, 110, 'GET lock', INK, E(u, 0.2, 0.5)); step(xs.R, xs.P1 + 4, 150, 'token A (내 것)', GOOD, E(u, 0.5, 0.8));
      if (u > 0.9) { el('rect', { x: 330, y: 168, width: 300, height: 92, rx: 8, fill: WARNBG, opacity: fade(u, 0.9) }); tx(480, 190, '이 틈', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.9) }); }
      if (u > 1.1) mono(xs.R, 216, 'TTL 만료', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.1) });
      step(xs.P2, xs.R + 4, 246, 'SET lock B NX', ACC, E(u, 1.3, 1.6));
      step(xs.P1, xs.R - 4, 300, 'DEL lock', BAD, E(u, 1.8, 2.1));
      if (u > 2.2) { cross(xs.R + 70, 300, 10, pop(u, 2.2)); tx(xs.R + 90, 306, 'P2 의 락 삭제', { 'font-size': 15, 'font-weight': 800, fill: BAD }); }
      sub(xs.P1, 400, '왕복 2회', fade(u, 2.3), { 'font-weight': 700, fill: INK, 'font-size': 14.5 }); return; }
    if (k === 1) { el('rect', { x: 300, y: 50, width: 620, height: 230, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 }); tx(316, 76, 'Redis — 스크립트 하나를 통째로 실행', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      SCRIPT.forEach((s, i) => { const on = u > 0.3 + i * 0.2; if (!on) return; R.spans(330, 118 + i * 30, R.tokens(s), { 'font-size': 15 }); });
      const run = E(u, 1.4, 2.4); el('rect', { x: 316, y: 96, width: 6, height: 150 * run, rx: 3, fill: ACC });
      [0, 1, 2].forEach((i) => { el('circle', { cx: 120 + i * 40, cy: 170, r: 12, fill: OFF, opacity: fade(u, 0.6 + i * 0.1) }); });
      tx(160, 210, '다른 명령은 대기', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.9) });
      if (u > 1.4) cross(270, 170, 10, 1);
      banner(610, 330, 'get · 비교 · del 이 끼어들 틈 없이 한 번에', pop(u, 2.2)); return; }
    if (k === 2) { terminal(30, 40, 900, 110, ['> EVAL RELEASE_SCRIPT 1 lock:order:42 2f9c-…-a41', '(integer) 1'], lerp(0, 2, E(u, 0.2, 2.0)), { fs: 15, lh: 28 });
      [['1', 'KEYS 개수', 395, INFO], ['lock:order:42', 'KEYS[1]', 520, ACC], ['2f9c-…-a41', 'ARGV[1]', 720, WARN]].forEach(([s, n, x, col], i) => {
        grow(x, 196, x, 112, E(u, 0.5 + i * 0.3, 0.8 + i * 0.3), col); pill(x, 216, n, col, pop(u, 0.5 + i * 0.3), { mono: true, fs: 14 }); });
      card(480, 320, 520, 64, { rx: 10, stroke: GOOD, s: pop(u, 2.0) });
      tx(480, 326, '반환 1 = 내 락을 실제로 지웠다 · 0 = 아무 일도 안 했다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { el('rect', { x: 200, y: 40, width: 560, height: 300, rx: 14, fill: SOFT, stroke: INK, 'stroke-width': 2 }); mono(220, 70, 'with_lock(resource, ttl=30)', { 'font-size': 16, 'font-weight': 800 });
      [['token = uuid4()', ACC], ['SET lock:<resource> <token> NX EX 30', ACC], ['실패면 raise — 호출부는 신경 끝', BAD], ['finally: release_lock (Lua)', GOOD]].forEach(([s, col], i) => {
        const y = 120 + i * 54, sc = pop(u, 0.3 + i * 0.4); card(480, y, 500, 42, { rx: 8, stroke: col, s: sc }); if (sc > 0.3) mono(250, y + 5, s, { 'font-size': 14.5, 'font-weight': 700, fill: col }); });
      tx(480, 380, '호출부는 with 한 줄만 쓴다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 4) { keyPanel(380, 60, 480, { key: 'lock:order:42', val: 'token B (P2)', ttl: '', valCol: ACC });
      proc(110, 110, 'P1', {}); proc(110, 300, 'P2', { lock: true, lockCol: ACC });
      fly(180, 110, 380, 110, seg(u, 0.3, 1.0), 'EVAL … token A', { mono: true, fill: INK });
      card(620, 250, 480, 72, { rx: 10, stroke: GRID, s: pop(u, 1.0) });
      mono(400, 244, 'get == ARGV[1] ?  B ≠ A', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) }); mono(400, 270, '→ return 0', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.5) });
      if (u > 1.9) { check(830, 116, 12, pop(u, 1.9)); tx(620, 330, 'P2 의 락은 그대로 남는다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD }); } return; }
    if (k === 5) { snippet(120, 60, ['lock = r.lock("order:42", timeout=30, blocking_timeout=5)', 'with lock:', '    process_order(42)'], { fs: 15, op: fade(u, 0.2) });
      [['SET … NX EX 30', 'timeout=30', ACC], ['5초까지 재시도', 'blocking_timeout=5', WARN], ['Lua 로 owner 확인 해제', 'with 블록 끝', GOOD]].forEach(([a, b, col], i) => {
        const cx = 190 + i * 290, sc = pop(u, 0.9 + i * 0.35); card(cx, 270, 260, 74, { rx: 10, stroke: col, s: sc, sw: 2.2 });
        if (sc > 0.3) { tx(cx, 264, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }); mono(cx, 288, b, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); } });
      tx(480, 370, '지금까지 직접 만든 것이 두 줄에 다 들어 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // 6. extend
    const p = E(u, 0.2, 1.2), jump = E(u, 1.5, 1.9), rem = lerp(30, 8, p) + 30 * jump;
    keyPanel(380, 60, 480, { key: 'lock:order:42', val: TOK, ttl: Math.round(rem) + 's', ttlCol: jump > 0.5 ? GOOD : WARN });
    proc(110, 110, 'P1', { lock: true, note: '작업 중…', noteCol: INFO });
    el('rect', { x: 380, y: 220, width: 480, height: 26, rx: 5, fill: SOFT });
    el('rect', { x: 380, y: 220, width: 480 * Math.min(rem, 60) / 60, height: 26, rx: 5, fill: jump > 0.5 ? GOOD : WARN });
    mono(380, 270, '남은 TTL', { 'font-size': 13.5, fill: MUT });
    fly(180, 120, 380, 120, seg(u, 1.1, 1.6), 'lock.extend(30)', { mono: true });
    if (u > 1.9) { mono(380 + 480 * Math.min(rem, 60) / 60 - 8, 238, '+30s', { 'font-size': 15, 'font-weight': 800, fill: PANEL, 'text-anchor': 'end' }); }
    tx(620, 330, 'token 이 맞을 때만 늘어난다 (Lua)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.1) }); }

  // =====================================================================
  // 4. Redlock — 독립 노드 5대
  const NX = 560, NYs = [56, 132, 208, 284, 360];
  function s4(t, c) { const { k, u } = c, v = c.beat.viz, pv = c.prev && c.prev.viz;
    const showClient = k !== 4;
    if (showClient) { card(120, 208, 150, 64, { rx: 10, stroke: INK, s: k === 0 ? pop(u, 0.1) : 1 }); mono(120, 204, 'client', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }); mono(120, 226, 'Redlock', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }); }
    const st = (i) => (k === 0 ? 'pending' : v.nodes[i].status);
    v.nodes.forEach((n, i) => { const y = NYs[i], s = k === 0 ? pop(u, 0.2 + i * 0.12) : 1, sv = st(i), reveal = k === 1 ? u > 1.0 + i * 0.15 : k === 4 ? u > 0.6 + i * 0.12 : true;
      const show = reveal ? sv : (pv ? pv.nodes[i].status : 'pending');
      const col = show === 'acquired' ? GOOD : show === 'failed' ? BAD : show === 'timeout' ? WARN : OFF;
      card(NX, y, 150, 52, { rx: 10, stroke: col === OFF ? INK : col, s, sw: 2.2 });
      if (s > 0.3) { mono(NX - 18, y + 6, 'redis' + (i + 1), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 });
        if (show === 'acquired') check(NX + 50, y, 9, 1); else if (show === 'failed') cross(NX + 50, y, 8, 1); else if (show === 'timeout') clock(NX + 50, y, 11, 0.75, WARN); else el('circle', { cx: NX + 50, cy: y, r: 7, fill: 'none', stroke: OFF, 'stroke-width': 2 }); }
      if (showClient && k <= 2) el('line', { x1: 195, y1: 208, x2: NX - 75, y2: y, stroke: GRID, 'stroke-width': 1.8, opacity: clamp(s) }); });
    // 과반 계기
    const acq = k === 0 ? 0 : pv && k !== 1 ? tween(pv.acquired, v.acquired, u) : v.acquired * E(u, 1.0, 1.9), q = v.quorum, gx = 720;
    tx(gx, 120, '확보 / 5', { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    mono(gx, 168, Math.round(acq) + ' / 5', { 'font-size': 34, 'font-weight': 800, fill: Math.round(acq) >= q ? GOOD : k === 0 ? INK : BAD });
    for (let i = 0; i < 5; i++) el('rect', { x: gx + i * 40, y: 186, width: 34, height: 26, rx: 4, fill: i < Math.round(acq) ? (Math.round(acq) >= q ? GOOD : BAD) : SOFT, stroke: GRID });
    el('line', { x1: gx + q * 40 - 3, y1: 178, x2: gx + q * 40 - 3, y2: 222, stroke: INK, 'stroke-width': 2.5 }); mono(gx + q * 40 - 3, 242, '과반 ' + q, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700 });
    if (k === 0) sub(120, 300, '서로 복제하지 않는 5대', fade(u, 1.0), { 'font-weight': 700, 'font-size': 14.5 });
    if (k === 1) { NYs.forEach((y, i) => dot([[195, 208], [NX - 75, y]], seg(u, 0.2, 1.0 + i * 0.1), ACC, 6));
      pill(120, 120, 'dlm.lock(ttl=10000)', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      if (u > 2.0) pill(820, 290, '락 확보', GOOD, pop(u, 2.0), { fs: 15 }); }
    if (k === 2) { NYs.forEach((y, i) => dot([[195, 208], [NX - 75, y]], seg(u, 0.4 + i * 0.05, 1.3 + i * 0.05), INK, 6));
      pill(120, 120, 'finally: dlm.unlock', INK, pop(u, 0.2), { mono: true, fs: 13.5 });
      sub(820, 300, '반납도 5대 모두에게', fade(u, 1.4), { 'font-weight': 700, 'font-size': 14.5 }); }
    if (k === 3) { const bw = 200, el2 = E(u, 0.3, 1.5) * 0.35;
      tx(gx, 290, '소요시간 < TTL ?', { 'font-size': 14.5, 'font-weight': 700 });
      el('rect', { x: gx, y: 302, width: bw, height: 20, rx: 4, fill: SOFT, stroke: GRID }); el('rect', { x: gx, y: 302, width: bw * el2, height: 20, rx: 4, fill: INFO });
      mono(gx + bw, 342, 'TTL 10000ms', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); if (u > 1.6) check(gx + bw + 20, 312, 9, pop(u, 1.6));
      pill(120, 330, '실패 시 → 전 노드 unlock', BAD, pop(u, 2.0), { fs: 13.5 }); }
    if (k === 4) { // 단일 primary failover 구멍
      zone(20, 30, 330, 360, '단일 노드 + replica', { fill: SOFT });
      card(110, 110, 130, 50, { rx: 8, stroke: ACC, text: 'primary', fs: 15, color: ACC }); pill(260, 110, 'lock = P1', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
      if (u > 0.6) cross(110, 110, 16, pop(u, 0.6));
      card(110, 230, 130, 50, { rx: 8, stroke: u > 1.1 ? ACC : INK, text: u > 1.1 ? '새 primary' : 'replica', fs: 15, color: u > 1.1 ? ACC : INK });
      grow(110, 136, 110, 204, 1, OFF, { dash: '5 4' }); if (u > 0.8) tx(130, 176, '복제 전에 죽음', { 'font-size': 13.5, 'font-weight': 700, fill: BAD });
      if (u > 1.4) pill(260, 230, '락 없음', BAD, pop(u, 1.4), { fs: 13.5 });
      if (u > 1.8) tx(185, 330, 'P2 도 잡는다 → 둘이 동시에', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) });
      if (u > 2.0) pill(820, 290, '과반 미달 → 락 안 줌', BAD, pop(u, 2.0), { fs: 14 }); }
    if (k === 5) { pill(820, 290, '단일 노드 99% 충분', GOOD, pop(u, 0.4), { fs: 14 }); pill(820, 340, '결제 → DB 트랜잭션', INFO, pop(u, 0.9), { fs: 14 });
      sub(120, 300, '보유 수초 · failover 드묾', fade(u, 1.4), { 'font-weight': 700, 'font-size': 14.5 }); } }

  // =====================================================================
  // 5. Fencing token — 시간줄 (0 ~ 70초)
  const FX0 = 150, FS = 10.4, FXs = (s) => FX0 + s * FS;
  function lanes(op) { [['P1', 90], ['P2', 170], ['lock', 250]].forEach(([n, y]) => { mono(40, y + 6, n, { 'font-size': 16, 'font-weight': 800, opacity: op }); el('line', { x1: FX0, y1: y, x2: FXs(70), y2: y, stroke: GRID, 'stroke-width': 2, opacity: op }); }); }
  function storage(x, y, last, o) { o = o || {}; el('rect', { x, y, width: 280, height: 120, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2.2 });
    tx(x + 14, y + 26, 'DB / storage', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    mono(x + 14, y + 60, 'last_token = ' + last, { 'font-size': 16, 'font-weight': 800 });
    mono(x + 14, y + 94, '받은 < last → 거부', { 'font-size': 14, fill: MUT }); }
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { lanes(1); const now = k === 0 ? E(u, 0.2, 2.4) * 55 : 55 + E(u, 0.2, 1.6) * 15;
      el('rect', { x: FXs(0), y: 80, width: FXs(Math.min(now, 5)) - FXs(0), height: 20, rx: 4, fill: INFO });
      pill(FXs(0) + 30, 56, 'token 33', INFO, k === 0 ? pop(u, 0.2) : 1, { mono: true, fs: 13.5 });
      if (now > 5) { el('rect', { x: FXs(5), y: 80, width: FXs(Math.min(now, 55)) - FXs(5), height: 20, rx: 4, fill: WARN, opacity: 0.35 }); tx(FXs(7), 95, 'GC pause 50s', { 'font-size': 14, 'font-weight': 800, fill: WARN }); }
      el('rect', { x: FXs(0), y: 240, width: FXs(Math.min(now, 30)) - FXs(0), height: 20, rx: 4, fill: INFO, opacity: 0.8 });
      if (now > 30) { el('line', { x1: FXs(30), y1: 60, x2: FXs(30), y2: 280, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '5 4' }); mono(FXs(30), 300, 'TTL 30s 만료', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: BAD }); }
      [0, 30, 55, 70].forEach((s) => mono(FXs(s), 330, s + 's', { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT }));
      if (k === 0 && u > 2.3) tx(480, 384, 'P1 은 멈춘 줄 모른다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: WARN });
      if (k === 1) { const p2 = FXs(30) + (FXs(70) - FXs(30)) * E(u, 0.2, 1.6);
        el('rect', { x: FXs(30.5), y: 160, width: p2 - FXs(30.5), height: 20, rx: 4, fill: ACC }); el('rect', { x: FXs(30.5), y: 240, width: p2 - FXs(30.5), height: 20, rx: 4, fill: ACC, opacity: 0.8 });
        pill(FXs(30) + 40, 136, 'token 34', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
        el('rect', { x: FXs(55), y: 80, width: Math.max(0, Math.min(now, 70) - 55) * FS, height: 20, rx: 4, fill: INFO });
        if (u > 1.4) { el('rect', { x: FXs(55), y: 70, width: FXs(70) - FXs(55), height: 120, rx: 6, fill: BAD, opacity: 0.15 });
          tx(FXs(62.5), 214, '동시 작업!', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD }); }
        if (u > 2.0) tx(480, 384, 'TTL 락은 만료를 홀더에게 알려 주지 못한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 2) { const n = u < 1.2 ? 33 : 34;
      el('rect', { x: 80, y: 90, width: 260, height: 150, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 }); tx(96, 118, '락마다 번호 +1', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      mono(210, 200, String(n), { 'text-anchor': 'middle', 'font-size': 56, 'font-weight': 800, fill: ACC, transform: u > 1.2 && u < 1.6 ? `translate(0 ${-8 * Math.sin((u - 1.2) / 0.4 * Math.PI)})` : null });
      pill(150, 290, 'P1 → 33', INFO, pop(u, 0.4), { mono: true, fs: 14 }); pill(280, 290, 'P2 → 34', ACC, pop(u, 1.3), { mono: true, fs: 14 });
      storage(560, 110, 34 * (u > 1.6 ? 1 : 0) || '…'); grow(350, 165, 552, 165, E(u, 1.6, 2.1), INFO);
      tx(700, 280, '저장소가 번호를 검사한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.0) }); return; }
    if (k === 3) { storage(560, 140, u > 1.0 ? 34 : 33);
      card(150, 110, 200, 52, { rx: 10, stroke: ACC, text: 'P2 write (34)', fs: 15, mono: true, color: ACC, s: pop(u, 0.2) });
      card(150, 290, 200, 52, { rx: 10, stroke: INFO, text: 'P1 write (33)', fs: 15, mono: true, color: INFO, s: pop(u, 1.2) });
      dot([[250, 110], [552, 170]], seg(u, 0.4, 1.0), ACC, 8); if (u > 1.0) { check(500, 110, 11, pop(u, 1.0)); mono(470, 90, 'OK', { 'font-size': 15, 'font-weight': 800, fill: GOOD, 'text-anchor': 'end' }); }
      dot([[250, 290], [480, 240]], seg(u, 1.4, 1.9), INFO, 8); if (u > 1.9) { cross(500, 250, 12, pop(u, 1.9)); tx(560, 300, '33 < 34 → stale, 거부', { 'font-size': 16, 'font-weight': 800, fill: BAD }); }
      tx(480, 390, '락이 아니라 쓰기 시점에서 막는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { terminal(30, 40, 430, 150, ['127.0.0.1:6379> INCR fence:order', '(integer) 33', '127.0.0.1:6379> INCR fence:order', '(integer) 34'], lerp(0, 4, E(u, 0.2, 1.5)), { fs: 14 });
      el('rect', { x: 520, y: 40, width: 400, height: 160, rx: 10, fill: PANEL, stroke: INFO, 'stroke-width': 2, opacity: fade(u, 1.4) });
      tx(536, 66, 'DB 테이블', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) });
      [['id', 'status', 'last_token']].concat([['42', 'paid', '34']]).forEach((r, i) => r.forEach((s, j) => mono(540 + j * 120, 104 + i * 40, s, { 'font-size': 15, 'font-weight': i ? 600 : 800, fill: j === 2 ? (i ? ACC : ACC) : i ? INK : MUT, opacity: fade(u, 1.5 + (j === 2 ? 0.4 : 0)) })));
      if (u > 1.9) el('rect', { x: 772, y: 82, width: 130, height: 76, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5 });
      tx(480, 270, '번호는 Redis 가 만들 수 있지만', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(480, 302, '검증은 DB 가 해 줘야 의미가 있다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { const rows = [['일반 비즈니스 (중복 1~2번 OK)', 'redis-py Lock', GOOD], ['결제 / 잔고 (절대 동시 금지)', 'DB 트랜잭션 + Row lock', INFO], ['분산 환경 + 가용성', 'Redlock + fencing token', ACC], ['Saga / 보상 트랜잭션', '메시지 큐 (Stream)', WARN]];
      tx(480, 48, '이 작업이 두 번 실행되면 무슨 일이 나는가?', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800 });
      rows.forEach(([a, b, col], i) => { const y = 100 + i * 72, s = pop(u, 0.3 + i * 0.35);
        card(260, y, 400, 54, { rx: 10, stroke: GRID, s }); if (s > 0.3) tx(80, y + 6, a, { 'font-size': 15, 'font-weight': 700 });
        grow(464, y, 556, y, E(u, 0.5 + i * 0.35, 0.8 + i * 0.35), col);
        card(720, y, 300, 54, { rx: 27, stroke: col, s, sw: 2.2 }); if (s > 0.3) mono(720, y + 6, b, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: col }); }); return; }
    tx(480, 150, 'Redis 락은 99% 케이스에 충분', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, opacity: fade(u, 0.2, 0.8) });
    tx(480, 196, '절대 동시성 금지면 DB 트랜잭션 + fencing', { 'text-anchor': 'middle', 'font-size': 17, fill: MUT, opacity: fade(u, 0.9) });
    [['SETNX', '→ SET NX EX', BAD], ['DEL', '→ Lua owner 확인', WARN], ['단일 노드', '→ Redlock 과반', INFO], ['TTL 만료', '→ fencing token', ACC]].forEach(([a, b, col], i) => { const s = pop(u, 1.2 + i * 0.25), cx = 150 + i * 220;
      card(cx, 290, 200, 76, { rx: 10, stroke: col, s, sw: 2 }); if (s > 0.3) { mono(cx, 284, a, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col }); tx(cx, 308, b, { 'text-anchor': 'middle', 'font-size': 14, fill: INK }); } }); }

  R.page({ title: '분산 락 시뮬레이션', scenes: [s1, s2, s3, s4, s5] });
})();
