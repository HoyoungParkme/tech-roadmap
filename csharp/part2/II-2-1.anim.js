/* II-2-1 delegate·event — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * delegate 의 모양(시그니처), delegate 객체가 가리키는 메서드, 멀티캐스트 호출 목록, event 의 벽과 문, 구독이 만드는 참조 그래프를 그린다.
 * 출력(7, 12, hi, 25, True, [12, 30], 2, 가격 변경: 1200, 해제 뒤 구독 수)은 .NET 10 SDK 로 실제 실행해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, pill, grow, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const say = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const code = (x, y, s, op, a) => mono(x, y, s, Object.assign({ 'font-size': 14.5, fill: INK, opacity: op ?? 1 }, a || {}));

  // 시그니처 모양: 왼쪽 입력 핀들, 오른쪽 출력 핀
  function shape(cx, cy, ins, out, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const g = R.G(cx, cy, s, o.op), col = o.col || INK, h = 22 + ins.length * 24;
    el('rect', { x: -44, y: -h / 2, width: 88, height: h, rx: 8, fill: o.fill || PANEL, stroke: col, 'stroke-width': 2.2, 'stroke-dasharray': o.dash }, g);
    ins.forEach((p, i) => { const y = -h / 2 + 23 + i * 24; el('line', { x1: -70, y1: y, x2: -44, y2: y, stroke: col, 'stroke-width': 2.2 }, g); tx(-74, y + 5, p, { 'font-size': 13.5, class: 'mono', fill: col, 'text-anchor': 'end' }, g); });
    el('line', { x1: 44, y1: 0, x2: 70, y2: 0, stroke: col, 'stroke-width': 2.2 }, g); tx(74, 5, out, { 'font-size': 13.5, class: 'mono', fill: col }, g);
    if (o.label) tx(0, 5, o.label, { 'font-size': 14, 'font-weight': 700, fill: col, 'text-anchor': 'middle', class: 'mono' }, g); }

  // ---------- 1. delegate — 메서드를 가리키는 타입 ----------
  function s1(t, c) { const { k, u } = c;
    code(30, 46, 'delegate int Op(int a, int b);', k === 0 ? fade(u, 0.2) : 1, { 'font-weight': 800, fill: ACC });
    shape(150, 110, ['int', 'int'], 'int', { col: ACC, label: 'Op', dash: '6 4', s: k === 0 ? pop(u, 0.6) : 1 });
    if (k === 0) say(30, 190, '모양만 정한 타입. 아직 가리키는 메서드는 없다', fade(u, 1.5), { 'font-size': 14.5, fill: MUT });
    // 후보 메서드
    const M = [['Add', 'a + b', 90], ['Mul', 'a * b', 200]];
    if (k >= 1) M.forEach(([n, b, y], i) => { const s = k === 1 ? pop(u, 0.3 + i * 0.5) : 1, on = (k >= 2 && k <= 3 && i === 0) || (k === 4 && i === 1) || (k === 5 && i === 0);
      shape(700, y, ['int', 'int'], 'int', { s, label: n, col: on ? ACC : INK, fill: on ? ACCBG : PANEL });
      code(620, y - 46, `int ${n}(int a, int b) => ${b}`, k === 1 ? fade(u, 0.6 + i * 0.5) : 0.8, { 'font-size': 13.5 });
      if (k === 1) check(860, y, 8, pop(u, 1.4 + i * 0.3)); });
    if (k === 1) say(380, 330, '이름이 아니라 (int, int) → int 모양이 맞아서 후보다', fade(u, 2.0), { 'font-size': 14.5, fill: MUT });
    // 변수 op → delegate 객체 → 메서드
    if (k >= 2 && k <= 5) { const tgt = k === 4 ? 1 : 0, sw = k === 4 ? E(u, 0.3, 0.9) : 1;
      zone(20, 250, 160, 150, '스택', {}); card(100, 330, 110, 44, { rx: 6, text: 'op', fs: 16, mono: true, stroke: ACC, color: ACC, s: k === 2 ? pop(u, 0.3) : 1 });
      el('rect', { x: 250, y: 280, width: 230, height: 100, rx: 8, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: k === 2 ? fade(u, 0.6) : 1 });
      tx(260, 272, '힙: Op 객체', { 'font-size': 13.5, fill: MUT, 'font-weight': 700, opacity: k === 2 ? fade(u, 0.6) : 1 });
      code(264, 314, 'Method', k === 2 ? fade(u, 0.8) : 1, { fill: MUT, 'font-size': 14 });
      code(350, 314, tgt && sw > 0.5 ? '→ Mul' : '→ Add', k === 2 ? fade(u, 1.1) : 1, { fill: ACC, 'font-weight': 800 });
      code(264, 352, 'Target', k === 2 ? fade(u, 0.8) : 1, { fill: MUT, 'font-size': 14 });
      grow(155, 330, 248, 330, k === 2 ? E(u, 0.5, 0.8) : 1, ACC);
      const ty = tgt && sw > 0.5 ? 200 : 90; grow(480, 310, 700, ty + 38, k === 2 ? E(u, 1.2, 1.7) : k === 4 ? E(u, 0.6, 1.0) : 1, ACC);
      if (k === 2) say(500, 380, 'op = Add 는 호출이 아니라 가리키기', fade(u, 2.0), { 'font-size': 14.5, fill: ACC });
      if (k === 3 || k === 4) { ['3', '4'].forEach((v, i) => { const f = E(u, (k === 4 ? 1.0 : 0.3) + i * 0.2, (k === 4 ? 1.6 : 0.9) + i * 0.2); if (f > 0 && f < 1) pill(lerp(100, 610, f), lerp(300, ty - 8 + i * 22, f), v, ACC, 1, { fs: 14, mono: true }); });
        const r = k === 3 ? '7' : '12', a = k === 3 ? 1.3 : 1.9;
        card(860, ty, 80, 42, { rx: 8, text: r, fs: 18, mono: true, stroke: GOOD, color: GOOD, s: pop(u, a) });
        code(500, 420 - 30, 'op(3, 4)', fade(u, 0.2), { 'font-weight': 800 });
        if (k === 4) say(620, 390, '호출 코드는 그대로, 결과만 바뀐다', fade(u, 2.2), { 'font-size': 14.5, fill: GOOD }); }
      if (k === 5) { shape(420, 180, ['string'], 'void', { col: BAD, label: 'WriteLine', s: pop(u, 0.3), fill: BADBG });
        grow(500, 180, 560, 120, E(u, 0.8, 1.1), BAD); cross(530, 150, 12, pop(u, 1.3));
        code(30, 228, 'Op bad = Console.WriteLine;  // CS0123', fade(u, 1.5), { fill: BAD, 'font-size': 14 }); } } }

  // ---------- 2. Action · Func · Predicate + 콜백 ----------
  const BI = [['Action<string>', ['string'], 'void', 's => WriteLine(s)', INFO], ['Func<int,int>', ['int'], 'int', 'x => x * x', ACC], ['Predicate<int>', ['int'], 'bool', 'n => n % 2 == 0', GOOD]];
  function s2(t, c) { const { k, u } = c;
    BI.forEach(([n, ins, out, lam, col], i) => { const show = i === 0 || k >= 1; if (!show) return; const x = 165 + i * 315, s = (k === 0 && i === 0) || (k === 1 && i > 0) ? pop(u, 0.2 + (i ? (i - 1) * 0.5 : 0)) : 1, op = k >= 3 ? 0.35 : 1;
      code(x - 120, 40, n, op, { 'font-weight': 800, fill: col });
      shape(x - 10, 88, ins, out, { col, s, op });
      code(x - 120, 146, lam, (k <= 1 ? fade(u, 0.7 + (i ? (i - 1) * 0.5 : 0)) : 1) * op, { 'font-size': 14 });
      if (k === 2) { const call = ['log("hi")', 'square(5)', 'isEven(4)'][i], r = ['hi', '25', 'True'][i];
        code(x - 120, 186, call, fade(u, 0.3 + i * 0.5), { 'font-weight': 700 }); pill(x + 60, 181, r, col, pop(u, 0.8 + i * 0.5), { fs: 14, mono: true }); } });
    if (k === 0) say(40, 220, '반환값 없는 동작은 Action, delegate 선언이 필요 없다', fade(u, 1.5), { 'font-size': 14.5, fill: MUT });
    if (k === 2) say(40, 250, '람다를 담은 변수도 보통 메서드처럼 부른다', fade(u, 2.2), { 'font-size': 14.5, fill: MUT });
    if (k >= 3) { // Filter 기계
      const nums = [3, 12, 7, 30], gate = { x: 480, y: 290 };
      el('rect', { x: 330, y: 220, width: 300, height: 140, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: k === 3 ? fade(u, 0.2) : 1 });
      code(344, 244, 'Filter(src, keep)', k === 3 ? fade(u, 0.3) : 1, { 'font-weight': 800 });
      const plug = k === 5 ? E(u, 0.2, 0.8) : 0;
      el('rect', { x: 390, y: 268, width: 180, height: 44, rx: 8, fill: plug >= 1 ? GOODBG : PANEL, stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': plug >= 1 ? null : '6 4', opacity: k === 3 ? fade(u, 0.8) : 1 });
      code(480, 296, plug >= 1 ? 'n => n > 10' : 'keep ?', k === 3 ? fade(u, 0.9) : 1, { 'text-anchor': 'middle', fill: GOOD, 'font-weight': 700 });
      if (k === 5 && plug < 1) pill(lerp(480, 480, plug), lerp(190, 290, plug), 'n => n > 10', GOOD, 1, { fs: 14, mono: true });
      if (k === 3) say(340, 390, '무엇을 통과시킬지 Filter 안에는 없다', fade(u, 1.6), { 'font-size': 14.5, fill: MUT });
      code(40, 250, 'nums', 1, { fill: MUT }); code(700, 250, 'r', 1, { fill: MUT });
      nums.forEach((v, i) => { const pass = v > 10, a = (k === 5 ? 0.9 : 0.3) + i * 0.45, f = k >= 4 ? E(u, a, a + 0.4) : 0, g2 = k >= 4 ? E(u, a + 0.4, a + 0.7) : 0;
        if (f <= 0) card(60 + i * 60, 290, 50, 38, { rx: 6, text: String(v), fs: 15, mono: true });
        else if (f < 1) card(lerp(60 + i * 60, gate.x - 120, f), 290 - Math.sin(f * Math.PI) * 44, 50, 38, { rx: 6, text: String(v), fs: 15, mono: true, stroke: ACC });
        else if (k === 4) pill(405 + i * 50, 338, `${v}?`, WARN, pop(u, a + 0.4), { fs: 13.5, mono: true });
        else if (pass) { const ri = v === 12 ? 0 : 1; card(lerp(gate.x + 120, 720 + ri * 60, g2), 290, 50, 38, { rx: 6, text: String(v), fs: 15, mono: true, stroke: GOOD, color: GOOD }); }
        else { card(60 + i * 60, 350, 50, 38, { rx: 6, text: String(v), fs: 15, mono: true, stroke: OFF, color: MUT, op: 0.6 }); cross(60 + i * 60, 350, 10, pop(u, a + 0.4)); } });
      if (k === 4) say(340, 400, 'keep(n) 이 원소마다 불린다. 무엇이 도는지는 모른다', fade(u, 2.0), { 'font-size': 14.5, fill: MUT });
      if (k === 5) code(680, 400, 'big = [12, 30]', fade(u, 2.6, 0.3), { fill: GOOD, 'font-weight': 800 }); } }

  // ---------- 3. 멀티캐스트 — 호출 목록 ----------
  const CH = [['LogToConsole', '[콘솔] 주문 완료'], ['LogToFile', 'log.txt 에 추가'], ['SendMetric', '지표 +1']];
  function chain(y, n, o) { o = o || {}; for (let i = 0; i < n; i++) { const st = (o.style && o.style(i)) || {}; if ((st.s ?? 1) <= 0) continue;
      card(370 + i * 200, y + (st.dy || 0), 180, 46, { rx: 6, text: (o.names || CH.map((x) => x[0]))[i], fs: 14.5, mono: true, s: st.s, op: st.op, stroke: st.col || INK, color: st.col || INK, fill: st.fill });
      tx(370 + i * 200, y - 32 + (st.dy || 0), `${i + 1}`, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: st.op ?? 1 }); } }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) { card(120, 120, 150, 46, { rx: 6, text: 'handler', fs: 16, mono: true, stroke: ACC, color: ACC });
      tx(120, 80, 'Action<string>?', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', class: 'mono' });
      const n = k === 0 ? 1 : 3; grow(195, 120, 270, 120, k === 0 ? E(u, 0.2, 0.5) : 1, ACC);
      if (k === 0) code(120, 180, 'null → 1개', fade(u, 1.2), { 'text-anchor': 'middle', fill: MUT });
      chain(120, n, { style: (i) => ({ s: (k === 0 && i === 0) || (k === 1 && i > 0) ? pop(u, 0.5 + (i ? (i - 1) * 0.5 : 0)) : 1,
        dy: k === 3 && i === 2 ? -E(u, 0.5, 1.2) * 60 : 0, op: k === 3 && i === 2 ? 1 - fade(u, 1.0, 0.8) : 1, col: k === 3 && i === 2 ? BAD : k === 2 ? ACC : INK }) });
      if (k === 1) say(270, 210, '+= 는 덮어쓰기가 아니라 뒤에 이어 붙이기', fade(u, 1.8), { 'font-size': 14.5, fill: MUT });
      if (k === 2) { code(120, 200, 'handler("주문 완료")', fade(u, 0.1), { 'text-anchor': 'middle', 'font-weight': 700 });
        dot([[195, 150], [370, 150], [570, 150], [770, 150]], seg(u, 0.3, 1.8), ACC, 7);
        CH.forEach(([, eff], i) => pill(370 + i * 200, 190, eff, ACC, pop(u, 0.6 + i * 0.5), { fs: 13.5 }));
        say(270, 260, '한 번 부르면 붙인 순서대로 셋 다 실행된다', fade(u, 2.2), { 'font-size': 14.5, fill: MUT }); }
      if (k === 3) { code(770, 210, 'handler -= SendMetric', fade(u, 0.2), { 'text-anchor': 'middle', fill: BAD, 'font-weight': 700 });
        const cnt = u < 1.4 ? 3 : 2; code(120, 200, `GetInvocationList().Length = ${cnt}`, fade(u, 0.4), { 'text-anchor': 'middle', 'font-size': 14 });
        say(270, 260, '대상과 메서드가 같은 항목을 찾아 뗀다', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); }
      return; }
    if (k === 4) { code(40, 60, 'Func<int> f = () => 1;  f += () => 2;', 1, { 'font-weight': 700 });
      chain(150, 2, { names: ['() => 1', '() => 2'], style: (i) => ({ col: i ? ACC : MUT }) });
      dot([[200, 175], [370, 175], [570, 175]], seg(u, 0.3, 1.2), ACC, 7);
      const f1 = E(u, 1.0, 1.8); card(370, 240 + f1 * 60, 60, 40, { rx: 6, text: '1', fs: 17, mono: true, stroke: MUT, color: MUT, op: 1 - f1 * 0.6 });
      if (f1 > 0.5) mono(410, 300, '버려짐', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      card(570, 240, 60, 40, { rx: 6, text: '2', fs: 17, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.2) });
      grow(600, 240, 760, 240, E(u, 1.6, 1.9), ACC); card(830, 240, 120, 40, { rx: 6, text: 'f() = 2', fs: 15, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 2.0) });
      say(40, 380, '반환값은 마지막 것만 남는다. 멀티캐스트는 void 로 쓴다', fade(u, 2.2), { 'font-size': 14.5, fill: WARN }); return; }
    // k5: 가운데가 예외를 던질 때
    const names = ['A', 'B (throw)', 'C'];
    [['handler(x) 직접 호출', 120, true], ['GetInvocationList + try', 280, false]].forEach(([title, y, direct], r) => { const a0 = 0.2 + r * 1.2;
      code(30, y + 5, title, fade(u, a0), { 'font-weight': 700, 'font-size': 14 });
      names.forEach((n, i) => { const cx = 470 + i * 170, a = a0 + 0.2 + i * 0.3, ran = direct ? i === 0 : i !== 1, boom = i === 1;
        card(cx, y, 140, 44, { rx: 6, text: n, fs: 14.5, mono: true, s: pop(u, a), stroke: boom ? BAD : ran ? GOOD : OFF, color: boom ? BAD : ran ? INK : MUT, fill: boom ? BADBG : PANEL });
        if (ran) check(cx + 52, y - 26, 7, pop(u, a + 0.2));
        if (!ran && !boom) tx(cx, y + 42, '실행 안 됨', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, a + 0.3) });
        if (boom && !direct) tx(cx, y + 42, '잡고 건너뜀', { 'font-size': 13.5, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, a + 0.3) }); }); });
    say(30, 400, '하나씩 돌리면 중간이 터져도 나머지가 돈다', fade(u, 2.4), { 'font-size': 14.5, fill: GOOD }); }

  // ---------- 4. event — 벽과 문 ----------
  function s4(t, c) { const { k, u } = c;
    // PriceArgs 봉투
    const env = (x, y, s, txt) => { if (s <= 0) return; const g = R.G(x, y, s); el('rect', { x: -70, y: -26, width: 140, height: 52, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }, g);
      el('path', { d: 'M-70,-26 L0,6 L70,-26', fill: 'none', stroke: WARN, 'stroke-width': 1.6 }, g); tx(0, 20, txt, { 'font-size': 13.5, 'font-weight': 700, fill: INK, 'text-anchor': 'middle', class: 'mono' }, g); };
    env(140, 80, k === 0 ? pop(u, 0.3) : 1, 'Price');
    code(40, 140, 'PriceArgs : EventArgs', k === 0 ? fade(u, 0.8) : 1, { 'font-weight': 800, 'font-size': 14 });
    if (k === 0) { code(40, 166, '(sender, e) 의 e 자리', fade(u, 1.4), { fill: MUT, 'font-size': 14 }); return; }
    // Stock 벽
    el('rect', { x: 340, y: 36, width: 590, height: 230, rx: 12, fill: SOFT, stroke: INK, 'stroke-width': 3, opacity: k === 1 ? fade(u, 0.2) : 1 });
    tx(360, 62, 'Stock (게시자)', { 'font-size': 15, 'font-weight': 800, opacity: k === 1 ? fade(u, 0.2) : 1 });
    const subs = k >= 4 ? (k === 4 && u < 1.4 ? 0 : 1) : 0;
    el('rect', { x: 560, y: 80, width: 350, height: 46, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.8 });
    code(572, 109, subs ? 'PriceChanged → [Chart 핸들러]' : 'PriceChanged → null', 1, { 'font-size': 14, fill: subs ? ACC : MUT, 'font-weight': 700 });
    // 문: += / -=
    [['+=', 105], ['-=', 150]].forEach(([d, y]) => { el('rect', { x: 326, y: y - 16, width: 28, height: 32, rx: 4, fill: GOODBG, stroke: GOOD, 'stroke-width': 2 }); mono(340, y + 5, d, { 'font-size': 14, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' }); });
    if (k === 1) { [['stock.PriceChanged = null;', 200], ['stock.PriceChanged(...);', 250]].forEach(([s, y], i) => {
        code(30, y, s, fade(u, 0.6 + i * 0.5), { fill: BAD, 'font-size': 14 }); cross(300, y - 5, 9, pop(u, 1.0 + i * 0.5)); });
      say(30, 320, 'event 라서 바깥은 += / -= 만', fade(u, 1.9), { 'font-size': 14.5, fill: GOOD }); }
    if (k >= 2) { card(470, 200, 200, 44, { rx: 8, text: 'OnPriceChanged(p)', fs: 14, mono: true, s: k === 2 ? pop(u, 0.2) : 1, stroke: INFO, color: INFO });
      const dx = 700, dy = 200; el('path', { d: `M${dx},${dy - 26} L${dx + 40},${dy} L${dx},${dy + 26} L${dx - 40},${dy} Z`, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: k === 2 ? fade(u, 0.6) : 1 });
      mono(dx, dy + 5, '?.', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 0.6) : 1 });
      grow(570, 200, 658, 200, k === 2 ? E(u, 0.7, 1.0) : 1, INFO);
      if (k === 2) { dot([[570, 200], [660, 200]], seg(u, 1.1, 1.5), INFO, 6); tx(dx + 50, 236, 'null 이면 그냥 지나감', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 1.6) });
        say(30, 320, '구독자 0명이면 null. ?.Invoke 로 NRE 를 피한다', fade(u, 2.1), { 'font-size': 14.5, fill: WARN }); } }
    if (k >= 3) { el('rect', { x: 326, y: 184, width: 28, height: 32, rx: 4, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
      code(30, 205, 'stock.SetPrice(p)', k === 3 ? fade(u, 0.2) : 1, { fill: INFO, 'font-weight': 700, 'font-size': 14 });
      grow(200, 200, 368, 200, k === 3 ? E(u, 0.4, 0.8) : 1, INFO);
      if (k === 3) { dot([[200, 200], [370, 200], [660, 200]], seg(u, 0.8, 1.8), INFO, 6); say(30, 320, '바깥에 열린 것: SetPrice 와 += / -=', fade(u, 2.0), { 'font-size': 14.5, fill: MUT }); } }
    if (k === 4) { card(130, 300, 160, 46, { rx: 8, text: 'Chart', fs: 15, stroke: ACC, color: ACC, s: k === 4 ? pop(u, 0.2) : 1 });
      if (k === 4) { code(30, 370, 'stock.PriceChanged += (sender, e) => ...', fade(u, 0.4), { 'font-size': 13.5 });
        dot([[210, 300], [300, 105], [560, 103]], seg(u, 0.5, 1.4), ACC, 7); say(30, 405, '등록만 했다. 아직 쏘지 않았다', fade(u, 1.8), { 'font-size': 14.5, fill: MUT }); } }
    if (k === 5) { const subsN = [['Chart', '그래프 갱신'], ['Alarm', '임계값 알림'], ['Logger', '변동 기록']];
      subsN.forEach(([n, r], i) => { const x = 450 + i * 170, a = 1.2 + i * 0.25;
        if (i > 0) card(x, 330, 140, 44, { rx: 8, text: n, fs: 15, stroke: ACC, color: ACC, s: pop(u, 0.2 + i * 0.15) });
        else card(x, 330, 140, 44, { rx: 8, text: n, fs: 15, stroke: ACC, color: ACC });
        const f = E(u, a - 0.6, a); if (f > 0 && f < 1) env(lerp(740, x, f), lerp(200, 330, f), 0.6, 'Price=1200');
        tx(x, 374, r, { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, a) }); });
      code(30, 205 + 50, 'SetPrice(1200)', fade(u, 0.2), { fill: INFO, 'font-weight': 800 });
      terminal(30, 300, 290, 80, ['가격 변경: 1200'], E(u, 1.4, 1.8), { title: 'Chart 핸들러 출력' }); } }

  // ---------- 5. 구독 해제와 누수 — 참조 그래프 ----------
  const N = { root: [100, 80], ui: [100, 320], stock: [370, 80], view: [370, 320], del: [690, 200] };
  function node(p, text, o) { o = o || {}; card(p[0], p[1], o.w || 170, o.h || 54, { rx: 10, text, fs: 14.5, mono: o.mono, s: o.s, op: o.op, stroke: o.col || INK, color: o.col || INK, fill: o.fill, dash: o.dash }); }
  function link(a, b, u, col, o) { o = o || {}; if (u <= 0) return; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, ra = o.ra || 90, rb = o.rb || 90;
    grow(a[0] + ux * ra * Math.abs(ux) + (o.ox || 0), a[1] + uy * 30, b[0] - ux * rb * Math.abs(ux) + (o.ox || 0), b[1] - uy * 30, u, col, { dash: o.dash, sw: o.sw }); }
  function s5(t, c) { const { k, u } = c;
    node(N.root, '앱 전역 (루트)', { col: MUT, fill: SOFT }); node(N.ui, '화면 트리 (루트)', { col: MUT, fill: SOFT });
    const gone = k === 3 ? E(u, 1.8, 2.5) : 0;
    node(N.stock, 'Stock', { col: INK }); link(N.root, N.stock, 1, MUT);
    node(N.view, 'ChartView', { col: k === 4 && u > 1.2 ? BAD : ACC, op: 1 - gone * 0.75, fill: k >= 4 && u > 1.2 ? BADBG : null });
    const uiCut = (k === 3 && u > 0.6) || (k >= 4 && u > 0.6) ? 1 : 0;
    if (!uiCut || (k >= 4 && u <= 0.6)) link(N.ui, N.view, 1, MUT);
    else { link(N.ui, N.view, 1, OFF, { dash: '4 5' }); cross(235, 320, 9, k === 3 ? pop(u, 0.6) : pop(u, 0.6)); tx(235, 352, '화면 닫힘', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    link(N.view, N.stock, k === 0 ? E(u, 0.5, 1.0) : 1, MUT, { ox: -40 });
    if (k === 0) { tx(300, 205, '_stock', { 'font-size': 13.5, fill: MUT, class: 'mono', opacity: fade(u, 1.0) }); say(500, 380, 'ChartView 가 Stock 을 필드로 붙든다', fade(u, 1.5), { 'font-size': 14.5, fill: MUT }); return; }
    // delegate 객체
    const anon = k >= 4, delOp = k === 3 ? 1 - gone * 0.75 : 1;
    node(N.del, anon ? 'delegate (익명 람다)' : 'delegate _onPrice', { w: 230, col: INFO, s: k === 1 || k === 4 ? pop(u, 0.3) : 1, op: delOp, mono: true });
    tx(N.del[0], N.del[1] + 46, 'Target → ChartView', { 'font-size': 13.5, fill: INFO, 'text-anchor': 'middle', class: 'mono', opacity: delOp * (k === 1 ? fade(u, 0.9) : 1) });
    link(N.del, N.view, k === 1 || k === 4 ? E(u, 0.9, 1.3) : 1, INFO, { ra: 115 });
    if (!anon) link(N.view, N.del, k === 1 ? E(u, 0.5, 0.9) : 1, ACC, { ox: 0, rb: 115, dash: '6 4' });
    if (k === 1) say(500, 390, '해제할 때 쓸 참조를 필드에 보관', fade(u, 1.8), { 'font-size': 14.5, fill: ACC });
    // Stock → delegate (구독)
    const subOn = k === 2 ? E(u, 0.4, 1.0) : k === 3 ? (u < 1.2 ? 1 : 0) : k >= 4 ? (k === 4 ? E(u, 0.2, 0.6) : 1) : 0;
    if (subOn > 0) link(N.stock, N.del, subOn, BAD, { rb: 115, sw: 2.8 });
    if (k === 2) { tx(560, 120, '+= 구독', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.0) }); say(500, 390, 'Stock 이 ChartView 를 붙들기 시작했다', fade(u, 1.6), { 'font-size': 14.5, fill: BAD }); }
    if (k === 3) { if (u >= 1.2) { cross(530, 140, 10, pop(u, 1.2)); tx(560, 120, 'Dispose: -= _onPrice', { 'font-size': 13.5, fill: GOOD, class: 'mono', opacity: fade(u, 1.2) }); }
      say(500, 390, '루트에서 닿지 않으니 GC 가 수거한다', fade(u, 2.2), { 'font-size': 14.5, fill: GOOD }); }
    if (k === 4) { say(500, 380, '떼어 낼 참조가 없다. Stock 이 사는 동안', fade(u, 1.6), { 'font-size': 14.5, fill: BAD }); say(500, 404, 'ChartView 도 수거되지 않는다 (누수)', fade(u, 1.6), { 'font-size': 14.5, fill: BAD }); }
    if (k === 5) { card(690, 330, 230, 50, { rx: 10, text: 'delegate (새 람다)', fs: 14.5, mono: true, stroke: WARN, color: WARN, dash: '5 4', s: pop(u, 0.3) });
      mono(690, 290, '≠', { 'font-size': 22, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(830, 290, '다른 메서드', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      code(500, 404, '-= (s, e) => ...  구독 수 1 → 1', fade(u, 1.6), { fill: BAD, 'font-size': 14 }); } }

  const quiz = [
    { q: 'Op op = Add; 다음에 op = Mul; 로 바꾸고 op(3, 4)를 부르면 무엇이 나오나?',
      o: ['7', '12', '컴파일 에러'], a: 1,
      why: 'op가 가리키는 메서드만 Mul로 바뀌었다. 호출 코드는 그대로인데 3 × 4 = 12가 나온다.' },
    { q: 'Filter(nums, n => n > 10)에서 nums가 { 3, 12, 7, 30 }이면 결과는 무엇인가?',
      o: ['[3, 7]', '[12, 30]', '[12]'], a: 1,
      why: 'Filter는 원소마다 keep(n)을 부르고 true인 것만 모은다. 10보다 큰 12와 30이 남는다.' },
    { q: 'Func<int> f = () => 1; f += () => 2; f()의 값은 무엇인가?',
      o: ['2', '1', '3'], a: 0,
      why: '둘 다 실행되지만 반환값은 마지막 메서드 것만 남는다. 그래서 멀티캐스트는 보통 void로 쓴다.' },
    { q: 'event로 선언한 PriceChanged에 바깥 코드가 할 수 있는 것은 무엇인가?',
      o: ['= 로 통째로 바꾸기', 'PriceChanged(...)로 직접 쏘기', '+= 로 구독하고 -= 로 해제하기'], a: 2,
      why: 'event는 바깥에 add·remove 문만 연다. 대입과 호출은 선언한 Stock 안에서만 된다.' },
    { q: '익명 람다로 구독한 뒤 똑같이 생긴 람다로 -= 했다. 구독은 어떻게 되나?',
      o: ['정상적으로 떨어진다', '그대로 남는다', '예외가 난다'], a: 1,
      why: '람다는 식마다 컴파일러가 다른 메서드를 만든다. 메서드가 달라 일치하는 항목이 없으니 아무것도 떼지 않는다.' },
  ];

  const summary = [
    'delegate는 메서드 모양을 정한 타입이고, 변수에 담긴 메서드를 바꾸면 같은 호출의 결과가 바뀐다.',
    'Action, Func, Predicate에 람다를 넣어 넘기면 Filter 같은 함수가 기준을 밖에서 받는다.',
    '+= 로 붙인 메서드는 한 번 호출에 순서대로 돌고, 반환값은 마지막 것만 남는다.',
    'event는 바깥에 += 와 -= 만 열고, 구독을 해제하지 않으면 게시자가 구독자를 붙들어 둔다.',
  ];
  const review = [
    { q: '화면을 닫았는데 메모리 프로파일러에 ChartView가 계속 남아 있다. 먼저 확인할 것은 무엇인가?',
      o: ['오래 사는 Stock의 이벤트에서 -= 로 해제했는지', 'ChartView에 필드가 너무 많은지', 'Stock이 sealed 인지'], a: 0,
      why: 'Stock의 호출 목록이 핸들러를 통해 ChartView를 가리키면 GC가 수거하지 못한다. Dispose에서 같은 참조로 -= 해야 끊긴다.' },
    { q: '알림 핸들러 셋 중 둘째가 예외를 던지자 셋째가 실행되지 않았다. 고치는 방법은 무엇인가?',
      o: ['핸들러 순서를 바꾼다', 'Func로 바꿔 반환값을 받는다', 'GetInvocationList()로 하나씩 돌며 각각 try/catch로 감싼다'], a: 2,
      why: '멀티캐스트를 한 번에 부르면 중간 예외가 뒤를 끊는다. 하나씩 꺼내 감싸면 나머지가 계속 돈다.' },
    { q: '정렬 기준을 호출하는 쪽마다 다르게 주고 싶다. 가장 알맞은 설계는 무엇인가?',
      o: ['정렬 메서드 안에 if로 모든 기준을 넣는다', '기준을 Func나 Predicate 매개변수로 받는다', '기준마다 정렬 클래스를 상속해 만든다'], a: 1,
      why: '기준을 delegate로 받으면 함수 하나를 그대로 두고 람다만 바꿔 넘긴다. LINQ의 Where도 같은 모양이다.' },
  ];

  R.page({ title: 'delegate와 참조', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
