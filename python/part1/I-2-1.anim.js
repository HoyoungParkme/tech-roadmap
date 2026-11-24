/* I-2-1 조건문·반복문·컴프리헨션 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 마름모 (조건)
  function diamond(cx, cy, w, h, text, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op);
    el('path', { d: `M0,${-h / 2} L${w / 2},0 L0,${h / 2} L${-w / 2},0 Z`, fill: o.fill || PANEL, stroke: o.col || INK, 'stroke-width': o.sw || 2.2 }, g);
    mono(0, 5, text, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: o.col || INK }, g); }
  const chip = (cx, cy, s, o) => { o = o || {}; card(cx, cy, Math.max(40, tw(s, 15) + 20), 34, { rx: 8, text: s, fs: 15, mono: true, stroke: o.col || INK, color: o.col || INK, fill: o.fill, s: o.s, op: o.op, sw: o.sw }); };

  // =========================================================
  // 1. 조건문 — 위에서부터 처음 참인 가지 하나 · truthy
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) { const D = [[300, 90, 'score >= 90', "'A'"], [300, 200, 'score >= 80', "'B'"]];
      chip(90, 90, 'score = 82', { col: INFO, fill: INFOBG });
      D.forEach(([x, y, cond, ret], i) => { const judged = k > i || (k === i && u > 1.0), yes = i === 1;
        diamond(x, y, 220, 76, cond, { col: judged ? (yes ? GOOD : MUT) : INK, fill: judged && yes ? GOODBG : PANEL, });
        if (judged && yes) grow(x + 110, y, 520, y, k === 1 ? E(u, 1.2, 1.6) : 1, GOOD);
        card(580, y, 110, 46, { rx: 10, text: 'return ' + ret, fs: 14.5, mono: true, stroke: judged && yes ? GOOD : GRID, color: judged && yes ? GOOD : MUT });
        if (judged) mono(x - 130, y + 34, yes ? 'True' : 'False', { 'font-size': 15, 'font-weight': 800, fill: yes ? GOOD : BAD, 'text-anchor': 'end' });
        if (i === 0) grow(x, y + 38, x, 200 - 38, k > 0 ? 1 : E(u, 1.3, 1.7), MUT); });
      // else
      grow(300, 238, 300, 288, k >= 2 ? 1 : 0, GRID);
      card(300, 310, 140, 44, { rx: 10, text: "else → 'C'", fs: 14.5, mono: true, stroke: GRID, color: OFF, dash: k === 2 ? '6 5' : null });
      // 공 (82) 이 내려간다
      const path = [[160, 90], [190, 90], [300, 90], [300, 200], [520, 200]];
      if (k === 0) dot(path.slice(0, 3), seg(u, 0.2, 0.9), INFO, 9);
      if (k === 1) dot([[300, 128], [300, 200]], seg(u, 0.2, 0.9), INFO, 9);
      if (k === 2) { cross(300, 310, 16, pop(u, 0.4)); sub(470, 316, '검사조차 하지 않는다', fade(u, 0.6), { 'text-anchor': 'start', fill: MUT });
        mono(720, 210, 'print(grade(82))', { 'font-size': 16, opacity: fade(u, 1.2) }); mono(760, 250, '→ B', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) }); }
      if (k === 0) sub(720, 150, '거짓이면 다음 가지로', fade(u, 1.4), { 'font-size': 15 });
      if (k === 1) sub(760, 140, '처음 참인 가지에서 끝', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); return; }
    if (k === 3) { const F = ['[]', '""', '0', 'None', '{}'], T = ['[1]', '"x"', '42', '{"k": 1}'];
      zone(560, 50, 360, 140, 'False 로 본다 (falsy)', { stroke: BAD, fill: BADBG }); zone(560, 220, 360, 140, 'True 로 본다 (truthy)', { stroke: GOOD, fill: GOODBG });
      F.forEach((v, i) => { const st = 0.2 + i * 0.25, p = E(u, st, st + 0.5); chip(lerp(90 + i * 95, 610 + (i % 3) * 110, p), lerp(80, 110 + Math.floor(i / 3) * 44, p), v, { col: BAD }); });
      T.forEach((v, i) => { const st = 1.2 + i * 0.2, p = E(u, st, st + 0.5); chip(lerp(90 + i * 110, 625 + (i % 2) * 150, p), lerp(320, 280 + Math.floor(i / 2) * 44, p), v, { col: GOOD }); });
      mono(60, 190, 'items = []', { 'font-size': 17, 'font-weight': 700 }); mono(60, 222, 'if items:  →  False', { 'font-size': 16, fill: BAD, opacity: fade(u, 0.8) });
      mono(60, 254, "else: print('비었음')", { 'font-size': 16, fill: INK, opacity: fade(u, 1.0) }); return; }
    // k4, k5: 비었나 vs 없나
    const cols = [['if not x', '비었나?'], ['if x is None', '없나?'], ['if x', '(둘 다 뭉갬)']];
    const rows = [['x = []', [true, false, false]], ['x = None', [true, true, false]], ['x = [1]', [false, false, true]]];
    cols.forEach(([h, d], j) => { const x = 420 + j * 180; mono(x, 70, h, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: k === 5 && j === 2 ? BAD : j === 1 ? INFO : INK }); tx(x, 94, d, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    rows.forEach(([lab, vs], i) => { const y = 145 + i * 70; mono(120, y + 6, lab, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.2 + i * 0.3) });
      vs.forEach((v, j) => { const s = pop(u, 0.4 + i * 0.3 + j * 0.1); card(420 + j * 180, y, 110, 46, { rx: 10, text: v ? 'True' : 'False', fs: 16, mono: true, stroke: v ? GOOD : GRID, color: v ? GOOD : MUT, fill: v ? GOODBG : PANEL, s }); }); });
    if (k === 4) { sub(480, 380, '"비었다"와 "값이 없다"를 다른 조건으로 쓴다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    el('rect', { x: 698, y: 116, width: 164, height: 124, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: fade(u, 0.6) });
    sub(780, 400, '[] 와 None 이 똑같이 False', fade(u, 0.8), { fill: BAD, 'font-weight': 700 });
    mono(60, 330, 'len(items) > 0', { 'font-size': 16, fill: MUT, opacity: fade(u, 1.3) }); mono(60, 366, 'user != None', { 'font-size': 16, fill: MUT, opacity: fade(u, 1.5) });
    if (u > 1.4) { el('line', { x1: 56, y1: 325, x2: 56 + 140 * E(u, 1.4, 1.8), y2: 325, stroke: BAD, 'stroke-width': 2.5 }); el('line', { x1: 56, y1: 361, x2: 56 + 124 * E(u, 1.6, 2.0), y2: 361, stroke: BAD, 'stroke-width': 2.5 }); }
    mono(280, 348, '→ not items  /  user is None', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.1) }); }

  // =========================================================
  // 2. 반복문 — zip 이 짝을, enumerate 가 번호를 붙인다
  // =========================================================
  const N = ['kim', 'lee', 'park'], S = [82, 55, 91];
  function s2(t, c) { const { k, u } = c;
    if (k <= 2) { const lo = k === 0 ? 1 : 1 - fade(u, 0.2); mono(60, 70, 'names', { 'font-size': 15, fill: MUT, opacity: lo }); mono(60, 140, 'scores', { 'font-size': 15, fill: MUT, opacity: lo });
      N.forEach((n, i) => { const zx = k >= 1 ? E(u, 0.2 + i * 0.25, 0.8 + i * 0.25) : 0, x = 170 + i * 120, tx2 = k >= 1 ? lerp(x, 430 + i * 150, zx) : x;
        const sk = k === 2 && i === 1 && u > 0.9;
        chip(lerp(x, tx2, 1), lerp(64, 230, zx), `'${n}'`, { col: sk ? OFF : INK, s: k === 0 ? pop(u, 0.2 + i * 0.2) : 1 });
        chip(lerp(x, tx2, 1), lerp(134, 270, zx), String(S[i]), { col: sk ? OFF : S[i] < 60 ? BAD : INK, s: k === 0 ? pop(u, 0.4 + i * 0.2) : 1 });
        if (k >= 1) { el('rect', { x: tx2 - 52, y: 205, width: 104, height: 90, rx: 10, fill: 'none', stroke: sk ? OFF : INFO, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: zx });
          mono(tx2, 190, String(i), { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.2 + i * 0.2) }); } });
      if (k === 0) sub(480, 330, '같은 순서로 짝지어진 두 리스트', fade(u, 1.4), { 'font-size': 15 });
      if (k === 1) { mono(480, 345, 'for i, (name, score) in enumerate(zip(names, scores))', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        sub(480, 380, 'range(len(…)) 로 인덱스를 굴리지 않는다', fade(u, 2.2), { 'font-size': 14 }); }
      if (k === 2) { const cur = Math.min(2, Math.floor(u / 0.8)); el('path', { d: `M${430 + cur * 150 - 10},318 l10,-12 l10,12 z`, fill: ACC });
        if (u > 0.9) { cross(580, 250, 14, pop(u, 0.9)); mono(580, 330, 'continue', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.0) }); }
        mono(60, 340, '출력', { 'font-size': 14, fill: MUT }); mono(60, 370, '0 kim 82', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) }); mono(60, 400, '2 park 91', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.9) }); }
      return; }
    if (k === 3 || k === 4) { mono(60, 70, 'for score in scores:  (90점 이상 찾기)', { 'font-size': 16, 'font-weight': 700 });
      const hit = 2; S.forEach((v, i) => { const st = 0.2 + i * 0.5, on = k === 4 || u > st, isHit = i === hit && (k === 4 || u > st);
        card(200 + i * 150, 150, 100, 54, { rx: 10, text: String(v), fs: 20, mono: true, stroke: isHit ? GOOD : on ? INK : GRID, color: isHit ? GOOD : INK, fill: isHit ? GOODBG : PANEL, sw: isHit ? 3 : 2 });
        if (on) mono(200 + i * 150, 205, isHit ? '>= 90' : '< 90', { 'font-size': 14, fill: isHit ? GOOD : MUT, 'text-anchor': 'middle' }); });
      if (k === 3) { dot([[150, 115], [500, 115]], seg(u, 0.2, 1.4), ACC, 7); grow(555, 150, 730, 150, E(u, 1.5, 1.9), GOOD);
        card(800, 150, 130, 50, { rx: 25, text: 'break', fs: 17, mono: true, stroke: GOOD, color: GOOD, s: pop(u, 1.8) });
        mono(200, 290, '우수자 발견: 91', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); return; }
      el('rect', { x: 120, y: 260, width: 330, height: 100, rx: 12, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: fade(u, 0.2) });
      tx(140, 290, 'break 로 끝남', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.3) }); mono(140, 325, 'else 건너뜀', { 'font-size': 16, fill: INK, opacity: fade(u, 0.5) });
      el('rect', { x: 500, y: 260, width: 340, height: 100, rx: 12, fill: SOFT, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: fade(u, 1.0) });
      tx(520, 290, '끝까지 돌았다면 (break 없음)', { 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 1.1) }); mono(520, 325, "else: print('우수자 없음')", { 'font-size': 15, fill: MUT, opacity: fade(u, 1.3) });
      sub(480, 400, '플래그 변수 없이 "못 찾았다"를 적는다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: while — 상태가 조건
    mono(60, 70, 'while retries < 3 and not ok:', { 'font-size': 16, 'font-weight': 700 });
    tx(60, 100, 'try_connect() 결과는 예시: 실패, 실패, 성공', { 'font-size': 14, fill: MUT });
    const res = [false, false, true]; res.forEach((ok, i) => { const st = 0.3 + i * 0.6, y = 160 + i * 64;
      card(160, y, 110, 46, { rx: 10, text: `시도 ${i + 1}`, fs: 15, stroke: INK, s: pop(u, st) });
      grow(220, y, 330, y, E(u, st + 0.2, st + 0.4), ok ? GOOD : BAD);
      card(400, y, 120, 46, { rx: 10, text: ok ? 'ok = True' : 'ok = False', fs: 15, mono: true, stroke: ok ? GOOD : BAD, color: ok ? GOOD : BAD, s: pop(u, st + 0.3) });
      mono(510, y + 6, `retries = ${i + 1}`, { 'font-size': 15, fill: MUT, opacity: fade(u, st + 0.4) }); });
    card(780, 230, 260, 80, { rx: 12, text: '몇 번 돌지는 데이터가 아니라\n상태(ok)가 정한다', fs: 15, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 2.2) }); }

  // =========================================================
  // 3. 리스트 컴프리헨션 — 거르기 → 바꾸기 → 모으기
  // =========================================================
  const XS = [1, 2, 3, 4, 5, 6];
  function belt(u, upto, o) { o = o || {}; // 컨베이어: 원소가 거름망·변환기를 지난다
    el('line', { x1: 60, y1: 230, x2: 900, y2: 230, stroke: GRID, 'stroke-width': 3 });
    card(380, 230, 120, 70, { rx: 10, text: 'x % 2 == 0', fs: 14, mono: true, stroke: WARN, color: WARN, fill: WARNBG, s: o.f ?? 1 });
    tx(380, 182, '거르기', { 'font-size': 14, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: o.f ?? 1 });
    if ((o.m ?? 1) > 0) { card(600, 230, 100, 70, { rx: 10, text: 'x ** 2', fs: 15, mono: true, stroke: INFO, color: INFO, fill: INFOBG, s: o.m }); tx(600, 182, '바꾸기', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: o.m }); }
    const out = [];
    XS.slice(0, upto).forEach((x, i) => { const st = 0.2 + i * 0.35, p = seg(u, st, st + 0.9), pass = x % 2 === 0;
      if (p <= 0) return;
      if (!pass) { const px = lerp(90, 340, clamp(p * 1.6)); chip(px, 230 + (p > 0.62 ? (p - 0.62) * 200 : 0), String(x), { col: p > 0.62 ? OFF : INK, op: 1 - clamp((p - 0.7) * 3) }); return; }
      if ((o.m ?? 1) === 0) { chip(lerp(90, 520, clamp(p * 1.4)), 230, String(x), { col: p > 0.5 ? GOOD : INK }); if (p > 0.8) mono(520, 280, '통과', { 'font-size': 14, fill: GOOD, 'font-weight': 700, 'text-anchor': 'middle' }); return; }
      if (p < 1) chip(lerp(90, 820, p), 230, String(p > 0.68 ? x * x : x), { col: p > 0.68 ? ACC : INK });
      else out.push(x * x); });
    return out; }
  function s3(t, c) { const { k, u } = c;
    mono(60, 64, 'xs = [1, 2, 3, 4, 5, 6]', { 'font-size': 17, 'font-weight': 700 });
    if (k === 0) { XS.forEach((x, i) => chip(120 + i * 70, 140, String(x), { s: pop(u, 0.2 + i * 0.15) }));
      tx(560, 145, '짝수만 골라 제곱하기', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.2) });
      [['거르기', WARN], ['바꾸기', INFO], ['모으기', ACC]].forEach(([s, col], i) => pill(250 + i * 220, 280, s, col, pop(u, 1.6 + i * 0.3), { fs: 16 })); return; }
    if (k === 1 || k === 2) { const out = belt(u, k === 1 ? 2 : 6, { m: k === 1 ? 0 : 1 });
      mono(60, 330, 'result', { 'font-size': 15, fill: MUT });
      cells(140, 310, k === 1 ? [] : out, { w: 60, h: 40, style: () => ({ stroke: ACC, color: ACC }) });
      if (k === 1) sub(480, 380, '1 은 떨어지고 2 는 통과한다', fade(u, 1.8), { 'font-size': 15 });
      if (k === 2) mono(480, 400, 'result = [4, 16, 36]', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.5), 'text-anchor': 'middle' }); return; }
    if (k === 3) { const line = '[x ** 2 for x in xs if x % 2 == 0]', x0 = 120, cw = 10.2;
      mono(x0, 150, line, { 'font-size': 17, 'font-weight': 700 });
      [[1, 6, '바꾸기', INFO, 1], [8, 17, '순회', MUT, 0.6], [18, 33, '거르기', WARN, 0.3]].forEach(([a, b, s, col, st]) => {
        el('path', { d: `M${x0 + a * cw},160 v10 h${(b - a) * cw * E(u, st, st + 0.5)} v-10`, fill: 'none', stroke: col, 'stroke-width': 2.5 });
        tx(x0 + (a + b) / 2 * cw, 196, s, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, st + 0.3) }); });
      sub(560, 230, '읽는 순서: 뒤의 for·if 를 먼저, 앞의 식을 나중에', fade(u, 1.4), { 'font-size': 15 });
      tx(120, 290, '60만 개 기준 (이 PC, Python 3.12 측정)', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) });
      [['for + append', 27.7, MUT], ['컴프리헨션', 25.2, ACC]].forEach(([n, v, col], i) => { mono(120, 324 + i * 40, n, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: fade(u, 1.7) });
        hbar(290, 310 + i * 40, 400, v, 27.7, { col, u: E(u, 1.8, 2.4), text: v + 'ms' }); }); return; }
    // k4: 중첩 — 3×3 격자에서 i < j 만
    mono(120, 120, '[(i, j) for i in range(3)', { 'font-size': 16, 'font-weight': 700 }); mono(160, 148, 'for j in range(3) if i < j]', { 'font-size': 16, 'font-weight': 700 });
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const st = 0.3 + (i * 3 + j) * 0.18, on = i < j && u > st + 0.1;
      card(640 + j * 80, 120 + i * 80, 70, 60, { rx: 8, text: `(${i},${j})`, fs: 15, mono: true, stroke: on ? ACC : GRID, color: on ? ACC : OFF, fill: on ? ACCBG : PANEL, s: pop(u, st) }); }
    [0, 1, 2].forEach((j) => { mono(640 + j * 80, 80, 'j=' + j, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' }); mono(595, 125 + j * 80, 'i=' + j, { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); });
    mono(120, 260, '→ [(0, 1), (0, 2), (1, 2)]', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
    sub(300, 340, 'for 가 셋 이상 겹치면 루프로 푼다', fade(u, 2.4), { 'font-size': 15, fill: WARN, 'font-weight': 700 }); }

  // =========================================================
  // 4. 괄호가 정하는 결과 · 제너레이터는 멈췄다 이어진다
  // =========================================================
  function genBox(x, y, state, o) { o = o || {}; el('rect', { x, y, width: 300, height: 130, rx: 14, fill: INFOBG, stroke: INFO, 'stroke-width': 2.4 });
    mono(x + 16, y + 28, '<generator> squares', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    mono(x + 16, y + 62, 'x * x  for x in nums', { 'font-size': 15 });
    cells(x + 16, y + 78, [1, 2, 3], { w: 44, h: 36, gap: 8, style: (i) => ({ stroke: i === state ? ACC : i < state ? OFF : INK, color: i < state ? OFF : INK, sw: i === state ? 3 : 2 }) });
    if (state < 3) el('path', { d: `M${x + 38 + state * 52 - 8},${y + 126} l8,-10 l8,10 z`, fill: ACC });
    mono(x + 180, y + 102, state === 0 ? '시작 전' : '여기서 멈춤', { 'font-size': 14, fill: ACC, 'font-weight': 700 }); }
  function s4(t, c) { const { k, u } = c;
    mono(60, 50, 'nums = [1, 2, 3]   words = ["a", "bb"]', { 'font-size': 15, fill: MUT });
    if (k <= 2) { const V = [['[x*x for x in nums]', '[1, 4, 9]', 'list'], ['{w: len(w) for w in words}', "{'a': 1, 'bb': 2}", 'dict'], ['{c for c in "aabbc"}', "{'a', 'b', 'c'}", 'set']];
      V.forEach(([e, o, kind], i) => { if (i > k) return; const y = 110 + i * 100, st = i === k ? 0.2 : -1, cur = i === k;
        card(240, y, 340, 54, { rx: 10, text: e, fs: 16, mono: true, stroke: cur ? ACC : GRID, color: cur ? INK : MUT, s: cur ? pop(u, 0.2) : 1 });
        grow(420, y, 520, y, cur ? E(u, 0.6, 1.0) : 1, cur ? ACC : OFF);
        mono(540, y + 6, o, { 'font-size': 17, 'font-weight': 800, fill: cur ? ACC : MUT, opacity: cur ? fade(u, 1.0) : 1 });
        mono(820, y + 6, kind, { 'font-size': 15, fill: MUT, opacity: cur ? fade(u, 1.2) : 1 }); });
      if (k === 0) sub(480, 400, '대괄호: 결과 전체를 바로 메모리에 만든다', fade(u, 1.8), { 'font-size': 15 });
      if (k === 1) sub(480, 400, '중괄호 + 키:값 → dict', fade(u, 1.8), { 'font-size': 15 });
      if (k === 2) { ['a', 'a', 'b', 'b', 'c'].forEach((ch, i) => chip(560 + i * 50, 380, ch, { col: i === 1 || i === 3 ? OFF : INK, op: i === 1 || i === 3 ? 1 - fade(u, 1.6) * 0.7 : 1, s: pop(u, 1.2 + i * 0.08) })); sub(420, 386, '중복은 자동으로 사라진다', fade(u, 1.8), { 'font-size': 14, 'text-anchor': 'end' }); }
      return; }
    if (k === 3 || k === 4) { const state = k === 3 ? 0 : u > 1.4 ? 2 : u > 0.4 ? 1 : 0;
      mono(60, 90, 'squares = (x * x for x in nums)', { 'font-size': 17, 'font-weight': 700 });
      genBox(80, 130, state);
      if (k === 3) { tx(500, 170, '만드는 순간 계산된 값: 0개', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.8) });
        tx(500, 210, 'sys.getsizeof(squares) = 200바이트', { 'font-size': 15, opacity: fade(u, 1.4), class: 'mono' });
        sub(680, 300, '원소가 몇 개든 생성기 크기는 같다', fade(u, 2.0), { 'font-size': 15 }); return; }
      [['next(squares)', '1', 0.3], ['next(squares)', '4', 1.3]].forEach(([e, v, st], i) => { const y = 160 + i * 70;
        mono(520, y, e, { 'font-size': 16, opacity: fade(u, st) }); grow(660, y - 5, 720, y - 5, E(u, st + 0.2, st + 0.5), ACC);
        mono(740, y, v, { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, st + 0.5) }); });
      sub(600, 330, '부를 때마다 하나 계산하고 그 자리에서 멈춘다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { mono(60, 100, 'sum(x * x for x in range(10_000_000))', { 'font-size': 17, 'font-weight': 700 });
      mono(60, 134, '= 333333283333335000000', { 'font-size': 16, fill: ACC, opacity: fade(u, 0.3) });
      tx(60, 190, '최대 메모리 (tracemalloc, 이 PC 측정)', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      [['sum([x * x for …])  리스트', 409.09, BAD, '409.1 MB'], ['sum(x * x for …)  제너레이터', 0.000536, GOOD, '0.0005 MB']].forEach(([n, v, col, lab], i) => { const y = 230 + i * 70;
        mono(60, y, n, { 'font-size': 15, fill: col, 'font-weight': 700, opacity: fade(u, 0.5 + i * 0.4) });
        hbar(60, y + 12, 640, v, 409.09, { col, h: 22, u: E(u, 0.6 + i * 0.4, 1.6 + i * 0.4), text: lab }); });
      sub(480, 400, '값을 흘려보내며 더하므로 리스트가 생기지 않는다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k6: 파일 한 줄씩
    el('rect', { x: 60, y: 90, width: 250, height: 260, rx: 10, fill: SOFT, stroke: INK, 'stroke-width': 2 }); mono(76, 118, 'big.log (예시)', { 'font-size': 14, fill: MUT });
    const L = ['INFO start', 'INFO user=7', 'ERROR db timeout', 'INFO retry', '…'];
    L.forEach((s, i) => mono(80, 160 + i * 38, s, { 'font-size': 14.5, fill: s.startsWith('ERROR') ? BAD : INK, opacity: u > 0.3 + i * 0.35 && i <= 2 ? 0.35 : 1 }));
    [0, 1, 2].forEach((i) => { const st = 0.3 + i * 0.35; fly(250, 155 + i * 38, 470, 220, seg(u, st, st + 0.35), L[i].split(' ')[0], { mono: true, fill: i === 2 ? BAD : OFF, color: i === 2 ? PANEL : INK }); });
    card(520, 220, 140, 60, { rx: 10, text: '"ERROR" in ln', fs: 14, mono: true, stroke: WARN, color: WARN, fill: WARNBG });
    grow(590, 220, 700, 220, E(u, 1.4, 1.7), BAD);
    mono(710, 226, 'first', { 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
    mono(400, 330, 'next(errors, None)  →  첫 ERROR 줄에서 멈춤', { 'font-size': 15, opacity: fade(u, 2.0) });
    sub(560, 380, '메모리에는 한 줄씩만 올라온다 · 나머지는 읽지 않았다', fade(u, 2.3), { 'font-size': 14 }); }

  // =========================================================
  // 5. match · := · 순회 중 수정
  // =========================================================
  function s5(t, c) { const { k, u } = c;
    if (k <= 1) { mono(60, 60, 'cmd = ("move", 10, 0)', { 'font-size': 17, 'font-weight': 700 });
      const V = ['"move"', '10', '0']; V.forEach((v, i) => chip(120 + i * 110, 110, v, { col: INFO, fill: INFOBG }));
      const arms = [['("move", dx, dy)', true], ['("stop",)', false], ['_', false]];
      arms.forEach(([p, hit], i) => { const y = 200 + i * 70, live = i === 0 || k === 0;
        card(240, y, 300, 52, { rx: 10, text: 'case ' + p, fs: 16, mono: true, stroke: hit ? GOOD : k === 1 ? GRID : INK, color: hit ? GOOD : k === 1 ? OFF : INK, fill: hit && (k === 1 || u > 1.0) ? GOODBG : PANEL, s: k === 0 ? pop(u, 0.2 + i * 0.25) : 1 });
        if (k === 1 && i > 0) cross(410, y, 12, pop(u, 0.3 + i * 0.3)); });
      if (k === 0) { [[0, 'move', 'move'], [1, 'dx', '10'], [2, 'dy', '0']].forEach(([i, n, v], j) => { const st = 1.0 + j * 0.35;
          grow(120 + i * 110, 128, 560 + j * 120, 200, E(u, st, st + 0.3), j ? ACC : GOOD); if (j) mono(570 + j * 120, 240, `${n} = ${v}`, { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, st + 0.3), 'text-anchor': 'middle' }); });
        mono(560, 120, '모양 비교 + 언패킹', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.8) });
        mono(600, 330, 'return "이동 10,0"', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.2) }); return; }
      sub(680, 280, '처음 맞는 가지 하나만, 아래는 검사하지 않는다', fade(u, 1.2), { 'font-size': 15 }); sub(680, 310, 'case _ 는 마지막 기본값', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 2) { tx(60, 60, 'data 가 150건이라면 (예시)', { 'font-size': 15, fill: MUT });
      mono(60, 110, 'if (n := len(data)) > 100:', { 'font-size': 18, 'font-weight': 700 });
      el('rect', { x: 106, y: 88, width: 152, height: 30, rx: 6, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.4) });
      card(200, 220, 120, 50, { rx: 10, text: 'len(data)', fs: 15, mono: true, s: pop(u, 0.6) }); grow(260, 220, 360, 220, E(u, 0.9, 1.2), ACC);
      tag2(430, 220, 'n', '150', pop(u, 1.2));
      grow(500, 220, 600, 180, E(u, 1.5, 1.8), MUT); mono(620, 186, '150 > 100 → True', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.8) });
      grow(500, 220, 600, 260, E(u, 1.8, 2.1), MUT); mono(620, 266, 'f"{n}건 — 배치 처리"', { 'font-size': 15, opacity: fade(u, 2.1) });
      sub(480, 360, 'len() 을 한 번만 부르고 결과를 본문에서 다시 쓴다', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { mono(60, 56, 'xs = [3, -1, -2, 5]   for x in xs: if x < 0: xs.remove(x)', { 'font-size': 15, 'font-weight': 700 });
      // 단계: 0) i=0 3  1) i=1 -1 제거 → [3,-2,5]  2) i=2 → 5 (-2 건너뜀)
      const ph = u < 0.8 ? 0 : u < 1.7 ? 1 : 2, arr = ph === 0 ? [3, -1, -2, 5] : [3, -2, 5], idx = ph === 0 ? (u < 0.4 ? 0 : 1) : ph === 1 ? 1 : 2;
      cells(200, 110, arr, { w: 70, h: 52, index: true, style: (i, v) => ({ stroke: i === idx ? ACC : v === -2 && ph === 2 ? BAD : INK, sw: i === idx || (v === -2 && ph === 2) ? 3 : 2 }) });
      el('path', { d: `M${200 + idx * 76 + 35 - 9},200 l9,-12 l9,12 z`, fill: ACC });
      if (ph === 1) sub(200 + 76 + 35, 228, '-1 제거 → 뒤가 한 칸 당겨짐', fade(u, 0.9), { fill: WARN, 'font-weight': 700 });
      if (ph === 2) sub(200 + 76 + 35, 228, '-2 는 한 번도 검사되지 않았다', fade(u, 1.8), { fill: BAD, 'font-weight': 700 });
      mono(60, 300, '결과 [3, -2, 5]', { 'font-size': 17, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) });
      mono(60, 345, 'xs = [x for x in xs if x >= 0]  →  [3, 5]', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { mono(60, 70, 'rows = [parse(l) for l in huge_file]', { 'font-size': 16, fill: BAD, 'font-weight': 700 });
      mono(60, 110, 'rows = (parse(l) for l in huge_file)', { 'font-size': 16, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(60, 170, '같은 꼴의 실측: 1천만 개 제곱 합계의 최대 메모리', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0) });
      [['리스트', 409.09, BAD, '409.1 MB'], ['제너레이터', 0.000536, GOOD, '0.0005 MB']].forEach(([n, v, col, lab], i) => { const y = 210 + i * 60;
        tx(60, y + 16, n, { 'font-size': 15, fill: col, 'font-weight': 700 }); hbar(170, y, 560, v, 409.09, { col, h: 22, u: E(u, 1.2 + i * 0.3, 2.0 + i * 0.3), text: lab }); });
      sub(480, 380, '집계만 필요하면 대괄호를 소괄호로 바꾼다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k5: 과중첩 → 이름 붙인 루프
    const nest = [[60, 70, 400, 260, 'for … in …'], [90, 120, 340, 190, 'for … in …  if …'], [120, 170, 280, 110, 'for … in …  if …']];
    nest.forEach(([x, y, w, h, s], i) => { el('rect', { x, y, width: w, height: h, rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 2, opacity: 1 - fade(u, 1.4) * 0.6 }); mono(x + 12, y + 24, s, { 'font-size': 14, fill: BAD, opacity: 1 - fade(u, 1.4) * 0.6 }); });
    mono(260, 360, '한 줄이지만 읽히지 않는다', { 'font-size': 15, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 });
    ['for order in orders:', '    items = paid_items(order)', '    for item in items:', '        result.append(item.id)'].forEach((s, i) => mono(540, 120 + i * 40, s, { 'font-size': 15, opacity: fade(u, 0.8 + i * 0.3) }));
    tx(540, 82, '루프로 풀어 중간값에 이름을 (예시)', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.6) });
    sub(700, 330, '"짧게"보다 "읽기 쉽게"', fade(u, 2.2), { 'font-size': 17, fill: GOOD, 'font-weight': 800 }); }
  function tag2(cx, cy, n, v, s) { const g = R.G(cx, cy, s);
    el('path', { d: 'M-44,-20 H44 V20 H-44 L-58,0 Z', fill: ACCBG, stroke: ACC, 'stroke-width': 2.2 }, g); mono(0, 6, `${n} = ${v}`, { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' }, g); }

  const quiz = [
    { q: 'grade(82)에서 score >= 80 가지가 참이 된 뒤 else 가지는 어떻게 되는가?',
      o: ['검사는 하지만 결과를 버린다', '검사조차 하지 않는다', 'else가 마지막에 한 번 더 실행된다'], a: 1,
      why: 'if/elif는 위에서부터 보다가 처음 참인 가지 하나만 실행하고 끝난다. 그래서 82는 B를 돌려주고 끝난다.' },
    { q: 'for-else에서 else 블록이 실행되는 경우는 무엇인가?',
      o: ['루프가 한 번도 돌지 않았을 때만', '루프 안에서 예외가 났을 때', 'break 없이 루프가 끝까지 돌았을 때'], a: 2,
      why: 'break로 빠져나오면 else를 건너뛴다. 91을 찾아 break 한 예에서는 "우수자 없음"이 찍히지 않는다.' },
    { q: '[x ** 2 for x in xs if x % 2 == 0]을 읽는 자연스러운 순서는 무엇인가?',
      o: ['뒤의 for·if로 무엇을 고르는지 보고, 앞의 식으로 어떻게 바꾸는지 본다', '왼쪽부터 x ** 2를 먼저 계산한다고 읽는다', 'if가 먼저 실행되고 for가 나중에 돈다'], a: 0,
      why: '순회와 거르기가 먼저 일어나고 남은 값에 x ** 2가 적용된다. 그래서 결과는 [4, 16, 36]이다.' },
    { q: 'squares = (x * x for x in nums)를 실행한 직후에 계산된 값은 몇 개인가?',
      o: ['3개, nums 전체를 미리 계산한다', '0개, next()를 부를 때 하나씩 계산한다', '1개, 첫 값만 미리 계산한다'], a: 1,
      why: '제너레이터식은 생성기 객체만 만든다. next(squares)를 부를 때마다 하나 계산하고 그 자리에서 멈춘다.' },
    { q: 'xs = [3, -1, -2, 5]를 돌면서 음수를 remove 했더니 [3, -2, 5]가 남았다. 이유는 무엇인가?',
      o: ['remove가 첫 번째 음수만 지우는 함수라서', '-2가 음수로 판정되지 않아서', '-1을 지우자 -2가 당겨져 다음 반복이 그 칸을 건너뛰었다'], a: 2,
      why: '순회 중인 리스트에서 지우면 인덱스가 어긋난다. 컴프리헨션으로 새 리스트를 만들면 [3, 5]가 나온다.' },
  ];

  const summary = [
    'if/elif는 위에서부터 보다가 처음 참인 가지 하나만 실행한다.',
    '빈 값과 None은 둘 다 거짓이라 "비었나"는 not x, "없나"는 is None으로 나눠 쓴다.',
    'for는 이터러블을 꺼내는 루프다. 번호는 enumerate, 짝은 zip, 못 찾은 경우는 for-else로 쓴다.',
    '컴프리헨션은 걸러 바꿔 모으는 일을 한 줄로 쓰고, 소괄호면 값을 하나씩 흘려 1천만 개 합계도 메모리를 거의 안 쓴다.',
  ];
  const review = [
    { q: '사용자 목록을 받는 함수에서 if not users: return을 썼더니, 빈 목록과 조회 실패(None)를 구분하지 못했다. 고칠 방법은?',
      o: ['if users is None으로 실패를 먼저 따로 처리한다', 'if len(users) > 0으로 바꾼다', 'if users == []로 바꾼다'], a: 0,
      why: '[]와 None은 둘 다 거짓이라 not users 하나로는 구분되지 않는다. 값이 없음은 is None으로 따로 본다.' },
    { q: '로그 파일 수 GB에서 ERROR 줄 수만 세려고 len([l for l in f if "ERROR" in l])를 썼더니 메모리가 부족했다. 맞는 수정은?',
      o: ['파일을 f.readlines()로 먼저 읽는다', 'sum(1 for l in f if "ERROR" in l)처럼 제너레이터로 센다', 'for 문 안에서 리스트에 append 한다'], a: 1,
      why: '대괄호는 결과 전체를 메모리에 만든다. 1천만 개 실측에서 리스트는 409.1MB, 제너레이터는 거의 0이었다.' },
    { q: '두 리스트 names, scores를 range(len(names))로 돌다가 scores가 하나 짧아 IndexError가 났다. 더 안전한 쓰기는?',
      o: ['while 루프로 바꾼다', 'try/except로 IndexError를 삼킨다', 'for name, score in zip(names, scores)로 짝을 지어 돈다'], a: 2,
      why: 'zip은 짧은 쪽에 맞춰 짝을 만들고 인덱스를 손으로 굴리지 않게 한다. 번호가 필요하면 enumerate를 겹친다.' },
  ];

  R.page({ title: '흐름이 갈리는 곳', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
