/* V-2-1 멀티스레딩 기초 — mutex·atomic — 장면 6개 (../../anim/engine.js 규칙을 따른다)
 * 스레드·인터리빙·잠금·순환 대기·CAS·고수준 도구는 STEPS 의 threads · lifecycle · interleave · gate · raii · cycle · fix · cas · vsVolatile · tools 를 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const TONE = { good: GOOD, mid: WARN, bad: BAD };
  const num = (v) => Math.round(v).toLocaleString('en-US');
  // 스레드 표시: 동그라미 + 이름
  function thr(x, y, name, col, o) { o = o || {}; const g = R.G(x, y, o.s ?? 1, o.op ?? 1);
    el('circle', { cx: 0, cy: 0, r: o.r || 22, fill: o.fill || PANEL, stroke: col || INK, 'stroke-width': 2.8 }, g);
    tx(0, 6, name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col || INK }, g); return g; }
  // 실행 흐름 한 줄 (x1 → x2 를 u 만큼). o.wait 면 점선
  function lane(x1, x2, y, u, col, o) { o = o || {}; if (u <= 0) return; el('line', { x1, y1: y, x2: lerp(x1, x2, clamp(u)), y2: y, stroke: col, 'stroke-width': o.sw || 5, 'stroke-linecap': 'round', 'stroke-dasharray': o.wait ? '2 9' : null, opacity: o.op ?? 1 }); }
  function codeChips(list, y, oldN, u) { let x = 40;
    list.forEach((l, i) => { const w = tw(l.code, 13.5) + 26, isNew = i >= oldN, s = isNew ? pop(u, 1.4) : 1, col = TONE[l.tone] || INK;
      card(x + w / 2, y, w, 34, { rx: 8, text: l.code, mono: true, fs: 13.5, fw: 700, stroke: col, color: col, s, fill: isNew ? ACCBG : PANEL }); x += w + 12; }); }

  // ---------- 1. std::thread ----------
  function s1(t, c) { const { k, u } = c, life = c.beat.lifecycle || [], oldL = (c.prev && c.prev.lifecycle || []).length;
    const MY = 110, WY = 230, FX = 230;
    tx(40, MY + 6, 'main', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: INFO });
    if (k === 0) { lane(110, 900, MY, E(u, 0.2, 2.2), INFO);
      card(480, WY, 300, 64, { rx: 10, dash: '6 5', stroke: MUT, s: pop(u, 0.6) }); mono(480, WY + 5, 'void work(int id) { … }', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.7) });
      note(480, WY + 60, '함수일 뿐, 아직 흐름이 아니다', fade(u, 1.4), { 'text-anchor': 'middle', fill: MUT });
      codeChips(life, 370, 0, u); return; }
    const fu = k === 1 ? E(u, 0.3, 1.1) : 1;
    // fork: main 에서 갈라져 worker 줄이 생긴다
    lane(110, FX, MY, 1, INFO);
    el('path', { d: `M${FX},${MY} C${FX + 40},${MY} ${FX + 20},${WY} ${FX + 70},${WY}`, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: fu });
    tx(40, WY + 6, 'worker', { 'font-size': 16, 'font-weight': 800, class: 'mono', fill: ACC, opacity: fu });
    if (k === 1) pill(FX, MY - 40, 'std::thread t(work, 1);', ACC, pop(u, 0.2), { mono: true, fs: 13.5 });
    const WEND = 640;
    if (k <= 2) { lane(FX, 900, MY, k === 1 ? E(u, 0.6, 2.4) : 1, INFO); lane(FX + 70, 860, WY, k === 1 ? E(u, 1.0, 2.6) : 1, ACC);
      if (k === 2) { [['실행 1', ['main 은 계속 진행', 'worker 1 실행']], ['실행 2', ['worker 1 실행', 'main 은 계속 진행']]].forEach(([n, ls], i) => { const x = 160 + i * 380, s = pop(u, 0.4 + i * 0.6);
          card(x + 140, 330, 300, 80, { rx: 8, fill: INK, stroke: 'none', s }); mono(x + 8, 312, n, { 'font-size': 13.5, fill: OFF, opacity: s });
          ls.forEach((l, j) => mono(x + 8, 336 + j * 22, l, { 'font-size': 14, fill: 'var(--term)', opacity: fade(u, 0.7 + i * 0.6 + j * 0.2) })); });
        note(480, 280, '누가 먼저 찍힐지 정해져 있지 않다', fade(u, 1.8), { 'text-anchor': 'middle', fill: WARN }); }
      return; }
    lane(FX + 70, WEND, WY, 1, ACC);
    if (k === 3 || k === 5) { // join: main 이 worker 끝까지 기다렸다 합류
      lane(FX, 470, MY, 1, INFO); lane(470, WEND + 30, MY, k === 3 ? E(u, 0.2, 1.4) : 1, INFO, { wait: true });
      el('path', { d: `M${WEND},${WY} C${WEND + 30},${WY} ${WEND},${MY} ${WEND + 40},${MY}`, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: k === 3 ? fade(u, 1.4) : 1 });
      lane(WEND + 40, 900, MY, k === 3 ? E(u, 1.6, 2.4) : 1, INFO);
      pill(470, MY - 40, 't.join();', GOOD, k === 3 ? pop(u, 0.2) : 1, { mono: true, fs: 14 });
      sub(560, MY + 30, '기다림', k === 3 ? fade(u, 0.8) : 1, { fill: INFO, 'font-weight': 700 }); }
    if (k === 4) { lane(FX, 560, MY, 1, INFO); el('line', { x1: 560, y1: MY - 18, x2: 560, y2: MY + 18, stroke: INK, 'stroke-width': 4 });
      sub(560, MY + 40, 'main 종료', fade(u, 0.6), { 'font-weight': 700 });
      pill(400, MY - 40, 't.detach();', WARN, pop(u, 0.2), { mono: true, fs: 14 });
      lane(WEND, 900, WY, E(u, 0.6, 2.0), ACC, { wait: true });
      cross(FX + 36, (MY + WY) / 2, 11, pop(u, 0.5));
      note(600, WY + 46, '혼자 계속 돈다 · 사라진 지역 변수를 잡으면 크래시', fade(u, 1.6), { fill: WARN, 'font-size': 14 }); }
    if (k === 5) { const s = pop(u, 0.9); el('rect', { x: 30, y: 60, width: 900, height: 220, rx: 14, fill: BADBG, opacity: fade(u, 0.6) * 0.8 });
      card(480, 180, 520, 70, { rx: 12, stroke: BAD, sw: 3, s }); mono(480, 175, '~thread() → std::terminate()', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: s });
      tx(480, 198, 'join도 detach도 없이 t가 파괴되면 프로그램이 죽는다', { 'font-size': 14, 'text-anchor': 'middle', fill: INK, opacity: s }); }
    codeChips(life, 370, oldL, u); }

  // ---------- 2. 레이스 ----------
  const CX = 480, CY = 100, T1 = [150, 220], T2 = [810, 220];
  function counterCell(v, col, s, label) { card(CX, CY, 170, 70, { rx: 10, stroke: col || INK, sw: 3, fill: PANEL, s: s ?? 1 });
    mono(CX, CY + 12, String(v), { 'font-size': 32, 'font-weight': 800, 'text-anchor': 'middle', fill: col || INK });
    mono(CX, CY - 46, label || 'int counter', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 }); }
  function reg(p, v, col, name) { thr(p[0], p[1] - 40, name, col); card(p[0], p[1] + 18, 90, 40, { rx: 6, text: v == null ? '' : String(v), mono: true, fs: 18, fw: 800, stroke: col, fill: PANEL });
    sub(p[0], p[1] + 54, '레지스터', 1); }
  function s2(t, c) { const { k, u } = c, iv = c.beat.interleave || [], nOld = (c.prev && c.prev.interleave || []).length;
    let cval = k === 0 ? '0' : '5', r1 = null, r2 = null;
    iv.forEach((e, i) => { if (/초기값/.test(e.op)) return; const done = i < nOld || u > 1.6;
      if (/read/.test(e.op) && done) { if (e.t === 'T1') r1 = e.val; else r2 = e.val; }
      if (/write/.test(e.op) && done) { cval = e.val; if (e.t === 'T1') r1 = e.val; else r2 = e.val; } });
    const last = iv[iv.length - 1], isNew = iv.length > nOld, lostHot = k >= 4;
    counterCell(cval, lostHot ? BAD : INK, 1, 'int counter  (보호 없음)');
    if (k >= 1) { reg(T1, r1, INFO, 'T1'); }
    if (k >= 2) { reg(T2, r2, ACC, 'T2'); }
    if (k === 1) ['읽기', '+1', '쓰기'].forEach((s, i) => pill(300 + i * 90, 300, s, WARN, pop(u, 1.0 + i * 0.25), { fs: 14 }));
    if (k === 1) note(300, 344, '++counter 한 줄이 세 동작으로 쪼개진다', fade(u, 1.8), { 'font-size': 14 });
    // 이번 beat 의 동작이 날아간다
    if (isNew && last && k >= 1 && k <= 4) { const P = last.t === 'T1' ? T1 : T2, col = last.ghost ? BAD : last.t === 'T1' ? INFO : ACC;
      if (/read/.test(last.op)) fly(CX, CY + 30, P[0], P[1] + 18, seg(u, 0.4, 1.5), last.val, { fill: col, mono: true });
      else fly(P[0], P[1] + 18, CX, CY + 30, seg(u, 0.5, 1.6), last.val, { fill: col, mono: true }); }
    if (k === 4) { pill(CX, CY + 66, '6 위에 6을 덮어씀 · 증가 한 번 유실', BAD, pop(u, 1.8), { fs: 14 }); }
    // 아래: 인터리빙 순서
    if (k >= 1 && k <= 4) iv.forEach((e, i) => { const x = 130 + i * 230, s = i >= nOld ? pop(u, 0.3) : 1, col = e.ghost ? BAD : e.t === 'T1' ? INFO : ACC;
      card(x, 384, 210, 40, { rx: 8, stroke: col, sw: 2, s, fill: e.ghost ? BADBG : PANEL }); mono(x - 92, 389, `${e.t}  ${e.op.replace('counter', '').replace(', write', ' 쓰기').replace('read', '읽기').trim()}`, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: s }); });
    if (k === 5) { const exp = +c.beat.expected, got = +c.beat.got;
      [['기대값', exp, GOOD], ['실제 출력', got, BAD]].forEach(([n, v, col], i) => { const y = 290 + i * 50; tx(120, y + 15, n, { 'font-size': 15, 'font-weight': 800 });
        R.hbar(240, y, 520, v, exp, { col, h: 24, text: num(v), u: E(u, 0.3 + i * 0.5, 1.4 + i * 0.5) }); });
      note(240, 400, `${num(exp - got)}번의 증가가 사라졌다 · 실행마다 값이 다르다`, fade(u, 2.0), { fill: BAD }); } }

  // ---------- 3. mutex + lock_guard ----------
  function s3(t, c) { const { k, u } = c, gate = c.beat.gate || [], pg = (c.prev && c.prev.gate) || gate, raii = c.beat.raii || [], oldR = (c.prev && c.prev.raii || []).length;
    const GX = 420;
    zone(GX + 40, 40, 460, 230, '임계 구역', { fill: SOFT });
    el('line', { x1: GX, y1: 40, x2: GX, y2: 270, stroke: INK, 'stroke-width': 4 });
    const anyIn = gate.some((g) => g.status === 'in');
    lock(GX, 155, anyIn, anyIn ? BAD : GOOD, 1.6); mono(GX, 290, 'mutex m', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 });
    // counter
    const cv = k === 0 || k === 1 ? 0 : k === 2 || k === 3 ? 1 : k === 4 ? Math.round(lerp(1, 200000, E(u, 0.2, 2.6))) : 200000;
    card(760, 155, 180, 70, { rx: 10, stroke: k === 5 ? GOOD : INK, sw: 3 }); mono(760, 167, num(cv), { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 5 ? GOOD : INK });
    mono(760, 108, 'counter', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, 'font-weight': 700 });
    const pos = (g, i, list) => { if (g.status === 'in') return [560, 155]; const q = list.filter((x, j) => x.status !== 'in' && j < i).length; return [300 - q * 70, 155]; };
    gate.forEach((g, i) => { const pr = pg.find((x) => x.name === g.name) || g, a = pos(pr, pg.indexOf(pr), pg), b = pos(g, i, gate);
      const f = k === 4 ? (Math.floor(t * 1.5) % 2 === i ? 1 : 0) : E(u, 0.3, 1.2), p = k === 4 ? (f ? [560, 155] : [300, 155]) : [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
      thr(p[0], p[1], g.name, g.name === 'T1' ? INFO : ACC, { fill: (k === 4 ? f : g.status === 'in') ? (g.name === 'T1' ? INFOBG : ACCBG) : PANEL });
      if (k !== 4 && g.status === 'wait' && k >= 1) sub(p[0], p[1] + 44, '대기', 1, { fill: WARN, 'font-weight': 700 }); });
    if (k === 2) fly(590, 155, 680, 155, seg(u, 0.6, 1.6), '+1', { fill: INFO, mono: true });
    if (k === 4) sub(640, 250, '두 스레드가 번갈아 들어가며 10만 번씩', fade(u, 0.5), { 'font-weight': 700 });
    // RAII 코드: 줄이 하나씩 생긴다
    zone(40, 300, 880, 108, null, { fill: PANEL, stroke: GRID, sw: 1.5 });
    raii.forEach((r, i) => { const s = i >= oldR ? fade(u, 0.3) : 1, y = 328 + i * 26;
      mono(60, y, r.code, { 'font-size': 15, 'font-weight': 700, fill: i >= oldR ? ACC : INK, opacity: s }); tx(360, y, r.label, { 'font-size': 14, fill: MUT, opacity: s }); });
    if (k === 3) { el('rect', { x: 52, y: 328 + 2 * 26 - 18, width: 140, height: 24, rx: 5, fill: 'none', stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.5) }); } }

  // ---------- 4. 데드락 ----------
  const LK = { A: [250, 200], B: [710, 200] }, TH = { T1: [480, 80], T2: [480, 320] };
  const has = (s, m) => s && s !== '없음' && new RegExp('(^|[^A-Za-z])' + m + '([^A-Za-z]|$)').test(s.replace('mutex ', ''));
  function s4(t, c) { const { k, u } = c, cy = c.beat.cycle || [], fx = c.beat.fix || {}, pcy = (c.prev && c.prev.cycle) || [];
    ['A', 'B'].forEach((m) => { const [x, y] = LK[m]; card(x, y, 120, 76, { rx: 12, stroke: INK, sw: 2.5, fill: SOFT });
      lock(x - 22, y + 4, cy.some((q) => has(q.holds, m)), INK, 1.2); mono(x + 22, y + 10, m, { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle' }); });
    const isCycle = cy.every((q) => q.waits && q.waits !== '없음' && !/한 번에/.test(q.waits) && !/한 번에/.test(q.holds));
    cy.forEach((q) => { const [x, y] = TH[q.who], col = q.who === 'T1' ? INFO : ACC, old = pcy.find((p) => p.who === q.who) || {};
      thr(x, y, q.who, col, { r: 26 });
      ['A', 'B'].forEach((m) => { const [lx, ly] = LK[m], dx = lx < 480 ? 60 : -60, dy = y < 200 ? -30 : 30;
        const ax = lx + dx, ay = ly + dy, tx0 = x + (lx < 480 ? -28 : 28), ty0 = y;
        if (has(q.holds, m)) { const nw = !has(old.holds, m), g = nw ? E(u, 0.3, 1.0) : 1; el('line', { x1: ax, y1: ay, x2: lerp(ax, tx0, g), y2: lerp(ay, ty0, g), stroke: col, 'stroke-width': 4 });
          if (g > 0.9) tx((ax + tx0) / 2 + (lx < 480 ? -30 : 30), (ay + ty0) / 2 + (y < 200 ? -6 : 18), '쥠', { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); }
        if (has(q.waits, m)) { const nw = !has(old.waits, m), g = nw ? E(u, 0.8, 1.6) : 1, hot = isCycle;
          el('line', { x1: tx0, y1: ty0, x2: lerp(tx0, ax, g), y2: lerp(ty0, ay, g), stroke: hot ? BAD : col, 'stroke-width': 2.8, 'stroke-dasharray': '7 6', 'marker-end': g > 0.98 ? 'url(#ra-ahr)' : null });
          if (g > 0.9) tx((ax + tx0) / 2 + (lx < 480 ? 34 : -34), (ay + ty0) / 2 + (y < 200 ? 22 : -10), '기다림', { 'font-size': 14, 'font-weight': 800, fill: hot ? BAD : col, 'text-anchor': 'middle' }); } });
      if (/한 번에/.test(q.holds)) pill(x, y - 46, 'scoped_lock lk(A, B)', GOOD, pop(u, 0.4), { mono: true, fs: 13.5 });
      if (/한 번에/.test(q.waits)) pill(x + 210, y, 'A와 B가 함께 풀리길 기다림', MUT, pop(u, 0.8), { fs: 13.5 }); });
    if (isCycle && (k === 2 || k === 3 || k === 5)) { for (let j = 0; j < 2; j++) dot([LK.A, TH.T1, LK.B, TH.T2, LK.A], ((t * 0.35 + j / 2) % 1), BAD, 6);
      if (k === 2) pill(480, 200, '순환 대기 · 아무도 못 움직인다', BAD, pop(u, 1.8), { fs: 14 }); }
    // 아래: 나쁜 방식 / 고친 방식
    if (fx.bad) { cross(56, 380, 8); mono(74, 385, fx.bad, { 'font-size': 13.5, fill: BAD, 'font-weight': 700 }); }
    if (fx.good) { const s = (c.prev && c.prev.fix && c.prev.fix.good === fx.good) ? 1 : fade(u, 1.0); check(56, 408, 8, s); tx(74, 413, fx.good, { 'font-size': 13.5, fill: GOOD, 'font-weight': 700, class: /lock|scoped/.test(fx.good) ? 'mono' : null, opacity: s }); }
    if (k === 5) banner(760, 395, '적게 · 짧게 · 같은 순서로', pop(u, 1.6)); }

  // ---------- 5. atomic ----------
  function s5(t, c) { const { k, u } = c, cas = c.beat.cas || [], vv = c.beat.vsVolatile || [], oldV = (c.prev && c.prev.vsVolatile || []).length;
    // 위: 카운터와 동작
    if (k <= 3) { const v = k <= 1 ? 5 : k === 2 ? Math.round(lerp(5, 200000, E(u, 0.3, 2.6))) : 200000;
      counterCell(num(v), k === 3 ? GOOD : ACC, k === 0 ? pop(u, 0.2) : 1, 'std::atomic<int> counter');
      pill(CX, CY + 60, '락 없음 (lock-free)', GOOD, k === 0 ? pop(u, 0.8) : 1, { fs: 13.5 }); }
    if (k === 1) { const m = E(u, 0.6, 1.6); ['읽기', '+1', '쓰기'].forEach((s, i) => card(lerp(130 + i * 120, 230 + i * 60, m), 110, lerp(100, 60, m), 40, { rx: 6, text: s, fs: 14, fw: 800, stroke: WARN, color: INK }));
      el('rect', { x: 192, y: 82, width: 196, height: 56, rx: 10, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 1.6) });
      mono(290, 170, 'fetch_add(1)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.7) });
      sub(290, 194, '쪼갤 수 없는 한 동작', fade(u, 1.9), { 'font-weight': 700 }); }
    if (k === 2) { thr(150, 100, 'T1', INFO); thr(810, 100, 'T2', ACC);
      for (let j = 0; j < 4; j++) { dot([[176, 100], [392, 100]], ((t * 0.9 + j / 4) % 1), INFO, 5); dot([[784, 100], [568, 100]], ((t * 0.9 + j / 4 + 0.12) % 1), ACC, 5); } }
    // CAS 단계 (데이터): 아래 왼쪽
    if (k <= 3) { tx(40, 232, 'CAS 한 바퀴', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      cas.forEach((s, i) => { const x = 40 + i * 300, isNew = i >= ((c.prev && c.prev.cas) || []).length, sc = isNew ? pop(u, 0.5) : 1, col = s.step === 'CAS' ? GOOD : INFO;
        card(x + 135, 262, 280, 40, { rx: 8, stroke: col, sw: 2, s: sc, fill: isNew ? ACCBG : PANEL });
        mono(x + 14, 267, s.step, { 'font-size': 14, 'font-weight': 800, fill: col, opacity: sc }); tx(x + 90, 267, s.text.replace('counter==5 이면 6 으로 교체, 아니면 재시도', '5면 6으로 · 아니면 재시도'), { 'font-size': 13.5, opacity: sc });
        if (i) grow(x - 18, 262, x - 6, 262, sc, MUT); });
      if (k === 3) { el('path', { d: 'M880,282 C880,320 40,320 40,282', fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.8), 'marker-end': 'url(#ra-ah)' });
        sub(480, 318, '다른 스레드가 먼저 바꿨으면 다시 읽고 다시 시도', fade(u, 1.0), { fill: WARN, 'font-weight': 700 }); } }
    // 복합 연산 레이스
    if (k === 4) { const y1 = 80, y2 = 170, steps = [[0, 'T1', 'load() → 1 > 0 ✓'], [1, 'T2', 'load() → 1 > 0 ✓'], [2, 'T1', 'store(load() - 1) → 0'], [3, 'T2', 'store(load() - 1) → -1']];
      mono(40, 40, 'if (counter.load() > 0) counter.store(counter.load() - 1);', { 'font-size': 15, 'font-weight': 700 });
      steps.forEach(([i, who, s]) => { const y = who === 'T1' ? y1 : y2, x = 120 + i * 200, sc = pop(u, 0.3 + i * 0.45), col = i === 3 ? BAD : who === 'T1' ? INFO : ACC;
        card(x + 80, y, 190, 44, { rx: 8, stroke: col, sw: 2, s: sc }); mono(x - 6, y + 5, s, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: sc }); });
      thr(60, y1, 'T1', INFO, { r: 20 }); thr(60, y2, 'T2', ACC, { r: 20 });
      note(120, 236, '각 연산은 원자적이어도, 연산 사이에 다른 스레드가 끼어든다', fade(u, 2.0), { fill: BAD, 'font-size': 14 }); }
    // 아래: volatile vs atomic 표
    const TY = k === 4 ? 268 : 340; if (vv.length) { tx(250, TY, 'volatile', { 'font-size': 14, 'font-weight': 800, fill: BAD, class: 'mono' }); tx(600, TY, 'std::atomic', { 'font-size': 14, 'font-weight': 800, fill: GOOD, class: 'mono' }); }
    vv.forEach((r, i) => { const y = TY + 24 + i * 24, s = i >= oldV ? fade(u, 0.5) : 1, strip = (x) => x.replace(/\s*[❌✔]\s*/gu, '');
      tx(40, y, r.aspect, { 'font-size': 13.5, 'font-weight': 700, opacity: s }); tx(250, y, strip(r.vol), { 'font-size': 13.5, fill: BAD, opacity: s }); tx(600, y, strip(r.at), { 'font-size': 13.5, fill: GOOD, opacity: s }); }); }

  // ---------- 6. 고수준 도구 ----------
  function s6(t, c) { const { k, u } = c, tools = c.beat.tools || [], oldT = (c.prev && c.prev.tools || []).length;
    if (k === 0) { ['#include <future>', '#include <condition_variable>'].forEach((s, i) => pill(250, 90 + i * 50, s, INFO, pop(u, 0.3 + i * 0.3), { mono: true, fs: 14 }));
      card(650, 115, 240, 60, { rx: 10, text: 'int compute() { return 42; }', mono: true, fs: 14, stroke: ACC, s: pop(u, 1.0) });
      note(480, 230, 'thread를 직접 만들기 전에, 맞는 도구가 있는지 먼저 본다', fade(u, 1.6), { 'text-anchor': 'middle' }); }
    if (k === 1 || k === 2) { const MY = 90, WY = 190;
      tx(40, MY + 6, 'main', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: INFO }); lane(110, 300, MY, 1, INFO);
      el('path', { d: `M300,${MY} C340,${MY} 320,${WY} 370,${WY}`, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: k === 1 ? fade(u, 0.4) : 1 });
      lane(370, 640, WY, k === 1 ? E(u, 0.6, 2.4) : 1, ACC); tx(40, WY + 6, 'async', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC });
      mono(500, WY + 30, 'compute()', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC });
      card(470, MY - 46, 170, 40, { rx: 8, stroke: INFO, sw: 2, text: k === 2 && u > 1.8 ? 'future = 42' : 'future<int> f', mono: true, fs: 14, fw: 800, fill: k === 2 && u > 1.8 ? GOODBG : PANEL, s: k === 1 ? pop(u, 0.5) : 1 });
      if (k === 1) { lane(300, 900, MY, E(u, 0.6, 2.4), INFO); pill(300, MY + 40, 'std::async(launch::async, compute)', ACC, pop(u, 0.2), { mono: true, fs: 13.5 }); }
      else { lane(300, 560, MY, 1, INFO); lane(560, 660, MY, E(u, 0.2, 1.5), INFO, { wait: true });
        el('path', { d: `M640,${WY} C680,${WY} 650,${MY} 690,${MY}`, fill: 'none', stroke: ACC, 'stroke-width': 4, opacity: fade(u, 1.4) });
        fly(640, WY, 680, MY, seg(u, 1.4, 1.9), '42', { mono: true }); lane(690, 900, MY, E(u, 1.9, 2.6), INFO);
        pill(560, MY - 46 + 92, 'f.get()', GOOD, pop(u, 0.2), { mono: true, fs: 14 }); sub(470, MY + 56, '결과가 올 때까지 기다림', fade(u, 0.6), { fill: INFO, 'font-weight': 700 }); } }
    if (k >= 3) { // 대기·통지 세트
      [['std::mutex m', 140], ['condition_variable cv', 400], [k === 5 && u > 1.0 ? 'ready = true' : 'ready = false', 680]].forEach(([s, x], i) => card(x + 60, 60, 230, 44, { rx: 8, text: s, mono: true, fs: 14, fw: 800, stroke: i === 2 && k === 5 && u > 1.0 ? GOOD : INK, s: k === 3 ? pop(u, 0.3 + i * 0.3) : 1 }));
      if (k === 3) { pill(480, 140, 'std::unique_lock<std::mutex> lk(m);', INFO, pop(u, 1.4), { mono: true, fs: 13.5 }); note(480, 190, 'wait 중에 락을 풀었다 다시 잡아야 해서 unique_lock', fade(u, 1.8), { 'text-anchor': 'middle', 'font-size': 14 }); }
      if (k >= 4) { const woke = k === 5 && u > 1.6;
        thr(200, 190, '소비자', woke ? GOOD : MUT, { r: 34, fill: woke ? GOODBG : SOFT }); lock(270, 160, !woke ? false : true, woke ? GOOD : MUT, 1);
        if (!woke) { [0, 1, 2].forEach((j) => { const p = ((t * 0.6 + j / 3) % 1); tx(240 + p * 40, 160 - p * 50, 'z', { 'font-size': 14 + p * 8, 'font-weight': 800, fill: MUT, opacity: 1 - p }); }); }
        mono(200, 254, 'cv.wait(lk, [&]{ return ready; });', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'start', fill: INK, opacity: k === 4 ? fade(u, 0.3) : 1 });
        if (k === 4) note(200, 284, '조건이 거짓이면 락을 놓고 잠든다 · 가짜 기상은 술어가 거른다', fade(u, 1.2), { 'font-size': 14 });
        if (k === 5) { thr(560, 190, '생산자', ACC, { r: 34 }); grow(520, 190, 245, 190, E(u, 1.0, 1.6), ACC); pill(400, 160, 'notify_one()', ACC, pop(u, 0.9), { mono: true, fs: 13.5 });
          // 스레드 풀
          zone(660, 140, 270, 150, '스레드 풀', { fill: SOFT });
          for (let w = 0; w < 4; w++) thr(700 + w * 62, 250, 'w' + (w + 1), INFO, { r: 18 });
          for (let q = 0; q < 5; q++) { const p = ((t * 0.5 + q / 5) % 1); el('rect', { x: 690 + p * 220, y: 180, width: 20, height: 20, rx: 4, fill: WARN, opacity: 0.9 }); } } } }
    // 아래: 고른 도구
    tools.forEach((tl, i) => { const x = 40 + i * 300, s = i >= oldT ? pop(u, 0.4) : 1;
      card(x + 140, 368, 284, 62, { rx: 10, stroke: GOOD, sw: 2, s, fill: i >= oldT ? GOODBG : PANEL });
      mono(x + 12, 362, tl.name, { 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: s }); tx(x + 12, 386, tl.use, { 'font-size': 13.5, fill: MUT, opacity: s }); }); }

  const quiz = [
    { q: 'std::thread 객체가 join도 detach도 없이 소멸되면 어떻게 되는가?',
      o: ['스레드가 자동으로 join된다', 'std::terminate가 불려 프로그램이 죽는다', '스레드가 조용히 detach된다'], a: 1,
      why: 'std::thread의 소멸자는 아직 join할 수 있는 스레드를 만나면 std::terminate를 부른다. 확신이 없으면 join이 기본값이다.' },
    { q: '두 스레드가 각자 ++counter를 10만 번 해도 200000이 안 나오는 이유는 무엇인가?',
      o: ['++counter가 읽기, +1, 쓰기로 쪼개져 서로의 갱신을 덮어쓴다', 'int가 200000을 담지 못한다', '스레드 하나가 늦게 시작한다'], a: 0,
      why: '두 스레드가 같은 5를 읽고 둘 다 6을 쓰면 증가 한 번이 사라진다. -O0 빌드에서 이 PC의 결과는 100102~155797로 매번 달랐다.' },
    { q: 'lock_guard를 쓰면 unlock을 빼먹을 위험이 사라지는 이유는 무엇인가?',
      o: ['컴파일러가 unlock 호출을 자동으로 넣어 준다', 'mutex가 일정 시간 뒤 스스로 풀린다', '스코프를 벗어날 때 소멸자가 unlock하므로 return이나 예외에도 풀린다'], a: 2,
      why: 'RAII다. 생성될 때 잠그고 소멸자에서 풀기 때문에 어떤 경로로 스코프를 나가도 락이 남지 않는다.' },
    { q: 'T1은 A, B 순서로, T2는 B, A 순서로 락을 잡는다. 생길 수 있는 문제는 무엇인가?',
      o: ['서로 상대의 락을 기다리며 멈추는 데드락', '증가가 사라지는 레이스 컨디션', '캐시 라인이 겹치는 false sharing'], a: 0,
      why: '각자 하나를 쥐고 상대가 쥔 것을 기다리면 순환 대기가 된다. 같은 순서로 잡거나 std::scoped_lock(A, B)로 한 번에 잡는다.' },
    { q: 'volatile int 대신 std::atomic<int>를 써야 하는 이유는 무엇인가?',
      o: ['volatile이 더 느려서', 'volatile은 원자성도 스레드 사이 순서도 보장하지 않아서', 'atomic이 메모리를 덜 써서'], a: 1,
      why: 'volatile은 컴파일러가 읽기와 쓰기를 없애지 못하게 할 뿐이다. 공유 변수에는 원자성과 메모리 순서를 보장하는 atomic이 필요하다.' },
    { q: 'cv.wait(lk)를 술어 없이 쓰면 생기는 문제는 무엇인가?',
      o: ['컴파일되지 않는다', 'mutex가 영원히 잠긴다', '아무도 통지하지 않았는데 깨어나는 가짜 기상을 걸러내지 못한다'], a: 2,
      why: 'cv.wait(lk, [&]{ return ready; })는 깨어날 때마다 조건을 다시 보고, 거짓이면 다시 잠든다.' },
  ];

  // 완료 화면: 정리 3~4줄, 복습 문제 3개
  const summary = [
    'std::thread는 만들자마자 따로 돈다. 소멸 전에 join이나 detach를 꼭 불러야 하고, 기본은 join이다.',
    '++counter는 읽기, +1, 쓰기로 쪼개진다. 보호 없이 두 스레드가 돌리면 증가가 사라진다.',
    '공유 변수는 lock_guard로 감싸고, 락이 여럿이면 scoped_lock으로 한 번에 잡는다.',
    '단순 카운터는 std::atomic이면 충분하고, volatile은 동시성 도구가 아니다.',
  ];
  const review = [
    { q: '로그를 쓰는 스레드를 detach했더니 가끔 크래시가 난다. 그 스레드는 main의 지역 문자열을 참조로 받는다. 먼저 의심할 것은?',
      o: ['main이 끝나 지역 문자열이 사라진 뒤에도 스레드가 그것을 읽는다', 'detach한 스레드가 너무 빨리 끝난다', '로그 파일이 너무 크다'], a: 0,
      why: 'detach된 스레드는 기다려 주는 쪽이 없다. 지역 변수를 참조하는 작업이면 join하거나 값을 복사해 넘긴다.' },
    { q: '이체 함수가 보내는 계좌와 받는 계좌의 mutex를 차례로 잡는다. 두 사람이 서로에게 동시에 이체하자 프로그램이 멈췄다. 고칠 방법은?',
      o: ['mutex를 atomic으로 바꾼다', 'std::scoped_lock으로 두 계좌의 락을 한 번에 잡는다', 'lock_guard 대신 lock()과 unlock()을 직접 부른다'], a: 1,
      why: '두 이체가 엇갈린 순서로 락을 잡아 순환 대기가 생겼다. scoped_lock은 여러 락을 데드락 없이 한꺼번에 얻는다.' },
    { q: '재고를 std::atomic<int> stock으로 바꿨는데도 가끔 -1이 된다. 코드는 if (stock.load() > 0) stock.store(stock.load() - 1); 이다. 원인은?',
      o: ['atomic이 원자성을 보장하지 않아서', 'store가 너무 느려서', '검사와 감소가 별개 연산이라 그 사이에 다른 스레드가 끼어들어서'], a: 2,
      why: 'atomic은 연산 하나만 원자적이다. 검사와 갱신을 한 덩어리로 하려면 compare_exchange 루프나 mutex가 필요하다.' },
  ];

  R.page({ title: '스레드와 동기화', scenes: [s1, s2, s3, s4, s5, s6], quiz, summary, review });
})();
