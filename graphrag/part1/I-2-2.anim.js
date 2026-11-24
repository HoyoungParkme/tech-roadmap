/* I-2-2 GraphRAG 비용 vs 효과 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 구축 비용(80,000 / 120,000 호출, 1.6 / 12 시간, $30 / $5,400), 경로 폭증(5 ** depth × 25ms),
 * 1년 TCO($760 / $13,430, 17.7배)는 페이지 코드를 파이썬으로 다시 돌린 값이다. 유지보수 1건 비용(4분 · $0.04 …)은 페이지의 예시 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, pill, banner, grow, fly, dot, zone, cross, check, person, dbIcon, cells } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // ---------- 1. 1만 문서 인덱싱 비용 ----------
  const ROWS = [['LLM·임베딩 호출', 80000, 120000, (v) => fmt(v) + '회'], ['소요 시간', 1.6, 12, (v) => (v < 10 ? v.toFixed(1) : fmt(v)) + '시간'], ['비용', 30, 5400, (v) => '$' + fmt(v)]];
  function s1(t, c) { const { k, u } = c, x0 = 250, W = 560;
    // 입력 상수
    const n = k === 1 ? tween(0, 80000, u, 1.6) : 80000;
    if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1;
      card(110, 50, 170, 44, { rx: 8, text: 'NUM_DOCS 10,000', fs: 14.5, mono: true, s });
      tx(212, 56, '×', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(s) });
      card(310, 50, 170, 44, { rx: 8, text: 'CHUNKS_PER_DOC 8', fs: 14.5, mono: true, s: k === 1 ? pop(u, 0.5) : 1 });
      tx(412, 56, '=', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(s) });
      mono(430, 57, fmt(n) + ' 청크', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: k === 1 ? fade(u, 0.7) : 1 });
      card(800, 50, 250, 44, { rx: 8, text: '1,500 토큰/호출 · $30/1M', fs: 14, mono: true, stroke: GRID, s: k === 1 ? pop(u, 1.6) : 1 }); }
    else tx(480, 56, 'graph-build-cost.py 가 추정하는 세 가지', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) });
    tx(x0, 108, '■ RAG', { 'font-size': 14, 'font-weight': 700, fill: INFO }); tx(x0 + 80, 108, '■ GraphRAG', { 'font-size': 14, 'font-weight': 700, fill: ACC });
    ROWS.forEach(([name, rv, gv, f], i) => { const y = 150 + i * 92;
      tx(40, y + 18, name, { 'font-size': 17, 'font-weight': 800 });
      el('rect', { x: x0, y, width: W, height: 18, rx: 4, fill: SOFT }); el('rect', { x: x0, y: y + 26, width: W, height: 18, rx: 4, fill: SOFT });
      const rOn = k >= 2, gOn = (i === 0 && k >= 3) || (i === 1 && k >= 4) || (i === 2 && k >= 5);
      if (!rOn) { mono(x0 + W + 10, y + 14, '측정 전', { 'font-size': 13.5, fill: MUT }); }
      else { const g = k === 2 ? E(u, 0.3 + i * 0.3, 1.2 + i * 0.3) : 1; el('rect', { x: x0, y, width: Math.max(3, W * rv / gv * g), height: 18, rx: 4, fill: INFO });
        mono(x0 + Math.max(3, W * rv / gv) + 10, y + 14, f(rv), { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: k === 2 ? fade(u, 1.0 + i * 0.3) : 1 }); }
      if (!gOn) { if (k >= 2) mono(x0 + 10, y + 40, '측정 전', { 'font-size': 13.5, fill: MUT }); return; }
      const now = (i === 0 && k === 3) || (i === 1 && k === 4) || (i === 2 && k === 5), g = now ? E(u, 0.3, 1.5) : 1;
      if (i === 0) { const a = W * 80000 / 120000; el('rect', { x: x0, y: y + 26, width: a * clamp(g * 1.5), height: 18, rx: 4, fill: ACC });
        el('rect', { x: x0 + a, y: y + 26, width: (W - a) * clamp(g * 1.5 - 0.5), height: 18, rx: 4, fill: ACC, opacity: 0.45 });
        if (now) { mono(x0 + a / 2, y + 66, '엔티티 추출 80,000', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.2) });
          mono(x0 + a + (W - a) / 2, y + 66, '관계 추론 40,000', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.5) }); } }
      else el('rect', { x: x0, y: y + 26, width: W * g, height: 18, rx: 4, fill: ACC });
      mono(x0 + W + 10, y + 40, f(gv), { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: now ? fade(u, 1.4) : 1 }); });
    if (k === 4) mono(480, 408, '120,000 호출 × 1,500 토큰 = 1억 8천만 토큰  ·  ÷ 10,000 호출/시간 = 12시간', { 'font-size': 14, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 0.6) });
    if (k === 5) pill(480, 406, '$30 vs $5,400 · 180배', BAD, pop(u, 1.6), { fs: 15, fill: BADBG }); }

  // ---------- 2. 새 문서 1건 병합 ----------
  const num = (s) => { const m = String(s || '').match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; };
  function s2(t, c) { const { k, u } = c, b = c.beat.bars, p = c.prev && c.prev.bars;
    // 새 문서
    const docIn = k === 0 ? E(u, 0.2, 1.0) : 1;
    card(60, lerp(330, 210, docIn), 70, 90, { rx: 6, text: '새\n문서', fs: 15, stroke: INK, s: k === 0 ? pop(u, 0.1) : 1 });
    // RAG 줄
    zone(120, 34, 820, 96, 'RAG', { fill: SOFT });
    const rOn = k >= 1, rg = k === 1 ? E(u, 0.2, 1.6) : rOn ? 1 : 0;
    for (let i = 0; i < 8; i++) el('rect', { x: 210 + i * 30, y: 76, width: 24, height: 24, rx: 4, fill: rg > i / 8 ? INFO : PANEL, stroke: INFO, 'stroke-width': 1.5, opacity: rOn ? 1 : 0.35 });
    mono(330, 120, 'split → embed × 8', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: rOn ? 1 : 0.4 });
    grow(460, 88, 560, 88, rg, INFO); dbIcon(610, 88, null, { s: 0.5, stroke: INFO, op: rOn ? 1 : 0.4 });
    if (rOn) mono(700, 94, `${b.time.ragText} · ${b.cost.ragText.replace(' ', '')} · ${b.calls.ragText}`, { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k === 1 ? fade(u, 1.4) : 1 });
    // GraphRAG 줄
    zone(120, 146, 820, 260, 'GraphRAG', { fill: SOFT });
    const stage = [['① 추출', 'LLM 호출'], ['② 매칭', '기존 노드와 같은가'], ['③ 충돌 검사', '관계가 모순되나']];
    stage.forEach(([a, d], i) => { const on = k >= 2 + i, x = 250 + i * 230;
      card(x, 224, 190, 56, { rx: 10, text: a + '\n' + d, fs: 14.5, stroke: on ? ACC : GRID, color: on ? INK : MUT, fill: on ? ACCBG : PANEL, s: k === 2 + i ? pop(u, 0.2) : 1 });
      if (i < 2) grow(x + 97, 224, x + 133, 224, on ? 1 : 0, ACC); });
    if (k >= 1) { grow(98, 230, 152, 220, 1, MUT); grow(98, 180, 196, 96, 1, MUT); }
    // 누적 계기
    if (k >= 2) { const calls = tween(p && k > 2 ? num(p.calls.graphragText) : 0, num(b.calls.graphragText), u), min = tween(p && k > 2 ? num(p.time.graphragText) : 0, num(b.time.graphragText), u), usd = tween(p && k > 2 ? num(p.cost.graphragText) : 0, num(b.cost.graphragText), u);
      mono(930, 170, `누적 ${Math.round(calls)} LLM call · ${Math.round(min)}분 · $${usd.toFixed(2)}`, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
      mono(930, 192, '(문서 1건, 예시 값)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
    if (k === 2) { for (let i = 0; i < 8; i++) dot([[95, 210], [250, 224]], seg(u, 0.3 + i * 0.12, 0.9 + i * 0.12), ACC, 5);
      ['Apple', '애플', 'Tim Cook'].forEach((s, i) => pill(200 + i * 110, 296, s, INK, pop(u, 1.2 + i * 0.2), { fs: 14 }));
      tx(200, 340, 'entities · relations 를 뽑았다', { 'font-size': 14.5, fill: INK, opacity: fade(u, 1.8) }); }
    if (k === 3) { // 유사도 임계값
      const x0 = 330, w = 300, th = x0 + w * 0.85;
      pill(390, 284, '애플 (새 엔티티)', ACC, pop(u, 0.2), { fs: 14 }); pill(560, 284, 'Apple Inc. (기존)', INK, pop(u, 0.3), { fs: 14 });
      el('rect', { x: x0, y: 314, width: w, height: 14, rx: 4, fill: PANEL, stroke: GRID });
      el('rect', { x: x0, y: 314, width: w * 0.7 * E(u, 0.6, 1.4), height: 14, rx: 4, fill: WARN });
      el('line', { x1: th, y1: 306, x2: th, y2: 336, stroke: BAD, 'stroke-width': 2.5 }); mono(th, 352, 'threshold 0.85', { 'font-size': 13.5, 'text-anchor': 'middle', fill: BAD });
      tx(x0 - 10, 326, '유사도', { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
      tx(480, 392, '못 넘으면 같은 회사가 새 노드로 갈라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); }
    if (k === 4) { // 모순 관계 → 사람 검토
      pill(560, 292, 'CEO_OF ↔ 기존 관계와 모순', BAD, pop(u, 0.2), { fs: 14 });
      grow(690, 292, 780, 300, E(u, 0.6, 1.1), BAD); person(820, 300, 'review_queue', { s: pop(u, 1.1) });
      tx(560, 340, '자동 병합 대신 사람 손이 든다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); }
    if (k === 5) { // 3개월 뒤
      tx(160, 268, '3개월 뒤', { 'font-size': 17, 'font-weight': 800, fill: BAD });
      ['Apple Inc.', 'Apple', '애플'].forEach((s, i) => { card(260 + i * 120, 310, 106, 34, { rx: 17, text: s, fs: 14.5, fw: 700, stroke: BAD, fill: BADBG, s: pop(u, 0.2 + i * 0.25) }); });
      mono(380, 352, '같은 회사 3중 노드', { 'font-size': 14, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.0) });
      for (let i = 0; i < 40; i++) { const h = Math.sin((i + 1) * 91.7) * 43758.5; const fx = h - Math.floor(h), hy = Math.sin((i + 3) * 37.1) * 9137.3, fy = hy - Math.floor(hy);
        el('circle', { cx: 600 + fx * 160, cy: 258 + fy * 90, r: 3.5, fill: OFF, opacity: fade(u, 0.8 + (i % 10) * 0.08) }); }
      mono(680, 372, 'orphan 124개', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.4) });
      person(860, 300, null, { s: pop(u, 1.3) }); mono(860, 372, '모순 47건 대기', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 1.6) }); } }

  // ---------- 3. 깊이마다 경로 5배 ----------
  function s3(t, c) { const { k, u } = c, P = c.beat.paths || [], shown = P.length, cur = k <= 4 ? shown : 5;
    const X = (d) => 60 + d * 92, root = [60, 220];
    el('circle', { cx: root[0], cy: root[1], r: 9, fill: ACC });
    tx(60, 400, 'depth', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
    for (let d = 1; d <= cur; d++) { const n = Math.pow(5, d), now = d === shown && k <= 4, g = now ? E(u, 0.2, 1.4) : 1, col = d >= 4 ? BAD : d === 3 ? WARN : ACC, cut = k === 5 && d >= 4;
      mono(X(d), 400, String(d), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      if (d <= 3) { const H = d === 1 ? 260 : d === 2 ? 320 : 340, ys = (i) => root[1] - H / 2 + (H * (i + 0.5)) / n;
        for (let i = 0; i < n; i++) { if (i / n > g) break; const par = Math.floor(i / 5), pn = Math.pow(5, d - 1), pH = d === 1 ? 0 : d === 2 ? 260 : 320, py = d === 1 ? root[1] : root[1] - pH / 2 + (pH * (par + 0.5)) / pn;
          if (d <= 2 || i % 1 === 0) el('line', { x1: X(d - 1), y1: py, x2: X(d), y2: ys(i), stroke: col, 'stroke-width': d === 1 ? 2 : d === 2 ? 1 : 0.5, opacity: cut ? 0.2 : 0.6 });
          const beam = k === 5 && d === 3 && i % 16 === 0;
          el('circle', { cx: X(d), cy: ys(i), r: d === 1 ? 7 : d === 2 ? 3.5 : 1.6, fill: beam ? INK : col, opacity: k === 5 && d === 3 && !beam ? 0.3 : 1 }); } }
      else { const h = 340 * g; el('rect', { x: X(d) - 14, y: root[1] - h / 2, width: 28, height: h, rx: 4, fill: col, opacity: cut ? 0.15 : 0.35 + (d - 4) * 0.25 });
        mono(X(d), root[1] + 5, fmt(n), { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, transform: `rotate(-90 ${X(d)} ${root[1]})`, opacity: cut ? 0.3 : clamp(g * 2 - 1) }); } }
    // 오른쪽 표
    const tx0 = 560; [['depth', 14, 'middle'], ['paths', 120, 'end'], ['latency', 140, 'start'], ['flag', 356, 'middle']].forEach(([h, dx, an]) => mono(tx0 + dx, 46, h, { 'font-size': 14, fill: MUT, 'text-anchor': an }));
    el('line', { x1: tx0, y1: 56, x2: 940, y2: 56, stroke: GRID, 'stroke-width': 1.5 });
    P.forEach((r, i) => { const y = 86 + i * 56, lat = r.count * 25, flag = lat < 1000 ? 'OK' : lat < 5000 ? 'WARN' : 'CRIT', col = flag === 'OK' ? GOOD : flag === 'WARN' ? WARN : BAD;
      const now = i === shown - 1 && k <= 4, op = now ? fade(u, 0.6) : k === 5 && r.depth >= 4 ? 0.35 : 1;
      mono(tx0 + 14, y, String(r.depth), { 'font-size': 15, 'font-weight': 700, opacity: op });
      mono(tx0 + 120, y, fmt(r.count), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
      const lw = 100 * Math.log10(lat) / Math.log10(100000);
      el('rect', { x: tx0 + 140, y: y - 12, width: lw * (now ? E(u, 0.8, 1.6) : 1), height: 14, rx: 3, fill: col, opacity: op * 0.85 });
      mono(tx0 + 248, y, fmt(lat) + 'ms', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'start', fill: col, opacity: op });
      if (i === 0) mono(tx0 + 140, y + 22, '막대는 로그 눈금', { 'font-size': 13.5, fill: MUT, opacity: op });
      pill(tx0 + 356, y - 5, flag, col, now ? pop(u, 1.4) : 1, { fs: 13.5, mono: true, op }); });
    if (k === 1) tx(300, 50, '깊이가 1 늘면 경로는 5배', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
    if (k === 4) banner(300, 46, 'depth 5 = 78초', pop(u, 1.6));
    if (k === 5) { el('line', { x1: (X(3) + X(4)) / 2, y1: 40, x2: (X(3) + X(4)) / 2, y2: 380, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', opacity: fade(u, 0.2) });
      mono((X(3) + X(4)) / 2, 30, 'max_depth', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      card(750, 380, 380, 44, { rx: 10, stroke: GOOD, fill: GOODBG, sw: 2, s: pop(u, 0.9), text: 'depth 제한 · beam search(k=8) · 캐시', fs: 15, fw: 800 }); } }

  // ---------- 4. 1년 TCO ----------
  const TCO = { rag: [30, 365, 365], gr: [5400, 5475, 2555] }, PART = ['구축', '유지보수', '추론'], PCOL = [INFO, WARN, ACC];
  function s4(t, c) { const { k, u } = c, x0 = 140, W = 740, max = 13430, X = (v) => (W * v) / max;
    const asm = [['구축', '1회'], ['갱신', '매일 100문서'], ['질의', '매일 1,000회'], ['기간', '365일']];
    asm.forEach(([a, b], i) => { const s = k === 0 ? pop(u, 0.3 + i * 0.35) : 1;
      if (k === 0) card(150 + i * 220, 180, 190, 90, { rx: 12, text: a + '\n' + b, fs: 18, s, stroke: PCOL[Math.min(i, 2)] });
      else pill(150 + i * 220, 30, a + ' ' + b, INK, 1, { fs: 13.5 }); });
    if (k === 0) { tx(480, 300, '같은 분량을 1년 운영하면 얼마나 드나', { 'text-anchor': 'middle', 'font-size': 16, opacity: fade(u, 1.8) }); return; }
    PART.forEach((p, i) => { el('rect', { x: 600 + i * 110, y: 68, width: 14, height: 12, rx: 2, fill: PCOL[i] }); tx(620 + i * 110, 79, p, { 'font-size': 14, 'font-weight': 700, fill: PCOL[i] }); });
    const bars = [['RAG', TCO.rag, 140, 1], ['GraphRAG', TCO.gr, 230, 2]];
    bars.forEach(([name, parts, y, at]) => { if (k < at) return; tx(x0 - 14, y + 26, name, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end' });
      let acc = 0; parts.forEach((v, i) => { const g = k === at ? E(u, 0.3 + i * 0.5, 0.9 + i * 0.5) : 1, w = Math.max(2, X(v) * g);
        el('rect', { x: x0 + X(acc), y, width: w, height: 40, fill: PCOL[i], opacity: 0.85 });
        if (name === 'GraphRAG') mono(x0 + X(acc) + X(v) / 2, y + 26, '$' + fmt(v), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL, opacity: k === at ? fade(u, 0.8 + i * 0.5) : 1 });
        if (name === 'GraphRAG' && k >= 3) mono(x0 + X(acc) + X(v) / 2, y + 62, Math.round((v / max) * 1000) / 10 + '%', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: PCOL[i], opacity: k === 3 ? fade(u, 1.0 + i * 0.3) : 1 });
        acc += v; });
      const tot = parts.reduce((a, b) => a + b, 0);
      if (name === 'RAG') mono(x0 + X(tot) + 10, y + 26, '$30 + $365 + $365 = $760 / 년', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: k === at ? fade(u, 1.8) : 1 });
      else mono(x0 + X(tot), y - 10, '합계 $' + fmt(tot) + ' / 년', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', opacity: k === at ? fade(u, 1.8) : 1 }); });
    if (k === 3) banner(480, 350, '$13,430 ÷ $760 = 17.7배', pop(u, 0.3));
    if (k === 4) { tx(x0 - 14, 336, '축별 배수', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end' });
      [[0, 180], [1, 15], [2, 7]].forEach(([i, m], j) => { const y = 316 + j * 32, g = E(u, 0.3 + j * 0.3, 1.1 + j * 0.3);
        tx(x0 + 60, y + 14, PART[i], { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: PCOL[i] });
        el('rect', { x: x0 + 70, y, width: Math.max(3, 500 * (m / 180) * g), height: 18, rx: 4, fill: PCOL[i] });
        mono(x0 + 80 + 500 * (m / 180), y + 14, m + 'x', { 'font-size': 15, 'font-weight': 800, fill: PCOL[i], opacity: fade(u, 0.9 + j * 0.3) }); }); } }

  // ---------- 5. 관계가 답에 핵심인가? ----------
  function s5(t, c) { const { k, u } = c, d = c.beat.decision, [Y, N] = d.branches;
    const rs = k === 0 ? pop(u, 0.2) : 1;
    const g = R.G(480, 62, rs); el('path', { d: 'M0,-34 L150,0 L0,34 L-150,0 Z', fill: PANEL, stroke: INK, 'stroke-width': 2.5 }, g);
    tx(0, 6, d.question, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800 }, g);
    const br = k === 0 ? E(u, 0.8, 1.5) : 1;
    grow(380, 80, 250, 128, br, ACC); grow(580, 80, 710, 128, br, INFO);
    mono(300, 98, 'YES', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: br }); mono(660, 98, 'NO', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: br });
    [[Y, 240, ACC], [N, 720, INFO]].forEach(([b, x, col], j) => { const s = k === 0 ? pop(u, 1.4 + j * 0.3) : 1;
      card(x, 152, 220, 44, { rx: 22, text: b.verdict.replace(/^\S+\s/, ''), fs: 17, fw: 800, stroke: col, color: col, fill: j ? INFOBG : ACCBG, s });
      const has = !b.examples[0].startsWith('—'), at = j === 0 ? 1 : 2;
      if (has && k >= at) b.examples.forEach((e, i) => { const f = k === at ? fade(u, 0.3 + i * 0.35) : 1;
        card(x, 208 + i * 44, 440, 36, { rx: 8, stroke: GRID, fill: PANEL, op: f });
        tx(x, 213 + i * 44, e, { 'text-anchor': 'middle', 'font-size': 14, opacity: f }); });
      if (k === 0) sub(x, 216, '아래 신호로 채운다', fade(u, 1.8), { 'font-size': 14 });
      if (k >= 3) mono(x, 352, j === 0 ? '비용 10배 이상' : '비용 1/10 이하', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: k === 3 ? fade(u, 2.2) : 1 }); });
    if (k === 3) { const steps = ['RAG로 시작', '질문 로그 수집', '멀티홉 20% 넘나', 'PoC 100문항', '전환'];
      steps.forEach((s, i) => { const x = 110 + i * 185, p = pop(u, 0.2 + i * 0.3);
        card(x, 398, 160, 34, { rx: 17, text: s, fs: 14, fw: 700, stroke: i === 2 ? WARN : INK, fill: i === 2 ? WARNBG : PANEL, s: p });
        if (i) grow(x - 104, 398, x - 82, 398, E(u, 0.1 + i * 0.3, 0.3 + i * 0.3), MUT); }); }
    if (k === 4) banner(480, 398, '맞춤정장 vs 기성복 · 정확하지만 비싸다', pop(u, 0.3)); }

  const quiz = [
    { q: '1만 문서(8만 청크)를 인덱싱할 때 GraphRAG의 LLM 호출이 12만 회가 되는 까닭은 무엇인가?',
      o: ['청크마다 임베딩을 두 번 해서', '청크마다 엔티티 추출 1회에 절반 청크의 관계 추론이 더해져서', '문서마다 요약을 한 번 더 만들어서'], a: 1,
      why: '추출 80,000회에 관계 추론 40,000회가 더해진다. 1,500토큰씩 GPT-4 단가로 계산하면 $5,400, RAG는 $30이다.' },
    { q: '새 엔티티 "애플"과 기존 노드 "Apple Inc."의 유사도가 0.85를 넘지 못하면 어떻게 되는가?',
      o: ['새 노드가 따로 생겨 같은 회사가 갈라진다', '자동으로 기존 노드에 병합된다', '문서 추가가 거절된다'], a: 0,
      why: '임계값을 못 넘으면 add_node로 새 노드가 생긴다. 이런 일이 쌓여 3개월 뒤 같은 회사가 3중 노드가 된다.' },
    { q: '평균 분기 5, 경로당 25ms일 때 depth 4의 예상 지연은 얼마인가?',
      o: ['3,125ms', '78,125ms', '15,625ms'], a: 2,
      why: '경로 수는 5의 4제곱인 625개이고 625 × 25ms = 15,625ms다. 5초를 넘으니 CRIT이다.' },
    { q: '1년 TCO에서 GraphRAG가 RAG보다 비싼 배수는 얼마인가?',
      o: ['17.7배', '7배', '180배'], a: 0,
      why: '$13,430을 $760으로 나누면 17.7이다. 7배는 추론 축, 180배는 구축 축만 본 값이다.' },
    { q: 'RAG로 시작한 서비스를 GraphRAG로 옮길지 검토할 신호로 이 장이 든 것은 무엇인가?',
      o: ['월 인덱싱 비용이 $100을 넘을 때', '멀티홉 질문 비율이 20%를 넘을 때', '문서가 1만 건을 넘을 때'], a: 1,
      why: '질문 로그에서 멀티홉 비율이 20%를 넘으면 핵심 도메인 100문항으로 PoC를 하고, ROI를 확인한 뒤 전환한다.' },
  ];

  const summary = [
    '1만 문서 인덱싱에 RAG는 $30이면 되지만 GraphRAG는 LLM 호출 12만 회로 $5,400이 든다.',
    '새 문서마다 엔티티 매칭과 관계 충돌 검사가 붙어 중복 노드와 고아 노드가 쌓인다.',
    '탐색 깊이가 1 늘 때마다 경로가 5배라 depth 4부터 15초를 넘으니 깊이를 제한한다.',
    '1년 합계는 RAG의 17.7배라서 관계가 답의 핵심일 때만 GraphRAG를 고른다.',
  ];
  const review = [
    { q: 'GraphRAG를 도입했더니 응답이 수십 초씩 걸린다. 그래프 탐색 설정에서 먼저 볼 것은?',
      o: ['임베딩 모델의 차원 수', '탐색 깊이 제한과 가지치기 여부', '청크 크기'], a: 1,
      why: '분기 5에서 depth 5면 경로 3,125개에 78초다. max_depth를 2~3으로 묶고 beam search와 캐시를 쓴다.' },
    { q: '운영 3개월 뒤 "Apple Inc.", "Apple", "애플"이 서로 다른 노드로 쌓였다. 원인과 가장 가까운 것은?',
      o: ['문서를 병합할 때 엔티티 매칭이 임계값을 못 넘어 새 노드가 생겼다', 'LLM 호출 비용이 너무 비쌌다', '그래프 탐색 깊이가 너무 깊었다'], a: 0,
      why: '표기가 다르면 유사도가 0.85에 못 미쳐 add_node로 빠진다. 이것이 유지보수 비용의 실체다.' },
    { q: '사내 FAQ 봇이다. 질문은 "환불 정책 알려줘" 같은 것이 대부분이고 문서는 매주 바뀐다. 알맞은 판단은?',
      o: ['관계가 핵심이니 GraphRAG를 쓴다', '두 방식을 처음부터 모두 구축한다', '관계가 답의 핵심이 아니니 RAG로 충분하다'], a: 2,
      why: '단일 문서로 끝나는 질문이고 갱신이 잦다. 17.7배 비용을 쓸 이유가 없다.' },
  ];

  R.page({ title: '비용과 효과 저울질', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
