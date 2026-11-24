/* I-2-1 @tf.function 과 그래프 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * venv(tensorflow-cpu 2.21)로 코드 블록을 다시 돌려 확인한 것:
 *   파이썬 print 는 1번째 호출에만, tf.print 는 세 번 모두 / f(1)·f(2)·f(3) → 트레이싱 3회, 텐서 인자 → 1회 더(누적 4)
 *   input_signature(shape=None) 는 모양이 달라도 1회 / bad_collect 3번 호출 → collected 길이 1 / good_collect → [2. 4. 6.]
 *   branch(1.0) → 2.0, branch(-3.0) → 3.0 / to_code 에는 ag__.if_stmt
 *   시간(이 컴퓨터 CPU, 실행마다 다름): many_small_ops 50회 eager 1.451s, train_step 200회 eager 1.571s · @tf.function 0.070s */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cells, zone,
    cross, check, lock, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const hsh = (i) => { const s = Math.sin((i + 1) * 78.233) * 43758.5453; return s - Math.floor(s); };
  function node(cx, cy, r, s, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op);
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.2 }, g);
    tx(0, (o.fs || 15) * 0.36, s, { 'text-anchor': 'middle', 'font-size': o.fs || 15, 'font-weight': 800, fill: o.color || INK, class: o.mono ? 'mono' : null }, g); }
  function toggle(cx, cy, on, label) { const w = 104, h = 46, kx = lerp(-w / 2 + h / 2, w / 2 - h / 2, on), col = on > 0.5 ? ACC : MUT;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: h / 2, fill: on > 0.5 ? ACCBG : SOFT, stroke: col, 'stroke-width': 2.5 });
    el('circle', { cx: cx + kx, cy, r: h / 2 - 6, fill: col });
    mono(cx + (on > 0.5 ? -22 : 22), cy + 5, on > 0.5 ? 'ON' : 'OFF', { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': 'middle' });
    if (label) tx(cx, cy - h / 2 - 12, label, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono' }); }

  // =========================================================
  // 1. eager 의 대가 — 연산마다 파이썬 왕복
  // =========================================================
  const PY = 92, DV = 300;
  function lanes(op) { zone(20, PY - 46, 920, 84, 'Python 인터프리터', { op, color: WARN, fill: WARNBG });
    zone(20, DV - 40, 920, 84, 'C++ 커널 · 장치', { op, color: INFO, fill: INFOBG }); }
  function rand100(x, y, s, seed, op) { for (let r = 0; r < 10; r++) for (let q = 0; q < 10; q++) { const v = hsh(seed * 100 + r * 10 + q);
      el('rect', { x: x + q * s, y: y + r * s, width: s - 1, height: s - 1, fill: v > 0.5 ? ACC : INFO, opacity: op * (0.15 + 0.6 * Math.abs(v - 0.5) * 2) }); } }
  const OPS = [['tf.matmul', 'y = tf.matmul(w, x)'], ['reduce_sum', 'tf.reduce_sum(y)'], ['덧셈', 'total + …']];
  function trip(i, x, u0, u) { const g = seg(u, u0, u0 + 1.0);
    if (g <= 0) return; el('path', { d: `M${x - 20},${PY + 20} C${x - 20},${DV - 60} ${x - 20},${DV - 60} ${x - 20},${DV - 20}`, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    el('path', { d: `M${x + 20},${DV - 20} C${x + 20},${PY + 60} ${x + 20},${PY + 60} ${x + 20},${PY + 20}`, fill: 'none', stroke: WARN, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    card(x, DV + 2, 120, 38, { rx: 8, text: OPS[i][0], fs: 14.5, mono: true, stroke: INFO, fill: PANEL, s: pop(u, u0 + 0.35) });
    card(x, PY, 160, 34, { rx: 8, text: OPS[i][1], fs: 13.5, mono: true, stroke: WARN, fill: PANEL });
    dot([[x - 20, PY + 20], [x - 20, DV - 20], [x + 20, DV - 20], [x + 20, PY + 20]], g, WARN, 7); }
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { rand100(180, 110, 18, 1, fade(u, 0.2)); rand100(580, 110, 18, 2, fade(u, 0.6));
      mono(270, 92, 'w = tf.random.normal((100, 100))', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      mono(670, 92, 'x = tf.random.normal((100, 100))', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(480, 350, '재료 준비 · 아직 연산은 하나도 일어나지 않았다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      sub(480, 378, '이 장의 질문 · 편한 eager 가 왜 느려질 수 있나', fade(u, 2.0), { 'font-size': 14.5 }); return; }
    if (k === 1) { snippet(90, 80, ['def many_small_ops(w, x):', '    total = tf.constant(0.0)', '    for _ in range(200):', '        …  # 작은 연산 두어 개'], { op: fade(u, 0.2), fs: 15 });
      const cx = 720, cy = 190; el('circle', { cx, cy, r: 80, fill: 'none', stroke: GRID, 'stroke-width': 8, opacity: fade(u, 0.8) });
      mono(cx, cy + 6, '0 / 200', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      tx(cx, cy + 112, '부르기 전에는 아무 일도 없다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(320, 300, 'eager 에서 이건 그냥 파이썬 함수다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2 || k === 3) { lanes(1);
      trip(0, 200, k === 2 ? 0.3 : -2, k === 2 ? u : u + 3);
      if (k === 3) trip(1, 460, 0.3, u);
      const n = k === 2 ? (u > 1.3 ? 1 : 0) : 1 + (u > 1.3 ? 1 : 0);
      card(800, 196, 220, 70, { rx: 12, stroke: WARN, fill: PANEL });
      mono(800, 192, `왕복 ${n}회`, { 'font-size': 20, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
      tx(800, 216, k === 2 ? '연산 하나 = 왕복 하나' : '루프 한 바퀴에 연산 3개 × 200', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      if (k === 3) mono(800, 252, '× 200 반복', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) });
      tx(480, 392, k === 2 ? 'matmul 자체는 순식간 · 문제는 앞뒤의 왕복' : '연산이 작고 많을수록 왕복 비중이 커진다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 4) { // 시간 막대: 계산(작음) + 왕복(큼)
      tx(60, 70, '50번 호출을 재면', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      const x0 = 60, W = 840, n = 24, g = E(u, 0.3, 1.9);
      for (let i = 0; i < n * g; i++) { const x = x0 + i * (W / n); el('rect', { x, y: 110, width: W / n * 0.72, height: 40, fill: WARN, opacity: 0.85 }); el('rect', { x: x + W / n * 0.72, y: 110, width: W / n * 0.2, height: 40, fill: INFO }); }
      el('rect', { x: 60, y: 180, width: 18, height: 14, fill: WARN }); tx(86, 192, '파이썬 왕복', { 'font-size': 14, opacity: fade(u, 0.5) });
      el('rect', { x: 200, y: 180, width: 18, height: 14, fill: INFO }); tx(226, 192, '실제 계산', { 'font-size': 14, opacity: fade(u, 0.5) });
      tx(560, 192, '막대 비율은 모양 예시', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
      terminal(220, 230, 520, 88, ['>>> print(f"eager : {eager_sec:.3f}s")', ['eager : 1.451s', 'var(--warn)']], lerp(0, 2, E(u, 1.6, 2.3)), { title: 'python' });
      sub(480, 360, '이 컴퓨터 CPU 에서 잰 예 · 다음 단계와 비교할 기준값', fade(u, 2.4), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // k5: 병목 — 파이썬은 바쁘고 장치는 논다
    lanes(1);
    for (let i = 0; i < 12; i++) { const x = 60 + i * 72; el('rect', { x, y: PY - 14, width: 64, height: 28, rx: 4, fill: WARN, opacity: 0.8 * fade(u, 0.1 + i * 0.05) });
      el('rect', { x: x + 50, y: DV - 12, width: 12, height: 28, rx: 3, fill: INFO, opacity: fade(u, 0.1 + i * 0.05) }); }
    tx(900, PY + 34, '쉴 틈이 없다', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.1) });
    tx(900, DV + 38, '대부분 기다린다', { 'font-size': 14.5, 'font-weight': 800, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.3) });
    card(480, 200, 520, 56, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 1.6) });
    tx(480, 206, '계산이 아니라 왕복이 시간을 먹는다', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }

  // =========================================================
  // 2. 트레이싱 — 첫 호출에 그래프를 채록한다
  // =========================================================
  const FN = ['@tf.function', 'def add_and_log(a, b):', '    print("파이썬 print …")', '    tf.print("tf.print …")', '    return a + b'];
  function fnCard(o) { o = o || {}; const op = o.op ?? 1, x = 40, y = 60;
    el('rect', { x, y, width: 380, height: 180, rx: 12, fill: PANEL, stroke: o.skip ? GRID : INK, 'stroke-width': 2, opacity: op });
    FN.forEach((s, i) => { if (o.lines != null && i >= o.lines) return; const hi = o.hi === i, yy = y + 32 + i * 32;
      if (hi) el('rect', { x: x + 8, y: yy - 21, width: 364, height: 28, rx: 5, fill: ACCBG });
      mono(x + 18, yy, s, { 'font-size': 14.5, fill: i === 2 ? WARN : i === 3 ? GOOD : i === 0 ? ACC : INK, 'font-weight': i === 0 ? 800 : 500, opacity: op * (o.skip ? 0.45 : 1) }); }); }
  const GN = [[560, 110, 'a'], [560, 210, 'b'], [700, 160, '+'], [840, 160, 'tf.print']];
  function graphRec(n, o) { o = o || {}; zone(480, 50, 450, 210, '채록된 그래프', { color: ACC });
    if (n <= 0) { tx(705, 165, '아직 그래프 없음', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle' }); return; }
    if (n > 2) { grow(578, 118, 680, 152, 1, MUT); grow(578, 202, 680, 168, 1, MUT); }
    if (n > 3) grow(722, 160, 790, 160, 1, MUT);
    GN.slice(0, n).forEach(([x, y, s], i) => { if (i === 3) card(x, y, 96, 40, { rx: 8, text: s, fs: 14, mono: true, stroke: GOOD, color: GOOD }); else node(x, y, 20, s, { stroke: ACC, fs: i === 2 ? 20 : 15 }); });
    if (o.flow > 0 && o.flow < 1) { dot([[578, 118], [700, 160], [790, 160]], o.flow, ACC, 6); dot([[578, 202], [700, 160]], o.flow * 1.3, ACC, 6); } }
  function console2(lines, shown) { terminal(40, 280, 880, 128, lines, shown, { title: '출력', fs: 14, lh: 21 }); }
  const OUT = [['── 1번째 호출 ──', null], ['파이썬 print: 지금 트레이싱 중!', 'var(--warn)'], ['tf.print: 매 호출 실행됨', 'var(--good)'], ['── 2번째 호출 ──', null], ['tf.print: 매 호출 실행됨', 'var(--good)'], ['── 3번째 호출 ──', null], ['tf.print: 매 호출 실행됨', 'var(--good)']];
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { fnCard({ lines: Math.ceil(lerp(0, 3, E(u, 0.2, 1.2))) }); graphRec(0);
      tx(705, 300, '데코레이터만으로는 그래프가 생기지 않는다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      tx(705, 326, '첫 호출이 방아쇠다', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.9) }); return; }
    if (k === 1) { fnCard({ lines: 5, hi: u > 0.3 && u < 1.6 ? 3 : null }); graphRec(0);
      pill(140, 280, 'x = tf.constant(2.0)', INK, pop(u, 1.2), { mono: true, fs: 14 }); pill(330, 280, 'y = tf.constant(3.0)', INK, pop(u, 1.4), { mono: true, fs: 14 });
      tx(705, 320, '주황은 파이썬 코드, 초록은 그래프에 심길 연산', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 2) { const line = Math.min(4, Math.floor(lerp(1, 5, E(u, 0.2, 1.9))));
      fnCard({ lines: 5, hi: line }); graphRec(Math.min(4, Math.floor(lerp(0, 4.99, E(u, 0.3, 1.9)))));
      console2(OUT, lerp(0, 3, E(u, 0.2, 2.0)));
      pill(705, 38, '1번째 호출 = 트레이싱', ACC, pop(u, 0.1), { fs: 14, fill: PANEL }); return; }
    // k3, k4, k5: 재사용
    fnCard({ lines: 5, skip: true }); graphRec(4, { flow: k < 5 ? seg(u, 0.4, 1.6) : 0 });
    if (k < 5) { el('path', { d: 'M230,40 Q230,20 480,26 T700,46', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: fade(u, 0.2) });
      tx(230, 262, '파이썬 코드는 건너뛴다', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      console2(OUT, k === 3 ? 3 + lerp(0, 2, E(u, 0.4, 1.6)) : 5 + lerp(0, 2, E(u, 0.4, 1.6)));
      pill(870, 262, k === 3 ? '2번째 호출' : '3번째 호출', ACC, pop(u, 0.1), { fs: 13.5, fill: PANEL }); return; }
    // k5: 왜 갈리나
    card(230, 300, 360, 80, { rx: 12, stroke: WARN, fill: WARNBG, s: pop(u, 0.3) });
    tx(230, 292, 'print = 그래프를 만드는 파이썬 코드', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.4) });
    tx(230, 318, '트레이싱 때 한 번만 돈다', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
    card(705, 330, 400, 80, { rx: 12, stroke: GOOD, fill: GOODBG, s: pop(u, 0.9) });
    tx(705, 322, 'tf.print = 그래프 안의 연산', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) });
    tx(705, 348, '그래프가 돌 때마다 매번 찍힌다', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
    grow(840, 182, 790, 290, E(u, 1.2, 1.7), GOOD, { dash: '4 4' }); }

  // =========================================================
  // 3. retracing — 파이썬 인자가 바뀌면 그래프를 다시 만든다
  // =========================================================
  function counter(cx, cy, n, col, label) { card(cx, cy, 170, 74, { rx: 12, stroke: col, fill: PANEL, sw: 2.5 });
    mono(cx, cy + 2, String(n), { 'font-size': 28, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); tx(cx, cy + 26, label, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
  function gcard(cx, cy, s, col, sc, op) { const g = R.G(cx, cy, sc ?? 1, op);
    el('rect', { x: -64, y: -30, width: 128, height: 60, rx: 8, fill: PANEL, stroke: col, 'stroke-width': 2.2 }, g);
    [[-38, -8], [-38, 12], [0, 2], [36, 2]].forEach(([x, y], i) => el('circle', { cx: x, cy: y - 6, r: 5, fill: col }, g));
    tx(0, 22, s, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col, class: 'mono' }, g); }
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { snippet(70, 70, ['trace_count = {"n": 0}', '', '@tf.function', 'def f(x):', '    trace_count["n"] += 1', '    print("[트레이싱 발생!]")', '    return x * 2'], { fs: 15, op: fade(u, 0.1) });
      if (k === 1) { el('rect', { x: 78, y: 173, width: 340, height: 50, rx: 6, fill: WARN, opacity: 0.18 * fade(u, 0.3) });
        const on = Math.floor(t * 2) % 2 === 0; el('circle', { cx: 470, cy: 212, r: 14, fill: on ? WARN : SOFT, stroke: WARN, 'stroke-width': 2.5, opacity: fade(u, 0.5) });
        tx(500, 206, '트레이싱 표시등', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.6) }); tx(500, 230, '이 두 줄은 트레이싱 순간에만 돈다', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.8) }); }
      counter(760, 110, 0, INK, 'trace_count["n"]');
      if (k === 0) tx(480, 380, '"몇 번 트레이싱되는가" 를 숫자로 센다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      return; }
    // 선반 두 개: 파이썬 int · 텐서
    zone(20, 30, 560, 170, '파이썬 int 로 호출 · f(1) f(2) f(3)', { color: BAD, fill: BADBG });
    const bad = k === 2 ? Math.min(3, Math.floor(lerp(0, 3.99, E(u, 0.3, 2.0)))) : 3;
    for (let i = 0; i < bad; i++) gcard(110 + i * 170, 120, `x = ${i + 1}`, BAD, k === 2 ? pop(u, 0.3 + i * 0.55) : 1);
    if (k >= 3) { zone(20, 214, 560, 170, '텐서로 호출 · f(tf.constant(i))', { color: GOOD, fill: GOODBG });
      gcard(110, 304, 'int32 · ()', GOOD, k === 3 ? pop(u, 0.3) : 1);
      if (k === 3) [0, 1, 2].forEach((i) => fly(560, 260 + i * 30, 190, 304, seg(u, 0.4 + i * 0.5, 1.0 + i * 0.5), `tf.constant(${i + 1})`, { mono: true, fill: GOOD }));
      if (k >= 3) tx(340, 312, '같은 dtype·shape → 그래프 1개 공유', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: k === 3 ? fade(u, 2.0) : 1 }); }
    const total = k === 2 ? bad : k === 3 ? 3 + (u > 0.6 ? 1 : 0) : 4;
    counter(780, 100, total, k === 2 ? BAD : INK, 'trace_count (누적)');
    if (k === 2) { tx(780, 200, '값이 바뀔 때마다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.8) }); tx(780, 224, '새 시그니처로 본다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { mono(780, 200, '3 + 1 = 4', { 'font-size': 16, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); tx(780, 226, '텐서 쪽은 1번뿐', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) }); return; }
    // k4, k5: input_signature
    const st = k === 4 ? E(u, 0.3, 1.0) : 1;
    card(780, 250, 300, 108, { rx: 12, stroke: ACC, fill: ACCBG, s: st > 0 ? 1 : 0, op: st });
    mono(780, 230, 'input_signature =', { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: st }); mono(780, 254, 'TensorSpec(shape=None,', { 'font-size': 14, 'text-anchor': 'middle', opacity: st }); mono(780, 276, '           dtype=tf.int32)', { 'font-size': 14, 'text-anchor': 'middle', opacity: st });
    lock(910, 206, true, ACC, st);
    if (k === 4) { tx(780, 340, '값이 아니라 모양과 타입을 약속한다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    const ins = [['1', '()'], ['[1, 2, 3]', '(3,)'], ['[[1,2],[3,4]]', '(2, 2)']];
    ins.forEach(([v, sh], i) => { const g = seg(u, 0.3 + i * 0.55, 0.9 + i * 0.55); fly(860, 395, 780, 250, g, `g(${v})`, { mono: true, fill: ACC }); mono(640, 330 + i * 20, `shape ${sh}`, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.9 + i * 0.55) }); });
    mono(800, 350, 'g 트레이싱 1회', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) });
    sub(780, 404, 'shape=None 이면 배치 크기가 바뀌어도 그대로', fade(u, 2.3), { 'font-size': 13.5 }); }

  // =========================================================
  // 4. 그래프 모드의 제약 — 부수효과 · AutoGraph · 디버깅 스위치
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { tx(60, 60, 'collected = []   ·   bad_collect 를 세 번 부른다', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
      [0, 1, 2].forEach((i) => { const x = 140 + i * 160, s = pop(u, 0.2 + i * 0.45); card(x, 130, 140, 44, { rx: 10, text: `호출 ${i + 1}`, fs: 15, stroke: i ? GRID : WARN, color: i ? MUT : WARN, s });
        if (i === 0) grow(x, 154, 640, 236, E(u, 0.5, 1.0), WARN); else { grow(x, 154, x + 40, 214, E(u, 0.7 + i * 0.45, 1.0 + i * 0.45), MUT, { dash: '4 4', plain: true }); if (u > 1.0 + i * 0.45) cross(x + 44, 222, 8, 1); } });
      zone(560, 200, 380, 90, 'collected', { color: INK });
      card(650, 252, 150, 36, { rx: 6, text: "Tensor 'x:0'", fs: 13.5, mono: true, stroke: WARN, s: pop(u, 1.0) });
      mono(900, 258, 'len = 1', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'end', opacity: fade(u, 1.9) });
      tx(480, 350, 'append 는 트레이싱 때 한 번만 · 그것도 값이 아닌 기호 텐서', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    if (k === 1) { mono(60, 60, 'ta = tf.TensorArray(tf.float32, size=3)', { 'font-size': 15, 'font-weight': 700 });
      cells(120, 100, [1, 2, 3].map((v) => v.toFixed(1)), { w: 80, h: 44, style: () => ({ stroke: MUT }) });
      tx(100, 128, 'xs', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' });
      const n = Math.floor(lerp(0, 3.99, E(u, 0.3, 1.8)));
      cells(120, 200, [0, 1, 2].map((i) => (i < n ? ((i + 1) * 2).toFixed(1) : '')), { w: 80, h: 44, index: true, style: (i) => ({ stroke: GOOD, fill: i < n ? GOODBG : PANEL, dash: i < n ? null : '5 4' }) });
      tx(100, 228, 'ta', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: 'mono' });
      for (let i = 0; i < 3; i++) grow(160 + i * 86, 146, 160 + i * 86, 196, E(u, 0.3 + i * 0.5, 0.7 + i * 0.5), GOOD);
      pill(620, 222, 'ta.write(i, xs[i] * 2)', GOOD, pop(u, 0.4), { mono: true, fs: 14 });
      mono(620, 300, 'ta.stack() → [2. 4. 6.]', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(480, 380, '그래프가 아는 자료구조로 모은다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 2 || k === 3) { const d = [220, 160];
      el('polygon', { points: `${d[0]},${d[1] - 46} ${d[0] + 80},${d[1]} ${d[0]},${d[1] + 46} ${d[0] - 80},${d[1]}`, fill: PANEL, stroke: ACC, 'stroke-width': 2.5, opacity: k === 2 ? fade(u, 0.2) : 0.5 });
      mono(d[0], d[1] + 5, 'x > 0', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.3) : 0.5 });
      grow(d[0] - 80, d[1], 80, 270, k === 2 ? E(u, 0.6, 1.1) : 1, MUT); grow(d[0] + 80, d[1], 360, 270, k === 2 ? E(u, 0.6, 1.1) : 1, MUT);
      card(80, 296, 120, 44, { rx: 10, text: 'x * 2', fs: 15, mono: true, stroke: GOOD, s: k === 2 ? pop(u, 1.0) : 1, op: k === 2 ? 1 : 0.5 });
      card(360, 296, 120, 44, { rx: 10, text: 'x * -1', fs: 15, mono: true, stroke: INFO, s: k === 2 ? pop(u, 1.1) : 1, op: k === 2 ? 1 : 0.5 });
      if (k === 2) { tx(160, 62, '파이썬 if  →  AutoGraph  →  tf.cond', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
        mono(560, 160, 'branch(tf.constant(1.0))  → 2.0', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.5) });
        mono(560, 200, 'branch(tf.constant(-3.0)) → 3.0', { 'font-size': 15, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.8) });
        tx(700, 270, '그래프 안에서도 텐서 값으로 갈라진다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
      tx(480, 54, 'tf.autograph.to_code(branch.python_function)', { 'font-size': 15, class: 'mono', 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
      terminal(470, 80, 450, 200, ['def tf__branch(x):', '    …', '    def if_body():', '        …', '    def else_body():', '        …', ['    ag__.if_stmt(x > 0, if_body, else_body, …)', 'var(--warn)']], lerp(0, 7, E(u, 0.3, 1.9)), { title: '변환된 코드 (일부)', fs: 13.5, lh: 21 });
      tx(695, 320, '마법이 아니라 코드 변환이다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      tx(695, 346, '이상할 땐 변환 결과를 직접 읽는다', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    // k4, k5: 디버깅 스위치
    const on = k === 4 ? E(u, 0.3, 0.9) : 1 - E(u, 0.3, 0.9);
    toggle(200, 120, on, 'run_functions_eagerly');
    const fns = ['train_step', 'branch', 'add_and_log'];
    fns.forEach((f, i) => { const x = 440 + i * 170; card(x, 120, 150, 48, { rx: 10, text: '@' + f, fs: 13.5, mono: true, stroke: on > 0.5 ? WARN : ACC, fill: on > 0.5 ? WARNBG : ACCBG, color: on > 0.5 ? WARN : ACC });
      tx(x, 164, on > 0.5 ? 'eager 로 실행' : '그래프로 실행', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    if (k === 4) { [['pdb 중단점', 0.9], ['print 로 값 보기', 1.2]].forEach(([s, a], i) => { check(260, 250 + i * 40 - 5, 9, pop(u, a)); tx(280, 250 + i * 40, s, { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, a) }); });
      tx(640, 270, '모든 @tf.function 이 한꺼번에 eager 로', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    card(480, 280, 560, 74, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 1.2) });
    tx(480, 274, '켜 둔 채 두면 속도 이득이 통째로 사라진다', { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
    tx(480, 300, '확인이 끝나면 False 로 되돌린다', { 'font-size': 14.5, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }

  // =========================================================
  // 5. 실무 가이드 — 붙일 곳, 뺄 곳, 재는 법
  // =========================================================
  const STEPC = ['with tf.GradientTape() as tape:', '    pred = model(x, training=True)', '    loss = loss_fn(y, pred)', 'grads = tape.gradient(loss, …)', 'optimizer.apply_gradients(…)', 'return loss'];
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { [['model', 'Sequential([Dense(10)])', INK], ['optimizer', 'Adam()', ACC], ['loss_fn', 'MeanSquaredError()', INFO]].forEach(([a, b, col], i) => {
        card(170 + i * 310, 160, 270, 90, { rx: 12, stroke: col, s: pop(u, 0.2 + i * 0.35) });
        tx(170 + i * 310, 148, a, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: fade(u, 0.3 + i * 0.35) });
        mono(170 + i * 310, 176, b, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.35) }); });
      tx(480, 300, '먼저 잴 대상을 만든다 · 붙일지는 마지막에 정한다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    if (k === 1 || k === 2) { const st = k === 1 ? E(u, 0.3, 0.9) : 1;
      pill(240, lerp(20, 62, st), '@tf.function', ACC, st > 0 ? 1 : 0, { mono: true, fs: 15, fill: ACCBG });
      el('rect', { x: 60, y: 84, width: 400, height: 250, rx: 12, fill: PANEL, stroke: INK, 'stroke-width': 2 });
      mono(78, 112, 'def train_step(x, y):', { 'font-size': 14.5, 'font-weight': 700 });
      STEPC.forEach((s, i) => { const hi = k === 2 && u > 0.3 + i * 0.25; if (hi) el('rect', { x: 70, y: 124 + i * 32, width: 380, height: 28, rx: 5, fill: GOODBG });
        mono(96, 143 + i * 32, s, { 'font-size': 13.5, fill: INK }); });
      if (k === 1) { const cx = 720, cy = 200; el('circle', { cx, cy, r: 90, fill: 'none', stroke: GRID, 'stroke-width': 3 });
        const a = -Math.PI / 2 + ((t * 1.2) % 1) * 2 * Math.PI; el('circle', { cx: cx + Math.cos(a) * 90, cy: cy + Math.sin(a) * 90, r: 8, fill: ACC });
        tx(cx, cy - 4, '매 배치마다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); tx(cx, cy + 20, '같은 계산을 반복', { 'font-size': 14.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
        tx(720, 340, '가장 자주 도는 함수에 붙인다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
      check(560, 190, 12, pop(u, 1.8)); tx(590, 196, '본문은 eager 때와 한 글자도 같다', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.9) });
      tx(590, 224, '바뀐 것은 데코레이터 한 줄', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { tx(60, 70, '호출마다 걸린 시간 (모양 예시)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      for (let i = 0; i < 6; i++) { const y = 96 + i * 46, w = i === 0 ? 520 : 70, g = E(u, 0.2 + i * 0.2, 0.7 + i * 0.2);
        mono(150, y + 22, i === 0 ? '워밍업' : `측정 ${i}`, { 'font-size': 14, 'text-anchor': 'end', opacity: g });
        el('rect', { x: 170, y, width: w * g, height: 30, rx: 5, fill: i === 0 ? WARN : ACC, opacity: i === 0 && u > 1.7 ? 0.35 : 1 }); }
      if (u > 1.7) { el('line', { x1: 160, y1: 111, x2: 700, y2: 111, stroke: BAD, 'stroke-width': 3 }); }
      tx(830, 112, '트레이싱 포함', { 'font-size': 14, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      tx(480, 400, '첫 호출은 버리고 반복만 잰다 · 안 그러면 "느려졌다" 는 오판', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k === 4) { tx(60, 70, 'train_step 200회 · 이 컴퓨터 CPU 에서 잰 예', { 'font-size': 15.5, 'font-weight': 800 });
      const x0 = 260, W = 560, mx = 1.571;
      [['데코레이터 없이', 1.571, WARN], ['@tf.function', 0.070, ACC]].forEach(([n, v, col], i) => { const y = 130 + i * 90, g = E(u, 0.3 + i * 0.5, 1.2 + i * 0.5);
        tx(x0 - 16, y + 24, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', class: i ? 'mono' : null });
        el('rect', { x: x0, y, width: Math.max(3, W * v / mx * g), height: 36, rx: 5, fill: col });
        mono(x0 + Math.max(3, W * v / mx * g) + 10, y + 24, (v * g).toFixed(3) + 's', { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.6 + i * 0.5) }); });
      tx(480, 360, '같은 함수를 같은 횟수로 재야 비교가 된다 · 숫자는 기계마다 다르다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k5: 붙일 곳 · 뺄 곳
    const G = c.beat.guide || { attach: [], detach: [] };
    zone(30, 40, 430, 250, '붙인다', { color: GOOD, fill: GOODBG }); zone(500, 40, 430, 250, '뺀다', { color: BAD, fill: BADBG });
    G.attach.forEach((a, i) => { const y = 100 + i * 80, op = fade(u, 0.2 + i * 0.3); check(60, y - 5, 9, op); tx(80, y, a.case, { 'font-size': 16, 'font-weight': 800, opacity: op }); tx(80, y + 24, a.why, { 'font-size': 13.5, fill: MUT, opacity: op }); });
    G.detach.forEach((a, i) => { const y = 100 + i * 80, op = fade(u, 0.8 + i * 0.3); cross(530, y - 5, 8, op); tx(550, y, a.case, { 'font-size': 16, 'font-weight': 800, opacity: op }); tx(550, y + 24, a.why, { 'font-size': 13.5, fill: MUT, opacity: op }); });
    card(480, 350, 700, 60, { rx: 12, stroke: WARN, fill: PANEL, s: pop(u, 1.6) });
    tx(480, 356, '워밍업 버리고 → 반복 측정 → 안 빨라지면 retracing 의심', { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.7) }); }

  const quiz = [
    { q: 'eager 에서 작은 연산을 아주 많이 돌릴 때 느려지는 주된 이유는 무엇인가?',
      o: ['matmul 계산 자체가 느려서', '연산마다 파이썬과 커널 사이를 왕복해서', '텐서가 매번 디스크에 저장돼서'], a: 1,
      why: '100×100 matmul 은 금방 끝난다. 연산 하나마다 붙는 파이썬 왕복이 쌓여 장치는 기다리고 파이썬이 병목이 된다.' },
    { q: '@tf.function 함수를 세 번 부르면 함수 안의 파이썬 print 는 몇 번 찍히나?',
      o: ['3번', '0번', '1번'], a: 2,
      why: '파이썬 print 는 그래프를 만드는 첫 호출(트레이싱) 때만 돈다. 그래프 안 연산인 tf.print 는 세 번 모두 찍힌다.' },
    { q: 'f(1), f(2), f(3) 처럼 파이썬 int 를 바꿔 넣으면 트레이싱은 몇 번 일어나나?',
      o: ['1번', '3번', '0번'], a: 1,
      why: '파이썬 값이 바뀔 때마다 새 시그니처로 보고 그래프를 다시 만든다. tf.constant(i) 로 넘기면 1번으로 줄어든다.' },
    { q: '@tf.function 안에서 collected.append(x) 를 하고 세 번 불렀다. collected 에는 몇 개가 들어 있나?',
      o: ['1개', '3개', '0개'], a: 0,
      why: 'append 는 파이썬 부수효과라 트레이싱 때 한 번만 일어난다. 그래프 안에서 값을 모으려면 tf.TensorArray 를 쓴다.' },
    { q: '@tf.function 이 정말 빨라졌는지 잴 때 첫 호출을 버리는 이유는 무엇인가?',
      o: ['첫 호출은 결과가 틀리기 때문', '첫 호출에는 트레이싱 비용이 섞여 있기 때문', '첫 호출은 GPU 를 쓰지 않기 때문'], a: 1,
      why: '첫 호출은 그래프를 만드는 시간까지 포함한다. 워밍업 한 번을 버리고 반복만 재야 공정하게 비교된다.' },
  ];

  const summary = [
    'eager 는 연산마다 파이썬과 커널을 왕복해서 작은 연산이 많은 루프에서 느려진다.',
    '@tf.function 은 첫 호출에 그래프를 채록하고 그 뒤로는 파이썬을 건너뛰고 그래프만 돌린다.',
    '파이썬 int 를 바꿔 넣으면 매번 다시 트레이싱하므로 값은 텐서로 넘기거나 input_signature 로 고정한다.',
    'list.append 같은 부수효과는 그래프에 안 담기고, 디버깅할 땐 run_functions_eagerly 를 잠시 켠다.',
  ];
  const review = [
    { q: 'train_step 에 @tf.function 을 붙였는데 오히려 느려졌다. 호출부를 보니 train_step(x, y, step) 에 step 으로 파이썬 int 를 넘긴다. 먼저 의심할 것은?',
      o: ['GradientTape 가 그래프에서 동작하지 않는다', 'step 값이 바뀔 때마다 다시 트레이싱되고 있다', '옵티마이저가 eager 로만 동작한다'], a: 1,
      why: '파이썬 스칼라 인자는 값마다 새 시그니처가 된다. tf.constant(step) 으로 넘기거나 input_signature 로 고정하면 트레이싱이 한 번으로 준다.' },
    { q: '@tf.function 안에서 손실값을 파이썬 리스트에 append 해 그래프로 그리려 했더니 점이 하나뿐이다. 어떻게 고치나?',
      o: ['함수 안에서 값을 tf.TensorArray 로 모으거나 함수 밖에서 반환값을 모은다', 'print 를 한 줄 더 넣는다', '리스트를 전역 변수로 바꾼다'], a: 0,
      why: 'append 는 트레이싱 때 한 번만 돈다. 그래프가 아는 TensorArray 에 쓰거나, 반환된 텐서를 바깥 파이썬 루프에서 모아야 한다.' },
    { q: '그래프 함수 안의 중간값을 pdb 로 보고 싶다. 가장 간단한 방법은?',
      o: ['tf.print 를 모든 줄에 넣는다', 'input_signature 를 지운다', 'tf.config.run_functions_eagerly(True) 로 잠시 eager 로 돌린다'], a: 2,
      why: '스위치를 켜면 모든 @tf.function 이 eager 로 돌아 pdb 와 print 가 살아난다. 확인이 끝나면 False 로 되돌려야 속도가 돌아온다.' },
  ];

  R.page({ title: '@tf.function 과 그래프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
