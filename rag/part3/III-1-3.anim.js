/* III-1-3 유사도 측정 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 벡터는 페이지의 VEC_A · VEC_B · VEC_C, 계산 줄은 beat.result 를 읽는다. 값은 numpy 로 다시 계산해 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, zone, check, cross, hbar, lock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const V = () => (typeof VEC_A === 'undefined' ? null : { A: VEC_A, B: VEC_B, A2: VEC_C });
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 평면: 원점 (90, 380), 1 = 200px
  const O = [90, 380], S = 200, P = (x, y) => [O[0] + x * S, O[1] - y * S];
  function plane(o) { o = o || {};
    el('line', { x1: O[0] - 10, y1: O[1], x2: O[0] + 350, y2: O[1], stroke: MUT, 'stroke-width': 1.6 }); el('line', { x1: O[0], y1: O[1] + 10, x2: O[0], y2: O[1] - 340, stroke: MUT, 'stroke-width': 1.6 });
    [0.5, 1, 1.5].forEach((v) => { mono(P(v, 0)[0], O[1] + 22, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); if (v < 1.6) mono(O[0] - 10, P(0, v)[1] + 5, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    if (o.circle) { const a = (Math.PI / 2) * o.circle; el('path', { d: `M${O[0] + S},${O[1]} A${S},${S} 0 0 0 ${O[0] + S * Math.cos(a)},${O[1] - S * Math.sin(a)}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0.8 }); } }
  function arrow(v, u, col, name, o) { o = o || {}; const [x, y] = P(v.x * (o.k ?? 1), v.y * (o.k ?? 1)); grow(O[0], O[1], x, y, u, col, { sw: o.sw || 3, dash: o.dash });
    if (name && u >= 0.98) tx(x + (o.dx ?? 10), y + (o.dy ?? -8), name, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': o.anchor || 'start' }); }
  // 오른쪽 계산 칸: beat.result.steps 를 줄마다, 새 줄은 이번 beat 에 나타난다
  function calc(c, x, y) { const r = c.beat.result || {}, pr = (c.prev && c.prev.result) || { steps: [] }, n0 = pr.steps ? pr.steps.length : 0;
    mono(x, y, r.formula || '', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    (r.steps || []).forEach((s, i) => { const op = i < n0 ? 1 : fade(c.u, 0.3 + (i - n0) * 0.45), yy = y + 40 + i * 34;
      tx(x, yy, s.k, { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: op }); mono(x + 150, yy, s.v, { 'font-size': 14.5, 'font-weight': 700, opacity: op }); }); }
  // -1 ~ 1 (또는 0~) 눈금 막대 위 표시
  function scale1(x, y, w, lo, hi, val, col, u, labels) { el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: GRID, 'stroke-width': 6, 'stroke-linecap': 'round' });
    (labels || []).forEach(([v, s]) => { const xx = x + (v - lo) / (hi - lo) * w; el('line', { x1: xx, y1: y - 8, x2: xx, y2: y + 8, stroke: MUT, 'stroke-width': 1.5 }); tx(xx, y + 28, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); });
    if (val != null && u > 0) { const xx = x + (lerp(lo, val, u) - lo) / (hi - lo) * w; el('circle', { cx: xx, cy: y, r: 10, fill: col }); mono(xx, y - 18, lerp(lo, val, u).toFixed(3), { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); } }

  // ---------- 1. Cosine ----------
  function s1(t, c) { const { k, u } = c, d = V(); if (!d) return; plane();
    arrow(d.A, k === 0 ? E(u, 0.2, 0.9) : 1, ACC, 'A 연차 문서', { dy: 20 }); arrow(d.B, k === 0 ? E(u, 0.6, 1.3) : 1, WARN, 'B 급여 문서');
    const thA = Math.atan2(d.A.y, d.A.x), thB = Math.atan2(d.B.y, d.B.x);
    if (k >= 2) { const g = k === 2 ? E(u, 0.2, 1.2) : 1, r = 70, a1 = thA, a2 = lerp(thA, thB, g);
      el('path', { d: `M${O[0]},${O[1]} L${O[0] + r * Math.cos(a1)},${O[1] - r * Math.sin(a1)} A${r},${r} 0 0 0 ${O[0] + r * Math.cos(a2)},${O[1] - r * Math.sin(a2)} Z`, fill: ACC, opacity: 0.18 });
      tx(O[0] + 84, O[1] - 66, 'θ ≈ 35°', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: g }); }
    if (k === 3) { arrow(d.A2, E(u, 0.3, 1.2), ACC, 'A × 2', { dash: '7 5', sw: 2 }); note(500, 360, 'A를 두 배로 늘려도 θ는 그대로 → cos 0.822', fade(u, 1.5), { fill: ACC }); }
    if (k === 4) { tx(500, 70, '화살표 방향만 본다', { 'font-size': 17, 'font-weight': 800 });
      [[0, '같은 방향', '1', GOOD], [Math.PI / 2, '직각', '0', MUT], [Math.PI, '반대', '-1', BAD]].forEach(([ang, n, v, col], i) => { const cx = 560 + i * 135, cy = 190, s = pop(u, 0.3 + i * 0.4);
        if (s <= 0) return; const r = 48 * s; grow(cx, cy, cx + r, cy, 1, INK, { sw: 3 }); grow(cx, cy, cx + r * Math.cos(ang), cy - r * Math.sin(ang) - (ang === 0 ? 14 : 0), 1, col, { sw: 3 });
        tx(cx + 20, cy + 60, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' }); mono(cx + 20, cy + 88, 'cos = ' + v, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle' }); });
      note(500, 360, 'A와 B는 0.822 — 같은 쪽을 꽤 가리킨다', fade(u, 1.8)); return; }
    calc(c, 500, 64);
    scale1(520, 300, 380, -1, 1, k >= 2 ? 0.822 : null, ACC, k === 2 ? E(u, 0.4, 1.6) : 1, [[-1, '-1 반대'], [0, '0 직교'], [1, '1 같은 방향']]); }

  // ---------- 2. L2 ----------
  function s2(t, c) { const { k, u } = c, d = V(); if (!d) return; plane();
    const [ax, ay] = P(d.A.x, d.A.y), [bx, by] = P(d.B.x, d.B.y);
    arrow(d.A, k === 0 ? E(u, 0.2, 0.9) : 1, ACC, 'A'); arrow(d.B, k === 0 ? E(u, 0.5, 1.2) : 1, WARN, 'B');
    if (k >= 1 && k <= 3) { const g = k === 1 ? E(u, 0.2, 1.2) : 1;
      el('line', { x1: bx, y1: by, x2: lerp(bx, ax, g), y2: by, stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '4 4' }); el('line', { x1: ax, y1: by, x2: ax, y2: lerp(by, ay, g), stroke: INFO, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      mono((ax + bx) / 2, by - 10, '0.5', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: g }); mono(ax + 10, (ay + by) / 2 + 5, '0.3', { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: g }); }
    if (k >= 2 && k <= 3) { const g = k === 2 ? E(u, 0.2, 1.0) : 1; el('line', { x1: bx, y1: by, x2: lerp(bx, ax, g), y2: lerp(by, ay, g), stroke: BAD, 'stroke-width': 4 });
      mono(262, by - 18, 'd = 0.583', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: g }); }
    if (k === 3) { tx(500, 70, '어디에 맞나', { 'font-size': 17, 'font-weight': 800 });
      [[600, 170, GOOD], [790, 150, INFO], [700, 280, WARN]].forEach(([cx, cy, col], i) => { const s = pop(u, 0.3 + i * 0.3);
        for (let j = 0; j < 6; j++) { const a = j * 1.05 + i, rr = 18 + (j % 2) * 12; el('circle', { cx: cx + Math.cos(a) * rr, cy: cy + Math.sin(a) * rr, r: 5, fill: col, opacity: s }); }
        el('path', { d: `M${cx},${cy - 9} L${cx + 9},${cy} L${cx},${cy + 9} L${cx - 9},${cy} Z`, fill: PANEL, stroke: col, 'stroke-width': 2.5, opacity: s }); });
      note(500, 350, 'K-Means · kNN: 중심까지 L2 거리로 묶는다', fade(u, 1.5)); note(500, 378, 'RAG 검색은 길이 편향 때문에 잘 안 쓴다', fade(u, 1.9), { fill: MUT }); return; }
    if (k === 4) { arrow(d.A2, E(u, 0.2, 0.9), ACC, 'A × 2', { dash: '7 5', sw: 2 });
      tx(500, 70, 'A와 더 닮은 쪽은?', { 'font-size': 17, 'font-weight': 800 });
      const rows = [['', 'B', 'A × 2'], ['cosine', '0.822', '1.000'], ['L2 거리', '0.583', '1.000']];
      rows.forEach((r, i) => r.forEach((s, j) => { const x = 520 + j * 140, y = 120 + i * 50, op = fade(u, 0.6 + i * 0.4);
        tx(x, y, s, { 'font-size': 16, 'font-weight': i === 0 || j === 0 ? 800 : 700, class: i && j ? 'mono' : null, fill: j === 0 ? MUT : INK, opacity: op }); }));
      el('rect', { x: 788, y: 146, width: 96, height: 34, rx: 6, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.4) });
      el('rect', { x: 648, y: 196, width: 96, height: 34, rx: 6, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.8) });
      note(500, 290, 'cosine은 A × 2, L2는 B를 고른다', fade(u, 2.0), { fill: BAD }); note(500, 320, '같은 방향인데 길이 탓에 순위가 뒤집힌다', fade(u, 2.3)); return; }
    calc(c, 500, 64);
    if (k >= 2) mono(500, 330, 'sim = 1/(1+d) = 0.6317', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: k === 2 ? fade(u, 1.8) : 1 });
    sub(700, 380, c.beat.result.rangeLine, k === 0 ? fade(u, 1.2) : 1); }

  // ---------- 3. Inner Product ----------
  function s3(t, c) { const { k, u } = c, d = V(); if (!d) return; plane(k === 4 ? { circle: E(u, 0.2, 1.0) } : {});
    arrow(d.A, k === 0 ? E(u, 0.2, 0.9) : 1, ACC, 'A'); arrow(d.B, k === 0 ? E(u, 0.5, 1.2) : 1, WARN, 'B');
    if (k >= 1 && k <= 3) arrow(d.A2, k === 1 ? E(u, 1.0, 1.8) : 1, ACC, 'A × 2', { dash: '7 5', sw: 2 });
    if (k === 0) { calc(c, 500, 64); sub(700, 380, c.beat.result.rangeLine, fade(u, 1.0)); note(500, 150, 'norm을 구하지 않는다', fade(u, 1.5)); note(500, 178, '→ 가장 싸고 빠른 계산', fade(u, 1.8), { fill: ACC }); return; }
    if (k === 1) { calc(c, 500, 64); const y = 200, g1 = E(u, 0.4, 1.0), g2 = E(u, 1.0, 1.6);
      el('rect', { x: 520, y, width: 240 * 0.24 * g1, height: 30, fill: ACC, opacity: 0.6 }); el('rect', { x: 520 + 240 * 0.24, y, width: 240 * 0.54 * g2, height: 30, fill: ACC });
      mono(520, y + 54, '0.24 + 0.54 = 0.78', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.7) }); return; }
    if (k === 2 || k === 3) { tx(500, 70, '같은 방향, 길이만 다를 때', { 'font-size': 17, 'font-weight': 800 });
      [['A · B', 0.78, INFO], ['(A × 2) · B', 1.56, WARN], ['A · (A × 2)', 2.0, BAD]].forEach(([n, v, col], i) => { const y = 110 + i * 56;
        mono(500, y + 16, n, { 'font-size': 15, 'font-weight': 700 }); hbar(640, y, 200, v, 2, { col, text: v.toFixed(2), h: 22, u: k === 2 ? E(u, 0.3 + i * 0.4, 1.0 + i * 0.4) : 1 }); });
      if (k === 2) { note(500, 300, '길이가 2배면 점수도 2배', fade(u, 1.8), { fill: BAD }); note(500, 328, '긴 문서가 무조건 유리해진다', fade(u, 2.1)); return; }
      card(600, 330, 220, 70, { rx: 10, stroke: GOOD, text: '추천 시스템\n크기 = 인기 · 강도', fs: 14.5, s: pop(u, 0.3) });
      card(830, 330, 220, 70, { rx: 10, stroke: WARN, text: 'RAG 검색\n정규화한 벡터만', fs: 14.5, s: pop(u, 0.8) }); return; }
    // k4: 단위벡터면 dot = cosine
    const nb = Math.hypot(d.B.x, d.B.y), g = E(u, 1.0, 1.8); arrow({ x: d.B.x / lerp(1, nb, g), y: d.B.y / lerp(1, nb, g) }, 1, INFO, null);
    tx(500, 90, 'OpenAI text-embedding-3', { 'font-size': 17, 'font-weight': 800 }); mono(500, 126, '‖v‖ = 1', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
    note(500, 180, '모든 벡터가 길이 1이면', fade(u, 1.4)); mono(500, 214, 'a · b = cos θ', { 'font-size': 20, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) }); }

  // ---------- 4. 정규화 ----------
  function s4(t, c) { const { k, u } = c, d = V(); if (!d) return;
    plane({ circle: k === 0 ? E(u, 0.3, 1.3) : 1 });
    const nb = Math.hypot(d.B.x, d.B.y), g = k === 1 ? E(u, 0.4, 1.4) : k > 1 ? 1 : 0;
    arrow(d.A, 1, ACC, k >= 1 ? 'â' : 'A'); arrow({ x: d.B.x / lerp(1, nb, g), y: d.B.y / lerp(1, nb, g) }, 1, WARN, k >= 1 ? 'b̂' : 'B');
    if (k === 0) { mono(500, 90, 'normalize(v) = v / ‖v‖', { 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.3) });
      note(500, 140, '모든 벡터를 길이 1로 → 점선 원 위로', fade(u, 1.3)); mono(500, 200, '‖A‖ = 1.000   ‖B‖ ≈ 0.949', { 'font-size': 15, opacity: fade(u, 1.8) }); return; }
    if (k === 1) { const [bx, by] = P(d.B.x / nb, d.B.y / nb); el('circle', { cx: bx, cy: by, r: 7, fill: WARN, opacity: fade(u, 1.4) });
      calc(c, 500, 64); note(500, 260, 'B는 0.949 → 1로 조금 늘어난다', fade(u, 1.6), { fill: WARN }); note(500, 288, 'A는 이미 길이 1', fade(u, 1.9)); return; }
    if (k === 2) { [['dot(â, b̂)', '0.8222', 0.3], ['cosine(A, B)', '0.8222', 0.9]].forEach(([n, v, d0], i) => { const cx = 590 + i * 220, s = pop(u, d0);
        card(cx, 140, 190, 86, { rx: 12, stroke: GOOD, sw: 2.2, s }); mono(cx, 128, n, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: s }); mono(cx, 162, v, { 'font-size': 24, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: s }); });
      tx(700, 150, '=', { 'font-size': 28, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); check(700, 240, 16, pop(u, 1.6));
      note(500, 320, '길이가 1이면 내적이 곧 코사인이다', fade(u, 2.0)); return; }
    if (k === 3) { tx(500, 70, '벡터 100만 개 검색', { 'font-size': 17, 'font-weight': 800 });
      for (let i = 0; i < 6; i++) { const y = 100 + i * 34; el('rect', { x: 500, y, width: 200, height: 26, rx: 4, fill: SOFT, stroke: GRID });
        mono(510, y + 18, 'v' + (i + 1), { 'font-size': 13.5, fill: MUT }); mono(560, y + 18, '‖v‖ 계산', { 'font-size': 13.5, fill: BAD, opacity: 1 - E(u, 0.8 + i * 0.1, 1.2 + i * 0.1) });
        if (u > 1.0 + i * 0.1) el('line', { x1: 556, y1: y + 13, x2: 640, y2: y + 13, stroke: BAD, 'stroke-width': 2 }); }
      card(830, 160, 190, 80, { rx: 12, stroke: GOOD, text: '저장할 때 한 번\n정규화', fs: 15, s: pop(u, 1.6) });
      note(500, 340, '검색할 때는 dot 한 번이면 끝', fade(u, 2.0), { fill: GOOD }); return; }
    tx(500, 80, 'text-embedding-3-small', { 'font-size': 17, 'font-weight': 800, class: 'mono' }); mono(500, 112, 'input="연차 휴가 정책"', { 'font-size': 15, opacity: fade(u, 0.3) });
    el('rect', { x: 500, y: 150, width: 380, height: 28, rx: 6, fill: SOFT, stroke: GRID }); el('rect', { x: 500, y: 150, width: 380 * E(u, 0.6, 1.6), height: 28, rx: 6, fill: GOOD });
    mono(890, 210, 'np.linalg.norm(emb) ≈ 1.0', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.6) });
    note(500, 270, '이미 정규화돼 나온다', fade(u, 1.9)); note(500, 298, '→ 바로 dot(ip)을 써도 된다', fade(u, 2.2), { fill: GOOD }); }

  // ---------- 5. 고르는 법 ----------
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { tx(40, 60, '같은 세 벡터, 다른 1위', { 'font-size': 17, 'font-weight': 800 });
      [['cosine으로 찾으면', [['A × 2', '1.000'], ['B', '0.822']], GOOD], ['L2로 찾으면', [['B', '0.583'], ['A × 2', '1.000']], BAD]].forEach(([n, rows, col], i) => { const x = 40 + i * 450, op = fade(u, 0.3 + i * 0.6);
        zone(x, 90, 410, 170, null, { fill: SOFT, op }); tx(x + 18, 122, n + ' (질문 = A)', { 'font-size': 15, 'font-weight': 800, fill: col, opacity: op });
        rows.forEach(([a, v], j) => { tx(x + 30, 170 + j * 44, (j + 1) + '위  ' + a, { 'font-size': 16, 'font-weight': j ? 600 : 800, opacity: op }); mono(x + 360, 170 + j * 44, v, { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'end', opacity: op }); }); });
      banner(480, 320, '학습 metric = 검색 metric', pop(u, 1.6)); note(240, 380, '다르게 쓰면 모델이 배운 순위가 깨진다', fade(u, 2.1)); return; }
    if (k === 1) { tx(40, 60, '모델별 권장 metric', { 'font-size': 17, 'font-weight': 800 });
      [['OpenAI text-embedding-3', '정규화 O', 'cosine ≡ dot', GOOD], ['Cohere embed-multilingual-v3', '정규화 O', 'cosine ≡ dot', GOOD], ['BGE (bge-large, bge-m3)', '정규화 O', 'cosine', GOOD], ['일부 SBERT · 자체 학습', '△', '모델 카드 확인', WARN]].forEach(([a, b, m, col], i) => {
        const y = 100 + i * 66, s = pop(u, 0.2 + i * 0.3); card(480, y + 10, 880, 52, { rx: 10, stroke: col === GOOD ? GRID : WARN, sw: 1.8, s });
        tx(60, y + 16, a, { 'font-size': 15, 'font-weight': 700, opacity: s }); tx(520, y + 16, b, { 'font-size': 14, fill: col, 'font-weight': 700, opacity: s }); mono(900, y + 16, m, { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: s }); }); return; }
    if (k === 2) { card(170, 210, 200, 60, { rx: 12, stroke: INK, sw: 2.5, text: '무엇에 쓰나?', fs: 16, s: pop(u, 0.1) });
      [['RAG 의미 검색', 'cosine', ACC], ['K-Means 클러스터링', 'L2', INFO], ['추천 (크기가 신호)', 'raw dot', WARN], ['kNN (이미지 등)', '모델별', MUT]].forEach(([a, m, col], i) => { const y = 80 + i * 88, g = E(u, 0.4 + i * 0.35, 0.8 + i * 0.35);
        el('path', { d: `M270,210 C350,210 350,${y} ${lerp(270, 430, g)},${y}`, fill: 'none', stroke: col, 'stroke-width': 2.5, opacity: g > 0 ? 1 : 0, 'stroke-dasharray': g < 1 ? `${g * 300} 400` : null });
        card(560, y, 250, 54, { rx: 10, stroke: col, text: a, fs: 15, s: pop(u, 0.8 + i * 0.35) }); mono(720, y + 6, '→ ' + m, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 1.0 + i * 0.35) }); }); return; }
    if (k === 3) { tx(40, 60, 'metric은 컬렉션을 만들 때 정한다', { 'font-size': 17, 'font-weight': 800 });
      R.snippet(40, 90, ['client.create_collection(', '    name="docs",', '    metadata={"hnsw:space": "cosine"},', ')'], { op: fade(u, 0.2) });
      R.snippet(40, 250, ['CREATE INDEX ON docs USING hnsw', '    (embedding vector_cosine_ops);'], { op: fade(u, 0.9) });
      tx(560, 120, 'Chroma', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) }); tx(560, 280, 'pgvector', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      sub(640, 146, 'l2 / ip 도 가능', fade(u, 0.6)); sub(660, 306, 'vector_l2_ops / vector_ip_ops', fade(u, 1.2));
      lock(840, 210, true, ACC, pop(u, 1.6)); tx(840, 252, '나중엔 못 바꾼다', { 'font-size': 14, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    tx(480, 90, '한 줄로 고르기', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
    [['잘 모르겠으면', 'cosine', ACC], ['속도가 필요하면', '정규화 + dot(ip)', GOOD], ['클러스터링이면', 'L2', INFO]].forEach(([a, b, col], i) => { const y = 160 + i * 74, s = pop(u, 0.3 + i * 0.45);
      card(480, y, 520, 58, { rx: 29, stroke: col, sw: 2.2, s }); tx(270, y + 6, a, { 'font-size': 16, 'font-weight': 600, opacity: s }); mono(690, y + 6, b, { 'font-size': 18, 'font-weight': 800, fill: col, 'text-anchor': 'end', opacity: s }); }); }

  const quiz = [
    { q: 'A=[0.8,0.6], B=[0.3,0.9]의 cosine 유사도가 0.822일 때, A를 두 배로 늘린 벡터와 B의 cosine은 얼마인가?',
      o: ['1.644', '0.822 그대로', '0.411'], a: 1,
      why: 'cosine은 내적을 두 길이로 나눠 길이 효과를 지운다. 방향이 같으면 θ ≈ 35°도 그대로라 값도 0.822다.' },
    { q: 'L2 거리로 보면 A에 더 가까운 것이 B(0.583)이고 A×2(1.000)가 더 멀다. 이 결과가 보여 주는 문제는 무엇인가?',
      o: ['같은 방향이라도 길이가 다르면 멀다고 판단한다', 'L2는 음수가 나올 수 있다', 'L2는 2차원에서만 쓸 수 있다'], a: 0,
      why: 'A×2는 A와 방향이 완전히 같지만 끝점이 멀어 L2가 1.0이 된다. 그래서 길이가 제각각인 문서 검색에는 잘 맞지 않는다.' },
    { q: 'a·b=0.78인데 (a×2)·b=1.56이 되는 내적을 RAG에 그대로 쓰면 어떤 위험이 있는가?',
      o: ['짧은 문서만 위로 올라온다', '긴(크기가 큰) 벡터가 무조건 유리해진다', '점수가 0~1을 벗어나지 않는다'], a: 1,
      why: '내적은 방향과 크기를 함께 곱한다. 정규화하지 않으면 크기가 큰 벡터가 점수를 부풀려 순위를 차지한다.' },
    { q: 'â=[0.800,0.600], b̂=[0.316,0.949]처럼 정규화한 뒤 내적을 구하면 무엇과 같아지는가?',
      o: ['L2 거리 0.583', '원래 내적 0.78', 'cosine(A,B) 0.8222'], a: 2,
      why: '길이가 1인 벡터끼리는 분모 ‖A‖‖B‖가 1이라 내적이 곧 cosine이다. 그래서 미리 정규화해 두면 검색 때 dot만 계산하면 된다.' },
    { q: 'Vector DB의 거리 metric을 고를 때 가장 먼저 지킬 원칙은 무엇인가?',
      o: ['임베딩 모델이 학습한 metric과 같게 맞춘다', '가장 빠른 inner product를 고른다', '데이터가 많으면 L2를 고른다'], a: 0,
      why: '모델이 cosine으로 배운 공간을 L2로 재면 같은 세 벡터에서도 1위가 바뀐다. metric은 컬렉션을 만들 때 고정되니 처음에 맞춘다.' },
  ];

  const summary = [
    'cosine은 두 벡터의 각도만 봐서 길이가 달라도 같은 값을 낸다. A와 B는 0.822다.',
    'L2는 끝점 사이 거리라 길이 차이까지 세고, 같은 방향인데 멀다고 판단할 수 있다.',
    '내적은 크기도 곱하므로 정규화하지 않으면 큰 벡터가 점수를 부풀린다.',
    '길이 1로 정규화하면 내적과 cosine이 같아지고, metric은 모델이 학습한 것에 맞춘다.',
  ];
  const review = [
    { q: '자체 학습한 임베딩을 정규화 없이 inner product 인덱스에 넣었더니 긴 문서만 상위에 온다. 먼저 할 일은?',
      o: ['벡터를 길이 1로 정규화해 다시 넣는다', 'k를 늘려 더 많은 문서를 받는다', 'L2 인덱스로 바꾸고 정규화는 하지 않는다'], a: 0,
      why: '정규화하지 않은 내적은 크기가 큰 벡터를 편든다. 길이를 1로 맞추면 내적이 cosine과 같아져 방향만 비교한다.' },
    { q: 'OpenAI text-embedding-3 벡터로 Chroma 컬렉션을 만든다. hnsw:space로 무엇을 고르면 되나?',
      o: ['l2만 지원하므로 l2를 고른다', 'cosine 또는 ip (이미 길이 1이라 결과가 같다)', '정하지 않고 나중에 바꾼다'], a: 1,
      why: '이 모델은 출력이 이미 길이 1이라 dot과 cosine이 같은 답을 낸다. metric은 만들 때 고정되므로 처음에 정한다.' },
    { q: '고객 리뷰 임베딩을 K-Means로 묶고, 같은 임베딩으로 RAG 검색도 하려 한다. metric 조합으로 알맞은 것은?',
      o: ['둘 다 raw dot', '둘 다 L2', '클러스터링은 L2, 검색은 cosine'], a: 2,
      why: 'K-Means는 중심까지의 L2 거리로 묶는 알고리즘이고, 문서 검색은 길이 편향이 없는 cosine이 기본값이다.' },
  ];

  R.page({ title: '유사도 측정', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
