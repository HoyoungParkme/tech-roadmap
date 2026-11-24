/* I-1-2 벡터 DB 핵심 개념 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 문장이 숫자 칸으로 바뀌는 띠(장면 1) → 두 벡터의 각도·거리·내적(장면 2) → HNSW 층 그래프와 IVF 셀(장면 3)
 *       → Recall·QPS 평면 위의 인덱스들과 직접 잰 곡선(장면 4) → 네 개념이 도는 고리(장면 5).
 * 숫자: 페이지 STEPS 데이터와 코드. distance.py 의 세 값(0.997 · 0.084 · 1.286)은 numpy 로 다시 계산한 값이다.
 *       장면 4 마지막 beat 의 곡선은 faiss-cpu 1.16 으로 이 PC 에서 잰 값(beat.curve)이다. 나머지 벤치마크 값은 예시다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, hbar, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const typed = (s, u, a, d) => s.slice(0, Math.round(s.length * clamp((u - a) / d)));
  function rnd(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  // ---------- 장면 1. Embedding ----------
  const SEN = [150, 110], MOD = [490, 110];
  function strip(vals, u0, u, o) { o = o || {}; const n = 8, cs = 80, x = 140, y = 230;
    for (let i = 0; i < n; i++) { const v = vals[i], s = o.fill ? clamp((u - u0 - i * 0.12) / 0.25) : 1, has = v !== undefined && v !== 0 && s > 0.5;
      const cx = x + i * cs, a = has ? clamp(Math.abs(v)) : 0;
      el('rect', { x: cx, y, width: cs - 6, height: 52, rx: 6, fill: has ? (v < 0 ? BAD : ACC) : PANEL, opacity: has ? 0.15 + 0.6 * a : 1, stroke: 'none' });
      el('rect', { x: cx, y, width: cs - 6, height: 52, rx: 6, fill: 'none', stroke: o.hi && o.hi(i) ? INK : GRID, 'stroke-width': o.hi && o.hi(i) ? 2.5 : 1.5 });
      mono(cx + (cs - 6) / 2, y + 32, has ? v.toFixed(2) : '?', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: has ? (a > 0.6 ? PANEL : INK) : OFF }); }
    mono(x + n * cs + 4, y + 32, '…', { 'font-size': 18, fill: MUT }); }
  function s1(t, c) { const { k, u } = c, e = c.beat.sim.embedding, p = c.prev && c.prev.sim.embedding;
    const wait = e.input.startsWith('(');
    card(SEN[0], SEN[1], 250, 60, { rx: 12, fill: wait ? PANEL : SOFT, stroke: wait ? OFF : INK, dash: wait ? '6 5' : null, sw: 2,
      text: k === 2 ? typed(e.input, u, 0.2, 1.0) || ' ' : e.input, fs: 16, color: wait ? MUT : INK });
    sub(SEN[0], SEN[1] - 44, '사람이 쓰는 문장', 1, { 'font-size': 14 });
    const mOn = e.model.startsWith('('), ms = k === 1 ? pop(u, 0.2) : 1;
    const g = card(MOD[0], MOD[1], 250, 70, { rx: 12, fill: mOn ? PANEL : ACCBG, stroke: mOn ? OFF : ACC, dash: mOn ? '6 5' : null, sw: 2.5, s: mOn ? 1 : ms });
    tx(0, -6, '임베딩 모델', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: mOn ? MUT : ACC }, g);
    tx(0, 18, e.model, { 'text-anchor': 'middle', 'font-size': 14, class: 'mono', fill: mOn ? MUT : INK }, g);
    if (e.dim) pill(MOD[0] + 210, MOD[1], `${e.dim}차원`, ACC, k === 1 ? pop(u, 0.9) : 1, { mono: true, fs: 15 });
    grow(SEN[0] + 128, SEN[1], MOD[0] - 128, MOD[1], k === 0 ? E(u, 0.3, 1.0) : 1, k === 0 ? OFF : MUT, { dash: k === 0 ? '6 5' : null });
    grow(MOD[0], MOD[1] + 38, 460, 222, k === 0 ? E(u, 0.6, 1.3) : 1, k === 0 ? OFF : MUT, { dash: k === 0 ? '6 5' : null });
    if (k === 0) tx(480, 340, '목표: 텍스트를 숫자 배열로', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
    if (k === 3) { dot([[SEN[0] + 128, SEN[1]], [MOD[0] - 128, MOD[1]]], seg(u, 0.1, 0.6), ACC, 7); dot([[MOD[0], MOD[1] + 38], [460, 222]], seg(u, 0.6, 0.9), ACC, 7); }
    if (k === 5 || (k === 4 && false)) {}
    if (k <= 4) strip(e.vector, k === 3 ? 0.9 : 0, u, { fill: k === 3, hi: k === 4 ? (i) => i < 5 : null });
    if (k === 3) mono(140, 320, 'response.data[0].embedding', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) });
    if (k === 4) { el('path', { d: 'M140,300 V310 H534 V300', fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.3) });
      mono(337, 334, 'vector[:5]', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      const n = Math.round(tween(0, 1536, u, 1.4)); for (let i = 0; i < 96; i++) { const on = i < n / 16; el('rect', { x: 140 + i * 7, y: 362, width: 5, height: 22, fill: on ? ACC : SOFT, opacity: on ? 0.35 + (i % 5) * 0.12 : 1 }); }
      mono(820, 380, `len = ${n}`, { 'font-size': 17, 'font-weight': 800, fill: ACC }); }
    if (k === 5) { // 모델마다 길이가 다르다
      [['OpenAI 3-small', 1536, ACC], ['E5-large', 1024, INFO], ['BGE-base', 768, WARN]].forEach(([nm, d, col], i) => { const y = 240 + i * 46, w = 470 * d / 1536 * E(u, 0.2 + i * 0.25, 0.9 + i * 0.25);
        tx(40, y + 17, nm, { 'font-size': 15, 'font-weight': 700, fill: col }); el('rect', { x: 180, y, width: Math.max(2, w), height: 24, rx: 4, fill: col, opacity: 0.75 });
        mono(190 + w, y + 18, String(d), { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.8 + i * 0.25) }); });
      card(850, 286, 170, 70, { rx: 10, stroke: BAD, fill: BADBG, text: '다른 모델끼리\n비교 불가', fs: 15, color: BAD, s: pop(u, 1.6) }); } }

  // ---------- 장면 2. Distance ----------
  const VA = [0.12, 0.85, -0.34, 0.67], VB = [0.15, 0.82, -0.28, 0.71];   // distance.py 의 a, b
  function bars(u0, u) { const x0 = 60, zy = 230, sc = 150; el('line', { x1: x0 - 10, y1: zy, x2: 420, y2: zy, stroke: MUT, 'stroke-width': 1.5 });
    VA.forEach((v, i) => { const gx = x0 + i * 92, g1 = E(u, u0 + i * 0.15, u0 + 0.5 + i * 0.15), g2 = E(u, u0 + 0.2 + i * 0.15, u0 + 0.7 + i * 0.15);
      [[v, ACC, 0, g1], [VB[i], INFO, 34, g2]].forEach(([w, col, dx, g]) => { const h = w * sc * g; el('rect', { x: gx + dx, y: h >= 0 ? zy - h : zy, width: 30, height: Math.abs(h), rx: 3, fill: col, opacity: 0.85 }); });
      mono(gx + 32, zy + (v < 0 ? -12 : 26), `d${i + 1}`, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
    tx(x0, 52, 'a  강아지가 공을 물었다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, u0) });
    tx(x0, 76, 'b  개가 장난감을 가지고 놀았다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, u0 + 0.2) });
    sub(240, 400, '앞 4개 차원 (distance.py)', fade(u, u0), { 'font-size': 14 }); }
  const GO = [520, 370], GA = [800, 120], GB = [900, 210];
  function geo(which, u, f) { // 모양을 크게 키운 그림 (실제 두 벡터는 거의 겹친다)
    el('line', { x1: GO[0] - 10, y1: GO[1], x2: 930, y2: GO[1], stroke: GRID, 'stroke-width': 1.5 });
    grow(GO[0], GO[1], GA[0], GA[1], 1, ACC, { sw: 3 }); grow(GO[0], GO[1], GB[0], GB[1], 1, INFO, { sw: 3 });
    tx(GA[0] - 12, GA[1] - 6, 'a', { 'font-size': 17, 'font-weight': 800, fill: ACC, class: 'mono', 'text-anchor': 'end' }); tx(GB[0] + 8, GB[1] + 2, 'b', { 'font-size': 17, 'font-weight': 800, fill: INFO, class: 'mono' });
    sub(725, 400, '모양을 키운 그림 · 실제 두 벡터는 거의 겹친다', 1, { 'font-size': 13.5 });
    const ang = (p) => Math.atan2(GO[1] - p[1], p[0] - GO[0]);
    if (which === 'cos') { const a0 = ang(GB), a1 = ang(GA), r = 90, e = lerp(a0, a1, E(u, 0.2, 0.9));
      el('path', { d: `M${GO[0] + r * Math.cos(a0)},${GO[1] - r * Math.sin(a0)} A${r},${r} 0 0 0 ${GO[0] + r * Math.cos(e)},${GO[1] - r * Math.sin(e)}`, fill: 'none', stroke: WARN, 'stroke-width': 3 });
      mono(GO[0] + 108, GO[1] - 40, 'θ', { 'font-size': 20, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.8) }); }
    if (which === 'l2') { const g = E(u, 0.2, 1.0); el('line', { x1: GA[0], y1: GA[1], x2: lerp(GA[0], GB[0], g), y2: lerp(GA[1], GB[1], g), stroke: BAD, 'stroke-width': 3.5, 'stroke-dasharray': '7 5' });
      tx(870, 150, '직선 거리', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.9) }); }
    if (which === 'ip') { const ax = GA[0] - GO[0], ay = GA[1] - GO[1], bx = GB[0] - GO[0], by = GB[1] - GO[1], k = (ax * bx + ay * by) / (ax * ax + ay * ay), F = [GO[0] + ax * k, GO[1] + ay * k], g = E(u, 0.2, 1.0);
      el('line', { x1: GB[0], y1: GB[1], x2: lerp(GB[0], F[0], g), y2: lerp(GB[1], F[1], g), stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      el('line', { x1: GO[0], y1: GO[1], x2: lerp(GO[0], F[0], E(u, 1.0, 1.6)), y2: lerp(GO[1], F[1], E(u, 1.0, 1.6)), stroke: WARN, 'stroke-width': 7, opacity: 0.6, 'stroke-linecap': 'round' });
      tx(F[0] - 44, F[1] + 34, 'b를 a에 비춘 길이 × |a|', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4), 'text-anchor': 'end' }); }
    if (f) card(725, 46, 360, 46, { rx: 10, fill: SOFT, stroke: GRID, text: f, fs: 17, mono: true, s: pop(u, 0.1) }); }
  function s2(t, c) { const { k, u } = c, m = c.beat.sim.distance.metrics;
    if (k === 0) { [['Cosine', '방향', ACC], ['L2', '거리', BAD], ['Inner Product', '내적', WARN]].forEach(([n, d, col], i) => { const s = pop(u, 0.2 + i * 0.35), cx = 180 + i * 300;
        card(cx, 200, 250, 150, { rx: 14, stroke: col, sw: 2.5, s });
        if (s > 0.5) { tx(cx, 160, n, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col }); tx(cx, 190, d, { 'text-anchor': 'middle', 'font-size': 15, fill: MUT });
          const ox = cx - 50, oy = 252; grow(ox, oy, ox + 90, oy - 40, 1, ACC, { sw: 2.5 }); grow(ox, oy, ox + 100, oy - 10, 1, INFO, { sw: 2.5 });
          if (i === 1) el('line', { x1: ox + 90, y1: oy - 40, x2: ox + 100, y2: oy - 10, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '4 3' });
          if (i === 0) el('path', { d: `M${ox + 40},${oy - 4} A40,40 0 0 0 ${ox + 37},${oy - 17}`, fill: 'none', stroke: WARN, 'stroke-width': 3 });
          if (i === 2) el('line', { x1: ox, y1: oy, x2: ox + 92, y2: oy - 27, stroke: WARN, 'stroke-width': 6, opacity: 0.5 }); } });
      tx(480, 360, '비슷함을 재는 자가 세 가지', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 1.5) }); return; }
    bars(k === 1 ? 0.2 : -9, u);
    if (k === 1) { tx(700, 200, '두 벡터 a, b', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.0) });
      tx(700, 232, '부호와 크기가 거의 같다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) }); return; }
    if (k === 2) { geo('cos', u, m[0].formula); return; }
    if (k === 3) { geo('l2', u, m[1].formula); return; }
    if (k === 4) { geo('ip', u, m[2].formula); return; }
    // k5·k6: 세 값
    const pm = c.prev && c.prev.sim.distance.metrics, num = (i) => { const v = parseFloat(m[i].val), pv = pm && parseFloat(pm[i].val); return tween(isNaN(pv) ? 0 : pv, v, u); };
    const vals = [num(0), num(1), num(2)];
    meters(470, 60, 460, [{ name: 'cosine', val: vals[0].toFixed(3), good: k === 6, hot: false }, { name: 'L2', val: vals[1].toFixed(3) }, { name: 'IP', val: vals[2].toFixed(3) }], { h: 76 });
    if (k === 5) { tx(480, 190, '1에 가까움', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.2) }); tx(640, 190, '0에 가까움', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.4) }); tx(796, 190, '클수록 비슷', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
      mono(480, 260, '|a| = 1.141   |b| = 1.130', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.8) });
      tx(480, 290, '길이가 1이 아니라 IP가 1을 넘는다', { 'font-size': 15, fill: WARN, 'font-weight': 700, opacity: fade(u, 2.1) });
      tx(480, 318, '정규화하면 IP = cosine = 0.997', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.3) }); return; }
    el('rect', { x: 466, y: 56, width: 152, height: 84, rx: 12, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: fade(u, 0.2) });
    tx(480, 196, '텍스트 임베딩은 방향이 의미', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.5) });
    lock(500, 270, u > 1.2, INK, pop(u, 1.0)); tx(530, 276, '인덱스를 만들 때 metric 고정', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.1) });
    tx(530, 306, '중간에 바꾸면 다시 빌드해야 한다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) }); }

  // ---------- 장면 3. Index: 층 그래프와 셀 ----------
  const LY = { 'L2 (top)': 92, L1: 200, 'L0 (bottom)': 310 }, NX = (x) => 110 + (x - 40) * 2.15, SK = 50;
  function plane3(y, name, op, s) { if (op <= 0.01) return; const x0 = 60, x1 = 700, h = 58;
    el('path', { d: `M${x0 + SK},${y - h / 2} L${x1 + SK},${y - h / 2} L${x1 - SK},${y + h / 2} L${x0 - SK},${y + h / 2} Z`, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op });
    tx(x0 - SK + 6, y + h / 2 + 18, name, { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono', opacity: op }); }
  const FILL0 = (() => { const r = rnd(5), a = []; for (let i = 0; i < 70; i++) a.push([75 + r() * 610, 310 - 22 + r() * 44]); return a; })();
  function s3(t, c) { const { k, u } = c, ix = c.beat.sim.index, L = ix.layers, RX = 735;
    const has = (n) => L.some((l) => l.label === n), pl = c.prev && c.prev.sim.index.layers;
    const newL = (n) => has(n) && !(pl && pl.some((l) => l.label === n));
    if (k === 6) { // 규모별 선택: 로그 눈금
      const X = (e) => 80 + (e - 3) * 130; el('line', { x1: 70, y1: 250, x2: 880, y2: 250, stroke: MUT, 'stroke-width': 2 });
      [[3, '1천'], [4, '1만'], [5, '10만'], [6, '100만'], [7, '1000만'], [8, '1억'], [9, '10억']].forEach(([e, s]) => { el('line', { x1: X(e), y1: 244, x2: X(e), y2: 256, stroke: MUT, 'stroke-width': 2 }); tx(X(e), 280, s, { 'text-anchor': 'middle', 'font-size': 14.5, fill: MUT }); });
      tx(880, 306, '벡터 개수', { 'text-anchor': 'end', 'font-size': 14, fill: MUT });
      const band = (a, b, y, col, name, d) => { const g = E(u, d, d + 0.7); el('rect', { x: X(a), y, width: (X(b) - X(a)) * g, height: 40, rx: 8, fill: col, opacity: 0.2 }); el('rect', { x: X(a), y, width: (X(b) - X(a)) * g, height: 40, rx: 8, fill: 'none', stroke: col, 'stroke-width': 2 });
        tx(X(a) + 14, y + 26, name, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, d + 0.3) }); };
      band(3, 5, 170, GOOD, 'Flat  ·  10만 이하', 0.2); band(6, 9, 170, ACC, 'HNSW  ·  100만 이상', 0.7);
      card(560, 360, 360, 44, { rx: 22, fill: WARNBG, stroke: WARN, text: '메모리가 모자라면 IVF + PQ', fs: 16, color: WARN, s: pop(u, 1.5) });
      tx(480, 80, '언제 무엇을 쓸까', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800 }); return; }
    if (k === 5) { // IVF: k-means 셀
      const r = rnd(21), cen = []; for (let i = 0; i < 14; i++) cen.push([90 + r() * 560, 60 + r() * 320]);
      const q = [380, 230], near = cen.map((p, i) => [Math.hypot(p[0] - q[0], p[1] - q[1]), i]).sort((a, b) => a[0] - b[0]).slice(0, 2).map((x) => x[1]);
      const cs = 22; for (let gx = 60; gx < 700; gx += cs) for (let gy = 40; gy < 400; gy += cs) { const cx = gx + cs / 2, cy = gy + cs / 2;
        const j = cen.reduce((m, p, i) => (Math.hypot(p[0] - cx, p[1] - cy) < Math.hypot(cen[m][0] - cx, cen[m][1] - cy) ? i : m), 0), on = near.includes(j) && u > 1.0;
        el('rect', { x: gx, y: gy, width: cs - 1, height: cs - 1, fill: on ? ACC : j % 2 ? SOFT : GRID, opacity: on ? 0.35 : clamp(u * 2 - (gx - 60) / 640) * 0.8 }); }
      cen.forEach((p, i) => el('circle', { cx: p[0], cy: p[1], r: 6 * pop(u, 0.4 + i * 0.03), fill: near.includes(i) && u > 1.0 ? ACC : INK }));
      el('circle', { cx: q[0], cy: q[1], r: 9 * pop(u, 0.8), fill: BAD, stroke: PANEL, 'stroke-width': 2 }); tx(q[0] + 14, q[1] - 10, 'query', { 'font-size': 15, 'font-weight': 800, fill: BAD, class: 'mono', opacity: fade(u, 0.9) });
      mono(RX, 90, 'nlist = 1000', { 'font-size': 17, 'font-weight': 800 }); tx(RX, 116, '그림은 셀 14개', { 'font-size': 14, fill: MUT });
      mono(RX, 170, 'nprobe = 10', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) }); tx(RX, 196, '가까운 셀만 연다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.1) });
      tx(RX, 250, '1000개 중 10개 = 1%', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) }); mono(RX, 290, '~5ms', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) }); return; }
    // 층들
    const lift = (n) => (newL(n) ? E(u, 0.2, 1.0) : 1);
    L.slice().reverse().forEach((l) => { const y = LY[l.label], g = lift(l.label), yy = lerp(310, y, g); plane3(yy, l.label, g); });
    // 층 사이 세로선과 이웃선
    const L0 = L.find((l) => l.label.startsWith('L0'));
    L.forEach((l) => { const y = lerp(310, LY[l.label], lift(l.label)), op = lift(l.label);
      for (let i = 0; i < l.nodes.length - 1; i++) el('line', { x1: NX(l.nodes[i].x), y1: y, x2: NX(l.nodes[i + 1].x), y2: y, stroke: l.label.startsWith('L0') ? GRID : MUT, 'stroke-width': 2, opacity: op });
      if (!l.label.startsWith('L0')) l.nodes.forEach((n) => el('line', { x1: NX(n.x), y1: y + 8, x2: NX(n.x), y2: 300, stroke: OFF, 'stroke-width': 1.3, 'stroke-dasharray': '3 4', opacity: op })); });
    const flat = k === 1;
    if (k <= 1) FILL0.forEach(([x, y], i) => { const sc = flat ? x < lerp(40, 720, E(u, 0.2, 2.2)) : false; el('circle', { cx: x, cy: y, r: 3.5 * (k === 0 ? clamp(u * 3 - i / 30) : 1), fill: sc ? BAD : OFF, opacity: 0.8 }); });
    L.forEach((l) => { const y = lerp(310, LY[l.label], lift(l.label));
      l.nodes.forEach((n, i) => { const s = newL(l.label) ? pop(u, 0.6 + i * 0.08) : 1; el('circle', { cx: NX(n.x), cy: y, r: 9 * s, fill: n.hit ? ACC : PANEL, stroke: n.hit ? ACC : INK, 'stroke-width': 2.5 }); }); });
    // 쿼리 점
    const qx = NX(ix.query.x), qy = 336; el('circle', { cx: qx, cy: qy, r: 7, fill: BAD }); tx(qx + 12, qy + 6, 'query', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, class: 'mono' });
    if (k === 0) { tx(RX, 120, '벡터 1,000,000개', { 'font-size': 18, 'font-weight': 800 }); mono(RX, 150, '× 1536차원', { 'font-size': 16, fill: MUT });
      tx(RX, 210, '인덱스 없음', { 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) }); return; }
    if (k === 1) { const n = Math.round(tween(0, 1000000, u, 2.0)); tx(RX, 90, 'IndexFlatL2', { 'font-size': 17, 'font-weight': 800, class: 'mono' });
      tx(RX, 130, '모두와 거리 계산', { 'font-size': 15, fill: MUT }); mono(RX, 180, n.toLocaleString('en-US'), { 'font-size': 22, 'font-weight': 800, fill: BAD }); tx(RX, 206, '번 비교 / 쿼리', { 'font-size': 14.5, fill: MUT });
      mono(RX, 260, '~700ms', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 2.0) }); tx(RX, 286, '정확도 100%', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { mono(RX, 90, 'IndexHNSWFlat', { 'font-size': 16, 'font-weight': 800 }); mono(RX, 130, 'M = 32', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.5) });
      tx(RX, 156, '노드마다 이웃 최대 32개', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) }); tx(RX, 210, '점 일부가 위층에도 올라간다', { 'font-size': 14.5, opacity: fade(u, 1.2) }); return; }
    if (k === 3) { mono(RX, 90, 'efConstruction = 200', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 0.6) }); tx(RX, 114, '빌드 품질', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.6) });
      mono(RX, 160, 'efSearch = 64', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) }); tx(RX, 184, '검색 품질', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.0) });
      tx(RX, 236, '위층은 듬성, 아래층은 촘촘', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.5) }); tx(RX, 262, '올리면 정확하고 느려진다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); return; }
    // k4: 위에서 아래로 내려가는 탐색
    const L2 = L[0], a0 = L2.nodes[0], d = L.find((l) => l.label === 'L1').nodes.find((n) => n.hit) || { x: 160 }, i0 = L0.nodes.find((n) => n.hit) || { x: 175 };
    const route = [[NX(a0.x), LY['L2 (top)']], [NX(d.x), LY['L2 (top)']], [NX(d.x), LY.L1], [NX(i0.x), LY.L1], [NX(i0.x), LY['L0 (bottom)']]];
    const hop = E(u, 0.2, 1.9); for (let i = 0; i < route.length - 1; i++) { const s = clamp(hop * 4 - i); if (s > 0) grow(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1], s, WARN, { sw: 3.5 }); }
    tx(NX(a0.x) - 14, LY['L2 (top)'] - 18, '진입점', { 'font-size': 14.5, 'font-weight': 700, fill: WARN });
    tx(RX, 90, '위층: 크게 건너뛰기', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); tx(RX, 120, '아래층: 좁혀 가기', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
    tx(RX, 190, '700ms → 1ms', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) }); tx(RX, 218, '100만 개에서', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }

  // ---------- 장면 4. ANN: Recall 과 QPS ----------
  const AX = { x: 90, y: 60, w: 470, h: 280 };
  const lx = (q) => AX.x + (Math.log10(Math.max(q, 0.5)) - Math.log10(0.5)) / (Math.log10(20000) - Math.log10(0.5)) * AX.w;
  const ly = (r) => AX.y + AX.h - (r - 85) / 15 * AX.h;
  function annAxes(o) { o = o || {}; el('line', { x1: AX.x, y1: AX.y + AX.h, x2: AX.x + AX.w, y2: AX.y + AX.h, stroke: MUT, 'stroke-width': 1.8 }); el('line', { x1: AX.x, y1: AX.y, x2: AX.x, y2: AX.y + AX.h, stroke: MUT, 'stroke-width': 1.8 });
    [1, 10, 100, 1000, 10000].forEach((q) => { el('line', { x1: lx(q), y1: AX.y + AX.h, x2: lx(q), y2: AX.y + AX.h + 5, stroke: MUT }); mono(lx(q), AX.y + AX.h + 22, q >= 1000 ? q / 1000 + 'k' : String(q), { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
    [85, 90, 95, 100].forEach((r) => { mono(AX.x - 8, ly(r) + 5, String(r), { 'text-anchor': 'end', 'font-size': 14, fill: MUT }); el('line', { x1: AX.x, y1: ly(r), x2: AX.x + AX.w, y2: ly(r), stroke: GRID, 'stroke-dasharray': '3 4' }); });
    tx(AX.x + AX.w, AX.y + AX.h + 46, 'QPS (초당 쿼리, 로그)', { 'text-anchor': 'end', 'font-size': 14, fill: MUT, 'font-weight': 600 });
    tx(AX.x - 8, AX.y - 16, 'Recall@10 (%)', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); }
  const SHORT = (n) => n.split(' (')[0];
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (b.curve) return curve(c);
    const cmp = b.sim.ann.compare, prev = c.prev && c.prev.sim && c.prev.sim.ann.compare, RX = 610;
    annAxes();
    if (k >= 6 || cmp.length >= 4) { el('rect', { x: AX.x, y: ly(99), width: AX.w, height: ly(95) - ly(99), fill: GOODBG, opacity: fade(u, 0.3) * 0.8 });
      tx(AX.x + 10, ly(95) - 8, '프로덕션 구간 95~99%', { 'font-size': 14, fill: GOOD, 'font-weight': 700, opacity: fade(u, 0.5) }); }
    if (k === 0) { [['DB 벡터 100만', 0], ['쿼리 1000개', 1], ['top-k = 10', 2]].forEach(([s, i]) => pill(760, 120 + i * 60, s, INK, pop(u, 0.2 + i * 0.3), { fs: 16 })); return; }
    cmp.forEach((r) => { const was = prev && prev.find((p) => p.name === r.name), isNew = !was;
      const q = r.qps || 0.5, pq = was ? (was.qps || 0.5) : q, x = lx(tween(pq, q, u)), y = ly(r.recall), s = isNew ? pop(u, 0.3) : 1;
      const col = r.name.startsWith('Flat') ? INK : r.name.startsWith('HNSW') ? ACC : r.name.startsWith('IVF-PQ') ? WARN : INFO;
      el('circle', { cx: x, cy: y, r: (r.hit ? 11 : 8) * s, fill: r.hit ? col : PANEL, stroke: col, 'stroke-width': 3 });
      const up = r.name.startsWith('HNSW') || r.name.startsWith('Flat');
      tx(x + (r.name.startsWith('Flat') ? 16 : 0), y + (r.name.startsWith('Flat') ? 5 : up ? -16 : 26), SHORT(r.name) + (r.qps ? '' : ' ?'), { 'text-anchor': r.name.startsWith('Flat') ? 'start' : 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: clamp(s) }); });
    if (k === 1) { tx(RX, 110, '정답부터 구한다', { 'font-size': 17, 'font-weight': 800 }); tx(RX, 140, 'Flat 전수검색의 top-10', { 'font-size': 15, fill: MUT }); tx(RX, 166, '= ground truth', { 'font-size': 15, fill: MUT, class: 'mono' });
      tx(RX, 220, 'Recall은 정의상 100%', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) }); return; }
    if (k === 2) { tx(RX, 110, 'QPS = 1000 / 걸린 초', { 'font-size': 16, 'font-weight': 800, class: 'mono' });
      mono(RX, 170, 'Flat  1.4 QPS', { 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) }); tx(RX, 198, '쿼리 하나에 700ms', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) }); return; }
    if (k === 3) { // Recall@k: 정답 10칸과 예측 10칸이 겹치는 비율
      tx(RX, 70, 'Recall@10 = 겹친 수 / 10', { 'font-size': 16, 'font-weight': 800 });
      ['정답', '예측'].forEach((nm, j) => { tx(RX, 118 + j * 60, nm, { 'font-size': 15, 'font-weight': 700, fill: j ? ACC : INK });
        for (let i = 0; i < 10; i++) { const s = pop(u, 0.3 + j * 0.4 + i * 0.05); el('rect', { x: RX + 50 + i * 27, y: 98 + j * 60, width: 22 * s, height: 30, rx: 4, fill: j ? ACCBG : SOFT, stroke: j ? ACC : INK, 'stroke-width': 1.6 }); mono(RX + 61 + i * 27, 119 + j * 60, String(i + 1), { 'text-anchor': 'middle', 'font-size': 13.5, opacity: clamp(s) }); } });
      mono(RX, 250, 'Flat: 10 / 10 = 100%', { 'font-size': 17, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.6) }); return; }
    if (k === 4) { grow(lx(1.4) + 14, ly(100) + 14, lx(1000) - 16, ly(99) + 4, E(u, 0.6, 1.4), ACC, { sw: 2.5, dash: '6 5' });
      tx(RX, 100, 'HNSW  efSearch=64', { 'font-size': 16, 'font-weight': 800, fill: ACC, class: 'mono' }); mono(RX, 140, 'QPS 1000 · Recall 99%', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(RX, 190, 'Flat보다 약 700배 빠르고', { 'font-size': 15, opacity: fade(u, 1.3) }); tx(RX, 216, '정답 1%만 놓친다', { 'font-size': 15, opacity: fade(u, 1.5) }); tx(RX, 270, '(예시 값)', { 'font-size': 14, fill: MUT }); return; }
    if (k === 5) { tx(RX, 100, 'IVF  nprobe=10', { 'font-size': 16, 'font-weight': 800, fill: INFO, class: 'mono' }); mono(RX, 140, 'QPS 200 · Recall 95%', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
      tx(RX, 190, 'HNSW보다 느리고 덜 정확', { 'font-size': 15, opacity: fade(u, 1.3) }); tx(RX, 270, '(예시 값)', { 'font-size': 14, fill: MUT }); return; }
    // k6
    tx(RX, 100, 'IVF-PQ  압축', { 'font-size': 16, 'font-weight': 800, fill: WARN }); mono(RX, 136, 'QPS 2000 · Recall 92%', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) });
    tx(RX, 190, 'efSearch · nprobe를 올리면', { 'font-size': 15, opacity: fade(u, 1.0) }); tx(RX, 216, '위로(정확) 왼쪽으로(느림)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2) });
    grow(lx(2000), ly(93), lx(300), ly(98.5), E(u, 1.2, 2.0), WARN, { sw: 2.5 }); }
  // 마지막 beat: faiss 로 직접 잰 곡선 (beat.curve = [{name, col, pts:[[qps, recall, 라벨]]}])
  function curve(c) { const { u } = c, cv = c.beat.curve, X0 = 90, Y0 = 50, W = 470, H = 300;
    const X = (q) => X0 + (Math.log10(q) - 2) / 2.2 * W, Y = (r) => Y0 + H - r / 100 * H;
    el('line', { x1: X0, y1: Y0 + H, x2: X0 + W, y2: Y0 + H, stroke: MUT, 'stroke-width': 1.8 }); el('line', { x1: X0, y1: Y0, x2: X0, y2: Y0 + H, stroke: MUT, 'stroke-width': 1.8 });
    [100, 1000, 10000].forEach((q) => { mono(X(q), Y0 + H + 22, q >= 1000 ? q / 1000 + 'k' : String(q), { 'text-anchor': 'middle', 'font-size': 14, fill: MUT }); });
    [0, 25, 50, 75, 100].forEach((r) => { mono(X0 - 8, Y(r) + 5, String(r), { 'text-anchor': 'end', 'font-size': 14, fill: MUT }); el('line', { x1: X0, y1: Y(r), x2: X0 + W, y2: Y(r), stroke: GRID, 'stroke-dasharray': '3 4' }); });
    tx(X0 + W, Y0 + H + 46, 'QPS (로그)', { 'text-anchor': 'end', 'font-size': 14, fill: MUT, 'font-weight': 600 }); tx(X0 - 8, Y0 - 16, 'Recall@10 (%)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    cv.forEach((s, j) => { const col = C[s.col], pts = s.pts.map(([q, r]) => [X(q), Y(r)]), g = E(u, 0.2 + j * 0.7, 1.0 + j * 0.7);
      const n = (pts.length - 1) * g, i = Math.floor(n), ps = pts.slice(0, i + 1); if (i < pts.length - 1) ps.push([lerp(pts[i][0], pts[i + 1][0], n - i), lerp(pts[i][1], pts[i + 1][1], n - i)]);
      el('polyline', { points: ps.map((p) => p.join(',')).join(' '), fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-linejoin': 'round' });
      s.pts.forEach(([q, r, l], m) => { if (m > n + 0.01) return; el('circle', { cx: X(q), cy: Y(r), r: 5, fill: col }); if (l) mono(X(q) + 6, Y(r) - 10, l, { 'font-size': 13.5, fill: col, 'font-weight': 700 }); });
      tx(620, 120 + j * 92, s.name, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + j * 0.7) });
      tx(620, 146 + j * 92, s.note, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.4 + j * 0.7) }); });
    tx(620, 70, 'faiss-cpu로 직접 잰 값', { 'font-size': 15, 'font-weight': 700 }); tx(620, 94, '10만 × 1536 · 쿼리 1000 · k=10', { 'font-size': 14, fill: MUT });
    tx(620, 330, '점 옆 숫자 = efSearch', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.6) }); }

  // ---------- 장면 5. 네 개념의 고리 ----------
  const NODE = { embedding: [210, 110], distance: [750, 110], index: [750, 300], ann: [210, 300] };
  const ORDER = ['embedding', 'distance', 'index', 'ann'], NAME = { embedding: '1. Embedding', distance: '2. Distance', index: '3. Index', ann: '4. ANN' };
  function mini(key, cx, cy, s) { if (s < 0.3) return; const op = clamp((s - 0.3) / 0.5);
    if (key === 'embedding') { [0.12, 0.85, -0.34, 0.67, -0.11].forEach((v, i) => el('rect', { x: cx - 100 + i * 42, y: cy + 4, width: 36, height: 28, rx: 4, fill: v < 0 ? BAD : ACC, opacity: (0.2 + 0.6 * Math.abs(v)) * op })); mono(cx + 112, cy + 24, '…', { 'font-size': 16, fill: MUT, opacity: op }); }
    if (key === 'distance') { const ox = cx - 90, oy = cy + 34; el('line', { x1: ox, y1: oy, x2: ox + 80, y2: oy - 36, stroke: ACC, 'stroke-width': 3, opacity: op }); el('line', { x1: ox, y1: oy, x2: ox + 88, y2: oy - 22, stroke: INFO, 'stroke-width': 3, opacity: op });
      mono(cx + 10, cy + 26, 'cos 0.997', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: op }); }
    if (key === 'index') { [[-60, 1], [0, 2], [60, 3]].forEach(([dy, n], j) => { const y = cy + 2 + j * 13; el('line', { x1: cx - 100 + j * 6, y1: y, x2: cx + 40 - j * 6, y2: y, stroke: MUT, 'stroke-width': 2, opacity: op });
        for (let i = 0; i < n * 2; i++) el('circle', { cx: cx - 90 + j * 6 + i * (120 / (n * 2)), cy: y, r: 3.5, fill: INK, opacity: op }); }); mono(cx + 56, cy + 24, '~1ms', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: op }); }
    if (key === 'ann') { mono(cx - 100, cy + 24, 'Recall 0.99', { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: op }); mono(cx + 30, cy + 24, 'top-10', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: op }); } }
  function s5(t, c) { const { k, u } = c, on = k === 4 ? ORDER : ORDER.slice(0, k + 1);
    const loop = [[NODE.embedding[0] + 150, NODE.embedding[1]], [NODE.distance[0] - 150, NODE.distance[1]], [NODE.distance[0], NODE.distance[1] + 52], [NODE.index[0], NODE.index[1] - 52], [NODE.index[0] - 150, NODE.index[1]], [NODE.ann[0] + 150, NODE.ann[1]]];
    for (let i = 0; i < loop.length - 1; i += 2) { const g = k === 4 ? 1 : i / 2 < k ? 1 : i / 2 === k ? E(u, 1.4, 2.0) : 0; grow(loop[i][0], loop[i][1], loop[i + 1][0], loop[i + 1][1], g, MUT, { sw: 2.5 }); }
    ORDER.forEach((key, i) => { const [cx, cy] = NODE[key], isOn = on.includes(key), cur = k < 4 && i === k, s = cur ? pop(u, 0.2) : isOn ? 1 : 0;
      card(cx, cy, 300, 100, { rx: 14, stroke: isOn ? ACC : OFF, sw: cur ? 3 : 2, fill: cur ? ACCBG : PANEL, dash: isOn ? null : '6 5' });
      tx(cx - 130, cy - 20, NAME[key], { 'font-size': 17, 'font-weight': 800, fill: isOn ? INK : OFF });
      mini(key, cx, cy - 8, cur ? seg(u, 0.4, 1.2) : isOn ? 1 : 0); });
    if (k >= 3) grow(NODE.ann[0] + 150, NODE.ann[1] - 30, 404, 222, k === 3 ? E(u, 1.6, 2.2) : 1, MUT, { sw: 2.5 });
    card(480, 205, 150, 46, { rx: 23, fill: k === 4 ? INK : SOFT, stroke: k === 4 ? 'none' : GRID, text: 'top-k 결과', fs: 16, color: k === 4 ? PANEL : MUT });
    if (k === 4) { const route = [[40, 40], [NODE.embedding[0] - 150, NODE.embedding[1]]].concat(loop).concat([[480, 228]]);
      dot(route, seg(u, 0.2, 2.4), BAD, 8); tx(40, 30, '입력 텍스트', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.1) });
      tx(480, 400, '어떤 벡터 DB든 같은 네 조각', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) }); } }

  const quiz = [
    { q: 'text-embedding-3-small 벡터와 BGE 벡터를 코사인으로 바로 비교하면 안 되는 까닭은 무엇인가?',
      o: ['BGE 벡터는 음수를 담을 수 없어서', '모델마다 차원 수와 공간이 달라 숫자의 뜻이 맞지 않아서', '코사인은 같은 문장끼리만 잴 수 있어서'], a: 1,
      why: '같은 모델로 만든 벡터끼리만 비교가 성립한다. OpenAI는 1536차원, BGE는 768차원이라 길이부터 다르다.' },
    { q: 'distance.py의 a, b에서 IP가 1.286으로 1을 넘는 까닭은 무엇인가?',
      o: ['두 벡터의 길이가 1보다 커서 내적이 크게 나와서', 'L2 거리가 0.084로 작아서', '코사인을 잘못 계산해서'], a: 0,
      why: '|a|는 1.141, |b|는 1.130이다. 정규화하면 IP도 cosine과 같은 0.997이 된다.' },
    { q: 'HNSW가 100만 개 벡터에서 Flat보다 훨씬 빨리 찾는 방법은 무엇인가?',
      o: ['모든 벡터를 k-means로 1000개 그룹에 나눈 뒤 전부 훑는다', '벡터를 압축해 비교 횟수는 그대로 두고 계산만 줄인다', '듬성한 위층에서 크게 건너뛰고 아래층으로 내려오며 후보를 좁힌다'], a: 2,
      why: '위층에서 큰 걸음으로 다가간 뒤 아래층에서 좁힌다. 100만 개에서도 ~1ms 수준이라 Flat의 ~700ms와 차이가 크다.' },
    { q: 'Recall@10이 0.99라는 말은 무엇인가?',
      o: ['10번 검색하면 9.9번은 오류 없이 끝난다', '정답 top-10 중 평균 99%를 예측 결과에서 찾았다', '초당 0.99개의 쿼리를 처리한다'], a: 1,
      why: 'Recall@k는 Flat으로 구한 정답 top-k와 예측 top-k가 겹친 비율이다. QPS는 속도를 따로 잰다.' },
    { q: '네 개념이 한 번 도는 순서로 알맞은 것은 무엇인가?',
      o: ['임베딩, 거리 척도, 인덱스와 ANN 순으로 간다', '인덱스를 먼저 만들고 그다음에 임베딩한다', 'ANN으로 척도를 고른 뒤 임베딩 모델을 정한다'], a: 0,
      why: '입력이 벡터가 되어야 거리를 잴 수 있고, 인덱스와 ANN은 그 거리 계산을 빠르게 만든다.' },
  ];
  const summary = [
    '임베딩 모델이 문장을 1536개 같은 고정 길이 숫자 배열로 바꾼다. 같은 모델끼리만 비교된다.',
    '같은 두 벡터도 cosine 0.997, L2 0.084, IP 1.286처럼 척도마다 눈금이 다르다.',
    'Flat은 100만 개를 다 비교해 ~700ms, HNSW는 층 그래프를 내려가며 ~1ms에 찾는다.',
    'ANN은 Recall과 QPS를 맞바꾼다. efSearch나 nprobe를 올리면 정확해지고 느려진다.',
  ];
  const review = [
    { q: '문서는 BGE로 임베딩해 넣었는데 질문은 OpenAI 모델로 임베딩했더니 엉뚱한 결과가 나온다. 먼저 고칠 것은?',
      o: ['질문과 문서를 같은 임베딩 모델로 맞춘다', 'HNSW의 efSearch를 올린다', '거리 척도를 L2로 바꾼다'], a: 0,
      why: '모델이 다르면 차원과 공간이 달라 거리가 아무 뜻이 없다. 인덱스 설정을 바꿔도 해결되지 않는다.' },
    { q: 'HNSW 검색 Recall이 0.90이라 놓치는 문서가 많다. 속도를 조금 내줄 수 있다면 먼저 손볼 것은?',
      o: ['M을 줄여 그래프를 가볍게 만든다', 'efSearch를 올려 후보를 더 넓게 본다', 'Flat으로 바꾸고 데이터를 늘린다'], a: 1,
      why: 'efSearch를 올리면 탐색 후보가 늘어 Recall이 오르고 QPS가 내려간다. 정확도와 속도를 맞바꾸는 손잡이다.' },
    { q: '무작위 randn 벡터 10만 개로 HNSW를 재 보니 Recall이 0.49였다. 가장 알맞은 해석은?',
      o: ['HNSW 구현에 버그가 있다', '군집이 없는 무작위 고차원 데이터라 ANN이 가장 불리하다', 'Recall은 원래 0.5를 넘을 수 없다'], a: 1,
      why: '실제 임베딩은 뜻에 따라 몰려 있어 그래프 탐색이 잘 듣는다. 같은 설정에서 구조가 있는 데이터는 Recall이 거의 1이었다.' },
  ];

  R.page({ title: '벡터 DB 핵심 4개념', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
